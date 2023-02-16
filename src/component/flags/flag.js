import React, { Component } from 'react';
import ENUM from '~/enum'
import { View, Image } from 'react-native'
import AU from './img/AU.png'
import CN from './img/CN.png'
import EU from './img/EU.png'
import GB from './img/GB.png'
import US from './img/US.png'
import VI from './img/VI.png'

export default class Flag extends Component {
    mappingImage = this.mappingImage.bind(this)
    mappingImage() {
        // Remove flag all app
        return null
        switch (this.props.code) {
            case ENUM.FLAG.GB:
                return GB
            case ENUM.FLAG.EU:
                return EU
            case ENUM.FLAG.AU:
                return AU
            case ENUM.FLAG.US:
                return US
            case ENUM.FLAG.CN:
                return CN
            case ENUM.FLAG.VI:
                return VI
            default:
                return AU
        }
    }

    render() {
        const defaultTextStyle = {}
        const defaultWrapperStyle = { paddingTop: 2 }
        const textStyle = this.props.textStyle || {};
        const wrapperStyle = this.props.wrapperStyle || {};
        const code = this.mappingImage()
        if (!code) return null;
        return <View
            pointerEvents={'box-none'}
            style={[defaultWrapperStyle, wrapperStyle]}>
            <Image
                source={code}
                style={[{ width: 20, height: 20 }, defaultTextStyle, textStyle]} />
        </View>
    }
}
