import React from 'react'
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native'
import CommonStyle from '~/theme/theme_controller'
import Ionicons from 'react-native-vector-icons/Ionicons';
import Shadow from '~/component/shadow';
const { width: widthDevices, height: heightDevices } = Dimensions.get('window')
const ButtonConfirmOrder = (props) => {
    const { backgroundColor, title, onPress } = props
    return (
        <View>
            <View>
                <Shadow setting={{
                    width: widthDevices - 32,
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
            </View>
            <TouchableOpacity onPress={onPress} style={[{
                flexDirection: 'row',
                borderRadius: 8,
                alignItems: 'center',
                backgroundColor: backgroundColor,
                paddingHorizontal: 16,
                marginHorizontal: 24,
                marginVertical: 8
            }]}>
                <View style={{
                    flexDirection: 'row',
                    flex: 1,
                    justifyContent: 'center'
                }}>
                    <Text style={{
                        color: CommonStyle.fontBlack,
                        fontFamily: CommonStyle.fontPoppinsBold,
                        fontSize: CommonStyle.font15,
                        paddingVertical: 13
                    }}>{title}</Text>
                </View>
                <Ionicons name={'md-send'} size={26} color={CommonStyle.fontBlack} />
            </TouchableOpacity>
        </View>
    )
}

export default ButtonConfirmOrder

const styles = StyleSheet.create({})
