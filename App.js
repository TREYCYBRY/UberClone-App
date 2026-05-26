// App.js
import React, { useContext } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
// import providers Stripe
import { StripeProvider } from '@stripe/stripe-react-native'; 

import MainNavigator from './src/Navigation/MainNavigator';
import RegisterScreen from './src/Screens/RegisterScreen';
import LoginScreen from './src/Screens/LoginScreen';
import { AppContext, AppProvider } from './src/Context/AppContext';
import { COLORS } from './src/Styles/GlobalStyles';

const AppContent = () => {
  const { isRegistered, setIsRegistered, authMode } = useContext(AppContext);

  if (isRegistered === null) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!isRegistered) {
    if (authMode === 'register') {
      return <RegisterScreen onRegisterComplete={() => setIsRegistered(true)} />;
    }
    return <LoginScreen onLoginComplete={() => setIsRegistered(true)} />;
  }

  return (
    <NavigationContainer>
      <MainNavigator />
    </NavigationContainer>
  );
};

const App = () => {
  return (
    <AppProvider>
      <StripeProvider publishableKey="pk_test_51TaoVWEiU6sFCYbxR7V0SAa1s4kDMkEMSnTynRYCuk0LZlGUmv73bJHGQJWrhngJ36st4QPWExi6MlIyiPtFmXYX00tGPnqbgk">
        <AppContent />
      </StripeProvider>
    </AppProvider>
  );
};

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});

export default App;