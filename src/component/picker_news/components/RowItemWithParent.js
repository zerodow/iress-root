import React, { useRef, useCallback, useState, PureComponent, useMemo, useEffect } from 'react';
import { Text, View, StyleSheet, Dimensions, TouchableWithoutFeedback, TouchableOpacity, FlatList, Platform } from 'react-native';
import { Navigation } from 'react-native-navigation';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { forEach, size, map } from 'lodash'
// Component
import PureCollapsible from '~/component/rn-collapsible/pure-collapsible.js'
import PureCollapsible2 from '~/component/collapsible/'
import AnimatedView, { ENUM as TYPE_ANIMATION } from '~/component/animation_view/index'
import * as Animatable from 'react-native-animatable'
// Style
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'

import * as setTestId from '~/constants/testId';
const { width: widthDevice, height: heightDevice } = Dimensions.get('window')
/**
 * Action collapsible
 * @param {*} refCollapsible
 */
const useHanldeExpand = ({ refCollapsible, setItemExpand, item, itemExpand }) => {
    const onChangeExpand = useCallback(() => {
        let newItemExpand = { ...itemExpand }
        if (newItemExpand[item.value]) {
            newItemExpand[item.value] = false
            refCollapsible && refCollapsible.current && refCollapsible.current.onClick && refCollapsible.current.collap()
        } else {
            newItemExpand[item.value] = true
            refCollapsible && refCollapsible.current && refCollapsible.current.onClick && refCollapsible.current.expand()

            // forEach(newItemExpand, (el, key) => {
            //     if (key !== item.value) {
            //         newItemExpand[key] = false
            //     }
            // })
        }
        setItemExpand(newItemExpand)
    }, [itemExpand])
    return [onChangeExpand]
}
/**
 * Action tich item cha
 * @param {*} selectedValue
 * @param {*} setSelectedValue
 * @param {*} item
 */
const useCheckAllParent = (selectedValue, setSelectedValue, item) => {
    const { label, value, children } = item
    const withParent = Array.isArray(children) && children.length > 0
    if (!withParent) return []
    const onCheckAllParent = useCallback(() => {
        let newSelected = { ...selectedValue }
        if (selectedValue[value]) {
            // Handle un check all
            newSelected[value] = false
            for (let index = 0; index < children.length; index++) {
                const element = children[index];
                newSelected[element.value] = false
            }
        } else {
            // Handle check all
            newSelected[value] = true
            for (let index = 0; index < children.length; index++) {
                const element = children[index];
                newSelected[element.value] = true
            }
        }
        setSelectedValue({ ...newSelected })
    }, [selectedValue])
    return [onCheckAllParent]
}
/**
 * Kiem tra xem tich tat ca cac item con chua
 * @param {*} selectedValue
 * @param {*} children
 */
const isCheckAllChildren = (selectedValue, children) => {
    let result = true
    for (let index = 0; index < children.length; index++) {
        const element = children[index];
        if (!selectedValue[element.value]) {
            return false
        }
    }
    return result
}
/**
 * Kiem tra xem khong chon item con nao
 * @param {*} selectedValue
 * @param {*} children
 */
const isNoneCheckChildren = (selectedValue, children) => {
    let result = true
    for (let index = 0; index < children.length; index++) {
        const element = children[index];
        if (selectedValue[element.value]) {
            return false
        }
    }
    return result
}
/**
 * Action tich item con
 * @param {*} param0
 */
const useCheckChildren = ({ parentItem, selectedValue, setSelectedValue, childrenItem, withChildren }) => {
    if (!withChildren) return []
    const onCheckChildren = useCallback(() => {
        let newSelectedValue = { ...selectedValue }
        if (selectedValue[childrenItem.value]) {
            // Handle UN check all
            newSelectedValue[childrenItem.value] = false
            const isNoneCheck = isNoneCheckChildren(newSelectedValue, parentItem.children)
            if (isNoneCheck) {
                newSelectedValue[parentItem.value] = false
            }
        } else {
            // Hanlde listener check all children
            newSelectedValue[childrenItem.value] = true
            newSelectedValue[parentItem.value] = true
            // const isCheckAll = isCheckAllChildren(newSelectedValue, parentItem.children)
            // if (isCheckAll) {
            //     newSelectedValue[parentItem.value] = true
            // }
        }
        setSelectedValue(newSelectedValue)
    }, [selectedValue])
    return [onCheckChildren]
}
/**
 * Save State PreExpand
 * @param {} param0
 */
function usePrevious({ itemExpand }) {
    const ref = useRef();
    useEffect(() => {
        ref.current = itemExpand
    });
    return ref.current;
}
/**
 * Action check only expand one
 * @param {*} param0
 */
const useCloseItemExpandOther = ({ itemExpand, setItemExpand, refCollapsible, item, preItemExpand }) => {
    // useEffect(() => {
    //     // console.log('DCM useCloseItemExpandOther pre', preItemExpand, itemExpand[item.value])
    //     // console.log('DCM useCloseItemExpandOther ', itemExpand, itemExpand[item.value])
    //     // if (preItemExpand && preItemExpand[item.value] && !itemExpand[item.value]) {
    //     //     refCollapsible && refCollapsible.current && refCollapsible.current.onClick && refCollapsible.current.onClick()
    //     // }
    //     if (itemExpand[item.value]) {
    //         refCollapsible && refCollapsible.current && refCollapsible.current.onClick && refCollapsible.current.onClick()
    //     }
    // }, [itemExpand])
}
const RowItemWithParent = React.memo(({ index, item, selectedValue, setSelectedValue, itemExpand, setItemExpand }) => {
    const { label, value, children } = item
    const refCollapsible = useRef(null)
    const prevCountRef = useRef();
    const [onChangeExpand] = useHanldeExpand({ refCollapsible, setItemExpand, item, itemExpand })
    const [onCheckAllParent] = useCheckAllParent(selectedValue, setSelectedValue, item)
    const preItemExpand = usePrevious({ itemExpand })

    // if (Array.isArray(children) && children.length > 0) {
    //     useCloseItemExpandOther({ itemExpand, setItemExpand, refCollapsible, item, preItemExpand })
    // }

    if (Array.isArray(children) && children.length > 0) {
        return <PureCollapsible2
            duration={300}
            animation={true}
            isExpand={itemExpand[value]}
            ref={refCollapsible}
            renderHeader={() => {
                return <Item
                    onCheckAllParent={onCheckAllParent}
                    onChangeExpand={onChangeExpand}
                    item={item}
                    style={{
                        borderTopWidth: index === 0 ? 0 : 1
                    }}
                    index={index}
                    selectedValue={selectedValue}
                    setSelectedValue={setSelectedValue}
                    itemExpand={itemExpand}
                    withParent={true} />
            }}
            renderContent={() => {
                return (
                    <View style={{ overflow: 'hidden' }}>
                        <Animatable.View
                            delay={50}
                            animation={'fadeInDown'}
                            duration={400}
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginHorizontal: 16
                            }}>
                            <View style={{
                                width: '100%'
                            }}>
                                {
                                    children.map((el, key) => (
                                        <Item
                                            key={key}
                                            withChildren={true}
                                            parentItem={item}
                                            style={{
                                                paddingVertical: 13,
                                                marginHorizontal: 0
                                            }} item={el}
                                            index={key}
                                            selectedValue={selectedValue}
                                            setSelectedValue={setSelectedValue} />
                                    ))
                                }
                            </View>
                        </Animatable.View>
                    </View>
                )
            }}
        />
    }
    return (
        <Item
            style={{
                borderTopWidth: index === 0 ? 0 : 1
            }}
            item={item}
            index={index}
            selectedValue={selectedValue}
            setSelectedValue={setSelectedValue}
        />
    )
}, () => false)
const Item = React.memo(({
    index,
    item,
    selectedValue,
    withParent,
    setSelectedValue,
    onChangeExpand,
    style,
    onCheckAllParent,
    parentItem,
    withChildren,
    itemExpand,
    key
}) => {
    const { label, value, children } = item
    const [onCheckChildren] = useCheckChildren({ parentItem, selectedValue, setSelectedValue, childrenItem: item, withChildren })
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity style={{ flex: 1 }} onPress={
                () => {
                    if (withParent) return onCheckAllParent && onCheckAllParent()
                    if (withChildren) return onCheckChildren && onCheckChildren()
                    let newSelected = { ...selectedValue }
                    if (newSelected[value]) {
                        newSelected[value] = false
                        return setSelectedValue(newSelected)
                    } else {
                        newSelected[value] = true
                        return setSelectedValue(newSelected)
                    }
                }
            } {...setTestId.testProp('Id_Modal_Select_Tag_Row', 'Label_Modal_Select_Tag_Row')} >
                <View style={[styles.rowContent, { borderTopWidth: 1, borderTopColor: CommonStyle.fontBorder }, { ...style }]}>
                    {
                        withChildren && (
                            <View style={{
                                width: '15%',
                                alignSelf: 'flex-start',
                                // paddingVertical: 13,
                                opacity: 0,
                                transform: [
                                    {
                                        translateX: widthDevice
                                    }
                                ]
                            }}>
                            </View>
                        )
                    }
                    <View style={{
                        width: '15%',
                        alignSelf: 'flex-start'
                    }}>
                        {
                            selectedValue[value]
                                ? <Ionicons {...setTestId.testProp(`Id_Modal_Select_Tag_${value}_check_box`, `Label_Modal_Select_Tag_${value}_check_box`)} size={24} name='ios-checkbox-outline' color={CommonStyle.fontColor} />
                                : <Ionicons {...setTestId.testProp(`Id_Modal_Select_Tag_${value}_check_box`, `Label_Modal_Select_Tag_${value}_check_box`)} size={24} name='md-square-outline' color={CommonStyle.fontColor} />
                        }
                    </View>
                    <View style={{ width: withParent ? '85%' : withChildren ? '70%' : '85%' }}>
                        <Text {...setTestId.testProp(`Id_Modal_Select_Tag_${value}_content`, `Label_Modal_Select_Tag_${value}_content`)} numberOfLines={2} style={[styles.txtContent, { color: CommonStyle.fontColor, fontSize: CommonStyle.fontSizeS }]}>{label}</Text>
                    </View>
                </View>
            </TouchableOpacity >
            <TouchableOpacity
                onPress={onChangeExpand}
                hitSlop={{
                    top: 16,
                    left: 16,
                    right: 16,
                    bottom: 16
                }} style={{ width: withParent ? 22 + 16 : 0, alignItems: 'flex-end', paddingRight: 16 }}>
                {
                    withParent ? itemExpand[value] ? (<Ionicons size={18} color={CommonStyle.borderBottomGray} name='ios-arrow-down' />)
                        : (<Ionicons size={18} color={CommonStyle.borderBottomGray} name='ios-arrow-forward' />) : null
                }
            </TouchableOpacity>
        </View>
    )
}, () => false)
export default RowItemWithParent
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
        }
    });

    PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)
