'use strict';
/* Mi Dieta: dieta, peso y hábitos.
   Los datos de cada usuario se guardan en su cuenta (ver cuenta.js) y en una copia local para usar sin conexión.
   Las fotos quedan solo en el teléfono (IndexedDB). */

const TIPOS = ['Desayuno', 'Almuerzo', 'Merienda', 'Cena', 'Colación'];
const ACTIVIDAD = [
  [1.2, 'Sedentaria', 'Poco o nada de ejercicio'],
  [1.375, 'Ligera', 'Ejercicio 1 a 3 días por semana'],
  [1.55, 'Moderada', 'Ejercicio 3 a 5 días por semana'],
  [1.725, 'Alta', 'Ejercicio 6 a 7 días por semana'],
  [1.9, 'Muy alta', 'Trabajo físico o doble turno']
];
const OBJETIVOS = { bajar: 'Bajar grasa', recomp: 'Ganar músculo y bajar grasa', ganar: 'Ganar músculo', mantener: 'Mantener' };
const HABITOS_BASE = [
  { id: 'agua', n: 'Agua', tipo: 'contador', meta: 8, u: 'vasos', rec: '11:00' },
  { id: 'pasos', n: 'Pasos', tipo: 'numero', meta: 8000, u: 'pasos', rec: '20:00' },
  { id: 'sueno', n: 'Sueño', tipo: 'numero', meta: 7.5, u: 'horas', rec: '' },
  { id: 'entreno', n: 'Entrenamiento', tipo: 'check', meta: 1, u: '', rec: '18:30' },
  { id: 'verdura', n: 'Verduras en dos comidas', tipo: 'check', meta: 1, u: '', rec: '' },
  { id: 'alcohol', n: 'Sin alcohol', tipo: 'check', meta: 1, u: '', rec: '22:30' }
];

const IC = {
  hoy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 3a9 9 0 1 0 9 9"/><path d="M12 7.5a4.5 4.5 0 1 0 4.5 4.5"/><circle cx="18.5" cy="5.5" r="1.6" fill="currentColor" stroke="none"/></svg>',
  habitos: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6.5l1.8 1.8L9 5"/><path d="M4 12.5l1.8 1.8L9 11"/><path d="M4 18.5l1.8 1.8L9 17"/><path d="M12.5 7h7.5M12.5 13h7.5M12.5 19h7.5"/></svg>',
  progreso: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 20h18"/><path d="M4 15l5-5 4 3 7-7"/><path d="M15 6h5v5"/></svg>',
  perfil: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.2-4 4.3-6 8-6s6.8 2 8 6"/></svg>',
  mas: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  camara: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M4 8h3l1.6-2.4h6.8L17 8h3v11H4z"/><circle cx="12" cy="13.2" r="3.6"/></svg>',
  galeria: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><circle cx="9" cy="10" r="1.8"/><path d="M20 16l-5-5-8 8"/></svg>',
  plato: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
  chev: '<svg class="chevron" viewBox="0 0 8 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 1l6 6-6 6"/></svg>',
  izq: '<svg viewBox="0 0 12 20" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2L2 10l8 8"/></svg>',
  der: '<svg viewBox="0 0 12 20" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2 2l8 8-8 8"/></svg>',
  chispa: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5l2 6.2 6.5 1.8-6.5 1.9-2 6.1-2-6.1-6.5-1.9 6.5-1.8z"/><circle cx="19" cy="19" r="1.8"/></svg>',
  lupa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/></svg>'
};

/* ---------- Utilidades ---------- */
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const num = (v) => { const n = parseFloat(String(v ?? '').replace(',', '.')); return isFinite(n) ? n : 0; };
const fmt = (n, d = 0) => Number(n || 0).toLocaleString('es-AR', { maximumFractionDigits: d });
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const r1 = (n) => Math.round(n * 10) / 10;

function iso(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
const hoyISO = () => iso(new Date());
const aFecha = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const sumarDias = (s, n) => { const d = aFecha(s); d.setDate(d.getDate() + n); return iso(d); };
const difDias = (a, b) => Math.round((aFecha(b) - aFecha(a)) / 86400000);
const horaActual = () => { const d = new Date(); return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
function nombreDia(s) {
  const h = hoyISO();
  if (s === h) return 'Hoy';
  if (s === sumarDias(h, -1)) return 'Ayer';
  const t = aFecha(s).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'short' });
  return t.charAt(0).toUpperCase() + t.slice(1);
}
const fechaLarga = (s) => aFecha(s).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
const fechaCorta = (s) => aFecha(s).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }).replace('.', '');
function tipoPorHora() {
  const h = new Date().getHours() + new Date().getMinutes() / 60;
  if (h >= 5 && h < 11) return 'Desayuno';
  if (h >= 11 && h < 15.5) return 'Almuerzo';
  if (h >= 15.5 && h < 19.5) return 'Merienda';
  if (h >= 19.5 || h < 1) return 'Cena';
  return 'Colación';
}

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('visible');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => t.classList.remove('visible'), 2600);
}

function descargar(nombre, contenido, tipo) {
  const url = URL.createObjectURL(new Blob([contenido], { type: tipo }));
  const a = document.createElement('a');
  a.href = url; a.download = nombre;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/* ---------- Datos ---------- */
function estadoInicial() {
  return {
    version: 1,
    perfil: { nombre: '', sexo: '', edad: '', altura: '', peso: '', pesoMeta: '', actividad: 1.375, objetivo: 'bajar', ritmo: 'moderado', kcalManual: '', completo: false },
    comidas: [],
    pesos: [],
    habitos: [],
    misAlimentos: [],
    registroHabitos: {},
    avisados: {}
  };
}
function cargarEstado(guardado) {
  const st = Object.assign(estadoInicial(), guardado || {});
  st.perfil = Object.assign(estadoInicial().perfil, st.perfil);
  return st;
}
let S = estadoInicial(); // se completa al ingresar a la cuenta (cuenta.js)
const soloHabitos = () => S.habitos.filter((h) => h.grupo !== 'rec');
const soloRecordatorios = () => S.habitos.filter((h) => h.grupo === 'rec').sort((a, b) => (a.rec || '99').localeCompare(b.rec || '99'));
function guardar() {
  S.actualizado = Date.now();
  try { localStorage.setItem(claveDatos(), JSON.stringify(S)); } catch (e) { toast('No se pudo guardar en el teléfono: memoria llena'); }
  programarSubida();
}

// Fotos en IndexedDB (más espacio que localStorage)
const BD = new Promise((res) => {
  try {
    const r = indexedDB.open('mi-dieta', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('fotos');
    r.onsuccess = () => res(r.result);
    r.onerror = () => res(null);
  } catch (e) { res(null); }
});
async function bd(modo, fn) {
  const d = await BD;
  if (!d) return null;
  return new Promise((res) => {
    const t = d.transaction('fotos', modo);
    const req = fn(t.objectStore('fotos'));
    t.oncomplete = () => res(req && req.result);
    t.onerror = () => res(null);
  });
}
const fotoGuardar = (id, dato) => bd('readwrite', (s) => s.put(dato, id));
const fotoLeer = (id) => bd('readonly', (s) => s.get(id));
const fotoBorrar = (id) => bd('readwrite', (s) => s.delete(id));

/* ---------- Cálculos ---------- */
function pesoActual() {
  if (S.pesos.length) return S.pesos[S.pesos.length - 1].kg;
  return num(S.perfil.peso);
}
function metas() {
  const p = S.perfil;
  const peso = pesoActual(), alt = num(p.altura), edad = num(p.edad);
  if (!peso || !alt || !edad || !p.sexo) return null;
  // Mifflin-St Jeor
  const tmb = 10 * peso + 6.25 * alt - 5 * edad + (p.sexo === 'm' ? 5 : -161);
  const mant = tmb * num(p.actividad || 1.375);
  const ritmo = p.ritmo || 'moderado';
  const ajuste = p.objetivo === 'bajar' ? { suave: -0.1, moderado: -0.2, rapido: -0.25 }[ritmo]
    : p.objetivo === 'ganar' ? { suave: 0.05, moderado: 0.1, rapido: 0.15 }[ritmo]
      : p.objetivo === 'recomp' ? -0.1 : 0;
  let kcal = Math.round((mant * (1 + ajuste)) / 10) * 10;
  if (num(p.kcalManual) > 0) kcal = Math.round(num(p.kcalManual));
  const protKg = { bajar: 2.0, recomp: 2.2, mantener: 1.6, ganar: 1.8 }[p.objetivo] ?? 1.6;
  const prot = Math.round(peso * protKg);
  const grasa = Math.round(Math.max(0.8 * peso, (kcal * 0.27) / 9));
  const carb = Math.max(0, Math.round((kcal - prot * 4 - grasa * 9) / 4));
  return { tmb: Math.round(tmb), mant: Math.round(mant), kcal, prot, grasa, carb };
}
function totalesItems(items) {
  const t = { k: 0, p: 0, c: 0, g: 0 };
  for (const it of items) { const x = it.x ?? 1; t.k += it.k * x; t.p += it.p * x; t.c += it.c * x; t.g += it.g * x; }
  return { k: Math.round(t.k), p: r1(t.p), c: r1(t.c), g: r1(t.g) };
}
function totalesDia(fecha) {
  const t = { k: 0, p: 0, c: 0, g: 0 };
  for (const c of S.comidas) if (c.fecha === fecha) { t.k += c.k; t.p += c.p; t.c += c.c; t.g += c.g; }
  return t;
}
const valorHabito = (h, fecha) => (S.registroHabitos[fecha] || {})[h.id] || 0;
const cumplido = (h, fecha) => { const v = valorHabito(h, fecha); return h.tipo === 'check' ? v > 0 : v >= num(h.meta); };
function racha(h) {
  let d = hoyISO();
  if (!cumplido(h, d)) d = sumarDias(d, -1);
  let n = 0;
  while (cumplido(h, d) && n < 999) { n++; d = sumarDias(d, -1); }
  return n;
}

/* ---------- Interfaz ---------- */
const ui = { tab: 'hoy', dia: hoyISO() };
const PESTANAS = [['hoy', 'Hoy'], ['habitos', 'Hábitos'], ['progreso', 'Progreso'], ['perfil', 'Perfil']];

function render() {
  const pest = $('#pestanas');
  if (!sesion) { $('#app').innerHTML = vistaLogin(); pest.classList.add('oculto'); return; }
  if (ui.cargando) { $('#app').innerHTML = '<div class="pantalla"><div class="cargando" style="margin:auto"><div class="ruedita"></div>Cargando tu cuenta…</div></div>'; pest.classList.add('oculto'); return; }
  if (!ui.q && !S.perfil.completo) iniciarCuestionario();
  if (ui.q) { $('#app').innerHTML = vistaCuestionario(); pest.classList.add('oculto'); return; }
  pest.classList.remove('oculto');
  const vistas = { hoy: vistaHoy, habitos: vistaHabitos, progreso: vistaProgreso, perfil: vistaPerfil };
  $('#app').innerHTML = (vistas[ui.tab] || vistaHoy)();
  $('#pestanas').innerHTML = `<div class="contenido">${PESTANAS.map(([id, n]) =>
    `<button class="${ui.tab === id ? 'activa' : ''}" data-accion="tab" data-tab="${id}">${IC[id]}<span>${n}</span></button>`).join('')}</div>`;
  cargarMiniaturas();
}

function anillo(frac, color, size = 148, r = 62, w = 15) {
  const c = 2 * Math.PI * r, f = Math.max(0, Math.min(1, frac || 0));
  return `<svg viewBox="0 0 ${size} ${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--card2)" stroke-width="${w}"/>${f > 0 ? `<circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-dasharray="${(c * f).toFixed(1)} ${c.toFixed(1)}"/>` : ''}</svg>`;
}
const anilloChico = (frac, color) => `<div class="progreso-habito">${anillo(frac, color, 30, 12, 4)}</div>`;

function navDia() {
  const esHoy = ui.dia >= hoyISO();
  return `<div class="navdia"><button data-accion="dia" data-n="-1" aria-label="Día anterior">${IC.izq}</button>
    <span class="fecha">${esc(nombreDia(ui.dia))}</span>
    <button data-accion="dia" data-n="1" ${esHoy ? 'disabled' : ''} aria-label="Día siguiente">${IC.der}</button></div>`;
}

function barraMacro(nombre, valor, meta, color) {
  return `<div class="macro"><div class="etq"><span>${nombre}</span></div>
    <div class="num">${fmt(valor)}${meta ? ` <small>/ ${fmt(meta)} g</small>` : ' <small>g</small>'}</div>
    <div class="barra"><i style="width:${meta ? Math.min(100, (valor / meta) * 100) : 0}%;background:${color}"></i></div></div>`;
}

function vistaHoy() {
  const m = metas();
  const t = totalesDia(ui.dia);
  const comidas = S.comidas.filter((c) => c.fecha === ui.dia).sort((a, b) => (a.hora || '').localeCompare(b.hora || ''));
  const restante = m ? m.kcal - Math.round(t.k) : null;
  const pasado = m && t.k > m.kcal;
  const hab = soloHabitos();
  const hechos = hab.filter((h) => cumplido(h, ui.dia)).length;

  let html = `<div class="vista">
    <div class="cabecera"><div><div class="sub">${esc(fechaLarga(ui.dia))}</div><h1>${esc(S.perfil.nombre ? 'Hola, ' + S.perfil.nombre.split(' ')[0] : 'Resumen')}</h1></div></div>
    ${navDia()}
    ${listaRecordatorios()}`;

  if (soloRecordatorios().length) html += `<div class="titulo-seccion">Calorías</div>`;
  if (!m) {
    html += `<div class="aviso alerta"><strong>Completá tu perfil</strong> (sexo, edad, altura, peso y objetivo) para calcular tus calorías y macros diarios.
      <button class="btn gris" style="margin-top:12px" data-accion="tab" data-tab="perfil">Ir a Perfil</button></div>`;
  }

  html += `<div class="tarjeta"><div class="resumen">
      <div class="anillo">${anillo(m ? t.k / m.kcal : 0, pasado ? 'var(--orange)' : 'var(--accent)')}
        <div class="centro"><div class="num">${fmt(m ? Math.abs(restante) : t.k)}</div>
        <div class="etq">${m ? (restante >= 0 ? 'kcal restantes' : 'kcal de más') : 'kcal consumidas'}</div></div></div>
      <div class="datos-anillo">
        <div class="dato"><div class="etq">Meta</div><div class="num">${m ? fmt(m.kcal) : '–'}</div></div>
        <div class="dato"><div class="etq">Consumido</div><div class="num">${fmt(t.k)}</div></div>
        <div class="dato"><div class="etq">Objetivo</div><div class="num" style="font-size:16px">${esc(OBJETIVOS[S.perfil.objetivo] || '')}</div></div>
      </div></div>
    <div class="macros">${barraMacro('Proteínas', t.p, m && m.prot, 'var(--prot)')}${barraMacro('Carbohidratos', t.c, m && m.carb, 'var(--carb)')}${barraMacro('Grasas', t.g, m && m.grasa, 'var(--fat)')}</div>
  </div>`;

  if (m && ui.dia === hoyISO()) html += htmlIdeas(m, t);

  html += `<div class="titulo-seccion">Comidas</div>`;
  if (!comidas.length) {
    html += `<div class="lista"><div class="vacio">Todavía no registraste comidas ${ui.dia === hoyISO() ? 'hoy' : 'este día'}.</div></div>
      <button class="btn secundario btn-ico" data-accion="nueva" style="margin-bottom:16px">${IC.mas}Agregar comida</button>`;
  } else {
    html += `<div class="lista">${comidas.map((c) => `<button class="fila" data-accion="editar" data-id="${c.id}">
        ${c.foto ? `<img class="miniatura" data-foto="${c.id}" alt="">` : `<div class="miniatura vacia">${IC.plato}</div>`}
        <div class="crece"><div class="principal">${esc(c.nombre)}</div>
        <div class="secundario">${esc(c.tipo)} · ${esc(c.hora || '')} · P ${fmt(c.p)} · C ${fmt(c.c)} · G ${fmt(c.g)}</div></div>
        <span class="valor">${fmt(c.k)} kcal</span>${IC.chev}</button>`).join('')}</div>`;
  }

  html += `<div class="titulo-seccion">Hábitos</div>
    <div class="lista"><button class="fila" data-accion="tab" data-tab="habitos">
      ${anilloChico(hab.length ? hechos / hab.length : 0, 'var(--accent)')}
      <div class="crece"><div class="principal">${hechos} de ${hab.length} cumplidos</div>
      <div class="secundario">${esc(hab.filter((h) => !cumplido(h, ui.dia)).map((h) => h.n).slice(0, 3).join(', ') || 'Todo al día')}</div></div>${IC.chev}</button></div>
  </div>
  <button class="fab" data-accion="nueva" aria-label="Agregar comida">${IC.mas}</button>`;
  return html;
}

/* ---------- Ideas de recetas ---------- */
function ideasRecetas(m, t) {
  const faltaP = Math.max(0, m.prot - t.p), faltaK = m.kcal - t.k;
  const hora = new Date().getHours() + new Date().getMinutes() / 60;
  const momento = (hora < 11 || (hora >= 15.5 && hora < 19.5)) ? 'dia' : 'comida';
  return window.RECETAS.map((r) => {
    let punt = (Math.min(r.p, faltaP) / (faltaP || 1)) * 3 + (r.p / r.k) * 25;
    if (r.k > faltaK) punt -= ((r.k - faltaK) / 100) * 1.5;
    if (r.m === momento) punt += 0.8;
    return { r, punt };
  }).sort((a, b) => b.punt - a.punt).map((x) => x.r);
}
function filaReceta(r) {
  return `<button class="fila" data-accion="receta" data-n="${esc(r.n)}">
    <div class="crece"><div class="principal">${esc(r.n)}</div>
    <div class="secundario"><span style="color:var(--prot);font-weight:600">${fmt(r.p)} g proteína</span> · ${fmt(r.k)} kcal · ${r.min} min</div></div>${IC.chev}</button>`;
}
function htmlIdeas(m, t) {
  const faltaP = Math.round(m.prot - t.p), faltaK = Math.round(m.kcal - t.k);
  if (faltaK < 150 && faltaP < 15) return '';
  const top = ideasRecetas(m, t).slice(0, 3);
  return `<div class="titulo-seccion">Ideas para completar tus macros</div>
    <p class="nota-seccion" style="margin-top:0">Te faltan ${faltaP > 0 ? `<strong>${fmt(faltaP)} g de proteína</strong> y ` : ''}${fmt(Math.max(0, faltaK))} kcal hoy.</p>
    <div class="lista">${top.map(filaReceta).join('')}
      <button class="fila" data-accion="ideas-todas"><span class="crece" style="color:var(--blue)">Ver todas las recetas</span>${IC.chev}</button></div>`;
}
function htmlReceta(r) {
  return `<div class="tarjeta"><div class="totales">
      <div><div class="num">${fmt(r.k)}</div><div class="etq">kcal</div></div>
      <div><div class="num" style="color:var(--prot)">${fmt(r.p)}</div><div class="etq">Prot. g</div></div>
      <div><div class="num" style="color:var(--carb)">${fmt(r.c)}</div><div class="etq">Carb. g</div></div>
      <div><div class="num" style="color:var(--fat)">${fmt(r.g)}</div><div class="etq">Grasa g</div></div></div>
      <div style="color:var(--text2);font-size:13px;margin-top:12px;text-align:center">Una porción · ${r.min} minutos</div></div>
    <div class="titulo-seccion">Ingredientes</div>
    <div class="lista">${r.ing.map((i) => `<div class="fila"><span class="crece" style="white-space:normal">${esc(i)}</span></div>`).join('')}</div>
    <div class="titulo-seccion">Preparación</div>
    <div class="lista">${r.pasos.map((p, i) => `<div class="fila" style="align-items:flex-start"><span style="color:var(--accent-ink);font-weight:700;min-width:18px">${i + 1}</span><span class="crece" style="white-space:normal">${esc(p)}</span></div>`).join('')}</div>
    <button class="btn" data-accion="receta-agregar" data-n="${esc(r.n)}">La comí: agregar a hoy</button>
    <p class="nota-seccion" style="margin-top:10px">Valores aproximados. Después la podés editar como cualquier comida.</p>`;
}

function puntosSemana(h) {
  let s = '';
  for (let i = 6; i >= 0; i--) { const d = sumarDias(ui.dia, -i); s += `<i class="${cumplido(h, d) ? 'si' : ''}"></i>`; }
  return `<div class="puntos">${s}</div>`;
}

function filaHabito(h) {
  const v = valorHabito(h, ui.dia);
  const rch = racha(h);
  const info = `<div class="crece"><div class="principal">${esc(h.n)}</div>
    ${h.tipo !== 'check' ? `<div class="secundario">Meta: ${fmt(h.meta, 1)} ${esc(h.u)}${rch > 1 ? ` · <span class="racha">${rch} días seguidos</span>` : ''}</div>`
      : (rch > 1 ? `<div class="secundario"><span class="racha">${rch} días seguidos</span></div>` : '')}
    ${puntosSemana(h)}</div>`;
  if (h.tipo === 'check') {
    return `<div class="habito"><button class="check ${v ? 'hecho' : ''}" data-accion="hab-toggle" data-id="${h.id}" aria-label="Marcar ${esc(h.n)}">${IC.check}</button>${info}</div>`;
  }
  const frac = num(h.meta) ? v / num(h.meta) : 0;
  const lado = h.tipo === 'contador'
    ? `<div class="contador"><button data-accion="hab-menos" data-id="${h.id}" aria-label="Restar">−</button><span class="v">${fmt(v, 1)}</span><button data-accion="hab-mas" data-id="${h.id}" aria-label="Sumar">+</button></div>`
    : `<input class="entrada-num" inputmode="decimal" data-hab-num="${h.id}" value="${v ? esc(String(v).replace('.', ',')) : ''}" placeholder="0" aria-label="${esc(h.n)}">`;
  return `<div class="habito">${anilloChico(frac, frac >= 1 ? 'var(--accent)' : 'var(--blue)')}${info}${lado}</div>`;
}

function filaRecordatorio(h) {
  const hecho = cumplido(h, ui.dia);
  const atrasado = !hecho && h.rec && ui.dia === hoyISO() && h.rec <= horaActual();
  const rch = racha(h);
  return `<div class="habito"><button class="check ${hecho ? 'hecho' : ''}" data-accion="hab-toggle" data-id="${h.id}" aria-label="Marcar ${esc(h.n)}">${IC.check}</button>
    <div class="crece"><div class="principal" ${hecho ? 'style="color:var(--text2)"' : ''}>${esc(h.n)}</div>
    <div class="secundario">${h.rec ? `<span ${atrasado ? 'style="color:var(--orange);font-weight:600"' : ''}>${esc(h.rec)}</span>` : 'Sin hora'}${rch > 1 ? ` · <span class="racha">${rch} días seguidos</span>` : ''}</div></div></div>`;
}
function listaRecordatorios() {
  const r = soloRecordatorios();
  if (!r.length) return '';
  const pend = r.filter((h) => !cumplido(h, ui.dia)).length;
  return `<div class="titulo-seccion">Recordatorios${pend ? ` · ${pend} pendiente${pend > 1 ? 's' : ''}` : ''}</div>
    <div class="lista">${r.map(filaRecordatorio).join('')}</div>`;
}

function vistaHabitos() {
  const conRec = S.habitos.filter((h) => h.rec).sort((a, b) => a.rec.localeCompare(b.rec));
  const permiso = 'Notification' in window ? Notification.permission : 'no';
  return `<div class="vista">
    <div class="cabecera"><div><div class="sub">${esc(fechaLarga(ui.dia))}</div><h1>Hábitos</h1></div>
      <button class="boton-texto" data-accion="editar-habitos">Editar</button></div>
    ${navDia()}
    ${listaRecordatorios()}
    <div class="titulo-seccion">Hábitos</div>
    <div class="lista">${soloHabitos().map(filaHabito).join('') || '<div class="vacio">No hay hábitos. Tocá Editar para agregar.</div>'}</div>

    <div class="titulo-seccion">Alarmas</div>
    <div class="lista">${conRec.length ? conRec.map((h) => `<div class="fila"><div class="crece"><div class="principal">${esc(h.n)}</div></div><span class="valor">${esc(h.rec)}</span></div>`).join('')
      : '<div class="vacio">Nada tiene horario. Tocá Editar para asignar uno.</div>'}</div>
    <button class="btn" data-accion="ics" ${conRec.length ? '' : 'disabled'}>Agregar alarmas al Calendario</button>
    <p class="nota-seccion" style="margin-top:8px">Recomendado en iPhone: crea un evento diario con alarma por cada recordatorio y hábito con hora. Suena siempre, aunque la app esté cerrada y sin internet.</p>
    <button class="btn secundario" data-accion="permiso-avisos" ${permiso === 'granted' || permiso === 'no' ? 'disabled' : ''}>${permiso === 'granted' ? 'Avisos de la app activados' : permiso === 'no' ? 'Este navegador no permite avisos' : 'Activar avisos de la app'}</button>
    <p class="nota-seccion" style="margin-top:8px">Los avisos propios de la app solo saltan mientras está abierta (en iPhone, además, tiene que estar instalada en la pantalla de inicio).</p>
  </div>`;
}

function grafPeso() {
  const ps = S.pesos.filter((p) => difDias(p.fecha, hoyISO()) <= 120);
  if (ps.length < 2) return `<div class="vacio">Registrá tu peso al menos dos días para ver la curva.</div>`;
  const W = 340, H = 170, pl = 30, pr = 10, pt = 10, pb = 22;
  const meta = num(S.perfil.pesoMeta);
  const ys = ps.map((p) => p.kg).concat(meta && Math.abs(meta - ps[ps.length - 1].kg) < 8 ? [meta] : []);
  let min = Math.floor(Math.min(...ys) - 0.5), max = Math.ceil(Math.max(...ys) + 0.5);
  if (max - min < 2) { max += 1; min -= 1; }
  const d0 = ps[0].fecha, dias = Math.max(1, difDias(d0, ps[ps.length - 1].fecha));
  const X = (f) => pl + (difDias(d0, f) / dias) * (W - pl - pr);
  const Y = (kg) => pt + (1 - (kg - min) / (max - min)) * (H - pt - pb);
  const linea = ps.map((p, i) => `${i ? 'L' : 'M'}${X(p.fecha).toFixed(1)},${Y(p.kg).toFixed(1)}`).join(' ');
  const area = `${linea} L${X(ps[ps.length - 1].fecha).toFixed(1)},${H - pb} L${pl},${H - pb} Z`;
  let guias = '';
  for (let i = 0; i <= 3; i++) {
    const v = min + ((max - min) * i) / 3, y = Y(v);
    guias += `<line x1="${pl}" x2="${W - pr}" y1="${y}" y2="${y}" stroke="var(--sep)" stroke-width="0.5"/><text x="${pl - 5}" y="${y + 3}" text-anchor="end">${fmt(v, 1)}</text>`;
  }
  const lineaMeta = meta && meta >= min && meta <= max
    ? `<line x1="${pl}" x2="${W - pr}" y1="${Y(meta)}" y2="${Y(meta)}" stroke="var(--accent)" stroke-dasharray="4 4" stroke-width="1"/><text x="${W - pr}" y="${Y(meta) - 4}" text-anchor="end">meta</text>` : '';
  return `<div class="grafico"><svg viewBox="0 0 ${W} ${H}">
    <defs><linearGradient id="gp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--blue)" stop-opacity=".25"/><stop offset="1" stop-color="var(--blue)" stop-opacity="0"/></linearGradient></defs>
    ${guias}${lineaMeta}<path d="${area}" fill="url(#gp)"/><path d="${linea}" fill="none" stroke="var(--blue)" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>
    ${ps.map((p) => `<circle cx="${X(p.fecha).toFixed(1)}" cy="${Y(p.kg).toFixed(1)}" r="2.6" fill="var(--blue)"/>`).join('')}
    <text x="${pl}" y="${H - 6}">${esc(fechaCorta(d0))}</text><text x="${W - pr}" y="${H - 6}" text-anchor="end">${esc(fechaCorta(ps[ps.length - 1].fecha))}</text>
  </svg></div>`;
}

function grafCalorias(m) {
  const W = 340, H = 140, pb = 20, pt = 10;
  const dias = [...Array(7)].map((_, i) => sumarDias(hoyISO(), i - 6));
  const vals = dias.map((d) => totalesDia(d).k);
  const max = Math.max(m ? m.kcal * 1.2 : 0, ...vals, 500);
  const ancho = (W - 20) / 7;
  const Y = (v) => pt + (1 - v / max) * (H - pt - pb);
  return `<div class="grafico"><svg viewBox="0 0 ${W} ${H}">
    ${dias.map((d, i) => {
      const v = vals[i], x = 10 + i * ancho + ancho * 0.22, w = ancho * 0.56;
      const col = m && v > m.kcal * 1.05 ? 'var(--orange)' : 'var(--accent)';
      return `${v ? `<rect x="${x}" y="${Y(v)}" width="${w}" height="${H - pb - Y(v)}" rx="4" fill="${col}"/>` : `<rect x="${x}" y="${H - pb - 3}" width="${w}" height="3" rx="1.5" fill="var(--card2)"/>`}
        <text x="${x + w / 2}" y="${H - 5}" text-anchor="middle">${esc(aFecha(d).toLocaleDateString('es-AR', { weekday: 'narrow' }).toUpperCase())}</text>`;
    }).join('')}
    ${m ? `<line x1="10" x2="${W - 10}" y1="${Y(m.kcal)}" y2="${Y(m.kcal)}" stroke="var(--text2)" stroke-dasharray="4 4" stroke-width="1"/><text x="${W - 10}" y="${Y(m.kcal) - 4}" text-anchor="end">meta ${fmt(m.kcal)}</text>` : ''}
  </svg></div>`;
}

function vistaProgreso() {
  const m = metas();
  const ps = S.pesos;
  const actual = pesoActual();
  const inicial = ps.length ? ps[0].kg : 0;
  const cambio = ps.length > 1 ? actual - inicial : 0;
  const alt = num(S.perfil.altura) / 100;
  const imc = alt && actual ? actual / (alt * alt) : 0;
  // ritmo de las últimas 4 semanas
  let ritmo = null;
  const rec = ps.filter((p) => difDias(p.fecha, hoyISO()) <= 28);
  if (rec.length >= 2 && difDias(rec[0].fecha, rec[rec.length - 1].fecha) >= 6) {
    ritmo = ((rec[rec.length - 1].kg - rec[0].kg) / difDias(rec[0].fecha, rec[rec.length - 1].fecha)) * 7;
  }
  const meta = num(S.perfil.pesoMeta);
  const dias7 = [...Array(7)].map((_, i) => sumarDias(hoyISO(), i - 6));
  const conDatos = dias7.filter((d) => totalesDia(d).k > 0);
  const prom = conDatos.length ? conDatos.reduce((a, d) => a + totalesDia(d).k, 0) / conDatos.length : 0;
  const totHab = soloHabitos().length * 7;
  const hechosHab = dias7.reduce((a, d) => a + soloHabitos().filter((h) => cumplido(h, d)).length, 0);
  const color = (v) => { if (!v) return ''; const bueno = S.perfil.objetivo === 'ganar' ? v > 0 : v < 0; return bueno ? 'verde' : 'rojo'; };

  return `<div class="vista">
    <div class="cabecera"><div><div class="sub">Evolución</div><h1>Progreso</h1></div></div>
    <div class="titulo-seccion">Peso</div>
    <div class="tarjeta">${grafPeso()}
      <div class="estadisticas">
        <div><div class="etq">Actual</div><div class="num">${actual ? fmt(actual, 1) : '–'}<small style="font-size:13px;font-weight:400"> kg</small></div></div>
        <div><div class="etq">Cambio total</div><div class="num ${color(cambio)}">${ps.length > 1 ? (cambio > 0 ? '+' : '') + fmt(cambio, 1) : '–'}</div></div>
        <div><div class="etq">Por semana</div><div class="num ${color(ritmo)}">${ritmo === null ? '–' : (ritmo > 0 ? '+' : '') + fmt(ritmo, 2)}</div></div>
        <div><div class="etq">IMC</div><div class="num">${imc ? fmt(imc, 1) : '–'}</div></div>
        <div><div class="etq">Meta</div><div class="num">${meta ? fmt(meta, 1) : '–'}</div></div>
        <div><div class="etq">Falta</div><div class="num">${meta && actual ? fmt(Math.abs(actual - meta), 1) : '–'}</div></div>
      </div></div>
    <div class="lista">
      <div class="fila"><span class="crece">Fecha</span><input type="date" id="peso-fecha" value="${hoyISO()}" max="${hoyISO()}" style="width:auto"></div>
      <div class="fila"><span class="crece">Peso (kg)</span><input id="peso-kg" inputmode="decimal" placeholder="${actual ? esc(String(actual).replace('.', ',')) : '0,0'}"></div>
    </div>
    <button class="btn" data-accion="peso-registrar">Registrar peso</button>
    ${ps.length ? `<div class="titulo-seccion">Registros</div><div class="lista">${ps.slice(-8).reverse().map((p) =>
      `<button class="fila" data-accion="peso-borrar" data-fecha="${p.fecha}"><span class="crece">${esc(nombreDia(p.fecha))}</span><span class="valor">${fmt(p.kg, 1)} kg</span></button>`).join('')}</div>
      <p class="nota-seccion">Tocá un registro para borrarlo.</p>` : ''}

    <div class="titulo-seccion">Calorías, últimos 7 días</div>
    <div class="tarjeta">${grafCalorias(m)}
      <div class="estadisticas"><div><div class="etq">Promedio</div><div class="num">${prom ? fmt(prom) : '–'}</div></div>
      <div><div class="etq">Meta</div><div class="num">${m ? fmt(m.kcal) : '–'}</div></div>
      <div><div class="etq">Hábitos</div><div class="num">${totHab ? Math.round((hechosHab / totHab) * 100) + '%' : '–'}</div></div></div>
    </div>
  </div>`;
}

function filaSelect(etq, campo, opciones, valor) {
  return `<div class="fila"><span class="crece">${etq}</span><select data-perfil="${campo}">${opciones.map(([v, n]) =>
    `<option value="${esc(v)}" ${String(v) === String(valor) ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select></div>`;
}
function filaNum(etq, campo, valor, ph) {
  return `<div class="fila"><span class="crece">${etq}</span><input inputmode="decimal" data-perfil="${campo}" value="${valor ? esc(String(valor).replace('.', ',')) : ''}" placeholder="${ph}"></div>`;
}

function vistaPerfil() {
  const p = S.perfil, m = metas();
  return `<div class="vista">
    <div class="cabecera"><div><div class="sub">Tus datos</div><h1>Perfil</h1></div></div>
    <div class="titulo-seccion">Objetivo</div>
    <div class="segmentado dos-filas">${Object.entries(OBJETIVOS).map(([k, n]) => `<button class="${p.objetivo === k ? 'activo' : ''}" data-accion="objetivo" data-v="${k}">${n}</button>`).join('')}</div>

    <div class="titulo-seccion">Datos</div>
    <div class="lista">
      ${filaSelect('Sexo', 'sexo', [['', 'Elegir'], ['m', 'Masculino'], ['f', 'Femenino']], p.sexo)}
      ${filaNum('Edad', 'edad', p.edad, 'años')}
      ${filaNum('Altura', 'altura', p.altura, 'cm')}
      ${filaNum('Peso actual', 'peso', pesoActual() || '', 'kg')}
      ${filaNum('Peso meta', 'pesoMeta', p.pesoMeta, 'kg (opcional)')}
      ${filaSelect('Actividad', 'actividad', ACTIVIDAD.map(([v, n]) => [v, n]), p.actividad)}
      ${p.objetivo === 'bajar' || p.objetivo === 'ganar' ? filaSelect('Ritmo', 'ritmo', [['suave', p.objetivo === 'ganar' ? 'Limpio' : 'Tranquilo'], ['moderado', 'Moderado'], ['rapido', 'Rápido']], p.ritmo || 'moderado') : ''}
    </div>
    <p class="nota-seccion">${esc((ACTIVIDAD.find(([v]) => String(v) === String(p.actividad)) || ACTIVIDAD[1])[2])}.</p>

    <div class="titulo-seccion">Tu plan diario</div>
    ${m ? `<div class="tarjeta"><div class="resumen" style="gap:12px">
        <div style="flex:1"><div class="sub" style="color:var(--text2);font-size:13px">Meta de calorías</div>
        <div style="font-size:40px;font-weight:700;font-variant-numeric:tabular-nums">${fmt(m.kcal)}<span style="font-size:17px;font-weight:500;color:var(--text2)"> kcal</span></div>
        <div style="color:var(--text2);font-size:13px">Mantenimiento ${fmt(m.mant)} · Metabolismo basal ${fmt(m.tmb)}</div></div></div>
        <div class="totales" style="grid-template-columns:repeat(3,1fr);margin-top:16px">
          <div><div class="num" style="color:var(--prot)">${m.prot} g</div><div class="etq">Proteínas</div></div>
          <div><div class="num" style="color:var(--carb)">${m.carb} g</div><div class="etq">Carbohidratos</div></div>
          <div><div class="num" style="color:var(--fat)">${m.grasa} g</div><div class="etq">Grasas</div></div></div></div>`
      : '<div class="aviso">Completá sexo, edad, altura y peso para calcular tu plan.</div>'}
    <div class="lista">${filaNum('Meta manual', 'kcalManual', p.kcalManual, 'kcal (opcional)')}</div>
    <p class="nota-seccion">Cálculo con la fórmula Mifflin-St Jeor: ${m && m.kcal !== m.mant ? (m.kcal < m.mant ? 'déficit' : 'superávit') + ' del ' + Math.abs(Math.round((m.kcal / m.mant - 1) * 100)) + '%' : 'sin ajuste'}, proteína de ${{ bajar: '2,0', recomp: '2,2', mantener: '1,6', ganar: '1,8' }[p.objetivo]} g por kilo. Es una estimación: revisala con la evolución del peso cada 2 o 3 semanas. No reemplaza la consulta con un profesional.</p>

    <div class="titulo-seccion">Cuenta</div>
    <div class="lista">
      <div class="fila"><span class="crece">Mail</span><span class="valor">${esc(sesion ? sesion.user.email : '')}</span></div>
      <button class="fila" data-accion="rehacer-cuestionario"><span class="crece" style="color:var(--blue)">Volver a hacer el cuestionario</span>${IC.chev}</button>
      <button class="fila" data-accion="cerrar-sesion"><span class="crece" style="color:var(--red)">Cerrar sesión</span></button>
    </div>

    <div class="titulo-seccion">Copia de seguridad</div>
    <div class="lista">
      <button class="fila" data-accion="exportar"><span class="crece" style="color:var(--blue)">Exportar mis datos</span></button>
      <label class="fila"><span class="crece" style="color:var(--blue)">Importar una copia</span><input type="file" id="archivo-importar" accept="application/json,.json" class="oculto"></label>
      <button class="fila" data-accion="borrar-todo"><span class="crece" style="color:var(--red)">Borrar todos los datos</span></button>
    </div>
    <p class="nota-seccion">Tus datos se guardan en tu cuenta, así que los ves desde cualquier teléfono donde ingreses. Las fotos de las comidas quedan solo en este teléfono.</p>

    <div class="titulo-seccion">Instalar</div>
    <div class="aviso">En iPhone: abrí la app en Safari, tocá Compartir y elegí <strong>Agregar a inicio</strong>. En Android: menú de Chrome, <strong>Instalar app</strong>.</div>
  </div>`;
}

/* ---------- Hoja modal ---------- */
let hojaActual = null;
function abrirHoja({ titulo, izq = 'Cancelar', der = '', accionDer = '', cuerpo }) {
  cerrarHoja(true);
  const velo = document.createElement('div');
  velo.className = 'velo';
  velo.dataset.accion = 'cerrar-hoja';
  const hoja = document.createElement('div');
  hoja.className = 'hoja';
  hoja.setAttribute('role', 'dialog');
  hoja.innerHTML = `<div class="asa"></div><div class="barra-hoja">
      <button class="boton-texto izq" data-accion="cerrar-hoja">${esc(izq)}</button><h2>${esc(titulo)}</h2>
      ${der ? `<button class="boton-texto der" data-accion="${accionDer}">${esc(der)}</button>` : '<span></span>'}</div>
    <div class="cuerpo" id="hoja-cuerpo">${cuerpo}</div>`;
  document.body.append(velo, hoja);
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => { velo.classList.add('visible'); hoja.classList.add('visible'); });
  hojaActual = { velo, hoja };
}
function cerrarHoja(inmediato) {
  if (!hojaActual) return;
  const { velo, hoja } = hojaActual;
  hojaActual = null;
  document.body.style.overflow = '';
  if (inmediato) { velo.remove(); hoja.remove(); return; }
  velo.classList.remove('visible'); hoja.classList.remove('visible');
  setTimeout(() => { velo.remove(); hoja.remove(); }, 320);
}

/* ---------- Editor de comidas ---------- */
let ed = null;

function abrirEditor(comida) {
  if (comida) {
    ed = { ...JSON.parse(JSON.stringify(comida)), foto: null, aviso: '', nuevo: false };
    if (comida.foto) fotoLeer(comida.id).then((f) => { if (ed && ed.id === comida.id && f) { ed.foto = f; pintarEditor(); } });
  } else {
    ed = { id: null, fecha: ui.dia, hora: ui.dia === hoyISO() ? horaActual() : '13:00', tipo: tipoPorHora(), nombre: '', items: [],
      foto: null, aviso: '', nuevo: true };
  }
  abrirHoja({ titulo: comida ? 'Editar comida' : 'Nueva comida', der: 'Guardar', accionDer: 'ed-guardar', cuerpo: htmlEditor() });
}
function pintarEditor() {
  const c = $('#hoja-cuerpo');
  if (c && ed) { const y = c.scrollTop; c.innerHTML = htmlEditor(); c.scrollTop = y; }
}

const normalizar = (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const alimentosTodos = () => [...(S.misAlimentos || []).map((a) => ({ ...a, mio: true })), ...window.ALIMENTOS];
function htmlResultados(q) {
  const palabras = normalizar(q).split(/\s+/).filter((w) => w.length > 1 && !['de', 'con', 'la', 'el', 'al', 'y'].includes(w));
  const lista = alimentosTodos().filter((a) => { const n = normalizar(a.n); return palabras.every((w) => n.includes(w)); })
    .slice(0, palabras.length ? 40 : 12);
  if (!lista.length) return '<div class="vacio">Sin resultados. Agregalo a mano abajo y queda guardado para la próxima.</div>';
  return lista.map((a) => `<button class="fila" data-accion="ed-agregar-base" data-n="${esc(a.n)}">
    <div class="crece"><div class="principal">${esc(a.n)}</div><div class="secundario">${a.mio ? '<span style="color:var(--accent-ink);font-weight:600">Tuyo</span> · ' : ''}${esc(a.por)} · P ${fmt(a.p, 1)} · C ${fmt(a.c, 1)} · G ${fmt(a.g, 1)}</div></div>
    <span class="valor">${fmt(a.k)} kcal</span><span style="color:var(--accent-ink);font-size:22px;line-height:1">+</span></button>`).join('');
}

function htmlEditor() {
  const t = totalesItems(ed.items);
  let h = '';
  h += ed.foto
    ? `<img class="foto-grande" src="${ed.foto}" alt="Foto de la comida">
      <div class="fila-botones"><label class="btn gris btn-ico">${IC.camara}Cambiar foto<input type="file" accept="image/*" class="oculto archivo-foto"></label>
      <button class="btn gris" data-accion="ed-sin-foto" style="color:var(--red)">Quitar foto</button></div>`
    : `<div class="fila-botones">
      <label class="btn gris btn-ico">${IC.camara}Sacar foto<input type="file" accept="image/*" capture="environment" class="oculto archivo-foto"></label>
      <label class="btn gris btn-ico">${IC.galeria}Galería<input type="file" accept="image/*" class="oculto archivo-foto"></label></div>`;
  if (ed.foto && ed.fotoIA) {
    h += ed.estimando
      ? `<div class="cargando"><div class="ruedita"></div>Estimando la comida…</div>`
      : `<div class="lista"><div class="fila"><input id="ed-detalle" class="izq" value="${esc(ed.detalle || '')}" placeholder="Detalle opcional (ej.: 2 empanadas de carne)"></div></div>
        <button class="btn btn-ico" data-accion="ed-estimar" style="margin-bottom:16px">${IC.chispa}${ed.items.some((i) => i.ia) ? 'Volver a estimar' : 'Estimar con IA'}</button>`;
  }
  if (ed.aviso) h += `<div class="aviso ${ed.avisoTipo || ''}">${ed.aviso}</div>`;
  h += `<div class="buscador">${IC.lupa}<input id="busqueda" placeholder="Buscar: pollo, arroz, empanada…" autocomplete="off"></div>
    <div class="lista ${ed.items.length ? 'oculto' : ''}" id="resultados">${ed.items.length ? '' : htmlResultados('')}</div>
    <details class="lista" style="padding:0"><summary class="fila" style="color:var(--blue);list-style:none">Agregar alimento a mano</summary>
      <div style="padding:4px 0 12px">
        <div class="fila"><input id="ci-n" style="width:100%;text-align:left;color:var(--text)" placeholder="Nombre (ej.: Tarta de atún)"></div>
        <div class="campos-item">
          <label>kcal<input id="ci-k" inputmode="decimal" placeholder="0"></label>
          <label>Prot. g<input id="ci-p" inputmode="decimal" placeholder="0"></label>
          <label>Carb. g<input id="ci-c" inputmode="decimal" placeholder="0"></label>
          <label>Grasa g<input id="ci-g" inputmode="decimal" placeholder="0"></label>
        </div>
        <div style="padding:0 16px"><button class="btn gris" data-accion="ed-agregar-manual">Agregar</button></div>
      </div></details>`;


  h += `<div class="titulo-seccion">En este plato</div>`;
  if (ed.items.length) {
    h += `<div class="lista">${ed.items.map((it, i) => `<div class="fila">
      <div class="crece"><div class="principal">${esc(it.n)}</div>
      <div class="secundario">${esc(it.por || '')}${it.por ? ' · ' : ''}${fmt(it.k * (it.x ?? 1))} kcal · P ${fmt(it.p * (it.x ?? 1), 1)} · C ${fmt(it.c * (it.x ?? 1), 1)} · G ${fmt(it.g * (it.x ?? 1), 1)}</div>
      <button class="quitar" data-accion="ed-quitar" data-i="${i}">Quitar</button></div>
      <div class="mult"><button data-accion="ed-mult" data-i="${i}" data-d="-1" aria-label="Menos">−</button><span>×${fmt(it.x ?? 1, 2)}</span><button data-accion="ed-mult" data-i="${i}" data-d="1" aria-label="Más">+</button></div>
    </div>`).join('')}</div>
    <div class="tarjeta"><div class="totales">
      <div><div class="num">${fmt(t.k)}</div><div class="etq">kcal</div></div>
      <div><div class="num" style="color:var(--prot)">${fmt(t.p, 1)}</div><div class="etq">Prot. g</div></div>
      <div><div class="num" style="color:var(--carb)">${fmt(t.c, 1)}</div><div class="etq">Carb. g</div></div>
      <div><div class="num" style="color:var(--fat)">${fmt(t.g, 1)}</div><div class="etq">Grasa g</div></div></div></div>`;
  } else {
    h += `<div class="lista"><div class="vacio">Buscá y tocá un alimento para sumarlo.</div></div>`;
  }

  h += `<div class="titulo-seccion">Detalles</div><div class="lista">
    <div class="fila"><span class="crece">Comida</span><select data-ed="tipo">${TIPOS.map((x) => `<option ${x === ed.tipo ? 'selected' : ''}>${x}</option>`).join('')}</select></div>
    <div class="fila"><span class="crece">Nombre</span><input data-ed="nombre" value="${esc(ed.nombre)}" placeholder="Automático"></div>
    <div class="fila"><span class="crece">Fecha</span><input type="date" data-ed="fecha" value="${ed.fecha}" max="${hoyISO()}" style="width:auto"></div>
    <div class="fila"><span class="crece">Hora</span><input type="time" data-ed="hora" value="${ed.hora}" style="width:auto"></div>
  </div>
  <button class="btn" data-accion="ed-guardar">Guardar comida</button>
  ${ed.nuevo ? '' : '<button class="btn peligro" data-accion="ed-borrar">Eliminar comida</button>'}`;
  return h;
}

// Reduce la foto: una miniatura para guardar y una versión mediana para la estimación.
function leerImagen(archivo) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(archivo);
    const img = new Image();
    img.onload = () => {
      const a = (lado, q) => {
        const f = Math.min(1, lado / Math.max(img.naturalWidth, img.naturalHeight));
        const cv = document.createElement('canvas');
        cv.width = Math.round(img.naturalWidth * f); cv.height = Math.round(img.naturalHeight * f);
        cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
        return cv.toDataURL('image/jpeg', q);
      };
      const out = { mini: a(600, 0.75), grande: a(768, 0.72) };
      URL.revokeObjectURL(url);
      res(out);
    };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('No se pudo leer la imagen')); };
    img.src = url;
  });
}

/* Estimación por foto: la función "estimar-comida" de Supabase consulta a Gemini (plan gratis). */
const ERRORES_IA = {
  sin_clave: 'La estimación por foto todavía no está activada.',
  clave_invalida: 'La clave de Gemini no es válida. Hay que revisarla en Supabase.',
  limite: 'Se alcanzó el límite gratis de estimaciones por ahora. Probá más tarde o cargala con el buscador.',
  saturado: 'Gemini está saturado en este momento. Probá de nuevo en un rato o cargala con el buscador.',
  imagen_invalida: 'No se pudo leer la foto. Probá con otra.',
  sin_respuesta: 'No se pudo analizar esta foto. Probá con otra o cargala con el buscador.'
};
async function estimarFoto() {
  if (!ed || !ed.fotoIA || ed.estimando) return;
  const yo = ed;
  const det = $('#ed-detalle');
  if (det) ed.detalle = det.value;
  ed.estimando = true; ed.aviso = '';
  pintarEditor();
  let error = '';
  try {
    const tk = await tokenValido();
    if (!tk) throw new Error('Sin conexión: la estimación necesita internet. Podés cargarla con el buscador.');
    // Hasta 2 intentos con tope de tiempo, para que nunca quede esperando para siempre.
    let r, demoro = false;
    for (let intento = 0; intento < 2 && !r && !demoro; intento++) {
      const ctl = new AbortController();
      const t = setTimeout(() => ctl.abort(), 130000);
      try {
        r = await fetch(`${SB_URL}/functions/v1/estimar-comida`, {
          method: 'POST', signal: ctl.signal,
          headers: { apikey: SB_KEY, authorization: 'Bearer ' + tk, 'content-type': 'application/json' },
          body: JSON.stringify({ imagen: ed.fotoIA.split(',')[1], detalle: ed.detalle || '' })
        });
      } catch (e) { demoro = e.name === 'AbortError'; }
      clearTimeout(t);
    }
    if (!r) throw new Error(demoro ? 'La estimación tardó demasiado. Probá de nuevo o cargala con el buscador.' : 'Sin conexión: la estimación necesita internet. Podés cargarla con el buscador.');
    const d = await r.json().catch(() => ({}));
    if (!r.ok || d.error) throw new Error(ERRORES_IA[d.error] || 'No se pudo estimar en este momento. Probá de nuevo o cargala con el buscador.');
    if (ed !== yo) return;
    const items = (Array.isArray(d.items) ? d.items : []).map((it) => ({
      n: String(it.nombre || 'Alimento'), por: it.gramos ? `${Math.round(num(it.gramos))} g aprox.` : 'porción estimada',
      k: Math.round(num(it.kcal)), p: r1(num(it.proteinas)), c: r1(num(it.carbohidratos)), g: r1(num(it.grasas)), x: 1, ia: true
    }));
    ed.items = ed.items.filter((it) => !it.ia).concat(items);
    if (!ed.nombre && d.descripcion && items.length) ed.nombre = String(d.descripcion);
    ed.avisoTipo = items.length ? 'ok' : 'alerta';
    ed.aviso = items.length
      ? `<strong>Estimación aproximada${d.confianza ? ', confianza ' + esc(d.confianza) : ''}.</strong> ${esc(d.nota || '')} Corregí las porciones con − y +, o quitá y sumá alimentos.`
      : esc(d.nota || 'No se reconoció comida en la foto.');
  } catch (e) { error = e.message; }
  if (ed !== yo) return;
  ed.estimando = false;
  if (error) { ed.avisoTipo = 'alerta'; ed.aviso = esc(error); }
  pintarEditor();
}

function guardarComida() {
  if (!ed) return;
  if (!ed.items.length) { toast('Agregá al menos un alimento'); return; }
  const t = totalesItems(ed.items);
  const id = ed.id || uid();
  const nombre = (ed.nombre || '').trim() || ed.items.map((i) => i.n).join(', ').slice(0, 60);
  const previa = S.comidas.find((c) => c.id === id);
  const comida = {
    id, fecha: ed.fecha || ui.dia, hora: ed.hora || '', tipo: ed.tipo, nombre,
    items: ed.items.map(({ n, por, k, p, c, g, x }) => ({ n, por, k, p, c, g, x: x ?? 1 })), // la marca de IA no se guarda
    k: t.k, p: t.p, c: t.c, g: t.g, foto: !!ed.foto || (!ed.quitarFoto && !!(previa && previa.foto))
  };
  if (ed.foto) fotoGuardar(id, ed.foto);
  else if (ed.quitarFoto) fotoBorrar(id);
  S.comidas = S.comidas.filter((c) => c.id !== id).concat(comida);
  guardar();
  ui.dia = comida.fecha;
  ed = null;
  cerrarHoja();
  render();
  toast('Comida guardada');
}

/* ---------- Hábitos: edición y recordatorios ---------- */
function htmlEditarHabitos() {
  const recs = soloRecordatorios().map((h) => `<div class="lista">
    <div class="fila"><input data-hab-campo="n" data-id="${h.id}" value="${esc(h.n)}" style="width:100%;text-align:left;color:var(--text);font-weight:600" placeholder="Ej.: Tomar creatina"></div>
    <div class="fila"><span class="crece">Hora</span><input type="time" data-hab-campo="rec" data-id="${h.id}" value="${esc(h.rec)}" style="width:auto"></div>
    <button class="fila" data-accion="hab-borrar" data-id="${h.id}"><span class="crece" style="color:var(--red)">Eliminar recordatorio</span></button>
  </div>`).join('');
  const habs = soloHabitos().map((h) => `<div class="lista">
    <div class="fila"><input data-hab-campo="n" data-id="${h.id}" value="${esc(h.n)}" style="width:100%;text-align:left;color:var(--text);font-weight:600" placeholder="Nombre"></div>
    <div class="fila"><span class="crece">Tipo</span><select data-hab-campo="tipo" data-id="${h.id}">
      <option value="check" ${h.tipo === 'check' ? 'selected' : ''}>Marcar hecho</option>
      <option value="contador" ${h.tipo === 'contador' ? 'selected' : ''}>Contador (+/−)</option>
      <option value="numero" ${h.tipo === 'numero' ? 'selected' : ''}>Cantidad</option></select></div>
    ${h.tipo !== 'check' ? `<div class="fila"><span class="crece">Meta diaria</span><input inputmode="decimal" data-hab-campo="meta" data-id="${h.id}" value="${esc(String(h.meta).replace('.', ','))}"></div>
    <div class="fila"><span class="crece">Unidad</span><input data-hab-campo="u" data-id="${h.id}" value="${esc(h.u)}" placeholder="vasos, horas…"></div>` : ''}
    <div class="fila"><span class="crece">Alarma</span><input type="time" data-hab-campo="rec" data-id="${h.id}" value="${esc(h.rec)}" style="width:auto"></div>
    <button class="fila" data-accion="hab-borrar" data-id="${h.id}"><span class="crece" style="color:var(--red)">Eliminar hábito</span></button>
  </div>`).join('');
  return `<div class="titulo-seccion">Recordatorios</div>
  <p class="nota-seccion" style="margin-top:0">Tareas puntuales con hora, como tomar la creatina. Aparecen arriba de todo.</p>
  ${recs}<button class="btn gris" data-accion="rec-nuevo">Agregar recordatorio</button>
  <div class="titulo-seccion" style="margin-top:28px">Hábitos</div>
  ${habs}<button class="btn gris" data-accion="hab-nuevo">Agregar hábito</button>
  <p class="nota-seccion" style="margin-top:10px">Para quitar una alarma, borrá la hora. Después de cambiar horarios, volvé a agregar las alarmas al Calendario.</p>`;
}

function generarICS() {
  const ahora = new Date();
  const sello = ahora.toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const manana = sumarDias(hoyISO(), 0).replace(/-/g, '');
  const lineas = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Mi Dieta//ES', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'];
  for (const h of S.habitos.filter((x) => x.rec)) {
    const [hh, mm] = h.rec.split(':');
    lineas.push('BEGIN:VEVENT',
      `UID:mi-dieta-${h.id}@recordatorios`,
      `DTSTAMP:${sello}`,
      `DTSTART:${manana}T${hh}${mm}00`,
      'DURATION:PT5M',
      'RRULE:FREQ=DAILY',
      `SUMMARY:${h.n.replace(/[,;\\]/g, ' ')}`,
      'DESCRIPTION:Recordatorio de Mi Dieta',
      'TRANSP:TRANSPARENT',
      'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${h.n.replace(/[,;\\]/g, ' ')}`, 'TRIGGER:PT0M', 'END:VALARM',
      'END:VEVENT');
  }
  lineas.push('END:VCALENDAR');
  return lineas.join('\r\n');
}

// Avisos mientras la app está abierta
function revisarAvisos() {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const ahora = horaActual(), d = hoyISO();
  for (const h of S.habitos) {
    if (!h.rec || h.rec !== ahora || cumplido(h, d)) continue;
    const clave = d + h.id;
    if (S.avisados[clave]) continue;
    S.avisados = { [clave]: 1, ...Object.fromEntries(Object.entries(S.avisados).filter(([k]) => k.startsWith(d))) };
    guardar();
    const opciones = { body: h.grupo === 'rec' ? h.n : `Recordatorio: ${h.n}`, icon: 'icons/icon-192.png', tag: h.id };
    navigator.serviceWorker && navigator.serviceWorker.ready
      ? navigator.serviceWorker.ready.then((r) => r.showNotification('Mi Dieta', opciones))
      : new Notification('Mi Dieta', opciones);
  }
}

/* ---------- Peso ---------- */
function registrarPeso(fecha, kg) {
  S.pesos = S.pesos.filter((p) => p.fecha !== fecha).concat({ fecha, kg: r1(kg) }).sort((a, b) => a.fecha.localeCompare(b.fecha));
  S.perfil.peso = pesoActual();
  guardar();
}

/* ---------- Miniaturas ---------- */
function cargarMiniaturas() {
  document.querySelectorAll('img[data-foto]').forEach((img) => {
    fotoLeer(img.dataset.foto).then((f) => { if (f) img.src = f; else img.replaceWith(Object.assign(document.createElement('div'), { className: 'miniatura vacia', innerHTML: IC.plato })); });
  });
}

/* ---------- Acciones ---------- */
const ACCIONES = {
  tab(el) { ui.tab = el.dataset.tab; history.replaceState(null, '', '#' + ui.tab); render(); window.scrollTo(0, 0); },
  dia(el) { const n = sumarDias(ui.dia, +el.dataset.n); if (n <= hoyISO()) { ui.dia = n; render(); } },
  nueva() { abrirEditor(null); },
  editar(el) { const c = S.comidas.find((x) => x.id === el.dataset.id); if (c) abrirEditor(c); },
  receta(el) {
    const r = window.RECETAS.find((x) => x.n === el.dataset.n);
    if (r) abrirHoja({ titulo: 'Receta', izq: 'Cerrar', cuerpo: `<h2 style="font-size:22px;margin:4px 4px 14px">${esc(r.n)}</h2>` + htmlReceta(r) });
  },
  'ideas-todas'() {
    const m = metas(); if (!m) return;
    abrirHoja({ titulo: 'Recetas', izq: 'Cerrar', cuerpo: `<p class="nota-seccion" style="margin:0 4px 14px">Ordenadas según lo que te falta hoy.</p>
      <div class="lista">${ideasRecetas(m, totalesDia(hoyISO())).map(filaReceta).join('')}</div>` });
  },
  'receta-agregar'(el) {
    const r = window.RECETAS.find((x) => x.n === el.dataset.n); if (!r) return;
    S.comidas.push({ id: uid(), fecha: hoyISO(), hora: horaActual(), tipo: tipoPorHora(), nombre: r.n,
      items: [{ n: r.n, por: '1 porción', k: r.k, p: r.p, c: r.c, g: r.g, x: 1 }], k: r.k, p: r.p, c: r.c, g: r.g, foto: false });
    guardar(); ui.dia = hoyISO(); cerrarHoja(); render(); toast('Agregada a hoy');
  },
  'cerrar-hoja'() { ed = null; cerrarHoja(); render(); },
  'ed-sin-foto'() { ed.foto = null; ed.fotoIA = null; ed.quitarFoto = true; pintarEditor(); },
  'ed-estimar'() { estimarFoto(); },
  'ed-agregar-base'(el) {
    const a = alimentosTodos().find((x) => x.n === el.dataset.n);
    if (!a) return;
    ed.items.push({ n: a.n, por: a.por, k: a.k, p: a.p, c: a.c, g: a.g, x: 1 });
    const q = ($('#busqueda') || {}).value || '';
    pintarEditor();
    const b = $('#busqueda'); if (b && q) { b.value = q; const r = $('#resultados'); r.innerHTML = htmlResultados(q); r.classList.remove('oculto'); }
    toast(a.n + ' agregado');
  },
  'ed-agregar-manual'() {
    const n = $('#ci-n').value.trim();
    const it = { n: n || 'Alimento', por: '', k: Math.round(num($('#ci-k').value)), p: r1(num($('#ci-p').value)), c: r1(num($('#ci-c').value)), g: r1(num($('#ci-g').value)), x: 1 };
    if (!it.k && !it.p && !it.c && !it.g) { toast('Completá al menos las calorías'); return; }
    if (!it.k) it.k = Math.round(it.p * 4 + it.c * 4 + it.g * 9);
    ed.items.push(it);
    if (n) { // queda guardado en "tus alimentos" para buscarlo la próxima vez
      S.misAlimentos = (S.misAlimentos || []).filter((x) => normalizar(x.n) !== normalizar(n));
      S.misAlimentos.unshift({ n, por: '1 porción', k: it.k, p: it.p, c: it.c, g: it.g });
      guardar();
      toast('Guardado en tus alimentos');
    }
    pintarEditor();
  },
  'ed-quitar'(el) { ed.items.splice(+el.dataset.i, 1); pintarEditor(); },
  'ed-mult'(el) {
    const it = ed.items[+el.dataset.i];
    it.x = Math.max(0.25, Math.min(10, (it.x ?? 1) + 0.25 * +el.dataset.d));
    pintarEditor();
  },
  'ed-guardar'() { guardarComida(); },
  'ed-borrar'() {
    if (!ed || !confirm('¿Eliminar esta comida?')) return;
    S.comidas = S.comidas.filter((c) => c.id !== ed.id);
    fotoBorrar(ed.id);
    guardar(); ed = null; cerrarHoja(); render(); toast('Comida eliminada');
  },
  'hab-toggle'(el) { const r = (S.registroHabitos[ui.dia] ||= {}); r[el.dataset.id] = r[el.dataset.id] ? 0 : 1; guardar(); render(); },
  'hab-mas'(el) { const r = (S.registroHabitos[ui.dia] ||= {}); r[el.dataset.id] = (r[el.dataset.id] || 0) + 1; guardar(); render(); },
  'hab-menos'(el) { const r = (S.registroHabitos[ui.dia] ||= {}); r[el.dataset.id] = Math.max(0, (r[el.dataset.id] || 0) - 1); guardar(); render(); },
  'editar-habitos'() { abrirHoja({ titulo: 'Recordatorios y hábitos', izq: 'Listo', cuerpo: htmlEditarHabitos() }); },
  'rec-nuevo'() {
    S.habitos.unshift({ id: uid(), n: 'Nuevo recordatorio', tipo: 'check', meta: 1, u: '', rec: '09:00', grupo: 'rec' });
    guardar(); $('#hoja-cuerpo').innerHTML = htmlEditarHabitos();
    const inp = document.querySelector('#hoja-cuerpo [data-hab-campo="n"]'); if (inp) { inp.focus(); inp.select(); }
  },
  'hab-nuevo'() {
    S.habitos.push({ id: uid(), n: 'Nuevo hábito', tipo: 'check', meta: 1, u: '', rec: '' });
    guardar(); $('#hoja-cuerpo').innerHTML = htmlEditarHabitos();
    const c = $('#hoja-cuerpo'); c.scrollTop = c.scrollHeight;
  },
  'hab-borrar'(el) {
    const h = S.habitos.find((x) => x.id === el.dataset.id);
    if (!h || !confirm(`¿Eliminar "${h.n}"?`)) return;
    S.habitos = S.habitos.filter((x) => x.id !== h.id);
    guardar(); $('#hoja-cuerpo').innerHTML = htmlEditarHabitos();
  },
  ics() { descargar('recordatorios-mi-dieta.ics', generarICS(), 'text/calendar'); },
  'permiso-avisos'() {
    if (!('Notification' in window)) return;
    Notification.requestPermission().then((p) => { toast(p === 'granted' ? 'Avisos activados' : 'Permiso no concedido'); render(); });
  },
  'peso-registrar'() {
    const kg = num($('#peso-kg').value), fecha = $('#peso-fecha').value || hoyISO();
    if (kg < 25 || kg > 350) { toast('Ingresá un peso válido'); return; }
    registrarPeso(fecha, kg); render(); toast('Peso registrado');
  },
  'peso-borrar'(el) {
    if (!confirm('¿Borrar el registro de ' + nombreDia(el.dataset.fecha) + '?')) return;
    S.pesos = S.pesos.filter((p) => p.fecha !== el.dataset.fecha); guardar(); render();
  },
  objetivo(el) { S.perfil.objetivo = el.dataset.v; guardar(); render(); },
  exportar() {
    descargar(`mi-dieta-copia-${hoyISO()}.json`, JSON.stringify(S, null, 1), 'application/json');
  },
  'borrar-todo'() {
    if (!confirm('Se van a borrar comidas, pesos, hábitos y tu plan de esta cuenta, y las fotos de este teléfono. No se puede deshacer. ¿Continuar?')) return;
    bd('readwrite', (s) => s.clear());
    S = estadoInicial(); guardar(); render(); toast('Datos borrados');
  }
};

let ultimoToque = 0;
document.addEventListener('touchend', (e) => {
  const ahora = Date.now();
  if (ahora - ultimoToque < 320 && !e.target.closest('input, textarea, select')) e.preventDefault();
  ultimoToque = ahora;
}, { passive: false });
document.addEventListener('dblclick', (e) => e.preventDefault(), { passive: false });
document.addEventListener('gesturestart', (e) => e.preventDefault(), { passive: false });

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-accion]');
  if (!el || el.disabled) return;
  const f = ACCIONES[el.dataset.accion];
  if (f) f(el, e);
});

document.addEventListener('input', (e) => {
  if (e.target.id === 'busqueda') {
    const r = $('#resultados'), q = e.target.value;
    r.innerHTML = q.trim() || !ed.items.length ? htmlResultados(q) : '';
    r.classList.toggle('oculto', !r.innerHTML);
  }
});

document.addEventListener('change', async (e) => {
  const el = e.target;
  if (el.dataset.perfil) {
    const campo = el.dataset.perfil;
    if (campo === 'peso') { const kg = num(el.value); if (kg >= 25 && kg <= 350) registrarPeso(hoyISO(), kg); }
    else S.perfil[campo] = ['sexo', 'ritmo'].includes(campo) ? el.value : (campo === 'actividad' ? num(el.value) : (el.value.trim() ? num(el.value) : ''));
    guardar(); render();
  } else if (el.dataset.habNum) {
    const r = (S.registroHabitos[ui.dia] ||= {}); r[el.dataset.habNum] = num(el.value); guardar(); render();
  } else if (el.dataset.habCampo) {
    const h = S.habitos.find((x) => x.id === el.dataset.id); if (!h) return;
    const c = el.dataset.habCampo;
    h[c] = c === 'meta' ? num(el.value) : el.value;
    if (c === 'tipo') { if (h.tipo === 'check') h.meta = 1; else if (!h.meta || h.meta === 1) h.meta = h.tipo === 'contador' ? 8 : 1; $('#hoja-cuerpo').innerHTML = htmlEditarHabitos(); }
    guardar();
  } else if (el.dataset.ed && ed) {
    ed[el.dataset.ed] = el.value;
  } else if (el.classList.contains('archivo-foto') && el.files[0] && ed) {
    try {
      const f = await leerImagen(el.files[0]);
      ed.foto = f.mini; ed.fotoIA = f.grande; ed.quitarFoto = false; ed.aviso = '';
      estimarFoto();
    } catch (err) { toast(err.message); }
  } else if (el.id === 'archivo-importar' && el.files[0]) {
    try {
      const datos = JSON.parse(await el.files[0].text());
      if (!datos || !Array.isArray(datos.comidas)) throw new Error();
      if (!confirm('Esto reemplaza los datos actuales por los de la copia. ¿Continuar?')) return;
      S = cargarEstado(datos); guardar(); render(); toast('Copia importada');
    } catch (err) { toast('El archivo no es una copia válida'); }
  }
});

/* ---------- Inicio ---------- */
// El arranque (ingreso y primera pantalla) está en cuenta.js.
setInterval(() => {
  revisarAvisos();
  // a medianoche, si la app quedó abierta en "Hoy", pasar al día nuevo
  const h = hoyISO();
  if (render.ultimoHoy && render.ultimoHoy !== h && ui.dia === render.ultimoHoy) { ui.dia = h; if (!hojaActual) render(); }
  render.ultimoHoy = h;
}, 30000);
render.ultimoHoy = hoyISO();
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
