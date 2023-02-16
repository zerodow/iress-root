import React, { PureComponent, Component, useCallback } from 'react';
import { View, Text, FlatList, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import Animated, { Easing } from 'react-native-reanimated'
import DraggableFlatList from 'react-native-draggable-flatlist';

import RowLoading from './RowLoading'
import RowSymbol from '~/screens/watchlist/EditWatchList/Views/Content/Row/Index.js'

import * as PriceBoardModel from '~/screens/watchlist/EditWatchList/Model/PriceBoardModel.js'

import { timing } from '~/lib/redash/index.js'
import { State } from 'react-native-gesture-handler'
export const TYPE_ANIMATION = {
    'FADE_IN': 'FADE_IN',
    'FADE_OUT': 'FADE_OUT',
    'SLIDE_IN_LEFT': 'SLIDE_IN_LEFT',
    'SLIDE_IN_RIGHT': 'SLIDE_IN_RIGHT'
}
const { width: widthDevice, height: heightDevice } = Dimensions.get('window')
const { Extrapolate, block, eq, cond, set, clockRunning, stopClock, Value, not, Clock, call, and, sub } = Animated
export class SquenceView extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            type: this.props.type || 'SLIDE_IN_LEFT'
        };
        this.progressValue = this.props.progressValue || new Animated.Value(0)
        this.duration = this.props.duration || 1000
        this.index = this.props.index || 0
        this.totalCountData = this.props.totalCountData || 10
        this.delta = this.duration / this.totalCountData
        let x = 1
    }
    getDetal = () => {
        return this.duration / this.totalCountData
    }
    getStartInterpolate = () => {
        return this.index * this.delta / 2
    }
    getEndInterpolate = () => {
        return this.index * this.delta + this.delta
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
            }],
            flex: 1
        }}>
            {
                this.props.children
            }
        </Animated.View>)
    }

    render() {
        return (
            <View style={this.props.style}>
                {this.mapInterpolateToRender()}
            </View>
        );
    }
}
export default class FlatListAni extends Component {
    constructor(props) {
        super(props)
        this.progressValue = new Animated.Value(0)
        this.totalCountData = Array.isArray(this.props.data) ? this.props.data.length : 10
        this.duration = this.props.duration || 1000
        this.clock = new Clock()
        this.state = {
            type: this.props.type || TYPE_ANIMATION.FADE_IN,
            hoverComponent: null,
            indexHover: null,
            fullData: this.props.data,
            data: this.props.data.slice(0, 20)
        }
        this.stateAni = new Animated.Value(State.UNDETERMINED)
        this.needReset = new Value(0)
    }
    onEndReachedCalledDuringMomentum = true
    page = 1
    size = 20
    contentOffsetY = new Value(0)
    stateAniHover = new Value(State.UNDETERMINED)
    hoverComponentTranslate = new Value(0)
    hoverComponentOpacity = new Value(0)
    refViewWrapperHover = React.createRef()
    refDragFlatList = React.createRef()
    refViewWrapper = React.createRef()
    pageYViewWrapperHover = 0
    cellDataCopy = []
    componentDidMount() {
        this.stateAni.setValue(State.ACTIVE)
        // setTimeout(() => {
        //     this.refViewWrapper.current && this.refViewWrapper.current.measure((x, y, width, height, pageX, pageY) => {
        //         this.pageYViewWrapperHover = pageY
        //     })
        // }, 300);
    }
    componentWillReceiveProps(nextProps) {
        if (this.props.data !== nextProps.data) {
            // this.stateAni.setValue(State.ACTIVE)
            this.setState({
                fullData: nextProps.data,
                data: nextProps.data.slice(0, (this.page + 1) * this.size)
            })
        }
    }
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
    dragGoToTop = ({ item, index, isActive, ...rest }) => {
        const hoverComponent = this.renderItem({ item, index, isActive, fromHover: true })
        this.setState({
            hoverComponent,
            indexHover: `${item['exchange']}#${item['symbol']}`
        }, () => {
            this.hoverComponentOpacity.setValue(1)
            this.hoverComponentTranslate.setValue(rest.pageY - this.pageYViewWrapperHover)
            this.stateAniHover.setValue(State.ACTIVE)
        })
    }
    renderHoverComponent = () => {
        const { hoverComponent } = this.state;
        return (
            <Animated.View
                pointerEvents={'none'}
                style={[
                    {
                        position: 'absolute',
                        bottom: 0,
                        top: 0,
                        left: 0,
                        right: 0,
                        overflow: 'hidden',
                        opacity: this.hoverComponentOpacity
                    }
                ]}
            >

                <Animated.View
                    style={{
                        opacity: this.hoverComponentOpacity,
                        transform: [
                            {
                                translateY: block([
                                    cond(eq(this.stateAniHover, State.ACTIVE), set(this.hoverComponentTranslate, timing({
                                        from: this.hoverComponentTranslate, to: this.contentOffsetY, duration: 300
                                    })))
                                ])
                            }
                        ]
                    }}
                >
                    {hoverComponent}
                </Animated.View>
            </Animated.View>
        );
    };
    renderItem = ({ index, item, drag, isActive, fromHover }) => {
        const WrapperComp = index <= 10 ? SquenceView : View
        return (
            <WrapperComp
                key={`${item.exchange}#${item.symbol}`}
                progressValue={this.progressValue}
                duration={this.duration}
                type={this.state.type}
                index={index}
                totalCountData={this.props.data.length}
            >
                <RowSymbol
                    isActive={isActive}
                    dragGoToTop={this.dragGoToTop}
                    onLongPress={drag}
                    index={index}
                    key={`${item.exchange}#${item.symbol}`}
                    item={item}
                />
            </WrapperComp>
        )
    }
    handleDoneGoToTop = () => {
        const tmp = this.props.data.filter((item, key) => {
            return `${item['exchange']}#${item['symbol']}` !== this.state.indexHover
        })
        const itemGoToTop = this.props.data.find((item, key) => {
            return `${item['exchange']}#${item['symbol']}` === this.state.indexHover
        })
        const newData = [itemGoToTop, ...tmp]

        //
        // const cellDataCopy = [...this.refDragFlatList.current.cellData]
        // if (cellDataCopy.length !== this.cellDataCopy.length) {
        //     this.cellDataCopy = cellDataCopy
        // }
        // if (this.cellDataCopy.length) {
        //     for (let i = 0; i < newData.length; i++) {
        //         if (this.cellDataCopy[i]) {
        //             let indexVal = this.cellDataCopy[i][1];
        //             const key = this.props.keyExtractor(newData[i], i);
        //             this.refDragFlatList.current.cellData.set(key, indexVal)
        //         }
        //     }
        // }
        //
        this.setState({
            hoverComponent: null,
            indexHover: null
        })
        this.props.updatePriceBoard({
            ...this.props.priceBoard,
            value: newData
        })
    }
    handleDragEnd = ({ data }) => {
        this.props.updatePriceBoard({
            ...PriceBoardModel.getPriceBoardCurrentPriceBoard(),
            value: data
        })
    }
    handleScrollEndDrag = (e) => {
        let contentOffsetY = e.nativeEvent.contentOffset.y
        console.info(contentOffsetY)
        if (contentOffsetY > 60) {
            contentOffsetY = 60 + 8
        }
        if (contentOffsetY <= 0) {
            contentOffsetY = 0
        }
        console.info(contentOffsetY)
        this.contentOffsetY.setValue(-1 * contentOffsetY)
    }
    handleScrollToTop = () => {
        this.refDragFlatList.current && this.refDragFlatList.current.scrollToIndex({
            index: 0
        })
    }
    handleLoadMore = () => {
        if (!this.onEndReachedCalledDuringMomentum) {
            this.onEndReachedCalledDuringMomentum = true;
            this.timeoutLoadMore && clearTimeout(this.timeoutLoadMore)
            if (this.stillLoadmore) return
            this.stillLoadmore = true
            let newData = this.state.fullData.slice(0, (this.page + 1) * this.size)
            this.page = this.page + 1
            console.info('DCM new Data', newData)
            this.setState({
                data: newData
            }, () => {
                this.stillLoadmore = false
            })
        }
    }
    render() {
        return (
            <View
                renderToHardwareTextureAndroid={true}
                collapsable={false}
                style={{
                    flex: 1
                }}
                ref={this.refViewWrapper}
            >
                <PureFunction>
                    <Animated.Code exec={block([
                        cond(not(clockRunning(this.clock)), [

                        ], [
                            cond(eq(this.needReset, 1), [
                                set(this.needReset, 0),
                                stopClock(this.clock)
                            ], [])
                        ]),
                        cond(eq(this.stateAni, State.ACTIVE), [
                            set(this.progressValue, timing({
                                clock: this.clock,
                                from: 0,
                                to: 1000,
                                duration: 1000
                            })),
                            cond(eq(this.progressValue, 1000), [set(this.stateAni, State.UNDETERMINED)])
                        ]),
                        call([this.progressValue], ([a]) => { })
                    ])} />
                </PureFunction>

                <DraggableFlatList
                    {...this.props}
                    data={this.state.data}
                    renderItem={this.renderItem}
                    ref={this.refDragFlatList}
                    onScrollEndDrag={this.handleScrollEndDrag}
                    onEndReached={() => {
                        this.handleLoadMore()
                    }}
                    onMomentumScrollBegin={() => {
                        this.onEndReachedCalledDuringMomentum = false
                    }}
                    onEndReachedThreshold={0.5}
                    onDragEnd={this.handleDragEnd}
                />
                {/* {this.renderHoverComponent()}
                <HandleAniatedHover
                    handleScrollToTop={this.handleScrollToTop}
                    hoverComponentOpacity={this.hoverComponentOpacity}
                    contentOffsetY={this.contentOffsetY}
                    callBackDone={this.handleDoneGoToTop}
                    stateAni={this.stateAniHover}
                    hoverComponentTranslate={this.hoverComponentTranslate}
                /> */}
            </View>
        )
    }
}
const HandleAniatedHover = React.memo(({
    hoverComponentOpacity,
    hoverComponentTranslate,
    stateAni,
    contentOffsetY,
    callBackDone,
    handleScrollToTop
}) => {
    return (
        <Animated.Code exec={block([
            cond(and(eq(hoverComponentTranslate, contentOffsetY), eq(stateAni, State.ACTIVE)), [call([hoverComponentTranslate], ([a]) => {
                stateAni.setValue(State.UNDETERMINED)
                handleScrollToTop && handleScrollToTop()
                return callBackDone()
            })])
        ])} />
    )
}, () => true)
const PureFunction = React.memo(({
    children
}) => {
    return (
        <React.Fragment>
            {children}
        </React.Fragment>
    )
}, () => true)
