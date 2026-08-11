#!/usr/bin/env node
// Cruza SACUDIDA (USGS ShakeMap) con VULNERABILIDAD PREVIA (déficit habitacional
// del DANE, CNPV 2018) municipio a municipio. Es la capa que vertebra el sitio:
// responde "dónde debería estar el daño" antes de que exista censo de daño.
//
// Fuentes, todas públicas y gratuitas:
//   1. USGS feed de detalle del evento → resuelve las URLs VERSIONADAS de los
//      productos. Nunca se hardcodea una URL de producto: al actualizarse
//      ShakeMap/PAGER la anterior muere (ver 01-entendimiento.md §B.5).
//   2. ShakeMap grid.xml → rejilla regular de MMI/PGA/Vs30 (~468.000 puntos).
//   3. PAGER cities.json → coordenadas de NÚCLEO POBLADO (donde vive la gente).
//   4. DIVIPOLA de datos.gov.co → centroide municipal + código DANE, usado para
//      resolver a qué municipio pertenece cada núcleo y como respaldo.
//   5. data/dane-deficit-mpio.json → déficit habitacional (estático, CNPV 2018).
//
// Uso:  node scripts/fetch-exposicion.mjs
// Salida: data/exposicion.json

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const EVENT = "us6000tjl2";
const FEED = `https://earthquake.usgs.gov/earthquakes/feed/v1.0/detail/${EVENT}.geojson`;
const DIVIPOLA = "https://www.datos.gov.co/resource/pqwj-3fi4.json?$limit=2000";

const __dir = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dir, "../data/exposicion.json");
const DANE_FILE = resolve(__dir, "../data/dane-deficit-mpio.json");

// Un núcleo poblado emparejado a un municipio cuyo centroide está más lejos que
// esto es casi seguro una homonimia mal resuelta (hay 30 nombres duplicados).
const MAX_MATCH_KM = 60;

const UA = { "User-Agent": "terremotocolombia-microsite" };

async function getJSON(url) {
  const r = await fetch(url, { headers: { Accept: "application/json", ...UA } });
  if (!r.ok) throw new Error(`HTTP ${r.status} ${url}`);
  return r.json();
}

async function getText(url) {
  const r = await fetch(url, { headers: UA });
  if (!r.ok) throw new Error(`HTTP ${r.status} ${url}`);
  return r.text();
}

// Quita tildes y normaliza para emparejar nombres entre fuentes distintas.
const norm = (s) =>
  String(s)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[.,]/g, "")
    .trim()
    .replace(/\s+/g, " ");

const distKm = (lat1, lon1, lat2, lon2) =>
  Math.hypot((lat1 - lat2) * 111, (lon1 - lon2) * 111 * Math.cos((lat1 * Math.PI) / 180));

// --- ShakeMap: rejilla regular, orden fila a fila desde (lon_min, lat_max) ---
function parseGrid(xml) {
  const spec = xml.match(/<grid_specification([^>]*)\/>/)[1];
  const num = (k) => Number(spec.match(new RegExp(`${k}="([-\\d.]+)"`))[1]);
  const g = {
    lonMin: num("lon_min"),
    latMax: num("lat_max"),
    dLon: num("nominal_lon_spacing"),
    dLat: num("nominal_lat_spacing"),
    nLon: num("nlon"),
    nLat: num("nlat"),
  };

  const start = xml.indexOf("<grid_data>") + "<grid_data>".length;
  const end = xml.indexOf("</grid_data>");
  const lines = xml.slice(start, end).trim().split("\n");
  if (lines.length !== g.nLon * g.nLat) {
    throw new Error(`rejilla inconsistente: ${lines.length} != ${g.nLon}x${g.nLat}`);
  }

  // Campos: 1 LON, 2 LAT, 3 MMI, 4 PGA, 5 PGV, 6-9 PSA, 10 SVEL(Vs30)
  const sample = (lat, lon) => {
    const col = Math.round((lon - g.lonMin) / g.dLon);
    const row = Math.round((g.latMax - lat) / g.dLat);
    if (col < 0 || col >= g.nLon || row < 0 || row >= g.nLat) return null;
    const f = lines[row * g.nLon + col].split(/\s+/);
    return {
      mmi: Math.round(Number(f[2]) * 100) / 100,
      pga: Number(f[3]),
      vs30: Math.round(Number(f[9])),
    };
  };

  const meta = {
    version: xml.match(/shakemap_version="(\d+)"/)?.[1] ?? null,
    status: xml.match(/map_status="(\w+)"/)?.[1] ?? null,
    seismicStations: Number(xml.match(/seismic_stations="(\d+)"/)?.[1] ?? 0),
    intensityObservations: Number(xml.match(/intensity_observations="(\d+)"/)?.[1] ?? 0),
    processed: xml.match(/process_timestamp="([^"]+)"/)?.[1] ?? null,
  };

  return { sample, meta, points: lines.length };
}

async function main() {
  console.log("· Resolviendo productos USGS…");
  const feed = await getJSON(FEED);
  const props = feed.properties;
  const shakemap = props.products.shakemap[0];
  const pager = props.products.losspager?.[0];

  const gridUrl = shakemap.contents["download/grid.xml"].url;
  const citiesUrl = pager?.contents["json/cities.json"]?.url;

  console.log("· Descargando rejilla ShakeMap…");
  const { sample, meta: smMeta, points } = parseGrid(await getText(gridUrl));
  console.log(`  rejilla v${smMeta.version} (${smMeta.status}) · ${points.toLocaleString("es-ES")} puntos`);
  console.log(`  ${smMeta.seismicStations} estaciones sísmicas · ${smMeta.intensityObservations} observaciones de intensidad`);

  console.log("· Descargando DIVIPOLA y núcleos poblados…");
  const divipolaRaw = await getJSON(DIVIPOLA);
  const cities = citiesUrl ? (await getJSON(citiesUrl)).all_cities : [];
  const dane = JSON.parse(readFileSync(DANE_FILE, "utf8"));

  // DIVIPOLA de datos.gov.co guarda Antioquia y Atlántico SIN el cero inicial.
  const divipola = divipolaRaw.map((d) => ({
    cod: String(d.idmupio).padStart(5, "0"),
    nombre: d.nommpio,
    lat: Number(d.mpiolatitud),
    lon: Number(d.mpiolongitud),
  }));

  const byName = new Map();
  for (const d of divipola) {
    const k = norm(d.nombre);
    if (!byName.has(k)) byName.set(k, []);
    byName.get(k).push(d);
  }

  // (1) Núcleos poblados: coordenada donde vive la gente. Resolvemos homonimias
  //     por proximidad al centroide municipal, no por orden de aparición.
  const rows = new Map();
  let sinMatch = 0;
  for (const c of cities) {
    const cand = byName.get(norm(c.name));
    if (!cand) { sinMatch++; continue; }
    let best = cand[0];
    for (const d of cand) {
      if (distKm(c.lat, c.lon, d.lat, d.lon) < distKm(c.lat, c.lon, best.lat, best.lon)) best = d;
    }
    if (distKm(c.lat, c.lon, best.lat, best.lon) > MAX_MATCH_KM) { sinMatch++; continue; }

    const d = dane[best.cod];
    const s = sample(c.lat, c.lon);
    if (!d || !s) continue;
    // Si un municipio tiene varios núcleos listados, nos quedamos con el mayor.
    const prev = rows.get(best.cod);
    if (prev && prev.poblacion >= c.pop) continue;
    rows.set(best.cod, {
      divipola: best.cod,
      nombre: d.nombre,
      dpto: d.dpto,
      lat: Math.round(c.lat * 1e4) / 1e4,
      lon: Math.round(c.lon * 1e4) / 1e4,
      poblacion: Math.round(c.pop),
      hogares: d.hogares,
      deficit: d.def_total_pc,
      deficitCuanti: d.def_cuanti_pc,
      ...s,
      coord: "nucleo",
    });
  }

  // (2) Respaldo: municipios dentro de la rejilla sin núcleo listado en PAGER.
  let porCentroide = 0;
  for (const d of divipola) {
    if (rows.has(d.cod)) continue;
    const dd = dane[d.cod];
    const s = dd ? sample(d.lat, d.lon) : null;
    if (!dd || !s) continue;
    porCentroide++;
    rows.set(d.cod, {
      divipola: d.cod,
      nombre: dd.nombre,
      dpto: dd.dpto,
      lat: Math.round(d.lat * 1e4) / 1e4,
      lon: Math.round(d.lon * 1e4) / 1e4,
      poblacion: null,
      hogares: dd.hogares,
      deficit: dd.def_total_pc,
      deficitCuanti: dd.def_cuanti_pc,
      ...s,
      coord: "centroide",
    });
  }

  const municipios = [...rows.values()].sort((a, b) => b.mmi - a.mmi);

  // Agregados: hogares por tramo de intensidad, partidos por vulnerabilidad.
  const tramos = [
    { mmi: 6, label: "MMI VI o más" },
    { mmi: 5, label: "MMI V o más" },
    { mmi: 4, label: "MMI IV o más" },
  ];
  const resumen = tramos.map((t) => {
    const sel = municipios.filter((m) => m.mmi >= t.mmi);
    const alta = sel.filter((m) => m.deficit >= 50);
    return {
      ...t,
      municipios: sel.length,
      hogares: sel.reduce((a, m) => a + (m.hogares || 0), 0),
      municipiosDeficitAlto: alta.length,
      hogaresDeficitAlto: alta.reduce((a, m) => a + (m.hogares || 0), 0),
    };
  });

  const out = {
    meta: {
      evento: EVENT,
      magnitud: props.mag,
      profundidadKm: feed.geometry.coordinates[2],
      lugar: props.place,
      origen: new Date(props.time).toISOString(),
      alerta: props.alert,
      shakemap: smMeta,
      origenRevision: props.products.origin?.[0]?.properties?.["evaluation-status"] ?? null,
      pagerRevision: pager?.properties?.["review-status"] ?? null,
      fuentes: {
        sacudida: gridUrl,
        nucleos: citiesUrl,
        divipola: DIVIPOLA,
        deficit:
          "DANE, Déficit habitacional CNPV 2018 — deficit-hab-2020-anexo-nueva-metodologia.xlsx, hoja 'Total Municipios'",
      },
      advertencia:
        "El déficit habitacional mide carencias de la vivienda (materiales, hacinamiento, servicios), NO vulnerabilidad sísmica. Correlaciona con ella, no la sustituye. Dato de 2018.",
      fetchedAt: new Date().toISOString(),
    },
    resumen,
    municipios,
  };

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n");

  console.log(`\n✓ ${municipios.length} municipios cruzados`);
  console.log(`  ${municipios.length - porCentroide} por núcleo poblado · ${porCentroide} por centroide · ${sinMatch} núcleos sin emparejar`);
  for (const r of resumen) {
    console.log(
      `  ${r.label}: ${r.municipios} municipios, ${r.hogares.toLocaleString("es-ES")} hogares` +
        ` — de los cuales ${r.hogaresDeficitAlto.toLocaleString("es-ES")} en municipios con déficit ≥50%`
    );
  }
  console.log(`  → ${OUT}`);
}

main().catch((e) => {
  console.error("✗", e.message);
  process.exit(1);
});
