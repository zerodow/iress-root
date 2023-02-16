import React, { useMemo, useRef, useEffect, useState } from 'react';
import {
	View,
	Dimensions,
	TouchableOpacity,
	TouchableWithoutFeedback,
	Keyboard,
	Platform,
	LayoutAnimation,
	UIManager,
	StatusBar
} from 'react-native';
import _, { size } from 'lodash';

import CommonStyle from '~/theme/theme_controller';
import * as Controller from '~/memory/controller';

import Logo from '~s/home/View/Logo';
import RegionWrapper from '~s/home/View/RegionWrapper';
import ENUM from '~/enum';
import LoginWrapper from '~s/home/View/LoginWrapper';
import {
	setRegionSelected,
	getRegionSelected
} from '~/screens/home/Model/LoginModel.js';
import Animated, { Easing } from 'react-native-reanimated';
import { dataStorage, func } from '~/storage';

if (
	Platform.OS === 'android' &&
	UIManager.setLayoutAnimationEnabledExperimental
) {
	UIManager.setLayoutAnimationEnabledExperimental(true);
}
const { Value, timing } = Animated;
const { width: DEVICE_WIDTH } = Dimensions.get('window');

const loginTypeDefaut = ({ regionAccess }) => {
	if (regionAccess && regionAccess.length === 2) {
		return [
			{
				label: 'oktaLogin',
				key: 'okta'
			},
			{
				label: 'userLogin',
				key: 'email'
			}
		];
	} else {
		return [];
	}
};

const useSelection = ({
	setRegionCaching,
	setLoginWrapper,
	setListLoginType
}) => {
	const [isOnLogin, setScreenType] = useState(false);
	const translateXAnim = useMemo(() => {
		return new Value(0);
	}, []);
	const showLogin = (data, animate = true) => {
		Keyboard.dismiss();
		const { region_access: regionAccess } = data;
		setRegionSelected(data);
		setListLoginType(loginTypeDefaut({ regionAccess }));
		setLoginWrapper(data);
		setRegionCaching(data);

		if (animate) {
			timing(translateXAnim, {
				toValue: -DEVICE_WIDTH,
				duration: 200,
				easing: Easing.linear
			}).start();
		} else {
			translateXAnim.setValue(-DEVICE_WIDTH);
		}

		setScreenType(true);
	};
	const showRegion = () => {
		func.clearRegionSelected();
		func.clearCacheLoginSuccess();
		setRegionCaching('');
		timing(translateXAnim, {
			toValue: 0,
			duration: 200,
			easing: Easing.linear
		}).start();
		setScreenType(false);
	};

	return { translateXAnim, showRegion, showLogin, isOnLogin };
};

const LogoComp = ({ translateY, isOnLogin, switchEnv }) => {
	const dic = useRef({
		numberTouch: 0
	});

	const onPress = () => {
		if (isOnLogin) return;
		Keyboard.dismiss();
		dic.current.numberTouch++;
		if (dic.current.numberTouch === 5) {
			dic.current.numberTouch = 0;
			LayoutAnimation.easeInEaseOut();
			switchEnv((p) =>
				p === ENUM.ENV_TYPE.UAT ? ENUM.ENV_TYPE.DEV : ENUM.ENV_TYPE.UAT
			);
		}
	};

	return (
		<TouchableOpacity
			activeOpacity={1}
			onPress={onPress}
			style={{ width: '100%', alignItems: 'center' }}
		>
			<Logo translateY={translateY} />
		</TouchableOpacity>
	);
};

const Home = ({ navigator }) => {
	const [env, switchEnv] = useState(ENUM.ENV_TYPE.UAT);

	const [inited, setInitState] = useState(false);

	const [loginWrapper, setLoginWrapper] = useState(getRegionSelected());
	const [regionCaching, setRegionCaching] = useState(getRegionSelected());
	const [listLoginType, setListLoginType] = useState([]);
	const [hideShowRegion, setShowState] = useState(false);

	const translateY = useMemo(() => new Animated.Value(0), []);

	const { translateXAnim, showRegion, showLogin, isOnLogin } = useSelection({
		setRegionCaching,
		setLoginWrapper,
		setListLoginType
	});

	const listRegion = useMemo(
		() =>
			_.filter(dataStorage.listRegion, {
				region_type: ENUM.ENV_TYPE.UAT
			}),
		[]
	);

	useEffect(() => {
		const regionInit = Controller.getRegion();

		if (size(listRegion) === 1) {
			setShowState(true);
		}

		if (regionInit) {
			showLogin(getRegionSelected(), false);
		}
		setTimeout(() => {
			setInitState(true);
		}, 10);
	}, []);

	// const [isLoading, hideRegion, listRegion] = useRegion({ env, showLogin });

	useEffect(() => {
		StatusBar.setBarStyle('light-content');
		StatusBar.setBackgroundColor(CommonStyle.backgroundColor2);
	}, []);

	useEffect(() => {
		navigator.setDrawerEnabled({
			side: 'left',
			enabled: false
		});

		return () => {
			navigator.setDrawerEnabled({
				side: 'left',
				enabled: true
			});
		};
	}, []);

	return (
		<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
			<View
				style={{
					backgroundColor: CommonStyle.backgroundColor2,
					flex: 1
				}}
			>
				<LogoComp
					translateY={translateY}
					isOnLogin={isOnLogin}
					switchEnv={switchEnv}
				/>
				<Animated.View
					style={{
						width: 2 * DEVICE_WIDTH,
						flexDirection: 'row',
						opacity: inited ? 1 : 0,
						transform: [{ translateX: translateXAnim }]
					}}
				>
					<RegionWrapper
						env={env}
						listRegion={dataStorage.listRegion}
						showLogin={showLogin}
						regionCaching={regionCaching}
					/>
					<LoginWrapper
						showRegion={showRegion}
						hideShowRegion={hideShowRegion}
						translateY={translateY}
						loginWrapper={loginWrapper}
						translateXAnim={translateXAnim}
						listLoginType={listLoginType}
						setListLoginType={setListLoginType}
					/>
				</Animated.View>
			</View>
		</TouchableWithoutFeedback>
	);
};

export default Home;
