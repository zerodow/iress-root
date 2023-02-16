import React from 'react';
import { View, Text, TextInput, KeyboardAvoidingView } from 'react-native';
import { connect } from 'react-redux';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import XComponent from '../../component/xComponent/xComponent'
import NotifyOrder from '../../component/notify_order/index'
import * as Business from '../../business'
import * as Util from '../../util'
import { dataStorage, func } from '../../storage'
import config from '../../config';
import Enum from '../../enum';
import * as ManageNavigation from '../../manage_navigation'
import I18n from '../../modules/language';
import { iconsMap as IconsMap } from '../../utils/AppIcons';
import NetworkWarning from '../../component/network_warning/network_warning'

const SCREEN = Enum.SCREEN
const NAVIGATION_TYPE = Enum.NAVIGATION_TYPE
const ANIMATED_TYPE = Enum.ANIMATED_TYPE
const CURRENT_SCREEN = SCREEN.CREATE_PRICEBOARD

export class CreatePriceboard extends XComponent {
    //  #region REACT AND DEFAULT FUNCTION
    bindAllFunc() {
        this.setLeftButton = this.setLeftButton.bind(this)
        this.setRightButton = this.setRightButton.bind(this)
        this.onChangeText = this.onChangeText.bind(this)
        this.onNavigatorEvent = this.onNavigatorEvent.bind(this)
        this.createPriceboard = this.createPriceboard.bind(this)
        this.moveToAddcodeScreen = this.moveToAddcodeScreen.bind(this)
    }

    init() {
        this.dic = {
            errorInputPriceName: null,
            watchlistName: '',
            created: false
        }

        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent);
        this.setLeftButton()
        this.setRightButton()
    }

    //  #endregion

    //  #region NAVIGATION
    onNavigatorEvent(event) {
        if (event.type === 'NavBarButtonPress') {
            switch (event.id) {
                case 'next-btn':
                    this.createPriceboard()
                    break;
                case 'backPress':
                case 'back':
                    ManageNavigation.popAndClose(this.props.navigator, CURRENT_SCREEN, true, ANIMATED_TYPE.SLIDE_DOWN)
                    break;
                default:
                    break;
            }
        } else {
            switch (event.id) {
                case 'willAppear':
                    break;
                case 'didAppear':
                    ManageNavigation.checkIsBacking() && ManageNavigation.popAndClose(this.props.navigator, CURRENT_SCREEN)
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

    setLeftButton() {
        this.props.navigator.setButtons({
            leftButtons: [{
                id: 'back',
                icon: Util.isIOS()
                    ? IconsMap['ios-arrow-back']
                    : IconsMap['md-arrow-back']
            }]
        });
    }

    setRightButton() {
        this.props.navigator.setButtons({
            rightButtons: [{
                title: I18n.t('next'),
                id: 'next-btn',
                disabled: this.dic.errorInputPriceName !== '',
                disabledColor: '#bbb'
            }]
        });
    }

    moveToAddcodeScreen(priceBoardDetail) {
        const nextScreenObj = {
            screen: SCREEN.ADDCODE,
            title: I18n.t('editWatchList'),
            backButtonTitle: ' ',
            animationType: ANIMATED_TYPE.SLIDE_UP,
            overrideBackPress: true,
            passProps: {
                priceBoardName: priceBoardDetail.watchlist_name,
                priceBoardId: priceBoardDetail.watchlist,
                isConnected: this.props.isConnected
            },
            navigatorButtons: {
                leftButtons: [
                    {
                        testID: 'buttonCalcelWatchListAddCode',
                        title: 'Cancel',
                        id: 'cancel'
                    }
                ]
            },
            navigatorStyle: { ...CommonStyle.navigatorSpecial, drawUnderNavBar: true }
        }
        ManageNavigation.pushStepAndShow(this.props.navigator, nextScreenObj, NAVIGATION_TYPE.MODAL)
    }
    //  #endregion

    //  #region BUSINESS
    createPriceboard() {
        if (this.dic.created || this.dic.errorInputPriceName !== '') return
        this.dic.created = true
        const newPriceboard = {
            user_id: dataStorage.user_id,
            watchlist_name: this.dic.watchlistName,
            value: [],
            watchlist: Util.getRandomKey()
        }
        Business.createUserPriceboard(dataStorage.user_id, newPriceboard)
            .then(data => {
                func.setCurrentPriceboardId(data.watchlist)
                this.moveToAddcodeScreen(data)
            })
            .catch()
    }
    //  #endregion

    //  #region EVENT ELEMENT
    onChangeText(text = '') {
        const newText = text.trim()
        this.dic.errorInputPriceName = ''

        if (!newText) {
            this.dic.errorInputPriceName = I18n.t('watchlistRequiredWarning')
        }

        const listPriceboard = func.getAllPersonalPriceboard()
        const itemDuplicateName = listPriceboard.find(item => item.watchlist_name && item.watchlist_name.toUpperCase() === newText.toUpperCase() && item.watchlist !== this.props.priceBoardId)
        if (itemDuplicateName) {
            this.dic.errorInputPriceName = I18n.t('watchlistUniqueWarning')
        }

        this.setRightButton()
        if (this.dic.errorInputPriceName === '') this.dic.watchlistName = newText
        this.setState()
    }
    //  #endregion

    //  #region RENDER
    render() {
        const SwapComponent = Util.isIOS() ? KeyboardAvoidingView : View
        const props = Util.isIOS() ? { behavior: 'padding' } : {}
        return (
            <SwapComponent style={{ flex: 1, backgroundColor: CommonStyle.backgroundColor, paddingTop: Util.isAndroid() ? 55 : 0 }} {...props}>
                {this.props.isConnected ? <View /> : <NetworkWarning />}
                {
                    this.dic.errorInputPriceName
                        ? (<NotifyOrder type={'error'} text={this.dic.errorInputPriceName} />)
                        : (<View></View>)
                }
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text
                        style={CommonStyle.textMainNormal}>{I18n.t('createWatchlistDesc')}</Text>
                    <TextInput
                        keyboardType={'default'}
                        autoFocus={true}
                        placeholder={I18n.t('createWatchlistPlaceholder')}
                        placeholderTextColor={CommonStyle.fontGray2}
                        style={{ width: '75%', fontSize: CommonStyle.font25, borderWidth: 0, marginHorizontal: 48, textAlign: 'center', color: CommonStyle.fontColor }}
                        onChangeText={this.onChangeText}
                        maxLength={100}
                    />
                </View>
            </SwapComponent>
        );
    }
    //  #endregion
}

function mapStateToProps(state) {
    return {
        isConnected: state.app.isConnected
    };
}

export default connect(mapStateToProps)(CreatePriceboard);
