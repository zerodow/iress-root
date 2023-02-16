import React, { useEffect, useState, useCallback, useMemo, useRef, useImperativeHandle } from 'react'
import { View, Text, StyleSheet } from 'react-native'

import AddToWLScreen from '~s/portfolio/View/AddToWL/'
import {
    useShowDetail, useShowHideTabbar, useShowHideBuySell,
    useShowSearchAccount, useSetDetailSpaceTop, useShowAddToWl
} from '~s/portfolio/Hook/'

const AddToWl = React.forwardRef((props, ref) => {
    const [refAddToWl, showAddToWl] = useShowAddToWl()
    useImperativeHandle(ref, () => ({
        showAddToWl: showAddToWl
    }), []);
    return (
        <AddToWLScreen
            showHideTabbar={() => { }}
            showHideBuySell={() => { }}
            ref={refAddToWl}
        />
    )
})
AddToWl.propTypes = {}
AddToWl.defaultProps = {}
const styles = StyleSheet.create({})
export default AddToWl
