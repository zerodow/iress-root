import React from 'react'
import { Text, View } from 'react-native'
import * as Emitter from '@lib/vietnam-emitter'
// Style
import styles from '../style/home_page.2'
// Component
import XComponent from '../../../component/xComponent/xComponent'

export default class HeaderAccount extends XComponent {
	constructor(props) {
		super(props);

		this.init = this.init.bind(this);
		this.bindAllFunc = this.bindAllFunc.bind(this);
		this.bindAllFunc();
		this.init()
	}

	init() {
		this.state = {
			finish: false,
			title: this.props.title || '',
			content: this.props.content || ''
		}
	}

	bindAllFunc() {
		this.updateAction = this.updateAction.bind(this);
		this.renderTitle = this.renderTitle.bind(this);
		this.renderContent = this.renderContent.bind(this)
	}

	componentDidMount() {
		super.componentDidMount();
		const channel = this.props.channelChangeHeader;
		Emitter.addListener(channel, this.id, obj => {
			this.updateAction(obj)
		})
	}

	updateAction(obj) {
		const { title, content } = obj;
		this.setState({
			title,
			content
		})
	}

	renderTitle() {
		const { headerTitle } = styles;
		return <Text style={[headerTitle]}>
			{this.state.title}
		</Text>
	}

	renderContent() {
		const { headerContent } = styles;
		return <Text style={headerContent}>
			{this.state.content}
		</Text>
	}

	render() {
		return (
			<View style={{ justifyContent: 'center' }}>
				{
					this.renderTitle()
				}
				{
					this.renderContent()
				}
			</View>
		)
	}
}
