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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2VyLmpzIiwibWFwcGluZ3MiOiI7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwQkFBMEIsY0FBYztBQUN4QztBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0IsY0FBYztBQUNwQztBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL25lcHR1bmVzLXByaWRlLWFnZW50Ly4vc291cmNlL3dvcmtlci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiBnbG9iYWwgY2hyb21lLCBicm93c2VyICovXG52YXIgU0FUX1ZFUlNJT04gPSBjaHJvbWUucnVudGltZS5nZXRNYW5pZmVzdCgpLnZlcnNpb247XG52YXIgYWRkX2ludGVsX3BsdWdpbiA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzY3JpcHRcIik7XG4gICAgcy5zcmMgPSBjaHJvbWUucnVudGltZS5nZXRVUkwoXCJpbnRlbC5qc1wiKTtcbiAgICBzLnNldEF0dHJpYnV0ZShcImltYWdlc1wiLCBjaHJvbWUucnVudGltZS5nZXRVUkwoXCJpbWFnZXMvXCIpKTtcbiAgICBzLmlkID0gXCJhcGUtaW50ZWwtcGx1Z2luXCI7XG4gICAgcy50aXRsZSA9IFwiU3RvbmVkIEFwZSBUb29scyB2XCIuY29uY2F0KGNocm9tZS5ydW50aW1lLmdldE1hbmlmZXN0KCkudmVyc2lvbik7XG4gICAgcy5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vcy50cmlnZ2VyKCdhcGU6cGx1Z2luOmxvYWRlZCcscy50aXRsZSk7XG4gICAgICAgIC8vdGhpcy5yZW1vdmUoKTtcbiAgICB9O1xuICAgIChkb2N1bWVudC5oZWFkIHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCkuYXBwZW5kQ2hpbGQocyk7XG4gICAgY29uc29sZS5sb2coXCJcIi5jb25jYXQocy50aXRsZSwgXCIgYmFja2dyb3VuZCBwYWdlLlwiKSk7XG59O1xudmFyIGlzRmlyZWZveCA9IG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKS5pbmRleE9mKFwiZmlyZWZveFwiKSA+IC0xO1xuaWYgKGlzRmlyZWZveCkge1xuICAgIGNvbnNvbGUubG9nKFwid29ya2luZyBvbiBGaXJlZm94XCIpO1xuICAgIGJyb3dzZXIudGFicy5vblVwZGF0ZWQuYWRkTGlzdGVuZXIoZnVuY3Rpb24gKHRhYklkLCBjaGFuZ2VJbmZvLCB0YWIpIHtcbiAgICAgICAgaWYgKHRhYi5hY3RpdmUpIHtcbiAgICAgICAgICAgIGJyb3dzZXIuc2NyaXB0aW5nXG4gICAgICAgICAgICAgICAgLmV4ZWN1dGVTY3JpcHQoe1xuICAgICAgICAgICAgICAgIHRhcmdldDogeyB0YWJJZDogdGFiSWQgfSxcbiAgICAgICAgICAgICAgICBmdW5jOiBhZGRfaW50ZWxfcGx1Z2luLFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuY2F0Y2goY29uc29sZS5sb2cpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5jaHJvbWUudGFicy5vblVwZGF0ZWQuYWRkTGlzdGVuZXIoZnVuY3Rpb24gKHRhYklkLCBjaGFuZ2VJbmZvLCB0YWIpIHtcbiAgICBpZiAoY2hhbmdlSW5mby5zdGF0dXMgPT09IFwiY29tcGxldGVcIiAmJiB0YWIuYWN0aXZlKSB7XG4gICAgICAgIGNocm9tZS5zY3JpcHRpbmdcbiAgICAgICAgICAgIC5leGVjdXRlU2NyaXB0KHtcbiAgICAgICAgICAgIHRhcmdldDogeyB0YWJJZDogdGFiSWQgfSxcbiAgICAgICAgICAgIGZ1bmM6IGFkZF9pbnRlbF9wbHVnaW4sXG4gICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goY29uc29sZS5sb2cpO1xuICAgIH1cbn0pO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9