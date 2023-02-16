import React, { Component, PureComponent } from 'react';
import { View, Text } from 'react-native';
import TransitionView from '~/component/animation_component/transition_view'
import { Text as TextLoad, View as ViewLoad } from '~/component/loading_component'
import * as Animatable from 'react-native-animatable';
import CommonStyle, { register } from '~/theme/theme_controller'
import { func, dataStorage } from '~/storage';

const DURATION = 750
const DURATION_DEFAULT = 500
export class TransitionViewReverse extends TransitionView {
    static defaultProps = {
        useDelay: true
    };
    getDelay = () => {
        const { animation, duration, index, length, ...rest } = this.props;
        if (!this.props.useDelay) {
            return 0
        }
        if (this.props.useDelay && this.props.reverseDelay) {
            return index !== null && index !== undefined && typeof index === 'number' && index < 20 ? ((length - index) * DURATION) / 5 : 0
        } else if (!this.props.reverseDelay) {
            return index !== null && index !== undefined && typeof index === 'number' && index < 20 ? ((index + 2) * DURATION) / 5 : 0
        }
    }
    render() {
        const { animation, duration, index, ...rest } = this.props;
        return (
            <Animatable.View
                animation={animation || dataStorage.animationHoldings || 'fadeIn'}
                duration={duration || DURATION_DEFAULT}
                delay={this.getDelay()}
                useNativeDriver
                {...rest}
            />
        );
    }
}
export default class RowLoading extends PureComponent {
    static defaultProps = {
        useDelay: true,
        useReverse: false
    };
    render() {
        const data = [1, 2, 3, 4, 5, 6, 7, 8]
        return (
            <React.Fragment>
                {
                    data.map((el, key) => (
                        <TransitionViewReverse
                            animation={this.props.type}
                            useDelay={this.props.useDelay}
                            reverseDelay={this.props.useReverse}
                            index={key}
                            length={data.length}
                            style={{
                                marginTop: key === 0 ? 0 : 16,
                                padding: 16,
                                flexDirection: 'row',
                                backgroundColor:
                                    CommonStyle.navigatorSpecial.navBarBackgroundColor2,
                                borderRadius: 8,
                                height: 80
                            }}
                        >
                            <View style={{
                                flex: 1
                            }}>
                                <TextLoad style={{
                                    fontFamily: CommonStyle.fontPoppinsBold,
                                    fontSize: CommonStyle.fontSizeL,
                                    color: CommonStyle.fontColor
                                }} isLoading={true} >AMC</TextLoad>
                                <View style={{ height: 8 }} />
                                <TextLoad style={{
                                    fontFamily: CommonStyle.fontPoppinsRegular,
                                    fontSize: CommonStyle.fontSizeXS,
                                    color: CommonStyle.fontCompany
                                }} isLoading={true}>AMCOR PLC CD</TextLoad>
                            </View>
                            <View style={{
                                flex: 1
                            }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end' }}>
                                    <View style={{ justifyContent: 'center', marginRight: 8 }}>
                                        <TextLoad isLoading={true}>AM</TextLoad>
                                    </View>
                                    <TextLoad style={{
                                        fontFamily: CommonStyle.fontPoppinsBold,
                                        fontSize: CommonStyle.fontSizeL,
                                        color: CommonStyle.fontColor,
                                        paddingLeft: 8
                                    }} isLoading={true}>AMC</TextLoad>
                                </View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 8 }}>
                                    <TextLoad style={{
                                        fontFamily: CommonStyle.fontPoppinsRegular,
                                        fontSize: CommonStyle.fontSizeXS,
                                        color: CommonStyle.fontCompany,
                                        textAlign: 'right'
                                    }} isLoading={true}>Equity</TextLoad>
                                </View>
                            </View>
                        </TransitionViewReverse>
                    ))
                }
            </React.Fragment>
        )
    }
}
