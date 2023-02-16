import React from 'react';
import { View, Text, TouchableOpacity, ListView } from 'react-native';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/Ionicons'
import { func, dataStorage } from '../../storage';
import { connect } from 'react-redux';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import XComponent from '../../component/xComponent/xComponent'
import * as Util from '../../util'
import * as Business from '../../business'
import Enum from '../../enum'
import config from '../../config';
import * as ManageNavigation from '../../manage_navigation'
import * as Controller from '../../memory/controller'
import NetworkWarning from '../../component/network_warning/network_warning';
import I18n from '../../modules/language'
import * as RoleUser from '../../roleUser';
import TouchableOpacityOpt from '../../component/touchableOpacityOpt';

const TYPE_PRICEBOARD = Enum.TYPE_PRICEBOARD
const SCREEN = Enum.SCREEN
const NAVIGATION_TYPE = Enum.NAVIGATION_TYPE
const CURRENT_SCREEN = SCREEN.MANAGE_PRICEBOARD_STATIC

export class ManagePriceboardStatic extends XComponent {
    static propTypes = {
        typePriceboard: PropTypes.string
    };

    //  #region REACT AND DEFAULT FUNCTION

    init() {
        this.dic = {
            listPriceboard: this.getListPriceboard(),
            currentPriceboardId: func.getCurrentPriceboardId(),
            isSelected: false
        }

        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent);
        this.setRightButton()
    }
    //  #endregion

    //  #region NAVIGATION
    setRightButton() {
        this.props.navigator.setButtons({
            rightButtons: [{
                title: I18n.t('close'),
                id: 'close_btn'
            }],
            leftButtons: [Util.isIOS()
                ? {
                    id: 'backPress',
                    component: SCREEN.CUSTOM_BUTTON_CATEGORIES,
                    passProps: { onPress: this.onNavigatorEvent }
                }
                : { id: 'back' }]
        });
    }

    backToCategoriesScreen() {
        ManageNavigation.popAndClose(this.props.navigator, CURRENT_SCREEN, true)
    }

    onNavigatorEvent(event) {
        if (event.type === 'NavBarButtonPress') {
            switch (event.id) {
                case 'close_btn':
                    ManageNavigation.startBacking(SCREEN.TRADE)
                    ManageNavigation.popAndClose(this.props.navigator, CURRENT_SCREEN, true)
                    break;
                case 'backPress':
                    this.backToCategoriesScreen()
                    break;
                default:
                    break;
            }
        } else {
            switch (event.id) {
                case 'willAppear':
                    break;
                case 'didAppear':
                    this.dic.isSelected = false
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

    showFindWatchlistScreen() {
        const nextScreenObj = {
            screen: SCREEN.FIND_WATCHLIST,
            title: '',
            backButtonTitle: '',
            animated: true,
            animationType: 'slide-up',
            navigatorStyle: { ...CommonStyle.navigatorSpecialNoHeader, ...{ drawUnderNavBar: true } }
        }
        ManageNavigation.pushStepAndShow(this.props.navigator, nextScreenObj, NAVIGATION_TYPE.MODAL)
    }
    //  #endregion

    //  #region BUSINESS
    getListPriceboard() {
        return this.props.typePriceboard === TYPE_PRICEBOARD.US
            ? func.getAllPriceboardUs()
            : func.getAllPriceboardAu()
    }

    //  #endregion

    //  #region EVENT ELEMENT
    onCreate() {
        if (this.props.isConnected === false) return

        const nextScreenObj = Business.getObjMoveToCreateWatchlistScreen(config)
        ManageNavigation.pushStepAndShow(this.props.navigator, nextScreenObj, NAVIGATION_TYPE.MODAL)
    }

    onSelectPriceBoard(priceboardId) {
        if (this.dic.isSelected) return
        this.dic.isSelected = true

        func.setCurrentPriceboardId(priceboardId)
        ManageNavigation.startBacking(SCREEN.TRADE)
        ManageNavigation.popAndClose(this.props.navigator, CURRENT_SCREEN, true)
    }
    //  #endregion

    //  #region RENDER
    renderRow(rowData) {
        const isCurrentPriceboard = rowData.watchlist === this.dic.currentPriceboardId
        return <View
            style={{
                height: CommonStyle.heightM,
                flex: 1,
                flexDirection: 'row',
                marginHorizontal: 16,
                alignItems: 'center',
                borderBottomWidth: 1,
                borderBottomColor: CommonStyle.seperateLineColor,
                justifyContent: 'flex-end'
            }}>
            <TouchableOpacityOpt
                style={{ flex: 1, height: '100%', justifyContent: 'center' }}
                onPress={() => this.onSelectPriceBoard(rowData.watchlist)}
                timeDelay={Enum.TIME_DELAY}
                disabled={isCurrentPriceboard}>
                <Text style={{ color: isCurrentPriceboard ? CommonStyle.fontBlue : CommonStyle.fontColor }}>
                    {rowData.watchlist_name}
                </Text>
            </TouchableOpacityOpt>
            <View style={{ alignItems: 'flex-end', paddingHorizontal: 10 }}>
                {
                    isCurrentPriceboard
                        ? <Icon
                            testID={`${this.dic.currentPriceboardId}_added`}
                            name='md-checkmark'
                            style={{
                                color: CommonStyle.fontBlue,
                                fontSize: CommonStyle.fontSizeXXL,
                                width: 32,
                                marginTop: 3,
                                textAlign: 'right',
                                opacity: CommonStyle.opacity2
                            }} />
                        : <View />
                }
            </View>
        </View>
    }

    renderSearchBar() {
        return (
            <View style={CommonStyle.searchBarContainer}>
                <TouchableOpacity style={CommonStyle.searchBar}
                    onPress={this.showFindWatchlistScreen}>
                    <Icon name='ios-search' style={CommonStyle.iconSearch} />
                    <Text style={CommonStyle.searchPlaceHolder}>{I18n.t('findWatchlist')}</Text>
                </TouchableOpacity>
            </View>
        );
    }

    renderCreateRowLogedIn() {
        return (
            <View
                style={{
                    height: CommonStyle.heightM,
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderBottomWidth: 1,
                    borderBottomColor: CommonStyle.seperateLineColor,
                    marginHorizontal: 16
                }}>
                <Icon
                    name='md-add-circle'
                    style={{
                        textAlign: 'left',
                        marginTop: 3,
                        marginRight: CommonStyle.paddingSize,
                        color: this.props.isConnected
                            ? CommonStyle.addIconColor
                            : CommonStyle.fontGray,
                        fontSize: CommonStyle.iconSizeM
                    }}
                    onPress={this.onCreate}
                />
                <TouchableOpacity style={{ flex: 1 }} disabled={!this.props.isConnected} onPress={this.onCreate}>
                    <Text style={{ color: CommonStyle.fontLink }}>{I18n.t('createNewWatchList')}</Text>
                </TouchableOpacity>
            </View>
        )
    }

    renderCreateRow() {
        return Controller.getLoginStatus()
            ? this.renderCreateRowLogedIn()
            : <View />
    }

    render() {
        const listItem = this.dic.listPriceboard || []
        const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        const dataSource = ds.cloneWithRows(listItem || []);

        return (
            <View style={{ flex: 1, backgroundColor: CommonStyle.backgroundColor, paddingTop: Util.isAndroid() ? 55 : 0 }}>
                {this.renderSearchBar()}
                {this.props.isConnected ? <View /> : <NetworkWarning />}
                {RoleUser.checkRoleByKey(Enum.ROLE_DETAIL.C_E_R_WATCHLIST) ? this.renderCreateRow() : <View />}
                {
                    Util.arrayHasItem(this.dic.listPriceboard)
                        ? <ListView
                            removeClippedSubviews={false}
                            keyboardShouldPersistTaps="always"
                            dataSource={dataSource}
                            renderRow={this.renderRow}
                        />
                        : <View />
                }
            </View>
        );
    }
    //  #endregion
}

function mapStateToProps(state) {
    return {
        isConnected: state.app.isConnected
    };
}

export default connect(mapStateToProps)(ManagePriceboardStatic);
