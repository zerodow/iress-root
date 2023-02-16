import React, { useMemo, useRef, useState } from 'react';
import {
	View,
	Text,
	Dimensions,
	TouchableOpacity,
	ActivityIndicator
} from 'react-native';
import * as Emitter from '@lib/vietnam-emitter';
import CommonStyle from '~/theme/theme_controller';
import RegionHeader from '~s/home/View/RegionHeader';
import RegionList from '~s/home/View/RegionList';
import I18n from '~/modules/language/';
import BoxShadow from './BoxShadow';
import { dataStorage } from '~/storage';
import OrderError from '~/component/Error/OrderError.js';
import Enum from '~/enum';
import CONFIG from '~/config';
import { postBrokerName2 } from '~s/home/Controllers/RegionController';

const { width: DEVICE_WIDTH } = Dimensions.get('window');

const { TYPE_MESSAGE } = Enum;

const RegionWrapper = ({ showLogin, regionCaching, env, listRegion }) => {
	const channel = 'regionEmitter';
	const [isLoading, setIsLoading] = useState(false);

	const cbSuccess = ({ data }) => {
		setIsLoading(false);
		setTimeout(() => {
			showLogin(data[0]);
		}, 10);
	};
	const cbError = ({ error }) => {
		setIsLoading(false);
		Emitter.emit(channel, {
			msg: error.message,
			autoHide: true,
			type: TYPE_MESSAGE.ERROR
		});
	};

	const onSelected = () => {
		setIsLoading(true);
		postBrokerName2(CONFIG.envRegion, cbSuccess, cbError);
	};

	const [shadowOpt, setShadowOpt] = useState({
		width: 100,
		height: 100,
		color: '#000',
		border: 5,
		radius: 3,
		opacity: 0.5,
		x: 0,
		y: -5,
		style: { marginVertical: 5 }
	});
	if (regionCaching.region_access && dataStorage.loginSuccess === 'true') {
		return null;
	} else {
		return (
			<View
				style={{
					width: DEVICE_WIDTH,
					marginTop: 40,
					paddingHorizontal: 16,
					backgroundColor: CommonStyle.backgroundColor2
				}}
			>
				<View
					onLayout={(e) => {
						const { height, width } = e.nativeEvent.layout;
						setShadowOpt({
							...shadowOpt,
							width,
							height
						});
					}}
					style={{
						minHeight: 420,
						backgroundColor: CommonStyle.backgroundColor2,
						shadowColor: '#000000',
						shadowOffset: {
							width: 0,
							height: 5
						},
						shadowOpacity: 0.5,
						shadowRadius: 20,
						elevation: 10
					}}
				>
					<BoxShadow setting={shadowOpt} />
					<View
						style={{
							backgroundColor: CommonStyle.backgroundColor2,
							flex: 1
						}}
					>
						<RegionHeader title={I18n.t('regionAccess')} />
						<OrderError channel={channel} />
						<RegionList
							onSelected={onSelected}
							env={env}
							listRegion={listRegion}
						/>
						{isLoading && (
							<View
								style={{
									position: 'absolute',
									width: '100%',
									height: '100%',
									backgroundColor: '#00000050',
									alignItems: 'center',
									justifyContent: 'center'
								}}
							>
								<ActivityIndicator
									size="small"
									color={'#fff'}
								/>
							</View>
						)}
					</View>
				</View>
			</View>
		);
	}
};

export default RegionWrapper;
