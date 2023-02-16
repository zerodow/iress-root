import React, { useEffect, useState } from 'react';
import * as TabModel from '~/screens/new_order/Model/TabModel.js';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { activeContingent, toggleContingent } from '~/screens/new_order/Redux/actions.js'
import Enum from '~/enum';

export const ContingentBtn = () => {
	const layout = useSelector(state => state.newOrder.layout, shallowEqual);
	const enableContingent = useSelector(state => state.newOrder.enableContingent);

	const dispatch = useDispatch()

	if (layout === Enum.ORDER_LAYOUT.BASIC) {
		return null;
	}

	const toggleActive = () => {
		const currentEnable = enableContingent;
		dispatch(toggleContingent(!currentEnable));
		if (currentEnable) {
			dispatch(activeContingent(false));
		}
	}

	return <TouchableOpacity style={enableContingent ? styles.active : styles.inactive} onPress={toggleActive}>
		<Text style={enableContingent ? styles.textActive : styles.textInActive}>Contingent strategy</Text>
	</TouchableOpacity>
}

const styles = StyleSheet.create({
	active: {
		borderColor: 'rgb(58, 66, 94)',
		backgroundColor: '#57E1F1',
		marginTop: 8,
		borderWidth: 1,
		borderStyle: 'solid',
		borderRadius: 4,
		display: 'flex',
		alignItems: 'center',
		paddingTop: 8,
		paddingBottom: 8
	},
	textActive: {
		fontWeight: '700',
		color: '#171B29',
		fontSize: 14,
		opacity: 1,
		textTransform: 'uppercase'
	},
	inactive:
	{
		borderColor: 'rgb(58, 66, 94)',
		backgroundColor: 'transparent',
		borderWidth: 1,
		borderStyle: 'solid',
		marginTop: 8,
		borderRadius: 4,
		display: 'flex',
		alignItems: 'center',
		paddingTop: 8,
		paddingBottom: 8
	},
	textInActive: {
		color: '#FFFFFF',
		fontWeight: '400',
		fontSize: 14,
		opacity: 0.7,
		textTransform: 'uppercase'
	}
});
