import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DashboardScreen from '../screens/DashboardScreen';
import TasksScreen from '../screens/TasksScreen';
import TaskCreationScreen from '../screens/TaskCreationScreen';
import AccountsScreen from '../screens/AccountsScreen';
import LogsScreen from '../screens/LogsScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import { Colors, FontSize } from '../utils/theme';

const Tab = createBottomTabNavigator();
const TaskStack = createNativeStackNavigator();

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Dashboard: '🏠',
    Tasks: '⚡',
    Accounts: '👤',
    Logs: '📋',
    Setup: '⚙️',
  };
  return (
    <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>
      {icons[name] || '•'}
    </Text>
  );
}

const screenOptions = {
  headerStyle: { backgroundColor: Colors.surface },
  headerTintColor: Colors.text,
  headerTitleStyle: { fontWeight: '700' as const, fontSize: FontSize.lg },
};

function TaskStackNavigator() {
  return (
    <TaskStack.Navigator id="TaskStack" screenOptions={screenOptions}>
      <TaskStack.Screen name="TaskQueue" component={TasksScreen} options={{ title: 'Tasks' }} />
      <TaskStack.Screen name="CreateTask" component={TaskCreationScreen} options={{ title: 'Buat Task Baru' }} />
    </TaskStack.Navigator>
  );
}

export default function MainNavigator() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = 64 + insets.bottom;
  return (
    <Tab.Navigator
      id="MainTabs"
      screenOptions={({ route }) => ({
        ...screenOptions,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          paddingBottom: insets.bottom + 16,
          paddingTop: 16,
          height: tabBarHeight,
        },
        tabBarLabelStyle: { fontSize: FontSize.xs, fontWeight: '600' },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="Tasks" component={TaskStackNavigator} options={{ title: 'Tasks', headerShown: false }} />
      <Tab.Screen name="Accounts" component={AccountsScreen} options={{ title: 'Akun' }} />
      <Tab.Screen name="Logs" component={LogsScreen} options={{ title: 'Log' }} />
      <Tab.Screen name="Setup" component={OnboardingScreen} options={{ title: 'Setup' }} />
    </Tab.Navigator>
  );
}
