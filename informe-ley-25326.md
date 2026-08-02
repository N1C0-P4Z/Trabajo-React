# Informe: Ley 25.326 de Protección de Datos Personales

## Aplicación al Sistema de Gestión de Clínica Odontológica

**Fecha:** 2 de agosto de 2026  
**Proyecto:** Trabajo-React — Feature "Security Shield"  
**Elaborado a partir de:** Ley 25.326 (texto original, 2000), Decreto Reglamentario 1558/2001, Resolución AAIP 47/2018, documentación oficial de la AAIP, Proyecto de Ley 2023  

---

## Índice

1. [Marco normativo](#1-marco-normativo)
2. [Definiciones clave](#2-definiciones-clave)
3. [Principios generales](#3-principios-generales)
4. [Datos sensibles y datos de salud](#4-datos-sensibles-y-datos-de-salud)
5. [Seguridad de los datos](#5-seguridad-de-los-datos)
6. [Deber de confidencialidad](#6-deber-de-confidencialidad)
7. [Derechos de los titulares](#7-derechos-de-los-titulares)
8. [Registro de bases de datos](#8-registro-de-bases-de-datos)
9. [Sanciones](#9-sanciones)
10. [Cesión y transferencia de datos](#10-cesión-y-transferencia-de-datos)
11. [Actualización en curso: Proyecto de Ley 2023](#11-actualización-en-curso-proyecto-de-ley-2023)
12. [Aplicación concreta a nuestro sistema](#12-aplicación-concreta-a-nuestro-sistema)
13. [Checklist de cumplimiento](#13-checklist-de-cumplimiento)

---

## 1. Marco normativo

| Norma | Descripción | Fecha |
|-------|-------------|-------|
| **Ley 25.326** | Ley de Protección de los Datos Personales (Habeas Data) | 4/10/2000 |
| **Decreto 1558/2001** | Reglamentación de la Ley 25.326 | 29/11/2001 |
| **Decreto 746/2017** | AAIP como Autoridad de Aplicación | 25/09/2017 |
| **Resolución AAIP 47/2018** | Medidas de seguridad recomendadas (deroga Disp. 11/2006 y 9/2008) | 23/07/2018 |
| **Resolución AAIP 14/2018** | Exhibición de información al titular | 2018 |
| **Proyecto de Ley 2023** | Actualización integral (enviado al Congreso, pendiente) | 2023 |

**Autoridad de aplicación:** Agencia de Acceso a la Información Pública (AAIP), Dirección Nacional de Protección de Datos Personales.  
**Sitio oficial:** https://www.argentina.gob.ar/aaip/datospersonales  
**Contacto:** datospersonales@aaip.gob.ar | Av. Pte. Gral. Julio A. Roca 710, Piso 2, CABA

Argentina es considerada por la Unión Europea como país con **nivel adecuado de protección** de datos personales (Decisión de la Comisión Europea 2003/490/CE), lo que permite la transferencia de datos desde la UE sin garantías adicionales.

---

## 2. Definiciones clave

### Dato personal (Art. 2)
> Información de cualquier tipo referida a personas físicas o de existencia ideal determinadas o determinables.

En nuestro sistema: nombre, DNI, email, teléfono, dirección, fecha de nacimiento, obra social, etc.

### Dato sensible (Art. 2)
> Datos personales que revelan origen racial y étnico, opiniones políticas, convicciones religiosas, filosóficas o morales, afiliación sindical e **información referente a la salud o a la vida sexual**.

En nuestro sistema: **alergias, notas médicas, obra social, tipo de sangre (si se registrara), historial de tratamientos, tipo de turno (especialidad odontológica)**. Todo dato que permita inferir una condición de salud es dato sensible.

### Archivo / registro / base / banco de datos (Art. 2)
> Conjunto organizado de datos personales que sean objeto de tratamiento o procesamiento, electrónico o no.

En nuestro sistema: la base de datos SQLite con tablas `User`, `Patient`, `Appointment`, `Payment`, etc.

### Tratamiento de datos (Art. 2)
> Operaciones y procedimientos sistemáticos que permitan la recolección, conservación, ordenación, almacenamiento, modificación, relacionamiento, evaluación, bloqueo, destrucción, y en general el procesamiento de datos personales, así como también su cesión a terceros.

En nuestro sistema: registrar un paciente, crear un turno, buscar pacientes por DNI, mostrar lista de pacientes, generar reportes de pagos, etc.

### Responsable (Art. 2)
> Persona física o jurídica pública o privada, que es titular de un archivo, registro, base o banco de datos.

En nuestro sistema: la clínica odontológica (persona jurídica o profesional titular).

### Titular de los datos (Art. 2)
> Toda persona cuyos datos sean objeto del tratamiento.

En nuestro sistema: pacientes, doctores, secretarias, administradores.

### Disociación de datos (Art. 2)
> Todo tratamiento de datos personales de manera que la información obtenida no pueda asociarse a persona determinada o determinable.

Ejemplo: estadísticas de turnos sin nombre, reportes de ingresos sin DNI del paciente.

---

## 3. Principios generales

### 3.1 Licitud (Art. 3)
- Los archivos de datos deben estar **debidamente inscriptos** en el Registro Nacional de Bases de Datos.
- No pueden tener finalidades contrarias a las leyes o a la moral pública.

### 3.2 Calidad de los datos (Art. 4)
1. Los datos deben ser **ciertos, adecuados, pertinentes y no excesivos** respecto a la finalidad.
2. La recolección no puede hacerse por medios **desleales o fraudulentos**.
3. Los datos **no pueden usarse para finalidades distintas o incompatibles** con las que motivaron su obtención.
4. Deben ser **exactos y actualizarse** cuando sea necesario.
5. Los datos **inexactos o incompletos deben ser suprimidos, sustituidos o completados**.
6. Deben almacenarse de modo que permitan el **ejercicio del derecho de acceso**.
7. Deben ser **destruidos cuando hayan dejado de ser necesarios**.

**⚠️ Impacto en nuestro sistema:**
- No podemos usar los datos de pacientes para marketing sin consentimiento explícito.
- Si un paciente deja de atenderse en la clínica, sus datos deben eventualmente destruirse.
- Los datos de contacto de emergencia deben ser pertinentes (no pedir más de lo necesario).

### 3.3 Consentimiento (Art. 5)
- El tratamiento de datos es ilícito **sin consentimiento libre, expreso e informado** del titular.
- Debe constar **por escrito** o medio equivalente.
- Cuando el consentimiento se presta junto con otras declaraciones, debe figurar en **forma expresa y destacada**.
- El titular debe ser informado previamente de: finalidad, destinatarios, existencia del archivo, responsable, carácter obligatorio/facultativo, consecuencias, y derechos ARCO (rectificación, supresión).

**Excepciones (no requieren consentimiento):**
- Datos de fuentes de acceso público irrestricto.
- Ejercicio de funciones del Estado u obligación legal.
- Listados limitados a nombre, DNI, identificación tributaria, ocupación, fecha de nacimiento y domicilio.
- Datos derivados de una **relación contractual, científica o profesional** del titular, necesarios para su desarrollo.
- Operaciones de entidades financieras (Ley 21.526).

**⚠️ Impacto en nuestro sistema:**
- La relación **paciente-clínica** entra en la excepción d) (relación profesional). Sin embargo:
  - El paciente debe ser **informado** de qué datos se guardan y para qué.
  - Si se quieren usar los datos para otra finalidad (newsletter, publicidad), se requiere **consentimiento específico adicional**.
- El **registro de pacientes** debe incluir un aviso explícito de tratamiento de datos (ver Sección 12).

### 3.4 Información al titular (Art. 6)
Cuando se recaben datos personales se debe informar en forma **expresa y clara**:
- **Finalidad** del tratamiento y quiénes pueden ser destinatarios.
- **Existencia del archivo**, identidad y domicilio del responsable.
- **Carácter obligatorio o facultativo** de las respuestas.
- **Consecuencias** de proporcionar o no los datos.
- **Derechos de acceso, rectificación y supresión**.

Esta información debe exhibirse en un **sitio visible** (Resolución AAIP 14/2018).

---

## 4. Datos sensibles y datos de salud

### Artículo 7 — Categorías de datos
1. **Ninguna persona puede ser obligada a proporcionar datos sensibles.**
2. Los datos sensibles solo pueden recolectarse cuando medien **razones de interés general autorizadas por ley**, o con **finalidades estadísticas o científicas** cuando los titulares no sean identificables.
3. **Prohibida la formación de archivos que almacenen datos sensibles** (con excepciones para iglesias, asociaciones religiosas, partidos políticos y sindicatos).
4. Datos de antecedentes penales: solo autoridades públicas competentes.

### Artículo 8 — Datos relativos a la salud (CRÍTICO para nosotros)
> Los **establecimientos sanitarios públicos o privados** y los **profesionales vinculados a las ciencias de la salud** pueden recolectar y tratar los datos personales relativos a la salud física o mental de los pacientes que acudan a los mismos o que estén o hubieren estado bajo tratamiento de aquéllos, **respetando los principios del secreto profesional**.

**⚠️ Esto es fundamental para nuestro sistema:**
- Como clínica odontológica, **estamos habilitados** a recolectar datos de salud de pacientes (alergias, tratamientos, notas médicas).
- Pero debemos **respetar el secreto profesional**: el odontólogo y todo el personal que accede a esos datos está obligado a no divulgarlos.
- Los datos de salud **no pueden compartirse sin consentimiento explícito**, salvo emergencias de salud pública o estudios epidemiológicos con disociación.
- **El personal administrativo (secretarias) que accede a datos médicos también está alcanzado por el deber de confidencialidad.**

---

## 5. Seguridad de los datos

### Artículo 9 — Medidas de seguridad (obligatorio)
1. El responsable debe adoptar las **medidas técnicas y organizativas necesarias** para garantizar la **seguridad y confidencialidad** de los datos personales, de modo de evitar:
   - Adulteración
   - Pérdida
   - Consulta o tratamiento no autorizado
   - Detectar desviaciones (intencionales o no)
2. **Prohibido registrar datos en archivos que no reúnan condiciones técnicas de integridad y seguridad.**

### Resolución AAIP 47/2018 — Medidas de seguridad recomendadas
La AAIP derogó las disposiciones anteriores (11/2006 y 9/2008) y aprobó nuevas medidas organizadas en dos grupos:

#### Anexo I — Tratamiento en medios informatizados
Medidas de seguridad técnicas para sistemas digitales:

1. **Control de acceso lógico**: autenticación de usuarios, contraseñas robustas, perfiles de acceso por rol.
2. **Control de acceso físico**: restricción a servidores y equipos que almacenan datos.
3. **Gestión de soportes**: etiquetado, inventario, destrucción segura de medios que contuvieron datos.
4. **Cifrado**: de datos sensibles en reposo y en tránsito.
5. **Copias de seguridad**: periódicas, cifradas, con procedimiento de restauración probado.
6. **Registro de accesos (logs)**: quién accedió, a qué, cuándo, desde dónde. Retención mínima de logs.
7. **Separación de entornos**: desarrollo, testing y producción no deben compartir datos reales.
8. **Actualización y parches**: mantener sistemas actualizados.
9. **Plan de contingencia**: procedimientos ante incidentes de seguridad.
10. **Documento de Seguridad**: documento formal que describa todas las medidas implementadas.

#### Anexo II — Tratamiento en medios no informatizados
Para historias clínicas en papel, fichas físicas, etc. (si aplicara)

---

## 6. Deber de confidencialidad

### Artículo 10 — Secreto profesional
1. **El responsable y TODAS las personas que intervengan en cualquier fase del tratamiento** están obligados al **secreto profesional** respecto de los datos personales.
2. Esta obligación **subsiste aún después de finalizada la relación** con el titular del archivo (es decir, un empleado que deja la clínica sigue obligado).
3. Solo puede relevarse por **resolución judicial** o por razones fundadas de seguridad pública, defensa nacional o salud pública.

**⚠️ Impacto directo:**
- Todo empleado de la clínica (dentistas, secretarias, administradores) debe estar notificado de su obligación de confidencialidad.
- El acceso a datos debe ser **need-to-know**: una secretaria no necesita ver alergias de un paciente si solo está cobrando un turno.
- Las contraseñas no deben compartirse entre empleados (cada uno debe tener credenciales propias).

---

## 7. Derechos de los titulares

### Derecho de información (Art. 13)
Toda persona puede solicitar a la AAIP información sobre la existencia de bases de datos, sus finalidades e identidad de los responsables. El registro es de consulta pública y gratuita.

### Derecho de acceso (Art. 14)
- El titular, previa acreditación de identidad, tiene derecho a solicitar y obtener **información de sus datos personales**.
- El responsable debe responder en un plazo máximo de **10 días corridos**.
- Puede ejercerse en forma gratuita a intervalos no menores a **6 meses**.

### Derecho de rectificación, actualización o supresión — Derechos ARCO (Art. 16)
- Toda persona tiene derecho a que sean **rectificados, actualizados, suprimidos** o sometidos a **confidencialidad** sus datos.
- Plazo máximo: **5 días hábiles** de recibido el reclamo.
- Si los datos fueron cedidos, el responsable debe notificar al cesionario dentro de 5 días hábiles.
- **La supresión no procede** cuando pueda causar perjuicios a derechos de terceros o exista obligación legal de conservar los datos.
- Durante la verificación, el dato debe **bloquearse** o consignarse que está en revisión.
- Los datos deben conservarse durante los plazos legales o contractuales.

### Garantía de gratuidad (Art. 19)
La rectificación, actualización o supresión de datos inexactos se efectuará **sin cargo** para el interesado.

### Acción de hábeas data (Arts. 33-43)
El titular puede iniciar acción judicial para tomar conocimiento de sus datos o exigir rectificación/supresión. Procedimiento sumarísimo. Competencia a elección del actor.

---

## 8. Registro de bases de datos

### Artículo 21 — Inscripción obligatoria
**Todo archivo, registro, base o banco de datos público y privado destinado a proporcionar informes debe inscribirse en el Registro Nacional de Bases de Datos.**

Datos a declarar:
- Nombre y domicilio del responsable
- Características y finalidad del archivo
- Naturaleza de los datos personales contenidos
- Forma de recolección y actualización
- Destino de los datos y personas/entidades a las que pueden transmitirse
- Modo de interrelacionar la información
- **Medios utilizados para garantizar la seguridad** (categoría de personas con acceso)
- Tiempo de conservación de los datos
- Procedimientos para que los titulares accedan, rectifiquen o actualicen sus datos

### Artículo 24 — Archivos privados
Los particulares que formen archivos que **no sean para un uso exclusivamente personal** deben registrarse.

**⚠️ ¿Aplica a nosotros?**
- Si la base de datos de la clínica es de uso interno exclusivo y no se cede a terceros, podría no estar obligada. Pero:
- Si se comparten datos con una obra social, laboratorio, o se emiten informes, **sí debe inscribirse**.
- **Recomendación:** inscribir la base de datos es una buena práctica. El trámite es gratuito y se hace ante la AAIP.
- La excepción de "uso exclusivamente personal" no aplica a una clínica (persona jurídica o profesional que trata datos de terceros).

---

## 9. Sanciones

### Artículo 31 — Sanciones administrativas
El organismo de control (AAIP) puede aplicar:
- Apercibimiento
- Suspensión
- **Multa de $1.000 a $100.000** (valores del año 2000 — actualmente actualizados)
- Clausura o cancelación del archivo, registro o banco de datos

La cuantía se gradúa según:
- Naturaleza de los derechos afectados
- Volumen de tratamientos efectuados
- Beneficios obtenidos
- Grado de intencionalidad
- Reincidencia (dentro de 3 años)
- Daños y perjuicios causados

### Artículo 32 — Sanciones penales (incorporadas al Código Penal)

**Artículo 117 bis — Inserción de datos falsos:**
- Insertar datos falsos en un archivo: **prisión de 1 mes a 2 años**.
- Proporcionar información falsa a un tercero: **prisión de 6 meses a 3 años**.
- Agravante: si deriva perjuicio, se aumenta en la mitad del mínimo y máximo.
- Si el autor es funcionario público: inhabilitación por el doble de la condena.

**Artículo 157 bis — Acceso ilegítimo y revelación de secreto:**
- Acceder ilegítimamente o violando sistemas de confidencialidad a un banco de datos: **prisión de 1 mes a 2 años**.
- Revelar información registrada cuyo secreto se estaba obligado a preservar: **prisión de 1 mes a 2 años**.
- Si el autor es funcionario público: inhabilitación especial de 1 a 4 años.

---

## 10. Cesión y transferencia de datos

### Cesión (Art. 11)
- Los datos solo pueden cederse para fines directamente relacionados con el interés legítimo del cedente y cesionario.
- Requiere **previo consentimiento del titular**, informándole la finalidad e identificando al cesionario.
- El consentimiento es **revocable**.
- **Excepciones:**
  - Dispuesto por ley
  - Datos disociados (inidentificables)
  - **Datos de salud: necesarios por razones de salud pública, emergencia o estudios epidemiológicos**, preservando identidad mediante disociación.
- El cesionario queda sujeto a las mismas obligaciones que el cedente. **Responsabilidad solidaria.**

### Transferencia internacional (Art. 12)
- **Prohibida** la transferencia a países sin nivel adecuado de protección.
- **Excepciones:** colaboración judicial internacional, intercambio de datos médicos para tratamiento del afectado, transacciones bancarias, tratados internacionales, cooperación contra crimen organizado.

**⚠️ Impacto en nuestro sistema:**
- Si usamos servicios cloud que almacenan datos en servidores fuera de Argentina (AWS, Google Cloud, Vercel), debemos verificar que el país de destino tenga nivel adecuado o firmar cláusulas contractuales tipo (Disposición 60/2016).
- Si el hosting está en Argentina, no hay problema.

---

## 11. Actualización en curso: Proyecto de Ley 2023

La Ley 25.326 tiene más de 20 años. La AAIP lideró un proceso de actualización alineado con el GDPR europeo.

### Estado actual
- **Junio 2023:** El Poder Ejecutivo envió el Proyecto de Ley al Congreso (Mensaje 87/2023).
- **Objetivo:** armonizar con estándares internacionales (GDPR, Convenio 108+, Estándares RIPD).
- **Estado parlamentario:** pendiente de tratamiento en la Cámara de Diputados.

### Cambios previstos relevantes
1. **Figura del Delegado de Protección de Datos (DPO):** obligatorio para ciertos responsables.
2. **Notificación de brechas de seguridad:** obligación de notificar a la AAIP y a los titulares en 72 horas.
3. **Evaluación de impacto de protección de datos (DPIA):** obligatoria para tratamientos de alto riesgo (datos de salud a gran escala).
4. **Portabilidad de datos:** derecho a recibir los datos en formato estructurado.
5. **Derecho al olvido reforzado.**
6. **Consentimiento para menores:** reglas específicas para datos de niños y adolescentes.
7. **Sanciones aumentadas:** multas de hasta el 4% de la facturación anual (estilo GDPR).
8. **Responsabilidad proactiva (accountability):** el responsable debe demostrar cumplimiento.

**Recomendación:** diseñar la feature de seguridad con miras al nuevo proyecto de ley. Implementar ahora lo que ya es obligatorio (Ley 25.326) y dejar preparada la arquitectura para los nuevos requisitos.

---

## 12. Aplicación concreta a nuestro sistema

### ¿Somos responsables de una base de datos?
**Sí.** La clínica odontológica mantiene una base de datos con información de pacientes, profesionales y personal administrativo. Esto nos convierte en **responsables** de un archivo de datos personales.

### ¿Qué datos sensibles manejamos?
| Campo | Clasificación | Justificación |
|-------|---------------|---------------|
| `alergias` | **Dato sensible** | Información de salud (Art. 2) |
| `notas` (médicas) | **Dato sensible** | Información de salud (Art. 2) |
| `obra_social` | **Dato sensible** | Infiere cobertura de salud (Art. 2) |
| `numero_afiliado` | Dato personal | Asociado a obra social |
| `tipo de turno` / `especialidad` | **Dato sensible** | Revela tratamiento odontológico (Art. 2) |
| `dni` | Dato personal | Identificación |
| `fecha_nacimiento` | Dato personal | — |
| `direccion`, `telefono` | Dato personal | — |
| `contacto_emergencia` | Dato personal | Datos de terceros |
| `historial de turnos` | **Dato sensible** | Revela frecuencia y tipo de tratamientos |

### ¿Estamos obligados a inscribirnos?
**Probablemente sí.** Aunque la base de datos sea de uso interno, al ser una persona jurídica/profesional que trata datos de terceros (pacientes), no califica como "uso exclusivamente personal" (Art. 24, Decreto 1558/2001 Art. 1).

La inscripción se realiza en: https://www.argentina.gob.ar/aaip/datospersonales/tramites

### Obligaciones concretas para el sistema

#### 1. Informar al titular al momento de registrar
Al registrar un paciente nuevo, debemos mostrar un aviso de privacidad que incluya:
- Responsable del tratamiento: nombre de la clínica/profesional, domicilio.
- Finalidad: gestión de turnos, historia clínica odontológica, facturación.
- Datos recabados: los campos del formulario.
- Quiénes acceden: odontólogos, secretarias administrativas (roles internos).
- Derechos ARCO: acceso, rectificación, actualización, supresión.
- Cómo ejercerlos: email o formulario de contacto.

#### 2. Implementar control de acceso por rol (ya hecho parcialmente)
- SUPER_ADMIN: acceso total (legítimo por administración del sistema).
- OWNER/DENTIST: acceso a datos de salud de sus pacientes (legítimo por relación profesional).
- SECRETARY: acceso a datos administrativos; **los datos de alergias/notas médicas deben ser opcionales** o requerir confirmación adicional.
- PATIENT: solo acceso a sus propios datos.

#### 3. Registro de accesos (logs de auditoría) — NUEVO
Mantener una tabla `AuditLog` con:
- Quién accedió (userId)
- Qué recurso consultó (patientId, appointmentId)
- Qué acción realizó (READ, CREATE, UPDATE, DELETE)
- Cuándo (timestamp)
- Desde qué IP

Esto permite:
- Detectar accesos no autorizados (Art. 9)
- Responder a solicitudes de hábeas data con trazabilidad
- Demostrar cumplimiento proactivo

#### 4. Cifrado de datos sensibles en reposo — NUEVO
- DNI, alergias, notas médicas: cifrar con AES-256-GCM.
- La clave de cifrado en variable de entorno o KMS (nunca en el código).
- Los datos se descifran solo cuando el usuario autorizado los consulta.

#### 5. Política de retención y destrucción
- ¿Cuánto tiempo conservamos los datos de un paciente que dejó de atenderse?
- Definir un plazo (ej: 5 años desde la última consulta, similar al plazo de prescripción de responsabilidad médica).
- Pasado ese plazo: destruir o anonimizar irreversiblemente.

#### 6. Documento de Seguridad
La Resolución 47/2018 recomienda que cada responsable mantenga un **Documento de Seguridad** que describa:
- Inventario de datos personales tratados.
- Medidas de seguridad implementadas.
- Procedimientos ante incidentes.
- Responsables de seguridad.

#### 7. Consentimiento para finalidades adicionales
Si se quisieran usar los datos para:
- Envío de recordatorios de turnos por WhatsApp (ya implementado)
- Newsletters o promociones
- Estadísticas públicas

...se requiere **consentimiento adicional, expreso e informado**, separado del consentimiento para el tratamiento clínico.

#### 8. Contraseñas y autenticación
La ley exige medidas de seguridad adecuadas. Implica:
- Contraseñas robustas (mínimo 8 caracteres, complejidad)
- Cambio periódico (recomendado)
- Bloqueo tras intentos fallidos (implícito en el deber de seguridad)
- Cada usuario debe tener credenciales propias (no compartir)

---

## 13. Checklist de cumplimiento

### 🔴 Crítico — implementar antes de producción

| # | Requisito | Ley | Estado actual | Acción |
|---|-----------|-----|---------------|--------|
| 1 | Informar al titular al recabar datos | Art. 6 | ❌ No implementado | Agregar aviso de privacidad en formularios de registro |
| 2 | Medidas de seguridad técnicas y organizativas | Art. 9 | ⚠️ Parcial | Ver checklist de medidas abajo |
| 3 | Deber de confidencialidad del personal | Art. 10 | ❌ No documentado | Cláusula en contratos, notificación a empleados |
| 4 | Derecho de acceso del titular | Art. 14 | ❌ No implementado | Endpoint o procedimiento para que el paciente solicite sus datos |
| 5 | Derecho de rectificación/supresión | Art. 16 | ❌ No implementado | Endpoint o procedimiento ARCO |
| 6 | Contraseñas seguras | Art. 9 | ⚠️ Solo 6 chars | Mínimo 8 chars + complejidad |
| 7 | Registro de accesos (logs) | Art. 9 / Res. 47/18 | ❌ No implementado | Tabla AuditLog |

### 🟡 Alta prioridad — implementar en el corto plazo

| # | Requisito | Ley | Estado actual | Acción |
|---|-----------|-----|---------------|--------|
| 8 | Inscripción en el Registro Nacional | Art. 21 | ❌ No inscripto | Trámite en AAIP |
| 9 | Cifrado de datos sensibles en reposo | Res. 47/18 | ❌ Texto plano | AES-256-GCM |
| 10 | Documento de Seguridad | Res. 47/18 | ❌ No existe | Redactar documento formal |
| 11 | Política de retención y destrucción | Art. 4.7 | ❌ No definida | Definir plazos |
| 12 | Separación de roles de acceso | Art. 9 | ⚠️ Parcial | Refinar RBAC existente |
| 13 | Rate limiting en login | Art. 9 (implícito) | ❌ No implementado | express-rate-limit |

### 🟢 Mediano plazo

| # | Requisito | Ley | Estado actual | Acción |
|---|-----------|-----|---------------|--------|
| 14 | Consentimiento separado para marketing | Art. 5 | ❌ No implementado | Checkbox separado |
| 15 | Copias de seguridad cifradas | Res. 47/18 | ❓ Desconocido | Verificar backup actual |
| 16 | Plan de contingencia | Res. 47/18 | ❌ No existe | Documentar procedimiento |
| 17 | Procedimiento de notificación de brechas | Proyecto 2023 | ❌ No implementado | Preparar para futura obligación |

### Medidas de seguridad técnicas mínimas (Res. AAIP 47/2018)

- [x] Autenticación de usuarios (JWT con bcrypt) — **implementado**
- [ ] Contraseñas robustas (min 8 chars, complejidad) — **a mejorar**
- [ ] Cifrado en tránsito (HTTPS) — **verificar en producción**
- [ ] Cifrado en reposo para datos sensibles — **no implementado**
- [ ] Registro de accesos (logs de auditoría) — **no implementado**
- [ ] Control de acceso basado en roles — **parcial**
- [ ] Separación de entornos (dev/staging/prod) — **verificar**
- [ ] Copias de seguridad periódicas — **verificar**
- [ ] Firewall / protección de red — **depende del hosting**
- [ ] Actualización de dependencias — **mantener**

---

## Fuentes consultadas

1. **Ley 25.326** — Texto original. https://www.argentina.gob.ar/normativa/nacional/ley-25326-64790/texto
2. **Decreto Reglamentario 1558/2001**. https://www.argentina.gob.ar/normativa/nacional/decreto-1558-2001-70368/texto
3. **Resolución AAIP 47/2018** — Medidas de seguridad recomendadas. Boletín Oficial 25/07/2018
4. **AAIP — Obligaciones de responsables**. https://www.argentina.gob.ar/aaip/datospersonales/responsables/obligaciones
5. **AAIP — Proyecto de Ley 2023**. https://www.argentina.gob.ar/aaip/datospersonales/proyecto-ley-datos-personales
6. **AAIP — Responsables de bases de datos**. https://www.argentina.gob.ar/aaip/datospersonales/responsables

---

> **Nota:** Este informe es una síntesis con fines de implementación técnica y no constituye asesoramiento legal. Para una consulta legal vinculante sobre la aplicación de la Ley 25.326 a un caso concreto, se recomienda contactar a un abogado especializado en protección de datos personales.
