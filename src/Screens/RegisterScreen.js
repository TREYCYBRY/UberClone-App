// src/Screens/RegisterScreen.js

import React, { useState, useContext } from 'react';
import {View,Text,TextInput,TouchableOpacity,StyleSheet,ScrollView,Image,Alert} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { AppContext } from '../Context/AppContext';
import { COLORS, globalStyles } from '../Styles/GlobalStyles';

const GENDER_OPTIONS = ['Masculino', 'Femenino', 'Prefiero no decir'];
const LANGUAGE_OPTIONS = ['Español', 'English'];

const RegisterScreen = ({ onRegisterComplete }) => {

  const { registerUser, setAuthMode } = useContext(AppContext);

  const [name, setName]                       = useState('');
  const [phone, setPhone]                     = useState('');
  const [email, setEmail]                     = useState('');
  const [password, setPassword]               = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gender, setGender]                   = useState('');
  const [language, setLanguage]               = useState('Español');
  const [photo, setPhoto]                     = useState(null);
  const [loading, setLoading]                 = useState(false);

  const [errors, setErrors] = useState({
    name: '', phone: '', email: '', password: '', confirmPassword: '', gender: '',
  });

  const [showGenderOptions, setShowGenderOptions]     = useState(false);
  const [showLanguageOptions, setShowLanguageOptions] = useState(false);

  const handlePickImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, (response) => {
      if (response.didCancel) return;
      if (response.assets && response.assets.length > 0) {
        setPhoto(response.assets[0].uri);
      }
    });
  };

  const validate = () => {
    let valid = true;
    const newErrors = { name: '', phone: '', email: '', password: '', confirmPassword: '', gender: '' };

    if (!name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
      valid = false;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phone.trim()) {
      newErrors.phone = 'El celular es obligatorio';
      valid = false;
    } else if (!phoneRegex.test(phone)) {
      newErrors.phone = 'Debe tener exactamente 10 dígitos';
      valid = false;
    }

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
    } else if (password.length < 6) {
      newErrors.password = 'Debe tener al menos 6 caracteres';
      valid = false;
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
      valid = false;
    }

    if (!gender) {
      newErrors.gender = 'Selecciona un género';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);

    const success = await registerUser({
      name,
      phone,
      email: email.trim(),
      password,
      gender,
      language,
      photo:     photo || null,
      createdAt: new Date().toISOString(),
    });

    setLoading(false);

    if (success) {
      Alert.alert('¡Bienvenido!', 'Tu cuenta fue creada correctamente.', [
        {
          text: 'Continuar',
          onPress: () => onRegisterComplete && onRegisterComplete(),
        },
      ]);
    } else {
      Alert.alert('Error', 'No se pudo guardar tu información. Intenta de nuevo.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>

      <Text style={styles.brand}>UberClone</Text>
      <Text style={globalStyles.title}>Crear cuenta</Text>
      <Text style={globalStyles.subtitle}>Completa tus datos para comenzar</Text>

      <TouchableOpacity style={styles.photoContainer} onPress={handlePickImage}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.photo} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoPlaceholderText}>📷 Agregar foto</Text>
          </View>
        )}
      </TouchableOpacity>

      <Text style={globalStyles.label}>Nombre completo</Text>
      <TextInput
        style={[globalStyles.input, errors.name ? globalStyles.inputError : null]}
        placeholder="Ej: Juan Pérez"
        placeholderTextColor={COLORS.textSecondary}
        value={name}
        onChangeText={(text) => {
          setName(text);
          setErrors((prev) => ({ ...prev, name: '' }));
        }}
        maxLength={50}
      />
      {errors.name ? <Text style={globalStyles.errorText}>{errors.name}</Text> : null}

      {/*number of cell */}
      <Text style={globalStyles.label}>Número de celular</Text>
      <TextInput
        style={[globalStyles.input, errors.phone ? globalStyles.inputError : null]}
        placeholder="Ej: 3001234567"
        placeholderTextColor={COLORS.textSecondary}
        value={phone}
        onChangeText={(text) => {
          setPhone(text);
          setErrors((prev) => ({ ...prev, phone: '' }));
        }}
        keyboardType="numeric"
        maxLength={10}
      />
      {errors.phone ? <Text style={globalStyles.errorText}>{errors.phone}</Text> : null}

      {/*Email*/}
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

      {/* Password */}
      <Text style={globalStyles.label}>Contraseña</Text>
      <TextInput
        style={[globalStyles.input, errors.password ? globalStyles.inputError : null]}
        placeholder="Mínimo 6 caracteres"
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

      {/* Confirm Password */}
      <Text style={globalStyles.label}>Confirmar contraseña</Text>
      <TextInput
        style={[globalStyles.input, errors.confirmPassword ? globalStyles.inputError : null]}
        placeholder="Repite tu contraseña"
        placeholderTextColor={COLORS.textSecondary}
        value={confirmPassword}
        onChangeText={(text) => {
          setConfirmPassword(text);
          setErrors((prev) => ({ ...prev, confirmPassword: '' }));
        }}
        secureTextEntry
        autoCapitalize="none"
      />
      {errors.confirmPassword ? <Text style={globalStyles.errorText}>{errors.confirmPassword}</Text> : null}

      {/* Gender */}
      <Text style={globalStyles.label}>Género</Text>
      <TouchableOpacity
        style={[globalStyles.input, globalStyles.dropdown, errors.gender ? globalStyles.inputError : null]}
        onPress={() => {
          setShowGenderOptions(!showGenderOptions);
          setShowLanguageOptions(false);
        }}
      >
        <Text style={gender ? globalStyles.dropdownSelected : globalStyles.dropdownPlaceholder}>
          {gender || 'Selecciona una opción'}
        </Text>
        <Text>{showGenderOptions ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {showGenderOptions && (
        <View style={globalStyles.optionsList}>
          {GENDER_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option}
              style={globalStyles.optionItem}
              onPress={() => {
                setGender(option);
                setShowGenderOptions(false);
                setErrors((prev) => ({ ...prev, gender: '' }));
              }}
            >
              <Text style={globalStyles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {errors.gender ? <Text style={globalStyles.errorText}>{errors.gender}</Text> : null}

      {/* Language */}
      <Text style={globalStyles.label}>Idioma</Text>
      <TouchableOpacity
        style={[globalStyles.input, globalStyles.dropdown]}
        onPress={() => {
          setShowLanguageOptions(!showLanguageOptions);
          setShowGenderOptions(false);
        }}
      >
        <Text style={globalStyles.dropdownSelected}>{language}</Text>
        <Text>{showLanguageOptions ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {showLanguageOptions && (
        <View style={globalStyles.optionsList}>
          {LANGUAGE_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option}
              style={globalStyles.optionItem}
              onPress={() => {
                setLanguage(option);
                setShowLanguageOptions(false);
              }}
            >
              <Text style={globalStyles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* ── Bottom add account ── */}
      <TouchableOpacity
        style={[globalStyles.button, loading && globalStyles.buttonDisabled]}
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={globalStyles.buttonText}>
          {loading ? 'Creando cuenta...' : 'Crear cuenta'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.legal}>
        Al continuar aceptas los términos y la política de privacidad de UberClone.
      </Text>

      <TouchableOpacity style={styles.linkContainer} onPress={() => setAuthMode('login')}>
        <Text style={styles.linkText}>
          ¿Ya tienes cuenta? <Text style={styles.linkBold}>Inicia sesión</Text>
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
    paddingTop: 60,
    paddingBottom: 40,
  },
  brand: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  photoContainer: {
    alignSelf: 'center',
    marginBottom: 32,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  legal: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
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

export default RegisterScreen;