import React, { useCallback, useEffect, useRef } from 'react'
import { View, Text } from 'react-native'
import CommonStyle from '~/theme/theme_controller'
import Icon2 from './Icon2'
import TouchableOpacityOpt from '~/component/touchableOpacityOpt/'

const CategoriesWLButton = props => {
    const { navigator } = props
    const dic = useRef({})
    const showCategoriesWL = () => {
        if (!dic.current.mount) return // prevent multi click until laggy
        dic.current.mount = false
        const screen = 'equix.CategoriesWL'
        navigator && navigator.push({
            screen,
            navigatorStyle: {
                disabledBackGesture: true,
                ...CommonStyle.navigatorSpecialNoHeader
            },
            passProps: {},
            animated: true,
            animationType: 'slide-horizontal'
        })
    }
    const onNavigatorEvent = useCallback((event) => {
        switch (event.id) {
            case 'willAppear':
                dic.current.mount = true
                break;
            default:
                break;
        }
    })

    useEffect(() => {
        navigator && navigator.addOnNavigatorEvent(onNavigatorEvent);
    }, [])

    return <TouchableOpacityOpt
        onPress={showCategoriesWL}
        style={{ marginLeft: 16 }}>
        <Icon2
            color={CommonStyle.fontColor}
            size={28}
            name="changeWatchlist"
        />
    </TouchableOpacityOpt>
}

export default CategoriesWLButton
