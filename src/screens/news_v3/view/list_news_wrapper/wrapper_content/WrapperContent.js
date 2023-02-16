import React, { PureComponent, useState, useEffect, useMemo, useRef } from 'react';
import { Text, View, FlatList, StyleSheet, TextInput, ActivityIndicator, Keyboard, TouchableOpacity, TouchableWithoutFeedback, Animated } from 'react-native';
import NewsWrapperContext from '~/screens/news_v3/view/list_news_wrapper/NewsWrapperContext.js'
import RowNew from './components/RowNews/RowNews'
import CommonStyle, { register } from '~/theme/theme_controller'
import I18n from '~/modules/language/';
import * as Animatable from 'react-native-animatable'
import RecyclerListViewContent from './components/RecyclerListViewConent'
import * as NewDetailController from '~/screens/news_v3/controller/NewDetailController'
import FlatlistSequenceAnimation from '~/screens/news_v3/view/list_news_wrapper/wrapper_content/components/FlatListSequenceAnimation/index.js'
import { SubHeader } from '~/screens/news_v3/view/list_news_wrapper/wrapper_header/WrapperHeader.js'
import OrderError from '~/component/Error/OrderError.js'
import ErrorHandlingNews from '../../../Error/ErrorHandlingNews'

import { getInfoAndShowNewDetail, showUnavailableNew } from '~/lib/base/functionUtil'
import * as appActions from '~/app.actions'
import * as Controller from '~/memory/controller'
import _ from 'lodash';
const fakeDataNews = [
    {
        'news_id': 1038017311455314439,
        'upGTDd': '10:27 PM, 01/04/22020',
        'title': 'NOVONIX Ltd (ASX:NVX) COVID-19 Corporate Update',
        'news_type': 'PDF',
        'symbol_list': ['NVX', 'ANZ', 'BHP'],
        'exchange_list': 'ASX',
        'vendor_code': 'ABN',
        'category_id_list': '105000000',
        'link': 'https://www.abnnewswire.net/press/en/100543/',
        'sign': 'PriceSensitive',
        'news_summary': null,
        'story_text': 'MARKET ANNOUNCEMENTS OFFICE END OF DAY PLEASE NOTE THAT MARKET ANNOUNCEMENTS OFFICE OPERATIONS HAVE NOW FINISHED AND THERE WILL BE NO FURTHER PROCESSING TODAY. For MARKET ANNOUNCEMENTS OFFICE MAPCLOSE'
    },
    {
        'news_id': 1038017311455314440,
        'upGTDd': '10:27 PM, 01/04/22020',
        'title': 'NOVONIX Ltd (ASX:NVX) COVID-19 Corporate Update',
        'news_type': 'PDF',
        'symbol_list': ['NVX', 'ANZ', 'BHP'],
        'exchange_list': 'ASX',
        'vendor_code': 'ABN',
        'category_id_list': '105000000',
        'link': 'https://www.abnnewswire.net/press/en/100543/',
        'sign': 'PriceSensitive',
        'news_summary': null,
        'story_text': 'MARKET ANNOUNCEMENTS OFFICE END OF DAY PLEASE NOTE THAT MARKET ANNOUNCEMENTS OFFICE OPERATIONS HAVE NOW FINISHED AND THERE WILL BE NO FURTHER PROCESSING TODAY. For MARKET ANNOUNCEMENTS OFFICE MAPCLOSE'
    },

    {
        'news_id': 1038017311455314441,
        'upGTDd': '10:27 PM, 01/04/22020',
        'title': 'NOVONIX Ltd (ASX:NVX) COVID-19 Corporate Update',
        'news_type': 'PDF',
        'symbol_list': ['NVX', 'ANZ', 'BHP'],
        'exchange_list': 'ASX',
        'vendor_code': 'ABN',
        'category_id_list': '105000000',
        'link': 'https://www.abnnewswire.net/press/en/100543/',
        'sign': 'PriceSensitive',
        'news_summary': null,
        'story_text': 'MARKET ANNOUNCEMENTS OFFICE END OF DAY PLEASE NOTE THAT MARKET ANNOUNCEMENTS OFFICE OPERATIONS HAVE NOW FINISHED AND THERE WILL BE NO FURTHER PROCESSING TODAY. For MARKET ANNOUNCEMENTS OFFICE MAPCLOSE'
    },

    {
        'news_id': 1038017311455314442,
        'upGTDd': '10:27 PM, 01/04/22020',
        'title': 'NOVONIX Ltd (ASX:NVX) COVID-19 Corporate Update',
        'news_type': 'PDF',
        'symbol_list': ['NVX', 'ANZ', 'BHP'],
        'exchange_list': 'ASX',
        'vendor_code': 'ABN',
        'category_id_list': '105000000',
        'link': 'https://www.abnnewswire.net/press/en/100543/',
        'sign': 'PriceSensitive',
        'news_summary': null,
        'story_text': 'MARKET ANNOUNCEMENTS OFFICE END OF DAY PLEASE NOTE THAT MARKET ANNOUNCEMENTS OFFICE OPERATIONS HAVE NOW FINISHED AND THERE WILL BE NO FURTHER PROCESSING TODAY. For MARKET ANNOUNCEMENTS OFFICE MAPCLOSE'
    },

    {
        'news_id': 1038017311455314443,
        'upGTDd': '10:27 PM, 01/04/22020',
        'title': 'NOVONIX Ltd (ASX:NVX) COVID-19 Corporate Update',
        'news_type': 'PDF',
        'symbol_list': ['NVX', 'ANZ', 'BHP'],
        'exchange_list': 'ASX',
        'vendor_code': 'ABN',
        'category_id_list': '105000000',
        'link': 'https://www.abnnewswire.net/press/en/100543/',
        'sign': 'PriceSensitive',
        'news_summary': null,
        'story_text': 'MARKET ANNOUNCEMENTS OFFICE END OF DAY PLEASE NOTE THAT MARKET ANNOUNCEMENTS OFFICE OPERATIONS HAVE NOW FINISHED AND THERE WILL BE NO FURTHER PROCESSING TODAY. For MARKET ANNOUNCEMENTS OFFICE MAPCLOSE'
    },

    {
        'news_id': 1038017311455314444,
        'upGTDd': '10:27 PM, 01/04/22020',
        'title': 'NOVONIX Ltd (ASX:NVX) COVID-19 Corporate Update',
        'news_type': 'PDF',
        'symbol_list': ['NVX', 'ANZ', 'BHP'],
        'exchange_list': 'ASX',
        'vendor_code': 'ABN',
        'category_id_list': '105000000',
        'link': 'https://www.abnnewswire.net/press/en/100543/',
        'sign': 'PriceSensitive',
        'news_summary': null,
        'story_text': 'MARKET ANNOUNCEMENTS OFFICE END OF DAY PLEASE NOTE THAT MARKET ANNOUNCEMENTS OFFICE OPERATIONS HAVE NOW FINISHED AND THERE WILL BE NO FURTHER PROCESSING TODAY. For MARKET ANNOUNCEMENTS OFFICE MAPCLOSE'
    },

    {
        'news_id': 1038017311455314445,
        'upGTDd': '10:27 PM, 01/04/22020',
        'title': 'NOVONIX Ltd (ASX:NVX) COVID-19 Corporate Update',
        'news_type': 'PDF',
        'symbol_list': ['NVX', 'ANZ', 'BHP'],
        'exchange_list': 'ASX',
        'vendor_code': 'ABN',
        'category_id_list': '105000000',
        'link': 'https://www.abnnewswire.net/press/en/100543/',
        'sign': 'PriceSensitive',
        'news_summary': null,
        'story_text': 'MARKET ANNOUNCEMENTS OFFICE END OF DAY PLEASE NOTE THAT MARKET ANNOUNCEMENTS OFFICE OPERATIONS HAVE NOW FINISHED AND THERE WILL BE NO FURTHER PROCESSING TODAY. For MARKET ANNOUNCEMENTS OFFICE MAPCLOSE'
    },

    {
        'news_id': 1038017311455314446,
        'upGTDd': '10:27 PM, 01/04/22020',
        'title': 'NOVONIX Ltd (ASX:NVX) COVID-19 Corporate Update',
        'news_type': 'PDF',
        'symbol_list': ['NVX', 'ANZ', 'BHP'],
        'exchange_list': 'ASX',
        'vendor_code': 'ABN',
        'category_id_list': '105000000',
        'link': 'https://www.abnnewswire.net/press/en/100543/',
        'sign': 'PriceSensitive',
        'news_summary': null,
        'story_text': 'MARKET ANNOUNCEMENTS OFFICE END OF DAY PLEASE NOTE THAT MARKET ANNOUNCEMENTS OFFICE OPERATIONS HAVE NOW FINISHED AND THERE WILL BE NO FURTHER PROCESSING TODAY. For MARKET ANNOUNCEMENTS OFFICE MAPCLOSE'
    },

    {
        'news_id': 1038017311455314447,
        'upGTDd': '10:27 PM, 01/04/22020',
        'title': 'NOVONIX Ltd (ASX:NVX) COVID-19 Corporate Update',
        'news_type': 'PDF',
        'symbol_list': ['NVX', 'ANZ', 'BHP'],
        'exchange_list': 'ASX',
        'vendor_code': 'ABN',
        'category_id_list': '105000000',
        'link': 'https://www.abnnewswire.net/press/en/100543/',
        'sign': 'PriceSensitive',
        'news_summary': null,
        'story_text': 'MARKET ANNOUNCEMENTS OFFICE END OF DAY PLEASE NOTE THAT MARKET ANNOUNCEMENTS OFFICE OPERATIONS HAVE NOW FINISHED AND THERE WILL BE NO FURTHER PROCESSING TODAY. For MARKET ANNOUNCEMENTS OFFICE MAPCLOSE'
    }
]

class WrapperContent extends PureComponent {
    constructor(props) {
        super(props)
        this.init = true
        this.state = {
            isRender: false,
            page: 1,
            numberItem: 10,
            isLoadMore: false,
            paddingTop: 56
        }
        this.y = new Animated.Value(0)
        this.onScrollY = (event) => {
            const { contentOffset: { y } } = event.nativeEvent
            this.y.setValue(y)
        };
        this.page = 1
    }
    componentDidMount() {
        this.setState({ isRender: true }, () => {
            this.init = false
        })
    }
    handleShowDetailNews = (dataNews) => {
        Keyboard.dismiss()
        const { navigator } = this.props
        const error = NewDetailController.getNewsError(dataNews)
        setTimeout(() => {
            getInfoAndShowNewDetail({ dataNews, navigator, error })
        }, 0);
    }
    renderRowNews = (props) => {
        return <RowNew handleShowDetailNews={this.handleShowDetailNews} {...props} key={`${props.index}#${props.item.news_id}`} />
    }
    renderItemSeparatorComponent = () => {
        return <View style={{ height: 8 }} />
    }
    renderLoading = () => {

    }
    renderResult = () => {

    }
    renderNoData = () => {
        return <View style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <Text style={[CommonStyle.textNoData]} >{I18n.t('noData')}</Text>
        </View>
    }
    getDataByPage = (listData = []) => {
        const page = this.page
        return listData.slice(0, (page - 1) * 10 + 10)
    }
    handleLoadMore() {
        this.setState({
            isLoadMore: true
        }, () => {
            this.timeoutLoadMore && clearTimeout(this.timeoutLoadMore)
            this.timeoutLoadMore = setTimeout(() => {
                this.page = this.page + 1
                this.setState({
                    page: this.page,
                    isLoadMore: false
                })
            }, 500);
        })
    }
    renderFooterComponent = () => {
        return (
            <View style={{
                paddingTop: 8,
                width: '100%',
                alignItems: 'center',
                justifyContent: 'flex-start'
            }}>
                <ActivityIndicator color='#efefef' />
            </View>
        )
    }
    handleLayoutHeader = (event) => {
        const { height } = event.nativeEvent.layout
        this.setState({
            paddingTop: height
        })
    }
    render() {
        if (!this.state.isRender) return null
        const { y, onScrollY } = this
        const translateYHeader = y.interpolate({
            inputRange: [0, 1000],
            outputRange: [0, -1000],
            extrapolate: 'clamp'
        })
        return (
            <View onStartShouldSetResponder={Keyboard.dismiss} style={{ flex: 1 }}>
                <NewsWrapperContext.Consumer>
                    {({ isLoading, listData, search, loadMore, channelShowMessage }) => {
                        return (
                            <View style={{ flex: 1, overflow: 'hidden' }}>
                                <LoadingListener isLoading={isLoading} y={y} />
                                <Animatable.View duration={isLoading ? 1 : 500} animation={isLoading ? 'fadeIn' : 'fadeOut'} style={{
                                    flex: 1
                                }}>
                                    <FlatlistSequenceAnimation
                                        contentContainerStyle={{
                                            paddingTop: this.state.paddingTop
                                        }}
                                        isLoading={isLoading}
                                        // duration={duration}
                                        ItemSeparatorComponent={this.renderItemSeparatorComponent}
                                        style={{
                                            paddingVertical: 8,
                                            paddingHorizontal: 8
                                        }}
                                        data={fakeDataNews}
                                    />
                                </Animatable.View>
                                {
                                    !isLoading && (
                                        <Animatable.View animation={'fadeIn'} style={[StyleSheet.absoluteFillObject]} >
                                            <RecyclerListViewContent
                                                y={y}
                                                paddingTop={this.state.paddingTop}
                                                onScrollY={onScrollY}
                                                loadMore={loadMore}
                                                isCheck={this.props.isCheck}
                                                handleShowDetailNews={this.handleShowDetailNews}
                                                data={listData}
                                            />
                                        </Animatable.View>
                                    )
                                }
                                <Animated.View onLayout={this.handleLayoutHeader} style={{
                                    position: 'absolute',
                                    transform: [
                                        {
                                            translateY: translateYHeader
                                        }
                                    ],
                                    backgroundColor: CommonStyle.backgroundColor
                                }} onPress={Keyboard.dismiss}>
                                    <SubHeader />
                                    <ErrorHandlingNews channel={channelShowMessage} />

                                </Animated.View>
                            </View>
                        )
                    }}
                </NewsWrapperContext.Consumer>
            </View>
        )
    }
}
const LoadingListener = ({ isLoading, y }) => {
    useMemo(() => {
        if (isLoading) {
            y.setValue(0)
        }
    }, [isLoading])
    return null
}

export default WrapperContent;
