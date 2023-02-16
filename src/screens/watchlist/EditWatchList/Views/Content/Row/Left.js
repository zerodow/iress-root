import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { View, Text, Image } from 'react-native'
import PropTypes from 'prop-types'
import Ionicons from 'react-native-vector-icons/Ionicons';
import SvgIcon from '~/component/svg_icon/SvgIcon.js'

import IconSelected from '~/img/icon/Selected.png'
import IconUnTick from '~/img/icon/Untick.png'
// Style
import CommonStyle, { register } from '~/theme/theme_controller'
const Left = ({ isSelected }) => {
    const icon = useMemo(() => {
        return <View style={{ width: 30 }}>
            {
                isSelected ?
                    <CommonStyle.icons.iconSelected />
                    : <CommonStyle.icons.iconUnTick />
            }
        </View>
        // return isSelected ? <Ionicons size={22} name='md-checkmark' color={CommonStyle.color.modify} /> : <Ionicons size={22} name='md-checkmark' color={CommonStyle.fontBorder} />
    }, [isSelected])
    return (
        <View style={{
            marginRight: 8
        }}>
            {icon}
        </View>
    )
}
Left.propTypes = {}
Left.defaultProps = {}
export default Left
