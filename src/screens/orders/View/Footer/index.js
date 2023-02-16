import React, { } from 'react'
import {
    View, Text
} from 'react-native'
import BottomTabBar from '~/component/tabbar';

const Footer = ({ navigator, refFooter }) => {
    return <BottomTabBar
        ref={refFooter}
        navigator={navigator}
        index={4}
    />
}

export default Footer
