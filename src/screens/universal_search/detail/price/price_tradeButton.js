import React, { Component } from 'react';
import { View } from 'react-native';
import _ from 'lodash';
import { connect } from 'react-redux';

import tradeTypeString from '~/constants/trade_type_string';
import styles from '~s/trade/style/trade';
import { func, dataStorage } from '~/storage';
import config from '~/config';
import Enum from '~/enum';
import {
    formatNumber,
    formatNumberNew2,
    getExchange,
    logDevice
} from '~/lib/base/functionUtil';
import ButtonBox from '~/modules/_global/ButtonBox';
import * as Controller from '~/memory/controller';
import * as RoleUser from '~/roleUser';
import SVActions from '~/component/scrollCustom/scrollview.reducer';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';
import { showNewOrderModal } from '~/navigation/controller.1';

const PRICE_DECIMAL = Enum.PRICE_DECIMAL;

const CHILD_NAME = 'ButtonExpand';

class ButtonExpand extends Component {
    constructor(props) {
        super(props);
        this.isPress = false;
        this.onOrder = this.onOrder.bind(this);
        this.nav = this.props.navigator;
        this.props.addSVChild(CHILD_NAME, () => this);
    }

    shouldComponentUpdate({ isShouldRender }) {
        return isShouldRender || _.isUndefined(isShouldRender);
    }

    componentWillUnmount = () => {
        this.props.rmSVChild(CHILD_NAME);
    };

    onOrder(type) {
        const {
            priceObject: { exchange = null } = {},
            change_percent: changePercent = null,
            trade_price: tradePrice = null,
            ask_price: askPrice = null,
            bid_price: bidPrice = null,
            symbol: code = '',
            symbolInfo,
            callBackAfterPopup
        } = this.props;

        const displayName = func.getDisplayNameSymbol(code);
        logDevice('info', ' onOrder was called: ' + code);
        const exchanges =
            symbolInfo && symbolInfo.exchanges ? symbolInfo.exchanges : null;
        const listExchange = getExchange(exchanges);
        if (!Controller.getLoginStatus()) return;
        const isParitech = (exchange + '').includes('ASX');
        logDevice('info', 'push Form onOrder: ' + code);

        const isBuy = type === tradeTypeString.BUY;
        const passProps = {
            displayName,
            isBuy,
            code,
            isParitech,
            callBackAfterPopup: callBackAfterPopup
                ? callBackAfterPopup.bind(this)
                : null,
            changePercent: changePercent
                ? formatNumberNew2(changePercent, PRICE_DECIMAL.PERCENT)
                : 0,
            tradePrice: tradePrice
                ? formatNumberNew2(tradePrice, PRICE_DECIMAL.PRICE)
                : null,
            exchanges: listExchange,
            limitPrice: isBuy ? askPrice || 0 : bidPrice || 0,
            stopPrice: tradePrice || 0,
            volume: 0,
            isReSub: true,
            isNotShowMenu: true
        };
        showNewOrderModal({
            navigator: this.nav,
            passProps
        });
    }

    setTimeoutClickable() {
        this.isPress = true;
        setTimeout(() => {
            this.isPress = false;
        }, 1500);
    }

    onPress(type) {
        if (this.isPress) return;
        this.setTimeoutClickable();
        this.props.authFunction(this.onOrder.bind(this, type));
    }

    render() {
        const {
            symbol,
            isLogin,
            isConnected,
            priceObject = {},
            isLoading
        } = this.props;

        const { email } = Controller.getUserInfo() || {};

        const {
            bid_size: bidSize = null,
            bid_price: bidPrice = null,
            ask_price: askPrice = null,
            ask_size: askSize = null
        } = priceObject;

        const hasRole = RoleUser.checkRoleByKey(
            Enum.ROLE_DETAIL.PERFORM_BUY_SELL_UNIVERSALSEARCH_BUTTON
        );

        const { isNotHaveAccount, loginUserType } = dataStorage;

        const disableAll =
            !func.isAccountActive() ||
            isNotHaveAccount ||
            !isLogin ||
            !hasRole ||
            email === config.username ||
            !isConnected ||
            loginUserType === 'REVIEW';

        return (
            <View style={[styles.buttonExpand]}>
                <ButtonBox
                    buy
                    testID={`${symbol}BuyButton`}
                    disableAll={disableAll}
                    onPress={this.onPress.bind(this, 'buy')}
                    width={'48%'}
                    value1={bidSize && !isLoading ? formatNumber(bidSize) : 0}
                    value2={
                        bidPrice && !isLoading
                            ? formatNumberNew2(bidPrice, PRICE_DECIMAL.PRICE)
                            : '--'
                    }
                />
                <View style={{ width: '4%' }} />
                <ButtonBox
                    testID={`${symbol}SellButton`}
                    disableAll={disableAll}
                    onPress={this.onPress.bind(this, 'sell')}
                    width={'48%'}
                    value1={
                        askPrice && !isLoading
                            ? formatNumberNew2(askPrice, PRICE_DECIMAL.PRICE)
                            : '--'
                    }
                    value2={askSize && !isLoading ? formatNumber(askSize) : 0}
                />
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    isShouldRender: state.scrollView.childStatus[CHILD_NAME],
    symbolInfo: state.price.symbolInfo,
    priceObject: state.price.priceObject,
    symbol: state.searchDetail.symbol,
    isLogin: state.login.isLogin,
    isConnected: state.app.isConnected,
    isLoading: state.price.isLoading
});

export default connect(
    mapStateToProps,
    (dispatch) => ({
        addSVChild: (...p) =>
            dispatch(SVActions.SvMeasureAddChildToStack(...p)),
        rmSVChild: (...p) =>
            dispatch(SVActions.SvMeasureRemoveChildToStack(...p))
    }),
    null,
    { forwardRef: true }
)(ButtonExpand);
