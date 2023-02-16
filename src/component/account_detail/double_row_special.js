import React, { Component } from 'react';
import { View, Text, PixelRatio } from 'react-native';
import styles from './style/account_detail';
import Icon from 'react-native-vector-icons/Ionicons';
import DateTimePicker from 'react-native-modal-datetime-picker';
import I18n from '../../modules/language';

export default class DoubleRowSpecial extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isDateTimePickerVisible: false
    }
  }

  showDateTimePicker() {
    this.setState({ isDateTimePickerVisible: true });
  }

  hideDateTimePicker() {
    this.setState({ isDateTimePickerVisible: false });
  }

  handleDatePicked(index, date) {
    this.props.actions.changedProperty('applicant', 'dob', index, date.getTime());
    this.hideDateTimePicker();
  }

  render() {
    const i = this.props.index;
    return (
      <View style={styles.row2}>
        <View style={{ width: '50%', paddingRight: 8 }}>
          <View style={styles.rowNoHeight}>
            <Text style={styles.textField}>{I18n.tEn('DOB')}</Text>
            <View style={{ width: '100%', flexDirection: 'row' }}>
              <Text style={styles.mainText}>{this.props.data1}</Text>
              <DateTimePicker
                maximumDate={new Date()}
                isVisible={this.state.isDateTimePickerVisible}
                onConfirm={this.handleDatePicked.bind(this, i)}
                onCancel={this.hideDateTimePicker.bind(this)}
              />
              <Icon name='md-calendar' size={24} style={styles.iconPicker2}
                onPress={this.showDateTimePicker.bind(this)} />
            </View>
          </View>
        </View>
        <View style={{ width: '50%', paddingLeft: 8 }}>
          <View style={styles.rowNoHeight}>
            <Text style={styles.textField}>{I18n.tEn('Gender')}</Text>
            <View style={{ width: '100%', flexDirection: 'row' }}>
              <Text style={styles.mainText}>{this.props.data2}</Text>
              <Icon name='md-arrow-dropdown' size={24} style={styles.iconPicker2}
                onPress={this.props.onShowFilter} />
            </View>
          </View>
        </View>
      </View>
    );
  }
}
