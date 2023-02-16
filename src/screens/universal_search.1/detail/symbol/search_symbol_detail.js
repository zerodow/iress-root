import React, { PureComponent } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import CommonStyle from '~/theme/theme_controller';
import { connect } from 'react-redux';
// Component
import Ionicons from 'react-native-vector-icons/Ionicons';
import AnnouncementIcon from '@component/announcement_icon/announcement_icon';
import Flag from '@component/flags/flag';
// Util
import * as Business from '~/business';
import * as Controller from '~/memory/controller';
import * as Api from '~/api';

export class SearchSymbolDetail extends PureComponent {
	renderSymbol = this.renderSymbol.bind(this);
	getDisplayName = this.getDisplayName.bind(this);
	onPress = this.onPress.bind(this);
	getNewsToday = this.getNewsToday.bind(this);
	pubNewsToday = this.pubNewsToday.bind(this);
	state = {
		symbol: this.props.symbol || '',
		data: {},
		listOrderHistory: [],
		isShowPrice: false,
		isNewsToday: false
	};

	onPress() {
		console.log('onPress');
	}
	getNewsToday(symbol) {
		if (symbol) {
			const checkUrl = Api.checkNewsTodayUrl(symbol);
			try {
				Api.requestData(checkUrl)
					.then((data) => {
						if (data) {
							this.pubNewsToday({ symbol, data });
						}
					})
					.catch((error) =>
						console.log('error get data news inday', error)
					);
			} catch (error) {
				console.catch(error);
			}
		}
	}
	pubNewsToday({ symbol, data }) {
		const isNewsToday = data[symbol];
		if (this.state.isNewsToday !== isNewsToday) {
			this.setState({ isNewsToday });
		}
	}
	componentWillReceiveProps(props) {
		this.timeOutGetNews && clearTimeout(this.timeOutGetNews);
		if (props.symbol && props.symbol !== this.state.symbol) {
			this.timeOutGetNews = setTimeout(() => {
				this.getNewsToday(props.symbol);
			}, 300);
			this.setState({
				symbol: props.symbol
			});
		}
	}
	getDisplayName() {
		const { symbol } = this.state;
		return Business.getDisplayName({ symbol });
	}

	renderIconAddRemove() {
		const isFavorite = false;
		let content = (
			<Ionicons name="ios-remove-circle" size={20} color={'#df0000'} />
		);
		if (!isFavorite) {
			content = (
				<Ionicons name="ios-add-circle" size={20} color={'#00b800'} />
			);
		}

		const isLogin = Controller.getLoginStatus();
		const curStyles = isLogin ? {} : { opacity: 0.54 };
		return (
			<TouchableOpacity
				style={curStyles}
				onPress={this.onPress}
				disabled={!isLogin}
			>
				<View
					style={{
						width: 32,
						height: 32,
						justifyContent: 'center'
					}}
				>
					{content}
				</View>
			</TouchableOpacity>
		);
	}

	renderSymbol() {
		const displayName = this.getDisplayName();
		return (
			<Text
				style={[
					{
						fontFamily: 'HelveticaNeue-Bold',
						fontSize: CommonStyle.fontSizeXXL,
						color: CommonStyle.fontColor,
						fontWeight: '700'
					}
				]}
			>
				{displayName}
			</Text>
		);
	}

	renderCompany() {
		const { symbol } = this.state;
		const symbolInfo = Business.getSymbolInfo({ symbol });
		const companyName = (
			symbolInfo.company_name ||
			symbolInfo.company ||
			symbolInfo.security_name ||
			''
		).toUpperCase();
		return (
			<View
				style={[
					{
						flexDirection: 'row'
					}
				]}
			>
				<View
					style={{
						width: '80%',
						alignItems: 'flex-start',
						justifyContent: 'flex-end'
					}}
				>
					<Text
						numberOfLines={2}
						style={[
							CommonStyle.textAlert,
							{
								textAlign: 'left',
								color: CommonStyle.fontCompany
							}
						]}
					>
						{companyName}
					</Text>
				</View>

				<View
					style={[
						{
							flex: 1,
							justifyContent: 'flex-end',
							alignItems: 'center',
							flexDirection: 'row'
						}
					]}
				>
					<Flag
						type={'flat'}
						code={symbol ? Business.getFlag(symbol) : ''}
						size={20}
						style={{ marginRight: 8, marginTop: 1.5 }}
					/>
					<AnnouncementIcon
						channelNewsToday={this.props.channelNewsToday}
						symbol={symbol}
						isNewsToday={this.state.isNewsToday || false}
						containerStyle={{
							width: 13,
							height: 13,
							marginTop: 1,
							borderRadius: 1,
							alignItems: 'center',
							justifyContent: 'center',
							backgroundColor: this.props.isNewsToday
								? CommonStyle.newsActive
								: CommonStyle.newsInactive
						}}
						contentStyle={{
							color: CommonStyle.newsTextColor,
							fontFamily: CommonStyle.fontFamily,
							fontSize: CommonStyle.fontSizeXS - 3,
							textAlign: 'center'
						}}
					/>
				</View>
			</View>
		);
	}

	render() {
		const { symbol } = this.state;
		if (!symbol) {
			return null;
		}
		return (
			<View
				style={{
					marginHorizontal: 16,
					flex: 1,
					justifyContent: 'center'
				}}
			>
				{this.renderSymbol()}
				{this.renderCompany()}
			</View>
		);
	}
	componentDidMount() {
		this.timeOutGetNews = setTimeout(() => {
			this.getNewsToday(this.props.symbol);
		}, 300);
	}
}

const mapStateToProps = (state) => ({
	isLoading: state.uniSearch.isLoading,
	listData: state.uniSearch.listData
});

export default connect(mapStateToProps)(SearchSymbolDetail);
