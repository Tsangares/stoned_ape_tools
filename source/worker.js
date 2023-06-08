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
} else {
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
