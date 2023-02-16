import React, { Component, PropTypes } from 'react'
import { View, processColor, Platform } from 'react-native';
import { PieChart } from 'react-native-charts-wrapper';
import I18n from '../../modules/language';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import { dataStorage } from '../../storage'

class PieChartScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      legend: {
        enabled: false,
        textSize: 11 * CommonStyle.fontRatio,
        textColor: processColor('#485465'),
        fontFamily: CommonStyle.fontFamily,
        position: 'ABOVE_CHART_CENTER',
        form: 'CIRCLE',
        xEntrySpace: 40,
        custom: {
          colors: this.props.listColors,
          labels: this.props.listLabels
        }
      },
      data: {},
      marker: {
        enabled: true,
        markerColor: processColor('#485465'),
        textColor: processColor('#ffffff'),
        textSize: 11
      }
    };
  }

  componentDidMount() {
    let newValues = this.props.data || [];
    newValues.map((e, i) => {
      e.marker = e.marker + '%'
    })
    this.setState({
      legend: {
        enabled: !this.props.holdingReport,
        textSize: 11 * CommonStyle.fontRatio,
        textColor: processColor('#485465'),
        fontFamily: CommonStyle.fontFamily,
        position: 'ABOVE_CHART_CENTER',
        form: 'CIRCLE',
        xEntrySpace: 40,
        custom: {
          colors: this.props.listColors,
          labels: this.props.listLabels
        }
      },
      data: {
        dataSets: [{
          values: newValues,
          label: '',
          config: {
            drawValues: !this.props.holdingReport,
            valueTextSize: 14 * CommonStyle.fontRatio,
            valueTextColor: processColor('#fff'),
            valueFormatter: '#0.00 %',
            colors: this.props.listColors,
            sliceSpace: 0,
            selectionShift: 10,
            xValuePosition: false
          }
        }]
      }
    })
  }

  render() {
    console.log(this.state)
    return (
      <View style={{ width: '88%', height: '88%' }}>
        {
          <PieChart
            style={{ flex: 1, backgroundColor: CommonStyle.backgroundColor }}
            logEnabled={true}
            chartBackgroundColor={processColor(CommonStyle.backgroundColor)}
            chartDescription={{ text: '' }}
            data={this.state.data}
            legend={this.state.legend}
            marker={this.state.marker}
            drawEntryLabels={false}
            noDataText={I18n.t('noChartData')}
            touchEnabled={true}
            drawSliceText={false}
            usePercentValues={true}
            centerText={''}
            centerTextRadiusPercent={0}
            holeRadius={50}
            holeColor={processColor(CommonStyle.backgroundColor)}
            transparentCircleRadius={0}
            rotationEnabled={true}
            maxAngle={360}
          />
        }
      </View>
    );
  }
}

export default PieChartScreen;
