import React, { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { size } from 'lodash';
import I18n from '~/modules/language/index';
import ENUM from '~/enum';
import { Navigation } from 'react-native-navigation';
import CommonStyle, { register, changeTheme } from '~/theme/theme_controller';
import TouchableOpacityOpt from '~/component/touchableOpacityOpt/';
import * as Controller from '~/memory/controller';
import { oktaSignOut, oktaSignOutWithBrowser } from '~/manage/manageOktaAuth';
import * as Business from '~/business';
import { dataStorage, func } from '~/storage';
import { logout } from '~s/login/login.actions';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import CONFIG from '~/config';
import { setRegionSelected } from '~/screens/home/Model/LoginModel.js';

const ChangeRegion = () => {
	const dispatch = useDispatch();

	const onPressOk = () => {
		Business.unSubTokenNotification();
		func.clearRegionSelected();
		func.setCacheLoginSuccess(false);
		setRegionSelected({});

		if (dataStorage.isOkta) {
			oktaSignOutWithBrowser();
		} else {
			dispatch(logout());
		}
		// Navigation.dismissModal({ animationType: 'none' });
	};
	const onPressCancel = useCallback(() => {
		Navigation.dismissModal({ animationType: 'none' });
	}, []);
	const handleChangeRegion = useCallback(() => {
		Navigation.showModal({
			screen: 'equix.PopUpError',
			animated: true,
			animationType: 'none',
			navigatorStyle: {
				...CommonStyle.navigatorSpecialNoHeader,
				statusBarTextColorScheme: CommonStyle.statusBarTextScheme,
				screenBackgroundColor: 'transparent',
				modalPresentationStyle: 'overCurrentContext'
			},
			passProps: {
				errorCode: I18n.t('areYouSureYouWantToChangeRegion'),
				errorMessage: I18n.t('youWillBeLoggedOut'),
				onPressOk,
				onPressCancel
			}
		});
	}, []);

	const listRegionByEnv = dataStorage.listRegion.filter((item) => {
		const { region_type: regionType } = item;
		return regionType === ENUM.ENV_TYPE.UAT;
	});

	if (size(listRegionByEnv) === 1 || !CONFIG.isChangeRegion) {
		return null;
	}

	return (
		<View>
			<TouchableOpacityOpt
				onPress={handleChangeRegion}
				style={[
					CommonStyle.sectContent,
					{ justifyContent: 'space-between' }
				]}
			>
				<Text
					style={[
						CommonStyle.sectContentText,
						{
							width: '50%',
							color: CommonStyle.color.sell,
							opacity: 1
						}
					]}
				>
					{I18n.t('changeRegion')}
				</Text>
			</TouchableOpacityOpt>
			<View
				style={{
					height: 1,
					backgroundColor: CommonStyle.fontColorBorderNew,
					marginLeft: 16
				}}
			/>
		</View>
	);
};

export default ChangeRegion;

const styles = StyleSheet.create({});
