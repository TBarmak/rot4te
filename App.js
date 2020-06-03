import React from 'react';
import { StyleSheet } from 'react-native';
import PassPlay from './components/PassPlay'
import HomeScreen from './components/HomeScreen';
import Settings from './components/Settings';
import { createStackNavigator } from '@react-navigation/stack'
import { NavigationContainer } from '@react-navigation/native'
import Tutorial from './components/Tutorial';
import PlayBot from './components/PlayBot';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false
        }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Settings" component={Settings} />
        <Stack.Screen name="Pass and Play" component={PassPlay} />
        <Stack.Screen name="Tutorial" component={Tutorial} />
        <Stack.Screen name="Play Bot" component={PlayBot} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  }
});
