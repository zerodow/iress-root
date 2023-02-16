import React, { Component } from 'react'
import {
    Modal, View, Text, TouchableOpacity, Platform, ScrollView, FlatList, Dimensions, TouchableWithoutFeedback
} from 'react-native'
import { Item } from 'native-base';
import RowItem from '../src/screens/setting/RowItem'
import CommonStyle, { register } from '~/theme/theme_controller'

const { height } = Dimensions.get('window')
export default class NewModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isShowModal: this.props.isShowModal
        }
    }
    onPress = (value) => {
        this.props.closeModal()
        this.props.onSelect && this.props.onSelect(value)
    }
    render() {
        if (this.props.isShowModal === false) return null
        else {
            return <TouchableWithoutFeedback onPress={this.props.closeModal}>
                <View style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: CommonStyle.backgroundColorPopup }
                }>
                    <View
                        style={[{
                            position: 'absolute',
                            top: this.props.topModal,
                            right: 16,
                            paddingHorizontal: 16,
                            backgroundColor: CommonStyle.fontColorSwitchTrue,
                            borderRadius: 8
                        }, this.props.style]}
                    >
                        {this.props.data.map((item, index) => {
                            if (index === this.props.data.length - 1) {
                                return <RowItem
                                    key={item}
                                    title={item.title}
                                    onPress={this.onPress}
                                    selected={item.title === this.props.selectedValue}
                                    value={item.value}
                                />
                            } else {
                                return <View>
                                    <RowItem
                                        key={item}
                                        title={item.title}
                                        value={item.value}
                                        onPress={this.onPress}
                                        selected={item.title === this.props.selectedValue}
                                    />
                                    <View style={{ height: 1, backgroundColor: CommonStyle.fontWhite, paddingHorizontal: 16, opacity: 0.05 }} />
                                </View>
                            }
                        })}
                    </View>
                </View>
            </TouchableWithoutFeedback >
        }
    }
}
