import React, { Component } from 'react'
import { View, StyleSheet } from 'react-native'

import Icon from '~/component/Icon';

export default class DefaultLeftHeader extends Component {
    render() {
        const { name, onPress, title } = this.props
        return (
            <View style={styles.container} >
                <Icon name={name} title={title} onPress={onPress} />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        width: 32,
        alignItems: 'flex-start',
        left: -8
    }
})
