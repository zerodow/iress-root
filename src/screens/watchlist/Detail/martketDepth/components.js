import React from 'react'
import { View, Text } from 'react-native'

import CommonStyle from '~/theme/theme_controller';

const Grid = props => {
    const result = [];
    React.Children.forEach(props.children, (child, index) => {
        const content = React.cloneElement(child);
        if (index === 0) {
            result.push(
                <View style={{ flex: 1, alignItems: 'flex-start' }}>
                    {content}
                </View>
            );
        }
        if (index === 1) {
            result.push(
                <View style={{ flex: 1, alignItems: 'center' }}>{content}</View>
            );
        }
        if (index === 2) {
            result.push(
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    {content}
                </View>
            );
        }
        if (index === 3) {
            result.push(
                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    {content}
                </View>
            );
        }
    });
    return <View style={{ flex: 1, flexDirection: 'row' }}>{result}</View>;
};

const HeaderText = props => (
    <Text
        style={{
            fontFamily: CommonStyle.fontPoppinsRegular,
            fontSize: CommonStyle.fontSizeXS,
            color: CommonStyle.fontWhite,
            opacity: 0.4
        }}
    >
        {props.children}
    </Text>
);

const NoText = props => (
    <Text
        style={{
            fontFamily: CommonStyle.fontPoppinsRegular,
            fontSize: CommonStyle.fontSizeS,
            color: CommonStyle.fontWhite,
            opacity: 0.4
        }}
    >
        {props.children}
    </Text>
);

const QuantityText = props => (
    <Text
        style={{
            fontFamily: CommonStyle.fontPoppinsRegular,
            fontSize: CommonStyle.fontSizeS,
            color: CommonStyle.fontWhite
        }}
    >
        {props.children}
    </Text>
);

const PriceText = props => (
    <Text
        style={{
            fontFamily: CommonStyle.fontPoppinsRegular,
            fontSize: CommonStyle.fontSizeS,
            color: props.isAsk ? CommonStyle.fontRed1 : CommonStyle.fontGreen1
        }}
    >
        {props.children}
    </Text>
);

const ItemSeparator = () => <View style={{ width: 24 }} />;

export {
    Grid,
    HeaderText,
    NoText,
    QuantityText,
    PriceText,
    ItemSeparator
}
