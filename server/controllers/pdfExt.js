const fs = require('fs');
const pdfPoppler = require('pdf-poppler');
const path = require('path');
const Tesseract = require('tesseract.js');
require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
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

function splitText(text, numParts) {
    const partLength = Math.ceil(text.length / numParts);
    const parts = [];
    for (let i = 0; i < numParts; i++) {
      parts.push(text.slice(i * partLength, (i + 1) * partLength));
    }
    return parts;
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

/*async function analyzeAndStructureText(text) {

    const response = await openaiClient.chat.completions.create({
        model: "gpt-4o",
        messages: [
            { 
                role: 'system', 
                content: `
                Per favore, schematizza il seguente testo definendo delle gerarchie in formato JSON compatibile con React Flow.
                Assicurati che la risposta contenga due proprietà principali: "nodes" e "edges".
                Ogni nodo deve avere un id, data (con etichetta del nodo) e posizione (coordinate x, y).
                Ogni arco deve avere un id, source, target, type e animated.
                Per ogni sottogruppo, identifica almeno 3 punti chiave principali, quindi titolo principale, sottogruppi, e ogni sottogruppo un nodo per ogni punto chiave.
                La risposta JSON deve essere simile a questa, parti direttamente dalla parentesi graffa di apertura del JSON:
                {
                  "nodes": [
                    {"id": "1", "data": {"label": "Titolo Principale"}, "position": {"x": 100, "y": 100}},
                    {"id": "1a", "data": {"label": "Sottogruppo 1"}, "position": {"x": 200, "y": 200}},
                    {"id": "1a1", "data": {"label": "Punto Chiave 1"}, "position": {"x": 300, "y": 200}},
                    {"id": "1a2", "data": {"label": "Punto Chiave 2"}, "position": {"x": 300, "y": 300}},
                    {"id": "1a3", "data": {"label": "Punto Chiave 3"}, "position": {"x": 300, "y": 400}}
                  ],
                  "edges": [
                    {"id": "e1-1a", "source": "1", "target": "1a", "type": "smoothstep", "animated": true},
                    {"id": "e1a-1a1", "source": "1a", "target": "1a1", "type": "smoothstep", "animated": true},
                    {"id": "e1a-1a2", "source": "1a", "target": "1a2", "type": "smoothstep", "animated": true},
                    {"id": "e1a-1a3", "source": "1a", "target": "1a3", "type": "smoothstep", "animated": true}
                  ]
                }
                Assicurati di terminare la risposta con un JSON completo e corretto.
            
                Testo:
                ${text}
                `
            },
            {
                role: 'user', 
                content: `Rispondi con un JSON completo e corretto.`
            },
        ],
        max_tokens: 3250,
        n: 1,
        stop: null,
        temperature: 0.7
    });

    return response.choices[0].message.content;
}*/
function parseJsonResponse(response) {
    const jsonIndicator = '```json';
    if (response.includes(jsonIndicator)) {
      const cleanedResponse = response.replace(/```json|```/g, '');
      try {
        const parsedData = JSON.parse(cleanedResponse);
        const nodes = parsedData.nodes || [];
        const edges = parsedData.edges || [];
        return { nodes, edges };
      } catch (error) {
        console.error('Failed to parse JSON:', error);
        return { nodes: [], edges: [] };
      }
    } else {
      console.error('Response does not contain valid JSON format.');
      return { nodes: [], edges: [] };
    }
  }

  function convertJsonToFlowElements(jsonData) {
    const nodes = [];
    const edges = [];
    const yOffset = 150;
    const xOffset = 300;
    let currentNodeX = 0;
    let curretnNodeY = 0;
    const keyPointYOffset = 100;
    let parentNodeId = 'root';
  
    const totalParagraphs = jsonData.paragraphs.length;
    const titleX = (totalParagraphs - 1) * xOffset / 2;
    // Creazione del nodo radice
    nodes.push({
      id: 'root',
      data: { text: jsonData.title, type: '1' },
      position: { x: titleX, y: -150 },
      type: 'rootNode',
      style: {
        backgroundColor: '#fff',
        color: '#1E293B',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#0b132b',
        borderRadius: '10px'
      },
      width: 242,
      height: 46
    });
  
    currentNodeX += xOffset;
    curretnNodeY += yOffset;

  
    jsonData.paragraphs.forEach((paragraph, pIndex) => {
      const paragraphNodeId = `p${pIndex}-${uuidv4()}`;
  
      nodes.push({
        id: paragraphNodeId,
        data: { text: paragraph.paragraph, type: '2', parentId: parentNodeId },
        position: { x: currentNodeX, y: curretnNodeY },
        type: 'topicNode',
        style: {
          backgroundColor: 'white',
          borderStyle: 'solid',
          borderWidth: 1,
          borderColor: '#0b132b',
          color: '#000000',
          borderRadius: '10px'
        },
        width: 242,
        height: 42
      });
  
      edges.push({
        id: `e-${parentNodeId}-${paragraphNodeId}`,
        source: parentNodeId,
        target: paragraphNodeId,
        type: 'customizable',
        animated: false,
        style: { stroke: '#0b132b' }
      });
  
      let keyPointX = currentNodeX;
      let keyPointY = yOffset + 250;
  
      paragraph.key_points.forEach((keyPoint, kIndex) => {
        const keyPointNodeId = `k${pIndex}-${kIndex}-${uuidv4()}`;
  
        nodes.push({
          id: keyPointNodeId,
          data: { text: keyPoint, type: '2', parentId: paragraphNodeId },
          position: { x: currentNodeX, y: keyPointY },
          type: 'topicNode',
          style: {
            backgroundColor: 'white',
            borderStyle: 'solid',
            borderWidth: 1,
            borderColor: '#0b132b',
            color: '#000000',
            borderRadius: '10px'
          },
          width: 242,
          height: 42
        });
  
        edges.push({
          id: `e-${paragraphNodeId}-${keyPointNodeId}`,
          source: paragraphNodeId,
          target: keyPointNodeId,
          type: 'customizable',
          animated: false,
          style: { stroke: '#0b132b' }
        });
  
        keyPointY += keyPointYOffset;
        keyPointX += xOffset;
      });
  
      currentNodeX += xOffset;
    });
  
    return { nodes, edges };
  }

  async function analyzeAndStructureText(text) {
    const response = await openaiClient.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: 'system',
          content: `
            Analizza il seguente testo e restituisci una struttura JSON con il titolo principale, i paragrafi e tre punti chiave per ogni paragrafo.
            Analizza bene il testo definendo le gerarchie e estrai i punti chiave per ogni paragrafo per creare una mappa concettuale, inserisci per ogni paragrafo almeno 3 punti chiave, che siano necessari secondo la tua analisi.
            La struttura deve essere come segue, non inserire virgole o scritte ma solo le parentesi graffe del json:
            {
              "title": "Titolo Principale",
              "paragraphs": [
                {
                  "paragraph": "Primo Paragrafo",
                  "key_points": [
                    "Punto chiave 1 del primo paragrafo",
                    "Punto chiave 2 del primo paragrafo",
                    "Punto chiave 3 del primo paragrafo"
                  ]
                },
                {
                  "paragraph": "Secondo Paragrafo",
                  "key_points": [
                    "Punto chiave 1 del secondo paragrafo",
                    "Punto chiave 2 del secondo paragrafo",
                    "Punto chiave 3 del secondo paragrafo"
                  ]
                }
                // Altri paragrafi...
              ]
            }
  
            Testo:
            ${text}
          `
        },
        {
          role: 'user',
          content: `Rispondi con un JSON completo e corretto.`
        },
      ],
      max_tokens: 1600,
      n: 1,
      stop: null,
      temperature: 0.7
    });
  
    const parsedResponse = JSON.parse(response.choices[0].message.content);
    console.log(response.choices[0].message.content);
    const convertedResponse = convertJsonToFlowElements(parsedResponse);
    console.log(convertedResponse)
    return convertedResponse;
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
        return structuredText
    } catch (error) {
        console.error('Error processing PDF:', error);
    }
}
