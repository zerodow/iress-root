import React, { Component } from 'react'
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import { Text, View, StyleSheet, TouchableOpacity, Animated } from 'react-native'

export default class Tabs extends Component {
    constructor(props) {
        super(props)
        this.listX = []
        this.widthAni = new Animated.Value(0)
        this.translateX = new Animated.Value(0)
        this.bgAni = ['Tab 1', 'Tab222222', 'Tab3333334444'].map(el => new Animated.Value(0))
        this.state = {
            tabAcitve: props.tabAcitve || 0
        }
        this.preActiveTab = 0
        this.tabActive = props.tabAcitve || 0
    }
    onChangeTab = (index) => {
        if (index === this.tabActive) return
        this.preActiveTab = this.tabActive
        this.tabActive = index
        // this.setState({
        //     tabAcitve: index
        // })
        this.handleMoveUnderline(index)

        setTimeout(() => {

        }, 100);
    }
    handleMoveUnderline = (index) => {
        const tabActive = this.getTabActive(index)
        if (!tabActive) return
        Animated.parallel([
            Animated.timing(this.translateX, {
                toValue: tabActive.x,
                duration: 50
            }),
            Animated.timing(this.bgAni[index], {
                toValue: 1,
                duration: 0
            }),
            Animated.timing(this.bgAni[this.preActiveTab], {
                toValue: 0,
                duration: 0
            }),
            Animated.timing(this.widthAni, {
                toValue: tabActive.width,
                duration: 50
            })
        ]).start(() => {
            this.props.onChangeTab && this.props.onChangeTab(index)
        })

        // this.translateX.setValue(this.listX[index].x)
        // this.bgAni[this.preActiveTab].setValue(0)
        // this.bgAni[index].setValue(1)
    }
    drawUnderline = () => {
        let tabActive = this.getTabActive(this.tabActive)
        if (!tabActive) return
        this.widthAni.setValue(tabActive.width)
        this.translateX.setValue(tabActive.x)
        this.bgAni[this.tabActive].setValue(1)
        let x = 1;
    }
    getTabActive = (index) => {
        return this.listX.find(el => el.index === index)
    }
    render() {
        const tabs = this.props.tabs || ['Tab 1', 'Tab222222', 'Tab3333334444'];
        const { labelColorActive = CommonStyle.color.modify, backgroundColorActive } = this.props
        return (
            <View>
                <View style={[styles.tabWrapper]}>
                    {
                        tabs.map((el, index) => {
                            return (

                                <TouchableOpacity onPress={() => this.onChangeTab(index)} onLayout={
                                    (event) => {
                                        let x = event.nativeEvent.layout.x
                                        let width = event.nativeEvent.layout.width
                                        this.listX.push({
                                            index, x, width
                                        })

                                        if (this.listX.length === tabs.length) {
                                            this.drawUnderline()
                                        }
                                    }
                                }>
                                    <Animated.View style={[
                                        styles.tabButtonWrapper
                                        // {
                                        //     backgroundColor: this.bgAni[index].interpolate(
                                        //         {
                                        //             inputRange: [0, 1],
                                        //             outputRange: ['rgba(0, 0, 0, 0)', 'rgba(0, 255, 0, 1)']
                                        //         }
                                        //     )
                                        // }
                                    ]}>
                                        <Animated.Text style={[styles.tabLabel,
                                        labelColorActive ? {
                                            color: this.bgAni[index].interpolate(
                                                {
                                                    inputRange: [0, 1],
                                                    outputRange: ['rgba(255,255,255,1)', labelColorActive]
                                                }
                                            )
                                        } : {},
                                        {
                                            fontWeight: this.bgAni[index].interpolate(
                                                {
                                                    inputRange: [0, 1],
                                                    outputRange: ['100', '800']
                                                }
                                            )
                                        }
                                        ]} >
                                            {el.label}
                                        </Animated.Text>
                                    </Animated.View>
                                </TouchableOpacity>

                            )
                        })

                    }

                </View>
                <Animated.View style={[styles.tabActive, {
                    width: this.widthAni,
                    transform: [
                        { translateX: this.translateX }
                    ]
                }]} />
            </View>
        )
    }
}
const styles = {}
function getNewestStyle() {
	const newStyle = StyleSheet.create({
    tabWrapper: {
        flexDirection: 'row', justifyContent: 'space-around', paddingLeft: 16
    },
    tabButtonWrapper: {
        paddingHorizontal: 8,
        paddingVertical: 8
    },
    tabAcitve: {
        fontSize: CommonStyle.fontSizeS,
        fontFamily: CommonStyle.fontPoppinsBold,
        color: CommonStyle.color.modify
    },
    underline: {
        height: 2,
        borderRadius: 2,
        marginTop: 2,
        width: 0,
        backgroundColor: 'gray'
        // marginHorizontal: 8
    },
    textActive: {
        fontSize: CommonStyle.fontSizeS,
        fontFamily: CommonStyle.fontPoppinsBold,
        color: CommonStyle.color.modify
    },
    tabLabel: { fontSize: CommonStyle.fontSizeS, color: CommonStyle.fontColor, fontFamily: CommonStyle.fontPoppinsRegular },
    tabActive: { position: 'absolute', bottom: -2, borderRadius: 2, height: 4, backgroundColor: CommonStyle.color.turquoiseBlue }
})
	PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)
