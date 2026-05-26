// src/Screens/LoginScreen.js

import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { AppContext } from '../Context/AppContext';
import { COLORS, globalStyles } from '../Styles/GlobalStyles';

const LoginScreen = ({ onLoginComplete }) => {

  const { loginUser, setAuthMode } = useContext(AppContext);

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);

  const [errors, setErrors] = useState({
    email: '', password: '',
  });

  const validate = () => {
    let valid = true;
    const newErrors = { email: '', password: '' };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      newErrors.email = 'El correo es obligatorio';
      valid = false;
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Ingresa un correo válido (Ej: juan@correo.com)';
      valid = false;
    }

    if (!password) {
      newErrors.password = 'La contraseña es obligatoria';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);

    const result = await loginUser(email, password);

    setLoading(false);

    if (result.success) {
      onLoginComplete && onLoginComplete();
    } else {
      Alert.alert('Error', result.message || 'No se pudo iniciar sesión.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>

      <Text style={styles.brand}>UberClone</Text>
      <Text style={globalStyles.title}>Iniciar sesión</Text>
      <Text style={globalStyles.subtitle}>Ingresa con tu cuenta para continuar</Text>

      <Text style={globalStyles.label}>Correo electrónico</Text>
      <TextInput
        style={[globalStyles.input, errors.email ? globalStyles.inputError : null]}
        placeholder="Ej: juan@correo.com"
        placeholderTextColor={COLORS.textSecondary}
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setErrors((prev) => ({ ...prev, email: '' }));
        }}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      {errors.email ? <Text style={globalStyles.errorText}>{errors.email}</Text> : null}

      <Text style={globalStyles.label}>Contraseña</Text>
      <TextInput
        style={[globalStyles.input, errors.password ? globalStyles.inputError : null]}
        placeholder="Tu contraseña"
        placeholderTextColor={COLORS.textSecondary}
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          setErrors((prev) => ({ ...prev, password: '' }));
        }}
        secureTextEntry
        autoCapitalize="none"
      />
      {errors.password ? <Text style={globalStyles.errorText}>{errors.password}</Text> : null}

      <TouchableOpacity
        style={[globalStyles.button, loading && globalStyles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={globalStyles.buttonText}>
          {loading ? 'Ingresando...' : 'Iniciar sesión'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.linkContainer} onPress={() => setAuthMode('register')}>
        <Text style={styles.linkText}>
          ¿No tienes cuenta? <Text style={styles.linkBold}>Regístrate</Text>
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  brand: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  linkContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  linkBold: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
