import React, { Component, PropTypes } from 'react'
import { View, processColor, Text, Dimensions, PixelRatio } from 'react-native';
import { PieChart } from 'react-native-charts-wrapper';
import I18n from '../../modules/language';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import * as FunctionUtil from '~/lib/base/functionUtil'
const { height, width } = Dimensions.get('window');

class PieChartNew extends React.Component {
  constructor(props) {
    super(props);
        this.state = {
      listData: this.props.listData || [],
      legend: {
        enabled: false
      },
      data: {},
      marker: {}
      // highlights: [{ x: 0 }]
    };
  }

  componentDidMount() {
    console.log('this.props.listColors', this.props.listColors)
    this.setState({
      data: {
        dataSets: [{
          values: this.props.listData || [],
          label: '',
          config: {
            colors: this.props.listColors,
            drawValues: false,
            valueTextSize: 14 * CommonStyle.fontRatio,
            valueTextColor: processColor('#fff'),
            valueFormatter: '#0.00 %',
            sliceSpace: 1,
            selectionShift: 3,
            xValuePosition: true,
            valueLineWidth: 0.5,
            valueLinePart1Length: 1,
            valueLinePart2Length: 1.1,
            valueLineColor: '#000000'
          }
        }]
      },
      marker: {
        enabled: true,
        digits: 2,
        markerColor: processColor('#000000'),
        textColor: processColor('#FFFFFF'),
        textSize: 12
      }
      // highlights: [{ x: 0 }]
    })
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps && nextProps.listData) {
      this.setState({
        listData: nextProps.listData,
        data: {
          dataSets: [{
            values: nextProps.listData || [],
            label: '',
            config: {
              colors: nextProps.listColors,
              drawValues: false,
              valueTextSize: 14 * CommonStyle.fontRatio,
              valueTextColor: processColor('#fff'),
              valueFormatter: '#0.00 %',
              sliceSpace: 1,
              selectionShift: 3,
              xValuePosition: true,
              valueLineWidth: 0.5,
              valueLinePart1Length: 1,
              valueLinePart2Length: 1.1,
              valueLineColor: '#000000'
            }
          }],
          highlights: [{ x: 2 }]
        },
        marker: {
          enabled: true,
          digits: 2,
          markerColor: processColor('#000000'),
          textColor: processColor('#FFFFFF'),
          textSize: 12
        }
        // highlights: [{ x: 0 }]
      })
    }
  }

  handleSelect(event) {
    const obj = event.nativeEvent;
    const code = obj.data ? obj.data.code : '';
    const listData = this.state.listData;
    let index = 0;
    if (code !== '') {
      index = listData.findIndex(x => x.code === code);
    }
    this.props.onFocus && this.props.onFocus(code, index);
  }

  render() {
    return (
      <View testID={this.props.testID} style={{ flex: 1, backgroundColor: 'transparent', justifyContent: 'center', alignItems: 'center' }}>
        <PieChart
          extraOffsets={this.props.extraOffsets !== undefined ? this.props.extraOffsets : [0, 5, 0, 5]}
          style={{ width: '100%', height: FunctionUtil.isIphoneXorAbove() ? '92%' : '100%', backgroundColor: 'transparent' }}
          logEnabled={true}
          chartBackgroundColor={processColor('transparent')}
          chartDescription={{ text: '' }}
          data={this.state.data}
          legend={this.state.legend}
          marker={this.state.marker}
          // highlights={this.state.highlights}
          noDataText={'No Data'}
          entryLabelColor={processColor('#10a8b2')}
          entryLabelTextSize={12 * CommonStyle.fontRatio}
          touchEnabled={true}
          drawEntryLabels={this.props.drawEntryLabels !== undefined ? this.props.drawEntryLabels : true}
          usePercentValues={false}
          // centerText={this.props.centerText ? this.props.centerText : ''}
          styledCenterText={this.props.styledCenterText ? this.props.styledCenterText : {}}
          centerTextRadiusPercent={this.props.centerTextRadiusPercent ? this.props.centerTextRadiusPercent : 0}
          onSelect={this.handleSelect.bind(this)}
          holeRadius={this.props.holeRadius || 0}
          touchEnabled={true}
          dragDecelerationEnabled={true}
          transparentCircleRadius={0}
          rotationEnabled={true}
          maxAngle={360}
        />
      </View>
    );
  }
}

export default PieChartNew;
