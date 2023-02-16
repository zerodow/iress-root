import { AppState } from 'react-native'
import { dataStorage } from '~/storage'
const dicAppState = {}

const TIME_INACTIVE = 10 * 1000

export const dicRegisterAppState = {
}

export function registerAppState(type, handleFunction) {
	if (!handleFunction) return;
	if (dicAppState[type]) return;
	dicAppState[type] = handleFunction
	AppState.addEventListener('change', handleFunction);
}

export function unRegisterAppState(type) {
	if (!dicAppState[type]) return
	const handleFunction = dicAppState[type]
	AppState.removeEventListener('change', handleFunction);
	dicAppState[type] = null
}

export function unRegisterAllAppState() {
	if (Object.keys(dicAppState).length <= 0) return
	Object.keys(dicAppState).map(e => {
		const type = e
		unRegisterAppState(type)
	})
}

export function registerAppStateChangeHandle(screenId, func) {
	dicRegisterAppState[screenId] = func
}

function checkTimeInactive() {
	const inactiveTime = dataStorage.inactiveTime
	const activeTime = +new Date()
	return (activeTime - inactiveTime) > TIME_INACTIVE
}
export function reLoadScreenNow() {
	const currentScreenId = dataStorage.currentScreenId
	currentScreenId && dicRegisterAppState[currentScreenId] && dicRegisterAppState[currentScreenId]()
}
export function reloadScreenAfterActive() {
	if (checkTimeInactive()) {
		const currentScreenId = dataStorage.currentScreenId
		currentScreenId && dicRegisterAppState[currentScreenId] && dicRegisterAppState[currentScreenId]()
	}
}
