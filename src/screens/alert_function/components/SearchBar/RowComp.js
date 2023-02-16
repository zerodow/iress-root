import React from 'react';
import { View, Text, Platform } from 'react-native';
import _ from 'lodash';
import Icon from 'react-native-vector-icons/Ionicons';

import XComponent from '~/component/xComponent/xComponent';
import * as Business from '~/business';
import { func } from '~/storage';
import CommonStyle from '~/theme/theme_controller';
import styles from '~s/addcode/style/addcode';
import Flag from '~/component/flags/flag';
import { calculateLineHeight } from '~/util';
const DURATION = 150;
export const Row = (props) => (
    <View
        style={{
            padding: 16,
            flexDirection: 'row',
            backgroundColor:
                CommonStyle.navigatorSpecial.navBarBackgroundColor2,
            borderRadius: 8,
            flex: 1
        }}
    >
        {props.children}
    </View>
);

export default class RowComponent extends XComponent {
    //  #region REACT AND DEFAULT FUNCTION

    componentDidMount() {
        super.componentDidMount();
        const data = this.props.data || {};
        const symbol = data.symbol || '';
    }
    //  #endregion

    renderLeftComp(symbol, securityName) {
        return (
            <View style={{ flex: 1 }}>
                <Text
                    style={{
                        fontFamily: CommonStyle.fontPoppinsBold,
                        fontSize: CommonStyle.fontSizeL,
                        color: CommonStyle.fontColor
                    }}
                    numberOfLines={1}
                >
                    {symbol}
                </Text>

                <Text
                    numberOfLines={1}
                    style={[
                        {
                            fontFamily: CommonStyle.fontPoppinsRegular,
                            fontSize: CommonStyle.fontSizeXS,
                            color: CommonStyle.fontCompany
                        },
                        Platform.OS === 'android'
                            ? {
                                  lineHeight: calculateLineHeight(
                                      CommonStyle.fontSizeXS
                                  )
                              }
                            : {}
                    ]}
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
                onLongPress={this.props.drag}
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

    renderRightComp(symbol, classSymbol, exchange) {
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
                            {exchange}
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
                        {(classSymbol + '').toUpperCase()}
                    </Text>
                </View>
                {this.renderSortIcon()}
            </View>
        );
    }

    renderLeftIcon(symbol) {
        return (
            <Icon
                testID={`removeCodeWatchList_${symbol}`}
                name="md-remove-circle"
                style={[styles.iconLeft, { paddingRight: 8 }]}
                onPress={() => this.props.onDeleteCode(symbol)}
            />
        );
    }

    //  #region RENDER
    render() {
        const rowData = this.props.data || {};
        const symbol = rowData.symbol || '';
        const displaySymbol = Business.getSymbolName({ symbol });
        const section = func.getSymbolObj(symbol);
        const classSymbol = Business.getSymbolClassDisplay(section.class);
        if (!section.code) return <View />;
        const securityName =
            section.company_name || section.company || section.security_name;
        return (
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center'
                    // marginBottom: 16
                    // paddingHorizontal: 16
                }}
            >
                {this.renderLeftIcon(symbol)}
                <Row>
                    {this.renderLeftComp(displaySymbol, securityName)}
                    {this.renderRightComp(symbol, classSymbol, exchange)}
                </Row>
            </View>
        );
    }
    //  #endregion
}
