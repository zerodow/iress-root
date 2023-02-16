import React, { Component, useCallback, useMemo, useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Dimensions, Keyboard, TouchableWithoutFeedback, ActivityIndicator } from 'react-native';
import { connect } from 'react-redux';
import * as Util from '~/util';
import * as Emitter from '@lib/vietnam-emitter';

import HandleSearch from '../HandleSearchComp'
import * as Animatable from 'react-native-animatable'
import RowLoading from '~/component/search_account/Components/FlatListSequenceAnimation/index.js'
import SvgIcon from '~/component/svg_icon/SvgIcon.js'
// Style
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
// Langue
import I18n from '~/modules/language/';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { func, dataStorage } from '~/storage';

import * as fbEmit from '~/emitter';
import * as Channel from '~/streaming/channel.js'
import * as Controller from '~/memory/controller';
import { getAccActive, getDicPortfolioType, setReduxAccActive, setAccActive } from '~/screens/portfolio/Model/PortfolioAccountModel.js'
import { setAccActiveLocalStorage, updateListPortfolioType } from '~s/portfolio/Controller/PortfolioAccountController'
import { changeLoadingState, resetPLState } from '~s/portfolio/Redux/actions'
import { dispatch } from '~/memory/controller'
import { getPortfolioTotal } from '~s/portfolio/Controller/PortfolioTotalController'
import { resetStateNewOrder } from '~/screens/new_order/Redux/actions.js'
import Enum from '~/enum'
const { height: heightDevice } = Dimensions.get('window')
const {
    ACCOUNT_STATE,
    CHANNEL,
    EVENT,
    NAME_PANEL
} = Enum;
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
export let dataAccountFake = []
export const BoxCheck = ({ isSelected }) => {
    if (isSelected) {
        return (
            <SvgIcon size={22} name='added' color={CommonStyle.color.select} />
        )
    }
    return (
        <SvgIcon size={22} name='untick' color={CommonStyle.color.unselect} />
    )
}
const ItemAccount = ({ accountId, accountName, cbSelectAccount, index, item }) => {
    const accActive = getAccActive()
    const defaultAccount = getDicPortfolioType(accActive)
    const { portfolio_id: accountIdSelected, portfolio_name: accountNameSelected } = defaultAccount
    const isSelected = useMemo(() => {
        return accountId === accountIdSelected && accountName === accountNameSelected
    }, [accountId, accountName])

    const onSelectAccount = useCallback(() => {
        cbSelectAccount && cbSelectAccount({ ...item, key: index })
    }, [accountId, accountName])

    return (
        <TouchableOpacity onPress={onSelectAccount} style={[
            styles.boxAccount,
            { marginTop: index === 0 ? 0 : 8, flexDirection: 'row', alignItems: 'center' },
            isSelected ? { borderWidth: 1, borderColor: CommonStyle.fontColorButtonSwitch } : {}
        ]}>
            <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row' }}>
                    <Text style={styles.textAccount}>
                        Account
                </Text>
                    <Text style={[styles.textId, { marginLeft: 12 }]}>
                        {accountId}
                    </Text>
                </View>
                <Text style={[styles.textNameAccount]}>
                    {accountName}
                </Text>
            </View>
            <BoxCheck isSelected={isSelected} />
        </TouchableOpacity >
    )
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

const SearchAccountContent = ({ isLoading, forwardContext, setSpaceTop, hideDetail }) => {
    const [data, setData] = useState([])
    const selectedAccount = useCallback(({ portfolio_name: accountName, portfolio_id: accountId, key, ...rest }) => {
        Keyboard.dismiss()
        if (accountName == null) return;
        const preAccountActive = getAccActive()
        if (preAccountActive === accountId) {
            func.setReccentAccount({
                portfolio_name: accountName,
                portfolio_id: accountId,
                ...rest
            })
        }
        updateListPortfolioType({
            portfolio_name: accountName, portfolio_id: accountId, ...rest
        })
        dispatch(resetStateNewOrder())
        setReduxAccActive(accountId)
        setAccActive(accountId)
        setAccActiveLocalStorage(accountId)
        setSpaceTop && setSpaceTop()
        hideDetail && hideDetail()
        setSpaceTop && setTimeout(() => {
            dispatch(changeLoadingState(true))
            dispatch(resetPLState())
            getPortfolioTotal(accountId)
        }, 100)
        // Sub and unsub account reloadApp
        // Controller.subAndPubAccount(accountId)
        // // Set new Account
        // dataStorage.currentAccount = { account_name: accountName, account_id: accountId, ...rest }
        func.setReccentAccount({
            portfolio_name: accountName,
            portfolio_id: accountId,
            ...rest
        })
        // // Change current account on drawer
        // fbEmit.emit(CHANNEL.ACCOUNT, EVENT.UPDATE_SELECTED_ACCOUNT, {
        //     accountName,
        //     accountId,
        //     key
        // });
        // Dong Panel
    }, [])
    const renderItem = useCallback(({ index, item }) => {
        const { portfolio_id: accountId, portfolio_name: accountName } = item
        return <ItemAccount cbSelectAccount={selectedAccount} index={index} accountName={accountName} accountId={accountId} key={index} item={item} />
    })
    const renderNoData = useCallback(() => {
        return (
            <Text style={[CommonStyle.textNoData, { alignSelf: 'center' }]}>{I18n.t('noData')}</Text>
        )
    }, [])
    useOnListenClearRecent({ setData })
    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{
                paddingHorizontal: 8,
                paddingVertical: 8,
                flex: 1
            }}>
                <Animatable.View pointerEvents={'none'} duration={isLoading ? 1 : 500} animation={isLoading ? 'fadeIn' : 'fadeOut'} style={[StyleSheet.absoluteFillObject, { zIndex: 999, paddingVertical: 8 }]}>
                    <RowLoading style={{
                        paddingHorizontal: 8
                    }} isLoading={isLoading} data={fakeDataNews} />
                </Animatable.View>
                {
                    !isLoading && (
                        <Animatable.View animation={'fadeIn'} style={{ flex: 1 }}>
                            {
                                data.map((item, index) => renderItem({ index, item }))
                            }
                            {
                                data.length === 0 && (<View style={{ flex: 1, justifyContent: 'center' }} >{renderNoData()}</View>)
                            }
                        </Animatable.View>
                    )
                }
                {/* {
                    isLoading ? (<View style={{ height: heightDevice - 60 - 54.5, justifyContent: 'center' }} ><ActivityIndicator /></View>) : (
                        <View>
                            {
                                data.map((item, index) => renderItem({ index, item }))
                            }
                            {data.length === 0 && (<View style={{ height: data.length === 0 ? heightDevice - 60 - 54.5 : 0, justifyContent: 'center' }} >{renderNoData()}</View>)}
                            <View style={{ height: 200 }} />
                        </View>)
                } */}

                <HandleSearch updateResult={setData} />
            </View>
        </TouchableWithoutFeedback >

    )
}
function mapStateToProps(state) {
    const { isLoading } = state.searchAccount
    return {
        isLoading: isLoading
    }
}
export default connect(mapStateToProps)(SearchAccountContent)

export const styles = {}
function getNewestStyle() {
    const newStyle = StyleSheet.create({
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
        },
        boxSelected: {
            height: 32,
            width: 32,
            borderRadius: 100,
            justifyContent: 'center',
            alignItems: 'center'
        }
    });

    PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)
