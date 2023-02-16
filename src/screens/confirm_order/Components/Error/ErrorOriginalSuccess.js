import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { StyleSheet, Text, View, Dimensions } from 'react-native'
import CommonStyle from '~/theme/theme_controller'
import Animated, { Easing } from 'react-native-reanimated'
import * as Emitter from '@lib/vietnam-emitter';
import { getChannelHideError, getChangeShowErrorSuccess, getChannelHideOrderError } from '~/streaming/channel'
import ENUM from '~/enum'
import I18n from '~/modules/language'
import ValueFormat from '~/component/ValueFormat';
import CustomIcon from '~/component/Icon'
import SvgIcon from '~s/watchlist/Component/Icon2'

const {
     Value,
     timing
} = Animated
const { TIMEOUT_HIDE_ERROR, TYPE_MESSAGE } = ENUM
const { width: widthDevice, height: heightDevice } = Dimensions.get('window')
function getObjectStyle(type) {
     switch (type) {
          case TYPE_MESSAGE.ERROR:
               return {
                    color: CommonStyle.fontColor,
                    alignItems: 'flex-start'
               }
               break;
          case TYPE_MESSAGE.WARNING:
               return {
                    color: CommonStyle.color.error,
                    alignItems: 'flex-start'
               }
               break;
          case TYPE_MESSAGE.INFO:
               return {}
               break;
          case TYPE_MESSAGE.CONNECTING:
               return {
                    color: CommonStyle.fontDark,
                    alignItems: 'center'
               }
          default:
               return {}
               break;
     }
}
const Error = ({ channel }) => {
     const [state, setError] = useState({
          error: '',
          type: ENUM.TYPE_MESSAGE.ERROR
     })
     const refErrorFake = useRef({})
     const dic = useRef({
          autoHide: true,
          timeOutClearError: null,
          timeOutMeasure: null
     })
     const { error, type } = state
     const channelShowError = channel || getChangeShowErrorSuccess()
     const channelHideError = getChannelHideOrderError()

     const heightError = useMemo(() => {
          return new Value(0)
     }, [])
     const unmount = () => {
          Emitter.deleteEvent(channelShowError)
          Emitter.deleteEvent(channelHideError)
          if (dic.current.timeOutClearError) clearTimeout(dic.current.timeOutClearError)
          if (dic.current.timeOutMeasure) clearTimeout(dic.current.timeOutMeasure)
     }
     const hideError = useCallback(() => {
          if (dic.current.timeOutClearError) clearTimeout(dic.current.timeOutClearError)
          dic.current.timeOutClearError = setTimeout(() => {
               timing(heightError, {
                    toValue: 0,
                    duration: 500,
                    easing: Easing.inOut(Easing.ease)
               }).start(() => {
                    setError({
                         error: ''
                    })
               })
          }, TIMEOUT_HIDE_ERROR)
     }, [])
     const updateError = ({ msg, autoHide = true, type = TYPE_MESSAGE.ERROR }) => {
          dic.current.autoHide = autoHide
          console.log('Error MSG', msg)
          if (msg === '') {
               timing(heightError, {
                    toValue: 0,
                    duration: 500,
                    easing: Easing.inOut(Easing.ease)
               }).start(() => {
                    setError({
                         error: msg,
                         type
                    })
               })
          } else {
               setError({
                    error: msg,
                    type
               })
          }
     }
     const addListenerChangeError = () => {
          Emitter.addListener(channelShowError, null, updateError)
          Emitter.addListener(channelHideError, null, hideError)
     }
     useEffect(() => {
          addListenerChangeError()
          return unmount
     }, [])
     const { color, alignItems } = useMemo(() => {
          return getObjectStyle(type)
     }, [type])
     useEffect(() => {
          try {
               console.log('Error Error', error)

               if (error !== '') {
                    if (dic.current.timeOutClearError) clearTimeout(dic.current.timeOutClearError)
                    if (dic.current.timeOutMeasure) clearTimeout(dic.current.timeOutMeasure)
                    dic.current.timeOutMeasure = setTimeout(() => {
                         refErrorFake.current && refErrorFake.current.measure && refErrorFake.current.measure((x, y, w, h, pX, pY) => {
                              timing(heightError, {
                                   toValue: h,
                                   duration: 500,
                                   easing: Easing.inOut(Easing.ease)
                              }).start(() => {
                                   dic.current.autoHide && hideError()
                              })
                         })
                    }, 100);
               }
          } catch (error) {
               console.info('DCM error', error)
          }
     }, [error])
     return (
          < Animated.View
               style={
                    [{
                         paddingHorizontal: 16,
                         backgroundColor: CommonStyle.color.modify,
                         overflow: 'hidden',
                         width: '100%',
                         height: heightError
                    }]
               } >
               {
                    error
                         ? <View style={{ flexDirection: 'row', paddingVertical: 8 }} >
                              {
                                   type === TYPE_MESSAGE.WARNING && <SvgIcon
                                        color={CommonStyle.fontColor}
                                        size={CommonStyle.fontSizeS}
                                        name={'noun_tick'}
                                   />
                              }
                              <View style={{ flex: 1, alignItems: alignItems || 'center', paddingLeft: 16 }}>
                                   <Text style={{
                                        fontFamily: CommonStyle.fontPoppinsRegular,
                                        fontSize: CommonStyle.font11,
                                        color: CommonStyle.backgroundColor1
                                   }}>
                                        {error}
                                   </Text>
                              </View>
                         </View >
                         : null
               }
               <View collapsable={false} ref={refErrorFake} style={{ flexDirection: 'row', paddingVertical: 8, position: 'absolute', opacity: 0 }}>
                    {
                         type === TYPE_MESSAGE.WARNING && <SvgIcon
                              color={CommonStyle.fontColor}
                              size={CommonStyle.fontSizeS}
                              name={'noun_tick'}
                         />
                    }
                    <View style={{ flex: 1, alignItems: alignItems || 'center' }}>
                         <Text style={{
                              fontFamily: CommonStyle.fontPoppinsRegular,
                              fontSize: CommonStyle.font11,
                              color: color
                         }}>
                              {error}
                         </Text>
                    </View>
               </View>
          </Animated.View >
     )
}

export default Error

const styles = StyleSheet.create({})
