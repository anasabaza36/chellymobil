import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ParentLoginScreen from '@/components/LoginScreen';
import RegisterFormScreen from '@/components/RegisterFormScreen';
import HomeScreen from './(tabs)';
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={ParentLoginScreen} />
        <Stack.Screen name="Register" component={RegisterFormScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
