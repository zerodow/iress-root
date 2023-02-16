import React, { useCallback, useImperativeHandle } from 'react';
import { useDispatch, useSelector } from 'react-redux';
const HandleReLoadApp = React.forwardRef((props, ref) => {
	const dispatch = useDispatch();
	const priceBoardSelected = useSelector(
		(state) => state.priceBoard.priceBoardSelected
	);
	const handleReloadApp = useCallback(() => {
		dispatch.priceBoard.selectPriceBoard(priceBoardSelected);
	}, [priceBoardSelected]);
	useImperativeHandle(ref, () => ({
		handleReloadApp
	}));
	return null;
});
HandleReLoadApp.propTypes = {};
HandleReLoadApp.defaultProps = {};
export default HandleReLoadApp;
