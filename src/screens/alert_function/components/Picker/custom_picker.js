import React, { Component } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableWithoutFeedback, Dimensions, Platform, Animated } from 'react-native';
// import Animated, { Easing } from 'react-native-reanimated'
import { connect } from 'react-redux'
// Components
import Item from './Item'
// Redux
import { updatePicker } from '../../redux/actions'
import CommonStyle, { register } from '~/theme/theme_controller'
import ExtraDimensions from 'react-native-extra-dimensions-android';
let { width, height: heightScreen } = Dimensions.get('window')
const heightItem = 56
const defaultNumberRowVisible = 4.5
const defaultNumberRowVisibleAlwaysDown = 6.5
const heightSoftBar =
    Platform.OS === 'android'
        ? 64
        : 0; /** fix loi che course of sale khi co soft bar */
heightScreen = heightScreen - heightSoftBar
export class ReanimatedPicker extends Component {
    constructor(props) {
        super(props)
        this.translateYAni = new Animated.Value(heightScreen)
        this.opacityAni = new Animated.Value(0)
        this.heightModal = new Animated.Value(props.numberRowVisible * heightItem)
        this.statusPressBackdrop = false
        this.isDisable = false
        this.isTop = false
    }
    getMaxHeight = () => {
        const {
            listItem,
            numberRowVisible = 4.5
        } = this.props
        let maxHeight
        if (Array.isArray(listItem) && listItem.length > 4) {
            maxHeight = heightItem * numberRowVisible
        } else {
            maxHeight = heightItem * listItem.length
        }
        this.heightModal.setValue(maxHeight)
        return maxHeight
    }
    onLayoutPickerContent = (event) => {
        const { height: heightPickerContent } = event.nativeEvent.layout
        const {
            top,
            height: heightPicker,
            alwaysDown
        } = this.props
        if (top + heightPickerContent < heightScreen) {
            if (this.isTop) return;
            // Should Show Down
            this.translateYAni.setValue(top)
            Animated.timing(this.opacityAni, {
                toValue: 1,
                duration: 500
                // useNativeDriver: true
                // easing: Easing.linear
            }).start()
        } else {
            // Should show up
            const translateY = top - heightPicker - heightPickerContent
            if (alwaysDown) {
                // Modal luôn hiển thị dưới popup
                const numberRowVisibleAlwaysDown = this.props.numberRowVisibleAlwaysDown || defaultNumberRowVisibleAlwaysDown
                this.heightModal.setValue(heightItem * numberRowVisibleAlwaysDown)
                this.translateYAni.setValue(top)
                this.isTop = true
            } else {
                // Dịch Modal lên trên popup
                this.translateYAni.setValue(translateY)
            }
            Animated.timing(this.opacityAni, {
                toValue: 1,
                duration: 500
                // useNativeDriver: true
                // easing: Easing.linear
            }).start()
        }
    }
    handleSelect = (el) => {
        const { onSelect } = this.props
        if (this.isDisable) {
            return
        }
        this.isDisable = true
        Animated.timing(this.opacityAni, {
            toValue: 0,
            duration: 500
            // useNativeDriver: true
            // easing: Easing.linear
        }).start(() => {
            onSelect(el)
        })
    }
    onPressBackdrop = () => {
        if (this.isDisable) {
            return
        }
        this.isDisable = true
        this.timeOutOnPress && clearTimeout(this.timeOutOnPress)
        this.timeOutOnPress = setTimeout(() => {
            if (!this.statusPressBackdrop) {
                this.statusPressBackdrop = true
                Animated.timing(this.opacityAni, {
                    toValue: 0,
                    duration: 500
                    // easing: Easing.linear
                    // useNativeDriver: true
                }).start(() => {
                    this.props.onPressBackdrop && this.props.onPressBackdrop()
                })
            }
        }, 200);
    }
    isSelected = (element) => {
        const { listItem, onCancel, onSelect, onPressBackdrop, top, value, checkSelected } = this.props
        if (checkSelected) {
            return checkSelected(element, value)
        } else {
            return element === value
        }
    }

    render() {
        const {
            isFlag,
            listItem,
            modalStyle,
            rowStyle,
            pickerContentWrapper
        } = this.props
        return (
            <TouchableWithoutFeedback onPress={this.onPressBackdrop} style={[Styles.pickerWrapper]} >
                <Animated.View style={[Styles.pickerContentWrapper, {
                    opacity: this.opacityAni
                }, pickerContentWrapper]}>
                    <Animated.View onLayout={this.onLayoutPickerContent}
                        style={[Styles.pickerContent, {
                            height: this.heightModal,
                            transform: [{
                                translateY: this.translateYAni
                            }],
                            opacity: this.opacityAni,
                            marginRight: 16
                        }, modalStyle]}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {
                                listItem.map((el, key) => {
                                    const selected = this.isSelected(el)
                                    if (this.props.renderItem) {
                                        return this.props.renderItem({ key, selected, el, onPress: () => this.handleSelect(el), rowStyle })
                                    }
                                    return (
                                        <Item
                                            isFlag={isFlag}
                                            key={key}
                                            isFirst={key === 0}
                                            el={el}
                                            selected={selected}
                                            rowStyle={rowStyle}
                                            onPress={() => {
                                                // onSelect && onSelect(el)
                                                this.handleSelect(el)
                                            }} keyTranslate={el.key} />
                                    )
                                })
                            }
                        </ScrollView>
                    </Animated.View>
                </Animated.View>
            </TouchableWithoutFeedback>
        );
    }
}
const mapStateToProps = (state) => {
    return {
        textFontSize: state.setting.textFontSize
    }
}

const Styles = StyleSheet.create({
    pickerWrapper: {
        // ...StyleSheet.absoluteFillObject,
        // backgroundColor: 'red',
        // zIndex: 99
    },
    pickerContentWrapper: {
        ...StyleSheet.absoluteFillObject,
        paddingHorizontal: 16,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        backgroundColor: CommonStyle.backgroundColorPopup
    },
    pickerContent: {
        backgroundColor: CommonStyle.color.dusk,
        borderRadius: 8,
        paddingHorizontal: 16
    }
})
export default connect(mapStateToProps)(ReanimatedPicker)
