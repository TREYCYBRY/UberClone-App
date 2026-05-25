import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { COLORS, globalStyles } from '../Styles/GlobalStyles';

const generateMockRoute = (pickupLocation, steps = 10) => {
  const driverStart = { latitude: pickupLocation.latitude - 0.005, longitude: pickupLocation.longitude - 0.005 };
  const route = [];
  for (let i = 0; i <= steps; i++) {
    route.push({
      latitude: driverStart.latitude + (pickupLocation.latitude - driverStart.latitude) * (i / steps),
      longitude: driverStart.longitude + (pickupLocation.longitude - driverStart.longitude) * (i / steps),
    });
  }
  return route;
};

const TrackingScreen = ({ route, navigation }) => {
  const activeRide = route?.params?.activeRide;

  const userPickupLocation = activeRide?.originCoords || { latitude: 6.2442, longitude: -75.5812 };
  
  const dynamicRoute = useMemo(() => generateMockRoute(userPickupLocation), [userPickupLocation.latitude, userPickupLocation.longitude]);

  const [driverPosition, setDriverPosition] = useState(dynamicRoute[0]);
  const [routeIndex, setRouteIndex]         = useState(0);
  const [status, setStatus]                 = useState('arriving');
  const [arrived, setArrived]               = useState(false);

  const mapRef = useRef(null);
  const markerAnimation = useRef(new Animated.Value(0)).current;

  const driver = { 
    name: 'Carlos Pérez', 
    vehicle: 'Toyota Corolla', 
    plate: 'ABC 123', 
    rating: '4.9', 
    vehicleType: activeRide?.vehicleType || 'Económico' 
  };

  useEffect(() => {
    if (activeRide) {
      setDriverPosition(dynamicRoute[0]);
      setRouteIndex(0);
      setStatus('arriving');
      setArrived(false);
    }
  }, [activeRide?.time, dynamicRoute]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(markerAnimation, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(markerAnimation, { toValue: 0, duration: 800, useNativeDriver: true }),
      ]),
    ).start();
  }, [markerAnimation]);

  useEffect(() => {
    if (mapRef.current && dynamicRoute.length > 0) {
      mapRef.current.fitToCoordinates(dynamicRoute, { edgePadding: { top: 60, right: 40, bottom: 60, left: 40 }, animated: true });
    }
  }, [dynamicRoute]);

  useEffect(() => {
    if (arrived) return;
    const interval = setInterval(() => {
      setRouteIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        if (nextIndex >= dynamicRoute.length) {
          clearInterval(interval);
          setArrived(true);
          setStatus('arrived');
          return prevIndex;
        }
        const nextPosition = dynamicRoute[nextIndex];
        setDriverPosition(nextPosition);
        if (mapRef.current) {
          mapRef.current.animateToRegion({ ...nextPosition, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 900);
        }
        const progress = nextIndex / dynamicRoute.length;
        if (progress < 0.4) setStatus('arriving');
        else if (progress < 0.8) setStatus('nearby');
        else setStatus('almost');
        return nextIndex;
      });
    }, 1500); 
    return () => clearInterval(interval);
  }, [arrived, dynamicRoute]);

  if (!activeRide) {
    return (
      <SafeAreaView style={globalStyles.safeArea}>
        <View style={styles.emptyContainer}>
          <Text style={{ fontSize: 60, marginBottom: 15 }}>📍</Text>
          <Text style={styles.emptyText}>No hay viajes en curso.</Text>
          <Text style={styles.emptySubText}>Solicita un viaje para iniciar el seguimiento.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleEndRide = () => {
    Alert.alert('Viaje Finalizado', '¡Has llegado a tu destino!');
    navigation.setParams({ activeRide: null });
  };

  const handleCancelRide = () => {
    Alert.alert('Viaje Cancelado', 'Tu viaje ha sido cancelado.');
    navigation.setParams({ activeRide: null });
  };

  const getStatusText = () => {
    if (arrived)               return '¡Tu conductor llegó!';
    if (status === 'almost')   return 'Tu conductor está a metros';
    if (status === 'nearby')   return 'Tu conductor está cerca';
    return 'Tu conductor está en camino';
  };

  const getStatusColor = () => {
    if (arrived)               return COLORS.success;
    if (status === 'almost')   return COLORS.accent || COLORS.success;
    if (status === 'nearby')   return COLORS.secondary;
    return COLORS.primary;
  };

  const markerScale = markerAnimation.interpolate({ inputRange: [0, 1], outputRange: [1, 1.3] });

  return (
    <View style={styles.container}>
      <MapView ref={mapRef} provider={PROVIDER_GOOGLE} style={styles.map}>
        <Marker coordinate={userPickupLocation} title="Punto de Recogida">
          <View style={styles.userMarker}><Text style={styles.userMarkerText}>📍</Text></View>
        </Marker>
        <Marker coordinate={driverPosition} title={driver.name}>
          <Animated.View style={[styles.driverMarker, { transform: [{ scale: markerScale }] }]}>
            <Text style={styles.driverMarkerText}>🚗</Text>
          </Animated.View>
        </Marker>
        {routeIndex > 0 && <Polyline coordinates={dynamicRoute.slice(0, routeIndex + 1)} strokeColor={COLORS.secondary} strokeWidth={4} />}
        {routeIndex < dynamicRoute.length - 1 && <Polyline coordinates={dynamicRoute.slice(routeIndex)} strokeColor={COLORS.border} strokeWidth={4} lineDashPattern={[8, 4]} />}
      </MapView>

      <View style={styles.panel}>
        <Text style={[styles.statusText, { color: getStatusColor() }]}>{getStatusText()}</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(routeIndex / (dynamicRoute.length - 1)) * 100}%`, backgroundColor: getStatusColor() }]} />
        </View>
        <View style={globalStyles.divider} />
        
        <View style={styles.driverInfo}>
          <View style={styles.driverAvatar}><Text style={styles.driverAvatarText}>👤</Text></View>
          <View style={styles.driverDetails}>
            <Text style={styles.driverName}>{driver.name}</Text>
            <Text style={globalStyles.mutedText}>{driver.vehicle} · {driver.plate}</Text>
          </View>
          <View style={styles.driverRating}><Text style={styles.ratingText}>⭐ {driver.rating}</Text></View>
        </View>

        <View style={globalStyles.divider} />
        <View style={styles.actionsRow}>
          <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={handleCancelRide}>
            <Text style={[styles.actionLabel, { color: COLORS.error }]}>Cancelar Viaje</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.finishButton]} onPress={handleEndRide}>
            <Text style={[styles.actionLabel, { color: COLORS.surface }]}>Finalizar Viaje</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 20, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 5 },
  emptySubText: { fontSize: 16, color: COLORS.textSecondary, textAlign: 'center' },
  map: { height: '55%', width: '100%' },
  driverMarker: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 5 },
  driverMarkerText: { fontSize: 22 },
  userMarker: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  userMarkerText: { fontSize: 28 },
  panel: { flex: 1, backgroundColor: COLORS.surface, paddingHorizontal: 24, paddingTop: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, elevation: 5 },
  statusText: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  progressBar: { height: 4, backgroundColor: COLORS.border, borderRadius: 2, marginBottom: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
  driverInfo: { flexDirection: 'row', alignItems: 'center' },
  driverAvatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  driverAvatarText: { fontSize: 24 },
  driverDetails: { flex: 1 },
  driverName: { fontSize: 16, fontWeight: 'bold', color: COLORS.textPrimary, marginBottom: 2 },
  driverRating: { backgroundColor: COLORS.background, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  ratingText: { fontSize: 14, fontWeight: 'bold', color: COLORS.textPrimary },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  actionButton: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: 8, marginHorizontal: 5 },
  cancelButton: { backgroundColor: '#FFF5F5', borderWidth: 1, borderColor: COLORS.error },
  finishButton: { backgroundColor: COLORS.primary },
  actionLabel: { fontSize: 14, fontWeight: 'bold' },
});

export default TrackingScreen;