import React, { Component } from 'react';
import {
    Text,
    TouchableOpacity,
    View,
    PixelRatio
} from 'react-native';
import {
    logAndReport,
    getUniqueList,
    deleteNotiNewsByCode,
    showNewsDetail
} from '../../lib/base/functionUtil';
import ProgressBar from '../../modules/_global/ProgressBar';
import time from '../../constants/time';
import * as Emitter from '@lib/vietnam-emitter'
import * as api from '../../api';
import * as Util from '../../util';
import PropTypes from 'prop-types';
import XComponent from '../../component/xComponent/xComponent'
import styles from '../trade/style/trade';
import timeagoInstance from '../../lib/base/time_ago';
import I18n from '../../modules/language/';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import IonIcons from 'react-native-vector-icons/Ionicons';
import Enum from '../../enum'

export class ChildComponent extends XComponent {
    constructor(props) {
        super(props)

        this.renderToLink = this.renderToLink.bind(this)

                this.state = {
            data: {},
            isDisabled: true
        }
    }

    componentDidMount() {
        super.componentDidMount()

        try {
            let item = this.props.data;
            let curTime = new Date().getTime();
            let updatedTime = item.updated;
            if (typeof updatedTime === 'string') {
                updatedTime = new Date(item.updated).getTime()
            }
            let enabledTime = updatedTime + 20 * 60 * 1000
            if (enabledTime <= curTime) {
                this.setState({
                    data: item,
                    isDisabled: false
                });
            } else {
                let timeCount = enabledTime - curTime;
                this.setState({ data: item }, () => {
                    setTimeout(() => {
                        this.setState({
                            isDisabled: false
                        })
                    }, timeCount);
                });
            }

            return true
        } catch (error) {
            console.catch(error)
            return false
        }
    }

    renderToLink(data = {}) {
        try {
            const newID = data.news_id || ''
            showNewsDetail(newID, this.props.navigator, this.props.isConnected)

            return true
        } catch (error) {
            console.catch(error)
            return false
        }
    }

    render() {
        try {
            const { data } = this.state;
            const { i, listLength } = this.props;
            if (!data) {
                return <View />
            }
            if (listLength <= 3) {
                return (
                    <TouchableOpacity
                        disabled={this.state.isDisabled}
                        onPress={PureFunc.getFuncImplement(this.renderToLink, [data])}
                        style={[
                            styles.rowExpandNews2,
                            { borderBottomWidth: i === listLength - 1 ? 0 : 1 }
                        ]}
                        key={this.props.i}>
                        <View style={{ flexDirection: 'row', width: '100%' }}>
                            {
                                data.link
                                    ? <TouchableOpacity
                                        testID={`${data.news_id}iconDownload`}
                                        style={{ width: '8%' }}
                                        disabled={this.state.isDisabled || !data.link}>
                                        <IonIcons
                                            name='md-download'
                                            size={20}
                                            color={this.state.isDisabled ? 'grey' : '#10a8b2'} />
                                    </TouchableOpacity>
                                    : <View style={{ width: '8%' }}></View>
                            }
                            {
                                data.link
                                    ? <Text style={[CommonStyle.textSubBlack, { width: '57%' }]}>
                                        {
                                            data.sign &&
                                                Array.isArray(data.sign) &&
                                                data.sign.includes('PriceSensitive')
                                                ? `! ${data.title}`
                                                : data.title
                                        }
                                    </Text>
                                    : <Text
                                        style={[
                                            CommonStyle.textSubNormalBlack,
                                            { width: '57%' }
                                        ]}>
                                        {
                                            data.sign &&
                                                Array.isArray(data.sign) &&
                                                data.sign.includes('PriceSensitive')
                                                ? `* ! ${data.title}`
                                                : `* ${data.title}`
                                        }
                                    </Text>
                            }
                            <Text
                                style={[
                                    CommonStyle.textSub,
                                    { textAlign: 'right', width: data.link ? '35%' : '35%' }
                                ]}>
                                {timeagoInstance.format(data.updated, 'qe_local')}
                            </Text>
                        </View>
                        {
                            data.page_count && data.page_count > 0
                                ? (
                                    <View style={{ width: '100%', paddingTop: 6 }}>
                                        <Text style={CommonStyle.textFloatingLabel}>
                                            {
                                                data.page_count > 1
                                                    ? `${data.page_count} ${I18n.t('pages', { locale: this.props.setting.lang })}`
                                                    : `${data.page_count} ${I18n.t('page', { locale: this.props.setting.lang })}`
                                            }
                                        </Text>
                                    </View>
                                ) : null
                        }
                    </TouchableOpacity>
                );
            } else {
                return (
                    <TouchableOpacity
                        disabled={this.state.isDisabled}
                        onPress={PureFunc.getFuncImplement(this.renderToLink, [data])}
                        style={[
                            styles.rowExpandNews2,
                            { borderBottomWidth: i === 2 ? 0 : 1 }
                        ]}
                        key={i}>
                        <View style={{ flexDirection: 'row', width: '100%' }}>
                            {
                                data.link
                                    ? <TouchableOpacity
                                        testID={`${data.news_id}iconDownload`}
                                        style={{ width: '8%' }}
                                        disabled={this.state.isDisabled || !data.link}>
                                        <IonIcons
                                            name='md-download'
                                            size={20}
                                            color={this.state.isDisabled ? 'grey' : '#10a8b2'} />
                                    </TouchableOpacity>
                                    : <View style={{ width: '8%' }}></View>
                            }
                            {
                                data.link
                                    ? <Text
                                        style={[
                                            CommonStyle.textSubBlack,
                                            { width: '57%' }
                                        ]} >
                                        {
                                            data.sign &&
                                                Array.isArray(data.sign) &&
                                                data.sign.includes('PriceSensitive')
                                                ? `! ${data.title}`
                                                : data.title}
                                    </Text>
                                    : <Text
                                        style={[
                                            CommonStyle.textSubNormalBlack,
                                            { width: '57%' }
                                        ]} >
                                        {
                                            data.sign &&
                                                Array.isArray(data.sign) &&
                                                data.sign.includes('PriceSensitive')
                                                ? `! * ${data.title}`
                                                : `* ${data.title}`}
                                    </Text>
                            }
                            <Text
                                style={[
                                    CommonStyle.textSub,
                                    {
                                        textAlign: 'right',
                                        width: data.link ? '35%' : '35%'
                                    }
                                ]}>
                                {timeagoInstance.format(data.updated, 'qe_local')}
                            </Text>
                        </View>
                        {
                            data.page_count && data.page_count > 0
                                ? (
                                    <View style={{ width: '100%', paddingTop: 6 }}>
                                        <Text style={CommonStyle.textFloatingLabel}>
                                            {
                                                data.page_count > 1
                                                    ? `${data.page_count} ${I18n.t('pages', { locale: this.props.setting.lang })}`
                                                    : `${data.page_count} ${I18n.t('page', { locale: this.props.setting.lang })}`
                                            }
                                        </Text>
                                    </View>
                                )
                                : null
                        }
                    </TouchableOpacity>
                );
            }
        } catch (error) {
            console.catch(error)
            return <View />
        }
    }
}

export default class Announcement extends XComponent {
    static propTypes = {
        symbol: PropTypes.string.isRequired,
        navigator: PropTypes.object.isRequired
    }

    init() {
        this.state = {
            announcements: [],
            annLoading: true
        }
    }

    bindAllFunc() {
        try {
            this.getAnnouncement = this.getAnnouncement.bind(this)
            this.c2r = this.c2r.bind(this)
            this.subChannelReload = this.subChannelReload.bind(this)
            this.getFromDateToDate = this.getFromDateToDate.bind(this)

            return true
        } catch (error) {
            console.catch(error)
            return false
        }
    }

    c2r() {
        this.setState({
            announcements: [],
            annLoading: true
        }, this.getAnnouncement);
    }

    subChannelReload() {
        try {
            this.props.channelReload &&
                Emitter.addListener(this.props.channelReload, this.id, this.c2r)

            return true
        } catch (error) {
            console.catch(error)
            return false
        }
    }

    componentDidMount() {
        try {
            super.componentDidMount()
            this.subChannelReload()
            this.getAnnouncement()

            return true
        } catch (error) {
            console.catch(error)
            return false
        }
    }

    getFromDateToDate() {
        try {
            /*
                News truyền thêm from to còn không thì lấy news
                trong ngày -> to = thời điểm hiện tại - from = lùi về 0:00 7h ngày trước
                 VD: from = 0h00 1/8 -> 7/8
            */
            const to = new Date().getTime()
            const from = Util.getStartPreviousDay(to, 6)
            return { from, to }
        } catch (error) {
            console.catch(error)
            return {}
        }
    }

    getAnnouncement() {
        try {
            const newTxt = Util.encodeSymbol(this.props.symbol);
            const newType = Enum.TYPE_NEWS.RELATED
            const pageID = 1
            const pageSize = 3
            let url = api.getNewsUrl(newType, '', newTxt, pageID, pageSize)
            url = `${url}&duration=year`

            api.requestData(url)
                .then(data => {
                    let res = []
                    if (data) {
                        res = data.data || []
                    }
                    this.setState({
                        announcements: res,
                        annLoading: false
                    }, () => {
                        // delete all noti of symbol in noti status local storage
                        deleteNotiNewsByCode(this.props.symbol);
                    })
                })

            return true
        } catch (error) {
            console.catch(error)
            return false
        }
    }

    renderLoading() {
        return (
            <View style={{
                backgroundColor: 'white',
                width: '100%',
                justifyContent: 'center',
                alignItems: 'center',
                height: 40
            }}>
                <ProgressBar />
            </View>
        );
    }

    render() {
        try {
            return this.state.annLoading
                ? this.renderLoading()
                : <View>
                    {
                        this.state.announcements.map((e, i) => {
                            return i <= 2
                                ? <ChildComponent
                                    setting={this.props.setting}
                                    isConnected={this.props.isConnected}
                                    navigator={this.props.navigator}
                                    key={e.news_id}
                                    data={e}
                                    i={i}
                                    listLength={this.state.announcements.length} />
                                : <View />
                        })
                    }
                </View>
        } catch (error) {
            console.catch(error)
            return <View />
        }
    }
};
