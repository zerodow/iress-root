import React, { } from 'react'
import {
    View, Text
} from 'react-native'
import CommonStyle from '~/theme/theme_controller'
import I18n from '~/modules/language/'

const LoginForgotPW = () => {
    return <View style={{
        marginTop: 16,
        marginBottom: 24,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    }}>
        <Text style={{
            textAlign: 'center',
            fontFamily: CommonStyle.fontPoppinsRegular,
            color: CommonStyle.fontWhite,
            fontSize: CommonStyle.font13,
            opacity: 0.7
        }}>
            {`${I18n.t('forgotPasswordLower')}?`}
        </Text>
    </View>
}

export default LoginForgotPW
