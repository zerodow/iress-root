import React, { } from 'react'
import {
    View, Text, Platform, TouchableWithoutFeedback, Keyboard
} from 'react-native'
import { isIphoneXorAbove } from '~/lib/base/functionUtil'
import CommonStyle from '~/theme/theme_controller'
import I18n from '~/modules/language/'
import SvgIcon from '~s/watchlist/Component/Icon2'
import { useShadow } from '~/component/shadow/SvgShadow';

const Title = () => {
    return <View style={{ marginLeft: 16 }}>
        <Text style={{
            color: CommonStyle.fontColor,
            fontSize: CommonStyle.font23,
            fontFamily: CommonStyle.fontPoppinsBold
        }}>
            {I18n.t('Orders')}
        </Text>
    </View>
}

const Header = ({ navigator }) => {
    const [Shadow, onLayout] = useShadow()
    const openMenu = () => {
        navigator && navigator.toggleDrawer({
            side: 'left',
            animated: true
        });
    }
    return <View style={{ backgroundColor: CommonStyle.color.dark, paddingBottom: 5 }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View>
                <Shadow />
                <View
                    onLayout={onLayout}
                    style={{
                        zIndex: 10,
                        width: '100%',
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: isIphoneXorAbove()
                            ? 46
                            : Platform.OS === 'ios'
                                ? 32
                                : 16,
                        paddingBottom: 16
                    }}>
                    <View style={{
                        alignSelf: 'flex-start',
                        marginLeft: 8,
                        marginRight: -8,
                        marginTop: 2,
                        alignItems: 'center'
                    }}>
                        <SvgIcon
                            color={CommonStyle.fontColor}
                            size={36}
                            name={'noun_menu'}
                            onPress={openMenu}
                        />
                    </View>
                    <Title />
                </View>
            </View>
        </TouchableWithoutFeedback>
    </View>
}

export default Header
