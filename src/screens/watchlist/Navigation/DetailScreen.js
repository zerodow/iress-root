import React, { Component } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { func } from '~/storage';
import BackDropView from '../Component/BackDropView2';
import HeaderTradeList from '../Header/header.tradeList';
import NestedScrollView from '../Component/NestedScroll/WatchlistNested';
import SymbolDetail from '../Detail';
import I18n from '@module/language/';
import HeaderPanner from '../Detail/components/HeaderPanner';
import HeaderDetail from '../Detail/components/Header';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func'
import * as Business from '~/business';
import ENUM from '~/enum';

const { WATCHLIST } = ENUM;

const TRADELIST_PADDING = 12;

const { add, interpolate, Value } = Animated;

const { height: heightDevice } = Dimensions.get('window');

export default class DetailScreen extends Component {
    constructor(props) {
        super(props);
        this.refVerticalScroll = React.createRef();
        this._scrollValue = new Value(0);
        this._scrollContainer = new Value(heightDevice * 1.3);

        this._isScrollContent = new Value(0);
        this._heightInfinit = new Value(0);
        this._changePoint = new Value(0);
        this._spaceTop = add(this._heightInfinit, TRADELIST_PADDING);

        this.state = {
            symbol: '',
            exchange: '',
            isFirstLoad: true
        };
    }

    componentDidMount() {
        setTimeout(() => {
            this.setState({
                isFirstLoad: false
            });
        }, 1000);
    }

    // #region bind ref

    setRefSymbolDetail = this.setRefSymbolDetail.bind(this);
    setRefSymbolDetail(sef) {
        this._detail = sef && sef;
    }

    setRefHeader = this.setRefHeader.bind(this);
    setRefHeader(sef) {
        this._header = sef && sef;
    }

    setRefNested = this.setRefNested.bind(this);
    setRefNested(sef) {
        this._nested = sef;
    }

    changeSymbol = this.changeSymbol.bind(this);
    changeSymbol(
        symbol,
        exchange,
        isAutoScrollInfi = true,
        handleShowAddSymbol,
        priceBoardSelected
    ) {
        this.priceBoardSelected = priceBoardSelected;
        this.handleShowAddSymbol = handleShowAddSymbol;
        this._nested && this._nested.show();
        if (isAutoScrollInfi) {
            this._header && this._header.resetInfinit();
        }
        // Reset market info
        this._detail && this._detail.reset();
        setTimeout(() => {
            this.setState({
                symbol,
                exchange
            });
        }, 10);
    }

    onCloseDetail = this.onCloseDetail.bind(this);
    onCloseDetail() {
        console.log('Nchan onCloseDetail');
        const isSyncDicSymbolSelected =
            this.priceBoardSelected === WATCHLIST.USER_WATCHLIST;
        this.handleShowAddSymbol &&
            this.handleShowAddSymbol(isSyncDicSymbolSelected);
        this.handleShowAddSymbol = null;
        this._nested && this._nested.hide();
    }

    onCloseDetailByScroll = this.onCloseDetailByScroll.bind(this);
    onCloseDetailByScroll() {
        console.log('Nchan onCloseDetail onCloseDetailByScroll');
        this.handleShowAddSymbol && this.handleShowAddSymbol();
        this.handleShowAddSymbol = null;
        this._header && this._header.stop();
        this._detail && this._detail.unSubLv1();
        this._detail && this._detail.unSubLv2();
        this._detail && this._detail.unSubCos();
        setTimeout(() => {
            this._detail && this._detail.reset();
        }, 500);
    }

    onRefresh = this.onRefresh.bind(this);
    onRefresh() {
        this._detail && this._detail.getSnapshot();
    }

    // #endregion

    renderHeaderPanner = this.renderHeaderPanner.bind(this);
    renderHeaderPanner() {
        const { symbol, exchange } = this.state;
        const companyName = Business.getCompanyName({ symbol, exchange });

        return (
            // Tren con mi. Noi giua 2 view ma co mot gach trong suot lam cho khi vuot hien bi chop chop
            <View
                style={{
                    backgroundColor: CommonStyle.backgroundColor,
                    borderTopLeftRadius: 22,
                    borderTopRightRadius: 22
                }}
            >
                <HeaderPanner
                    title={companyName}
                    onClose={this.onCloseDetail}
                    onRefresh={this.onRefresh}
                />
                <View style={{ height: 1 }} />
            </View>
        );
    }

    render() {
        const { navigator, onAuth } = this.props;
        const { symbol, exchange, isFirstLoad } = this.state;
        if (isFirstLoad) return null;
        return (
            <React.Fragment>
                <BackDropView
                    spaceTop={this._spaceTop}
                    _scrollValue={this._scrollContainer}
                    _isScrollContent={this._isScrollContent}
                    opacityInterpolate={(translateY) =>
                        interpolate(translateY, {
                            inputRange: [-1, 0, heightDevice, heightDevice + 1],
                            outputRange: [1, 1, 0, 0]
                        })
                    }
                />
                <HeaderTradeList
                    _heightInfinit={this._heightInfinit}
                    _isScrollContent={this._isScrollContent}
                    _scrollValue={this._scrollContainer}
                    navigator={navigator}
                    onRowPress={this.changeSymbol}
                    ref={this.setRefHeader}
                />
                <NestedScrollView
                    refVerticalScroll={this.refVerticalScroll}
                    _isScrollContent={this._isScrollContent}
                    _scrollValue={this._scrollValue}
                    _scrollContainer={this._scrollContainer}
                    ref={this.setRefNested}
                    renderHeaderPanner={this.renderHeaderPanner}
                    spaceTop={this._spaceTop}
                    hideCallback={this.onCloseDetailByScroll}
                >
                    <View style={styles.bg} />
                    <SymbolDetail
                        refVerticalScroll={this.refVerticalScroll}
                        _changePoint={this._changePoint}
                        symbol={symbol}
                        exchange={exchange}
                        navigator={navigator}
                        onAuth={onAuth}
                        onClose={this.onCloseDetail}
                        ref={this.setRefSymbolDetail}
                    />
                </NestedScrollView>
            </React.Fragment>
        );
    }
}

const styles = {}
function getNewestStyle() {
	const newStyle = StyleSheet.create({
    bg: {
        position: 'absolute',
        height: '150%',
        width: '100%',
        paddingTop: 33,
        backgroundColor: CommonStyle.backgroundColor
        // borderTopLeftRadius: 24,
        // borderTopRightRadius: 24
    }
});
PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)
