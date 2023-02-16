import { getActiveTabProperty } from '../Model/'
import * as ANIMATION_DEFINITIONS from '~s/watchlist/Animator/definitions/';
import { TRANSFORM_STYLE_PROPERTIES } from '~s/watchlist/Animator/';
import Animated from 'react-native-reanimated'
import ENUM from '~/enum'
import _ from 'lodash'
const { ANIMATION_TYPE } = ENUM
const { interpolate } = Animated

export function getInputRange(index, options) {
    const {
        duration,
        numberListDelay, // after number list start ani
        itemDuration,
        itemDelay
    } = options
    const firstDelay = numberListDelay * itemDelay;
    const secondDelay = index * itemDelay;
    let totalDelay = firstDelay + secondDelay;
    totalDelay = totalDelay + itemDuration;
    totalDelay = Math.min(totalDelay, duration);
    totalDelay = totalDelay - itemDuration;

    return [
        totalDelay - 1,
        totalDelay,
        totalDelay + itemDuration,
        totalDelay + itemDuration + 1
    ];
}

export function getStyleConfig({ from, to }) {
    if (!from || !to) return;
    const obj = {};
    _.forEach(from, (value, key) => {
        obj[key] = {
            from: value,
            to: to[key]
        };
    });

    return obj;
}

export function getAniStyles(animated, animation, index, options) {
    const config = ANIMATION_DEFINITIONS[animation] || { from: 0, to: 0 };
    const styleConfig = getStyleConfig(config);
    const styles = {};
    _.forEach(styleConfig, (value, key) => {
        const mapState = interpolate(animated, {
            inputRange: getInputRange(index, options),
            outputRange: [value.from, value.from, value.to, value.to]
        });
        if (TRANSFORM_STYLE_PROPERTIES.indexOf(key) !== -1) {
            if (!styles.transform) {
                styles.transform = [];
            }
            styles.transform.push({
                [key]: mapState
            });
        } else {
            styles[key] = mapState;
        }
    });

    return styles;
}

export function getAnimationType() {
    const { prevActiveTab, activeTab } = getActiveTabProperty()
    if (prevActiveTab === null) {
        return ANIMATION_TYPE.FADE_IN
    }
    if (activeTab > prevActiveTab) {
        return ANIMATION_TYPE.FADE_IN_RIGHT
    }
    if (activeTab < prevActiveTab) {
        return ANIMATION_TYPE.FADE_IN_LEFT
    }
}
