import React, { Component } from 'react';
import { View, Text, StyleSheet, processColor, TouchableOpacity, PixelRatio, Platform, Dimensions } from 'react-native';
import { CombinedChart } from 'react-native-charts-wrapper';
import Icon from 'react-native-vector-icons/Ionicons';
import config from '../../config';
import I18n from '../../modules/language'
import { dataStorage } from '../../storage'
import * as Controller from '../../memory/controller'
import * as RoleUser from '../../roleUser';
import ENUM from '../../enum';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'

const { height, width } = Dimensions.get('window');

export default class Combined extends Component {
  constructor(props) {
    super(props);
        this.isAuBySymbol = this.props.isAuBySymbol
    this.mkDataType = Controller.getLoginStatus() ? Controller.getMarketDataTypeBySymbol(this.isAuBySymbol) : ENUM.PRICE_SOURCE.delayed
    this.state = {
      showMarker: 0,
      labels: props.labels,
      maxLeft: props.maxLeft,
      maxRight: props.maxRight,
      minRight: props.minRight,
      listVolume: props.listVolume,
      listData: props.listData,
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
        labelCount: 5,
        drawGridLines: false,
        gridColor: processColor(CommonStyle.gridColorHorizontal),
        gridLineWidth: 1,
        drawAxisLine: true,
        axisLineColor: processColor(CommonStyle.gridColorHorizontal),
        axisLineWidth: 0.5,
        centerAxisLabels: false,
        avoidFirstLastClipping: true,
        axisMinimum: -0.5,
        axisMaximum: props.isChartDay ? props.labelLength : props.labels.length - 0.5
      },
      yAxis: {
        left: {
          enabled: true,
          drawAxisLine: false,
          drawLabels: false,
          drawGridLines: false,
          gridColor: processColor(CommonStyle.gridColorHorizontal),
          gridLineWidth: 1,
          textColor: processColor(CommonStyle.fontTextChart),
          textSize: 10 * CommonStyle.fontRatio,
          fontFamily: CommonStyle.fontLight,
          position: 'OUTSIDE_CHART',
          labelCount: 5,
          axisMaximum: props.maxLeft,
          axisMinimum: 0,
          granularity: 1,
          valueFormatter: 'largeValue'
        },
        right: {
          enabled: true,
          drawAxisLine: false,
          axisLineColor: processColor(CommonStyle.gridColorHorizontal),
          axisLineWidth: 0.5,
          drawGridLines: true,
          gridColor: processColor(CommonStyle.gridColorHorizontal),
          gridLineWidth: 1,
          textColor: processColor(CommonStyle.fontTextChart),
          textSize: 10 * CommonStyle.fontRatio,
          fontFamily: CommonStyle.fontLight,
          position: 'OUTSIDE_CHART',
          labelCount: props.minRight === 0 ? 2 : 5,
          labelCountForce: true,
          axisMaximum: props.maxRight,
          axisMinimum: props.minRight,
          granularity: 1,
          valueFormatter: '#0.0000',
          avoidFirstLastClipping: true
        }
      },
      data: {
        barData: {
          dataSets: [
            {
              values: props.listVolume,
              label: I18n.t('bar'),
              config: {
                drawValues: false,
                colors: props.listColor,
                axisDependency: 'LEFT'
              }
            }
          ],
          config: {
            barWidth: 0.75,
            fitBars: true
          }
        },
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
    const len = nextProps.listData ? nextProps.listData.length : 1;
    const dataToday = len ? nextProps.listData[len - 1] : null;
    const lenState = this.state.listData ? this.state.listData.length : 1;
    const dataState = lenState ? this.state.listData[lenState - 1] : null;
    if (nextProps && dataToday && (!dataState || (dataToday.close !== dataState.close || dataToday.volume !== dataState.volume))) {
      this.setState({
        labels: nextProps.labels,
        maxLeft: nextProps.maxLeft,
        maxRight: nextProps.maxRight,
        minRight: nextProps.minRight,
        listVolume: nextProps.listVolume,
        listData: nextProps.listData,
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
          labelCount: 5,
          drawGridLines: false,
          gridColor: processColor(CommonStyle.gridColorHorizontal),
          gridLineWidth: 1,
          drawAxisLine: true,
          axisLineColor: processColor(CommonStyle.gridColorHorizontal),
          axisLineWidth: 0.5,
          centerAxisLabels: false,
          avoidFirstLastClipping: true,
          axisMinimum: -0.5,
          axisMaximum: nextProps.isChartDay ? nextProps.labelLength : nextProps.labels.length - 0.5
        },
        yAxis: {
          left: {
            enabled: true,
            drawAxisLine: false,
            drawLabels: false,
            drawGridLines: false,
            gridColor: processColor(CommonStyle.gridColorHorizontal),
            gridLineWidth: 1,
            textColor: processColor(CommonStyle.fontTextChart),
            textSize: 10 * CommonStyle.fontRatio,
            fontFamily: CommonStyle.fontLight,
            position: 'OUTSIDE_CHART',
            labelCount: 5,
            axisMaximum: nextProps.maxLeft,
            axisMinimum: 0,
            granularity: 1,
            valueFormatter: 'largeValue'
          },
          right: {
            enabled: true,
            drawAxisLine: false,
            axisLineColor: processColor(CommonStyle.gridColorHorizontal),
            axisLineWidth: 0.5,
            drawGridLines: true,
            gridColor: processColor(CommonStyle.gridColorHorizontal),
            gridLineWidth: 1,
            textColor: processColor(CommonStyle.fontTextChart),
            textSize: 10 * CommonStyle.fontRatio,
            fontFamily: CommonStyle.fontLight,
            position: 'OUTSIDE_CHART',
            labelCount: 5,
            labelCountForce: true,
            axisMaximum: nextProps.maxRight,
            axisMinimum: nextProps.minRight,
            granularity: 1,
            valueFormatter: '#0.0000',
            avoidFirstLastClipping: true
          }
        },
        data: {
          barData: {
            dataSets: [
              {
                values: nextProps.listVolume,
                label: I18n.t('bar'),
                config: {
                  drawValues: false,
                  colors: nextProps.listColor,
                  axisDependency: 'LEFT'
                }
              }
            ],
            config: {
              barWidth: 0.75,
              fitBars: true
            }
          },
          candleData: {
            dataSets: nextProps.listData.length <= 0 ? [] : [{
              values: nextProps.listData,
              label: I18n.t('candle'),
              config: config.candleChart
            }]
          }
        },
        zoom: { scaleX: 0, scaleY: 0, xValue: 0, yValue: 0 }
      })
    }
  }

  handleSelect(event) {
    const obj = event.nativeEvent;
    if (obj.open || obj.high || obj.low || obj.close || obj.y) {
      this.setState({
        showMarker: 0,
        marker: obj.data.marker ? obj.data.marker : '',
        zoom: {}
      })
    } else {
      this.setState({
        showMarker: 0,
        marker: '',
        zoom: { scaleX: 0, scaleY: 0, xValue: 0, yValue: 0 }
      })
    }
  }

  resetZoom() {
    this.setState({
      showMarker: 0,
      zoom: { scaleX: 0, scaleY: 0, xValue: 0, yValue: 0 },
      marker: ''
    })
  }

  render() {
    return (
      <View testID={this.props.testID} style={{ flex: 1, width: '100%', paddingTop: 5 }}>
        {
          this.state.marker !== '' || !this.props.touchEnabled ? (
            <View style={{
              backgroundColor: 'transparent',
              flexDirection: 'row',
              width: '93%',
              position: 'absolute',
              paddingLeft: 16,
              top: 0,
              zIndex: 100000
            }}>
              <Text style={{ fontFamily: CommonStyle.fontLight, fontSize: CommonStyle.font10, color: CommonStyle.yAxisTextColor }}>{this.props.touchEnabled ? this.state.marker : (this.state.listData && this.state.listData.length > 0 ? this.state.listData[this.state.listData.length - 1].marker : '')}</Text>
            </View>
          ) : null
        }
        {
          Object.keys(this.state.zoom).length === 0 ? <TouchableOpacity onPress={this.resetZoom.bind(this)}
            style={{ position: 'absolute', zIndex: 100000, right: 8 }}>
            <View>
              <Icon name='md-eye-off' />
            </View>
          </TouchableOpacity> : null
        }
        {
          this.state.listData && RoleUser.checkRoleByKey(ENUM.ROLE_DETAIL.VIEW_CHART_OF_SYMBOL) && this.state.listData.length > 0 && this.mkDataType !== 0
            ? <CombinedChart
              testID={`${this.props.testID}CombineChart`}
              style={{ flex: 1, width: '100%', backgroundColor: CommonStyle.backgroundColor, marginVertical: this.state.showMarker ? 16 : 5 }}
              data={this.state.data}
              chartDescription={{ text: '' }}
              legend={this.state.legend}
              xAxis={this.state.xAxis}
              noDataText={I18n.t('noChartData')}
              marker={{ enabled: false }}
              zoom={this.state.zoom}
              yAxis={this.state.yAxis}
              touchEnabled={this.props.touchEnabled}
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
