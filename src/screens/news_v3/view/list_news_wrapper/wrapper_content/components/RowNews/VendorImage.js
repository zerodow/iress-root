import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Text, View, Image, Platform } from 'react-native';
import RNFetchBlob from 'rn-fetch-blob'
import CommonStyle, { register } from '~/theme/theme_controller'
import * as HeaderModel from '~/screens/news_v3/model/header_list_news/header.model.js'
const TYPE_VENDOR = {
    TEXT: 'text',
    IMAGE: 'image'
}

let dirs = RNFetchBlob.fs.dirs
const { config, fs } = RNFetchBlob;
const isAndroid = Platform.OS === 'android'
const VendorImage = React.memo(({ vendorCode, vendorName }) => {
    const [uri, setUri] = useState('')
    const refImg = useRef(null)
    const vendorConfig = useMemo(() => {
        return HeaderModel.getVendorConfig()
    }, [])
    const type = useMemo(() => {
        const vendorCodeLowcase = vendorCode.toString().toLowerCase()
        const vendorConfigObj = vendorConfig[vendorCodeLowcase] || {}
        const type = vendorConfigObj['type']
        return type || TYPE_VENDOR.TEXT
    }, [vendorCode])

    const [error, setError] = useState(type === TYPE_VENDOR.TEXT)
    useEffect(() => {
        const vendorCodeLowcase = vendorCode.toString().toLowerCase()
        const vendorConfigObj = vendorConfig[vendorCodeLowcase] || {}
        const type = vendorConfigObj['type']
        if (type === TYPE_VENDOR.TEXT) {
            return
        }
        const path = `${dirs.DocumentDir}/vendor_image/${vendorCodeLowcase}.png`
        fs.exists(path).then((exists) => {
            if (exists) {
                if (Platform.OS === 'ios') {
                    refImg.current.setNativeProps({
                        source: [{ uri: `file://${path}` }]
                    })
                } else {
                    refImg.current.setNativeProps({
                        src: [{ uri: `file://${path}` }]
                    })
                }
            } else {
                if (Platform.OS === 'ios') {
                    refImg.current.setNativeProps({
                        source: [{ uri: `https://dev1.equixapp.com/img/vendor-logo/${vendorCodeLowcase}.png` }]
                    })
                } else {
                    refImg.current.setNativeProps({
                        src: [{ uri: `https://dev1.equixapp.com/img/vendor-logo/${vendorCodeLowcase}.png` }]
                    })
                }
            }
        })
    }, [])
    return (
        <View style={{
            flex: error ? 1 : 0,
            width: error ? 'auto' : 90
            // height: 21
        }}>
            {
                error
                    ? <Text
                        style={[
                            CommonStyle.textFloatingLabel3,
                            {
                                color: CommonStyle.fontNearLight7,
                                opacity: 1,
                                flex: 1
                            }]} numberOfLines={1}
                    >
                        {`${vendorName}`}
                    </Text>
                    : <Image ref={refImg} onError={(e) => {
                        const error = e.nativeEvent.error.split(' ')[0]
                        if (error === 'Error' || error === 'unknown' || error === 'Failed' || error === 'Unexpected') {
                            setError(true)
                        }
                    }}
                        resizeMode={'contain'}
                        source={{ uri }}
                        style={{ height: 21 }} />
            }
        </View>
    )
}, () => true)

export default VendorImage;
