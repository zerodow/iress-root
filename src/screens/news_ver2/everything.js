import React, { Component } from 'react';
import {
    View, FlatList, RefreshControl, Text, TouchableOpacity, PixelRatio, Platform,
    ListView, Dimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'
import { func, dataStorage } from '../../storage';
import ProgressBar from '../../modules/_global/ProgressBar';
import moment from 'moment';
import styles from './style/news_search';
import * as newsActions from './news.actions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import timeagoInstance from '../../lib/base/time_ago';
import NetworkWarning from '../../component/network_warning/network_warning';
import ReviewAccountWarning from '../../component/review_account_warning/review_account_warning'
import filterType from '../../constants/filter_type';
import newsCount from '../../constants/news_count';
import config from '../../config';
import I18n from '../../modules/language';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import { logAndReport, setStyleNavigation, switchForm, logDevice, showNewsDetail, openSignIn, setRefTabbar } from '../../lib/base/functionUtil';
import { Navigation } from 'react-native-navigation';
import { iconsMap, iconsLoaded } from '../../utils/AppIcons';
import Perf from '../../lib/base/performance_monitor';
import { setCurrentScreen } from '../../lib/base/analytics';
import ModalPicker from './../modal_picker/modal_picker';
import RowNews from './row_news';
import BottomTabBar from '~/component/tabbar'
import firebase from '../../firebase';
import InvertibleScrollView from 'react-native-invertible-scroll-view';
import performanceEnum from '../../constants/performance';
import * as Util from '../../util'
import * as StreamingBusiness from '../../streaming/streaming_business'
import * as Emitter from '@lib/vietnam-emitter'
import * as Business from '../../business'
import * as NewsBusiness from '../../streaming/news'
import XComponent from '../../component/xComponent/xComponent'
import Enum from '../../enum'
import * as Controller from '../../memory/controller'
import * as manageSymbolRelated from '../../manage/manageRelatedSymbol'
import SearchBar from '~/component/search_bar/search_bar'
import Header from '../../../src/component/headerNavBar/index'
import FallHeader from '~/component/fall_header'
const { width, height } = Dimensions.get('window')
const listFilter = [filterType.ALL, filterType.PRICE_SENSITIVE];
const { TAB_NEWS } = Enum

export class News extends XComponent {
    constructor(props) {
        let ignoreNavEvent = false
        if (Controller.getLoginStatus()) {
            ignoreNavEvent = true
        }
        super(props, { ignoreNavEvent });
        //  bind function
        this.init = this.init.bind(this);
        this.bindAllFunc = this.bindAllFunc.bind(this);
        this.bindAllFunc();

        //  init state and dic
        this.init();
    }

    bindAllFunc() {
        this.renderToLink = this.renderToLink.bind(this);
        this.onShowModalPicker = this.onShowModalPicker.bind(this);
        this.onClose = this.onClose.bind(this)
        this.onSelected = this.onSelected.bind(this)
        this.updateDataStreaming = this.updateDataStreaming.bind(this)
        this.mergeDataRealtime = this.mergeDataRealtime.bind(this)
        this.updateDataListView = this.updateDataListView.bind(this)
        if (!Controller.getLoginStatus()) {
            dataStorage.tabNews = 'everything';
            this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
        }
        this.loadMore = this.loadMore.bind(this)
        this.showModalNew = this.showModalNew.bind(this)
        this._renderRow = this._renderRow.bind(this)
        this._renderFooter = this._renderFooter.bind(this)
        this.renderLoadMore = this.renderLoadMore.bind(this)
    }

    init() {
        this.dic = {
            dataSource: null,
            idForm: Util.getRandomKey(),
            listNewsRealtime: [],
            typeNews: this.props.news.everythingFilterType || filterType.ALL,
            type: Enum.TYPE_NEWS.EVERYTHING
        }
        this.state = {
            listData: [],
            modalVisible: false,
            count: newsCount.count,
            dataSource: new ListView.DataSource({
                rowHasChanged: (r1, r2) => r1 !== r2
            })
        };
    }

    onNavigatorEvent(event) {
        if (event.type === 'DeepLink') {
            switchForm(this.props.navigator, event)
        }
        if (event.type === 'NavBarButtonPress') {
            switch (event.id) {
                case 'menu_ios':
                    this.props.navigator.toggleDrawer({
                        side: 'left',
                        animated: true
                    });
                    break;
                case 'news_filter':
                    break;
            }
        } else {
            switch (event.id) {
                case 'willAppear':
                    break;
                case 'didAppear':
                    setRefTabbar(this.tabbar)
                    break;
                case 'willDisappear':
                    break;
                case 'didDisappear':
                    break;
                default:
                    break;
            }
        }
    }
    componentDidMount() {
        super.componentDidMount();
        if (Controller.getLoginStatus()) {
            this.updateDataStreaming()
        }
    }

    componentWillUnmount() {
        // Reset everythingPageID
        this.props.actions.resetTopNew(false)
        if (Controller.getLoginStatus()) {
            NewsBusiness.unSubNewByScreen('news', TAB_NEWS.ALL)
        }
        super.componentWillUnmount()
    }

    updateDataStreaming() {
        const event = StreamingBusiness.getChannelNews(TAB_NEWS.ALL);
        Emitter.addListener(event, this.dic.idForm, data => {
            console.log('DATA REALTIME', data)
            this.mergeDataRealtime(data)
        });
    }

    mergeDataRealtime(data) {
        const newsLength = this.dic.listNewsRealtime.length
        let isMerge = false;
        if (newsLength === 0) {
            this.dic.listNewsRealtime.push(data)
        } else {
            for (let i = 0; i < newsLength; i++) {
                const realtimeNewID = data.news_id;
                const newID = this.dic.listNewsRealtime[i].news_id
                if (newID === realtimeNewID) {
                    // Merge object
                    Object.keys(data).map(key => {
                        this.dic.listNewsRealtime[i][key] = data[key]
                    })
                    isMerge = true;
                    break;
                }
            }
            if (!isMerge) {
                this.dic.listNewsRealtime.unshift(data)
            }
        }
        // Ghép data news realtime vào data snapshot(redux)
        this.props.actions.mergeNewsRealtime(this.dic.listNewsRealtime, TAB_NEWS.ALL)
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps && nextProps.news) {
            // if (Controller.isPriceStreaming()) {
            //     this.updateDataListView(nextProps.news.listDataMergeRealtime)
            // } else {
            //     this.updateDataListView(nextProps.news.listData)
            // }
            this.updateDataListView(nextProps.news.listDataMergeRealtime)
        }
    }

    updateDataListView(data) {
        if (data && dataStorage.tabNews === 'everything') {
            this.dic.dataSource = data
            this.setState({
                dataSource: this.state.dataSource.cloneWithRows(
                    data
                )
            });
            if (dataStorage.notifyObj) {
                this.openNoti()
            }
        }
    }

    loadMore() {
        if (this.dic.dataSource.length > 10) {
            const newType = Enum.TYPE_NEWS.EVERYTHING
            const pageID = this.props.news.everythingPageID + 1
            const pageSize = Enum.PAGE_SIZE_NEWS
            const filterTypeNew = this.props.news.everythingFilterType
            this.props.actions.loadNewsData(newType, filterTypeNew, pageID, pageSize, true, true)
        } else {
            return null
        }
    }

    onSelected(data) {
        try {
            this.props.actions.setNewsType(data, 'everything');
            this.props.actions.resetTopNew('notLogin');
            this.setState({ modalVisible: false, count: newsCount.count }, () => {
                this.getNewsData(data);
            })
        } catch (error) {
            logDevice('info', `Everything onSelected exception: ${error}`)
        }
    }

    getNewsData(data) {
        if (Controller.getLoginStatus()) {
            switch (dataStorage.tabNews) {
                case 'relatedNews':
                    this.props.actions.loadNewsData(data, true, newsCount.count, false, null);
                    break;
                case 'everything':
                    this.props.actions.loadNewsData(data, false, newsCount.count, false, null);
                    break;
            }
        } else {
            this.props.actions.loadNewsData(data, false, newsCount.count);
        }
    }

    renderToLink(data) {
        const newID = data.news_id || ''
        showNewsDetail(newID, this.props.navigator, this.props.isConnected, data);
    }

    showModalNew() {
        this.props.navigator.showModal({
            animationType: 'slide-up',
            backButtonTitle: ' ',
            screen: 'equix.NewsSearch',
            passProps: {
                code: '',
                typeNews: this.props.news.everythingFilterType,
                type: this.dic.type
            },
            navigatorStyle: {
                ...CommonStyle.navigatorSpecialNoHeader,
                modalPresentationStyle: 'overCurrentContext'
            }
        });
    }

    dismissModal() {
        this.props.navigator.dismissModal();
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

    _renderRow(rowData, sectionID, rowID) {
        return (
            <RowNews newType={Enum.TYPE_NEWS.EVERYTHING}
                unread={false} index={rowID} testID='RowNews'
                key={`${rowData.news_id}_${rowID}`}
                data={rowData}
                renderToLink={this.renderToLink} />
        );
    }
    _renderFooter() {
        return (
            <View style={{ height: 100, borderTopWidth: 1, borderColor: CommonStyle.fontBorderGray, justifyContent: 'center', alignItems: 'center' }}>
                {
                    this.props.news.isLoadMore ? <ProgressBar /> : <View></View>
                }
            </View>
        )
    }

    renderLoadMore(props) {
        return (
            <InvertibleScrollView showsVerticalScrollIndicator={false} {...props} />
        )
    }

    onShowModalPicker() {
        this.setState({ modalVisible: true })
    }

    onClose() {
        this.setState({ modalVisible: false })
    }

    renderSearchBar() {
        return <View></View>
        // return (
        //     <SearchBar
        //         onShowModalSearch={this.showModalNew}
        //         testID='NewsSearchBar'
        //         disabled={!Controller.getLoginStatus()} />
        // );
    }

    renderHeader = this.renderHeader.bind(this)
    renderHeader() {
        return <Header
            leftIcon='ios-menu'
            title={I18n.t('News')}
            navigator={this.props.navigator}
            style={{ marginLeft: 0, paddingTop: 16 }}
        >
            <View />
        </Header>
    }

    render() {
        if (this.props.news.isLoading && Controller.getLoginStatus()) {
            return (
                <View style={{
                    backgroundColor: CommonStyle.backgroundColor,
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <ProgressBar />
                </View>)
        }
        return <FallHeader
            style={{ backgroundColor: CommonStyle.backgroundColorNews }}
            header={this.renderHeader()}
        >
            <View style={{ flex: 1 }} testID='newsScreen'>
                {
                    this.renderSearchBar()
                }
                {
                    !Controller.getLoginStatus()
                        ? <View style={{ flex: 1 }}>
                            <View style={{ flex: 1 }} >
                                <View style={{ flex: 7, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' }}>
                                    <Text style={{ opacity: 0.87, color: CommonStyle.fontColor, fontSize: CommonStyle.fontSizeS }}>{I18n.t('newsPart1')} </Text>
                                    <Text testID={`signin`} style={{ color: '#007aff', fontSize: CommonStyle.fontSizeS }} onPress={() => openSignIn()}>{I18n.t('newsPart2')} </Text>
                                    <Text style={{ opacity: 0.87, color: CommonStyle.fontColor, fontSize: CommonStyle.fontSizeS }}>{I18n.t('newsPart3')}</Text>
                                </View>
                            </View>
                            <BottomTabBar navigator={this.props.navigator} ref={ref => {
                                this.tabbar = ref
                                setRefTabbar(ref)
                            }} />
                        </View>
                        : !this.dic.dataSource
                            ? <View />
                            : this.dic.dataSource.length
                                ? <ListView
                                    testID='FlatListNews'
                                    onEndReached={this.loadMore}
                                    onEndReachedThreshold={50}
                                    renderScrollComponent={this.renderLoadMore}
                                    keyboardShouldPersistTaps="always"
                                    enableEmptySections
                                    automaticallyAdjustContentInsets={false}
                                    dataSource={this.state.dataSource}
                                    initialListSize={20}
                                    pageSize={30}
                                    renderRow={this._renderRow}
                                    renderFooter={this._renderFooter}
                                    style={{ height: height, backgroundColor: CommonStyle.backgroundColorNews, paddingTop: 15 }}
                                />
                                : <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={{ color: CommonStyle.fontColor }}>{I18n.t('noNewsData', { locale: this.props.setting.lang })}</Text>
                                </View>
                }
                <ModalPicker testID='NewsModalPicker'
                    listItem={listFilter}
                    onSelected={this.onSelected}
                    selectedItem={Controller.getLoginStatus() ? this.props.news.everythingFilterType : this.props.news.notLoginFilterType}
                    visible={this.state.modalVisible}
                    title={I18n.t('selectNewsType', { locale: this.props.setting.lang })}
                    onClose={this.onClose} />
            </View>
        </FallHeader>
    }
}

function mapStateToProps(state, ownProps) {
    return {
        news: state.news,
        isConnected: state.app.isConnected,
        setting: state.setting
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(newsActions, dispatch)
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(News);
