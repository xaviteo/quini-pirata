# quini.pirata.app

Mesa privada del Quini 6. Este directorio arranca por el histórico y la boleta de la casa. Las cuentas, el aviso y el deploy vienen después.

## Local

```bash
npm install
npm test
npm run dev
```

El sitio lee `quini6_historico.csv` desde la raíz. La portada, el resultado, el histórico y el laboratorio no necesitan base. Las jugadas se guardan en `data/quini.db` (no se commitea). El primer admin sale de `ADMIN_EMAIL` y `ADMIN_PASSWORD` en `.env.local`.

Día y noche son las dos paletas: cúrcuma `#FFBE0B` sobre malta `#2A2312`, y vulcánico `#FF4103` sobre noturno `#001621`. El modo sigue la hora del navegador y se puede fijar.

## Qué hay hoy

- Parser del CSV, huecos incluidos (2570–2755 sigue pendiente de completar).
- Reglas de premio de las cinco vías.
- Boleta de la casa reproducible, con semilla igual al número de sorteo.
- Laboratorio: azar, franja, atrasos y casa, medidos contra Tradicional.

## Qué no hay que tocar en el servidor

El deploy va a un proyecto nuevo de Coolify, `quini-pirata`, en la VPS `179.198.122.189`. No se modifica ningún proyecto que ya esté corriendo. El panel de esa VPS es `http://179.198.122.189:8000/`. El conector actual apunta a otro host (`coolify.indiopirata.com`) y no sirve para este deploy.
