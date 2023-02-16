import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import PropTypes from 'prop-types';
import * as Emitter from '@lib/vietnam-emitter';
import Icon from 'react-native-vector-icons/Ionicons'
import { func, dataStorage } from '../../storage';
import { connect } from 'react-redux';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import XComponent from '../../component/xComponent/xComponent'
import * as Util from '../../util'
import Enum from '../../enum'
import * as Business from '../../business'
import * as Channel from '../../streaming/channel'
import config from '../../config';
import * as ManageNavigation from '../../manage_navigation'
import * as Controller from '../../memory/controller'
import I18n from '../../modules/language'
import NetworkWarning from '../../component/network_warning/network_warning';
import * as RoleUser from '../../roleUser';
import TouchableOpacityOpt from '../../component/touchableOpacityOpt';
import SearchBar from '~/component/search_bar/search_bar'
const { width } = Dimensions.get('window');
const SCREEN = Enum.SCREEN
const NAVIGATION_TYPE = Enum.NAVIGATION_TYPE
const ANIMATED_TYPE = Enum.ANIMATED_TYPE
const CURRENT_SCREEN = SCREEN.MANAGE_PRICEBOARD
const TYPE_PRICEBOARD = Enum.TYPE_PRICEBOARD
const ROLE = RoleUser.checkRoleByKey(Enum.ROLE_DETAIL.C_E_R_WATCHLIST)
// const ROLE = false;
export class ManagePriceboard extends XComponent {
    //  #region REACT AND DEFAULT FUNCTION
    bindAllFunc() {
        this.onCreate = this.onCreate.bind(this)
        this.renderCreateRow = this.renderCreateRow.bind(this)
        this.renderFavourites = this.renderFavourites.bind(this)
        this.onSelectFavorites = this.onSelectFavorites.bind(this)
        this.renderNormalRow = this.renderNormalRow.bind(this)
        this.showFindWatchlistScreen = this.showFindWatchlistScreen.bind(this)
        this.setRightButton = this.setRightButton.bind(this)
        this.onNavigatorEvent = this.onNavigatorEvent.bind(this)
        this.showPriceboard = this.showPriceboard.bind(this)
        this.showPriceboardStatic = this.showPriceboardStatic.bind(this)
        this.showPriceboardPersonal = this.showPriceboardPersonal.bind(this)
        this.subChannelSelectedPriceboard = this.subChannelSelectedPriceboard.bind(this)
    }

    init() {
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent);
        this.setRightButton()

        this.dic = {
            isFirst: true
        }
    }

    componentDidMount() {
        super.componentDidMount()

        this.subChannelSelectedPriceboard()
    }
    //  #endregion

    //  #region SUBCRIBER
    subChannelSelectedPriceboard() {
        const channelSelectedPriceboard = Channel.getChannelSelectedPriceboard()
        Emitter.addListener(channelSelectedPriceboard, this.id, () => this.setState())
    }
    //  #endregion

    //  #region NAVIGATION
    showPriceboardStatic(type) {
        const subtitle = type === TYPE_PRICEBOARD.AU
            ? I18n.t('australiaMarket')
            : I18n.t('unitedStatesMarket')

        const nextScreenObj = {
            screen: SCREEN.MANAGE_PRICEBOARD_STATIC,
            title: I18n.t('WatchListTitle'),
            subtitle,
            backButtonTitle: '',
            animated: true,
            animationType: ANIMATED_TYPE.SLIDE_HORIZONTAL,
            overrideBackPress: true,
            navigatorStyle: { ...CommonStyle.navigatorSpecial, ...{ drawUnderNavBar: true } },
            passProps: { typePriceboard: type }
        }
        ManageNavigation.pushStepAndShow(this.props.navigator, nextScreenObj, NAVIGATION_TYPE.SCREEN)
    }

    showPriceboardPersonal() {
        const nextScreenObj = {
            screen: SCREEN.MANAGE_PRICEBOARD_PERSONAL,
            title: I18n.t('WatchListTitle'),
            subtitle: I18n.t('yourWatchlist'),
            backButtonTitle: ' ',
            animated: true,
            animationType: ANIMATED_TYPE.SLIDE_HORIZONTAL,
            overrideBackPress: true,
            navigatorStyle: { ...CommonStyle.navigatorSpecial, ...{ drawUnderNavBar: true } }
        }
        ManageNavigation.pushStepAndShow(this.props.navigator, nextScreenObj, NAVIGATION_TYPE.SCREEN)
    }

    showPriceboard(typePriceboard = func.getTypeOfCurrentPriceboard()) {
        switch (typePriceboard) {
            case TYPE_PRICEBOARD.AU:
            case TYPE_PRICEBOARD.US:
                this.showPriceboardStatic(typePriceboard)
                break;
            case TYPE_PRICEBOARD.PERSONAL:
                this.showPriceboardPersonal()
                break;
            default:
                break;
        }
    }

    setRightButton() {
        this.props.navigator.setButtons({
            rightButtons: [{
                title: I18n.t('close'),
                id: 'close_btn'
            }]
        });
    }

    showFindWatchlistScreen() {
        const nextScreenObj = {
            screen: SCREEN.FIND_WATCHLIST,
            title: '',
            backButtonTitle: '',
            animated: true,
            animationType: ANIMATED_TYPE.SLIDE_UP,
            navigatorStyle: { ...CommonStyle.navigatorSpecialNoHeader, ...{ drawUnderNavBar: true } }
        }
        ManageNavigation.pushStepAndShow(this.props.navigator, nextScreenObj, NAVIGATION_TYPE.MODAL)
    }

    onNavigatorEvent(event) {
        if (event.type === 'NavBarButtonPress') {
            switch (event.id) {
                case 'close_btn':
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
                    if (this.dic.isFirst) {
                        this.dic.isFirst = false
                        this.showPriceboard()
                    }
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
    //  #endregion

    //  #region EVENT ELEMENT
    onCreate() {
        if (this.props.isConnected === false || !ROLE) return

        const nextScreenObj = Business.getObjMoveToCreateWatchlistScreen(config)
        ManageNavigation.pushStepAndShow(this.props.navigator, nextScreenObj, NAVIGATION_TYPE.MODAL)
    }

    onSelectFavorites() {
        const priceboardDetail = func.getFavoritesPriceboard()
        if (!priceboardDetail) return

        func.setCurrentPriceboardId(priceboardDetail.watchlist)

        ManageNavigation.startBacking(SCREEN.TRADE)
        ManageNavigation.popAndClose(this.props.navigator, CURRENT_SCREEN, true)
    }
    //  #endregion

    //  #region RENDER
    renderCreateRow() {
        return (
            <View
                style={{
                    height: CommonStyle.heightM,
                    width: '100%',
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderBottomWidth: 1,
                    borderBottomColor: CommonStyle.fontBorderGray
                }}>
                <Icon
                    name='md-add-circle'
                    style={{
                        textAlign: 'left',
                        marginTop: 3,
                        marginRight: CommonStyle.paddingSize,
                        color: (this.props.isConnected && ROLE)
                            ? CommonStyle.fontGreen
                            : CommonStyle.fontGray,
                        fontSize: CommonStyle.iconSizeM
                    }}
                    onPress={this.onCreate}
                />
                <TouchableOpacity style={{ flex: 1, paddingVertical: 8 }} disabled={!this.props.isConnected} onPress={this.onCreate}>
                    <Text style={{ color: CommonStyle.fontLink }}>{I18n.t('createNewWatchList')}</Text>
                </TouchableOpacity>
            </View>
        )
    }

    renderFavourites() {
        const isFavorites = func.getTypeOfCurrentPriceboard() === TYPE_PRICEBOARD.FAVORITES
        return (
            <View
                style={{
                    height: CommonStyle.heightM,
                    width: '100%',
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderBottomWidth: 1,
                    borderBottomColor: CommonStyle.fontBorderGray
                }}>
                <TouchableOpacity
                    style={{ width: width - 16 - 32 - 30, height: '100%', justifyContent: 'center' }}
                    onPress={this.onSelectFavorites}
                    disabled={isFavorites}>
                    <Text
                        style={{
                            color: isFavorites
                                ? CommonStyle.fontBlue
                                : CommonStyle.fontColor
                        }}>
                        {I18n.t('favorites')}
                    </Text>
                </TouchableOpacity>
                {
                    isFavorites
                        ? <Icon
                            name={'md-checkmark'}
                            style={{
                                color: CommonStyle.fontBlue,
                                fontSize: CommonStyle.fontSizeXXL,
                                width: 32,
                                marginHorizontal: 15,
                                textAlign: 'right',
                                opacity: CommonStyle.opacity2
                            }} />
                        : <View />
                }
            </View>
        )
    }

    renderNormalRow(type, txt) {
        const isSelected = func.getTypeOfCurrentPriceboard() === type
        return (
            <View
                style={{
                    height: CommonStyle.heightM,
                    width: '100%',
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderBottomWidth: 1,
                    borderBottomColor: CommonStyle.fontBorderGray
                }}>
                <TouchableOpacityOpt
                    style={{ width: width - 16 - 32 - 30, height: '100%', justifyContent: 'center' }}
                    timeDelay={Enum.TIME_DELAY}
                    onPress={() => this.showPriceboard(type)}>
                    <Text
                        style={{
                            color: isSelected
                                ? CommonStyle.fontBlue
                                : CommonStyle.fontColor
                        }}>{txt}</Text>
                </TouchableOpacityOpt>
                <Icon
                    name={Util.isIOS() ? 'ios-arrow-forward' : 'md-arrow-forward'}
                    onPress={() => this.showPriceboard(type)}
                    style={{
                        color: isSelected
                            ? CommonStyle.fontBlue
                            : CommonStyle.fontColor,
                        fontSize: CommonStyle.fontSizeXXL,
                        width: 32,
                        marginHorizontal: 15,
                        textAlign: 'right',
                        opacity: CommonStyle.opacity2
                    }} />
            </View>
        )
    }

    renderSearchBar() {
        return (
            <SearchBar onShowModalSearch={this.showFindWatchlistScreen} title={I18n.t('findWatchlist')} />
        );
    }

    render() {
        return (
            <View style={{ flex: 1, backgroundColor: CommonStyle.backgroundColor, paddingTop: Util.isAndroid() ? 55 : 0 }}>
                {this.renderSearchBar()}
                {this.props.isConnected ? <View /> : <NetworkWarning />}
                <View style={{ flex: 1, paddingHorizontal: 16 }}>
                    {Controller.getLoginStatus() ? this.renderCreateRow() : <View />}
                    {Controller.getLoginStatus() ? this.renderFavourites() : <View />}
                    {Controller.getLoginStatus()
                        ? this.renderNormalRow(TYPE_PRICEBOARD.PERSONAL, I18n.t('yourWatchlist'))
                        : <View />
                    }
                    {this.renderNormalRow(TYPE_PRICEBOARD.AU, I18n.t('australiaMarket'))}
                    {this.renderNormalRow(TYPE_PRICEBOARD.US, I18n.t('unitedStatesMarket'))}
                </View>
            </View>
        )
    }
    //  #endregion
}

function mapStateToProps(state) {
    return {
        isConnected: state.app.isConnected
    };
}

export default connect(mapStateToProps)(ManagePriceboard);
