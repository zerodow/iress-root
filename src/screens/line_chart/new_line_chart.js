import React, { Component, PropTypes } from 'react'
import { View, processColor, PixelRatio, Text } from 'react-native';
import { LineChart } from 'react-native-charts-wrapper';
import { logAndReport } from '../../lib/base/functionUtil';
import I18n from '../../modules/language';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import { dataStorage } from '../../storage'

const greenBlue = 'rgb(255, 0, 151)';
const petrel = 'rgb(255, 255, 255)';
export class Chart extends Component {
    constructor(props) {
        super(props);
                this.state = {
            listData1: props.data1,
            listData2: props.data2,
            labels: props.labels,
            maximum: props.axisMaximum,
            minimum: props.axisMinimum,
            data: {
                dataSets: [
                    {
                        values: props.data1,
                        label: props.label1,
                        config: {
                            lineWidth: 2,
                            mode: 'CUBIC_BEZIER',
                            drawValues: false,
                            drawCircles: false,
                            highlightColor: processColor('rgba(0, 0, 0, 0.54)'),
                            color: processColor(greenBlue),
                            drawFilled: true,
                            // fillColor: processColor('#4a90e2'),
                            fillGradient: {
                                colors: [processColor(greenBlue), processColor(petrel)],
                                positions: [0, 0.5],
                                angle: 90,
                                orientation: 'TOP_BOTTOM'
                            },
                            fillAlpha: 1000,
                            valueTextSize: 14 * CommonStyle.fontRatio,
                            valueFormatter: props.formater,
                            axisDependency: 'RIGHT'
                        }
                    },
                    {
                        values: props.data2,
                        label: props.label2,
                        config: {
                            mode: 'CUBIC_BEZIER',
                            lineWidth: 2,
                            drawValues: false,
                            drawCircles: false,
                            highlightColor: processColor('rgba(0, 0, 0, 0.54)'),
                            color: processColor('#d21028'),
                            drawFilled: false,
                            fillColor: processColor('#96b9dd'),
                            fillAlpha: 60,
                            valueTextSize: 14 * CommonStyle.fontRatio,
                            valueFormatter: props.formater,
                            axisDependency: 'RIGHT'
                        }
                    }
                ]
            },
            marker: {
                enabled: true,
                backgroundTint: processColor('#f9f9f9'),
                markerColor: processColor('#f9f9f9'),
                textColor: processColor('rgba(0, 0, 0, 0.87)'),
                textSize: 14
            },
            legend: {
                enabled: false
            },
            xAxis: {
                position: 'BOTTOM',
                valueFormatter: props.labels || [],
                textColor: processColor('rgba(0, 0, 0, 0.54)'),
                textSize: 10 * CommonStyle.fontRatio,
                fontFamily: CommonStyle.fontMedium,
                drawGridLines: false,
                drawLabels: false,
                drawAxisLine: false,
                axisLineColor: processColor('black'),
                axisLineWidth: 1,
                labelCountForce: true,
                granularityEnabled: true,
                drawLimitLinesBehindData: true,
                avoidFirstLastClipping: true,
                centerAxisLabels: false
            },
            yAxis: {
                right: {
                    enabled: true,
                    drawGridLines: false,
                    drawAxisLine: false,
                    drawLabels: false,
                    textColor: processColor('rgba(0, 0, 0, 0.54)'),
                    textSize: 10 * CommonStyle.fontRatio,
                    fontFamily: CommonStyle.fontMedium,
                    position: 'OUTSIDE_CHART',
                    labelCount: props.labelCount,
                    labelCountForce: true,
                    axisMaximum: props.axisMaximum,
                    axisMinimum: props.axisMinimum,
                    granularity: 2,
                    valueFormatter: props.formater,
                    zeroLine: { enabled: true, lineWidth: 1.5, lineColor: processColor('gray') }
                },
                left: {
                    enabled: false
                },
                limitLines: [
                    {
                        limit: 0,
                        lineColor: processColor('gray'),
                        lineWidth: 2
                    }
                ]
            }
        };
    }

    // componentWillReceiveProps(nextProps) {
    //     if (nextProps && (nextProps.listData !== this.state.listData || nextProps.axisMinimum !== this.state.minimum ||
    //         nextProps.axisMaximum !== this.state.maximum || nextProps.labels !== this.state.labels)) {
    //         this.setState({
    //             listData: nextProps.data,
    //             code: nextProps.code,
    //             labels: nextProps.labels,
    //             maximum: nextProps.axisMaximum,
    //             minimum: nextProps.axisMinimum,
    //             data: {
    //                 dataSets: [{
    //                     values: nextProps.data,
    //                     label: nextProps.code,
    //                     config: {
    //                         lineWidth: 2,
    //                         drawValues: false,
    //                         drawCircles: false,
    //                         highlightColor: processColor('rgba(0, 0, 0, 0.54)'),
    //                         color: processColor('#96b9dd'),
    //                         drawFilled: true,
    //                         fillColor: processColor('#96b9dd'),
    //                         fillAlpha: 60,
    //                         valueTextSize: 14 * CommonStyle.fontRatio,
    //                         valueFormatter: nextProps.formater,
    //                         axisDependency: 'RIGHT'
    //                     }
    //                 }]
    //             },
    //             marker: {
    //                 enabled: true,
    //                 backgroundTint: processColor('#f9f9f9'),
    //                 markerColor: processColor('#f9f9f9'),
    //                 textColor: processColor('rgba(0, 0, 0, 0.87)'),
    //                 textSize: 14
    //             },
    //             legend: {
    //                 enabled: false
    //             },
    //             xAxis: {
    //                 position: 'BOTTOM',
    //                 valueFormatter: nextProps.labels || [],
    //                 textColor: processColor('rgba(0, 0, 0, 0.54)'),
    //                 textSize: 10 * CommonStyle.fontRatio,
    //                 fontFamily: CommonStyle.fontMedium,
    //                 drawGridLines: false,
    //                 drawAxisLine: true,
    //                 axisLineColor: processColor('black'),
    //                 axisLineWidth: 1,
    //                 labelCountForce: true,
    //                 granularityEnabled: true,
    //                 drawLimitLinesBehindData: true,
    //                 avoidFirstLastClipping: true,
    //                 centerAxisLabels: false
    //             },
    //             yAxis: {
    //                 right: {
    //                     enabled: true,
    //                     drawAxisLine: false,
    //                     textColor: processColor('rgba(0, 0, 0, 0.54)'),
    //                     textSize: 10 * CommonStyle.fontRatio,
    //                     fontFamily: CommonStyle.fontMedium,
    //                     position: 'OUTSIDE_CHART',
    //                     labelCount: nextProps.labelCount,
    //                     labelCountForce: true,
    //                     axisMaximum: nextProps.axisMaximum,
    //                     axisMinimum: nextProps.axisMinimum,
    //                     granularity: 2,
    //                     valueFormatter: nextProps.formater
    //                 },
    //                 left: {
    //                     enabled: false
    //                 }
    //             }
    //         });
    //     }
    // }

    render() {
        return (
            <View testID={this.props.testID} style={{ flex: 1, width: '100%' }}>
                {
                    this.state.listData1 && this.state.listData1.length > 0 ? <LineChart
                        testID={`${this.props.testID}LineChart`}
                        style={{ flex: 1, backgroundColor: 'white' }}
                        data={this.state.data}
                        legend={this.state.legend}
                        marker={this.state.marker}
                        xAxis={this.state.xAxis}
                        yAxis={this.state.yAxis}
                        drawGridBackground={false}
                        noDataText={'No chart data'}
                        drawBorders={false}
                        touchEnabled={true}
                        dragEnabled={true}
                        scaleEnabled={true}
                        scaleXEnabled={true}
                        scaleYEnabled={true}
                        pinchZoom={true}
                        doubleTapToZoomEnabled={true}
                        chartDescription={{ text: '' }}
                        dragDecelerationEnabled={true}
                        dragDecelerationFrictionCoef={0.99}
                        keepPositionOnRotation={false}
                        touchEnabled={this.props.touchEnabled}
                        onSelect={this.props.onSelect}
                    /> : <LineChart
                            testID={`${this.props.testID}LineChart`}
                            style={{ flex: 1, backgroundColor: 'white' }}
                            legend={{}}
                            marker={{}}
                            xAxis={{}}
                            yAxis={{}}
                            drawGridBackground={false}
                            noDataText={I18n.t('noChartData')}
                            drawBorders={false}
                            touchEnabled={true}
                            dragEnabled={true}
                            scaleEnabled={true}
                            scaleXEnabled={true}
                            scaleYEnabled={true}
                            pinchZoom={true}
                            doubleTapToZoomEnabled={true}
                            chartDescription={{ text: '' }}
                            dragDecelerationEnabled={true}
                            dragDecelerationFrictionCoef={0.99}
                            keepPositionOnRotation={false}
                            touchEnabled={this.props.touchEnabled}
                        />
                }
            </View>
        )
    }
}

export default Chart;
