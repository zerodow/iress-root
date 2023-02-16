import React, { Component } from 'react';
import {
  FlatList,
  Text,
  View
} from 'react-native';
import HighLightText from '../../modules/_global/HighLightText';
import styles from './style/top_price';
import { roundFloat } from '../../lib/base/functionUtil';

export default class TopPrice extends Component {
  getView(rowData) {
    if (this.props.market) {
      return (
        <View style={styles.rowContainer}>
          <Text style={[styles.textCol1, { textAlign: 'left', fontWeight: 'bold' }]}>{rowData[this.props.value1]}</Text>
          <HighLightText style={[styles.textCol2, { textAlign: 'right', fontWeight: 'bold' }]}
            base={rowData.change_point}
            value={roundFloat(rowData[this.props.value2], 3)} />
          <Text style={[styles.textCol3, styles.redText, { textAlign: 'right', fontWeight: 'bold' }]}>{roundFloat(rowData[this.props.value3], 0)}</Text>
          <Text style={[styles.textCol4, styles.text, { textAlign: 'right', fontWeight: 'bold' }]}>{rowData[this.props.value4]}</Text>
        </View>
      );
    } else {
      return (
        <View style={styles.rowContainer}>
          <Text style={[styles.textCol1, { textAlign: 'left', fontWeight: 'bold' }]}>{rowData[this.props.value1]}</Text>
          <HighLightText style={[styles.textCol2, { textAlign: 'right', fontWeight: 'bold' }]}
            base={rowData.change_point}
            value={roundFloat(rowData[this.props.value2], 3)} />
          <HighLightText style={[styles.textCol3, { textAlign: 'right', fontWeight: 'bold' }]}
            base={rowData.change_point}
            value={roundFloat(rowData[this.props.value3], 3)} />
          <HighLightText style={[styles.textCol4, { textAlign: 'right', fontWeight: 'bold' }]}
            base={rowData.change_point}
            value={roundFloat(rowData[this.props.value4], 2)} />
        </View>
      );
    }
  }

  renderHeader() {
    return (
      <View style={styles.header}>
        <Text style={[styles.textCol1, styles.textHeader, { textAlign: 'left' }]}>{this.props.label[0]}</Text>
        <Text style={[styles.textCol2, styles.textHeader, { textAlign: 'right' }]}>{this.props.label[1]}</Text>
        <Text style={[styles.textCol3, styles.textHeader, { textAlign: 'right' }]}>{this.props.label[2]}</Text>
        <Text style={[styles.textCol4, styles.textHeader, { textAlign: 'right' }]}>{this.props.label[3]}</Text>
      </View>
    );
  }

  render() {
    return (
      <FlatList
        style={styles.container}
        data={this.props.data}
        keyExtractor={(item, index) => item.id = index}
        ListHeaderComponent={this.renderHeader.bind(this)}
        renderItem={({ item }) => this.getView(item)}
        ListFooterComponent={() => <View style={{ height: 50, borderTopWidth: 1, borderColor: '#0000001e' }}></View>}
      />
    );
  }
}
