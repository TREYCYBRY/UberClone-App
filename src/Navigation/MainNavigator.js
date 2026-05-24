// src/Navigation/MainNavigator.js

import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { AppContext } from '../Context/AppContext';
import { COLORS } from '../Styles/GlobalStyles';

import ProfileScreen from '../Screens/ProfileScreen';
import RideScreen from '../Screens/RideScreen';
import HistoryScreen from '../Screens/HistoryScreen';

const Tab = createBottomTabNavigator();


const getTabIcon = (routeName, focused) => {
  const icons = {
    Ride:     focused ? '🚗' : '🚘',
    Payment:  focused ? '💳' : '💳',
    History:  focused ? '📋' : '📄',
    Profile:  focused ? '👤' : '👤',
  };
  return icons[routeName] || '●';
};

const MainNavigator = () => {
    const { rides } = useContext(AppContext);

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                // icon de tabs
                tabBarIcon: ({ focused }) => (
                <Text style={{ fontSize: 20 }}>
                    {getTabIcon(route.name, focused)}
                </Text>
                ),
                // styles tab bar
                tabBarActiveTintColor:   COLORS.primary,
                tabBarInactiveTintColor: COLORS.textSecondary,
                tabBarStyle: {
                backgroundColor: COLORS.surface,
                borderTopWidth: 1,
                borderTopColor: COLORS.border,
                height: 60,
                paddingBottom: 8,
                paddingTop: 4,
                },
                tabBarLabelStyle: {
                fontSize: 11,
                fontWeight: '600',
                },
                headerShown: false,
            })}
        >
            <Tab.Screen
                name="Ride"
                component={RideScreen}
                options={{ tabBarLabel: 'Solicitar' }}
            />
            <Tab.Screen
                name="History"
                component={HistoryScreen}
                options={{
                tabBarLabel: 'Historial',
                //Badge number of rides 
                tabBarBadge: rides.length > 0 ? rides.length : undefined,
                tabBarBadgeStyle: {
                    backgroundColor: COLORS.secondary,
                    color: COLORS.surface,
                    fontSize: 10,
                },
                }}
            />
            <Tab.Screen 
                name="Profile" 
                component={ProfileScreen} 
                options={{tabBarLabel: 'Perfil'}}
            />
            

        </Tab.Navigator>
    );
};
export default MainNavigator;