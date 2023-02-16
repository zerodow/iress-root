import React from 'react';
import {
    Text,
    TouchableOpacity,
    View,
    PixelRatio
} from 'react-native';
import {
    logDevice,
    openSignIn
} from '../../lib/base/functionUtil';
import styles from '../trade/style/trade';
import { func, dataStorage } from '../../storage';
import I18n from '../../modules/language/';
import { iconsMap } from '../../utils/AppIcons';
import config from '../../config';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as loginActions from '../login/login.actions';
import * as authSettingActions from '../setting/auth_setting/auth_setting.actions'
import XComponent from '../../component/xComponent/xComponent'
import * as fbemit from '../../emitter';
import * as Emitter from '@lib/vietnam-emitter';
import * as Util from '../../util';
import Enum from '../../enum';
import RnCollapsible from '../../component/rn-collapsible/rn-collapsible'
import * as StreamingBusiness from '../../streaming/streaming_business';
import * as InvertTranslate from '../../invert_translate'
import HeaderPrice from './header_price.1'
import ContentPrice from './content_price'
import PriceHistoricalChart from '../price_historical_chart/price_historical_chart'
import Announcement from './announcement'
import * as Controller from '../../memory/controller'

const PRICE_FILL_TYPE = Enum.PRICE_FILL_TYPE;
const CHART_TYPE = Enum.CHART_TYPE;

export class Price extends XComponent {
    bindAllFunc() {
        try {
            this.loadContent = this.loadContent.bind(this)
            this.getBaseInfo = this.getBaseInfo.bind(this)
            this.setPriceObj = this.setPriceObj.bind(this)
            this.showModalNew = this.showModalNew.bind(this)
            this.renderHeader = this.renderHeader.bind(this)
            this.renderContent = this.renderContent.bind(this)
            this.subParentScroll = this.subParentScroll.bind(this)
            this.subPriceStreaming = this.subPriceStreaming.bind(this)
            this.onChangeAllowRender = this.onChangeAllowRender.bind(this)
            this.calculateAllowRender = this.calculateAllowRender.bind(this)
            this.onChannelChildExpandStatus = this.onChannelChildExpandStatus.bind(this)
            this.subChannelChildExpandStatus = this.subChannelChildExpandStatus.bind(this)
            this.forceUpdateAllowRenderContent = this.forceUpdateAllowRenderContent.bind(this)
            this.listenChannelChildExpandStatus = this.listenChannelChildExpandStatus.bind(this)

            return true
        } catch (error) {
            console.catch(error)
            return false
        }
    }

    init() {
        try {
            this.dic = {
                waitRenderPrice: false,
                priceBoardID: func.getCurrentPriceboardId(),
                allowRenderContent: false,
                priceObject: this.props.data || {},
                allowRenderHeader: Util.getBooleanable(this.props.allowRender, true),
                channelHeaderLv1FromComponent: StreamingBusiness.getChannelHeaderRowLv1(this.id),
                channelAllowRenderContent: StreamingBusiness.getChannelAllowRenderContent(this.id),
                channelContentLv1FromComponent: StreamingBusiness.getChannelContentRowLv1(this.id)
            }

            this.state = {
                isExpand: false
            }

            if (this.props.channelAllowRenderIndex) {
                this.subParentScroll()
                this.onChangeAllowRender({
                    startIndex: this.props.startIndex,
                    endIndex: this.props.endIndex
                })
            }

            return true
        } catch (error) {
            console.catch(error)
            return false
        }
    }

    setPriceObj(data) {
        try {
            this.dic.priceObject = data;
            this.pubDataRealtime();

            return true
        } catch (error) {
            console.catch(error)
            return false
        }
    }

    calculateAllowRender() {
        try {
            const allowRenderContent = this.dic.allowRenderHeader && this.state.isExpand;
            if (allowRenderContent !== this.dic.allowRenderContent) {
                this.dic.allowRenderContent = allowRenderContent;
                Emitter.emit(this.dic.channelAllowRenderContent, this.dic.allowRenderContent);
            }

            return true
        } catch (error) {
            console.catch(error)
            return false
        }
    }

    forceUpdateAllowRenderContent(data) {
        try {
            this.dic.allowRenderContent = data;
            Emitter.emit(this.dic.channelAllowRenderContent, this.dic.allowRenderContent);

            return true
        } catch (error) {
            console.catch(error)
            return false
        }
    }

    componentWillReceiveProps(nextProps) {
        try {
            if (Controller.isPriceStreaming() || !nextProps || !nextProps.data) return false
            this.setPriceObj(nextProps.data)

            return true
        } catch (error) {
            console.catch(error)
            return false
        }
    }

    componentDidMount() {
        try {
            super.componentDidMount();

            Controller.isPriceStreaming() && this.subPriceStreaming()
            this.subChannelChildExpandStatus()

            return true
        } catch (error) {
            console.catch(error)
            return false
        }
    }

    listenChannelChildExpandStatus({ index, status }) {
        try {
            index !== this.props.rowID &&
                status &&
                this.state.isExpand &&
                this.onChannelChildExpandStatus(false)

            return true
        } catch (error) {
            console.catch(error)
            return false
        }
    }

    subChannelChildExpandStatus() {
        try {
            Emitter.addListener(this.props.channelChildExpandStatus,
                this.id, this.listenChannelChildExpandStatus)

            return true
        } catch (error) {
            console.catch(error)
            return false
        }
    }

    onChannelChildExpandStatus(status) {
        try {
            this.state.isExpand = status;
            this.calculateAllowRender();
            this.setState()

            return true
        } catch (error) {
            console.catch(error)
            return false
        }
    }

    subPriceStreaming() {
        try {
            const { symbol, exchange } = this.getBaseInfo()
            if (!symbol || !exchange) return false

            const channel = StreamingBusiness.getChannelLv1(exchange, symbol)
            Emitter.addListener(channel, this.id, this.setPriceObj)

            return true
        } catch (error) {
            console.catch(error)
            return false
        }
    }

    getBaseInfo() {
        try {
            return {
                symbol: this.props.symbol,
                exchange: func.getExchangeSymbol(this.props.symbol)
            }
        } catch (error) {
            console.catch(error)
            return {}
        }
    }

    loadContent(status) {
        try {
            this.forceUpdateAllowRenderContent(status);
            this.onChannelChildExpandStatus(status)
            Emitter.emit(this.props.channelChildExpandStatus, { index: this.props.rowID, status })

            return true
        } catch (error) {
            console.catch(error)
            return false
        }
    }

    showModalNew() {
        this.props.navigator.push({
            screen: 'equix.SearchDetail',
            title: I18n.t('search', { locale: this.props.setting.lang }),
            backButtonTitle: ' ',
            animated: true,
            animationType: 'slide-horizontal',
            passProps: {
                isPushFromWatchlist: true,
                isBackground: false,
                symbol: this.props.symbol,
                login: this.props.login,
                listPosition: this.state.listPosition
            },
            navigatorButtons: {
                leftButtons: [{
                    title: '',
                    id: 'back_button',
                    icon: Util.isIOS()
                        ? iconsMap['ios-arrow-back']
                        : iconsMap['md-arrow-back']
                }]
            },
            navigatorStyle: {
                statusBarColor: CommonStyle.statusBarBgColor,
                statusBarTextColorScheme: 'light',
                navBarBackgroundColor: CommonStyle.statusBarBgColor,
                navBarTextColor: config.color.navigation,
                navBarHideOnScroll: false,
                drawUnderNavBar: true,
                navBarTextFontSize: 18,
                navBarButtonColor: config.button.navigation,
                navBarNoBorder: true,
                navBarSubtitleColor: 'white',
                navBarSubtitleFontFamily: 'HelveticaNeue'
            }
        });
    }

    renderHeader() {
        try {
            return (
                <HeaderPrice
                    // isNewsToday={this.props.isNewsToday}
                    value={this.dic.priceObject}
                    symbol={this.props.symbol}
                    channelLv1FromComponent={this.dic.channelHeaderLv1FromComponent}
                    isLoading={this.props.isLoading}
                    channelLoadingTrade={this.props.channelLoadingTrade} />
            )
        } catch (error) {
            console.catch(error)
            return <View />
        }
    }

    renderContent() {
        try {
            if (!this.state.isExpand) return <View />

            // const user = Controller.getUserInfo()

            // logDevice('info', `Price renderContent with user: ${JSON.stringify(user)}`);
            // logDevice('info', `Price renderContent isLogin: ${this.props.login.isLogin}`);
            // logDevice('info', `Price renderContent with connected: ${this.props.isConnected}`);

            return (
                <View style={{ width: '100%', marginTop: 2 }}>
                    {
                        this.dic.priceBoardID === Enum.WATCHLIST.TOP_ASX_INDEX
                            ? null
                            : <ContentPrice
                                parentID={this.id}
                                login={this.props.login}
                                setting={this.props.setting}
                                value={this.dic.priceObject}
                                isLoading={this.props.isLoading}
                                isConnected={this.props.isConnected}
                                channelLoadingTrade={this.props.channelLoadingTrade}
                                placingOrderHookFunc={this.props.placingOrderHookFunc}
                                channelLv1FromComponent={this.dic.channelContentLv1FromComponent}
                            />
                    }
                    <PriceHistoricalChart
                        login={this.props.login}
                        showButtonWhatlist={true}
                        symbol={this.props.symbol}
                        chartType={CHART_TYPE.VALUE}
                        setting={this.props.setting}
                        style={styles.chartContainer}
                        filterType={PRICE_FILL_TYPE._1D}
                        priceObject={this.dic.priceObject}
                        allowRender={this.dic.allowRenderContent}
                        channelReload={this.props.channelLoadingTrade}
                        channelAllowRender={this.dic.channelAllowRenderContent}
                        listFilterType={InvertTranslate.getListInvertTranslate(Util.getValueObject(PRICE_FILL_TYPE))}
                    />
                    <View>
                        {
                            this.dic.priceBoardID === Enum.WATCHLIST.TOP_ASX_INDEX
                                ? null
                                : <View>
                                    <View style={{ width: '100%' }}>
                                        <TouchableOpacity
                                            onPress={this.showModalNew.bind(this)}
                                            style={[styles.rowExpandNews, { width: '100%' }]}>
                                            <Text
                                                testID={`more`}
                                                style={[CommonStyle.textMain, { color: '#10a8b2' }]}>
                                                {I18n.t('more', { locale: this.props.setting.lang })}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                    {
                                        Controller.getLoginStatus()
                                            ? <Announcement
                                                symbol={this.props.symbol}
                                                setting={this.props.setting}
                                                isConnected={this.props.isConnected}
                                                navigator={this.props.navigator}
                                                channelReload={this.props.channelLoadingTrade} />
                                            : <View style={{ height: 40, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }} >
                                                <Text style={{ opacity: 0.87 }}>{I18n.t('newsPart1')} </Text>
                                                <Text style={{ color: '#007aff' }} onPress={openSignIn}>{I18n.t('newsPart2')} </Text>
                                                <Text style={{ opacity: 0.87 }}>{I18n.t('newsPart3')}</Text>
                                            </View>
                                    }
                                </View>
                        }
                    </View>
                </View>
            );
        } catch (error) {
            console.catch(error)
            return <View />
        }
    }

    pubDataRealtime() {
        try {
            this.dic.allowRenderHeader &&
                Emitter.emit(this.dic.channelHeaderLv1FromComponent, this.dic.priceObject)
            this.dic.allowRenderContent &&
                Emitter.emit(this.dic.channelContentLv1FromComponent, this.dic.priceObject)

            return true
        } catch (error) {
            console.catch(error)
            return false
        }
    }

    onChangeAllowRender(changedRows) {
        try {
            if (!changedRows || !changedRows[this.props.rowID]) return false

            this.dic.allowRenderHeader = changedRows[this.props.rowID] === true
            this.calculateAllowRender()

            if (changedRows[this.props.rowID] && this.dic.waitRenderPrice) {
                this.dic.waitRenderPrice = false
                this.pubDataRealtime()
            }

            return true
        } catch (error) {
            console.catch(error)
            return false
        }
    }

    subParentScroll() {
        try {
            Emitter.addListener(this.props.channelAllowRenderIndex, this.id, this.onChangeAllowRender)

            return true
        } catch (error) {
            console.catch(error)
            return false
        }
    }

    render() {
        // console.log(`renderxx ${this.props.rowID} with ${this.dic.allowRenderHeader}`);
        return (
            <View style={{ backgroundColor: CommonStyle.fontWhite }}>
                <RnCollapsible
                    duration={150}
                    onChange={this.loadContent}
                    isExpand={this.state.isExpand}
                    renderHeader={this.renderHeader}
                    renderContent={this.renderContent} />
            </View>
        );
    }
}

function mapStateToProps(state) {
    return {
        trade: state.trade,
        isConnected: state.app.isConnected,
        setting: state.setting
    };
}

function mapDispatchToProps(dispatch) {
    return {
        loginActions: bindActionCreators(loginActions, dispatch),
        authSettingActions: bindActionCreators(authSettingActions, dispatch)
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Price);
