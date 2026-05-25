import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, addDoc, getDocs, query, where, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../Config/Firebase';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {

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

  useEffect(() => {
    if (isRegistered) {
      loadRides();
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

  // RIDE FUNCTIONS
  const loadRides = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;

      const ridesRef = collection(db, 'rides');
      const q        = query(ridesRef, where('userId', '==', userId));
      const snapshot = await getDocs(q);

      const ridesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      ridesData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRides(ridesData);
    } catch (error) {
      console.error('loadRides error:', error);
    }
  };

  // Saves a new ride to Firestore
  const addRide = async (rideData) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return false;

      const now  = new Date();
      const date = now.toISOString().split('T')[0];
      const time = now.toLocaleTimeString('es-CO', {
        hour:   '2-digit',
        minute: '2-digit',
      });

      // Simulated drivers
      const drivers = [
        'Carlos Pérez',
        'Andrés Gómez',
        'María Rodríguez',
        'Luis Martínez',
      ];
      const driverName = drivers[Math.floor(Math.random() * drivers.length)];

      const newRide = {
        userId,
        ...rideData,
        date,
        time,
        driverName,
        status:    'completed',
        createdAt: now.toISOString(),
      };

      await addDoc(collection(db, 'rides'), newRide);

      await addDoc(collection(db, 'transactions'), {
        userId,
        description: `Ride · ${rideData.origin} → ${rideData.destination}`,
        date: now.toLocaleDateString('es-CO', {
          day:   'numeric',
          month: 'long',
          year:  'numeric',
        }),
        amount:    rideData.cost,
        status:    'paid',
        createdAt: now.toISOString(),
      });

      setRidesCount((prev) => prev + 1);
      return true;
    } catch (error) {
      console.error('addRide error:', error);
      return false;
    }
  };
    const loadTransactions = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;

      const transRef = collection(db, 'transactions');
      const q        = query(transRef, where('userId', '==', userId));
      const snapshot = await getDocs(q);

      const transData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      transData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setTransactions(transData);
    } catch (error) {
      console.error('loadTransactions error:', error);
    }
  };

  return (
    <AppContext.Provider value={{
      isRegistered,
      setIsRegistered,
      rides,
      transactions,
      profile,
      setProfile,
      loadProfile,
      saveProfile,
      registerUser,
      logout,
      loadRides,
      addRide,
      transactions,
      loadTransactions,

    }}>
      {children}
    </AppContext.Provider>
  );
};