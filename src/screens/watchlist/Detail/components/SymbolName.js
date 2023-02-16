import React, { Component } from 'react'
import { Text } from 'react-native'

import CommonStyle from '~/theme/theme_controller';
import { func } from '~/storage';
import { getSymbolName } from '~/business'

export default class SymbolName extends Component {
    render() {
        const { symbol } = this.props
        const isHalt = func.getHaltSymbol(symbol);
        const symbolName = getSymbolName({ symbol })
        return (
            <React.Fragment>
                <Text
                    style={[
                        CommonStyle.textMainRed,
                        {
                            fontSize: CommonStyle.fontSizeL,
                            fontFamily: CommonStyle.fontPoppinsBold
                        }
                    ]}
                >
                    {isHalt ? '! ' : ''}
                </Text>
                <Text
                    testID={`${symbol}HeaderWL`}
                    style={{
                        fontFamily: 'HelveticaNeue-Bold',
                        fontSize: CommonStyle.fontSizeL,
                        color: CommonStyle.fontColor
                    }}
                >
                    {symbolName}
                </Text>
            </React.Fragment>
        );
    }
}
