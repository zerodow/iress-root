import React, {
    useImperativeHandle,
    forwardRef,
    useRef,
    useState,
    useEffect
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';

import StreamingLv1 from '~/streaming/StreamComp/lv1';
import TradingPeriod from '~/streaming/StreamComp/tradingPeriod';

import watchListActions from './reducers';
import { switchForm } from '~/lib/base/functionUtil';
import PriceBoard from './handle_priceBoard_data';
import { useAppState, useNavigator } from './TradeList/tradelist.hook';

const usePriceBoard = () => {
    const getAllPriceBoard = () => {
        const url = getAllPriceBoardUrl(userId);
    };
    return [getSnapshot];
};

const useLv1 = () => {
    return [getSnapshot, sub, unsub];
};

let HandleData = ({ navigator, listSymbol: arrSymbol }, ref) => {
    const [getPriceBoard] = usePriceBoard();
    const [getLV1SnapShot, subLv1, unsubLv1] = useLv1();
    const appState = useAppState(
        () => {
            subLv1();
            getPriceBoard();
            getLV1SnapShot();
        },
        () => {
            unsubLv1();
        }
    );

    useNavigator(navigator, {
        didAppear: () => {
            subLv1();
            appState.addListener();
            getPriceBoard();
            getLV1SnapShot();
        },
        didDisappear: () => {
            unsubLv1();
            appState.removeListener();
        }
    });
};

HandleData = forwardRef(HandleData);
HandleData = React.memo(HandleData);

export default HandleData;
