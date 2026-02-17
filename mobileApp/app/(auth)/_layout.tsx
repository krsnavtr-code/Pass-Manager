import { Stack } from 'expo-router';
import React from 'react';
import { useTheme } from '@/context/ThemeContext';

export default function AuthLayout() {
  const { colorScheme } = useTheme();

  return (
    <Stack
      screenOptions={{
        // Hide the default header to use your custom designed headers
        headerShown: false,
        // Modern fade transition between login and register
        animation: 'fade',
        // Ensure the background color matches your theme during transitions
        contentStyle: {
          backgroundColor: colorScheme === 'dark' ? '#0F172A' : '#FFFFFF',
        },
      }}>
      <Stack.Screen 
        name="login" 
        options={{ 
          title: 'Login',
        }} 
      />
      <Stack.Screen 
        name="register" 
        options={{ 
          title: 'Register',
        }} 
      />
    </Stack>
  );
}