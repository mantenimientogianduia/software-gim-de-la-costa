# Gym Costa Pro

ERP web para operar un gimnasio: socios, accesos, clases, rutinas, finanzas, cuotas, vencimientos y comunidad.

## Stack

- Next.js 15 + React 19
- Firebase Auth + Cloud Firestore
- Tailwind CSS
- Vitest + Testing Library
- Firebase Emulator para reglas de Firestore

## Ejecutar Localmente

1. Instalar dependencias:

```bash
npm install
```

2. Copiar `.env.example` a `.env.local` y completar `NEXT_PUBLIC_FIREBASE_CONFIG`.

3. Levantar la app:

```bash
npm run dev
```

## Verificacion

```bash
npm run test
npm run lint
npm run build
```

Para verificar reglas de Firestore con emulador:

```bash
npm run test:rules
```

Este comando requiere Java instalado y disponible en `PATH`, porque Firebase Emulator lo usa para levantar Firestore local.

## Firebase y Vercel

En Vercel se debe configurar `NEXT_PUBLIC_FIREBASE_CONFIG` como JSON string con los datos del proyecto Firebase.

Tambien hay que autorizar el dominio productivo en Firebase Console:

1. Authentication
2. Settings
3. Authorized domains
4. Agregar el dominio de Vercel

## Notas De Seguridad

- Las reglas de Firestore deben probarse con `npm run test:rules` antes de desplegar cambios de permisos.
- Los datos sensibles de socios no deben exponerse a otros socios.
- Las herramientas de debug deben estar deshabilitadas en produccion.
- La app ya no crea administradores automaticamente por email. El primer admin debe crearse o promoverse de forma controlada en Firebase/Firestore y luego operar desde el panel.
- Para usar herramientas locales de debug, configurar `NEXT_PUBLIC_ENABLE_DEV_TOOLS=true` y `NEXT_PUBLIC_DEV_TOOLS_EMAIL` en `.env.local`; no activar esto en Vercel produccion.
