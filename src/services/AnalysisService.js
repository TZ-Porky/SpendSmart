// Services
import { transactionService } from './TransactionService';
import { categoryService } from './CategoryService';

class AnalysisService {
  constructor() {}

  // Récupère et agrège les données de transactions pour l'analyse.
  async getAnalysisData(userUid, period, analysisType) {
    if (!userUid) {
      console.warn("AnalysisService: userUid is required.");
      return { categorySummary: [], dailyGraphData: { labels: [], datasets: [{ data: [] }] }, totalAmountForPeriod: 0 };
    }

    try {
      // Récupérer toutes les transactions et catégories de l'utilisateur
      const allTransactions = await transactionService.getTransactions(userUid);
      const allCategories = await categoryService.getAllCategories(userUid);

      const today = new Date();
      let startDate = new Date();
      let endDate = new Date();
      endDate.setHours(23, 59, 59, 999);

      switch (period) {
        case 'week':
          const dayOfWeek = today.getDay(); // 0 = Dimanche, 1 = Lundi ... 6 = Samedi
          const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Si c'est Dimanche (0), soustraire 6 jours pour le Lundi précédent. Sinon, soustraire (jour actuel - 1) pour arriver au Lundi.
          startDate.setDate(diff);
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'month':
          startDate.setDate(1); // Début de mois
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'year':
          startDate = new Date(today.getFullYear(), 0, 1); // Début d'année
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'custom':
          console.warn("Custom period not yet implemented.");
          break;
        default:
          startDate = new Date(today.getFullYear(), today.getMonth(), 1); // Par défaut au mois
          startDate.setHours(0, 0, 0, 0);
          break;
      }

      const filteredTransactions = allTransactions.filter(tx => {
        const txDate = tx.date.getTime();
        return txDate >= startDate.getTime() && txDate <= endDate.getTime();
      });

      const categorySummary = {};
      const dailySummary = {};

      const labels = [];
      if (period === 'week') {
        const daysOfWeekFull = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
        for (let i = 0; i < 7; i++) {
          const day = new Date(startDate);
          day.setDate(startDate.getDate() + i);
          labels.push(daysOfWeekFull[day.getDay()].substring(0, 3)); // Ex: "Lun", "Mar"
          dailySummary[day.toLocaleDateString('fr-FR', { weekday: 'short' })] = 0; // Utilise toujours le format court pour la clé du dailySummary
        }
      } else if (period === 'month') {
          const numDays = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
          for (let i = 1; i <= numDays; i++) {
              labels.push(`${i}`);
              dailySummary[`${i}`] = 0;
          }
      } else if (period === 'year') {
          const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
          months.forEach(month => {
              labels.push(month);
              dailySummary[month] = 0;
          });
      }

      let totalAmountForPeriod = 0;

      filteredTransactions.forEach(tx => {
        let amount = tx.amount;
        const category = allCategories.find(cat => cat.id === tx.category);

        let includeTx = false;
        if (analysisType === 'expense' && tx.type === 'expense') {
          includeTx = true;
          amount = Math.abs(amount); // Les dépenses sont stockées en négatif, les rendre positives pour l'analyse des "dépenses"
        } else if (analysisType === 'income' && tx.type === 'income') {
          includeTx = true;
        } else if (analysisType === 'net' && (tx.type === 'expense' || tx.type === 'income')) {
          includeTx = true;
        }

        if (includeTx) {
          totalAmountForPeriod += amount;

          // Agrégation par catégorie
          if (category) {
            if (!categorySummary[category.id]) {
              categorySummary[category.id] = {
                name: category.name,
                iconName: category.iconName,
                color: category.color,
                total: 0,
              };
            }
            categorySummary[category.id].total += amount;
          }

          // Agrégation pour le graphique
          if (period === 'week') {
              const dayKey = tx.date.toLocaleDateString('fr-FR', { weekday: 'short' });
              if (dailySummary[dayKey] !== undefined) {
                  dailySummary[dayKey] += amount;
              }
          } else if (period === 'month') {
              const dayKey = `${tx.date.getDate()}`;
              if (dailySummary[dayKey] !== undefined) {
                  dailySummary[dayKey] += amount;
              }
          } else if (period === 'year') {
              const monthKey = tx.date.toLocaleDateString('fr-FR', { month: 'short' });
              if (dailySummary[monthKey] !== undefined) {
                  dailySummary[monthKey] += amount;
              }
          }
        }
      });

      const graphDataValues = labels.map(label => {
          if (period === 'week') {
              return dailySummary[label] || 0;
          } else if (period === 'month') {
              return dailySummary[label] || 0;
          } else if (period === 'year') {
              return dailySummary[label] || 0;
          }
          return 0;
      });

      return {
        categorySummary: Object.values(categorySummary).sort((a, b) => b.total - a.total),
        dailyGraphData: {
          labels: labels,
          datasets: [{ data: graphDataValues }]
        },
        totalAmountForPeriod: totalAmountForPeriod,
      };

    } catch (error) {
      console.error("Error fetching analysis data:", error);
      throw error;
    }
  }
}

export const analysisService = new AnalysisService();