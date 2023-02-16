import React from 'react';
import { View, Text, TouchableOpacity, ListView, TouchableWithoutFeedback, Animated, Dimensions } from 'react-native';
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
import * as StreamingBusiness from '../../streaming/streaming_business';
import * as Channel from '../../streaming/channel';
import config from '../../config';
import * as ManageNavigation from '../../manage_navigation'
import NetworkWarning from '../../component/network_warning/network_warning'
import I18n from '../../modules/language'
import * as RoleUser from '../../roleUser';

const { width } = Dimensions.get('window');
const PRICE_LIST_TAB_LABEL = Enum.PRICE_LIST_TAB_LABEL
const SCREEN = Enum.SCREEN
const CURRENT_SCREEN = SCREEN.MANAGE_PRICEBOARD_PERSONAL
const NAVIGATION_TYPE = Enum.NAVIGATION_TYPE
const ANIMATED_TYPE = Enum.ANIMATED_TYPE
const MARGIN_LEFT = 16
const WIDTH_BUTTON_CHECK_MARK = 80
const WIDTH_ICON = 40
const WIDTH_TEXT = width - WIDTH_ICON - MARGIN_LEFT
const WIDTH_TEXT_CHECK_MARK = WIDTH_TEXT - WIDTH_BUTTON_CHECK_MARK

export class RowComponent extends XComponent {
    static propTypes = {
        priceboardDetail: PropTypes.object.isRequired,
        channelChildChangeExpandStatus: PropTypes.string,
        onSelectPriceBoard: PropTypes.func,
        isConnected: PropTypes.bool.isRequired
    };

    //  #region REACT AND DEFAULT FUNCTION
    bindAllFunc() {
        this.subChildChangeExpandStatus = this.subChildChangeExpandStatus.bind(this)
        this.pubChildChangeExpandStatus = this.pubChildChangeExpandStatus.bind(this)
        this.onDelete = this.onDelete.bind(this)
        this.confirmDeletePriceboard = this.confirmDeletePriceboard.bind(this)
        this.clickOutSideDeleteIcon = this.clickOutSideDeleteIcon.bind(this)
        this.preRender = this.preRender.bind(this)
    }

    init() {
        this.dic = {
            ROLE: RoleUser.checkRoleByKey(Enum.ROLE_DETAIL.C_E_R_WATCHLIST),
            isFavorites: this.props.priceboardDetail.watchlist_name.toUpperCase() === PRICE_LIST_TAB_LABEL.personal,
            widthDeleteButton: new Animated.Value(0),
            animatedDeleteButton: null,
            currentPriceBoardId: func.getCurrentPriceboardId()
        }
        this.state = {
            isDeleting: false
        }
    }

    componentDidMount() {
        super.componentDidMount()
        this.subChildChangeExpandStatus()
    }

    preRender(obj, cb) {
        this.setState(obj, () => {
            cb && cb()
            this.dic.animatedDeleteButton && this.dic.animatedDeleteButton.stop()
            this.dic.animatedDeleteButton = Animated.timing(this.dic.widthDeleteButton, {
                toValue: this.state.isDeleting ? 80 : 0,
                duration: 200
            });
            this.dic.animatedDeleteButton.start()
        })
    }
    //  #endregion

    //  #region SUBCRIBER
    subChildChangeExpandStatus() {
        this.props.channelChildChangeExpandStatus &&
            Emitter.addListener(this.props.channelChildChangeExpandStatus, this.id, index => {
                if (index === this.props.index || !this.state.isDeleting) return
                this.preRender({ isDeleting: false })
            })
    }
    //  #endregion

    //  #region PUBLISHER
    pubChildChangeExpandStatus() {
        Emitter.emit(this.props.channelChildChangeExpandStatus, this.props.index)
    }
    //  #endregion

    //  #region BUSINESS
    //  #endregion

    //  #region EVENT ELEMENT
    onDelete() {
        if (this.dic.isFavorites) return

        this.state.isDeleting = !this.state.isDeleting
        this.preRender()
        if (this.state.isDeleting) this.pubChildChangeExpandStatus()
    }

    confirmDeletePriceboard() {
        const priceboardId = this.props.priceboardDetail.watchlist
        Business.deletePriceboard(priceboardId, dataStorage.user_id)
        this.props.onDelete && this.props.onDelete(priceboardId)
    }

    clickOutSideDeleteIcon() {
        if (this.dic.isFavorites || !this.state.isDeleting) return
        this.state.isDeleting = !this.state.isDeleting
        this.preRender()
    }
    //  #endregion

    //  #region RENDER
    render() {
        const disabled = this.dic.isFavorites ||
            this.props.priceboardDetail.watchlist === this.dic.currentPriceBoardId ||
            !this.dic.ROLE
        const isCurrentPriceboard = this.props.priceboardDetail.watchlist === this.dic.currentPriceBoardId
        return (
            <View style={{ flexDirection: 'column' }}>
                <View
                    style={{
                        height: CommonStyle.heightM,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        marginLeft: this.state.isDeleting ? 0 : MARGIN_LEFT
                    }}>
                    <View style={{ width: 40 }}>
                        <TouchableWithoutFeedback>
                            <Icon
                                name='md-remove-circle'
                                style={{
                                    color: disabled || !this.props.isConnected || !this.dic.ROLE
                                        ? CommonStyle.fontGray
                                        : CommonStyle.addIconColorRed,
                                    fontSize: CommonStyle.iconSizeM,
                                    marginTop: 3
                                }}
                                onPress={() => {
                                    if (disabled || !this.props.isConnected || !this.dic.ROLE) return
                                    this.onDelete()
                                }} />
                        </TouchableWithoutFeedback>
                    </View>
                    <TouchableOpacity
                        style={{ justifyContent: 'center', height: '100%', width: isCurrentPriceboard ? WIDTH_TEXT_CHECK_MARK : WIDTH_TEXT }}
                        onPress={() => this.props.onSelectPriceBoard(this.props.priceboardDetail.watchlist)}
                        disabled={disabled}>
                        <Text style={{ color: isCurrentPriceboard ? CommonStyle.fontBlue : CommonStyle.fontColor }}>
                            {this.props.priceboardDetail.watchlist_name}
                        </Text>
                    </TouchableOpacity>
                    {
                        isCurrentPriceboard
                            ? <Icon
                                testID={`${this.dic.currentPriceBoardId}_added`}
                                name='md-checkmark'
                                style={{
                                    color: CommonStyle.fontBlue,
                                    fontSize: CommonStyle.fontSizeXXL,
                                    width: WIDTH_BUTTON_CHECK_MARK,
                                    marginTop: 3,
                                    paddingRight: 10,
                                    textAlign: 'right',
                                    opacity: CommonStyle.opacity2
                                }} />
                            : <TouchableOpacity
                                onPress={this.confirmDeletePriceboard}
                                disabled={!this.props.isConnected || !this.dic.ROLE}>
                                <Animated.View
                                    style={{
                                        backgroundColor: (this.props.isConnected && this.dic.ROLE)
                                            ? CommonStyle.addIconColorRed
                                            : CommonStyle.fontGray,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        height: CommonStyle.heightM,
                                        width: this.dic.widthDeleteButton
                                    }}>
                                    <Text style={{ color: CommonStyle.fontWhite }}>{'Delete'}</Text>
                                </Animated.View>
                            </TouchableOpacity>
                    }
                </View>
                <View style={{
                    borderBottomWidth: 1,
                    borderBottomColor: CommonStyle.fontBorderGray,
                    marginHorizontal: 16
                }}></View>
            </View >
        );
    }
    //  #endregion
}

export class ManagePriceboard extends XComponent {
    //  #region REACT AND DEFAULT FUNCTION
    bindAllFunc() {
        this.renderRow = this.renderRow.bind(this)
        this.onCreate = this.onCreate.bind(this)
        this.showFindWatchlistScreen = this.showFindWatchlistScreen.bind(this)
        this.onNavigatorEvent = this.onNavigatorEvent.bind(this)
        this.onSelectPriceBoard = this.onSelectPriceBoard.bind(this)
        this.setRightButton = this.setRightButton.bind(this)
        this.backToCategoriesScreen = this.backToCategoriesScreen.bind(this)
        this.onClickOutSideAllRow = this.onClickOutSideAllRow.bind(this)
        this.subChannelSelectedPriceboard = this.subChannelSelectedPriceboard.bind(this)
        this.subWatchlistChange = this.subWatchlistChange.bind(this)
        this.renderCreate = this.renderCreate.bind(this)
        this.renderSearchBar = this.renderSearchBar.bind(this)
    }

    init() {
        this.dic = {
            ROLE: RoleUser.checkRoleByKey(Enum.ROLE_DETAIL.C_E_R_WATCHLIST),
            channelChildChangeExpandStatus: StreamingBusiness.getChannelChildExpandStatus(this.id),
            isSelected: false
        }

        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent);
        this.setRightButton()
    }

    componentDidMount() {
        super.componentDidMount()
        this.subWatchlistChange()
        this.subChannelSelectedPriceboard()
    }
    //  #endregion

    //  #region SUBCRIBER
    subWatchlistChange() {
        const channelAdd = Channel.getChannelAddNewPriceboard()
        const channelDelete = Channel.getChannelDeleteOldPriceboard()
        const channelUpdate = Channel.getChannelUpdatePriceboard()
        const updateWatchlist = () => this.setState()
        Emitter.addListener(channelAdd, this.id, updateWatchlist)
        Emitter.addListener(channelDelete, this.id, updateWatchlist)
        Emitter.addListener(channelUpdate, this.id, updateWatchlist)
    }

    subChannelSelectedPriceboard() {
        const channelSelectedPriceboard = Channel.getChannelSelectedPriceboard()
        Emitter.addListener(channelSelectedPriceboard, this.id, () => this.setState())
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
                    passProps: {
                        onPress: this.onNavigatorEvent
                    }
                }
                : {
                    id: 'back'
                }]
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
        this.onClickOutSideAllRow()
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
    //  #endregion

    //  #region BUSINESS
    onSelectPriceBoard(priceboardId) {
        if (this.dic.isSelected) return
        this.dic.isSelected = true

        func.setCurrentPriceboardId(priceboardId)
        ManageNavigation.startBacking(SCREEN.TRADE)
        ManageNavigation.popAndClose(this.props.navigator, CURRENT_SCREEN, true)
    }

    onCreate() {
        if (!this.props.isConnected || !this.dic.ROLE) return
        const nextScreenObj = Business.getObjMoveToCreateWatchlistScreen(config)
        ManageNavigation.pushStepAndShow(this.props.navigator, nextScreenObj, NAVIGATION_TYPE.MODAL)
    }
    //  #endregion

    //  #region EVENT ELEMENT
    onClickOutSideAllRow() {
        if (!this.props.isConnected) return
        Emitter.emit(this.dic.channelChildChangeExpandStatus, -1)
    }
    //  #endregion

    //  #region RENDER
    renderCreate() {
        return (
            <View
                style={{
                    height: CommonStyle.heightM,
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderBottomWidth: 1,
                    borderBottomColor: CommonStyle.fontBorderGray,
                    marginHorizontal: MARGIN_LEFT
                }}>
                <Icon
                    name='md-add-circle'
                    style={{
                        color: (this.props.isConnected && this.dic.ROLE)
                            ? CommonStyle.fontGreen
                            : CommonStyle.fontGray,
                        fontSize: CommonStyle.iconSizeM,
                        marginTop: 3,
                        width: 40
                    }}
                    onPress={this.onCreate} />
                <TouchableOpacity
                    style={{ justifyContent: 'center', height: '100%', width: WIDTH_TEXT }}
                    onPress={this.onCreate}
                    disabled={!this.props.isConnected || !this.dic.ROLE}
                >
                    <Text style={{ color: CommonStyle.fontLink }}>
                        {I18n.t('createNewWatchList')}
                    </Text>
                </TouchableOpacity>
            </View>
        )
    }

    renderRow(rowData, section, index) {
        return (
            <View key={`${rowData.watchlist}_view`}>
                <RowComponent
                    priceboardDetail={rowData}
                    channelChildChangeExpandStatus={this.dic.channelChildChangeExpandStatus}
                    onSelectPriceBoard={this.onSelectPriceBoard}
                    isConnected={this.props.isConnected}
                    index={index}
                    disabledRemoveButton={!this.dic.ROLE}
                />
            </View>
        )
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

    render() {
        const listItem = func.getAllPersonalPriceboard() || []
        const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
        const dataSource = ds.cloneWithRows(listItem || []);
        return (
            <TouchableWithoutFeedback onPress={this.onClickOutSideAllRow} style={{ flex: 1 }}>
                <View style={{ flex: 1, backgroundColor: CommonStyle.backgroundColor, paddingTop: Util.isAndroid() ? 55 : 0 }}>
                    {this.renderSearchBar()}
                    {this.props.isConnected ? <View /> : <NetworkWarning />}
                    {this.renderCreate()}
                    {
                        Util.arrayHasItem(listItem)
                            ? <ListView
                                removeClippedSubviews={false}
                                keyboardShouldPersistTaps="always"
                                dataSource={dataSource}
                                renderRow={this.renderRow}
                            />
                            : <View />
                    }
                </View>
            </TouchableWithoutFeedback>
        );
    }
    //  #endregion
}

function mapStateToProps(state) {
    return {
        isConnected: state.app.isConnected
    };
}

export default connect(mapStateToProps)(ManagePriceboard);
