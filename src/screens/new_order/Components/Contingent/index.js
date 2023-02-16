import { StyleSheet, Text, View } from 'react-native';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';

import * as ConditionModel from '~/screens/new_order/Model/PriceBaseContingentConditionModel';
import styles from './styles';
import PriceBaseBlock from './PriceBaseBlock';
import ConditionBlock from './ConditionBlock';
import InputBlock from './InputBlock';

const Contingent = ({ contingentData }) => {
	const { status, condition, priceBase, triggerPrice } = contingentData || {};

	const isPoint = useSelector(
		(state) => state.newOrder.isContingentTypePoint
	);

	const pointerEvents = ConditionModel.model.isDisableCondition
		? 'none'
		: 'auto';

	const { control, setError } = useForm({ mode: 'onChange' });

	return (
		<View style={styles.container} pointerEvents={pointerEvents}>
			<PriceBaseBlock control={control} defaultValue={priceBase} />
			<ConditionBlock control={control} defaultValue={condition} />

			<View style={styles.inputContainer}>
				<Text style={[styles.label, { marginTop: 16 }]}>
					{isPoint ? 'Points' : 'Price'}
				</Text>

				<InputBlock
					control={control}
					defaultValue={triggerPrice}
					setError={(message) => {
						setError(
							'triggerPrice',
							message && {
								type: 'required',
								message
							}
						);
					}}
				/>
			</View>
			<View style={styles.divider} />
		</View>
	);
};

export default Contingent;
