import React from 'react';
import { View, Text, TouchableOpacity, Keyboard, PixelRatio } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import styles from './style/addcode';
import { func, dataStorage } from '../../storage';
import { logAndReport, checkTradingHalt, resultSearchNewOrderByMaster } from '../../lib/base/functionUtil';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import Flag from '../../component/flags/flag'
import XComponent from '../../component/xComponent/xComponent'
import * as Business from '../../business';
import * as Emitter from '@lib/vietnam-emitter';
import Enum from '../../enum';
import * as Channel from '../../streaming/channel'
const { ERROR_CODE: { SUCCESS } } = Enum;

export default class AddCodeDetail extends XComponent {
    //  #region REACT AND DEFAULT FUNCTION
    bindAllFunc() {
        this.processData = this.processData.bind(this);
        this.getIsSelect = this.getIsSelect.bind(this)
        this.subChannelWatchlistChange = this.subChannelWatchlistChange.bind(this)
        this.subChannelSelectedPriceboard = this.subChannelSelectedPriceboard.bind(this)
        this.unsubChannelWatchlistChanged = this.unsubChannelWatchlistChanged.bind(this)
    }

    init() {
                this.state = {
            isSelect: this.getIsSelect(),
            tradingHalt: false,
            currentPriceboardId: func.getCurrentPriceboardId(),
            listData: []
        }
    }

    componentDidMount() {
        super.componentDidMount()

        this.subChannelWatchlistChange()
        this.subChannelSelectedPriceboard()

        checkTradingHalt(this.props.symbol).then(boolean => {
            this.setState({ tradingHalt: boolean })
        })
    }
    //  #endregion

    //  #region SUBCRIBER
    unsubChannelWatchlistChanged() {
        const channelName = Channel.getChannelWatchlistChanged(this.state.currentPriceboardId)
        Emitter.deleteListener(channelName, this.id)
    }

    subChannelWatchlistChange() {
        const currentPriceboardId = func.getCurrentPriceboardId()
        const channelName = Channel.getChannelWatchlistChanged(currentPriceboardId)
        Emitter.addListener(channelName, this.id, () => {
            const newIsSelect = this.getIsSelect()
            newIsSelect !== this.state.isSelect && this.setState({ isSelect: newIsSelect })
        })
    }

    subChannelSelectedPriceboard() {
        const channelSelectedPriceboard = Channel.getChannelSelectedPriceboard()
        Emitter.addListener(channelSelectedPriceboard, this.id, priceboardId => {
            this.unsubChannelWatchlistChanged()
            this.subChannelWatchlistChange()
            this.setState({ currentPriceboardId: priceboardId, isSelect: this.getIsSelect() })
        })
    }
    //  #endregion

    //  #region BUSINESS
    getIsSelect() {
        const currentPriceboardId = func.getCurrentPriceboardId()
        return func.checkSymbolInPriceboard(currentPriceboardId, this.props.symbol)
    }
    //  #endregion
    // add and remove all list symbol by master code
    addAndRemoveAllSymbolPriceboad = listData => {
        Keyboard.dismiss();
        const { isParent } = this.props;
        const { isSelect } = this.state;
        const currentPriceboardId = func.getCurrentPriceboardId();
        const userId = dataStorage.user_id;
        const listSymbol = [];
        const listObjSymbol = [];
        const dicSymbol = {};
        if (!isSelect && isParent) {
            listObjSymbol.push({ symbol: this.props.symbol });
            listSymbol.push(this.props.symbol);
            for (item of listData) {
                let checkStatus = null;
                checkStatus = func.checkSymbolInPriceboard(currentPriceboardId, item.symbol);
                if (!checkStatus) {
                    listObjSymbol.push({ symbol: item.symbol });
                    listSymbol.push(item.symbol)
                }
            }
            //
            if (listSymbol.length !== 0) {
                Business.addListSymbolToPriceboard(currentPriceboardId, userId, listObjSymbol, listSymbol, true);
            }
        }
        if (isSelect && isParent) {
            dicSymbol[this.props.symbol] = this.props.symbol;
            for (item of listData) {
                const checkStatus = func.checkSymbolInPriceboard(currentPriceboardId, item.symbol);
                if (checkStatus) dicSymbol[item.symbol] = item;
            }
            if (listData.length !== 0) Business.removeListSymbolInPriceboard(currentPriceboardId, userId, dicSymbol, true);
        }
        // listData && this.setState({ listData });
    }
    // add 1 symbol if symbol is sub by master code
    addListSymboPriceboard = listData => {
        const { symbol, masterCode } = this.props;
        const currentPriceboardId = func.getCurrentPriceboardId()
        const userId = dataStorage.user_id
        let count = 0;
        const listSymbol = [];
        const listObjSymbol = [];
        listSymbol.push(symbol)
        listObjSymbol.push({ symbol: symbol })
        for (item of listData) {
            let checkStatus = null;
            checkStatus = func.checkSymbolInPriceboard(currentPriceboardId, item.symbol);
            if (checkStatus) count++;
        }
        if (listData.length === (count + 1)) {
            listSymbol.push(masterCode);
            listObjSymbol.push({ symbol: masterCode });
            Business.addListSymbolToPriceboard(currentPriceboardId, userId, listObjSymbol, listSymbol, true);
        } else {
            Business.addSymbolToPriceboard(currentPriceboardId, userId, this.props.symbol, true)
        }
    }
    // load data by master code and text search
    // loadData = () => {
    //     const { symbol, textSearch, isChild, masterCode } = this.props
    //     if (isChild) {
    //         const cb = this.addListSymboPriceboard
    //         resultSearchNewOrderByMaster({ masterCode, textSearch, cb });
    //     } else {
    //         const cb = this.addAndRemoveAllSymbolPriceboad
    //         resultSearchNewOrderByMaster({ masterCode: symbol, textSearch, cb });
    //     }
    // }

    processData() {
        const { isParent, isChild, masterCode, symbol } = this.props;
        const dicSymbol = {};

        try {
            // add and remove all
            // if (isParent) this.loadData();
            // else {
            // Keyboard.dismiss();
            const newIsSelect = this.state.isSelect
            const currentPriceboardId = func.getCurrentPriceboardId()
            const userId = dataStorage.user_id
            // const checkStatus = func.checkSymbolInPriceboard(currentPriceboardId, masterCode);
            // if (isChild && newIsSelect) {
            //     if (checkStatus) dicSymbol[masterCode] = masterCode;
            //     dicSymbol[symbol] = symbol;
            //     Business.removeListSymbolInPriceboard(currentPriceboardId, userId, dicSymbol, true);
            // } else if (isChild && !newIsSelect) {
            //     this.loadData();
            // } else if (!isChild && !newIsSelect) {
            //     Business.addSymbolToPriceboard(currentPriceboardId, userId, this.props.symbol, true);
            // } else if (!isChild && newIsSelect) {
            //     Business.removeSymbolInPriceboard(currentPriceboardId, userId, this.props.symbol, true);
            // }
            // }
            if (!newIsSelect) {
                Business.addSymbolToPriceboard(currentPriceboardId, userId, this.props.symbol, true);
            } else if (newIsSelect) {
                Business.removeSymbolInPriceboard(currentPriceboardId, userId, this.props.symbol, true);
            }
        } catch (error) {
            logAndReport('processData addCodeDetail exception', error, 'processData addCodeDetail');
        }
    }

    render() {
        const { symbol, isParent } = this.props;
        return (symbol && !isParent)
            ? (
                <TouchableOpacity onPress={this.processData}>
                    {this.state.isSelect
                        ? <Icon testID={`${this.props.symbol}added`} name='md-checkmark' style={CommonStyle.iconCheck} />
                        : <Icon testID={`${this.props.symbol}removed`} name='md-add' style={CommonStyle.iconAdd} />
                    }
                </TouchableOpacity>
            )
            : <TouchableOpacity onPress={this.processData}>
                {this.state.isSelect
                    ? <Icon testID={`${this.props.symbol}added`} name='md-checkmark' style={CommonStyle.iconCheck} />
                    : <Icon testID={`${this.props.symbol}removed`} name='md-add' style={CommonStyle.iconAdd} />
                }
            </TouchableOpacity>
    }
}
