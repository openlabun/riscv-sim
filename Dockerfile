# Utiliza una imagen base de Node.js 18 para construir la aplicación
FROM node:22 AS build

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de la aplicación al contenedor
COPY ./app/package.json ./app/package-lock.json ./
COPY ./app/ ./

# Elimina el archivo package-lock.json y la carpeta node_modules si existen
RUN rm -rf node_modules package-lock.json

# Instala las dependencias
RUN npm install

# Construye la aplicación
RUN npm run build

# Utiliza una imagen base de Node.js 18 para servir la aplicación
FROM node:22

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos construidos al directorio de trabajo
COPY --from=build /app/dist /app/build

# Instala un servidor estático para servir la aplicación
RUN npm install -g serve

# Expone el puerto 3000
EXPOSE 3000

# Comando para iniciar el servidor estático
CMD ["serve", "-s", "build", "-l", "3000"]