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
    s.src = chrome.runtime.getURL("intel.js");
    s.setAttribute("images", chrome.runtime.getURL("images/"));
    s.id = "ape-intel-plugin";
    s.title = "Stoned Ape Tools v".concat(chrome.runtime.getManifest().version);
    s.setAttribute("version", chrome.runtime.getManifest().version);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2VyLmpzIiwibWFwcGluZ3MiOiI7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMEJBQTBCLGNBQWM7QUFDeEM7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBCQUEwQixjQUFjO0FBQ3hDO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQSxLQUFLO0FBQ0wiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9uZXB0dW5lcy1wcmlkZS1hZ2VudC8uL3NvdXJjZS93b3JrZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyogZ2xvYmFsIGNocm9tZSwgYnJvd3NlciAqL1xuLy9jb25zdCBTQVRfVkVSU0lPTiA9IGNocm9tZS5ydW50aW1lLmdldE1hbmlmZXN0KCkudmVyc2lvbjtcbmNvbnNvbGUubG9nKFwiU3RvbmVkIEFwZSBUb29scyB3b3JrZXIgc3RhcnRlZCBsb2FkaW5nLi4uXCIpO1xudmFyIGFkZF9pbnRlbF9wbHVnaW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic2NyaXB0XCIpO1xuICAgIHMuc3JjID0gY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKFwiaW50ZWwuanNcIik7XG4gICAgcy5zZXRBdHRyaWJ1dGUoXCJpbWFnZXNcIiwgY2hyb21lLnJ1bnRpbWUuZ2V0VVJMKFwiaW1hZ2VzL1wiKSk7XG4gICAgcy5pZCA9IFwiYXBlLWludGVsLXBsdWdpblwiO1xuICAgIHMudGl0bGUgPSBcIlN0b25lZCBBcGUgVG9vbHMgdlwiLmNvbmNhdChjaHJvbWUucnVudGltZS5nZXRNYW5pZmVzdCgpLnZlcnNpb24pO1xuICAgIHMuc2V0QXR0cmlidXRlKFwidmVyc2lvblwiLCBjaHJvbWUucnVudGltZS5nZXRNYW5pZmVzdCgpLnZlcnNpb24pO1xuICAgIHMub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAvL3MudHJpZ2dlcignYXBlOnBsdWdpbjpsb2FkZWQnLHMudGl0bGUpO1xuICAgICAgICAvL3RoaXMucmVtb3ZlKCk7XG4gICAgfTtcbiAgICAoZG9jdW1lbnQuaGVhZCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQpLmFwcGVuZENoaWxkKHMpO1xuICAgIGNvbnNvbGUubG9nKFwiXCIuY29uY2F0KHMudGl0bGUsIFwiIHdvcmtlciBsb2FkaW5nLi4uXCIpKTtcbn07XG52YXIgaXNGaXJlZm94ID0gbmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpLmluZGV4T2YoXCJmaXJlZm94XCIpID4gLTE7XG5pZiAoaXNGaXJlZm94KSB7XG4gICAgY29uc29sZS5sb2coXCJGaXJlZm94IHdvcmtlciBydW5uaW5nXCIpO1xuICAgIGJyb3dzZXIudGFicy5vblVwZGF0ZWQuYWRkTGlzdGVuZXIoZnVuY3Rpb24gKHRhYklkLCBjaGFuZ2VJbmZvLCB0YWIpIHtcbiAgICAgICAgaWYgKGNoYW5nZUluZm8uc3RhdHVzID09PSBcImNvbXBsZXRlXCIgJiYgdGFiLmFjdGl2ZSkge1xuICAgICAgICAgICAgYnJvd3Nlci5zY3JpcHRpbmdcbiAgICAgICAgICAgICAgICAuZXhlY3V0ZVNjcmlwdCh7XG4gICAgICAgICAgICAgICAgdGFyZ2V0OiB7IHRhYklkOiB0YWJJZCB9LFxuICAgICAgICAgICAgICAgIGZ1bmM6IGFkZF9pbnRlbF9wbHVnaW4sXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5jYXRjaChjb25zb2xlLmxvZyk7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cbmVsc2Uge1xuICAgIGNvbnNvbGUubG9nKFwiQ2hyb21lIHdvcmtlciBydW5uaW5nXCIpO1xuICAgIGNocm9tZS50YWJzLm9uVXBkYXRlZC5hZGRMaXN0ZW5lcihmdW5jdGlvbiAodGFiSWQsIGNoYW5nZUluZm8sIHRhYikge1xuICAgICAgICBpZiAoY2hhbmdlSW5mby5zdGF0dXMgPT09IFwiY29tcGxldGVcIiAmJiB0YWIuYWN0aXZlKSB7XG4gICAgICAgICAgICBjaHJvbWUuc2NyaXB0aW5nXG4gICAgICAgICAgICAgICAgLmV4ZWN1dGVTY3JpcHQoe1xuICAgICAgICAgICAgICAgIHRhcmdldDogeyB0YWJJZDogdGFiSWQgfSxcbiAgICAgICAgICAgICAgICBmdW5jOiBhZGRfaW50ZWxfcGx1Z2luLFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuY2F0Y2goY29uc29sZS5sb2cpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=