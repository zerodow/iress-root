import React, { useEffect, useRef } from 'react';
import CommonStyle from '~/theme/theme_controller';
import { View, Text, Alert } from 'react-native';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import * as settingActions from '~s/setting/setting.actions';
import * as Controller from '~/memory/controller';
// Component
import I18n from '~/modules/language/index';
import SwitchButton from '~/screens/alert_function/components/SwitchButton';
// Auth
import { storeBiometricSetting } from '~/manage/manageAuth';
// Storage
import { dataStorage, func } from '~/storage';
import { checkBiometric, storeToken, getToken } from '~/manage/manageAuth2';
import { includes, isUndefined, upperCase } from 'lodash';

let changing = false;

const SettingBiometric = React.memo(
	() => {
		const _switch = useRef();
		const _biometric = useRef();

		if (!dataStorage.isLoggedInOkta) return null;
		const lang = useSelector((state) => state.setting.lang, shallowEqual);
		const biometric = useSelector((state) => state.setting.biometric);

		useEffect(() => {
			setTimeout(() => {
				_switch.current && _switch.current.animateSwitch(biometric);
			}, 300);
		}, []);

		if (isUndefined(_biometric.current)) {
			_biometric.current = biometric;
		}

		const handleError = (err) => {
			try {
				const { message = '' } = err || {};
				const splitArr = message.split(',');
				const code = splitArr[0].replace('code: ', '');
				const msg = splitArr[1].replace('msg: ', '');
				if (includes(upperCase(msg), 'CANCEL') || code === '10') return;

				Alert.alert('', msg);
			} catch (error) {}
		};

		const dispatch = useDispatch();
		const onChange = async () => {
			if (!changing) {
				changing = true;
				try {
					const isSupport = await checkBiometric();
					if (isSupport) {
						await storeToken(Controller.getAccessToken());
						const token = await getToken();
						if (token) {
							func.setAutoOktaLogin(true);
							storeBiometricSetting(!biometric);
							dispatch(settingActions.setBiometric(!biometric));
							_switch.current &&
								_switch.current.animateSwitch(!biometric);
						}
					} else {
						throw new Error('Biometric Not Available');
					}
				} catch (error) {
					_switch.current && _switch.current.animateSwitch(biometric);
					handleError(error);
				}
				changing = false;
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
						{I18n.t('biometric', { locale: lang })}
					</Text>
					<SwitchButton
						ref={_switch}
						testID="settingBiometric"
						circleSize={24}
						barHeight={30}
						circleBorderWidth={0}
						backgroundActive={CommonStyle.fontColorSwitchTrue}
						backgroundInactive={CommonStyle.fontColorSwitchTrue}
						circleActiveColor={CommonStyle.fontColorButtonSwitch}
						circleInActiveColor={'#000000'}
						changeValueImmediately={true} // if rendering inside circle, change state immediately or wait for animation to complete
						innerCircleStyle={{
							alignItems: 'center',
							justifyContent: 'center'
						}} // style for inner animated circle for what you (may) be rendering inside the circle
						outerCircleStyle={{}} // style for outer animated circle
						renderActiveText={false}
						renderInActiveText={false}
						switchLeftPx={1.9} // denominator for logic when sliding to TRUE position. Higher number = more space from RIGHT of the circle to END of the slider
						switchRightPx={1.9} // denominator for logic when sliding to FALSE position. Higher number = more space from LEFT of the circle to BEGINNING of the slider
						switchWidthMultiplier={2.5} // multipled by the `circleSize` prop to calculate total width of the Switch
						switchBorderRadius={16}
						onValueChange={onChange}
						value={_biometric.current}
					/>
				</View>
				{renderSeperate()}
			</React.Fragment>
		);
	},
	(pre, next) => pre.biometric === next.biometric
);

export default SettingBiometric;
