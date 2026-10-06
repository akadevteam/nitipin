import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

// Screens
import DashboardScreen from '../screens/pengelola/DashboardScreen';
import BookingListScreen from '../screens/pengelola/BookingListScreen';
import BookingDetailPengelolaScreen from '../screens/pengelola/BookingDetailScreen';
import MotorListScreen from '../screens/pengelola/MotorListScreen';
import MonitoringFormScreen from '../screens/pengelola/MonitoringFormScreen';
import ProfilePengelolaScreen from '../screens/pengelola/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ── Booking Stack ───────────────────────────────────────────────
function BookingStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BookingList" component={BookingListScreen} />
      <Stack.Screen name="BookingDetail" component={BookingDetailPengelolaScreen} />
    </Stack.Navigator>
  );
}

// ── Motor Stack ─────────────────────────────────────────────────
function MotorStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MotorList" component={MotorListScreen} />
      <Stack.Screen name="MonitoringForm" component={MonitoringFormScreen} />
    </Stack.Navigator>
  );
}

// ── Bottom Tab Navigator ────────────────────────────────────────
export default function PengelolaNavigator() {
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
        tabBarIcon: ({ focused, color }) => {
          const icons = {
            DashboardTab: focused ? 'grid' : 'grid-outline',
            BookingTab: focused ? 'clipboard' : 'clipboard-outline',
            MotorTab: focused ? 'bicycle' : 'bicycle-outline',
            ProfilTab: focused ? 'person' : 'person-outline',
          };
          return <Ionicons name={icons[route.name]} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="DashboardTab" component={DashboardScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="BookingTab" component={BookingStack} options={{ title: 'Booking' }} />
      <Tab.Screen name="MotorTab" component={MotorStack} options={{ title: 'Motor' }} />
      <Tab.Screen name="ProfilTab" component={ProfilePengelolaScreen} options={{ title: 'Profil' }} />
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
