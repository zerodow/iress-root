
import React, { useEffect, useState, useCallback, useReducer, useMemo, useRef } from 'react'
import { View, Text, TouchableOpacity, Dimensions, StyleSheet, LayoutAnimation, UIManager, Platform } from 'react-native'
if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}
export const mapInitState = (state, init) => {
    console.info('state', state)
    return { ...state, ...init }
}

export const initState = {
    hoverComponent: null,
    item: {},
    data: []
}
export const TYPE = {
    'CHANGE_HOVER_COMPONENT': 'CHANGE_HOVER_COMPONENT',
    'CHANGE_DATA': 'CHANGE_DATA'
}
export function reducer(state, action) {
    switch (action.type) {
        case TYPE.CHANGE_HOVER_COMPONENT:
            return { ...state, ...action.payload }
        case TYPE.CHANGE_DATA:
            // LayoutAnimation.configureNext({
            //     duration: 50,
            //     create:
            //     {
            //         type: LayoutAnimation.Types.linear,
            //         property: LayoutAnimation.Properties.opacity
            //     },
            //     update:
            //     {
            //         type: LayoutAnimation.Types.linear
            //     }
            // });
            return { ...state, ...action.payload }
        default:
            return state
    }
}
