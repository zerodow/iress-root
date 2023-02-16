import React, { PureComponent } from 'react';
import {
    View,
    Text,
    Platform,
    PixelRatio,
    Keyboard,
    StatusBar
} from 'react-native';
import _ from 'lodash';
import { connect } from 'react-redux';

import ENUM from '~/enum';
import * as Emitter from '@lib/vietnam-emitter';
import I18n from '~/modules/language';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as Business from '~/business';
// import * as PureFunc from '~/utils/pure_func';
import NetworkWarning from '~/component/network_warning/network_warning.1';
import ScreenId from '~/constants/screen_id';
import ScrollBarUndeline from '~/component/scrollbar_underline/scrollbar_underline';
import analyticsEnum from '~/constants/analytics';
import config from '~/config';
import searchActions from './search_universal.reducer';
import { dataStorage, func } from '../../../storage';
import { setCurrentScreen } from '~/lib/base/analytics';
import userType from '../../../constants/user_type';
import searchDetailActions from '../detail/search_detail.reducer';

import { showNewOrderModal } from '~/navigation/controller.1';
import SearchBar from './topBar/universal_search.searchBar';
import NavBar from './topBar/universal_search.navBar';
import SearchPreView from './preview/universal_search.searchPreView';
// import SearchPreView from './preview/Optimize_Universal_Search';
import SearchResult from './listResult/universal_search.searchResult';
import AuthenPin from '~/component/authen_pin/authen_pin';
import * as Controller from '~/memory/controller';
import Warning from '../../../component/warning/warning';
import {
    getExchange,
    formatNumberNew2,
    logAndReport,
    logDevice
} from '~/lib/base/functionUtil';
import * as Channel from '~/streaming/channel';
import SlidingPanel from '../detail/order/search_order_sliding';
import { SearchDetail } from '~/screens/universal_search/detail/search_detail.screen';

const { ALL_TYPES, EQUITY, ETFS, MF, WARRANT, FUTURE } = ENUM.SYMBOL_CLASS;

arrSymbolClass = [ALL_TYPES, EQUITY, ETFS, MF, WARRANT, FUTURE];

export class UniversalSearch extends PureComponent {
    constructor(props) {
        super(props);
        this.isReady = false;
        this.dic = {
            channelLoadingSearch: Channel.getChannelLoadingSearch()
        };
        this.closeModal = this.closeModal.bind(this);
        this.searchSymbol = this.searchSymbol.bind(this);
        this.listSymbolClass = this.getListSymClass();
        this.showSearchPreview = this.showSearchPreview.bind(this);
        this.switchToNewOrderScreen = this.switchToNewOrderScreen.bind(this);
        this.onAuth = this.onAuth.bind(this);
        this.changeTitle = this.changeTitle.bind(this);
        this.backToSearch = this.backToSearch.bind(this);
        this.props.navigator.addOnNavigatorEvent((e) =>
            this.onNavigatorEvent(e)
        );
        this.selectedClass = ALL_TYPES;
        this.channelAuth = Channel.getChannelRequestCheckAuthen('authUnis');
        this.state = {
            symbol: {},
            title: props.showOnInit ? 'universalSearch' : ''
        };
    }

    componentDidMount() {
        const { showOnInit, symbol } = this.props;
        if (showOnInit) {
            const data = func.getSymbolObj(symbol);
            this.showSearchPreview({ data });
        }
    }

    changeTitle(title) {
        this.setState({ title });
    }

    showSearchPreview({ data }) {
        this.data = data;
        // data.symbol && this.props.setSymbolSearchDetail(data.symbol)
        data &&
            this.searchPreview &&
            this.searchPreview.show &&
            this.searchPreview.show({ data });
    }

    getListSymClass() {
        const result = [];
        _.map(arrSymbolClass, (value) => {
            result.push({
                id: value,
                label: I18n.t(value),
                action: (...params) => {
                    this.selectedClass = value;
                    this.props.onSelectSymbolClass(...params);
                }
            });
        });
        return result;
    }

    onNavigatorEvent(event) {
        switch (event.id) {
            case 'willAppear':
                setCurrentScreen(analyticsEnum.universalSearch);

                const {
                    displayName,
                    typeNews,
                    getSearchHistory,
                    textSearch
                } = this.props;
                let text = textSearch || '';
                if (displayName && typeNews) {
                    text = displayName;
                }
                getSearchHistory(text);
                break;
            case 'search_refresh':
                break;
            case 'didAppear':
                setTimeout(() => {
                    Business.setStatusBarBackgroundColor();
                }, 2000);
                if (dataStorage.backNewsDetail) {
                    dataStorage.backNewsDetail = false;
                }
                func.setCurrentScreenId(ScreenId.UNIVERSAL_SEARCH);

                setTimeout(() => {
                    this.focusSearchText && this.focusSearchText();
                }, 500);
                break;
            default:
                break;
        }
    }

    closeModal() {
        Business.setStatusBarBackgroundColor({
            backgroundColor: CommonStyle.statusBarBgColor
        });
        Keyboard.dismiss();

        // reset reducer
        this.props.resetAll();

        this.props.navigator.dismissModal({
            animated: true,
            animationType: 'slide-down'
        });
    }

    searchSymbol(text) {
        if (text === '') {
            this.props.getResult(text);
            return;
        }

        if (this.waitSearch) {
            clearTimeout(this.waitSearch);
        }

        if (text.length === 1) return;

        this.waitSearch = setTimeout(() => {
            this.props.getResult(text);
        }, 700);
    }

    onAuth(isBuy, value) {
        this.isBuy = isBuy;
        this.value = value;
        Emitter.emit(this.channelAuth);
    }

    switchToNewOrderScreen() {
        try {
            if (!Controller.getLoginStatus()) return;
            const {
                symbol = '',
                exchange = '',
                change_percent: changePercent,
                ask_price: askPrice = 0,
                bid_price: bidPrice = 0,
                trade_price: tradePrice = 0
            } = this.value || {};
            const exchanges = func.getExchangeSymbol(symbol);
            const isParitech = Business.isParitech(symbol);
            const curChangePercent = changePercent
                ? formatNumberNew2(changePercent)
                : 0;
            const curTradePrice = tradePrice
                ? formatNumberNew2(tradePrice)
                : null;
            const limitPrice = this.isBuy ? askPrice : bidPrice;
            const { navigator } = this.props;
            showNewOrderModal({
                navigator,
                passProps: {
                    displayName: symbol,
                    isBuy: this.isBuy,
                    code: symbol,
                    exchange,
                    isParitech,
                    changePercent: curChangePercent,
                    tradePrice: curTradePrice,
                    exchanges: getExchange(exchanges),
                    limitPrice,
                    stopPrice: tradePrice,
                    volume: 0,
                    isNotShowMenu: true
                }
            });
        } catch (error) {
            logDevice('info', 'onOrder price exception');
            logAndReport('onOrder price exception', error, 'onOrder price');
            console.catch(error);
        }
    }

    backToSearch() {
        if (this.searchPreview) {
            if (this.props.showOnInit) {
                this.props.navigator.dismissModal({
                    animated: true,
                    animationType: 'slide-down'
                });
            } else {
                this.searchPreview.onClose && this.searchPreview.onClose();
            }
        }
    }

    render() {
        const { textSearch, navigator, showOnInit } = this.props;
        const isHistory = textSearch === '' || _.isNil(textSearch);
        return (
            <View
                style={{
                    flex: 1,
                    backgroundColor: CommonStyle.backgroundColor
                }}
                testID="universalSearch"
            >
                {!this.state.title ? (
                    <SearchBar
                        ref={(sef) => {
                            if (sef) {
                                this.focusSearchText = sef.focus;
                            }
                        }}
                        textSearch={textSearch}
                        navigator={navigator}
                        onSearch={this.searchSymbol}
                        onCancel={this.closeModal}
                        isHistory={isHistory}
                    />
                ) : (
                    <NavBar
                        channelLoading={this.dic.channelLoadingSearch}
                        navigator={navigator}
                        title={I18n.t(this.state.title)}
                        backToSearch={this.backToSearch}
                        c2r={() => {}}
                    />
                )}
                <NetworkWarning />
                {func.getUserPriceSource() === userType.Delay ? (
                    <Warning
                        testID="overviewWarning"
                        warningText={I18n.t('delayWarning')}
                        isConnected={true}
                    />
                ) : null}
                <View style={{ flex: 1 }}>
                    {showOnInit && !this.isReady ? null : (
                        <View
                            style={{
                                backgroundColor: CommonStyle.backgroundColor
                            }}
                        >
                            <ScrollBarUndeline
                                listItem={this.listSymbolClass}
                            />
                        </View>
                    )}

                    {showOnInit && !this.isReady ? null : (
                        <SearchResult
                            showSearchPreview={this.showSearchPreview}
                            textSearch={textSearch}
                            isHistory={isHistory}
                            navigator={this.props.navigator}
                            selectedClass={this.selectedClass}
                        />
                    )}
                    <SearchPreView
                        setRef={(ref) => (this.searchPreview = ref)}
                        onAuth={this.onAuth}
                        changeTitle={this.changeTitle}
                        title={this.state.title}
                        navigator={navigator}
                    />
                </View>
                <AuthenPin
                    showQuickButton={false}
                    navigator={navigator}
                    onAuthSuccess={this.switchToNewOrderScreen}
                    channelRequestCheckAuthen={this.channelAuth}
                />
            </View>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        listData: state.uniSearch.listData,
        textSearch: state.uniSearch.textSearch
    };
}

function mapDispatchToProps(dispatch) {
    return {
        setSymbolSearchDetail: (...p) =>
            dispatch(searchDetailActions.setSymbolSearchDetail(...p)),
        getSearchHistory: (...params) =>
            dispatch(searchActions.uniSearchGetHistory(...params)),
        getResult: (...params) =>
            dispatch(searchActions.uniSearchGetResult(...params)),
        onSelectSymbolClass: (...params) =>
            dispatch(searchActions.uniSearchSetSymbolClass(...params)),
        resetAll: (...params) =>
            dispatch(searchActions.uniSearchReset(...params))
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(UniversalSearch);
