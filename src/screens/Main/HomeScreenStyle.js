import { StyleSheet } from 'react-native';

export const HomeScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  heroHeader: {
    backgroundColor: '#0F0968',
    height: '200',
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
  },
  loadingIndicator: {
    marginTop: 50,
  },
  
  // Styles pour la section des transactions récentes
  transactionsSection: {
    marginTop: 20,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20, // Aligner l'en-tête avec les cartes
    marginBottom: 10,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  viewAllButton: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  noTransactionsCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 20, // Aligner avec les cartes
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    alignItems: 'center', // Centrer le texte
  },
  noTransactionsText: {
    textAlign: 'center',
    color: '#777',
    fontSize: 14,
  },
});
