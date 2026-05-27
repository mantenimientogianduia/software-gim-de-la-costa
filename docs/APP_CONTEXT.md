# Gym Costa Pro - Contexto Del Producto

## Que Es

Gym Costa Pro es una aplicacion web para operar un gimnasio desde un unico sistema: socios, accesos, cuotas, pagos, vencimientos, clases, rutinas, asistencia y comunidad.

El objetivo no es tener una demo visual, sino una herramienta diaria para el dueno, recepcion, profesores y socios.

## Objetivos

- Darle al admin una vista clara de socios, morosos, vencimientos, pagos e ingresos.
- Registrar accesos por QR o DNI y alertar si un socio esta moroso.
- Permitir reservas y gestion de clases.
- Permitir creacion, asignacion y seguimiento de rutinas.
- Darle al socio una experiencia movil simple: QR, membresia, rutina, clases y comunidad.
- Mantener privacidad y seguridad sobre datos sensibles.

## Roles

- `admin`: opera el gimnasio, finanzas, socios, accesos, clases y rutinas.
- `profesor`: gestiona rutinas, clases y seguimiento de alumnos.
- `socio`: usa QR, ve membresia, reserva clases, entrena y configura su perfil social.

## Stack

- Next.js 15
- React 19
- Firebase Auth
- Cloud Firestore
- Tailwind CSS
- Vitest
- Firebase Emulator para reglas de Firestore

## Modulos Principales

- `app/`: rutas de Next.js, login y dashboard.
- `components/admin`: usuarios, finanzas y panel admin.
- `components/access`: QR, scanner y asistencia en vivo.
- `components/classes`: calendario, programacion y reservas.
- `components/routines`: editor y vista de rutinas.
- `components/training`: timer, countdown, intervalos y herramientas de entrenamiento.
- `components/social`: presencia social en el gimnasio.
- `services`: logica de negocio y acceso a Firestore.
- `firestore.rules`: permisos y validaciones de base de datos.

## Reglas De Negocio Clave

### Membresias

Un socio esta moroso si no tiene vencimiento, no tiene pagos confirmados o su vencimiento ya paso. Si paga antes de vencer, la renovacion se suma desde el vencimiento actual. Si no tiene vencimiento, se suma desde la fecha de pago.

### Accesos

El acceso debe registrar entrada o salida. Si el socio esta moroso, el sistema puede permitir el ingreso pero debe mostrar una alerta fuerte para recepcion.

### Pagos

Los pagos no deberian borrarse sin rastro. La correccion segura es anular el pago con motivo, fecha y usuario responsable, y luego cargar el pago correcto.

### Privacidad Social

Los socios arrancan ocultos. Solo pueden mostrarse publicamente nombre, Instagram, bio publica y racha si el socio lo habilita. No se debe exponer email, DNI, telefono, salud, pagos, vencimientos ni rutinas a otros socios.

## Estado Actual

La app compila y tiene tests utiles de servicios. Tambien existe una primera capa funcional para finanzas, acceso, rutinas, social y timers.

Riesgos actuales:

- Algunos controles de debug/seed deben quedar deshabilitados por defecto en produccion.
- Las reglas de Firestore necesitan ejecutarse con emulador en CI.
- El modelo usa email como identificador en varias colecciones; a futuro conviene normalizar a UID/docId.
- El QR actual se basa en DNI y deberia migrar a tokens rotativos.
- Finanzas necesita mas auditoria, caja, reportes y controles de anulacion.
- Varias pantallas admin siguen dependiendo de tablas pesadas en mobile.

## Prioridades

1. Saneamiento base: docs, env, debug tools, reglas testeables.
2. Seguridad: email verificado, reglas mas estrictas, datos sensibles separados.
3. Finanzas PRO: pagos auditables, morosos, caja, reportes, planes y metodos de pago.
4. Accesos: QR seguro, historial, politicas de morosidad y terminal estable.
5. Mobile operacional: admin, profesor y socio sin tablas incomodas ni navegacion oculta.
6. Clases y rutinas: cancelaciones, lista de inscriptos, waitlist, seguimiento y feedback.
