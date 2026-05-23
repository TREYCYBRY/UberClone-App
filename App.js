// App.js

import React, { useContext } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import MainNavigator from './src/Navigation/MainNavigator';
import RegisterScreen from './src/Screens/RegisterScreen';
import { AppContext, AppProvider } from './src/Context/AppContext';
import { COLORS } from './src/Styles/GlobalStyles';

const AppContent = () => {
  const { isRegistered, setIsRegistered } = useContext(AppContext);

  if (isRegistered === null) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  //Unregistered -> registration screen
  if (!isRegistered) {
    return (
      <RegisterScreen onRegisterComplete={() => setIsRegistered(true)} />
    );
  }

  //With registration -> tabs
  return (
    <NavigationContainer>
      <MainNavigator />
    </NavigationContainer>
  );
};

// A single provider for the whole app
const App = () => {
  return (
    <AppProvider>
      <AppContent />
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