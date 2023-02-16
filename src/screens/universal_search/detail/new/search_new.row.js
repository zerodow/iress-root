import React, { Component } from 'react'
import { View, Text, Image, TouchableOpacity } from 'react-native';

import * as Controler from '~/memory/controller';
import Enum from '~/enum';
import I18n from '~/modules/language/';
import CommonStyle, { register } from '~/theme/theme_controller';
import { showNewsDetail } from '~/lib/base/functionUtil';
import TimeAgo from '~/component/time_ago/time_ago';
import Icon from 'react-native-vector-icons/Ionicons';

export default class Row extends Component {
    compareTimeOpenLink(item) {
        const curTime = new Date().getTime();
        let updatedTime = item.updated;
        if (typeof updatedTime === 'string') {
            updatedTime = new Date(item.updated).getTime();
        }
        const enabledTime = updatedTime + Enum.TIME_OPEN_NEWS;
        return enabledTime > curTime;
    }

    onPress = this.onPress.bind(this)
    onPress() {
        const { news_id: newID = '' } = this.props.data || {};
        const { navigator, isConnected } = this.props;

        showNewsDetail(newID, navigator, isConnected, this.props.data);
    }

    render() {
        const { data } = this.props
        const isDisabled = Controler.getLiveNewStatus()
            ? false
            : this.compareTimeOpenLink(data);

        const {
            updated, news_id: newId,
            page_count: pageCount = 0,
            title
        } = data || {};

        const pageTitle =
            pageCount > 0 ? `${pageCount} ${I18n.t('pages')}` : '';

        return (
            <TouchableOpacity onPress={this.onPress}>
                <View
                    style={{
                        borderRadius: 8,
                        padding: 16,
                        backgroundColor:
                            CommonStyle.navigatorSpecial1.navBarBackgroundColor2
                    }}
                >
                    <Image
                        style={{
                            width: 35,
                            height: 16
                        }}
                        source={require('~/img/asx_logo.png')}
                    />

                    <Text
                        style={{
                            paddingVertical: 8,
                            fontFamily: CommonStyle.fontPoppinsBold,
                            color: CommonStyle.fontWhite,
                            fontSize: CommonStyle.fontSizeXS
                        }}
                    >
                        {title}
                    </Text>

                    <View style={{ flexDirection: 'row' }}>
                        <Text
                            style={{
                                fontFamily: CommonStyle.fontPoppinsRegular,
                                fontSize: CommonStyle.fontSizeXS,
                                color: CommonStyle.fontCompany
                            }}
                        >
                            {`${pageTitle} | `}
                        </Text>

                        <TimeAgo
                            updated={updated}
                            newID={newId}
                            style={{
                                fontFamily: CommonStyle.fontPoppinsRegular,
                                fontSize: CommonStyle.fontSizeXS,
                                color: CommonStyle.fontCompany
                            }}
                        />

                        <View
                            style={{
                                flex: 1,
                                paddingLeft: 8,
                                alignItems: 'flex-end'
                            }}
                        >
                            <Icon
                                name="ios-arrow-round-down"
                                size={24}
                                color={isDisabled ? '#0000001e' : '#10a8b2'}
                            />
                        </View>
                    </View>

                    <View style={{ position: 'absolute', top: -10, right: 0 }}>
                        <Icon
                            name="ios-alert"
                            size={24}
                            color={CommonStyle.fontWhite}
                        />
                    </View>
                </View>
            </TouchableOpacity>
        )
    }
}
