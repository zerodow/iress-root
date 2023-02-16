import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import CommonStyle, { register } from '~/theme/theme_controller'
const ItemSeparator = () => (
    <View style={styles.separatorWrapper}>

    </View>
);
const styles = StyleSheet.create({
    separatorWrapper: {
        height: 8,
        backgroundColor: 'transparent'
    }
})
export default ItemSeparator;
