import React, { useCallback, useRef, useState, useMemo, useImperativeHandle, useEffect, useLayoutEffect } from 'react'
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet, Platform
} from 'react-native'
import * as Emitter from '@lib/vietnam-emitter'
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import { dataStorage, func } from '~/storage'
import { CloseIcon, IconClickToRefresh, CloseIcon2 } from '~/component/panel/Icon.js';
import CustomIcon from '~/component/Icon'
import SvgIcon from '~s/watchlist/Component/Icon2'
import Ionicons from 'react-native-vector-icons/Ionicons'
import Icon from '~/screens/watchlist/Component/Icon2.js'
import I18n from '~/modules/language/'
import Shadow from '~/component/shadow';
import { useShadow } from '~/component/shadow/SvgShadow'
import { filterListPortfolioType, getListPortfolioType, getIsSearchAccount } from '~s/portfolio/Model/PortfolioAccountModel'
import { searchAccount } from '~/screens/portfolio/Controller/PortfolioAccountController.js'
import { changeLoading, changeTextSearch } from '~/component/search_account/redux/actions.js'
import { getChannelClearRecentAccount } from '~/streaming/channel.js'
import { useSelector, shallowEqual, useDispatch } from 'react-redux'
export const BarBottomSearch = ({ onClearSearch }) => {
    const [isDisable, setDisable] = useState(true)
    const isLoading = useSelector(state => state.searchAccount.isLoading, shallowEqual)
    const onClear = useCallback(() => {
        onClearSearch && onClearSearch()
        setDisable(true)
    }, [])
    useSetDisableButtonClearRecent({
        type: 'SEARCH_ACCOUNT',
        setDisable,
        isLoading
    })
    const [Shadow, onLayout] = useShadow();
    return (
        <View>
            <Shadow />
            <View onLayout={onLayout} style={[{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, paddingHorizontal: 8, alignItems: 'center' }]}>
                <View>
                    <Text style={[styles.textRecent]}>Recent</Text>
                </View>
                <TouchableOpacity disabled={isDisable} onPress={onClear} style={{ paddingLeft: 16 }}>
                    <CommonStyle.icons.deleteSvg
                        disabled={isDisable}
                        onPress={onClear}
                        name={'delete'}
                        size={20}
                        color={
                            isDisable
                                ? CommonStyle.fontNearLight3
                                : CommonStyle.fontNearLight6
                        }
                    />
                </TouchableOpacity>
            </View>
        </View>
    )
}
export function useSetDisableButtonClearRecent({ type, setDisable, isLoading }) {
    return useLayoutEffect(() => {
        if (type === 'SEARCH_SYMBOL') {
            func.getReccentSearchSymbol().then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    setDisable(false)
                }
            }).catch(e => cb && cb([]))
        } else {
            func.getReccentAccount().then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    setDisable(false)
                }
            }).catch(e => {

            })
        }
    }, [isLoading])
}

const SearchAccountHeader = React.forwardRef(({ setData, onClose }, ref) => {
    let timeoutSearch = useRef(null)
    const dispatch = useDispatch()
    const refTextInput = useRef()
    const [textSearch, setTextSearch] = useState('')
    const listPortfolioType = useMemo(() => getListPortfolioType(), [])
    const isSearch = useSelector(state => state.searchAccount.isSearch, shallowEqual)
    const changeLoadingSearch = useCallback((isLoading) => {
        dispatch(changeLoading(isLoading))
    }, [])
    const searchSymbol = useCallback((text) => {
        dispatch(changeTextSearch(text))
    }, [])
    const onSearch = useCallback((text) => {
        changeLoadingSearch(true)
        setTextSearch(text)
        timeoutSearch && clearTimeout(timeoutSearch)
        timeoutSearch = setTimeout(() => {
            searchSymbol && searchSymbol(text)
        }, 500)
    }, [])
    const onClearSearch = useCallback(() => {
        Emitter.emit(getChannelClearRecentAccount())
    }, [])
    const resetData = () => {
        refTextInput.current.clear && refTextInput.current.clear()
        setTextSearch('')
        timeoutSearch && clearTimeout(timeoutSearch)
        timeoutSearch = setTimeout(() => {
            searchSymbol && searchSymbol('')
        }, 500)
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
                styles.searchBar,
                {
                    marginRight: 16
                }
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
            <CloseIcon2 onPress={onClose} />
        </View>
        {textSearch === '' && isSearch && <BarBottomSearch onClearSearch={onClearSearch} />}
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

export default SearchAccountHeader
