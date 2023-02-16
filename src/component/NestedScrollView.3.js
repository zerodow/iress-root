import React, { PureComponent } from 'react';
import { View, Animated, Dimensions, Easing, Keyboard } from 'react-native';
import _ from 'lodash';
import SCREEN from '~/screens/watchlist/screenEnum';

import CommonStyle from '~/theme/theme_controller';

const { height: heightDevice } = Dimensions.get('window');
/**
 * NestedScroll 2 tren master
 */
export default class NestedScroll extends PureComponent {
    constructor(props) {
        super(props);
        this.scrollValue = this.props.scrollValue || new Animated.Value(0);
        this.scrollContent = new Animated.Value(heightDevice);
        this.offsetContent = 0;
        this._locationY = 0;
        this.state = {
            isOnNested: true,
            heightContainer: undefined
        };
    }

    componentDidMount() {
        this.keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            this._keyboardDidShow
        );
        this.keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            this._keyboardDidHide
        );
        // this.scrollContent.addListener(({ value }) => {
        //     console.log('DCM scrollContent', value)
        // })
        // this.scrollValue.addListener(({ value }) => {
        //     console.log('DCM scrollValue', value)
        // })
    }

    componentWillUnmount() {
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
    }

    _keyboardDidShow = this._keyboardDidShow.bind(this)
    _keyboardDidShow() {
    }

    _keyboardDidHide = this._keyboardDidHide.bind(this)
    _keyboardDidHide() {
        const value = Math.abs(this.offsetContent - this.state.heightContainer / 2)
        if (value > 1) {
            this.didHideTimeout && clearTimeout(this.didHideTimeout)
            this.didHideTimeout = setTimeout(() => {
                this.show()
            }, 100);
            this.didHideTimeout = null
        }
    }

    // #region define scroll handle

    onTouchNested = this.onTouchNested.bind(this);
    onTouchNested() {
        this.setState({
            isOnNested: true
        });
    }

    onTouchStart = this.onTouchStart.bind(this);
    onTouchStart() {
        this.setState({
            isOnNested: false
        });
    }

    onContainerLayout = this.onContainerLayout.bind(this);
    onContainerLayout(e) {
        const { height } = e.nativeEvent.layout;
        this.setState({
            heightContainer: height
        });
    }

    onScrollEndDrag = this.onScrollEndDrag.bind(this);
    onScrollEndDrag(e) {
        const { y } = e.nativeEvent.contentOffset;
        if (y >= this.state.heightContainer / 2) return;
        const isMoveUp = y - this.offsetContent > 0;
        if (isMoveUp) {
            this.snapToTop();
        } else {
            this.snapToMiddle();
        }
    }

    setRef = this.setRef.bind(this);
    setRef(sef) {
        this._scroll = sef;
        // setTimeout(() => {
        // 	this.snapToTop();
        // }, 100);
    }

    // #endregion

    // #region define styles
    getStyleNested() {
        return {
            position: 'absolute',
            height: this.state.heightContainer,
            width: '100%',
            transform: [
                {
                    translateY: this.scrollValue
                }
            ]
        };
    }

    getStyleOver(panHeight) {
        return {
            top: 33,
            position: 'absolute',
            width: '100%',
            height: '100%',
            backgroundColor: CommonStyle.backgroundColor,
            transform: [
                {
                    translateY: this.scrollValue.interpolate({
                        inputRange: [0, panHeight, panHeight + 1],
                        outputRange: [0, 0, 1]
                    })
                }
            ]
        };
    }

    // #endregion

    snapToTop(force) {
        if (this.scrollContent._value !== 0 && !force) return;
        if (this._scroll) {
            this._scroll
                .getNode()
                .scrollTo({ y: this.state.heightContainer / 2 });
            this.offsetContent = this.state.heightContainer / 2;
        }
    }

    snapToMiddle() {
        if (this._scroll) {
            this._scroll.getNode().scrollTo({ y: 0 });
            this.offsetContent = 0;
        }
    }

    show(cb) {
        this.snapToTop(true);
        this.setState(
            {
                isOnNested: false
            },
            () => {
                Animated.timing(this.scrollContent, {
                    toValue: 0,
                    duration: 500, // 300 bi log bug nhanh qua :))
                    easing: Easing.linear
                }).start(() => {
                    cb && cb()
                });
            }
        );
    }

    showHaft() {
        Animated.timing(this.scrollContent, {
            toValue: 0,
            duration: 300,
            easing: Easing.linear
        }).start(() => this.snapToMiddle());
    }

    hide() {
        // this.snapToMiddle()
        Animated.timing(this.scrollContent, {
            toValue: heightDevice,
            duration: 300,
            easing: Easing.linear
        }).start(() => {
            this.snapToMiddle()
        });
    }

    getChilren() {
        const children = React.Children.toArray(this.props.children);
        return _.map(children, child =>
            React.cloneElement(child, {
                onTouchEnd: this.onTouchStart,
                heightContainer: this.state.heightContainer,
                scrollValue: this.scrollValue
            })
        );
    }

    render() {
        const scrollEnabled = this.props.screenSelected === SCREEN.WATCHLIST
        if (!this.state.heightContainer) {
            return (
                <View
                    onLayout={this.onContainerLayout}
                    style={{ height: '100%' }}
                />
            );
        }

        const [firstChild, secondChild] = this.getChilren();
        const panHeight = this.state.heightContainer / 2;
        return (
            <Animated.ScrollView
                keyboardShouldPersistTaps="always"
                showsVerticalScrollIndicator={false}
                ref={this.setRef}
                onScroll={Animated.event(
                    [
                        {
                            nativeEvent: {
                                contentOffset: { y: this.scrollValue }
                            }
                        }
                    ],
                    {
                        useNativeDriver: true // <- Native Driver used for animated events
                    }
                )}
                onScrollEndDrag={this.onScrollEndDrag}
                scrollEventThrottle={1}
                scrollEnabled={!this.state.isOnNested && scrollEnabled}
                onLayout={this.onContainerLayout}
                style={{
                    height: '100%',
                    ...this.props.style
                }}
            >
                <Animated.View
                    onTouchStart={this.onTouchNested}
                    onTouchEnd={this.onTouchStart}
                    style={this.getStyleNested()}
                >
                    {firstChild}
                </Animated.View>

                <Animated.View
                    pointerEvents="box-none"
                    style={{
                        transform: [{ translateY: this.scrollContent }]
                    }}
                >
                    <View
                        style={{
                            height: panHeight,
                            width: '100%'
                        }}
                        pointerEvents="none"
                    />
                    <View
                        onTouchStart={this.onTouchStart}
                        style={{ minHeight: this.state.heightContainer }}
                    >
                        <Animated.View style={this.getStyleOver(panHeight)} />
                        {secondChild}
                    </View>
                </Animated.View>
            </Animated.ScrollView>
        );
    }
}
