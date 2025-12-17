const { ObjectId } = require('mongodb');

/**
 * Modelo de Destino
 * Representa un destino turístico en la base de datos
 */
class Destination {
  constructor(data) {
    this._id = data._id;
    this.name = data.name;
    this.country = data.country;
    this.description = data.description || '';
    this.lat = data.lat || null;
    this.lng = data.lng || null;
    this.img = data.img || null;
    this.userId = data.userId || null; // null = destino compartido
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  /**
   * Convierte el modelo a un objeto JSON
   */
  toJSON() {
    return {
      _id: this._id?.toString(),
      name: this.name,
      country: this.country,
      description: this.description,
      lat: this.lat,
      lng: this.lng,
      img: this.img,
      userId: this.userId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Convierte el modelo a un documento MongoDB
   */
  toDocument() {
    const doc = { ...this };
    if (doc._id) {
      doc._id = new ObjectId(doc._id);
    } else {
      delete doc._id;
    }
    return doc;
  }

  /**
   * Valida los datos del destino
   */
  validate() {
    const errors = [];

    if (!this.name || this.name.trim().length < 2) {
      errors.push('El nombre es obligatorio y debe tener al menos 2 caracteres');
    }

    if (!this.country || this.country.trim().length < 2) {
      errors.push('El país es obligatorio y debe tener al menos 2 caracteres');
    }

    if (this.lat !== null && (this.lat < -90 || this.lat > 90)) {
      errors.push('La latitud debe estar entre -90 y 90');
    }

    if (this.lng !== null && (this.lng < -180 || this.lng > 180)) {
      errors.push('La longitud debe estar entre -180 y 180');
    }

    return errors;
  }

  /**
   * Crea un destino desde un documento de MongoDB
   */
  static fromDocument(doc) {
    if (!doc) return null;
    return new Destination({
      _id: doc._id,
      name: doc.name,
      country: doc.country,
      description: doc.description,
      lat: doc.lat,
      lng: doc.lng,
      img: doc.img,
      userId: doc.userId,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    });
  }
}

module.exports = Destination;
