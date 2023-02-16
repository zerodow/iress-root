#!/usr/bin/env bash
cp -rf config/LogoEquix_V4_Test/android/ android/app/src/main/res/

cp -r config/RNnavigation/NavigationApplication.java node_modules/react-native-navigation/android/app/src/main/java/com/reactnativenavigation/NavigationApplication.java
cp -r config/RNnavigation/NavigationReactGateway.java node_modules/react-native-navigation/android/app/src/main/java/com/reactnativenavigation/react/NavigationReactGateway.java

rm -f android/app/src/main/res/playstore-icon.png

cp -r android_config_iress_test/google-services.json android/app/google-services.json

nextId='com.iressv4.test'
currentId='com.quantedge.equixnext'
sed -i -e "s/$currentId/$nextId/g" android/app/build.gradle

nextSign='iressTest' # add key jks
currentSign='equixNext'
sed -i -e "s/$currentSign/$nextSign/g" android/app/build.gradle

nextKeyStoreType='.keystore'
currentKeyStoreType='.jks'
sed -i -e "s/$currentKeyStoreType/$nextKeyStoreType/g" android/app/build.gradle

nextSignMain='com.iressv4.test'
currentSignMain='com.quantedge.equixnext'
sed -i -e "s/$currentSignMain/$nextSignMain/g" android/app/src/main/AndroidManifest.xml

sed -i -e "s/$currentSignMain/$nextSignMain/g" android/app/src/main/java/com/equix/MainApplication.java

currentCodePush='##codepushKeyAndroid##'
nextCodePush='oBrGqyPHKQaJjGWs29CC5pMn9ghsZX9EgMZrs'
sed -i -e "s/$currentCodePush/$nextCodePush/g" android/app/build.gradle


nextVersion="\1\"1.2.1\"" 
currentVersion="\(versionName \).*"
sed -i -e "s/$currentVersion/$nextVersion/g" android/app/build.gradle

nextBuildName="\1`date +%s`"
currentBuildName="\(versionCode \).*"
sed -i -e "s/$currentBuildName/$nextBuildName/g" android/app/build.gradle

nextEnv="\1 '`date +%Y%m%d%H%M`',"
currentEnv="\(currentAndroidVersion:\).*"
sed -i -e "s/$currentEnv/$nextEnv/g" src/config.js

nextEnv="\1 '`date +%Y%m%d%H%M`',"
currentEnv="\(currentIosVersion:\).*"
sed -i -e "s/$currentEnv/$nextEnv/g" src/config.js

nextEnv="\1 'NEXT',"
currentEnv="\(subEnvironment:\).*"
sed -i -e "s/$currentEnv/$nextEnv/g" src/config.js

nextEnv="\1 'IRESS_DEV',"
currentEnv="\(envRegion:\).*"
sed -i -e "s/$currentEnv/$nextEnv/g" src/config.js

nextName='Iress Mobile'
currentName='Equix Next'
sed -i -e "s/$currentName/$nextName/g" android/app/src/main/res/values/strings.xml
rm -f android/app/src/main/res/values/strings.xml-e

nextLogoInApp="\1 'IRESS',"
currentLogoInApp="\(logoInApp:\).*"
sed -i -e "s/$currentLogoInApp/$nextLogoInApp/g" src/config.js

nextWebsite="\1 'novus-fintech.com',"
currentWebsite="\(website:\).*"
sed -i -e "s/$currentWebsite/$nextWebsite/g" src/config.js

nextUrlWebsite="\1 'https:\/\/www.novus-fintech.com',"
currentUrlWebsite="\(urlWebsite:\).*"
sed -i -e "s/$currentUrlWebsite/$nextUrlWebsite/g" src/config.js

currentTheme="FIXED_THEME = THEME.THEME1"
nextTheme="FIXED_THEME = THEME.DARK"
sed -i -e "s/$currentTheme/$nextTheme/g" src/theme/theme_controller.js


cp -rf config/LogoEquix_Iress/logo_about_us/EQUIX-product-icon-06.png src/img/
cp -rf config/LogoEquix_Iress/logo_in_app/logo.png src/img/background_mobile/
# bitrise run qa