import React, { Component } from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import _ from 'lodash';

import FirstSubHeader from '../Component/FirstSubHeader';
import SecondSubHeader from '../Component/SecondSubHeader';
import SearchBar from '../Header/header.searchBar';
import WatchListNameInput from '../EditWatchList/WatchListNameInput';
import AniComp from '../Animator';
import SubHeader, { ConnectComp } from '../Component/SubHeader';
import CommonStyle from '~/theme/theme_controller';

export default class Header extends Component {
    renderSub(content, bgAni, zIndex) {
        let translateY = 0;
        const { _value, _scrollValue, itemDuration } = this.props;
        if (_value) {
            translateY = Animated.interpolate(_value, {
                inputRange: [-1, 0, itemDuration, itemDuration + 1],
                outputRange: [-50, -50, 0, 0]
            });
        }
        let translateY2 = 0;
        if (_scrollValue) {
            translateY2 = Animated.interpolate(_scrollValue, {
                inputRange: [-1, 0, 1],
                outputRange: [1, 0, 0]
            });
        }

        return (
            <SubHeader
                style={{
                    transform: [{ translateY: translateY2 }]
                }}
                zIndex={zIndex}
                aniProps={{
                    style: {
                        transform: [{ translateY }]
                    }
                }}
                bgAni={[
                    {
                        transform: [{ translateY: translateY2 }]
                    },
                    bgAni
                ]}
            >
                {content}
            </SubHeader>
        );
    }

    renderConnectSub(zIndex) {
        if (this.props.isConnected) return <View />;

        return this.renderSub(
            <ConnectComp />,
            {
                backgroundColor: CommonStyle.color.network
            },
            zIndex
        );
    }

    render() {
        return (
            <React.Fragment>
                <Animated.View
                    style={{
                        zIndex: 9,
                        transform: [
                            { translateY: this.props._scrollValue || 0 }
                        ]
                    }}
                >
                    <FirstSubHeader>
                        <View
                            style={{
                                flexDirection: 'row',
                                paddingBottom: 16
                            }}
                        >
                            <View style={{ width: 36 }} />
                            <View style={{ flex: 1 }}>
                                <SearchBar
                                    navigator={this.props.navigator}
                                    isBorder
                                />
                            </View>
                        </View>
                    </FirstSubHeader>

                    {this.renderConnectSub(-5)}
                    <SecondSubHeader initY={0} startAtFirst={false} />
                </Animated.View>
                {this.props.isShowWatchListNameInput === false ? null : (
                    <AniComp startAtFirst>
                        <WatchListNameInput />
                    </AniComp>
                )}
            </React.Fragment>
        );
    }
}
