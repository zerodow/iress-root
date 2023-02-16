import React, { Component } from 'react';
import { View, Text } from 'react-native';
import styles from './style/row_data.style';
import HighLightText from '../../modules/_global/HighLightText';

export default class RowData extends Component {
    render() {
        let objTemp = {};
        const paddingLeft = this.props.hasBorder ? 0 : 16;
        if (this.props.hasBorder) {
            objTemp = {
                marginLeft: 16,
                borderBottomColor: '#CECECE',
                borderBottomWidth: 1
            };
        }
        return (
            <View style={objTemp}>
                <View style={[{ width: '100%', justifyContent: 'center', paddingRight: 16, paddingLeft: paddingLeft, flexDirection: 'row', backgroundColor: this.props.backgroundColor, paddingVertical: 4 }]}>
                    <View style={[{ justifyContent: 'center' }, { width: this.props.widthLeft }, this.props.height ? { height: 48 } : {}]}>
                        <Text style={[styles.textLeft, this.props.styleLeft ? { ...this.props.styleLeft } : {}]}>{this.props.leftText}</Text>
                    </View>
                    <View style={[{ justifyContent: 'center' }, { width: this.props.widthRight }]}>
                        <Text testID={this.props.testID} style={[styles.textRight, this.props.styleRight ? { ...this.props.styleRight } : {}, { textAlign: 'right' }]}>{this.props.rightText}</Text>
                    </View>
                </View>
            </View>
        )
    }
}
