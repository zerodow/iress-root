import React, { useCallback, useRef, useState, useMemo, useImperativeHandle, useEffect } from 'react'
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet, Platform
} from 'react-native'
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import CustomIcon from '~/component/Icon'
import SvgIcon from '~s/watchlist/Component/Icon2'
import Ionicons from 'react-native-vector-icons/Ionicons'
import Icon from '~/screens/watchlist/Component/Icon2.js'
import I18n from '~/modules/language/'
import Shadow from '~/component/shadow';
import { useShadow } from '~/component/shadow/SvgShadow'
import { filterListPortfolioType, getListPortfolioType } from '~s/portfolio/Model/PortfolioAccountModel'
import { useSelector, useDispatch } from 'react-redux'
import { CloseIcon2 } from '~/component/panel/Icon.js';

const AddToWLHeader = React.forwardRef(({ setTextSearch, onDone }, ref) => {
    const isSelector = useSelector(state => state.reducerNews.isSelector)
    let timeoutSearch = useRef(null)
    const refTextInput = useRef()
    const listPortfolioType = useMemo(() => getListPortfolioType(), [])
    const onSearch = useCallback((text) => {
        timeoutSearch && clearTimeout(timeoutSearch)
        timeoutSearch = setTimeout(() => {
            setTextSearch(text)
        }, 500)
    }, [])
    const resetData = () => {
        refTextInput.current.clear && refTextInput.current.clear()
        return setTextSearch('')
    }
    useImperativeHandle(ref, () => {
        return { resetData, showKeyboard, hideKeyboard }
    })
    const showKeyboard = () => {
        refTextInput.current && refTextInput.current.focus()
    }
    const hideKeyboard = () => {
        refTextInput.current && refTextInput.current.blur()
    }
    const [BottomShadow, onLayout] = useShadow()
    return <View
        style={[styles.header]}
        testID={'search-bar-button-common'}>
        <Shadow heightShadow={40} />
        <BottomShadow />
        <View
            onLayout={onLayout}
            style={[{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 16,
                zIndex: 10,
                backgroundColor: CommonStyle.backgroundColor,
                paddingVertical: 8,
                borderTopLeftRadius: 22,
                borderTopRightRadius: 22
            }]} >
            <View style={[
                {
                    flexDirection: 'row',
                    flex: 1
                },
                styles.searchBar
            ]}>
                <CommonStyle.icons.search
                    name={'search'}
                    size={17}
                    color={CommonStyle.fontColor}
                    style={[styles.iconSearch]}
                />
                <View style={{
                    flex: 1,
                    justifyContent: 'center'
                }} >
                    <TextInput
                        autoFocus={false}
                        placeholder={I18n.t('search')}
                        ref={refTextInput}
                        onChangeText={onSearch}
                        placeholderTextColor={'rgba(255,255,255,0.3)'}
                        returnKeyType="search"
                        underlineColorAndroid='transparent'
                        // selectionColor={CommonStyle.fontColor}
                        style={styles.textInput}
                    />
                </View>
            </View>
            {isSelector
                ? <TouchableOpacity onPress={onDone} style={{ alignItems: 'flex-end', paddingLeft: 16 }} hitSlop={{ top: 12, left: 12, right: 12, bottom: 12 }}>
                    <SvgIcon
                        name={'done'}
                        size={17}
                        color={CommonStyle.color.icon}
                    />
                </TouchableOpacity> : <CloseIcon2 style={{
                    width: 17,
                    height: 17,
                    marginLeft: 16
                }}
                    onPress={onDone} />}
        </View>
    </View>
})

const styles = {}
function getNewestStyle() {
	const newStyle = StyleSheet.create({
    header: {
        backgroundColor: CommonStyle.backgroundColor
    },
    searchBar: {
        borderWidth: 1,
        borderColor: CommonStyle.backgroundNewSearchBar,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: CommonStyle.backgroundNewSearchBar,
        paddingRight: CommonStyle.paddingDistance2,
        paddingLeft: CommonStyle.paddingDistance2,
        paddingVertical: 8
    },
    textRecent: {
        color: CommonStyle.fontNearLight6,
        fontSize: CommonStyle.fontSizeXS
    },
    iconSearch: {
        color: CommonStyle.fontWhite,
        fontSize: CommonStyle.iconSizeS,
        paddingRight: 8
    },
    textInput: {
        color: CommonStyle.fontColor,
        fontSize: CommonStyle.font11,
        fontFamily: CommonStyle.fontPoppinsRegular,
        paddingVertical: 0
    },
    textAccount: {
        fontFamily: CommonStyle.fontPoppinsBold,
        fontSize: CommonStyle.fontSizeXS,
        color: CommonStyle.fontNearLight6
    },
    textId: {
        fontFamily: CommonStyle.fontPoppinsBold,
        fontSize: CommonStyle.fontSizeXS,
        color: CommonStyle.fontColor
    },
    textNameAccount: {
        fontFamily: CommonStyle.fontPoppinsBold,
        fontSize: CommonStyle.fontSizeXS,
        color: CommonStyle.fontColor
    },
    boxAccount: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: CommonStyle.color.dusk,
        borderRadius: 8
    }
});
	PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

export default AddToWLHeader
