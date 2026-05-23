// ── Create context ─────────────────────────
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, addDoc, getDocs, query, where, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../Config/Firebase';
// Same as CartContext in class
export const AppContext = createContext();

export const AppProvider = ({ children }) => {

  // ── Global states ──────────────────────
  const [isRegistered, setIsRegistered] = useState(null); // null = loading
  const [rides, setRides]               = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [profile, setProfile]           = useState(null);
  const [ridesCount, setRidesCount]     = useState(0);    // triggers list reload

  // On app start, check if there is a user
  // Same as loadCart in class
  useEffect(() => {
    checkUser();
  }, []);

  // Reload rides and transactions when ridesCount changes
  // Same as [cartItems] in class
  useEffect(() => {
    if (isRegistered) {
      //loadRides();
      //loadTransactions();
    }
  }, [ridesCount, isRegistered]);

  // AUTHENTICATION FUNCTIONS

  // Checks if the user is already registered
  const checkUser = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      setIsRegistered(!!userId);
    } catch (error) {
      console.error('checkUser error:', error);
      setIsRegistered(false);
    }
  };

  // Log out — clears local userId
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('userId');
      setIsRegistered(false);
      setProfile(null);
      setRides([]);
      setTransactions([]);
    } catch (error) {
      console.error('logout error:', error);
    }
  };

  // PROFILE FUNCTIONS

  // Loads user profile from Firestore
  const loadProfile = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;

      const docRef  = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setProfile(docSnap.data());
      }
    } catch (error) {
      console.error('loadProfile error:', error);
    }
  };

  // Saves user profile to Firestore
  const saveProfile = async (userData) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return false;

      const docRef = doc(db, 'users', userId);
      await updateDoc(docRef, userData);
      setProfile(userData);
      return true;
    } catch (error) {
      console.error('saveProfile error:', error);
      return false;
    }
  };

  // Registers a new user in Firestore
  const registerUser = async (userData) => {
    try {
      const docRef = await addDoc(collection(db, 'users'), userData);
      await AsyncStorage.setItem('userId', docRef.id);
      setIsRegistered(true);
      return true;
    } catch (error) {
      console.error('registerUser error:', error);
      return false;
    }
  };
  return (
    <AppContext.Provider value={{
      isRegistered,
      rides,
      transactions,
      profile,
      setProfile,
      loadProfile,
      saveProfile,
      registerUser,
      logout,
    }}>
      {children}
    </AppContext.Provider>
  )

}