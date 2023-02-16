import React, { PureComponent } from 'react'
import { View, Text } from 'react-native';

import I18n from '~/modules/language';
import SearchBar from '../Header/header.searchBar';
import TimeUpdated from '~/component/time_updated/time_updated';
import * as Controller from '~/memory/controller';
import CommonStyle from '~/theme/theme_controller';

export default class TradeListHeader extends PureComponent {
    setRefTime = this.setRefTime.bind(this);
    setRefTime(sef) {
        if (sef) {
            this.updateTime = sef.setTimeUpdate;
        }
    }

    render() {
        const { infoSelected, navigator } = this.props;
        let chgTitle = I18n.t('chgUpper');
        if (infoSelected === 'changePercent') {
            chgTitle = I18n.t('overviewChgP');
        }
        if (infoSelected === 'quantity') {
            chgTitle = I18n.t('quantityUpper');
        }

        return (
            <React.Fragment>
                <SearchBar navigator={navigator} />
                <View style={{ paddingHorizontal: 16 }}>
                    <TimeUpdated
                        onRef={this.setRefTime}
                        isShow={!Controller.isPriceStreaming()}
                    />

                    <View style={{ flexDirection: 'row', paddingVertical: 6 }}>
                        <View style={{ flex: 1 }}>
                            <Text
                                style={{
                                    fontFamily: CommonStyle.fontFamily,
                                    fontSize: CommonStyle.fontSizeXS,
                                    opacity: 0.7,
                                    color: CommonStyle.fontColor
                                }}
                            >
                                {I18n.t('symbolUpper')}
                            </Text>
                            <Text
                                style={{
                                    fontFamily: CommonStyle.fontFamily,
                                    fontSize: CommonStyle.fontTiny,
                                    opacity: 0.54,
                                    color: CommonStyle.fontColor
                                }}
                            >
                                {I18n.t('securityUpper')}
                            </Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text
                                style={{
                                    fontFamily: CommonStyle.fontFamily,
                                    fontSize: CommonStyle.fontSizeXS,
                                    opacity: 0.7,
                                    color: CommonStyle.fontColor
                                }}
                            >
                                {I18n.t('priceUpper')}
                            </Text>
                            <Text
                                style={{
                                    fontFamily: CommonStyle.fontFamily,
                                    fontSize: CommonStyle.fontTiny,
                                    opacity: 0.54,
                                    color: CommonStyle.fontColor
                                }}
                            >
                                {chgTitle}
                            </Text>
                        </View>
                    </View>

                    <View
                        style={{
                            paddingHorizontal: 16,
                            height: 1,
                            backgroundColor: CommonStyle.fontBorderGray
                        }}
                    />

                </View>
            </React.Fragment>
        );
    }
}
