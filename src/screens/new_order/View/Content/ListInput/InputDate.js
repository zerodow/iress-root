import React, { useRef, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types'
import { Text, View, TouchableOpacity, Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DatePicker from '~/component/date_picker/date_picker.3.js'
import { Navigation } from 'react-native-navigation';
import moment from 'moment'
import DateTimePicker from 'react-native-modal-datetime-picker';
import { getTimeStampServer, getTimeByLocation } from '~/screens/new_order/Controller/InputController.js'
import { changeDuration, changeDatePeriod } from '~/screens/new_order/Redux/actions.js'
import CommonStyle, { register } from '~/theme/theme_controller'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { getExpiryTimeUTC, getExpriryTimeLocalDate } from '~/screens/new_order/Controller/SwitchController.js'

import Enum from '~/enum'
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
const { DURATION_CODE } = Enum
const Icon = () => <CommonStyle.icons.cheDown style={{ textAlign: 'center', alignSelf: 'center' }} name={'md-arrow-dropdown'} color={CommonStyle.fontColor} size={14} />;
const useShowModal = ({ setValue, selectedValue, layoutInput, data, refTextInput, styleValue }) => useCallback(() => {
    return new Promise((resolve) => {
        refTextInput.current &&
            refTextInput.current.measure && refTextInput.current.measure((x, y, width, height, pageX, pageY) => {
                layoutInput.current.y = pageY;
                layoutInput.current.x = pageX;
                layoutInput.current.width = width;
                Navigation.showModal({
                    screen: 'equix.SelectionModal',
                    animated: false,
                    animationType: 'none',
                    navigatorStyle: {
                        ...CommonStyle.navigatorModalSpecialNoHeader,
                        modalPresentationStyle: 'overCurrentContext'
                    },
                    passProps: {
                        data,
                        layoutInput,
                        selectedValue,
                        onClose: () => {
                            Navigation.dismissModal({
                                animationType: 'none'
                            })
                        },
                        onSelected: setValue,
                        styleValue
                    }
                })
            });
    })
}, [data])
class DatePickerCustom extends DatePicker {
    _onConfirm(date) {
        this.props.handleDatePicked && this.props.handleDatePicked(new Date(date).getTime(), isUpdate => {
            this.setState({
                isVisible: false,
                date
            })
        })
    }
    componentWillReceiveProps(nextProps) {
    }
    render() {
        return (
            <TouchableOpacity onPress={this.showDatePicker} style={[
                {
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center'
                }, this.props.styleWrapper
            ]}>
                {
                    this.props.renderIconCalendar ? this.props.renderIconCalendar() : <Ionicons
                        color={CommonStyle.colorProduct}
                        size={20}
                        name={'ios-calendar'}
                    />
                }
                <Text
                    style={[this.dic.defaultTextStyle, this.props.textStyle || {}]}>{this.renderDateTime()}</Text>
                <View>
                    <DateTimePicker
                        locale={this.dic.timeLocale}
                        minimumDate={this.props.minimumDate}
                        maximumDate={this.props.maximumDate}
                        date={new Date(this.state.date)}
                        isVisible={this.state.isVisible}
                        onConfirm={this._onConfirm}
                        onCancel={this._onCancel}
                        datePickerModeAndroid={Platform.OS === 'android' ? 'calendar' : 'spinner'}
                        titleIOS={this.dic.titleIOS}
                        confirmTextIOS={this.dic.confirmTextIOS}
                        cancelTextIOS={this.dic.cancelTextIOS}
                    />
                </View>
            </TouchableOpacity>
        )
    }
}
const InputDate = ({
    title,
    onCbSelect,
    data,
    styleValue,
    layout
}) => {
    let layoutInput = useRef({});
    const refTextInput = useRef({});

    const date = useSelector(state => state.newOrder.expiryTime, shallowEqual)
    const dispatch = useDispatch()
    const changeDate = useCallback((date) => {
        dispatch(changeDatePeriod(date))
    }, [])

    const { minimumDate } = useMemo(() => {
        return {
            minimumDate: getTimeByLocation()
        }
    }, [])
    const setValue = useCallback((value) => {
        dispatch(changeDuration(value))
    }, [])
    const onShowModal = useShowModal({
        setValue,
        layoutInput,
        data,
        refTextInput,
        selectedValue: {
            key: 'GTD',
            label: 'Good Till Date'
        },
        styleValue
    })
    const onConfirmDate = useCallback((date, callback) => {
        callback && callback(false);
        changeDate && changeDate(getExpriryTimeLocalDate({ expiryTime: date }))
    })
    const renderIconCalendar = useCallback(() => {
        return <MaterialCommunityIcons name='calendar-month' size={18} color={CommonStyle.fontNearLight6} />
    }, [])
    return (
        <View
            style={[
                {
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingBottom: 8
                },
                layout === Enum.ORDER_LAYOUT.BASIC ? CommonStyle.layoutRowWrapperBasic : CommonStyle.layoutRowWrapperAdvance
            ]}>
            <Text style={[CommonStyle.titleInput, layout === Enum.ORDER_LAYOUT.BASIC ? CommonStyle.layoutChildBasic : CommonStyle.layoutChildAdvance]}>{title}</Text>
            <View
                collapsable={false}
                ref={refTextInput}
                style={[
                    {
                        borderRadius: 8,
                        borderWidth: 1,
                        paddingVertical: 5,
                        paddingHorizontal: 8,
                        borderColor: CommonStyle.fontBorder,
                        backgroundColor: CommonStyle.backgroundColor,
                        flexDirection: 'row'
                    },
                    layout === Enum.ORDER_LAYOUT.BASIC ? CommonStyle.layoutChildBasic : CommonStyle.layoutChildAdvance
                ]}
            >
                <DatePickerCustom
                    styleWrapper={{
                        flex: 1
                    }}
                    renderIconCalendar={renderIconCalendar}
                    textStyle={{
                        fontSize: CommonStyle.fontSizeS,
                        fontFamily: CommonStyle.fontPoppinsRegular,
                        color: CommonStyle.fontColor
                    }}
                    handleDatePicked={onConfirmDate}
                    date={date}
                    minimumDate={new Date(minimumDate)}
                />
                <TouchableOpacity hitSlop={{ top: 16, left: 16, bottom: 16, right: 16 }} style={{ justifyContent: 'center' }} onPress={onShowModal}>
                    <Icon onPress={onShowModal} />
                </TouchableOpacity>
            </View>
        </View >
    )
};
InputDate.propTypes = {
    title: PropTypes.string,
    changeDatePeriod: PropTypes.func,
    onCbSelect: PropTypes.func,
    date: PropTypes.object,
    minimumDate: PropTypes.object,
    data: PropTypes.array.isRequired
}
InputDate.defaultProps = {
    title: 'Default Label',
    changeDatePeriod: function () { },
    onCbSelect: function () { },
    date: new Date(),
    minimumDate: new Date(),
    data: []
};
export default InputDate;
