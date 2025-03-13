require('dotenv').config();

const express = require('express');
const { OpenAI } = require('openai');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve la homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connesso'))
  .catch(err => console.error('Errore connessione MongoDB:', err));

// Schema Prodotto
const productSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  categoria: { type: String, required: true },
  sottocategoria: String,
  colore: [String],
  materiale: [String],
  dimensioni: {
    lunghezza: Number,
    larghezza: Number,
    altezza: Number,
    unita: { type: String, default: 'cm' }
  },
  prezzo: { type: Number, required: true },
  immagini: [String],
  descrizione: String,
  specificheTecniche: Object,
  disponibilita: { type: Boolean, default: true },
  dataInserimento: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

// API endpoint
app.post('/api/query', async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: 'Query non specificata' });

  try {
    const searchParams = await extractSearchParams(query);
    const products = await searchProducts(searchParams);
    const aiResponse = await generateAIResponse(query, products);
    res.json({ response: aiResponse, products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Errore nella richiesta' });
  }
});

// Funzioni ausiliarie
async function extractSearchParams(userQuery) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: "Estrai parametri (categoria, colore, materiale, prezzo, dimensioni) in formato JSON dalla richiesta dell'utente." },
      { role: "user", content: userQuery }
    ],
    response_format: { type: "json_object" }
  });
  return JSON.parse(completion.choices[0].message.content);
}

async function searchProducts(params) {
  const query = {};
  if (params.categoria) query.categoria = { $regex: params.categoria, $options: 'i' };
  if (params.colore) query.colore = { $in: Array.isArray(params.colore) ? params.colore : [params.colore] };
  if (params.materiale) query.materiale = { $in: Array.isArray(params.materiale) ? params.materiale : [params.materiale] };
  if (params.prezzo) {
    if (params.prezzo.min && params.prezzo.max) query.prezzo = { $gte: params.prezzo.min, $lte: params.prezzo.max };
    else if (params.prezzo.min) query.prezzo = { $gte: params.prezzo.min };
    else if (params.prezzo.max) query.prezzo = { $lte: params.prezzo.max };
    else if (typeof params.prezzo === 'number') query.prezzo = { $lte: params.prezzo };
  }
  return await Product.find(query).limit(10);
}

async function generateAIResponse(userQuery, products) {
  const prompt = `
    L'utente ha chiesto: "${userQuery}".
    ${products.length ? `Trovati ${products.length} prodotti.` : 'Nessun prodotto trovato.'}
    Rispondi brevemente e professionalmente.
  `;
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: "Sei un assistente professionale per architetti." },
      { role: "user", content: prompt }
    ]
  });
  return completion.choices[0].message.content;
}

// Avvia server
app.listen(port, () => {
  console.log(`Server avviato sulla porta ${port}`);
});