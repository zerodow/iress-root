import React from 'react';
import { View, Text } from 'react-native';

import CommonStyle from '~/theme/theme_controller';

const Grid = ({ isLeft, children }) => {
    const result = [];
    if (isLeft) {
        React.Children.forEach(children, (child, index) => {
            const content = React.cloneElement(child);
            if (index === 0) {
                result.push(
                    <View
                        style={{
                            width: 34,
                            paddingRight: 8,
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        {content}
                    </View>
                );
            }
            if (index === 1) {
                result.push(
                    <View style={{ justifyContent: 'center' }}>{content}</View>
                );
            }
            if (index === 2) {
                result.push(
                    <View
                        style={{
                            flex: 1,
                            alignItems: 'flex-end',
                            justifyContent: 'center'
                        }}
                    >
                        {content}
                    </View>
                );
            }
        });
    } else {
        React.Children.forEach(children, (child, index) => {
            const content = React.cloneElement(child);
            if (index === 0) {
                result.push(
                    <View
                        style={{
                            flex: 1,
                            alignItems: 'flex-start',
                            justifyContent: 'center'
                        }}
                    >
                        {content}
                    </View>
                );
            }
            if (index === 1) {
                result.push(
                    <View style={{ justifyContent: 'center' }}>{content}</View>
                );
            }
            if (index === 2) {
                result.push(
                    <View
                        style={{
                            width: 34,
                            paddingLeft: 8,
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        {content}
                    </View>
                );
                // result.push(content);
            }
        });
    }
    return <View style={{ flex: 1, flexDirection: 'row' }}>{result}</View>;
};

const HeaderText = (props) => (
    <Text
        style={{
            fontFamily: CommonStyle.fontPoppinsRegular,
            fontSize: CommonStyle.fontSizeXS,
            color: CommonStyle.fontWhite,
            opacity: 0.7
        }}
    >
        {props.children}
    </Text>
);

const NoText = (props) => (
    <View
        style={{
            width: '100%',
            borderWidth: 1,
            borderRadius: 8,
            borderColor: CommonStyle.fontNearLight7
        }}
    >
        <Text
            style={{
                fontFamily: CommonStyle.fontPoppinsRegular,
                fontSize: CommonStyle.fontTiny,
                color: CommonStyle.fontWhite,
                opacity: 0.4,
                textAlign: 'center'
            }}
        >
            {props.children}
        </Text>
    </View>
);

const QuantityText = (props) => (
    <Text
        style={{
            fontFamily: CommonStyle.fontPoppinsRegular,
            fontSize: CommonStyle.font11,
            color: CommonStyle.fontWhite
        }}
    >
        {props.children}
    </Text>
);

const PriceText = (props) => (
    <Text
        style={{
            fontFamily: CommonStyle.fontPoppinsRegular,
            fontSize: CommonStyle.font13,
            color: props.isAsk ? CommonStyle.fontRed1 : CommonStyle.fontGreen1
        }}
    >
        {props.children}
    </Text>
);

const ItemSeparator = () => <View style={{ width: 24 }} />;

export { Grid, HeaderText, NoText, QuantityText, PriceText, ItemSeparator };
