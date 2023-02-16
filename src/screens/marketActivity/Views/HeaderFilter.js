import React, { useRef, useState, useEffect, useMemo, useCallback, useImperativeHandle, useLayoutEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import _ from 'lodash';
import Animated, { Easing } from 'react-native-reanimated';
import { useDispatch } from 'react-redux';

import HeaderSelecter from '~/screens/marketActivity/Components/HeaderSelecter.js';
import { useShadow } from '~/component/shadow/SvgShadow';
import CommonStyle from '~/theme/theme_controller';
import { useAppState, useNavigator } from '~s/watchlist/TradeList/tradelist.hook';
import TabView from '~/component/tabview4/'
import MarketDataStreaming from '~/screens/marketActivity/MarketDataStreaming.js'
import { getAnimationTypeByIndex } from '~/screens/orders/Controller/AnimationController.js'
import { changeAnimationType } from '~/component/loading_component/Redux/actions.js'
import { clearInteractable } from '~/screens/marketActivity/Models/MarketActivityModel.js'
import * as Controller from '~/memory/controller'
import Enum from '~/enum'
import * as ManageAppState from '~/manage/manageAppState';
import ScreenId from '~/constants/screen_id';

const { ANIMATION_TYPE } = Enum
const { multiply, Value, cond, block, debug } = Animated;

const TABS1 = {
    ADVANCERS: 'Gainers',
    DECLINERS: 'Losers',
    VALUE: 'Value',
    VOLUME: 'Volume'
};
const TABS1_INDEX = {
    ADVANCERS: 0,
    DECLINERS: 1,
    VALUE: 2,
    VOLUME: 3
}
const TABS2 = {
    POINTS: 'Points',
    PERCENT: 'Percent'
};
const TABS2_INDEX = {
    POINTS: 0,
    PERCENT: 1
}
export const GROUP = {
    PERCENT_UP: 'PERCENT_UP',
    PERCENT_DOWN: 'PERCENT_DOWN',
    VOLUME: 'VOLUME',
    VALUE: 'VALUE',
    POINTS_UP: 'POINTS_UP',
    POINTS_DOWN: 'POINTS_DOWN'
};
const ENUMTAB = {
    TAB1: ['ADVANCERS', 'DECLINERS', 'VALUE', 'VOLUME'],
    TAB2: ['POINTS', 'PERCENT']
}
export const useLayout = () => {
    const [h] = useState(() => new Value(0));

    const onLayout = useCallback((event) => {
        h.setValue(-event.nativeEvent.layout.height);
    }, []);

    return [h, onLayout];
};

const useTabsSelected = (firstTabs, secondTabs) => {
    const [result, setResult] = useState('');
    useEffect(() => {
        const firstItem = TABS1[firstTabs];
        const secondItem = TABS2[secondTabs];

        let groupKey = '';
        if (firstItem === TABS1.ADVANCERS) {
            if (secondItem === TABS2.POINTS) {
                groupKey = GROUP.POINTS_UP;
            } else {
                groupKey = GROUP.PERCENT_UP;
            }
        } else if (firstItem === TABS1.DECLINERS) {
            if (secondItem === TABS2.POINTS) {
                groupKey = GROUP.POINTS_DOWN;
            } else {
                groupKey = GROUP.PERCENT_DOWN;
            }
        } else if (firstItem === TABS1.VALUE) {
            groupKey = GROUP.VALUE;
        } else if (firstItem === TABS1.VOLUME) {
            groupKey = GROUP.VOLUME;
        }

        setResult(groupKey);
    }, [firstTabs, secondTabs]);

    return result;
};

export const useTabs = () => {
    const [exchange, setExchange] = useState();
    const [marketGroup, setMarketGroup] = useState();
    const onSelected = ({ exchange, marketGroup }) => {
        // ref.current.exchange = exchange && exchange.exchange;
        // ref.current.marketGroup = marketGroup && marketGroup.market_group;
        setExchange(exchange && exchange.exchange);
        setMarketGroup(marketGroup && marketGroup.market_group);
    };

    return [exchange, marketGroup, onSelected];
};

const listData1 = [
    {
        label: 'Gainers'
    },
    {
        label: 'Losers'
    },
    {
        label: 'Value'
    },
    {
        label: 'volume'
    }
]

const listData2 = [
    {
        label: 'Points'
    },
    {
        label: 'percent'
    }
]
const HeaderFilter = React.forwardRef(({ navigator }, ref) => {
    const _header = useRef(true);

    const getSnapshot = useRef();

    const dispatch = useDispatch();
    const [exchange, marketGroup, onSelected] = useTabs();

    // #region  handle group
    const [firstTabs, setFirstTabs] = useState(() => ENUMTAB.TAB1[0]);
    const onTabsChange1 = useCallback((key) => setFirstTabs(key), []);

    const [secondTabs, setSecondTabs] = useState(() => ENUMTAB.TAB2[0]);
    const onTabsChange2 = useCallback((p) => p && setSecondTabs(p), []);

    const groupKey = useTabsSelected(firstTabs, secondTabs);
    // #endregion

    // #region  get Snapshot
    getSnapshot.current = () =>
        Controller.getLoginStatus() &&
        groupKey &&
        exchange &&
        marketGroup &&
        dispatch.marketActivity.getMarketWatchlist({
            exchange,
            marketGroup,
            watchlist: groupKey
        }) && _header.current && _header.current.measureItem();

    useImperativeHandle(ref, () => ({
        reloadApp: getSnapshot.current
    }))
    useEffect(() => {
        dispatch.marketActivity.resetDataMarket();
        getSnapshot.current();
    }, [exchange, marketGroup, groupKey]);
    // #endregion

    return (
        <View>
            <MarketDataStreaming {...{ exchange, marketGroup, watchlist: groupKey }} />
            <HeaderSelecter ref={_header} onSelected={onSelected} />
            <TabFilter {...{ onTabsChange1, onTabsChange2, firstTabs, secondTabs, navigator }} />
        </View >
    );
})
const TabFilter = React.memo(({ onTabsChange1, onTabsChange2, firstTabs, secondTabs, navigator }) => {
    const [Shadow, onLayout] = useShadow()
    const [Shadow2, onLayout2] = useShadow()
    const dispatch = useDispatch();
    useNavigator(navigator, {
        willAppear: () => {

        },
        didAppear: () => {

        },
        didDisappear: () => {
            dispatch(changeAnimationType(ANIMATION_TYPE.FADE_IN_SPECIAL))
        }
    });

    return (
        <React.Fragment>
            <View style={{ zIndex: 222 }}>
                <Shadow />
                <View onLayout={onLayout} style={{ zIndex: 10 }}>
                    <TabView
                        tabs={listData1}
                        activeTab={0}
                        onChangeTab={(i, preIndex, currentIndex) => {
                            clearInteractable()
                            dispatch(changeAnimationType(getAnimationTypeByIndex({ preIndex: preIndex, nextIndex: currentIndex })))
                            onTabsChange1(ENUMTAB.TAB1[i])
                        }}
                        wrapperStyle={{
                            backgroundColor: CommonStyle.color.dark,
                            justifyContent: 'space-around',
                            zIndex: 9
                        }}
                    />
                </View>
            </View>
            {
                (firstTabs === ENUMTAB.TAB1[0] || firstTabs === ENUMTAB.TAB1[1]) && (
                    <View style={{ zIndex: 111 }}>
                        <Shadow2 />
                        <View onLayout={onLayout2} style={{ zIndex: 10 }}>
                            <TabView
                                tabs={listData2}
                                activeTab={secondTabs === ENUMTAB.TAB2[0] ? 0 : 1}
                                onChangeTab={(i, preIndex, currentIndex) => {
                                    clearInteractable()
                                    dispatch(changeAnimationType(getAnimationTypeByIndex({ preIndex: preIndex, nextIndex: currentIndex })))
                                    onTabsChange2(ENUMTAB.TAB2[i])
                                }}
                                wrapperStyle={{
                                    backgroundColor: CommonStyle.color.dark,
                                    justifyContent: 'space-around',
                                    zIndex: 9
                                }}
                            />
                        </View>
                    </View>
                )
            }
        </React.Fragment>
    )
}, (pre, next) => pre.firstTabs === next.firstTabs)
const styles = StyleSheet.create({
    extra1: { backgroundColor: CommonStyle.color.bg },
    extra2: { backgroundColor: CommonStyle.color.dark }
});

export default React.memo(HeaderFilter, () => true);
