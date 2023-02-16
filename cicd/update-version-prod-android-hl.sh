#!/usr/bin/env bash
cp -rf config/LogoEquix_V6_Dev/android/ android/app/src/main/res/

cp -r config/RNnavigation/NavigationApplication.java node_modules/react-native-navigation/android/app/src/main/java/com/reactnativenavigation/NavigationApplication.java
cp -r config/RNnavigation/NavigationReactGateway.java node_modules/react-native-navigation/android/app/src/main/java/com/reactnativenavigation/react/NavigationReactGateway.java

rm -f android/app/src/main/res/playstore-icon.png

cp -r config_v6/google-services.json android/app/google-services.json

nextId='com.iressv6.dev'
currentId='com.quantedge.equixnext'
sed -i -e "s/$currentId/$nextId/g" android/app/build.gradle

nextSign='iressTest' # add key jks
currentSign='equixNext'
sed -i -e "s/$currentSign/$nextSign/g" android/app/build.gradle

nextKeyStoreType='.keystore'
currentKeyStoreType='.jks'
sed -i -e "s/$currentKeyStoreType/$nextKeyStoreType/g" android/app/build.gradle

nextSignMain='com.iressv6.dev'
currentSignMain='com.quantedge.equixnext'
sed -i -e "s/$currentSignMain/$nextSignMain/g" android/app/src/main/AndroidManifest.xml

sed -i -e "s/$currentSignMain/$nextSignMain/g" android/app/src/main/java/com/equix/MainApplication.java

currentCodePush='##codepushKeyAndroid##'
nextCodePush='9g9BacG2Few3QT8eXEBvet8ZQoppTZUCL0dJh'
sed -i -e "s/$currentCodePush/$nextCodePush/g" android/app/build.gradle

nextVersion="\1\"1.0.0\"" 
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

nextLogChannnel="\1 'https:\/\/absa-api.equix.app\/v1\/log\/data',"
currentLogChannel="\(logChanel:\).*"
sed -i -e "s/$currentLogChannel/$nextLogChannnel/g" src/config.js

nextEnv="\1 'IRESS_ABSA',"
currentEnv="\(environment:\).*"
sed -i -e "s/$currentEnv/$nextEnv/g" src/config.js

nextEnv="\1 'NEXT',"
currentEnv="\(subEnvironment:\).*"
sed -i -e "s/$currentEnv/$nextEnv/g" src/config.js

nextEnv="\1 'ABSA_PROD',"
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

currentTheme="FIXED_THEME = THEME.DARK"
nextTheme="FIXED_THEME = THEME.THEME1"
sed -i -e "s/$currentTheme/$nextTheme/g" src/theme/theme_controller.js

currentBusyBox="screens\/busybox\/busybox'"
nextBusyBox="screens\/busybox\/busyboxAbsa'"
sed -i -e "s/$currentBusyBox/$nextBusyBox/g" src/screens.js


cp -rf config/LogoEquix_V6_Dev/logo_about_us/EQUIX-product-icon-06.png src/img/
cp -rf config/LogoEquix_V6_Dev/logo_in_app/logo.png src/img/background_mobile/
# bitrise run qa