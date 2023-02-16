import React, { Component } from 'react';
import {
	Text, View, ScrollView
} from 'react-native';
import RnCollapsible from 'rn-collapsible';
import { SwagChild, SwagList } from './swaglist'

class Price11 extends Component {
	renderHeader() {
		return (
			<View
				style={{ backgroundColor: '#ccc', height: this.props.heightHeader }}>
				<Text style={{ color: 'black' }}>{this.props.index}</Text>
			</View>
		)
	}

	renderContent() {
		return (
			<View
				style={{ backgroundColor: 'blue', height: this.props.heightContent }}
			/>
		)
	}

	render() {
		return (
			<SwagChild
				style={{ borderColor: 'gray', borderWidth: 1 }}
				parentId={this.props.parentId}
				index={this.props.index}
				renderChild={() => {
					return (
						<RnCollapsible
							duration={150}
							isExpand={false}
							renderHeader={this.renderHeader.bind(this)}
							renderContent={this.renderContent.bind(this)}
						/>)
				}}>
			</SwagChild>
		)
	}
}

export default class Trade extends Component {
	constructor(props) {
		super(props);

		this.renderRow = this.renderRow.bind(this)

		this.data = [];
		for (let i = 0; i < 300; i++) {
			this.data.push({
				heightHeader: 30 + i,
				heightContent: 40 + i
			});
		}
	}

	renderRow(parentId, item, index) {
		return (
			<Price11
				key={index}
				index={index}
				parentId={parentId}
				{...item} />
		)
	}

	renderFooter() {
		return (
			<View>
				<View style={{ height: 86 }}></View>
			</View>
		)
	}

	render() {
		return (
			<SwagList
				style={{
					flex: 1,
					backgroundColor: 'white'
				}}
				renderFooter={this.renderFooter}
				scrollEventThrottle={100}
				renderRow={this.renderRow}
				data={this.data} />
		)
	}
	//  #endregion
}
