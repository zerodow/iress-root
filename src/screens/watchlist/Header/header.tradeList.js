import React, { Component } from 'react';
import { StyleSheet, Dimensions, View } from 'react-native';
import { connect } from 'react-redux';
import _ from 'lodash';
import Animated from 'react-native-reanimated';

import InfiniteScroll from '../Component/InfinitScroll.2';
import HeaderLoading from './header.loading';

import * as Emitter from '@lib/vietnam-emitter';
import * as Channel from '~/streaming/channel';
import { func } from '~/storage';

import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func'

import Row from './header.row';
import ShowHideComp from '../Detail/components/ShowHideAni';
import AppState from '~/lib/base/helper/appState2';

import { topSpace } from '../Component/DefaultHeader';
import SCREEN from '../screenEnum';

const NUMBER_LOOP = 5;
const PADDING_BOTTOM = 8;

const { lessThan, greaterThan, Value, block, set, add } = Animated;

const { height: deviceHeight } = Dimensions.get('window');

export class HeaderTradeList extends Component {
    constructor(props) {
        super(props);
        this.renderRow = this.renderRow.bind(this);
        this.dicRef = {};
        this.state = {
            isShowUnis: false
        };
        this.id = Math.random();
        this._heightContent = new Value(0);
        this._scrollValue = new Value(0);

        this._heightInfinit = this.props._heightInfinit || new Value(0);

        this.appState = new AppState(
            () => {
                this.infi && this.infi.autoScroll(10);
            },
            () => {
                this.infi && this.infi.disAutoScroll();
            }
        );
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (
            !_.isEqual(this.props, nextProps) ||
            !_.isEqual(this.state, nextState)
        );
    }

    componentDidMount() {
        Emitter.addListener('change_header_watchlist_unis', null, (data) => {
            this.setState({ isShowUnis: data.isShow });
        });

        this.appState.addListenerAppState();
        this.subRefresh();
    }

    componentWillUnmount() {
        this.appState.removeListenerAppState();
        Emitter.deleteByIdEvent(this.id);
    }

    resetInfinit() {
        this.infi && this.infi.snapToTop();
        this.infi && this.infi.autoScroll(2000);
    }

    stop() {
        // _.forEach(this.recursiveIndex, item => clearTimeout(item));
        // this.recursiveIndex = {};
        setTimeout(() => {
            this.infi && this.infi.disAutoScroll();
            this.infi && this.infi.snapToTop();
        }, 1000);
    }

    subRefresh() {
        const changeScrollPrice = Channel.getChangeScrollPrice();
        Emitter.addListener(changeScrollPrice, this.id, () => {
            this.getSnapshotLv1 && this.getSnapshotLv1();
        });
    }

    renderRow({ item }) {
        const { symbol, exchange } = item || {};

        return (
            <Row
                exchange={exchange}
                symbol={symbol}
                onRowPress={this.props.onRowPress}
            />
        );
    }

    setRef = this.setRef.bind(this);
    setRef(sef) {
        this.infi = sef;
    }

    render() {
        const { style, screenSelected, _scrollValue } = this.props;
        if (
            screenSelected !== SCREEN.WATCHLIST &&
            screenSelected !== SCREEN.SEARCH_WATCHLIST
        ) {
            return <View />;
        }
        return (
            <ShowHideComp
                withTrans={-deviceHeight / 3}
                style={[
                    styles.container,
                    style,
                    {
                        height: this._heightInfinit
                    }
                ]}
                isHide={greaterThan(_scrollValue, 3)}
                isShow={lessThan(_scrollValue, 3)}
            >
                <Animated.Code
                    exec={block([
                        set(
                            this._heightInfinit,
                            add(this._heightContent, topSpace, PADDING_BOTTOM)
                        )
                    ])}
                />
                <HeaderLoading
                    numberLoop={NUMBER_LOOP}
                    data={this.props.listSymbol}
                    _scrollValue={this._scrollValue}
                />
                <InfiniteScroll
                    numberLoop={NUMBER_LOOP}
                    ref={this.setRef}
                    data={this.props.listSymbol}
                    renderItem={this.renderRow}
                    _scrollValue={this._scrollValue}
                    _heightContent={this._heightContent}
                />
            </ShowHideComp>
        );
    }
}

const mapStateToProps = (state) => {
    const { priceBoardSelected, priceBoard, screenSelected } = state.watchlist3;

    let listSymbol = [];

    let { value } = priceBoard[priceBoardSelected] || {};
    listSymbol = _.sortBy(value, 'rank');
    listSymbol = _.map(listSymbol, ({ symbol, exchange }) => ({
        symbol,
        exchange
    }));

    return {
        screenSelected,
        listSymbol
    };
};

const styles = {}
function getNewestStyle() {
	const newStyle = StyleSheet.create({
    container: {
        position: 'absolute',
        width: '100%',
        backgroundColor: CommonStyle.backgroundColor,
        justifyContent: 'flex-end',
        marginBottom: PADDING_BOTTOM,
        zIndex: 99
    }
});
PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

HeaderTradeList.defaultProps = {
    onRowPress: () => null,
    tradelistPadding: 0
};

export default connect(mapStateToProps, null, null, { forwardRef: true })(
    HeaderTradeList
);
