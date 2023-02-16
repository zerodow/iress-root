import React from 'react';
import _ from 'lodash';
import Animated from 'react-native-reanimated';

import { MAX_LOADING } from './';
import { AnimatedItem } from './BlockAnimated';

export const Item = ({
    item,
    index,
    renderItem,
    _timming,
    firstIndex,
    lastIndex,
    endTag
}) => {
    // const [curLoading, setCurLoading] = React.useState(() => isLoading);

    // React.useEffect(() => {
    //     let timer = null;
    //     if (curLoading !== isLoading) {
    //         timer = setTimeout(() => {
    //             setCurLoading(isLoading);
    //         }, index);
    //     }

    //     return () => timer && clearTimeout(timer);
    // }, [isLoading]);

    const content = renderItem({
        item,
        index,
        isLoading: index < firstIndex || index > lastIndex
    });
    if (index < MAX_LOADING && !endTag) {
        return (
            <AnimatedItem _timming={_timming} index={index}>
                {content}
            </AnimatedItem>
        );
    }

    return content;
};

const MemoItem = React.memo(
    Item,
    ({ item }, { item: nextItem, index, firstIndex, lastIndex, endTag }) => {
        return (
            _.isEqual(item, nextItem) &&
            (index < firstIndex || index > lastIndex || !endTag)
        );
    }
);

export default MemoItem;
