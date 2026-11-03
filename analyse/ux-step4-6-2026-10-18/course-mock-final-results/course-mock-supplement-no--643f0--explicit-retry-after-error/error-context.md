# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: course-mock-supplement.spec.ts >> no-draft onboarding accurately labels profile saving and preserves explicit retry after error
- Location: ..\..\..\.vercel\ux-step4-6-20261018\tests\ux-save-feedback.spec.ts:194:1

# Error details

```
Error: browserType.launch: Target page, context or browser has been closed
Browser logs:

<launching> C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe --disable-field-trial-config --disable-background-networking --disable-background-timer-throttling --disable-backgrounding-occluded-windows --disable-back-forward-cache --disable-breakpad --disable-client-side-phishing-detection --disable-component-extensions-with-background-pages --disable-component-update --no-default-browser-check --disable-default-apps --disable-dev-shm-usage --disable-edgeupdater --disable-extensions --disable-features=AvoidUnnecessaryBeforeUnloadCheckSync,BoundaryEventDispatchTracksNodeRemoval,DestroyProfileOnBrowserClose,DialMediaRouteProvider,GlobalMediaControls,HttpsUpgrades,LensOverlay,MediaRouter,PaintHolding,ThirdPartyStoragePartitioning,Translate,AutoDeElevate,RenderDocument,OptimizationHints,msForceBrowserSignIn,msEdgeUpdateLaunchServicesPreferredVersion --enable-features=CDPScreenshotNewSurface --allow-pre-commit-input --disable-hang-monitor --disable-ipc-flooding-protection --disable-popup-blocking --disable-prompt-on-repost --disable-renderer-backgrounding --force-color-profile=srgb --metrics-recording-only --no-first-run --password-store=basic --use-mock-keychain --no-service-autorun --export-tagged-pdf --disable-search-engine-choice-screen --unsafely-disable-devtools-self-xss-warnings --edge-skip-compat-layer-relaunch --disable-infobars --disable-search-engine-choice-screen --disable-sync --enable-unsafe-swiftshader --headless --hide-scrollbars --mute-audio --blink-settings=primaryHoverType=2,availableHoverTypes=2,primaryPointerType=4,availablePointerTypes=4 --no-sandbox --proxy-server=http://127.0.0.1:9 --proxy-bypass-list=127.0.0.1;localhost --user-data-dir=C:\Users\Admin\AppData\Local\Packages\sandbox.{7fcd5f9a-28ab-4667-b81d-4ee363d68be7}\AC\Temp\playwright_chromiumdev_profile-SzJyWz --remote-debugging-pipe --no-startup-window
<launched> pid=8940
[pid=8940][err] [1018/013400.784:ERROR:third_party\crashpad\crashpad\util\win\registration_protocol_win.cc:136] TransactNamedPipe: The pipe has been ended. (0x6D)
[pid=8940][err] [8940:16024:1018/013412.693:ERROR:chrome\browser\edge_dual_engine\dual_engine_sitelist_win.cc:1054] The temporary parsed site list JSON data failed to replace the permanent file. path = C:\Users\Admin\AppData\Local\Packages\sandbox.{7fcd5f9a-28ab-4667-b81d-4ee363d68be7}\AC\Temp\playwright_chromiumdev_profile-SzJyWz\Default\DualEngine\SiteList-Enterprise.json temp_path = C:\Users\Admin\AppData\Local\Packages\sandbox.{7fcd5f9a-28ab-4667-b81d-4ee363d68be7}\AC\Temp\playwright_chromiumdev_profile-SzJyWz\Default\DualEngine\f5d27b86-c2fa-4e32-ae17-ed084b9c9ab9.tmp error = -5
[pid=8940][err] [8940:16024:1018/013412.705:ERROR:chrome\browser\edge_dual_engine\dual_engine_sitelist_win.cc:1054] The temporary parsed site list JSON data failed to replace the permanent file. path = C:\Users\Admin\AppData\Local\Packages\sandbox.{7fcd5f9a-28ab-4667-b81d-4ee363d68be7}\AC\Temp\playwright_chromiumdev_profile-SzJyWz\Default\DualEngine\SiteList-Consumer.json temp_path = C:\Users\Admin\AppData\Local\Packages\sandbox.{7fcd5f9a-28ab-4667-b81d-4ee363d68be7}\AC\Temp\playwright_chromiumdev_profile-SzJyWz\Default\DualEngine\8431421d-eaf6-40bd-8482-e2c3585a6546.tmp error = -5
Call log:
  - <launching> C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe --disable-field-trial-config --disable-background-networking --disable-background-timer-throttling --disable-backgrounding-occluded-windows --disable-back-forward-cache --disable-breakpad --disable-client-side-phishing-detection --disable-component-extensions-with-background-pages --disable-component-update --no-default-browser-check --disable-default-apps --disable-dev-shm-usage --disable-edgeupdater --disable-extensions --disable-features=AvoidUnnecessaryBeforeUnloadCheckSync,BoundaryEventDispatchTracksNodeRemoval,DestroyProfileOnBrowserClose,DialMediaRouteProvider,GlobalMediaControls,HttpsUpgrades,LensOverlay,MediaRouter,PaintHolding,ThirdPartyStoragePartitioning,Translate,AutoDeElevate,RenderDocument,OptimizationHints,msForceBrowserSignIn,msEdgeUpdateLaunchServicesPreferredVersion --enable-features=CDPScreenshotNewSurface --allow-pre-commit-input --disable-hang-monitor --disable-ipc-flooding-protection --disable-popup-blocking --disable-prompt-on-repost --disable-renderer-backgrounding --force-color-profile=srgb --metrics-recording-only --no-first-run --password-store=basic --use-mock-keychain --no-service-autorun --export-tagged-pdf --disable-search-engine-choice-screen --unsafely-disable-devtools-self-xss-warnings --edge-skip-compat-layer-relaunch --disable-infobars --disable-search-engine-choice-screen --disable-sync --enable-unsafe-swiftshader --headless --hide-scrollbars --mute-audio --blink-settings=primaryHoverType=2,availableHoverTypes=2,primaryPointerType=4,availablePointerTypes=4 --no-sandbox --proxy-server=http://127.0.0.1:9 --proxy-bypass-list=127.0.0.1;localhost --user-data-dir=C:\Users\Admin\AppData\Local\Packages\sandbox.{7fcd5f9a-28ab-4667-b81d-4ee363d68be7}\AC\Temp\playwright_chromiumdev_profile-SzJyWz --remote-debugging-pipe --no-startup-window
  - <launched> pid=8940
  - [pid=8940][err] [1018/013400.784:ERROR:third_party\crashpad\crashpad\util\win\registration_protocol_win.cc:136] TransactNamedPipe: The pipe has been ended. (0x6D)
  - [pid=8940][err] [8940:16024:1018/013412.693:ERROR:chrome\browser\edge_dual_engine\dual_engine_sitelist_win.cc:1054] The temporary parsed site list JSON data failed to replace the permanent file. path = C:\Users\Admin\AppData\Local\Packages\sandbox.{7fcd5f9a-28ab-4667-b81d-4ee363d68be7}\AC\Temp\playwright_chromiumdev_profile-SzJyWz\Default\DualEngine\SiteList-Enterprise.json temp_path = C:\Users\Admin\AppData\Local\Packages\sandbox.{7fcd5f9a-28ab-4667-b81d-4ee363d68be7}\AC\Temp\playwright_chromiumdev_profile-SzJyWz\Default\DualEngine\f5d27b86-c2fa-4e32-ae17-ed084b9c9ab9.tmp error = -5
  - [pid=8940][err] [8940:16024:1018/013412.705:ERROR:chrome\browser\edge_dual_engine\dual_engine_sitelist_win.cc:1054] The temporary parsed site list JSON data failed to replace the permanent file. path = C:\Users\Admin\AppData\Local\Packages\sandbox.{7fcd5f9a-28ab-4667-b81d-4ee363d68be7}\AC\Temp\playwright_chromiumdev_profile-SzJyWz\Default\DualEngine\SiteList-Consumer.json temp_path = C:\Users\Admin\AppData\Local\Packages\sandbox.{7fcd5f9a-28ab-4667-b81d-4ee363d68be7}\AC\Temp\playwright_chromiumdev_profile-SzJyWz\Default\DualEngine\8431421d-eaf6-40bd-8482-e2c3585a6546.tmp error = -5
  - [pid=8940] <gracefully close start>
  - [pid=8940] <kill>
  - [pid=8940] <will force kill>
  - [pid=8940] taskkill stderr: ERROR: The user name or password is incorrect.
  - [pid=8940] <process did exit: exitCode=0, signal=null>
  - [pid=8940] starting temporary directories cleanup
  - [pid=8940] finished temporary directories cleanup
  - [pid=8940] <gracefully close end>

```