# MyNextGame 🎮

¡Descubre tu próximo juego favorito con recomendaciones personalizadas y herramientas de exploración avanzadas! "MyNextGame" te ayuda a navegar por el vasto universo de los videojuegos utilizando la potencia de la API de RAWG y la inteligencia artificial de Gemini.

## ✨ Características Principales

*   **Navegación y Búsqueda Exhaustiva:** Explora miles de juegos con una interfaz intuitiva.
*   **Filtros Avanzados:** Refina tu búsqueda por género, plataforma, etiquetas (tags) y año de lanzamiento.
*   **Opciones de Ordenación:** Clasifica los juegos por relevancia, popularidad, fecha de lanzamiento, puntuación, y más.
*   **Vista Detallada del Juego:** Accede a información completa, incluyendo:
    *   Descripciones detalladas.
    *   Puntuación de Metacritic.
    *   Capturas de pantalla y carrusel de imágenes.
    *   Tráilers de juegos (integración con YouTube).
    *   Información sobre desarrolladores y editores.
    *   Clasificación ESRB.
    *   Tiendas donde adquirir el juego.
*   **Wishlist (Lista de Deseos):** Guarda tus juegos favoritos para consultarlos más tarde. Sincronizada con LocalStorage.
*   **Juegos Vistos Recientemente:** Accede rápidamente a los juegos que has consultado.
*   **"¡Sorpréndeme!"**: Obtén una recomendación de juego aleatoria basada en los filtros activos (o sin ellos).
*   **Quiz "Encuentra Mi Próximo Juego":** Un cuestionario interactivo para obtener recomendaciones personalizadas basadas en tus preferencias.
*   **Resumen con IA (Gemini API):** Obtén resúmenes concisos y atractivos de las descripciones de los juegos, generados por la API de Google Gemini.
*   **Buscar Juegos Similares:** Encuentra juegos parecidos a uno que te guste basándose en su nombre y género principal.
*   **Diseño Responsivo:** Disfruta de una experiencia óptima en escritorio, tabletas y móviles.
*   **Tema Oscuro Elegante:** Interfaz visualmente atractiva con detalles cuidados como scrollbars personalizadas.
*   **Botón "Volver Arriba":** Navegación mejorada en listas largas.

## 🛠️ Stack Tecnológico

*   **Frontend:**
    *   [React 19](https://react.dev/)
    *   [TypeScript](https://www.typescriptlang.org/)
    *   [Tailwind CSS](https://tailwindcss.com/) (para estilos rápidos y personalizables)
    *   [Vite](https://vitejs.dev/) (como herramienta de desarrollo y build)
*   **APIs:**
    *   [RAWG Video Games Database API](https://rawg.io/apidocs) (para datos de juegos, géneros, plataformas, etc.)
    *   [Google Gemini API](https://ai.google.dev/docs) (para resúmenes de descripciones con IA)

## 🔑 Configuración de API Keys

Para que la aplicación funcione completamente, necesitas configurar dos API keys:

1.  **RAWG API Key:**
    *   Actualmente, esta clave está definida directamente en el archivo `src/constants.tsx` (`RAWG_API_KEY`).
    *   **Para producción y mayor seguridad, se recomienda gestionarla como una variable de entorno.**
    *   Puedes obtener tu clave registrándote en [RAWG.io](https://rawg.io/login?forward=developer).

2.  **Google Gemini API Key:**
    *   La aplicación está configurada para leer esta clave desde una variable de entorno llamada `API_KEY`.
    *   **Localmente (Desarrollo):**
        *   Crea un archivo `.env` en la raíz de tu proyecto.
        *   Añade la siguiente línea, reemplazando `TU_GEMINI_API_KEY_AQUI` con tu clave real:
            ```env
            API_KEY=TU_GEMINI_API_KEY_AQUI
            ```
        *   Asegúrate de que el archivo `.env` esté listado en tu `.gitignore` para no subirlo a tu repositorio.
    *   **En Producción (Hosting):**
        *   Deberás configurar esta variable de entorno `API_KEY` directamente en la configuración de tu plataforma de hosting (ej. Netlify, Vercel).
    *   Puedes obtener tu clave desde [Google AI Studio](https://aistudio.google.com/app/apikey).

## 🚀 Empezando (Desarrollo Local)

Sigue estos pasos para ejecutar el proyecto en tu máquina local:

1.  **Prerrequisitos:**
    *   Node.js (versión LTS recomendada)
    *   npm (usualmente viene con Node.js) o Yarn

2.  **Clona el Repositorio:**
    ```bash
    git clone https://URL_DE_TU_REPOSITORIO.git
    cd my-next-game 
    ```
    *(Reemplaza `https://URL_DE_TU_REPOSITORIO.git` con la URL real de tu repositorio)*

3.  **Instala las Dependencias:**
    ```bash
    npm install
    ```
    o si usas Yarn:
    ```bash
    yarn install
    ```

4.  **Configura las API Keys:**
    *   Como se mencionó en la sección anterior, asegúrate de que tu `RAWG_API_KEY` esté en `src/constants.tsx` o configúrala como variable de entorno si has modificado esa parte.
    *   Crea y configura tu archivo `.env` con tu `API_KEY` de Gemini.

5.  **Ejecuta el Servidor de Desarrollo (Vite):**
    ```bash
    npm run dev
    ```
    o si usas Yarn:
    ```bash
    yarn dev
    ```
    La aplicación debería estar disponible en `http://localhost:5173` (o el puerto que indique Vite).

## 📦 Compilación para Producción

Para crear una versión optimizada de la aplicación para producción:

```bash
npm run build
```
o con Yarn:
```bash
yarn build
```
Esto generará los archivos estáticos en la carpeta `dist/` (configurable en `vite.config.ts` si lo tuvieras).

## 🌐 Despliegue

Puedes desplegar esta aplicación en diversas plataformas de hosting para sitios estáticos o aplicaciones de JavaScript:

*   **Netlify:** Excelente opción, con integración continua desde Git. Sigue [esta guía detallada](#). (Puedes enlazar a la respuesta anterior que te di sobre Netlify).
*   **Vercel:** Otra plataforma popular, optimizada para frameworks de frontend como React.

**Importante para el despliegue:** Recuerda configurar la variable de entorno `API_KEY` (para Gemini) en la configuración de tu sitio en la plataforma de hosting elegida. La `RAWG_API_KEY`, si sigue en `constants.tsx`, se incluirá en el build.

## 📂 Estructura del Proyecto (Simplificada)

```
my-next-game/
├── public/             # Archivos estáticos públicos
├── src/
│   ├── components/     # Componentes de React reutilizables
│   ├── services/       # Lógica para interactuar con APIs y localStorage
│   ├── App.tsx         # Componente principal de la aplicación
│   ├── constants.tsx   # Constantes (URLs, claves de API, iconos SVG)
│   ├── index.tsx       # Punto de entrada de React
│   ├── types.ts        # Definiciones de tipos de TypeScript
│   └── ...             # Otros archivos de configuración o estilos globales
├── .env.example        # Ejemplo de archivo de variables de entorno (opcional)
├── .gitignore          # Archivos y carpetas ignorados por Git
├── index.html          # Punto de entrada HTML principal
├── package.json        # Metadatos del proyecto y dependencias
├── README.md           # Este archivo
└── vite.config.ts      # Configuración de Vite (si la tienes)
```

## 🙏 Agradecimientos

*   [RAWG API](https://rawg.io/apidocs) por proporcionar la extensa base de datos de videojuegos.
*   [Google Gemini API](https://ai.google.dev/) por potenciar las funciones de inteligencia artificial.
*   Creado por Asier Núñez.
```
