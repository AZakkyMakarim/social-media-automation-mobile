import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import MainNavigator from './src/navigation/MainNavigator';
import { getDb } from './src/db/database';
import { Colors } from './src/utils/theme';

export default function App() {
  const [dbReady, setDbReady] = React.useState(false);

  useEffect(() => {
    getDb()
      .then(() => setDbReady(true))
      .catch((e) => {
        console.error('DB init error:', e);
        setDbReady(true); // continue even if DB fails, screens will handle it
      });
  }, []);

  if (!dbReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" backgroundColor={Colors.background} />
        <MainNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
