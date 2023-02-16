import React from 'react';
import { View, Text } from 'react-native';
import { getOrderStatusProperty } from '~s/orders/Controller/OrdersStatusController';
import CommonStyle from '~/theme/theme_controller';
import { useShadow } from '~/component/shadow/SvgShadow';
import SvgIcon from '~s/watchlist/Component/Icon2';

const ErrorDescription = ({ errorDescription }) => {
	if (!errorDescription) return null;
	return (
		<Text
			style={{
				textAlign: 'center',
				marginLeft: 8,
				fontFamily: CommonStyle.fontPoppinsRegular,
				color: CommonStyle.backgroundColor1,
				fontSize: CommonStyle.font11
			}}
		>
			{errorDescription}
		</Text>
	);
};

const OrdersStatus = ({ orderAction, actionStatus, errorDescription }) => {
	const [Shadow, onLayout] = useShadow();
	const { text, backgroundColor, iconName, isShow } = getOrderStatusProperty({
		orderAction,
		actionStatus
	});
	if (!isShow) return null;
	return (
		<View>
			<View style={{ paddingBottom: 5 }}>
				<Shadow />
				<View
					onLayout={onLayout}
					style={{
						zIndex: 10,
						width: '100%',
						backgroundColor,
						padding: 8,
						alignItems: 'center',
						justifyContent: 'center'
					}}
				>
					<View style={{ flexDirection: 'row' }}>
						<SvgIcon
							size={15}
							name={iconName}
							color={CommonStyle.fontBlack}
						/>
						<Text
							style={{
								textAlign: 'center',
								marginLeft: 8,
								fontFamily: CommonStyle.fontPoppinsRegular,
								color: CommonStyle.backgroundColor1,
								fontSize: CommonStyle.font11
							}}
						>
							{text}
						</Text>
					</View>
					<ErrorDescription errorDescription={errorDescription} />
				</View>
			</View>
		</View>
	);
};

export default OrdersStatus;
