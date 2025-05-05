# Etapa 1: Construcción
FROM node:22 AS builder

# Habilita pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copia solo lo necesario para instalar dependencias primero (cache optimizada)
COPY package.json pnpm-lock.yaml ./

# Instala dependencias
RUN pnpm install --frozen-lockfile

# Copia el resto del proyecto
COPY . .

# Compila la aplicación
RUN pnpm build

# Etapa 2: Producción
FROM node:22 AS runner

# Habilita pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copia solo lo necesario para ejecutar
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.mjs ./next.config.mjs

# Expone el puerto por defecto de Next.js
EXPOSE 3000

# Comando para iniciar Next.js en producción
CMD ["pnpm", "start"]
