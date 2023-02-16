import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'

import TabStart from './TabStart'
import TabEnd from './TabEnd'
import TabMidle from './TabMidle'

import PropTypes from 'prop-types'
const TabShapeSecond = (props) => {
    const { spaceWidth, onChangeTab, tabs, defaultActive, disablChangeTab, disabledFirstTab } = props
    const [activeTabs, setActive] = useState(defaultActive)
    const handleChangeTab = ({ key }, index) => {
        if (activeTabs[key]) {
            delete activeTabs[key]
            if (index === 0) {
                delete activeTabs[tabs[1]['key']]
            }
        } else {
            activeTabs[key] = true
            if (index === 1) {
                activeTabs[tabs[0]['key']] = true
            }
        }
        setActive({ ...activeTabs })
        onChangeTab(activeTabs)
    }
    return (
        <View style={styles.app}>
            {tabs.map((el, index) => {
                const isActive = activeTabs && !!activeTabs[el.key];
                const disabled = !!disablChangeTab
                if (index === 0) {
                    return (
                        <TouchableOpacity
                            disabled={disabled || !!disabledFirstTab}
                            onPress={() => {
                                handleChangeTab(el, index)
                            }}
                        >
                            <TabStart tab={el} title={el.title} isActive={isActive} tabWidth={el.width} {...props} />
                        </TouchableOpacity>
                    );
                }

                if (index === tabs.length - 1) {
                    return (
                        <TouchableOpacity
                            disabled={disabled}
                            onPress={() => {
                                handleChangeTab(el, index)
                            }}
                        >
                            <TabEnd tab={el} tabLength={tabs.length} title={el.title} isActive={isActive} tabWidth={el.width} {...props} />
                        </TouchableOpacity>
                    );
                }
            })}
        </View>
    );
}
TabShapeSecond.propTypes = {}
TabShapeSecond.defaultProps = {}
const styles = StyleSheet.create({
    app: {
        flexDirection: 'row'
    }
});
export default TabShapeSecond
