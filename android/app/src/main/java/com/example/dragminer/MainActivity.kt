package com.example.dragminer

import android.os.Build
import android.os.Bundle
import android.webkit.JavascriptInterface
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import com.google.android.gms.games.PlayGames
import com.google.android.gms.games.snapshot.SnapshotMetadataChange

class MainActivity : AppCompatActivity() {
  private lateinit var webView: WebView
  private val signInClient by lazy { PlayGames.getGamesSignInClient(this) }
  private val snaps by lazy { PlayGames.getSnapshotsClient(this) }
  private val SLOT = "autosave"

  private val prefs by lazy { getSharedPreferences("pgs", MODE_PRIVATE) }
  // -1: first launch (ask), 0: don't use, 1: use
  private var optIn: Int
    get() = prefs.getInt("opt_in", -1)
    set(v) { prefs.edit().putInt("opt_in", v).apply() }

  @Volatile private var isLoggedIn = false

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    webView = WebView(this).apply {
      settings.javaScriptEnabled = true
      settings.domStorageEnabled = true
      settings.allowFileAccess = false
      settings.mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
      webViewClient = object : WebViewClient() { }
    }
    setContentView(webView)

    webView.addJavascriptInterface(Bridge(), "Native")

    if (optIn == -1) {
      AlertDialog.Builder(this)
        .setTitle("클라우드 저장")
        .setMessage("Google Play Games로 5초마다 자동 저장하시겠어요?")
        .setPositiveButton("사용") { _, _ ->
          optIn = 1
          silentSignIn()
        }
        .setNegativeButton("나중에") { _, _ ->
          optIn = 0
          notifyPgsStatus()
        }
        .setCancelable(false)
        .show()
    } else if (optIn == 1) {
      silentSignIn()
    } else {
      notifyPgsStatus()
    }

    webView.loadUrl("https://bbibbubbang.github.io/dragminer/")
  }

  private fun silentSignIn() {
    signInClient.isAuthenticated.addOnCompleteListener { t ->
      val authed = t.isSuccessful && (t.result.isAuthenticated == true)
      if (authed) {
        isLoggedIn = true
        notifyPgsStatus()
      } else {
        signInClient.signInSilently().addOnSuccessListener {
          isLoggedIn = true; notifyPgsStatus()
        }.addOnFailureListener {
          isLoggedIn = false; notifyPgsStatus()
        }
      }
    }
  }

  private fun interactiveSignIn() {
    signInClient.signIn().addOnSuccessListener {
      isLoggedIn = true; notifyPgsStatus()
    }.addOnFailureListener {
      isLoggedIn = false; notifyPgsStatus()
    }
  }

  private fun notifyPgsStatus() {
    evalJS("window.__pgsStatus && window.__pgsStatus(${isLoggedIn}, ${optIn})")
  }

  private fun saveJson(json: String) {
    if (!isLoggedIn || optIn != 1) return
    snaps.open(SLOT, true).continueWithTask { open ->
      val snap = open.result.data
      snap.snapshotContents.writeBytes(json.toByteArray(Charsets.UTF_8))
      val meta = SnapshotMetadataChange.Builder()
        .setDescription("Auto-saved")
        .build()
      snaps.commitAndClose(snap, meta)
    }.addOnSuccessListener {
      evalJS("window.onSaveResult && window.onSaveResult(true)")
    }.addOnFailureListener {
      evalJS("window.onSaveResult && window.onSaveResult(false)")
    }
  }

  private fun loadJson() {
    if (!isLoggedIn || optIn != 1) {
      evalJS("window.onGameLoaded && window.onGameLoaded(null)")
      return
    }
    snaps.open(SLOT, true).addOnSuccessListener { open ->
      val bytes = open.data.snapshotContents.readFully()
      snaps.discardAndClose(open.data)
      val txt = bytes?.toString(Charsets.UTF_8)?.replace("\\", "\\\\")?.replace("`","\\`")
      evalJS("window.onGameLoaded && window.onGameLoaded(${ if (txt!=null) "`$txt`" else "null" })")
    }.addOnFailureListener {
      evalJS("window.onGameLoaded && window.onGameLoaded(null)")
    }
  }

  private fun evalJS(js: String) {
    if (Build.VERSION.SDK_INT >= 19) webView.evaluateJavascript(js, null)
    else webView.loadUrl("javascript:$js")
  }

  inner class Bridge {
    @JavascriptInterface fun queryPgsStatus() = notifyPgsStatus()
    @JavascriptInterface fun setPgsOptIn(use: Int) {
      val v = if (use == 1) 1 else 0
      optIn = v
      if (v == 1 && !isLoggedIn) silentSignIn()
      notifyPgsStatus()
    }
    @JavascriptInterface fun signInPgs() = interactiveSignIn()
    @JavascriptInterface fun saveState(json: String) = saveJson(json)
    @JavascriptInterface fun loadState() = loadJson()
  }
}
