import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme';

import Login from '../screens/LoginScreen';
import Profil from '../screens/ProfilScreen';
import Home from '../screens/customer/HomeScreen';
import BookingForm from '../screens/customer/BookingScreen';
import Monitoring from '../screens/customer/MonitoringScreen';
import Riwayat from '../screens/customer/RiwayatScreen';
import BookingDetail from '../screens/customer/BookingDetailScreen';
import Payment from '../screens/customer/PaymentScreen';
import Dashboard from '../screens/manager/DashboardScreen';
import BookingList from '../screens/manager/BookingListScreen';
import MotorList from '../screens/manager/MotorListScreen';
import LaporanList from '../screens/manager/LaporanListScreen';
import ManagerBookingDetail from '../screens/manager/ManagerBookingDetailScreen';
import ReportForm from '../screens/manager/ReportFormScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const makeTabs = (icons) => ({ route }) => ({
  headerShown: false,
  tabBarActiveTintColor: colors.primary,
  tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
  tabBarIcon: ({ color, size }) => <Ionicons name={icons[route.name]} size={size} color={color} />,
});

function useTabStyle() {
  const insets = useSafeAreaInsets();
  return { height: 58 + insets.bottom, paddingBottom: 6 + insets.bottom, paddingTop: 6 };
}

function CustomerTabs() {
  const style = useTabStyle();
  const icons = { Home: 'home', Booking: 'add-circle', Monitoring: 'eye', Riwayat: 'time', Profil: 'person' };
  return (
    <Tab.Navigator screenOptions={(p) => ({ ...makeTabs(icons)(p), tabBarStyle: style })}>
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Booking" component={BookingForm} />
      <Tab.Screen name="Monitoring" component={Monitoring} />
      <Tab.Screen name="Riwayat" component={Riwayat} />
      <Tab.Screen name="Profil" component={Profil} />
    </Tab.Navigator>
  );
}

function ManagerTabs() {
  const style = useTabStyle();
  const icons = { Dashboard: 'grid', Booking: 'list', Motor: 'bicycle', Laporan: 'clipboard', Profil: 'person' };
  return (
    <Tab.Navigator screenOptions={(p) => ({ ...makeTabs(icons)(p), tabBarStyle: style })}>
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="Booking" component={BookingList} />
      <Tab.Screen name="Motor" component={MotorList} />
      <Tab.Screen name="Laporan" component={LaporanList} />
      <Tab.Screen name="Profil" component={Profil} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="CustomerTabs" component={CustomerTabs} />
        <Stack.Screen name="ManagerTabs" component={ManagerTabs} />
        <Stack.Screen name="BookingDetail" component={BookingDetail} />
        <Stack.Screen name="Payment" component={Payment} />
        <Stack.Screen name="ManagerBookingDetail" component={ManagerBookingDetail} />
        <Stack.Screen name="ReportForm" component={ReportForm} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
