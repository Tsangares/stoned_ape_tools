/******/ (function() { // webpackBootstrap
var __webpack_exports__ = {};
/*!**************************!*\
  !*** ./source/worker.js ***!
  \**************************/
/* global chrome, browser */
//const SAT_VERSION = chrome.runtime.getManifest().version;
console.log("Stoned Ape Tools worker started loading...");
var add_intel_plugin = function () {
    var s = document.createElement("script");
    s.src = browser.runtime.getURL("intel.js");
    s.setAttribute("images", browser.runtime.getURL("images/"));
    s.id = "ape-intel-plugin";
    s.title = "Stoned Ape Tools v".concat(browser.runtime.getManifest().version);
    s.setAttribute("version", browser.runtime.getManifest().version);
    s.onload = function () {
        //s.trigger('ape:plugin:loaded',s.title);
        //this.remove();
    };
    (document.head || document.documentElement).appendChild(s);
    console.log("".concat(s.title, " worker loading..."));
};
var isFirefox = navigator.userAgent.toLowerCase().indexOf("firefox") > -1;
if (isFirefox) {
    console.log("Firefox worker running");
    browser.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
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
}

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2VyLmpzIiwibWFwcGluZ3MiOiI7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMEJBQTBCLGNBQWM7QUFDeEM7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBCQUEwQixjQUFjO0FBQ3hDO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQSxLQUFLO0FBQ0wiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9uZXB0dW5lcy1wcmlkZS1hZ2VudC8uL3NvdXJjZS93b3JrZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyogZ2xvYmFsIGNocm9tZSwgYnJvd3NlciAqL1xuLy9jb25zdCBTQVRfVkVSU0lPTiA9IGNocm9tZS5ydW50aW1lLmdldE1hbmlmZXN0KCkudmVyc2lvbjtcbmNvbnNvbGUubG9nKFwiU3RvbmVkIEFwZSBUb29scyB3b3JrZXIgc3RhcnRlZCBsb2FkaW5nLi4uXCIpO1xudmFyIGFkZF9pbnRlbF9wbHVnaW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic2NyaXB0XCIpO1xuICAgIHMuc3JjID0gYnJvd3Nlci5ydW50aW1lLmdldFVSTChcImludGVsLmpzXCIpO1xuICAgIHMuc2V0QXR0cmlidXRlKFwiaW1hZ2VzXCIsIGJyb3dzZXIucnVudGltZS5nZXRVUkwoXCJpbWFnZXMvXCIpKTtcbiAgICBzLmlkID0gXCJhcGUtaW50ZWwtcGx1Z2luXCI7XG4gICAgcy50aXRsZSA9IFwiU3RvbmVkIEFwZSBUb29scyB2XCIuY29uY2F0KGJyb3dzZXIucnVudGltZS5nZXRNYW5pZmVzdCgpLnZlcnNpb24pO1xuICAgIHMuc2V0QXR0cmlidXRlKFwidmVyc2lvblwiLCBicm93c2VyLnJ1bnRpbWUuZ2V0TWFuaWZlc3QoKS52ZXJzaW9uKTtcbiAgICBzLm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy9zLnRyaWdnZXIoJ2FwZTpwbHVnaW46bG9hZGVkJyxzLnRpdGxlKTtcbiAgICAgICAgLy90aGlzLnJlbW92ZSgpO1xuICAgIH07XG4gICAgKGRvY3VtZW50LmhlYWQgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50KS5hcHBlbmRDaGlsZChzKTtcbiAgICBjb25zb2xlLmxvZyhcIlwiLmNvbmNhdChzLnRpdGxlLCBcIiB3b3JrZXIgbG9hZGluZy4uLlwiKSk7XG59O1xudmFyIGlzRmlyZWZveCA9IG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKS5pbmRleE9mKFwiZmlyZWZveFwiKSA+IC0xO1xuaWYgKGlzRmlyZWZveCkge1xuICAgIGNvbnNvbGUubG9nKFwiRmlyZWZveCB3b3JrZXIgcnVubmluZ1wiKTtcbiAgICBicm93c2VyLnRhYnMub25VcGRhdGVkLmFkZExpc3RlbmVyKGZ1bmN0aW9uICh0YWJJZCwgY2hhbmdlSW5mbywgdGFiKSB7XG4gICAgICAgIGlmIChjaGFuZ2VJbmZvLnN0YXR1cyA9PT0gXCJjb21wbGV0ZVwiICYmIHRhYi5hY3RpdmUpIHtcbiAgICAgICAgICAgIGJyb3dzZXIuc2NyaXB0aW5nXG4gICAgICAgICAgICAgICAgLmV4ZWN1dGVTY3JpcHQoe1xuICAgICAgICAgICAgICAgIHRhcmdldDogeyB0YWJJZDogdGFiSWQgfSxcbiAgICAgICAgICAgICAgICBmdW5jOiBhZGRfaW50ZWxfcGx1Z2luLFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuY2F0Y2goY29uc29sZS5sb2cpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5lbHNlIHtcbiAgICBjb25zb2xlLmxvZyhcIkNocm9tZSB3b3JrZXIgcnVubmluZ1wiKTtcbiAgICBjaHJvbWUudGFicy5vblVwZGF0ZWQuYWRkTGlzdGVuZXIoZnVuY3Rpb24gKHRhYklkLCBjaGFuZ2VJbmZvLCB0YWIpIHtcbiAgICAgICAgaWYgKGNoYW5nZUluZm8uc3RhdHVzID09PSBcImNvbXBsZXRlXCIgJiYgdGFiLmFjdGl2ZSkge1xuICAgICAgICAgICAgY2hyb21lLnNjcmlwdGluZ1xuICAgICAgICAgICAgICAgIC5leGVjdXRlU2NyaXB0KHtcbiAgICAgICAgICAgICAgICB0YXJnZXQ6IHsgdGFiSWQ6IHRhYklkIH0sXG4gICAgICAgICAgICAgICAgZnVuYzogYWRkX2ludGVsX3BsdWdpbixcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmNhdGNoKGNvbnNvbGUubG9nKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9