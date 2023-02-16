import React, { Component } from 'react';
import { Text, View, Modal } from 'react-native';

export default class Tips extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modalVisible: false
        }
    }

    render() {
        return (<Modal
            animationType="none"
            transparent={true}
            visible={this.state.modalVisible}>
            <View style={this.props.contentStyle}>
                {this.props.content}
            </View>
        </Modal>)
    }
}
