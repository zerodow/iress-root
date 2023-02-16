import React from 'react';
import codePush from 'react-native-code-push';
codePush({
    installMode: codePush.InstallMode.ON_NEXT_RESUME,
    checkFrequency: codePush.CheckFrequency.ON_APP_RESUME
})
export class CodePushComponent extends React.Component {
    render() {
        return null;
    }
}
