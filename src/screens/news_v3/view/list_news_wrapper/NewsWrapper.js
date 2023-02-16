import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Text, View, Platform, KeyboardAvoidingView } from 'react-native';
import * as Controller from '~/memory/controller';
import {
	logAndReport,
	setStyleNavigation,
	switchForm,
	logDevice,
	showNewsDetail,
	openSignIn,
	setRefTabbar
} from '~/lib/base/functionUtil';
import * as Emitter from '@lib/vietnam-emitter';
import { useSelector } from 'react-redux';
// Components
import FallHeader from '~/component/fall_header';
import Header from '~/screens/news_v3/view/list_news_wrapper/wrapper_header/WrapperHeader.js';
import NewsWrapperContent from './wrapper_content/WrapperContent';
import NewsWrapperProvider from './NewsWrapperProvider';
import BottomTabBar from '~/component/tabbar';
// Helper
import { animate } from '~/screens/news_v3/helper/animation.js';
import ENUM from '~/enum';
import {
	setActiveScreen,
	setInactiveScreen,
	doActiveScreen,
	doInactiveScreen
} from '~/manage/manageActiveScreen';
import OrderError from '~/component/Error/OrderError.js';
import ScreenId from '~/constants/screen_id';
import {
	getChannelShowMessageNews,
	getChannelHideOrderError
} from '~/streaming/channel';
// Langue
import I18n from '~/modules/language/';
// Style
import * as HeaderModel from '~/screens/news_v3/model/header_list_news/header.model.js';
import CommonStyle, { register } from '~/theme/theme_controller';
import { reLoadScreenNow } from '~/manage/manageAppState.js';
// error
import ErrorHandlingNews from '../../Error/ErrorHandlingNews';
import Error from '~/component/error_system/Error.js';

const { ACTIVE_STREAMING, SCREEN } = ENUM;
const useDuration = () => {
	return ([duration, setDuration] = useState(HeaderModel.getDuration()));
};
const WrapperComponent = (props) => {
	const styles = {
		flex: 1,
		backgroundColor: CommonStyle.backgroundColor1
	};
	if (Platform.OS === 'ios') {
		return <View {...props} style={[styles, props.style]} />;
	} else {
		return (
			<KeyboardAvoidingView
				{...props}
				enabled={false}
				behavior="height"
				style={[styles, props.style]}
			/>
		);
	}
};
const NewWrapperProvider = React.memo(
	(props) => {
		const [duration, setDuration] = useDuration();
		const channelShowMessage = getChannelShowMessageNews();
		const channelHideMessage = getChannelHideOrderError();
		const [isCheck, setIsCheck] = useState(true);
		const handleChangeDuration = useCallback(
			(params) => {
				animate();
				setDuration(params);
			},
			[duration]
		);
		const isConnecting = useSelector((state) => state.app.isConnected);
		const showError = function (error) {
			setIsCheck(false);
			Emitter.emit(channelShowMessage, {
				msg: error,
				type: ENUM.TYPE_MESSAGE.ERROR
			});
		};

		const hideErrorFn = function () {
			Emitter.emit(channelHideMessage);
		};

		return (
			<NewsWrapperProvider
				navigator={props.navigator}
				channelShowMessage={channelShowMessage}
				showError={showError}
				hideErrorFn={hideErrorFn}
				isRender={true}
			>
				<WrapperComponent>
					<Header
						style={{ paddingBottom: 5 }}
						setDuration={handleChangeDuration}
						navigator={props.navigator}
					/>
					{!isConnecting ? (
						<OrderError channel={channelShowMessage} />
					) : null}
					<Error screenId={ScreenId.NEWS} onReTry={reLoadScreenNow} />
					<NewsWrapper {...props} isCheck={isCheck} />
				</WrapperComponent>
			</NewsWrapperProvider>
		);
	},
	() => true
);
const NewsWrapper = (props) => {
	console.log('IS CHECK', props.isCheck);
	return (
		<React.Fragment>
			{!Controller.getLoginStatus() ? (
				<View style={{ flex: 1 }}>
					<View style={{ flex: 1 }}>
						<View
							style={{
								flex: 7,
								justifyContent: 'center',
								alignItems: 'center',
								flexDirection: 'row'
							}}
						>
							<Text
								style={{
									opacity: 0.87,
									color: CommonStyle.fontColor,
									fontSize: CommonStyle.fontSizeS,
									fontFamily: CommonStyle.fontPoppinsRegular
								}}
							>
								{I18n.t('newsPart1')}{' '}
							</Text>
							<Text
								testID={`signin`}
								style={{
									color: CommonStyle.color.turquoiseBlue,
									fontSize: CommonStyle.fontSizeS,
									fontFamily: CommonStyle.fontPoppinsRegular
								}}
								onPress={() => openSignIn()}
							>
								{I18n.t('newsPart2')}{' '}
							</Text>
							<Text
								style={{
									opacity: 0.87,
									color: CommonStyle.fontColor,
									fontSize: CommonStyle.fontSizeS,
									fontFamily: CommonStyle.fontPoppinsRegular
								}}
							>
								{I18n.t('newsPart3')}
							</Text>
						</View>
					</View>
				</View>
			) : (
				<NewsWrapperContent
					navigator={props.navigator}
					isCheck={props.isCheck}
				/>
			)}

			<BottomTabBar ref={setRefTabbar} navigator={props.navigator} />
		</React.Fragment>
	);
};

export default NewWrapperProvider;
