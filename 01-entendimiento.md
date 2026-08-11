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

**33.993.081 personas** sintieron el terremoto con MMI ≥ IV — casi 34 millones, de los
cuales 33.981.020 en Colombia, 6.058 en Panamá y 6.003 en Ecuador. Es la cifra que da la
escala real del evento y ninguna fuente periodística la está dando.

*Verificado dos veces:* la primera extracción usó un *fallback* para las etiquetas MMI;
re-leído contra la clave real `mmi` del fichero, los valores coinciden (ver B.5).

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

Resultado de la investigación (104 agentes, 22 fuentes leídas, 110 afirmaciones
extraídas, 25 sometidas a verificación adversarial a 3 votos: **7 confirmadas, 18
eliminadas**). La tasa de mortalidad de afirmaciones es alta y eso es información en sí:
casi todo lo que circula sobre este sismo a T+1 no aguanta contraste.

### B.1 El hallazgo central: no hay fricción de veracidad, hay fricción de latencia

Esta es *la* diferencia con Venezuela, y no está donde parecía. Allí el problema era que
la cifra oficial estaba en disputa. Aquí el problema es que **la cifra oficial
estructurada no existe todavía y no existirá en meses**:

| Fuente | Qué es | Estado real |
|---|---|---|
| Consolidado de emergencias UNGRD | 28 ficheros `.xls` anuales (1998–2025) | **No hay fichero de 2026.** El de 2025 se modificó el 12-jun-2026: 5,5 meses tras cerrar el año. El de 2020 tardó ~16 meses |
| `datos.gov.co` — `wwkg-r6te` | Espejo "Emergencias UNGRD" | Congelado en **2022**; última escritura de filas 07-sep-2023. Lo publica la Alcaldía de Saravena, no la UNGRD |
| `datos.gov.co` — `rgre-6ak4` | Sucesor oficial UNGRD | Termina en **2024-12-31**; sin escrituras desde jul-2025 |

> **El sismo del 10-ago-2026 no aparecerá en datos abiertos hasta 2027.**

Dos trampas comprobadas para quien mire por encima: el campo `viewLastModified` de
`wwkg-r6te` marca 2026-05-18, pero es un toque de metadatos, no una escritura de datos; y
existe un casi-duplicado (`ezmg-5i6t`, creado 11-mar-2026) con el **mismo**
`rowsUpdatedAt` — el mismo payload congelado reciclado bajo id nuevo.

**Qué debería publicarse y no se publica.** El esquema de la UNGRD sirve de plantilla:
71 columnas codificadas por DIVIPOLA (fallecidos, heridos, desaparecidos, personas y
familias afectadas, viviendas destruidas vs. averiadas, vías, puentes, acueducto,
alcantarillado, centros de salud/educativos/comunitarios, hectáreas, gasto del FNGRD). La
versión 2023-24 añade justo lo que un sitio de terremoto querría: **coordenadas, Registro
Único de Damnificados, y número y fechas del decreto de calamidad**. Fricciones de
parseo verificadas: las columnas de dinero son texto (`"$    - 0"`).

### B.2 Lo que sí está disponible hoy y a grano fino: la exposición previa

**DANE — déficit habitacional (CNPV 2018), consultable por API sin scraping.** Geovisor
`codigoVisor=31`: 1.122 municipios, 44.460 sectores censales y 4.313 manzanas (Chocó).

| Municipio | Déficit habitacional total |
|---|---:|
| Quibdó | **89,7 %** |
| San José del Palmar (epicentro) | **81,2 %** (53,97 cuantitativo) |
| Pereira | 21,3 % |
| Manizales | 16,3 % |
| Cali | 14,0 % |

*Caveat que debe viajar con el dato:* es CNPV **2018**, ocho años de antigüedad, y el DANE
no tiene nada municipal más reciente. El déficit habitacional **no es** una medida de
vulnerabilidad sísmica: mide carencias de la vivienda (materiales, hacinamiento,
servicios), que correlacionan con vulnerabilidad pero no la miden. Hay que decirlo en la
página, no insinuar lo contrario.

**GEM/TREQ — modelo de exposición de Cali (año base 2020).** El único modelo estructural
fino y co-oficial disponible (GEM con SGC, USGS, EAFIT y la Secretaría de Gestión del
Riesgo de Cali):

- **348.000** estructuras · **2 millones** de ocupantes · 373 tipologías
- Valor de reemplazo **> 55.000 M USD** (220 billones COP)
- **48 %** de los habitantes vive en estructuras de 1–2 pisos con provisiones sísmicas bajas
- De 4.937 edificaciones inspeccionadas, **~25 %** son sistemas informales de alta
  vulnerabilidad (mampostería semiconfinada, no reforzada, adobe); **~7 %** de la
  población vive en asentamientos de desarrollo incompleto

### B.3 El precedente correcto no es Armenia 1999

El SGC lo declara **el sismo de mayor magnitud registrada en Colombia en el siglo XXI** y
su director, Julio Fierro, lo compara con el **Mw 7,2 del 23-nov-1979**, intraslab a
~108 km en el mismo nicho sismotectónico: 50 muertos, sentido en 17 departamentos. El SGC
publica una [infografía dedicada a 1979](https://srvags.sgc.gov.co/PortalWeb/Infografias-sismos-historicos/6-Infografia-sismo-1979-11-23-Eje-Cafetero.pdf)
directamente reutilizable.

Armenia 1999 (~17 km, falla de Romeral) y Quetame 2023 son **corticales someros**: no
comparables en mecanismo, aunque la prensa los use por defecto. Curiosamente el propio
PAGER invoca Armenia 1999 como análogo histórico (M6,1, 398.000 personas en MMI VII,
1.900 muertos) — es análogo de *consecuencias*, no de mecanismo, y conviene distinguirlo.

> **Error mediático a no propagar:** circula el titular "el más fuerte del país en los
> últimos 100 años, según el SGC". Es falso. El superlativo correcto es "del siglo XXI"
> (el máximo previo era el Mw 7,2 de Bajo Baudó, Chocó, 15-nov-2004).

### B.4 Lo que la investigación NO pudo verificar

Honestidad sobre los huecos, porque condicionan qué puede prometer el sitio:

- **Ninguna cifra oficial de afectación** del 10-ago-2026 (muertos, heridos, viviendas)
  sobrevivió la verificación. Circula "111 muertos, 1.575 viviendas averiadas y 37
  destruidas" vía Portafolio, pero es fuente secundaria sin confirmar. A T+1 **no existe
  cifra oficial estructurada que verificar** — lo cual es coherente con B.1.
- **El efecto de sitio**, que era el eje explicativo prioritario, quedó **sin respaldo
  verificado**: los claims sobre amplificación en periodo largo y desagregación intraslab
  fueron refutados. No se puede afirmar en la web que los suelos blandos del valle del
  Cauca amplificaron, por plausible que suene.
- **Declaratoria de desastre nacional, Charter Internacional y GDACS**: no verificados por
  la investigación. *Pero* el número de Charter (1048) y el id GDACS (1557236) sí constan
  en la respuesta del backend de Copernicus que leí directamente (A.6), igual que la
  activación EMSR916 completa.
- **NSR-10 y microzonificación**: sin cobertura verificada más allá de que Cali tiene
  modelo GEM.
- **Profundidad SGC de 103 km**: refutada (0-3). El dato robusto es **110,285 km** del USGS.

### B.5 Gotchas de ingeniería detectados al verificar

1. **`cities.json` tiene 30 nombres de municipio duplicados** (Armenia, Argelia, Bolívar,
   Caldas…). Armenia de Quindío (301.226 hab) es MMI 6,503; Armenia de Antioquia (7.006
   hab) es MMI 4,903. **Indexar por coordenadas o DIVIPOLA, nunca por nombre.**
2. **`exposures.json` usa la clave `mmi`**, no `mmi_range`. Un parser con *fallback* a
   `range(1,11)` acierta por casualidad hoy y fallará en silencio el día que cambie.
3. Los productos USGS llevan la **versión en la URL** (`…:us6000tjl2:1786373000964/…`).
   Al actualizarse PAGER, la URL antigua muere: hay que resolverla siempre desde el feed
   de detalle, nunca guardarla.
4. El origen sigue **`preliminary`** y ShakeMap/PAGER en **`automatic`** con
   `release=false`. La magnitud ya se revisó al alza de 6,6 a 7,4. **Leer y versionar
   desde la API; jamás hardcodear.**
5. La eventpage HTML de USGS es una SPA: no sirve para scraping. Usar el endpoint GeoJSON.

---

## Comandos de verificación

```bash
# Sismo, PAGER, ShakeMap, ground-failure
curl -s "https://earthquake.usgs.gov/earthquakes/feed/v1.0/detail/us6000tjl2.geojson"

# Activación Copernicus
npm run fetch:copernicus   # → data/emsr916.json
```
