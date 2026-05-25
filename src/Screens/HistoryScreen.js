import React, { useState, useEffect, useContext } from 'react';
import {View,Text,FlatList,TouchableOpacity,StyleSheet,Modal,ScrollView,ActivityIndicator,} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppContext } from '../Context/AppContext';
import { COLORS, globalStyles } from '../Styles/GlobalStyles';

const formatPrice = (amount) => `$ ${amount.toLocaleString('es-CO')}`;

const formatDate = (dateString) => {
  const [year, month, day] = dateString.split('-');
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const HistoryScreen = () => {

  const { rides, loadRides } = useContext(AppContext);

  const [selectedRide, setSelectedRide] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  // Load rides to the screen
  useEffect(() => {
    const fetchRides = async () => {
      try {
        setLoading(true);
        setError(null);
        await loadRides();
      } catch (err) {
        console.error('fetchRides error:', err);
        setError('No se pudieron cargar los viajes.');
      } finally {
        setLoading(false);
      }
    };
    fetchRides();
  }, []);

  // Open detail
  const handleSelectRide = (ride) => {
    setSelectedRide(ride);
    setModalVisible(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedRide(null);
  };

  // Card for each ride
  const renderRideCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleSelectRide(item)}
    >
      <View style={styles.routeContainer}>
        <View style={styles.routeIndicator}>
          <View style={styles.dotOrigin} />
          <View style={styles.routeLine} />
          <View style={styles.dotDestination} />
        </View>
        <View style={styles.routeTexts}>
          <Text style={styles.routeLocation} numberOfLines={1}>
            {item.origin}
          </Text>
          <Text style={styles.routeLocation} numberOfLines={1}>
            {item.destination}
          </Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.cardDate}>
          {formatDate(item.date)} · {item.time}
        </Text>
        <Text style={styles.cardCost}>{formatPrice(item.cost)}</Text>
      </View>
    </TouchableOpacity>
  );

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={globalStyles.safeArea}>
        <View style={globalStyles.center}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={globalStyles.mutedText}>Cargando viajes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={globalStyles.safeArea}>
        <View style={globalStyles.center}>
          <Text style={globalStyles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <View style={styles.container}>

        <Text style={globalStyles.title}>Mis Viajes</Text>
        <Text style={globalStyles.subtitle}>
          {rides.length > 0
            ? `${rides.length} viajes realizados`
            : 'Aún no tienes viajes'}
        </Text>

        {/* Empty list */}
        {rides.length === 0 ? (
          <View style={globalStyles.emptyState}>
            <Text style={globalStyles.emptyIcon}>🚗</Text>
            <Text style={globalStyles.emptyText}>
              Solicita tu primer viaje y aparecerá aquí.
            </Text>
          </View>
        ) : (
          <FlatList
            data={rides}
            keyExtractor={(item) => item.id}
            renderItem={renderRideCard}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        )}

        {/* Detail modal */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={handleCloseModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              {selectedRide && (
                <ScrollView showsVerticalScrollIndicator={false}>

                  <Text style={styles.modalTitle}>Detalle del viaje</Text>

                  <View style={styles.modalSection}>
                    <Text style={globalStyles.mutedText}>Origen</Text>
                    <Text style={styles.modalValue}>{selectedRide.origin}</Text>
                    <Text style={globalStyles.mutedText}>Destino</Text>
                    <Text style={styles.modalValue}>{selectedRide.destination}</Text>
                  </View>

                  <View style={globalStyles.divider} />

                  <View style={styles.modalSection}>
                    <View style={styles.modalRow}>
                      <Text style={globalStyles.mutedText}>Fecha</Text>
                      <Text style={styles.modalValue}>
                        {formatDate(selectedRide.date)} · {selectedRide.time}
                      </Text>
                    </View>
                    <View style={styles.modalRow}>
                      <Text style={globalStyles.mutedText}>Duración</Text>
                      <Text style={styles.modalValue}>{selectedRide.duration}</Text>
                    </View>
                    <View style={styles.modalRow}>
                      <Text style={globalStyles.mutedText}>Distancia</Text>
                      <Text style={styles.modalValue}>{selectedRide.distance}</Text>
                    </View>
                    <View style={styles.modalRow}>
                      <Text style={globalStyles.mutedText}>Vehículo</Text>
                      <Text style={styles.modalValue}>{selectedRide.vehicleType}</Text>
                    </View>
                    <View style={styles.modalRow}>
                      <Text style={globalStyles.mutedText}>Conductor</Text>
                      <Text style={styles.modalValue}>{selectedRide.driverName}</Text>
                    </View>
                  </View>

                  <View style={globalStyles.divider} />

                  <View style={styles.modalCostContainer}>
                    <Text style={styles.modalCostLabel}>Total pagado</Text>
                    <Text style={styles.modalCostValue}>
                      {formatPrice(selectedRide.cost)}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={globalStyles.button}
                    onPress={handleCloseModal}
                  >
                    <Text style={globalStyles.buttonText}>Cerrar</Text>
                  </TouchableOpacity>

                </ScrollView>
              )}
            </View>
          </View>
        </Modal>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  listContent: {
    paddingBottom: 40,
  },
  // Card
  card: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  routeContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  routeIndicator: {
    alignItems: 'center',
    marginRight: 12,
    paddingTop: 3,
  },
  dotOrigin: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: COLORS.border,
    marginVertical: 3,
  },
  dotDestination: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.secondary,
  },
  routeTexts: {
    flex: 1,
    justifyContent: 'space-between',
    height: 46,
  },
  routeLocation: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  cardCost: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 20,
  },
  modalSection: {
    marginBottom: 8,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalValue: {
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: '500',
    marginBottom: 8,
  },
  modalCostContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalCostLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  modalCostValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
});

export default HistoryScreen;