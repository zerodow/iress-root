if  [ $1 == "absa" ]; then
    if  [ $2 == "prod" ]; then
        chmod +x ./cicd/update-version-prod-ios-absa.sh && ./cicd/update-version-prod-ios-absa.sh
        chmod +x ./cicd/update-version-prod-android-absa.sh && ./cicd/update-version-prod-android-absa.sh
        chmod +x ./cicd/update-version-code-push.sh && ./cicd/update-version-code-push.sh
    fi
elif [ $1 == "hl" ]; then
    if  [ $2 == "dev" ]; then
        chmod +x ./cicd/update-version-dev-ios-hl.sh && ./cicd/update-version-dev-ios-hl.sh
        chmod +x ./cicd/update-version-dev-android-hl.sh && ./cicd/update-version-dev-android-hl.sh
        chmod +x ./cicd/update-version-code-push.sh && ./cicd/update-version-code-push.sh
    elif [ $2 == 'uat' ]; then
        chmod +x ./cicd/update-version-uat-ios-hl.sh && ./cicd/update-version-uat-ios-hl.sh
        chmod +x ./cicd/update-version-uat-android-hl.sh && ./cicd/update-version-uat-android-hl.sh
        chmod +x ./cicd/update-version-code-push.sh && ./cicd/update-version-code-push.sh
    elif [ $2 == "prod" ]; then
        chmod +x ./cicd/update-version-prod-ios-hl.sh && ./cicd/update-version-prod-ios-hl.sh
        chmod +x ./cicd/update-version-prod-android-hl.sh && ./cicd/update-version-prod-android-hl.sh
        chmod +x ./cicd/update-version-code-push.sh && ./cicd/update-version-code-push.sh
    fi
elif [ $1 == "iressv4" ]; then
    if  [ $2 == "dev" ]; then
        chmod +x ./cicd/update-version-dev-ios-iress.sh && ./cicd/update-version-dev-ios-iress.sh
        chmod +x ./cicd/update-version-dev-android-iress.sh && ./cicd/update-version-dev-android-iress.sh
        chmod +x ./cicd/update-version-code-push.sh && ./cicd/update-version-code-push.sh
    elif [ $2 == 'uat' ]; then
        chmod +x ./cicd/update-version-uat-ios-iress.sh && ./cicd/update-version-uat-ios-iress.sh
        chmod +x ./cicd/update-version-uat-android-iress.sh && ./cicd/update-version-uat-android-iress.sh
        chmod +x ./cicd/update-version-code-push.sh && ./cicd/update-version-code-push.sh
    elif [ $2 == "prod" ]; then
        chmod +x ./cicd/update-version-prod-ios-iress.sh && ./cicd/update-version-prod-ios-iress.sh
        chmod +x ./cicd/update-version-prod-android-iress.sh && ./cicd/update-version-prod-android-iress.sh
        chmod +x ./cicd/update-version-code-push.sh && ./cicd/update-version-code-push.sh
    fi
elif [ $1 == "cimb" ]; then
    if  [ $2 == "dev" ]; then
        chmod +x ./cicd/update-version-dev-ios-cimb.sh && ./cicd/update-version-dev-ios-cimb.sh
        chmod +x ./cicd/update-version-dev-android-cimb.sh && ./cicd/update-version-dev-android-cimb.sh
        chmod +x ./cicd/update-version-code-push.sh && ./cicd/update-version-code-push.sh
    elif [ $2 == 'uat' ]; then
        chmod +x ./cicd/update-version-uat-ios-cimb.sh && ./cicd/update-version-uat-ios-cimb.sh
        chmod +x ./cicd/update-version-uat-android-cimb.sh && ./cicd/update-version-uat-android-cimb.sh
        chmod +x ./cicd/update-version-code-push.sh && ./cicd/update-version-code-push.sh
    elif [ $2 == "prod" ]; then
        chmod +x ./cicd/update-version-prod-ios-cimb.sh && ./cicd/update-version-prod-ios-cimb.sh
        chmod +x ./cicd/update-version-prod-android-cimb.sh && ./cicd/update-version-prod-android-cimb.sh
        chmod +x ./cicd/update-version-code-push.sh && ./cicd/update-version-code-push.sh
    fi
fi



if  [ $3 == "rebuildBundle" ]; then
    react-native bundle --platform android --dev false --entry-file index.android.js --bundle-output android/app/src/main/assets/index.android.bundle
fi
