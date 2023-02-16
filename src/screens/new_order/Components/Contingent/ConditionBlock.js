import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { useController } from 'react-hook-form';

import ContigentCondition from '../ContigentCondition';
import styles from './styles';

const ConditionBlock = (props) => {
	const { field } = useController({ ...props, name: 'condition' });

	return (
		<View style={styles.conditionTab}>
			<Text style={styles.label}>Condition</Text>
			<ContigentCondition
				defaultActive={props.defaultValue}
				onChangeTab={({ key }) => field.onChange(key)}
			/>
		</View>
	);
};

export default ConditionBlock;
