import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import PropTypes from 'prop-types'

import Content from './Views/Content'
const SearchSymbol = ({ symbol, exchange, forwardContext, ...rest }) => {
    return (
        <Content {...{ symbol, exchange, forwardContext, ...rest }} />
    );
}
SearchSymbol.propTypes = {};

export default SearchSymbol;
