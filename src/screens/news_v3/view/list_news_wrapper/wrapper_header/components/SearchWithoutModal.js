import React, { useState, useCallback, useRef, useEffect, PureComponent, useLayoutEffect } from 'react';
import { Text, View, TouchableOpacity, TextInput, StyleProp, StyleSheet, Platform } from 'react-native';
// Style
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
// Langue
import I18n from '~/modules/language/';
// Component
import Ionicons from 'react-native-vector-icons/Ionicons';
import SvgIcon from '~s/watchlist/Component/Icon2'
import * as HeaderModel from '~/screens/news_v3/model/header_list_news/header.model.js'
export default SearchWithoutModal = React.memo(({ search, style, textInputStyle }) => {
    let timeoutSearch = null
    const [disabled, setDisabled] = useState(true)
    const refTextInput = useRef()
    const refButtonReset = useRef()
    const onSearch = useCallback((textSearch) => {
        if (textSearch === '') {
            setDisabled(true)
        } else {
            setDisabled(false)
        }
        HeaderModel.setFilter(textSearch)
        timeoutSearch && clearTimeout(timeoutSearch)
        timeoutSearch = setTimeout(() => {
            console.log('DCM search', textSearch)
            search && search()
        }, 500)
    }, [])
    const onClearText = useCallback(() => {
        if (HeaderModel.getFilter() === '') {
            return
        }
        HeaderModel.setFilter('')
        refTextInput && refTextInput.current && refTextInput.current.setNativeProps({
            text: ''
        })
        refTextInput && refTextInput.current && refTextInput.current.blur()
        setDisabled(true)
        search && search()
    }, [])
    useEffect(() => {
        const textFilter = HeaderModel.getFilter()
        refTextInput && refTextInput.current && refTextInput.current.setNativeProps({
            text: textFilter
        })
    }, [])
    return (
        <View
            style={style}
            testID={'search-bar-button-common'}>
            <View style={[styles.searchBar]}>
                <CommonStyle.icons.search
                    name={'search'}
                    size={17}
                    color={CommonStyle.fontColor}
                    style={[{
                        color: CommonStyle.fontColor,
                        marginRight: 8,
                        fontSize: CommonStyle.iconSizeS
                    }]}
                />
                <View style={{
                    flex: 1,
                    justifyContent: 'center'
                }} >
                    <TextInput
                        placeholder={I18n.t('search')}
                        ref={refTextInput}
                        onChangeText={onSearch}
                        placeholderTextColor={'rgba(255,255,255,0.5)'}
                        returnKeyType="search"
                        underlineColorAndroid='transparent'
                        // selectionColor={CommonStyle.fontColor}
                        style={[styles.textInput, textInputStyle]}
                    />
                </View>
            </View>
        </View>
    )
}, () => true)
const styles = {}
function getNewestStyle() {
    const newStyle = StyleSheet.create({
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
        iconSearch: {
            color: CommonStyle.fontWhite,
            fontSize: CommonStyle.iconSizeS,
            paddingRight: CommonStyle.paddingSize
        },
        textInput: {
            color: CommonStyle.fontColor,
            fontSize: CommonStyle.font11,
            fontFamily: CommonStyle.fontPoppinsRegular,
            paddingVertical: 0
        }
    });

    PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)
