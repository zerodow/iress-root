import { View, ScrollView } from 'react-native'
import * as Emitter from '@lib/vietnam-emitter'
import React from 'react'
import PropTypes from 'prop-types'
import XComponent from '../../component/xComponent/xComponent'

function getChannelChangingChildPosition(id) {
	return `changing_child_position_${id}`
}

function getChannelReqChildMesurePosition(id) {
	return `req_child_mesure_position_${id}`
}

export class SwagChild extends XComponent {
	static propTypes = {
		style: PropTypes.any,
		index: PropTypes.number.isRequired,
		parentId: PropTypes.string.isRequired
	}

	init() {
		this.style = this.props.style || {}
		this.channelChangingChildPosition = getChannelChangingChildPosition(this.parentId)
		this.getChannelReqChildMesurePosition = getChannelReqChildMesurePosition(this.parentId)

		Emitter.addListener(this.getChannelReqChildMesurePosition, this.id, this.mesurePosition)
	}

	mesurePosition() {
		this.myComponent.measure((fx, fy, width, height, px, py) => {
			Emitter.emit(this.channelChangingChildPosition, {
				py,
				height,
				index: this.props.index
			})
		})
	}

	componentDidMount() {
		super.componentDidMount()

		setTimeout(this.mesurePosition, 0)
	}

	render() {
		return (
			<View
				style={this.style}
				ref={view => this.myComponent = view}>
				{this.props.renderChild()}
			</View>
		)
	}
}

export class SwagList extends XComponent {
	static propTypes = {
		style: PropTypes.any,
		data: PropTypes.array,
		renderFooter: PropTypes.array,
		onChangeVisibleRows: PropTypes.func,
		renderRow: PropTypes.func.isRequired,
		scrollEventThrottle: PropTypes.number
	}

	init() {
		this.height = null
		this.currentPosition = 0
		this.dicChildPosition = {}
		this.counterMesuringChild = 0
		this.dicChildVisibleStatus = {}
		this.data = this.props.data || []
		this.renderRow = this.props.renderRow
		this.scrollEventThrottle = this.props.scrollEventThrottle || 0
		this.getChannelReqChildMesurePosition = getChannelReqChildMesurePosition(this.id)
		this.style = this.props.style
			? {
				...this.props.style,
				flexDirection: 'column',
				justifyContent: 'flex-end'
			}
			: {}
	}

	mesureChildManual() {
		this.counterMesuringChild = 0
		Emitter.emit(this.getChannelReqChildMesurePosition)
	}

	componentDidMount() {
		const channel = getChannelChangingChildPosition(this.parentId)
		Emitter.addListener(channel, this.id, ({ py, height, index }) => {
			this.counterMesuringChild++
			this.dicChildPosition[index] = { py, height }
			if (this.counterMesuringChild === this.data.length) {
				this.counterMesuringChild = 0
				this.reCalculateChildVisible()
			}
		})
	}

	reCalculateChildVisible() {
		const listChange = {}
		const startFrame = this.currentPosition
		const endFrame = this.currentPosition + this.height

		for (const index in this.dicChildPosition) {
			const { py, height } = this.dicChildPosition[index]
			const startChild = py
			const endChild = py + height
			let childVisibleStatus = false

			if ((startChild >= startFrame && startChild <= endFrame) ||
				(endChild >= startFrame && endChild <= endFrame)) {
				childVisibleStatus = true
			}
			if (this.dicChildVisibleStatus[index] !== childVisibleStatus) {
				this.dicChildVisibleStatus[index] = childVisibleStatus
				listChange[index] = childVisibleStatus
			}
		}

		Object.keys(listChange).length > 0 &&
			this.props.onChangeVisibleRows &&
			this.props.onChangeVisibleRows(listChange)
	}

	renderFooter() {
		return this.props.renderFooter
			? this.props.renderFooter()
			: <React.Fragment />
	}

	render() {
		return (
			<View style={this.style}>
				<View
					style={{ flex: 1 }}
					onLayout={event => {
						this.height = event.nativeEvent.layout.height
					}}>
					<ScrollView
						style={{ flex: 1 }}
						scrollEventThrottle={this.scrollEventThrottle}
						onScroll={event => {
							this.currentPosition = event.nativeEvent.contentOffset.y
							this.reCalculateChildVisible()
						}}>
						{this.data.map((item, index) => (
							this.renderRow(this.id, item, index)
						))}
					</ScrollView>
				</View>
				{this.renderFooter()}
			</View>
		)
	}
}
