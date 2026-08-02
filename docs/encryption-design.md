# Encryption Design — AES-256-GCM for Sensitive Health Data

## Objective

Define the architectural design for encrypting sensitive personal health data at rest in the Trabajo-React dental clinic system. This document covers algorithm selection, field-level encryption targets, key management, and the encrypt/decrypt workflow. **No implementation code is included** — this is a design reference for future implementation.

---

## 1. Algorithm Selection

| Property | Value |
|----------|-------|
| Algorithm | AES-256-GCM (Galois/Counter Mode) |
| Key size | 256 bits (32 bytes) |
| IV/Nonce size | 96 bits (12 bytes) — randomly generated per encryption |
| Auth tag size | 128 bits (16 bytes) |
| Mode type | Authenticated Encryption with Associated Data (AEAD) |

### Why AES-256-GCM

- **Authenticated encryption**: GCM provides both confidentiality and integrity. Any tampering with ciphertext is detected during decryption.
- **NIST approved**: Listed in NIST SP 800-38D for government and healthcare use.
- **Performance**: Hardware-accelerated on modern x86 (AES-NI) and ARM processors.
- **No padding oracle**: Unlike CBC mode, GCM does not require padding, eliminating padding oracle attacks.
- **Single pass**: Encryption and authentication happen in one operation.

---

## 2. Fields to Encrypt

The following fields contain sensitive personal health data as classified under Art. 2 of Ley 25.326 (datos sensibles / datos referidos a la salud):

| Field | Table | Classification | Reason |
|-------|-------|----------------|--------|
| `dni` | `Patient` | Dato personal | National identity number — unique identifier enabling cross-reference |
| `alergias` | `Patient` | Dato sensible (salud) | Medical allergy information |
| `notas_medicas` | `Patient` | Dato sensible (salud) | Clinical notes, treatment observations |

### Fields NOT encrypted (and why)

| Field | Reason for exclusion |
|-------|---------------------|
| `nombre`, `apellido` | Displayed in lists/reports; low sensitivity alone |
| `email`, `telefono` | Contact data; encrypted search would degrade UX |
| `obra_social` | Needed for filtered queries; can be encrypted in a future phase |
| `fecha_nacimiento` | Date type; low standalone risk |

---

## 3. Key Management

### 3.1 Key Storage

| Environment | Key location |
|-------------|-------------|
| Development | `ENCRYPTION_KEY` in `.env` file (never committed) |
| Production | Environment variable injected by deployment platform, or Hardware Security Module (HSM) / Key Management Service (KMS) |

### 3.2 Key Format

- 256-bit key encoded as 64-character hexadecimal string in env var.
- Parsed to 32-byte `Buffer` at application startup.
- Application crashes on startup if `ENCRYPTION_KEY` is missing or not 64 hex characters.

### 3.3 Key Rotation Strategy

| Aspect | Design |
|--------|--------|
| Rotation trigger | Manual (admin action) or scheduled (e.g., annual) |
| Approach | Envelope encryption — each record stores a `key_version` alongside the ciphertext |
| Migration | Re-encrypt all records with new key version in a background job; old key retained until migration completes |
| Rollback | Old key versions remain available for decryption during migration window |

### 3.4 Key Hierarchy (Future)

For production scale, consider a two-tier hierarchy:

```
Master Key (KMS/HSM)
  └── Data Encryption Key (DEK) per key_version
        └── Encrypts individual field values
```

The master key never leaves the KMS. DEKs are encrypted by the master key and stored alongside the data. This limits blast radius if a DEK is compromised.

---

## 4. Encrypt/Decrypt Workflow

### 4.1 Encryption (at write)

```
1. Generate random 12-byte IV (nonce)
2. Create AES-256-GCM cipher with key + IV
3. Encrypt plaintext field value → ciphertext
4. Get authentication tag (16 bytes)
5. Store: IV || auth_tag || ciphertext (concatenated as single blob)
6. Store key_version alongside the blob
```

**Storage format per field:**

```
[key_version:1byte][IV:12bytes][auth_tag:16bytes][ciphertext:variable]
```

The `key_version` byte identifies which key was used, enabling rotation.

### 4.2 Decryption (at read)

```
1. Parse key_version from stored blob
2. Retrieve key for that version
3. Extract IV, auth_tag, and ciphertext from blob
4. Create AES-256-GCM decipher with key + IV
5. Set auth_tag for integrity verification
6. Decrypt ciphertext → plaintext
7. If auth_tag verification fails → throw error (data tampered)
```

### 4.3 When Encryption/Decryption Happens

| Operation | Encryption | Decryption |
|-----------|-----------|------------|
| Create patient | Encrypt `dni`, `alergias`, `notas_medicas` before Prisma write | — |
| Read patient (single) | — | Decrypt fields after Prisma read |
| Patient list | — | Decrypt fields after Prisma read (or display masked) |
| Update patient | Re-encrypt changed fields | Decrypt unchanged fields for display |
| Search by DNI | Encrypt search term, compare ciphertexts | — (or use blinded index) |
| Export (ARCO) | — | Decrypt all fields for JSON export |

### 4.4 Search Consideration

Encrypted fields cannot be searched with SQL `LIKE` or `WHERE`. Two approaches:

1. **Blinded index (recommended for DNI)**: Store `SHA-256(dni.toLowerCase())` in a separate `dni_hash` column. Search by hashing the query and matching the hash. Deterministic — same input always produces same hash.
2. **Full scan + decrypt**: Decrypt all rows and filter in application code. Only viable for small datasets.

For `alergias` and `notas_medicas`, full-text search is not expected — these are displayed, not queried.

---

## 5. Threat Model

### What This Protects Against

| Threat | Protection |
|--------|-----------|
| **Database file theft** (`dev.db` copied) | Attacker sees ciphertext, not plaintext. Without the key, data is useless. |
| **Backup exposure** | Backup contains encrypted blobs. Key is not stored with backups. |
| **SQL injection reading raw data** | Even if attacker reads DB rows, sensitive fields are encrypted. |
| **Insider with DB access but no key** | DBA or developer with DB access cannot read health data. |
| **Disk-level access** | Server compromise exposing filesystem does not expose plaintext. |

### What This Does NOT Protect Against

| Limitation | Mitigation |
|-----------|-----------|
| Application-level access (authorized users) | RBAC + audit logging (already implemented) |
| Key compromise | Key rotation + envelope encryption limit exposure window |
| Memory dumps while app is running | Plaintext exists in memory during decrypt — accepted risk |
| Metadata (who, when, how often) | Audit logging covers this separately |

---

## 6. Database Schema Changes

The following columns would be added or modified in the `Patient` table:

| Column | Type | Description |
|--------|------|-------------|
| `dni_encrypted` | `TEXT` | AES-256-GCM blob (IV + tag + ciphertext) |
| `dni_hash` | `TEXT` | SHA-256 hash for blinded search |
| `alergias_encrypted` | `TEXT` | AES-256-GCM blob |
| `notas_medicas_encrypted` | `TEXT` | AES-256-GCM blob |
| `encryption_key_version` | `INTEGER` | Key version used for this record |

The original `dni`, `alergias`, `notas_medicas` columns would be dropped after migration.

---

## 7. Migration Plan

1. Add new encrypted columns to schema.
2. Run migration to add columns (nullable initially).
3. Background job: read each patient, encrypt fields, write to new columns.
4. Verify all records migrated (count check).
5. Application code switches to reading from encrypted columns.
6. Drop original plaintext columns in a subsequent migration.
7. Remove old key version after confirming no references.

---

## 8. Regulatory Alignment

| Requirement | Source | How this design addresses it |
|-------------|--------|------------------------------|
| Cifrado de datos sensibles en reposo | Resolución AAIP 47/2018, Anexo I.4 | AES-256-GCM on all health data fields |
| Medidas de seguridad técnicas | Ley 25.326, Art. 9 | Authenticated encryption with key rotation |
| Integridad de datos | Ley 25.326, Art. 9 | GCM auth tag detects tampering |
| Secreto profesional | Ley 25.326, Art. 10 | Even DB-level access does not expose health data without key |

---

## References

- NIST SP 800-38D: Recommendation for Block Cipher Modes of Operation — Galois/Counter Mode (GCM)
- Resolución AAIP 47/2018: Medidas de seguridad para el tratamiento de datos personales
- Ley 25.326 de Protección de los Datos Personales (Argentina)
- OWASP: Cryptographic Storage Cheat Sheet
