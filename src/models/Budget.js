export default class Budget {
    constructor({
      id,
      userId,
      montant,
      periode = 'mois',
      dateDebut = new Date(),
      finDate = null,
      categories = [],
    }) {
      this.id = id || `budget-${Date.now()}`;
      this.userId = userId;
      this.montant = montant;
      this.periode = periode;
      this.dateDebut = new Date(dateDebut);
      this.finDate = finDate;
      this.categories = categories;
    }
  
    isInPeriod(date = new Date()) {
      const d = new Date(date);
      if (this.periode === 'mois') {
        return (
          d.getFullYear() === this.dateDebut.getFullYear() &&
          d.getMonth() === this.dateDebut.getMonth()
        );
      }
      if (this.periode === 'semaine') {
        const start = new Date(this.dateDebut);
        const end = new Date(start);
        end.setDate(start.getDate() + 7);
        return d >= start && d < end;
      }
      if (this.finDate) {
        return d >= this.dateDebut && d <= this.finDate;
      }
      return true;
    }
  
    appliesToCategory(category) {
      return this.categories.length === 0 || this.categories.includes(category);
    }
  }
  