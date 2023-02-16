import React, { Component, PureComponent } from 'react'
import { View, Text, Animated, Dimensions } from 'react-native'
import CommonStyle from '~/theme/theme_controller';
import { Text as TextLoading, View as ViewLoading } from '~/component/loading_component'
import TransitionView from '~/component/animation_component/transition_view'

export default class ItemView extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {}
        this.labelAnim = 'fadeInLeft'
        this.contentAnim = 'fadeInRightBig'
    }

    render() {
        const { isLoading, value, label } = this.props
        return (
            <View style={[{
                borderBottomWidth: 1,
                borderBottomColor: CommonStyle.fontBorderNewsUi,
                backgroundColor: 'transparent',
                marginLeft: 16,
                paddingVertical: 6,
                paddingRight: 16
            }, this.props.style]}>
                <TransitionView animation={this.labelAnim}>
                    <Text style={CommonStyle.textFloatingLabel2}>
                        {label}
                    </Text>
                </TransitionView>
                <TransitionView animation={this.contentAnim}>
                    <TextLoading
                        styleViewLoading={{ alignSelf: 'baseline' }}
                        isLoading={isLoading}
                        style={[CommonStyle.accountInfo]}>
                        {
                            isLoading
                                ? 'accountInfo'
                                : value
                        }
                    </TextLoading>
                </TransitionView>
            </View>
        )
    }
}
