// batch-converter-bupi-kml.js
// Converte todos os ficheiros KML do BUPi para formato Google Maps/MyMaps
// Lê da pasta "bupi" e grava na pasta "googlemaps" com o mesmo nome
// Mantém estilos e metadados, fecha polígonos e regista log em append


const fs = require("fs");
const path = require("path");
const { DOMParser, XMLSerializer } = require("@xmldom/xmldom");
const xpath = require("xpath");

const inputDir = "./bupi";
const outputDir = "./googlemaps";
const logFile = path.join(outputDir, "conversion-log.txt");

// Criar pasta de destino (limpa se já existir)
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Função que remove apenas namespaces
function removeNamespaces(node) {
  if (node.removeAttribute) {
    node.removeAttribute("xmlns");
    node.removeAttribute("xmlns:xsi");
    node.removeAttribute("xsi:schemaLocation");
  }
  if (node.childNodes) {
    for (let i = 0; i < node.childNodes.length; i++) {
      removeNamespaces(node.childNodes[i]);
    }
  }
}

// Normalizar coordenadas: altitude = 0, polígonos fechados
function normalizeCoordinates(coordsText) {
  let coords = coordsText
    .trim()
    .split(/\s+/)
    .map(c => {
      const [lon, lat] = c.split(",");
      return `${lon},${lat},0`;
    });

  let closed = false;
  if (coords.length > 2 && coords[0] !== coords[coords.length - 1]) {
    coords.push(coords[0]);
    closed = true;
  }

  return { text: coords.join(" "), closed };
}

// Função que converte um ficheiro KML
function convertKml(inputFile, outputFile) {
  const raw = fs.readFileSync(inputFile, "utf-8");
  const dom = new DOMParser().parseFromString(raw, "text/xml");

  removeNamespaces(dom.documentElement);

  let closedCount = 0;

  // Percorrer todos os <coordinates>
  const coordsNodes = xpath.select("//coordinates", dom);
  coordsNodes.forEach(node => {
    const { text, closed } = normalizeCoordinates(node.textContent);
    node.textContent = text;
    if (closed) closedCount++;
  });

  const serializer = new XMLSerializer();
  const output = serializer.serializeToString(dom);

  fs.writeFileSync(outputFile, output, "utf-8");

  return closedCount;
}

// Processar todos os ficheiros da pasta
const files = fs.readdirSync(inputDir).filter(f => f.toLowerCase().endsWith(".kml"));

if (files.length === 0) {
  console.log("Nenhum ficheiro .kml encontrado em ./bupi");
  process.exit(0);
}

let totalClosed = 0;
let logLines = [];
logLines.push("------------------------------------------------------------");
logLines.push(`Execução: ${new Date().toLocaleString("pt-PT")}`);

files.forEach(file => {
  const inputFile = path.join(inputDir, file);
  const outputFile = path.join(outputDir, file);
  const closedCount = convertKml(inputFile, outputFile);
  totalClosed += closedCount;
  logLines.push(`✔ Convertido: ${file} (${closedCount} shapes fechadas)`);
});

logLines.push(`Resumo: ${files.length} ficheiro(s) convertidos com sucesso`);
logLines.push(`Shapes fechadas automaticamente: ${totalClosed}`);
logLines.push("");

// Acrescentar log no ficheiro externo
fs.appendFileSync(logFile, logLines.join("\n"), "utf-8");

console.log(`Log acrescentado em ${logFile}`);
