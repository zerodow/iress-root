import React, { PropTypes } from 'react';
import {
	TouchableOpacity
} from 'react-native';

const Button = props => (
	<TouchableOpacity {...props}>
		{props.children}
	</TouchableOpacity>
);


module.exports = Button;