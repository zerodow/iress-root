import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { useController } from 'react-hook-form';

import ContigentPriceBaseTab from '../ContigentPriceBaseTab';
import styles from './styles';

const PriceBaseBlock = (props) => {
	const { field } = useController({ ...props, name: 'priceBase' });

	return (
		<View style={styles.priceBaseTab}>
			<Text style={styles.label}>Price Base</Text>
			<ContigentPriceBaseTab
				defaultActive={props.defaultValue}
				onChangeTab={({ key }) => field.onChange(key)}
			/>
		</View>
	);
};

export default PriceBaseBlock;
