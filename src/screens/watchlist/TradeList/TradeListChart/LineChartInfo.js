import React, { useState } from 'react';
import _ from 'lodash';
import { Text, View, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';

import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func'

const { Value, multiply, cond, and, add, divide } = Animated;

const useLayout = () => {
    const [p] = useState(() => {
        const heightContent = new Value(0);

        const onLayout = ({
            nativeEvent: {
                layout: { width, height }
            }
        }) => {
            heightContent.setValue(height);
        };

        return [heightContent, onLayout];
    });

    return p;
};

const getPrePos = ({
    _heightComp,
    _heightContainer,
    maxValue,
    minValue,
    preClose
}) => {
    let percentBottom = 0;
    if (
        preClose &&
        minValue &&
        maxValue &&
        minValue &&
        maxValue - minValue > 0
    ) {
        percentBottom = (preClose - minValue) / (maxValue - minValue);
    }
    return add(
        multiply(_heightContainer, percentBottom),
        divide(_heightComp, 2),
        2
    );
};

const MaxValueInfo = ({ maxValue }) => (
    <Text
        style={[
            styles.info,
            {
                position: 'absolute',
                top: -10,
                right: 4
            }
        ]}
    >
        {_.floor(maxValue, 4)}
    </Text>
);

const MinValueInfo = ({ minValue }) => (
    <Text
        style={[
            styles.info,
            {
                position: 'absolute',
                bottom: 8 + CommonStyle.font11,
                right: 4
            }
        ]}
    >
        {_.floor(minValue, 4)}
    </Text>
);
const LineChartInfo = ({ maxValue, minValue, preClose, bottomOffset }) => {
    // without bottomOffset
    const [_heightContainer, onLayoutContainer] = useLayout();
    const [_heightComp, onLayoutContent] = useLayout();

    const bottom = getPrePos({
        _heightComp,
        _heightContainer,
        maxValue,
        minValue,
        preClose
    });

    const opacity = cond(and(_heightContainer, _heightComp), 1, 0);

    return (
        <View style={styles.container} onLayout={onLayoutContainer}>
            <MaxValueInfo maxValue={maxValue} />
            <MinValueInfo minValue={minValue} />

            <Animated.View
                onLayout={onLayoutContent}
                style={[
                    styles.borderText,
                    {
                        position: 'absolute',
                        bottom,
                        left: 0,
                        opacity
                    }
                ]}
            >
                <Text style={styles.info}>{_.floor(preClose, 4)}</Text>
            </Animated.View>
        </View>
    );
};

export default LineChartInfo;

const styles = {}
function getNewestStyle() {
	const newStyle = StyleSheet.create({
        container: {
            position: 'absolute',
            width: '100%',
            height: '100%'
        },
        info: {
            fontFamily: CommonStyle.fontPoppinsBold,
            fontSize: CommonStyle.font11,
            color: CommonStyle.fontWhite,
            opacity: 0.5
        },
        borderText: {
            backgroundColor: CommonStyle.color.dusk,
            borderRadius: 8,
            paddingHorizontal: 4
        }
    });
	PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)
