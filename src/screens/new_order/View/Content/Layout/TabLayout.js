import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { View, Text, Dimensions } from 'react-native'
import PropTypes from 'prop-types'

import TabShape from '~/component/tabs_shape/index.js'
import { useDispatch, useSelector, shallowEqual } from 'react-redux'
import { changeLayout } from '~/screens/new_order/Redux/actions.js'

import CommonStyle from '~/theme/theme_controller'

import * as TabModel from '~/screens/new_order/Model/TabModel.js'
const { width } = Dimensions.get('window')
const margin = 16
const padding = 4
const grat = 6
const widthTab = ((width / 2) - margin + (grat - padding)) / 2
const TabLayout = React.memo(() => {
    const layout = useSelector(state => state.newOrder.layout, shallowEqual)
    const dispatch = useDispatch()
    const onChangeTab = useCallback((el) => {
        TabModel.setTabLayout(el.key)
        dispatch(changeLayout(el.key))
    }, [])
    return (
        <View style={{
            height: 50,
            flex: 1
        }}>
            <TabShape
                key={layout}
                tabs={[
                    {
                        title: 'BASIC',
                        key: 'BASIC',
                        value: 'BASIC'
                    },
                    {
                        title: 'ADVANCED',
                        key: 'ADVANCE',
                        value: 'ADVANCE'
                    }
                ]}
                defaultActive={TabModel.model.layout}
                onChangeTab={onChangeTab}
                tabWidth={widthTab}
                tabHeight={31}
                grat={grat}
                strockWidth={1}
                padding={padding}
                strockColor={CommonStyle.color.dusk}
                fillColorDefault={CommonStyle.backgroundColor}
                fillColorActive={CommonStyle.color.modify}
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
TabLayout.propTypes = {}
TabLayout.defaultProps = {}
export default TabLayout
