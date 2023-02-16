import React, { Component } from 'react';
import { View, Text, Dimensions, TouchableWithoutFeedback, TextInput, TouchableOpacity, Keyboard, PixelRatio, Platform } from 'react-native';
import styles from './style/order';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { roundFloat, formatNumberNew2, logAndReport, formatNumberNew, checkPropsStateShouldUpdate } from '../../lib/base/functionUtil';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { dataStorage } from '../../storage';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import * as pickerActions from './picker.actions';
import ModalPicker from './../modal_picker/modal_picker';
import { iconsMap } from '../../utils/AppIcons';

const { width, height } = Dimensions.get('window');

export class PickerCustom extends Component {
  constructor(props) {
    super(props);
        this.state = {
      modalVisible: false,
      name: this.props.name || '',
      data: [],
      errorText: this.props.errorText || '',
      selectedValue: this.props.selectedValue || '',
      disabled: this.props.disabled || false
    }
    this.isFormatPrice = false
  }

  componentWillMount() {
    let data = this.props.data || [];
    let newData = [];
    data.forEach(element => {
      element && newData.push(element);
    });
    this.setState({ data: newData });
  }

  _onFocus(name) {
    this.isFormatPrice = false
  }

  formatPrice(price) {
    if (this.props.name === 'Limit Price' || this.props.name === 'Stop Price' || this.props.name === 'Trailing Amount') {
      this.setState({ selectedValue: formatNumberNew2(price, 3) }, () => {
        this.isFormatPrice = true
        dataStorage.isNewOrderChangeTextInput = false
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps && (nextProps.name !== this.state.name || nextProps.data !== this.state.data || nextProps.errorText !== this.state.errorText ||
      nextProps.selectedValue !== this.state.selectedValue || nextProps.disabled !== this.state.disabled)) {
      if (!dataStorage.isNewOrderChangeTextInput && this.isFormatPrice && (nextProps.name === 'Limit Price' || nextProps.name === 'Stop Price' || nextProps.name === 'Trailing Amount')) {
        this.setState({
          name: nextProps.name,
          data: nextProps.data,
          errorText: nextProps.errorText,
          disabled: nextProps.disabled
        }, () => {
          // this.isFormatPrice = false
        });
      } else {
        this.setState({
          name: nextProps.name,
          data: nextProps.data,
          errorText: nextProps.errorText,
          selectedValue: nextProps.selectedValue,
          disabled: nextProps.disabled
        });
      }
    }
  }

  onValueChange(value) {
    try {
      if (value === '0') {
        value = this.state.data[0];
      }
      if (value === '--') {
        value = this.state.selectedValue;
      }
      if (this.state.name === 'Volume') {
        value = parseFloat(value);
      }
      this.setState({ modalVisible: false }, () => {
        this.props.onValueChange && this.props.onValueChange(value)
      });
    } catch (error) {
      logAndReport('onValueChange picker exception', error, 'onValueChange picker');
    }
  }

  onShowModalPicker() {
    Keyboard.dismiss();
    this.setState({ modalVisible: true })
  }

  onClose() {
    this.setState({ modalVisible: false })
  }

  shouldComponentUpdate(nextProps, nextState) {
    const listProps = ['selectedValue'];
    const listState = ['modalVisible', 'name', 'data', 'disabled', 'errorText', 'selectedValue'];
    let check = checkPropsStateShouldUpdate(nextProps, nextState, listProps, listState, this.props, this.state);
    return check;
  }

  render() {
    let iconPicker;
    let content = null;
    if (this.props.editable) {
      let value = this.state.selectedValue.toString();
      // let tmp = value.indexOf('.');
      // if (tmp === -1 || (tmp !== -1 && value[tmp + 1])) {
      //   value = formatNumberNew(value);
      // }
      content = !this.state.disabled ? (
        <TextInput
          onFocus={() => this._onFocus(this.props.name)}
          onBlur={() => this.formatPrice(this.state.selectedValue)}
          testID={`${this.props.testID}_textInput`}
          keyboardType='numeric'
          underlineColorAndroid='transparent'
          maxLength={15}
          value={value}
          style={[styles.selectedText, { color: this.state.visible ? '#10a8b2' : 'black' }]}
          onChangeText={this.props.onChangeText} />
      ) : (
          <View style={{ width: '85%' }}>
            <Text testID={`${this.props.testID}_textInputDisable`} numberOfLines={1} style={[styles.selectedText4, { color: this.state.visible ? '#10a8b2' : 'black', opacity: 0.3, top: 10 * CommonStyle.fontRatio }]}>{value}</Text>
          </View>
        );
      iconPicker = !this.state.disabled ? (
        <TouchableOpacity testID={`${this.props.testID}-showModalButton`} onPress={this.onShowModalPicker.bind(this, this.state.name)} style={{ width: '15%', alignItems: 'flex-end' }}>
          <Ionicons name='md-arrow-dropup' style={styles.iconPickerUp} />
          <Ionicons name='md-arrow-dropdown' style={styles.iconPickerDown} />
        </TouchableOpacity>
      ) : (
          <View testID={`${this.props.testID}-showModalButton`} style={{ width: '15%', alignItems: 'flex-end' }}>
            <Ionicons name='md-arrow-dropup' style={[styles.iconPickerUp, { opacity: 0.3 }]} />
            <Ionicons name='md-arrow-dropdown' style={[styles.iconPickerDown, { opacity: 0.3 }]} />
          </View>
        );
    } else {
      content = !this.state.disabled ? (
        <TouchableOpacity onPress={this.onShowModalPicker.bind(this, this.state.name)}
          style={{ width: '85%', alignItems: 'flex-end' }}>
          <Text testID={`${this.props.testID}_text`} numberOfLines={1} style={[styles.selectedText4, { color: this.state.visible ? '#10a8b2' : 'black', top: 10 * CommonStyle.fontRatio }]}>{this.state.selectedValue}</Text>
        </TouchableOpacity>
      ) : (
          <TouchableOpacity style={{ width: '85%', alignItems: 'flex-end' }} disabled={true}>
            <Text testID={`${this.props.testID}_textDisable`} numberOfLines={1} style={[styles.selectedText4, { color: this.state.visible ? '#10a8b2' : 'black', opacity: 0.3, top: 10 * CommonStyle.fontRatio }]}>{this.state.selectedValue}</Text>
          </TouchableOpacity>
        )
      iconPicker = !this.state.disabled ? (
        <TouchableOpacity onPress={this.onShowModalPicker.bind(this, this.state.name)} style={{ width: '15%', alignItems: 'flex-end' }}>
          <Ionicons testID={`${this.props.testID}-showModalButton`} name='md-arrow-dropdown' style={[styles.iconPicker]}
            onPress={this.onShowModalPicker.bind(this, this.state.name)} />
        </TouchableOpacity>
      ) : (<View style={{ width: '15%', alignItems: 'flex-end' }}>
        <Ionicons testID={`${this.props.testID}-showModalButton`} name='md-arrow-dropdown' style={[styles.iconPicker, { opacity: 0.3 }]} />
      </View>)
    }
    return (
      <View onPress={() => Keyboard.dismiss()}
        testID={this.props.testID}
        style={{ width: '100%', justifyContent: 'center', borderBottomWidth: 1, marginBottom: 4, borderBottomColor: this.state.errorText && this.state.errorText !== '' ? '#df0000' : '#0000001e' }}>
        <Text testID={`${this.props.testID}-label`} style={[CommonStyle.textFloatingLabel, { marginBottom: 4 * CommonStyle.fontRatio }]}>{this.props.floatingLabel}</Text>
        <View style={styles.pickerContainer}>
          {content}
          {(this.props.name === 'Trailing Percent' || this.props.name === 'Trailing Amount') ? null : iconPicker}
        </View>
        <ModalPicker testID={`${this.props.testID}_modal`}
          listItem={this.state.data}
          onSelected={this.onValueChange.bind(this)}
          selectedItem={this.state.selectedValue}
          visible={this.state.modalVisible}
          title={`Select ${this.state.name}`}
          name={this.state.name}
          onClose={this.onClose.bind(this)} />
      </View>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    picker: state.picker
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(pickerActions, dispatch)
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(PickerCustom);
