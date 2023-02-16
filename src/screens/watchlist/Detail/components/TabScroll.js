import React, { PureComponent } from 'react';
import { View } from 'react-native';
import _ from 'lodash';
import ScrollableTabView from 'react-native-scrollable-tab-view';

import CustomTabbar from './marketInfo.scrollTabbar';
import * as Controller from '~/memory/controller';
import I18n from '~/modules/language/';
import News from '~s/universal_search/detail/new/watchList_search_new';
import CommonStyle from '~/theme/theme_controller';

import Depths from '../martketDepth';
import Trades from '../courseOfSales';

export default class TabScroll extends PureComponent {
    renderNews() {
        const isLogin = Controller.getLoginStatus();
        const tabLabel = _.upperCase(I18n.t('News'));

        if (!isLogin) return <View tabLabel={tabLabel} />;
        return (
            <News
                symbol={this.props.symbol}
                navigator={this.props.navigator}
                tabLabel={tabLabel}
            />
        );
    }
    render() {
        return (
            <ScrollableTabView
                locked
                style={{
                    margin: 16,
                    backgroundColor: CommonStyle.backgroundColor1,
                    borderRadius: 8
                }}
                renderTabBar={() => <CustomTabbar />}
            >
                <View tabLabel={_.upperCase(I18n.t('summary'))}>
                    {this.props.summary}
                </View>
                <View tabLabel={_.upperCase(I18n.t('marketDepth'))}>
                    <Depths symbol={this.props.symbol} />
                </View>
                <View tabLabel={_.upperCase(I18n.t('courseOfSales'))}>
                    <Trades symbol={this.props.symbol} />
                </View>

                {/* {this.renderNews()} */}
            </ScrollableTabView>
        );
    }
}
