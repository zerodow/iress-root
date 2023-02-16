import React, { Component } from 'react';
import { TextInput } from 'react-native';
import PropTypes from 'prop-types';
import Enum from '../../enum';
import * as Util from '../../util';
import { formatNumber as FormatNumber, formatNumberNew2 as FormatNumberNew2 } from '../../lib/base/functionUtil';

const TYPE_VALID = Enum.TYPE_VALID_CUSTOM_INPUT;
const PRICE_DECIMAL = Enum.PRICE_DECIMAL

export default class CustomInput extends Component {
    constructor(props) {
        super(props);

        this.onChangeText = this.onChangeText.bind(this);
        this.changeValueInput = this.changeValueInput.bind(this);
        this.getDisplayValue = this.getDisplayValue.bind(this);
        this.onBlur = this.onBlur.bind(this);
        this.onFocus = this.onFocus.bind(this);

        this.value = this.props.value;
        this.style = this.props.style;
        this.objectCheckValid = this.props.format === TYPE_VALID.INTEGER
            ? { maxLenInt: 15 }
            : { maxLenInt: 15, maxLenFloat: PRICE_DECIMAL.PRICE };
    }

    changeValueInput(myInput, value) {
        return new Promise(resolve => {
            setTimeout(() => {
                myInput.setNativeProps({ text: value });
                return resolve();
            });
        });
    }

    componentDidMount() {
        this.changeValueInput(this.myInput, this.getDisplayValue(this.value, this.props.format));
    }

    onChangeText(val) {
        if (val && !Util.numberValidFloat(val, this.objectCheckValid)) {
            return this.changeValueInput(this.myInput, this.value);
        }
        this.changeValueInput(this.myInput, val)
            .then(() => {
                this.value = val;
                this.props.onChangeText && this.props.onChangeText(Util.getNumberFromString(val));
            });
    }

    onFocus() {
        this.changeValueInput(this.myInput, this.value);
    }

    getDisplayValue(value, format) {
        return format === TYPE_VALID.INTEGER
            ? FormatNumber(value)
            : FormatNumberNew2(value, PRICE_DECIMAL.PRICE);
    }

    onBlur() {
        this.changeValueInput(this.myInput, this.getDisplayValue(this.value, this.props.format));
    }

    shouldComponentUpdate(nextProps) {
        if (this.value !== nextProps.value ||
            this.props.editable !== nextProps.editable) {
            this.value = nextProps.value;

            const newVal = this.myInput.isFocused()
                ? this.value
                : this.getDisplayValue(this.value, this.props.format);
            this.changeValueInput(this.myInput, newVal);
        }
        return false;
    }

    render() {
        return (
            <TextInput
                keyboardType={this.props.keyboardType || 'numeric'}
                underlineColorAndroid={this.props.underlineColorAndroid || 'transparent'}
                maxLength={this.props.maxLength || Number.MAX_VALUE}
                placeholder={this.props.placeholder || '0'}
                autoCapitalize='none'
                placeholderTextColor={this.props.placeholderTextColor || 'black'}
                editable={this.props.editable || true}
                style={this.style || null}
                defaultValue={this.value}
                onChangeText={this.onChangeText}
                onFocus={this.onFocus}
                onBlur={this.onBlur}
                ref={ref => this.myInput = ref}
            />
        );
    }
};
