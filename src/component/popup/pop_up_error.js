import React, { useLayoutEffect, useMemo, useCallback, useEffect } from 'react'
import { StyleSheet, Text, View, Dimensions } from 'react-native'
import CommonStyle from '~/theme/theme_controller'
import TouchableOpacityOpt from '~/component/touchableOpacityOpt/index'
import { useDispatch, useSelector, shallowEqual } from 'react-redux'
import Shadow from '~/component/shadow';
import { Navigation } from 'react-native-navigation';
import I18n from '~/modules/language/'
import Enum from '~/enum'
import { dataStorage, func } from '~/storage';

const { height: heightDevice, width: widthDevices } = Dimensions.get('window')
const PopUpError = ({ txtErrorCode = '', errorCode, errorMessage, onPressOk, onPressCancel, padHorizontal = 78 }) => {
    const { isConnected } = useSelector((state) => {
        return {
            isConnected: state.app.isConnected
        };
    }, shallowEqual);
    return (
        <View style={{
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1
        }}>
            <View style={{
                width: widthDevices - 21 * 2,
                backgroundColor: CommonStyle.backgroundColor,
                overflow: 'hidden',
                alignSelf: 'center',
                borderRadius: 8
            }}>
                <View>
                    <View style={{ alignItems: 'center', justifyContent: 'center', paddingHorizontal: 78 }}>
                        <Text style={{
                            fontSize: CommonStyle.paddingSizeStandard,
                            fontFamily: CommonStyle.fontPoppinsRegular,
                            color: CommonStyle.fontWhite,
                            paddingTop: 16,
                            paddingBottom: 8,
                            textAlign: txtErrorCode ? 'auto' : 'center'
                        }}>{txtErrorCode ? `${txtErrorCode}(${errorCode})` : errorCode}</Text>
                    </View>
                </View>
                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{
                        fontSize: CommonStyle.font11,
                        fontFamily: CommonStyle.fontPoppinsRegular,
                        color: CommonStyle.fontWhite,
                        paddingHorizontal: 16,
                        textAlign: 'center',
                        paddingBottom: 6
                    }}>{errorMessage}</Text>

                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        paddingVertical: 18,
                        width: '100%',
                        paddingHorizontal: 24,
                        alignItems: 'center'
                    }}>
                        {/* <Shadow setting={{
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
                        }} /> */}

                        <TouchableOpacityOpt style={{
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: 100,
                            width: '45%',
                            textAlign: 'center',
                            borderWidth: 0.5,
                            borderColor: CommonStyle.color.modify,
                            backgroundColor: CommonStyle.backgroundColor
                        }}
                            onPress={onPressCancel}
                        >
                            <Text style={{
                                fontSize: CommonStyle.fontSizeS,
                                textAlign: 'center',
                                fontFamily: CommonStyle.fontPoppinsRegular,
                                color: CommonStyle.color.modify,
                                paddingVertical: 8
                            }}>{I18n.t('cancel')}</Text>
                        </TouchableOpacityOpt>
                        <TouchableOpacityOpt disabled={!isConnected} style={{
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: 100,
                            width: '45%',
                            textAlign: 'center',
                            borderWidth: 0.5,
                            borderColor: CommonStyle.color.modify,
                            backgroundColor: CommonStyle.color.modify,
                            opacity: isConnected ? 1 : 0.5

                        }}
                            onPress={onPressOk}
                        >
                            <Text style={{
                                fontSize: CommonStyle.fontSizeS,
                                textAlign: 'center',
                                fontFamily: CommonStyle.fontPoppinsRegular,
                                color: CommonStyle.statusBarColor,
                                paddingVertical: 8
                            }}>{I18n.t('ok')}</Text>
                        </TouchableOpacityOpt>
                    </View>

                </View>
            </View>
        </View >
    )
}

export default PopUpError
const styles = StyleSheet.create({})
