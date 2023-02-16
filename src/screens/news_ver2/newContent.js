import React, { Component } from 'react';
import {
    View,
    FlatList,
    StyleSheet,
    Text,
    ListView,
    ActivityIndicator
} from 'react-native';
import DATA from './data';
import RowNews from './row_news';
import Enum from '../../enum';
import { dataStorage } from '../../storage';
import { showNewsDetail } from '../../lib/base/functionUtil';
import CommonStyle from '~/theme/theme_controller';
import ProgressBar from '../../modules/_global/ProgressBar';
import VerifyMailNoti from '../../component/verify-your-mail/verify-mail-noti';
import NetworkWarning from '../../component/network_warning/network_warning';
import RowLoading from '~/screens/alert_function/components/RowLoading.js';
import ItemSeparator from '~/screens/alert_function/components/ItemSeparator';
import * as Animatable from 'react-native-animatable';

import I18n from '../../modules/language/';
import { bindActionCreators } from 'redux';
import * as Controller from '../../memory/controller';
import * as newsControl from './controller';
import * as model from './model';
import { connect } from 'react-redux';
import InvertibleScrollView from 'react-native-invertible-scroll-view';
// const { width, height } = Dimensions.get('window')
export class NewsContent extends Component {
    constructor(props) {
        super(props);

        //  bind function
        this.init = this.init.bind(this);
        this.bindAllFunc = this.bindAllFunc.bind(this);
        this.bindAllFunc();
        //  init state and dic
        this.init();
    }
    init() {
        this.state = {
            showLoadMore: false,
            data: [],
            isLoadPage: false
        };
        this.dic = {
            data: [],
            listRef: {}
        };
        this.dicPage = [];
        this.isDragDone = false;
        this.canLoadMore = true;
    }
    bindAllFunc() {
        this._renderRow = this._renderRow.bind(this);
        this.renderToLink = this.renderToLink.bind(this);
        this.loadMore = this.loadMore.bind(this);
        this.renderLoadMore = this.renderLoadMore.bind(this);
        this.handleDataFlatList = this.handleDataFlatList.bind(this);
        this.handleViewableItemsChanged = this.handleViewableItemsChanged.bind(
            this
        );
    }
    handleViewableItemsChanged({ viewableItems, changed }) {
        this.viewableItems = viewableItems;
    }
    setRefRowContent = this.setRefRowContent.bind(this);
    setRefRowContent({ index, newID, ref }) {
        this.dic.listRef[newID] = {
            index,
            ref
        };
    }
    getDelay = (index) => {
        return 500 + (index * 500) / 6;
    };
    fadeOutRowContentViewPort = () => {
        this.viewableItems &&
            this.viewableItems.map((el, index) => {
                const alertID = el.key;
                const refData = this.dic.listRef[alertID];
                if (refData) {
                    const ref = refData.ref;
                    ref && ref.fadeOut(1);
                }
            });
    };
    fadeInDownContentViewPort = () => {
        this.viewableItems &&
            this.viewableItems.map((el, index) => {
                const alertID = el.key;
                const refData = this.dic.listRef[alertID];
                if (refData) {
                    const ref = refData.ref;
                    setTimeout(() => {
                        ref && ref.fadeIn(300);
                    }, this.getDelay(index));
                }
            });
    };
    fadeInDownContent = () => {
        Object.values(this.dic.listRef).map((el) => {
            if (!el) return;
            setTimeout(() => {
                el && el.ref && el.ref.fadeIn(500);
            }, this.getDelay(el.index));
        });
    };
    fadeOutRowContent = () => {
        Object.values(this.dic.listRef).map((el) => {
            if (!el) return;
            el && el.ref && el.ref.fadeOut(1);
        });
    };
    _renderRow(Data) {
        rowID = Data.index;
        rowData = Data.item;
        const listUnread = dataStorage.list_news_unread;
        const check = listUnread[rowData.news_id];
        return (
            <RowNews
                setRefRowContent={this.setRefRowContent}
                newType={Enum.TYPE_NEWS.RELATED}
                index={rowID}
                unread={check}
                key={`${rowData.news_id}_${rowID}`}
                setRef={this.setRefListData}
                testID="RowNewsOnWatchlist"
                data={rowData}
                renderToLink={this.renderToLink}
            />
        );
    }
    setRefListData = this.setRefListData.bind(this);
    setRefListData({ ref, id }) {
        if (ref === null) {
            delete this.dic.listRefData[id];
        } else {
            this.dic.listRefData[alertID] = { ref };
        }
    }
    loadMore() {
        console.log('=========> enter loadmore <=========');
        if (!this.isDragDone || !this.canLoadMore) {
            console.log('========> isDragDone false <========');
            return;
        }
        this.canLoadMore = false;
        this.isDragDone = false;
        if (this.timeOutLoadMore) clearTimeout(this.timeOutLoadMore);
        this.timeOutLoadMore = setTimeout(() => {
            console.log('========> enter loadmore getsnapshot<========');
            this.setState({ showLoadMore: true });
            cb = (res) => {
                this.canLoadMore = true;
                this.handleDataFlatList(res);
            };
            newsControl.nextPage();
            model.loadNewsData(cb);
        }, 700);
    }
    handleDataFlatList(res, tag) {
        const data = res.data || [];
        // if (res.current_page) newsControl.setDicPage(res.current_page);
        // if (this.dicPage.includes(res.current_page)) return;
        // res.current_page && this.dicPage.push(res.current_page);
        newsControl.setDataNews(data, tag);
        const dataNews = newsControl.getDataNews();
        console.log('========> handleDataFlatList <========', dataNews);
        this.setState({
            data: dataNews,
            showLoadMore: false
        });
    }
    // renderLoadMore(props) {
    //     return (
    //         <InvertibleScrollView showsVerticalScrollIndicator={false} {...props} />
    //     )
    // }
    renderLoadMore() {
        return !this.state.showLoadMore ? (
            <View></View>
        ) : (
            <View
                style={{
                    height: 90,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: 'red'
                }}
            >
                <ProgressBar />
            </View>
        );
    }
    renderSeparator = () => {
        return <ItemSeparator />;
    };
    renderToLink(data) {
        const newID = data.news_id || '';
        showNewsDetail(
            newID,
            this.props.navigator,
            this.props.isConnected,
            data
        );
    }
    handleOnDoneRowLoading = (ref) => {
        // this.props.loadData && this.props.loadData()
    };
    setRefRowLoading = (ref) => {
        this.refLoading = ref;
    };
    setRefViewContent = (ref) => {
        this.refViewContentData = ref;
    };
    renderFooter() {
        if (!this.state.isLoading) {
            return (
                <View
                    style={{
                        height: 96,
                        width: '100%',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    {/* <ActivityIndicator /> */}
                </View>
            );
        }
        return (
            <View
                style={{
                    height: 126,
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    paddingTop: 8
                }}
            >
                <ActivityIndicator color="#efefef" />
            </View>
        );
    }
    handleLoadMore = () => {
        if (this.state.isLoading) {
            return;
        }
        if (newsControl.getPageId() >= this.props.data.total_pages) {
            return;
        }
        this.setState({
            isLoading: true
        });

        this.props.loadMore(() => {
            this.setState({
                isLoading: false
            });
        });
    };

    renderLoading = this.renderLoading.bind(this);
    renderLoading() {
        return (
            <View
                style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    marginTop: 16,
                    paddingHorizontal: 16
                }}
                pointerEvents="box-none"
            >
                <RowLoading
                    type="news"
                    onDone={this.handleOnDoneRowLoading}
                    ref={this.setRefRowLoading}
                />
            </View>
        );
    }

    render() {
        const { data = [] } = this.props.data;
        const { isLoadPage, isNodata } = this.props;
        console.log('DCM data', data);
        // const data = DATA.data.slice(0, 9);
        // const loadMore = newsControl.getStateLoadMore();
        // const loading = model.getStateLoading();
        // const loadPage = newsControl.getStateLoadPage();
        // if (loadPage) {
        //     return (
        //         <View style={{
        //             backgroundColor: CommonStyle.backgroundColor,
        //             flex: 1,
        //             justifyContent: 'center',
        //             alignItems: 'center'
        //         }}>
        //             <ProgressBar />
        //         </View>)
        // }
        // if (isLoadPage) {
        //     return <View style={{
        //         backgroundColor: CommonStyle.backgroundColorNews,
        //         flex: 1,
        //         justifyContent: 'center',
        //         alignItems: 'center'
        //     }}>
        //         <ProgressBar />
        //     </View>
        // }
        // if (!data.length) {
        //     return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        //         <Text style={{ color: CommonStyle.fontColor }}>{I18n.t('noNewsData', { locale: this.props.setting.lang })}</Text>
        //     </View>
        // }
        return (
            <View
                testID="newsContent"
                style={{
                    flex: 1,
                    backgroundColor: CommonStyle.backgroundColorNews
                }}
                tabLabel={I18n.t('onWatchlist', {
                    locale: this.props.setting.lang
                })}
            >
                <View style={{ flex: 1 }}>
                    {this.renderLoading()}
                    <Animatable.View
                        ref={this.setRefViewContent}
                        animation={{
                            easing: 'linear',
                            0: {
                                opacity: 1
                            },
                            1: {
                                opacity: 1
                            }
                        }}
                        style={{
                            flex: 1
                        }}
                    >
                        <FlatList
                            showsVerticalScrollIndicator={false}
                            ItemSeparatorComponent={this.renderSeparator}
                            data={data}
                            removeClippedSubviews={true}
                            onViewableItemsChanged={
                                this.handleViewableItemsChanged
                            }
                            renderItem={this._renderRow}
                            extraData={data}
                            ListFooterComponent={this.renderFooter.bind(this)}
                            keyExtractor={(item) => item && item.news_id}
                            // initialNumToRender={10}
                            onEndReached={this.handleLoadMore}
                            onEndReachedThreshold={0.5}
                        />
                        {data.length <= 0 && isNodata ? (
                            <Animatable.View
                                animation={'fadeIn'}
                                duration={500}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    bottom: 88,
                                    left: 0,
                                    right: 0,
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}
                            >
                                <Text style={CommonStyle.textNoData}>
                                    {I18n.t('noData')}
                                </Text>
                            </Animatable.View>
                        ) : null}
                    </Animatable.View>
                    {/* <View style={{ height: 88 }} /> */}
                </View>
            </View>
        );
    }
    componentWillReceiveProps(nextProps) {
        // console.log('new content componentWillReceiveProps ======>', nextProps.data, nextProps.tag)
        // this.handleDataFlatList(nextProps.data, nextProps.tag)
        // console.log('new content componentWillReceiveProps ======>', this.state.isLoadPage)
        // this.setState({ isLoadPage: nextProps.isLoadPage })
        // if (nextProps.data) {
        //     this.handleDataFlatList(nextProps.data, nextProps.tag)
        //     console.log('new content componentWillReceiveProps ======>', nextProps.data, nextProps.tag)
        // }
        // if (nextProps.isLoadPage !== this.state.isLoadPage) {
        //     console.log('new content componentWillReceiveProps ======>', this.state.isLoadPage)
        //     this.setState({ isLoadPage: nextProps.isLoadPage })
        // }
    }
    componentWillUnmount() {
        if (this.timeOutLoadMore) {
            clearTimeout(this.timeOutLoadMore);
        }
    }
    componentDidMount() {
        setTimeout(() => {
            // Fig bug ref view content underfind when new parents chua didmount
            this.props.loadData && this.props.loadData();
        }, 100);
    }
}
function mapStateToProps(state, ownProps) {
    return {
        setting: state.setting,
        isConnected: state.app.isConnected
    };
}
function mapDispatchToProps(dispatch) {
    return {};
}
export default connect(mapStateToProps, mapDispatchToProps, null, {
    forwardRef: true
})(NewsContent);
