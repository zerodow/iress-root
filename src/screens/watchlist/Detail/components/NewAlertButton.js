import React, { PureComponent } from 'react';
import { TouchableOpacity, View, Platform } from 'react-native';

import Icon from '../../Component/Icon2';
import { showNewAlertModal } from '~/navigation/controller.1';
import Enum from '~/enum';
import * as Controller from '~/memory/controller';
import * as FunctionUtil from '~/lib/base/functionUtil';
import { getSymbolClass } from '~/business';
import CommonStyle from '~/theme/theme_controller';
import { handleShowAlertLog } from '~s/alertLog/Controller/SwitchController'

const { SYMBOL_CLASS_API_UPPER } = Enum;

export default class NewAlert extends PureComponent {
    onPressBell = this.onPressBell.bind(this);

    onPressBell() {
        const { symbol, exchange, navigator } = this.props;
        handleShowAlertLog({ symbol, exchange })
        // showNewAlertModal({
        //     navigator,
        //     passProps: {
        //         isHideBackButton: false,
        //         symbolSelected: symbol,
        //         wrapperStyle: {
        //             paddingTop:
        //                 Platform.OS === 'ios'
        //                     ? FunctionUtil.isIphoneXorAbove()
        //                         ? 38
        //                         : 16
        //                     : 0,
        //             height: FunctionUtil.isIphoneXorAbove() ? 48 + 38 : 48 + 16
        //         },
        //         style: {
        //             top:
        //                 Platform.OS === 'ios'
        //                     ? FunctionUtil.isIphoneXorAbove()
        //                         ? 38
        //                         : 16
        //                     : 0
        //         }
        //     }
        // });
    }

    render() {
        const { symbol, exchange } = this.props;
        const symbolClass = getSymbolClass({ symbol });
        const isLogin = Controller.getLoginStatus();
        const isDisable =
            !isLogin ||
            (symbolClass + '').toUpperCase() === SYMBOL_CLASS_API_UPPER.INDEX;
        return (
            <TouchableOpacity disabled={isDisable} onPress={this.onPressBell}>
                <CommonStyle.icons.bell
                    style={{ marginLeft: 16, opacity: isDisable ? 0.4 : 1 }}
                    name={'newAlert'}
                    size={20}
                    color={CommonStyle.colorProduct}
                />
            </TouchableOpacity>
        );
    }
}
