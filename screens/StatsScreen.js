import React, {Component} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {AsyncStorage} from 'react-native';

import {withNavigation} from 'react-navigation';
import DatePicker from 'react-native-datepicker';
import {ContributionGraph} from 'react-native-chart-kit';
import RNPickerSelect from 'react-native-picker-select';

import codeMapping from '../common.js';

function pickerStringToDate(string) {
  let date = parseInt(string.substring(0, 2), 10);
  let month = parseInt(string.substring(3, 5), 10) - 1;
  let year = parseInt(string.substring(6), 10);
  return new Date(year, month, date);
}

function pickerDatetoString(pickedDate) {
  let date = `0${pickedDate.getDate()}`;
  date = date.substring(date.length - 2);
  let month = `0${pickedDate.getMonth() + 1}`;
  month = month.substring(month.length - 2);
  let year = pickedDate.getFullYear();
  return `${date}/${month}/${year}`;
}

class StatsScreen extends Component {
  constructor(props) {
    super(props);
    const today = new Date();
    var prevMonth = new Date();
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    this.state = {
      startDate: pickerDatetoString(prevMonth),
      endDate: pickerDatetoString(today),
      code: 'ds',
      countData: [],
      loading: true,
    };
    this.loadData = this.loadData.bind(this);
  }

  componentDidMount() {
    const {navigation} = this.props;
    this.focusListener = navigation.addListener('focus', () => {
      this.loadData();
    });
  }

  componentWillUnmount() {
    // Remove the event listener
    const {navigation} = this.props;
    navigation.removeListener('focus', () => {
      this.loadData();
    });
  }

  loadData() {
    this.setState({loading: true});
    const {startDate, endDate, code, countData, loading} = this.state;
    let newData = [];
    const numDays =
      (pickerStringToDate(endDate).getTime() -
        pickerStringToDate(startDate).getTime()) /
        (1000 * 3600 * 24) +
      1;
    let numReturned = 0;
    for (
      var d = pickerStringToDate(startDate);
      d <= pickerStringToDate(endDate);
      d.setDate(d.getDate() + 1)
    ) {
      const dateString = d.toLocaleDateString();
      let paddedMonth = `0${d.getMonth() + 1}`;
      paddedMonth = paddedMonth.substring(paddedMonth.length - 2);
      let paddedDate = `0${d.getDate()}`;
      paddedDate = paddedDate.substring(paddedDate.length - 2);
      const date = `${d.getFullYear()}-${paddedMonth}-${paddedDate}`;
      try {
        AsyncStorage.getItem(dateString).then(data => {
          const parsedData = JSON.parse(data);
          if (parsedData !== null) {
            newData.push({
              date: date,
              count: parseInt(parsedData[codeMapping[code].list].length, 10),
            });
          } else {
            console.log('data is null');
          }
          numReturned++;
          if (numReturned === numDays) {
            this.setState({countData: newData, loading: false});
          }
        });
      } catch (error) {
        console.log(error);
        console.log('did not mount successfully');
      }
    }
  }

  render() {
    const {startDate, endDate, code, countData, loading} = this.state;
    if (loading) {
      return (
        <View>
          <Text>Loading...</Text>
          <TouchableOpacity onPress={this.loadData}>
            <Text>Reload</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const datePickerCustomStyle = {
      dateIcon: {
        display: 'none',
      },
      dateText: {
        fontSize: 18,
      },
    };

    let codePickerItems = [];
    for (var key in codeMapping) {
      codePickerItems.push({label: codeMapping[key].label, value: key})
    }

    var numDays =
      (pickerStringToDate(endDate).getTime() -
        pickerStringToDate(startDate).getTime()) /
        (1000 * 3600 * 24) +
      1;

    const chartConfig = {
      backgroundGradientFrom: '#fafafa',
      backgroundGradientFromOpacity: 0,
      backgroundGradientTo: '#fafafa',
      backgroundGradientToOpacity: 0,
      color: (opacity = 1) => {
        // hex to rgb from https://stackoverflow.com/a/11508164
        var bigint = parseInt(codeMapping[code].color.substring(1), 16);
        var r = (bigint >> 16) & 255;
        var g = (bigint >> 8) & 255;
        var b = bigint & 255;
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
      },
      labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
      propsForLabels: {
        fontSize: '18',
        x: '0',
      }
    };

    return (
      <View style={styles.container}>
        <View style={styles.dateRangeContainer}>
          <View style={styles.dateRangeRow}>
            <Text style={styles.datePickerLabel}> From </Text>
            <DatePicker
              style={styles.datePicker}
              date={startDate}
              mode="date"
              placeholder="select date"
              format="DD/MM/YYYY"
              confirmBtnText="OK"
              cancelBtnText="Cancel"
              customStyles={datePickerCustomStyle}
              onDateChange={date => {
                this.setState({startDate: date});
                this.loadData();
              }}
            />
          </View>
          <View style={styles.dateRangeRow}>
            <Text style={styles.datePickerLabel}> To </Text>
            <DatePicker
              style={styles.datePicker}
              date={endDate}
              mode="date"
              placeholder="select date"
              format="DD/MM/YYYY"
              confirmBtnText="OK"
              cancelBtnText="Cancel"
              customStyles={datePickerCustomStyle}
              onDateChange={date => {
                this.setState({endDate: date});
                this.loadData();
              }}
            />
          </View>
          <View style={styles.dateRangeRow}>
            <Text style={styles.datePickerLabel}> Type </Text>
            <RNPickerSelect
              onValueChange={value => this.setState({code: value})}
              items={codePickerItems}
              style={pickerStyles}
              placeholder={{}}
              value={code}
            />
          </View>
        </View>
        <ScrollView
          style={styles.summary}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={this.loadData} />
          }>
          <Text style={styles.summaryTitle}>{codeMapping[code].label}</Text>
          <ContributionGraph
            values={countData}
            endDate={pickerStringToDate(endDate)}
            numDays={numDays}
            width={328}
            height={400}
            squareSize={36}
            chartConfig={chartConfig}
            horizontal={false}
          />
        </ScrollView>
      </View>
    );
  }
}

export default withNavigation(StatsScreen);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fafafa',
  },
  innerContainerNoData: {
    paddingHorizontal: 24,
    paddingTop: 32,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerContainerHasData: {
    paddingHorizontal: 24,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  dateRangeContainer: {
    paddingTop: 24,
    paddingBottom: 8,
    backgroundColor: 'white',
    shadowColor: 'black',
    shadowOpacity: 0.5,
    shadowOffset: {width: 3, height: 3},
    shadowRadius: 8,
    elevation: 3,
  },
  dateRangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    marginBottom: 16,
  },
  datePickerLabel: {
    fontSize: 18,
    width: 64,
  },
  datePicker: {
    width: 200,
  },
  summary: {
    paddingHorizontal: 32,
    paddingVertical: 24,
  },
  summaryTitle: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 16,
  },
});

const pickerStyles = StyleSheet.create({
  inputIOS: {
    width: 200,
    paddingRight: 30, // to ensure the text is never behind the icon
    borderWidth: 1,
    borderColor: 'black',
    fontSize: 18,
  },
  inputAndroid: {
    width: 200,
    paddingLeft: 20,
    paddingRight: 30, // to ensure the text is never behind the icon
    borderWidth: 1,
    borderColor: 'black',
    fontSize: 18,
  },
});
