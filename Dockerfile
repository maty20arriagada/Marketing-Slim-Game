# ── Imagen base oficial de Node.js 20 (Alpine = ligera) ─────────
FROM node:20-alpine

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar primero solo package.json para aprovechar la caché de Docker
# (si no cambian las dependencias, salta el npm install en rebuilds)
COPY package.json ./

# Instalar solo dependencias de producción
RUN npm install --omit=dev

# Copiar el resto del código fuente
COPY . .

# Puerto expuesto (Railway lo sobreescribe con PORT env var)
EXPOSE 3000

# Comando de arranque
CMD ["node", "server.js"]
