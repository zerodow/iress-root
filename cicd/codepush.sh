if  [ $1 == "absa" ]; then
    if [ $2 == "prod" ];then
        chmod +x ./cicd/build.sh && ./cicd/build.sh absa prod
        appcenter codepush release-react -a novus-fintech/ABSA_iOS -d Prod -t 0.2.1
        appcenter codepush release-react -a novus-fintech/ABSA_Android -d Prod -t 0.2.1
    fi
elif [ $1 == "hl" ]; then
    if  [ $2 == "dev" ]; then
        chmod +x ./cicd/build.sh && ./cicd/build.sh hl dev
        appcenter codepush release-react -a novus-fintech/Hong_Leong_Android -d Dev -t 1.1.1
        appcenter codepush release-react -a novus-fintech/Hong_Leong_iOS -d Dev -t 1.1.1
    elif  [ $2 == "uat" ]; then
        chmod +x ./cicd/build.sh && ./cicd/build.sh hl uat
        appcenter codepush release-react -a novus-fintech/Hong_Leong_Android -d Uat -t 1.1.2
        appcenter codepush release-react -a novus-fintech/Hong_Leong_iOS -d Uat -t 1.1.2
    elif [ $2 == "prod" ]; then
        chmod +x ./cicd/build.sh && ./cicd/build.sh hl prod
        appcenter codepush release-react -a novus-fintech/Hong_Leong_Android -d Prod -t 0.1.0
        appcenter codepush release-react -a novus-fintech/Hong_Leong_iOS -d Prod -t 0.1.0
    fi
elif [ $1 == "iressv4" ]; then
    if  [ $2 == "dev" ]; then
        chmod +x ./cicd/build.sh && ./cicd/build.sh iressv4 dev
        appcenter codepush release-react -a novus-fintech/IRESS_Android -d Dev -t 1.0.1
        appcenter codepush release-react -a novus-fintech/IRESS_iOS -d Dev -t 1.0.1
    elif  [ $2 == "uat" ]; then
        chmod +x ./cicd/build.sh && ./cicd/build.sh iressv4 uat
        appcenter codepush release-react -a novus-fintech/IRESS_Android -d Uat -t 1.1.2
        appcenter codepush release-react -a novus-fintech/IRESS_iOS -d Uat -t 1.1.2
    elif [ $2 == "prod" ]; then
        chmod +x ./cicd/build.sh && ./cicd/build.sh iressv4 prod
        appcenter codepush release-react -a novus-fintech/IRESS_Android -d Prod -t 0.1.0
        appcenter codepush release-react -a novus-fintech/IRESS_iOS -d Prod -t 0.1.0
    fi
elif [ $1 == "cimb" ]; then
    if  [ $2 == "dev" ]; then
        chmod +x ./cicd/build.sh && ./cicd/build.sh cimb dev
        appcenter codepush release-react -a novus-fintech/CIMB_Android -d Dev -t 1.1.1
        appcenter codepush release-react -a novus-fintech/CIMB_iOS -d Dev -t 1.1.1
    elif  [ $2 == "uat" ]; then
        chmod +x ./cicd/build.sh && ./cicd/build.sh cimb uat
        appcenter codepush release-react -a novus-fintech/CIMB_Android -d Uat -t 1.1.2
        appcenter codepush release-react -a novus-fintech/CIMB_iOS -d Uat -t 1.1.2
    elif [ $2 == "prod" ]; then
         chmod +x ./cicd/build.sh && ./cicd/build.sh cimb prod
        appcenter codepush release-react -a novus-fintech/CIMB_Android -d Prod -t 1.1.0
        appcenter codepush release-react -a novus-fintech/CIMB_iOS -d Prod -t 1.1.0
    fi
fi
