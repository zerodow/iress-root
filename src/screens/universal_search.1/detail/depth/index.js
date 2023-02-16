import React, { PureComponent } from 'react';
import { View, Text } from 'react-native';
import { connect } from 'react-redux';
import CommonStyle, { register } from '~/theme/theme_controller';
import MarketDepth from '~/screens/market_depth/swiper_market_depth.2';
import I18n from '~/modules/language';
import * as RoleUser from '~/roleUser';
import Enum from '~/enum';
import * as Controller from '~/memory/controller'

export class DepthDetail extends PureComponent {
    render() {
        const { symbol, exchange, navigator } = this.props;
        const check = RoleUser.checkRoleByKey(Enum.ROLE_DETAIL.VIEW_MARKET_DEPTH_NEW_ORDER);
        return (
            <React.Fragment>
                <View style={{ paddingBottom: 8, paddingTop: 16, paddingHorizontal: 16 }}>
                    <Text style={{ fontFamily: 'HelveticaNeue', fontSize: CommonStyle.fontSizeL, color: CommonStyle.fontColor }}>{I18n.t('marketDepth')}</Text>
                </View>
                {
                    check ? (
                        <MarketDepth
                            scrollDisable={true}
                            navigator={navigator}
                            isOrder={true}
                        />
                    ) : (
                            <View style={{ height: 200, paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center' }}>
                                {
                                    <Text style={{ color: CommonStyle.fontColor }}>{I18n.t('noMarketDepth')}</Text>
                                }
                            </View>
                        )
                }
            </React.Fragment>
        );
    }
}

export default DepthDetail;
