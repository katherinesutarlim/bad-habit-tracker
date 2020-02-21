/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {library} from '@fortawesome/fontawesome-svg-core';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faCalendarDay,
  faPen,
  faChartBar,
} from '@fortawesome/free-solid-svg-icons';

import CounterScreen from './screens/CounterScreen';
import HistoryScreen from './screens/HistoryScreen';
import StatsScreen from './screens/StatsScreen';

library.add(faCalendarDay, faPen, faChartBar);

const Tab = createBottomTabNavigator();

export default function App() {
  console.disableYellowBox = true;
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({route}) => ({
          tabBarIcon: ({focused, color, size}) => {
            let iconName;

            if (route.name === 'Count') {
              iconName = 'pen';
            } else if (route.name === 'History') {
              iconName = 'calendar-day';
            } else if (route.name === 'Stats') {
              iconName = 'chart-bar';
            }
            // You can return any component that you like here!
            return <FontAwesomeIcon icon={iconName} />;
          },
        })}
        tabBarOptions={{
          activeTintColor: 'tomato',
          inactiveTintColor: 'gray',
        }}>
        <Tab.Screen name="Count" component={CounterScreen} />
        <Tab.Screen name="History" component={HistoryScreen} />
        <Tab.Screen name="Stats" component={StatsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
