# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: course-mock-supplement.spec.ts >> Regional entries survive collapse, return and cancelled replacement; confirm clears
- Location: ..\..\..\.vercel\ux-step4-6-20261018\tests\ux-checkin-layout.spec.ts:19:1

# Error details

```
Error: browserType.launch: Target page, context or browser has been closed
Browser logs:

<launching> C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe --disable-field-trial-config --disable-background-networking --disable-background-timer-throttling --disable-backgrounding-occluded-windows --disable-back-forward-cache --disable-breakpad --disable-client-side-phishing-detection --disable-component-extensions-with-background-pages --disable-component-update --no-default-browser-check --disable-default-apps --disable-dev-shm-usage --disable-edgeupdater --disable-extensions --disable-features=AvoidUnnecessaryBeforeUnloadCheckSync,BoundaryEventDispatchTracksNodeRemoval,DestroyProfileOnBrowserClose,DialMediaRouteProvider,GlobalMediaControls,HttpsUpgrades,LensOverlay,MediaRouter,PaintHolding,ThirdPartyStoragePartitioning,Translate,AutoDeElevate,RenderDocument,OptimizationHints,msForceBrowserSignIn,msEdgeUpdateLaunchServicesPreferredVersion --enable-features=CDPScreenshotNewSurface --allow-pre-commit-input --disable-hang-monitor --disable-ipc-flooding-protection --disable-popup-blocking --disable-prompt-on-repost --disable-renderer-backgrounding --force-color-profile=srgb --metrics-recording-only --no-first-run --password-store=basic --use-mock-keychain --no-service-autorun --export-tagged-pdf --disable-search-engine-choice-screen --unsafely-disable-devtools-self-xss-warnings --edge-skip-compat-layer-relaunch --disable-infobars --disable-search-engine-choice-screen --disable-sync --enable-unsafe-swiftshader --headless --hide-scrollbars --mute-audio --blink-settings=primaryHoverType=2,availableHoverTypes=2,primaryPointerType=4,availablePointerTypes=4 --no-sandbox --proxy-server=http://127.0.0.1:9 --proxy-bypass-list=127.0.0.1;localhost --user-data-dir=C:\Users\Admin\AppData\Local\Packages\sandbox.{7fcd5f9a-28ab-4667-b81d-4ee363d68be7}\AC\Temp\playwright_chromiumdev_profile-JomXE8 --remote-debugging-pipe --no-startup-window
<launched> pid=9352
[pid=9352][err] [1018/013239.493:ERROR:third_party\crashpad\crashpad\util\win\registration_protocol_win.cc:136] TransactNamedPipe: The pipe has been ended. (0x6D)
[pid=9352][err] [9352:21616:1018/013240.028:ERROR:chrome\browser\edge_dual_engine\dual_engine_sitelist_win.cc:1054] The temporary parsed site list JSON data failed to replace the permanent file. path = C:\Users\Admin\AppData\Local\Packages\sandbox.{7fcd5f9a-28ab-4667-b81d-4ee363d68be7}\AC\Temp\playwright_chromiumdev_profile-JomXE8\Default\DualEngine\SiteList-Enterprise.json temp_path = C:\Users\Admin\AppData\Local\Packages\sandbox.{7fcd5f9a-28ab-4667-b81d-4ee363d68be7}\AC\Temp\playwright_chromiumdev_profile-JomXE8\Default\DualEngine\90b241a2-9ae4-4258-a069-b99bc9e92a74.tmp error = -5
[pid=9352][err] [9352:21616:1018/013240.034:ERROR:chrome\browser\edge_dual_engine\dual_engine_sitelist_win.cc:1054] The temporary parsed site list JSON data failed to replace the permanent file. path = C:\Users\Admin\AppData\Local\Packages\sandbox.{7fcd5f9a-28ab-4667-b81d-4ee363d68be7}\AC\Temp\playwright_chromiumdev_profile-JomXE8\Default\DualEngine\SiteList-Consumer.json temp_path = C:\Users\Admin\AppData\Local\Packages\sandbox.{7fcd5f9a-28ab-4667-b81d-4ee363d68be7}\AC\Temp\playwright_chromiumdev_profile-JomXE8\Default\DualEngine\fdfc50b6-32c5-405d-9080-b68215941cc3.tmp error = -5
Call log:
  - <launching> C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe --disable-field-trial-config --disable-background-networking --disable-background-timer-throttling --disable-backgrounding-occluded-windows --disable-back-forward-cache --disable-breakpad --disable-client-side-phishing-detection --disable-component-extensions-with-background-pages --disable-component-update --no-default-browser-check --disable-default-apps --disable-dev-shm-usage --disable-edgeupdater --disable-extensions --disable-features=AvoidUnnecessaryBeforeUnloadCheckSync,BoundaryEventDispatchTracksNodeRemoval,DestroyProfileOnBrowserClose,DialMediaRouteProvider,GlobalMediaControls,HttpsUpgrades,LensOverlay,MediaRouter,PaintHolding,ThirdPartyStoragePartitioning,Translate,AutoDeElevate,RenderDocument,OptimizationHints,msForceBrowserSignIn,msEdgeUpdateLaunchServicesPreferredVersion --enable-features=CDPScreenshotNewSurface --allow-pre-commit-input --disable-hang-monitor --disable-ipc-flooding-protection --disable-popup-blocking --disable-prompt-on-repost --disable-renderer-backgrounding --force-color-profile=srgb --metrics-recording-only --no-first-run --password-store=basic --use-mock-keychain --no-service-autorun --export-tagged-pdf --disable-search-engine-choice-screen --unsafely-disable-devtools-self-xss-warnings --edge-skip-compat-layer-relaunch --disable-infobars --disable-search-engine-choice-screen --disable-sync --enable-unsafe-swiftshader --headless --hide-scrollbars --mute-audio --blink-settings=primaryHoverType=2,availableHoverTypes=2,primaryPointerType=4,availablePointerTypes=4 --no-sandbox --proxy-server=http://127.0.0.1:9 --proxy-bypass-list=127.0.0.1;localhost --user-data-dir=C:\Users\Admin\AppData\Local\Packages\sandbox.{7fcd5f9a-28ab-4667-b81d-4ee363d68be7}\AC\Temp\playwright_chromiumdev_profile-JomXE8 --remote-debugging-pipe --no-startup-window
  - <launched> pid=9352
  - [pid=9352][err] [1018/013239.493:ERROR:third_party\crashpad\crashpad\util\win\registration_protocol_win.cc:136] TransactNamedPipe: The pipe has been ended. (0x6D)
  - [pid=9352][err] [9352:21616:1018/013240.028:ERROR:chrome\browser\edge_dual_engine\dual_engine_sitelist_win.cc:1054] The temporary parsed site list JSON data failed to replace the permanent file. path = C:\Users\Admin\AppData\Local\Packages\sandbox.{7fcd5f9a-28ab-4667-b81d-4ee363d68be7}\AC\Temp\playwright_chromiumdev_profile-JomXE8\Default\DualEngine\SiteList-Enterprise.json temp_path = C:\Users\Admin\AppData\Local\Packages\sandbox.{7fcd5f9a-28ab-4667-b81d-4ee363d68be7}\AC\Temp\playwright_chromiumdev_profile-JomXE8\Default\DualEngine\90b241a2-9ae4-4258-a069-b99bc9e92a74.tmp error = -5
  - [pid=9352][err] [9352:21616:1018/013240.034:ERROR:chrome\browser\edge_dual_engine\dual_engine_sitelist_win.cc:1054] The temporary parsed site list JSON data failed to replace the permanent file. path = C:\Users\Admin\AppData\Local\Packages\sandbox.{7fcd5f9a-28ab-4667-b81d-4ee363d68be7}\AC\Temp\playwright_chromiumdev_profile-JomXE8\Default\DualEngine\SiteList-Consumer.json temp_path = C:\Users\Admin\AppData\Local\Packages\sandbox.{7fcd5f9a-28ab-4667-b81d-4ee363d68be7}\AC\Temp\playwright_chromiumdev_profile-JomXE8\Default\DualEngine\fdfc50b6-32c5-405d-9080-b68215941cc3.tmp error = -5
  - [pid=9352] <gracefully close start>
  - [pid=9352] <kill>
  - [pid=9352] <will force kill>
  - [pid=9352] taskkill stderr: ERROR: The user name or password is incorrect.
  - [pid=9352] <process did exit: exitCode=0, signal=null>
  - [pid=9352] starting temporary directories cleanup
  - [pid=9352] finished temporary directories cleanup
  - [pid=9352] <gracefully close end>

```