import React, { useEffect, useState, useCallback, useRef, useImperativeHandle, useMemo } from 'react'
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import PanelComfirmDelete from '~/component/confirm_delete/ConfirmDelete.js'
import HeaderPanel from '~/component/panel/HeaderPanel.js'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { ButtomConfirm } from '~/component/virtual_keyboard/Keyboard.js'
import Icon from '~/component/svg_icon/SvgIcon.js'
import ShadowTop from '~/component/shadow';
import { useShadow } from '~/component/shadow/SvgShadow';

import IconBack from '~/img/icon/noun_cancel.png'

import CommonStyle from '~/theme/theme_controller'
import I18n from '~/modules/language'

import * as PriceBoardModel from '~/screens/watchlist/EditWatchList/Model/PriceBoardModel.js'
const Header = ({
    title,
    onClose
}) => {
    const [ShadowBottom, onLayout] = useShadow();
    return (
        <View style={{
            zIndex: 999
        }}>
            <ShadowBottom />
            <View style={{
                backgroundColor: CommonStyle.backgroundColor,
                paddingHorizontal: 16,
                justifyContent: 'center',
                paddingVertical: 8,
                zIndex: 99999999,
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16
            }} onLayout={onLayout}>
                <View style={{
                    alignSelf: 'flex-end'
                }}>
                    <TouchableOpacity onPress={onClose} >
                        <Image source={IconBack} style={{
                            height: 22,
                            width: 22
                        }} />
                    </TouchableOpacity>
                </View>
                <View pointerEvents={'box-none'} style={[
                    StyleSheet.absoluteFillObject,
                    {
                        alignItems: 'center',
                        paddingVertical: 8,
                        justifyContent: 'center'
                    }
                ]}>
                    <Text
                        numberOfLines={1}
                        style={{
                            fontSize: CommonStyle.fontSizeM,
                            color: CommonStyle.fontColor,
                            fontFamily: CommonStyle.fontPoppinsBold
                        }}
                    >
                        {title}
                    </Text>
                </View>
            </View>
        </View>
    )
}
const ConfirmDelete = React.forwardRef(({ onConfirm }, ref) => {
    const refPopup = useRef()
    const isConnected = useSelector(state => state.app.isConnected)
    const watchListName = useMemo(() => {
        return PriceBoardModel.getWatchlistName()
    }, [])
    useImperativeHandle(ref, () => ({
        show: refPopup.current.show,
        hide: refPopup.current.hide
    }), []);
    return useMemo(() => (
        <PanelComfirmDelete
            ref={refPopup}
            style={{
                zIndex: 9999
            }}
            renderHeader={() => {
                return (
                    <React.Fragment>
                        <ShadowTop
                            heightShadow={15}
                        />
                        <Header titleStyle={{ borderWidth: 0 }} title={I18n.t('deleteWatchlist')} onClose={() => refPopup.current && refPopup.current.hide && refPopup.current.hide()} />
                    </React.Fragment>
                )
            }}
            renderContent={() => {
                return (<View style={{
                    width: '100%',
                    backgroundColor: CommonStyle.backgroundColor,
                    paddingHorizontal: 8,
                    paddingVertical: 48
                }} >
                    <Text style={{
                        flexDirection: 'row',
                        fontFamily: CommonStyle.fontPoppinsRegular,
                        fontSize: CommonStyle.font11,
                        color: CommonStyle.fontColor,
                        textAlign: 'center'
                    }}>
                        {`Are you sure you wish to delete this watchlist and all items inside?`}
                    </Text>
                </View>)
            }}
            renderFooter={() => {
                return (
                    <View style={{
                        backgroundColor: CommonStyle.backgroundColor
                    }}>
                        <ButtomConfirm isConnected={isConnected} isLoading={false} onConfirm={onConfirm} isBuy={false} titleButton={'Delete'} iconReviewOrder2={true} />
                    </View>
                )
            }}
        />
    ), [onConfirm, isConnected])
})
ConfirmDelete.propTypes = {}
ConfirmDelete.defaultProps = {}
const styles = StyleSheet.create({
    description: {
        color: CommonStyle.fontColor,
        fontFamily: CommonStyle.fontPoppinsRegular,
        fontSize: CommonStyle.fontSizeXS
    }
})
export default ConfirmDelete
