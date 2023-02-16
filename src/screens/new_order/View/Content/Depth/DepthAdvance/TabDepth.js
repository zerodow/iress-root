import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { View, Text, Dimensions } from 'react-native'
import PropTypes from 'prop-types'
import TabShape from '~/component/tabs_shape/index.js'

import CommonStyle from '~/theme/theme_controller'

import * as TabModel from '~/screens/new_order/Model/TabModel.js'
const { width } = Dimensions.get('window')
const margin = 8
const grat = 6
const padding = 4
const strockWidth = 1
const widthTab = ((width / 2) - 2 * margin + 2 * (grat - padding)) / 3
function getFillColorActive(keyTab) {
    switch (keyTab) {
        case 'BID':
            return CommonStyle.fontOceanGreen
            break;
        case 'ALL':
            return CommonStyle.color.modify
            break;

        default:
            return CommonStyle.fontOceanRed
            break;
    }
}
const TabDepth = React.memo(({ onChangeTab }) => {
    return (
        <View style={{
            height: 31,
            alignItems: 'center',
            paddingHorizontal: margin,
            right: -(grat - padding)
        }}>
            <TabShape
                tabs={[
                    {
                        title: 'BID',
                        key: 'BID',
                        value: 'BID'
                    },
                    {
                        title: 'ALL',
                        key: 'ALL',
                        value: 'ALL'
                    },
                    {
                        title: 'ASK',
                        key: 'ASK',
                        value: 'ASK'
                    }
                ]}
                onChangeTab={onChangeTab}
                widthTab={widthTab}
                defaultActive={TabModel.model.depth}
                tabWidth={widthTab}
                tabHeight={31}
                grat={grat}
                strockWidth={'1'}
                padding={padding}
                strockColor={CommonStyle.color.dusk}
                fillColorDefault={CommonStyle.backgroundColor}
                fillColorActive={CommonStyle.color.modify}
                getFillColorActive={getFillColorActive}
                styleTextDefault={
                    {
                        fontFamily: CommonStyle.fontPoppinsRegular,
                        fontSize: CommonStyle.fontSizeXS,
                        color: CommonStyle.fontNearLight4
                    }
                }
                styleTextActive={
                    {
                        fontFamily: CommonStyle.fontPoppinsBold,
                        fontSize: CommonStyle.fontSizeXS,
                        color: CommonStyle.fontDark
                    }
                }
            />
        </View>
    )
}, () => true)
TabDepth.propTypes = {}
TabDepth.defaultProps = {}
export default TabDepth
