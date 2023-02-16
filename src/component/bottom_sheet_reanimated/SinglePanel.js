import React, { useEffect, useState, useCallback, useRef, useReducer, useMemo } from 'react'
import { View, Text, Dimensions, TouchableOpacity, Keyboard, Platform, SafeAreaView, StatusBar } from 'react-native'
import PropTypes from 'prop-types'
import Immutable from 'seamless-immutable';

import BottomSheetDisableGesture from '~/component/bottom_sheet_reanimated/BottomSheetDisabledGesture.js'
import KeyboardAvoidingView from '~/component/keyboard_avoid_view/index.js'
// Start Search account

// Add Symbol
import AddSymbolHeader from '~/component/add_symbol/Views/Header.js'
import AddSymbolContent from '~/component/add_symbol/Views/Content.js'
// Start search symbol
// Search and add symbol
import SearchAddSymbolHeader from '~/component/add_and_search_symbol/Views/Header/Header.js'
import SearchAddSymbolContent from '~/component/add_and_search_symbol/Views/Content.js'

import { Navigation } from 'react-native-navigation';
import * as FunctionUtil from '~/lib/base/functionUtil';
import Enum from '~/enum'
let top = FunctionUtil.getTopPanel()

const { NAME_PANEL } = Enum
const { height: heightDevice } = Dimensions.get('window')
export const SinglePanelContext = React.createContext({});
const { Provider, Consumer } = SinglePanelContext;

const TYPE = {
    UPDATE_STATE: 'UPDATE_STATE'
}

function reducer(state, action) {
    switch (action.type) {
        case TYPE.UPDATE_STATE:
            return state.merge(action.payload)
        default:
            throw new Error();
    }
}

const SinglePanel = ({
    namePanel: forwardNamePanel,
    navigator,
    dicValueUpdate,
    enabledGestureInteraction,
    dicSymbolSelected,
    isShowBoxCheck = true,
    onDone = () => { },
    onSelectedSymbol = () => { },
    ...rest
}) => {
    const refNested = useRef()
    const initialState = useMemo(() => {
        return Immutable({
            namePanel: forwardNamePanel || NAME_PANEL.UNDETERMINED,
            ...dicValueUpdate
        })
    }, []);
    const [state, dispatch] = useReducer(reducer, initialState)
    const { namePanel } = state
    const renderHeader = useCallback(() => {
        switch (namePanel) {
            case NAME_PANEL.ADD_SYMBOL:
                return (
                    <AddSymbolHeader
                        dicSymbolSelected={dicSymbolSelected}
                        onDone={onDone}
                        onClose={() => refNested && refNested.current && refNested.current.hide()}
                    />
                )
            case NAME_PANEL.ADD_AND_SEARCH:
                return (
                    <SearchAddSymbolHeader
                        dicSymbolSelected={dicSymbolSelected}
                        onDone={onDone}
                        onClose={() => refNested && refNested.current && refNested.current.hide()} />
                )
            default:
                return null
        }
    }, [namePanel])

    const renderContent = useCallback(() => {
        switch (namePanel) {
            case NAME_PANEL.ADD_SYMBOL:
                return (
                    <AddSymbolContent
                        dicSymbolSelected={dicSymbolSelected}
                        onClose={() => refNested && refNested.current && refNested.current.hide()}
                    />
                )
            case NAME_PANEL.ADD_AND_SEARCH:
                return (
                    <SearchAddSymbolContent
                        onSelectedSymbol={onSelectedSymbol}
                        dicSymbolSelected={dicSymbolSelected}
                        onClose={() => refNested && refNested.current && refNested.current.hide()}
                        isShowBoxCheck={isShowBoxCheck}
                        {...rest}
                    />
                )
            default:
                return null
                break;
        }
    }, [namePanel])
    const unMountPanel = useCallback(() => {
        Navigation.dismissModal({
            animationType: 'none'
        })
    }, [])
    const onHideDone = useCallback(() => {
        unMountPanel()
    }, [])
    const onShowDone = useCallback(() => {
    }, [])
    useEffect(() => {
        refNested && refNested.current && refNested.current.show()
    }, [])
    console.info('DCM top', top)
    return (
        <Provider
            value={{
                refDirection: refNested
            }}
        >
            <KeyboardAvoidingView
                style={{
                    backgroundColor: 'transparent'
                }}
            >
                <View
                    onStartShouldSetResponder={Keyboard.dismiss}
                    style={{
                        flex: 1
                    }}>
                    <BottomSheetDisableGesture
                        enabledGestureInteraction={enabledGestureInteraction}
                        ref={refNested}
                        onHideDone={onHideDone}
                        onShowDone={onShowDone}
                        snapPoints={[heightDevice - top, 0]}
                        // translateMaster={translateMaster}
                        // scrollValue={scrollValue}
                        renderContent={renderContent}
                        renderHeader={renderHeader}
                        contentStyle={
                            {
                                marginTop: top
                            }
                        }
                    />
                </View>
            </KeyboardAvoidingView>

        </Provider>
    )
}
SinglePanel.propTypes = {}
SinglePanel.defaultProps = {}
export default SinglePanel
