// src/screens/InsightScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Platform
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { BarChart } from 'react-native-chart-kit';

// Services
import { analysisService } from '../services/AnalysisService';

const { width } = Dimensions.get('window');

const formatCurrency = (amount, currency = 'XOF') => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

const periods = [
  { label: 'Cette semaine', value: 'week' },
  { label: 'Ce mois', value: 'month' },
  { label: 'Cette année', value: 'year' },
  { label: 'Personnalisé', value: 'custom' },
];

const analysisTypes = [
  { label: 'Dépenses', value: 'expense' },
  { label: 'Revenus', value: 'income' },
  { label: 'Net (R-D)', value: 'net' },
];

function InsightScreen({ userUid, onBack }) {
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedAnalysisType, setSelectedAnalysisType] = useState('expense');
  const [analysisData, setAnalysisData] = useState({ // Nouvel état pour stocker les données du service
    categorySummary: [],
    dailyGraphData: { labels: [], datasets: [{ data: [] }] },
    totalAmountForPeriod: 0,
  });

  // Fonction pour charger les données d'analyse via le service
  const fetchAnalysisData = useCallback(async () => {
    if (!userUid) return;

    setLoading(true);
    try {
      const data = await analysisService.getAnalysisData(userUid, selectedPeriod, selectedAnalysisType);
      setAnalysisData(data);
    } catch (error) {
      console.error("Error fetching analysis data in InsightScreen:", error);
      // Gérer l'erreur, par ex. afficher un message à l'utilisateur
    } finally {
      setLoading(false);
    }
  }, [userUid, selectedPeriod, selectedAnalysisType]); // Dépendances pour recharger les données

  useEffect(() => {
    fetchAnalysisData(); // Appeler au montage et quand les dépendances changent
  }, [fetchAnalysisData]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Chargement des analyses...</Text>
      </View>
    );
  }

  const { categorySummary, dailyGraphData, totalAmountForPeriod } = analysisData;
  const userCurrency = 'XOF';

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientFromOpacity: 1,
    backgroundGradientTo: '#ffffff',
    backgroundGradientToOpacity: 1,
    color: (opacity = 1) => {
        if (selectedAnalysisType === 'expense') return `rgba(220, 53, 69, ${opacity})`;
        if (selectedAnalysisType === 'income') return `rgba(40, 167, 69, ${opacity})`;
        return `rgba(0, 123, 255, ${opacity})`;
    },
    labelColor: (opacity = 1) => `rgba(100, 100, 100, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.6,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    propsForLabels: {
        fontSize: 11,
    },
    propsForBackgroundLines: {
        strokeDasharray: '',
        stroke: '#e0e0e0',
    },
    formatYLabel: (yValue) => formatCurrency(parseFloat(yValue), userCurrency),
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Icon name="arrow-left" size={24} color="#007bff" />
        <Text style={styles.backButtonText}>Retour</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Analyse des Habitudes de Consommation</Text>

      {/* Sélecteurs de période et de type d'analyse */}
      <View style={styles.filterContainer}>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedAnalysisType}
            onValueChange={(itemValue) => setSelectedAnalysisType(itemValue)}
            style={styles.picker}
          >
            {analysisTypes.map(type => (
              <Picker.Item key={type.value} label={type.label} value={type.value} />
            ))}
          </Picker>
        </View>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedPeriod}
            onValueChange={(itemValue) => setSelectedPeriod(itemValue)}
            style={styles.picker}
          >
            {periods.map(period => (
              <Picker.Item key={period.value} label={period.label} value={period.value} />
            ))}
          </Picker>
        </View>
      </View>

      {/* Section Graphique */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Tendances {selectedAnalysisType === 'expense' ? 'de Dépenses' : selectedAnalysisType === 'income' ? 'de Revenus' : 'Nettes'}</Text>
        {dailyGraphData && dailyGraphData.datasets[0].data.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <BarChart
              data={dailyGraphData}
              width={Math.max(width - 40, dailyGraphData.labels.length * 60)}
              height={220}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={chartConfig}
              verticalLabelRotation={Platform.OS === 'android' ? 0 : -30}
              fromZero={true}
              withCustomBarColorFromData={true}
              flatColor={true}
              style={{
                marginVertical: 8,
                borderRadius: 16
              }}
            />
          </ScrollView>
        ) : (
          <Text style={styles.noDataText}>Pas de données pour le graphique sur cette période.</Text>
        )}
        <Text style={styles.totalAmountText}>Total pour la période: {formatCurrency(totalAmountForPeriod, userCurrency)}</Text>
      </View>

      {/* Analyse par Catégorie */}
      <Text style={styles.sectionHeader}>Répartition par Catégorie</Text>
      {categorySummary && categorySummary.length > 0 ? (
        categorySummary.map((item, index) => {
          const percentage = totalAmountForPeriod !== 0 ? ((Math.abs(item.total) / Math.abs(totalAmountForPeriod)) * 100) : 0;
          const isNegativeTotal = item.total < 0 && selectedAnalysisType === 'expense';
          const displayAmount = isNegativeTotal ? `-${formatCurrency(Math.abs(item.total), userCurrency)}` : formatCurrency(item.total, userCurrency);

          return (
            <View key={index} style={styles.categoryItem}>
              <View style={[styles.categoryIconContainer, { backgroundColor: item.color || '#ccc' }]}>
                <Icon name={item.iconName || 'help-circle'} size={24} color="#fff" />
              </View>
              <View style={styles.categoryDetails}>
                <Text style={styles.categoryName}>{item.name}</Text>
                <View style={styles.categoryProgressBarContainer}>
                  <View style={[styles.categoryProgressBar, { width: `${percentage}%`, backgroundColor: item.color || '#007bff' }]} />
                </View>
              </View>
              <Text style={styles.categoryAmount}>{displayAmount}</Text>
              <Text style={styles.categoryPercentage}>{percentage.toFixed(0)}%</Text>
            </View>
          );
        })
      ) : (
        <Text style={styles.noDataText}>Aucune donnée pour la période et le type d'analyse sélectionnés.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButtonText: {
    marginLeft: 5,
    fontSize: 16,
    color: '#007bff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  pickerWrapper: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
    width: '100%',
  },

  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 10,
    paddingBottom: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
    color: '#333',
  },
  totalAmountText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
    color: '#333',
  },

  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
    color: '#333',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  categoryDetails: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  categoryProgressBarContainer: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 5,
  },
  categoryProgressBar: {
    height: '100%',
    borderRadius: 3,
  },
  categoryAmount: {
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#555',
  },
  categoryPercentage: {
    fontSize: 13,
    color: '#777',
    marginLeft: 5,
    minWidth: 40,
    textAlign: 'right',
  },
  noDataText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#777',
  },
});

export default InsightScreen;