import React, { Component } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableWithoutFeedback, Animated, Dimensions, Platform } from 'react-native';
import { connect } from 'react-redux'
// Components
import Item from './Item'
// Redux
import { updatePicker } from '../../redux/actions'
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import ExtraDimensions from 'react-native-extra-dimensions-android';

import * as Controller from '~/memory/controller'
let { width, height: heightScreen } = Dimensions.get('window')
const heightSoftBar =
    Platform.OS === 'android'
        ? 64
        : 0; /** fix loi che course of sale khi co soft bar */
heightScreen = heightScreen - heightSoftBar
export class Picker extends Component {
    constructor(props) {
        super(props)
        this.translateYAni = new Animated.Value(heightScreen)
        this.opacityAni = new Animated.Value(0)
        this.statusPressBackdrop = false
        this.isDisable = false
        Controller.setStatusModalCurrent(true)// Gan co de khi dismiss modal co the bat duoc trong willAppear va didAppear cua parrentView
    }
    getMaxHeight = () => {
        const {
            listItem,
            onCancel,
            onSelect,
            onPressBackdrop,
            top,
            value,
            numberRowVisible = 4.5
        } = this.props
        if (Array.isArray(listItem) && listItem.length > 4) {
            return 56 * numberRowVisible
        } else {
            return 56 * listItem.length
        }
    }
    onLayoutPickerContent = (event) => {
        const { height: heightPickerContent } = event.nativeEvent.layout
        const { onCancel, onDone, onPressBackdrop, top, value, right, isNews, height: heightPicker } = this.props
        const maxHeight = this.getMaxHeight()
        console.log('show ', heightPickerContent)
        if (top + heightPickerContent < heightScreen) {
            // Should show up
            this.translateYAni.setValue(top)
            Animated.timing(this.opacityAni, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true
            }).start()
        } else {
            // Should Show Down
            const translateY = top - heightPicker - heightPickerContent
            this.translateYAni.setValue(translateY)
            Animated.timing(this.opacityAni, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true
            }).start()
        }
    }
    handleSelect = (el) => {
        const { listItem, onCancel, onSelect, onPressBackdrop, top, value } = this.props
        if (this.isDisable) {
            return
        }
        this.isDisable = true
        Animated.timing(this.opacityAni, {
            toValue: 0, duration: 500, useNativeDriver: true
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
                    toValue: 0, duration: 500, useNativeDriver: true
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
            listItemDisable,
            onCancel,
            onSelect,
            onPressBackdrop,
            top,
            value,
            checkSelected,
            modalStyle,
            rowStyle,
            pickerContentWrapper
        } = this.props
        const maxHeight = this.getMaxHeight()
        return (
            <TouchableWithoutFeedback onPress={this.onPressBackdrop} style={[Styles.pickerWrapper]} >
                <Animated.View style={[Styles.pickerContentWrapper, {
                    opacity: this.opacityAni
                }, pickerContentWrapper]}>
                    <Animated.View onLayout={this.onLayoutPickerContent}
                        style={[Styles.pickerContent, {
                            maxHeight: maxHeight,
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
                                            isDisable={listItemDisable && listItemDisable.includes(key)}
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

const Styles = {}
function getNewestStyle() {
	const newStyle = StyleSheet.create({
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
        backgroundColor: CommonStyle.color.dusk_tabbar,
        borderRadius: 8,
        paddingHorizontal: 16
    }
})
PureFunc.assignKeepRef(Styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)
export default connect(mapStateToProps)(Picker)
