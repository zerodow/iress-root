import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { StyleSheet, Text, View, Dimensions } from 'react-native'
import CommonStyle from '~/theme/theme_controller'
import Animated, { Easing } from 'react-native-reanimated'
import * as Emitter from '@lib/vietnam-emitter';
import { getChannelHideError, getChangeShowErrorFailed, getChannelHideOrderError } from '~/streaming/channel'
import ENUM from '~/enum'
import I18n from '~/modules/language'
import { connect } from 'react-redux'
import CustomIcon from '~/component/Icon'
import Shadow from '~/component/shadow';
const { TIMEOUT_HIDE_ERROR, TYPE_MESSAGE } = ENUM
const { width: widthDevice, height: heightDevice } = Dimensions.get('window')
const {
     Value,
     timing
} = Animated
function getObjectStyle(type) {
     switch (type) {
          case TYPE_MESSAGE.ERROR:
               return {
                    color: CommonStyle.backgroundColor1,
                    alignItems: 'flex-start'
               }
               break;
          case TYPE_MESSAGE.WARNING:
               return {
                    color: CommonStyle.color.error,
                    alignItems: 'center'
               }
               break;
          case TYPE_MESSAGE.INFO:
               return {}
               break;
          case TYPE_MESSAGE.CONNECTING:
               return {
                    color: CommonStyle.backgroundColor1,
                    alignItems: 'center'
               }
          default:
               return {}
               break;
     }
}
function useListenConnected({ isConnected, hideError, updateError, error }) {
     return useEffect(() => {
          if (isConnected && error === `${I18n.t('connecting')}...`) {
               hideError && hideError()
          } else if (!isConnected) {
               updateError({ msg: `${I18n.t('connecting')}...`, autoHide: false, type: TYPE_MESSAGE.CONNECTING })
          }
     }, [isConnected, error])
}

const Error = ({ isConnected, channel }) => {
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
     const channelShowError = channel || getChangeShowErrorFailed()
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
     useListenConnected({ isConnected, hideError, updateError, error: state.error })
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
          <View>
               <Shadow setting={{
                    width: widthDevice,
                    height: 0,
                    color: CommonStyle.color.shadow,
                    border: 2,
                    radius: 0,
                    opacity: 0.6,
                    x: 0,
                    y: 0,
                    style: {
                         zIndex: 9,
                         position: 'absolute',
                         backgroundColor: CommonStyle.backgroundColor,
                         top: 0,
                         left: 0,
                         right: 0
                    }
               }} />
               <Animated.View
                    style={
                         [{
                              paddingHorizontal: 16,
                              backgroundColor: CommonStyle.color.error,
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
                                             color={CommonStyle.backgroundColor1}
                                             name='equix_alert'
                                             style={{ fontSize: CommonStyle.fontSizeS, paddingRight: 16 }} />
                                   }
                                   <View style={{ flex: 1, alignItems: alignItems || 'center' }}>
                                        <Text style={{
                                             fontFamily: CommonStyle.fontPoppinsRegular,
                                             fontSize: CommonStyle.font11,
                                             color
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
               </Animated.View>
          </View>
     )
}
function mapStateToProps(state) {
     return {
          isConnected: state.app.isConnected
     }
}
export default connect(mapStateToProps)(Error)

const styles = StyleSheet.create({})
