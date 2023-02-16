import React, { Component, PureComponent } from 'react';

import { View, Text, Dimensions, StyleSheet } from 'react-native';
import AsyncStorage from '~/manage/manageLocalStorage'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as appActions from '~/app.actions';

import Animated from 'react-native-reanimated'
import IonIcons from 'react-native-vector-icons/Ionicons'
import TouchableOpacityOpt from '~/component/touchableOpacityOpt/';
import NewOrderNavigator from '../../new_order_navigator'
import NewOrderNavigatorManagementGroup from '../../new_order_navigator_management_group';
import ModalPicker from '~/screens/modal_picker/modal_picker';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { Navigation } from 'react-native-navigation';
import I18n from '~/modules/language/';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as Controller from '~/memory/controller'
import Enum from '~/enum';
import * as PureFunc from '~/utils/pure_func'
import * as fbEmit from '~/emitter';
import * as Util from '~/util';
import { unregisterAllMessage } from '~/streaming';
import { func, dataStorage } from '~/storage';
import loginUserType from '~/constants/login_user_type'
import {
    logDevice,
    formatNumber, formatNumberNew2, logAndReport,
    getSymbolInfoApi, replaceTextForMultipleLanguage, switchForm, reloadDataAfterChangeAccount, getCommodityInfo, renderTime,
    isIphoneXorAbove
} from '~/lib/base/functionUtil';
const { width: widthDevices } = Dimensions.get('window')
const {
    ACCOUNT_STATE,
    CHANNEL,
    EVENT
} = Enum;
const { Value, set, sub, block, cond, eq, call } = Animated
export class TextSmartAccountName extends Component {
    constructor(props) {
        super(props)
        this.maxWidth = new Value(0)
        this.widthParent = new Value(0)
        this.widthId = new Value(0)
        this.isUpdateLayout = new Value(0)
    }
    handleOnLayoutContainer = (event) => {
        const { width } = event.nativeEvent.layout
        this.widthParent.setValue(width)
        this.isUpdateLayout.setValue(1)
    }
    handleOnLayoutContentId = (event) => {
        const { width } = event.nativeEvent.layout
        this.widthId.setValue(width)
        this.isUpdateLayout.setValue(1)
    }
    getMaxHeight = () => {
        return block([
            cond(eq(this.isUpdateLayout, new Value(1)), [
                set(this.maxWidth, sub(this.widthParent, this.widthId)),
                set(this.isUpdateLayout, new Value(0))
            ], [
            ]),
            this.maxWidth
        ])
    }
    render() {
        const { accountName, accountId, style } = this.props
        const maxHeight = this.getMaxHeight()
        return (
            <View onLayout={this.handleOnLayoutContainer} style={{ flex: 1, flexDirection: 'row', overflow: 'hidden' }}>
                <Animated.Text numberOfLines={1} style={[style, { maxWidth: maxHeight }]}>
                    {accountName}
                </Animated.Text>
                <Text onLayout={this.handleOnLayoutContentId} numberOfLines={1} style={[style]}>
                    {` (${accountId})`}
                </Text>
            </View>
        )
    }
}
export class ViewSmartAccountName extends Component {
    constructor(props) {
        super(props)
        this.maxWidth = new Value(0)
        this.widthParent = new Value(0)
        this.widthId = new Value(0)
        this.isUpdateLayout = new Value(0)
    }
    handleOnLayoutContainer = (event) => {
        const { width } = event.nativeEvent.layout
        this.widthParent.setValue(width)
        this.isUpdateLayout.setValue(1)
    }
    handleOnLayoutContentId = (event) => {
        const { width } = event.nativeEvent.layout
        this.widthId.setValue(width)
        this.isUpdateLayout.setValue(1)
    }
    getMaxHeight = () => {
        return block([
            cond(eq(this.isUpdateLayout, new Value(1)), [
                set(this.maxWidth, sub(this.widthParent, this.widthId)),
                set(this.isUpdateLayout, new Value(0))
            ], [
            ]),
            this.maxWidth
        ])
    }
    render() {
        const { style, text } = this.props
        const maxHeight = this.getMaxHeight()
        return (
            <View onLayout={this.handleOnLayoutContainer} style={{ flex: 1, flexDirection: 'row', overflow: 'hidden', alignItems: 'center' }}>
                <Animated.Text numberOfLines={1} style={[style, { maxWidth: maxHeight }]}>
                    {this.props.text}
                </Animated.Text>
                <View onLayout={this.handleOnLayoutContentId}>
                    {this.props.renderRightContent()}
                </View>
            </View>
        )
    }
}
const ItemPicker = props => {
    const { onPress, keyTranslate, selected, isFlag, isFirst, el, rowStyle, accountName, accountId } = props;
    let displayName = ''
    if (keyTranslate) {
        displayName = I18n.t(keyTranslate)
    } else if (el.label) {
        // Truong hop data dang [{label,value}]
        displayName = el.label
    } else {
        // Truong hop data truyen vao dang format ['ABC','BCD'] thi khong lay key dich ma hien thi luon el
        displayName = el
    }
    return (
        <TouchableOpacityOpt timeDelay={Enum.TIME_DELAY} activeOpacity={0} onPress={onPress} >
            <View style={[styles.rowContent, rowStyle, isFirst ? {} : { borderTopWidth: 1, borderTopColor: CommonStyle.fontBorder }]}>
                {
                    isFlag
                        ? <Flag
                            type="flat"
                            code={
                                displayName === Enum.mapLang.en
                                    ? 'GB'
                                    : displayName === Enum.mapLang.vi
                                        ? 'VI'
                                        : 'CN'}
                            size={18}
                        /> : null
                }
                <View style={{ marginLeft: isFlag ? 8 : 0, flex: 1, justifyContent: 'center' }}>
                    <TextSmartAccountName accountName={accountName} accountId={accountId} style={[styles.txtContent, { color: selected ? CommonStyle.fontBlue1 : CommonStyle.fontColor, fontSize: CommonStyle.fontSizeS }]} />
                    {/* <Text numberOfLines={1} style={[styles.txtContent, { color: selected ? CommonStyle.fontBlue1 : CommonStyle.fontColor, fontSize: CommonStyle.fontSizeS }]}>{displayName}</Text> */}
                </View>
                <View style={{ alignItems: 'flex-end', paddingHorizontal: 8, width: 40 }}>{
                    selected
                        ? <IonIcons
                            size={20}
                            name='md-checkmark'
                            color={CommonStyle.fontBlue1} />
                        : null
                }
                </View>
            </View>
        </TouchableOpacityOpt>
    )
}
const styles = {}

function getNewestStyle() {
    const newStyle = StyleSheet.create({
        rowContent: {
            paddingVertical: 16,
            // paddingHorizontal: 16,
            height: 52,
            flexDirection: 'row',
            justifyContent: 'center',
            width: 0.6 * widthDevices
        },
        txtContent: {
            color: CommonStyle.fontBlack,
            fontSize: CommonStyle.fontSizeS,
            fontFamily: CommonStyle.fontPoppinsRegular
        }
    });

    PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

class NewOrderNavigatorV2 extends NewOrderNavigator {
    showModalPicker = this.showModalPicker.bind(this)
    showModalPicker = (h, pY, w) => {
        Navigation.showModal({
            screen: 'equix.PickerBottomV2',
            animated: false,
            animationType: 'none',
            navigatorStyle: {
                ...CommonStyle.navigatorModalSpecialNoHeader,
                modalPresentationStyle: 'overCurrentContext'
            },
            passProps: {
                listItem: this.getListDisplayCurrentAccount(),
                title: I18n.t('titleSelectAlertType'),
                textBtnCancel: I18n.t('cancel'),
                onCancel: this.onClose,
                onSelect: this.selectedItem,
                onPressBackdrop: this.onClose,
                top: pY + h,
                height: h,
                value: this.currentItem,
                modalStyle: {
                    marginRight: 0,
                    width: '100%'
                },
                rowStyle: {
                    width: '100%'
                },
                renderItem: this.renderItemAccount,
                pickerContentWrapper: {
                }
            }
        })
    }
    renderItemAccount = (props) => {
        const { key } = props
        let listAccount = Controller.getListAccount();
        const currentAccount = listAccount[key]
        const { account_name: accountName, account_id: accountId } = currentAccount
        return (
            <ItemPicker
                accountName={accountName}
                accountId={accountId}
                {...props}
            />
        )
    }
    getDisplayAccount = (accountObj = {}) => {
        return `${accountObj.account_name || ''} (${accountObj.account_id || ''})`
    }

    getListDisplayCurrentAccount = () => {
        let listAccount = Controller.getListAccount();
        listAccount = listAccount.filter(e => e.status === ACCOUNT_STATE.ACTIVE);
        return listAccount.map(e => this.getDisplayAccount(e));
    }
    render() {
        return (
            <View>
                <ModalPicker
                    testID={`ModalPicker_modal`}
                    listItem={this.listData || []}
                    onSelected={this.selectedItem}
                    selectedItem={this.currentItem}
                    visible={this.state.modalVisible}
                    title={I18n.t('selectAccount')}
                    name='Account'
                    onClose={this.onClose} />
            </View>
        )
    }
}
export class SearchAccount extends PureComponent {
    constructor(props) {
        super(props);
        this.currentAccount = Util.cloneFn(dataStorage.currentAccount || {})
        this.state = {
            // nameAccount: this.getDisplayAccount(this.currentAccount) || '',
            currentAccount: this.getDisplayAccount(this.currentAccount),
            typeSearchAccount: this.getTypeSearchAccount()
        };
        // Maxwidth = parent -id
        this.maxWidth = new Value(0)
        this.widthParent = new Value(0)
        this.widthId = new Value(0)
        this.isUpdateLayout = new Value(0)
        this.listAccount = Controller.getListAccount();
    }
    getDisplayAccount = (accountObj = {}) => {
        return `${accountObj.account_name || ''} (${accountObj.account_id || ''})`
    }
    getInfo = (accountObj = {}) => {
        return {
            accountName: accountObj.account_name,
            accountId: accountObj.account_id
        }
    }
    getTypeSearchAccount = () => {
        const isSearchAccount = Controller.getIsSearchAccount();
        if (isSearchAccount) return Enum.TYPE_SEARCH_ACCOUNT.ABOVE_FIVE_ACCOUNT
        const listAccount = Controller.getListAccount()
        if (listAccount.length === 1) return Enum.TYPE_SEARCH_ACCOUNT.SINGLE
        return Enum.TYPE_SEARCH_ACCOUNT.LESS_FIVE_ACCOUNT
    }
    componentDidMount() {
        fbEmit.addListener(CHANNEL.ACCOUNT, EVENT.UPDATE_SELECTED_ACCOUNT, ({
            accountName,
            accountId
        }) => {
            this.currentAccount = Util.cloneFn(dataStorage.currentAccount || {});
            const displayName = accountName;
            this.setState({
                accountId,
                accountName
            })
        });
        fbEmit.addListener(CHANNEL.ACCOUNT, EVENT.FINISH_UPDATE_LIST_ACCOUNT, () => {
            this.currentAccount = Util.cloneFn(dataStorage.currentAccount || {});
            const displayName = this.getDisplayAccount(this.currentAccount);
            if (this.currentAccount.account_id !== dataStorage.currentAccount.account_id) {
                this.selectedAccount(displayName, true);
            }
            this.funcUpdateCurrentItem && this.funcUpdateCurrentItem(displayName, this.getListDisplayCurrentAccount());
        });
    }
    selectedAccountManagementGroup = (item, notSendUpdateAccount) => {
        if (!item) return;
        const userId = Controller.getUserId();
        const curAccountId = dataStorage.accountId;
        unregisterAllMessage(curAccountId);
        this.currentAccount = item;
        // Change current account on drawer
        if (!notSendUpdateAccount) {
            fbEmit.emit('account', 'update', this.currentAccount);
        }
        this.setLoginUserType(this.currentAccount, () => {
            this.setState({ currentAccount: this.currentAccount }, () => {
                AsyncStorage.setItem(`${Controller.isDemo() ? 'demo' : 'prod'}_last_account_${userId}`, JSON.stringify(this.currentAccount)).then(() => {
                    console.log(`Save last account success`);
                }).catch(error => {
                    console.log(`Save last account error: ${error}`)
                });
                reloadDataAfterChangeAccount(this.currentAccount.account_id, notSendUpdateAccount);
            })
        });
    }
    selectedAccount = (item, notSendUpdateAccount) => {
        if (item == null) return;
        const listAccount = Controller.getListAccount();
        const userId = Controller.getUserId();
        const curAccountId = dataStorage.accountId;
        unregisterAllMessage(curAccountId);
        this.currentAccount = listAccount.find(x => {
            return this.getDisplayAccount(x) === item || null
        })
        // Change current account on drawer
        if (!notSendUpdateAccount) {
            fbEmit.emit('account', 'update', this.currentAccount);
        }
        this.setLoginUserType(this.currentAccount, () => {
            this.setState({ currentAccount: this.currentAccount }, () => {
                AsyncStorage.setItem(`${Controller.isDemo() ? 'demo' : 'prod'}_last_account_${userId}`, JSON.stringify(this.currentAccount)).then(() => {
                    console.log(`Save last account success`);
                }).catch(error => {
                    console.log(`Save last account error: ${error}`)
                });
                reloadDataAfterChangeAccount(this.currentAccount.account_id);
            })
        });
    }
    setLoginUserType = (accountInfo, cb) => {
        const k = accountInfo;
        func.setAccountId(k.account_id);
        // check account reviews
        if (k.status === 'inactive') {
            // Tài khoản bị khoá
            // this.props.appActions.checkReviewAccount(false)
            this.props.appActions.setLoginUserType(loginUserType.LOCKED);
            dataStorage.isLockedAccount = true;
            dataStorage.isNewOverview = false; // Set lai de khong bi busybox trong function getData personalB
            cb && cb()
        } else {
            // Redux - isReviewAccount = falses
            // Tài khoản member
            // this.props.appActions.checkReviewAccount(false)
            this.props.appActions.setLoginUserType(loginUserType.MEMBER);
            dataStorage.isNewOverview = false; // Set lai de khong bi busybox trong function getData personalB
            dataStorage.isLockedAccount = false;
            cb && cb()
        }
    }
    handleClickSelectAccount = () => {
        const isSearchAccount = Controller.getIsSearchAccount();

        if (this.state.typeSearchAccount === Enum.TYPE_SEARCH_ACCOUNT.ABOVE_FIVE_ACCOUNT) {
            this.searchAccount()
        } else if (this.state.typeSearchAccount === Enum.TYPE_SEARCH_ACCOUNT.LESS_FIVE_ACCOUNT) {
            if (this.refNavigatorSearchAccount) {
                this.refChangeAccountView && this.refChangeAccountView.measure((x, y, w, h, pX, pY) => {
                    this.refNavigatorSearchAccount.showModalPicker(h, pY, w)
                })
            }
        } else {
            return null
        }
    }
    dismissForm = this.dismissForm.bind(this)
    dismissForm() {
        setTimeout(() => {
            this.refButtonConfirm && this.refButtonConfirm.showContent()
        }, 500) // Bi log bug lau hien button
    }
    getIcon = () => {
        return (
            <TouchableOpacityOpt
                timeDelay={Enum.TIME_DELAY}
                style={{
                    width: 32,
                    // marginLeft: 8,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'flex-start'
                }}
                onPress={() => {
                }}
            >
                <MaterialCommunityIcons name='account-search' size={22} color={'white'} />
            </TouchableOpacityOpt>
        )
        switch (this.state.typeSearchAccount) {
            case Enum.TYPE_SEARCH_ACCOUNT.SINGLE:
                // 1 account
                return null
            case Enum.TYPE_SEARCH_ACCOUNT.ABOVE_FIVE_ACCOUNT:
                // Lon hon 5 account
                return (
                    <TouchableOpacityOpt
                        timeDelay={Enum.TIME_DELAY}
                        style={{
                            width: 32,
                            // marginLeft: 8,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'flex-start'
                        }}
                        onPress={this.handleClickSelectAccount}
                    >
                        <MaterialCommunityIcons name='account-search' size={22} color={'white'} />
                    </TouchableOpacityOpt>
                )
            default:
                // 2-5 account
                return (
                    <TouchableOpacityOpt
                        timeDelay={Enum.TIME_DELAY}
                        style={{
                            width: 32,
                            // marginLeft: 8,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'flex-start'
                        }}
                        onPress={this.handleClickSelectAccount}
                    >
                        <MaterialCommunityIcons name='account-details' size={22} color={CommonStyle.fontColor} />
                    </TouchableOpacityOpt>
                )
        }
    }
    renderIcon = () => {
        return (
            <View
                renderToHardwareTextureAndroid={true}
                ref={ref => this.refChangeAccountView = ref}
            >
                {this.getIcon()}
            </View>
        )
    }
    searchAccount = (props = { onSelectedAccount: this.selectedAccountManagementGroup }) => {
        // this.refButtonConfirm && this.refButtonConfirm.hideContent()
        this.props.navigator.showModal({
            screen: 'equix.SearchAccount',
            animated: true,
            animationType: 'slide-up',
            navigatorStyle: {
                statusBarColor: CommonStyle.ColorTabNews,
                statusBarTextColorScheme: CommonStyle.statusBarTextScheme,
                navBarBackgroundColor: CommonStyle.statusBarBgColor,
                navBarButtonColor: '#fff',
                navBarHidden: true,
                navBarHideOnScroll: false,
                navBarTextFontSize: 18,
                drawUnderNavBar: true,
                navBarNoBorder: true,
                screenBackgroundColor: 'transparent',
                modalPresentationStyle: 'overCurrentContext'
            },
            passProps: {
                ...props,
                dismissForm: this.dismissForm
            }
        })
    }
    updateCurrenAccount = (funcUpdateCurrentItem) => {
        if (funcUpdateCurrentItem) {
            this.funcUpdateCurrentItem = funcUpdateCurrentItem;
        }
    }
    getMaxWidth = () => {
        return block([
            cond(eq(this.isUpdateLayout, new Value(1)), [
                set(this.maxWidth, sub(this.widthParent, this.widthId)),
                set(this.isUpdateLayout, new Value(0))
            ], [
            ]),
            this.maxWidth
        ])
    }
    renderNameAccount2 = this.renderNameAccount2.bind(this)
    renderNameAccount2({ accountName, accountId }) {
        if (!accountName || !accountId) return null
        const maxWidth = this.getMaxWidth()
        return (
            <View onLayout={(event) => {
                const width = event.nativeEvent.layout.width
                this.widthParent.setValue(width)
                // console.log('DCM widthParent', this.widthParent)
                this.isUpdateLayout.setValue(1)
            }} style={{ width: '100%', flexDirection: 'row', justifyContent: this.state.typeSearchAccount === Enum.TYPE_SEARCH_ACCOUNT.SINGLE ? 'center' : 'flex-start' }}>
                <Animated.Text

                    numberOfLines={1}
                    // onPress={this.showModalPicker}
                    style={[CommonStyle.subTitle1, { marginRight: 0, maxWidth: maxWidth }]}>
                    {accountName}
                </Animated.Text>
                <Text onLayout={(event) => {
                    const widthId = event.nativeEvent.layout.width
                    this.widthId.setValue(widthId)
                    console.log('DCM id', this.widthId)
                    this.isUpdateLayout.setValue(1)
                }} style={[CommonStyle.subTitle1]}>{` (${accountId})`}</Text>

            </View>

        )
    }
    renderNameAccount = () => {
        const nameAccount = this.getDisplayAccount(this.currentAccount)
        const { accountId, accountName } = this.getInfo(this.currentAccount)
        const maxWidth = this.getMaxWidth()
        return (
            <View onLayout={(event) => {
                const width = event.nativeEvent.layout.width
                this.widthParent.setValue(width)
                // console.log('DCM widthParent', this.widthParent)
                this.isUpdateLayout.setValue(1)
            }} style={{ width: '100%', flexDirection: 'row', justifyContent: this.state.typeSearchAccount === Enum.TYPE_SEARCH_ACCOUNT.SINGLE ? 'center' : 'flex-start' }}>
                <Animated.Text

                    numberOfLines={1}
                    // onPress={this.showModalPicker}
                    style={[CommonStyle.subTitle1, { marginRight: 0, maxWidth: maxWidth }]}>
                    {accountName}
                </Animated.Text>
                <Text onLayout={(event) => {
                    const widthId = event.nativeEvent.layout.width
                    this.widthId.setValue(widthId)
                    console.log('DCM id', this.widthId)
                    this.isUpdateLayout.setValue(1)
                }} style={[CommonStyle.subTitle1]}>{` (${accountId})`}</Text>
            </View>
        )
    }
    render() {
        return (
            <View style={{ backgroundColor: CommonStyle.backgroundColor }}>
                <TouchableOpacityOpt
                    timeDelay={Enum.TIME_DELAY}
                    onPress={() => {
                    }}
                    disabled={this.state.typeSearchAccount === Enum.TYPE_SEARCH_ACCOUNT.SINGLE}
                    hitSlop={{
                        top: 8,
                        left: 8,
                        bottom: 8,
                        right: 8
                    }}
                >
                    <View style={{ flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 8, backgroundColor: CommonStyle.backgroundColor }}>
                        <View>
                            {this.renderIcon()}
                        </View>
                        <View style={{ flex: 1, justifyContent: 'center' }}>
                            <View style={{ position: 'absolute' }}>
                                <NewOrderNavigatorV2
                                    subTitle={this.getDisplayAccount(this.currentAccount)}
                                    updateCurrentItem={this.updateCurrenAccount}
                                    navigator={Navigation}
                                    selectedAccount={this.selectedAccount}
                                    ref={ref => this.refNavigatorSearchAccount = ref} />
                            </View>
                            {this.renderNameAccount2({ accountName: this.state.accountName, accountId: this.state.accountId })}
                        </View>
                    </View>
                </TouchableOpacityOpt>
            </View>
        );
    }
}
function mapStateToProps(state) {
    return {
        order: state.order,
        isConnected: state.app.isConnected,
        setting: state.setting
    };
}

function mapDispatchToProps(dispatch) {
    return {
        // actions: bindActionCreators(newOrderActions, dispatch),
        appActions: bindActionCreators(appActions, dispatch)
        // portfolioActions: bindActionCreators(portfolioActions, dispatch)
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(SearchAccount);
