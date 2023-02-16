import React, { PureComponent } from 'react';
import { FlatList, View, Text, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import _ from 'lodash';

import { dataStorage } from '~/storage';
import I18n from '~/modules/language';
import { openSignIn, showNewsDetail } from '~/lib/base/functionUtil';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';
import styles from '@unis/style/universal_search';
import Enum from '~/enum';
import * as Controller from '~/memory/controller';
import RowNews from '~s/news/row_news';
import SearchNewActions from './search_new.reducer';
import * as RoleUser from '~/roleUser';
import LoadingComp from '~/component/loadingComp';
import AppState from '~/lib/base/helper/appState2';
import * as api from '~/api';

export class SearchNewWithoutLogin extends PureComponent {
    getText(text) {
        return I18n.t(text, {
            locale: this.props.language
        });
    }

    render() {
        return (
            <View
                style={{
                    height: 60,
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'row'
                }}
            >
                <Text style={{ opacity: 0.87, color: CommonStyle.fontColor }}>
                    {`${this.getText('newsPart1')} `}
                </Text>
                <Text style={{ color: '#007aff' }} onPress={openSignIn}>
                    {`${this.getText('newsPart2')} `}
                </Text>
                <Text style={{ opacity: 0.87, color: CommonStyle.fontColor }}>
                    {this.getText('newsPart3')}
                </Text>
            </View>
        );
    }
}

class RowComp extends PureComponent {
    constructor(props) {
        super(props);
        this.renderToLink = this.renderToLink.bind(this);
    }

    renderToLink(data) {
        const { news_id: newID = '' } = data;
        const { navigator, isConnected } = this.props;
        showNewsDetail(newID, navigator, isConnected);
    }

    render() {
        const { news_id: newId } = this.props.data;

        let check = false;
        if (Controller.getLoginStatus()) {
            const { list_news_unread: listUnread = {} } = dataStorage;
            check = listUnread[newId];
        }

        return (
            <RowNews
                index={this.props.index}
                key={newId}
                data={this.props.data}
                unread={!!check}
                id={newId}
                navigator={this.props.navigator}
                renderToLink={this.renderToLink}
                newType={Enum.TYPE_NEWS.RELATED}
            />
        );
    }
}

export const Row = connect(state => ({
    isConnected: state.app.isConnected
}))(RowComp);

export class ListEmpty extends PureComponent {
    render() {
        return (
            <View
                style={{
                    height: 60,
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <Text style={{ color: CommonStyle.fontColor }}>
                    {I18n.t('noData', {
                        locale: this.props.language
                    })}
                </Text>
            </View>
        );
    }
}

export class SearchNew extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            isShowMore: true,
            listNewsData: [
            ]
        }
        this.getNewsData = this.getNewsData.bind(this);
        this.getRelatedNewsInday = this.getRelatedNewsInday.bind(this);
        this.getRelatedNewsInquery = this.getRelatedNewsInquery.bind(this);
        this.clickLoadMore = this.clickLoadMore.bind(this);
    }

    componentWillReceiveProps = nextProps => {
        const { isConnected, symbol } = nextProps;
        const changeNerworkState =
            this.props.isConnected === false && isConnected === true;
        const changeSymbol = this.props.symbol !== symbol;
        if (changeNerworkState || changeSymbol) {
            this.getNewsData({ symbol });
        }
    };
    getRelatedNewsInday(url) {
        return new Promise(resolve => {
            api.requestData(url).then(data => {
                if (data) {
                    if (data.errorCode) {
                        resolve({})
                    } else {
                        let res = data || {};
                        resolve(res)
                    }
                } else {
                    resolve({})
                }
            })
        })
    }
    getRelatedNewsInquery(url) {
        return new Promise(resolve => {
            api.requestData(url).then(data => {
                if (data) {
                    if (data.errorCode) {
                        resolve({})
                    } else {
                        let res = data || {};
                        resolve(res)
                    }
                } else {
                    resolve({})
                }
            })
        })
    }
    getNewsData() {
        try {
            const filterTypeNew = Enum.FILTER_TYPE_NEWS.ALL;
            const stringQuery = this.props.symbol + '';
            if (!stringQuery) {
                console.log('have no symbol news');
                this.setState({
                    listNewsData: [
                    ]
                })
                return;
            }
            const newType = Enum.TYPE_NEWS.SINGLE;
            const urlNewsInday = api.getNewsInday(filterTypeNew, stringQuery);
            const urlNewsInQuery = api.getNewsUrl(newType, filterTypeNew, stringQuery, 1, 5);
            const listPromise = [
                this.getRelatedNewsInday(urlNewsInday),
                this.getRelatedNewsInquery(urlNewsInQuery)
            ]
            Promise.all(listPromise)
                .then(response => {
                    const newsInday = response[0] || []
                    const newsInquery = response[1] || []
                    const data = { ...newsInday, ...newsInquery }
                    const res = data.data || [];
                    const listNewsInday = data.data_inday || []
                    const listNewsReaded = data.data_readed || []
                    const totalNewsUnread = data.total_count_unread || 0
                })
                .catch(err => {
                    console.log(err)
                })
        } catch (error) {
            logDevice('info', `get data News exception: ${error}`);
        }
    }
    clickLoadMore() {
        this.getNewsData()
        this.setState({
            isShowMore: false
        })
    }
    componentDidMount = () => {
        this.getNewsData();
    };
    render() {
        const isLogged = Controller.getLoginStatus();
        const { lang } = this.props.setting;
        if (!isLogged) {
            return <SearchNewWithoutLogin language={lang} />;
        }
        const { navigator, isLoading } = this.props;
        const { listNewsData } = this.state;
        const hadRole = RoleUser.checkRoleByKey(
            Enum.ROLE_DETAIL.VIEW_NEWS_OF_SYMBOL_UNIVERSALSEARCH
        );
        if (_.isEmpty(listNewsData) || !hadRole) {
            return <ListEmpty language={lang} />;
        }
        return (
            <LoadingComp isLoading={isLoading}>
                <FlatList
                    data={_.values(listNewsData)}
                    renderItem={({ item, index }) => (
                        <Row data={item} index={index} navigator={navigator} />
                    )}
                />
                {this.state.isShowMore ? <TouchableOpacity
                    onPress={this.clickLoadMore}
                    style={[
                        styles.rowExpandNews,
                        {
                            width: '100%',
                            backgroundColor: CommonStyle.backgroundColor
                        }
                    ]}
                >
                    <Text
                        style={{
                            fontSize: CommonStyle.fontSizeS,
                            color: CommonStyle.fontBlue
                        }}
                    >
                        {I18n.t('More')}
                    </Text>
                </TouchableOpacity> : <View />}
            </LoadingComp>
        );
    }
}

const mapStateToProps = state => ({
    setting: state.setting,
    isLoading: state.searchNews.isLoadingNews,
    isConnected: state.app.isConnected,
    symbol: state.searchDetail.symbol
});
export default connect(
    mapStateToProps
)(SearchNew);
