import React, { Component, useRef } from 'react';
import {
	View,
	Text,
	TouchableOpacity,
	Platform,
	PixelRatio,
	Linking,
	NativeModules
} from 'react-native';
import AnimatedView, {
	ENUM as ENUM_TYPE_ANIMATION
} from '~/component/animation_view/index';
import CommonStyle, { register } from '~/theme/theme_controller';
import I18n from '~/modules/language/';
import { isIphoneXorAbove } from '~/lib/base/functionUtil';
import * as Controller from '~/memory/controller';
import { Navigation } from 'react-native-navigation';
import { onUserCancel } from '~/manage/manageAuth';

import { oktaSignOutWithBrowser } from '~/manage/manageOktaAuth';
import { dataStorage } from '~/storage';

const SystemSetting = NativeModules.OpenSettings;
export default function PopUpBiometric({
	touchIDType = 'notEnrolled',
	onTryAgain = () => {},
	onCancel = () => {},
	allowCancel = false
}) {
	const biometryType =
		Platform.OS === 'android'
			? 'Fingerprint'
			: isIphoneXorAbove()
			? 'Face ID'
			: 'Touch ID';
	const refView = useRef();
	const message =
		touchIDType === 'notEnrolled'
			? I18n.t('notEnrolledBiometric').replace(
					'##BIOMETRIC_TYPE##',
					biometryType
			  )
			: I18n.t('lockTouchID');
	const handleOpenSetting = async () => {
		allowCancel && onCancel();
		if (Platform.OS === 'ios') {
			Linking.openURL('app-settings:');
		} else {
			SystemSetting.openNetworkSettings &&
				SystemSetting.openNetworkSettings((message) => {
					if (message) {
						alert(message);
					}
				});
			Controller.setIsShowingAlertReload(false);
			Navigation.dismissModal({ animationType: 'none' });
			return new Promise(async (resolve) => {
				await onUserCancel({ resolve, needCheckBiometric: true });
			});
		}
	};

	const renderContent = () => {
		return (
			<View>
				<View
					style={[
						{ backgroundColor: CommonStyle.backgroundColor },
						{
							alignItems: 'center',
							paddingVertical: 24,
							paddingHorizontal: 24,
							borderRadius: 8
						}
					]}
				>
					<View
						style={{
							justifyContent: 'center',
							alignItems: 'center'
						}}
					>
						<Text
							style={[
								{
									fontFamily: CommonStyle.fontPoppinsRegular,
									fontSize: CommonStyle.fontSizeS,
									color: CommonStyle.fontColor,
									textAlign: 'center'
								}
							]}
						>
							{message}
						</Text>
					</View>

					<View
						style={{
							flexDirection: 'row',
							marginTop: 16
						}}
					>
						<TouchableOpacity
							onPress={allowCancel ? onCancel : onTryAgain}
							style={{
								justifyContent: 'center',
								alignItems: 'center',
								backgroundColor:
									CommonStyle.authenticationVersion2
										.colorBlue,
								alignSelf: 'center',
								borderRadius: 22,
								paddingVertical: 4,
								flex: 1
							}}
						>
							<Text
								style={[
									CommonStyle.textTitleDialog,
									{
										color: CommonStyle.fontColor,
										textAlign: 'center',
										fontSize: CommonStyle.fontSizeXS,
										fontFamily:
											CommonStyle.fontPoppinsRegular,
										opacity: 1
									}
								]}
							>
								{allowCancel ? 'Cancel' : 'Try Again'}
							</Text>
						</TouchableOpacity>
						<View style={{ width: 16 }} />
						<TouchableOpacity
							onPress={handleOpenSetting}
							style={{
								justifyContent: 'center',
								alignItems: 'center',
								backgroundColor:
									CommonStyle.authenticationVersion2
										.colorBlue,
								alignSelf: 'center',
								borderRadius: 22,
								paddingVertical: 4,
								flex: 1
							}}
						>
							<Text
								style={[
									CommonStyle.textTitleDialog,
									{
										color: CommonStyle.fontColor,
										textAlign: 'center',
										fontSize: CommonStyle.fontSizeXS,
										fontFamily:
											CommonStyle.fontPoppinsRegular,
										opacity: 1
									}
								]}
							>
								Go To Setting
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		);
	};
	return (
		<AnimatedView
			ref={refView}
			style={{ flex: 1 }}
			type={ENUM_TYPE_ANIMATION.FADE_IN}
			styleContent={{
				flex: 1,
				justifyContent: 'center',
				alignItems: 'center',
				backgroundColor: CommonStyle.backgroundColorPopup
			}}
		>
			<View style={{ marginHorizontal: 32 }}>{renderContent()}</View>
		</AnimatedView>
	);
}
