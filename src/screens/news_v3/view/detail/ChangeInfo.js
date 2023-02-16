import React, { Component } from 'react'
// Redux
import { connect } from 'react-redux'
import { View, ScrollView, Text } from 'react-native'
import CommonStyle from '~/theme/theme_controller'
import ENUM from '~/enum'
import IonIcons from 'react-native-vector-icons/Ionicons'
import { formatNumberNew2 } from '~/lib/base/functionUtil'

const { TREND_VALUE, PRICE_DECIMAL } = ENUM

export class ChangeInfo extends Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    checkUpDown = this.checkUpDown.bind(this)
    checkUpDown(changePercent) {
        return changePercent > 0
            ? TREND_VALUE.UP
            : (changePercent === 0)
                ? TREND_VALUE.NONE
                : (!changePercent) ? TREND_VALUE.NULL : TREND_VALUE.DOWN
    }

    getStyleUpDown = this.getStyleUpDown.bind(this)
    getStyleUpDown(checkUpDown) {
        switch (checkUpDown) {
            case TREND_VALUE.UP:
                return {
                    color: CommonStyle.color.buy,
                    fontSize: CommonStyle.fontTiny,
                    fontFamily: CommonStyle.fontPoppinsRegular
                }
            case TREND_VALUE.DOWN:
                return {
                    color: CommonStyle.color.sell,
                    fontSize: CommonStyle.fontTiny,
                    fontFamily: CommonStyle.fontPoppinsRegular
                }
            default:
                // NORMAL
                return {
                    color: CommonStyle.fontColor,
                    fontSize: CommonStyle.fontTiny,
                    fontFamily: CommonStyle.fontPoppinsRegular
                }
        }
    }
    getIconUpDown = this.getIconUpDown.bind(this)
    getIconUpDown(checkUpDown) {
        switch (checkUpDown) {
            case TREND_VALUE.UP:
                return <CommonStyle.icons.arrowUp
                    color= {CommonStyle.fontGreen}
                    name="md-arrow-dropup"
                    style={[
                        CommonStyle.iconPickerUp,
                        {
                            color: CommonStyle.fontGreen,
                            marginRight: 2,
                            alignSelf: 'center'
                        }
                    ]}
                />
            case TREND_VALUE.DOWN:
                return <CommonStyle.icons.arrowDown
                    color={CommonStyle.fontRed}
                    name="md-arrow-dropdown"
                    style={[
                        CommonStyle.iconPickerDown,
                        {
                            color: CommonStyle.fontRed,
                            marginRight: 2,
                            alignSelf: 'center'
                        }
                    ]}
                />
            default:
                // NORMAL
                return null
        }
    }

    renderChangePercent = this.renderChangePercent.bind(this)
    renderChangePercent() {
        const { changePercent } = this.props.data
        const checkUpDown = this.checkUpDown(changePercent)
        const style = this.getStyleUpDown(checkUpDown)
        const icon = this.getIconUpDown(checkUpDown)
        return <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {icon}
            {/* // Trick vl */}
            <Text style={[style, { marginTop: 1 }]}>
                {`${formatNumberNew2(changePercent, PRICE_DECIMAL.PERCENT)}${checkUpDown === TREND_VALUE.NULL ? '' : '%'}`}
            </Text>
        </View>
    }

    render() {
        return this.renderChangePercent()
    }
}
const mapStateToProps = (state, ownProps) => ({
    data: state.newsIress.affectedSymbol[`${ownProps.exchange}#${ownProps.symbol}`] || {}
});
export default connect(mapStateToProps)(ChangeInfo)
