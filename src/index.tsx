import ReactDOM from "react-dom/client";
import "./App.css";
import App from "./App";
import LoadApp from "./components/LoadApp";
// import './locales/i18n' // 支持国际化
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <LoadApp>
    <App />
  </LoadApp>
);

// 检测浏览器是否原生支持 requestIdleCallback
if (!window.requestIdleCallback) {
  // 模拟 requestIdleCallback
  window.requestIdleCallback = function (callback, options) {
    // 配置超时时间（默认 50 毫秒，避免任务无限等待）
    const timeout = options?.timeout || 50;
    let start = Date.now();

    // 用 setTimeout 模拟空闲执行
    const id = setTimeout(() => {
      // 模拟 IdleDeadline 对象
      const deadline = {
        // 剩余时间：假设最大空闲时间为 50 毫秒，减去已过去的时间
        timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
        // 是否因超时执行（如果当前时间超过 start + timeout，则视为超时）
        didTimeout: Date.now() - start >= timeout,
      };
      callback(deadline);
    }, 0); // 延迟 0 毫秒，让浏览器先处理完同步任务

    // 返回一个可用于取消的 ID
    return id;
  };

  // 模拟 cancelIdleCallback（用于取消任务）
  window.cancelIdleCallback = function (id) {
    clearTimeout(id);
  };
}
