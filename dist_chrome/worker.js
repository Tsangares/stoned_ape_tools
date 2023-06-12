/******/ (function() { // webpackBootstrap
var __webpack_exports__ = {};
/*!**************************!*\
  !*** ./source/worker.js ***!
  \**************************/
/* global chrome, browser */
//const SAT_VERSION = chrome.runtime.getManifest().version;
console.log("Stoned Ape Tools worker started loading...");
const add_intel_plugin = () => {
    var s = document.createElement("script");
    s.src = chrome.runtime.getURL("intel.js");
    s.setAttribute("images", chrome.runtime.getURL("images/"));
    s.id = "ape-intel-plugin";
    s.title = `Stoned Ape Tools v${chrome.runtime.getManifest().version}`;
    s.setAttribute("version", chrome.runtime.getManifest().version);
    s.onload = function () {
        //s.trigger('ape:plugin:loaded',s.title);
        //this.remove();
    };
    (document.head || document.documentElement).appendChild(s);
    console.log(`${s.title} worker loading...`);
};
var isFirefox = navigator.userAgent.toLowerCase().indexOf("firefox") > -1;
if (isFirefox) {
    console.log("Firefox worker running");
    browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
        if (changeInfo.status === "complete" && tab.active) {
            browser.scripting
                .executeScript({
                target: { tabId: tabId },
                func: add_intel_plugin,
            })
                .catch(console.log);
        }
    });
}
else {
    console.log("Chrome worker running");
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
        if (changeInfo.status === "complete" && tab.active) {
            chrome.scripting
                .executeScript({
                target: { tabId: tabId },
                func: add_intel_plugin,
            })
                .catch(console.log);
        }
    });
}

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2VyLmpzIiwibWFwcGluZ3MiOiI7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1DQUFtQyxxQ0FBcUM7QUFDeEU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLFNBQVM7QUFDNUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBCQUEwQixjQUFjO0FBQ3hDO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwQkFBMEIsY0FBYztBQUN4QztBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0EsS0FBSztBQUNMIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vbmVwdHVuZXMtcHJpZGUtYWdlbnQvLi9zb3VyY2Uvd29ya2VyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qIGdsb2JhbCBjaHJvbWUsIGJyb3dzZXIgKi9cbi8vY29uc3QgU0FUX1ZFUlNJT04gPSBjaHJvbWUucnVudGltZS5nZXRNYW5pZmVzdCgpLnZlcnNpb247XG5jb25zb2xlLmxvZyhcIlN0b25lZCBBcGUgVG9vbHMgd29ya2VyIHN0YXJ0ZWQgbG9hZGluZy4uLlwiKTtcbmNvbnN0IGFkZF9pbnRlbF9wbHVnaW4gPSAoKSA9PiB7XG4gICAgdmFyIHMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic2NyaXB0XCIpO1xuICAgIHMuc3JjID0gY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKFwiaW50ZWwuanNcIik7XG4gICAgcy5zZXRBdHRyaWJ1dGUoXCJpbWFnZXNcIiwgY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKFwiaW1hZ2VzL1wiKSk7XG4gICAgcy5pZCA9IFwiYXBlLWludGVsLXBsdWdpblwiO1xuICAgIHMudGl0bGUgPSBgU3RvbmVkIEFwZSBUb29scyB2JHtjaHJvbWUucnVudGltZS5nZXRNYW5pZmVzdCgpLnZlcnNpb259YDtcbiAgICBzLnNldEF0dHJpYnV0ZShcInZlcnNpb25cIiwgY2hyb21lLnJ1bnRpbWUuZ2V0TWFuaWZlc3QoKS52ZXJzaW9uKTtcbiAgICBzLm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy9zLnRyaWdnZXIoJ2FwZTpwbHVnaW46bG9hZGVkJyxzLnRpdGxlKTtcbiAgICAgICAgLy90aGlzLnJlbW92ZSgpO1xuICAgIH07XG4gICAgKGRvY3VtZW50LmhlYWQgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KS5hcHBlbmRDaGlsZChzKTtcbiAgICBjb25zb2xlLmxvZyhgJHtzLnRpdGxlfSB3b3JrZXIgbG9hZGluZy4uLmApO1xufTtcbnZhciBpc0ZpcmVmb3ggPSBuYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKCkuaW5kZXhPZihcImZpcmVmb3hcIikgPiAtMTtcbmlmIChpc0ZpcmVmb3gpIHtcbiAgICBjb25zb2xlLmxvZyhcIkZpcmVmb3ggd29ya2VyIHJ1bm5pbmdcIik7XG4gICAgYnJvd3Nlci50YWJzLm9uVXBkYXRlZC5hZGRMaXN0ZW5lcigodGFiSWQsIGNoYW5nZUluZm8sIHRhYikgPT4ge1xuICAgICAgICBpZiAoY2hhbmdlSW5mby5zdGF0dXMgPT09IFwiY29tcGxldGVcIiAmJiB0YWIuYWN0aXZlKSB7XG4gICAgICAgICAgICBicm93c2VyLnNjcmlwdGluZ1xuICAgICAgICAgICAgICAgIC5leGVjdXRlU2NyaXB0KHtcbiAgICAgICAgICAgICAgICB0YXJnZXQ6IHsgdGFiSWQ6IHRhYklkIH0sXG4gICAgICAgICAgICAgICAgZnVuYzogYWRkX2ludGVsX3BsdWdpbixcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmNhdGNoKGNvbnNvbGUubG9nKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuZWxzZSB7XG4gICAgY29uc29sZS5sb2coXCJDaHJvbWUgd29ya2VyIHJ1bm5pbmdcIik7XG4gICAgY2hyb21lLnRhYnMub25VcGRhdGVkLmFkZExpc3RlbmVyKCh0YWJJZCwgY2hhbmdlSW5mbywgdGFiKSA9PiB7XG4gICAgICAgIGlmIChjaGFuZ2VJbmZvLnN0YXR1cyA9PT0gXCJjb21wbGV0ZVwiICYmIHRhYi5hY3RpdmUpIHtcbiAgICAgICAgICAgIGNocm9tZS5zY3JpcHRpbmdcbiAgICAgICAgICAgICAgICAuZXhlY3V0ZVNjcmlwdCh7XG4gICAgICAgICAgICAgICAgdGFyZ2V0OiB7IHRhYklkOiB0YWJJZCB9LFxuICAgICAgICAgICAgICAgIGZ1bmM6IGFkZF9pbnRlbF9wbHVnaW4sXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5jYXRjaChjb25zb2xlLmxvZyk7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==