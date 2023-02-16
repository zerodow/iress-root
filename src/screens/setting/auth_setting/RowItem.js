import React from 'react';
import { View, Text, TouchableWithoutFeedback, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Flag from '@component/flags/flag';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'

const RowItem = props => {
    const { onPress, title, selected, isFlag } = props;

    return (
        <TouchableWithoutFeedback onPress={onPress}>
            <View style={styles.rowContent}>
                {isFlag ? <Flag
                    type="flat"
                    code={title === 'English' ? 'GB'
                        : title === 'Tiếng Việt' ? 'VN' : 'CN'}
                    size={18}
                /> : null}
                <View style={{}}>
                    <Text style={[styles.txtContent, { marginLeft: 8, color: selected ? CommonStyle.fontBlue : CommonStyle.fontColor, fontSize: CommonStyle.font13 }]}>{title}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', paddingLeft: 16 }}>{
                    selected
                        ? <Ionicons size={15} name='md-checkmark' color={CommonStyle.fontBlue} />
                        : null
                }
                </View>
            </View>
        </TouchableWithoutFeedback>
    )
};

const styles = {}

function getNewestStyle() {
    const newStyle = StyleSheet.create({
        rowContent: {
            paddingVertical: 14.5,
            flexDirection: 'row'
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
