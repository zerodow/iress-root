import React, { Component } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { func } from '~/storage';
import BackDropView from '~s/watchlist/Component/BackDropView2';
import HeaderTradeList from '~s/watchlist/Header/header.tradeList';
import NestedScrollView from '~s/watchlist/Component/NestedScroll/WatchlistNested';
import SymbolDetail from '~s/watchlist/Detail';
import I18n from '@module/language/';
import HeaderPanner from '~s/watchlist/Detail/components/HeaderPanner';
import HeaderDetail from '~s/watchlist/Detail/components/Header';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func'
import { isIphoneXorAbove } from '~/lib/base/functionUtil';
import * as Business from '~/business';

const TRADELIST_PADDING = 0;
const HEIGHT_HEADER = isIphoneXorAbove() ? 30 : 0;
const HEIGHT_LINE_BOTTOM_HEADER = 16;
const isHideNews = true;
const isDisableShowNewDetail = true;

const { add, sub, interpolate, Value } = Animated;

const { height: heightDevice } = Dimensions.get('window');

export default class DetailScreen extends Component {
    constructor(props) {
        super(props);
        this._scrollValue = new Value(0);
        this._scrollContainer = new Value(heightDevice);

        this._isScrollContent = new Value(0);
        this._heightInfinit =
            this.props.heightHeader || new Value(HEIGHT_HEADER);
        this._changePoint = new Value(0);
        this._spaceTop = add(
            sub(this._heightInfinit, HEIGHT_LINE_BOTTOM_HEADER),
            TRADELIST_PADDING
        );

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

    setRefNested = this.setRefNested.bind(this);
    setRefNested(sef) {
        this._nested = sef;
    }

    changeSymbol = this.changeSymbol.bind(this);
    changeSymbol(symbol, exchange) {
        this._nested && this._nested.show();

        setTimeout(() => {
            this.setState({
                symbol,
                exchange: exchange || func.getExchangeSymbol(symbol)
            });
        }, 10);
    }

    onCloseDetail = this.onCloseDetail.bind(this);
    onCloseDetail() {
        this._nested && this._nested.hide();
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

    renderUndergroundView = this.renderUndergroundView.bind(this);
    renderUndergroundView() {
        return (
            <View
                style={[
                    styles.bg,
                    {
                        zIndex: -100,
                        borderTopLeftRadius: 28,
                        borderTopRightRadius: 28
                    }
                ]}
            />
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
                            outputRange: [0.85, 0.85, 0, 0]
                        })
                    }
                />
                <NestedScrollView
                    _isScrollContent={this._isScrollContent}
                    _scrollValue={this._scrollValue}
                    _scrollContainer={this._scrollContainer}
                    ref={this.setRefNested}
                    renderUnderGroundView={this.renderUndergroundView()}
                    renderHeaderPanner={this.renderHeaderPanner}
                    spaceTop={this._spaceTop}
                >
                    <View style={styles.bg} />
                    <SymbolDetail
                        isDisableShowNewDetail={isDisableShowNewDetail}
                        _changePoint={this._changePoint}
                        exchange={exchange}
                        navigator={navigator}
                        onAuth={onAuth}
                        onClose={this.onCloseDetail}
                        ref={this.setRefSymbolDetail}
                        symbol={symbol}
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
