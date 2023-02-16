import React, { PureComponent, Component } from 'react';
import { Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import _ from 'lodash';

import Animated, { Easing } from 'react-native-reanimated';

const {
    set,
    cond,
    block,
    eq,
    add,
    and,
    Value,
    divide,
    greaterThan,
    sub,
    multiply,
    clockRunning,
    startClock,
    stopClock,
    Clock,
    timing,
    call,
    color
} = Animated;

const runTiming = (children, actived, onChange) => {
    const destBlock = dest =>
        _.map(children, (val, index) => {
            return cond(eq(actived, +index), set(dest, +index));
        });

    const clock = new Clock(0);
    const state = {
        finished: new Value(0),
        position: new Value(0),
        time: new Value(0),
        frameTime: new Value(0)
    };

    const config = {
        duration: 300,
        toValue: new Value(0),
        easing: Easing.inOut(Easing.ease)
    };

    return block([
        cond(
            clockRunning(clock),
            [
                // if the clock is already running we update the toValue, in case a new dest has been passed in
                ...destBlock(config.toValue)
            ],
            [
                // if the clock isn't running we reset all the animation params and start the clock
                set(state.finished, 0),
                set(state.time, 0),
                // set(state.position, value),
                set(state.frameTime, 0),
                ...destBlock(config.toValue),
                // set(config.toValue, dest),
                startClock(clock)
            ]
        ),
        timing(clock, state, config),
        cond(state.finished, [
            stopClock(clock),
            call([actived], ([actived]) => onChange(actived))
        ]),
        state.position
    ]);
};

const getPadding = (widthContainer, widthContent, size) => {
    const df = sub(widthContainer, widthContent);
    const result = new Value(0);

    return block([
        cond(
            and(widthContainer, widthContent, greaterThan(df, 5)),
            set(result, divide(df, size, 2))
        ),
        result
    ]);
};

const getBackgroundSize = ({ timing, dicItem, wrappedChild }) => {
    const inputRange = [];
    const outputRange = [];
    _.map(wrappedChild, (child, index) => {
        inputRange.push(+index);
        outputRange.push(dicItem[+index]);
    });

    return Animated.interpolate(timing, {
        inputRange,
        outputRange
    });
};

const getTrans = ({ timing, dicItem, wrappedChild }) => {
    const inputRange = [];
    const outputRange = [];

    _.forEach(wrappedChild, (child, index) => {
        inputRange.push(+index);
        outputRange.push(
            add(..._.map(_.range(+index), item => dicItem[item]), 0)
        );
    });

    return Animated.interpolate(timing, {
        inputRange,
        outputRange
    });
};

const getChildTrans = ({ timing, widthContainer, wrappedChild }) => {
    const inputRange = [];
    const outputRange = [];

    _.forEach(wrappedChild, (child, index) => {
        inputRange.push(+index);
        outputRange.push(multiply(widthContainer, +index, -1));
    });

    return Animated.interpolate(timing, {
        inputRange,
        outputRange
    });
};

const getHeightContent = ({ timing, dicChildren, wrappedChild }) => {
    const inputRange = [];
    const outputRange = [];

    _.forEach(wrappedChild, (child, index) => {
        inputRange.push(+index);
        outputRange.push(dicChildren[+index]);
    });

    return Animated.interpolate(timing, {
        inputRange,
        outputRange
    });
};

class ScrollTabbar extends PureComponent {
    renderChildren() {
        const {
            tabPadding,
            wrappedChild,
            onChange,
            onItemLayout,
            tabStyles,
            titleTabbarStyles,
            titleActiveStyles
        } = this.props;

        if (!wrappedChild) return <View />;
        return React.Children.map(wrappedChild, (child, index) => (
            <TouchableOpacity onPress={() => onChange(+index)}>
                <Animated.View
                    onLayout={e => onItemLayout(e, +index)}
                    style={[
                        tabStyles,
                        {
                            paddingHorizontal: tabPadding
                        }
                    ]}
                >
                    <Animated.Text
                        style={[titleTabbarStyles, titleActiveStyles(index)]}
                    >
                        {child.props.tabLabel}
                    </Animated.Text>
                </Animated.View>
            </TouchableOpacity>
        ));
        // {
        //     _.map(wrappedChild, (child, index) => (
    }

    render() {
        const {
            tabPadding,
            onContainerLayout,
            onContentLayout,
            tabTrans,
            backgroundWidth,
            tabbarStyles,
            underBgStyles
        } = this.props;

        return (
            <Animated.View
                style={[
                    tabbarStyles,
                    {
                        flexDirection: 'row',
                        opacity: Animated.interpolate(tabPadding, {
                            inputRange: [-1, 0, 1, 2],
                            outputRange: [0, 0, 1, 1]
                        })
                    }
                ]}
                onLayout={onContainerLayout}
            >
                <View style={styles.tabbarContainer} onLayout={onContentLayout}>
                    <Animated.View
                        style={[
                            styles.backgroundTabbar,
                            underBgStyles,
                            {
                                width: backgroundWidth,
                                transform: [{ translateX: tabTrans }]
                            }
                        ]}
                    />
                    {this.renderChildren()}
                </View>
            </Animated.View>
        );
    }
}

export default class ScrollTabs extends PureComponent {
    constructor(props) {
        super(props);
        this.widthContainer = new Value(0);

        this.widthContent = new Value(0);
        this.actived = new Value(0);

        this.dicItem = {};
        this.dicChildren = {};

        this.wrappedChild = this.getChildren();
        _.forEach(this.wrappedChild, (child, index) => {
            this.dicItem[+index] = new Value(0);
            this.dicChildren[+index] = new Value(0);
        });

        this.tabPadding = getPadding(
            this.widthContainer,
            this.widthContent,
            _.size(this.wrappedChild)
        );
        this.timing = runTiming(
            this.wrappedChild,
            this.actived,
            props.onChange
        );

        this.bgWidth = getBackgroundSize({
            timing: this.timing,
            dicItem: this.dicItem,
            wrappedChild: this.wrappedChild
        });
        this.translateX = getTrans({
            timing: this.timing,
            dicItem: this.dicItem,
            wrappedChild: this.wrappedChild
        });

        this.heightContent = getHeightContent({
            timing: this.timing,
            dicChildren: this.dicChildren,
            wrappedChild: this.wrappedChild
        });

        this.translateXContent = getChildTrans({
            timing: this.timing,
            widthContainer: this.widthContainer,
            wrappedChild: this.wrappedChild
        });
    }

    getChildren() {
        const result = {};
        React.Children.forEach(this.props.children, (child, index) => {
            if (child.props.tabLabel) {
                result[+index] = child;
            }
        });

        return result;
    }

    hexToRgbA(hex) {
        var c;
        if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
            c = hex.substring(1).split('');
            if (c.length === 3) {
                c = [c[0], c[0], c[1], c[1], c[2], c[2]];
            }
            c = '0x' + c.join('');

            return color((c >> 16) & 255, (c >> 8) & 255, c & 255, 1);
        }
        throw new Error('Bad Hex');
    }

    titleActivedStyles = this.titleActivedStyles.bind(this);
    titleActivedStyles(index) {
        const curStyles = {};
        const { activeTitleTabbarStyles, titleTabbarStyles } = this.props;

        _.forEach(activeTitleTabbarStyles, (value, key) => {
            if (titleTabbarStyles[key]) {
                if (key === 'color') {
                    curStyles[key] = {
                        inActive: this.hexToRgbA(titleTabbarStyles[key]),
                        actived: this.hexToRgbA(value)
                    }
                } else {
                    curStyles[key] = {
                        inActive: titleTabbarStyles[key],
                        actived: value
                    };
                }
            }
        });
        const result = {};
        _.forEach(curStyles, ({ inActive, actived }, key) => {
            return (result[key] = cond(
                eq(this.actived, index),
                actived,
                inActive
            ));
        });

        return result;
    }

    onContainerLayout = this.onContainerLayout.bind(this);
    onContainerLayout({
        nativeEvent: {
            layout: { width }
        }
    }) {
        this.widthContainer.setValue(width);
    }

    onContentLayout = this.onContentLayout.bind(this);
    onContentLayout({
        nativeEvent: {
            layout: { width }
        }
    }) {
        this.widthContent.setValue(width);
    }

    onItemLayout = this.onItemLayout.bind(this);
    onItemLayout(
        {
            nativeEvent: {
                layout: { width }
            }
        },
        key
    ) {
        this.dicItem[key].setValue(width);
    }

    onLayoutChildren = this.onLayoutChildren.bind(this);
    onLayoutChildren(
        {
            nativeEvent: {
                layout: { height }
            }
        },
        key
    ) {
        this.dicChildren[key].setValue(height);
    }

    onChange = this.onChange.bind(this);
    onChange(index) {
        this.actived.setValue(+index);
    }

    renderChildren() {
        return React.Children.map(this.props.children, (child, index) => (
            <Animated.View
                style={{
                    width: this.widthContainer
                }}
            >
                {React.cloneElement(child, {
                    onLayout: e => this.onLayoutChildren(e, +index),
                    actived: this.actived,
                    timer: this.timing
                })}
            </Animated.View>
        ));
    }

    render() {
        return (
            <Animated.View style={[this.props.style, { overflow: 'hidden' }]}>
                <ScrollTabbar
                    tabPadding={this.tabPadding}
                    onContainerLayout={this.onContainerLayout}
                    onContentLayout={this.onContentLayout}
                    tabTrans={this.translateX}
                    wrappedChild={this.props.children}
                    onChange={this.onChange}
                    onItemLayout={this.onItemLayout}
                    backgroundWidth={this.bgWidth}
                    tabStyles={this.props.tabStyles}
                    tabbarStyles={this.props.tabbarStyles}
                    underBgStyles={this.props.underBgStyles}
                    titleTabbarStyles={this.props.titleTabbarStyles}
                    titleActiveStyles={this.titleActivedStyles}
                />
                <Animated.View
                    style={{
                        width: this.widthContainer,
                        height: this.heightContent,
                        transform: [
                            {
                                translateX: this.translateXContent
                            }
                        ]
                    }}
                >
                    <Animated.View
                        style={{
                            flexDirection: 'row',
                            position: 'absolute',
                            top: 0,
                            left: 0
                        }}
                    >
                        {this.renderChildren()}
                    </Animated.View>
                </Animated.View>
            </Animated.View>
        );
    }
}

const RADIUS = 8;

const styles = StyleSheet.create({
    tabbarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderTopLeftRadius: RADIUS,
        borderTopRightRadius: RADIUS
    },
    backgroundTabbar: {
        position: 'absolute',
        height: '100%',
        backgroundColor: 'blue',
        borderTopLeftRadius: RADIUS,
        borderTopRightRadius: RADIUS
    }
});

ScrollTabs.defaultProps = {
    onChange: () => null
};
