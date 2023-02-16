import React, { PureComponent } from 'react';
import { View } from 'react-native';

import CommonStyle from '~/theme/theme_controller';
import { HEIGHT_FOOTER, HEIGHT_SEPERATOR } from '~s/watchlist/enum';

export default class TradeListBase extends PureComponent {
    setHeaderRef = this.setHeaderRef.bind(this);
    setHeaderRef(sef) {
        if (sef) {
            this._headerRef = sef;
        }
    }

    renderSeparator() {
        return <View style={{ height: HEIGHT_SEPERATOR }} />;
    }
    renderSeparatorHeader() {
        return (
            <View
                style={{
                    paddingHorizontal: 16,
                    height: 1,
                    backgroundColor: CommonStyle.fontBorderGray
                }}
            />
        );
    }

    setKeyExtractor = this.setKeyExtractor.bind(this);
    setKeyExtractor(item) {
        return item;
    }

    setRefNested = this.setRefNested.bind(this);
    setRefNested(sef) {
        this._nested = sef;
    }

    setRefHandleData = this.setRefHandleData.bind(this);
    setRefHandleData(sef) {
        if (sef) {
            this.onRefreshData = sef.getSnapshot;
        }
    }

    setRef = this.setRef.bind(this);
    setRef(sef) {
        this._list = sef;
    }

    renderFooter() {
        return (
            <View
                style={{
                    height: HEIGHT_FOOTER
                }}
            />
        );
    }

    render() {
        return null;
    }
}
