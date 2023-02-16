import React, { useEffect, useState, useCallback, useReducer, useMemo, useRef } from 'react'
import { View, Text, TouchableOpacity, Dimensions, StyleSheet, LayoutAnimation, UIManager, Platform } from 'react-native'
import Animated from 'react-native-reanimated'
import Immutable from 'seamless-immutable';
import PropTypes from 'prop-types'
import { initState, reducer, TYPE, mapInitState } from './reducer'
import { PanGestureHandler, State, FlatList } from 'react-native-gesture-handler'
import { DIRECTION, useDetectedDirectionY, useReleaseTouched, useLog } from './AnimatedHandle'
import { findIndexActive, extraData } from './HandleData'
import { useInitData, useInitCellData, useInitGestureValue, useViewabilityConfig } from './Hook'
import {
    ReText,
    clamp,
    onGestureEvent,
    snapPoint,
    onScrollEvent,
    timing
} from '~/lib/redash';
if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}
const ITEM_HEIGHT = 68
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);
const { height: heightDevices } = Dimensions.get('window')
const { Value, defined, eq, not, neq, set, call, onChange, block, useCode, cond, add, divide, round, diff, greaterThan, greaterOrEq, lessThan, multiply, sub, and, or, abs, lessOrEq, floor } = Animated
const Alpha = ['A', 'B', 'C', 'D', 'E']
const exampleData = [...Array(5)].map((d, index) => ({
    key: `item-${index}`, // For example only -- don't use index as your key!
    label: index,
    backgroundColor: `rgb(${Math.floor(Math.random() * 255)}, ${index *
        5}, ${132})`
}));

const Item = ({ item, index, isHover = false, onDrag, isActive, renderItem, onSnapToTop }) => {
    useEffect(() => {
        // console.info('mount isActive', item.key, index)
    }, [])

    const onSnapToTopCb = useMemo(() => {
        return () => onSnapToTop && onSnapToTop({ item, index })
    }, [])
    return useMemo(() => {
        console.info('render isActive', item.key, index)
        return (
            <View style={{
                height: ITEM_HEIGHT,
                // backgroundColor: index % 2 === 0 ? 'red' : 'blue',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: isActive ? 0 : 1
            }}>
                {
                    renderItem && renderItem({ item, isHover, index, dragGoToTop: onSnapToTopCb, onDrag: () => onDrag(item, index) })
                }
            </View>
        )
    }, [isActive])
}
const Index = ({
    heightRow = ITEM_HEIGHT,
    keyExtractor = (item, index) => `${index}`,
    data = [],
    renderItem: forwardRenderItem,
    onChangeKeyTopIndex = () => { },
    onDragEnd = () => { }
}) => {
    const [state, dispatch] = useReducer(reducer, initState, (state) => mapInitState(state, { data: data }))
    const dic = useRef({
        data: data,
        viewableItems: [],
        listViewHeightAni: new Value(0)
    })
    const refFlatList = useRef()
    const [indexDistance, hoverIndex, isMoveUp] = useInitData()
    const [panState, translationY, translateYOffset, absoluteY, velocityY, contentOffsetY] = useInitGestureValue()
    const gestureHandler = onGestureEvent({ state: panState, translationY, absoluteY, velocityY });
    const scrollEvent = onScrollEvent({ y: contentOffsetY })
    const [cellData] = useInitCellData({
        data: state.data,
        heightRow,
        keyExtractor
    })
    const createHover = () => {
        return (
            <View style={{
                height: 68,
                width: '100%',
                backgroundColor: 'red'
            }} />
        )
    }
    const onDrag = useCallback((item, index) => {
        const hoverComponent = renderItem({
            item, index, isHover: true
        })

        refFlatList.current && refFlatList.current.setNativeProps({ scrollEnabled: false })
        dispatch({
            type: TYPE.CHANGE_HOVER_COMPONENT,
            payload: {
                hoverComponent,
                item
            }
        })
    }, [])
    /**
     * Bat dau thuc hien snap item to top
     */
    const handleSnapToTop = useCallback(({ item }) => {
        const key = keyExtractor(item)
        let activeItem = null
        let activeIndex = null

        dic.current.viewableItems.forEach((element, index) => {
            if (keyExtractor(element.item) === key) {
                activeItem = element;
                activeIndex = index
            }
        });
        // mergeToTop({ activeIndex, activeItem })
        handleSwapSpecifyItemToTop({ item: activeItem })
    }, [])
    /**
     * Khi DragGoToTop. Noi dung da cuon xuong duoi thi chi swap trong list viewableItems
     * khi Swap xong item tren cung trong khung nhin se kiem tra new item do chua phai la item dau tien thi thuc hien mot buoc de swap item do ve dau danh sach
     */
    const handleUpdateViewItemChange = useCallback(() => {
        dic.current.viewableItems = dic.current.viewableItems.map((el) => {
            const index = el.index
            const newItem = dic.current.data[index]
            return {
                index,
                item: newItem,
                key: newItem.key,
                isViewable: el.isViewable
            }
        })
    }, [])
    const handleSwapSpecifyItemToTop = useCallback(({ item }) => {
        const topItem = dic.current.data[0]
        if (topItem.key === item.key) return
        const data = dic.current.data
        let tmp = data.filter(el => el.key !== item.key)
        // tmp = Immutable([item.item]).concat(tmp)
        tmp = [item.item].concat(tmp)
        dic.current.data = tmp
        handleUpdateViewItemChange({ item })
        refFlatList.current._component.scrollToOffset({ y: 0 })
        contentOffsetY.setValue(0)
        onChangeKeyTopIndex({ keyTopIndex: item.key, newData: dic.current.data })
        dispatch({
            type: TYPE.CHANGE_DATA,
            payload: {
                data: tmp
            }
        })
    }, [])
    /**
     * Thuc hien merge 2 item lien tiep tu duoi len tren cho den khi het thi dung
     */
    const mergeToTop = useCallback(({ activeIndex, activeItem }) => {
        // Khi swap den cuoi thi return
        if (activeIndex <= 0) return handleSwapSpecifyItemToTop({ item: activeItem })
        // merge({ indexStart: activeIndex - 1, indexEnd: activeIndex })
        // mergeToTop({ activeIndex: activeIndex - 1, activeItem })
        setTimeout(() => {
            merge({ indexStart: activeIndex - 1, indexEnd: activeIndex })
            mergeToTop({ activeIndex: activeIndex - 1, activeItem })
        }, 50);
    }, [])
    /**
     * Thu hien swap cac item trong viewableItems vao merge no vao list danh sach
     */
    const merge = useCallback(({ indexStart = 4, indexEnd = 5 }) => {
        const { leftData, rightData } = extraData({ data: dic.current.data, viewableItems: dic.current.viewableItems })
        const data = dic.current.viewableItems
        if (data.length <= indexEnd || indexStart < 0) return // keo qua xuong bottom hoac top
        const left = data.slice(0, indexStart)
        const mid = data.slice(indexStart, indexEnd - 1)
        const end = data.slice(indexEnd + 1, data.length)

        const itemTop = { ...data[indexStart], index: data[indexEnd].index }
        const itemBottom = { ...data[indexEnd], index: data[indexStart].index }

        let newData = [...left, itemBottom, ...mid, itemTop, ...end]
        dic.current.viewableItems = newData

        newData = newData.map(el => ({ ...el.item }))

        newData = [...leftData, ...newData, ...rightData]
        dic.current.data = newData

        handleUpdateKeyTopIndex({ itemTop, itemBottom })
        dispatch({
            type: TYPE.CHANGE_DATA,
            payload: {
                data: newData
            }
        })
    }, [])
    /**
     * Update key top Index len redux de check hien thi cho item DragToTop
     */
    const handleUpdateKeyTopIndex = useCallback(({ itemTop, itemBottom }) => {
        const tmp = dic.current.data[0]
        if (tmp.key === itemBottom.key) {
            onChangeKeyTopIndex({ keyTopIndex: itemBottom.key, newData: dic.current.data })
        }
    }, [])
    const renderItem = useCallback(({ item, index, isHover = false }) => {
        return (
            <Item
                renderItem={forwardRenderItem}
                {...{ item, index, isHover, onDrag, state, isActive: item.key === state.item.key, onSnapToTop: handleSnapToTop }}
            />
        )
    }, [state.item.key])
    const renderHoverRow = useCallback(() => {
        if (!state.hoverComponent) return <View pointerEvents={'none'} style={[StyleSheet.absoluteFillObject]} />
        const key = keyExtractor(state.item)
        // Find index when start touched
        const { activeIndex: activeIndexValue, activeItem } = findIndexActive({
            item: state.item,
            viewableItems: dic.current.viewableItems,
            keyExtractor
        })
        const offset = cellData.get(key).offsetY

        // Map padding Top cho hover comp
        const value = clamp(add(sub(offset, contentOffsetY), translationY), 0, sub(dic.current.listViewHeightAni, ITEM_HEIGHT))

        // Check xem poisition touched dang o tren hay duoi vi tri bat dau touched
        const isTopActiveItem = cond(lessOrEq(translationY, 0), 1, 0)

        // Khoang cach di chuyen tinh tu item start touched
        const distance = block(
            cond(
                eq(isMoveUp, DIRECTION.UP),
                cond(
                    eq(isTopActiveItem, 1),
                    add(translationY, -ITEM_HEIGHT / 2),
                    add(translationY, ITEM_HEIGHT / 2)
                ),
                cond(
                    eq(isTopActiveItem, 1),
                    add(translationY, -ITEM_HEIGHT / 2),
                    add(translationY, ITEM_HEIGHT / 2)
                )
            )
        )
        const deltal = cond(
            eq(isTopActiveItem, 1),
            multiply(floor(abs(divide(
                distance,
                ITEM_HEIGHT
            ))), -1),
            floor(divide(
                distance,
                ITEM_HEIGHT
            )))
        let detalValue = 0
        return (
            <Animated.View pointerEvents={'box-none'} style={[StyleSheet.absoluteFillObject, {
                transform: [
                    {
                        translateY: value
                    }
                ]
            }]}>
                {!!state.hoverComponent && state.hoverComponent}
                <Animated.Code exec={block([
                    // Version 1.2 eq,neq, eval -0.0 not eq 0.0
                    onChange(deltal, block([
                        cond(
                            eq(isMoveUp, DIRECTION.UP),
                            call([deltal], ([a]) => {
                                const index = activeIndexValue + a
                                console.info('swap UP', index, index + 1)
                                detalValue !== a && merge({
                                    indexStart: index, indexEnd: index + 1
                                })
                                detalValue = a
                            }),
                            call([deltal], ([a]) => {
                                const index = activeIndexValue + a
                                console.info('swap Down', index - 1, index)
                                detalValue !== a && merge({
                                    indexStart: index - 1, indexEnd: index
                                })
                                detalValue = a
                            })
                        )

                    ]))
                ])} />
            </Animated.View>
        )
    }, [state.hoverComponent])

    const viewabilityConfig = useViewabilityConfig()
    const onViewableItemsChanged = useCallback(({
        viewableItems, changed
    }) => {
        dic.current.viewableItems = viewableItems
    }, [])

    const getItemLayout = useCallback((data, index) => (
        { length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index }
    ), [])
    const renderList = useMemo(() => {
        return (
            <AnimatedFlatList
                showsVerticalScrollIndicator={false}
                ref={refFlatList}
                updateCellsBatchingPeriod={30}
                // getItemLayout={getItemLayout}
                // viewabilityConfig={viewabilityConfig}
                // scrollEnabled={!state.hoverComponent}
                keyExtractor={keyExtractor}
                onScroll={scrollEvent}
                renderItem={renderItem}
                onMomentumScrollEnd={scrollEvent}
                onScrollEndDrag={scrollEvent}
                onViewableItemsChanged={onViewableItemsChanged}
                data={state.data} />
        )
    }, [state.data, state.hoverComponent])
    // Handle When user un touched
    const onRelease = useCallback(() => {
        hoverIndex.setValue(-1)
        translateYOffset.setValue(0)
        translationY.setValue(0)
        panState.setValue(State.UNDETERMINED)
        refFlatList.current && refFlatList.current.setNativeProps({ scrollEnabled: true })
        dispatch({
            type: TYPE.CHANGE_HOVER_COMPONENT,
            payload: {
                hoverComponent: null,
                item: {}
            }
        })
        onDragEnd && onDragEnd(dic.current.data)
    }, [state.hoverComponent])
    const onLayoutWrapperView = useCallback((e) => {
        const height = e.nativeEvent.layout.height
        dic.current.listViewHeightAni.setValue(height)
    }, [])
    useReleaseTouched({ panState, cbRelease: onRelease })
    useDetectedDirectionY({ translationY, isMoveUp })
    useEffect(() => {
        dic.current.data = data
        dispatch({
            type: TYPE.CHANGE_DATA,
            payload: {
                data: data
            }
        })
    }, [data])
    useCode(block([
        onChange(contentOffsetY, block([
            useLog({
                nodes: [contentOffsetY],
                cb: ([a]) => {

                }
            })
        ]))
    ]), [])
    return (
        <PanGestureHandler {...gestureHandler}>
            <Animated.View
                onLayout={onLayoutWrapperView}
                style={{
                    flex: 1
                }}>
                {renderList}
                {renderHoverRow()}
            </Animated.View>
        </PanGestureHandler>
    )
}
Index.propTypes = {}
Index.defaultProps = {}
export default Index
