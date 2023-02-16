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
        this.onSelectionChange = this.onSelectionChange.bind(this);
        this.getDisplayValue = this.getDisplayValue.bind(this);
        this.onBlur = this.onBlur.bind(this);
        this.onFocus = this.onFocus.bind(this);

        this.value = this.props.value || '';
        this.style = this.props.style;
        this.objectCheckValid = this.props.format === TYPE_VALID.INTEGER
            ? { maxLenInt: 13 }
            : { maxLenInt: 13, maxLenFloat: PRICE_DECIMAL.PRICE };
        this.selection = {
            start: this.value.length,
            end: this.value.length
        };
        this.minus = 0;
    }

    changeValueInput(myInput, value) {
        return new Promise(resolve => {
            setTimeout(() => {
                myInput.setNativeProps({ text: ' ' });
                setTimeout(() => {
                    myInput.setNativeProps({ text: value + '' });
                    setTimeout(() => {
                        myInput.setNativeProps({
                            selection: {
                                start: this.selection.start + this.minus,
                                end: this.selection.end + this.minus
                            }
                        });
                        return resolve();
                    });
                });
            });
        });
    }

    componentDidMount() {
        this.changeValueInput(this.myInput, this.getDisplayValue(this.value, this.props.format));
    }

    onChangeText(val) {
        const isAdd = val.length - this.value.length > 0;
        this.minus = 0;

        if (val && !Util.numberValidFloat(val, this.objectCheckValid)) {
            this.minus = isAdd ? -1 : 1;
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

    onSelectionChange(event) {
        this.selection = event.nativeEvent.selection;
    }

    onBlur() {
        this.changeValueInput(this.myInput, this.getDisplayValue(this.value, this.props.format));
    }

    shouldComponentUpdate(nextProps) {
        if (this.value === '' && nextProps.value + '' === '0') return false;

        if (this.value !== nextProps.value ||
            this.props.editable !== nextProps.editable) {
            this.value = nextProps.value;

            const newVal = this.myInput.isFocused()
                ? this.value
                : this.getDisplayValue(this.value, this.props.format);
            this.selection = {
                start: newVal.length,
                end: newVal.length
            };
            this.minus = 0;
            this.changeValueInput(this.myInput, newVal);
        }
        return false;
    }

    render() {
        return (
            <TextInput
                keyboardType={this.props.keyboardType || 'numeric'}
                underlineColorAndroid={this.props.underlineColorAndroid || 'transparent'}
                maxLength={this.props.maxLength || 17}
                autoCapitalize='none'
                placeholder={this.props.placeholder || '0'}
                placeholderTextColor={this.props.placeholderTextColor || 'black'}
                editable={this.props.editable || true}
                style={this.style || null}
                defaultValue={this.value}
                onChangeText={this.onChangeText}
                onFocus={this.onFocus}
                onSelectionChange={this.onSelectionChange}
                onBlur={this.onBlur}
                ref={ref => this.myInput = ref}
            />
        );
    }
};
