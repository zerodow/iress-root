#!/usr/bin/env bash
cp -rf config/LogoEquix_Iress_uat/android/ android/app/src/main/res/

cp -r config/RNnavigation/NavigationApplication.java node_modules/react-native-navigation/android/app/src/main/java/com/reactnativenavigation/NavigationApplication.java
cp -r config/RNnavigation/NavigationReactGateway.java node_modules/react-native-navigation/android/app/src/main/java/com/reactnativenavigation/react/NavigationReactGateway.java

rm -f android/app/src/main/res/playstore-icon.png

cp -r android_config_iress_uat/google-services.json android/app/google-services.json

nextId='com.iress.Trading'
currentId='com.quantedge.equixnext'
sed -i -e "s/$currentId/$nextId/g" android/app/build.gradle

nextSign='iressUAT' # add key jks
currentSign='equixNext'
sed -i -e "s/$currentSign/$nextSign/g" android/app/build.gradle

nextKeyStoreType='.keystore'
currentKeyStoreType='.jks'
sed -i -e "s/$currentKeyStoreType/$nextKeyStoreType/g" android/app/build.gradle

nextSignMain='com.iress.Trading'
currentSignMain='com.quantedge.equixnext'
sed -i -e "s/$currentSignMain/$nextSignMain/g" android/app/src/main/AndroidManifest.xml

sed -i -e "s/$currentSignMain/$nextSignMain/g" android/app/src/main/java/com/equix/MainApplication.java

currentCodePush='##codepushKeyAndroid##'
nextCodePush='ARNQXQI0gfejU8u6AxeIWrS6lMpXqzvPTDDdd'
sed -i -e "s/$currentCodePush/$nextCodePush/g" android/app/build.gradle

nextVersion="\1\"1.1.2\"" 
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

nextLogChannnel="\1 'https:\/\/iress-uat-api.equix.app\/v1\/log\/data',"
currentLogChannel="\(logChanel:\).*"
sed -i -e "s/$currentLogChannel/$nextLogChannnel/g" src/config.js

nextEnv="\1 'IRESS_UAT',"
currentEnv="\(environment:\).*"
sed -i -e "s/$currentEnv/$nextEnv/g" src/config.js

nextEnv="\1 'NEXT',"
currentEnv="\(subEnvironment:\).*"
sed -i -e "s/$currentEnv/$nextEnv/g" src/config.js

nextEnv="\1 'IRESS_UAT',"
currentEnv="\(envRegion:\).*"
sed -i -e "s/$currentEnv/$nextEnv/g" src/config.js


nextLogoInApp="\1 'IRESS',"
currentLogoInApp="\(logoInApp:\).*"
sed -i -e "s/$currentLogoInApp/$nextLogoInApp/g" src/config.js

nextWebsite="\1 'novus-fintech.com',"
currentWebsite="\(website:\).*"
sed -i -e "s/$currentWebsite/$nextWebsite/g" src/config.js

nextUrlWebsite="\1 'https:\/\/www.novus-fintech.com',"
currentUrlWebsite="\(urlWebsite:\).*"
sed -i -e "s/$currentUrlWebsite/$nextUrlWebsite/g" src/config.js

nextChangeRegion="\1 true,"
currentChangeRegion="\(isChangeRegion:\).*"
sed -i -e "s/$currentChangeRegion/$nextChangeRegion/g" src/config.js
cp -rf config/LogoEquix_Iress_uat/logo_about_us/EQUIX-product-icon-06.png src/img/
cp -rf config/LogoEquix_Iress_uat/logo_in_app/logo.png src/img/background_mobile/
# bitrise run qa

rm -rf android/app/src/main/res/drawable-hdpi-v11
rm -rf android/app/src/main/res/drawable-mdpi-v11
rm -rf android/app/src/main/res/drawable-xhdpi-v11
rm -rf android/app/src/main/res/drawable-xxhdpi-v11
rm -rf android/app/src/main/res/drawable-xxxhdpi-v11
rm -rf android/app/src/main/res/mipmap-hdpi/ic_notification.png
rm -rf android/app/src/main/res/mipmap-mdpi/ic_notification.png
rm -rf android/app/src/main/res/mipmap-xhdpi/ic_notification.png
rm -rf android/app/src/main/res/mipmap-xxhdpi/ic_notification.png
rm -rf android/app/src/main/res/mipmap-xxxhdpi/ic_notification.png
cp -rf config/LogoEquix_Iress_uat/android/strings.xml android/app/src/main/res/values/

rm -rf android/app/src/main/res/strings.xml
rm -rf android/app/src/main/res/mipmap-ldpi