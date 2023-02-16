import React, { Component } from 'react';
import { Text, View, StyleSheet, Dimensions, Animated } from 'react-native';
import CommonStyle, { register } from '~/theme/theme_controller'
import { Text as TextLoading, View as ViewLoading } from '~/component/loading_component'

const { width, height } = Dimensions.get('window')

function getDebugStyle(debug) {
    return debug ? styles.debugStyle : {};
}

class WrappedText extends Component {
    constructor(props) {
        super(props)

        this.state = {
            isSplitTag: false
        }
        this.timeoutSplitTag = null
        this.splitWhenStart = this.props.splitWhenStart || false
        this.dicLayout = {}
        this.listJSXTag = []
        this.listIndexSplit = []
        this.listTag = []
        this.lengthArrText = 0
        this.shouldUpdate = false
    }

    // shouldComponentUpdate() {
    //     return this.shouldUpdate
    // }

    setShouldComponentUpdate = this.setShouldComponentUpdate.bind(this)
    setShouldComponentUpdate(canUpdate) {
        this.shouldUpdate = canUpdate
        this.forceUpdate()
    }

    getWordSpace = this.getWordSpace.bind(this)
    getWordSpace(textLen, currentIndex) {
        return currentIndex !== textLen - 1 ? ' ' : '';
    }

    getArrText = this.getArrText.bind(this)
    getArrText(text) {
        const arrText = text.split(' ');
        this.lengthArrText = arrText.length
        console.log('DCM getArrText', this.lengthArrText, arrText)
        return arrText
    }

    onLayout = this.onLayout.bind(this)
    onLayout({ event, index, text, maxLength }) {
        const { layout } = event.nativeEvent
        this.addDicLayout({ layout, index, text, maxLength })
    }

    addDicLayout = this.addDicLayout.bind(this)
    addDicLayout({ layout = {}, index, text, maxLength }) {
        this.dicLayout[`i${index}`] = {
            ...layout,
            text,
            maxLength
        }
        console.log('DCM addDicLayout', this.dicLayout)
    }

    addListIndexSplit = this.addListIndexSplit.bind(this)
    addListIndexSplit({ curWidth, index }) {
        const maxWidth = width - (16 * 4)
        if (curWidth > maxWidth) {
            if (index === 0) {
                // Xuong dong tu index = 0 -> ko cat ma tiep tuc ghep
                this.splitWhenStart = true
            } else if (index > 0) {
                this.listIndexSplit.push(index)
            }
        }
        console.log('DCM this.listIndexSplit', this.listIndexSplit)
    }

    splitListText = this.splitListText.bind(this)
    splitListText() {
        const lastIndexListIndexSplit = this.listIndexSplit[this.listIndexSplit.length - 1]
        // Thêm nốt phần cuối của tag
        if (lastIndexListIndexSplit < this.lengthArrText) {
            this.listIndexSplit.push(this.lengthArrText)
        }
        // Nếu đủ diện tích hiển thị thì chạy từ đầu đến cuối
        if (!this.listIndexSplit.length && this.lengthArrText) {
            this.listIndexSplit.push(this.lengthArrText)
        }
        let listTextAfterSplit = []
        let lastIndex = 0
        this.listIndexSplit.map((item, index) => {
            let newText = ''
            for (let i = lastIndex; i < item; i++) {
                const key = `i${i}`
                newText += i === item - 1
                    ? `${this.dicLayout[key].text}`
                    : `${this.dicLayout[key].text} `
                console.log('DCM splitListText', i, item, newText)
            }
            listTextAfterSplit.push(newText)
            lastIndex = item
        })
        console.log('DCM listTextAfterSplit', listTextAfterSplit)
        this.splitListTag(listTextAfterSplit)
    }

    splitListTag = this.splitListTag.bind(this)
    splitListTag(listTextAfterSplit) {
        if (!listTextAfterSplit) return null
        console.log('DCM listTextAfterSplit', listTextAfterSplit)
        listTextAfterSplit.map((item, index) => {
            this.listJSXTag.push(
                <View style={{
                    height: 24,
                    backgroundColor: CommonStyle.colorTag1,
                    borderTopLeftRadius: index === 0
                        ? 8
                        : 0,
                    borderTopRightRadius: index < listTextAfterSplit.length - 1
                        ? 0
                        : 8,
                    borderBottomLeftRadius: index === 0
                        ? 8
                        : 0,
                    borderBottomRightRadius: index < listTextAfterSplit.length - 1
                        ? 0
                        : 8,
                    paddingVertical: 4,
                    paddingHorizontal: 8,
                    marginBottom: 8,
                    marginLeft: index === 0 && !this.splitWhenStart
                        ? 8
                        : 0,
                    marginRight: index === listTextAfterSplit.length - 1
                        ? 8
                        : 0
                }}>
                    <Text style={{
                        fontFamily: CommonStyle.fontPoppinsRegular,
                        color: CommonStyle.fontWhite,
                        fontSize: CommonStyle.fontSizeXS
                    }}>{item}</Text>
                </View>
            )
        })
        this.setState({
            isSplitTag: true
        })
    }

    splitTag = this.splitTag.bind(this)
    splitTag() {
        try {
            const maxWidth = width - (16 * 4)
            const firstIndex = `i0`
            const firstPosition = this.dicLayout[firstIndex].x
            // let curWidth = firstPosition + 16 + 8 + 8 + 8
            let curWidth = firstPosition + 16 + 8 + 8
            if (firstPosition === 0) {
                this.splitWhenStart = true
            }
            for (let i = 0; i < this.lengthArrText; i++) {
                const index = `i${i}`
                const widthText = this.dicLayout[index].width
                curWidth += widthText
                this.addListIndexSplit({ curWidth, index: i })
                if (curWidth > maxWidth) {
                    // Break line, padding 8
                    curWidth = 0 + 8 + 8
                }
            }
            this.splitListText()
        } catch (error) {
            console.log('WRAPTEXT splitTag exception', error)
        }
    }

    componentDidMount() {
        this.timeoutSplitTag && clearTimeout(this.timeoutSplitTag)
        this.timeoutSplitTag = setTimeout(() => {
            // Tính toán và sắp xếp lại tag
            this.splitTag()
        }, 1000)
    }

    componentWillUnmount() {
        this.timeoutSplitTag && clearTimeout(this.timeoutSplitTag)
    }

    renderWrappedText = this.renderWrappedText.bind(this)
    renderWrappedText(text) {
        const { containerStyle, rowWrapperStyle, textStyle, debug = false } = this.props
        const arrText = this.getArrText(text)
        const onLayout = this.onLayout
        const getWordSpace = this.getWordSpace
        if (this.state.isSplitTag) {
            return <React.Fragment>
                {
                    this.listJSXTag.map((item) => {
                        return item
                    })
                }
            </React.Fragment>
        }
        return (
            <React.Fragment>
                {
                    arrText.map((colText, colIndex) => {
                        const text = colText + this.getWordSpace(arrText.length, colIndex)
                        // const text = colText
                        return (
                            (colText !== '' ||
                                (arrText.length === 1 &&
                                    colText === '')) && (
                                <Text
                                    key={colText + '-' + colIndex}
                                    style={[
                                        {
                                            opacity: 0,
                                            fontFamily: CommonStyle.fontPoppinsRegular,
                                            color: CommonStyle.fontWhite,
                                            fontSize: CommonStyle.fontSizeXS
                                        }
                                    ]}
                                    onLayout={event => {
                                        onLayout({
                                            event,
                                            index: colIndex,
                                            text: colText,
                                            maxLength: arrText.length
                                        })
                                    }}
                                >
                                    {text}
                                </Text>
                            )
                        );
                    })
                }
            </React.Fragment>
        );
    }

    render() {
        const { children } = this.props
        if (!children) {
            return null
        }

        if (typeof children === 'string') {
            return this.renderWrappedText(children);
        }

        if (Array.isArray(children)) {
            return children.map(function (child) {
                if (typeof child === 'string') {
                    return this.renderWrappedText(child);
                } else {
                    return child;
                }
            });
        }
        return children;
    }
}
var styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        alignSelf: 'center',
        width: '100%'
    },
    rowWrapper: {
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    debugStyle: {
        borderWidth: 0.5,
        borderColor: 'rgba(255,60,60,0.7)'
    }
});
export default WrappedText
