// src/Utils/storage.js

/*import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Llaves de almacenamiento ──────────────────
const USER_KEY = '@uberclone:user';

// ── Guardar datos del usuario ─────────────────
// Recibe un objeto con los campos del perfil/registro
export const saveUser = async (user) => {
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    return true;
  } catch (error) {
    console.error('saveUser error:', error);
    return false;
  }
};

// ── Cargar datos del usuario ──────────────────
// Devuelve el objeto guardado o null si no existe
export const loadUser = async () => {
  try {
    const raw = await AsyncStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error('loadUser error:', error);
    return null;
  }
};

// ── Verificar si ya hay usuario registrado ────
export const hasUser = async () => {
  const user = await loadUser();
  return user !== null;
};

// ── Eliminar datos del usuario (logout) ───────
export const clearUser = async () => {
  try {
    await AsyncStorage.removeItem(USER_KEY);
    return true;
  } catch (error) {
    console.error('clearUser error:', error);
    return false;
  }
};
*/