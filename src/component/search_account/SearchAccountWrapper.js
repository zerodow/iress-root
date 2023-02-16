import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types'
import BottomSheet, { useRefBottomSheet } from '~/component/bottom_sheet/bottom_sheet_with_flatlist'
import KeyboardAvoidView from '~/component/keyboard_avoid_view/index.js'
import RowLoading from '~/component/search_account/Components/FlatListSequenceAnimation/index.js'
import Header from './Views/Header'
import Content from './Views/Content'
import ItemAccount from './Components/ItemAccount'
import { dataStorage, func } from '~/storage'
import CommonStyle from '~/theme/theme_controller'
import ScreenId from '~/constants/screen_id'
import HandleSearchComp, { useRefHandleSearch } from './HandleSearchComp'
import * as Animatable from 'react-native-animatable'
import { useSelector } from 'react-redux';
import * as Emitter from '@lib/vietnam-emitter'
import * as Util from '~/util';
import * as Channel from '~/streaming/channel.js'
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
export const useRefSearchAccount = () => {
    const refSearchAccount = useRef()
    const hide = useCallback(() => {
        refSearchAccount.current && refSearchAccount.current.hide && refSearchAccount.current.hide()
    }, [])
    const show = useCallback(() => {
        refSearchAccount.current && refSearchAccount.current.show && refSearchAccount.current.show()
    }, [])
    return { refSearchAccount, hide, show }
}
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
const SearchAccountWrapper = React.forwardRef(({ style, setSpaceTop, hideDetailPortfolio = () => { } }, ref) => {
    const isLoading = useSelector(state => state.searchAccount.isLoading)
    const refHeader = useRef()
    const { refHandleSearch, handleSearchRecent } = useRefHandleSearch()
    const [data, setData] = useState([])
    const { refBottomSheet, show, hide } = useRefBottomSheet()
    const cbSelectAccount = useCallback(() => {
        refHeader.current && refHeader.current.handleBlur && refHeader.current.handleBlur()
    })
    const onShowDone = useCallback(() => {
        refHeader.current && refHeader.current.handleFocus && refHeader.current.handleFocus()
    }, [])
    const onHideDone = useCallback(() => {
        handleSearchRecent()
        refHeader.current && refHeader.current.handleBlur && refHeader.current.handleBlur()
        refHeader.current && refHeader.current.handleClear && refHeader.current.handleClear()
    }, [])
    const renderHeader = useCallback(() => {
        return <Header setData={setData} ref={refHeader} hide={hide} />
    }, [])
    const renderItem = useCallback(({ index, item }) => {
        const { portfolio_id: accountId, portfolio_name: accountName } = item
        return <ItemAccount {...{ index, item, accountId, accountName, cbSelectAccount, hide, setSpaceTop, hideDetailPortfolio }} />
    }, [])
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
    useImperativeHandle(ref, () => ({ show }));
    useOnListenClearRecent({ setData })
    return (
        <KeyboardAvoidView pointerEvents="box-none" style={[style, StyleSheet.absoluteFillObject, { backgroundColor: 'transparent' }]}>
            <HandleSearchComp ref={refHandleSearch} updateResult={setData} />
            <BottomSheet
                styleContent={{ backgroundColor: CommonStyle.backgroundColor }}
                isLoading={isLoading}
                ref={refBottomSheet}
                data={data}
                renderHeader={renderHeader}
                renderItem={renderItem}
                renderLoading={renderLoading}
                onShowDone={onShowDone}
                onHideDone={onHideDone}
            />
        </KeyboardAvoidView>
    );
})
SearchAccountWrapper.propTypes = {};

export default SearchAccountWrapper;
