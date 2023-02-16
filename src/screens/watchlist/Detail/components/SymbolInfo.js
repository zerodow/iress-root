import React, { PureComponent } from 'react';
import {
    View,
    Text
} from 'react-native';
import _ from 'lodash';
import { connect } from 'react-redux';

import Flag from '~/component/flags/flag';
import * as Business from '~/business';
import CommonStyle from '~/theme/theme_controller';
import { func } from '~/storage';
import AnnouncementIcon from '~/component/announcement_icon/announcement_icon';
import { Text as TextLoading } from '~/component/loading_component'

class SymbolInfo extends PureComponent {
    renderFlag() {
        const { symbol, isNewsToday } = this.props;
        const flagIcon = Business.getFlag2(symbol);
        return (
            <View
                style={{
                    // marginLeft: 8,
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'row'
                }}
            >
                <Flag
                    wrapperStyle={{ marginHorizontal: 8 }}
                    type={'flat'}
                    code={flagIcon}
                    size={18}
                />
                <AnnouncementIcon
                    isNewsToday={isNewsToday}
                    symbol={symbol}
                    containerStyle={{
                        backgroundColor: isNewsToday
                            ? CommonStyle.newsActive
                            : CommonStyle.newsInactive,
                        height: 13,
                        width: 12,
                        borderRadius: 2.5,
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                    contentStyle={{
                        fontSize: CommonStyle.fontSizeXS - 2,
                        color: 'white',
                        fontFamily: CommonStyle.fontFamily
                    }}
                />
            </View>
        );
    }

    renderSymbolName() {
        const { symbol, isLoading } = this.props;
        const symbolName = Business.getSymbolName({ symbol })
        const tradingHalt = func.getHaltSymbol(symbol)
        return (
            <React.Fragment>
                <Text
                    style={[
                        CommonStyle.textMainRed,
                        {
                            fontSize: CommonStyle.fontSizeL,
                            fontFamily: CommonStyle.fontPoppinsBold
                        }
                    ]}
                >
                    {tradingHalt ? '! ' : ''}
                </Text>
                <Text
                    testID={`${symbol}HeaderWL`}
                    style={{
                        fontFamily: 'HelveticaNeue-Bold',
                        fontSize: CommonStyle.fontSizeL,
                        color: CommonStyle.fontColor
                    }}
                >
                    {symbolName}
                </Text>
            </React.Fragment>
        );
    }

    renderCompany() {
        const { symbol, isLoading } = this.props;
        const { company_name: compName, company, security_name: securName } =
            func.getSymbolObj(symbol) || {};

        const securityName = compName || company || securName;

        return (
            <React.Fragment>
                <View style={{ width: 8 }} />
                {this.renderFlag()}
                <View style={{ width: 16 }} />
                <View
                    style={{ alignItems: 'center' }}
                >
                    <TextLoading
                        isLoading={isLoading}
                        testID={`${symbol}NameWL`}
                        style={{
                            maxWidth: isLoading ? 50 : undefined,
                            maxHeight: isLoading ? 30 : undefined,
                            fontFamily: CommonStyle.fontPoppinsRegular,
                            fontSize: CommonStyle.fontSizeXS,
                            color: CommonStyle.fontCompany
                        }}
                        numberOfLines={2}
                    >
                        {securityName || ''}
                    </TextLoading>
                </View>
            </React.Fragment>
        );
    }

    render() {
        return (
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                flexWrap: 'wrap',
                flex: 1
            }}>
                {this.renderSymbolName()}
                {this.renderCompany()}
            </View>
        );
    }
}

const mapStateToProps = (state, ownProps) => {
    const { symbol } = ownProps;
    const { newsToday = {}, detailLoading } = state.watchlist3;
    const isNewsToday = newsToday[symbol] || false;

    return { isNewsToday, isLoading: detailLoading };
};

export default connect(mapStateToProps)(SymbolInfo);
