import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStripe } from '@stripe/stripe-react-native'; 
//  import functions from '@react-native-firebase/functions';
import { AppContext } from '../Context/AppContext';
import { COLORS, globalStyles } from '../Styles/GlobalStyles';

// Direct HTTPS call to the deployed Firebase Callable Function.
const CREATE_PAYMENT_INTENT_URL =
  'https://us-central1-uberclone-8df93.cloudfunctions.net/createPaymentIntent';

// Available payment options
const PAYMENT_METHODS = [
  { id: 'stripe', type: 'stripe', label: 'Tarjeta (Stripe)', icon: '💳' },
  { id: 'cash', type: 'cash', label: 'Efectivo', icon: '💵' },
];

// Helper function to format the price
const formatPrice = (amount) => `$ ${amount.toLocaleString('es-CO')}`;

const PaymentScreen = ({ route, navigation }) => {
  // Context and Stripe hooks
  const { addRide } = useContext(AppContext);
  const { initPaymentSheet, presentPaymentSheet } = useStripe(); 

  // Local state for selected method and loading indicator
  const [selectedMethod, setSelectedMethod] = useState('stripe');
  const [loading, setLoading]               = useState(false);

  // Get ride data passed from the previous screen
  const rideData = route?.params?.rideData;

  // Cancel and delete the charge if the user leaves this window without paying
  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      navigation.setParams({ rideData: null });
    });
    return unsubscribe;
  }, [navigation]);

  // Show empty state if there is no active ride data
  if (!rideData) {
    return (
      <SafeAreaView style={globalStyles.safeArea}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🚗</Text>
          <Text style={styles.emptyText}>Solicita un viaje primero para pagar.</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Handles what happens after a successful payment
  const handlePaymentSuccess = async () => {
    // Save ride to the history
    await addRide(rideData);
    
    // Clear current params so the user can't pay twice
    navigation.setParams({ rideData: null });
    
    // Navigate to the tracking screen
    navigation.navigate('Tracking', { activeRide: rideData });
  };
//////////////////////////////////////// evaluate stripe in ios 
  // Payment process with Stripe
  const processStripePayment = async () => {
    try {
      setLoading(true);

      // Call the deployed Callable Function via plain HTTPS (iOS + Android compatible)
      const response = await fetch(CREATE_PAYMENT_INTENT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { amount: parseInt(rideData.cost) } }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('createPaymentIntent HTTP error:', response.status, errText);
        Alert.alert('Error', 'No se pudo crear el cobro en el servidor.');
        return;
      }

      const json = await response.json();
      const clientSecret = json?.result?.clientSecret;

      if (!clientSecret) {
        Alert.alert('Error', 'Respuesta inválida del servidor de pagos.');
        return;
      }

      // Initialize the Stripe Payment Sheet
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName:      'UberClone App',
        paymentIntentClientSecret: clientSecret,
      });

      if (initError) {
        Alert.alert('Error', 'No se pudo inicializar la pasarela de pagos.');
        return;
      }

      // Show the Payment Sheet to the user
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        Alert.alert('Aviso', 'Pago cancelado.');
      } else {
        Alert.alert(
          '¡Éxito!',
          `Pago de ${formatPrice(rideData.cost)} procesado correctamente.`,
        );
        await handlePaymentSuccess();
      }
    } catch (error) {
      console.error('processStripePayment error:', error);
      Alert.alert('Error', 'Hubo un problema conectando con Stripe.');
    } finally {
      setLoading(false);
    }
  };
  ////////////////////////////////////////

  // Triggered when the user presses the main pay button
  const handleConfirmPayment = () => {
    if (selectedMethod === 'cash') {
      Alert.alert(
        'Pago en efectivo', 
        `Pagarás en efectivo al conductor al finalizar.\n\nTotal: ${formatPrice(rideData.cost)}`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Confirmar viaje', onPress: handlePaymentSuccess }
        ]
      );
    } else {
      processStripePayment();
    }
  };

  // Render the main UI
  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <View style={styles.container}>
        <Text style={globalStyles.title}>Pago del Viaje</Text>
        <Text style={styles.sectionTitle}>Selecciona tu método de pago</Text>

        {/* Render payment methods list */}
        {PAYMENT_METHODS.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[styles.methodCard, selectedMethod === method.id && styles.methodCardSelected]}
            onPress={() => setSelectedMethod(method.id)}
          >
            <Text style={styles.methodIcon}>{method.icon}</Text>
            <View style={styles.methodInfo}>
              <Text style={styles.methodLabel}>{method.label}</Text>
            </View>
            <View style={[styles.radioCircle, selectedMethod === method.id && styles.radioCircleSelected]}>
              {selectedMethod === method.id && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>
        ))}

        {/* Main Pay button */}
        <TouchableOpacity style={styles.payButton} onPress={handleConfirmPayment} disabled={loading}>
          {loading ? <ActivityIndicator color={COLORS.surface} /> : <Text style={styles.payButtonText}>Pagar {formatPrice(rideData.cost)}</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Component Styles
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    paddingHorizontal: 24, 
    paddingTop: 20,
    backgroundColor: COLORS.background,
  },
  emptyContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingHorizontal: 40 
  },
  emptyIcon: { 
    fontSize: 60, 
    marginBottom: 15 
  },
  emptyText: { 
    fontSize: 18, 
    color: COLORS.textSecondary, 
    textAlign: 'center' 
  },
  sectionTitle: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: COLORS.textSecondary, 
    marginBottom: 12, marginTop: 20, 
    textTransform: 'uppercase' 
  },
  methodCard: { flexDirection: 'row', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: COLORS.border, 
    borderRadius: 8, padding: 16, 
    marginBottom: 10, 
    backgroundColor: COLORS.surface 
  },
  methodCardSelected: { 
    borderColor: COLORS.primary, 
    borderWidth: 2 
  },
  methodIcon: { 
    fontSize: 24, 
    marginRight: 14 
  },
  methodInfo: { 
    flex: 1 
  },
  methodLabel: { 
    fontSize: 15, 
    fontWeight: '600', 
    color: COLORS.textPrimary 
  },
  radioCircle: { 
    width: 20, 
    height: 20, 
    borderRadius: 10, 
    borderWidth: 2, 
    borderColor: COLORS.border, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  radioCircleSelected: { 
    borderColor: COLORS.primary 
  },
  radioDot: { width: 10, 
    height: 10, 
    borderRadius: 5, 
    backgroundColor: COLORS.primary 
  },
  payButton: { 
    height: 52, 
    backgroundColor: COLORS.primary, 
    borderRadius: 8, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 20 
  },
  payButtonText: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: COLORS.surface 
  },
});

export default PaymentScreen;