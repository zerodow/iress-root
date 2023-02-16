import React, {
    useState,
    useMemo,
    useImperativeHandle,
    forwardRef,
    useRef,
    useCallback,
    useEffect
} from 'react';
import { StyleSheet, ScrollView as RNScrollView, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import _ from 'lodash';

import { useInteracble } from './tradelist.interacble';
import {
    useTiming,
    createPanEvent,
    useGetIndex,
    useOldTrans,
    GESTURE_AXIS
} from './tradelist.hook';
import { useVelocity, useBatch } from '~/component/lazyListView/BlockAnimated';

import { HEIGHT_ROW } from '~s/watchlist/TradeList/tradeList.row';
import { HEIGHT_SEPERATOR } from '~s/watchlist/enum';

const { Value, block, event } = Animated;

const ScrollView = Animated.createAnimatedComponent(RNScrollView);

// const isClassComponent = (component) => {
//     return (
//         typeof component === 'function' &&
//         !!component.prototype.isReactComponent
//     );
// };

// const isFunctionComponent = (component) => {
//     return (
//         typeof component === 'function' &&
//         String(component).includes('return React.createElement')
//     );
// };

const isReactComponent = (component) => {
    return typeof component === 'function';
    // return isClassComponent(component) || isFunctionComponent(component);
};

const isElement = (element) => {
    return React.isValidElement(element);
};

const getComponent = (element, props) => {
    if (isReactComponent(element)) {
        return element(props);
    }
    if (isElement(element)) {
        return React.cloneElement(element, props);
    }

    if (element) return React.createElement(element, props);

    return null;
};

let BatchOnScroll = ({ _scrollValue, onViewableItemsChanged, heightRow }) => {
    const [_velocity, velocityBlock] = useVelocity(_scrollValue);

    const [_firstIndex, _lastIndex, batchBlock] = useBatch({
        _scrollValue,
        _heightRow: heightRow,
        _velocity,
        // onChange: () => null
        onChange: onViewableItemsChanged
    });

    return <Animated.Code exec={block([velocityBlock, batchBlock])} />;
};

BatchOnScroll = React.memo(BatchOnScroll);

let LoadingList = ({ onEnd, renderItem, numberItemRendered }) => {
    const duration = 1000;
    const data = _.range(numberItemRendered);
    const [_timer, finished, timerBlock] = useTiming(
        0,
        duration,
        duration,
        onEnd
    );

    return (
        <React.Fragment>
            <Animated.Code exec={timerBlock} />
            {_.map(data, (item, index) =>
                getComponent(renderItem, {
                    item,
                    index,
                    isLoading: true,
                    _timer
                })
            )}
        </React.Fragment>
    );
};

// LoadingList = forwardRef(LoadingList);
LoadingList = React.memo(LoadingList);

const getTransX = (_scrollValue, snapPoints) => {
    const [onGestureEvent, { _gesture, _pos, _state }] = useMemo(
        () => createPanEvent(GESTURE_AXIS.X_AXIS),
        []
    );
    const [_transIndex, _oldTransIndex] = useMemo(
        () => useGetIndex(Animated.add(_pos, _scrollValue), _state),
        []
    );

    const [[_translate, snapTo], setAni] = useState(() =>
        useInteracble(_gesture, _state, _transIndex, 'x', 'vx', {
            snapPoints
        })
    );

    useEffect(() => {
        const p = useInteracble(_gesture, _state, _transIndex, 'x', 'vx', {
            snapPoints
        });
        setAni(p);
    }, [snapPoints]);

    const _oldTranslate = useMemo(() => useOldTrans(_translate, _transIndex), [
        _translate
    ]);

    return [
        onGestureEvent,
        _oldTransIndex,
        _oldTranslate,
        _transIndex,
        _translate,
        snapTo
    ];
};

let VirtualList = (
    {
        data,
        renderItem,
        ListHeaderComponent,
        ListFooterComponent,
        ListEmptyComponent,
        onScroll,
        onViewableItemsChanged,
        keyExtractor,
        heightRow = HEIGHT_ROW + HEIGHT_SEPERATOR,
        isLoading,
        snapPoints,
        itemProps,
        ...props
    },
    ref
) => {
    // const _listLoading = useRef();
    // const _scroll = useRef();
    const numberItemRendered = 13;
    let heightContainer = 0;
    const _oldDataSize = useRef(0);
    const _scroll = useRef();
    const _scrollValue = useMemo(() => new Value(0), []);

    const [isRendering, setRendering] = useState(false);
    const [canLoadMore, setCanLoadMore] = useState(true);
    const [firstLoading, setFirstLoad] = useState(true);
    const [dataVirtual, setDataVirtual] = useState(false);
    const [batchIndex, setBatchIndex] = useState({
        startBatch: 0,
        endBatch: 0
    });

    const onScrollBlock = useMemo(
        () =>
            event([
                {
                    nativeEvent: { contentOffset: { y: _scrollValue } }
                }
            ]),
        []
    );
    const [
        onGestureEvent,
        _oldTransIndex,
        _oldTranslate,
        _transIndex,
        _translate,
        snapTo
    ] = getTransX(_scrollValue, snapPoints);

    useEffect(() => {
        const size = _.size(data);
        if (size !== _oldDataSize) {
            _oldDataSize.current = size;
            setCanLoadMore(true);
        }
    }, [data]);

    // handle load more
    useEffect(() => {
        if (isRendering) return;
        const size = _.size(dataVirtual);
        if (size !== _.size(data)) {
            const newDataVirtual = _.slice(data, 0, size + 100);
            if (canLoadMore || size === 0) {
                setDataVirtual(newDataVirtual);
                setCanLoadMore(false);
                setRendering(true);
            }
        }
    }, [data, canLoadMore, isRendering]);

    // handle update data
    useEffect(() => {
        if (isRendering) return;
        const size = _.size(dataVirtual);
        const newDataVirtual = _.slice(data, 0, size);

        if (!_.isEqual(dataVirtual, newDataVirtual)) {
            setDataVirtual(newDataVirtual);
            setRendering(true);
        }
    }, [data, isRendering]);

    useEffect(() => {
        !canLoadMore && setCanLoadMore(true);
    }, [batchIndex.endBatch]);

    useEffect(() => {
        setRendering(false);
    });

    useImperativeHandle(ref, () => ({
        refresetAll: () => {
            if (_scroll.current) {
                const node = _scroll.current.getNode();
                node.scrollTo({
                    y: 0,
                    animated: false
                });
            }
            // snapTo({ index: isIress ? 0 : 1 });
            setDataVirtual([]);
            setCanLoadMore(true);
            setFirstLoad(true);
        },
        resetInteractable: (isIress) => snapTo({ index: isIress ? 0 : 1 })
    }));

    const onEnd = useCallback(() => {
        setFirstLoad(false);
    }, []);

    let content = null;
    if (firstLoading || isLoading) {
        content = (
            <LoadingList
                // ref={_listLoading}
                numberItemRendered={numberItemRendered}
                onEnd={onEnd}
                renderItem={renderItem}
            />
        );
        heightContainer = numberItemRendered * heightRow;
    } else if (_.isEmpty(data)) {
        // heightContainer = '100%';
        content = getComponent(ListEmptyComponent);
    } else {
        content = _.map(dataVirtual, (item, index) => (
            <View key={keyExtractor(item, index)}>
                {getComponent(renderItem, {
                    ...itemProps,
                    _oldTransIndex,
                    _oldTranslate,
                    _transIndex,
                    _translate,
                    item,
                    index,
                    isInBatch:
                        index >= batchIndex.startBatch &&
                        index <= batchIndex.endBatch
                })}
            </View>
        ));
        heightContainer = _.size(dataVirtual) * heightRow;
    }

    const onViewableChanged = useCallback(([startBatch, endBatch]) => {
        setBatchIndex({ startBatch, endBatch });
    }, []);
    return (
        <React.Fragment>
            <BatchOnScroll
                _scrollValue={_scrollValue}
                heightRow={heightRow}
                onViewableItemsChanged={onViewableChanged}
            />
            <PanGestureHandler
                maxPointers={1}
                activeOffsetX={[-15, 15]}
                onGestureEvent={onGestureEvent}
                onHandlerStateChange={onGestureEvent}
            >
                <ScrollView
                    ref={_scroll}
                    {...props}
                    onScroll={onScroll || onScrollBlock}
                    scrollEventThrottle={1}
                    removeClippedSubviews={false}
                    showsVerticalScrollIndicator={false}
                    onRefresh={undefined}
                >
                    {getComponent(ListHeaderComponent)}

                    <View
                        style={{
                            height: heightContainer
                        }}
                    >
                        {content}
                    </View>
                    {getComponent(ListFooterComponent)}
                </ScrollView>
            </PanGestureHandler>
        </React.Fragment>
    );
};

VirtualList = forwardRef(VirtualList);
export default VirtualList;
