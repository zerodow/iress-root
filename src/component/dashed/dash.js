import React, { Component } from 'react'
import {
    View, Text, TouchableOpacity, ViewPropTypes
} from 'react-native'
import PropTypes from 'prop-types'

// Component
import XComponent from '../xComponent/xComponent'

export default class Dash extends XComponent {
    static propTypes = {
        style: ViewPropTypes.style,
        dashGap: PropTypes.number.isRequired,
        dashLength: PropTypes.number.isRequired,
        dashThickness: PropTypes.number.isRequired,
        dashColor: PropTypes.string,
        dashStyle: ViewPropTypes.style,
        isRow: PropTypes.bool
    }

    static defaultProps = {
        dashGap: 2,
        dashLength: 4,
        dashThickness: 2,
        dashColor: 'black',
        isRow: true
    }

    constructor(props) {
        super(props)

        this.init()
        this.bindAllFunc()
    }

    init() {
        this.dic = {
            stylesStore: {},
            defaultStyle: {
                dashRow: {
                    flexDirection: 'row'
                },
                dashColumn: {
                    flexDirection: 'column'
                }
            }
        }
    }

    bindAllFunc() {

    }

    getDashStyleId({ dashGap, dashLength, dashThickness, dashColor }, isRow) {
        return `${dashGap}-${dashLength}-${dashThickness}-${dashColor}-${isRow ? 'row' : 'column'}`;
    }

    createDashStyleSheet({ dashGap, dashLength, dashThickness, dashColor }, isRow) {
        const style = {
            width: isRow ? dashLength : dashThickness,
            height: isRow ? dashThickness : dashLength,
            backgroundColor: dashColor
        }
        return style;
    };

    getDashStyle(props) {
        const isRow = this.props.isRow;
        const id = this.getDashStyleId(props, isRow);
        if (!this.dic.stylesStore[id]) {
            this.dic.stylesStore = {
                ...this.dic.stylesStore,
                [id]: this.createDashStyleSheet(props, isRow)
            };
        }
        return this.dic.stylesStore[id];
    };

    render() {
        const isRow = this.props.isRow
        const length = isRow ? this.props.width : this.props.height
        const n = Math.ceil((length + this.props.dashGap) / (this.props.dashGap + this.props.dashLength))
        const calculatedDashStyles = this.getDashStyle(this.props)
        const dash = []
        for (let i = 0; i < n; i++) {
            dash.push(
                <View
                    key={i * 2}
                    style={[
                        calculatedDashStyles,
                        this.props.dashStyle
                    ]}
                />
            )
            if (i < n - 1) {
                dash.push(
                    <View
                        key={i * 2 + 1}
                        style={{
                            height: isRow ? this.props.dashThickness : this.props.dashGap,
                            width: isRow ? this.props.dashGap : this.props.dashThickness
                        }}
                    />
                )
            }
        }

        return (
            <View
                onLayout={this.props.onLayout}
                style={[this.props.style, isRow ? this.dic.defaultStyle.dashRow : this.dic.defaultStyle.dashColumn]}
            >
                {dash}
            </View>
        )
    }
}
