import React, { Component } from 'react';
import { TextInput, View } from 'react-native';
import PropTypes from 'prop-types';
import XComponent from '../xComponent/xComponent'
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'

const DEFAULT_STYLE = {
    paddingVertical: 10,
    textAlign: 'center',
    fontSize: CommonStyle.fontSizeM
}

export default class HighlightInput extends XComponent {
    static propTypes = {
        styleFocus: PropTypes.object,
        styleBlur: PropTypes.object,
        onChangeText: PropTypes.func,
        onFocus: PropTypes.func,
        onBlur: PropTypes.func,
        value: PropTypes.string,
        editable: PropTypes.bool
    };

    //  #region REACT AND DEFAULT FUNCTION
    bindAllFunc() {
        this.onFocus = this.onFocus.bind(this)
        this.onBlur = this.onBlur.bind(this)
        this.onChangeText = this.onChangeText.bind(this)
    }

    init() {
        this.dic = {
            styleFocus: this.props.styleFocus || DEFAULT_STYLE,
            styleBlur: this.props.styleBlur || DEFAULT_STYLE,
            value: this.props.value || '',
            maxLength: this.props.maxLength || 999999999
        }

        this.state = {
            isFocus: false
        }
    }

    componentDidMount() {
        super.componentDidMount()
        this.props.setRefTextInput && this.props.setRefTextInput(this)
    }

    blurTextInput = this.blurTextInput.bind(this)
    blurTextInput() {
        this.refTextInput && this.refTextInput.blur()
    }

    componentWillReceiveProps(nextProps) {
        this.dic.value = nextProps.value || ''
    }
    //  #endregion

    //  #region BUSINESS
    //  #endregion

    //  #region EVENT ELEMENT
    onFocus() {
        this.state.isFocus = true;
        this.props.onFocus && this.props.onFocus()
        this.forceUpdate()
    }

    onBlur() {
        this.state.isFocus = false
        this.props.onBlur && this.props.onBlur()
        this.forceUpdate()
    }

    onChangeText(text) {
        this.dic.value = text
        this.props.onChangeText(text)
    }
    //  #endregion

    //  #region RENDER
    render() {
        return <View
            style={{
                justifyContent: 'center',
                alignItems: 'center'
            }}>
            <TextInput
                ref={ref => this.refTextInput = ref}
                underlineColorAndroid={'transparent'}
                style={[
                    this.state.isFocus
                        ? this.dic.styleFocus
                        : this.dic.styleBlur,
                    { width: '100%' }
                ]}
                onEndEditing={this.onBlur}
                onFocus={this.onFocus}
                onBlur={this.onBlur}
                onChangeText={this.onChangeText}
                keyboardType={'default'}
                value={this.dic.value}
                maxLength={this.dic.maxLength}
                editable={!!this.props.editable}
            />
        </View>
    }
    //  #endregion
};
