import React, { Component, PureComponent } from 'react';

import {
    View,
    Text,
    Dimensions,
    ActivityIndicator,
    Keyboard,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Animated
} from 'react-native';
import {
    RecyclerListView,
    LayoutProvider,
    DataProvider,
    BaseScrollView
} from 'recyclerlistview';
import * as WrapperContentController from '~/screens/news_v3/controller/list_news_wrapper_controller/wrapper_content_controller.js';
import RowNew, { HEIGHT_ROW } from './RowNews/RowNews';
import I18n from '~/modules/language/';
import CommonStyle, { register } from '~/theme/theme_controller';
class ExternalScrollView extends BaseScrollView {
    // BaseScrollView la lop interface. Must overide ScrollTo
    scrollTo(...args) {
        if (this._scrollViewRef) {
            this._scrollViewRef.scrollTo(...args);
        }
    }
    render() {
        return <Animated.ScrollView {...this.props} onScroll={Animated.event([this.props.animatedEvent], { listener: this.props.onScroll, useNativeDriver: true })} />
    }
}
const { width } = Dimensions.get('window');
const ViewTypes = {
    WITH_RELATED_SYMBOL: 'WITH_RELATED_SYMBOL',
    WITHOUT_RELATED_SYMBOL: 'WITHOUT_RELATED_SYMBOL'
};
export default class RecyclerListViewConent extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            data: new DataProvider((r1, r2) => r1 !== r2).cloneWithRows(
                this.props.data || []
            ),
            page: 1,
            numberItem: 10,
            isLoadMore: false,
            canLoadMore: true
        };
        this.onEndReachedCalledDuringMomentum = true;
        this.data = this.props.data || [];
        this.layoutProvider = new LayoutProvider(
            (index) => {
                const news = this.data[index];
                if (
                    !news.related_symbols ||
                    news.related_symbols.length === 0
                ) {
                    return ViewTypes.WITHOUT_RELATED_SYMBOL;
                } else {
                    return ViewTypes.WITH_RELATED_SYMBOL;
                }
            },
            (type, dim, index) => {
                switch (type) {
                    case ViewTypes.WITHOUT_RELATED_SYMBOL:
                        dim.height = HEIGHT_ROW.heightWithoutSymbol + 8;
                        dim.width = width;
                        break;
                    case ViewTypes.WITH_RELATED_SYMBOL:
                        dim.height = HEIGHT_ROW.height + 8;
                        dim.width = width;
                        break;
                    default:
                        break;
                }
            }
        );
        this.page = 1;
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.data.length > this.props.data.length) {
            // Co ban ghi moi
            this.data = nextProps.data;
            this.setState({
                data: new DataProvider((r1, r2) => r1 !== r2).cloneWithRows(
                    nextProps.data
                )
            });
        }
    }

    renderItemSeparatorComponent = () => {
        return <View style={{ height: 8, width: width }} />;
    };
    rowRenderer = this.rowRenderer.bind(this);
    rowRenderer(type, data, index) {
        return (
            <View
                style={{
                    paddingHorizontal: 8
                }}
            >
                {this.renderItemSeparatorComponent()}
                <RowNew
                    handleShowDetailNews={this.props.handleShowDetailNews}
                    item={data}
                    index={index}
                    key={`row_new#${data.news_id}`}
                />
            </View>
        );
    }
    getDataByPage = (listData = []) => {
        const page = this.page;
        const newData = listData.slice(0, (page - 1) * 10 + 10) || [];
        return new DataProvider((r1, r2) => r1 !== r2).cloneWithRows(newData);
    };
    handleLoadMore = this.handleLoadMore.bind(this);
    handleLoadMore() {
        if (this.state.data.getSize() === 0) return;
        if (!this.onEndReachedCalledDuringMomentum && this.state.canLoadMore) {
            this.setState(
                {
                    isLoadMore: true
                },
                () => {
                    this.onEndReachedCalledDuringMomentum = true;
                    this.timeoutLoadMore && clearTimeout(this.timeoutLoadMore);
                    this.timeoutLoadMore = setTimeout(() => {
                        this.props.loadMore &&
                            this.props.loadMore(
                                (newData, statusCode) => {
                                    const canLoadMore = statusCode !== 2
                                    newData = this.data.concat(newData);
                                    this.data = newData;
                                    this.setState({
                                        canLoadMore,
                                        isLoadMore: false,
                                        data: new DataProvider(
                                            (r1, r2) => r1 !== r2
                                        ).cloneWithRows(newData)
                                    });
                                },
                                (e) => {
                                    this.setState({
                                        isLoadMore: false
                                    });
                                }
                            );
                    }, 500);
                }
            );
        }
    }
    renderFooterComponent = () => {
        if (!this.state.isLoadMore) {
            return (
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View
                        style={{
                            height: 88,
                            width: '100%'
                        }}
                    />
                </TouchableWithoutFeedback>
            );
        }
        return (
            <View
                style={{
                    paddingTop: 8,
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'flex-start'
                }}
            >
                <ActivityIndicator color="#efefef" />
                <View style={{ height: 88 }}></View>
            </View>
        );
    };
    renderNoData = () => {
        const { isCheck } = this.props
        return (
            <TouchableWithoutFeedback
                style={{
                    width: '100%',
                    height: '100%'
                }}
                onPress={Keyboard.dismiss}
            >
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                >
                    {
                        <Text style={CommonStyle.textNoData}>
                            {I18n.t('noNewsArticles')}
                        </Text>
                    }
                </View>
            </TouchableWithoutFeedback>
        )
    };
    render() {
        if (this.state.data.getSize() === 0) return this.renderNoData();
        return (
            <RecyclerListView
                externalScrollView={ExternalScrollView}
                animatedEvent={{ nativeEvent: { contentOffset: { y: this.props.y } } }}
                contentContainerStyle={{ paddingTop: this.props.paddingTop }}
                showsVerticalScrollIndicator={false}
                onEndReached={() => {
                    this.handleLoadMore();
                }}
                onMomentumScrollBegin={() => {
                    this.onEndReachedCalledDuringMomentum = false;
                }}
                keyboardShouldPersistTaps="always"
                onEndReachedThreshold={0.5}
                style={{}}
                rowRenderer={this.rowRenderer}
                dataProvider={this.state.data}
                layoutProvider={this.layoutProvider}
                renderFooter={this.renderFooterComponent}
            />
        );
    }
}
