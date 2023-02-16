import React from 'react'
import { View, Text } from 'react-native'
import CommonStyle from '~/theme/theme_controller'
import * as Business from '~/business'
import Enum from '~/enum';
const RowProductClass = ({ value: classSymbol = Enum.SYMBOL_CLASS.EQUITY }) => {
    const { text, color } = Business.getClassTagProperty({ classSymbol })
    return (

        <View style={{
            borderRadius: 7,
            backgroundColor: color,
            alignItems: 'center',
            justifyContent: 'center',
            marginHorizontal: 4

        }
        } >
            <Text style={{
                fontFamily: CommonStyle.fontPoppinsBold,
                fontSize: CommonStyle.font7,
                color: CommonStyle.fontBlack,
                paddingHorizontal: 4
            }}>
                {text}
            </Text>
        </View >
    )
}

export default RowProductClass
