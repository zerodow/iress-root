package com.equix;

// Import opensetting module
import com.equix.systemsetting.*;

import android.app.Application;
import android.support.annotation.NonNull;

import com.facebook.react.ReactApplication;
import org.wonday.pdf.RCTPdfView;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.cmcewen.blurview.BlurViewPackage;
import com.avishayil.rnrestart.ReactNativeRestartPackage;
import com.masteratul.exceptionhandler.ReactNativeExceptionHandlerPackage;
import io.xogus.reactnative.versioncheck.RNVersionCheckPackage;
import com.github.ajalt.reprint.core.Reprint;
import co.eleken.react_native_touch_id_android.FingerprintPackage;
import io.tradle.react.LocalAuthPackage;
import com.github.jonnybgod.RNEventSource.RNEventSourcePackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.zmxv.RNSound.RNSoundPackage;
import com.keyee.pdfview.PDFView;
import cl.json.RNSharePackage;
import cl.json.ShareApplication;
import com.beefe.picker.PickerViewPackage;
import com.github.wuxudong.rncharts.MPAndroidChartPackage;
import org.devio.rn.splashscreen.SplashScreenReactPackage;
import com.github.xinthink.rnmk.ReactMaterialKitPackage;
import com.microsoft.codepush.react.CodePush;
import com.i18n.reactnativei18n.ReactNativeI18n;
import io.invertase.firebase.RNFirebasePackage;
import io.invertase.firebase.notifications.RNFirebaseNotificationsPackage;
// Optional packages - add as appropriate
// import io.invertase.firebase.admob.RNFirebaseAdMobPackage; //Firebase AdMob
import io.invertase.firebase.analytics.RNFirebaseAnalyticsPackage; // Firebase Analytics
import io.invertase.firebase.auth.RNFirebaseAuthPackage; // Firebase Auth
import io.invertase.firebase.config.RNFirebaseRemoteConfigPackage; // Firebase Remote Config
// import io.invertase.firebase.crash.RNFirebaseCrashPackage; // Firebase Crash Reporting
import io.invertase.firebase.database.RNFirebaseDatabasePackage; // Firebase Realtime Database
import io.invertase.firebase.messaging.RNFirebaseMessagingPackage; // Firebase Cloud Messaging
import io.invertase.firebase.perf.RNFirebasePerformancePackage; // Firebase Performance
import io.invertase.firebase.storage.RNFirebaseStoragePackage; // Firebase Storage

import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.BV.LinearGradient.LinearGradientPackage;
import com.lugg.ReactNativeConfig.ReactNativeConfigPackage;
import com.facebook.soloader.SoLoader;
import java.util.Arrays;
import java.util.List;

import com.reactnativenavigation.NavigationApplication;
import com.reactnativenavigation.react.NavigationReactNativeHost;
import com.reactnativenavigation.react.ReactGateway;

import ca.jaysoo.extradimensions.ExtraDimensionsPackage;

import com.facebook.react.uimanager.UIImplementationProvider;
import com.equix.CalendarUIImplementationProvider;

import io.invertase.firebase.fabric.crashlytics.RNFirebaseCrashlyticsPackage; // <-- Add this line

// public class MainApplication extends Application implements ReactApplication {
public class MainApplication extends NavigationApplication implements ShareApplication {

  // private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
  protected UIImplementationProvider getUIImplementationProvider() {
    return new CalendarUIImplementationProvider();
  }

  @Override
  public String getFileProviderAuthority() {
    return "com.quantedge.equixnext.provider";
  }

  @Override
  public boolean isDebug() {
    return BuildConfig.DEBUG;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    Reprint.initialize(this);
    SoLoader.init(this, /* native exopackage */ false);
  }

  @Override
  protected ReactGateway createReactGateway() {
    ReactNativeHost host = new NavigationReactNativeHost(this, isDebug(), createAdditionalReactPackages()) {
      @Override
      protected String getJSMainModuleName() {
        return "index";
      }

      @Override
      protected String getJSBundleFile() {
        return CodePush.getJSBundleFile();
      }
    };
    return new ReactGateway(this, isDebug(), host);
  }

  @NonNull
  @Override
  public List<ReactPackage> createAdditionalReactPackages() {
    // Add the packages you require here.
    // No need to add RnnPackage and MainReactPackage
    return Arrays.<ReactPackage>asList(new VectorIconsPackage(), new LinearGradientPackage(),
        new ReactNativeConfigPackage(), new SplashScreenReactPackage(), new PDFView(), new RNSoundPackage(),
        new CodePush(BuildConfig.CODEPUSH_KEY, MainApplication.this, BuildConfig.DEBUG), // Add/change this line.
        // new NavigationReactPackage(),
        new RNFirebasePackage(), new RNFirebaseNotificationsPackage(), new RCTPdfView(), new RNFetchBlobPackage(),
        // add these optional packages as appropriate
        // new RNFirebaseAdMobPackage(),
         new RNEventSourcePackage(), new RNFirebaseAnalyticsPackage(),
        new RNFirebaseAuthPackage(), new RNFirebaseRemoteConfigPackage(),
        // new RNFirebaseCrashPackage(),
        new RNFirebaseDatabasePackage(), new RNFirebaseMessagingPackage(), new RNFirebasePerformancePackage(),
        new RNFirebaseStoragePackage(), new BlurViewPackage(), new ReactNativeRestartPackage(), new LocalAuthPackage(),
        new MPAndroidChartPackage(), new ReactMaterialKitPackage(), new ReactNativeI18n(),
        new RNSharePackage(), new PickerViewPackage(), new RNDeviceInfo(), new ExtraDimensionsPackage(),
        new RNVersionCheckPackage(), new FingerprintPackage(), new ReactNativeExceptionHandlerPackage(),
        new OpenSettingsPackage(), new RNFirebaseCrashlyticsPackage());
  }
}
