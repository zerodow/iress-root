import React, { Component } from 'react'
import { View, StyleSheet } from 'react-native'

import Icon from '~/component/Icon';

export default class DefaultRightHeader extends Component {
    render() {
        const { name, onPress, title } = this.props
        return (
            <View
                style={styles.container}
            >
                <Icon
                    name={name}
                    title={title}
                    onPress={onPress}
                />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        minWidth: 32
    }
})
