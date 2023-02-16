import React, { useRef, useCallback, useState, useMemo, useImperativeHandle } from 'react';
import {
    Text, View, StyleSheet, Dimensions, TouchableWithoutFeedback,
    TouchableOpacity, FlatList
} from 'react-native';
import { Navigation } from 'react-native-navigation';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather'
import { forEach, size, map } from 'lodash'
// Component
import AnimatedView, { ENUM as TYPE_ANIMATION } from '~/component/animation_view/index'
import ButtonCheckAll from './components/ButtonCheckAll'
// Style
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'

import * as setTestId from '~/constants/testId';
import Selection from '../Selection/SelectionModal';
const { width: widthDevice, height: heightDevice } = Dimensions.get('window')
function getMaxHeight({ x, y, w, h, pX, pY }) {
    return heightDevice - getPaddingTop({ x, y, w, h, pX, pY }) - 88 - 16
}
function getWidth({ x, y, w, h, pX, pY }) {
    return pX - 16
}
function getPaddingTop({ x, y, w, h, pX, pY }) {
    return h + pY
}
function getPaddingTopIcon({ x, y, w, h, pX, pY }) {
    return pY
}
function getMarginRight({ x, y, w, h, pX, pY }) {
    return widthDevice - pX - 16
}

const TICK_STATUS = {
    UNTICK_ALL: 0,
    TICK_ALL: 1,
    TICK_SOME: 2
}

const ItemAll = React.forwardRef(({ label, selectedValue, setSelectedValue }, ref) => {
    /*
    STATUS VALUE:
        0: untick all
        1: tick all
        2: tick some of all
    */
    const [status, setStatus] = useState(() => {
        let numberSelected = 0
        const listKey = Object.keys(selectedValue)
        const length = listKey.length
        listKey.map(item => {
            const selected = selectedValue[item]
            selected && numberSelected++
        })
        console.info('Item All', numberSelected, selectedValue)
        return numberSelected === 0
            ? TICK_STATUS.UNTICK_ALL
            : numberSelected === length
                ? TICK_STATUS.TICK_ALL
                : TICK_STATUS.TICK_SOME
    })
    const icon = useMemo(() => {
        switch (status) {
            case TICK_STATUS.TICK_ALL:
                return <Ionicons
                    size={24}
                    name='ios-checkbox-outline'
                    color={CommonStyle.fontColor} />
            case TICK_STATUS.UNTICK_ALL:
                return <Ionicons
                    size={24}
                    name='md-square-outline'
                    color={CommonStyle.fontColor} />
            default:
                return <Feather
                    size={22.5}
                    name='minus-square'
                    style={{ marginLeft: -2, marginTop: 1 }}
                    color={CommonStyle.fontColor} />
        }
    }, [status])
    const syncItem = (status) => {
        const statusAll = status === 1
        let newSelected = { ...selectedValue }
        Object.keys(newSelected).map(item => {
            newSelected[item] = statusAll
        })
        return setSelectedValue(newSelected)
    }
    const onPress = useCallback(() => {
        /* 1 -> 0 -> 1 --------- 2 -> 1 -> 0 -> 1 */
        let newStatus = TICK_STATUS.TICK_ALL
        if (status === TICK_STATUS.TICK_ALL) {
            newStatus = TICK_STATUS.UNTICK_ALL
        }
        syncItem(newStatus)
        setStatus(newStatus)
    }, [status])
    useImperativeHandle(ref, () => {
        return { setStatus }
    })
    return (
        <TouchableOpacity
            onPress={onPress}>
            <View style={[styles.rowContent, { borderTopWidth: 0, borderTopColor: CommonStyle.fontBorder }]}>
                <View style={{ width: '20%', alignSelf: 'flex-start' }}>
                    {icon}
                </View>
                <View style={{ width: '80%' }}>
                    <Text
                        numberOfLines={2}
                        style={[styles.txtContent, { color: CommonStyle.fontColor, fontSize: CommonStyle.fontSizeS }]}>
                        {label}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    )
})

const Item = React.memo(({ item, selectedValue, setSelectedValue, syncItemAll }) => {
    const { label, value } = item
    const onPress = () => {
        let newSelected = { ...selectedValue }
        if (selectedValue[value]) {
            newSelected[value] = false
            setSelectedValue(newSelected)
        } else {
            newSelected[value] = true
            setSelectedValue(newSelected)
        }
        // Sync Item all
        let numberSelected = 0
        const listKey = Object.keys(newSelected)
        const length = listKey.length
        listKey.map(item => {
            const selected = newSelected[item]
            selected && numberSelected++
        })
        const status = numberSelected === length
            ? TICK_STATUS.TICK_ALL
            : numberSelected === 0
                ? TICK_STATUS.UNTICK_ALL
                : TICK_STATUS.TICK_SOME
        return syncItemAll(status)
    }
    return (
        <TouchableOpacity
            onPress={onPress}
            {...setTestId.testProp('Id_Modal_Select_Tag_Row', 'Label_Modal_Select_Tag_Row')} >
            <View style={[styles.rowContent, { borderTopWidth: 1, borderTopColor: CommonStyle.lineColor2 }]}>
                <View style={{ width: '20%', alignSelf: 'flex-start' }}>
                    {
                        selectedValue[value]
                            ? <Ionicons {...setTestId.testProp(`Id_Modal_Select_Tag_${value}_check_box`, `Label_Modal_Select_Tag_${value}_check_box`)} size={24} name='ios-checkbox-outline' color={CommonStyle.fontColor} />
                            : <Ionicons {...setTestId.testProp(`Id_Modal_Select_Tag_${value}_check_box`, `Label_Modal_Select_Tag_${value}_check_box`)} size={24} name='md-square-outline' color={CommonStyle.fontColor} />
                    }
                </View>
                <View style={{ width: '80%' }}>
                    <Text {...setTestId.testProp(`Id_Modal_Select_Tag_${value}_content`, `Label_Modal_Select_Tag_${value}_content`)} numberOfLines={2} style={[styles.txtContent, { color: CommonStyle.fontColor, fontSize: CommonStyle.fontSizeS }]}>{label}</Text>
                </View>

            </View>
        </TouchableOpacity>
    )
}, () => false)
/**
 * Format data [{label,value}]
 */
const useHideCallBack = ({ refView, onSelectedDone, selectedValue }) => {
    const onHide = useCallback(() => {
        try {
            refView && refView.current.animate({
                type: TYPE_ANIMATION.FADE_OUT
            })
            setTimeout(() => {
                onSelectedDone && onSelectedDone(selectedValue)
                Navigation.dismissModal({
                    animationType: 'none'
                })
            }, 500);
        } catch (error) {
            setTimeout(() => {
                Navigation.dismissModal({
                    animationType: 'none'
                })
            }, 500);
        }
    }, [selectedValue])
    return onHide
}
const PickerWithoutParent = ({
    data,
    size,
    onSelectedDone,
    selectedValue: currentSelectedValue,
    right,
    labelItemAll,
    renderIcon
}) => {
    if (!size) return null
    const [selectedValue, setSelectedValue] = useState(currentSelectedValue || {})
    const refView = useRef(null)
    const refItemAll = useRef()
    const onHide = useHideCallBack({ refView, onSelectedDone, selectedValue })
    const syncItemAll = useCallback((status) => {
        refItemAll.current.setStatus && refItemAll.current.setStatus(status)
    }, [])
    return (
        (
            <TouchableWithoutFeedback onPress={onHide} >
                <View>
                    <AnimatedView ref={refView} type={TYPE_ANIMATION.FADE_IN} style={{
                        width: '100%',
                        height: '100%',
                        justifyContent: 'flex-start'
                    }}
                        styleContent={{
                            backgroundColor: CommonStyle.backgroundColorPopup

                        }}
                        forceStyle={{
                            overflow: 'visible'
                        }}
                    >
                        {
                            renderIcon && (
                                <View style={{
                                    marginLeft: 16,
                                    marginTop: getPaddingTopIcon(size),
                                    marginRight: right || getMarginRight(size),
                                    justifyContent: 'flex-end',
                                    alignItems: 'flex-end'
                                }}>
                                    {renderIcon && renderIcon()}
                                </View>
                            )
                        }

                        <View style={{
                            maxHeight: getMaxHeight(size),
                            alignSelf: 'flex-end',
                            marginTop: renderIcon ? 0 : getPaddingTop(size),
                            backgroundColor: CommonStyle.color.dusk_tabbar,
                            marginLeft: 16,
                            marginRight: right || getMarginRight(size),
                            borderRadius: 8
                        }}>
                            <ItemAll
                                ref={refItemAll}
                                label={labelItemAll}
                                selectedValue={selectedValue}
                                setSelectedValue={setSelectedValue} />
                            <FlatList
                                showsVerticalScrollIndicator={false}
                                style={{
                                    flexGrow: 0
                                }}
                                data={data}
                                renderItem={(params) => {
                                    return (
                                        <Item
                                            selectedValue={selectedValue}
                                            syncItemAll={syncItemAll}
                                            setSelectedValue={setSelectedValue}
                                            {...params} />
                                    )
                                }}
                            />
                        </View>
                    </AnimatedView>
                </View>
            </TouchableWithoutFeedback>
        )
    )
};

export default PickerWithoutParent;
const styles = {}

function getNewestStyle() {
    const newStyle = StyleSheet.create({
        rowContent: {
            paddingVertical: 13,
            marginHorizontal: 16,
            flexDirection: 'row',
            // justifyContent: 'center',
            alignItems: 'center'
        },
        txtContent: {
            color: CommonStyle.fontBlack,
            fontSize: CommonStyle.fontSizeS,
            fontFamily: CommonStyle.fontPoppinsRegular
        },
        btn: {
            paddingVertical: 8,
            paddingHorizontal: 16
        }
    });

    PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)
