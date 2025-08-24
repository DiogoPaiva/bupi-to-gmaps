# bupi-to-gmaps

---

# 🇵🇹 Conversor KML BUPi → Google Maps

Este repositório contém um script em Node.js que converte ficheiros KML do sistema **BUPi** (Balcão Único do Prédio) para ficheiros KML compatíveis com o **Google Maps** (My Maps).  
A motivação é a **incompatibilidade de estrutura/atributos XML** entre os dois ecossistemas, nomeadamente:

- **Namespaces e atributos extra** (`xmlns`, `xsi:schemaLocation`, prefixos proprietários) que podem provocar interpretações inconsistentes.
- **Diferenças na declaração de estilos/opacidades** que o Google nem sempre lê se o documento não estiver normalizado.
- **Metadados extensivos** em `<ExtendedData>`/`<description>` e elementos adicionais que o Google pode ignorar parcialmente se o KML tiver variações estruturais.
- **Coordenadas** por vezes sem altitude explícita e **polígonos não fechados**, o que leva a falhas de renderização no Google Maps/My Maps.

O conversor **normaliza** estes aspetos (mantendo estilos e metadados), **fecha polígonos abertos** e força o formato de coordenadas para `lon,lat,0`, produzindo KMLs prontos a importar no Google Maps.

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 16 ou superior recomendada)
- [Yarn](https://yarnpkg.com/)

## Funcionalidades

- 🔄 **Conversão automática de ficheiros**

  - Lê todos os ficheiros `.kml` da pasta `bupi/`.
  - Exporta os ficheiros convertidos para a pasta `googlemaps/`, mantendo o **mesmo nome**.

- 🎨 **Preservação de estilos**

  - Mantém `<Style>`/`<StyleMap>`, cores, preenchimentos e transparências.
  - Mantém `<name>`, `<description>` e `<ExtendedData>`.
  - Mantém e converte corretamente metadados e atributos definidos no KML original.

- 🛠 **Normalização para Google Maps**

  - Remove apenas namespaces/atributos supérfluos que causam incompatibilidades.
  - **Fecha polígonos** quando o último ponto difere do primeiro.
  - **Força altitude `0`** em todas as entradas de `<coordinates>`: `lon,lat,0`.

- 📜 **Registo de operações**
  - Escreve/atualiza `googlemaps/conversion-log.txt` em **modo append**.
  - Para cada execução regista:
    - Data/hora
    - Ficheiros processados
    - Número total de **shapes fechadas** automaticamente

---

## Estrutura de Pastas

📂 projeto/
├── 📂 bupi/ # Ficheiros KML originais (input)
├── 📂 googlemaps/ # Ficheiros KML convertidos (output)
│ └── conversion-log.txt
├── kml-bupi-to-gmaps-converter.js
├── package.json
└── .gitignore

---

## Utilização

**1. Instalar dependências:**

```bash
yarn install
```

**2. Colocar os ficheiros `.kml` originais na pasta `bupi/.`**
**3. Correr o comando:**

```bash
yarn convert
ou
node kml-bupi-to-gmaps-converter.js
```

**4. Ver resultados:**

- Ficheiros convertidos: googlemaps/
- Log: googlemaps/conversion-log.txt

### Notas Técnicas

- O script atua apenas sobre o conteúdo de <coordinates> (normalização e fecho de anéis), preservando estilos e metadados existentes.
- O fecho de polígonos aplica-se quando existem ≥ 3 vértices e o primeiro ponto difere do último.

- A normalização de altitude para 0 melhora a consistência no Google Maps/My Maps.

- O log é acumulativo entre execuções (modo append).

---

### 🇬🇧 English Version

# KML Converter BUPi → Google Maps

This repository contains a Node.js script that converts KML files from the BUPi system into KML files compatible with Google Maps, preserving styles, metadata, and automatically closing open polygons.

## Features

- Automatic conversion of all `.kml` files inside the `bupi/` folder.
- Outputs converted files into the `googlemaps/` folder, keeping the same filenames.
- Preserves `<Style>`, colors, transparency, and metadata.
- Automatically closes open polygons (shapes) for Google Maps compatibility.
- Execution log saved at `googlemaps/conversion-log.txt`:
  - Date and time of execution
  - Each processed file name
  - Number of shapes closed
- Log is written in **append mode**, keeping a history of conversions.

## Requirements

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [Yarn](https://yarnpkg.com/)

## Installation

**1. Clone the repository:**

```bash
git clone <repository-url>
cd <project-folder>
```

**2. Install dependencies:**

```bash
yarn install
```

**3. Run the script**

```bash
yarn convert
or
node kml-bupi-to-gmaps-converter.js
```

**4. Check Results:**

- Converted files: googlemaps/
- Log: googlemaps/conversion-log.txt
