# Terremoto de Colombia (10-ago-2026) — entendimiento del evento

> Documento vivo. La **parte A** son hechos leídos directamente de las APIs primarias
> (USGS FDSN/ComCat y backend público de Copernicus EMS) el 11-ago-2026; cada cifra es
> reproducible con los comandos que se citan. La **parte B** (contexto colombiano,
> fuentes oficiales, exposición, precedentes) queda pendiente del informe de
> investigación y se añadirá cuando esté cerrado.

---

## A. Hechos verificados desde fuente primaria

### A.1 El sismo

`GET https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&eventid=us6000tjl2`

| Campo | Valor |
|---|---|
| ID USGS | **us6000tjl2** |
| Magnitud | **Mw 7,4** |
| Origen | 2026-08-10 **12:34:28 UTC** (07:34 hora local, UTC−5) |
| Epicentro | 4,8436 N, −76,2422 O — **5 km al sur de San José del Palmar** (Chocó) |
| Profundidad | **110,3 km** |
| MMI máx. modelada | 6,89 |
| MMI máx. reportada (DYFI) | 7,9 · **1.029** respuestas ciudadanas |
| Alerta PAGER | **naranja** |
| Tsunami | no |

**La profundidad es el hecho estructurante.** A 110 km no es un sismo cortical de falla
superficial sino un evento **intraplaca dentro de la losa de Nazca** en subducción. Eso
explica la firma del daño: sin ruptura superficial ni epicentro devastado, pero con un
área sentida enorme y daño concentrado a cientos de kilómetros, allí donde el suelo
amplifica. Es la misma geometría del caso venezolano (daño lejos del epicentro), pero
por una causa distinta: allí fue efecto de sitio sobre un sismo somero; aquí el sismo
nace ya profundo.

### A.2 Exposición de población por sacudida (PAGER)

`.../losspager/us6000tjl2/contents/json/exposures.json`

| MMI | Población expuesta | Percepción / daño típico |
|---:|---:|---|
| III | 4.752 | débil |
| IV | 6.465.203 | ligera |
| V | 17.075.611 | moderada |
| VI | 8.888.484 | fuerte — daño ligero |
| VII | **1.563.783** | muy fuerte — **daño moderado** |

**≈34 millones de personas** sintieron el terremoto con MMI ≥ IV. Es la cifra que da la
escala real del evento y ninguna fuente periodística la está dando.

### A.3 Pérdidas estimadas (PAGER, automático, sin revisar)

Distribución de probabilidad — **no** una cifra puntual:

| Muertes | Prob. | | Pérdidas (USD) | Prob. |
|---|---:|---|---|---:|
| 0–1 | 2 % | | < 1 M | 0 % |
| 1–10 | 10 % | | 1–10 M | 4 % |
| 10–100 | 27 % | | 10–100 M | 18 % |
| **100–1.000** | **35 %** | | **100–1.000 M** | **34 %** |
| 1.000–10.000 | 20 % | | 1.000–10.000 M | 29 % |
| 10.000–100.000 | 5 % | | 10.000–100.000 M | 12 % |
| > 100.000 | 1 % | | > 100.000 M | 2 % |

### A.4 Fallo del terreno (ground failure)

| Peligro | Alerta | Valor agregado | Población expuesta |
|---|---|---:|---:|
| Deslizamientos | naranja | 25,0 | ~1.200 |
| **Licuefacción** | **roja** | ~2.960 | (pendiente) |

La alerta **roja de licuefacción** es el dato más infrautilizado del expediente: apunta a
los suelos aluviales del valle del Cauca, es decir, justo a las ciudades donde se
concentra el daño.

### A.5 Sacudida por ciudad (PAGER `cities.json`, 624 municipios)

Municipios de más de 100.000 habitantes, ordenados por MMI modelada:

| Ciudad | MMI | Población |
|---|---:|---:|
| Zarzal | 6,8 | 312.599 |
| Cartago | 6,8 | 134.972 |
| Dosquebradas | 6,7 | 179.301 |
| Tuluá | 6,6 | 219.138 |
| **Pereira** | 6,6 | 590.554 |
| Armenia | 6,5 | 301.226 |
| **Quibdó** | 6,5 | 130.825 |
| Guadalajara de Buga | 6,4 | 116.893 |
| Buenaventura | 6,2 | 423.927 |
| **Cali** | 6,2 | 2.471.474 |
| Palmira | 6,1 | 349.294 |
| Girardot | 6,0 | 129.834 |
| Ibagué | 5,8 | 541.101 |
| **Manizales** | 5,8 | 434.403 |
| Medellín | 5,3 | 2.529.403 |
| Soacha | 5,2 | 522.442 |

> **Tensión a explotar.** La prensa señala **Manizales** como el municipio más afectado,
> pero PAGER solo le modela **MMI 5,8** — por debajo de Zarzal, Cartago, Pereira o Cali.
> La brecha entre *sacudida modelada* y *daño observado* no es un error a corregir: es la
> medida de lo que aporta la vulnerabilidad local (suelo, tipología constructiva, edad
> del parque). Cuantificar esa brecha municipio a municipio es el ángulo con más
> recorrido para el sitio.

### A.6 Copernicus EMS — activación EMSR916

`GET https://rapidmapping.emergency.copernicus.eu/backend/dashboard-api/public-activations/?code=EMSR916`

| Campo | Valor |
|---|---|
| Código | **EMSR916** — "Earthquake in Colombia" |
| Categoría | Earthquake / Ground shaking |
| Activada | **2026-08-10 17:13 UTC** (4h39m después del sismo) |
| Activador | EC Services \| DG ECHO |
| Estado | **abierta** (`closed: false`) |
| GDACS | 1557236 · Charter Internacional nº **1048** |
| AOIs | **3**: Cali Center, Northen Cali, Pereira |
| Productos entregados | **0** — primera adquisición Pléiades prevista 11-ago 15:28 |

El texto de activación cita daño en **Quibdó, Pereira, Manizales y Cali**, pero solo tres
AOIs están abiertos y ninguno cubre Manizales ni Quibdó. Es esperable que se añadan:
conviene vigilar el endpoint a diario (ya lo hace el cron).

**Consecuencia operativa:** los contadores de edificios estarán a cero varios días. Un
sitio que dependa solo de Copernicus nace vacío; necesita una capa que funcione desde el
día uno — y A.2/A.5 la proporcionan.

---

## B. Contexto colombiano, fuentes oficiales y exposición

*Pendiente del informe de investigación en curso.*

Preguntas abiertas que debe cerrar:

1. Qué publica la **UNGRD** y en qué formato: ¿hay dataset en datos.gov.co, API, o solo
   boletines PDF? ¿Con qué granularidad territorial y cadencia?
2. Dónde está la **fricción informativa real**. Las cifras oficiales no están en disputa
   (esta es *la* diferencia con Venezuela), así que el valor del sitio no está en
   contrastar recuentos sino en algún otro sitio: cobertura territorial desigual,
   vivienda informal fuera del censo de daño, ritmo de la reconstrucción, cobertura de
   seguros, exposición no medida.
3. **NSR-10** y microzonificación sísmica: qué ciudades la tienen, qué parte del parque
   es anterior a la norma.
4. Precedentes para dar escala: **Armenia 1999**, Quetame 2023, Cundinamarca 2025.

---

## Comandos de verificación

```bash
# Sismo, PAGER, ShakeMap, ground-failure
curl -s "https://earthquake.usgs.gov/earthquakes/feed/v1.0/detail/us6000tjl2.geojson"

# Activación Copernicus
npm run fetch:copernicus   # → data/emsr916.json
```
