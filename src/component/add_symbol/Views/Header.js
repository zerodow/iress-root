import React, { useRef, useMemo, useCallback, useContext, useEffect, useState } from 'react';
import { Text, View, StyleSheet, UIManager } from 'react-native';
import Animated, { Easing } from 'react-native-reanimated'
import PropTypes from 'prop-types'
import * as Emitter from '@lib/vietnam-emitter'
import { connect, useSelector, useDispatch, shallowEqual } from 'react-redux';

import { ScrollBarUndelineCustomV2 } from '~/screens/alert_function/components/SearchBar/index.js';
import TopHeader from '~/component/add_symbol/Views/Header/TopHeader.js'
import Shadow from '~/component/shadow';
import { useShadow } from '~/component/shadow/SvgShadow';
import { animate } from '~/screens/news_v3/helper/animation.js'
import { changeLoading, changeTextSearch, changeClassFilter } from '../Redux/actions'
import { getChannelClearRecentSymbol } from '~/streaming/channel.js'

import CommonStyle from '~/theme/theme_controller'
import I18n from '~/modules/language'
import Enum from '~/enum'
const { SYMBOL_CLASS, NAME_PANEL, SYMBOL_CLASS_QUERY } = Enum
UIManager.setLayoutAnimationEnabledExperimental && UIManager.setLayoutAnimationEnabledExperimental(true);
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
                height: textSearch === '' ? 0 : 44
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
    searchSymbol, changeLoadingSearch, onClearSearch, type, onClose, onDone
}) => {
    const [Shadow2, onLayout2] = useShadow();
    const [textSearch, setTextSearch] = useState('')
    const handleUpdateTextSearch = useCallback((text) => {
        setTextSearch(text)
    }, [])
    return (
        <View>
            <Shadow />
            <View style={{
                zIndex: 99999
            }}>
                <Shadow2 />
                <View onLayout={onLayout2}>
                    <TopHeader
                        textSearch={textSearch}
                        handleUpdateTextSearch={handleUpdateTextSearch}
                        onDone={onDone} onClose={onClose}
                        {...{ searchSymbol, changeLoadingSearch, onClearSearch, type }}
                    />
                    <ListClass textSearch={textSearch} />
                </View>
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
