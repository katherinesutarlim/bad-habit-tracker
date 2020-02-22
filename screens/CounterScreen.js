import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {AsyncStorage} from 'react-native';

import codeMapping from '../common.js';

function MenuItemFull({text, pressCallback, color}) {
  return (
    <TouchableOpacity
      style={[styles.menuItem, styles.menuItemFull, {backgroundColor: color}]}
      onPress={pressCallback}>
      <Text style={styles.menuItemText}> {text} </Text>
    </TouchableOpacity>
  );
}

function MenuItemHalf({text, pressCallback, color}) {
  return (
    <TouchableOpacity
      style={[styles.menuItem, styles.menuItemHalf, {backgroundColor: color}]}
      onPress={pressCallback}>
      <Text style={styles.menuItemText}> {text} </Text>
    </TouchableOpacity>
  );
}

function dateToday() {
  const today = new Date();
  return today.toLocaleDateString();
}

function timeNow() {
  const today = new Date();
  return today.toLocaleTimeString();
}

async function savelog(type) {
  const date = dateToday();
  const time = timeNow();
  let log = {
    wantDo: [],
    wantStop: [],
    doContinueReward: [],
    doContinueObsess: [],
    doStop: [],
  };
  if (type === 'wd') {
    log.wantDo.push(time);
  } else if (type === 'ws') {
    log.wantStop.push(time);
  } else if (type === 'dcr') {
    log.doContinueReward.push(time);
  } else if (type === 'dco') {
    log.doContinueObsess.push(time);
  } else if (type === 'ds') {
    log.doStop.push(time);
  }
  try {
    await AsyncStorage.setItem(date, JSON.stringify(log));
  } catch (error) {
    // Error saving data
    console.log('Error Saving Data');
  }
}

async function addLog(type) {
  const date = dateToday();
  const time = timeNow();
  try {
    let logString = await AsyncStorage.getItem(date);
    let log = JSON.parse(logString);
    if (log !== null) {
      // We have data!!
      if (type === 'wd') {
        log.wantDo.push(time);
      } else if (type === 'ws') {
        log.wantStop.push(time);
      } else if (type === 'dcr') {
        log.doContinueReward.push(time);
      } else if (type === 'dco') {
        log.doContinueObsess.push(time);
      } else if (type === 'ds') {
        log.doStop.push(time);
      }
      await AsyncStorage.setItem(date.substring(0, 10), JSON.stringify(log));
    } else {
      savelog(type);
    }
  } catch (error) {
    savelog(type);
    console.log('Error Fetching Data');
  }
}

export default function CounterScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <MenuItemFull
          text={codeMapping.wd.label}
          pressCallback={() => addLog('wd')}
          color={codeMapping.wd.color}
        />
        <MenuItemFull
          text={codeMapping.ws.label}
          pressCallback={() => addLog('ws')}
          color={codeMapping.ws.color}
        />
        <View style={styles.row}>
          <MenuItemHalf
            text={codeMapping.dcr.label}
            pressCallback={() => addLog('dcr')}
            color={codeMapping.dcr.color}
          />
          <MenuItemHalf
            text={codeMapping.dco.label}
            pressCallback={() => addLog('dco')}
            color={codeMapping.dco.color}
          />
        </View>
        <MenuItemFull
          text={codeMapping.ds.label}
          pressCallback={() => addLog('ds')}
          color={codeMapping.ds.color}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
  },
  innerContainer: {
    paddingHorizontal: 24,
    paddingTop: 32,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignContent: 'space-between',
    height: '100%',
    shadowColor: 'black',
    shadowOpacity: 0.5,
    shadowOffset: {width: 3, height: 3},
    shadowRadius: 8,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    flex: 2,
  },
  menuItem: {
    padding: 16,
    justifyContent: 'center',
  },
  menuItemFull: {
    flex: 1,
  },
  menuItemHalf: {
    flex: 1,
    // width: '50%',
  },
  menuItemText: {
    fontSize: 24,
    textAlign: 'center',
  },
  activeTitle: {
    color: 'red',
  },
});
