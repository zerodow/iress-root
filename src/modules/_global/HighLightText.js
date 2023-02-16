import React, { Component } from 'react';
import { Text } from 'react-native';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import { checkPropsStateShouldUpdate, formatNumberNew2 } from '../../lib/base/functionUtil';
import { Text as TextLoad, View as ViewLoad } from '~/component/loading_component'

export default class HighLightText extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    const listProps = ['value', 'base', 'isLoading'];
    const listState = [];
    let check = checkPropsStateShouldUpdate(nextProps, nextState, listProps, listState, this.props, this.state);
    return check;
  }

  render() {
    let symbol = null;
    const { customColorHightlightUp } = this.props;
    if (this.props.addSymbol) {
      symbol = '+';
    } else {
      symbol = '';
    }
    if (this.props.percent) {
      percent = '%';
    } else {
      percent = '';
    }
    if (this.props.value === null || this.props.value === undefined || this.props.value === '--') {
      return (<TextLoad {...this.props} containerStyle={this.props.containerStyle} isLoading={this.props.isLoading} testID={this.props.testID} style={[{ color: CommonStyle.fontColor, opacity: CommonStyle.opacity1 }, this.props.style]}>--</TextLoad>)
    }
    if (this.props.value === '-- (--)') {
      return (<TextLoad {...this.props} containerStyle={this.props.containerStyle} isLoading={this.props.isLoading} testID={this.props.testID} style={[{ color: CommonStyle.fontColor, opacity: CommonStyle.opacity1 }, this.props.style]}>-- (--)</TextLoad>)
    }
    if (parseFloat(this.props.base) < 0) {
      return (<TextLoad {...this.props} containerStyle={this.props.containerStyle} isLoading={this.props.isLoading} testID={this.props.testID} style={[{ color: CommonStyle.hightLightColorDown, textAlign: 'right' }, this.props.style]}>{this.props.value}{percent}</TextLoad>);
    } else if (parseFloat(this.props.base) > 0) {
      return (<TextLoad {...this.props} containerStyle={this.props.containerStyle} isLoading={this.props.isLoading} testID={this.props.testID} style={[{ color: customColorHightlightUp || CommonStyle.hightLightColorUp }, this.props.style]}>{symbol}{`${this.props.value}`}{percent}</TextLoad>);
    } else {
      return (<TextLoad {...this.props} containerStyle={this.props.containerStyle} isLoading={this.props.isLoading} testID={this.props.testID} style={[{ color: CommonStyle.fontColor, opacity: CommonStyle.opacity1 }, this.props.style]}>{this.props.value}{percent}</TextLoad>);
    }
  }
}
