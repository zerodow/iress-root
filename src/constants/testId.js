export function testProp(id, label) {
	return {
		testID: id || 'unsetId',
		accessibilityLabel: label || 'unsetLabel'
	};
}
