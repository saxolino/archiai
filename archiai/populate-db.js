// populate-db.js - Script per aggiungere prodotti di esempio al database
const mongoose = require('mongoose');

// Connessione a MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/archiai', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connesso'))
.catch(err => console.error('Errore connessione MongoDB:', err));

// Schema Prodotto (stesso schema definito nel server.js)
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

// Prodotti di esempio
const sampleProducts = [
  {
    nome: "Lampada Solair",
    categoria: "lampada",
    sottocategoria: "tavolo",
    colore: ["giallo", "oro"],
    materiale: ["metallo", "vetro"],
    dimensioni: {
      lunghezza: 25,
      larghezza: 25,
      altezza: 45,
      unita: "cm"
    },
    prezzo: 159.00,
    immagini: ["/images/lampada-solair.jpg"],
    descrizione: "Elegante lampada da tavolo con base in metallo dorato e diffusore in vetro ambrato.",
    specificheTecniche: {
      potenza: "40W",
      voltaggio: "220-240V",
      attacco: "E27"
    }
  },
  {
    nome: "Pendente Citrus",
    categoria: "lampada",
    sottocategoria: "sospensione",
    colore: ["giallo", "arancione"],
    materiale: ["metallo", "tessuto"],
    dimensioni: {
      lunghezza: 35,
      larghezza: 35,
      altezza: 40,
      unita: "cm"
    },
    prezzo: 245.00,
    immagini: ["/images/pendente-citrus.jpg"],
    descrizione: "Lampada a sospensione con paralume in tessuto giallo e struttura in metallo nero.",
    specificheTecniche: {
      potenza: "60W",
      voltaggio: "220-240V",
      attacco: "E27",
      lunghezzaCavo: "150cm"
    }
  },
  {
    nome: "Lampada Helios",
    categoria: "lampada",
    sottocategoria: "terra",
    colore: ["giallo", "ottone"],
    materiale: ["ottone", "metallo"],
    dimensioni: {
      lunghezza: 40,
      larghezza: 40,
      altezza: 160,
      unita: "cm"
    },
    prezzo: 189.50,
    immagini: ["/images/lampada-helios.jpg"],
    descrizione: "Lampada da terra con base in metallo nero e diffusore orientabile in ottone spazzolato.",
    specificheTecniche: {
      potenza: "60W",
      voltaggio: "220-240V",
      attacco: "E27",
      interruttore: "a pedale"
    }
  },
  {
    nome: "Tavolo Minimal",
    categoria: "tavolo",
    sottocategoria: "pranzo",
    colore: ["bianco", "naturale"],
    materiale: ["legno", "mdf"],
    dimensioni: {
      lunghezza: 180,
      larghezza: 90,
      altezza: 75,
      unita: "cm"
    },
    prezzo: 695.00,
    immagini: ["/images/tavolo-minimal.jpg"],
    descrizione: "Tavolo da pranzo minimal con piano in MDF bianco e gambe in legno di frassino.",
    specificheTecniche: {
      carico: "fino a 100kg",
      montaggio: "richiesto"
    }
  },
  {
    nome: "Sedia Nordic",
    categoria: "sedia",
    sottocategoria: "pranzo",
    colore: ["nero", "naturale"],
    materiale: ["legno", "tessuto"],
    dimensioni: {
      lunghezza: 50,
      larghezza: 55,
      altezza: 82,
      unita: "cm"
    },
    prezzo: 149.00,
    immagini: ["/images/sedia-nordic.jpg"],
    descrizione: "Sedia in stile nordico con struttura in legno di quercia e seduta imbottita in tessuto.",
    specificheTecniche: {
      carico: "fino a 120kg",
      montaggio: "richiesto"
    }
  }
  // Aggiungi altri prodotti qui...
];

// Funzione per popolare il database
async function populateDatabase() {
  try {
    // Cancella tutti i prodotti esistenti
    await Product.deleteMany({});
    console.log('Database pulito');
    
    // Inserisci i nuovi prodotti
    const result = await Product.insertMany(sampleProducts);
    console.log(`Inseriti ${result.length} prodotti`);
    
    // Chiudi la connessione
    mongoose.connection.close();
  } catch (error) {
    console.error('Errore nel popolare il database:', error);
  }
}

// Esegui la funzione
populateDatabase();
