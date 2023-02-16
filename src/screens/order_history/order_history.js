import React, { PropTypes, Component } from 'react';
import {
    FlatList,
    Text,
    View,
    PixelRatio
} from 'react-native';
import Accordion from 'react-native-collapsible/Accordion';
import HighLightText from '../../modules/_global/HighLightText';
import styles from './style/order_history';
import { roundFloat } from '../../lib/base/functionUtil';
import ButtonBox from '../../modules/_global/ButtonBox';
import { func, dataStorage } from '../../storage';
import moment from 'moment';
import I18n from '../../modules/language/';
import { iconsMap } from '../../utils/AppIcons';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as orderHistoryActions from './order_history.actions';
import config from '../../config';
import performanceEnum from '../../constants/performance';
import Perf from '../../lib/base/performance_monitor';

export class OrderHistory extends Component {
    constructor(props) {
        super(props);
                this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
        this.perf = new Perf(performanceEnum.show_order_history)
    }

    onNavigatorEvent(event) {
        if (event.type === 'NavBarButtonPress') {

        } else {
            switch (event.id) {
                case 'willAppear':
                    this.props.actions.loadForm(this.props.order_id);
                    break;
                case 'didAppear':
                    break;
                case 'willDisappear':
                    break;
                case 'didDisappear':
                    break;
                default:
                    break;
            }
        }
    }

    renderContent() {
        return null;
    }
    renderHeaderRow(data) {
        let timeUpdate;
        if (data.updated) timeUpdate = moment(data.updated).format('MM/DD/YYYY hh:mm:ss');
        return (
            <View style={styles.rowContainer}>
                <View ><Text style={[styles.textRowFirst]}>{data.description}</Text></View>
                <View style={[styles.wrapperText]}>
                    <Text style={[styles.textLeft, styles.textRowSecond]}>{`${I18n.t('actor', { locale: this.props.setting.lang })}: ${data.actor_display}`}</Text>
                    <Text style={[styles.textRight, styles.textRowSecond]}>{timeUpdate}</Text>
                </View>
            </View>
        );
    }

    keyExtractor(item, index) {
        return item.order_history_id;
    }

    renderItem({ item }) {
        return this.renderHeaderRow(item);
    }

    render() {
        return (
            <FlatList
                keyExtractor={this.keyExtractor.bind(this)}
                data={this.props.order_history.listData}
                renderItem={this.renderItem.bind(this)}
            />
        );
    }
}
function mapStateToProps(state, ownProps) {
    return {
        order_history: state.orderHistory,
        setting: state.setting
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(orderHistoryActions, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(OrderHistory);
