import React, { PureComponent } from 'react';
// Component
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { connect } from 'react-redux'
import CommonStyle, { register } from '~/theme/theme_controller'
const { width } = Dimensions.get('window')
class HeaderContent extends PureComponent {
    render() {
        const { header } = this.props
        return (
            <Text style={[{
                fontFamily: CommonStyle.fontPoppinsBold,
                fontSize: CommonStyle.fontSizeXXL,
                color: CommonStyle.navigatorSpecial.navBarSubtitleColor,
                width: width * 0.6
            }, this.props.style]}>{(header && header.title) || 'Alert'}</Text>
        );
    }
}
export default connect(state => {
    return {
        textFontSize: state.setting.textFontSize
    }
})(HeaderContent)
