import React, { useState, useCallback, useEffect, useImperativeHandle, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { View, Text, TouchableOpacity } from 'react-native'
import CommonStyle from '~/theme/theme_controller'
import I18n from '~/modules/language/'
import TouchableOpacityOpt from '~/component/touchableOpacityOpt/'
import SvgIcon from '~s/watchlist/Component/Icon2'
import ENUM from '~/enum'
import { setManageButtonStatus } from '~s/watchlist/Categories/Redux/actions'
const { MANAGE_BUTTON_STATUS, WATCHLIST } = ENUM

const getNumberUserWL = ({ priceBoard }) => {
    let numberUserWL = 0
    Object.keys(priceBoard).map((item, index) => {
        const WL = priceBoard[item] || {}
        const { isIress, watchlist, watchlist_name: WLName } = WL
        !isIress && watchlist !== WATCHLIST.USER_WATCHLIST && numberUserWL++
    })
    return numberUserWL
}

const ManageWLButton = React.forwardRef((props, ref) => {
    const { showCheckBox, hideCheckBox, showDelete } = props
    const { manageBtnStatus: status } = useSelector(state => state.categoriesWL)
    const { priceBoard } = useSelector(state => state.watchlist3)
    const numberUserWL = useMemo(() => {
        return getNumberUserWL({ priceBoard })
    }, [priceBoard])
    const dispatch = useDispatch()
    const onPress = useCallback(() => {
        let newStatus = status
        if (status === MANAGE_BUTTON_STATUS.DELETE) {
            // Xóa hết symbol checked & back về undo manage
            showDelete && showDelete()
        } else if (status === MANAGE_BUTTON_STATUS.UNDO_MANAGE) {
            newStatus = MANAGE_BUTTON_STATUS.MANAGE
        } else if (status === MANAGE_BUTTON_STATUS.MANAGE) {
            newStatus = MANAGE_BUTTON_STATUS.UNDO_MANAGE
        }
        dispatch(setManageButtonStatus(newStatus))
    }, [status])
    useEffect(() => {
        switch (status) {
            case MANAGE_BUTTON_STATUS.MANAGE:
                return hideCheckBox && hideCheckBox()
            case MANAGE_BUTTON_STATUS.UNDO_MANAGE:
                return showCheckBox && showCheckBox()
            default:
                return () => { }
        }
    }, [status])
    const iconProperty = useMemo(() => {
        switch (status) {
            case MANAGE_BUTTON_STATUS.DELETE:
                return {
                    iconName: 'delete',
                    iconColor: CommonStyle.color.sell
                }
            default:
                return {
                    iconName: 'setting',
                    iconColor: CommonStyle.fontBorderRadius
                }
        }
    }, [status])
    const textProperty = useMemo(() => {
        switch (status) {
            case MANAGE_BUTTON_STATUS.DELETE:
                return {
                    text: I18n.t('delete'),
                    color: CommonStyle.color.sell
                }
            default:
                return {
                    text: I18n.t('manage'),
                    color: CommonStyle.fontColor
                }
        }
    }, [status])
    const disabled = numberUserWL === 0
    return <TouchableOpacity
        disabled={disabled}
        onPress={onPress}
        style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 13,
            paddingHorizontal: 16,
            borderWidth: 1,
            borderColor: CommonStyle.color.dusk,
            borderRadius: 8,
            opacity: disabled ? 0.5 : 1
        }}>
        <SvgIcon
            color={iconProperty.iconColor}
            name={iconProperty.iconName}
            size={24}
            style={{
                marginRight: 8
            }}
        />
        <Text style={{
            color: textProperty.color,
            fontFamily: CommonStyle.fontPoppinsRegular,
            fontSize: CommonStyle.font11,
            paddingTop: 2
        }}>
            {textProperty.text}
        </Text>
    </TouchableOpacity>
})

export default ManageWLButton
