import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native'
import PropTypes from 'prop-types'
import { Navigation } from 'react-native-navigation';

import TouchableOpacityOpt from '~/component/touchableOpacityOpt/';
import Icon from '~/screens/watchlist/Component/Icon2.js'
import Shadow, { shadowOpt } from '~/component/shadow';
import * as PriceBoardModel from '~/screens/watchlist/EditWatchList/Model/PriceBoardModel.js'

import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'

import Enum from '~/enum'
import I18n from '~/modules/language'

import IconBin from '~/img/icon/bin.png'
import IconBinDisabled from '~/img/icon/bin_disabled.png'

import { useSelector, useDispatch } from 'react-redux';
import { updateListSymbol, updateListSymbolAndResetDataSelected } from '~/screens/watchlist/EditWatchList/Redux/actions.js'
const { NAME_PANEL } = Enum

const ButtonAddSymbol = ({ onDone }) => {
    const onPress = useCallback(() => {
        Navigation.showModal({
            screen: 'equix.SingleBottomSheet',
            animated: false,
            animationType: 'none',
            navigatorStyle: {
                ...CommonStyle.navigatorModalSpecialNoHeader,
                modalPresentationStyle: 'overCurrentContext'
            },
            overrideBackPress: true,
            passProps: {
                namePanel: NAME_PANEL.ADD_SYMBOL,
                isSwitchFromQuickButton: true,
                enabledGestureInteraction: false,
                onDone: onDone,
                dicSymbolSelected: PriceBoardModel.getDicSymbolSelected(PriceBoardModel.getPriceBoardCurrentPriceBoard())
            }
        })
    }, [])
    return (
        <TouchableOpacityOpt timeDelay={Enum.TIME_DELAY} onPress={onPress} style={styles.buttonWrapper}>
            <CommonStyle.icons.add
                color={CommonStyle.iconAddSymbol}
                size={22}
                style={{
                    marginRight: 8
                }}
            />
            <Text style={{
                fontFamily: CommonStyle.fontPoppinsRegular,
                color: CommonStyle.fontColor,
                fontSize: CommonStyle.fontSizeXS
            }}>Add Symbols</Text>
        </TouchableOpacityOpt>
    )
}
const ButtonDelete = ({ onPress }) => {
    const isConnected = useSelector(state => state.app.isConnected)
    return (
        <TouchableOpacity onPress={onPress} style={styles.buttonWrapper}>
            <CommonStyle.icons.deleteSvg
                name={'delete'}
                size={20}
                color={
                    CommonStyle.color.sell
                }
            />
            {/* <Image source={IconBin} style={{
                width: 22, height: 22, marginRight: 8
            }} /> */}
            <Text style={{
                fontFamily: CommonStyle.fontPoppinsRegular,
                color: CommonStyle.color.sell,
                fontSize: CommonStyle.fontSizeXS
            }}>{I18n.t('deleteSelected')}</Text>
        </TouchableOpacity>
    )
}
const ButtonDeleteWatchlist = ({ onPress }) => {
    const isConnected = useSelector(state => state.app.isConnected)
    const { isDisable, color } = useMemo(() => {
        if (isConnected) {
            return {
                isDisable: false,
                color: CommonStyle.color.sell
            }
        } else {
            return {
                isDisable: true,
                color: CommonStyle.fontNearLight6
            }
        }
    }, [isConnected])
    return (
        <TouchableOpacity disabled={isDisable} onPress={onPress} style={styles.buttonWrapper}>
            <CommonStyle.icons.deleteSvg
                name={'delete'}
                size={20}
                color={
                    CommonStyle.color.sell
                }
            />
            {/* <Image source={isDisable ? IconBinDisabled : IconBin} style={{
                width: 22,
                height: 22,
                marginRight: 8,
                opacity: isDisable ? 0.5 : 1
            }} /> */}
            {/* <Icon style={{
                marginRight: 8
            }} color={color}
                size={22} name={'delete'} /> */}
            <Text style={{
                fontFamily: CommonStyle.fontPoppinsRegular,
                color: color,
                fontSize: CommonStyle.fontSizeXS
            }}>{I18n.t('deleteWatchlist')}</Text>
        </TouchableOpacity>
    )
}
const ButtonDeleteAll = ({ onPress }) => {
    const isConnected = useSelector(state => state.app.isConnected)
    const priceBoard = useSelector(state => state.editWatchlist.priceBoard)
    const { isDisable, color } = useMemo(() => {
        if (isConnected) {
            const data = priceBoard.value
            if (data && data.length > 0) {
                return {
                    isDisable: false,
                    color: CommonStyle.color.sell
                }
            } else {
                return {
                    isDisable: true,
                    color: CommonStyle.fontNearLight6
                }
            }
        } else {
            return {
                isDisable: true,
                color: CommonStyle.fontNearLight6
            }
        }
    }, [isConnected, priceBoard])
    return (
        <TouchableOpacity disabled={isDisable} onPress={onPress} style={styles.buttonWrapper}>
            <Image source={isDisable ? IconBinDisabled : IconBin} style={{
                width: 22,
                height: 22,
                marginRight: 8,
                opacity: isDisable ? 0.5 : 1
            }} />
            <Text style={{
                fontFamily: CommonStyle.fontPoppinsRegular,
                color: color,
                fontSize: CommonStyle.fontSizeXS
            }}>{I18n.t('deleteAll')}</Text>
        </TouchableOpacity>
    )
}
const Footer = ({ onShowConfirmDeleteWatchlist }) => {
    const dataSelected = useSelector(state => state.editWatchlist.dataSelected)
    const dispatch = useDispatch()
    const isDeleteAll = useMemo(() => {
        const index = Object.values(dataSelected).findIndex(el => el)
        if (index !== -1) {
            return false
        } else {
            return true
        }
    }, [dataSelected])
    const isShowDeleteWatchlist = useMemo(() => {
        return true
        switch (PriceBoardModel.getTypePriceBoard()) {
            case Enum.TYPE_PRICEBOARD.IRESS:
                return false
            case Enum.TYPE_PRICEBOARD.FAVORITES:
                return false
            default:
                return true
        }
    }, [])
    const setting = {
        ...shadowOpt, ...{ radius: 0 }
    }

    const handleDelete = useCallback(() => {
        const newPriceBoard = PriceBoardModel.deletePriceBoard(dataSelected)
        dispatch(updateListSymbolAndResetDataSelected(newPriceBoard || []))
    }, [dataSelected])
    return useMemo(() => (
        <View >
            <Shadow setting={
                setting
            } />
            <View style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                paddingTop: 8,
                paddingBottom: 30,
                paddingHorizontal: 8,
                backgroundColor: CommonStyle.backgroundColor,
                zIndex: 999
            }}>
                {
                    isDeleteAll ? isShowDeleteWatchlist ? <ButtonDeleteWatchlist onPress={onShowConfirmDeleteWatchlist} /> : <ButtonDeleteAll onPress={handleDelete} /> : <ButtonDelete onPress={handleDelete} />
                }
            </View>
        </View>
    ), [dataSelected, isDeleteAll])
}
const styles = {}
function getNewestStyle() {
    const newStyle = StyleSheet.create({
        buttonWrapper: {
            borderWidth: 1,
            borderColor: CommonStyle.fontDark3,
            paddingVertical: 13,
            paddingHorizontal: 16,
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center'
        }
    })
    PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

Footer.propTypes = {}
Footer.defaultProps = {}
export default Footer
