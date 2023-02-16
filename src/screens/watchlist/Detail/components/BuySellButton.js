import React, { PureComponent, useCallback } from 'react';
import { View } from 'react-native';
import { connect, useDispatch } from 'react-redux';
import _ from 'lodash';
import { Navigation } from 'react-native-navigation';

import TradeButton from '~s/watchlist/Component/TradeButton';
import { convertNullValue } from '~/lib/base/functionUtil';

import CommonStyle from '~/theme/theme_controller'

import { changeBuySell, changeBuySellAndPositionAffected } from '~/screens/new_order/Redux/actions.js'
import * as Controller from '~/memory/controller';
import Enum from '~/enum'
const BuySellButton = ({ symbol, exchange }) => {
    const dispatch = useDispatch()
    const onPress = useCallback((isBuy) => {
        dispatch(changeBuySell(isBuy))
        Controller.setStatusModalCurrent(false);
        Navigation.showModal({
            screen: 'equix.NewOrder',
            animated: false,
            animationType: 'none',
            navigatorStyle: {
                ...CommonStyle.navigatorModalSpecialNoHeader,
                modalPresentationStyle: 'overCurrentContext'
            },
            passProps: {
                namePanel: Enum.NAME_PANEL.NEW_ORDER,
                isSwitchFromQuickButton: true,
                symbol,
                exchange
            }
        })
    }, [symbol, exchange])
    return (
        <View
            style={{
                flexDirection: 'row'
            }}
        >
            <TradeButton
                symbol={symbol}
                isBuy
                onPress={onPress}
            />
            <View style={{ width: 16 }} />
            <TradeButton symbol={symbol} onPress={onPress} />
        </View>
    )
}
// class BuySellButton extends PureComponent {
//     onPress = this.onPress.bind(this);

//     onPress(isBuy) {

//     }

//     render() {
//         const { symbol } = this.props;
//         return (
//             <View
//                 style={{
//                     flexDirection: 'row'
//                 }}
//             >
//                 <TradeButton
//                     symbol={symbol}
//                     isBuy
//                     onPress={this.onPress}
//                     isLoading
//                 />
//                 <View style={{ width: 16 }} />
//                 <TradeButton symbol={symbol} onPress={this.onPress} isLoading />
//             </View>
//         );
//     }
// }

// const mapStateToProps = (state, { symbol, exchange }) => {
//     if (!symbol || !exchange) return { priceObject: {} };

//     const { marketData } = state.streamMarket;
//     const { quote = {} } =
//         (marketData && marketData[exchange] && marketData[exchange][symbol]) ||
//         {};
//     return {
//         priceObject: quote
//     };
// };

// export default connect(mapStateToProps)(BuySellButton);

export default BuySellButton;
