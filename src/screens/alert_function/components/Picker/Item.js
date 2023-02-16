import React from 'react';
import { View, Text, TouchableWithoutFeedback, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import TouchableOpacityOpt from '~/component/touchableOpacityOpt/';
import Enum from '~/enum';
import Flag from '@component/flags/flag';
import I18n from '~/modules/language/'
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
const { width } = Dimensions.get('screen')
const RowItem = props => {
    const { onPress, keyTranslate, selected, isFlag, isFirst, el, rowStyle, isDisable } = props;
    let displayName = ''
    if (keyTranslate) {
        displayName = I18n.t(keyTranslate)
    } else if (el.label) {
        // Truong hop data dang [{label,value}]
        displayName = el.label
    } else {
        // Truong hop data truyen vao dang format ['ABC','BCD'] thi khong lay key dich ma hien thi luon el
        displayName = el
    }
    return (
        <TouchableOpacityOpt activeOpacity={isDisable ? 1 : 0.2} isDisable={isDisable} timeDelay={Enum.TIME_DELAY} activeOpacity={0} onPress={isDisable ? null : onPress} >
            <View style={[styles.rowContent, rowStyle, isFirst ? {} : { borderTopWidth: 1, borderTopColor: CommonStyle.fontWhite }]}>
                {
                    isFlag
                        ? <Flag
                            type="flat"
                            code={
                                displayName === Enum.mapLang.en
                                    ? 'GB'
                                    : displayName === Enum.mapLang.vi
                                        ? 'VI'
                                        : 'CN'}
                            size={18}
                        /> : null
                }
                <View style={{ marginLeft: isFlag ? 8 : 0, flex: 1, justifyContent: 'center' }}>
                    <Text numberOfLines={1} style={[styles.txtContent, {
                        color: isDisable ? CommonStyle.fontColor : selected ? CommonStyle.fontBlue1 : CommonStyle.fontColor,
                        opacity: isDisable ? 0.4 : 1,
                        fontSize: CommonStyle.fontSizeS
                    }]}>{displayName}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', paddingHorizontal: 8, width: 40 }}>{
                    selected
                        ? <Ionicons
                            size={20}
                            name='md-checkmark'
                            color={isDisable ? CommonStyle.fontColor : CommonStyle.fontBlue1}
                            style={{ opacity: isDisable ? 0.4 : 1 }}
                        />
                        : null
                }
                </View>
            </View>
        </TouchableOpacityOpt>
    )
};

const styles = {}

function getNewestStyle() {
    const newStyle = StyleSheet.create({
        rowContent: {
            paddingVertical: 16,
            // paddingHorizontal: 16,
            height: 56,
            flexDirection: 'row',
            justifyContent: 'center',
            width: 0.6 * width
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

export default RowItem;
