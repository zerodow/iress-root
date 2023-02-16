import React, { PureComponent } from 'react';
import { View, Text } from 'react-native';
import { connect } from 'react-redux';
import _ from 'lodash';
import Animated from 'react-native-reanimated';
import CommonStyle from '~/theme/theme_controller';
import { func } from '~/storage';
import {
    formatNumber,
    formatNumberNew2,
    renderTime
} from '~/lib/base/functionUtil';
import { getDateOnly, addDaysToTime } from '~/lib/base/dateTime';
import Row from './row';
import Header from './header';
import Enum from '~/enum';
import I18n from '~/modules/language';
import FlatList from '../../Animator/FLatListAni';
import { MoreButton } from '../martketDepth';

const { block, call, cond, eq } = Animated;
const QUANTITY = 10;

class MarketTrades extends PureComponent {
    constructor(props) {
        super(props);
        this.quantity = 10;
        this.maxLength = 10;

        this.state = {
            size: 10
        };
        const { actived, tabIndex } = props;
        this.listenerActivedChange = block([
            cond(
                eq(actived, tabIndex),
                call([], () => this._list && this._list.start()),
                call([], () => this._list && this._list.hide())
            )
        ]);
    }

    setRef = this.setRef.bind(this);
    setRef(sef) {
        this._list = sef;
    }

    renderFooter = this.renderFooter.bind(this);
    renderFooter() {
        return <Animated.Code exec={this.listenerActivedChange} />;
    }

    renderHeader = this.renderHeader.bind(this);
    renderHeader() {
        return <Header actived={this.props.actived} />;
    }

    renderItem = this.renderItem.bind(this);
    renderItem({ item }) {
        const { quantity, price, time, side } = item;

        const endTime = getDateOnly(addDaysToTime(new Date(), 1)).getTime() - 1;
        let format = 'HH:mm:ss';
        // if (time > endTime) {
        //     format = 'DD MMM HH:mm:ss';
        // }
        const displayTime = renderTime(time, format);
        return (
            <React.Fragment>
                <Row>
                    <Text style={CommonStyle.textMainLight}>{displayTime}</Text>

                    <Text style={CommonStyle.textMainLight}>{side}</Text>

                    <Text style={CommonStyle.textMainNormal}>
                        {formatNumber(quantity)}
                    </Text>

                    <Text style={CommonStyle.textMain}>
                        {formatNumberNew2(
                            price,
                            Enum.PRICE_DECIMAL.IRESS_PRICE
                        )}
                    </Text>
                </Row>
                <View
                    style={{
                        borderBottomWidth: 1,
                        borderColor: CommonStyle.fontBorderNewsUi
                    }}
                />
            </React.Fragment>
        );
    }

    renderEmpty(isEmpty) {
        // if (!isEmpty) return <View />
        return (
            <View
                onLayout={this.props.onLayout}
                style={{
                    height: 200,
                    paddingHorizontal: 16,
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            >
                <Text style={{ color: CommonStyle.fontColor, fontFamily: CommonStyle.fontPoppinsRegular }}>
                    {I18n.t('noData')}
                </Text>
            </View>
        );
    }

    getTradeData() {
        let { trade } = this.props.trades;
        trade = _.take(trade, this.state.size);
        return trade;
    }

    loadMore = this.loadMore.bind(this);
    loadMore() {
        this.setState((pre) => ({ size: pre.size + QUANTITY }));
    }

    renderMore = this.renderMore.bind(this);
    renderMore() {
        let { trade } = this.props.trades;
        if (this.state.size >= _.size(trade)) return null;
        return <MoreButton onPress={this.loadMore} />;
    }

    render() {
        const data = this.getTradeData();
        if (_.isEmpty(data)) {
            return this.renderEmpty();
        }

        return (
            <FlatList
                ref={this.setRef}
                numberListDelay={1}
                scrollEnabled={false}
                contentContainerStyle={{ paddingHorizontal: 8 }}
                withoutDidmount
                onLayout={this.props.onLayout}
                data={_.take(data, 20)}
                ListHeaderComponent={this.renderHeader}
                renderItem={this.renderItem}
                ListFooterComponent={this.renderFooter}
            />
        );
    }
}

const mapStateToProps = (state, { symbol, exchange }) => {
    const { marketData } = state.streamMarket;
    const { trades = {} } =
        (marketData && marketData[exchange] && marketData[exchange][symbol]) ||
        {};
    return { trades };
};

export default connect(mapStateToProps)(MarketTrades);
