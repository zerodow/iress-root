import React from 'react'
import { Dimensions, StyleSheet, Text, View } from 'react-native'
import Animated from 'react-native-reanimated'
import CommonStyle from '~/theme/theme_controller'
const HEIGHT_ROW = 102
const { width: widthDevices, height: heightDevices } = Dimensions.get('window')
const RowLoadingNotification = () => {
    return (
        <Animated.View style={[{
            height: HEIGHT_ROW,
            backgroundColor: CommonStyle.color.dark,
            padding: 8,
            borderRadius: 8,
            flexDirection: 'row',
            marginTop: 8
        }]}>
            <View style={{
                width: '100%',
                justifyContent: 'center',
                alignItems: 'center',
                flex: 1
            }}>
                <View style={{
                    backgroundColor: '#ffffff30',
                    borderRadius: 8,
                    alignSelf: 'center',
                    overflow: 'hidden',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: widthDevices - 32,
                    height: (HEIGHT_ROW - (8 + 8 + 4 + 4)) / 4
                }} />

                <View style={{
                    backgroundColor: '#ffffff30',
                    borderRadius: 8,
                    alignSelf: 'center',
                    marginTop: 16,
                    overflow: 'hidden',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: widthDevices - 32,
                    height: (HEIGHT_ROW - (8 + 8 + 4 + 4)) / 2
                }} />

            </View>
        </Animated.View>
    )
}

export default RowLoadingNotification

const styles = StyleSheet.create({})
