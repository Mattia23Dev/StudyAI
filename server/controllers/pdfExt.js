const fs = require('fs');
const pdfPoppler = require('pdf-poppler');
const path = require('path');
const Tesseract = require('tesseract.js');
require('dotenv').config();
const openai = require('openai');

const openaiClient = new openai.OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });
const pdfPath = './documento.pdf';
const outputDir = './images'; 

if (!fs.existsSync(outputDir)){
    fs.mkdirSync(outputDir, { recursive: true });
}

function convertPDFToImages(pdfPath) {
    return new Promise((resolve, reject) => {
        let opts = {
            format: 'jpeg',
            out_dir: outputDir, // Assicurati che questa cartella esista
            out_prefix: 'page',
            page: null // Converte tutte le pagine
        };

        pdfPoppler.convert(pdfPath, opts)
            .then(res => {
                console.log('Pages converted to images:', res);
                resolve(res);  // Risolve la promessa con il risultato della conversione
            })
            .catch(error => {
                console.error('Error converting PDF to images:', error);
                reject(error);  // Rifiuta la promessa con l'errore
            });
    });
}

async function performOCR(imagePath) {
    try {
        const { data: { text } } = await Tesseract.recognize(
            imagePath,
            'ita',
            { logger: m => console.log(m) }
        );
        return text;
    } catch (error) {
        console.error(error);
        return '';
    }
}

async function analyzeAndStructureText(text) {

    const response = await openaiClient.chat.completions.create({
        model: "gpt-4o",
        messages: [
            { 
                role: 'system', 
                content: `Per schematizzare il testo e per favorire un'integrazione automatica con la libreria React Flow, la risposta deve essere formulata seguendo queste direttive dettagliate: 
                            1) Estrazione e Categorizzazione: Identifica e categorizza titoli e sottotitoli per definire gruppi principali e sottogruppi, stabilendo una gerarchia chiara.
                            2) Analisi e Punti Chiave: Analizza ogni paragrafo attentamente per estrarre i punti chiave. Trasforma questi punti in nodi, che saranno i componenti principali della mappa concettuale.
                            3) Strutturazione dei Nodi: Per le liste, trasforma ogni voce in un nodo all'interno di un sottogruppo. Crea collegamenti che indicano relazioni di sequenza o priorità tra i nodi.
                            4) Etichettatura e Chiarezza: Assicurati che ogni nodo della mappa concettuale sia etichettato chiaramente per facilitare la comprensione e la navigazione.
                            5) Formato di Risposta: La risposta deve essere in un formato JSON che specifica id, data (con etichetta del nodo), position (coordinate x, y per la posizione del nodo) e edges (collegamenti tra i nodi con sorgente, destinazione e tipo di collegamento). Questo formato supporta una diretta implementazione nell'interfaccia utente di React Flow.
                            6) Punti chiave: Per ogni sezione e sottosezione, oltre agli elementi già richiesti, includi nodi per i punti chiave principali di ciascun paragrafo. Fornisci dettagli più granulari che possano essere trasformati in sotto-nodi per ogni nodo principale, includendo informazioni specifiche e relazioni tra punti chiave come archi supplementari.
                          Per esempio, la risposta JSON dovrebbe assomigliare a questo: 
                            {
                                "nodes": [
                                  {"id": "1", "data": {"label": "Titolo Principale"}, "position": {"x": 100, "y": 100}},
                                  {"id": "1a", "data": {"label": "Sottotitolo 1"}, "position": {"x": 200, "y": 200}}
                                ],
                                "edges": [
                                  {"id": "e1-1a", "source": "1", "target": "1a", "type": "smoothstep", "animated": true}
                                ]
                            }
                          Questa struttura facilita l'integrazione diretta con la libreria React Flow, permettendo una visualizzazione immediata della mappa concettuale.`
            },
            { 
                role: 'user', 
                content: `Si prega di procedere con la schematizzazione del seguente testo seguendo le istruzioni dettagliate fornite:\n\n${text}`
            },
        ],
        max_tokens: 4096,
        n: 1,
        stop: null,
        temperature: 0.7
    });

    return response.choices[0].message.content;
}

exports.processPDF = async(pdfPath) => {
    console.log('Step 1')
    try {
        await convertPDFToImages(pdfPath);
        const files = fs.readdirSync(outputDir);
        let fullText = '';

        for (const file of files) {
            const imagePath = `${outputDir}/${file}`;
            const text = await performOCR(imagePath);
            fullText += text + ' ';  // Accumulate text from all pages
        }
        console.log(fullText)
        const structuredText = await analyzeAndStructureText(fullText);
        console.log("Structured Text from the entire document:", structuredText);
    } catch (error) {
        console.error('Error processing PDF:', error);
    }
}
