import React, { useState, useMemo, useEffect } from 'react'
import { View } from 'react-native'
import CommonStyle from '~/theme/theme_controller'
import OrderErrorFake from './OrderErrorFake'
import OrderErrorReal from './OrderErrorReal'

const OrderError = React.memo((props) => {
    return <View>
        <View style={{
            width: '100%',
            backgroundColor: CommonStyle.backgroundColor,
            top: 0,
            right: 0,
            left: 0,
            zIndex: 99999
        }}>
            {/* <OrderErrorFake /> */}
            <OrderErrorReal {...props} />
        </View>
    </View>
}, () => true)

export default OrderError
