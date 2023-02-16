import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { connect } from 'react-redux'
import { View, Text, Dimensions } from 'react-native'
import CustomIcon from '~/component/Icon'
import CommonStyle from '~/theme/theme_controller'
import Animated, { Easing } from 'react-native-reanimated'
import * as Emitter from '@lib/vietnam-emitter';
import { getChangeHideErrorNews, getChangeShowErrorNews } from '~/streaming/channel'
import ENUM from '~/enum'
import I18n from '~/modules/language'
import Shadow from '~/component/shadow/SvgShadowBottom';

const { width: widthDevices, height: heightDevices } = Dimensions.get('window')
const { TIMEOUT_HIDE_ERROR, TYPE_MESSAGE } = ENUM
const {
     Value,
     timing
} = Animated
function getObjectStyle(type) {
     switch (type) {
          case TYPE_MESSAGE.ERROR:
               return {
                    backgroundColor: CommonStyle.color.error,
                    color: CommonStyle.fontColor,
                    alignItems: 'flex-start'
               }
               break;
          case TYPE_MESSAGE.WARNING:
               return {
                    backgroundColor: CommonStyle.color.warning,
                    color: CommonStyle.color.error,
                    alignItems: 'center'
               }
               break;
          case TYPE_MESSAGE.INFO:
               return {}
               break;
          default:
               return {}
               break;
     }
}
// function useListenConnected({ hideError, updateError, error }) {
//      return useEffect(() => {
//           if (isConnected && error === `${I18n.t('connecting')}...`) {
//                hideError && hideError()
//           } else if (!isConnected) {
//                updateError({ msg: `${I18n.t('connecting')}...`, autoHide: false, type: TYPE_MESSAGE.CONNECTING })
//           }
//      }, [error])
// }
const ErrorNews = ({ channel }) => {
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
     const channelShowNewsError = channel || getChangeShowErrorNews() // Khi dung chung o nhieu noi thi moi component phai chi dinh 1 channel
     const channelHideNewsError = getChangeHideErrorNews()
     const heightError = useMemo(() => {
          return new Value(0)
     }, [])

     const unmount = () => {
          Emitter.deleteEvent(channelShowNewsError)
          Emitter.deleteEvent(channelHideNewsError)
          console.log('NewsError unmount')
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
          }, 10000)
     }, [])

     const updateError = ({ msg, autoHide = true, type = TYPE_MESSAGE.ERROR }) => {
          dic.current.autoHide = autoHide
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
          Emitter.addListener(channelShowNewsError, null, updateError)
          Emitter.addListener(channelHideNewsError, null, hideError)
     }

     useEffect(() => {
          addListenerChangeError()
          return unmount
     }, [])
     // useListenConnected({ hideError, updateError, error: state.error })
     const { backgroundColor, color, alignItems } = useMemo(() => {
          return getObjectStyle(type)
     }, [type])
     useEffect(() => {
          try {
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
               console.log('FCG ERROR NEW', error)
          }
     }, [error])
     return (

          < Animated.View
               style={
                    [{
                         paddingHorizontal: 16,
                         backgroundColor: backgroundColor,
                         overflow: 'hidden',
                         width: '100%',
                         height: heightError
                    }]
               } >
               {
                    error
                         ? <View style={{ flexDirection: 'row', paddingVertical: 8 }} >
                              {
                                   type === TYPE_MESSAGE.ERROR && <CustomIcon
                                        color={CommonStyle.fontWhite}
                                        name='equix_alert'
                                        style={{ fontSize: CommonStyle.fontSizeS, paddingRight: 16 }} />
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
                         </View >
                         : null
               }
               <View collapsable={false} ref={refErrorFake} style={{ flexDirection: 'row', paddingVertical: 8, position: 'absolute', opacity: 0 }}>
                    {
                         type === TYPE_MESSAGE.ERROR && <CustomIcon
                              color={CommonStyle.fontWhite}
                              name='equix_alert'
                              style={{ fontSize: CommonStyle.fontSizeS, paddingRight: 16 }} />
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
export default ErrorNews
