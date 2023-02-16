import React, { PureComponent } from 'react';
import Uuid from 'react-native-uuid';
import { Text, View, PixelRatio } from 'react-native';

import * as Emitter from '@lib/vietnam-emitter';
import Auth from './price_Auth';
import ButtonExpand from './price_buttonExpand';
import OptionButton from './price_Option';
import OverView from './price_overView';
import PriceActions from './price.reducer';
import PriceChart from './price_chart';
import TradeInfo from './price_tradeInfo';
import TradeOverview from './price_tradeOverView';
import { connect } from 'react-redux';
import { logAndReport } from '../../lib/base/functionUtil';
import AppState from '~/lib/base/helper/appState2';

class Price extends PureComponent {
    constructor(props) {
        super(props);
        this.id = Uuid.v4();
        this.onOrder = () => null;
        this.checkAuth = () => null;
        this.onPressWatchList = () => null;

        this.props.navigator.addOnNavigatorEvent(
            this.onNavigatorEvent.bind(this)
        );

        this.appState = new AppState(() => {
            this.props.listenPrice();
        });
    }

    componentWillReceiveProps = (nextProps) => {
        const { isConnected, symbol } = nextProps;
        const changeNerworkState =
            this.props.isConnected === false && isConnected === true;
        const changeSymbol = this.props.symbol !== symbol;
        if (changeNerworkState || changeSymbol) {
            this.props.listenHalt();
            this.props.listenPrice();
        }
    };

    componentDidMount() {
        try {
            this.props.getHaltSnapshot();
            this.props.checkUserWatchList();
        } catch (error) {
            logAndReport(
                'componentDidMount price exception',
                error,
                'componentDidMount price'
            );
        }
    }

    onNavigatorEvent(event) {
        switch (event.id) {
            case 'willAppear':
                this.props.listenHalt(`${this.id}_halt`);
                this.props.listenPrice(this.id);
                break;
            case 'didAppear':
                this.appState.addListenerAppState();
                break;
            case 'didDisappear':
                // remove tam
                Emitter.deleteByIdEvent(`${this.id}_halt`);
                Emitter.deleteByIdEvent(this.id);
                this.appState.removeListenerAppState();
                break;
            default:
                break;
        }
    }

    render() {
        const { isBackground, isPushFromWatchlist, navigator } = this.props;

        return (
            <React.Fragment>
                <OverView
                    isBackground={isBackground}
                    isPushFromWatchlist={isPushFromWatchlist}
                    navigator={navigator}
                />
                <TradeOverview />

                <View style={{ marginTop: 2 }} />

                <TradeInfo />
                <ButtonExpand
                    ref={(sef) => {
                        if (sef) {
                            this.onOrder = sef.onOrder;
                        }
                    }}
                    navigator={navigator}
                    authFunction={(...p) => this.checkAuth(...p)}
                />
                <PriceChart navigator={navigator} />
                <OptionButton navigator={navigator} />
                <Auth
                    ref={(sef) => {
                        if (sef) {
                            this.checkAuth = sef.onCheckAuth;
                        }
                    }}
                    navigator={navigator}
                    onOrder={(...p) => this.onOrder(...p)}
                />
            </React.Fragment>
        );
    }
}

function mapDispatchToProps(dispatch) {
    return {
        listenHalt: (...p) => dispatch(PriceActions.priceUniListenHalt(...p)),
        listenPrice: (...p) => dispatch(PriceActions.priceUniListenPrice(...p)),

        getHaltSnapshot: (...p) =>
            dispatch(PriceActions.priceUniUpdateHalt(...p)),
        checkUserWatchList: (...p) =>
            dispatch(PriceActions.checkUserWatchList(...p))
    };
}

export default connect(null, mapDispatchToProps, null, { forwardRef: true })(
    Price
);
