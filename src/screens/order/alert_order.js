import React, { Component } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import I18n from '../../modules/language/';
import Modal from 'react-native-modal';
import * as Animatable from 'react-native-animatable';
import { VibrancyView } from 'react-native-blur';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import { dataStorage } from '../../storage'

const renderConfirmButton = (confirmOrderFunc, title) => (
	<TouchableOpacity
		onPress={confirmOrderFunc}
		style={{
			width: '50%',
			paddingVertical: 20,
			backgroundColor: Platform.OS === 'ios' ? 'transparent' : 'white',
			justifyContent: 'center',
			alignItems: 'center',
			flexDirection: 'row'
		}}>
		<Text style={[CommonStyle.textMainNormal, { color: '#2196F3' }]}>
			{title ? 'OK' : I18n.t('logout')}
		</Text>
	</TouchableOpacity>
);

export function AlertOrder(props) {
	return (
		<Modal
			animationInTiming={1}
			animationOutTiming={1}
			onBackdropPress={props.closeAlert}
			isVisible={props.visibleAlert}
			style={{
				flex: 1,
				backgroundColor: 'transparent',
				justifyContent: 'center',
				alignItems: 'center'
			}}>
			{
				Platform.OS === 'ios'
					? (
						<Animatable.View ref='logoutPopup' testID='comfirmModalOrder'>
							<VibrancyView
								blurType="xlight"
								style={{
									backgroundColor: 'transparent',
									overflow: 'hidden',
									borderRadius: 20
								}}>
								<View
									style={{
										width: 300,
										paddingHorizontal: 20,
										paddingVertical: 30,
										backgroundColor: 'transparent',
										justifyContent: 'center',
										alignItems: 'center'
									}}>
									<Text style={CommonStyle.textMain}>
										{
											props.title
												? props.title
												: I18n.t('notiSignOut')
										}
									</Text>
								</View>
								<View
									style={{
										width: 300,
										height: 50,
										backgroundColor: 'transparent',
										flexDirection: 'row',
										borderTopWidth: 1,
										borderTopColor: 'rgba(0, 0, 0, 0.1)'
									}}>
									<TouchableOpacity
										onPress={props.closeAlert}
										style={{
											width: '50%',
											paddingVertical: 20,
											backgroundColor: 'transparent',
											justifyContent: 'center',
											alignItems: 'center',
											flexDirection: 'row',
											borderRightWidth: 0.5,
											borderRightColor: 'rgba(0, 0, 0, 0.1)'
										}}>
										<Text
											style={[CommonStyle.textMainNormal,
											{ color: '#2196F3' }]}>
											{I18n.t('cancel')}
										</Text>
									</TouchableOpacity>
									{renderConfirmButton(props.confirmOrder, props.title)}
								</View>
							</VibrancyView>
						</Animatable.View>)
					: (
						<Animatable.View
							testID='comfirmModalOrder'
							ref='logoutPopup'
							style={{
								backgroundColor: 'transparent',
								overflow: 'hidden',
								borderRadius: 20
							}}>
							<View
								style={{
									width: 300,
									paddingHorizontal: 20,
									paddingVertical: 30,
									backgroundColor: 'white',
									justifyContent: 'center',
									alignItems: 'center'
								}}>
								<Text style={CommonStyle.textMain}>
									{
										props.title
											? props.title
											: I18n.t('notiSignOut')
									}
								</Text>
							</View>
							<View
								style={{
									width: 300,
									height: 50,
									backgroundColor: 'transparent',
									flexDirection: 'row',
									borderTopWidth: 0.5,
									borderTopColor: 'rgba(0, 0, 0, 0.1)'
								}}>
								<TouchableOpacity
									onPress={props.closeAlert}
									style={{
										width: '50%',
										paddingVertical: 20,
										backgroundColor: 'white',
										justifyContent: 'center',
										alignItems: 'center',
										flexDirection: 'row',
										borderRightWidth: 0.5,
										borderRightColor: 'rgba(0, 0, 0, 0.1)'
									}}>
									<Text
										style={[
											CommonStyle.textMainNormal,
											{ color: '#2196F3' }
										]}>
										{I18n.t('cancel')}
									</Text>
								</TouchableOpacity>
								{renderConfirmButton(props.confirmOrder, props.title)}
							</View>
						</Animatable.View>
					)
			}
		</Modal>
	)
};
