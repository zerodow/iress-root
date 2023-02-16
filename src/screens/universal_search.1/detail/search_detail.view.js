// Default import
import React, { PureComponent, Component } from 'react';
import _ from 'lodash';
import {
    Text,
    PixelRatio,
    View,
    Animated,
    TouchableOpacity,
    Platform
} from 'react-native';
import { connect } from 'react-redux';

// Func
import I18n from '~/modules/language';
import filterType from '~/constants/filter_type';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as Emitter from '@lib/vietnam-emitter';
import {
    formatNumber,
    formatNumberNew2,
    getPriceSource,
    countC2RTimes,
    logDevice,
    logAndReport
} from '../../../lib/base/functionUtil';
import Enum from '../../../enum';

// Comp
import Header from '../detail/header';
import SearchNew from './new/search_new';
// import SearchOrderSliding from './order/search_order_sliding';
import SearchOrder from './order/search_order';
import OrderDetail from './order/order_detail';
import SearchPortfolio from './portfolio/search_portfolio';
import SwiperMarketDepth from '~s/market_depth/swiper_market_depth.2';
import TenTrade from '~s/market_depth/swiper_10_trades.2';
import ScrollView from '~/component/scrollCustom';
import SymbolButton from './price/price_symbolButton';
import PriceTradeHeader from './price/price_tradeHeader';
import PriceTradeInfo from './price/price_tradeInfo';
import PriceTradeButton from './price/price_tradeButton';
import PriceChart from './price/price_chart';
import OptionButton from './price/price_Option';
import Auth from './price/price_Auth';
import GetAllDataPrice from './price/getAllComp';
import { iconsLoaded } from '~/utils/AppIcons';
import NestedScrollView from '~/component/NestedScrollView';
import ScrollLoadAbs from '~/component/ScrollLoadAbs';
import Icon from 'react-native-vector-icons/Ionicons';

const PRICE_DECIMAL = Enum.PRICE_DECIMAL;
class SearchDetail extends Component {
    constructor(props) {
        super(props);
        this.checkAuth = () => null;
        this.onOrder = () => null;
        this.scrollValue = new Animated.Value(0);
        this.scrollContainerValue = new Animated.Value(0);
        this.openSlide = this.openSlide.bind(this);
        this.state = {
            data: {}
        };
    }

    getText(text) {
        const mid = I18n.t(text);
        return mid;
    }

    checkIndication(indicativePrice) {
        if (this.props.isLoading === true) return '--';
        return indicativePrice === null || indicativePrice === undefined
            ? '--'
            : formatNumberNew2(indicativePrice, PRICE_DECIMAL.PRICE);
    }
    checkSurplus(surplusVolume) {
        if (this.props.isLoading === true) return '--';
        return surplusVolume === null || surplusVolume === undefined
            ? '--'
            : ` ${
                  this.props.side && this.props.side.toUpperCase() === 'S'
                      ? '-'
                      : ''
              }${surplusVolume}`;
    }
    renderAuctionHeader = () => {
        const { indicativePrice, surplusVolume } = this.props;
        if (
            (surplusVolume === null && indicativePrice === null) ||
            (surplusVolume === undefined && indicativePrice === undefined)
        ) {
 return <View />;
}
        return (
            <View style={CommonStyle.styleViewAuction}>
                <Text style={CommonStyle.textAuctionHeader}>
                    {I18n.t('Indicative_Price')}
                    {this.checkIndication(indicativePrice)}
                </Text>
                <Text style={CommonStyle.textAuctionHeader}>
                    {I18n.t('Surplus_Volume')}
                    {this.checkSurplus(surplusVolume)}
                </Text>
            </View>
        );
    };

    openSlide(data) {
        this.setState(
            {
                data
            },
            () => {
                this.SlidingPanel &&
                    this.SlidingPanel.handlePressOn &&
                    this.SlidingPanel.handlePressOn();
            }
        );
    }

    renderScrollView = () => {
        const {
            isBackground,
            isPushFromWatchlist,
            scrollProps,
            navigator,
            symbol
        } = this.props;
        return (
            <View style={{ flex: 1 }}>
                <ScrollView {...scrollProps} navigator={navigator}>
                    <GetAllDataPrice symbol={symbol} navigator={navigator} />
                    <SymbolButton
                        isBackground={isBackground}
                        isPushFromWatchlist={isPushFromWatchlist}
                        navigator={navigator}
                    />
                    <PriceTradeHeader />

                    <View style={{ marginTop: 2 }} />

                    <PriceTradeInfo />
                    <PriceTradeButton
                        setRef={(sef) => {
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
                        setRef={(sef) => {
                            if (sef) {
                                this.checkAuth = sef.onCheckAuth;
                            }
                        }}
                        navigator={navigator}
                        onOrder={(...p) => this.onOrder(...p)}
                    />

                    <Header title={this.getText('marketDepth')} />
                    {this.renderAuctionHeader()}
                    <SwiperMarketDepth
                        isOrder={true}
                        navigator={this.props.navigator}
                    />

                    <Header title={this.getText('courseOfSales')} />
                    <TenTrade isOrder={true} navigator={this.props.navigator} />

                    <Header title={this.getText('News')} />
                    <SearchNew navigator={this.props.navigator} />

                    <Header title={this.getText('openOrders')} />
                    <SearchOrder
                        filterType={filterType.WORKING}
                        navigator={this.props.navigator}
                        // openSlider={(data) => this.openSlider(data)}
                        openSlider={this.openSlide}
                    />

                    <Header title={this.getText('stopLossOrder')} />
                    <SearchOrder
                        filterType={filterType.STOPLOSS}
                        navigator={this.props.navigator}
                        // openSlider={(data) => this.openSlider(data)}
                        openSlider={this.openSlide}
                    />
                    <Header title={this.getText('filledOrders')} />
                    <SearchOrder
                        filterType={filterType.FILLED}
                        navigator={this.props.navigator}
                        // openSlider={(data) => this.openSlider(data)}
                        openSlider={this.openSlide}
                    />

                    <Header title={this.getText('cancelledOrders')} />
                    <SearchOrder
                        filterType={filterType.CANCELLED}
                        navigator={this.props.navigator}
                        // openSlider={(data) => this.openSlider(data)}
                        openSlider={this.openSlide}
                    />

                    <Header title={this.getText('portfolio')} />
                    <SearchPortfolio navigator={this.props.navigator} />
                </ScrollView>
            </View>
        );
    };
    openSlider = () => {
        this.SlidingPanel &&
            this.SlidingPanel.handlePressOn &&
            this.SlidingPanel.handlePressOn();
    };
    render() {
        return (
            <View
                style={{
                    flex: 1,
                    marginTop: 0,
                    backgroundColor: CommonStyle.colorBgNewAlert
                }}
            >
                <View style={{ flex: 1 }}>{this.renderScrollView()}</View>
            </View>
        );
    }
}
const mapStateToProps = (state) => ({
    indicativePrice: state.marketDepth.indicativePrice,
    surplusVolume: state.marketDepth.surplusVolume,
    side: state.marketDepth.side,
    isLoading: state.marketDepth.isLoading
});

const mapDispatchToProps = (dispatch) => ({
    setTypeForm: (...p) => dispatch(marketActions.setTypeForm(...p)),
    subMarketDepth: (...p) => dispatch(marketActions.subMarketDepth(...p))
});

export default connect(mapStateToProps, mapDispatchToProps)(SearchDetail);
