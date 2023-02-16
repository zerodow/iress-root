package com.equix;

// Import opensetting module
import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.StringRequest;
import com.android.volley.toolbox.Volley;
import com.equix.systemsetting.*;

import android.app.Application;
import android.util.Log;
import androidx.annotation.NonNull;

import com.reactnativecommunity.webview.RNCWebViewPackage;

import com.facebook.react.ReactApplication;
import com.oblador.keychain.KeychainPackage;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import com.swmansion.reanimated.ReanimatedPackage;
import com.horcrux.svg.SvgPackage;
import com.reactnativecommunity.asyncstorage.AsyncStoragePackage;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.cmcewen.blurview.BlurViewPackage;
import com.avishayil.rnrestart.ReactNativeRestartPackage;
import com.masteratul.exceptionhandler.ReactNativeExceptionHandlerPackage;
import io.xogus.reactnative.versioncheck.RNVersionCheckPackage;
import com.github.jonnybgod.RNEventSource.RNEventSourcePackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.microsoft.codepush.react.ReactInstanceHolder;
import com.zmxv.RNSound.RNSoundPackage;
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

import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.reactnativenavigation.NavigationApplication;
import com.oblador.vectoricons.VectorIconsPackage;
import com.BV.LinearGradient.LinearGradientPackage;
import com.lugg.ReactNativeConfig.ReactNativeConfigPackage;
import com.facebook.soloader.SoLoader;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import ca.jaysoo.extradimensions.ExtraDimensionsPackage;

import com.facebook.react.uimanager.UIImplementationProvider;
import com.equix.CalendarUIImplementationProvider;

import io.invertase.firebase.fabric.crashlytics.RNFirebaseCrashlyticsPackage; // <-- Add this line
import com.oktareactnative.OktaSdkBridgePackage;
import com.reactcommunity.rndatetimepicker.RNDateTimePickerPackage;

// public class MainApplication extends Application implements ReactApplication {
public class MainApplication extends NavigationApplication implements ShareApplication ,ReactInstanceHolder{

    public static String url = "https://om-prod1-services.equixapp.com/v1/log";
  // private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {

    protected UIImplementationProvider getUIImplementationProvider() {
        return new CalendarUIImplementationProvider();
    }

    @Override
    public String getJSBundleFile() {
      return CodePush.getJSBundleFile();
    }

    @Override
    public String getFileProviderAuthority() {
      return "com.quantedge.equixnext.provider";
    }

  @Override
  public boolean isDebug() {
    return BuildConfig.DEBUG;
  }

  @NonNull
  @Override
  public List<ReactPackage> createAdditionalReactPackages() {
    // Add the packages you require here.
    // No need to add RnnPackage and MainReactPackage
    return Arrays.<ReactPackage>asList(
      new OktaSdkBridgePackage(),
      new RNGestureHandlerPackage(),
      new ReanimatedPackage(),
      new SvgPackage(),
      new VectorIconsPackage(),
      new LinearGradientPackage(),
      new ReactNativeConfigPackage(),
      new SplashScreenReactPackage(),
      new RNSoundPackage(),
      new CodePush(BuildConfig.CODEPUSH_KEY, MainApplication.this, BuildConfig.DEBUG), // Add/change this line.
      // new NavigationReactPackage(),
      new RNFirebasePackage(),
      new RNFirebaseNotificationsPackage(),
      new RNFetchBlobPackage(),
        // add these optional packages as appropriate
      // new RNFirebaseAdMobPackage(),
      new RNEventSourcePackage(),
      new RNFirebaseAnalyticsPackage(),
      new RNFirebaseAuthPackage(),
      new RNFirebaseRemoteConfigPackage(),
      // new RNFirebaseCrashPackage(),
      new RNFirebaseDatabasePackage(),
      new RNFirebaseMessagingPackage(),
      new RNFirebasePerformancePackage(),
      new RNFirebaseStoragePackage(),
      new BlurViewPackage(),
      new ReactNativeRestartPackage(),
      // new LocalAuthPackage(),
      new MPAndroidChartPackage(),
      new ReactMaterialKitPackage(),
      new ReactNativeI18n(),
      new RNSharePackage(),
      new PickerViewPackage(),
      new RNDeviceInfo(),
      new ExtraDimensionsPackage(),
      new RNVersionCheckPackage(),
      new ReactNativeExceptionHandlerPackage(),
      new OpenSettingsPackage(),
      new RNFirebaseCrashlyticsPackage(),
      new AsyncStoragePackage(),
      new RNCWebViewPackage(),
      new DetectNavigationBarPackage(),
      new TextInputAvoidKeyBoardPackage(),
      new KeychainPackage(),
      new RNDateTimePickerPackage()
    );
  }

  @Override
  public void onCreate() {
    super.onCreate();
    // Reprint.initialize(this);
    SoLoader.init(this, /* native exopackage */ false);

    //flipper
    // if (BuildConfig.DEBUG && FlipperUtils.shouldEnableFlipper(this)) {
    //   final FlipperClient client = AndroidFlipperClient.getInstance(this);
    //   final NetworkFlipperPlugin networkPlugin = new NetworkFlipperPlugin();

    //   client.addPlugin(new InspectorFlipperPlugin(this, DescriptorMapping.withDefaults()));
    //   client.addPlugin(networkPlugin);
    //   client.addPlugin(new LeakCanaryFlipperPlugin());
    //   RefWatcher refWatcher = LeakCanary.refWatcher(this)
    //     .listenerServiceClass(RecordLeakService.class)
    //     .buildAndInstall();

    //   client.addPlugin(CrashReporterPlugin.getInstance());

    //   client.start();
    // }

  }

  @Override
  public String getJSMainModuleName() {
    sendPostRequest(url, "==== NATIVE ANDROID - getJSMainModuleName ");
    return "index.android";
  }

  @Override
  public ReactInstanceManager getReactInstanceManager() {
    // CodePush must be told how to find React Native instance
    sendPostRequest(url, "==== NATIVE ANDROID - getReactInstanceManager ");
    return getReactNativeHost().getReactInstanceManager();
  }

  public  void sendPostRequest(String url, final String payload) {
    try {
      RequestQueue queue = Volley.newRequestQueue(this);
      StringRequest postRequest = new StringRequest(Request.Method.POST, url,
              new Response.Listener<String>() {
                @Override
                public void onResponse(String response) {
                  // response
                  Log.d("Response", response);
                }
              },
              new Response.ErrorListener() {
                @Override
                public void onErrorResponse(VolleyError error) {
                  // error
                  Log.d("Error.Response", "That didn't work!'");
                }
              }
      ) {
        @Override
        protected Map<String, String> getParams() {
          Map<String, String> params = new HashMap<String, String>();
          params.put("text", payload);
          return params;
        }
      };
      queue.add(postRequest);
    } catch (Exception e) {
      Log.d("Error", "Can not post!'");
    }
  }
}
