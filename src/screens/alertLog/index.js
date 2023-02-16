import React, {
	useCallback,
	useRef,
	useLayoutEffect,
	useState,
	useEffect
} from 'react';
import { StyleSheet, Text, View } from 'react-native';
import KeyboardAvoidView from '~/component/keyboard_avoid_view/index.js';
import Header from '~s/alertLog/Components/Header';
import TabAlertLog from '~s/alertLog/View/TabAlertLog';
import { setRefTabbar } from '~/lib/base/functionUtil';
import Content from '~s/alertLog/View/Content';
import BottomTabBar from '~/component/tabbar';
import NetworkWarning from '~/component/network_warning/network_warning_basic';
import {
	destroy,
	getListAlertID,
	setAlertTag
} from '~s/alertLog/Model/AlertLogModel';
import ENUM from '~/enum';
import { clearInteractable } from '~/screens/marketActivity/Models/MarketActivityModel.js';
import TabView from '~/component/tabview4/';
import CommonStyle from '~/theme/theme_controller';
import { shallowEqual, useSelector, useDispatch } from 'react-redux';

const { ANIMATION_TYPE } = ENUM;

const TABS = [
	{
		label: 'alertlable',
		isDisabled: false
	},
	{
		label: 'notification',
		isDisabled: false
	}
];

const AlretLog = ({ navigator, targetNoti }) => {
	const ref = useRef();
	const dic = useRef({
		active: true
	});
	const listAlertId = getListAlertID();
	const [activeTab, setActiveTab] = useState(targetNoti ? 1 : 0);
	const dispatch = useDispatch();
	const onSuccess = () => {};
	const onError = () => {};
	const onChangeTabTabView = useCallback((activeTab) => {
		setAlertTag(activeTab);
		setActiveTab(activeTab);
		dispatch.alertLog.readNotification({
			listAlertId: listAlertId,
			onSuccess,
			onError
		});
		dispatch.alertLog.changeLoadingAlertLog(true);
	}, []);
	const updateActiveStatus = useCallback((newActive) => {
		dic.current.active = newActive;
	}, []);
	useEffect(() => {
		return () =>
			dispatch.alertLog.readNotification({
				listAlertId: listAlertId,
				onSuccess,
				onError
			});
	}, []);

	const onNavigatorEvent = useCallback((event) => {
		switch (event.id) {
			case 'willAppear':
				break;
			case 'didAppear':
				dispatch.alertLog.readNotification({
					listAlertId: listAlertId,
					onSuccess,
					onError
				});
				updateActiveStatus(true);
				break;
			case 'didDisappear':
				destroy();
				dispatch.alertLog.changeAnimationType(
					ANIMATION_TYPE.FADE_IN_SPECIAL
				);

				break;
			default:
				break;
		}
	}, []);

	useLayoutEffect(() => {
		const listener = navigator.addOnNavigatorEvent(onNavigatorEvent);
		return () => {
			dispatch.alertLog.changeAnimationType(
				ANIMATION_TYPE.FADE_IN_SPECIAL
			);
			listener();
		};
	}, []);

	return (
		<KeyboardAvoidView style={styles.container}>
			<Header navigator={navigator} />
			<TabView
				tabs={TABS}
				activeTab={activeTab}
				onChangeTab={onChangeTabTabView}
				wrapperStyle={{
					backgroundColor: CommonStyle.color.dark,
					justifyContent: 'space-around',
					zIndex: 9
				}}
				textTabStyle={{ fontSize: CommonStyle.font13 }}
			/>
			<NetworkWarning />
			<Content
				navigator={navigator}
				updateActiveStatus={updateActiveStatus}
				activeTab={activeTab}
			/>
			<BottomTabBar
				// index={0}
				ref={setRefTabbar}
				navigator={navigator}
				style={{ zIndex: 3 }}
			/>
		</KeyboardAvoidView>
	);
};

export default AlretLog;

const styles = StyleSheet.create({
	container: {
		flex: 1
	}
});
