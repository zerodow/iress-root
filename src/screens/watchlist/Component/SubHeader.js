import React, { Component } from 'react';
import { View, Text } from 'react-native';
import I18n from '~/modules/language';
import Animated, { Easing } from 'react-native-reanimated';

import CommonStyle from '~/theme/theme_controller';
import SecondSubHeader, { keyAnimator } from '../Component/SecondSubHeader';

export const DelayWarning = props => (
    <View style={{ paddingVertical: 4 }}>
        <Text
            allowFontScaling={false}
            style={[
                CommonStyle.textWarningDrawer,
                {
                    fontFamily: CommonStyle.fontPoppinsRegular,
                    fontSize: CommonStyle.fontSizeXS
                }
            ]}
        >
            {I18n.t('delayWarning')}
        </Text>
    </View>
);

export const ConnectComp = () => (
    <Text
        style={[
            CommonStyle.textSubLightWhite,
            {
                paddingBottom: 4,
                alignSelf: 'center',
                fontFamily: CommonStyle.fontPoppinsRegular,
                fontSize: CommonStyle.fontSizeXS
            }
        ]}
    >
        {I18n.t('connecting')}...
    </Text>
);

export const ErrorComp = props => (
    <Text
        style={[
            CommonStyle.textSubLightWhite,
            {
                paddingBottom: 4,
                alignSelf: 'center',
                fontFamily: CommonStyle.fontPoppinsRegular,
                fontSize: CommonStyle.fontSizeXS
            }
        ]}
    >
        {props.title}
    </Text>
);

export default class SubHeader extends Component {
    render() {
        const { style, bgAni, zIndex, aniProps } = this.props;
        return (
            <SecondSubHeader
                style={{ zIndex }}
                aniProps={aniProps}
                bgAni={bgAni}
            >
                <Animated.View style={style}>
                    {this.props.children}
                </Animated.View>
            </SecondSubHeader>
        );
    }
}
