// src/Screens/RideScreen.js
import React, { useState, useEffect, useRef, useContext } from 'react';
import {View,Text,TouchableOpacity,StyleSheet,ActivityIndicator,Alert} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { AppContext } from '../Context/AppContext';
import { COLORS, globalStyles } from '../Styles/GlobalStyles';
import { GOOGLE_API_KEY } from '../Utils/Constanst';

const VEHICLE_TYPES = [
  {
    id: 'economy',
    label: 'Económico',
    description: '4 pasajeros · Precio bajo',
    icon: '🚗',
    baseFare: 3500,
    pricePerKm: 1200,
  },
  {
    id: 'xl',
    label: 'XL',
    description: '6 pasajeros · Espacio extra',
    icon: '🚐',
    baseFare: 5500,
    pricePerKm: 1800,
  },
  {
    id: 'premium',
    label: 'Premium',
    description: '4 pasajeros · Alta gama',
    icon: '🚘',
    baseFare: 8000,
    pricePerKm: 2500,
  },
];

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

const RideScreen = () => {

  const { addRide } = useContext(AppContext);

  const [origin, setOrigin]                   = useState(null);
  const [destination, setDestination]         = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [routeCoords, setRouteCoords]         = useState([]);
  const [distance, setDistance]               = useState(null);
  const [duration, setDuration]               = useState(null);
  const [fare, setFare]                       = useState(null);
  const [loading, setLoading]                 = useState(false);
  const [saving, setSaving]                   = useState(false);

  const mapRef = useRef(null);

  useEffect(() => {
    if (origin && destination) {
      fetchRoute();
    }
  }, [origin, destination]);

  useEffect(() => {
    if (selectedVehicle && distance) {
      setFare(calculateFare(distance, selectedVehicle));
    }
  }, [selectedVehicle, distance]);

  const fetchRoute = async () => {
    setLoading(true);
    try {
      const url =
        `https://maps.googleapis.com/maps/api/directions/json?` +
        `origin=${origin.latitude},${origin.longitude}` +
        `&destination=${destination.latitude},${destination.longitude}` +
        `&key=${GOOGLE_API_KEY}`;

      const response = await fetch(url);
      const data     = await response.json();

      if (data.routes.length > 0) {
        const route      = data.routes[0];
        const leg        = route.legs[0];
        const distanceKm = leg.distance.value / 1000;

        setDistance(distanceKm);
        setDuration(leg.duration.text);

        const points = decodePolyline(route.overview_polyline.points);
        setRouteCoords(points);

        if (mapRef.current) {
          mapRef.current.fitToCoordinates(points, {
            edgePadding: { top: 80, right: 40, bottom: 300, left: 40 },
            animated: true,
          });
        }
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo calcular la ruta.');
      console.error('fetchRoute error:', error);
    } finally {
      setLoading(false);
    }
  };

  const decodePolyline = (encoded) => {
    let index = 0;
    const result = [];
    let lat = 0;
    let lng = 0;

    while (index < encoded.length) {
      let shift = 0;
      let result_val = 0;
      let byte;

      do {
        byte = encoded.charCodeAt(index++) - 63;
        result_val |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      const dLat = result_val & 1 ? ~(result_val >> 1) : result_val >> 1;
      lat += dLat;

      shift      = 0;
      result_val = 0;

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

  const handleRequestRide = async () => {
    if (!origin || !destination) {
      Alert.alert('Atención', 'Debes ingresar origen y destino.');
      return;
    }
    if (!selectedVehicle) {
      Alert.alert('Atención', 'Selecciona un tipo de vehículo.');
      return;
    }

    setSaving(true);

    const success = await addRide({
      origin:      origin.address || 'Origen',
      destination: destination.address || 'Destino',
      duration:    duration || '---',
      distance:    `${distance?.toFixed(1)} km`,
      cost:        fare,
      vehicleType: selectedVehicle.label,
    });

    setSaving(false);

    if (success) {
      Alert.alert(
        '¡Viaje solicitado!',
        `Vehículo: ${selectedVehicle.label}\nTarifa: ${formatPrice(fare)}`,
      );
      setOrigin(null);
      setDestination(null);
      setSelectedVehicle(null);
      setRouteCoords([]);
      setDistance(null);
      setDuration(null);
      setFare(null);
    } else {
      Alert.alert('Error', 'No se pudo guardar el viaje. Intenta de nuevo.');
    }
  };

  return (
  <View style={styles.container}>

    <MapView
      ref={mapRef}
      provider={PROVIDER_GOOGLE}
      style={styles.map}
      initialRegion={INITIAL_REGION}
    >
      {origin && (
        <Marker coordinate={origin} title="Origen" pinColor={COLORS.primary} />
      )}
      {destination && (
        <Marker coordinate={destination} title="Destino" pinColor={COLORS.secondary} />
      )}
      {routeCoords.length > 0 && (
        <Polyline
          coordinates={routeCoords}
          strokeColor={COLORS.primary}
          strokeWidth={4}
        />
      )}
    </MapView>

    <View style={styles.panel}>

      <Text style={globalStyles.label}>Origen</Text>
      <GooglePlacesAutocomplete
        placeholder="¿Desde dónde sales?"
        fetchDetails={true}
        onPress={(data, details = null) => {
          setOrigin({
            latitude:  details.geometry.location.lat,
            longitude: details.geometry.location.lng,
            address:   data.description,
          });
        }}
        query={{
          key:        GOOGLE_API_KEY,
          language:   'es',
          components: 'country:co',
        }}
        styles={autocompleteStyles}
      />

      <Text style={globalStyles.label}>Destino</Text>
      <GooglePlacesAutocomplete
        placeholder="¿A dónde vas?"
        fetchDetails={true}
        onPress={(data, details = null) => {
          setDestination({
            latitude:  details.geometry.location.lat,
            longitude: details.geometry.location.lng,
            address:   data.description,
          });
        }}
        query={{
          key:        GOOGLE_API_KEY,
          language:   'es',
          components: 'country:co',
        }}
        styles={autocompleteStyles}
      />

      {loading && (
        <ActivityIndicator
          size="small"
          color={COLORS.primary}
          style={styles.loader}
        />
      )}

      {duration && distance && !loading && (
        <View style={styles.routeInfo}>
          <Text style={styles.routeInfoText}>📍 {distance.toFixed(1)} km</Text>
          <Text style={styles.routeInfoText}>⏱ {duration}</Text>
        </View>
      )}

      {origin && destination && !loading && (
        <View>
          <Text style={globalStyles.sectionTitle}>Selecciona tu vehículo</Text>
          {VEHICLE_TYPES.map((vehicle) => (
            <TouchableOpacity
              key={vehicle.id}
              style={[
                styles.vehicleCard,
                selectedVehicle?.id === vehicle.id && styles.vehicleCardSelected,
              ]}
              onPress={() => setSelectedVehicle(vehicle)}
            >
              <Text style={styles.vehicleIcon}>{vehicle.icon}</Text>
              <View style={styles.vehicleInfo}>
                <Text style={styles.vehicleLabel}>{vehicle.label}</Text>
                <Text style={globalStyles.mutedText}>{vehicle.description}</Text>
              </View>
              {distance && (
                <Text style={styles.vehicleFare}>
                  {formatPrice(calculateFare(distance, vehicle))}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {selectedVehicle && fare && (
        <TouchableOpacity
          style={[globalStyles.button, saving && globalStyles.buttonDisabled]}
          onPress={handleRequestRide}
          disabled={saving}
        >
          <Text style={globalStyles.buttonText}>
            {saving ? 'Solicitando...' : `Solicitar · ${formatPrice(fare)}`}
          </Text>
        </TouchableOpacity>
      )}

    </View>

  </View>
  ); 
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  map: {
    width: '100%',
    height: 300,
  },
  panel: {
    flex: 1,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  loader: {
    marginVertical: 12,
  },
  routeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 12,
    marginVertical: 12,
  },
  routeInfoText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    backgroundColor: COLORS.surface,
  },
  vehicleCardSelected: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    backgroundColor: COLORS.background,
  },
  vehicleIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  vehicleFare: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  bottomSpace: {
    height: 40,
  },
});

const autocompleteStyles = {
  textInput: {
    height: 52,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 15,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.surface,
  },
  listView: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    marginTop: 4,
    backgroundColor: COLORS.surface,
  },
  row: {
    padding: 12,
  },
  description: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  panel: {
  flex: 1,
  backgroundColor: COLORS.surface,
  paddingHorizontal: 24,
  paddingTop: 20,
},
};

export default RideScreen;