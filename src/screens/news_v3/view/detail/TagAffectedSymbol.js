import React, { Component } from 'react'
import { View, Text } from 'react-native'
import CommonStyle from '~/theme/theme_controller'
import ChangeInfo from './ChangeInfo'
import TouchableOpacityOpt from '~/component/touchableOpacityOpt/'
import * as Business from '~/business'
import { func as FuncStorage } from '~/storage'

export default class TagAffectedSymbol extends Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    renderDisplayName = this.renderDisplayName.bind(this)
    renderDisplayName() {
        const { symbol, exchange } = this.props
        const displayName = Business.getDisplayName({ symbol, exchange })
        return <Text style={{
            marginRight: 8,
            fontSize: CommonStyle.fontSizeXS1,
            fontFamily: CommonStyle.fontPoppinsBold,
            color: CommonStyle.color.turquoiseBlue
        }}>
            {displayName}
        </Text>
    }

    showSecDetail = this.showSecDetail.bind(this)
    showSecDetail() {
        const { symbol, exchange } = this.props
        this.props.onPressAffectedSymbol && this.props.onPressAffectedSymbol(symbol, exchange)
    }

    render() {
        const { symbol, exchange } = this.props
        return <TouchableOpacityOpt
            onPress={this.showSecDetail}
            style={{
                flexDirection: 'row',
                paddingHorizontal: 8,
                paddingTop: 2,
                justifyContent: 'space-between',
                marginRight: 8,
                borderRadius: 8,
                backgroundColor: CommonStyle.color.dark,
                borderWidth: 1,
                borderColor: CommonStyle.color.dusk_tabbar
            }}>
            {this.renderDisplayName()}
            <ChangeInfo symbol={symbol} exchange={exchange} data={{}} />
        </TouchableOpacityOpt>
    }
}
