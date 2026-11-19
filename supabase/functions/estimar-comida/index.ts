// Estima alimentos, calorías y macros de una foto de comida usando Gemini (plan gratis de Google).
// Solo usuarios con sesión iniciada (verify_jwt). La clave va en el secreto GEMINI_API_KEY;
// opcionalmente GEMINI_MODEL fija el modelo.
// Copia de la función publicada en Supabase (proyecto Mi Dieta, función estimar-comida).

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

const responder = (cuerpo: unknown, estado = 200) =>
  new Response(JSON.stringify(cuerpo), { status: estado, headers: { ...CORS, 'content-type': 'application/json' } });

const INSTRUCCIONES = `Sos un nutricionista que estima el contenido de comidas a partir de fotos.
Identificá cada alimento visible, estimá la porción en gramos usando como referencia el plato, los cubiertos y los envases, y calculá calorías y macronutrientes con valores de tablas nutricionales estándar. Usá preparaciones típicas de Argentina cuando corresponda.
Si algo no se ve con claridad (aceite, manteca, salsas, rellenos, bebidas), hacé una suposición razonable y mencionala en la nota.
Los valores de cada ítem corresponden a la porción estimada, no a 100 g. Nombres en español rioplatense.
Si la imagen no muestra comida, devolvé items vacío y explicalo en la nota.`;

const ESQUEMA = {
  type: 'OBJECT',
  properties: {
    descripcion: { type: 'STRING' },
    confianza: { type: 'STRING', enum: ['alta', 'media', 'baja'] },
    items: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          nombre: { type: 'STRING' },
          gramos: { type: 'NUMBER' },
          kcal: { type: 'NUMBER' },
          proteinas: { type: 'NUMBER' },
          carbohidratos: { type: 'NUMBER' },
          grasas: { type: 'NUMBER' }
        },
        required: ['nombre', 'gramos', 'kcal', 'proteinas', 'carbohidratos', 'grasas']
      }
    },
    nota: { type: 'STRING' }
  },
  required: ['descripcion', 'confianza', 'items', 'nota']
};

const BASE = 'https://generativelanguage.googleapis.com/v1beta';

// Si los nombres conocidos no existen, busca un modelo Flash disponible para esta clave.
async function buscarModeloFlash(clave: string): Promise<string | null> {
  const r = await fetch(`${BASE}/models?pageSize=200`, { headers: { 'x-goog-api-key': clave } });
  if (!r.ok) return null;
  const d = await r.json();
  const candidatos = (d.models || [])
    .filter((m: any) => (m.supportedGenerationMethods || []).includes('generateContent'))
    .map((m: any) => String(m.name).replace('models/', ''))
    .filter((n: string) => /flash/.test(n) && !/lite|image|tts|audio|live|thinking|exp|preview/.test(n))
    .sort()
    .reverse();
  return candidatos[0] || null;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return responder({ error: 'metodo' }, 405);

  const clave = Deno.env.get('GEMINI_API_KEY');
  if (!clave) return responder({ error: 'sin_clave' }, 503);

  let datos: any;
  try { datos = await req.json(); } catch { return responder({ error: 'pedido_invalido' }, 400); }
  const imagen = String(datos?.imagen || '');
  if (!imagen || imagen.length > 5_000_000 || !/^[A-Za-z0-9+/=]+$/.test(imagen.slice(0, 200))) {
    return responder({ error: 'imagen_invalida' }, 400);
  }
  const detalle = String(datos?.detalle || '').slice(0, 300).trim();

  const mensaje = {
    systemInstruction: { parts: [{ text: INSTRUCCIONES }] },
    contents: [{
      role: 'user',
      parts: [
        { inline_data: { mime_type: 'image/jpeg', data: imagen } },
        { text: 'Estimá esta comida.' + (detalle ? ' Detalle que aporta la persona: ' + detalle : '') }
      ]
    }]
  };
  // Sin "razonamiento" en los modelos que lo permiten: es lo que más demora la respuesta.
  const cuerpoPara = (modelo: string) => JSON.stringify({
    ...mensaje,
    generationConfig: {
      responseMimeType: 'application/json', responseSchema: ESQUEMA, temperature: 0.2, maxOutputTokens: 1500,
      ...(/^gemini-2\.5/.test(modelo) ? { thinkingConfig: { thinkingBudget: 0 } } : {})
    }
  });

  type Resultado = { ok: true; datos: any; modelo: string } | { ok: false; tipo: string; estado?: number };

  async function consultar(modelo: string, msTope: number, cancelar: AbortSignal): Promise<Resultado> {
    const ctl = new AbortController();
    const tope = setTimeout(() => ctl.abort(), msTope);
    cancelar.addEventListener('abort', () => ctl.abort());
    try {
      const r = await fetch(`${BASE}/models/${modelo}:generateContent`, {
        method: 'POST', signal: ctl.signal,
        headers: { 'content-type': 'application/json', 'x-goog-api-key': clave },
        body: cuerpoPara(modelo)
      });
      if (r.status === 429) return { ok: false, tipo: 'limite' };
      if (r.status >= 500) return { ok: false, tipo: 'saturado', estado: r.status };
      if (!r.ok) {
        const t = await r.text();
        console.error('gemini', modelo, r.status, t.slice(0, 300));
        if (/API key|API_KEY/i.test(t)) return { ok: false, tipo: 'clave_invalida' };
        return { ok: false, tipo: 'modelo', estado: r.status };
      }
      const d = await r.json();
      const cand = d?.candidates?.[0];
      if (!cand || cand.finishReason === 'SAFETY') return { ok: false, tipo: 'sin_respuesta' };
      const texto = (cand.content?.parts || []).map((p: any) => p.text || '').join('');
      return { ok: true, datos: JSON.parse(texto), modelo };
    } catch (_e) {
      return { ok: false, tipo: 'saturado' };
    } finally {
      clearTimeout(tope);
    }
  }

  // Corre dos modelos a la vez y se queda con el primero que responda bien.
  async function carrera(modelos: string[], msTope: number): Promise<Resultado[] | Resultado> {
    const cancelar = new AbortController();
    const fallos: Resultado[] = [];
    return await new Promise((resolver) => {
      let pendientes = modelos.length;
      for (const m of modelos) {
        consultar(m, msTope, cancelar.signal).then((res) => {
          if (res.ok) { cancelar.abort(); resolver(res); return; }
          console.error('gemini', m, res.tipo, res.estado || '');
          fallos.push(res);
          if (--pendientes === 0) resolver(fallos);
        });
      }
    });
  }

  const elegido = Deno.env.get('GEMINI_MODEL');
  // Los alias "latest" siguen siempre al modelo vigente (los 2.5 ya no se habilitan para claves nuevas).
  const rondas = [
    elegido ? [elegido, 'gemini-flash-lite-latest'] : ['gemini-flash-lite-latest', 'gemini-flash-latest'],
    ['gemini-flash-latest', 'gemini-flash-lite-latest']
  ];
  const todosLosFallos: Resultado[] = [];
  const inicio = Date.now();
  for (const ronda of rondas) {
    const resta = 110000 - (Date.now() - inicio);
    if (resta < 8000) break;
    const res = await carrera(ronda, Math.min(30000, resta));
    if (!Array.isArray(res)) {
      if (res.ok) return responder({ ...res.datos, modelo: res.modelo, segundos: Math.round((Date.now() - inicio) / 100) / 10 });
    } else {
      todosLosFallos.push(...res);
      if (res.some((f) => !f.ok && f.tipo === 'clave_invalida')) return responder({ error: 'clave_invalida' }, 502);
    }
  }
  // Último recurso: buscar cualquier modelo Flash disponible para esta clave.
  const otro = await buscarModeloFlash(clave);
  if (otro && Date.now() - inicio < 110000) {
    const res = await consultar(otro, 30000, new AbortController().signal);
    if (res.ok) return responder({ ...res.datos, modelo: res.modelo });
    todosLosFallos.push(res);
  }
  const tipos = todosLosFallos.map((f) => (f.ok ? '' : f.tipo));
  if (tipos.includes('limite') && !tipos.includes('saturado')) return responder({ error: 'limite' }, 429);
  if (tipos.includes('saturado')) return responder({ error: 'saturado' }, 503);
  if (tipos.includes('sin_respuesta')) return responder({ error: 'sin_respuesta' }, 502);
  return responder({ error: 'sin_modelo' }, 502);
});
