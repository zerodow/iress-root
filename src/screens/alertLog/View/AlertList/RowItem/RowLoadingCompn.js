import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Animated from 'react-native-reanimated'
import CommonStyle from '~/theme/theme_controller'
const HEIGHT_ROW = 102

const RowLoadingCompn = () => {
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
                width: '45%',
                marginHorizontal: 16,
                borderRadius: 8,
                alignSelf: 'center',
                justifyContent: 'center',
                alignItems: 'center',
                flex: 1

            }} >
                <View style={{
                    backgroundColor: '#ffffff30',
                    marginTop: 4,
                    borderRadius: 8,
                    alignSelf: 'baseline',
                    overflow: 'hidden',
                    height: (HEIGHT_ROW - (16 + 16 + 4 + 4)) / 4
                }}>
                    <Text style={{
                        opacity: 0
                    }}>
                        {`THC.ASX      ^1.25%`}
                    </Text>
                </View>

                <View style={{
                    backgroundColor: '#ffffff30',
                    marginTop: 4,
                    borderRadius: 8,
                    alignSelf: 'baseline',
                    overflow: 'hidden',
                    height: (HEIGHT_ROW - (8 + 8 + 4 + 4 + 8)) / 4
                }}>
                    <Text style={{
                        opacity: 0
                    }}>
                        {`THC Global Group`}
                    </Text>
                </View>
                <View style={{
                    backgroundColor: '#ffffff30',
                    marginTop: 4,
                    borderRadius: 8,
                    alignSelf: 'baseline',
                    overflow: 'hidden',
                    height: (HEIGHT_ROW - (8 + 8 + 4 + 4)) / 4
                }}>
                    <Text style={{
                        opacity: 0
                    }}>
                        {`30.0900 `}
                    </Text>
                </View>

                <View style={{
                    backgroundColor: '#ffffff30',
                    marginTop: 4,
                    borderRadius: 8,
                    alignSelf: 'baseline',
                    overflow: 'hidden',
                    height: (HEIGHT_ROW - (8 + 8 + 4 + 4 + 8)) / 4
                }}>
                    <Text style={{
                        opacity: 0
                    }}>
                        {`Price Alert`}
                    </Text>
                </View>
            </View>

            <View style={{
                width: '45%',
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
                    height: (HEIGHT_ROW - (8 + 8 + 4 + 4)) / 4
                }}>
                    <Text style={{
                        opacity: 0
                    }}>
                        {`BHP.ASX EQT`}
                    </Text>
                </View>
                <View style={{
                    backgroundColor: '#ffffff30',
                    marginTop: 4,
                    borderRadius: 8,
                    alignSelf: 'center',
                    overflow: 'hidden',
                    height: (HEIGHT_ROW - (8 + 8 + 4 + 4)) / 4
                }}>
                    <Text style={{
                        opacity: 0
                    }}>
                        {`BHP.ASX EQT`}
                    </Text>
                </View>
                <View style={{
                    backgroundColor: '#ffffff30',
                    marginTop: 4,
                    borderRadius: 8,
                    alignSelf: 'baseline',
                    overflow: 'hidden',
                    height: (HEIGHT_ROW - (8 + 8 + 4)) / 4
                }}>
                    <Text style={{
                        opacity: 0
                    }}>
                        {`Price: 123.000000000000000000000`}
                    </Text>
                </View>
                <View style={{
                    backgroundColor: '#ffffff30',
                    marginTop: 4,
                    borderRadius: 8,
                    alignSelf: 'baseline',
                    overflow: 'hidden',
                    height: (HEIGHT_ROW - (8 + 8 + 4 + 4)) / 4
                }}>
                    <Text style={{
                        opacity: 0
                    }}>
                        {`Price: 123.00000000000000000000`}
                    </Text>
                </View>
            </View>
        </Animated.View>
    )
}

export default RowLoadingCompn

const styles = StyleSheet.create({})
