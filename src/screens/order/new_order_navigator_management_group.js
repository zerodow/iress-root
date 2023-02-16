import React, { Component } from 'react'
import { View, Text, Platform, Dimensions, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import { iconsMap as IconsMap } from '../../utils/AppIcons';
import { isIphoneXorAbove } from './../../lib/base/functionUtil';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Util from '../../util';
import Enum from '../../enum';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import Config from '../../config';
import I18n from '../../modules/language/';
import PickerCustom from './new_picker';
import ModalPicker from './../modal_picker/modal_picker';
import * as Emitter from '@lib/vietnam-emitter';
import CustomButton from '../../component/custom_button/custom_button_watchlist'
import * as Controller from '../../memory/controller'
import Header from '../../../src/component/headerNavBar/index';
import Icons from '../../../src/component/headerNavBar/icon';

const ICON_NAME = Enum.ICON_NAME;
const { width, height } = Dimensions.get('window');

export default class NewOrderNavigatorManagementGroup extends Component {
    //  #region DEFINE PROPERTY
    static propTypes = {
        subTitle: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        selectedAccount: PropTypes.func.isRequired
    }

    //  #endregion

    constructor(props) {
        super(props);
        this.state = { isLoadingPrice: false };
        this.searchAccount = this.searchAccount.bind(this);
        this.onSelectedAccount = this.onSelectedAccount.bind(this);
        this.updateCurrentAccount = this.updateCurrentAccount.bind(this);
        this.onLoading = this.onLoading.bind(this)
        this.onRefresh = this.onRefresh.bind(this)
        this.currentAccount = this.props.subTitle;
        this.id = Util.getRandomKey()
        this.props.updateCurrentAccount && this.props.updateCurrentAccount(this.updateCurrentAccount);
        this.subLoadingPrice()
    }

    componentWillUnmount() {
        Emitter.deleteByIdEvent(this.id)
    }

    subLoadingPrice() {
        Emitter.addListener(
            this.props.channelLoadingOrder,
            this.id,
            this.onLoading
        );
    }

    onLoading(isLoadingPrice) {
        this.setState({
            isLoadingPrice
        })
    }

    onSelectedAccount(accountInfo) {
        const { account_id: accountID, account_name: accountName } = accountInfo
        let subTitle = ''
        if (accountName) {
            subTitle = subTitle + accountName
        }
        if (accountID) {
            subTitle = subTitle + ` (${accountID})`
        }
        this.updateCurrentAccount(subTitle)
        this.props.selectedAccount && this.props.selectedAccount(accountInfo);
    }

    searchAccount() {
        const props = {
            onSelectedAccount: this.onSelectedAccount
        }
        this.props.searchAccount && this.props.searchAccount(props)
    }

    updateCurrentAccount(value) {
        this.currentAccount = value;
        this.setState({});
    }

    renderNavbarContent() {
        return (
            <View
                style={[
                    {
                        flexDirection: 'row',
                        alignItems: 'center',
                        position: 'absolute',
                        top: Platform.OS === 'ios' ? isIphoneXorAbove() ? 38 : 16 : 0,
                        right: 0,
                        bottom: 0,
                        left: 0
                    }]}>
                {this.renderBackButton()}
                {this.renderTitle()}
                {/* {this.renderRightIcon()} */}
            </View>

        );
    }

    renderDrawerIcon() {
        return <View
            testID="cancelAlertSearch"
            style={[{ marginHorizontal: 16 }]}
        >
            <TouchableOpacity
                style={{}}
                testID="AlertSearchDrawer"
                onPress={this.onClickDrawer}
            >
                <Icon color={CommonStyle.btnColor} size={30} name={'md-menu'} />
            </TouchableOpacity>
        </View>
    }

    renderBackButton() {
        return (
            <TouchableOpacity
                style={{ width: 50, height: 60, paddingLeft: 16, justifyContent: 'flex-start', marginTop: 2 }}
                onPress={this.backBtnFunc.bind(this)}
            >
                <Icon color={CommonStyle.fontColor} size={32} name={'ios-arrow-back'} />
            </TouchableOpacity>
        );
    }

    backBtnFunc() {
        this.props.isNotShowMenu ? this.props.onCancelSearch() : this.props.backToSearch();
    }

    renderTitle() {
        return (
            <View style={{ flex: 4 }}>
                <View>
                    <Text
                        style={{
                            textAlign: 'left',
                            fontSize: CommonStyle.font25,
                            fontFamily: CommonStyle.fontPoppinsBold,
                            color: CommonStyle.fontColor
                        }}>
                        {this.props.title}
                    </Text>
                </View>
                <View
                    style={{
                        alignItems: 'flex-end',
                        flexDirection: 'row'
                        // justifyContent: 'center'
                    }}>
                    {
                        <Text
                            numberOfLines={1}
                            ellipsizeMode={'middle'}
                            onPress={this.searchAccount}
                            style={[CommonStyle.subTitle1]}>
                            {`${this.currentAccount}`}
                        </Text>
                    }
                    {
                        <Icon
                            name={'ios-search'}
                            size={20}
                            color={CommonStyle.fontColor}
                            onPress={this.searchAccount}
                            style={{ opacity: 0.4 }}
                        />
                    }
                </View>
            </View>
        );
    }

    onRefresh() {
        this.props.c2r && this.props.c2r()
    }

    renderRightIcon() {
        const isStreaming = Controller.isPriceStreaming()
        return isStreaming
            ? <View style={{ width: 48 }} />
            : <View
                style={[{ width: 48, marginRight: 16, alignItems: 'flex-end' }]}
            >
                {
                    this.state.isLoadingPrice
                        ? <CustomButton
                            style={{ paddingVertical: 6, alignItems: 'center', justifyContent: 'center' }}
                            iconStyle={{ height: 32, width: 32, right: -14 }} />
                        : <TouchableOpacity
                            style={{}}
                            testID="OrderSearchC2R"
                            onPress={this.onRefresh}
                        >
                            <Icon
                                color={CommonStyle.btnColor}
                                size={30}
                                name={'ios-refresh'} />
                        </TouchableOpacity>
                }
            </View>
    }

    render() {
        return (<View style={{ flex: 1 }}>
            <View style={[
                {
                    flex: 1,
                    flexDirection: 'row',
                    marginTop: Platform.OS === 'ios' ? CommonStyle.marginSize - 4 : 0,
                    alignItems: 'center',
                    paddingLeft: CommonStyle.paddingDistance2,
                    backgroundColor: CommonStyle.fontNearAlabaster,
                    shadowColor: 'rgba(76,0,0,0)',
                    shadowOffset: {
                        width: 0,
                        height: 0.5
                    }
                },
                {
                    paddingTop: Platform.OS === 'ios'
                        ? isIphoneXorAbove()
                            ? 38
                            : 16
                        : 0,
                    height: isIphoneXorAbove()
                        ? 48 + 52
                        : 48 + 32,
                    marginTop: 0,
                    backgroundColor: CommonStyle.ColorTabNews,
                    borderBottomRightRadius: CommonStyle.borderBottomRightRadius
                }]}>
                {this.renderNavbarContent()}
            </View>
        </View>
        );
    }
}
