import React from 'react'
import { StyleSheet } from 'react-native'
import Animated from 'react-native-reanimated';

import {
    FlatList,
    LongPressGestureHandler,
    PanGestureHandler,
    TapGestureHandler
} from 'react-native-gesture-handler';

// import { SortableMultilist } from 'react-native-sortable-multilist';
import SortableMultilist from './SortableList.lib'

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);
export default class SortableList extends SortableMultilist {
    render() {
        const { keyExtractor } = this.props;
        const { dataWithId, initialSetupFinished } = this.state;
        if (!dataWithId.length) {
            return null;
        }
        const enabled = initialSetupFinished === 1;
        // const enabled = false
        return (
            <TapGestureHandler
                ref={this.tapRef}
                onHandlerStateChange={this.onTapStateChange}
                simultaneousHandlers={[this.longPressRef, this.panGestureRef]}
                maxDist={10000}
                enabled={enabled}
            >
                <Animated.View
                    style={[styles.flexContainerOverflow]}
                >
                    <LongPressGestureHandler
                        ref={this.longPressRef}
                        minDurationMs={500}
                        onHandlerStateChange={this.onLongPress}
                        simultaneousHandlers={[this.panGestureRef, this.tapRef]}
                        maxDist={10000}
                        enabled={enabled}
                    >
                        <Animated.View style={[styles.flexContainer]}>
                            <PanGestureHandler
                                ref={this.panGestureRef}
                                activeOffsetY={[-15, 15]}
                                onGestureEvent={this.onGestureEvent}
                                onHandlerStateChange={this.onGestureEvent}
                                simultaneousHandlers={[this.tapRef, this.longPressRef]}
                                enabled={enabled}
                            >
                                <Animated.View style={[styles.flexContainer]}>
                                    <AnimatedFlatList
                                        ref={this.flatListRef}
                                        onScroll={this.onScroll}
                                        onLayout={this.handleFlatListLayout}
                                        data={dataWithId}
                                        renderItem={this.draggableRenderItem}
                                        keyExtractor={keyExtractor}
                                        onContentSizeChange={this.setScrollLowerBound}
                                        removeClippedSubviews={false}
                                        scrollEventThrottle={16}
                                        scrollEnabled={enabled}
                                        renderListFooter={this.props.renderListFooter}
                                    />
                                </Animated.View>
                            </PanGestureHandler>
                        </Animated.View>
                    </LongPressGestureHandler>
                </Animated.View>
            </TapGestureHandler>
        )
    }
}

const styles = StyleSheet.create({
    flexContainer: {
        flex: 1,
        width: '100%'
    },
    flexContainerOverflow: {
        flex: 1,
        width: '100%',
        overflow: 'hidden'
    }
});
