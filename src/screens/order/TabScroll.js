import React, { PureComponent } from 'react';
import { View, Platform } from 'react-native';
import _ from 'lodash';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import Animated from 'react-native-reanimated'
import CustomTabbar from './market_info_tab_view';
import * as Controller from '~/memory/controller';
import I18n from '~/modules/language/';
import News from '~s/universal_search/detail/new/watchList_search_new';
import CommonStyle from '~/theme/theme_controller';
import * as Emitter from '@lib/vietnam-emitter';
import * as Channel from '~/streaming/channel'
import { func, dataStorage } from '~/storage';
import { changeTabScroll } from './order.actions'

export default class TabScroll extends PureComponent {
    constructor(props) {
        super(props)
        this.currentTab = 0
        this.maxHeight = new Animated.Value(500)
        this.state = {
            isApplyMaxHeight: true,
            isRender: false
        }
    }
    componentDidMount() {
        setTimeout(() => {
            this.setState({
                isRender: true
            })
        }, 0);
    }
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

    onChangeTab = this.onChangeTab.bind(this)
    handleSetHeightManual = (tabInfo) => {
        const currenRef = this.refs[tabInfo.ref.props.tabKey]
        if (currenRef.measure) {
            this.timeout1 = setTimeout(() => {
                currenRef.measure((x, y, w, h, l, t) => {
                    this.maxHeight.setValue(h + this.heightTabHeader + 32)
                })
            }, 100);
        }
    }
    handleSetHeightManualNotParams = () => {
        if (!this.tabInfo) return
        const { from, i } = this.tabInfo;
        const currenRef = this.refs[this.tabInfo.ref.props.tabKey]
        if (currenRef.measure) {
            this.setState({ isApplyMaxHeight: false })
            if (i === 2) return
            this.timeout2 = setTimeout(() => {
                this.setState({ isApplyMaxHeight: true })
                currenRef.measure((x, y, w, h, l, t) => {
                    this.maxHeight.setValue(h + this.heightTabHeader + 32)
                    console.log('DCM tabScroll Max Height ', h, this.tabInfo.ref.props.tabKey)
                })
            }, 500);
        }
    }
    onChangeTab(tabInfo) {
        const { from, i } = tabInfo;
        this.tabInfo = tabInfo
        if (from === i) {
            this.setState({ isApplyMaxHeight: false }) // Lan dau tien khi chua chuyen tab thi de height auto
            return
        }
        this.handleSetHeightManual(tabInfo)

        if (i === 2) {
            // New chuyen sang tab cos of sale. Thi dung height cua no. Vi con truong hop click vao more ko kiem soat height co dinh
            this.setState({
                isApplyMaxHeight: false
            })
        } else {
            if (from === 2) {
                // Neu tu tab cos sang 2 tab con lai thi dung height cua no
                this.setState({ isApplyMaxHeight: true })
            }
        }
        this.currentTab = i
        this.setAnimationDirection(from, i)
        this.props.onChangeTab(tabInfo);
        try {
            Controller.dispatch(changeTabScroll({ from, i }))
        } catch (error) {
            console.log('DCM ', error)
        }
    }
    setAnimationDirection = (from, to) => {
        if (from < to) {
            dataStorage.animationDirection = 'fadeInRight'
        } else if (from > to) {
            dataStorage.animationDirection = 'fadeInLeft'
        } else {
            dataStorage.animationDirection = 'fadeIn'
        }
    }
    renderCustomTabBar = () => {
        return (
            <CustomTabbar handlleOnLayout={this.handleCalHeightTabHeader} />
        )
    }
    handleCalHeightTabHeader = (height) => {
        this.heightTabHeader = height
    }
    componentWillUnmount() {
        this.timeout1 && clearTimeout(this.timeout1)
        this.timeout2 && clearTimeout(this.timeout2)
    }
    render() {
        const height = this.state.isApplyMaxHeight ? { height: this.maxHeight } : { height: '100%' }
        if (!this.state.isRender) return null
        return (
            <React.Fragment>
                <Animated.View style={[{ minHeight: 250 }, height]}>
                    <ScrollableTabView
                        initialPage={this.currentTab}
                        onChangeTab={this.onChangeTab}
                        locked
                        style={{
                            margin: 16
                        }}
                        scrollWithoutAnimation={true}
                        renderTabBar={this.renderCustomTabBar}
                    >
                        <View ref='tab1' tabKey='tab1' style={{
                            backgroundColor: CommonStyle.backgroundColor1,
                            borderBottomLeftRadius: 8,
                            borderBottomRightRadius: 8,
                            paddingBottom: 8
                        }} tabLabel={_.upperCase(I18n.t('summary'))}>
                            {this.props.renderSummary()}
                        </View>
                        <View ref='tab2' tabKey='tab2' style={{
                            backgroundColor: CommonStyle.backgroundColor1,
                            borderBottomLeftRadius: 8,
                            borderBottomRightRadius: 8,
                            paddingBottom: 8
                        }} tabLabel={_.upperCase(I18n.t('marketDepth'))}>
                            {this.props.renderMarketDepth()}
                        </View>
                        <View ref='tab3' tabKey='tab3' style={{
                            backgroundColor: CommonStyle.backgroundColor1,
                            borderBottomLeftRadius: 8,
                            borderBottomRightRadius: 8,
                            paddingBottom: 8
                        }} tabLabel={_.upperCase(I18n.t('courseOfSales'))}>
                            {this.props.renderCos()}
                        </View>
                    </ScrollableTabView>
                </Animated.View>
                {
                    Platform.OS === 'android' ? <View style={{ height: 24 }} /> : <View />
                }
            </React.Fragment>
        );
    }
}
