import React, { Component } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'

export class HeaderSlide extends Component {
    constructor(props) {
        super(props);
        this.props = props;
    }
    render() {
        const { title } = this.props;
        return (
            <TouchableOpacity
                style={{
                    backgroundColor: CommonStyle.backgroundColor,
                    height: 48,
                    justifyContent: 'center',
                    borderBottomColor: 'rgba(0, 0, 0, 0.12)',
                    borderBottomWidth: 1,
                    marginHorizontal: 16
                }}
                onPress={() => {
                    this.props.onPressAction && this.props.onPressAction()
                }}
            >
                <Text style={CommonStyle.textMain}>{title.toUpperCase()}</Text>
            </TouchableOpacity>
        );
    }
}
export default HeaderSlide;
