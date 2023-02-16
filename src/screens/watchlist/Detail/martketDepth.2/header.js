import React, { Component } from 'react';
import Animated from 'react-native-reanimated';

import { Grid, HeaderText, ItemSeparator } from './components';
import I18n from '~/modules/language';

export default class MartketDepthHeader extends Component {
    render() {
        const { _value } = this.props;

        let translateX = 0;
        let opacity = 0;

        if (_value) {
            translateX = Animated.interpolate(_value, {
                inputRange: [-1, 0, 300, 300 + 1],
                outputRange: [50, 50, 0, 0]
            });
            opacity = Animated.interpolate(_value, {
                inputRange: [-1, 0, 300, 300 + 1],
                outputRange: [0, 0, 1, 1]
            });
        }

        return (
            <Animated.View
                style={{
                    flexDirection: 'row',
                    opacity,
                    transform: [{ translateX }],
                    paddingVertical: 8
                }}
            >
                <Grid isLeft>
                    <HeaderText>{I18n.t('numberOfTrades')}</HeaderText>
                    <HeaderText>{I18n.t('volUpper')}</HeaderText>
                    <HeaderText>{I18n.t('bidUpper')}</HeaderText>
                </Grid>

                <ItemSeparator />

                <Grid>
                    <HeaderText>{I18n.t('askUpper')}</HeaderText>
                    <HeaderText>{I18n.t('volUpper')}</HeaderText>
                    <HeaderText>{I18n.t('numberOfTrades')}</HeaderText>
                </Grid>
            </Animated.View>
        );
    }
}
