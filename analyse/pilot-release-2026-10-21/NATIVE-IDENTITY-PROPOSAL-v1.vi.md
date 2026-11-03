# Định danh Android pilot — đề xuất riêng, chưa áp dụng

Sau common web build, đề xuất sửa đúng hai tệp trong managedtree mới; không chặn dependency/web build và không sửa D-root. Giữ `com.nilaza.motchutyoga.mcydebug`, callback `motchutyoga-mcydebug`, signing identity và versionCode1. Chỉ parallel đổi versionNameSuffix thành `-mcydebug-pilot20261021`; launcher title VI/default `Một chút yoga (Pilot 21/10)`, EN `A Little Yoga (Pilot 21 Oct)`.

versionCode1 được giữ có chủ ý để tránh thêm API cấu hình variant và mở rộng thay đổi build. Phiên bản test mới được nhận diện bằng launcher label, versionName `1.0-mcydebug-pilot20261021` và exact APK SHA/manifest; versionCode tự nó không phân biệt bản cũ/mới. Không coi hash hoặc tên mới là native restore/data acceptance. Cài đặt chỉ thuộc packet mới sau QC/Owner decision; không chạy installer hiện có tự shell-launch.

| File trong managedtree | Delta được đề xuất |
|---|---|
| `android/app/build.gradle` | Trong `parallel` duy nhất: suffix và hai resValue app_name/title_activity_main như trên; `debug`/`release`/defaultConfig không đổi |
| `android/app/src/parallel/res/values-en/strings.xml` | Hai string EN đổi thành Pilot21Oct; debug overlay và main resources giữ nguyên |

Trước áp dụng cần QC scoped diff/root GO. Sau áp dụng: lưu preimages, phát native source freeze mới và native invocation control binding mới; frontend/source build web giữ cùng bytes, không rebuild web vì chỉ native packaging identity đổi. APK metadata/manifest phải xác nhận package/scheme/cert, versionCode1/versionName/labels mới; root APK/debug/.debug/release output hashes và timestamps giữ nguyên. Các checks native/package chưa chạy.
