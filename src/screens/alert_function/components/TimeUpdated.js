import React, { Component } from 'react'
import { Text, View, Animated } from 'react-native'
// Components
import TimeUpdated from '~/component/time_updated/time_updated'

import CommonStyle, { register } from '~/theme/theme_controller';
import ProgressBar from '~/modules/_global/ProgressBar';
import {
    renderTime
} from '~/lib/base/functionUtil';
import I18n from '~/modules/language';
export default class RowPullRefresh extends TimeUpdated {
    render() {
        const loading = (
            <Animated.View
                testID={`${this.props.testID}_loading`}
                style={{
                    backgroundColor: CommonStyle.backgroundColor,
                    height: this.state.heightAnimation,
                    opacity: this.state.opacityAnimation,
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            >
                <ProgressBar isCustom={true} />
            </Animated.View>
        );
        if (this.state.isLoading) return loading;
        if (this.props.isShow) {
            return (
                <Animated.View
                    style={this.props.styleWrapper ? this.props.styleWrapper : {
                        backgroundColor: CommonStyle.backgroundColor,
                        flexDirection: 'row',
                        paddingLeft: 16,
                        paddingRight: 16,
                        height: this.state.heightAnimation,
                        opacity: this.state.opacityAnimation,
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        marginTop:
                            this.props.type === 'topGainers' ||
                                this.props.type === 'topLosers'
                                ? -10
                                : 0
                    }}
                >
                    {
                        this.props.renderTimeComp ? this.props.renderTimeComp(renderTime(this.state.timeUpdated)) : (
                            <View style={CommonStyle.headerContent}>
                                <Text
                                    testID={this.props.testID}
                                    style={CommonStyle.textSubDark}
                                >
                                    {I18n.t('Updated')}{' '}
                                    {renderTime(this.state.timeUpdated)}
                                </Text>
                            </View>
                        )
                    }
                </Animated.View>
            );
        } else {
            return null;
        }
    }
}
