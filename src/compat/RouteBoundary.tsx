import { Component, type ReactNode } from "react";

// Catches a failed lazy chunk or a render error inside one route, so one broken screen shows a message instead of a blank app
// (INC-001: on iOS 15 a chunk that fails to parse used to leave the whole screen white). React.lazy caches a rejected import,
// so the only reliable retry is a page reload.
export class RouteBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (!this.state.failed) return this.props.children;
    return <div className="mcy-route-failed" role="alert">
      <strong>Chưa mở được phần này.</strong>
      <p>Kết nối có thể chưa ổn định, hoặc trình duyệt / phiên bản iOS của bạn còn quá cũ so với phần này. Bạn vẫn có thể quay lại và dùng các phần khác.</p>
      <button type="button" onClick={() => window.location.reload()}>Tải lại ứng dụng</button>
    </div>;
  }
}
