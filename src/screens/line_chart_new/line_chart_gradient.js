import React from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  processColor,
  LayoutAnimation
} from 'react-native';
import update from 'immutability-helper';

import { LineChart } from 'react-native-charts-wrapper';

const greenBlue = 'rgb(26, 182, 151)';
const petrel = 'rgb(59, 145, 153)';

class LineChartScreen extends React.Component {
  constructor() {
    super();

    this.state = {};
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <View style={styles.container}>
          <LineChart
            style={{ height: '100%', width: '100%' }}
            data={{
              dataSets: [
                {
                  values: this.props.accountBalance,
                  label: '',
                  config: {
                    mode: 'HORIZONTAL_BEZIER',
                    drawValues: false,
                    lineWidth: 0,
                    drawCircles: true,
                    circleColor: processColor(petrel),
                    drawCircleHole: false,
                    circleRadius: 0,
                    highlightColor: processColor('red'),
                    color: processColor(petrel),
                    drawFilled: true,
                    fillGradient: {
                      colors: [processColor('blue')],
                      positions: [100, 140],
                      angle: 90,
                      orientation: 'TOP_BOTTOM'
                    },
                    fillAlpha: 100,
                    valueTextSize: 15
                  }
                },
                {
                  values: this.props.allOrdinaries,
                  label: '',
                  config: {
                    mode: 'HORIZONTAL_BEZIER',
                    drawValues: false,
                    lineWidth: 2,
                    drawCircles: true,
                    circleColor: processColor(petrel),
                    drawCircleHole: false,
                    circleRadius: 0,
                    highlightColor: processColor('red'),
                    color: processColor('orange'),
                    drawFilled: false,
                    fillGradient: {
                      colors: [processColor('red')],
                      positions: [0, 0.5],
                      angle: 90,
                      orientation: 'TOP_BOTTOM'
                    },
                    fillAlpha: 200,
                    valueTextSize: 15
                  }
                }
              ]
            }}
            chartDescription={{ text: '' }}
            legend={{
              enabled: false
            }}
            marker={{
              enabled: true,
              markerColor: processColor('rgba(255,255,255,0.5)'),
              textColor: processColor('black')
            }}
            xAxis={{
              enabled: false
            }}
            yAxis={{
              left: {
                enabled: false
              },
              right: {
                enabled: true,
                labelCount: 5,
                labelCountForce: false
              }
            }}
            autoScaleMinMaxEnabled={true}
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
          />
        </View>
      </View>
    );
  }
}

const styles = {}

function getNewestStyle() {
	const newStyle = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: 'transparent'
    },
    chart: {
      height: 250
    }
  });

	PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

export default LineChartScreen;
