import React, { Component } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import I18n from '~/modules/language'

import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func'
import DateTimePicker from 'react-native-modal-datetime-picker';
import moment from 'moment';
import CustomIcon from '~/component/Icon'
import Ionicons from 'react-native-vector-icons/Ionicons'
import * as timeUtils from '~/lib/base/dateTime';
import { getStartDay, getEndDay } from '~/lib/base/functionUtil'
import * as setTestId from '~/constants/testId';
/**
 * @description Render header for OM v2's UI.
 * List of optional props:
 * 1. renderLeftComp: left component, like back button
 * 2. renderContent: main title of the header
 * 3. renderRightComp: right component, like next button
 * 4. Styles:
 * 	a. firstChildStyles: styles for first child component
 * 	b. secondChildStyles: styles for second child component
 * 	c. rootStyles: styles for upper header component
 * 	d. childrenContainerStyles: styles for children's container
 * 	e. style: styles for left component and title's container
 */

const confirmTextIOS = I18n.t('confirm')
const cancelTextIOS = I18n.t('cancel')
const titleIOS = I18n.t('pickADate')

export default class CustomDate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fromDate: props.fromDate || getStartDay(),
      toDate: props.toDate || getEndDay(),
      isFromDateTimePickerVisible: false,
      isToDateTimePickerVisible: false
    };
  }

  showFromDateTimePicker() {
    this.setState({ isFromDateTimePickerVisible: true });
  }
  handleFromDatePicked(date) {
    if (this.checkChangeDate({ fromDate: date })) {
      this.hideFromDateTimePicker();
      return
    }
    let fromDate = new Date(date).setHours(0, 0, 0);
    // if (new Date(fromDate).getHours() > 0) {
    // fromDate = timeUtils.convertLocationToStartDaySettingTime(fromDate);
    // }
    this.setState({ fromDate }, () => this.applyNewDate())
    this.hideFromDateTimePicker();
  }
  hideFromDateTimePicker() {
    this.setState({ isFromDateTimePickerVisible: false });
  }

  showToDateTimePicker() {
    this.setState({ isToDateTimePickerVisible: true });
  }

  checkChangeDate({ fromDate, toDate }) {
    if (fromDate && new Date(fromDate).getDay() === new Date(this.state.fromDate).getDay() &&
      new Date(fromDate).getMonth() === new Date(this.state.fromDate).getMonth() &&
      new Date(fromDate).getFullYear() === new Date(this.state.fromDate).getFullYear()) return true
    if (toDate && new Date(toDate).getDay() === new Date(this.state.toDate).getDay() &&
      new Date(toDate).getMonth() === new Date(this.state.toDate).getMonth() &&
      new Date(toDate).getFullYear() === new Date(this.state.toDate).getFullYear()) return true
    return false
  }

  handleToDatePicked(date) {
    if (this.checkChangeDate({ toDate: date })) {
      this.hideToDateTimePicker();
      return
    }
    let toDate = new Date(date).setHours(23, 59, 59);
    // if (new Date(toDate).getHours() > 0) {
    //   toDate = timeUtils.convertLocationToEndDaySettingTime(toDate);
    // }
    this.setState({ toDate }, () => this.applyNewDate())
    this.hideToDateTimePicker();
  }
  hideToDateTimePicker() {
    this.setState({ isToDateTimePickerVisible: false });
  }

  applyNewDate() {
    const { fromDate, toDate } = this.state;
    this.props.applyDate && this.props.applyDate(fromDate, toDate)
  }

  componentWillReceiveProps(nextProps) {
    if ((nextProps.fromDate && nextProps.fromDate !== this.state.fromDate) ||
      (nextProps.toDate && nextProps.toDate !== this.state.toDate)) {
      this.setState({
        fromDate: nextProps.fromDate,
        toDate: nextProps.toDate
      })
    }
  }

  render() {
    return (
      <View style={[styles.container, this.props.style]}>
        <View style={[styles.customDateContainer, this.props.prCustomDateContainer || {}]}>
          <Text {...setTestId.testProp('Id_Custom_Date_From_Text', 'Label_Custom_Date_From_Text')} style={CommonStyle.textFloatingLabel}>{I18n.t('from')}</Text>
          <View style={styles.customData}>
            <View>
              <Text {...setTestId.testProp('Id_fromDateReports', 'Label_fromDateReports')} style={CommonStyle.textDataSub}>{moment(new Date(this.state.fromDate)).format('DD/MM/YYYY')}</Text>
              <View style={styles.activeMark}></View>
            </View>
            <View style={{ width: 16 }} />
            <CustomIcon onPress={this.showFromDateTimePicker.bind(this)}
              {...setTestId.testProp('Id_iconFromDateReports', 'Label_iconFromDateReports')}
              style={CommonStyle.iconCustomDate}
              name='equix_calendar' />
            <DateTimePicker
              maximumDate={new Date(this.state.toDate)}
              date={new Date(this.state.fromDate)}
              isVisible={this.state.isFromDateTimePickerVisible}
              onConfirm={this.handleFromDatePicked.bind(this)}
              onCancel={this.hideFromDateTimePicker.bind(this)}
              datePickerModeAndroid='spinner'
              titleIOS={titleIOS}
              confirmTextIOS={confirmTextIOS}
              cancelTextIOS={cancelTextIOS}
            />
          </View>
        </View>
        <View style={{ width: 32 }} />
        <View style={styles.customDateContainer}>
          <Text {...setTestId.testProp('Id_Custom_Date_To_Text', 'Label_Custom_Date_To_Text')} style={CommonStyle.textFloatingLabel}>{I18n.t('to')}</Text>
          <View style={styles.customData}>
            <View>
              <Text {...setTestId.testProp('Id_toDateReports', 'Label_toDateReports')}testID='toDateReports' style={CommonStyle.textDataSub}>{moment(new Date(this.state.toDate)).format('DD/MM/YYYY')}</Text>
              <View style={styles.activeMark}></View>
            </View>
            <View style={{ width: 16 }} />
            <CustomIcon onPress={this.showToDateTimePicker.bind(this)}
              {...setTestId.testProp('Id_iconToDateReports', 'Label_iconToDateReports')}
              style={CommonStyle.iconCustomDate}
              name='equix_calendar' />
            <DateTimePicker
              maximumDate={this.props.maximumDate || new Date(new Date().setHours(23, 59, 59))}
              date={new Date(this.state.toDate)}
              minimumDate={new Date(this.state.fromDate)}
              isVisible={this.state.isToDateTimePickerVisible}
              onConfirm={this.handleToDatePicked.bind(this)}
              onCancel={this.hideToDateTimePicker.bind(this)}
              datePickerModeAndroid='spinner'
              titleIOS={titleIOS}
              confirmTextIOS={confirmTextIOS}
              cancelTextIOS={cancelTextIOS}
            />
          </View>
        </View>
      </View>
    );
  }
}

const styles = {}
function getNewestStyle() {
	const newStyle = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    justifyContent: 'space-between',
    flexDirection: 'row'
  },
  customDateContainer: {
    flex: 3,
    justifyContent: 'center',
    backgroundColor: 'transparent'
  },
  customData: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  activeMark: {
    width: '100%',
    marginTop: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: CommonStyle.color.turquoiseBlue,
    overflow: 'hidden'
  }
});
PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)
