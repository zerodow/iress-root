import React, { } from 'react'
import {
    View, Text, Platform
} from 'react-native'
import { isIphoneXorAbove } from '~/lib/base/functionUtil'
import CommonStyle from '~/theme/theme_controller'
import I18n from '~/modules/language/'
import SvgIcon from '~s/watchlist/Component/Icon2'
import { useShadow } from '~/component/shadow/SvgShadow';

const Title = props => {
    return <View style={{ marginLeft: 16 }}>
        <Text style={{
            color: CommonStyle.fontColor,
            fontSize: CommonStyle.font23,
            fontFamily: CommonStyle.fontPoppinsBold
        }}>
            {I18n.t('portfolio')}
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
                    alignItems: 'center',
                    marginTop: 2,
                    marginRight: -8
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
    </View>
}

export default Header
