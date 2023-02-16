import React from 'react'
import { StyleSheet, Text, View, SafeAreaView } from 'react-native'
import HeaderOrderCancel from './Content/HeaderOrderCancel'
import Content from './Content/Content'
import CommonStyle from '~/theme/theme_controller'
import ButtonCancel from './Content/ButtonCancel'
const ConfirmCancel = ({ cbCancelSuccess }) => {
    return (
        <View style={styles.container}>
            <SafeAreaView style={{ margin: 16, backgroundColor: CommonStyle.backgroundColor }}>
                <HeaderOrderCancel />
                <Content />
                <ButtonCancel cbCancelSuccess={cbCancelSuccess} />
            </SafeAreaView>
        </View>
    )
}

export default ConfirmCancel

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.85)'
    }
})
