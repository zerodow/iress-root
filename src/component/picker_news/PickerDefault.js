import React, { useRef, useCallback, useState } from 'react';
import { Text, View, StyleSheet, Dimensions, TouchableWithoutFeedback, TouchableOpacity, FlatList } from 'react-native';
import { Navigation } from 'react-native-navigation';
import Ionicons from 'react-native-vector-icons/Ionicons';
// Component
import AnimatedView, { ENUM as TYPE_ANIMATION } from '~/component/animation_view/index'
// Style
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'

import * as setTestId from '~/constants/testId';
const { width: widthDevice, height: heightDevice } = Dimensions.get('window')
function getMaxHeight({ x, y, w, h, pX, pY }) {
    return heightDevice - getPaddingTop({ x, y, w, h, pX, pY }) - 88 - 16
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

const Item = React.memo(({ index, item, selectedValue, setSelectedValue }) => {
    const { label, value } = item
    return (
        <TouchableOpacity onPress={() => setSelectedValue(value)} {...setTestId.testProp('Id_Modal_Select_Tag_Row', 'Label_Modal_Select_Tag_Row')} >
            <View style={[styles.rowContent, { borderTopWidth: index === 0 ? 0 : 1, borderTopColor: CommonStyle.lineColor2, justifyContent: 'space-between' }]}>
                <Text {...setTestId.testProp(`Id_Modal_Select_Tag_${value}_content`, `Label_Modal_Select_Tag_${value}_content`)} numberOfLines={2} style={[styles.txtContent, { color: selectedValue === value ? CommonStyle.fontBlue1 : CommonStyle.fontColor, fontSize: CommonStyle.fontSizeS }]}>{label}</Text>
                {
                    selectedValue === value ? (
                        <Ionicons
                            size={24}
                            name='md-checkmark'
                            color={CommonStyle.fontBlue1}
                            style={{ opacity: 1, paddingLeft: 8 }}
                        />
                    ) : (
                            <Ionicons
                                size={24}
                                name='md-checkmark'
                                color={CommonStyle.fontBlue1}
                                style={{ opacity: 0, paddingLeft: 8 }}
                            />
                        )
                }

            </View>
        </TouchableOpacity>
    )
}, () => false)
/**
 *  format data [{
 *      label,
 *      value
 * }]
 */
const useHideCallBack = (refView, onSelectedDone) => {
    const onHide = useCallback((selectedValue) => {
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
    }, [])
    return onHide
}
const useSelectedValue = (setSelectedValue, onHide) => {
    const onSetSelectedValue = useCallback((selectedValue) => {
        setSelectedValue && setSelectedValue(selectedValue)
        onHide && onHide(selectedValue)
    }, [])
    return [onSetSelectedValue]
}
const PickerDefault = (props) => {
    const {
        data,
        size,
        onSelectedDone,
        selectedValue: currentvalue,
        right,
        renderIcon
    } = props
    if (!size) return null
    const [selectedValue, setSelectedValue] = useState(currentvalue || null)
    const refView = useRef(null)
    const onHide = useHideCallBack(refView, onSelectedDone)
    const [onSetSelectedValue] = useSelectedValue(setSelectedValue, onHide)
    return (
        (
            <TouchableWithoutFeedback onPress={() => onHide(selectedValue)} >
                <View>
                    <AnimatedView ref={refView} type={TYPE_ANIMATION.FADE_IN} style={{
                        width: '100%',
                        height: '100%',
                        flexDirection: 'row',
                        justifyContent: 'flex-end'
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
                            // width: getWidth(size),
                            alignSelf: 'flex-end',
                            marginTop: renderIcon ? 0 : getPaddingTop(size),
                            backgroundColor: CommonStyle.color.dusk_tabbar,
                            marginLeft: 16,
                            marginRight: right || getMarginRight(size),
                            borderRadius: 8,
                            minWidth: 172
                        }}>
                            <FlatList
                                showsVerticalScrollIndicator={false}
                                style={{
                                    flexGrow: 0
                                }}
                                data={data}
                                renderItem={(params) => {
                                    return (
                                        <Item selectedValue={selectedValue} setSelectedValue={onSetSelectedValue} {...params} />
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

export default PickerDefault;
const styles = {}

function getNewestStyle() {
    const newStyle = StyleSheet.create({
        rowContent: {
            paddingVertical: 13,
            marginHorizontal: 16,
            flexDirection: 'row',
            // justifyContent: 'center',
            alignItems: 'center',
            justifyContent: 'space-around'
            // flex: 1
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
