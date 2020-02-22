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
import {PieChart} from 'react-native-chart-kit';
import CalendarStrip from 'react-native-calendar-strip';

import codeMapping from '../common.js';

const chartConfig = {
  backgroundColor: '#e26a00',
  backgroundGradientFrom: '#fb8c00',
  backgroundGradientTo: '#ffa726',
  decimalPlaces: 1,
  color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
  style: {
    borderRadius: 16,
  },
};

function NumberSummary({text, number, color}) {
  return (
    <View style={styles.numberSummary}>
      <View style={[styles.numberColor, {backgroundColor: color}]} />
      <Text style={[styles.numberHeading, styles.textAlign]}>{text}</Text>
      <Text style={[styles.numberFocus, styles.textAlign]}>{number}</Text>
    </View>
  );
}

class HistoryScreen extends Component {
  constructor(props) {
    super(props);
    const date = new Date();
    this.state = {
      data: [],
      loading: true,
      selectedDate: date,
    };
    this.loadData = this.loadData.bind(this);
    this.handleSelectDate = this.handleSelectDate.bind(this);
    this.reload = this.reload.bind(this);
    this.delete = this.delete.bind(this);
  }
  loadData(date) {
    const dateString = date.toLocaleDateString();
    try {
      AsyncStorage.getItem(dateString).then(data => {
        this.setState({data: JSON.parse(data), loading: false});
        if (JSON.parse(data) !== null) {
        } else {
          console.log('data is null');
        }
      });
    } catch (error) {
      console.log(error);
      console.log('did not mount successfully');
    }
  }
  componentDidMount() {
    const {navigation} = this.props;
    this.focusListener = navigation.addListener('focus', () => {
      const date = new Date();
      this.loadData(date);
    });
  }

  componentWillUnmount() {
    // Remove the event listener
    const {navigation} = this.props;
    navigation.removeListener('focus', () => {
      this.loadData();
    });
  }

  handleSelectDate(date) {
    const parsedDate = new Date(date);
    this.setState({selectedDate: parsedDate});
    this.loadData(parsedDate);
  }

  reload() {
    const date = new Date();
    this.setState({selectedDate: date});
    this.loadData(date);
  }

  delete(code, index) {
    let data = this.state.data;
    let selectedDate = this.state.selectedDate;
    data[codeMapping[code].list].splice(index, 1);

    try {
      AsyncStorage.setItem(
        selectedDate.toLocaleDateString(),
        JSON.stringify(data),
      ).then(() => {
        this.reload();
      });
    } catch (error) {
      // Error saving data
      console.log('Error Saving Data');
    }
  }

  render() {
    const {data, loading, selectedDate} = this.state;
    if (loading) {
      return (
        <View>
          <Text>Loading...</Text>
          <TouchableOpacity onPress={this.reload}>
            <Text>Reload</Text>
          </TouchableOpacity>
        </View>
      );
    }
    let summary = (
      <View style={styles.innerContainerNoData}>
        <Text style={styles.noDataText}>No data for this date.</Text>
      </View>
    );
    if (data !== null) {
      // Data array for creating Pie Chart
      const chartData = [];
      for (var property in codeMapping) {
        chartData.push({
          name: codeMapping[property].label,
          color: codeMapping[property].color,
          number: parseInt(data[codeMapping[property].list].length, 10),
        });
      }

      // Combine and sort all list of time logs into a larger list of time and code
      let combinedList = [];
      let allList = [];
      for (var code in codeMapping) {
        allList.push({
          list: data[codeMapping[code].list],
          index: 0,
          code: code,
        });
      }
      while (
        combinedList.length <
        data.wantDo.length +
          data.wantStop.length +
          data.doContinueReward.length +
          data.doContinueObsess.length +
          data.doStop.length
      ) {
        let allListIndex = 0;
        let min = {
          code: '',
          time: '',
          index: 0,
        };
        allList.forEach((item, i) => {
          if (
            (min.time === '' && item.index < item.list.length) ||
            min.time > item.list[item.index]
          ) {
            min.time = item.list[item.index];
            min.code = item.code;
            min.index = item.index;
            allListIndex = i;
          }
        });
        combinedList.push(min);
        allList[allListIndex].index++;
      }

      // Data summary to be displayed on the page
      summary = (
        <View style={styles.innerContainerHasData}>
          <PieChart
            data={chartData}
            width={240}
            height={264}
            chartConfig={chartConfig}
            accessor="number"
            backgroundColor="transparent"
            paddingLeft="60"
            absolute
            hasLegend={false}
          />
          <View style={styles.legend}>
            <NumberSummary
              text={codeMapping.wd.label}
              number={data.wantDo.length}
              color={codeMapping.wd.color}
            />
            <NumberSummary
              text={codeMapping.ws.label}
              number={data.wantStop.length}
              color={codeMapping.ws.color}
            />
            <NumberSummary
              text={codeMapping.dcr.label}
              number={data.doContinueReward.length}
              color={codeMapping.dcr.color}
            />
            <NumberSummary
              text={codeMapping.dco.label}
              number={data.doContinueObsess.length}
              color={codeMapping.dco.color}
            />
            <NumberSummary
              text={codeMapping.ds.label}
              number={data.doStop.length}
              color={codeMapping.ds.color}
            />
          </View>
          <View style={styles.logList}>
            {combinedList.map(item => (
              <TouchableOpacity
                style={styles.logListItem}
                onLongPress={() => this.delete(item.code, item.index)}>
                <View
                  style={[
                    styles.logColor,
                    {backgroundColor: codeMapping[item.code].color},
                  ]}
                />
                <Text style={styles.logLabel}>
                  {codeMapping[item.code].label}
                </Text>
                <Text style={styles.logTime}>{item.time}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={this.reload} />
        }>
        <CalendarStrip
          calendarColor={'#FFFFFF'}
          style={styles.calendarStrip}
          dateNumberStyle={styles.dateStyle}
          dateNameStyle={styles.dateStyle}
          highlightDateNumberStyle={styles.highlightDateStyle}
          highlightDateNameStyle={styles.highlightDateStyle}
          onDateSelected={this.handleSelectDate}
        />
        {summary}
      </ScrollView>
    );
  }
}

export default withNavigation(HistoryScreen);

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
  noDataText: {
    fontSize: 24,
  },
  innerContainerHasData: {
    paddingHorizontal: 24,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  calendarStrip: {
    height: 120,
    paddingTop: 20,
    paddingBottom: 0,
    shadowColor: 'black',
    shadowOpacity: 0.5,
    shadowOffset: {width: 3, height: 3},
    shadowRadius: 8,
    elevation: 3,
  },
  highlightDateStyle: {
    color: '#296BCC',
  },
  dateStyle: {
    color: 'black',
  },
  legend: {
    flexDirection: 'column',
    width: '100%',
  },
  numberSummary: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  numberColor: {
    width: 40,
    height: 40,
    marginRight: 16,
  },
  textAlign: {
    textAlign: 'left',
  },
  numberHeading: {
    fontSize: 18,
    flex: 1,
  },
  numberFocus: {
    fontSize: 24,
    width: 24,
  },
  logList: {
    width: '100%',
    marginBottom: 32,
    marginTop: 24,
    alignItems: 'flex-start',
  },
  logListItem: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  logColor: {
    width: 40,
    height: 48,
    marginRight: 16,
  },
  logLabel: {
    fontSize: 18,
    flex: 1,
  },
  logTime: {
    width: 96,
    marginLeft: 16,
    fontSize: 24,
    textAlign: 'right',
  },
});
