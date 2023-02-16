import React, { Component } from 'react';
import {
    TouchableOpacity, FlatList, Text, View, PixelRatio,
    Dimensions, ScrollView, Keyboard, InteractionManager, Platform, StatusBar,
    TouchableWithoutFeedback, Modal
} from 'react-native';
import { connect } from 'react-redux'
import { List, ListItem, Icon } from 'react-native-elements';
import DatePicker from '../../component/date_picker/date_picker'
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import config from '../../config';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { func, dataStorage } from '../../storage';
import * as Animatable from 'react-native-animatable';
import deviceModel from '../../constants/device_model';
import * as Util from '../../util';
import Flag from '../../component/flags/flag'
import I18n from '../../modules/language/';
import * as DateTime from '../../lib/base/dateTime';
import * as Controller from '../../memory/controller'
import { getTimezoneByLocation, isIphoneXorAbove } from '../../lib/base/functionUtil';
import { BusinessLog } from '../business_log/business_log';
import * as Business from '../../business';
import * as setTestId from '~/constants/testId';
const { height, width } = Dimensions.get('window');
export class ModalPicker extends Component {
    constructor(props) {
        super(props);
        this.listItem = this.props.listItem || [];
        this.keyboardDidShowListener = null;
        this.keyboardDidHideListener = null;
        this.deviceModel = dataStorage.deviceModel;
        this.state = {
            visible: this.props.visible,
            listData: [],
            scrollTo: -1,
            modalLimitStopPriceStatus: false,
            showDatePicker: false,
            fromDate: this.props.fromDate || new Date().getTime(),
            toDate: this.props.toDate || new Date().getTime(),
            selectedItem: props.selectedValue || ''
        };
        this.isFlag = false
        this.location = Controller.getLocation().location
        this.timezone = getTimezoneByLocation(this.location)
        this.handleDatePicked = this.handleDatePicked.bind(this)
        this.showDatePicker = this.showDatePicker.bind(this)
        this.mapData = this.mapData.bind(this);
        this.showHideModal = this.showHideModal.bind(this)
        this.renderItem = this.renderItem.bind(this)
        this.props.registerShowHideModal && this.props.registerShowHideModal(this.showHideModal)
    }

    componentDidMount() {
        this.mapData();
        // this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
        // this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
    }

    componentWillUnmount() {
        // this.keyboardDidShowListener.remove();
        // this.keyboardDidHideListener.remove();
    }

    _keyboardDidShow() {
        console.log('Keyboard Shown');
    }

    _keyboardDidHide() {
        // console.log('Keyboard Hidden');
    }

    showHideModal(isShow, successCallback) {
        this.setState({
            visible: isShow
        }, () => {
            setTimeout(() => {
                successCallback && successCallback()
            }, 100)
        })
    }

    mapData() {
        let listData = [];
        this.listItem.map((el, i) => {
            const value = el && el.value ? el.value : el;
            const label = el && el.label ? el.label : el;
            let obj = {};
            obj.value = (typeof value !== 'string') ? value : value.toString();
            obj.label = (typeof label !== 'string') ? label : label.toString();
            obj.onPress = this.selectItem.bind(this, value);
            listData.push(obj);
        });
        this.setState({ listData })
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.visible && (nextProps.visible !== this.state.visible)) {
            this.setState({ visible: nextProps.visible })
        }
        if (nextProps.selectedValue && nextProps.selectedValue !== this.state.selectedItem) {
            this.setState({ selectedItem: nextProps.selectedValue })
        }
    }
    selectItem(value) {
        this.setState({ selectedItem: value }, () => {
            this.props.onSelected(value);
        })
    }

    onClose() {
        this.setState({ scrollTo: -1 }, () => {
            this.props.onClose();
            Business.setStatusBarBackgroundColor({ backgroundColor: CommonStyle.statusBarBgColor })
        })
    }

    _keyExtractor(item, i) {
        return i.toString();
    };

    // Find selected index limit price
    findSelectedItem(data, selectedValue) {
        for (var key in data) {
            if (parseFloat(data[key]) === parseFloat(selectedValue)) {
                var index = key - 6;
                this.setState({ scrollTo: index, modalLimitStopPriceStatus: true })
            }
        }
    }
    checkHideChevron = this.checkHideChevron.bind(this)
    checkHideChevron(value) {
        if (value === this.state.selectedItem) {
            return true
        }
        return false;
    }
    componentDidUpdate() {
        if (this.state.scrollTo > -1) {
            setTimeout(() => {
                if (this.state.visible) {
                    this.flatlist && this.flatlist.scrollToIndex && this.flatlist.scrollToIndex({ index: this.state.scrollTo })
                }
            }, 1000)
        }
    }

    getFlagIcon() {

    }

    handleDatePicked(date, callback) {
        const type = this.type
        this.activeDuration = ''
        if (type === 'from') {
            if (this.checkGetReportAfterCompareFromTo(date, this.state.toDate)) {
                // this.fromDate = new Date(date)
                callback && callback(true)
                return this.setState({
                    fromDate: date
                })
            }
            return callback && callback(false)
        } else if (type === 'to') {
            if (this.checkGetReportAfterCompareFromTo(this.state.fromDate, date)) {
                // this.toDate = new Date(date)
                callback && callback(true)
                return this.setState({ toDate: date })
            }
            return callback && callback(false)
        }
    }

    checkGetReportAfterCompareFromTo(fromDate, toDate) {
        const fromDateStartDay = DateTime.getTimeStartDay(fromDate)
        const toDateStartDay = DateTime.getTimeStartDay(toDate)
        if (fromDateStartDay <= toDateStartDay) return true;
        return false
    }

    showDatePicker(type) {
        let dateRef = this.fromDatePickerRef
        this.type = 'from'
        if (type === 'to') {
            this.type = 'to'
            dateRef = this.toDatePickerRef
        }
        dateRef && dateRef.showDatePicker()
    }

    renderItem(item, index) {
        return (
            <View>
                <TouchableOpacity
                    style={{ paddingHorizontal: 16 }}
                    {...setTestId.testProp(`Id_Modal_picker_v2_${item ? item.label : '--'}`, `Label_Modal_picker_v2_${item ? item.label : '--'}`)}
                    onPress={() => this.setState({ scrollTo: -1 }, item.onPress)}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 52 }}>
                        <Text
                            {...setTestId.testProp(`Id_Modal_picker_v2_label`, `Label_Modal_picker_v2_label`)}
                            style={[{
                                flex: 8,
                                color: this.checkHideChevron(item.value) ? CommonStyle.fontBlue : CommonStyle.fontColor,
                                fontSize: CommonStyle.fontSizeS,
                                fontFamily: CommonStyle.fontPoppinsRegular
                            },
                            this.props.disableCapitalize ? {} : { textTransform: 'capitalize' }]}
                        >
                            {I18n.t(item.label || '')}
                        </Text>
                        {
                            this.checkHideChevron(item.value)
                                ? <Ionicons testID={`${item.value}`} {...setTestId.testProp(`Id_Modal_picker_v2_checkbox`, `Label_Modal_picker_v2_checkbox`)} size={24} name='md-checkmark' color={CommonStyle.fontBlue} />
                                : null
                        }
                    </View>
                    <View style={{ height: 1, backgroundColor: CommonStyle.fontWhite, opacity: 0.05 }}></View>
                </TouchableOpacity>
            </View>
        )
    }

    checkDate = () => {
        this.props.checkDate && this.props.checkDate(true)
    }
    onDismiss = () => {
        this.props.onClose && this.props.onClose()
    }

    render() {
        if (!this.state.visible) return <View></View>
        const position = this.props.position || {};
        // return (
        //     <Animatable.View
        //         pointerEvents={'box-none'}
        //         duration={500}
        //         ref={ref => this.refModal = ref}
        //         useNativeDriver
        //         animation={'fadeIn'}
        //         style={{
        //             zIndex: 9999,
        //             flex: 1,
        //             position: 'absolute',
        //             top: 0,
        //             bottom: 0,
        //             right: 0,
        //             left: 0,
        //             backgroundColor: CommonStyle.fontDefaultColorOpacity
        //             // opacity: this.dic.opacityWrapper,
        //             // transform: [{
        //             //     translateY: this.dic.translateWrapper
        //             // }]
        //         }}>
        //         <TouchableWithoutFeedback onPress={this.onDismiss}>
        //             <View style={{
        //                 // backgroundColor: CommonStyle.fontDefaultColorOpacity,
        //                 flex: 1
        //             }}>
        //             </View>
        //         </TouchableWithoutFeedback>
        //         <View style={[{
        //             backgroundColor: CommonStyle.backgroundNewSearchBar,
        //             width: 172,
        //             position: 'absolute',
        //             right: this.props.right ? this.props.right : width * 0.15,
        //             top: this.props.top ? this.props.top : 78,
        //             borderRadius: 8
        //         }, this.props.style]}>
        //             <FlatList
        //                 indicatorStyle={CommonStyle.scrollBarIndicatorStyle}
        //                 ref={(ref) => this.flatlist = ref}
        //                 data={this.state.listData}
        //                 renderItem={({ item, i }) => this.renderItem(item, i)}
        //                 keyExtractor={this._keyExtractor}
        //             />
        //         </View>

        //     </Animatable.View>
        // )
        return (
            <Modal
                // onShow={() => Business.setStatusBarBackgroundColor()}
                // onDismiss={() => Business.setStatusBarBackgroundColor({ backgroundColor: CommonStyle.fontColorBorderNew })}
                onRequestClose={() => {
                    console.log('Modal closed')
                }}
                testID={this.props.testID}
                animationType="fade"
                transparent={true}
                backdropColor={'white'}
                backdropOpacity={1}
                visible={this.props.visible}>

                <TouchableWithoutFeedback onPress={this.onDismiss}>
                    <View style={{
                        backgroundColor: CommonStyle.fontDefaultColorOpacity,
                        flex: 1
                    }}>
                    </View>
                </TouchableWithoutFeedback>
                <View style={[{
                    backgroundColor: CommonStyle.backgroundNewSearchBar,
                    width: 172,
                    position: 'absolute',
                    right: this.props.right ? this.props.right : width * 0.15,
                    top: this.props.top ? this.props.top : 78,
                    borderRadius: 8
                }, this.props.style]}>
                    <FlatList
                        indicatorStyle={CommonStyle.scrollBarIndicatorStyle}
                        ref={(ref) => this.flatlist = ref}
                        data={this.state.listData}
                        extraData={{
                            setting: {
                                textFontSize: this.props.textFontSize
                            }
                        }}
                        renderItem={({ item, i }) => this.renderItem(item, i)}
                        keyExtractor={this._keyExtractor}
                    />
                </View>

            </Modal >
        );
    }
}

export default connect(state => {
    return {
        textFontSize: state.setting.textFontSize
    }
})(ModalPicker)
