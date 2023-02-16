import React, { useRef, useMemo, useCallback, useContext, useEffect } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import Animated, { Easing } from 'react-native-reanimated'
import PropTypes from 'prop-types'
import * as Emitter from '@lib/vietnam-emitter'
import { connect, useSelector, useDispatch, shallowEqual } from 'react-redux';

import { ScrollBarUndelineCustomV2 } from '~/screens/alert_function/components/SearchBar/index.js';
import TopHeader from '~/component/add_symbol/Views/Header/TopHeader.js'
import { changeLoading, changeTextSearch, changeClassFilter } from '../redux/actions'
import { getChannelClearRecentSymbol } from '~/streaming/channel.js'
import { useShadow } from '~/component/shadow/SvgShadow';

import CommonStyle from '~/theme/theme_controller'
import I18n from '~/modules/language'
import Enum from '~/enum'
const { SYMBOL_CLASS, NAME_PANEL, SYMBOL_CLASS_QUERY } = Enum
const ListClass = ({ textSearch }) => {
    const dispatch = useDispatch()

    const onSelected = useCallback((classSelected) => {
        dispatch(changeClassFilter(classSelected))
    }, [])
    const listData = useMemo(() => {
        return [
            {
                id: SYMBOL_CLASS.ALL_TYPES,
                label: I18n.t(SYMBOL_CLASS.allTypes),
                action: () => onSelected(SYMBOL_CLASS_QUERY[SYMBOL_CLASS.ALL_TYPES])
            },
            {
                id: SYMBOL_CLASS.INDICES,
                label: I18n.t('Indices'),
                action: () => onSelected(SYMBOL_CLASS_QUERY[SYMBOL_CLASS.INDICES])
            },
            {
                id: SYMBOL_CLASS.EQUITY,
                label: I18n.t(SYMBOL_CLASS.equityLowerCase),
                action: () => onSelected(SYMBOL_CLASS.EQUITY)
            },
            {
                id: SYMBOL_CLASS.ETFS,
                label: I18n.t(SYMBOL_CLASS.ETFS),
                action: () => onSelected(SYMBOL_CLASS.ETFS)
            },
            {
                id: SYMBOL_CLASS.MF,
                label: I18n.t(SYMBOL_CLASS.MF),
                action: () => onSelected(SYMBOL_CLASS.MF)
            },
            {
                id: SYMBOL_CLASS.WARRANT,
                label: I18n.t(SYMBOL_CLASS.warrantLower),
                action: () => onSelected(SYMBOL_CLASS.WARRANT)
            },
            {
                id: SYMBOL_CLASS.FUTURE,
                label: I18n.t('Future'),
                action: () => onSelected(SYMBOL_CLASS.FUTURE)
            },
            {
                id: SYMBOL_CLASS.OPTION,
                label: I18n.t('options'),
                action: () => onSelected(SYMBOL_CLASS.OPTION)
            },
            {
                id: SYMBOL_CLASS.FX,
                label: I18n.t('FX'),
                action: () => onSelected(SYMBOL_CLASS_QUERY[SYMBOL_CLASS.FX])
            }
        ]
    }, [])
    const refScrollTabBar = useRef()
    return (
        <Animated.View
            style={{
                opacity: 1,
                // backgroundColor: CommonStyle.backgroundColor,
                height: textSearch === '' ? 0 : 47
            }}
        >
            <ScrollBarUndelineCustomV2
                styleLineBottmFake={{
                    backgroundColor: CommonStyle.backgroundColor1
                }}
                ref={refScrollTabBar}
                tabs={listData}
            />
        </Animated.View>
    )
}
const HeaderSearchSymbol = ({
    searchSymbol, changeLoadingSearch, onClearSearch, onClose
}) => {
    const textSearch = useSelector(state => state.searchSymbol.textSearch, shallowEqual)
    const [Shadow, onLayout] = useShadow()
    return (
        <View style={{
            zIndex: 99999
        }}>
            <Shadow />
            <View style={{
                paddingTop: 8
            }} onLayout={onLayout}>
                <TopHeader
                    placeholder={'Search for security'}
                    textSearch={textSearch}
                    handleUpdateTextSearch={searchSymbol}
                    // onDone={onClose}
                    onClose={onClose}
                    {...{ searchSymbol, changeLoadingSearch, onClearSearch, type: 'SEARCH_SYMBOL' }}
                />
                <ListClass textSearch={textSearch} />
            </View>
        </View>
    )
}
const mapDispatchToProps = (dispatch) => ({
    searchSymbol: (...p) =>
        dispatch(changeTextSearch(...p)),
    changeLoadingSearch: p => dispatch(changeLoading(p)),
    onClearSearch: p => Emitter.emit(getChannelClearRecentSymbol())
});
const mapStateToProps = (state) => {
    return {
        type: 'SEARCH_SYMBOL'
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(HeaderSearchSymbol);
