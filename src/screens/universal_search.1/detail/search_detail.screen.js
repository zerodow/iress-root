// Default import
import React, { PureComponent } from 'react';
import _ from 'lodash';
import { View, Platform } from 'react-native';
import { connect } from 'react-redux';

// Reducer actions
import searchDetailActions from './search_detail.reducer';
// Func
import * as Controller from '~/memory/controller';
import I18n from '~/modules/language';
import ScreenId from '~/constants/screen_id';
import analyticsEnum from '~/constants/analytics';
import userType from '~/constants/user_type';
import { func, dataStorage } from '~/storage';
import { refreshButton } from '~/navigation/navBarButton';
import { setCurrentScreen } from '~/lib/base/analytics';

// Comp
import NetworkWarning from '~/component/network_warning/network_warning.1';
import Warning from '~/component/warning/warning';
import deviceModel from '~/constants/device_model';
import SearchDetailView from './search_detail.view';
import CommonStyle, { register } from '~/theme/theme_controller';

export class SearchDetail extends PureComponent {
    constructor(props) {
        super(props);
        this.typeForm = ScreenId.UNIVERSAL_SEARCH;
        this.heightStatusBar = 0;
        if (Platform.OS === 'android') {
            this.heightStatusBar = 0;
        }
        this.props.navigator.addOnNavigatorEvent(
            this.onNavigatorEvent.bind(this)
        );

        this.setRightButton(true);
    }

    componentWillReceiveProps(nextProps) {
        const { isLoading } = nextProps;
        // // if loaded all child => ...
        if (isLoading !== this.props.isLoading) {
            this.setRightButton(isLoading);
        }
    }

    resetTitle() {
        this.props.navigator.setTitle({
            title: I18n.t('search', { locale: this.props.lang })
        });
    }

    setRightButton(isRefresh) {
        if (dataStorage.currentScreenId !== this.typeForm) return;
        const ref = refreshButton(isRefresh);
        const isStreaming = Controller.isPriceStreaming();

        this.props.navigator.setButtons({
            rightButtons: isStreaming ? [] : ref
        });
    }

    onNavigatorEvent(event) {
        const { navigator, symbol } = this.props;
        switch (event.id) {
            case 'back_button':
                navigator.pop({
                    animated: true,
                    animationType: 'slide-horizontal'
                });
                break;
            case 'didAppear':
                setCurrentScreen(analyticsEnum.universalSearchDetail);
                func.setCurrentScreenId(this.typeForm);
                if (dataStorage.backNewsDetail) {
                    dataStorage.backNewsDetail = false;
                }
                this.resetTitle();
                break;
            default:
                break;
        }
    }

    renderDelayWarning() {
        if (func.getUserPriceSource() === userType.Delay) {
            return <Warning warningText={I18n.t('delayWarning')} isConnected />;
        }
        return <View />;
    }

    render() {
        return (
            <React.Fragment>
                <NetworkWarning />
                {this.renderDelayWarning()}
                <View
                    style={{
                        height: this.heightStatusBar,
                        backgroundColor: CommonStyle.backgroundColor
                    }}
                />
                <SearchDetailView {...this.props} />
            </React.Fragment>
        );
    }
}

function mapStateToProps(state) {
    return {
        isLoading: state.searchDetail.isLoading,
        lang: state.setting.lang
    };
}

export default connect(mapStateToProps, null, null, { forwardRef: true })(
    SearchDetail
);
