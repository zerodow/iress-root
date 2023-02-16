import React, { Component, PureComponent } from 'react';
import {
    View,
    Text,
    Platform,
    TouchableOpacity,
    PixelRatio,
    Dimensions,
    TextInput,
    ScrollView,
    Keyboard,
    Animated,
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    ListView,
    TouchableWithoutFeedback
} from 'react-native';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';
import { connect } from 'react-redux';
import config from '../../config';
import firebase from '../../firebase';
import styles from './style/search_account';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
    logDevice,
    logAndReport,
    getDisplayName,
    setStyleNavigation,
    searchAndSort,
    searchResponse,
    getSymbolInfoApi,
    pushToVerifyMailScreen,
    replaceTextForMultipleLanguage,
    isIphoneXorAbove,
    isAndroid
} from '../../lib/base/functionUtil';
import { func, dataStorage } from '../../storage';
import NetworkWarning from '../../component/network_warning/network_warning';
import userType from '../../constants/user_type';
import ResultSearch from '../../component/result_search/result_search';
import InvertibleScrollView from 'react-native-invertible-scroll-view';
import I18n from '../../modules/language';
import { bindActionCreators } from 'redux';
import XComponent from '../../component/xComponent/xComponent';
import ENUM from '../../enum';
import ProgressBar from '../../modules/_global/ProgressBar';
import DeviceInfo from 'react-native-device-info';
import * as settingAction from '../setting/setting.actions';
import * as api from '../../api';
import * as Business from '../../business';
import * as Emitter from '@lib/vietnam-emitter';
import * as Controller from '../../../src/memory/controller';
import * as Util from '../../../src/util';
import * as ManageHistorySearch from '~/manage/manageHistorySearch';
import {
    getChannelSyncHistorySearchAccount,
    getChannelSyncHistorySearchWLPriceboard,
    getChannelSyncHistorySearchSymbol
} from '~/streaming/channel';
import SearchBarTextInput from '~/component/search_bar/search_bar_text_input';
import Highlighter from 'react-native-highlight-words';
import { filterAccountByTextSearch } from '~/elastic_search/dao/account_list/index';
import KeyboardPushCenter from '~/component/keyboard_smart/keyboard_push_center_space.js';
const { width, height } = Dimensions.get('window');
export class RowSearchAccount extends PureComponent {
    handleSelectAccount = () => {
        this.props.selectAccount &&
            this.props.selectAccount(this.props.rowData);
    };
    render() {
        const { rowData, textSearch } = this.props;
        const textToHighLight = `${(
            rowData.account_name + ''
        ).toUpperCase()} (${rowData.account_id})`;
        return rowData.account_name ? (
            <TouchableOpacity
                style={{
                    borderRadius: 8,
                    padding: 16,
                    backgroundColor: CommonStyle.backgroundColor,
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginHorizontal: 16,
                    marginBottom: 8
                }}
                onPress={this.handleSelectAccount}
            >
                <Text
                    style={{
                        color: CommonStyle.fontWhite,
                        fontFamily: CommonStyle.fontPoppinsRegular,
                        fontSize: CommonStyle.fontSizeS,
                        lineHeight: CommonStyle.fontSizeS + 8,
                        opacity: 0.87
                    }}
                >
                    <Highlighter
                        highlightStyle={
                            textSearch
                                ? { color: CommonStyle.color.modify }
                                : { color: CommonStyle.fontWhite }
                        }
                        searchWords={[textSearch]}
                        textToHighlight={textToHighLight}
                        style={{ opacity: 1 }}
                    />
                </Text>
            </TouchableOpacity>
        ) : null;
    }
}
const mapStateToPropsRowSearchAccount = (state) => {
    return {
        textFontSize: state.setting.textFontSize
    };
};

const RowSearchAccountRedux = connect(mapStateToPropsRowSearchAccount)(
    RowSearchAccount
);

export class SearchAccount extends XComponent {
    constructor(props) {
        super(props);
        this.init = this.init.bind(this);
        this.bindAllFunc = this.bindAllFunc.bind(this);
        this.bindAllFunc();
        this.init();
    }

    init() {
        this.dic = {
            id: Util.getRandomKey(),
            deviceId: dataStorage.deviceId,
            listAccountHistory: [],
            nav: this.props.navigator,
            channelReqReload: `channel_req_reload##${this.id}`,
            channelResReload: `channel_res_reload##${this.id}`,
            timeout: null
        };

        this.state = {
            isLoading: true,
            isHistory: true,
            isRefresh: false,
            keyboardHeight: 0,
            isShowKeyboard: false,
            textSearch: '',
            dataSource: new ListView.DataSource({
                rowHasChanged: (r1, r2) => {
                    return r1 !== r2;
                }
            })
        };
    }

    bindAllFunc() {
        this.searchAccount = this.searchAccount.bind(this);
        this.selectAccount = this.selectAccount.bind(this);
        this.getSearchAccountHistory = this.getSearchAccountHistory.bind(this);
        this.setSearchAccountHistory = this.setSearchAccountHistory.bind(this);
        this.clodeModal = this.closeModal.bind(this);
        this.renderFooter = this.renderFooter.bind(this);
        this._renderRow = this._renderRow.bind(this);
        this.renderSearchBar = this.renderSearchBar.bind(this);
        this.renderNoData = this.renderNoData.bind(this);
        this.renderResultSearch = this.renderResultSearch.bind(this);
        this.renderHistoryBar = this.renderHistoryBar.bind(this);
        this.checkAccountHistoryExist = this.checkAccountHistoryExist.bind(
            this
        );
        this.props.navigator.setOnNavigatorEvent(
            this.onNavigatorEvent.bind(this)
        );
        this.checkAccountAvailable = this.checkAccountAvailable.bind(this);
    }
    checkAccountAvailable(listAccountInfo) {
        return new Promise((resolve) => {
            const userType = Controller.getUserType();
            if (
                userType === ENUM.USER_TYPE.OPERATOR ||
                userType === ENUM.USER_TYPE.ADVISOR
            ) {
                // Operator resolve ben kia
                Util.checkListAccountAvailabelOperator(
                    listAccountInfo,
                    resolve
                );
            } else if (userType === ENUM.USER_TYPE.RETAIL) {
                const listAccountAvailabel = [];
                for (let i = 0; i < listAccountInfo.length; i++) {
                    const params = Controller.getAllListAccount();
                    if (
                        Util.checkLastAccountRetail(listAccountInfo[i], params)
                    ) {
                        listAccountAvailabel.push(listAccountInfo[i]);
                    }
                }
                resolve(listAccountAvailabel);
            }
        });
    }

    // checkAccountAvailable(accountInfo) {
    // 	return new Promise(resolve => {
    // 		const userType = Controller.getUserType()
    // 		if (userType === ENUM.USER_TYPE.OPERATOR || userType === ENUM.USER_TYPE.ADVISOR) {
    // 			// Operator
    // 			Util.checkLastAccountOperator(accountInfo, resolve)
    // 		} else if (userType === ENUM.USER_TYPE.RETAIL) {
    // 			const params = Controller.getAllListAccount()
    // 			Util.checkLastAccountRetail(accountInfo, params, resolve)
    // 		}
    // 	})
    // }

    componentWillReceiveProps(nextProps) {
        if (
            nextProps.isConnected !== this.props.isConnected &&
            nextProps.isConnected
        ) {
            this.searchAccount(this.state.textSearch);
        }
    }

    getSearchAccountHistory() {
        let listAccountHistory = [];
        if (this.props.isConnected) {
            listAccountHistory = ManageHistorySearch.getHistorySearchAccount(5);
        }
        this.dic.listAccountHistory = listAccountHistory;
        this.setState({
            isLoading: false,
            isHistory: true,
            dataSource: this.state.dataSource.cloneWithRows(
                this.dic.listAccountHistory
            )
        });
    }

    storeHistorySearchLocal = this.storeHistorySearchLocal.bind(this);
    storeHistorySearchLocal() {
        // Lưu local
        ManageHistorySearch.storeHistorySearchAccountLocal(
            this.dic.listAccountHistory
        );
    }

    storeHistorySearchApi = this.storeHistorySearchApi.bind(this);
    storeHistorySearchApi() {
        ManageHistorySearch.storeHistorySearchAccountApi();
    }

    setSearchAccountHistory() {
        this.storeHistorySearchLocal();
        this.storeHistorySearchApi();
    }

    onNavigatorEvent(event) {
        if (event.type === 'NavBarButtonPress') {
            switch (event.id) {
                default:
                    break;
            }
        } else {
            switch (event.id) {
                case 'willAppear':
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

    closeModal() {
        Keyboard.dismiss();
        this.textSearch = '';
        this.setState({ textSearch: '' });
        this.dic.nav.dismissModal({
            animated: true,
            animationType: 'slide-down'
        });
        this.props.dismissForm && this.props.dismissForm();
    }

    syncHistorySearchAccount = this.syncHistorySearchAccount.bind(this);
    syncHistorySearchAccount(listAccountHistory) {
        this.dic.listAccountHistory = listAccountHistory;
        // Rerender nếu đang ở trạng thái history
        this.state.isHistory &&
            this.setState({
                dataSource: this.state.dataSource.cloneWithRows(
                    this.dic.listAccountHistory
                )
            });
    }

    subSyncHistorySearchAccount = this.subSyncHistorySearchAccount.bind(this);
    subSyncHistorySearchAccount() {
        const channel = getChannelSyncHistorySearchAccount();
        Emitter.addListener(
            channel,
            this.dic.id,
            this.syncHistorySearchAccount
        );
    }

    unsubSyncHistorySearchAccount = this.unsubSyncHistorySearchAccount.bind(
        this
    );
    unsubSyncHistorySearchAccount() {
        Emitter.deleteByIdEvent(this.dic.id);
    }

    componentDidMount() {
        super.componentDidMount();
        this.getSearchAccountHistory();
        this.subSyncHistorySearchAccount();
        setTimeout(() => {
            this.refTextInput && this.refTextInput.focus();
        }, 300);
        this.keyboardDidShowListener = Keyboard.addListener(
            'keyboardDidShow',
            this._keyboardDidShow.bind(this)
        );
        this.keyboardDidHideListener = Keyboard.addListener(
            'keyboardDidHide',
            this._keyboardDidHide.bind(this)
        );
    }

    componentWillUnmount() {
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
        this.unsubSyncHistorySearchAccount();
        super.componentWillUnmount();
    }

    _keyboardDidShow(e) {
        // height history label = 30
        // view paddingTop = 16
        if (Platform.OS === 'android') return;
        const keyboardHeight = e.endCoordinates.height || 0;
        // this.setState({ isShowKeyboard: true, keyboardHeight })
    }

    _keyboardDidHide() {
        if (Platform.OS === 'android') return;
        const keyboardHeight = 0;
        // this.setState({ isShowKeyboard: false, keyboardHeight })
    }

    searchAccount(text) {
        this.dic.timeout && clearTimeout(this.dic.timeout);
        if (text === '') {
            this.dic.timeout = setTimeout(() => {
                return this.setState({
                    isHistory: true,
                    // textSearch: '',
                    isLoading: false,
                    dataSource: this.state.dataSource.cloneWithRows(
                        this.dic.listAccountHistory
                    )
                });
            }, 300);
            return this.setState({
                textSearch: ''
            });
        }

        // if (text.length === 1) {
        // 	return this.setState({
        // 		isHistory: true,
        // 		textSearch: text,
        // 		isLoading: false,
        // 		dataSource: this.state.dataSource.cloneWithRows(this.dic.listAccountHistory)
        // 	})
        // }

        this.dic.timeout = setTimeout(() => {
            // Thay doi sang link search elastic_search
            const pageID = 1;
            const pageSize = 30;
            const url = api.getURLTopAccountActive(pageSize, pageID);
            const bodyData = filterAccountByTextSearch(
                ENUM.STATUS_ACCOUNT.ACTIVE,
                text
            );
            api.postData(url, bodyData)
                .then((res) => {
                    let listAccounts = res.data || [];
                    if (listAccounts.length) {
                        listAccounts = listAccounts.filter((e) => {
                            const status = e.status || 'active';
                            return status === 'active';
                        });
                    }
                    this.setState({
                        isHistory: false,
                        isLoading: false,
                        dataSource: this.state.dataSource.cloneWithRows(
                            listAccounts
                        )
                    });
                })
                .catch((err) => {
                    this.setState({
                        isHistory: false,
                        isLoading: false,
                        dataSource: this.state.dataSource.cloneWithRows([])
                    });
                });
        }, 300);
        console.log('DCM searchAccount3', text);
        this.setState({
            textSearch: text,
            isHistory: false,
            isLoading: true
        });
    }

    saveAccountHistoryToSetting(listAccountHistory) {
        const userId = func.getUserId();
        const newObj = { ...this.props.setting };
        newObj['account_history'] = listAccountHistory;
        newObj['deviceId'] = `${this.dic.deviceId}`;
        this.props.settingAction.settingResponse(newObj);
        const urlPut = api.getUrlUserSettingByUserId(userId, 'put');
        api.putData(urlPut, { data: newObj })
            .then((data) => {
                logDevice('info', 'save to user setting success');
            })
            .catch((error) => {
                logDevice('info', `cannot save to user setting ${error}`);
            });
    }

    checkAccountHistoryExist(dic, accountInfo) {
        let exist = false;
        for (i = 0; i < dic.length; i++) {
            if (dic[i].account_id === accountInfo.account_id) {
                exist = true;
                break;
            }
        }
        return exist;
    }

    selectAccount(accountInfo) {
        if (!accountInfo) return;
        // Nếu bấm vào history thì ko lưu history search
        if (!this.state.isHistory) {
            checkAccountExist = this.checkAccountHistoryExist(
                this.dic.listAccountHistory,
                accountInfo
            );
            if (!checkAccountExist) {
                // Chưa có trong history -> thêm vào
                if (
                    this.dic.listAccountHistory.length <
                    ENUM.NUMBER_HISTORY_SEARCH_ACCOUNT
                ) {
                    this.dic.listAccountHistory.unshift(accountInfo);
                } else {
                    this.dic.listAccountHistory.pop();
                    this.dic.listAccountHistory.unshift(accountInfo);
                }
            } else {
                // Có trong history rồi -> đưa lên đầu
                if (
                    this.dic.listAccountHistory.length <
                    ENUM.NUMBER_HISTORY_SEARCH_ACCOUNT
                ) {
                    this.dic.listAccountHistory = this.dic.listAccountHistory.filter(
                        (item) => {
                            return item.account_id !== accountInfo.account_id;
                        }
                    );
                    this.dic.listAccountHistory.unshift(accountInfo);
                } else {
                    this.dic.listAccountHistory = this.dic.listAccountHistory.filter(
                        (item) => {
                            return item.account_id !== accountInfo.account_id;
                        }
                    );
                    this.dic.listAccountHistory.unshift(accountInfo);
                }
            }
            this.setSearchAccountHistory(this.dic.listAccountHistory);
        }
        Keyboard.dismiss();
        this.textSearch = '';
        this.setState({ textSearch: '' });
        this.dic.nav.dismissModal({
            animated: true,
            animationType: 'slide-down'
        });
        this.props.onSelectedAccount(accountInfo);
    }

    renderFooter() {
        return (
            <View
                style={{
                    borderTopWidth: 1,
                    borderColor: CommonStyle.backgroundColor,
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            ></View>
        );
    }

    _renderRow(rowData, sectionID, rowID) {
        const textToHighLight = `${(
            rowData.account_name + ''
        ).toUpperCase()} (${rowData.account_id})`;
        return (
            <RowSearchAccountRedux
                textSearch={this.state.textSearch}
                rowData={rowData}
                selectAccount={this.selectAccount}
            />
        );
        return rowData.account_name ? (
            <TouchableOpacity
                style={{
                    borderRadius: 8,
                    padding: 16,
                    backgroundColor: CommonStyle.backgroundColor,
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginHorizontal: 16,
                    marginBottom: 8
                }}
                onPress={() => {
                    this.selectAccount(rowData);
                }}
            >
                <Text
                    style={{
                        color: CommonStyle.fontWhite,
                        fontFamily: CommonStyle.fontPoppinsRegular,
                        fontSize: CommonStyle.fontSizeS,
                        lineHeight: CommonStyle.fontSizeS + 8,
                        opacity: 0.87
                    }}
                >
                    <Highlighter
                        highlightStyle={
                            this.state.textSearch
                                ? { color: CommonStyle.color.modify }
                                : { color: CommonStyle.fontWhite }
                        }
                        searchWords={[this.state.textSearch]}
                        textToHighlight={textToHighLight}
                        style={{ opacity: 1 }}
                    />
                </Text>
            </TouchableOpacity>
        ) : null;
    }

    renderHistoryBar() {
        return this.state.isHistory ? (
            <View
                style={{
                    backgroundColor: CommonStyle.backgroundColorNews,
                    alignItems: 'center',
                    flexDirection: 'row',
                    paddingVertical: 8,
                    paddingHorizontal: 16
                }}
            >
                <MaterialIcon
                    name="history"
                    size={28}
                    style={{ color: CommonStyle.fontColor, paddingRight: 8 }}
                />
                <Text
                    style={{
                        fontFamily: CommonStyle.fontPoppinsMedium,
                        fontSize: CommonStyle.fontSizeS,
                        color: CommonStyle.fontColor,
                        fontWeight: '500'
                    }}
                >
                    {I18n.t('History')}
                </Text>
            </View>
        ) : (
            <View
                style={{
                    backgroundColor: CommonStyle.backgroundColorNews,
                    height: 16,
                    width: '100%'
                }}
            ></View>
        );
    }

    renderNetworkWarning() {
        if (this.props.isConnected) return null;
        return <NetworkWarning />;
    }

    setRefTextInput = (ref) => {
        if (ref) {
            this.refTextInput = ref;
        }
    };

    renderSearchBar() {
        return (
            <SearchBarTextInput
                placeholder={I18n.t('searchAccount')}
                setRefTextInput={this.setRefTextInput}
                styleContainer={
                    isAndroid()
                        ? {}
                        : { marginTop: isIphoneXorAbove() ? 38 : 16 }
                }
                onChangeText={(text) => this.searchAccount(text)}
                onReset={() => this.searchAccount('')}
                onDismissModal={this.closeModal.bind(this)}
                textSearch={this.state.textSearch}
            />
        );
    }

    renderNoData() {
        // return (
        // 	this.state.textSearch === ''
        // 		? null
        // 		: <View style={{ flex: 1, backgroundColor: CommonStyle.backgroundColorNews, justifyContent: 'center', alignItems: 'center' }}>
        // 			<Text style={{ color: CommonStyle.fontColor }}>{I18n.t('noData')}</Text>
        // 		</View>
        // )
        return (
            <View
                style={{
                    flex: 1,
                    backgroundColor: CommonStyle.backgroundColorNews,
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            >
                <KeyboardPushCenter>
                    <Text
                        style={{
                            color: CommonStyle.fontColor,
                            fontFamily: CommonStyle.fontPoppinsRegular
                        }}
                    >
                        {I18n.t('noData')}
                    </Text>
                </KeyboardPushCenter>
            </View>
        );
    }

    renderResultSearch() {
        return (
            <View
                style={{
                    flex: 1,
                    backgroundColor: CommonStyle.backgroundColorNews
                }}
            >
                {this.state.dataSource.getRowCount() > 0 ? (
                    <ListView
                        renderScrollComponent={(props) => (
                            <InvertibleScrollView
                                testID="watchlistPersonal"
                                keyboardShouldPersistTaps={'always'}
                                {...props}
                                showsVerticalScrollIndicator={false}
                                scrollEventThrottle={16}
                            />
                        )}
                        removeClippedSubviews={false}
                        keyboardShouldPersistTaps="always"
                        enableEmptySections
                        automaticallyAdjustContentInsets={false}
                        dataSource={this.state.dataSource}
                        initialListSize={20}
                        pageSize={30}
                        renderRow={this._renderRow}
                    />
                ) : (
                    this.renderNoData()
                )}
                {/* {
					this.state.isShowKeyboard
						? <View style={{ width: '100%', height: this.state.keyboardHeight }} />
						: <View style={{ width: '100%', height: 8 }} />
				} */}
            </View>
        );
    }

    dismissKeyboard() {
        Keyboard.dismiss();
    }

    render() {
        return (
            <TouchableWithoutFeedback onPress={this.dismissKeyboard}>
                <View
                    style={{
                        flex: 1,
                        backgroundColor: CommonStyle.backgroundColor
                    }}
                    testID="universalSearch"
                >
                    {this.renderSearchBar()}
                    {this.renderNetworkWarning()}
                    {this.renderHistoryBar()}
                    {this.state.isLoading ? (
                        <View
                            style={{
                                backgroundColor:
                                    CommonStyle.backgroundColorNews,
                                flex: 1,
                                justifyContent: 'center',
                                alignItems: 'center',
                                width: '100%'
                            }}
                        >
                            <KeyboardPushCenter>
                                <ProgressBar
                                    style={{
                                        flex: 1,
                                        width: '100%',
                                        alignItems: 'center',
                                        backgroundColor:
                                            CommonStyle.backgroundColorNews
                                    }}
                                />
                            </KeyboardPushCenter>
                        </View>
                    ) : (
                        this.renderResultSearch()
                    )}
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

function mapStateToProps(state, ownProps) {
    return {
        isConnected: state.app.isConnected,
        setting: state.setting
    };
}

function mapDispatchToProps(dispatch) {
    return {
        settingAction: bindActionCreators(settingAction, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SearchAccount);
