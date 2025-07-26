export class User {
  constructor({
    id = null,
    nom = '',
    prenom = '',
    telephone = '',
    email = '',
    motDePasse = '',
    image = null,
    dateCreation = new Date(),
    dateModification = new Date(),
  }) {
    this.id = id;
    this.nom = nom;
    this.prenom = prenom;
    this.telephone = telephone;
    this.email = email;
    this.motDePasse = motDePasse;
    this.image = image;
    this.dateCreation = dateCreation;
    this.dateModification = dateModification;
  }

  // Getter pour le nom complet
  get nomComplet() {
    return `${this.prenom} ${this.nom}`.trim();
  }

  // Méthode pour obtenir les initiales
  get initiales() {
    const prenomInitiale = this.prenom.charAt(0).toUpperCase();
    const nomInitiale = this.nom.charAt(0).toUpperCase();
    return `${prenomInitiale}${nomInitiale}`;
  }

  // Validation des données utilisateur
  validate() {
    const errors = [];

    if (!this.nom || this.nom.trim().length < 2) {
      errors.push('Le nom doit contenir au moins 2 caractères');
    }

    if (!this.prenom || this.prenom.trim().length < 2) {
      errors.push('Le prénom doit contenir au moins 2 caractères');
    }

    if (!this.telephone || !this.isValidPhone(this.telephone)) {
      errors.push("Le numéro de téléphone n'est pas valide");
    }

    if (!this.email || !this.isValidEmail(this.email)) {
      errors.push("L'adresse email n'est pas valide");
    }

    if (!this.motDePasse || this.motDePasse.length < 6) {
      errors.push('Le mot de passe doit contenir au moins 6 caractères');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Validation email
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validation téléphone (format international/local)
  isValidPhone(phone) {
    // Accepte les formats: +33123456789, 0123456789, etc.
    const phoneRegex = /^(\+237|0)[1-9](\d{8})$/;
    const cleanPhone = phone.replace(/\s/g, '');
    return phoneRegex.test(cleanPhone) || /^\+\d{10,15}$/.test(cleanPhone);
  }

  // Méthode pour nettoyer les données avant sauvegarde
  sanitize() {
    return {
      nom: this.nom.trim(),
      prenom: this.prenom.trim(),
      telephone: this.telephone.replace(/\s/g, ''),
      email: this.email.toLowerCase().trim(),
    };
  }

  // Conversion vers objet pour l'API
  toJSON() {
    return {
      id: this.id,
      nom: this.nom,
      prenom: this.prenom,
      telephone: this.telephone,
      email: this.email,
      image: this.image,
      dateCreation: this.dateCreation,
      dateModification: this.dateModification,
    };
  }

  // Création depuis les données de l'API
  static fromJSON(data) {
    return new User({
      id: data.id,
      nom: data.nom,
      prenom: data.prenom,
      telephone: data.telephone,
      email: data.email,
      image: data.image,
      dateCreation: new Date(data.dateCreation),
      dateModification: new Date(data.dateModification),
    });
  }
}
