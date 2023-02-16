import React, { Component } from 'react';
import {
    Keyboard,
    AppRegistry,
    StyleSheet,
    Image,
    View, TouchableOpacity,
    UIManager,
    TextInput,
    Text,
    Dimensions,
    ScrollView,
    Platform, Animated, ActivityIndicator
} from 'react-native';
import CommonStyle, { register } from '~/theme/theme_controller'
import Ionicons from 'react-native-vector-icons/Ionicons'
const { State: TextInputState } = TextInput;

export default class ButtonC2R extends Component {
    constructor(props) {
        super(props)
        this.state = {
            width: 0,
            height: 0,
            isLoading: this.props.isLoading || false
        };
    }
    componentDidMount() {
    }
    handleC2R = () => {
        this.props.onC2R && this.props.onC2R()
    }
    render() {
        const { isLoading } = this.props
        return (
            <View style={{}}>
                <View
                    style={{
                        alignSelf: 'center'
                    }}>
                    <TouchableOpacity style={{ alignSelf: 'flex-start' }}>
                        <ActivityIndicator onLayout={(e) => {
                            const { width, height } = e.nativeEvent.layout
                            this.setState({
                                width, height
                            })
                        }} style={{ alignSelf: 'baseline', opacity: isLoading ? 1 : 0, width: 30, height: 30 }} />
                        <TouchableOpacity onPress={this.handleC2R} style={{ height: this.state.height, width: this.state.width, position: 'absolute' }}>
                            <Ionicons color={CommonStyle.fontWhite} style={{ opacity: isLoading ? 0 : 1, alignSelf: 'center' }} size={24} name={'md-refresh'} />
                        </TouchableOpacity>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
}
