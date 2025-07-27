// src/models/Category.js

class Category {
    /**
     * @param {string} name - Le nom de la catégorie (ex: "Nourriture", "Salaire").
     * @param {'income' | 'expense'} type - Le type de la catégorie.
     * @param {string} [id=''] - L'ID du document Firestore.
     * @param {string} [iconName='default'] - Le nom de l'icône MaterialCommunityIcons (ou autre).
     * @param {string} [color='#607D8B'] - Le code couleur hexadécimal pour la catégorie.
     * @param {boolean} [isUserDefined=false] - Indique si la catégorie a été créée par l'utilisateur.
     * @param {string} [uid] - L'UID de l'utilisateur si la catégorie est définie par l'utilisateur (optionnel).
     */
    constructor(
      name,
      type,
      id = '',
      iconName = 'default',
      color = '#607D8B',
      isUserDefined = false,
      uid = null
    ) {
      if (!name || !type) {
        throw new Error("Category requires a name and type.");
      }
      if (type !== 'income' && type !== 'expense') {
        throw new Error("Category type must be 'income' or 'expense'.");
      }
  
      this.id = id;
      this.name = name;
      this.type = type;
      this.iconName = iconName;
      this.color = color;
      this.isUserDefined = isUserDefined;
      this.uid = uid; // Sera défini si isUserDefined est true
    }
  
    /**
     * Crée une instance de Category à partir d'un document Firestore.
     * @param {Object} docData - Les données brutes d'un document Firestore.
     * @param {string} id - L'ID du document Firestore.
     * @returns {Category}
     */
    static fromFirestore(docData, id) {
      if (!docData) {
        throw new Error("Document data cannot be null or undefined.");
      }
      return new Category(
        docData.name,
        docData.type,
        id,
        docData.iconName || 'default',
        docData.color || '#607D8B',
        docData.isUserDefined || false,
        docData.uid || null
      );
    }
  
    /**
     * Convertit l'instance Category en un objet JavaScript plat pour Firestore.
     * @returns {Object} Un objet compatible avec Firestore.
     */
    toFirestore() {
      return {
        name: this.name,
        type: this.type,
        iconName: this.iconName,
        color: this.color,
        isUserDefined: this.isUserDefined,
        // N'inclure uid que si la catégorie est définie par l'utilisateur
        ...(this.isUserDefined && { uid: this.uid }),
      };
    }
  }
  
  export default Category;