import React, { PureComponent } from 'react';
import {
	View,
	Text,
	PixelRatio,
	FlatList,
	TouchableOpacity
} from 'react-native';
import _ from 'lodash';
import moment from 'moment';
import { connect } from 'react-redux';

import * as Controller from '../../memory/controller';
import * as Emitter from '@lib/vietnam-emitter';
import * as RoleUser from '../../roleUser';
import * as Util from '../../util';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func';
import Enum from '../../enum';
import I18n from '../../modules/language/';
import LoadingComp from '../../component/loadingComp';
import SVActions from '../../component/scrollCustom/scrollview.reducer';
import SwiperActions from './swiper_10_trades.reducer';
import styles from './style/market_depth';
import {
	formatNumber,
	formatNumberNew2,
	convertTimeGMT,
	renderTime
} from '../../lib/base/functionUtil';
import { getDateOnly, addDaysToTime } from '../../lib/base/dateTime';
import AppState from '~/lib/base/helper/appState2';

const PRICE_DECIMAL = Enum.PRICE_DECIMAL;

export class Header extends PureComponent {
	render() {
		return (
			<View
				style={{
					borderBottomWidth: 1,
					borderTopWidth: 1,
					borderColor: '#0000001e',
					marginHorizontal: 16
				}}
			>
				<View
					testID="tenTradeOrderHeader"
					style={[styles.header2, { paddingVertical: 9 }]}
				>
					<Text
						testID={`newOrderFilledTimeLabel`}
						style={[
							CommonStyle.textMainHeader,
							styles.col21,
							{ paddingRight: 16 }
						]}
					>
						{I18n.t('filledTimeUpper', {
							locale: Controller.getLang()
						})}
					</Text>
					<Text
						testID={`newOrderVolumeLabel`}
						style={[
							CommonStyle.textMainHeader,
							styles.col22,
							{ paddingRight: 16, textAlign: 'right' }
						]}
					>
						{I18n.t('quantityUpper')}
					</Text>
					<Text
						testID={`newOrderFilledLabel`}
						style={[
							CommonStyle.textMainHeader,
							styles.col23,
							{ textAlign: 'right' }
						]}
					>
						{I18n.t('filledCoS')}
					</Text>
				</View>
			</View>
		);
	}
}

export class ListEmpty extends PureComponent {
	getText(text) {
		return I18n.t(text);
	}
	render() {
		return (
			<View
				style={{
					height: 200,
					paddingHorizontal: 16,
					justifyContent: 'center',
					alignItems: 'center'
				}}
			>
				<Text style={{ color: CommonStyle.fontColor }}>
					{this.getText('noCosData')}
				</Text>
			</View>
		);
	}
}

const ROW_KEY = 'TEN_TRADE';
class RowComp extends React.Component {
	constructor(props) {
		super(props);
		this.id = ROW_KEY + props.index;
		this.props.addSVChild(this.id, () => this);
	}

	shouldComponentUpdate({ isShouldRender }) {
		return isShouldRender || _.isUndefined(isShouldRender);
	}

	componentWillUnmount = () => {
		this.props.rmSVChild(this.id);
	};

	render() {
		const { data = {}, index } = this.props;
		const endTime = getDateOnly(addDaysToTime(new Date(), 1)).getTime() - 1;
		let format = 'HH:mm:ss';
		if (data.time > endTime) {
			format = 'DD MMM HH:mm:ss';
		}
		const displayTime = renderTime(data.time, format);
		return (
			<View
				key={index}
				style={[
					styles.rowContainer,
					{
						marginHorizontal: 16,
						paddingHorizontal: 16,
						backgroundColor: CommonStyle.backgroundColor,
						borderColor: CommonStyle.fontBorderGray,
						borderBottomWidth: 1
					}
				]}
			>
				<Text
					testID={`tenTradeFilledTime${index}`}
					style={[
						CommonStyle.textMainLight,
						styles.col21,
						{ paddingRight: 16 }
					]}
				>
					{displayTime}
				</Text>
				<Text
					testID={`tenTradeVolume${index}`}
					style={[
						CommonStyle.textMainNormal,
						styles.col22,
						{ paddingRight: 16, textAlign: 'right' }
					]}
				>
					{formatNumber(data.quantity)}
				</Text>
				<Text
					testID={`tenTradeFilled${index}`}
					style={[
						CommonStyle.textMain,
						styles.col23,
						{ textAlign: 'right' }
					]}
				>
					{formatNumberNew2(data.price, PRICE_DECIMAL.PRICE)}
				</Text>
			</View>
		);
	}
}

export const Row = connect(
	(state, ownProps) => ({
		isShouldRender: state.scrollView.childStatus[ROW_KEY + ownProps.index]
	}),
	dispatch => ({
		addSVChild: (...p) =>
			dispatch(SVActions.SvMeasureAddChildToStack(...p)),
		rmSVChild: (...p) =>
			dispatch(SVActions.SvMeasureRemoveChildToStack(...p))
	})
)(RowComp);

class MoreData extends PureComponent {
	getText(text) {
		return I18n.t(text);
	}

	render() {
		const { orderScreen, isMore, loadMore } = this.props;
		if (!orderScreen && isMore) {
			return (
				<TouchableOpacity
					onPress={loadMore}
					style={[
						styles.rowExpandNews,
						{
							width: '100%',
							backgroundColor: CommonStyle.backgroundColor
						}
					]}
				>
					<Text
						style={{
							fontSize: CommonStyle.fontSizeS,
							color: CommonStyle.fontBlue
						}}
					>
						{this.getText('more')}
					</Text>
				</TouchableOpacity>
			);
		}
		return null;
	}
}

export const More = connect(
	state => ({ isMore: state.swiperTenTrade.isMore }),
	dispatch => ({
		loadMore: (...p) => dispatch(SwiperActions.loadMoreSwiperTenTrade(...p))
	})
)(MoreData);
class TenTrade extends PureComponent {
	constructor(props) {
		super(props);
		this.idForm = Util.getRandomKey();

		this.props.navigator.addOnNavigatorEvent(
			this.onNavigatorEvent.bind(this)
		);

		this.appState = new AppState(() => {
			this.props.subSwiper10Trade(this.idForm);
		});
	}

	componentWillReceiveProps = nextProps => {
		const { isConnected, symbol } = nextProps;
		const changeNerworkState =
			this.props.isConnected === false && isConnected === true;
		const changeSymbol = this.props.symbol !== symbol;

		if (changeSymbol || changeNerworkState) {
			nextProps.subSwiper10Trade(this.idForm);
		}

		if (changeSymbol) {
			nextProps.resetData();
		}
	};

	componentDidMount() {
		this.props.subSwiper10Trade(this.idForm);
	}

	onNavigatorEvent(event) {
		switch (event.id) {
			case 'willAppear':
				this.props.isUnis || this.props.resetData();
				break;
			case 'didAppear':
				this.props.subSwiper10Trade(this.idForm);
				this.appState.addListenerAppState();
				break;
			case 'didDisappear':
				Emitter.deleteByIdEvent(this.idForm);
				this.appState.removeListenerAppState();
				break;
			default:
				break;
		}
	}

	renderContent() {
		if (
			_.isEmpty(this.props.tenTradeData) ||
			!RoleUser.checkRoleByKey(
				Enum.ROLE_DETAIL.VIEW_COURSE_OF_SALS_UNIVERSALSEARCH
			)
		) {
			return <ListEmpty />;
		} else {
			return (
				<React.Fragment>
					<FlatList
						scrollEnabled={!this.props.scrollDisable}
						data={this.props.tenTradeData}
						renderItem={({ item, index }) => (
							<Row index={index} data={item} />
						)}
					/>
					<More />
				</React.Fragment>
			);
		}
	}

	render() {
		return (
			<LoadingComp isLoading={this.props.isLoading}>
				<Header />
				{this.renderContent()}
			</LoadingComp>
		);
	}
}

const mapStateToProps = state => ({
	isLoading: state.swiperTenTrade.isLoading,
	tenTradeData: state.swiperTenTrade.listDataShow,
	isConnected: state.app.isConnected,
	symbol: state.searchDetail.symbol
});

const mapDispatchToProps = dispatch => ({
	subSwiper10Trade: (...p) => dispatch(SwiperActions.subSwiperTenTrade(...p)),
	resetData: (...p) => dispatch(SwiperActions.initSwiperTenTrade(...p))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(TenTrade);
