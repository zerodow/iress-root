import React, { Component } from 'react'
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    Dimensions,
    Keyboard,
    Platform
} from 'react-native'
import config from '../../config'
import { dataStorage, func } from '../../storage'
import { List, ListItem, Icon } from 'react-native-elements';
import Ionicons from 'react-native-vector-icons/Ionicons';
import deviceModel from '../../constants/device_model';
import * as Util from '../../util';
import I18n from '../../modules/language/index'
import * as InvertTranslate from '../../invert_translate'
import Enum from '../../enum'
import CommonStyle, { register } from '~/theme/theme_controller'

const { LIST_FILTER_ACTION } = Enum

export default class BusinessLogFilterAction extends Component {
    constructor(props) {
        super(props)
        this.listItem = this.props.listItem || [];
        this.state = {
            selectedItem: this.props.selectedItem
        }
        this.mapData = this.mapData.bind(this)
        this.selectItem = this.selectItem.bind(this)
        this.checkHideChevron = this.checkHideChevron.bind(this)
    }

    checkHideChevron(selectedItem, value) {
        const enValue = InvertTranslate.translateCustomLang(value)
        if (selectedItem.toLowerCase() === enValue.toLowerCase()) {
            return true
        }
        return false
    }

    selectItem(value) {
        const enValue = InvertTranslate.translateCustomLang(value)
        let action = 'all';
        switch (enValue) {
            case LIST_FILTER_ACTION.signInSignOut:
                action = 'sign'
                break;
            case LIST_FILTER_ACTION.enterPin:
                action = 'enter_pin'
                break;
            case LIST_FILTER_ACTION.updateWatchList:
                action = 'symbol'
                break;
            case LIST_FILTER_ACTION.placeOrder:
                action = 'place_order'
                break;
            case LIST_FILTER_ACTION.modifyOrder:
                action = 'modify_order'
                break;
            case LIST_FILTER_ACTION.cancelOrder:
                action = 'cancel_order'
                break;
            case LIST_FILTER_ACTION.queryReport:
                action = 'query'
                break;
            case LIST_FILTER_ACTION.updateSetting:
                action = 'update_setting'
                break;
            case LIST_FILTER_ACTION.updateSCM:
                action = 'saxo'
                break;
            case LIST_FILTER_ACTION.changeNewsSource:
                action = 'change_news_source'
                break;
            case LIST_FILTER_ACTION.changeStatus:
                action = 'change_status'
                break;
            case LIST_FILTER_ACTION.changeao:
                action = 'change_AO'
                break;
            case LIST_FILTER_ACTION.resetPasswordLower:
                action = 'reset_password'
                break;
            case LIST_FILTER_ACTION.forgotPasswordLower:
                action = 'forgot_password'
                break;
            case LIST_FILTER_ACTION.createUser:
                action = 'create_user'
                break;
            case LIST_FILTER_ACTION.updateUser:
                action = 'update_user'
                break;
            case LIST_FILTER_ACTION.createRoleGroup:
                action = 'create_role_group'
                break;
            case LIST_FILTER_ACTION.updateRoleGroup:
                action = 'update_role_group'
                break;
            case LIST_FILTER_ACTION.deleteRoleGroup:
                action = 'delete_role_group'
                break;
            case LIST_FILTER_ACTION.changeMarketData:
                action = 'change_market_data'
                break;
            case LIST_FILTER_ACTION.updateVettingRule:
                action = 'update_vetting_rule'
                break;
            default:
                action = 'all'
                break;
        }
        this.props.onSelected && this.props.onSelected(action);
        this.setState({
            selectedItem: enValue
        })
    }

    mapData() {
        const listData = [];
        this.listItem.map((e, i) => {
            const obj = {};
            obj.value = (typeof e !== 'string') ? e : e.toString();
            obj.onPress = this.selectItem.bind(this, e);
            listData.push(obj);
        });
        this.setState({ listData })
    }

    componentDidMount() {
        this.mapData();
    }

    componentDidUpdate() {
        if (this.state.scrollTo > -1) {
            setTimeout(() => {
                if (this.state.visible) {
                    this.flatlist && this.flatlist.scrollToIndex && this.flatlist.scrollToIndex({ index: this.state.scrollTo })
                }
            }, 1000)
        }
    }

    render() {
        return (
            <View style={{ backgroundColor: CommonStyle.backgroundColor, flex: 1 }}>
                <List containerStyle={{ borderTopWidth: 0, flex: 1, backgroundColor: CommonStyle.backgroundColor, marginTop: 0 }}>
                    <FlatList
                        ref={(ref) => this.flatlist = ref}
                        data={this.state.listData}
                        extraData={this.state.selectedItem}
                        renderItem={({ item, i }) => (
                            <TouchableOpacity
                                style={{ paddingHorizontal: 16 }}
                                onPress={() => this.setState({ scrollTo: -1 }, item.onPress)}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 52 }}>
                                    <Text style={{ color: this.checkHideChevron(this.state.selectedItem, item.value) ? CommonStyle.fontBlue : CommonStyle.fontColor }}>{item.value}</Text>
                                    {
                                        this.checkHideChevron(this.state.selectedItem, item.value) ? <Ionicons size={24} name='md-checkmark' color= {CommonStyle.fontBlue} /> : null
                                    }
                                </View>
                                <View style={{ height: 1, backgroundColor: CommonStyle.fontBorderGray }}></View>
                            </TouchableOpacity>
                        )}
                        keyExtractor={this._keyExtractor}
                    />
                </List>
            </View>
        )
    }
}
