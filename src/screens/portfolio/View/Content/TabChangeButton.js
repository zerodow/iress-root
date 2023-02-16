import React, { useState, useCallback, useImperativeHandle } from 'react'
import {
    View, Text, TouchableOpacity
} from 'react-native'
import CommonStyle from '~/theme/theme_controller'

const Dot = ({ tabActive, onChangeTab, index }) => {
    const onPress = () => {
        onChangeTab && onChangeTab(index)
    }
    return <TouchableOpacity
        hitSlop={{
            top: 16,
            right: 16,
            bottom: 16,
            left: 16
        }}
        onPress={onPress}
        style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            marginTop: 4,
            marginBottom: 8,
            backgroundColor: tabActive === index
                ? CommonStyle.color.modify
                : CommonStyle.backgroundColor1
        }} />
}

const TabChangeButton = React.forwardRef(({ scrollToBegin, scrollToEnd }, ref) => {
    const [tabActive, setTabActive] = useState(0)
    const onChangeTab = useCallback((index) => {
        if (tabActive === index) return
        if (index) {
            scrollToEnd && scrollToEnd()
        } else {
            scrollToBegin && scrollToBegin()
        }
        setTabActive(index)
    }, [tabActive])
    useImperativeHandle(ref, () => {
        return {
            setTabActive
        }
    })
    return <View
        style={{
            zIndex: 10,
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
            backgroundColor: CommonStyle.color.dark
        }}>
        <Dot
            tabActive={tabActive}
            onChangeTab={onChangeTab}
            index={0} />
        <View style={{ width: 16 }} />
        <Dot
            tabActive={tabActive}
            onChangeTab={onChangeTab}
            index={1} />
    </View>
})

export default TabChangeButton
