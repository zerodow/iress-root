import React, { Component } from 'react'
import { View, TouchableOpacity, Text, Animated, StyleSheet, LayoutAnimation, UIManager, Platform, ScrollView } from 'react-native'
import PropTypes from 'prop-types'
import TouchableOpacityOpt from '~/component/touchableOpacityOpt';
import BadgeIcon from '~/component/badge/badge';

import ENUM from '~/enum';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import * as setTestId from '~/constants/testId';
if (
    Platform.OS === 'android' &&
    UIManager.setLayoutAnimationEnabledExperimental
) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}
export default class index extends Component {
    constructor(props) {
        super(props)

        this.state = {
            tabActive: props.tabActiveIndex
        }
        this.translateXAni = new Animated.Value(0)
        this.tabActive = props.tabActiveIndex
        this.tabInfo = []
    }
    handleOnChangeTab = (index, isChangeTab = true) => {
        if (index === this.state.tabActive) return
        this.props.setDirectionAnimation && this.props.setDirectionAnimation(this.state.tabActive, index)
        // LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        console.log('tab---', index)
        this.setState({ tabActive: index })
        isChangeTab && this.props.onChangeTab && this.props.onChangeTab(index)
    }
    setRefLine = (ref) => {
        this.refLine = ref
    }
    handleGetInfortab = (event, index) => {
        const width = event.nativeEvent.layout.width
        this.tabInfo[index] = width
        console.log('DCM tabinfor', this.tabInfo)
    }
    render() {
        return (
            <View style={[{ flexDirection: 'row', justifyContent: 'space-around' }, this.props.style]}>
                <View style={{
                    position: 'absolute',
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                    transform: [{
                        translateX: 1000
                    }]
                }}>
                    {
                        this.props.tabs.map((el, index) => {
                            return (
                                <TouchableOpacityOpt
                                    style={{ opacity: 0 }}
                                    onLayout={(e) => {
                                        this.handleGetInfortab(e, index)
                                    }}
                                    timeDelay={ENUM.TIME_DELAY}
                                >
                                    {
                                        el.showBadge && this.props.renderBadge && this.props.renderBadge(index)
                                    }
                                    {
                                        !el.showBadge && this.props.renderBadge && (<View style={{ opacity: 0 }}>
                                            {this.props.renderBadge(index)}
                                        </View>)
                                    }
                                    <View style={{ paddingRight: 16, paddingBottom: 16, marginLeft: index === 0 ? 0 : 16 }}>
                                        <Text style={[styles.tabLabel, styles.textActive, this.props.styleLabelTab || {}]}>
                                            {el.label}
                                        </Text>
                                        {this.state.tabActive === index ? (<View style={[styles.tabActive, { overflow: 'hidden' }]}>
                                            <Text style={[styles.tabLabel, styles.textActive, this.props.styleLabelTab || {}]}>
                                                {el.label}
                                            </Text>
                                        </View>) : null}

                                    </View>
                                </TouchableOpacityOpt>
                            )
                        })
                    }
                </View>
                {
                    this.props.tabs.map((el, index) => {
                        return (
                            <TouchableOpacityOpt
                                style={{ opacity: 1, width: this.tabInfo[index] }}
                                timeDelay={ENUM.TIME_DELAY}
                                {...setTestId.testProp(`Id_TabView2_${index}`, `Label_TabView2_${index}`)}
                                onPress={() => {
                                    this.handleOnChangeTab(index)
                                }} >
                                {
                                    el.showBadge && this.props.renderBadge && this.props.renderBadge(index)
                                }
                                {
                                    !el.showBadge && this.props.renderBadge && (<View style={{ opacity: 0 }}>
                                        {this.props.renderBadge(index)}
                                    </View>)
                                }
                                <View style={{ paddingRight: 16, paddingBottom: 16, marginLeft: index === 0 ? 0 : 16 }}>
                                    <Text style={[styles.tabLabel, this.state.tabActive === index ? styles.textActive : {}, this.props.styleLabelTab || {}]}>
                                        {el.label}
                                    </Text>
                                    {this.state.tabActive === index ? (<View style={[styles.tabActive, { overflow: 'hidden' }]}>
                                        <Text style={[styles.tabLabel, this.state.tabActive === index ? styles.textActive : {}, this.props.styleLabelTab || {}]}>
                                            {el.label}
                                        </Text>
                                    </View>) : null}

                                </View>
                            </TouchableOpacityOpt>
                        )
                    })
                }
            </View >
        )
    }
}
const styles = {}

function getNewestStyle() {
    const newStyle = StyleSheet.create({
        tabButtonWrapper: { paddingHorizontal: 16, paddingVertical: 4 },
        textActive: {
            fontSize: CommonStyle.fontSizeS,
            fontFamily: CommonStyle.fontPoppinsBold,
            color: CommonStyle.color.modify
        },
        tabLabel: { fontSize: CommonStyle.fontSizeS, color: CommonStyle.fontColor, fontFamily: CommonStyle.fontPoppinsRegular },
        tabActive: { left: 0, position: 'absolute', bottom: -1, borderRadius: 2, height: 4, backgroundColor: CommonStyle.color.turquoiseBlue }
    })

    PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)
