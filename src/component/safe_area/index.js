import React from 'react'
import { View, SafeAreaView, StyleSheet, Platform, Dimensions } from 'react-native'
import {
    isIphoneXorAbove
} from '~/lib/base/functionUtil'
const { height: heightDevices } = Dimensions.get('window')
const SafeAreaViewComponent = props => {
    const WrapperComponent = isIphoneXorAbove() ? View : SafeAreaView
    return (
        <WrapperComponent style={styles.SafeArea} {...props} >
            {props.children}
        </WrapperComponent>
    )
};

const styles = StyleSheet.create({
    SafeArea: {
        height: Platform.OS === 'android' ? '100%' : isIphoneXorAbove() ? heightDevices - 32 : '100%',
        marginTop: isIphoneXorAbove() ? 32 : 0
    }
});
export default SafeAreaViewComponent
