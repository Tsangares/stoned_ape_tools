/******/ (function() { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./source/chat.ts":
/*!************************!*\
  !*** ./source/chat.ts ***!
  \************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "MarkDownMessageComment": function() { return /* binding */ MarkDownMessageComment; },
/* harmony export */   "get_research": function() { return /* binding */ get_research; },
/* harmony export */   "get_research_text": function() { return /* binding */ get_research_text; }
/* harmony export */ });
/* harmony import */ var _utilities__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utilities */ "./source/utilities.ts");

var RESEACH_MAP = {
    scanning: "Scanning",
    propulsion: "Hyperspace Range",
    terraforming: "Terraforming",
    research: "Experimentation",
    weapons: "Weapons",
    banking: "Banking",
    manufacturing: "Manufacturing",
};
//For quick research display
function get_research(game) {
    var universe = game.universe;
    var hero = (0,_utilities__WEBPACK_IMPORTED_MODULE_0__.get_hero)(game.universe);
    var science = hero.total_science;
    //Current Science
    var current = hero.tech[hero.researching];
    var current_points_remaining = current.brr * current.level - current.research;
    var eta = Math.ceil(current_points_remaining / science); //Hours
    //Next science
    var next = hero.tech[hero.researching_next];
    var next_points_remaining = next.brr * next.level - next.research;
    var next_eta = Math.ceil(next_points_remaining / science) + eta;
    var next_level = next.level + 1;
    if (hero.researching == hero.researching_next) {
        //Recurring research
        next_points_remaining += next.brr;
        next_eta = Math.ceil((next.brr * next.level + 1) / science) + eta;
        next_level += 1;
    }
    return {
        current_name: RESEACH_MAP[hero.researching],
        current_level: current["level"] + 1,
        current_eta: eta,
        next_name: RESEACH_MAP[hero.researching_next],
        next_level: next_level,
        next_eta: next_eta,
        science: science,
    };
}
function get_research_text(game) {
    var research = get_research(game);
    var first_line = "Now: ".concat(research["current_name"], " ").concat(research["current_level"], " - ").concat(research["current_eta"], " ticks.");
    var second_line = "Next: ".concat(research["next_name"], " ").concat(research["next_level"], " - ").concat(research["next_eta"], " ticks.");
    var third_line = "My Science: ".concat(research["science"]);
    return "".concat(first_line, "\n").concat(second_line, "\n").concat(third_line, "\n");
}
function MarkDownMessageComment(context, text, index) {
    var messageComment = context.MessageComment(text, index);
    return "";
}



/***/ }),

/***/ "./source/event_cache.ts":
/*!*******************************!*\
  !*** ./source/event_cache.ts ***!
  \*******************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "PlayerNameIconRowLink": function() { return /* binding */ PlayerNameIconRowLink; },
/* harmony export */   "cacheFetchSize": function() { return /* binding */ cacheFetchSize; },
/* harmony export */   "cacheFetchStart": function() { return /* binding */ cacheFetchStart; },
/* harmony export */   "cached_events": function() { return /* binding */ cached_events; },
/* harmony export */   "recieve_new_messages": function() { return /* binding */ recieve_new_messages; },
/* harmony export */   "update_event_cache": function() { return /* binding */ update_event_cache; }
/* harmony export */ });
/* harmony import */ var _ledger__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ledger */ "./source/ledger.ts");
/* harmony import */ var _utilities__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utilities */ "./source/utilities.ts");


//Global cached event system.
var cached_events = [];
var cacheFetchStart = new Date();
var cacheFetchSize = 0;
//Async request game events
//game is used to get the api version and the gameNumber
function update_event_cache(game, crux, fetchSize, success, error) {
    var count = cached_events.length > 0 ? fetchSize : 100000;
    cacheFetchStart = new Date();
    cacheFetchSize = count;
    var params = new URLSearchParams({
        type: "fetch_game_messages",
        count: count.toString(),
        offset: "0",
        group: "game_event",
        version: game.version,
        game_number: game.gameNumber,
    });
    var headers = {
        "Content-Type": "application/x-www-form-urlencodedn",
    };
    fetch("/trequest/fetch_game_messages", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
    })
        .then(function (response) { return response.json(); })
        .then(function (response) { return success(game, crux, response); })
        .catch(error);
}
//Custom UI Components for Ledger
function PlayerNameIconRowLink(crux, npui, player) {
    var playerNameIconRow = crux.Widget("rel col_black clickable").size(480, 48);
    npui.PlayerIcon(player, true).roost(playerNameIconRow);
    crux
        .Text("", "section_title")
        .grid(6, 0, 21, 3)
        .rawHTML("<a onclick=\"Crux.crux.trigger('show_player_uid', '".concat(player.uid, "' )\">").concat(player.alias, "</a>"))
        .roost(playerNameIconRow);
    return playerNameIconRow;
}
//Handler to recieve new messages
function recieve_new_messages(game, crux, response) {
    var universe = game.universe;
    var npui = game.npui;
    var cacheFetchEnd = new Date();
    var elapsed = cacheFetchEnd.getTime() - cacheFetchStart.getTime();
    console.log("Fetched ".concat(cacheFetchSize, " events in ").concat(elapsed, "ms"));
    var incoming = response.report.messages;
    if (cached_events.length > 0) {
        var overlapOffset = -1;
        for (var i = 0; i < incoming.length; ++i) {
            var message = incoming[i];
            if (message.key === cached_events[0].key) {
                overlapOffset = i;
                break;
            }
        }
        if (overlapOffset >= 0) {
            incoming = incoming.slice(0, overlapOffset);
        }
        else if (overlapOffset < 0) {
            var size = incoming.length * 2;
            console.log("Missing some events, double fetch to ".concat(size));
            update_event_cache(game, crux, size, recieve_new_messages, console.error);
            return;
        }
        // we had cached events, but want to be extra paranoid about
        // correctness. So if the response contained the entire event
        // log, validate that it exactly matches the cached events.
        if (response.report.messages.length === cached_events.length) {
            console.log("*** Validating cached_events ***");
            var valid_1 = response.report.messages;
            var invalidEntries = cached_events.filter(function (e, i) { return e.key !== valid_1[i].key; });
            if (invalidEntries.length) {
                console.error("!! Invalid entries found: ", invalidEntries);
            }
            console.log("*** Validation Completed ***");
        }
        else {
            // the response didn't contain the entire event log. Go fetch
            // a version that _does_.
            update_event_cache(game, crux, 100000, recieve_new_messages, console.error);
        }
    }
    cached_events = incoming.concat(cached_events);
    var players = (0,_ledger__WEBPACK_IMPORTED_MODULE_0__.get_ledger)(game, crux, cached_events);
    var ledgerScreen = npui.ledgerScreen();
    npui.onHideScreen(null, true);
    npui.onHideSelectionMenu();
    npui.trigger("hide_side_menu");
    npui.trigger("reset_edit_mode");
    npui.activeScreen = ledgerScreen;
    ledgerScreen.roost(npui.screenContainer);
    npui.layoutElement(ledgerScreen);
    players.forEach(function (p) {
        var player = PlayerNameIconRowLink(crux, npui, universe.galaxy.players[p.uid]).roost(npui.activeScreen);
        player.addStyle("player_cell");
        var prompt = p.debt > 0 ? "They owe" : "You owe";
        if (p.debt == 0) {
            prompt = "Balance";
        }
        if (p.debt < 0) {
            crux
                .Text("", "pad12 txt_right red-text")
                .rawHTML("".concat(prompt, ": ").concat(p.debt))
                .grid(20, 0, 10, 3)
                .roost(player);
            if (p.debt * -1 <= (0,_utilities__WEBPACK_IMPORTED_MODULE_1__.get_hero)(universe).cash) {
                crux
                    .Button("forgive", "forgive_debt", { targetPlayer: p.uid })
                    .grid(17, 0, 6, 3)
                    .roost(player);
            }
        }
        else if (p.debt > 0) {
            crux
                .Text("", "pad12 txt_right blue-text")
                .rawHTML("".concat(prompt, ": ").concat(p.debt))
                .grid(20, 0, 10, 3)
                .roost(player);
        }
        else if (p.debt == 0) {
            crux
                .Text("", "pad12 txt_right orange-text")
                .rawHTML("".concat(prompt, ": ").concat(p.debt))
                .grid(20, 0, 10, 3)
                .roost(player);
        }
    });
}
/* harmony default export */ __webpack_exports__["default"] = ({
    update_event_cache: update_event_cache,
    recieve_new_messages: recieve_new_messages,
});


/***/ }),

/***/ "./source/hotkey.ts":
/*!**************************!*\
  !*** ./source/hotkey.ts ***!
  \**************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "clip": function() { return /* binding */ clip; },
/* harmony export */   "lastClip": function() { return /* binding */ lastClip; }
/* harmony export */ });
var lastClip = "Error";
function clip(text) {
    lastClip = text;
}


/***/ }),

/***/ "./source/ledger.ts":
/*!**************************!*\
  !*** ./source/ledger.ts ***!
  \**************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "get_ledger": function() { return /* binding */ get_ledger; },
/* harmony export */   "renderLedger": function() { return /* binding */ renderLedger; }
/* harmony export */ });
/* harmony import */ var _utilities__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utilities */ "./source/utilities.ts");
/* harmony import */ var _event_cache__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./event_cache */ "./source/event_cache.ts");


//Get ledger info to see what is owed
//Actually shows the panel of loading
function get_ledger(game, crux, messages) {
    var npui = game.npui;
    var universe = game.universe;
    var players = universe.galaxy.players;
    var loading = crux
        .Text("", "rel txt_center pad12")
        .rawHTML("Parsing ".concat(messages.length, " messages."));
    loading.roost(npui.activeScreen);
    var uid = (0,_utilities__WEBPACK_IMPORTED_MODULE_0__.get_hero)(universe).uid;
    //Ledger is a list of debts
    var ledger = {};
    messages
        .filter(function (m) {
        return m.payload.template == "money_sent" ||
            m.payload.template == "shared_technology";
    })
        .map(function (m) { return m.payload; })
        .forEach(function (m) {
        var liaison = m.from_puid == uid ? m.to_puid : m.from_puid;
        var value = m.template == "money_sent" ? m.amount : m.price;
        value *= m.from_puid == uid ? 1 : -1; // amount is (+) if credit & (-) if debt
        liaison in ledger
            ? (ledger[liaison] += value)
            : (ledger[liaison] = value);
    });
    //TODO: Review that this is correctly finding a list of only people who have debts.
    //Accounts are the credit or debit related to each user
    var accounts = [];
    for (var uid_1 in ledger) {
        var player = players[parseInt(uid_1)];
        player.debt = ledger[uid_1];
        accounts.push(player);
    }
    (0,_utilities__WEBPACK_IMPORTED_MODULE_0__.get_hero)(universe).ledger = ledger;
    console.log(accounts);
    return accounts;
}
function renderLedger(game, crux, MouseTrap) {
    //Deconstruction of different components of the game.
    var config = game.config;
    var np = game.np;
    var npui = game.npui;
    var universe = game.universe;
    var templates = game.templates;
    var players = universe.galaxy.players;
    MouseTrap.bind(["m", "M"], function () {
        np.trigger("trigger_ledger");
    });
    templates["ledger"] = "Ledger";
    templates["tech_trading"] = "Trading Technology";
    templates["forgive"] = "Pay Debt";
    templates["forgive_debt"] = "Are you sure you want to forgive this debt?";
    if (!npui.hasmenuitem) {
        npui
            .SideMenuItem("icon-database", "ledger", "trigger_ledger")
            .roost(npui.sideMenu);
        npui.hasmenuitem = true;
    }
    npui.ledgerScreen = function () {
        return npui.Screen("ledger");
    };
    np.on("trigger_ledger", function () {
        var ledgerScreen = npui.ledgerScreen();
        var loading = crux
            .Text("", "rel txt_center pad12 section_title")
            .rawHTML("Tabulating Ledger...");
        loading.roost(ledgerScreen);
        npui.onHideScreen(null, true);
        npui.onHideSelectionMenu();
        npui.trigger("hide_side_menu");
        npui.trigger("reset_edit_mode");
        npui.activeScreen = ledgerScreen;
        ledgerScreen.roost(npui.screenContainer);
        npui.layoutElement(ledgerScreen);
        _event_cache__WEBPACK_IMPORTED_MODULE_1__.update_event_cache(game, crux, 4, _event_cache__WEBPACK_IMPORTED_MODULE_1__.recieve_new_messages, console.error);
    });
    //Why not np.on("ForgiveDebt")?
    np.onForgiveDebt = function (event, data) {
        var targetPlayer = data.targetPlayer;
        var player = players[targetPlayer];
        var amount = player.debt * -1;
        //let amount = 1
        universe.player.ledger[targetPlayer] = 0;
        np.trigger("show_screen", [
            "confirm",
            {
                message: "forgive_debt",
                eventKind: "confirm_forgive_debt",
                eventData: {
                    type: "order",
                    order: "send_money,".concat(targetPlayer, ",").concat(amount),
                },
            },
        ]);
    };
    np.on("confirm_forgive_debt", function (event, data) {
        np.trigger("server_request", data);
        np.trigger("trigger_ledger");
    });
    np.on("forgive_debt", np.onForgiveDebt);
}


/***/ }),

/***/ "./source/merge.js":
/*!*************************!*\
  !*** ./source/merge.js ***!
  \*************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "mergeUser": function() { return /* binding */ mergeUser; }
/* harmony export */ });
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
function mergeUser(event, data) {
    if (NeptunesPride.originalPlayer === undefined) {
        NeptunesPride.originalPlayer = NeptunesPride.universe.player.uid;
    }
    var code = (data === null || data === void 0 ? void 0 : data.split(":")[1]) || otherUserCode;
    var otherUserCode = code;
    if (otherUserCode) {
        var params = {
            game_number: game,
            api_version: "0.1",
            code: otherUserCode,
        };
        var eggers = jQuery.ajax({
            type: "POST",
            url: "https://np.ironhelmet.com/api",
            async: false,
            data: params,
            dataType: "json",
        });
        var universe = NeptunesPride.universe;
        var scan = eggers.responseJSON.scanning_data;
        universe.galaxy.stars = __assign(__assign({}, scan.stars), universe.galaxy.stars);
        for (var s in scan.stars) {
            var star = scan.stars[s];
            //Add here a statement to skip if it is hero's star.
            if (star.v !== "0") {
                universe.galaxy.stars[s] = __assign(__assign({}, universe.galaxy.stars[s]), star);
            }
        }
        universe.galaxy.fleets = __assign(__assign({}, scan.fleets), universe.galaxy.fleets);
        NeptunesPride.np.onFullUniverse(null, universe.galaxy);
        NeptunesPride.npui.onHideScreen(null, true);
        init();
    }
}



/***/ }),

/***/ "./source/parse_utils.ts":
/*!*******************************!*\
  !*** ./source/parse_utils.ts ***!
  \*******************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "is_valid_image_url": function() { return /* binding */ is_valid_image_url; },
/* harmony export */   "is_valid_youtube": function() { return /* binding */ is_valid_youtube; },
/* harmony export */   "markdown": function() { return /* binding */ markdown; }
/* harmony export */ });
/* harmony import */ var marked__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! marked */ "./node_modules/marked/lib/marked.esm.js");

function markdown(markdownString) {
    return marked__WEBPACK_IMPORTED_MODULE_0__.marked.parse(markdownString);
}
function is_valid_image_url(str) {
    var protocol = "^(https:\\/\\/)";
    var domains = "(i\\.ibb\\.co|i\\.imgur\\.com|cdn\\.discordapp\\.com)";
    var content = "([&#_=;\\-\\?\\/\\w]{1,150})";
    var images = "(\\.)(gif|jpe?g|tiff?|png|webp|bmp|GIF|JPE?G|TIFF?|PNG|WEBP|BMP)$";
    var regex_string = protocol + domains + content + images;
    var regex = new RegExp(regex_string);
    var valid = regex.test(str);
    return valid;
}
function is_valid_youtube(str) {
    var protocol = "^(https://)";
    var domains = "(youtube.com|www.youtube.com|youtu.be)";
    var content = "([&#_=;-?/w]{1,150})";
    var regex_string = protocol + domains + content;
    var regex = new RegExp(regex_string);
    return regex.test(str);
}
function get_youtube_embed(link) {
    return "<iframe width=\"560\" height=\"315\" src=\"https://www.youtube.com/embed/eHsDTGw_jZ8\" title=\"YouTube video player\" frameborder=\"0\" allow=\"accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share\" allowfullscreen></iframe>";
}


/***/ }),

/***/ "./source/utilities.ts":
/*!*****************************!*\
  !*** ./source/utilities.ts ***!
  \*****************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "get_hero": function() { return /* binding */ get_hero; }
/* harmony export */ });
function get_hero(universe) {
    return universe.player;
}
/* harmony default export */ __webpack_exports__["default"] = ({ get_hero: get_hero });


/***/ }),

/***/ "./node_modules/marked/lib/marked.esm.js":
/*!***********************************************!*\
  !*** ./node_modules/marked/lib/marked.esm.js ***!
  \***********************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Lexer": function() { return /* binding */ Lexer; },
/* harmony export */   "Parser": function() { return /* binding */ Parser; },
/* harmony export */   "Renderer": function() { return /* binding */ Renderer; },
/* harmony export */   "Slugger": function() { return /* binding */ Slugger; },
/* harmony export */   "TextRenderer": function() { return /* binding */ TextRenderer; },
/* harmony export */   "Tokenizer": function() { return /* binding */ Tokenizer; },
/* harmony export */   "defaults": function() { return /* binding */ defaults; },
/* harmony export */   "getDefaults": function() { return /* binding */ getDefaults; },
/* harmony export */   "lexer": function() { return /* binding */ lexer; },
/* harmony export */   "marked": function() { return /* binding */ marked; },
/* harmony export */   "options": function() { return /* binding */ options; },
/* harmony export */   "parse": function() { return /* binding */ parse; },
/* harmony export */   "parseInline": function() { return /* binding */ parseInline; },
/* harmony export */   "parser": function() { return /* binding */ parser; },
/* harmony export */   "setOptions": function() { return /* binding */ setOptions; },
/* harmony export */   "use": function() { return /* binding */ use; },
/* harmony export */   "walkTokens": function() { return /* binding */ walkTokens; }
/* harmony export */ });
/**
 * marked v4.2.12 - a markdown parser
 * Copyright (c) 2011-2023, Christopher Jeffrey. (MIT Licensed)
 * https://github.com/markedjs/marked
 */

/**
 * DO NOT EDIT THIS FILE
 * The code in this file is generated from files in ./src/
 */

function getDefaults() {
  return {
    async: false,
    baseUrl: null,
    breaks: false,
    extensions: null,
    gfm: true,
    headerIds: true,
    headerPrefix: '',
    highlight: null,
    langPrefix: 'language-',
    mangle: true,
    pedantic: false,
    renderer: null,
    sanitize: false,
    sanitizer: null,
    silent: false,
    smartypants: false,
    tokenizer: null,
    walkTokens: null,
    xhtml: false
  };
}

let defaults = getDefaults();

function changeDefaults(newDefaults) {
  defaults = newDefaults;
}

/**
 * Helpers
 */
const escapeTest = /[&<>"']/;
const escapeReplace = new RegExp(escapeTest.source, 'g');
const escapeTestNoEncode = /[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/;
const escapeReplaceNoEncode = new RegExp(escapeTestNoEncode.source, 'g');
const escapeReplacements = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
};
const getEscapeReplacement = (ch) => escapeReplacements[ch];
function escape(html, encode) {
  if (encode) {
    if (escapeTest.test(html)) {
      return html.replace(escapeReplace, getEscapeReplacement);
    }
  } else {
    if (escapeTestNoEncode.test(html)) {
      return html.replace(escapeReplaceNoEncode, getEscapeReplacement);
    }
  }

  return html;
}

const unescapeTest = /&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig;

/**
 * @param {string} html
 */
function unescape(html) {
  // explicitly match decimal, hex, and named HTML entities
  return html.replace(unescapeTest, (_, n) => {
    n = n.toLowerCase();
    if (n === 'colon') return ':';
    if (n.charAt(0) === '#') {
      return n.charAt(1) === 'x'
        ? String.fromCharCode(parseInt(n.substring(2), 16))
        : String.fromCharCode(+n.substring(1));
    }
    return '';
  });
}

const caret = /(^|[^\[])\^/g;

/**
 * @param {string | RegExp} regex
 * @param {string} opt
 */
function edit(regex, opt) {
  regex = typeof regex === 'string' ? regex : regex.source;
  opt = opt || '';
  const obj = {
    replace: (name, val) => {
      val = val.source || val;
      val = val.replace(caret, '$1');
      regex = regex.replace(name, val);
      return obj;
    },
    getRegex: () => {
      return new RegExp(regex, opt);
    }
  };
  return obj;
}

const nonWordAndColonTest = /[^\w:]/g;
const originIndependentUrl = /^$|^[a-z][a-z0-9+.-]*:|^[?#]/i;

/**
 * @param {boolean} sanitize
 * @param {string} base
 * @param {string} href
 */
function cleanUrl(sanitize, base, href) {
  if (sanitize) {
    let prot;
    try {
      prot = decodeURIComponent(unescape(href))
        .replace(nonWordAndColonTest, '')
        .toLowerCase();
    } catch (e) {
      return null;
    }
    if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0 || prot.indexOf('data:') === 0) {
      return null;
    }
  }
  if (base && !originIndependentUrl.test(href)) {
    href = resolveUrl(base, href);
  }
  try {
    href = encodeURI(href).replace(/%25/g, '%');
  } catch (e) {
    return null;
  }
  return href;
}

const baseUrls = {};
const justDomain = /^[^:]+:\/*[^/]*$/;
const protocol = /^([^:]+:)[\s\S]*$/;
const domain = /^([^:]+:\/*[^/]*)[\s\S]*$/;

/**
 * @param {string} base
 * @param {string} href
 */
function resolveUrl(base, href) {
  if (!baseUrls[' ' + base]) {
    // we can ignore everything in base after the last slash of its path component,
    // but we might need to add _that_
    // https://tools.ietf.org/html/rfc3986#section-3
    if (justDomain.test(base)) {
      baseUrls[' ' + base] = base + '/';
    } else {
      baseUrls[' ' + base] = rtrim(base, '/', true);
    }
  }
  base = baseUrls[' ' + base];
  const relativeBase = base.indexOf(':') === -1;

  if (href.substring(0, 2) === '//') {
    if (relativeBase) {
      return href;
    }
    return base.replace(protocol, '$1') + href;
  } else if (href.charAt(0) === '/') {
    if (relativeBase) {
      return href;
    }
    return base.replace(domain, '$1') + href;
  } else {
    return base + href;
  }
}

const noopTest = { exec: function noopTest() {} };

function merge(obj) {
  let i = 1,
    target,
    key;

  for (; i < arguments.length; i++) {
    target = arguments[i];
    for (key in target) {
      if (Object.prototype.hasOwnProperty.call(target, key)) {
        obj[key] = target[key];
      }
    }
  }

  return obj;
}

function splitCells(tableRow, count) {
  // ensure that every cell-delimiting pipe has a space
  // before it to distinguish it from an escaped pipe
  const row = tableRow.replace(/\|/g, (match, offset, str) => {
      let escaped = false,
        curr = offset;
      while (--curr >= 0 && str[curr] === '\\') escaped = !escaped;
      if (escaped) {
        // odd number of slashes means | is escaped
        // so we leave it alone
        return '|';
      } else {
        // add space before unescaped |
        return ' |';
      }
    }),
    cells = row.split(/ \|/);
  let i = 0;

  // First/last cell in a row cannot be empty if it has no leading/trailing pipe
  if (!cells[0].trim()) { cells.shift(); }
  if (cells.length > 0 && !cells[cells.length - 1].trim()) { cells.pop(); }

  if (cells.length > count) {
    cells.splice(count);
  } else {
    while (cells.length < count) cells.push('');
  }

  for (; i < cells.length; i++) {
    // leading or trailing whitespace is ignored per the gfm spec
    cells[i] = cells[i].trim().replace(/\\\|/g, '|');
  }
  return cells;
}

/**
 * Remove trailing 'c's. Equivalent to str.replace(/c*$/, '').
 * /c*$/ is vulnerable to REDOS.
 *
 * @param {string} str
 * @param {string} c
 * @param {boolean} invert Remove suffix of non-c chars instead. Default falsey.
 */
function rtrim(str, c, invert) {
  const l = str.length;
  if (l === 0) {
    return '';
  }

  // Length of suffix matching the invert condition.
  let suffLen = 0;

  // Step left until we fail to match the invert condition.
  while (suffLen < l) {
    const currChar = str.charAt(l - suffLen - 1);
    if (currChar === c && !invert) {
      suffLen++;
    } else if (currChar !== c && invert) {
      suffLen++;
    } else {
      break;
    }
  }

  return str.slice(0, l - suffLen);
}

function findClosingBracket(str, b) {
  if (str.indexOf(b[1]) === -1) {
    return -1;
  }
  const l = str.length;
  let level = 0,
    i = 0;
  for (; i < l; i++) {
    if (str[i] === '\\') {
      i++;
    } else if (str[i] === b[0]) {
      level++;
    } else if (str[i] === b[1]) {
      level--;
      if (level < 0) {
        return i;
      }
    }
  }
  return -1;
}

function checkSanitizeDeprecation(opt) {
  if (opt && opt.sanitize && !opt.silent) {
    console.warn('marked(): sanitize and sanitizer parameters are deprecated since version 0.7.0, should not be used and will be removed in the future. Read more here: https://marked.js.org/#/USING_ADVANCED.md#options');
  }
}

// copied from https://stackoverflow.com/a/5450113/806777
/**
 * @param {string} pattern
 * @param {number} count
 */
function repeatString(pattern, count) {
  if (count < 1) {
    return '';
  }
  let result = '';
  while (count > 1) {
    if (count & 1) {
      result += pattern;
    }
    count >>= 1;
    pattern += pattern;
  }
  return result + pattern;
}

function outputLink(cap, link, raw, lexer) {
  const href = link.href;
  const title = link.title ? escape(link.title) : null;
  const text = cap[1].replace(/\\([\[\]])/g, '$1');

  if (cap[0].charAt(0) !== '!') {
    lexer.state.inLink = true;
    const token = {
      type: 'link',
      raw,
      href,
      title,
      text,
      tokens: lexer.inlineTokens(text)
    };
    lexer.state.inLink = false;
    return token;
  }
  return {
    type: 'image',
    raw,
    href,
    title,
    text: escape(text)
  };
}

function indentCodeCompensation(raw, text) {
  const matchIndentToCode = raw.match(/^(\s+)(?:```)/);

  if (matchIndentToCode === null) {
    return text;
  }

  const indentToCode = matchIndentToCode[1];

  return text
    .split('\n')
    .map(node => {
      const matchIndentInNode = node.match(/^\s+/);
      if (matchIndentInNode === null) {
        return node;
      }

      const [indentInNode] = matchIndentInNode;

      if (indentInNode.length >= indentToCode.length) {
        return node.slice(indentToCode.length);
      }

      return node;
    })
    .join('\n');
}

/**
 * Tokenizer
 */
class Tokenizer {
  constructor(options) {
    this.options = options || defaults;
  }

  space(src) {
    const cap = this.rules.block.newline.exec(src);
    if (cap && cap[0].length > 0) {
      return {
        type: 'space',
        raw: cap[0]
      };
    }
  }

  code(src) {
    const cap = this.rules.block.code.exec(src);
    if (cap) {
      const text = cap[0].replace(/^ {1,4}/gm, '');
      return {
        type: 'code',
        raw: cap[0],
        codeBlockStyle: 'indented',
        text: !this.options.pedantic
          ? rtrim(text, '\n')
          : text
      };
    }
  }

  fences(src) {
    const cap = this.rules.block.fences.exec(src);
    if (cap) {
      const raw = cap[0];
      const text = indentCodeCompensation(raw, cap[3] || '');

      return {
        type: 'code',
        raw,
        lang: cap[2] ? cap[2].trim().replace(this.rules.inline._escapes, '$1') : cap[2],
        text
      };
    }
  }

  heading(src) {
    const cap = this.rules.block.heading.exec(src);
    if (cap) {
      let text = cap[2].trim();

      // remove trailing #s
      if (/#$/.test(text)) {
        const trimmed = rtrim(text, '#');
        if (this.options.pedantic) {
          text = trimmed.trim();
        } else if (!trimmed || / $/.test(trimmed)) {
          // CommonMark requires space before trailing #s
          text = trimmed.trim();
        }
      }

      return {
        type: 'heading',
        raw: cap[0],
        depth: cap[1].length,
        text,
        tokens: this.lexer.inline(text)
      };
    }
  }

  hr(src) {
    const cap = this.rules.block.hr.exec(src);
    if (cap) {
      return {
        type: 'hr',
        raw: cap[0]
      };
    }
  }

  blockquote(src) {
    const cap = this.rules.block.blockquote.exec(src);
    if (cap) {
      const text = cap[0].replace(/^ *>[ \t]?/gm, '');
      const top = this.lexer.state.top;
      this.lexer.state.top = true;
      const tokens = this.lexer.blockTokens(text);
      this.lexer.state.top = top;
      return {
        type: 'blockquote',
        raw: cap[0],
        tokens,
        text
      };
    }
  }

  list(src) {
    let cap = this.rules.block.list.exec(src);
    if (cap) {
      let raw, istask, ischecked, indent, i, blankLine, endsWithBlankLine,
        line, nextLine, rawLine, itemContents, endEarly;

      let bull = cap[1].trim();
      const isordered = bull.length > 1;

      const list = {
        type: 'list',
        raw: '',
        ordered: isordered,
        start: isordered ? +bull.slice(0, -1) : '',
        loose: false,
        items: []
      };

      bull = isordered ? `\\d{1,9}\\${bull.slice(-1)}` : `\\${bull}`;

      if (this.options.pedantic) {
        bull = isordered ? bull : '[*+-]';
      }

      // Get next list item
      const itemRegex = new RegExp(`^( {0,3}${bull})((?:[\t ][^\\n]*)?(?:\\n|$))`);

      // Check if current bullet point can start a new List Item
      while (src) {
        endEarly = false;
        if (!(cap = itemRegex.exec(src))) {
          break;
        }

        if (this.rules.block.hr.test(src)) { // End list if bullet was actually HR (possibly move into itemRegex?)
          break;
        }

        raw = cap[0];
        src = src.substring(raw.length);

        line = cap[2].split('\n', 1)[0].replace(/^\t+/, (t) => ' '.repeat(3 * t.length));
        nextLine = src.split('\n', 1)[0];

        if (this.options.pedantic) {
          indent = 2;
          itemContents = line.trimLeft();
        } else {
          indent = cap[2].search(/[^ ]/); // Find first non-space char
          indent = indent > 4 ? 1 : indent; // Treat indented code blocks (> 4 spaces) as having only 1 indent
          itemContents = line.slice(indent);
          indent += cap[1].length;
        }

        blankLine = false;

        if (!line && /^ *$/.test(nextLine)) { // Items begin with at most one blank line
          raw += nextLine + '\n';
          src = src.substring(nextLine.length + 1);
          endEarly = true;
        }

        if (!endEarly) {
          const nextBulletRegex = new RegExp(`^ {0,${Math.min(3, indent - 1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ \t][^\\n]*)?(?:\\n|$))`);
          const hrRegex = new RegExp(`^ {0,${Math.min(3, indent - 1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`);
          const fencesBeginRegex = new RegExp(`^ {0,${Math.min(3, indent - 1)}}(?:\`\`\`|~~~)`);
          const headingBeginRegex = new RegExp(`^ {0,${Math.min(3, indent - 1)}}#`);

          // Check if following lines should be included in List Item
          while (src) {
            rawLine = src.split('\n', 1)[0];
            nextLine = rawLine;

            // Re-align to follow commonmark nesting rules
            if (this.options.pedantic) {
              nextLine = nextLine.replace(/^ {1,4}(?=( {4})*[^ ])/g, '  ');
            }

            // End list item if found code fences
            if (fencesBeginRegex.test(nextLine)) {
              break;
            }

            // End list item if found start of new heading
            if (headingBeginRegex.test(nextLine)) {
              break;
            }

            // End list item if found start of new bullet
            if (nextBulletRegex.test(nextLine)) {
              break;
            }

            // Horizontal rule found
            if (hrRegex.test(src)) {
              break;
            }

            if (nextLine.search(/[^ ]/) >= indent || !nextLine.trim()) { // Dedent if possible
              itemContents += '\n' + nextLine.slice(indent);
            } else {
              // not enough indentation
              if (blankLine) {
                break;
              }

              // paragraph continuation unless last line was a different block level element
              if (line.search(/[^ ]/) >= 4) { // indented code block
                break;
              }
              if (fencesBeginRegex.test(line)) {
                break;
              }
              if (headingBeginRegex.test(line)) {
                break;
              }
              if (hrRegex.test(line)) {
                break;
              }

              itemContents += '\n' + nextLine;
            }

            if (!blankLine && !nextLine.trim()) { // Check if current line is blank
              blankLine = true;
            }

            raw += rawLine + '\n';
            src = src.substring(rawLine.length + 1);
            line = nextLine.slice(indent);
          }
        }

        if (!list.loose) {
          // If the previous item ended with a blank line, the list is loose
          if (endsWithBlankLine) {
            list.loose = true;
          } else if (/\n *\n *$/.test(raw)) {
            endsWithBlankLine = true;
          }
        }

        // Check for task list items
        if (this.options.gfm) {
          istask = /^\[[ xX]\] /.exec(itemContents);
          if (istask) {
            ischecked = istask[0] !== '[ ] ';
            itemContents = itemContents.replace(/^\[[ xX]\] +/, '');
          }
        }

        list.items.push({
          type: 'list_item',
          raw,
          task: !!istask,
          checked: ischecked,
          loose: false,
          text: itemContents
        });

        list.raw += raw;
      }

      // Do not consume newlines at end of final item. Alternatively, make itemRegex *start* with any newlines to simplify/speed up endsWithBlankLine logic
      list.items[list.items.length - 1].raw = raw.trimRight();
      list.items[list.items.length - 1].text = itemContents.trimRight();
      list.raw = list.raw.trimRight();

      const l = list.items.length;

      // Item child tokens handled here at end because we needed to have the final item to trim it first
      for (i = 0; i < l; i++) {
        this.lexer.state.top = false;
        list.items[i].tokens = this.lexer.blockTokens(list.items[i].text, []);

        if (!list.loose) {
          // Check if list should be loose
          const spacers = list.items[i].tokens.filter(t => t.type === 'space');
          const hasMultipleLineBreaks = spacers.length > 0 && spacers.some(t => /\n.*\n/.test(t.raw));

          list.loose = hasMultipleLineBreaks;
        }
      }

      // Set all items to loose if list is loose
      if (list.loose) {
        for (i = 0; i < l; i++) {
          list.items[i].loose = true;
        }
      }

      return list;
    }
  }

  html(src) {
    const cap = this.rules.block.html.exec(src);
    if (cap) {
      const token = {
        type: 'html',
        raw: cap[0],
        pre: !this.options.sanitizer
          && (cap[1] === 'pre' || cap[1] === 'script' || cap[1] === 'style'),
        text: cap[0]
      };
      if (this.options.sanitize) {
        const text = this.options.sanitizer ? this.options.sanitizer(cap[0]) : escape(cap[0]);
        token.type = 'paragraph';
        token.text = text;
        token.tokens = this.lexer.inline(text);
      }
      return token;
    }
  }

  def(src) {
    const cap = this.rules.block.def.exec(src);
    if (cap) {
      const tag = cap[1].toLowerCase().replace(/\s+/g, ' ');
      const href = cap[2] ? cap[2].replace(/^<(.*)>$/, '$1').replace(this.rules.inline._escapes, '$1') : '';
      const title = cap[3] ? cap[3].substring(1, cap[3].length - 1).replace(this.rules.inline._escapes, '$1') : cap[3];
      return {
        type: 'def',
        tag,
        raw: cap[0],
        href,
        title
      };
    }
  }

  table(src) {
    const cap = this.rules.block.table.exec(src);
    if (cap) {
      const item = {
        type: 'table',
        header: splitCells(cap[1]).map(c => { return { text: c }; }),
        align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
        rows: cap[3] && cap[3].trim() ? cap[3].replace(/\n[ \t]*$/, '').split('\n') : []
      };

      if (item.header.length === item.align.length) {
        item.raw = cap[0];

        let l = item.align.length;
        let i, j, k, row;
        for (i = 0; i < l; i++) {
          if (/^ *-+: *$/.test(item.align[i])) {
            item.align[i] = 'right';
          } else if (/^ *:-+: *$/.test(item.align[i])) {
            item.align[i] = 'center';
          } else if (/^ *:-+ *$/.test(item.align[i])) {
            item.align[i] = 'left';
          } else {
            item.align[i] = null;
          }
        }

        l = item.rows.length;
        for (i = 0; i < l; i++) {
          item.rows[i] = splitCells(item.rows[i], item.header.length).map(c => { return { text: c }; });
        }

        // parse child tokens inside headers and cells

        // header child tokens
        l = item.header.length;
        for (j = 0; j < l; j++) {
          item.header[j].tokens = this.lexer.inline(item.header[j].text);
        }

        // cell child tokens
        l = item.rows.length;
        for (j = 0; j < l; j++) {
          row = item.rows[j];
          for (k = 0; k < row.length; k++) {
            row[k].tokens = this.lexer.inline(row[k].text);
          }
        }

        return item;
      }
    }
  }

  lheading(src) {
    const cap = this.rules.block.lheading.exec(src);
    if (cap) {
      return {
        type: 'heading',
        raw: cap[0],
        depth: cap[2].charAt(0) === '=' ? 1 : 2,
        text: cap[1],
        tokens: this.lexer.inline(cap[1])
      };
    }
  }

  paragraph(src) {
    const cap = this.rules.block.paragraph.exec(src);
    if (cap) {
      const text = cap[1].charAt(cap[1].length - 1) === '\n'
        ? cap[1].slice(0, -1)
        : cap[1];
      return {
        type: 'paragraph',
        raw: cap[0],
        text,
        tokens: this.lexer.inline(text)
      };
    }
  }

  text(src) {
    const cap = this.rules.block.text.exec(src);
    if (cap) {
      return {
        type: 'text',
        raw: cap[0],
        text: cap[0],
        tokens: this.lexer.inline(cap[0])
      };
    }
  }

  escape(src) {
    const cap = this.rules.inline.escape.exec(src);
    if (cap) {
      return {
        type: 'escape',
        raw: cap[0],
        text: escape(cap[1])
      };
    }
  }

  tag(src) {
    const cap = this.rules.inline.tag.exec(src);
    if (cap) {
      if (!this.lexer.state.inLink && /^<a /i.test(cap[0])) {
        this.lexer.state.inLink = true;
      } else if (this.lexer.state.inLink && /^<\/a>/i.test(cap[0])) {
        this.lexer.state.inLink = false;
      }
      if (!this.lexer.state.inRawBlock && /^<(pre|code|kbd|script)(\s|>)/i.test(cap[0])) {
        this.lexer.state.inRawBlock = true;
      } else if (this.lexer.state.inRawBlock && /^<\/(pre|code|kbd|script)(\s|>)/i.test(cap[0])) {
        this.lexer.state.inRawBlock = false;
      }

      return {
        type: this.options.sanitize
          ? 'text'
          : 'html',
        raw: cap[0],
        inLink: this.lexer.state.inLink,
        inRawBlock: this.lexer.state.inRawBlock,
        text: this.options.sanitize
          ? (this.options.sanitizer
            ? this.options.sanitizer(cap[0])
            : escape(cap[0]))
          : cap[0]
      };
    }
  }

  link(src) {
    const cap = this.rules.inline.link.exec(src);
    if (cap) {
      const trimmedUrl = cap[2].trim();
      if (!this.options.pedantic && /^</.test(trimmedUrl)) {
        // commonmark requires matching angle brackets
        if (!(/>$/.test(trimmedUrl))) {
          return;
        }

        // ending angle bracket cannot be escaped
        const rtrimSlash = rtrim(trimmedUrl.slice(0, -1), '\\');
        if ((trimmedUrl.length - rtrimSlash.length) % 2 === 0) {
          return;
        }
      } else {
        // find closing parenthesis
        const lastParenIndex = findClosingBracket(cap[2], '()');
        if (lastParenIndex > -1) {
          const start = cap[0].indexOf('!') === 0 ? 5 : 4;
          const linkLen = start + cap[1].length + lastParenIndex;
          cap[2] = cap[2].substring(0, lastParenIndex);
          cap[0] = cap[0].substring(0, linkLen).trim();
          cap[3] = '';
        }
      }
      let href = cap[2];
      let title = '';
      if (this.options.pedantic) {
        // split pedantic href and title
        const link = /^([^'"]*[^\s])\s+(['"])(.*)\2/.exec(href);

        if (link) {
          href = link[1];
          title = link[3];
        }
      } else {
        title = cap[3] ? cap[3].slice(1, -1) : '';
      }

      href = href.trim();
      if (/^</.test(href)) {
        if (this.options.pedantic && !(/>$/.test(trimmedUrl))) {
          // pedantic allows starting angle bracket without ending angle bracket
          href = href.slice(1);
        } else {
          href = href.slice(1, -1);
        }
      }
      return outputLink(cap, {
        href: href ? href.replace(this.rules.inline._escapes, '$1') : href,
        title: title ? title.replace(this.rules.inline._escapes, '$1') : title
      }, cap[0], this.lexer);
    }
  }

  reflink(src, links) {
    let cap;
    if ((cap = this.rules.inline.reflink.exec(src))
        || (cap = this.rules.inline.nolink.exec(src))) {
      let link = (cap[2] || cap[1]).replace(/\s+/g, ' ');
      link = links[link.toLowerCase()];
      if (!link) {
        const text = cap[0].charAt(0);
        return {
          type: 'text',
          raw: text,
          text
        };
      }
      return outputLink(cap, link, cap[0], this.lexer);
    }
  }

  emStrong(src, maskedSrc, prevChar = '') {
    let match = this.rules.inline.emStrong.lDelim.exec(src);
    if (!match) return;

    // _ can't be between two alphanumerics. \p{L}\p{N} includes non-english alphabet/numbers as well
    if (match[3] && prevChar.match(/[\p{L}\p{N}]/u)) return;

    const nextChar = match[1] || match[2] || '';

    if (!nextChar || (nextChar && (prevChar === '' || this.rules.inline.punctuation.exec(prevChar)))) {
      const lLength = match[0].length - 1;
      let rDelim, rLength, delimTotal = lLength, midDelimTotal = 0;

      const endReg = match[0][0] === '*' ? this.rules.inline.emStrong.rDelimAst : this.rules.inline.emStrong.rDelimUnd;
      endReg.lastIndex = 0;

      // Clip maskedSrc to same section of string as src (move to lexer?)
      maskedSrc = maskedSrc.slice(-1 * src.length + lLength);

      while ((match = endReg.exec(maskedSrc)) != null) {
        rDelim = match[1] || match[2] || match[3] || match[4] || match[5] || match[6];

        if (!rDelim) continue; // skip single * in __abc*abc__

        rLength = rDelim.length;

        if (match[3] || match[4]) { // found another Left Delim
          delimTotal += rLength;
          continue;
        } else if (match[5] || match[6]) { // either Left or Right Delim
          if (lLength % 3 && !((lLength + rLength) % 3)) {
            midDelimTotal += rLength;
            continue; // CommonMark Emphasis Rules 9-10
          }
        }

        delimTotal -= rLength;

        if (delimTotal > 0) continue; // Haven't found enough closing delimiters

        // Remove extra characters. *a*** -> *a*
        rLength = Math.min(rLength, rLength + delimTotal + midDelimTotal);

        const raw = src.slice(0, lLength + match.index + (match[0].length - rDelim.length) + rLength);

        // Create `em` if smallest delimiter has odd char count. *a***
        if (Math.min(lLength, rLength) % 2) {
          const text = raw.slice(1, -1);
          return {
            type: 'em',
            raw,
            text,
            tokens: this.lexer.inlineTokens(text)
          };
        }

        // Create 'strong' if smallest delimiter has even char count. **a***
        const text = raw.slice(2, -2);
        return {
          type: 'strong',
          raw,
          text,
          tokens: this.lexer.inlineTokens(text)
        };
      }
    }
  }

  codespan(src) {
    const cap = this.rules.inline.code.exec(src);
    if (cap) {
      let text = cap[2].replace(/\n/g, ' ');
      const hasNonSpaceChars = /[^ ]/.test(text);
      const hasSpaceCharsOnBothEnds = /^ /.test(text) && / $/.test(text);
      if (hasNonSpaceChars && hasSpaceCharsOnBothEnds) {
        text = text.substring(1, text.length - 1);
      }
      text = escape(text, true);
      return {
        type: 'codespan',
        raw: cap[0],
        text
      };
    }
  }

  br(src) {
    const cap = this.rules.inline.br.exec(src);
    if (cap) {
      return {
        type: 'br',
        raw: cap[0]
      };
    }
  }

  del(src) {
    const cap = this.rules.inline.del.exec(src);
    if (cap) {
      return {
        type: 'del',
        raw: cap[0],
        text: cap[2],
        tokens: this.lexer.inlineTokens(cap[2])
      };
    }
  }

  autolink(src, mangle) {
    const cap = this.rules.inline.autolink.exec(src);
    if (cap) {
      let text, href;
      if (cap[2] === '@') {
        text = escape(this.options.mangle ? mangle(cap[1]) : cap[1]);
        href = 'mailto:' + text;
      } else {
        text = escape(cap[1]);
        href = text;
      }

      return {
        type: 'link',
        raw: cap[0],
        text,
        href,
        tokens: [
          {
            type: 'text',
            raw: text,
            text
          }
        ]
      };
    }
  }

  url(src, mangle) {
    let cap;
    if (cap = this.rules.inline.url.exec(src)) {
      let text, href;
      if (cap[2] === '@') {
        text = escape(this.options.mangle ? mangle(cap[0]) : cap[0]);
        href = 'mailto:' + text;
      } else {
        // do extended autolink path validation
        let prevCapZero;
        do {
          prevCapZero = cap[0];
          cap[0] = this.rules.inline._backpedal.exec(cap[0])[0];
        } while (prevCapZero !== cap[0]);
        text = escape(cap[0]);
        if (cap[1] === 'www.') {
          href = 'http://' + cap[0];
        } else {
          href = cap[0];
        }
      }
      return {
        type: 'link',
        raw: cap[0],
        text,
        href,
        tokens: [
          {
            type: 'text',
            raw: text,
            text
          }
        ]
      };
    }
  }

  inlineText(src, smartypants) {
    const cap = this.rules.inline.text.exec(src);
    if (cap) {
      let text;
      if (this.lexer.state.inRawBlock) {
        text = this.options.sanitize ? (this.options.sanitizer ? this.options.sanitizer(cap[0]) : escape(cap[0])) : cap[0];
      } else {
        text = escape(this.options.smartypants ? smartypants(cap[0]) : cap[0]);
      }
      return {
        type: 'text',
        raw: cap[0],
        text
      };
    }
  }
}

/**
 * Block-Level Grammar
 */
const block = {
  newline: /^(?: *(?:\n|$))+/,
  code: /^( {4}[^\n]+(?:\n(?: *(?:\n|$))*)?)+/,
  fences: /^ {0,3}(`{3,}(?=[^`\n]*\n)|~{3,})([^\n]*)\n(?:|([\s\S]*?)\n)(?: {0,3}\1[~`]* *(?=\n|$)|$)/,
  hr: /^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/,
  heading: /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,
  blockquote: /^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/,
  list: /^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/,
  html: '^ {0,3}(?:' // optional indentation
    + '<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)' // (1)
    + '|comment[^\\n]*(\\n+|$)' // (2)
    + '|<\\?[\\s\\S]*?(?:\\?>\\n*|$)' // (3)
    + '|<![A-Z][\\s\\S]*?(?:>\\n*|$)' // (4)
    + '|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)' // (5)
    + '|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n *)+\\n|$)' // (6)
    + '|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n *)+\\n|$)' // (7) open tag
    + '|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n *)+\\n|$)' // (7) closing tag
    + ')',
  def: /^ {0,3}\[(label)\]: *(?:\n *)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n *)?| *\n *)(title))? *(?:\n+|$)/,
  table: noopTest,
  lheading: /^((?:.|\n(?!\n))+?)\n {0,3}(=+|-+) *(?:\n+|$)/,
  // regex template, placeholders will be replaced according to different paragraph
  // interruption rules of commonmark and the original markdown spec:
  _paragraph: /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/,
  text: /^[^\n]+/
};

block._label = /(?!\s*\])(?:\\.|[^\[\]\\])+/;
block._title = /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/;
block.def = edit(block.def)
  .replace('label', block._label)
  .replace('title', block._title)
  .getRegex();

block.bullet = /(?:[*+-]|\d{1,9}[.)])/;
block.listItemStart = edit(/^( *)(bull) */)
  .replace('bull', block.bullet)
  .getRegex();

block.list = edit(block.list)
  .replace(/bull/g, block.bullet)
  .replace('hr', '\\n+(?=\\1?(?:(?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$))')
  .replace('def', '\\n+(?=' + block.def.source + ')')
  .getRegex();

block._tag = 'address|article|aside|base|basefont|blockquote|body|caption'
  + '|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption'
  + '|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe'
  + '|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option'
  + '|p|param|section|source|summary|table|tbody|td|tfoot|th|thead|title|tr'
  + '|track|ul';
block._comment = /<!--(?!-?>)[\s\S]*?(?:-->|$)/;
block.html = edit(block.html, 'i')
  .replace('comment', block._comment)
  .replace('tag', block._tag)
  .replace('attribute', / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/)
  .getRegex();

block.paragraph = edit(block._paragraph)
  .replace('hr', block.hr)
  .replace('heading', ' {0,3}#{1,6} ')
  .replace('|lheading', '') // setex headings don't interrupt commonmark paragraphs
  .replace('|table', '')
  .replace('blockquote', ' {0,3}>')
  .replace('fences', ' {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n')
  .replace('list', ' {0,3}(?:[*+-]|1[.)]) ') // only lists starting from 1 can interrupt
  .replace('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)')
  .replace('tag', block._tag) // pars can be interrupted by type (6) html blocks
  .getRegex();

block.blockquote = edit(block.blockquote)
  .replace('paragraph', block.paragraph)
  .getRegex();

/**
 * Normal Block Grammar
 */

block.normal = merge({}, block);

/**
 * GFM Block Grammar
 */

block.gfm = merge({}, block.normal, {
  table: '^ *([^\\n ].*\\|.*)\\n' // Header
    + ' {0,3}(?:\\| *)?(:?-+:? *(?:\\| *:?-+:? *)*)(?:\\| *)?' // Align
    + '(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)' // Cells
});

block.gfm.table = edit(block.gfm.table)
  .replace('hr', block.hr)
  .replace('heading', ' {0,3}#{1,6} ')
  .replace('blockquote', ' {0,3}>')
  .replace('code', ' {4}[^\\n]')
  .replace('fences', ' {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n')
  .replace('list', ' {0,3}(?:[*+-]|1[.)]) ') // only lists starting from 1 can interrupt
  .replace('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)')
  .replace('tag', block._tag) // tables can be interrupted by type (6) html blocks
  .getRegex();

block.gfm.paragraph = edit(block._paragraph)
  .replace('hr', block.hr)
  .replace('heading', ' {0,3}#{1,6} ')
  .replace('|lheading', '') // setex headings don't interrupt commonmark paragraphs
  .replace('table', block.gfm.table) // interrupt paragraphs with table
  .replace('blockquote', ' {0,3}>')
  .replace('fences', ' {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n')
  .replace('list', ' {0,3}(?:[*+-]|1[.)]) ') // only lists starting from 1 can interrupt
  .replace('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)')
  .replace('tag', block._tag) // pars can be interrupted by type (6) html blocks
  .getRegex();
/**
 * Pedantic grammar (original John Gruber's loose markdown specification)
 */

block.pedantic = merge({}, block.normal, {
  html: edit(
    '^ *(?:comment *(?:\\n|\\s*$)'
    + '|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)' // closed tag
    + '|<tag(?:"[^"]*"|\'[^\']*\'|\\s[^\'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))')
    .replace('comment', block._comment)
    .replace(/tag/g, '(?!(?:'
      + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub'
      + '|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)'
      + '\\b)\\w+(?!:|[^\\w\\s@]*@)\\b')
    .getRegex(),
  def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
  heading: /^(#{1,6})(.*)(?:\n+|$)/,
  fences: noopTest, // fences not supported
  lheading: /^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,
  paragraph: edit(block.normal._paragraph)
    .replace('hr', block.hr)
    .replace('heading', ' *#{1,6} *[^\n]')
    .replace('lheading', block.lheading)
    .replace('blockquote', ' {0,3}>')
    .replace('|fences', '')
    .replace('|list', '')
    .replace('|html', '')
    .getRegex()
});

/**
 * Inline-Level Grammar
 */
const inline = {
  escape: /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,
  autolink: /^<(scheme:[^\s\x00-\x1f<>]*|email)>/,
  url: noopTest,
  tag: '^comment'
    + '|^</[a-zA-Z][\\w:-]*\\s*>' // self-closing tag
    + '|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>' // open tag
    + '|^<\\?[\\s\\S]*?\\?>' // processing instruction, e.g. <?php ?>
    + '|^<![a-zA-Z]+\\s[\\s\\S]*?>' // declaration, e.g. <!DOCTYPE html>
    + '|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>', // CDATA section
  link: /^!?\[(label)\]\(\s*(href)(?:\s+(title))?\s*\)/,
  reflink: /^!?\[(label)\]\[(ref)\]/,
  nolink: /^!?\[(ref)\](?:\[\])?/,
  reflinkSearch: 'reflink|nolink(?!\\()',
  emStrong: {
    lDelim: /^(?:\*+(?:([punct_])|[^\s*]))|^_+(?:([punct*])|([^\s_]))/,
    //        (1) and (2) can only be a Right Delimiter. (3) and (4) can only be Left.  (5) and (6) can be either Left or Right.
    //          () Skip orphan inside strong                                      () Consume to delim     (1) #***                (2) a***#, a***                             (3) #***a, ***a                 (4) ***#              (5) #***#                 (6) a***a
    rDelimAst: /^(?:[^_*\\]|\\.)*?\_\_(?:[^_*\\]|\\.)*?\*(?:[^_*\\]|\\.)*?(?=\_\_)|(?:[^*\\]|\\.)+(?=[^*])|[punct_](\*+)(?=[\s]|$)|(?:[^punct*_\s\\]|\\.)(\*+)(?=[punct_\s]|$)|[punct_\s](\*+)(?=[^punct*_\s])|[\s](\*+)(?=[punct_])|[punct_](\*+)(?=[punct_])|(?:[^punct*_\s\\]|\\.)(\*+)(?=[^punct*_\s])/,
    rDelimUnd: /^(?:[^_*\\]|\\.)*?\*\*(?:[^_*\\]|\\.)*?\_(?:[^_*\\]|\\.)*?(?=\*\*)|(?:[^_\\]|\\.)+(?=[^_])|[punct*](\_+)(?=[\s]|$)|(?:[^punct*_\s\\]|\\.)(\_+)(?=[punct*\s]|$)|[punct*\s](\_+)(?=[^punct*_\s])|[\s](\_+)(?=[punct*])|[punct*](\_+)(?=[punct*])/ // ^- Not allowed for _
  },
  code: /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,
  br: /^( {2,}|\\)\n(?!\s*$)/,
  del: noopTest,
  text: /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,
  punctuation: /^([\spunctuation])/
};

// list of punctuation marks from CommonMark spec
// without * and _ to handle the different emphasis markers * and _
inline._punctuation = '!"#$%&\'()+\\-.,/:;<=>?@\\[\\]`^{|}~';
inline.punctuation = edit(inline.punctuation).replace(/punctuation/g, inline._punctuation).getRegex();

// sequences em should skip over [title](link), `code`, <html>
inline.blockSkip = /\[[^\]]*?\]\([^\)]*?\)|`[^`]*?`|<[^>]*?>/g;
// lookbehind is not available on Safari as of version 16
// inline.escapedEmSt = /(?<=(?:^|[^\\)(?:\\[^])*)\\[*_]/g;
inline.escapedEmSt = /(?:^|[^\\])(?:\\\\)*\\[*_]/g;

inline._comment = edit(block._comment).replace('(?:-->|$)', '-->').getRegex();

inline.emStrong.lDelim = edit(inline.emStrong.lDelim)
  .replace(/punct/g, inline._punctuation)
  .getRegex();

inline.emStrong.rDelimAst = edit(inline.emStrong.rDelimAst, 'g')
  .replace(/punct/g, inline._punctuation)
  .getRegex();

inline.emStrong.rDelimUnd = edit(inline.emStrong.rDelimUnd, 'g')
  .replace(/punct/g, inline._punctuation)
  .getRegex();

inline._escapes = /\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/g;

inline._scheme = /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/;
inline._email = /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/;
inline.autolink = edit(inline.autolink)
  .replace('scheme', inline._scheme)
  .replace('email', inline._email)
  .getRegex();

inline._attribute = /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/;

inline.tag = edit(inline.tag)
  .replace('comment', inline._comment)
  .replace('attribute', inline._attribute)
  .getRegex();

inline._label = /(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/;
inline._href = /<(?:\\.|[^\n<>\\])+>|[^\s\x00-\x1f]*/;
inline._title = /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/;

inline.link = edit(inline.link)
  .replace('label', inline._label)
  .replace('href', inline._href)
  .replace('title', inline._title)
  .getRegex();

inline.reflink = edit(inline.reflink)
  .replace('label', inline._label)
  .replace('ref', block._label)
  .getRegex();

inline.nolink = edit(inline.nolink)
  .replace('ref', block._label)
  .getRegex();

inline.reflinkSearch = edit(inline.reflinkSearch, 'g')
  .replace('reflink', inline.reflink)
  .replace('nolink', inline.nolink)
  .getRegex();

/**
 * Normal Inline Grammar
 */

inline.normal = merge({}, inline);

/**
 * Pedantic Inline Grammar
 */

inline.pedantic = merge({}, inline.normal, {
  strong: {
    start: /^__|\*\*/,
    middle: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
    endAst: /\*\*(?!\*)/g,
    endUnd: /__(?!_)/g
  },
  em: {
    start: /^_|\*/,
    middle: /^()\*(?=\S)([\s\S]*?\S)\*(?!\*)|^_(?=\S)([\s\S]*?\S)_(?!_)/,
    endAst: /\*(?!\*)/g,
    endUnd: /_(?!_)/g
  },
  link: edit(/^!?\[(label)\]\((.*?)\)/)
    .replace('label', inline._label)
    .getRegex(),
  reflink: edit(/^!?\[(label)\]\s*\[([^\]]*)\]/)
    .replace('label', inline._label)
    .getRegex()
});

/**
 * GFM Inline Grammar
 */

inline.gfm = merge({}, inline.normal, {
  escape: edit(inline.escape).replace('])', '~|])').getRegex(),
  _extended_email: /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/,
  url: /^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/,
  _backpedal: /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,
  del: /^(~~?)(?=[^\s~])([\s\S]*?[^\s~])\1(?=[^~]|$)/,
  text: /^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/
});

inline.gfm.url = edit(inline.gfm.url, 'i')
  .replace('email', inline.gfm._extended_email)
  .getRegex();
/**
 * GFM + Line Breaks Inline Grammar
 */

inline.breaks = merge({}, inline.gfm, {
  br: edit(inline.br).replace('{2,}', '*').getRegex(),
  text: edit(inline.gfm.text)
    .replace('\\b_', '\\b_| {2,}\\n')
    .replace(/\{2,\}/g, '*')
    .getRegex()
});

/**
 * smartypants text replacement
 * @param {string} text
 */
function smartypants(text) {
  return text
    // em-dashes
    .replace(/---/g, '\u2014')
    // en-dashes
    .replace(/--/g, '\u2013')
    // opening singles
    .replace(/(^|[-\u2014/(\[{"\s])'/g, '$1\u2018')
    // closing singles & apostrophes
    .replace(/'/g, '\u2019')
    // opening doubles
    .replace(/(^|[-\u2014/(\[{\u2018\s])"/g, '$1\u201c')
    // closing doubles
    .replace(/"/g, '\u201d')
    // ellipses
    .replace(/\.{3}/g, '\u2026');
}

/**
 * mangle email addresses
 * @param {string} text
 */
function mangle(text) {
  let out = '',
    i,
    ch;

  const l = text.length;
  for (i = 0; i < l; i++) {
    ch = text.charCodeAt(i);
    if (Math.random() > 0.5) {
      ch = 'x' + ch.toString(16);
    }
    out += '&#' + ch + ';';
  }

  return out;
}

/**
 * Block Lexer
 */
class Lexer {
  constructor(options) {
    this.tokens = [];
    this.tokens.links = Object.create(null);
    this.options = options || defaults;
    this.options.tokenizer = this.options.tokenizer || new Tokenizer();
    this.tokenizer = this.options.tokenizer;
    this.tokenizer.options = this.options;
    this.tokenizer.lexer = this;
    this.inlineQueue = [];
    this.state = {
      inLink: false,
      inRawBlock: false,
      top: true
    };

    const rules = {
      block: block.normal,
      inline: inline.normal
    };

    if (this.options.pedantic) {
      rules.block = block.pedantic;
      rules.inline = inline.pedantic;
    } else if (this.options.gfm) {
      rules.block = block.gfm;
      if (this.options.breaks) {
        rules.inline = inline.breaks;
      } else {
        rules.inline = inline.gfm;
      }
    }
    this.tokenizer.rules = rules;
  }

  /**
   * Expose Rules
   */
  static get rules() {
    return {
      block,
      inline
    };
  }

  /**
   * Static Lex Method
   */
  static lex(src, options) {
    const lexer = new Lexer(options);
    return lexer.lex(src);
  }

  /**
   * Static Lex Inline Method
   */
  static lexInline(src, options) {
    const lexer = new Lexer(options);
    return lexer.inlineTokens(src);
  }

  /**
   * Preprocessing
   */
  lex(src) {
    src = src
      .replace(/\r\n|\r/g, '\n');

    this.blockTokens(src, this.tokens);

    let next;
    while (next = this.inlineQueue.shift()) {
      this.inlineTokens(next.src, next.tokens);
    }

    return this.tokens;
  }

  /**
   * Lexing
   */
  blockTokens(src, tokens = []) {
    if (this.options.pedantic) {
      src = src.replace(/\t/g, '    ').replace(/^ +$/gm, '');
    } else {
      src = src.replace(/^( *)(\t+)/gm, (_, leading, tabs) => {
        return leading + '    '.repeat(tabs.length);
      });
    }

    let token, lastToken, cutSrc, lastParagraphClipped;

    while (src) {
      if (this.options.extensions
        && this.options.extensions.block
        && this.options.extensions.block.some((extTokenizer) => {
          if (token = extTokenizer.call({ lexer: this }, src, tokens)) {
            src = src.substring(token.raw.length);
            tokens.push(token);
            return true;
          }
          return false;
        })) {
        continue;
      }

      // newline
      if (token = this.tokenizer.space(src)) {
        src = src.substring(token.raw.length);
        if (token.raw.length === 1 && tokens.length > 0) {
          // if there's a single \n as a spacer, it's terminating the last line,
          // so move it there so that we don't get unecessary paragraph tags
          tokens[tokens.length - 1].raw += '\n';
        } else {
          tokens.push(token);
        }
        continue;
      }

      // code
      if (token = this.tokenizer.code(src)) {
        src = src.substring(token.raw.length);
        lastToken = tokens[tokens.length - 1];
        // An indented code block cannot interrupt a paragraph.
        if (lastToken && (lastToken.type === 'paragraph' || lastToken.type === 'text')) {
          lastToken.raw += '\n' + token.raw;
          lastToken.text += '\n' + token.text;
          this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
        } else {
          tokens.push(token);
        }
        continue;
      }

      // fences
      if (token = this.tokenizer.fences(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }

      // heading
      if (token = this.tokenizer.heading(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }

      // hr
      if (token = this.tokenizer.hr(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }

      // blockquote
      if (token = this.tokenizer.blockquote(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }

      // list
      if (token = this.tokenizer.list(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }

      // html
      if (token = this.tokenizer.html(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }

      // def
      if (token = this.tokenizer.def(src)) {
        src = src.substring(token.raw.length);
        lastToken = tokens[tokens.length - 1];
        if (lastToken && (lastToken.type === 'paragraph' || lastToken.type === 'text')) {
          lastToken.raw += '\n' + token.raw;
          lastToken.text += '\n' + token.raw;
          this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
        } else if (!this.tokens.links[token.tag]) {
          this.tokens.links[token.tag] = {
            href: token.href,
            title: token.title
          };
        }
        continue;
      }

      // table (gfm)
      if (token = this.tokenizer.table(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }

      // lheading
      if (token = this.tokenizer.lheading(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }

      // top-level paragraph
      // prevent paragraph consuming extensions by clipping 'src' to extension start
      cutSrc = src;
      if (this.options.extensions && this.options.extensions.startBlock) {
        let startIndex = Infinity;
        const tempSrc = src.slice(1);
        let tempStart;
        this.options.extensions.startBlock.forEach(function(getStartIndex) {
          tempStart = getStartIndex.call({ lexer: this }, tempSrc);
          if (typeof tempStart === 'number' && tempStart >= 0) { startIndex = Math.min(startIndex, tempStart); }
        });
        if (startIndex < Infinity && startIndex >= 0) {
          cutSrc = src.substring(0, startIndex + 1);
        }
      }
      if (this.state.top && (token = this.tokenizer.paragraph(cutSrc))) {
        lastToken = tokens[tokens.length - 1];
        if (lastParagraphClipped && lastToken.type === 'paragraph') {
          lastToken.raw += '\n' + token.raw;
          lastToken.text += '\n' + token.text;
          this.inlineQueue.pop();
          this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
        } else {
          tokens.push(token);
        }
        lastParagraphClipped = (cutSrc.length !== src.length);
        src = src.substring(token.raw.length);
        continue;
      }

      // text
      if (token = this.tokenizer.text(src)) {
        src = src.substring(token.raw.length);
        lastToken = tokens[tokens.length - 1];
        if (lastToken && lastToken.type === 'text') {
          lastToken.raw += '\n' + token.raw;
          lastToken.text += '\n' + token.text;
          this.inlineQueue.pop();
          this.inlineQueue[this.inlineQueue.length - 1].src = lastToken.text;
        } else {
          tokens.push(token);
        }
        continue;
      }

      if (src) {
        const errMsg = 'Infinite loop on byte: ' + src.charCodeAt(0);
        if (this.options.silent) {
          console.error(errMsg);
          break;
        } else {
          throw new Error(errMsg);
        }
      }
    }

    this.state.top = true;
    return tokens;
  }

  inline(src, tokens = []) {
    this.inlineQueue.push({ src, tokens });
    return tokens;
  }

  /**
   * Lexing/Compiling
   */
  inlineTokens(src, tokens = []) {
    let token, lastToken, cutSrc;

    // String with links masked to avoid interference with em and strong
    let maskedSrc = src;
    let match;
    let keepPrevChar, prevChar;

    // Mask out reflinks
    if (this.tokens.links) {
      const links = Object.keys(this.tokens.links);
      if (links.length > 0) {
        while ((match = this.tokenizer.rules.inline.reflinkSearch.exec(maskedSrc)) != null) {
          if (links.includes(match[0].slice(match[0].lastIndexOf('[') + 1, -1))) {
            maskedSrc = maskedSrc.slice(0, match.index) + '[' + repeatString('a', match[0].length - 2) + ']' + maskedSrc.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex);
          }
        }
      }
    }
    // Mask out other blocks
    while ((match = this.tokenizer.rules.inline.blockSkip.exec(maskedSrc)) != null) {
      maskedSrc = maskedSrc.slice(0, match.index) + '[' + repeatString('a', match[0].length - 2) + ']' + maskedSrc.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);
    }

    // Mask out escaped em & strong delimiters
    while ((match = this.tokenizer.rules.inline.escapedEmSt.exec(maskedSrc)) != null) {
      maskedSrc = maskedSrc.slice(0, match.index + match[0].length - 2) + '++' + maskedSrc.slice(this.tokenizer.rules.inline.escapedEmSt.lastIndex);
      this.tokenizer.rules.inline.escapedEmSt.lastIndex--;
    }

    while (src) {
      if (!keepPrevChar) {
        prevChar = '';
      }
      keepPrevChar = false;

      // extensions
      if (this.options.extensions
        && this.options.extensions.inline
        && this.options.extensions.inline.some((extTokenizer) => {
          if (token = extTokenizer.call({ lexer: this }, src, tokens)) {
            src = src.substring(token.raw.length);
            tokens.push(token);
            return true;
          }
          return false;
        })) {
        continue;
      }

      // escape
      if (token = this.tokenizer.escape(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }

      // tag
      if (token = this.tokenizer.tag(src)) {
        src = src.substring(token.raw.length);
        lastToken = tokens[tokens.length - 1];
        if (lastToken && token.type === 'text' && lastToken.type === 'text') {
          lastToken.raw += token.raw;
          lastToken.text += token.text;
        } else {
          tokens.push(token);
        }
        continue;
      }

      // link
      if (token = this.tokenizer.link(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }

      // reflink, nolink
      if (token = this.tokenizer.reflink(src, this.tokens.links)) {
        src = src.substring(token.raw.length);
        lastToken = tokens[tokens.length - 1];
        if (lastToken && token.type === 'text' && lastToken.type === 'text') {
          lastToken.raw += token.raw;
          lastToken.text += token.text;
        } else {
          tokens.push(token);
        }
        continue;
      }

      // em & strong
      if (token = this.tokenizer.emStrong(src, maskedSrc, prevChar)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }

      // code
      if (token = this.tokenizer.codespan(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }

      // br
      if (token = this.tokenizer.br(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }

      // del (gfm)
      if (token = this.tokenizer.del(src)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }

      // autolink
      if (token = this.tokenizer.autolink(src, mangle)) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }

      // url (gfm)
      if (!this.state.inLink && (token = this.tokenizer.url(src, mangle))) {
        src = src.substring(token.raw.length);
        tokens.push(token);
        continue;
      }

      // text
      // prevent inlineText consuming extensions by clipping 'src' to extension start
      cutSrc = src;
      if (this.options.extensions && this.options.extensions.startInline) {
        let startIndex = Infinity;
        const tempSrc = src.slice(1);
        let tempStart;
        this.options.extensions.startInline.forEach(function(getStartIndex) {
          tempStart = getStartIndex.call({ lexer: this }, tempSrc);
          if (typeof tempStart === 'number' && tempStart >= 0) { startIndex = Math.min(startIndex, tempStart); }
        });
        if (startIndex < Infinity && startIndex >= 0) {
          cutSrc = src.substring(0, startIndex + 1);
        }
      }
      if (token = this.tokenizer.inlineText(cutSrc, smartypants)) {
        src = src.substring(token.raw.length);
        if (token.raw.slice(-1) !== '_') { // Track prevChar before string of ____ started
          prevChar = token.raw.slice(-1);
        }
        keepPrevChar = true;
        lastToken = tokens[tokens.length - 1];
        if (lastToken && lastToken.type === 'text') {
          lastToken.raw += token.raw;
          lastToken.text += token.text;
        } else {
          tokens.push(token);
        }
        continue;
      }

      if (src) {
        const errMsg = 'Infinite loop on byte: ' + src.charCodeAt(0);
        if (this.options.silent) {
          console.error(errMsg);
          break;
        } else {
          throw new Error(errMsg);
        }
      }
    }

    return tokens;
  }
}

/**
 * Renderer
 */
class Renderer {
  constructor(options) {
    this.options = options || defaults;
  }

  code(code, infostring, escaped) {
    const lang = (infostring || '').match(/\S*/)[0];
    if (this.options.highlight) {
      const out = this.options.highlight(code, lang);
      if (out != null && out !== code) {
        escaped = true;
        code = out;
      }
    }

    code = code.replace(/\n$/, '') + '\n';

    if (!lang) {
      return '<pre><code>'
        + (escaped ? code : escape(code, true))
        + '</code></pre>\n';
    }

    return '<pre><code class="'
      + this.options.langPrefix
      + escape(lang)
      + '">'
      + (escaped ? code : escape(code, true))
      + '</code></pre>\n';
  }

  /**
   * @param {string} quote
   */
  blockquote(quote) {
    return `<blockquote>\n${quote}</blockquote>\n`;
  }

  html(html) {
    return html;
  }

  /**
   * @param {string} text
   * @param {string} level
   * @param {string} raw
   * @param {any} slugger
   */
  heading(text, level, raw, slugger) {
    if (this.options.headerIds) {
      const id = this.options.headerPrefix + slugger.slug(raw);
      return `<h${level} id="${id}">${text}</h${level}>\n`;
    }

    // ignore IDs
    return `<h${level}>${text}</h${level}>\n`;
  }

  hr() {
    return this.options.xhtml ? '<hr/>\n' : '<hr>\n';
  }

  list(body, ordered, start) {
    const type = ordered ? 'ol' : 'ul',
      startatt = (ordered && start !== 1) ? (' start="' + start + '"') : '';
    return '<' + type + startatt + '>\n' + body + '</' + type + '>\n';
  }

  /**
   * @param {string} text
   */
  listitem(text) {
    return `<li>${text}</li>\n`;
  }

  checkbox(checked) {
    return '<input '
      + (checked ? 'checked="" ' : '')
      + 'disabled="" type="checkbox"'
      + (this.options.xhtml ? ' /' : '')
      + '> ';
  }

  /**
   * @param {string} text
   */
  paragraph(text) {
    return `<p>${text}</p>\n`;
  }

  /**
   * @param {string} header
   * @param {string} body
   */
  table(header, body) {
    if (body) body = `<tbody>${body}</tbody>`;

    return '<table>\n'
      + '<thead>\n'
      + header
      + '</thead>\n'
      + body
      + '</table>\n';
  }

  /**
   * @param {string} content
   */
  tablerow(content) {
    return `<tr>\n${content}</tr>\n`;
  }

  tablecell(content, flags) {
    const type = flags.header ? 'th' : 'td';
    const tag = flags.align
      ? `<${type} align="${flags.align}">`
      : `<${type}>`;
    return tag + content + `</${type}>\n`;
  }

  /**
   * span level renderer
   * @param {string} text
   */
  strong(text) {
    return `<strong>${text}</strong>`;
  }

  /**
   * @param {string} text
   */
  em(text) {
    return `<em>${text}</em>`;
  }

  /**
   * @param {string} text
   */
  codespan(text) {
    return `<code>${text}</code>`;
  }

  br() {
    return this.options.xhtml ? '<br/>' : '<br>';
  }

  /**
   * @param {string} text
   */
  del(text) {
    return `<del>${text}</del>`;
  }

  /**
   * @param {string} href
   * @param {string} title
   * @param {string} text
   */
  link(href, title, text) {
    href = cleanUrl(this.options.sanitize, this.options.baseUrl, href);
    if (href === null) {
      return text;
    }
    let out = '<a href="' + href + '"';
    if (title) {
      out += ' title="' + title + '"';
    }
    out += '>' + text + '</a>';
    return out;
  }

  /**
   * @param {string} href
   * @param {string} title
   * @param {string} text
   */
  image(href, title, text) {
    href = cleanUrl(this.options.sanitize, this.options.baseUrl, href);
    if (href === null) {
      return text;
    }

    let out = `<img src="${href}" alt="${text}"`;
    if (title) {
      out += ` title="${title}"`;
    }
    out += this.options.xhtml ? '/>' : '>';
    return out;
  }

  text(text) {
    return text;
  }
}

/**
 * TextRenderer
 * returns only the textual part of the token
 */
class TextRenderer {
  // no need for block level renderers
  strong(text) {
    return text;
  }

  em(text) {
    return text;
  }

  codespan(text) {
    return text;
  }

  del(text) {
    return text;
  }

  html(text) {
    return text;
  }

  text(text) {
    return text;
  }

  link(href, title, text) {
    return '' + text;
  }

  image(href, title, text) {
    return '' + text;
  }

  br() {
    return '';
  }
}

/**
 * Slugger generates header id
 */
class Slugger {
  constructor() {
    this.seen = {};
  }

  /**
   * @param {string} value
   */
  serialize(value) {
    return value
      .toLowerCase()
      .trim()
      // remove html tags
      .replace(/<[!\/a-z].*?>/ig, '')
      // remove unwanted chars
      .replace(/[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~]/g, '')
      .replace(/\s/g, '-');
  }

  /**
   * Finds the next safe (unique) slug to use
   * @param {string} originalSlug
   * @param {boolean} isDryRun
   */
  getNextSafeSlug(originalSlug, isDryRun) {
    let slug = originalSlug;
    let occurenceAccumulator = 0;
    if (this.seen.hasOwnProperty(slug)) {
      occurenceAccumulator = this.seen[originalSlug];
      do {
        occurenceAccumulator++;
        slug = originalSlug + '-' + occurenceAccumulator;
      } while (this.seen.hasOwnProperty(slug));
    }
    if (!isDryRun) {
      this.seen[originalSlug] = occurenceAccumulator;
      this.seen[slug] = 0;
    }
    return slug;
  }

  /**
   * Convert string to unique id
   * @param {object} [options]
   * @param {boolean} [options.dryrun] Generates the next unique slug without
   * updating the internal accumulator.
   */
  slug(value, options = {}) {
    const slug = this.serialize(value);
    return this.getNextSafeSlug(slug, options.dryrun);
  }
}

/**
 * Parsing & Compiling
 */
class Parser {
  constructor(options) {
    this.options = options || defaults;
    this.options.renderer = this.options.renderer || new Renderer();
    this.renderer = this.options.renderer;
    this.renderer.options = this.options;
    this.textRenderer = new TextRenderer();
    this.slugger = new Slugger();
  }

  /**
   * Static Parse Method
   */
  static parse(tokens, options) {
    const parser = new Parser(options);
    return parser.parse(tokens);
  }

  /**
   * Static Parse Inline Method
   */
  static parseInline(tokens, options) {
    const parser = new Parser(options);
    return parser.parseInline(tokens);
  }

  /**
   * Parse Loop
   */
  parse(tokens, top = true) {
    let out = '',
      i,
      j,
      k,
      l2,
      l3,
      row,
      cell,
      header,
      body,
      token,
      ordered,
      start,
      loose,
      itemBody,
      item,
      checked,
      task,
      checkbox,
      ret;

    const l = tokens.length;
    for (i = 0; i < l; i++) {
      token = tokens[i];

      // Run any renderer extensions
      if (this.options.extensions && this.options.extensions.renderers && this.options.extensions.renderers[token.type]) {
        ret = this.options.extensions.renderers[token.type].call({ parser: this }, token);
        if (ret !== false || !['space', 'hr', 'heading', 'code', 'table', 'blockquote', 'list', 'html', 'paragraph', 'text'].includes(token.type)) {
          out += ret || '';
          continue;
        }
      }

      switch (token.type) {
        case 'space': {
          continue;
        }
        case 'hr': {
          out += this.renderer.hr();
          continue;
        }
        case 'heading': {
          out += this.renderer.heading(
            this.parseInline(token.tokens),
            token.depth,
            unescape(this.parseInline(token.tokens, this.textRenderer)),
            this.slugger);
          continue;
        }
        case 'code': {
          out += this.renderer.code(token.text,
            token.lang,
            token.escaped);
          continue;
        }
        case 'table': {
          header = '';

          // header
          cell = '';
          l2 = token.header.length;
          for (j = 0; j < l2; j++) {
            cell += this.renderer.tablecell(
              this.parseInline(token.header[j].tokens),
              { header: true, align: token.align[j] }
            );
          }
          header += this.renderer.tablerow(cell);

          body = '';
          l2 = token.rows.length;
          for (j = 0; j < l2; j++) {
            row = token.rows[j];

            cell = '';
            l3 = row.length;
            for (k = 0; k < l3; k++) {
              cell += this.renderer.tablecell(
                this.parseInline(row[k].tokens),
                { header: false, align: token.align[k] }
              );
            }

            body += this.renderer.tablerow(cell);
          }
          out += this.renderer.table(header, body);
          continue;
        }
        case 'blockquote': {
          body = this.parse(token.tokens);
          out += this.renderer.blockquote(body);
          continue;
        }
        case 'list': {
          ordered = token.ordered;
          start = token.start;
          loose = token.loose;
          l2 = token.items.length;

          body = '';
          for (j = 0; j < l2; j++) {
            item = token.items[j];
            checked = item.checked;
            task = item.task;

            itemBody = '';
            if (item.task) {
              checkbox = this.renderer.checkbox(checked);
              if (loose) {
                if (item.tokens.length > 0 && item.tokens[0].type === 'paragraph') {
                  item.tokens[0].text = checkbox + ' ' + item.tokens[0].text;
                  if (item.tokens[0].tokens && item.tokens[0].tokens.length > 0 && item.tokens[0].tokens[0].type === 'text') {
                    item.tokens[0].tokens[0].text = checkbox + ' ' + item.tokens[0].tokens[0].text;
                  }
                } else {
                  item.tokens.unshift({
                    type: 'text',
                    text: checkbox
                  });
                }
              } else {
                itemBody += checkbox;
              }
            }

            itemBody += this.parse(item.tokens, loose);
            body += this.renderer.listitem(itemBody, task, checked);
          }

          out += this.renderer.list(body, ordered, start);
          continue;
        }
        case 'html': {
          // TODO parse inline content if parameter markdown=1
          out += this.renderer.html(token.text);
          continue;
        }
        case 'paragraph': {
          out += this.renderer.paragraph(this.parseInline(token.tokens));
          continue;
        }
        case 'text': {
          body = token.tokens ? this.parseInline(token.tokens) : token.text;
          while (i + 1 < l && tokens[i + 1].type === 'text') {
            token = tokens[++i];
            body += '\n' + (token.tokens ? this.parseInline(token.tokens) : token.text);
          }
          out += top ? this.renderer.paragraph(body) : body;
          continue;
        }

        default: {
          const errMsg = 'Token with "' + token.type + '" type was not found.';
          if (this.options.silent) {
            console.error(errMsg);
            return;
          } else {
            throw new Error(errMsg);
          }
        }
      }
    }

    return out;
  }

  /**
   * Parse Inline Tokens
   */
  parseInline(tokens, renderer) {
    renderer = renderer || this.renderer;
    let out = '',
      i,
      token,
      ret;

    const l = tokens.length;
    for (i = 0; i < l; i++) {
      token = tokens[i];

      // Run any renderer extensions
      if (this.options.extensions && this.options.extensions.renderers && this.options.extensions.renderers[token.type]) {
        ret = this.options.extensions.renderers[token.type].call({ parser: this }, token);
        if (ret !== false || !['escape', 'html', 'link', 'image', 'strong', 'em', 'codespan', 'br', 'del', 'text'].includes(token.type)) {
          out += ret || '';
          continue;
        }
      }

      switch (token.type) {
        case 'escape': {
          out += renderer.text(token.text);
          break;
        }
        case 'html': {
          out += renderer.html(token.text);
          break;
        }
        case 'link': {
          out += renderer.link(token.href, token.title, this.parseInline(token.tokens, renderer));
          break;
        }
        case 'image': {
          out += renderer.image(token.href, token.title, token.text);
          break;
        }
        case 'strong': {
          out += renderer.strong(this.parseInline(token.tokens, renderer));
          break;
        }
        case 'em': {
          out += renderer.em(this.parseInline(token.tokens, renderer));
          break;
        }
        case 'codespan': {
          out += renderer.codespan(token.text);
          break;
        }
        case 'br': {
          out += renderer.br();
          break;
        }
        case 'del': {
          out += renderer.del(this.parseInline(token.tokens, renderer));
          break;
        }
        case 'text': {
          out += renderer.text(token.text);
          break;
        }
        default: {
          const errMsg = 'Token with "' + token.type + '" type was not found.';
          if (this.options.silent) {
            console.error(errMsg);
            return;
          } else {
            throw new Error(errMsg);
          }
        }
      }
    }
    return out;
  }
}

/**
 * Marked
 */
function marked(src, opt, callback) {
  // throw error in case of non string input
  if (typeof src === 'undefined' || src === null) {
    throw new Error('marked(): input parameter is undefined or null');
  }
  if (typeof src !== 'string') {
    throw new Error('marked(): input parameter is of type '
      + Object.prototype.toString.call(src) + ', string expected');
  }

  if (typeof opt === 'function') {
    callback = opt;
    opt = null;
  }

  opt = merge({}, marked.defaults, opt || {});
  checkSanitizeDeprecation(opt);

  if (callback) {
    const highlight = opt.highlight;
    let tokens;

    try {
      tokens = Lexer.lex(src, opt);
    } catch (e) {
      return callback(e);
    }

    const done = function(err) {
      let out;

      if (!err) {
        try {
          if (opt.walkTokens) {
            marked.walkTokens(tokens, opt.walkTokens);
          }
          out = Parser.parse(tokens, opt);
        } catch (e) {
          err = e;
        }
      }

      opt.highlight = highlight;

      return err
        ? callback(err)
        : callback(null, out);
    };

    if (!highlight || highlight.length < 3) {
      return done();
    }

    delete opt.highlight;

    if (!tokens.length) return done();

    let pending = 0;
    marked.walkTokens(tokens, function(token) {
      if (token.type === 'code') {
        pending++;
        setTimeout(() => {
          highlight(token.text, token.lang, function(err, code) {
            if (err) {
              return done(err);
            }
            if (code != null && code !== token.text) {
              token.text = code;
              token.escaped = true;
            }

            pending--;
            if (pending === 0) {
              done();
            }
          });
        }, 0);
      }
    });

    if (pending === 0) {
      done();
    }

    return;
  }

  function onError(e) {
    e.message += '\nPlease report this to https://github.com/markedjs/marked.';
    if (opt.silent) {
      return '<p>An error occurred:</p><pre>'
        + escape(e.message + '', true)
        + '</pre>';
    }
    throw e;
  }

  try {
    const tokens = Lexer.lex(src, opt);
    if (opt.walkTokens) {
      if (opt.async) {
        return Promise.all(marked.walkTokens(tokens, opt.walkTokens))
          .then(() => {
            return Parser.parse(tokens, opt);
          })
          .catch(onError);
      }
      marked.walkTokens(tokens, opt.walkTokens);
    }
    return Parser.parse(tokens, opt);
  } catch (e) {
    onError(e);
  }
}

/**
 * Options
 */

marked.options =
marked.setOptions = function(opt) {
  merge(marked.defaults, opt);
  changeDefaults(marked.defaults);
  return marked;
};

marked.getDefaults = getDefaults;

marked.defaults = defaults;

/**
 * Use Extension
 */

marked.use = function(...args) {
  const extensions = marked.defaults.extensions || { renderers: {}, childTokens: {} };

  args.forEach((pack) => {
    // copy options to new object
    const opts = merge({}, pack);

    // set async to true if it was set to true before
    opts.async = marked.defaults.async || opts.async;

    // ==-- Parse "addon" extensions --== //
    if (pack.extensions) {
      pack.extensions.forEach((ext) => {
        if (!ext.name) {
          throw new Error('extension name required');
        }
        if (ext.renderer) { // Renderer extensions
          const prevRenderer = extensions.renderers[ext.name];
          if (prevRenderer) {
            // Replace extension with func to run new extension but fall back if false
            extensions.renderers[ext.name] = function(...args) {
              let ret = ext.renderer.apply(this, args);
              if (ret === false) {
                ret = prevRenderer.apply(this, args);
              }
              return ret;
            };
          } else {
            extensions.renderers[ext.name] = ext.renderer;
          }
        }
        if (ext.tokenizer) { // Tokenizer Extensions
          if (!ext.level || (ext.level !== 'block' && ext.level !== 'inline')) {
            throw new Error("extension level must be 'block' or 'inline'");
          }
          if (extensions[ext.level]) {
            extensions[ext.level].unshift(ext.tokenizer);
          } else {
            extensions[ext.level] = [ext.tokenizer];
          }
          if (ext.start) { // Function to check for start of token
            if (ext.level === 'block') {
              if (extensions.startBlock) {
                extensions.startBlock.push(ext.start);
              } else {
                extensions.startBlock = [ext.start];
              }
            } else if (ext.level === 'inline') {
              if (extensions.startInline) {
                extensions.startInline.push(ext.start);
              } else {
                extensions.startInline = [ext.start];
              }
            }
          }
        }
        if (ext.childTokens) { // Child tokens to be visited by walkTokens
          extensions.childTokens[ext.name] = ext.childTokens;
        }
      });
      opts.extensions = extensions;
    }

    // ==-- Parse "overwrite" extensions --== //
    if (pack.renderer) {
      const renderer = marked.defaults.renderer || new Renderer();
      for (const prop in pack.renderer) {
        const prevRenderer = renderer[prop];
        // Replace renderer with func to run extension, but fall back if false
        renderer[prop] = (...args) => {
          let ret = pack.renderer[prop].apply(renderer, args);
          if (ret === false) {
            ret = prevRenderer.apply(renderer, args);
          }
          return ret;
        };
      }
      opts.renderer = renderer;
    }
    if (pack.tokenizer) {
      const tokenizer = marked.defaults.tokenizer || new Tokenizer();
      for (const prop in pack.tokenizer) {
        const prevTokenizer = tokenizer[prop];
        // Replace tokenizer with func to run extension, but fall back if false
        tokenizer[prop] = (...args) => {
          let ret = pack.tokenizer[prop].apply(tokenizer, args);
          if (ret === false) {
            ret = prevTokenizer.apply(tokenizer, args);
          }
          return ret;
        };
      }
      opts.tokenizer = tokenizer;
    }

    // ==-- Parse WalkTokens extensions --== //
    if (pack.walkTokens) {
      const walkTokens = marked.defaults.walkTokens;
      opts.walkTokens = function(token) {
        let values = [];
        values.push(pack.walkTokens.call(this, token));
        if (walkTokens) {
          values = values.concat(walkTokens.call(this, token));
        }
        return values;
      };
    }

    marked.setOptions(opts);
  });
};

/**
 * Run callback for every token
 */

marked.walkTokens = function(tokens, callback) {
  let values = [];
  for (const token of tokens) {
    values = values.concat(callback.call(marked, token));
    switch (token.type) {
      case 'table': {
        for (const cell of token.header) {
          values = values.concat(marked.walkTokens(cell.tokens, callback));
        }
        for (const row of token.rows) {
          for (const cell of row) {
            values = values.concat(marked.walkTokens(cell.tokens, callback));
          }
        }
        break;
      }
      case 'list': {
        values = values.concat(marked.walkTokens(token.items, callback));
        break;
      }
      default: {
        if (marked.defaults.extensions && marked.defaults.extensions.childTokens && marked.defaults.extensions.childTokens[token.type]) { // Walk any extensions
          marked.defaults.extensions.childTokens[token.type].forEach(function(childTokens) {
            values = values.concat(marked.walkTokens(token[childTokens], callback));
          });
        } else if (token.tokens) {
          values = values.concat(marked.walkTokens(token.tokens, callback));
        }
      }
    }
  }
  return values;
};

/**
 * Parse Inline
 * @param {string} src
 */
marked.parseInline = function(src, opt) {
  // throw error in case of non string input
  if (typeof src === 'undefined' || src === null) {
    throw new Error('marked.parseInline(): input parameter is undefined or null');
  }
  if (typeof src !== 'string') {
    throw new Error('marked.parseInline(): input parameter is of type '
      + Object.prototype.toString.call(src) + ', string expected');
  }

  opt = merge({}, marked.defaults, opt || {});
  checkSanitizeDeprecation(opt);

  try {
    const tokens = Lexer.lexInline(src, opt);
    if (opt.walkTokens) {
      marked.walkTokens(tokens, opt.walkTokens);
    }
    return Parser.parseInline(tokens, opt);
  } catch (e) {
    e.message += '\nPlease report this to https://github.com/markedjs/marked.';
    if (opt.silent) {
      return '<p>An error occurred:</p><pre>'
        + escape(e.message + '', true)
        + '</pre>';
    }
    throw e;
  }
};

/**
 * Expose
 */
marked.Parser = Parser;
marked.parser = Parser.parse;
marked.Renderer = Renderer;
marked.TextRenderer = TextRenderer;
marked.Lexer = Lexer;
marked.lexer = Lexer.lex;
marked.Tokenizer = Tokenizer;
marked.Slugger = Slugger;
marked.parse = marked;

const options = marked.options;
const setOptions = marked.setOptions;
const use = marked.use;
const walkTokens = marked.walkTokens;
const parseInline = marked.parseInline;
const parse = marked;
const parser = Parser.parse;
const lexer = Lexer.lex;




/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	!function() {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = function(exports, definition) {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	!function() {
/******/ 		__webpack_require__.o = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); }
/******/ 	}();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	!function() {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = function(exports) {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	}();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
!function() {
/*!*************************!*\
  !*** ./source/intel.js ***!
  \*************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _parse_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./parse_utils */ "./source/parse_utils.ts");
/* harmony import */ var _hotkey__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./hotkey */ "./source/hotkey.ts");
/* harmony import */ var _utilities__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./utilities */ "./source/utilities.ts");
/* harmony import */ var _ledger__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./ledger */ "./source/ledger.ts");
/* harmony import */ var _merge__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./merge */ "./source/merge.js");
/* harmony import */ var _chat__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./chat */ "./source/chat.ts");
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};






var SAT_VERSION = "2.28.005-git";
//TODO: Organize typescript to an interfaces directory
//TODO: Then make other game engine objects
// Part of your code is re-creating the game in typescript
// The other part is adding features
// Then there is a segment that is overwriting existing content to add small additions.
//Add custom settings when making a nwe game.
function modify_custom_game() {
    console.log("Running custom game settings modification");
    var selector = $("#contentArea > div > div.widget.fullscreen > div.widget.rel > div:nth-child(4) > div:nth-child(15) > select")[0];
    if (selector == undefined) {
        //Not in menu
        return;
    }
    var textString = "";
    for (var i = 2; i <= 32; ++i) {
        textString += "<option value=\"".concat(i, "\">").concat(i, " Players</option>");
    }
    console.log(textString);
    selector.innerHTML = textString;
}
setTimeout(modify_custom_game, 500);
//TODO: Make is within scanning function
//Share all tech display as tech is actively trading.
var display_tech_trading = function () {
    var npui = NeptunesPride.npui;
    var tech_trade_screen = npui.Screen("tech_trading");
    npui.onHideScreen(null, true);
    npui.onHideSelectionMenu();
    npui.trigger("hide_side_menu");
    npui.trigger("reset_edit_mode");
    npui.activeScreen = tech_trade_screen;
    tech_trade_screen.roost(npui.screenContainer);
    npui.layoutElement(tech_trade_screen);
    var trading = Crux.Text("", "rel pad12").rawHTML("Trading..");
    trading.roost(tech_trade_screen);
    tech_trade_screen.transact = function (text) {
        var trading = Crux.Text("", "rel pad8").rawHTML(text);
        trading.roost(tech_trade_screen);
    };
    return tech_trade_screen;
};
//Returns all stars I suppose
var _get_star_gis = function () {
    var stars = NeptunesPride.universe.galaxy.stars;
    var output = [];
    for (var s in stars) {
        var star = stars[s];
        output.push({
            x: star.x,
            y: star.y,
            owner: star.qualifiedAlias,
            economy: star.e,
            industry: star.i,
            science: star.s,
            ships: star.totalDefenses,
        });
    }
    return output;
};
var _get_weapons_next = function () {
    var research = get_research();
    if (research["current_name"] == "Weapons") {
        return research["current_eta"];
    }
    else if (research["next_name"] == "Weapons") {
        return research["next_eta"];
    }
    return Math.pow(10, 10);
};
var get_tech_trade_cost = function (from, to, tech_name) {
    if (tech_name === void 0) { tech_name = null; }
    var total_cost = 0;
    for (var _i = 0, _a = Object.entries(to.tech); _i < _a.length; _i++) {
        var _b = _a[_i], tech = _b[0], value = _b[1];
        if (tech_name == null || tech_name == tech) {
            var me = from.tech[tech].level;
            var you = value.level;
            for (var i = 1; i <= me - you; ++i) {
                //console.log(tech,(you+i),(you+i)*15)
                total_cost += (you + i) * NeptunesPride.gameConfig.tradeCost;
            }
        }
    }
    return total_cost;
};
//Hooks to buttons for sharing and buying
//Pretty simple hooks that can be added to a typescript file.
var apply_hooks = function () {
    NeptunesPride.np.on("share_all_tech", function (event, player) {
        var total_cost = get_tech_trade_cost((0,_utilities__WEBPACK_IMPORTED_MODULE_2__.get_hero)(NeptunesPride.universe), player);
        NeptunesPride.templates["confirm_tech_share_".concat(player.uid)] = "Are you sure you want to spend $".concat(total_cost, " to give ").concat(player.rawAlias, " all of your tech?");
        NeptunesPride.np.trigger("show_screen", [
            "confirm",
            {
                message: "confirm_tech_share_".concat(player.uid),
                eventKind: "confirm_trade_tech",
                eventData: player,
            },
        ]);
    });
    NeptunesPride.np.on("buy_all_tech", function (event, data) {
        var player = data.player;
        var cost = data.cost;
        NeptunesPride.templates["confirm_tech_share_".concat(player.uid)] = "Are you sure you want to spend $".concat(cost, " to buy all of ").concat(player.rawAlias, "'s tech? It is up to them to actually send it to you.");
        NeptunesPride.np.trigger("show_screen", [
            "confirm",
            {
                message: "confirm_tech_share_".concat(player.uid),
                eventKind: "confirm_buy_tech",
                eventData: data,
            },
        ]);
    });
    NeptunesPride.np.on("buy_one_tech", function (event, data) {
        var player = data.player;
        var tech = data.tech;
        var cost = data.cost;
        console.log(player);
        NeptunesPride.templates["confirm_tech_share_".concat(player.uid)] = "Are you sure you want to spend $".concat(cost, " to buy ").concat(tech, " from ").concat(player.rawAlias, "? It is up to them to actually send it to you.");
        NeptunesPride.np.trigger("show_screen", [
            "confirm",
            {
                message: "confirm_tech_share_".concat(player.uid),
                eventKind: "confirm_buy_tech",
                eventData: data,
            },
        ]);
    });
    NeptunesPride.np.on("confirm_trade_tech", function (even, player) {
        var hero = (0,_utilities__WEBPACK_IMPORTED_MODULE_2__.get_hero)(NeptunesPride.universe);
        var display = display_tech_trading();
        var close = function () {
            NeptunesPride.universe.selectPlayer(player);
            NeptunesPride.np.trigger("refresh_interface");
            NeptunesPride.np.npui.refreshTurnManager();
        };
        var offset = 300;
        var _loop_1 = function (tech, value) {
            var me = hero.tech[tech].level;
            var you = value.level;
            var _loop_2 = function (i) {
                setTimeout(function () {
                    console.log(me - you, {
                        type: "order",
                        order: "share_tech,".concat(player.uid, ",").concat(tech),
                    });
                    display.transact("Sending ".concat(tech, " level ").concat(you + i));
                    NeptunesPride.np.trigger("server_request", {
                        type: "order",
                        order: "share_tech,".concat(player.uid, ",").concat(tech),
                    });
                    if (i == me - you) {
                        display.transact("Done.");
                    }
                }, offset);
                offset += 1000;
            };
            for (var i = 1; i <= me - you; ++i) {
                _loop_2(i);
            }
        };
        for (var _i = 0, _a = Object.entries(player.tech); _i < _a.length; _i++) {
            var _b = _a[_i], tech = _b[0], value = _b[1];
            _loop_1(tech, value);
        }
        setTimeout(close, offset + 1000);
    });
    //Pays a player a certain amount
    NeptunesPride.np.on("confirm_buy_tech", function (even, data) {
        var player = data.player;
        NeptunesPride.np.trigger("server_request", {
            type: "order",
            order: "send_money,".concat(player.uid, ",").concat(data.cost),
        });
        NeptunesPride.universe.selectPlayer(player);
        NeptunesPride.np.trigger("refresh_interface");
    });
};
var _wide_view = function () {
    NeptunesPride.np.trigger("map_center_slide", { x: 0, y: 0 });
    NeptunesPride.np.trigger("zoom_minimap");
};
function Legacy_NeptunesPrideAgent() {
    var _a, _b;
    var title = ((_a = document === null || document === void 0 ? void 0 : document.currentScript) === null || _a === void 0 ? void 0 : _a.title) || "SAT ".concat(SAT_VERSION);
    var version = title.replace(/^.*v/, "v");
    console.log(title);
    var copy = function (reportFn) {
        return function () {
            reportFn();
            navigator.clipboard.writeText(_hotkey__WEBPACK_IMPORTED_MODULE_1__.lastClip);
        };
    };
    var hotkeys = [];
    var hotkey = function (key, action) {
        hotkeys.push([key, action]);
        Mousetrap.bind(key, copy(action));
    };
    if (!String.prototype.format) {
        String.prototype.format = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return this.replace(/{(\d+)}/g, function (match, number) {
                if (typeof args[number] === "number") {
                    return Math.trunc(args[number] * 1000) / 1000;
                }
                return typeof args[number] != "undefined" ? args[number] : match;
            });
        };
    }
    var linkFleets = function () {
        var universe = NeptunesPride.universe;
        var fleets = NeptunesPride.universe.galaxy.fleets;
        for (var f in fleets) {
            var fleet = fleets[f];
            var fleetLink = "<a onClick='Crux.crux.trigger(\"show_fleet_uid\", \"".concat(fleet.uid, "\")'>").concat(fleet.n, "</a>");
            universe.hyperlinkedMessageInserts[fleet.n] = fleetLink;
        }
    };
    function starReport() {
        var players = NeptunesPride.universe.galaxy.players;
        var stars = NeptunesPride.universe.galaxy.stars;
        var output = [];
        for (var p in players) {
            output.push("[[{0}]]".format(p));
            for (var s in stars) {
                var star = stars[s];
                if (star.puid == p && star.shipsPerTick >= 0) {
                    output.push("  [[{0}]] {1}/{2}/{3} {4} ships".format(star.n, star.e, star.i, star.s, star.totalDefenses));
                }
            }
        }
        (0,_hotkey__WEBPACK_IMPORTED_MODULE_1__.clip)(output.join("\n"));
    }
    hotkey("*", starReport);
    starReport.help =
        "Generate a report on all stars in your scanning range, and copy it to the clipboard." +
            "<p>This same report can also be viewed via the menu; enter the agent and choose it from the dropdown.";
    var ampm = function (h, m) {
        if (m < 10)
            m = "0".concat(m);
        if (h < 12) {
            if (h == 0)
                h = 12;
            return "{0}:{1} AM".format(h, m);
        }
        else if (h > 12) {
            return "{0}:{1} PM".format(h - 12, m);
        }
        return "{0}:{1} PM".format(h, m);
    };
    var msToTick = function (tick, wholeTime) {
        var universe = NeptunesPride.universe;
        var ms_since_data = 0;
        var tf = universe.galaxy.tick_fragment;
        var ltc = universe.locTimeCorrection;
        if (!universe.galaxy.paused) {
            ms_since_data = new Date().valueOf() - universe.now.valueOf();
        }
        if (wholeTime || universe.galaxy.turn_based) {
            ms_since_data = 0;
            tf = 0;
            ltc = 0;
        }
        var ms_remaining = tick * 1000 * 60 * universe.galaxy.tick_rate -
            tf * 1000 * 60 * universe.galaxy.tick_rate -
            ms_since_data -
            ltc;
        return ms_remaining;
    };
    var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    var msToEtaString = function (msplus, prefix) {
        var now = new Date();
        var arrival = new Date(now.getTime() + msplus);
        var p = prefix !== undefined ? prefix : "ETA ";
        //What is ttt?
        var ttt = p + ampm(arrival.getHours(), arrival.getMinutes());
        if (!NeptunesPride.gameConfig.turnBased) {
            ttt = p + ampm(arrival.getHours(), arrival.getMinutes());
            if (arrival.getDay() != now.getDay())
                // Generate time string
                ttt = "".concat(p).concat(days[arrival.getDay()], " @ ").concat(ampm(arrival.getHours(), arrival.getMinutes()));
        }
        else {
            var totalETA = arrival - now;
            ttt = p + Crux.formatTime(totalETA);
        }
        return ttt;
    };
    var tickToEtaString = function (tick, prefix) {
        var msplus = msToTick(tick);
        return msToEtaString(msplus, prefix);
    };
    var msToCycleString = function (msplus, prefix) {
        var p = prefix !== undefined ? prefix : "ETA";
        var cycleLength = NeptunesPride.universe.galaxy.production_rate;
        var tickLength = NeptunesPride.universe.galaxy.tick_rate;
        var ticksToComplete = Math.ceil(msplus / 60000 / tickLength);
        //Generate time text string
        var ttt = "".concat(p).concat(ticksToComplete, " ticks - ").concat((ticksToComplete / cycleLength).toFixed(2), "C");
        return ttt;
    };
    var fleetOutcomes = {};
    var combatHandicap = 0;
    var combatOutcomes = function () {
        var _a;
        var universe = NeptunesPride.universe;
        var players = NeptunesPride.universe.galaxy.players;
        var fleets = NeptunesPride.universe.galaxy.fleets;
        var stars = NeptunesPride.universe.galaxy.stars;
        var flights = [];
        fleetOutcomes = {};
        for (var f in fleets) {
            var fleet = fleets[f];
            if (fleet.o && fleet.o.length > 0) {
                var stop_1 = fleet.o[0][1];
                var ticks = fleet.etaFirst;
                var starname = (_a = stars[stop_1]) === null || _a === void 0 ? void 0 : _a.n;
                if (!starname) {
                    continue;
                }
                flights.push([
                    ticks,
                    "[[{0}]] [[{1}]] {2} → [[{3}]] {4}".format(fleet.puid, fleet.n, fleet.st, starname, tickToEtaString(ticks)),
                    fleet,
                ]);
            }
        }
        flights = flights.sort(function (a, b) {
            return a[0] - b[0];
        });
        var arrivals = {};
        var output = [];
        var arrivalTimes = [];
        var starstate = {};
        for (var i in flights) {
            var fleet = flights[i][2];
            if (fleet.orbiting) {
                var orbit = fleet.orbiting.uid;
                if (!starstate[orbit]) {
                    starstate[orbit] = {
                        last_updated: 0,
                        ships: stars[orbit].totalDefenses,
                        puid: stars[orbit].puid,
                        c: stars[orbit].c,
                    };
                }
                // This fleet is departing this tick; remove it from the origin star's totalDefenses
                starstate[orbit].ships -= fleet.st;
            }
            if (arrivalTimes.length === 0 ||
                arrivalTimes[arrivalTimes.length - 1] !== flights[i][0]) {
                arrivalTimes.push(flights[i][0]);
            }
            var arrivalKey = [flights[i][0], fleet.o[0][1]];
            if (arrivals[arrivalKey] !== undefined) {
                arrivals[arrivalKey].push(fleet);
            }
            else {
                arrivals[arrivalKey] = [fleet];
            }
        }
        for (var k in arrivals) {
            var arrival = arrivals[k];
            var ka = k.split(",");
            var tick = ka[0];
            var starId = ka[1];
            if (!starstate[starId]) {
                starstate[starId] = {
                    last_updated: 0,
                    ships: stars[starId].totalDefenses,
                    puid: stars[starId].puid,
                    c: stars[starId].c,
                };
            }
            if (starstate[starId].puid == -1) {
                // assign ownership of the star to the player whose fleet has traveled the least distance
                var minDistance = 10000;
                var owner = -1;
                for (var i in arrival) {
                    var fleet = arrival[i];
                    var d = universe.distance(stars[starId].x, stars[starId].y, fleet.lx, fleet.ly);
                    if (d < minDistance || owner == -1) {
                        owner = fleet.puid;
                        minDistance = d;
                    }
                }
                starstate[starId].puid = owner;
            }
            output.push("{0}: [[{1}]] [[{2}]] {3} ships".format(tickToEtaString(tick, "@"), starstate[starId].puid, stars[starId].n, starstate[starId].ships));
            var tickDelta = tick - starstate[starId].last_updated - 1;
            if (tickDelta > 0) {
                var oldShips = starstate[starId].ships;
                starstate[starId].last_updated = tick - 1;
                if (stars[starId].shipsPerTick) {
                    var oldc = starstate[starId].c;
                    starstate[starId].ships +=
                        stars[starId].shipsPerTick * tickDelta + oldc;
                    starstate[starId].c =
                        starstate[starId].ships - Math.trunc(starstate[starId].ships);
                    starstate[starId].ships -= starstate[starId].c;
                    output.push("  {0}+{3} + {2}/h = {1}+{4}".format(oldShips, starstate[starId].ships, stars[starId].shipsPerTick, oldc, starstate[starId].c));
                }
            }
            for (var i in arrival) {
                var fleet = arrival[i];
                if (fleet.puid == starstate[starId].puid ||
                    starstate[starId].puid == -1) {
                    var oldShips = starstate[starId].ships;
                    if (starstate[starId].puid == -1) {
                        starstate[starId].ships = fleet.st;
                    }
                    else {
                        starstate[starId].ships += fleet.st;
                    }
                    var landingString = "  {0} + {2} on [[{3}]] = {1}".format(oldShips, starstate[starId].ships, fleet.st, fleet.n);
                    output.push(landingString);
                    landingString = landingString.substring(2);
                }
            }
            for (var i in arrival) {
                var fleet = arrival[i];
                if (fleet.puid == starstate[starId].puid) {
                    var outcomeString = "{0} ships on {1}".format(Math.floor(starstate[starId].ships), stars[starId].n);
                    fleetOutcomes[fleet.uid] = {
                        eta: tickToEtaString(fleet.etaFirst),
                        outcome: outcomeString,
                    };
                }
            }
            var awt = 0;
            var offense = 0;
            var contribution = {};
            for (var i in arrival) {
                var fleet = arrival[i];
                if (fleet.puid != starstate[starId].puid) {
                    var olda = offense;
                    offense += fleet.st;
                    output.push("  [[{4}]]! {0} + {2} on [[{3}]] = {1}".format(olda, offense, fleet.st, fleet.n, fleet.puid));
                    contribution[[fleet.puid, fleet.uid]] = fleet.st;
                    var wt = players[fleet.puid].tech.weapons.level;
                    if (wt > awt) {
                        awt = wt;
                    }
                }
            }
            var attackersAggregate = offense;
            while (offense > 0) {
                var dwt = players[starstate[starId].puid].tech.weapons.level;
                var defense = starstate[starId].ships;
                output.push("  Combat! [[{0}]] defending".format(starstate[starId].puid));
                output.push("    Defenders {0} ships, WS {1}".format(defense, dwt));
                output.push("    Attackers {0} ships, WS {1}".format(offense, awt));
                dwt += 1;
                if (starstate[starId].puid !== universe.galaxy.player_uid) {
                    if (combatHandicap > 0) {
                        dwt += combatHandicap;
                        output.push("    Defenders WS{0} = {1}".format(handicapString(""), dwt));
                    }
                    else {
                        awt -= combatHandicap;
                        output.push("    Attackers WS{0} = {1}".format(handicapString(""), awt));
                    }
                }
                else {
                    if (combatHandicap > 0) {
                        awt += combatHandicap;
                        output.push("    Attackers WS{0} = {1}".format(handicapString(""), awt));
                    }
                    else {
                        dwt -= combatHandicap;
                        output.push("    Defenders WS{0} = {1}".format(handicapString(""), dwt));
                    }
                }
                if (universe.galaxy.player_uid === starstate[starId].puid) {
                    // truncate defense if we're defending to give the most
                    // conservative estimate
                    defense = Math.trunc(defense);
                }
                while (defense > 0 && offense > 0) {
                    offense -= dwt;
                    if (offense <= 0)
                        break;
                    defense -= awt;
                }
                var newAggregate = 0;
                var playerContribution = {};
                var biggestPlayer = -1;
                var biggestPlayerId = starstate[starId].puid;
                if (offense > 0) {
                    output.push("  Attackers win with {0} ships remaining".format(offense));
                    for (var k_1 in contribution) {
                        var ka_1 = k_1.split(",");
                        var fleet = fleets[ka_1[1]];
                        var playerId = ka_1[0];
                        contribution[k_1] = (offense * contribution[k_1]) / attackersAggregate;
                        newAggregate += contribution[k_1];
                        if (playerContribution[playerId]) {
                            playerContribution[playerId] += contribution[k_1];
                        }
                        else {
                            playerContribution[playerId] = contribution[k_1];
                        }
                        if (playerContribution[playerId] > biggestPlayer) {
                            biggestPlayer = playerContribution[playerId];
                            biggestPlayerId = playerId;
                        }
                        output.push("    [[{0}]] has {1} on [[{2}]]".format(fleet.puid, contribution[k_1], fleet.n));
                        var outcomeString = "Wins! {0} land.".format(contribution[k_1]);
                        fleetOutcomes[fleet.uid] = {
                            eta: tickToEtaString(fleet.etaFirst),
                            outcome: outcomeString,
                        };
                    }
                    offense = newAggregate - playerContribution[biggestPlayerId];
                    starstate[starId].puid = biggestPlayerId;
                    starstate[starId].ships = playerContribution[biggestPlayerId];
                }
                else {
                    starstate[starId].ships = defense;
                    for (var i in arrival) {
                        var fleet = arrival[i];
                        if (fleet.puid == starstate[starId].puid) {
                            var outcomeString = "{0} ships on {1}".format(Math.floor(starstate[starId].ships), stars[starId].n);
                            fleetOutcomes[fleet.uid] = {
                                eta: tickToEtaString(fleet.etaFirst),
                                outcome: outcomeString,
                            };
                        }
                    }
                    for (var k_2 in contribution) {
                        var ka_2 = k_2.split(",");
                        var fleet = fleets[ka_2[1]];
                        var outcomeString = "Loses! {0} live.".format(defense);
                        fleetOutcomes[fleet.uid] = {
                            eta: tickToEtaString(fleet.etaFirst),
                            outcome: outcomeString,
                        };
                    }
                }
                attackersAggregate = offense;
            }
            output.push("  [[{0}]] [[{1}]] {2} ships".format(starstate[starId].puid, stars[starId].n, starstate[starId].ships));
        }
        return output;
    };
    function incCombatHandicap() {
        combatHandicap += 1;
    }
    function decCombatHandicap() {
        combatHandicap -= 1;
    }
    hotkey(".", incCombatHandicap);
    incCombatHandicap.help =
        "Change combat calculation to credit your enemies with +1 weapons. Useful " +
            "if you suspect they will have achieved the next level of tech before a battle you are investigating." +
            "<p>In the lower left of the HUD, an indicator will appear reminding you of the weapons adjustment. If the " +
            "indicator already shows an advantage for defenders, this hotkey will reduce that advantage first before crediting " +
            "weapons to your opponent.";
    hotkey(",", decCombatHandicap);
    decCombatHandicap.help =
        "Change combat calculation to credit yourself with +1 weapons. Useful " +
            "when you will have achieved the next level of tech before a battle you are investigating." +
            "<p>In the lower left of the HUD, an indicator will appear reminding you of the weapons adjustment. When " +
            "indicator already shows an advantage for attackers, this hotkey will reduce that advantage first before crediting " +
            "weapons to you.";
    function longFleetReport() {
        (0,_hotkey__WEBPACK_IMPORTED_MODULE_1__.clip)(combatOutcomes().join("\n"));
    }
    hotkey("&", longFleetReport);
    longFleetReport.help =
        "Generate a detailed fleet report on all carriers in your scanning range, and copy it to the clipboard." +
            "<p>This same report can also be viewed via the menu; enter the agent and choose it from the dropdown.";
    function briefFleetReport() {
        var _a;
        var fleets = NeptunesPride.universe.galaxy.fleets;
        var stars = NeptunesPride.universe.galaxy.stars;
        var flights = [];
        for (var f in fleets) {
            var fleet = fleets[f];
            if (fleet.o && fleet.o.length > 0) {
                var stop_2 = fleet.o[0][1];
                var ticks = fleet.etaFirst;
                var starname = (_a = stars[stop_2]) === null || _a === void 0 ? void 0 : _a.n;
                if (!starname)
                    continue;
                flights.push([
                    ticks,
                    "[[{0}]] [[{1}]] {2} → [[{3}]] {4}".format(fleet.puid, fleet.n, fleet.st, stars[stop_2].n, tickToEtaString(ticks, "")),
                ]);
            }
        }
        flights = flights.sort(function (a, b) {
            return a[0] - b[0];
        });
        (0,_hotkey__WEBPACK_IMPORTED_MODULE_1__.clip)(flights.map(function (x) { return x[1]; }).join("\n"));
    }
    hotkey("^", briefFleetReport);
    briefFleetReport.help =
        "Generate a summary fleet report on all carriers in your scanning range, and copy it to the clipboard." +
            "<p>This same report can also be viewed via the menu; enter the agent and choose it from the dropdown.";
    function screenshot() {
        var map = NeptunesPride.npui.map;
        (0,_hotkey__WEBPACK_IMPORTED_MODULE_1__.clip)(map.canvas[0].toDataURL("image/webp", 0.05));
    }
    hotkey("#", screenshot);
    screenshot.help =
        "Create a data: URL of the current map. Paste it into a browser window to view. This is likely to be removed.";
    var homePlanets = function () {
        var p = NeptunesPride.universe.galaxy.players;
        var output = [];
        for (var i in p) {
            var home = p[i].home;
            if (home) {
                output.push("Player #{0} is [[{0}]] home {2} [[{1}]]".format(i, home.n, i == home.puid ? "is" : "was"));
            }
            else {
                output.push("Player #{0} is [[{0}]] home unknown".format(i));
            }
        }
        (0,_hotkey__WEBPACK_IMPORTED_MODULE_1__.clip)(output.join("\n"));
    };
    hotkey("!", homePlanets);
    homePlanets.help =
        "Generate a player summary report and copy it to the clipboard." +
            "<p>This same report can also be viewed via the menu; enter the agent and choose it from the dropdown. " +
            "It is most useful for discovering player numbers so that you can write [[#]] to reference a player in mail.";
    var playerSheet = function () {
        var p = NeptunesPride.universe.galaxy.players;
        var output = [];
        var fields = [
            "alias",
            "total_stars",
            "shipsPerTick",
            "total_strength",
            "total_economy",
            "total_fleets",
            "total_industry",
            "total_science",
        ];
        output.push(fields.join(","));
        var _loop_3 = function (i) {
            player = __assign({}, p[i]);
            var record = fields.map(function (f) { return p[i][f]; });
            output.push(record.join(","));
        };
        for (var i in p) {
            _loop_3(i);
        }
        (0,_hotkey__WEBPACK_IMPORTED_MODULE_1__.clip)(output.join("\n"));
    };
    hotkey("$", playerSheet);
    playerSheet.help =
        "Generate a player summary mean to be made into a spreadsheet." +
            "<p>The clipboard should be pasted into a CSV and then imported.";
    var drawOverlayString = function (context, s, x, y, fgColor) {
        context.fillStyle = "#000000";
        for (var smear = 1; smear < 4; ++smear) {
            context.fillText(s, x + smear, y + smear);
            context.fillText(s, x - smear, y + smear);
            context.fillText(s, x - smear, y - smear);
            context.fillText(s, x + smear, y - smear);
        }
        context.fillStyle = fgColor || "#00ff00";
        context.fillText(s, x, y);
    };
    var anyStarCanSee = function (owner, fleet) {
        var stars = NeptunesPride.universe.galaxy.stars;
        var universe = NeptunesPride.universe;
        var scanRange = universe.galaxy.players[owner].tech.scanning.value;
        for (var s in stars) {
            var star = stars[s];
            if (star.puid == owner) {
                var distance = universe.distance(star.x, star.y, fleet.x, fleet.y);
                if (distance <= scanRange) {
                    return true;
                }
            }
        }
        return false;
    };
    var hooksLoaded = false;
    var handicapString = function (prefix) {
        var p = prefix !== undefined ? prefix : combatHandicap > 0 ? "Enemy WS" : "My WS";
        return p + (combatHandicap > 0 ? "+" : "") + combatHandicap;
    };
    var loadHooks = function () {
        var superDrawText = NeptunesPride.npui.map.drawText;
        NeptunesPride.npui.map.drawText = function () {
            var universe = NeptunesPride.universe;
            var map = NeptunesPride.npui.map;
            superDrawText();
            map.context.font = "".concat(14 * map.pixelRatio, "px OpenSansRegular, sans-serif");
            map.context.fillStyle = "#FF0000";
            map.context.textAlign = "right";
            map.context.textBaseline = "middle";
            var v = version;
            if (combatHandicap !== 0) {
                v = "".concat(handicapString(), " ").concat(v);
            }
            drawOverlayString(map.context, v, map.viewportWidth - 10, map.viewportHeight - 16 * map.pixelRatio);
            if (NeptunesPride.originalPlayer === undefined) {
                NeptunesPride.originalPlayer = universe.player.uid;
            }
            if (NeptunesPride.originalPlayer !== universe.player.uid) {
                var n = universe.galaxy.players[universe.player.uid].alias;
                drawOverlayString(map.context, n, map.viewportWidth - 100, map.viewportHeight - 2 * 16 * map.pixelRatio);
            }
            if (universe.selectedFleet && universe.selectedFleet.path.length > 0) {
                //console.log("Selected fleet", universe.selectedFleet);
                map.context.font = "".concat(14 * map.pixelRatio, "px OpenSansRegular, sans-serif");
                map.context.fillStyle = "#FF0000";
                map.context.textAlign = "left";
                map.context.textBaseline = "middle";
                var dy = universe.selectedFleet.y - universe.selectedFleet.ly;
                var dx = universe.selectedFleet.x - universe.selectedFleet.lx;
                dy = universe.selectedFleet.path[0].y - universe.selectedFleet.y;
                dx = universe.selectedFleet.path[0].x - universe.selectedFleet.x;
                var lineHeight = 16 * map.pixelRatio;
                var radius = 2 * 0.028 * map.scale * map.pixelRatio;
                var angle = Math.atan(dy / dx);
                var offsetx = radius * Math.cos(angle);
                var offsety = radius * Math.sin(angle);
                if (offsetx > 0 && dx > 0) {
                    offsetx *= -1;
                }
                if (offsety > 0 && dy > 0) {
                    offsety *= -1;
                }
                if (offsetx < 0 && dx < 0) {
                    offsetx *= -1;
                }
                if (offsety < 0 && dy < 0) {
                    offsety *= -1;
                }
                combatOutcomes();
                var s = fleetOutcomes[universe.selectedFleet.uid].eta;
                var o = fleetOutcomes[universe.selectedFleet.uid].outcome;
                var x = map.worldToScreenX(universe.selectedFleet.x) + offsetx;
                var y = map.worldToScreenY(universe.selectedFleet.y) + offsety;
                if (offsetx < 0) {
                    map.context.textAlign = "right";
                }
                drawOverlayString(map.context, s, x, y);
                drawOverlayString(map.context, o, x, y + lineHeight);
            }
            if (!NeptunesPride.gameConfig.turnBased &&
                universe.timeToTick(1).length < 3) {
                var lineHeight = 16 * map.pixelRatio;
                map.context.font = "".concat(14 * map.pixelRatio, "px OpenSansRegular, sans-serif");
                map.context.fillStyle = "#FF0000";
                map.context.textAlign = "left";
                map.context.textBaseline = "middle";
                var s = "Tick < 10s away!";
                if (universe.timeToTick(1) === "0s") {
                    s = "Tick passed. Click production countdown to refresh.";
                }
                drawOverlayString(map.context, s, 1000, lineHeight);
            }
            if (universe.selectedStar &&
                universe.selectedStar.puid != universe.player.uid &&
                universe.selectedStar.puid !== -1) {
                // enemy star selected; show HUD for scanning visibility
                map.context.textAlign = "left";
                map.context.textBaseline = "middle";
                var xOffset = 26 * map.pixelRatio;
                //map.context.translate(xOffset, 0);
                var fleets = NeptunesPride.universe.galaxy.fleets;
                for (var f in fleets) {
                    var fleet = fleets[f];
                    if (fleet.puid === universe.player.uid) {
                        var dx = universe.selectedStar.x - fleet.x;
                        var dy = universe.selectedStar.y - fleet.y;
                        var distance = Math.sqrt(dx * dx + dy * dy);
                        var offsetx = xOffset;
                        var offsety = 0;
                        var x = map.worldToScreenX(fleet.x) + offsetx;
                        var y = map.worldToScreenY(fleet.y) + offsety;
                        if (distance >
                            universe.galaxy.players[universe.selectedStar.puid].tech.scanning
                                .value) {
                            if (fleet.path && fleet.path.length > 0) {
                                dx = fleet.path[0].x - universe.selectedStar.x;
                                dy = fleet.path[0].y - universe.selectedStar.y;
                                distance = Math.sqrt(dx * dx + dy * dy);
                                if (distance <
                                    universe.galaxy.players[universe.selectedStar.puid].tech
                                        .scanning.value) {
                                    var stepRadius = NeptunesPride.universe.galaxy.fleet_speed;
                                    if (fleet.warpSpeed)
                                        stepRadius *= 3;
                                    dx = fleet.x - fleet.path[0].x;
                                    dy = fleet.y - fleet.path[0].y;
                                    var angle = Math.atan(dy / dx);
                                    var stepx = stepRadius * Math.cos(angle);
                                    var stepy = stepRadius * Math.sin(angle);
                                    if (stepx > 0 && dx > 0) {
                                        stepx *= -1;
                                    }
                                    if (stepy > 0 && dy > 0) {
                                        stepy *= -1;
                                    }
                                    if (stepx < 0 && dx < 0) {
                                        stepx *= -1;
                                    }
                                    if (stepy < 0 && dy < 0) {
                                        stepy *= -1;
                                    }
                                    var ticks = 0;
                                    do {
                                        var x_1 = ticks * stepx + Number(fleet.x);
                                        var y_1 = ticks * stepy + Number(fleet.y);
                                        //let sx = map.worldToScreenX(x);
                                        //let sy = map.worldToScreenY(y);
                                        dx = x_1 - universe.selectedStar.x;
                                        dy = y_1 - universe.selectedStar.y;
                                        distance = Math.sqrt(dx * dx + dy * dy);
                                        //console.log(distance, x, y);
                                        //drawOverlayString(map.context, "o", sx, sy);
                                        ticks += 1;
                                    } while (distance >
                                        universe.galaxy.players[universe.selectedStar.puid].tech
                                            .scanning.value &&
                                        ticks <= fleet.etaFirst + 1);
                                    ticks -= 1;
                                    var visColor = "#00ff00";
                                    if (anyStarCanSee(universe.selectedStar.puid, fleet)) {
                                        visColor = "#888888";
                                    }
                                    drawOverlayString(map.context, "Scan ".concat(tickToEtaString(ticks)), x, y, visColor);
                                }
                            }
                        }
                    }
                }
                //map.context.translate(-xOffset, 0);
            }
            if (universe.ruler.stars.length == 2) {
                var p1 = universe.ruler.stars[0].puid;
                var p2 = universe.ruler.stars[1].puid;
                if (p1 !== p2 && p1 !== -1 && p2 !== -1) {
                    //console.log("two star ruler");
                }
            }
        };
        //TODO: Learn more about this hook. its run too much..
        Crux.format = function (s, templateData) {
            if (!s) {
                return "error";
            }
            var i;
            var fp;
            var sp;
            var sub;
            var pattern;
            i = 0;
            fp = 0;
            sp = 0;
            sub = "";
            pattern = "";
            // look for standard patterns
            while (fp >= 0 && i < 1000) {
                i = i + 1;
                fp = s.search("\\[\\[");
                sp = s.search("\\]\\]");
                sub = s.slice(fp + 2, sp);
                var uri = sub.replaceAll("&#x2F;", "/");
                pattern = "[[".concat(sub, "]]");
                if (templateData[sub] !== undefined) {
                    s = s.replace(pattern, templateData[sub]);
                }
                else if (/^api:\w{6}$/.test(sub)) {
                    var apiLink = "<a onClick='Crux.crux.trigger(\"switch_user_api\", \"".concat(sub, "\")'> View as ").concat(sub, "</a>");
                    apiLink += " or <a onClick='Crux.crux.trigger(\"merge_user_api\", \"".concat(sub, "\")'> Merge ").concat(sub, "</a>");
                    s = s.replace(pattern, apiLink);
                }
                else if ((0,_parse_utils__WEBPACK_IMPORTED_MODULE_0__.is_valid_image_url)(uri)) {
                    s = s.replace(pattern, "<img width=\"100%\" src='".concat(uri, "' />"));
                }
                else if ((0,_parse_utils__WEBPACK_IMPORTED_MODULE_0__.is_valid_youtube)(uri)) {
                    //Pass
                }
                else {
                    s = s.replace(pattern, "(".concat(sub, ")"));
                }
            }
            return s;
        };
        var npui = NeptunesPride.npui;
        //Research button to quickly tell friends research
        NeptunesPride.templates["npa_research"] = "Research";
        var superNewMessageCommentBox = npui.NewMessageCommentBox;
        var reportResearchHook = function (_e, _d) {
            var text = (0,_chat__WEBPACK_IMPORTED_MODULE_5__.get_research_text)(NeptunesPride);
            console.log(text);
            var inbox = NeptunesPride.inbox;
            inbox.commentDrafts[inbox.selectedMessage.key] += text;
            inbox.trigger("show_screen", "diplomacy_detail");
        };
        NeptunesPride.np.on("paste_research", reportResearchHook);
        npui.NewMessageCommentBox = function () {
            var widget = superNewMessageCommentBox();
            var research_button = Crux.Button("npa_research", "paste_research", "research").grid(11, 12, 8, 3);
            research_button.roost(widget);
            return widget;
        };
        var superFormatTime = Crux.formatTime;
        var relativeTimes = 0;
        Crux.formatTime = function (ms, mins, secs) {
            switch (relativeTimes) {
                case 0: //standard
                    return superFormatTime(ms, mins, secs);
                case 1: //ETA, - turn(s) for turnbased
                    if (!NeptunesPride.gameConfig.turnBased) {
                        return msToEtaString(ms, "");
                    }
                    else {
                        var tick_rate = NeptunesPride.universe.galaxy.tick_rate;
                        return "".concat(superFormatTime(ms, mins, secs), " - ").concat((((ms / 3600000) * 10) /
                            tick_rate).toFixed(2), " turn(s)");
                    }
                case 2: //cycles + ticks format
                    return msToCycleString(ms, "");
            }
        };
        var switchTimes = function () {
            //0 = standard, 1 = ETA, - turn(s) for turnbased, 2 = cycles + ticks format
            relativeTimes = (relativeTimes + 1) % 3;
        };
        hotkey("%", switchTimes);
        switchTimes.help =
            "Change the display of ETAs between relative times, absolute clock times, and cycle times. Makes predicting " +
                "important times of day to sign in and check much easier especially for multi-leg fleet movements. Sometimes you " +
                "will need to refresh the display to see the different times.";
        try {
            Object.defineProperty(Crux, "touchEnabled", {
                get: function () { return false; },
                set: function (x) {
                    console.log("Crux.touchEnabled set ignored", x);
                },
            });
        }
        catch (e) {
            console.log(e);
        }
        Object.defineProperty(NeptunesPride.npui.map, "ignoreMouseEvents", {
            get: function () { return false; },
            set: function (x) {
                console.log("NeptunesPride.npui.map.ignoreMouseEvents set ignored", x);
            },
        });
        hooksLoaded = true;
    };
    var init = function () {
        var _a;
        if (((_a = NeptunesPride.universe) === null || _a === void 0 ? void 0 : _a.galaxy) && NeptunesPride.npui.map) {
            linkFleets();
            console.log("Fleet linking complete.");
            if (!hooksLoaded) {
                loadHooks();
                console.log("HUD setup complete.");
            }
            else {
                console.log("HUD setup already done; skipping.");
            }
            homePlanets();
        }
        else {
            console.log("Game not fully initialized yet; wait.", NeptunesPride.universe);
        }
    };
    hotkey("@", init);
    init.help =
        "Reinitialize Neptune's Pride Agent. Use the @ hotkey if the version is not being shown on the map after dragging.";
    if (((_b = NeptunesPride.universe) === null || _b === void 0 ? void 0 : _b.galaxy) && NeptunesPride.npui.map) {
        console.log("Universe already loaded. Hyperlink fleets & load hooks.");
        init();
    }
    else {
        console.log("Universe not loaded. Hook onServerResponse.");
        var superOnServerResponse_1 = NeptunesPride.np.onServerResponse;
        NeptunesPride.np.onServerResponse = function (response) {
            superOnServerResponse_1(response);
            if (response.event === "order:player_achievements") {
                console.log("Initial load complete. Reinstall.");
                init();
            }
            else if (response.event === "order:full_universe") {
                console.log("Universe received. Reinstall.");
                NeptunesPride.originalPlayer = NeptunesPride.universe.player.uid;
                init();
            }
            else if (!hooksLoaded && NeptunesPride.npui.map) {
                console.log("Hooks need loading and map is ready. Reinstall.");
                init();
            }
        };
    }
    var otherUserCode = undefined;
    var game = NeptunesPride.gameNumber;
    var switchUser = function (event, data) {
        if (NeptunesPride.originalPlayer === undefined) {
            NeptunesPride.originalPlayer = NeptunesPride.universe.player.uid;
        }
        var code = (data === null || data === void 0 ? void 0 : data.split(":")[1]) || otherUserCode;
        otherUserCode = code;
        if (otherUserCode) {
            var params = {
                game_number: game,
                api_version: "0.1",
                code: otherUserCode,
            };
            var eggers = jQuery.ajax({
                type: "POST",
                url: "https://np.ironhelmet.com/api",
                async: false,
                data: params,
                dataType: "json",
            });
            NeptunesPride.np.onFullUniverse(null, eggers.responseJSON.scanning_data);
            NeptunesPride.npui.onHideScreen(null, true);
            NeptunesPride.np.trigger("select_player", [
                NeptunesPride.universe.player.uid,
                true,
            ]);
            init();
        }
    };
    hotkey(">", switchUser);
    switchUser.help =
        "Switch views to the last user whose API key was used to load data. The HUD shows the current user when " +
            "it is not your own alias to help remind you that you aren't in control of this user.";
    hotkey("|", _merge__WEBPACK_IMPORTED_MODULE_4__.mergeUser);
    _merge__WEBPACK_IMPORTED_MODULE_4__.mergeUser.help =
        "Merge the latest data from the last user whose API key was used to load data. This is useful after a tick " +
            "passes and you've reloaded, but you still want the merged scan data from two players onscreen.";
    NeptunesPride.np.on("switch_user_api", switchUser);
    NeptunesPride.np.on("merge_user_api", _merge__WEBPACK_IMPORTED_MODULE_4__.mergeUser);
    var npaHelp = function () {
        var help = ["<H1>".concat(title, "</H1>")];
        for (var pair in hotkeys) {
            var key = hotkeys[pair][0];
            var action = hotkeys[pair][1];
            help.push("<h2>Hotkey: ".concat(key, "</h2>"));
            if (action.help) {
                help.push(action.help);
            }
            else {
                help.push("<p>No documentation yet.<p><code>".concat(action.toLocaleString(), "</code>"));
            }
        }
        NeptunesPride.universe.helpHTML = help.join("");
        NeptunesPride.np.trigger("show_screen", "help");
    };
    npaHelp.help = "Display this help screen.";
    hotkey("?", npaHelp);
    var autocompleteMode = 0;
    var autocompleteTrigger = function (e) {
        if (e.target.type === "textarea") {
            if (autocompleteMode) {
                var start = autocompleteMode;
                var endBracket = e.target.value.indexOf("]", start);
                if (endBracket === -1)
                    endBracket = e.target.value.length;
                var autoString = e.target.value.substring(start, endBracket);
                var key = e.key;
                if (key === "]") {
                    autocompleteMode = 0;
                    var m = autoString.match(/^[0-9][0-9]*$/);
                    if (m === null || m === void 0 ? void 0 : m.length) {
                        var puid = Number(autoString);
                        var end = e.target.selectionEnd;
                        var auto = "".concat(puid, "]] ").concat(NeptunesPride.universe.galaxy.players[puid].alias);
                        e.target.value =
                            e.target.value.substring(0, start) +
                                auto +
                                e.target.value.substring(end, e.target.value.length);
                        e.target.selectionStart = start + auto.length;
                        e.target.selectionEnd = start + auto.length;
                    }
                }
            }
            else if (e.target.selectionStart > 1) {
                var start = e.target.selectionStart - 2;
                var ss = e.target.value.substring(start, start + 2);
                autocompleteMode = ss === "[[" ? e.target.selectionStart : 0;
            }
        }
    };
    document.body.addEventListener("keyup", autocompleteTrigger);
    console.log("SAT: Neptune's Pride Agent injection finished.");
    console.log("Getting hero!", (0,_utilities__WEBPACK_IMPORTED_MODULE_2__.get_hero)(NeptunesPride.universe));
}
var force_add_custom_player_panel = function () {
    if ("PlayerPanel" in NeptunesPride.npui) {
        add_custom_player_panel();
    }
    else {
        setTimeout(add_custom_player_panel, 3000);
    }
};
var add_custom_player_panel = function () {
    NeptunesPride.npui.PlayerPanel = function (player, showEmpire) {
        var universe = NeptunesPride.universe;
        var npui = NeptunesPride.npui;
        var playerPanel = Crux.Widget("rel").size(480, 264 - 8 + 48);
        var heading = "player";
        if (universe.playerAchievements &&
            NeptunesPride.gameConfig.anonymity === 0) {
            if (universe.playerAchievements[player.uid]) {
                if (universe.playerAchievements[player.uid].premium === "premium") {
                    heading = "premium_player";
                }
                if (universe.playerAchievements[player.uid].premium === "lifetime") {
                    heading = "lifetime_premium_player";
                }
            }
        }
        Crux.Text(heading, "section_title col_black")
            .grid(0, 0, 30, 3)
            .roost(playerPanel);
        if (player.ai) {
            Crux.Text("ai_admin", "txt_right pad12")
                .grid(0, 0, 30, 3)
                .roost(playerPanel);
        }
        Crux.Image("../images/avatars/160/".concat(player.avatar, ".jpg"), "abs")
            .grid(0, 6, 10, 10)
            .roost(playerPanel);
        Crux.Widget("pci_48_".concat(player.uid)).grid(7, 13, 3, 3).roost(playerPanel);
        Crux.Widget("col_accent").grid(0, 3, 30, 3).roost(playerPanel);
        Crux.Text("", "screen_subtitle")
            .grid(0, 3, 30, 3)
            .rawHTML(player.qualifiedAlias)
            .roost(playerPanel);
        var myAchievements;
        //U=>Toxic
        //V=>Magic
        //5=>Flombaeu
        //W=>Wizard
        if (universe.playerAchievements) {
            myAchievements = universe.playerAchievements[player.uid];
            if (player.rawAlias == "Lorentz" &&
                "W" != myAchievements.badges.slice(0, 1)) {
                myAchievements.badges = "W".concat(myAchievements.badges);
            }
            else if (player.rawAlias == "A Stoned Ape" &&
                "5" != myAchievements.badges.slice(0, 1)) {
                myAchievements.badges = "5".concat(myAchievements.badges);
            }
        }
        if (myAchievements) {
            npui
                .SmallBadgeRow(myAchievements.badges)
                .grid(0, 3, 30, 3)
                .roost(playerPanel);
        }
        Crux.Widget("col_black").grid(10, 6, 20, 3).roost(playerPanel);
        if (player.uid != (0,_utilities__WEBPACK_IMPORTED_MODULE_2__.get_hero)(NeptunesPride.universe).uid && player.ai == 0) {
            //Use this to only view when they are within scanning:
            //universe.selectedStar.v != "0"
            var total_sell_cost = get_tech_trade_cost((0,_utilities__WEBPACK_IMPORTED_MODULE_2__.get_hero)(NeptunesPride.universe), player);
            /*** SHARE ALL TECH  ***/
            var btn = Crux.Button("", "share_all_tech", player)
                .addStyle("fwd")
                .rawHTML("Share All Tech: $".concat(total_sell_cost))
                .grid(10, 31, 14, 3);
            //Disable if in a game with FA & Scan (BUG)
            var config = NeptunesPride.gameConfig;
            if (!(config.tradeScanned && config.alliances)) {
                if ((0,_utilities__WEBPACK_IMPORTED_MODULE_2__.get_hero)(NeptunesPride.universe).cash >= total_sell_cost) {
                    btn.roost(playerPanel);
                }
                else {
                    btn.disable().roost(playerPanel);
                }
            }
            /*** PAY FOR ALL TECH ***/
            var total_buy_cost = get_tech_trade_cost(player, (0,_utilities__WEBPACK_IMPORTED_MODULE_2__.get_hero)(NeptunesPride.universe));
            btn = Crux.Button("", "buy_all_tech", {
                player: player,
                tech: null,
                cost: total_buy_cost,
            })
                .addStyle("fwd")
                .rawHTML("Pay for All Tech: $".concat(total_buy_cost))
                .grid(10, 49, 14, 3);
            if ((0,_utilities__WEBPACK_IMPORTED_MODULE_2__.get_hero)(NeptunesPride.universe).cash >= total_sell_cost) {
                btn.roost(playerPanel);
            }
            else {
                btn.disable().roost(playerPanel);
            }
            /*Individual techs*/
            var _name_map = {
                scanning: "Scanning",
                propulsion: "Hyperspace Range",
                terraforming: "Terraforming",
                research: "Experimentation",
                weapons: "Weapons",
                banking: "Banking",
                manufacturing: "Manufacturing",
            };
            var techs = [
                "scanning",
                "propulsion",
                "terraforming",
                "research",
                "weapons",
                "banking",
                "manufacturing",
            ];
            techs.forEach(function (tech, i) {
                var one_tech_cost = get_tech_trade_cost(player, (0,_utilities__WEBPACK_IMPORTED_MODULE_2__.get_hero)(NeptunesPride.universe), tech);
                var one_tech = Crux.Button("", "buy_one_tech", {
                    player: player,
                    tech: tech,
                    cost: one_tech_cost,
                })
                    .addStyle("fwd")
                    .rawHTML("Pay: $".concat(one_tech_cost))
                    .grid(15, 34.5 + i * 2, 7, 2);
                if ((0,_utilities__WEBPACK_IMPORTED_MODULE_2__.get_hero)(NeptunesPride.universe).cash >= one_tech_cost &&
                    one_tech_cost > 0) {
                    one_tech.roost(playerPanel);
                }
            });
        }
        Crux.Text("you", "pad12 txt_center").grid(25, 6, 5, 3).roost(playerPanel);
        // Labels
        Crux.Text("total_stars", "pad8").grid(10, 9, 15, 3).roost(playerPanel);
        Crux.Text("total_fleets", "pad8").grid(10, 11, 15, 3).roost(playerPanel);
        Crux.Text("total_ships", "pad8").grid(10, 13, 15, 3).roost(playerPanel);
        Crux.Text("new_ships", "pad8").grid(10, 15, 15, 3).roost(playerPanel);
        // This players stats
        if (player !== universe.player) {
            Crux.Text("", "pad8 txt_center")
                .grid(20, 9, 5, 3)
                .rawHTML(player.total_stars)
                .roost(playerPanel);
            Crux.Text("", "pad8 txt_center")
                .grid(20, 11, 5, 3)
                .rawHTML(player.total_fleets)
                .roost(playerPanel);
            Crux.Text("", "pad8 txt_center")
                .grid(20, 13, 5, 3)
                .rawHTML(player.total_strength)
                .roost(playerPanel);
            Crux.Text("", "pad8 txt_center")
                .grid(20, 15, 5, 3)
                .rawHTML(player.shipsPerTick)
                .roost(playerPanel);
        }
        function selectHilightStyle(p1, p2) {
            p1 = Number(p1);
            p2 = Number(p2);
            if (p1 < p2)
                return " txt_warn_bad";
            if (p1 > p2)
                return " txt_warn_good";
            return "";
        }
        // Your stats
        if (universe.player) {
            Crux.Text("", "pad8 txt_center ".concat(selectHilightStyle(universe.player.total_stars, player.total_stars)))
                .grid(25, 9, 5, 3)
                .rawHTML(universe.player.total_stars)
                .roost(playerPanel);
            Crux.Text("", "pad8 txt_center".concat(selectHilightStyle(universe.player.total_fleets, player.total_fleets)))
                .grid(25, 11, 5, 3)
                .rawHTML(universe.player.total_fleets)
                .roost(playerPanel);
            Crux.Text("", "pad8 txt_center".concat(selectHilightStyle(universe.player.total_strength, player.total_strength)))
                .grid(25, 13, 5, 3)
                .rawHTML(universe.player.total_strength)
                .roost(playerPanel);
            Crux.Text("", "pad8 txt_center".concat(selectHilightStyle(universe.player.shipsPerTick, player.shipsPerTick)))
                .grid(25, 15, 5, 3)
                .rawHTML(universe.player.shipsPerTick)
                .roost(playerPanel);
        }
        Crux.Widget("col_accent").grid(0, 16, 10, 3).roost(playerPanel);
        if (universe.player) {
            var msgBtn = Crux.IconButton("icon-mail", "inbox_new_message_to_player", player.uid)
                .grid(0, 16, 3, 3)
                .addStyle("fwd")
                .disable()
                .roost(playerPanel);
            if (player !== universe.player && player.alias) {
                msgBtn.enable();
            }
            Crux.IconButton("icon-chart-line", "show_intel", player.uid)
                .grid(2.5, 16, 3, 3)
                .roost(playerPanel);
            if (showEmpire) {
                Crux.IconButton("icon-eye", "show_screen", "empire")
                    .grid(7, 16, 3, 3)
                    .roost(playerPanel);
            }
        }
        return playerPanel;
    };
};
var superStarInspector = NeptunesPride.npui.StarInspector;
NeptunesPride.npui.StarInspector = function () {
    var universe = NeptunesPride.universe;
    var config = NeptunesPride.gameConfig;
    //Call super (Previous StarInspector from gamecode)
    var starInspector = superStarInspector();
    Crux.IconButton("icon-help rel", "show_help", "stars").roost(starInspector.heading);
    Crux.IconButton("icon-doc-text rel", "show_screen", "combat_calculator").roost(starInspector.heading);
    //Append extra function
    function apply_fractional_ships() {
        return __awaiter(this, void 0, void 0, function () {
            var depth, selector, element, counter, fractional_ship, fractional_ship_1, new_value;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        depth = config.turnBased ? 4 : 3;
                        selector = "#contentArea > div > div.widget.fullscreen > div:nth-child(".concat(depth, ") > div > div:nth-child(5) > div.widget.pad12.icon-rocket-inline.txt_right");
                        element = $(selector);
                        counter = 0;
                        fractional_ship = universe.selectedStar["c"].toFixed(2);
                        $(selector).append(fractional_ship);
                        _a.label = 1;
                    case 1:
                        if (!(element.length == 0 && counter <= 100)) return [3 /*break*/, 3];
                        return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 10); })];
                    case 2:
                        _a.sent();
                        element = $(selector);
                        fractional_ship_1 = universe.selectedStar["c"];
                        new_value = parseInt($(selector).text()) + fractional_ship_1;
                        $(selector).text(new_value.toFixed(2));
                        counter += 1;
                        return [3 /*break*/, 1];
                    case 3: return [2 /*return*/];
                }
            });
        });
    }
    if ("c" in universe.selectedStar) {
        apply_fractional_ships();
    }
    return starInspector;
};
//Change from timeout to hooks by updating the worker to hook into a game component.
//Javascript call
setTimeout(Legacy_NeptunesPrideAgent, 1000);
setTimeout(function () {
    //Typescript call
    (0,_ledger__WEBPACK_IMPORTED_MODULE_3__.renderLedger)(NeptunesPride, Crux, Mousetrap);
}, 1500);
setTimeout(apply_hooks, 1500);
//Test to see if PlayerPanel is there
//If it is overwrites custom one
//Otherwise while loop & set timeout until its there
force_add_custom_player_panel();

}();
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLHNDQUFzQyxJQUFJO0FBQzFDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsOEJBQThCLElBQUksSUFBSSxlQUFlLFNBQVMsS0FBSzs7QUFFbkU7QUFDQTtBQUNBOztBQUVBO0FBQ0Esd0NBQXdDLElBQUksRUFBRSxLQUFLOztBQUVuRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsNkNBQTZDO0FBQzdDO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDViwwQ0FBMEM7QUFDMUMsNENBQTRDO0FBQzVDO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQSw4Q0FBOEM7QUFDOUM7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QUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkNBQTJDLGFBQWE7QUFDeEQsaUVBQWlFO0FBQ2pFLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw0QkFBNEIsYUFBYTtBQUN6QztBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBDQUEwQyxhQUFhO0FBQ3ZEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQ0FBMkMsYUFBYTtBQUN4RCxpRUFBaUU7QUFDakUsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJDQUEyQztBQUMzQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLGFBQWEsUUFBUTtBQUNyQjtBQUNBO0FBQ0EsNEJBQTRCLE1BQU07QUFDbEM7O0FBRUE7QUFDQTtBQUNBOztB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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRCQUE0QixFQUFFO0FBQzlCO0FBQ0E7QUFDQTtBQUNBLHNDQUFzQyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsRUFBRSxJQUFJLEdBQUc7QUFDM0Q7QUFDQTtBQUNBO0FBQ0EsUUFBUSw2Q0FBSTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0VBQWtFO0FBQ2xFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQixFQUFFLEVBQUUsR0FBRztBQUM1QjtBQUNBO0FBQ0EscUJBQXFCLEVBQUUsRUFBRSxHQUFHO0FBQzVCO0FBQ0EsaUJBQWlCLEVBQUUsRUFBRSxHQUFHO0FBQ3hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLEVBQUUsTUFBTSxFQUFFLElBQUksR0FBRyxLQUFLLEVBQUUsSUFBSSxFQUFFO0FBQ3REO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNEQUFzRDtBQUN0RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMEJBQTBCLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxJQUFJLEdBQUc7QUFDbEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9DQUFvQyxFQUFFLEVBQUUsR0FBRyxHQUFHLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRTtBQUM1RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRDQUE0QyxHQUFHLEdBQUcsR0FBRyxNQUFNLEVBQUUsTUFBTSxFQUFFO0FBQ3JFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMENBQTBDLEdBQUcsVUFBVSxFQUFFO0FBQ3pEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQ0FBc0MsRUFBRSxLQUFLLEdBQUcsR0FBRyxHQUFHLE1BQU0sRUFBRSxNQUFNLEVBQUU7QUFDdEU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBDQUEwQyxFQUFFO0FBQzVDLDRDQUE0QyxHQUFHLFdBQVcsRUFBRTtBQUM1RCw0Q0FBNEMsR0FBRyxXQUFXLEVBQUU7QUFDNUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzREFBc0QsR0FBRyxHQUFHLEVBQUU7QUFDOUQ7QUFDQTtBQUNBO0FBQ0Esc0RBQXNELEdBQUcsR0FBRyxFQUFFO0FBQzlEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzREFBc0Qs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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdDQUF3QztBQUN4QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQ0FBc0M7QUFDdEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0RBQWdEO0FBQ2hEO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0NBQWtDLEVBQUU7QUFDcEM7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5QkFBeUIsZ0VBQWtCO0FBQzNDO0FBQ0E7QUFDQSx5QkFBeUIsOERBQWdCO0FBQ3pDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUJBQXVCLHdEQUFpQjtBQUN4QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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QW9CLG9EQUFRO0FBQzVCO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdFQUF3RSwyQkFBMkI7QUFDbkc7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2IsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJLHFEQUFZO0FBQ2hCLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vbmVwdHVuZXMtcHJpZGUtYWdlbnQvLi9zb3VyY2UvY2hhdC50cyIsIndlYnBhY2s6Ly9uZXB0dW5lcy1wcmlkZS1hZ2VudC8uL3NvdXJjZS9ldmVudF9jYWNoZS50cyIsIndlYnBhY2s6Ly9uZXB0dW5lcy1wcmlkZS1hZ2VudC8uL3NvdXJjZS9ob3RrZXkudHMiLCJ3ZWJwYWNrOi8vbmVwdHVuZXMtcHJpZGUtYWdlbnQvLi9zb3VyY2UvbGVkZ2VyLnRzIiwid2VicGFjazovL25lcHR1bmVzLXByaWRlLWFnZW50Ly4vc291cmNlL21lcmdlLmpzIiwid2VicGFjazovL25lcHR1bmVzLXByaWRlLWFnZW50Ly4vc291cmNlL3BhcnNlX3V0aWxzLnRzIiwid2VicGFjazovL25lcHR1bmVzLXByaWRlLWFnZW50Ly4vc291cmNlL3V0aWxpdGllcy50cyIsIndlYnBhY2s6Ly9uZXB0dW5lcy1wcmlkZS1hZ2VudC8uL25vZGVfbW9kdWxlcy9tYXJrZWQvbGliL21hcmtlZC5lc20uanMiLCJ3ZWJwYWNrOi8vbmVwdHVuZXMtcHJpZGUtYWdlbnQvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vbmVwdHVuZXMtcHJpZGUtYWdlbnQvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL25lcHR1bmVzLXByaWRlLWFnZW50L3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vbmVwdHVuZXMtcHJpZGUtYWdlbnQvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9uZXB0dW5lcy1wcmlkZS1hZ2VudC8uL3NvdXJjZS9pbnRlbC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBnZXRfaGVybyB9IGZyb20gXCIuL3V0aWxpdGllc1wiO1xudmFyIFJFU0VBQ0hfTUFQID0ge1xuICAgIHNjYW5uaW5nOiBcIlNjYW5uaW5nXCIsXG4gICAgcHJvcHVsc2lvbjogXCJIeXBlcnNwYWNlIFJhbmdlXCIsXG4gICAgdGVycmFmb3JtaW5nOiBcIlRlcnJhZm9ybWluZ1wiLFxuICAgIHJlc2VhcmNoOiBcIkV4cGVyaW1lbnRhdGlvblwiLFxuICAgIHdlYXBvbnM6IFwiV2VhcG9uc1wiLFxuICAgIGJhbmtpbmc6IFwiQmFua2luZ1wiLFxuICAgIG1hbnVmYWN0dXJpbmc6IFwiTWFudWZhY3R1cmluZ1wiLFxufTtcbi8vRm9yIHF1aWNrIHJlc2VhcmNoIGRpc3BsYXlcbmZ1bmN0aW9uIGdldF9yZXNlYXJjaChnYW1lKSB7XG4gICAgdmFyIHVuaXZlcnNlID0gZ2FtZS51bml2ZXJzZTtcbiAgICB2YXIgaGVybyA9IGdldF9oZXJvKGdhbWUudW5pdmVyc2UpO1xuICAgIHZhciBzY2llbmNlID0gaGVyby50b3RhbF9zY2llbmNlO1xuICAgIC8vQ3VycmVudCBTY2llbmNlXG4gICAgdmFyIGN1cnJlbnQgPSBoZXJvLnRlY2hbaGVyby5yZXNlYXJjaGluZ107XG4gICAgdmFyIGN1cnJlbnRfcG9pbnRzX3JlbWFpbmluZyA9IGN1cnJlbnQuYnJyICogY3VycmVudC5sZXZlbCAtIGN1cnJlbnQucmVzZWFyY2g7XG4gICAgdmFyIGV0YSA9IE1hdGguY2VpbChjdXJyZW50X3BvaW50c19yZW1haW5pbmcgLyBzY2llbmNlKTsgLy9Ib3Vyc1xuICAgIC8vTmV4dCBzY2llbmNlXG4gICAgdmFyIG5leHQgPSBoZXJvLnRlY2hbaGVyby5yZXNlYXJjaGluZ19uZXh0XTtcbiAgICB2YXIgbmV4dF9wb2ludHNfcmVtYWluaW5nID0gbmV4dC5icnIgKiBuZXh0LmxldmVsIC0gbmV4dC5yZXNlYXJjaDtcbiAgICB2YXIgbmV4dF9ldGEgPSBNYXRoLmNlaWwobmV4dF9wb2ludHNfcmVtYWluaW5nIC8gc2NpZW5jZSkgKyBldGE7XG4gICAgdmFyIG5leHRfbGV2ZWwgPSBuZXh0LmxldmVsICsgMTtcbiAgICBpZiAoaGVyby5yZXNlYXJjaGluZyA9PSBoZXJvLnJlc2VhcmNoaW5nX25leHQpIHtcbiAgICAgICAgLy9SZWN1cnJpbmcgcmVzZWFyY2hcbiAgICAgICAgbmV4dF9wb2ludHNfcmVtYWluaW5nICs9IG5leHQuYnJyO1xuICAgICAgICBuZXh0X2V0YSA9IE1hdGguY2VpbCgobmV4dC5icnIgKiBuZXh0LmxldmVsICsgMSkgLyBzY2llbmNlKSArIGV0YTtcbiAgICAgICAgbmV4dF9sZXZlbCArPSAxO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICBjdXJyZW50X25hbWU6IFJFU0VBQ0hfTUFQW2hlcm8ucmVzZWFyY2hpbmddLFxuICAgICAgICBjdXJyZW50X2xldmVsOiBjdXJyZW50W1wibGV2ZWxcIl0gKyAxLFxuICAgICAgICBjdXJyZW50X2V0YTogZXRhLFxuICAgICAgICBuZXh0X25hbWU6IFJFU0VBQ0hfTUFQW2hlcm8ucmVzZWFyY2hpbmdfbmV4dF0sXG4gICAgICAgIG5leHRfbGV2ZWw6IG5leHRfbGV2ZWwsXG4gICAgICAgIG5leHRfZXRhOiBuZXh0X2V0YSxcbiAgICAgICAgc2NpZW5jZTogc2NpZW5jZSxcbiAgICB9O1xufVxuZnVuY3Rpb24gZ2V0X3Jlc2VhcmNoX3RleHQoZ2FtZSkge1xuICAgIHZhciByZXNlYXJjaCA9IGdldF9yZXNlYXJjaChnYW1lKTtcbiAgICB2YXIgZmlyc3RfbGluZSA9IFwiTm93OiBcIi5jb25jYXQocmVzZWFyY2hbXCJjdXJyZW50X25hbWVcIl0sIFwiIFwiKS5jb25jYXQocmVzZWFyY2hbXCJjdXJyZW50X2xldmVsXCJdLCBcIiAtIFwiKS5jb25jYXQocmVzZWFyY2hbXCJjdXJyZW50X2V0YVwiXSwgXCIgdGlja3MuXCIpO1xuICAgIHZhciBzZWNvbmRfbGluZSA9IFwiTmV4dDogXCIuY29uY2F0KHJlc2VhcmNoW1wibmV4dF9uYW1lXCJdLCBcIiBcIikuY29uY2F0KHJlc2VhcmNoW1wibmV4dF9sZXZlbFwiXSwgXCIgLSBcIikuY29uY2F0KHJlc2VhcmNoW1wibmV4dF9ldGFcIl0sIFwiIHRpY2tzLlwiKTtcbiAgICB2YXIgdGhpcmRfbGluZSA9IFwiTXkgU2NpZW5jZTogXCIuY29uY2F0KHJlc2VhcmNoW1wic2NpZW5jZVwiXSk7XG4gICAgcmV0dXJuIFwiXCIuY29uY2F0KGZpcnN0X2xpbmUsIFwiXFxuXCIpLmNvbmNhdChzZWNvbmRfbGluZSwgXCJcXG5cIikuY29uY2F0KHRoaXJkX2xpbmUsIFwiXFxuXCIpO1xufVxuZnVuY3Rpb24gTWFya0Rvd25NZXNzYWdlQ29tbWVudChjb250ZXh0LCB0ZXh0LCBpbmRleCkge1xuICAgIHZhciBtZXNzYWdlQ29tbWVudCA9IGNvbnRleHQuTWVzc2FnZUNvbW1lbnQodGV4dCwgaW5kZXgpO1xuICAgIHJldHVybiBcIlwiO1xufVxuZXhwb3J0IHsgZ2V0X3Jlc2VhcmNoLCBnZXRfcmVzZWFyY2hfdGV4dCwgTWFya0Rvd25NZXNzYWdlQ29tbWVudCB9O1xuIiwiaW1wb3J0IHsgZ2V0X2xlZGdlciB9IGZyb20gXCIuL2xlZGdlclwiO1xuaW1wb3J0IHsgZ2V0X2hlcm8gfSBmcm9tIFwiLi91dGlsaXRpZXNcIjtcbi8vR2xvYmFsIGNhY2hlZCBldmVudCBzeXN0ZW0uXG5leHBvcnQgdmFyIGNhY2hlZF9ldmVudHMgPSBbXTtcbmV4cG9ydCB2YXIgY2FjaGVGZXRjaFN0YXJ0ID0gbmV3IERhdGUoKTtcbmV4cG9ydCB2YXIgY2FjaGVGZXRjaFNpemUgPSAwO1xuLy9Bc3luYyByZXF1ZXN0IGdhbWUgZXZlbnRzXG4vL2dhbWUgaXMgdXNlZCB0byBnZXQgdGhlIGFwaSB2ZXJzaW9uIGFuZCB0aGUgZ2FtZU51bWJlclxuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZV9ldmVudF9jYWNoZShnYW1lLCBjcnV4LCBmZXRjaFNpemUsIHN1Y2Nlc3MsIGVycm9yKSB7XG4gICAgdmFyIGNvdW50ID0gY2FjaGVkX2V2ZW50cy5sZW5ndGggPiAwID8gZmV0Y2hTaXplIDogMTAwMDAwO1xuICAgIGNhY2hlRmV0Y2hTdGFydCA9IG5ldyBEYXRlKCk7XG4gICAgY2FjaGVGZXRjaFNpemUgPSBjb3VudDtcbiAgICB2YXIgcGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh7XG4gICAgICAgIHR5cGU6IFwiZmV0Y2hfZ2FtZV9tZXNzYWdlc1wiLFxuICAgICAgICBjb3VudDogY291bnQudG9TdHJpbmcoKSxcbiAgICAgICAgb2Zmc2V0OiBcIjBcIixcbiAgICAgICAgZ3JvdXA6IFwiZ2FtZV9ldmVudFwiLFxuICAgICAgICB2ZXJzaW9uOiBnYW1lLnZlcnNpb24sXG4gICAgICAgIGdhbWVfbnVtYmVyOiBnYW1lLmdhbWVOdW1iZXIsXG4gICAgfSk7XG4gICAgdmFyIGhlYWRlcnMgPSB7XG4gICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkblwiLFxuICAgIH07XG4gICAgZmV0Y2goXCIvdHJlcXVlc3QvZmV0Y2hfZ2FtZV9tZXNzYWdlc1wiLCB7XG4gICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkXCIsXG4gICAgICAgIH0sXG4gICAgICAgIGJvZHk6IHBhcmFtcyxcbiAgICB9KVxuICAgICAgICAudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHsgcmV0dXJuIHJlc3BvbnNlLmpzb24oKTsgfSlcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7IHJldHVybiBzdWNjZXNzKGdhbWUsIGNydXgsIHJlc3BvbnNlKTsgfSlcbiAgICAgICAgLmNhdGNoKGVycm9yKTtcbn1cbi8vQ3VzdG9tIFVJIENvbXBvbmVudHMgZm9yIExlZGdlclxuZXhwb3J0IGZ1bmN0aW9uIFBsYXllck5hbWVJY29uUm93TGluayhjcnV4LCBucHVpLCBwbGF5ZXIpIHtcbiAgICB2YXIgcGxheWVyTmFtZUljb25Sb3cgPSBjcnV4LldpZGdldChcInJlbCBjb2xfYmxhY2sgY2xpY2thYmxlXCIpLnNpemUoNDgwLCA0OCk7XG4gICAgbnB1aS5QbGF5ZXJJY29uKHBsYXllciwgdHJ1ZSkucm9vc3QocGxheWVyTmFtZUljb25Sb3cpO1xuICAgIGNydXhcbiAgICAgICAgLlRleHQoXCJcIiwgXCJzZWN0aW9uX3RpdGxlXCIpXG4gICAgICAgIC5ncmlkKDYsIDAsIDIxLCAzKVxuICAgICAgICAucmF3SFRNTChcIjxhIG9uY2xpY2s9XFxcIkNydXguY3J1eC50cmlnZ2VyKCdzaG93X3BsYXllcl91aWQnLCAnXCIuY29uY2F0KHBsYXllci51aWQsIFwiJyApXFxcIj5cIikuY29uY2F0KHBsYXllci5hbGlhcywgXCI8L2E+XCIpKVxuICAgICAgICAucm9vc3QocGxheWVyTmFtZUljb25Sb3cpO1xuICAgIHJldHVybiBwbGF5ZXJOYW1lSWNvblJvdztcbn1cbi8vSGFuZGxlciB0byByZWNpZXZlIG5ldyBtZXNzYWdlc1xuZXhwb3J0IGZ1bmN0aW9uIHJlY2lldmVfbmV3X21lc3NhZ2VzKGdhbWUsIGNydXgsIHJlc3BvbnNlKSB7XG4gICAgdmFyIHVuaXZlcnNlID0gZ2FtZS51bml2ZXJzZTtcbiAgICB2YXIgbnB1aSA9IGdhbWUubnB1aTtcbiAgICB2YXIgY2FjaGVGZXRjaEVuZCA9IG5ldyBEYXRlKCk7XG4gICAgdmFyIGVsYXBzZWQgPSBjYWNoZUZldGNoRW5kLmdldFRpbWUoKSAtIGNhY2hlRmV0Y2hTdGFydC5nZXRUaW1lKCk7XG4gICAgY29uc29sZS5sb2coXCJGZXRjaGVkIFwiLmNvbmNhdChjYWNoZUZldGNoU2l6ZSwgXCIgZXZlbnRzIGluIFwiKS5jb25jYXQoZWxhcHNlZCwgXCJtc1wiKSk7XG4gICAgdmFyIGluY29taW5nID0gcmVzcG9uc2UucmVwb3J0Lm1lc3NhZ2VzO1xuICAgIGlmIChjYWNoZWRfZXZlbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdmFyIG92ZXJsYXBPZmZzZXQgPSAtMTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbmNvbWluZy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBpbmNvbWluZ1tpXTtcbiAgICAgICAgICAgIGlmIChtZXNzYWdlLmtleSA9PT0gY2FjaGVkX2V2ZW50c1swXS5rZXkpIHtcbiAgICAgICAgICAgICAgICBvdmVybGFwT2Zmc2V0ID0gaTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAob3ZlcmxhcE9mZnNldCA+PSAwKSB7XG4gICAgICAgICAgICBpbmNvbWluZyA9IGluY29taW5nLnNsaWNlKDAsIG92ZXJsYXBPZmZzZXQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG92ZXJsYXBPZmZzZXQgPCAwKSB7XG4gICAgICAgICAgICB2YXIgc2l6ZSA9IGluY29taW5nLmxlbmd0aCAqIDI7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIk1pc3Npbmcgc29tZSBldmVudHMsIGRvdWJsZSBmZXRjaCB0byBcIi5jb25jYXQoc2l6ZSkpO1xuICAgICAgICAgICAgdXBkYXRlX2V2ZW50X2NhY2hlKGdhbWUsIGNydXgsIHNpemUsIHJlY2lldmVfbmV3X21lc3NhZ2VzLCBjb25zb2xlLmVycm9yKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyB3ZSBoYWQgY2FjaGVkIGV2ZW50cywgYnV0IHdhbnQgdG8gYmUgZXh0cmEgcGFyYW5vaWQgYWJvdXRcbiAgICAgICAgLy8gY29ycmVjdG5lc3MuIFNvIGlmIHRoZSByZXNwb25zZSBjb250YWluZWQgdGhlIGVudGlyZSBldmVudFxuICAgICAgICAvLyBsb2csIHZhbGlkYXRlIHRoYXQgaXQgZXhhY3RseSBtYXRjaGVzIHRoZSBjYWNoZWQgZXZlbnRzLlxuICAgICAgICBpZiAocmVzcG9uc2UucmVwb3J0Lm1lc3NhZ2VzLmxlbmd0aCA9PT0gY2FjaGVkX2V2ZW50cy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiKioqIFZhbGlkYXRpbmcgY2FjaGVkX2V2ZW50cyAqKipcIik7XG4gICAgICAgICAgICB2YXIgdmFsaWRfMSA9IHJlc3BvbnNlLnJlcG9ydC5tZXNzYWdlcztcbiAgICAgICAgICAgIHZhciBpbnZhbGlkRW50cmllcyA9IGNhY2hlZF9ldmVudHMuZmlsdGVyKGZ1bmN0aW9uIChlLCBpKSB7IHJldHVybiBlLmtleSAhPT0gdmFsaWRfMVtpXS5rZXk7IH0pO1xuICAgICAgICAgICAgaWYgKGludmFsaWRFbnRyaWVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCIhISBJbnZhbGlkIGVudHJpZXMgZm91bmQ6IFwiLCBpbnZhbGlkRW50cmllcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIioqKiBWYWxpZGF0aW9uIENvbXBsZXRlZCAqKipcIik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyB0aGUgcmVzcG9uc2UgZGlkbid0IGNvbnRhaW4gdGhlIGVudGlyZSBldmVudCBsb2cuIEdvIGZldGNoXG4gICAgICAgICAgICAvLyBhIHZlcnNpb24gdGhhdCBfZG9lc18uXG4gICAgICAgICAgICB1cGRhdGVfZXZlbnRfY2FjaGUoZ2FtZSwgY3J1eCwgMTAwMDAwLCByZWNpZXZlX25ld19tZXNzYWdlcywgY29uc29sZS5lcnJvcik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY2FjaGVkX2V2ZW50cyA9IGluY29taW5nLmNvbmNhdChjYWNoZWRfZXZlbnRzKTtcbiAgICB2YXIgcGxheWVycyA9IGdldF9sZWRnZXIoZ2FtZSwgY3J1eCwgY2FjaGVkX2V2ZW50cyk7XG4gICAgdmFyIGxlZGdlclNjcmVlbiA9IG5wdWkubGVkZ2VyU2NyZWVuKCk7XG4gICAgbnB1aS5vbkhpZGVTY3JlZW4obnVsbCwgdHJ1ZSk7XG4gICAgbnB1aS5vbkhpZGVTZWxlY3Rpb25NZW51KCk7XG4gICAgbnB1aS50cmlnZ2VyKFwiaGlkZV9zaWRlX21lbnVcIik7XG4gICAgbnB1aS50cmlnZ2VyKFwicmVzZXRfZWRpdF9tb2RlXCIpO1xuICAgIG5wdWkuYWN0aXZlU2NyZWVuID0gbGVkZ2VyU2NyZWVuO1xuICAgIGxlZGdlclNjcmVlbi5yb29zdChucHVpLnNjcmVlbkNvbnRhaW5lcik7XG4gICAgbnB1aS5sYXlvdXRFbGVtZW50KGxlZGdlclNjcmVlbik7XG4gICAgcGxheWVycy5mb3JFYWNoKGZ1bmN0aW9uIChwKSB7XG4gICAgICAgIHZhciBwbGF5ZXIgPSBQbGF5ZXJOYW1lSWNvblJvd0xpbmsoY3J1eCwgbnB1aSwgdW5pdmVyc2UuZ2FsYXh5LnBsYXllcnNbcC51aWRdKS5yb29zdChucHVpLmFjdGl2ZVNjcmVlbik7XG4gICAgICAgIHBsYXllci5hZGRTdHlsZShcInBsYXllcl9jZWxsXCIpO1xuICAgICAgICB2YXIgcHJvbXB0ID0gcC5kZWJ0ID4gMCA/IFwiVGhleSBvd2VcIiA6IFwiWW91IG93ZVwiO1xuICAgICAgICBpZiAocC5kZWJ0ID09IDApIHtcbiAgICAgICAgICAgIHByb21wdCA9IFwiQmFsYW5jZVwiO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwLmRlYnQgPCAwKSB7XG4gICAgICAgICAgICBjcnV4XG4gICAgICAgICAgICAgICAgLlRleHQoXCJcIiwgXCJwYWQxMiB0eHRfcmlnaHQgcmVkLXRleHRcIilcbiAgICAgICAgICAgICAgICAucmF3SFRNTChcIlwiLmNvbmNhdChwcm9tcHQsIFwiOiBcIikuY29uY2F0KHAuZGVidCkpXG4gICAgICAgICAgICAgICAgLmdyaWQoMjAsIDAsIDEwLCAzKVxuICAgICAgICAgICAgICAgIC5yb29zdChwbGF5ZXIpO1xuICAgICAgICAgICAgaWYgKHAuZGVidCAqIC0xIDw9IGdldF9oZXJvKHVuaXZlcnNlKS5jYXNoKSB7XG4gICAgICAgICAgICAgICAgY3J1eFxuICAgICAgICAgICAgICAgICAgICAuQnV0dG9uKFwiZm9yZ2l2ZVwiLCBcImZvcmdpdmVfZGVidFwiLCB7IHRhcmdldFBsYXllcjogcC51aWQgfSlcbiAgICAgICAgICAgICAgICAgICAgLmdyaWQoMTcsIDAsIDYsIDMpXG4gICAgICAgICAgICAgICAgICAgIC5yb29zdChwbGF5ZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHAuZGVidCA+IDApIHtcbiAgICAgICAgICAgIGNydXhcbiAgICAgICAgICAgICAgICAuVGV4dChcIlwiLCBcInBhZDEyIHR4dF9yaWdodCBibHVlLXRleHRcIilcbiAgICAgICAgICAgICAgICAucmF3SFRNTChcIlwiLmNvbmNhdChwcm9tcHQsIFwiOiBcIikuY29uY2F0KHAuZGVidCkpXG4gICAgICAgICAgICAgICAgLmdyaWQoMjAsIDAsIDEwLCAzKVxuICAgICAgICAgICAgICAgIC5yb29zdChwbGF5ZXIpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHAuZGVidCA9PSAwKSB7XG4gICAgICAgICAgICBjcnV4XG4gICAgICAgICAgICAgICAgLlRleHQoXCJcIiwgXCJwYWQxMiB0eHRfcmlnaHQgb3JhbmdlLXRleHRcIilcbiAgICAgICAgICAgICAgICAucmF3SFRNTChcIlwiLmNvbmNhdChwcm9tcHQsIFwiOiBcIikuY29uY2F0KHAuZGVidCkpXG4gICAgICAgICAgICAgICAgLmdyaWQoMjAsIDAsIDEwLCAzKVxuICAgICAgICAgICAgICAgIC5yb29zdChwbGF5ZXIpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5leHBvcnQgZGVmYXVsdCB7XG4gICAgdXBkYXRlX2V2ZW50X2NhY2hlOiB1cGRhdGVfZXZlbnRfY2FjaGUsXG4gICAgcmVjaWV2ZV9uZXdfbWVzc2FnZXM6IHJlY2lldmVfbmV3X21lc3NhZ2VzLFxufTtcbiIsImV4cG9ydCB2YXIgbGFzdENsaXAgPSBcIkVycm9yXCI7XG5leHBvcnQgZnVuY3Rpb24gY2xpcCh0ZXh0KSB7XG4gICAgbGFzdENsaXAgPSB0ZXh0O1xufVxuIiwiaW1wb3J0IHsgZ2V0X2hlcm8gfSBmcm9tIFwiLi91dGlsaXRpZXNcIjtcbmltcG9ydCAqIGFzIENhY2hlIGZyb20gXCIuL2V2ZW50X2NhY2hlXCI7XG4vL0dldCBsZWRnZXIgaW5mbyB0byBzZWUgd2hhdCBpcyBvd2VkXG4vL0FjdHVhbGx5IHNob3dzIHRoZSBwYW5lbCBvZiBsb2FkaW5nXG5leHBvcnQgZnVuY3Rpb24gZ2V0X2xlZGdlcihnYW1lLCBjcnV4LCBtZXNzYWdlcykge1xuICAgIHZhciBucHVpID0gZ2FtZS5ucHVpO1xuICAgIHZhciB1bml2ZXJzZSA9IGdhbWUudW5pdmVyc2U7XG4gICAgdmFyIHBsYXllcnMgPSB1bml2ZXJzZS5nYWxheHkucGxheWVycztcbiAgICB2YXIgbG9hZGluZyA9IGNydXhcbiAgICAgICAgLlRleHQoXCJcIiwgXCJyZWwgdHh0X2NlbnRlciBwYWQxMlwiKVxuICAgICAgICAucmF3SFRNTChcIlBhcnNpbmcgXCIuY29uY2F0KG1lc3NhZ2VzLmxlbmd0aCwgXCIgbWVzc2FnZXMuXCIpKTtcbiAgICBsb2FkaW5nLnJvb3N0KG5wdWkuYWN0aXZlU2NyZWVuKTtcbiAgICB2YXIgdWlkID0gZ2V0X2hlcm8odW5pdmVyc2UpLnVpZDtcbiAgICAvL0xlZGdlciBpcyBhIGxpc3Qgb2YgZGVidHNcbiAgICB2YXIgbGVkZ2VyID0ge307XG4gICAgbWVzc2FnZXNcbiAgICAgICAgLmZpbHRlcihmdW5jdGlvbiAobSkge1xuICAgICAgICByZXR1cm4gbS5wYXlsb2FkLnRlbXBsYXRlID09IFwibW9uZXlfc2VudFwiIHx8XG4gICAgICAgICAgICBtLnBheWxvYWQudGVtcGxhdGUgPT0gXCJzaGFyZWRfdGVjaG5vbG9neVwiO1xuICAgIH0pXG4gICAgICAgIC5tYXAoZnVuY3Rpb24gKG0pIHsgcmV0dXJuIG0ucGF5bG9hZDsgfSlcbiAgICAgICAgLmZvckVhY2goZnVuY3Rpb24gKG0pIHtcbiAgICAgICAgdmFyIGxpYWlzb24gPSBtLmZyb21fcHVpZCA9PSB1aWQgPyBtLnRvX3B1aWQgOiBtLmZyb21fcHVpZDtcbiAgICAgICAgdmFyIHZhbHVlID0gbS50ZW1wbGF0ZSA9PSBcIm1vbmV5X3NlbnRcIiA/IG0uYW1vdW50IDogbS5wcmljZTtcbiAgICAgICAgdmFsdWUgKj0gbS5mcm9tX3B1aWQgPT0gdWlkID8gMSA6IC0xOyAvLyBhbW91bnQgaXMgKCspIGlmIGNyZWRpdCAmICgtKSBpZiBkZWJ0XG4gICAgICAgIGxpYWlzb24gaW4gbGVkZ2VyXG4gICAgICAgICAgICA/IChsZWRnZXJbbGlhaXNvbl0gKz0gdmFsdWUpXG4gICAgICAgICAgICA6IChsZWRnZXJbbGlhaXNvbl0gPSB2YWx1ZSk7XG4gICAgfSk7XG4gICAgLy9UT0RPOiBSZXZpZXcgdGhhdCB0aGlzIGlzIGNvcnJlY3RseSBmaW5kaW5nIGEgbGlzdCBvZiBvbmx5IHBlb3BsZSB3aG8gaGF2ZSBkZWJ0cy5cbiAgICAvL0FjY291bnRzIGFyZSB0aGUgY3JlZGl0IG9yIGRlYml0IHJlbGF0ZWQgdG8gZWFjaCB1c2VyXG4gICAgdmFyIGFjY291bnRzID0gW107XG4gICAgZm9yICh2YXIgdWlkXzEgaW4gbGVkZ2VyKSB7XG4gICAgICAgIHZhciBwbGF5ZXIgPSBwbGF5ZXJzW3BhcnNlSW50KHVpZF8xKV07XG4gICAgICAgIHBsYXllci5kZWJ0ID0gbGVkZ2VyW3VpZF8xXTtcbiAgICAgICAgYWNjb3VudHMucHVzaChwbGF5ZXIpO1xuICAgIH1cbiAgICBnZXRfaGVybyh1bml2ZXJzZSkubGVkZ2VyID0gbGVkZ2VyO1xuICAgIGNvbnNvbGUubG9nKGFjY291bnRzKTtcbiAgICByZXR1cm4gYWNjb3VudHM7XG59XG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyTGVkZ2VyKGdhbWUsIGNydXgsIE1vdXNlVHJhcCkge1xuICAgIC8vRGVjb25zdHJ1Y3Rpb24gb2YgZGlmZmVyZW50IGNvbXBvbmVudHMgb2YgdGhlIGdhbWUuXG4gICAgdmFyIGNvbmZpZyA9IGdhbWUuY29uZmlnO1xuICAgIHZhciBucCA9IGdhbWUubnA7XG4gICAgdmFyIG5wdWkgPSBnYW1lLm5wdWk7XG4gICAgdmFyIHVuaXZlcnNlID0gZ2FtZS51bml2ZXJzZTtcbiAgICB2YXIgdGVtcGxhdGVzID0gZ2FtZS50ZW1wbGF0ZXM7XG4gICAgdmFyIHBsYXllcnMgPSB1bml2ZXJzZS5nYWxheHkucGxheWVycztcbiAgICBNb3VzZVRyYXAuYmluZChbXCJtXCIsIFwiTVwiXSwgZnVuY3Rpb24gKCkge1xuICAgICAgICBucC50cmlnZ2VyKFwidHJpZ2dlcl9sZWRnZXJcIik7XG4gICAgfSk7XG4gICAgdGVtcGxhdGVzW1wibGVkZ2VyXCJdID0gXCJMZWRnZXJcIjtcbiAgICB0ZW1wbGF0ZXNbXCJ0ZWNoX3RyYWRpbmdcIl0gPSBcIlRyYWRpbmcgVGVjaG5vbG9neVwiO1xuICAgIHRlbXBsYXRlc1tcImZvcmdpdmVcIl0gPSBcIlBheSBEZWJ0XCI7XG4gICAgdGVtcGxhdGVzW1wiZm9yZ2l2ZV9kZWJ0XCJdID0gXCJBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gZm9yZ2l2ZSB0aGlzIGRlYnQ/XCI7XG4gICAgaWYgKCFucHVpLmhhc21lbnVpdGVtKSB7XG4gICAgICAgIG5wdWlcbiAgICAgICAgICAgIC5TaWRlTWVudUl0ZW0oXCJpY29uLWRhdGFiYXNlXCIsIFwibGVkZ2VyXCIsIFwidHJpZ2dlcl9sZWRnZXJcIilcbiAgICAgICAgICAgIC5yb29zdChucHVpLnNpZGVNZW51KTtcbiAgICAgICAgbnB1aS5oYXNtZW51aXRlbSA9IHRydWU7XG4gICAgfVxuICAgIG5wdWkubGVkZ2VyU2NyZWVuID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gbnB1aS5TY3JlZW4oXCJsZWRnZXJcIik7XG4gICAgfTtcbiAgICBucC5vbihcInRyaWdnZXJfbGVkZ2VyXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGxlZGdlclNjcmVlbiA9IG5wdWkubGVkZ2VyU2NyZWVuKCk7XG4gICAgICAgIHZhciBsb2FkaW5nID0gY3J1eFxuICAgICAgICAgICAgLlRleHQoXCJcIiwgXCJyZWwgdHh0X2NlbnRlciBwYWQxMiBzZWN0aW9uX3RpdGxlXCIpXG4gICAgICAgICAgICAucmF3SFRNTChcIlRhYnVsYXRpbmcgTGVkZ2VyLi4uXCIpO1xuICAgICAgICBsb2FkaW5nLnJvb3N0KGxlZGdlclNjcmVlbik7XG4gICAgICAgIG5wdWkub25IaWRlU2NyZWVuKG51bGwsIHRydWUpO1xuICAgICAgICBucHVpLm9uSGlkZVNlbGVjdGlvbk1lbnUoKTtcbiAgICAgICAgbnB1aS50cmlnZ2VyKFwiaGlkZV9zaWRlX21lbnVcIik7XG4gICAgICAgIG5wdWkudHJpZ2dlcihcInJlc2V0X2VkaXRfbW9kZVwiKTtcbiAgICAgICAgbnB1aS5hY3RpdmVTY3JlZW4gPSBsZWRnZXJTY3JlZW47XG4gICAgICAgIGxlZGdlclNjcmVlbi5yb29zdChucHVpLnNjcmVlbkNvbnRhaW5lcik7XG4gICAgICAgIG5wdWkubGF5b3V0RWxlbWVudChsZWRnZXJTY3JlZW4pO1xuICAgICAgICBDYWNoZS51cGRhdGVfZXZlbnRfY2FjaGUoZ2FtZSwgY3J1eCwgNCwgQ2FjaGUucmVjaWV2ZV9uZXdfbWVzc2FnZXMsIGNvbnNvbGUuZXJyb3IpO1xuICAgIH0pO1xuICAgIC8vV2h5IG5vdCBucC5vbihcIkZvcmdpdmVEZWJ0XCIpP1xuICAgIG5wLm9uRm9yZ2l2ZURlYnQgPSBmdW5jdGlvbiAoZXZlbnQsIGRhdGEpIHtcbiAgICAgICAgdmFyIHRhcmdldFBsYXllciA9IGRhdGEudGFyZ2V0UGxheWVyO1xuICAgICAgICB2YXIgcGxheWVyID0gcGxheWVyc1t0YXJnZXRQbGF5ZXJdO1xuICAgICAgICB2YXIgYW1vdW50ID0gcGxheWVyLmRlYnQgKiAtMTtcbiAgICAgICAgLy9sZXQgYW1vdW50ID0gMVxuICAgICAgICB1bml2ZXJzZS5wbGF5ZXIubGVkZ2VyW3RhcmdldFBsYXllcl0gPSAwO1xuICAgICAgICBucC50cmlnZ2VyKFwic2hvd19zY3JlZW5cIiwgW1xuICAgICAgICAgICAgXCJjb25maXJtXCIsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZTogXCJmb3JnaXZlX2RlYnRcIixcbiAgICAgICAgICAgICAgICBldmVudEtpbmQ6IFwiY29uZmlybV9mb3JnaXZlX2RlYnRcIixcbiAgICAgICAgICAgICAgICBldmVudERhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJvcmRlclwiLFxuICAgICAgICAgICAgICAgICAgICBvcmRlcjogXCJzZW5kX21vbmV5LFwiLmNvbmNhdCh0YXJnZXRQbGF5ZXIsIFwiLFwiKS5jb25jYXQoYW1vdW50KSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgXSk7XG4gICAgfTtcbiAgICBucC5vbihcImNvbmZpcm1fZm9yZ2l2ZV9kZWJ0XCIsIGZ1bmN0aW9uIChldmVudCwgZGF0YSkge1xuICAgICAgICBucC50cmlnZ2VyKFwic2VydmVyX3JlcXVlc3RcIiwgZGF0YSk7XG4gICAgICAgIG5wLnRyaWdnZXIoXCJ0cmlnZ2VyX2xlZGdlclwiKTtcbiAgICB9KTtcbiAgICBucC5vbihcImZvcmdpdmVfZGVidFwiLCBucC5vbkZvcmdpdmVEZWJ0KTtcbn1cbiIsInZhciBfX2Fzc2lnbiA9ICh0aGlzICYmIHRoaXMuX19hc3NpZ24pIHx8IGZ1bmN0aW9uICgpIHtcbiAgICBfX2Fzc2lnbiA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24odCkge1xuICAgICAgICBmb3IgKHZhciBzLCBpID0gMSwgbiA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBuOyBpKyspIHtcbiAgICAgICAgICAgIHMgPSBhcmd1bWVudHNbaV07XG4gICAgICAgICAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkpXG4gICAgICAgICAgICAgICAgdFtwXSA9IHNbcF07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHQ7XG4gICAgfTtcbiAgICByZXR1cm4gX19hc3NpZ24uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn07XG5mdW5jdGlvbiBtZXJnZVVzZXIoZXZlbnQsIGRhdGEpIHtcbiAgICBpZiAoTmVwdHVuZXNQcmlkZS5vcmlnaW5hbFBsYXllciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIE5lcHR1bmVzUHJpZGUub3JpZ2luYWxQbGF5ZXIgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlLnBsYXllci51aWQ7XG4gICAgfVxuICAgIHZhciBjb2RlID0gKGRhdGEgPT09IG51bGwgfHwgZGF0YSA9PT0gdm9pZCAwID8gdm9pZCAwIDogZGF0YS5zcGxpdChcIjpcIilbMV0pIHx8IG90aGVyVXNlckNvZGU7XG4gICAgdmFyIG90aGVyVXNlckNvZGUgPSBjb2RlO1xuICAgIGlmIChvdGhlclVzZXJDb2RlKSB7XG4gICAgICAgIHZhciBwYXJhbXMgPSB7XG4gICAgICAgICAgICBnYW1lX251bWJlcjogZ2FtZSxcbiAgICAgICAgICAgIGFwaV92ZXJzaW9uOiBcIjAuMVwiLFxuICAgICAgICAgICAgY29kZTogb3RoZXJVc2VyQ29kZSxcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIGVnZ2VycyA9IGpRdWVyeS5hamF4KHtcbiAgICAgICAgICAgIHR5cGU6IFwiUE9TVFwiLFxuICAgICAgICAgICAgdXJsOiBcImh0dHBzOi8vbnAuaXJvbmhlbG1ldC5jb20vYXBpXCIsXG4gICAgICAgICAgICBhc3luYzogZmFsc2UsXG4gICAgICAgICAgICBkYXRhOiBwYXJhbXMsXG4gICAgICAgICAgICBkYXRhVHlwZTogXCJqc29uXCIsXG4gICAgICAgIH0pO1xuICAgICAgICB2YXIgdW5pdmVyc2UgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlO1xuICAgICAgICB2YXIgc2NhbiA9IGVnZ2Vycy5yZXNwb25zZUpTT04uc2Nhbm5pbmdfZGF0YTtcbiAgICAgICAgdW5pdmVyc2UuZ2FsYXh5LnN0YXJzID0gX19hc3NpZ24oX19hc3NpZ24oe30sIHNjYW4uc3RhcnMpLCB1bml2ZXJzZS5nYWxheHkuc3RhcnMpO1xuICAgICAgICBmb3IgKHZhciBzIGluIHNjYW4uc3RhcnMpIHtcbiAgICAgICAgICAgIHZhciBzdGFyID0gc2Nhbi5zdGFyc1tzXTtcbiAgICAgICAgICAgIC8vQWRkIGhlcmUgYSBzdGF0ZW1lbnQgdG8gc2tpcCBpZiBpdCBpcyBoZXJvJ3Mgc3Rhci5cbiAgICAgICAgICAgIGlmIChzdGFyLnYgIT09IFwiMFwiKSB7XG4gICAgICAgICAgICAgICAgdW5pdmVyc2UuZ2FsYXh5LnN0YXJzW3NdID0gX19hc3NpZ24oX19hc3NpZ24oe30sIHVuaXZlcnNlLmdhbGF4eS5zdGFyc1tzXSksIHN0YXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHVuaXZlcnNlLmdhbGF4eS5mbGVldHMgPSBfX2Fzc2lnbihfX2Fzc2lnbih7fSwgc2Nhbi5mbGVldHMpLCB1bml2ZXJzZS5nYWxheHkuZmxlZXRzKTtcbiAgICAgICAgTmVwdHVuZXNQcmlkZS5ucC5vbkZ1bGxVbml2ZXJzZShudWxsLCB1bml2ZXJzZS5nYWxheHkpO1xuICAgICAgICBOZXB0dW5lc1ByaWRlLm5wdWkub25IaWRlU2NyZWVuKG51bGwsIHRydWUpO1xuICAgICAgICBpbml0KCk7XG4gICAgfVxufVxuZXhwb3J0IHsgbWVyZ2VVc2VyIH07XG4iLCJpbXBvcnQgeyBtYXJrZWQgfSBmcm9tIFwibWFya2VkXCI7XG5leHBvcnQgZnVuY3Rpb24gbWFya2Rvd24obWFya2Rvd25TdHJpbmcpIHtcbiAgICByZXR1cm4gbWFya2VkLnBhcnNlKG1hcmtkb3duU3RyaW5nKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBpc192YWxpZF9pbWFnZV91cmwoc3RyKSB7XG4gICAgdmFyIHByb3RvY29sID0gXCJeKGh0dHBzOlxcXFwvXFxcXC8pXCI7XG4gICAgdmFyIGRvbWFpbnMgPSBcIihpXFxcXC5pYmJcXFxcLmNvfGlcXFxcLmltZ3VyXFxcXC5jb218Y2RuXFxcXC5kaXNjb3JkYXBwXFxcXC5jb20pXCI7XG4gICAgdmFyIGNvbnRlbnQgPSBcIihbJiNfPTtcXFxcLVxcXFw/XFxcXC9cXFxcd117MSwxNTB9KVwiO1xuICAgIHZhciBpbWFnZXMgPSBcIihcXFxcLikoZ2lmfGpwZT9nfHRpZmY/fHBuZ3x3ZWJwfGJtcHxHSUZ8SlBFP0d8VElGRj98UE5HfFdFQlB8Qk1QKSRcIjtcbiAgICB2YXIgcmVnZXhfc3RyaW5nID0gcHJvdG9jb2wgKyBkb21haW5zICsgY29udGVudCArIGltYWdlcztcbiAgICB2YXIgcmVnZXggPSBuZXcgUmVnRXhwKHJlZ2V4X3N0cmluZyk7XG4gICAgdmFyIHZhbGlkID0gcmVnZXgudGVzdChzdHIpO1xuICAgIHJldHVybiB2YWxpZDtcbn1cbmV4cG9ydCBmdW5jdGlvbiBpc192YWxpZF95b3V0dWJlKHN0cikge1xuICAgIHZhciBwcm90b2NvbCA9IFwiXihodHRwczovLylcIjtcbiAgICB2YXIgZG9tYWlucyA9IFwiKHlvdXR1YmUuY29tfHd3dy55b3V0dWJlLmNvbXx5b3V0dS5iZSlcIjtcbiAgICB2YXIgY29udGVudCA9IFwiKFsmI189Oy0/L3ddezEsMTUwfSlcIjtcbiAgICB2YXIgcmVnZXhfc3RyaW5nID0gcHJvdG9jb2wgKyBkb21haW5zICsgY29udGVudDtcbiAgICB2YXIgcmVnZXggPSBuZXcgUmVnRXhwKHJlZ2V4X3N0cmluZyk7XG4gICAgcmV0dXJuIHJlZ2V4LnRlc3Qoc3RyKTtcbn1cbmZ1bmN0aW9uIGdldF95b3V0dWJlX2VtYmVkKGxpbmspIHtcbiAgICByZXR1cm4gXCI8aWZyYW1lIHdpZHRoPVxcXCI1NjBcXFwiIGhlaWdodD1cXFwiMzE1XFxcIiBzcmM9XFxcImh0dHBzOi8vd3d3LnlvdXR1YmUuY29tL2VtYmVkL2VIc0RUR3dfalo4XFxcIiB0aXRsZT1cXFwiWW91VHViZSB2aWRlbyBwbGF5ZXJcXFwiIGZyYW1lYm9yZGVyPVxcXCIwXFxcIiBhbGxvdz1cXFwiYWNjZWxlcm9tZXRlcjsgYXV0b3BsYXk7IGNsaXBib2FyZC13cml0ZTsgZW5jcnlwdGVkLW1lZGlhOyBneXJvc2NvcGU7IHBpY3R1cmUtaW4tcGljdHVyZTsgd2ViLXNoYXJlXFxcIiBhbGxvd2Z1bGxzY3JlZW4+PC9pZnJhbWU+XCI7XG59XG4iLCJleHBvcnQgZnVuY3Rpb24gZ2V0X2hlcm8odW5pdmVyc2UpIHtcbiAgICByZXR1cm4gdW5pdmVyc2UucGxheWVyO1xufVxuZXhwb3J0IGRlZmF1bHQgeyBnZXRfaGVybzogZ2V0X2hlcm8gfTtcbiIsIi8qKlxuICogbWFya2VkIHY0LjIuMTIgLSBhIG1hcmtkb3duIHBhcnNlclxuICogQ29weXJpZ2h0IChjKSAyMDExLTIwMjMsIENocmlzdG9waGVyIEplZmZyZXkuIChNSVQgTGljZW5zZWQpXG4gKiBodHRwczovL2dpdGh1Yi5jb20vbWFya2VkanMvbWFya2VkXG4gKi9cblxuLyoqXG4gKiBETyBOT1QgRURJVCBUSElTIEZJTEVcbiAqIFRoZSBjb2RlIGluIHRoaXMgZmlsZSBpcyBnZW5lcmF0ZWQgZnJvbSBmaWxlcyBpbiAuL3NyYy9cbiAqL1xuXG5mdW5jdGlvbiBnZXREZWZhdWx0cygpIHtcbiAgcmV0dXJuIHtcbiAgICBhc3luYzogZmFsc2UsXG4gICAgYmFzZVVybDogbnVsbCxcbiAgICBicmVha3M6IGZhbHNlLFxuICAgIGV4dGVuc2lvbnM6IG51bGwsXG4gICAgZ2ZtOiB0cnVlLFxuICAgIGhlYWRlcklkczogdHJ1ZSxcbiAgICBoZWFkZXJQcmVmaXg6ICcnLFxuICAgIGhpZ2hsaWdodDogbnVsbCxcbiAgICBsYW5nUHJlZml4OiAnbGFuZ3VhZ2UtJyxcbiAgICBtYW5nbGU6IHRydWUsXG4gICAgcGVkYW50aWM6IGZhbHNlLFxuICAgIHJlbmRlcmVyOiBudWxsLFxuICAgIHNhbml0aXplOiBmYWxzZSxcbiAgICBzYW5pdGl6ZXI6IG51bGwsXG4gICAgc2lsZW50OiBmYWxzZSxcbiAgICBzbWFydHlwYW50czogZmFsc2UsXG4gICAgdG9rZW5pemVyOiBudWxsLFxuICAgIHdhbGtUb2tlbnM6IG51bGwsXG4gICAgeGh0bWw6IGZhbHNlXG4gIH07XG59XG5cbmxldCBkZWZhdWx0cyA9IGdldERlZmF1bHRzKCk7XG5cbmZ1bmN0aW9uIGNoYW5nZURlZmF1bHRzKG5ld0RlZmF1bHRzKSB7XG4gIGRlZmF1bHRzID0gbmV3RGVmYXVsdHM7XG59XG5cbi8qKlxuICogSGVscGVyc1xuICovXG5jb25zdCBlc2NhcGVUZXN0ID0gL1smPD5cIiddLztcbmNvbnN0IGVzY2FwZVJlcGxhY2UgPSBuZXcgUmVnRXhwKGVzY2FwZVRlc3Quc291cmNlLCAnZycpO1xuY29uc3QgZXNjYXBlVGVzdE5vRW5jb2RlID0gL1s8PlwiJ118Jig/ISgjXFxkezEsN318I1tYeF1bYS1mQS1GMC05XXsxLDZ9fFxcdyspOykvO1xuY29uc3QgZXNjYXBlUmVwbGFjZU5vRW5jb2RlID0gbmV3IFJlZ0V4cChlc2NhcGVUZXN0Tm9FbmNvZGUuc291cmNlLCAnZycpO1xuY29uc3QgZXNjYXBlUmVwbGFjZW1lbnRzID0ge1xuICAnJic6ICcmYW1wOycsXG4gICc8JzogJyZsdDsnLFxuICAnPic6ICcmZ3Q7JyxcbiAgJ1wiJzogJyZxdW90OycsXG4gIFwiJ1wiOiAnJiMzOTsnXG59O1xuY29uc3QgZ2V0RXNjYXBlUmVwbGFjZW1lbnQgPSAoY2gpID0+IGVzY2FwZVJlcGxhY2VtZW50c1tjaF07XG5mdW5jdGlvbiBlc2NhcGUoaHRtbCwgZW5jb2RlKSB7XG4gIGlmIChlbmNvZGUpIHtcbiAgICBpZiAoZXNjYXBlVGVzdC50ZXN0KGh0bWwpKSB7XG4gICAgICByZXR1cm4gaHRtbC5yZXBsYWNlKGVzY2FwZVJlcGxhY2UsIGdldEVzY2FwZVJlcGxhY2VtZW50KTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKGVzY2FwZVRlc3ROb0VuY29kZS50ZXN0KGh0bWwpKSB7XG4gICAgICByZXR1cm4gaHRtbC5yZXBsYWNlKGVzY2FwZVJlcGxhY2VOb0VuY29kZSwgZ2V0RXNjYXBlUmVwbGFjZW1lbnQpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBodG1sO1xufVxuXG5jb25zdCB1bmVzY2FwZVRlc3QgPSAvJigjKD86XFxkKyl8KD86I3hbMC05QS1GYS1mXSspfCg/OlxcdyspKTs/L2lnO1xuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSBodG1sXG4gKi9cbmZ1bmN0aW9uIHVuZXNjYXBlKGh0bWwpIHtcbiAgLy8gZXhwbGljaXRseSBtYXRjaCBkZWNpbWFsLCBoZXgsIGFuZCBuYW1lZCBIVE1MIGVudGl0aWVzXG4gIHJldHVybiBodG1sLnJlcGxhY2UodW5lc2NhcGVUZXN0LCAoXywgbikgPT4ge1xuICAgIG4gPSBuLnRvTG93ZXJDYXNlKCk7XG4gICAgaWYgKG4gPT09ICdjb2xvbicpIHJldHVybiAnOic7XG4gICAgaWYgKG4uY2hhckF0KDApID09PSAnIycpIHtcbiAgICAgIHJldHVybiBuLmNoYXJBdCgxKSA9PT0gJ3gnXG4gICAgICAgID8gU3RyaW5nLmZyb21DaGFyQ29kZShwYXJzZUludChuLnN1YnN0cmluZygyKSwgMTYpKVxuICAgICAgICA6IFN0cmluZy5mcm9tQ2hhckNvZGUoK24uc3Vic3RyaW5nKDEpKTtcbiAgICB9XG4gICAgcmV0dXJuICcnO1xuICB9KTtcbn1cblxuY29uc3QgY2FyZXQgPSAvKF58W15cXFtdKVxcXi9nO1xuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nIHwgUmVnRXhwfSByZWdleFxuICogQHBhcmFtIHtzdHJpbmd9IG9wdFxuICovXG5mdW5jdGlvbiBlZGl0KHJlZ2V4LCBvcHQpIHtcbiAgcmVnZXggPSB0eXBlb2YgcmVnZXggPT09ICdzdHJpbmcnID8gcmVnZXggOiByZWdleC5zb3VyY2U7XG4gIG9wdCA9IG9wdCB8fCAnJztcbiAgY29uc3Qgb2JqID0ge1xuICAgIHJlcGxhY2U6IChuYW1lLCB2YWwpID0+IHtcbiAgICAgIHZhbCA9IHZhbC5zb3VyY2UgfHwgdmFsO1xuICAgICAgdmFsID0gdmFsLnJlcGxhY2UoY2FyZXQsICckMScpO1xuICAgICAgcmVnZXggPSByZWdleC5yZXBsYWNlKG5hbWUsIHZhbCk7XG4gICAgICByZXR1cm4gb2JqO1xuICAgIH0sXG4gICAgZ2V0UmVnZXg6ICgpID0+IHtcbiAgICAgIHJldHVybiBuZXcgUmVnRXhwKHJlZ2V4LCBvcHQpO1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuIG9iajtcbn1cblxuY29uc3Qgbm9uV29yZEFuZENvbG9uVGVzdCA9IC9bXlxcdzpdL2c7XG5jb25zdCBvcmlnaW5JbmRlcGVuZGVudFVybCA9IC9eJHxeW2Etel1bYS16MC05Ky4tXSo6fF5bPyNdL2k7XG5cbi8qKlxuICogQHBhcmFtIHtib29sZWFufSBzYW5pdGl6ZVxuICogQHBhcmFtIHtzdHJpbmd9IGJhc2VcbiAqIEBwYXJhbSB7c3RyaW5nfSBocmVmXG4gKi9cbmZ1bmN0aW9uIGNsZWFuVXJsKHNhbml0aXplLCBiYXNlLCBocmVmKSB7XG4gIGlmIChzYW5pdGl6ZSkge1xuICAgIGxldCBwcm90O1xuICAgIHRyeSB7XG4gICAgICBwcm90ID0gZGVjb2RlVVJJQ29tcG9uZW50KHVuZXNjYXBlKGhyZWYpKVxuICAgICAgICAucmVwbGFjZShub25Xb3JkQW5kQ29sb25UZXN0LCAnJylcbiAgICAgICAgLnRvTG93ZXJDYXNlKCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGlmIChwcm90LmluZGV4T2YoJ2phdmFzY3JpcHQ6JykgPT09IDAgfHwgcHJvdC5pbmRleE9mKCd2YnNjcmlwdDonKSA9PT0gMCB8fCBwcm90LmluZGV4T2YoJ2RhdGE6JykgPT09IDApIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuICBpZiAoYmFzZSAmJiAhb3JpZ2luSW5kZXBlbmRlbnRVcmwudGVzdChocmVmKSkge1xuICAgIGhyZWYgPSByZXNvbHZlVXJsKGJhc2UsIGhyZWYpO1xuICB9XG4gIHRyeSB7XG4gICAgaHJlZiA9IGVuY29kZVVSSShocmVmKS5yZXBsYWNlKC8lMjUvZywgJyUnKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHJldHVybiBocmVmO1xufVxuXG5jb25zdCBiYXNlVXJscyA9IHt9O1xuY29uc3QganVzdERvbWFpbiA9IC9eW146XSs6XFwvKlteL10qJC87XG5jb25zdCBwcm90b2NvbCA9IC9eKFteOl0rOilbXFxzXFxTXSokLztcbmNvbnN0IGRvbWFpbiA9IC9eKFteOl0rOlxcLypbXi9dKilbXFxzXFxTXSokLztcblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30gYmFzZVxuICogQHBhcmFtIHtzdHJpbmd9IGhyZWZcbiAqL1xuZnVuY3Rpb24gcmVzb2x2ZVVybChiYXNlLCBocmVmKSB7XG4gIGlmICghYmFzZVVybHNbJyAnICsgYmFzZV0pIHtcbiAgICAvLyB3ZSBjYW4gaWdub3JlIGV2ZXJ5dGhpbmcgaW4gYmFzZSBhZnRlciB0aGUgbGFzdCBzbGFzaCBvZiBpdHMgcGF0aCBjb21wb25lbnQsXG4gICAgLy8gYnV0IHdlIG1pZ2h0IG5lZWQgdG8gYWRkIF90aGF0X1xuICAgIC8vIGh0dHBzOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzOTg2I3NlY3Rpb24tM1xuICAgIGlmIChqdXN0RG9tYWluLnRlc3QoYmFzZSkpIHtcbiAgICAgIGJhc2VVcmxzWycgJyArIGJhc2VdID0gYmFzZSArICcvJztcbiAgICB9IGVsc2Uge1xuICAgICAgYmFzZVVybHNbJyAnICsgYmFzZV0gPSBydHJpbShiYXNlLCAnLycsIHRydWUpO1xuICAgIH1cbiAgfVxuICBiYXNlID0gYmFzZVVybHNbJyAnICsgYmFzZV07XG4gIGNvbnN0IHJlbGF0aXZlQmFzZSA9IGJhc2UuaW5kZXhPZignOicpID09PSAtMTtcblxuICBpZiAoaHJlZi5zdWJzdHJpbmcoMCwgMikgPT09ICcvLycpIHtcbiAgICBpZiAocmVsYXRpdmVCYXNlKSB7XG4gICAgICByZXR1cm4gaHJlZjtcbiAgICB9XG4gICAgcmV0dXJuIGJhc2UucmVwbGFjZShwcm90b2NvbCwgJyQxJykgKyBocmVmO1xuICB9IGVsc2UgaWYgKGhyZWYuY2hhckF0KDApID09PSAnLycpIHtcbiAgICBpZiAocmVsYXRpdmVCYXNlKSB7XG4gICAgICByZXR1cm4gaHJlZjtcbiAgICB9XG4gICAgcmV0dXJuIGJhc2UucmVwbGFjZShkb21haW4sICckMScpICsgaHJlZjtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gYmFzZSArIGhyZWY7XG4gIH1cbn1cblxuY29uc3Qgbm9vcFRlc3QgPSB7IGV4ZWM6IGZ1bmN0aW9uIG5vb3BUZXN0KCkge30gfTtcblxuZnVuY3Rpb24gbWVyZ2Uob2JqKSB7XG4gIGxldCBpID0gMSxcbiAgICB0YXJnZXQsXG4gICAga2V5O1xuXG4gIGZvciAoOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgdGFyZ2V0ID0gYXJndW1lbnRzW2ldO1xuICAgIGZvciAoa2V5IGluIHRhcmdldCkge1xuICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0YXJnZXQsIGtleSkpIHtcbiAgICAgICAgb2JqW2tleV0gPSB0YXJnZXRba2V5XTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gb2JqO1xufVxuXG5mdW5jdGlvbiBzcGxpdENlbGxzKHRhYmxlUm93LCBjb3VudCkge1xuICAvLyBlbnN1cmUgdGhhdCBldmVyeSBjZWxsLWRlbGltaXRpbmcgcGlwZSBoYXMgYSBzcGFjZVxuICAvLyBiZWZvcmUgaXQgdG8gZGlzdGluZ3Vpc2ggaXQgZnJvbSBhbiBlc2NhcGVkIHBpcGVcbiAgY29uc3Qgcm93ID0gdGFibGVSb3cucmVwbGFjZSgvXFx8L2csIChtYXRjaCwgb2Zmc2V0LCBzdHIpID0+IHtcbiAgICAgIGxldCBlc2NhcGVkID0gZmFsc2UsXG4gICAgICAgIGN1cnIgPSBvZmZzZXQ7XG4gICAgICB3aGlsZSAoLS1jdXJyID49IDAgJiYgc3RyW2N1cnJdID09PSAnXFxcXCcpIGVzY2FwZWQgPSAhZXNjYXBlZDtcbiAgICAgIGlmIChlc2NhcGVkKSB7XG4gICAgICAgIC8vIG9kZCBudW1iZXIgb2Ygc2xhc2hlcyBtZWFucyB8IGlzIGVzY2FwZWRcbiAgICAgICAgLy8gc28gd2UgbGVhdmUgaXQgYWxvbmVcbiAgICAgICAgcmV0dXJuICd8JztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGFkZCBzcGFjZSBiZWZvcmUgdW5lc2NhcGVkIHxcbiAgICAgICAgcmV0dXJuICcgfCc7XG4gICAgICB9XG4gICAgfSksXG4gICAgY2VsbHMgPSByb3cuc3BsaXQoLyBcXHwvKTtcbiAgbGV0IGkgPSAwO1xuXG4gIC8vIEZpcnN0L2xhc3QgY2VsbCBpbiBhIHJvdyBjYW5ub3QgYmUgZW1wdHkgaWYgaXQgaGFzIG5vIGxlYWRpbmcvdHJhaWxpbmcgcGlwZVxuICBpZiAoIWNlbGxzWzBdLnRyaW0oKSkgeyBjZWxscy5zaGlmdCgpOyB9XG4gIGlmIChjZWxscy5sZW5ndGggPiAwICYmICFjZWxsc1tjZWxscy5sZW5ndGggLSAxXS50cmltKCkpIHsgY2VsbHMucG9wKCk7IH1cblxuICBpZiAoY2VsbHMubGVuZ3RoID4gY291bnQpIHtcbiAgICBjZWxscy5zcGxpY2UoY291bnQpO1xuICB9IGVsc2Uge1xuICAgIHdoaWxlIChjZWxscy5sZW5ndGggPCBjb3VudCkgY2VsbHMucHVzaCgnJyk7XG4gIH1cblxuICBmb3IgKDsgaSA8IGNlbGxzLmxlbmd0aDsgaSsrKSB7XG4gICAgLy8gbGVhZGluZyBvciB0cmFpbGluZyB3aGl0ZXNwYWNlIGlzIGlnbm9yZWQgcGVyIHRoZSBnZm0gc3BlY1xuICAgIGNlbGxzW2ldID0gY2VsbHNbaV0udHJpbSgpLnJlcGxhY2UoL1xcXFxcXHwvZywgJ3wnKTtcbiAgfVxuICByZXR1cm4gY2VsbHM7XG59XG5cbi8qKlxuICogUmVtb3ZlIHRyYWlsaW5nICdjJ3MuIEVxdWl2YWxlbnQgdG8gc3RyLnJlcGxhY2UoL2MqJC8sICcnKS5cbiAqIC9jKiQvIGlzIHZ1bG5lcmFibGUgdG8gUkVET1MuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHN0clxuICogQHBhcmFtIHtzdHJpbmd9IGNcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gaW52ZXJ0IFJlbW92ZSBzdWZmaXggb2Ygbm9uLWMgY2hhcnMgaW5zdGVhZC4gRGVmYXVsdCBmYWxzZXkuXG4gKi9cbmZ1bmN0aW9uIHJ0cmltKHN0ciwgYywgaW52ZXJ0KSB7XG4gIGNvbnN0IGwgPSBzdHIubGVuZ3RoO1xuICBpZiAobCA9PT0gMCkge1xuICAgIHJldHVybiAnJztcbiAgfVxuXG4gIC8vIExlbmd0aCBvZiBzdWZmaXggbWF0Y2hpbmcgdGhlIGludmVydCBjb25kaXRpb24uXG4gIGxldCBzdWZmTGVuID0gMDtcblxuICAvLyBTdGVwIGxlZnQgdW50aWwgd2UgZmFpbCB0byBtYXRjaCB0aGUgaW52ZXJ0IGNvbmRpdGlvbi5cbiAgd2hpbGUgKHN1ZmZMZW4gPCBsKSB7XG4gICAgY29uc3QgY3VyckNoYXIgPSBzdHIuY2hhckF0KGwgLSBzdWZmTGVuIC0gMSk7XG4gICAgaWYgKGN1cnJDaGFyID09PSBjICYmICFpbnZlcnQpIHtcbiAgICAgIHN1ZmZMZW4rKztcbiAgICB9IGVsc2UgaWYgKGN1cnJDaGFyICE9PSBjICYmIGludmVydCkge1xuICAgICAgc3VmZkxlbisrO1xuICAgIH0gZWxzZSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICByZXR1cm4gc3RyLnNsaWNlKDAsIGwgLSBzdWZmTGVuKTtcbn1cblxuZnVuY3Rpb24gZmluZENsb3NpbmdCcmFja2V0KHN0ciwgYikge1xuICBpZiAoc3RyLmluZGV4T2YoYlsxXSkgPT09IC0xKSB7XG4gICAgcmV0dXJuIC0xO1xuICB9XG4gIGNvbnN0IGwgPSBzdHIubGVuZ3RoO1xuICBsZXQgbGV2ZWwgPSAwLFxuICAgIGkgPSAwO1xuICBmb3IgKDsgaSA8IGw7IGkrKykge1xuICAgIGlmIChzdHJbaV0gPT09ICdcXFxcJykge1xuICAgICAgaSsrO1xuICAgIH0gZWxzZSBpZiAoc3RyW2ldID09PSBiWzBdKSB7XG4gICAgICBsZXZlbCsrO1xuICAgIH0gZWxzZSBpZiAoc3RyW2ldID09PSBiWzFdKSB7XG4gICAgICBsZXZlbC0tO1xuICAgICAgaWYgKGxldmVsIDwgMCkge1xuICAgICAgICByZXR1cm4gaTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIC0xO1xufVxuXG5mdW5jdGlvbiBjaGVja1Nhbml0aXplRGVwcmVjYXRpb24ob3B0KSB7XG4gIGlmIChvcHQgJiYgb3B0LnNhbml0aXplICYmICFvcHQuc2lsZW50KSB7XG4gICAgY29uc29sZS53YXJuKCdtYXJrZWQoKTogc2FuaXRpemUgYW5kIHNhbml0aXplciBwYXJhbWV0ZXJzIGFyZSBkZXByZWNhdGVkIHNpbmNlIHZlcnNpb24gMC43LjAsIHNob3VsZCBub3QgYmUgdXNlZCBhbmQgd2lsbCBiZSByZW1vdmVkIGluIHRoZSBmdXR1cmUuIFJlYWQgbW9yZSBoZXJlOiBodHRwczovL21hcmtlZC5qcy5vcmcvIy9VU0lOR19BRFZBTkNFRC5tZCNvcHRpb25zJyk7XG4gIH1cbn1cblxuLy8gY29waWVkIGZyb20gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9hLzU0NTAxMTMvODA2Nzc3XG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXR0ZXJuXG4gKiBAcGFyYW0ge251bWJlcn0gY291bnRcbiAqL1xuZnVuY3Rpb24gcmVwZWF0U3RyaW5nKHBhdHRlcm4sIGNvdW50KSB7XG4gIGlmIChjb3VudCA8IDEpIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cbiAgbGV0IHJlc3VsdCA9ICcnO1xuICB3aGlsZSAoY291bnQgPiAxKSB7XG4gICAgaWYgKGNvdW50ICYgMSkge1xuICAgICAgcmVzdWx0ICs9IHBhdHRlcm47XG4gICAgfVxuICAgIGNvdW50ID4+PSAxO1xuICAgIHBhdHRlcm4gKz0gcGF0dGVybjtcbiAgfVxuICByZXR1cm4gcmVzdWx0ICsgcGF0dGVybjtcbn1cblxuZnVuY3Rpb24gb3V0cHV0TGluayhjYXAsIGxpbmssIHJhdywgbGV4ZXIpIHtcbiAgY29uc3QgaHJlZiA9IGxpbmsuaHJlZjtcbiAgY29uc3QgdGl0bGUgPSBsaW5rLnRpdGxlID8gZXNjYXBlKGxpbmsudGl0bGUpIDogbnVsbDtcbiAgY29uc3QgdGV4dCA9IGNhcFsxXS5yZXBsYWNlKC9cXFxcKFtcXFtcXF1dKS9nLCAnJDEnKTtcblxuICBpZiAoY2FwWzBdLmNoYXJBdCgwKSAhPT0gJyEnKSB7XG4gICAgbGV4ZXIuc3RhdGUuaW5MaW5rID0gdHJ1ZTtcbiAgICBjb25zdCB0b2tlbiA9IHtcbiAgICAgIHR5cGU6ICdsaW5rJyxcbiAgICAgIHJhdyxcbiAgICAgIGhyZWYsXG4gICAgICB0aXRsZSxcbiAgICAgIHRleHQsXG4gICAgICB0b2tlbnM6IGxleGVyLmlubGluZVRva2Vucyh0ZXh0KVxuICAgIH07XG4gICAgbGV4ZXIuc3RhdGUuaW5MaW5rID0gZmFsc2U7XG4gICAgcmV0dXJuIHRva2VuO1xuICB9XG4gIHJldHVybiB7XG4gICAgdHlwZTogJ2ltYWdlJyxcbiAgICByYXcsXG4gICAgaHJlZixcbiAgICB0aXRsZSxcbiAgICB0ZXh0OiBlc2NhcGUodGV4dClcbiAgfTtcbn1cblxuZnVuY3Rpb24gaW5kZW50Q29kZUNvbXBlbnNhdGlvbihyYXcsIHRleHQpIHtcbiAgY29uc3QgbWF0Y2hJbmRlbnRUb0NvZGUgPSByYXcubWF0Y2goL14oXFxzKykoPzpgYGApLyk7XG5cbiAgaWYgKG1hdGNoSW5kZW50VG9Db2RlID09PSBudWxsKSB7XG4gICAgcmV0dXJuIHRleHQ7XG4gIH1cblxuICBjb25zdCBpbmRlbnRUb0NvZGUgPSBtYXRjaEluZGVudFRvQ29kZVsxXTtcblxuICByZXR1cm4gdGV4dFxuICAgIC5zcGxpdCgnXFxuJylcbiAgICAubWFwKG5vZGUgPT4ge1xuICAgICAgY29uc3QgbWF0Y2hJbmRlbnRJbk5vZGUgPSBub2RlLm1hdGNoKC9eXFxzKy8pO1xuICAgICAgaWYgKG1hdGNoSW5kZW50SW5Ob2RlID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBub2RlO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBbaW5kZW50SW5Ob2RlXSA9IG1hdGNoSW5kZW50SW5Ob2RlO1xuXG4gICAgICBpZiAoaW5kZW50SW5Ob2RlLmxlbmd0aCA+PSBpbmRlbnRUb0NvZGUubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBub2RlLnNsaWNlKGluZGVudFRvQ29kZS5sZW5ndGgpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbm9kZTtcbiAgICB9KVxuICAgIC5qb2luKCdcXG4nKTtcbn1cblxuLyoqXG4gKiBUb2tlbml6ZXJcbiAqL1xuY2xhc3MgVG9rZW5pemVyIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHwgZGVmYXVsdHM7XG4gIH1cblxuICBzcGFjZShzcmMpIHtcbiAgICBjb25zdCBjYXAgPSB0aGlzLnJ1bGVzLmJsb2NrLm5ld2xpbmUuZXhlYyhzcmMpO1xuICAgIGlmIChjYXAgJiYgY2FwWzBdLmxlbmd0aCA+IDApIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdzcGFjZScsXG4gICAgICAgIHJhdzogY2FwWzBdXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIGNvZGUoc3JjKSB7XG4gICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5ibG9jay5jb2RlLmV4ZWMoc3JjKTtcbiAgICBpZiAoY2FwKSB7XG4gICAgICBjb25zdCB0ZXh0ID0gY2FwWzBdLnJlcGxhY2UoL14gezEsNH0vZ20sICcnKTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdjb2RlJyxcbiAgICAgICAgcmF3OiBjYXBbMF0sXG4gICAgICAgIGNvZGVCbG9ja1N0eWxlOiAnaW5kZW50ZWQnLFxuICAgICAgICB0ZXh0OiAhdGhpcy5vcHRpb25zLnBlZGFudGljXG4gICAgICAgICAgPyBydHJpbSh0ZXh0LCAnXFxuJylcbiAgICAgICAgICA6IHRleHRcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgZmVuY2VzKHNyYykge1xuICAgIGNvbnN0IGNhcCA9IHRoaXMucnVsZXMuYmxvY2suZmVuY2VzLmV4ZWMoc3JjKTtcbiAgICBpZiAoY2FwKSB7XG4gICAgICBjb25zdCByYXcgPSBjYXBbMF07XG4gICAgICBjb25zdCB0ZXh0ID0gaW5kZW50Q29kZUNvbXBlbnNhdGlvbihyYXcsIGNhcFszXSB8fCAnJyk7XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdjb2RlJyxcbiAgICAgICAgcmF3LFxuICAgICAgICBsYW5nOiBjYXBbMl0gPyBjYXBbMl0udHJpbSgpLnJlcGxhY2UodGhpcy5ydWxlcy5pbmxpbmUuX2VzY2FwZXMsICckMScpIDogY2FwWzJdLFxuICAgICAgICB0ZXh0XG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIGhlYWRpbmcoc3JjKSB7XG4gICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5ibG9jay5oZWFkaW5nLmV4ZWMoc3JjKTtcbiAgICBpZiAoY2FwKSB7XG4gICAgICBsZXQgdGV4dCA9IGNhcFsyXS50cmltKCk7XG5cbiAgICAgIC8vIHJlbW92ZSB0cmFpbGluZyAjc1xuICAgICAgaWYgKC8jJC8udGVzdCh0ZXh0KSkge1xuICAgICAgICBjb25zdCB0cmltbWVkID0gcnRyaW0odGV4dCwgJyMnKTtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5wZWRhbnRpYykge1xuICAgICAgICAgIHRleHQgPSB0cmltbWVkLnRyaW0oKTtcbiAgICAgICAgfSBlbHNlIGlmICghdHJpbW1lZCB8fCAvICQvLnRlc3QodHJpbW1lZCkpIHtcbiAgICAgICAgICAvLyBDb21tb25NYXJrIHJlcXVpcmVzIHNwYWNlIGJlZm9yZSB0cmFpbGluZyAjc1xuICAgICAgICAgIHRleHQgPSB0cmltbWVkLnRyaW0oKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAnaGVhZGluZycsXG4gICAgICAgIHJhdzogY2FwWzBdLFxuICAgICAgICBkZXB0aDogY2FwWzFdLmxlbmd0aCxcbiAgICAgICAgdGV4dCxcbiAgICAgICAgdG9rZW5zOiB0aGlzLmxleGVyLmlubGluZSh0ZXh0KVxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICBocihzcmMpIHtcbiAgICBjb25zdCBjYXAgPSB0aGlzLnJ1bGVzLmJsb2NrLmhyLmV4ZWMoc3JjKTtcbiAgICBpZiAoY2FwKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAnaHInLFxuICAgICAgICByYXc6IGNhcFswXVxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICBibG9ja3F1b3RlKHNyYykge1xuICAgIGNvbnN0IGNhcCA9IHRoaXMucnVsZXMuYmxvY2suYmxvY2txdW90ZS5leGVjKHNyYyk7XG4gICAgaWYgKGNhcCkge1xuICAgICAgY29uc3QgdGV4dCA9IGNhcFswXS5yZXBsYWNlKC9eICo+WyBcXHRdPy9nbSwgJycpO1xuICAgICAgY29uc3QgdG9wID0gdGhpcy5sZXhlci5zdGF0ZS50b3A7XG4gICAgICB0aGlzLmxleGVyLnN0YXRlLnRvcCA9IHRydWU7XG4gICAgICBjb25zdCB0b2tlbnMgPSB0aGlzLmxleGVyLmJsb2NrVG9rZW5zKHRleHQpO1xuICAgICAgdGhpcy5sZXhlci5zdGF0ZS50b3AgPSB0b3A7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAnYmxvY2txdW90ZScsXG4gICAgICAgIHJhdzogY2FwWzBdLFxuICAgICAgICB0b2tlbnMsXG4gICAgICAgIHRleHRcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgbGlzdChzcmMpIHtcbiAgICBsZXQgY2FwID0gdGhpcy5ydWxlcy5ibG9jay5saXN0LmV4ZWMoc3JjKTtcbiAgICBpZiAoY2FwKSB7XG4gICAgICBsZXQgcmF3LCBpc3Rhc2ssIGlzY2hlY2tlZCwgaW5kZW50LCBpLCBibGFua0xpbmUsIGVuZHNXaXRoQmxhbmtMaW5lLFxuICAgICAgICBsaW5lLCBuZXh0TGluZSwgcmF3TGluZSwgaXRlbUNvbnRlbnRzLCBlbmRFYXJseTtcblxuICAgICAgbGV0IGJ1bGwgPSBjYXBbMV0udHJpbSgpO1xuICAgICAgY29uc3QgaXNvcmRlcmVkID0gYnVsbC5sZW5ndGggPiAxO1xuXG4gICAgICBjb25zdCBsaXN0ID0ge1xuICAgICAgICB0eXBlOiAnbGlzdCcsXG4gICAgICAgIHJhdzogJycsXG4gICAgICAgIG9yZGVyZWQ6IGlzb3JkZXJlZCxcbiAgICAgICAgc3RhcnQ6IGlzb3JkZXJlZCA/ICtidWxsLnNsaWNlKDAsIC0xKSA6ICcnLFxuICAgICAgICBsb29zZTogZmFsc2UsXG4gICAgICAgIGl0ZW1zOiBbXVxuICAgICAgfTtcblxuICAgICAgYnVsbCA9IGlzb3JkZXJlZCA/IGBcXFxcZHsxLDl9XFxcXCR7YnVsbC5zbGljZSgtMSl9YCA6IGBcXFxcJHtidWxsfWA7XG5cbiAgICAgIGlmICh0aGlzLm9wdGlvbnMucGVkYW50aWMpIHtcbiAgICAgICAgYnVsbCA9IGlzb3JkZXJlZCA/IGJ1bGwgOiAnWyorLV0nO1xuICAgICAgfVxuXG4gICAgICAvLyBHZXQgbmV4dCBsaXN0IGl0ZW1cbiAgICAgIGNvbnN0IGl0ZW1SZWdleCA9IG5ldyBSZWdFeHAoYF4oIHswLDN9JHtidWxsfSkoKD86W1xcdCBdW15cXFxcbl0qKT8oPzpcXFxcbnwkKSlgKTtcblxuICAgICAgLy8gQ2hlY2sgaWYgY3VycmVudCBidWxsZXQgcG9pbnQgY2FuIHN0YXJ0IGEgbmV3IExpc3QgSXRlbVxuICAgICAgd2hpbGUgKHNyYykge1xuICAgICAgICBlbmRFYXJseSA9IGZhbHNlO1xuICAgICAgICBpZiAoIShjYXAgPSBpdGVtUmVnZXguZXhlYyhzcmMpKSkge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMucnVsZXMuYmxvY2suaHIudGVzdChzcmMpKSB7IC8vIEVuZCBsaXN0IGlmIGJ1bGxldCB3YXMgYWN0dWFsbHkgSFIgKHBvc3NpYmx5IG1vdmUgaW50byBpdGVtUmVnZXg/KVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgcmF3ID0gY2FwWzBdO1xuICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHJhdy5sZW5ndGgpO1xuXG4gICAgICAgIGxpbmUgPSBjYXBbMl0uc3BsaXQoJ1xcbicsIDEpWzBdLnJlcGxhY2UoL15cXHQrLywgKHQpID0+ICcgJy5yZXBlYXQoMyAqIHQubGVuZ3RoKSk7XG4gICAgICAgIG5leHRMaW5lID0gc3JjLnNwbGl0KCdcXG4nLCAxKVswXTtcblxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnBlZGFudGljKSB7XG4gICAgICAgICAgaW5kZW50ID0gMjtcbiAgICAgICAgICBpdGVtQ29udGVudHMgPSBsaW5lLnRyaW1MZWZ0KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaW5kZW50ID0gY2FwWzJdLnNlYXJjaCgvW14gXS8pOyAvLyBGaW5kIGZpcnN0IG5vbi1zcGFjZSBjaGFyXG4gICAgICAgICAgaW5kZW50ID0gaW5kZW50ID4gNCA/IDEgOiBpbmRlbnQ7IC8vIFRyZWF0IGluZGVudGVkIGNvZGUgYmxvY2tzICg+IDQgc3BhY2VzKSBhcyBoYXZpbmcgb25seSAxIGluZGVudFxuICAgICAgICAgIGl0ZW1Db250ZW50cyA9IGxpbmUuc2xpY2UoaW5kZW50KTtcbiAgICAgICAgICBpbmRlbnQgKz0gY2FwWzFdLmxlbmd0aDtcbiAgICAgICAgfVxuXG4gICAgICAgIGJsYW5rTGluZSA9IGZhbHNlO1xuXG4gICAgICAgIGlmICghbGluZSAmJiAvXiAqJC8udGVzdChuZXh0TGluZSkpIHsgLy8gSXRlbXMgYmVnaW4gd2l0aCBhdCBtb3N0IG9uZSBibGFuayBsaW5lXG4gICAgICAgICAgcmF3ICs9IG5leHRMaW5lICsgJ1xcbic7XG4gICAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhuZXh0TGluZS5sZW5ndGggKyAxKTtcbiAgICAgICAgICBlbmRFYXJseSA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWVuZEVhcmx5KSB7XG4gICAgICAgICAgY29uc3QgbmV4dEJ1bGxldFJlZ2V4ID0gbmV3IFJlZ0V4cChgXiB7MCwke01hdGgubWluKDMsIGluZGVudCAtIDEpfX0oPzpbKistXXxcXFxcZHsxLDl9Wy4pXSkoKD86WyBcXHRdW15cXFxcbl0qKT8oPzpcXFxcbnwkKSlgKTtcbiAgICAgICAgICBjb25zdCBoclJlZ2V4ID0gbmV3IFJlZ0V4cChgXiB7MCwke01hdGgubWluKDMsIGluZGVudCAtIDEpfX0oKD86LSAqKXszLH18KD86XyAqKXszLH18KD86XFxcXCogKil7Myx9KSg/OlxcXFxuK3wkKWApO1xuICAgICAgICAgIGNvbnN0IGZlbmNlc0JlZ2luUmVnZXggPSBuZXcgUmVnRXhwKGBeIHswLCR7TWF0aC5taW4oMywgaW5kZW50IC0gMSl9fSg/OlxcYFxcYFxcYHx+fn4pYCk7XG4gICAgICAgICAgY29uc3QgaGVhZGluZ0JlZ2luUmVnZXggPSBuZXcgUmVnRXhwKGBeIHswLCR7TWF0aC5taW4oMywgaW5kZW50IC0gMSl9fSNgKTtcblxuICAgICAgICAgIC8vIENoZWNrIGlmIGZvbGxvd2luZyBsaW5lcyBzaG91bGQgYmUgaW5jbHVkZWQgaW4gTGlzdCBJdGVtXG4gICAgICAgICAgd2hpbGUgKHNyYykge1xuICAgICAgICAgICAgcmF3TGluZSA9IHNyYy5zcGxpdCgnXFxuJywgMSlbMF07XG4gICAgICAgICAgICBuZXh0TGluZSA9IHJhd0xpbmU7XG5cbiAgICAgICAgICAgIC8vIFJlLWFsaWduIHRvIGZvbGxvdyBjb21tb25tYXJrIG5lc3RpbmcgcnVsZXNcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMucGVkYW50aWMpIHtcbiAgICAgICAgICAgICAgbmV4dExpbmUgPSBuZXh0TGluZS5yZXBsYWNlKC9eIHsxLDR9KD89KCB7NH0pKlteIF0pL2csICcgICcpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBFbmQgbGlzdCBpdGVtIGlmIGZvdW5kIGNvZGUgZmVuY2VzXG4gICAgICAgICAgICBpZiAoZmVuY2VzQmVnaW5SZWdleC50ZXN0KG5leHRMaW5lKSkge1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gRW5kIGxpc3QgaXRlbSBpZiBmb3VuZCBzdGFydCBvZiBuZXcgaGVhZGluZ1xuICAgICAgICAgICAgaWYgKGhlYWRpbmdCZWdpblJlZ2V4LnRlc3QobmV4dExpbmUpKSB7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBFbmQgbGlzdCBpdGVtIGlmIGZvdW5kIHN0YXJ0IG9mIG5ldyBidWxsZXRcbiAgICAgICAgICAgIGlmIChuZXh0QnVsbGV0UmVnZXgudGVzdChuZXh0TGluZSkpIHtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEhvcml6b250YWwgcnVsZSBmb3VuZFxuICAgICAgICAgICAgaWYgKGhyUmVnZXgudGVzdChzcmMpKSB7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAobmV4dExpbmUuc2VhcmNoKC9bXiBdLykgPj0gaW5kZW50IHx8ICFuZXh0TGluZS50cmltKCkpIHsgLy8gRGVkZW50IGlmIHBvc3NpYmxlXG4gICAgICAgICAgICAgIGl0ZW1Db250ZW50cyArPSAnXFxuJyArIG5leHRMaW5lLnNsaWNlKGluZGVudCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBub3QgZW5vdWdoIGluZGVudGF0aW9uXG4gICAgICAgICAgICAgIGlmIChibGFua0xpbmUpIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIC8vIHBhcmFncmFwaCBjb250aW51YXRpb24gdW5sZXNzIGxhc3QgbGluZSB3YXMgYSBkaWZmZXJlbnQgYmxvY2sgbGV2ZWwgZWxlbWVudFxuICAgICAgICAgICAgICBpZiAobGluZS5zZWFyY2goL1teIF0vKSA+PSA0KSB7IC8vIGluZGVudGVkIGNvZGUgYmxvY2tcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAoZmVuY2VzQmVnaW5SZWdleC50ZXN0KGxpbmUpKSB7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWYgKGhlYWRpbmdCZWdpblJlZ2V4LnRlc3QobGluZSkpIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAoaHJSZWdleC50ZXN0KGxpbmUpKSB7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBpdGVtQ29udGVudHMgKz0gJ1xcbicgKyBuZXh0TGluZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCFibGFua0xpbmUgJiYgIW5leHRMaW5lLnRyaW0oKSkgeyAvLyBDaGVjayBpZiBjdXJyZW50IGxpbmUgaXMgYmxhbmtcbiAgICAgICAgICAgICAgYmxhbmtMaW5lID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmF3ICs9IHJhd0xpbmUgKyAnXFxuJztcbiAgICAgICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcocmF3TGluZS5sZW5ndGggKyAxKTtcbiAgICAgICAgICAgIGxpbmUgPSBuZXh0TGluZS5zbGljZShpbmRlbnQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghbGlzdC5sb29zZSkge1xuICAgICAgICAgIC8vIElmIHRoZSBwcmV2aW91cyBpdGVtIGVuZGVkIHdpdGggYSBibGFuayBsaW5lLCB0aGUgbGlzdCBpcyBsb29zZVxuICAgICAgICAgIGlmIChlbmRzV2l0aEJsYW5rTGluZSkge1xuICAgICAgICAgICAgbGlzdC5sb29zZSA9IHRydWU7XG4gICAgICAgICAgfSBlbHNlIGlmICgvXFxuICpcXG4gKiQvLnRlc3QocmF3KSkge1xuICAgICAgICAgICAgZW5kc1dpdGhCbGFua0xpbmUgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENoZWNrIGZvciB0YXNrIGxpc3QgaXRlbXNcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5nZm0pIHtcbiAgICAgICAgICBpc3Rhc2sgPSAvXlxcW1sgeFhdXFxdIC8uZXhlYyhpdGVtQ29udGVudHMpO1xuICAgICAgICAgIGlmIChpc3Rhc2spIHtcbiAgICAgICAgICAgIGlzY2hlY2tlZCA9IGlzdGFza1swXSAhPT0gJ1sgXSAnO1xuICAgICAgICAgICAgaXRlbUNvbnRlbnRzID0gaXRlbUNvbnRlbnRzLnJlcGxhY2UoL15cXFtbIHhYXVxcXSArLywgJycpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGxpc3QuaXRlbXMucHVzaCh7XG4gICAgICAgICAgdHlwZTogJ2xpc3RfaXRlbScsXG4gICAgICAgICAgcmF3LFxuICAgICAgICAgIHRhc2s6ICEhaXN0YXNrLFxuICAgICAgICAgIGNoZWNrZWQ6IGlzY2hlY2tlZCxcbiAgICAgICAgICBsb29zZTogZmFsc2UsXG4gICAgICAgICAgdGV4dDogaXRlbUNvbnRlbnRzXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxpc3QucmF3ICs9IHJhdztcbiAgICAgIH1cblxuICAgICAgLy8gRG8gbm90IGNvbnN1bWUgbmV3bGluZXMgYXQgZW5kIG9mIGZpbmFsIGl0ZW0uIEFsdGVybmF0aXZlbHksIG1ha2UgaXRlbVJlZ2V4ICpzdGFydCogd2l0aCBhbnkgbmV3bGluZXMgdG8gc2ltcGxpZnkvc3BlZWQgdXAgZW5kc1dpdGhCbGFua0xpbmUgbG9naWNcbiAgICAgIGxpc3QuaXRlbXNbbGlzdC5pdGVtcy5sZW5ndGggLSAxXS5yYXcgPSByYXcudHJpbVJpZ2h0KCk7XG4gICAgICBsaXN0Lml0ZW1zW2xpc3QuaXRlbXMubGVuZ3RoIC0gMV0udGV4dCA9IGl0ZW1Db250ZW50cy50cmltUmlnaHQoKTtcbiAgICAgIGxpc3QucmF3ID0gbGlzdC5yYXcudHJpbVJpZ2h0KCk7XG5cbiAgICAgIGNvbnN0IGwgPSBsaXN0Lml0ZW1zLmxlbmd0aDtcblxuICAgICAgLy8gSXRlbSBjaGlsZCB0b2tlbnMgaGFuZGxlZCBoZXJlIGF0IGVuZCBiZWNhdXNlIHdlIG5lZWRlZCB0byBoYXZlIHRoZSBmaW5hbCBpdGVtIHRvIHRyaW0gaXQgZmlyc3RcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgdGhpcy5sZXhlci5zdGF0ZS50b3AgPSBmYWxzZTtcbiAgICAgICAgbGlzdC5pdGVtc1tpXS50b2tlbnMgPSB0aGlzLmxleGVyLmJsb2NrVG9rZW5zKGxpc3QuaXRlbXNbaV0udGV4dCwgW10pO1xuXG4gICAgICAgIGlmICghbGlzdC5sb29zZSkge1xuICAgICAgICAgIC8vIENoZWNrIGlmIGxpc3Qgc2hvdWxkIGJlIGxvb3NlXG4gICAgICAgICAgY29uc3Qgc3BhY2VycyA9IGxpc3QuaXRlbXNbaV0udG9rZW5zLmZpbHRlcih0ID0+IHQudHlwZSA9PT0gJ3NwYWNlJyk7XG4gICAgICAgICAgY29uc3QgaGFzTXVsdGlwbGVMaW5lQnJlYWtzID0gc3BhY2Vycy5sZW5ndGggPiAwICYmIHNwYWNlcnMuc29tZSh0ID0+IC9cXG4uKlxcbi8udGVzdCh0LnJhdykpO1xuXG4gICAgICAgICAgbGlzdC5sb29zZSA9IGhhc011bHRpcGxlTGluZUJyZWFrcztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBTZXQgYWxsIGl0ZW1zIHRvIGxvb3NlIGlmIGxpc3QgaXMgbG9vc2VcbiAgICAgIGlmIChsaXN0Lmxvb3NlKSB7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICBsaXN0Lml0ZW1zW2ldLmxvb3NlID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gbGlzdDtcbiAgICB9XG4gIH1cblxuICBodG1sKHNyYykge1xuICAgIGNvbnN0IGNhcCA9IHRoaXMucnVsZXMuYmxvY2suaHRtbC5leGVjKHNyYyk7XG4gICAgaWYgKGNhcCkge1xuICAgICAgY29uc3QgdG9rZW4gPSB7XG4gICAgICAgIHR5cGU6ICdodG1sJyxcbiAgICAgICAgcmF3OiBjYXBbMF0sXG4gICAgICAgIHByZTogIXRoaXMub3B0aW9ucy5zYW5pdGl6ZXJcbiAgICAgICAgICAmJiAoY2FwWzFdID09PSAncHJlJyB8fCBjYXBbMV0gPT09ICdzY3JpcHQnIHx8IGNhcFsxXSA9PT0gJ3N0eWxlJyksXG4gICAgICAgIHRleHQ6IGNhcFswXVxuICAgICAgfTtcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuc2FuaXRpemUpIHtcbiAgICAgICAgY29uc3QgdGV4dCA9IHRoaXMub3B0aW9ucy5zYW5pdGl6ZXIgPyB0aGlzLm9wdGlvbnMuc2FuaXRpemVyKGNhcFswXSkgOiBlc2NhcGUoY2FwWzBdKTtcbiAgICAgICAgdG9rZW4udHlwZSA9ICdwYXJhZ3JhcGgnO1xuICAgICAgICB0b2tlbi50ZXh0ID0gdGV4dDtcbiAgICAgICAgdG9rZW4udG9rZW5zID0gdGhpcy5sZXhlci5pbmxpbmUodGV4dCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdG9rZW47XG4gICAgfVxuICB9XG5cbiAgZGVmKHNyYykge1xuICAgIGNvbnN0IGNhcCA9IHRoaXMucnVsZXMuYmxvY2suZGVmLmV4ZWMoc3JjKTtcbiAgICBpZiAoY2FwKSB7XG4gICAgICBjb25zdCB0YWcgPSBjYXBbMV0udG9Mb3dlckNhc2UoKS5yZXBsYWNlKC9cXHMrL2csICcgJyk7XG4gICAgICBjb25zdCBocmVmID0gY2FwWzJdID8gY2FwWzJdLnJlcGxhY2UoL148KC4qKT4kLywgJyQxJykucmVwbGFjZSh0aGlzLnJ1bGVzLmlubGluZS5fZXNjYXBlcywgJyQxJykgOiAnJztcbiAgICAgIGNvbnN0IHRpdGxlID0gY2FwWzNdID8gY2FwWzNdLnN1YnN0cmluZygxLCBjYXBbM10ubGVuZ3RoIC0gMSkucmVwbGFjZSh0aGlzLnJ1bGVzLmlubGluZS5fZXNjYXBlcywgJyQxJykgOiBjYXBbM107XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAnZGVmJyxcbiAgICAgICAgdGFnLFxuICAgICAgICByYXc6IGNhcFswXSxcbiAgICAgICAgaHJlZixcbiAgICAgICAgdGl0bGVcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgdGFibGUoc3JjKSB7XG4gICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5ibG9jay50YWJsZS5leGVjKHNyYyk7XG4gICAgaWYgKGNhcCkge1xuICAgICAgY29uc3QgaXRlbSA9IHtcbiAgICAgICAgdHlwZTogJ3RhYmxlJyxcbiAgICAgICAgaGVhZGVyOiBzcGxpdENlbGxzKGNhcFsxXSkubWFwKGMgPT4geyByZXR1cm4geyB0ZXh0OiBjIH07IH0pLFxuICAgICAgICBhbGlnbjogY2FwWzJdLnJlcGxhY2UoL14gKnxcXHwgKiQvZywgJycpLnNwbGl0KC8gKlxcfCAqLyksXG4gICAgICAgIHJvd3M6IGNhcFszXSAmJiBjYXBbM10udHJpbSgpID8gY2FwWzNdLnJlcGxhY2UoL1xcblsgXFx0XSokLywgJycpLnNwbGl0KCdcXG4nKSA6IFtdXG4gICAgICB9O1xuXG4gICAgICBpZiAoaXRlbS5oZWFkZXIubGVuZ3RoID09PSBpdGVtLmFsaWduLmxlbmd0aCkge1xuICAgICAgICBpdGVtLnJhdyA9IGNhcFswXTtcblxuICAgICAgICBsZXQgbCA9IGl0ZW0uYWxpZ24ubGVuZ3RoO1xuICAgICAgICBsZXQgaSwgaiwgaywgcm93O1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgaWYgKC9eICotKzogKiQvLnRlc3QoaXRlbS5hbGlnbltpXSkpIHtcbiAgICAgICAgICAgIGl0ZW0uYWxpZ25baV0gPSAncmlnaHQnO1xuICAgICAgICAgIH0gZWxzZSBpZiAoL14gKjotKzogKiQvLnRlc3QoaXRlbS5hbGlnbltpXSkpIHtcbiAgICAgICAgICAgIGl0ZW0uYWxpZ25baV0gPSAnY2VudGVyJztcbiAgICAgICAgICB9IGVsc2UgaWYgKC9eICo6LSsgKiQvLnRlc3QoaXRlbS5hbGlnbltpXSkpIHtcbiAgICAgICAgICAgIGl0ZW0uYWxpZ25baV0gPSAnbGVmdCc7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGl0ZW0uYWxpZ25baV0gPSBudWxsO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGwgPSBpdGVtLnJvd3MubGVuZ3RoO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgaXRlbS5yb3dzW2ldID0gc3BsaXRDZWxscyhpdGVtLnJvd3NbaV0sIGl0ZW0uaGVhZGVyLmxlbmd0aCkubWFwKGMgPT4geyByZXR1cm4geyB0ZXh0OiBjIH07IH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gcGFyc2UgY2hpbGQgdG9rZW5zIGluc2lkZSBoZWFkZXJzIGFuZCBjZWxsc1xuXG4gICAgICAgIC8vIGhlYWRlciBjaGlsZCB0b2tlbnNcbiAgICAgICAgbCA9IGl0ZW0uaGVhZGVyLmxlbmd0aDtcbiAgICAgICAgZm9yIChqID0gMDsgaiA8IGw7IGorKykge1xuICAgICAgICAgIGl0ZW0uaGVhZGVyW2pdLnRva2VucyA9IHRoaXMubGV4ZXIuaW5saW5lKGl0ZW0uaGVhZGVyW2pdLnRleHQpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gY2VsbCBjaGlsZCB0b2tlbnNcbiAgICAgICAgbCA9IGl0ZW0ucm93cy5sZW5ndGg7XG4gICAgICAgIGZvciAoaiA9IDA7IGogPCBsOyBqKyspIHtcbiAgICAgICAgICByb3cgPSBpdGVtLnJvd3Nbal07XG4gICAgICAgICAgZm9yIChrID0gMDsgayA8IHJvdy5sZW5ndGg7IGsrKykge1xuICAgICAgICAgICAgcm93W2tdLnRva2VucyA9IHRoaXMubGV4ZXIuaW5saW5lKHJvd1trXS50ZXh0KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gaXRlbTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBsaGVhZGluZyhzcmMpIHtcbiAgICBjb25zdCBjYXAgPSB0aGlzLnJ1bGVzLmJsb2NrLmxoZWFkaW5nLmV4ZWMoc3JjKTtcbiAgICBpZiAoY2FwKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAnaGVhZGluZycsXG4gICAgICAgIHJhdzogY2FwWzBdLFxuICAgICAgICBkZXB0aDogY2FwWzJdLmNoYXJBdCgwKSA9PT0gJz0nID8gMSA6IDIsXG4gICAgICAgIHRleHQ6IGNhcFsxXSxcbiAgICAgICAgdG9rZW5zOiB0aGlzLmxleGVyLmlubGluZShjYXBbMV0pXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIHBhcmFncmFwaChzcmMpIHtcbiAgICBjb25zdCBjYXAgPSB0aGlzLnJ1bGVzLmJsb2NrLnBhcmFncmFwaC5leGVjKHNyYyk7XG4gICAgaWYgKGNhcCkge1xuICAgICAgY29uc3QgdGV4dCA9IGNhcFsxXS5jaGFyQXQoY2FwWzFdLmxlbmd0aCAtIDEpID09PSAnXFxuJ1xuICAgICAgICA/IGNhcFsxXS5zbGljZSgwLCAtMSlcbiAgICAgICAgOiBjYXBbMV07XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAncGFyYWdyYXBoJyxcbiAgICAgICAgcmF3OiBjYXBbMF0sXG4gICAgICAgIHRleHQsXG4gICAgICAgIHRva2VuczogdGhpcy5sZXhlci5pbmxpbmUodGV4dClcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgdGV4dChzcmMpIHtcbiAgICBjb25zdCBjYXAgPSB0aGlzLnJ1bGVzLmJsb2NrLnRleHQuZXhlYyhzcmMpO1xuICAgIGlmIChjYXApIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgICAgcmF3OiBjYXBbMF0sXG4gICAgICAgIHRleHQ6IGNhcFswXSxcbiAgICAgICAgdG9rZW5zOiB0aGlzLmxleGVyLmlubGluZShjYXBbMF0pXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIGVzY2FwZShzcmMpIHtcbiAgICBjb25zdCBjYXAgPSB0aGlzLnJ1bGVzLmlubGluZS5lc2NhcGUuZXhlYyhzcmMpO1xuICAgIGlmIChjYXApIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdlc2NhcGUnLFxuICAgICAgICByYXc6IGNhcFswXSxcbiAgICAgICAgdGV4dDogZXNjYXBlKGNhcFsxXSlcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgdGFnKHNyYykge1xuICAgIGNvbnN0IGNhcCA9IHRoaXMucnVsZXMuaW5saW5lLnRhZy5leGVjKHNyYyk7XG4gICAgaWYgKGNhcCkge1xuICAgICAgaWYgKCF0aGlzLmxleGVyLnN0YXRlLmluTGluayAmJiAvXjxhIC9pLnRlc3QoY2FwWzBdKSkge1xuICAgICAgICB0aGlzLmxleGVyLnN0YXRlLmluTGluayA9IHRydWU7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMubGV4ZXIuc3RhdGUuaW5MaW5rICYmIC9ePFxcL2E+L2kudGVzdChjYXBbMF0pKSB7XG4gICAgICAgIHRoaXMubGV4ZXIuc3RhdGUuaW5MaW5rID0gZmFsc2U7XG4gICAgICB9XG4gICAgICBpZiAoIXRoaXMubGV4ZXIuc3RhdGUuaW5SYXdCbG9jayAmJiAvXjwocHJlfGNvZGV8a2JkfHNjcmlwdCkoXFxzfD4pL2kudGVzdChjYXBbMF0pKSB7XG4gICAgICAgIHRoaXMubGV4ZXIuc3RhdGUuaW5SYXdCbG9jayA9IHRydWU7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMubGV4ZXIuc3RhdGUuaW5SYXdCbG9jayAmJiAvXjxcXC8ocHJlfGNvZGV8a2JkfHNjcmlwdCkoXFxzfD4pL2kudGVzdChjYXBbMF0pKSB7XG4gICAgICAgIHRoaXMubGV4ZXIuc3RhdGUuaW5SYXdCbG9jayA9IGZhbHNlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiB0aGlzLm9wdGlvbnMuc2FuaXRpemVcbiAgICAgICAgICA/ICd0ZXh0J1xuICAgICAgICAgIDogJ2h0bWwnLFxuICAgICAgICByYXc6IGNhcFswXSxcbiAgICAgICAgaW5MaW5rOiB0aGlzLmxleGVyLnN0YXRlLmluTGluayxcbiAgICAgICAgaW5SYXdCbG9jazogdGhpcy5sZXhlci5zdGF0ZS5pblJhd0Jsb2NrLFxuICAgICAgICB0ZXh0OiB0aGlzLm9wdGlvbnMuc2FuaXRpemVcbiAgICAgICAgICA/ICh0aGlzLm9wdGlvbnMuc2FuaXRpemVyXG4gICAgICAgICAgICA/IHRoaXMub3B0aW9ucy5zYW5pdGl6ZXIoY2FwWzBdKVxuICAgICAgICAgICAgOiBlc2NhcGUoY2FwWzBdKSlcbiAgICAgICAgICA6IGNhcFswXVxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICBsaW5rKHNyYykge1xuICAgIGNvbnN0IGNhcCA9IHRoaXMucnVsZXMuaW5saW5lLmxpbmsuZXhlYyhzcmMpO1xuICAgIGlmIChjYXApIHtcbiAgICAgIGNvbnN0IHRyaW1tZWRVcmwgPSBjYXBbMl0udHJpbSgpO1xuICAgICAgaWYgKCF0aGlzLm9wdGlvbnMucGVkYW50aWMgJiYgL148Ly50ZXN0KHRyaW1tZWRVcmwpKSB7XG4gICAgICAgIC8vIGNvbW1vbm1hcmsgcmVxdWlyZXMgbWF0Y2hpbmcgYW5nbGUgYnJhY2tldHNcbiAgICAgICAgaWYgKCEoLz4kLy50ZXN0KHRyaW1tZWRVcmwpKSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGVuZGluZyBhbmdsZSBicmFja2V0IGNhbm5vdCBiZSBlc2NhcGVkXG4gICAgICAgIGNvbnN0IHJ0cmltU2xhc2ggPSBydHJpbSh0cmltbWVkVXJsLnNsaWNlKDAsIC0xKSwgJ1xcXFwnKTtcbiAgICAgICAgaWYgKCh0cmltbWVkVXJsLmxlbmd0aCAtIHJ0cmltU2xhc2gubGVuZ3RoKSAlIDIgPT09IDApIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGZpbmQgY2xvc2luZyBwYXJlbnRoZXNpc1xuICAgICAgICBjb25zdCBsYXN0UGFyZW5JbmRleCA9IGZpbmRDbG9zaW5nQnJhY2tldChjYXBbMl0sICcoKScpO1xuICAgICAgICBpZiAobGFzdFBhcmVuSW5kZXggPiAtMSkge1xuICAgICAgICAgIGNvbnN0IHN0YXJ0ID0gY2FwWzBdLmluZGV4T2YoJyEnKSA9PT0gMCA/IDUgOiA0O1xuICAgICAgICAgIGNvbnN0IGxpbmtMZW4gPSBzdGFydCArIGNhcFsxXS5sZW5ndGggKyBsYXN0UGFyZW5JbmRleDtcbiAgICAgICAgICBjYXBbMl0gPSBjYXBbMl0uc3Vic3RyaW5nKDAsIGxhc3RQYXJlbkluZGV4KTtcbiAgICAgICAgICBjYXBbMF0gPSBjYXBbMF0uc3Vic3RyaW5nKDAsIGxpbmtMZW4pLnRyaW0oKTtcbiAgICAgICAgICBjYXBbM10gPSAnJztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbGV0IGhyZWYgPSBjYXBbMl07XG4gICAgICBsZXQgdGl0bGUgPSAnJztcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMucGVkYW50aWMpIHtcbiAgICAgICAgLy8gc3BsaXQgcGVkYW50aWMgaHJlZiBhbmQgdGl0bGVcbiAgICAgICAgY29uc3QgbGluayA9IC9eKFteJ1wiXSpbXlxcc10pXFxzKyhbJ1wiXSkoLiopXFwyLy5leGVjKGhyZWYpO1xuXG4gICAgICAgIGlmIChsaW5rKSB7XG4gICAgICAgICAgaHJlZiA9IGxpbmtbMV07XG4gICAgICAgICAgdGl0bGUgPSBsaW5rWzNdO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aXRsZSA9IGNhcFszXSA/IGNhcFszXS5zbGljZSgxLCAtMSkgOiAnJztcbiAgICAgIH1cblxuICAgICAgaHJlZiA9IGhyZWYudHJpbSgpO1xuICAgICAgaWYgKC9ePC8udGVzdChocmVmKSkge1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnBlZGFudGljICYmICEoLz4kLy50ZXN0KHRyaW1tZWRVcmwpKSkge1xuICAgICAgICAgIC8vIHBlZGFudGljIGFsbG93cyBzdGFydGluZyBhbmdsZSBicmFja2V0IHdpdGhvdXQgZW5kaW5nIGFuZ2xlIGJyYWNrZXRcbiAgICAgICAgICBocmVmID0gaHJlZi5zbGljZSgxKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBocmVmID0gaHJlZi5zbGljZSgxLCAtMSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBvdXRwdXRMaW5rKGNhcCwge1xuICAgICAgICBocmVmOiBocmVmID8gaHJlZi5yZXBsYWNlKHRoaXMucnVsZXMuaW5saW5lLl9lc2NhcGVzLCAnJDEnKSA6IGhyZWYsXG4gICAgICAgIHRpdGxlOiB0aXRsZSA/IHRpdGxlLnJlcGxhY2UodGhpcy5ydWxlcy5pbmxpbmUuX2VzY2FwZXMsICckMScpIDogdGl0bGVcbiAgICAgIH0sIGNhcFswXSwgdGhpcy5sZXhlcik7XG4gICAgfVxuICB9XG5cbiAgcmVmbGluayhzcmMsIGxpbmtzKSB7XG4gICAgbGV0IGNhcDtcbiAgICBpZiAoKGNhcCA9IHRoaXMucnVsZXMuaW5saW5lLnJlZmxpbmsuZXhlYyhzcmMpKVxuICAgICAgICB8fCAoY2FwID0gdGhpcy5ydWxlcy5pbmxpbmUubm9saW5rLmV4ZWMoc3JjKSkpIHtcbiAgICAgIGxldCBsaW5rID0gKGNhcFsyXSB8fCBjYXBbMV0pLnJlcGxhY2UoL1xccysvZywgJyAnKTtcbiAgICAgIGxpbmsgPSBsaW5rc1tsaW5rLnRvTG93ZXJDYXNlKCldO1xuICAgICAgaWYgKCFsaW5rKSB7XG4gICAgICAgIGNvbnN0IHRleHQgPSBjYXBbMF0uY2hhckF0KDApO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgICAgICByYXc6IHRleHQsXG4gICAgICAgICAgdGV4dFxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIG91dHB1dExpbmsoY2FwLCBsaW5rLCBjYXBbMF0sIHRoaXMubGV4ZXIpO1xuICAgIH1cbiAgfVxuXG4gIGVtU3Ryb25nKHNyYywgbWFza2VkU3JjLCBwcmV2Q2hhciA9ICcnKSB7XG4gICAgbGV0IG1hdGNoID0gdGhpcy5ydWxlcy5pbmxpbmUuZW1TdHJvbmcubERlbGltLmV4ZWMoc3JjKTtcbiAgICBpZiAoIW1hdGNoKSByZXR1cm47XG5cbiAgICAvLyBfIGNhbid0IGJlIGJldHdlZW4gdHdvIGFscGhhbnVtZXJpY3MuIFxccHtMfVxccHtOfSBpbmNsdWRlcyBub24tZW5nbGlzaCBhbHBoYWJldC9udW1iZXJzIGFzIHdlbGxcbiAgICBpZiAobWF0Y2hbM10gJiYgcHJldkNoYXIubWF0Y2goL1tcXHB7TH1cXHB7Tn1dL3UpKSByZXR1cm47XG5cbiAgICBjb25zdCBuZXh0Q2hhciA9IG1hdGNoWzFdIHx8IG1hdGNoWzJdIHx8ICcnO1xuXG4gICAgaWYgKCFuZXh0Q2hhciB8fCAobmV4dENoYXIgJiYgKHByZXZDaGFyID09PSAnJyB8fCB0aGlzLnJ1bGVzLmlubGluZS5wdW5jdHVhdGlvbi5leGVjKHByZXZDaGFyKSkpKSB7XG4gICAgICBjb25zdCBsTGVuZ3RoID0gbWF0Y2hbMF0ubGVuZ3RoIC0gMTtcbiAgICAgIGxldCByRGVsaW0sIHJMZW5ndGgsIGRlbGltVG90YWwgPSBsTGVuZ3RoLCBtaWREZWxpbVRvdGFsID0gMDtcblxuICAgICAgY29uc3QgZW5kUmVnID0gbWF0Y2hbMF1bMF0gPT09ICcqJyA/IHRoaXMucnVsZXMuaW5saW5lLmVtU3Ryb25nLnJEZWxpbUFzdCA6IHRoaXMucnVsZXMuaW5saW5lLmVtU3Ryb25nLnJEZWxpbVVuZDtcbiAgICAgIGVuZFJlZy5sYXN0SW5kZXggPSAwO1xuXG4gICAgICAvLyBDbGlwIG1hc2tlZFNyYyB0byBzYW1lIHNlY3Rpb24gb2Ygc3RyaW5nIGFzIHNyYyAobW92ZSB0byBsZXhlcj8pXG4gICAgICBtYXNrZWRTcmMgPSBtYXNrZWRTcmMuc2xpY2UoLTEgKiBzcmMubGVuZ3RoICsgbExlbmd0aCk7XG5cbiAgICAgIHdoaWxlICgobWF0Y2ggPSBlbmRSZWcuZXhlYyhtYXNrZWRTcmMpKSAhPSBudWxsKSB7XG4gICAgICAgIHJEZWxpbSA9IG1hdGNoWzFdIHx8IG1hdGNoWzJdIHx8IG1hdGNoWzNdIHx8IG1hdGNoWzRdIHx8IG1hdGNoWzVdIHx8IG1hdGNoWzZdO1xuXG4gICAgICAgIGlmICghckRlbGltKSBjb250aW51ZTsgLy8gc2tpcCBzaW5nbGUgKiBpbiBfX2FiYyphYmNfX1xuXG4gICAgICAgIHJMZW5ndGggPSByRGVsaW0ubGVuZ3RoO1xuXG4gICAgICAgIGlmIChtYXRjaFszXSB8fCBtYXRjaFs0XSkgeyAvLyBmb3VuZCBhbm90aGVyIExlZnQgRGVsaW1cbiAgICAgICAgICBkZWxpbVRvdGFsICs9IHJMZW5ndGg7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH0gZWxzZSBpZiAobWF0Y2hbNV0gfHwgbWF0Y2hbNl0pIHsgLy8gZWl0aGVyIExlZnQgb3IgUmlnaHQgRGVsaW1cbiAgICAgICAgICBpZiAobExlbmd0aCAlIDMgJiYgISgobExlbmd0aCArIHJMZW5ndGgpICUgMykpIHtcbiAgICAgICAgICAgIG1pZERlbGltVG90YWwgKz0gckxlbmd0aDtcbiAgICAgICAgICAgIGNvbnRpbnVlOyAvLyBDb21tb25NYXJrIEVtcGhhc2lzIFJ1bGVzIDktMTBcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBkZWxpbVRvdGFsIC09IHJMZW5ndGg7XG5cbiAgICAgICAgaWYgKGRlbGltVG90YWwgPiAwKSBjb250aW51ZTsgLy8gSGF2ZW4ndCBmb3VuZCBlbm91Z2ggY2xvc2luZyBkZWxpbWl0ZXJzXG5cbiAgICAgICAgLy8gUmVtb3ZlIGV4dHJhIGNoYXJhY3RlcnMuICphKioqIC0+ICphKlxuICAgICAgICByTGVuZ3RoID0gTWF0aC5taW4ockxlbmd0aCwgckxlbmd0aCArIGRlbGltVG90YWwgKyBtaWREZWxpbVRvdGFsKTtcblxuICAgICAgICBjb25zdCByYXcgPSBzcmMuc2xpY2UoMCwgbExlbmd0aCArIG1hdGNoLmluZGV4ICsgKG1hdGNoWzBdLmxlbmd0aCAtIHJEZWxpbS5sZW5ndGgpICsgckxlbmd0aCk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIGBlbWAgaWYgc21hbGxlc3QgZGVsaW1pdGVyIGhhcyBvZGQgY2hhciBjb3VudC4gKmEqKipcbiAgICAgICAgaWYgKE1hdGgubWluKGxMZW5ndGgsIHJMZW5ndGgpICUgMikge1xuICAgICAgICAgIGNvbnN0IHRleHQgPSByYXcuc2xpY2UoMSwgLTEpO1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0eXBlOiAnZW0nLFxuICAgICAgICAgICAgcmF3LFxuICAgICAgICAgICAgdGV4dCxcbiAgICAgICAgICAgIHRva2VuczogdGhpcy5sZXhlci5pbmxpbmVUb2tlbnModGV4dClcbiAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ3JlYXRlICdzdHJvbmcnIGlmIHNtYWxsZXN0IGRlbGltaXRlciBoYXMgZXZlbiBjaGFyIGNvdW50LiAqKmEqKipcbiAgICAgICAgY29uc3QgdGV4dCA9IHJhdy5zbGljZSgyLCAtMik7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgdHlwZTogJ3N0cm9uZycsXG4gICAgICAgICAgcmF3LFxuICAgICAgICAgIHRleHQsXG4gICAgICAgICAgdG9rZW5zOiB0aGlzLmxleGVyLmlubGluZVRva2Vucyh0ZXh0KVxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGNvZGVzcGFuKHNyYykge1xuICAgIGNvbnN0IGNhcCA9IHRoaXMucnVsZXMuaW5saW5lLmNvZGUuZXhlYyhzcmMpO1xuICAgIGlmIChjYXApIHtcbiAgICAgIGxldCB0ZXh0ID0gY2FwWzJdLnJlcGxhY2UoL1xcbi9nLCAnICcpO1xuICAgICAgY29uc3QgaGFzTm9uU3BhY2VDaGFycyA9IC9bXiBdLy50ZXN0KHRleHQpO1xuICAgICAgY29uc3QgaGFzU3BhY2VDaGFyc09uQm90aEVuZHMgPSAvXiAvLnRlc3QodGV4dCkgJiYgLyAkLy50ZXN0KHRleHQpO1xuICAgICAgaWYgKGhhc05vblNwYWNlQ2hhcnMgJiYgaGFzU3BhY2VDaGFyc09uQm90aEVuZHMpIHtcbiAgICAgICAgdGV4dCA9IHRleHQuc3Vic3RyaW5nKDEsIHRleHQubGVuZ3RoIC0gMSk7XG4gICAgICB9XG4gICAgICB0ZXh0ID0gZXNjYXBlKHRleHQsIHRydWUpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ2NvZGVzcGFuJyxcbiAgICAgICAgcmF3OiBjYXBbMF0sXG4gICAgICAgIHRleHRcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgYnIoc3JjKSB7XG4gICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5pbmxpbmUuYnIuZXhlYyhzcmMpO1xuICAgIGlmIChjYXApIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdicicsXG4gICAgICAgIHJhdzogY2FwWzBdXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIGRlbChzcmMpIHtcbiAgICBjb25zdCBjYXAgPSB0aGlzLnJ1bGVzLmlubGluZS5kZWwuZXhlYyhzcmMpO1xuICAgIGlmIChjYXApIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdkZWwnLFxuICAgICAgICByYXc6IGNhcFswXSxcbiAgICAgICAgdGV4dDogY2FwWzJdLFxuICAgICAgICB0b2tlbnM6IHRoaXMubGV4ZXIuaW5saW5lVG9rZW5zKGNhcFsyXSlcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgYXV0b2xpbmsoc3JjLCBtYW5nbGUpIHtcbiAgICBjb25zdCBjYXAgPSB0aGlzLnJ1bGVzLmlubGluZS5hdXRvbGluay5leGVjKHNyYyk7XG4gICAgaWYgKGNhcCkge1xuICAgICAgbGV0IHRleHQsIGhyZWY7XG4gICAgICBpZiAoY2FwWzJdID09PSAnQCcpIHtcbiAgICAgICAgdGV4dCA9IGVzY2FwZSh0aGlzLm9wdGlvbnMubWFuZ2xlID8gbWFuZ2xlKGNhcFsxXSkgOiBjYXBbMV0pO1xuICAgICAgICBocmVmID0gJ21haWx0bzonICsgdGV4dDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRleHQgPSBlc2NhcGUoY2FwWzFdKTtcbiAgICAgICAgaHJlZiA9IHRleHQ7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdsaW5rJyxcbiAgICAgICAgcmF3OiBjYXBbMF0sXG4gICAgICAgIHRleHQsXG4gICAgICAgIGhyZWYsXG4gICAgICAgIHRva2VuczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgICAgICAgIHJhdzogdGV4dCxcbiAgICAgICAgICAgIHRleHRcbiAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgdXJsKHNyYywgbWFuZ2xlKSB7XG4gICAgbGV0IGNhcDtcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5pbmxpbmUudXJsLmV4ZWMoc3JjKSkge1xuICAgICAgbGV0IHRleHQsIGhyZWY7XG4gICAgICBpZiAoY2FwWzJdID09PSAnQCcpIHtcbiAgICAgICAgdGV4dCA9IGVzY2FwZSh0aGlzLm9wdGlvbnMubWFuZ2xlID8gbWFuZ2xlKGNhcFswXSkgOiBjYXBbMF0pO1xuICAgICAgICBocmVmID0gJ21haWx0bzonICsgdGV4dDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGRvIGV4dGVuZGVkIGF1dG9saW5rIHBhdGggdmFsaWRhdGlvblxuICAgICAgICBsZXQgcHJldkNhcFplcm87XG4gICAgICAgIGRvIHtcbiAgICAgICAgICBwcmV2Q2FwWmVybyA9IGNhcFswXTtcbiAgICAgICAgICBjYXBbMF0gPSB0aGlzLnJ1bGVzLmlubGluZS5fYmFja3BlZGFsLmV4ZWMoY2FwWzBdKVswXTtcbiAgICAgICAgfSB3aGlsZSAocHJldkNhcFplcm8gIT09IGNhcFswXSk7XG4gICAgICAgIHRleHQgPSBlc2NhcGUoY2FwWzBdKTtcbiAgICAgICAgaWYgKGNhcFsxXSA9PT0gJ3d3dy4nKSB7XG4gICAgICAgICAgaHJlZiA9ICdodHRwOi8vJyArIGNhcFswXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBocmVmID0gY2FwWzBdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAnbGluaycsXG4gICAgICAgIHJhdzogY2FwWzBdLFxuICAgICAgICB0ZXh0LFxuICAgICAgICBocmVmLFxuICAgICAgICB0b2tlbnM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICB0eXBlOiAndGV4dCcsXG4gICAgICAgICAgICByYXc6IHRleHQsXG4gICAgICAgICAgICB0ZXh0XG4gICAgICAgICAgfVxuICAgICAgICBdXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIGlubGluZVRleHQoc3JjLCBzbWFydHlwYW50cykge1xuICAgIGNvbnN0IGNhcCA9IHRoaXMucnVsZXMuaW5saW5lLnRleHQuZXhlYyhzcmMpO1xuICAgIGlmIChjYXApIHtcbiAgICAgIGxldCB0ZXh0O1xuICAgICAgaWYgKHRoaXMubGV4ZXIuc3RhdGUuaW5SYXdCbG9jaykge1xuICAgICAgICB0ZXh0ID0gdGhpcy5vcHRpb25zLnNhbml0aXplID8gKHRoaXMub3B0aW9ucy5zYW5pdGl6ZXIgPyB0aGlzLm9wdGlvbnMuc2FuaXRpemVyKGNhcFswXSkgOiBlc2NhcGUoY2FwWzBdKSkgOiBjYXBbMF07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0ZXh0ID0gZXNjYXBlKHRoaXMub3B0aW9ucy5zbWFydHlwYW50cyA/IHNtYXJ0eXBhbnRzKGNhcFswXSkgOiBjYXBbMF0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ3RleHQnLFxuICAgICAgICByYXc6IGNhcFswXSxcbiAgICAgICAgdGV4dFxuICAgICAgfTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBCbG9jay1MZXZlbCBHcmFtbWFyXG4gKi9cbmNvbnN0IGJsb2NrID0ge1xuICBuZXdsaW5lOiAvXig/OiAqKD86XFxufCQpKSsvLFxuICBjb2RlOiAvXiggezR9W15cXG5dKyg/Olxcbig/OiAqKD86XFxufCQpKSopPykrLyxcbiAgZmVuY2VzOiAvXiB7MCwzfShgezMsfSg/PVteYFxcbl0qXFxuKXx+ezMsfSkoW15cXG5dKilcXG4oPzp8KFtcXHNcXFNdKj8pXFxuKSg/OiB7MCwzfVxcMVt+YF0qICooPz1cXG58JCl8JCkvLFxuICBocjogL14gezAsM30oKD86LVtcXHQgXSopezMsfXwoPzpfWyBcXHRdKil7Myx9fCg/OlxcKlsgXFx0XSopezMsfSkoPzpcXG4rfCQpLyxcbiAgaGVhZGluZzogL14gezAsM30oI3sxLDZ9KSg/PVxcc3wkKSguKikoPzpcXG4rfCQpLyxcbiAgYmxvY2txdW90ZTogL14oIHswLDN9PiA/KHBhcmFncmFwaHxbXlxcbl0qKSg/OlxcbnwkKSkrLyxcbiAgbGlzdDogL14oIHswLDN9YnVsbCkoWyBcXHRdW15cXG5dKz8pPyg/OlxcbnwkKS8sXG4gIGh0bWw6ICdeIHswLDN9KD86JyAvLyBvcHRpb25hbCBpbmRlbnRhdGlvblxuICAgICsgJzwoc2NyaXB0fHByZXxzdHlsZXx0ZXh0YXJlYSlbXFxcXHM+XVtcXFxcc1xcXFxTXSo/KD86PC9cXFxcMT5bXlxcXFxuXSpcXFxcbit8JCknIC8vICgxKVxuICAgICsgJ3xjb21tZW50W15cXFxcbl0qKFxcXFxuK3wkKScgLy8gKDIpXG4gICAgKyAnfDxcXFxcP1tcXFxcc1xcXFxTXSo/KD86XFxcXD8+XFxcXG4qfCQpJyAvLyAoMylcbiAgICArICd8PCFbQS1aXVtcXFxcc1xcXFxTXSo/KD86PlxcXFxuKnwkKScgLy8gKDQpXG4gICAgKyAnfDwhXFxcXFtDREFUQVxcXFxbW1xcXFxzXFxcXFNdKj8oPzpcXFxcXVxcXFxdPlxcXFxuKnwkKScgLy8gKDUpXG4gICAgKyAnfDwvPyh0YWcpKD86ICt8XFxcXG58Lz8+KVtcXFxcc1xcXFxTXSo/KD86KD86XFxcXG4gKikrXFxcXG58JCknIC8vICg2KVxuICAgICsgJ3w8KD8hc2NyaXB0fHByZXxzdHlsZXx0ZXh0YXJlYSkoW2Etel1bXFxcXHctXSopKD86YXR0cmlidXRlKSo/ICovPz4oPz1bIFxcXFx0XSooPzpcXFxcbnwkKSlbXFxcXHNcXFxcU10qPyg/Oig/OlxcXFxuICopK1xcXFxufCQpJyAvLyAoNykgb3BlbiB0YWdcbiAgICArICd8PC8oPyFzY3JpcHR8cHJlfHN0eWxlfHRleHRhcmVhKVthLXpdW1xcXFx3LV0qXFxcXHMqPig/PVsgXFxcXHRdKig/OlxcXFxufCQpKVtcXFxcc1xcXFxTXSo/KD86KD86XFxcXG4gKikrXFxcXG58JCknIC8vICg3KSBjbG9zaW5nIHRhZ1xuICAgICsgJyknLFxuICBkZWY6IC9eIHswLDN9XFxbKGxhYmVsKVxcXTogKig/OlxcbiAqKT8oW148XFxzXVteXFxzXSp8PC4qPz4pKD86KD86ICsoPzpcXG4gKik/fCAqXFxuICopKHRpdGxlKSk/ICooPzpcXG4rfCQpLyxcbiAgdGFibGU6IG5vb3BUZXN0LFxuICBsaGVhZGluZzogL14oKD86LnxcXG4oPyFcXG4pKSs/KVxcbiB7MCwzfSg9K3wtKykgKig/Olxcbit8JCkvLFxuICAvLyByZWdleCB0ZW1wbGF0ZSwgcGxhY2Vob2xkZXJzIHdpbGwgYmUgcmVwbGFjZWQgYWNjb3JkaW5nIHRvIGRpZmZlcmVudCBwYXJhZ3JhcGhcbiAgLy8gaW50ZXJydXB0aW9uIHJ1bGVzIG9mIGNvbW1vbm1hcmsgYW5kIHRoZSBvcmlnaW5hbCBtYXJrZG93biBzcGVjOlxuICBfcGFyYWdyYXBoOiAvXihbXlxcbl0rKD86XFxuKD8haHJ8aGVhZGluZ3xsaGVhZGluZ3xibG9ja3F1b3RlfGZlbmNlc3xsaXN0fGh0bWx8dGFibGV8ICtcXG4pW15cXG5dKykqKS8sXG4gIHRleHQ6IC9eW15cXG5dKy9cbn07XG5cbmJsb2NrLl9sYWJlbCA9IC8oPyFcXHMqXFxdKSg/OlxcXFwufFteXFxbXFxdXFxcXF0pKy87XG5ibG9jay5fdGl0bGUgPSAvKD86XCIoPzpcXFxcXCI/fFteXCJcXFxcXSkqXCJ8J1teJ1xcbl0qKD86XFxuW14nXFxuXSspKlxcbj8nfFxcKFteKCldKlxcKSkvO1xuYmxvY2suZGVmID0gZWRpdChibG9jay5kZWYpXG4gIC5yZXBsYWNlKCdsYWJlbCcsIGJsb2NrLl9sYWJlbClcbiAgLnJlcGxhY2UoJ3RpdGxlJywgYmxvY2suX3RpdGxlKVxuICAuZ2V0UmVnZXgoKTtcblxuYmxvY2suYnVsbGV0ID0gLyg/OlsqKy1dfFxcZHsxLDl9Wy4pXSkvO1xuYmxvY2subGlzdEl0ZW1TdGFydCA9IGVkaXQoL14oICopKGJ1bGwpICovKVxuICAucmVwbGFjZSgnYnVsbCcsIGJsb2NrLmJ1bGxldClcbiAgLmdldFJlZ2V4KCk7XG5cbmJsb2NrLmxpc3QgPSBlZGl0KGJsb2NrLmxpc3QpXG4gIC5yZXBsYWNlKC9idWxsL2csIGJsb2NrLmJ1bGxldClcbiAgLnJlcGxhY2UoJ2hyJywgJ1xcXFxuKyg/PVxcXFwxPyg/Oig/Oi0gKil7Myx9fCg/Ol8gKil7Myx9fCg/OlxcXFwqICopezMsfSkoPzpcXFxcbit8JCkpJylcbiAgLnJlcGxhY2UoJ2RlZicsICdcXFxcbisoPz0nICsgYmxvY2suZGVmLnNvdXJjZSArICcpJylcbiAgLmdldFJlZ2V4KCk7XG5cbmJsb2NrLl90YWcgPSAnYWRkcmVzc3xhcnRpY2xlfGFzaWRlfGJhc2V8YmFzZWZvbnR8YmxvY2txdW90ZXxib2R5fGNhcHRpb24nXG4gICsgJ3xjZW50ZXJ8Y29sfGNvbGdyb3VwfGRkfGRldGFpbHN8ZGlhbG9nfGRpcnxkaXZ8ZGx8ZHR8ZmllbGRzZXR8ZmlnY2FwdGlvbidcbiAgKyAnfGZpZ3VyZXxmb290ZXJ8Zm9ybXxmcmFtZXxmcmFtZXNldHxoWzEtNl18aGVhZHxoZWFkZXJ8aHJ8aHRtbHxpZnJhbWUnXG4gICsgJ3xsZWdlbmR8bGl8bGlua3xtYWlufG1lbnV8bWVudWl0ZW18bWV0YXxuYXZ8bm9mcmFtZXN8b2x8b3B0Z3JvdXB8b3B0aW9uJ1xuICArICd8cHxwYXJhbXxzZWN0aW9ufHNvdXJjZXxzdW1tYXJ5fHRhYmxlfHRib2R5fHRkfHRmb290fHRofHRoZWFkfHRpdGxlfHRyJ1xuICArICd8dHJhY2t8dWwnO1xuYmxvY2suX2NvbW1lbnQgPSAvPCEtLSg/IS0/PilbXFxzXFxTXSo/KD86LS0+fCQpLztcbmJsb2NrLmh0bWwgPSBlZGl0KGJsb2NrLmh0bWwsICdpJylcbiAgLnJlcGxhY2UoJ2NvbW1lbnQnLCBibG9jay5fY29tbWVudClcbiAgLnJlcGxhY2UoJ3RhZycsIGJsb2NrLl90YWcpXG4gIC5yZXBsYWNlKCdhdHRyaWJ1dGUnLCAvICtbYS16QS1aOl9dW1xcdy46LV0qKD86ICo9ICpcIlteXCJcXG5dKlwifCAqPSAqJ1teJ1xcbl0qJ3wgKj0gKlteXFxzXCInPTw+YF0rKT8vKVxuICAuZ2V0UmVnZXgoKTtcblxuYmxvY2sucGFyYWdyYXBoID0gZWRpdChibG9jay5fcGFyYWdyYXBoKVxuICAucmVwbGFjZSgnaHInLCBibG9jay5ocilcbiAgLnJlcGxhY2UoJ2hlYWRpbmcnLCAnIHswLDN9I3sxLDZ9ICcpXG4gIC5yZXBsYWNlKCd8bGhlYWRpbmcnLCAnJykgLy8gc2V0ZXggaGVhZGluZ3MgZG9uJ3QgaW50ZXJydXB0IGNvbW1vbm1hcmsgcGFyYWdyYXBoc1xuICAucmVwbGFjZSgnfHRhYmxlJywgJycpXG4gIC5yZXBsYWNlKCdibG9ja3F1b3RlJywgJyB7MCwzfT4nKVxuICAucmVwbGFjZSgnZmVuY2VzJywgJyB7MCwzfSg/OmB7Myx9KD89W15gXFxcXG5dKlxcXFxuKXx+ezMsfSlbXlxcXFxuXSpcXFxcbicpXG4gIC5yZXBsYWNlKCdsaXN0JywgJyB7MCwzfSg/OlsqKy1dfDFbLildKSAnKSAvLyBvbmx5IGxpc3RzIHN0YXJ0aW5nIGZyb20gMSBjYW4gaW50ZXJydXB0XG4gIC5yZXBsYWNlKCdodG1sJywgJzwvPyg/OnRhZykoPzogK3xcXFxcbnwvPz4pfDwoPzpzY3JpcHR8cHJlfHN0eWxlfHRleHRhcmVhfCEtLSknKVxuICAucmVwbGFjZSgndGFnJywgYmxvY2suX3RhZykgLy8gcGFycyBjYW4gYmUgaW50ZXJydXB0ZWQgYnkgdHlwZSAoNikgaHRtbCBibG9ja3NcbiAgLmdldFJlZ2V4KCk7XG5cbmJsb2NrLmJsb2NrcXVvdGUgPSBlZGl0KGJsb2NrLmJsb2NrcXVvdGUpXG4gIC5yZXBsYWNlKCdwYXJhZ3JhcGgnLCBibG9jay5wYXJhZ3JhcGgpXG4gIC5nZXRSZWdleCgpO1xuXG4vKipcbiAqIE5vcm1hbCBCbG9jayBHcmFtbWFyXG4gKi9cblxuYmxvY2subm9ybWFsID0gbWVyZ2Uoe30sIGJsb2NrKTtcblxuLyoqXG4gKiBHRk0gQmxvY2sgR3JhbW1hclxuICovXG5cbmJsb2NrLmdmbSA9IG1lcmdlKHt9LCBibG9jay5ub3JtYWwsIHtcbiAgdGFibGU6ICdeICooW15cXFxcbiBdLipcXFxcfC4qKVxcXFxuJyAvLyBIZWFkZXJcbiAgICArICcgezAsM30oPzpcXFxcfCAqKT8oOj8tKzo/ICooPzpcXFxcfCAqOj8tKzo/ICopKikoPzpcXFxcfCAqKT8nIC8vIEFsaWduXG4gICAgKyAnKD86XFxcXG4oKD86KD8hICpcXFxcbnxocnxoZWFkaW5nfGJsb2NrcXVvdGV8Y29kZXxmZW5jZXN8bGlzdHxodG1sKS4qKD86XFxcXG58JCkpKilcXFxcbip8JCknIC8vIENlbGxzXG59KTtcblxuYmxvY2suZ2ZtLnRhYmxlID0gZWRpdChibG9jay5nZm0udGFibGUpXG4gIC5yZXBsYWNlKCdocicsIGJsb2NrLmhyKVxuICAucmVwbGFjZSgnaGVhZGluZycsICcgezAsM30jezEsNn0gJylcbiAgLnJlcGxhY2UoJ2Jsb2NrcXVvdGUnLCAnIHswLDN9PicpXG4gIC5yZXBsYWNlKCdjb2RlJywgJyB7NH1bXlxcXFxuXScpXG4gIC5yZXBsYWNlKCdmZW5jZXMnLCAnIHswLDN9KD86YHszLH0oPz1bXmBcXFxcbl0qXFxcXG4pfH57Myx9KVteXFxcXG5dKlxcXFxuJylcbiAgLnJlcGxhY2UoJ2xpc3QnLCAnIHswLDN9KD86WyorLV18MVsuKV0pICcpIC8vIG9ubHkgbGlzdHMgc3RhcnRpbmcgZnJvbSAxIGNhbiBpbnRlcnJ1cHRcbiAgLnJlcGxhY2UoJ2h0bWwnLCAnPC8/KD86dGFnKSg/OiArfFxcXFxufC8/Pil8PCg/OnNjcmlwdHxwcmV8c3R5bGV8dGV4dGFyZWF8IS0tKScpXG4gIC5yZXBsYWNlKCd0YWcnLCBibG9jay5fdGFnKSAvLyB0YWJsZXMgY2FuIGJlIGludGVycnVwdGVkIGJ5IHR5cGUgKDYpIGh0bWwgYmxvY2tzXG4gIC5nZXRSZWdleCgpO1xuXG5ibG9jay5nZm0ucGFyYWdyYXBoID0gZWRpdChibG9jay5fcGFyYWdyYXBoKVxuICAucmVwbGFjZSgnaHInLCBibG9jay5ocilcbiAgLnJlcGxhY2UoJ2hlYWRpbmcnLCAnIHswLDN9I3sxLDZ9ICcpXG4gIC5yZXBsYWNlKCd8bGhlYWRpbmcnLCAnJykgLy8gc2V0ZXggaGVhZGluZ3MgZG9uJ3QgaW50ZXJydXB0IGNvbW1vbm1hcmsgcGFyYWdyYXBoc1xuICAucmVwbGFjZSgndGFibGUnLCBibG9jay5nZm0udGFibGUpIC8vIGludGVycnVwdCBwYXJhZ3JhcGhzIHdpdGggdGFibGVcbiAgLnJlcGxhY2UoJ2Jsb2NrcXVvdGUnLCAnIHswLDN9PicpXG4gIC5yZXBsYWNlKCdmZW5jZXMnLCAnIHswLDN9KD86YHszLH0oPz1bXmBcXFxcbl0qXFxcXG4pfH57Myx9KVteXFxcXG5dKlxcXFxuJylcbiAgLnJlcGxhY2UoJ2xpc3QnLCAnIHswLDN9KD86WyorLV18MVsuKV0pICcpIC8vIG9ubHkgbGlzdHMgc3RhcnRpbmcgZnJvbSAxIGNhbiBpbnRlcnJ1cHRcbiAgLnJlcGxhY2UoJ2h0bWwnLCAnPC8/KD86dGFnKSg/OiArfFxcXFxufC8/Pil8PCg/OnNjcmlwdHxwcmV8c3R5bGV8dGV4dGFyZWF8IS0tKScpXG4gIC5yZXBsYWNlKCd0YWcnLCBibG9jay5fdGFnKSAvLyBwYXJzIGNhbiBiZSBpbnRlcnJ1cHRlZCBieSB0eXBlICg2KSBodG1sIGJsb2Nrc1xuICAuZ2V0UmVnZXgoKTtcbi8qKlxuICogUGVkYW50aWMgZ3JhbW1hciAob3JpZ2luYWwgSm9obiBHcnViZXIncyBsb29zZSBtYXJrZG93biBzcGVjaWZpY2F0aW9uKVxuICovXG5cbmJsb2NrLnBlZGFudGljID0gbWVyZ2Uoe30sIGJsb2NrLm5vcm1hbCwge1xuICBodG1sOiBlZGl0KFxuICAgICdeICooPzpjb21tZW50ICooPzpcXFxcbnxcXFxccyokKSdcbiAgICArICd8PCh0YWcpW1xcXFxzXFxcXFNdKz88L1xcXFwxPiAqKD86XFxcXG57Mix9fFxcXFxzKiQpJyAvLyBjbG9zZWQgdGFnXG4gICAgKyAnfDx0YWcoPzpcIlteXCJdKlwifFxcJ1teXFwnXSpcXCd8XFxcXHNbXlxcJ1wiLz5cXFxcc10qKSo/Lz8+ICooPzpcXFxcbnsyLH18XFxcXHMqJCkpJylcbiAgICAucmVwbGFjZSgnY29tbWVudCcsIGJsb2NrLl9jb21tZW50KVxuICAgIC5yZXBsYWNlKC90YWcvZywgJyg/ISg/OidcbiAgICAgICsgJ2F8ZW18c3Ryb25nfHNtYWxsfHN8Y2l0ZXxxfGRmbnxhYmJyfGRhdGF8dGltZXxjb2RlfHZhcnxzYW1wfGtiZHxzdWInXG4gICAgICArICd8c3VwfGl8Ynx1fG1hcmt8cnVieXxydHxycHxiZGl8YmRvfHNwYW58YnJ8d2JyfGluc3xkZWx8aW1nKSdcbiAgICAgICsgJ1xcXFxiKVxcXFx3Kyg/ITp8W15cXFxcd1xcXFxzQF0qQClcXFxcYicpXG4gICAgLmdldFJlZ2V4KCksXG4gIGRlZjogL14gKlxcWyhbXlxcXV0rKVxcXTogKjw/KFteXFxzPl0rKT4/KD86ICsoW1wiKF1bXlxcbl0rW1wiKV0pKT8gKig/Olxcbit8JCkvLFxuICBoZWFkaW5nOiAvXigjezEsNn0pKC4qKSg/Olxcbit8JCkvLFxuICBmZW5jZXM6IG5vb3BUZXN0LCAvLyBmZW5jZXMgbm90IHN1cHBvcnRlZFxuICBsaGVhZGluZzogL14oLis/KVxcbiB7MCwzfSg9K3wtKykgKig/Olxcbit8JCkvLFxuICBwYXJhZ3JhcGg6IGVkaXQoYmxvY2subm9ybWFsLl9wYXJhZ3JhcGgpXG4gICAgLnJlcGxhY2UoJ2hyJywgYmxvY2suaHIpXG4gICAgLnJlcGxhY2UoJ2hlYWRpbmcnLCAnICojezEsNn0gKlteXFxuXScpXG4gICAgLnJlcGxhY2UoJ2xoZWFkaW5nJywgYmxvY2subGhlYWRpbmcpXG4gICAgLnJlcGxhY2UoJ2Jsb2NrcXVvdGUnLCAnIHswLDN9PicpXG4gICAgLnJlcGxhY2UoJ3xmZW5jZXMnLCAnJylcbiAgICAucmVwbGFjZSgnfGxpc3QnLCAnJylcbiAgICAucmVwbGFjZSgnfGh0bWwnLCAnJylcbiAgICAuZ2V0UmVnZXgoKVxufSk7XG5cbi8qKlxuICogSW5saW5lLUxldmVsIEdyYW1tYXJcbiAqL1xuY29uc3QgaW5saW5lID0ge1xuICBlc2NhcGU6IC9eXFxcXChbIVwiIyQlJicoKSorLFxcLS4vOjs8PT4/QFxcW1xcXVxcXFxeX2B7fH1+XSkvLFxuICBhdXRvbGluazogL148KHNjaGVtZTpbXlxcc1xceDAwLVxceDFmPD5dKnxlbWFpbCk+LyxcbiAgdXJsOiBub29wVGVzdCxcbiAgdGFnOiAnXmNvbW1lbnQnXG4gICAgKyAnfF48L1thLXpBLVpdW1xcXFx3Oi1dKlxcXFxzKj4nIC8vIHNlbGYtY2xvc2luZyB0YWdcbiAgICArICd8XjxbYS16QS1aXVtcXFxcdy1dKig/OmF0dHJpYnV0ZSkqP1xcXFxzKi8/PicgLy8gb3BlbiB0YWdcbiAgICArICd8XjxcXFxcP1tcXFxcc1xcXFxTXSo/XFxcXD8+JyAvLyBwcm9jZXNzaW5nIGluc3RydWN0aW9uLCBlLmcuIDw/cGhwID8+XG4gICAgKyAnfF48IVthLXpBLVpdK1xcXFxzW1xcXFxzXFxcXFNdKj8+JyAvLyBkZWNsYXJhdGlvbiwgZS5nLiA8IURPQ1RZUEUgaHRtbD5cbiAgICArICd8XjwhXFxcXFtDREFUQVxcXFxbW1xcXFxzXFxcXFNdKj9cXFxcXVxcXFxdPicsIC8vIENEQVRBIHNlY3Rpb25cbiAgbGluazogL14hP1xcWyhsYWJlbClcXF1cXChcXHMqKGhyZWYpKD86XFxzKyh0aXRsZSkpP1xccypcXCkvLFxuICByZWZsaW5rOiAvXiE/XFxbKGxhYmVsKVxcXVxcWyhyZWYpXFxdLyxcbiAgbm9saW5rOiAvXiE/XFxbKHJlZilcXF0oPzpcXFtcXF0pPy8sXG4gIHJlZmxpbmtTZWFyY2g6ICdyZWZsaW5rfG5vbGluayg/IVxcXFwoKScsXG4gIGVtU3Ryb25nOiB7XG4gICAgbERlbGltOiAvXig/OlxcKisoPzooW3B1bmN0X10pfFteXFxzKl0pKXxeXysoPzooW3B1bmN0Kl0pfChbXlxcc19dKSkvLFxuICAgIC8vICAgICAgICAoMSkgYW5kICgyKSBjYW4gb25seSBiZSBhIFJpZ2h0IERlbGltaXRlci4gKDMpIGFuZCAoNCkgY2FuIG9ubHkgYmUgTGVmdC4gICg1KSBhbmQgKDYpIGNhbiBiZSBlaXRoZXIgTGVmdCBvciBSaWdodC5cbiAgICAvLyAgICAgICAgICAoKSBTa2lwIG9ycGhhbiBpbnNpZGUgc3Ryb25nICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoKSBDb25zdW1lIHRvIGRlbGltICAgICAoMSkgIyoqKiAgICAgICAgICAgICAgICAoMikgYSoqKiMsIGEqKiogICAgICAgICAgICAgICAgICAgICAgICAgICAgICgzKSAjKioqYSwgKioqYSAgICAgICAgICAgICAgICAgKDQpICoqKiMgICAgICAgICAgICAgICg1KSAjKioqIyAgICAgICAgICAgICAgICAgKDYpIGEqKiphXG4gICAgckRlbGltQXN0OiAvXig/OlteXypcXFxcXXxcXFxcLikqP1xcX1xcXyg/OlteXypcXFxcXXxcXFxcLikqP1xcKig/OlteXypcXFxcXXxcXFxcLikqPyg/PVxcX1xcXyl8KD86W14qXFxcXF18XFxcXC4pKyg/PVteKl0pfFtwdW5jdF9dKFxcKispKD89W1xcc118JCl8KD86W15wdW5jdCpfXFxzXFxcXF18XFxcXC4pKFxcKispKD89W3B1bmN0X1xcc118JCl8W3B1bmN0X1xcc10oXFwqKykoPz1bXnB1bmN0Kl9cXHNdKXxbXFxzXShcXCorKSg/PVtwdW5jdF9dKXxbcHVuY3RfXShcXCorKSg/PVtwdW5jdF9dKXwoPzpbXnB1bmN0Kl9cXHNcXFxcXXxcXFxcLikoXFwqKykoPz1bXnB1bmN0Kl9cXHNdKS8sXG4gICAgckRlbGltVW5kOiAvXig/OlteXypcXFxcXXxcXFxcLikqP1xcKlxcKig/OlteXypcXFxcXXxcXFxcLikqP1xcXyg/OlteXypcXFxcXXxcXFxcLikqPyg/PVxcKlxcKil8KD86W15fXFxcXF18XFxcXC4pKyg/PVteX10pfFtwdW5jdCpdKFxcXyspKD89W1xcc118JCl8KD86W15wdW5jdCpfXFxzXFxcXF18XFxcXC4pKFxcXyspKD89W3B1bmN0Klxcc118JCl8W3B1bmN0Klxcc10oXFxfKykoPz1bXnB1bmN0Kl9cXHNdKXxbXFxzXShcXF8rKSg/PVtwdW5jdCpdKXxbcHVuY3QqXShcXF8rKSg/PVtwdW5jdCpdKS8gLy8gXi0gTm90IGFsbG93ZWQgZm9yIF9cbiAgfSxcbiAgY29kZTogL14oYCspKFteYF18W15gXVtcXHNcXFNdKj9bXmBdKVxcMSg/IWApLyxcbiAgYnI6IC9eKCB7Mix9fFxcXFwpXFxuKD8hXFxzKiQpLyxcbiAgZGVsOiBub29wVGVzdCxcbiAgdGV4dDogL14oYCt8W15gXSkoPzooPz0gezIsfVxcbil8W1xcc1xcU10qPyg/Oig/PVtcXFxcPCFcXFtgKl9dfFxcYl98JCl8W14gXSg/PSB7Mix9XFxuKSkpLyxcbiAgcHVuY3R1YXRpb246IC9eKFtcXHNwdW5jdHVhdGlvbl0pL1xufTtcblxuLy8gbGlzdCBvZiBwdW5jdHVhdGlvbiBtYXJrcyBmcm9tIENvbW1vbk1hcmsgc3BlY1xuLy8gd2l0aG91dCAqIGFuZCBfIHRvIGhhbmRsZSB0aGUgZGlmZmVyZW50IGVtcGhhc2lzIG1hcmtlcnMgKiBhbmQgX1xuaW5saW5lLl9wdW5jdHVhdGlvbiA9ICchXCIjJCUmXFwnKCkrXFxcXC0uLC86Ozw9Pj9AXFxcXFtcXFxcXWBee3x9fic7XG5pbmxpbmUucHVuY3R1YXRpb24gPSBlZGl0KGlubGluZS5wdW5jdHVhdGlvbikucmVwbGFjZSgvcHVuY3R1YXRpb24vZywgaW5saW5lLl9wdW5jdHVhdGlvbikuZ2V0UmVnZXgoKTtcblxuLy8gc2VxdWVuY2VzIGVtIHNob3VsZCBza2lwIG92ZXIgW3RpdGxlXShsaW5rKSwgYGNvZGVgLCA8aHRtbD5cbmlubGluZS5ibG9ja1NraXAgPSAvXFxbW15cXF1dKj9cXF1cXChbXlxcKV0qP1xcKXxgW15gXSo/YHw8W14+XSo/Pi9nO1xuLy8gbG9va2JlaGluZCBpcyBub3QgYXZhaWxhYmxlIG9uIFNhZmFyaSBhcyBvZiB2ZXJzaW9uIDE2XG4vLyBpbmxpbmUuZXNjYXBlZEVtU3QgPSAvKD88PSg/Ol58W15cXFxcKSg/OlxcXFxbXl0pKilcXFxcWypfXS9nO1xuaW5saW5lLmVzY2FwZWRFbVN0ID0gLyg/Ol58W15cXFxcXSkoPzpcXFxcXFxcXCkqXFxcXFsqX10vZztcblxuaW5saW5lLl9jb21tZW50ID0gZWRpdChibG9jay5fY29tbWVudCkucmVwbGFjZSgnKD86LS0+fCQpJywgJy0tPicpLmdldFJlZ2V4KCk7XG5cbmlubGluZS5lbVN0cm9uZy5sRGVsaW0gPSBlZGl0KGlubGluZS5lbVN0cm9uZy5sRGVsaW0pXG4gIC5yZXBsYWNlKC9wdW5jdC9nLCBpbmxpbmUuX3B1bmN0dWF0aW9uKVxuICAuZ2V0UmVnZXgoKTtcblxuaW5saW5lLmVtU3Ryb25nLnJEZWxpbUFzdCA9IGVkaXQoaW5saW5lLmVtU3Ryb25nLnJEZWxpbUFzdCwgJ2cnKVxuICAucmVwbGFjZSgvcHVuY3QvZywgaW5saW5lLl9wdW5jdHVhdGlvbilcbiAgLmdldFJlZ2V4KCk7XG5cbmlubGluZS5lbVN0cm9uZy5yRGVsaW1VbmQgPSBlZGl0KGlubGluZS5lbVN0cm9uZy5yRGVsaW1VbmQsICdnJylcbiAgLnJlcGxhY2UoL3B1bmN0L2csIGlubGluZS5fcHVuY3R1YXRpb24pXG4gIC5nZXRSZWdleCgpO1xuXG5pbmxpbmUuX2VzY2FwZXMgPSAvXFxcXChbIVwiIyQlJicoKSorLFxcLS4vOjs8PT4/QFxcW1xcXVxcXFxeX2B7fH1+XSkvZztcblxuaW5saW5lLl9zY2hlbWUgPSAvW2EtekEtWl1bYS16QS1aMC05Ky4tXXsxLDMxfS87XG5pbmxpbmUuX2VtYWlsID0gL1thLXpBLVowLTkuISMkJSYnKisvPT9eX2B7fH1+LV0rKEApW2EtekEtWjAtOV0oPzpbYS16QS1aMC05LV17MCw2MX1bYS16QS1aMC05XSk/KD86XFwuW2EtekEtWjAtOV0oPzpbYS16QS1aMC05LV17MCw2MX1bYS16QS1aMC05XSk/KSsoPyFbLV9dKS87XG5pbmxpbmUuYXV0b2xpbmsgPSBlZGl0KGlubGluZS5hdXRvbGluaylcbiAgLnJlcGxhY2UoJ3NjaGVtZScsIGlubGluZS5fc2NoZW1lKVxuICAucmVwbGFjZSgnZW1haWwnLCBpbmxpbmUuX2VtYWlsKVxuICAuZ2V0UmVnZXgoKTtcblxuaW5saW5lLl9hdHRyaWJ1dGUgPSAvXFxzK1thLXpBLVo6X11bXFx3LjotXSooPzpcXHMqPVxccypcIlteXCJdKlwifFxccyo9XFxzKidbXiddKid8XFxzKj1cXHMqW15cXHNcIic9PD5gXSspPy87XG5cbmlubGluZS50YWcgPSBlZGl0KGlubGluZS50YWcpXG4gIC5yZXBsYWNlKCdjb21tZW50JywgaW5saW5lLl9jb21tZW50KVxuICAucmVwbGFjZSgnYXR0cmlidXRlJywgaW5saW5lLl9hdHRyaWJ1dGUpXG4gIC5nZXRSZWdleCgpO1xuXG5pbmxpbmUuX2xhYmVsID0gLyg/OlxcWyg/OlxcXFwufFteXFxbXFxdXFxcXF0pKlxcXXxcXFxcLnxgW15gXSpgfFteXFxbXFxdXFxcXGBdKSo/LztcbmlubGluZS5faHJlZiA9IC88KD86XFxcXC58W15cXG48PlxcXFxdKSs+fFteXFxzXFx4MDAtXFx4MWZdKi87XG5pbmxpbmUuX3RpdGxlID0gL1wiKD86XFxcXFwiP3xbXlwiXFxcXF0pKlwifCcoPzpcXFxcJz98W14nXFxcXF0pKid8XFwoKD86XFxcXFxcKT98W14pXFxcXF0pKlxcKS87XG5cbmlubGluZS5saW5rID0gZWRpdChpbmxpbmUubGluaylcbiAgLnJlcGxhY2UoJ2xhYmVsJywgaW5saW5lLl9sYWJlbClcbiAgLnJlcGxhY2UoJ2hyZWYnLCBpbmxpbmUuX2hyZWYpXG4gIC5yZXBsYWNlKCd0aXRsZScsIGlubGluZS5fdGl0bGUpXG4gIC5nZXRSZWdleCgpO1xuXG5pbmxpbmUucmVmbGluayA9IGVkaXQoaW5saW5lLnJlZmxpbmspXG4gIC5yZXBsYWNlKCdsYWJlbCcsIGlubGluZS5fbGFiZWwpXG4gIC5yZXBsYWNlKCdyZWYnLCBibG9jay5fbGFiZWwpXG4gIC5nZXRSZWdleCgpO1xuXG5pbmxpbmUubm9saW5rID0gZWRpdChpbmxpbmUubm9saW5rKVxuICAucmVwbGFjZSgncmVmJywgYmxvY2suX2xhYmVsKVxuICAuZ2V0UmVnZXgoKTtcblxuaW5saW5lLnJlZmxpbmtTZWFyY2ggPSBlZGl0KGlubGluZS5yZWZsaW5rU2VhcmNoLCAnZycpXG4gIC5yZXBsYWNlKCdyZWZsaW5rJywgaW5saW5lLnJlZmxpbmspXG4gIC5yZXBsYWNlKCdub2xpbmsnLCBpbmxpbmUubm9saW5rKVxuICAuZ2V0UmVnZXgoKTtcblxuLyoqXG4gKiBOb3JtYWwgSW5saW5lIEdyYW1tYXJcbiAqL1xuXG5pbmxpbmUubm9ybWFsID0gbWVyZ2Uoe30sIGlubGluZSk7XG5cbi8qKlxuICogUGVkYW50aWMgSW5saW5lIEdyYW1tYXJcbiAqL1xuXG5pbmxpbmUucGVkYW50aWMgPSBtZXJnZSh7fSwgaW5saW5lLm5vcm1hbCwge1xuICBzdHJvbmc6IHtcbiAgICBzdGFydDogL15fX3xcXCpcXCovLFxuICAgIG1pZGRsZTogL15fXyg/PVxcUykoW1xcc1xcU10qP1xcUylfXyg/IV8pfF5cXCpcXCooPz1cXFMpKFtcXHNcXFNdKj9cXFMpXFwqXFwqKD8hXFwqKS8sXG4gICAgZW5kQXN0OiAvXFwqXFwqKD8hXFwqKS9nLFxuICAgIGVuZFVuZDogL19fKD8hXykvZ1xuICB9LFxuICBlbToge1xuICAgIHN0YXJ0OiAvXl98XFwqLyxcbiAgICBtaWRkbGU6IC9eKClcXCooPz1cXFMpKFtcXHNcXFNdKj9cXFMpXFwqKD8hXFwqKXxeXyg/PVxcUykoW1xcc1xcU10qP1xcUylfKD8hXykvLFxuICAgIGVuZEFzdDogL1xcKig/IVxcKikvZyxcbiAgICBlbmRVbmQ6IC9fKD8hXykvZ1xuICB9LFxuICBsaW5rOiBlZGl0KC9eIT9cXFsobGFiZWwpXFxdXFwoKC4qPylcXCkvKVxuICAgIC5yZXBsYWNlKCdsYWJlbCcsIGlubGluZS5fbGFiZWwpXG4gICAgLmdldFJlZ2V4KCksXG4gIHJlZmxpbms6IGVkaXQoL14hP1xcWyhsYWJlbClcXF1cXHMqXFxbKFteXFxdXSopXFxdLylcbiAgICAucmVwbGFjZSgnbGFiZWwnLCBpbmxpbmUuX2xhYmVsKVxuICAgIC5nZXRSZWdleCgpXG59KTtcblxuLyoqXG4gKiBHRk0gSW5saW5lIEdyYW1tYXJcbiAqL1xuXG5pbmxpbmUuZ2ZtID0gbWVyZ2Uoe30sIGlubGluZS5ub3JtYWwsIHtcbiAgZXNjYXBlOiBlZGl0KGlubGluZS5lc2NhcGUpLnJlcGxhY2UoJ10pJywgJ358XSknKS5nZXRSZWdleCgpLFxuICBfZXh0ZW5kZWRfZW1haWw6IC9bQS1aYS16MC05Ll8rLV0rKEApW2EtekEtWjAtOS1fXSsoPzpcXC5bYS16QS1aMC05LV9dKlthLXpBLVowLTldKSsoPyFbLV9dKS8sXG4gIHVybDogL14oKD86ZnRwfGh0dHBzPyk6XFwvXFwvfHd3d1xcLikoPzpbYS16QS1aMC05XFwtXStcXC4/KStbXlxcczxdKnxeZW1haWwvLFxuICBfYmFja3BlZGFsOiAvKD86W14/IS4sOjsqXydcIn4oKSZdK3xcXChbXildKlxcKXwmKD8hW2EtekEtWjAtOV0rOyQpfFs/IS4sOjsqXydcIn4pXSsoPyEkKSkrLyxcbiAgZGVsOiAvXih+fj8pKD89W15cXHN+XSkoW1xcc1xcU10qP1teXFxzfl0pXFwxKD89W15+XXwkKS8sXG4gIHRleHQ6IC9eKFtgfl0rfFteYH5dKSg/Oig/PSB7Mix9XFxuKXwoPz1bYS16QS1aMC05LiEjJCUmJyorXFwvPT9fYHtcXHx9fi1dK0ApfFtcXHNcXFNdKj8oPzooPz1bXFxcXDwhXFxbYCp+X118XFxiX3xodHRwcz86XFwvXFwvfGZ0cDpcXC9cXC98d3d3XFwufCQpfFteIF0oPz0gezIsfVxcbil8W15hLXpBLVowLTkuISMkJSYnKitcXC89P19ge1xcfH1+LV0oPz1bYS16QS1aMC05LiEjJCUmJyorXFwvPT9fYHtcXHx9fi1dK0ApKSkvXG59KTtcblxuaW5saW5lLmdmbS51cmwgPSBlZGl0KGlubGluZS5nZm0udXJsLCAnaScpXG4gIC5yZXBsYWNlKCdlbWFpbCcsIGlubGluZS5nZm0uX2V4dGVuZGVkX2VtYWlsKVxuICAuZ2V0UmVnZXgoKTtcbi8qKlxuICogR0ZNICsgTGluZSBCcmVha3MgSW5saW5lIEdyYW1tYXJcbiAqL1xuXG5pbmxpbmUuYnJlYWtzID0gbWVyZ2Uoe30sIGlubGluZS5nZm0sIHtcbiAgYnI6IGVkaXQoaW5saW5lLmJyKS5yZXBsYWNlKCd7Mix9JywgJyonKS5nZXRSZWdleCgpLFxuICB0ZXh0OiBlZGl0KGlubGluZS5nZm0udGV4dClcbiAgICAucmVwbGFjZSgnXFxcXGJfJywgJ1xcXFxiX3wgezIsfVxcXFxuJylcbiAgICAucmVwbGFjZSgvXFx7MixcXH0vZywgJyonKVxuICAgIC5nZXRSZWdleCgpXG59KTtcblxuLyoqXG4gKiBzbWFydHlwYW50cyB0ZXh0IHJlcGxhY2VtZW50XG4gKiBAcGFyYW0ge3N0cmluZ30gdGV4dFxuICovXG5mdW5jdGlvbiBzbWFydHlwYW50cyh0ZXh0KSB7XG4gIHJldHVybiB0ZXh0XG4gICAgLy8gZW0tZGFzaGVzXG4gICAgLnJlcGxhY2UoLy0tLS9nLCAnXFx1MjAxNCcpXG4gICAgLy8gZW4tZGFzaGVzXG4gICAgLnJlcGxhY2UoLy0tL2csICdcXHUyMDEzJylcbiAgICAvLyBvcGVuaW5nIHNpbmdsZXNcbiAgICAucmVwbGFjZSgvKF58Wy1cXHUyMDE0LyhcXFt7XCJcXHNdKScvZywgJyQxXFx1MjAxOCcpXG4gICAgLy8gY2xvc2luZyBzaW5nbGVzICYgYXBvc3Ryb3BoZXNcbiAgICAucmVwbGFjZSgvJy9nLCAnXFx1MjAxOScpXG4gICAgLy8gb3BlbmluZyBkb3VibGVzXG4gICAgLnJlcGxhY2UoLyhefFstXFx1MjAxNC8oXFxbe1xcdTIwMThcXHNdKVwiL2csICckMVxcdTIwMWMnKVxuICAgIC8vIGNsb3NpbmcgZG91Ymxlc1xuICAgIC5yZXBsYWNlKC9cIi9nLCAnXFx1MjAxZCcpXG4gICAgLy8gZWxsaXBzZXNcbiAgICAucmVwbGFjZSgvXFwuezN9L2csICdcXHUyMDI2Jyk7XG59XG5cbi8qKlxuICogbWFuZ2xlIGVtYWlsIGFkZHJlc3Nlc1xuICogQHBhcmFtIHtzdHJpbmd9IHRleHRcbiAqL1xuZnVuY3Rpb24gbWFuZ2xlKHRleHQpIHtcbiAgbGV0IG91dCA9ICcnLFxuICAgIGksXG4gICAgY2g7XG5cbiAgY29uc3QgbCA9IHRleHQubGVuZ3RoO1xuICBmb3IgKGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgY2ggPSB0ZXh0LmNoYXJDb2RlQXQoaSk7XG4gICAgaWYgKE1hdGgucmFuZG9tKCkgPiAwLjUpIHtcbiAgICAgIGNoID0gJ3gnICsgY2gudG9TdHJpbmcoMTYpO1xuICAgIH1cbiAgICBvdXQgKz0gJyYjJyArIGNoICsgJzsnO1xuICB9XG5cbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBCbG9jayBMZXhlclxuICovXG5jbGFzcyBMZXhlciB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICB0aGlzLnRva2VucyA9IFtdO1xuICAgIHRoaXMudG9rZW5zLmxpbmtzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IGRlZmF1bHRzO1xuICAgIHRoaXMub3B0aW9ucy50b2tlbml6ZXIgPSB0aGlzLm9wdGlvbnMudG9rZW5pemVyIHx8IG5ldyBUb2tlbml6ZXIoKTtcbiAgICB0aGlzLnRva2VuaXplciA9IHRoaXMub3B0aW9ucy50b2tlbml6ZXI7XG4gICAgdGhpcy50b2tlbml6ZXIub3B0aW9ucyA9IHRoaXMub3B0aW9ucztcbiAgICB0aGlzLnRva2VuaXplci5sZXhlciA9IHRoaXM7XG4gICAgdGhpcy5pbmxpbmVRdWV1ZSA9IFtdO1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBpbkxpbms6IGZhbHNlLFxuICAgICAgaW5SYXdCbG9jazogZmFsc2UsXG4gICAgICB0b3A6IHRydWVcbiAgICB9O1xuXG4gICAgY29uc3QgcnVsZXMgPSB7XG4gICAgICBibG9jazogYmxvY2subm9ybWFsLFxuICAgICAgaW5saW5lOiBpbmxpbmUubm9ybWFsXG4gICAgfTtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMucGVkYW50aWMpIHtcbiAgICAgIHJ1bGVzLmJsb2NrID0gYmxvY2sucGVkYW50aWM7XG4gICAgICBydWxlcy5pbmxpbmUgPSBpbmxpbmUucGVkYW50aWM7XG4gICAgfSBlbHNlIGlmICh0aGlzLm9wdGlvbnMuZ2ZtKSB7XG4gICAgICBydWxlcy5ibG9jayA9IGJsb2NrLmdmbTtcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuYnJlYWtzKSB7XG4gICAgICAgIHJ1bGVzLmlubGluZSA9IGlubGluZS5icmVha3M7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBydWxlcy5pbmxpbmUgPSBpbmxpbmUuZ2ZtO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnRva2VuaXplci5ydWxlcyA9IHJ1bGVzO1xuICB9XG5cbiAgLyoqXG4gICAqIEV4cG9zZSBSdWxlc1xuICAgKi9cbiAgc3RhdGljIGdldCBydWxlcygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgYmxvY2ssXG4gICAgICBpbmxpbmVcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YXRpYyBMZXggTWV0aG9kXG4gICAqL1xuICBzdGF0aWMgbGV4KHNyYywgb3B0aW9ucykge1xuICAgIGNvbnN0IGxleGVyID0gbmV3IExleGVyKG9wdGlvbnMpO1xuICAgIHJldHVybiBsZXhlci5sZXgoc3JjKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGF0aWMgTGV4IElubGluZSBNZXRob2RcbiAgICovXG4gIHN0YXRpYyBsZXhJbmxpbmUoc3JjLCBvcHRpb25zKSB7XG4gICAgY29uc3QgbGV4ZXIgPSBuZXcgTGV4ZXIob3B0aW9ucyk7XG4gICAgcmV0dXJuIGxleGVyLmlubGluZVRva2VucyhzcmMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFByZXByb2Nlc3NpbmdcbiAgICovXG4gIGxleChzcmMpIHtcbiAgICBzcmMgPSBzcmNcbiAgICAgIC5yZXBsYWNlKC9cXHJcXG58XFxyL2csICdcXG4nKTtcblxuICAgIHRoaXMuYmxvY2tUb2tlbnMoc3JjLCB0aGlzLnRva2Vucyk7XG5cbiAgICBsZXQgbmV4dDtcbiAgICB3aGlsZSAobmV4dCA9IHRoaXMuaW5saW5lUXVldWUuc2hpZnQoKSkge1xuICAgICAgdGhpcy5pbmxpbmVUb2tlbnMobmV4dC5zcmMsIG5leHQudG9rZW5zKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy50b2tlbnM7XG4gIH1cblxuICAvKipcbiAgICogTGV4aW5nXG4gICAqL1xuICBibG9ja1Rva2VucyhzcmMsIHRva2VucyA9IFtdKSB7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5wZWRhbnRpYykge1xuICAgICAgc3JjID0gc3JjLnJlcGxhY2UoL1xcdC9nLCAnICAgICcpLnJlcGxhY2UoL14gKyQvZ20sICcnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3JjID0gc3JjLnJlcGxhY2UoL14oICopKFxcdCspL2dtLCAoXywgbGVhZGluZywgdGFicykgPT4ge1xuICAgICAgICByZXR1cm4gbGVhZGluZyArICcgICAgJy5yZXBlYXQodGFicy5sZW5ndGgpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgbGV0IHRva2VuLCBsYXN0VG9rZW4sIGN1dFNyYywgbGFzdFBhcmFncmFwaENsaXBwZWQ7XG5cbiAgICB3aGlsZSAoc3JjKSB7XG4gICAgICBpZiAodGhpcy5vcHRpb25zLmV4dGVuc2lvbnNcbiAgICAgICAgJiYgdGhpcy5vcHRpb25zLmV4dGVuc2lvbnMuYmxvY2tcbiAgICAgICAgJiYgdGhpcy5vcHRpb25zLmV4dGVuc2lvbnMuYmxvY2suc29tZSgoZXh0VG9rZW5pemVyKSA9PiB7XG4gICAgICAgICAgaWYgKHRva2VuID0gZXh0VG9rZW5pemVyLmNhbGwoeyBsZXhlcjogdGhpcyB9LCBzcmMsIHRva2VucykpIHtcbiAgICAgICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9KSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gbmV3bGluZVxuICAgICAgaWYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIuc3BhY2Uoc3JjKSkge1xuICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICBpZiAodG9rZW4ucmF3Lmxlbmd0aCA9PT0gMSAmJiB0b2tlbnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgIC8vIGlmIHRoZXJlJ3MgYSBzaW5nbGUgXFxuIGFzIGEgc3BhY2VyLCBpdCdzIHRlcm1pbmF0aW5nIHRoZSBsYXN0IGxpbmUsXG4gICAgICAgICAgLy8gc28gbW92ZSBpdCB0aGVyZSBzbyB0aGF0IHdlIGRvbid0IGdldCB1bmVjZXNzYXJ5IHBhcmFncmFwaCB0YWdzXG4gICAgICAgICAgdG9rZW5zW3Rva2Vucy5sZW5ndGggLSAxXS5yYXcgKz0gJ1xcbic7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICB9XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBjb2RlXG4gICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci5jb2RlKHNyYykpIHtcbiAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgbGFzdFRva2VuID0gdG9rZW5zW3Rva2Vucy5sZW5ndGggLSAxXTtcbiAgICAgICAgLy8gQW4gaW5kZW50ZWQgY29kZSBibG9jayBjYW5ub3QgaW50ZXJydXB0IGEgcGFyYWdyYXBoLlxuICAgICAgICBpZiAobGFzdFRva2VuICYmIChsYXN0VG9rZW4udHlwZSA9PT0gJ3BhcmFncmFwaCcgfHwgbGFzdFRva2VuLnR5cGUgPT09ICd0ZXh0JykpIHtcbiAgICAgICAgICBsYXN0VG9rZW4ucmF3ICs9ICdcXG4nICsgdG9rZW4ucmF3O1xuICAgICAgICAgIGxhc3RUb2tlbi50ZXh0ICs9ICdcXG4nICsgdG9rZW4udGV4dDtcbiAgICAgICAgICB0aGlzLmlubGluZVF1ZXVlW3RoaXMuaW5saW5lUXVldWUubGVuZ3RoIC0gMV0uc3JjID0gbGFzdFRva2VuLnRleHQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICB9XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBmZW5jZXNcbiAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLmZlbmNlcyhzcmMpKSB7XG4gICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIGhlYWRpbmdcbiAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLmhlYWRpbmcoc3JjKSkge1xuICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBoclxuICAgICAgaWYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIuaHIoc3JjKSkge1xuICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBibG9ja3F1b3RlXG4gICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci5ibG9ja3F1b3RlKHNyYykpIHtcbiAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gbGlzdFxuICAgICAgaWYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIubGlzdChzcmMpKSB7XG4gICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIGh0bWxcbiAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLmh0bWwoc3JjKSkge1xuICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBkZWZcbiAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLmRlZihzcmMpKSB7XG4gICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgIGxhc3RUb2tlbiA9IHRva2Vuc1t0b2tlbnMubGVuZ3RoIC0gMV07XG4gICAgICAgIGlmIChsYXN0VG9rZW4gJiYgKGxhc3RUb2tlbi50eXBlID09PSAncGFyYWdyYXBoJyB8fCBsYXN0VG9rZW4udHlwZSA9PT0gJ3RleHQnKSkge1xuICAgICAgICAgIGxhc3RUb2tlbi5yYXcgKz0gJ1xcbicgKyB0b2tlbi5yYXc7XG4gICAgICAgICAgbGFzdFRva2VuLnRleHQgKz0gJ1xcbicgKyB0b2tlbi5yYXc7XG4gICAgICAgICAgdGhpcy5pbmxpbmVRdWV1ZVt0aGlzLmlubGluZVF1ZXVlLmxlbmd0aCAtIDFdLnNyYyA9IGxhc3RUb2tlbi50ZXh0O1xuICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLnRva2Vucy5saW5rc1t0b2tlbi50YWddKSB7XG4gICAgICAgICAgdGhpcy50b2tlbnMubGlua3NbdG9rZW4udGFnXSA9IHtcbiAgICAgICAgICAgIGhyZWY6IHRva2VuLmhyZWYsXG4gICAgICAgICAgICB0aXRsZTogdG9rZW4udGl0bGVcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyB0YWJsZSAoZ2ZtKVxuICAgICAgaWYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIudGFibGUoc3JjKSkge1xuICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBsaGVhZGluZ1xuICAgICAgaWYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIubGhlYWRpbmcoc3JjKSkge1xuICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyB0b3AtbGV2ZWwgcGFyYWdyYXBoXG4gICAgICAvLyBwcmV2ZW50IHBhcmFncmFwaCBjb25zdW1pbmcgZXh0ZW5zaW9ucyBieSBjbGlwcGluZyAnc3JjJyB0byBleHRlbnNpb24gc3RhcnRcbiAgICAgIGN1dFNyYyA9IHNyYztcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuZXh0ZW5zaW9ucyAmJiB0aGlzLm9wdGlvbnMuZXh0ZW5zaW9ucy5zdGFydEJsb2NrKSB7XG4gICAgICAgIGxldCBzdGFydEluZGV4ID0gSW5maW5pdHk7XG4gICAgICAgIGNvbnN0IHRlbXBTcmMgPSBzcmMuc2xpY2UoMSk7XG4gICAgICAgIGxldCB0ZW1wU3RhcnQ7XG4gICAgICAgIHRoaXMub3B0aW9ucy5leHRlbnNpb25zLnN0YXJ0QmxvY2suZm9yRWFjaChmdW5jdGlvbihnZXRTdGFydEluZGV4KSB7XG4gICAgICAgICAgdGVtcFN0YXJ0ID0gZ2V0U3RhcnRJbmRleC5jYWxsKHsgbGV4ZXI6IHRoaXMgfSwgdGVtcFNyYyk7XG4gICAgICAgICAgaWYgKHR5cGVvZiB0ZW1wU3RhcnQgPT09ICdudW1iZXInICYmIHRlbXBTdGFydCA+PSAwKSB7IHN0YXJ0SW5kZXggPSBNYXRoLm1pbihzdGFydEluZGV4LCB0ZW1wU3RhcnQpOyB9XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoc3RhcnRJbmRleCA8IEluZmluaXR5ICYmIHN0YXJ0SW5kZXggPj0gMCkge1xuICAgICAgICAgIGN1dFNyYyA9IHNyYy5zdWJzdHJpbmcoMCwgc3RhcnRJbmRleCArIDEpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5zdGF0ZS50b3AgJiYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIucGFyYWdyYXBoKGN1dFNyYykpKSB7XG4gICAgICAgIGxhc3RUb2tlbiA9IHRva2Vuc1t0b2tlbnMubGVuZ3RoIC0gMV07XG4gICAgICAgIGlmIChsYXN0UGFyYWdyYXBoQ2xpcHBlZCAmJiBsYXN0VG9rZW4udHlwZSA9PT0gJ3BhcmFncmFwaCcpIHtcbiAgICAgICAgICBsYXN0VG9rZW4ucmF3ICs9ICdcXG4nICsgdG9rZW4ucmF3O1xuICAgICAgICAgIGxhc3RUb2tlbi50ZXh0ICs9ICdcXG4nICsgdG9rZW4udGV4dDtcbiAgICAgICAgICB0aGlzLmlubGluZVF1ZXVlLnBvcCgpO1xuICAgICAgICAgIHRoaXMuaW5saW5lUXVldWVbdGhpcy5pbmxpbmVRdWV1ZS5sZW5ndGggLSAxXS5zcmMgPSBsYXN0VG9rZW4udGV4dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgIH1cbiAgICAgICAgbGFzdFBhcmFncmFwaENsaXBwZWQgPSAoY3V0U3JjLmxlbmd0aCAhPT0gc3JjLmxlbmd0aCk7XG4gICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyB0ZXh0XG4gICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci50ZXh0KHNyYykpIHtcbiAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgbGFzdFRva2VuID0gdG9rZW5zW3Rva2Vucy5sZW5ndGggLSAxXTtcbiAgICAgICAgaWYgKGxhc3RUb2tlbiAmJiBsYXN0VG9rZW4udHlwZSA9PT0gJ3RleHQnKSB7XG4gICAgICAgICAgbGFzdFRva2VuLnJhdyArPSAnXFxuJyArIHRva2VuLnJhdztcbiAgICAgICAgICBsYXN0VG9rZW4udGV4dCArPSAnXFxuJyArIHRva2VuLnRleHQ7XG4gICAgICAgICAgdGhpcy5pbmxpbmVRdWV1ZS5wb3AoKTtcbiAgICAgICAgICB0aGlzLmlubGluZVF1ZXVlW3RoaXMuaW5saW5lUXVldWUubGVuZ3RoIC0gMV0uc3JjID0gbGFzdFRva2VuLnRleHQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICB9XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAoc3JjKSB7XG4gICAgICAgIGNvbnN0IGVyck1zZyA9ICdJbmZpbml0ZSBsb29wIG9uIGJ5dGU6ICcgKyBzcmMuY2hhckNvZGVBdCgwKTtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5zaWxlbnQpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGVyck1zZyk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVyck1zZyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnN0YXRlLnRvcCA9IHRydWU7XG4gICAgcmV0dXJuIHRva2VucztcbiAgfVxuXG4gIGlubGluZShzcmMsIHRva2VucyA9IFtdKSB7XG4gICAgdGhpcy5pbmxpbmVRdWV1ZS5wdXNoKHsgc3JjLCB0b2tlbnMgfSk7XG4gICAgcmV0dXJuIHRva2VucztcbiAgfVxuXG4gIC8qKlxuICAgKiBMZXhpbmcvQ29tcGlsaW5nXG4gICAqL1xuICBpbmxpbmVUb2tlbnMoc3JjLCB0b2tlbnMgPSBbXSkge1xuICAgIGxldCB0b2tlbiwgbGFzdFRva2VuLCBjdXRTcmM7XG5cbiAgICAvLyBTdHJpbmcgd2l0aCBsaW5rcyBtYXNrZWQgdG8gYXZvaWQgaW50ZXJmZXJlbmNlIHdpdGggZW0gYW5kIHN0cm9uZ1xuICAgIGxldCBtYXNrZWRTcmMgPSBzcmM7XG4gICAgbGV0IG1hdGNoO1xuICAgIGxldCBrZWVwUHJldkNoYXIsIHByZXZDaGFyO1xuXG4gICAgLy8gTWFzayBvdXQgcmVmbGlua3NcbiAgICBpZiAodGhpcy50b2tlbnMubGlua3MpIHtcbiAgICAgIGNvbnN0IGxpbmtzID0gT2JqZWN0LmtleXModGhpcy50b2tlbnMubGlua3MpO1xuICAgICAgaWYgKGxpbmtzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgd2hpbGUgKChtYXRjaCA9IHRoaXMudG9rZW5pemVyLnJ1bGVzLmlubGluZS5yZWZsaW5rU2VhcmNoLmV4ZWMobWFza2VkU3JjKSkgIT0gbnVsbCkge1xuICAgICAgICAgIGlmIChsaW5rcy5pbmNsdWRlcyhtYXRjaFswXS5zbGljZShtYXRjaFswXS5sYXN0SW5kZXhPZignWycpICsgMSwgLTEpKSkge1xuICAgICAgICAgICAgbWFza2VkU3JjID0gbWFza2VkU3JjLnNsaWNlKDAsIG1hdGNoLmluZGV4KSArICdbJyArIHJlcGVhdFN0cmluZygnYScsIG1hdGNoWzBdLmxlbmd0aCAtIDIpICsgJ10nICsgbWFza2VkU3JjLnNsaWNlKHRoaXMudG9rZW5pemVyLnJ1bGVzLmlubGluZS5yZWZsaW5rU2VhcmNoLmxhc3RJbmRleCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIC8vIE1hc2sgb3V0IG90aGVyIGJsb2Nrc1xuICAgIHdoaWxlICgobWF0Y2ggPSB0aGlzLnRva2VuaXplci5ydWxlcy5pbmxpbmUuYmxvY2tTa2lwLmV4ZWMobWFza2VkU3JjKSkgIT0gbnVsbCkge1xuICAgICAgbWFza2VkU3JjID0gbWFza2VkU3JjLnNsaWNlKDAsIG1hdGNoLmluZGV4KSArICdbJyArIHJlcGVhdFN0cmluZygnYScsIG1hdGNoWzBdLmxlbmd0aCAtIDIpICsgJ10nICsgbWFza2VkU3JjLnNsaWNlKHRoaXMudG9rZW5pemVyLnJ1bGVzLmlubGluZS5ibG9ja1NraXAubGFzdEluZGV4KTtcbiAgICB9XG5cbiAgICAvLyBNYXNrIG91dCBlc2NhcGVkIGVtICYgc3Ryb25nIGRlbGltaXRlcnNcbiAgICB3aGlsZSAoKG1hdGNoID0gdGhpcy50b2tlbml6ZXIucnVsZXMuaW5saW5lLmVzY2FwZWRFbVN0LmV4ZWMobWFza2VkU3JjKSkgIT0gbnVsbCkge1xuICAgICAgbWFza2VkU3JjID0gbWFza2VkU3JjLnNsaWNlKDAsIG1hdGNoLmluZGV4ICsgbWF0Y2hbMF0ubGVuZ3RoIC0gMikgKyAnKysnICsgbWFza2VkU3JjLnNsaWNlKHRoaXMudG9rZW5pemVyLnJ1bGVzLmlubGluZS5lc2NhcGVkRW1TdC5sYXN0SW5kZXgpO1xuICAgICAgdGhpcy50b2tlbml6ZXIucnVsZXMuaW5saW5lLmVzY2FwZWRFbVN0Lmxhc3RJbmRleC0tO1xuICAgIH1cblxuICAgIHdoaWxlIChzcmMpIHtcbiAgICAgIGlmICgha2VlcFByZXZDaGFyKSB7XG4gICAgICAgIHByZXZDaGFyID0gJyc7XG4gICAgICB9XG4gICAgICBrZWVwUHJldkNoYXIgPSBmYWxzZTtcblxuICAgICAgLy8gZXh0ZW5zaW9uc1xuICAgICAgaWYgKHRoaXMub3B0aW9ucy5leHRlbnNpb25zXG4gICAgICAgICYmIHRoaXMub3B0aW9ucy5leHRlbnNpb25zLmlubGluZVxuICAgICAgICAmJiB0aGlzLm9wdGlvbnMuZXh0ZW5zaW9ucy5pbmxpbmUuc29tZSgoZXh0VG9rZW5pemVyKSA9PiB7XG4gICAgICAgICAgaWYgKHRva2VuID0gZXh0VG9rZW5pemVyLmNhbGwoeyBsZXhlcjogdGhpcyB9LCBzcmMsIHRva2VucykpIHtcbiAgICAgICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9KSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gZXNjYXBlXG4gICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci5lc2NhcGUoc3JjKSkge1xuICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyB0YWdcbiAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLnRhZyhzcmMpKSB7XG4gICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgIGxhc3RUb2tlbiA9IHRva2Vuc1t0b2tlbnMubGVuZ3RoIC0gMV07XG4gICAgICAgIGlmIChsYXN0VG9rZW4gJiYgdG9rZW4udHlwZSA9PT0gJ3RleHQnICYmIGxhc3RUb2tlbi50eXBlID09PSAndGV4dCcpIHtcbiAgICAgICAgICBsYXN0VG9rZW4ucmF3ICs9IHRva2VuLnJhdztcbiAgICAgICAgICBsYXN0VG9rZW4udGV4dCArPSB0b2tlbi50ZXh0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgfVxuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gbGlua1xuICAgICAgaWYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIubGluayhzcmMpKSB7XG4gICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIHJlZmxpbmssIG5vbGlua1xuICAgICAgaWYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIucmVmbGluayhzcmMsIHRoaXMudG9rZW5zLmxpbmtzKSkge1xuICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICBsYXN0VG9rZW4gPSB0b2tlbnNbdG9rZW5zLmxlbmd0aCAtIDFdO1xuICAgICAgICBpZiAobGFzdFRva2VuICYmIHRva2VuLnR5cGUgPT09ICd0ZXh0JyAmJiBsYXN0VG9rZW4udHlwZSA9PT0gJ3RleHQnKSB7XG4gICAgICAgICAgbGFzdFRva2VuLnJhdyArPSB0b2tlbi5yYXc7XG4gICAgICAgICAgbGFzdFRva2VuLnRleHQgKz0gdG9rZW4udGV4dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgIH1cbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIGVtICYgc3Ryb25nXG4gICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci5lbVN0cm9uZyhzcmMsIG1hc2tlZFNyYywgcHJldkNoYXIpKSB7XG4gICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIGNvZGVcbiAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLmNvZGVzcGFuKHNyYykpIHtcbiAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gYnJcbiAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLmJyKHNyYykpIHtcbiAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gZGVsIChnZm0pXG4gICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci5kZWwoc3JjKSkge1xuICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBhdXRvbGlua1xuICAgICAgaWYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIuYXV0b2xpbmsoc3JjLCBtYW5nbGUpKSB7XG4gICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIHVybCAoZ2ZtKVxuICAgICAgaWYgKCF0aGlzLnN0YXRlLmluTGluayAmJiAodG9rZW4gPSB0aGlzLnRva2VuaXplci51cmwoc3JjLCBtYW5nbGUpKSkge1xuICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyB0ZXh0XG4gICAgICAvLyBwcmV2ZW50IGlubGluZVRleHQgY29uc3VtaW5nIGV4dGVuc2lvbnMgYnkgY2xpcHBpbmcgJ3NyYycgdG8gZXh0ZW5zaW9uIHN0YXJ0XG4gICAgICBjdXRTcmMgPSBzcmM7XG4gICAgICBpZiAodGhpcy5vcHRpb25zLmV4dGVuc2lvbnMgJiYgdGhpcy5vcHRpb25zLmV4dGVuc2lvbnMuc3RhcnRJbmxpbmUpIHtcbiAgICAgICAgbGV0IHN0YXJ0SW5kZXggPSBJbmZpbml0eTtcbiAgICAgICAgY29uc3QgdGVtcFNyYyA9IHNyYy5zbGljZSgxKTtcbiAgICAgICAgbGV0IHRlbXBTdGFydDtcbiAgICAgICAgdGhpcy5vcHRpb25zLmV4dGVuc2lvbnMuc3RhcnRJbmxpbmUuZm9yRWFjaChmdW5jdGlvbihnZXRTdGFydEluZGV4KSB7XG4gICAgICAgICAgdGVtcFN0YXJ0ID0gZ2V0U3RhcnRJbmRleC5jYWxsKHsgbGV4ZXI6IHRoaXMgfSwgdGVtcFNyYyk7XG4gICAgICAgICAgaWYgKHR5cGVvZiB0ZW1wU3RhcnQgPT09ICdudW1iZXInICYmIHRlbXBTdGFydCA+PSAwKSB7IHN0YXJ0SW5kZXggPSBNYXRoLm1pbihzdGFydEluZGV4LCB0ZW1wU3RhcnQpOyB9XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoc3RhcnRJbmRleCA8IEluZmluaXR5ICYmIHN0YXJ0SW5kZXggPj0gMCkge1xuICAgICAgICAgIGN1dFNyYyA9IHNyYy5zdWJzdHJpbmcoMCwgc3RhcnRJbmRleCArIDEpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci5pbmxpbmVUZXh0KGN1dFNyYywgc21hcnR5cGFudHMpKSB7XG4gICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgIGlmICh0b2tlbi5yYXcuc2xpY2UoLTEpICE9PSAnXycpIHsgLy8gVHJhY2sgcHJldkNoYXIgYmVmb3JlIHN0cmluZyBvZiBfX19fIHN0YXJ0ZWRcbiAgICAgICAgICBwcmV2Q2hhciA9IHRva2VuLnJhdy5zbGljZSgtMSk7XG4gICAgICAgIH1cbiAgICAgICAga2VlcFByZXZDaGFyID0gdHJ1ZTtcbiAgICAgICAgbGFzdFRva2VuID0gdG9rZW5zW3Rva2Vucy5sZW5ndGggLSAxXTtcbiAgICAgICAgaWYgKGxhc3RUb2tlbiAmJiBsYXN0VG9rZW4udHlwZSA9PT0gJ3RleHQnKSB7XG4gICAgICAgICAgbGFzdFRva2VuLnJhdyArPSB0b2tlbi5yYXc7XG4gICAgICAgICAgbGFzdFRva2VuLnRleHQgKz0gdG9rZW4udGV4dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgIH1cbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChzcmMpIHtcbiAgICAgICAgY29uc3QgZXJyTXNnID0gJ0luZmluaXRlIGxvb3Agb24gYnl0ZTogJyArIHNyYy5jaGFyQ29kZUF0KDApO1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnNpbGVudCkge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyTXNnKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyTXNnKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0b2tlbnM7XG4gIH1cbn1cblxuLyoqXG4gKiBSZW5kZXJlclxuICovXG5jbGFzcyBSZW5kZXJlciB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IGRlZmF1bHRzO1xuICB9XG5cbiAgY29kZShjb2RlLCBpbmZvc3RyaW5nLCBlc2NhcGVkKSB7XG4gICAgY29uc3QgbGFuZyA9IChpbmZvc3RyaW5nIHx8ICcnKS5tYXRjaCgvXFxTKi8pWzBdO1xuICAgIGlmICh0aGlzLm9wdGlvbnMuaGlnaGxpZ2h0KSB7XG4gICAgICBjb25zdCBvdXQgPSB0aGlzLm9wdGlvbnMuaGlnaGxpZ2h0KGNvZGUsIGxhbmcpO1xuICAgICAgaWYgKG91dCAhPSBudWxsICYmIG91dCAhPT0gY29kZSkge1xuICAgICAgICBlc2NhcGVkID0gdHJ1ZTtcbiAgICAgICAgY29kZSA9IG91dDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb2RlID0gY29kZS5yZXBsYWNlKC9cXG4kLywgJycpICsgJ1xcbic7XG5cbiAgICBpZiAoIWxhbmcpIHtcbiAgICAgIHJldHVybiAnPHByZT48Y29kZT4nXG4gICAgICAgICsgKGVzY2FwZWQgPyBjb2RlIDogZXNjYXBlKGNvZGUsIHRydWUpKVxuICAgICAgICArICc8L2NvZGU+PC9wcmU+XFxuJztcbiAgICB9XG5cbiAgICByZXR1cm4gJzxwcmU+PGNvZGUgY2xhc3M9XCInXG4gICAgICArIHRoaXMub3B0aW9ucy5sYW5nUHJlZml4XG4gICAgICArIGVzY2FwZShsYW5nKVxuICAgICAgKyAnXCI+J1xuICAgICAgKyAoZXNjYXBlZCA/IGNvZGUgOiBlc2NhcGUoY29kZSwgdHJ1ZSkpXG4gICAgICArICc8L2NvZGU+PC9wcmU+XFxuJztcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcXVvdGVcbiAgICovXG4gIGJsb2NrcXVvdGUocXVvdGUpIHtcbiAgICByZXR1cm4gYDxibG9ja3F1b3RlPlxcbiR7cXVvdGV9PC9ibG9ja3F1b3RlPlxcbmA7XG4gIH1cblxuICBodG1sKGh0bWwpIHtcbiAgICByZXR1cm4gaHRtbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGV4dFxuICAgKiBAcGFyYW0ge3N0cmluZ30gbGV2ZWxcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJhd1xuICAgKiBAcGFyYW0ge2FueX0gc2x1Z2dlclxuICAgKi9cbiAgaGVhZGluZyh0ZXh0LCBsZXZlbCwgcmF3LCBzbHVnZ2VyKSB7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5oZWFkZXJJZHMpIHtcbiAgICAgIGNvbnN0IGlkID0gdGhpcy5vcHRpb25zLmhlYWRlclByZWZpeCArIHNsdWdnZXIuc2x1ZyhyYXcpO1xuICAgICAgcmV0dXJuIGA8aCR7bGV2ZWx9IGlkPVwiJHtpZH1cIj4ke3RleHR9PC9oJHtsZXZlbH0+XFxuYDtcbiAgICB9XG5cbiAgICAvLyBpZ25vcmUgSURzXG4gICAgcmV0dXJuIGA8aCR7bGV2ZWx9PiR7dGV4dH08L2gke2xldmVsfT5cXG5gO1xuICB9XG5cbiAgaHIoKSB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy54aHRtbCA/ICc8aHIvPlxcbicgOiAnPGhyPlxcbic7XG4gIH1cblxuICBsaXN0KGJvZHksIG9yZGVyZWQsIHN0YXJ0KSB7XG4gICAgY29uc3QgdHlwZSA9IG9yZGVyZWQgPyAnb2wnIDogJ3VsJyxcbiAgICAgIHN0YXJ0YXR0ID0gKG9yZGVyZWQgJiYgc3RhcnQgIT09IDEpID8gKCcgc3RhcnQ9XCInICsgc3RhcnQgKyAnXCInKSA6ICcnO1xuICAgIHJldHVybiAnPCcgKyB0eXBlICsgc3RhcnRhdHQgKyAnPlxcbicgKyBib2R5ICsgJzwvJyArIHR5cGUgKyAnPlxcbic7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IHRleHRcbiAgICovXG4gIGxpc3RpdGVtKHRleHQpIHtcbiAgICByZXR1cm4gYDxsaT4ke3RleHR9PC9saT5cXG5gO1xuICB9XG5cbiAgY2hlY2tib3goY2hlY2tlZCkge1xuICAgIHJldHVybiAnPGlucHV0ICdcbiAgICAgICsgKGNoZWNrZWQgPyAnY2hlY2tlZD1cIlwiICcgOiAnJylcbiAgICAgICsgJ2Rpc2FibGVkPVwiXCIgdHlwZT1cImNoZWNrYm94XCInXG4gICAgICArICh0aGlzLm9wdGlvbnMueGh0bWwgPyAnIC8nIDogJycpXG4gICAgICArICc+ICc7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IHRleHRcbiAgICovXG4gIHBhcmFncmFwaCh0ZXh0KSB7XG4gICAgcmV0dXJuIGA8cD4ke3RleHR9PC9wPlxcbmA7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IGhlYWRlclxuICAgKiBAcGFyYW0ge3N0cmluZ30gYm9keVxuICAgKi9cbiAgdGFibGUoaGVhZGVyLCBib2R5KSB7XG4gICAgaWYgKGJvZHkpIGJvZHkgPSBgPHRib2R5PiR7Ym9keX08L3Rib2R5PmA7XG5cbiAgICByZXR1cm4gJzx0YWJsZT5cXG4nXG4gICAgICArICc8dGhlYWQ+XFxuJ1xuICAgICAgKyBoZWFkZXJcbiAgICAgICsgJzwvdGhlYWQ+XFxuJ1xuICAgICAgKyBib2R5XG4gICAgICArICc8L3RhYmxlPlxcbic7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IGNvbnRlbnRcbiAgICovXG4gIHRhYmxlcm93KGNvbnRlbnQpIHtcbiAgICByZXR1cm4gYDx0cj5cXG4ke2NvbnRlbnR9PC90cj5cXG5gO1xuICB9XG5cbiAgdGFibGVjZWxsKGNvbnRlbnQsIGZsYWdzKSB7XG4gICAgY29uc3QgdHlwZSA9IGZsYWdzLmhlYWRlciA/ICd0aCcgOiAndGQnO1xuICAgIGNvbnN0IHRhZyA9IGZsYWdzLmFsaWduXG4gICAgICA/IGA8JHt0eXBlfSBhbGlnbj1cIiR7ZmxhZ3MuYWxpZ259XCI+YFxuICAgICAgOiBgPCR7dHlwZX0+YDtcbiAgICByZXR1cm4gdGFnICsgY29udGVudCArIGA8LyR7dHlwZX0+XFxuYDtcbiAgfVxuXG4gIC8qKlxuICAgKiBzcGFuIGxldmVsIHJlbmRlcmVyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0XG4gICAqL1xuICBzdHJvbmcodGV4dCkge1xuICAgIHJldHVybiBgPHN0cm9uZz4ke3RleHR9PC9zdHJvbmc+YDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGV4dFxuICAgKi9cbiAgZW0odGV4dCkge1xuICAgIHJldHVybiBgPGVtPiR7dGV4dH08L2VtPmA7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IHRleHRcbiAgICovXG4gIGNvZGVzcGFuKHRleHQpIHtcbiAgICByZXR1cm4gYDxjb2RlPiR7dGV4dH08L2NvZGU+YDtcbiAgfVxuXG4gIGJyKCkge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnMueGh0bWwgPyAnPGJyLz4nIDogJzxicj4nO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0XG4gICAqL1xuICBkZWwodGV4dCkge1xuICAgIHJldHVybiBgPGRlbD4ke3RleHR9PC9kZWw+YDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gaHJlZlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGl0bGVcbiAgICogQHBhcmFtIHtzdHJpbmd9IHRleHRcbiAgICovXG4gIGxpbmsoaHJlZiwgdGl0bGUsIHRleHQpIHtcbiAgICBocmVmID0gY2xlYW5VcmwodGhpcy5vcHRpb25zLnNhbml0aXplLCB0aGlzLm9wdGlvbnMuYmFzZVVybCwgaHJlZik7XG4gICAgaWYgKGhyZWYgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiB0ZXh0O1xuICAgIH1cbiAgICBsZXQgb3V0ID0gJzxhIGhyZWY9XCInICsgaHJlZiArICdcIic7XG4gICAgaWYgKHRpdGxlKSB7XG4gICAgICBvdXQgKz0gJyB0aXRsZT1cIicgKyB0aXRsZSArICdcIic7XG4gICAgfVxuICAgIG91dCArPSAnPicgKyB0ZXh0ICsgJzwvYT4nO1xuICAgIHJldHVybiBvdXQ7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IGhyZWZcbiAgICogQHBhcmFtIHtzdHJpbmd9IHRpdGxlXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0XG4gICAqL1xuICBpbWFnZShocmVmLCB0aXRsZSwgdGV4dCkge1xuICAgIGhyZWYgPSBjbGVhblVybCh0aGlzLm9wdGlvbnMuc2FuaXRpemUsIHRoaXMub3B0aW9ucy5iYXNlVXJsLCBocmVmKTtcbiAgICBpZiAoaHJlZiA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRleHQ7XG4gICAgfVxuXG4gICAgbGV0IG91dCA9IGA8aW1nIHNyYz1cIiR7aHJlZn1cIiBhbHQ9XCIke3RleHR9XCJgO1xuICAgIGlmICh0aXRsZSkge1xuICAgICAgb3V0ICs9IGAgdGl0bGU9XCIke3RpdGxlfVwiYDtcbiAgICB9XG4gICAgb3V0ICs9IHRoaXMub3B0aW9ucy54aHRtbCA/ICcvPicgOiAnPic7XG4gICAgcmV0dXJuIG91dDtcbiAgfVxuXG4gIHRleHQodGV4dCkge1xuICAgIHJldHVybiB0ZXh0O1xuICB9XG59XG5cbi8qKlxuICogVGV4dFJlbmRlcmVyXG4gKiByZXR1cm5zIG9ubHkgdGhlIHRleHR1YWwgcGFydCBvZiB0aGUgdG9rZW5cbiAqL1xuY2xhc3MgVGV4dFJlbmRlcmVyIHtcbiAgLy8gbm8gbmVlZCBmb3IgYmxvY2sgbGV2ZWwgcmVuZGVyZXJzXG4gIHN0cm9uZyh0ZXh0KSB7XG4gICAgcmV0dXJuIHRleHQ7XG4gIH1cblxuICBlbSh0ZXh0KSB7XG4gICAgcmV0dXJuIHRleHQ7XG4gIH1cblxuICBjb2Rlc3Bhbih0ZXh0KSB7XG4gICAgcmV0dXJuIHRleHQ7XG4gIH1cblxuICBkZWwodGV4dCkge1xuICAgIHJldHVybiB0ZXh0O1xuICB9XG5cbiAgaHRtbCh0ZXh0KSB7XG4gICAgcmV0dXJuIHRleHQ7XG4gIH1cblxuICB0ZXh0KHRleHQpIHtcbiAgICByZXR1cm4gdGV4dDtcbiAgfVxuXG4gIGxpbmsoaHJlZiwgdGl0bGUsIHRleHQpIHtcbiAgICByZXR1cm4gJycgKyB0ZXh0O1xuICB9XG5cbiAgaW1hZ2UoaHJlZiwgdGl0bGUsIHRleHQpIHtcbiAgICByZXR1cm4gJycgKyB0ZXh0O1xuICB9XG5cbiAgYnIoKSB7XG4gICAgcmV0dXJuICcnO1xuICB9XG59XG5cbi8qKlxuICogU2x1Z2dlciBnZW5lcmF0ZXMgaGVhZGVyIGlkXG4gKi9cbmNsYXNzIFNsdWdnZXIge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnNlZW4gPSB7fTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdmFsdWVcbiAgICovXG4gIHNlcmlhbGl6ZSh2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZVxuICAgICAgLnRvTG93ZXJDYXNlKClcbiAgICAgIC50cmltKClcbiAgICAgIC8vIHJlbW92ZSBodG1sIHRhZ3NcbiAgICAgIC5yZXBsYWNlKC88WyFcXC9hLXpdLio/Pi9pZywgJycpXG4gICAgICAvLyByZW1vdmUgdW53YW50ZWQgY2hhcnNcbiAgICAgIC5yZXBsYWNlKC9bXFx1MjAwMC1cXHUyMDZGXFx1MkUwMC1cXHUyRTdGXFxcXCchXCIjJCUmKCkqKywuLzo7PD0+P0BbXFxdXmB7fH1+XS9nLCAnJylcbiAgICAgIC5yZXBsYWNlKC9cXHMvZywgJy0nKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGaW5kcyB0aGUgbmV4dCBzYWZlICh1bmlxdWUpIHNsdWcgdG8gdXNlXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBvcmlnaW5hbFNsdWdcbiAgICogQHBhcmFtIHtib29sZWFufSBpc0RyeVJ1blxuICAgKi9cbiAgZ2V0TmV4dFNhZmVTbHVnKG9yaWdpbmFsU2x1ZywgaXNEcnlSdW4pIHtcbiAgICBsZXQgc2x1ZyA9IG9yaWdpbmFsU2x1ZztcbiAgICBsZXQgb2NjdXJlbmNlQWNjdW11bGF0b3IgPSAwO1xuICAgIGlmICh0aGlzLnNlZW4uaGFzT3duUHJvcGVydHkoc2x1ZykpIHtcbiAgICAgIG9jY3VyZW5jZUFjY3VtdWxhdG9yID0gdGhpcy5zZWVuW29yaWdpbmFsU2x1Z107XG4gICAgICBkbyB7XG4gICAgICAgIG9jY3VyZW5jZUFjY3VtdWxhdG9yKys7XG4gICAgICAgIHNsdWcgPSBvcmlnaW5hbFNsdWcgKyAnLScgKyBvY2N1cmVuY2VBY2N1bXVsYXRvcjtcbiAgICAgIH0gd2hpbGUgKHRoaXMuc2Vlbi5oYXNPd25Qcm9wZXJ0eShzbHVnKSk7XG4gICAgfVxuICAgIGlmICghaXNEcnlSdW4pIHtcbiAgICAgIHRoaXMuc2VlbltvcmlnaW5hbFNsdWddID0gb2NjdXJlbmNlQWNjdW11bGF0b3I7XG4gICAgICB0aGlzLnNlZW5bc2x1Z10gPSAwO1xuICAgIH1cbiAgICByZXR1cm4gc2x1ZztcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0IHN0cmluZyB0byB1bmlxdWUgaWRcbiAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmRyeXJ1bl0gR2VuZXJhdGVzIHRoZSBuZXh0IHVuaXF1ZSBzbHVnIHdpdGhvdXRcbiAgICogdXBkYXRpbmcgdGhlIGludGVybmFsIGFjY3VtdWxhdG9yLlxuICAgKi9cbiAgc2x1Zyh2YWx1ZSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgY29uc3Qgc2x1ZyA9IHRoaXMuc2VyaWFsaXplKHZhbHVlKTtcbiAgICByZXR1cm4gdGhpcy5nZXROZXh0U2FmZVNsdWcoc2x1Zywgb3B0aW9ucy5kcnlydW4pO1xuICB9XG59XG5cbi8qKlxuICogUGFyc2luZyAmIENvbXBpbGluZ1xuICovXG5jbGFzcyBQYXJzZXIge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyB8fCBkZWZhdWx0cztcbiAgICB0aGlzLm9wdGlvbnMucmVuZGVyZXIgPSB0aGlzLm9wdGlvbnMucmVuZGVyZXIgfHwgbmV3IFJlbmRlcmVyKCk7XG4gICAgdGhpcy5yZW5kZXJlciA9IHRoaXMub3B0aW9ucy5yZW5kZXJlcjtcbiAgICB0aGlzLnJlbmRlcmVyLm9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG4gICAgdGhpcy50ZXh0UmVuZGVyZXIgPSBuZXcgVGV4dFJlbmRlcmVyKCk7XG4gICAgdGhpcy5zbHVnZ2VyID0gbmV3IFNsdWdnZXIoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGF0aWMgUGFyc2UgTWV0aG9kXG4gICAqL1xuICBzdGF0aWMgcGFyc2UodG9rZW5zLCBvcHRpb25zKSB7XG4gICAgY29uc3QgcGFyc2VyID0gbmV3IFBhcnNlcihvcHRpb25zKTtcbiAgICByZXR1cm4gcGFyc2VyLnBhcnNlKHRva2Vucyk7XG4gIH1cblxuICAvKipcbiAgICogU3RhdGljIFBhcnNlIElubGluZSBNZXRob2RcbiAgICovXG4gIHN0YXRpYyBwYXJzZUlubGluZSh0b2tlbnMsIG9wdGlvbnMpIHtcbiAgICBjb25zdCBwYXJzZXIgPSBuZXcgUGFyc2VyKG9wdGlvbnMpO1xuICAgIHJldHVybiBwYXJzZXIucGFyc2VJbmxpbmUodG9rZW5zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQYXJzZSBMb29wXG4gICAqL1xuICBwYXJzZSh0b2tlbnMsIHRvcCA9IHRydWUpIHtcbiAgICBsZXQgb3V0ID0gJycsXG4gICAgICBpLFxuICAgICAgaixcbiAgICAgIGssXG4gICAgICBsMixcbiAgICAgIGwzLFxuICAgICAgcm93LFxuICAgICAgY2VsbCxcbiAgICAgIGhlYWRlcixcbiAgICAgIGJvZHksXG4gICAgICB0b2tlbixcbiAgICAgIG9yZGVyZWQsXG4gICAgICBzdGFydCxcbiAgICAgIGxvb3NlLFxuICAgICAgaXRlbUJvZHksXG4gICAgICBpdGVtLFxuICAgICAgY2hlY2tlZCxcbiAgICAgIHRhc2ssXG4gICAgICBjaGVja2JveCxcbiAgICAgIHJldDtcblxuICAgIGNvbnN0IGwgPSB0b2tlbnMubGVuZ3RoO1xuICAgIGZvciAoaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICAgIHRva2VuID0gdG9rZW5zW2ldO1xuXG4gICAgICAvLyBSdW4gYW55IHJlbmRlcmVyIGV4dGVuc2lvbnNcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuZXh0ZW5zaW9ucyAmJiB0aGlzLm9wdGlvbnMuZXh0ZW5zaW9ucy5yZW5kZXJlcnMgJiYgdGhpcy5vcHRpb25zLmV4dGVuc2lvbnMucmVuZGVyZXJzW3Rva2VuLnR5cGVdKSB7XG4gICAgICAgIHJldCA9IHRoaXMub3B0aW9ucy5leHRlbnNpb25zLnJlbmRlcmVyc1t0b2tlbi50eXBlXS5jYWxsKHsgcGFyc2VyOiB0aGlzIH0sIHRva2VuKTtcbiAgICAgICAgaWYgKHJldCAhPT0gZmFsc2UgfHwgIVsnc3BhY2UnLCAnaHInLCAnaGVhZGluZycsICdjb2RlJywgJ3RhYmxlJywgJ2Jsb2NrcXVvdGUnLCAnbGlzdCcsICdodG1sJywgJ3BhcmFncmFwaCcsICd0ZXh0J10uaW5jbHVkZXModG9rZW4udHlwZSkpIHtcbiAgICAgICAgICBvdXQgKz0gcmV0IHx8ICcnO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHN3aXRjaCAodG9rZW4udHlwZSkge1xuICAgICAgICBjYXNlICdzcGFjZSc6IHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjYXNlICdocic6IHtcbiAgICAgICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5ocigpO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgJ2hlYWRpbmcnOiB7XG4gICAgICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIuaGVhZGluZyhcbiAgICAgICAgICAgIHRoaXMucGFyc2VJbmxpbmUodG9rZW4udG9rZW5zKSxcbiAgICAgICAgICAgIHRva2VuLmRlcHRoLFxuICAgICAgICAgICAgdW5lc2NhcGUodGhpcy5wYXJzZUlubGluZSh0b2tlbi50b2tlbnMsIHRoaXMudGV4dFJlbmRlcmVyKSksXG4gICAgICAgICAgICB0aGlzLnNsdWdnZXIpO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgJ2NvZGUnOiB7XG4gICAgICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIuY29kZSh0b2tlbi50ZXh0LFxuICAgICAgICAgICAgdG9rZW4ubGFuZyxcbiAgICAgICAgICAgIHRva2VuLmVzY2FwZWQpO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgJ3RhYmxlJzoge1xuICAgICAgICAgIGhlYWRlciA9ICcnO1xuXG4gICAgICAgICAgLy8gaGVhZGVyXG4gICAgICAgICAgY2VsbCA9ICcnO1xuICAgICAgICAgIGwyID0gdG9rZW4uaGVhZGVyLmxlbmd0aDtcbiAgICAgICAgICBmb3IgKGogPSAwOyBqIDwgbDI7IGorKykge1xuICAgICAgICAgICAgY2VsbCArPSB0aGlzLnJlbmRlcmVyLnRhYmxlY2VsbChcbiAgICAgICAgICAgICAgdGhpcy5wYXJzZUlubGluZSh0b2tlbi5oZWFkZXJbal0udG9rZW5zKSxcbiAgICAgICAgICAgICAgeyBoZWFkZXI6IHRydWUsIGFsaWduOiB0b2tlbi5hbGlnbltqXSB9XG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBoZWFkZXIgKz0gdGhpcy5yZW5kZXJlci50YWJsZXJvdyhjZWxsKTtcblxuICAgICAgICAgIGJvZHkgPSAnJztcbiAgICAgICAgICBsMiA9IHRva2VuLnJvd3MubGVuZ3RoO1xuICAgICAgICAgIGZvciAoaiA9IDA7IGogPCBsMjsgaisrKSB7XG4gICAgICAgICAgICByb3cgPSB0b2tlbi5yb3dzW2pdO1xuXG4gICAgICAgICAgICBjZWxsID0gJyc7XG4gICAgICAgICAgICBsMyA9IHJvdy5sZW5ndGg7XG4gICAgICAgICAgICBmb3IgKGsgPSAwOyBrIDwgbDM7IGsrKykge1xuICAgICAgICAgICAgICBjZWxsICs9IHRoaXMucmVuZGVyZXIudGFibGVjZWxsKFxuICAgICAgICAgICAgICAgIHRoaXMucGFyc2VJbmxpbmUocm93W2tdLnRva2VucyksXG4gICAgICAgICAgICAgICAgeyBoZWFkZXI6IGZhbHNlLCBhbGlnbjogdG9rZW4uYWxpZ25ba10gfVxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBib2R5ICs9IHRoaXMucmVuZGVyZXIudGFibGVyb3coY2VsbCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLnRhYmxlKGhlYWRlciwgYm9keSk7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAnYmxvY2txdW90ZSc6IHtcbiAgICAgICAgICBib2R5ID0gdGhpcy5wYXJzZSh0b2tlbi50b2tlbnMpO1xuICAgICAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLmJsb2NrcXVvdGUoYm9keSk7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAnbGlzdCc6IHtcbiAgICAgICAgICBvcmRlcmVkID0gdG9rZW4ub3JkZXJlZDtcbiAgICAgICAgICBzdGFydCA9IHRva2VuLnN0YXJ0O1xuICAgICAgICAgIGxvb3NlID0gdG9rZW4ubG9vc2U7XG4gICAgICAgICAgbDIgPSB0b2tlbi5pdGVtcy5sZW5ndGg7XG5cbiAgICAgICAgICBib2R5ID0gJyc7XG4gICAgICAgICAgZm9yIChqID0gMDsgaiA8IGwyOyBqKyspIHtcbiAgICAgICAgICAgIGl0ZW0gPSB0b2tlbi5pdGVtc1tqXTtcbiAgICAgICAgICAgIGNoZWNrZWQgPSBpdGVtLmNoZWNrZWQ7XG4gICAgICAgICAgICB0YXNrID0gaXRlbS50YXNrO1xuXG4gICAgICAgICAgICBpdGVtQm9keSA9ICcnO1xuICAgICAgICAgICAgaWYgKGl0ZW0udGFzaykge1xuICAgICAgICAgICAgICBjaGVja2JveCA9IHRoaXMucmVuZGVyZXIuY2hlY2tib3goY2hlY2tlZCk7XG4gICAgICAgICAgICAgIGlmIChsb29zZSkge1xuICAgICAgICAgICAgICAgIGlmIChpdGVtLnRva2Vucy5sZW5ndGggPiAwICYmIGl0ZW0udG9rZW5zWzBdLnR5cGUgPT09ICdwYXJhZ3JhcGgnKSB7XG4gICAgICAgICAgICAgICAgICBpdGVtLnRva2Vuc1swXS50ZXh0ID0gY2hlY2tib3ggKyAnICcgKyBpdGVtLnRva2Vuc1swXS50ZXh0O1xuICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0udG9rZW5zWzBdLnRva2VucyAmJiBpdGVtLnRva2Vuc1swXS50b2tlbnMubGVuZ3RoID4gMCAmJiBpdGVtLnRva2Vuc1swXS50b2tlbnNbMF0udHlwZSA9PT0gJ3RleHQnKSB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0udG9rZW5zWzBdLnRva2Vuc1swXS50ZXh0ID0gY2hlY2tib3ggKyAnICcgKyBpdGVtLnRva2Vuc1swXS50b2tlbnNbMF0udGV4dDtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgaXRlbS50b2tlbnMudW5zaGlmdCh7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogY2hlY2tib3hcbiAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpdGVtQm9keSArPSBjaGVja2JveDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpdGVtQm9keSArPSB0aGlzLnBhcnNlKGl0ZW0udG9rZW5zLCBsb29zZSk7XG4gICAgICAgICAgICBib2R5ICs9IHRoaXMucmVuZGVyZXIubGlzdGl0ZW0oaXRlbUJvZHksIHRhc2ssIGNoZWNrZWQpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLmxpc3QoYm9keSwgb3JkZXJlZCwgc3RhcnQpO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgJ2h0bWwnOiB7XG4gICAgICAgICAgLy8gVE9ETyBwYXJzZSBpbmxpbmUgY29udGVudCBpZiBwYXJhbWV0ZXIgbWFya2Rvd249MVxuICAgICAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLmh0bWwodG9rZW4udGV4dCk7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAncGFyYWdyYXBoJzoge1xuICAgICAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLnBhcmFncmFwaCh0aGlzLnBhcnNlSW5saW5lKHRva2VuLnRva2VucykpO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgJ3RleHQnOiB7XG4gICAgICAgICAgYm9keSA9IHRva2VuLnRva2VucyA/IHRoaXMucGFyc2VJbmxpbmUodG9rZW4udG9rZW5zKSA6IHRva2VuLnRleHQ7XG4gICAgICAgICAgd2hpbGUgKGkgKyAxIDwgbCAmJiB0b2tlbnNbaSArIDFdLnR5cGUgPT09ICd0ZXh0Jykge1xuICAgICAgICAgICAgdG9rZW4gPSB0b2tlbnNbKytpXTtcbiAgICAgICAgICAgIGJvZHkgKz0gJ1xcbicgKyAodG9rZW4udG9rZW5zID8gdGhpcy5wYXJzZUlubGluZSh0b2tlbi50b2tlbnMpIDogdG9rZW4udGV4dCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIG91dCArPSB0b3AgPyB0aGlzLnJlbmRlcmVyLnBhcmFncmFwaChib2R5KSA6IGJvZHk7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBkZWZhdWx0OiB7XG4gICAgICAgICAgY29uc3QgZXJyTXNnID0gJ1Rva2VuIHdpdGggXCInICsgdG9rZW4udHlwZSArICdcIiB0eXBlIHdhcyBub3QgZm91bmQuJztcbiAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnNpbGVudCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJNc2cpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyTXNnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gb3V0O1xuICB9XG5cbiAgLyoqXG4gICAqIFBhcnNlIElubGluZSBUb2tlbnNcbiAgICovXG4gIHBhcnNlSW5saW5lKHRva2VucywgcmVuZGVyZXIpIHtcbiAgICByZW5kZXJlciA9IHJlbmRlcmVyIHx8IHRoaXMucmVuZGVyZXI7XG4gICAgbGV0IG91dCA9ICcnLFxuICAgICAgaSxcbiAgICAgIHRva2VuLFxuICAgICAgcmV0O1xuXG4gICAgY29uc3QgbCA9IHRva2Vucy5sZW5ndGg7XG4gICAgZm9yIChpID0gMDsgaSA8IGw7IGkrKykge1xuICAgICAgdG9rZW4gPSB0b2tlbnNbaV07XG5cbiAgICAgIC8vIFJ1biBhbnkgcmVuZGVyZXIgZXh0ZW5zaW9uc1xuICAgICAgaWYgKHRoaXMub3B0aW9ucy5leHRlbnNpb25zICYmIHRoaXMub3B0aW9ucy5leHRlbnNpb25zLnJlbmRlcmVycyAmJiB0aGlzLm9wdGlvbnMuZXh0ZW5zaW9ucy5yZW5kZXJlcnNbdG9rZW4udHlwZV0pIHtcbiAgICAgICAgcmV0ID0gdGhpcy5vcHRpb25zLmV4dGVuc2lvbnMucmVuZGVyZXJzW3Rva2VuLnR5cGVdLmNhbGwoeyBwYXJzZXI6IHRoaXMgfSwgdG9rZW4pO1xuICAgICAgICBpZiAocmV0ICE9PSBmYWxzZSB8fCAhWydlc2NhcGUnLCAnaHRtbCcsICdsaW5rJywgJ2ltYWdlJywgJ3N0cm9uZycsICdlbScsICdjb2Rlc3BhbicsICdicicsICdkZWwnLCAndGV4dCddLmluY2x1ZGVzKHRva2VuLnR5cGUpKSB7XG4gICAgICAgICAgb3V0ICs9IHJldCB8fCAnJztcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBzd2l0Y2ggKHRva2VuLnR5cGUpIHtcbiAgICAgICAgY2FzZSAnZXNjYXBlJzoge1xuICAgICAgICAgIG91dCArPSByZW5kZXJlci50ZXh0KHRva2VuLnRleHQpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgJ2h0bWwnOiB7XG4gICAgICAgICAgb3V0ICs9IHJlbmRlcmVyLmh0bWwodG9rZW4udGV4dCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAnbGluayc6IHtcbiAgICAgICAgICBvdXQgKz0gcmVuZGVyZXIubGluayh0b2tlbi5ocmVmLCB0b2tlbi50aXRsZSwgdGhpcy5wYXJzZUlubGluZSh0b2tlbi50b2tlbnMsIHJlbmRlcmVyKSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAnaW1hZ2UnOiB7XG4gICAgICAgICAgb3V0ICs9IHJlbmRlcmVyLmltYWdlKHRva2VuLmhyZWYsIHRva2VuLnRpdGxlLCB0b2tlbi50ZXh0KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjYXNlICdzdHJvbmcnOiB7XG4gICAgICAgICAgb3V0ICs9IHJlbmRlcmVyLnN0cm9uZyh0aGlzLnBhcnNlSW5saW5lKHRva2VuLnRva2VucywgcmVuZGVyZXIpKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjYXNlICdlbSc6IHtcbiAgICAgICAgICBvdXQgKz0gcmVuZGVyZXIuZW0odGhpcy5wYXJzZUlubGluZSh0b2tlbi50b2tlbnMsIHJlbmRlcmVyKSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAnY29kZXNwYW4nOiB7XG4gICAgICAgICAgb3V0ICs9IHJlbmRlcmVyLmNvZGVzcGFuKHRva2VuLnRleHQpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgJ2JyJzoge1xuICAgICAgICAgIG91dCArPSByZW5kZXJlci5icigpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgJ2RlbCc6IHtcbiAgICAgICAgICBvdXQgKz0gcmVuZGVyZXIuZGVsKHRoaXMucGFyc2VJbmxpbmUodG9rZW4udG9rZW5zLCByZW5kZXJlcikpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgJ3RleHQnOiB7XG4gICAgICAgICAgb3V0ICs9IHJlbmRlcmVyLnRleHQodG9rZW4udGV4dCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgIGNvbnN0IGVyck1zZyA9ICdUb2tlbiB3aXRoIFwiJyArIHRva2VuLnR5cGUgKyAnXCIgdHlwZSB3YXMgbm90IGZvdW5kLic7XG4gICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5zaWxlbnQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyTXNnKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVyck1zZyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvdXQ7XG4gIH1cbn1cblxuLyoqXG4gKiBNYXJrZWRcbiAqL1xuZnVuY3Rpb24gbWFya2VkKHNyYywgb3B0LCBjYWxsYmFjaykge1xuICAvLyB0aHJvdyBlcnJvciBpbiBjYXNlIG9mIG5vbiBzdHJpbmcgaW5wdXRcbiAgaWYgKHR5cGVvZiBzcmMgPT09ICd1bmRlZmluZWQnIHx8IHNyYyA9PT0gbnVsbCkge1xuICAgIHRocm93IG5ldyBFcnJvcignbWFya2VkKCk6IGlucHV0IHBhcmFtZXRlciBpcyB1bmRlZmluZWQgb3IgbnVsbCcpO1xuICB9XG4gIGlmICh0eXBlb2Ygc3JjICE9PSAnc3RyaW5nJykge1xuICAgIHRocm93IG5ldyBFcnJvcignbWFya2VkKCk6IGlucHV0IHBhcmFtZXRlciBpcyBvZiB0eXBlICdcbiAgICAgICsgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHNyYykgKyAnLCBzdHJpbmcgZXhwZWN0ZWQnKTtcbiAgfVxuXG4gIGlmICh0eXBlb2Ygb3B0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgY2FsbGJhY2sgPSBvcHQ7XG4gICAgb3B0ID0gbnVsbDtcbiAgfVxuXG4gIG9wdCA9IG1lcmdlKHt9LCBtYXJrZWQuZGVmYXVsdHMsIG9wdCB8fCB7fSk7XG4gIGNoZWNrU2FuaXRpemVEZXByZWNhdGlvbihvcHQpO1xuXG4gIGlmIChjYWxsYmFjaykge1xuICAgIGNvbnN0IGhpZ2hsaWdodCA9IG9wdC5oaWdobGlnaHQ7XG4gICAgbGV0IHRva2VucztcblxuICAgIHRyeSB7XG4gICAgICB0b2tlbnMgPSBMZXhlci5sZXgoc3JjLCBvcHQpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBjYWxsYmFjayhlKTtcbiAgICB9XG5cbiAgICBjb25zdCBkb25lID0gZnVuY3Rpb24oZXJyKSB7XG4gICAgICBsZXQgb3V0O1xuXG4gICAgICBpZiAoIWVycikge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGlmIChvcHQud2Fsa1Rva2Vucykge1xuICAgICAgICAgICAgbWFya2VkLndhbGtUb2tlbnModG9rZW5zLCBvcHQud2Fsa1Rva2Vucyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIG91dCA9IFBhcnNlci5wYXJzZSh0b2tlbnMsIG9wdCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBlcnIgPSBlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIG9wdC5oaWdobGlnaHQgPSBoaWdobGlnaHQ7XG5cbiAgICAgIHJldHVybiBlcnJcbiAgICAgICAgPyBjYWxsYmFjayhlcnIpXG4gICAgICAgIDogY2FsbGJhY2sobnVsbCwgb3V0KTtcbiAgICB9O1xuXG4gICAgaWYgKCFoaWdobGlnaHQgfHwgaGlnaGxpZ2h0Lmxlbmd0aCA8IDMpIHtcbiAgICAgIHJldHVybiBkb25lKCk7XG4gICAgfVxuXG4gICAgZGVsZXRlIG9wdC5oaWdobGlnaHQ7XG5cbiAgICBpZiAoIXRva2Vucy5sZW5ndGgpIHJldHVybiBkb25lKCk7XG5cbiAgICBsZXQgcGVuZGluZyA9IDA7XG4gICAgbWFya2VkLndhbGtUb2tlbnModG9rZW5zLCBmdW5jdGlvbih0b2tlbikge1xuICAgICAgaWYgKHRva2VuLnR5cGUgPT09ICdjb2RlJykge1xuICAgICAgICBwZW5kaW5nKys7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIGhpZ2hsaWdodCh0b2tlbi50ZXh0LCB0b2tlbi5sYW5nLCBmdW5jdGlvbihlcnIsIGNvZGUpIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGRvbmUoZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChjb2RlICE9IG51bGwgJiYgY29kZSAhPT0gdG9rZW4udGV4dCkge1xuICAgICAgICAgICAgICB0b2tlbi50ZXh0ID0gY29kZTtcbiAgICAgICAgICAgICAgdG9rZW4uZXNjYXBlZCA9IHRydWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHBlbmRpbmctLTtcbiAgICAgICAgICAgIGlmIChwZW5kaW5nID09PSAwKSB7XG4gICAgICAgICAgICAgIGRvbmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSwgMCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAocGVuZGluZyA9PT0gMCkge1xuICAgICAgZG9uZSgpO1xuICAgIH1cblxuICAgIHJldHVybjtcbiAgfVxuXG4gIGZ1bmN0aW9uIG9uRXJyb3IoZSkge1xuICAgIGUubWVzc2FnZSArPSAnXFxuUGxlYXNlIHJlcG9ydCB0aGlzIHRvIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXJrZWRqcy9tYXJrZWQuJztcbiAgICBpZiAob3B0LnNpbGVudCkge1xuICAgICAgcmV0dXJuICc8cD5BbiBlcnJvciBvY2N1cnJlZDo8L3A+PHByZT4nXG4gICAgICAgICsgZXNjYXBlKGUubWVzc2FnZSArICcnLCB0cnVlKVxuICAgICAgICArICc8L3ByZT4nO1xuICAgIH1cbiAgICB0aHJvdyBlO1xuICB9XG5cbiAgdHJ5IHtcbiAgICBjb25zdCB0b2tlbnMgPSBMZXhlci5sZXgoc3JjLCBvcHQpO1xuICAgIGlmIChvcHQud2Fsa1Rva2Vucykge1xuICAgICAgaWYgKG9wdC5hc3luYykge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwobWFya2VkLndhbGtUb2tlbnModG9rZW5zLCBvcHQud2Fsa1Rva2VucykpXG4gICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIFBhcnNlci5wYXJzZSh0b2tlbnMsIG9wdCk7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAuY2F0Y2gob25FcnJvcik7XG4gICAgICB9XG4gICAgICBtYXJrZWQud2Fsa1Rva2Vucyh0b2tlbnMsIG9wdC53YWxrVG9rZW5zKTtcbiAgICB9XG4gICAgcmV0dXJuIFBhcnNlci5wYXJzZSh0b2tlbnMsIG9wdCk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBvbkVycm9yKGUpO1xuICB9XG59XG5cbi8qKlxuICogT3B0aW9uc1xuICovXG5cbm1hcmtlZC5vcHRpb25zID1cbm1hcmtlZC5zZXRPcHRpb25zID0gZnVuY3Rpb24ob3B0KSB7XG4gIG1lcmdlKG1hcmtlZC5kZWZhdWx0cywgb3B0KTtcbiAgY2hhbmdlRGVmYXVsdHMobWFya2VkLmRlZmF1bHRzKTtcbiAgcmV0dXJuIG1hcmtlZDtcbn07XG5cbm1hcmtlZC5nZXREZWZhdWx0cyA9IGdldERlZmF1bHRzO1xuXG5tYXJrZWQuZGVmYXVsdHMgPSBkZWZhdWx0cztcblxuLyoqXG4gKiBVc2UgRXh0ZW5zaW9uXG4gKi9cblxubWFya2VkLnVzZSA9IGZ1bmN0aW9uKC4uLmFyZ3MpIHtcbiAgY29uc3QgZXh0ZW5zaW9ucyA9IG1hcmtlZC5kZWZhdWx0cy5leHRlbnNpb25zIHx8IHsgcmVuZGVyZXJzOiB7fSwgY2hpbGRUb2tlbnM6IHt9IH07XG5cbiAgYXJncy5mb3JFYWNoKChwYWNrKSA9PiB7XG4gICAgLy8gY29weSBvcHRpb25zIHRvIG5ldyBvYmplY3RcbiAgICBjb25zdCBvcHRzID0gbWVyZ2Uoe30sIHBhY2spO1xuXG4gICAgLy8gc2V0IGFzeW5jIHRvIHRydWUgaWYgaXQgd2FzIHNldCB0byB0cnVlIGJlZm9yZVxuICAgIG9wdHMuYXN5bmMgPSBtYXJrZWQuZGVmYXVsdHMuYXN5bmMgfHwgb3B0cy5hc3luYztcblxuICAgIC8vID09LS0gUGFyc2UgXCJhZGRvblwiIGV4dGVuc2lvbnMgLS09PSAvL1xuICAgIGlmIChwYWNrLmV4dGVuc2lvbnMpIHtcbiAgICAgIHBhY2suZXh0ZW5zaW9ucy5mb3JFYWNoKChleHQpID0+IHtcbiAgICAgICAgaWYgKCFleHQubmFtZSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignZXh0ZW5zaW9uIG5hbWUgcmVxdWlyZWQnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZXh0LnJlbmRlcmVyKSB7IC8vIFJlbmRlcmVyIGV4dGVuc2lvbnNcbiAgICAgICAgICBjb25zdCBwcmV2UmVuZGVyZXIgPSBleHRlbnNpb25zLnJlbmRlcmVyc1tleHQubmFtZV07XG4gICAgICAgICAgaWYgKHByZXZSZW5kZXJlcikge1xuICAgICAgICAgICAgLy8gUmVwbGFjZSBleHRlbnNpb24gd2l0aCBmdW5jIHRvIHJ1biBuZXcgZXh0ZW5zaW9uIGJ1dCBmYWxsIGJhY2sgaWYgZmFsc2VcbiAgICAgICAgICAgIGV4dGVuc2lvbnMucmVuZGVyZXJzW2V4dC5uYW1lXSA9IGZ1bmN0aW9uKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgICAgbGV0IHJldCA9IGV4dC5yZW5kZXJlci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICAgICAgaWYgKHJldCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICByZXQgPSBwcmV2UmVuZGVyZXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIHJldDtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGV4dGVuc2lvbnMucmVuZGVyZXJzW2V4dC5uYW1lXSA9IGV4dC5yZW5kZXJlcjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGV4dC50b2tlbml6ZXIpIHsgLy8gVG9rZW5pemVyIEV4dGVuc2lvbnNcbiAgICAgICAgICBpZiAoIWV4dC5sZXZlbCB8fCAoZXh0LmxldmVsICE9PSAnYmxvY2snICYmIGV4dC5sZXZlbCAhPT0gJ2lubGluZScpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJleHRlbnNpb24gbGV2ZWwgbXVzdCBiZSAnYmxvY2snIG9yICdpbmxpbmUnXCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoZXh0ZW5zaW9uc1tleHQubGV2ZWxdKSB7XG4gICAgICAgICAgICBleHRlbnNpb25zW2V4dC5sZXZlbF0udW5zaGlmdChleHQudG9rZW5pemVyKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZXh0ZW5zaW9uc1tleHQubGV2ZWxdID0gW2V4dC50b2tlbml6ZXJdO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoZXh0LnN0YXJ0KSB7IC8vIEZ1bmN0aW9uIHRvIGNoZWNrIGZvciBzdGFydCBvZiB0b2tlblxuICAgICAgICAgICAgaWYgKGV4dC5sZXZlbCA9PT0gJ2Jsb2NrJykge1xuICAgICAgICAgICAgICBpZiAoZXh0ZW5zaW9ucy5zdGFydEJsb2NrKSB7XG4gICAgICAgICAgICAgICAgZXh0ZW5zaW9ucy5zdGFydEJsb2NrLnB1c2goZXh0LnN0YXJ0KTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBleHRlbnNpb25zLnN0YXJ0QmxvY2sgPSBbZXh0LnN0YXJ0XTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChleHQubGV2ZWwgPT09ICdpbmxpbmUnKSB7XG4gICAgICAgICAgICAgIGlmIChleHRlbnNpb25zLnN0YXJ0SW5saW5lKSB7XG4gICAgICAgICAgICAgICAgZXh0ZW5zaW9ucy5zdGFydElubGluZS5wdXNoKGV4dC5zdGFydCk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZXh0ZW5zaW9ucy5zdGFydElubGluZSA9IFtleHQuc3RhcnRdO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChleHQuY2hpbGRUb2tlbnMpIHsgLy8gQ2hpbGQgdG9rZW5zIHRvIGJlIHZpc2l0ZWQgYnkgd2Fsa1Rva2Vuc1xuICAgICAgICAgIGV4dGVuc2lvbnMuY2hpbGRUb2tlbnNbZXh0Lm5hbWVdID0gZXh0LmNoaWxkVG9rZW5zO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIG9wdHMuZXh0ZW5zaW9ucyA9IGV4dGVuc2lvbnM7XG4gICAgfVxuXG4gICAgLy8gPT0tLSBQYXJzZSBcIm92ZXJ3cml0ZVwiIGV4dGVuc2lvbnMgLS09PSAvL1xuICAgIGlmIChwYWNrLnJlbmRlcmVyKSB7XG4gICAgICBjb25zdCByZW5kZXJlciA9IG1hcmtlZC5kZWZhdWx0cy5yZW5kZXJlciB8fCBuZXcgUmVuZGVyZXIoKTtcbiAgICAgIGZvciAoY29uc3QgcHJvcCBpbiBwYWNrLnJlbmRlcmVyKSB7XG4gICAgICAgIGNvbnN0IHByZXZSZW5kZXJlciA9IHJlbmRlcmVyW3Byb3BdO1xuICAgICAgICAvLyBSZXBsYWNlIHJlbmRlcmVyIHdpdGggZnVuYyB0byBydW4gZXh0ZW5zaW9uLCBidXQgZmFsbCBiYWNrIGlmIGZhbHNlXG4gICAgICAgIHJlbmRlcmVyW3Byb3BdID0gKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgICBsZXQgcmV0ID0gcGFjay5yZW5kZXJlcltwcm9wXS5hcHBseShyZW5kZXJlciwgYXJncyk7XG4gICAgICAgICAgaWYgKHJldCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHJldCA9IHByZXZSZW5kZXJlci5hcHBseShyZW5kZXJlciwgYXJncyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiByZXQ7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBvcHRzLnJlbmRlcmVyID0gcmVuZGVyZXI7XG4gICAgfVxuICAgIGlmIChwYWNrLnRva2VuaXplcikge1xuICAgICAgY29uc3QgdG9rZW5pemVyID0gbWFya2VkLmRlZmF1bHRzLnRva2VuaXplciB8fCBuZXcgVG9rZW5pemVyKCk7XG4gICAgICBmb3IgKGNvbnN0IHByb3AgaW4gcGFjay50b2tlbml6ZXIpIHtcbiAgICAgICAgY29uc3QgcHJldlRva2VuaXplciA9IHRva2VuaXplcltwcm9wXTtcbiAgICAgICAgLy8gUmVwbGFjZSB0b2tlbml6ZXIgd2l0aCBmdW5jIHRvIHJ1biBleHRlbnNpb24sIGJ1dCBmYWxsIGJhY2sgaWYgZmFsc2VcbiAgICAgICAgdG9rZW5pemVyW3Byb3BdID0gKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgICBsZXQgcmV0ID0gcGFjay50b2tlbml6ZXJbcHJvcF0uYXBwbHkodG9rZW5pemVyLCBhcmdzKTtcbiAgICAgICAgICBpZiAocmV0ID09PSBmYWxzZSkge1xuICAgICAgICAgICAgcmV0ID0gcHJldlRva2VuaXplci5hcHBseSh0b2tlbml6ZXIsIGFyZ3MpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gcmV0O1xuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgb3B0cy50b2tlbml6ZXIgPSB0b2tlbml6ZXI7XG4gICAgfVxuXG4gICAgLy8gPT0tLSBQYXJzZSBXYWxrVG9rZW5zIGV4dGVuc2lvbnMgLS09PSAvL1xuICAgIGlmIChwYWNrLndhbGtUb2tlbnMpIHtcbiAgICAgIGNvbnN0IHdhbGtUb2tlbnMgPSBtYXJrZWQuZGVmYXVsdHMud2Fsa1Rva2VucztcbiAgICAgIG9wdHMud2Fsa1Rva2VucyA9IGZ1bmN0aW9uKHRva2VuKSB7XG4gICAgICAgIGxldCB2YWx1ZXMgPSBbXTtcbiAgICAgICAgdmFsdWVzLnB1c2gocGFjay53YWxrVG9rZW5zLmNhbGwodGhpcywgdG9rZW4pKTtcbiAgICAgICAgaWYgKHdhbGtUb2tlbnMpIHtcbiAgICAgICAgICB2YWx1ZXMgPSB2YWx1ZXMuY29uY2F0KHdhbGtUb2tlbnMuY2FsbCh0aGlzLCB0b2tlbikpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2YWx1ZXM7XG4gICAgICB9O1xuICAgIH1cblxuICAgIG1hcmtlZC5zZXRPcHRpb25zKG9wdHMpO1xuICB9KTtcbn07XG5cbi8qKlxuICogUnVuIGNhbGxiYWNrIGZvciBldmVyeSB0b2tlblxuICovXG5cbm1hcmtlZC53YWxrVG9rZW5zID0gZnVuY3Rpb24odG9rZW5zLCBjYWxsYmFjaykge1xuICBsZXQgdmFsdWVzID0gW107XG4gIGZvciAoY29uc3QgdG9rZW4gb2YgdG9rZW5zKSB7XG4gICAgdmFsdWVzID0gdmFsdWVzLmNvbmNhdChjYWxsYmFjay5jYWxsKG1hcmtlZCwgdG9rZW4pKTtcbiAgICBzd2l0Y2ggKHRva2VuLnR5cGUpIHtcbiAgICAgIGNhc2UgJ3RhYmxlJzoge1xuICAgICAgICBmb3IgKGNvbnN0IGNlbGwgb2YgdG9rZW4uaGVhZGVyKSB7XG4gICAgICAgICAgdmFsdWVzID0gdmFsdWVzLmNvbmNhdChtYXJrZWQud2Fsa1Rva2VucyhjZWxsLnRva2VucywgY2FsbGJhY2spKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IHJvdyBvZiB0b2tlbi5yb3dzKSB7XG4gICAgICAgICAgZm9yIChjb25zdCBjZWxsIG9mIHJvdykge1xuICAgICAgICAgICAgdmFsdWVzID0gdmFsdWVzLmNvbmNhdChtYXJrZWQud2Fsa1Rva2VucyhjZWxsLnRva2VucywgY2FsbGJhY2spKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjYXNlICdsaXN0Jzoge1xuICAgICAgICB2YWx1ZXMgPSB2YWx1ZXMuY29uY2F0KG1hcmtlZC53YWxrVG9rZW5zKHRva2VuLml0ZW1zLCBjYWxsYmFjaykpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgaWYgKG1hcmtlZC5kZWZhdWx0cy5leHRlbnNpb25zICYmIG1hcmtlZC5kZWZhdWx0cy5leHRlbnNpb25zLmNoaWxkVG9rZW5zICYmIG1hcmtlZC5kZWZhdWx0cy5leHRlbnNpb25zLmNoaWxkVG9rZW5zW3Rva2VuLnR5cGVdKSB7IC8vIFdhbGsgYW55IGV4dGVuc2lvbnNcbiAgICAgICAgICBtYXJrZWQuZGVmYXVsdHMuZXh0ZW5zaW9ucy5jaGlsZFRva2Vuc1t0b2tlbi50eXBlXS5mb3JFYWNoKGZ1bmN0aW9uKGNoaWxkVG9rZW5zKSB7XG4gICAgICAgICAgICB2YWx1ZXMgPSB2YWx1ZXMuY29uY2F0KG1hcmtlZC53YWxrVG9rZW5zKHRva2VuW2NoaWxkVG9rZW5zXSwgY2FsbGJhY2spKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIGlmICh0b2tlbi50b2tlbnMpIHtcbiAgICAgICAgICB2YWx1ZXMgPSB2YWx1ZXMuY29uY2F0KG1hcmtlZC53YWxrVG9rZW5zKHRva2VuLnRva2VucywgY2FsbGJhY2spKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gdmFsdWVzO1xufTtcblxuLyoqXG4gKiBQYXJzZSBJbmxpbmVcbiAqIEBwYXJhbSB7c3RyaW5nfSBzcmNcbiAqL1xubWFya2VkLnBhcnNlSW5saW5lID0gZnVuY3Rpb24oc3JjLCBvcHQpIHtcbiAgLy8gdGhyb3cgZXJyb3IgaW4gY2FzZSBvZiBub24gc3RyaW5nIGlucHV0XG4gIGlmICh0eXBlb2Ygc3JjID09PSAndW5kZWZpbmVkJyB8fCBzcmMgPT09IG51bGwpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ21hcmtlZC5wYXJzZUlubGluZSgpOiBpbnB1dCBwYXJhbWV0ZXIgaXMgdW5kZWZpbmVkIG9yIG51bGwnKTtcbiAgfVxuICBpZiAodHlwZW9mIHNyYyAhPT0gJ3N0cmluZycpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ21hcmtlZC5wYXJzZUlubGluZSgpOiBpbnB1dCBwYXJhbWV0ZXIgaXMgb2YgdHlwZSAnXG4gICAgICArIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChzcmMpICsgJywgc3RyaW5nIGV4cGVjdGVkJyk7XG4gIH1cblxuICBvcHQgPSBtZXJnZSh7fSwgbWFya2VkLmRlZmF1bHRzLCBvcHQgfHwge30pO1xuICBjaGVja1Nhbml0aXplRGVwcmVjYXRpb24ob3B0KTtcblxuICB0cnkge1xuICAgIGNvbnN0IHRva2VucyA9IExleGVyLmxleElubGluZShzcmMsIG9wdCk7XG4gICAgaWYgKG9wdC53YWxrVG9rZW5zKSB7XG4gICAgICBtYXJrZWQud2Fsa1Rva2Vucyh0b2tlbnMsIG9wdC53YWxrVG9rZW5zKTtcbiAgICB9XG4gICAgcmV0dXJuIFBhcnNlci5wYXJzZUlubGluZSh0b2tlbnMsIG9wdCk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBlLm1lc3NhZ2UgKz0gJ1xcblBsZWFzZSByZXBvcnQgdGhpcyB0byBodHRwczovL2dpdGh1Yi5jb20vbWFya2VkanMvbWFya2VkLic7XG4gICAgaWYgKG9wdC5zaWxlbnQpIHtcbiAgICAgIHJldHVybiAnPHA+QW4gZXJyb3Igb2NjdXJyZWQ6PC9wPjxwcmU+J1xuICAgICAgICArIGVzY2FwZShlLm1lc3NhZ2UgKyAnJywgdHJ1ZSlcbiAgICAgICAgKyAnPC9wcmU+JztcbiAgICB9XG4gICAgdGhyb3cgZTtcbiAgfVxufTtcblxuLyoqXG4gKiBFeHBvc2VcbiAqL1xubWFya2VkLlBhcnNlciA9IFBhcnNlcjtcbm1hcmtlZC5wYXJzZXIgPSBQYXJzZXIucGFyc2U7XG5tYXJrZWQuUmVuZGVyZXIgPSBSZW5kZXJlcjtcbm1hcmtlZC5UZXh0UmVuZGVyZXIgPSBUZXh0UmVuZGVyZXI7XG5tYXJrZWQuTGV4ZXIgPSBMZXhlcjtcbm1hcmtlZC5sZXhlciA9IExleGVyLmxleDtcbm1hcmtlZC5Ub2tlbml6ZXIgPSBUb2tlbml6ZXI7XG5tYXJrZWQuU2x1Z2dlciA9IFNsdWdnZXI7XG5tYXJrZWQucGFyc2UgPSBtYXJrZWQ7XG5cbmNvbnN0IG9wdGlvbnMgPSBtYXJrZWQub3B0aW9ucztcbmNvbnN0IHNldE9wdGlvbnMgPSBtYXJrZWQuc2V0T3B0aW9ucztcbmNvbnN0IHVzZSA9IG1hcmtlZC51c2U7XG5jb25zdCB3YWxrVG9rZW5zID0gbWFya2VkLndhbGtUb2tlbnM7XG5jb25zdCBwYXJzZUlubGluZSA9IG1hcmtlZC5wYXJzZUlubGluZTtcbmNvbnN0IHBhcnNlID0gbWFya2VkO1xuY29uc3QgcGFyc2VyID0gUGFyc2VyLnBhcnNlO1xuY29uc3QgbGV4ZXIgPSBMZXhlci5sZXg7XG5cbmV4cG9ydCB7IExleGVyLCBQYXJzZXIsIFJlbmRlcmVyLCBTbHVnZ2VyLCBUZXh0UmVuZGVyZXIsIFRva2VuaXplciwgZGVmYXVsdHMsIGdldERlZmF1bHRzLCBsZXhlciwgbWFya2VkLCBvcHRpb25zLCBwYXJzZSwgcGFyc2VJbmxpbmUsIHBhcnNlciwgc2V0T3B0aW9ucywgdXNlLCB3YWxrVG9rZW5zIH07XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgZGVmaW5pdGlvbikge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmosIHByb3ApIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApOyB9IiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJ2YXIgX19hc3NpZ24gPSAodGhpcyAmJiB0aGlzLl9fYXNzaWduKSB8fCBmdW5jdGlvbiAoKSB7XG4gICAgX19hc3NpZ24gPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uKHQpIHtcbiAgICAgICAgZm9yICh2YXIgcywgaSA9IDEsIG4gPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbjsgaSsrKSB7XG4gICAgICAgICAgICBzID0gYXJndW1lbnRzW2ldO1xuICAgICAgICAgICAgZm9yICh2YXIgcCBpbiBzKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHMsIHApKVxuICAgICAgICAgICAgICAgIHRbcF0gPSBzW3BdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0O1xuICAgIH07XG4gICAgcmV0dXJuIF9fYXNzaWduLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59O1xudmFyIF9fYXdhaXRlciA9ICh0aGlzICYmIHRoaXMuX19hd2FpdGVyKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogYWRvcHQocmVzdWx0LnZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcbiAgICB9KTtcbn07XG52YXIgX19nZW5lcmF0b3IgPSAodGhpcyAmJiB0aGlzLl9fZ2VuZXJhdG9yKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgYm9keSkge1xuICAgIHZhciBfID0geyBsYWJlbDogMCwgc2VudDogZnVuY3Rpb24oKSB7IGlmICh0WzBdICYgMSkgdGhyb3cgdFsxXTsgcmV0dXJuIHRbMV07IH0sIHRyeXM6IFtdLCBvcHM6IFtdIH0sIGYsIHksIHQsIGc7XG4gICAgcmV0dXJuIGcgPSB7IG5leHQ6IHZlcmIoMCksIFwidGhyb3dcIjogdmVyYigxKSwgXCJyZXR1cm5cIjogdmVyYigyKSB9LCB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgKGdbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpczsgfSksIGc7XG4gICAgZnVuY3Rpb24gdmVyYihuKSB7IHJldHVybiBmdW5jdGlvbiAodikgeyByZXR1cm4gc3RlcChbbiwgdl0pOyB9OyB9XG4gICAgZnVuY3Rpb24gc3RlcChvcCkge1xuICAgICAgICBpZiAoZikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkdlbmVyYXRvciBpcyBhbHJlYWR5IGV4ZWN1dGluZy5cIik7XG4gICAgICAgIHdoaWxlIChnICYmIChnID0gMCwgb3BbMF0gJiYgKF8gPSAwKSksIF8pIHRyeSB7XG4gICAgICAgICAgICBpZiAoZiA9IDEsIHkgJiYgKHQgPSBvcFswXSAmIDIgPyB5W1wicmV0dXJuXCJdIDogb3BbMF0gPyB5W1widGhyb3dcIl0gfHwgKCh0ID0geVtcInJldHVyblwiXSkgJiYgdC5jYWxsKHkpLCAwKSA6IHkubmV4dCkgJiYgISh0ID0gdC5jYWxsKHksIG9wWzFdKSkuZG9uZSkgcmV0dXJuIHQ7XG4gICAgICAgICAgICBpZiAoeSA9IDAsIHQpIG9wID0gW29wWzBdICYgMiwgdC52YWx1ZV07XG4gICAgICAgICAgICBzd2l0Y2ggKG9wWzBdKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAwOiBjYXNlIDE6IHQgPSBvcDsgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSA0OiBfLmxhYmVsKys7IHJldHVybiB7IHZhbHVlOiBvcFsxXSwgZG9uZTogZmFsc2UgfTtcbiAgICAgICAgICAgICAgICBjYXNlIDU6IF8ubGFiZWwrKzsgeSA9IG9wWzFdOyBvcCA9IFswXTsgY29udGludWU7XG4gICAgICAgICAgICAgICAgY2FzZSA3OiBvcCA9IF8ub3BzLnBvcCgpOyBfLnRyeXMucG9wKCk7IGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIGlmICghKHQgPSBfLnRyeXMsIHQgPSB0Lmxlbmd0aCA+IDAgJiYgdFt0Lmxlbmd0aCAtIDFdKSAmJiAob3BbMF0gPT09IDYgfHwgb3BbMF0gPT09IDIpKSB7IF8gPSAwOyBjb250aW51ZTsgfVxuICAgICAgICAgICAgICAgICAgICBpZiAob3BbMF0gPT09IDMgJiYgKCF0IHx8IChvcFsxXSA+IHRbMF0gJiYgb3BbMV0gPCB0WzNdKSkpIHsgXy5sYWJlbCA9IG9wWzFdOyBicmVhazsgfVxuICAgICAgICAgICAgICAgICAgICBpZiAob3BbMF0gPT09IDYgJiYgXy5sYWJlbCA8IHRbMV0pIHsgXy5sYWJlbCA9IHRbMV07IHQgPSBvcDsgYnJlYWs7IH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHQgJiYgXy5sYWJlbCA8IHRbMl0pIHsgXy5sYWJlbCA9IHRbMl07IF8ub3BzLnB1c2gob3ApOyBicmVhazsgfVxuICAgICAgICAgICAgICAgICAgICBpZiAodFsyXSkgXy5vcHMucG9wKCk7XG4gICAgICAgICAgICAgICAgICAgIF8udHJ5cy5wb3AoKTsgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvcCA9IGJvZHkuY2FsbCh0aGlzQXJnLCBfKTtcbiAgICAgICAgfSBjYXRjaCAoZSkgeyBvcCA9IFs2LCBlXTsgeSA9IDA7IH0gZmluYWxseSB7IGYgPSB0ID0gMDsgfVxuICAgICAgICBpZiAob3BbMF0gJiA1KSB0aHJvdyBvcFsxXTsgcmV0dXJuIHsgdmFsdWU6IG9wWzBdID8gb3BbMV0gOiB2b2lkIDAsIGRvbmU6IHRydWUgfTtcbiAgICB9XG59O1xuaW1wb3J0IHsgaXNfdmFsaWRfaW1hZ2VfdXJsLCBpc192YWxpZF95b3V0dWJlLCBtYXJrZG93biB9IGZyb20gXCIuL3BhcnNlX3V0aWxzXCI7XG5pbXBvcnQgeyBjbGlwLCBsYXN0Q2xpcCB9IGZyb20gXCIuL2hvdGtleVwiO1xuaW1wb3J0IHsgZ2V0X2hlcm8gfSBmcm9tIFwiLi91dGlsaXRpZXNcIjtcbmltcG9ydCB7IHJlbmRlckxlZGdlciB9IGZyb20gXCIuL2xlZGdlclwiO1xuaW1wb3J0IHsgbWVyZ2VVc2VyIH0gZnJvbSBcIi4vbWVyZ2VcIjtcbmltcG9ydCB7IGdldF9yZXNlYXJjaF90ZXh0IH0gZnJvbSBcIi4vY2hhdFwiO1xudmFyIFNBVF9WRVJTSU9OID0gXCIyLjI4LjAwNS1naXRcIjtcbi8vVE9ETzogT3JnYW5pemUgdHlwZXNjcmlwdCB0byBhbiBpbnRlcmZhY2VzIGRpcmVjdG9yeVxuLy9UT0RPOiBUaGVuIG1ha2Ugb3RoZXIgZ2FtZSBlbmdpbmUgb2JqZWN0c1xuLy8gUGFydCBvZiB5b3VyIGNvZGUgaXMgcmUtY3JlYXRpbmcgdGhlIGdhbWUgaW4gdHlwZXNjcmlwdFxuLy8gVGhlIG90aGVyIHBhcnQgaXMgYWRkaW5nIGZlYXR1cmVzXG4vLyBUaGVuIHRoZXJlIGlzIGEgc2VnbWVudCB0aGF0IGlzIG92ZXJ3cml0aW5nIGV4aXN0aW5nIGNvbnRlbnQgdG8gYWRkIHNtYWxsIGFkZGl0aW9ucy5cbi8vQWRkIGN1c3RvbSBzZXR0aW5ncyB3aGVuIG1ha2luZyBhIG53ZSBnYW1lLlxuZnVuY3Rpb24gbW9kaWZ5X2N1c3RvbV9nYW1lKCkge1xuICAgIGNvbnNvbGUubG9nKFwiUnVubmluZyBjdXN0b20gZ2FtZSBzZXR0aW5ncyBtb2RpZmljYXRpb25cIik7XG4gICAgdmFyIHNlbGVjdG9yID0gJChcIiNjb250ZW50QXJlYSA+IGRpdiA+IGRpdi53aWRnZXQuZnVsbHNjcmVlbiA+IGRpdi53aWRnZXQucmVsID4gZGl2Om50aC1jaGlsZCg0KSA+IGRpdjpudGgtY2hpbGQoMTUpID4gc2VsZWN0XCIpWzBdO1xuICAgIGlmIChzZWxlY3RvciA9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgLy9Ob3QgaW4gbWVudVxuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0ZXh0U3RyaW5nID0gXCJcIjtcbiAgICBmb3IgKHZhciBpID0gMjsgaSA8PSAzMjsgKytpKSB7XG4gICAgICAgIHRleHRTdHJpbmcgKz0gXCI8b3B0aW9uIHZhbHVlPVxcXCJcIi5jb25jYXQoaSwgXCJcXFwiPlwiKS5jb25jYXQoaSwgXCIgUGxheWVyczwvb3B0aW9uPlwiKTtcbiAgICB9XG4gICAgY29uc29sZS5sb2codGV4dFN0cmluZyk7XG4gICAgc2VsZWN0b3IuaW5uZXJIVE1MID0gdGV4dFN0cmluZztcbn1cbnNldFRpbWVvdXQobW9kaWZ5X2N1c3RvbV9nYW1lLCA1MDApO1xuLy9UT0RPOiBNYWtlIGlzIHdpdGhpbiBzY2FubmluZyBmdW5jdGlvblxuLy9TaGFyZSBhbGwgdGVjaCBkaXNwbGF5IGFzIHRlY2ggaXMgYWN0aXZlbHkgdHJhZGluZy5cbnZhciBkaXNwbGF5X3RlY2hfdHJhZGluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgbnB1aSA9IE5lcHR1bmVzUHJpZGUubnB1aTtcbiAgICB2YXIgdGVjaF90cmFkZV9zY3JlZW4gPSBucHVpLlNjcmVlbihcInRlY2hfdHJhZGluZ1wiKTtcbiAgICBucHVpLm9uSGlkZVNjcmVlbihudWxsLCB0cnVlKTtcbiAgICBucHVpLm9uSGlkZVNlbGVjdGlvbk1lbnUoKTtcbiAgICBucHVpLnRyaWdnZXIoXCJoaWRlX3NpZGVfbWVudVwiKTtcbiAgICBucHVpLnRyaWdnZXIoXCJyZXNldF9lZGl0X21vZGVcIik7XG4gICAgbnB1aS5hY3RpdmVTY3JlZW4gPSB0ZWNoX3RyYWRlX3NjcmVlbjtcbiAgICB0ZWNoX3RyYWRlX3NjcmVlbi5yb29zdChucHVpLnNjcmVlbkNvbnRhaW5lcik7XG4gICAgbnB1aS5sYXlvdXRFbGVtZW50KHRlY2hfdHJhZGVfc2NyZWVuKTtcbiAgICB2YXIgdHJhZGluZyA9IENydXguVGV4dChcIlwiLCBcInJlbCBwYWQxMlwiKS5yYXdIVE1MKFwiVHJhZGluZy4uXCIpO1xuICAgIHRyYWRpbmcucm9vc3QodGVjaF90cmFkZV9zY3JlZW4pO1xuICAgIHRlY2hfdHJhZGVfc2NyZWVuLnRyYW5zYWN0ID0gZnVuY3Rpb24gKHRleHQpIHtcbiAgICAgICAgdmFyIHRyYWRpbmcgPSBDcnV4LlRleHQoXCJcIiwgXCJyZWwgcGFkOFwiKS5yYXdIVE1MKHRleHQpO1xuICAgICAgICB0cmFkaW5nLnJvb3N0KHRlY2hfdHJhZGVfc2NyZWVuKTtcbiAgICB9O1xuICAgIHJldHVybiB0ZWNoX3RyYWRlX3NjcmVlbjtcbn07XG4vL1JldHVybnMgYWxsIHN0YXJzIEkgc3VwcG9zZVxudmFyIF9nZXRfc3Rhcl9naXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHN0YXJzID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5nYWxheHkuc3RhcnM7XG4gICAgdmFyIG91dHB1dCA9IFtdO1xuICAgIGZvciAodmFyIHMgaW4gc3RhcnMpIHtcbiAgICAgICAgdmFyIHN0YXIgPSBzdGFyc1tzXTtcbiAgICAgICAgb3V0cHV0LnB1c2goe1xuICAgICAgICAgICAgeDogc3Rhci54LFxuICAgICAgICAgICAgeTogc3Rhci55LFxuICAgICAgICAgICAgb3duZXI6IHN0YXIucXVhbGlmaWVkQWxpYXMsXG4gICAgICAgICAgICBlY29ub215OiBzdGFyLmUsXG4gICAgICAgICAgICBpbmR1c3RyeTogc3Rhci5pLFxuICAgICAgICAgICAgc2NpZW5jZTogc3Rhci5zLFxuICAgICAgICAgICAgc2hpcHM6IHN0YXIudG90YWxEZWZlbnNlcyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBvdXRwdXQ7XG59O1xudmFyIF9nZXRfd2VhcG9uc19uZXh0ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciByZXNlYXJjaCA9IGdldF9yZXNlYXJjaCgpO1xuICAgIGlmIChyZXNlYXJjaFtcImN1cnJlbnRfbmFtZVwiXSA9PSBcIldlYXBvbnNcIikge1xuICAgICAgICByZXR1cm4gcmVzZWFyY2hbXCJjdXJyZW50X2V0YVwiXTtcbiAgICB9XG4gICAgZWxzZSBpZiAocmVzZWFyY2hbXCJuZXh0X25hbWVcIl0gPT0gXCJXZWFwb25zXCIpIHtcbiAgICAgICAgcmV0dXJuIHJlc2VhcmNoW1wibmV4dF9ldGFcIl07XG4gICAgfVxuICAgIHJldHVybiBNYXRoLnBvdygxMCwgMTApO1xufTtcbnZhciBnZXRfdGVjaF90cmFkZV9jb3N0ID0gZnVuY3Rpb24gKGZyb20sIHRvLCB0ZWNoX25hbWUpIHtcbiAgICBpZiAodGVjaF9uYW1lID09PSB2b2lkIDApIHsgdGVjaF9uYW1lID0gbnVsbDsgfVxuICAgIHZhciB0b3RhbF9jb3N0ID0gMDtcbiAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gT2JqZWN0LmVudHJpZXModG8udGVjaCk7IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgIHZhciBfYiA9IF9hW19pXSwgdGVjaCA9IF9iWzBdLCB2YWx1ZSA9IF9iWzFdO1xuICAgICAgICBpZiAodGVjaF9uYW1lID09IG51bGwgfHwgdGVjaF9uYW1lID09IHRlY2gpIHtcbiAgICAgICAgICAgIHZhciBtZSA9IGZyb20udGVjaFt0ZWNoXS5sZXZlbDtcbiAgICAgICAgICAgIHZhciB5b3UgPSB2YWx1ZS5sZXZlbDtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDw9IG1lIC0geW91OyArK2kpIHtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKHRlY2gsKHlvdStpKSwoeW91K2kpKjE1KVxuICAgICAgICAgICAgICAgIHRvdGFsX2Nvc3QgKz0gKHlvdSArIGkpICogTmVwdHVuZXNQcmlkZS5nYW1lQ29uZmlnLnRyYWRlQ29zdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdG90YWxfY29zdDtcbn07XG4vL0hvb2tzIHRvIGJ1dHRvbnMgZm9yIHNoYXJpbmcgYW5kIGJ1eWluZ1xuLy9QcmV0dHkgc2ltcGxlIGhvb2tzIHRoYXQgY2FuIGJlIGFkZGVkIHRvIGEgdHlwZXNjcmlwdCBmaWxlLlxudmFyIGFwcGx5X2hvb2tzID0gZnVuY3Rpb24gKCkge1xuICAgIE5lcHR1bmVzUHJpZGUubnAub24oXCJzaGFyZV9hbGxfdGVjaFwiLCBmdW5jdGlvbiAoZXZlbnQsIHBsYXllcikge1xuICAgICAgICB2YXIgdG90YWxfY29zdCA9IGdldF90ZWNoX3RyYWRlX2Nvc3QoZ2V0X2hlcm8oTmVwdHVuZXNQcmlkZS51bml2ZXJzZSksIHBsYXllcik7XG4gICAgICAgIE5lcHR1bmVzUHJpZGUudGVtcGxhdGVzW1wiY29uZmlybV90ZWNoX3NoYXJlX1wiLmNvbmNhdChwbGF5ZXIudWlkKV0gPSBcIkFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBzcGVuZCAkXCIuY29uY2F0KHRvdGFsX2Nvc3QsIFwiIHRvIGdpdmUgXCIpLmNvbmNhdChwbGF5ZXIucmF3QWxpYXMsIFwiIGFsbCBvZiB5b3VyIHRlY2g/XCIpO1xuICAgICAgICBOZXB0dW5lc1ByaWRlLm5wLnRyaWdnZXIoXCJzaG93X3NjcmVlblwiLCBbXG4gICAgICAgICAgICBcImNvbmZpcm1cIixcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBcImNvbmZpcm1fdGVjaF9zaGFyZV9cIi5jb25jYXQocGxheWVyLnVpZCksXG4gICAgICAgICAgICAgICAgZXZlbnRLaW5kOiBcImNvbmZpcm1fdHJhZGVfdGVjaFwiLFxuICAgICAgICAgICAgICAgIGV2ZW50RGF0YTogcGxheWVyLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgXSk7XG4gICAgfSk7XG4gICAgTmVwdHVuZXNQcmlkZS5ucC5vbihcImJ1eV9hbGxfdGVjaFwiLCBmdW5jdGlvbiAoZXZlbnQsIGRhdGEpIHtcbiAgICAgICAgdmFyIHBsYXllciA9IGRhdGEucGxheWVyO1xuICAgICAgICB2YXIgY29zdCA9IGRhdGEuY29zdDtcbiAgICAgICAgTmVwdHVuZXNQcmlkZS50ZW1wbGF0ZXNbXCJjb25maXJtX3RlY2hfc2hhcmVfXCIuY29uY2F0KHBsYXllci51aWQpXSA9IFwiQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIHNwZW5kICRcIi5jb25jYXQoY29zdCwgXCIgdG8gYnV5IGFsbCBvZiBcIikuY29uY2F0KHBsYXllci5yYXdBbGlhcywgXCIncyB0ZWNoPyBJdCBpcyB1cCB0byB0aGVtIHRvIGFjdHVhbGx5IHNlbmQgaXQgdG8geW91LlwiKTtcbiAgICAgICAgTmVwdHVuZXNQcmlkZS5ucC50cmlnZ2VyKFwic2hvd19zY3JlZW5cIiwgW1xuICAgICAgICAgICAgXCJjb25maXJtXCIsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZTogXCJjb25maXJtX3RlY2hfc2hhcmVfXCIuY29uY2F0KHBsYXllci51aWQpLFxuICAgICAgICAgICAgICAgIGV2ZW50S2luZDogXCJjb25maXJtX2J1eV90ZWNoXCIsXG4gICAgICAgICAgICAgICAgZXZlbnREYXRhOiBkYXRhLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgXSk7XG4gICAgfSk7XG4gICAgTmVwdHVuZXNQcmlkZS5ucC5vbihcImJ1eV9vbmVfdGVjaFwiLCBmdW5jdGlvbiAoZXZlbnQsIGRhdGEpIHtcbiAgICAgICAgdmFyIHBsYXllciA9IGRhdGEucGxheWVyO1xuICAgICAgICB2YXIgdGVjaCA9IGRhdGEudGVjaDtcbiAgICAgICAgdmFyIGNvc3QgPSBkYXRhLmNvc3Q7XG4gICAgICAgIGNvbnNvbGUubG9nKHBsYXllcik7XG4gICAgICAgIE5lcHR1bmVzUHJpZGUudGVtcGxhdGVzW1wiY29uZmlybV90ZWNoX3NoYXJlX1wiLmNvbmNhdChwbGF5ZXIudWlkKV0gPSBcIkFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBzcGVuZCAkXCIuY29uY2F0KGNvc3QsIFwiIHRvIGJ1eSBcIikuY29uY2F0KHRlY2gsIFwiIGZyb20gXCIpLmNvbmNhdChwbGF5ZXIucmF3QWxpYXMsIFwiPyBJdCBpcyB1cCB0byB0aGVtIHRvIGFjdHVhbGx5IHNlbmQgaXQgdG8geW91LlwiKTtcbiAgICAgICAgTmVwdHVuZXNQcmlkZS5ucC50cmlnZ2VyKFwic2hvd19zY3JlZW5cIiwgW1xuICAgICAgICAgICAgXCJjb25maXJtXCIsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZTogXCJjb25maXJtX3RlY2hfc2hhcmVfXCIuY29uY2F0KHBsYXllci51aWQpLFxuICAgICAgICAgICAgICAgIGV2ZW50S2luZDogXCJjb25maXJtX2J1eV90ZWNoXCIsXG4gICAgICAgICAgICAgICAgZXZlbnREYXRhOiBkYXRhLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgXSk7XG4gICAgfSk7XG4gICAgTmVwdHVuZXNQcmlkZS5ucC5vbihcImNvbmZpcm1fdHJhZGVfdGVjaFwiLCBmdW5jdGlvbiAoZXZlbiwgcGxheWVyKSB7XG4gICAgICAgIHZhciBoZXJvID0gZ2V0X2hlcm8oTmVwdHVuZXNQcmlkZS51bml2ZXJzZSk7XG4gICAgICAgIHZhciBkaXNwbGF5ID0gZGlzcGxheV90ZWNoX3RyYWRpbmcoKTtcbiAgICAgICAgdmFyIGNsb3NlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5zZWxlY3RQbGF5ZXIocGxheWVyKTtcbiAgICAgICAgICAgIE5lcHR1bmVzUHJpZGUubnAudHJpZ2dlcihcInJlZnJlc2hfaW50ZXJmYWNlXCIpO1xuICAgICAgICAgICAgTmVwdHVuZXNQcmlkZS5ucC5ucHVpLnJlZnJlc2hUdXJuTWFuYWdlcigpO1xuICAgICAgICB9O1xuICAgICAgICB2YXIgb2Zmc2V0ID0gMzAwO1xuICAgICAgICB2YXIgX2xvb3BfMSA9IGZ1bmN0aW9uICh0ZWNoLCB2YWx1ZSkge1xuICAgICAgICAgICAgdmFyIG1lID0gaGVyby50ZWNoW3RlY2hdLmxldmVsO1xuICAgICAgICAgICAgdmFyIHlvdSA9IHZhbHVlLmxldmVsO1xuICAgICAgICAgICAgdmFyIF9sb29wXzIgPSBmdW5jdGlvbiAoaSkge1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhtZSAtIHlvdSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJvcmRlclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgb3JkZXI6IFwic2hhcmVfdGVjaCxcIi5jb25jYXQocGxheWVyLnVpZCwgXCIsXCIpLmNvbmNhdCh0ZWNoKSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXkudHJhbnNhY3QoXCJTZW5kaW5nIFwiLmNvbmNhdCh0ZWNoLCBcIiBsZXZlbCBcIikuY29uY2F0KHlvdSArIGkpKTtcbiAgICAgICAgICAgICAgICAgICAgTmVwdHVuZXNQcmlkZS5ucC50cmlnZ2VyKFwic2VydmVyX3JlcXVlc3RcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJvcmRlclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgb3JkZXI6IFwic2hhcmVfdGVjaCxcIi5jb25jYXQocGxheWVyLnVpZCwgXCIsXCIpLmNvbmNhdCh0ZWNoKSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpID09IG1lIC0geW91KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5LnRyYW5zYWN0KFwiRG9uZS5cIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCBvZmZzZXQpO1xuICAgICAgICAgICAgICAgIG9mZnNldCArPSAxMDAwO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDw9IG1lIC0geW91OyArK2kpIHtcbiAgICAgICAgICAgICAgICBfbG9vcF8yKGkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gT2JqZWN0LmVudHJpZXMocGxheWVyLnRlY2gpOyBfaSA8IF9hLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgdmFyIF9iID0gX2FbX2ldLCB0ZWNoID0gX2JbMF0sIHZhbHVlID0gX2JbMV07XG4gICAgICAgICAgICBfbG9vcF8xKHRlY2gsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBzZXRUaW1lb3V0KGNsb3NlLCBvZmZzZXQgKyAxMDAwKTtcbiAgICB9KTtcbiAgICAvL1BheXMgYSBwbGF5ZXIgYSBjZXJ0YWluIGFtb3VudFxuICAgIE5lcHR1bmVzUHJpZGUubnAub24oXCJjb25maXJtX2J1eV90ZWNoXCIsIGZ1bmN0aW9uIChldmVuLCBkYXRhKSB7XG4gICAgICAgIHZhciBwbGF5ZXIgPSBkYXRhLnBsYXllcjtcbiAgICAgICAgTmVwdHVuZXNQcmlkZS5ucC50cmlnZ2VyKFwic2VydmVyX3JlcXVlc3RcIiwge1xuICAgICAgICAgICAgdHlwZTogXCJvcmRlclwiLFxuICAgICAgICAgICAgb3JkZXI6IFwic2VuZF9tb25leSxcIi5jb25jYXQocGxheWVyLnVpZCwgXCIsXCIpLmNvbmNhdChkYXRhLmNvc3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5zZWxlY3RQbGF5ZXIocGxheWVyKTtcbiAgICAgICAgTmVwdHVuZXNQcmlkZS5ucC50cmlnZ2VyKFwicmVmcmVzaF9pbnRlcmZhY2VcIik7XG4gICAgfSk7XG59O1xudmFyIF93aWRlX3ZpZXcgPSBmdW5jdGlvbiAoKSB7XG4gICAgTmVwdHVuZXNQcmlkZS5ucC50cmlnZ2VyKFwibWFwX2NlbnRlcl9zbGlkZVwiLCB7IHg6IDAsIHk6IDAgfSk7XG4gICAgTmVwdHVuZXNQcmlkZS5ucC50cmlnZ2VyKFwiem9vbV9taW5pbWFwXCIpO1xufTtcbmZ1bmN0aW9uIExlZ2FjeV9OZXB0dW5lc1ByaWRlQWdlbnQoKSB7XG4gICAgdmFyIF9hLCBfYjtcbiAgICB2YXIgdGl0bGUgPSAoKF9hID0gZG9jdW1lbnQgPT09IG51bGwgfHwgZG9jdW1lbnQgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGRvY3VtZW50LmN1cnJlbnRTY3JpcHQpID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS50aXRsZSkgfHwgXCJTQVQgXCIuY29uY2F0KFNBVF9WRVJTSU9OKTtcbiAgICB2YXIgdmVyc2lvbiA9IHRpdGxlLnJlcGxhY2UoL14uKnYvLCBcInZcIik7XG4gICAgY29uc29sZS5sb2codGl0bGUpO1xuICAgIHZhciBjb3B5ID0gZnVuY3Rpb24gKHJlcG9ydEZuKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXBvcnRGbigpO1xuICAgICAgICAgICAgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQobGFzdENsaXApO1xuICAgICAgICB9O1xuICAgIH07XG4gICAgdmFyIGhvdGtleXMgPSBbXTtcbiAgICB2YXIgaG90a2V5ID0gZnVuY3Rpb24gKGtleSwgYWN0aW9uKSB7XG4gICAgICAgIGhvdGtleXMucHVzaChba2V5LCBhY3Rpb25dKTtcbiAgICAgICAgTW91c2V0cmFwLmJpbmQoa2V5LCBjb3B5KGFjdGlvbikpO1xuICAgIH07XG4gICAgaWYgKCFTdHJpbmcucHJvdG90eXBlLmZvcm1hdCkge1xuICAgICAgICBTdHJpbmcucHJvdG90eXBlLmZvcm1hdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBhcmdzID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgICAgIGFyZ3NbX2ldID0gYXJndW1lbnRzW19pXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGlzLnJlcGxhY2UoL3soXFxkKyl9L2csIGZ1bmN0aW9uIChtYXRjaCwgbnVtYmVyKSB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBhcmdzW251bWJlcl0gPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIE1hdGgudHJ1bmMoYXJnc1tudW1iZXJdICogMTAwMCkgLyAxMDAwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gdHlwZW9mIGFyZ3NbbnVtYmVyXSAhPSBcInVuZGVmaW5lZFwiID8gYXJnc1tudW1iZXJdIDogbWF0Y2g7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgdmFyIGxpbmtGbGVldHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciB1bml2ZXJzZSA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2U7XG4gICAgICAgIHZhciBmbGVldHMgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlLmdhbGF4eS5mbGVldHM7XG4gICAgICAgIGZvciAodmFyIGYgaW4gZmxlZXRzKSB7XG4gICAgICAgICAgICB2YXIgZmxlZXQgPSBmbGVldHNbZl07XG4gICAgICAgICAgICB2YXIgZmxlZXRMaW5rID0gXCI8YSBvbkNsaWNrPSdDcnV4LmNydXgudHJpZ2dlcihcXFwic2hvd19mbGVldF91aWRcXFwiLCBcXFwiXCIuY29uY2F0KGZsZWV0LnVpZCwgXCJcXFwiKSc+XCIpLmNvbmNhdChmbGVldC5uLCBcIjwvYT5cIik7XG4gICAgICAgICAgICB1bml2ZXJzZS5oeXBlcmxpbmtlZE1lc3NhZ2VJbnNlcnRzW2ZsZWV0Lm5dID0gZmxlZXRMaW5rO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBmdW5jdGlvbiBzdGFyUmVwb3J0KCkge1xuICAgICAgICB2YXIgcGxheWVycyA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2UuZ2FsYXh5LnBsYXllcnM7XG4gICAgICAgIHZhciBzdGFycyA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2UuZ2FsYXh5LnN0YXJzO1xuICAgICAgICB2YXIgb3V0cHV0ID0gW107XG4gICAgICAgIGZvciAodmFyIHAgaW4gcGxheWVycykge1xuICAgICAgICAgICAgb3V0cHV0LnB1c2goXCJbW3swfV1dXCIuZm9ybWF0KHApKTtcbiAgICAgICAgICAgIGZvciAodmFyIHMgaW4gc3RhcnMpIHtcbiAgICAgICAgICAgICAgICB2YXIgc3RhciA9IHN0YXJzW3NdO1xuICAgICAgICAgICAgICAgIGlmIChzdGFyLnB1aWQgPT0gcCAmJiBzdGFyLnNoaXBzUGVyVGljayA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIG91dHB1dC5wdXNoKFwi4oCD4oCDW1t7MH1dXSB7MX0vezJ9L3szfSB7NH0gc2hpcHNcIi5mb3JtYXQoc3Rhci5uLCBzdGFyLmUsIHN0YXIuaSwgc3Rhci5zLCBzdGFyLnRvdGFsRGVmZW5zZXMpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2xpcChvdXRwdXQuam9pbihcIlxcblwiKSk7XG4gICAgfVxuICAgIGhvdGtleShcIipcIiwgc3RhclJlcG9ydCk7XG4gICAgc3RhclJlcG9ydC5oZWxwID1cbiAgICAgICAgXCJHZW5lcmF0ZSBhIHJlcG9ydCBvbiBhbGwgc3RhcnMgaW4geW91ciBzY2FubmluZyByYW5nZSwgYW5kIGNvcHkgaXQgdG8gdGhlIGNsaXBib2FyZC5cIiArXG4gICAgICAgICAgICBcIjxwPlRoaXMgc2FtZSByZXBvcnQgY2FuIGFsc28gYmUgdmlld2VkIHZpYSB0aGUgbWVudTsgZW50ZXIgdGhlIGFnZW50IGFuZCBjaG9vc2UgaXQgZnJvbSB0aGUgZHJvcGRvd24uXCI7XG4gICAgdmFyIGFtcG0gPSBmdW5jdGlvbiAoaCwgbSkge1xuICAgICAgICBpZiAobSA8IDEwKVxuICAgICAgICAgICAgbSA9IFwiMFwiLmNvbmNhdChtKTtcbiAgICAgICAgaWYgKGggPCAxMikge1xuICAgICAgICAgICAgaWYgKGggPT0gMClcbiAgICAgICAgICAgICAgICBoID0gMTI7XG4gICAgICAgICAgICByZXR1cm4gXCJ7MH06ezF9IEFNXCIuZm9ybWF0KGgsIG0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGggPiAxMikge1xuICAgICAgICAgICAgcmV0dXJuIFwiezB9OnsxfSBQTVwiLmZvcm1hdChoIC0gMTIsIG0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBcInswfTp7MX0gUE1cIi5mb3JtYXQoaCwgbSk7XG4gICAgfTtcbiAgICB2YXIgbXNUb1RpY2sgPSBmdW5jdGlvbiAodGljaywgd2hvbGVUaW1lKSB7XG4gICAgICAgIHZhciB1bml2ZXJzZSA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2U7XG4gICAgICAgIHZhciBtc19zaW5jZV9kYXRhID0gMDtcbiAgICAgICAgdmFyIHRmID0gdW5pdmVyc2UuZ2FsYXh5LnRpY2tfZnJhZ21lbnQ7XG4gICAgICAgIHZhciBsdGMgPSB1bml2ZXJzZS5sb2NUaW1lQ29ycmVjdGlvbjtcbiAgICAgICAgaWYgKCF1bml2ZXJzZS5nYWxheHkucGF1c2VkKSB7XG4gICAgICAgICAgICBtc19zaW5jZV9kYXRhID0gbmV3IERhdGUoKS52YWx1ZU9mKCkgLSB1bml2ZXJzZS5ub3cudmFsdWVPZigpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh3aG9sZVRpbWUgfHwgdW5pdmVyc2UuZ2FsYXh5LnR1cm5fYmFzZWQpIHtcbiAgICAgICAgICAgIG1zX3NpbmNlX2RhdGEgPSAwO1xuICAgICAgICAgICAgdGYgPSAwO1xuICAgICAgICAgICAgbHRjID0gMDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgbXNfcmVtYWluaW5nID0gdGljayAqIDEwMDAgKiA2MCAqIHVuaXZlcnNlLmdhbGF4eS50aWNrX3JhdGUgLVxuICAgICAgICAgICAgdGYgKiAxMDAwICogNjAgKiB1bml2ZXJzZS5nYWxheHkudGlja19yYXRlIC1cbiAgICAgICAgICAgIG1zX3NpbmNlX2RhdGEgLVxuICAgICAgICAgICAgbHRjO1xuICAgICAgICByZXR1cm4gbXNfcmVtYWluaW5nO1xuICAgIH07XG4gICAgdmFyIGRheXMgPSBbXCJTdW5cIiwgXCJNb25cIiwgXCJUdWVcIiwgXCJXZWRcIiwgXCJUaHVcIiwgXCJGcmlcIiwgXCJTYXRcIl07XG4gICAgdmFyIG1zVG9FdGFTdHJpbmcgPSBmdW5jdGlvbiAobXNwbHVzLCBwcmVmaXgpIHtcbiAgICAgICAgdmFyIG5vdyA9IG5ldyBEYXRlKCk7XG4gICAgICAgIHZhciBhcnJpdmFsID0gbmV3IERhdGUobm93LmdldFRpbWUoKSArIG1zcGx1cyk7XG4gICAgICAgIHZhciBwID0gcHJlZml4ICE9PSB1bmRlZmluZWQgPyBwcmVmaXggOiBcIkVUQSBcIjtcbiAgICAgICAgLy9XaGF0IGlzIHR0dD9cbiAgICAgICAgdmFyIHR0dCA9IHAgKyBhbXBtKGFycml2YWwuZ2V0SG91cnMoKSwgYXJyaXZhbC5nZXRNaW51dGVzKCkpO1xuICAgICAgICBpZiAoIU5lcHR1bmVzUHJpZGUuZ2FtZUNvbmZpZy50dXJuQmFzZWQpIHtcbiAgICAgICAgICAgIHR0dCA9IHAgKyBhbXBtKGFycml2YWwuZ2V0SG91cnMoKSwgYXJyaXZhbC5nZXRNaW51dGVzKCkpO1xuICAgICAgICAgICAgaWYgKGFycml2YWwuZ2V0RGF5KCkgIT0gbm93LmdldERheSgpKVxuICAgICAgICAgICAgICAgIC8vIEdlbmVyYXRlIHRpbWUgc3RyaW5nXG4gICAgICAgICAgICAgICAgdHR0ID0gXCJcIi5jb25jYXQocCkuY29uY2F0KGRheXNbYXJyaXZhbC5nZXREYXkoKV0sIFwiIEAgXCIpLmNvbmNhdChhbXBtKGFycml2YWwuZ2V0SG91cnMoKSwgYXJyaXZhbC5nZXRNaW51dGVzKCkpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHZhciB0b3RhbEVUQSA9IGFycml2YWwgLSBub3c7XG4gICAgICAgICAgICB0dHQgPSBwICsgQ3J1eC5mb3JtYXRUaW1lKHRvdGFsRVRBKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHR0O1xuICAgIH07XG4gICAgdmFyIHRpY2tUb0V0YVN0cmluZyA9IGZ1bmN0aW9uICh0aWNrLCBwcmVmaXgpIHtcbiAgICAgICAgdmFyIG1zcGx1cyA9IG1zVG9UaWNrKHRpY2spO1xuICAgICAgICByZXR1cm4gbXNUb0V0YVN0cmluZyhtc3BsdXMsIHByZWZpeCk7XG4gICAgfTtcbiAgICB2YXIgbXNUb0N5Y2xlU3RyaW5nID0gZnVuY3Rpb24gKG1zcGx1cywgcHJlZml4KSB7XG4gICAgICAgIHZhciBwID0gcHJlZml4ICE9PSB1bmRlZmluZWQgPyBwcmVmaXggOiBcIkVUQVwiO1xuICAgICAgICB2YXIgY3ljbGVMZW5ndGggPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlLmdhbGF4eS5wcm9kdWN0aW9uX3JhdGU7XG4gICAgICAgIHZhciB0aWNrTGVuZ3RoID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5nYWxheHkudGlja19yYXRlO1xuICAgICAgICB2YXIgdGlja3NUb0NvbXBsZXRlID0gTWF0aC5jZWlsKG1zcGx1cyAvIDYwMDAwIC8gdGlja0xlbmd0aCk7XG4gICAgICAgIC8vR2VuZXJhdGUgdGltZSB0ZXh0IHN0cmluZ1xuICAgICAgICB2YXIgdHR0ID0gXCJcIi5jb25jYXQocCkuY29uY2F0KHRpY2tzVG9Db21wbGV0ZSwgXCIgdGlja3MgLSBcIikuY29uY2F0KCh0aWNrc1RvQ29tcGxldGUgLyBjeWNsZUxlbmd0aCkudG9GaXhlZCgyKSwgXCJDXCIpO1xuICAgICAgICByZXR1cm4gdHR0O1xuICAgIH07XG4gICAgdmFyIGZsZWV0T3V0Y29tZXMgPSB7fTtcbiAgICB2YXIgY29tYmF0SGFuZGljYXAgPSAwO1xuICAgIHZhciBjb21iYXRPdXRjb21lcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIF9hO1xuICAgICAgICB2YXIgdW5pdmVyc2UgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlO1xuICAgICAgICB2YXIgcGxheWVycyA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2UuZ2FsYXh5LnBsYXllcnM7XG4gICAgICAgIHZhciBmbGVldHMgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlLmdhbGF4eS5mbGVldHM7XG4gICAgICAgIHZhciBzdGFycyA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2UuZ2FsYXh5LnN0YXJzO1xuICAgICAgICB2YXIgZmxpZ2h0cyA9IFtdO1xuICAgICAgICBmbGVldE91dGNvbWVzID0ge307XG4gICAgICAgIGZvciAodmFyIGYgaW4gZmxlZXRzKSB7XG4gICAgICAgICAgICB2YXIgZmxlZXQgPSBmbGVldHNbZl07XG4gICAgICAgICAgICBpZiAoZmxlZXQubyAmJiBmbGVldC5vLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICB2YXIgc3RvcF8xID0gZmxlZXQub1swXVsxXTtcbiAgICAgICAgICAgICAgICB2YXIgdGlja3MgPSBmbGVldC5ldGFGaXJzdDtcbiAgICAgICAgICAgICAgICB2YXIgc3Rhcm5hbWUgPSAoX2EgPSBzdGFyc1tzdG9wXzFdKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2EubjtcbiAgICAgICAgICAgICAgICBpZiAoIXN0YXJuYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmbGlnaHRzLnB1c2goW1xuICAgICAgICAgICAgICAgICAgICB0aWNrcyxcbiAgICAgICAgICAgICAgICAgICAgXCJbW3swfV1dIFtbezF9XV0gezJ9IOKGkiBbW3szfV1dIHs0fVwiLmZvcm1hdChmbGVldC5wdWlkLCBmbGVldC5uLCBmbGVldC5zdCwgc3Rhcm5hbWUsIHRpY2tUb0V0YVN0cmluZyh0aWNrcykpLFxuICAgICAgICAgICAgICAgICAgICBmbGVldCxcbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmbGlnaHRzID0gZmxpZ2h0cy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgICAgICByZXR1cm4gYVswXSAtIGJbMF07XG4gICAgICAgIH0pO1xuICAgICAgICB2YXIgYXJyaXZhbHMgPSB7fTtcbiAgICAgICAgdmFyIG91dHB1dCA9IFtdO1xuICAgICAgICB2YXIgYXJyaXZhbFRpbWVzID0gW107XG4gICAgICAgIHZhciBzdGFyc3RhdGUgPSB7fTtcbiAgICAgICAgZm9yICh2YXIgaSBpbiBmbGlnaHRzKSB7XG4gICAgICAgICAgICB2YXIgZmxlZXQgPSBmbGlnaHRzW2ldWzJdO1xuICAgICAgICAgICAgaWYgKGZsZWV0Lm9yYml0aW5nKSB7XG4gICAgICAgICAgICAgICAgdmFyIG9yYml0ID0gZmxlZXQub3JiaXRpbmcudWlkO1xuICAgICAgICAgICAgICAgIGlmICghc3RhcnN0YXRlW29yYml0XSkge1xuICAgICAgICAgICAgICAgICAgICBzdGFyc3RhdGVbb3JiaXRdID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFzdF91cGRhdGVkOiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2hpcHM6IHN0YXJzW29yYml0XS50b3RhbERlZmVuc2VzLFxuICAgICAgICAgICAgICAgICAgICAgICAgcHVpZDogc3RhcnNbb3JiaXRdLnB1aWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBjOiBzdGFyc1tvcmJpdF0uYyxcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gVGhpcyBmbGVldCBpcyBkZXBhcnRpbmcgdGhpcyB0aWNrOyByZW1vdmUgaXQgZnJvbSB0aGUgb3JpZ2luIHN0YXIncyB0b3RhbERlZmVuc2VzXG4gICAgICAgICAgICAgICAgc3RhcnN0YXRlW29yYml0XS5zaGlwcyAtPSBmbGVldC5zdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChhcnJpdmFsVGltZXMubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgYXJyaXZhbFRpbWVzW2Fycml2YWxUaW1lcy5sZW5ndGggLSAxXSAhPT0gZmxpZ2h0c1tpXVswXSkge1xuICAgICAgICAgICAgICAgIGFycml2YWxUaW1lcy5wdXNoKGZsaWdodHNbaV1bMF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGFycml2YWxLZXkgPSBbZmxpZ2h0c1tpXVswXSwgZmxlZXQub1swXVsxXV07XG4gICAgICAgICAgICBpZiAoYXJyaXZhbHNbYXJyaXZhbEtleV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGFycml2YWxzW2Fycml2YWxLZXldLnB1c2goZmxlZXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgYXJyaXZhbHNbYXJyaXZhbEtleV0gPSBbZmxlZXRdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZvciAodmFyIGsgaW4gYXJyaXZhbHMpIHtcbiAgICAgICAgICAgIHZhciBhcnJpdmFsID0gYXJyaXZhbHNba107XG4gICAgICAgICAgICB2YXIga2EgPSBrLnNwbGl0KFwiLFwiKTtcbiAgICAgICAgICAgIHZhciB0aWNrID0ga2FbMF07XG4gICAgICAgICAgICB2YXIgc3RhcklkID0ga2FbMV07XG4gICAgICAgICAgICBpZiAoIXN0YXJzdGF0ZVtzdGFySWRdKSB7XG4gICAgICAgICAgICAgICAgc3RhcnN0YXRlW3N0YXJJZF0gPSB7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RfdXBkYXRlZDogMCxcbiAgICAgICAgICAgICAgICAgICAgc2hpcHM6IHN0YXJzW3N0YXJJZF0udG90YWxEZWZlbnNlcyxcbiAgICAgICAgICAgICAgICAgICAgcHVpZDogc3RhcnNbc3RhcklkXS5wdWlkLFxuICAgICAgICAgICAgICAgICAgICBjOiBzdGFyc1tzdGFySWRdLmMsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzdGFyc3RhdGVbc3RhcklkXS5wdWlkID09IC0xKSB7XG4gICAgICAgICAgICAgICAgLy8gYXNzaWduIG93bmVyc2hpcCBvZiB0aGUgc3RhciB0byB0aGUgcGxheWVyIHdob3NlIGZsZWV0IGhhcyB0cmF2ZWxlZCB0aGUgbGVhc3QgZGlzdGFuY2VcbiAgICAgICAgICAgICAgICB2YXIgbWluRGlzdGFuY2UgPSAxMDAwMDtcbiAgICAgICAgICAgICAgICB2YXIgb3duZXIgPSAtMTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpIGluIGFycml2YWwpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZsZWV0ID0gYXJyaXZhbFtpXTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGQgPSB1bml2ZXJzZS5kaXN0YW5jZShzdGFyc1tzdGFySWRdLngsIHN0YXJzW3N0YXJJZF0ueSwgZmxlZXQubHgsIGZsZWV0Lmx5KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGQgPCBtaW5EaXN0YW5jZSB8fCBvd25lciA9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3duZXIgPSBmbGVldC5wdWlkO1xuICAgICAgICAgICAgICAgICAgICAgICAgbWluRGlzdGFuY2UgPSBkO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHN0YXJzdGF0ZVtzdGFySWRdLnB1aWQgPSBvd25lcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG91dHB1dC5wdXNoKFwiezB9OiBbW3sxfV1dIFtbezJ9XV0gezN9IHNoaXBzXCIuZm9ybWF0KHRpY2tUb0V0YVN0cmluZyh0aWNrLCBcIkBcIiksIHN0YXJzdGF0ZVtzdGFySWRdLnB1aWQsIHN0YXJzW3N0YXJJZF0ubiwgc3RhcnN0YXRlW3N0YXJJZF0uc2hpcHMpKTtcbiAgICAgICAgICAgIHZhciB0aWNrRGVsdGEgPSB0aWNrIC0gc3RhcnN0YXRlW3N0YXJJZF0ubGFzdF91cGRhdGVkIC0gMTtcbiAgICAgICAgICAgIGlmICh0aWNrRGVsdGEgPiAwKSB7XG4gICAgICAgICAgICAgICAgdmFyIG9sZFNoaXBzID0gc3RhcnN0YXRlW3N0YXJJZF0uc2hpcHM7XG4gICAgICAgICAgICAgICAgc3RhcnN0YXRlW3N0YXJJZF0ubGFzdF91cGRhdGVkID0gdGljayAtIDE7XG4gICAgICAgICAgICAgICAgaWYgKHN0YXJzW3N0YXJJZF0uc2hpcHNQZXJUaWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBvbGRjID0gc3RhcnN0YXRlW3N0YXJJZF0uYztcbiAgICAgICAgICAgICAgICAgICAgc3RhcnN0YXRlW3N0YXJJZF0uc2hpcHMgKz1cbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJzW3N0YXJJZF0uc2hpcHNQZXJUaWNrICogdGlja0RlbHRhICsgb2xkYztcbiAgICAgICAgICAgICAgICAgICAgc3RhcnN0YXRlW3N0YXJJZF0uYyA9XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFyc3RhdGVbc3RhcklkXS5zaGlwcyAtIE1hdGgudHJ1bmMoc3RhcnN0YXRlW3N0YXJJZF0uc2hpcHMpO1xuICAgICAgICAgICAgICAgICAgICBzdGFyc3RhdGVbc3RhcklkXS5zaGlwcyAtPSBzdGFyc3RhdGVbc3RhcklkXS5jO1xuICAgICAgICAgICAgICAgICAgICBvdXRwdXQucHVzaChcIuKAg+KAg3swfSt7M30gKyB7Mn0vaCA9IHsxfSt7NH1cIi5mb3JtYXQob2xkU2hpcHMsIHN0YXJzdGF0ZVtzdGFySWRdLnNoaXBzLCBzdGFyc1tzdGFySWRdLnNoaXBzUGVyVGljaywgb2xkYywgc3RhcnN0YXRlW3N0YXJJZF0uYykpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAodmFyIGkgaW4gYXJyaXZhbCkge1xuICAgICAgICAgICAgICAgIHZhciBmbGVldCA9IGFycml2YWxbaV07XG4gICAgICAgICAgICAgICAgaWYgKGZsZWV0LnB1aWQgPT0gc3RhcnN0YXRlW3N0YXJJZF0ucHVpZCB8fFxuICAgICAgICAgICAgICAgICAgICBzdGFyc3RhdGVbc3RhcklkXS5wdWlkID09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBvbGRTaGlwcyA9IHN0YXJzdGF0ZVtzdGFySWRdLnNoaXBzO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3RhcnN0YXRlW3N0YXJJZF0ucHVpZCA9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnN0YXRlW3N0YXJJZF0uc2hpcHMgPSBmbGVldC5zdDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJzdGF0ZVtzdGFySWRdLnNoaXBzICs9IGZsZWV0LnN0O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHZhciBsYW5kaW5nU3RyaW5nID0gXCLigIPigIN7MH0gKyB7Mn0gb24gW1t7M31dXSA9IHsxfVwiLmZvcm1hdChvbGRTaGlwcywgc3RhcnN0YXRlW3N0YXJJZF0uc2hpcHMsIGZsZWV0LnN0LCBmbGVldC5uKTtcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0LnB1c2gobGFuZGluZ1N0cmluZyk7XG4gICAgICAgICAgICAgICAgICAgIGxhbmRpbmdTdHJpbmcgPSBsYW5kaW5nU3RyaW5nLnN1YnN0cmluZygyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKHZhciBpIGluIGFycml2YWwpIHtcbiAgICAgICAgICAgICAgICB2YXIgZmxlZXQgPSBhcnJpdmFsW2ldO1xuICAgICAgICAgICAgICAgIGlmIChmbGVldC5wdWlkID09IHN0YXJzdGF0ZVtzdGFySWRdLnB1aWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG91dGNvbWVTdHJpbmcgPSBcInswfSBzaGlwcyBvbiB7MX1cIi5mb3JtYXQoTWF0aC5mbG9vcihzdGFyc3RhdGVbc3RhcklkXS5zaGlwcyksIHN0YXJzW3N0YXJJZF0ubik7XG4gICAgICAgICAgICAgICAgICAgIGZsZWV0T3V0Y29tZXNbZmxlZXQudWlkXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV0YTogdGlja1RvRXRhU3RyaW5nKGZsZWV0LmV0YUZpcnN0KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dGNvbWU6IG91dGNvbWVTdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGF3dCA9IDA7XG4gICAgICAgICAgICB2YXIgb2ZmZW5zZSA9IDA7XG4gICAgICAgICAgICB2YXIgY29udHJpYnV0aW9uID0ge307XG4gICAgICAgICAgICBmb3IgKHZhciBpIGluIGFycml2YWwpIHtcbiAgICAgICAgICAgICAgICB2YXIgZmxlZXQgPSBhcnJpdmFsW2ldO1xuICAgICAgICAgICAgICAgIGlmIChmbGVldC5wdWlkICE9IHN0YXJzdGF0ZVtzdGFySWRdLnB1aWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG9sZGEgPSBvZmZlbnNlO1xuICAgICAgICAgICAgICAgICAgICBvZmZlbnNlICs9IGZsZWV0LnN0O1xuICAgICAgICAgICAgICAgICAgICBvdXRwdXQucHVzaChcIuKAg+KAg1tbezR9XV0hIHswfSArIHsyfSBvbiBbW3szfV1dID0gezF9XCIuZm9ybWF0KG9sZGEsIG9mZmVuc2UsIGZsZWV0LnN0LCBmbGVldC5uLCBmbGVldC5wdWlkKSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRyaWJ1dGlvbltbZmxlZXQucHVpZCwgZmxlZXQudWlkXV0gPSBmbGVldC5zdDtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHd0ID0gcGxheWVyc1tmbGVldC5wdWlkXS50ZWNoLndlYXBvbnMubGV2ZWw7XG4gICAgICAgICAgICAgICAgICAgIGlmICh3dCA+IGF3dCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXd0ID0gd3Q7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgYXR0YWNrZXJzQWdncmVnYXRlID0gb2ZmZW5zZTtcbiAgICAgICAgICAgIHdoaWxlIChvZmZlbnNlID4gMCkge1xuICAgICAgICAgICAgICAgIHZhciBkd3QgPSBwbGF5ZXJzW3N0YXJzdGF0ZVtzdGFySWRdLnB1aWRdLnRlY2gud2VhcG9ucy5sZXZlbDtcbiAgICAgICAgICAgICAgICB2YXIgZGVmZW5zZSA9IHN0YXJzdGF0ZVtzdGFySWRdLnNoaXBzO1xuICAgICAgICAgICAgICAgIG91dHB1dC5wdXNoKFwi4oCD4oCDQ29tYmF0ISBbW3swfV1dIGRlZmVuZGluZ1wiLmZvcm1hdChzdGFyc3RhdGVbc3RhcklkXS5wdWlkKSk7XG4gICAgICAgICAgICAgICAgb3V0cHV0LnB1c2goXCLigIPigIPigIPigINEZWZlbmRlcnMgezB9IHNoaXBzLCBXUyB7MX1cIi5mb3JtYXQoZGVmZW5zZSwgZHd0KSk7XG4gICAgICAgICAgICAgICAgb3V0cHV0LnB1c2goXCLigIPigIPigIPigINBdHRhY2tlcnMgezB9IHNoaXBzLCBXUyB7MX1cIi5mb3JtYXQob2ZmZW5zZSwgYXd0KSk7XG4gICAgICAgICAgICAgICAgZHd0ICs9IDE7XG4gICAgICAgICAgICAgICAgaWYgKHN0YXJzdGF0ZVtzdGFySWRdLnB1aWQgIT09IHVuaXZlcnNlLmdhbGF4eS5wbGF5ZXJfdWlkKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb21iYXRIYW5kaWNhcCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGR3dCArPSBjb21iYXRIYW5kaWNhcDtcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dC5wdXNoKFwi4oCD4oCD4oCD4oCDRGVmZW5kZXJzIFdTezB9ID0gezF9XCIuZm9ybWF0KGhhbmRpY2FwU3RyaW5nKFwiXCIpLCBkd3QpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF3dCAtPSBjb21iYXRIYW5kaWNhcDtcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dC5wdXNoKFwi4oCD4oCD4oCD4oCDQXR0YWNrZXJzIFdTezB9ID0gezF9XCIuZm9ybWF0KGhhbmRpY2FwU3RyaW5nKFwiXCIpLCBhd3QpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbWJhdEhhbmRpY2FwID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXd0ICs9IGNvbWJhdEhhbmRpY2FwO1xuICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0LnB1c2goXCLigIPigIPigIPigINBdHRhY2tlcnMgV1N7MH0gPSB7MX1cIi5mb3JtYXQoaGFuZGljYXBTdHJpbmcoXCJcIiksIGF3dCkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZHd0IC09IGNvbWJhdEhhbmRpY2FwO1xuICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0LnB1c2goXCLigIPigIPigIPigINEZWZlbmRlcnMgV1N7MH0gPSB7MX1cIi5mb3JtYXQoaGFuZGljYXBTdHJpbmcoXCJcIiksIGR3dCkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh1bml2ZXJzZS5nYWxheHkucGxheWVyX3VpZCA9PT0gc3RhcnN0YXRlW3N0YXJJZF0ucHVpZCkge1xuICAgICAgICAgICAgICAgICAgICAvLyB0cnVuY2F0ZSBkZWZlbnNlIGlmIHdlJ3JlIGRlZmVuZGluZyB0byBnaXZlIHRoZSBtb3N0XG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnNlcnZhdGl2ZSBlc3RpbWF0ZVxuICAgICAgICAgICAgICAgICAgICBkZWZlbnNlID0gTWF0aC50cnVuYyhkZWZlbnNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgd2hpbGUgKGRlZmVuc2UgPiAwICYmIG9mZmVuc2UgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIG9mZmVuc2UgLT0gZHd0O1xuICAgICAgICAgICAgICAgICAgICBpZiAob2ZmZW5zZSA8PSAwKVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGRlZmVuc2UgLT0gYXd0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgbmV3QWdncmVnYXRlID0gMDtcbiAgICAgICAgICAgICAgICB2YXIgcGxheWVyQ29udHJpYnV0aW9uID0ge307XG4gICAgICAgICAgICAgICAgdmFyIGJpZ2dlc3RQbGF5ZXIgPSAtMTtcbiAgICAgICAgICAgICAgICB2YXIgYmlnZ2VzdFBsYXllcklkID0gc3RhcnN0YXRlW3N0YXJJZF0ucHVpZDtcbiAgICAgICAgICAgICAgICBpZiAob2ZmZW5zZSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0LnB1c2goXCLigIPigINBdHRhY2tlcnMgd2luIHdpdGggezB9IHNoaXBzIHJlbWFpbmluZ1wiLmZvcm1hdChvZmZlbnNlKSk7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGtfMSBpbiBjb250cmlidXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBrYV8xID0ga18xLnNwbGl0KFwiLFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmbGVldCA9IGZsZWV0c1trYV8xWzFdXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwbGF5ZXJJZCA9IGthXzFbMF07XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250cmlidXRpb25ba18xXSA9IChvZmZlbnNlICogY29udHJpYnV0aW9uW2tfMV0pIC8gYXR0YWNrZXJzQWdncmVnYXRlO1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV3QWdncmVnYXRlICs9IGNvbnRyaWJ1dGlvbltrXzFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBsYXllckNvbnRyaWJ1dGlvbltwbGF5ZXJJZF0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbGF5ZXJDb250cmlidXRpb25bcGxheWVySWRdICs9IGNvbnRyaWJ1dGlvbltrXzFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGxheWVyQ29udHJpYnV0aW9uW3BsYXllcklkXSA9IGNvbnRyaWJ1dGlvbltrXzFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBsYXllckNvbnRyaWJ1dGlvbltwbGF5ZXJJZF0gPiBiaWdnZXN0UGxheWVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmlnZ2VzdFBsYXllciA9IHBsYXllckNvbnRyaWJ1dGlvbltwbGF5ZXJJZF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmlnZ2VzdFBsYXllcklkID0gcGxheWVySWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXQucHVzaChcIuKAg+KAg+KAg+KAg1tbezB9XV0gaGFzIHsxfSBvbiBbW3syfV1dXCIuZm9ybWF0KGZsZWV0LnB1aWQsIGNvbnRyaWJ1dGlvbltrXzFdLCBmbGVldC5uKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgb3V0Y29tZVN0cmluZyA9IFwiV2lucyEgezB9IGxhbmQuXCIuZm9ybWF0KGNvbnRyaWJ1dGlvbltrXzFdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZsZWV0T3V0Y29tZXNbZmxlZXQudWlkXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBldGE6IHRpY2tUb0V0YVN0cmluZyhmbGVldC5ldGFGaXJzdCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0Y29tZTogb3V0Y29tZVN0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgb2ZmZW5zZSA9IG5ld0FnZ3JlZ2F0ZSAtIHBsYXllckNvbnRyaWJ1dGlvbltiaWdnZXN0UGxheWVySWRdO1xuICAgICAgICAgICAgICAgICAgICBzdGFyc3RhdGVbc3RhcklkXS5wdWlkID0gYmlnZ2VzdFBsYXllcklkO1xuICAgICAgICAgICAgICAgICAgICBzdGFyc3RhdGVbc3RhcklkXS5zaGlwcyA9IHBsYXllckNvbnRyaWJ1dGlvbltiaWdnZXN0UGxheWVySWRdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhcnN0YXRlW3N0YXJJZF0uc2hpcHMgPSBkZWZlbnNlO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpIGluIGFycml2YWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmbGVldCA9IGFycml2YWxbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmxlZXQucHVpZCA9PSBzdGFyc3RhdGVbc3RhcklkXS5wdWlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG91dGNvbWVTdHJpbmcgPSBcInswfSBzaGlwcyBvbiB7MX1cIi5mb3JtYXQoTWF0aC5mbG9vcihzdGFyc3RhdGVbc3RhcklkXS5zaGlwcyksIHN0YXJzW3N0YXJJZF0ubik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmxlZXRPdXRjb21lc1tmbGVldC51aWRdID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBldGE6IHRpY2tUb0V0YVN0cmluZyhmbGVldC5ldGFGaXJzdCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dGNvbWU6IG91dGNvbWVTdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBrXzIgaW4gY29udHJpYnV0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIga2FfMiA9IGtfMi5zcGxpdChcIixcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZmxlZXQgPSBmbGVldHNba2FfMlsxXV07XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgb3V0Y29tZVN0cmluZyA9IFwiTG9zZXMhIHswfSBsaXZlLlwiLmZvcm1hdChkZWZlbnNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZsZWV0T3V0Y29tZXNbZmxlZXQudWlkXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBldGE6IHRpY2tUb0V0YVN0cmluZyhmbGVldC5ldGFGaXJzdCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0Y29tZTogb3V0Y29tZVN0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYXR0YWNrZXJzQWdncmVnYXRlID0gb2ZmZW5zZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG91dHB1dC5wdXNoKFwi4oCD4oCDW1t7MH1dXSBbW3sxfV1dIHsyfSBzaGlwc1wiLmZvcm1hdChzdGFyc3RhdGVbc3RhcklkXS5wdWlkLCBzdGFyc1tzdGFySWRdLm4sIHN0YXJzdGF0ZVtzdGFySWRdLnNoaXBzKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICB9O1xuICAgIGZ1bmN0aW9uIGluY0NvbWJhdEhhbmRpY2FwKCkge1xuICAgICAgICBjb21iYXRIYW5kaWNhcCArPSAxO1xuICAgIH1cbiAgICBmdW5jdGlvbiBkZWNDb21iYXRIYW5kaWNhcCgpIHtcbiAgICAgICAgY29tYmF0SGFuZGljYXAgLT0gMTtcbiAgICB9XG4gICAgaG90a2V5KFwiLlwiLCBpbmNDb21iYXRIYW5kaWNhcCk7XG4gICAgaW5jQ29tYmF0SGFuZGljYXAuaGVscCA9XG4gICAgICAgIFwiQ2hhbmdlIGNvbWJhdCBjYWxjdWxhdGlvbiB0byBjcmVkaXQgeW91ciBlbmVtaWVzIHdpdGggKzEgd2VhcG9ucy4gVXNlZnVsIFwiICtcbiAgICAgICAgICAgIFwiaWYgeW91IHN1c3BlY3QgdGhleSB3aWxsIGhhdmUgYWNoaWV2ZWQgdGhlIG5leHQgbGV2ZWwgb2YgdGVjaCBiZWZvcmUgYSBiYXR0bGUgeW91IGFyZSBpbnZlc3RpZ2F0aW5nLlwiICtcbiAgICAgICAgICAgIFwiPHA+SW4gdGhlIGxvd2VyIGxlZnQgb2YgdGhlIEhVRCwgYW4gaW5kaWNhdG9yIHdpbGwgYXBwZWFyIHJlbWluZGluZyB5b3Ugb2YgdGhlIHdlYXBvbnMgYWRqdXN0bWVudC4gSWYgdGhlIFwiICtcbiAgICAgICAgICAgIFwiaW5kaWNhdG9yIGFscmVhZHkgc2hvd3MgYW4gYWR2YW50YWdlIGZvciBkZWZlbmRlcnMsIHRoaXMgaG90a2V5IHdpbGwgcmVkdWNlIHRoYXQgYWR2YW50YWdlIGZpcnN0IGJlZm9yZSBjcmVkaXRpbmcgXCIgK1xuICAgICAgICAgICAgXCJ3ZWFwb25zIHRvIHlvdXIgb3Bwb25lbnQuXCI7XG4gICAgaG90a2V5KFwiLFwiLCBkZWNDb21iYXRIYW5kaWNhcCk7XG4gICAgZGVjQ29tYmF0SGFuZGljYXAuaGVscCA9XG4gICAgICAgIFwiQ2hhbmdlIGNvbWJhdCBjYWxjdWxhdGlvbiB0byBjcmVkaXQgeW91cnNlbGYgd2l0aCArMSB3ZWFwb25zLiBVc2VmdWwgXCIgK1xuICAgICAgICAgICAgXCJ3aGVuIHlvdSB3aWxsIGhhdmUgYWNoaWV2ZWQgdGhlIG5leHQgbGV2ZWwgb2YgdGVjaCBiZWZvcmUgYSBiYXR0bGUgeW91IGFyZSBpbnZlc3RpZ2F0aW5nLlwiICtcbiAgICAgICAgICAgIFwiPHA+SW4gdGhlIGxvd2VyIGxlZnQgb2YgdGhlIEhVRCwgYW4gaW5kaWNhdG9yIHdpbGwgYXBwZWFyIHJlbWluZGluZyB5b3Ugb2YgdGhlIHdlYXBvbnMgYWRqdXN0bWVudC4gV2hlbiBcIiArXG4gICAgICAgICAgICBcImluZGljYXRvciBhbHJlYWR5IHNob3dzIGFuIGFkdmFudGFnZSBmb3IgYXR0YWNrZXJzLCB0aGlzIGhvdGtleSB3aWxsIHJlZHVjZSB0aGF0IGFkdmFudGFnZSBmaXJzdCBiZWZvcmUgY3JlZGl0aW5nIFwiICtcbiAgICAgICAgICAgIFwid2VhcG9ucyB0byB5b3UuXCI7XG4gICAgZnVuY3Rpb24gbG9uZ0ZsZWV0UmVwb3J0KCkge1xuICAgICAgICBjbGlwKGNvbWJhdE91dGNvbWVzKCkuam9pbihcIlxcblwiKSk7XG4gICAgfVxuICAgIGhvdGtleShcIiZcIiwgbG9uZ0ZsZWV0UmVwb3J0KTtcbiAgICBsb25nRmxlZXRSZXBvcnQuaGVscCA9XG4gICAgICAgIFwiR2VuZXJhdGUgYSBkZXRhaWxlZCBmbGVldCByZXBvcnQgb24gYWxsIGNhcnJpZXJzIGluIHlvdXIgc2Nhbm5pbmcgcmFuZ2UsIGFuZCBjb3B5IGl0IHRvIHRoZSBjbGlwYm9hcmQuXCIgK1xuICAgICAgICAgICAgXCI8cD5UaGlzIHNhbWUgcmVwb3J0IGNhbiBhbHNvIGJlIHZpZXdlZCB2aWEgdGhlIG1lbnU7IGVudGVyIHRoZSBhZ2VudCBhbmQgY2hvb3NlIGl0IGZyb20gdGhlIGRyb3Bkb3duLlwiO1xuICAgIGZ1bmN0aW9uIGJyaWVmRmxlZXRSZXBvcnQoKSB7XG4gICAgICAgIHZhciBfYTtcbiAgICAgICAgdmFyIGZsZWV0cyA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2UuZ2FsYXh5LmZsZWV0cztcbiAgICAgICAgdmFyIHN0YXJzID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5nYWxheHkuc3RhcnM7XG4gICAgICAgIHZhciBmbGlnaHRzID0gW107XG4gICAgICAgIGZvciAodmFyIGYgaW4gZmxlZXRzKSB7XG4gICAgICAgICAgICB2YXIgZmxlZXQgPSBmbGVldHNbZl07XG4gICAgICAgICAgICBpZiAoZmxlZXQubyAmJiBmbGVldC5vLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICB2YXIgc3RvcF8yID0gZmxlZXQub1swXVsxXTtcbiAgICAgICAgICAgICAgICB2YXIgdGlja3MgPSBmbGVldC5ldGFGaXJzdDtcbiAgICAgICAgICAgICAgICB2YXIgc3Rhcm5hbWUgPSAoX2EgPSBzdGFyc1tzdG9wXzJdKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2EubjtcbiAgICAgICAgICAgICAgICBpZiAoIXN0YXJuYW1lKVxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICBmbGlnaHRzLnB1c2goW1xuICAgICAgICAgICAgICAgICAgICB0aWNrcyxcbiAgICAgICAgICAgICAgICAgICAgXCJbW3swfV1dIFtbezF9XV0gezJ9IOKGkiBbW3szfV1dIHs0fVwiLmZvcm1hdChmbGVldC5wdWlkLCBmbGVldC5uLCBmbGVldC5zdCwgc3RhcnNbc3RvcF8yXS5uLCB0aWNrVG9FdGFTdHJpbmcodGlja3MsIFwiXCIpKSxcbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmbGlnaHRzID0gZmxpZ2h0cy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgICAgICByZXR1cm4gYVswXSAtIGJbMF07XG4gICAgICAgIH0pO1xuICAgICAgICBjbGlwKGZsaWdodHMubWFwKGZ1bmN0aW9uICh4KSB7IHJldHVybiB4WzFdOyB9KS5qb2luKFwiXFxuXCIpKTtcbiAgICB9XG4gICAgaG90a2V5KFwiXlwiLCBicmllZkZsZWV0UmVwb3J0KTtcbiAgICBicmllZkZsZWV0UmVwb3J0LmhlbHAgPVxuICAgICAgICBcIkdlbmVyYXRlIGEgc3VtbWFyeSBmbGVldCByZXBvcnQgb24gYWxsIGNhcnJpZXJzIGluIHlvdXIgc2Nhbm5pbmcgcmFuZ2UsIGFuZCBjb3B5IGl0IHRvIHRoZSBjbGlwYm9hcmQuXCIgK1xuICAgICAgICAgICAgXCI8cD5UaGlzIHNhbWUgcmVwb3J0IGNhbiBhbHNvIGJlIHZpZXdlZCB2aWEgdGhlIG1lbnU7IGVudGVyIHRoZSBhZ2VudCBhbmQgY2hvb3NlIGl0IGZyb20gdGhlIGRyb3Bkb3duLlwiO1xuICAgIGZ1bmN0aW9uIHNjcmVlbnNob3QoKSB7XG4gICAgICAgIHZhciBtYXAgPSBOZXB0dW5lc1ByaWRlLm5wdWkubWFwO1xuICAgICAgICBjbGlwKG1hcC5jYW52YXNbMF0udG9EYXRhVVJMKFwiaW1hZ2Uvd2VicFwiLCAwLjA1KSk7XG4gICAgfVxuICAgIGhvdGtleShcIiNcIiwgc2NyZWVuc2hvdCk7XG4gICAgc2NyZWVuc2hvdC5oZWxwID1cbiAgICAgICAgXCJDcmVhdGUgYSBkYXRhOiBVUkwgb2YgdGhlIGN1cnJlbnQgbWFwLiBQYXN0ZSBpdCBpbnRvIGEgYnJvd3NlciB3aW5kb3cgdG8gdmlldy4gVGhpcyBpcyBsaWtlbHkgdG8gYmUgcmVtb3ZlZC5cIjtcbiAgICB2YXIgaG9tZVBsYW5ldHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBwID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5nYWxheHkucGxheWVycztcbiAgICAgICAgdmFyIG91dHB1dCA9IFtdO1xuICAgICAgICBmb3IgKHZhciBpIGluIHApIHtcbiAgICAgICAgICAgIHZhciBob21lID0gcFtpXS5ob21lO1xuICAgICAgICAgICAgaWYgKGhvbWUpIHtcbiAgICAgICAgICAgICAgICBvdXRwdXQucHVzaChcIlBsYXllciAjezB9IGlzIFtbezB9XV0gaG9tZSB7Mn0gW1t7MX1dXVwiLmZvcm1hdChpLCBob21lLm4sIGkgPT0gaG9tZS5wdWlkID8gXCJpc1wiIDogXCJ3YXNcIikpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgb3V0cHV0LnB1c2goXCJQbGF5ZXIgI3swfSBpcyBbW3swfV1dIGhvbWUgdW5rbm93blwiLmZvcm1hdChpKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2xpcChvdXRwdXQuam9pbihcIlxcblwiKSk7XG4gICAgfTtcbiAgICBob3RrZXkoXCIhXCIsIGhvbWVQbGFuZXRzKTtcbiAgICBob21lUGxhbmV0cy5oZWxwID1cbiAgICAgICAgXCJHZW5lcmF0ZSBhIHBsYXllciBzdW1tYXJ5IHJlcG9ydCBhbmQgY29weSBpdCB0byB0aGUgY2xpcGJvYXJkLlwiICtcbiAgICAgICAgICAgIFwiPHA+VGhpcyBzYW1lIHJlcG9ydCBjYW4gYWxzbyBiZSB2aWV3ZWQgdmlhIHRoZSBtZW51OyBlbnRlciB0aGUgYWdlbnQgYW5kIGNob29zZSBpdCBmcm9tIHRoZSBkcm9wZG93bi4gXCIgK1xuICAgICAgICAgICAgXCJJdCBpcyBtb3N0IHVzZWZ1bCBmb3IgZGlzY292ZXJpbmcgcGxheWVyIG51bWJlcnMgc28gdGhhdCB5b3UgY2FuIHdyaXRlIFtbI11dIHRvIHJlZmVyZW5jZSBhIHBsYXllciBpbiBtYWlsLlwiO1xuICAgIHZhciBwbGF5ZXJTaGVldCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHAgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlLmdhbGF4eS5wbGF5ZXJzO1xuICAgICAgICB2YXIgb3V0cHV0ID0gW107XG4gICAgICAgIHZhciBmaWVsZHMgPSBbXG4gICAgICAgICAgICBcImFsaWFzXCIsXG4gICAgICAgICAgICBcInRvdGFsX3N0YXJzXCIsXG4gICAgICAgICAgICBcInNoaXBzUGVyVGlja1wiLFxuICAgICAgICAgICAgXCJ0b3RhbF9zdHJlbmd0aFwiLFxuICAgICAgICAgICAgXCJ0b3RhbF9lY29ub215XCIsXG4gICAgICAgICAgICBcInRvdGFsX2ZsZWV0c1wiLFxuICAgICAgICAgICAgXCJ0b3RhbF9pbmR1c3RyeVwiLFxuICAgICAgICAgICAgXCJ0b3RhbF9zY2llbmNlXCIsXG4gICAgICAgIF07XG4gICAgICAgIG91dHB1dC5wdXNoKGZpZWxkcy5qb2luKFwiLFwiKSk7XG4gICAgICAgIHZhciBfbG9vcF8zID0gZnVuY3Rpb24gKGkpIHtcbiAgICAgICAgICAgIHBsYXllciA9IF9fYXNzaWduKHt9LCBwW2ldKTtcbiAgICAgICAgICAgIHZhciByZWNvcmQgPSBmaWVsZHMubWFwKGZ1bmN0aW9uIChmKSB7IHJldHVybiBwW2ldW2ZdOyB9KTtcbiAgICAgICAgICAgIG91dHB1dC5wdXNoKHJlY29yZC5qb2luKFwiLFwiKSk7XG4gICAgICAgIH07XG4gICAgICAgIGZvciAodmFyIGkgaW4gcCkge1xuICAgICAgICAgICAgX2xvb3BfMyhpKTtcbiAgICAgICAgfVxuICAgICAgICBjbGlwKG91dHB1dC5qb2luKFwiXFxuXCIpKTtcbiAgICB9O1xuICAgIGhvdGtleShcIiRcIiwgcGxheWVyU2hlZXQpO1xuICAgIHBsYXllclNoZWV0LmhlbHAgPVxuICAgICAgICBcIkdlbmVyYXRlIGEgcGxheWVyIHN1bW1hcnkgbWVhbiB0byBiZSBtYWRlIGludG8gYSBzcHJlYWRzaGVldC5cIiArXG4gICAgICAgICAgICBcIjxwPlRoZSBjbGlwYm9hcmQgc2hvdWxkIGJlIHBhc3RlZCBpbnRvIGEgQ1NWIGFuZCB0aGVuIGltcG9ydGVkLlwiO1xuICAgIHZhciBkcmF3T3ZlcmxheVN0cmluZyA9IGZ1bmN0aW9uIChjb250ZXh0LCBzLCB4LCB5LCBmZ0NvbG9yKSB7XG4gICAgICAgIGNvbnRleHQuZmlsbFN0eWxlID0gXCIjMDAwMDAwXCI7XG4gICAgICAgIGZvciAodmFyIHNtZWFyID0gMTsgc21lYXIgPCA0OyArK3NtZWFyKSB7XG4gICAgICAgICAgICBjb250ZXh0LmZpbGxUZXh0KHMsIHggKyBzbWVhciwgeSArIHNtZWFyKTtcbiAgICAgICAgICAgIGNvbnRleHQuZmlsbFRleHQocywgeCAtIHNtZWFyLCB5ICsgc21lYXIpO1xuICAgICAgICAgICAgY29udGV4dC5maWxsVGV4dChzLCB4IC0gc21lYXIsIHkgLSBzbWVhcik7XG4gICAgICAgICAgICBjb250ZXh0LmZpbGxUZXh0KHMsIHggKyBzbWVhciwgeSAtIHNtZWFyKTtcbiAgICAgICAgfVxuICAgICAgICBjb250ZXh0LmZpbGxTdHlsZSA9IGZnQ29sb3IgfHwgXCIjMDBmZjAwXCI7XG4gICAgICAgIGNvbnRleHQuZmlsbFRleHQocywgeCwgeSk7XG4gICAgfTtcbiAgICB2YXIgYW55U3RhckNhblNlZSA9IGZ1bmN0aW9uIChvd25lciwgZmxlZXQpIHtcbiAgICAgICAgdmFyIHN0YXJzID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5nYWxheHkuc3RhcnM7XG4gICAgICAgIHZhciB1bml2ZXJzZSA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2U7XG4gICAgICAgIHZhciBzY2FuUmFuZ2UgPSB1bml2ZXJzZS5nYWxheHkucGxheWVyc1tvd25lcl0udGVjaC5zY2FubmluZy52YWx1ZTtcbiAgICAgICAgZm9yICh2YXIgcyBpbiBzdGFycykge1xuICAgICAgICAgICAgdmFyIHN0YXIgPSBzdGFyc1tzXTtcbiAgICAgICAgICAgIGlmIChzdGFyLnB1aWQgPT0gb3duZXIpIHtcbiAgICAgICAgICAgICAgICB2YXIgZGlzdGFuY2UgPSB1bml2ZXJzZS5kaXN0YW5jZShzdGFyLngsIHN0YXIueSwgZmxlZXQueCwgZmxlZXQueSk7XG4gICAgICAgICAgICAgICAgaWYgKGRpc3RhbmNlIDw9IHNjYW5SYW5nZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG4gICAgdmFyIGhvb2tzTG9hZGVkID0gZmFsc2U7XG4gICAgdmFyIGhhbmRpY2FwU3RyaW5nID0gZnVuY3Rpb24gKHByZWZpeCkge1xuICAgICAgICB2YXIgcCA9IHByZWZpeCAhPT0gdW5kZWZpbmVkID8gcHJlZml4IDogY29tYmF0SGFuZGljYXAgPiAwID8gXCJFbmVteSBXU1wiIDogXCJNeSBXU1wiO1xuICAgICAgICByZXR1cm4gcCArIChjb21iYXRIYW5kaWNhcCA+IDAgPyBcIitcIiA6IFwiXCIpICsgY29tYmF0SGFuZGljYXA7XG4gICAgfTtcbiAgICB2YXIgbG9hZEhvb2tzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgc3VwZXJEcmF3VGV4dCA9IE5lcHR1bmVzUHJpZGUubnB1aS5tYXAuZHJhd1RleHQ7XG4gICAgICAgIE5lcHR1bmVzUHJpZGUubnB1aS5tYXAuZHJhd1RleHQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdW5pdmVyc2UgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlO1xuICAgICAgICAgICAgdmFyIG1hcCA9IE5lcHR1bmVzUHJpZGUubnB1aS5tYXA7XG4gICAgICAgICAgICBzdXBlckRyYXdUZXh0KCk7XG4gICAgICAgICAgICBtYXAuY29udGV4dC5mb250ID0gXCJcIi5jb25jYXQoMTQgKiBtYXAucGl4ZWxSYXRpbywgXCJweCBPcGVuU2Fuc1JlZ3VsYXIsIHNhbnMtc2VyaWZcIik7XG4gICAgICAgICAgICBtYXAuY29udGV4dC5maWxsU3R5bGUgPSBcIiNGRjAwMDBcIjtcbiAgICAgICAgICAgIG1hcC5jb250ZXh0LnRleHRBbGlnbiA9IFwicmlnaHRcIjtcbiAgICAgICAgICAgIG1hcC5jb250ZXh0LnRleHRCYXNlbGluZSA9IFwibWlkZGxlXCI7XG4gICAgICAgICAgICB2YXIgdiA9IHZlcnNpb247XG4gICAgICAgICAgICBpZiAoY29tYmF0SGFuZGljYXAgIT09IDApIHtcbiAgICAgICAgICAgICAgICB2ID0gXCJcIi5jb25jYXQoaGFuZGljYXBTdHJpbmcoKSwgXCIgXCIpLmNvbmNhdCh2KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRyYXdPdmVybGF5U3RyaW5nKG1hcC5jb250ZXh0LCB2LCBtYXAudmlld3BvcnRXaWR0aCAtIDEwLCBtYXAudmlld3BvcnRIZWlnaHQgLSAxNiAqIG1hcC5waXhlbFJhdGlvKTtcbiAgICAgICAgICAgIGlmIChOZXB0dW5lc1ByaWRlLm9yaWdpbmFsUGxheWVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBOZXB0dW5lc1ByaWRlLm9yaWdpbmFsUGxheWVyID0gdW5pdmVyc2UucGxheWVyLnVpZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChOZXB0dW5lc1ByaWRlLm9yaWdpbmFsUGxheWVyICE9PSB1bml2ZXJzZS5wbGF5ZXIudWlkKSB7XG4gICAgICAgICAgICAgICAgdmFyIG4gPSB1bml2ZXJzZS5nYWxheHkucGxheWVyc1t1bml2ZXJzZS5wbGF5ZXIudWlkXS5hbGlhcztcbiAgICAgICAgICAgICAgICBkcmF3T3ZlcmxheVN0cmluZyhtYXAuY29udGV4dCwgbiwgbWFwLnZpZXdwb3J0V2lkdGggLSAxMDAsIG1hcC52aWV3cG9ydEhlaWdodCAtIDIgKiAxNiAqIG1hcC5waXhlbFJhdGlvKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh1bml2ZXJzZS5zZWxlY3RlZEZsZWV0ICYmIHVuaXZlcnNlLnNlbGVjdGVkRmxlZXQucGF0aC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhcIlNlbGVjdGVkIGZsZWV0XCIsIHVuaXZlcnNlLnNlbGVjdGVkRmxlZXQpO1xuICAgICAgICAgICAgICAgIG1hcC5jb250ZXh0LmZvbnQgPSBcIlwiLmNvbmNhdCgxNCAqIG1hcC5waXhlbFJhdGlvLCBcInB4IE9wZW5TYW5zUmVndWxhciwgc2Fucy1zZXJpZlwiKTtcbiAgICAgICAgICAgICAgICBtYXAuY29udGV4dC5maWxsU3R5bGUgPSBcIiNGRjAwMDBcIjtcbiAgICAgICAgICAgICAgICBtYXAuY29udGV4dC50ZXh0QWxpZ24gPSBcImxlZnRcIjtcbiAgICAgICAgICAgICAgICBtYXAuY29udGV4dC50ZXh0QmFzZWxpbmUgPSBcIm1pZGRsZVwiO1xuICAgICAgICAgICAgICAgIHZhciBkeSA9IHVuaXZlcnNlLnNlbGVjdGVkRmxlZXQueSAtIHVuaXZlcnNlLnNlbGVjdGVkRmxlZXQubHk7XG4gICAgICAgICAgICAgICAgdmFyIGR4ID0gdW5pdmVyc2Uuc2VsZWN0ZWRGbGVldC54IC0gdW5pdmVyc2Uuc2VsZWN0ZWRGbGVldC5seDtcbiAgICAgICAgICAgICAgICBkeSA9IHVuaXZlcnNlLnNlbGVjdGVkRmxlZXQucGF0aFswXS55IC0gdW5pdmVyc2Uuc2VsZWN0ZWRGbGVldC55O1xuICAgICAgICAgICAgICAgIGR4ID0gdW5pdmVyc2Uuc2VsZWN0ZWRGbGVldC5wYXRoWzBdLnggLSB1bml2ZXJzZS5zZWxlY3RlZEZsZWV0Lng7XG4gICAgICAgICAgICAgICAgdmFyIGxpbmVIZWlnaHQgPSAxNiAqIG1hcC5waXhlbFJhdGlvO1xuICAgICAgICAgICAgICAgIHZhciByYWRpdXMgPSAyICogMC4wMjggKiBtYXAuc2NhbGUgKiBtYXAucGl4ZWxSYXRpbztcbiAgICAgICAgICAgICAgICB2YXIgYW5nbGUgPSBNYXRoLmF0YW4oZHkgLyBkeCk7XG4gICAgICAgICAgICAgICAgdmFyIG9mZnNldHggPSByYWRpdXMgKiBNYXRoLmNvcyhhbmdsZSk7XG4gICAgICAgICAgICAgICAgdmFyIG9mZnNldHkgPSByYWRpdXMgKiBNYXRoLnNpbihhbmdsZSk7XG4gICAgICAgICAgICAgICAgaWYgKG9mZnNldHggPiAwICYmIGR4ID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBvZmZzZXR4ICo9IC0xO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAob2Zmc2V0eSA+IDAgJiYgZHkgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIG9mZnNldHkgKj0gLTE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChvZmZzZXR4IDwgMCAmJiBkeCA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0eCAqPSAtMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG9mZnNldHkgPCAwICYmIGR5IDwgMCkge1xuICAgICAgICAgICAgICAgICAgICBvZmZzZXR5ICo9IC0xO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb21iYXRPdXRjb21lcygpO1xuICAgICAgICAgICAgICAgIHZhciBzID0gZmxlZXRPdXRjb21lc1t1bml2ZXJzZS5zZWxlY3RlZEZsZWV0LnVpZF0uZXRhO1xuICAgICAgICAgICAgICAgIHZhciBvID0gZmxlZXRPdXRjb21lc1t1bml2ZXJzZS5zZWxlY3RlZEZsZWV0LnVpZF0ub3V0Y29tZTtcbiAgICAgICAgICAgICAgICB2YXIgeCA9IG1hcC53b3JsZFRvU2NyZWVuWCh1bml2ZXJzZS5zZWxlY3RlZEZsZWV0LngpICsgb2Zmc2V0eDtcbiAgICAgICAgICAgICAgICB2YXIgeSA9IG1hcC53b3JsZFRvU2NyZWVuWSh1bml2ZXJzZS5zZWxlY3RlZEZsZWV0LnkpICsgb2Zmc2V0eTtcbiAgICAgICAgICAgICAgICBpZiAob2Zmc2V0eCA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgbWFwLmNvbnRleHQudGV4dEFsaWduID0gXCJyaWdodFwiO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBkcmF3T3ZlcmxheVN0cmluZyhtYXAuY29udGV4dCwgcywgeCwgeSk7XG4gICAgICAgICAgICAgICAgZHJhd092ZXJsYXlTdHJpbmcobWFwLmNvbnRleHQsIG8sIHgsIHkgKyBsaW5lSGVpZ2h0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghTmVwdHVuZXNQcmlkZS5nYW1lQ29uZmlnLnR1cm5CYXNlZCAmJlxuICAgICAgICAgICAgICAgIHVuaXZlcnNlLnRpbWVUb1RpY2soMSkubGVuZ3RoIDwgMykge1xuICAgICAgICAgICAgICAgIHZhciBsaW5lSGVpZ2h0ID0gMTYgKiBtYXAucGl4ZWxSYXRpbztcbiAgICAgICAgICAgICAgICBtYXAuY29udGV4dC5mb250ID0gXCJcIi5jb25jYXQoMTQgKiBtYXAucGl4ZWxSYXRpbywgXCJweCBPcGVuU2Fuc1JlZ3VsYXIsIHNhbnMtc2VyaWZcIik7XG4gICAgICAgICAgICAgICAgbWFwLmNvbnRleHQuZmlsbFN0eWxlID0gXCIjRkYwMDAwXCI7XG4gICAgICAgICAgICAgICAgbWFwLmNvbnRleHQudGV4dEFsaWduID0gXCJsZWZ0XCI7XG4gICAgICAgICAgICAgICAgbWFwLmNvbnRleHQudGV4dEJhc2VsaW5lID0gXCJtaWRkbGVcIjtcbiAgICAgICAgICAgICAgICB2YXIgcyA9IFwiVGljayA8IDEwcyBhd2F5IVwiO1xuICAgICAgICAgICAgICAgIGlmICh1bml2ZXJzZS50aW1lVG9UaWNrKDEpID09PSBcIjBzXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgcyA9IFwiVGljayBwYXNzZWQuIENsaWNrIHByb2R1Y3Rpb24gY291bnRkb3duIHRvIHJlZnJlc2guXCI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGRyYXdPdmVybGF5U3RyaW5nKG1hcC5jb250ZXh0LCBzLCAxMDAwLCBsaW5lSGVpZ2h0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh1bml2ZXJzZS5zZWxlY3RlZFN0YXIgJiZcbiAgICAgICAgICAgICAgICB1bml2ZXJzZS5zZWxlY3RlZFN0YXIucHVpZCAhPSB1bml2ZXJzZS5wbGF5ZXIudWlkICYmXG4gICAgICAgICAgICAgICAgdW5pdmVyc2Uuc2VsZWN0ZWRTdGFyLnB1aWQgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgLy8gZW5lbXkgc3RhciBzZWxlY3RlZDsgc2hvdyBIVUQgZm9yIHNjYW5uaW5nIHZpc2liaWxpdHlcbiAgICAgICAgICAgICAgICBtYXAuY29udGV4dC50ZXh0QWxpZ24gPSBcImxlZnRcIjtcbiAgICAgICAgICAgICAgICBtYXAuY29udGV4dC50ZXh0QmFzZWxpbmUgPSBcIm1pZGRsZVwiO1xuICAgICAgICAgICAgICAgIHZhciB4T2Zmc2V0ID0gMjYgKiBtYXAucGl4ZWxSYXRpbztcbiAgICAgICAgICAgICAgICAvL21hcC5jb250ZXh0LnRyYW5zbGF0ZSh4T2Zmc2V0LCAwKTtcbiAgICAgICAgICAgICAgICB2YXIgZmxlZXRzID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5nYWxheHkuZmxlZXRzO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGYgaW4gZmxlZXRzKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBmbGVldCA9IGZsZWV0c1tmXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZsZWV0LnB1aWQgPT09IHVuaXZlcnNlLnBsYXllci51aWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkeCA9IHVuaXZlcnNlLnNlbGVjdGVkU3Rhci54IC0gZmxlZXQueDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkeSA9IHVuaXZlcnNlLnNlbGVjdGVkU3Rhci55IC0gZmxlZXQueTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkaXN0YW5jZSA9IE1hdGguc3FydChkeCAqIGR4ICsgZHkgKiBkeSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgb2Zmc2V0eCA9IHhPZmZzZXQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgb2Zmc2V0eSA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgeCA9IG1hcC53b3JsZFRvU2NyZWVuWChmbGVldC54KSArIG9mZnNldHg7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgeSA9IG1hcC53b3JsZFRvU2NyZWVuWShmbGVldC55KSArIG9mZnNldHk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGlzdGFuY2UgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVuaXZlcnNlLmdhbGF4eS5wbGF5ZXJzW3VuaXZlcnNlLnNlbGVjdGVkU3Rhci5wdWlkXS50ZWNoLnNjYW5uaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmbGVldC5wYXRoICYmIGZsZWV0LnBhdGgubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkeCA9IGZsZWV0LnBhdGhbMF0ueCAtIHVuaXZlcnNlLnNlbGVjdGVkU3Rhci54O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkeSA9IGZsZWV0LnBhdGhbMF0ueSAtIHVuaXZlcnNlLnNlbGVjdGVkU3Rhci55O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXN0YW5jZSA9IE1hdGguc3FydChkeCAqIGR4ICsgZHkgKiBkeSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkaXN0YW5jZSA8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bml2ZXJzZS5nYWxheHkucGxheWVyc1t1bml2ZXJzZS5zZWxlY3RlZFN0YXIucHVpZF0udGVjaFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zY2FubmluZy52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHN0ZXBSYWRpdXMgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlLmdhbGF4eS5mbGVldF9zcGVlZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmbGVldC53YXJwU3BlZWQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RlcFJhZGl1cyAqPSAzO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZHggPSBmbGVldC54IC0gZmxlZXQucGF0aFswXS54O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZHkgPSBmbGVldC55IC0gZmxlZXQucGF0aFswXS55O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGFuZ2xlID0gTWF0aC5hdGFuKGR5IC8gZHgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHN0ZXB4ID0gc3RlcFJhZGl1cyAqIE1hdGguY29zKGFuZ2xlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzdGVweSA9IHN0ZXBSYWRpdXMgKiBNYXRoLnNpbihhbmdsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3RlcHggPiAwICYmIGR4ID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ZXB4ICo9IC0xO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN0ZXB5ID4gMCAmJiBkeSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGVweSAqPSAtMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdGVweCA8IDAgJiYgZHggPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RlcHggKj0gLTE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3RlcHkgPCAwICYmIGR5IDwgMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ZXB5ICo9IC0xO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRpY2tzID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgeF8xID0gdGlja3MgKiBzdGVweCArIE51bWJlcihmbGVldC54KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgeV8xID0gdGlja3MgKiBzdGVweSArIE51bWJlcihmbGVldC55KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2xldCBzeCA9IG1hcC53b3JsZFRvU2NyZWVuWCh4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2xldCBzeSA9IG1hcC53b3JsZFRvU2NyZWVuWSh5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkeCA9IHhfMSAtIHVuaXZlcnNlLnNlbGVjdGVkU3Rhci54O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGR5ID0geV8xIC0gdW5pdmVyc2Uuc2VsZWN0ZWRTdGFyLnk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzdGFuY2UgPSBNYXRoLnNxcnQoZHggKiBkeCArIGR5ICogZHkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coZGlzdGFuY2UsIHgsIHkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vZHJhd092ZXJsYXlTdHJpbmcobWFwLmNvbnRleHQsIFwib1wiLCBzeCwgc3kpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpY2tzICs9IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IHdoaWxlIChkaXN0YW5jZSA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5pdmVyc2UuZ2FsYXh5LnBsYXllcnNbdW5pdmVyc2Uuc2VsZWN0ZWRTdGFyLnB1aWRdLnRlY2hcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnNjYW5uaW5nLnZhbHVlICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGlja3MgPD0gZmxlZXQuZXRhRmlyc3QgKyAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpY2tzIC09IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdmlzQ29sb3IgPSBcIiMwMGZmMDBcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhbnlTdGFyQ2FuU2VlKHVuaXZlcnNlLnNlbGVjdGVkU3Rhci5wdWlkLCBmbGVldCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aXNDb2xvciA9IFwiIzg4ODg4OFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZHJhd092ZXJsYXlTdHJpbmcobWFwLmNvbnRleHQsIFwiU2NhbiBcIi5jb25jYXQodGlja1RvRXRhU3RyaW5nKHRpY2tzKSksIHgsIHksIHZpc0NvbG9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvL21hcC5jb250ZXh0LnRyYW5zbGF0ZSgteE9mZnNldCwgMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodW5pdmVyc2UucnVsZXIuc3RhcnMubGVuZ3RoID09IDIpIHtcbiAgICAgICAgICAgICAgICB2YXIgcDEgPSB1bml2ZXJzZS5ydWxlci5zdGFyc1swXS5wdWlkO1xuICAgICAgICAgICAgICAgIHZhciBwMiA9IHVuaXZlcnNlLnJ1bGVyLnN0YXJzWzFdLnB1aWQ7XG4gICAgICAgICAgICAgICAgaWYgKHAxICE9PSBwMiAmJiBwMSAhPT0gLTEgJiYgcDIgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coXCJ0d28gc3RhciBydWxlclwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIC8vVE9ETzogTGVhcm4gbW9yZSBhYm91dCB0aGlzIGhvb2suIGl0cyBydW4gdG9vIG11Y2guLlxuICAgICAgICBDcnV4LmZvcm1hdCA9IGZ1bmN0aW9uIChzLCB0ZW1wbGF0ZURhdGEpIHtcbiAgICAgICAgICAgIGlmICghcykge1xuICAgICAgICAgICAgICAgIHJldHVybiBcImVycm9yXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgaTtcbiAgICAgICAgICAgIHZhciBmcDtcbiAgICAgICAgICAgIHZhciBzcDtcbiAgICAgICAgICAgIHZhciBzdWI7XG4gICAgICAgICAgICB2YXIgcGF0dGVybjtcbiAgICAgICAgICAgIGkgPSAwO1xuICAgICAgICAgICAgZnAgPSAwO1xuICAgICAgICAgICAgc3AgPSAwO1xuICAgICAgICAgICAgc3ViID0gXCJcIjtcbiAgICAgICAgICAgIHBhdHRlcm4gPSBcIlwiO1xuICAgICAgICAgICAgLy8gbG9vayBmb3Igc3RhbmRhcmQgcGF0dGVybnNcbiAgICAgICAgICAgIHdoaWxlIChmcCA+PSAwICYmIGkgPCAxMDAwKSB7XG4gICAgICAgICAgICAgICAgaSA9IGkgKyAxO1xuICAgICAgICAgICAgICAgIGZwID0gcy5zZWFyY2goXCJcXFxcW1xcXFxbXCIpO1xuICAgICAgICAgICAgICAgIHNwID0gcy5zZWFyY2goXCJcXFxcXVxcXFxdXCIpO1xuICAgICAgICAgICAgICAgIHN1YiA9IHMuc2xpY2UoZnAgKyAyLCBzcCk7XG4gICAgICAgICAgICAgICAgdmFyIHVyaSA9IHN1Yi5yZXBsYWNlQWxsKFwiJiN4MkY7XCIsIFwiL1wiKTtcbiAgICAgICAgICAgICAgICBwYXR0ZXJuID0gXCJbW1wiLmNvbmNhdChzdWIsIFwiXV1cIik7XG4gICAgICAgICAgICAgICAgaWYgKHRlbXBsYXRlRGF0YVtzdWJdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcyA9IHMucmVwbGFjZShwYXR0ZXJuLCB0ZW1wbGF0ZURhdGFbc3ViXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKC9eYXBpOlxcd3s2fSQvLnRlc3Qoc3ViKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgYXBpTGluayA9IFwiPGEgb25DbGljaz0nQ3J1eC5jcnV4LnRyaWdnZXIoXFxcInN3aXRjaF91c2VyX2FwaVxcXCIsIFxcXCJcIi5jb25jYXQoc3ViLCBcIlxcXCIpJz4gVmlldyBhcyBcIikuY29uY2F0KHN1YiwgXCI8L2E+XCIpO1xuICAgICAgICAgICAgICAgICAgICBhcGlMaW5rICs9IFwiIG9yIDxhIG9uQ2xpY2s9J0NydXguY3J1eC50cmlnZ2VyKFxcXCJtZXJnZV91c2VyX2FwaVxcXCIsIFxcXCJcIi5jb25jYXQoc3ViLCBcIlxcXCIpJz4gTWVyZ2UgXCIpLmNvbmNhdChzdWIsIFwiPC9hPlwiKTtcbiAgICAgICAgICAgICAgICAgICAgcyA9IHMucmVwbGFjZShwYXR0ZXJuLCBhcGlMaW5rKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoaXNfdmFsaWRfaW1hZ2VfdXJsKHVyaSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcyA9IHMucmVwbGFjZShwYXR0ZXJuLCBcIjxpbWcgd2lkdGg9XFxcIjEwMCVcXFwiIHNyYz0nXCIuY29uY2F0KHVyaSwgXCInIC8+XCIpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoaXNfdmFsaWRfeW91dHViZSh1cmkpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vUGFzc1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcyA9IHMucmVwbGFjZShwYXR0ZXJuLCBcIihcIi5jb25jYXQoc3ViLCBcIilcIikpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBzO1xuICAgICAgICB9O1xuICAgICAgICB2YXIgbnB1aSA9IE5lcHR1bmVzUHJpZGUubnB1aTtcbiAgICAgICAgLy9SZXNlYXJjaCBidXR0b24gdG8gcXVpY2tseSB0ZWxsIGZyaWVuZHMgcmVzZWFyY2hcbiAgICAgICAgTmVwdHVuZXNQcmlkZS50ZW1wbGF0ZXNbXCJucGFfcmVzZWFyY2hcIl0gPSBcIlJlc2VhcmNoXCI7XG4gICAgICAgIHZhciBzdXBlck5ld01lc3NhZ2VDb21tZW50Qm94ID0gbnB1aS5OZXdNZXNzYWdlQ29tbWVudEJveDtcbiAgICAgICAgdmFyIHJlcG9ydFJlc2VhcmNoSG9vayA9IGZ1bmN0aW9uIChfZSwgX2QpIHtcbiAgICAgICAgICAgIHZhciB0ZXh0ID0gZ2V0X3Jlc2VhcmNoX3RleHQoTmVwdHVuZXNQcmlkZSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyh0ZXh0KTtcbiAgICAgICAgICAgIHZhciBpbmJveCA9IE5lcHR1bmVzUHJpZGUuaW5ib3g7XG4gICAgICAgICAgICBpbmJveC5jb21tZW50RHJhZnRzW2luYm94LnNlbGVjdGVkTWVzc2FnZS5rZXldICs9IHRleHQ7XG4gICAgICAgICAgICBpbmJveC50cmlnZ2VyKFwic2hvd19zY3JlZW5cIiwgXCJkaXBsb21hY3lfZGV0YWlsXCIpO1xuICAgICAgICB9O1xuICAgICAgICBOZXB0dW5lc1ByaWRlLm5wLm9uKFwicGFzdGVfcmVzZWFyY2hcIiwgcmVwb3J0UmVzZWFyY2hIb29rKTtcbiAgICAgICAgbnB1aS5OZXdNZXNzYWdlQ29tbWVudEJveCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB3aWRnZXQgPSBzdXBlck5ld01lc3NhZ2VDb21tZW50Qm94KCk7XG4gICAgICAgICAgICB2YXIgcmVzZWFyY2hfYnV0dG9uID0gQ3J1eC5CdXR0b24oXCJucGFfcmVzZWFyY2hcIiwgXCJwYXN0ZV9yZXNlYXJjaFwiLCBcInJlc2VhcmNoXCIpLmdyaWQoMTEsIDEyLCA4LCAzKTtcbiAgICAgICAgICAgIHJlc2VhcmNoX2J1dHRvbi5yb29zdCh3aWRnZXQpO1xuICAgICAgICAgICAgcmV0dXJuIHdpZGdldDtcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIHN1cGVyRm9ybWF0VGltZSA9IENydXguZm9ybWF0VGltZTtcbiAgICAgICAgdmFyIHJlbGF0aXZlVGltZXMgPSAwO1xuICAgICAgICBDcnV4LmZvcm1hdFRpbWUgPSBmdW5jdGlvbiAobXMsIG1pbnMsIHNlY3MpIHtcbiAgICAgICAgICAgIHN3aXRjaCAocmVsYXRpdmVUaW1lcykge1xuICAgICAgICAgICAgICAgIGNhc2UgMDogLy9zdGFuZGFyZFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3VwZXJGb3JtYXRUaW1lKG1zLCBtaW5zLCBzZWNzKTtcbiAgICAgICAgICAgICAgICBjYXNlIDE6IC8vRVRBLCAtIHR1cm4ocykgZm9yIHR1cm5iYXNlZFxuICAgICAgICAgICAgICAgICAgICBpZiAoIU5lcHR1bmVzUHJpZGUuZ2FtZUNvbmZpZy50dXJuQmFzZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtc1RvRXRhU3RyaW5nKG1zLCBcIlwiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0aWNrX3JhdGUgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlLmdhbGF4eS50aWNrX3JhdGU7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCJcIi5jb25jYXQoc3VwZXJGb3JtYXRUaW1lKG1zLCBtaW5zLCBzZWNzKSwgXCIgLSBcIikuY29uY2F0KCgoKG1zIC8gMzYwMDAwMCkgKiAxMCkgL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpY2tfcmF0ZSkudG9GaXhlZCgyKSwgXCIgdHVybihzKVwiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhc2UgMjogLy9jeWNsZXMgKyB0aWNrcyBmb3JtYXRcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1zVG9DeWNsZVN0cmluZyhtcywgXCJcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHZhciBzd2l0Y2hUaW1lcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vMCA9IHN0YW5kYXJkLCAxID0gRVRBLCAtIHR1cm4ocykgZm9yIHR1cm5iYXNlZCwgMiA9IGN5Y2xlcyArIHRpY2tzIGZvcm1hdFxuICAgICAgICAgICAgcmVsYXRpdmVUaW1lcyA9IChyZWxhdGl2ZVRpbWVzICsgMSkgJSAzO1xuICAgICAgICB9O1xuICAgICAgICBob3RrZXkoXCIlXCIsIHN3aXRjaFRpbWVzKTtcbiAgICAgICAgc3dpdGNoVGltZXMuaGVscCA9XG4gICAgICAgICAgICBcIkNoYW5nZSB0aGUgZGlzcGxheSBvZiBFVEFzIGJldHdlZW4gcmVsYXRpdmUgdGltZXMsIGFic29sdXRlIGNsb2NrIHRpbWVzLCBhbmQgY3ljbGUgdGltZXMuIE1ha2VzIHByZWRpY3RpbmcgXCIgK1xuICAgICAgICAgICAgICAgIFwiaW1wb3J0YW50IHRpbWVzIG9mIGRheSB0byBzaWduIGluIGFuZCBjaGVjayBtdWNoIGVhc2llciBlc3BlY2lhbGx5IGZvciBtdWx0aS1sZWcgZmxlZXQgbW92ZW1lbnRzLiBTb21ldGltZXMgeW91IFwiICtcbiAgICAgICAgICAgICAgICBcIndpbGwgbmVlZCB0byByZWZyZXNoIHRoZSBkaXNwbGF5IHRvIHNlZSB0aGUgZGlmZmVyZW50IHRpbWVzLlwiO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KENydXgsIFwidG91Y2hFbmFibGVkXCIsIHtcbiAgICAgICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIGZhbHNlOyB9LFxuICAgICAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJDcnV4LnRvdWNoRW5hYmxlZCBzZXQgaWdub3JlZFwiLCB4KTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xuICAgICAgICB9XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShOZXB0dW5lc1ByaWRlLm5wdWkubWFwLCBcImlnbm9yZU1vdXNlRXZlbnRzXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gZmFsc2U7IH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh4KSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJOZXB0dW5lc1ByaWRlLm5wdWkubWFwLmlnbm9yZU1vdXNlRXZlbnRzIHNldCBpZ25vcmVkXCIsIHgpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgICAgIGhvb2tzTG9hZGVkID0gdHJ1ZTtcbiAgICB9O1xuICAgIHZhciBpbml0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgX2E7XG4gICAgICAgIGlmICgoKF9hID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZSkgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLmdhbGF4eSkgJiYgTmVwdHVuZXNQcmlkZS5ucHVpLm1hcCkge1xuICAgICAgICAgICAgbGlua0ZsZWV0cygpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJGbGVldCBsaW5raW5nIGNvbXBsZXRlLlwiKTtcbiAgICAgICAgICAgIGlmICghaG9va3NMb2FkZWQpIHtcbiAgICAgICAgICAgICAgICBsb2FkSG9va3MoKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkhVRCBzZXR1cCBjb21wbGV0ZS5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkhVRCBzZXR1cCBhbHJlYWR5IGRvbmU7IHNraXBwaW5nLlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGhvbWVQbGFuZXRzKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkdhbWUgbm90IGZ1bGx5IGluaXRpYWxpemVkIHlldDsgd2FpdC5cIiwgTmVwdHVuZXNQcmlkZS51bml2ZXJzZSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGhvdGtleShcIkBcIiwgaW5pdCk7XG4gICAgaW5pdC5oZWxwID1cbiAgICAgICAgXCJSZWluaXRpYWxpemUgTmVwdHVuZSdzIFByaWRlIEFnZW50LiBVc2UgdGhlIEAgaG90a2V5IGlmIHRoZSB2ZXJzaW9uIGlzIG5vdCBiZWluZyBzaG93biBvbiB0aGUgbWFwIGFmdGVyIGRyYWdnaW5nLlwiO1xuICAgIGlmICgoKF9iID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZSkgPT09IG51bGwgfHwgX2IgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9iLmdhbGF4eSkgJiYgTmVwdHVuZXNQcmlkZS5ucHVpLm1hcCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIlVuaXZlcnNlIGFscmVhZHkgbG9hZGVkLiBIeXBlcmxpbmsgZmxlZXRzICYgbG9hZCBob29rcy5cIik7XG4gICAgICAgIGluaXQoKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiVW5pdmVyc2Ugbm90IGxvYWRlZC4gSG9vayBvblNlcnZlclJlc3BvbnNlLlwiKTtcbiAgICAgICAgdmFyIHN1cGVyT25TZXJ2ZXJSZXNwb25zZV8xID0gTmVwdHVuZXNQcmlkZS5ucC5vblNlcnZlclJlc3BvbnNlO1xuICAgICAgICBOZXB0dW5lc1ByaWRlLm5wLm9uU2VydmVyUmVzcG9uc2UgPSBmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgIHN1cGVyT25TZXJ2ZXJSZXNwb25zZV8xKHJlc3BvbnNlKTtcbiAgICAgICAgICAgIGlmIChyZXNwb25zZS5ldmVudCA9PT0gXCJvcmRlcjpwbGF5ZXJfYWNoaWV2ZW1lbnRzXCIpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkluaXRpYWwgbG9hZCBjb21wbGV0ZS4gUmVpbnN0YWxsLlwiKTtcbiAgICAgICAgICAgICAgICBpbml0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChyZXNwb25zZS5ldmVudCA9PT0gXCJvcmRlcjpmdWxsX3VuaXZlcnNlXCIpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIlVuaXZlcnNlIHJlY2VpdmVkLiBSZWluc3RhbGwuXCIpO1xuICAgICAgICAgICAgICAgIE5lcHR1bmVzUHJpZGUub3JpZ2luYWxQbGF5ZXIgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlLnBsYXllci51aWQ7XG4gICAgICAgICAgICAgICAgaW5pdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoIWhvb2tzTG9hZGVkICYmIE5lcHR1bmVzUHJpZGUubnB1aS5tYXApIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkhvb2tzIG5lZWQgbG9hZGluZyBhbmQgbWFwIGlzIHJlYWR5LiBSZWluc3RhbGwuXCIpO1xuICAgICAgICAgICAgICAgIGluaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG4gICAgdmFyIG90aGVyVXNlckNvZGUgPSB1bmRlZmluZWQ7XG4gICAgdmFyIGdhbWUgPSBOZXB0dW5lc1ByaWRlLmdhbWVOdW1iZXI7XG4gICAgdmFyIHN3aXRjaFVzZXIgPSBmdW5jdGlvbiAoZXZlbnQsIGRhdGEpIHtcbiAgICAgICAgaWYgKE5lcHR1bmVzUHJpZGUub3JpZ2luYWxQbGF5ZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgTmVwdHVuZXNQcmlkZS5vcmlnaW5hbFBsYXllciA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2UucGxheWVyLnVpZDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgY29kZSA9IChkYXRhID09PSBudWxsIHx8IGRhdGEgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGRhdGEuc3BsaXQoXCI6XCIpWzFdKSB8fCBvdGhlclVzZXJDb2RlO1xuICAgICAgICBvdGhlclVzZXJDb2RlID0gY29kZTtcbiAgICAgICAgaWYgKG90aGVyVXNlckNvZGUpIHtcbiAgICAgICAgICAgIHZhciBwYXJhbXMgPSB7XG4gICAgICAgICAgICAgICAgZ2FtZV9udW1iZXI6IGdhbWUsXG4gICAgICAgICAgICAgICAgYXBpX3ZlcnNpb246IFwiMC4xXCIsXG4gICAgICAgICAgICAgICAgY29kZTogb3RoZXJVc2VyQ29kZSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB2YXIgZWdnZXJzID0galF1ZXJ5LmFqYXgoe1xuICAgICAgICAgICAgICAgIHR5cGU6IFwiUE9TVFwiLFxuICAgICAgICAgICAgICAgIHVybDogXCJodHRwczovL25wLmlyb25oZWxtZXQuY29tL2FwaVwiLFxuICAgICAgICAgICAgICAgIGFzeW5jOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBkYXRhOiBwYXJhbXMsXG4gICAgICAgICAgICAgICAgZGF0YVR5cGU6IFwianNvblwiLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBOZXB0dW5lc1ByaWRlLm5wLm9uRnVsbFVuaXZlcnNlKG51bGwsIGVnZ2Vycy5yZXNwb25zZUpTT04uc2Nhbm5pbmdfZGF0YSk7XG4gICAgICAgICAgICBOZXB0dW5lc1ByaWRlLm5wdWkub25IaWRlU2NyZWVuKG51bGwsIHRydWUpO1xuICAgICAgICAgICAgTmVwdHVuZXNQcmlkZS5ucC50cmlnZ2VyKFwic2VsZWN0X3BsYXllclwiLCBbXG4gICAgICAgICAgICAgICAgTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5wbGF5ZXIudWlkLFxuICAgICAgICAgICAgICAgIHRydWUsXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIGluaXQoKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgaG90a2V5KFwiPlwiLCBzd2l0Y2hVc2VyKTtcbiAgICBzd2l0Y2hVc2VyLmhlbHAgPVxuICAgICAgICBcIlN3aXRjaCB2aWV3cyB0byB0aGUgbGFzdCB1c2VyIHdob3NlIEFQSSBrZXkgd2FzIHVzZWQgdG8gbG9hZCBkYXRhLiBUaGUgSFVEIHNob3dzIHRoZSBjdXJyZW50IHVzZXIgd2hlbiBcIiArXG4gICAgICAgICAgICBcIml0IGlzIG5vdCB5b3VyIG93biBhbGlhcyB0byBoZWxwIHJlbWluZCB5b3UgdGhhdCB5b3UgYXJlbid0IGluIGNvbnRyb2wgb2YgdGhpcyB1c2VyLlwiO1xuICAgIGhvdGtleShcInxcIiwgbWVyZ2VVc2VyKTtcbiAgICBtZXJnZVVzZXIuaGVscCA9XG4gICAgICAgIFwiTWVyZ2UgdGhlIGxhdGVzdCBkYXRhIGZyb20gdGhlIGxhc3QgdXNlciB3aG9zZSBBUEkga2V5IHdhcyB1c2VkIHRvIGxvYWQgZGF0YS4gVGhpcyBpcyB1c2VmdWwgYWZ0ZXIgYSB0aWNrIFwiICtcbiAgICAgICAgICAgIFwicGFzc2VzIGFuZCB5b3UndmUgcmVsb2FkZWQsIGJ1dCB5b3Ugc3RpbGwgd2FudCB0aGUgbWVyZ2VkIHNjYW4gZGF0YSBmcm9tIHR3byBwbGF5ZXJzIG9uc2NyZWVuLlwiO1xuICAgIE5lcHR1bmVzUHJpZGUubnAub24oXCJzd2l0Y2hfdXNlcl9hcGlcIiwgc3dpdGNoVXNlcik7XG4gICAgTmVwdHVuZXNQcmlkZS5ucC5vbihcIm1lcmdlX3VzZXJfYXBpXCIsIG1lcmdlVXNlcik7XG4gICAgdmFyIG5wYUhlbHAgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBoZWxwID0gW1wiPEgxPlwiLmNvbmNhdCh0aXRsZSwgXCI8L0gxPlwiKV07XG4gICAgICAgIGZvciAodmFyIHBhaXIgaW4gaG90a2V5cykge1xuICAgICAgICAgICAgdmFyIGtleSA9IGhvdGtleXNbcGFpcl1bMF07XG4gICAgICAgICAgICB2YXIgYWN0aW9uID0gaG90a2V5c1twYWlyXVsxXTtcbiAgICAgICAgICAgIGhlbHAucHVzaChcIjxoMj5Ib3RrZXk6IFwiLmNvbmNhdChrZXksIFwiPC9oMj5cIikpO1xuICAgICAgICAgICAgaWYgKGFjdGlvbi5oZWxwKSB7XG4gICAgICAgICAgICAgICAgaGVscC5wdXNoKGFjdGlvbi5oZWxwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGhlbHAucHVzaChcIjxwPk5vIGRvY3VtZW50YXRpb24geWV0LjxwPjxjb2RlPlwiLmNvbmNhdChhY3Rpb24udG9Mb2NhbGVTdHJpbmcoKSwgXCI8L2NvZGU+XCIpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlLmhlbHBIVE1MID0gaGVscC5qb2luKFwiXCIpO1xuICAgICAgICBOZXB0dW5lc1ByaWRlLm5wLnRyaWdnZXIoXCJzaG93X3NjcmVlblwiLCBcImhlbHBcIik7XG4gICAgfTtcbiAgICBucGFIZWxwLmhlbHAgPSBcIkRpc3BsYXkgdGhpcyBoZWxwIHNjcmVlbi5cIjtcbiAgICBob3RrZXkoXCI/XCIsIG5wYUhlbHApO1xuICAgIHZhciBhdXRvY29tcGxldGVNb2RlID0gMDtcbiAgICB2YXIgYXV0b2NvbXBsZXRlVHJpZ2dlciA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGlmIChlLnRhcmdldC50eXBlID09PSBcInRleHRhcmVhXCIpIHtcbiAgICAgICAgICAgIGlmIChhdXRvY29tcGxldGVNb2RlKSB7XG4gICAgICAgICAgICAgICAgdmFyIHN0YXJ0ID0gYXV0b2NvbXBsZXRlTW9kZTtcbiAgICAgICAgICAgICAgICB2YXIgZW5kQnJhY2tldCA9IGUudGFyZ2V0LnZhbHVlLmluZGV4T2YoXCJdXCIsIHN0YXJ0KTtcbiAgICAgICAgICAgICAgICBpZiAoZW5kQnJhY2tldCA9PT0gLTEpXG4gICAgICAgICAgICAgICAgICAgIGVuZEJyYWNrZXQgPSBlLnRhcmdldC52YWx1ZS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgdmFyIGF1dG9TdHJpbmcgPSBlLnRhcmdldC52YWx1ZS5zdWJzdHJpbmcoc3RhcnQsIGVuZEJyYWNrZXQpO1xuICAgICAgICAgICAgICAgIHZhciBrZXkgPSBlLmtleTtcbiAgICAgICAgICAgICAgICBpZiAoa2V5ID09PSBcIl1cIikge1xuICAgICAgICAgICAgICAgICAgICBhdXRvY29tcGxldGVNb2RlID0gMDtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG0gPSBhdXRvU3RyaW5nLm1hdGNoKC9eWzAtOV1bMC05XSokLyk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChtID09PSBudWxsIHx8IG0gPT09IHZvaWQgMCA/IHZvaWQgMCA6IG0ubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcHVpZCA9IE51bWJlcihhdXRvU3RyaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBlbmQgPSBlLnRhcmdldC5zZWxlY3Rpb25FbmQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgYXV0byA9IFwiXCIuY29uY2F0KHB1aWQsIFwiXV0gXCIpLmNvbmNhdChOZXB0dW5lc1ByaWRlLnVuaXZlcnNlLmdhbGF4eS5wbGF5ZXJzW3B1aWRdLmFsaWFzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGUudGFyZ2V0LnZhbHVlID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlLnRhcmdldC52YWx1ZS5zdWJzdHJpbmcoMCwgc3RhcnQpICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXV0byArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUudGFyZ2V0LnZhbHVlLnN1YnN0cmluZyhlbmQsIGUudGFyZ2V0LnZhbHVlLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBlLnRhcmdldC5zZWxlY3Rpb25TdGFydCA9IHN0YXJ0ICsgYXV0by5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgICAgICBlLnRhcmdldC5zZWxlY3Rpb25FbmQgPSBzdGFydCArIGF1dG8ubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoZS50YXJnZXQuc2VsZWN0aW9uU3RhcnQgPiAxKSB7XG4gICAgICAgICAgICAgICAgdmFyIHN0YXJ0ID0gZS50YXJnZXQuc2VsZWN0aW9uU3RhcnQgLSAyO1xuICAgICAgICAgICAgICAgIHZhciBzcyA9IGUudGFyZ2V0LnZhbHVlLnN1YnN0cmluZyhzdGFydCwgc3RhcnQgKyAyKTtcbiAgICAgICAgICAgICAgICBhdXRvY29tcGxldGVNb2RlID0gc3MgPT09IFwiW1tcIiA/IGUudGFyZ2V0LnNlbGVjdGlvblN0YXJ0IDogMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG4gICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKFwia2V5dXBcIiwgYXV0b2NvbXBsZXRlVHJpZ2dlcik7XG4gICAgY29uc29sZS5sb2coXCJTQVQ6IE5lcHR1bmUncyBQcmlkZSBBZ2VudCBpbmplY3Rpb24gZmluaXNoZWQuXCIpO1xuICAgIGNvbnNvbGUubG9nKFwiR2V0dGluZyBoZXJvIVwiLCBnZXRfaGVybyhOZXB0dW5lc1ByaWRlLnVuaXZlcnNlKSk7XG59XG52YXIgZm9yY2VfYWRkX2N1c3RvbV9wbGF5ZXJfcGFuZWwgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKFwiUGxheWVyUGFuZWxcIiBpbiBOZXB0dW5lc1ByaWRlLm5wdWkpIHtcbiAgICAgICAgYWRkX2N1c3RvbV9wbGF5ZXJfcGFuZWwoKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHNldFRpbWVvdXQoYWRkX2N1c3RvbV9wbGF5ZXJfcGFuZWwsIDMwMDApO1xuICAgIH1cbn07XG52YXIgYWRkX2N1c3RvbV9wbGF5ZXJfcGFuZWwgPSBmdW5jdGlvbiAoKSB7XG4gICAgTmVwdHVuZXNQcmlkZS5ucHVpLlBsYXllclBhbmVsID0gZnVuY3Rpb24gKHBsYXllciwgc2hvd0VtcGlyZSkge1xuICAgICAgICB2YXIgdW5pdmVyc2UgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlO1xuICAgICAgICB2YXIgbnB1aSA9IE5lcHR1bmVzUHJpZGUubnB1aTtcbiAgICAgICAgdmFyIHBsYXllclBhbmVsID0gQ3J1eC5XaWRnZXQoXCJyZWxcIikuc2l6ZSg0ODAsIDI2NCAtIDggKyA0OCk7XG4gICAgICAgIHZhciBoZWFkaW5nID0gXCJwbGF5ZXJcIjtcbiAgICAgICAgaWYgKHVuaXZlcnNlLnBsYXllckFjaGlldmVtZW50cyAmJlxuICAgICAgICAgICAgTmVwdHVuZXNQcmlkZS5nYW1lQ29uZmlnLmFub255bWl0eSA9PT0gMCkge1xuICAgICAgICAgICAgaWYgKHVuaXZlcnNlLnBsYXllckFjaGlldmVtZW50c1twbGF5ZXIudWlkXSkge1xuICAgICAgICAgICAgICAgIGlmICh1bml2ZXJzZS5wbGF5ZXJBY2hpZXZlbWVudHNbcGxheWVyLnVpZF0ucHJlbWl1bSA9PT0gXCJwcmVtaXVtXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgaGVhZGluZyA9IFwicHJlbWl1bV9wbGF5ZXJcIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHVuaXZlcnNlLnBsYXllckFjaGlldmVtZW50c1twbGF5ZXIudWlkXS5wcmVtaXVtID09PSBcImxpZmV0aW1lXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgaGVhZGluZyA9IFwibGlmZXRpbWVfcHJlbWl1bV9wbGF5ZXJcIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgQ3J1eC5UZXh0KGhlYWRpbmcsIFwic2VjdGlvbl90aXRsZSBjb2xfYmxhY2tcIilcbiAgICAgICAgICAgIC5ncmlkKDAsIDAsIDMwLCAzKVxuICAgICAgICAgICAgLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgaWYgKHBsYXllci5haSkge1xuICAgICAgICAgICAgQ3J1eC5UZXh0KFwiYWlfYWRtaW5cIiwgXCJ0eHRfcmlnaHQgcGFkMTJcIilcbiAgICAgICAgICAgICAgICAuZ3JpZCgwLCAwLCAzMCwgMylcbiAgICAgICAgICAgICAgICAucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICB9XG4gICAgICAgIENydXguSW1hZ2UoXCIuLi9pbWFnZXMvYXZhdGFycy8xNjAvXCIuY29uY2F0KHBsYXllci5hdmF0YXIsIFwiLmpwZ1wiKSwgXCJhYnNcIilcbiAgICAgICAgICAgIC5ncmlkKDAsIDYsIDEwLCAxMClcbiAgICAgICAgICAgIC5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgIENydXguV2lkZ2V0KFwicGNpXzQ4X1wiLmNvbmNhdChwbGF5ZXIudWlkKSkuZ3JpZCg3LCAxMywgMywgMykucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICBDcnV4LldpZGdldChcImNvbF9hY2NlbnRcIikuZ3JpZCgwLCAzLCAzMCwgMykucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICBDcnV4LlRleHQoXCJcIiwgXCJzY3JlZW5fc3VidGl0bGVcIilcbiAgICAgICAgICAgIC5ncmlkKDAsIDMsIDMwLCAzKVxuICAgICAgICAgICAgLnJhd0hUTUwocGxheWVyLnF1YWxpZmllZEFsaWFzKVxuICAgICAgICAgICAgLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgdmFyIG15QWNoaWV2ZW1lbnRzO1xuICAgICAgICAvL1U9PlRveGljXG4gICAgICAgIC8vVj0+TWFnaWNcbiAgICAgICAgLy81PT5GbG9tYmFldVxuICAgICAgICAvL1c9PldpemFyZFxuICAgICAgICBpZiAodW5pdmVyc2UucGxheWVyQWNoaWV2ZW1lbnRzKSB7XG4gICAgICAgICAgICBteUFjaGlldmVtZW50cyA9IHVuaXZlcnNlLnBsYXllckFjaGlldmVtZW50c1twbGF5ZXIudWlkXTtcbiAgICAgICAgICAgIGlmIChwbGF5ZXIucmF3QWxpYXMgPT0gXCJMb3JlbnR6XCIgJiZcbiAgICAgICAgICAgICAgICBcIldcIiAhPSBteUFjaGlldmVtZW50cy5iYWRnZXMuc2xpY2UoMCwgMSkpIHtcbiAgICAgICAgICAgICAgICBteUFjaGlldmVtZW50cy5iYWRnZXMgPSBcIldcIi5jb25jYXQobXlBY2hpZXZlbWVudHMuYmFkZ2VzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHBsYXllci5yYXdBbGlhcyA9PSBcIkEgU3RvbmVkIEFwZVwiICYmXG4gICAgICAgICAgICAgICAgXCI1XCIgIT0gbXlBY2hpZXZlbWVudHMuYmFkZ2VzLnNsaWNlKDAsIDEpKSB7XG4gICAgICAgICAgICAgICAgbXlBY2hpZXZlbWVudHMuYmFkZ2VzID0gXCI1XCIuY29uY2F0KG15QWNoaWV2ZW1lbnRzLmJhZGdlcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG15QWNoaWV2ZW1lbnRzKSB7XG4gICAgICAgICAgICBucHVpXG4gICAgICAgICAgICAgICAgLlNtYWxsQmFkZ2VSb3cobXlBY2hpZXZlbWVudHMuYmFkZ2VzKVxuICAgICAgICAgICAgICAgIC5ncmlkKDAsIDMsIDMwLCAzKVxuICAgICAgICAgICAgICAgIC5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgIH1cbiAgICAgICAgQ3J1eC5XaWRnZXQoXCJjb2xfYmxhY2tcIikuZ3JpZCgxMCwgNiwgMjAsIDMpLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgaWYgKHBsYXllci51aWQgIT0gZ2V0X2hlcm8oTmVwdHVuZXNQcmlkZS51bml2ZXJzZSkudWlkICYmIHBsYXllci5haSA9PSAwKSB7XG4gICAgICAgICAgICAvL1VzZSB0aGlzIHRvIG9ubHkgdmlldyB3aGVuIHRoZXkgYXJlIHdpdGhpbiBzY2FubmluZzpcbiAgICAgICAgICAgIC8vdW5pdmVyc2Uuc2VsZWN0ZWRTdGFyLnYgIT0gXCIwXCJcbiAgICAgICAgICAgIHZhciB0b3RhbF9zZWxsX2Nvc3QgPSBnZXRfdGVjaF90cmFkZV9jb3N0KGdldF9oZXJvKE5lcHR1bmVzUHJpZGUudW5pdmVyc2UpLCBwbGF5ZXIpO1xuICAgICAgICAgICAgLyoqKiBTSEFSRSBBTEwgVEVDSCAgKioqL1xuICAgICAgICAgICAgdmFyIGJ0biA9IENydXguQnV0dG9uKFwiXCIsIFwic2hhcmVfYWxsX3RlY2hcIiwgcGxheWVyKVxuICAgICAgICAgICAgICAgIC5hZGRTdHlsZShcImZ3ZFwiKVxuICAgICAgICAgICAgICAgIC5yYXdIVE1MKFwiU2hhcmUgQWxsIFRlY2g6ICRcIi5jb25jYXQodG90YWxfc2VsbF9jb3N0KSlcbiAgICAgICAgICAgICAgICAuZ3JpZCgxMCwgMzEsIDE0LCAzKTtcbiAgICAgICAgICAgIC8vRGlzYWJsZSBpZiBpbiBhIGdhbWUgd2l0aCBGQSAmIFNjYW4gKEJVRylcbiAgICAgICAgICAgIHZhciBjb25maWcgPSBOZXB0dW5lc1ByaWRlLmdhbWVDb25maWc7XG4gICAgICAgICAgICBpZiAoIShjb25maWcudHJhZGVTY2FubmVkICYmIGNvbmZpZy5hbGxpYW5jZXMpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGdldF9oZXJvKE5lcHR1bmVzUHJpZGUudW5pdmVyc2UpLmNhc2ggPj0gdG90YWxfc2VsbF9jb3N0KSB7XG4gICAgICAgICAgICAgICAgICAgIGJ0bi5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBidG4uZGlzYWJsZSgpLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvKioqIFBBWSBGT1IgQUxMIFRFQ0ggKioqL1xuICAgICAgICAgICAgdmFyIHRvdGFsX2J1eV9jb3N0ID0gZ2V0X3RlY2hfdHJhZGVfY29zdChwbGF5ZXIsIGdldF9oZXJvKE5lcHR1bmVzUHJpZGUudW5pdmVyc2UpKTtcbiAgICAgICAgICAgIGJ0biA9IENydXguQnV0dG9uKFwiXCIsIFwiYnV5X2FsbF90ZWNoXCIsIHtcbiAgICAgICAgICAgICAgICBwbGF5ZXI6IHBsYXllcixcbiAgICAgICAgICAgICAgICB0ZWNoOiBudWxsLFxuICAgICAgICAgICAgICAgIGNvc3Q6IHRvdGFsX2J1eV9jb3N0LFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuYWRkU3R5bGUoXCJmd2RcIilcbiAgICAgICAgICAgICAgICAucmF3SFRNTChcIlBheSBmb3IgQWxsIFRlY2g6ICRcIi5jb25jYXQodG90YWxfYnV5X2Nvc3QpKVxuICAgICAgICAgICAgICAgIC5ncmlkKDEwLCA0OSwgMTQsIDMpO1xuICAgICAgICAgICAgaWYgKGdldF9oZXJvKE5lcHR1bmVzUHJpZGUudW5pdmVyc2UpLmNhc2ggPj0gdG90YWxfc2VsbF9jb3N0KSB7XG4gICAgICAgICAgICAgICAgYnRuLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGJ0bi5kaXNhYmxlKCkucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLypJbmRpdmlkdWFsIHRlY2hzKi9cbiAgICAgICAgICAgIHZhciBfbmFtZV9tYXAgPSB7XG4gICAgICAgICAgICAgICAgc2Nhbm5pbmc6IFwiU2Nhbm5pbmdcIixcbiAgICAgICAgICAgICAgICBwcm9wdWxzaW9uOiBcIkh5cGVyc3BhY2UgUmFuZ2VcIixcbiAgICAgICAgICAgICAgICB0ZXJyYWZvcm1pbmc6IFwiVGVycmFmb3JtaW5nXCIsXG4gICAgICAgICAgICAgICAgcmVzZWFyY2g6IFwiRXhwZXJpbWVudGF0aW9uXCIsXG4gICAgICAgICAgICAgICAgd2VhcG9uczogXCJXZWFwb25zXCIsXG4gICAgICAgICAgICAgICAgYmFua2luZzogXCJCYW5raW5nXCIsXG4gICAgICAgICAgICAgICAgbWFudWZhY3R1cmluZzogXCJNYW51ZmFjdHVyaW5nXCIsXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdmFyIHRlY2hzID0gW1xuICAgICAgICAgICAgICAgIFwic2Nhbm5pbmdcIixcbiAgICAgICAgICAgICAgICBcInByb3B1bHNpb25cIixcbiAgICAgICAgICAgICAgICBcInRlcnJhZm9ybWluZ1wiLFxuICAgICAgICAgICAgICAgIFwicmVzZWFyY2hcIixcbiAgICAgICAgICAgICAgICBcIndlYXBvbnNcIixcbiAgICAgICAgICAgICAgICBcImJhbmtpbmdcIixcbiAgICAgICAgICAgICAgICBcIm1hbnVmYWN0dXJpbmdcIixcbiAgICAgICAgICAgIF07XG4gICAgICAgICAgICB0ZWNocy5mb3JFYWNoKGZ1bmN0aW9uICh0ZWNoLCBpKSB7XG4gICAgICAgICAgICAgICAgdmFyIG9uZV90ZWNoX2Nvc3QgPSBnZXRfdGVjaF90cmFkZV9jb3N0KHBsYXllciwgZ2V0X2hlcm8oTmVwdHVuZXNQcmlkZS51bml2ZXJzZSksIHRlY2gpO1xuICAgICAgICAgICAgICAgIHZhciBvbmVfdGVjaCA9IENydXguQnV0dG9uKFwiXCIsIFwiYnV5X29uZV90ZWNoXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyOiBwbGF5ZXIsXG4gICAgICAgICAgICAgICAgICAgIHRlY2g6IHRlY2gsXG4gICAgICAgICAgICAgICAgICAgIGNvc3Q6IG9uZV90ZWNoX2Nvc3QsXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgLmFkZFN0eWxlKFwiZndkXCIpXG4gICAgICAgICAgICAgICAgICAgIC5yYXdIVE1MKFwiUGF5OiAkXCIuY29uY2F0KG9uZV90ZWNoX2Nvc3QpKVxuICAgICAgICAgICAgICAgICAgICAuZ3JpZCgxNSwgMzQuNSArIGkgKiAyLCA3LCAyKTtcbiAgICAgICAgICAgICAgICBpZiAoZ2V0X2hlcm8oTmVwdHVuZXNQcmlkZS51bml2ZXJzZSkuY2FzaCA+PSBvbmVfdGVjaF9jb3N0ICYmXG4gICAgICAgICAgICAgICAgICAgIG9uZV90ZWNoX2Nvc3QgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIG9uZV90ZWNoLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBDcnV4LlRleHQoXCJ5b3VcIiwgXCJwYWQxMiB0eHRfY2VudGVyXCIpLmdyaWQoMjUsIDYsIDUsIDMpLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgLy8gTGFiZWxzXG4gICAgICAgIENydXguVGV4dChcInRvdGFsX3N0YXJzXCIsIFwicGFkOFwiKS5ncmlkKDEwLCA5LCAxNSwgMykucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICBDcnV4LlRleHQoXCJ0b3RhbF9mbGVldHNcIiwgXCJwYWQ4XCIpLmdyaWQoMTAsIDExLCAxNSwgMykucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICBDcnV4LlRleHQoXCJ0b3RhbF9zaGlwc1wiLCBcInBhZDhcIikuZ3JpZCgxMCwgMTMsIDE1LCAzKS5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgIENydXguVGV4dChcIm5ld19zaGlwc1wiLCBcInBhZDhcIikuZ3JpZCgxMCwgMTUsIDE1LCAzKS5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgIC8vIFRoaXMgcGxheWVycyBzdGF0c1xuICAgICAgICBpZiAocGxheWVyICE9PSB1bml2ZXJzZS5wbGF5ZXIpIHtcbiAgICAgICAgICAgIENydXguVGV4dChcIlwiLCBcInBhZDggdHh0X2NlbnRlclwiKVxuICAgICAgICAgICAgICAgIC5ncmlkKDIwLCA5LCA1LCAzKVxuICAgICAgICAgICAgICAgIC5yYXdIVE1MKHBsYXllci50b3RhbF9zdGFycylcbiAgICAgICAgICAgICAgICAucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICAgICAgQ3J1eC5UZXh0KFwiXCIsIFwicGFkOCB0eHRfY2VudGVyXCIpXG4gICAgICAgICAgICAgICAgLmdyaWQoMjAsIDExLCA1LCAzKVxuICAgICAgICAgICAgICAgIC5yYXdIVE1MKHBsYXllci50b3RhbF9mbGVldHMpXG4gICAgICAgICAgICAgICAgLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgICAgIENydXguVGV4dChcIlwiLCBcInBhZDggdHh0X2NlbnRlclwiKVxuICAgICAgICAgICAgICAgIC5ncmlkKDIwLCAxMywgNSwgMylcbiAgICAgICAgICAgICAgICAucmF3SFRNTChwbGF5ZXIudG90YWxfc3RyZW5ndGgpXG4gICAgICAgICAgICAgICAgLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgICAgIENydXguVGV4dChcIlwiLCBcInBhZDggdHh0X2NlbnRlclwiKVxuICAgICAgICAgICAgICAgIC5ncmlkKDIwLCAxNSwgNSwgMylcbiAgICAgICAgICAgICAgICAucmF3SFRNTChwbGF5ZXIuc2hpcHNQZXJUaWNrKVxuICAgICAgICAgICAgICAgIC5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gc2VsZWN0SGlsaWdodFN0eWxlKHAxLCBwMikge1xuICAgICAgICAgICAgcDEgPSBOdW1iZXIocDEpO1xuICAgICAgICAgICAgcDIgPSBOdW1iZXIocDIpO1xuICAgICAgICAgICAgaWYgKHAxIDwgcDIpXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiIHR4dF93YXJuX2JhZFwiO1xuICAgICAgICAgICAgaWYgKHAxID4gcDIpXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiIHR4dF93YXJuX2dvb2RcIjtcbiAgICAgICAgICAgIHJldHVybiBcIlwiO1xuICAgICAgICB9XG4gICAgICAgIC8vIFlvdXIgc3RhdHNcbiAgICAgICAgaWYgKHVuaXZlcnNlLnBsYXllcikge1xuICAgICAgICAgICAgQ3J1eC5UZXh0KFwiXCIsIFwicGFkOCB0eHRfY2VudGVyIFwiLmNvbmNhdChzZWxlY3RIaWxpZ2h0U3R5bGUodW5pdmVyc2UucGxheWVyLnRvdGFsX3N0YXJzLCBwbGF5ZXIudG90YWxfc3RhcnMpKSlcbiAgICAgICAgICAgICAgICAuZ3JpZCgyNSwgOSwgNSwgMylcbiAgICAgICAgICAgICAgICAucmF3SFRNTCh1bml2ZXJzZS5wbGF5ZXIudG90YWxfc3RhcnMpXG4gICAgICAgICAgICAgICAgLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgICAgIENydXguVGV4dChcIlwiLCBcInBhZDggdHh0X2NlbnRlclwiLmNvbmNhdChzZWxlY3RIaWxpZ2h0U3R5bGUodW5pdmVyc2UucGxheWVyLnRvdGFsX2ZsZWV0cywgcGxheWVyLnRvdGFsX2ZsZWV0cykpKVxuICAgICAgICAgICAgICAgIC5ncmlkKDI1LCAxMSwgNSwgMylcbiAgICAgICAgICAgICAgICAucmF3SFRNTCh1bml2ZXJzZS5wbGF5ZXIudG90YWxfZmxlZXRzKVxuICAgICAgICAgICAgICAgIC5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgICAgICBDcnV4LlRleHQoXCJcIiwgXCJwYWQ4IHR4dF9jZW50ZXJcIi5jb25jYXQoc2VsZWN0SGlsaWdodFN0eWxlKHVuaXZlcnNlLnBsYXllci50b3RhbF9zdHJlbmd0aCwgcGxheWVyLnRvdGFsX3N0cmVuZ3RoKSkpXG4gICAgICAgICAgICAgICAgLmdyaWQoMjUsIDEzLCA1LCAzKVxuICAgICAgICAgICAgICAgIC5yYXdIVE1MKHVuaXZlcnNlLnBsYXllci50b3RhbF9zdHJlbmd0aClcbiAgICAgICAgICAgICAgICAucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICAgICAgQ3J1eC5UZXh0KFwiXCIsIFwicGFkOCB0eHRfY2VudGVyXCIuY29uY2F0KHNlbGVjdEhpbGlnaHRTdHlsZSh1bml2ZXJzZS5wbGF5ZXIuc2hpcHNQZXJUaWNrLCBwbGF5ZXIuc2hpcHNQZXJUaWNrKSkpXG4gICAgICAgICAgICAgICAgLmdyaWQoMjUsIDE1LCA1LCAzKVxuICAgICAgICAgICAgICAgIC5yYXdIVE1MKHVuaXZlcnNlLnBsYXllci5zaGlwc1BlclRpY2spXG4gICAgICAgICAgICAgICAgLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgfVxuICAgICAgICBDcnV4LldpZGdldChcImNvbF9hY2NlbnRcIikuZ3JpZCgwLCAxNiwgMTAsIDMpLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgaWYgKHVuaXZlcnNlLnBsYXllcikge1xuICAgICAgICAgICAgdmFyIG1zZ0J0biA9IENydXguSWNvbkJ1dHRvbihcImljb24tbWFpbFwiLCBcImluYm94X25ld19tZXNzYWdlX3RvX3BsYXllclwiLCBwbGF5ZXIudWlkKVxuICAgICAgICAgICAgICAgIC5ncmlkKDAsIDE2LCAzLCAzKVxuICAgICAgICAgICAgICAgIC5hZGRTdHlsZShcImZ3ZFwiKVxuICAgICAgICAgICAgICAgIC5kaXNhYmxlKClcbiAgICAgICAgICAgICAgICAucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICAgICAgaWYgKHBsYXllciAhPT0gdW5pdmVyc2UucGxheWVyICYmIHBsYXllci5hbGlhcykge1xuICAgICAgICAgICAgICAgIG1zZ0J0bi5lbmFibGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIENydXguSWNvbkJ1dHRvbihcImljb24tY2hhcnQtbGluZVwiLCBcInNob3dfaW50ZWxcIiwgcGxheWVyLnVpZClcbiAgICAgICAgICAgICAgICAuZ3JpZCgyLjUsIDE2LCAzLCAzKVxuICAgICAgICAgICAgICAgIC5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgICAgICBpZiAoc2hvd0VtcGlyZSkge1xuICAgICAgICAgICAgICAgIENydXguSWNvbkJ1dHRvbihcImljb24tZXllXCIsIFwic2hvd19zY3JlZW5cIiwgXCJlbXBpcmVcIilcbiAgICAgICAgICAgICAgICAgICAgLmdyaWQoNywgMTYsIDMsIDMpXG4gICAgICAgICAgICAgICAgICAgIC5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBsYXllclBhbmVsO1xuICAgIH07XG59O1xudmFyIHN1cGVyU3Rhckluc3BlY3RvciA9IE5lcHR1bmVzUHJpZGUubnB1aS5TdGFySW5zcGVjdG9yO1xuTmVwdHVuZXNQcmlkZS5ucHVpLlN0YXJJbnNwZWN0b3IgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHVuaXZlcnNlID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZTtcbiAgICB2YXIgY29uZmlnID0gTmVwdHVuZXNQcmlkZS5nYW1lQ29uZmlnO1xuICAgIC8vQ2FsbCBzdXBlciAoUHJldmlvdXMgU3Rhckluc3BlY3RvciBmcm9tIGdhbWVjb2RlKVxuICAgIHZhciBzdGFySW5zcGVjdG9yID0gc3VwZXJTdGFySW5zcGVjdG9yKCk7XG4gICAgQ3J1eC5JY29uQnV0dG9uKFwiaWNvbi1oZWxwIHJlbFwiLCBcInNob3dfaGVscFwiLCBcInN0YXJzXCIpLnJvb3N0KHN0YXJJbnNwZWN0b3IuaGVhZGluZyk7XG4gICAgQ3J1eC5JY29uQnV0dG9uKFwiaWNvbi1kb2MtdGV4dCByZWxcIiwgXCJzaG93X3NjcmVlblwiLCBcImNvbWJhdF9jYWxjdWxhdG9yXCIpLnJvb3N0KHN0YXJJbnNwZWN0b3IuaGVhZGluZyk7XG4gICAgLy9BcHBlbmQgZXh0cmEgZnVuY3Rpb25cbiAgICBmdW5jdGlvbiBhcHBseV9mcmFjdGlvbmFsX3NoaXBzKCkge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgZGVwdGgsIHNlbGVjdG9yLCBlbGVtZW50LCBjb3VudGVyLCBmcmFjdGlvbmFsX3NoaXAsIGZyYWN0aW9uYWxfc2hpcF8xLCBuZXdfdmFsdWU7XG4gICAgICAgICAgICByZXR1cm4gX19nZW5lcmF0b3IodGhpcywgZnVuY3Rpb24gKF9hKSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoIChfYS5sYWJlbCkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXB0aCA9IGNvbmZpZy50dXJuQmFzZWQgPyA0IDogMztcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdG9yID0gXCIjY29udGVudEFyZWEgPiBkaXYgPiBkaXYud2lkZ2V0LmZ1bGxzY3JlZW4gPiBkaXY6bnRoLWNoaWxkKFwiLmNvbmNhdChkZXB0aCwgXCIpID4gZGl2ID4gZGl2Om50aC1jaGlsZCg1KSA+IGRpdi53aWRnZXQucGFkMTIuaWNvbi1yb2NrZXQtaW5saW5lLnR4dF9yaWdodFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQgPSAkKHNlbGVjdG9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50ZXIgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgZnJhY3Rpb25hbF9zaGlwID0gdW5pdmVyc2Uuc2VsZWN0ZWRTdGFyW1wiY1wiXS50b0ZpeGVkKDIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgJChzZWxlY3RvcikuYXBwZW5kKGZyYWN0aW9uYWxfc2hpcCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBfYS5sYWJlbCA9IDE7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghKGVsZW1lbnQubGVuZ3RoID09IDAgJiYgY291bnRlciA8PSAxMDApKSByZXR1cm4gWzMgLypicmVhayovLCAzXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbNCAvKnlpZWxkKi8sIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyKSB7IHJldHVybiBzZXRUaW1lb3V0KHIsIDEwKTsgfSldO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgICAgICAgICBfYS5zZW50KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50ID0gJChzZWxlY3Rvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICBmcmFjdGlvbmFsX3NoaXBfMSA9IHVuaXZlcnNlLnNlbGVjdGVkU3RhcltcImNcIl07XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdfdmFsdWUgPSBwYXJzZUludCgkKHNlbGVjdG9yKS50ZXh0KCkpICsgZnJhY3Rpb25hbF9zaGlwXzE7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKHNlbGVjdG9yKS50ZXh0KG5ld192YWx1ZS50b0ZpeGVkKDIpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50ZXIgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbMyAvKmJyZWFrKi8sIDFdO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDM6IHJldHVybiBbMiAvKnJldHVybiovXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGlmIChcImNcIiBpbiB1bml2ZXJzZS5zZWxlY3RlZFN0YXIpIHtcbiAgICAgICAgYXBwbHlfZnJhY3Rpb25hbF9zaGlwcygpO1xuICAgIH1cbiAgICByZXR1cm4gc3Rhckluc3BlY3Rvcjtcbn07XG4vL0NoYW5nZSBmcm9tIHRpbWVvdXQgdG8gaG9va3MgYnkgdXBkYXRpbmcgdGhlIHdvcmtlciB0byBob29rIGludG8gYSBnYW1lIGNvbXBvbmVudC5cbi8vSmF2YXNjcmlwdCBjYWxsXG5zZXRUaW1lb3V0KExlZ2FjeV9OZXB0dW5lc1ByaWRlQWdlbnQsIDEwMDApO1xuc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgLy9UeXBlc2NyaXB0IGNhbGxcbiAgICByZW5kZXJMZWRnZXIoTmVwdHVuZXNQcmlkZSwgQ3J1eCwgTW91c2V0cmFwKTtcbn0sIDE1MDApO1xuc2V0VGltZW91dChhcHBseV9ob29rcywgMTUwMCk7XG4vL1Rlc3QgdG8gc2VlIGlmIFBsYXllclBhbmVsIGlzIHRoZXJlXG4vL0lmIGl0IGlzIG92ZXJ3cml0ZXMgY3VzdG9tIG9uZVxuLy9PdGhlcndpc2Ugd2hpbGUgbG9vcCAmIHNldCB0aW1lb3V0IHVudGlsIGl0cyB0aGVyZVxuZm9yY2VfYWRkX2N1c3RvbV9wbGF5ZXJfcGFuZWwoKTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==