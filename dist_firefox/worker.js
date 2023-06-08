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
    s.src = browser.runtime.getURL("intel.js");
    s.setAttribute("images", browser.runtime.getURL("images/"));
    s.id = "ape-intel-plugin";
    s.title = `Stoned Ape Tools v${browser.runtime.getManifest().version}`;
    s.setAttribute("version", browser.runtime.getManifest().version);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2VyLmpzIiwibWFwcGluZ3MiOiI7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1DQUFtQyxzQ0FBc0M7QUFDekU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLFNBQVM7QUFDNUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBCQUEwQixjQUFjO0FBQ3hDO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwQkFBMEIsY0FBYztBQUN4QztBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0EsS0FBSztBQUNMIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vbmVwdHVuZXMtcHJpZGUtYWdlbnQvLi9zb3VyY2Uvd29ya2VyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qIGdsb2JhbCBjaHJvbWUsIGJyb3dzZXIgKi9cbi8vY29uc3QgU0FUX1ZFUlNJT04gPSBjaHJvbWUucnVudGltZS5nZXRNYW5pZmVzdCgpLnZlcnNpb247XG5jb25zb2xlLmxvZyhcIlN0b25lZCBBcGUgVG9vbHMgd29ya2VyIHN0YXJ0ZWQgbG9hZGluZy4uLlwiKTtcbmNvbnN0IGFkZF9pbnRlbF9wbHVnaW4gPSAoKSA9PiB7XG4gICAgdmFyIHMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic2NyaXB0XCIpO1xuICAgIHMuc3JjID0gYnJvd3Nlci5ydW50aW1lLmdldFVSTChcImludGVsLmpzXCIpO1xuICAgIHMuc2V0QXR0cmlidXRlKFwiaW1hZ2VzXCIsIGJyb3dzZXIucnVudGltZS5nZXRVUkwoXCJpbWFnZXMvXCIpKTtcbiAgICBzLmlkID0gXCJhcGUtaW50ZWwtcGx1Z2luXCI7XG4gICAgcy50aXRsZSA9IGBTdG9uZWQgQXBlIFRvb2xzIHYke2Jyb3dzZXIucnVudGltZS5nZXRNYW5pZmVzdCgpLnZlcnNpb259YDtcbiAgICBzLnNldEF0dHJpYnV0ZShcInZlcnNpb25cIiwgYnJvd3Nlci5ydW50aW1lLmdldE1hbmlmZXN0KCkudmVyc2lvbik7XG4gICAgcy5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vcy50cmlnZ2VyKCdhcGU6cGx1Z2luOmxvYWRlZCcscy50aXRsZSk7XG4gICAgICAgIC8vdGhpcy5yZW1vdmUoKTtcbiAgICB9O1xuICAgIChkb2N1bWVudC5oZWFkIHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCkuYXBwZW5kQ2hpbGQocyk7XG4gICAgY29uc29sZS5sb2coYCR7cy50aXRsZX0gd29ya2VyIGxvYWRpbmcuLi5gKTtcbn07XG52YXIgaXNGaXJlZm94ID0gbmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpLmluZGV4T2YoXCJmaXJlZm94XCIpID4gLTE7XG5pZiAoaXNGaXJlZm94KSB7XG4gICAgY29uc29sZS5sb2coXCJGaXJlZm94IHdvcmtlciBydW5uaW5nXCIpO1xuICAgIGJyb3dzZXIudGFicy5vblVwZGF0ZWQuYWRkTGlzdGVuZXIoKHRhYklkLCBjaGFuZ2VJbmZvLCB0YWIpID0+IHtcbiAgICAgICAgaWYgKGNoYW5nZUluZm8uc3RhdHVzID09PSBcImNvbXBsZXRlXCIgJiYgdGFiLmFjdGl2ZSkge1xuICAgICAgICAgICAgYnJvd3Nlci5zY3JpcHRpbmdcbiAgICAgICAgICAgICAgICAuZXhlY3V0ZVNjcmlwdCh7XG4gICAgICAgICAgICAgICAgdGFyZ2V0OiB7IHRhYklkOiB0YWJJZCB9LFxuICAgICAgICAgICAgICAgIGZ1bmM6IGFkZF9pbnRlbF9wbHVnaW4sXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5jYXRjaChjb25zb2xlLmxvZyk7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cbmVsc2Uge1xuICAgIGNvbnNvbGUubG9nKFwiQ2hyb21lIHdvcmtlciBydW5uaW5nXCIpO1xuICAgIGNocm9tZS50YWJzLm9uVXBkYXRlZC5hZGRMaXN0ZW5lcigodGFiSWQsIGNoYW5nZUluZm8sIHRhYikgPT4ge1xuICAgICAgICBpZiAoY2hhbmdlSW5mby5zdGF0dXMgPT09IFwiY29tcGxldGVcIiAmJiB0YWIuYWN0aXZlKSB7XG4gICAgICAgICAgICBjaHJvbWUuc2NyaXB0aW5nXG4gICAgICAgICAgICAgICAgLmV4ZWN1dGVTY3JpcHQoe1xuICAgICAgICAgICAgICAgIHRhcmdldDogeyB0YWJJZDogdGFiSWQgfSxcbiAgICAgICAgICAgICAgICBmdW5jOiBhZGRfaW50ZWxfcGx1Z2luLFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuY2F0Y2goY29uc29sZS5sb2cpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=