import React, {
    Component,
    useState,
    useEffect,
    useImperativeHandle,
    forwardRef
} from 'react';
import _ from 'lodash';
import Animated from 'react-native-reanimated';

import BlockAnimated from './BlockAnimated';

export const MAX_LOADING = 10; // de so chan cho de => size loading items

const defaultData = _.range(MAX_LOADING);
const TOTAL_DURATIONS = 1000; // time first animations done
const DURATIONS = 300;

const { Value, cond, interpolate } = Animated;

const getOpacity = ({ _onEnd, _timming, index }) => {
    const delayItems = _.floor(TOTAL_DURATIONS / MAX_LOADING);
    const startTime = delayItems * index;
    const endTime = _.min([startTime + DURATIONS, TOTAL_DURATIONS]);

    return {
        opacity: cond(
            _onEnd,
            1,
            interpolate(_timming, {
                inputRange: [0, startTime, endTime, TOTAL_DURATIONS],
                outputRange: [0, 0, 1, 1]
            })
        )
    };
};

const AnimateItem = ({ _onEnd, _timming, index, children, onLayout }) => (
    <Animated.View
        onLayout={onLayout}
        style={getOpacity({ _onEnd, _timming, index })}
    >
        {children}
    </Animated.View>
);

const Item = ({
    item,
    index,
    onLayout,
    firstAni,
    renderItem,
    _onEnd,
    _timming
}) => {
    const content = renderItem({ item, index, isLoading: !item.isLoading });
    if (index < MAX_LOADING && !firstAni) {
        return (
            <AnimateItem
                _onEnd={_onEnd}
                _timming={_timming}
                index={index}
                onLayout={index === 0 && onLayout}
            >
                {content}
            </AnimateItem>
        );
    }

    return content;
};

const MemoItem = React.memo(Item, ({ item }, { item: nextItem }) =>
    _.isEqual(item, nextItem)
);

const wrapData = (data, { firstIndex, lastIndex }) =>
    _.map(data, (item, index) => {
        if (index >= firstIndex && index < lastIndex) {
            const obj = { ...item, isLoading: true };
            return obj;
        }
        return item;
    });

const MainList = (
    { _lastIndex, onFirstLoadEnd, data, onLayout, renderItem },
    ref
) => {
    const _onEnd = new Value(0);
    const _timming = new Value(0);

    const [firstAni, setFirtAni] = useState(false);
    const [page, setPage] = useState(MAX_LOADING);
    const [rendered, setRendered] = useState({ firstIndex: 0, lastIndex: 0 });

    const onFirstLoad = () => {
        setFirtAni(true);
        onFirstLoadEnd && onFirstLoadEnd();
    };

    const size = _.size(data);

    useEffect(() => {
        if (firstAni) {
            const timer = setTimeout(() => {
                page < size && setPage(page + 10);
            }, 1);

            return () => clearTimeout(timer);
        }
    }, [page, firstAni]);

    useImperativeHandle(ref, () => ({
        changeBatchRender: (firstIndex, lastIndex) => {
            setRendered({ firstIndex, lastIndex });
        }
    }));

    let curData = firstAni && size !== 0 ? _.take(data, page) : defaultData;
    curData = wrapData(curData, rendered);
    return (
        <React.Fragment>
            <BlockAnimated
                _lastIndex={_lastIndex}
                onScroll={() => null}
                onFirstLoadEnd={onFirstLoad}
                _onEnd={_onEnd}
                _timming={_timming}
            />
            {_.map(curData, (item, index) => (
                <MemoItem
                    key={item.symbol || index}
                    item={item}
                    renderItem={renderItem}
                    index={index}
                    onLayout={onLayout}
                    firstAni={firstAni}
                    _onEnd={_onEnd}
                    _timming={_timming}
                />
            ))}
        </React.Fragment>
    );
};

export default forwardRef(MainList);
