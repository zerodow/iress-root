import React, { PureComponent } from 'react';
import { View, LayoutAnimation, TouchableWithoutFeedback } from 'react-native';
import { connect } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import _, { remove } from 'lodash';
import * as Emitter from '@lib/vietnam-emitter';
import Animated from 'react-native-reanimated';
import * as Controller from '~/memory/controller';

import Enum from '~/enum';
import Row from '../Component/Row';
import WatchListActions from '../reducers';
import { func } from '~/storage';
import SCREEN from '../screenEnum';
import * as StreamingBusiness from '~/streaming/streaming_business';
import * as RoleUser from '~/roleUser';
import styles from '~s/addcode/style/addcode';
import FirstSubHeader from '../Component/FirstSubHeader';
import SecondSubHeader from '../Component/SecondSubHeader';
import SearchBar from '../Header/header.searchBar';
import FlatList from '../Animator/FLatListAni';
import * as Business from '~/business';

const { TYPE_PRICEBOARD, WATCHLIST, ROLE_DETAIL } = Enum;

const { PERSONAL, IRESS } = TYPE_PRICEBOARD;

class Header extends PureComponent {
	render() {
		return (
			<Animated.View
				style={{
					zIndex: 9,
					transform: [{ translateY: this.props._scrollValue }]
				}}
			>
				<FirstSubHeader>
					<View
						style={{
							flexDirection: 'row',
							paddingBottom: 8
						}}
					>
						<View style={{ width: 36 }} />
						<View style={{ flex: 1 }}>
							<SearchBar navigator={this.props.navigator} />
						</View>
					</View>
				</FirstSubHeader>

				<SecondSubHeader initY={0} startAtFirst={false} />
			</Animated.View>
		);
	}
}

export class SelectionList extends PureComponent {
	constructor(props) {
		super(props);
		this.data = [];
		this.renderItem = this.renderItem.bind(this);
		this.onDelete = this.onDelete.bind(this);
		this.onClickOutSideAllRow = this.onClickOutSideAllRow.bind(this);
		this.channelChild = StreamingBusiness.getChannelChildExpandStatus(
			'selectedWatchlist'
		);
		// Hiện áp dụng role cho bảng giá personal, không cho bảng giá system
		this.role =
			this.props.typePriceBoard === PERSONAL
				? RoleUser.checkRoleByKey(ROLE_DETAIL.C_E_R_WATCHLIST)
				: true;
		this.state = {
			delayRender: true
		};
	}

	componentDidMount() {
		setTimeout(() => {
			this.setState({ delayRender: false });
		}, 30);
	}

	onClickOutSideAllRow() {
		if (!this.props.isConnected) return;
		Emitter.emit(this.channelChild, -1);
	}

	renderLeftIcon(isActived, onIconPress) {
		if (this.props.typePriceBoard !== PERSONAL) return null;
		return (
			<Icon
				name="md-remove-circle"
				style={[
					styles.iconLeft,
					{
						paddingLeft: 16,
						opacity: this.role && !isActived ? 1 : 0.6
					}
				]}
				onPress={onIconPress}
			/>
		);
	}

	renderItem({ item }) {
		const { watchlist_name: name, watchlist: id } = item;
		const {
			changePriceBoard,
			priceBoardSelected,
			deletePriceBoard
		} = this.props;

		const onPress = (priceboardId) => {
			func.setCurrentPriceboardId(priceboardId, true);
			changePriceBoard(priceboardId);

			LayoutAnimation.easeInEaseOut();
			this.props.setScreenActive(SCREEN.WATCHLIST);
		};

		const isActived = priceBoardSelected === id;

		const renderRightIcon = (color) => {
			if (isActived) {
				return <Icon name="md-checkmark" size={24} color={color} />;
			}
			return null;
		};

		let onIconPress = () => null;
		let onRowPress = () => null;
		if (this.role && !isActived) {
			onIconPress = () => deletePriceBoard(item);
		}
		if (!isActived) {
			onRowPress = () => onPress(id);
		}

		return (
			<View
				style={{
					flexDirection: 'row',
					alignItems: 'center',
					flex: 1
				}}
			>
				{this.renderLeftIcon(isActived, onIconPress)}
				<View style={{ flex: 1 }}>
					<Row
						isActived={isActived}
						title={name}
						onPress={onRowPress}
						renderRightIcon={renderRightIcon}
					/>
				</View>
			</View>
		);
	}

	getData() {
		const { typePriceBoard, priceBoard } = this.props;
		switch (typePriceBoard) {
			case PERSONAL:
			case IRESS:
				return priceBoard;
			default:
				return [];
		}
	}

	renderSeparator() {
		return <View style={{ height: 8 }} />;
	}

	renderListFooter() {
		return <View style={{ height: 92 }} />;
	}

	renderListHeader = this.renderListHeader.bind(this);
	renderListHeader() {
		return <Header navigator={this.props.navigator} />;
	}

	render() {
		const data = this.getData();
		const { fromScreen } = this.props;
		const animation =
			fromScreen === SCREEN.CATEGORIES_WATCHLIST &&
			fromScreen !== SCREEN.SEARCH_PRIBOARD
				? 'fadeInRight'
				: 'fadeIn';
		const content = (
			<FlatList
				animation={animation}
				data={data}
				ListHeaderComponentStyle={{ zIndex: 9 }}
				ListHeaderComponent={this.renderListHeader}
				ListFooterComponent={this.renderListFooter}
				ItemSeparatorComponent={this.renderSeparator}
				renderItem={this.renderItem}
				showsVerticalScrollIndicator={false}
				numberAnimations={13}
			/>
		);
		return (
			<TouchableWithoutFeedback
				onPress={this.onClickOutSideAllRow}
				style={{ flex: 1, borderWidth: 1 }}
			>
				<React.Fragment>
					{!this.state.delayRender && content}
					<View style={{ flex: 1, height: 20 }} />
				</React.Fragment>
			</TouchableWithoutFeedback>
		);
	}
}

const mapStateToProps = (state) => {
	const { screenParams, screenSelected } = state.watchlist3;

	const {
		userPriceBoard,
		staticPriceBoard,
		priceBoardSelected,
		typePriceBoard: wlType
	} = state.priceBoard;

	const { typePriceBoard: paramType, fromScreen } =
		screenParams[screenSelected] || {};

	const typePriceBoard = paramType || wlType || '';

	let priceBoard = staticPriceBoard;
	if (typePriceBoard === PERSONAL) {
		priceBoard = userPriceBoard;
		delete priceBoard[WATCHLIST.USER_WATCHLIST];
	}

	return {
		priceBoard,
		typePriceBoard,
		priceBoardSelected,
		fromScreen,
		isConnected: state.app.isConnected
	};
};

const mapDispatchToProps = (dispatch) => ({
	changePriceBoard: dispatch.priceBoard.selectPriceBoard,
	setScreenActive: (...p) =>
		dispatch(WatchListActions.watchListSetScreenActived(...p))
});

export default connect(mapStateToProps, mapDispatchToProps)(SelectionList);
