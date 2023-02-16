import React, { Component } from 'react';
import { View, Text, Image, TouchableOpacity, TouchableWithoutFeedback, Modal, Alert } from 'react-native';
import styles from './style/modal_custom';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default class ModalCustom extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modalVisible: this.props.modalVisible || false
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps && nextProps.modalVisible !== this.state.modalVisible) {
            this.setState({ modalVisible: nextProps.modalVisible });
        }
    }

    render() {
        return (
            <Modal
            style={{ justifyContent: 'center', alignItems: 'center' }}
            animationType={'none'}
            transparent={true}
            visible={this.state.modalVisible}
            onRequestClose={() => null}
            >
            <TouchableWithoutFeedback
              onPress={() => {
                  this.setState({ modalVisible: false }, this.props.onPress)
                }}>
              <View style={styles.modalWrapper}>
                {this.props.children}
              </View>
            </TouchableWithoutFeedback>
            </Modal>
        );
    }
}
