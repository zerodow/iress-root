import React, { Component } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableWithoutFeedback, TouchableOpacity, Dimensions, Animated, Platform } from 'react-native';
import { connect } from 'react-redux'
// Components
import Item from './Item'
import Ionicons from 'react-native-vector-icons/Ionicons'
import IconFeather from 'react-native-vector-icons/Feather'
// Common
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import NewTag from '~/constants/newsTag'
import { forEach, size, map } from 'lodash'
import * as FunctionUtil from '~/lib/base/functionUtil'
import I18n from '~/modules/language/'
import Dash from '~/component/dashed/dash'
import ExtraDimensions from 'react-native-extra-dimensions-android';
import * as setTestId from '~/constants/testId';
let { width, height } = Dimensions.get('window');
const heightSoftBar =
    Platform.OS === 'android'
        ? 64
        : 0; /** fix loi che course of sale khi co soft bar */
height = height - heightSoftBar
export class TagNews extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isCheckAll: false,
            top: height,
            listSelected: { ...props.value } || {},
            isDisableBtnDone: !!(size({ ...props.value }) <= 0),
            maxHeight: 500
        }
        this.translateYAni = new Animated.Value(height)
        this.opacityAni = new Animated.Value(0)
        this.heightHeader = 54
        this.layoutItems = {}
        this.count = 0
    }

    getMaxHeight = () => {
        let count = size(NewTag);
        if (this.props.isNews) {
            if (count > 9) {
                return 54 * 9.5
            } else {
                return 54 * count
            }
        } else if (count > 4) {
            return 54 * 4.5
        } else {
            return 54 * count
        }
    }
    onSelect = (tagNew) => {
        let listSelected = this.state.listSelected
        if (listSelected[tagNew]) {
            delete listSelected[tagNew];
        } else {
            listSelected[tagNew] = tagNew
        }
        const isDisable = this.checkDisable()
        this.setState({
            listSelected,
            isDisableBtnDone: isDisable
        })
    }
    onDone = () => {
        const listSelected = this.state.listSelected
        const isDisable = this.checkDisable()
        Animated.timing(this.opacityAni, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true
        }).start(() => {
            // Confirm la khong check tag nao cx cho luu
            this.props.onDone && this.props.onDone(listSelected)
        })
    }
    handleCheckAll = () => {
        let tmp = {}
        forEach(NewTag, (el, key) => {
            tmp[key] = key
        })
        this.setState({ listSelected: tmp, isDisableBtnDone: false })
    }
    handleClear = () => {
        this.setState({
            listSelected: {},
            isDisableBtnDone: true
        })
    }
    checkDisable = () => {
        if (size(this.state.listSelected) > 0) {
            return false
        } else {
            return true
        }
    }
    getButtonIconCheck = () => {
        if (size(this.state.listSelected) === 0) {
            return (
                <TouchableOpacity {...setTestId.testProp('Id_News_Modal_Tag_Checkbox_All', 'Label_News_Modal_Tag_Checkbox_All')} onPress={this.handleCheckAll}>
                    <Ionicons name={'md-square-outline'} color={CommonStyle.fontColor} size={24} />
                </TouchableOpacity>
            )
        } else {
            const isCheckAll = size(this.state.listSelected) === size(NewTag)
            if (isCheckAll) {
                return (
                    <TouchableOpacity {...setTestId.testProp('Id_News_Modal_Tag_Checkbox_All', 'Label_News_Modal_Tag_Checkbox_All')} onPress={this.handleClear}>
                        <IconFeather name={'minus-square'} style={{ marginLeft: -2 }} color={CommonStyle.fontColor} size={23} />
                    </TouchableOpacity>
                )
            } else {
                return (
                    <TouchableOpacity onPress={this.handleClear} {...setTestId.testProp('Id_News_Modal_Tag_Checkbox_All', 'Label_News_Modal_Tag_Checkbox_All')}>
                        <IconFeather name={'minus-square'} style={{ marginLeft: -2 }} color={CommonStyle.fontColor} size={23} />
                    </TouchableOpacity>
                )
            }
        }
    }
    getHeightPickerContent = (event) => {
        const { height: heightPickerContent } = event.nativeEvent.layout
        const { onCancel, onDone, onPressBackdrop, top, value, right, isNews, height: heightPicker } = this.props
        this.heightPickerContent = heightPickerContent
    }
    handleFadeInOut = () => {
        const { onCancel, onDone, onPressBackdrop, top, value, right, isNews, height: heightPicker } = this.props
        if (!this.heightPickerContent) return
        const heightPickerContent = this.maxHeight + this.heightHeader
        try {
            // New la dung trong new thi mac dinh do xuong duoi
            if (top + heightPickerContent < height || isNews) {
                // Should show up
                this.translateYAni.setValue(top)
                Animated.timing(this.opacityAni, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true
                }).start()
            } else {
                // Should Show Down
                const translateYValue = top - heightPicker - heightPickerContent
                if (translateYValue < 0) return 16
                this.translateYAni.setValue(translateYValue)
                Animated.timing(this.opacityAni, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true
                }).start()
            }
        } catch (error) {
            console.log(error)
        }
    }
    onPressBackdrop = () => {
        Animated.timing(this.opacityAni, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true
        }).start(() => {
            this.props.onPressBackdrop && this.props.onPressBackdrop()
        })
    }
    getMaxHeight2 = (maxRow = 9) => {
        const { onCancel, onDone, onPressBackdrop, top, value, right, isNews, height: heightPicker } = this.props
        let limitRow = this.props.isNews ? maxRow : 4
        let maxHeight = 0
        console.log('DCM max height list', this.layoutItems)
        let count = 0
        forEach(NewTag, (el, key) => {
            if (count < limitRow) {
                maxHeight += this.layoutItems[key]
                console.log('DCM max height +=', maxHeight, this.layoutItems[key], key)
            }
            if (count === limitRow) {
                maxHeight += this.layoutItems[key] / 2
                console.log('DCM max height +=', maxHeight, this.layoutItems[key] / 2, key)
            }
            count++
        })
        console.log('DCM max height', maxHeight)
        if (top + maxHeight + this.heightHeader > height && this.props.isNews) {
            maxHeight = this.getMaxHeight2(6)
        }
        this.maxHeight = maxHeight
        return maxHeight
    }
    handleSetLayoutItem = (event, index) => {
        const { height } = event.nativeEvent.layout
        if (height > 40) {
            this.layoutItems[index] = height
            if (size(this.layoutItems) === 11) {
                const maxHeight = this.getMaxHeight2()
                this.setState({
                    maxHeight
                }, () => {
                    setTimeout(() => {
                        this.handleFadeInOut()
                    }, 200);
                })
            }
        }
    }
    calHeightHeader = (e) => {
        this.heightHeader = e.nativeEvent.layout.height || 54
    }
    render() {
        const { onCancel, onDone, onPressBackdrop, top, value, right, isNews } = this.props
        const maxHeight = this.getMaxHeight()
        let count = 0;
        return (
            <TouchableWithoutFeedback onPress={this.onPressBackdrop} style={[Styles.pickerWrapper]} >
                <Animated.View style={[
                    Styles.pickerContentWrapper,
                    {
                        opacity: this.opacityAni
                    }
                ]}>
                    <Animated.View onLayout={this.getHeightPickerContent} style={[Styles.pickerContent, {
                        transform: [{
                            translateY: this.translateYAni
                        }],
                        opacity: this.opacityAni
                    }, { marginRight: this.props.right || 16 }]}>
                        <TouchableWithoutFeedback onLayout={this.calHeightHeader}>
                            <View style={[Styles.btnDoneWrapper]}>
                                {
                                    this.getButtonIconCheck()
                                }
                                <TouchableOpacity
                                    disabled={this.state.isDisableBtnDone}
                                    style={[Styles.btn]}
                                    onPress={this.onDone}
                                    {...setTestId.testProp('Id_News_Modal_Tag_Done_Button', 'Label_News_Modal_Tag_Done_Button')}
                                >
                                    <Text style={[Styles.textDone, { color: this.state.isDisableBtnDone ? CommonStyle.fontGray2 : CommonStyle.fontBlue1 }]}>{I18n.t('done')}</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableWithoutFeedback>
                        <View style={{ maxHeight: this.state.maxHeight }}>
                            <ScrollView
                                showsVerticalScrollIndicator={false}
                                {...setTestId.testProp('Id_Wrapper_Tag_news', 'Label_Wrapper_Tag_news')}
                            >
                                {/* {
                                NewTag.map((el, key) => {
                                    return (
                                        <Item key={key} selected={this.state.listSelected.includes(key)} isFirst={key === 0} onPress={() => {
                                            this.onSelect(key)
                                        }} keyTranslate={el.key} />
                                    )
                                })
                            } */}
                                {
                                    map(NewTag, (el, key) => {
                                        count = count + 1;
                                        return (
                                            <Item
                                                handleSetLayoutItem={(nativeEvent) => this.handleSetLayoutItem(nativeEvent, key)}
                                                key={key}
                                                tagKey={key}
                                                selected={!!this.state.listSelected[key]}
                                                isFirst={count === 1}
                                                onPress={() => {
                                                    this.onSelect(key)
                                                }}
                                                keyTranslate={el.DISPLAY_NAME}
                                            />
                                        )
                                    })
                                }
                            </ScrollView>
                        </View>
                    </Animated.View>
                </Animated.View>
            </TouchableWithoutFeedback >
        );
    }
}
const Styles = {}
function getNewestStyle() {
	const newStyle = StyleSheet.create({
    pickerWrapper: {
        // ...StyleSheet.absoluteFillObject,
        // backgroundColor: 'rgba(38, 43, 62, 0.87)',
        // zIndex: 2
    },
    pickerContentWrapper: {
        ...StyleSheet.absoluteFillObject,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        backgroundColor: CommonStyle.backgroundColorPopup
    },
    pickerContent: {
        width: 256,
        backgroundColor: CommonStyle.color.dusk,
        borderRadius: 8,
        zIndex: 4,
        alignSelf: 'flex-start'
    },
    btnDoneWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        paddingLeft: 16,
        alignItems: 'center'
    },
    btn: {
        paddingVertical: 8,
        paddingHorizontal: 16
    },
    textDone: {
        color: CommonStyle.fontBlue1,
        fontFamily: CommonStyle.fontPoppinsBold
    }
})
PureFunc.assignKeepRef(Styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

const mapStateToProps = (state) => {
    return {
        textFontSize: state.setting.textFontSize
    }
}

export default connect(mapStateToProps)(TagNews)
