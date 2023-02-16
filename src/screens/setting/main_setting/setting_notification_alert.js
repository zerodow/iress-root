import React, { useEffect } from 'react';
import CommonStyle from '~/theme/theme_controller';
import { View, Text, Linking, NativeModules, Platform } from 'react-native';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
// Firebase
import firebase from '~/firebase';
// Action
import * as settingActions from '~s/setting/setting.actions';
// Component
import I18n from '~/modules/language/index';
import SwitchButton from '~/screens/alert_function/components/SwitchButton';
// Storage
import { getCacheNotification, setCacheNotification } from '~s/alertLog/Model/AlertLogModel'
import { registerNotification, unRegisterNotification } from '~s/alertLog/Controller/AlertController'
import { dataStorage } from '~/storage';
import * as Business from '~/business'

const SystemSetting = NativeModules.OpenSettings;

const SettingNotificationAlert = () => {
    // if (dataStorage.isLoggedInOkta) return null;
    const lang = useSelector((state) => state.setting.lang, shallowEqual);
    const isConnected = useSelector((state) => state.app.isConnected, shallowEqual);
    const notiAlert = useSelector(
        (state) => state.setting.notiAlert,
        shallowEqual
    );
    const dispatch = useDispatch();

    const cbSuccess = () => {
        setCacheNotification(!notiAlert); // Store local storage & ram
        dispatch(settingActions.setNotificationAlert(!notiAlert));
    }
    const cbError = () => {
        // setCacheNotification(false); // Store local storage & ram
        // dispatch(settingActions.setNotificationAlert(false));
    }
    useEffect(() => {
        firebase.messaging().hasPermission().then((enabled) => {
            if (!enabled) {
                Business.getMessagingToken()
                setCacheNotification(false); // Store local storage & ram
                dispatch(settingActions.setNotificationAlert(false));
            }
        }).catch((error) => {
            console.info('ERROR', error)
        });
    }, [notiAlert])
    const onChange = async () => {
        if (!notiAlert) {
            const enabled = await firebase.messaging().hasPermission();
            if (enabled) {
                Business.getMessagingToken()
                registerNotification({ enable: true, cbSuccess, cbError })
            } else {
                Platform.OS === 'ios' ? Linking.openURL('app-settings:') : SystemSetting.openNetworkSettings && SystemSetting.openNetworkSettings(message => {
                    if (message) {
                        alert(message)
                    }
                })
            }
        } else {
            unRegisterNotification({ enable: false, cbSuccess, cbError })
        }
    };
    const renderSeperate = () => {
        return (
            <View
                style={{
                    height: 1,
                    backgroundColor: CommonStyle.fontColorBorderNew,
                    marginLeft: 16
                }}
            />
        );
    };
    return (
        <React.Fragment>
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingLeft: 16,
                    paddingRight: 16,
                    height: 57
                }}
            >
                <Text style={[CommonStyle.sectContentText]}>
                    {I18n.t('settingNoti', { locale: lang })}
                </Text>
                <SwitchButton
                    testID="settingNotiAlert"
                    circleSize={24}
                    barHeight={30}
                    disabled={!isConnected}
                    circleBorderWidth={0}
                    backgroundActive={CommonStyle.fontColorSwitchTrue}
                    backgroundInactive={CommonStyle.fontColorSwitchTrue}
                    circleActiveColor={CommonStyle.fontColorButtonSwitch}
                    circleInActiveColor={'#000000'}
                    changeValueImmediately={true}
                    changeValueImmediately={true} // if rendering inside circle, change state immediately or wait for animation to complete
                    innerCircleStyle={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: !isConnected ? 0.5 : 1
                    }} // style for inner animated circle for what you (may) be rendering inside the circle
                    outerCircleStyle={{}} // style for outer animated circle
                    renderActiveText={false}
                    renderInActiveText={false}
                    switchLeftPx={1.9} // denominator for logic when sliding to TRUE position. Higher number = more space from RIGHT of the circle to END of the slider
                    switchRightPx={1.9} // denominator for logic when sliding to FALSE position. Higher number = more space from LEFT of the circle to BEGINNING of the slider
                    switchWidthMultiplier={2.5} // multipled by the `circleSize` prop to calculate total width of the Switch
                    switchBorderRadius={16}
                    onValueChange={onChange}
                    value={notiAlert}
                />
            </View>
            {renderSeperate()}
        </React.Fragment>
    );
};

export default SettingNotificationAlert;
