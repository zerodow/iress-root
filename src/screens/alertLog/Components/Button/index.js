import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import TouchableOpacityOpt from '~/component/touchableOpacityOpt/'
import CommonStyle from '~/theme/theme_controller'
const Button = ({ value, widthButton, textStyle }) => {
    return (
        <TouchableOpacityOpt style={{
            width: widthButton,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 16,
            borderWidth: 1,
            borderColor: CommonStyle.fontDark3
        }}>
            <Text style={[{
                fontSize: CommonStyle.fontSizeM,
                textAlign: 'center',
                paddingVertical: 6,
                color: CommonStyle.color.modify,
                fontWeight: 'bold'
            }, textStyle]}>{value}</Text>
        </TouchableOpacityOpt>
    )
}

export default Button

const styles = StyleSheet.create({})
