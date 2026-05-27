import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, globalStyles } from '../Styles/GlobalStyles';
import { GOOGLE_API_KEY } from '../Utils/Constanst';

// import vehicle types
import vehicleTypes from '../Utils/vehicleTypes';

const formatPrice = (amount) => `$ ${amount.toLocaleString('es-CO')}`;

const calculateFare = (distanceKm, vehicle) => {
  const total = vehicle.baseFare + distanceKm * vehicle.pricePerKm;
  return Math.round(total);
};

const INITIAL_REGION = {
  latitude: 6.2442,
  longitude: -75.5812,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const RideScreen = ({ navigation }) => {
  const [origin, setOrigin]                   = useState(null);
  const [destination, setDestination]         = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [routeCoords, setRouteCoords]         = useState([]);
  const [distance, setDistance]               = useState(null);
  const [duration, setDuration]               = useState(null);
  const [fare, setFare]                       = useState(null);
  const [loading, setLoading]                 = useState(false);

  const mapRef = useRef(null);
  const originRef = useRef(null);
  const destRef = useRef(null);

  // Force clean of absolutely everything when entering the screen
  useFocusEffect(
    useCallback(() => {
      setOrigin(null);
      setDestination(null);
      setSelectedVehicle(null);
      setRouteCoords([]);
      setDistance(null);
      setDuration(null);
      setFare(null);
      
      // Clean the visual text of the Google boxes
      if (originRef.current) originRef.current.setAddressText('');
      if (destRef.current) destRef.current.setAddressText('');

      if (mapRef.current) {
        mapRef.current.animateToRegion(INITIAL_REGION, 800);
      }
    }, [])
  );

  // Calculate route when we have both points
  useEffect(() => {
    if (origin && destination) {
      fetchRoute();
    }
  }, [origin, destination]);

  // Calculate fare when we have route and vehicle
  useEffect(() => {
    if (selectedVehicle && distance) {
      setFare(calculateFare(distance, selectedVehicle));
    }
  }, [selectedVehicle, distance]);

  const fetchRoute = async () => {
    setLoading(true);
    try {
      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=${GOOGLE_API_KEY}`;
      const response = await fetch(url);
      const data     = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route      = data.routes[0];
        const leg        = route.legs[0];
        const distanceKm = leg.distance.value / 1000;

        setDistance(distanceKm);
        setDuration(leg.duration.text);

        const points = decodePolyline(route.overview_polyline.points);
        setRouteCoords(points);

        if (mapRef.current) {
          setTimeout(() => {
            mapRef.current.fitToCoordinates(points, {
              edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
              animated: true,
            });
          }, 300);
        }
      } else {
        Alert.alert(
          'Ruta no encontrada', 
          'No pudimos trazar una ruta en auto entre estos dos puntos. Intenta usar una dirección más específica.'
        );
        // If there is an error, clean only the route
        setRouteCoords([]);
        setDistance(null);
        setDuration(null);
        setFare(null);
      }
    } catch (error) {
      Alert.alert('Error', 'Hubo un problema de conexión al calcular la ruta.');
    } finally {
      setLoading(false);
    }
  };

  const decodePolyline = (encoded) => {
    let index = 0, lat = 0, lng = 0;
    const result = [];
    while (index < encoded.length) {
      let shift = 0, result_val = 0, byte;
      do {
        byte = encoded.charCodeAt(index++) - 63;
        result_val |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);
      const dLat = result_val & 1 ? ~(result_val >> 1) : result_val >> 1;
      lat += dLat;

      shift = 0; result_val = 0;
      do {
        byte = encoded.charCodeAt(index++) - 63;
        result_val |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);
      const dLng = result_val & 1 ? ~(result_val >> 1) : result_val >> 1;
      lng += dLng;

      result.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }
    return result;
  };

  const handleRequestRide = () => {
    if (!origin || !destination) {
      Alert.alert('Atención', 'Debes ingresar origen y destino.');
      return;
    }
    if (!selectedVehicle) {
      Alert.alert('Atención', 'Selecciona un tipo de vehículo.');
      return;
    }

    const pendingRide = {
      origin:      origin.address || 'Origen',
      originCoords: { latitude: origin.latitude, longitude: origin.longitude },
      destination: destination.address || 'Destino',
      duration:    duration || '---',
      distance:    `${distance?.toFixed(1)} km`,
      cost:        fare,
      vehicleType: selectedVehicle.label,
      date:        new Date().toISOString().split('T')[0],
      time:        new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
    };

    navigation.navigate('Payment', { rideData: pendingRide });
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView ref={mapRef} provider={PROVIDER_GOOGLE} style={styles.map} initialRegion={INITIAL_REGION}>
          {origin && <Marker coordinate={origin} title="Origen" pinColor={COLORS.primary} />}
          {destination && <Marker coordinate={destination} title="Destino" pinColor={COLORS.secondary} />}
          
          {routeCoords.length > 0 && (
            <Polyline 
              key={`poly-${routeCoords.length}`} 
              coordinates={routeCoords} 
              strokeColor={COLORS.primary} 
              strokeWidth={4} 
            />
          )}
        </MapView>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1.2 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          style={styles.panel}
          keyboardShouldPersistTaps="always" 
          showsVerticalScrollIndicator={false}
        >
          {/* origin */}
          <View style={{ marginBottom: 15, zIndex: 10 }}>
            <Text style={globalStyles.label}>Origen</Text>
            <GooglePlacesAutocomplete
              ref={originRef}
              placeholder="¿Desde dónde sales?"
              fetchDetails={true}
              disableScroll={true}
              textInputProps={{
                placeholderTextColor: '#999999', 
                onChangeText: (text) => {
                  if (routeCoords.length > 0) {
                    setRouteCoords([]);
                    setDistance(null);
                    setDuration(null);
                    setFare(null);
                    setSelectedVehicle(null);
                  }
                  if (text.trim() === '') setOrigin(null);
                }
              }}
              onPress={(data, details = null) => {
                setOrigin({
                  latitude:  details.geometry.location.lat,
                  longitude: details.geometry.location.lng,
                  address:   data.description,
                });
              }}
              query={{ key: GOOGLE_API_KEY, language: 'es', components: 'country:co' }}
              styles={autocompleteStyles}
            />
          </View>

          {/* destination */}
          <View style={{ marginBottom: 15, zIndex: 9 }}>
            <Text style={globalStyles.label}>Destino</Text>
            <GooglePlacesAutocomplete
              ref={destRef}
              placeholder="¿A dónde vas?"
              fetchDetails={true}
              disableScroll={true}
              textInputProps={{
                placeholderTextColor: '#999999',
                onChangeText: (text) => {
                  if (routeCoords.length > 0) {
                    setRouteCoords([]);
                    setDistance(null);
                    setDuration(null);
                    setFare(null);
                    setSelectedVehicle(null);
                  }
                  if (text.trim() === '') setDestination(null);
                }
              }}
              onPress={(data, details = null) => {
                setDestination({
                  latitude:  details.geometry.location.lat,
                  longitude: details.geometry.location.lng,
                  address:   data.description,
                });
              }}
              query={{ key: GOOGLE_API_KEY, language: 'es', components: 'country:co' }}
              styles={autocompleteStyles}
            />
          </View>

          {loading && <ActivityIndicator size="small" color={COLORS.primary} style={styles.loader} />}

          {duration && distance && !loading && (
            <View style={styles.routeInfo}>
              <Text style={styles.routeInfoText}>📍 {distance.toFixed(1)} km</Text>
              <Text style={styles.routeInfoText}>⏱ {duration}</Text>
            </View>
          )}

          {origin && destination && distance && !loading && (
            <View style={{ paddingBottom: 10 }}>
              <Text style={globalStyles.sectionTitle}>Selecciona tu vehículo</Text>
              {vehicleTypes.map((vehicle) => (
                <TouchableOpacity
                  key={vehicle.id}
                  style={[styles.vehicleCard, selectedVehicle?.id === vehicle.id && styles.vehicleCardSelected]}
                  onPress={() => setSelectedVehicle(vehicle)}
                >
                  <Text style={styles.vehicleIcon}>{vehicle.icon}</Text>
                  <View style={styles.vehicleInfo}>
                    <Text style={styles.vehicleLabel}>{vehicle.label}</Text>
                    <Text style={globalStyles.mutedText}>{vehicle.description}</Text>
                  </View>
                  {distance && <Text style={styles.vehicleFare}>{formatPrice(calculateFare(distance, vehicle))}</Text>}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {selectedVehicle && fare && distance && (
            <TouchableOpacity style={[globalStyles.button, { marginBottom: 40 }]} onPress={handleRequestRide}>
              <Text style={globalStyles.buttonText}>Solicitar · {formatPrice(fare)}</Text>
            </TouchableOpacity>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  mapContainer: { flex: 0.8 }, 
  map: { width: '100%', height: '100%' },
  panel: { flex: 1, backgroundColor: COLORS.surface, paddingHorizontal: 24, paddingTop: 20 },
  loader: { marginVertical: 12 },
  routeInfo: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: COLORS.background, borderRadius: 8, padding: 12, marginVertical: 12 },
  routeInfoText: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary },
  vehicleCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 12, marginBottom: 10, backgroundColor: COLORS.surface },
  vehicleCardSelected: { borderColor: COLORS.primary, borderWidth: 2, backgroundColor: COLORS.background },
  vehicleIcon: { fontSize: 28, marginRight: 12 },
  vehicleInfo: { flex: 1 },
  vehicleLabel: { fontSize: 15, fontWeight: 'bold', color: COLORS.textPrimary },
  vehicleFare: { fontSize: 15, fontWeight: 'bold', color: COLORS.textPrimary },
});

const autocompleteStyles = {
  container: { flex: 0, width: '100%', zIndex: 10 },
  textInputContainer: { width: '100%' },
  textInput: { 
    height: 52, 
    borderWidth: 1, 
    borderColor: '#E0E0E0', 
    borderRadius: 8, 
    paddingHorizontal: 16, 
    fontSize: 15, 
    color: '#000000',
    backgroundColor: '#FFFFFF', 
  },
  listView: { 
    backgroundColor: '#FFFFFF', 
    borderWidth: 1, 
    borderColor: '#E0E0E0', 
    borderRadius: 8, 
    marginTop: 4, 
    elevation: 5 
  },
  row: { 
    padding: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF'
  },
  description: { 
    fontSize: 14, 
    color: '#000000' 
  },
};

export default RideScreen;