import React, { PureComponent } from 'react';
import { View, Text } from 'react-native';
import { connect } from 'react-redux';
import _ from 'lodash';

import CommonStyle from '~/theme/theme_controller';
import { func } from '~/storage';
import I18n from '~/modules/language';
import FlatList from '../../Animator/FLatListAni';
import Header from './header';
import Row from './row';
import TouchableOpacityOpt from '@component/touchableOpacityOpt';
import Animated, { Easing } from 'react-native-reanimated';

const { block, call, cond, eq, and, set } = Animated;

export const MoreButton = (props) => (
    <TouchableOpacityOpt onPress={props.onPress} style={[]}>
        <Text
            style={{
                fontSize: CommonStyle.fontSizeS,
                color: CommonStyle.fontBlue
            }}
        >
            {I18n.t('more')}
        </Text>
    </TouchableOpacityOpt>
);

class MarketDepths extends PureComponent {
    constructor(props) {
        super(props);
        this.quantity = 10;
        this.maxLength = 10;

        let { actived, tabIndex } = props;
        if (tabIndex === undefined || tabIndex === null) {
            tabIndex = 1;
        }

        this.canRunAni = new Animated.Value(1);

        this.listenerActivedChange = block([
            cond(
                eq(actived, tabIndex),
                cond(this.canRunAni, [
                    call([], () => this._list && this._list.start()),
                    set(this.canRunAni, 0)
                ]),
                [
                    call([], () => this._list && this._list.hide()),
                    set(this.canRunAni, 1)
                ]
            )
        ]);
    }
    componentWillReceiveProps(nextProps) {
        if (
            this.props.symbol !== nextProps.symbol ||
            this.props.exchange !== nextProps.exchange
        ) {
            this.canRunAni.setValue(1);
        }
    }

    getData(depth) {
        if (_.isEmpty(depth)) return [];

        const { Bid, Ask } = depth || {};

        const { quantity: maxAsk = 1 } =
            _.maxBy(_.values(Ask), (o) => o.quantity) || {};
        const { quantity: maxBid = 1 } =
            _.maxBy(_.values(Bid), (o) => o.quantity) || {};

        const max = Math.max(maxBid, maxAsk);
        this.updateMaxLength(Math.max(_.size(Ask), _.size(Bid)));
        const quantity =
            this.maxLength < this.quantity ? this.maxLength : this.quantity;

        const listData = [];
        for (let index = 0; index < quantity; index++) {
            const elementAsk = Ask[index] || {};
            const elementBid = Bid[index] || {};

            listData.push({
                ask: {
                    price: elementAsk.price,
                    quantity: elementAsk.quantity,
                    percent: elementAsk.quantity / max,
                    no: elementAsk.number_of_trades
                },
                bid: {
                    price: elementBid.price,
                    quantity: elementBid.quantity,
                    percent: elementBid.quantity / max,
                    no: elementBid.number_of_trades
                }
            });
        }

        return listData;
    }

    renderEmpty(isEmpty) {
        // if (!isEmpty) return <View />
        return (
            <View
                onLayout={this.props.onLayout}
                style={{
                    paddingHorizontal: 16,
                    height: 205,
                    alignItems: 'center',
                    justifyContent: 'center'
                    // backgroundColor: CommonStyle.backgroundColor
                }}
            >
                <Text
                    style={{
                        color: CommonStyle.fontColor,
                        fontFamily: CommonStyle.fontPoppinsRegular
                    }}
                >
                    {I18n.t('noData')}
                </Text>
            </View>
        );
    }

    updateMaxLength = this.updateMaxLength.bind(this);
    updateMaxLength(maxLength) {
        this.maxLength = maxLength;
    }

    loadMore = this.loadMore.bind(this);
    loadMore() {
        const newQuantity = this.quantity + 10;
        if (newQuantity > this.maxLength) {
            this.quantity += this.maxLength - this.quantity;
        } else {
            this.quantity += 10;
        }
        this.forceUpdate();
    }

    renderHeader = this.renderHeader.bind(this);
    renderHeader() {
        return <Header />;
    }

    renderFooter = this.renderFooter.bind(this);
    renderFooter() {
        return <Animated.Code exec={this.listenerActivedChange} />;
    }

    setRef = this.setRef.bind(this);
    setRef(sef) {
        this._list = sef;
    }

    renderItem = this.renderItem.bind(this);
    renderItem({ item, index }) {
        return <Row item={item} index={index} />;
    }

    renderMore = this.renderMore.bind(this);
    renderMore() {
        if (this.quantity >= this.maxLength) return null;
        return <MoreButton onPress={this.loadMore} />;
    }

    render() {
        const data = this.getData(this.props.depth);
        if (_.isEmpty(data)) {
            return this.renderEmpty();
        }
        return (
            <React.Fragment>
                <FlatList
                    ref={this.setRef}
                    passPropsToChild
                    numberListDelay={1}
                    scrollEnabled={false}
                    contentContainerStyle={{ paddingHorizontal: 8 }}
                    withoutDidmount
                    onLayout={this.props.onLayout}
                    data={data}
                    renderItem={this.renderItem}
                    ItemSeparatorComponent={() => (
                        <View style={{ height: 1 }} />
                    )}
                    ListHeaderComponent={this.renderHeader}
                    ListFooterComponent={this.renderFooter}
                />
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state, { symbol, exchange }) => {
    const { marketData } = state.streamMarket;
    const { depth = {} } =
        (marketData && marketData[exchange] && marketData[exchange][symbol]) ||
        {};
    return { depth };
};

export default connect(mapStateToProps)(MarketDepths);
