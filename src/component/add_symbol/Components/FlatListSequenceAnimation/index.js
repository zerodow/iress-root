import React, { PureComponent, Component, useMemo } from 'react';
import { View, Text, FlatList, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import Animated, { Easing } from 'react-native-reanimated'

import RowLoading from './RowLoading'
import { timing } from '~/lib/redash/index.js'
import { State } from 'react-native-gesture-handler'

import { dataStorage } from '~/storage';
export const TYPE_ANIMATION = {
    'FADE_IN': 'FADE_IN',
    'FADE_OUT': 'FADE_OUT',
    'SLIDE_IN_LEFT': 'SLIDE_IN_LEFT',
    'SLIDE_IN_RIGHT': 'SLIDE_IN_RIGHT'
}
const DURATION = 700
const { width: widthDevice, height: heightDevice } = Dimensions.get('window')
const { Extrapolate, block, eq, cond, set, clockRunning, stopClock, Value, not, Clock, call } = Animated
export class SquenceView extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            type: this.props.type || 'SLIDE_IN_LEFT'
        };
        this.progressValue = this.props.progressValue || new Animated.Value(0)
        this.duration = this.props.duration || DURATION
        this.index = this.props.index || 0
        this.totalCountData = this.props.totalCountData || 9
        this.delta = this.duration / this.totalCountData
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.duration !== this.duration) {
            this.duration = nextProps.duration
            this.delta = this.duration / this.totalCountData
        }
    }
    getDetal = () => {
        return this.duration / this.totalCountData
    }
    getStartInterpolate = () => {
        return this.index * this.delta / 2
    }
    getEndInterpolate = () => {
        return ((this.duration - 300) / 64) * (this.index * this.index) + 300
    }
    getOutputRangeOpacity = () => {
        switch (this.props.type) {
            case TYPE_ANIMATION.FADE_IN:
                return [0, 1]
            case TYPE_ANIMATION.FADE_OUT:
                return [1, 0]
            default:
                return [1, 1]
        }
    }

    getOutputRangeTranslation = () => {
        switch (this.props.type) {
            case TYPE_ANIMATION.SLIDE_IN_LEFT:
                return [-widthDevice, 0]
            case TYPE_ANIMATION.SLIDE_IN_RIGHT:
                return [widthDevice, 0]
            default:
                return [0, 0]
        }
    }
    getInterpolateOpacity = () => {
        return Animated.interpolate(this.progressValue, {
            inputRange: [this.getStartInterpolate(), this.getEndInterpolate()],
            outputRange: this.getOutputRangeOpacity(),
            extrapolate: Extrapolate.CLAMP
        })
    }
    getInterpolateTranslation = () => {
        return Animated.interpolate(this.progressValue, {
            inputRange: [this.getStartInterpolate(), this.getEndInterpolate()],
            outputRange: this.getOutputRangeTranslation(),
            extrapolate: Extrapolate.CLAMP
        })
    }
    mapInterpolateToRender = () => {
        return (<Animated.View style={{
            opacity: this.getInterpolateOpacity(),
            transform: [{
                translateX: this.getInterpolateTranslation()
            }]
        }}>
            {
                this.props.children
            }
        </Animated.View>)
    }

    render() {
        return (
            <View>
                {this.mapInterpolateToRender()}
            </View>
        );
    }
}
export default class FlatListAni extends PureComponent {
    constructor(props) {
        super(props)
        this.progressValue = new Animated.Value(0)
        this.totalCountData = Array.isArray(this.props.data) ? this.props.data.length : 10
        this.duration = this.props.duration || DURATION
        this.clock = new Clock()
        this.state = {
            type: this.props.type || TYPE_ANIMATION.FADE_IN
        }
        this.stateAni = new Animated.Value(State.UNDETERMINED)
        this.needReset = new Value(0)
    }
    componentDidMount() {
        // this.runAnimation()
        this.stateAni.setValue(State.ACTIVE)
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.isLoading && nextProps.isLoading !== this.props.isLoading) {
            const direction = dataStorage.animationDirection
            switch (direction) {
                case 'fadeInRight':
                    this.animate({
                        type: TYPE_ANIMATION.SLIDE_IN_RIGHT
                    })
                    dataStorage.animationDirection = 'fadeIn' // reset
                    break;
                case 'fadeInLeft':
                    dataStorage.animationDirection = 'fadeIn'
                    this.animate({
                        type: TYPE_ANIMATION.SLIDE_IN_LEFT
                    })
                    break
                default:
                    this.animate({
                        type: TYPE_ANIMATION.FADE_IN
                    })
                    break;
            }
        }
    }
    // shouldComponentUpdate() {
    //     return false
    // }
    runAnimation = () => {
        Animated.timing(this.progressValue, {
            toValue: this.duration,
            duration: this.duration,
            easing: Easing.linear
        }).start(() => {
        })
    }
    animate = ({
        type,
        duration
    }) => {
        if (duration) {
            this.duration = duration
        }

        this.setState({
            type
        }, () => {

        })
        this.needReset.setValue(1)
        this.stateAni.setValue(State.ACTIVE)
    }
    renderItem = ({ index, item }) => {
        return (
            <SquenceView
                key={`SquenceView-${index}`}
                progressValue={this.progressValue}
                duration={this.duration}
                type={this.state.type}
                key={`${index}-${item}`}
                index={index}
                totalCountData={this.props.data.length}
            >
                {/* <View style={{
                    height: 44,
                    width: '100%',
                    backgroundColor: index % 2 === 0 ? 'red' : 'blue',
                    marginTop: 16
                }}>

                </View> */}
                <RowLoading index={index} item={item} />
            </SquenceView>
        )
    }
    keyExtractor = (item, index) => `${index}`
    render() {
        return (
            <MemoFunction dependency={[this.state.type]} >
                <React.Fragment>
                    <PureFunction>
                        <Animated.Code exec={block([
                            cond(not(clockRunning(this.clock)), [

                            ], [
                                cond(eq(this.needReset, 1), [
                                    set(this.needReset, 0),
                                    stopClock(this.clock),
                                    set(this.progressValue, 0)
                                ], [])
                            ]),
                            cond(eq(this.stateAni, State.ACTIVE), [set(this.progressValue, timing({
                                clock: this.clock,
                                from: 0,
                                to: 1000,
                                duration: 1000
                            }))])
                        ])} />
                    </PureFunction>
                    <FlatList
                        keyExtractor={this.keyExtractor}
                        {...this.props}
                        data={this.props.data}
                        renderItem={this.renderItem}

                    />
                </React.Fragment>
            </MemoFunction>

        )
    }
}
const PureFunction = React.memo(({
    children
}) => {
    return (
        <React.Fragment>
            {children}
        </React.Fragment>
    )
}, () => true)
const MemoFunction = ({ children, dependency = [] }) => {
    return useMemo(() => {
        return (
            <React.Fragment>
                {children}
            </React.Fragment>
        )
    }, dependency)
}
