import React, { Component, PureComponent } from 'react'
import {
    View, Text, Animated, Dimensions, ScrollView, TouchableOpacity
} from 'react-native'
import TouchableOpacityOpt from '@component/touchableOpacityOpt';
import CommonStyle, { register } from '~/theme/theme_controller'
// Component
import XComponent from '@component/xComponent/xComponent'
import Ionicons from 'react-native-vector-icons/Ionicons';
const { width, height } = Dimensions.get('window')

export default class DropDown extends PureComponent {
    constructor(props) {
        super(props)
        this.init = this.init.bind(this)
        this.bindAllFunc = this.bindAllFunc.bind(this)
        this.init()
        this.bindAllFunc()
    }

    /*
    Props type
        1> data []
        2> defaultValue
        3> onSelect
        4> onCancel
        5> numberItem
        6> renderItem
        7> backdropStyle
        8> wrapperStyle
    */

    init() {
        const numberItem = this.props.numberItem
            ? this.props.numberItem > this.props.data.length
                ? this.props.data.length
                : this.props.numberItem
            : 4
        this.dic = {
            heightItem: 56,
            numberItem: numberItem,
            item: [],
            defaultItemStyle: {
                borderWidth: 1,
                borderColor: 'yellow'
            },
            duration: this.props.duration || 300,
            visible: false,
            iconWidthAnim: new Animated.Value(0),
            opacityBackdropAnim: new Animated.Value(0),
            opacityWrapperAnim: new Animated.Value(0)
        }

        this.state = {
            maxWidth: 0,
            selected: this.props.defaultValue || ''
        }

        this.dic.defaultItemIconStyle = {
            flex: 1,
            width: this.dic.iconWidthAnim,
            alignItems: 'flex-end',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: 'green'
        }
        this.dic.defaultItemWrapperStyle = {
            flex: 1,
            height: this.dic.heightItem,
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: 'red'
        }
        this.dic.translateYModalAnim = new Animated.Value(-height)
        this.dic.translateYBackdropAnim = new Animated.Value(-height)
        this.dic.wrapperStyle = {
            width: this.state.maxWidth === 0 ? 'auto' : this.state.maxWidth + 50,
            height: this.dic.heightItem * this.dic.numberItem,
            alignSelf: 'flex-end',
            transform: [{ translateY: this.dic.translateYModalAnim }],
            opacity: this.dic.opacityWrapperAnim,
            borderRadius: 8
        }
        this.dic.backdropStyle = {
            transform: [{ translateY: this.dic.translateYBackdropAnim }],
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            paddingRight: 16,
            opacity: this.dic.opacityBackdropAnim
        }
    }

    bindAllFunc() {
        this.showDropDown = this.showDropDown.bind(this)
        this.hideDropdown = this.hideDropdown.bind(this)
        this.onLayoutRow = this.onLayoutRow.bind(this)
        this.customChildren = this.customChildren.bind(this)
        this.snapBackdropToOutsideScreen = this.snapBackdropToOutsideScreen.bind(this)
        this.snapBackdropToInsideScreen = this.snapBackdropToInsideScreen.bind(this)
        this.snapModalToOutsideScreen = this.snapModalToOutsideScreen.bind(this)
        this.snapModalToInsideScreen = this.snapModalToInsideScreen.bind(this)
        this.renderList = this.renderList.bind(this)
        this.onSelect = this.onSelect.bind(this)
        this.renderItemContent = this.renderItemContent.bind(this)
        this.renderItemIcon = this.renderItemIcon.bind(this)
        this.updateMaxWidth = this.updateMaxWidth.bind(this)
        this.calculateModalPosition = this.calculateModalPosition.bind(this)
    }

    updateWrapperStyle(width) {
        this.dic.wrapperStyle.width = width
    }

    onSelect(item) {
        this.props.onSelect && this.props.onSelect(item)
    }

    snapBackdropToOutsideScreen() {
        this.dic.translateYBackdropAnim.setValue(-height)
    }

    snapBackdropToInsideScreen() {
        this.dic.translateYBackdropAnim.setValue(0)
    }

    snapModalToOutsideScreen() {
        this.dic.translateYModalAnim.setValue(-height)
    }

    snapModalToInsideScreen({ top, modalHeight }) {
        const dropDownPosition = this.calculateModalPosition({ top, modalHeight })
        this.dic.translateYModalAnim.setValue(dropDownPosition)
    }

    calculateModalPosition({ top, modalHeight }) {
        const heightDropdown = this.dic.heightItem * this.dic.numberItem
        const heightVisible = height - 88 // bottom bar
        if ((top + modalHeight + heightDropdown) > heightVisible) return top - heightDropdown
        return top + modalHeight
    }

    showDropDown({ top, modalHeight }) {
        console.log('DROPDOWN', this.dic.item)
        // Show backdrop and fade in
        this.snapBackdropToInsideScreen()
        this.snapModalToInsideScreen({ top, modalHeight })
        setTimeout(() => {
            Animated.parallel([
                Animated.timing(
                    this.dic.opacityWrapperAnim,
                    {
                        toValue: 1,
                        duration: this.dic.duration
                    }
                ),
                Animated.timing(
                    this.dic.opacityBackdropAnim,
                    {
                        toValue: 1,
                        duration: this.dic.duration
                    }
                )
            ]).start()
        }, 200)
    }

    hideDropdown() {
        Animated.parallel([
            Animated.timing(
                this.dic.opacityWrapperAnim,
                {
                    toValue: 0,
                    duration: this.dic.duration
                }
            ),
            Animated.timing(
                this.dic.opacityBackdropAnim,
                {
                    toValue: 0,
                    duration: this.dic.duration
                }
            )
        ]).start(() => {
            // Show backdrop and fade in
            this.snapBackdropToOutsideScreen()
            this.snapModalToOutsideScreen()
        })
    }

    componentWillReceiveProps(nextProps) {
        const { top, defaultValue } = nextProps
        console.log('DROPDOWN componentWillReceiveProps', top)
    }

    onLayoutRow(event, index) {
        const { x, y, width, height } = event.nativeEvent.layout
        this.dic.children[index] = {
            x,
            y,
            width,
            height
        }
        console.log('onLayoutRow', this.dic.children)
    }

    customChildren() {
        return React.Children.map(this.props.children, (child, index) => {
            console.log('getChildreded', child, index)
            return <View onLayout={(event) => this.onLayoutRow(event, index)}>
                {child}
            </View>
        })
    }

    updateMaxWidth() {
        let maxWidth = 0
        this.dic.item.map((item, index) => {
            const { width } = item
            if (width > maxWidth) {
                maxWidth = width
            }
        })
        if (maxWidth > this.state.maxWidth) {
            this.updateWrapperStyle(maxWidth + 48)
            this.setState({
                maxWidth
            })
            console.log('DROPDOWN updateMaxWidth', this.state.maxWidth)
        }
    }

    onLayoutText(event, index) {
        const { x, y, width, height } = event.nativeEvent.layout
        this.dic.item[index] = {
            x,
            y,
            width,
            height
        }
        this.updateMaxWidth(this.dic.item)
    }

    renderItemContent(item, index) {
        return <Text
            style={[
                this.dic.defaultItemStyle,
                this.props.itemStyle
            ]}
            onLayout={event => this.onLayoutText(event, index)}>
            {item}
        </Text>
    }

    renderItemIcon(item, index) {
        return this.state.selected === item
            ? <View style={[this.dic.defaultItemIconStyle, this.props.itemIconStyle]}>
                <Ionicons size={18} name='md-checkmark' color={CommonStyle.fontBlue} />
            </View>
            : null
    }

    renderList() {
        const { data } = this.props
        return <ScrollView
            showsVerticalScrollIndicator={false}>
            {
                data.map((item, index) => {
                    return <TouchableOpacity
                        key={item.key}
                        onPress={() => this.onSelect(item)}
                        style={[this.dic.defaultItemWrapperStyle, this.props.itemWrapperStyle]}>
                        {this.renderItemContent(item, index)}
                        {this.renderItemIcon(item, index)}
                    </TouchableOpacity>
                })
            }
        </ScrollView>
    }

    renderCustomList() {
        return <View />
    }

    render() {
        // const customChildren = this.customChildren();
        return <Animated.View
            style={[this.dic.backdropStyle, this.props.backdropStyle]}>
            <Animated.View
                style={[this.dic.wrapperStyle, this.props.wrapperStyle]}>
                {
                    this.props.renderItem
                        ? this.renderCustomList()
                        : this.renderList()
                }
            </Animated.View>
        </Animated.View>
    }
}
