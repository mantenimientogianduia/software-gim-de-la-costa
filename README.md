# Gym de la Costa ERP

ERP web para gimnasio construido con Next.js, React y Firebase. Incluye paneles para administracion, profesores y socios, con gestion de usuarios, pagos, rutinas, clases y control de acceso por QR.

## Requisitos

- Node.js
- Un proyecto Firebase con Authentication y Firestore habilitados

## Configuracion

La app lee la configuracion Firebase desde `NEXT_PUBLIC_FIREBASE_CONFIG` si existe. Si no, usa `firebase-applet-config.json`.

Ejemplo de `.env.local`:

```bash
NEXT_PUBLIC_FIREBASE_CONFIG='{"projectId":"...","appId":"...","apiKey":"...","authDomain":"...","storageBucket":"...","messagingSenderId":"..."}'
```

## Comandos

```bash
npm ci
npm run dev
npm test
npm run lint
npm run build
```

## Firestore

Las reglas principales estan en `firestore.rules`. Antes de publicar cambios, correr:

```bash
npm test
npm run lint
npm run build
```
