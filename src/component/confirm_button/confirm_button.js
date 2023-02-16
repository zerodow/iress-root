import React, { Component } from 'react';
import { Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import * as Util from '../../util';
import { dataStorage } from '../../storage';
import I18n from '../../../src/modules/language/'

export default class ConfirmButton extends Component {
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
                {
                    this.activity
                        ? <ActivityIndicator style={{ width: 30, height: 30 }} color={CommonStyle.fontWhite} />
                        : null
                }
                <Text style={{ fontFamily: CommonStyle.fontPoppinsRegular, fontSize: CommonStyle.fontSizeS, color: CommonStyle.fontDark, paddingVertical: 11, textAlign: 'center' }}>{this.text}</Text>
            </TouchableOpacity>
        );
    }
    //  #endregion

    processProps(props) {
        this.onPress = props.onPress || (() => { });
        this.disabled = props.disabled;
        this.style = props.style;
        this.text = props.text || I18n.t('confirmUpper');
        this.activity = props.activity;
    }

    getStyle(customStyle, disabled) {
        const defaultStyle = {
            width: '48%',
            alignItems: 'center',
            flexDirection: 'row',
            justifyContent: 'center',
            borderRadius: 100
        };
        return disabled
            ? {
                ...defaultStyle,
                backgroundColor: '#808080',
                ...customStyle
            }
            : {
                ...defaultStyle,
                backgroundColor: CommonStyle.fontColorButtonSwitch,
                ...customStyle
            };
    };

    getIcon() {
        return Util.getValByPlatform('ios-checkmark', 'md-checkmark');
    }
}
