import React, { useEffect } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types'

import Content from './Views/Content'

import { dataStorage } from '~/storage'
import ScreenId from '~/constants/screen_id'
const SearchAccount = (props) => {
    useEffect(() => {
        dataStorage.currentScreenId = ScreenId.SEARCH_ACCOUNT
    }, [])
    return (
        <Content {...props} />
    );
}
SearchAccount.propTypes = {};

export default SearchAccount;
