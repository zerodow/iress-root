import React, { PureComponent } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import { func, dataStorage } from '../../storage';
import I18n from '../../modules/language';
import * as RoleUser from '../../roleUser';
import Auth from '@unis/detail/price/price_Auth';
import * as Controller from '../../memory/controller';
import config from '../../config';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';
import Enum from '../../enum';
import { logAndReport, logDevice } from '../../lib/base/functionUtil';
import { showNewOrderModal } from '~/navigation/controller.1';

const styles = {}
const Button = (props) => {
    const {
        isConnected,
        isLoading,
        disabled,
        disableColor,
        color,
        textContent
    } = props;
    const curFlag = !isConnected || !func.isAccountActive();
    return (
        <TouchableOpacity
            disabled={disabled || isLoading || curFlag}
            onPress={props.onPress}
            style={[
                styles.buttonExpand,
                {
                    backgroundColor:
                        curFlag || disabled || isLoading ? disableColor : color
                }
            ]}
        >
            <Text
                style={[
                    CommonStyle.textButtonColor,
                    {
                        color:
                            curFlag || disabled || isLoading
                                ? CommonStyle.fontBlack
                                : CommonStyle.fontWhite
                    }
                ]}
            >
                {textContent}
            </Text>
        </TouchableOpacity>
    );
};
Button.defaultProps = {
    onPress: () => null
};

export class PriceButton extends PureComponent {
    constructor(props) {
        super(props);
        this.showOpenPosition = this.showOpenPosition.bind(this);
        this.checkAuth = () => null;
        this.isBuy = '';
    }
    showOpenPosition() {
        try {
            const {
                display_name: displayName,
                volume,
                symbol = ''
            } = this.props.data;
            if (this.timeoutId && new Date().getTime() - this.timeoutId < 300) {
                return;
            }
            this.timeoutId = new Date().getTime();
            logDevice(
                'info',
                `OpenPrice showOpenPosition func with type: ${this.isBuy}`
            );
            let isBuy = '';
            const originalType = this.isBuy;
            if (!Controller.getLoginStatus()) return;
            if (this.isBuy === 'adjust') {
                isBuy = true;
            } else if (parseFloat(volume) < 0) {
                isBuy = true;
            } else {
                isBuy = false;
            }
            const passProps = {
                type: this.isBuy === 'adjust' ? 'adjust' : 'close',
                displayName,
                isBuy,
                isParitech: true,
                tradePrice: 1,
                code: symbol,
                exchanges: [],
                volume: originalType === false ? Math.abs(volume) : 0,
                isNotShowMenu: true
            };
            showNewOrderModal({
                navigator: this.props.navigator,
                passProps
            });
        } catch (error) {
            logAndReport(
                'showOpenPosition openPrice exception',
                error,
                'showOpenPosition openPrice'
            );
            logDevice('info', `showOpenPosition openPrice exception ${error}`);
        }
    }

    setTimeoutClickable() {
        this.clickedNewOrder = true;
        setTimeout(() => {
            this.clickedNewOrder = false;
        }, 1500);
    }

    onPress() {
        if (this.clickedNewOrder) return;
        this.setTimeoutClickable();
        this.checkAuth(this.showOpenPosition);
    }

    render() {
        const { isConnected, navigator } = this.props;
        const { symbol = '', isLoading } = this.props.data;
        return (
            <View
                style={{
                    width: '100%',
                    flexDirection: 'row',
                    paddingLeft: 16,
                    paddingRight: 16,
                    paddingBottom: 16
                }}
            >
                <View
                    testID={`portfolioButtonAdjust-${symbol}`}
                    style={[styles.colExpand1, { paddingRight: 10 }]}
                >
                    <Button
                        isConnected={isConnected}
                        isLoading={isLoading}
                        disabled={
                            dataStorage.isLockedAccount ||
                            !RoleUser.checkRoleByKey(
                                Enum.ROLE_DETAIL
                                    .PERFORM_NEW_ORDER_UNIVERSALSEARCH_BUTTON
                            )
                        }
                        disableColor={CommonStyle.btnOrderDisableBg}
                        color={config.colorVersion}
                        textContent={I18n.t('neworderUpper')}
                        onPress={() => {
                            this.isBuy = 'adjust';
                            this.onPress();
                        }}
                    />
                </View>

                <View
                    testID={`portfolioButtonClose-${symbol}`}
                    style={[styles.colExpand1, { paddingLeft: 10 }]}
                >
                    <Button
                        isConnected={isConnected}
                        isLoading={isLoading}
                        disabled={
                            dataStorage.isLockedAccount ||
                            !RoleUser.checkRoleByKey(
                                Enum.ROLE_DETAIL
                                    .PERFORM_CLOSE_ORDER_UNIVERSALSEARCH_BUTTONL
                            )
                        }
                        disableColor={CommonStyle.btnOrderDisableBg}
                        color={'#ff1643'}
                        textContent={I18n.t('closeUpper')}
                        onPress={() => {
                            this.isBuy = false;
                            this.onPress();
                        }}
                    />
                </View>

                <Auth
                    ref={(sef) => {
                        if (sef) {
                            this.checkAuth = sef.onCheckAuth;
                        }
                    }}
                    navigator={navigator}
                    onOrder={(...p) => this.showOpenPosition(...p)}
                />
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    data: state.searchPortfolio || {},
    isConnected: state.app.isConnected
});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(PriceButton);
