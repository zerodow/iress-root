import React from 'react'
import { View, Text } from 'react-native'
import Ionicons from 'react-native-vector-icons/Ionicons';
import TouchableOpacityOpt from '~/component/touchableOpacityOpt/';
import CommonStyle from '~/theme/theme_controller';

const IconClone = (props) => {
    const { onPress, opacity } = props
    return (
        <TouchableOpacityOpt
            onPress={onPress}
            style={{
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <View
                style={{
                    borderRadius: 48,
                    width: 18,
                    height: 18,
                    backgroundColor: CommonStyle.color.dusk,
                    alignContent: 'center',
                    justifyContent: 'center',
                    alignItems: 'center',
                    opacity: opacity
                }}
            >
                <Ionicons
                    name="md-close"
                    color={CommonStyle.backgroundColor}
                    style={{ textAlign: 'center' }}
                    size={12}
                />
            </View>
        </TouchableOpacityOpt>
    )
}

export default IconClone
