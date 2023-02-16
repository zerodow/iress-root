import React, { PureComponent } from 'react';
import { Keyboard, View, Animated, Text, Platform, TouchableOpacity, Dimensions } from 'react-native';
import CommonStyle, { register } from '~/theme/theme_controller'
import { connect } from 'react-redux';
// Component
import NestedScrollView from '~/component/NestedScrollView';
import ScrollLoadAbs from '~/component/ScrollLoadAbs';
import SearchDetail from '@unis/detail/search_detail.view';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SearchSymbolDetail from '../../detail/symbol/search_symbol_detail';
import PriceDetail from '../../detail/price';
import PriceDetailHeader from '../../detail/price/price_header';
import DepthDetail from '../../detail/depth';
import CosDetail from '../../detail/cos';
import GetAllDataPrice from '@unis/detail/price/getAllComp';
import SearchNew from '../../detail/new/search_new';
import Header from '../../detail/header';
import SearchOrder from '../../detail/order/search_order';
// import SearchPortfolio from './,,.portfolio/search_portfolio';
import SearchPortfolio from '../../detail/portfolio/search_portfolio';
import filterType from '~/constants/filter_type';
import SearchOrderSliding from '../../detail/order/search_order_sliding';
import SlidingPanel from '../../detail/contentSlide';
import I18n from '~/modules/language';
import * as Controller from '~/memory/controller';
import ProgressBar from '~/modules/_global/ProgressBar';
import SearchNewActions from '../../detail/new/search_new.reducer';
import CustomButton from '~/component/custom_button/custom_button_watchlist'
import HandleDataComp from '~/screens/watchlist/handle_data';
import { dataStorage } from '~/storage';

const { height: HEIGHT_DEVICE } = Dimensions.get('window');
const HEIGHT_AVAILABLE = HEIGHT_DEVICE - 233;

export class SearchPreView extends PureComponent {
    constructor(props) {
        super(props);
        this.userId = Controller.getUserId();
        this.show = this.show.bind(this)
        this.renderDragHandler = this.renderDragHandler.bind(this)
        this.renderDragIcon = this.renderDragIcon.bind(this)
        this.renderEmptyView = this.renderEmptyView.bind(this)
        this.renderCloseIcon = this.renderCloseIcon.bind(this)
        this.onClose = this.onClose.bind(this)
        this.openSlide = this.openSlide.bind(this)
        this.onScrollChange = this.onScrollChange.bind(this)
        this.readyCallback = this.readyCallback.bind(this)

        this.scrollContainerValue = new Animated.Value(0)
        this.scrollValue = new Animated.Value(0)
        this.countRender = 0;
        // ***** get Height of every component to caculator show or hide *****;
        this.heightNavBar = 48;
        this.heightHeaderPin = 185;
        this.heightChart = 243;
        this.heightHeader = 47;
        this.heightDepth = 410;
        this.heightLoadMore = 38;
        // *********************************************************************;
        this.state = {
            symbol: '',
            isReady: false
        }
        this.addListenerForContainerScroll()
        this.addListenerForChildrenScroll()
    }

    onScrollChange() {
        this.nestedScroll && this.nestedScroll.isExpandBottom();
    }
    renderNotAvailable(h = 200, title) {
        return <View
            style={{ height: h, paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center' }}
            onLayout={event => this.onLayout(event, title)}
        >
            <CustomButton
                style={{ paddingVertical: 6, alignItems: 'center', justifyContent: 'center' }}
                iconStyle={{ height: 32, width: 32, right: -14 }} />
        </View>
    }
    listenScroll({ value }) {
        if (this.delayTimer) clearTimeout(this.delayTimer);
        this.delayTimer = setTimeout(() => {
            this.handleShowHideComp({ value });
        }, 300);
    }
    addListenerForContainerScroll() {
        this.scrollContainerValue.addListener(({ value }) => {
            const threshold = 88;
            if (value > threshold && this.props.title) {
                this.props.changeTitle && this.props.changeTitle('');
            } else if (value <= threshold && !this.props.title) {
                this.props.changeTitle && this.props.changeTitle('universalSearch');
            }
        });
    }
    addListenerForChildrenScroll() {
        this.scrollValue.addListener(({ value }) => {
            this.listenScroll({ value })
        })
    }
    checkChart(value) {
        const x1 = 0
        const x2 = this.heightChart
        return this.caculatorValue(value, x1, x2 || 323)
    }
    checkDept(value) {
        const x1 = this.heightChart || 323
        const x2 = this.heightDepth
        return this.caculatorValue(value, x1, x2 || 410)
    }
    checkCos(value) {
        const x1 = (this.heightChart + this.heightDepth) || 733
        const x2 = this.heightCostOfSale
        return this.caculatorValue(value, x1, x2 || 460)
    }
    checkNews(value) {
        const x1 = (this.heightChart + this.heightDepth + this.heightCostOfSale) || 1193
        const x2 = this.heightNews
        return this.caculatorValue(value, x1, x2 || 590)
    }
    checkOpen(value) {
        const x1 = this.heightChart + this.heightDepth + this.heightCostOfSale + this.heightNews
        const x2 = this.heightOpenOrder
        return this.caculatorValue(value, x1, x2)
    }
    checkStop(value) {
        const x1 = this.heightChart + this.heightDepth + this.heightCostOfSale + this.heightNews + this.heightOpenOrder
        const x2 = this.heightStopLossOrder
        return this.caculatorValue(value, x1, x2)
    }
    checkFill(value) {
        const x1 = this.heightChart + this.heightDepth + this.heightCostOfSale + this.heightNews
        const x2 = this.heightFilledOrder
        return this.caculatorValue(value, x1, x2)
    }
    checkCancel(value) {
        const x1 = this.heightChart + this.heightDepth + this.heightCostOfSale + this.heightNews + this.heightOpenOrder + this.heightStopLossOrder + this.heightFilledOrder
        const x2 = this.heightCancelOrder
        return this.caculatorValue(value, x1, x2)
    }
    checkPortfolio(value) {
        const x1 = this.heightChart + this.heightDepth + this.heightCostOfSale + this.heightNews + this.heightOpenOrder + this.heightStopLossOrder + this.heightFilledOrder + this.heightCancelOrder
        const x2 = this.heightPortfolio
        return this.caculatorValue(value, x1, x2)
    }
    caculatorValue(value, x1, x2) {
        if (x1 > value && x1 + x2 < value + HEIGHT_AVAILABLE) return true;
        if (x1 + x2 < value || x1 > value + HEIGHT_AVAILABLE) return false;
        console.log('=================exception caculator value ==================');
        return true;
    }
    handleShowHideComp({ value }) {
        const showChart = this.checkChart(value);
        const showDepth = this.checkDept(value);
        const showCos = this.checkCos(value);
        const showNews = this.checkNews(value);
        const showOrderOpen = this.checkOpen(value);
        const showOrderStoploss = this.checkStop(value);
        const showOrderFillded = this.checkFill(value);
        const showOrderCancel = this.checkCancel(value);
        const showPortfolio = this.checkPortfolio(value);
        if (showChart !== this.state.showChart ||
            showDepth !== this.state.showDepth ||
            showCos !== this.state.showCos ||
            showNews !== this.state.showNews ||
            showOrderOpen !== this.state.showOrderOpen ||
            showOrderStoploss !== this.state.showOrderStoploss ||
            showOrderFillded !== this.state.showOrderFillded ||
            showOrderCancel !== this.state.showOrderCancel ||
            showPortfolio !== this.state.showPortfolio) {
            // console.log('-----------showChart----------', showChart)
            // console.log('-----------showDepth----------', showDepth)
            // console.log('-----------showCos----------', showCos)
            // console.log('-----------showNews----------', showNews)
            // console.log('-----------showOrderOpen----------', showOrderOpen)
            // console.log('-----------showOrderStoploss----------', showOrderStoploss)
            // console.log('-----------showOrderFillded----------', showOrderFillded)
            // console.log('-----------showOrderCancel----------', showOrderCancel)
            // console.log('-----------showPortfolio----------', showPortfolio)
            this.setState({
                showChart,
                showDepth,
                showCos,
                showNews,
                showOrderOpen,
                showOrderFillded,
                showOrderStoploss,
                showOrderCancel,
                showPortfolio
            })
        }
    }
    componentDidMount() {
        this.props.setRef && this.props.setRef(this);
        // **************caclutator defaul value*********************** //
        const showChart = (this.heightNavBar + this.heightHeaderPin) < HEIGHT_DEVICE;
        const showDepth = (this.heightNavBar + this.heightHeaderPin + this.heightChart) < HEIGHT_DEVICE;
        const showCos = (this.heightNavBar + this.heightHeaderPin + this.heightChart + this.heightDepth) < HEIGHT_DEVICE;
        const showNews = (this.heightNavBar + this.heightHeaderPin + this.heightChart + this.heightDepth + this.heightNews) < HEIGHT_DEVICE;
        const showOrderOpen = (this.heightNavBar + this.heightHeaderPin + this.heightChart + this.heightDepth + this.heightNews + this.heightCostOfSale) < HEIGHT_DEVICE;
        const showOrderStoploss = (this.heightNavBar + this.heightHeaderPin + this.heightChart + this.heightDepth + this.heightNews + this.heightCostOfSale + this.heightOpenOrder) < HEIGHT_DEVICE;
        const showOrderFillded = (this.heightNavBar + this.heightHeaderPin + this.heightChart + this.heightDepth + this.heightNews + this.heightCostOfSale + this.heightOpenOrder + this.heightStopLossOrder) < HEIGHT_DEVICE;
        const showOrderCancel = (this.heightNavBar + this.heightHeaderPin + this.heightChart + this.heightDepth + this.heightNews + this.heightCostOfSale + this.heightOpenOrder + this.heightStopLossOrder + this.heightFilledOrder) < HEIGHT_DEVICE;
        const showPortfolio = (this.heightNavBar + this.heightHeaderPin + this.heightChart + this.heightDepth + this.heightNews + this.heightCostOfSale + this.heightOpenOrder + this.heightStopLossOrder + this.heightFilledOrder + this.heightCancelOrder) < HEIGHT_DEVICE;
        // *********************************************************** //
        this.setState({
            showChart,
            showDepth,
            showCos,
            showNews,
            showOrderOpen,
            showOrderStoploss,
            showOrderFillded,
            showOrderCancel,
            showPortfolio
        })
    }

    componentWillUnmount() {
        this.props.setRef && this.props.setRef(undefined)
    }
    show({ data }) {
        const { symbol, exchanges } = data
        this.setState({ symbol, exchange: exchanges[0], isReady: false }, () => {
            this.nestedScroll && this.nestedScroll.snapContainerTopTop(() => {
                this.readyCallback()
            })
        });
    }
    openSlide(detail) {
        const { data } = detail;
        this.setState({
            data
        }, () => {
            this.SlidingPanel && this.SlidingPanel.handlePressOn && this.SlidingPanel.handlePressOn()
        })
    }
    handleShowPortfolioDetail = () => {
        alert('show portfolio detail')
    }
    renderDragIcon() {
        return <View style={[CommonStyle.dragIcons, { marginLeft: -(36 - 8) }]} />
    }
    renderEmptyView() {
        return <View style={CommonStyle.dragIconsVisible} />
    }

    onClose() {
        this.props.changeTitle && this.props.changeTitle('');
        this.SlidingPanel && this.SlidingPanel.onClose && this.SlidingPanel.onClose(true);
        if (this.nestedScroll) {
            this.nestedScroll.hideContainer();
        }
        this.props.resetPageSizeNews();
    }

    renderCloseIcon = () => {
        return <TouchableOpacity
            onPress={this.onClose}
            style={{
                height: 24,
                paddingTop: 8
            }}
        >
            <View style={CommonStyle.closeIconSlide}>
                <Ionicons
                    style={{ lineHeight: 24, fontWeight: 'bold' }}
                    name='md-close'
                    color={'rgba(0, 0, 0, 0.54)'}
                    size={18}
                />
            </View>
        </TouchableOpacity>
    }

    renderDragHandler() {
        return <View style={[
            CommonStyle.dragHandlerNewOrder,
            CommonStyle.DragBar
        ]}>
            {this.renderEmptyView()}
            {this.renderDragIcon()}
            {this.renderCloseIcon()}
        </View>
    }

    readyCallback() {
        this.setState({ isReady: true })
    }
    onLayout(event, title) {
        const { height: h } = event.nativeEvent.layout
        switch (title) {
            case I18n.t('openOrders'):
                this.heightOpenOrder = h;
                break;
            case I18n.t('stopLossOrder'):
                this.heightStopLossOrder = h;
                break;
            case I18n.t('filledOrders'):
                this.heightFilledOrder = h;
                break;
            case I18n.t('cancelledOrders'):
                this.heightCancelOrder = h;
                break;
            case 'costOfSale':
                this.heightCostOfSale = h;
                break;
            case 'portfolio':
                this.heightPortfolio = h;
                break;
            case 'news':
                this.heightNews = h;
                break;
            case 'chart':
                this.heightChart = h;
                break;
            case 'depth':
                this.heightDepth = h;
                break;
            default:
                break;
        }
    }
    renderCostOfSale(symbol, navigator) {
        return <View onLayout={(event) => this.onLayout(event, 'costOfSale')}>
            <CosDetail symbol={symbol} navigator={navigator} />
        </View>
    }
    renderOrderlist(title) {
        let typeFilter;
        switch (title) {
            case I18n.t('openOrders'):
                typeFilter = filterType.WORKING;
                break;
            case I18n.t('stopLossOrder'):
                typeFilter = filterType.STOPLOSS
                break;
            case I18n.t('filledOrders'):
                typeFilter = filterType.FILLED
                break;
            case I18n.t('cancelledOrders'):
                typeFilter = filterType.CANCELLED
                break;
            default:
                typeFilter = '';
                break;
        }
        return <View onLayout={event => this.onLayout(event, title)} >
            <Header title={title} />
        </View>
    }
    renderPortfolio() {
        return <View onLayout={event => this.onLayout(event, 'portfolio')}>
            <SearchPortfolio
                handleShowPortfolioDetail={this.handleShowPortfolioDetail}
                onScrollChange={this.onScrollChange}
                navigator={this.props.navigator}
            />
        </View>
    }
    renderNew() {
        return <View onLayout={event => this.onLayout(event, 'news')}>
            <Header title={I18n.t('News')} />
            <SearchNew navigator={this.props.navigator} scrollDisalbe />
        </View>
    }
    renderChart(navigator, symbol, exchange) {
        return <View onLayout={event => this.onLayout(event, 'chart')}>
            <PriceDetail navigator={navigator} symbol={symbol} exchange={exchange} />
        </View>
    }
    renderDepth(symbol, navigator) {
        return <View onLayout={event => this.onLayout(event, 'depth')}>
            <DepthDetail symbol={symbol} navigator={navigator} />
        </View>
    }
    render() {
        const { symbol, exchange, data } = this.state;
        // this.countRender++;
        // console.log('=====================render time ====================', this.countRender)
        const { navigator } = this.props
        if (!symbol) {
            return null;
        }
        return (
            <React.Fragment>
                <NestedScrollView
                    scrollContainerValue={this.scrollContainerValue}
                    scrollValue={this.scrollValue}
                    ref={sef => (this.nestedScroll = sef)}
                    style={{ flex: 1 }}
                >
                    <ScrollLoadAbs
                        style={{ backgroundColor: CommonStyle.backgroundColor, minHeight: HEIGHT_DEVICE - 64 }}
                        scrollValue={this.scrollValue}>
                        <View
                            isAbsolute
                            onLayout={this.onLayoutHeaderPin}
                            style={{ backgroundColor: CommonStyle.backgroundColor }}>
                            {this.renderDragHandler()}
                            <GetAllDataPrice symbol={symbol} navigator={navigator} />
                            <SearchSymbolDetail symbol={symbol} />
                            {
                                !this.state.isReady ? null : <PriceDetailHeader
                                    subNews={true}
                                    navigator={navigator}
                                    symbol={symbol}
                                    exchange={exchange}
                                    onAuth={this.props.onAuth} />
                            }
                        </View>
                        {
                            !this.state.isReady ? <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: CommonStyle.backgroundColor }}>
                                <ProgressBar />
                            </View>
                                : <View style={{ backgroundColor: CommonStyle.backgroundColor, flex: 1 }}>
                                    {/* {this.state.showChart ? this.renderChart(navigator, symbol, exchange) : this.renderNotAvailable(this.heightChart, 'chart')} */}
                                    {this.renderChart(navigator, symbol, exchange)}
                                    {/* {this.state.showDepth ? this.renderDepth(symbol, navigator) : this.renderNotAvailable(this.heightDepth, 'depth')} */}
                                    {this.renderDepth(symbol, navigator)}
                                    {/* {this.state.showCos ? this.renderCostOfSale(symbol, navigator) : this.renderNotAvailable(this.heightCostOfSale, 'costOfSale')} */}
                                    {this.renderCostOfSale(symbol, navigator)}
                                    {/* {this.state.showNews ? this.renderNew() : this.renderNotAvailable(this.heightNews, 'news')} */}
                                    {this.renderNew()}
                                    {/* {this.state.showOrderOpen ? this.renderOrderlist(I18n.t('openOrders')) : this.renderNotAvailable(this.heightOpenOrder, I18n.t('openOrders'))} */}
                                    {this.renderOrderlist(I18n.t('openOrders'))}
                                    {/* {this.state.showOrderStoploss ? this.renderOrderlist(I18n.t('stopLossOrder')) : this.renderNotAvailable(this.heightStopLossOrder, I18n.t('stopLossOrder'))} */}
                                    {this.renderOrderlist(I18n.t('stopLossOrder'))}
                                    {/* {this.state.showOrderFillded ? this.renderOrderlist(I18n.t('filledOrders')) : this.renderNotAvailable(this.heightFilledOrder, I18n.t('filledOrders'))} */}
                                    {this.renderOrderlist(I18n.t('filledOrders'))}
                                    {/* {this.state.showOrderCancel ? this.renderOrderlist(I18n.t('cancelledOrders')) : this.renderNotAvailable(this.heightCancelOrder, I18n.t('cancelledOrders'))} */}
                                    {this.renderOrderlist(I18n.t('cancelledOrders'))}
                                    {/* {this.state.showPortfolio ? this.renderPortfolio() : this.renderNotAvailable(this.heightPortfolio, 'portfolio')} */}
                                    {this.renderPortfolio()}
                                </View>
                        }
                        {/* <View style={{ height: 28 }} /> */}
                    </ScrollLoadAbs>
                </NestedScrollView>
                <SlidingPanel
                    title={this.props.title}
                    changeTitle={this.props.changeTitle}
                    setRef={ref => this.SlidingPanel = ref}
                    navigator={this.props.navigator}
                    data={data}
                />
            </React.Fragment>
        );
    }
}

const mapStateToProps = state => ({
});

function mapDispatchToProps(dispatch) {
    return {
        resetPageSizeNews: (...p) =>
            dispatch(SearchNewActions.resetPageSizeNews(...p))
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SearchPreView);
