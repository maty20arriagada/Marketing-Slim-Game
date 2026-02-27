# 🖥️ Guía de Despliegue en Servidor — MKT SLIM GAME B2B

> Cómo pasar de "funciona en mi PC" a "funciona en internet para toda la clase".

---

## Opción A: Servidor Local en Red del Campus (Más Rápido)

Ideal para clases presenciales. El servidor corre en tu laptop y los alumnos acceden desde la misma red WiFi.

**Requisitos:** Python 3 o Node.js instalado.

### Con Python (ya funcionando):
```bash
cd "Proyecto MKT Mix"
python -m http.server 8765
```
Los alumnos acceden a: `http://<TU-IP-LOCAL>:8765`

Para ver tu IP local en Windows:
```powershell
ipconfig
# Busca "IPv4 Address" bajo tu red WiFi
# Ejemplo: 192.168.1.45 → URL: http://192.168.1.45:8765
```

### Con Node.js (recomendado a futuro):
```bash
npm install
npm start
```
Los alumnos acceden a: `http://<TU-IP-LOCAL>:3000`

---

## Opción B: Hosting en la Nube (Permanente)

Para que los alumnos accedan desde cualquier lugar, en cualquier momento, con una URL fija.

### Plataforma Recomendada: **Railway** (gratuito para proyectos pequeños)

**Pasos:**

1. **Sube el proyecto a GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - MKT SLIM GAME B2B Simulator"
   git remote add origin https://github.com/tu-usuario/MKT SLIM GAME-b2b.git
   git push -u origin main
   ```

2. **Crea una cuenta en Railway**
   - Ve a [railway.app](https://railway.app) e inicia sesión con tu cuenta de GitHub.

3. **Nuevo Proyecto → Deploy desde GitHub**
   - Selecciona el repositorio `MKT SLIM GAME-b2b`.
   - Railway detectará automáticamente el `Procfile` y usará Node.js.
   - Haz clic en **"Deploy"**.

4. **Configura las variables de entorno**
   - En el panel de Railway, ve a **"Variables"**.
   - Agrega las variables del `.env.example` (mínimo `PORT=3000`).

5. **Obtén la URL pública**
   - Railway genera automáticamente una URL del tipo: `https://MKT SLIM GAME-b2b-production.up.railway.app`
   - Comparte esa URL con tus alumnos. ¡Listo!

---

### Alternativa: **Render** (también gratuito)

1. Ve a [render.com](https://render.com) → New Web Service.
2. Conecta tu repositorio de GitHub.
3. Build Command: `npm install`
4. Start Command: `node server.js`
5. Despliega y obtén tu URL pública.

---

### Alternativa: **Vercel** (ideal para sitios estáticos sin backend)

Mientras el proyecto sea solo HTML/CSS/JS (sin `server.js` necesario):
```bash
npm install -g vercel
vercel --prod
```
Vercel genera una URL como `https://MKT SLIM GAME-b2b.vercel.app` en segundos.  
⚠️ **Limitación:** Vercel en modo estático no podrá servir la futura API del motor Python. Cambia a Railway/Render cuando lo integres.

---

## Variables de Entorno Requeridas

Ver archivo `.env.example` en la raíz del proyecto:

```
PORT=3000
# LLM_API_KEY=sk-...            (cuando integres el motor IA)
# LLM_PROVIDER=openai           (openai | anthropic | google)
# SESSION_SECRET=tu-secreto     (para autenticación futura de equipos)
```

---

## Reverse Proxy con Nginx (Avanzado)

Si tienes un servidor VPS propio (DigitalOcean, Linode, etc.) y quieres usar un dominio real:

```nginx
server {
    listen 80;
    server_name MKT SLIM GAME.tudominio.cl;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Instala SSL gratuito con Certbot:
```bash
sudo certbot --nginx -d MKT SLIM GAME.tudominio.cl
```

---

## Checklist Pre-Lanzamiento

- [ ] El servidor arranca con `npm start` sin errores
- [ ] `index.html` carga correctamente en el puerto del servidor
- [ ] Los 4 roles de navegación funcionan (alumno dashboard, decisiones, resultados, profesor)
- [ ] Los datos mock se renderizan completos (métricas, tabla de posiciones, árbitro)
- [ ] El calculador de decisiones opera en tiempo real
- [ ] La URL pública funciona desde un celular externo a la red del campus
- [ ] Variables de entorno configuradas en la plataforma cloud

---

*Simulador MKT SLIM GAME — Guía de Despliegue · 2025*
