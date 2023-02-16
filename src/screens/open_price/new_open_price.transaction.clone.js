import React, { PureComponent } from 'react';
import { Text, View, FlatList, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';

import * as loginActions from '../login/login.actions';
import * as Controller from '../../memory/controller';
import Enum from '../../enum';
import Ionicons from 'react-native-vector-icons/Ionicons';
import OpenPriceActions from './new_open_price.reducer';
import ProgressBar from '../../modules/_global/ProgressBar';
import CommonStyle, { register } from '~/theme/theme_controller';
import HighLightText from '~/modules/_global/HighLightText'
import * as PureFunc from '~/utils/pure_func';
import {
    formatNumber,
    formatNumberNew2,
    renderTime,
    formatNumberNew2ClearZero
} from '../../lib/base/functionUtil';
import { getDateStringWithFormat } from '../../lib/base/dateTime';
import { getSymbolInfo } from '../../app.actions';
import { func, dataStorage } from '../../storage';

const styles = {}
const PRICE_DECIMAL = Enum.PRICE_DECIMAL;

loginActions['getSymbolInfo'] = getSymbolInfo;

class Row extends PureComponent {
    render() {
        const {
            volume,
            price,
            is_buy: isBuy,
            testID,
            style,
            updated,
            trade_date: tradeDate
        } = this.props.data;

        if (volume === 0 && price === 0) {
            return <View />;
        }

        return (
            <TouchableOpacity onPress={() => this.props.handleShowPortfolioDetail({ data: this.props.data })} style={[styles.rowExpand3, style, { borderBottomWidth: 1, borderColor: CommonStyle.fontBorderGray, paddingVertical: 6 }]}>
                <View
                    style={{
                        paddingRight: 8,
                        width: '50%',
                        flexDirection: 'row',
                        alignItems: 'center',
                        flex: 1
                    }}
                >
                    <Ionicons
                        name={isBuy === '1' ? 'ios-arrow-up' : 'ios-arrow-down'}
                        style={{
                            color: isBuy === '1' ? '#00b800' : '#df0000',
                            width: 24,
                            height: 24,
                            textAlign: 'center',
                            top: 2,
                            marginRight: 8
                        }}
                        size={24}
                    />
                    <View style={{ flex: 1, height: '100%', justifyContent: 'space-around' }}>
                        <Text style={[CommonStyle.textMainLight, { opacity: 1 }]}>{renderTime(tradeDate, 'DD MMM YYYY')}</Text>
                        <Text
                            testID={`tradeDate-${testID}`}
                            numberOfLines={1}
                            style={[CommonStyle.textSub]}>
                            {renderTime(tradeDate, 'HH:mm:ss', false)}
                        </Text>
                    </View>
                    {/* <Text
						testID={`volumePrice-${testID}`}
						style={[CommonStyle.textSubNormalBlack]}
					>{`${formatNumber(volume)} @ ${formatNumberNew2(
						price,
						PRICE_DECIMAL.PRICE
					)}`}</Text> */}
                </View>
                <View style={{ width: '50%', flexDirection: 'row' }}>
                    <View style={[styles.col5, { alignItems: 'flex-end' }]}>
                        <HighLightText
                            testID={`transactionVolume`}
                            style={[CommonStyle.textMainNoColor, { textAlign: 'right', paddingRight: 4 }]}
                            base={formatNumberNew2ClearZero(volume)}
                            value={!volume ? 0 : formatNumberNew2ClearZero(volume)} />
                    </View>
                </View>
            </TouchableOpacity>
        );
    }
}
export class OrderTransaction extends PureComponent {
    componentWillReceiveProps = nextProps => {
        const { isLoading, listOrder } = nextProps.data
        if (Array.isArray(listOrder) && listOrder.length === 0) {
            this.props.handleCloseExpand()
        }
        if (this.props.symbol !== nextProps.symbol) {
            nextProps.getData(nextProps.symbol, true);
        }
    };

    componentDidMount = () => {
        const { symbol, getData } = this.props;
        getData(symbol, true);
    };

    renderLoading() {
        return (
            <View
                style={{
                    backgroundColor: 'white',
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            >
                <ProgressBar />
            </View>
        );
    }
    render() {
        const { isLoading, listOrder } = this.props.data;
        const { isEmptyDataPort } = this.props.dataPort;
        const { handleShowPortfolioDetail } = this.props
        const isPosition =
            dataStorage.accountId &&
            !isEmptyDataPort &&
            Controller.getLoginStatus();
        if (!isPosition) return <View />;
        // if (isLoading) return this.renderLoading();
        return (
            <View>
                <FlatList
                    style={{
                        paddingLeft: 16,
                        paddingRight: 16
                    }}
                    data={listOrder}
                    renderItem={({ item, index }) => (
                        <Row handleShowPortfolioDetail={handleShowPortfolioDetail} index={index} data={item} />
                    )}
                />
                <View style={{ width: '100%', height: 11 }} />
            </View>
        );
    }
}

const mapStateToProps = state => ({
    data: state.topOrderTransaction,
    dataPort: state.searchPortfolio
});

const mapDispatchToProps = dispatch => ({
    getData: (...p) => dispatch(OpenPriceActions.getTopOrderTransaction(...p))
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(OrderTransaction);
