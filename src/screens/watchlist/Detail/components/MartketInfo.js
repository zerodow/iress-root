import React, { PureComponent } from 'react';
import { View } from 'react-native';
import _ from 'lodash';

import ScrollTabs from '~s/watchlist/Animator/ScrollTabs';

import I18n from '~/modules/language/';
import News from '~s/universal_search/detail/new/watchList_search_new';
import CommonStyle from '~/theme/theme_controller';

import Depths from '../martketDepth';
import Trades from '../courseOfSales';
import { getLoginStatus } from '~/memory/controller';
import { setActiveScreen, setInactiveScreen, getActiveScreenByKey, doActiveScreen, doInactiveScreen } from '~/manage/manageActiveScreen'
import ENUM from '~/enum'

export default class WatchListMarketInfo extends PureComponent {
    constructor(props) {
        super(props);
        this.TABS = {
            MARKET: {
                label: I18n.t('marketDepth')
            },
            TEN_TRADE: {
                label: I18n.t('courseOfSales')
            },
            NEW: {
                label: I18n.t('News')
            }
        };
        this.lastTabIndex = 0;
        this.isLogin = getLoginStatus();
        this.timeout = null
    }

    reset = this.reset.bind(this);
    reset() {
        this._scrollTab && this._scrollTab.onChange(0);
        this.lastTabIndex = 0
    }

    // Onchange tab thì sẽ set active và inactive streaming
    onChange = this.onChange.bind(this)
    onChange(index) {
        if (this.lastTabIndex === index) return
        this.lastTabIndex = index
        // const { isHideNews } = this.props
        // this.timeout && clearTimeout(this.timeout)
        // this.timeout = setTimeout(() => {
        //     const { active, inactive } = getActiveScreenByKey(index, isHideNews)
        //     setActiveScreen(active)
        //     setInactiveScreen(inactive)
        //     doActiveScreen(active)
        //     doInactiveScreen(inactive)
        // }, 1000)
    }

    renderNews(key) {
        const { isDisableShowNewDetail } = this.props;
        return (
            <News
                isDisableShowNewDetail={isDisableShowNewDetail}
                tabLabel={_.upperCase(this.TABS['NEW'].label)}
                symbol={this.props.symbol}
                navigator={this.props.navigator}
            />
        );
    }

    renderTab = this.renderTab.bind(this);
    renderTab(key) {
        const newComp = this.renderNews('NEW');
        const { isHideNews, symbol, exchange } = this.props;
        if (isHideNews) {
            return [
                <Depths
                    tabIndex={0}
                    tabLabel={_.upperCase(this.TABS['MARKET'].label)}
                    symbol={symbol}
                    exchange={exchange}
                />,
                <Trades
                    tabIndex={1}
                    tabLabel={_.upperCase(this.TABS['TEN_TRADE'].label)}
                    symbol={symbol}
                    exchange={exchange}
                />
            ];
        }
        return [
            newComp,
            <Depths
                tabIndex={1}
                tabLabel={_.upperCase(this.TABS['MARKET'].label)}
                symbol={symbol}
                exchange={exchange}
            />,
            <Trades
                tabIndex={2}
                tabLabel={_.upperCase(this.TABS['TEN_TRADE'].label)}
                symbol={symbol}
                exchange={exchange}
            />
        ];
    }

    render() {
        if (!this.isLogin) return null;
        return (
            <View
                style={{
                    margin: 8,
                    marginTop: 16,
                    backgroundColor: CommonStyle.backgroundColor1,
                    borderTopLeftRadius: 10,
                    borderTopRightRadius: 10,
                    borderBottomLeftRadius: 8,
                    borderBottomRightRadius: 8
                }}
            >
                <ScrollTabs
                    ref={(sef) => (this._scrollTab = sef)}
                    tabbarStyles={{
                        backgroundColor: CommonStyle.color.dark,
                        borderRadius: 10,
                        borderColor: CommonStyle.fontBorder,
                        borderWidth: 1,
                        overflow: 'hidden'
                    }}
                    tabStyles={{
                        paddingVertical: 12
                    }}
                    underBgStyles={{
                        backgroundColor: CommonStyle.fontBlue1,
                        borderRadius: 8
                    }}
                    titleTabbarStyles={{
                        fontFamily: CommonStyle.fontPoppinsBold,
                        fontSize: CommonStyle.fontSizeXS,
                        color: CommonStyle.color.turquoiseBlueHex,
                        opacity: 0.7
                    }}
                    activeTitleTabbarStyles={{
                        color: CommonStyle.fontDark,
                        opacity: 1
                    }}
                    onChange={this.onChange}
                >
                    {this.renderTab()}
                </ScrollTabs>
            </View>
        );
    }
}
