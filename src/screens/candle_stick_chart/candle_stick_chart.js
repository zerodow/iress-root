import React, { Component } from 'react';
import { View, Text, StyleSheet, processColor, TouchableOpacity, PixelRatio, Platform } from 'react-native';
import { CombinedChart } from 'react-native-charts-wrapper';
import { formatNumberNew2 } from '../../lib/base/functionUtil';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import Icon from 'react-native-vector-icons/Ionicons';
import config from '../../config';
import I18n from '../../modules/language'
import performanceEnum from '../../constants/performance';
import Perf from '../../lib/base/performance_monitor';
import { dataStorage } from '../../storage'
import * as Business from '../../business'
import * as Controller from '../../memory/controller'
import Enum from '../../enum'

export default class Combined extends Component {
  constructor(props) {
    super(props);
    this.isAuBySymbol = this.props.isAuBySymbol
    this.mkDataType = Controller.getLoginStatus() ? Controller.getMarketDataTypeBySymbol(this.isAuBySymbol) : Enum.PRICE_SOURCE.delayed
    this.state = {
      listData: props.listData,
      listLabels: props.listLabels,
      legend: {
        enabled: false
      },
      xAxis: {
        enabled: true,
        textColor: processColor(CommonStyle.fontTextChart),
        textSize: 10 * CommonStyle.fontRatio,
        // fontFamily: 'SFUIText',
        valueFormatter: props.labels,
        position: 'BOTTOM',
        granularityEnabled: true,
        granularity: 1,
        labelCountForce: false,
        labelCount: 4,
        gridColor: processColor(CommonStyle.gridColorHorizontal),
        gridLineWidth: 1,
        drawGridLines: false,
        drawAxisLine: true,
        axisLineColor: processColor(CommonStyle.gridColorHorizontal),
        axisLineWidth: 0.5,
        centerAxisLabels: false,
        avoidFirstLastClipping: true,
        axisMinimum: -0.5,
        axisMaximum: props.isChartDay ? props.labelLength : props.labels.length - 0.5
      },
      yAxis: {
        right: {
          enabled: true,
          drawAxisLine: false,
          drawGridLines: true,
          gridColor: processColor(CommonStyle.gridColorHorizontal),
          gridLineWidth: 1,
          textColor: processColor(CommonStyle.fontTextChart),
          textSize: 10 * CommonStyle.fontRatio,
          fontFamily: CommonStyle.fontLight,
          position: 'OUTSIDE_CHART',
          labelCount: 4,
          granularity: 1,
          valueFormatter: '#'
        },
        left: {
          enabled: false
        }
      },
      data: {
        candleData: {
          dataSets: props.listData.length <= 0 ? [] : [{
            values: props.listData,
            label: I18n.t('candle'),
            config: config.candleChart
          }]
        }
      },
      marker: '',
      zoom: { scaleX: 0, scaleY: 0, xValue: 0, yValue: 0 }
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps && (nextProps.listData !== this.state.listData || nextProps.listLabels !== this.state.listLabels)) {
      this.setState({
        listData: nextProps.listData,
        listLabels: nextProps.listLabels,
        legend: {
          enabled: false
        },
        xAxis: {
          enabled: true,
          textColor: processColor(CommonStyle.fontTextChart),
          textSize: 10 * CommonStyle.fontRatio,
          // fontFamily: 'SFUIText',
          valueFormatter: nextProps.labels,
          position: 'BOTTOM',
          granularityEnabled: true,
          granularity: 1,
          labelCountForce: false,
          labelCount: 4,
          gridColor: processColor(CommonStyle.gridColorHorizontal),
          gridLineWidth: 1,
          drawGridLines: false,
          drawAxisLine: true,
          axisLineColor: processColor(CommonStyle.gridColorHorizontal),
          axisLineWidth: 0.5,
          centerAxisLabels: false,
          avoidFirstLastClipping: true,
          axisMinimum: -0.5,
          axisMaximum: nextProps.isChartDay ? nextProps.labelLength : nextProps.labels.length - 0.5
        },
        yAxis: {
          right: {
            enabled: true,
            drawAxisLine: false,
            drawGridLines: true,
            gridColor: processColor(CommonStyle.gridColorHorizontal),
            gridLineWidth: 1,
            textColor: processColor(CommonStyle.fontTextChart),
            textSize: 10 * CommonStyle.fontRatio,
            fontFamily: CommonStyle.fontLight,
            position: 'OUTSIDE_CHART',
            labelCount: 5,
            granularity: 1,
            valueFormatter: '#'
          },
          left: {
            enabled: false
          }
        },
        data: {
          candleData: {
            dataSets: nextProps.listData.length <= 0 ? [] : [{
              values: nextProps.listData,
              label: I18n.t('candle'),
              config: config.candleChart
            }]
          }
        },
        zoom: { scaleX: 0, scaleY: 0, xValue: 0, yValue: 0 }
      });
    }
  }

  handleSelect(event) {
    const obj = event.nativeEvent;
    if (obj.open || obj.high || obj.low || obj.close) {
      this.setState({
        marker: obj.data.marker ? obj.data.marker : '',
        zoom: {}
      })
    } else {
      this.setState({
        marker: '',
        zoom: { scaleX: 0, scaleY: 0, xValue: 0, yValue: 0 }
      })
    }
  }

  resetZoom() {
    this.setState({
      zoom: { scaleX: 0, scaleY: 0, xValue: 0, yValue: 0 },
      marker: ''
    })
  }

  render() {
    return (
      <View style={{ flex: 1 }} testID={this.props.testId}>
        {
          this.state.marker !== '' ? <View style={{ flexDirection: 'row', width: '93%', position: 'absolute', top: 0, zIndex: 100000 }}>
            <Text style={{ marginLeft: 16, fontFamily: CommonStyle.fontLight, fontSize: CommonStyle.font10, color: CommonStyle.yAxisTextColor }}>{this.state.marker}</Text>
          </View> : null
        }
        {
          Object.keys(this.state.zoom).length === 0 ? <TouchableOpacity onPress={this.resetZoom.bind(this)}
            style={{ position: 'absolute', zIndex: 100000, right: 12 }}>
            <Icon color={CommonStyle.fontColor} name='md-eye-off' />
          </TouchableOpacity> : null
        }
        {
          this.state.listData && this.state.listData.length > 0 && this.mkDataType !== Enum.PRICE_SOURCE.noAccess
            ? <CombinedChart
              style={{ flex: 1, backgroundColor: CommonStyle.backgroundColor, marginRight: 8 }}
              data={this.state.data}
              chartDescription={{ text: '' }}
              noDataText={I18n.t('noChartData')}
              legend={this.state.legend}
              xAxis={this.state.xAxis}
              marker={{ enabled: false }}
              zoom={this.state.zoom}
              yAxis={this.state.yAxis}
              onSelect={this.handleSelect.bind(this)}
            />
            : <View style={{ width: '100%', height: 144, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: CommonStyle.fontColor }}>{I18n.t('noChartData')}</Text>
            </View>
        }
      </View>
    );
  }
}
