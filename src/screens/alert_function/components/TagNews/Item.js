import React from 'react';
import { View, Text, TouchableWithoutFeedback, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Flag from '@component/flags/flag';
import I18n from '~/modules/language/'
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import { getIcon } from '~s/alert_function/functionCommon';
import * as setTestId from '~/constants/testId';
const { width } = Dimensions.get('screen')
const RowItem = props => {
    const { onPress, keyTranslate, selected, isFlag, isFirst, tagKey } = props;
    // {...setTestId.testProp(`Id_Modal_Select_Tag_${key}`, `Label_Modal_Select_Tag_${key}`)}

    return (
        <TouchableOpacity {...setTestId.testProp('Id_Modal_Select_Tag_Row', 'Label_Modal_Select_Tag_Row')} onLayout={props.handleSetLayoutItem} onPress={onPress}>
            <View style={[styles.rowContent, { borderTopWidth: 1, borderTopColor: CommonStyle.fontBorder }]}>
                <View style={{ paddingRight: 16 }}>
                    {
                        selected
                            ? <Ionicons {...setTestId.testProp(`Id_Modal_Select_Tag_${tagKey}_check_box`, `Label_Modal_Select_Tag_${tagKey}_check_box`)} size={24} name='ios-checkbox-outline' color={CommonStyle.fontColor} />
                            : <Ionicons {...setTestId.testProp(`Id_Modal_Select_Tag_${tagKey}_check_box`, `Label_Modal_Select_Tag_${tagKey}_check_box`)} size={24} name='md-square-outline' color={CommonStyle.fontColor} />
                    }
                </View>
                <View>
                    {/* <Ionicons style={{ paddingHorizontal: 8 }} size={24} color={CommonStyle.fontColor} name={'ios-git-compare'} /> */}
                    {getIcon(tagKey, null, { paddingLeft: 3 })}
                </View>
                <View style={{ paddingLeft: 16, flex: 1 }}>
                    <Text {...setTestId.testProp(`Id_Modal_Select_Tag_${tagKey}_content`, `Label_Modal_Select_Tag_${tagKey}_content`)} numberOfLines={2} style={[styles.txtContent, { color: CommonStyle.fontColor, fontSize: CommonStyle.fontSizeS }]}>{I18n.t(keyTranslate)}</Text>
                </View>

            </View>
        </TouchableOpacity>
    )
};

const styles = {}

function getNewestStyle() {
    const newStyle = StyleSheet.create({
        rowContent: {
            paddingVertical: 13,
            marginHorizontal: 16,
            flexDirection: 'row',
            // justifyContent: 'center',
            alignItems: 'center',
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
