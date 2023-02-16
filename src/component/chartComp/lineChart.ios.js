import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    processColor,
    Platform,
    Dimensions
} from 'react-native';
import _ from 'lodash';
import moment from 'moment-timezone';
import { LineChart } from 'react-native-charts-wrapper';

import Enum from '~/enum';
import CommonStyle from '~/theme/theme_controller';
import { formatNumberNew2 } from '~/lib/base/functionUtil';
import LineChartFunc from './lineChart.func';
import I18n from '~/modules/language/';

const { PRICE_DECIMAL, PRICE_FILL_TYPE } = Enum;
const { width, height } = Dimensions.get('window');
const min = 0;
const textWidth = 64;
const distance = textWidth + 24;

const Info = (props) => (
    <Text
        style={{
            fontFamily: CommonStyle.fontBold,
            fontSize: CommonStyle.font10,
            left: props.left,
            position: 'absolute',
            color: CommonStyle.fontColor
        }}
        {...props}
    />
);

class LineChartScreen extends React.Component {
    constructor(props) {
        super(props);
        this.dicPoint = [];
        this.lineChart = new LineChartFunc();
        this.state = {
            pointArea: []
        };

        this.offset = {
            top: 15,
            bottom: 15,
            left: 0,
            right: 0
        };

        this.marker = {
            enabled: false,
            digits: 2,
            backgroundTint: processColor('teal'),
            markerColor: processColor('#F0C0FF8C'),
            textColor: processColor('white')
        };
    }

    handleSelect = this.handleSelect.bind(this);
    handleSelect(event) {
        let entry = event.nativeEvent;
        if (entry === null) return;

        if (this.isLongPress) {
            if (entry.data && entry.data.marker) {
                this.dicPoint.push({ ...entry, touchPos: this.isLongPress });
                if (_.size(this.dicPoint) > 2) {
                    this.dicPoint = _.drop(this.dicPoint);
                }

                this.setState({ pointArea: this.dicPoint });
            }

            const highlights = [];
            _.forEach(this.dicPoint, (point) => {
                highlights.push({ x: point.x });
            });

            this.highlights(highlights);
        } else {
            this.dicPoint = [];
            this.highlights([]);
            this.setState({ pointArea: [] });
        }
    }

    onTouchStart = this.onTouchStart.bind(this);
    onTouchStart() {
        this.timeStart = new Date().getTime();
    }

    onTouchEnd = this.onTouchEnd.bind(this);
    onTouchEnd(e) {
        const { pageX } = e.nativeEvent;
        const currentTime = new Date().getTime();
        if (currentTime - this.timeStart > 200) {
            this.isLongPress = { pageX };
        } else {
            this.isLongPress = false;
        }
    }

    highlights(p) {
        if (
            this._lineChart &&
            this._lineChart.highlights &&
            typeof this._lineChart.highlights === 'function'
        ) {
            this._lineChart.highlights(p);
        }
    }

    setRef = this.setRef.bind(this);
    setRef(sef) {
        this._lineChart = sef;
    }

    formatNumber(value) {
        const valueAsString = String(value);
        let [first, second] = valueAsString.split('.');
        const size = _.size(first);
        let decimal = 0;
        if (size >= 4) {
            decimal = 2;
        } else if (size >= 2) {
            decimal = 3;
        } else {
            decimal = 4;
        }

        first = first.replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
        let newSecond = '';
        for (let index = 0; index < decimal; index++) {
            newSecond += second[index] || 0;
        }

        return [first, newSecond].join('.');
    }

    formatPrice = this.formatPrice.bind(this);
    formatPrice(price) {
        try {
            const priceNum = parseFloat(price);
            return this.formatNumber(priceNum);
        } catch (error) {
            return price;
        }
    }

    formatVolume = this.formatVolume.bind(this);
    formatVolume(volume) {
        try {
            const volumeNum = parseInt(volume);
            return formatNumberNew2(volumeNum, PRICE_DECIMAL.VOLUME);
        } catch (error) {
            return volume;
        }
    }

    getTimeSelected() {
        let [firstPoint, secondPoint] = this.state.pointArea;
        if (!firstPoint) return '';
        if (firstPoint && secondPoint) {
            if (firstPoint.data.marker > secondPoint.data.marker) {
                const dicPoint = firstPoint;
                firstPoint = secondPoint;
                secondPoint = dicPoint;
            }
        }

        const DAY_FORMAT = 'DD MMM YYYY';
        const TIME_FORMAT = 'HH:mm';
        const LOC = Enum.LOCATION.AU;
        const FILTER = this.props.filterType;

        const result = [];
        if (firstPoint) {
            result.push(
                moment.tz(firstPoint.data.marker, LOC).format(DAY_FORMAT)
            );
        }

        if (secondPoint) {
            if (FILTER === PRICE_FILL_TYPE._1D) {
                result.push(', ');
                result.push(
                    moment.tz(firstPoint.data.marker, LOC).format(TIME_FORMAT)
                );
                result.push(' - ');
                result.push(
                    moment.tz(secondPoint.data.marker, LOC).format(TIME_FORMAT)
                );
            } else if (
                FILTER === PRICE_FILL_TYPE._1W ||
                FILTER === PRICE_FILL_TYPE._1M
            ) {
                result.push(', ');
                result.push(
                    moment.tz(firstPoint.data.marker, LOC).format(TIME_FORMAT)
                );
                result.push(' - ');
                result.push(
                    moment
                        .tz(secondPoint.data.marker, LOC)
                        .format(DAY_FORMAT + ', ' + TIME_FORMAT)
                );
            } else {
                result.push(' - ');
                result.push(
                    moment.tz(secondPoint.data.marker, LOC).format(DAY_FORMAT)
                );
            }
        } else {
            if (
                FILTER === PRICE_FILL_TYPE._1D ||
                FILTER === PRICE_FILL_TYPE._1W ||
                FILTER === PRICE_FILL_TYPE._1M
            ) {
                result.push(' ');
                result.push(I18n.t('at'));
                result.push(' ');
                result.push(
                    moment.tz(firstPoint.data.marker, LOC).format(TIME_FORMAT)
                );
            }
        }

        return result.join('');
    }

    renderInfo() {
        const { left = 0, right = 0 } = this.offset;
        const max = width - left - right;
        const [firstPoint, secondPoint] = this.state.pointArea;
        let firstPointPrice = '';
        let firstPointVolume = '';
        let secondPointPrice = '';
        let secondPointVolume = '';

        let result = [];

        if (firstPoint) {
            firstPointPrice = this.formatPrice(firstPoint.data.y);
            firstPointVolume = this.formatVolume(firstPoint.data.volume);
            let leftFirstPoint = firstPoint.touchPos.pageX;
            if (max - leftFirstPoint < textWidth) {
                leftFirstPoint = leftFirstPoint - textWidth;
            }
            result.push(
                <Info key="firstPoint" left={leftFirstPoint}>
                    {`${firstPointPrice}@${firstPointVolume}`}
                </Info>
            );
        }

        if (secondPoint) {
            secondPointPrice = this.formatPrice(secondPoint.data.y);
            secondPointVolume = this.formatVolume(secondPoint.data.volume);
            let leftFirstPoint = firstPoint.touchPos.pageX;
            let leftSecondPoint =
                firstPoint.touchPos.pageX <= secondPoint.touchPos.pageX
                    ? leftFirstPoint + distance
                    : leftFirstPoint - distance;
            if (max - leftFirstPoint < textWidth) {
                leftFirstPoint = leftFirstPoint - textWidth;
                leftSecondPoint = leftFirstPoint - distance;
            }
            result.push(
                <Info key="secondPoint" left={leftSecondPoint}>
                    {`${secondPointPrice}@${secondPointVolume}`}
                </Info>
            );
        }

        if (firstPoint && secondPoint) {
            let leftFirstPoint = 0;
            let leftSecondPoint = 0;
            // 1> Gan trai
            if (
                firstPoint.touchPos.pageX - min < textWidth ||
                secondPoint.touchPos.pageX - min < textWidth
            ) {
                if (firstPoint.touchPos.pageX <= secondPoint.touchPos.pageX) {
                    // First <= Second -> First lam chuan
                    leftFirstPoint = firstPoint.touchPos.pageX;
                    leftSecondPoint = leftFirstPoint + distance;
                } else {
                    // First > Second -> Second lam chuan
                    leftSecondPoint = secondPoint.touchPos.pageX;
                    leftFirstPoint = leftSecondPoint + distance;
                }
                result = [
                    <Info
                        key="firstPoint"
                        left={leftFirstPoint}
                    >{`${firstPointPrice}@${firstPointVolume}`}</Info>,
                    <Info
                        key="secondPoint"
                        left={leftSecondPoint}
                    >{`${secondPointPrice}@${secondPointVolume}`}</Info>
                ];
            }

            // 2> Gan phai
            if (
                max - firstPoint.touchPos.pageX < textWidth ||
                max - secondPoint.touchPos.pageX < textWidth
            ) {
                if (firstPoint.touchPos.pageX <= secondPoint.touchPos.pageX) {
                    // First <= Second -> Second lam chuan
                    leftSecondPoint = secondPoint.touchPos.pageX - distance;
                    leftFirstPoint = leftSecondPoint - distance;
                } else {
                    // First > Second -> First lam chuan
                    leftFirstPoint = firstPoint.touchPos.pageX - distance;
                    leftSecondPoint = leftFirstPoint - distance;
                }
                result = [
                    <Info
                        key="firstPoint"
                        left={leftFirstPoint}
                    >{`${firstPointPrice}@${firstPointVolume}`}</Info>,
                    <Info
                        key="secondPoint"
                        left={leftSecondPoint}
                    >{`${secondPointPrice}@${secondPointVolume}`}</Info>
                ];
            }
        }

        return (
            <View style={{ width: '100%' }}>
                <Text
                    style={{
                        fontFamily: CommonStyle.fontBold,
                        fontSize: CommonStyle.font10,
                        textAlign: 'center',
                        color: CommonStyle.fontColor
                    }}
                >
                    {this.getTimeSelected()}
                </Text>
                <View
                    style={{
                        flexDirection: 'row',
                        height: 20,
                        alignItems: 'center'
                    }}
                >
                    {result}
                </View>
            </View>
        );
    }

    render() {
        const {
            maxRight,
            minRight,
            listLineData,
            preClosePrice,
            filterType,
            symbol
        } = this.props;

        const [firstPoint, secondPoint] = this.state.pointArea;

        this.lineChart.set({
            maxRight,
            minRight,
            listLineData,
            preClosePrice,
            filterType,
            firstPoint,
            secondPoint
        });

        const lineData = this.lineChart.get();
        const preData = this.lineChart.getPreData(symbol);
        const {
            granularityX,
            granularityY,
            XValueFormatter,
            YValueFormatter
        } = this.lineChart.getGranularity();
        let animation;
        if (this.preSize === 0) {
            animation = {
                durationX: 600,
                easingX: 'EaseInOutCubic'
            };
        }

        this.preSize = _.size(lineData);
        return (
            <React.Fragment>
                {this.renderInfo()}
                <View
                    onTouchStart={this.onTouchStart}
                    onTouchEnd={this.onTouchEnd}
                    style={{
                        borderTopWidth: 1,
                        borderColor: CommonStyle.fontDark + '30'
                    }}
                >
                    <LineChart
                        animation={animation}
                        ref={this.setRef}
                        viewPortOffsets={this.offset}
                        style={styles.chart}
                        data={{ dataSets: [...lineData, preData] }}
                        chartDescription={{ text: '' }}
                        legend={{
                            enabled: false
                        }}
                        xAxis={{
                            enabled: true,
                            granularity: granularityX,
                            drawLabels: true,
                            position: 'BOTTOM',
                            drawAxisLine: true,
                            drawGridLines: true,
                            fontFamily: CommonStyle.fontMedium,
                            textSize: CommonStyle.fontTiny,
                            textColor: processColor(CommonStyle.fontColor),
                            valueFormatter: XValueFormatter,
                            axisLineColor: processColor(
                                CommonStyle.gridColorHorizontal
                            ),
                            gridColor: processColor(
                                CommonStyle.gridColorHorizontal
                            ),
                            gridLineWidth: 0.5,
                            axisLineWidth: 0.5
                        }}
                        yAxis={{
                            left: {
                                enabled: false
                            },
                            right: {
                                enabled: false
                                // axisMaximum: maxRight,
                                // axisMinimum: minRight,
                                // drawLabels: true,
                                // enabled: true,
                                // drawAxisLine: false,
                                // axisLineColor: processColor(
                                // 	CommonStyle.gridColorHorizontal
                                // ),
                                // axisLineWidth: 0.5,
                                // drawGridLines: true,
                                // gridColor: processColor(
                                // 	CommonStyle.gridColorHorizontal
                                // ),
                                // gridLineWidth: 0.5,
                                // textColor: processColor(CommonStyle.fontColor),
                                // textSize: CommonStyle.fontTiny,
                                // fontFamily: CommonStyle.fontMedium,
                                // position: 'OUTSIDE_CHART',
                                // labelCountForce: true,
                                // granularity: granularityY,
                                // // granularityEnabled: true,
                                // valueFormatter: YValueFormatter,
                                // avoidFirstLastClipping: false
                            }
                        }}
                        autoScaleMinMaxEnabled={true}
                        drawGridBackground={false}
                        drawBorders={false}
                        touchEnabled={true}
                        dragEnabled={false}
                        scaleEnabled={false}
                        scaleXEnabled={false}
                        scaleYEnabled={false}
                        pinchZoom={false}
                        doubleTapToZoomEnabled={false}
                        dragDecelerationEnabled={true}
                        dragDecelerationFrictionCoef={0.99}
                        keepPositionOnRotation={false}
                        onSelect={this.handleSelect}
                        onChange={(event) => console.log(event.nativeEvent)}
                        highlights={[]}
                        marker={this.marker}
                    />
                </View>
            </React.Fragment>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5FCFF',
        padding: 20
    },
    chart: {
        height: 120
    }
});

export default LineChartScreen;
