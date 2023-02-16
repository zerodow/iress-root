import React, { useRef, useEffect, useState } from 'react';
import { Text, StyleSheet, View, Dimensions } from 'react-native';
import Animated from 'react-native-reanimated';
import _ from 'lodash';
import { connect, useSelector } from 'react-redux';

import DetailScreen from '~s/watchlist/Navigation/DetailScreen';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func'
import BackDropView from '~s/watchlist/Component/BackDropView2';
import { HeaderTradeList as BaseHeaderTradeList } from '~s/watchlist/Header/header.tradeList';
import { HeaderRow } from '~s/watchlist/Header/header.row';
import SCREEN from '~s/watchlist/screenEnum';

import NestedScrollView from '~s/watchlist/Component/NestedScroll/WatchlistNested';
import SymbolDetail from '~s/watchlist/Detail';

const { add, interpolate, Value } = Animated;

const { height: HEIGHT_DEVICE } = Dimensions.get('window');

// const mapStateToProps = (state) => {
//     const { priceBoardSelected, priceBoard, screenSelected } = state.watchlist3;

//     let listSymbol = [];

//     let { value } = priceBoard[priceBoardSelected] || {};
//     listSymbol = _.sortBy(value, 'rank');
//     listSymbol = _.map(listSymbol, ({ symbol, exchange }) => ({
//         symbol,
//         exchange
//     }));

//     return {
//         screenSelected,
//         listSymbol
//     };
// };

// const HeaderTradeList = connect(mapStateToProps, null, null, {
//     forwardRef: true
// })(HeaderTradeListComp);
class HeaderTradeList extends BaseHeaderTradeList {
    renderRow = this.renderRow.bind(this);
    renderRow({ item }) {
        const { symbol, exchange } = item || {};
        const quote = {
            change_point: item.change_point,
            change_percent: item.change_percent,
            trade_price: item.trade_price
        };
        return (
            <HeaderRow
                exchange={exchange}
                symbol={symbol}
                onRowPress={this.props.onRowPress}
                data={{ quote }}
            />
        );
    }
}

let CustomNested = ({
    refVerticalScroll,
    _isScrollContent,
    _scrollValue,
    _scrollContainer,
    setRefNested,
    renderHeaderPanner,
    _spaceTop,
    onCloseDetailByScroll,
    _changePoint,
    symbol,
    exchange,
    navigator,
    onAuth,
    onCloseDetail,
    setRefSymbolDetail
}) => (
        <NestedScrollView
            refVerticalScroll={refVerticalScroll}
            _isScrollContent={_isScrollContent}
            _scrollValue={_scrollValue}
            _scrollContainer={_scrollContainer}
            ref={setRefNested}
            renderHeaderPanner={renderHeaderPanner}
            spaceTop={_spaceTop}
            hideCallback={onCloseDetailByScroll}
        >
            <View style={styles.bg} />
            <SymbolDetail
                refVerticalScroll={refVerticalScroll}
                _changePoint={_changePoint}
                symbol={symbol}
                exchange={exchange}
                navigator={navigator}
                onAuth={onAuth}
                onClose={onCloseDetail}
                ref={setRefSymbolDetail}
            />
        </NestedScrollView>
    );

CustomNested = React.memo(CustomNested);

class Detail extends DetailScreen {
    render() {
        const { navigator, onAuth, marketWatchlist } = this.props;
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
                            inputRange: [
                                -1,
                                0,
                                HEIGHT_DEVICE,
                                HEIGHT_DEVICE + 1
                            ],
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
                    screenSelected={SCREEN.WATCHLIST}
                    listSymbol={marketWatchlist}
                />
                <CustomNested
                    refVerticalScroll={this.refVerticalScroll}
                    _isScrollContent={this._isScrollContent}
                    _scrollValue={this._scrollValue}
                    _scrollContainer={this._scrollContainer}
                    setRefNested={this.setRefNested}
                    renderHeaderPanner={this.renderHeaderPanner}
                    _spaceTop={this._spaceTop}
                    onCloseDetailByScroll={this.onCloseDetailByScroll}
                    _changePoint={this._changePoint}
                    symbol={symbol}
                    exchange={exchange}
                    navigator={navigator}
                    onAuth={onAuth}
                    onCloseDetail={this.onCloseDetail}
                    setRefSymbolDetail={this.setRefSymbolDetail}
                />
            </React.Fragment>
        );
    }
}

export default ({ marketWatchlist, setRef, ...props }) => {
    const self = useRef();
    const [data, setData] = useState(marketWatchlist);

    useEffect(() => {
        self.current && clearTimeout(self.current);
        self.current = setTimeout(() => {
            setData(marketWatchlist);
        }, 300);
        return () => {
            if (self.current) {
                clearTimeout(self.current);
            }
            self.current = null;
        };
    }, [marketWatchlist]);

    return <Detail ref={setRef} {...props} marketWatchlist={data} />;
};

const styles = {}
function getNewestStyle() {
	const newStyle = StyleSheet.create({
    bg: {
        position: 'absolute',
        height: '150%',
        width: '100%',
        paddingTop: 33,
        backgroundColor: CommonStyle.backgroundColor
    }
});
PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)
