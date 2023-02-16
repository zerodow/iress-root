import React, { Component } from 'react';
import { View, Text } from 'react-native';
import styles from './style/report_header.style';

export default class ReportHeader extends Component {
    render() {
        return (
            <View style={[styles.container]}>
                <View>
                    <Text style={[styles.textTitle]}>{this.props.title}</Text>
                </View>
                <View>
                    <Text style={[styles.textSubTitle]}>{this.props.subTitle}</Text>
                </View>
            </View>
        )
    }
}
