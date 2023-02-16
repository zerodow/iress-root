import React, { PureComponent } from 'react';
import { View } from 'react-native';
import Numpad from './numpad';
import * as setTestId from '~/constants/testId';
/**
 * @description This component contains numpads of virtual keyboard.
 * List of props:
 * - onNumpadPressed: callback that handles numpad pressing.
 * - hasEmptyButton: boolean variable that determines virtual keyboard have
 * back button or not. False will render back button, and true will return an empty one.
 * - onBackButtonPressed: callback that handles back button pressing.
 * Only available if 'hasEmptyButton' is false.
 *
 * @example
 * <NumpadKeyboard
 * 		onNumpadPressed={(numpad) => {
 * 			this.onNumpadPressed(numpad);
 * 		}}
 * 		hasEmptyButton={this.props.hasEmptyButton}
 * 		onBackButtonPressed={() => {
 * 			this.onBackDropModalPress();
 * 		}}/>
 */
class NumpadKeyboard extends PureComponent {
	render() {
		const { onNumpadPressed, onBackButtonPressed, hasEmptyButton } = this.props;
		return (
			<View
				style={styles.numpadKeyboard.container}>
				<View
					style={styles.numpadKeyboard.row}>
					<Numpad
						number={1}
						{...setTestId.testProp('Id_Pin_Pad_1', 'Label_Pin_Pad_1')}
						onPress={() => {
							onNumpadPressed(1);
						}} />
					<Numpad
						number={2}
						{...setTestId.testProp('Id_Pin_Pad_2', 'Label_Pin_Pad_2')}
						onPress={() => {
							onNumpadPressed(2);
						}} />
					<Numpad
						number={3}
						{...setTestId.testProp('Id_Pin_Pad_3', 'Label_Pin_Pad_3')}
						onPress={() => {
							onNumpadPressed(3);
						}} />
				</View>
				<View
					style={styles.numpadKeyboard.row}>
					<Numpad
						number={4}
						{...setTestId.testProp('Id_Pin_Pad_4', 'Label_Pin_Pad_4')}
						onPress={() => {
							onNumpadPressed(4);
						}} />
					<Numpad
						number={5}
						{...setTestId.testProp('Id_Pin_Pad_5', 'Label_Pin_Pad_5')}
						onPress={() => {
							onNumpadPressed(5);
						}} />
					<Numpad
						number={6}
						{...setTestId.testProp('Id_Pin_Pad_6', 'Label_Pin_Pad_6')}
						onPress={() => {
							onNumpadPressed(6);
						}} />
				</View>
				<View
					style={styles.numpadKeyboard.row}>
					<Numpad
						number={7}
						{...setTestId.testProp('Id_Pin_Pad_7', 'Label_Pin_Pad_7')}
						onPress={() => {
							onNumpadPressed(7);
						}} />
					<Numpad
						number={8}
						{...setTestId.testProp('Id_Pin_Pad_8', 'Label_Pin_Pad_8')}
						onPress={() => {
							onNumpadPressed(8);
						}} />
					<Numpad
						number={9}
						{...setTestId.testProp('Id_Pin_Pad_9', 'Label_Pin_Pad_9')}
						onPress={() => {
							onNumpadPressed(9);
						}} />
				</View>
				<View
					style={styles.numpadKeyboard.row}>
					{
						!hasEmptyButton
							? <Numpad
								number={'back'}
								{...setTestId.testProp('Id_Pin_Pad_Back', 'Label_Pin_Pad_Back')}
								onPress={() => {
									onBackButtonPressed();
								}} />
							: <Numpad
								number={'empty'} />
					}
					<Numpad
						number={0}
						{...setTestId.testProp('Id_Pin_Pad_0', 'Label_Pin_Pad_0')}
						onPress={() => {
							onNumpadPressed(0);
						}} />
					<Numpad
						number={'delete'}
						{...setTestId.testProp('Id_Pin_Pad_Delete', 'Label_Pin_Pad_Delete')}
						onPress={() => {
							onNumpadPressed('delete');
						}} />
				</View>
			</View>
		)
	}
}

const styles = {
	numpadKeyboard: {
		container: {
			alignContent: 'center'
		},
		row: {
			justifyContent: 'center',
			flexDirection: 'row'
		}
	}
};

export default NumpadKeyboard;
