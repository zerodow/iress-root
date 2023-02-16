import React, { useEffect, useState, useCallback, useRef, useMemo, useReducer } from 'react'
import { View, Text } from 'react-native'
import PropTypes from 'prop-types'

import BottomHeader from './BottomHeader'
import HeaderMessage from './HeaderMessage'
import TopHeader from './TopHeader'

import * as PriceBoardModel from '~/screens/watchlist/EditWatchList/Model/PriceBoardModel.js'

import { useSelector, shallowEqual } from 'react-redux'
/**
 * Kiem tra xem data co thay doi ko
 */
const HandleCheckDataPriceBoard = ({ disabledButtonDone, setDisabledButtonDone }) => {
    const priceBoard = useSelector(state => state.editWatchlist.priceBoard)
    return useMemo(() => {
        try {
            const priceBoardRemote = PriceBoardModel.getPriceBoardRemote()
            const priceBoardLocal = PriceBoardModel.getPriceBoardCurrentPriceBoard()
            const watchlistNameLocal = priceBoardLocal.watchlist_name
            const watchlistNameRemote = priceBoardRemote.watchlist_name
            const listSymbolLocal = priceBoardLocal.value || []
            const listSymbolRemote = priceBoardRemote.value || []
            let isDisabled = true
            if (watchlistNameLocal !== watchlistNameRemote) {
                isDisabled = false
                setDisabledButtonDone(false)
            }
            if (listSymbolLocal.length !== listSymbolRemote.length) {
                isDisabled = false
                setDisabledButtonDone(false)
            }
            for (let index = 0; index < listSymbolLocal.length; index++) {
                const element = listSymbolLocal[index];
                const elementRemote = listSymbolRemote[index]
                if (elementRemote) {
                    if (element.symbol !== elementRemote.symbol || element.exchange !== elementRemote.exchange) {
                        isDisabled = false
                        setDisabledButtonDone(false)
                    }
                }
            }
            if (watchlistNameLocal === '') {
                isDisabled = true
            }
            isDisabled && setDisabledButtonDone(true)
        } catch (error) {

        }
        return null
    }, [priceBoard])
}
const Header = React.memo(({ navigator }) => {
    const refHeaderMessage = useRef()
    const [disabledButtonDone, setDisabledButtonDone] = useState(true)
    return (
        <View>
            <View>
                <TopHeader disabledButtonDone={disabledButtonDone} navigator={navigator} />
            </View>
            <View>
                <BottomHeader setDisabledButtonDone={setDisabledButtonDone} />
            </View>
            <View>
                <HeaderMessage ref={refHeaderMessage} />
            </View>
            <HandleCheckDataPriceBoard disabledButtonDone={disabledButtonDone} setDisabledButtonDone={setDisabledButtonDone} />
        </View>
    )
}, () => true)
Header.propTypes = {}
Header.defaultProps = {}
export default Header
