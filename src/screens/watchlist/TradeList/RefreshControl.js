import React, { useState, useCallback } from 'react';
import Animated from 'react-native-reanimated';

import {
    StyleSheet,
    Platform,
    RefreshControl as RNRefresh
} from 'react-native';
import * as Controller from '~/memory/controller';

import { STATE } from '~s/watchlist/enum';

const {
    block,
    set,
    cond,
    greaterThan,
    lessThan,
    and,
    call,
    eq,
    Value,
    or
} = Animated;

const useRefresh = (onRefreshData) => {
    return useCallback(() => {
        const isStreamer = Controller.isPriceStreaming();

        if (!isStreamer && onRefreshData) {
            onRefreshData();
        }
    }, [onRefreshData]);
};

let RefreshControl = ({ onRefresh }) => {
    const isStreamer = Controller.isPriceStreaming();
    const isLogin = Controller.getLoginStatus();
    if (!isStreamer && Platform.OS === 'android') {
        return (
            <RNRefresh
                progressViewOffset={isLogin ? 0 : 100}
                refreshing={false}
                onRefresh={onRefresh}
            />
        );
    }

    return undefined;
};

RefreshControl = React.memo(RefreshControl);

let RefreshAni = ({ _scrollValue, _gestureState, onRefresh }) => {
    const [_checkRefresh] = useState(() => new Value(0));
    return (
        <Animated.Code
            exec={block([
                cond(
                    and(
                        lessThan(_scrollValue, -100),
                        or(
                            eq(_gestureState, STATE.ON_MOMENTUM_END),
                            eq(_gestureState, STATE.ON_START)
                        )
                    ),
                    set(_checkRefresh, 1)
                ),
                cond(
                    and(greaterThan(_scrollValue, -5), _checkRefresh),
                    block([call([], onRefresh), set(_checkRefresh, 0)])
                )
            ])}
        />
    );
};

RefreshAni = React.memo(RefreshAni);

module.exports = {
    useRefresh,
    RefreshControl,
    RefreshAni
};

// export default (_scrollValue, _gestureState, onRefreshData) => {
//     return [
//         () => <RefreshControl onRefresh={onRefresh} />,
//         () => (
//             <AniOnRefresh
//                 _scrollValue={_scrollValue}
//                 _gestureState={_gestureState}
//                 onRefresh={onRefresh}
//             />
//         )
//     ];
// };

// const styles = StyleSheet.create({});
