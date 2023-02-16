#!/usr/bin/env bash
currentVersion='##VERSION##'
nextVersion=`date +%Y%m%d%H%M`
echo "NEXT VERION: "$nextVersion
# set detox test config 
nextEnv="\1 false,"
currentEnv="\(isDetoxTest:\).*"
sed -i -e "s/$currentEnv/$nextEnv/g" src/config.js

sed -i -e "s/$currentVersion/$nextVersion/g" src/modules/language/language_json/en.json
sed -i -e "s/$currentVersion/$nextVersion/g" src/modules/language/language_json/vi.json
sed -i -e "s/$currentVersion/$nextVersion/g" src/modules/language/language_json/cn.json
rm -f src/modules/language/language_json/en.json-e
rm -f src/modules/language/language_json/cn.json-e
rm -f src/modules/language/language_json/vi.json-e

# currentEmmitterLib="import EventEmitter from 'react-native\/Libraries\/vendor\/emitter\/EventEmitter';"
# nextEmmitterLib="import EventEmitter from 'react-native\/Libraries\/EventEmitter\/EventEmitter'"
# sed -i -e "s/$currentEmmitterLib/$nextEmmitterLib/g" node_modules/react-native-root-siblings/lib/AppRegistryInjection.js
# rm -f node_modules/react-native-root-siblings/lib/AppRegistryInjection.js-e

# react-native bundle --platform android --dev false --entry-file index.android.js --bundle-output android/app/src/main/assets/index.android.bundle