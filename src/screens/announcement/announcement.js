import React, { PropTypes, Component } from 'react';
import {
    Alert,
    Text,
    TouchableOpacity,
    View,
    PixelRatio
} from 'react-native';
import firebase from '../../firebase';
import moment from 'moment';
import timeagoInstance from '../../lib/base/time_ago';
import styles from '../trade/style/trade';
import I18n from '../../modules/language/';
import { iconsMap } from '../../utils/AppIcons';
import config from '../../config';
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import performanceEnum from '../../constants/performance';
import Perf from '../../lib/base/performance_monitor';
import { dataStorage } from '../../storage'

class Announcement extends Component {
    constructor(props) {
        super(props);
                this.state = {
            announcements: []
        };
        this.perf = new Perf(performanceEnum.show_annoucement);
    }

    componentWillMount() {
        this.perf && this.perf.incrementCounter(performanceEnum.show_annoucement);
    }

    componentDidMount() {
        this.setState({ announcements: [] });
        this.perf = new Perf(performanceEnum.load_data_annoucement);
        this.perf && this.perf.start();
    }

    dataAnnouncementCallback(data) {
        const listData = [...this.state.announcements, data.val()];
        this.setState({ announcements: listData }, () => {
            this.perf && this.perf.stop();
        });
    }

    componentWillUnmount() {
    }

    showFormNew() {
        this.props.navigator.push({
            screen: 'equix.News',
            title: I18n.t('News'),
            backButtonTitle: '',
            navigatorButtons: {
                rightButtons: [
                    {
                        title: I18n.t('done'),
                        id: 'done',
                        icon: iconsMap['md-checkmark']
                    },
                    {
                        title: I18n.t('search'),
                        id: 'search',
                        icon: iconsMap['md-search']
                    }
                ]
            },
            navigatorStyle: {
                statusBarColor: CommonStyle.statusBarBgColor,
                statusBarTextColorScheme: 'light',
                navBarBackgroundColor: CommonStyle.statusBarBgColor,
                navBarTextColor: config.color.textColor,
                navBarTextFontSize: 18,
                drawUnderNavBar: true,
                navBarHideOnScroll: false,
                navBarButtonColor: 'white',
                navBarNoBorder: true,
                navBarSubtitleColor: 'white',
                navBarSubtitleFontFamily: 'HelveticaNeue'
            }
        });
    }
    renderRow(data, i) {
        return (
            <View style={styles.rowExpand} key={i}>
                <Text style={[CommonStyle.textSubBlack, { width: '70%' }]}>{data.title}</Text>
                <Text style={[CommonStyle.textSub, { textAlign: 'right', width: '30%' }]}>{timeagoInstance.format(data.updated, 'qe_local')}</Text>
            </View>
        );
    }
    render() {
        return (
            <View style={{ height: 80 }}>
                {
                    this.state.announcements.map((e, i) => this.renderRow(e, i))
                }

                <View style={{ width: '40%', paddingHorizontal: 16, paddingBottom: 16, paddingTop: 4 }}>
                    <TouchableOpacity onPress={() => {
                        this.showFormNew();
                    }}>
                        <Text style={{ color: CommonStyle.fontViolet }}>{I18n.t('getMore')}</Text>
                    </TouchableOpacity>
                </View>

            </View>
        );
    }
}

export default Announcement;
