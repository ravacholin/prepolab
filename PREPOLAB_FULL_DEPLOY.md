
# PrepoLab — README Único de Desarrollo y Deployment (JavaScript, PWA)

**Versión:** 0.1.0  
**Fecha:** 2025-08-12  
**Ámbito:** App de preposiciones con enfoque cognitivo (solo estudiantes)  
**Objetivo:** construir y desplegar el MVP sin consultar otros documentos.

---

## 0) Contenido
- Resumen pedagógico y flujo (8–10 min).
- Stack JS y arquitectura (React + Vite + PWA).
- Estructura de proyecto.
- Modelos de datos JSON + Zod (opcional).
- Componentes y contratos mínimos.
- Lógica de corrección y SRS (snippets).
- Seed JSON del contenido (MVP).
- Setup local.
- PWA (manifest + service worker).
- Deployment (Vercel/Netlify/CF Pages/Docker).
- CI/CD (GitHub Actions).
- Checks post-deploy.
- Prompts para “deployment asistido por IA”.

---

## 1) Propuesta de valor (resumen)
Aprender y **automatizar** preposiciones entendiendo su **esquema de significado** (prototipo espacial → extensiones metafóricas) con **escenas manipulables** y **tareas de procesamiento**. Sin listas sueltas: todo **forma⇄significado**.

**Público:** A2→B2. Interfaz en **es-AR** (cambio opcional). **Hints L1** (en/pt) opcionales y encapsulados.

---

## 2) Flujo de sesión (8–10 min)
1. **Descubrir** (30–60″): animación del esquema (T/L).  
2. **Inferir** (3′): laboratorio de escenas (elegir foco: destino, trayecto, interior, contacto, origen, límite…).  
3. **Comprobar** (3′): input estructurado (significado→forma).  
4. **Producir** (2–3′): captioning/dictado o reformulación cambiando de foco.  
5. **Cierre** (30″): confusiones + 1 tarjeta a SRS.

---

## 3) Stack y arquitectura

**Frontend:** React + Vite • React Router • Zustand • Zod • Framer Motion • SVG.  
**Persistencia:** IndexedDB (`idb`) para progreso/SRS.  
**PWA:** `manifest.webmanifest` + `sw.js` (cache-first).  
**Backend (MVP):** no requerido. (Opcional serverless para sync).  
**Rutas:** `/onboarding`, `/home`, `/lesson/:block/:prep`, `/review`, `/explore`, `/rayosx`, `/settings`, `/history`.

**Estructura esperada:**
```
prepolab/
  ├─ public/
  │   ├─ manifest.webmanifest
  │   └─ icons/
  ├─ src/
  │   ├─ components/            # SchemaVisualizer, LabScene, ...
  │   ├─ pages/                 # Home, Onboarding, Lesson, Review, Explore, RayosX, Settings, History
  │   ├─ stores/                # userStore, contentStore, srsStore, analyticsStore
  │   ├─ utils/                 # srs.js, validators.js
  │   ├─ content/               # index.json (seed)
  │   ├─ App.jsx
  │   └─ main.jsx
  ├─ index.html
  ├─ package.json
  ├─ vite.config.js
  └─ sw.js
```

**Diagrama lógico:**
```
UI (React) ──> Estado (Zustand) ──> Validadores & SRS (utils)
       │               │                   │
       └────────────── Content JSON ◄──────┘
```

---

## 4) Modelos de datos (JSON + Zod opcional)

**Item (ítem de práctica):**
```json
{
  "id": "pp_minpair_1",
  "type": "min_pair",
  "stimulus": [
    { "img": "sendero.jpg", "caption": "Caminé ___ el parque" },
    { "img": "salida.jpg",  "caption": "Caminé ___ la salida" }
  ],
  "targets": ["por","para"],
  "feedback": { "wrong_focus": "Marcaste {prep}, pero la intención era {focus}." },
  "srs": { "tags": ["trayecto","destino"] }
}
```

**Scene (laboratorio):**
```json
{
  "id": "mapa_caba",
  "assets": ["map.svg","marker_T.svg","marker_L.svg"],
  "active_focus": ["destino","trayecto"],
  "preferred": { "destino": "para", "trayecto": "por" },
  "alternatives": { "hacia": "aceptable si destino vago" },
  "explanation": "Si importa el punto final, 'para'; si contás el recorrido, 'por'."
}
```

**Preposition (metadatos cognitivos):**
```json
{
  "id": "para",
  "label": "para",
  "prototype": "T→L (destino/fin)",
  "schema": { "focus": ["destino","fin"], "vector": "T->L" },
  "extensions": [
    { "name": "plazo", "pattern": "para + fecha", "example": "El informe es para el viernes" },
    { "name": "beneficiario", "pattern": "para + receptor", "example": "Un regalo para vos" },
    { "name": "propósito", "pattern": "para + infinitivo", "example": "Estudio para aprobar" }
  ],
  "contrasts": ["por"],
  "l1_hints": { "en": "goal/finality", "pt": "finalidade/prazo" }
}
```

**Attempt (resultado):**
```json
{
  "id": "uuid",
  "userId": "uuid",
  "itemId": "pp_minpair_1",
  "timestamp": 1690000000000,
  "response": { "prep": "por", "focus_marked": "destino", "text": null },
  "result": { "correct": false, "reason": "focus_mismatch" },
  "metrics": { "rt_ms": 4100 }
}
```

**Zod (contrato de Item):**
```js
import { z } from 'zod'
export const ItemSchema = z.object({
  id: z.string(),
  type: z.enum(['lab','min_pair','input_structured','production','dictation']),
  targets: z.array(z.string()).optional(),
  stimulus: z.array(z.object({ img: z.string().optional(), caption: z.string().optional() })).optional(),
  prompt: z.string().optional(),
  options: z.array(z.string()).optional(),
  answer: z.string().optional(),
  focus: z.union([z.string(), z.array(z.string())]).optional(),
  validators: z.array(z.object({ rule: z.string() })).optional(),
  feedback: z.record(z.string()).optional(),
  srs: z.object({ tags: z.array(z.string()).optional() }).optional()
})
```

---

## 5) Componentes (contratos mínimos)
- `SchemaVisualizer(vector="T->L", focus="destino")` → SVG del esquema.  
- `LabScene({item,onAnswer})` → el usuario elige foco; la vista sugiere preposición.  
- `MinPairCard({item,onAnswer})` → evalúa par mínimo → `{correct}`.  
- `InputStructured({item,onAnswer})` → mapea significado→forma.  
- `ProductionCard({item,onAnswer})` → texto corto; valida semántica → `{correct,reason?}`.  
- `FeedbackOverlay({visible,correct,message,onClose})` → overlay.

---

## 6) Lógica de validación y SRS (JS)

```js
// focus → preposición (por/para)
export const mapFocusToPrep = ({focus, context}) => {
  if (focus === 'destino' || focus === 'fin' || context?.deadline) return 'para'
  if (focus === 'trayecto' || focus === 'medio' || focus === 'causa' || context?.passiveAgent) return 'por'
  return 'depende'
}

// validación de producción
export function validateProduction({text, target, focus}) {
  const hasPrep = new RegExp(`\b${target}\b`, 'i').test(text)
  if (!hasPrep) return { ok:false, reason:'missing_prep' }
  if (target === 'para' && /\bpor\b/i.test(text) && focus === 'destino') return { ok:false, reason:'focus_mismatch' }
  return { ok:true }
}

// SRS (intervalos)
export function nextReview(level){
  const days = [0,1,3,7,21][Math.max(1, Math.min(5, level))-1]
  return Date.now() + days*86400000
}
export function updateSRS(currentLevel, correct){
  if (correct) return Math.min(5, currentLevel+1)
  return Math.max(1, currentLevel-1)
}
```

---

## 7) Seed de contenidos (MVP) → `src/content/index.json`
```json
{
  "blocks": [
    {
      "id": "b1",
      "label": "Bloque 1 (A2)",
      "lessons": [
        { "prep": "por-para", "label": "Por vs Para", "itemIds": ["pp_lab_1","pp_minpair_1","pp_input_1","pp_prod_1"] },
        { "prep": "a-en-de", "label": "A / En / De", "itemIds": ["aed_lab_1","aed_minpair_1","aed_input_1","aed_prod_1"] }
      ]
    }
  ],
  "itemsById": {
    "pp_lab_1": {
      "id":"pp_lab_1",
      "type":"lab",
      "schema":["destino","trayecto"],
      "prompt":"Mapa simple: ¿Qué querés enfatizar en tu recorrido por CABA?",
      "preferred":{ "destino":"para", "trayecto":"por" },
      "explanation":"Si importa el punto final, usá 'para'; si contás el camino, 'por'."
    },
    "pp_minpair_1": {
      "id":"pp_minpair_1",
      "type":"min_pair",
      "stimulus":[
        {"caption":"Caminé ___ el parque (recorrido)"},
        {"caption":"Caminé ___ la salida (objetivo)"}
      ],
      "targets":["por","para"]
    },
    "pp_input_1": {
      "id":"pp_input_1",
      "type":"input_structured",
      "prompt":"Elegí: 'Subí el video ___ mis amigos' (destinatario)",
      "options":["por","para"],
      "answer":"para",
      "focus":"destino",
      "explanation":"Beneficiario/destinatario → 'para'."
    },
    "pp_prod_1": {
      "id":"pp_prod_1",
      "type":"production",
      "prompt":"Escribí 2 oraciones: una de 'trayecto' y otra de 'destino' (por/para).",
      "targets":["por","para"],
      "focus":["trayecto","destino"]
    },
    "aed_lab_1": {
      "id":"aed_lab_1",
      "type":"lab",
      "schema":["direccion","interior","origen"],
      "prompt":"Elegí foco: llegar / estar dentro / venir de.",
      "preferred":{"direccion":"a","interior":"en","origen":"de"}
    },
    "aed_minpair_1": {
      "id":"aed_minpair_1",
      "type":"min_pair",
      "stimulus":[
        {"caption":"Voy ___ Rosario (dirección)"},
        {"caption":"Estoy ___ Rosario (ubicación)"}
      ],
      "targets":["a","en"]
    },
    "aed_input_1": {
      "id":"aed_input_1",
      "type":"input_structured",
      "prompt":"Seleccioná: 'Vengo ___ Caballito' (origen)",
      "options":["a","en","de"],
      "answer":"de",
      "focus":"origen"
    },
    "aed_prod_1": {
      "id":"aed_prod_1",
      "type":"production",
      "prompt":"Una con 'a' (dirección), una con 'en' (interior), una con 'de' (origen).",
      "targets":["a","en","de"],
      "focus":["direccion","interior","origen"]
    }
  }
}
```

---

## 8) Setup local

**Requisitos:** Node 18+

```bash
# Crear proyecto
npm create vite@latest prepolab -- --template react
cd prepolab

# Instalar dependencias
npm i react-router-dom zustand zod framer-motion idb

# Estructura
mkdir -p public src/{components,pages,stores,utils,content}

# PWA
printf '{ "name":"PrepoLab","short_name":"PrepoLab","start_url":"/","display":"standalone","background_color":"#0a0a0a","theme_color":"#0a0a0a","icons":[] }' > public/manifest.webmanifest
cat > sw.js <<'EOF'
const CACHE='prepolab-cache-v1'
const ASSETS=['/','/index.html']
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(self.skipWaiting()))})
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()))
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url)
  if(u.origin===self.location.origin){e.respondWith(caches.match(e.request).then(x=>x||fetch(e.request)))}
})
EOF

# Registrar SW en src/main.jsx (agregar):
# if ('serviceWorker' in navigator) { window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js')) }

# Seed JSON → src/content/index.json (usar el bloque del punto 7)
# Ejecutar
npm run dev
```

---

## 9) Deployment

### Vercel (recomendado)
- Importar repo. Framework: **Vite**. Build: `vite build`. Output: `dist`.

### Netlify (`netlify.toml`)
```toml
[build]
  command = "vite build"
  publish = "dist"
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Cloudflare Pages
- Build: `vite build` • Output: `dist`.

### Docker (opcional)
```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY . .
RUN npm ci && npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
RUN printf "server {\n  listen 80;\n  server_name _;\n  location / {\n    try_files $uri /index.html;\n  }\n}\n" > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx","-g","daemon off;"]
```

---

## 10) CI/CD (GitHub Actions)
```yaml
name: CI
on:
  push: { branches: [ main ] }
  pull_request: { branches: [ main ] }
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - run: npm test --if-present
```

---

## 11) Checks post-deploy
- `/` responde 200 < 500 ms p50.  
- SPA fallback: `/lesson/b1/por-para` sirve la app.  
- PWA: manifest y SW activos (install prompt).  
- Funcional: completar por/para y ver 1 tarjeta SRS.  
- A11y: foco visible, teclado, contraste ≥ 4.5:1.

---

## 12) Prompts para IA (copiar/pegar)

**Vercel:**
```
Desplegá la PWA Vite + React “PrepoLab” según PREPOLAB_FULL_DEPLOY.md.
- Estructura esperada y seed en src/content/index.json.
- Rutas SPA indicadas.
- Build: vite build. Output: dist.
- Verificá SW y manifest. Entregá URL pública.
```

**Netlify:**
```
Publicá “PrepoLab” en Netlify con SPA fallback 200.
- Build: npm run build (vite build). Publish: dist.
- Agregá netlify.toml con redirects.
- Compartí la URL.
```

**Docker:**
```
Construí y corré la imagen estática.
- docker build -t prepolab:0.1.0 .
- docker run -p 8080:80 prepolab:0.1.0
```

---

## 13) Contenido pedagógico (resumen)
- **por vs para:** lab (CABA), mínimo par (parque/salida), input (destinatario), rayos X (plazo/causa), producción (trayecto vs destino), dictado (Constitución → para).  
- **a / en / de:** dirección y a personal; interior/soporte; origen/posesión.

---

## 14) Decisiones pendientes
- Audio en dictados (todos o B1+).  
- Hints L1 por defecto según perfil.  
- 8 vs 10 ítems por sesión.

---

## 15) Licencia y privacidad
- Licencia: MIT/Apache-2.0/propietaria (definir).  
- Datos: IndexedDB local. Sin backend en MVP.  
- Si hay sync/telemetría: consentimiento y anonimización (GDPR/CCPA).
