import React, { Component } from 'react';
import {
    View, FlatList, RefreshControl, Text, TouchableOpacity, PixelRatio, Platform,
    ScrollView, Dimensions, ListView
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
import filterType from '../../constants/filter_type';
import newsCount from '../../constants/news_count';
import config from '../../config';
import I18n from '../../modules/language';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import {
    logAndReport, setStyleNavigation, getUniqueArr, showNewsDetail, switchForm, readOverviewNotiNew, deleteAllNotiNews,
    getIdModalPicker
} from '../../lib/base/functionUtil';
import { iconsMap } from '../../utils/AppIcons';
import Perf from '../../lib/base/performance_monitor';
import { setCurrentScreen } from '../../lib/base/analytics';
import RowNews from './row_news';
import * as fbemit from '../../emitter';
import InvertibleScrollView from 'react-native-invertible-scroll-view';
import * as Emitter from '@lib/vietnam-emitter'
import * as Util from '../../util'
import * as StreamingBusiness from '../../streaming/streaming_business'
import * as Business from '../../business'
import XComponent from '../../component/xComponent/xComponent'
import * as translate from '../../../src/invert_translate';
import Enum from '../../enum'
import ModalPicker from './../modal_picker/modal_picker';
import analyticsEnum from '../../constants/analytics';
import ScreenId from '../../constants/screen_id';
import * as NewsBusiness from '../../streaming/news'
import * as Controller from '../../memory/controller'
import SearchBar from '~/component/search_bar/search_bar'
const { width, height } = Dimensions.get('window')
const { TAB_NEWS } = Enum
const filterObject =
{
    all: 'All',
    priceSensivtive: 'Price Sensitive'
}
const displayFilter = Util.getValueObject(filterObject);
// const listFilter = [filterType.ALL, filterType.PRICE_SENSITIVE];
export class NewsWatchlist extends XComponent {
    constructor(props) {
        super(props);

        //  bind function
        this.init = this.init.bind(this);
        this.bindAllFunc = this.bindAllFunc.bind(this);
        this.bindAllFunc();
        //  init state and dic
        this.init();
    }

    bindAllFunc() {
        this.renderToLink = this.renderToLink.bind(this);
        this.updateData = this.updateData.bind(this)
        this.updateDataStreaming = this.updateDataStreaming.bind(this)
        this.updatedCallback = this.updatedCallback.bind(this)
        this.mergeDataRealtime = this.mergeDataRealtime.bind(this)
        this.updateDataListView = this.updateDataListView.bind(this)
        this.getSnapshotData = this.getSnapshotData.bind(this)
        this.showModalNew = this.showModalNew.bind(this)
        this._renderRow = this._renderRow.bind(this)
        this._renderFooter = this._renderFooter.bind(this)
        this.loadMore = this.loadMore.bind(this)
        this.renderLoadMore = this.renderLoadMore.bind(this)
    }

    init() {
        this.dic = {
            dataSource: null,
            idForm: Util.getRandomKey(),
            listNewsRealtime: [],
            type: Enum.TYPE_NEWS.RELATED,
            displayFilter: translate.getListInvertTranslate(displayFilter)
        }

        this.state = {
            count: newsCount.count,
            modalVisible: false,
            dataSource: new ListView.DataSource({
                rowHasChanged: (r1, r2) => r1 !== r2
            })
        };
    }

    componentDidMount() {
        super.componentDidMount();
        this.updateData();
        if (Controller.getLoginStatus()) {
            this.updateDataStreaming()
        }
    }

    componentWillUnmount() {
        super.componentWillUnmount()
        // Reset relatedPageID
        this.props.actions.resetTopNew(true)
        if (Controller.getLoginStatus()) {
            NewsBusiness.unSubNewByScreen('news', TAB_NEWS.RELATED)
        }
    }

    updateData() {
        fbemit.addListener('news', 'noti', data => {
            this.updatedCallback(data)
        })
    }

    updateDataStreaming() {
        const event = StreamingBusiness.getChannelNews(TAB_NEWS.RELATED);
        Emitter.addListener(event, this.dic.idForm, data => {
            console.log('DATA REALTIME', data)
            this.mergeDataRealtime(data)
        });
    }

    updatedCallback(data) {
        const curData = this.props.news.listNewsOnWatchlist;
        const newData = curData.unshift(data);
        this.setState({
            dataSource: this.state.dataSource.cloneWithRows(
                newData
            )
        });
    }

    mergeDataRealtime(data) {
        const typeNew = this.props.news.relatedFilterType
        const typeNewRealtime = data.sign
        if (typeNew === filterType.PRICE_SENSITIVE && typeNewRealtime !== filterType.PRICE_SENSITIVE) {
            return;
        }
        const newsLength = this.dic.listNewsRealtime.length
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
                    return;
                }
            }
            this.dic.listNewsRealtime.unshift(data)
        }
        // Ghép data news realtime vào data snapshot(redux)
        this.props.actions.mergeNewsRealtime(this.dic.listNewsRealtime, TAB_NEWS.RELATED)
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps && nextProps.news) {
            this.updateDataListView(nextProps.news.listNewsMergeRealtimeOnWatchlist)
        }
    }

    updateDataListView(data) {
        if (data && dataStorage.tabNews === 'relatedNews') {
            this.dic.dataSource = data
            this.setState({
                dataSource: this.state.dataSource.cloneWithRows(
                    data
                )
            });
        }
    }

    renderToLink(data) {
        const newID = data.news_id || ''
        showNewsDetail(newID, this.props.navigator, this.props.isConnected, data);
    }

    _renderRow(rowData, sectionID, rowID) {
        const listUnread = dataStorage.list_news_unread;
        const check = listUnread[rowData.news_id];
        return (
            <RowNews
                newType={Enum.TYPE_NEWS.RELATED}
                index={rowID} unread={check}
                key={`${rowData.news_id}_${rowID}`}
                testID='RowNewsOnWatchlist'
                data={rowData}
                renderToLink={this.renderToLink} />
        );
    }
    _renderFooter() {
        return (
            <View style={{ height: 100, borderTopWidth: 1, borderColor: CommonStyle.fontBorderGray, justifyContent: 'center', alignItems: 'center' }}>
                {
                    this.props.news.isRelatedLoadMore ? <ProgressBar /> : <View />
                }
            </View>
        )
    }

    showModalNew() {
        this.props.navigator.showModal({
            animationType: 'slide-up',
            backButtonTitle: ' ',
            screen: 'equix.NewsSearch',
            passProps: {
                code: '',
                typeNews: this.props.news.relatedFilterType,
                type: this.dic.type,
                isRelated: true
            },
            navigatorStyle: {
                ...CommonStyle.navigatorSpecialNoHeader,
                modalPresentationStyle: 'overCurrentContext'
            }
        });
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

    getSnapshotData(filterTypeNewSelect) {
        const newType = Enum.TYPE_NEWS.RELATED
        const pageID = this.props.news.relatedPageID
        const pageSize = Enum.PAGE_SIZE_NEWS
        const filterTypeNew = this.getFilterTypeNew(filterTypeNewSelect);
        this.props.actions.loadNewsData(newType, filterTypeNew, pageID, pageSize, false)
    }

    loadMore() {
        if (this.dic.dataSource.length > 10) {
            const newType = Enum.TYPE_NEWS.RELATED
            const pageID = this.props.news.relatedPageID + 1
            const pageSize = Enum.PAGE_SIZE_NEWS
            const filterTypeNew = this.props.news.relatedFilterType
            this.props.actions.loadNewsData(newType, filterTypeNew, pageID, pageSize, true, true)
        } else {
            return null
        }
    }

    renderLoadMore(props) {
        return (
            <InvertibleScrollView showsVerticalScrollIndicator={false} {...props} />
        )
    }

    render() {
        let isLoading = false
        if (isLoading) {
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
        return (
            <View testID='newsOnWatchlist' style={{ flex: 1 }}>
                {
                    !this.dic.dataSource
                        ? <View />
                        : this.dic.dataSource.length
                            ? <View style={{ flex: 1 }}>
                                <View style={{ flex: 1 }}>
                                    <ListView
                                        testID='FlatListRelatedNews'
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
                                        style={{ height, backgroundColor: CommonStyle.backgroundColorNews, paddingTop: 15 }}
                                    />
                                </View>
                                <View style={{ height: 1 }}>
                                </View>
                            </View>
                            : <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                <Text style={{ color: CommonStyle.fontColor }}>{I18n.t('noNewsData', { locale: this.props.setting.lang })}</Text>
                            </View>
                }
            </View>
        );
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
export default connect(mapStateToProps, mapDispatchToProps)(NewsWatchlist);
