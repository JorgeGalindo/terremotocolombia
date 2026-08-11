# terremotocolombia

Microsite que **cuantifica la afectación del terremoto de Colombia** (10-ago-2026, 12:30 UTC, **Mw 7,4**, epicentro cerca de San José del Palmar, Chocó, ~110 km de profundidad) partiendo de datos de **Copernicus EMS Rapid Mapping — activación [EMSR916](https://mapping.emergency.copernicus.eu/activations/EMSR916/)**.

Estructura clonada de [`terremotovenezuela`](https://github.com/JorgeGalindo/terremotovenezuela), re-cableada a EMSR916 y **sin la capa de personas**: en Venezuela esa capa existía para contrastar la cifra oficial con registros ciudadanos, y aquí las cifras oficiales **no están en cuestión**. El contenido de la v1 se decide en [`01-entendimiento.md`](01-entendimiento.md).

## Las dos capas

**1 · Exposición (vertebra el sitio, disponible desde el día uno).** Cruza la
**sacudida modelada** del ShakeMap del USGS con la **vulnerabilidad previa de la vivienda**
(déficit habitacional del DANE, CNPV 2018) para los **650 municipios** que caen dentro de la
rejilla. Responde *dónde debería estar el daño* antes de que exista censo de daño — que es
justamente lo que aquí falta: las cifras oficiales colombianas no están en cuestión, pero el
consolidado de emergencias de la UNGRD se publica en ficheros anuales con 5,5–16 meses de
retraso (ver [`01-entendimiento.md`](01-entendimiento.md) §B.1).

Hallazgo: **21 de los 25** municipios que superan MMI VI y 60 % de déficit son del **Chocó**.

**2 · Edificios (daño observado).** Copernicus EMS EMSR916. Se llena cuando la activación
entregue productos.

## Estado

- [x] Scaffold estático clonado y re-cableado a EMSR916
- [x] Investigación verificada → [`01-entendimiento.md`](01-entendimiento.md)
- [x] Capa de exposición: [`scripts/fetch-exposicion.mjs`](scripts/fetch-exposicion.mjs) · `data/exposicion.json`
- [x] Cron diario en GitHub Actions, sin APIs de pago
- [ ] Imagen Open Graph (`npm run og`)

## Datos

```bash
npm run fetch:all          # las dos capas
npm run fetch:copernicus   # solo data/emsr916.json
npm run fetch:buildings    # solo daño edificio a edificio + geojson
npm run fetch:exposicion   # solo data/exposicion.json (USGS × DANE)
```

`data/dane-deficit-mpio.json` es **estático** (CNPV 2018, 1.122 municipios): se extrajo una
vez del [anexo XLSX del DANE](https://www.dane.gov.co/files/investigaciones/deficit-habitacional/deficit-hab-2020-anexo-nueva-metodologia.xlsx),
hoja *Total Municipios*. No hay dato municipal más reciente.

**Ojo con el estado de la activación.** EMSR916 se abrió el 10-ago-2026 a las 17:13 UTC con 3 AOIs (*Cali Center*, *Northen Cali*, *Pereira*) y **ningún producto entregado todavía** — la primera adquisición Pléiades estaba programada para el 11-ago a las 15:28. Los contadores estarán a cero hasta que Copernicus publique el primer *Grading*; el cron los irá rellenando. Es esperable que se añadan AOIs (el texto de activación cita también Quibdó y Manizales).

### Actualización automática
Un **cron diario en GitHub Actions** ([`.github/workflows/update-data.yml`](.github/workflows/update-data.yml), 06:00 UTC) regenera los datos y, si algo cambia, hace commit; la integración Git de Vercel **redesplega solo**. No depende de ninguna máquina local, no tiene dependencias npm y **no usa ninguna API de pago**.

## Stack
Sitio **estático** (HTML/CSS/JS vanilla + **MapLibre GL** vía CDN + **OpenFreeMap**, sin API key), desplegado en **Vercel**. Sin build step. Deploy: `vercel --prod`.

## Referencias
- Backend público de Copernicus: `GET https://rapidmapping.emergency.copernicus.eu/backend/dashboard-api/public-activations/?code=EMSR916`
- Esquema del backend: [`docs/cems_rapidmapping_openapi.yaml`](docs/cems_rapidmapping_openapi.yaml)
