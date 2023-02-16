import React from 'react'
import { StyleSheet, Text, View, Dimensions } from 'react-native'
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import { useShadow } from '~/component/shadow/SvgShadow'
import Shadow from '~/component/shadow';
const { width: widthDevices, height: heightDevices } = Dimensions.get('window')
const OrderNumber = (props) => {
    const { orderNumber } = props
    const [BottomShadow, onLayout] = useShadow()
    return (
        <View onLayout={onLayout}>
            <Shadow setting={{
                width: widthDevices,
                height: 0,
                color: CommonStyle.color.shadow,
                border: 3,
                radius: 0,
                opacity: 0.5,
                x: 0,
                y: 0,
                style: {
                    zIndex: 9,
                    position: 'absolute',
                    backgroundColor: CommonStyle.backgroundColor,
                    top: 0,
                    left: 0,
                    right: 0
                }
            }} />
            <View style={styles.container}>
                <Text style={[styles.txtOrderNumber, { color: CommonStyle.fontColor }]}>Order Number</Text>
                <Text style={[styles.txtOrderNumber, { color: CommonStyle.color.modify }]}>{orderNumber}</Text>
            </View>
            <BottomShadow />
        </View>
    )
}

export default OrderNumber

const styles = {}
function getNewestStyle() {
	const newStyle = StyleSheet.create({

    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 8
    },
    txtOrderNumber: {
        fontFamily: CommonStyle.fontPoppinsRegular,
        fontSize: CommonStyle.font11
    }
})
PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)
