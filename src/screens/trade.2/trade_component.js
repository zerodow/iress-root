import React from 'react';
import { View, Text } from 'react-native';

import { pushToVerifyMailScreen } from '../../lib/base/functionUtil';
import * as Controller from '../../memory/controller';
import VerifyMailNoti from '../../component/verify-your-mail/verify-mail-noti';
import { func } from '../../storage';
import UserType from '../../constants/user_type';
import Warning from '../../component/warning/warning';
import I18n from '../../modules/language';
import TimeUpdated from '../../component/time_updated/time_updated';
import styles from '~s/trade.2/style/trade';
import Enum from '../../enum';
import CommonStyle from '~/theme/theme_controller';
import ProgressBar from '../../modules/_global/ProgressBar';

export const Loading = props => (
	<View style={CommonStyle.progressBarWhite}>
		<ProgressBar />
	</View>
);

export const VerifyMail = props =>
	Controller.getUserVerify() !== 0 ? null : (
		<VerifyMailNoti
			verifyMailFn={() =>
				pushToVerifyMailScreen(props.navigator, props.lang)
			}
		/>
	);

export const DelayWarning = props =>
	func.getUserPriceSource() !== UserType.Delay ? null : (
		<Warning warningText={I18n.t('delayWarning')} isConnected />
	);

export const Time = props =>
	Controller.isPriceStreaming() ? null : (
		<TimeUpdated isShow onRef={props.onRef} />
	);

export const Header = props => {
	const isTopValuePriceboard = func.isCurrentPriceboardTopValue();
	const priceBoardId = func.getCurrentPriceboardId();

	return (
		<View
			style={{
				backgroundColor: CommonStyle.backgroundColor,
				flexDirection: 'row',
				marginHorizontal: 16,
				height: 40,
				alignItems: 'center',
				borderBottomWidth: 1,
				borderBottomColor: CommonStyle.fontBorderGray
			}}
		>
			<View style={styles.col1}>
				<Text style={CommonStyle.textMainHeader}>
					{I18n.t('symbolUpper')}
				</Text>
				<Text style={CommonStyle.textSubHeader}>
					{I18n.t('securityUpper')}
				</Text>
			</View>
			<View
				style={[
					styles.col2,
					{ paddingRight: isTopValuePriceboard ? 0 : 4 }
				]}
			>
				{isTopValuePriceboard ? (
					<Text
						style={[
							CommonStyle.textMainHeader,
							{ textAlign: 'right' }
						]}
					>
						{I18n.t('valueTradedUpper')}
					</Text>
				) : (
					<Text
						style={[
							CommonStyle.textMainHeader,
							{ textAlign: 'right' }
						]}
					>
						{I18n.t('priceUpper')}
					</Text>
				)}
				{isTopValuePriceboard ||
				priceBoardId === Enum.WATCHLIST.TOP_ASX_INDEX ? (
					<Text
						style={[
							CommonStyle.textSubHeader,
							{ textAlign: 'right' }
						]}
					/>
				) : (
					<Text
						style={[
							CommonStyle.textSubHeader,
							{ textAlign: 'right' }
						]}
					>
						{I18n.t('quantityUpper')}
					</Text>
				)}
			</View>
			<View style={styles.col3}>
				<Text
					style={[CommonStyle.textMainHeader, { textAlign: 'right' }]}
				>
					{I18n.t('overviewChgP')}
				</Text>
				<Text
					style={[CommonStyle.textSubHeader, { textAlign: 'right' }]}
				>
					{I18n.t('chgUpper')}
				</Text>
			</View>
		</View>
	);
};
