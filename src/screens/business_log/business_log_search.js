import React, { Component } from 'react';
import {
	View,
	Text,
	TextInput,
	FlatList,
	TouchableOpacity,
	Keyboard,
	Dimensions,
	Animated,
	TouchableWithoutFeedback,
	PixelRatio,
	Platform,
	ListView
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import styles from './style/business_log';
import { dataStorage } from '../../storage';
import ProgressBar from '../../modules/_global/ProgressBar';
import * as businessLogActions from './business_log.actions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
	logAndReport,
	logDevice,
	showContractDetail,
	isIphoneXorAbove
} from '../../lib/base/functionUtil';
import config from '../../config';
import I18n from '../../modules/language';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import RetryConnect from '../../component/retry_connect/retry_connect';
import deviceModel from '../../constants/device_model';
import performanceEnum from '../../constants/performance';
import Perf from '../../lib/base/performance_monitor';
import { setCurrentScreen } from '../../lib/base/analytics';
import analyticsEnum from '../../constants/analytics';
import Enum from '../../enum';
import RowBusinessLog from './row_business_log'
import InvertibleScrollView from 'react-native-invertible-scroll-view';

const { height, width } = Dimensions.get('window');
const { BUSINESS_LOG_TYPE } = Enum;

export class BusinessLogSearch extends Component {
	constructor(props) {
		super(props);
		this.keyboardDidShowListener = null;
		this.keyboardDidHideListener = null;
		this.deviceModel = dataStorage.deviceModel;
		this.textSearch = '';
		this.timeoutBlur = null;
		this.state = {
			isLoading: false,
			textSearchReal: '',
			textSearch: this.props.code ? this.props.code : '',
			keyboardHeight: 0,
			dataSource: new ListView.DataSource({
				rowHasChanged: (r1, r2) => r1 !== r2
			})
		}
		this.keyboardDidShow = this.keyboardDidShow.bind(this);
		this.keyboardDidHide = this.keyboardDidHide.bind(this);
		this.renderToLink = this.renderToLink.bind(this);
		this.renderRow = this.renderRow.bind(this);
		this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
		this.searchResponse = this.searchResponse.bind(this);
		this.perf = new Perf(performanceEnum.show_form_business_log_search);
	}

	onNavigatorEvent(event) {
		if (event.type === 'NavBarButtonPress') {
			switch (event.id) {
				default:
					break;
			}
		} else {
			switch (event.id) {
				case 'willAppear':
					setCurrentScreen(analyticsEnum.businessLogSearch);
					this.perf && this.perf.incrementCounter(performanceEnum.show_form_business_log_search);
					break;
				case 'didAppear':
					break;
				case 'willDisappear':
					break;
				case 'didDisappear':
					break;
				default:
					break;
			}
		}
	}

	componentWillUnmount() {
		this.keyboardDidShowListener.remove();
		this.keyboardDidHideListener.remove();
	}

	componentDidMount() {
		let textSearch = this.props.code;
		this.onChangeText(textSearch);
		this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.keyboardDidShow.bind(this));
		this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this.keyboardDidHide.bind(this));
	}

	componentWillReceiveProps(nextProps) {
		// if (nextProps && nextProps.bLog && nextProps.bLog.isSearchLoading !== this.state.isLoading) {
		// 	this.setState({ isLoading: nextProps.bLog.isSearchLoading });
		// }
		// Cập nhật listview data
		let listData = [];
		if (nextProps.bLog.listDataSearch && nextProps.bLog.listDataSearch.length) {
			listData = nextProps.bLog.listDataSearch;
			this.setState({
				dataSource: this.state.dataSource.cloneWithRows(
					listData
				)
			});
		}
	}

	keyboardDidShow(e) {
		const keyboardHeight = e.endCoordinates.height || 0;
		this.setState({ isShowKeyboard: true, keyboardHeight })
	}

	keyboardDidHide() {
		const keyboardHeight = 0;
		this.setState({ isShowKeyboard: false, keyboardHeight })
	}

	renderToLink(data) {
		showContractDetail(data, this.props.navigator, this.props.isConnected)
	}

	renderRow(rowData, rowID) {
		try {
			return (
				<RowBusinessLog setting={this.props.setting} index={rowID} key={`${rowID}`} testID='RowBusinessLog' data={rowData} renderToLink={this.renderToLink} />
			);
		} catch (error) {
			logAndReport('renderRow business log  exception', error, 'renderRow business log');
			logDevice('info', `renderRow business log  exception ${error}`);
		}
	}

	dismissModal() {
		this.props.navigator.dismissModal();
	}

	searchResponse(accountId, duration, textSearch) {
		try {
			this.props.actions.searchBusinessLog(accountId, duration, textSearch);
		} catch (error) {
			logDevice('info', `contract note search response exception: ${error}`);
		}
	}

	onChangeText(text) {
		this.setState({ textSearch: text });
		if (this.timeout) {
			clearTimeout(this.timeout);
		}
		if (this.timeoutBlur) {
			clearTimeout(this.timeoutBlur);
		}
		this.timeout = setTimeout(() => {
			if (text && text.length > 1) {
				const accountId = dataStorage.accountId;
				const duration = this.props.bLog.duration || BUSINESS_LOG_TYPE.Week;
				let textSearch = (text + '').replace(/\s+/g, '%20').toLowerCase();
				const tmp = textSearch.split('.');
				if (tmp[0] && !tmp[1]) {
					textSearch = tmp[0];
				}
				this.textSearch = textSearch;
				this.setState({ isLoading: true, textSearchReal: textSearch })
				this.props.actions.searchRequest();

				this.searchResponse(accountId, duration.toLowerCase(), textSearch);
			} else {
				this.textSearch = '';
				this.setState({ textSearchReal: '' });
				this.searchResponse('');
			}
		}, 300);
	}

	onFocus() {
		this.textSearch = '';
		this.setState({ textSearch: '' });
		this.searchResponse(null);
	}

	render() {
		let loading = null;
		if (this.props.isConnected) {
			loading = (
				<View style={{
					backgroundColor: 'white',
					width: '100%',
					flex: 1,
					justifyContent: 'center',
					alignItems: 'center'
				}}>
					<ProgressBar testID='BusinessLogLoading' />
					{
						Platform.OS === 'ios' ? <View style={{ height: this.state.keyboardHeight, backgroundColor: 'transparent' }} /> : null
					}
				</View>
			);
		} else {
			loading = (
				<RetryConnect onPress={() => this.searchResponse(this.textSearch, this.props.isRelated)} />
			);
		}
		return (
			<View style={{
				flex: 1,
				alignItems: 'center',
				backgroundColor: CommonStyle.statusBarBgColor,
				paddingTop: dataStorage.platform === 'ios' ? (isIphoneXorAbove() ? 36 : 16) : 0
			}}>
				<View style={CommonStyle.searchBarContainerClone}>
					<View style={styles.searchBar2}>
						<Icon testID='BusinessLogSearchIcon' name='ios-search' style={styles.iconSearch2} />
						<TextInput
							// selectionColor={'#FFFFFF'}
							testID='BusinessLogSearchInput'
							style={[styles.inputStyle, { lineHeight: Platform.OS === 'ios' ? 0 : 14 }]}
							underlineColorAndroid='transparent'
							autoFocus={true}
							returnKeyType="search"
							onChangeText={(text) => this.onChangeText(text)}
							value={this.state.textSearch}
						/>
						<Icon testID='BusinessLogSearchClearIcon' name='ios-close-circle' style={styles.iconRight2} onPress={this.onFocus.bind(this)} />
					</View>
					<TouchableOpacity
						testID='BusinessLogSearchCancelButton'
						style={styles.buttonCancelClone}
						onPress={this.dismissModal.bind(this)}>
						<Text style={styles.whiteText}>{I18n.t('cancel', { locale: this.props.setting.lang })}</Text>
					</TouchableOpacity>
				</View>
				{
					this.props.bLog.isSearchLoading ? loading : (
						this.props.bLog.listDataSearch && this.props.bLog.listDataSearch.length ? (
							<View style={{ backgroundColor: 'white', width: '100%', flex: 1 }}>
								<ListView
									testID='BusinessLogSearchScroll'
									renderScrollComponent={props => <InvertibleScrollView showsVerticalScrollIndicator={false} {...props} />}
									keyboardShouldPersistTaps="always"
									enableEmptySections
									automaticallyAdjustContentInsets={false}
									dataSource={this.state.dataSource}
									initialListSize={20}
									pageSize={30}
									renderRow={this.renderRow.bind(this)}
									style={{ height, backgroundColor: '#FFF' }}
								/>
								{
									Platform.OS === 'ios' ? <View style={{ height: this.state.keyboardHeight, backgroundColor: 'transparent' }} /> : null
								}
							</View>
						) : (
								this.state.textSearchReal.length >= 2 && !this.props.bLog.isSearchLoading ? <View style={{
									flex: 1,
									width: '100%',
									backgroundColor: 'white',
									justifyContent: 'center',
									alignItems: 'center'
								}}>
									<Text testID='BusinessLogSearchNoData'>{I18n.t('noBusinessLogData', { locale: this.props.setting.lang })}</Text>
									{
										Platform.OS === 'ios' ? <View style={{ height: this.state.keyboardHeight, backgroundColor: 'transparent' }} /> : null
									}
								</View> : <View style={{ flex: 1, width: '100%', backgroundColor: 'white' }} />
							)
					)
				}
			</View>
		)
	}
}

function mapStateToProps(state) {
	return {
		bLog: state.bLog,
		isConnected: state.app.isConnected,
		setting: state.setting
	};
}

function mapDispatchToProps(dispatch) {
	return {
		actions: bindActionCreators(businessLogActions, dispatch)
	};
}

export default connect(mapStateToProps, mapDispatchToProps)(BusinessLogSearch);
