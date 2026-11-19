# Mi Dieta

App web personal para el teléfono: calorías y macros según el objetivo, registro de comidas (con foto opcional), evolución del peso y hábitos diarios con recordatorios.

- Cada persona crea su cuenta con mail y contraseña y tiene sus propios datos.
- Al crear la cuenta, un cuestionario arma el plan (calorías, macros, recordatorios y hábitos).
- Datos en Supabase (proyecto "Mi Dieta", plan gratis), tabla `estados`: una fila por usuario, protegida con RLS para que cada uno vea solo lo suyo. Copia local en el teléfono para usar sin conexión; las fotos quedan solo en el teléfono.
- Estimación por foto con Gemini (plan gratis de Google) mediante la función `estimar-comida` de Supabase; la clave queda en el servidor, nunca en el teléfono. No usa servicios pagos.

## Archivos

| Archivo | Qué es |
|---|---|
| `index.html` | Página principal |
| `styles.css` | Diseño (claro y oscuro) |
| `app.js` | Lógica de la app |
| `cuenta.js` | Ingreso con mail, sincronización con Supabase y cuestionario inicial |
| `alimentos.js` | Base local de alimentos frecuentes (valores aproximados) |
| `sw.js` | Funcionamiento sin conexión. Al cambiar archivos, subir `VERSION` |
| `manifest.webmanifest`, `icons/` | Instalación en la pantalla de inicio |
| `herramientas/generar_iconos.py` | Regenera los íconos (`python3 herramientas/generar_iconos.py`) |

## Publicar en GitHub Pages

1. Crear un repositorio nuevo (por ejemplo `mi-dieta`) y subir el contenido de esta carpeta.
2. En el repositorio: Settings > Pages > Source: `Deploy from a branch`, rama `main`, carpeta `/ (root)`.
3. La app queda en `https://<usuario>.github.io/mi-dieta/`. En el iPhone: abrir en Safari > Compartir > Agregar a inicio.

## Supabase: configuración pendiente (en supabase.com, proyecto "Mi Dieta")

1. Authentication > Sign In / Providers > Email: desactivar **Confirm email**. El correo gratis de Supabase solo envía mails a los miembros de la cuenta, así que con la confirmación activada otras personas no pueden registrarse.
2. Authentication > URL Configuration: poner en **Site URL** la dirección publicada de la app (y agregarla en Redirect URLs), para que los enlaces de recuperar contraseña vuelvan a la app.
3. Edge Functions > Secrets: cargar `GEMINI_API_KEY` con la clave gratis de Google AI Studio (aistudio.google.com/apikey). Opcional: `GEMINI_MODEL` para fijar el modelo.
4. En el plan gratis, el proyecto se pausa si pasa una semana sin uso; se reactiva desde el panel.
