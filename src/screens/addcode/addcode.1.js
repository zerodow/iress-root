import React from 'react';
import { View, Text, TouchableOpacity, Dimensions, StatusBar } from 'react-native';
import PropTypes from 'prop-types';
import * as Emitter from '@lib/vietnam-emitter';
import Icon from 'react-native-vector-icons/Ionicons'
import { func, dataStorage } from '../../storage';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { logAndReport, logDevice, getDisplayName, checkTradingHalt } from '../../lib/base/functionUtil';
import * as addCodeActions from './addcode.actions';
import styles from './style/addcode';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import config from '../../config';
import SortableListView from 'react-native-sortable-listview';
import I18n from '../../modules/language';
import NetworkWarning from '../../component/network_warning/network_warning';
import XComponent from '../../component/xComponent/xComponent'
import HighlightInput from '../../component/highlight_input/highlight_input'
import Flag from '../../component/flags/flag';
import * as Business from '../../business';
import * as Util from '../../util'
import Enum from '../../enum'
import * as StreamingBusiness from '../../streaming/streaming_business';
import * as Channel from '../../streaming/channel';
import NotifyOrder from '../../component/notify_order/index';
import * as ManageNavigation from '../../manage_navigation'
import { iconsMap as IconsMap } from '../../utils/AppIcons';
import SearchBar from '~/component/search_bar/search_bar'
const SCREEN = Enum.SCREEN
const NAVIGATION_TYPE = Enum.NAVIGATION_TYPE
const ANIMATED_TYPE = Enum.ANIMATED_TYPE
const CURRENT_SCREEN = SCREEN.ADDCODE
const { width: WIDTH_SCREEN } = Dimensions.get('window')

export class RowComponent extends XComponent {
    //  #region REACT AND DEFAULT FUNCTION
    bindAllFunc() {
        this.subHalt = this.subHalt.bind(this)
    }

    init() {
        this.state = {
            tradingHalt: false
        }
    }

    componentDidMount() {
        super.componentDidMount()
        this.subHalt()

        const data = this.props.data || {}
        const symbol = data.symbol || ''
        // Check trading halt
        checkTradingHalt(symbol)
            .then(tradingHalt => {
                tradingHalt && this.setState({ tradingHalt });
            })
            .catch(err => {
                console.log(`CHECK TRADING HALT ${symbol} ERROR: `, `${err}`)
                logDevice('error', `CHECK TRADING HALT ${symbol} ERROR: ${err}`)
            });
    }
    //  #endregion

    //  #region BUSINESS
    subHalt() {
        if (!this.props.data || !this.props.data.symbol) return
        const channel = StreamingBusiness.getChannelHalt(this.props.data.symbol);
        Emitter.addListener(channel, this.id, () => {
            if (!this.isMount) return;
            checkTradingHalt(this.props.data.symbol).then(snap => {
                let tradingHalt = snap && snap.trading_halt ? snap.trading_halt : false;
                this.setState({ tradingHalt });
            });
        });
    }
    //  #endregion

    //  #region RENDER
    render() {
        const rowData = this.props.data || {};
        const symbol = rowData.symbol || '';
        const flagIcon = Business.getFlag(symbol)
        const section = func.getSymbolObj(symbol);
        if (!section.code) return null;
        const { display_name: displayName } = section;
        const securityName = section.company_name || section.company || section.security_name
        return (
            <View testID={`AddCodeWL${symbol}`} style={CommonStyle.rowContainer}>
                <Icon testID={`removeCodeWatchList_${symbol}`} name='md-remove-circle' style={styles.iconLeft}
                    onPress={() => this.props.onDeleteCode(symbol)}
                />
                <View style={{ width: '80%' }}>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={{ flex: 1, flexDirection: 'row' }}>
                            <Text style={[CommonStyle.textMainRed]}>{this.state.tradingHalt ? '! ' : ''}</Text>
                            <Text style={CommonStyle.codeStyle}>{displayName}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Flag type={'flat'} code={flagIcon} size={18} />
                        </View>
                    </View>
                    <Text style={CommonStyle.companyStyle}>{`${securityName}`}</Text>
                </View>
                <Icon testID={`changePositionCodeWatchList_${symbol}`} name='md-menu' delayLongPress={500} {...this.props.sortHandlers} style={[styles.iconRight, { color: CommonStyle.fontColor }]} />
            </View>
        );
    }
    //  #endregion
}

export class AddCode extends XComponent {
    static propTypes = {
        priceBoardName: PropTypes.string.isRequired,
        priceBoardId: PropTypes.string.isRequired
    };

    //  #region REACT AND DEFAULT FUNCTION
    bindAllFunc() {
        this.getFullObjectSymbol = this.getFullObjectSymbol.bind(this)
        this.subChannelWatchlistChange = this.subChannelWatchlistChange.bind(this)
        this.subChannelSelectedPriceboard = this.subChannelSelectedPriceboard.bind(this)
        this.unsubChannelWatchlistChanged = this.unsubChannelWatchlistChanged.bind(this)
        this.pushNewPriceBoard = this.pushNewPriceBoard.bind(this)
        this.onRowMoved = this.onRowMoved.bind(this)
        this.onDeleteCode = this.onDeleteCode.bind(this)
        this.renderSearchBar = this.renderSearchBar.bind(this)
        this.showModal = this.showModal.bind(this)
        this.onChangeText = this.onChangeText.bind(this)
        this.onNavigatorEvent = this.onNavigatorEvent.bind(this)
        this.onFocus = this.onFocus.bind(this)
        this.onBlur = this.onBlur.bind(this)
    }

    init() {
        const priceBoardId = func.getCurrentPriceboardId()
        const priceBoardName = func.getPriceboardNameInPriceBoard(priceBoardId) || ''
        this.dic = {
            priceBoardId,
            listCode: func.getCodeInPriceBoard(priceBoardId),
            dicSymbolObj: {},
            errorInputPriceName: '',
            isFocus: false,
            priceBoardName,
            currentTextOnInput: priceBoardName
        }

        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent)
        this.setButtonNav()
    }

    componentDidMount() {
        super.componentDidMount()
        this.getFullObjectSymbol().then(() => this.setState())
        this.subChannelWatchlistChange()
        this.subChannelSelectedPriceboard()
    }
    //  #endregion

    //  #region SUBCRIBER
    subChannelWatchlistChange() {
        const channelName = StreamingBusiness.getChannelWatchlistChanged(this.dic.priceBoardId)
        Emitter.addListener(channelName, this.id, () => {
            const newWatchlistName = func.getPriceboardNameInPriceBoard(this.dic.priceBoardId)
            if (newWatchlistName !== this.dic.priceBoardName && !this.dic.isFocus) {
                this.dic.priceBoardName = newWatchlistName
                this.dic.currentTextOnInput = newWatchlistName
                this.setState()
            }

            const newListCode = func.getCodeInPriceBoard(this.dic.priceBoardId)
            if (!Util.compareObject(this.dic.listCode, newListCode)) {
                this.dic.listCode = newListCode
                this.getFullObjectSymbol().then(() => this.setState())
            }
        })
    }

    unsubChannelWatchlistChanged() {
        const channelName = StreamingBusiness.getChannelWatchlistChanged(this.dic.priceBoardId)
        Emitter.deleteListener(channelName, this.id)
    }

    subChannelSelectedPriceboard() {
        const channelSelectedPriceboard = Channel.getChannelSelectedPriceboard()
        Emitter.addListener(channelSelectedPriceboard, this.id, priceBoardId => {
            this.unsubChannelWatchlistChanged()

            const priceBoardName = func.getPriceboardNameInPriceBoard(priceBoardId) || ''
            this.dic = {
                priceBoardId,
                listCode: func.getCodeInPriceBoard(priceBoardId),
                dicSymbolObj: {},
                errorInputPriceName: '',
                isFocus: false,
                priceBoardName,
                currentTextOnInput: priceBoardName
            }
            this.subChannelWatchlistChange()
            this.getFullObjectSymbol().then(() => this.setState())
        })
    }
    //  #endregion

    //  #region NAVIGATION
    showModal() {
        const nextScreenObj = {
            screen: SCREEN.SEARCH_CODE,
            backButtonTitle: '',
            animated: true,
            animationType: ANIMATED_TYPE.SLIDE_UP,
            navigatorStyle: { ...CommonStyle.navigatorSpecialNoHeader, ...{ drawUnderNavBar: true } }
        }
        ManageNavigation.pushStepAndShow(this.props.navigator, nextScreenObj, NAVIGATION_TYPE.MODAL, true)
    }

    setButtonNav() {
        this.props.navigator.setButtons({
            leftButtons: [Util.isIOS()
                ? {
                    id: 'backPress',
                    component: SCREEN.CUSTOM_BUTTON_CATEGORIES,
                    passProps: { onPress: this.onNavigatorEvent, hideText: true }
                }
                : { id: 'back' }]
        });
    }

    onNavigatorEvent(event) {
        if (event.type === 'NavBarButtonPress') {
            switch (event.id) {
                case 'backPress':
                    ManageNavigation.startBacking(SCREEN.TRADE)
                    ManageNavigation.popAndClose(this.props.navigator, CURRENT_SCREEN, true)
                    break;
                default:
                    break;
            }
        }
    }
    //  #endregion

    //  #region BUSINESS
    getFullObjectSymbol() {
        return new Promise(resolve => {
            this.dic.dicSymbolObj = {}
            if (Util.arrayHasItem(this.dic.listCode)) {
                Business.getSymbolInfoMultiExchange(this.dic.listCode).then(data => {
                    data.map(item => {
                        if (!item || !item.symbol) return;
                        this.dic.dicSymbolObj[item.symbol] = item
                    })
                    resolve()
                })
            } else {
                resolve()
            }
        })
    }

    pushNewPriceBoard() {
        let newValue = []
        let currentTime = new Date().getTime()
        newValue = this.dic.listCode.map(code => {
            currentTime++
            return {
                symbol: code,
                rank: currentTime
            }
        })
        const newPriceboard = {
            user_id: dataStorage.user_id,
            watchlist: this.dic.priceBoardId,
            watchlist_name: this.dic.priceBoardName,
            value: newValue
        }
        Business.updateUserPriceboard(this.dic.priceBoardId, dataStorage.user_id, newPriceboard)
    }

    onRowMoved(e) {
        const { to, from } = e;
        if (!isNaN(to) && !isNaN(from)) {
            this.dic.listCode.splice(to, 0, this.dic.listCode.splice(from, 1)[0]);
            logDevice('info', `ADD CODE - LIST WATCHLIST - ${JSON.stringify(this.dic.listCode)}`)
            this.setState()
            this.pushNewPriceBoard()
        }
    }

    onDeleteCode(symbol) {
        try {
            this.dic.listCode = this.dic.listCode.filter(item => item !== symbol)
            delete this.dic.dicSymbolObj[symbol];
            this.pushNewPriceBoard()
            this.setState()
            logDevice('info', `ADD CODE - DATA OBJECT ${JSON.stringify(this.dic.dicSymbolObj)} - LIST WATCHLIST: ${JSON.stringify(this.dic.listCode)}`)
        } catch (error) {
            console.log('onDeleteCode addCode logAndReport exception: ', error)
            logAndReport('onDeleteCode addCode exception', error, 'onDeleteCode addCode');
        }
    }
    //  #endregion

    //  #region EVENT ELEMENT
    onChangeText(text) {
        this.dic.currentTextOnInput = text

        const newText = text.trim()
        if (!newText) {
            this.dic.errorInputPriceName = I18n.t('watchlistRequiredWarning')
            this.forceUpdate()
            return
        }

        const listPriceboard = func.getAllPersonalPriceboard()
        const itemDuplicateName = listPriceboard.find(item => item.watchlist_name && item.watchlist_name.toUpperCase() === newText.toUpperCase() && item.watchlist !== this.dic.priceBoardId)
        if (itemDuplicateName) {
            this.dic.errorInputPriceName = I18n.t('watchlistUniqueWarning')
            this.forceUpdate()
            return
        }

        if (this.dic.errorInputPriceName) {
            this.dic.errorInputPriceName = ''
            this.setState()
        }
        this.dic.priceBoardName = newText
        this.setState()
    }

    onFocus() {
        this.dic.isFocus = true
    }

    onBlur() {
        this.dic.isFocus = false
        this.dic.errorInputPriceName = ''
        this.dic.currentTextOnInput = this.dic.priceBoardName
        Business.pushUpdatePriceboardName(this.dic.priceBoardId, dataStorage.user_id, this.dic.priceBoardName)
        this.setState()
    }
    //  #endregion

    //  #region RENDER
    renderSearchBar() {
        return (
            <SearchBar
                testID='search-bar-add-code'
                onShowModalSearch={this.showModal}
            />
        );
    }

    renderWatchlistName() {
        const styleInput = {
            textAlign: 'center',
            paddingVertical: 10,
            paddingHorizontal: 8,
            width: WIDTH_SCREEN - 16,
            fontSize: CommonStyle.fontSizeM,
            backgroundColor: CommonStyle.backgroundColor
        }
        return <HighlightInput
            value={this.dic.currentTextOnInput}
            styleFocus={[styleInput, { color: CommonStyle.fontColor }]}
            styleBlur={[styleInput, { color: CommonStyle.fontBlue }]}
            onChangeText={this.onChangeText}
            maxLength={100}
            editable={!func.isCurrentPriceboardFavorites()}
            onFocus={this.onFocus}
            onBlur={this.onBlur}
        />
    }

    render() {
        return (
            <View style={[{ flex: 1, backgroundColor: CommonStyle.backgroundColor, marginTop: dataStorage.platform === 'ios' ? 0 : 55 }]}>
                {
                    !this.props.isConnected ? <NetworkWarning /> : null
                }
                {
                    this.dic.errorInputPriceName
                        ? (<NotifyOrder type={'error'} text={this.dic.errorInputPriceName} />)
                        : (<View></View>)
                }
                {this.renderWatchlistName()}
                {this.renderSearchBar()}
                {
                    this.dic.dicSymbolObj && !Util.compareObject(this.dic.dicSymbolObj, {})
                        ? <SortableListView
                            testID='sortableListViewAddCode'
                            style={{ flex: 1, backgroundColor: CommonStyle.backgroundColor }}
                            data={this.dic.dicSymbolObj}
                            order={this.dic.listCode}
                            onRowMoved={this.onRowMoved}
                            renderRow={row => {
                                return <RowComponent data={row} onDeleteCode={this.onDeleteCode} />
                            }}
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

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(addCodeActions, dispatch)
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(AddCode)
