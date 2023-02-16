import React, { useState, useCallback, useRef, useEffect, PureComponent, useLayoutEffect, useContext, useMemo, useImperativeHandle } from 'react';
import { Text, View, TouchableOpacity, TextInput, StyleProp, StyleSheet, Platform } from 'react-native';
import { connect, useSelector, shallowEqual, useDispatch } from 'react-redux'
import * as Emitter from '@lib/vietnam-emitter'
// Style
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
// Langue
import I18n from '~/modules/language/';
// Component
import Ionicons from 'react-native-vector-icons/Ionicons';
import { CloseIcon, IconClickToRefresh, CloseIcon2 } from '~/component/panel/Icon.js';
import TextInputAvoidPadding from '~/component/text_input/index.js'
import Shadow from '~/component/shadow';
import CustomIcon from '~/component/Icon'
import Icon from '~/component/svg_icon/SvgIcon.js'
import { useShadow } from '~/component/shadow/SvgShadow'

import { changeLoading, changeTextSearch } from '../redux/actions'
import { getChannelClearRecentAccount } from '~/streaming/channel.js'
import { func, dataStorage } from '~/storage';

import { filterListPortfolioType, getListPortfolioType, getIsSearchAccount } from '~s/portfolio/Model/PortfolioAccountModel'

import Enum from '~/enum'
const { NAME_PANEL } = Enum
export function useSetDisableButtonClearRecent({ type, setDisable }) {
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
}
export const BarBottomSearch = ({ onClearSearch, type }) => {
    const [isDisable, setDisable] = useState(true)
    useSetDisableButtonClearRecent({
        type,
        setDisable
    })
    const onClear = useCallback(() => {
        onClearSearch && onClearSearch()
        setDisable(true)
    }, [])
    const [Shadow, onLayout] = useShadow();
    return (
        <View>
            <Shadow />
            <View onLayout={onLayout} style={[{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingVertical: 8,
                paddingHorizontal: 8
            }]}>
                <Text style={[styles.textRecent]}>Recent</Text>
                <Icon
                    disabled={isDisable}
                    onPress={onClear}
                    style={{ paddingLeft: 16 }}
                    name={'delete'}
                    size={20}
                    color={isDisable ? CommonStyle.color.dusk : CommonStyle.fontNearLight6}
                />
            </View>
        </View>
    )
}
export const Header = React.memo(React.forwardRef(({
    type,
    hide,
    setData
}, ref) => {
    let timeoutSearch = useRef(null)
    const dispatch = useDispatch()
    const searchAccount = useCallback((text) => {
        dispatch(changeTextSearch(text))
    }, [])
    const onPressClearRecent = useCallback(() => {
        Emitter.emit(getChannelClearRecentAccount())
        searchAccount && searchAccount('')
        setData([])
    }, [])
    const changeLoadingSearch = useCallback((p) => {
        dispatch(changeLoading(p))
    }, [])
    const refTextInput = useRef()
    const [textSearch, setTextSearch] = useState('')
    const isSearch = useSelector(state => state.searchAccount.isSearch, shallowEqual)
    const onSearch = useCallback((text) => {
        changeLoadingSearch(true)
        setTextSearch(text)
        timeoutSearch && clearTimeout(timeoutSearch)
        timeoutSearch = setTimeout(() => {
            searchAccount && searchAccount(text)
        }, 500)
    }, [])
    useEffect(() => {
        return () => {
            searchAccount && searchAccount('')
        }
    }, [])
    const onClose = useCallback(() => {
        hide && hide()
    }, [])
    const focus = useCallback(() => refTextInput.current.focus())
    const blur = useCallback(() => refTextInput.current.blur())
    const clear = useCallback(() => {
        refTextInput.current.clear()
        searchAccount && searchAccount('')
        setTextSearch('')
    })
    const [BottomShadow, onLayout] = useShadow()
    useImperativeHandle(ref, () => ({
        handleFocus: focus,
        handleBlur: blur,
        handleClear: clear
    }))
    return (
        <React.Fragment>
            <Shadow />
            <View style={[styles.header]} testID={'search-bar-button-common'}>
                <View style={{
                    zIndex: 10
                }}>
                    <BottomShadow />
                    <View onLayout={onLayout} style={[{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingBottom: 8,
                        paddingHorizontal: 16,
                        zIndex: 10,
                        backgroundColor: CommonStyle.backgroundColor
                    }]} >
                        <View style={[
                            {
                                flexDirection: 'row',
                                flex: 1
                            },
                            styles.searchBar,
                            { marginRight: 16 }
                        ]}>
                            <CommonStyle.icons.search
                                name={'search'}
                                size={17}
                                color={CommonStyle.fontColor}
                                style={[{
                                    color: CommonStyle.fontWhite,
                                    fontSize: CommonStyle.iconSizeS,
                                    paddingRight: 8
                                }]}
                            />
                            <View style={{
                                flex: 1,
                                justifyContent: 'center'
                            }} >
                                <TextInputAvoidPadding
                                    styleWrapper={{ flex: 0 }}
                                    autoFocus={false}
                                    placeholder={I18n.t('search')}
                                    forwardRef={refTextInput}
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
                </View>
                {textSearch === '' && isSearch && <BarBottomSearch type={type || 'SEARCH_ACCOUNT'} onClearSearch={onPressClearRecent} />}
            </View>
        </React.Fragment>

    )
}), () => true)

export default Header
const styles = {}
function getNewestStyle() {
    const newStyle = StyleSheet.create({
        header: {
            zIndex: 9,
            backgroundColor: CommonStyle.backgroundColor,
            paddingVertical: 8,
            borderTopLeftRadius: 22,
            borderTopRightRadius: 22
        },
        searchBar: {
            borderWidth: 1,
            borderColor: CommonStyle.backgroundNewSearchBar,
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: CommonStyle.backgroundNewSearchBar,
            paddingHorizontal: 16,
            paddingVertical: 8
        },
        textRecent: {
            color: CommonStyle.fontNearLight6,
            fontSize: CommonStyle.fontSizeXS
        },
        iconSearch: {
            color: CommonStyle.fontWhite,
            fontSize: CommonStyle.iconSizeS,
            paddingRight: CommonStyle.paddingSize
        },
        textInput: {
            color: CommonStyle.fontColor,
            fontSize: CommonStyle.fontSizeXS,
            fontFamily: CommonStyle.fontPoppinsRegular,
            paddingVertical: 0,
            margin: 0
        }
    });

    PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)
