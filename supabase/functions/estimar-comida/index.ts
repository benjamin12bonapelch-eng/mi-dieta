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

  const cuerpo = JSON.stringify({
    systemInstruction: { parts: [{ text: INSTRUCCIONES }] },
    contents: [{
      role: 'user',
      parts: [
        { inline_data: { mime_type: 'image/jpeg', data: imagen } },
        { text: 'Estimá esta comida.' + (detalle ? ' Detalle que aporta la persona: ' + detalle : '') }
      ]
    }],
    generationConfig: { responseMimeType: 'application/json', responseSchema: ESQUEMA, temperature: 0.2 }
  });

  // Si un modelo está saturado o tarda, pasa al siguiente. Tope total ~120 s (Supabase corta a los 150 s).
  const modelos = [Deno.env.get('GEMINI_MODEL'), 'gemini-2.5-flash', 'gemini-flash-latest', 'gemini-flash-lite-latest', 'gemini-2.5-flash-lite']
    .filter((m, i, a) => m && a.indexOf(m) === i) as string[];
  const inicio = Date.now();
  let buscado = false, saturado = false, limite = false;
  for (let i = 0; i < modelos.length; i++) {
    const modelo = modelos[i];
    const resta = 120000 - (Date.now() - inicio);
    if (resta < 8000) break;
    const ctl = new AbortController();
    const tope = setTimeout(() => ctl.abort(), Math.min(35000, resta));
    let r: Response;
    try {
      r = await fetch(`${BASE}/models/${modelo}:generateContent`, {
        method: 'POST', signal: ctl.signal,
        headers: { 'content-type': 'application/json', 'x-goog-api-key': clave },
        body: cuerpo
      });
    } catch (_e) {
      clearTimeout(tope);
      console.error('gemini', modelo, 'sin respuesta a tiempo');
      saturado = true;
      continue;
    }
    clearTimeout(tope);
    if (r.status === 429) { limite = true; console.error('gemini', modelo, 429); continue; }
    if (r.status === 503 || r.status === 500 || r.status === 504) { saturado = true; console.error('gemini', modelo, r.status); continue; }
    if (!r.ok) {
      const t = await r.text();
      console.error('gemini', modelo, r.status, t.slice(0, 400));
      if (/API key|API_KEY/i.test(t)) return responder({ error: 'clave_invalida' }, 502);
      if (r.status === 404 || r.status === 400) {
        if (i === modelos.length - 1 && !buscado) {
          buscado = true;
          const otro = await buscarModeloFlash(clave);
          if (otro && !modelos.includes(otro)) modelos.push(otro);
        }
        continue;
      }
      return responder({ error: 'servicio', estado: r.status }, 502);
    }
    const d = await r.json();
    const cand = d?.candidates?.[0];
    if (!cand || cand.finishReason === 'SAFETY') return responder({ error: 'sin_respuesta' }, 502);
    const texto = (cand.content?.parts || []).map((p: any) => p.text || '').join('');
    try {
      return responder({ ...JSON.parse(texto), modelo });
    } catch {
      return responder({ error: 'respuesta_ilegible' }, 502);
    }
  }
  if (limite) return responder({ error: 'limite' }, 429);
  if (saturado) return responder({ error: 'saturado' }, 503);
  return responder({ error: 'sin_modelo' }, 502);
});
