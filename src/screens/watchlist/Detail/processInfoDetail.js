import React, { Component } from 'react';
import { View } from 'react-native';
import { connect } from 'react-redux';
import ProgressBar from '../Component/Progressbar';
import I18n from '~/modules/language/';

export class ProcessInfoDetail extends Component {
    render() {
        const { quote = {} } = this.props.data || {};
        return (
            <View
                style={{
                    paddingTop: 16,
                    paddingHorizontal: 8,
                    paddingBottom: 4
                }}
            >
                <ProgressBar quote={quote} title={I18n.t('Days_Range')} />
                {/* <View style={{ height: 8 }} />
                <ProgressBar
                    quote={quote}
                    title={'52-' + I18n.t('Week_Range')}
                /> */}
            </View>
        );
    }
}

const mapStateToProps = (state, { symbol, exchange }) => {
    const { marketData } = state.streamMarket;
    const data =
        marketData && marketData[exchange] && marketData[exchange][symbol];
    return { data };
};

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(ProcessInfoDetail);
