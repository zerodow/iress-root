import React from 'react';

import { checkParent } from '~/lib/base/functionUtil';
import { func } from '~/storage';
import Icon from './CustomIcon';
import BaseResultSearch, {
    RowSearchByMasterCodeV2 as BaseRow
} from '~s/alert_function/components/SearchBar/Result';

class Row extends BaseRow {
    _header(data) {
        const result = super._header(data);
        const detail = func.getSymbolObj(data.symbol) || {};
        let section = data;
        section = { ...data, ...detail };

        const isParent = checkParent(section);
        if (isParent) return result;

        const children = React.Children.toArray(result.props.children);

        return React.cloneElement(result, {
            children: [
                <Icon
                    symbol={data && data.symbol}
                    exchange={data && data.exchanges && data.exchanges[0]}
                />,
                ...children
            ]
        });
    }

    _headerChildren(data, index) {
        const result = super._headerChildren(data, index);
        const children = React.Children.toArray(result.props.children);

        return React.cloneElement(result, {
            children: [
                <Icon
                    symbol={data && data.symbol}
                    exchange={data && data.exchanges && data.exchanges[0]}
                />,
                ...children
            ]
        });
    }
}

export default class ResultSearch extends BaseResultSearch {
    renderItem({ item, index }) {
        const result = super.renderItem({ item, index });
        if (this.props.isFromWatchList) return result;
        return React.createElement(Row, result.props);
    }
}
