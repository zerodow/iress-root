#!/usr/bin/env bash
nextVersion="\1 = \"1.0.0\";" 
currentVersion="\(MARKETING_VERSION\).*"
sed -i -e "s/$currentVersion/$nextVersion/g" ios/equix.xcodeproj/project.pbxproj

nextBuildName="\1 = `date +%s`;"
currentBuildName="\(CURRENT_PROJECT_VERSION\).*"
sed -i -e "s/$currentBuildName/$nextBuildName/g" ios/equix.xcodeproj/project.pbxproj

currentCodePush='##codepushKeyIOS##'
nextCodePush='i0Ip9v7Q8xkaFgn0BOIYrN59DSgCv54k0kiha'
sed -i -e "s/$currentCodePush/$nextCodePush/g" ios/equix/Info.plist

currentName='OM Equix'
nextName='Hong\&\#x0020\;Leong\&\#x0020\;Mobile'
sed -i -e "s/$currentName/$nextName/g" ios/equix/Info.plist

nextId='hlib.app.com'
currentId='com.quantedge.equix2'
sed -i -e "s/$currentId/$nextId/g" ios/equix.xcodeproj/project.pbxproj

currentSpec='IressEquix'
nextSpec='"XC iOS: com.quantedge.equix2"'
sed -i -e "s/$currentSpec/$nextSpec/g" ios/equix.xcodeproj/project.pbxproj

nextId='TARGETED_DEVICE_FAMILY = 1'
currentId='TARGETED_DEVICE_FAMILY = "1,2"'
sed -i -e "s/$currentId/$nextId/g" ios/equix.xcodeproj/project.pbxproj

nextEnv="\1 '`date +%Y%m%d%H%M`',"
currentEnv="\(currentAndroidVersion:\).*"
sed -i -e "s/$currentEnv/$nextEnv/g" src/config.js

nextEnv="\1 '`date +%Y%m%d%H%M`',"
currentEnv="\(currentIosVersion:\).*"
sed -i -e "s/$currentEnv/$nextEnv/g" src/config.js

nextLogChannnel="\1 'https:\/\/iress-uat-api.equix.app\/v1\/log\/data',"
currentLogChannel="\(logChanel:\).*"
sed -i -e "s/$currentLogChannel/$nextLogChannnel/g" src/config.js

nextEnv="\1 'IRESS_PROD',"
currentEnv="\(environment:\).*"
sed -i -e "s/$currentEnv/$nextEnv/g" src/config.js

nextEnv="\1 'NEXT',"
currentEnv="\(subEnvironment:\).*"
sed -i -e "s/$currentEnv/$nextEnv/g" src/config.js

nextEnv="\1 'IRESS_PROD',"
currentEnv="\(envRegion:\).*"
sed -i -e "s/$currentEnv/$nextEnv/g" src/config.js

nextRealtimePortfolio="\1 true,"
currentRealtimePortfolio="\(enableRealtimePortfolioByMkt:\).*"
sed -i -e "s/$currentRealtimePortfolio/$nextRealtimePortfolio/g" src/config.js

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

cp -rf config/LogoEquix_Iress_prod/logo_about_us/EQUIX-product-icon-06.png src/img/
cp -rf config/LogoEquix_Iress_prod/splashscreen/Equix.png ios/equix/Images.xcassets/Equix.imageset/
cp -rf config/LogoEquix_Iress_prod/logo_in_app/logo.png src/img/background_mobile/
cp -r ios_config_test/GoogleService-Info.plist ios/GoogleService-Info.plist

rm -rf ios/equix/Images.xcassets/AppIcon.appiconset
cp -rf config/LogoEquix_Iress_prod/ios/AppIcon.appiconset ios/equix/Images.xcassets/AppIcon.appiconset
