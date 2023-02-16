import React, { useMemo, useState, useCallback, useRef, useImperativeHandle, useEffect } from 'react'
import {
    View, Text, Dimensions, StyleSheet, Animated as TestAnimated
} from 'react-native'
import Animated, { Easing } from 'react-native-reanimated'
import BackDropView from '~s/watchlist/Component/BackDropView2';
import NestedScrollView from '~s/watchlist/Component/NestedScroll/WatchlistNested';
import * as Animatable from 'react-native-animatable'
import I18n from '~/modules/language/';
import HeaderPanner from '~s/watchlist/Detail/components/HeaderPanner';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import { func, dataStorage } from '~/storage';
import { useShadow } from '~/component/shadow/SvgShadow';
import { getListPortfolioType } from '~s/portfolio/Model/PortfolioAccountModel'
import SearchAccountDetail from '~s/portfolio/View/SearchAccount/SearchAccountDetail'
import { Item } from '~s/portfolio/View/SearchAccount/SearchAccountContent'
import SearchAccountHeader from '~s/portfolio/View/SearchAccount/SearchAccountHeader'
import HandleSearchComp from '~/component/search_account/HandleSearchComp.js'
import RowLoading from '~/component/search_account/Components/FlatListSequenceAnimation/index.js'
import BottomSheet from '~/component/bottom_sheet/bottom_sheet_with_flatlist'
import { shallowEqual, useSelector } from 'react-redux';
import * as Emitter from '@lib/vietnam-emitter'
import * as Util from '~/util';
import * as Channel from '~/streaming/channel.js'
const TRADELIST_PADDING = 48
const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get('window')
const {
    interpolate,
    Value
} = Animated
const fakeDataNews = [
    {
        'news_id': 1038017311455314439
    },
    {
        'news_id': 1038017311455314440
    },

    {
        'news_id': 1038017311455314441
    },

    {
        'news_id': 1038017311455314442
    },

    {
        'news_id': 1038017311455314443
    },

    {
        'news_id': 1038017311455314444
    },

    {
        'news_id': 1038017311455314445
    },

    {
        'news_id': 1038017311455314446
    },

    {
        'news_id': 1038017311455314447
    }
]
function useOnListenClearRecent({ setData }) {
    return useEffect(() => {
        const id = Emitter.addListener(Channel.getChannelClearRecentAccount(), Util.getRandomKey(), () => {
            setData && setData([])
            func.clearRecentAccount && func.clearRecentAccount()
        });
        return () => {
            Emitter.deleteByIdEvent(id)
        }
    }, [])
}
const SearchAccount = React.forwardRef(({ showHideTabbar, showHideBuySell, setSpaceTop, handleSelectAccount }, ref) => {
    const _scrollValue = useMemo(() => new Value(0), [])
    const _scrollContainer = useMemo(() => new Value(DEVICE_HEIGHT * 1.3), [])
    const _isScrollContent = useMemo(() => new Value(0), [])
    const dic = useRef({ scrollValue: null })
    const _spaceTop = useMemo(() => new Value(TRADELIST_PADDING), [])
    const [data, setData] = useState([])
    const refNested = useRef({})
    const refDetail = useRef({})
    const refHeader = useRef({})
    const refHeandleSearch = useRef({})
    const isLoading = useSelector(state => state.searchAccount.isLoading, shallowEqual)
    const show = useCallback(() => {
        refNested.current && refNested.current.show && refNested.current.show()
        refHeandleSearch.current.handleSearchRecent && refHeandleSearch.current.handleSearchRecent()
        setTimeout(() => {
            refHeader.current && refHeader.current.showKeyboard && refHeader.current.showKeyboard()
        }, 500)
        showHideTabbar && showHideTabbar(0)
    }, [])
    useImperativeHandle(ref, () => {
        return { show }
    })
    const renderHeaderPanner = useCallback(() => {
        return <SearchAccountHeader
            ref={refHeader}
            setData={setData}
            onClose={onCloseDetail}
        />
    }, [])
    const onCloseDetailByScroll = useCallback(() => {
        refHeader.current.hideKeyboard && refHeader.current.hideKeyboard()
        resetData()
        showHideTabbar && showHideTabbar(1)
    }, [])
    const onCloseDetail = useCallback(() => {
        refHeader.current.hideKeyboard && refHeader.current.hideKeyboard()
        refNested.current && refNested.current.hide && refNested.current.hide()
        resetData()
        showHideTabbar && showHideTabbar(1)
    }, [])
    const updateResult = useCallback((listPortfolioType) => {
        setData(listPortfolioType)
        refDetail.current && refDetail.current.setData && refDetail.current.setData(listPortfolioType)
    }, [])
    useEffect(() => {
    }, [data])
    const renderItem = useCallback(({ index, item }) => {
        return (
            <Item
                key={item.portfolio_id}
                handleSelectAccount={handleSelectAccount}
                item={item}
                index={index}
                hide={onCloseDetail}
                setSpaceTop={() => { }} />
        )
    }, [])
    const resetData = () => {
        refHeader.current.resetData && refHeader.current.resetData()
        refHeader.current.hideKeyboard && refHeader.current.hideKeyboard()
    }
    regisAnim = (scrollValue) => {
        dic.current.scrollValue = scrollValue
    }
    useOnListenClearRecent({ setData: updateResult })
    const renderLoading = useCallback(() => {
        return (
            <Animatable.View pointerEvents={'none'}
                duration={isLoading ? 1 : 500}
                animation={isLoading ? 'fadeIn' : 'fadeOut'}
                style={[StyleSheet.absoluteFillObject, { zIndex: 999, paddingVertical: 8 }]}
            >
                <RowLoading style={{
                    paddingHorizontal: 8
                }} isLoading={isLoading} data={fakeDataNews} />
            </Animatable.View>
        )
    }, [isLoading])
    return (
        <React.Fragment>
            <HandleSearchComp ref={refHeandleSearch} updateResult={updateResult} />
            <View pointerEvents={'box-none'} style={{ ...StyleSheet.absoluteFillObject }}>
                <BottomSheet
                    onClose={onCloseDetail}
                    renderLoading={renderLoading}
                    isLoading={isLoading}
                    styleContent={{ backgroundColor: CommonStyle.backgroundColor }}
                    data={data}
                    renderItem={renderItem}
                    ref={refNested}
                    renderHeader={renderHeaderPanner} />
            </View>
        </React.Fragment>
    )
    return <React.Fragment>
        <HandleSearchComp ref={refHeandleSearch} updateResult={setData} />
        <BackDropView
            spaceTop={_spaceTop}
            _scrollValue={_scrollContainer}
            _isScrollContent={_isScrollContent}
            opacityInterpolate={translateY =>
                interpolate(translateY, {
                    inputRange: [-1, 0, DEVICE_HEIGHT, DEVICE_HEIGHT + 1],
                    outputRange: [0.85, 0.85, 0, 0]
                })
            }
        />

        <NestedScrollView
            ref={refNested}
            _isScrollContent={_isScrollContent}
            _scrollValue={_scrollValue}
            _scrollContainer={_scrollContainer}
            spaceTop={_spaceTop}
            renderHeaderPanner={renderHeaderPanner}
            beginHideCallback={onCloseDetailByScroll}
        >
            <View style={styles.bg} />
            <SearchAccountDetail
                ref={refDetail}
                handleSelectAccount={handleSelectAccount}
                setSpaceTop={setSpaceTop}
                onClose={onCloseDetail}
            />
        </NestedScrollView>
    </React.Fragment>
})

const styles = {}
function getNewestStyle() {
	const newStyle = StyleSheet.create({
    bg: {
        position: 'absolute',
        height: '150%',
        width: '100%',
        paddingTop: 33,
        backgroundColor: CommonStyle.backgroundColor
    }
});
PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

export default SearchAccount
