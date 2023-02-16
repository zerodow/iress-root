import React, { Component } from 'react';
import { View, Platform, RefreshControl, Text, TouchableOpacity, PixelRatio } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'
import firebase from '../../firebase';
import { iconsMap } from '../../utils/AppIcons';
import { func, dataStorage } from '../../storage';
import ProgressBar from '../../modules/_global/ProgressBar';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { logAndReport, log, logDevice, getSymbolInfoApi, getDisplayName, checkTradingHalt, preprocessNoti } from '../../lib/base/functionUtil';
import * as addCodeActions from './addcode.actions';
import styles from './style/addcode';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import config from '../../config';
import SortableListView from 'react-native-sortable-listview';
import I18n from '../../modules/language';
import { setCurrentScreen } from '../../lib/base/analytics';
import analyticsEnum from '../../constants/analytics';
import performanceEnum from '../../constants/performance';
import * as Controller from '../../memory/controller';
import Perf from '../../lib/base/performance_monitor';
import NetworkWarning from '../../component/network_warning/network_warning';
import ReviewAccountWarning from '../../component/review_account_warning/review_account_warning'
import {
    getApiUrl, requestData, getFeedUrl, getSymbolUrl, getUrlUserWatchList, postData,
    addUserWatchListMultiSymbol, addUserWatchList, updateUserWatchList
} from '../../api';
import Flag from '../../component/flags/flag';
import * as Business from '../../business';
import Enum from '../../enum'

export class RowComponent extends Component {
    constructor(props) {
        super(props)
        this.state = {
            company: '',
            displayName: '',
            tradingHalt: false
        }
    }

    componentDidMount() {
        const data = this.props.data || {}
        const symbol = data.symbol || ''
        if (dataStorage.symbolEquity[symbol] && dataStorage.symbolEquity[symbol].display_name) {
            const displayName = dataStorage.symbolEquity[symbol].display_name;
            this.setState({ displayName });
        } else {
            // Lấy lại symbol info
            getSymbolInfoApi(symbol, () => {
                const displayName = dataStorage.symbolEquity[symbol] && dataStorage.symbolEquity[symbol].display_name ? dataStorage.symbolEquity[symbol].display_name : symbol
                this.setState({ displayName });
            })
        }
        // Check trading halt
        checkTradingHalt(symbol).then(boolean => {
            this.setState({ tradingHalt: boolean });
        })
            .catch(err => {
                console.log(`CHECK TRADING HALT ${symbol} ERROR: `, `${err}`)
                logDevice('error', `CHECK TRADING HALT ${symbol} ERROR: ${err}`)
            });
    }

    render() {
        const rowData = this.props.data || {};
        const symbol = rowData.symbol || '';
        let displayName = getDisplayName(symbol);
        let flagIcon = Business.getFlag(symbol)
        let company = dataStorage.symbolEquity[symbol] && dataStorage.symbolEquity[symbol].company_name ? dataStorage.symbolEquity[symbol].company_name : '';
        let removeCodeWatchListTestID = 'removeCodeWatchList_' + symbol;
        let changePositionCodeWatchList = 'changePositionCodeWatchList_' + symbol;
        return (
            <View testID={`AddCodeWL${symbol}`} style={styles.rowContainer}>
                <Icon testID={removeCodeWatchListTestID} name='md-remove-circle' style={styles.iconLeft}
                    onPress={() => this.props.onDeleteCode(symbol)}
                />

                <View style={{ width: '80%' }}>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={{ flex: 1, flexDirection: 'row' }}>
                            <Text style={[CommonStyle.textMainRed]}>{this.state.tradingHalt ? '! ' : ''}</Text>
                            <Text style={styles.codeStyle}>{`${this.state.displayName}`}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Flag
                                type={'flat'}
                                code={flagIcon}
                                size={18}
                            />
                        </View>
                    </View>
                    <Text style={styles.companyStyle}>{`${company.toUpperCase()}`}</Text>
                </View>
                <Icon testID={changePositionCodeWatchList} name='md-menu' delayLongPress={500} {...this.props.sortHandlers} style={[styles.iconRight, { color: CommonStyle.fontColor }]} />
            </View>
        );
    }
}

export class AddCode extends Component {
    constructor(props) {
        super(props);
        this.userId = func.getUserId();
        this.isLoadData = true;
        this.dicUserSymbol = {};
        this.loadData = this.loadData.bind(this);
        this.updateIndexCode = this.updateIndexCode.bind(this);
        this.dataChangeUserWatchList = this.dataChangeUserWatchList.bind(this);
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
        this.onDeleteCode = this.onDeleteCode.bind(this)
        this.onRowMoved = this.onRowMoved.bind(this)
        this.onRefresh = this.onRefresh.bind(this);
        this.callbackSetOriginalData = this.callbackSetOriginalData.bind(this);
        this.objectKeys = [];
        this.originalObjectKeys = null;
        this.watchListName = 'Personal';
        this.state = {
            listData: [],
            isLoading: true,
            isFullData: false,
            isRefreshing: false,
            textSearch: '',
            isCanceled: false
        };
        this.isConnected = this.props.isConnected;
        this.perf = new Perf(performanceEnum.show_form_add_code);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps && nextProps.isConnected !== null && nextProps.isConnected !== undefined && this.isConnected !== nextProps.isConnected) {
            this.isConnected = nextProps.isConnected
            if (nextProps.isConnected) {
                this.loadData()
            }
        }
    }

    updateIndexCode(isAgreeToChange, successCb, errorCb) {
        try {
            if (isAgreeToChange) {
                logDevice('info', `UPDATE WATCHLIST - ADD CODE - ${JSON.stringify(this.objectKeys)}`)
                updateUserWatchList(Enum.WATCHLIST.USER_WATCHLIST, this.watchListName, this.objectKeys, successCb, errorCb)
            }
        } catch (error) {
            console.log('updateIndexCode addCode logAndReport exception: ', error)
            logAndReport('updateIndexCode addCode exception', error, 'updateIndexCode addCode');
        }
    }

    onNavigatorEvent(event) {
        if (event.type === 'NavBarButtonPress') {
            switch (event.id) {
                case 'done':
                    this.props.setRealtime && this.props.setRealtime(true)
                    this.updateIndexCode(true,
                        (bodyData) => {
                            // const fakeNoti = {
                            //     data: {
                            //         channel_name: 'uid1532504539902',
                            //         id: 'uid1532504539902_user_watchlist_1540982323574',
                            //         title: `user_watchlist#UPDATE#{'user_id':'uid1532504539902'}`,
                            //         sub_data: {
                            //             object_changed: {
                            //                 user_id: dataStorage.user_id,
                            //                 watchlist: 'user-watchlist',
                            //                 watchlist_name: 'Personal',
                            //                 value: bodyData
                            //             }
                            //         }
                            //     }
                            // }
                            // preprocessNoti(fakeNoti)
                            console.log('UPDATE USER WATCHLIST SUCCESS')
                            // const byPassCache = this.props.byPassCache || true
                            // this.props.loadDataFromApiFn && this.props.loadDataFromApiFn(byPassCache)
                        },
                        (err) => {
                            console.log('UPDATE USER WATCHLIST ERROR', err)
                        });
                    this.props.navigator.dismissModal();
                    break;
                case 'cancel':
                    this.props.setRealtime && this.props.setRealtime(true)
                    this.updateIndexCode(false);
                    this.props.navigator.dismissModal();
                    break;
                case 'search':
                    break;
            }
        } else {
            switch (event.id) {
                case 'willAppear':
                    setCurrentScreen(analyticsEnum.addcode);
                    this.loadData();
                    setTimeout(() => {
                        this.props.navigator.setButtons({
                            rightButtons: [
                                {
                                    title: Platform.OS === 'ios' ? I18n.t('done') : '',
                                    id: 'done',
                                    icon: Platform.OS === 'ios' ? {} : iconsMap['md-checkmark']
                                }
                            ],
                            leftButtons: [
                                {
                                    testID: 'buttonCalcelWatchListAddCode',
                                    title: I18n.t('cancel'),
                                    id: 'cancel'
                                }
                            ]
                        })
                    }, 0)
                    break;
                case 'didAppear':
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

    onRefresh() {
        this.setState({ isRefreshing: true, isLoading: true });
        this.loadData();
    }

    dataChangeUserWatchList(byPassCache, stringQuery) {
        logDevice('info', `ADD CODE - start -change user watch list`)
        try {
            getSymbolInfoApi(stringQuery, () => {
                logDevice('info', `ADD CODE - LIST USER WATCHLIST ${JSON.stringify(this.objectKeys)}`)

                this.setState({ isLoading: false });
            }, byPassCache);
        } catch (error) {
            console.log('dataChangeUserWatchList addCode logAndReport exception: ', error)
            logAndReport('dataChangeUserWatchList addCode exception', error, 'dataChangeUserWatchList addCode');
            logDevice('error', `ADD CODE - dataChangeUserWatchList addCode exception`)
        }
    }

    loadData() {
        if (!this.isLoadData) {
            this.isLoadData = true;
            return;
        }
        if (!this.isConnected) {
            this.setState({
                isLoading: false
            })
        }
        const userID = Controller.getUserId()
        logDevice('info', `ADD CODE - start - load user watch list`)
        const url = getUrlUserWatchList(userID, 'user-watchlist')
        logDevice('info', `ADD CODE - get api url -load user watch list`)
        const byPassCache = true
        try {
            requestData(url, true, null, byPassCache).then(bodyData => {
                const data = bodyData && bodyData.value ? bodyData.value : [];
                logDevice('info', `ADD CODE - get data sucesss -load user watch list ${JSON.stringify(bodyData)}`)
                // set originalObjectKeys
                let val;
                let arr;
                if (Array.isArray(data) && data.length) {
                    val = data || [];
                    arr = val.sort(function (a, b) {
                        return a.rank - b.rank;
                    });
                }
                const objData = {};
                let stringQuery = '';
                this.dicUserSymbol = {}
                for (let index = 0; index < arr.length; index++) {
                    const element = arr[index];
                    let symbol = element.symbol || ''
                    if (symbol) {
                        if (!dataStorage.symbolEquity[symbol]) {
                            stringQuery += symbol + ',';
                        }
                        objData[symbol] = element;
                        this.dicUserSymbol[symbol] = symbol;
                    }
                }
                this.originalObjectKeys = { ...objData };
                this.objectKeys = Object.keys(objData);
                this.dataChangeUserWatchList(byPassCache, stringQuery)
            })
                .catch(err => {
                    logDevice('error', `ADD CODE - api get user watch list failed ${err}`)
                    this.setState({
                        isLoading: false
                    })
                })
        } catch (error) {
            console.log('api get user watch list exception')
            logDevice('error', `ADD CODE - api get user watch list exception`)
        }
    }

    onRowMoved(e) {
        const { to, from } = e;
        if (!isNaN(to) && !isNaN(from)) {
            this.objectKeys.splice(to, 0, this.objectKeys.splice(from, 1)[0]);
            logDevice('info', `ADD CODE - LIST WATCHLIST - ${JSON.stringify(this.objectKeys)}`)
            this.forceUpdate();
        }
    }

    onDeleteCode(symbol) {
        try {
            // Remove symbol
            this.objectKeys = this.objectKeys.filter(item => {
                return item !== symbol
            })
            delete this.originalObjectKeys[symbol];
            this.setState({})
            logDevice('info', `ADD CODE - DATA OBJECT ${JSON.stringify(this.originalObjectKeys)} - LIST WATCHLIST: ${JSON.stringify(this.objectKeys)}`)
            // dataStorage.isRemoveCode = true;
        } catch (error) {
            console.log('onDeleteCode addCode logAndReport exception: ', error)
            logAndReport('onDeleteCode addCode exception', error, 'onDeleteCode addCode');
        }
    }

    callbackSetOriginalData(originalListAfterUpdate) {
        this.isLoadData = false
        this.originalObjectKeys = { ...originalListAfterUpdate }
        this.objectKeys = Object.keys(this.originalObjectKeys)
        this.setState({})
        console.log('callback', originalListAfterUpdate);
    }

    showModal() {
        this.props.navigator.showModal({
            screen: 'equix.SearchCode',
            backButtonTitle: '',
            animated: true,
            animationType: 'slide-up',
            passProps: {
                originalList: this.originalObjectKeys,
                callbackSetOriginalData: this.callbackSetOriginalData,
                dicUserSymbol: this.dicUserSymbol
            },
            navigatorStyle: {
                statusBarColor: config.background.statusBar,
                statusBarTextColorScheme: 'light',
                navBarHidden: true,
                navBarHideOnScroll: false,
                navBarTextFontSize: 18,
                // navBarBackgroundColor: CommonStyle.statusBarBgColor,
                // navBarTextColor: config.color.navigation,
                drawUnderNavBar: true,
                navBarNoBorder: true,
                // navBarButtonColor: config.button.navigation,
                navBarSubtitleColor: 'white',
                navBarSubtitleFontFamily: 'HelveticaNeue',
                screenBackgroundColor: 'transparent',
                modalPresentationStyle: 'overCurrentContext'
            }
        })
    }

    renderSearchBar() {
        return (
            <View style={CommonStyle.searchBarContainer}>
                <TouchableOpacity style={CommonStyle.searchBar}
                    onPress={this.showModal.bind(this)}>
                    <Icon name='ios-search' style={CommonStyle.iconSearch} />
                    <Text style={CommonStyle.searchPlaceHolder}>{I18n.t('search')}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    render() {
        if (this.state.isLoading) {
            return (
                <View style={{
                    backgroundColor: 'white',
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <ProgressBar />
                </View>)
        }
        return (
            <View style={[{ flex: 1, backgroundColor: 'white', marginTop: dataStorage.platform === 'ios' ? 0 : 55 }]}>
                {
                    !this.props.isConnected ? <NetworkWarning /> : null
                }
                {this.renderSearchBar()}
                <SortableListView
                    testID='sortableListViewAddCode'
                    style={{ flex: 1, backgroundColor: 'white' }}
                    data={this.originalObjectKeys}
                    order={this.objectKeys}
                    onRowMoved={this.onRowMoved}
                    onMoveStart={() => console.log('on move start')}
                    onMoveEnd={() => console.log('on move end')}
                    renderRow={row => {
                        return <RowComponent data={row} onDeleteCode={this.onDeleteCode} />
                    }}
                />
            </View>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        isConnected: state.app.isConnected
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(addCodeActions, dispatch)
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(AddCode);
