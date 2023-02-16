import React, { Component } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import * as Util from '../../util';
import { dataStorage } from '../../storage';
import I18n from '../../../src/modules/language/'

export default class CancelButton extends Component {
    constructor(props) {
        super(props);
        this.processProps(props);
    }

    //  #region REACT FUNCTION
    componentWillReceiveProps(nextProps) {
        this.processProps(nextProps);
    }

    render() {
        return (
            <TouchableOpacity disabled={this.disabled}
                style={this.getStyle(this.style, this.disabled)}
                onPress={this.onPress}>
                <Text style={{ fontFamily: CommonStyle.fontPoppinsRegular, fontSize: CommonStyle.fontSizeS, color: this.disabled ? CommonStyle.fontDark : CommonStyle.fontColorButtonSwitch, paddingVertical: 11, textAlign: 'center' }}>{this.text}</Text>
            </TouchableOpacity>
        );
    }
    //  #endregion

    processProps(props) {
        this.onPress = props.onPress || (() => { });
        this.disabled = props.disabled;
        this.style = props.style;
        this.text = props.text || I18n.t('cancelUpper');
    }

    getStyle(customStyle, disabled) {
        const defaultStyle = {
            width: '48%',
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            borderRadius: 100,
            borderWidth: 1,
            borderColor: CommonStyle.fontColorButtonSwitch,
            backgroundColor: CommonStyle.color.dark
        };
        return disabled
            ? {
                ...defaultStyle,
                backgroundColor: '#808080',
                borderColor: '#808080',
                ...customStyle
            }
            : {
                ...defaultStyle,
                ...customStyle
            };
    };

    getIcon() {
        return Util.getValByPlatform('ios-close', 'md-close');
    }
}
