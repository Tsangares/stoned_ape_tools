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

/***/ "./source/imageutils.js":
/*!******************************!*\
  !*** ./source/imageutils.js ***!
  \******************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "image_url": function() { return /* binding */ image_url; }
/* harmony export */ });
var image_url = function (str) {
    var protocol = "^(https://)";
    var domains = "(i.ibb.co/|i.imgur.com/)";
    var content = "([-#/;&_\\w]{1,150})";
    var images = "(.)(gif|jpe?g|tiff?|png|webp|bmp|GIF|JPE?G|TIFF?|PNG|WEBP|BMP)$";
    var regex = new RegExp(protocol + domains + content + images);
    var unused = "foo";
    return regex.test(str);
};


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
/* harmony import */ var _imageutils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./imageutils */ "./source/imageutils.js");
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






var sat_version = "2.28";
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
var SAT_VERSION = "0.0";
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
                else if ((0,_imageutils__WEBPACK_IMPORTED_MODULE_0__.image_url)(uri)) {
                    s = s.replace(pattern, "<img width=\"100%\" src='".concat(uri, "' />"));
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
setTimeout(Legacy_NeptunesPrideAgent, 1000);
setTimeout(function () {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNEQUFzRDtBQUN0RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMEJBQTBCLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxJQUFJLEdBQUc7QUFDbEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9DQUFvQyxFQUFFLEVBQUUsR0FBRyxHQUFHLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRTtBQUM1RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRDQUE0QyxHQUFHLEdBQUcsR0FBRyxNQUFNLEVBQUUsTUFBTSxFQUFFO0FBQ3JFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMENBQTBDLEdBQUcsVUFBVSxFQUFFO0FBQ3pEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQ0FBc0MsRUFBRSxLQUFLLEdBQUcsR0FBRyxHQUFHLE1BQU0sRUFBRSxNQUFNLEVBQUU7QUFDdEU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBDQUEwQyxFQUFFO0FBQzVDLDRDQUE0QyxHQUFHLFdBQVcsRUFBRTtBQUM1RCw0Q0FBNEMsR0FBRyxXQUFXLEVBQUU7QUFDNUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzREFBc0QsR0FBRyxHQUFHLEVBQUU7QUFDOUQ7QUFDQTtB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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdDQUF3QztBQUN4QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQ0FBc0M7QUFDdEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdEQUFnRDtBQUNoRDtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtDQUFrQyxFQUFFO0FBQ3BDO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUJBQXlCLHNEQUFTO0FBQ2xDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUJBQXVCLHdEQUFpQjtBQUN4QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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QSxpQkFBaUI7QUFDakI7QUFDQTtBQUNBO0FBQ0Esb0JBQW9CLG9EQUFRO0FBQzVCO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0VBQXdFLDJCQUEyQjtBQUNuRztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYixTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUkscURBQVk7QUFDaEIsQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9uZXB0dW5lcy1wcmlkZS1hZ2VudC8uL3NvdXJjZS9jaGF0LnRzIiwid2VicGFjazovL25lcHR1bmVzLXByaWRlLWFnZW50Ly4vc291cmNlL2V2ZW50X2NhY2hlLnRzIiwid2VicGFjazovL25lcHR1bmVzLXByaWRlLWFnZW50Ly4vc291cmNlL2hvdGtleS50cyIsIndlYnBhY2s6Ly9uZXB0dW5lcy1wcmlkZS1hZ2VudC8uL3NvdXJjZS9pbWFnZXV0aWxzLmpzIiwid2VicGFjazovL25lcHR1bmVzLXByaWRlLWFnZW50Ly4vc291cmNlL2xlZGdlci50cyIsIndlYnBhY2s6Ly9uZXB0dW5lcy1wcmlkZS1hZ2VudC8uL3NvdXJjZS9tZXJnZS5qcyIsIndlYnBhY2s6Ly9uZXB0dW5lcy1wcmlkZS1hZ2VudC8uL3NvdXJjZS91dGlsaXRpZXMudHMiLCJ3ZWJwYWNrOi8vbmVwdHVuZXMtcHJpZGUtYWdlbnQvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vbmVwdHVuZXMtcHJpZGUtYWdlbnQvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL25lcHR1bmVzLXByaWRlLWFnZW50L3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vbmVwdHVuZXMtcHJpZGUtYWdlbnQvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9uZXB0dW5lcy1wcmlkZS1hZ2VudC8uL3NvdXJjZS9pbnRlbC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBnZXRfaGVybyB9IGZyb20gXCIuL3V0aWxpdGllc1wiO1xudmFyIFJFU0VBQ0hfTUFQID0ge1xuICAgIHNjYW5uaW5nOiBcIlNjYW5uaW5nXCIsXG4gICAgcHJvcHVsc2lvbjogXCJIeXBlcnNwYWNlIFJhbmdlXCIsXG4gICAgdGVycmFmb3JtaW5nOiBcIlRlcnJhZm9ybWluZ1wiLFxuICAgIHJlc2VhcmNoOiBcIkV4cGVyaW1lbnRhdGlvblwiLFxuICAgIHdlYXBvbnM6IFwiV2VhcG9uc1wiLFxuICAgIGJhbmtpbmc6IFwiQmFua2luZ1wiLFxuICAgIG1hbnVmYWN0dXJpbmc6IFwiTWFudWZhY3R1cmluZ1wiLFxufTtcbi8vRm9yIHF1aWNrIHJlc2VhcmNoIGRpc3BsYXlcbmZ1bmN0aW9uIGdldF9yZXNlYXJjaChnYW1lKSB7XG4gICAgdmFyIHVuaXZlcnNlID0gZ2FtZS51bml2ZXJzZTtcbiAgICB2YXIgaGVybyA9IGdldF9oZXJvKGdhbWUudW5pdmVyc2UpO1xuICAgIHZhciBzY2llbmNlID0gaGVyby50b3RhbF9zY2llbmNlO1xuICAgIC8vQ3VycmVudCBTY2llbmNlXG4gICAgdmFyIGN1cnJlbnQgPSBoZXJvLnRlY2hbaGVyby5yZXNlYXJjaGluZ107XG4gICAgdmFyIGN1cnJlbnRfcG9pbnRzX3JlbWFpbmluZyA9IGN1cnJlbnQuYnJyICogY3VycmVudC5sZXZlbCAtIGN1cnJlbnQucmVzZWFyY2g7XG4gICAgdmFyIGV0YSA9IE1hdGguY2VpbChjdXJyZW50X3BvaW50c19yZW1haW5pbmcgLyBzY2llbmNlKTsgLy9Ib3Vyc1xuICAgIC8vTmV4dCBzY2llbmNlXG4gICAgdmFyIG5leHQgPSBoZXJvLnRlY2hbaGVyby5yZXNlYXJjaGluZ19uZXh0XTtcbiAgICB2YXIgbmV4dF9wb2ludHNfcmVtYWluaW5nID0gbmV4dC5icnIgKiBuZXh0LmxldmVsIC0gbmV4dC5yZXNlYXJjaDtcbiAgICB2YXIgbmV4dF9ldGEgPSBNYXRoLmNlaWwobmV4dF9wb2ludHNfcmVtYWluaW5nIC8gc2NpZW5jZSkgKyBldGE7XG4gICAgdmFyIG5leHRfbGV2ZWwgPSBuZXh0LmxldmVsICsgMTtcbiAgICBpZiAoaGVyby5yZXNlYXJjaGluZyA9PSBoZXJvLnJlc2VhcmNoaW5nX25leHQpIHtcbiAgICAgICAgLy9SZWN1cnJpbmcgcmVzZWFyY2hcbiAgICAgICAgbmV4dF9wb2ludHNfcmVtYWluaW5nICs9IG5leHQuYnJyO1xuICAgICAgICBuZXh0X2V0YSA9IE1hdGguY2VpbCgobmV4dC5icnIgKiBuZXh0LmxldmVsICsgMSkgLyBzY2llbmNlKSArIGV0YTtcbiAgICAgICAgbmV4dF9sZXZlbCArPSAxO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICBjdXJyZW50X25hbWU6IFJFU0VBQ0hfTUFQW2hlcm8ucmVzZWFyY2hpbmddLFxuICAgICAgICBjdXJyZW50X2xldmVsOiBjdXJyZW50W1wibGV2ZWxcIl0gKyAxLFxuICAgICAgICBjdXJyZW50X2V0YTogZXRhLFxuICAgICAgICBuZXh0X25hbWU6IFJFU0VBQ0hfTUFQW2hlcm8ucmVzZWFyY2hpbmdfbmV4dF0sXG4gICAgICAgIG5leHRfbGV2ZWw6IG5leHRfbGV2ZWwsXG4gICAgICAgIG5leHRfZXRhOiBuZXh0X2V0YSxcbiAgICAgICAgc2NpZW5jZTogc2NpZW5jZSxcbiAgICB9O1xufVxuZnVuY3Rpb24gZ2V0X3Jlc2VhcmNoX3RleHQoZ2FtZSkge1xuICAgIHZhciByZXNlYXJjaCA9IGdldF9yZXNlYXJjaChnYW1lKTtcbiAgICB2YXIgZmlyc3RfbGluZSA9IFwiTm93OiBcIi5jb25jYXQocmVzZWFyY2hbXCJjdXJyZW50X25hbWVcIl0sIFwiIFwiKS5jb25jYXQocmVzZWFyY2hbXCJjdXJyZW50X2xldmVsXCJdLCBcIiAtIFwiKS5jb25jYXQocmVzZWFyY2hbXCJjdXJyZW50X2V0YVwiXSwgXCIgdGlja3MuXCIpO1xuICAgIHZhciBzZWNvbmRfbGluZSA9IFwiTmV4dDogXCIuY29uY2F0KHJlc2VhcmNoW1wibmV4dF9uYW1lXCJdLCBcIiBcIikuY29uY2F0KHJlc2VhcmNoW1wibmV4dF9sZXZlbFwiXSwgXCIgLSBcIikuY29uY2F0KHJlc2VhcmNoW1wibmV4dF9ldGFcIl0sIFwiIHRpY2tzLlwiKTtcbiAgICB2YXIgdGhpcmRfbGluZSA9IFwiTXkgU2NpZW5jZTogXCIuY29uY2F0KHJlc2VhcmNoW1wic2NpZW5jZVwiXSk7XG4gICAgcmV0dXJuIFwiXCIuY29uY2F0KGZpcnN0X2xpbmUsIFwiXFxuXCIpLmNvbmNhdChzZWNvbmRfbGluZSwgXCJcXG5cIikuY29uY2F0KHRoaXJkX2xpbmUsIFwiXFxuXCIpO1xufVxuZXhwb3J0IHsgZ2V0X3Jlc2VhcmNoLCBnZXRfcmVzZWFyY2hfdGV4dCB9O1xuIiwiaW1wb3J0IHsgZ2V0X2xlZGdlciB9IGZyb20gXCIuL2xlZGdlclwiO1xuaW1wb3J0IHsgZ2V0X2hlcm8gfSBmcm9tIFwiLi91dGlsaXRpZXNcIjtcbi8vR2xvYmFsIGNhY2hlZCBldmVudCBzeXN0ZW0uXG5leHBvcnQgdmFyIGNhY2hlZF9ldmVudHMgPSBbXTtcbmV4cG9ydCB2YXIgY2FjaGVGZXRjaFN0YXJ0ID0gbmV3IERhdGUoKTtcbmV4cG9ydCB2YXIgY2FjaGVGZXRjaFNpemUgPSAwO1xuLy9Bc3luYyByZXF1ZXN0IGdhbWUgZXZlbnRzXG4vL2dhbWUgaXMgdXNlZCB0byBnZXQgdGhlIGFwaSB2ZXJzaW9uIGFuZCB0aGUgZ2FtZU51bWJlclxuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZV9ldmVudF9jYWNoZShnYW1lLCBjcnV4LCBmZXRjaFNpemUsIHN1Y2Nlc3MsIGVycm9yKSB7XG4gICAgdmFyIGNvdW50ID0gY2FjaGVkX2V2ZW50cy5sZW5ndGggPiAwID8gZmV0Y2hTaXplIDogMTAwMDAwO1xuICAgIGNhY2hlRmV0Y2hTdGFydCA9IG5ldyBEYXRlKCk7XG4gICAgY2FjaGVGZXRjaFNpemUgPSBjb3VudDtcbiAgICB2YXIgcGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh7XG4gICAgICAgIHR5cGU6IFwiZmV0Y2hfZ2FtZV9tZXNzYWdlc1wiLFxuICAgICAgICBjb3VudDogY291bnQudG9TdHJpbmcoKSxcbiAgICAgICAgb2Zmc2V0OiBcIjBcIixcbiAgICAgICAgZ3JvdXA6IFwiZ2FtZV9ldmVudFwiLFxuICAgICAgICB2ZXJzaW9uOiBnYW1lLnZlcnNpb24sXG4gICAgICAgIGdhbWVfbnVtYmVyOiBnYW1lLmdhbWVOdW1iZXIsXG4gICAgfSk7XG4gICAgdmFyIGhlYWRlcnMgPSB7XG4gICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkblwiLFxuICAgIH07XG4gICAgZmV0Y2goXCIvdHJlcXVlc3QvZmV0Y2hfZ2FtZV9tZXNzYWdlc1wiLCB7XG4gICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkXCIsXG4gICAgICAgIH0sXG4gICAgICAgIGJvZHk6IHBhcmFtcyxcbiAgICB9KVxuICAgICAgICAudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHsgcmV0dXJuIHJlc3BvbnNlLmpzb24oKTsgfSlcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7IHJldHVybiBzdWNjZXNzKGdhbWUsIGNydXgsIHJlc3BvbnNlKTsgfSlcbiAgICAgICAgLmNhdGNoKGVycm9yKTtcbn1cbi8vQ3VzdG9tIFVJIENvbXBvbmVudHMgZm9yIExlZGdlclxuZXhwb3J0IGZ1bmN0aW9uIFBsYXllck5hbWVJY29uUm93TGluayhjcnV4LCBucHVpLCBwbGF5ZXIpIHtcbiAgICB2YXIgcGxheWVyTmFtZUljb25Sb3cgPSBjcnV4LldpZGdldChcInJlbCBjb2xfYmxhY2sgY2xpY2thYmxlXCIpLnNpemUoNDgwLCA0OCk7XG4gICAgbnB1aS5QbGF5ZXJJY29uKHBsYXllciwgdHJ1ZSkucm9vc3QocGxheWVyTmFtZUljb25Sb3cpO1xuICAgIGNydXhcbiAgICAgICAgLlRleHQoXCJcIiwgXCJzZWN0aW9uX3RpdGxlXCIpXG4gICAgICAgIC5ncmlkKDYsIDAsIDIxLCAzKVxuICAgICAgICAucmF3SFRNTChcIjxhIG9uY2xpY2s9XFxcIkNydXguY3J1eC50cmlnZ2VyKCdzaG93X3BsYXllcl91aWQnLCAnXCIuY29uY2F0KHBsYXllci51aWQsIFwiJyApXFxcIj5cIikuY29uY2F0KHBsYXllci5hbGlhcywgXCI8L2E+XCIpKVxuICAgICAgICAucm9vc3QocGxheWVyTmFtZUljb25Sb3cpO1xuICAgIHJldHVybiBwbGF5ZXJOYW1lSWNvblJvdztcbn1cbi8vSGFuZGxlciB0byByZWNpZXZlIG5ldyBtZXNzYWdlc1xuZXhwb3J0IGZ1bmN0aW9uIHJlY2lldmVfbmV3X21lc3NhZ2VzKGdhbWUsIGNydXgsIHJlc3BvbnNlKSB7XG4gICAgdmFyIHVuaXZlcnNlID0gZ2FtZS51bml2ZXJzZTtcbiAgICB2YXIgbnB1aSA9IGdhbWUubnB1aTtcbiAgICB2YXIgY2FjaGVGZXRjaEVuZCA9IG5ldyBEYXRlKCk7XG4gICAgdmFyIGVsYXBzZWQgPSBjYWNoZUZldGNoRW5kLmdldFRpbWUoKSAtIGNhY2hlRmV0Y2hTdGFydC5nZXRUaW1lKCk7XG4gICAgY29uc29sZS5sb2coXCJGZXRjaGVkIFwiLmNvbmNhdChjYWNoZUZldGNoU2l6ZSwgXCIgZXZlbnRzIGluIFwiKS5jb25jYXQoZWxhcHNlZCwgXCJtc1wiKSk7XG4gICAgdmFyIGluY29taW5nID0gcmVzcG9uc2UucmVwb3J0Lm1lc3NhZ2VzO1xuICAgIGlmIChjYWNoZWRfZXZlbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdmFyIG92ZXJsYXBPZmZzZXQgPSAtMTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbmNvbWluZy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBpbmNvbWluZ1tpXTtcbiAgICAgICAgICAgIGlmIChtZXNzYWdlLmtleSA9PT0gY2FjaGVkX2V2ZW50c1swXS5rZXkpIHtcbiAgICAgICAgICAgICAgICBvdmVybGFwT2Zmc2V0ID0gaTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAob3ZlcmxhcE9mZnNldCA+PSAwKSB7XG4gICAgICAgICAgICBpbmNvbWluZyA9IGluY29taW5nLnNsaWNlKDAsIG92ZXJsYXBPZmZzZXQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG92ZXJsYXBPZmZzZXQgPCAwKSB7XG4gICAgICAgICAgICB2YXIgc2l6ZSA9IGluY29taW5nLmxlbmd0aCAqIDI7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIk1pc3Npbmcgc29tZSBldmVudHMsIGRvdWJsZSBmZXRjaCB0byBcIi5jb25jYXQoc2l6ZSkpO1xuICAgICAgICAgICAgdXBkYXRlX2V2ZW50X2NhY2hlKGdhbWUsIGNydXgsIHNpemUsIHJlY2lldmVfbmV3X21lc3NhZ2VzLCBjb25zb2xlLmVycm9yKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyB3ZSBoYWQgY2FjaGVkIGV2ZW50cywgYnV0IHdhbnQgdG8gYmUgZXh0cmEgcGFyYW5vaWQgYWJvdXRcbiAgICAgICAgLy8gY29ycmVjdG5lc3MuIFNvIGlmIHRoZSByZXNwb25zZSBjb250YWluZWQgdGhlIGVudGlyZSBldmVudFxuICAgICAgICAvLyBsb2csIHZhbGlkYXRlIHRoYXQgaXQgZXhhY3RseSBtYXRjaGVzIHRoZSBjYWNoZWQgZXZlbnRzLlxuICAgICAgICBpZiAocmVzcG9uc2UucmVwb3J0Lm1lc3NhZ2VzLmxlbmd0aCA9PT0gY2FjaGVkX2V2ZW50cy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiKioqIFZhbGlkYXRpbmcgY2FjaGVkX2V2ZW50cyAqKipcIik7XG4gICAgICAgICAgICB2YXIgdmFsaWRfMSA9IHJlc3BvbnNlLnJlcG9ydC5tZXNzYWdlcztcbiAgICAgICAgICAgIHZhciBpbnZhbGlkRW50cmllcyA9IGNhY2hlZF9ldmVudHMuZmlsdGVyKGZ1bmN0aW9uIChlLCBpKSB7IHJldHVybiBlLmtleSAhPT0gdmFsaWRfMVtpXS5rZXk7IH0pO1xuICAgICAgICAgICAgaWYgKGludmFsaWRFbnRyaWVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCIhISBJbnZhbGlkIGVudHJpZXMgZm91bmQ6IFwiLCBpbnZhbGlkRW50cmllcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIioqKiBWYWxpZGF0aW9uIENvbXBsZXRlZCAqKipcIik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyB0aGUgcmVzcG9uc2UgZGlkbid0IGNvbnRhaW4gdGhlIGVudGlyZSBldmVudCBsb2cuIEdvIGZldGNoXG4gICAgICAgICAgICAvLyBhIHZlcnNpb24gdGhhdCBfZG9lc18uXG4gICAgICAgICAgICB1cGRhdGVfZXZlbnRfY2FjaGUoZ2FtZSwgY3J1eCwgMTAwMDAwLCByZWNpZXZlX25ld19tZXNzYWdlcywgY29uc29sZS5lcnJvcik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY2FjaGVkX2V2ZW50cyA9IGluY29taW5nLmNvbmNhdChjYWNoZWRfZXZlbnRzKTtcbiAgICB2YXIgcGxheWVycyA9IGdldF9sZWRnZXIoZ2FtZSwgY3J1eCwgY2FjaGVkX2V2ZW50cyk7XG4gICAgdmFyIGxlZGdlclNjcmVlbiA9IG5wdWkubGVkZ2VyU2NyZWVuKCk7XG4gICAgbnB1aS5vbkhpZGVTY3JlZW4obnVsbCwgdHJ1ZSk7XG4gICAgbnB1aS5vbkhpZGVTZWxlY3Rpb25NZW51KCk7XG4gICAgbnB1aS50cmlnZ2VyKFwiaGlkZV9zaWRlX21lbnVcIik7XG4gICAgbnB1aS50cmlnZ2VyKFwicmVzZXRfZWRpdF9tb2RlXCIpO1xuICAgIG5wdWkuYWN0aXZlU2NyZWVuID0gbGVkZ2VyU2NyZWVuO1xuICAgIGxlZGdlclNjcmVlbi5yb29zdChucHVpLnNjcmVlbkNvbnRhaW5lcik7XG4gICAgbnB1aS5sYXlvdXRFbGVtZW50KGxlZGdlclNjcmVlbik7XG4gICAgcGxheWVycy5mb3JFYWNoKGZ1bmN0aW9uIChwKSB7XG4gICAgICAgIHZhciBwbGF5ZXIgPSBQbGF5ZXJOYW1lSWNvblJvd0xpbmsoY3J1eCwgbnB1aSwgdW5pdmVyc2UuZ2FsYXh5LnBsYXllcnNbcC51aWRdKS5yb29zdChucHVpLmFjdGl2ZVNjcmVlbik7XG4gICAgICAgIHBsYXllci5hZGRTdHlsZShcInBsYXllcl9jZWxsXCIpO1xuICAgICAgICB2YXIgcHJvbXB0ID0gcC5kZWJ0ID4gMCA/IFwiVGhleSBvd2VcIiA6IFwiWW91IG93ZVwiO1xuICAgICAgICBpZiAocC5kZWJ0ID09IDApIHtcbiAgICAgICAgICAgIHByb21wdCA9IFwiQmFsYW5jZVwiO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwLmRlYnQgPCAwKSB7XG4gICAgICAgICAgICBjcnV4XG4gICAgICAgICAgICAgICAgLlRleHQoXCJcIiwgXCJwYWQxMiB0eHRfcmlnaHQgcmVkLXRleHRcIilcbiAgICAgICAgICAgICAgICAucmF3SFRNTChcIlwiLmNvbmNhdChwcm9tcHQsIFwiOiBcIikuY29uY2F0KHAuZGVidCkpXG4gICAgICAgICAgICAgICAgLmdyaWQoMjAsIDAsIDEwLCAzKVxuICAgICAgICAgICAgICAgIC5yb29zdChwbGF5ZXIpO1xuICAgICAgICAgICAgaWYgKHAuZGVidCAqIC0xIDw9IGdldF9oZXJvKHVuaXZlcnNlKS5jYXNoKSB7XG4gICAgICAgICAgICAgICAgY3J1eFxuICAgICAgICAgICAgICAgICAgICAuQnV0dG9uKFwiZm9yZ2l2ZVwiLCBcImZvcmdpdmVfZGVidFwiLCB7IHRhcmdldFBsYXllcjogcC51aWQgfSlcbiAgICAgICAgICAgICAgICAgICAgLmdyaWQoMTcsIDAsIDYsIDMpXG4gICAgICAgICAgICAgICAgICAgIC5yb29zdChwbGF5ZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHAuZGVidCA+IDApIHtcbiAgICAgICAgICAgIGNydXhcbiAgICAgICAgICAgICAgICAuVGV4dChcIlwiLCBcInBhZDEyIHR4dF9yaWdodCBibHVlLXRleHRcIilcbiAgICAgICAgICAgICAgICAucmF3SFRNTChcIlwiLmNvbmNhdChwcm9tcHQsIFwiOiBcIikuY29uY2F0KHAuZGVidCkpXG4gICAgICAgICAgICAgICAgLmdyaWQoMjAsIDAsIDEwLCAzKVxuICAgICAgICAgICAgICAgIC5yb29zdChwbGF5ZXIpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHAuZGVidCA9PSAwKSB7XG4gICAgICAgICAgICBjcnV4XG4gICAgICAgICAgICAgICAgLlRleHQoXCJcIiwgXCJwYWQxMiB0eHRfcmlnaHQgb3JhbmdlLXRleHRcIilcbiAgICAgICAgICAgICAgICAucmF3SFRNTChcIlwiLmNvbmNhdChwcm9tcHQsIFwiOiBcIikuY29uY2F0KHAuZGVidCkpXG4gICAgICAgICAgICAgICAgLmdyaWQoMjAsIDAsIDEwLCAzKVxuICAgICAgICAgICAgICAgIC5yb29zdChwbGF5ZXIpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5leHBvcnQgZGVmYXVsdCB7XG4gICAgdXBkYXRlX2V2ZW50X2NhY2hlOiB1cGRhdGVfZXZlbnRfY2FjaGUsXG4gICAgcmVjaWV2ZV9uZXdfbWVzc2FnZXM6IHJlY2lldmVfbmV3X21lc3NhZ2VzLFxufTtcbiIsImV4cG9ydCB2YXIgbGFzdENsaXAgPSBcIkVycm9yXCI7XG5leHBvcnQgZnVuY3Rpb24gY2xpcCh0ZXh0KSB7XG4gICAgbGFzdENsaXAgPSB0ZXh0O1xufVxuIiwiZXhwb3J0IHZhciBpbWFnZV91cmwgPSBmdW5jdGlvbiAoc3RyKSB7XG4gICAgdmFyIHByb3RvY29sID0gXCJeKGh0dHBzOi8vKVwiO1xuICAgIHZhciBkb21haW5zID0gXCIoaS5pYmIuY28vfGkuaW1ndXIuY29tLylcIjtcbiAgICB2YXIgY29udGVudCA9IFwiKFstIy87Jl9cXFxcd117MSwxNTB9KVwiO1xuICAgIHZhciBpbWFnZXMgPSBcIiguKShnaWZ8anBlP2d8dGlmZj98cG5nfHdlYnB8Ym1wfEdJRnxKUEU/R3xUSUZGP3xQTkd8V0VCUHxCTVApJFwiO1xuICAgIHZhciByZWdleCA9IG5ldyBSZWdFeHAocHJvdG9jb2wgKyBkb21haW5zICsgY29udGVudCArIGltYWdlcyk7XG4gICAgdmFyIHVudXNlZCA9IFwiZm9vXCI7XG4gICAgcmV0dXJuIHJlZ2V4LnRlc3Qoc3RyKTtcbn07XG4iLCJpbXBvcnQgeyBnZXRfaGVybyB9IGZyb20gXCIuL3V0aWxpdGllc1wiO1xuaW1wb3J0ICogYXMgQ2FjaGUgZnJvbSBcIi4vZXZlbnRfY2FjaGVcIjtcbi8vR2V0IGxlZGdlciBpbmZvIHRvIHNlZSB3aGF0IGlzIG93ZWRcbi8vQWN0dWFsbHkgc2hvd3MgdGhlIHBhbmVsIG9mIGxvYWRpbmdcbmV4cG9ydCBmdW5jdGlvbiBnZXRfbGVkZ2VyKGdhbWUsIGNydXgsIG1lc3NhZ2VzKSB7XG4gICAgdmFyIG5wdWkgPSBnYW1lLm5wdWk7XG4gICAgdmFyIHVuaXZlcnNlID0gZ2FtZS51bml2ZXJzZTtcbiAgICB2YXIgcGxheWVycyA9IHVuaXZlcnNlLmdhbGF4eS5wbGF5ZXJzO1xuICAgIHZhciBsb2FkaW5nID0gY3J1eFxuICAgICAgICAuVGV4dChcIlwiLCBcInJlbCB0eHRfY2VudGVyIHBhZDEyXCIpXG4gICAgICAgIC5yYXdIVE1MKFwiUGFyc2luZyBcIi5jb25jYXQobWVzc2FnZXMubGVuZ3RoLCBcIiBtZXNzYWdlcy5cIikpO1xuICAgIGxvYWRpbmcucm9vc3QobnB1aS5hY3RpdmVTY3JlZW4pO1xuICAgIHZhciB1aWQgPSBnZXRfaGVybyh1bml2ZXJzZSkudWlkO1xuICAgIC8vTGVkZ2VyIGlzIGEgbGlzdCBvZiBkZWJ0c1xuICAgIHZhciBsZWRnZXIgPSB7fTtcbiAgICBtZXNzYWdlc1xuICAgICAgICAuZmlsdGVyKGZ1bmN0aW9uIChtKSB7XG4gICAgICAgIHJldHVybiBtLnBheWxvYWQudGVtcGxhdGUgPT0gXCJtb25leV9zZW50XCIgfHxcbiAgICAgICAgICAgIG0ucGF5bG9hZC50ZW1wbGF0ZSA9PSBcInNoYXJlZF90ZWNobm9sb2d5XCI7XG4gICAgfSlcbiAgICAgICAgLm1hcChmdW5jdGlvbiAobSkgeyByZXR1cm4gbS5wYXlsb2FkOyB9KVxuICAgICAgICAuZm9yRWFjaChmdW5jdGlvbiAobSkge1xuICAgICAgICB2YXIgbGlhaXNvbiA9IG0uZnJvbV9wdWlkID09IHVpZCA/IG0udG9fcHVpZCA6IG0uZnJvbV9wdWlkO1xuICAgICAgICB2YXIgdmFsdWUgPSBtLnRlbXBsYXRlID09IFwibW9uZXlfc2VudFwiID8gbS5hbW91bnQgOiBtLnByaWNlO1xuICAgICAgICB2YWx1ZSAqPSBtLmZyb21fcHVpZCA9PSB1aWQgPyAxIDogLTE7IC8vIGFtb3VudCBpcyAoKykgaWYgY3JlZGl0ICYgKC0pIGlmIGRlYnRcbiAgICAgICAgbGlhaXNvbiBpbiBsZWRnZXJcbiAgICAgICAgICAgID8gKGxlZGdlcltsaWFpc29uXSArPSB2YWx1ZSlcbiAgICAgICAgICAgIDogKGxlZGdlcltsaWFpc29uXSA9IHZhbHVlKTtcbiAgICB9KTtcbiAgICAvL1RPRE86IFJldmlldyB0aGF0IHRoaXMgaXMgY29ycmVjdGx5IGZpbmRpbmcgYSBsaXN0IG9mIG9ubHkgcGVvcGxlIHdobyBoYXZlIGRlYnRzLlxuICAgIC8vQWNjb3VudHMgYXJlIHRoZSBjcmVkaXQgb3IgZGViaXQgcmVsYXRlZCB0byBlYWNoIHVzZXJcbiAgICB2YXIgYWNjb3VudHMgPSBbXTtcbiAgICBmb3IgKHZhciB1aWRfMSBpbiBsZWRnZXIpIHtcbiAgICAgICAgdmFyIHBsYXllciA9IHBsYXllcnNbcGFyc2VJbnQodWlkXzEpXTtcbiAgICAgICAgcGxheWVyLmRlYnQgPSBsZWRnZXJbdWlkXzFdO1xuICAgICAgICBhY2NvdW50cy5wdXNoKHBsYXllcik7XG4gICAgfVxuICAgIGdldF9oZXJvKHVuaXZlcnNlKS5sZWRnZXIgPSBsZWRnZXI7XG4gICAgY29uc29sZS5sb2coYWNjb3VudHMpO1xuICAgIHJldHVybiBhY2NvdW50cztcbn1cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJMZWRnZXIoZ2FtZSwgY3J1eCwgTW91c2VUcmFwKSB7XG4gICAgLy9EZWNvbnN0cnVjdGlvbiBvZiBkaWZmZXJlbnQgY29tcG9uZW50cyBvZiB0aGUgZ2FtZS5cbiAgICB2YXIgY29uZmlnID0gZ2FtZS5jb25maWc7XG4gICAgdmFyIG5wID0gZ2FtZS5ucDtcbiAgICB2YXIgbnB1aSA9IGdhbWUubnB1aTtcbiAgICB2YXIgdW5pdmVyc2UgPSBnYW1lLnVuaXZlcnNlO1xuICAgIHZhciB0ZW1wbGF0ZXMgPSBnYW1lLnRlbXBsYXRlcztcbiAgICB2YXIgcGxheWVycyA9IHVuaXZlcnNlLmdhbGF4eS5wbGF5ZXJzO1xuICAgIE1vdXNlVHJhcC5iaW5kKFtcIm1cIiwgXCJNXCJdLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIG5wLnRyaWdnZXIoXCJ0cmlnZ2VyX2xlZGdlclwiKTtcbiAgICB9KTtcbiAgICB0ZW1wbGF0ZXNbXCJsZWRnZXJcIl0gPSBcIkxlZGdlclwiO1xuICAgIHRlbXBsYXRlc1tcInRlY2hfdHJhZGluZ1wiXSA9IFwiVHJhZGluZyBUZWNobm9sb2d5XCI7XG4gICAgdGVtcGxhdGVzW1wiZm9yZ2l2ZVwiXSA9IFwiUGF5IERlYnRcIjtcbiAgICB0ZW1wbGF0ZXNbXCJmb3JnaXZlX2RlYnRcIl0gPSBcIkFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBmb3JnaXZlIHRoaXMgZGVidD9cIjtcbiAgICBpZiAoIW5wdWkuaGFzbWVudWl0ZW0pIHtcbiAgICAgICAgbnB1aVxuICAgICAgICAgICAgLlNpZGVNZW51SXRlbShcImljb24tZGF0YWJhc2VcIiwgXCJsZWRnZXJcIiwgXCJ0cmlnZ2VyX2xlZGdlclwiKVxuICAgICAgICAgICAgLnJvb3N0KG5wdWkuc2lkZU1lbnUpO1xuICAgICAgICBucHVpLmhhc21lbnVpdGVtID0gdHJ1ZTtcbiAgICB9XG4gICAgbnB1aS5sZWRnZXJTY3JlZW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBucHVpLlNjcmVlbihcImxlZGdlclwiKTtcbiAgICB9O1xuICAgIG5wLm9uKFwidHJpZ2dlcl9sZWRnZXJcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgbGVkZ2VyU2NyZWVuID0gbnB1aS5sZWRnZXJTY3JlZW4oKTtcbiAgICAgICAgdmFyIGxvYWRpbmcgPSBjcnV4XG4gICAgICAgICAgICAuVGV4dChcIlwiLCBcInJlbCB0eHRfY2VudGVyIHBhZDEyIHNlY3Rpb25fdGl0bGVcIilcbiAgICAgICAgICAgIC5yYXdIVE1MKFwiVGFidWxhdGluZyBMZWRnZXIuLi5cIik7XG4gICAgICAgIGxvYWRpbmcucm9vc3QobGVkZ2VyU2NyZWVuKTtcbiAgICAgICAgbnB1aS5vbkhpZGVTY3JlZW4obnVsbCwgdHJ1ZSk7XG4gICAgICAgIG5wdWkub25IaWRlU2VsZWN0aW9uTWVudSgpO1xuICAgICAgICBucHVpLnRyaWdnZXIoXCJoaWRlX3NpZGVfbWVudVwiKTtcbiAgICAgICAgbnB1aS50cmlnZ2VyKFwicmVzZXRfZWRpdF9tb2RlXCIpO1xuICAgICAgICBucHVpLmFjdGl2ZVNjcmVlbiA9IGxlZGdlclNjcmVlbjtcbiAgICAgICAgbGVkZ2VyU2NyZWVuLnJvb3N0KG5wdWkuc2NyZWVuQ29udGFpbmVyKTtcbiAgICAgICAgbnB1aS5sYXlvdXRFbGVtZW50KGxlZGdlclNjcmVlbik7XG4gICAgICAgIENhY2hlLnVwZGF0ZV9ldmVudF9jYWNoZShnYW1lLCBjcnV4LCA0LCBDYWNoZS5yZWNpZXZlX25ld19tZXNzYWdlcywgY29uc29sZS5lcnJvcik7XG4gICAgfSk7XG4gICAgLy9XaHkgbm90IG5wLm9uKFwiRm9yZ2l2ZURlYnRcIik/XG4gICAgbnAub25Gb3JnaXZlRGVidCA9IGZ1bmN0aW9uIChldmVudCwgZGF0YSkge1xuICAgICAgICB2YXIgdGFyZ2V0UGxheWVyID0gZGF0YS50YXJnZXRQbGF5ZXI7XG4gICAgICAgIHZhciBwbGF5ZXIgPSBwbGF5ZXJzW3RhcmdldFBsYXllcl07XG4gICAgICAgIHZhciBhbW91bnQgPSBwbGF5ZXIuZGVidCAqIC0xO1xuICAgICAgICAvL2xldCBhbW91bnQgPSAxXG4gICAgICAgIHVuaXZlcnNlLnBsYXllci5sZWRnZXJbdGFyZ2V0UGxheWVyXSA9IDA7XG4gICAgICAgIG5wLnRyaWdnZXIoXCJzaG93X3NjcmVlblwiLCBbXG4gICAgICAgICAgICBcImNvbmZpcm1cIixcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBcImZvcmdpdmVfZGVidFwiLFxuICAgICAgICAgICAgICAgIGV2ZW50S2luZDogXCJjb25maXJtX2ZvcmdpdmVfZGVidFwiLFxuICAgICAgICAgICAgICAgIGV2ZW50RGF0YToge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiBcIm9yZGVyXCIsXG4gICAgICAgICAgICAgICAgICAgIG9yZGVyOiBcInNlbmRfbW9uZXksXCIuY29uY2F0KHRhcmdldFBsYXllciwgXCIsXCIpLmNvbmNhdChhbW91bnQpLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICBdKTtcbiAgICB9O1xuICAgIG5wLm9uKFwiY29uZmlybV9mb3JnaXZlX2RlYnRcIiwgZnVuY3Rpb24gKGV2ZW50LCBkYXRhKSB7XG4gICAgICAgIG5wLnRyaWdnZXIoXCJzZXJ2ZXJfcmVxdWVzdFwiLCBkYXRhKTtcbiAgICAgICAgbnAudHJpZ2dlcihcInRyaWdnZXJfbGVkZ2VyXCIpO1xuICAgIH0pO1xuICAgIG5wLm9uKFwiZm9yZ2l2ZV9kZWJ0XCIsIG5wLm9uRm9yZ2l2ZURlYnQpO1xufVxuIiwidmFyIF9fYXNzaWduID0gKHRoaXMgJiYgdGhpcy5fX2Fzc2lnbikgfHwgZnVuY3Rpb24gKCkge1xuICAgIF9fYXNzaWduID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbih0KSB7XG4gICAgICAgIGZvciAodmFyIHMsIGkgPSAxLCBuID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IG47IGkrKykge1xuICAgICAgICAgICAgcyA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgICAgIGZvciAodmFyIHAgaW4gcykgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzLCBwKSlcbiAgICAgICAgICAgICAgICB0W3BdID0gc1twXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdDtcbiAgICB9O1xuICAgIHJldHVybiBfX2Fzc2lnbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufTtcbmZ1bmN0aW9uIG1lcmdlVXNlcihldmVudCwgZGF0YSkge1xuICAgIGlmIChOZXB0dW5lc1ByaWRlLm9yaWdpbmFsUGxheWVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgTmVwdHVuZXNQcmlkZS5vcmlnaW5hbFBsYXllciA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2UucGxheWVyLnVpZDtcbiAgICB9XG4gICAgdmFyIGNvZGUgPSAoZGF0YSA9PT0gbnVsbCB8fCBkYXRhID09PSB2b2lkIDAgPyB2b2lkIDAgOiBkYXRhLnNwbGl0KFwiOlwiKVsxXSkgfHwgb3RoZXJVc2VyQ29kZTtcbiAgICB2YXIgb3RoZXJVc2VyQ29kZSA9IGNvZGU7XG4gICAgaWYgKG90aGVyVXNlckNvZGUpIHtcbiAgICAgICAgdmFyIHBhcmFtcyA9IHtcbiAgICAgICAgICAgIGdhbWVfbnVtYmVyOiBnYW1lLFxuICAgICAgICAgICAgYXBpX3ZlcnNpb246IFwiMC4xXCIsXG4gICAgICAgICAgICBjb2RlOiBvdGhlclVzZXJDb2RlLFxuICAgICAgICB9O1xuICAgICAgICB2YXIgZWdnZXJzID0galF1ZXJ5LmFqYXgoe1xuICAgICAgICAgICAgdHlwZTogXCJQT1NUXCIsXG4gICAgICAgICAgICB1cmw6IFwiaHR0cHM6Ly9ucC5pcm9uaGVsbWV0LmNvbS9hcGlcIixcbiAgICAgICAgICAgIGFzeW5jOiBmYWxzZSxcbiAgICAgICAgICAgIGRhdGE6IHBhcmFtcyxcbiAgICAgICAgICAgIGRhdGFUeXBlOiBcImpzb25cIixcbiAgICAgICAgfSk7XG4gICAgICAgIHZhciB1bml2ZXJzZSA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2U7XG4gICAgICAgIHZhciBzY2FuID0gZWdnZXJzLnJlc3BvbnNlSlNPTi5zY2FubmluZ19kYXRhO1xuICAgICAgICB1bml2ZXJzZS5nYWxheHkuc3RhcnMgPSBfX2Fzc2lnbihfX2Fzc2lnbih7fSwgc2Nhbi5zdGFycyksIHVuaXZlcnNlLmdhbGF4eS5zdGFycyk7XG4gICAgICAgIGZvciAodmFyIHMgaW4gc2Nhbi5zdGFycykge1xuICAgICAgICAgICAgdmFyIHN0YXIgPSBzY2FuLnN0YXJzW3NdO1xuICAgICAgICAgICAgLy9BZGQgaGVyZSBhIHN0YXRlbWVudCB0byBza2lwIGlmIGl0IGlzIGhlcm8ncyBzdGFyLlxuICAgICAgICAgICAgaWYgKHN0YXIudiAhPT0gXCIwXCIpIHtcbiAgICAgICAgICAgICAgICB1bml2ZXJzZS5nYWxheHkuc3RhcnNbc10gPSBfX2Fzc2lnbihfX2Fzc2lnbih7fSwgdW5pdmVyc2UuZ2FsYXh5LnN0YXJzW3NdKSwgc3Rhcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdW5pdmVyc2UuZ2FsYXh5LmZsZWV0cyA9IF9fYXNzaWduKF9fYXNzaWduKHt9LCBzY2FuLmZsZWV0cyksIHVuaXZlcnNlLmdhbGF4eS5mbGVldHMpO1xuICAgICAgICBOZXB0dW5lc1ByaWRlLm5wLm9uRnVsbFVuaXZlcnNlKG51bGwsIHVuaXZlcnNlLmdhbGF4eSk7XG4gICAgICAgIE5lcHR1bmVzUHJpZGUubnB1aS5vbkhpZGVTY3JlZW4obnVsbCwgdHJ1ZSk7XG4gICAgICAgIGluaXQoKTtcbiAgICB9XG59XG5leHBvcnQgeyBtZXJnZVVzZXIgfTtcbiIsImV4cG9ydCBmdW5jdGlvbiBnZXRfaGVybyh1bml2ZXJzZSkge1xuICAgIHJldHVybiB1bml2ZXJzZS5wbGF5ZXI7XG59XG5leHBvcnQgZGVmYXVsdCB7IGdldF9oZXJvOiBnZXRfaGVybyB9O1xuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIGRlZmluaXRpb24pIHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqLCBwcm9wKSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKTsgfSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwidmFyIF9fYXNzaWduID0gKHRoaXMgJiYgdGhpcy5fX2Fzc2lnbikgfHwgZnVuY3Rpb24gKCkge1xuICAgIF9fYXNzaWduID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbih0KSB7XG4gICAgICAgIGZvciAodmFyIHMsIGkgPSAxLCBuID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IG47IGkrKykge1xuICAgICAgICAgICAgcyA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgICAgIGZvciAodmFyIHAgaW4gcykgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzLCBwKSlcbiAgICAgICAgICAgICAgICB0W3BdID0gc1twXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdDtcbiAgICB9O1xuICAgIHJldHVybiBfX2Fzc2lnbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufTtcbnZhciBfX2F3YWl0ZXIgPSAodGhpcyAmJiB0aGlzLl9fYXdhaXRlcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XG4gICAgfSk7XG59O1xudmFyIF9fZ2VuZXJhdG9yID0gKHRoaXMgJiYgdGhpcy5fX2dlbmVyYXRvcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIGJvZHkpIHtcbiAgICB2YXIgXyA9IHsgbGFiZWw6IDAsIHNlbnQ6IGZ1bmN0aW9uKCkgeyBpZiAodFswXSAmIDEpIHRocm93IHRbMV07IHJldHVybiB0WzFdOyB9LCB0cnlzOiBbXSwgb3BzOiBbXSB9LCBmLCB5LCB0LCBnO1xuICAgIHJldHVybiBnID0geyBuZXh0OiB2ZXJiKDApLCBcInRocm93XCI6IHZlcmIoMSksIFwicmV0dXJuXCI6IHZlcmIoMikgfSwgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIChnW1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXM7IH0pLCBnO1xuICAgIGZ1bmN0aW9uIHZlcmIobikgeyByZXR1cm4gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIHN0ZXAoW24sIHZdKTsgfTsgfVxuICAgIGZ1bmN0aW9uIHN0ZXAob3ApIHtcbiAgICAgICAgaWYgKGYpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJHZW5lcmF0b3IgaXMgYWxyZWFkeSBleGVjdXRpbmcuXCIpO1xuICAgICAgICB3aGlsZSAoZyAmJiAoZyA9IDAsIG9wWzBdICYmIChfID0gMCkpLCBfKSB0cnkge1xuICAgICAgICAgICAgaWYgKGYgPSAxLCB5ICYmICh0ID0gb3BbMF0gJiAyID8geVtcInJldHVyblwiXSA6IG9wWzBdID8geVtcInRocm93XCJdIHx8ICgodCA9IHlbXCJyZXR1cm5cIl0pICYmIHQuY2FsbCh5KSwgMCkgOiB5Lm5leHQpICYmICEodCA9IHQuY2FsbCh5LCBvcFsxXSkpLmRvbmUpIHJldHVybiB0O1xuICAgICAgICAgICAgaWYgKHkgPSAwLCB0KSBvcCA9IFtvcFswXSAmIDIsIHQudmFsdWVdO1xuICAgICAgICAgICAgc3dpdGNoIChvcFswXSkge1xuICAgICAgICAgICAgICAgIGNhc2UgMDogY2FzZSAxOiB0ID0gb3A7IGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgNDogXy5sYWJlbCsrOyByZXR1cm4geyB2YWx1ZTogb3BbMV0sIGRvbmU6IGZhbHNlIH07XG4gICAgICAgICAgICAgICAgY2FzZSA1OiBfLmxhYmVsKys7IHkgPSBvcFsxXTsgb3AgPSBbMF07IGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIGNhc2UgNzogb3AgPSBfLm9wcy5wb3AoKTsgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICBpZiAoISh0ID0gXy50cnlzLCB0ID0gdC5sZW5ndGggPiAwICYmIHRbdC5sZW5ndGggLSAxXSkgJiYgKG9wWzBdID09PSA2IHx8IG9wWzBdID09PSAyKSkgeyBfID0gMDsgY29udGludWU7IH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wWzBdID09PSAzICYmICghdCB8fCAob3BbMV0gPiB0WzBdICYmIG9wWzFdIDwgdFszXSkpKSB7IF8ubGFiZWwgPSBvcFsxXTsgYnJlYWs7IH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wWzBdID09PSA2ICYmIF8ubGFiZWwgPCB0WzFdKSB7IF8ubGFiZWwgPSB0WzFdOyB0ID0gb3A7IGJyZWFrOyB9XG4gICAgICAgICAgICAgICAgICAgIGlmICh0ICYmIF8ubGFiZWwgPCB0WzJdKSB7IF8ubGFiZWwgPSB0WzJdOyBfLm9wcy5wdXNoKG9wKTsgYnJlYWs7IH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRbMl0pIF8ub3BzLnBvcCgpO1xuICAgICAgICAgICAgICAgICAgICBfLnRyeXMucG9wKCk7IGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb3AgPSBib2R5LmNhbGwodGhpc0FyZywgXyk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHsgb3AgPSBbNiwgZV07IHkgPSAwOyB9IGZpbmFsbHkgeyBmID0gdCA9IDA7IH1cbiAgICAgICAgaWYgKG9wWzBdICYgNSkgdGhyb3cgb3BbMV07IHJldHVybiB7IHZhbHVlOiBvcFswXSA/IG9wWzFdIDogdm9pZCAwLCBkb25lOiB0cnVlIH07XG4gICAgfVxufTtcbmltcG9ydCB7IGltYWdlX3VybCB9IGZyb20gXCIuL2ltYWdldXRpbHNcIjtcbmltcG9ydCB7IGNsaXAsIGxhc3RDbGlwIH0gZnJvbSBcIi4vaG90a2V5XCI7XG5pbXBvcnQgeyBnZXRfaGVybyB9IGZyb20gXCIuL3V0aWxpdGllc1wiO1xuaW1wb3J0IHsgcmVuZGVyTGVkZ2VyIH0gZnJvbSBcIi4vbGVkZ2VyXCI7XG5pbXBvcnQgeyBtZXJnZVVzZXIgfSBmcm9tIFwiLi9tZXJnZVwiO1xuaW1wb3J0IHsgZ2V0X3Jlc2VhcmNoX3RleHQgfSBmcm9tIFwiLi9jaGF0XCI7XG52YXIgc2F0X3ZlcnNpb24gPSBcIjIuMjhcIjtcbmZ1bmN0aW9uIG1vZGlmeV9jdXN0b21fZ2FtZSgpIHtcbiAgICBjb25zb2xlLmxvZyhcIlJ1bm5pbmcgY3VzdG9tIGdhbWUgc2V0dGluZ3MgbW9kaWZpY2F0aW9uXCIpO1xuICAgIHZhciBzZWxlY3RvciA9ICQoXCIjY29udGVudEFyZWEgPiBkaXYgPiBkaXYud2lkZ2V0LmZ1bGxzY3JlZW4gPiBkaXYud2lkZ2V0LnJlbCA+IGRpdjpudGgtY2hpbGQoNCkgPiBkaXY6bnRoLWNoaWxkKDE1KSA+IHNlbGVjdFwiKVswXTtcbiAgICBpZiAoc2VsZWN0b3IgPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIC8vTm90IGluIG1lbnVcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGV4dFN0cmluZyA9IFwiXCI7XG4gICAgZm9yICh2YXIgaSA9IDI7IGkgPD0gMzI7ICsraSkge1xuICAgICAgICB0ZXh0U3RyaW5nICs9IFwiPG9wdGlvbiB2YWx1ZT1cXFwiXCIuY29uY2F0KGksIFwiXFxcIj5cIikuY29uY2F0KGksIFwiIFBsYXllcnM8L29wdGlvbj5cIik7XG4gICAgfVxuICAgIGNvbnNvbGUubG9nKHRleHRTdHJpbmcpO1xuICAgIHNlbGVjdG9yLmlubmVySFRNTCA9IHRleHRTdHJpbmc7XG59XG5zZXRUaW1lb3V0KG1vZGlmeV9jdXN0b21fZ2FtZSwgNTAwKTtcbi8vVE9ETzogTWFrZSBpcyB3aXRoaW4gc2Nhbm5pbmcgZnVuY3Rpb25cbnZhciBTQVRfVkVSU0lPTiA9IFwiMC4wXCI7XG4vL1NoYXJlIGFsbCB0ZWNoIGRpc3BsYXkgYXMgdGVjaCBpcyBhY3RpdmVseSB0cmFkaW5nLlxudmFyIGRpc3BsYXlfdGVjaF90cmFkaW5nID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBucHVpID0gTmVwdHVuZXNQcmlkZS5ucHVpO1xuICAgIHZhciB0ZWNoX3RyYWRlX3NjcmVlbiA9IG5wdWkuU2NyZWVuKFwidGVjaF90cmFkaW5nXCIpO1xuICAgIG5wdWkub25IaWRlU2NyZWVuKG51bGwsIHRydWUpO1xuICAgIG5wdWkub25IaWRlU2VsZWN0aW9uTWVudSgpO1xuICAgIG5wdWkudHJpZ2dlcihcImhpZGVfc2lkZV9tZW51XCIpO1xuICAgIG5wdWkudHJpZ2dlcihcInJlc2V0X2VkaXRfbW9kZVwiKTtcbiAgICBucHVpLmFjdGl2ZVNjcmVlbiA9IHRlY2hfdHJhZGVfc2NyZWVuO1xuICAgIHRlY2hfdHJhZGVfc2NyZWVuLnJvb3N0KG5wdWkuc2NyZWVuQ29udGFpbmVyKTtcbiAgICBucHVpLmxheW91dEVsZW1lbnQodGVjaF90cmFkZV9zY3JlZW4pO1xuICAgIHZhciB0cmFkaW5nID0gQ3J1eC5UZXh0KFwiXCIsIFwicmVsIHBhZDEyXCIpLnJhd0hUTUwoXCJUcmFkaW5nLi5cIik7XG4gICAgdHJhZGluZy5yb29zdCh0ZWNoX3RyYWRlX3NjcmVlbik7XG4gICAgdGVjaF90cmFkZV9zY3JlZW4udHJhbnNhY3QgPSBmdW5jdGlvbiAodGV4dCkge1xuICAgICAgICB2YXIgdHJhZGluZyA9IENydXguVGV4dChcIlwiLCBcInJlbCBwYWQ4XCIpLnJhd0hUTUwodGV4dCk7XG4gICAgICAgIHRyYWRpbmcucm9vc3QodGVjaF90cmFkZV9zY3JlZW4pO1xuICAgIH07XG4gICAgcmV0dXJuIHRlY2hfdHJhZGVfc2NyZWVuO1xufTtcbnZhciBfZ2V0X3N0YXJfZ2lzID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBzdGFycyA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2UuZ2FsYXh5LnN0YXJzO1xuICAgIHZhciBvdXRwdXQgPSBbXTtcbiAgICBmb3IgKHZhciBzIGluIHN0YXJzKSB7XG4gICAgICAgIHZhciBzdGFyID0gc3RhcnNbc107XG4gICAgICAgIG91dHB1dC5wdXNoKHtcbiAgICAgICAgICAgIHg6IHN0YXIueCxcbiAgICAgICAgICAgIHk6IHN0YXIueSxcbiAgICAgICAgICAgIG93bmVyOiBzdGFyLnF1YWxpZmllZEFsaWFzLFxuICAgICAgICAgICAgZWNvbm9teTogc3Rhci5lLFxuICAgICAgICAgICAgaW5kdXN0cnk6IHN0YXIuaSxcbiAgICAgICAgICAgIHNjaWVuY2U6IHN0YXIucyxcbiAgICAgICAgICAgIHNoaXBzOiBzdGFyLnRvdGFsRGVmZW5zZXMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gb3V0cHV0O1xufTtcbnZhciBfZ2V0X3dlYXBvbnNfbmV4dCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcmVzZWFyY2ggPSBnZXRfcmVzZWFyY2goKTtcbiAgICBpZiAocmVzZWFyY2hbXCJjdXJyZW50X25hbWVcIl0gPT0gXCJXZWFwb25zXCIpIHtcbiAgICAgICAgcmV0dXJuIHJlc2VhcmNoW1wiY3VycmVudF9ldGFcIl07XG4gICAgfVxuICAgIGVsc2UgaWYgKHJlc2VhcmNoW1wibmV4dF9uYW1lXCJdID09IFwiV2VhcG9uc1wiKSB7XG4gICAgICAgIHJldHVybiByZXNlYXJjaFtcIm5leHRfZXRhXCJdO1xuICAgIH1cbiAgICByZXR1cm4gTWF0aC5wb3coMTAsIDEwKTtcbn07XG52YXIgZ2V0X3RlY2hfdHJhZGVfY29zdCA9IGZ1bmN0aW9uIChmcm9tLCB0bywgdGVjaF9uYW1lKSB7XG4gICAgaWYgKHRlY2hfbmFtZSA9PT0gdm9pZCAwKSB7IHRlY2hfbmFtZSA9IG51bGw7IH1cbiAgICB2YXIgdG90YWxfY29zdCA9IDA7XG4gICAgZm9yICh2YXIgX2kgPSAwLCBfYSA9IE9iamVjdC5lbnRyaWVzKHRvLnRlY2gpOyBfaSA8IF9hLmxlbmd0aDsgX2krKykge1xuICAgICAgICB2YXIgX2IgPSBfYVtfaV0sIHRlY2ggPSBfYlswXSwgdmFsdWUgPSBfYlsxXTtcbiAgICAgICAgaWYgKHRlY2hfbmFtZSA9PSBudWxsIHx8IHRlY2hfbmFtZSA9PSB0ZWNoKSB7XG4gICAgICAgICAgICB2YXIgbWUgPSBmcm9tLnRlY2hbdGVjaF0ubGV2ZWw7XG4gICAgICAgICAgICB2YXIgeW91ID0gdmFsdWUubGV2ZWw7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8PSBtZSAtIHlvdTsgKytpKSB7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyh0ZWNoLCh5b3UraSksKHlvdStpKSoxNSlcbiAgICAgICAgICAgICAgICB0b3RhbF9jb3N0ICs9ICh5b3UgKyBpKSAqIE5lcHR1bmVzUHJpZGUuZ2FtZUNvbmZpZy50cmFkZUNvc3Q7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRvdGFsX2Nvc3Q7XG59O1xuLy9Ib29rcyB0byBidXR0b25zIGZvciBzaGFyaW5nIGFuZCBidXlpbmdcbnZhciBhcHBseV9ob29rcyA9IGZ1bmN0aW9uICgpIHtcbiAgICBOZXB0dW5lc1ByaWRlLm5wLm9uKFwic2hhcmVfYWxsX3RlY2hcIiwgZnVuY3Rpb24gKGV2ZW50LCBwbGF5ZXIpIHtcbiAgICAgICAgdmFyIHRvdGFsX2Nvc3QgPSBnZXRfdGVjaF90cmFkZV9jb3N0KGdldF9oZXJvKE5lcHR1bmVzUHJpZGUudW5pdmVyc2UpLCBwbGF5ZXIpO1xuICAgICAgICBOZXB0dW5lc1ByaWRlLnRlbXBsYXRlc1tcImNvbmZpcm1fdGVjaF9zaGFyZV9cIi5jb25jYXQocGxheWVyLnVpZCldID0gXCJBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gc3BlbmQgJFwiLmNvbmNhdCh0b3RhbF9jb3N0LCBcIiB0byBnaXZlIFwiKS5jb25jYXQocGxheWVyLnJhd0FsaWFzLCBcIiBhbGwgb2YgeW91ciB0ZWNoP1wiKTtcbiAgICAgICAgTmVwdHVuZXNQcmlkZS5ucC50cmlnZ2VyKFwic2hvd19zY3JlZW5cIiwgW1xuICAgICAgICAgICAgXCJjb25maXJtXCIsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZTogXCJjb25maXJtX3RlY2hfc2hhcmVfXCIuY29uY2F0KHBsYXllci51aWQpLFxuICAgICAgICAgICAgICAgIGV2ZW50S2luZDogXCJjb25maXJtX3RyYWRlX3RlY2hcIixcbiAgICAgICAgICAgICAgICBldmVudERhdGE6IHBsYXllcixcbiAgICAgICAgICAgIH0sXG4gICAgICAgIF0pO1xuICAgIH0pO1xuICAgIE5lcHR1bmVzUHJpZGUubnAub24oXCJidXlfYWxsX3RlY2hcIiwgZnVuY3Rpb24gKGV2ZW50LCBkYXRhKSB7XG4gICAgICAgIHZhciBwbGF5ZXIgPSBkYXRhLnBsYXllcjtcbiAgICAgICAgdmFyIGNvc3QgPSBkYXRhLmNvc3Q7XG4gICAgICAgIE5lcHR1bmVzUHJpZGUudGVtcGxhdGVzW1wiY29uZmlybV90ZWNoX3NoYXJlX1wiLmNvbmNhdChwbGF5ZXIudWlkKV0gPSBcIkFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBzcGVuZCAkXCIuY29uY2F0KGNvc3QsIFwiIHRvIGJ1eSBhbGwgb2YgXCIpLmNvbmNhdChwbGF5ZXIucmF3QWxpYXMsIFwiJ3MgdGVjaD8gSXQgaXMgdXAgdG8gdGhlbSB0byBhY3R1YWxseSBzZW5kIGl0IHRvIHlvdS5cIik7XG4gICAgICAgIE5lcHR1bmVzUHJpZGUubnAudHJpZ2dlcihcInNob3dfc2NyZWVuXCIsIFtcbiAgICAgICAgICAgIFwiY29uZmlybVwiLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IFwiY29uZmlybV90ZWNoX3NoYXJlX1wiLmNvbmNhdChwbGF5ZXIudWlkKSxcbiAgICAgICAgICAgICAgICBldmVudEtpbmQ6IFwiY29uZmlybV9idXlfdGVjaFwiLFxuICAgICAgICAgICAgICAgIGV2ZW50RGF0YTogZGF0YSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIF0pO1xuICAgIH0pO1xuICAgIE5lcHR1bmVzUHJpZGUubnAub24oXCJidXlfb25lX3RlY2hcIiwgZnVuY3Rpb24gKGV2ZW50LCBkYXRhKSB7XG4gICAgICAgIHZhciBwbGF5ZXIgPSBkYXRhLnBsYXllcjtcbiAgICAgICAgdmFyIHRlY2ggPSBkYXRhLnRlY2g7XG4gICAgICAgIHZhciBjb3N0ID0gZGF0YS5jb3N0O1xuICAgICAgICBjb25zb2xlLmxvZyhwbGF5ZXIpO1xuICAgICAgICBOZXB0dW5lc1ByaWRlLnRlbXBsYXRlc1tcImNvbmZpcm1fdGVjaF9zaGFyZV9cIi5jb25jYXQocGxheWVyLnVpZCldID0gXCJBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gc3BlbmQgJFwiLmNvbmNhdChjb3N0LCBcIiB0byBidXkgXCIpLmNvbmNhdCh0ZWNoLCBcIiBmcm9tIFwiKS5jb25jYXQocGxheWVyLnJhd0FsaWFzLCBcIj8gSXQgaXMgdXAgdG8gdGhlbSB0byBhY3R1YWxseSBzZW5kIGl0IHRvIHlvdS5cIik7XG4gICAgICAgIE5lcHR1bmVzUHJpZGUubnAudHJpZ2dlcihcInNob3dfc2NyZWVuXCIsIFtcbiAgICAgICAgICAgIFwiY29uZmlybVwiLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IFwiY29uZmlybV90ZWNoX3NoYXJlX1wiLmNvbmNhdChwbGF5ZXIudWlkKSxcbiAgICAgICAgICAgICAgICBldmVudEtpbmQ6IFwiY29uZmlybV9idXlfdGVjaFwiLFxuICAgICAgICAgICAgICAgIGV2ZW50RGF0YTogZGF0YSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIF0pO1xuICAgIH0pO1xuICAgIE5lcHR1bmVzUHJpZGUubnAub24oXCJjb25maXJtX3RyYWRlX3RlY2hcIiwgZnVuY3Rpb24gKGV2ZW4sIHBsYXllcikge1xuICAgICAgICB2YXIgaGVybyA9IGdldF9oZXJvKE5lcHR1bmVzUHJpZGUudW5pdmVyc2UpO1xuICAgICAgICB2YXIgZGlzcGxheSA9IGRpc3BsYXlfdGVjaF90cmFkaW5nKCk7XG4gICAgICAgIHZhciBjbG9zZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIE5lcHR1bmVzUHJpZGUudW5pdmVyc2Uuc2VsZWN0UGxheWVyKHBsYXllcik7XG4gICAgICAgICAgICBOZXB0dW5lc1ByaWRlLm5wLnRyaWdnZXIoXCJyZWZyZXNoX2ludGVyZmFjZVwiKTtcbiAgICAgICAgICAgIE5lcHR1bmVzUHJpZGUubnAubnB1aS5yZWZyZXNoVHVybk1hbmFnZXIoKTtcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIG9mZnNldCA9IDMwMDtcbiAgICAgICAgdmFyIF9sb29wXzEgPSBmdW5jdGlvbiAodGVjaCwgdmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBtZSA9IGhlcm8udGVjaFt0ZWNoXS5sZXZlbDtcbiAgICAgICAgICAgIHZhciB5b3UgPSB2YWx1ZS5sZXZlbDtcbiAgICAgICAgICAgIHZhciBfbG9vcF8yID0gZnVuY3Rpb24gKGkpIHtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cobWUgLSB5b3UsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwib3JkZXJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIG9yZGVyOiBcInNoYXJlX3RlY2gsXCIuY29uY2F0KHBsYXllci51aWQsIFwiLFwiKS5jb25jYXQodGVjaCksXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5LnRyYW5zYWN0KFwiU2VuZGluZyBcIi5jb25jYXQodGVjaCwgXCIgbGV2ZWwgXCIpLmNvbmNhdCh5b3UgKyBpKSk7XG4gICAgICAgICAgICAgICAgICAgIE5lcHR1bmVzUHJpZGUubnAudHJpZ2dlcihcInNlcnZlcl9yZXF1ZXN0XCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwib3JkZXJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIG9yZGVyOiBcInNoYXJlX3RlY2gsXCIuY29uY2F0KHBsYXllci51aWQsIFwiLFwiKS5jb25jYXQodGVjaCksXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaSA9PSBtZSAtIHlvdSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheS50cmFuc2FjdChcIkRvbmUuXCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgb2Zmc2V0KTtcbiAgICAgICAgICAgICAgICBvZmZzZXQgKz0gMTAwMDtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8PSBtZSAtIHlvdTsgKytpKSB7XG4gICAgICAgICAgICAgICAgX2xvb3BfMihpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwLCBfYSA9IE9iamVjdC5lbnRyaWVzKHBsYXllci50ZWNoKTsgX2kgPCBfYS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIHZhciBfYiA9IF9hW19pXSwgdGVjaCA9IF9iWzBdLCB2YWx1ZSA9IF9iWzFdO1xuICAgICAgICAgICAgX2xvb3BfMSh0ZWNoLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgc2V0VGltZW91dChjbG9zZSwgb2Zmc2V0ICsgMTAwMCk7XG4gICAgfSk7XG4gICAgLy9QYXlzIGEgcGxheWVyIGEgY2VydGFpbiBhbW91bnRcbiAgICBOZXB0dW5lc1ByaWRlLm5wLm9uKFwiY29uZmlybV9idXlfdGVjaFwiLCBmdW5jdGlvbiAoZXZlbiwgZGF0YSkge1xuICAgICAgICB2YXIgcGxheWVyID0gZGF0YS5wbGF5ZXI7XG4gICAgICAgIE5lcHR1bmVzUHJpZGUubnAudHJpZ2dlcihcInNlcnZlcl9yZXF1ZXN0XCIsIHtcbiAgICAgICAgICAgIHR5cGU6IFwib3JkZXJcIixcbiAgICAgICAgICAgIG9yZGVyOiBcInNlbmRfbW9uZXksXCIuY29uY2F0KHBsYXllci51aWQsIFwiLFwiKS5jb25jYXQoZGF0YS5jb3N0KSxcbiAgICAgICAgfSk7XG4gICAgICAgIE5lcHR1bmVzUHJpZGUudW5pdmVyc2Uuc2VsZWN0UGxheWVyKHBsYXllcik7XG4gICAgICAgIE5lcHR1bmVzUHJpZGUubnAudHJpZ2dlcihcInJlZnJlc2hfaW50ZXJmYWNlXCIpO1xuICAgIH0pO1xufTtcbnZhciBfd2lkZV92aWV3ID0gZnVuY3Rpb24gKCkge1xuICAgIE5lcHR1bmVzUHJpZGUubnAudHJpZ2dlcihcIm1hcF9jZW50ZXJfc2xpZGVcIiwgeyB4OiAwLCB5OiAwIH0pO1xuICAgIE5lcHR1bmVzUHJpZGUubnAudHJpZ2dlcihcInpvb21fbWluaW1hcFwiKTtcbn07XG5mdW5jdGlvbiBMZWdhY3lfTmVwdHVuZXNQcmlkZUFnZW50KCkge1xuICAgIHZhciBfYSwgX2I7XG4gICAgdmFyIHRpdGxlID0gKChfYSA9IGRvY3VtZW50ID09PSBudWxsIHx8IGRvY3VtZW50ID09PSB2b2lkIDAgPyB2b2lkIDAgOiBkb2N1bWVudC5jdXJyZW50U2NyaXB0KSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2EudGl0bGUpIHx8IFwiU0FUIFwiLmNvbmNhdChTQVRfVkVSU0lPTik7XG4gICAgdmFyIHZlcnNpb24gPSB0aXRsZS5yZXBsYWNlKC9eLip2LywgXCJ2XCIpO1xuICAgIGNvbnNvbGUubG9nKHRpdGxlKTtcbiAgICB2YXIgY29weSA9IGZ1bmN0aW9uIChyZXBvcnRGbikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmVwb3J0Rm4oKTtcbiAgICAgICAgICAgIG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KGxhc3RDbGlwKTtcbiAgICAgICAgfTtcbiAgICB9O1xuICAgIHZhciBob3RrZXlzID0gW107XG4gICAgdmFyIGhvdGtleSA9IGZ1bmN0aW9uIChrZXksIGFjdGlvbikge1xuICAgICAgICBob3RrZXlzLnB1c2goW2tleSwgYWN0aW9uXSk7XG4gICAgICAgIE1vdXNldHJhcC5iaW5kKGtleSwgY29weShhY3Rpb24pKTtcbiAgICB9O1xuICAgIGlmICghU3RyaW5nLnByb3RvdHlwZS5mb3JtYXQpIHtcbiAgICAgICAgU3RyaW5nLnByb3RvdHlwZS5mb3JtYXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYXJncyA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgICAgICBhcmdzW19pXSA9IGFyZ3VtZW50c1tfaV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5yZXBsYWNlKC97KFxcZCspfS9nLCBmdW5jdGlvbiAobWF0Y2gsIG51bWJlcikge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgYXJnc1tudW1iZXJdID09PSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBNYXRoLnRydW5jKGFyZ3NbbnVtYmVyXSAqIDEwMDApIC8gMTAwMDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHR5cGVvZiBhcmdzW251bWJlcl0gIT0gXCJ1bmRlZmluZWRcIiA/IGFyZ3NbbnVtYmVyXSA6IG1hdGNoO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgfVxuICAgIHZhciBsaW5rRmxlZXRzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgdW5pdmVyc2UgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlO1xuICAgICAgICB2YXIgZmxlZXRzID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5nYWxheHkuZmxlZXRzO1xuICAgICAgICBmb3IgKHZhciBmIGluIGZsZWV0cykge1xuICAgICAgICAgICAgdmFyIGZsZWV0ID0gZmxlZXRzW2ZdO1xuICAgICAgICAgICAgdmFyIGZsZWV0TGluayA9IFwiPGEgb25DbGljaz0nQ3J1eC5jcnV4LnRyaWdnZXIoXFxcInNob3dfZmxlZXRfdWlkXFxcIiwgXFxcIlwiLmNvbmNhdChmbGVldC51aWQsIFwiXFxcIiknPlwiKS5jb25jYXQoZmxlZXQubiwgXCI8L2E+XCIpO1xuICAgICAgICAgICAgdW5pdmVyc2UuaHlwZXJsaW5rZWRNZXNzYWdlSW5zZXJ0c1tmbGVldC5uXSA9IGZsZWV0TGluaztcbiAgICAgICAgfVxuICAgIH07XG4gICAgZnVuY3Rpb24gc3RhclJlcG9ydCgpIHtcbiAgICAgICAgdmFyIHBsYXllcnMgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlLmdhbGF4eS5wbGF5ZXJzO1xuICAgICAgICB2YXIgc3RhcnMgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlLmdhbGF4eS5zdGFycztcbiAgICAgICAgdmFyIG91dHB1dCA9IFtdO1xuICAgICAgICBmb3IgKHZhciBwIGluIHBsYXllcnMpIHtcbiAgICAgICAgICAgIG91dHB1dC5wdXNoKFwiW1t7MH1dXVwiLmZvcm1hdChwKSk7XG4gICAgICAgICAgICBmb3IgKHZhciBzIGluIHN0YXJzKSB7XG4gICAgICAgICAgICAgICAgdmFyIHN0YXIgPSBzdGFyc1tzXTtcbiAgICAgICAgICAgICAgICBpZiAoc3Rhci5wdWlkID09IHAgJiYgc3Rhci5zaGlwc1BlclRpY2sgPj0gMCkge1xuICAgICAgICAgICAgICAgICAgICBvdXRwdXQucHVzaChcIuKAg+KAg1tbezB9XV0gezF9L3syfS97M30gezR9IHNoaXBzXCIuZm9ybWF0KHN0YXIubiwgc3Rhci5lLCBzdGFyLmksIHN0YXIucywgc3Rhci50b3RhbERlZmVuc2VzKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNsaXAob3V0cHV0LmpvaW4oXCJcXG5cIikpO1xuICAgIH1cbiAgICBob3RrZXkoXCIqXCIsIHN0YXJSZXBvcnQpO1xuICAgIHN0YXJSZXBvcnQuaGVscCA9XG4gICAgICAgIFwiR2VuZXJhdGUgYSByZXBvcnQgb24gYWxsIHN0YXJzIGluIHlvdXIgc2Nhbm5pbmcgcmFuZ2UsIGFuZCBjb3B5IGl0IHRvIHRoZSBjbGlwYm9hcmQuXCIgK1xuICAgICAgICAgICAgXCI8cD5UaGlzIHNhbWUgcmVwb3J0IGNhbiBhbHNvIGJlIHZpZXdlZCB2aWEgdGhlIG1lbnU7IGVudGVyIHRoZSBhZ2VudCBhbmQgY2hvb3NlIGl0IGZyb20gdGhlIGRyb3Bkb3duLlwiO1xuICAgIHZhciBhbXBtID0gZnVuY3Rpb24gKGgsIG0pIHtcbiAgICAgICAgaWYgKG0gPCAxMClcbiAgICAgICAgICAgIG0gPSBcIjBcIi5jb25jYXQobSk7XG4gICAgICAgIGlmIChoIDwgMTIpIHtcbiAgICAgICAgICAgIGlmIChoID09IDApXG4gICAgICAgICAgICAgICAgaCA9IDEyO1xuICAgICAgICAgICAgcmV0dXJuIFwiezB9OnsxfSBBTVwiLmZvcm1hdChoLCBtKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChoID4gMTIpIHtcbiAgICAgICAgICAgIHJldHVybiBcInswfTp7MX0gUE1cIi5mb3JtYXQoaCAtIDEyLCBtKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gXCJ7MH06ezF9IFBNXCIuZm9ybWF0KGgsIG0pO1xuICAgIH07XG4gICAgdmFyIG1zVG9UaWNrID0gZnVuY3Rpb24gKHRpY2ssIHdob2xlVGltZSkge1xuICAgICAgICB2YXIgdW5pdmVyc2UgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlO1xuICAgICAgICB2YXIgbXNfc2luY2VfZGF0YSA9IDA7XG4gICAgICAgIHZhciB0ZiA9IHVuaXZlcnNlLmdhbGF4eS50aWNrX2ZyYWdtZW50O1xuICAgICAgICB2YXIgbHRjID0gdW5pdmVyc2UubG9jVGltZUNvcnJlY3Rpb247XG4gICAgICAgIGlmICghdW5pdmVyc2UuZ2FsYXh5LnBhdXNlZCkge1xuICAgICAgICAgICAgbXNfc2luY2VfZGF0YSA9IG5ldyBEYXRlKCkudmFsdWVPZigpIC0gdW5pdmVyc2Uubm93LnZhbHVlT2YoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAod2hvbGVUaW1lIHx8IHVuaXZlcnNlLmdhbGF4eS50dXJuX2Jhc2VkKSB7XG4gICAgICAgICAgICBtc19zaW5jZV9kYXRhID0gMDtcbiAgICAgICAgICAgIHRmID0gMDtcbiAgICAgICAgICAgIGx0YyA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIG1zX3JlbWFpbmluZyA9IHRpY2sgKiAxMDAwICogNjAgKiB1bml2ZXJzZS5nYWxheHkudGlja19yYXRlIC1cbiAgICAgICAgICAgIHRmICogMTAwMCAqIDYwICogdW5pdmVyc2UuZ2FsYXh5LnRpY2tfcmF0ZSAtXG4gICAgICAgICAgICBtc19zaW5jZV9kYXRhIC1cbiAgICAgICAgICAgIGx0YztcbiAgICAgICAgcmV0dXJuIG1zX3JlbWFpbmluZztcbiAgICB9O1xuICAgIHZhciBkYXlzID0gW1wiU3VuXCIsIFwiTW9uXCIsIFwiVHVlXCIsIFwiV2VkXCIsIFwiVGh1XCIsIFwiRnJpXCIsIFwiU2F0XCJdO1xuICAgIHZhciBtc1RvRXRhU3RyaW5nID0gZnVuY3Rpb24gKG1zcGx1cywgcHJlZml4KSB7XG4gICAgICAgIHZhciBub3cgPSBuZXcgRGF0ZSgpO1xuICAgICAgICB2YXIgYXJyaXZhbCA9IG5ldyBEYXRlKG5vdy5nZXRUaW1lKCkgKyBtc3BsdXMpO1xuICAgICAgICB2YXIgcCA9IHByZWZpeCAhPT0gdW5kZWZpbmVkID8gcHJlZml4IDogXCJFVEEgXCI7XG4gICAgICAgIC8vV2hhdCBpcyB0dHQ/XG4gICAgICAgIHZhciB0dHQgPSBwICsgYW1wbShhcnJpdmFsLmdldEhvdXJzKCksIGFycml2YWwuZ2V0TWludXRlcygpKTtcbiAgICAgICAgaWYgKCFOZXB0dW5lc1ByaWRlLmdhbWVDb25maWcudHVybkJhc2VkKSB7XG4gICAgICAgICAgICB0dHQgPSBwICsgYW1wbShhcnJpdmFsLmdldEhvdXJzKCksIGFycml2YWwuZ2V0TWludXRlcygpKTtcbiAgICAgICAgICAgIGlmIChhcnJpdmFsLmdldERheSgpICE9IG5vdy5nZXREYXkoKSlcbiAgICAgICAgICAgICAgICAvLyBHZW5lcmF0ZSB0aW1lIHN0cmluZ1xuICAgICAgICAgICAgICAgIHR0dCA9IFwiXCIuY29uY2F0KHApLmNvbmNhdChkYXlzW2Fycml2YWwuZ2V0RGF5KCldLCBcIiBAIFwiKS5jb25jYXQoYW1wbShhcnJpdmFsLmdldEhvdXJzKCksIGFycml2YWwuZ2V0TWludXRlcygpKSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB2YXIgdG90YWxFVEEgPSBhcnJpdmFsIC0gbm93O1xuICAgICAgICAgICAgdHR0ID0gcCArIENydXguZm9ybWF0VGltZSh0b3RhbEVUQSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHR0dDtcbiAgICB9O1xuICAgIHZhciB0aWNrVG9FdGFTdHJpbmcgPSBmdW5jdGlvbiAodGljaywgcHJlZml4KSB7XG4gICAgICAgIHZhciBtc3BsdXMgPSBtc1RvVGljayh0aWNrKTtcbiAgICAgICAgcmV0dXJuIG1zVG9FdGFTdHJpbmcobXNwbHVzLCBwcmVmaXgpO1xuICAgIH07XG4gICAgdmFyIG1zVG9DeWNsZVN0cmluZyA9IGZ1bmN0aW9uIChtc3BsdXMsIHByZWZpeCkge1xuICAgICAgICB2YXIgcCA9IHByZWZpeCAhPT0gdW5kZWZpbmVkID8gcHJlZml4IDogXCJFVEFcIjtcbiAgICAgICAgdmFyIGN5Y2xlTGVuZ3RoID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5nYWxheHkucHJvZHVjdGlvbl9yYXRlO1xuICAgICAgICB2YXIgdGlja0xlbmd0aCA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2UuZ2FsYXh5LnRpY2tfcmF0ZTtcbiAgICAgICAgdmFyIHRpY2tzVG9Db21wbGV0ZSA9IE1hdGguY2VpbChtc3BsdXMgLyA2MDAwMCAvIHRpY2tMZW5ndGgpO1xuICAgICAgICAvL0dlbmVyYXRlIHRpbWUgdGV4dCBzdHJpbmdcbiAgICAgICAgdmFyIHR0dCA9IFwiXCIuY29uY2F0KHApLmNvbmNhdCh0aWNrc1RvQ29tcGxldGUsIFwiIHRpY2tzIC0gXCIpLmNvbmNhdCgodGlja3NUb0NvbXBsZXRlIC8gY3ljbGVMZW5ndGgpLnRvRml4ZWQoMiksIFwiQ1wiKTtcbiAgICAgICAgcmV0dXJuIHR0dDtcbiAgICB9O1xuICAgIHZhciBmbGVldE91dGNvbWVzID0ge307XG4gICAgdmFyIGNvbWJhdEhhbmRpY2FwID0gMDtcbiAgICB2YXIgY29tYmF0T3V0Y29tZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBfYTtcbiAgICAgICAgdmFyIHVuaXZlcnNlID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZTtcbiAgICAgICAgdmFyIHBsYXllcnMgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlLmdhbGF4eS5wbGF5ZXJzO1xuICAgICAgICB2YXIgZmxlZXRzID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5nYWxheHkuZmxlZXRzO1xuICAgICAgICB2YXIgc3RhcnMgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlLmdhbGF4eS5zdGFycztcbiAgICAgICAgdmFyIGZsaWdodHMgPSBbXTtcbiAgICAgICAgZmxlZXRPdXRjb21lcyA9IHt9O1xuICAgICAgICBmb3IgKHZhciBmIGluIGZsZWV0cykge1xuICAgICAgICAgICAgdmFyIGZsZWV0ID0gZmxlZXRzW2ZdO1xuICAgICAgICAgICAgaWYgKGZsZWV0Lm8gJiYgZmxlZXQuby5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgdmFyIHN0b3BfMSA9IGZsZWV0Lm9bMF1bMV07XG4gICAgICAgICAgICAgICAgdmFyIHRpY2tzID0gZmxlZXQuZXRhRmlyc3Q7XG4gICAgICAgICAgICAgICAgdmFyIHN0YXJuYW1lID0gKF9hID0gc3RhcnNbc3RvcF8xXSkgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLm47XG4gICAgICAgICAgICAgICAgaWYgKCFzdGFybmFtZSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmxpZ2h0cy5wdXNoKFtcbiAgICAgICAgICAgICAgICAgICAgdGlja3MsXG4gICAgICAgICAgICAgICAgICAgIFwiW1t7MH1dXSBbW3sxfV1dIHsyfSDihpIgW1t7M31dXSB7NH1cIi5mb3JtYXQoZmxlZXQucHVpZCwgZmxlZXQubiwgZmxlZXQuc3QsIHN0YXJuYW1lLCB0aWNrVG9FdGFTdHJpbmcodGlja3MpKSxcbiAgICAgICAgICAgICAgICAgICAgZmxlZXQsXG4gICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZmxpZ2h0cyA9IGZsaWdodHMuc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICAgICAgcmV0dXJuIGFbMF0gLSBiWzBdO1xuICAgICAgICB9KTtcbiAgICAgICAgdmFyIGFycml2YWxzID0ge307XG4gICAgICAgIHZhciBvdXRwdXQgPSBbXTtcbiAgICAgICAgdmFyIGFycml2YWxUaW1lcyA9IFtdO1xuICAgICAgICB2YXIgc3RhcnN0YXRlID0ge307XG4gICAgICAgIGZvciAodmFyIGkgaW4gZmxpZ2h0cykge1xuICAgICAgICAgICAgdmFyIGZsZWV0ID0gZmxpZ2h0c1tpXVsyXTtcbiAgICAgICAgICAgIGlmIChmbGVldC5vcmJpdGluZykge1xuICAgICAgICAgICAgICAgIHZhciBvcmJpdCA9IGZsZWV0Lm9yYml0aW5nLnVpZDtcbiAgICAgICAgICAgICAgICBpZiAoIXN0YXJzdGF0ZVtvcmJpdF0pIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhcnN0YXRlW29yYml0XSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RfdXBkYXRlZDogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNoaXBzOiBzdGFyc1tvcmJpdF0udG90YWxEZWZlbnNlcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHB1aWQ6IHN0YXJzW29yYml0XS5wdWlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgYzogc3RhcnNbb3JiaXRdLmMsXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIFRoaXMgZmxlZXQgaXMgZGVwYXJ0aW5nIHRoaXMgdGljazsgcmVtb3ZlIGl0IGZyb20gdGhlIG9yaWdpbiBzdGFyJ3MgdG90YWxEZWZlbnNlc1xuICAgICAgICAgICAgICAgIHN0YXJzdGF0ZVtvcmJpdF0uc2hpcHMgLT0gZmxlZXQuc3Q7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYXJyaXZhbFRpbWVzLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIGFycml2YWxUaW1lc1thcnJpdmFsVGltZXMubGVuZ3RoIC0gMV0gIT09IGZsaWdodHNbaV1bMF0pIHtcbiAgICAgICAgICAgICAgICBhcnJpdmFsVGltZXMucHVzaChmbGlnaHRzW2ldWzBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBhcnJpdmFsS2V5ID0gW2ZsaWdodHNbaV1bMF0sIGZsZWV0Lm9bMF1bMV1dO1xuICAgICAgICAgICAgaWYgKGFycml2YWxzW2Fycml2YWxLZXldICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBhcnJpdmFsc1thcnJpdmFsS2V5XS5wdXNoKGZsZWV0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGFycml2YWxzW2Fycml2YWxLZXldID0gW2ZsZWV0XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmb3IgKHZhciBrIGluIGFycml2YWxzKSB7XG4gICAgICAgICAgICB2YXIgYXJyaXZhbCA9IGFycml2YWxzW2tdO1xuICAgICAgICAgICAgdmFyIGthID0gay5zcGxpdChcIixcIik7XG4gICAgICAgICAgICB2YXIgdGljayA9IGthWzBdO1xuICAgICAgICAgICAgdmFyIHN0YXJJZCA9IGthWzFdO1xuICAgICAgICAgICAgaWYgKCFzdGFyc3RhdGVbc3RhcklkXSkge1xuICAgICAgICAgICAgICAgIHN0YXJzdGF0ZVtzdGFySWRdID0ge1xuICAgICAgICAgICAgICAgICAgICBsYXN0X3VwZGF0ZWQ6IDAsXG4gICAgICAgICAgICAgICAgICAgIHNoaXBzOiBzdGFyc1tzdGFySWRdLnRvdGFsRGVmZW5zZXMsXG4gICAgICAgICAgICAgICAgICAgIHB1aWQ6IHN0YXJzW3N0YXJJZF0ucHVpZCxcbiAgICAgICAgICAgICAgICAgICAgYzogc3RhcnNbc3RhcklkXS5jLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoc3RhcnN0YXRlW3N0YXJJZF0ucHVpZCA9PSAtMSkge1xuICAgICAgICAgICAgICAgIC8vIGFzc2lnbiBvd25lcnNoaXAgb2YgdGhlIHN0YXIgdG8gdGhlIHBsYXllciB3aG9zZSBmbGVldCBoYXMgdHJhdmVsZWQgdGhlIGxlYXN0IGRpc3RhbmNlXG4gICAgICAgICAgICAgICAgdmFyIG1pbkRpc3RhbmNlID0gMTAwMDA7XG4gICAgICAgICAgICAgICAgdmFyIG93bmVyID0gLTE7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSBpbiBhcnJpdmFsKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBmbGVldCA9IGFycml2YWxbaV07XG4gICAgICAgICAgICAgICAgICAgIHZhciBkID0gdW5pdmVyc2UuZGlzdGFuY2Uoc3RhcnNbc3RhcklkXS54LCBzdGFyc1tzdGFySWRdLnksIGZsZWV0Lmx4LCBmbGVldC5seSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkIDwgbWluRGlzdGFuY2UgfHwgb3duZXIgPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG93bmVyID0gZmxlZXQucHVpZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbkRpc3RhbmNlID0gZDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzdGFyc3RhdGVbc3RhcklkXS5wdWlkID0gb3duZXI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvdXRwdXQucHVzaChcInswfTogW1t7MX1dXSBbW3syfV1dIHszfSBzaGlwc1wiLmZvcm1hdCh0aWNrVG9FdGFTdHJpbmcodGljaywgXCJAXCIpLCBzdGFyc3RhdGVbc3RhcklkXS5wdWlkLCBzdGFyc1tzdGFySWRdLm4sIHN0YXJzdGF0ZVtzdGFySWRdLnNoaXBzKSk7XG4gICAgICAgICAgICB2YXIgdGlja0RlbHRhID0gdGljayAtIHN0YXJzdGF0ZVtzdGFySWRdLmxhc3RfdXBkYXRlZCAtIDE7XG4gICAgICAgICAgICBpZiAodGlja0RlbHRhID4gMCkge1xuICAgICAgICAgICAgICAgIHZhciBvbGRTaGlwcyA9IHN0YXJzdGF0ZVtzdGFySWRdLnNoaXBzO1xuICAgICAgICAgICAgICAgIHN0YXJzdGF0ZVtzdGFySWRdLmxhc3RfdXBkYXRlZCA9IHRpY2sgLSAxO1xuICAgICAgICAgICAgICAgIGlmIChzdGFyc1tzdGFySWRdLnNoaXBzUGVyVGljaykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgb2xkYyA9IHN0YXJzdGF0ZVtzdGFySWRdLmM7XG4gICAgICAgICAgICAgICAgICAgIHN0YXJzdGF0ZVtzdGFySWRdLnNoaXBzICs9XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFyc1tzdGFySWRdLnNoaXBzUGVyVGljayAqIHRpY2tEZWx0YSArIG9sZGM7XG4gICAgICAgICAgICAgICAgICAgIHN0YXJzdGF0ZVtzdGFySWRdLmMgPVxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnN0YXRlW3N0YXJJZF0uc2hpcHMgLSBNYXRoLnRydW5jKHN0YXJzdGF0ZVtzdGFySWRdLnNoaXBzKTtcbiAgICAgICAgICAgICAgICAgICAgc3RhcnN0YXRlW3N0YXJJZF0uc2hpcHMgLT0gc3RhcnN0YXRlW3N0YXJJZF0uYztcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0LnB1c2goXCLigIPigIN7MH0rezN9ICsgezJ9L2ggPSB7MX0rezR9XCIuZm9ybWF0KG9sZFNoaXBzLCBzdGFyc3RhdGVbc3RhcklkXS5zaGlwcywgc3RhcnNbc3RhcklkXS5zaGlwc1BlclRpY2ssIG9sZGMsIHN0YXJzdGF0ZVtzdGFySWRdLmMpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKHZhciBpIGluIGFycml2YWwpIHtcbiAgICAgICAgICAgICAgICB2YXIgZmxlZXQgPSBhcnJpdmFsW2ldO1xuICAgICAgICAgICAgICAgIGlmIChmbGVldC5wdWlkID09IHN0YXJzdGF0ZVtzdGFySWRdLnB1aWQgfHxcbiAgICAgICAgICAgICAgICAgICAgc3RhcnN0YXRlW3N0YXJJZF0ucHVpZCA9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgb2xkU2hpcHMgPSBzdGFyc3RhdGVbc3RhcklkXS5zaGlwcztcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXJzdGF0ZVtzdGFySWRdLnB1aWQgPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJzdGF0ZVtzdGFySWRdLnNoaXBzID0gZmxlZXQuc3Q7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFyc3RhdGVbc3RhcklkXS5zaGlwcyArPSBmbGVldC5zdDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB2YXIgbGFuZGluZ1N0cmluZyA9IFwi4oCD4oCDezB9ICsgezJ9IG9uIFtbezN9XV0gPSB7MX1cIi5mb3JtYXQob2xkU2hpcHMsIHN0YXJzdGF0ZVtzdGFySWRdLnNoaXBzLCBmbGVldC5zdCwgZmxlZXQubik7XG4gICAgICAgICAgICAgICAgICAgIG91dHB1dC5wdXNoKGxhbmRpbmdTdHJpbmcpO1xuICAgICAgICAgICAgICAgICAgICBsYW5kaW5nU3RyaW5nID0gbGFuZGluZ1N0cmluZy5zdWJzdHJpbmcoMik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yICh2YXIgaSBpbiBhcnJpdmFsKSB7XG4gICAgICAgICAgICAgICAgdmFyIGZsZWV0ID0gYXJyaXZhbFtpXTtcbiAgICAgICAgICAgICAgICBpZiAoZmxlZXQucHVpZCA9PSBzdGFyc3RhdGVbc3RhcklkXS5wdWlkKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBvdXRjb21lU3RyaW5nID0gXCJ7MH0gc2hpcHMgb24gezF9XCIuZm9ybWF0KE1hdGguZmxvb3Ioc3RhcnN0YXRlW3N0YXJJZF0uc2hpcHMpLCBzdGFyc1tzdGFySWRdLm4pO1xuICAgICAgICAgICAgICAgICAgICBmbGVldE91dGNvbWVzW2ZsZWV0LnVpZF0gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBldGE6IHRpY2tUb0V0YVN0cmluZyhmbGVldC5ldGFGaXJzdCksXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRjb21lOiBvdXRjb21lU3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBhd3QgPSAwO1xuICAgICAgICAgICAgdmFyIG9mZmVuc2UgPSAwO1xuICAgICAgICAgICAgdmFyIGNvbnRyaWJ1dGlvbiA9IHt9O1xuICAgICAgICAgICAgZm9yICh2YXIgaSBpbiBhcnJpdmFsKSB7XG4gICAgICAgICAgICAgICAgdmFyIGZsZWV0ID0gYXJyaXZhbFtpXTtcbiAgICAgICAgICAgICAgICBpZiAoZmxlZXQucHVpZCAhPSBzdGFyc3RhdGVbc3RhcklkXS5wdWlkKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBvbGRhID0gb2ZmZW5zZTtcbiAgICAgICAgICAgICAgICAgICAgb2ZmZW5zZSArPSBmbGVldC5zdDtcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0LnB1c2goXCLigIPigINbW3s0fV1dISB7MH0gKyB7Mn0gb24gW1t7M31dXSA9IHsxfVwiLmZvcm1hdChvbGRhLCBvZmZlbnNlLCBmbGVldC5zdCwgZmxlZXQubiwgZmxlZXQucHVpZCkpO1xuICAgICAgICAgICAgICAgICAgICBjb250cmlidXRpb25bW2ZsZWV0LnB1aWQsIGZsZWV0LnVpZF1dID0gZmxlZXQuc3Q7XG4gICAgICAgICAgICAgICAgICAgIHZhciB3dCA9IHBsYXllcnNbZmxlZXQucHVpZF0udGVjaC53ZWFwb25zLmxldmVsO1xuICAgICAgICAgICAgICAgICAgICBpZiAod3QgPiBhd3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF3dCA9IHd0O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGF0dGFja2Vyc0FnZ3JlZ2F0ZSA9IG9mZmVuc2U7XG4gICAgICAgICAgICB3aGlsZSAob2ZmZW5zZSA+IDApIHtcbiAgICAgICAgICAgICAgICB2YXIgZHd0ID0gcGxheWVyc1tzdGFyc3RhdGVbc3RhcklkXS5wdWlkXS50ZWNoLndlYXBvbnMubGV2ZWw7XG4gICAgICAgICAgICAgICAgdmFyIGRlZmVuc2UgPSBzdGFyc3RhdGVbc3RhcklkXS5zaGlwcztcbiAgICAgICAgICAgICAgICBvdXRwdXQucHVzaChcIuKAg+KAg0NvbWJhdCEgW1t7MH1dXSBkZWZlbmRpbmdcIi5mb3JtYXQoc3RhcnN0YXRlW3N0YXJJZF0ucHVpZCkpO1xuICAgICAgICAgICAgICAgIG91dHB1dC5wdXNoKFwi4oCD4oCD4oCD4oCDRGVmZW5kZXJzIHswfSBzaGlwcywgV1MgezF9XCIuZm9ybWF0KGRlZmVuc2UsIGR3dCkpO1xuICAgICAgICAgICAgICAgIG91dHB1dC5wdXNoKFwi4oCD4oCD4oCD4oCDQXR0YWNrZXJzIHswfSBzaGlwcywgV1MgezF9XCIuZm9ybWF0KG9mZmVuc2UsIGF3dCkpO1xuICAgICAgICAgICAgICAgIGR3dCArPSAxO1xuICAgICAgICAgICAgICAgIGlmIChzdGFyc3RhdGVbc3RhcklkXS5wdWlkICE9PSB1bml2ZXJzZS5nYWxheHkucGxheWVyX3VpZCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY29tYmF0SGFuZGljYXAgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkd3QgKz0gY29tYmF0SGFuZGljYXA7XG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXQucHVzaChcIuKAg+KAg+KAg+KAg0RlZmVuZGVycyBXU3swfSA9IHsxfVwiLmZvcm1hdChoYW5kaWNhcFN0cmluZyhcIlwiKSwgZHd0KSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhd3QgLT0gY29tYmF0SGFuZGljYXA7XG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXQucHVzaChcIuKAg+KAg+KAg+KAg0F0dGFja2VycyBXU3swfSA9IHsxfVwiLmZvcm1hdChoYW5kaWNhcFN0cmluZyhcIlwiKSwgYXd0KSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb21iYXRIYW5kaWNhcCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF3dCArPSBjb21iYXRIYW5kaWNhcDtcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dC5wdXNoKFwi4oCD4oCD4oCD4oCDQXR0YWNrZXJzIFdTezB9ID0gezF9XCIuZm9ybWF0KGhhbmRpY2FwU3RyaW5nKFwiXCIpLCBhd3QpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGR3dCAtPSBjb21iYXRIYW5kaWNhcDtcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dC5wdXNoKFwi4oCD4oCD4oCD4oCDRGVmZW5kZXJzIFdTezB9ID0gezF9XCIuZm9ybWF0KGhhbmRpY2FwU3RyaW5nKFwiXCIpLCBkd3QpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodW5pdmVyc2UuZ2FsYXh5LnBsYXllcl91aWQgPT09IHN0YXJzdGF0ZVtzdGFySWRdLnB1aWQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gdHJ1bmNhdGUgZGVmZW5zZSBpZiB3ZSdyZSBkZWZlbmRpbmcgdG8gZ2l2ZSB0aGUgbW9zdFxuICAgICAgICAgICAgICAgICAgICAvLyBjb25zZXJ2YXRpdmUgZXN0aW1hdGVcbiAgICAgICAgICAgICAgICAgICAgZGVmZW5zZSA9IE1hdGgudHJ1bmMoZGVmZW5zZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHdoaWxlIChkZWZlbnNlID4gMCAmJiBvZmZlbnNlID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBvZmZlbnNlIC09IGR3dDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9mZmVuc2UgPD0gMClcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBkZWZlbnNlIC09IGF3dDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIG5ld0FnZ3JlZ2F0ZSA9IDA7XG4gICAgICAgICAgICAgICAgdmFyIHBsYXllckNvbnRyaWJ1dGlvbiA9IHt9O1xuICAgICAgICAgICAgICAgIHZhciBiaWdnZXN0UGxheWVyID0gLTE7XG4gICAgICAgICAgICAgICAgdmFyIGJpZ2dlc3RQbGF5ZXJJZCA9IHN0YXJzdGF0ZVtzdGFySWRdLnB1aWQ7XG4gICAgICAgICAgICAgICAgaWYgKG9mZmVuc2UgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIG91dHB1dC5wdXNoKFwi4oCD4oCDQXR0YWNrZXJzIHdpbiB3aXRoIHswfSBzaGlwcyByZW1haW5pbmdcIi5mb3JtYXQob2ZmZW5zZSkpO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBrXzEgaW4gY29udHJpYnV0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIga2FfMSA9IGtfMS5zcGxpdChcIixcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZmxlZXQgPSBmbGVldHNba2FfMVsxXV07XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcGxheWVySWQgPSBrYV8xWzBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udHJpYnV0aW9uW2tfMV0gPSAob2ZmZW5zZSAqIGNvbnRyaWJ1dGlvbltrXzFdKSAvIGF0dGFja2Vyc0FnZ3JlZ2F0ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0FnZ3JlZ2F0ZSArPSBjb250cmlidXRpb25ba18xXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwbGF5ZXJDb250cmlidXRpb25bcGxheWVySWRdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGxheWVyQ29udHJpYnV0aW9uW3BsYXllcklkXSArPSBjb250cmlidXRpb25ba18xXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBsYXllckNvbnRyaWJ1dGlvbltwbGF5ZXJJZF0gPSBjb250cmlidXRpb25ba18xXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwbGF5ZXJDb250cmlidXRpb25bcGxheWVySWRdID4gYmlnZ2VzdFBsYXllcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJpZ2dlc3RQbGF5ZXIgPSBwbGF5ZXJDb250cmlidXRpb25bcGxheWVySWRdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJpZ2dlc3RQbGF5ZXJJZCA9IHBsYXllcklkO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0LnB1c2goXCLigIPigIPigIPigINbW3swfV1dIGhhcyB7MX0gb24gW1t7Mn1dXVwiLmZvcm1hdChmbGVldC5wdWlkLCBjb250cmlidXRpb25ba18xXSwgZmxlZXQubikpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG91dGNvbWVTdHJpbmcgPSBcIldpbnMhIHswfSBsYW5kLlwiLmZvcm1hdChjb250cmlidXRpb25ba18xXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBmbGVldE91dGNvbWVzW2ZsZWV0LnVpZF0gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXRhOiB0aWNrVG9FdGFTdHJpbmcoZmxlZXQuZXRhRmlyc3QpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dGNvbWU6IG91dGNvbWVTdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIG9mZmVuc2UgPSBuZXdBZ2dyZWdhdGUgLSBwbGF5ZXJDb250cmlidXRpb25bYmlnZ2VzdFBsYXllcklkXTtcbiAgICAgICAgICAgICAgICAgICAgc3RhcnN0YXRlW3N0YXJJZF0ucHVpZCA9IGJpZ2dlc3RQbGF5ZXJJZDtcbiAgICAgICAgICAgICAgICAgICAgc3RhcnN0YXRlW3N0YXJJZF0uc2hpcHMgPSBwbGF5ZXJDb250cmlidXRpb25bYmlnZ2VzdFBsYXllcklkXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXJzdGF0ZVtzdGFySWRdLnNoaXBzID0gZGVmZW5zZTtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSBpbiBhcnJpdmFsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZmxlZXQgPSBhcnJpdmFsW2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZsZWV0LnB1aWQgPT0gc3RhcnN0YXRlW3N0YXJJZF0ucHVpZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBvdXRjb21lU3RyaW5nID0gXCJ7MH0gc2hpcHMgb24gezF9XCIuZm9ybWF0KE1hdGguZmxvb3Ioc3RhcnN0YXRlW3N0YXJJZF0uc2hpcHMpLCBzdGFyc1tzdGFySWRdLm4pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZsZWV0T3V0Y29tZXNbZmxlZXQudWlkXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXRhOiB0aWNrVG9FdGFTdHJpbmcoZmxlZXQuZXRhRmlyc3QpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRjb21lOiBvdXRjb21lU3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIga18yIGluIGNvbnRyaWJ1dGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGthXzIgPSBrXzIuc3BsaXQoXCIsXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGZsZWV0ID0gZmxlZXRzW2thXzJbMV1dO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG91dGNvbWVTdHJpbmcgPSBcIkxvc2VzISB7MH0gbGl2ZS5cIi5mb3JtYXQoZGVmZW5zZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBmbGVldE91dGNvbWVzW2ZsZWV0LnVpZF0gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXRhOiB0aWNrVG9FdGFTdHJpbmcoZmxlZXQuZXRhRmlyc3QpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dGNvbWU6IG91dGNvbWVTdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGF0dGFja2Vyc0FnZ3JlZ2F0ZSA9IG9mZmVuc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvdXRwdXQucHVzaChcIuKAg+KAg1tbezB9XV0gW1t7MX1dXSB7Mn0gc2hpcHNcIi5mb3JtYXQoc3RhcnN0YXRlW3N0YXJJZF0ucHVpZCwgc3RhcnNbc3RhcklkXS5uLCBzdGFyc3RhdGVbc3RhcklkXS5zaGlwcykpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgfTtcbiAgICBmdW5jdGlvbiBpbmNDb21iYXRIYW5kaWNhcCgpIHtcbiAgICAgICAgY29tYmF0SGFuZGljYXAgKz0gMTtcbiAgICB9XG4gICAgZnVuY3Rpb24gZGVjQ29tYmF0SGFuZGljYXAoKSB7XG4gICAgICAgIGNvbWJhdEhhbmRpY2FwIC09IDE7XG4gICAgfVxuICAgIGhvdGtleShcIi5cIiwgaW5jQ29tYmF0SGFuZGljYXApO1xuICAgIGluY0NvbWJhdEhhbmRpY2FwLmhlbHAgPVxuICAgICAgICBcIkNoYW5nZSBjb21iYXQgY2FsY3VsYXRpb24gdG8gY3JlZGl0IHlvdXIgZW5lbWllcyB3aXRoICsxIHdlYXBvbnMuIFVzZWZ1bCBcIiArXG4gICAgICAgICAgICBcImlmIHlvdSBzdXNwZWN0IHRoZXkgd2lsbCBoYXZlIGFjaGlldmVkIHRoZSBuZXh0IGxldmVsIG9mIHRlY2ggYmVmb3JlIGEgYmF0dGxlIHlvdSBhcmUgaW52ZXN0aWdhdGluZy5cIiArXG4gICAgICAgICAgICBcIjxwPkluIHRoZSBsb3dlciBsZWZ0IG9mIHRoZSBIVUQsIGFuIGluZGljYXRvciB3aWxsIGFwcGVhciByZW1pbmRpbmcgeW91IG9mIHRoZSB3ZWFwb25zIGFkanVzdG1lbnQuIElmIHRoZSBcIiArXG4gICAgICAgICAgICBcImluZGljYXRvciBhbHJlYWR5IHNob3dzIGFuIGFkdmFudGFnZSBmb3IgZGVmZW5kZXJzLCB0aGlzIGhvdGtleSB3aWxsIHJlZHVjZSB0aGF0IGFkdmFudGFnZSBmaXJzdCBiZWZvcmUgY3JlZGl0aW5nIFwiICtcbiAgICAgICAgICAgIFwid2VhcG9ucyB0byB5b3VyIG9wcG9uZW50LlwiO1xuICAgIGhvdGtleShcIixcIiwgZGVjQ29tYmF0SGFuZGljYXApO1xuICAgIGRlY0NvbWJhdEhhbmRpY2FwLmhlbHAgPVxuICAgICAgICBcIkNoYW5nZSBjb21iYXQgY2FsY3VsYXRpb24gdG8gY3JlZGl0IHlvdXJzZWxmIHdpdGggKzEgd2VhcG9ucy4gVXNlZnVsIFwiICtcbiAgICAgICAgICAgIFwid2hlbiB5b3Ugd2lsbCBoYXZlIGFjaGlldmVkIHRoZSBuZXh0IGxldmVsIG9mIHRlY2ggYmVmb3JlIGEgYmF0dGxlIHlvdSBhcmUgaW52ZXN0aWdhdGluZy5cIiArXG4gICAgICAgICAgICBcIjxwPkluIHRoZSBsb3dlciBsZWZ0IG9mIHRoZSBIVUQsIGFuIGluZGljYXRvciB3aWxsIGFwcGVhciByZW1pbmRpbmcgeW91IG9mIHRoZSB3ZWFwb25zIGFkanVzdG1lbnQuIFdoZW4gXCIgK1xuICAgICAgICAgICAgXCJpbmRpY2F0b3IgYWxyZWFkeSBzaG93cyBhbiBhZHZhbnRhZ2UgZm9yIGF0dGFja2VycywgdGhpcyBob3RrZXkgd2lsbCByZWR1Y2UgdGhhdCBhZHZhbnRhZ2UgZmlyc3QgYmVmb3JlIGNyZWRpdGluZyBcIiArXG4gICAgICAgICAgICBcIndlYXBvbnMgdG8geW91LlwiO1xuICAgIGZ1bmN0aW9uIGxvbmdGbGVldFJlcG9ydCgpIHtcbiAgICAgICAgY2xpcChjb21iYXRPdXRjb21lcygpLmpvaW4oXCJcXG5cIikpO1xuICAgIH1cbiAgICBob3RrZXkoXCImXCIsIGxvbmdGbGVldFJlcG9ydCk7XG4gICAgbG9uZ0ZsZWV0UmVwb3J0LmhlbHAgPVxuICAgICAgICBcIkdlbmVyYXRlIGEgZGV0YWlsZWQgZmxlZXQgcmVwb3J0IG9uIGFsbCBjYXJyaWVycyBpbiB5b3VyIHNjYW5uaW5nIHJhbmdlLCBhbmQgY29weSBpdCB0byB0aGUgY2xpcGJvYXJkLlwiICtcbiAgICAgICAgICAgIFwiPHA+VGhpcyBzYW1lIHJlcG9ydCBjYW4gYWxzbyBiZSB2aWV3ZWQgdmlhIHRoZSBtZW51OyBlbnRlciB0aGUgYWdlbnQgYW5kIGNob29zZSBpdCBmcm9tIHRoZSBkcm9wZG93bi5cIjtcbiAgICBmdW5jdGlvbiBicmllZkZsZWV0UmVwb3J0KCkge1xuICAgICAgICB2YXIgX2E7XG4gICAgICAgIHZhciBmbGVldHMgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlLmdhbGF4eS5mbGVldHM7XG4gICAgICAgIHZhciBzdGFycyA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2UuZ2FsYXh5LnN0YXJzO1xuICAgICAgICB2YXIgZmxpZ2h0cyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBmIGluIGZsZWV0cykge1xuICAgICAgICAgICAgdmFyIGZsZWV0ID0gZmxlZXRzW2ZdO1xuICAgICAgICAgICAgaWYgKGZsZWV0Lm8gJiYgZmxlZXQuby5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgdmFyIHN0b3BfMiA9IGZsZWV0Lm9bMF1bMV07XG4gICAgICAgICAgICAgICAgdmFyIHRpY2tzID0gZmxlZXQuZXRhRmlyc3Q7XG4gICAgICAgICAgICAgICAgdmFyIHN0YXJuYW1lID0gKF9hID0gc3RhcnNbc3RvcF8yXSkgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLm47XG4gICAgICAgICAgICAgICAgaWYgKCFzdGFybmFtZSlcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgZmxpZ2h0cy5wdXNoKFtcbiAgICAgICAgICAgICAgICAgICAgdGlja3MsXG4gICAgICAgICAgICAgICAgICAgIFwiW1t7MH1dXSBbW3sxfV1dIHsyfSDihpIgW1t7M31dXSB7NH1cIi5mb3JtYXQoZmxlZXQucHVpZCwgZmxlZXQubiwgZmxlZXQuc3QsIHN0YXJzW3N0b3BfMl0ubiwgdGlja1RvRXRhU3RyaW5nKHRpY2tzLCBcIlwiKSksXG4gICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZmxpZ2h0cyA9IGZsaWdodHMuc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICAgICAgcmV0dXJuIGFbMF0gLSBiWzBdO1xuICAgICAgICB9KTtcbiAgICAgICAgY2xpcChmbGlnaHRzLm1hcChmdW5jdGlvbiAoeCkgeyByZXR1cm4geFsxXTsgfSkuam9pbihcIlxcblwiKSk7XG4gICAgfVxuICAgIGhvdGtleShcIl5cIiwgYnJpZWZGbGVldFJlcG9ydCk7XG4gICAgYnJpZWZGbGVldFJlcG9ydC5oZWxwID1cbiAgICAgICAgXCJHZW5lcmF0ZSBhIHN1bW1hcnkgZmxlZXQgcmVwb3J0IG9uIGFsbCBjYXJyaWVycyBpbiB5b3VyIHNjYW5uaW5nIHJhbmdlLCBhbmQgY29weSBpdCB0byB0aGUgY2xpcGJvYXJkLlwiICtcbiAgICAgICAgICAgIFwiPHA+VGhpcyBzYW1lIHJlcG9ydCBjYW4gYWxzbyBiZSB2aWV3ZWQgdmlhIHRoZSBtZW51OyBlbnRlciB0aGUgYWdlbnQgYW5kIGNob29zZSBpdCBmcm9tIHRoZSBkcm9wZG93bi5cIjtcbiAgICBmdW5jdGlvbiBzY3JlZW5zaG90KCkge1xuICAgICAgICB2YXIgbWFwID0gTmVwdHVuZXNQcmlkZS5ucHVpLm1hcDtcbiAgICAgICAgY2xpcChtYXAuY2FudmFzWzBdLnRvRGF0YVVSTChcImltYWdlL3dlYnBcIiwgMC4wNSkpO1xuICAgIH1cbiAgICBob3RrZXkoXCIjXCIsIHNjcmVlbnNob3QpO1xuICAgIHNjcmVlbnNob3QuaGVscCA9XG4gICAgICAgIFwiQ3JlYXRlIGEgZGF0YTogVVJMIG9mIHRoZSBjdXJyZW50IG1hcC4gUGFzdGUgaXQgaW50byBhIGJyb3dzZXIgd2luZG93IHRvIHZpZXcuIFRoaXMgaXMgbGlrZWx5IHRvIGJlIHJlbW92ZWQuXCI7XG4gICAgdmFyIGhvbWVQbGFuZXRzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgcCA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2UuZ2FsYXh5LnBsYXllcnM7XG4gICAgICAgIHZhciBvdXRwdXQgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgaSBpbiBwKSB7XG4gICAgICAgICAgICB2YXIgaG9tZSA9IHBbaV0uaG9tZTtcbiAgICAgICAgICAgIGlmIChob21lKSB7XG4gICAgICAgICAgICAgICAgb3V0cHV0LnB1c2goXCJQbGF5ZXIgI3swfSBpcyBbW3swfV1dIGhvbWUgezJ9IFtbezF9XV1cIi5mb3JtYXQoaSwgaG9tZS5uLCBpID09IGhvbWUucHVpZCA/IFwiaXNcIiA6IFwid2FzXCIpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIG91dHB1dC5wdXNoKFwiUGxheWVyICN7MH0gaXMgW1t7MH1dXSBob21lIHVua25vd25cIi5mb3JtYXQoaSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNsaXAob3V0cHV0LmpvaW4oXCJcXG5cIikpO1xuICAgIH07XG4gICAgaG90a2V5KFwiIVwiLCBob21lUGxhbmV0cyk7XG4gICAgaG9tZVBsYW5ldHMuaGVscCA9XG4gICAgICAgIFwiR2VuZXJhdGUgYSBwbGF5ZXIgc3VtbWFyeSByZXBvcnQgYW5kIGNvcHkgaXQgdG8gdGhlIGNsaXBib2FyZC5cIiArXG4gICAgICAgICAgICBcIjxwPlRoaXMgc2FtZSByZXBvcnQgY2FuIGFsc28gYmUgdmlld2VkIHZpYSB0aGUgbWVudTsgZW50ZXIgdGhlIGFnZW50IGFuZCBjaG9vc2UgaXQgZnJvbSB0aGUgZHJvcGRvd24uIFwiICtcbiAgICAgICAgICAgIFwiSXQgaXMgbW9zdCB1c2VmdWwgZm9yIGRpc2NvdmVyaW5nIHBsYXllciBudW1iZXJzIHNvIHRoYXQgeW91IGNhbiB3cml0ZSBbWyNdXSB0byByZWZlcmVuY2UgYSBwbGF5ZXIgaW4gbWFpbC5cIjtcbiAgICB2YXIgcGxheWVyU2hlZXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBwID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5nYWxheHkucGxheWVycztcbiAgICAgICAgdmFyIG91dHB1dCA9IFtdO1xuICAgICAgICB2YXIgZmllbGRzID0gW1xuICAgICAgICAgICAgXCJhbGlhc1wiLFxuICAgICAgICAgICAgXCJ0b3RhbF9zdGFyc1wiLFxuICAgICAgICAgICAgXCJzaGlwc1BlclRpY2tcIixcbiAgICAgICAgICAgIFwidG90YWxfc3RyZW5ndGhcIixcbiAgICAgICAgICAgIFwidG90YWxfZWNvbm9teVwiLFxuICAgICAgICAgICAgXCJ0b3RhbF9mbGVldHNcIixcbiAgICAgICAgICAgIFwidG90YWxfaW5kdXN0cnlcIixcbiAgICAgICAgICAgIFwidG90YWxfc2NpZW5jZVwiLFxuICAgICAgICBdO1xuICAgICAgICBvdXRwdXQucHVzaChmaWVsZHMuam9pbihcIixcIikpO1xuICAgICAgICB2YXIgX2xvb3BfMyA9IGZ1bmN0aW9uIChpKSB7XG4gICAgICAgICAgICBwbGF5ZXIgPSBfX2Fzc2lnbih7fSwgcFtpXSk7XG4gICAgICAgICAgICB2YXIgcmVjb3JkID0gZmllbGRzLm1hcChmdW5jdGlvbiAoZikgeyByZXR1cm4gcFtpXVtmXTsgfSk7XG4gICAgICAgICAgICBvdXRwdXQucHVzaChyZWNvcmQuam9pbihcIixcIikpO1xuICAgICAgICB9O1xuICAgICAgICBmb3IgKHZhciBpIGluIHApIHtcbiAgICAgICAgICAgIF9sb29wXzMoaSk7XG4gICAgICAgIH1cbiAgICAgICAgY2xpcChvdXRwdXQuam9pbihcIlxcblwiKSk7XG4gICAgfTtcbiAgICBob3RrZXkoXCIkXCIsIHBsYXllclNoZWV0KTtcbiAgICBwbGF5ZXJTaGVldC5oZWxwID1cbiAgICAgICAgXCJHZW5lcmF0ZSBhIHBsYXllciBzdW1tYXJ5IG1lYW4gdG8gYmUgbWFkZSBpbnRvIGEgc3ByZWFkc2hlZXQuXCIgK1xuICAgICAgICAgICAgXCI8cD5UaGUgY2xpcGJvYXJkIHNob3VsZCBiZSBwYXN0ZWQgaW50byBhIENTViBhbmQgdGhlbiBpbXBvcnRlZC5cIjtcbiAgICB2YXIgZHJhd092ZXJsYXlTdHJpbmcgPSBmdW5jdGlvbiAoY29udGV4dCwgcywgeCwgeSwgZmdDb2xvcikge1xuICAgICAgICBjb250ZXh0LmZpbGxTdHlsZSA9IFwiIzAwMDAwMFwiO1xuICAgICAgICBmb3IgKHZhciBzbWVhciA9IDE7IHNtZWFyIDwgNDsgKytzbWVhcikge1xuICAgICAgICAgICAgY29udGV4dC5maWxsVGV4dChzLCB4ICsgc21lYXIsIHkgKyBzbWVhcik7XG4gICAgICAgICAgICBjb250ZXh0LmZpbGxUZXh0KHMsIHggLSBzbWVhciwgeSArIHNtZWFyKTtcbiAgICAgICAgICAgIGNvbnRleHQuZmlsbFRleHQocywgeCAtIHNtZWFyLCB5IC0gc21lYXIpO1xuICAgICAgICAgICAgY29udGV4dC5maWxsVGV4dChzLCB4ICsgc21lYXIsIHkgLSBzbWVhcik7XG4gICAgICAgIH1cbiAgICAgICAgY29udGV4dC5maWxsU3R5bGUgPSBmZ0NvbG9yIHx8IFwiIzAwZmYwMFwiO1xuICAgICAgICBjb250ZXh0LmZpbGxUZXh0KHMsIHgsIHkpO1xuICAgIH07XG4gICAgdmFyIGFueVN0YXJDYW5TZWUgPSBmdW5jdGlvbiAob3duZXIsIGZsZWV0KSB7XG4gICAgICAgIHZhciBzdGFycyA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2UuZ2FsYXh5LnN0YXJzO1xuICAgICAgICB2YXIgdW5pdmVyc2UgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlO1xuICAgICAgICB2YXIgc2NhblJhbmdlID0gdW5pdmVyc2UuZ2FsYXh5LnBsYXllcnNbb3duZXJdLnRlY2guc2Nhbm5pbmcudmFsdWU7XG4gICAgICAgIGZvciAodmFyIHMgaW4gc3RhcnMpIHtcbiAgICAgICAgICAgIHZhciBzdGFyID0gc3RhcnNbc107XG4gICAgICAgICAgICBpZiAoc3Rhci5wdWlkID09IG93bmVyKSB7XG4gICAgICAgICAgICAgICAgdmFyIGRpc3RhbmNlID0gdW5pdmVyc2UuZGlzdGFuY2Uoc3Rhci54LCBzdGFyLnksIGZsZWV0LngsIGZsZWV0LnkpO1xuICAgICAgICAgICAgICAgIGlmIChkaXN0YW5jZSA8PSBzY2FuUmFuZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuICAgIHZhciBob29rc0xvYWRlZCA9IGZhbHNlO1xuICAgIHZhciBoYW5kaWNhcFN0cmluZyA9IGZ1bmN0aW9uIChwcmVmaXgpIHtcbiAgICAgICAgdmFyIHAgPSBwcmVmaXggIT09IHVuZGVmaW5lZCA/IHByZWZpeCA6IGNvbWJhdEhhbmRpY2FwID4gMCA/IFwiRW5lbXkgV1NcIiA6IFwiTXkgV1NcIjtcbiAgICAgICAgcmV0dXJuIHAgKyAoY29tYmF0SGFuZGljYXAgPiAwID8gXCIrXCIgOiBcIlwiKSArIGNvbWJhdEhhbmRpY2FwO1xuICAgIH07XG4gICAgdmFyIGxvYWRIb29rcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHN1cGVyRHJhd1RleHQgPSBOZXB0dW5lc1ByaWRlLm5wdWkubWFwLmRyYXdUZXh0O1xuICAgICAgICBOZXB0dW5lc1ByaWRlLm5wdWkubWFwLmRyYXdUZXh0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHVuaXZlcnNlID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZTtcbiAgICAgICAgICAgIHZhciBtYXAgPSBOZXB0dW5lc1ByaWRlLm5wdWkubWFwO1xuICAgICAgICAgICAgc3VwZXJEcmF3VGV4dCgpO1xuICAgICAgICAgICAgbWFwLmNvbnRleHQuZm9udCA9IFwiXCIuY29uY2F0KDE0ICogbWFwLnBpeGVsUmF0aW8sIFwicHggT3BlblNhbnNSZWd1bGFyLCBzYW5zLXNlcmlmXCIpO1xuICAgICAgICAgICAgbWFwLmNvbnRleHQuZmlsbFN0eWxlID0gXCIjRkYwMDAwXCI7XG4gICAgICAgICAgICBtYXAuY29udGV4dC50ZXh0QWxpZ24gPSBcInJpZ2h0XCI7XG4gICAgICAgICAgICBtYXAuY29udGV4dC50ZXh0QmFzZWxpbmUgPSBcIm1pZGRsZVwiO1xuICAgICAgICAgICAgdmFyIHYgPSB2ZXJzaW9uO1xuICAgICAgICAgICAgaWYgKGNvbWJhdEhhbmRpY2FwICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgdiA9IFwiXCIuY29uY2F0KGhhbmRpY2FwU3RyaW5nKCksIFwiIFwiKS5jb25jYXQodik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkcmF3T3ZlcmxheVN0cmluZyhtYXAuY29udGV4dCwgdiwgbWFwLnZpZXdwb3J0V2lkdGggLSAxMCwgbWFwLnZpZXdwb3J0SGVpZ2h0IC0gMTYgKiBtYXAucGl4ZWxSYXRpbyk7XG4gICAgICAgICAgICBpZiAoTmVwdHVuZXNQcmlkZS5vcmlnaW5hbFBsYXllciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgTmVwdHVuZXNQcmlkZS5vcmlnaW5hbFBsYXllciA9IHVuaXZlcnNlLnBsYXllci51aWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoTmVwdHVuZXNQcmlkZS5vcmlnaW5hbFBsYXllciAhPT0gdW5pdmVyc2UucGxheWVyLnVpZCkge1xuICAgICAgICAgICAgICAgIHZhciBuID0gdW5pdmVyc2UuZ2FsYXh5LnBsYXllcnNbdW5pdmVyc2UucGxheWVyLnVpZF0uYWxpYXM7XG4gICAgICAgICAgICAgICAgZHJhd092ZXJsYXlTdHJpbmcobWFwLmNvbnRleHQsIG4sIG1hcC52aWV3cG9ydFdpZHRoIC0gMTAwLCBtYXAudmlld3BvcnRIZWlnaHQgLSAyICogMTYgKiBtYXAucGl4ZWxSYXRpbyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodW5pdmVyc2Uuc2VsZWN0ZWRGbGVldCAmJiB1bml2ZXJzZS5zZWxlY3RlZEZsZWV0LnBhdGgubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coXCJTZWxlY3RlZCBmbGVldFwiLCB1bml2ZXJzZS5zZWxlY3RlZEZsZWV0KTtcbiAgICAgICAgICAgICAgICBtYXAuY29udGV4dC5mb250ID0gXCJcIi5jb25jYXQoMTQgKiBtYXAucGl4ZWxSYXRpbywgXCJweCBPcGVuU2Fuc1JlZ3VsYXIsIHNhbnMtc2VyaWZcIik7XG4gICAgICAgICAgICAgICAgbWFwLmNvbnRleHQuZmlsbFN0eWxlID0gXCIjRkYwMDAwXCI7XG4gICAgICAgICAgICAgICAgbWFwLmNvbnRleHQudGV4dEFsaWduID0gXCJsZWZ0XCI7XG4gICAgICAgICAgICAgICAgbWFwLmNvbnRleHQudGV4dEJhc2VsaW5lID0gXCJtaWRkbGVcIjtcbiAgICAgICAgICAgICAgICB2YXIgZHkgPSB1bml2ZXJzZS5zZWxlY3RlZEZsZWV0LnkgLSB1bml2ZXJzZS5zZWxlY3RlZEZsZWV0Lmx5O1xuICAgICAgICAgICAgICAgIHZhciBkeCA9IHVuaXZlcnNlLnNlbGVjdGVkRmxlZXQueCAtIHVuaXZlcnNlLnNlbGVjdGVkRmxlZXQubHg7XG4gICAgICAgICAgICAgICAgZHkgPSB1bml2ZXJzZS5zZWxlY3RlZEZsZWV0LnBhdGhbMF0ueSAtIHVuaXZlcnNlLnNlbGVjdGVkRmxlZXQueTtcbiAgICAgICAgICAgICAgICBkeCA9IHVuaXZlcnNlLnNlbGVjdGVkRmxlZXQucGF0aFswXS54IC0gdW5pdmVyc2Uuc2VsZWN0ZWRGbGVldC54O1xuICAgICAgICAgICAgICAgIHZhciBsaW5lSGVpZ2h0ID0gMTYgKiBtYXAucGl4ZWxSYXRpbztcbiAgICAgICAgICAgICAgICB2YXIgcmFkaXVzID0gMiAqIDAuMDI4ICogbWFwLnNjYWxlICogbWFwLnBpeGVsUmF0aW87XG4gICAgICAgICAgICAgICAgdmFyIGFuZ2xlID0gTWF0aC5hdGFuKGR5IC8gZHgpO1xuICAgICAgICAgICAgICAgIHZhciBvZmZzZXR4ID0gcmFkaXVzICogTWF0aC5jb3MoYW5nbGUpO1xuICAgICAgICAgICAgICAgIHZhciBvZmZzZXR5ID0gcmFkaXVzICogTWF0aC5zaW4oYW5nbGUpO1xuICAgICAgICAgICAgICAgIGlmIChvZmZzZXR4ID4gMCAmJiBkeCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0eCAqPSAtMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG9mZnNldHkgPiAwICYmIGR5ID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBvZmZzZXR5ICo9IC0xO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAob2Zmc2V0eCA8IDAgJiYgZHggPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgIG9mZnNldHggKj0gLTE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChvZmZzZXR5IDwgMCAmJiBkeSA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0eSAqPSAtMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29tYmF0T3V0Y29tZXMoKTtcbiAgICAgICAgICAgICAgICB2YXIgcyA9IGZsZWV0T3V0Y29tZXNbdW5pdmVyc2Uuc2VsZWN0ZWRGbGVldC51aWRdLmV0YTtcbiAgICAgICAgICAgICAgICB2YXIgbyA9IGZsZWV0T3V0Y29tZXNbdW5pdmVyc2Uuc2VsZWN0ZWRGbGVldC51aWRdLm91dGNvbWU7XG4gICAgICAgICAgICAgICAgdmFyIHggPSBtYXAud29ybGRUb1NjcmVlblgodW5pdmVyc2Uuc2VsZWN0ZWRGbGVldC54KSArIG9mZnNldHg7XG4gICAgICAgICAgICAgICAgdmFyIHkgPSBtYXAud29ybGRUb1NjcmVlblkodW5pdmVyc2Uuc2VsZWN0ZWRGbGVldC55KSArIG9mZnNldHk7XG4gICAgICAgICAgICAgICAgaWYgKG9mZnNldHggPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgIG1hcC5jb250ZXh0LnRleHRBbGlnbiA9IFwicmlnaHRcIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZHJhd092ZXJsYXlTdHJpbmcobWFwLmNvbnRleHQsIHMsIHgsIHkpO1xuICAgICAgICAgICAgICAgIGRyYXdPdmVybGF5U3RyaW5nKG1hcC5jb250ZXh0LCBvLCB4LCB5ICsgbGluZUhlaWdodCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIU5lcHR1bmVzUHJpZGUuZ2FtZUNvbmZpZy50dXJuQmFzZWQgJiZcbiAgICAgICAgICAgICAgICB1bml2ZXJzZS50aW1lVG9UaWNrKDEpLmxlbmd0aCA8IDMpIHtcbiAgICAgICAgICAgICAgICB2YXIgbGluZUhlaWdodCA9IDE2ICogbWFwLnBpeGVsUmF0aW87XG4gICAgICAgICAgICAgICAgbWFwLmNvbnRleHQuZm9udCA9IFwiXCIuY29uY2F0KDE0ICogbWFwLnBpeGVsUmF0aW8sIFwicHggT3BlblNhbnNSZWd1bGFyLCBzYW5zLXNlcmlmXCIpO1xuICAgICAgICAgICAgICAgIG1hcC5jb250ZXh0LmZpbGxTdHlsZSA9IFwiI0ZGMDAwMFwiO1xuICAgICAgICAgICAgICAgIG1hcC5jb250ZXh0LnRleHRBbGlnbiA9IFwibGVmdFwiO1xuICAgICAgICAgICAgICAgIG1hcC5jb250ZXh0LnRleHRCYXNlbGluZSA9IFwibWlkZGxlXCI7XG4gICAgICAgICAgICAgICAgdmFyIHMgPSBcIlRpY2sgPCAxMHMgYXdheSFcIjtcbiAgICAgICAgICAgICAgICBpZiAodW5pdmVyc2UudGltZVRvVGljaygxKSA9PT0gXCIwc1wiKSB7XG4gICAgICAgICAgICAgICAgICAgIHMgPSBcIlRpY2sgcGFzc2VkLiBDbGljayBwcm9kdWN0aW9uIGNvdW50ZG93biB0byByZWZyZXNoLlwiO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBkcmF3T3ZlcmxheVN0cmluZyhtYXAuY29udGV4dCwgcywgMTAwMCwgbGluZUhlaWdodCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodW5pdmVyc2Uuc2VsZWN0ZWRTdGFyICYmXG4gICAgICAgICAgICAgICAgdW5pdmVyc2Uuc2VsZWN0ZWRTdGFyLnB1aWQgIT0gdW5pdmVyc2UucGxheWVyLnVpZCAmJlxuICAgICAgICAgICAgICAgIHVuaXZlcnNlLnNlbGVjdGVkU3Rhci5wdWlkICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIC8vIGVuZW15IHN0YXIgc2VsZWN0ZWQ7IHNob3cgSFVEIGZvciBzY2FubmluZyB2aXNpYmlsaXR5XG4gICAgICAgICAgICAgICAgbWFwLmNvbnRleHQudGV4dEFsaWduID0gXCJsZWZ0XCI7XG4gICAgICAgICAgICAgICAgbWFwLmNvbnRleHQudGV4dEJhc2VsaW5lID0gXCJtaWRkbGVcIjtcbiAgICAgICAgICAgICAgICB2YXIgeE9mZnNldCA9IDI2ICogbWFwLnBpeGVsUmF0aW87XG4gICAgICAgICAgICAgICAgLy9tYXAuY29udGV4dC50cmFuc2xhdGUoeE9mZnNldCwgMCk7XG4gICAgICAgICAgICAgICAgdmFyIGZsZWV0cyA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2UuZ2FsYXh5LmZsZWV0cztcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBmIGluIGZsZWV0cykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZmxlZXQgPSBmbGVldHNbZl07XG4gICAgICAgICAgICAgICAgICAgIGlmIChmbGVldC5wdWlkID09PSB1bml2ZXJzZS5wbGF5ZXIudWlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZHggPSB1bml2ZXJzZS5zZWxlY3RlZFN0YXIueCAtIGZsZWV0Lng7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZHkgPSB1bml2ZXJzZS5zZWxlY3RlZFN0YXIueSAtIGZsZWV0Lnk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGlzdGFuY2UgPSBNYXRoLnNxcnQoZHggKiBkeCArIGR5ICogZHkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG9mZnNldHggPSB4T2Zmc2V0O1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG9mZnNldHkgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHggPSBtYXAud29ybGRUb1NjcmVlblgoZmxlZXQueCkgKyBvZmZzZXR4O1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHkgPSBtYXAud29ybGRUb1NjcmVlblkoZmxlZXQueSkgKyBvZmZzZXR5O1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRpc3RhbmNlID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bml2ZXJzZS5nYWxheHkucGxheWVyc1t1bml2ZXJzZS5zZWxlY3RlZFN0YXIucHVpZF0udGVjaC5zY2FubmluZ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmxlZXQucGF0aCAmJiBmbGVldC5wYXRoLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZHggPSBmbGVldC5wYXRoWzBdLnggLSB1bml2ZXJzZS5zZWxlY3RlZFN0YXIueDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZHkgPSBmbGVldC5wYXRoWzBdLnkgLSB1bml2ZXJzZS5zZWxlY3RlZFN0YXIueTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzdGFuY2UgPSBNYXRoLnNxcnQoZHggKiBkeCArIGR5ICogZHkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGlzdGFuY2UgPFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5pdmVyc2UuZ2FsYXh5LnBsYXllcnNbdW5pdmVyc2Uuc2VsZWN0ZWRTdGFyLnB1aWRdLnRlY2hcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuc2Nhbm5pbmcudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzdGVwUmFkaXVzID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5nYWxheHkuZmxlZXRfc3BlZWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmxlZXQud2FycFNwZWVkKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ZXBSYWRpdXMgKj0gMztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGR4ID0gZmxlZXQueCAtIGZsZWV0LnBhdGhbMF0ueDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGR5ID0gZmxlZXQueSAtIGZsZWV0LnBhdGhbMF0ueTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBhbmdsZSA9IE1hdGguYXRhbihkeSAvIGR4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzdGVweCA9IHN0ZXBSYWRpdXMgKiBNYXRoLmNvcyhhbmdsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgc3RlcHkgPSBzdGVwUmFkaXVzICogTWF0aC5zaW4oYW5nbGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN0ZXB4ID4gMCAmJiBkeCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGVweCAqPSAtMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdGVweSA+IDAgJiYgZHkgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RlcHkgKj0gLTE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3RlcHggPCAwICYmIGR4IDwgMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ZXB4ICo9IC0xO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN0ZXB5IDwgMCAmJiBkeSA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGVweSAqPSAtMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0aWNrcyA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkbyB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHhfMSA9IHRpY2tzICogc3RlcHggKyBOdW1iZXIoZmxlZXQueCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHlfMSA9IHRpY2tzICogc3RlcHkgKyBOdW1iZXIoZmxlZXQueSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9sZXQgc3ggPSBtYXAud29ybGRUb1NjcmVlblgoeCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9sZXQgc3kgPSBtYXAud29ybGRUb1NjcmVlblkoeSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZHggPSB4XzEgLSB1bml2ZXJzZS5zZWxlY3RlZFN0YXIueDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkeSA9IHlfMSAtIHVuaXZlcnNlLnNlbGVjdGVkU3Rhci55O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3RhbmNlID0gTWF0aC5zcXJ0KGR4ICogZHggKyBkeSAqIGR5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGRpc3RhbmNlLCB4LCB5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2RyYXdPdmVybGF5U3RyaW5nKG1hcC5jb250ZXh0LCBcIm9cIiwgc3gsIHN5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aWNrcyArPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSB3aGlsZSAoZGlzdGFuY2UgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVuaXZlcnNlLmdhbGF4eS5wbGF5ZXJzW3VuaXZlcnNlLnNlbGVjdGVkU3Rhci5wdWlkXS50ZWNoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zY2FubmluZy52YWx1ZSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpY2tzIDw9IGZsZWV0LmV0YUZpcnN0ICsgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aWNrcyAtPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHZpc0NvbG9yID0gXCIjMDBmZjAwXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYW55U3RhckNhblNlZSh1bml2ZXJzZS5zZWxlY3RlZFN0YXIucHVpZCwgZmxlZXQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlzQ29sb3IgPSBcIiM4ODg4ODhcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRyYXdPdmVybGF5U3RyaW5nKG1hcC5jb250ZXh0LCBcIlNjYW4gXCIuY29uY2F0KHRpY2tUb0V0YVN0cmluZyh0aWNrcykpLCB4LCB5LCB2aXNDb2xvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy9tYXAuY29udGV4dC50cmFuc2xhdGUoLXhPZmZzZXQsIDApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHVuaXZlcnNlLnJ1bGVyLnN0YXJzLmxlbmd0aCA9PSAyKSB7XG4gICAgICAgICAgICAgICAgdmFyIHAxID0gdW5pdmVyc2UucnVsZXIuc3RhcnNbMF0ucHVpZDtcbiAgICAgICAgICAgICAgICB2YXIgcDIgPSB1bml2ZXJzZS5ydWxlci5zdGFyc1sxXS5wdWlkO1xuICAgICAgICAgICAgICAgIGlmIChwMSAhPT0gcDIgJiYgcDEgIT09IC0xICYmIHAyICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKFwidHdvIHN0YXIgcnVsZXJcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBDcnV4LmZvcm1hdCA9IGZ1bmN0aW9uIChzLCB0ZW1wbGF0ZURhdGEpIHtcbiAgICAgICAgICAgIGlmICghcykge1xuICAgICAgICAgICAgICAgIHJldHVybiBcImVycm9yXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgaTtcbiAgICAgICAgICAgIHZhciBmcDtcbiAgICAgICAgICAgIHZhciBzcDtcbiAgICAgICAgICAgIHZhciBzdWI7XG4gICAgICAgICAgICB2YXIgcGF0dGVybjtcbiAgICAgICAgICAgIGkgPSAwO1xuICAgICAgICAgICAgZnAgPSAwO1xuICAgICAgICAgICAgc3AgPSAwO1xuICAgICAgICAgICAgc3ViID0gXCJcIjtcbiAgICAgICAgICAgIHBhdHRlcm4gPSBcIlwiO1xuICAgICAgICAgICAgLy8gbG9vayBmb3Igc3RhbmRhcmQgcGF0dGVybnNcbiAgICAgICAgICAgIHdoaWxlIChmcCA+PSAwICYmIGkgPCAxMDAwKSB7XG4gICAgICAgICAgICAgICAgaSA9IGkgKyAxO1xuICAgICAgICAgICAgICAgIGZwID0gcy5zZWFyY2goXCJcXFxcW1xcXFxbXCIpO1xuICAgICAgICAgICAgICAgIHNwID0gcy5zZWFyY2goXCJcXFxcXVxcXFxdXCIpO1xuICAgICAgICAgICAgICAgIHN1YiA9IHMuc2xpY2UoZnAgKyAyLCBzcCk7XG4gICAgICAgICAgICAgICAgdmFyIHVyaSA9IHN1Yi5yZXBsYWNlQWxsKFwiJiN4MkY7XCIsIFwiL1wiKTtcbiAgICAgICAgICAgICAgICBwYXR0ZXJuID0gXCJbW1wiLmNvbmNhdChzdWIsIFwiXV1cIik7XG4gICAgICAgICAgICAgICAgaWYgKHRlbXBsYXRlRGF0YVtzdWJdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcyA9IHMucmVwbGFjZShwYXR0ZXJuLCB0ZW1wbGF0ZURhdGFbc3ViXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKC9eYXBpOlxcd3s2fSQvLnRlc3Qoc3ViKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgYXBpTGluayA9IFwiPGEgb25DbGljaz0nQ3J1eC5jcnV4LnRyaWdnZXIoXFxcInN3aXRjaF91c2VyX2FwaVxcXCIsIFxcXCJcIi5jb25jYXQoc3ViLCBcIlxcXCIpJz4gVmlldyBhcyBcIikuY29uY2F0KHN1YiwgXCI8L2E+XCIpO1xuICAgICAgICAgICAgICAgICAgICBhcGlMaW5rICs9IFwiIG9yIDxhIG9uQ2xpY2s9J0NydXguY3J1eC50cmlnZ2VyKFxcXCJtZXJnZV91c2VyX2FwaVxcXCIsIFxcXCJcIi5jb25jYXQoc3ViLCBcIlxcXCIpJz4gTWVyZ2UgXCIpLmNvbmNhdChzdWIsIFwiPC9hPlwiKTtcbiAgICAgICAgICAgICAgICAgICAgcyA9IHMucmVwbGFjZShwYXR0ZXJuLCBhcGlMaW5rKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoaW1hZ2VfdXJsKHVyaSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcyA9IHMucmVwbGFjZShwYXR0ZXJuLCBcIjxpbWcgd2lkdGg9XFxcIjEwMCVcXFwiIHNyYz0nXCIuY29uY2F0KHVyaSwgXCInIC8+XCIpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHMgPSBzLnJlcGxhY2UocGF0dGVybiwgXCIoXCIuY29uY2F0KHN1YiwgXCIpXCIpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcztcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIG5wdWkgPSBOZXB0dW5lc1ByaWRlLm5wdWk7XG4gICAgICAgIC8vUmVzZWFyY2ggYnV0dG9uIHRvIHF1aWNrbHkgdGVsbCBmcmllbmRzIHJlc2VhcmNoXG4gICAgICAgIE5lcHR1bmVzUHJpZGUudGVtcGxhdGVzW1wibnBhX3Jlc2VhcmNoXCJdID0gXCJSZXNlYXJjaFwiO1xuICAgICAgICB2YXIgc3VwZXJOZXdNZXNzYWdlQ29tbWVudEJveCA9IG5wdWkuTmV3TWVzc2FnZUNvbW1lbnRCb3g7XG4gICAgICAgIHZhciByZXBvcnRSZXNlYXJjaEhvb2sgPSBmdW5jdGlvbiAoX2UsIF9kKSB7XG4gICAgICAgICAgICB2YXIgdGV4dCA9IGdldF9yZXNlYXJjaF90ZXh0KE5lcHR1bmVzUHJpZGUpO1xuICAgICAgICAgICAgY29uc29sZS5sb2codGV4dCk7XG4gICAgICAgICAgICB2YXIgaW5ib3ggPSBOZXB0dW5lc1ByaWRlLmluYm94O1xuICAgICAgICAgICAgaW5ib3guY29tbWVudERyYWZ0c1tpbmJveC5zZWxlY3RlZE1lc3NhZ2Uua2V5XSArPSB0ZXh0O1xuICAgICAgICAgICAgaW5ib3gudHJpZ2dlcihcInNob3dfc2NyZWVuXCIsIFwiZGlwbG9tYWN5X2RldGFpbFwiKTtcbiAgICAgICAgfTtcbiAgICAgICAgTmVwdHVuZXNQcmlkZS5ucC5vbihcInBhc3RlX3Jlc2VhcmNoXCIsIHJlcG9ydFJlc2VhcmNoSG9vayk7XG4gICAgICAgIG5wdWkuTmV3TWVzc2FnZUNvbW1lbnRCb3ggPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgd2lkZ2V0ID0gc3VwZXJOZXdNZXNzYWdlQ29tbWVudEJveCgpO1xuICAgICAgICAgICAgdmFyIHJlc2VhcmNoX2J1dHRvbiA9IENydXguQnV0dG9uKFwibnBhX3Jlc2VhcmNoXCIsIFwicGFzdGVfcmVzZWFyY2hcIiwgXCJyZXNlYXJjaFwiKS5ncmlkKDExLCAxMiwgOCwgMyk7XG4gICAgICAgICAgICByZXNlYXJjaF9idXR0b24ucm9vc3Qod2lkZ2V0KTtcbiAgICAgICAgICAgIHJldHVybiB3aWRnZXQ7XG4gICAgICAgIH07XG4gICAgICAgIHZhciBzdXBlckZvcm1hdFRpbWUgPSBDcnV4LmZvcm1hdFRpbWU7XG4gICAgICAgIHZhciByZWxhdGl2ZVRpbWVzID0gMDtcbiAgICAgICAgQ3J1eC5mb3JtYXRUaW1lID0gZnVuY3Rpb24gKG1zLCBtaW5zLCBzZWNzKSB7XG4gICAgICAgICAgICBzd2l0Y2ggKHJlbGF0aXZlVGltZXMpIHtcbiAgICAgICAgICAgICAgICBjYXNlIDA6IC8vc3RhbmRhcmRcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN1cGVyRm9ybWF0VGltZShtcywgbWlucywgc2Vjcyk7XG4gICAgICAgICAgICAgICAgY2FzZSAxOiAvL0VUQSwgLSB0dXJuKHMpIGZvciB0dXJuYmFzZWRcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFOZXB0dW5lc1ByaWRlLmdhbWVDb25maWcudHVybkJhc2VkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbXNUb0V0YVN0cmluZyhtcywgXCJcIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdGlja19yYXRlID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5nYWxheHkudGlja19yYXRlO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiXCIuY29uY2F0KHN1cGVyRm9ybWF0VGltZShtcywgbWlucywgc2VjcyksIFwiIC0gXCIpLmNvbmNhdCgoKChtcyAvIDM2MDAwMDApICogMTApIC9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aWNrX3JhdGUpLnRvRml4ZWQoMiksIFwiIHR1cm4ocylcIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXNlIDI6IC8vY3ljbGVzICsgdGlja3MgZm9ybWF0XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtc1RvQ3ljbGVTdHJpbmcobXMsIFwiXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICB2YXIgc3dpdGNoVGltZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvLzAgPSBzdGFuZGFyZCwgMSA9IEVUQSwgLSB0dXJuKHMpIGZvciB0dXJuYmFzZWQsIDIgPSBjeWNsZXMgKyB0aWNrcyBmb3JtYXRcbiAgICAgICAgICAgIHJlbGF0aXZlVGltZXMgPSAocmVsYXRpdmVUaW1lcyArIDEpICUgMztcbiAgICAgICAgfTtcbiAgICAgICAgaG90a2V5KFwiJVwiLCBzd2l0Y2hUaW1lcyk7XG4gICAgICAgIHN3aXRjaFRpbWVzLmhlbHAgPVxuICAgICAgICAgICAgXCJDaGFuZ2UgdGhlIGRpc3BsYXkgb2YgRVRBcyBiZXR3ZWVuIHJlbGF0aXZlIHRpbWVzLCBhYnNvbHV0ZSBjbG9jayB0aW1lcywgYW5kIGN5Y2xlIHRpbWVzLiBNYWtlcyBwcmVkaWN0aW5nIFwiICtcbiAgICAgICAgICAgICAgICBcImltcG9ydGFudCB0aW1lcyBvZiBkYXkgdG8gc2lnbiBpbiBhbmQgY2hlY2sgbXVjaCBlYXNpZXIgZXNwZWNpYWxseSBmb3IgbXVsdGktbGVnIGZsZWV0IG1vdmVtZW50cy4gU29tZXRpbWVzIHlvdSBcIiArXG4gICAgICAgICAgICAgICAgXCJ3aWxsIG5lZWQgdG8gcmVmcmVzaCB0aGUgZGlzcGxheSB0byBzZWUgdGhlIGRpZmZlcmVudCB0aW1lcy5cIjtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShDcnV4LCBcInRvdWNoRW5hYmxlZFwiLCB7XG4gICAgICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiBmYWxzZTsgfSxcbiAgICAgICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh4KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQ3J1eC50b3VjaEVuYWJsZWQgc2V0IGlnbm9yZWRcIiwgeCk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlKTtcbiAgICAgICAgfVxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoTmVwdHVuZXNQcmlkZS5ucHVpLm1hcCwgXCJpZ25vcmVNb3VzZUV2ZW50c1wiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIGZhbHNlOyB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAoeCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiTmVwdHVuZXNQcmlkZS5ucHVpLm1hcC5pZ25vcmVNb3VzZUV2ZW50cyBzZXQgaWdub3JlZFwiLCB4KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgICAgICBob29rc0xvYWRlZCA9IHRydWU7XG4gICAgfTtcbiAgICB2YXIgaW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIF9hO1xuICAgICAgICBpZiAoKChfYSA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2UpID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5nYWxheHkpICYmIE5lcHR1bmVzUHJpZGUubnB1aS5tYXApIHtcbiAgICAgICAgICAgIGxpbmtGbGVldHMoKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRmxlZXQgbGlua2luZyBjb21wbGV0ZS5cIik7XG4gICAgICAgICAgICBpZiAoIWhvb2tzTG9hZGVkKSB7XG4gICAgICAgICAgICAgICAgbG9hZEhvb2tzKCk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJIVUQgc2V0dXAgY29tcGxldGUuXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJIVUQgc2V0dXAgYWxyZWFkeSBkb25lOyBza2lwcGluZy5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBob21lUGxhbmV0cygpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJHYW1lIG5vdCBmdWxseSBpbml0aWFsaXplZCB5ZXQ7IHdhaXQuXCIsIE5lcHR1bmVzUHJpZGUudW5pdmVyc2UpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBob3RrZXkoXCJAXCIsIGluaXQpO1xuICAgIGluaXQuaGVscCA9XG4gICAgICAgIFwiUmVpbml0aWFsaXplIE5lcHR1bmUncyBQcmlkZSBBZ2VudC4gVXNlIHRoZSBAIGhvdGtleSBpZiB0aGUgdmVyc2lvbiBpcyBub3QgYmVpbmcgc2hvd24gb24gdGhlIG1hcCBhZnRlciBkcmFnZ2luZy5cIjtcbiAgICBpZiAoKChfYiA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2UpID09PSBudWxsIHx8IF9iID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYi5nYWxheHkpICYmIE5lcHR1bmVzUHJpZGUubnB1aS5tYXApIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJVbml2ZXJzZSBhbHJlYWR5IGxvYWRlZC4gSHlwZXJsaW5rIGZsZWV0cyAmIGxvYWQgaG9va3MuXCIpO1xuICAgICAgICBpbml0KCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyhcIlVuaXZlcnNlIG5vdCBsb2FkZWQuIEhvb2sgb25TZXJ2ZXJSZXNwb25zZS5cIik7XG4gICAgICAgIHZhciBzdXBlck9uU2VydmVyUmVzcG9uc2VfMSA9IE5lcHR1bmVzUHJpZGUubnAub25TZXJ2ZXJSZXNwb25zZTtcbiAgICAgICAgTmVwdHVuZXNQcmlkZS5ucC5vblNlcnZlclJlc3BvbnNlID0gZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICBzdXBlck9uU2VydmVyUmVzcG9uc2VfMShyZXNwb25zZSk7XG4gICAgICAgICAgICBpZiAocmVzcG9uc2UuZXZlbnQgPT09IFwib3JkZXI6cGxheWVyX2FjaGlldmVtZW50c1wiKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJJbml0aWFsIGxvYWQgY29tcGxldGUuIFJlaW5zdGFsbC5cIik7XG4gICAgICAgICAgICAgICAgaW5pdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAocmVzcG9uc2UuZXZlbnQgPT09IFwib3JkZXI6ZnVsbF91bml2ZXJzZVwiKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJVbml2ZXJzZSByZWNlaXZlZC4gUmVpbnN0YWxsLlwiKTtcbiAgICAgICAgICAgICAgICBOZXB0dW5lc1ByaWRlLm9yaWdpbmFsUGxheWVyID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5wbGF5ZXIudWlkO1xuICAgICAgICAgICAgICAgIGluaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKCFob29rc0xvYWRlZCAmJiBOZXB0dW5lc1ByaWRlLm5wdWkubWFwKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJIb29rcyBuZWVkIGxvYWRpbmcgYW5kIG1hcCBpcyByZWFkeS4gUmVpbnN0YWxsLlwiKTtcbiAgICAgICAgICAgICAgICBpbml0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuICAgIHZhciBvdGhlclVzZXJDb2RlID0gdW5kZWZpbmVkO1xuICAgIHZhciBnYW1lID0gTmVwdHVuZXNQcmlkZS5nYW1lTnVtYmVyO1xuICAgIHZhciBzd2l0Y2hVc2VyID0gZnVuY3Rpb24gKGV2ZW50LCBkYXRhKSB7XG4gICAgICAgIGlmIChOZXB0dW5lc1ByaWRlLm9yaWdpbmFsUGxheWVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIE5lcHR1bmVzUHJpZGUub3JpZ2luYWxQbGF5ZXIgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlLnBsYXllci51aWQ7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGNvZGUgPSAoZGF0YSA9PT0gbnVsbCB8fCBkYXRhID09PSB2b2lkIDAgPyB2b2lkIDAgOiBkYXRhLnNwbGl0KFwiOlwiKVsxXSkgfHwgb3RoZXJVc2VyQ29kZTtcbiAgICAgICAgb3RoZXJVc2VyQ29kZSA9IGNvZGU7XG4gICAgICAgIGlmIChvdGhlclVzZXJDb2RlKSB7XG4gICAgICAgICAgICB2YXIgcGFyYW1zID0ge1xuICAgICAgICAgICAgICAgIGdhbWVfbnVtYmVyOiBnYW1lLFxuICAgICAgICAgICAgICAgIGFwaV92ZXJzaW9uOiBcIjAuMVwiLFxuICAgICAgICAgICAgICAgIGNvZGU6IG90aGVyVXNlckNvZGUsXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdmFyIGVnZ2VycyA9IGpRdWVyeS5hamF4KHtcbiAgICAgICAgICAgICAgICB0eXBlOiBcIlBPU1RcIixcbiAgICAgICAgICAgICAgICB1cmw6IFwiaHR0cHM6Ly9ucC5pcm9uaGVsbWV0LmNvbS9hcGlcIixcbiAgICAgICAgICAgICAgICBhc3luYzogZmFsc2UsXG4gICAgICAgICAgICAgICAgZGF0YTogcGFyYW1zLFxuICAgICAgICAgICAgICAgIGRhdGFUeXBlOiBcImpzb25cIixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgTmVwdHVuZXNQcmlkZS5ucC5vbkZ1bGxVbml2ZXJzZShudWxsLCBlZ2dlcnMucmVzcG9uc2VKU09OLnNjYW5uaW5nX2RhdGEpO1xuICAgICAgICAgICAgTmVwdHVuZXNQcmlkZS5ucHVpLm9uSGlkZVNjcmVlbihudWxsLCB0cnVlKTtcbiAgICAgICAgICAgIE5lcHR1bmVzUHJpZGUubnAudHJpZ2dlcihcInNlbGVjdF9wbGF5ZXJcIiwgW1xuICAgICAgICAgICAgICAgIE5lcHR1bmVzUHJpZGUudW5pdmVyc2UucGxheWVyLnVpZCxcbiAgICAgICAgICAgICAgICB0cnVlLFxuICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICBpbml0KCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGhvdGtleShcIj5cIiwgc3dpdGNoVXNlcik7XG4gICAgc3dpdGNoVXNlci5oZWxwID1cbiAgICAgICAgXCJTd2l0Y2ggdmlld3MgdG8gdGhlIGxhc3QgdXNlciB3aG9zZSBBUEkga2V5IHdhcyB1c2VkIHRvIGxvYWQgZGF0YS4gVGhlIEhVRCBzaG93cyB0aGUgY3VycmVudCB1c2VyIHdoZW4gXCIgK1xuICAgICAgICAgICAgXCJpdCBpcyBub3QgeW91ciBvd24gYWxpYXMgdG8gaGVscCByZW1pbmQgeW91IHRoYXQgeW91IGFyZW4ndCBpbiBjb250cm9sIG9mIHRoaXMgdXNlci5cIjtcbiAgICBob3RrZXkoXCJ8XCIsIG1lcmdlVXNlcik7XG4gICAgbWVyZ2VVc2VyLmhlbHAgPVxuICAgICAgICBcIk1lcmdlIHRoZSBsYXRlc3QgZGF0YSBmcm9tIHRoZSBsYXN0IHVzZXIgd2hvc2UgQVBJIGtleSB3YXMgdXNlZCB0byBsb2FkIGRhdGEuIFRoaXMgaXMgdXNlZnVsIGFmdGVyIGEgdGljayBcIiArXG4gICAgICAgICAgICBcInBhc3NlcyBhbmQgeW91J3ZlIHJlbG9hZGVkLCBidXQgeW91IHN0aWxsIHdhbnQgdGhlIG1lcmdlZCBzY2FuIGRhdGEgZnJvbSB0d28gcGxheWVycyBvbnNjcmVlbi5cIjtcbiAgICBOZXB0dW5lc1ByaWRlLm5wLm9uKFwic3dpdGNoX3VzZXJfYXBpXCIsIHN3aXRjaFVzZXIpO1xuICAgIE5lcHR1bmVzUHJpZGUubnAub24oXCJtZXJnZV91c2VyX2FwaVwiLCBtZXJnZVVzZXIpO1xuICAgIHZhciBucGFIZWxwID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgaGVscCA9IFtcIjxIMT5cIi5jb25jYXQodGl0bGUsIFwiPC9IMT5cIildO1xuICAgICAgICBmb3IgKHZhciBwYWlyIGluIGhvdGtleXMpIHtcbiAgICAgICAgICAgIHZhciBrZXkgPSBob3RrZXlzW3BhaXJdWzBdO1xuICAgICAgICAgICAgdmFyIGFjdGlvbiA9IGhvdGtleXNbcGFpcl1bMV07XG4gICAgICAgICAgICBoZWxwLnB1c2goXCI8aDI+SG90a2V5OiBcIi5jb25jYXQoa2V5LCBcIjwvaDI+XCIpKTtcbiAgICAgICAgICAgIGlmIChhY3Rpb24uaGVscCkge1xuICAgICAgICAgICAgICAgIGhlbHAucHVzaChhY3Rpb24uaGVscCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBoZWxwLnB1c2goXCI8cD5ObyBkb2N1bWVudGF0aW9uIHlldC48cD48Y29kZT5cIi5jb25jYXQoYWN0aW9uLnRvTG9jYWxlU3RyaW5nKCksIFwiPC9jb2RlPlwiKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5oZWxwSFRNTCA9IGhlbHAuam9pbihcIlwiKTtcbiAgICAgICAgTmVwdHVuZXNQcmlkZS5ucC50cmlnZ2VyKFwic2hvd19zY3JlZW5cIiwgXCJoZWxwXCIpO1xuICAgIH07XG4gICAgbnBhSGVscC5oZWxwID0gXCJEaXNwbGF5IHRoaXMgaGVscCBzY3JlZW4uXCI7XG4gICAgaG90a2V5KFwiP1wiLCBucGFIZWxwKTtcbiAgICB2YXIgYXV0b2NvbXBsZXRlTW9kZSA9IDA7XG4gICAgdmFyIGF1dG9jb21wbGV0ZVRyaWdnZXIgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICBpZiAoZS50YXJnZXQudHlwZSA9PT0gXCJ0ZXh0YXJlYVwiKSB7XG4gICAgICAgICAgICBpZiAoYXV0b2NvbXBsZXRlTW9kZSkge1xuICAgICAgICAgICAgICAgIHZhciBzdGFydCA9IGF1dG9jb21wbGV0ZU1vZGU7XG4gICAgICAgICAgICAgICAgdmFyIGVuZEJyYWNrZXQgPSBlLnRhcmdldC52YWx1ZS5pbmRleE9mKFwiXVwiLCBzdGFydCk7XG4gICAgICAgICAgICAgICAgaWYgKGVuZEJyYWNrZXQgPT09IC0xKVxuICAgICAgICAgICAgICAgICAgICBlbmRCcmFja2V0ID0gZS50YXJnZXQudmFsdWUubGVuZ3RoO1xuICAgICAgICAgICAgICAgIHZhciBhdXRvU3RyaW5nID0gZS50YXJnZXQudmFsdWUuc3Vic3RyaW5nKHN0YXJ0LCBlbmRCcmFja2V0KTtcbiAgICAgICAgICAgICAgICB2YXIga2V5ID0gZS5rZXk7XG4gICAgICAgICAgICAgICAgaWYgKGtleSA9PT0gXCJdXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgYXV0b2NvbXBsZXRlTW9kZSA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHZhciBtID0gYXV0b1N0cmluZy5tYXRjaCgvXlswLTldWzAtOV0qJC8pO1xuICAgICAgICAgICAgICAgICAgICBpZiAobSA9PT0gbnVsbCB8fCBtID09PSB2b2lkIDAgPyB2b2lkIDAgOiBtLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHB1aWQgPSBOdW1iZXIoYXV0b1N0cmluZyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZW5kID0gZS50YXJnZXQuc2VsZWN0aW9uRW5kO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGF1dG8gPSBcIlwiLmNvbmNhdChwdWlkLCBcIl1dIFwiKS5jb25jYXQoTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5nYWxheHkucGxheWVyc1twdWlkXS5hbGlhcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBlLnRhcmdldC52YWx1ZSA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZS50YXJnZXQudmFsdWUuc3Vic3RyaW5nKDAsIHN0YXJ0KSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF1dG8gK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlLnRhcmdldC52YWx1ZS5zdWJzdHJpbmcoZW5kLCBlLnRhcmdldC52YWx1ZS5sZW5ndGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZS50YXJnZXQuc2VsZWN0aW9uU3RhcnQgPSBzdGFydCArIGF1dG8ubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICAgICAgZS50YXJnZXQuc2VsZWN0aW9uRW5kID0gc3RhcnQgKyBhdXRvLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGUudGFyZ2V0LnNlbGVjdGlvblN0YXJ0ID4gMSkge1xuICAgICAgICAgICAgICAgIHZhciBzdGFydCA9IGUudGFyZ2V0LnNlbGVjdGlvblN0YXJ0IC0gMjtcbiAgICAgICAgICAgICAgICB2YXIgc3MgPSBlLnRhcmdldC52YWx1ZS5zdWJzdHJpbmcoc3RhcnQsIHN0YXJ0ICsgMik7XG4gICAgICAgICAgICAgICAgYXV0b2NvbXBsZXRlTW9kZSA9IHNzID09PSBcIltbXCIgPyBlLnRhcmdldC5zZWxlY3Rpb25TdGFydCA6IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcihcImtleXVwXCIsIGF1dG9jb21wbGV0ZVRyaWdnZXIpO1xuICAgIGNvbnNvbGUubG9nKFwiU0FUOiBOZXB0dW5lJ3MgUHJpZGUgQWdlbnQgaW5qZWN0aW9uIGZpbmlzaGVkLlwiKTtcbiAgICBjb25zb2xlLmxvZyhcIkdldHRpbmcgaGVybyFcIiwgZ2V0X2hlcm8oTmVwdHVuZXNQcmlkZS51bml2ZXJzZSkpO1xufVxudmFyIGZvcmNlX2FkZF9jdXN0b21fcGxheWVyX3BhbmVsID0gZnVuY3Rpb24gKCkge1xuICAgIGlmIChcIlBsYXllclBhbmVsXCIgaW4gTmVwdHVuZXNQcmlkZS5ucHVpKSB7XG4gICAgICAgIGFkZF9jdXN0b21fcGxheWVyX3BhbmVsKCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBzZXRUaW1lb3V0KGFkZF9jdXN0b21fcGxheWVyX3BhbmVsLCAzMDAwKTtcbiAgICB9XG59O1xudmFyIGFkZF9jdXN0b21fcGxheWVyX3BhbmVsID0gZnVuY3Rpb24gKCkge1xuICAgIE5lcHR1bmVzUHJpZGUubnB1aS5QbGF5ZXJQYW5lbCA9IGZ1bmN0aW9uIChwbGF5ZXIsIHNob3dFbXBpcmUpIHtcbiAgICAgICAgdmFyIHVuaXZlcnNlID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZTtcbiAgICAgICAgdmFyIG5wdWkgPSBOZXB0dW5lc1ByaWRlLm5wdWk7XG4gICAgICAgIHZhciBwbGF5ZXJQYW5lbCA9IENydXguV2lkZ2V0KFwicmVsXCIpLnNpemUoNDgwLCAyNjQgLSA4ICsgNDgpO1xuICAgICAgICB2YXIgaGVhZGluZyA9IFwicGxheWVyXCI7XG4gICAgICAgIGlmICh1bml2ZXJzZS5wbGF5ZXJBY2hpZXZlbWVudHMgJiZcbiAgICAgICAgICAgIE5lcHR1bmVzUHJpZGUuZ2FtZUNvbmZpZy5hbm9ueW1pdHkgPT09IDApIHtcbiAgICAgICAgICAgIGlmICh1bml2ZXJzZS5wbGF5ZXJBY2hpZXZlbWVudHNbcGxheWVyLnVpZF0pIHtcbiAgICAgICAgICAgICAgICBpZiAodW5pdmVyc2UucGxheWVyQWNoaWV2ZW1lbnRzW3BsYXllci51aWRdLnByZW1pdW0gPT09IFwicHJlbWl1bVwiKSB7XG4gICAgICAgICAgICAgICAgICAgIGhlYWRpbmcgPSBcInByZW1pdW1fcGxheWVyXCI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh1bml2ZXJzZS5wbGF5ZXJBY2hpZXZlbWVudHNbcGxheWVyLnVpZF0ucHJlbWl1bSA9PT0gXCJsaWZldGltZVwiKSB7XG4gICAgICAgICAgICAgICAgICAgIGhlYWRpbmcgPSBcImxpZmV0aW1lX3ByZW1pdW1fcGxheWVyXCI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIENydXguVGV4dChoZWFkaW5nLCBcInNlY3Rpb25fdGl0bGUgY29sX2JsYWNrXCIpXG4gICAgICAgICAgICAuZ3JpZCgwLCAwLCAzMCwgMylcbiAgICAgICAgICAgIC5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgIGlmIChwbGF5ZXIuYWkpIHtcbiAgICAgICAgICAgIENydXguVGV4dChcImFpX2FkbWluXCIsIFwidHh0X3JpZ2h0IHBhZDEyXCIpXG4gICAgICAgICAgICAgICAgLmdyaWQoMCwgMCwgMzAsIDMpXG4gICAgICAgICAgICAgICAgLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgfVxuICAgICAgICBDcnV4LkltYWdlKFwiLi4vaW1hZ2VzL2F2YXRhcnMvMTYwL1wiLmNvbmNhdChwbGF5ZXIuYXZhdGFyLCBcIi5qcGdcIiksIFwiYWJzXCIpXG4gICAgICAgICAgICAuZ3JpZCgwLCA2LCAxMCwgMTApXG4gICAgICAgICAgICAucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICBDcnV4LldpZGdldChcInBjaV80OF9cIi5jb25jYXQocGxheWVyLnVpZCkpLmdyaWQoNywgMTMsIDMsIDMpLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgQ3J1eC5XaWRnZXQoXCJjb2xfYWNjZW50XCIpLmdyaWQoMCwgMywgMzAsIDMpLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgQ3J1eC5UZXh0KFwiXCIsIFwic2NyZWVuX3N1YnRpdGxlXCIpXG4gICAgICAgICAgICAuZ3JpZCgwLCAzLCAzMCwgMylcbiAgICAgICAgICAgIC5yYXdIVE1MKHBsYXllci5xdWFsaWZpZWRBbGlhcylcbiAgICAgICAgICAgIC5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgIHZhciBteUFjaGlldmVtZW50cztcbiAgICAgICAgLy9VPT5Ub3hpY1xuICAgICAgICAvL1Y9Pk1hZ2ljXG4gICAgICAgIC8vNT0+RmxvbWJhZXVcbiAgICAgICAgLy9XPT5XaXphcmRcbiAgICAgICAgaWYgKHVuaXZlcnNlLnBsYXllckFjaGlldmVtZW50cykge1xuICAgICAgICAgICAgbXlBY2hpZXZlbWVudHMgPSB1bml2ZXJzZS5wbGF5ZXJBY2hpZXZlbWVudHNbcGxheWVyLnVpZF07XG4gICAgICAgICAgICBpZiAocGxheWVyLnJhd0FsaWFzID09IFwiTG9yZW50elwiICYmXG4gICAgICAgICAgICAgICAgXCJXXCIgIT0gbXlBY2hpZXZlbWVudHMuYmFkZ2VzLnNsaWNlKDAsIDEpKSB7XG4gICAgICAgICAgICAgICAgbXlBY2hpZXZlbWVudHMuYmFkZ2VzID0gXCJXXCIuY29uY2F0KG15QWNoaWV2ZW1lbnRzLmJhZGdlcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChwbGF5ZXIucmF3QWxpYXMgPT0gXCJBIFN0b25lZCBBcGVcIiAmJlxuICAgICAgICAgICAgICAgIFwiNVwiICE9IG15QWNoaWV2ZW1lbnRzLmJhZGdlcy5zbGljZSgwLCAxKSkge1xuICAgICAgICAgICAgICAgIG15QWNoaWV2ZW1lbnRzLmJhZGdlcyA9IFwiNVwiLmNvbmNhdChteUFjaGlldmVtZW50cy5iYWRnZXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChteUFjaGlldmVtZW50cykge1xuICAgICAgICAgICAgbnB1aVxuICAgICAgICAgICAgICAgIC5TbWFsbEJhZGdlUm93KG15QWNoaWV2ZW1lbnRzLmJhZGdlcylcbiAgICAgICAgICAgICAgICAuZ3JpZCgwLCAzLCAzMCwgMylcbiAgICAgICAgICAgICAgICAucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICB9XG4gICAgICAgIENydXguV2lkZ2V0KFwiY29sX2JsYWNrXCIpLmdyaWQoMTAsIDYsIDIwLCAzKS5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgIGlmIChwbGF5ZXIudWlkICE9IGdldF9oZXJvKE5lcHR1bmVzUHJpZGUudW5pdmVyc2UpLnVpZCAmJiBwbGF5ZXIuYWkgPT0gMCkge1xuICAgICAgICAgICAgLy9Vc2UgdGhpcyB0byBvbmx5IHZpZXcgd2hlbiB0aGV5IGFyZSB3aXRoaW4gc2Nhbm5pbmc6XG4gICAgICAgICAgICAvL3VuaXZlcnNlLnNlbGVjdGVkU3Rhci52ICE9IFwiMFwiXG4gICAgICAgICAgICB2YXIgdG90YWxfc2VsbF9jb3N0ID0gZ2V0X3RlY2hfdHJhZGVfY29zdChnZXRfaGVybyhOZXB0dW5lc1ByaWRlLnVuaXZlcnNlKSwgcGxheWVyKTtcbiAgICAgICAgICAgIC8qKiogU0hBUkUgQUxMIFRFQ0ggICoqKi9cbiAgICAgICAgICAgIHZhciBidG4gPSBDcnV4LkJ1dHRvbihcIlwiLCBcInNoYXJlX2FsbF90ZWNoXCIsIHBsYXllcilcbiAgICAgICAgICAgICAgICAuYWRkU3R5bGUoXCJmd2RcIilcbiAgICAgICAgICAgICAgICAucmF3SFRNTChcIlNoYXJlIEFsbCBUZWNoOiAkXCIuY29uY2F0KHRvdGFsX3NlbGxfY29zdCkpXG4gICAgICAgICAgICAgICAgLmdyaWQoMTAsIDMxLCAxNCwgMyk7XG4gICAgICAgICAgICAvL0Rpc2FibGUgaWYgaW4gYSBnYW1lIHdpdGggRkEgJiBTY2FuIChCVUcpXG4gICAgICAgICAgICB2YXIgY29uZmlnID0gTmVwdHVuZXNQcmlkZS5nYW1lQ29uZmlnO1xuICAgICAgICAgICAgaWYgKCEoY29uZmlnLnRyYWRlU2Nhbm5lZCAmJiBjb25maWcuYWxsaWFuY2VzKSkge1xuICAgICAgICAgICAgICAgIGlmIChnZXRfaGVybyhOZXB0dW5lc1ByaWRlLnVuaXZlcnNlKS5jYXNoID49IHRvdGFsX3NlbGxfY29zdCkge1xuICAgICAgICAgICAgICAgICAgICBidG4ucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYnRuLmRpc2FibGUoKS5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLyoqKiBQQVkgRk9SIEFMTCBURUNIICoqKi9cbiAgICAgICAgICAgIHZhciB0b3RhbF9idXlfY29zdCA9IGdldF90ZWNoX3RyYWRlX2Nvc3QocGxheWVyLCBnZXRfaGVybyhOZXB0dW5lc1ByaWRlLnVuaXZlcnNlKSk7XG4gICAgICAgICAgICBidG4gPSBDcnV4LkJ1dHRvbihcIlwiLCBcImJ1eV9hbGxfdGVjaFwiLCB7XG4gICAgICAgICAgICAgICAgcGxheWVyOiBwbGF5ZXIsXG4gICAgICAgICAgICAgICAgdGVjaDogbnVsbCxcbiAgICAgICAgICAgICAgICBjb3N0OiB0b3RhbF9idXlfY29zdCxcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmFkZFN0eWxlKFwiZndkXCIpXG4gICAgICAgICAgICAgICAgLnJhd0hUTUwoXCJQYXkgZm9yIEFsbCBUZWNoOiAkXCIuY29uY2F0KHRvdGFsX2J1eV9jb3N0KSlcbiAgICAgICAgICAgICAgICAuZ3JpZCgxMCwgNDksIDE0LCAzKTtcbiAgICAgICAgICAgIGlmIChnZXRfaGVybyhOZXB0dW5lc1ByaWRlLnVuaXZlcnNlKS5jYXNoID49IHRvdGFsX3NlbGxfY29zdCkge1xuICAgICAgICAgICAgICAgIGJ0bi5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBidG4uZGlzYWJsZSgpLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8qSW5kaXZpZHVhbCB0ZWNocyovXG4gICAgICAgICAgICB2YXIgX25hbWVfbWFwID0ge1xuICAgICAgICAgICAgICAgIHNjYW5uaW5nOiBcIlNjYW5uaW5nXCIsXG4gICAgICAgICAgICAgICAgcHJvcHVsc2lvbjogXCJIeXBlcnNwYWNlIFJhbmdlXCIsXG4gICAgICAgICAgICAgICAgdGVycmFmb3JtaW5nOiBcIlRlcnJhZm9ybWluZ1wiLFxuICAgICAgICAgICAgICAgIHJlc2VhcmNoOiBcIkV4cGVyaW1lbnRhdGlvblwiLFxuICAgICAgICAgICAgICAgIHdlYXBvbnM6IFwiV2VhcG9uc1wiLFxuICAgICAgICAgICAgICAgIGJhbmtpbmc6IFwiQmFua2luZ1wiLFxuICAgICAgICAgICAgICAgIG1hbnVmYWN0dXJpbmc6IFwiTWFudWZhY3R1cmluZ1wiLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHZhciB0ZWNocyA9IFtcbiAgICAgICAgICAgICAgICBcInNjYW5uaW5nXCIsXG4gICAgICAgICAgICAgICAgXCJwcm9wdWxzaW9uXCIsXG4gICAgICAgICAgICAgICAgXCJ0ZXJyYWZvcm1pbmdcIixcbiAgICAgICAgICAgICAgICBcInJlc2VhcmNoXCIsXG4gICAgICAgICAgICAgICAgXCJ3ZWFwb25zXCIsXG4gICAgICAgICAgICAgICAgXCJiYW5raW5nXCIsXG4gICAgICAgICAgICAgICAgXCJtYW51ZmFjdHVyaW5nXCIsXG4gICAgICAgICAgICBdO1xuICAgICAgICAgICAgdGVjaHMuZm9yRWFjaChmdW5jdGlvbiAodGVjaCwgaSkge1xuICAgICAgICAgICAgICAgIHZhciBvbmVfdGVjaF9jb3N0ID0gZ2V0X3RlY2hfdHJhZGVfY29zdChwbGF5ZXIsIGdldF9oZXJvKE5lcHR1bmVzUHJpZGUudW5pdmVyc2UpLCB0ZWNoKTtcbiAgICAgICAgICAgICAgICB2YXIgb25lX3RlY2ggPSBDcnV4LkJ1dHRvbihcIlwiLCBcImJ1eV9vbmVfdGVjaFwiLCB7XG4gICAgICAgICAgICAgICAgICAgIHBsYXllcjogcGxheWVyLFxuICAgICAgICAgICAgICAgICAgICB0ZWNoOiB0ZWNoLFxuICAgICAgICAgICAgICAgICAgICBjb3N0OiBvbmVfdGVjaF9jb3N0LFxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIC5hZGRTdHlsZShcImZ3ZFwiKVxuICAgICAgICAgICAgICAgICAgICAucmF3SFRNTChcIlBheTogJFwiLmNvbmNhdChvbmVfdGVjaF9jb3N0KSlcbiAgICAgICAgICAgICAgICAgICAgLmdyaWQoMTUsIDM0LjUgKyBpICogMiwgNywgMik7XG4gICAgICAgICAgICAgICAgaWYgKGdldF9oZXJvKE5lcHR1bmVzUHJpZGUudW5pdmVyc2UpLmNhc2ggPj0gb25lX3RlY2hfY29zdCAmJlxuICAgICAgICAgICAgICAgICAgICBvbmVfdGVjaF9jb3N0ID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBvbmVfdGVjaC5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgQ3J1eC5UZXh0KFwieW91XCIsIFwicGFkMTIgdHh0X2NlbnRlclwiKS5ncmlkKDI1LCA2LCA1LCAzKS5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgIC8vIExhYmVsc1xuICAgICAgICBDcnV4LlRleHQoXCJ0b3RhbF9zdGFyc1wiLCBcInBhZDhcIikuZ3JpZCgxMCwgOSwgMTUsIDMpLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgQ3J1eC5UZXh0KFwidG90YWxfZmxlZXRzXCIsIFwicGFkOFwiKS5ncmlkKDEwLCAxMSwgMTUsIDMpLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgQ3J1eC5UZXh0KFwidG90YWxfc2hpcHNcIiwgXCJwYWQ4XCIpLmdyaWQoMTAsIDEzLCAxNSwgMykucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICBDcnV4LlRleHQoXCJuZXdfc2hpcHNcIiwgXCJwYWQ4XCIpLmdyaWQoMTAsIDE1LCAxNSwgMykucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICAvLyBUaGlzIHBsYXllcnMgc3RhdHNcbiAgICAgICAgaWYgKHBsYXllciAhPT0gdW5pdmVyc2UucGxheWVyKSB7XG4gICAgICAgICAgICBDcnV4LlRleHQoXCJcIiwgXCJwYWQ4IHR4dF9jZW50ZXJcIilcbiAgICAgICAgICAgICAgICAuZ3JpZCgyMCwgOSwgNSwgMylcbiAgICAgICAgICAgICAgICAucmF3SFRNTChwbGF5ZXIudG90YWxfc3RhcnMpXG4gICAgICAgICAgICAgICAgLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgICAgIENydXguVGV4dChcIlwiLCBcInBhZDggdHh0X2NlbnRlclwiKVxuICAgICAgICAgICAgICAgIC5ncmlkKDIwLCAxMSwgNSwgMylcbiAgICAgICAgICAgICAgICAucmF3SFRNTChwbGF5ZXIudG90YWxfZmxlZXRzKVxuICAgICAgICAgICAgICAgIC5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgICAgICBDcnV4LlRleHQoXCJcIiwgXCJwYWQ4IHR4dF9jZW50ZXJcIilcbiAgICAgICAgICAgICAgICAuZ3JpZCgyMCwgMTMsIDUsIDMpXG4gICAgICAgICAgICAgICAgLnJhd0hUTUwocGxheWVyLnRvdGFsX3N0cmVuZ3RoKVxuICAgICAgICAgICAgICAgIC5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgICAgICBDcnV4LlRleHQoXCJcIiwgXCJwYWQ4IHR4dF9jZW50ZXJcIilcbiAgICAgICAgICAgICAgICAuZ3JpZCgyMCwgMTUsIDUsIDMpXG4gICAgICAgICAgICAgICAgLnJhd0hUTUwocGxheWVyLnNoaXBzUGVyVGljaylcbiAgICAgICAgICAgICAgICAucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIHNlbGVjdEhpbGlnaHRTdHlsZShwMSwgcDIpIHtcbiAgICAgICAgICAgIHAxID0gTnVtYmVyKHAxKTtcbiAgICAgICAgICAgIHAyID0gTnVtYmVyKHAyKTtcbiAgICAgICAgICAgIGlmIChwMSA8IHAyKVxuICAgICAgICAgICAgICAgIHJldHVybiBcIiB0eHRfd2Fybl9iYWRcIjtcbiAgICAgICAgICAgIGlmIChwMSA+IHAyKVxuICAgICAgICAgICAgICAgIHJldHVybiBcIiB0eHRfd2Fybl9nb29kXCI7XG4gICAgICAgICAgICByZXR1cm4gXCJcIjtcbiAgICAgICAgfVxuICAgICAgICAvLyBZb3VyIHN0YXRzXG4gICAgICAgIGlmICh1bml2ZXJzZS5wbGF5ZXIpIHtcbiAgICAgICAgICAgIENydXguVGV4dChcIlwiLCBcInBhZDggdHh0X2NlbnRlciBcIi5jb25jYXQoc2VsZWN0SGlsaWdodFN0eWxlKHVuaXZlcnNlLnBsYXllci50b3RhbF9zdGFycywgcGxheWVyLnRvdGFsX3N0YXJzKSkpXG4gICAgICAgICAgICAgICAgLmdyaWQoMjUsIDksIDUsIDMpXG4gICAgICAgICAgICAgICAgLnJhd0hUTUwodW5pdmVyc2UucGxheWVyLnRvdGFsX3N0YXJzKVxuICAgICAgICAgICAgICAgIC5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgICAgICBDcnV4LlRleHQoXCJcIiwgXCJwYWQ4IHR4dF9jZW50ZXJcIi5jb25jYXQoc2VsZWN0SGlsaWdodFN0eWxlKHVuaXZlcnNlLnBsYXllci50b3RhbF9mbGVldHMsIHBsYXllci50b3RhbF9mbGVldHMpKSlcbiAgICAgICAgICAgICAgICAuZ3JpZCgyNSwgMTEsIDUsIDMpXG4gICAgICAgICAgICAgICAgLnJhd0hUTUwodW5pdmVyc2UucGxheWVyLnRvdGFsX2ZsZWV0cylcbiAgICAgICAgICAgICAgICAucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICAgICAgQ3J1eC5UZXh0KFwiXCIsIFwicGFkOCB0eHRfY2VudGVyXCIuY29uY2F0KHNlbGVjdEhpbGlnaHRTdHlsZSh1bml2ZXJzZS5wbGF5ZXIudG90YWxfc3RyZW5ndGgsIHBsYXllci50b3RhbF9zdHJlbmd0aCkpKVxuICAgICAgICAgICAgICAgIC5ncmlkKDI1LCAxMywgNSwgMylcbiAgICAgICAgICAgICAgICAucmF3SFRNTCh1bml2ZXJzZS5wbGF5ZXIudG90YWxfc3RyZW5ndGgpXG4gICAgICAgICAgICAgICAgLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgICAgIENydXguVGV4dChcIlwiLCBcInBhZDggdHh0X2NlbnRlclwiLmNvbmNhdChzZWxlY3RIaWxpZ2h0U3R5bGUodW5pdmVyc2UucGxheWVyLnNoaXBzUGVyVGljaywgcGxheWVyLnNoaXBzUGVyVGljaykpKVxuICAgICAgICAgICAgICAgIC5ncmlkKDI1LCAxNSwgNSwgMylcbiAgICAgICAgICAgICAgICAucmF3SFRNTCh1bml2ZXJzZS5wbGF5ZXIuc2hpcHNQZXJUaWNrKVxuICAgICAgICAgICAgICAgIC5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgIH1cbiAgICAgICAgQ3J1eC5XaWRnZXQoXCJjb2xfYWNjZW50XCIpLmdyaWQoMCwgMTYsIDEwLCAzKS5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgIGlmICh1bml2ZXJzZS5wbGF5ZXIpIHtcbiAgICAgICAgICAgIHZhciBtc2dCdG4gPSBDcnV4Lkljb25CdXR0b24oXCJpY29uLW1haWxcIiwgXCJpbmJveF9uZXdfbWVzc2FnZV90b19wbGF5ZXJcIiwgcGxheWVyLnVpZClcbiAgICAgICAgICAgICAgICAuZ3JpZCgwLCAxNiwgMywgMylcbiAgICAgICAgICAgICAgICAuYWRkU3R5bGUoXCJmd2RcIilcbiAgICAgICAgICAgICAgICAuZGlzYWJsZSgpXG4gICAgICAgICAgICAgICAgLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgICAgIGlmIChwbGF5ZXIgIT09IHVuaXZlcnNlLnBsYXllciAmJiBwbGF5ZXIuYWxpYXMpIHtcbiAgICAgICAgICAgICAgICBtc2dCdG4uZW5hYmxlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBDcnV4Lkljb25CdXR0b24oXCJpY29uLWNoYXJ0LWxpbmVcIiwgXCJzaG93X2ludGVsXCIsIHBsYXllci51aWQpXG4gICAgICAgICAgICAgICAgLmdyaWQoMi41LCAxNiwgMywgMylcbiAgICAgICAgICAgICAgICAucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICAgICAgaWYgKHNob3dFbXBpcmUpIHtcbiAgICAgICAgICAgICAgICBDcnV4Lkljb25CdXR0b24oXCJpY29uLWV5ZVwiLCBcInNob3dfc2NyZWVuXCIsIFwiZW1waXJlXCIpXG4gICAgICAgICAgICAgICAgICAgIC5ncmlkKDcsIDE2LCAzLCAzKVxuICAgICAgICAgICAgICAgICAgICAucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwbGF5ZXJQYW5lbDtcbiAgICB9O1xufTtcbnZhciBzdXBlclN0YXJJbnNwZWN0b3IgPSBOZXB0dW5lc1ByaWRlLm5wdWkuU3Rhckluc3BlY3Rvcjtcbk5lcHR1bmVzUHJpZGUubnB1aS5TdGFySW5zcGVjdG9yID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciB1bml2ZXJzZSA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2U7XG4gICAgdmFyIGNvbmZpZyA9IE5lcHR1bmVzUHJpZGUuZ2FtZUNvbmZpZztcbiAgICAvL0NhbGwgc3VwZXIgKFByZXZpb3VzIFN0YXJJbnNwZWN0b3IgZnJvbSBnYW1lY29kZSlcbiAgICB2YXIgc3Rhckluc3BlY3RvciA9IHN1cGVyU3Rhckluc3BlY3RvcigpO1xuICAgIC8vQXBwZW5kIGV4dHJhIGZ1bmN0aW9uXG4gICAgZnVuY3Rpb24gYXBwbHlfZnJhY3Rpb25hbF9zaGlwcygpIHtcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGRlcHRoLCBzZWxlY3RvciwgZWxlbWVudCwgY291bnRlciwgZnJhY3Rpb25hbF9zaGlwLCBmcmFjdGlvbmFsX3NoaXBfMSwgbmV3X3ZhbHVlO1xuICAgICAgICAgICAgcmV0dXJuIF9fZ2VuZXJhdG9yKHRoaXMsIGZ1bmN0aW9uIChfYSkge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAoX2EubGFiZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICAgICAgICAgICAgZGVwdGggPSBjb25maWcudHVybkJhc2VkID8gNCA6IDM7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RvciA9IFwiI2NvbnRlbnRBcmVhID4gZGl2ID4gZGl2LndpZGdldC5mdWxsc2NyZWVuID4gZGl2Om50aC1jaGlsZChcIi5jb25jYXQoZGVwdGgsIFwiKSA+IGRpdiA+IGRpdjpudGgtY2hpbGQoNSkgPiBkaXYud2lkZ2V0LnBhZDEyLmljb24tcm9ja2V0LWlubGluZS50eHRfcmlnaHRcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50ID0gJChzZWxlY3Rvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb3VudGVyID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZyYWN0aW9uYWxfc2hpcCA9IHVuaXZlcnNlLnNlbGVjdGVkU3RhcltcImNcIl0udG9GaXhlZCgyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICQoc2VsZWN0b3IpLmFwcGVuZChmcmFjdGlvbmFsX3NoaXApO1xuICAgICAgICAgICAgICAgICAgICAgICAgX2EubGFiZWwgPSAxO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIShlbGVtZW50Lmxlbmd0aCA9PSAwICYmIGNvdW50ZXIgPD0gMTAwKSkgcmV0dXJuIFszIC8qYnJlYWsqLywgM107XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzQgLyp5aWVsZCovLCBuZXcgUHJvbWlzZShmdW5jdGlvbiAocikgeyByZXR1cm4gc2V0VGltZW91dChyLCAxMCk7IH0pXTtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgICAgICAgICAgX2Euc2VudCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudCA9ICQoc2VsZWN0b3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZnJhY3Rpb25hbF9zaGlwXzEgPSB1bml2ZXJzZS5zZWxlY3RlZFN0YXJbXCJjXCJdO1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV3X3ZhbHVlID0gcGFyc2VJbnQoJChzZWxlY3RvcikudGV4dCgpKSArIGZyYWN0aW9uYWxfc2hpcF8xO1xuICAgICAgICAgICAgICAgICAgICAgICAgJChzZWxlY3RvcikudGV4dChuZXdfdmFsdWUudG9GaXhlZCgyKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb3VudGVyICs9IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzMgLypicmVhayovLCAxXTtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAzOiByZXR1cm4gWzIgLypyZXR1cm4qL107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAoXCJjXCIgaW4gdW5pdmVyc2Uuc2VsZWN0ZWRTdGFyKSB7XG4gICAgICAgIGFwcGx5X2ZyYWN0aW9uYWxfc2hpcHMoKTtcbiAgICB9XG4gICAgcmV0dXJuIHN0YXJJbnNwZWN0b3I7XG59O1xuc2V0VGltZW91dChMZWdhY3lfTmVwdHVuZXNQcmlkZUFnZW50LCAxMDAwKTtcbnNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgIHJlbmRlckxlZGdlcihOZXB0dW5lc1ByaWRlLCBDcnV4LCBNb3VzZXRyYXApO1xufSwgMTUwMCk7XG5zZXRUaW1lb3V0KGFwcGx5X2hvb2tzLCAxNTAwKTtcbi8vVGVzdCB0byBzZWUgaWYgUGxheWVyUGFuZWwgaXMgdGhlcmVcbi8vSWYgaXQgaXMgb3ZlcndyaXRlcyBjdXN0b20gb25lXG4vL090aGVyd2lzZSB3aGlsZSBsb29wICYgc2V0IHRpbWVvdXQgdW50aWwgaXRzIHRoZXJlXG5mb3JjZV9hZGRfY3VzdG9tX3BsYXllcl9wYW5lbCgpO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9