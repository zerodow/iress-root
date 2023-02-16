import React, { PureComponent } from 'react';
import { View, StyleSheet, Platform } from 'react-native';

import * as FunctionUtil from '~/lib/base/functionUtil';
import LeftComp from './DefaultLeftHeader'
import MainComp from './DefaultMainHeader'
import RightComp from './DefaultRightHeader'

export default class HeaderNavBar extends PureComponent {
    render() {
        return null;
        // return (
        //     <View style={[styles.container, this.props.style]}>
        //         <LeftComp />
        //         <MainComp />
        //         <View
        //             style={[
        //                 styles.leftComp,
        //                 this.props.rightStyles
        //             ]}
        //         >
        //             <RightComp />
        //         </View>
        //     </View>
        // )
    }
}

const isIphone = Platform.OS === 'ios';
const isIphoneXorAbove = FunctionUtil.isIphoneXorAbove();
let marginTop = 0;
if (isIphone && isIphoneXorAbove) marginTop = 16 + 16;
if (isIphone && !isIphoneXorAbove) marginTop = 16;

export const topSpace = marginTop;

export const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        marginTop,
        backgroundColor: 'transparent',
        alignItems: 'center'
    },
    leftComp: {
        flex: 1,
        flexDirection: 'row',
        borderColor: '#fff',
        justifyContent: 'flex-end'
    }
});
