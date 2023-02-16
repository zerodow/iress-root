import React, { Component } from 'react';
import {
    View, Text, Platform, Dimensions, PixelRatio,
    TouchableOpacity, Keyboard, InteractionManager, StatusBar
} from 'react-native';
import Tabs, { ScrollableTabBar } from 'react-native-scrollable-tab-view';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as newsActions from './news.actions';
import { iconsMap } from '../../utils/AppIcons';
import config from '../../config';
import NetworkWarning from '../../component/network_warning/network_warning';
import NewsWatchlist from './related_news';
import I18n from '../../modules/language/';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import {
    logAndReport, removeItemFromLocalStorage, offTouchIDSetting,
    logDevice, switchForm, readOverviewNotiNew, deleteAllNoti, setDicReAuthen,
    deleteAllNotiNews, showNewsDetail, getIdModalPicker, pushToVerifyMailScreen,
    setRefTabbar
} from '../../lib/base/functionUtil';
import { func, dataStorage } from '../../storage';
import NewsEverything from './everything';
import ModalPicker from './../modal_picker/modal_picker';
import filterType from '../../constants/filter_type';
import newsCount from '../../constants/news_count';
import BadgeIcon from '../../component/badge/badge';
import { setCurrentScreen } from '../../lib/base/analytics';
import analyticsEnum from '../../constants/analytics';
import performanceEnum from '../../constants/performance';
import ScreenId from '../../constants/screen_id';
import Perf from '../../lib/base/performance_monitor';
import * as api from '../../api';
import * as fbemit from '../../emitter';
import * as Emitter from '@lib/vietnam-emitter'
import * as Util from '../../util';
import * as translate from '../../../src/invert_translate';
import XComponent from '../../component/xComponent/xComponent'
import Enum from '../../enum'
import * as NewsBusiness from '../../streaming/news'
import VerifyMailNoti from '../../component/verify-your-mail/verify-mail-noti';
import * as Controller from '../../memory/controller'
import * as ManageConection from '../../manage/manageConnection';
import BottomTabBar from '~/component/tabbar'

const { TAB_NEWS } = Enum
const { height, width } = Dimensions.get('window');
const filterObject =
{
    all: 'All',
    priceSensivtive: 'Price Sensitive'
}
const displayFilter = Util.getValueObject(filterObject);
const listFilter = [filterType.ALL, filterType.PRICE_SENSITIVE];
export class NewsParent extends XComponent {
    constructor(props) {
        super(props);
        //  bind function
        this.init = this.init.bind(this);
        this.bindAllFunc = this.bindAllFunc.bind(this);
        this.bindAllFunc();

        //  init state and dic
        this.init();
    }

    //  #region REACT AND DEFAULT FUNCTION
    bindAllFunc() {
        this.renderToLink = this.renderToLink.bind(this);
        this.getPosition = this.getPosition.bind(this);
        this.getPageID = this.getPageID.bind(this)
        this.getFilterTypeNew = this.getFilterTypeNew.bind(this)
        this.getNewType = this.getNewType.bind(this)
        this.getSnapshotData = this.getSnapshotData.bind(this)
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
        this.onSelected = this.onSelected.bind(this)
        this.onClose = this.onClose.bind(this)
        this.renderTabFunc = this.renderTabFunc.bind(this)
    }

    init() {
        this.dic = {
            idForm: Util.getRandomKey(),
            pageID: 1,
            isready: Platform.OS === 'ios',
            currentNew: null,
            perf: new Perf(performanceEnum.show_form_news_parent),
            displayFilter: translate.getListInvertTranslate(displayFilter)
        }
        this.state = {
            newsOnWatchlistTitle: 0,
            modalVisible: false,
            initialPage: dataStorage.tabNews === 'relatedNews' ? 0 : 1
        };
    }
    //   #end region

    onShowModalPicker() {
        this.setState({ modalVisible: true })
    }

    onClose() {
        this.setState({ modalVisible: false })
    }

    onSelected(newsType) {
        const dataTranslate = translate.getKeyTranslate(newsType);
        const dataTrantoEn = translate.getValueEnTranslate(dataTranslate);
        const filterTypeNew = getIdModalPicker(dataTrantoEn, displayFilter, listFilter)
        try {
            const rdNewsSetting = Util.getReduxSetting('news')
            const store = Controller.getGlobalState();
            let setting = store.setting;

            if (!rdNewsSetting) return;

            const userID = Controller.getUserId()
            const bodyData = {
                news: { ...rdNewsSetting }
            }
            if (dataStorage.tabNews === 'everything') {
                bodyData['news']['everything_type_news'] = filterTypeNew;
            } else {
                bodyData['news']['related_type_news'] = filterTypeNew;
            }
            setting['news'] = bodyData['news']
            const urlPut = api.getUrlUserSettingByUserId(userID, 'put');
            api.putData(urlPut, { data: setting }).then(() => {
                logDevice('info', `save type filter News success`);
            }).catch(err => {
                logDevice('info', `save type filter News failed ${err}`);
            })
            this.setState({ modalVisible: false, count: newsCount.count }, async () => {
                this.props.actions.setNewsType(filterTypeNew, dataStorage.tabNews === 'everything' ? TAB_NEWS.ALL : TAB_NEWS.RELATED);
                await this.props.actions.resetTopNew(dataStorage.tabNews === TAB_NEWS.RELATED);
                this.getSnapshotData(filterTypeNew);
            })
        } catch (error) {
            logDevice('info', `save type filter News failed ${error}`);
        }
    }

    getNewType() {
        let newType = Enum.TYPE_NEWS.RELATED
        if (dataStorage.tabNews === 'everything') {
            newType = Enum.TYPE_NEWS.EVERYTHING
        }
        return newType
    }

    getPageID() {
        let pageID = this.props.news.relatedPageID
        if (dataStorage.tabNews === 'everything') {
            pageID = this.props.news.everythingPageID
        }
        return pageID
    }

    getFilterTypeNew(filterTypeNewSelect) {
        let rdFilterTypeNew = this.props.news.relatedFilterType
        if (dataStorage.tabNews === 'everything') {
            rdFilterTypeNew = this.props.news.everythingFilterType
        }
        const filterTypeNew = filterTypeNewSelect || rdFilterTypeNew
        return filterTypeNew
    }

    getSnapshotData(filterTypeNewSelect, isLoading = false) {
        const newType = this.getNewType()
        const pageID = this.getPageID()
        const pageSize = Enum.PAGE_SIZE_NEWS
        const filterTypeNew = this.getFilterTypeNew(filterTypeNewSelect)
        this.props.actions.loadNewsData(newType, filterTypeNew, pageID, pageSize, false, isLoading)
    }

    getNewsData(filterTypeNew) {
        let newType = Enum.TYPE_NEWS.EVERYTHING
        const pageID = this.props.news.relatedPageID
        const pageSize = Enum.PAGE_SIZE_NEWS
        switch (dataStorage.tabNews) {
            case 'relatedNews':
                newType = Enum.TYPE_NEWS.RELATED
                break;
            case 'everything':
                break;
        }
        this.props.actions.loadNewsData(newType, filterTypeNew, pageID, pageSize, false)
    }

    renderToLink(data) {
        const newID = data.news_id || ''
        showNewsDetail(newID, this.props.navigator, this.props.isConnected);
    }

    onNavigatorEvent(event) {
        if (event.type === 'DeepLink') {
            if (dataStorage.notifyObj && dataStorage.notifyObj.news_id && dataStorage.switchScreen === 'News') {
                this.openNoti();
                dataStorage.switchScreen = null;
            } else {
                switchForm(this.props.navigator, event)
            }
        }
        if (event.type === 'NavBarButtonPress') {
            switch (event.id) {
                case 'news_filter':
                    this.onShowModalPicker();
                    break;
                case 'menu_ios':
                    this.props.navigator.toggleDrawer({
                        side: 'left',
                        animated: true
                    });
                    break;
            }
        } else {
            switch (event.id) {
                case 'willAppear':
                    this.dic.perf && this.dic.perf.incrementCounter(performanceEnum.show_form_news_parent);
                    setCurrentScreen(analyticsEnum.news)
                    this.dic.currentNew = null;
                    break;
                case 'didAppear':
                    setRefTabbar(this.tabbar)
                    func.setCurrentScreenId(ScreenId.NEWS)
                    dataStorage.loadData = this.getSnapshotData;
                    readOverviewNotiNew();
                    this.props.navigator.setButtons({
                        rightButtons: [{
                            testID: 'NewFilterIcon',
                            id: 'news_filter',
                            icon: iconsMap['ios-funnel-outline']
                        }],
                        leftButtons: Platform.OS === 'ios'
                            ? [
                                {
                                    title: 'menu',
                                    id: 'menu_ios',
                                    icon: iconsMap['md-menu'],
                                    testID: 'menu_ios'
                                }
                            ]
                            : [
                                {
                                    id: 'sideMenu'
                                }
                            ]
                    });
                    break;
                case 'willDisappear':
                    break;
                case 'didDisappear':
                    this.sendRequest();
                    break;
                default:
                    break;
            }
        }
    }

    sendRequest() {
        deleteAllNotiNews();
    }

    openNoti() {
        const data = dataStorage.notifyObj.data;
        if (data && data.updated) {
            const curTime = new Date().getTime();
            const enabledTime = data.updated + 1200000
            if (enabledTime <= curTime) {
                this.renderToLink(data);
            }
        }
        dataStorage.notifyObj = null;
    }

    componentWillReceiveProps(nextProps) {
        const initialPage = dataStorage.tabNews === 'everything' ? 1 : 0
        if (nextProps && (nextProps.initialPage !== this.state.initialPage || nextProps.news)) {
            const unread = nextProps.news.notiStatus && !nextProps.news.notiStatus.readOverview ? (nextProps.news.notiStatus.unread || 0) : 0
            this.setState({
                initialPage,
                newsOnWatchlistTitle: unread
            });
            if (nextProps.news && nextProps.news.listNewsOnWatchlist && dataStorage.notifyObj) {
                this.openNoti()
            }
        }
    }

    getPosition() {
        this.props.actions.loadNewsData(null, true, newsCount.count, false, null);
    }

    updateData() {
        fbemit.addListener('news', TAB_NEWS.ALL, data => {
            this.updatedCallback(data)
        })
    }

    updatedCallback(data) {
        this.getPosition();
    }

    componentDidMount() {
        super.componentDidMount()
        this.getSnapshotData(null, true)
        this.updateData();
        if (!this.props.news.notiStatus.readOverview) {
            this.setState({ newsOnWatchlistTitle: this.props.news.notiStatus.unread ? this.props.news.notiStatus.unread : 0 })
        }

        ManageConection.dicConnection.screenId = ScreenId.NEWS;
        ManageConection.dicConnection.getSnapshot = this.updateData;
    }

    componentWillUnmount() {
        super.componentWillUnmount()
        ManageConection.unRegisterSnapshot(ScreenId.NEWS);
    }

    renderTabFunc(name, page, isTabActive, onPressHandler, onLayoutHandler) {
        if (Platform.OS === 'ios') {
            return (
                <TouchableOpacity test_id={'TabNews' + page}
                    key={page}
                    onPress={() => onPressHandler(page)}
                    onLayout={onLayoutHandler}
                    style={{
                        height: 30,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRightColor: CommonStyle.btnTabActiveBgColor,
                        borderTopColor: CommonStyle.btnTabActiveBgColor,
                        borderTopWidth: 1,
                        borderBottomColor: CommonStyle.btnTabActiveBgColor,
                        borderBottomWidth: 1,
                        marginLeft: page === 0 ? 16 : 0,
                        marginRight: page === 1 ? 16 : 0,
                        borderLeftColor: CommonStyle.btnTabActiveBgColor,
                        backgroundColor: isTabActive ? CommonStyle.btnTabActiveBgColor : CommonStyle.btnTabInactiveBgColor,
                        borderLeftWidth: page === 0 ? 1 : 0,
                        borderRightWidth: 1,
                        borderTopLeftRadius: page === 0 ? 4 : 0,
                        borderBottomLeftRadius: page === 0 ? 4 : 0,
                        borderTopRightRadius: page === 1 ? 4 : 0,
                        borderBottomRightRadius: page === 1 ? 4 : 0,
                        width: (width - 32) / 2
                    }}>
                    <Text testID={'TabText' + page} style={{
                        color: isTabActive
                            ? CommonStyle.textActiveColor
                            : CommonStyle.textInactiveColor,
                        fontFamily: 'HelveticaNeue',
                        fontSize: CommonStyle.font13,
                        fontWeight: '300',
                        textAlign: 'center'
                    }}>{name}</Text>
                    {
                        page === 0 ? <BadgeIcon style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent', position: 'absolute', right: 10, top: 0 }}
                            badge={true} channel={Enum.CHANNEL_COUNT.TAB_RELATED_NEWS} /> : <View />
                    }
                </TouchableOpacity>
            );
        } else {
            return (
                <TouchableOpacity test_id={'NewsTab' + page}
                    key={page}
                    onPress={() => onPressHandler(page)}
                    onLayout={onLayoutHandler}
                    style={{
                        height: 30,
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRightColor: CommonStyle.btnTabActiveBgColor,
                        borderTopColor: CommonStyle.btnTabActiveBgColor,
                        borderTopWidth: 1,
                        borderBottomColor: CommonStyle.btnTabActiveBgColor,
                        borderBottomWidth: 1,
                        marginLeft: page === 0 ? 16 : 0,
                        marginRight: page === 1 ? 16 : 0,
                        borderLeftColor: CommonStyle.btnTabActiveBgColor,
                        backgroundColor: isTabActive ? CommonStyle.btnTabActiveBgColor : CommonStyle.btnTabInactiveBgColor,
                        borderLeftWidth: page === 0 ? 1 : 0,
                        borderRightWidth: 1,
                        borderTopLeftRadius: page === 0 ? 4 : 0,
                        borderBottomLeftRadius: page === 0 ? 4 : 0,
                        borderTopRightRadius: page === 1 ? 4 : 0,
                        borderBottomRightRadius: page === 1 ? 4 : 0,
                        width: (width - 32) / 2
                    }}>
                    <Text style={{
                        color: isTabActive
                            ? CommonStyle.textActiveColor
                            : CommonStyle.textInactiveColor,
                        fontSize: CommonStyle.fontSizeS,
                        fontFamily: CommonStyle.fontMedium,
                        textAlign: 'center'
                    }}>{name.toUpperCase()}</Text>
                    {
                        page === 0 ? <BadgeIcon style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent', position: 'absolute', right: 10, top: 0 }}
                            badge={true} channel={Enum.CHANNEL_COUNT.TAB_RELATED_NEWS} /> : <View />
                    }
                </TouchableOpacity>
            );
        }
    }

    render() {
        const selectedItem = dataStorage.tabNews === 'relatedNews' ? this.props.relatedFilterType : this.props.everythingFilterType;
        const displayItem = getIdModalPicker(selectedItem, displayFilter, displayFilter)
        return (
            <View style={{ flex: 1 }}>
                <Tabs
                    contentProps={{
                        keyboardShouldPersistTaps: 'always'
                    }}
                    style={[{
                        backgroundColor: CommonStyle.backgroundColor,
                        flex: 1
                    }]}
                    test_id='TabsNews'
                    onChangeTab={(tabInfo) => {
                        this.props.actions.loadNewsDataRequest(tabInfo && tabInfo.i === 0, false)
                        InteractionManager.runAfterInteractions(async () => {
                            this.dic.isReady = true;
                            let newType = Enum.TYPE_NEWS.EVERYTHING
                            let filterTypeNew = this.props.news.everythingFilterType
                            const pageSize = Enum.PAGE_SIZE_NEWS
                            if (tabInfo && tabInfo.i === 0) {
                                dataStorage.tabNews = 'relatedNews';

                                newType = Enum.TYPE_NEWS.RELATED
                                await this.props.actions.resetTopNew(true);
                                const pageID = this.getPageID()
                                filterTypeNew = this.props.news.relatedFilterType

                                this.props.actions.loadNewsData(newType, filterTypeNew, pageID, pageSize, false, null, true)
                            } else {
                                this.sendRequest();
                                dataStorage.tabNews = 'everything';

                                await this.props.actions.resetTopNew(false);
                                const pageID = this.getPageID()
                                this.props.actions.loadNewsData(newType, filterTypeNew, pageID, pageSize, false, null, true)
                            }
                        })
                    }}
                    locked={false}
                    initialPage={this.state.initialPage}
                    tabBarUnderlineStyle={{ height: Platform.OS === 'ios' ? 0 : 2, backgroundColor: CommonStyle.backgroundColor }}
                    renderTabBar={(...arg) => {
                        return (
                            <ScrollableTabBar activeTab={1}
                                activeTextColor='#FFF'
                                renderTab={this.renderTabFunc}
                                backgroundColor={CommonStyle.colorHeaderNews}
                                style={{ height: 50, borderColor: CommonStyle.fontBorderGray }}
                                tabsContainerStyle={Platform.OS === 'ios' ? { height: 30, marginTop: 8 } : { height: 40, marginTop: 8 }}>
                            </ScrollableTabBar>
                        );
                    }}>
                    <View testID='newsOnWatchlist' tabLabel={I18n.t('onWatchlist', { locale: this.props.setting.lang })} style={{ flex: 1, backgroundColor: CommonStyle.backgroundColor }}>
                        {Controller.getUserVerify() === 0 ? <VerifyMailNoti verifyMailFn={() => {
                            pushToVerifyMailScreen(this.props.navigator, this.props.setting.lang)
                        }}></VerifyMailNoti> : <View />}
                        {
                            !this.props.isConnected ? <NetworkWarning /> : null
                        }
                        <NewsWatchlist {...this.props} />
                    </View>
                    <View testID='newsEverything' tabLabel={I18n.t('allMarket', { locale: this.props.setting.lang })} style={{ flex: 1, backgroundColor: CommonStyle.backgroundColor }}>
                        {Controller.getUserVerify() === 0 ? <VerifyMailNoti verifyMailFn={() => {
                            pushToVerifyMailScreen(this.props.navigator, this.props.setting.lang)
                        }}></VerifyMailNoti> : <View />}
                        {
                            !this.props.isConnected ? <NetworkWarning /> : null
                        }
                        <NewsEverything {...this.props} />
                    </View>
                </Tabs>
                <ModalPicker testID='NewsModalPicker'
                    listItem={this.dic.displayFilter}
                    onSelected={this.onSelected}
                    selectedItem={translate.getInvertTranslate(displayItem)}
                    visible={this.state.modalVisible}
                    title={I18n.t('selectNewsType', { locale: this.props.setting.lang })}
                    onClose={this.onClose} />
                <BottomTabBar navigator={this.props.navigator} ref={ref => {
                    this.tabbar = ref
                    setRefTabbar(ref)
                }} />
            </View>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        news: state.news,
        relatedFilterType: state.news.relatedFilterType,
        everythingFilterType: state.news.everythingFilterType,
        isConnected: state.app.isConnected,
        setting: state.setting
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(newsActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(NewsParent);
