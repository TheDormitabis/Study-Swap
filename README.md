# Study Swap

Aplicación educativa gamificada desarrollada con HTML, CSS y JavaScript vanilla. No requiere Node.js, compilación ni dependencias de proyecto.

## Ejecutar en local

1. Descarga o descomprime la carpeta.
2. Abre `index.html` en un navegador moderno.
3. Para una experiencia más parecida a producción, puedes servir la carpeta con cualquier servidor estático (por ejemplo, la extensión Live Server de VS Code).

## Desplegar en Vercel

### Opción A: desde GitHub

1. Sube `index.html`, `style.css`, `app.js`, `vercel.json` y `README.md` a un repositorio de GitHub.
2. Entra en [Vercel](https://vercel.com/), pulsa **Add New → Project** e importa el repositorio.
3. En **Framework Preset**, selecciona **Other**.
4. Deja **Build Command** y **Output Directory** vacíos. No hay paso de compilación.
5. Pulsa **Deploy**. Vercel publicará el sitio estático.

### Opción B: Vercel CLI

Con Vercel CLI instalado y autenticado, ejecuta desde esta carpeta:

```bash
vercel --prod
```

## Funcionalidades

- 15 vistas conectadas con navegación SPA y navegación inferior para móvil.
- Dashboard, perfil editable, materias, temas, explicación, video simulado, quiz, reto diario, resultados, progreso, insignias, repaso de errores, notificaciones, configuración y cierre de sesión de demostración.
- Evaluación inmediata, explicación de respuestas, cálculo de puntuación y recompensas.
- Tema oscuro/claro, preferencias y progreso guardados en `localStorage`.
- Diseño adaptable a móvil, tablet y escritorio.

## Notas de alcance

Esta es una demo frontend estática. El perfil, los puntos, el progreso y las preferencias se guardan en el navegador actual. No hay autenticación real, sincronización entre dispositivos, base de datos, envío real de notificaciones ni streaming de video: el reproductor es una simulación visual interactiva. Para producción con usuarios reales, se debe conectar un backend (por ejemplo, Supabase o Firebase), proteger los datos y reemplazar el reproductor de muestra por contenido multimedia autorizado.
