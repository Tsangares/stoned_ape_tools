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
/* harmony export */   "is_valid_youtube": function() { return /* binding */ is_valid_youtube; }
/* harmony export */ });
function is_valid_image_url(str) {
    var protocol = "^(https:\\/\\/)";
    var domains = "(i\\.ibb\\.co|i\\.imgur\\.com|cdn\\.discordapp\\.com)";
    var content = "([&#_=;\\-\\?\\/\\w]{1,150})";
    var images = "(\\.)(gif|jpe?g|tiff?|png|webp|bmp|GIF|JPE?G|TIFF?|PNG|WEBP|BMP)$";
    var regex_string = protocol + domains + content + images;
    var regex = new RegExp(regex_string);
    var valid = regex.test(str);
    console.log(regex_string, str, valid);
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






var SAT_VERSION = "2.28.02-git";
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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O0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixFQUFFLE1BQU0sRUFBRSxJQUFJLEdBQUcsS0FBSyxFQUFFLElBQUksRUFBRTtBQUN0RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzREFBc0Q7QUFDdEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBCQUEwQixFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsSUFBSSxHQUFHO0FBQ2xEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQ0FBb0MsRUFBRSxFQUFFLEdBQUcsR0FBRyxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUU7QUFDNUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0Q0FBNEMsR0FBRyxHQUFHLEdBQUcsTUFBTSxFQUFFLE1BQU0sRUFBRTtBQUNyRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBDQUEwQyxHQUFHLFVBQVUsRUFBRTtBQUN6RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0NBQXNDLEVBQUUsS0FBSyxHQUFHLEdBQUcsR0FBRyxNQUFNLEVBQUUsTUFBTSxFQUFFO0FBQ3RFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3Q0FBd0M7QUFDeEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0NBQXNDO0FBQ3RDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdEQUFnRDtBQUNoRDtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtDQUFrQyxF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QUFDQTtBQUNBO0FBQ0EsSUFBSSxxREFBWTtBQUNoQixDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL25lcHR1bmVzLXByaWRlLWFnZW50Ly4vc291cmNlL2NoYXQudHMiLCJ3ZWJwYWNrOi8vbmVwdHVuZXMtcHJpZGUtYWdlbnQvLi9zb3VyY2UvZXZlbnRfY2FjaGUudHMiLCJ3ZWJwYWNrOi8vbmVwdHVuZXMtcHJpZGUtYWdlbnQvLi9zb3VyY2UvaG90a2V5LnRzIiwid2VicGFjazovL25lcHR1bmVzLXByaWRlLWFnZW50Ly4vc291cmNlL2xlZGdlci50cyIsIndlYnBhY2s6Ly9uZXB0dW5lcy1wcmlkZS1hZ2VudC8uL3NvdXJjZS9tZXJnZS5qcyIsIndlYnBhY2s6Ly9uZXB0dW5lcy1wcmlkZS1hZ2VudC8uL3NvdXJjZS9wYXJzZV91dGlscy50cyIsIndlYnBhY2s6Ly9uZXB0dW5lcy1wcmlkZS1hZ2VudC8uL3NvdXJjZS91dGlsaXRpZXMudHMiLCJ3ZWJwYWNrOi8vbmVwdHVuZXMtcHJpZGUtYWdlbnQvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vbmVwdHVuZXMtcHJpZGUtYWdlbnQvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL25lcHR1bmVzLXByaWRlLWFnZW50L3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vbmVwdHVuZXMtcHJpZGUtYWdlbnQvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9uZXB0dW5lcy1wcmlkZS1hZ2VudC8uL3NvdXJjZS9pbnRlbC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBnZXRfaGVybyB9IGZyb20gXCIuL3V0aWxpdGllc1wiO1xudmFyIFJFU0VBQ0hfTUFQID0ge1xuICAgIHNjYW5uaW5nOiBcIlNjYW5uaW5nXCIsXG4gICAgcHJvcHVsc2lvbjogXCJIeXBlcnNwYWNlIFJhbmdlXCIsXG4gICAgdGVycmFmb3JtaW5nOiBcIlRlcnJhZm9ybWluZ1wiLFxuICAgIHJlc2VhcmNoOiBcIkV4cGVyaW1lbnRhdGlvblwiLFxuICAgIHdlYXBvbnM6IFwiV2VhcG9uc1wiLFxuICAgIGJhbmtpbmc6IFwiQmFua2luZ1wiLFxuICAgIG1hbnVmYWN0dXJpbmc6IFwiTWFudWZhY3R1cmluZ1wiLFxufTtcbi8vRm9yIHF1aWNrIHJlc2VhcmNoIGRpc3BsYXlcbmZ1bmN0aW9uIGdldF9yZXNlYXJjaChnYW1lKSB7XG4gICAgdmFyIHVuaXZlcnNlID0gZ2FtZS51bml2ZXJzZTtcbiAgICB2YXIgaGVybyA9IGdldF9oZXJvKGdhbWUudW5pdmVyc2UpO1xuICAgIHZhciBzY2llbmNlID0gaGVyby50b3RhbF9zY2llbmNlO1xuICAgIC8vQ3VycmVudCBTY2llbmNlXG4gICAgdmFyIGN1cnJlbnQgPSBoZXJvLnRlY2hbaGVyby5yZXNlYXJjaGluZ107XG4gICAgdmFyIGN1cnJlbnRfcG9pbnRzX3JlbWFpbmluZyA9IGN1cnJlbnQuYnJyICogY3VycmVudC5sZXZlbCAtIGN1cnJlbnQucmVzZWFyY2g7XG4gICAgdmFyIGV0YSA9IE1hdGguY2VpbChjdXJyZW50X3BvaW50c19yZW1haW5pbmcgLyBzY2llbmNlKTsgLy9Ib3Vyc1xuICAgIC8vTmV4dCBzY2llbmNlXG4gICAgdmFyIG5leHQgPSBoZXJvLnRlY2hbaGVyby5yZXNlYXJjaGluZ19uZXh0XTtcbiAgICB2YXIgbmV4dF9wb2ludHNfcmVtYWluaW5nID0gbmV4dC5icnIgKiBuZXh0LmxldmVsIC0gbmV4dC5yZXNlYXJjaDtcbiAgICB2YXIgbmV4dF9ldGEgPSBNYXRoLmNlaWwobmV4dF9wb2ludHNfcmVtYWluaW5nIC8gc2NpZW5jZSkgKyBldGE7XG4gICAgdmFyIG5leHRfbGV2ZWwgPSBuZXh0LmxldmVsICsgMTtcbiAgICBpZiAoaGVyby5yZXNlYXJjaGluZyA9PSBoZXJvLnJlc2VhcmNoaW5nX25leHQpIHtcbiAgICAgICAgLy9SZWN1cnJpbmcgcmVzZWFyY2hcbiAgICAgICAgbmV4dF9wb2ludHNfcmVtYWluaW5nICs9IG5leHQuYnJyO1xuICAgICAgICBuZXh0X2V0YSA9IE1hdGguY2VpbCgobmV4dC5icnIgKiBuZXh0LmxldmVsICsgMSkgLyBzY2llbmNlKSArIGV0YTtcbiAgICAgICAgbmV4dF9sZXZlbCArPSAxO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICBjdXJyZW50X25hbWU6IFJFU0VBQ0hfTUFQW2hlcm8ucmVzZWFyY2hpbmddLFxuICAgICAgICBjdXJyZW50X2xldmVsOiBjdXJyZW50W1wibGV2ZWxcIl0gKyAxLFxuICAgICAgICBjdXJyZW50X2V0YTogZXRhLFxuICAgICAgICBuZXh0X25hbWU6IFJFU0VBQ0hfTUFQW2hlcm8ucmVzZWFyY2hpbmdfbmV4dF0sXG4gICAgICAgIG5leHRfbGV2ZWw6IG5leHRfbGV2ZWwsXG4gICAgICAgIG5leHRfZXRhOiBuZXh0X2V0YSxcbiAgICAgICAgc2NpZW5jZTogc2NpZW5jZSxcbiAgICB9O1xufVxuZnVuY3Rpb24gZ2V0X3Jlc2VhcmNoX3RleHQoZ2FtZSkge1xuICAgIHZhciByZXNlYXJjaCA9IGdldF9yZXNlYXJjaChnYW1lKTtcbiAgICB2YXIgZmlyc3RfbGluZSA9IFwiTm93OiBcIi5jb25jYXQocmVzZWFyY2hbXCJjdXJyZW50X25hbWVcIl0sIFwiIFwiKS5jb25jYXQocmVzZWFyY2hbXCJjdXJyZW50X2xldmVsXCJdLCBcIiAtIFwiKS5jb25jYXQocmVzZWFyY2hbXCJjdXJyZW50X2V0YVwiXSwgXCIgdGlja3MuXCIpO1xuICAgIHZhciBzZWNvbmRfbGluZSA9IFwiTmV4dDogXCIuY29uY2F0KHJlc2VhcmNoW1wibmV4dF9uYW1lXCJdLCBcIiBcIikuY29uY2F0KHJlc2VhcmNoW1wibmV4dF9sZXZlbFwiXSwgXCIgLSBcIikuY29uY2F0KHJlc2VhcmNoW1wibmV4dF9ldGFcIl0sIFwiIHRpY2tzLlwiKTtcbiAgICB2YXIgdGhpcmRfbGluZSA9IFwiTXkgU2NpZW5jZTogXCIuY29uY2F0KHJlc2VhcmNoW1wic2NpZW5jZVwiXSk7XG4gICAgcmV0dXJuIFwiXCIuY29uY2F0KGZpcnN0X2xpbmUsIFwiXFxuXCIpLmNvbmNhdChzZWNvbmRfbGluZSwgXCJcXG5cIikuY29uY2F0KHRoaXJkX2xpbmUsIFwiXFxuXCIpO1xufVxuZXhwb3J0IHsgZ2V0X3Jlc2VhcmNoLCBnZXRfcmVzZWFyY2hfdGV4dCB9O1xuIiwiaW1wb3J0IHsgZ2V0X2xlZGdlciB9IGZyb20gXCIuL2xlZGdlclwiO1xuaW1wb3J0IHsgZ2V0X2hlcm8gfSBmcm9tIFwiLi91dGlsaXRpZXNcIjtcbi8vR2xvYmFsIGNhY2hlZCBldmVudCBzeXN0ZW0uXG5leHBvcnQgdmFyIGNhY2hlZF9ldmVudHMgPSBbXTtcbmV4cG9ydCB2YXIgY2FjaGVGZXRjaFN0YXJ0ID0gbmV3IERhdGUoKTtcbmV4cG9ydCB2YXIgY2FjaGVGZXRjaFNpemUgPSAwO1xuLy9Bc3luYyByZXF1ZXN0IGdhbWUgZXZlbnRzXG4vL2dhbWUgaXMgdXNlZCB0byBnZXQgdGhlIGFwaSB2ZXJzaW9uIGFuZCB0aGUgZ2FtZU51bWJlclxuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZV9ldmVudF9jYWNoZShnYW1lLCBjcnV4LCBmZXRjaFNpemUsIHN1Y2Nlc3MsIGVycm9yKSB7XG4gICAgdmFyIGNvdW50ID0gY2FjaGVkX2V2ZW50cy5sZW5ndGggPiAwID8gZmV0Y2hTaXplIDogMTAwMDAwO1xuICAgIGNhY2hlRmV0Y2hTdGFydCA9IG5ldyBEYXRlKCk7XG4gICAgY2FjaGVGZXRjaFNpemUgPSBjb3VudDtcbiAgICB2YXIgcGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh7XG4gICAgICAgIHR5cGU6IFwiZmV0Y2hfZ2FtZV9tZXNzYWdlc1wiLFxuICAgICAgICBjb3VudDogY291bnQudG9TdHJpbmcoKSxcbiAgICAgICAgb2Zmc2V0OiBcIjBcIixcbiAgICAgICAgZ3JvdXA6IFwiZ2FtZV9ldmVudFwiLFxuICAgICAgICB2ZXJzaW9uOiBnYW1lLnZlcnNpb24sXG4gICAgICAgIGdhbWVfbnVtYmVyOiBnYW1lLmdhbWVOdW1iZXIsXG4gICAgfSk7XG4gICAgdmFyIGhlYWRlcnMgPSB7XG4gICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkblwiLFxuICAgIH07XG4gICAgZmV0Y2goXCIvdHJlcXVlc3QvZmV0Y2hfZ2FtZV9tZXNzYWdlc1wiLCB7XG4gICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkXCIsXG4gICAgICAgIH0sXG4gICAgICAgIGJvZHk6IHBhcmFtcyxcbiAgICB9KVxuICAgICAgICAudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHsgcmV0dXJuIHJlc3BvbnNlLmpzb24oKTsgfSlcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7IHJldHVybiBzdWNjZXNzKGdhbWUsIGNydXgsIHJlc3BvbnNlKTsgfSlcbiAgICAgICAgLmNhdGNoKGVycm9yKTtcbn1cbi8vQ3VzdG9tIFVJIENvbXBvbmVudHMgZm9yIExlZGdlclxuZXhwb3J0IGZ1bmN0aW9uIFBsYXllck5hbWVJY29uUm93TGluayhjcnV4LCBucHVpLCBwbGF5ZXIpIHtcbiAgICB2YXIgcGxheWVyTmFtZUljb25Sb3cgPSBjcnV4LldpZGdldChcInJlbCBjb2xfYmxhY2sgY2xpY2thYmxlXCIpLnNpemUoNDgwLCA0OCk7XG4gICAgbnB1aS5QbGF5ZXJJY29uKHBsYXllciwgdHJ1ZSkucm9vc3QocGxheWVyTmFtZUljb25Sb3cpO1xuICAgIGNydXhcbiAgICAgICAgLlRleHQoXCJcIiwgXCJzZWN0aW9uX3RpdGxlXCIpXG4gICAgICAgIC5ncmlkKDYsIDAsIDIxLCAzKVxuICAgICAgICAucmF3SFRNTChcIjxhIG9uY2xpY2s9XFxcIkNydXguY3J1eC50cmlnZ2VyKCdzaG93X3BsYXllcl91aWQnLCAnXCIuY29uY2F0KHBsYXllci51aWQsIFwiJyApXFxcIj5cIikuY29uY2F0KHBsYXllci5hbGlhcywgXCI8L2E+XCIpKVxuICAgICAgICAucm9vc3QocGxheWVyTmFtZUljb25Sb3cpO1xuICAgIHJldHVybiBwbGF5ZXJOYW1lSWNvblJvdztcbn1cbi8vSGFuZGxlciB0byByZWNpZXZlIG5ldyBtZXNzYWdlc1xuZXhwb3J0IGZ1bmN0aW9uIHJlY2lldmVfbmV3X21lc3NhZ2VzKGdhbWUsIGNydXgsIHJlc3BvbnNlKSB7XG4gICAgdmFyIHVuaXZlcnNlID0gZ2FtZS51bml2ZXJzZTtcbiAgICB2YXIgbnB1aSA9IGdhbWUubnB1aTtcbiAgICB2YXIgY2FjaGVGZXRjaEVuZCA9IG5ldyBEYXRlKCk7XG4gICAgdmFyIGVsYXBzZWQgPSBjYWNoZUZldGNoRW5kLmdldFRpbWUoKSAtIGNhY2hlRmV0Y2hTdGFydC5nZXRUaW1lKCk7XG4gICAgY29uc29sZS5sb2coXCJGZXRjaGVkIFwiLmNvbmNhdChjYWNoZUZldGNoU2l6ZSwgXCIgZXZlbnRzIGluIFwiKS5jb25jYXQoZWxhcHNlZCwgXCJtc1wiKSk7XG4gICAgdmFyIGluY29taW5nID0gcmVzcG9uc2UucmVwb3J0Lm1lc3NhZ2VzO1xuICAgIGlmIChjYWNoZWRfZXZlbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdmFyIG92ZXJsYXBPZmZzZXQgPSAtMTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbmNvbWluZy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBpbmNvbWluZ1tpXTtcbiAgICAgICAgICAgIGlmIChtZXNzYWdlLmtleSA9PT0gY2FjaGVkX2V2ZW50c1swXS5rZXkpIHtcbiAgICAgICAgICAgICAgICBvdmVybGFwT2Zmc2V0ID0gaTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAob3ZlcmxhcE9mZnNldCA+PSAwKSB7XG4gICAgICAgICAgICBpbmNvbWluZyA9IGluY29taW5nLnNsaWNlKDAsIG92ZXJsYXBPZmZzZXQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG92ZXJsYXBPZmZzZXQgPCAwKSB7XG4gICAgICAgICAgICB2YXIgc2l6ZSA9IGluY29taW5nLmxlbmd0aCAqIDI7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIk1pc3Npbmcgc29tZSBldmVudHMsIGRvdWJsZSBmZXRjaCB0byBcIi5jb25jYXQoc2l6ZSkpO1xuICAgICAgICAgICAgdXBkYXRlX2V2ZW50X2NhY2hlKGdhbWUsIGNydXgsIHNpemUsIHJlY2lldmVfbmV3X21lc3NhZ2VzLCBjb25zb2xlLmVycm9yKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyB3ZSBoYWQgY2FjaGVkIGV2ZW50cywgYnV0IHdhbnQgdG8gYmUgZXh0cmEgcGFyYW5vaWQgYWJvdXRcbiAgICAgICAgLy8gY29ycmVjdG5lc3MuIFNvIGlmIHRoZSByZXNwb25zZSBjb250YWluZWQgdGhlIGVudGlyZSBldmVudFxuICAgICAgICAvLyBsb2csIHZhbGlkYXRlIHRoYXQgaXQgZXhhY3RseSBtYXRjaGVzIHRoZSBjYWNoZWQgZXZlbnRzLlxuICAgICAgICBpZiAocmVzcG9uc2UucmVwb3J0Lm1lc3NhZ2VzLmxlbmd0aCA9PT0gY2FjaGVkX2V2ZW50cy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiKioqIFZhbGlkYXRpbmcgY2FjaGVkX2V2ZW50cyAqKipcIik7XG4gICAgICAgICAgICB2YXIgdmFsaWRfMSA9IHJlc3BvbnNlLnJlcG9ydC5tZXNzYWdlcztcbiAgICAgICAgICAgIHZhciBpbnZhbGlkRW50cmllcyA9IGNhY2hlZF9ldmVudHMuZmlsdGVyKGZ1bmN0aW9uIChlLCBpKSB7IHJldHVybiBlLmtleSAhPT0gdmFsaWRfMVtpXS5rZXk7IH0pO1xuICAgICAgICAgICAgaWYgKGludmFsaWRFbnRyaWVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCIhISBJbnZhbGlkIGVudHJpZXMgZm91bmQ6IFwiLCBpbnZhbGlkRW50cmllcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIioqKiBWYWxpZGF0aW9uIENvbXBsZXRlZCAqKipcIik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyB0aGUgcmVzcG9uc2UgZGlkbid0IGNvbnRhaW4gdGhlIGVudGlyZSBldmVudCBsb2cuIEdvIGZldGNoXG4gICAgICAgICAgICAvLyBhIHZlcnNpb24gdGhhdCBfZG9lc18uXG4gICAgICAgICAgICB1cGRhdGVfZXZlbnRfY2FjaGUoZ2FtZSwgY3J1eCwgMTAwMDAwLCByZWNpZXZlX25ld19tZXNzYWdlcywgY29uc29sZS5lcnJvcik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY2FjaGVkX2V2ZW50cyA9IGluY29taW5nLmNvbmNhdChjYWNoZWRfZXZlbnRzKTtcbiAgICB2YXIgcGxheWVycyA9IGdldF9sZWRnZXIoZ2FtZSwgY3J1eCwgY2FjaGVkX2V2ZW50cyk7XG4gICAgdmFyIGxlZGdlclNjcmVlbiA9IG5wdWkubGVkZ2VyU2NyZWVuKCk7XG4gICAgbnB1aS5vbkhpZGVTY3JlZW4obnVsbCwgdHJ1ZSk7XG4gICAgbnB1aS5vbkhpZGVTZWxlY3Rpb25NZW51KCk7XG4gICAgbnB1aS50cmlnZ2VyKFwiaGlkZV9zaWRlX21lbnVcIik7XG4gICAgbnB1aS50cmlnZ2VyKFwicmVzZXRfZWRpdF9tb2RlXCIpO1xuICAgIG5wdWkuYWN0aXZlU2NyZWVuID0gbGVkZ2VyU2NyZWVuO1xuICAgIGxlZGdlclNjcmVlbi5yb29zdChucHVpLnNjcmVlbkNvbnRhaW5lcik7XG4gICAgbnB1aS5sYXlvdXRFbGVtZW50KGxlZGdlclNjcmVlbik7XG4gICAgcGxheWVycy5mb3JFYWNoKGZ1bmN0aW9uIChwKSB7XG4gICAgICAgIHZhciBwbGF5ZXIgPSBQbGF5ZXJOYW1lSWNvblJvd0xpbmsoY3J1eCwgbnB1aSwgdW5pdmVyc2UuZ2FsYXh5LnBsYXllcnNbcC51aWRdKS5yb29zdChucHVpLmFjdGl2ZVNjcmVlbik7XG4gICAgICAgIHBsYXllci5hZGRTdHlsZShcInBsYXllcl9jZWxsXCIpO1xuICAgICAgICB2YXIgcHJvbXB0ID0gcC5kZWJ0ID4gMCA/IFwiVGhleSBvd2VcIiA6IFwiWW91IG93ZVwiO1xuICAgICAgICBpZiAocC5kZWJ0ID09IDApIHtcbiAgICAgICAgICAgIHByb21wdCA9IFwiQmFsYW5jZVwiO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwLmRlYnQgPCAwKSB7XG4gICAgICAgICAgICBjcnV4XG4gICAgICAgICAgICAgICAgLlRleHQoXCJcIiwgXCJwYWQxMiB0eHRfcmlnaHQgcmVkLXRleHRcIilcbiAgICAgICAgICAgICAgICAucmF3SFRNTChcIlwiLmNvbmNhdChwcm9tcHQsIFwiOiBcIikuY29uY2F0KHAuZGVidCkpXG4gICAgICAgICAgICAgICAgLmdyaWQoMjAsIDAsIDEwLCAzKVxuICAgICAgICAgICAgICAgIC5yb29zdChwbGF5ZXIpO1xuICAgICAgICAgICAgaWYgKHAuZGVidCAqIC0xIDw9IGdldF9oZXJvKHVuaXZlcnNlKS5jYXNoKSB7XG4gICAgICAgICAgICAgICAgY3J1eFxuICAgICAgICAgICAgICAgICAgICAuQnV0dG9uKFwiZm9yZ2l2ZVwiLCBcImZvcmdpdmVfZGVidFwiLCB7IHRhcmdldFBsYXllcjogcC51aWQgfSlcbiAgICAgICAgICAgICAgICAgICAgLmdyaWQoMTcsIDAsIDYsIDMpXG4gICAgICAgICAgICAgICAgICAgIC5yb29zdChwbGF5ZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHAuZGVidCA+IDApIHtcbiAgICAgICAgICAgIGNydXhcbiAgICAgICAgICAgICAgICAuVGV4dChcIlwiLCBcInBhZDEyIHR4dF9yaWdodCBibHVlLXRleHRcIilcbiAgICAgICAgICAgICAgICAucmF3SFRNTChcIlwiLmNvbmNhdChwcm9tcHQsIFwiOiBcIikuY29uY2F0KHAuZGVidCkpXG4gICAgICAgICAgICAgICAgLmdyaWQoMjAsIDAsIDEwLCAzKVxuICAgICAgICAgICAgICAgIC5yb29zdChwbGF5ZXIpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHAuZGVidCA9PSAwKSB7XG4gICAgICAgICAgICBjcnV4XG4gICAgICAgICAgICAgICAgLlRleHQoXCJcIiwgXCJwYWQxMiB0eHRfcmlnaHQgb3JhbmdlLXRleHRcIilcbiAgICAgICAgICAgICAgICAucmF3SFRNTChcIlwiLmNvbmNhdChwcm9tcHQsIFwiOiBcIikuY29uY2F0KHAuZGVidCkpXG4gICAgICAgICAgICAgICAgLmdyaWQoMjAsIDAsIDEwLCAzKVxuICAgICAgICAgICAgICAgIC5yb29zdChwbGF5ZXIpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5leHBvcnQgZGVmYXVsdCB7XG4gICAgdXBkYXRlX2V2ZW50X2NhY2hlOiB1cGRhdGVfZXZlbnRfY2FjaGUsXG4gICAgcmVjaWV2ZV9uZXdfbWVzc2FnZXM6IHJlY2lldmVfbmV3X21lc3NhZ2VzLFxufTtcbiIsImV4cG9ydCB2YXIgbGFzdENsaXAgPSBcIkVycm9yXCI7XG5leHBvcnQgZnVuY3Rpb24gY2xpcCh0ZXh0KSB7XG4gICAgbGFzdENsaXAgPSB0ZXh0O1xufVxuIiwiaW1wb3J0IHsgZ2V0X2hlcm8gfSBmcm9tIFwiLi91dGlsaXRpZXNcIjtcbmltcG9ydCAqIGFzIENhY2hlIGZyb20gXCIuL2V2ZW50X2NhY2hlXCI7XG4vL0dldCBsZWRnZXIgaW5mbyB0byBzZWUgd2hhdCBpcyBvd2VkXG4vL0FjdHVhbGx5IHNob3dzIHRoZSBwYW5lbCBvZiBsb2FkaW5nXG5leHBvcnQgZnVuY3Rpb24gZ2V0X2xlZGdlcihnYW1lLCBjcnV4LCBtZXNzYWdlcykge1xuICAgIHZhciBucHVpID0gZ2FtZS5ucHVpO1xuICAgIHZhciB1bml2ZXJzZSA9IGdhbWUudW5pdmVyc2U7XG4gICAgdmFyIHBsYXllcnMgPSB1bml2ZXJzZS5nYWxheHkucGxheWVycztcbiAgICB2YXIgbG9hZGluZyA9IGNydXhcbiAgICAgICAgLlRleHQoXCJcIiwgXCJyZWwgdHh0X2NlbnRlciBwYWQxMlwiKVxuICAgICAgICAucmF3SFRNTChcIlBhcnNpbmcgXCIuY29uY2F0KG1lc3NhZ2VzLmxlbmd0aCwgXCIgbWVzc2FnZXMuXCIpKTtcbiAgICBsb2FkaW5nLnJvb3N0KG5wdWkuYWN0aXZlU2NyZWVuKTtcbiAgICB2YXIgdWlkID0gZ2V0X2hlcm8odW5pdmVyc2UpLnVpZDtcbiAgICAvL0xlZGdlciBpcyBhIGxpc3Qgb2YgZGVidHNcbiAgICB2YXIgbGVkZ2VyID0ge307XG4gICAgbWVzc2FnZXNcbiAgICAgICAgLmZpbHRlcihmdW5jdGlvbiAobSkge1xuICAgICAgICByZXR1cm4gbS5wYXlsb2FkLnRlbXBsYXRlID09IFwibW9uZXlfc2VudFwiIHx8XG4gICAgICAgICAgICBtLnBheWxvYWQudGVtcGxhdGUgPT0gXCJzaGFyZWRfdGVjaG5vbG9neVwiO1xuICAgIH0pXG4gICAgICAgIC5tYXAoZnVuY3Rpb24gKG0pIHsgcmV0dXJuIG0ucGF5bG9hZDsgfSlcbiAgICAgICAgLmZvckVhY2goZnVuY3Rpb24gKG0pIHtcbiAgICAgICAgdmFyIGxpYWlzb24gPSBtLmZyb21fcHVpZCA9PSB1aWQgPyBtLnRvX3B1aWQgOiBtLmZyb21fcHVpZDtcbiAgICAgICAgdmFyIHZhbHVlID0gbS50ZW1wbGF0ZSA9PSBcIm1vbmV5X3NlbnRcIiA/IG0uYW1vdW50IDogbS5wcmljZTtcbiAgICAgICAgdmFsdWUgKj0gbS5mcm9tX3B1aWQgPT0gdWlkID8gMSA6IC0xOyAvLyBhbW91bnQgaXMgKCspIGlmIGNyZWRpdCAmICgtKSBpZiBkZWJ0XG4gICAgICAgIGxpYWlzb24gaW4gbGVkZ2VyXG4gICAgICAgICAgICA/IChsZWRnZXJbbGlhaXNvbl0gKz0gdmFsdWUpXG4gICAgICAgICAgICA6IChsZWRnZXJbbGlhaXNvbl0gPSB2YWx1ZSk7XG4gICAgfSk7XG4gICAgLy9UT0RPOiBSZXZpZXcgdGhhdCB0aGlzIGlzIGNvcnJlY3RseSBmaW5kaW5nIGEgbGlzdCBvZiBvbmx5IHBlb3BsZSB3aG8gaGF2ZSBkZWJ0cy5cbiAgICAvL0FjY291bnRzIGFyZSB0aGUgY3JlZGl0IG9yIGRlYml0IHJlbGF0ZWQgdG8gZWFjaCB1c2VyXG4gICAgdmFyIGFjY291bnRzID0gW107XG4gICAgZm9yICh2YXIgdWlkXzEgaW4gbGVkZ2VyKSB7XG4gICAgICAgIHZhciBwbGF5ZXIgPSBwbGF5ZXJzW3BhcnNlSW50KHVpZF8xKV07XG4gICAgICAgIHBsYXllci5kZWJ0ID0gbGVkZ2VyW3VpZF8xXTtcbiAgICAgICAgYWNjb3VudHMucHVzaChwbGF5ZXIpO1xuICAgIH1cbiAgICBnZXRfaGVybyh1bml2ZXJzZSkubGVkZ2VyID0gbGVkZ2VyO1xuICAgIGNvbnNvbGUubG9nKGFjY291bnRzKTtcbiAgICByZXR1cm4gYWNjb3VudHM7XG59XG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyTGVkZ2VyKGdhbWUsIGNydXgsIE1vdXNlVHJhcCkge1xuICAgIC8vRGVjb25zdHJ1Y3Rpb24gb2YgZGlmZmVyZW50IGNvbXBvbmVudHMgb2YgdGhlIGdhbWUuXG4gICAgdmFyIGNvbmZpZyA9IGdhbWUuY29uZmlnO1xuICAgIHZhciBucCA9IGdhbWUubnA7XG4gICAgdmFyIG5wdWkgPSBnYW1lLm5wdWk7XG4gICAgdmFyIHVuaXZlcnNlID0gZ2FtZS51bml2ZXJzZTtcbiAgICB2YXIgdGVtcGxhdGVzID0gZ2FtZS50ZW1wbGF0ZXM7XG4gICAgdmFyIHBsYXllcnMgPSB1bml2ZXJzZS5nYWxheHkucGxheWVycztcbiAgICBNb3VzZVRyYXAuYmluZChbXCJtXCIsIFwiTVwiXSwgZnVuY3Rpb24gKCkge1xuICAgICAgICBucC50cmlnZ2VyKFwidHJpZ2dlcl9sZWRnZXJcIik7XG4gICAgfSk7XG4gICAgdGVtcGxhdGVzW1wibGVkZ2VyXCJdID0gXCJMZWRnZXJcIjtcbiAgICB0ZW1wbGF0ZXNbXCJ0ZWNoX3RyYWRpbmdcIl0gPSBcIlRyYWRpbmcgVGVjaG5vbG9neVwiO1xuICAgIHRlbXBsYXRlc1tcImZvcmdpdmVcIl0gPSBcIlBheSBEZWJ0XCI7XG4gICAgdGVtcGxhdGVzW1wiZm9yZ2l2ZV9kZWJ0XCJdID0gXCJBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gZm9yZ2l2ZSB0aGlzIGRlYnQ/XCI7XG4gICAgaWYgKCFucHVpLmhhc21lbnVpdGVtKSB7XG4gICAgICAgIG5wdWlcbiAgICAgICAgICAgIC5TaWRlTWVudUl0ZW0oXCJpY29uLWRhdGFiYXNlXCIsIFwibGVkZ2VyXCIsIFwidHJpZ2dlcl9sZWRnZXJcIilcbiAgICAgICAgICAgIC5yb29zdChucHVpLnNpZGVNZW51KTtcbiAgICAgICAgbnB1aS5oYXNtZW51aXRlbSA9IHRydWU7XG4gICAgfVxuICAgIG5wdWkubGVkZ2VyU2NyZWVuID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gbnB1aS5TY3JlZW4oXCJsZWRnZXJcIik7XG4gICAgfTtcbiAgICBucC5vbihcInRyaWdnZXJfbGVkZ2VyXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGxlZGdlclNjcmVlbiA9IG5wdWkubGVkZ2VyU2NyZWVuKCk7XG4gICAgICAgIHZhciBsb2FkaW5nID0gY3J1eFxuICAgICAgICAgICAgLlRleHQoXCJcIiwgXCJyZWwgdHh0X2NlbnRlciBwYWQxMiBzZWN0aW9uX3RpdGxlXCIpXG4gICAgICAgICAgICAucmF3SFRNTChcIlRhYnVsYXRpbmcgTGVkZ2VyLi4uXCIpO1xuICAgICAgICBsb2FkaW5nLnJvb3N0KGxlZGdlclNjcmVlbik7XG4gICAgICAgIG5wdWkub25IaWRlU2NyZWVuKG51bGwsIHRydWUpO1xuICAgICAgICBucHVpLm9uSGlkZVNlbGVjdGlvbk1lbnUoKTtcbiAgICAgICAgbnB1aS50cmlnZ2VyKFwiaGlkZV9zaWRlX21lbnVcIik7XG4gICAgICAgIG5wdWkudHJpZ2dlcihcInJlc2V0X2VkaXRfbW9kZVwiKTtcbiAgICAgICAgbnB1aS5hY3RpdmVTY3JlZW4gPSBsZWRnZXJTY3JlZW47XG4gICAgICAgIGxlZGdlclNjcmVlbi5yb29zdChucHVpLnNjcmVlbkNvbnRhaW5lcik7XG4gICAgICAgIG5wdWkubGF5b3V0RWxlbWVudChsZWRnZXJTY3JlZW4pO1xuICAgICAgICBDYWNoZS51cGRhdGVfZXZlbnRfY2FjaGUoZ2FtZSwgY3J1eCwgNCwgQ2FjaGUucmVjaWV2ZV9uZXdfbWVzc2FnZXMsIGNvbnNvbGUuZXJyb3IpO1xuICAgIH0pO1xuICAgIC8vV2h5IG5vdCBucC5vbihcIkZvcmdpdmVEZWJ0XCIpP1xuICAgIG5wLm9uRm9yZ2l2ZURlYnQgPSBmdW5jdGlvbiAoZXZlbnQsIGRhdGEpIHtcbiAgICAgICAgdmFyIHRhcmdldFBsYXllciA9IGRhdGEudGFyZ2V0UGxheWVyO1xuICAgICAgICB2YXIgcGxheWVyID0gcGxheWVyc1t0YXJnZXRQbGF5ZXJdO1xuICAgICAgICB2YXIgYW1vdW50ID0gcGxheWVyLmRlYnQgKiAtMTtcbiAgICAgICAgLy9sZXQgYW1vdW50ID0gMVxuICAgICAgICB1bml2ZXJzZS5wbGF5ZXIubGVkZ2VyW3RhcmdldFBsYXllcl0gPSAwO1xuICAgICAgICBucC50cmlnZ2VyKFwic2hvd19zY3JlZW5cIiwgW1xuICAgICAgICAgICAgXCJjb25maXJtXCIsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZTogXCJmb3JnaXZlX2RlYnRcIixcbiAgICAgICAgICAgICAgICBldmVudEtpbmQ6IFwiY29uZmlybV9mb3JnaXZlX2RlYnRcIixcbiAgICAgICAgICAgICAgICBldmVudERhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJvcmRlclwiLFxuICAgICAgICAgICAgICAgICAgICBvcmRlcjogXCJzZW5kX21vbmV5LFwiLmNvbmNhdCh0YXJnZXRQbGF5ZXIsIFwiLFwiKS5jb25jYXQoYW1vdW50KSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgXSk7XG4gICAgfTtcbiAgICBucC5vbihcImNvbmZpcm1fZm9yZ2l2ZV9kZWJ0XCIsIGZ1bmN0aW9uIChldmVudCwgZGF0YSkge1xuICAgICAgICBucC50cmlnZ2VyKFwic2VydmVyX3JlcXVlc3RcIiwgZGF0YSk7XG4gICAgICAgIG5wLnRyaWdnZXIoXCJ0cmlnZ2VyX2xlZGdlclwiKTtcbiAgICB9KTtcbiAgICBucC5vbihcImZvcmdpdmVfZGVidFwiLCBucC5vbkZvcmdpdmVEZWJ0KTtcbn1cbiIsInZhciBfX2Fzc2lnbiA9ICh0aGlzICYmIHRoaXMuX19hc3NpZ24pIHx8IGZ1bmN0aW9uICgpIHtcbiAgICBfX2Fzc2lnbiA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24odCkge1xuICAgICAgICBmb3IgKHZhciBzLCBpID0gMSwgbiA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBuOyBpKyspIHtcbiAgICAgICAgICAgIHMgPSBhcmd1bWVudHNbaV07XG4gICAgICAgICAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkpXG4gICAgICAgICAgICAgICAgdFtwXSA9IHNbcF07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHQ7XG4gICAgfTtcbiAgICByZXR1cm4gX19hc3NpZ24uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn07XG5mdW5jdGlvbiBtZXJnZVVzZXIoZXZlbnQsIGRhdGEpIHtcbiAgICBpZiAoTmVwdHVuZXNQcmlkZS5vcmlnaW5hbFBsYXllciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIE5lcHR1bmVzUHJpZGUub3JpZ2luYWxQbGF5ZXIgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlLnBsYXllci51aWQ7XG4gICAgfVxuICAgIHZhciBjb2RlID0gKGRhdGEgPT09IG51bGwgfHwgZGF0YSA9PT0gdm9pZCAwID8gdm9pZCAwIDogZGF0YS5zcGxpdChcIjpcIilbMV0pIHx8IG90aGVyVXNlckNvZGU7XG4gICAgdmFyIG90aGVyVXNlckNvZGUgPSBjb2RlO1xuICAgIGlmIChvdGhlclVzZXJDb2RlKSB7XG4gICAgICAgIHZhciBwYXJhbXMgPSB7XG4gICAgICAgICAgICBnYW1lX251bWJlcjogZ2FtZSxcbiAgICAgICAgICAgIGFwaV92ZXJzaW9uOiBcIjAuMVwiLFxuICAgICAgICAgICAgY29kZTogb3RoZXJVc2VyQ29kZSxcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIGVnZ2VycyA9IGpRdWVyeS5hamF4KHtcbiAgICAgICAgICAgIHR5cGU6IFwiUE9TVFwiLFxuICAgICAgICAgICAgdXJsOiBcImh0dHBzOi8vbnAuaXJvbmhlbG1ldC5jb20vYXBpXCIsXG4gICAgICAgICAgICBhc3luYzogZmFsc2UsXG4gICAgICAgICAgICBkYXRhOiBwYXJhbXMsXG4gICAgICAgICAgICBkYXRhVHlwZTogXCJqc29uXCIsXG4gICAgICAgIH0pO1xuICAgICAgICB2YXIgdW5pdmVyc2UgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlO1xuICAgICAgICB2YXIgc2NhbiA9IGVnZ2Vycy5yZXNwb25zZUpTT04uc2Nhbm5pbmdfZGF0YTtcbiAgICAgICAgdW5pdmVyc2UuZ2FsYXh5LnN0YXJzID0gX19hc3NpZ24oX19hc3NpZ24oe30sIHNjYW4uc3RhcnMpLCB1bml2ZXJzZS5nYWxheHkuc3RhcnMpO1xuICAgICAgICBmb3IgKHZhciBzIGluIHNjYW4uc3RhcnMpIHtcbiAgICAgICAgICAgIHZhciBzdGFyID0gc2Nhbi5zdGFyc1tzXTtcbiAgICAgICAgICAgIC8vQWRkIGhlcmUgYSBzdGF0ZW1lbnQgdG8gc2tpcCBpZiBpdCBpcyBoZXJvJ3Mgc3Rhci5cbiAgICAgICAgICAgIGlmIChzdGFyLnYgIT09IFwiMFwiKSB7XG4gICAgICAgICAgICAgICAgdW5pdmVyc2UuZ2FsYXh5LnN0YXJzW3NdID0gX19hc3NpZ24oX19hc3NpZ24oe30sIHVuaXZlcnNlLmdhbGF4eS5zdGFyc1tzXSksIHN0YXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHVuaXZlcnNlLmdhbGF4eS5mbGVldHMgPSBfX2Fzc2lnbihfX2Fzc2lnbih7fSwgc2Nhbi5mbGVldHMpLCB1bml2ZXJzZS5nYWxheHkuZmxlZXRzKTtcbiAgICAgICAgTmVwdHVuZXNQcmlkZS5ucC5vbkZ1bGxVbml2ZXJzZShudWxsLCB1bml2ZXJzZS5nYWxheHkpO1xuICAgICAgICBOZXB0dW5lc1ByaWRlLm5wdWkub25IaWRlU2NyZWVuKG51bGwsIHRydWUpO1xuICAgICAgICBpbml0KCk7XG4gICAgfVxufVxuZXhwb3J0IHsgbWVyZ2VVc2VyIH07XG4iLCJleHBvcnQgZnVuY3Rpb24gaXNfdmFsaWRfaW1hZ2VfdXJsKHN0cikge1xuICAgIHZhciBwcm90b2NvbCA9IFwiXihodHRwczpcXFxcL1xcXFwvKVwiO1xuICAgIHZhciBkb21haW5zID0gXCIoaVxcXFwuaWJiXFxcXC5jb3xpXFxcXC5pbWd1clxcXFwuY29tfGNkblxcXFwuZGlzY29yZGFwcFxcXFwuY29tKVwiO1xuICAgIHZhciBjb250ZW50ID0gXCIoWyYjXz07XFxcXC1cXFxcP1xcXFwvXFxcXHddezEsMTUwfSlcIjtcbiAgICB2YXIgaW1hZ2VzID0gXCIoXFxcXC4pKGdpZnxqcGU/Z3x0aWZmP3xwbmd8d2VicHxibXB8R0lGfEpQRT9HfFRJRkY/fFBOR3xXRUJQfEJNUCkkXCI7XG4gICAgdmFyIHJlZ2V4X3N0cmluZyA9IHByb3RvY29sICsgZG9tYWlucyArIGNvbnRlbnQgKyBpbWFnZXM7XG4gICAgdmFyIHJlZ2V4ID0gbmV3IFJlZ0V4cChyZWdleF9zdHJpbmcpO1xuICAgIHZhciB2YWxpZCA9IHJlZ2V4LnRlc3Qoc3RyKTtcbiAgICBjb25zb2xlLmxvZyhyZWdleF9zdHJpbmcsIHN0ciwgdmFsaWQpO1xuICAgIHJldHVybiB2YWxpZDtcbn1cbmV4cG9ydCBmdW5jdGlvbiBpc192YWxpZF95b3V0dWJlKHN0cikge1xuICAgIHZhciBwcm90b2NvbCA9IFwiXihodHRwczovLylcIjtcbiAgICB2YXIgZG9tYWlucyA9IFwiKHlvdXR1YmUuY29tfHd3dy55b3V0dWJlLmNvbXx5b3V0dS5iZSlcIjtcbiAgICB2YXIgY29udGVudCA9IFwiKFsmI189Oy0/L3ddezEsMTUwfSlcIjtcbiAgICB2YXIgcmVnZXhfc3RyaW5nID0gcHJvdG9jb2wgKyBkb21haW5zICsgY29udGVudDtcbiAgICB2YXIgcmVnZXggPSBuZXcgUmVnRXhwKHJlZ2V4X3N0cmluZyk7XG4gICAgcmV0dXJuIHJlZ2V4LnRlc3Qoc3RyKTtcbn1cbmZ1bmN0aW9uIGdldF95b3V0dWJlX2VtYmVkKGxpbmspIHtcbiAgICByZXR1cm4gXCI8aWZyYW1lIHdpZHRoPVxcXCI1NjBcXFwiIGhlaWdodD1cXFwiMzE1XFxcIiBzcmM9XFxcImh0dHBzOi8vd3d3LnlvdXR1YmUuY29tL2VtYmVkL2VIc0RUR3dfalo4XFxcIiB0aXRsZT1cXFwiWW91VHViZSB2aWRlbyBwbGF5ZXJcXFwiIGZyYW1lYm9yZGVyPVxcXCIwXFxcIiBhbGxvdz1cXFwiYWNjZWxlcm9tZXRlcjsgYXV0b3BsYXk7IGNsaXBib2FyZC13cml0ZTsgZW5jcnlwdGVkLW1lZGlhOyBneXJvc2NvcGU7IHBpY3R1cmUtaW4tcGljdHVyZTsgd2ViLXNoYXJlXFxcIiBhbGxvd2Z1bGxzY3JlZW4+PC9pZnJhbWU+XCI7XG59XG4iLCJleHBvcnQgZnVuY3Rpb24gZ2V0X2hlcm8odW5pdmVyc2UpIHtcbiAgICByZXR1cm4gdW5pdmVyc2UucGxheWVyO1xufVxuZXhwb3J0IGRlZmF1bHQgeyBnZXRfaGVybzogZ2V0X2hlcm8gfTtcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBkZWZpbml0aW9uKSB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iaiwgcHJvcCkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCk7IH0iLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsInZhciBfX2Fzc2lnbiA9ICh0aGlzICYmIHRoaXMuX19hc3NpZ24pIHx8IGZ1bmN0aW9uICgpIHtcbiAgICBfX2Fzc2lnbiA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24odCkge1xuICAgICAgICBmb3IgKHZhciBzLCBpID0gMSwgbiA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBuOyBpKyspIHtcbiAgICAgICAgICAgIHMgPSBhcmd1bWVudHNbaV07XG4gICAgICAgICAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkpXG4gICAgICAgICAgICAgICAgdFtwXSA9IHNbcF07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHQ7XG4gICAgfTtcbiAgICByZXR1cm4gX19hc3NpZ24uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn07XG52YXIgX19hd2FpdGVyID0gKHRoaXMgJiYgdGhpcy5fX2F3YWl0ZXIpIHx8IGZ1bmN0aW9uICh0aGlzQXJnLCBfYXJndW1lbnRzLCBQLCBnZW5lcmF0b3IpIHtcbiAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH1cbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgZnVuY3Rpb24gZnVsZmlsbGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yLm5leHQodmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cbiAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpO1xuICAgIH0pO1xufTtcbnZhciBfX2dlbmVyYXRvciA9ICh0aGlzICYmIHRoaXMuX19nZW5lcmF0b3IpIHx8IGZ1bmN0aW9uICh0aGlzQXJnLCBib2R5KSB7XG4gICAgdmFyIF8gPSB7IGxhYmVsOiAwLCBzZW50OiBmdW5jdGlvbigpIHsgaWYgKHRbMF0gJiAxKSB0aHJvdyB0WzFdOyByZXR1cm4gdFsxXTsgfSwgdHJ5czogW10sIG9wczogW10gfSwgZiwgeSwgdCwgZztcbiAgICByZXR1cm4gZyA9IHsgbmV4dDogdmVyYigwKSwgXCJ0aHJvd1wiOiB2ZXJiKDEpLCBcInJldHVyblwiOiB2ZXJiKDIpIH0sIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiAoZ1tTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzOyB9KSwgZztcbiAgICBmdW5jdGlvbiB2ZXJiKG4pIHsgcmV0dXJuIGZ1bmN0aW9uICh2KSB7IHJldHVybiBzdGVwKFtuLCB2XSk7IH07IH1cbiAgICBmdW5jdGlvbiBzdGVwKG9wKSB7XG4gICAgICAgIGlmIChmKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiR2VuZXJhdG9yIGlzIGFscmVhZHkgZXhlY3V0aW5nLlwiKTtcbiAgICAgICAgd2hpbGUgKGcgJiYgKGcgPSAwLCBvcFswXSAmJiAoXyA9IDApKSwgXykgdHJ5IHtcbiAgICAgICAgICAgIGlmIChmID0gMSwgeSAmJiAodCA9IG9wWzBdICYgMiA/IHlbXCJyZXR1cm5cIl0gOiBvcFswXSA/IHlbXCJ0aHJvd1wiXSB8fCAoKHQgPSB5W1wicmV0dXJuXCJdKSAmJiB0LmNhbGwoeSksIDApIDogeS5uZXh0KSAmJiAhKHQgPSB0LmNhbGwoeSwgb3BbMV0pKS5kb25lKSByZXR1cm4gdDtcbiAgICAgICAgICAgIGlmICh5ID0gMCwgdCkgb3AgPSBbb3BbMF0gJiAyLCB0LnZhbHVlXTtcbiAgICAgICAgICAgIHN3aXRjaCAob3BbMF0pIHtcbiAgICAgICAgICAgICAgICBjYXNlIDA6IGNhc2UgMTogdCA9IG9wOyBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDQ6IF8ubGFiZWwrKzsgcmV0dXJuIHsgdmFsdWU6IG9wWzFdLCBkb25lOiBmYWxzZSB9O1xuICAgICAgICAgICAgICAgIGNhc2UgNTogXy5sYWJlbCsrOyB5ID0gb3BbMV07IG9wID0gWzBdOyBjb250aW51ZTtcbiAgICAgICAgICAgICAgICBjYXNlIDc6IG9wID0gXy5vcHMucG9wKCk7IF8udHJ5cy5wb3AoKTsgY29udGludWU7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEodCA9IF8udHJ5cywgdCA9IHQubGVuZ3RoID4gMCAmJiB0W3QubGVuZ3RoIC0gMV0pICYmIChvcFswXSA9PT0gNiB8fCBvcFswXSA9PT0gMikpIHsgXyA9IDA7IGNvbnRpbnVlOyB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChvcFswXSA9PT0gMyAmJiAoIXQgfHwgKG9wWzFdID4gdFswXSAmJiBvcFsxXSA8IHRbM10pKSkgeyBfLmxhYmVsID0gb3BbMV07IGJyZWFrOyB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChvcFswXSA9PT0gNiAmJiBfLmxhYmVsIDwgdFsxXSkgeyBfLmxhYmVsID0gdFsxXTsgdCA9IG9wOyBicmVhazsgfVxuICAgICAgICAgICAgICAgICAgICBpZiAodCAmJiBfLmxhYmVsIDwgdFsyXSkgeyBfLmxhYmVsID0gdFsyXTsgXy5vcHMucHVzaChvcCk7IGJyZWFrOyB9XG4gICAgICAgICAgICAgICAgICAgIGlmICh0WzJdKSBfLm9wcy5wb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG9wID0gYm9keS5jYWxsKHRoaXNBcmcsIF8pO1xuICAgICAgICB9IGNhdGNoIChlKSB7IG9wID0gWzYsIGVdOyB5ID0gMDsgfSBmaW5hbGx5IHsgZiA9IHQgPSAwOyB9XG4gICAgICAgIGlmIChvcFswXSAmIDUpIHRocm93IG9wWzFdOyByZXR1cm4geyB2YWx1ZTogb3BbMF0gPyBvcFsxXSA6IHZvaWQgMCwgZG9uZTogdHJ1ZSB9O1xuICAgIH1cbn07XG5pbXBvcnQgeyBpc192YWxpZF9pbWFnZV91cmwsIGlzX3ZhbGlkX3lvdXR1YmUgfSBmcm9tIFwiLi9wYXJzZV91dGlsc1wiO1xuaW1wb3J0IHsgY2xpcCwgbGFzdENsaXAgfSBmcm9tIFwiLi9ob3RrZXlcIjtcbmltcG9ydCB7IGdldF9oZXJvIH0gZnJvbSBcIi4vdXRpbGl0aWVzXCI7XG5pbXBvcnQgeyByZW5kZXJMZWRnZXIgfSBmcm9tIFwiLi9sZWRnZXJcIjtcbmltcG9ydCB7IG1lcmdlVXNlciB9IGZyb20gXCIuL21lcmdlXCI7XG5pbXBvcnQgeyBnZXRfcmVzZWFyY2hfdGV4dCB9IGZyb20gXCIuL2NoYXRcIjtcbnZhciBTQVRfVkVSU0lPTiA9IFwiMi4yOC4wMi1naXRcIjtcbi8vVE9ETzogT3JnYW5pemUgdHlwZXNjcmlwdCB0byBhbiBpbnRlcmZhY2VzIGRpcmVjdG9yeVxuLy9UT0RPOiBUaGVuIG1ha2Ugb3RoZXIgZ2FtZSBlbmdpbmUgb2JqZWN0c1xuLy8gUGFydCBvZiB5b3VyIGNvZGUgaXMgcmUtY3JlYXRpbmcgdGhlIGdhbWUgaW4gdHlwZXNjcmlwdFxuLy8gVGhlIG90aGVyIHBhcnQgaXMgYWRkaW5nIGZlYXR1cmVzXG4vLyBUaGVuIHRoZXJlIGlzIGEgc2VnbWVudCB0aGF0IGlzIG92ZXJ3cml0aW5nIGV4aXN0aW5nIGNvbnRlbnQgdG8gYWRkIHNtYWxsIGFkZGl0aW9ucy5cbi8vQWRkIGN1c3RvbSBzZXR0aW5ncyB3aGVuIG1ha2luZyBhIG53ZSBnYW1lLlxuZnVuY3Rpb24gbW9kaWZ5X2N1c3RvbV9nYW1lKCkge1xuICAgIGNvbnNvbGUubG9nKFwiUnVubmluZyBjdXN0b20gZ2FtZSBzZXR0aW5ncyBtb2RpZmljYXRpb25cIik7XG4gICAgdmFyIHNlbGVjdG9yID0gJChcIiNjb250ZW50QXJlYSA+IGRpdiA+IGRpdi53aWRnZXQuZnVsbHNjcmVlbiA+IGRpdi53aWRnZXQucmVsID4gZGl2Om50aC1jaGlsZCg0KSA+IGRpdjpudGgtY2hpbGQoMTUpID4gc2VsZWN0XCIpWzBdO1xuICAgIGlmIChzZWxlY3RvciA9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgLy9Ob3QgaW4gbWVudVxuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0ZXh0U3RyaW5nID0gXCJcIjtcbiAgICBmb3IgKHZhciBpID0gMjsgaSA8PSAzMjsgKytpKSB7XG4gICAgICAgIHRleHRTdHJpbmcgKz0gXCI8b3B0aW9uIHZhbHVlPVxcXCJcIi5jb25jYXQoaSwgXCJcXFwiPlwiKS5jb25jYXQoaSwgXCIgUGxheWVyczwvb3B0aW9uPlwiKTtcbiAgICB9XG4gICAgY29uc29sZS5sb2codGV4dFN0cmluZyk7XG4gICAgc2VsZWN0b3IuaW5uZXJIVE1MID0gdGV4dFN0cmluZztcbn1cbnNldFRpbWVvdXQobW9kaWZ5X2N1c3RvbV9nYW1lLCA1MDApO1xuLy9UT0RPOiBNYWtlIGlzIHdpdGhpbiBzY2FubmluZyBmdW5jdGlvblxuLy9TaGFyZSBhbGwgdGVjaCBkaXNwbGF5IGFzIHRlY2ggaXMgYWN0aXZlbHkgdHJhZGluZy5cbnZhciBkaXNwbGF5X3RlY2hfdHJhZGluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgbnB1aSA9IE5lcHR1bmVzUHJpZGUubnB1aTtcbiAgICB2YXIgdGVjaF90cmFkZV9zY3JlZW4gPSBucHVpLlNjcmVlbihcInRlY2hfdHJhZGluZ1wiKTtcbiAgICBucHVpLm9uSGlkZVNjcmVlbihudWxsLCB0cnVlKTtcbiAgICBucHVpLm9uSGlkZVNlbGVjdGlvbk1lbnUoKTtcbiAgICBucHVpLnRyaWdnZXIoXCJoaWRlX3NpZGVfbWVudVwiKTtcbiAgICBucHVpLnRyaWdnZXIoXCJyZXNldF9lZGl0X21vZGVcIik7XG4gICAgbnB1aS5hY3RpdmVTY3JlZW4gPSB0ZWNoX3RyYWRlX3NjcmVlbjtcbiAgICB0ZWNoX3RyYWRlX3NjcmVlbi5yb29zdChucHVpLnNjcmVlbkNvbnRhaW5lcik7XG4gICAgbnB1aS5sYXlvdXRFbGVtZW50KHRlY2hfdHJhZGVfc2NyZWVuKTtcbiAgICB2YXIgdHJhZGluZyA9IENydXguVGV4dChcIlwiLCBcInJlbCBwYWQxMlwiKS5yYXdIVE1MKFwiVHJhZGluZy4uXCIpO1xuICAgIHRyYWRpbmcucm9vc3QodGVjaF90cmFkZV9zY3JlZW4pO1xuICAgIHRlY2hfdHJhZGVfc2NyZWVuLnRyYW5zYWN0ID0gZnVuY3Rpb24gKHRleHQpIHtcbiAgICAgICAgdmFyIHRyYWRpbmcgPSBDcnV4LlRleHQoXCJcIiwgXCJyZWwgcGFkOFwiKS5yYXdIVE1MKHRleHQpO1xuICAgICAgICB0cmFkaW5nLnJvb3N0KHRlY2hfdHJhZGVfc2NyZWVuKTtcbiAgICB9O1xuICAgIHJldHVybiB0ZWNoX3RyYWRlX3NjcmVlbjtcbn07XG4vL1JldHVybnMgYWxsIHN0YXJzIEkgc3VwcG9zZVxudmFyIF9nZXRfc3Rhcl9naXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHN0YXJzID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5nYWxheHkuc3RhcnM7XG4gICAgdmFyIG91dHB1dCA9IFtdO1xuICAgIGZvciAodmFyIHMgaW4gc3RhcnMpIHtcbiAgICAgICAgdmFyIHN0YXIgPSBzdGFyc1tzXTtcbiAgICAgICAgb3V0cHV0LnB1c2goe1xuICAgICAgICAgICAgeDogc3Rhci54LFxuICAgICAgICAgICAgeTogc3Rhci55LFxuICAgICAgICAgICAgb3duZXI6IHN0YXIucXVhbGlmaWVkQWxpYXMsXG4gICAgICAgICAgICBlY29ub215OiBzdGFyLmUsXG4gICAgICAgICAgICBpbmR1c3RyeTogc3Rhci5pLFxuICAgICAgICAgICAgc2NpZW5jZTogc3Rhci5zLFxuICAgICAgICAgICAgc2hpcHM6IHN0YXIudG90YWxEZWZlbnNlcyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBvdXRwdXQ7XG59O1xudmFyIF9nZXRfd2VhcG9uc19uZXh0ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciByZXNlYXJjaCA9IGdldF9yZXNlYXJjaCgpO1xuICAgIGlmIChyZXNlYXJjaFtcImN1cnJlbnRfbmFtZVwiXSA9PSBcIldlYXBvbnNcIikge1xuICAgICAgICByZXR1cm4gcmVzZWFyY2hbXCJjdXJyZW50X2V0YVwiXTtcbiAgICB9XG4gICAgZWxzZSBpZiAocmVzZWFyY2hbXCJuZXh0X25hbWVcIl0gPT0gXCJXZWFwb25zXCIpIHtcbiAgICAgICAgcmV0dXJuIHJlc2VhcmNoW1wibmV4dF9ldGFcIl07XG4gICAgfVxuICAgIHJldHVybiBNYXRoLnBvdygxMCwgMTApO1xufTtcbnZhciBnZXRfdGVjaF90cmFkZV9jb3N0ID0gZnVuY3Rpb24gKGZyb20sIHRvLCB0ZWNoX25hbWUpIHtcbiAgICBpZiAodGVjaF9uYW1lID09PSB2b2lkIDApIHsgdGVjaF9uYW1lID0gbnVsbDsgfVxuICAgIHZhciB0b3RhbF9jb3N0ID0gMDtcbiAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gT2JqZWN0LmVudHJpZXModG8udGVjaCk7IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgIHZhciBfYiA9IF9hW19pXSwgdGVjaCA9IF9iWzBdLCB2YWx1ZSA9IF9iWzFdO1xuICAgICAgICBpZiAodGVjaF9uYW1lID09IG51bGwgfHwgdGVjaF9uYW1lID09IHRlY2gpIHtcbiAgICAgICAgICAgIHZhciBtZSA9IGZyb20udGVjaFt0ZWNoXS5sZXZlbDtcbiAgICAgICAgICAgIHZhciB5b3UgPSB2YWx1ZS5sZXZlbDtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDw9IG1lIC0geW91OyArK2kpIHtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKHRlY2gsKHlvdStpKSwoeW91K2kpKjE1KVxuICAgICAgICAgICAgICAgIHRvdGFsX2Nvc3QgKz0gKHlvdSArIGkpICogTmVwdHVuZXNQcmlkZS5nYW1lQ29uZmlnLnRyYWRlQ29zdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdG90YWxfY29zdDtcbn07XG4vL0hvb2tzIHRvIGJ1dHRvbnMgZm9yIHNoYXJpbmcgYW5kIGJ1eWluZ1xuLy9QcmV0dHkgc2ltcGxlIGhvb2tzIHRoYXQgY2FuIGJlIGFkZGVkIHRvIGEgdHlwZXNjcmlwdCBmaWxlLlxudmFyIGFwcGx5X2hvb2tzID0gZnVuY3Rpb24gKCkge1xuICAgIE5lcHR1bmVzUHJpZGUubnAub24oXCJzaGFyZV9hbGxfdGVjaFwiLCBmdW5jdGlvbiAoZXZlbnQsIHBsYXllcikge1xuICAgICAgICB2YXIgdG90YWxfY29zdCA9IGdldF90ZWNoX3RyYWRlX2Nvc3QoZ2V0X2hlcm8oTmVwdHVuZXNQcmlkZS51bml2ZXJzZSksIHBsYXllcik7XG4gICAgICAgIE5lcHR1bmVzUHJpZGUudGVtcGxhdGVzW1wiY29uZmlybV90ZWNoX3NoYXJlX1wiLmNvbmNhdChwbGF5ZXIudWlkKV0gPSBcIkFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBzcGVuZCAkXCIuY29uY2F0KHRvdGFsX2Nvc3QsIFwiIHRvIGdpdmUgXCIpLmNvbmNhdChwbGF5ZXIucmF3QWxpYXMsIFwiIGFsbCBvZiB5b3VyIHRlY2g/XCIpO1xuICAgICAgICBOZXB0dW5lc1ByaWRlLm5wLnRyaWdnZXIoXCJzaG93X3NjcmVlblwiLCBbXG4gICAgICAgICAgICBcImNvbmZpcm1cIixcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBcImNvbmZpcm1fdGVjaF9zaGFyZV9cIi5jb25jYXQocGxheWVyLnVpZCksXG4gICAgICAgICAgICAgICAgZXZlbnRLaW5kOiBcImNvbmZpcm1fdHJhZGVfdGVjaFwiLFxuICAgICAgICAgICAgICAgIGV2ZW50RGF0YTogcGxheWVyLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgXSk7XG4gICAgfSk7XG4gICAgTmVwdHVuZXNQcmlkZS5ucC5vbihcImJ1eV9hbGxfdGVjaFwiLCBmdW5jdGlvbiAoZXZlbnQsIGRhdGEpIHtcbiAgICAgICAgdmFyIHBsYXllciA9IGRhdGEucGxheWVyO1xuICAgICAgICB2YXIgY29zdCA9IGRhdGEuY29zdDtcbiAgICAgICAgTmVwdHVuZXNQcmlkZS50ZW1wbGF0ZXNbXCJjb25maXJtX3RlY2hfc2hhcmVfXCIuY29uY2F0KHBsYXllci51aWQpXSA9IFwiQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIHNwZW5kICRcIi5jb25jYXQoY29zdCwgXCIgdG8gYnV5IGFsbCBvZiBcIikuY29uY2F0KHBsYXllci5yYXdBbGlhcywgXCIncyB0ZWNoPyBJdCBpcyB1cCB0byB0aGVtIHRvIGFjdHVhbGx5IHNlbmQgaXQgdG8geW91LlwiKTtcbiAgICAgICAgTmVwdHVuZXNQcmlkZS5ucC50cmlnZ2VyKFwic2hvd19zY3JlZW5cIiwgW1xuICAgICAgICAgICAgXCJjb25maXJtXCIsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZTogXCJjb25maXJtX3RlY2hfc2hhcmVfXCIuY29uY2F0KHBsYXllci51aWQpLFxuICAgICAgICAgICAgICAgIGV2ZW50S2luZDogXCJjb25maXJtX2J1eV90ZWNoXCIsXG4gICAgICAgICAgICAgICAgZXZlbnREYXRhOiBkYXRhLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgXSk7XG4gICAgfSk7XG4gICAgTmVwdHVuZXNQcmlkZS5ucC5vbihcImJ1eV9vbmVfdGVjaFwiLCBmdW5jdGlvbiAoZXZlbnQsIGRhdGEpIHtcbiAgICAgICAgdmFyIHBsYXllciA9IGRhdGEucGxheWVyO1xuICAgICAgICB2YXIgdGVjaCA9IGRhdGEudGVjaDtcbiAgICAgICAgdmFyIGNvc3QgPSBkYXRhLmNvc3Q7XG4gICAgICAgIGNvbnNvbGUubG9nKHBsYXllcik7XG4gICAgICAgIE5lcHR1bmVzUHJpZGUudGVtcGxhdGVzW1wiY29uZmlybV90ZWNoX3NoYXJlX1wiLmNvbmNhdChwbGF5ZXIudWlkKV0gPSBcIkFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBzcGVuZCAkXCIuY29uY2F0KGNvc3QsIFwiIHRvIGJ1eSBcIikuY29uY2F0KHRlY2gsIFwiIGZyb20gXCIpLmNvbmNhdChwbGF5ZXIucmF3QWxpYXMsIFwiPyBJdCBpcyB1cCB0byB0aGVtIHRvIGFjdHVhbGx5IHNlbmQgaXQgdG8geW91LlwiKTtcbiAgICAgICAgTmVwdHVuZXNQcmlkZS5ucC50cmlnZ2VyKFwic2hvd19zY3JlZW5cIiwgW1xuICAgICAgICAgICAgXCJjb25maXJtXCIsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZTogXCJjb25maXJtX3RlY2hfc2hhcmVfXCIuY29uY2F0KHBsYXllci51aWQpLFxuICAgICAgICAgICAgICAgIGV2ZW50S2luZDogXCJjb25maXJtX2J1eV90ZWNoXCIsXG4gICAgICAgICAgICAgICAgZXZlbnREYXRhOiBkYXRhLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgXSk7XG4gICAgfSk7XG4gICAgTmVwdHVuZXNQcmlkZS5ucC5vbihcImNvbmZpcm1fdHJhZGVfdGVjaFwiLCBmdW5jdGlvbiAoZXZlbiwgcGxheWVyKSB7XG4gICAgICAgIHZhciBoZXJvID0gZ2V0X2hlcm8oTmVwdHVuZXNQcmlkZS51bml2ZXJzZSk7XG4gICAgICAgIHZhciBkaXNwbGF5ID0gZGlzcGxheV90ZWNoX3RyYWRpbmcoKTtcbiAgICAgICAgdmFyIGNsb3NlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5zZWxlY3RQbGF5ZXIocGxheWVyKTtcbiAgICAgICAgICAgIE5lcHR1bmVzUHJpZGUubnAudHJpZ2dlcihcInJlZnJlc2hfaW50ZXJmYWNlXCIpO1xuICAgICAgICAgICAgTmVwdHVuZXNQcmlkZS5ucC5ucHVpLnJlZnJlc2hUdXJuTWFuYWdlcigpO1xuICAgICAgICB9O1xuICAgICAgICB2YXIgb2Zmc2V0ID0gMzAwO1xuICAgICAgICB2YXIgX2xvb3BfMSA9IGZ1bmN0aW9uICh0ZWNoLCB2YWx1ZSkge1xuICAgICAgICAgICAgdmFyIG1lID0gaGVyby50ZWNoW3RlY2hdLmxldmVsO1xuICAgICAgICAgICAgdmFyIHlvdSA9IHZhbHVlLmxldmVsO1xuICAgICAgICAgICAgdmFyIF9sb29wXzIgPSBmdW5jdGlvbiAoaSkge1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhtZSAtIHlvdSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJvcmRlclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgb3JkZXI6IFwic2hhcmVfdGVjaCxcIi5jb25jYXQocGxheWVyLnVpZCwgXCIsXCIpLmNvbmNhdCh0ZWNoKSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXkudHJhbnNhY3QoXCJTZW5kaW5nIFwiLmNvbmNhdCh0ZWNoLCBcIiBsZXZlbCBcIikuY29uY2F0KHlvdSArIGkpKTtcbiAgICAgICAgICAgICAgICAgICAgTmVwdHVuZXNQcmlkZS5ucC50cmlnZ2VyKFwic2VydmVyX3JlcXVlc3RcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJvcmRlclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgb3JkZXI6IFwic2hhcmVfdGVjaCxcIi5jb25jYXQocGxheWVyLnVpZCwgXCIsXCIpLmNvbmNhdCh0ZWNoKSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpID09IG1lIC0geW91KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5LnRyYW5zYWN0KFwiRG9uZS5cIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCBvZmZzZXQpO1xuICAgICAgICAgICAgICAgIG9mZnNldCArPSAxMDAwO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDw9IG1lIC0geW91OyArK2kpIHtcbiAgICAgICAgICAgICAgICBfbG9vcF8yKGkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gT2JqZWN0LmVudHJpZXMocGxheWVyLnRlY2gpOyBfaSA8IF9hLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgdmFyIF9iID0gX2FbX2ldLCB0ZWNoID0gX2JbMF0sIHZhbHVlID0gX2JbMV07XG4gICAgICAgICAgICBfbG9vcF8xKHRlY2gsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBzZXRUaW1lb3V0KGNsb3NlLCBvZmZzZXQgKyAxMDAwKTtcbiAgICB9KTtcbiAgICAvL1BheXMgYSBwbGF5ZXIgYSBjZXJ0YWluIGFtb3VudFxuICAgIE5lcHR1bmVzUHJpZGUubnAub24oXCJjb25maXJtX2J1eV90ZWNoXCIsIGZ1bmN0aW9uIChldmVuLCBkYXRhKSB7XG4gICAgICAgIHZhciBwbGF5ZXIgPSBkYXRhLnBsYXllcjtcbiAgICAgICAgTmVwdHVuZXNQcmlkZS5ucC50cmlnZ2VyKFwic2VydmVyX3JlcXVlc3RcIiwge1xuICAgICAgICAgICAgdHlwZTogXCJvcmRlclwiLFxuICAgICAgICAgICAgb3JkZXI6IFwic2VuZF9tb25leSxcIi5jb25jYXQocGxheWVyLnVpZCwgXCIsXCIpLmNvbmNhdChkYXRhLmNvc3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5zZWxlY3RQbGF5ZXIocGxheWVyKTtcbiAgICAgICAgTmVwdHVuZXNQcmlkZS5ucC50cmlnZ2VyKFwicmVmcmVzaF9pbnRlcmZhY2VcIik7XG4gICAgfSk7XG59O1xudmFyIF93aWRlX3ZpZXcgPSBmdW5jdGlvbiAoKSB7XG4gICAgTmVwdHVuZXNQcmlkZS5ucC50cmlnZ2VyKFwibWFwX2NlbnRlcl9zbGlkZVwiLCB7IHg6IDAsIHk6IDAgfSk7XG4gICAgTmVwdHVuZXNQcmlkZS5ucC50cmlnZ2VyKFwiem9vbV9taW5pbWFwXCIpO1xufTtcbmZ1bmN0aW9uIExlZ2FjeV9OZXB0dW5lc1ByaWRlQWdlbnQoKSB7XG4gICAgdmFyIF9hLCBfYjtcbiAgICB2YXIgdGl0bGUgPSAoKF9hID0gZG9jdW1lbnQgPT09IG51bGwgfHwgZG9jdW1lbnQgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGRvY3VtZW50LmN1cnJlbnRTY3JpcHQpID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS50aXRsZSkgfHwgXCJTQVQgXCIuY29uY2F0KFNBVF9WRVJTSU9OKTtcbiAgICB2YXIgdmVyc2lvbiA9IHRpdGxlLnJlcGxhY2UoL14uKnYvLCBcInZcIik7XG4gICAgY29uc29sZS5sb2codGl0bGUpO1xuICAgIHZhciBjb3B5ID0gZnVuY3Rpb24gKHJlcG9ydEZuKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXBvcnRGbigpO1xuICAgICAgICAgICAgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQobGFzdENsaXApO1xuICAgICAgICB9O1xuICAgIH07XG4gICAgdmFyIGhvdGtleXMgPSBbXTtcbiAgICB2YXIgaG90a2V5ID0gZnVuY3Rpb24gKGtleSwgYWN0aW9uKSB7XG4gICAgICAgIGhvdGtleXMucHVzaChba2V5LCBhY3Rpb25dKTtcbiAgICAgICAgTW91c2V0cmFwLmJpbmQoa2V5LCBjb3B5KGFjdGlvbikpO1xuICAgIH07XG4gICAgaWYgKCFTdHJpbmcucHJvdG90eXBlLmZvcm1hdCkge1xuICAgICAgICBTdHJpbmcucHJvdG90eXBlLmZvcm1hdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBhcmdzID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgICAgIGFyZ3NbX2ldID0gYXJndW1lbnRzW19pXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGlzLnJlcGxhY2UoL3soXFxkKyl9L2csIGZ1bmN0aW9uIChtYXRjaCwgbnVtYmVyKSB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBhcmdzW251bWJlcl0gPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIE1hdGgudHJ1bmMoYXJnc1tudW1iZXJdICogMTAwMCkgLyAxMDAwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gdHlwZW9mIGFyZ3NbbnVtYmVyXSAhPSBcInVuZGVmaW5lZFwiID8gYXJnc1tudW1iZXJdIDogbWF0Y2g7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgdmFyIGxpbmtGbGVldHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciB1bml2ZXJzZSA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2U7XG4gICAgICAgIHZhciBmbGVldHMgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlLmdhbGF4eS5mbGVldHM7XG4gICAgICAgIGZvciAodmFyIGYgaW4gZmxlZXRzKSB7XG4gICAgICAgICAgICB2YXIgZmxlZXQgPSBmbGVldHNbZl07XG4gICAgICAgICAgICB2YXIgZmxlZXRMaW5rID0gXCI8YSBvbkNsaWNrPSdDcnV4LmNydXgudHJpZ2dlcihcXFwic2hvd19mbGVldF91aWRcXFwiLCBcXFwiXCIuY29uY2F0KGZsZWV0LnVpZCwgXCJcXFwiKSc+XCIpLmNvbmNhdChmbGVldC5uLCBcIjwvYT5cIik7XG4gICAgICAgICAgICB1bml2ZXJzZS5oeXBlcmxpbmtlZE1lc3NhZ2VJbnNlcnRzW2ZsZWV0Lm5dID0gZmxlZXRMaW5rO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBmdW5jdGlvbiBzdGFyUmVwb3J0KCkge1xuICAgICAgICB2YXIgcGxheWVycyA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2UuZ2FsYXh5LnBsYXllcnM7XG4gICAgICAgIHZhciBzdGFycyA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2UuZ2FsYXh5LnN0YXJzO1xuICAgICAgICB2YXIgb3V0cHV0ID0gW107XG4gICAgICAgIGZvciAodmFyIHAgaW4gcGxheWVycykge1xuICAgICAgICAgICAgb3V0cHV0LnB1c2goXCJbW3swfV1dXCIuZm9ybWF0KHApKTtcbiAgICAgICAgICAgIGZvciAodmFyIHMgaW4gc3RhcnMpIHtcbiAgICAgICAgICAgICAgICB2YXIgc3RhciA9IHN0YXJzW3NdO1xuICAgICAgICAgICAgICAgIGlmIChzdGFyLnB1aWQgPT0gcCAmJiBzdGFyLnNoaXBzUGVyVGljayA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIG91dHB1dC5wdXNoKFwi4oCD4oCDW1t7MH1dXSB7MX0vezJ9L3szfSB7NH0gc2hpcHNcIi5mb3JtYXQoc3Rhci5uLCBzdGFyLmUsIHN0YXIuaSwgc3Rhci5zLCBzdGFyLnRvdGFsRGVmZW5zZXMpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2xpcChvdXRwdXQuam9pbihcIlxcblwiKSk7XG4gICAgfVxuICAgIGhvdGtleShcIipcIiwgc3RhclJlcG9ydCk7XG4gICAgc3RhclJlcG9ydC5oZWxwID1cbiAgICAgICAgXCJHZW5lcmF0ZSBhIHJlcG9ydCBvbiBhbGwgc3RhcnMgaW4geW91ciBzY2FubmluZyByYW5nZSwgYW5kIGNvcHkgaXQgdG8gdGhlIGNsaXBib2FyZC5cIiArXG4gICAgICAgICAgICBcIjxwPlRoaXMgc2FtZSByZXBvcnQgY2FuIGFsc28gYmUgdmlld2VkIHZpYSB0aGUgbWVudTsgZW50ZXIgdGhlIGFnZW50IGFuZCBjaG9vc2UgaXQgZnJvbSB0aGUgZHJvcGRvd24uXCI7XG4gICAgdmFyIGFtcG0gPSBmdW5jdGlvbiAoaCwgbSkge1xuICAgICAgICBpZiAobSA8IDEwKVxuICAgICAgICAgICAgbSA9IFwiMFwiLmNvbmNhdChtKTtcbiAgICAgICAgaWYgKGggPCAxMikge1xuICAgICAgICAgICAgaWYgKGggPT0gMClcbiAgICAgICAgICAgICAgICBoID0gMTI7XG4gICAgICAgICAgICByZXR1cm4gXCJ7MH06ezF9IEFNXCIuZm9ybWF0KGgsIG0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGggPiAxMikge1xuICAgICAgICAgICAgcmV0dXJuIFwiezB9OnsxfSBQTVwiLmZvcm1hdChoIC0gMTIsIG0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBcInswfTp7MX0gUE1cIi5mb3JtYXQoaCwgbSk7XG4gICAgfTtcbiAgICB2YXIgbXNUb1RpY2sgPSBmdW5jdGlvbiAodGljaywgd2hvbGVUaW1lKSB7XG4gICAgICAgIHZhciB1bml2ZXJzZSA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2U7XG4gICAgICAgIHZhciBtc19zaW5jZV9kYXRhID0gMDtcbiAgICAgICAgdmFyIHRmID0gdW5pdmVyc2UuZ2FsYXh5LnRpY2tfZnJhZ21lbnQ7XG4gICAgICAgIHZhciBsdGMgPSB1bml2ZXJzZS5sb2NUaW1lQ29ycmVjdGlvbjtcbiAgICAgICAgaWYgKCF1bml2ZXJzZS5nYWxheHkucGF1c2VkKSB7XG4gICAgICAgICAgICBtc19zaW5jZV9kYXRhID0gbmV3IERhdGUoKS52YWx1ZU9mKCkgLSB1bml2ZXJzZS5ub3cudmFsdWVPZigpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh3aG9sZVRpbWUgfHwgdW5pdmVyc2UuZ2FsYXh5LnR1cm5fYmFzZWQpIHtcbiAgICAgICAgICAgIG1zX3NpbmNlX2RhdGEgPSAwO1xuICAgICAgICAgICAgdGYgPSAwO1xuICAgICAgICAgICAgbHRjID0gMDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgbXNfcmVtYWluaW5nID0gdGljayAqIDEwMDAgKiA2MCAqIHVuaXZlcnNlLmdhbGF4eS50aWNrX3JhdGUgLVxuICAgICAgICAgICAgdGYgKiAxMDAwICogNjAgKiB1bml2ZXJzZS5nYWxheHkudGlja19yYXRlIC1cbiAgICAgICAgICAgIG1zX3NpbmNlX2RhdGEgLVxuICAgICAgICAgICAgbHRjO1xuICAgICAgICByZXR1cm4gbXNfcmVtYWluaW5nO1xuICAgIH07XG4gICAgdmFyIGRheXMgPSBbXCJTdW5cIiwgXCJNb25cIiwgXCJUdWVcIiwgXCJXZWRcIiwgXCJUaHVcIiwgXCJGcmlcIiwgXCJTYXRcIl07XG4gICAgdmFyIG1zVG9FdGFTdHJpbmcgPSBmdW5jdGlvbiAobXNwbHVzLCBwcmVmaXgpIHtcbiAgICAgICAgdmFyIG5vdyA9IG5ldyBEYXRlKCk7XG4gICAgICAgIHZhciBhcnJpdmFsID0gbmV3IERhdGUobm93LmdldFRpbWUoKSArIG1zcGx1cyk7XG4gICAgICAgIHZhciBwID0gcHJlZml4ICE9PSB1bmRlZmluZWQgPyBwcmVmaXggOiBcIkVUQSBcIjtcbiAgICAgICAgLy9XaGF0IGlzIHR0dD9cbiAgICAgICAgdmFyIHR0dCA9IHAgKyBhbXBtKGFycml2YWwuZ2V0SG91cnMoKSwgYXJyaXZhbC5nZXRNaW51dGVzKCkpO1xuICAgICAgICBpZiAoIU5lcHR1bmVzUHJpZGUuZ2FtZUNvbmZpZy50dXJuQmFzZWQpIHtcbiAgICAgICAgICAgIHR0dCA9IHAgKyBhbXBtKGFycml2YWwuZ2V0SG91cnMoKSwgYXJyaXZhbC5nZXRNaW51dGVzKCkpO1xuICAgICAgICAgICAgaWYgKGFycml2YWwuZ2V0RGF5KCkgIT0gbm93LmdldERheSgpKVxuICAgICAgICAgICAgICAgIC8vIEdlbmVyYXRlIHRpbWUgc3RyaW5nXG4gICAgICAgICAgICAgICAgdHR0ID0gXCJcIi5jb25jYXQocCkuY29uY2F0KGRheXNbYXJyaXZhbC5nZXREYXkoKV0sIFwiIEAgXCIpLmNvbmNhdChhbXBtKGFycml2YWwuZ2V0SG91cnMoKSwgYXJyaXZhbC5nZXRNaW51dGVzKCkpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHZhciB0b3RhbEVUQSA9IGFycml2YWwgLSBub3c7XG4gICAgICAgICAgICB0dHQgPSBwICsgQ3J1eC5mb3JtYXRUaW1lKHRvdGFsRVRBKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHR0O1xuICAgIH07XG4gICAgdmFyIHRpY2tUb0V0YVN0cmluZyA9IGZ1bmN0aW9uICh0aWNrLCBwcmVmaXgpIHtcbiAgICAgICAgdmFyIG1zcGx1cyA9IG1zVG9UaWNrKHRpY2spO1xuICAgICAgICByZXR1cm4gbXNUb0V0YVN0cmluZyhtc3BsdXMsIHByZWZpeCk7XG4gICAgfTtcbiAgICB2YXIgbXNUb0N5Y2xlU3RyaW5nID0gZnVuY3Rpb24gKG1zcGx1cywgcHJlZml4KSB7XG4gICAgICAgIHZhciBwID0gcHJlZml4ICE9PSB1bmRlZmluZWQgPyBwcmVmaXggOiBcIkVUQVwiO1xuICAgICAgICB2YXIgY3ljbGVMZW5ndGggPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlLmdhbGF4eS5wcm9kdWN0aW9uX3JhdGU7XG4gICAgICAgIHZhciB0aWNrTGVuZ3RoID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5nYWxheHkudGlja19yYXRlO1xuICAgICAgICB2YXIgdGlja3NUb0NvbXBsZXRlID0gTWF0aC5jZWlsKG1zcGx1cyAvIDYwMDAwIC8gdGlja0xlbmd0aCk7XG4gICAgICAgIC8vR2VuZXJhdGUgdGltZSB0ZXh0IHN0cmluZ1xuICAgICAgICB2YXIgdHR0ID0gXCJcIi5jb25jYXQocCkuY29uY2F0KHRpY2tzVG9Db21wbGV0ZSwgXCIgdGlja3MgLSBcIikuY29uY2F0KCh0aWNrc1RvQ29tcGxldGUgLyBjeWNsZUxlbmd0aCkudG9GaXhlZCgyKSwgXCJDXCIpO1xuICAgICAgICByZXR1cm4gdHR0O1xuICAgIH07XG4gICAgdmFyIGZsZWV0T3V0Y29tZXMgPSB7fTtcbiAgICB2YXIgY29tYmF0SGFuZGljYXAgPSAwO1xuICAgIHZhciBjb21iYXRPdXRjb21lcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIF9hO1xuICAgICAgICB2YXIgdW5pdmVyc2UgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlO1xuICAgICAgICB2YXIgcGxheWVycyA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2UuZ2FsYXh5LnBsYXllcnM7XG4gICAgICAgIHZhciBmbGVldHMgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlLmdhbGF4eS5mbGVldHM7XG4gICAgICAgIHZhciBzdGFycyA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2UuZ2FsYXh5LnN0YXJzO1xuICAgICAgICB2YXIgZmxpZ2h0cyA9IFtdO1xuICAgICAgICBmbGVldE91dGNvbWVzID0ge307XG4gICAgICAgIGZvciAodmFyIGYgaW4gZmxlZXRzKSB7XG4gICAgICAgICAgICB2YXIgZmxlZXQgPSBmbGVldHNbZl07XG4gICAgICAgICAgICBpZiAoZmxlZXQubyAmJiBmbGVldC5vLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICB2YXIgc3RvcF8xID0gZmxlZXQub1swXVsxXTtcbiAgICAgICAgICAgICAgICB2YXIgdGlja3MgPSBmbGVldC5ldGFGaXJzdDtcbiAgICAgICAgICAgICAgICB2YXIgc3Rhcm5hbWUgPSAoX2EgPSBzdGFyc1tzdG9wXzFdKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2EubjtcbiAgICAgICAgICAgICAgICBpZiAoIXN0YXJuYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmbGlnaHRzLnB1c2goW1xuICAgICAgICAgICAgICAgICAgICB0aWNrcyxcbiAgICAgICAgICAgICAgICAgICAgXCJbW3swfV1dIFtbezF9XV0gezJ9IOKGkiBbW3szfV1dIHs0fVwiLmZvcm1hdChmbGVldC5wdWlkLCBmbGVldC5uLCBmbGVldC5zdCwgc3Rhcm5hbWUsIHRpY2tUb0V0YVN0cmluZyh0aWNrcykpLFxuICAgICAgICAgICAgICAgICAgICBmbGVldCxcbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmbGlnaHRzID0gZmxpZ2h0cy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgICAgICByZXR1cm4gYVswXSAtIGJbMF07XG4gICAgICAgIH0pO1xuICAgICAgICB2YXIgYXJyaXZhbHMgPSB7fTtcbiAgICAgICAgdmFyIG91dHB1dCA9IFtdO1xuICAgICAgICB2YXIgYXJyaXZhbFRpbWVzID0gW107XG4gICAgICAgIHZhciBzdGFyc3RhdGUgPSB7fTtcbiAgICAgICAgZm9yICh2YXIgaSBpbiBmbGlnaHRzKSB7XG4gICAgICAgICAgICB2YXIgZmxlZXQgPSBmbGlnaHRzW2ldWzJdO1xuICAgICAgICAgICAgaWYgKGZsZWV0Lm9yYml0aW5nKSB7XG4gICAgICAgICAgICAgICAgdmFyIG9yYml0ID0gZmxlZXQub3JiaXRpbmcudWlkO1xuICAgICAgICAgICAgICAgIGlmICghc3RhcnN0YXRlW29yYml0XSkge1xuICAgICAgICAgICAgICAgICAgICBzdGFyc3RhdGVbb3JiaXRdID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFzdF91cGRhdGVkOiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2hpcHM6IHN0YXJzW29yYml0XS50b3RhbERlZmVuc2VzLFxuICAgICAgICAgICAgICAgICAgICAgICAgcHVpZDogc3RhcnNbb3JiaXRdLnB1aWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBjOiBzdGFyc1tvcmJpdF0uYyxcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gVGhpcyBmbGVldCBpcyBkZXBhcnRpbmcgdGhpcyB0aWNrOyByZW1vdmUgaXQgZnJvbSB0aGUgb3JpZ2luIHN0YXIncyB0b3RhbERlZmVuc2VzXG4gICAgICAgICAgICAgICAgc3RhcnN0YXRlW29yYml0XS5zaGlwcyAtPSBmbGVldC5zdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChhcnJpdmFsVGltZXMubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgYXJyaXZhbFRpbWVzW2Fycml2YWxUaW1lcy5sZW5ndGggLSAxXSAhPT0gZmxpZ2h0c1tpXVswXSkge1xuICAgICAgICAgICAgICAgIGFycml2YWxUaW1lcy5wdXNoKGZsaWdodHNbaV1bMF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGFycml2YWxLZXkgPSBbZmxpZ2h0c1tpXVswXSwgZmxlZXQub1swXVsxXV07XG4gICAgICAgICAgICBpZiAoYXJyaXZhbHNbYXJyaXZhbEtleV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGFycml2YWxzW2Fycml2YWxLZXldLnB1c2goZmxlZXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgYXJyaXZhbHNbYXJyaXZhbEtleV0gPSBbZmxlZXRdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZvciAodmFyIGsgaW4gYXJyaXZhbHMpIHtcbiAgICAgICAgICAgIHZhciBhcnJpdmFsID0gYXJyaXZhbHNba107XG4gICAgICAgICAgICB2YXIga2EgPSBrLnNwbGl0KFwiLFwiKTtcbiAgICAgICAgICAgIHZhciB0aWNrID0ga2FbMF07XG4gICAgICAgICAgICB2YXIgc3RhcklkID0ga2FbMV07XG4gICAgICAgICAgICBpZiAoIXN0YXJzdGF0ZVtzdGFySWRdKSB7XG4gICAgICAgICAgICAgICAgc3RhcnN0YXRlW3N0YXJJZF0gPSB7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RfdXBkYXRlZDogMCxcbiAgICAgICAgICAgICAgICAgICAgc2hpcHM6IHN0YXJzW3N0YXJJZF0udG90YWxEZWZlbnNlcyxcbiAgICAgICAgICAgICAgICAgICAgcHVpZDogc3RhcnNbc3RhcklkXS5wdWlkLFxuICAgICAgICAgICAgICAgICAgICBjOiBzdGFyc1tzdGFySWRdLmMsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzdGFyc3RhdGVbc3RhcklkXS5wdWlkID09IC0xKSB7XG4gICAgICAgICAgICAgICAgLy8gYXNzaWduIG93bmVyc2hpcCBvZiB0aGUgc3RhciB0byB0aGUgcGxheWVyIHdob3NlIGZsZWV0IGhhcyB0cmF2ZWxlZCB0aGUgbGVhc3QgZGlzdGFuY2VcbiAgICAgICAgICAgICAgICB2YXIgbWluRGlzdGFuY2UgPSAxMDAwMDtcbiAgICAgICAgICAgICAgICB2YXIgb3duZXIgPSAtMTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpIGluIGFycml2YWwpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZsZWV0ID0gYXJyaXZhbFtpXTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGQgPSB1bml2ZXJzZS5kaXN0YW5jZShzdGFyc1tzdGFySWRdLngsIHN0YXJzW3N0YXJJZF0ueSwgZmxlZXQubHgsIGZsZWV0Lmx5KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGQgPCBtaW5EaXN0YW5jZSB8fCBvd25lciA9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3duZXIgPSBmbGVldC5wdWlkO1xuICAgICAgICAgICAgICAgICAgICAgICAgbWluRGlzdGFuY2UgPSBkO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHN0YXJzdGF0ZVtzdGFySWRdLnB1aWQgPSBvd25lcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG91dHB1dC5wdXNoKFwiezB9OiBbW3sxfV1dIFtbezJ9XV0gezN9IHNoaXBzXCIuZm9ybWF0KHRpY2tUb0V0YVN0cmluZyh0aWNrLCBcIkBcIiksIHN0YXJzdGF0ZVtzdGFySWRdLnB1aWQsIHN0YXJzW3N0YXJJZF0ubiwgc3RhcnN0YXRlW3N0YXJJZF0uc2hpcHMpKTtcbiAgICAgICAgICAgIHZhciB0aWNrRGVsdGEgPSB0aWNrIC0gc3RhcnN0YXRlW3N0YXJJZF0ubGFzdF91cGRhdGVkIC0gMTtcbiAgICAgICAgICAgIGlmICh0aWNrRGVsdGEgPiAwKSB7XG4gICAgICAgICAgICAgICAgdmFyIG9sZFNoaXBzID0gc3RhcnN0YXRlW3N0YXJJZF0uc2hpcHM7XG4gICAgICAgICAgICAgICAgc3RhcnN0YXRlW3N0YXJJZF0ubGFzdF91cGRhdGVkID0gdGljayAtIDE7XG4gICAgICAgICAgICAgICAgaWYgKHN0YXJzW3N0YXJJZF0uc2hpcHNQZXJUaWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBvbGRjID0gc3RhcnN0YXRlW3N0YXJJZF0uYztcbiAgICAgICAgICAgICAgICAgICAgc3RhcnN0YXRlW3N0YXJJZF0uc2hpcHMgKz1cbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJzW3N0YXJJZF0uc2hpcHNQZXJUaWNrICogdGlja0RlbHRhICsgb2xkYztcbiAgICAgICAgICAgICAgICAgICAgc3RhcnN0YXRlW3N0YXJJZF0uYyA9XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFyc3RhdGVbc3RhcklkXS5zaGlwcyAtIE1hdGgudHJ1bmMoc3RhcnN0YXRlW3N0YXJJZF0uc2hpcHMpO1xuICAgICAgICAgICAgICAgICAgICBzdGFyc3RhdGVbc3RhcklkXS5zaGlwcyAtPSBzdGFyc3RhdGVbc3RhcklkXS5jO1xuICAgICAgICAgICAgICAgICAgICBvdXRwdXQucHVzaChcIuKAg+KAg3swfSt7M30gKyB7Mn0vaCA9IHsxfSt7NH1cIi5mb3JtYXQob2xkU2hpcHMsIHN0YXJzdGF0ZVtzdGFySWRdLnNoaXBzLCBzdGFyc1tzdGFySWRdLnNoaXBzUGVyVGljaywgb2xkYywgc3RhcnN0YXRlW3N0YXJJZF0uYykpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAodmFyIGkgaW4gYXJyaXZhbCkge1xuICAgICAgICAgICAgICAgIHZhciBmbGVldCA9IGFycml2YWxbaV07XG4gICAgICAgICAgICAgICAgaWYgKGZsZWV0LnB1aWQgPT0gc3RhcnN0YXRlW3N0YXJJZF0ucHVpZCB8fFxuICAgICAgICAgICAgICAgICAgICBzdGFyc3RhdGVbc3RhcklkXS5wdWlkID09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBvbGRTaGlwcyA9IHN0YXJzdGF0ZVtzdGFySWRdLnNoaXBzO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3RhcnN0YXRlW3N0YXJJZF0ucHVpZCA9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnN0YXRlW3N0YXJJZF0uc2hpcHMgPSBmbGVldC5zdDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJzdGF0ZVtzdGFySWRdLnNoaXBzICs9IGZsZWV0LnN0O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHZhciBsYW5kaW5nU3RyaW5nID0gXCLigIPigIN7MH0gKyB7Mn0gb24gW1t7M31dXSA9IHsxfVwiLmZvcm1hdChvbGRTaGlwcywgc3RhcnN0YXRlW3N0YXJJZF0uc2hpcHMsIGZsZWV0LnN0LCBmbGVldC5uKTtcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0LnB1c2gobGFuZGluZ1N0cmluZyk7XG4gICAgICAgICAgICAgICAgICAgIGxhbmRpbmdTdHJpbmcgPSBsYW5kaW5nU3RyaW5nLnN1YnN0cmluZygyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKHZhciBpIGluIGFycml2YWwpIHtcbiAgICAgICAgICAgICAgICB2YXIgZmxlZXQgPSBhcnJpdmFsW2ldO1xuICAgICAgICAgICAgICAgIGlmIChmbGVldC5wdWlkID09IHN0YXJzdGF0ZVtzdGFySWRdLnB1aWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG91dGNvbWVTdHJpbmcgPSBcInswfSBzaGlwcyBvbiB7MX1cIi5mb3JtYXQoTWF0aC5mbG9vcihzdGFyc3RhdGVbc3RhcklkXS5zaGlwcyksIHN0YXJzW3N0YXJJZF0ubik7XG4gICAgICAgICAgICAgICAgICAgIGZsZWV0T3V0Y29tZXNbZmxlZXQudWlkXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV0YTogdGlja1RvRXRhU3RyaW5nKGZsZWV0LmV0YUZpcnN0KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dGNvbWU6IG91dGNvbWVTdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGF3dCA9IDA7XG4gICAgICAgICAgICB2YXIgb2ZmZW5zZSA9IDA7XG4gICAgICAgICAgICB2YXIgY29udHJpYnV0aW9uID0ge307XG4gICAgICAgICAgICBmb3IgKHZhciBpIGluIGFycml2YWwpIHtcbiAgICAgICAgICAgICAgICB2YXIgZmxlZXQgPSBhcnJpdmFsW2ldO1xuICAgICAgICAgICAgICAgIGlmIChmbGVldC5wdWlkICE9IHN0YXJzdGF0ZVtzdGFySWRdLnB1aWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG9sZGEgPSBvZmZlbnNlO1xuICAgICAgICAgICAgICAgICAgICBvZmZlbnNlICs9IGZsZWV0LnN0O1xuICAgICAgICAgICAgICAgICAgICBvdXRwdXQucHVzaChcIuKAg+KAg1tbezR9XV0hIHswfSArIHsyfSBvbiBbW3szfV1dID0gezF9XCIuZm9ybWF0KG9sZGEsIG9mZmVuc2UsIGZsZWV0LnN0LCBmbGVldC5uLCBmbGVldC5wdWlkKSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRyaWJ1dGlvbltbZmxlZXQucHVpZCwgZmxlZXQudWlkXV0gPSBmbGVldC5zdDtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHd0ID0gcGxheWVyc1tmbGVldC5wdWlkXS50ZWNoLndlYXBvbnMubGV2ZWw7XG4gICAgICAgICAgICAgICAgICAgIGlmICh3dCA+IGF3dCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXd0ID0gd3Q7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgYXR0YWNrZXJzQWdncmVnYXRlID0gb2ZmZW5zZTtcbiAgICAgICAgICAgIHdoaWxlIChvZmZlbnNlID4gMCkge1xuICAgICAgICAgICAgICAgIHZhciBkd3QgPSBwbGF5ZXJzW3N0YXJzdGF0ZVtzdGFySWRdLnB1aWRdLnRlY2gud2VhcG9ucy5sZXZlbDtcbiAgICAgICAgICAgICAgICB2YXIgZGVmZW5zZSA9IHN0YXJzdGF0ZVtzdGFySWRdLnNoaXBzO1xuICAgICAgICAgICAgICAgIG91dHB1dC5wdXNoKFwi4oCD4oCDQ29tYmF0ISBbW3swfV1dIGRlZmVuZGluZ1wiLmZvcm1hdChzdGFyc3RhdGVbc3RhcklkXS5wdWlkKSk7XG4gICAgICAgICAgICAgICAgb3V0cHV0LnB1c2goXCLigIPigIPigIPigINEZWZlbmRlcnMgezB9IHNoaXBzLCBXUyB7MX1cIi5mb3JtYXQoZGVmZW5zZSwgZHd0KSk7XG4gICAgICAgICAgICAgICAgb3V0cHV0LnB1c2goXCLigIPigIPigIPigINBdHRhY2tlcnMgezB9IHNoaXBzLCBXUyB7MX1cIi5mb3JtYXQob2ZmZW5zZSwgYXd0KSk7XG4gICAgICAgICAgICAgICAgZHd0ICs9IDE7XG4gICAgICAgICAgICAgICAgaWYgKHN0YXJzdGF0ZVtzdGFySWRdLnB1aWQgIT09IHVuaXZlcnNlLmdhbGF4eS5wbGF5ZXJfdWlkKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb21iYXRIYW5kaWNhcCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGR3dCArPSBjb21iYXRIYW5kaWNhcDtcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dC5wdXNoKFwi4oCD4oCD4oCD4oCDRGVmZW5kZXJzIFdTezB9ID0gezF9XCIuZm9ybWF0KGhhbmRpY2FwU3RyaW5nKFwiXCIpLCBkd3QpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF3dCAtPSBjb21iYXRIYW5kaWNhcDtcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dC5wdXNoKFwi4oCD4oCD4oCD4oCDQXR0YWNrZXJzIFdTezB9ID0gezF9XCIuZm9ybWF0KGhhbmRpY2FwU3RyaW5nKFwiXCIpLCBhd3QpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbWJhdEhhbmRpY2FwID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXd0ICs9IGNvbWJhdEhhbmRpY2FwO1xuICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0LnB1c2goXCLigIPigIPigIPigINBdHRhY2tlcnMgV1N7MH0gPSB7MX1cIi5mb3JtYXQoaGFuZGljYXBTdHJpbmcoXCJcIiksIGF3dCkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZHd0IC09IGNvbWJhdEhhbmRpY2FwO1xuICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0LnB1c2goXCLigIPigIPigIPigINEZWZlbmRlcnMgV1N7MH0gPSB7MX1cIi5mb3JtYXQoaGFuZGljYXBTdHJpbmcoXCJcIiksIGR3dCkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh1bml2ZXJzZS5nYWxheHkucGxheWVyX3VpZCA9PT0gc3RhcnN0YXRlW3N0YXJJZF0ucHVpZCkge1xuICAgICAgICAgICAgICAgICAgICAvLyB0cnVuY2F0ZSBkZWZlbnNlIGlmIHdlJ3JlIGRlZmVuZGluZyB0byBnaXZlIHRoZSBtb3N0XG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnNlcnZhdGl2ZSBlc3RpbWF0ZVxuICAgICAgICAgICAgICAgICAgICBkZWZlbnNlID0gTWF0aC50cnVuYyhkZWZlbnNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgd2hpbGUgKGRlZmVuc2UgPiAwICYmIG9mZmVuc2UgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIG9mZmVuc2UgLT0gZHd0O1xuICAgICAgICAgICAgICAgICAgICBpZiAob2ZmZW5zZSA8PSAwKVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGRlZmVuc2UgLT0gYXd0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgbmV3QWdncmVnYXRlID0gMDtcbiAgICAgICAgICAgICAgICB2YXIgcGxheWVyQ29udHJpYnV0aW9uID0ge307XG4gICAgICAgICAgICAgICAgdmFyIGJpZ2dlc3RQbGF5ZXIgPSAtMTtcbiAgICAgICAgICAgICAgICB2YXIgYmlnZ2VzdFBsYXllcklkID0gc3RhcnN0YXRlW3N0YXJJZF0ucHVpZDtcbiAgICAgICAgICAgICAgICBpZiAob2ZmZW5zZSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0LnB1c2goXCLigIPigINBdHRhY2tlcnMgd2luIHdpdGggezB9IHNoaXBzIHJlbWFpbmluZ1wiLmZvcm1hdChvZmZlbnNlKSk7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGtfMSBpbiBjb250cmlidXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBrYV8xID0ga18xLnNwbGl0KFwiLFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmbGVldCA9IGZsZWV0c1trYV8xWzFdXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwbGF5ZXJJZCA9IGthXzFbMF07XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250cmlidXRpb25ba18xXSA9IChvZmZlbnNlICogY29udHJpYnV0aW9uW2tfMV0pIC8gYXR0YWNrZXJzQWdncmVnYXRlO1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV3QWdncmVnYXRlICs9IGNvbnRyaWJ1dGlvbltrXzFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBsYXllckNvbnRyaWJ1dGlvbltwbGF5ZXJJZF0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbGF5ZXJDb250cmlidXRpb25bcGxheWVySWRdICs9IGNvbnRyaWJ1dGlvbltrXzFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGxheWVyQ29udHJpYnV0aW9uW3BsYXllcklkXSA9IGNvbnRyaWJ1dGlvbltrXzFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBsYXllckNvbnRyaWJ1dGlvbltwbGF5ZXJJZF0gPiBiaWdnZXN0UGxheWVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmlnZ2VzdFBsYXllciA9IHBsYXllckNvbnRyaWJ1dGlvbltwbGF5ZXJJZF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmlnZ2VzdFBsYXllcklkID0gcGxheWVySWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXQucHVzaChcIuKAg+KAg+KAg+KAg1tbezB9XV0gaGFzIHsxfSBvbiBbW3syfV1dXCIuZm9ybWF0KGZsZWV0LnB1aWQsIGNvbnRyaWJ1dGlvbltrXzFdLCBmbGVldC5uKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgb3V0Y29tZVN0cmluZyA9IFwiV2lucyEgezB9IGxhbmQuXCIuZm9ybWF0KGNvbnRyaWJ1dGlvbltrXzFdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZsZWV0T3V0Y29tZXNbZmxlZXQudWlkXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBldGE6IHRpY2tUb0V0YVN0cmluZyhmbGVldC5ldGFGaXJzdCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0Y29tZTogb3V0Y29tZVN0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgb2ZmZW5zZSA9IG5ld0FnZ3JlZ2F0ZSAtIHBsYXllckNvbnRyaWJ1dGlvbltiaWdnZXN0UGxheWVySWRdO1xuICAgICAgICAgICAgICAgICAgICBzdGFyc3RhdGVbc3RhcklkXS5wdWlkID0gYmlnZ2VzdFBsYXllcklkO1xuICAgICAgICAgICAgICAgICAgICBzdGFyc3RhdGVbc3RhcklkXS5zaGlwcyA9IHBsYXllckNvbnRyaWJ1dGlvbltiaWdnZXN0UGxheWVySWRdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhcnN0YXRlW3N0YXJJZF0uc2hpcHMgPSBkZWZlbnNlO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpIGluIGFycml2YWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmbGVldCA9IGFycml2YWxbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmxlZXQucHVpZCA9PSBzdGFyc3RhdGVbc3RhcklkXS5wdWlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG91dGNvbWVTdHJpbmcgPSBcInswfSBzaGlwcyBvbiB7MX1cIi5mb3JtYXQoTWF0aC5mbG9vcihzdGFyc3RhdGVbc3RhcklkXS5zaGlwcyksIHN0YXJzW3N0YXJJZF0ubik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmxlZXRPdXRjb21lc1tmbGVldC51aWRdID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBldGE6IHRpY2tUb0V0YVN0cmluZyhmbGVldC5ldGFGaXJzdCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dGNvbWU6IG91dGNvbWVTdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBrXzIgaW4gY29udHJpYnV0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIga2FfMiA9IGtfMi5zcGxpdChcIixcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZmxlZXQgPSBmbGVldHNba2FfMlsxXV07XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgb3V0Y29tZVN0cmluZyA9IFwiTG9zZXMhIHswfSBsaXZlLlwiLmZvcm1hdChkZWZlbnNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZsZWV0T3V0Y29tZXNbZmxlZXQudWlkXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBldGE6IHRpY2tUb0V0YVN0cmluZyhmbGVldC5ldGFGaXJzdCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0Y29tZTogb3V0Y29tZVN0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYXR0YWNrZXJzQWdncmVnYXRlID0gb2ZmZW5zZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG91dHB1dC5wdXNoKFwi4oCD4oCDW1t7MH1dXSBbW3sxfV1dIHsyfSBzaGlwc1wiLmZvcm1hdChzdGFyc3RhdGVbc3RhcklkXS5wdWlkLCBzdGFyc1tzdGFySWRdLm4sIHN0YXJzdGF0ZVtzdGFySWRdLnNoaXBzKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICB9O1xuICAgIGZ1bmN0aW9uIGluY0NvbWJhdEhhbmRpY2FwKCkge1xuICAgICAgICBjb21iYXRIYW5kaWNhcCArPSAxO1xuICAgIH1cbiAgICBmdW5jdGlvbiBkZWNDb21iYXRIYW5kaWNhcCgpIHtcbiAgICAgICAgY29tYmF0SGFuZGljYXAgLT0gMTtcbiAgICB9XG4gICAgaG90a2V5KFwiLlwiLCBpbmNDb21iYXRIYW5kaWNhcCk7XG4gICAgaW5jQ29tYmF0SGFuZGljYXAuaGVscCA9XG4gICAgICAgIFwiQ2hhbmdlIGNvbWJhdCBjYWxjdWxhdGlvbiB0byBjcmVkaXQgeW91ciBlbmVtaWVzIHdpdGggKzEgd2VhcG9ucy4gVXNlZnVsIFwiICtcbiAgICAgICAgICAgIFwiaWYgeW91IHN1c3BlY3QgdGhleSB3aWxsIGhhdmUgYWNoaWV2ZWQgdGhlIG5leHQgbGV2ZWwgb2YgdGVjaCBiZWZvcmUgYSBiYXR0bGUgeW91IGFyZSBpbnZlc3RpZ2F0aW5nLlwiICtcbiAgICAgICAgICAgIFwiPHA+SW4gdGhlIGxvd2VyIGxlZnQgb2YgdGhlIEhVRCwgYW4gaW5kaWNhdG9yIHdpbGwgYXBwZWFyIHJlbWluZGluZyB5b3Ugb2YgdGhlIHdlYXBvbnMgYWRqdXN0bWVudC4gSWYgdGhlIFwiICtcbiAgICAgICAgICAgIFwiaW5kaWNhdG9yIGFscmVhZHkgc2hvd3MgYW4gYWR2YW50YWdlIGZvciBkZWZlbmRlcnMsIHRoaXMgaG90a2V5IHdpbGwgcmVkdWNlIHRoYXQgYWR2YW50YWdlIGZpcnN0IGJlZm9yZSBjcmVkaXRpbmcgXCIgK1xuICAgICAgICAgICAgXCJ3ZWFwb25zIHRvIHlvdXIgb3Bwb25lbnQuXCI7XG4gICAgaG90a2V5KFwiLFwiLCBkZWNDb21iYXRIYW5kaWNhcCk7XG4gICAgZGVjQ29tYmF0SGFuZGljYXAuaGVscCA9XG4gICAgICAgIFwiQ2hhbmdlIGNvbWJhdCBjYWxjdWxhdGlvbiB0byBjcmVkaXQgeW91cnNlbGYgd2l0aCArMSB3ZWFwb25zLiBVc2VmdWwgXCIgK1xuICAgICAgICAgICAgXCJ3aGVuIHlvdSB3aWxsIGhhdmUgYWNoaWV2ZWQgdGhlIG5leHQgbGV2ZWwgb2YgdGVjaCBiZWZvcmUgYSBiYXR0bGUgeW91IGFyZSBpbnZlc3RpZ2F0aW5nLlwiICtcbiAgICAgICAgICAgIFwiPHA+SW4gdGhlIGxvd2VyIGxlZnQgb2YgdGhlIEhVRCwgYW4gaW5kaWNhdG9yIHdpbGwgYXBwZWFyIHJlbWluZGluZyB5b3Ugb2YgdGhlIHdlYXBvbnMgYWRqdXN0bWVudC4gV2hlbiBcIiArXG4gICAgICAgICAgICBcImluZGljYXRvciBhbHJlYWR5IHNob3dzIGFuIGFkdmFudGFnZSBmb3IgYXR0YWNrZXJzLCB0aGlzIGhvdGtleSB3aWxsIHJlZHVjZSB0aGF0IGFkdmFudGFnZSBmaXJzdCBiZWZvcmUgY3JlZGl0aW5nIFwiICtcbiAgICAgICAgICAgIFwid2VhcG9ucyB0byB5b3UuXCI7XG4gICAgZnVuY3Rpb24gbG9uZ0ZsZWV0UmVwb3J0KCkge1xuICAgICAgICBjbGlwKGNvbWJhdE91dGNvbWVzKCkuam9pbihcIlxcblwiKSk7XG4gICAgfVxuICAgIGhvdGtleShcIiZcIiwgbG9uZ0ZsZWV0UmVwb3J0KTtcbiAgICBsb25nRmxlZXRSZXBvcnQuaGVscCA9XG4gICAgICAgIFwiR2VuZXJhdGUgYSBkZXRhaWxlZCBmbGVldCByZXBvcnQgb24gYWxsIGNhcnJpZXJzIGluIHlvdXIgc2Nhbm5pbmcgcmFuZ2UsIGFuZCBjb3B5IGl0IHRvIHRoZSBjbGlwYm9hcmQuXCIgK1xuICAgICAgICAgICAgXCI8cD5UaGlzIHNhbWUgcmVwb3J0IGNhbiBhbHNvIGJlIHZpZXdlZCB2aWEgdGhlIG1lbnU7IGVudGVyIHRoZSBhZ2VudCBhbmQgY2hvb3NlIGl0IGZyb20gdGhlIGRyb3Bkb3duLlwiO1xuICAgIGZ1bmN0aW9uIGJyaWVmRmxlZXRSZXBvcnQoKSB7XG4gICAgICAgIHZhciBfYTtcbiAgICAgICAgdmFyIGZsZWV0cyA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2UuZ2FsYXh5LmZsZWV0cztcbiAgICAgICAgdmFyIHN0YXJzID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5nYWxheHkuc3RhcnM7XG4gICAgICAgIHZhciBmbGlnaHRzID0gW107XG4gICAgICAgIGZvciAodmFyIGYgaW4gZmxlZXRzKSB7XG4gICAgICAgICAgICB2YXIgZmxlZXQgPSBmbGVldHNbZl07XG4gICAgICAgICAgICBpZiAoZmxlZXQubyAmJiBmbGVldC5vLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICB2YXIgc3RvcF8yID0gZmxlZXQub1swXVsxXTtcbiAgICAgICAgICAgICAgICB2YXIgdGlja3MgPSBmbGVldC5ldGFGaXJzdDtcbiAgICAgICAgICAgICAgICB2YXIgc3Rhcm5hbWUgPSAoX2EgPSBzdGFyc1tzdG9wXzJdKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2EubjtcbiAgICAgICAgICAgICAgICBpZiAoIXN0YXJuYW1lKVxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICBmbGlnaHRzLnB1c2goW1xuICAgICAgICAgICAgICAgICAgICB0aWNrcyxcbiAgICAgICAgICAgICAgICAgICAgXCJbW3swfV1dIFtbezF9XV0gezJ9IOKGkiBbW3szfV1dIHs0fVwiLmZvcm1hdChmbGVldC5wdWlkLCBmbGVldC5uLCBmbGVldC5zdCwgc3RhcnNbc3RvcF8yXS5uLCB0aWNrVG9FdGFTdHJpbmcodGlja3MsIFwiXCIpKSxcbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmbGlnaHRzID0gZmxpZ2h0cy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgICAgICByZXR1cm4gYVswXSAtIGJbMF07XG4gICAgICAgIH0pO1xuICAgICAgICBjbGlwKGZsaWdodHMubWFwKGZ1bmN0aW9uICh4KSB7IHJldHVybiB4WzFdOyB9KS5qb2luKFwiXFxuXCIpKTtcbiAgICB9XG4gICAgaG90a2V5KFwiXlwiLCBicmllZkZsZWV0UmVwb3J0KTtcbiAgICBicmllZkZsZWV0UmVwb3J0LmhlbHAgPVxuICAgICAgICBcIkdlbmVyYXRlIGEgc3VtbWFyeSBmbGVldCByZXBvcnQgb24gYWxsIGNhcnJpZXJzIGluIHlvdXIgc2Nhbm5pbmcgcmFuZ2UsIGFuZCBjb3B5IGl0IHRvIHRoZSBjbGlwYm9hcmQuXCIgK1xuICAgICAgICAgICAgXCI8cD5UaGlzIHNhbWUgcmVwb3J0IGNhbiBhbHNvIGJlIHZpZXdlZCB2aWEgdGhlIG1lbnU7IGVudGVyIHRoZSBhZ2VudCBhbmQgY2hvb3NlIGl0IGZyb20gdGhlIGRyb3Bkb3duLlwiO1xuICAgIGZ1bmN0aW9uIHNjcmVlbnNob3QoKSB7XG4gICAgICAgIHZhciBtYXAgPSBOZXB0dW5lc1ByaWRlLm5wdWkubWFwO1xuICAgICAgICBjbGlwKG1hcC5jYW52YXNbMF0udG9EYXRhVVJMKFwiaW1hZ2Uvd2VicFwiLCAwLjA1KSk7XG4gICAgfVxuICAgIGhvdGtleShcIiNcIiwgc2NyZWVuc2hvdCk7XG4gICAgc2NyZWVuc2hvdC5oZWxwID1cbiAgICAgICAgXCJDcmVhdGUgYSBkYXRhOiBVUkwgb2YgdGhlIGN1cnJlbnQgbWFwLiBQYXN0ZSBpdCBpbnRvIGEgYnJvd3NlciB3aW5kb3cgdG8gdmlldy4gVGhpcyBpcyBsaWtlbHkgdG8gYmUgcmVtb3ZlZC5cIjtcbiAgICB2YXIgaG9tZVBsYW5ldHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBwID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5nYWxheHkucGxheWVycztcbiAgICAgICAgdmFyIG91dHB1dCA9IFtdO1xuICAgICAgICBmb3IgKHZhciBpIGluIHApIHtcbiAgICAgICAgICAgIHZhciBob21lID0gcFtpXS5ob21lO1xuICAgICAgICAgICAgaWYgKGhvbWUpIHtcbiAgICAgICAgICAgICAgICBvdXRwdXQucHVzaChcIlBsYXllciAjezB9IGlzIFtbezB9XV0gaG9tZSB7Mn0gW1t7MX1dXVwiLmZvcm1hdChpLCBob21lLm4sIGkgPT0gaG9tZS5wdWlkID8gXCJpc1wiIDogXCJ3YXNcIikpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgb3V0cHV0LnB1c2goXCJQbGF5ZXIgI3swfSBpcyBbW3swfV1dIGhvbWUgdW5rbm93blwiLmZvcm1hdChpKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2xpcChvdXRwdXQuam9pbihcIlxcblwiKSk7XG4gICAgfTtcbiAgICBob3RrZXkoXCIhXCIsIGhvbWVQbGFuZXRzKTtcbiAgICBob21lUGxhbmV0cy5oZWxwID1cbiAgICAgICAgXCJHZW5lcmF0ZSBhIHBsYXllciBzdW1tYXJ5IHJlcG9ydCBhbmQgY29weSBpdCB0byB0aGUgY2xpcGJvYXJkLlwiICtcbiAgICAgICAgICAgIFwiPHA+VGhpcyBzYW1lIHJlcG9ydCBjYW4gYWxzbyBiZSB2aWV3ZWQgdmlhIHRoZSBtZW51OyBlbnRlciB0aGUgYWdlbnQgYW5kIGNob29zZSBpdCBmcm9tIHRoZSBkcm9wZG93bi4gXCIgK1xuICAgICAgICAgICAgXCJJdCBpcyBtb3N0IHVzZWZ1bCBmb3IgZGlzY292ZXJpbmcgcGxheWVyIG51bWJlcnMgc28gdGhhdCB5b3UgY2FuIHdyaXRlIFtbI11dIHRvIHJlZmVyZW5jZSBhIHBsYXllciBpbiBtYWlsLlwiO1xuICAgIHZhciBwbGF5ZXJTaGVldCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHAgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlLmdhbGF4eS5wbGF5ZXJzO1xuICAgICAgICB2YXIgb3V0cHV0ID0gW107XG4gICAgICAgIHZhciBmaWVsZHMgPSBbXG4gICAgICAgICAgICBcImFsaWFzXCIsXG4gICAgICAgICAgICBcInRvdGFsX3N0YXJzXCIsXG4gICAgICAgICAgICBcInNoaXBzUGVyVGlja1wiLFxuICAgICAgICAgICAgXCJ0b3RhbF9zdHJlbmd0aFwiLFxuICAgICAgICAgICAgXCJ0b3RhbF9lY29ub215XCIsXG4gICAgICAgICAgICBcInRvdGFsX2ZsZWV0c1wiLFxuICAgICAgICAgICAgXCJ0b3RhbF9pbmR1c3RyeVwiLFxuICAgICAgICAgICAgXCJ0b3RhbF9zY2llbmNlXCIsXG4gICAgICAgIF07XG4gICAgICAgIG91dHB1dC5wdXNoKGZpZWxkcy5qb2luKFwiLFwiKSk7XG4gICAgICAgIHZhciBfbG9vcF8zID0gZnVuY3Rpb24gKGkpIHtcbiAgICAgICAgICAgIHBsYXllciA9IF9fYXNzaWduKHt9LCBwW2ldKTtcbiAgICAgICAgICAgIHZhciByZWNvcmQgPSBmaWVsZHMubWFwKGZ1bmN0aW9uIChmKSB7IHJldHVybiBwW2ldW2ZdOyB9KTtcbiAgICAgICAgICAgIG91dHB1dC5wdXNoKHJlY29yZC5qb2luKFwiLFwiKSk7XG4gICAgICAgIH07XG4gICAgICAgIGZvciAodmFyIGkgaW4gcCkge1xuICAgICAgICAgICAgX2xvb3BfMyhpKTtcbiAgICAgICAgfVxuICAgICAgICBjbGlwKG91dHB1dC5qb2luKFwiXFxuXCIpKTtcbiAgICB9O1xuICAgIGhvdGtleShcIiRcIiwgcGxheWVyU2hlZXQpO1xuICAgIHBsYXllclNoZWV0LmhlbHAgPVxuICAgICAgICBcIkdlbmVyYXRlIGEgcGxheWVyIHN1bW1hcnkgbWVhbiB0byBiZSBtYWRlIGludG8gYSBzcHJlYWRzaGVldC5cIiArXG4gICAgICAgICAgICBcIjxwPlRoZSBjbGlwYm9hcmQgc2hvdWxkIGJlIHBhc3RlZCBpbnRvIGEgQ1NWIGFuZCB0aGVuIGltcG9ydGVkLlwiO1xuICAgIHZhciBkcmF3T3ZlcmxheVN0cmluZyA9IGZ1bmN0aW9uIChjb250ZXh0LCBzLCB4LCB5LCBmZ0NvbG9yKSB7XG4gICAgICAgIGNvbnRleHQuZmlsbFN0eWxlID0gXCIjMDAwMDAwXCI7XG4gICAgICAgIGZvciAodmFyIHNtZWFyID0gMTsgc21lYXIgPCA0OyArK3NtZWFyKSB7XG4gICAgICAgICAgICBjb250ZXh0LmZpbGxUZXh0KHMsIHggKyBzbWVhciwgeSArIHNtZWFyKTtcbiAgICAgICAgICAgIGNvbnRleHQuZmlsbFRleHQocywgeCAtIHNtZWFyLCB5ICsgc21lYXIpO1xuICAgICAgICAgICAgY29udGV4dC5maWxsVGV4dChzLCB4IC0gc21lYXIsIHkgLSBzbWVhcik7XG4gICAgICAgICAgICBjb250ZXh0LmZpbGxUZXh0KHMsIHggKyBzbWVhciwgeSAtIHNtZWFyKTtcbiAgICAgICAgfVxuICAgICAgICBjb250ZXh0LmZpbGxTdHlsZSA9IGZnQ29sb3IgfHwgXCIjMDBmZjAwXCI7XG4gICAgICAgIGNvbnRleHQuZmlsbFRleHQocywgeCwgeSk7XG4gICAgfTtcbiAgICB2YXIgYW55U3RhckNhblNlZSA9IGZ1bmN0aW9uIChvd25lciwgZmxlZXQpIHtcbiAgICAgICAgdmFyIHN0YXJzID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5nYWxheHkuc3RhcnM7XG4gICAgICAgIHZhciB1bml2ZXJzZSA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2U7XG4gICAgICAgIHZhciBzY2FuUmFuZ2UgPSB1bml2ZXJzZS5nYWxheHkucGxheWVyc1tvd25lcl0udGVjaC5zY2FubmluZy52YWx1ZTtcbiAgICAgICAgZm9yICh2YXIgcyBpbiBzdGFycykge1xuICAgICAgICAgICAgdmFyIHN0YXIgPSBzdGFyc1tzXTtcbiAgICAgICAgICAgIGlmIChzdGFyLnB1aWQgPT0gb3duZXIpIHtcbiAgICAgICAgICAgICAgICB2YXIgZGlzdGFuY2UgPSB1bml2ZXJzZS5kaXN0YW5jZShzdGFyLngsIHN0YXIueSwgZmxlZXQueCwgZmxlZXQueSk7XG4gICAgICAgICAgICAgICAgaWYgKGRpc3RhbmNlIDw9IHNjYW5SYW5nZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG4gICAgdmFyIGhvb2tzTG9hZGVkID0gZmFsc2U7XG4gICAgdmFyIGhhbmRpY2FwU3RyaW5nID0gZnVuY3Rpb24gKHByZWZpeCkge1xuICAgICAgICB2YXIgcCA9IHByZWZpeCAhPT0gdW5kZWZpbmVkID8gcHJlZml4IDogY29tYmF0SGFuZGljYXAgPiAwID8gXCJFbmVteSBXU1wiIDogXCJNeSBXU1wiO1xuICAgICAgICByZXR1cm4gcCArIChjb21iYXRIYW5kaWNhcCA+IDAgPyBcIitcIiA6IFwiXCIpICsgY29tYmF0SGFuZGljYXA7XG4gICAgfTtcbiAgICB2YXIgbG9hZEhvb2tzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgc3VwZXJEcmF3VGV4dCA9IE5lcHR1bmVzUHJpZGUubnB1aS5tYXAuZHJhd1RleHQ7XG4gICAgICAgIE5lcHR1bmVzUHJpZGUubnB1aS5tYXAuZHJhd1RleHQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdW5pdmVyc2UgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlO1xuICAgICAgICAgICAgdmFyIG1hcCA9IE5lcHR1bmVzUHJpZGUubnB1aS5tYXA7XG4gICAgICAgICAgICBzdXBlckRyYXdUZXh0KCk7XG4gICAgICAgICAgICBtYXAuY29udGV4dC5mb250ID0gXCJcIi5jb25jYXQoMTQgKiBtYXAucGl4ZWxSYXRpbywgXCJweCBPcGVuU2Fuc1JlZ3VsYXIsIHNhbnMtc2VyaWZcIik7XG4gICAgICAgICAgICBtYXAuY29udGV4dC5maWxsU3R5bGUgPSBcIiNGRjAwMDBcIjtcbiAgICAgICAgICAgIG1hcC5jb250ZXh0LnRleHRBbGlnbiA9IFwicmlnaHRcIjtcbiAgICAgICAgICAgIG1hcC5jb250ZXh0LnRleHRCYXNlbGluZSA9IFwibWlkZGxlXCI7XG4gICAgICAgICAgICB2YXIgdiA9IHZlcnNpb247XG4gICAgICAgICAgICBpZiAoY29tYmF0SGFuZGljYXAgIT09IDApIHtcbiAgICAgICAgICAgICAgICB2ID0gXCJcIi5jb25jYXQoaGFuZGljYXBTdHJpbmcoKSwgXCIgXCIpLmNvbmNhdCh2KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRyYXdPdmVybGF5U3RyaW5nKG1hcC5jb250ZXh0LCB2LCBtYXAudmlld3BvcnRXaWR0aCAtIDEwLCBtYXAudmlld3BvcnRIZWlnaHQgLSAxNiAqIG1hcC5waXhlbFJhdGlvKTtcbiAgICAgICAgICAgIGlmIChOZXB0dW5lc1ByaWRlLm9yaWdpbmFsUGxheWVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBOZXB0dW5lc1ByaWRlLm9yaWdpbmFsUGxheWVyID0gdW5pdmVyc2UucGxheWVyLnVpZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChOZXB0dW5lc1ByaWRlLm9yaWdpbmFsUGxheWVyICE9PSB1bml2ZXJzZS5wbGF5ZXIudWlkKSB7XG4gICAgICAgICAgICAgICAgdmFyIG4gPSB1bml2ZXJzZS5nYWxheHkucGxheWVyc1t1bml2ZXJzZS5wbGF5ZXIudWlkXS5hbGlhcztcbiAgICAgICAgICAgICAgICBkcmF3T3ZlcmxheVN0cmluZyhtYXAuY29udGV4dCwgbiwgbWFwLnZpZXdwb3J0V2lkdGggLSAxMDAsIG1hcC52aWV3cG9ydEhlaWdodCAtIDIgKiAxNiAqIG1hcC5waXhlbFJhdGlvKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh1bml2ZXJzZS5zZWxlY3RlZEZsZWV0ICYmIHVuaXZlcnNlLnNlbGVjdGVkRmxlZXQucGF0aC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhcIlNlbGVjdGVkIGZsZWV0XCIsIHVuaXZlcnNlLnNlbGVjdGVkRmxlZXQpO1xuICAgICAgICAgICAgICAgIG1hcC5jb250ZXh0LmZvbnQgPSBcIlwiLmNvbmNhdCgxNCAqIG1hcC5waXhlbFJhdGlvLCBcInB4IE9wZW5TYW5zUmVndWxhciwgc2Fucy1zZXJpZlwiKTtcbiAgICAgICAgICAgICAgICBtYXAuY29udGV4dC5maWxsU3R5bGUgPSBcIiNGRjAwMDBcIjtcbiAgICAgICAgICAgICAgICBtYXAuY29udGV4dC50ZXh0QWxpZ24gPSBcImxlZnRcIjtcbiAgICAgICAgICAgICAgICBtYXAuY29udGV4dC50ZXh0QmFzZWxpbmUgPSBcIm1pZGRsZVwiO1xuICAgICAgICAgICAgICAgIHZhciBkeSA9IHVuaXZlcnNlLnNlbGVjdGVkRmxlZXQueSAtIHVuaXZlcnNlLnNlbGVjdGVkRmxlZXQubHk7XG4gICAgICAgICAgICAgICAgdmFyIGR4ID0gdW5pdmVyc2Uuc2VsZWN0ZWRGbGVldC54IC0gdW5pdmVyc2Uuc2VsZWN0ZWRGbGVldC5seDtcbiAgICAgICAgICAgICAgICBkeSA9IHVuaXZlcnNlLnNlbGVjdGVkRmxlZXQucGF0aFswXS55IC0gdW5pdmVyc2Uuc2VsZWN0ZWRGbGVldC55O1xuICAgICAgICAgICAgICAgIGR4ID0gdW5pdmVyc2Uuc2VsZWN0ZWRGbGVldC5wYXRoWzBdLnggLSB1bml2ZXJzZS5zZWxlY3RlZEZsZWV0Lng7XG4gICAgICAgICAgICAgICAgdmFyIGxpbmVIZWlnaHQgPSAxNiAqIG1hcC5waXhlbFJhdGlvO1xuICAgICAgICAgICAgICAgIHZhciByYWRpdXMgPSAyICogMC4wMjggKiBtYXAuc2NhbGUgKiBtYXAucGl4ZWxSYXRpbztcbiAgICAgICAgICAgICAgICB2YXIgYW5nbGUgPSBNYXRoLmF0YW4oZHkgLyBkeCk7XG4gICAgICAgICAgICAgICAgdmFyIG9mZnNldHggPSByYWRpdXMgKiBNYXRoLmNvcyhhbmdsZSk7XG4gICAgICAgICAgICAgICAgdmFyIG9mZnNldHkgPSByYWRpdXMgKiBNYXRoLnNpbihhbmdsZSk7XG4gICAgICAgICAgICAgICAgaWYgKG9mZnNldHggPiAwICYmIGR4ID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBvZmZzZXR4ICo9IC0xO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAob2Zmc2V0eSA+IDAgJiYgZHkgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIG9mZnNldHkgKj0gLTE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChvZmZzZXR4IDwgMCAmJiBkeCA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0eCAqPSAtMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG9mZnNldHkgPCAwICYmIGR5IDwgMCkge1xuICAgICAgICAgICAgICAgICAgICBvZmZzZXR5ICo9IC0xO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb21iYXRPdXRjb21lcygpO1xuICAgICAgICAgICAgICAgIHZhciBzID0gZmxlZXRPdXRjb21lc1t1bml2ZXJzZS5zZWxlY3RlZEZsZWV0LnVpZF0uZXRhO1xuICAgICAgICAgICAgICAgIHZhciBvID0gZmxlZXRPdXRjb21lc1t1bml2ZXJzZS5zZWxlY3RlZEZsZWV0LnVpZF0ub3V0Y29tZTtcbiAgICAgICAgICAgICAgICB2YXIgeCA9IG1hcC53b3JsZFRvU2NyZWVuWCh1bml2ZXJzZS5zZWxlY3RlZEZsZWV0LngpICsgb2Zmc2V0eDtcbiAgICAgICAgICAgICAgICB2YXIgeSA9IG1hcC53b3JsZFRvU2NyZWVuWSh1bml2ZXJzZS5zZWxlY3RlZEZsZWV0LnkpICsgb2Zmc2V0eTtcbiAgICAgICAgICAgICAgICBpZiAob2Zmc2V0eCA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgbWFwLmNvbnRleHQudGV4dEFsaWduID0gXCJyaWdodFwiO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBkcmF3T3ZlcmxheVN0cmluZyhtYXAuY29udGV4dCwgcywgeCwgeSk7XG4gICAgICAgICAgICAgICAgZHJhd092ZXJsYXlTdHJpbmcobWFwLmNvbnRleHQsIG8sIHgsIHkgKyBsaW5lSGVpZ2h0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghTmVwdHVuZXNQcmlkZS5nYW1lQ29uZmlnLnR1cm5CYXNlZCAmJlxuICAgICAgICAgICAgICAgIHVuaXZlcnNlLnRpbWVUb1RpY2soMSkubGVuZ3RoIDwgMykge1xuICAgICAgICAgICAgICAgIHZhciBsaW5lSGVpZ2h0ID0gMTYgKiBtYXAucGl4ZWxSYXRpbztcbiAgICAgICAgICAgICAgICBtYXAuY29udGV4dC5mb250ID0gXCJcIi5jb25jYXQoMTQgKiBtYXAucGl4ZWxSYXRpbywgXCJweCBPcGVuU2Fuc1JlZ3VsYXIsIHNhbnMtc2VyaWZcIik7XG4gICAgICAgICAgICAgICAgbWFwLmNvbnRleHQuZmlsbFN0eWxlID0gXCIjRkYwMDAwXCI7XG4gICAgICAgICAgICAgICAgbWFwLmNvbnRleHQudGV4dEFsaWduID0gXCJsZWZ0XCI7XG4gICAgICAgICAgICAgICAgbWFwLmNvbnRleHQudGV4dEJhc2VsaW5lID0gXCJtaWRkbGVcIjtcbiAgICAgICAgICAgICAgICB2YXIgcyA9IFwiVGljayA8IDEwcyBhd2F5IVwiO1xuICAgICAgICAgICAgICAgIGlmICh1bml2ZXJzZS50aW1lVG9UaWNrKDEpID09PSBcIjBzXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgcyA9IFwiVGljayBwYXNzZWQuIENsaWNrIHByb2R1Y3Rpb24gY291bnRkb3duIHRvIHJlZnJlc2guXCI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGRyYXdPdmVybGF5U3RyaW5nKG1hcC5jb250ZXh0LCBzLCAxMDAwLCBsaW5lSGVpZ2h0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh1bml2ZXJzZS5zZWxlY3RlZFN0YXIgJiZcbiAgICAgICAgICAgICAgICB1bml2ZXJzZS5zZWxlY3RlZFN0YXIucHVpZCAhPSB1bml2ZXJzZS5wbGF5ZXIudWlkICYmXG4gICAgICAgICAgICAgICAgdW5pdmVyc2Uuc2VsZWN0ZWRTdGFyLnB1aWQgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgLy8gZW5lbXkgc3RhciBzZWxlY3RlZDsgc2hvdyBIVUQgZm9yIHNjYW5uaW5nIHZpc2liaWxpdHlcbiAgICAgICAgICAgICAgICBtYXAuY29udGV4dC50ZXh0QWxpZ24gPSBcImxlZnRcIjtcbiAgICAgICAgICAgICAgICBtYXAuY29udGV4dC50ZXh0QmFzZWxpbmUgPSBcIm1pZGRsZVwiO1xuICAgICAgICAgICAgICAgIHZhciB4T2Zmc2V0ID0gMjYgKiBtYXAucGl4ZWxSYXRpbztcbiAgICAgICAgICAgICAgICAvL21hcC5jb250ZXh0LnRyYW5zbGF0ZSh4T2Zmc2V0LCAwKTtcbiAgICAgICAgICAgICAgICB2YXIgZmxlZXRzID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5nYWxheHkuZmxlZXRzO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGYgaW4gZmxlZXRzKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBmbGVldCA9IGZsZWV0c1tmXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZsZWV0LnB1aWQgPT09IHVuaXZlcnNlLnBsYXllci51aWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkeCA9IHVuaXZlcnNlLnNlbGVjdGVkU3Rhci54IC0gZmxlZXQueDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkeSA9IHVuaXZlcnNlLnNlbGVjdGVkU3Rhci55IC0gZmxlZXQueTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkaXN0YW5jZSA9IE1hdGguc3FydChkeCAqIGR4ICsgZHkgKiBkeSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgb2Zmc2V0eCA9IHhPZmZzZXQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgb2Zmc2V0eSA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgeCA9IG1hcC53b3JsZFRvU2NyZWVuWChmbGVldC54KSArIG9mZnNldHg7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgeSA9IG1hcC53b3JsZFRvU2NyZWVuWShmbGVldC55KSArIG9mZnNldHk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGlzdGFuY2UgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVuaXZlcnNlLmdhbGF4eS5wbGF5ZXJzW3VuaXZlcnNlLnNlbGVjdGVkU3Rhci5wdWlkXS50ZWNoLnNjYW5uaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmbGVldC5wYXRoICYmIGZsZWV0LnBhdGgubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkeCA9IGZsZWV0LnBhdGhbMF0ueCAtIHVuaXZlcnNlLnNlbGVjdGVkU3Rhci54O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkeSA9IGZsZWV0LnBhdGhbMF0ueSAtIHVuaXZlcnNlLnNlbGVjdGVkU3Rhci55O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXN0YW5jZSA9IE1hdGguc3FydChkeCAqIGR4ICsgZHkgKiBkeSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkaXN0YW5jZSA8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bml2ZXJzZS5nYWxheHkucGxheWVyc1t1bml2ZXJzZS5zZWxlY3RlZFN0YXIucHVpZF0udGVjaFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zY2FubmluZy52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHN0ZXBSYWRpdXMgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlLmdhbGF4eS5mbGVldF9zcGVlZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmbGVldC53YXJwU3BlZWQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RlcFJhZGl1cyAqPSAzO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZHggPSBmbGVldC54IC0gZmxlZXQucGF0aFswXS54O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZHkgPSBmbGVldC55IC0gZmxlZXQucGF0aFswXS55O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGFuZ2xlID0gTWF0aC5hdGFuKGR5IC8gZHgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHN0ZXB4ID0gc3RlcFJhZGl1cyAqIE1hdGguY29zKGFuZ2xlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzdGVweSA9IHN0ZXBSYWRpdXMgKiBNYXRoLnNpbihhbmdsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3RlcHggPiAwICYmIGR4ID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ZXB4ICo9IC0xO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN0ZXB5ID4gMCAmJiBkeSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGVweSAqPSAtMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdGVweCA8IDAgJiYgZHggPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RlcHggKj0gLTE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3RlcHkgPCAwICYmIGR5IDwgMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ZXB5ICo9IC0xO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRpY2tzID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgeF8xID0gdGlja3MgKiBzdGVweCArIE51bWJlcihmbGVldC54KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgeV8xID0gdGlja3MgKiBzdGVweSArIE51bWJlcihmbGVldC55KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2xldCBzeCA9IG1hcC53b3JsZFRvU2NyZWVuWCh4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2xldCBzeSA9IG1hcC53b3JsZFRvU2NyZWVuWSh5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkeCA9IHhfMSAtIHVuaXZlcnNlLnNlbGVjdGVkU3Rhci54O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGR5ID0geV8xIC0gdW5pdmVyc2Uuc2VsZWN0ZWRTdGFyLnk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzdGFuY2UgPSBNYXRoLnNxcnQoZHggKiBkeCArIGR5ICogZHkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coZGlzdGFuY2UsIHgsIHkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vZHJhd092ZXJsYXlTdHJpbmcobWFwLmNvbnRleHQsIFwib1wiLCBzeCwgc3kpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpY2tzICs9IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IHdoaWxlIChkaXN0YW5jZSA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5pdmVyc2UuZ2FsYXh5LnBsYXllcnNbdW5pdmVyc2Uuc2VsZWN0ZWRTdGFyLnB1aWRdLnRlY2hcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnNjYW5uaW5nLnZhbHVlICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGlja3MgPD0gZmxlZXQuZXRhRmlyc3QgKyAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpY2tzIC09IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdmlzQ29sb3IgPSBcIiMwMGZmMDBcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhbnlTdGFyQ2FuU2VlKHVuaXZlcnNlLnNlbGVjdGVkU3Rhci5wdWlkLCBmbGVldCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aXNDb2xvciA9IFwiIzg4ODg4OFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZHJhd092ZXJsYXlTdHJpbmcobWFwLmNvbnRleHQsIFwiU2NhbiBcIi5jb25jYXQodGlja1RvRXRhU3RyaW5nKHRpY2tzKSksIHgsIHksIHZpc0NvbG9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvL21hcC5jb250ZXh0LnRyYW5zbGF0ZSgteE9mZnNldCwgMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodW5pdmVyc2UucnVsZXIuc3RhcnMubGVuZ3RoID09IDIpIHtcbiAgICAgICAgICAgICAgICB2YXIgcDEgPSB1bml2ZXJzZS5ydWxlci5zdGFyc1swXS5wdWlkO1xuICAgICAgICAgICAgICAgIHZhciBwMiA9IHVuaXZlcnNlLnJ1bGVyLnN0YXJzWzFdLnB1aWQ7XG4gICAgICAgICAgICAgICAgaWYgKHAxICE9PSBwMiAmJiBwMSAhPT0gLTEgJiYgcDIgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coXCJ0d28gc3RhciBydWxlclwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIC8vVE9ETzogTGVhcm4gbW9yZSBhYm91dCB0aGlzIGhvb2suIGl0cyBydW4gdG9vIG11Y2guLlxuICAgICAgICBDcnV4LmZvcm1hdCA9IGZ1bmN0aW9uIChzLCB0ZW1wbGF0ZURhdGEpIHtcbiAgICAgICAgICAgIGlmICghcykge1xuICAgICAgICAgICAgICAgIHJldHVybiBcImVycm9yXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgaTtcbiAgICAgICAgICAgIHZhciBmcDtcbiAgICAgICAgICAgIHZhciBzcDtcbiAgICAgICAgICAgIHZhciBzdWI7XG4gICAgICAgICAgICB2YXIgcGF0dGVybjtcbiAgICAgICAgICAgIGkgPSAwO1xuICAgICAgICAgICAgZnAgPSAwO1xuICAgICAgICAgICAgc3AgPSAwO1xuICAgICAgICAgICAgc3ViID0gXCJcIjtcbiAgICAgICAgICAgIHBhdHRlcm4gPSBcIlwiO1xuICAgICAgICAgICAgLy8gbG9vayBmb3Igc3RhbmRhcmQgcGF0dGVybnNcbiAgICAgICAgICAgIHdoaWxlIChmcCA+PSAwICYmIGkgPCAxMDAwKSB7XG4gICAgICAgICAgICAgICAgaSA9IGkgKyAxO1xuICAgICAgICAgICAgICAgIGZwID0gcy5zZWFyY2goXCJcXFxcW1xcXFxbXCIpO1xuICAgICAgICAgICAgICAgIHNwID0gcy5zZWFyY2goXCJcXFxcXVxcXFxdXCIpO1xuICAgICAgICAgICAgICAgIHN1YiA9IHMuc2xpY2UoZnAgKyAyLCBzcCk7XG4gICAgICAgICAgICAgICAgdmFyIHVyaSA9IHN1Yi5yZXBsYWNlQWxsKFwiJiN4MkY7XCIsIFwiL1wiKTtcbiAgICAgICAgICAgICAgICBwYXR0ZXJuID0gXCJbW1wiLmNvbmNhdChzdWIsIFwiXV1cIik7XG4gICAgICAgICAgICAgICAgaWYgKHRlbXBsYXRlRGF0YVtzdWJdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcyA9IHMucmVwbGFjZShwYXR0ZXJuLCB0ZW1wbGF0ZURhdGFbc3ViXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKC9eYXBpOlxcd3s2fSQvLnRlc3Qoc3ViKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgYXBpTGluayA9IFwiPGEgb25DbGljaz0nQ3J1eC5jcnV4LnRyaWdnZXIoXFxcInN3aXRjaF91c2VyX2FwaVxcXCIsIFxcXCJcIi5jb25jYXQoc3ViLCBcIlxcXCIpJz4gVmlldyBhcyBcIikuY29uY2F0KHN1YiwgXCI8L2E+XCIpO1xuICAgICAgICAgICAgICAgICAgICBhcGlMaW5rICs9IFwiIG9yIDxhIG9uQ2xpY2s9J0NydXguY3J1eC50cmlnZ2VyKFxcXCJtZXJnZV91c2VyX2FwaVxcXCIsIFxcXCJcIi5jb25jYXQoc3ViLCBcIlxcXCIpJz4gTWVyZ2UgXCIpLmNvbmNhdChzdWIsIFwiPC9hPlwiKTtcbiAgICAgICAgICAgICAgICAgICAgcyA9IHMucmVwbGFjZShwYXR0ZXJuLCBhcGlMaW5rKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoaXNfdmFsaWRfaW1hZ2VfdXJsKHVyaSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcyA9IHMucmVwbGFjZShwYXR0ZXJuLCBcIjxpbWcgd2lkdGg9XFxcIjEwMCVcXFwiIHNyYz0nXCIuY29uY2F0KHVyaSwgXCInIC8+XCIpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoaXNfdmFsaWRfeW91dHViZSh1cmkpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vUGFzc1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcyA9IHMucmVwbGFjZShwYXR0ZXJuLCBcIihcIi5jb25jYXQoc3ViLCBcIilcIikpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBzO1xuICAgICAgICB9O1xuICAgICAgICB2YXIgbnB1aSA9IE5lcHR1bmVzUHJpZGUubnB1aTtcbiAgICAgICAgLy9SZXNlYXJjaCBidXR0b24gdG8gcXVpY2tseSB0ZWxsIGZyaWVuZHMgcmVzZWFyY2hcbiAgICAgICAgTmVwdHVuZXNQcmlkZS50ZW1wbGF0ZXNbXCJucGFfcmVzZWFyY2hcIl0gPSBcIlJlc2VhcmNoXCI7XG4gICAgICAgIHZhciBzdXBlck5ld01lc3NhZ2VDb21tZW50Qm94ID0gbnB1aS5OZXdNZXNzYWdlQ29tbWVudEJveDtcbiAgICAgICAgdmFyIHJlcG9ydFJlc2VhcmNoSG9vayA9IGZ1bmN0aW9uIChfZSwgX2QpIHtcbiAgICAgICAgICAgIHZhciB0ZXh0ID0gZ2V0X3Jlc2VhcmNoX3RleHQoTmVwdHVuZXNQcmlkZSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyh0ZXh0KTtcbiAgICAgICAgICAgIHZhciBpbmJveCA9IE5lcHR1bmVzUHJpZGUuaW5ib3g7XG4gICAgICAgICAgICBpbmJveC5jb21tZW50RHJhZnRzW2luYm94LnNlbGVjdGVkTWVzc2FnZS5rZXldICs9IHRleHQ7XG4gICAgICAgICAgICBpbmJveC50cmlnZ2VyKFwic2hvd19zY3JlZW5cIiwgXCJkaXBsb21hY3lfZGV0YWlsXCIpO1xuICAgICAgICB9O1xuICAgICAgICBOZXB0dW5lc1ByaWRlLm5wLm9uKFwicGFzdGVfcmVzZWFyY2hcIiwgcmVwb3J0UmVzZWFyY2hIb29rKTtcbiAgICAgICAgbnB1aS5OZXdNZXNzYWdlQ29tbWVudEJveCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB3aWRnZXQgPSBzdXBlck5ld01lc3NhZ2VDb21tZW50Qm94KCk7XG4gICAgICAgICAgICB2YXIgcmVzZWFyY2hfYnV0dG9uID0gQ3J1eC5CdXR0b24oXCJucGFfcmVzZWFyY2hcIiwgXCJwYXN0ZV9yZXNlYXJjaFwiLCBcInJlc2VhcmNoXCIpLmdyaWQoMTEsIDEyLCA4LCAzKTtcbiAgICAgICAgICAgIHJlc2VhcmNoX2J1dHRvbi5yb29zdCh3aWRnZXQpO1xuICAgICAgICAgICAgcmV0dXJuIHdpZGdldDtcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIHN1cGVyRm9ybWF0VGltZSA9IENydXguZm9ybWF0VGltZTtcbiAgICAgICAgdmFyIHJlbGF0aXZlVGltZXMgPSAwO1xuICAgICAgICBDcnV4LmZvcm1hdFRpbWUgPSBmdW5jdGlvbiAobXMsIG1pbnMsIHNlY3MpIHtcbiAgICAgICAgICAgIHN3aXRjaCAocmVsYXRpdmVUaW1lcykge1xuICAgICAgICAgICAgICAgIGNhc2UgMDogLy9zdGFuZGFyZFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3VwZXJGb3JtYXRUaW1lKG1zLCBtaW5zLCBzZWNzKTtcbiAgICAgICAgICAgICAgICBjYXNlIDE6IC8vRVRBLCAtIHR1cm4ocykgZm9yIHR1cm5iYXNlZFxuICAgICAgICAgICAgICAgICAgICBpZiAoIU5lcHR1bmVzUHJpZGUuZ2FtZUNvbmZpZy50dXJuQmFzZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtc1RvRXRhU3RyaW5nKG1zLCBcIlwiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0aWNrX3JhdGUgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlLmdhbGF4eS50aWNrX3JhdGU7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCJcIi5jb25jYXQoc3VwZXJGb3JtYXRUaW1lKG1zLCBtaW5zLCBzZWNzKSwgXCIgLSBcIikuY29uY2F0KCgoKG1zIC8gMzYwMDAwMCkgKiAxMCkgL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpY2tfcmF0ZSkudG9GaXhlZCgyKSwgXCIgdHVybihzKVwiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhc2UgMjogLy9jeWNsZXMgKyB0aWNrcyBmb3JtYXRcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1zVG9DeWNsZVN0cmluZyhtcywgXCJcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHZhciBzd2l0Y2hUaW1lcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vMCA9IHN0YW5kYXJkLCAxID0gRVRBLCAtIHR1cm4ocykgZm9yIHR1cm5iYXNlZCwgMiA9IGN5Y2xlcyArIHRpY2tzIGZvcm1hdFxuICAgICAgICAgICAgcmVsYXRpdmVUaW1lcyA9IChyZWxhdGl2ZVRpbWVzICsgMSkgJSAzO1xuICAgICAgICB9O1xuICAgICAgICBob3RrZXkoXCIlXCIsIHN3aXRjaFRpbWVzKTtcbiAgICAgICAgc3dpdGNoVGltZXMuaGVscCA9XG4gICAgICAgICAgICBcIkNoYW5nZSB0aGUgZGlzcGxheSBvZiBFVEFzIGJldHdlZW4gcmVsYXRpdmUgdGltZXMsIGFic29sdXRlIGNsb2NrIHRpbWVzLCBhbmQgY3ljbGUgdGltZXMuIE1ha2VzIHByZWRpY3RpbmcgXCIgK1xuICAgICAgICAgICAgICAgIFwiaW1wb3J0YW50IHRpbWVzIG9mIGRheSB0byBzaWduIGluIGFuZCBjaGVjayBtdWNoIGVhc2llciBlc3BlY2lhbGx5IGZvciBtdWx0aS1sZWcgZmxlZXQgbW92ZW1lbnRzLiBTb21ldGltZXMgeW91IFwiICtcbiAgICAgICAgICAgICAgICBcIndpbGwgbmVlZCB0byByZWZyZXNoIHRoZSBkaXNwbGF5IHRvIHNlZSB0aGUgZGlmZmVyZW50IHRpbWVzLlwiO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KENydXgsIFwidG91Y2hFbmFibGVkXCIsIHtcbiAgICAgICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIGZhbHNlOyB9LFxuICAgICAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJDcnV4LnRvdWNoRW5hYmxlZCBzZXQgaWdub3JlZFwiLCB4KTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xuICAgICAgICB9XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShOZXB0dW5lc1ByaWRlLm5wdWkubWFwLCBcImlnbm9yZU1vdXNlRXZlbnRzXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gZmFsc2U7IH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh4KSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJOZXB0dW5lc1ByaWRlLm5wdWkubWFwLmlnbm9yZU1vdXNlRXZlbnRzIHNldCBpZ25vcmVkXCIsIHgpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgICAgIGhvb2tzTG9hZGVkID0gdHJ1ZTtcbiAgICB9O1xuICAgIHZhciBpbml0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgX2E7XG4gICAgICAgIGlmICgoKF9hID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZSkgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLmdhbGF4eSkgJiYgTmVwdHVuZXNQcmlkZS5ucHVpLm1hcCkge1xuICAgICAgICAgICAgbGlua0ZsZWV0cygpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJGbGVldCBsaW5raW5nIGNvbXBsZXRlLlwiKTtcbiAgICAgICAgICAgIGlmICghaG9va3NMb2FkZWQpIHtcbiAgICAgICAgICAgICAgICBsb2FkSG9va3MoKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkhVRCBzZXR1cCBjb21wbGV0ZS5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkhVRCBzZXR1cCBhbHJlYWR5IGRvbmU7IHNraXBwaW5nLlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGhvbWVQbGFuZXRzKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkdhbWUgbm90IGZ1bGx5IGluaXRpYWxpemVkIHlldDsgd2FpdC5cIiwgTmVwdHVuZXNQcmlkZS51bml2ZXJzZSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGhvdGtleShcIkBcIiwgaW5pdCk7XG4gICAgaW5pdC5oZWxwID1cbiAgICAgICAgXCJSZWluaXRpYWxpemUgTmVwdHVuZSdzIFByaWRlIEFnZW50LiBVc2UgdGhlIEAgaG90a2V5IGlmIHRoZSB2ZXJzaW9uIGlzIG5vdCBiZWluZyBzaG93biBvbiB0aGUgbWFwIGFmdGVyIGRyYWdnaW5nLlwiO1xuICAgIGlmICgoKF9iID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZSkgPT09IG51bGwgfHwgX2IgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9iLmdhbGF4eSkgJiYgTmVwdHVuZXNQcmlkZS5ucHVpLm1hcCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIlVuaXZlcnNlIGFscmVhZHkgbG9hZGVkLiBIeXBlcmxpbmsgZmxlZXRzICYgbG9hZCBob29rcy5cIik7XG4gICAgICAgIGluaXQoKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiVW5pdmVyc2Ugbm90IGxvYWRlZC4gSG9vayBvblNlcnZlclJlc3BvbnNlLlwiKTtcbiAgICAgICAgdmFyIHN1cGVyT25TZXJ2ZXJSZXNwb25zZV8xID0gTmVwdHVuZXNQcmlkZS5ucC5vblNlcnZlclJlc3BvbnNlO1xuICAgICAgICBOZXB0dW5lc1ByaWRlLm5wLm9uU2VydmVyUmVzcG9uc2UgPSBmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgIHN1cGVyT25TZXJ2ZXJSZXNwb25zZV8xKHJlc3BvbnNlKTtcbiAgICAgICAgICAgIGlmIChyZXNwb25zZS5ldmVudCA9PT0gXCJvcmRlcjpwbGF5ZXJfYWNoaWV2ZW1lbnRzXCIpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkluaXRpYWwgbG9hZCBjb21wbGV0ZS4gUmVpbnN0YWxsLlwiKTtcbiAgICAgICAgICAgICAgICBpbml0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChyZXNwb25zZS5ldmVudCA9PT0gXCJvcmRlcjpmdWxsX3VuaXZlcnNlXCIpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIlVuaXZlcnNlIHJlY2VpdmVkLiBSZWluc3RhbGwuXCIpO1xuICAgICAgICAgICAgICAgIE5lcHR1bmVzUHJpZGUub3JpZ2luYWxQbGF5ZXIgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlLnBsYXllci51aWQ7XG4gICAgICAgICAgICAgICAgaW5pdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoIWhvb2tzTG9hZGVkICYmIE5lcHR1bmVzUHJpZGUubnB1aS5tYXApIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkhvb2tzIG5lZWQgbG9hZGluZyBhbmQgbWFwIGlzIHJlYWR5LiBSZWluc3RhbGwuXCIpO1xuICAgICAgICAgICAgICAgIGluaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG4gICAgdmFyIG90aGVyVXNlckNvZGUgPSB1bmRlZmluZWQ7XG4gICAgdmFyIGdhbWUgPSBOZXB0dW5lc1ByaWRlLmdhbWVOdW1iZXI7XG4gICAgdmFyIHN3aXRjaFVzZXIgPSBmdW5jdGlvbiAoZXZlbnQsIGRhdGEpIHtcbiAgICAgICAgaWYgKE5lcHR1bmVzUHJpZGUub3JpZ2luYWxQbGF5ZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgTmVwdHVuZXNQcmlkZS5vcmlnaW5hbFBsYXllciA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2UucGxheWVyLnVpZDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgY29kZSA9IChkYXRhID09PSBudWxsIHx8IGRhdGEgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGRhdGEuc3BsaXQoXCI6XCIpWzFdKSB8fCBvdGhlclVzZXJDb2RlO1xuICAgICAgICBvdGhlclVzZXJDb2RlID0gY29kZTtcbiAgICAgICAgaWYgKG90aGVyVXNlckNvZGUpIHtcbiAgICAgICAgICAgIHZhciBwYXJhbXMgPSB7XG4gICAgICAgICAgICAgICAgZ2FtZV9udW1iZXI6IGdhbWUsXG4gICAgICAgICAgICAgICAgYXBpX3ZlcnNpb246IFwiMC4xXCIsXG4gICAgICAgICAgICAgICAgY29kZTogb3RoZXJVc2VyQ29kZSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB2YXIgZWdnZXJzID0galF1ZXJ5LmFqYXgoe1xuICAgICAgICAgICAgICAgIHR5cGU6IFwiUE9TVFwiLFxuICAgICAgICAgICAgICAgIHVybDogXCJodHRwczovL25wLmlyb25oZWxtZXQuY29tL2FwaVwiLFxuICAgICAgICAgICAgICAgIGFzeW5jOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBkYXRhOiBwYXJhbXMsXG4gICAgICAgICAgICAgICAgZGF0YVR5cGU6IFwianNvblwiLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBOZXB0dW5lc1ByaWRlLm5wLm9uRnVsbFVuaXZlcnNlKG51bGwsIGVnZ2Vycy5yZXNwb25zZUpTT04uc2Nhbm5pbmdfZGF0YSk7XG4gICAgICAgICAgICBOZXB0dW5lc1ByaWRlLm5wdWkub25IaWRlU2NyZWVuKG51bGwsIHRydWUpO1xuICAgICAgICAgICAgTmVwdHVuZXNQcmlkZS5ucC50cmlnZ2VyKFwic2VsZWN0X3BsYXllclwiLCBbXG4gICAgICAgICAgICAgICAgTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5wbGF5ZXIudWlkLFxuICAgICAgICAgICAgICAgIHRydWUsXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIGluaXQoKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgaG90a2V5KFwiPlwiLCBzd2l0Y2hVc2VyKTtcbiAgICBzd2l0Y2hVc2VyLmhlbHAgPVxuICAgICAgICBcIlN3aXRjaCB2aWV3cyB0byB0aGUgbGFzdCB1c2VyIHdob3NlIEFQSSBrZXkgd2FzIHVzZWQgdG8gbG9hZCBkYXRhLiBUaGUgSFVEIHNob3dzIHRoZSBjdXJyZW50IHVzZXIgd2hlbiBcIiArXG4gICAgICAgICAgICBcIml0IGlzIG5vdCB5b3VyIG93biBhbGlhcyB0byBoZWxwIHJlbWluZCB5b3UgdGhhdCB5b3UgYXJlbid0IGluIGNvbnRyb2wgb2YgdGhpcyB1c2VyLlwiO1xuICAgIGhvdGtleShcInxcIiwgbWVyZ2VVc2VyKTtcbiAgICBtZXJnZVVzZXIuaGVscCA9XG4gICAgICAgIFwiTWVyZ2UgdGhlIGxhdGVzdCBkYXRhIGZyb20gdGhlIGxhc3QgdXNlciB3aG9zZSBBUEkga2V5IHdhcyB1c2VkIHRvIGxvYWQgZGF0YS4gVGhpcyBpcyB1c2VmdWwgYWZ0ZXIgYSB0aWNrIFwiICtcbiAgICAgICAgICAgIFwicGFzc2VzIGFuZCB5b3UndmUgcmVsb2FkZWQsIGJ1dCB5b3Ugc3RpbGwgd2FudCB0aGUgbWVyZ2VkIHNjYW4gZGF0YSBmcm9tIHR3byBwbGF5ZXJzIG9uc2NyZWVuLlwiO1xuICAgIE5lcHR1bmVzUHJpZGUubnAub24oXCJzd2l0Y2hfdXNlcl9hcGlcIiwgc3dpdGNoVXNlcik7XG4gICAgTmVwdHVuZXNQcmlkZS5ucC5vbihcIm1lcmdlX3VzZXJfYXBpXCIsIG1lcmdlVXNlcik7XG4gICAgdmFyIG5wYUhlbHAgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBoZWxwID0gW1wiPEgxPlwiLmNvbmNhdCh0aXRsZSwgXCI8L0gxPlwiKV07XG4gICAgICAgIGZvciAodmFyIHBhaXIgaW4gaG90a2V5cykge1xuICAgICAgICAgICAgdmFyIGtleSA9IGhvdGtleXNbcGFpcl1bMF07XG4gICAgICAgICAgICB2YXIgYWN0aW9uID0gaG90a2V5c1twYWlyXVsxXTtcbiAgICAgICAgICAgIGhlbHAucHVzaChcIjxoMj5Ib3RrZXk6IFwiLmNvbmNhdChrZXksIFwiPC9oMj5cIikpO1xuICAgICAgICAgICAgaWYgKGFjdGlvbi5oZWxwKSB7XG4gICAgICAgICAgICAgICAgaGVscC5wdXNoKGFjdGlvbi5oZWxwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGhlbHAucHVzaChcIjxwPk5vIGRvY3VtZW50YXRpb24geWV0LjxwPjxjb2RlPlwiLmNvbmNhdChhY3Rpb24udG9Mb2NhbGVTdHJpbmcoKSwgXCI8L2NvZGU+XCIpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlLmhlbHBIVE1MID0gaGVscC5qb2luKFwiXCIpO1xuICAgICAgICBOZXB0dW5lc1ByaWRlLm5wLnRyaWdnZXIoXCJzaG93X3NjcmVlblwiLCBcImhlbHBcIik7XG4gICAgfTtcbiAgICBucGFIZWxwLmhlbHAgPSBcIkRpc3BsYXkgdGhpcyBoZWxwIHNjcmVlbi5cIjtcbiAgICBob3RrZXkoXCI/XCIsIG5wYUhlbHApO1xuICAgIHZhciBhdXRvY29tcGxldGVNb2RlID0gMDtcbiAgICB2YXIgYXV0b2NvbXBsZXRlVHJpZ2dlciA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGlmIChlLnRhcmdldC50eXBlID09PSBcInRleHRhcmVhXCIpIHtcbiAgICAgICAgICAgIGlmIChhdXRvY29tcGxldGVNb2RlKSB7XG4gICAgICAgICAgICAgICAgdmFyIHN0YXJ0ID0gYXV0b2NvbXBsZXRlTW9kZTtcbiAgICAgICAgICAgICAgICB2YXIgZW5kQnJhY2tldCA9IGUudGFyZ2V0LnZhbHVlLmluZGV4T2YoXCJdXCIsIHN0YXJ0KTtcbiAgICAgICAgICAgICAgICBpZiAoZW5kQnJhY2tldCA9PT0gLTEpXG4gICAgICAgICAgICAgICAgICAgIGVuZEJyYWNrZXQgPSBlLnRhcmdldC52YWx1ZS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgdmFyIGF1dG9TdHJpbmcgPSBlLnRhcmdldC52YWx1ZS5zdWJzdHJpbmcoc3RhcnQsIGVuZEJyYWNrZXQpO1xuICAgICAgICAgICAgICAgIHZhciBrZXkgPSBlLmtleTtcbiAgICAgICAgICAgICAgICBpZiAoa2V5ID09PSBcIl1cIikge1xuICAgICAgICAgICAgICAgICAgICBhdXRvY29tcGxldGVNb2RlID0gMDtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG0gPSBhdXRvU3RyaW5nLm1hdGNoKC9eWzAtOV1bMC05XSokLyk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChtID09PSBudWxsIHx8IG0gPT09IHZvaWQgMCA/IHZvaWQgMCA6IG0ubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcHVpZCA9IE51bWJlcihhdXRvU3RyaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBlbmQgPSBlLnRhcmdldC5zZWxlY3Rpb25FbmQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgYXV0byA9IFwiXCIuY29uY2F0KHB1aWQsIFwiXV0gXCIpLmNvbmNhdChOZXB0dW5lc1ByaWRlLnVuaXZlcnNlLmdhbGF4eS5wbGF5ZXJzW3B1aWRdLmFsaWFzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGUudGFyZ2V0LnZhbHVlID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlLnRhcmdldC52YWx1ZS5zdWJzdHJpbmcoMCwgc3RhcnQpICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXV0byArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUudGFyZ2V0LnZhbHVlLnN1YnN0cmluZyhlbmQsIGUudGFyZ2V0LnZhbHVlLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBlLnRhcmdldC5zZWxlY3Rpb25TdGFydCA9IHN0YXJ0ICsgYXV0by5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgICAgICBlLnRhcmdldC5zZWxlY3Rpb25FbmQgPSBzdGFydCArIGF1dG8ubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoZS50YXJnZXQuc2VsZWN0aW9uU3RhcnQgPiAxKSB7XG4gICAgICAgICAgICAgICAgdmFyIHN0YXJ0ID0gZS50YXJnZXQuc2VsZWN0aW9uU3RhcnQgLSAyO1xuICAgICAgICAgICAgICAgIHZhciBzcyA9IGUudGFyZ2V0LnZhbHVlLnN1YnN0cmluZyhzdGFydCwgc3RhcnQgKyAyKTtcbiAgICAgICAgICAgICAgICBhdXRvY29tcGxldGVNb2RlID0gc3MgPT09IFwiW1tcIiA/IGUudGFyZ2V0LnNlbGVjdGlvblN0YXJ0IDogMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG4gICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKFwia2V5dXBcIiwgYXV0b2NvbXBsZXRlVHJpZ2dlcik7XG4gICAgY29uc29sZS5sb2coXCJTQVQ6IE5lcHR1bmUncyBQcmlkZSBBZ2VudCBpbmplY3Rpb24gZmluaXNoZWQuXCIpO1xuICAgIGNvbnNvbGUubG9nKFwiR2V0dGluZyBoZXJvIVwiLCBnZXRfaGVybyhOZXB0dW5lc1ByaWRlLnVuaXZlcnNlKSk7XG59XG52YXIgZm9yY2VfYWRkX2N1c3RvbV9wbGF5ZXJfcGFuZWwgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKFwiUGxheWVyUGFuZWxcIiBpbiBOZXB0dW5lc1ByaWRlLm5wdWkpIHtcbiAgICAgICAgYWRkX2N1c3RvbV9wbGF5ZXJfcGFuZWwoKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHNldFRpbWVvdXQoYWRkX2N1c3RvbV9wbGF5ZXJfcGFuZWwsIDMwMDApO1xuICAgIH1cbn07XG52YXIgYWRkX2N1c3RvbV9wbGF5ZXJfcGFuZWwgPSBmdW5jdGlvbiAoKSB7XG4gICAgTmVwdHVuZXNQcmlkZS5ucHVpLlBsYXllclBhbmVsID0gZnVuY3Rpb24gKHBsYXllciwgc2hvd0VtcGlyZSkge1xuICAgICAgICB2YXIgdW5pdmVyc2UgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlO1xuICAgICAgICB2YXIgbnB1aSA9IE5lcHR1bmVzUHJpZGUubnB1aTtcbiAgICAgICAgdmFyIHBsYXllclBhbmVsID0gQ3J1eC5XaWRnZXQoXCJyZWxcIikuc2l6ZSg0ODAsIDI2NCAtIDggKyA0OCk7XG4gICAgICAgIHZhciBoZWFkaW5nID0gXCJwbGF5ZXJcIjtcbiAgICAgICAgaWYgKHVuaXZlcnNlLnBsYXllckFjaGlldmVtZW50cyAmJlxuICAgICAgICAgICAgTmVwdHVuZXNQcmlkZS5nYW1lQ29uZmlnLmFub255bWl0eSA9PT0gMCkge1xuICAgICAgICAgICAgaWYgKHVuaXZlcnNlLnBsYXllckFjaGlldmVtZW50c1twbGF5ZXIudWlkXSkge1xuICAgICAgICAgICAgICAgIGlmICh1bml2ZXJzZS5wbGF5ZXJBY2hpZXZlbWVudHNbcGxheWVyLnVpZF0ucHJlbWl1bSA9PT0gXCJwcmVtaXVtXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgaGVhZGluZyA9IFwicHJlbWl1bV9wbGF5ZXJcIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHVuaXZlcnNlLnBsYXllckFjaGlldmVtZW50c1twbGF5ZXIudWlkXS5wcmVtaXVtID09PSBcImxpZmV0aW1lXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgaGVhZGluZyA9IFwibGlmZXRpbWVfcHJlbWl1bV9wbGF5ZXJcIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgQ3J1eC5UZXh0KGhlYWRpbmcsIFwic2VjdGlvbl90aXRsZSBjb2xfYmxhY2tcIilcbiAgICAgICAgICAgIC5ncmlkKDAsIDAsIDMwLCAzKVxuICAgICAgICAgICAgLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgaWYgKHBsYXllci5haSkge1xuICAgICAgICAgICAgQ3J1eC5UZXh0KFwiYWlfYWRtaW5cIiwgXCJ0eHRfcmlnaHQgcGFkMTJcIilcbiAgICAgICAgICAgICAgICAuZ3JpZCgwLCAwLCAzMCwgMylcbiAgICAgICAgICAgICAgICAucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICB9XG4gICAgICAgIENydXguSW1hZ2UoXCIuLi9pbWFnZXMvYXZhdGFycy8xNjAvXCIuY29uY2F0KHBsYXllci5hdmF0YXIsIFwiLmpwZ1wiKSwgXCJhYnNcIilcbiAgICAgICAgICAgIC5ncmlkKDAsIDYsIDEwLCAxMClcbiAgICAgICAgICAgIC5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgIENydXguV2lkZ2V0KFwicGNpXzQ4X1wiLmNvbmNhdChwbGF5ZXIudWlkKSkuZ3JpZCg3LCAxMywgMywgMykucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICBDcnV4LldpZGdldChcImNvbF9hY2NlbnRcIikuZ3JpZCgwLCAzLCAzMCwgMykucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICBDcnV4LlRleHQoXCJcIiwgXCJzY3JlZW5fc3VidGl0bGVcIilcbiAgICAgICAgICAgIC5ncmlkKDAsIDMsIDMwLCAzKVxuICAgICAgICAgICAgLnJhd0hUTUwocGxheWVyLnF1YWxpZmllZEFsaWFzKVxuICAgICAgICAgICAgLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgdmFyIG15QWNoaWV2ZW1lbnRzO1xuICAgICAgICAvL1U9PlRveGljXG4gICAgICAgIC8vVj0+TWFnaWNcbiAgICAgICAgLy81PT5GbG9tYmFldVxuICAgICAgICAvL1c9PldpemFyZFxuICAgICAgICBpZiAodW5pdmVyc2UucGxheWVyQWNoaWV2ZW1lbnRzKSB7XG4gICAgICAgICAgICBteUFjaGlldmVtZW50cyA9IHVuaXZlcnNlLnBsYXllckFjaGlldmVtZW50c1twbGF5ZXIudWlkXTtcbiAgICAgICAgICAgIGlmIChwbGF5ZXIucmF3QWxpYXMgPT0gXCJMb3JlbnR6XCIgJiZcbiAgICAgICAgICAgICAgICBcIldcIiAhPSBteUFjaGlldmVtZW50cy5iYWRnZXMuc2xpY2UoMCwgMSkpIHtcbiAgICAgICAgICAgICAgICBteUFjaGlldmVtZW50cy5iYWRnZXMgPSBcIldcIi5jb25jYXQobXlBY2hpZXZlbWVudHMuYmFkZ2VzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHBsYXllci5yYXdBbGlhcyA9PSBcIkEgU3RvbmVkIEFwZVwiICYmXG4gICAgICAgICAgICAgICAgXCI1XCIgIT0gbXlBY2hpZXZlbWVudHMuYmFkZ2VzLnNsaWNlKDAsIDEpKSB7XG4gICAgICAgICAgICAgICAgbXlBY2hpZXZlbWVudHMuYmFkZ2VzID0gXCI1XCIuY29uY2F0KG15QWNoaWV2ZW1lbnRzLmJhZGdlcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG15QWNoaWV2ZW1lbnRzKSB7XG4gICAgICAgICAgICBucHVpXG4gICAgICAgICAgICAgICAgLlNtYWxsQmFkZ2VSb3cobXlBY2hpZXZlbWVudHMuYmFkZ2VzKVxuICAgICAgICAgICAgICAgIC5ncmlkKDAsIDMsIDMwLCAzKVxuICAgICAgICAgICAgICAgIC5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgIH1cbiAgICAgICAgQ3J1eC5XaWRnZXQoXCJjb2xfYmxhY2tcIikuZ3JpZCgxMCwgNiwgMjAsIDMpLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgaWYgKHBsYXllci51aWQgIT0gZ2V0X2hlcm8oTmVwdHVuZXNQcmlkZS51bml2ZXJzZSkudWlkICYmIHBsYXllci5haSA9PSAwKSB7XG4gICAgICAgICAgICAvL1VzZSB0aGlzIHRvIG9ubHkgdmlldyB3aGVuIHRoZXkgYXJlIHdpdGhpbiBzY2FubmluZzpcbiAgICAgICAgICAgIC8vdW5pdmVyc2Uuc2VsZWN0ZWRTdGFyLnYgIT0gXCIwXCJcbiAgICAgICAgICAgIHZhciB0b3RhbF9zZWxsX2Nvc3QgPSBnZXRfdGVjaF90cmFkZV9jb3N0KGdldF9oZXJvKE5lcHR1bmVzUHJpZGUudW5pdmVyc2UpLCBwbGF5ZXIpO1xuICAgICAgICAgICAgLyoqKiBTSEFSRSBBTEwgVEVDSCAgKioqL1xuICAgICAgICAgICAgdmFyIGJ0biA9IENydXguQnV0dG9uKFwiXCIsIFwic2hhcmVfYWxsX3RlY2hcIiwgcGxheWVyKVxuICAgICAgICAgICAgICAgIC5hZGRTdHlsZShcImZ3ZFwiKVxuICAgICAgICAgICAgICAgIC5yYXdIVE1MKFwiU2hhcmUgQWxsIFRlY2g6ICRcIi5jb25jYXQodG90YWxfc2VsbF9jb3N0KSlcbiAgICAgICAgICAgICAgICAuZ3JpZCgxMCwgMzEsIDE0LCAzKTtcbiAgICAgICAgICAgIC8vRGlzYWJsZSBpZiBpbiBhIGdhbWUgd2l0aCBGQSAmIFNjYW4gKEJVRylcbiAgICAgICAgICAgIHZhciBjb25maWcgPSBOZXB0dW5lc1ByaWRlLmdhbWVDb25maWc7XG4gICAgICAgICAgICBpZiAoIShjb25maWcudHJhZGVTY2FubmVkICYmIGNvbmZpZy5hbGxpYW5jZXMpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGdldF9oZXJvKE5lcHR1bmVzUHJpZGUudW5pdmVyc2UpLmNhc2ggPj0gdG90YWxfc2VsbF9jb3N0KSB7XG4gICAgICAgICAgICAgICAgICAgIGJ0bi5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBidG4uZGlzYWJsZSgpLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvKioqIFBBWSBGT1IgQUxMIFRFQ0ggKioqL1xuICAgICAgICAgICAgdmFyIHRvdGFsX2J1eV9jb3N0ID0gZ2V0X3RlY2hfdHJhZGVfY29zdChwbGF5ZXIsIGdldF9oZXJvKE5lcHR1bmVzUHJpZGUudW5pdmVyc2UpKTtcbiAgICAgICAgICAgIGJ0biA9IENydXguQnV0dG9uKFwiXCIsIFwiYnV5X2FsbF90ZWNoXCIsIHtcbiAgICAgICAgICAgICAgICBwbGF5ZXI6IHBsYXllcixcbiAgICAgICAgICAgICAgICB0ZWNoOiBudWxsLFxuICAgICAgICAgICAgICAgIGNvc3Q6IHRvdGFsX2J1eV9jb3N0LFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuYWRkU3R5bGUoXCJmd2RcIilcbiAgICAgICAgICAgICAgICAucmF3SFRNTChcIlBheSBmb3IgQWxsIFRlY2g6ICRcIi5jb25jYXQodG90YWxfYnV5X2Nvc3QpKVxuICAgICAgICAgICAgICAgIC5ncmlkKDEwLCA0OSwgMTQsIDMpO1xuICAgICAgICAgICAgaWYgKGdldF9oZXJvKE5lcHR1bmVzUHJpZGUudW5pdmVyc2UpLmNhc2ggPj0gdG90YWxfc2VsbF9jb3N0KSB7XG4gICAgICAgICAgICAgICAgYnRuLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGJ0bi5kaXNhYmxlKCkucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLypJbmRpdmlkdWFsIHRlY2hzKi9cbiAgICAgICAgICAgIHZhciBfbmFtZV9tYXAgPSB7XG4gICAgICAgICAgICAgICAgc2Nhbm5pbmc6IFwiU2Nhbm5pbmdcIixcbiAgICAgICAgICAgICAgICBwcm9wdWxzaW9uOiBcIkh5cGVyc3BhY2UgUmFuZ2VcIixcbiAgICAgICAgICAgICAgICB0ZXJyYWZvcm1pbmc6IFwiVGVycmFmb3JtaW5nXCIsXG4gICAgICAgICAgICAgICAgcmVzZWFyY2g6IFwiRXhwZXJpbWVudGF0aW9uXCIsXG4gICAgICAgICAgICAgICAgd2VhcG9uczogXCJXZWFwb25zXCIsXG4gICAgICAgICAgICAgICAgYmFua2luZzogXCJCYW5raW5nXCIsXG4gICAgICAgICAgICAgICAgbWFudWZhY3R1cmluZzogXCJNYW51ZmFjdHVyaW5nXCIsXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdmFyIHRlY2hzID0gW1xuICAgICAgICAgICAgICAgIFwic2Nhbm5pbmdcIixcbiAgICAgICAgICAgICAgICBcInByb3B1bHNpb25cIixcbiAgICAgICAgICAgICAgICBcInRlcnJhZm9ybWluZ1wiLFxuICAgICAgICAgICAgICAgIFwicmVzZWFyY2hcIixcbiAgICAgICAgICAgICAgICBcIndlYXBvbnNcIixcbiAgICAgICAgICAgICAgICBcImJhbmtpbmdcIixcbiAgICAgICAgICAgICAgICBcIm1hbnVmYWN0dXJpbmdcIixcbiAgICAgICAgICAgIF07XG4gICAgICAgICAgICB0ZWNocy5mb3JFYWNoKGZ1bmN0aW9uICh0ZWNoLCBpKSB7XG4gICAgICAgICAgICAgICAgdmFyIG9uZV90ZWNoX2Nvc3QgPSBnZXRfdGVjaF90cmFkZV9jb3N0KHBsYXllciwgZ2V0X2hlcm8oTmVwdHVuZXNQcmlkZS51bml2ZXJzZSksIHRlY2gpO1xuICAgICAgICAgICAgICAgIHZhciBvbmVfdGVjaCA9IENydXguQnV0dG9uKFwiXCIsIFwiYnV5X29uZV90ZWNoXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyOiBwbGF5ZXIsXG4gICAgICAgICAgICAgICAgICAgIHRlY2g6IHRlY2gsXG4gICAgICAgICAgICAgICAgICAgIGNvc3Q6IG9uZV90ZWNoX2Nvc3QsXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgLmFkZFN0eWxlKFwiZndkXCIpXG4gICAgICAgICAgICAgICAgICAgIC5yYXdIVE1MKFwiUGF5OiAkXCIuY29uY2F0KG9uZV90ZWNoX2Nvc3QpKVxuICAgICAgICAgICAgICAgICAgICAuZ3JpZCgxNSwgMzQuNSArIGkgKiAyLCA3LCAyKTtcbiAgICAgICAgICAgICAgICBpZiAoZ2V0X2hlcm8oTmVwdHVuZXNQcmlkZS51bml2ZXJzZSkuY2FzaCA+PSBvbmVfdGVjaF9jb3N0ICYmXG4gICAgICAgICAgICAgICAgICAgIG9uZV90ZWNoX2Nvc3QgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIG9uZV90ZWNoLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBDcnV4LlRleHQoXCJ5b3VcIiwgXCJwYWQxMiB0eHRfY2VudGVyXCIpLmdyaWQoMjUsIDYsIDUsIDMpLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgLy8gTGFiZWxzXG4gICAgICAgIENydXguVGV4dChcInRvdGFsX3N0YXJzXCIsIFwicGFkOFwiKS5ncmlkKDEwLCA5LCAxNSwgMykucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICBDcnV4LlRleHQoXCJ0b3RhbF9mbGVldHNcIiwgXCJwYWQ4XCIpLmdyaWQoMTAsIDExLCAxNSwgMykucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICBDcnV4LlRleHQoXCJ0b3RhbF9zaGlwc1wiLCBcInBhZDhcIikuZ3JpZCgxMCwgMTMsIDE1LCAzKS5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgIENydXguVGV4dChcIm5ld19zaGlwc1wiLCBcInBhZDhcIikuZ3JpZCgxMCwgMTUsIDE1LCAzKS5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgIC8vIFRoaXMgcGxheWVycyBzdGF0c1xuICAgICAgICBpZiAocGxheWVyICE9PSB1bml2ZXJzZS5wbGF5ZXIpIHtcbiAgICAgICAgICAgIENydXguVGV4dChcIlwiLCBcInBhZDggdHh0X2NlbnRlclwiKVxuICAgICAgICAgICAgICAgIC5ncmlkKDIwLCA5LCA1LCAzKVxuICAgICAgICAgICAgICAgIC5yYXdIVE1MKHBsYXllci50b3RhbF9zdGFycylcbiAgICAgICAgICAgICAgICAucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICAgICAgQ3J1eC5UZXh0KFwiXCIsIFwicGFkOCB0eHRfY2VudGVyXCIpXG4gICAgICAgICAgICAgICAgLmdyaWQoMjAsIDExLCA1LCAzKVxuICAgICAgICAgICAgICAgIC5yYXdIVE1MKHBsYXllci50b3RhbF9mbGVldHMpXG4gICAgICAgICAgICAgICAgLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgICAgIENydXguVGV4dChcIlwiLCBcInBhZDggdHh0X2NlbnRlclwiKVxuICAgICAgICAgICAgICAgIC5ncmlkKDIwLCAxMywgNSwgMylcbiAgICAgICAgICAgICAgICAucmF3SFRNTChwbGF5ZXIudG90YWxfc3RyZW5ndGgpXG4gICAgICAgICAgICAgICAgLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgICAgIENydXguVGV4dChcIlwiLCBcInBhZDggdHh0X2NlbnRlclwiKVxuICAgICAgICAgICAgICAgIC5ncmlkKDIwLCAxNSwgNSwgMylcbiAgICAgICAgICAgICAgICAucmF3SFRNTChwbGF5ZXIuc2hpcHNQZXJUaWNrKVxuICAgICAgICAgICAgICAgIC5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gc2VsZWN0SGlsaWdodFN0eWxlKHAxLCBwMikge1xuICAgICAgICAgICAgcDEgPSBOdW1iZXIocDEpO1xuICAgICAgICAgICAgcDIgPSBOdW1iZXIocDIpO1xuICAgICAgICAgICAgaWYgKHAxIDwgcDIpXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiIHR4dF93YXJuX2JhZFwiO1xuICAgICAgICAgICAgaWYgKHAxID4gcDIpXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiIHR4dF93YXJuX2dvb2RcIjtcbiAgICAgICAgICAgIHJldHVybiBcIlwiO1xuICAgICAgICB9XG4gICAgICAgIC8vIFlvdXIgc3RhdHNcbiAgICAgICAgaWYgKHVuaXZlcnNlLnBsYXllcikge1xuICAgICAgICAgICAgQ3J1eC5UZXh0KFwiXCIsIFwicGFkOCB0eHRfY2VudGVyIFwiLmNvbmNhdChzZWxlY3RIaWxpZ2h0U3R5bGUodW5pdmVyc2UucGxheWVyLnRvdGFsX3N0YXJzLCBwbGF5ZXIudG90YWxfc3RhcnMpKSlcbiAgICAgICAgICAgICAgICAuZ3JpZCgyNSwgOSwgNSwgMylcbiAgICAgICAgICAgICAgICAucmF3SFRNTCh1bml2ZXJzZS5wbGF5ZXIudG90YWxfc3RhcnMpXG4gICAgICAgICAgICAgICAgLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgICAgIENydXguVGV4dChcIlwiLCBcInBhZDggdHh0X2NlbnRlclwiLmNvbmNhdChzZWxlY3RIaWxpZ2h0U3R5bGUodW5pdmVyc2UucGxheWVyLnRvdGFsX2ZsZWV0cywgcGxheWVyLnRvdGFsX2ZsZWV0cykpKVxuICAgICAgICAgICAgICAgIC5ncmlkKDI1LCAxMSwgNSwgMylcbiAgICAgICAgICAgICAgICAucmF3SFRNTCh1bml2ZXJzZS5wbGF5ZXIudG90YWxfZmxlZXRzKVxuICAgICAgICAgICAgICAgIC5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgICAgICBDcnV4LlRleHQoXCJcIiwgXCJwYWQ4IHR4dF9jZW50ZXJcIi5jb25jYXQoc2VsZWN0SGlsaWdodFN0eWxlKHVuaXZlcnNlLnBsYXllci50b3RhbF9zdHJlbmd0aCwgcGxheWVyLnRvdGFsX3N0cmVuZ3RoKSkpXG4gICAgICAgICAgICAgICAgLmdyaWQoMjUsIDEzLCA1LCAzKVxuICAgICAgICAgICAgICAgIC5yYXdIVE1MKHVuaXZlcnNlLnBsYXllci50b3RhbF9zdHJlbmd0aClcbiAgICAgICAgICAgICAgICAucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICAgICAgQ3J1eC5UZXh0KFwiXCIsIFwicGFkOCB0eHRfY2VudGVyXCIuY29uY2F0KHNlbGVjdEhpbGlnaHRTdHlsZSh1bml2ZXJzZS5wbGF5ZXIuc2hpcHNQZXJUaWNrLCBwbGF5ZXIuc2hpcHNQZXJUaWNrKSkpXG4gICAgICAgICAgICAgICAgLmdyaWQoMjUsIDE1LCA1LCAzKVxuICAgICAgICAgICAgICAgIC5yYXdIVE1MKHVuaXZlcnNlLnBsYXllci5zaGlwc1BlclRpY2spXG4gICAgICAgICAgICAgICAgLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgfVxuICAgICAgICBDcnV4LldpZGdldChcImNvbF9hY2NlbnRcIikuZ3JpZCgwLCAxNiwgMTAsIDMpLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgaWYgKHVuaXZlcnNlLnBsYXllcikge1xuICAgICAgICAgICAgdmFyIG1zZ0J0biA9IENydXguSWNvbkJ1dHRvbihcImljb24tbWFpbFwiLCBcImluYm94X25ld19tZXNzYWdlX3RvX3BsYXllclwiLCBwbGF5ZXIudWlkKVxuICAgICAgICAgICAgICAgIC5ncmlkKDAsIDE2LCAzLCAzKVxuICAgICAgICAgICAgICAgIC5hZGRTdHlsZShcImZ3ZFwiKVxuICAgICAgICAgICAgICAgIC5kaXNhYmxlKClcbiAgICAgICAgICAgICAgICAucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICAgICAgaWYgKHBsYXllciAhPT0gdW5pdmVyc2UucGxheWVyICYmIHBsYXllci5hbGlhcykge1xuICAgICAgICAgICAgICAgIG1zZ0J0bi5lbmFibGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIENydXguSWNvbkJ1dHRvbihcImljb24tY2hhcnQtbGluZVwiLCBcInNob3dfaW50ZWxcIiwgcGxheWVyLnVpZClcbiAgICAgICAgICAgICAgICAuZ3JpZCgyLjUsIDE2LCAzLCAzKVxuICAgICAgICAgICAgICAgIC5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgICAgICBpZiAoc2hvd0VtcGlyZSkge1xuICAgICAgICAgICAgICAgIENydXguSWNvbkJ1dHRvbihcImljb24tZXllXCIsIFwic2hvd19zY3JlZW5cIiwgXCJlbXBpcmVcIilcbiAgICAgICAgICAgICAgICAgICAgLmdyaWQoNywgMTYsIDMsIDMpXG4gICAgICAgICAgICAgICAgICAgIC5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBsYXllclBhbmVsO1xuICAgIH07XG59O1xudmFyIHN1cGVyU3Rhckluc3BlY3RvciA9IE5lcHR1bmVzUHJpZGUubnB1aS5TdGFySW5zcGVjdG9yO1xuTmVwdHVuZXNQcmlkZS5ucHVpLlN0YXJJbnNwZWN0b3IgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHVuaXZlcnNlID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZTtcbiAgICB2YXIgY29uZmlnID0gTmVwdHVuZXNQcmlkZS5nYW1lQ29uZmlnO1xuICAgIC8vQ2FsbCBzdXBlciAoUHJldmlvdXMgU3Rhckluc3BlY3RvciBmcm9tIGdhbWVjb2RlKVxuICAgIHZhciBzdGFySW5zcGVjdG9yID0gc3VwZXJTdGFySW5zcGVjdG9yKCk7XG4gICAgQ3J1eC5JY29uQnV0dG9uKFwiaWNvbi1oZWxwIHJlbFwiLCBcInNob3dfaGVscFwiLCBcInN0YXJzXCIpLnJvb3N0KHN0YXJJbnNwZWN0b3IuaGVhZGluZyk7XG4gICAgQ3J1eC5JY29uQnV0dG9uKFwiaWNvbi1kb2MtdGV4dCByZWxcIiwgXCJzaG93X3NjcmVlblwiLCBcImNvbWJhdF9jYWxjdWxhdG9yXCIpLnJvb3N0KHN0YXJJbnNwZWN0b3IuaGVhZGluZyk7XG4gICAgLy9BcHBlbmQgZXh0cmEgZnVuY3Rpb25cbiAgICBmdW5jdGlvbiBhcHBseV9mcmFjdGlvbmFsX3NoaXBzKCkge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgZGVwdGgsIHNlbGVjdG9yLCBlbGVtZW50LCBjb3VudGVyLCBmcmFjdGlvbmFsX3NoaXAsIGZyYWN0aW9uYWxfc2hpcF8xLCBuZXdfdmFsdWU7XG4gICAgICAgICAgICByZXR1cm4gX19nZW5lcmF0b3IodGhpcywgZnVuY3Rpb24gKF9hKSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoIChfYS5sYWJlbCkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXB0aCA9IGNvbmZpZy50dXJuQmFzZWQgPyA0IDogMztcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdG9yID0gXCIjY29udGVudEFyZWEgPiBkaXYgPiBkaXYud2lkZ2V0LmZ1bGxzY3JlZW4gPiBkaXY6bnRoLWNoaWxkKFwiLmNvbmNhdChkZXB0aCwgXCIpID4gZGl2ID4gZGl2Om50aC1jaGlsZCg1KSA+IGRpdi53aWRnZXQucGFkMTIuaWNvbi1yb2NrZXQtaW5saW5lLnR4dF9yaWdodFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQgPSAkKHNlbGVjdG9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50ZXIgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgZnJhY3Rpb25hbF9zaGlwID0gdW5pdmVyc2Uuc2VsZWN0ZWRTdGFyW1wiY1wiXS50b0ZpeGVkKDIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgJChzZWxlY3RvcikuYXBwZW5kKGZyYWN0aW9uYWxfc2hpcCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBfYS5sYWJlbCA9IDE7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghKGVsZW1lbnQubGVuZ3RoID09IDAgJiYgY291bnRlciA8PSAxMDApKSByZXR1cm4gWzMgLypicmVhayovLCAzXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbNCAvKnlpZWxkKi8sIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyKSB7IHJldHVybiBzZXRUaW1lb3V0KHIsIDEwKTsgfSldO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgICAgICAgICBfYS5zZW50KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50ID0gJChzZWxlY3Rvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICBmcmFjdGlvbmFsX3NoaXBfMSA9IHVuaXZlcnNlLnNlbGVjdGVkU3RhcltcImNcIl07XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdfdmFsdWUgPSBwYXJzZUludCgkKHNlbGVjdG9yKS50ZXh0KCkpICsgZnJhY3Rpb25hbF9zaGlwXzE7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKHNlbGVjdG9yKS50ZXh0KG5ld192YWx1ZS50b0ZpeGVkKDIpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50ZXIgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbMyAvKmJyZWFrKi8sIDFdO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDM6IHJldHVybiBbMiAvKnJldHVybiovXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGlmIChcImNcIiBpbiB1bml2ZXJzZS5zZWxlY3RlZFN0YXIpIHtcbiAgICAgICAgYXBwbHlfZnJhY3Rpb25hbF9zaGlwcygpO1xuICAgIH1cbiAgICByZXR1cm4gc3Rhckluc3BlY3Rvcjtcbn07XG4vL0NoYW5nZSBmcm9tIHRpbWVvdXQgdG8gaG9va3MgYnkgdXBkYXRpbmcgdGhlIHdvcmtlciB0byBob29rIGludG8gYSBnYW1lIGNvbXBvbmVudC5cbi8vSmF2YXNjcmlwdCBjYWxsXG5zZXRUaW1lb3V0KExlZ2FjeV9OZXB0dW5lc1ByaWRlQWdlbnQsIDEwMDApO1xuc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgLy9UeXBlc2NyaXB0IGNhbGxcbiAgICByZW5kZXJMZWRnZXIoTmVwdHVuZXNQcmlkZSwgQ3J1eCwgTW91c2V0cmFwKTtcbn0sIDE1MDApO1xuc2V0VGltZW91dChhcHBseV9ob29rcywgMTUwMCk7XG4vL1Rlc3QgdG8gc2VlIGlmIFBsYXllclBhbmVsIGlzIHRoZXJlXG4vL0lmIGl0IGlzIG92ZXJ3cml0ZXMgY3VzdG9tIG9uZVxuLy9PdGhlcndpc2Ugd2hpbGUgbG9vcCAmIHNldCB0aW1lb3V0IHVudGlsIGl0cyB0aGVyZVxuZm9yY2VfYWRkX2N1c3RvbV9wbGF5ZXJfcGFuZWwoKTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==