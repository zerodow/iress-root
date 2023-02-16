import React, { useLayoutEffect } from 'react'
import { StyleSheet, Text, View, Dimensions } from 'react-native'
import CommonStyle from '~/theme/theme_controller'
import {
     isIphoneXorAbove
} from '~/lib/base/functionUtil'
import TouchableOpacityOpt from '~/component/touchableOpacityOpt/index'
import Ionicons from 'react-native-vector-icons/Ionicons';
import Shadow from '~/component/shadow';
import { useShadow } from '~/component/shadow/SvgShadow'
import { CloseIcon } from '~s/watchlist/Detail/components'
import { Navigation } from 'react-native-navigation';
import * as Controller from '~/memory/controller';
import * as Model from '~/memory/model';
import { setCode, getCode, setMessage, getMessage } from '~/component/error_system/Model/ErrorModel.js'
import { errorSettingModel } from '~/screens/setting/main_setting/error_system_setting.js'
import * as loginActions from '~s/login/login.actions';
import { changeErrorSystemLoading } from '~/component/error_system/Redux/actions.js'
import { oktaSignOutWithBrowser } from '~/manage/manageOktaAuth'
import { dataStorage } from '~/storage'
// const errorCode = 'System Error: (25020)';
const txtErrorCode = 'System Error: ';
const textHeader = 'Please try to login again';
const textbutton = 'Relogin'
const { height: heightDevice, width: widthDevices } = Dimensions.get('window')
const ShowPopUpError = () => {
     const code = getCode();
     const message = getMessage()
     console.log('Log error', code, message)
     const [BottomShadow, onLayout] = useShadow()
     const onClose = () => {
          setIsShowingAlertReload(false);
          setTimeout(() => {
               Controller.setStatusModalCurrent(false)
          }, 300);
          Navigation.dismissModal({
               animationType: 'none'
          })
     }

     const doneFn = () => {
          if (dataStorage.isOkta) {
               oktaSignOutWithBrowser()
          } else {
               setIsShowingAlertReload(false);
               Controller.setStatusModalCurrent(false)
               Navigation.dismissModal({ animationType: 'none' });
               errorSettingModel.code = null
               errorSettingModel.message = null
               setCode(null)
               setMessage(null)
               Controller.dispatch(
                    loginActions.logout()
               );
               Controller.dispatch(
                    changeErrorSystemLoading(false)
               );
          }
     }
     useLayoutEffect(() => {
          Controller.setStatusModalCurrent(true)
          return () => {
               setIsShowingAlertReload(false);
          }
     }, [])
     return (
          <View style={{
               justifyContent: 'center',
               backgroundColor: 'rgba(0, 0, 0, 0.5)',
               flexDirection: 'row',
               alignItems: 'center',
               flex: 1

          }}>
               <View style={{
                    backgroundColor: CommonStyle.backgroundColor,
                    overflow: 'hidden',
                    alignSelf: 'center',
                    marginHorizontal: 48,
                    flex: 1

                    // maxHeight: isIphoneXorAbove() ? heightDevice - 48 - 32 : Platform.OS === 'ios' ? heightDevice - 64 : heightDevice - 32
               }}>
                    <BottomShadow />
                    <View onLayout={onLayout}>
                         <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                              <Text style={{
                                   fontSize: CommonStyle.paddingSizeOrders,
                                   fontFamily: CommonStyle.fontPoppinsRegular,
                                   color: CommonStyle.fontWhite,
                                   paddingVertical: 8,
                                   opacity: 0.5
                              }}>{textHeader}</Text>
                         </View>
                    </View>
                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                         <Text style={{
                              fontSize: CommonStyle.paddingSizeOrders,
                              fontFamily: CommonStyle.fontPoppinsRegular,
                              color: CommonStyle.fontWhite,
                              paddingTop: 24
                         }}>{`${txtErrorCode}(${code})`}</Text>
                         <Text style={{
                              fontSize: CommonStyle.paddingSizeOrders,
                              fontFamily: CommonStyle.fontPoppinsRegular,
                              color: CommonStyle.fontWhite,
                              paddingTop: 8,
                              paddingBottom: 24,
                              paddingHorizontal: 16,
                              textAlign: 'center'

                         }}>{message}</Text>

                         <View style={{
                              flexDirection: 'row',
                              alignItems: 'center'
                         }}>
                              <Shadow setting={{
                                   width: widthDevices,
                                   height: 0,
                                   color: CommonStyle.color.shadow,
                                   border: 3,
                                   radius: 0,
                                   opacity: 0.5,
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
                              <TouchableOpacityOpt style={{
                                   flexDirection: 'row',
                                   alignItems: 'center',
                                   backgroundColor: CommonStyle.color.modify,
                                   marginVertical: 8,
                                   marginHorizontal: 24,
                                   borderRadius: 8
                              }}
                                   onPress={doneFn}
                              >
                                   <View style={{ flexDirection: 'row', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                        <Text style={{
                                             fontSize: CommonStyle.paddingSizeStandard,
                                             fontFamily: CommonStyle.fontPoppinsBold,
                                             color: CommonStyle.fontBlack,
                                             paddingVertical: 14

                                        }}>{textbutton}</Text>
                                        <Ionicons
                                             name={'md-send'} size={25}
                                             color={CommonStyle.fontBlack}
                                             style={{ position: 'absolute', right: 16 }} />
                                   </View>

                              </TouchableOpacityOpt>
                         </View>

                    </View>
               </View>
          </View >
     )
}

export default ShowPopUpError
export const setIsShowingAlertReload = Model.setIsShowingAlertChangeRole;
const styles = StyleSheet.create({})
