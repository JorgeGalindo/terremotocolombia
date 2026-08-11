# terremotocolombia

Microsite que **cuantifica la afectación del terremoto de Colombia** (10-ago-2026, 12:30 UTC, **Mw 7,4**, epicentro cerca de San José del Palmar, Chocó, ~110 km de profundidad) partiendo de datos de **Copernicus EMS Rapid Mapping — activación [EMSR916](https://mapping.emergency.copernicus.eu/activations/EMSR916/)**.

Estructura clonada de [`terremotovenezuela`](https://github.com/JorgeGalindo/terremotovenezuela), re-cableada a EMSR916 y **sin la capa de personas**: en Venezuela esa capa existía para contrastar la cifra oficial con registros ciudadanos, y aquí las cifras oficiales **no están en cuestión**. El contenido de la v1 se decide en [`01-entendimiento.md`](01-entendimiento.md).

## Estado

- [x] Scaffold estático clonado y re-cableado a EMSR916
- [x] Extractor + datos normalizados → [`scripts/fetch-emsr916.mjs`](scripts/fetch-emsr916.mjs) · `data/emsr916.json`
- [x] Cron diario en GitHub Actions, sin APIs de pago
- [ ] Contenido de la v1 (pendiente de investigación → `01-entendimiento.md`)
- [ ] Imagen Open Graph (`npm run og`)

## Datos

```bash
npm run fetch:all          # activación + daño edificio a edificio
npm run fetch:copernicus   # solo data/emsr916.json
npm run fetch:buildings    # solo daño edificio a edificio + geojson
```

**Ojo con el estado de la activación.** EMSR916 se abrió el 10-ago-2026 a las 17:13 UTC con 3 AOIs (*Cali Center*, *Northen Cali*, *Pereira*) y **ningún producto entregado todavía** — la primera adquisición Pléiades estaba programada para el 11-ago a las 15:28. Los contadores estarán a cero hasta que Copernicus publique el primer *Grading*; el cron los irá rellenando. Es esperable que se añadan AOIs (el texto de activación cita también Quibdó y Manizales).

### Actualización automática
Un **cron diario en GitHub Actions** ([`.github/workflows/update-data.yml`](.github/workflows/update-data.yml), 06:00 UTC) regenera los datos y, si algo cambia, hace commit; la integración Git de Vercel **redesplega solo**. No depende de ninguna máquina local, no tiene dependencias npm y **no usa ninguna API de pago**.

## Stack
Sitio **estático** (HTML/CSS/JS vanilla + **MapLibre GL** vía CDN + **OpenFreeMap**, sin API key), desplegado en **Vercel**. Sin build step. Deploy: `vercel --prod`.

## Referencias
- Backend público de Copernicus: `GET https://rapidmapping.emergency.copernicus.eu/backend/dashboard-api/public-activations/?code=EMSR916`
- Esquema del backend: [`docs/cems_rapidmapping_openapi.yaml`](docs/cems_rapidmapping_openapi.yaml)
