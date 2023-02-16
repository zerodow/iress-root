import React from 'react'
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Dimensions, Platform } from 'react-native'
import CommonStyle from '~/theme/theme_controller'
import HeaderOrder from './Content/HeaderOrder'
import SafeArea from '~/component/safe_area/index.js'
import {
    isIphoneXorAbove
} from '~/lib/base/functionUtil'
import Content from './Content/Content'
import ButtonAmend from './Content/ButtonAmend'
const { height: heightDevice } = Dimensions.get('window')
const ConfirmAmend = ({ data }) => {
    return (
        <View style={styles.container}>
            <View style={{
                marginHorizontal: 16,
                backgroundColor: CommonStyle.backgroundColor,
                overflow: 'hidden',
                alignSelf: 'center',
                maxHeight: isIphoneXorAbove() ? heightDevice - 48 - 32 : Platform.OS === 'ios' ? heightDevice - 64 : heightDevice - 32
            }}>
                <HeaderOrder />
                <ScrollView style={{
                    flexGrow: 0
                }}>

                    <Content data={data} />
                </ScrollView>
                <ButtonAmend />
            </View>
        </View >
    )
}

export default ConfirmAmend
const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1
    }
})
