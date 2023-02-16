import React, { useCallback } from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import CommonStyle from '~/theme/theme_controller';
import TouchableOpacityOpt from '~/component/touchableOpacityOpt/index';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Shadow from '~/component/shadow';
import { useShadow } from '~/component/shadow/SvgShadow';
import I18n from '~/modules/language/';
import { Navigation } from 'react-native-navigation';
import * as Model from '~/memory/model';
import momentTZ from 'moment-timezone';
import _enum from '~/enum';

const txtErrorCode = I18n.t('msgDelayedMarket');
const textHeader = I18n.t('marketData');
const textbutton = I18n.t('confirm');
const { width: widthDevices } = Dimensions.get('window');
const ShowErrorPopUp = ({ time = new Date() }) => {
	const message = I18n.t('msgDelayedMarketTime').replace(
		'##TIME##',
		momentTZ(time, _enum.LOCATION.AU).format('hh:mm A, DD MMM YYYY')
	);
	const [BottomShadow, onLayout] = useShadow();
	const doneFn = useCallback(() => {
		Navigation.dismissModal({
			animationType: 'none'
		});
	}, []);
	return (
		<View
			style={{
				justifyContent: 'center',
				backgroundColor: 'rgba(0, 0, 0, 0.5)',
				flexDirection: 'row',
				alignItems: 'center',
				flex: 1
			}}
		>
			<View
				style={{
					backgroundColor: CommonStyle.backgroundColor,
					overflow: 'hidden',
					alignSelf: 'center',
					marginHorizontal: 16,
					flex: 1
				}}
			>
				<BottomShadow />
				<View onLayout={onLayout}>
					<View
						style={{
							flexDirection: 'row',
							alignItems: 'center',
							justifyContent: 'center'
						}}
					>
						<Text
							style={{
								fontSize: CommonStyle.paddingSizeOrders,
								fontFamily: CommonStyle.fontPoppinsRegular,
								color: CommonStyle.fontWhite,
								paddingVertical: 8,
								opacity: 0.5
							}}
						>
							{textHeader}
						</Text>
					</View>
				</View>
				<View
					style={{ justifyContent: 'center', alignItems: 'center' }}
				>
					<Text
						style={{
							textAlign: 'center',
							fontSize: CommonStyle.font13,
							fontFamily: CommonStyle.fontPoppinsRegular,
							color: CommonStyle.fontWhite,
							paddingTop: 24
						}}
					>
						{txtErrorCode}
					</Text>
					<Text
						style={{
							fontSize: CommonStyle.font11,
							fontFamily: CommonStyle.fontPoppinsRegular,
							color: CommonStyle.fontWhite,
							opacity: 0.5,
							paddingTop: 8,
							paddingBottom: 24,
							paddingHorizontal: 16,
							textAlign: 'center'
						}}
					>
						{message}
					</Text>
					<View
						style={{
							flexDirection: 'row',
							alignItems: 'center'
						}}
					>
						<Shadow
							setting={{
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
									backgroundColor:
										CommonStyle.backgroundColor,
									top: 0,
									left: 0,
									right: 0
								}
							}}
						/>
						<TouchableOpacityOpt
							style={{
								flexDirection: 'row',
								alignItems: 'center',
								backgroundColor: CommonStyle.color.modify,
								marginVertical: 8,
								marginHorizontal: 24,
								borderRadius: 8
							}}
							onPress={doneFn}
						>
							<View
								style={{
									flexDirection: 'row',
									flex: 1,
									alignItems: 'center',
									justifyContent: 'center'
								}}
							>
								<Text
									style={{
										fontSize: CommonStyle.font15,
										fontFamily: CommonStyle.fontPoppinsBold,
										color: CommonStyle.fontBlack,
										paddingVertical: 14
									}}
								>
									{textbutton}
								</Text>
								<Ionicons
									name={'md-send'}
									size={25}
									color={CommonStyle.fontBlack}
									style={{ position: 'absolute', right: 16 }}
								/>
							</View>
						</TouchableOpacityOpt>
					</View>
				</View>
			</View>
		</View>
	);
};

export default ShowErrorPopUp;
export const setIsShowingAlertReload = Model.setIsShowingAlertChangeRole;
const styles = StyleSheet.create({});
