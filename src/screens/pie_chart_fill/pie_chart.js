import React, { Component, PropTypes } from 'react'
import { View, processColor, Text, Dimensions, Platform, PixelRatio } from 'react-native';
import { PieChart } from 'react-native-charts-wrapper';
import I18n from '../../modules/language';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import { dataStorage } from '../../storage';
const { height, width } = Dimensions.get('window');

class PieChartScreen extends React.Component {
  constructor(props) {
    super(props);
        this.state = {
      legend: {
        enabled: false,
        textSize: 14 * CommonStyle.fontRatio,
        fontFamily: CommonStyle.fontFamily,
        position: 'BELOW_CHART_CENTER',
        custom: {
          colors: [processColor('#10a8b2'), processColor('rgba(10, 167, 177, 0.3)')],
          labels: ['Holdings', 'Cash']
        }
      },
      data: {},
      description: {
        text: this.props.description,
        textSize: 16 * CommonStyle.fontRatio,
        positionX: dataStorage.platform === 'ios' ? 120 : 440,
        positionY: dataStorage.platform === 'ios' ? 190 : 750,
        fontFamily: CommonStyle.fontFamily,
        textColor: processColor('#00000087')
      }
    };
  }

  componentDidMount() {
    this.setState({
      data: {
        dataSets: [{
          values: this.props.data,
          label: '',
          config: {
            colors: this.props.colors,
            drawValues: false,
            valueTextSize: 14 * CommonStyle.fontRatio,
            valueTextColor: processColor('#fff'),
            valueFormatter: '#0.00 %',
            sliceSpace: 0,
            selectionShift: 10,
            xValuePosition: false
          }
        }]
      }
    })
  }

  render() {
    return (
      <View style={{ backgroundColor: CommonStyle.backgroundColor, width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
        {
          <PieChart
            style={{ width: '80%', height: '100%', backgroundColor: CommonStyle.backgroundColor, marginRight: 20 }}
            logEnabled={true}
            chartBackgroundColor={processColor(CommonStyle.backgroundColor)}
            chartDescription={{ text: '' }}
            data={this.state.data}
            legend={this.state.legend}
            noDataText={I18n.t('noChartData')}
            drawEntryLabels={true}
            touchEnabled={true}
            usePercentValues={false}
            centerText={''}
            centerTextRadiusPercent={0}
            holeRadius={0}
            transparentCircleRadius={0}
            rotationEnabled={true}
            maxAngle={360}
          />
        }
        <View style={{ position: 'absolute', zIndex: 100000, bottom: height * 1 / 50 }}>
          <Text testID={`${this.props.testID}-description`} style={CommonStyle.textMainNormal}>{this.props.description}</Text>
        </View>
      </View>
    );
  }
}

export default PieChartScreen;
