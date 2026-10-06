import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useApp } from '../context/AppContext';
import CustomerNavigator from './CustomerNavigator';
import PengelolaNavigator from './PengelolaNavigator';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { currentUser } = useApp();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!currentUser ? (
          // ── AUTH STACK ─────────────────────────────────────
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : currentUser.role === 'pengelola' ? (
          // ── PENGELOLA APP ──────────────────────────────────
          <Stack.Screen name="PengelolaApp" component={PengelolaNavigator} />
        ) : (
          // ── CUSTOMER APP ───────────────────────────────────
          <Stack.Screen name="CustomerApp" component={CustomerNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
