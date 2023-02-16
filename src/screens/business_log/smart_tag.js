import React, { PureComponent } from 'react'
import { View, Text } from 'react-native'
import CommonStyle, { register } from '~/theme/theme_controller'

export default class SmartTag extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {}
        this.defaultStyle = {
            textHighLight: {
                fontSize: CommonStyle.fontSizeXS,
                fontFamily: CommonStyle.fontPoppinsRegular,
                color: CommonStyle.fontWhite
            },
            viewTextHighLight: {
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 8
            },
            tag: {
                height: 24,
                backgroundColor: CommonStyle.colorTag1,
                fontSize: CommonStyle.fontSizeXS,
                fontFamily: CommonStyle.fontPoppinsRegular,
                color: CommonStyle.fontWhite,
                justifyContent: 'center',
                marginTop: 8
            }
        }
    }

    getTagArr = this.getTagArr.bind(this)
    getTagArr() {
        const { tag: tagStyle } = this.defaultStyle
        let tagArr = []
        const { originText } = this.props
        const arrText = originText.split(' ')
        for (let i = 0; i < arrText.length; i++) {
            const tag = <Text style={[
                tagStyle,
                i === 0
                    ? { paddingLeft: 8 }
                    : i === arrText.length - 1
                        ? { paddingRight: 8 }
                        : {}]}>{arrText[i]}</Text>
            tagArr.push(tag)
        }
        return tagArr
    }

    render() {
        const tagArr = this.getTagArr()
        const { textHighLight, viewTextHighLight } = this.defaultStyle
        return <Text style={{ flexWrap: 'wrap', flexDirection: 'row' }}>
            {tagArr}
        </Text>
    }
}
