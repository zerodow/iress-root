import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import CommonStyle from '~/theme/theme_controller'
import { Navigation } from 'react-native-navigation';
import IconClose from './IconClose'
const Header = (props) => {
    const { title, opacity } = props
    const onClose = () => {
        Navigation.dismissModal({
            animationType: 'none'
        });
    }
    return (
        <View style={{
            backgroundColor: CommonStyle.backgroundColor
        }}>
            <View style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <Text style={[{
                    paddingVertical: 8,
                    fontSize: CommonStyle.font13,
                    fontFamily: CommonStyle.fontPoppinsRegular,
                    color: CommonStyle.fontColor
                }, { opacity: opacity }]}>
                    {title}
                </Text>
                <View style={{ position: 'absolute', right: 8 }}>
                    <IconClose onPress={() => onClose()}></IconClose>

                </View>
            </View>

        </View >
    )
}

export default Header

const styles = StyleSheet.create({})
