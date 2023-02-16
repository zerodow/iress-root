import React, { Component } from 'react';
import {
    View,
    Text,
    Platform,
    TouchableOpacity
} from 'react-native'

export default class CustomAccordion extends Component {
    constructor(props) {
        super(props)
        this.onChange = this.onChange.bind(this)
        this.renderHeader = this.renderHeader.bind(this)
        this.renderContent = this.renderContent.bind(this)
        this.state = {
            isExpand: false
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.isExpand !== undefined && nextProps.isExpand !== this.state.isExpand) {
            this.setState({
                isExpand: nextProps.isExpand
            })
        }
    }

    onChange() {
        this.props.onChange && this.props.onChange(!this.state.isExpand)
    }

    renderHeader() {
        if (this.props.renderHeader) {
            return this.props.renderHeader();
        }
        return <View />
    }

    renderContent() {
        if (this.props.renderContent && this.state.isExpand) {
            return this.props.renderContent()
        }
        return <View />
    }

    render() {
        return (
            <View>
                <TouchableOpacity onPress={this.onChange}>
                    {this.renderHeader()}
                </TouchableOpacity>
                {this.renderContent()}
            </View>
        )
    }
}
