import React, { useState, useCallback, useEffect, useRef, useImperativeHandle } from 'react'
import {
	View, Text, TextInput, TouchableOpacity, StyleSheet
} from 'react-native'
import I18n from '~/modules/language/'
import CommonStyle, { register } from '~/theme/theme_controller'
import * as PureFunc from '~/utils/pure_func'
import Ionicons from 'react-native-vector-icons/Ionicons';
import TouchableOpacityOpt from '~/component/touchableOpacityOpt/'
import { handleChangeEmail, handleChangePassWord } from '~/screens/home/Controllers/LoginController.js'
import SvgIcon from '~/component/svg_icon/SvgIcon.js'
import { changeEmail } from '~/screens/login/login.actions.js'
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
const lastEmail = 'prod-live@quantedge'
const CloseIcon = ({ onClose }) => {
	return <TouchableOpacity
		hitSlop={{ top: 16, left: 16, bottom: 16, right: 16 }}
		onPress={onClose}
		style={{
			position: 'absolute',
			alignSelf: 'center',
			alignItems: 'flex-end',
			justifyContent: 'center',
			minWidth: 50,
			right: 0
		}}
	>
		<Ionicons
			name="md-close-circle-outline"
			color={CommonStyle.fontNearLight4}
			style={{ textAlign: 'center' }}
			size={16}
		/>
	</TouchableOpacity>
}
const EyeButton = ({ isSecureTextEntry, onPress }) => {
	return isSecureTextEntry ? (
		<TouchableOpacity
			hitSlop={{ top: 16, left: 16, bottom: 16, right: 16 }}
			onPress={onPress}
			style={{
				position: 'absolute',
				alignSelf: 'center',
				alignItems: 'flex-end',
				justifyContent: 'center',
				minWidth: 50,
				right: 0
			}}
		>
			<CommonStyle.icons.eyeoff size={16} name='nounEyeCross' color={CommonStyle.fontNearLight4} />
		</TouchableOpacity>
	) : (
		<TouchableOpacity
			hitSlop={{ top: 16, left: 16, bottom: 16, right: 16 }}
			onPress={onPress}
			style={{
				position: 'absolute',
				alignSelf: 'center',
				alignItems: 'flex-end',
				justifyContent: 'center',
				minWidth: 50,
				right: 0
			}}
		>
			<CommonStyle.icons.eye size={16} name='nounEye' color={CommonStyle.fontNearLight4} />
		</TouchableOpacity>
	)
}
const Input = ({
	onChangeText,
	isSecureTextEntry = false,
	rightIconInputPress,
	login = () => { },
	defaultValue = '',
	placeholder = '',
	renderIcon,
	onFocus
}) => {
	const { textInput } = styles
	const refTextInput = useRef()
	const clearText = useCallback(() => {
		try {
			refTextInput.current.clear && refTextInput.current.clear()
			onChangeText && onChangeText('')
		} catch (error) {

		}
	}, [])
	return <View style={{ flexDirection: 'row', marginTop: 32 }}>
		<TextInput
			ref={refTextInput}
			onFocus={() => {
				onFocus(refTextInput)
			}}
			placeholder={placeholder}
			placeholderTextColor="rgba(239,239,239,0.7)"
			underlineColorAndroid="rgba(0,0,0,0)"
			numberOfLines={1}
			onChangeText={onChangeText}
			// selectionColor={CommonStyle.fontWhite}
			defaultValue={defaultValue}
			style={[textInput]}
			secureTextEntry={isSecureTextEntry}
			onSubmitEditing={login}
		/>
		{renderIcon ? renderIcon() : <CloseIcon style={{
			height: 26,
			width: 30
		}} onClose={clearText} />}

	</View>
}
const useInput = (updateLayout) => {
	const ref = useRef()
	const onFocus = useCallback((refTextInput) => {
		refTextInput.current.measure((x, y, width, height, pageX, pageY) => {
			console.info(`textInput.measure `, x, y, width, height, pageX, pageY);
			updateLayout({ pageYTextInput: pageY, heightTextInput: height })
		});
	}, [])
	return [onFocus, ref]
}
const UserName = ({ updateLayout }) => {
	const dispatch = useDispatch()
	const onChangeText = useCallback((email) => {
		handleChangeEmail && handleChangeEmail(email)
	}, [])
	const lastEmail = useSelector(state => state.login.lastEmail, shallowEqual)
	const email = useSelector(state => state.login.email, shallowEqual)
	useEffect(() => {
		dispatch(changeEmail(email))
	}, [email])
	useEffect(() => {
		lastEmail && dispatch(changeEmail(lastEmail))
	}, [lastEmail])
	const [onFocus] = useInput(updateLayout)

	return <Input
		onFocus={onFocus}
		onChangeText={onChangeText}
		defaultValue={lastEmail}
		placeholder={I18n.t('userLogin')}
	/>
}

const PassWord = ({ updateLayout, signIn }) => {
	const [isSecureTextEntry, setIsSecureTextEntry] = useState(true)
	const password = useSelector(state => state.login.password, shallowEqual)
	const onChangeText = useCallback((password) => {
		handleChangePassWord && handleChangePassWord(password)
	}, [])
	const handleChangeSecureTextEntry = useCallback(() => {
		setIsSecureTextEntry(!isSecureTextEntry)
	}, [isSecureTextEntry])
	const renderIcon = useCallback(() => {
		return <EyeButton onPress={handleChangeSecureTextEntry} isSecureTextEntry={isSecureTextEntry} />
	}, [isSecureTextEntry])
	useEffect(() => {
		return () => {
			handleChangePassWord && handleChangePassWord('')
		}
	}, [])
	const [onFocus] = useInput(updateLayout)
	return <Input
		onFocus={onFocus}
		renderIcon={renderIcon}
		onChangeText={onChangeText}
		isSecureTextEntry={isSecureTextEntry}
		// defaultValue={password}
		login={() => {
			signIn && signIn()
		}}
		placeholder={I18n.t('password')} />
}

const LoginUsernamePw = (p) => {
	return <View style={{ paddingHorizontal: 16 }}>
		<UserName {...p} />
		<PassWord {...p} />
	</View>
}

const styles = {}
function getNewestStyle() {
	const newStyle = StyleSheet.create({
		textInput: {
			flex: 1,
			paddingHorizontal: 4,
			height: 26,
			paddingVertical: 0,
			borderBottomColor: CommonStyle.color.dusk,
			borderBottomWidth: 1,
			color: CommonStyle.fontWhite,
			fontFamily: CommonStyle.fontPoppinsRegular,
			fontSize: CommonStyle.fontSizeM
		}
	});
	PureFunc.assignKeepRef(styles, newStyle)
}
getNewestStyle()
register(getNewestStyle)

export default LoginUsernamePw
