import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

// Screens
import HomeScreen from '../screens/customer/HomeScreen';
import BookingScreen from '../screens/customer/BookingScreen';
import BookingDetailScreen from '../screens/customer/BookingDetailScreen';
import PaymentScreen from '../screens/customer/PaymentScreen';
import MonitoringScreen from '../screens/customer/MonitoringScreen';
import ConditionReportScreen from '../screens/customer/ConditionReportScreen';
import HistoryScreen from '../screens/customer/HistoryScreen';
import ProfileScreen from '../screens/customer/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ── Home Stack ─────────────────────────────────────────────────
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="BookingForm" component={BookingScreen} />
      <Stack.Screen name="BookingDetail" component={BookingDetailScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
    </Stack.Navigator>
  );
}

// ── Monitoring Stack ────────────────────────────────────────────
function MonitoringStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Monitoring" component={MonitoringScreen} />
      <Stack.Screen name="ConditionReport" component={ConditionReportScreen} />
    </Stack.Navigator>
  );
}

// ── History Stack ───────────────────────────────────────────────
function HistoryStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="History" component={HistoryScreen} />
      <Stack.Screen name="BookingDetail" component={BookingDetailScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
    </Stack.Navigator>
  );
}

// ── Bottom Tab Navigator ────────────────────────────────────────
export default function CustomerNavigator() {
  const insets = useSafeAreaInsets();
  const isIos = Platform.OS === 'ios';
  const bottomPadding = isIos ? (insets.bottom > 0 ? insets.bottom : 24) : 10;
  const tabHeight = isIos ? (insets.bottom > 0 ? 54 + insets.bottom : 80) : 68;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.neutral200,
          borderTopWidth: 1,
          height: tabHeight,
          paddingBottom: bottomPadding,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.neutral500,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = {
            HomeTab: focused ? 'home' : 'home-outline',
            MonitoringTab: focused ? 'eye' : 'eye-outline',
            RiwayatTab: focused ? 'time' : 'time-outline',
            ProfilTab: focused ? 'person' : 'person-outline',
          };
          return <Ionicons name={icons[route.name]} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStack} options={{ title: 'Beranda' }} />
      <Tab.Screen name="MonitoringTab" component={MonitoringStack} options={{ title: 'Monitoring' }} />
      <Tab.Screen name="RiwayatTab" component={HistoryStack} options={{ title: 'Riwayat' }} />
      <Tab.Screen name="ProfilTab" component={ProfileScreen} options={{ title: 'Profil' }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
});
