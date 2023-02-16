import React from 'react';
import { View, Text, Animated, I18nManager } from 'react-native';
import _ from 'lodash';
import Button from 'react-native-scrollable-tab-view/Button';
import ScrollableTabBar from 'react-native-scrollable-tab-view/ScrollableTabBar';

import CommonStyle from '~/theme/theme_controller';

export default class MarketCustomTabbar extends ScrollableTabBar {
    getInitialState() {
        return {
            ...super.getInitialState(),
            paddingValue: 0
        };
    }

    renderTab1(name, page, isTabActive, onPressHandler, onLayoutHandler) {
        const opacity = isTabActive ? 1 : 0.5;
        return (
            <Button
                key={`${name}_${page}`}
                accessible={true}
                accessibilityLabel={name}
                accessibilityTraits="button"
                onPress={() => onPressHandler(page)}
                onLayout={onLayoutHandler}
            >
                <View
                    style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingVertical: 12,
                        opacity,
                        paddingHorizontal: 4 + this.state.paddingValue
                    }}
                >
                    <Text
                        style={{
                            fontFamily: CommonStyle.fontPoppinsBold,
                            color: isTabActive
                                ? CommonStyle.fontDark
                                : CommonStyle.fontWhite,
                            fontSize: CommonStyle.fontSizeXS
                        }}
                    >
                        {name}
                    </Text>
                </View>
            </Button>
        );
    }

    onTabContainerLayout1 = this.onTabContainerLayout1.bind(this);
    onTabContainerLayout1(e) {
        this._tabContainerMeasurements = e.nativeEvent.layout;
        let width = this._tabContainerMeasurements.width;
        setTimeout(() => {
            const maxWidth =
                (this._containerMeasurements &&
                    this._containerMeasurements.width) ||
                0;
            if (width < maxWidth) {
                width = maxWidth;
            }
            this.setState({ _containerWidth: width }, this.onSpaceLayout);
            this.updateView({ value: this.props.scrollValue._value });
        }, 300);
    }

    onSpaceLayout = this.onSpaceLayout.bind(this);
    onSpaceLayout(e) {
        if (this._space && this._space !== null) {
            const sef = this._space // Co le bien this bi tham chieu o android
            setTimeout(() => {
                sef.measure && sef.measure((x, y, width, height) => {
                    if (width > 1 && _.size(this.props.tabs) > 0) {
                        this.setState({
                            paddingValue: width / _.size(this.props.tabs) / 2
                        });
                    }
                });
            }, 2000);
        }
    }

    onContainerLayout1 = this.onContainerLayout1.bind(this);
    onContainerLayout1(e) {
        this._containerMeasurements = e.nativeEvent.layout;
        // this.updateView({ value: this.props.scrollValue._value });
        // this.promt && this.promt();
    }

    getPos() {
        const { heightAbsBefore = 0, currentPos = 0 } = this.props;
        return currentPos - heightAbsBefore;
    }
    handleListenerOnLayout = () => { }
    render() {
        const tabUnderlineStyle = {
            position: 'absolute',
            height:
                (this._containerMeasurements &&
                    this._containerMeasurements.height) ||
                0,
            backgroundColor: CommonStyle.fontBlue1,
            top: 0,
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8
        };

        const key = I18nManager.isRTL ? 'right' : 'left';
        const dynamicTabUnderline = {
            [`${key}`]: this.state._leftTabUnderline,
            width: this.state._widthTabUnderline
        };

        const currentPos = this.getPos();
        let translateY = 0;
        if (this.props.scrollContentValue) {
            translateY = this.props.scrollContentValue.interpolate({
                inputRange: [-1000, currentPos, currentPos + 10],
                outputRange: [0, 0, 10]
            });
        }
        return (
            <Animated.View
                collapsable={false}
                onLayout={this.onContainerLayout1}
                style={{
                    width: '100%',
                    transform: [{ translateY }],
                    zIndex: 10
                }}
            >
                {/* <ScrollView
					automaticallyAdjustContentInsets={false}
					ref={scrollView => {
						this._scrollView = scrollView;
					}}
					horizontal={true}
					showsHorizontalScrollIndicator={false}
					showsVerticalScrollIndicator={false}
					directionalLockEnabled={true}
					onScroll={this.props.onScroll}
					bounces={false}
					scrollsToTop={false}
				> */}
                <View
                    style={{
                        width: this.state._containerWidth,
                        flexDirection: 'row',
                        backgroundColor:
                            CommonStyle.navigatorSpecial
                                .navBarBackgroundColor3,
                        borderTopLeftRadius: 8,
                        borderTopRightRadius: 8
                    }}
                    ref={'tabContainer'}
                    onLayout={this.onTabContainerLayout1}
                >
                    <Animated.View
                        style={[
                            tabUnderlineStyle,
                            dynamicTabUnderline,
                            this.props.underlineStyle
                        ]}
                    />
                    {this.props.tabs.map((name, page) => {
                        const isTabActive = this.props.activeTab === page;
                        return this.renderTab1(
                            name,
                            page,
                            isTabActive,
                            this.props.goToPage,
                            this.measureTab.bind(this, page)
                        );
                    })}
                    <View
                        ref={sef => (this._space = sef)}
                        onLayout={this.handleListenerOnLayout}
                        style={{
                            flex: 1
                        }}
                    />
                </View>
                {/* </ScrollView> */}
            </Animated.View>
        );
    }
}
