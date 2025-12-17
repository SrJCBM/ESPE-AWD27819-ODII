const { MongoClient } = require('mongodb');

let client = null;
let db = null;

/**
 * Conecta a MongoDB Atlas
 */
async function connect() {
  if (db) return db;
  
  try {
    const uri = process.env.MONGO_URI;
    const dbName = process.env.MONGO_DB || 'travel_brain';
    
    if (!uri) {
      throw new Error('MONGO_URI no está definido en las variables de entorno');
    }
    
    client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    await client.connect();
    db = client.db(dbName);
    
    console.log(`✅ Conectado a MongoDB: ${dbName}`);
    return db;
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    throw error;
  }
}

/**
 * Obtiene la instancia de la base de datos
 */
function getDb() {
  if (!db) {
    throw new Error('Base de datos no inicializada. Llama a connect() primero.');
  }
  return db;
}

/**
 * Cierra la conexión a MongoDB
 */
async function close() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('🔌 Conexión a MongoDB cerrada');
  }
}

module.exports = { connect, getDb, close };
