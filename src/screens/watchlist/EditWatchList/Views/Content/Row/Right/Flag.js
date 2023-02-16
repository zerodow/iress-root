import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { View, Text } from 'react-native'
import PropTypes from 'prop-types'

import SvgIcon from '~/component/svg_icon/SvgIcon.js'

import * as Business from '~/business'
import Enum from '~/enum'
const Flag = ({ symbol, exchange }) => {
    const flag = useMemo(() => {
        return Business.getFlagBySymbolExchange({ symbol, exchange })
    }, [])
    const nameFlag = useMemo(() => {
        switch (flag) {
            case Enum.FLAG.AU:
                return 'auFlag'
            default:
                return 'usFlag'
        }
    }, [flag])
    return (
        <SvgIcon style={{
            marginRight: 8
        }} name={nameFlag} size={22} />
    )
}
Flag.propTypes = {}
Flag.defaultProps = {}
export default Flag
