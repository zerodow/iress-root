import React, { useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import CommonStyle from '~/theme/theme_controller';
import I18n from '~/modules/language/';
import TouchableOpacityOpt from '~/component/touchableOpacityOpt/';
import SvgIcon from '~s/watchlist/Component/Icon2';
import ENUM from '~/enum';
const { DELETE_BUTTON_STATUS } = ENUM;
const DeleteSymbolButton = (props) => {
	const { onDelete: onDeleteParent } = props;
	const { deleteBtnStatus, dicSymbolAdded } = useSelector(
		(state) => state.categoriesWL
	);
	const disabled = useMemo(() => {
		return !dicSymbolAdded || Object.keys(dicSymbolAdded).length < 1;
	}, [dicSymbolAdded]);
	const onDelete = useCallback(() => {
		const isDeleteAll = deleteBtnStatus === DELETE_BUTTON_STATUS.DELETE_ALL;
		onDeleteParent && onDeleteParent(isDeleteAll);
	}, [deleteBtnStatus, dicSymbolAdded]);
	const deleteText = useMemo(() => {
		switch (deleteBtnStatus) {
			case DELETE_BUTTON_STATUS.DELETE_ALL:
				return I18n.t('deleteAll');
			default:
				return I18n.t('deleteSelected');
		}
	}, [deleteBtnStatus]);
	return (
		<TouchableOpacityOpt
			disabled={disabled}
			onPress={onDelete}
			style={{
				flexDirection: 'row',
				alignItems: 'center',
				paddingVertical: 13,
				paddingHorizontal: 16,
				borderWidth: 1,
				borderColor: CommonStyle.color.dusk_tabbar,
				borderRadius: 8,
				opacity: disabled ? 0.5 : 1
			}}
		>
			<CommonStyle.icons.deleteSvg
				name={'delete'}
				size={20}
				color={
					CommonStyle.color.sell
				}
			/>
			<Text
				style={{
					color: CommonStyle.color.sell,
					fontFamily: CommonStyle.fontPoppinsRegular,
					fontSize: CommonStyle.font11,
					paddingTop: 2
				}}
			>
				{deleteText}
			</Text>
		</TouchableOpacityOpt>
	);
};

export default DeleteSymbolButton;
