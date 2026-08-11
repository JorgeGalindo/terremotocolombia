// Capa "Exposición": cruza la sacudida modelada (USGS ShakeMap) con la
// vulnerabilidad previa de la vivienda (déficit habitacional del DANE, CNPV 2018)
// municipio a municipio. Es el argumento central del sitio: a la misma sacudida,
// municipios muy distintos.
//
// Encodings (un solo sistema, compartido entre dispersión y mapa):
//   posición x  → intensidad MMI
//   posición y  → % de déficit habitacional
//   área        → hogares censales
//   color       → % de déficit (rampa secuencial cálida, monótona en luminosidad)

const fmt = (n) => Number(n).toLocaleString("es-ES");
const pct = (n) => `${Number(n).toFixed(1).replace(".", ",")} %`;

// Rampa secuencial: L* OKLab 0,339 → 0,831, pasos uniformes. Más déficit = más
// brillo sobre el fondo oscuro.
const RAMP = ["#4a3122", "#7c4c27", "#ad682c", "#dc8a33", "#ffb84d"];
const BREAKS = [20, 40, 60, 80];

export function colorDeficit(d) {
  let i = 0;
  while (i < BREAKS.length && d >= BREAKS[i]) i++;
  return RAMP[i];
}

// Escala de área: radio ∝ √hogares, normalizado al mayor y acotado, para que
// Medellín y Cali no se coman el panel.
const R_MIN = 2.6, R_MAX = 24;
function makeR(municipios) {
  const max = Math.max(...municipios.map((m) => m.hogares || 0), 1);
  return (h) => R_MIN + (R_MAX - R_MIN) * Math.sqrt((h || 0) / max);
}

// ---------- Dispersión ----------
function scatter(municipios) {
  const W = 760, H = 460;
  const M = { t: 18, r: 18, b: 44, l: 52 };
  const iw = W - M.l - M.r, ih = H - M.t - M.b;

  const xs = municipios.map((m) => m.mmi);
  const x0 = Math.floor(Math.min(...xs) * 2) / 2;
  const x1 = Math.ceil(Math.max(...xs) * 2) / 2;
  const X = (v) => M.l + ((v - x0) / (x1 - x0)) * iw;
  const Y = (v) => M.t + ih - (v / 100) * ih;

  const xTicks = [];
  for (let v = x0; v <= x1 + 1e-9; v += 0.5) xTicks.push(v);
  const yTicks = [0, 20, 40, 60, 80, 100];

  const rHogares = makeR(municipios);

  // Etiquetamos solo lo que sostiene el argumento, nunca todos los puntos.
  // dy separa a mano el racimo de baja vulnerabilidad, que si no se solapa.
  const ETIQUETAS = new Map([
    ["27361", { dy: 0 }],   // Istmina — máximo déficit con sacudida fuerte
    ["27001", { dy: 0 }],   // Quibdó
    ["27660", { dy: 0 }],   // San José del Palmar — el epicentro
    ["76147", { dy: -14 }], // Cartago — misma sacudida, déficit bajo
    ["66001", { dy: 4 }],   // Pereira
    ["76001", { dy: 16 }],  // Cali
  ]);

  const grid = [
    ...yTicks.map(
      (v) =>
        `<line x1="${M.l}" y1="${Y(v)}" x2="${W - M.r}" y2="${Y(v)}" class="gridline"/>`
    ),
    ...xTicks.map(
      (v) =>
        `<line x1="${X(v)}" y1="${M.t}" x2="${X(v)}" y2="${M.t + ih}" class="gridline"/>`
    ),
  ].join("");

  // Los círculos grandes al fondo para que los pequeños no queden ocultos.
  const pts = [...municipios]
    .sort((a, b) => (b.hogares || 0) - (a.hogares || 0))
    .map((m) => {
      const lbl = ETIQUETAS.has(m.divipola);
      return `<circle cx="${X(m.mmi).toFixed(1)}" cy="${Y(m.deficit).toFixed(1)}" r="${rHogares(m.hogares).toFixed(1)}"
        fill="${colorDeficit(m.deficit)}" fill-opacity="${lbl ? 0.95 : 0.66}"
        stroke="var(--bg)" stroke-width="1.2"
        class="pt${lbl ? " is-key" : ""}"
        data-n="${m.nombre}" data-d="${m.dpto}" data-mmi="${m.mmi}" data-def="${m.deficit}" data-h="${m.hogares}"/>`;
    })
    .join("");

  const labels = municipios
    .filter((m) => ETIQUETAS.has(m.divipola))
    .map((m) => {
      const { dy } = ETIQUETAS.get(m.divipola);
      const x = X(m.mmi), y = Y(m.deficit), r = rHogares(m.hogares);
      const right = x < M.l + iw * 0.7;
      return `<text x="${(right ? x + r + 6 : x - r - 6).toFixed(1)}" y="${(y + 3.5 + dy).toFixed(1)}"
        class="ptlabel" text-anchor="${right ? "start" : "end"}">${m.nombre}</text>`;
    })
    .join("");

  return `<figure class="chart">
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Dispersión de intensidad sísmica frente a déficit habitacional por municipio">
      ${grid}
      <line x1="${M.l}" y1="${M.t + ih}" x2="${W - M.r}" y2="${M.t + ih}" class="axis"/>
      <line x1="${M.l}" y1="${M.t}" x2="${M.l}" y2="${M.t + ih}" class="axis"/>
      ${xTicks.map((v) => `<text x="${X(v)}" y="${M.t + ih + 18}" class="tick" text-anchor="middle">${String(v).replace(".", ",")}</text>`).join("")}
      ${yTicks.map((v) => `<text x="${M.l - 9}" y="${Y(v) + 4}" class="tick" text-anchor="end">${v}</text>`).join("")}
      <text x="${M.l + iw / 2}" y="${H - 6}" class="axtitle" text-anchor="middle">intensidad MMI</text>
      <text x="14" y="${M.t + ih / 2}" class="axtitle" text-anchor="middle" transform="rotate(-90 14 ${M.t + ih / 2})">déficit habitacional (%)</text>
      ${pts}
      ${labels}
    </svg>
    <div class="tip" id="scatter-tip" hidden></div>
  </figure>`;
}

function legend() {
  const rangos = ["0–20", "20–40", "40–60", "60–80", "80–100"];
  return `<div class="ramp" aria-label="Leyenda de déficit habitacional">
    ${RAMP.map((c, i) => `<div class="step"><span class="sw" style="background:${c}"></span>${rangos[i]}</div>`).join("")}
    <span class="ramp-unit">% déficit habitacional</span>
  </div>`;
}

function tabla(municipios) {
  const top = [...municipios].filter((m) => m.mmi >= 6).sort((a, b) => b.deficit - a.deficit).slice(0, 25);
  return `<details class="tabla">
    <summary>Municipios con MMI VI o más, por déficit (${top.length} de ${municipios.filter((m) => m.mmi >= 6).length})</summary>
    <table>
      <thead><tr><th>Municipio</th><th>Departamento</th><th>MMI</th><th>Déficit</th><th>Hogares</th></tr></thead>
      <tbody>${top
        .map(
          (m) => `<tr><td>${m.nombre}</td><td>${m.dpto}</td><td class="num">${String(m.mmi).replace(".", ",")}</td>
          <td class="num"><span class="sw sm" style="background:${colorDeficit(m.deficit)}"></span>${pct(m.deficit)}</td>
          <td class="num">${fmt(m.hogares)}</td></tr>`
        )
        .join("")}</tbody>
    </table>
  </details>`;
}

function hookTooltip(root) {
  const tip = root.querySelector("#scatter-tip");
  const fig = root.querySelector(".chart");
  if (!tip || !fig) return;
  fig.addEventListener("pointerover", (e) => {
    const c = e.target.closest(".pt");
    if (!c) return;
    const d = c.dataset;
    tip.innerHTML = `<strong>${d.n}</strong><span class="tip-sub">${d.d}</span>
      <span>MMI ${String(d.mmi).replace(".", ",")}</span>
      <span>déficit ${pct(d.def)}</span>
      <span>${fmt(d.h)} hogares</span>`;
    tip.hidden = false;
  });
  fig.addEventListener("pointermove", (e) => {
    const r = fig.getBoundingClientRect();
    tip.style.left = `${e.clientX - r.left + 14}px`;
    tip.style.top = `${e.clientY - r.top + 14}px`;
  });
  fig.addEventListener("pointerout", (e) => {
    if (e.target.closest(".pt")) tip.hidden = true;
  });
}

// ---------- Render ----------
export function renderExposicion(data) {
  const root = document.getElementById("exposicion");
  const vi = data.resumen.find((r) => r.mmi === 6);
  const share = (vi.hogaresDeficitAlto / vi.hogares) * 100;

  root.innerHTML = `
    <section class="lede">
      <p class="hero-stat"><strong>${fmt(vi.hogares)}</strong> hogares en los ${vi.municipios} municipios
      que la sacudida alcanzó con intensidad <strong>VI o más</strong>.
      <span class="hero-split">${fmt(vi.hogaresDeficitAlto)} de ellos —el ${pct(share)}— están en municipios
      donde más de la mitad de la vivienda ya arrastraba déficit habitacional antes del terremoto.</span></p>
    </section>

    ${legend()}
    ${scatter(data.municipios)}

    <p class="chart-note">Cada círculo es un municipio; el área es el número de hogares censales.
    La esquina superior derecha —sacudida fuerte sobre vivienda deficitaria— es donde cabe esperar
    el daño: <strong>21 de los 25</strong> municipios que superan MMI VI y 60 % de déficit son del Chocó.
    Abajo a la derecha, con la misma sacudida y un tercio del déficit, está el Eje Cafetero.
    El epicentro sacude menos que Istmina, 100 km al norte, porque el modelo lo sitúa
    sobre roca (Vs30 900 m/s) y a Istmina sobre suelo blando (327 m/s).</p>

    ${tabla(data.municipios)}`;

  // El pie va DESPUÉS del mapa, en su propio contenedor.
  document.getElementById("exposicion-foot").innerHTML = `
    <footer class="foot">
      <p><strong>Fuentes:</strong> intensidad de <a href="https://earthquake.usgs.gov/earthquakes/eventpage/${data.meta.evento}" target="_blank" rel="noopener">USGS ShakeMap v${data.meta.shakemap.version}</a>
      (${data.meta.shakemap.status}); déficit habitacional del <a href="https://www.dane.gov.co/files/investigaciones/deficit-habitacional/deficit-hab-2020-anexo-nueva-metodologia.xlsx" target="_blank" rel="noopener">DANE, CNPV 2018</a>;
      códigos y centroides de <a href="https://www.datos.gov.co/resource/pqwj-3fi4" target="_blank" rel="noopener">DIVIPOLA</a>.</p>
      <p class="disclaimer">El déficit habitacional mide carencias de la vivienda —materiales, hacinamiento,
      servicios—, <strong>no vulnerabilidad sísmica</strong>: correlaciona con ella, no la sustituye, y el dato es de 2018.
      El ShakeMap se apoya en <strong>${data.meta.shakemap.seismicStations} estaciones sísmicas</strong> y
      ${data.meta.shakemap.intensityObservations} observaciones de intensidad: es sobre todo un modelo, no una medición densa,
      y sigue en revisión automática. No hay todavía censo oficial de daño: el consolidado de emergencias de la UNGRD
      se publica en ficheros anuales con meses de retraso.</p>
    </footer>`;

  hookTooltip(root);
}

// ---------- Capa de mapa ----------
export function addExposicion(map, data) {
  const fc = {
    type: "FeatureCollection",
    features: data.municipios.map((m) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [m.lon, m.lat] },
      properties: {
        nombre: m.nombre, dpto: m.dpto, mmi: m.mmi,
        deficit: m.deficit, hogares: m.hogares, color: colorDeficit(m.deficit),
      },
    })),
  };

  map.addSource("exposicion", { type: "geojson", data: fc });
  map.addLayer({
    id: "exposicion-circulos",
    type: "circle",
    source: "exposicion",
    paint: {
      "circle-color": ["get", "color"],
      "circle-opacity": 0.82,
      // Radio ∝ √hogares normalizado al mayor (≈815.000), igual que la dispersión.
      "circle-radius": [
        "interpolate", ["linear"], ["zoom"],
        5, ["+", 2, ["*", 13, ["sqrt", ["/", ["get", "hogares"], 815362]]]],
        10, ["+", 5, ["*", 40, ["sqrt", ["/", ["get", "hogares"], 815362]]]],
      ],
      "circle-stroke-color": "#1a120c",
      "circle-stroke-width": 1.2,
    },
  });

  const popup = new maplibregl.Popup({ closeButton: false, className: "mp" });
  map.on("mousemove", "exposicion-circulos", (e) => {
    map.getCanvas().style.cursor = "pointer";
    const p = e.features[0].properties;
    popup
      .setLngLat(e.lngLat)
      .setHTML(`<strong>${p.nombre}</strong><br>${p.dpto}<br>MMI ${String(p.mmi).replace(".", ",")} · déficit ${pct(p.deficit)}<br>${fmt(p.hogares)} hogares`)
      .addTo(map);
  });
  map.on("mouseleave", "exposicion-circulos", () => {
    map.getCanvas().style.cursor = "";
    popup.remove();
  });
}
