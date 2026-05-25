// src/Screens/ProfileScreen.js
import React, { useState, useEffect, useContext } from 'react';
import {View,Text,TextInput,TouchableOpacity,StyleSheet,ScrollView,Image,Alert} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchImageLibrary } from 'react-native-image-picker';
import { AppContext } from '../Context/AppContext';
import { COLORS, globalStyles } from '../Styles/GlobalStyles';

const GENDER_OPTIONS = ['Masculino', 'Femenino', 'Prefiero no decir'];
const LANGUAGE_OPTIONS = ['Español', 'English'];

const ProfileScreen = () => {


  const { logout, loadProfile, saveProfile, profile } = useContext(AppContext);

  const [name, setName]         = useState('');
  const [phone, setPhone]       = useState('');
  const [email, setEmail]       = useState('');
  const [gender, setGender]     = useState('');
  const [language, setLanguage] = useState('Español');
  const [photo, setPhoto]       = useState(null);
  const [loading, setLoading]   = useState(false);
  const [saved, setSaved]       = useState(false);

  const [errors, setErrors] = useState({
    name: '', phone: '', email: '', gender: '',
  });

  const [showGenderOptions, setShowGenderOptions]     = useState(false);
  const [showLanguageOptions, setShowLanguageOptions] = useState(false);

  useEffect(()=>{
    loadProfile()
  },[])

  useEffect(() => {
    if (profile) {
        setName(profile.name       || '');
        setPhone(profile.phone     || '');
        setEmail(profile.email     || '');
        setGender(profile.gender   || '');
        setLanguage(profile.language || 'Español');
        setPhoto(profile.photo     || null);
      }
  },[profile]);

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
    const newErrors = { name: '', phone: '', email: '', gender: '' };

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
    if (!gender) {
      newErrors.gender = 'Selecciona un género';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };
 // Handles saving the profile data
  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);

    const success = await saveProfile({ name, phone, email, gender, language, photo });

    if (success) {
      setSaved(true);
      Alert.alert('¡Listo!', 'Tu perfil fue actualizado correctamente.');
    } else {
      Alert.alert('Error', 'No se pudo actualizar tu perfil.');
    }

    setLoading(false);
  };

  // Logout confirmation
  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sí, cerrar', style: 'destructive', onPress: () => logout() },
      ],
    );
  };

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>

        <Text style={globalStyles.title}>Mi Perfil</Text>
        <Text style={globalStyles.subtitle}>Datos personales</Text>

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

        <TouchableOpacity
          style={[globalStyles.button, loading && globalStyles.buttonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={globalStyles.buttonText}>
            {loading ? 'Guardando...' : 'Guardar perfil'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={globalStyles.buttonDanger} onPress={handleLogout}>
          <Text style={globalStyles.buttonDangerText}>Cerrar sesión</Text>
        </TouchableOpacity>

        {saved && (
          <Text style={styles.savedText}>✅ Perfil actualizado correctamente</Text>
        )}

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
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
  savedText: {
    fontSize: 14,
    color: COLORS.success,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default ProfileScreen;