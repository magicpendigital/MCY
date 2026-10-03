package com.getcapacitor.myapp;

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import android.webkit.WebView;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.core.app.ActivityScenario;
import com.nilaza.motchutyoga.MainActivity;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;
import org.json.JSONObject;
import org.json.JSONTokener;
import org.junit.Test;
import org.junit.runner.RunWith;

@RunWith(AndroidJUnit4.class)
public final class MainActivityRenderTest {

    @Test
    public void nativeWelcomeRendersInEmbeddedWebView() throws Exception {
        CountDownLatch evaluated = new CountDownLatch(1);
        AtomicReference<String> pageState = new AtomicReference<>();
        AtomicReference<String> nativeState = new AtomicReference<>("unavailable");

        try (ActivityScenario<MainActivity> scenario = ActivityScenario.launch(MainActivity.class)) {
            Thread.sleep(8000);
            scenario.onActivity(activity -> {
                WebView webView = activity.getBridge().getWebView();
                nativeState.set("url=" + webView.getUrl()
                    + ", title=" + webView.getTitle()
                    + ", progress=" + webView.getProgress());
                webView.evaluateJavascript(
                    "JSON.stringify({title:document.title,readyState:document.readyState,hasWelcome:!!document.querySelector('.mcy-welcome'),bodyText:document.body.innerText.slice(0,200),rootHtml:document.getElementById('root')?.innerHTML.slice(0,250),scripts:[...document.scripts].map(s=>({src:s.src,type:s.type,async:s.async,defer:s.defer})),links:[...document.querySelectorAll('link')].map(l=>({rel:l.rel,href:l.href,loaded:!!l.sheet})),resources:performance.getEntriesByType('resource').map(r=>({path:new URL(r.name).pathname,type:r.initiatorType,ms:Math.round(r.duration),transfer:r.transferSize,decoded:r.decodedBodySize}))})",
                    result -> {
                        pageState.set(result);
                        evaluated.countDown();
                    });
            });

            assertTrue("WebView JavaScript did not respond; " + nativeState.get(),
                evaluated.await(20, TimeUnit.SECONDS));
            assertNotNull("WebView returned no page state; " + nativeState.get(), pageState.get());
            Object decoded = new JSONTokener(pageState.get()).nextValue();
            JSONObject page = decoded instanceof JSONObject
                ? (JSONObject) decoded
                : new JSONObject((String) decoded);
            assertTrue("Expected the welcome screen; native=" + nativeState.get() + ", page=" + page,
                page.optBoolean("hasWelcome")
                    && "complete".equals(page.optString("readyState"))
                    && page.optString("bodyText").contains("Một chút yoga"));
        }
    }
}
