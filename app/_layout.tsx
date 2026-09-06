import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { StoreProvider } from '../src/lib/store';
import { T } from '../src/lib/theme';

export default function Layout() {
  return (
    <StoreProvider>
      <View style={{ flex: 1, backgroundColor: T.bg }}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: T.bg },
            animation: 'fade_from_bottom',
          }}
        >
          <Stack.Screen name="paywall" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        </Stack>
      </View>
    </StoreProvider>
  );
}
