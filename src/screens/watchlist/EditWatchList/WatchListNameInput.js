import React, { Component } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { connect } from 'react-redux';
import _ from 'lodash';

import CommonStyle from '~/theme/theme_controller';
import { func, dataStorage } from '~/storage';
import NotifyOrder from '~/component/notify_order/index';
import HighlightInput from '~/component/highlight_input/highlight_input';
import * as Business from '~/business';
import I18n from '~/modules/language';
import ENUM from '~/enum';

const { width: WIDTH_SCREEN } = Dimensions.get('window');
const { TYPE_PRICEBOARD } = ENUM;

export class WatchListNameInput extends Component {
    constructor(props) {
        super(props);
        this.styleInput = {
            textAlign: 'center',
            paddingTop: 8,
            paddingBottom: 16,
            paddingHorizontal: 8,
            width: WIDTH_SCREEN - 16,
            fontSize: CommonStyle.fontSizeL,
            fontFamily: CommonStyle.fontPoppinsRegular
        };

        const {
            listPriceBoard,
            priceBoardSelected,
            typePriceBoard
        } = this.props;

        const { watchlist_name: WLName } =
            listPriceBoard[priceBoardSelected] || {};
        this.originalWLName = WLName;

        this.state = {
            errorInputPriceName: '',
            newPriceBoardName: WLName || ''
        };

        this.onChangeText = this.onChangeText.bind(this);
        this.onBlur = this.onBlur.bind(this);

        this.listName = {};
        this.storePriceBoardName();
    }

    setOriginalWLName = this.setOriginalWLName.bind(this);
    setOriginalWLName(originalWLName) {
        this.originalWLName = originalWLName;
    }

    returnOriginalWLName = this.returnOriginalWLName.bind(this);
    returnOriginalWLName() {
        return this.setState({
            errorInputPriceName: I18n.t('watchlistRequiredWarning'),
            newPriceBoardName: this.originalWLName
        });
    }

    storePriceBoardName() {
        const { listPriceBoard } = this.props;
        _.forEach(listPriceBoard, ({ watchlist_name: name }) => {
            const upperName = _.upperCase(name);
            this.listName[upperName] = true;
        });
    }

    checkDup(newText) {
        const { listPriceBoard, priceBoardSelected } = this.props;
        const { watchlist: priceBoardId } =
            listPriceBoard[priceBoardSelected] || {};

        return _.find(
            listPriceBoard,
            ({ watchlist_name: WLName = '', watchlist }) =>
                WLName && WLName.toUpperCase() === newText.toUpperCase() &&
                watchlist !== priceBoardId
        );
    }

    onChangeText(text) {
        const newText = text;
        if (!newText) {
            return this.setState({
                newPriceBoardName: '',
                errorInputPriceName: I18n.t('watchlistRequiredWarning')
            });
        }

        const isDup = this.checkDup(newText);
        if (isDup) {
            return this.setState({
                newPriceBoardName: newText,
                errorInputPriceName: I18n.t('watchlistUniqueWarning')
            });
        }

        this.setState({
            errorInputPriceName: '',
            newPriceBoardName: newText
        });
    }
    onBlur() {
        // WATCHLIST NAME IS NULL
        const formattedPriceBoardName = this.state.newPriceBoardName.trim();
        if (formattedPriceBoardName === '') {
            return this.returnOriginalWLName();
        }
        // WATCHLIST NAME NOT NULL
        const { listPriceBoard, priceBoardSelected } = this.props;
        const { watchlist: priceBoardId } =
            listPriceBoard[priceBoardSelected] || {};
        this.state.errorInputPriceName !== I18n.t('watchlistUniqueWarning') &&
            Business.pushUpdatePriceboardName(
                priceBoardId,
                dataStorage.user_id,
                this.state.newPriceBoardName.trim()
            );
        this.setOriginalWLName(formattedPriceBoardName);
        this.setState({
            errorInputPriceName: ''
        });
    }

    renderNotifyOrder() {
        const { errorInputPriceName } = this.state;
        if (!errorInputPriceName) return null;
        return <NotifyOrder type={'error1'} text={errorInputPriceName} />;
    }

    getWlPriceBoardName = this.getWlPriceBoardName.bind(this);
    getWlPriceBoardName() {
        return this.state.newPriceBoardName;
    }

    render() {
        const editable =
            this.props.typePriceBoard === ENUM.TYPE_PRICEBOARD.PERSONAL;
        return (
            <React.Fragment>
                {this.renderNotifyOrder()}
                <HighlightInput
                    setRefTextInput={this.props.setRefTextInput}
                    value={this.getWlPriceBoardName()}
                    styleFocus={{
                        ...this.styleInput,
                        color: CommonStyle.fontWhite
                    }}
                    styleBlur={{ ...this.styleInput, color: '#10a8b2' }}
                    onChangeText={this.onChangeText}
                    maxLength={100}
                    editable={editable}
                    onBlur={this.onBlur}
                />
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state) => {
    const { priceBoard, priceBoardSelected, typePriceBoard } = state.watchlist3;
    return { listPriceBoard: priceBoard, priceBoardSelected, typePriceBoard };
};

export default connect(mapStateToProps)(WatchListNameInput);
