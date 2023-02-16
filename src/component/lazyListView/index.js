import _ from 'lodash';
import React, { Component, useState, useEffect } from 'react';
import { ScrollView as RNScrollView } from 'react-native';
import Animated from 'react-native-reanimated';

import MemoItem from './Items';
import BlockAnimated, {
    useVelocity,
    useBatch,
    userTimer
} from './BlockAnimated';

import { HEIGHT_SEPERATOR, HEIGHT_ROW } from '~s/watchlist/enum';

const ScrollView = Animated.createAnimatedComponent(RNScrollView);

const { Value, call } = Animated;

export const BATCH = 10;

export const MAX_LOADING = 16; // de so chan cho de => size loading items

export const defaultData = _.range(MAX_LOADING);
export const TOTAL_DURATIONS = 1000; // time first animations done
export const DURATIONS = 300;

export default ({ data, renderItem, renderHeader, renderFooter, ...props }) => {
    // #region state
    const [_scrollValue] = useState(() => new Value(0));
    const [endTag, setEndTag] = useState(0);
    const [page, setPage] = useState(MAX_LOADING);
    const [firstIndex, setFirstIndex] = useState(0);
    const [lastIndex, setLastIndex] = useState(0);
    // #endregion

    // #region animated
    const [_velocity, velocityBlock] = useVelocity(_scrollValue);
    const [_firstIndex, _lastIndex, batchBlock] = useBatch({
        _scrollValue,
        _heightRow: HEIGHT_ROW + HEIGHT_SEPERATOR,
        _velocity,
        // onChange: () => null
        onChange: ([firstIndex, lastIndex]) => {
            setFirstIndex(firstIndex);
            setLastIndex(lastIndex);
        }
    });
    const [_endTag, _timming, timerBlock] = userTimer(() => null);
    // #endregion
    const size = _.size(data);
    useEffect(() => {
        let timer = null;
        if (endTag && page < size) {
            timer = setTimeout(() => {
                setPage((page) => page + 2);
            }, 1);
        }
        return () => timer && clearTimeout(timer);
    }, [page, endTag]);

    const onScroll = Animated.event([
        {
            nativeEvent: { contentOffset: { y: _scrollValue } }
        }
    ]);

    const curData = _.take(data, page);
    return (
        <React.Fragment>
            {!_.isEmpty(data) && (
                <BlockAnimated
                    exec={[
                        velocityBlock,
                        batchBlock,
                        timerBlock,
                        call([_endTag], ([p]) => {
                            p !== endTag && setEndTag(p);
                        })
                    ]}
                />
            )}

            <ScrollView {...props} onScroll={onScroll}>
                {renderHeader && renderHeader()}
                {_.map(curData, (item, index) => (
                    <MemoItem
                        firstIndex={firstIndex}
                        lastIndex={lastIndex}
                        endTag={endTag}
                        _timming={_timming}
                        index={index}
                        item={item}
                        key={item.symbol || index}
                        renderItem={renderItem}
                    />
                ))}
                {renderFooter && renderFooter()}
            </ScrollView>
        </React.Fragment>
    );
};
