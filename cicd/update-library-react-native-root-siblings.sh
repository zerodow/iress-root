currentEmmitterLib="import EventEmitter from 'react-native\/Libraries\/vendor\/emitter\/EventEmitter';"
nextEmmitterLib="import EventEmitter from 'react-native\/Libraries\/EventEmitter\/EventEmitter'"
sed -i -e "s/$currentEmmitterLib/$nextEmmitterLib/g" node_modules/react-native-root-siblings/lib/AppRegistryInjection.js
rm -f node_modules/react-native-root-siblings/lib/AppRegistryInjection.js-e