import React, { Component } from 'react';
import { FlatList, RefreshControl, Platform, View } from 'react-native';
import Animated from 'react-native-reanimated';
import _ from 'lodash';
import * as Controller from '~/memory/controller';

import { TRANSFORM_STYLE_PROPERTIES } from './';
import Animations from './Animations';
import * as ANIMATION_DEFINITIONS from './definitions';

const FlatListWrapped = Animated.createAnimatedComponent(FlatList);

const { block, set, cond, greaterThan, lessThan, and, call, eq } = Animated;

export const STATE = {
    ON_MOMENTUM: 0,
    ON_MOMENTUM_END: 1
};

export default class FLatListAni extends Component {
    constructor(props) {
        super(props);
        this.typeAni = props.animation;
        this._scrollValue = props._scrollValue || new Animated.Value(0);
        this._value = new Animated.Value(0);
        this.checkRefresh = new Animated.Value(0);
        if (props.setRef) {
            props.setRef(this);
        }
        this.gestureState = new Animated.Value(STATE.ON_MOMENTUM_END);
        this.state = {
            refreshing: false,
            aniState: false
            // items: _.take(props.data, 1)
        };
    }

    componentDidMount() {
        !this.props.withoutDidmount &&
            setTimeout(() => {
                this.start();
            }, 100);
        // this.recursive(this.props);
    }

    // recursive(props) {
    //     setTimeout(() => {
    //         let hasMore = _.size(this.state.items) + 1 < _.size(props.data);
    //         this.setState((prev) => ({
    //             items: _.take(props.data, _.size(prev.items) + 1)
    //         }));
    //         if (hasMore) this.recursive(props);
    //         else {
    //             !this.props.withoutDidmount &&
    //                 setTimeout(() => {
    //                     this.start();
    //                 }, 100);
    //         }
    //     }, 10);
    // }

    hide = this.hide.bind(this);
    hide() {
        this._ani && this._ani.reset();
    }

    start = this.start.bind(this);
    start() {
        this._ani && this._ani.start();
    }

    getStyleConfig({ from, to }) {
        if (!from || !to) return;
        const obj = {};
        _.forEach(from, (value, key) => {
            obj[key] = {
                from: value,
                to: to[key]
            };
        });

        return obj;
    }

    getInputRange(index) {
        const {
            duration,
            numberListDelay, // after number list start ani
            itemDuration,
            itemDelay
        } = this.props;
        const firstDelay = numberListDelay * itemDelay;
        const secondDelay = index * itemDelay;
        let totalDelay = firstDelay + secondDelay;
        totalDelay = totalDelay + itemDuration;
        totalDelay = Math.min(totalDelay, duration);
        totalDelay = totalDelay - itemDuration;

        return [
            totalDelay - 1,
            totalDelay,
            totalDelay + itemDuration,
            totalDelay + itemDuration + 1
        ];
    }

    getAniStyles(animation, index) {
        const config = ANIMATION_DEFINITIONS[animation];
        const styleConfig = this.getStyleConfig(config);
        const styles = {};
        _.forEach(styleConfig, (value, key) => {
            const mapState = Animated.interpolate(this._value, {
                inputRange: this.getInputRange(index),
                outputRange: [value.from, value.from, value.to, value.to]
            });
            if (TRANSFORM_STYLE_PROPERTIES.indexOf(key) !== -1) {
                if (!styles.transform) {
                    styles.transform = [];
                }
                styles.transform.push({
                    [key]: mapState
                });
            } else {
                styles[key] = mapState;
            }
        });

        return styles;
    }

    onEnd = this.onEnd.bind(this);
    onEnd() {
        this.props.onEnd && this.props.onEnd();
        setTimeout(() => {
            this.setState({
                aniState: true
            });
        }, 300);
    }

    renderItem = this.renderItem.bind(this);
    renderItem(p) {
        const {
            animation,
            passPropsToChild,
            itemDuration,
            itemDelay,
            duration,
            numberListDelay,
            withoutRowAni,
            numberAnimations
        } = this.props;

        const { index } = p;

        if (index > numberAnimations || this.state.aniState) {
            return this.props.renderItem(p);
        }

        const aniStyles = this.getAniStyles(animation, index);
        if (passPropsToChild) {
            const result = this.props.renderItem(p);
            return (
                <Animated.View style={aniStyles}>
                    {React.cloneElement(result, {
                        _scrollValue: this._scrollValue,
                        _value: this._value,
                        itemDuration,
                        itemDelay,
                        duration,
                        numberListDelay
                    })}
                </Animated.View>
            );
        }

        if (withoutRowAni) {
            return <View>{this.props.renderItem(p)}</View>;
        }

        return (
            <Animated.View style={aniStyles}>
                {this.props.renderItem(p)}
            </Animated.View>
        );
    }

    renderHeader = this.renderHeader.bind(this);
    renderHeader(...p) {
        const { ListHeaderComponent, itemDuration, itemDelay } = this.props;
        if (ListHeaderComponent) {
            const result = ListHeaderComponent(...p);
            return React.cloneElement(result, {
                _scrollValue: this._scrollValue,
                _value: this._value,
                itemDuration,
                itemDelay,
                gestureState: this.gestureState
            });
        } else {
            return null;
        }
    }

    setRefAni = this.setRefAni.bind(this);
    setRefAni(sef) {
        this._ani = sef;
    }

    onMomentumScrollBegin = this.onMomentumScrollBegin.bind(this);
    onMomentumScrollBegin() {
        this.gestureState.setValue(STATE.ON_MOMENTUM);
    }

    onMomentumScrollEnd = this.onMomentumScrollEnd.bind(this);
    onMomentumScrollEnd() {
        this.gestureState.setValue(STATE.ON_MOMENTUM_END);
    }

    onRefresh = this.onRefresh.bind(this);
    onRefresh() {
        if (this.props.onRefresh) {
            this.props.onRefresh();
        }
    }

    renderRefreshControl() {
        const isStreamer = Controller.isPriceStreaming();
        const isLogin = Controller.getLoginStatus();
        if (!isStreamer && Platform.OS === 'android') {
            return (
                <RefreshControl
                    progressViewOffset={isLogin ? 0 : 100}
                    refreshing={false}
                    onRefresh={this.onRefresh}
                />
            );
        }

        return undefined;
    }

    getData() {
        return this.props.data;
    }

    moreProps() {
        return {};
    }

    render() {
        return (
            <Animated.View>
                <Animations
                    ref={this.setRefAni}
                    value={this._value}
                    duration={this.props.duration}
                    onEnd={this.onEnd}
                />
                <FlatListWrapped
                    {...this.props}
                    data={this.getData()}
                    onRefresh={undefined}
                    refreshControl={this.renderRefreshControl()}
                    onScroll={Animated.event([
                        {
                            nativeEvent: ({ contentOffset }) =>
                                block([
                                    set(
                                        this._scrollValue,
                                        this.props.horizontal
                                            ? contentOffset.x
                                            : contentOffset.y
                                    ),
                                    cond(
                                        and(
                                            lessThan(this._scrollValue, -100),
                                            eq(
                                                this.gestureState,
                                                STATE.ON_MOMENTUM_END
                                            )
                                        ),
                                        set(this.checkRefresh, 1)
                                    ),
                                    cond(
                                        and(
                                            greaterThan(this._scrollValue, -5),
                                            this.checkRefresh
                                        ),
                                        block([
                                            call([], this.props.onRefresh),
                                            set(this.checkRefresh, 0)
                                        ])
                                    )
                                ])
                        }
                    ])}
                    ListHeaderComponent={this.renderHeader}
                    renderItem={this.renderItem}
                    onMomentumScrollBegin={this.onMomentumScrollBegin}
                    onMomentumScrollEnd={this.onMomentumScrollEnd}
                    {...this.moreProps()}
                />
            </Animated.View>
        );
    }
}

FLatListAni.defaultProps = {
    onRefresh: () => null,
    animation: 'fadeIn',
    numberListDelay: 0, // after number list start ani
    itemDuration: 250,
    itemDelay: 50,
    duration: 1000, //  total duration,
    numberAnimations: 10
};
