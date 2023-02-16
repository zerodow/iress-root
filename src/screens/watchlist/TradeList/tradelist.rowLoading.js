import React, { Component } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import _ from 'lodash';

import * as Business from '~/business';
import I18n from '~/modules/language/';
import CommonStyle, { register } from '~/theme/theme_controller';
import * as PureFunc from '~/utils/pure_func'

import CompanyName from '../Component/CompanyName';
import DisplayName from '../Component/DisplayName';

import { HEIGHT_ROW } from './tradeList.row';

import ProgressBar from '../Component/Progressbar';

const { width: WIDTH_DEVICE } = Dimensions.get('window');

export const ViewLoading = (props) => (
    <View
        style={[
            {
                width: 50,
                height: 24,
                borderRadius: 4,
                backgroundColor: '#ffffff30'
            },
            props.style
        ]}
    />
);

export default class RowLoading extends Component {
    shouldComponentUpdate(nextProps) {
        return !_.isEqual(this.props, nextProps);
    }
    render() {
        const { symbol, exchange } = this.props;

        let content1 = <ViewLoading style={{ marginRight: 8 }} />;
        let content2 = (
            <ViewLoading style={{ width: 100, height: 20, marginTop: 8 }} />
        );

        if (symbol && exchange) {
            const symbolName = Business.getDisplayName({ symbol, exchange });
            const companyName = Business.getCompanyName({ symbol, exchange });
            content1 = <DisplayName title={symbolName} />;
            content2 = <CompanyName value={companyName} />;
        }

        return (
            <View style={styles.container} key={symbol}>
                <View style={{ width: '100%' }}>
                    <View style={{ flexDirection: 'row' }}>
                        <View
                            style={{
                                flex: 1
                            }}
                        >
                            <View
                                style={{
                                    alignItems: 'center',
                                    flexDirection: 'row'
                                }}
                            >
                                {content1}
                                <ViewLoading style={{ height: 20 }} />
                            </View>
                            {content2}
                        </View>

                        <ViewLoading style={{ height: 33.5, width: 80 }} />
                    </View>
                    <ProgressBar
                        quote={{}}
                        title={I18n.t('Days_Range')}
                        isLoading
                    />
                </View>
            </View>
        );
    }
}

const widthRow = WIDTH_DEVICE - 8 * 2;

export const styles = {}
function getNewestStyle() {
	const newStyle = StyleSheet.create({
        absContainer: {
            position: 'absolute',
            width: '100%',
            height: '100%',
            overflow: 'visible'
        },
        list: {
            position: 'absolute',
            width: '100%',
            top: 0
        },
        container: {
            width: widthRow,
            height: HEIGHT_ROW,
            marginHorizontal: 8,
            paddingVertical: 12,
            flexDirection: 'row',
            paddingHorizontal: 16,
            borderRadius: 8,
            backgroundColor: CommonStyle.navigatorSpecial.navBarBackgroundColor2
        },
        space: {
            height: '100%',
            width: 80,
            marginHorizontal: 16
        },
        content: {
            height: '100%',
            width: 70,
            alignItems: 'flex-end'
        }
    });
	PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)
