import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { TouchableOpacity } from 'react-native';

// Back button component
function BackButton() {
  const router = useRouter();

  const onPress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/login');
    }
  };

  return (
    <TouchableOpacity onPress={onPress} style={{ marginLeft: 12 }}>
      <Ionicons name="arrow-back" size={24} color="#000" />
    </TouchableOpacity>
  );
}

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#fff' },
        headerTitle: '', // hides title globally
        headerTintColor: '#000', // arrow color
      }}
    >
      {/* Home page: no back arrow */}
      <Stack.Screen
        name="index"
        options={{
          headerLeft: () => null,
        }}
      />

      {/* Other pages: arrow only */}
      <Stack.Screen
        name="explore"
        options={{
          headerLeft: () => <BackButton />,
        }}
      />

      <Stack.Screen
        name="details"
        options={{
          headerLeft: () => <BackButton />,
        }}
      />
    </Stack>
  );
}
