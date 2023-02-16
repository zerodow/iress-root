import React from 'react'
import {
    View, Text, TouchableOpacity, ScrollView, TouchableWithoutFeedback, Animated, Easing
} from 'react-native'
// Style
import CommonStyle, { register } from '~/theme/theme_controller'
// Component
import XComponent from './xComponent/xComponent'
import I18n from '../modules/language/'

export default class PickerBottom extends XComponent {
    init() {
        this.dic = {
            translateYAnim: new Animated.Value(400),
            numberItem: this.props.numberItem || 4,
            heightItem: 56,
            defaultBackdropColor: this.props.backdropColor || 'rgba(0, 0, 0, 0.3)',
            defaultTitleWrapperStyle: {
                backgroundColor: '#fff',
                height: 45,
                justifyContent: 'center',
                alignItems: 'center'
            },
            defaultTitleStyle: {
                fontFamily: 'HelveticaNeue-Bold',
                fontSize: CommonStyle.font13,
                color: '#c5cbce',
                fontWeight: '700'
            },
            defaultBtnCancelWrapperStyle: {
                margin: 10,
                backgroundColor: '#fff',
                height: 56,
                borderRadius: 13,
                justifyContent: 'center',
                alignItems: 'center'
            },
            defaultBtnCancelStyle: {
                color: '#007aff',
                fontFamily: 'HelveticaNeue-Bold',
                fontSize: CommonStyle.fontSizeXL,
                fontWeight: '700'
            }
        }
        this.dic.scrollViewHeight = this.dic.numberItem * this.dic.heightItem
        this.dic.defaultListWrapperStyle = {
            height: this.dic.scrollViewHeight
        }
        this.dic.defaultItemWrapperStyle = {
            backgroundColor: '#fff',
            justifyContent: 'center',
            alignItems: 'center',
            height: this.dic.heightItem,
            borderTopWidth: 1,
            borderTopColor: CommonStyle.colorTopBorder
        }
        this.dic.defaultItemStyle = {
            color: '#007aff',
            fontFamily: 'HelveticaNeue',
            fontSize: CommonStyle.fontSizeXL
        }
        this.state = {}
    }

    componentDidMount() {
        super.componentDidMount()
        this.show()
    }

    show(cb) {
        Animated.timing(
            this.dic.translateYAnim,
            {
                toValue: 0,
                duration: 200,
                easing: Easing.quad
            }
        ).start(cb)
    }

    hide(cb) {
        Animated.timing(
            this.dic.translateYAnim,
            {
                toValue: 400,
                duration: 200
            }
        ).start(cb)
    }

    // number item
    // title - text, style
    // cancel - text, style
    // listItem - list, style each item
    // backdropColor
    // Function - onCancel, onSelected, onPressBackdrop

    onCancel() {
        this.hide(this.props.onCancel)
    }

    onSelect(item) {
        this.props.onSelect && this.props.onSelect(item)
    }

    onPressBackdrop() {
        this.hide(this.props.onPressBackdrop)
    }

    renderTitle() {
        const { defaultTitleWrapperStyle, defaultTitleStyle } = this.dic
        return <View style={[defaultTitleWrapperStyle]}>
            <Text style={[defaultTitleStyle]}>{this.props.title}</Text>
        </View>
    }

    renderList() {
        const { listItem } = this.props
        const { defaultListWrapperStyle, defaultItemWrapperStyle, defaultItemStyle } = this.dic
        return < View style={[defaultListWrapperStyle]}>
            <ScrollView
                showsVerticalScrollIndicator={false}>
                {listItem.map((item, index) => {
                    return <TouchableOpacity
                        key={item.key}
                        onPress={() => this.onSelect(item)}
                        style={[defaultItemWrapperStyle]}>
                        <Text style={[defaultItemStyle]}>{I18n.t(item.key)}</Text>
                    </TouchableOpacity>
                })}
            </ScrollView>
        </View>
    }

    renderCancelButton() {
        const { defaultBtnCancelWrapperStyle, defaultBtnCancelStyle } = this.dic
        return <TouchableOpacity
            onPress={this.onCancel}
            style={[defaultBtnCancelWrapperStyle]}>
            <Text style={[defaultBtnCancelStyle]}>{this.props.textBtnCancel}</Text>
        </TouchableOpacity>
    }

    render() {
        return (
            <TouchableWithoutFeedback
                onPress={this.onPressBackdrop}
                style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0
                }}>
                <View style={{
                    flex: 1,
                    backgroundColor: this.dic.defaultBackdropColor,
                    justifyContent: 'flex-end'
                }}>
                    <Animated.View style={{
                        transform: [{ translateY: this.dic.translateYAnim }]
                    }}>
                        <View style={{
                            marginHorizontal: 10,
                            paddingVertical: 8,
                            borderRadius: 13,
                            overflow: 'hidden',
                            backgroundColor: '#fff'
                        }}>
                            {this.renderTitle()}
                            {this.renderList()}
                        </View>
                        {this.renderCancelButton()}
                    </Animated.View>
                </View>
            </TouchableWithoutFeedback>
        )
    }
}
