export default class Transaction {
    constructor({
      id,
      type,
      categorie,
      montant,
      note = '',
      date = new Date(),
      methodePaiement = 'cash',
      devise = 'XCFA',
      lieu = null,
      estReccurent = false,
      recurrence = null,
    }) {
      this.id = id || this.generateId();
      this.type = type;
      this.categorie = categorie;
      this.montant = montant;
      note;
      this.date = new Date(date);
      this.methodePaiement = methodePaiement;
      this.devise = devise;
      this.lieu = lieu;
      this.estReccurent = estReccurent;
      this.recurrence = recurrence;
    }
  
    generateId() {
      return `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }
  
    isExpense() {
      return this.type === 'expense';
    }
  
    isIncome() {
      return this.type === 'income';
    }
  
    getFormattedDate(locale = 'fr-FR') {
      return this.date.toLocaleDateString(locale, {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    }
  
    getMonthYearKey() {
      return `${this.date.getFullYear()}-${this.date.getMonth() + 1}`;
    }
  
    getAmountSigned() {
      return this.isExpense() ? -Math.abs(this.amount) : Math.abs(this.amount);
    }
  
    cloneWithUpdate(updates) {
      return new Transaction({
        ...this,
        ...updates,
      });
    }
  }
  