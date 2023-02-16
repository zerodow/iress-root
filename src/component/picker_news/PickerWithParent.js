import React, { useRef, useCallback, useState, PureComponent, useMemo } from 'react';
import { Text, View, StyleSheet, Dimensions, TouchableWithoutFeedback, TouchableOpacity, FlatList } from 'react-native';
import { Navigation } from 'react-native-navigation';
import Ionicons from 'react-native-vector-icons/Ionicons';
// Component
import PureCollapsible from '~/component/rn-collapsible/pure-collapsible.js'
import AnimatedView, { ENUM as TYPE_ANIMATION } from '~/component/animation_view/index'
import RowItemWithParent from './components/RowItemWithParent'
// Style
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'

import * as setTestId from '~/constants/testId';
const { width: widthDevice, height: heightDevice } = Dimensions.get('window')
function getMaxHeight({ x, y, w, h, pX, pY }) {
    return heightDevice - getPaddingTop({ x, y, w, h, pX, pY }) - 88 - 16 // 88 16 la bottomTab va cach bottom tab 16px
}
function getWidth({ x, y, w, h, pX, pY }) {
    return pX - 8
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
/**
 * Format data [{label,value,children:[{label,value}]}]
 */
const useHideCallBack = ({ refView, selectedValue, onSelectedDone }) => {
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
                onSelectedDone && onSelectedDone(selectedValue)
                Navigation.dismissModal({
                    animationType: 'none'
                })
            }, 500);
        }
    }, [selectedValue])
    return onHide
}

const PickerWithParent = ({
    data,
    size,
    onSelectedDone,
    selectedValue: currentSelectedValue,
    renderIcon
}) => {
    if (!size) return null
    const [selectedValue, setSelectedValue] = useState(currentSelectedValue || {})
    const defaultItemExpand = useMemo(() => {
        let tmp = {}
        for (let index = 0; index < data.length; index++) {
            const element = data[index];
            const children = element.children
            if (Array.isArray(children) && children.length > 0) {
                tmp[element.value] = true
            }
        }
        return tmp
    }, [])

    const [itemExpand, setItemExpand] = useState(defaultItemExpand)
    const refView = useRef(null)
    const onHide = useHideCallBack({ refView, selectedValue, onSelectedDone })
    return (
        (
            <TouchableWithoutFeedback onPress={onHide} >
                <View>
                    <AnimatedView ref={refView} type={TYPE_ANIMATION.FADE_IN} style={{
                        width: '100%',
                        height: '100%',
                        flexDirection: 'row',
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
                            backgroundColor: CommonStyle.color.dusk,
                            marginLeft: 16,
                            marginRight: getMarginRight(size),
                            borderRadius: 8
                        }}>
                            <FlatList
                                showsVerticalScrollIndicator={false}
                                style={{
                                    flexGrow: 0
                                }}
                                data={data}
                                renderItem={(params) => {
                                    return (
                                        <RowItemWithParent
                                            setItemExpand={setItemExpand}
                                            itemExpand={itemExpand}
                                            selectedValue={selectedValue}
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

export default PickerWithParent;
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
