import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import _ from 'lodash';
import Icon from 'react-native-vector-icons/Ionicons';

import XComponent from '~/component/xComponent/xComponent';
import * as Emitter from '@lib/vietnam-emitter';
import { logDevice, checkTradingHalt } from '~/lib/base/functionUtil';
import * as StreamingBusiness from '~/streaming/streaming_business';
import * as Business from '~/business';
import { func } from '~/storage';
import CommonStyle from '~/theme/theme_controller';
import styles from '~s/addcode/style/addcode';
import Flag from '~/component/flags/flag';
import I18n from '~/modules/language/';

import DeleteAnimator from '../Animator/DeleteAnimator';

export const Row = (props) => (
    <View
        style={[
            {
                padding: 16,
                flexDirection: 'row',
                backgroundColor:
                    CommonStyle.navigatorSpecial.navBarBackgroundColor2,
                borderRadius: 8,
                flex: 1
            },
            props.style
        ]}
    >
        {props.children}
    </View>
);

export default class RowComponent extends XComponent {
    //  #region REACT AND DEFAULT FUNCTION
    bindAllFunc() {
        this.subHalt = this.subHalt.bind(this);
    }

    init() {
        this.state = {
            tradingHalt: false
        };
    }

    //  #endregion

    //  #region BUSINESS
    subHalt() {}
    //  #endregion

    renderLeftComp(symbol, securityName, tradingHalt = false) {
        return (
            <View style={{ flex: 1 }}>
                <Text
                    style={{
                        fontFamily: CommonStyle.fontPoppinsBold,
                        fontSize: CommonStyle.fontSizeL,
                        color: CommonStyle.fontColor,
                        flexDirection: 'row'
                    }}
                    numberOfLines={1}
                >
                    {tradingHalt ? (
                        <Text
                            style={{ color: CommonStyle.fontRed }}
                        >{`! `}</Text>
                    ) : (
                        <Text></Text>
                    )}
                    {symbol}
                </Text>

                <Text
                    numberOfLines={1}
                    style={{
                        fontFamily: CommonStyle.fontPoppinsRegular,
                        fontSize: CommonStyle.fontSizeXS,
                        color: CommonStyle.fontCompany,
                        lineHeight: CommonStyle.fontSizeXS + 4
                    }}
                >
                    {securityName}
                </Text>
            </View>
        );
    }

    renderSortIcon() {
        return (
            <Icon
                name="md-menu"
                delayLongPress={500}
                // onLongPress={this.props.drag}
                onLongPress={() => console.log('disable sort watchlist')}
                style={{
                    fontSize: CommonStyle.fontSizeXXL,
                    textAlign: 'right',
                    opacity: CommonStyle.opacity2,
                    color: CommonStyle.iconMoveColor,
                    paddingLeft: 16
                }}
            />
        );
    }

    renderRightComp(symbol, classSymbol, exchanges) {
        const flagIcon = Business.getFlag(symbol);
        return (
            <View
                style={{
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    flexDirection: 'row',
                    paddingLeft: 8
                }}
            >
                <View
                    style={{ justifyContent: 'center', alignItems: 'center' }}
                >
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center'
                        }}
                    >
                        <Flag type={'flat'} code={flagIcon} size={18.5} />
                        <Text
                            style={{
                                fontFamily: CommonStyle.fontPoppinsBold,
                                fontSize: CommonStyle.fontSizeL,
                                color: CommonStyle.fontColor,
                                paddingLeft: 8
                            }}
                            numberOfLines={1}
                        >
                            {exchanges}
                        </Text>
                    </View>
                    <Text
                        numberOfLines={1}
                        style={{
                            width: '100%',
                            fontFamily: CommonStyle.fontPoppinsRegular,
                            fontSize: CommonStyle.fontSizeXS,
                            color: CommonStyle.fontCompany,
                            textAlign: 'right'
                        }}
                    >
                        {_.upperCase(classSymbol)}
                    </Text>
                </View>
                {this.renderSortIcon()}
            </View>
        );
    }

    onLeftPress = this.onLeftPress.bind(this);
    onLeftPress() {
        if (this._delete) {
            this._delete.show();
            this.props.onDeletePress &&
                this.props.onDeletePress(
                    () => this._delete && this._delete.hide()
                );
        }
    }

    renderLeftIcon(symbol) {
        return (
            <TouchableOpacity
                style={{ marginBottom: 16 }}
                onPress={this.onLeftPress}
            >
                <Icon
                    testID={`removeCodeWatchList_${symbol}`}
                    name="md-remove-circle"
                    style={[styles.iconLeft, { width: 32 }]}
                />
            </TouchableOpacity>
        );
    }

    onSnapToPoint = this.onSnapToPoint.bind(this);
    onSnapToPoint() {
        if (this._delete && this.props.onDeletePress) {
            this.props.onDeletePress(() => this._delete && this._delete.hide());
        }
    }

    //  #region RENDER
    render() {
        const {
            symbol = '',
            trading_halt: tradingHalt,
            class: sectionsClass,
            code: sectionsCode,
            display_name: displaySymbol,
            company_name: companyName,
            company,
            security_name: securityName,
            exchanges
        } = this.props.data || {};

        if (!sectionsCode) return <View />;

        const displayName = companyName || company || securityName;
        return (
            <DeleteAnimator
                ref={(sef) => (this._delete = sef)}
                onDelete={() =>
                    this.props.onDeleteCode(symbol, exchanges && exchanges[0])
                }
                title={I18n.t('delete')}
                style={{
                    // paddingBottom: 8,
                    paddingHorizontal: 16,
                    flexDirection: 'row',
                    alignItems: 'center'
                }}
                deleteStyles2={{ marginBottom: 8 }}
                onSnapToPoint={this.onSnapToPoint}
            >
                {this.renderLeftIcon(symbol)}
                <Row
                    style={{
                        marginBottom: 8
                    }}
                >
                    {this.renderLeftComp(symbol, displayName, tradingHalt)}
                    {this.renderRightComp(
                        symbol,
                        sectionsClass,
                        exchanges && exchanges[0]
                    )}
                </Row>
            </DeleteAnimator>
        );
    }
    //  #endregion
}
