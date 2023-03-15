/******/ (function() { // webpackBootstrap
var __webpack_exports__ = {};
/*!**************************!*\
  !*** ./source/worker.js ***!
  \**************************/
/* global chrome, browser */
var SAT_VERSION = chrome.runtime.getManifest().version;
var add_intel_plugin = function () {
    var s = document.createElement("script");
    s.src = chrome.runtime.getURL("intel.js");
    s.id = "intel";
    s.title = "Stoned Ape Tools v".concat(chrome.runtime.getManifest().version);
    s.onload = function () {
        this.remove();
    };
    (document.head || document.documentElement).appendChild(s);
    console.log("".concat(s.title, " background page."));
};
var isFirefox = navigator.userAgent.toLowerCase().indexOf("firefox") > -1;
if (isFirefox) {
    console.log("working on Firefox");
    browser.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
        if (tab.active) {
            browser.scripting
                .executeScript({
                target: { tabId: tabId },
                func: add_intel_plugin,
            })
                .catch(console.log);
        }
    });
}
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (changeInfo.status === "complete" && tab.active) {
        chrome.scripting
            .executeScript({
            target: { tabId: tabId },
            func: add_intel_plugin,
        })
            .catch(console.log);
    }
});

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2VyLmpzIiwibWFwcGluZ3MiOiI7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBCQUEwQixjQUFjO0FBQ3hDO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNCQUFzQixjQUFjO0FBQ3BDO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vbmVwdHVuZXMtcHJpZGUtYWdlbnQvLi9zb3VyY2Uvd29ya2VyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qIGdsb2JhbCBjaHJvbWUsIGJyb3dzZXIgKi9cbnZhciBTQVRfVkVSU0lPTiA9IGNocm9tZS5ydW50aW1lLmdldE1hbmlmZXN0KCkudmVyc2lvbjtcbnZhciBhZGRfaW50ZWxfcGx1Z2luID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNjcmlwdFwiKTtcbiAgICBzLnNyYyA9IGNocm9tZS5ydW50aW1lLmdldFVSTChcImludGVsLmpzXCIpO1xuICAgIHMuaWQgPSBcImludGVsXCI7XG4gICAgcy50aXRsZSA9IFwiU3RvbmVkIEFwZSBUb29scyB2XCIuY29uY2F0KGNocm9tZS5ydW50aW1lLmdldE1hbmlmZXN0KCkudmVyc2lvbik7XG4gICAgcy5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlKCk7XG4gICAgfTtcbiAgICAoZG9jdW1lbnQuaGVhZCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQpLmFwcGVuZENoaWxkKHMpO1xuICAgIGNvbnNvbGUubG9nKFwiXCIuY29uY2F0KHMudGl0bGUsIFwiIGJhY2tncm91bmQgcGFnZS5cIikpO1xufTtcbnZhciBpc0ZpcmVmb3ggPSBuYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKCkuaW5kZXhPZihcImZpcmVmb3hcIikgPiAtMTtcbmlmIChpc0ZpcmVmb3gpIHtcbiAgICBjb25zb2xlLmxvZyhcIndvcmtpbmcgb24gRmlyZWZveFwiKTtcbiAgICBicm93c2VyLnRhYnMub25VcGRhdGVkLmFkZExpc3RlbmVyKGZ1bmN0aW9uICh0YWJJZCwgY2hhbmdlSW5mbywgdGFiKSB7XG4gICAgICAgIGlmICh0YWIuYWN0aXZlKSB7XG4gICAgICAgICAgICBicm93c2VyLnNjcmlwdGluZ1xuICAgICAgICAgICAgICAgIC5leGVjdXRlU2NyaXB0KHtcbiAgICAgICAgICAgICAgICB0YXJnZXQ6IHsgdGFiSWQ6IHRhYklkIH0sXG4gICAgICAgICAgICAgICAgZnVuYzogYWRkX2ludGVsX3BsdWdpbixcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmNhdGNoKGNvbnNvbGUubG9nKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuY2hyb21lLnRhYnMub25VcGRhdGVkLmFkZExpc3RlbmVyKGZ1bmN0aW9uICh0YWJJZCwgY2hhbmdlSW5mbywgdGFiKSB7XG4gICAgaWYgKGNoYW5nZUluZm8uc3RhdHVzID09PSBcImNvbXBsZXRlXCIgJiYgdGFiLmFjdGl2ZSkge1xuICAgICAgICBjaHJvbWUuc2NyaXB0aW5nXG4gICAgICAgICAgICAuZXhlY3V0ZVNjcmlwdCh7XG4gICAgICAgICAgICB0YXJnZXQ6IHsgdGFiSWQ6IHRhYklkIH0sXG4gICAgICAgICAgICBmdW5jOiBhZGRfaW50ZWxfcGx1Z2luLFxuICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKGNvbnNvbGUubG9nKTtcbiAgICB9XG59KTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==