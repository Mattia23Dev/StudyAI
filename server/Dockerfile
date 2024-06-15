# Usa un'immagine di base Node.js
FROM node:14

# Installa ImageMagick e Poppler-utils
RUN apt-get update && apt-get install -y imagemagick poppler-utils
# Imposta la directory di lavoro
WORKDIR /usr/src/app

# Copia i file del progetto
COPY package*.json ./
COPY . .

# Installa le dipendenze
RUN npm install

# Espone la porta dell'app
EXPOSE 5000

# Avvia l'app
CMD ["npm", "start"]
