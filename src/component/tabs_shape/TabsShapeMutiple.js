import React, { useEffect, useState, useCallback, useMemo } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'

import TabStart from './TabStart'
import TabEnd from './TabEnd'
import TabMidle from './TabMidle'

import PropTypes from 'prop-types'
const TabsShapeMutiple = (props) => {
    const { spaceWidth, onChangeTab, tabs, defaultActive, disablChangeTab } = props
    const [activeTabs, setActive] = useState(defaultActive)
    const handleChangeTab = ({ key }) => {
        if (activeTabs[key]) {
            delete activeTabs[key]
        } else {
            activeTabs[key] = true
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
                            disabled={disabled}
                            onPress={() => {
                                handleChangeTab(el)
                            }}
                        >
                            <TabStart tab={el} title={el.title} isActive={isActive} {...props} />
                        </TouchableOpacity>
                    );
                }

                if (index === tabs.length - 1) {
                    return (
                        <TouchableOpacity
                            disabled={disabled}
                            onPress={() => {
                                handleChangeTab(el)
                            }}
                        >
                            <TabEnd tab={el} tabLength={tabs.length} title={el.title} isActive={isActive} {...props} />
                        </TouchableOpacity>
                    );
                }
                if (
                    index > 1 &&
                    index < tabs.length - 2 &&
                    tabs.length >= 5
                ) {
                    return (
                        <TouchableOpacity
                            disabled={disabled}
                            onPress={() => {
                                handleChangeTab(el)
                            }}
                            style={{
                                marginHorizontal: spaceWidth
                            }}
                        >
                            <TabMidle title={el.title} isActive={isActive} {...props} />
                        </TouchableOpacity>
                    );
                } else {
                    if (index === 1 && tabs.length > 3) {
                        return (
                            <TouchableOpacity
                                disabled={disabled}
                                onPress={() => {
                                    handleChangeTab(el)
                                }}
                            >
                                <TabMidle title={el.title} isActive={isActive} {...props} />
                            </TouchableOpacity>
                        );
                    }
                }
                return (
                    <TouchableOpacity
                        disabled={disabled}
                        onPress={() => {
                            handleChangeTab(el)
                        }}
                    >
                        <TabMidle title={el.title} isActive={isActive} {...props} />
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}
TabsShapeMutiple.propTypes = {}
TabsShapeMutiple.defaultProps = {}
const styles = StyleSheet.create({
    app: {
        flexDirection: 'row'
    }
});
export default TabsShapeMutiple
