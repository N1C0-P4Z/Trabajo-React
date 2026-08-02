# Política de Privacidad — Sistema de Gestión de Clínica Odontológica

**Última actualización:** 2 de agosto de 2026
**Responsable del tratamiento:** Clínica Odontológica (en adelante, "la Clínica")
**Base legal:** Ley 25.326 de Protección de los Datos Personales (Argentina), Decreto Reglamentario 1558/2001, Resolución AAIP 47/2018

---

## 1. Datos que Recopilamos

Al utilizar nuestro sistema de gestión odontológica, recopilamos los siguientes datos personales:

### Datos de identificación
| Dato | Obligatorio | Finalidad |
|------|------------|-----------|
| Nombre y apellido | Sí | Identificación del paciente/profesional |
| DNI | Sí | Identificación única, historia clínica |
| Email | Sí | Comunicación, verificación de cuenta |
| Teléfono | Sí | Contacto para turnos y emergencias |
| Dirección | No | Contacto, facturación |
| Fecha de nacimiento | Sí | Historia clínica, identificación |
| Contraseña | Sí | Autenticación segura (almacenada con hash) |

### Datos sensibles de salud (solo pacientes)
| Dato | Obligatorio | Finalidad |
|------|------------|-----------|
| Alergias | No | Seguridad del tratamiento odontológico |
| Notas médicas | No | Registro clínico, continuidad del tratamiento |
| Obra social | No | Facturación, derivación |
| Número de afiliado | No | Gestión con obra social |
| Foto de perfil | No | Identificación visual (solo profesionales dentistas) |

### Datos de uso del sistema
| Dato | Finalidad |
|------|-----------|
| Historial de turnos | Gestión de citas, continuidad del tratamiento |
| Historial de pagos | Facturación, contabilidad |
| Dirección IP | Auditoría de acceso, seguridad |
| Registro de actividad | Trazabilidad de acceso a datos (Art. 9 Ley 25.326) |

---

## 2. Finalidad del Tratamiento

Los datos personales son tratados para las siguientes finalidades:

1. **Gestión odontológica**: Historia clínica, planificación de tratamientos, seguimiento de pacientes.
2. **Gestión de turnos**: Programación, recordatorios, reprogramación de citas.
3. **Facturación**: Emisión de comprobantes, gestión de cobros, relación con obras sociales.
4. **Cumplimiento legal**: Obligaciones fiscales, registros profesionales, auditoría de acceso a datos de salud.
5. **Seguridad del sistema**: Prevención de accesos no autorizados, registro de actividad, protección contra fraude.

Los datos **no serán utilizados** para finalidades distintas o incompatibles con las aquí detalladas, salvo consentimiento expreso adicional del titular (Art. 4, Ley 25.326).

---

## 3. Destinatarios de los Datos

Los datos personales son accesibles exclusivamente por:

| Destinatario | Acceso | Justificación |
|-------------|--------|---------------|
| Profesionales dentistas | Datos de salud completos | Relación profesional (Art. 8, Ley 25.326) |
| Personal administrativo (secretarias) | Datos de contacto y turnos | Gestión administrativa |
| El propio paciente | Solo sus propios datos | Derecho de acceso (Art. 14, Ley 25.326) |
| Sistema automatizado | Todos los datos | Almacenamiento y procesamiento |

**No compartimos datos con terceros**, salvo:
- Disposición legal obligatoria.
- Emergencia médica que requiera derivación (con disociación de datos cuando sea posible).
- Datos disociados para fines estadísticos o científicos (Art. 11, Ley 25.326).

---

## 4. Derechos ARCO (Acceso, Rectificación, Cancelación, Oposición)

Conforme a los Artículos 14, 15 y 16 de la Ley 25.326, los titulares de los datos tienen los siguientes derechos:

### 4.1 Derecho de Acceso
- **Qué**: Solicitar y obtener información sobre los datos personales almacenados.
- **Cómo**: Endpoint `GET /v1/users/me/data` — devuelve todos los datos del usuario en formato JSON.
- **Plazo**: Respuesta inmediata a través del sistema; respuesta formal en hasta 10 días corridos (Art. 14).
- **Costo**: Gratuito (Art. 19).

### 4.2 Derecho de Rectificación
- **Qué**: Solicitar la corrección de datos inexactos o incompletos.
- **Cómo**: El usuario puede editar sus datos desde el perfil del sistema, o solicitarlo al personal de la clínica.
- **Plazo**: 5 días hábiles desde recibido el reclamo (Art. 16).

### 4.3 Derecho de Cancelación (Supresión)
- **Qué**: Solicitar la eliminación de los datos personales.
- **Cómo**: Endpoint `DELETE /v1/users/me` — desactiva la cuenta y anonimiza los datos personales.
- **Limitaciones**: Los datos pueden conservarse cuando exista obligación legal de retención (Art. 16) o cuando la supresión pueda causar perjuicio a derechos de terceros.
- **Plazo**: 5 días hábiles desde recibido el reclamo (Art. 16).

### 4.4 Derecho de Oposición
- **Qué**: Oponerse al tratamiento de datos para finalidades específicas.
- **Cómo**: Solicitarlo al personal de la clínica o por correo electrónico.
- **Alcance**: No aplica al tratamiento necesario para la prestación del servicio odontológico (relación profesional, Art. 5 inc. d).

### Ejercicio de derechos
- **Por el sistema**: Endpoints `GET /v1/users/me/data` y `DELETE /v1/users/me` (acceso inmediato).
- **Por escrito**: Dirigirse a la clínica indicando nombre, DNI, y derecho a ejercer.
- **Plazo de respuesta**: 10 días corridos para acceso; 5 días hábiles para rectificación y cancelación.
- **Sin cargo**: El ejercicio de estos derechos es gratuito (Art. 19, Ley 25.326).

---

## 5. Medidas de Seguridad Implementadas

Conforme al Artículo 9 de la Ley 25.326 y la Resolución AAIP 47/2018, hemos implementado las siguientes medidas:

### Medidas técnicas
| Medida | Implementación |
|--------|---------------|
| Autenticación | JWT con contraseñas hasheadas (bcrypt) |
| Contraseñas robustas | Mínimo 8 caracteres, mayúscula, minúscula, dígito |
| Control de acceso por roles | SUPER_ADMIN, OWNER, DENTIST, SECRETARY, PATIENT |
| Limitación de intentos | Rate limiting en endpoints de autenticación |
| Protección contra bots | Google reCAPTCHA v2 en login y registro |
| Headers de seguridad | Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Referrer-Policy |
| Límite de cuerpo | 1MB máximo en peticiones JSON |
| Validación de imágenes | Magic bytes, tamaño máximo 2MB, formatos restringidos |
| Registro de auditoría | Log de todo acceso a datos de pacientes, turnos y pagos |
| Verificación de email | Token con expiración de 24h (auto-verificación en desarrollo) |

### Medidas organizativas
| Medida | Implementación |
|--------|---------------|
| Principio de menor privilegio | Cada rol accede solo a los datos necesarios |
| Registro de accesos | Tabla AuditLog con usuario, acción, recurso, IP, timestamp |
| Nota de confidencialidad | Banner recordatorio de secreto profesional para personal clínico |
| Eliminación de credenciales hardcodeadas | Todas las claves se cargan desde variables de entorno |

### Medidas futuras (diseño definido, pendiente de implementación)
| Medida | Diseño |
|--------|--------|
| Cifrado en reposo | AES-256-GCM para DNI, alergias, notas médicas (ver `docs/encryption-design.md`) |
| Rotación de claves | Estrategia de sobre con versionado de claves |

---

## 6. Retención de Datos

| Tipo de datos | Período de retención | Justificación |
|---------------|---------------------|---------------|
| Datos de pacientes activos | Mientras mantenga relación con la clínica | Prestación del servicio |
| Historia clínica | Mínimo 10 años desde última consulta | Obligación legal (Ley 17.132 — Registro Médico) |
| Datos de facturación | 10 años | Obligación fiscal (Ley 11.683) |
| Logs de auditoría | 5 años | Trazabilidad y cumplimiento |
| Cuentas desactivadas | Datos anonimizados inmediatamente; registros mínimos conservados por obligación legal | Balance entre derecho a la supresión y obligaciones de retención |

---

## 7. Datos de Menores de Edad

El sistema puede almacenar datos de menores de edad (pacientes pediátricos). En estos casos:
- El consentimiento es otorgado por el padre, madre o tutor legal.
- Los datos del menor reciben las mismas protecciones que los datos de adultos.
- El ejercicio de derechos ARCO corresponde al representante legal.

---

## 8. Transferencia Internacional de Datos

Actualmente, los datos se almacenan en servidores dentro de la República Argentina. Si en el futuro se utilizaran servicios de alojamiento fuera del país, se verificará que el país destino posea nivel adecuado de protección conforme al Art. 12 de la Ley 25.326, o se firmarán cláusulas contractuales tipo conforme a la Disposición AAIP 60/2016.

---

## 9. Contacto para Consultas de Privacidad

Para ejercer sus derechos ARCO, realizar consultas sobre el tratamiento de datos, o presentar reclamos:

- **Presencialmente**: En las instalaciones de la clínica, solicitando atención al personal administrativo.
- **Por escrito**: Dirigirse a la clínica con indicación de nombre, DNI, y descripción del derecho a ejercer.
- **Autoridad de control**: Agencia de Acceso a la Información Pública (AAIP), Dirección Nacional de Protección de Datos Personales.
  - Sitio: https://www.argentina.gob.ar/aaip/datospersonales
  - Email: datospersonales@aaip.gob.ar
  - Dirección: Av. Pte. Gral. Julio A. Roca 710, Piso 2, CABA

---

## 10. Actualizaciones de esta Política

Esta política puede actualizarse para reflejar cambios en las prácticas de tratamiento de datos, requisitos legales, o mejoras en las medidas de seguridad. Los cambios sustanciales serán comunicados a los usuarios a través del sistema.

---

## Referencias Normativas

| Norma | Relevancia |
|-------|-----------|
| Ley 25.326 | Ley de Protección de los Datos Personales (Habeas Data) |
| Decreto 1558/2001 | Reglamentación de la Ley 25.326 |
| Resolución AAIP 47/2018 | Medidas de seguridad para el tratamiento de datos personales |
| Art. 8, Ley 25.326 | Habilitación para tratamiento de datos de salud por profesionales |
| Art. 10, Ley 25.326 | Deber de secreto profesional |
| Arts. 14-16, Ley 25.326 | Derechos ARCO de los titulares |
| Ley 17.132 | Obligación de conservación de historia clínica |
| Ley 11.683 | Obligación de conservación de registros fiscales |

---

> **Nota:** Esta política de privacidad cumple con los requisitos de información al titular establecidos en el Art. 6 de la Ley 25.326 y la Resolución AAIP 14/2018. Para consultas legales vinculantes, se recomienda contactar a un abogado especializado en protección de datos personales.
