import React, { useMemo, useCallback } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux'
import CommonStyle, { register } from '~/theme/theme_controller'

import { TYPE } from './BuySell'

function getColor(type) {
    switch (type) {
        case TYPE.BUY:
            return CommonStyle.fontOceanGreen
            break;
        default:
            return CommonStyle.color.sell
            break;
    }
}
const TradeButtonSticky = (props) => {
    const {
        isActive,
        title,
        style,
        onPress,
        isDisable,
        type
    } = props
    const [colorStyle, backgroundStyle, borderColor] = useMemo(() => {
        const color = getColor(type)
        if (isDisable) {
            return [
                { color: CommonStyle.fontNearLight6 },
                { backgroundColor: CommonStyle.color.dusk },
                {
                    borderColor: CommonStyle.color.dusk,
                    borderWidth: 1
                }
            ]
        }
        if (isActive) {
            return [{
                color: CommonStyle.fontDark
            }, {
                backgroundColor: color
            }, {
                borderColor: color,
                borderWidth: 1
            }]
        } else {
            return [
                {
                    color: color
                },
                { backgroundColor: CommonStyle.backgroundColor },
                {
                    borderColor: color,
                    borderWidth: 1
                }
            ]
        }
    }, [isActive, isDisable])
    const handlePress = useCallback(() => {
        onPress && onPress()
    }, [])
    if (type === TYPE.SELL) {
        return (
            <TouchableOpacity disabled={isDisable} onPress={handlePress} style={[style, backgroundStyle, borderColor, { borderRadius: 16, padding: 8 }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                    <Text style={[
                        {
                            fontSize: CommonStyle.fontSizeM,
                            fontFamily: CommonStyle.fontPoppinsBold
                        },
                        colorStyle
                    ]}>{title}</Text>

                </View>
            </TouchableOpacity>
        )
    }
    return (
        <TouchableOpacity disabled={isDisable} onPress={handlePress} style={[style, backgroundStyle, borderColor, { borderRadius: 16, padding: 8 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                <Text style={[
                    {
                        fontSize: CommonStyle.fontSizeM,
                        fontFamily: CommonStyle.fontPoppinsBold
                    },
                    colorStyle
                ]}>{title}</Text>

            </View>
        </TouchableOpacity>
    )
};
TradeButtonSticky.propTypes = {
    isActive: PropTypes.bool,
    title: PropTypes.string,
    style: PropTypes.object,
    onPress: PropTypes.func.isRequired,
    isDisable: PropTypes.bool,
    type: PropTypes.string
};
TradeButtonSticky.defaultProps = {
    onPress: () => { }
}
export default TradeButtonSticky;
