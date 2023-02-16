import React, { useState, useCallback, useRef, useMemo } from 'react';
import { View } from 'react-native';
import * as fbEmit from '~/emitter';
import { ScrollView } from 'react-native-gesture-handler'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import BoxAccount from './BoxAccount';

import Enum from '~/enum'
import { dataStorage } from '~/storage';
import AsyncStorage from '~/manage/manageLocalStorage'
import * as Controller from '~/memory/controller';
let dataAccountFake = []
let names = [
    'Account Default',
    'FUTURE_ACCOUNT'
]
for (let index = 0; index < 2; index++) {
    dataAccountFake.push(
        {
            key: index,
            accountId: index === 0 ? '123457' : '020001',
            accountName: names[index],
            currency: 'AUD'
        }
    )
}
const { TYPE_SEARCH_ACCOUNT: { ABOVE_FIVE_ACCOUNT, LESS_FIVE_ACCOUNT, SINGLE } } = Enum

const IconSearchAccount = () => {
    return (
        <MaterialCommunityIcons name='account-search' size={22} color={'white'} />
    )
}
const fakeAccount = []
for (let index = 0; index < 8; index++) {
    fakeAccount.push({
        accountId: `1234567#${index}`,
        accountName: `Quant Edge Pty Ltd ${index}`
    })
}
function createNewArray(item, listItem) {
    let tmp = listItem.filter(el => el.account_id !== item.account_id)
    return [item, ...tmp]
}
const ListAccount = ({
    children, style, symbol, ...rest
}) => {
    const refScrollView = useRef(null)
    const listAccount = useMemo(() => {
        return Controller.getListAccount()
    }, [])
    const [currentAccount, setCurrentAccount] = useState(dataStorage.currentAccount || listAccount[0])
    const [data, setData] = useState(createNewArray(currentAccount, listAccount))
    const setSelectedAccount = useCallback((selectedAccount) => {
        dataStorage.currentAccount = selectedAccount
        fbEmit.emit('account', 'update', selectedAccount);
        const newData = createNewArray(selectedAccount, listAccount)
        setData(newData)
        setCurrentAccount(selectedAccount)
        const userId = Controller.getUserId();
        AsyncStorage.setItem(`last_account_${userId}`, JSON.stringify(selectedAccount)).then(() => {
        }).catch(error => {
            console.log(`Save last account error: ${error}`)
        });
        refScrollView && refScrollView.current.scrollTo && refScrollView.current.scrollTo({ x: 0, y: 0, animated: true })
    }, [])
    return (
        <View style={style}>
            <ScrollView
                ref={refScrollView}
                waitFor={rest.refVerticalScroll}
                showsHorizontalScrollIndicator={false}
                horizontal
                style={{
                    paddingLeft: 8
                }}
            >
                {
                    data.map((el, index) => {
                        return (
                            <BoxAccount
                                symbol={symbol}
                                key={`BoxAccount#index`}
                                isSelected={currentAccount.account_id === el.account_id}
                                {...el}
                                {...{ currentAccount, setCurrentAccount: setSelectedAccount, el }}
                                accountId={el.account_id}
                                accountName={el.account_name}
                                key={index}
                            />
                        )
                    })
                }
            </ScrollView>
        </View>
    )
};

export default ListAccount;
