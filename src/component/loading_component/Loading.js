import React, { useMemo, useEffect } from 'react';
import { Button, StyleSheet, Text, View, Animated } from 'react-native';
import CommonStyle from '~/theme/theme_controller'
export default function Loading() {
    const animatedValue = new Animated.Value(0);
    const translateX = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [-10, 50]
    });
    const onAnimated = () => {
        animatedValue.setValue(0)
        Animated.timing(animatedValue, {
            toValue: 1,
            duration: 200,
            useNativeDriver: false
        }).start(() => {
            setTimeout(() => {
                onAnimated();
            }, 500);
        });
    };
    useEffect(() => {
        onAnimated();
        return () => onAnimated();
    });
    return (
        <View style={{ opacity: 0.5 }} >
            <View style={{ backgroundColor: '#ccc', overflow: 'hidden', borderRadius: 5 }}>
                <Animated.View
                    style={{
                        width: '50%',
                        opacity: 0.5,
                        backgroundColor: '#FFF',
                        transform: [{ translateX: translateX }]
                    }}
                ><Text style={{
                    paddingHorizontal: 20, fontSize: 16
                }}>   </Text></Animated.View>
            </View>
        </View>
    );
}
