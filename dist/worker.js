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
    s.setAttribute("images", chrome.runtime.getURL("images/"));
    s.id = "ape-intel-plugin";
    s.title = "Stoned Ape Tools v".concat(chrome.runtime.getManifest().version);
    s.onload = function () {
        //s.trigger('ape:plugin:loaded',s.title);
        //this.remove();
    };
    (document.head || document.documentElement).appendChild(s);
    console.log("".concat(s.title, " worker loading..."));
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2VyLmpzIiwibWFwcGluZ3MiOiI7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwQkFBMEIsY0FBYztBQUN4QztBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0IsY0FBYztBQUNwQztBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL25lcHR1bmVzLXByaWRlLWFnZW50Ly4vc291cmNlL3dvcmtlci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiBnbG9iYWwgY2hyb21lLCBicm93c2VyICovXG52YXIgU0FUX1ZFUlNJT04gPSBjaHJvbWUucnVudGltZS5nZXRNYW5pZmVzdCgpLnZlcnNpb247XG52YXIgYWRkX2ludGVsX3BsdWdpbiA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzY3JpcHRcIik7XG4gICAgcy5zcmMgPSBjaHJvbWUucnVudGltZS5nZXRVUkwoXCJpbnRlbC5qc1wiKTtcbiAgICBzLnNldEF0dHJpYnV0ZShcImltYWdlc1wiLCBjaHJvbWUucnVudGltZS5nZXRVUkwoXCJpbWFnZXMvXCIpKTtcbiAgICBzLmlkID0gXCJhcGUtaW50ZWwtcGx1Z2luXCI7XG4gICAgcy50aXRsZSA9IFwiU3RvbmVkIEFwZSBUb29scyB2XCIuY29uY2F0KGNocm9tZS5ydW50aW1lLmdldE1hbmlmZXN0KCkudmVyc2lvbik7XG4gICAgcy5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vcy50cmlnZ2VyKCdhcGU6cGx1Z2luOmxvYWRlZCcscy50aXRsZSk7XG4gICAgICAgIC8vdGhpcy5yZW1vdmUoKTtcbiAgICB9O1xuICAgIChkb2N1bWVudC5oZWFkIHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCkuYXBwZW5kQ2hpbGQocyk7XG4gICAgY29uc29sZS5sb2coXCJcIi5jb25jYXQocy50aXRsZSwgXCIgd29ya2VyIGxvYWRpbmcuLi5cIikpO1xufTtcbnZhciBpc0ZpcmVmb3ggPSBuYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKCkuaW5kZXhPZihcImZpcmVmb3hcIikgPiAtMTtcbmlmIChpc0ZpcmVmb3gpIHtcbiAgICBjb25zb2xlLmxvZyhcIndvcmtpbmcgb24gRmlyZWZveFwiKTtcbiAgICBicm93c2VyLnRhYnMub25VcGRhdGVkLmFkZExpc3RlbmVyKGZ1bmN0aW9uICh0YWJJZCwgY2hhbmdlSW5mbywgdGFiKSB7XG4gICAgICAgIGlmICh0YWIuYWN0aXZlKSB7XG4gICAgICAgICAgICBicm93c2VyLnNjcmlwdGluZ1xuICAgICAgICAgICAgICAgIC5leGVjdXRlU2NyaXB0KHtcbiAgICAgICAgICAgICAgICB0YXJnZXQ6IHsgdGFiSWQ6IHRhYklkIH0sXG4gICAgICAgICAgICAgICAgZnVuYzogYWRkX2ludGVsX3BsdWdpbixcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmNhdGNoKGNvbnNvbGUubG9nKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuY2hyb21lLnRhYnMub25VcGRhdGVkLmFkZExpc3RlbmVyKGZ1bmN0aW9uICh0YWJJZCwgY2hhbmdlSW5mbywgdGFiKSB7XG4gICAgaWYgKGNoYW5nZUluZm8uc3RhdHVzID09PSBcImNvbXBsZXRlXCIgJiYgdGFiLmFjdGl2ZSkge1xuICAgICAgICBjaHJvbWUuc2NyaXB0aW5nXG4gICAgICAgICAgICAuZXhlY3V0ZVNjcmlwdCh7XG4gICAgICAgICAgICB0YXJnZXQ6IHsgdGFiSWQ6IHRhYklkIH0sXG4gICAgICAgICAgICBmdW5jOiBhZGRfaW50ZWxfcGx1Z2luLFxuICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKGNvbnNvbGUubG9nKTtcbiAgICB9XG59KTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==