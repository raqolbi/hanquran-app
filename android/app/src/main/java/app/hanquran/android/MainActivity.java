package app.hanquran.android;

import android.Manifest;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.webkit.WebView;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  private static final int REQ_POST_NOTIFICATIONS = 1001;

  @Override
  public void onCreate(Bundle savedInstanceState) {
    boolean debuggable =
        (getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0;
    if (debuggable) {
      WebView.setWebContentsDebuggingEnabled(true);
    }
    super.onCreate(savedInstanceState);
    maybeRequestNotificationPermission();
  }

  /** Diperlukan Android 13+ agar notifikasi Media Session / FGS tampil. */
  private void maybeRequestNotificationPermission() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) {
      return;
    }
    if (
      ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) ==
      PackageManager.PERMISSION_GRANTED
    ) {
      return;
    }
    ActivityCompat.requestPermissions(
      this,
      new String[] { Manifest.permission.POST_NOTIFICATIONS },
      REQ_POST_NOTIFICATIONS
    );
  }
}
