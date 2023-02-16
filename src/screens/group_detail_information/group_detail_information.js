import React, { Component } from 'react';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import I18n from '../../modules/language/';
import { View, Text, ScrollView, processColor, TouchableOpacity, PixelRatio } from 'react-native';
import { Form, Item, Input, Label, Icon } from 'native-base';
import styles from './style/group_detail_information';
import { iconsMap } from '../../utils/AppIcons';
import { dataStorage } from '../../storage';
import PickerCustom from '../order/picker';
import IonIcons from 'react-native-vector-icons/Ionicons';

const listProduct = [
	'ABC',
	'DEF',
	'GHI',
	'KLM'
];

export default class GroupDetailInformation extends Component {
	constructor(props) {
		super(props);
				this.sampleData = {
			nameOfGroup: 'Individual Normal',
			product: 'Equity',
			priceboard: 'Realtime',
			description: 'Group of idividual accounts with holding valuation lo...'
		}
		this.state = {
			editable: false,
			description: this.sampleData.description
		}
		this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
	}

	componentDidMount() {
		if (this.state.editable) {
			this.props.navigator.setButtons({
				rightButtons: [{
					id: 'update_user',
					title: I18n.t('done'),
					disabled: true,
					icon: dataStorage.platform === 'ios' ? <Text></Text> : iconsMap['md-checkmark']
				}],
				animated: true
			});
		}
	}

	toggleEditable() {
		this.setState({ editable: !this.state.editable })
		if (this.state.editable) {
			this.props.navigator.setButtons({
				rightButtons: [{
					id: 'update_group_information',
					title: I18n.t('done'),
					disabled: false,
					icon: dataStorage.platform === 'ios' ? <Text></Text> : iconsMap['md-checkmark']
				}],
				animated: true
			});
		} else {
			this.props.navigator.setButtons({
				rightButtons: [{
					id: 'edit_group_information',
					icon: iconsMap['ios-create-outline']
				}],
				animated: true
			});
		}
	}

	onNavigatorEvent(event) {
		if (event.type === 'NavBarButtonPress') {
			this.toggleEditable();
		}
	}

	render() {
		return (
			<View >
				<Form >
					<Item stackedLabel>
						<Label style={[CommonStyle.textFloatingLabel, { marginBottom: -10 }]}>
							{I18n.t('NameOfGroup')}
						</Label>
						<Input style={styles.inputText}
							secureTextEntry={false}
							value={this.sampleData.nameOfGroup}
							editable={this.state.editable} />
					</Item>
					{this.state.editable ? <View style={{ paddingLeft: 16 }}>
						<PickerCustom
							name='product'
							editable={false}
							floatingLabel={I18n.t('Product')}
							selectedValue={'ABC'}
							data={listProduct} />
					</View> : <Item stackedLabel>
							<Label style={[CommonStyle.textFloatingLabel, { marginBottom: -10 }]}>
								{I18n.t('Product')}
							</Label>
							<Input style={styles.inputText}
								secureTextEntry={false}
								value={this.sampleData.product}
								editable={false} />
						</Item>}
					{this.state.editable ? <View style={{ paddingLeft: 16 }}>
						<PickerCustom
							name='product'
							editable={false}
							floatingLabel={I18n.t('Priceboard')}
							selectedValue={'ABC'}
							data={listProduct} />
					</View> : <Item stackedLabel>
							<Label style={[CommonStyle.textFloatingLabel, { marginBottom: -10 }]}>
								{I18n.t('Product')}
							</Label>
							<Input style={styles.inputText}
								secureTextEntry={false}
								value={this.sampleData.priceboard}
								editable={false} />
						</Item>}
					<Item stackedLabel>
						<Label style={[CommonStyle.textFloatingLabel, { marginBottom: -10 }]}>
							{I18n.t('Description')}
						</Label>
						<Input style={styles.inputText}
							secureTextEntry={false}
							value={this.sampleData.description}
							editable={this.state.editable}
							onChangeText={(text) => this.setState({ description: text })} />
					</Item>
				</Form>
			</View>
		);
	}
}
