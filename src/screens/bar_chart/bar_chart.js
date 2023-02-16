import React, { Component, PropTypes } from 'react'
import { View, processColor, Text, PixelRatio, Platform, TouchableOpacity, Dimensions } from 'react-native';
import { HorizontalBarChart } from 'react-native-charts-wrapper';
import I18n from '../../modules/language';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import config from '../../config';
import styles from './style/bar_chart';
import HighLightText from '../../modules/_global/HighLightText';
import { formatNumber, largeValue, formatNumberNew2 } from '../../lib/base/functionUtil';
import { dataStorage } from '../../storage';
import performanceEnum from '../../constants/performance';
import Perf from '../../lib/base/performance_monitor';
import Enum from '../../enum'

const PRICE_DECIMAL = Enum.PRICE_DECIMAL

class HorizontalBarChartScreen extends React.Component {
  constructor(props) {
    super(props);
        this.colors = ['#6494ed', '#32cd32'];
    this.state = {
      legend: {
        enabled: false,
        textSize: 11 * CommonStyle.fontRatio,
        textColor: processColor('#485465'),
        fontFamily: CommonStyle.fontFamily,
        form: 'CIRCLE',
        position: 'RIGHT_OF_CHART_INSIDE',
        formSize: 8,
        xEntrySpace: 0,
        yEntrySpace: 0,
        wordWrapEnabled: true,
        maxSizePercent: 0.5
      },
      marker: {
        enabled: true,
        backgroundTint: processColor('#485465'),
        markerColor: processColor('#485465'),
        textColor: processColor('white'),
        textSize: 11
      },
      data: {
        dataSets: [{
          values: this.props.endValues,
          label: I18n.t('endOfPeriod'),
          config: {
            drawValues: false,
            colors: [processColor(this.colors[1])],
            axisDependency: 'RIGHT'
          }
        },
        {
          values: this.props.isSameDay === false ? this.props.startValues : [{ y: 0, marker: '' }, { y: 0, marker: '' }, { y: 0, marker: '' }],
          // values: this.props.startValues,
          label: I18n.t('startOfPeriod'),
          config: {
            drawValues: false,
            colors: [processColor(this.colors[0])],
            axisDependency: 'RIGHT'
          }
        }],
        config: {
          barWidth: 0.25,
          group: {
            fromX: this.props.isSameDay ? -0.15 : -0.3,
            groupSpace: 0.3,
            barSpace: 0.03
          }
        }
      },
      xAxis: {
        enabled: true,
        avoidFirstLastClipping: true,
        drawValues: true,
        position: 'BOTTOM',
        drawAxisLine: false,
        drawGridLines: false,
        labelCount: 3,
        valueFormatter: [`${I18n.t('portfolioSummary')}`, `${I18n.t('cash')}`, `${I18n.t('holdings')}`],
        textColor: processColor(CommonStyle.fontColor)
      },
      yAxis: {
        left: {
          enabled: false
        },
        right: {
          enabled: true,
          drawAxisLine: false,
          drawGridLines: true,
          gridColor: processColor('#0000001e'),
          gridLineWidth: 0.5,
          textColor: processColor(CommonStyle.fontColor),
          textSize: 11 * CommonStyle.fontRatio,
          fontFamily: CommonStyle.fontFamily,
          labelCount: 5,
          axisMaximum: this.getAxisMaximum(),
          axisMinimum: 0,
          valueFormatter: 'largeValue',
          granularity: this.getGranularity()
        }
      }
    };
  }

  getAxisMaximum() {
    let currentMax = this.props.maximum;
    let max = this.props.maximum;
    let step = parseInt(max / 5);
    if ((step * 5) < currentMax) {
      return step * 6
    }
    return step * 5;
  }

  getGranularity() {
    let currentMax = this.props.maximum;
    let max = this.props.maximum;
    return step = parseInt(max / 5);
  }

  render() {
    return (
      <View testID={this.props.testID} style={[CommonStyle.chartContainer, { width: '100%', paddingLeft: dataStorage.platform === 'ios' ? 0 : 8 }]}>
        <View style={styles.legendContainer}>
          {this.props.isSameDay ? null : <View style={[styles.circle, { backgroundColor: this.colors[0] }]}></View>}
          {this.props.isSameDay ? null : <Text style={[CommonStyle.legendText, { marginRight: 16 }]}>{I18n.t('startOfPeriod')}</Text>}
          {this.props.isSameDay ? null : <View style={[styles.circle, { backgroundColor: this.colors[1] }]}></View>}
          <Text style={CommonStyle.legendText}>{this.props.isSameDay ? ' ' : I18n.t('endOfPeriod')}</Text>
        </View>
        <View style={{ flexDirection: 'row', height: '80%', paddingLeft: dataStorage.platform === 'ios' ? 0 : 8, bottom: 16 }}>
          <HorizontalBarChart
            style={{ width: '80%', height: 240, backgroundColor: 'transparent' }}
            chartDescription={{ text: '' }}
            data={this.state.data}
            xAxis={this.state.xAxis}
            yAxis={this.state.yAxis}
            legend={this.state.legend}
            marker={this.state.marker}
            gridBackgroundColor={processColor('#ffffff')}
            drawBarShadow={false}
            drawValueAboveBar={false}
            drawHighlightArrow={true}
            pinchZoom={false}
            scaleEnabled={false}
            scaleXEnabled={false}
            scaleYEnabled={false}
            dragEnabled={false}
            doubleTapToZoomEnabled={false}
          />
          {
            this.props.isSameDay
              ? <View style={{ height: '100%', width: '20%' }} />
              : <View style={{ height: '100%', width: '20%', alignItems: 'center' }}>
                <TouchableOpacity style={{ left: -10 }} onPress={() => alert(PixelRatio.getFontScale())}>
                  <Text style={[CommonStyle.legendText]}>+/-</Text>
                </TouchableOpacity>
                <HighLightText style={[styles.changeValue, { marginTop: 25 }]}
                  base={formatNumberNew2(this.props.data.holdingChange, PRICE_DECIMAL.VALUE)}
                  value={formatNumberNew2(this.props.data.holdingChange, PRICE_DECIMAL.VALUE)} />
                <HighLightText style={[styles.changeValue]}
                  base={formatNumberNew2(this.props.data.cashChange, PRICE_DECIMAL.VALUE)}
                  value={formatNumberNew2(this.props.data.cashChange, PRICE_DECIMAL.VALUE)} />
                <HighLightText style={[styles.changeValue]}
                  base={formatNumberNew2(this.props.data.portfolioChange, PRICE_DECIMAL.VALUE)}
                  value={formatNumberNew2(this.props.data.portfolioChange, PRICE_DECIMAL.VALUE)} />
              </View>
          }
        </View>
      </View>
    );
  }
}

export default HorizontalBarChartScreen;
