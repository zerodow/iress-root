import React, { PureComponent } from 'react';
import { View } from 'react-native';

export default class Row extends PureComponent {
    render() {
        let item0 = null;
        let item1 = null;
        let item2 = null;
        let item3 = null;

        React.Children.forEach(this.props.children, (child, index) => {
            const content = React.cloneElement(child);
            if (index === 0) {
                item0 = (
                    <View style={{ flex: 1, alignItems: 'flex-start' }}>
                        {content}
                    </View>
                );
            }
            if (index === 1) {
                item1 = (
                    <View style={{ flex: 1, alignItems: 'center' }}>
                        {content}
                    </View>
                );
            }
            if (index === 2) {
                item2 = (
                    <View style={{ flex: 1, alignItems: 'center' }}>
                        {content}
                    </View>
                );
            }
            if (index === 3) {
                item3 = (
                    <View style={{ flex: 1, alignItems: 'flex-end' }}>
                        {content}
                    </View>
                );
            }
        });
        return (
            <View
                style={{
                    flexDirection: 'row',
                    padding: 8
                }}
            >
                {item0}
                {item1}
                {item2}
                {item3}
            </View>
        );
    }
}
