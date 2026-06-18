import React from 'react';
import { TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ObrasScreen from './src/screens/ObrasScreen';
import ObraDetalhesScreen from './src/screens/ObraDetalhesScreen';
import GestoresScreen from './src/screens/GestoresScreen';
import MestresScreen from './src/screens/MestresScreen';
import RelatorioScreen from './src/screens/RelatorioScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function GestorTabs() {
  const { handleLogout } = useAuth();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') iconName = focused ? 'speedometer' : 'speedometer-outline';
          else if (route.name === 'Obras') iconName = focused ? 'business' : 'business-outline';
          else if (route.name === 'Gestores') iconName = focused ? 'people' : 'people-outline';
          else if (route.name === 'Mestres') iconName = focused ? 'layers' : 'layers-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#1e40af',
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
        headerRight: () => (
          <TouchableOpacity onPress={handleLogout} style={{ marginRight: 16 }}>
            <Ionicons name="log-out-outline" size={22} color="#ef4444" />
          </TouchableOpacity>
        ),
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Obras" component={ObrasScreen} />
      <Tab.Screen name="Gestores" component={GestoresScreen} />
      <Tab.Screen name="Mestres" component={MestresScreen} />
    </Tab.Navigator>
  );
}

function MestreTabs() {
  const { handleLogout } = useAuth();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') iconName = focused ? 'speedometer' : 'speedometer-outline';
          else if (route.name === 'Relatório') iconName = focused ? 'journal' : 'journal-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#1e40af',
        tabBarInactiveTintColor: 'gray',
        headerShown: true,
        headerRight: () => (
          <TouchableOpacity onPress={handleLogout} style={{ marginRight: 16 }}>
            <Ionicons name="log-out-outline" size={22} color="#ef4444" />
          </TouchableOpacity>
        ),
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Relatório" component={RelatorioScreen} />
    </Tab.Navigator>
  );
}

function Navigation() {
  const { isAuthenticated, user } = useAuth();
  const isGestor = user?.role === 'gestor';
  const isMestre = user?.role === 'mestre';

  return (
    <NavigationContainer>
      {!isAuthenticated ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
      ) : isGestor ? (
        <Stack.Navigator>
          <Stack.Screen name="Home" component={GestorTabs} options={{ headerShown: false }} />
          <Stack.Screen
            name="ObraDetalhes"
            component={ObraDetalhesScreen}
            options={{
              title: 'Detalhes da Obra',
              headerBackTitle: 'Voltar',
              headerTintColor: '#1e40af',
            }}
          />
        </Stack.Navigator>
      ) : isMestre ? (
        <Stack.Navigator>
          <Stack.Screen name="Home" component={MestreTabs} options={{ headerShown: false }} />
          <Stack.Screen
            name="ObraDetalhes"
            component={ObraDetalhesScreen}
            options={{
              title: 'Detalhes da Obra',
              headerBackTitle: 'Voltar',
              headerTintColor: '#1e40af',
            }}
          />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator>
          <Stack.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{
              title: 'Acompanhar Obra',
              headerRight: () => {
                const { handleLogout } = useAuth();
                return (
                  <TouchableOpacity onPress={handleLogout} style={{ marginRight: 16 }}>
                    <Ionicons name="log-out-outline" size={22} color="#ef4444" />
                  </TouchableOpacity>
                );
              },
            }}
          />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Navigation />
    </AuthProvider>
  );
}