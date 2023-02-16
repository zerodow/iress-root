import React, { useState, useImperativeHandle, useEffect } from 'react'
import {
    View, StyleSheet
} from 'react-native'
import CommonStyle from '~/theme/theme_controller'
import SearchAccountContent from '~s/portfolio/View/SearchAccount/SearchAccountContent'
import RowLoading from '~/component/search_account/Components/FlatListSequenceAnimation/index.js'
import * as Animatable from 'react-native-animatable'
import { getListPortfolioType } from '~s/portfolio/Model/PortfolioAccountModel'
import { func, dataStorage } from '~/storage';
import { useSelector } from 'react-redux'
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
const SearchAccountDetail = React.forwardRef(({ onClose, setSpaceTop, handleSelectAccount }, ref) => {
    const [data, setData] = useState(() => {
        return []
    })
    const isLoading = useSelector(state => state.searchAccount.isLoading)
    useImperativeHandle(ref, () => {
        return { setData }
    })
    useOnListenClearRecent({
        setData
    })
    return <View
        style={{
            backgroundColor: CommonStyle.backgroundColor,
            flex: 1
        }}>
        <Animatable.View pointerEvents={'none'}
            duration={isLoading ? 1 : 500}
            animation={isLoading ? 'fadeIn' : 'fadeOut'}
            style={[StyleSheet.absoluteFillObject, { zIndex: 999, paddingVertical: 8 }]}
        >
            <RowLoading style={{
                paddingHorizontal: 8
            }} isLoading={isLoading} data={fakeDataNews} />
        </Animatable.View>
        {
            !isLoading && <SearchAccountContent
                data={data}
                hide={onClose}
                handleSelectAccount={handleSelectAccount}
                setSpaceTop={setSpaceTop} />
        }
    </View>
})

export default SearchAccountDetail
