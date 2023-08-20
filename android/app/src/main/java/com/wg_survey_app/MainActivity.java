import android.os.Bundle;
import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactRootView;
import com.facebook.react.modules.core.DefaultHardwareBackBtnHandler;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import android.webkit.WebView;
import android.webkit.WebSettings;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactActivityDelegate;
import android.webkit.JavascriptInterface;
import java.io.IOException;
import android.content.Context;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.BufferedReader;
import android.os.Handler;
import android.os.Looper;


public class MainActivity extends ReactActivity {

  private WebView webView; // 웹뷰 객체 선언

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "wg_survey_app";
  }

  /**
   * Called on initial creation of the activity.
   */
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    webView = new WebView(this);

    WebSettings webSettings = webView.getSettings();
    webSettings.setJavaScriptEnabled(true); // JavaScript 활성화
    webSettings.setAllowUniversalAccessFromFileURLs(true);
    webSettings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
    webSettings.setAllowContentAccess(true);
    webSettings.setAllowFileAccess(true);

    // JavaScript 인터페이스를 추가하여 메시지 수신을 처리합니다.
   webView.addJavascriptInterface(new JavaScriptInterface(this), "AndroidInterface");
   webView.loadUrl("file:///android_asset/index.html");
   setContentView(webView);
  }

    public class JavaScriptInterface {
        private Context mContext;

        public JavaScriptInterface(Context context) {
            mContext = context;
        }

        @JavascriptInterface
        public void loadGeoJSON() {
            new Handler(Looper.getMainLooper()).post(new Runnable() {
                @Override
                public void run() {
                    try {
                        String geoJSONData = readLocalFileContents("geojson/N3P_H0020000.geojson");
                        String jsFunction = "loadGeoJSONFromAndroid('" + geoJSONData + "')";
                        webView.evaluateJavascript(jsFunction, null);
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                }
            });
        }

        private String readLocalFileContents(String fileName) throws IOException {
            StringBuilder contents = new StringBuilder();
            InputStream inputStream = null;
            BufferedReader reader = null;
            try {
                inputStream = mContext.getAssets().open(fileName);
                reader = new BufferedReader(new InputStreamReader(inputStream));
                String line;
                while ((line = reader.readLine()) != null) {
                    contents.append(line);
                }
            } catch (IOException e) {
                e.printStackTrace();
            } finally {
                if (reader != null) {
                    try {
                        reader.close();
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                }
                if (inputStream != null) {
                    try {
                        inputStream.close();
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                }
            }
            return contents.toString();
        }
    }

  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    return new DefaultReactActivityDelegate(
            this,
            getMainComponentName(),
            DefaultNewArchitectureEntryPoint.getFabricEnabled());
  }
}
