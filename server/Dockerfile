# Usa un'immagine di base Node.js
FROM node:14

# Installa ImageMagick e Poppler-utils
RUN apt-get update && apt-get install -y imagemagick poppler-utils apt-utils wget build-essential cmake libfreetype6-dev pkg-config libfontconfig-dev libjpeg-dev libopenjp2-7-dev libcairo2-dev libtiff5-dev -y
RUN wget https://poppler.freedesktop.org/poppler-data-0.4.10.tar.gz \
    && tar -xf poppler-data-0.4.10.tar.gz \
    && cd poppler-data-0.4.10 \
    && make install \
    && cd .. \
    && wget https://poppler.freedesktop.org/poppler-21.03.0.tar.xz \
    && tar -xf poppler-21.03.0.tar.xz \
    && cd poppler-21.03.0 \
    && mkdir build \
    && cd build \
    && cmake .. \
    && make \
    && make install \
    && cd ../.. \
    && ldconfig \
    && rm poppler-data-0.4.10.tar.gz \
    && rm -rf poppler-data-0.4.10 \
    && rm poppler-21.03.0.tar.xz \
    && rm -rf poppler-21.03.0
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
