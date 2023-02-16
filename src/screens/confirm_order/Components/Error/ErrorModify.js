import React, { useState, useMemo, useEffect } from 'react'
import { View, Dimensions } from 'react-native'
import CommonStyle from '~/theme/theme_controller'
import ErrorOriginalFailed from './ErrorOriginalFailed'
import ErrorOriginalSuccess from './ErrorOriginalSuccess'
import { useShadow } from '~/component/shadow/SvgShadow'

const ErrorModify = React.memo((props) => {
     return <View>
          <ErrorOriginalSuccess {...props} />
          <ErrorOriginalFailed {...props} />
     </View >
}, () => true)

export default ErrorModify
