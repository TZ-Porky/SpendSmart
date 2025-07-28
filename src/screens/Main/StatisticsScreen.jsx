// src/screens/Main/InsightScreen.js

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Platform,
  FlatList,
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import DropdownPicker from 'react-native-dropdown-picker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import CategoryCard from '../../components/CategoryCard';

// Services
import { analysisService } from '../../services/AnalysisService';
import auth from '@react-native-firebase/auth';

const { width } = Dimensions.get('window');
const screenWidth = Dimensions.get('window').width;

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

function StatisticsScreen({ navigation }) {
  const [user, setUser] = useState(auth().currentUser);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // États pour les dropdowns
  const [openAnalysisDropdown, setOpenAnalysisDropdown] = useState(false);
  const [openPeriodDropdown, setOpenPeriodDropdown] = useState(false);
  const [selectedAnalysisType, setSelectedAnalysisType] = useState('expense');
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  
  // Items pour les dropdowns
  const [analysisDropdownItems, setAnalysisDropdownItems] = useState(analysisTypes);
  const [periodDropdownItems, setPeriodDropdownItems] = useState(periods);

  // Données d'analyse
  const [analysisData, setAnalysisData] = useState({
    categorySummary: [],
    dailyGraphData: { labels: [], datasets: [{ data: [] }] },
    totalAmountForPeriod: 0,
  });

  // Données pour les cartes de catégories (compatibilité avec CategoryCard)
  const [categoriesData, setCategoriesData] = useState([]);

  // Fonction pour charger les données d'analyse
  const fetchAnalysisData = useCallback(async () => {
    if (!user?.uid) return;

    setLoading(true);
    setRefreshing(true);
    try {
      // Charger les données via le service d'analyse
      const data = await analysisService.getAnalysisData(user.uid, selectedPeriod, selectedAnalysisType);
      setAnalysisData(data);

      // Convertir les données pour CategoryCard
      const categoryCards = data.categorySummary.map(item => ({
        id: item.id || Math.random().toString(36).substr(2, 9),
        name: item.name,
        description: `Total pour la période: ${formatCurrency(Math.abs(item.total))}`,
        amount: Math.abs(item.total),
        color: item.color,
        iconName: item.iconName
      }));
      setCategoriesData(categoryCards);

    } catch (error) {
      console.error("Erreur lors du chargement des données d'analyse:", error);
      // Données de fallback pour démonstration
      setFallbackData();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user.uid, selectedPeriod, selectedAnalysisType, setFallbackData]);

  // Données de fallback pour démonstration
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const setFallbackData = () => {
    if (selectedAnalysisType === 'expense') {
      setAnalysisData({
        categorySummary: [
          { id: 'cat1', name: 'Alimentation', total: 25000, color: '#FF6B6B', iconName: 'food' },
          { id: 'cat2', name: 'Transport', total: 15000, color: '#4ECDC4', iconName: 'car' },
          { id: 'cat3', name: 'Divertissement', total: 10000, color: '#45B7D1', iconName: 'movie' },
        ],
        dailyGraphData: {
          labels: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
          datasets: [{ 
            data: [2000, 4500, 2800, 8000, 9900, 4300, 6000],
            color: (opacity = 1) => `rgba(239, 83, 80, ${opacity})`
          }],
        },
        totalAmountForPeriod: 50000,
      });
      setCategoriesData([
        { id: 'cat1', name: 'Alimentation', description: 'Courses, restaurants', amount: 25000, color: '#FF6B6B' },
        { id: 'cat2', name: 'Transport', description: 'Bus, taxi, essence', amount: 15000, color: '#4ECDC4' },
        { id: 'cat3', name: 'Divertissement', description: 'Films, sorties', amount: 10000, color: '#45B7D1' },
      ]);
    } else if (selectedAnalysisType === 'income') {
      setAnalysisData({
        categorySummary: [
          { id: 'cat4', name: 'Salaire', total: 100000, color: '#51CF66', iconName: 'cash' },
          { id: 'cat5', name: 'Freelance', total: 25000, color: '#69DB7C', iconName: 'laptop' },
        ],
        dailyGraphData: {
          labels: ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin"],
          datasets: [{ 
            data: [10000, 20000, 15000, 30000, 25000, 40000],
            color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`
          }],
        },
        totalAmountForPeriod: 125000,
      });
      setCategoriesData([
        { id: 'cat4', name: 'Salaire', description: 'Revenu mensuel', amount: 100000, color: '#51CF66' },
        { id: 'cat5', name: 'Freelance', description: 'Projets secondaires', amount: 25000, color: '#69DB7C' },
      ]);
    }
  };

  useEffect(() => {
    fetchAnalysisData();
  }, [fetchAnalysisData]);

  const handleCategoryPress = (category) => {
    console.log("Catégorie sélectionnée:", category);
    // Ici vous pouvez naviguer vers un écran de détail de la catégorie
  };

  const onRefresh = useCallback(() => {
    fetchAnalysisData();
  }, [fetchAnalysisData]);

  const { categorySummary, dailyGraphData, totalAmountForPeriod } = analysisData;
  const userCurrency = 'XOF';

  // Configuration du graphique
  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientFromOpacity: 1,
    backgroundGradientTo: '#ffffff',
    backgroundGradientToOpacity: 1,
    color: (opacity = 1) => {
      if (selectedAnalysisType === 'expense') return `rgba(239, 83, 80, ${opacity})`;
      if (selectedAnalysisType === 'income') return `rgba(76, 175, 80, ${opacity})`;
      return `rgba(0, 123, 255, ${opacity})`;
    },
    labelColor: (opacity = 1) => `rgba(100, 100, 100, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.6,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    propsForLabels: {
      fontSize: 11,
      fontWeight: 'bold',
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: '#e0e0e0',
    },
  };

  // Titre dynamique basé sur le type d'analyse
  const getHeaderTitle = () => {
    switch(selectedAnalysisType) {
      case 'expense': return 'Analyse des Dépenses';
      case 'income': return 'Analyse des Revenus';
      case 'net': return 'Analyse Nette';
      default: return 'Analyse Financière';
    }
  };

  // Couleur du header basée sur le type d'analyse
  const getHeaderColors = () => {
    switch(selectedAnalysisType) {
      case 'expense': return ['#EF5350', '#C62828'];
      case 'income': return ['#66BB6A', '#388E3C'];
      case 'net': return ['#42A5F5', '#1976D2'];
      default: return ['#ffa726', '#996417'];
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6A1B9A" />
        <Text style={styles.loadingText}>Chargement des analyses...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollViewContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header avec gradient dynamique */}
        <LinearGradient
          colors={getHeaderColors()}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.headerBackground}
        >
          <Text style={styles.pageTitle}>{getHeaderTitle()}</Text>
        </LinearGradient>

        <View style={styles.contentWrapper}>
          {/* Dropdowns pour les filtres */}
          <View style={styles.filtersContainer}>
            <View style={styles.dropdownWrapper}>
              <Text style={styles.dropdownLabel}>Type d'analyse</Text>
              <DropdownPicker
                open={openAnalysisDropdown}
                value={selectedAnalysisType}
                items={analysisDropdownItems}
                setOpen={setOpenAnalysisDropdown}
                setValue={setSelectedAnalysisType}
                setItems={setAnalysisDropdownItems}
                containerStyle={styles.pickerContainer}
                style={styles.pickerStyle}
                itemSeparatorStyle={styles.pickerItemSeparator}
                textStyle={styles.pickerTextStyle}
                dropDownContainerStyle={styles.dropdownListContainer}
                ArrowDownIconComponent={({ size, color }) => (
                  <Icon name="chevron-down" size={size || 20} color={color || '#777'} />
                )}
                ArrowUpIconComponent={({ size, color }) => (
                  <Icon name="chevron-up" size={size || 20} color={color || '#777'} />
                )}
                zIndex={3000}
                zIndexInverse={1000}
              />
            </View>

            <View style={styles.dropdownWrapper}>
              <Text style={styles.dropdownLabel}>Période</Text>
              <DropdownPicker
                open={openPeriodDropdown}
                value={selectedPeriod}
                items={periodDropdownItems}
                setOpen={setOpenPeriodDropdown}
                setValue={setSelectedPeriod}
                setItems={setPeriodDropdownItems}
                containerStyle={styles.pickerContainer}
                style={styles.pickerStyle}
                itemSeparatorStyle={styles.pickerItemSeparator}
                textStyle={styles.pickerTextStyle}
                dropDownContainerStyle={styles.dropdownListContainer}
                ArrowDownIconComponent={({ size, color }) => (
                  <Icon name="chevron-down" size={size || 20} color={color || '#777'} />
                )}
                ArrowUpIconComponent={({ size, color }) => (
                  <Icon name="chevron-up" size={size || 20} color={color || '#777'} />
                )}
                zIndex={2000}
                zIndexInverse={2000}
              />
            </View>
          </View>

          {/* Section Graphique */}
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>
              Tendances {selectedAnalysisType === 'expense' ? 'de Dépenses' : selectedAnalysisType === 'income' ? 'de Revenus' : 'Nettes'}
            </Text>
            {dailyGraphData && dailyGraphData.datasets[0].data.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <BarChart
                  data={dailyGraphData}
                  width={Math.max(screenWidth - 40, dailyGraphData.labels.length * 60)}
                  height={220}
                  yAxisLabel=""
                  yAxisSuffix=""
                  chartConfig={chartConfig}
                  verticalLabelRotation={Platform.OS === 'android' ? 0 : -30}
                  fromZero={true}
                  showValuesOnTopOfBars={true}
                  withCustomBarColorFromData={true}
                  flatColor={true}
                  style={styles.chartStyle}
                />
              </ScrollView>
            ) : (
              <View style={styles.noDataContainer}>
                <Icon name="chart-bar" size={48} color="#ccc" />
                <Text style={styles.noDataText}>Pas de données pour le graphique sur cette période.</Text>
              </View>
            )}
            <View style={styles.totalAmountContainer}>
              <Text style={styles.totalAmountLabel}>Total pour la période:</Text>
              <Text style={[styles.totalAmountValue, { color: getHeaderColors()[0] }]}>
                {formatCurrency(totalAmountForPeriod, userCurrency)}
              </Text>
            </View>
          </View>

          {/* Section des catégories */}
          <View style={styles.categoriesSection}>
            <Text style={styles.sectionHeader}>Répartition par Catégorie</Text>
            
            {loading ? (
              <View style={styles.categoriesLoadingContainer}>
                <ActivityIndicator size="large" color="#6A1B9A" />
                <Text style={styles.loadingText}>Chargement des catégories...</Text>
              </View>
            ) : categoriesData.length > 0 ? (
              <>
                {/* Affichage détaillé avec barres de progression */}
                <View style={styles.detailedCategoriesContainer}>
                  {categorySummary.map((item, index) => {
                    const percentage = totalAmountForPeriod !== 0 ? ((Math.abs(item.total) / Math.abs(totalAmountForPeriod)) * 100) : 0;
                    const isNegativeTotal = item.total < 0 && selectedAnalysisType === 'expense';
                    const displayAmount = isNegativeTotal ? `-${formatCurrency(Math.abs(item.total), userCurrency)}` : formatCurrency(item.total, userCurrency);

                    return (
                      <TouchableOpacity key={index} style={styles.categoryItem} onPress={() => handleCategoryPress(item)}>
                        <View style={[styles.categoryIconContainer, { backgroundColor: item.color || '#ccc' }]}>
                          <Icon name={item.iconName || 'help-circle'} size={24} color="#fff" />
                        </View>
                        <View style={styles.categoryDetails}>
                          <Text style={styles.categoryName}>{item.name}</Text>
                          <View style={styles.categoryProgressBarContainer}>
                            <View style={[styles.categoryProgressBar, { width: `${percentage}%`, backgroundColor: item.color || '#007bff' }]} />
                          </View>
                        </View>
                        <View style={styles.categoryAmountContainer}>
                          <Text style={styles.categoryAmount}>{displayAmount}</Text>
                          <Text style={styles.categoryPercentage}>{percentage.toFixed(0)}%</Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Cartes de catégories */}
                <Text style={styles.cardsSubHeader}>Détail des catégories</Text>
                <FlatList
                  data={categoriesData}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <CategoryCard
                      category={item}
                      onPress={handleCategoryPress}
                    />
                  )}
                  scrollEnabled={false}
                  showsVerticalScrollIndicator={false}
                />
              </>
            ) : (
              <View style={styles.noDataCard}>
                <Icon name="folder-open-outline" size={48} color="#ccc" />
                <Text style={styles.noDataText}>Aucune donnée pour la période et le type d'analyse sélectionnés.</Text>
                <Text style={styles.noDataSubText}>Essayez de changer la période ou le type d'analyse.</Text>
              </View>
            )}
          </View>
        </View>
        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6A1B9A',
  },
  headerBackground: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 12,
    overflow: 'hidden',
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
  },
  scrollViewContent: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: -20,
    paddingTop: 30,
  },
  filtersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 15,
  },
  dropdownWrapper: {
    flex: 1,
  },
  dropdownLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  pickerContainer: {
    height: 50,
  },
  pickerStyle: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  pickerTextStyle: {
    fontSize: 16,
    color: '#333',
  },
  dropdownListContainer: {
    borderColor: '#ddd',
    borderRadius: 10,
    marginTop: 5,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  pickerItemSeparator: {
    height: 1,
    backgroundColor: '#eee',
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
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
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  chartStyle: {
    borderRadius: 16,
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  totalAmountContainer: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    alignItems: 'center',
  },
  totalAmountLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  totalAmountValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  categoriesSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  cardsSubHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
    color: '#555',
  },
  categoriesLoadingContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  detailedCategoriesContainer: {
    marginBottom: 10,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  categoryIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 22,
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
    marginBottom: 8,
  },
  categoryProgressBarContainer: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  categoryProgressBar: {
    height: '100%',
    borderRadius: 3,
  },
  categoryAmountContainer: {
    alignItems: 'flex-end',
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  categoryPercentage: {
    fontSize: 12,
    color: '#777',
  },
  noDataCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  noDataText: {
    textAlign: 'center',
    marginTop: 15,
    fontSize: 16,
    color: '#777',
    marginBottom: 5,
  },
  noDataSubText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#999',
  },
});

export default StatisticsScreen;