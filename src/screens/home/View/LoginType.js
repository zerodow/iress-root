import React, { useCallback, useMemo, useEffect } from 'react'
import {
    View, Text, TouchableOpacity
} from 'react-native'
import CommonStyle from '~/theme/theme_controller'
import I18n from '~/modules/language/'
import { setLoginType, getListLoginType } from '~/screens/home/Model/LoginModel.js'
import TabView, { useRefTabView } from '~/component/tabview4/'
import { useShadow } from '~/component/shadow/SvgShadow'
import { dataStorage } from '~/storage'
import Enum from '~/enum'
const { LOGIN_TYPE } = Enum
const Type = ({ title, onPress }) => {
    return <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }}>
        <TouchableOpacity onPress={onPress}>
            <Text style={{
                textAlign: 'center',
                fontSize: CommonStyle.font15,
                color: CommonStyle.color.modify,
                fontFamily: CommonStyle.fontPoppinsRegular
            }}>
                {title}
            </Text>
        </TouchableOpacity>
    </View>
}
const TABS = [
    {
        label: 'emailLogin'
    },
    {
        label: 'oktaLogin'
    }
]

const LoginType = ({ setLoginType: changeLoginType, loginType, listLoginType = [], regionAccess }) => {
    const { refTabView, changeTab, setTabActive } = useRefTabView()
    const handleSelectLoginDefault = useCallback(() => {
        dataStorage.isOkta = false
        setLoginType(LOGIN_TYPE.DEFAULT)
        changeLoginType(LOGIN_TYPE.DEFAULT)
    }, [])
    const handleSelectLoginOkata = useCallback(() => {
        dataStorage.isOkta = true
        setLoginType(LOGIN_TYPE.OKTA)
        changeLoginType(LOGIN_TYPE.OKTA)
    }, [])
    const onChangeTabTabView = useCallback((activeTab) => {
        if (activeTab) {
            handleSelectLoginOkata()
        } else {
            handleSelectLoginDefault()
        }
    }, [])
    useMemo(() => {
        dataStorage.isOkta = loginType === LOGIN_TYPE.OKTA
    }, [loginType])
    useEffect(() => {
        dataStorage.isOkta = loginType === LOGIN_TYPE.OKTA
        setTabActive && setTabActive(loginType === LOGIN_TYPE.DEFAULT ? 0 : 1)
    }, [loginType])
    const [Shadow, onLayout] = useShadow()
    if (regionAccess && regionAccess.length === 1) return null
    return (
        <View style={{
            zIndex: 9999
        }}>
            <Shadow />
            <TabView
                ref={refTabView}
                onLayout={onLayout}
                tabs={listLoginType}
                activeTab={0}
                onChangeTab={onChangeTabTabView}
                replaceTextTabStyleDefault={{
                    color: CommonStyle.color.modify,
                    opacity: 0.7
                }}
                textTabStyle={{
                    textAlign: 'center',
                    fontSize: CommonStyle.font15,
                    color: CommonStyle.color.modify,
                    fontFamily: CommonStyle.fontPoppinsRegular
                }}
                wrapperStyle={{
                    backgroundColor: CommonStyle.backgroundColor2,
                    justifyContent: 'space-around'
                }}
            />
        </View>
    )
    return <View style={{
        height: 39,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center'
    }}>
        <Type onPress={handleSelectLoginDefault} title={I18n.t('emailLogin')} />
        <Type onPress={handleSelectLoginOkata} title={I18n.t('zzzzz')} />
    </View>
}

export default LoginType
