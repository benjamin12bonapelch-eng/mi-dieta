'use strict';
/* Cuentas (Supabase: login con mail y contraseña) y cuestionario inicial.
   Cada usuario guarda sus datos en la tabla "estados" (una fila por usuario, protegida con RLS)
   y una copia en el teléfono para que la app funcione sin conexión. */

const SB_URL = 'https://qecdtabhjarzqkqoldgc.supabase.co';
const SB_KEY = 'sb_publishable_SNsljij8DtlqR5vzG04xBw_k9pNleu5'; // clave pública (segura de publicar)
const CLAVE_SESION = 'mi-dieta-sesion';

let sesion = null;
try { sesion = JSON.parse(localStorage.getItem(CLAVE_SESION) || 'null'); } catch (e) { sesion = null; }
const claveDatos = () => 'mi-dieta-datos:' + (sesion ? sesion.user.id : 'sin-cuenta');
const clavePendiente = () => 'mi-dieta-pendiente:' + (sesion ? sesion.user.id : '');

function guardarSesion(d) {
  sesion = d ? {
    access_token: d.access_token,
    refresh_token: d.refresh_token,
    expires_at: d.expires_at || Math.floor(Date.now() / 1000) + (d.expires_in || 3600),
    user: { id: d.user.id, email: d.user.email }
  } : null;
  if (sesion) localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
  else localStorage.removeItem(CLAVE_SESION);
}

function traducirError(d) {
  const c = d.error_code || d.code || '', m = String(d.msg || d.error_description || d.message || '');
  if (c === 'invalid_credentials' || /invalid login/i.test(m)) return 'Mail o contraseña incorrectos.';
  if (c === 'email_not_confirmed') return 'Todavía no confirmaste tu mail. Revisá tu correo (también en spam).';
  if (c === 'user_already_exists' || /already registered/i.test(m)) return 'Ese mail ya tiene una cuenta. Ingresá con tu contraseña.';
  if (c === 'weak_password') return 'La contraseña es muy débil. Usá al menos 6 caracteres.';
  if (c === 'email_address_invalid') return 'El mail no es válido.';
  if (c === 'over_email_send_rate_limit' || c === 'over_request_rate_limit' || /rate limit/i.test(m)) return 'Demasiados intentos. Esperá unos minutos.';
  if (/sending.*(email|mail)/i.test(m)) return 'No se pudo enviar el mail de confirmación. Avisale a quien administra la app.';
  if (c === 'signup_disabled') return 'Por ahora no se pueden crear cuentas nuevas.';
  return m || 'No se pudo completar. Probá de nuevo.';
}

async function sbAuth(ruta, cuerpo, metodo = 'POST', token) {
  let r;
  try {
    r = await fetch(`${SB_URL}/auth/v1/${ruta}`, {
      method: metodo,
      headers: { apikey: SB_KEY, 'content-type': 'application/json', ...(token ? { authorization: 'Bearer ' + token } : {}) },
      body: metodo === 'GET' ? undefined : JSON.stringify(cuerpo || {})
    });
  } catch (e) { throw new Error('Sin conexión. Probá de nuevo cuando tengas internet.'); }
  const d = await r.json().catch(() => ({}));
  if (!r.ok) { const err = new Error(traducirError(d)); err.estado = r.status; throw err; }
  return d;
}

// Devuelve un token vigente (lo renueva si está por vencer). null si no hay conexión.
async function tokenValido() {
  if (!sesion) return null;
  if (sesion.expires_at - 60 > Date.now() / 1000) return sesion.access_token;
  try {
    const d = await sbAuth('token?grant_type=refresh_token', { refresh_token: sesion.refresh_token });
    guardarSesion(d);
    return sesion.access_token;
  } catch (e) {
    if (!e.estado) return null; // sin conexión: seguir con la copia local
    salirDeCuenta(true);
    toast('Tu sesión venció. Ingresá de nuevo.');
    return null;
  }
}

/* ---------- Sincronización ---------- */
let temporizadorSubida = null;
function programarSubida() {
  if (!sesion) return;
  localStorage.setItem(clavePendiente(), '1');
  clearTimeout(temporizadorSubida);
  temporizadorSubida = setTimeout(subir, 1200);
}

async function subir() {
  if (!sesion) return false;
  const tk = await tokenValido();
  if (!tk) return false;
  try {
    const r = await fetch(`${SB_URL}/rest/v1/estados`, {
      method: 'POST',
      headers: {
        apikey: SB_KEY, authorization: 'Bearer ' + tk, 'content-type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=minimal'
      },
      body: JSON.stringify({ user_id: sesion.user.id, datos: S, actualizado: new Date(S.actualizado || Date.now()).toISOString() })
    });
    if (r.ok) { localStorage.removeItem(clavePendiente()); return true; }
  } catch (e) { /* sin conexión: queda pendiente */ }
  return false;
}

// Trae los datos de la cuenta. Si los del servidor son más nuevos, reemplazan a los locales.
async function bajar() {
  const tk = await tokenValido();
  if (!tk) return false;
  try {
    const r = await fetch(`${SB_URL}/rest/v1/estados?select=datos&user_id=eq.${sesion.user.id}`, {
      headers: { apikey: SB_KEY, authorization: 'Bearer ' + tk }
    });
    if (!r.ok) return false;
    const filas = await r.json();
    const remoto = filas[0] && filas[0].datos;
    const pendiente = localStorage.getItem(clavePendiente());
    if (remoto && (remoto.actualizado || 0) > (S.actualizado || 0) && !(pendiente && (S.actualizado || 0) > (remoto.actualizado || 0))) {
      S = cargarEstado(remoto);
      localStorage.setItem(claveDatos(), JSON.stringify(S));
      localStorage.removeItem(clavePendiente());
      return true;
    }
    if (!remoto || (S.actualizado || 0) > (remoto.actualizado || 0)) subir();
  } catch (e) { /* sin conexión */ }
  return false;
}

function cargarLocal() {
  try { S = cargarEstado(JSON.parse(localStorage.getItem(claveDatos()) || 'null')); }
  catch (e) { S = estadoInicial(); }
}

// Muestra la cuenta. Si el teléfono no tiene copia local, espera los datos del servidor antes de mostrar nada.
async function sincronizarAlEntrar() {
  ui.cargando = !localStorage.getItem(claveDatos());
  render();
  const cambio = await bajar();
  ui.cargando = false;
  if (cambio && S.perfil.completo && ui.q && !ui.q.rehacer) ui.q = null;
  render();
}
async function entrar() {
  cargarLocal();
  ui.tab = 'hoy'; ui.dia = hoyISO(); ui.q = null;
  await sincronizarAlEntrar();
}

async function salirDeCuenta(forzado) {
  if (!forzado && localStorage.getItem(clavePendiente())) {
    const ok = await subir();
    if (!ok && !confirm('Hay cambios que todavía no se subieron a tu cuenta (falta conexión). Si salís ahora se pierden. ¿Salir igual?')) return;
  }
  const tk = sesion && sesion.access_token;
  if (!forzado && tk) sbAuth('logout', {}, 'POST', tk).catch(() => {});
  if (sesion) { localStorage.removeItem(claveDatos()); localStorage.removeItem(clavePendiente()); }
  guardarSesion(null);
  S = estadoInicial(); ed = null; ui.q = null;
  cerrarHoja(true);
  render();
}

/* ---------- Pantalla de ingreso ---------- */
ui.login = { modo: 'ingresar', error: '', aviso: '', cargando: false, email: '' };

function vistaLogin() {
  const L = ui.login, crear = L.modo === 'crear', nueva = L.modo === 'nueva-clave';
  return `<div class="pantalla">
    <img class="logo" src="icons/icon-192.png" alt="">
    <h1 class="titulo-grande">Mi Dieta</h1>
    <p class="bajada">${nueva ? 'Elegí tu nueva contraseña.' : 'Tu plan de comidas, peso y hábitos.'}</p>
    ${nueva ? '' : `<div class="segmentado"><button class="${!crear ? 'activo' : ''}" data-accion="login-modo" data-v="ingresar">Ingresar</button>
      <button class="${crear ? 'activo' : ''}" data-accion="login-modo" data-v="crear">Crear cuenta</button></div>`}
    <form id="form-login" autocomplete="on">
      <div class="lista">
        ${nueva ? '' : `<div class="fila"><input class="izq" id="l-email" type="email" inputmode="email" autocomplete="username" autocapitalize="off" spellcheck="false" placeholder="Mail" value="${esc(L.email)}" required></div>`}
        <div class="fila"><input class="izq" id="l-clave" type="password" autocomplete="${crear || nueva ? 'new-password' : 'current-password'}" placeholder="${nueva ? 'Nueva contraseña' : 'Contraseña'}" minlength="6" required></div>
        ${crear || nueva ? '<div class="fila"><input class="izq" id="l-clave2" type="password" autocomplete="new-password" placeholder="Repetir contraseña" minlength="6" required></div>' : ''}
      </div>
      ${L.error ? `<div class="aviso alerta">${esc(L.error)}</div>` : ''}
      ${L.aviso ? `<div class="aviso ok">${esc(L.aviso)}</div>` : ''}
      <button class="btn" type="submit" ${L.cargando ? 'disabled' : ''}>${L.cargando ? 'Un momento…' : nueva ? 'Guardar contraseña' : crear ? 'Crear cuenta' : 'Ingresar'}</button>
    </form>
    ${!crear && !nueva ? '<button class="enlace" data-accion="olvide">Olvidé mi contraseña</button>' : ''}
    ${crear ? '<p class="nota-seccion" style="margin:14px 4px 0;text-align:center">Tus datos quedan en tu cuenta y solo los ves vos.</p>' : ''}
  </div>`;
}

async function enviarLogin() {
  const L = ui.login;
  const email = ($('#l-email') || {}).value ? $('#l-email').value.trim().toLowerCase() : L.email;
  const clave = $('#l-clave').value, clave2 = ($('#l-clave2') || {}).value;
  L.email = email; L.error = ''; L.aviso = '';
  if ((L.modo === 'crear' || L.modo === 'nueva-clave') && clave !== clave2) { L.error = 'Las contraseñas no coinciden.'; render(); return; }
  if (clave.length < 6) { L.error = 'La contraseña tiene que tener al menos 6 caracteres.'; render(); return; }
  L.cargando = true; render();
  try {
    if (L.modo === 'nueva-clave') {
      await sbAuth('user', { password: clave }, 'PUT', sesion.access_token);
      L.cargando = false; L.modo = 'ingresar';
      toast('Contraseña actualizada');
      await entrar();
      return;
    }
    if (L.modo === 'crear') {
      const d = await sbAuth('signup?redirect_to=' + encodeURIComponent(location.origin + location.pathname), { email, password: clave });
      if (d.access_token) { guardarSesion(d); L.cargando = false; await entrar(); return; }
      L.cargando = false; L.modo = 'ingresar';
      L.aviso = `Te mandamos un mail a ${email} para confirmar la cuenta. Confirmalo y después ingresá acá.`;
      render(); return;
    }
    const d = await sbAuth('token?grant_type=password', { email, password: clave });
    guardarSesion(d); L.cargando = false;
    await entrar();
  } catch (e) {
    L.cargando = false; L.error = e.message; render();
  }
}

// Vuelta desde un mail (confirmación de cuenta o recuperación de contraseña).
async function procesarEnlaceDeMail() {
  const h = new URLSearchParams(location.hash.slice(1));
  if (h.get('error_description')) { ui.login.error = 'El enlace del mail venció o ya se usó. Probá de nuevo.'; history.replaceState(null, '', location.pathname); return; }
  const at = h.get('access_token');
  if (!at) return;
  history.replaceState(null, '', location.pathname);
  try {
    const user = await sbAuth('user', null, 'GET', at);
    guardarSesion({ access_token: at, refresh_token: h.get('refresh_token'), expires_in: +h.get('expires_in') || 3600, user });
    if (h.get('type') === 'recovery') ui.login.modo = 'nueva-clave';
  } catch (e) { ui.login.error = e.message; }
}

/* ---------- Cuestionario inicial ---------- */
const SUPLEMENTOS = [
  { id: 'creatina', n: 'Tomar creatina', etq: 'Creatina', rec: '09:00' },
  { id: 'proteina', n: 'Tomar proteína', etq: 'Proteína en polvo', rec: '17:00' },
  { id: 'vitaminas', n: 'Tomar vitaminas', etq: 'Vitaminas', rec: '09:00' },
  { id: 'medicacion', n: 'Tomar medicación', etq: 'Medicación', rec: '08:00' }
];

const PREGUNTAS = [
  { id: 'nombre', tipo: 'texto', titulo: '¿Cómo te llamás?', ayuda: 'Así te saludo en la app.', ph: 'Tu nombre' },
  {
    id: 'objetivo', tipo: 'opciones', titulo: '¿Qué querés lograr con tu físico?', opciones: () => [
      ['bajar', 'Bajar grasa', 'Perder peso cuidando el músculo'],
      ['recomp', 'Recomposición', 'Bajar grasa y ganar músculo a la vez, más despacio'],
      ['ganar', 'Ganar músculo', 'Subir de peso acompañado de entrenamiento'],
      ['mantener', 'Mantenerme', 'Sostener el peso y mejorar los hábitos']
    ]
  },
  { id: 'sexo', tipo: 'opciones', titulo: '¿Cuál es tu sexo?', ayuda: 'Se usa para calcular tu metabolismo.', opciones: () => [['m', 'Masculino'], ['f', 'Femenino']] },
  { id: 'edad', tipo: 'numero', titulo: '¿Qué edad tenés?', unidad: 'años', min: 14, max: 99 },
  { id: 'altura', tipo: 'numero', titulo: '¿Cuánto medís?', unidad: 'cm', min: 120, max: 230 },
  { id: 'peso', tipo: 'numero', titulo: '¿Cuánto pesás hoy?', ayuda: 'Idealmente en ayunas. Lo vas a poder actualizar cuando quieras.', unidad: 'kg', min: 30, max: 300 },
  { id: 'pesoMeta', tipo: 'numero', titulo: '¿A qué peso te gustaría llegar?', ayuda: 'Opcional: si no sabés, dejalo vacío.', unidad: 'kg', min: 30, max: 300, opcional: true, si: (r) => r.objetivo !== 'mantener' },
  {
    id: 'trabajo', tipo: 'opciones', titulo: '¿Cómo es tu día a día?', ayuda: 'Sin contar el entrenamiento.', opciones: () => [
      ['sentado', 'Mayormente sentado', 'Oficina, escritorio, auto'],
      ['pie', 'Bastante de pie o caminando', 'Atención al público, recorridos, docencia'],
      ['fisico', 'Trabajo físico', 'Obra, depósito, esfuerzo casi todo el día']
    ]
  },
  {
    id: 'entreno', tipo: 'opciones', titulo: '¿Cuántos días por semana entrenás?', opciones: () => [
      ['0', 'Por ahora no entreno'], ['2', '1 o 2 días'], ['4', '3 o 4 días'], ['6', '5 días o más']
    ]
  },
  {
    id: 'ritmo', tipo: 'opciones', titulo: '¿A qué ritmo querés ir?', si: (r) => r.objetivo === 'bajar' || r.objetivo === 'ganar',
    opciones: (r) => r.objetivo === 'ganar'
      ? [['suave', 'Limpio', 'Sumás músculo con la menor grasa posible'], ['moderado', 'Moderado', 'El punto recomendado'], ['rapido', 'Rápido', 'Subís más rápido, con algo más de grasa']]
      : [['suave', 'Tranquilo', 'Más fácil de sostener, alrededor de 0,25 kg por semana'], ['moderado', 'Moderado', 'El punto recomendado, alrededor de 0,5 kg por semana'], ['rapido', 'Rápido', 'Más exigente, alrededor de 0,75 kg por semana']]
  },
  {
    id: 'suplementos', tipo: 'multi', titulo: '¿Tomás algo que quieras que te recuerde?', ayuda: 'Aparece arriba de todo, cada día. La hora la cambiás después.',
    opciones: () => SUPLEMENTOS.map((s) => [s.id, s.etq, 'Todos los días a las ' + s.rec])
  },
  {
    id: 'habitos', tipo: 'multi', titulo: '¿Qué hábitos querés seguir?', ayuda: 'Elegí los que te sirvan. Podés sumar o quitar después.',
    opciones: () => HABITOS_BASE.map((h) => [h.id, h.n, h.tipo === 'check' ? 'Lo marcás cuando lo cumplís' : `Meta: ${fmt(h.meta, 1)} ${h.u}`])
  },
  { id: 'resumen', tipo: 'resumen', titulo: 'Tu plan' }
];

const preguntasVisibles = (r) => PREGUNTAS.filter((p) => !p.si || p.si(r));

function iniciarCuestionario() {
  const p = S.perfil, yaHabia = !!p.completo;
  ui.q = {
    paso: 0,
    r: yaHabia ? {
      nombre: p.nombre || '', objetivo: p.objetivo, sexo: p.sexo, edad: p.edad, altura: p.altura, peso: pesoActual() || '',
      pesoMeta: p.pesoMeta, trabajo: p.trabajo || 'sentado', entreno: p.entreno ?? '2', ritmo: p.ritmo || 'moderado',
      suplementos: soloRecordatorios().map((h) => h.id).filter((id) => SUPLEMENTOS.some((s) => s.id === id)),
      habitos: soloHabitos().map((h) => h.id).filter((id) => HABITOS_BASE.some((b) => b.id === id))
    } : { habitos: ['agua', 'pasos', 'sueno', 'entreno'], suplementos: [], ritmo: 'moderado' },
    rehacer: yaHabia
  };
}

function valido(p, r) {
  const v = r[p.id];
  if (p.tipo === 'texto') return !!String(v || '').trim();
  if (p.tipo === 'numero') return (p.opcional && (v === '' || v == null)) || (num(v) >= p.min && num(v) <= p.max);
  if (p.tipo === 'opciones') return v != null && v !== '';
  return true;
}

// Nivel de actividad: parte de los días de entrenamiento y sube un escalón si el día a día es de pie, dos si es físico.
function factorActividad(trabajo, entreno) {
  const i = ({ 0: 0, 2: 1, 4: 2, 6: 3 }[entreno] || 0) + ({ sentado: 0, pie: 1, fisico: 2 }[trabajo] || 0);
  return ACTIVIDAD[Math.min(i, ACTIVIDAD.length - 1)][0];
}

function perfilDesdeRespuestas(r) {
  return Object.assign({}, S.perfil, {
    nombre: String(r.nombre || '').trim(), objetivo: r.objetivo, sexo: r.sexo, edad: num(r.edad), altura: num(r.altura),
    peso: num(r.peso), pesoMeta: r.pesoMeta === '' || r.pesoMeta == null ? '' : num(r.pesoMeta),
    trabajo: r.trabajo, entreno: r.entreno, ritmo: r.ritmo || 'moderado',
    actividad: factorActividad(r.trabajo, r.entreno), completo: true
  });
}

function vistaCuestionario() {
  const q = ui.q, r = q.r, lista = preguntasVisibles(r);
  q.paso = Math.min(q.paso, lista.length - 1);
  const p = lista[q.paso];
  const prog = (q.paso / (lista.length - 1)) * 100;
  let cuerpo = '';
  if (p.tipo === 'texto' || p.tipo === 'numero') {
    const v = r[p.id] ?? '';
    cuerpo = `<form id="form-q"><div class="entrada-grande"><input id="q-input" ${p.tipo === 'numero' ? 'inputmode="decimal"' : 'autocapitalize="words"'}
      value="${esc(String(v).replace('.', ','))}" placeholder="${esc(p.ph || '')}" autocomplete="off">${p.unidad ? `<span>${esc(p.unidad)}</span>` : ''}</div></form>`;
  } else if (p.tipo === 'opciones' || p.tipo === 'multi') {
    const sel = p.tipo === 'multi' ? (r[p.id] || []) : [r[p.id]];
    cuerpo = p.opciones(r).map(([v, t, d]) => `<button class="opcion ${sel.includes(v) ? 'sel' : ''}" data-accion="q-opcion" data-v="${esc(v)}">
      <div><div class="t">${esc(t)}</div>${d ? `<div class="d">${esc(d)}</div>` : ''}</div><span class="marca">${IC.check}</span></button>`).join('');
  } else {
    cuerpo = resumenCuestionario(r);
  }
  const ultimo = p.tipo === 'resumen';
  const mostrarSeguir = p.tipo !== 'opciones' || ultimo;
  return `<div class="pantalla">
    <div class="barra-q">
      ${q.paso > 0 ? `<button class="boton-texto" data-accion="q-atras">${IC.izq}<span>Atrás</span></button>` : (q.rehacer ? '<button class="boton-texto" data-accion="q-cancelar">Cancelar</button>' : '<span></span>')}
      <span class="paso-q">${ultimo ? '' : `${q.paso + 1} de ${lista.length - 1}`}</span>
    </div>
    <div class="progreso-q"><i style="width:${prog}%"></i></div>
    <h1 class="pregunta">${esc(ultimo && r.nombre ? `Listo, ${String(r.nombre).trim()}` : p.titulo)}</h1>
    ${p.ayuda ? `<p class="ayuda-q">${esc(p.ayuda)}</p>` : ultimo ? '<p class="ayuda-q">Este es tu punto de partida. Lo vas a poder ajustar en Perfil.</p>' : ''}
    <div>${cuerpo}</div>
    <div class="pie-q">${mostrarSeguir ? `<button class="btn" data-accion="q-seguir" id="q-seguir" ${valido(p, r) ? '' : 'disabled'}>${ultimo ? 'Empezar' : (p.opcional && !r[p.id] ? 'Saltear' : 'Continuar')}</button>` : ''}</div>
  </div>`;
}

function resumenCuestionario(r) {
  const guardado = S.perfil, pesosGuardados = S.pesos;
  S.perfil = perfilDesdeRespuestas(r);
  S.pesos = [{ fecha: hoyISO(), kg: num(r.peso) }];
  const m = metas();
  S.perfil = guardado; S.pesos = pesosGuardados;
  const texto = {
    bajar: 'Para bajar grasa', recomp: 'Para recomponer (bajar grasa y ganar músculo)', ganar: 'Para ganar músculo', mantener: 'Para mantenerte'
  }[r.objetivo];
  const recs = SUPLEMENTOS.filter((s) => (r.suplementos || []).includes(s.id));
  const habs = HABITOS_BASE.filter((h) => (r.habitos || []).includes(h.id));
  return `<div class="tarjeta">
      <div style="color:var(--text2);font-size:15px">${esc(texto)}, tu meta diaria es</div>
      <div style="font-size:44px;font-weight:700;font-variant-numeric:tabular-nums;margin:2px 0 10px">${fmt(m.kcal)}<span style="font-size:18px;font-weight:500;color:var(--text2)"> kcal</span></div>
      <div class="totales" style="grid-template-columns:repeat(3,1fr)">
        <div><div class="num" style="color:var(--prot)">${m.prot} g</div><div class="etq">Proteínas</div></div>
        <div><div class="num" style="color:var(--carb)">${m.carb} g</div><div class="etq">Carbohidratos</div></div>
        <div><div class="num" style="color:var(--fat)">${m.grasa} g</div><div class="etq">Grasas</div></div></div>
      <div style="color:var(--text2);font-size:13px;margin-top:14px">Tu mantenimiento estimado es de ${fmt(m.mant)} kcal.${num(r.pesoMeta) ? ` Meta de peso: ${fmt(num(r.pesoMeta), 1)} kg.` : ''}</div>
    </div>
    ${recs.length ? `<div class="titulo-seccion">Recordatorios</div><div class="lista">${recs.map((s) => `<div class="fila"><span class="crece">${esc(s.n)}</span><span class="valor">${s.rec}</span></div>`).join('')}</div>` : ''}
    ${habs.length ? `<div class="titulo-seccion">Hábitos</div><div class="lista">${habs.map((h) => `<div class="fila"><span class="crece">${esc(h.n)}</span>${h.tipo !== 'check' ? `<span class="valor">${fmt(h.meta, 1)} ${esc(h.u)}</span>` : ''}</div>`).join('')}</div>` : ''}
    <p class="nota-seccion" style="margin-top:0">Es una estimación (fórmula Mifflin-St Jeor). Revisala con la evolución de tu peso cada 2 o 3 semanas. No reemplaza la consulta con un profesional.</p>`;
}

function terminarCuestionario() {
  const r = ui.q.r;
  S.perfil = perfilDesdeRespuestas(r);
  registrarPeso(hoyISO(), num(r.peso)); // también guarda
  // Recordatorios y hábitos: conserva los que ya existían (y su historial) y agrega los nuevos.
  const idsSup = SUPLEMENTOS.map((s) => s.id), idsHab = HABITOS_BASE.map((h) => h.id);
  const propios = S.habitos.filter((h) => !idsSup.includes(h.id) && !idsHab.includes(h.id));
  const recs = SUPLEMENTOS.filter((s) => (r.suplementos || []).includes(s.id)).map((s) =>
    S.habitos.find((h) => h.id === s.id) || { id: s.id, n: s.n, tipo: 'check', meta: 1, u: '', rec: s.rec, grupo: 'rec' });
  const habs = HABITOS_BASE.filter((b) => (r.habitos || []).includes(b.id)).map((b) => S.habitos.find((h) => h.id === b.id) || { ...b });
  S.habitos = [...recs, ...habs, ...propios];
  guardar();
  ui.q = null; ui.tab = 'hoy';
  render();
  window.scrollTo(0, 0);
}

Object.assign(ACCIONES, {
  'login-modo'(el) { ui.login.modo = el.dataset.v; ui.login.error = ''; ui.login.aviso = ''; const e = $('#l-email'); if (e) ui.login.email = e.value; render(); },
  async olvide() {
    const email = ($('#l-email') || {}).value || '';
    if (!email.includes('@')) { ui.login.error = 'Escribí tu mail arriba y tocá de nuevo "Olvidé mi contraseña".'; render(); return; }
    ui.login.email = email.trim().toLowerCase();
    try {
      await sbAuth('recover?redirect_to=' + encodeURIComponent(location.origin + location.pathname), { email: ui.login.email });
      ui.login.error = ''; ui.login.aviso = 'Si ese mail tiene cuenta, te llega un enlace para cambiar la contraseña.';
    } catch (e) { ui.login.error = e.message; ui.login.aviso = ''; }
    render();
  },
  'cerrar-sesion'() { if (confirm('¿Cerrar sesión en este teléfono?')) salirDeCuenta(false); },
  'rehacer-cuestionario'() { iniciarCuestionario(); render(); window.scrollTo(0, 0); },
  'q-opcion'(el) {
    const q = ui.q, p = preguntasVisibles(q.r)[q.paso];
    if (p.tipo === 'multi') {
      const a = new Set(q.r[p.id] || []);
      a.has(el.dataset.v) ? a.delete(el.dataset.v) : a.add(el.dataset.v);
      q.r[p.id] = [...a];
      render();
    } else {
      q.r[p.id] = el.dataset.v;
      render();
      setTimeout(() => { if (ui.q === q) { q.paso++; render(); window.scrollTo(0, 0); } }, 180);
    }
  },
  'q-seguir'() {
    const q = ui.q, lista = preguntasVisibles(q.r), p = lista[q.paso];
    const inp = $('#q-input');
    if (inp) q.r[p.id] = p.tipo === 'numero' ? (inp.value.trim() ? num(inp.value) : '') : inp.value;
    if (!valido(p, q.r)) { toast(p.tipo === 'numero' ? `Ingresá un valor entre ${p.min} y ${p.max}` : 'Completá este dato'); return; }
    if (p.tipo === 'resumen') { terminarCuestionario(); return; }
    q.paso++; render(); window.scrollTo(0, 0);
    const n = $('#q-input'); if (n) n.focus();
  },
  'q-atras'() { if (ui.q.paso > 0) { ui.q.paso--; render(); } },
  'q-cancelar'() { ui.q = null; render(); }
});

document.addEventListener('submit', (e) => {
  if (e.target.id === 'form-login') { e.preventDefault(); enviarLogin(); }
  if (e.target.id === 'form-q') { e.preventDefault(); ACCIONES['q-seguir'](); }
});
document.addEventListener('input', (e) => {
  if (e.target.id === 'q-input' && ui.q) {
    const p = preguntasVisibles(ui.q.r)[ui.q.paso];
    const v = p.tipo === 'numero' ? (e.target.value.trim() ? num(e.target.value) : '') : e.target.value;
    ui.q.r[p.id] = v;
    const b = $('#q-seguir');
    if (b) { b.disabled = !valido(p, ui.q.r); b.textContent = p.opcional && !e.target.value.trim() ? 'Saltear' : 'Continuar'; }
  }
});
window.addEventListener('online', () => { if (sesion && localStorage.getItem(clavePendiente())) subir(); });
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && sesion && !ui.q && !hojaActual) bajar().then((cambio) => { if (cambio) render(); });
});

/* ---------- Inicio ---------- */
(async function arrancar() {
  await procesarEnlaceDeMail();
  if (sesion) cargarLocal();
  const desdeHash = location.hash.slice(1);
  if (PESTANAS.some(([id]) => id === desdeHash)) ui.tab = desdeHash;
  if (sesion && ui.login.modo !== 'nueva-clave') {
    await sincronizarAlEntrar();
    if (localStorage.getItem(clavePendiente())) subir();
  } else render();
})();
