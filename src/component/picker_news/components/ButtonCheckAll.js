
import React, { useRef, useCallback, useState, useMemo } from 'react';
import { Text, View, StyleSheet, Dimensions, TouchableWithoutFeedback, TouchableOpacity, FlatList } from 'react-native';
import { Navigation } from 'react-native-navigation';
import Ionicons from 'react-native-vector-icons/Ionicons';
import IconFeather from 'react-native-vector-icons/Feather'
import { forEach, size, map } from 'lodash'
// Component
import AnimatedView, { ENUM as TYPE_ANIMATION } from '~/component/animation_view/index'
// Style
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'

import * as setTestId from '~/constants/testId';
const { width: widthDevice, height: heightDevice } = Dimensions.get('window')
const useOnPressCheckAll = (selectedValue, setSelectedValue, data) => {
    return useCallback(() => {
        let newSelected = {}
        Array.isArray(data) && data.forEach((el) => {
            newSelected[el.value] = true
        })

        setSelectedValue({ ...newSelected })
    }, [])
}
export default ButtonCheckAll = ({ selectedValue, data, setSelectedValue }) => {
    const sizeSelected = useMemo(() => {
        let tmp = 0
        forEach(selectedValue, (val) => {
            if (val) {
                tmp++
            }
        })
        return tmp
    }, [selectedValue])
    // const sizeSelected = size(selectedValue)
    const sizeData = Array.isArray(data) && data.length
    const onPressAll = useOnPressCheckAll(selectedValue, setSelectedValue, data)
    if (sizeSelected === 0) {
        return (
            <TouchableOpacity {...setTestId.testProp('Id_News_Modal_Tag_Checkbox_All', 'Label_News_Modal_Tag_Checkbox_All')} onPress={onPressAll}>
                <Ionicons name={'md-square-outline'} color={CommonStyle.fontColor} size={24} />
            </TouchableOpacity>
        )
    }
    if (sizeSelected > 0 && sizeSelected < sizeData) {
        return (
            <TouchableOpacity onPress={this.handleClear} {...setTestId.testProp('Id_News_Modal_Tag_Checkbox_All', 'Label_News_Modal_Tag_Checkbox_All')}>
                <IconFeather name={'minus-square'} style={{ marginLeft: -2 }} color={CommonStyle.fontColor} size={23} />
            </TouchableOpacity>
        )
    } else {
        return (
            <TouchableOpacity {...setTestId.testProp('Id_News_Modal_Tag_Checkbox_All', 'Label_News_Modal_Tag_Checkbox_All')} onPress={this.handleClear}>
                <Ionicons name={'ios-checkbox-outline'} style={{ marginLeft: -2 }} color={CommonStyle.fontColor} size={24} />
            </TouchableOpacity>
        )
    }
}
