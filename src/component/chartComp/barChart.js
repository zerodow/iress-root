import React from 'react';
import { Platform, StyleSheet, processColor } from 'react-native';
import _ from 'lodash';

import I18n from '~/modules/language/';
import { BarChart } from 'react-native-charts-wrapper';

import Enum from '~/enum';
import * as Util from '~/util';

const { PRICE_FILL_TYPE, THEME } = Enum;

class BarChartScreen extends React.Component {
    constructor() {
        super();

        this.state = {
            offset: undefined,
            xAxis: {
                enabled: false
            }
        };
        if (Platform.OS === 'ios') {
            this.state.offset = { top: 0, bottom: 0, left: 0, right: 0 };
        }
    }

    componentDidMount() {
        if (Platform.OS === 'android') {
            setTimeout(() => {
                this.setOffset({ top: 0, bottom: 0, left: 0, right: 0 });
            }, 100);
        }
    }

    setOffset = (offset) => {
        this.setState({ offset: { ...offset, top: 0, bottom: 0 } });
    };

    handleSelect(event) {
        let entry = event.nativeEvent;
        if (entry == null) {
            this.setState({ ...this.state, selectedEntry: null });
        } else {
            this.setState({
                ...this.state,
                selectedEntry: JSON.stringify(entry)
            });
        }

        console.log(event.nativeEvent);
    }

    getBarChartData() {
        const { listVolume, symbol, filterType } = this.props;

        const curResult = [...listVolume];

        if (filterType === PRICE_FILL_TYPE._1D) {
            const isAuBySymbol = Util.isAuBySymbol(symbol);
            const now = new Date().getTime();
            const isCloseSession = Util.checkCloseSessionBySymbol(
                now,
                isAuBySymbol
            );

            if (!isCloseSession) {
                const size = isAuBySymbol ? 74 : 78;
                curResult.push({
                    y: 0,
                    x: size
                });
            } else {
                if (Platform.OS === 'android') {
                    curResult.push({
                        y: 0,
                        x: _.size(listVolume)
                    });
                }
            }
        } else {
            if (Platform.OS === 'android') {
                curResult.push({
                    y: 0,
                    x: _.size(listVolume)
                });
            }
        }

        const obj = {
            dataSets: []
        };
        if (!_.isEmpty(curResult)) {
            obj['dataSets'] = [
                {
                    values: curResult,
                    label: I18n.t('bar'),
                    config: {
                        highlightColor: processColor('orange'),
                        highlightLineWidth: 1,
                        color: processColor('#d8d8d8'),
                        drawValues: false,
                        axisDependency: 'LEFT'
                    }
                }
            ];
        }

        obj['config'] = {
            barWidth: 0.75,
            fitBars: false
        };

        return obj;
    }

    render() {
        const data = this.getBarChartData();
        return (
            <BarChart
                pointerEvents="none"
                viewPortOffsets={this.state.offset}
                style={[styles.chart, { marginTop: 15 }]}
                data={data}
                chartDescription={{ text: '' }}
                xAxis={this.state.xAxis}
                legend={{ enabled: false }}
                gridBackgroundColor={processColor('#ffffff')}
                // visibleRange={{ x: { min: 5, max: 5 } }}
                drawBarShadow={false}
                drawValueAboveBar={false}
                drawHighlightArrow={false}
                // onSelect={this.handleSelect.bind(this)}
                // highlights={this.state.highlights}
                // onChange={event => console.log(event.nativeEvent)}
                yAxis={{
                    left: {
                        enabled: false
                    },
                    right: {
                        enabled: false
                    }
                }}
            />
        );
    }
}

const styles = StyleSheet.create({
    chart: {
        height: 30
    }
});

export default BarChartScreen;
