/******/ (function() { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./source/chat.ts":
/*!************************!*\
  !*** ./source/chat.ts ***!
  \************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MarkDownMessageComment: function() { return /* binding */ MarkDownMessageComment; },
/* harmony export */   get_research: function() { return /* binding */ get_research; },
/* harmony export */   get_research_text: function() { return /* binding */ get_research_text; }
/* harmony export */ });
/* harmony import */ var _get_hero__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./get_hero */ "./source/get_hero.ts");

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
    var hero = (0,_get_hero__WEBPACK_IMPORTED_MODULE_0__.get_hero)(game.universe);
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

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PlayerNameIconRowLink: function() { return /* binding */ PlayerNameIconRowLink; },
/* harmony export */   cacheFetchSize: function() { return /* binding */ cacheFetchSize; },
/* harmony export */   cacheFetchStart: function() { return /* binding */ cacheFetchStart; },
/* harmony export */   cached_events: function() { return /* binding */ cached_events; },
/* harmony export */   get_cached_events: function() { return /* binding */ get_cached_events; },
/* harmony export */   recieve_new_messages: function() { return /* binding */ recieve_new_messages; },
/* harmony export */   sync_message_cache: function() { return /* binding */ sync_message_cache; },
/* harmony export */   update_event_cache: function() { return /* binding */ update_event_cache; }
/* harmony export */ });
/* harmony import */ var _ledger__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./ledger */ "./source/ledger.ts");
/* harmony import */ var _get_hero__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./get_hero */ "./source/get_hero.ts");


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
        .then(function (response) {
        sync_message_cache(response); //Updates cached_events
        //cached_events = sync_message_cache(response))
    })
        .then(function (x) { return success(game, crux); })
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
function sync_message_cache(response) {
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
            //update_event_cache(game, crux, size, recieve_new_messages, console.error);
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
                alert("!! Invalid entries found");
                console.error("!! Invalid entries found: ", invalidEntries);
            }
            console.log("*** Validation Completed ***");
        }
        else {
            // the response didn't contain the entire event log. Go fetch
            // a version that _does_.
            /*
            update_event_cache(
              game,
              crux,
              100000,
              recieve_new_messages,
              console.error,
            );
            */
        }
    }
    cached_events = incoming.concat(cached_events);
}
function get_cached_events() {
    return cached_events;
}
//Handler to recieve new messages
function recieve_new_messages(game, crux) {
    var universe = game.universe;
    var npui = game.npui;
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
            if (p.debt * -1 <= (0,_get_hero__WEBPACK_IMPORTED_MODULE_1__.get_hero)(universe).cash) {
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

/***/ "./source/game.ts":
/*!************************!*\
  !*** ./source/game.ts ***!
  \************************/
/***/ (function() {



/***/ }),

/***/ "./source/get_hero.ts":
/*!****************************!*\
  !*** ./source/get_hero.ts ***!
  \****************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   get_hero: function() { return /* binding */ get_hero; }
/* harmony export */ });
/* harmony import */ var _utilities_get_game_state__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utilities/get_game_state */ "./source/utilities/get_game_state.ts");

function get_hero(universe) {
    if (universe === void 0) { universe = (0,_utilities_get_game_state__WEBPACK_IMPORTED_MODULE_0__.get_universe)(); }
    return universe.player;
}


/***/ }),

/***/ "./source/hotkey.ts":
/*!**************************!*\
  !*** ./source/hotkey.ts ***!
  \**************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   clip: function() { return /* binding */ clip; },
/* harmony export */   lastClip: function() { return /* binding */ lastClip; }
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

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   get_ledger: function() { return /* binding */ get_ledger; },
/* harmony export */   renderLedger: function() { return /* binding */ renderLedger; }
/* harmony export */ });
/* harmony import */ var _get_hero__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./get_hero */ "./source/get_hero.ts");
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
    var uid = (0,_get_hero__WEBPACK_IMPORTED_MODULE_0__.get_hero)(universe).uid;
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
    (0,_get_hero__WEBPACK_IMPORTED_MODULE_0__.get_hero)(universe).ledger = ledger;
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

/***/ "./source/utilities/api.ts":
/*!*********************************!*\
  !*** ./source/utilities/api.ts ***!
  \*********************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   get_api_data: function() { return /* binding */ get_api_data; }
/* harmony export */ });
/* harmony import */ var _get_game_state__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./get_game_state */ "./source/utilities/get_game_state.ts");

function get_api_data(apikey) {
    var game_number = (0,_get_game_state__WEBPACK_IMPORTED_MODULE_0__.get_game_number)();
    return fetch("https://np.ironhelmet.com/api", {
        headers: {
            accept: "application/json, text/javascript, */*; q=0.01",
            "accept-language": "en-US,en;q=0.9",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "x-requested-with": "XMLHttpRequest",
        },
        referrer: "https://np.ironhelmet.com/game/".concat(game_number),
        referrerPolicy: "strict-origin-when-cross-origin",
        body: "game_number=".concat(game_number, "&api_version=0.1&code=").concat(apikey),
        method: "POST",
        mode: "cors",
        credentials: "include",
    }).then(function (response) { return response.json(); });
}


/***/ }),

/***/ "./source/utilities/get_game_state.ts":
/*!********************************************!*\
  !*** ./source/utilities/get_game_state.ts ***!
  \********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   get_all_stars: function() { return /* binding */ get_all_stars; },
/* harmony export */   get_fleets: function() { return /* binding */ get_fleets; },
/* harmony export */   get_galaxy: function() { return /* binding */ get_galaxy; },
/* harmony export */   get_game_number: function() { return /* binding */ get_game_number; },
/* harmony export */   get_game_state: function() { return /* binding */ get_game_state; },
/* harmony export */   get_neptunes_pride: function() { return /* binding */ get_neptunes_pride; },
/* harmony export */   get_universe: function() { return /* binding */ get_universe; },
/* harmony export */   get_visible_stars: function() { return /* binding */ get_visible_stars; }
/* harmony export */ });
function get_visible_stars() {
    var stars = get_all_stars();
    if (stars === undefined)
        return undefined;
    var visible_stars = [];
    for (var _i = 0, _a = Object.entries(stars); _i < _a.length; _i++) {
        var _b = _a[_i], index = _b[0], star = _b[1];
        if (star.v === "1") {
            //Star is visible
            visible_stars.push(star);
        }
    }
    return visible_stars;
}
function get_game_number() {
    if (NeptunesPride === undefined)
        return undefined;
    return NeptunesPride.gameNumber;
}
function get_all_stars() {
    if (NeptunesPride === undefined)
        return undefined;
    return NeptunesPride.universe.galaxy.stars;
}
function get_fleets() {
    if (NeptunesPride === undefined)
        return undefined;
    return NeptunesPride.universe.galaxy.fleets;
}
function get_galaxy() {
    if (NeptunesPride === undefined)
        return undefined;
    return get_universe().galaxy;
}
function get_universe() {
    if (NeptunesPride === undefined)
        return undefined;
    return NeptunesPride.universe;
}
function get_neptunes_pride() {
    if (NeptunesPride === undefined)
        return undefined;
    return NeptunesPride.np;
}
function get_game_state() {
    if (NeptunesPride === undefined)
        return undefined;
    return NeptunesPride;
}


/***/ }),

/***/ "./source/utilities/graphics.ts":
/*!**************************************!*\
  !*** ./source/utilities/graphics.ts ***!
  \**************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   anyStarCanSee: function() { return /* binding */ anyStarCanSee; },
/* harmony export */   drawOverlayString: function() { return /* binding */ drawOverlayString; }
/* harmony export */ });
function drawOverlayString(context, text, x, y, fgColor) {
    context.fillStyle = "#000000";
    for (var smear = 1; smear < 4; ++smear) {
        context.fillText(text, x + smear, y + smear);
        context.fillText(text, x - smear, y + smear);
        context.fillText(text, x - smear, y - smear);
        context.fillText(text, x + smear, y - smear);
    }
    context.fillStyle = fgColor || "#00ff00";
    context.fillText(text, x, y);
}
function anyStarCanSee(universe, owner, fleet) {
    var stars = universe.galaxy.stars;
    var scanRange = universe.galaxy.players[owner].tech.scanning.value;
    for (var s in stars) {
        var star = stars[s];
        if (star.puid == owner) {
            var distance = universe.distance(star.x, star.y, parseFloat(fleet.x), parseFloat(fleet.y));
            if (distance <= scanRange) {
                return true;
            }
        }
    }
    return false;
}


/***/ }),

/***/ "./source/utilities/merge.ts":
/*!***********************************!*\
  !*** ./source/utilities/merge.ts ***!
  \***********************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   mergeUser: function() { return /* binding */ mergeUser; },
/* harmony export */   mergeUserData: function() { return /* binding */ mergeUserData; }
/* harmony export */ });
/* harmony import */ var _get_game_state__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./get_game_state */ "./source/utilities/get_game_state.ts");
/* harmony import */ var _api__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./api */ "./source/utilities/api.ts");


var originalPlayer = undefined;
//This saves the actual client's player.
function set_original_player() {
    if (originalPlayer === undefined) {
        originalPlayer = NeptunesPride.originalPlayer;
        return true;
    }
    return false;
}
function valid_apikey(apikey) {
    return true;
}
function bad_key(err) {
    console.log("The key is bad and merging FAILED!");
}
function mergeUser(event, data) {
    set_original_player();
    //Extract that KEY
    //TODO: Add regex to get THAT KEY
    var apikey = data === null || data === void 0 ? void 0 : data.split(":")[1];
    console.log(apikey);
    if (valid_apikey(apikey)) {
        (0,_api__WEBPACK_IMPORTED_MODULE_1__.get_api_data)(apikey)
            .then(function (data) {
            return "error" in data
                ? bad_key(data)
                : mergeUserData(data.scanning_data);
        })
            .catch(console.log);
    }
}
//Combine data from another user
//Callback on API ..
//mechanic closes at 5pm
//This works but now add it so it does not overtake your stars.
function mergeUserData(scanningData) {
    console.log("SAT Merging");
    var galaxy = (0,_get_game_state__WEBPACK_IMPORTED_MODULE_0__.get_galaxy)();
    var stars = scanningData.stars;
    var fleets = scanningData.fleets;
    // Update stars
    for (var starId in stars) {
        var star = stars[starId];
        if (galaxy.stars[starId] == undefined) {
            galaxy.stars[starId] = star;
        }
    }
    console.log("Syncing");
    // Add fleets
    for (var fleetId in fleets) {
        var fleet = fleets[fleetId];
        if (galaxy.fleets[fleetId] == undefined) {
            galaxy.fleets[fleetId] = fleet;
        }
    }
    //onFullUniverse Seems to additionally load all the players.
    NeptunesPride.np.onFullUniverse(null, galaxy);
    //NeptunesPride.npui.onHideScreen(null, true);
}


/***/ }),

/***/ "./source/utilities/npc_calc.ts":
/*!**************************************!*\
  !*** ./source/utilities/npc_calc.ts ***!
  \**************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   add_npc_tick_counter: function() { return /* binding */ add_npc_tick_counter; },
/* harmony export */   get_npc_tick: function() { return /* binding */ get_npc_tick; },
/* harmony export */   hook_npc_tick_counter: function() { return /* binding */ hook_npc_tick_counter; }
/* harmony export */ });
/* harmony import */ var _event_cache__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../event_cache */ "./source/event_cache.ts");

function get_npc_tick(game, crux) {
    var ai = game.universe.selectedPlayer;
    var cache = (0,_event_cache__WEBPACK_IMPORTED_MODULE_0__.get_cached_events)();
    var events = cache.map(function (e) { return e.payload; });
    var goodbyes = events.filter(function (e) {
        return e.template.includes("goodbye_to_player");
    });
    var tick = goodbyes.filter(function (e) { return e.uid == ai.uid; })[0].tick;
    console.log(tick);
    return tick;
}
function add_npc_tick_counter(game, crux) {
    var tick = get_npc_tick(game, crux);
    var title = document.querySelector("#contentArea > div > div.widget.fullscreen > div:nth-child(3) > div > div:nth-child(5) > div.widget.section_title.col_black");
    var subtitle = document.querySelector("#contentArea > div > div.widget.fullscreen > div:nth-child(3) > div > div:nth-child(5) > div.widget.txt_right.pad12");
    var current_tick = game.universe.galaxy.tick;
    var next_move = (current_tick - tick) % 4;
    var last_move = 4 - next_move;
    //let last_move = current_tick-next_move
    var postfix_1 = "";
    var postfix_2 = "";
    if (next_move != 1) {
        postfix_1 += "s";
    }
    if (last_move != 1) {
        postfix_2 += "s";
    }
    if (next_move == 0) {
        next_move = 4;
        title.innerText = "AI moves in ".concat(next_move, " tick").concat(postfix_1);
        subtitle.innerText = "AI moved this tick";
    }
    else {
        title.innerText = "AI moves in ".concat(next_move, " tick").concat(postfix_1);
        subtitle.innerText = "AI last moved ".concat(last_move, " tick").concat(postfix_2, " ago");
        //subtitle.innerText = `AI last moved on tick ${last_move}`
    }
}
function hook_npc_tick_counter(game, crux) {
    var selectedPlayer = game.universe.selectedPlayer;
    if (selectedPlayer.ai) {
        console.log("AI Selected");
        (0,_event_cache__WEBPACK_IMPORTED_MODULE_0__.update_event_cache)(game, crux, 4, add_npc_tick_counter, console.error);
    }
}


/***/ }),

/***/ "./source/utilities/parse_utils.ts":
/*!*****************************************!*\
  !*** ./source/utilities/parse_utils.ts ***!
  \*****************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   is_valid_image_url: function() { return /* binding */ is_valid_image_url; },
/* harmony export */   is_valid_youtube: function() { return /* binding */ is_valid_youtube; },
/* harmony export */   markdown: function() { return /* binding */ markdown; }
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

/***/ "./source/utilities/player_badges.ts":
/*!*******************************************!*\
  !*** ./source/utilities/player_badges.ts ***!
  \*******************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ApeBadgeIcon: function() { return /* binding */ ApeBadgeIcon; },
/* harmony export */   get_ape_badges: function() { return /* binding */ get_ape_badges; }
/* harmony export */ });
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
var KV_REST_API_URL = "https://immune-cricket-36011.kv.vercel-storage.com";
var KV_REST_API_READ_ONLY_TOKEN = "AoyrASQgNzE0M2E2NTMtMmFjNC00ZTFlLWJmNTItMGRlYWZmMmY3MTc0ZptG96elbXOjZJ7_GE7w-arYAGCaktoo25q4DXRWL7U=";
// Function that connects to server and retrieves list on key 'ape'
var get_ape_badges = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, fetch(KV_REST_API_URL, {
                headers: {
                    Authorization: "Bearer ".concat(KV_REST_API_READ_ONLY_TOKEN),
                },
                body: '["LRANGE", "ape", 0, -1]',
                method: "POST",
            })
                .then(function (response) { return response.json(); })
                .then(function (data) { return data.result; })];
    });
}); };
/* Updating Badge Classes */
var ApeBadgeIcon = function (Crux, url, filename, count, small) {
    var ebi = Crux.Widget();
    if (small === undefined)
        small = false;
    if (small) {
        /* Small images */
        var image_url = "/images/badges_small/".concat(filename, ".png");
        if (filename == "ape") {
            image_url = "".concat(url).concat(filename, "_small.png");
        }
        Crux.Image(image_url, "abs").grid(0.25, 0.25, 2.5, 2.5).roost(ebi);
        Crux.Clickable("show_screen", "buy_gift")
            .grid(0.25, 0.25, 2.5, 2.5)
            .tt("badge_".concat(filename))
            .roost(ebi);
    }
    else {
        /* Big images */
        var image_url = "/images/badges/".concat(filename, ".png");
        if (filename == "ape") {
            image_url = "".concat(url).concat(filename, ".png");
        }
        Crux.Image(image_url, "abs").grid(0, 0, 6, 6).tt(filename).roost(ebi);
        Crux.Clickable("show_screen", "buy_gift")
            .grid(0, 0, 6, 6)
            .tt("badge_".concat(filename))
            .roost(ebi);
    }
    if (count > 1 && !small) {
        Crux.Image("/images/badges/counter.png", "abs")
            .grid(0, 0, 6, 6)
            .tt(filename)
            .roost(ebi);
        Crux.Text("", "txt_center txt_tiny", "abs")
            .rawHTML(count)
            .pos(51, 64)
            .size(32, 32)
            .roost(ebi);
    }
    return ebi;
};
/*
const groupApeBadges = function (badgesString: string) {
  if (!badgesString) badgesString = "";
  var groupedBadges: { [key: string]: number } = {};
  var i;
  for (i = badgesString.length - 1; i >= 0; i--) {
    var bchar = badgesString.charAt(i);
    if (groupedBadges.hasOwnProperty(bchar)) {
      groupedBadges[bchar] += 1;
    } else {
      groupedBadges[bchar] = 1;
    }
  }
  return groupedBadges;
};
*/


/***/ }),

/***/ "./node_modules/marked/lib/marked.esm.js":
/*!***********************************************!*\
  !*** ./node_modules/marked/lib/marked.esm.js ***!
  \***********************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Hooks: function() { return /* binding */ Hooks; },
/* harmony export */   Lexer: function() { return /* binding */ Lexer; },
/* harmony export */   Parser: function() { return /* binding */ Parser; },
/* harmony export */   Renderer: function() { return /* binding */ Renderer; },
/* harmony export */   Slugger: function() { return /* binding */ Slugger; },
/* harmony export */   TextRenderer: function() { return /* binding */ TextRenderer; },
/* harmony export */   Tokenizer: function() { return /* binding */ Tokenizer; },
/* harmony export */   defaults: function() { return /* binding */ defaults; },
/* harmony export */   getDefaults: function() { return /* binding */ getDefaults; },
/* harmony export */   lexer: function() { return /* binding */ lexer; },
/* harmony export */   marked: function() { return /* binding */ marked; },
/* harmony export */   options: function() { return /* binding */ options; },
/* harmony export */   parse: function() { return /* binding */ parse; },
/* harmony export */   parseInline: function() { return /* binding */ parseInline; },
/* harmony export */   parser: function() { return /* binding */ parser; },
/* harmony export */   setOptions: function() { return /* binding */ setOptions; },
/* harmony export */   use: function() { return /* binding */ use; },
/* harmony export */   walkTokens: function() { return /* binding */ walkTokens; }
/* harmony export */ });
/**
 * marked v4.3.0 - a markdown parser
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
    hooks: null,
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
  fences: /^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/,
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

block.normal = { ...block };

/**
 * GFM Block Grammar
 */

block.gfm = {
  ...block.normal,
  table: '^ *([^\\n ].*\\|.*)\\n' // Header
    + ' {0,3}(?:\\| *)?(:?-+:? *(?:\\| *:?-+:? *)*)(?:\\| *)?' // Align
    + '(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)' // Cells
};

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

block.pedantic = {
  ...block.normal,
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
};

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

inline.normal = { ...inline };

/**
 * Pedantic Inline Grammar
 */

inline.pedantic = {
  ...inline.normal,
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
};

/**
 * GFM Inline Grammar
 */

inline.gfm = {
  ...inline.normal,
  escape: edit(inline.escape).replace('])', '~|])').getRegex(),
  _extended_email: /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/,
  url: /^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/,
  _backpedal: /(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,
  del: /^(~~?)(?=[^\s~])([\s\S]*?[^\s~])\1(?=[^~]|$)/,
  text: /^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/
};

inline.gfm.url = edit(inline.gfm.url, 'i')
  .replace('email', inline.gfm._extended_email)
  .getRegex();
/**
 * GFM + Line Breaks Inline Grammar
 */

inline.breaks = {
  ...inline.gfm,
  br: edit(inline.br).replace('{2,}', '*').getRegex(),
  text: edit(inline.gfm.text)
    .replace('\\b_', '\\b_| {2,}\\n')
    .replace(/\{2,\}/g, '*')
    .getRegex()
};

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

class Hooks {
  constructor(options) {
    this.options = options || defaults;
  }

  static passThroughHooks = new Set([
    'preprocess',
    'postprocess'
  ]);

  /**
   * Process markdown before marked
   */
  preprocess(markdown) {
    return markdown;
  }

  /**
   * Process HTML after marked is finished
   */
  postprocess(html) {
    return html;
  }
}

function onError(silent, async, callback) {
  return (e) => {
    e.message += '\nPlease report this to https://github.com/markedjs/marked.';

    if (silent) {
      const msg = '<p>An error occurred:</p><pre>'
        + escape(e.message + '', true)
        + '</pre>';
      if (async) {
        return Promise.resolve(msg);
      }
      if (callback) {
        callback(null, msg);
        return;
      }
      return msg;
    }

    if (async) {
      return Promise.reject(e);
    }
    if (callback) {
      callback(e);
      return;
    }
    throw e;
  };
}

function parseMarkdown(lexer, parser) {
  return (src, opt, callback) => {
    if (typeof opt === 'function') {
      callback = opt;
      opt = null;
    }

    const origOpt = { ...opt };
    opt = { ...marked.defaults, ...origOpt };
    const throwError = onError(opt.silent, opt.async, callback);

    // throw error in case of non string input
    if (typeof src === 'undefined' || src === null) {
      return throwError(new Error('marked(): input parameter is undefined or null'));
    }
    if (typeof src !== 'string') {
      return throwError(new Error('marked(): input parameter is of type '
        + Object.prototype.toString.call(src) + ', string expected'));
    }

    checkSanitizeDeprecation(opt);

    if (opt.hooks) {
      opt.hooks.options = opt;
    }

    if (callback) {
      const highlight = opt.highlight;
      let tokens;

      try {
        if (opt.hooks) {
          src = opt.hooks.preprocess(src);
        }
        tokens = lexer(src, opt);
      } catch (e) {
        return throwError(e);
      }

      const done = function(err) {
        let out;

        if (!err) {
          try {
            if (opt.walkTokens) {
              marked.walkTokens(tokens, opt.walkTokens);
            }
            out = parser(tokens, opt);
            if (opt.hooks) {
              out = opt.hooks.postprocess(out);
            }
          } catch (e) {
            err = e;
          }
        }

        opt.highlight = highlight;

        return err
          ? throwError(err)
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

    if (opt.async) {
      return Promise.resolve(opt.hooks ? opt.hooks.preprocess(src) : src)
        .then(src => lexer(src, opt))
        .then(tokens => opt.walkTokens ? Promise.all(marked.walkTokens(tokens, opt.walkTokens)).then(() => tokens) : tokens)
        .then(tokens => parser(tokens, opt))
        .then(html => opt.hooks ? opt.hooks.postprocess(html) : html)
        .catch(throwError);
    }

    try {
      if (opt.hooks) {
        src = opt.hooks.preprocess(src);
      }
      const tokens = lexer(src, opt);
      if (opt.walkTokens) {
        marked.walkTokens(tokens, opt.walkTokens);
      }
      let html = parser(tokens, opt);
      if (opt.hooks) {
        html = opt.hooks.postprocess(html);
      }
      return html;
    } catch (e) {
      return throwError(e);
    }
  };
}

/**
 * Marked
 */
function marked(src, opt, callback) {
  return parseMarkdown(Lexer.lex, Parser.parse)(src, opt, callback);
}

/**
 * Options
 */

marked.options =
marked.setOptions = function(opt) {
  marked.defaults = { ...marked.defaults, ...opt };
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
    const opts = { ...pack };

    // set async to true if it was set to true before
    opts.async = marked.defaults.async || opts.async || false;

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

    // ==-- Parse Hooks extensions --== //
    if (pack.hooks) {
      const hooks = marked.defaults.hooks || new Hooks();
      for (const prop in pack.hooks) {
        const prevHook = hooks[prop];
        if (Hooks.passThroughHooks.has(prop)) {
          hooks[prop] = (arg) => {
            if (marked.defaults.async) {
              return Promise.resolve(pack.hooks[prop].call(hooks, arg)).then(ret => {
                return prevHook.call(hooks, ret);
              });
            }

            const ret = pack.hooks[prop].call(hooks, arg);
            return prevHook.call(hooks, ret);
          };
        } else {
          hooks[prop] = (...args) => {
            let ret = pack.hooks[prop].apply(hooks, args);
            if (ret === false) {
              ret = prevHook.apply(hooks, args);
            }
            return ret;
          };
        }
      }
      opts.hooks = hooks;
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
marked.parseInline = parseMarkdown(Lexer.lexInline, Parser.parseInline);

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
marked.Hooks = Hooks;
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
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	!function() {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = function(module) {
/******/ 			var getter = module && module.__esModule ?
/******/ 				function() { return module['default']; } :
/******/ 				function() { return module; };
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	}();
/******/ 	
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
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
!function() {
"use strict";
/*!*************************!*\
  !*** ./source/intel.js ***!
  \*************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _chat__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./chat */ "./source/chat.ts");
/* harmony import */ var _game__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./game */ "./source/game.ts");
/* harmony import */ var _game__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_game__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _get_hero__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./get_hero */ "./source/get_hero.ts");
/* harmony import */ var _hotkey__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./hotkey */ "./source/hotkey.ts");
/* harmony import */ var _ledger__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./ledger */ "./source/ledger.ts");
/* harmony import */ var _utilities_merge__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./utilities/merge */ "./source/utilities/merge.ts");
/* harmony import */ var _utilities_parse_utils__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./utilities/parse_utils */ "./source/utilities/parse_utils.ts");
/* harmony import */ var _utilities_graphics__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./utilities/graphics */ "./source/utilities/graphics.ts");
/* harmony import */ var _utilities_npc_calc__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./utilities/npc_calc */ "./source/utilities/npc_calc.ts");
/* harmony import */ var _utilities_player_badges__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./utilities/player_badges */ "./source/utilities/player_badges.ts");
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










var SAT_VERSION = "git-version";
if (NeptunesPride === undefined) {
    _game__WEBPACK_IMPORTED_MODULE_1__.thisGame.neptunesPride = NeptunesPride;
}
String.prototype.toProperCase = function () {
    return this.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
};
/* Extra Badges */
var ape_players = [];
function get_ape_players() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            (0,_utilities_player_badges__WEBPACK_IMPORTED_MODULE_9__.get_ape_badges)()
                .then(function (players) {
                ape_players = players;
            })
                .catch(function (err) { return console.log("ERROR: Unable to get APE players", err); });
            return [2 /*return*/];
        });
    });
}
get_ape_players();
//Override widget intefaces
var overrideBadgeWidgets = function () {
    NeptunesPride.npui.badgeFileNames["a"] = "ape";
    var image_url = $("#ape-intel-plugin").attr("images");
    NeptunesPride.npui.BadgeIcon = function (filename, count, small) {
        return (0,_utilities_player_badges__WEBPACK_IMPORTED_MODULE_9__.ApeBadgeIcon)(Crux, image_url, filename, count, small);
    };
};
var overrideTemplates = function () {
    Crux.localise = function (id) {
        if (Crux.templates[id]) {
            return Crux.templates[id];
        }
        else {
            return id.toProperCase();
        }
    };
};
$("ape-intel-plugin").ready(function () {
    post_hook();
    //$("#ape-intel-plugin").remove();
});
function post_hook() {
    overrideTemplates();
    overrideBadgeWidgets();
    SAT_VERSION = $("#ape-intel-plugin").attr("title");
    console.log(SAT_VERSION);
}
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
        var total_cost = get_tech_trade_cost((0,_get_hero__WEBPACK_IMPORTED_MODULE_2__.get_hero)(NeptunesPride.universe), player);
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
        var hero = (0,_get_hero__WEBPACK_IMPORTED_MODULE_2__.get_hero)(NeptunesPride.universe);
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
            navigator.clipboard.writeText(_hotkey__WEBPACK_IMPORTED_MODULE_3__.lastClip);
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
        (0,_hotkey__WEBPACK_IMPORTED_MODULE_3__.clip)(output.join("\n"));
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
        (0,_hotkey__WEBPACK_IMPORTED_MODULE_3__.clip)(combatOutcomes().join("\n"));
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
        (0,_hotkey__WEBPACK_IMPORTED_MODULE_3__.clip)(flights.map(function (x) { return x[1]; }).join("\n"));
    }
    hotkey("^", briefFleetReport);
    briefFleetReport.help =
        "Generate a summary fleet report on all carriers in your scanning range, and copy it to the clipboard." +
            "<p>This same report can also be viewed via the menu; enter the agent and choose it from the dropdown.";
    function screenshot() {
        var map = NeptunesPride.npui.map;
        (0,_hotkey__WEBPACK_IMPORTED_MODULE_3__.clip)(map.canvas[0].toDataURL("image/webp", 0.05));
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
        (0,_hotkey__WEBPACK_IMPORTED_MODULE_3__.clip)(output.join("\n"));
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
        (0,_hotkey__WEBPACK_IMPORTED_MODULE_3__.clip)(output.join("\n"));
    };
    hotkey("$", playerSheet);
    playerSheet.help =
        "Generate a player summary mean to be made into a spreadsheet." +
            "<p>The clipboard should be pasted into a CSV and then imported.";
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
            (0,_utilities_graphics__WEBPACK_IMPORTED_MODULE_7__.drawOverlayString)(map.context, v, map.viewportWidth - 10, map.viewportHeight - 16 * map.pixelRatio);
            if (NeptunesPride.originalPlayer === undefined) {
                NeptunesPride.originalPlayer = universe.player.uid;
            }
            if (NeptunesPride.originalPlayer !== universe.player.uid) {
                var n = universe.galaxy.players[universe.player.uid].alias;
                (0,_utilities_graphics__WEBPACK_IMPORTED_MODULE_7__.drawOverlayString)(map.context, n, map.viewportWidth - 100, map.viewportHeight - 2 * 16 * map.pixelRatio);
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
                (0,_utilities_graphics__WEBPACK_IMPORTED_MODULE_7__.drawOverlayString)(map.context, s, x, y);
                (0,_utilities_graphics__WEBPACK_IMPORTED_MODULE_7__.drawOverlayString)(map.context, o, x, y + lineHeight);
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
                (0,_utilities_graphics__WEBPACK_IMPORTED_MODULE_7__.drawOverlayString)(map.context, s, 1000, lineHeight);
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
                                    if ((0,_utilities_graphics__WEBPACK_IMPORTED_MODULE_7__.anyStarCanSee)(universe.selectedStar.puid, fleet)) {
                                        visColor = "#888888";
                                    }
                                    (0,_utilities_graphics__WEBPACK_IMPORTED_MODULE_7__.drawOverlayString)(map.context, "Scan ".concat(tickToEtaString(ticks)), x, y, visColor);
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
                else if ((0,_utilities_parse_utils__WEBPACK_IMPORTED_MODULE_6__.is_valid_image_url)(uri)) {
                    s = s.replace(pattern, "<img width=\"100%\" src='".concat(uri, "' />"));
                }
                else if ((0,_utilities_parse_utils__WEBPACK_IMPORTED_MODULE_6__.is_valid_youtube)(uri)) {
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
            var text = (0,_chat__WEBPACK_IMPORTED_MODULE_0__.get_research_text)(NeptunesPride);
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
    //This puts you into their position.
    //How is it different?
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
            //Loads the pull universe data into the function. Thats the difference.
            //The other version loads an updated galaxy into the function
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
    hotkey("|", _utilities_merge__WEBPACK_IMPORTED_MODULE_5__.mergeUser);
    _utilities_merge__WEBPACK_IMPORTED_MODULE_5__.mergeUser.help =
        "Merge the latest data from the last user whose API key was used to load data. This is useful after a tick " +
            "passes and you've reloaded, but you still want the merged scan data from two players onscreen.";
    NeptunesPride.np.on("switch_user_api", switchUser);
    NeptunesPride.np.on("merge_user_api", _utilities_merge__WEBPACK_IMPORTED_MODULE_5__.mergeUser);
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
    console.log("Getting hero!", (0,_get_hero__WEBPACK_IMPORTED_MODULE_2__.get_hero)(NeptunesPride.universe));
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
        // Achievements
        var myAchievements;
        //U=>Toxic
        //V=>Magic
        //5=>Flombaeu
        //W=>Wizard
        if (universe.playerAchievements) {
            myAchievements = universe.playerAchievements[player.uid];
            if (ape_players === null || ape_players === void 0 ? void 0 : ape_players.includes(player.rawAlias)) {
                if (myAchievements.extra_badges == undefined) {
                    myAchievements.extra_badges = true;
                    myAchievements.badges = "a".concat(myAchievements.badges);
                }
            }
            if (player.rawAlias == "Lorentz") {
                if (myAchievements.dev_badge == undefined) {
                    myAchievements.dev_badge = true;
                    myAchievements.badges = "W".concat(myAchievements.badges);
                }
            }
            else if (player.rawAlias == "A Stoned Ape") {
                if (myAchievements.dev_badge == undefined) {
                    myAchievements.dev_badge = true;
                    myAchievements.badges = "5".concat(myAchievements.badges);
                }
            }
        }
        if (myAchievements) {
            npui
                .SmallBadgeRow(myAchievements.badges)
                .grid(0, 3, 30, 3)
                .roost(playerPanel);
        }
        Crux.Widget("col_black").grid(10, 6, 20, 3).roost(playerPanel);
        if (player.uid != (0,_get_hero__WEBPACK_IMPORTED_MODULE_2__.get_hero)(NeptunesPride.universe).uid && player.ai == 0) {
            //Use this to only view when they are within scanning:
            //universe.selectedStar.v != "0"
            var total_sell_cost = get_tech_trade_cost((0,_get_hero__WEBPACK_IMPORTED_MODULE_2__.get_hero)(NeptunesPride.universe), player);
            /*** SHARE ALL TECH  ***/
            var btn = Crux.Button("", "share_all_tech", player)
                .addStyle("fwd")
                .rawHTML("Share All Tech: $".concat(total_sell_cost))
                .grid(10, 31, 14, 3);
            //Disable if in a game with FA & Scan (BUG)
            var config = NeptunesPride.gameConfig;
            if (!(config.tradeScanned && config.alliances)) {
                if ((0,_get_hero__WEBPACK_IMPORTED_MODULE_2__.get_hero)(NeptunesPride.universe).cash >= total_sell_cost) {
                    btn.roost(playerPanel);
                }
                else {
                    btn.disable().roost(playerPanel);
                }
            }
            /*** PAY FOR ALL TECH ***/
            var total_buy_cost = get_tech_trade_cost(player, (0,_get_hero__WEBPACK_IMPORTED_MODULE_2__.get_hero)(NeptunesPride.universe));
            btn = Crux.Button("", "buy_all_tech", {
                player: player,
                tech: null,
                cost: total_buy_cost,
            })
                .addStyle("fwd")
                .rawHTML("Pay for All Tech: $".concat(total_buy_cost))
                .grid(10, 49, 14, 3);
            if ((0,_get_hero__WEBPACK_IMPORTED_MODULE_2__.get_hero)(NeptunesPride.universe).cash >= total_sell_cost) {
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
                var one_tech_cost = get_tech_trade_cost(player, (0,_get_hero__WEBPACK_IMPORTED_MODULE_2__.get_hero)(NeptunesPride.universe), tech);
                var one_tech = Crux.Button("", "buy_one_tech", {
                    player: player,
                    tech: tech,
                    cost: one_tech_cost,
                })
                    .addStyle("fwd")
                    .rawHTML("Pay: $".concat(one_tech_cost))
                    .grid(15, 34.5 + i * 2, 7, 2);
                if ((0,_get_hero__WEBPACK_IMPORTED_MODULE_2__.get_hero)(NeptunesPride.universe).cash >= one_tech_cost &&
                    one_tech_cost > 0) {
                    one_tech.roost(playerPanel);
                }
            });
        }
        //NPC Calc
        (0,_utilities_npc_calc__WEBPACK_IMPORTED_MODULE_8__.hook_npc_tick_counter)(NeptunesPride, Crux);
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
//Javascript call
setTimeout(Legacy_NeptunesPrideAgent, 1000);
setTimeout(function () {
    //Typescript call
    post_hook();
    (0,_ledger__WEBPACK_IMPORTED_MODULE_4__.renderLedger)(NeptunesPride, Crux, Mousetrap);
}, 800);
setTimeout(apply_hooks, 1500);
//Test to see if PlayerPanel is there
//If it is overwrites custom one
//Otherwise while loop & set timeout until its there
force_add_custom_player_panel();

}();
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QVE7QUFDbkIsV0FBVyxRQUFRO0FBQ25CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLHNDQUFzQyxJQUFJO0FBQzFDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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LDBDQUEwQyxhQUFhO0FBQ3ZEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQ0FBMkMsYUFBYTtBQUN4RCxpRUFBaUU7QUFDakUsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDRCQUE0QixhQUFhO0FBQ3pDO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMENBQTBDLGFBQWE7QUFDdkQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJDQUEyQyxhQUFhO0FBQ3hELGlFQUFpRTtBQUNqRSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkNBQTJDO0FBQzNDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVB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QUNsQjtBQUNBO0FBQ0E7QUFDQSxtQkFBbUI7QUFDbkI7QUFDQSxnQkFBZ0I7QUFDaEI7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsZ0JBQWdCLE9BQU87QUFDdkI7O0FBRUE7QUFDQTtBQUNBLG1FQUFtRSxjQUFjO0FBQ2pGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0RBQXNEO0FBQ3REO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwQkFBMEIsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLElBQUksR0FBRztBQUNsRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0NBQW9DLEVBQUUsRUFBRSxHQUFHLEdBQUcsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFO0FBQzVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNENBQTRDLEdBQUcsR0FBRyxHQUFHLE1BQU0sRUFBRSxNQUFNLEVBQUU7QUFDckU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwQ0FBMEMsR0FBRyxVQUFVLEVBQUU7QUFDekQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNDQUFzQyxFQUFFLEtBQUssR0FBRyxHQUFHLEdBQUcsTUFBTSxFQUFFLE1BQU0sRUFBRTtBQUN0RTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMENBQTBDLEVBQUU7QUFDNUMsNENBQTRDLEdBQUcsV0FBVyxFQUFFO0FBQzVELDRDQUE0QyxHQUFHLFdBQVcsRUFBRTtBQUM1RDtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNEQUFzRCxHQUFHLEdBQUcsRUFBRTtBQUM5RDtBQUNBO0FB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dC8uL3NvdXJjZS9jaGF0LnRzIiwid2VicGFjazovL25lcHR1bmVzLXByaWRlLWFnZW50Ly4vc291cmNlL2V2ZW50X2NhY2hlLnRzIiwid2VicGFjazovL25lcHR1bmVzLXByaWRlLWFnZW50Ly4vc291cmNlL2dhbWUudHMiLCJ3ZWJwYWNrOi8vbmVwdHVuZXMtcHJpZGUtYWdlbnQvLi9zb3VyY2UvZ2V0X2hlcm8udHMiLCJ3ZWJwYWNrOi8vbmVwdHVuZXMtcHJpZGUtYWdlbnQvLi9zb3VyY2UvaG90a2V5LnRzIiwid2VicGFjazovL25lcHR1bmVzLXByaWRlLWFnZW50Ly4vc291cmNlL2xlZGdlci50cyIsIndlYnBhY2s6Ly9uZXB0dW5lcy1wcmlkZS1hZ2VudC8uL3NvdXJjZS91dGlsaXRpZXMvYXBpLnRzIiwid2VicGFjazovL25lcHR1bmVzLXByaWRlLWFnZW50Ly4vc291cmNlL3V0aWxpdGllcy9nZXRfZ2FtZV9zdGF0ZS50cyIsIndlYnBhY2s6Ly9uZXB0dW5lcy1wcmlkZS1hZ2VudC8uL3NvdXJjZS91dGlsaXRpZXMvZ3JhcGhpY3MudHMiLCJ3ZWJwYWNrOi8vbmVwdHVuZXMtcHJpZGUtYWdlbnQvLi9zb3VyY2UvdXRpbGl0aWVzL21lcmdlLnRzIiwid2VicGFjazovL25lcHR1bmVzLXByaWRlLWFnZW50Ly4vc291cmNlL3V0aWxpdGllcy9ucGNfY2FsYy50cyIsIndlYnBhY2s6Ly9uZXB0dW5lcy1wcmlkZS1hZ2VudC8uL3NvdXJjZS91dGlsaXRpZXMvcGFyc2VfdXRpbHMudHMiLCJ3ZWJwYWNrOi8vbmVwdHVuZXMtcHJpZGUtYWdlbnQvLi9zb3VyY2UvdXRpbGl0aWVzL3BsYXllcl9iYWRnZXMudHMiLCJ3ZWJwYWNrOi8vbmVwdHVuZXMtcHJpZGUtYWdlbnQvLi9ub2RlX21vZHVsZXMvbWFya2VkL2xpYi9tYXJrZWQuZXNtLmpzIiwid2VicGFjazovL25lcHR1bmVzLXByaWRlLWFnZW50L3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL25lcHR1bmVzLXByaWRlLWFnZW50L3dlYnBhY2svcnVudGltZS9jb21wYXQgZ2V0IGRlZmF1bHQgZXhwb3J0Iiwid2VicGFjazovL25lcHR1bmVzLXByaWRlLWFnZW50L3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9uZXB0dW5lcy1wcmlkZS1hZ2VudC93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL25lcHR1bmVzLXByaWRlLWFnZW50L3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vbmVwdHVuZXMtcHJpZGUtYWdlbnQvLi9zb3VyY2UvaW50ZWwuanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZ2V0X2hlcm8gfSBmcm9tIFwiLi9nZXRfaGVyb1wiO1xudmFyIFJFU0VBQ0hfTUFQID0ge1xuICAgIHNjYW5uaW5nOiBcIlNjYW5uaW5nXCIsXG4gICAgcHJvcHVsc2lvbjogXCJIeXBlcnNwYWNlIFJhbmdlXCIsXG4gICAgdGVycmFmb3JtaW5nOiBcIlRlcnJhZm9ybWluZ1wiLFxuICAgIHJlc2VhcmNoOiBcIkV4cGVyaW1lbnRhdGlvblwiLFxuICAgIHdlYXBvbnM6IFwiV2VhcG9uc1wiLFxuICAgIGJhbmtpbmc6IFwiQmFua2luZ1wiLFxuICAgIG1hbnVmYWN0dXJpbmc6IFwiTWFudWZhY3R1cmluZ1wiLFxufTtcbi8vRm9yIHF1aWNrIHJlc2VhcmNoIGRpc3BsYXlcbmZ1bmN0aW9uIGdldF9yZXNlYXJjaChnYW1lKSB7XG4gICAgdmFyIHVuaXZlcnNlID0gZ2FtZS51bml2ZXJzZTtcbiAgICB2YXIgaGVybyA9IGdldF9oZXJvKGdhbWUudW5pdmVyc2UpO1xuICAgIHZhciBzY2llbmNlID0gaGVyby50b3RhbF9zY2llbmNlO1xuICAgIC8vQ3VycmVudCBTY2llbmNlXG4gICAgdmFyIGN1cnJlbnQgPSBoZXJvLnRlY2hbaGVyby5yZXNlYXJjaGluZ107XG4gICAgdmFyIGN1cnJlbnRfcG9pbnRzX3JlbWFpbmluZyA9IGN1cnJlbnQuYnJyICogY3VycmVudC5sZXZlbCAtIGN1cnJlbnQucmVzZWFyY2g7XG4gICAgdmFyIGV0YSA9IE1hdGguY2VpbChjdXJyZW50X3BvaW50c19yZW1haW5pbmcgLyBzY2llbmNlKTsgLy9Ib3Vyc1xuICAgIC8vTmV4dCBzY2llbmNlXG4gICAgdmFyIG5leHQgPSBoZXJvLnRlY2hbaGVyby5yZXNlYXJjaGluZ19uZXh0XTtcbiAgICB2YXIgbmV4dF9wb2ludHNfcmVtYWluaW5nID0gbmV4dC5icnIgKiBuZXh0LmxldmVsIC0gbmV4dC5yZXNlYXJjaDtcbiAgICB2YXIgbmV4dF9ldGEgPSBNYXRoLmNlaWwobmV4dF9wb2ludHNfcmVtYWluaW5nIC8gc2NpZW5jZSkgKyBldGE7XG4gICAgdmFyIG5leHRfbGV2ZWwgPSBuZXh0LmxldmVsICsgMTtcbiAgICBpZiAoaGVyby5yZXNlYXJjaGluZyA9PSBoZXJvLnJlc2VhcmNoaW5nX25leHQpIHtcbiAgICAgICAgLy9SZWN1cnJpbmcgcmVzZWFyY2hcbiAgICAgICAgbmV4dF9wb2ludHNfcmVtYWluaW5nICs9IG5leHQuYnJyO1xuICAgICAgICBuZXh0X2V0YSA9IE1hdGguY2VpbCgobmV4dC5icnIgKiBuZXh0LmxldmVsICsgMSkgLyBzY2llbmNlKSArIGV0YTtcbiAgICAgICAgbmV4dF9sZXZlbCArPSAxO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICBjdXJyZW50X25hbWU6IFJFU0VBQ0hfTUFQW2hlcm8ucmVzZWFyY2hpbmddLFxuICAgICAgICBjdXJyZW50X2xldmVsOiBjdXJyZW50W1wibGV2ZWxcIl0gKyAxLFxuICAgICAgICBjdXJyZW50X2V0YTogZXRhLFxuICAgICAgICBuZXh0X25hbWU6IFJFU0VBQ0hfTUFQW2hlcm8ucmVzZWFyY2hpbmdfbmV4dF0sXG4gICAgICAgIG5leHRfbGV2ZWw6IG5leHRfbGV2ZWwsXG4gICAgICAgIG5leHRfZXRhOiBuZXh0X2V0YSxcbiAgICAgICAgc2NpZW5jZTogc2NpZW5jZSxcbiAgICB9O1xufVxuZnVuY3Rpb24gZ2V0X3Jlc2VhcmNoX3RleHQoZ2FtZSkge1xuICAgIHZhciByZXNlYXJjaCA9IGdldF9yZXNlYXJjaChnYW1lKTtcbiAgICB2YXIgZmlyc3RfbGluZSA9IFwiTm93OiBcIi5jb25jYXQocmVzZWFyY2hbXCJjdXJyZW50X25hbWVcIl0sIFwiIFwiKS5jb25jYXQocmVzZWFyY2hbXCJjdXJyZW50X2xldmVsXCJdLCBcIiAtIFwiKS5jb25jYXQocmVzZWFyY2hbXCJjdXJyZW50X2V0YVwiXSwgXCIgdGlja3MuXCIpO1xuICAgIHZhciBzZWNvbmRfbGluZSA9IFwiTmV4dDogXCIuY29uY2F0KHJlc2VhcmNoW1wibmV4dF9uYW1lXCJdLCBcIiBcIikuY29uY2F0KHJlc2VhcmNoW1wibmV4dF9sZXZlbFwiXSwgXCIgLSBcIikuY29uY2F0KHJlc2VhcmNoW1wibmV4dF9ldGFcIl0sIFwiIHRpY2tzLlwiKTtcbiAgICB2YXIgdGhpcmRfbGluZSA9IFwiTXkgU2NpZW5jZTogXCIuY29uY2F0KHJlc2VhcmNoW1wic2NpZW5jZVwiXSk7XG4gICAgcmV0dXJuIFwiXCIuY29uY2F0KGZpcnN0X2xpbmUsIFwiXFxuXCIpLmNvbmNhdChzZWNvbmRfbGluZSwgXCJcXG5cIikuY29uY2F0KHRoaXJkX2xpbmUsIFwiXFxuXCIpO1xufVxuZnVuY3Rpb24gTWFya0Rvd25NZXNzYWdlQ29tbWVudChjb250ZXh0LCB0ZXh0LCBpbmRleCkge1xuICAgIHZhciBtZXNzYWdlQ29tbWVudCA9IGNvbnRleHQuTWVzc2FnZUNvbW1lbnQodGV4dCwgaW5kZXgpO1xuICAgIHJldHVybiBcIlwiO1xufVxuZXhwb3J0IHsgZ2V0X3Jlc2VhcmNoLCBnZXRfcmVzZWFyY2hfdGV4dCwgTWFya0Rvd25NZXNzYWdlQ29tbWVudCB9O1xuIiwiaW1wb3J0IHsgZ2V0X2xlZGdlciB9IGZyb20gXCIuL2xlZGdlclwiO1xuaW1wb3J0IHsgZ2V0X2hlcm8gfSBmcm9tIFwiLi9nZXRfaGVyb1wiO1xuLy9HbG9iYWwgY2FjaGVkIGV2ZW50IHN5c3RlbS5cbmV4cG9ydCB2YXIgY2FjaGVkX2V2ZW50cyA9IFtdO1xuZXhwb3J0IHZhciBjYWNoZUZldGNoU3RhcnQgPSBuZXcgRGF0ZSgpO1xuZXhwb3J0IHZhciBjYWNoZUZldGNoU2l6ZSA9IDA7XG4vL0FzeW5jIHJlcXVlc3QgZ2FtZSBldmVudHNcbi8vZ2FtZSBpcyB1c2VkIHRvIGdldCB0aGUgYXBpIHZlcnNpb24gYW5kIHRoZSBnYW1lTnVtYmVyXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlX2V2ZW50X2NhY2hlKGdhbWUsIGNydXgsIGZldGNoU2l6ZSwgc3VjY2VzcywgZXJyb3IpIHtcbiAgICB2YXIgY291bnQgPSBjYWNoZWRfZXZlbnRzLmxlbmd0aCA+IDAgPyBmZXRjaFNpemUgOiAxMDAwMDA7XG4gICAgY2FjaGVGZXRjaFN0YXJ0ID0gbmV3IERhdGUoKTtcbiAgICBjYWNoZUZldGNoU2l6ZSA9IGNvdW50O1xuICAgIHZhciBwYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHtcbiAgICAgICAgdHlwZTogXCJmZXRjaF9nYW1lX21lc3NhZ2VzXCIsXG4gICAgICAgIGNvdW50OiBjb3VudC50b1N0cmluZygpLFxuICAgICAgICBvZmZzZXQ6IFwiMFwiLFxuICAgICAgICBncm91cDogXCJnYW1lX2V2ZW50XCIsXG4gICAgICAgIHZlcnNpb246IGdhbWUudmVyc2lvbixcbiAgICAgICAgZ2FtZV9udW1iZXI6IGdhbWUuZ2FtZU51bWJlcixcbiAgICB9KTtcbiAgICB2YXIgaGVhZGVycyA9IHtcbiAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWRuXCIsXG4gICAgfTtcbiAgICBmZXRjaChcIi90cmVxdWVzdC9mZXRjaF9nYW1lX21lc3NhZ2VzXCIsIHtcbiAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWRcIixcbiAgICAgICAgfSxcbiAgICAgICAgYm9keTogcGFyYW1zLFxuICAgIH0pXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkgeyByZXR1cm4gcmVzcG9uc2UuanNvbigpOyB9KVxuICAgICAgICAudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgc3luY19tZXNzYWdlX2NhY2hlKHJlc3BvbnNlKTsgLy9VcGRhdGVzIGNhY2hlZF9ldmVudHNcbiAgICAgICAgLy9jYWNoZWRfZXZlbnRzID0gc3luY19tZXNzYWdlX2NhY2hlKHJlc3BvbnNlKSlcbiAgICB9KVxuICAgICAgICAudGhlbihmdW5jdGlvbiAoeCkgeyByZXR1cm4gc3VjY2VzcyhnYW1lLCBjcnV4KTsgfSlcbiAgICAgICAgLmNhdGNoKGVycm9yKTtcbn1cbi8vQ3VzdG9tIFVJIENvbXBvbmVudHMgZm9yIExlZGdlclxuZXhwb3J0IGZ1bmN0aW9uIFBsYXllck5hbWVJY29uUm93TGluayhjcnV4LCBucHVpLCBwbGF5ZXIpIHtcbiAgICB2YXIgcGxheWVyTmFtZUljb25Sb3cgPSBjcnV4LldpZGdldChcInJlbCBjb2xfYmxhY2sgY2xpY2thYmxlXCIpLnNpemUoNDgwLCA0OCk7XG4gICAgbnB1aS5QbGF5ZXJJY29uKHBsYXllciwgdHJ1ZSkucm9vc3QocGxheWVyTmFtZUljb25Sb3cpO1xuICAgIGNydXhcbiAgICAgICAgLlRleHQoXCJcIiwgXCJzZWN0aW9uX3RpdGxlXCIpXG4gICAgICAgIC5ncmlkKDYsIDAsIDIxLCAzKVxuICAgICAgICAucmF3SFRNTChcIjxhIG9uY2xpY2s9XFxcIkNydXguY3J1eC50cmlnZ2VyKCdzaG93X3BsYXllcl91aWQnLCAnXCIuY29uY2F0KHBsYXllci51aWQsIFwiJyApXFxcIj5cIikuY29uY2F0KHBsYXllci5hbGlhcywgXCI8L2E+XCIpKVxuICAgICAgICAucm9vc3QocGxheWVyTmFtZUljb25Sb3cpO1xuICAgIHJldHVybiBwbGF5ZXJOYW1lSWNvblJvdztcbn1cbmV4cG9ydCBmdW5jdGlvbiBzeW5jX21lc3NhZ2VfY2FjaGUocmVzcG9uc2UpIHtcbiAgICB2YXIgY2FjaGVGZXRjaEVuZCA9IG5ldyBEYXRlKCk7XG4gICAgdmFyIGVsYXBzZWQgPSBjYWNoZUZldGNoRW5kLmdldFRpbWUoKSAtIGNhY2hlRmV0Y2hTdGFydC5nZXRUaW1lKCk7XG4gICAgY29uc29sZS5sb2coXCJGZXRjaGVkIFwiLmNvbmNhdChjYWNoZUZldGNoU2l6ZSwgXCIgZXZlbnRzIGluIFwiKS5jb25jYXQoZWxhcHNlZCwgXCJtc1wiKSk7XG4gICAgdmFyIGluY29taW5nID0gcmVzcG9uc2UucmVwb3J0Lm1lc3NhZ2VzO1xuICAgIGlmIChjYWNoZWRfZXZlbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdmFyIG92ZXJsYXBPZmZzZXQgPSAtMTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbmNvbWluZy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBpbmNvbWluZ1tpXTtcbiAgICAgICAgICAgIGlmIChtZXNzYWdlLmtleSA9PT0gY2FjaGVkX2V2ZW50c1swXS5rZXkpIHtcbiAgICAgICAgICAgICAgICBvdmVybGFwT2Zmc2V0ID0gaTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAob3ZlcmxhcE9mZnNldCA+PSAwKSB7XG4gICAgICAgICAgICBpbmNvbWluZyA9IGluY29taW5nLnNsaWNlKDAsIG92ZXJsYXBPZmZzZXQpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG92ZXJsYXBPZmZzZXQgPCAwKSB7XG4gICAgICAgICAgICB2YXIgc2l6ZSA9IGluY29taW5nLmxlbmd0aCAqIDI7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIk1pc3Npbmcgc29tZSBldmVudHMsIGRvdWJsZSBmZXRjaCB0byBcIi5jb25jYXQoc2l6ZSkpO1xuICAgICAgICAgICAgLy91cGRhdGVfZXZlbnRfY2FjaGUoZ2FtZSwgY3J1eCwgc2l6ZSwgcmVjaWV2ZV9uZXdfbWVzc2FnZXMsIGNvbnNvbGUuZXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIHdlIGhhZCBjYWNoZWQgZXZlbnRzLCBidXQgd2FudCB0byBiZSBleHRyYSBwYXJhbm9pZCBhYm91dFxuICAgICAgICAvLyBjb3JyZWN0bmVzcy4gU28gaWYgdGhlIHJlc3BvbnNlIGNvbnRhaW5lZCB0aGUgZW50aXJlIGV2ZW50XG4gICAgICAgIC8vIGxvZywgdmFsaWRhdGUgdGhhdCBpdCBleGFjdGx5IG1hdGNoZXMgdGhlIGNhY2hlZCBldmVudHMuXG4gICAgICAgIGlmIChyZXNwb25zZS5yZXBvcnQubWVzc2FnZXMubGVuZ3RoID09PSBjYWNoZWRfZXZlbnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCIqKiogVmFsaWRhdGluZyBjYWNoZWRfZXZlbnRzICoqKlwiKTtcbiAgICAgICAgICAgIHZhciB2YWxpZF8xID0gcmVzcG9uc2UucmVwb3J0Lm1lc3NhZ2VzO1xuICAgICAgICAgICAgdmFyIGludmFsaWRFbnRyaWVzID0gY2FjaGVkX2V2ZW50cy5maWx0ZXIoZnVuY3Rpb24gKGUsIGkpIHsgcmV0dXJuIGUua2V5ICE9PSB2YWxpZF8xW2ldLmtleTsgfSk7XG4gICAgICAgICAgICBpZiAoaW52YWxpZEVudHJpZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgYWxlcnQoXCIhISBJbnZhbGlkIGVudHJpZXMgZm91bmRcIik7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIiEhIEludmFsaWQgZW50cmllcyBmb3VuZDogXCIsIGludmFsaWRFbnRyaWVzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiKioqIFZhbGlkYXRpb24gQ29tcGxldGVkICoqKlwiKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIHRoZSByZXNwb25zZSBkaWRuJ3QgY29udGFpbiB0aGUgZW50aXJlIGV2ZW50IGxvZy4gR28gZmV0Y2hcbiAgICAgICAgICAgIC8vIGEgdmVyc2lvbiB0aGF0IF9kb2VzXy5cbiAgICAgICAgICAgIC8qXG4gICAgICAgICAgICB1cGRhdGVfZXZlbnRfY2FjaGUoXG4gICAgICAgICAgICAgIGdhbWUsXG4gICAgICAgICAgICAgIGNydXgsXG4gICAgICAgICAgICAgIDEwMDAwMCxcbiAgICAgICAgICAgICAgcmVjaWV2ZV9uZXdfbWVzc2FnZXMsXG4gICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IsXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgKi9cbiAgICAgICAgfVxuICAgIH1cbiAgICBjYWNoZWRfZXZlbnRzID0gaW5jb21pbmcuY29uY2F0KGNhY2hlZF9ldmVudHMpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGdldF9jYWNoZWRfZXZlbnRzKCkge1xuICAgIHJldHVybiBjYWNoZWRfZXZlbnRzO1xufVxuLy9IYW5kbGVyIHRvIHJlY2lldmUgbmV3IG1lc3NhZ2VzXG5leHBvcnQgZnVuY3Rpb24gcmVjaWV2ZV9uZXdfbWVzc2FnZXMoZ2FtZSwgY3J1eCkge1xuICAgIHZhciB1bml2ZXJzZSA9IGdhbWUudW5pdmVyc2U7XG4gICAgdmFyIG5wdWkgPSBnYW1lLm5wdWk7XG4gICAgdmFyIHBsYXllcnMgPSBnZXRfbGVkZ2VyKGdhbWUsIGNydXgsIGNhY2hlZF9ldmVudHMpO1xuICAgIHZhciBsZWRnZXJTY3JlZW4gPSBucHVpLmxlZGdlclNjcmVlbigpO1xuICAgIG5wdWkub25IaWRlU2NyZWVuKG51bGwsIHRydWUpO1xuICAgIG5wdWkub25IaWRlU2VsZWN0aW9uTWVudSgpO1xuICAgIG5wdWkudHJpZ2dlcihcImhpZGVfc2lkZV9tZW51XCIpO1xuICAgIG5wdWkudHJpZ2dlcihcInJlc2V0X2VkaXRfbW9kZVwiKTtcbiAgICBucHVpLmFjdGl2ZVNjcmVlbiA9IGxlZGdlclNjcmVlbjtcbiAgICBsZWRnZXJTY3JlZW4ucm9vc3QobnB1aS5zY3JlZW5Db250YWluZXIpO1xuICAgIG5wdWkubGF5b3V0RWxlbWVudChsZWRnZXJTY3JlZW4pO1xuICAgIHBsYXllcnMuZm9yRWFjaChmdW5jdGlvbiAocCkge1xuICAgICAgICB2YXIgcGxheWVyID0gUGxheWVyTmFtZUljb25Sb3dMaW5rKGNydXgsIG5wdWksIHVuaXZlcnNlLmdhbGF4eS5wbGF5ZXJzW3AudWlkXSkucm9vc3QobnB1aS5hY3RpdmVTY3JlZW4pO1xuICAgICAgICBwbGF5ZXIuYWRkU3R5bGUoXCJwbGF5ZXJfY2VsbFwiKTtcbiAgICAgICAgdmFyIHByb21wdCA9IHAuZGVidCA+IDAgPyBcIlRoZXkgb3dlXCIgOiBcIllvdSBvd2VcIjtcbiAgICAgICAgaWYgKHAuZGVidCA9PSAwKSB7XG4gICAgICAgICAgICBwcm9tcHQgPSBcIkJhbGFuY2VcIjtcbiAgICAgICAgfVxuICAgICAgICBpZiAocC5kZWJ0IDwgMCkge1xuICAgICAgICAgICAgY3J1eFxuICAgICAgICAgICAgICAgIC5UZXh0KFwiXCIsIFwicGFkMTIgdHh0X3JpZ2h0IHJlZC10ZXh0XCIpXG4gICAgICAgICAgICAgICAgLnJhd0hUTUwoXCJcIi5jb25jYXQocHJvbXB0LCBcIjogXCIpLmNvbmNhdChwLmRlYnQpKVxuICAgICAgICAgICAgICAgIC5ncmlkKDIwLCAwLCAxMCwgMylcbiAgICAgICAgICAgICAgICAucm9vc3QocGxheWVyKTtcbiAgICAgICAgICAgIGlmIChwLmRlYnQgKiAtMSA8PSBnZXRfaGVybyh1bml2ZXJzZSkuY2FzaCkge1xuICAgICAgICAgICAgICAgIGNydXhcbiAgICAgICAgICAgICAgICAgICAgLkJ1dHRvbihcImZvcmdpdmVcIiwgXCJmb3JnaXZlX2RlYnRcIiwgeyB0YXJnZXRQbGF5ZXI6IHAudWlkIH0pXG4gICAgICAgICAgICAgICAgICAgIC5ncmlkKDE3LCAwLCA2LCAzKVxuICAgICAgICAgICAgICAgICAgICAucm9vc3QocGxheWVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChwLmRlYnQgPiAwKSB7XG4gICAgICAgICAgICBjcnV4XG4gICAgICAgICAgICAgICAgLlRleHQoXCJcIiwgXCJwYWQxMiB0eHRfcmlnaHQgYmx1ZS10ZXh0XCIpXG4gICAgICAgICAgICAgICAgLnJhd0hUTUwoXCJcIi5jb25jYXQocHJvbXB0LCBcIjogXCIpLmNvbmNhdChwLmRlYnQpKVxuICAgICAgICAgICAgICAgIC5ncmlkKDIwLCAwLCAxMCwgMylcbiAgICAgICAgICAgICAgICAucm9vc3QocGxheWVyKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChwLmRlYnQgPT0gMCkge1xuICAgICAgICAgICAgY3J1eFxuICAgICAgICAgICAgICAgIC5UZXh0KFwiXCIsIFwicGFkMTIgdHh0X3JpZ2h0IG9yYW5nZS10ZXh0XCIpXG4gICAgICAgICAgICAgICAgLnJhd0hUTUwoXCJcIi5jb25jYXQocHJvbXB0LCBcIjogXCIpLmNvbmNhdChwLmRlYnQpKVxuICAgICAgICAgICAgICAgIC5ncmlkKDIwLCAwLCAxMCwgMylcbiAgICAgICAgICAgICAgICAucm9vc3QocGxheWVyKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuZXhwb3J0IGRlZmF1bHQge1xuICAgIHVwZGF0ZV9ldmVudF9jYWNoZTogdXBkYXRlX2V2ZW50X2NhY2hlLFxuICAgIHJlY2lldmVfbmV3X21lc3NhZ2VzOiByZWNpZXZlX25ld19tZXNzYWdlcyxcbn07XG4iLCIiLCJpbXBvcnQgeyBnZXRfdW5pdmVyc2UgfSBmcm9tIFwiLi91dGlsaXRpZXMvZ2V0X2dhbWVfc3RhdGVcIjtcbmV4cG9ydCBmdW5jdGlvbiBnZXRfaGVybyh1bml2ZXJzZSkge1xuICAgIGlmICh1bml2ZXJzZSA9PT0gdm9pZCAwKSB7IHVuaXZlcnNlID0gZ2V0X3VuaXZlcnNlKCk7IH1cbiAgICByZXR1cm4gdW5pdmVyc2UucGxheWVyO1xufVxuIiwiZXhwb3J0IHZhciBsYXN0Q2xpcCA9IFwiRXJyb3JcIjtcbmV4cG9ydCBmdW5jdGlvbiBjbGlwKHRleHQpIHtcbiAgICBsYXN0Q2xpcCA9IHRleHQ7XG59XG4iLCJpbXBvcnQgeyBnZXRfaGVybyB9IGZyb20gXCIuL2dldF9oZXJvXCI7XG5pbXBvcnQgKiBhcyBDYWNoZSBmcm9tIFwiLi9ldmVudF9jYWNoZVwiO1xuLy9HZXQgbGVkZ2VyIGluZm8gdG8gc2VlIHdoYXQgaXMgb3dlZFxuLy9BY3R1YWxseSBzaG93cyB0aGUgcGFuZWwgb2YgbG9hZGluZ1xuZXhwb3J0IGZ1bmN0aW9uIGdldF9sZWRnZXIoZ2FtZSwgY3J1eCwgbWVzc2FnZXMpIHtcbiAgICB2YXIgbnB1aSA9IGdhbWUubnB1aTtcbiAgICB2YXIgdW5pdmVyc2UgPSBnYW1lLnVuaXZlcnNlO1xuICAgIHZhciBwbGF5ZXJzID0gdW5pdmVyc2UuZ2FsYXh5LnBsYXllcnM7XG4gICAgdmFyIGxvYWRpbmcgPSBjcnV4XG4gICAgICAgIC5UZXh0KFwiXCIsIFwicmVsIHR4dF9jZW50ZXIgcGFkMTJcIilcbiAgICAgICAgLnJhd0hUTUwoXCJQYXJzaW5nIFwiLmNvbmNhdChtZXNzYWdlcy5sZW5ndGgsIFwiIG1lc3NhZ2VzLlwiKSk7XG4gICAgbG9hZGluZy5yb29zdChucHVpLmFjdGl2ZVNjcmVlbik7XG4gICAgdmFyIHVpZCA9IGdldF9oZXJvKHVuaXZlcnNlKS51aWQ7XG4gICAgLy9MZWRnZXIgaXMgYSBsaXN0IG9mIGRlYnRzXG4gICAgdmFyIGxlZGdlciA9IHt9O1xuICAgIG1lc3NhZ2VzXG4gICAgICAgIC5maWx0ZXIoZnVuY3Rpb24gKG0pIHtcbiAgICAgICAgcmV0dXJuIG0ucGF5bG9hZC50ZW1wbGF0ZSA9PSBcIm1vbmV5X3NlbnRcIiB8fFxuICAgICAgICAgICAgbS5wYXlsb2FkLnRlbXBsYXRlID09IFwic2hhcmVkX3RlY2hub2xvZ3lcIjtcbiAgICB9KVxuICAgICAgICAubWFwKGZ1bmN0aW9uIChtKSB7IHJldHVybiBtLnBheWxvYWQ7IH0pXG4gICAgICAgIC5mb3JFYWNoKGZ1bmN0aW9uIChtKSB7XG4gICAgICAgIHZhciBsaWFpc29uID0gbS5mcm9tX3B1aWQgPT0gdWlkID8gbS50b19wdWlkIDogbS5mcm9tX3B1aWQ7XG4gICAgICAgIHZhciB2YWx1ZSA9IG0udGVtcGxhdGUgPT0gXCJtb25leV9zZW50XCIgPyBtLmFtb3VudCA6IG0ucHJpY2U7XG4gICAgICAgIHZhbHVlICo9IG0uZnJvbV9wdWlkID09IHVpZCA/IDEgOiAtMTsgLy8gYW1vdW50IGlzICgrKSBpZiBjcmVkaXQgJiAoLSkgaWYgZGVidFxuICAgICAgICBsaWFpc29uIGluIGxlZGdlclxuICAgICAgICAgICAgPyAobGVkZ2VyW2xpYWlzb25dICs9IHZhbHVlKVxuICAgICAgICAgICAgOiAobGVkZ2VyW2xpYWlzb25dID0gdmFsdWUpO1xuICAgIH0pO1xuICAgIC8vVE9ETzogUmV2aWV3IHRoYXQgdGhpcyBpcyBjb3JyZWN0bHkgZmluZGluZyBhIGxpc3Qgb2Ygb25seSBwZW9wbGUgd2hvIGhhdmUgZGVidHMuXG4gICAgLy9BY2NvdW50cyBhcmUgdGhlIGNyZWRpdCBvciBkZWJpdCByZWxhdGVkIHRvIGVhY2ggdXNlclxuICAgIHZhciBhY2NvdW50cyA9IFtdO1xuICAgIGZvciAodmFyIHVpZF8xIGluIGxlZGdlcikge1xuICAgICAgICB2YXIgcGxheWVyID0gcGxheWVyc1twYXJzZUludCh1aWRfMSldO1xuICAgICAgICBwbGF5ZXIuZGVidCA9IGxlZGdlclt1aWRfMV07XG4gICAgICAgIGFjY291bnRzLnB1c2gocGxheWVyKTtcbiAgICB9XG4gICAgZ2V0X2hlcm8odW5pdmVyc2UpLmxlZGdlciA9IGxlZGdlcjtcbiAgICBjb25zb2xlLmxvZyhhY2NvdW50cyk7XG4gICAgcmV0dXJuIGFjY291bnRzO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlckxlZGdlcihnYW1lLCBjcnV4LCBNb3VzZVRyYXApIHtcbiAgICAvL0RlY29uc3RydWN0aW9uIG9mIGRpZmZlcmVudCBjb21wb25lbnRzIG9mIHRoZSBnYW1lLlxuICAgIHZhciBjb25maWcgPSBnYW1lLmNvbmZpZztcbiAgICB2YXIgbnAgPSBnYW1lLm5wO1xuICAgIHZhciBucHVpID0gZ2FtZS5ucHVpO1xuICAgIHZhciB1bml2ZXJzZSA9IGdhbWUudW5pdmVyc2U7XG4gICAgdmFyIHRlbXBsYXRlcyA9IGdhbWUudGVtcGxhdGVzO1xuICAgIHZhciBwbGF5ZXJzID0gdW5pdmVyc2UuZ2FsYXh5LnBsYXllcnM7XG4gICAgTW91c2VUcmFwLmJpbmQoW1wibVwiLCBcIk1cIl0sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgbnAudHJpZ2dlcihcInRyaWdnZXJfbGVkZ2VyXCIpO1xuICAgIH0pO1xuICAgIHRlbXBsYXRlc1tcImxlZGdlclwiXSA9IFwiTGVkZ2VyXCI7XG4gICAgdGVtcGxhdGVzW1widGVjaF90cmFkaW5nXCJdID0gXCJUcmFkaW5nIFRlY2hub2xvZ3lcIjtcbiAgICB0ZW1wbGF0ZXNbXCJmb3JnaXZlXCJdID0gXCJQYXkgRGVidFwiO1xuICAgIHRlbXBsYXRlc1tcImZvcmdpdmVfZGVidFwiXSA9IFwiQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIGZvcmdpdmUgdGhpcyBkZWJ0P1wiO1xuICAgIGlmICghbnB1aS5oYXNtZW51aXRlbSkge1xuICAgICAgICBucHVpXG4gICAgICAgICAgICAuU2lkZU1lbnVJdGVtKFwiaWNvbi1kYXRhYmFzZVwiLCBcImxlZGdlclwiLCBcInRyaWdnZXJfbGVkZ2VyXCIpXG4gICAgICAgICAgICAucm9vc3QobnB1aS5zaWRlTWVudSk7XG4gICAgICAgIG5wdWkuaGFzbWVudWl0ZW0gPSB0cnVlO1xuICAgIH1cbiAgICBucHVpLmxlZGdlclNjcmVlbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIG5wdWkuU2NyZWVuKFwibGVkZ2VyXCIpO1xuICAgIH07XG4gICAgbnAub24oXCJ0cmlnZ2VyX2xlZGdlclwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBsZWRnZXJTY3JlZW4gPSBucHVpLmxlZGdlclNjcmVlbigpO1xuICAgICAgICB2YXIgbG9hZGluZyA9IGNydXhcbiAgICAgICAgICAgIC5UZXh0KFwiXCIsIFwicmVsIHR4dF9jZW50ZXIgcGFkMTIgc2VjdGlvbl90aXRsZVwiKVxuICAgICAgICAgICAgLnJhd0hUTUwoXCJUYWJ1bGF0aW5nIExlZGdlci4uLlwiKTtcbiAgICAgICAgbG9hZGluZy5yb29zdChsZWRnZXJTY3JlZW4pO1xuICAgICAgICBucHVpLm9uSGlkZVNjcmVlbihudWxsLCB0cnVlKTtcbiAgICAgICAgbnB1aS5vbkhpZGVTZWxlY3Rpb25NZW51KCk7XG4gICAgICAgIG5wdWkudHJpZ2dlcihcImhpZGVfc2lkZV9tZW51XCIpO1xuICAgICAgICBucHVpLnRyaWdnZXIoXCJyZXNldF9lZGl0X21vZGVcIik7XG4gICAgICAgIG5wdWkuYWN0aXZlU2NyZWVuID0gbGVkZ2VyU2NyZWVuO1xuICAgICAgICBsZWRnZXJTY3JlZW4ucm9vc3QobnB1aS5zY3JlZW5Db250YWluZXIpO1xuICAgICAgICBucHVpLmxheW91dEVsZW1lbnQobGVkZ2VyU2NyZWVuKTtcbiAgICAgICAgQ2FjaGUudXBkYXRlX2V2ZW50X2NhY2hlKGdhbWUsIGNydXgsIDQsIENhY2hlLnJlY2lldmVfbmV3X21lc3NhZ2VzLCBjb25zb2xlLmVycm9yKTtcbiAgICB9KTtcbiAgICAvL1doeSBub3QgbnAub24oXCJGb3JnaXZlRGVidFwiKT9cbiAgICBucC5vbkZvcmdpdmVEZWJ0ID0gZnVuY3Rpb24gKGV2ZW50LCBkYXRhKSB7XG4gICAgICAgIHZhciB0YXJnZXRQbGF5ZXIgPSBkYXRhLnRhcmdldFBsYXllcjtcbiAgICAgICAgdmFyIHBsYXllciA9IHBsYXllcnNbdGFyZ2V0UGxheWVyXTtcbiAgICAgICAgdmFyIGFtb3VudCA9IHBsYXllci5kZWJ0ICogLTE7XG4gICAgICAgIC8vbGV0IGFtb3VudCA9IDFcbiAgICAgICAgdW5pdmVyc2UucGxheWVyLmxlZGdlclt0YXJnZXRQbGF5ZXJdID0gMDtcbiAgICAgICAgbnAudHJpZ2dlcihcInNob3dfc2NyZWVuXCIsIFtcbiAgICAgICAgICAgIFwiY29uZmlybVwiLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IFwiZm9yZ2l2ZV9kZWJ0XCIsXG4gICAgICAgICAgICAgICAgZXZlbnRLaW5kOiBcImNvbmZpcm1fZm9yZ2l2ZV9kZWJ0XCIsXG4gICAgICAgICAgICAgICAgZXZlbnREYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFwib3JkZXJcIixcbiAgICAgICAgICAgICAgICAgICAgb3JkZXI6IFwic2VuZF9tb25leSxcIi5jb25jYXQodGFyZ2V0UGxheWVyLCBcIixcIikuY29uY2F0KGFtb3VudCksXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIF0pO1xuICAgIH07XG4gICAgbnAub24oXCJjb25maXJtX2ZvcmdpdmVfZGVidFwiLCBmdW5jdGlvbiAoZXZlbnQsIGRhdGEpIHtcbiAgICAgICAgbnAudHJpZ2dlcihcInNlcnZlcl9yZXF1ZXN0XCIsIGRhdGEpO1xuICAgICAgICBucC50cmlnZ2VyKFwidHJpZ2dlcl9sZWRnZXJcIik7XG4gICAgfSk7XG4gICAgbnAub24oXCJmb3JnaXZlX2RlYnRcIiwgbnAub25Gb3JnaXZlRGVidCk7XG59XG4iLCJpbXBvcnQgeyBnZXRfZ2FtZV9udW1iZXIgfSBmcm9tIFwiLi9nZXRfZ2FtZV9zdGF0ZVwiO1xuZXhwb3J0IGZ1bmN0aW9uIGdldF9hcGlfZGF0YShhcGlrZXkpIHtcbiAgICB2YXIgZ2FtZV9udW1iZXIgPSBnZXRfZ2FtZV9udW1iZXIoKTtcbiAgICByZXR1cm4gZmV0Y2goXCJodHRwczovL25wLmlyb25oZWxtZXQuY29tL2FwaVwiLCB7XG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgIGFjY2VwdDogXCJhcHBsaWNhdGlvbi9qc29uLCB0ZXh0L2phdmFzY3JpcHQsICovKjsgcT0wLjAxXCIsXG4gICAgICAgICAgICBcImFjY2VwdC1sYW5ndWFnZVwiOiBcImVuLVVTLGVuO3E9MC45XCIsXG4gICAgICAgICAgICBcImNvbnRlbnQtdHlwZVwiOiBcImFwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZDsgY2hhcnNldD1VVEYtOFwiLFxuICAgICAgICAgICAgXCJ4LXJlcXVlc3RlZC13aXRoXCI6IFwiWE1MSHR0cFJlcXVlc3RcIixcbiAgICAgICAgfSxcbiAgICAgICAgcmVmZXJyZXI6IFwiaHR0cHM6Ly9ucC5pcm9uaGVsbWV0LmNvbS9nYW1lL1wiLmNvbmNhdChnYW1lX251bWJlciksXG4gICAgICAgIHJlZmVycmVyUG9saWN5OiBcInN0cmljdC1vcmlnaW4td2hlbi1jcm9zcy1vcmlnaW5cIixcbiAgICAgICAgYm9keTogXCJnYW1lX251bWJlcj1cIi5jb25jYXQoZ2FtZV9udW1iZXIsIFwiJmFwaV92ZXJzaW9uPTAuMSZjb2RlPVwiKS5jb25jYXQoYXBpa2V5KSxcbiAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgICAgbW9kZTogXCJjb3JzXCIsXG4gICAgICAgIGNyZWRlbnRpYWxzOiBcImluY2x1ZGVcIixcbiAgICB9KS50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkgeyByZXR1cm4gcmVzcG9uc2UuanNvbigpOyB9KTtcbn1cbiIsImV4cG9ydCBmdW5jdGlvbiBnZXRfdmlzaWJsZV9zdGFycygpIHtcbiAgICB2YXIgc3RhcnMgPSBnZXRfYWxsX3N0YXJzKCk7XG4gICAgaWYgKHN0YXJzID09PSB1bmRlZmluZWQpXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgdmFyIHZpc2libGVfc3RhcnMgPSBbXTtcbiAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gT2JqZWN0LmVudHJpZXMoc3RhcnMpOyBfaSA8IF9hLmxlbmd0aDsgX2krKykge1xuICAgICAgICB2YXIgX2IgPSBfYVtfaV0sIGluZGV4ID0gX2JbMF0sIHN0YXIgPSBfYlsxXTtcbiAgICAgICAgaWYgKHN0YXIudiA9PT0gXCIxXCIpIHtcbiAgICAgICAgICAgIC8vU3RhciBpcyB2aXNpYmxlXG4gICAgICAgICAgICB2aXNpYmxlX3N0YXJzLnB1c2goc3Rhcik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHZpc2libGVfc3RhcnM7XG59XG5leHBvcnQgZnVuY3Rpb24gZ2V0X2dhbWVfbnVtYmVyKCkge1xuICAgIGlmIChOZXB0dW5lc1ByaWRlID09PSB1bmRlZmluZWQpXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgcmV0dXJuIE5lcHR1bmVzUHJpZGUuZ2FtZU51bWJlcjtcbn1cbmV4cG9ydCBmdW5jdGlvbiBnZXRfYWxsX3N0YXJzKCkge1xuICAgIGlmIChOZXB0dW5lc1ByaWRlID09PSB1bmRlZmluZWQpXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgcmV0dXJuIE5lcHR1bmVzUHJpZGUudW5pdmVyc2UuZ2FsYXh5LnN0YXJzO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGdldF9mbGVldHMoKSB7XG4gICAgaWYgKE5lcHR1bmVzUHJpZGUgPT09IHVuZGVmaW5lZClcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICByZXR1cm4gTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5nYWxheHkuZmxlZXRzO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGdldF9nYWxheHkoKSB7XG4gICAgaWYgKE5lcHR1bmVzUHJpZGUgPT09IHVuZGVmaW5lZClcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICByZXR1cm4gZ2V0X3VuaXZlcnNlKCkuZ2FsYXh5O1xufVxuZXhwb3J0IGZ1bmN0aW9uIGdldF91bml2ZXJzZSgpIHtcbiAgICBpZiAoTmVwdHVuZXNQcmlkZSA9PT0gdW5kZWZpbmVkKVxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIHJldHVybiBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGdldF9uZXB0dW5lc19wcmlkZSgpIHtcbiAgICBpZiAoTmVwdHVuZXNQcmlkZSA9PT0gdW5kZWZpbmVkKVxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIHJldHVybiBOZXB0dW5lc1ByaWRlLm5wO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGdldF9nYW1lX3N0YXRlKCkge1xuICAgIGlmIChOZXB0dW5lc1ByaWRlID09PSB1bmRlZmluZWQpXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgcmV0dXJuIE5lcHR1bmVzUHJpZGU7XG59XG4iLCJleHBvcnQgZnVuY3Rpb24gZHJhd092ZXJsYXlTdHJpbmcoY29udGV4dCwgdGV4dCwgeCwgeSwgZmdDb2xvcikge1xuICAgIGNvbnRleHQuZmlsbFN0eWxlID0gXCIjMDAwMDAwXCI7XG4gICAgZm9yICh2YXIgc21lYXIgPSAxOyBzbWVhciA8IDQ7ICsrc21lYXIpIHtcbiAgICAgICAgY29udGV4dC5maWxsVGV4dCh0ZXh0LCB4ICsgc21lYXIsIHkgKyBzbWVhcik7XG4gICAgICAgIGNvbnRleHQuZmlsbFRleHQodGV4dCwgeCAtIHNtZWFyLCB5ICsgc21lYXIpO1xuICAgICAgICBjb250ZXh0LmZpbGxUZXh0KHRleHQsIHggLSBzbWVhciwgeSAtIHNtZWFyKTtcbiAgICAgICAgY29udGV4dC5maWxsVGV4dCh0ZXh0LCB4ICsgc21lYXIsIHkgLSBzbWVhcik7XG4gICAgfVxuICAgIGNvbnRleHQuZmlsbFN0eWxlID0gZmdDb2xvciB8fCBcIiMwMGZmMDBcIjtcbiAgICBjb250ZXh0LmZpbGxUZXh0KHRleHQsIHgsIHkpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGFueVN0YXJDYW5TZWUodW5pdmVyc2UsIG93bmVyLCBmbGVldCkge1xuICAgIHZhciBzdGFycyA9IHVuaXZlcnNlLmdhbGF4eS5zdGFycztcbiAgICB2YXIgc2NhblJhbmdlID0gdW5pdmVyc2UuZ2FsYXh5LnBsYXllcnNbb3duZXJdLnRlY2guc2Nhbm5pbmcudmFsdWU7XG4gICAgZm9yICh2YXIgcyBpbiBzdGFycykge1xuICAgICAgICB2YXIgc3RhciA9IHN0YXJzW3NdO1xuICAgICAgICBpZiAoc3Rhci5wdWlkID09IG93bmVyKSB7XG4gICAgICAgICAgICB2YXIgZGlzdGFuY2UgPSB1bml2ZXJzZS5kaXN0YW5jZShzdGFyLngsIHN0YXIueSwgcGFyc2VGbG9hdChmbGVldC54KSwgcGFyc2VGbG9hdChmbGVldC55KSk7XG4gICAgICAgICAgICBpZiAoZGlzdGFuY2UgPD0gc2NhblJhbmdlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuIiwiaW1wb3J0IHsgZ2V0X2dhbGF4eSwgfSBmcm9tIFwiLi9nZXRfZ2FtZV9zdGF0ZVwiO1xuaW1wb3J0IHsgZ2V0X2FwaV9kYXRhIH0gZnJvbSBcIi4vYXBpXCI7XG52YXIgb3JpZ2luYWxQbGF5ZXIgPSB1bmRlZmluZWQ7XG4vL1RoaXMgc2F2ZXMgdGhlIGFjdHVhbCBjbGllbnQncyBwbGF5ZXIuXG5mdW5jdGlvbiBzZXRfb3JpZ2luYWxfcGxheWVyKCkge1xuICAgIGlmIChvcmlnaW5hbFBsYXllciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIG9yaWdpbmFsUGxheWVyID0gTmVwdHVuZXNQcmlkZS5vcmlnaW5hbFBsYXllcjtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn1cbmZ1bmN0aW9uIHZhbGlkX2FwaWtleShhcGlrZXkpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbn1cbmZ1bmN0aW9uIGJhZF9rZXkoZXJyKSB7XG4gICAgY29uc29sZS5sb2coXCJUaGUga2V5IGlzIGJhZCBhbmQgbWVyZ2luZyBGQUlMRUQhXCIpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIG1lcmdlVXNlcihldmVudCwgZGF0YSkge1xuICAgIHNldF9vcmlnaW5hbF9wbGF5ZXIoKTtcbiAgICAvL0V4dHJhY3QgdGhhdCBLRVlcbiAgICAvL1RPRE86IEFkZCByZWdleCB0byBnZXQgVEhBVCBLRVlcbiAgICB2YXIgYXBpa2V5ID0gZGF0YSA9PT0gbnVsbCB8fCBkYXRhID09PSB2b2lkIDAgPyB2b2lkIDAgOiBkYXRhLnNwbGl0KFwiOlwiKVsxXTtcbiAgICBjb25zb2xlLmxvZyhhcGlrZXkpO1xuICAgIGlmICh2YWxpZF9hcGlrZXkoYXBpa2V5KSkge1xuICAgICAgICBnZXRfYXBpX2RhdGEoYXBpa2V5KVxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgIHJldHVybiBcImVycm9yXCIgaW4gZGF0YVxuICAgICAgICAgICAgICAgID8gYmFkX2tleShkYXRhKVxuICAgICAgICAgICAgICAgIDogbWVyZ2VVc2VyRGF0YShkYXRhLnNjYW5uaW5nX2RhdGEpO1xuICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKGNvbnNvbGUubG9nKTtcbiAgICB9XG59XG4vL0NvbWJpbmUgZGF0YSBmcm9tIGFub3RoZXIgdXNlclxuLy9DYWxsYmFjayBvbiBBUEkgLi5cbi8vbWVjaGFuaWMgY2xvc2VzIGF0IDVwbVxuLy9UaGlzIHdvcmtzIGJ1dCBub3cgYWRkIGl0IHNvIGl0IGRvZXMgbm90IG92ZXJ0YWtlIHlvdXIgc3RhcnMuXG5leHBvcnQgZnVuY3Rpb24gbWVyZ2VVc2VyRGF0YShzY2FubmluZ0RhdGEpIHtcbiAgICBjb25zb2xlLmxvZyhcIlNBVCBNZXJnaW5nXCIpO1xuICAgIHZhciBnYWxheHkgPSBnZXRfZ2FsYXh5KCk7XG4gICAgdmFyIHN0YXJzID0gc2Nhbm5pbmdEYXRhLnN0YXJzO1xuICAgIHZhciBmbGVldHMgPSBzY2FubmluZ0RhdGEuZmxlZXRzO1xuICAgIC8vIFVwZGF0ZSBzdGFyc1xuICAgIGZvciAodmFyIHN0YXJJZCBpbiBzdGFycykge1xuICAgICAgICB2YXIgc3RhciA9IHN0YXJzW3N0YXJJZF07XG4gICAgICAgIGlmIChnYWxheHkuc3RhcnNbc3RhcklkXSA9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGdhbGF4eS5zdGFyc1tzdGFySWRdID0gc3RhcjtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb25zb2xlLmxvZyhcIlN5bmNpbmdcIik7XG4gICAgLy8gQWRkIGZsZWV0c1xuICAgIGZvciAodmFyIGZsZWV0SWQgaW4gZmxlZXRzKSB7XG4gICAgICAgIHZhciBmbGVldCA9IGZsZWV0c1tmbGVldElkXTtcbiAgICAgICAgaWYgKGdhbGF4eS5mbGVldHNbZmxlZXRJZF0gPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBnYWxheHkuZmxlZXRzW2ZsZWV0SWRdID0gZmxlZXQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy9vbkZ1bGxVbml2ZXJzZSBTZWVtcyB0byBhZGRpdGlvbmFsbHkgbG9hZCBhbGwgdGhlIHBsYXllcnMuXG4gICAgTmVwdHVuZXNQcmlkZS5ucC5vbkZ1bGxVbml2ZXJzZShudWxsLCBnYWxheHkpO1xuICAgIC8vTmVwdHVuZXNQcmlkZS5ucHVpLm9uSGlkZVNjcmVlbihudWxsLCB0cnVlKTtcbn1cbiIsImltcG9ydCB7IGdldF9jYWNoZWRfZXZlbnRzLCB1cGRhdGVfZXZlbnRfY2FjaGUsIH0gZnJvbSBcIi4uL2V2ZW50X2NhY2hlXCI7XG5leHBvcnQgZnVuY3Rpb24gZ2V0X25wY190aWNrKGdhbWUsIGNydXgpIHtcbiAgICB2YXIgYWkgPSBnYW1lLnVuaXZlcnNlLnNlbGVjdGVkUGxheWVyO1xuICAgIHZhciBjYWNoZSA9IGdldF9jYWNoZWRfZXZlbnRzKCk7XG4gICAgdmFyIGV2ZW50cyA9IGNhY2hlLm1hcChmdW5jdGlvbiAoZSkgeyByZXR1cm4gZS5wYXlsb2FkOyB9KTtcbiAgICB2YXIgZ29vZGJ5ZXMgPSBldmVudHMuZmlsdGVyKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIHJldHVybiBlLnRlbXBsYXRlLmluY2x1ZGVzKFwiZ29vZGJ5ZV90b19wbGF5ZXJcIik7XG4gICAgfSk7XG4gICAgdmFyIHRpY2sgPSBnb29kYnllcy5maWx0ZXIoZnVuY3Rpb24gKGUpIHsgcmV0dXJuIGUudWlkID09IGFpLnVpZDsgfSlbMF0udGljaztcbiAgICBjb25zb2xlLmxvZyh0aWNrKTtcbiAgICByZXR1cm4gdGljaztcbn1cbmV4cG9ydCBmdW5jdGlvbiBhZGRfbnBjX3RpY2tfY291bnRlcihnYW1lLCBjcnV4KSB7XG4gICAgdmFyIHRpY2sgPSBnZXRfbnBjX3RpY2soZ2FtZSwgY3J1eCk7XG4gICAgdmFyIHRpdGxlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNjb250ZW50QXJlYSA+IGRpdiA+IGRpdi53aWRnZXQuZnVsbHNjcmVlbiA+IGRpdjpudGgtY2hpbGQoMykgPiBkaXYgPiBkaXY6bnRoLWNoaWxkKDUpID4gZGl2LndpZGdldC5zZWN0aW9uX3RpdGxlLmNvbF9ibGFja1wiKTtcbiAgICB2YXIgc3VidGl0bGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2NvbnRlbnRBcmVhID4gZGl2ID4gZGl2LndpZGdldC5mdWxsc2NyZWVuID4gZGl2Om50aC1jaGlsZCgzKSA+IGRpdiA+IGRpdjpudGgtY2hpbGQoNSkgPiBkaXYud2lkZ2V0LnR4dF9yaWdodC5wYWQxMlwiKTtcbiAgICB2YXIgY3VycmVudF90aWNrID0gZ2FtZS51bml2ZXJzZS5nYWxheHkudGljaztcbiAgICB2YXIgbmV4dF9tb3ZlID0gKGN1cnJlbnRfdGljayAtIHRpY2spICUgNDtcbiAgICB2YXIgbGFzdF9tb3ZlID0gNCAtIG5leHRfbW92ZTtcbiAgICAvL2xldCBsYXN0X21vdmUgPSBjdXJyZW50X3RpY2stbmV4dF9tb3ZlXG4gICAgdmFyIHBvc3RmaXhfMSA9IFwiXCI7XG4gICAgdmFyIHBvc3RmaXhfMiA9IFwiXCI7XG4gICAgaWYgKG5leHRfbW92ZSAhPSAxKSB7XG4gICAgICAgIHBvc3RmaXhfMSArPSBcInNcIjtcbiAgICB9XG4gICAgaWYgKGxhc3RfbW92ZSAhPSAxKSB7XG4gICAgICAgIHBvc3RmaXhfMiArPSBcInNcIjtcbiAgICB9XG4gICAgaWYgKG5leHRfbW92ZSA9PSAwKSB7XG4gICAgICAgIG5leHRfbW92ZSA9IDQ7XG4gICAgICAgIHRpdGxlLmlubmVyVGV4dCA9IFwiQUkgbW92ZXMgaW4gXCIuY29uY2F0KG5leHRfbW92ZSwgXCIgdGlja1wiKS5jb25jYXQocG9zdGZpeF8xKTtcbiAgICAgICAgc3VidGl0bGUuaW5uZXJUZXh0ID0gXCJBSSBtb3ZlZCB0aGlzIHRpY2tcIjtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHRpdGxlLmlubmVyVGV4dCA9IFwiQUkgbW92ZXMgaW4gXCIuY29uY2F0KG5leHRfbW92ZSwgXCIgdGlja1wiKS5jb25jYXQocG9zdGZpeF8xKTtcbiAgICAgICAgc3VidGl0bGUuaW5uZXJUZXh0ID0gXCJBSSBsYXN0IG1vdmVkIFwiLmNvbmNhdChsYXN0X21vdmUsIFwiIHRpY2tcIikuY29uY2F0KHBvc3RmaXhfMiwgXCIgYWdvXCIpO1xuICAgICAgICAvL3N1YnRpdGxlLmlubmVyVGV4dCA9IGBBSSBsYXN0IG1vdmVkIG9uIHRpY2sgJHtsYXN0X21vdmV9YFxuICAgIH1cbn1cbmV4cG9ydCBmdW5jdGlvbiBob29rX25wY190aWNrX2NvdW50ZXIoZ2FtZSwgY3J1eCkge1xuICAgIHZhciBzZWxlY3RlZFBsYXllciA9IGdhbWUudW5pdmVyc2Uuc2VsZWN0ZWRQbGF5ZXI7XG4gICAgaWYgKHNlbGVjdGVkUGxheWVyLmFpKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiQUkgU2VsZWN0ZWRcIik7XG4gICAgICAgIHVwZGF0ZV9ldmVudF9jYWNoZShnYW1lLCBjcnV4LCA0LCBhZGRfbnBjX3RpY2tfY291bnRlciwgY29uc29sZS5lcnJvcik7XG4gICAgfVxufVxuIiwiaW1wb3J0IHsgbWFya2VkIH0gZnJvbSBcIm1hcmtlZFwiO1xuZXhwb3J0IGZ1bmN0aW9uIG1hcmtkb3duKG1hcmtkb3duU3RyaW5nKSB7XG4gICAgcmV0dXJuIG1hcmtlZC5wYXJzZShtYXJrZG93blN0cmluZyk7XG59XG5leHBvcnQgZnVuY3Rpb24gaXNfdmFsaWRfaW1hZ2VfdXJsKHN0cikge1xuICAgIHZhciBwcm90b2NvbCA9IFwiXihodHRwczpcXFxcL1xcXFwvKVwiO1xuICAgIHZhciBkb21haW5zID0gXCIoaVxcXFwuaWJiXFxcXC5jb3xpXFxcXC5pbWd1clxcXFwuY29tfGNkblxcXFwuZGlzY29yZGFwcFxcXFwuY29tKVwiO1xuICAgIHZhciBjb250ZW50ID0gXCIoWyYjXz07XFxcXC1cXFxcP1xcXFwvXFxcXHddezEsMTUwfSlcIjtcbiAgICB2YXIgaW1hZ2VzID0gXCIoXFxcXC4pKGdpZnxqcGU/Z3x0aWZmP3xwbmd8d2VicHxibXB8R0lGfEpQRT9HfFRJRkY/fFBOR3xXRUJQfEJNUCkkXCI7XG4gICAgdmFyIHJlZ2V4X3N0cmluZyA9IHByb3RvY29sICsgZG9tYWlucyArIGNvbnRlbnQgKyBpbWFnZXM7XG4gICAgdmFyIHJlZ2V4ID0gbmV3IFJlZ0V4cChyZWdleF9zdHJpbmcpO1xuICAgIHZhciB2YWxpZCA9IHJlZ2V4LnRlc3Qoc3RyKTtcbiAgICByZXR1cm4gdmFsaWQ7XG59XG5leHBvcnQgZnVuY3Rpb24gaXNfdmFsaWRfeW91dHViZShzdHIpIHtcbiAgICB2YXIgcHJvdG9jb2wgPSBcIl4oaHR0cHM6Ly8pXCI7XG4gICAgdmFyIGRvbWFpbnMgPSBcIih5b3V0dWJlLmNvbXx3d3cueW91dHViZS5jb218eW91dHUuYmUpXCI7XG4gICAgdmFyIGNvbnRlbnQgPSBcIihbJiNfPTstPy93XXsxLDE1MH0pXCI7XG4gICAgdmFyIHJlZ2V4X3N0cmluZyA9IHByb3RvY29sICsgZG9tYWlucyArIGNvbnRlbnQ7XG4gICAgdmFyIHJlZ2V4ID0gbmV3IFJlZ0V4cChyZWdleF9zdHJpbmcpO1xuICAgIHJldHVybiByZWdleC50ZXN0KHN0cik7XG59XG5mdW5jdGlvbiBnZXRfeW91dHViZV9lbWJlZChsaW5rKSB7XG4gICAgcmV0dXJuIFwiPGlmcmFtZSB3aWR0aD1cXFwiNTYwXFxcIiBoZWlnaHQ9XFxcIjMxNVxcXCIgc3JjPVxcXCJodHRwczovL3d3dy55b3V0dWJlLmNvbS9lbWJlZC9lSHNEVEd3X2paOFxcXCIgdGl0bGU9XFxcIllvdVR1YmUgdmlkZW8gcGxheWVyXFxcIiBmcmFtZWJvcmRlcj1cXFwiMFxcXCIgYWxsb3c9XFxcImFjY2VsZXJvbWV0ZXI7IGF1dG9wbGF5OyBjbGlwYm9hcmQtd3JpdGU7IGVuY3J5cHRlZC1tZWRpYTsgZ3lyb3Njb3BlOyBwaWN0dXJlLWluLXBpY3R1cmU7IHdlYi1zaGFyZVxcXCIgYWxsb3dmdWxsc2NyZWVuPjwvaWZyYW1lPlwiO1xufVxuIiwidmFyIF9fYXdhaXRlciA9ICh0aGlzICYmIHRoaXMuX19hd2FpdGVyKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogYWRvcHQocmVzdWx0LnZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcbiAgICB9KTtcbn07XG52YXIgX19nZW5lcmF0b3IgPSAodGhpcyAmJiB0aGlzLl9fZ2VuZXJhdG9yKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgYm9keSkge1xuICAgIHZhciBfID0geyBsYWJlbDogMCwgc2VudDogZnVuY3Rpb24oKSB7IGlmICh0WzBdICYgMSkgdGhyb3cgdFsxXTsgcmV0dXJuIHRbMV07IH0sIHRyeXM6IFtdLCBvcHM6IFtdIH0sIGYsIHksIHQsIGc7XG4gICAgcmV0dXJuIGcgPSB7IG5leHQ6IHZlcmIoMCksIFwidGhyb3dcIjogdmVyYigxKSwgXCJyZXR1cm5cIjogdmVyYigyKSB9LCB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgKGdbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpczsgfSksIGc7XG4gICAgZnVuY3Rpb24gdmVyYihuKSB7IHJldHVybiBmdW5jdGlvbiAodikgeyByZXR1cm4gc3RlcChbbiwgdl0pOyB9OyB9XG4gICAgZnVuY3Rpb24gc3RlcChvcCkge1xuICAgICAgICBpZiAoZikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkdlbmVyYXRvciBpcyBhbHJlYWR5IGV4ZWN1dGluZy5cIik7XG4gICAgICAgIHdoaWxlIChnICYmIChnID0gMCwgb3BbMF0gJiYgKF8gPSAwKSksIF8pIHRyeSB7XG4gICAgICAgICAgICBpZiAoZiA9IDEsIHkgJiYgKHQgPSBvcFswXSAmIDIgPyB5W1wicmV0dXJuXCJdIDogb3BbMF0gPyB5W1widGhyb3dcIl0gfHwgKCh0ID0geVtcInJldHVyblwiXSkgJiYgdC5jYWxsKHkpLCAwKSA6IHkubmV4dCkgJiYgISh0ID0gdC5jYWxsKHksIG9wWzFdKSkuZG9uZSkgcmV0dXJuIHQ7XG4gICAgICAgICAgICBpZiAoeSA9IDAsIHQpIG9wID0gW29wWzBdICYgMiwgdC52YWx1ZV07XG4gICAgICAgICAgICBzd2l0Y2ggKG9wWzBdKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAwOiBjYXNlIDE6IHQgPSBvcDsgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSA0OiBfLmxhYmVsKys7IHJldHVybiB7IHZhbHVlOiBvcFsxXSwgZG9uZTogZmFsc2UgfTtcbiAgICAgICAgICAgICAgICBjYXNlIDU6IF8ubGFiZWwrKzsgeSA9IG9wWzFdOyBvcCA9IFswXTsgY29udGludWU7XG4gICAgICAgICAgICAgICAgY2FzZSA3OiBvcCA9IF8ub3BzLnBvcCgpOyBfLnRyeXMucG9wKCk7IGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIGlmICghKHQgPSBfLnRyeXMsIHQgPSB0Lmxlbmd0aCA+IDAgJiYgdFt0Lmxlbmd0aCAtIDFdKSAmJiAob3BbMF0gPT09IDYgfHwgb3BbMF0gPT09IDIpKSB7IF8gPSAwOyBjb250aW51ZTsgfVxuICAgICAgICAgICAgICAgICAgICBpZiAob3BbMF0gPT09IDMgJiYgKCF0IHx8IChvcFsxXSA+IHRbMF0gJiYgb3BbMV0gPCB0WzNdKSkpIHsgXy5sYWJlbCA9IG9wWzFdOyBicmVhazsgfVxuICAgICAgICAgICAgICAgICAgICBpZiAob3BbMF0gPT09IDYgJiYgXy5sYWJlbCA8IHRbMV0pIHsgXy5sYWJlbCA9IHRbMV07IHQgPSBvcDsgYnJlYWs7IH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHQgJiYgXy5sYWJlbCA8IHRbMl0pIHsgXy5sYWJlbCA9IHRbMl07IF8ub3BzLnB1c2gob3ApOyBicmVhazsgfVxuICAgICAgICAgICAgICAgICAgICBpZiAodFsyXSkgXy5vcHMucG9wKCk7XG4gICAgICAgICAgICAgICAgICAgIF8udHJ5cy5wb3AoKTsgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvcCA9IGJvZHkuY2FsbCh0aGlzQXJnLCBfKTtcbiAgICAgICAgfSBjYXRjaCAoZSkgeyBvcCA9IFs2LCBlXTsgeSA9IDA7IH0gZmluYWxseSB7IGYgPSB0ID0gMDsgfVxuICAgICAgICBpZiAob3BbMF0gJiA1KSB0aHJvdyBvcFsxXTsgcmV0dXJuIHsgdmFsdWU6IG9wWzBdID8gb3BbMV0gOiB2b2lkIDAsIGRvbmU6IHRydWUgfTtcbiAgICB9XG59O1xudmFyIEtWX1JFU1RfQVBJX1VSTCA9IFwiaHR0cHM6Ly9pbW11bmUtY3JpY2tldC0zNjAxMS5rdi52ZXJjZWwtc3RvcmFnZS5jb21cIjtcbnZhciBLVl9SRVNUX0FQSV9SRUFEX09OTFlfVE9LRU4gPSBcIkFveXJBU1FnTnpFME0yRTJOVE10TW1Gak5DMDBaVEZsTFdKbU5USXRNR1JsWVdabU1tWTNNVGMwWnB0Rzk2ZWxiWE9qWko3X0dFN3ctYXJZQUdDYWt0b28yNXE0RFhSV0w3VT1cIjtcbi8vIEZ1bmN0aW9uIHRoYXQgY29ubmVjdHMgdG8gc2VydmVyIGFuZCByZXRyaWV2ZXMgbGlzdCBvbiBrZXkgJ2FwZSdcbmV4cG9ydCB2YXIgZ2V0X2FwZV9iYWRnZXMgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBfX2F3YWl0ZXIodm9pZCAwLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBfX2dlbmVyYXRvcih0aGlzLCBmdW5jdGlvbiAoX2EpIHtcbiAgICAgICAgcmV0dXJuIFsyIC8qcmV0dXJuKi8sIGZldGNoKEtWX1JFU1RfQVBJX1VSTCwge1xuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgQXV0aG9yaXphdGlvbjogXCJCZWFyZXIgXCIuY29uY2F0KEtWX1JFU1RfQVBJX1JFQURfT05MWV9UT0tFTiksXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBib2R5OiAnW1wiTFJBTkdFXCIsIFwiYXBlXCIsIDAsIC0xXScsXG4gICAgICAgICAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7IHJldHVybiByZXNwb25zZS5qc29uKCk7IH0pXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHsgcmV0dXJuIGRhdGEucmVzdWx0OyB9KV07XG4gICAgfSk7XG59KTsgfTtcbi8qIFVwZGF0aW5nIEJhZGdlIENsYXNzZXMgKi9cbmV4cG9ydCB2YXIgQXBlQmFkZ2VJY29uID0gZnVuY3Rpb24gKENydXgsIHVybCwgZmlsZW5hbWUsIGNvdW50LCBzbWFsbCkge1xuICAgIHZhciBlYmkgPSBDcnV4LldpZGdldCgpO1xuICAgIGlmIChzbWFsbCA9PT0gdW5kZWZpbmVkKVxuICAgICAgICBzbWFsbCA9IGZhbHNlO1xuICAgIGlmIChzbWFsbCkge1xuICAgICAgICAvKiBTbWFsbCBpbWFnZXMgKi9cbiAgICAgICAgdmFyIGltYWdlX3VybCA9IFwiL2ltYWdlcy9iYWRnZXNfc21hbGwvXCIuY29uY2F0KGZpbGVuYW1lLCBcIi5wbmdcIik7XG4gICAgICAgIGlmIChmaWxlbmFtZSA9PSBcImFwZVwiKSB7XG4gICAgICAgICAgICBpbWFnZV91cmwgPSBcIlwiLmNvbmNhdCh1cmwpLmNvbmNhdChmaWxlbmFtZSwgXCJfc21hbGwucG5nXCIpO1xuICAgICAgICB9XG4gICAgICAgIENydXguSW1hZ2UoaW1hZ2VfdXJsLCBcImFic1wiKS5ncmlkKDAuMjUsIDAuMjUsIDIuNSwgMi41KS5yb29zdChlYmkpO1xuICAgICAgICBDcnV4LkNsaWNrYWJsZShcInNob3dfc2NyZWVuXCIsIFwiYnV5X2dpZnRcIilcbiAgICAgICAgICAgIC5ncmlkKDAuMjUsIDAuMjUsIDIuNSwgMi41KVxuICAgICAgICAgICAgLnR0KFwiYmFkZ2VfXCIuY29uY2F0KGZpbGVuYW1lKSlcbiAgICAgICAgICAgIC5yb29zdChlYmkpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgLyogQmlnIGltYWdlcyAqL1xuICAgICAgICB2YXIgaW1hZ2VfdXJsID0gXCIvaW1hZ2VzL2JhZGdlcy9cIi5jb25jYXQoZmlsZW5hbWUsIFwiLnBuZ1wiKTtcbiAgICAgICAgaWYgKGZpbGVuYW1lID09IFwiYXBlXCIpIHtcbiAgICAgICAgICAgIGltYWdlX3VybCA9IFwiXCIuY29uY2F0KHVybCkuY29uY2F0KGZpbGVuYW1lLCBcIi5wbmdcIik7XG4gICAgICAgIH1cbiAgICAgICAgQ3J1eC5JbWFnZShpbWFnZV91cmwsIFwiYWJzXCIpLmdyaWQoMCwgMCwgNiwgNikudHQoZmlsZW5hbWUpLnJvb3N0KGViaSk7XG4gICAgICAgIENydXguQ2xpY2thYmxlKFwic2hvd19zY3JlZW5cIiwgXCJidXlfZ2lmdFwiKVxuICAgICAgICAgICAgLmdyaWQoMCwgMCwgNiwgNilcbiAgICAgICAgICAgIC50dChcImJhZGdlX1wiLmNvbmNhdChmaWxlbmFtZSkpXG4gICAgICAgICAgICAucm9vc3QoZWJpKTtcbiAgICB9XG4gICAgaWYgKGNvdW50ID4gMSAmJiAhc21hbGwpIHtcbiAgICAgICAgQ3J1eC5JbWFnZShcIi9pbWFnZXMvYmFkZ2VzL2NvdW50ZXIucG5nXCIsIFwiYWJzXCIpXG4gICAgICAgICAgICAuZ3JpZCgwLCAwLCA2LCA2KVxuICAgICAgICAgICAgLnR0KGZpbGVuYW1lKVxuICAgICAgICAgICAgLnJvb3N0KGViaSk7XG4gICAgICAgIENydXguVGV4dChcIlwiLCBcInR4dF9jZW50ZXIgdHh0X3RpbnlcIiwgXCJhYnNcIilcbiAgICAgICAgICAgIC5yYXdIVE1MKGNvdW50KVxuICAgICAgICAgICAgLnBvcyg1MSwgNjQpXG4gICAgICAgICAgICAuc2l6ZSgzMiwgMzIpXG4gICAgICAgICAgICAucm9vc3QoZWJpKTtcbiAgICB9XG4gICAgcmV0dXJuIGViaTtcbn07XG4vKlxuY29uc3QgZ3JvdXBBcGVCYWRnZXMgPSBmdW5jdGlvbiAoYmFkZ2VzU3RyaW5nOiBzdHJpbmcpIHtcbiAgaWYgKCFiYWRnZXNTdHJpbmcpIGJhZGdlc1N0cmluZyA9IFwiXCI7XG4gIHZhciBncm91cGVkQmFkZ2VzOiB7IFtrZXk6IHN0cmluZ106IG51bWJlciB9ID0ge307XG4gIHZhciBpO1xuICBmb3IgKGkgPSBiYWRnZXNTdHJpbmcubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICB2YXIgYmNoYXIgPSBiYWRnZXNTdHJpbmcuY2hhckF0KGkpO1xuICAgIGlmIChncm91cGVkQmFkZ2VzLmhhc093blByb3BlcnR5KGJjaGFyKSkge1xuICAgICAgZ3JvdXBlZEJhZGdlc1tiY2hhcl0gKz0gMTtcbiAgICB9IGVsc2Uge1xuICAgICAgZ3JvdXBlZEJhZGdlc1tiY2hhcl0gPSAxO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZ3JvdXBlZEJhZGdlcztcbn07XG4qL1xuIiwiLyoqXG4gKiBtYXJrZWQgdjQuMy4wIC0gYSBtYXJrZG93biBwYXJzZXJcbiAqIENvcHlyaWdodCAoYykgMjAxMS0yMDIzLCBDaHJpc3RvcGhlciBKZWZmcmV5LiAoTUlUIExpY2Vuc2VkKVxuICogaHR0cHM6Ly9naXRodWIuY29tL21hcmtlZGpzL21hcmtlZFxuICovXG5cbi8qKlxuICogRE8gTk9UIEVESVQgVEhJUyBGSUxFXG4gKiBUaGUgY29kZSBpbiB0aGlzIGZpbGUgaXMgZ2VuZXJhdGVkIGZyb20gZmlsZXMgaW4gLi9zcmMvXG4gKi9cblxuZnVuY3Rpb24gZ2V0RGVmYXVsdHMoKSB7XG4gIHJldHVybiB7XG4gICAgYXN5bmM6IGZhbHNlLFxuICAgIGJhc2VVcmw6IG51bGwsXG4gICAgYnJlYWtzOiBmYWxzZSxcbiAgICBleHRlbnNpb25zOiBudWxsLFxuICAgIGdmbTogdHJ1ZSxcbiAgICBoZWFkZXJJZHM6IHRydWUsXG4gICAgaGVhZGVyUHJlZml4OiAnJyxcbiAgICBoaWdobGlnaHQ6IG51bGwsXG4gICAgaG9va3M6IG51bGwsXG4gICAgbGFuZ1ByZWZpeDogJ2xhbmd1YWdlLScsXG4gICAgbWFuZ2xlOiB0cnVlLFxuICAgIHBlZGFudGljOiBmYWxzZSxcbiAgICByZW5kZXJlcjogbnVsbCxcbiAgICBzYW5pdGl6ZTogZmFsc2UsXG4gICAgc2FuaXRpemVyOiBudWxsLFxuICAgIHNpbGVudDogZmFsc2UsXG4gICAgc21hcnR5cGFudHM6IGZhbHNlLFxuICAgIHRva2VuaXplcjogbnVsbCxcbiAgICB3YWxrVG9rZW5zOiBudWxsLFxuICAgIHhodG1sOiBmYWxzZVxuICB9O1xufVxuXG5sZXQgZGVmYXVsdHMgPSBnZXREZWZhdWx0cygpO1xuXG5mdW5jdGlvbiBjaGFuZ2VEZWZhdWx0cyhuZXdEZWZhdWx0cykge1xuICBkZWZhdWx0cyA9IG5ld0RlZmF1bHRzO1xufVxuXG4vKipcbiAqIEhlbHBlcnNcbiAqL1xuY29uc3QgZXNjYXBlVGVzdCA9IC9bJjw+XCInXS87XG5jb25zdCBlc2NhcGVSZXBsYWNlID0gbmV3IFJlZ0V4cChlc2NhcGVUZXN0LnNvdXJjZSwgJ2cnKTtcbmNvbnN0IGVzY2FwZVRlc3ROb0VuY29kZSA9IC9bPD5cIiddfCYoPyEoI1xcZHsxLDd9fCNbWHhdW2EtZkEtRjAtOV17MSw2fXxcXHcrKTspLztcbmNvbnN0IGVzY2FwZVJlcGxhY2VOb0VuY29kZSA9IG5ldyBSZWdFeHAoZXNjYXBlVGVzdE5vRW5jb2RlLnNvdXJjZSwgJ2cnKTtcbmNvbnN0IGVzY2FwZVJlcGxhY2VtZW50cyA9IHtcbiAgJyYnOiAnJmFtcDsnLFxuICAnPCc6ICcmbHQ7JyxcbiAgJz4nOiAnJmd0OycsXG4gICdcIic6ICcmcXVvdDsnLFxuICBcIidcIjogJyYjMzk7J1xufTtcbmNvbnN0IGdldEVzY2FwZVJlcGxhY2VtZW50ID0gKGNoKSA9PiBlc2NhcGVSZXBsYWNlbWVudHNbY2hdO1xuZnVuY3Rpb24gZXNjYXBlKGh0bWwsIGVuY29kZSkge1xuICBpZiAoZW5jb2RlKSB7XG4gICAgaWYgKGVzY2FwZVRlc3QudGVzdChodG1sKSkge1xuICAgICAgcmV0dXJuIGh0bWwucmVwbGFjZShlc2NhcGVSZXBsYWNlLCBnZXRFc2NhcGVSZXBsYWNlbWVudCk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmIChlc2NhcGVUZXN0Tm9FbmNvZGUudGVzdChodG1sKSkge1xuICAgICAgcmV0dXJuIGh0bWwucmVwbGFjZShlc2NhcGVSZXBsYWNlTm9FbmNvZGUsIGdldEVzY2FwZVJlcGxhY2VtZW50KTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gaHRtbDtcbn1cblxuY29uc3QgdW5lc2NhcGVUZXN0ID0gLyYoIyg/OlxcZCspfCg/OiN4WzAtOUEtRmEtZl0rKXwoPzpcXHcrKSk7Py9pZztcblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30gaHRtbFxuICovXG5mdW5jdGlvbiB1bmVzY2FwZShodG1sKSB7XG4gIC8vIGV4cGxpY2l0bHkgbWF0Y2ggZGVjaW1hbCwgaGV4LCBhbmQgbmFtZWQgSFRNTCBlbnRpdGllc1xuICByZXR1cm4gaHRtbC5yZXBsYWNlKHVuZXNjYXBlVGVzdCwgKF8sIG4pID0+IHtcbiAgICBuID0gbi50b0xvd2VyQ2FzZSgpO1xuICAgIGlmIChuID09PSAnY29sb24nKSByZXR1cm4gJzonO1xuICAgIGlmIChuLmNoYXJBdCgwKSA9PT0gJyMnKSB7XG4gICAgICByZXR1cm4gbi5jaGFyQXQoMSkgPT09ICd4J1xuICAgICAgICA/IFN0cmluZy5mcm9tQ2hhckNvZGUocGFyc2VJbnQobi5zdWJzdHJpbmcoMiksIDE2KSlcbiAgICAgICAgOiBTdHJpbmcuZnJvbUNoYXJDb2RlKCtuLnN1YnN0cmluZygxKSk7XG4gICAgfVxuICAgIHJldHVybiAnJztcbiAgfSk7XG59XG5cbmNvbnN0IGNhcmV0ID0gLyhefFteXFxbXSlcXF4vZztcblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZyB8IFJlZ0V4cH0gcmVnZXhcbiAqIEBwYXJhbSB7c3RyaW5nfSBvcHRcbiAqL1xuZnVuY3Rpb24gZWRpdChyZWdleCwgb3B0KSB7XG4gIHJlZ2V4ID0gdHlwZW9mIHJlZ2V4ID09PSAnc3RyaW5nJyA/IHJlZ2V4IDogcmVnZXguc291cmNlO1xuICBvcHQgPSBvcHQgfHwgJyc7XG4gIGNvbnN0IG9iaiA9IHtcbiAgICByZXBsYWNlOiAobmFtZSwgdmFsKSA9PiB7XG4gICAgICB2YWwgPSB2YWwuc291cmNlIHx8IHZhbDtcbiAgICAgIHZhbCA9IHZhbC5yZXBsYWNlKGNhcmV0LCAnJDEnKTtcbiAgICAgIHJlZ2V4ID0gcmVnZXgucmVwbGFjZShuYW1lLCB2YWwpO1xuICAgICAgcmV0dXJuIG9iajtcbiAgICB9LFxuICAgIGdldFJlZ2V4OiAoKSA9PiB7XG4gICAgICByZXR1cm4gbmV3IFJlZ0V4cChyZWdleCwgb3B0KTtcbiAgICB9XG4gIH07XG4gIHJldHVybiBvYmo7XG59XG5cbmNvbnN0IG5vbldvcmRBbmRDb2xvblRlc3QgPSAvW15cXHc6XS9nO1xuY29uc3Qgb3JpZ2luSW5kZXBlbmRlbnRVcmwgPSAvXiR8XlthLXpdW2EtejAtOSsuLV0qOnxeWz8jXS9pO1xuXG4vKipcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gc2FuaXRpemVcbiAqIEBwYXJhbSB7c3RyaW5nfSBiYXNlXG4gKiBAcGFyYW0ge3N0cmluZ30gaHJlZlxuICovXG5mdW5jdGlvbiBjbGVhblVybChzYW5pdGl6ZSwgYmFzZSwgaHJlZikge1xuICBpZiAoc2FuaXRpemUpIHtcbiAgICBsZXQgcHJvdDtcbiAgICB0cnkge1xuICAgICAgcHJvdCA9IGRlY29kZVVSSUNvbXBvbmVudCh1bmVzY2FwZShocmVmKSlcbiAgICAgICAgLnJlcGxhY2Uobm9uV29yZEFuZENvbG9uVGVzdCwgJycpXG4gICAgICAgIC50b0xvd2VyQ2FzZSgpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBpZiAocHJvdC5pbmRleE9mKCdqYXZhc2NyaXB0OicpID09PSAwIHx8IHByb3QuaW5kZXhPZigndmJzY3JpcHQ6JykgPT09IDAgfHwgcHJvdC5pbmRleE9mKCdkYXRhOicpID09PSAwKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cbiAgaWYgKGJhc2UgJiYgIW9yaWdpbkluZGVwZW5kZW50VXJsLnRlc3QoaHJlZikpIHtcbiAgICBocmVmID0gcmVzb2x2ZVVybChiYXNlLCBocmVmKTtcbiAgfVxuICB0cnkge1xuICAgIGhyZWYgPSBlbmNvZGVVUkkoaHJlZikucmVwbGFjZSgvJTI1L2csICclJyk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICByZXR1cm4gaHJlZjtcbn1cblxuY29uc3QgYmFzZVVybHMgPSB7fTtcbmNvbnN0IGp1c3REb21haW4gPSAvXlteOl0rOlxcLypbXi9dKiQvO1xuY29uc3QgcHJvdG9jb2wgPSAvXihbXjpdKzopW1xcc1xcU10qJC87XG5jb25zdCBkb21haW4gPSAvXihbXjpdKzpcXC8qW14vXSopW1xcc1xcU10qJC87XG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmd9IGJhc2VcbiAqIEBwYXJhbSB7c3RyaW5nfSBocmVmXG4gKi9cbmZ1bmN0aW9uIHJlc29sdmVVcmwoYmFzZSwgaHJlZikge1xuICBpZiAoIWJhc2VVcmxzWycgJyArIGJhc2VdKSB7XG4gICAgLy8gd2UgY2FuIGlnbm9yZSBldmVyeXRoaW5nIGluIGJhc2UgYWZ0ZXIgdGhlIGxhc3Qgc2xhc2ggb2YgaXRzIHBhdGggY29tcG9uZW50LFxuICAgIC8vIGJ1dCB3ZSBtaWdodCBuZWVkIHRvIGFkZCBfdGhhdF9cbiAgICAvLyBodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzk4NiNzZWN0aW9uLTNcbiAgICBpZiAoanVzdERvbWFpbi50ZXN0KGJhc2UpKSB7XG4gICAgICBiYXNlVXJsc1snICcgKyBiYXNlXSA9IGJhc2UgKyAnLyc7XG4gICAgfSBlbHNlIHtcbiAgICAgIGJhc2VVcmxzWycgJyArIGJhc2VdID0gcnRyaW0oYmFzZSwgJy8nLCB0cnVlKTtcbiAgICB9XG4gIH1cbiAgYmFzZSA9IGJhc2VVcmxzWycgJyArIGJhc2VdO1xuICBjb25zdCByZWxhdGl2ZUJhc2UgPSBiYXNlLmluZGV4T2YoJzonKSA9PT0gLTE7XG5cbiAgaWYgKGhyZWYuc3Vic3RyaW5nKDAsIDIpID09PSAnLy8nKSB7XG4gICAgaWYgKHJlbGF0aXZlQmFzZSkge1xuICAgICAgcmV0dXJuIGhyZWY7XG4gICAgfVxuICAgIHJldHVybiBiYXNlLnJlcGxhY2UocHJvdG9jb2wsICckMScpICsgaHJlZjtcbiAgfSBlbHNlIGlmIChocmVmLmNoYXJBdCgwKSA9PT0gJy8nKSB7XG4gICAgaWYgKHJlbGF0aXZlQmFzZSkge1xuICAgICAgcmV0dXJuIGhyZWY7XG4gICAgfVxuICAgIHJldHVybiBiYXNlLnJlcGxhY2UoZG9tYWluLCAnJDEnKSArIGhyZWY7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGJhc2UgKyBocmVmO1xuICB9XG59XG5cbmNvbnN0IG5vb3BUZXN0ID0geyBleGVjOiBmdW5jdGlvbiBub29wVGVzdCgpIHt9IH07XG5cbmZ1bmN0aW9uIHNwbGl0Q2VsbHModGFibGVSb3csIGNvdW50KSB7XG4gIC8vIGVuc3VyZSB0aGF0IGV2ZXJ5IGNlbGwtZGVsaW1pdGluZyBwaXBlIGhhcyBhIHNwYWNlXG4gIC8vIGJlZm9yZSBpdCB0byBkaXN0aW5ndWlzaCBpdCBmcm9tIGFuIGVzY2FwZWQgcGlwZVxuICBjb25zdCByb3cgPSB0YWJsZVJvdy5yZXBsYWNlKC9cXHwvZywgKG1hdGNoLCBvZmZzZXQsIHN0cikgPT4ge1xuICAgICAgbGV0IGVzY2FwZWQgPSBmYWxzZSxcbiAgICAgICAgY3VyciA9IG9mZnNldDtcbiAgICAgIHdoaWxlICgtLWN1cnIgPj0gMCAmJiBzdHJbY3Vycl0gPT09ICdcXFxcJykgZXNjYXBlZCA9ICFlc2NhcGVkO1xuICAgICAgaWYgKGVzY2FwZWQpIHtcbiAgICAgICAgLy8gb2RkIG51bWJlciBvZiBzbGFzaGVzIG1lYW5zIHwgaXMgZXNjYXBlZFxuICAgICAgICAvLyBzbyB3ZSBsZWF2ZSBpdCBhbG9uZVxuICAgICAgICByZXR1cm4gJ3wnO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gYWRkIHNwYWNlIGJlZm9yZSB1bmVzY2FwZWQgfFxuICAgICAgICByZXR1cm4gJyB8JztcbiAgICAgIH1cbiAgICB9KSxcbiAgICBjZWxscyA9IHJvdy5zcGxpdCgvIFxcfC8pO1xuICBsZXQgaSA9IDA7XG5cbiAgLy8gRmlyc3QvbGFzdCBjZWxsIGluIGEgcm93IGNhbm5vdCBiZSBlbXB0eSBpZiBpdCBoYXMgbm8gbGVhZGluZy90cmFpbGluZyBwaXBlXG4gIGlmICghY2VsbHNbMF0udHJpbSgpKSB7IGNlbGxzLnNoaWZ0KCk7IH1cbiAgaWYgKGNlbGxzLmxlbmd0aCA+IDAgJiYgIWNlbGxzW2NlbGxzLmxlbmd0aCAtIDFdLnRyaW0oKSkgeyBjZWxscy5wb3AoKTsgfVxuXG4gIGlmIChjZWxscy5sZW5ndGggPiBjb3VudCkge1xuICAgIGNlbGxzLnNwbGljZShjb3VudCk7XG4gIH0gZWxzZSB7XG4gICAgd2hpbGUgKGNlbGxzLmxlbmd0aCA8IGNvdW50KSBjZWxscy5wdXNoKCcnKTtcbiAgfVxuXG4gIGZvciAoOyBpIDwgY2VsbHMubGVuZ3RoOyBpKyspIHtcbiAgICAvLyBsZWFkaW5nIG9yIHRyYWlsaW5nIHdoaXRlc3BhY2UgaXMgaWdub3JlZCBwZXIgdGhlIGdmbSBzcGVjXG4gICAgY2VsbHNbaV0gPSBjZWxsc1tpXS50cmltKCkucmVwbGFjZSgvXFxcXFxcfC9nLCAnfCcpO1xuICB9XG4gIHJldHVybiBjZWxscztcbn1cblxuLyoqXG4gKiBSZW1vdmUgdHJhaWxpbmcgJ2Mncy4gRXF1aXZhbGVudCB0byBzdHIucmVwbGFjZSgvYyokLywgJycpLlxuICogL2MqJC8gaXMgdnVsbmVyYWJsZSB0byBSRURPUy5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RyXG4gKiBAcGFyYW0ge3N0cmluZ30gY1xuICogQHBhcmFtIHtib29sZWFufSBpbnZlcnQgUmVtb3ZlIHN1ZmZpeCBvZiBub24tYyBjaGFycyBpbnN0ZWFkLiBEZWZhdWx0IGZhbHNleS5cbiAqL1xuZnVuY3Rpb24gcnRyaW0oc3RyLCBjLCBpbnZlcnQpIHtcbiAgY29uc3QgbCA9IHN0ci5sZW5ndGg7XG4gIGlmIChsID09PSAwKSB7XG4gICAgcmV0dXJuICcnO1xuICB9XG5cbiAgLy8gTGVuZ3RoIG9mIHN1ZmZpeCBtYXRjaGluZyB0aGUgaW52ZXJ0IGNvbmRpdGlvbi5cbiAgbGV0IHN1ZmZMZW4gPSAwO1xuXG4gIC8vIFN0ZXAgbGVmdCB1bnRpbCB3ZSBmYWlsIHRvIG1hdGNoIHRoZSBpbnZlcnQgY29uZGl0aW9uLlxuICB3aGlsZSAoc3VmZkxlbiA8IGwpIHtcbiAgICBjb25zdCBjdXJyQ2hhciA9IHN0ci5jaGFyQXQobCAtIHN1ZmZMZW4gLSAxKTtcbiAgICBpZiAoY3VyckNoYXIgPT09IGMgJiYgIWludmVydCkge1xuICAgICAgc3VmZkxlbisrO1xuICAgIH0gZWxzZSBpZiAoY3VyckNoYXIgIT09IGMgJiYgaW52ZXJ0KSB7XG4gICAgICBzdWZmTGVuKys7XG4gICAgfSBlbHNlIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBzdHIuc2xpY2UoMCwgbCAtIHN1ZmZMZW4pO1xufVxuXG5mdW5jdGlvbiBmaW5kQ2xvc2luZ0JyYWNrZXQoc3RyLCBiKSB7XG4gIGlmIChzdHIuaW5kZXhPZihiWzFdKSA9PT0gLTEpIHtcbiAgICByZXR1cm4gLTE7XG4gIH1cbiAgY29uc3QgbCA9IHN0ci5sZW5ndGg7XG4gIGxldCBsZXZlbCA9IDAsXG4gICAgaSA9IDA7XG4gIGZvciAoOyBpIDwgbDsgaSsrKSB7XG4gICAgaWYgKHN0cltpXSA9PT0gJ1xcXFwnKSB7XG4gICAgICBpKys7XG4gICAgfSBlbHNlIGlmIChzdHJbaV0gPT09IGJbMF0pIHtcbiAgICAgIGxldmVsKys7XG4gICAgfSBlbHNlIGlmIChzdHJbaV0gPT09IGJbMV0pIHtcbiAgICAgIGxldmVsLS07XG4gICAgICBpZiAobGV2ZWwgPCAwKSB7XG4gICAgICAgIHJldHVybiBpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gLTE7XG59XG5cbmZ1bmN0aW9uIGNoZWNrU2FuaXRpemVEZXByZWNhdGlvbihvcHQpIHtcbiAgaWYgKG9wdCAmJiBvcHQuc2FuaXRpemUgJiYgIW9wdC5zaWxlbnQpIHtcbiAgICBjb25zb2xlLndhcm4oJ21hcmtlZCgpOiBzYW5pdGl6ZSBhbmQgc2FuaXRpemVyIHBhcmFtZXRlcnMgYXJlIGRlcHJlY2F0ZWQgc2luY2UgdmVyc2lvbiAwLjcuMCwgc2hvdWxkIG5vdCBiZSB1c2VkIGFuZCB3aWxsIGJlIHJlbW92ZWQgaW4gdGhlIGZ1dHVyZS4gUmVhZCBtb3JlIGhlcmU6IGh0dHBzOi8vbWFya2VkLmpzLm9yZy8jL1VTSU5HX0FEVkFOQ0VELm1kI29wdGlvbnMnKTtcbiAgfVxufVxuXG4vLyBjb3BpZWQgZnJvbSBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL2EvNTQ1MDExMy84MDY3Nzdcbi8qKlxuICogQHBhcmFtIHtzdHJpbmd9IHBhdHRlcm5cbiAqIEBwYXJhbSB7bnVtYmVyfSBjb3VudFxuICovXG5mdW5jdGlvbiByZXBlYXRTdHJpbmcocGF0dGVybiwgY291bnQpIHtcbiAgaWYgKGNvdW50IDwgMSkge1xuICAgIHJldHVybiAnJztcbiAgfVxuICBsZXQgcmVzdWx0ID0gJyc7XG4gIHdoaWxlIChjb3VudCA+IDEpIHtcbiAgICBpZiAoY291bnQgJiAxKSB7XG4gICAgICByZXN1bHQgKz0gcGF0dGVybjtcbiAgICB9XG4gICAgY291bnQgPj49IDE7XG4gICAgcGF0dGVybiArPSBwYXR0ZXJuO1xuICB9XG4gIHJldHVybiByZXN1bHQgKyBwYXR0ZXJuO1xufVxuXG5mdW5jdGlvbiBvdXRwdXRMaW5rKGNhcCwgbGluaywgcmF3LCBsZXhlcikge1xuICBjb25zdCBocmVmID0gbGluay5ocmVmO1xuICBjb25zdCB0aXRsZSA9IGxpbmsudGl0bGUgPyBlc2NhcGUobGluay50aXRsZSkgOiBudWxsO1xuICBjb25zdCB0ZXh0ID0gY2FwWzFdLnJlcGxhY2UoL1xcXFwoW1xcW1xcXV0pL2csICckMScpO1xuXG4gIGlmIChjYXBbMF0uY2hhckF0KDApICE9PSAnIScpIHtcbiAgICBsZXhlci5zdGF0ZS5pbkxpbmsgPSB0cnVlO1xuICAgIGNvbnN0IHRva2VuID0ge1xuICAgICAgdHlwZTogJ2xpbmsnLFxuICAgICAgcmF3LFxuICAgICAgaHJlZixcbiAgICAgIHRpdGxlLFxuICAgICAgdGV4dCxcbiAgICAgIHRva2VuczogbGV4ZXIuaW5saW5lVG9rZW5zKHRleHQpXG4gICAgfTtcbiAgICBsZXhlci5zdGF0ZS5pbkxpbmsgPSBmYWxzZTtcbiAgICByZXR1cm4gdG9rZW47XG4gIH1cbiAgcmV0dXJuIHtcbiAgICB0eXBlOiAnaW1hZ2UnLFxuICAgIHJhdyxcbiAgICBocmVmLFxuICAgIHRpdGxlLFxuICAgIHRleHQ6IGVzY2FwZSh0ZXh0KVxuICB9O1xufVxuXG5mdW5jdGlvbiBpbmRlbnRDb2RlQ29tcGVuc2F0aW9uKHJhdywgdGV4dCkge1xuICBjb25zdCBtYXRjaEluZGVudFRvQ29kZSA9IHJhdy5tYXRjaCgvXihcXHMrKSg/OmBgYCkvKTtcblxuICBpZiAobWF0Y2hJbmRlbnRUb0NvZGUgPT09IG51bGwpIHtcbiAgICByZXR1cm4gdGV4dDtcbiAgfVxuXG4gIGNvbnN0IGluZGVudFRvQ29kZSA9IG1hdGNoSW5kZW50VG9Db2RlWzFdO1xuXG4gIHJldHVybiB0ZXh0XG4gICAgLnNwbGl0KCdcXG4nKVxuICAgIC5tYXAobm9kZSA9PiB7XG4gICAgICBjb25zdCBtYXRjaEluZGVudEluTm9kZSA9IG5vZGUubWF0Y2goL15cXHMrLyk7XG4gICAgICBpZiAobWF0Y2hJbmRlbnRJbk5vZGUgPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IFtpbmRlbnRJbk5vZGVdID0gbWF0Y2hJbmRlbnRJbk5vZGU7XG5cbiAgICAgIGlmIChpbmRlbnRJbk5vZGUubGVuZ3RoID49IGluZGVudFRvQ29kZS5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIG5vZGUuc2xpY2UoaW5kZW50VG9Db2RlLmxlbmd0aCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBub2RlO1xuICAgIH0pXG4gICAgLmpvaW4oJ1xcbicpO1xufVxuXG4vKipcbiAqIFRva2VuaXplclxuICovXG5jbGFzcyBUb2tlbml6ZXIge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyB8fCBkZWZhdWx0cztcbiAgfVxuXG4gIHNwYWNlKHNyYykge1xuICAgIGNvbnN0IGNhcCA9IHRoaXMucnVsZXMuYmxvY2submV3bGluZS5leGVjKHNyYyk7XG4gICAgaWYgKGNhcCAmJiBjYXBbMF0ubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ3NwYWNlJyxcbiAgICAgICAgcmF3OiBjYXBbMF1cbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgY29kZShzcmMpIHtcbiAgICBjb25zdCBjYXAgPSB0aGlzLnJ1bGVzLmJsb2NrLmNvZGUuZXhlYyhzcmMpO1xuICAgIGlmIChjYXApIHtcbiAgICAgIGNvbnN0IHRleHQgPSBjYXBbMF0ucmVwbGFjZSgvXiB7MSw0fS9nbSwgJycpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ2NvZGUnLFxuICAgICAgICByYXc6IGNhcFswXSxcbiAgICAgICAgY29kZUJsb2NrU3R5bGU6ICdpbmRlbnRlZCcsXG4gICAgICAgIHRleHQ6ICF0aGlzLm9wdGlvbnMucGVkYW50aWNcbiAgICAgICAgICA/IHJ0cmltKHRleHQsICdcXG4nKVxuICAgICAgICAgIDogdGV4dFxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICBmZW5jZXMoc3JjKSB7XG4gICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5ibG9jay5mZW5jZXMuZXhlYyhzcmMpO1xuICAgIGlmIChjYXApIHtcbiAgICAgIGNvbnN0IHJhdyA9IGNhcFswXTtcbiAgICAgIGNvbnN0IHRleHQgPSBpbmRlbnRDb2RlQ29tcGVuc2F0aW9uKHJhdywgY2FwWzNdIHx8ICcnKTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ2NvZGUnLFxuICAgICAgICByYXcsXG4gICAgICAgIGxhbmc6IGNhcFsyXSA/IGNhcFsyXS50cmltKCkucmVwbGFjZSh0aGlzLnJ1bGVzLmlubGluZS5fZXNjYXBlcywgJyQxJykgOiBjYXBbMl0sXG4gICAgICAgIHRleHRcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgaGVhZGluZyhzcmMpIHtcbiAgICBjb25zdCBjYXAgPSB0aGlzLnJ1bGVzLmJsb2NrLmhlYWRpbmcuZXhlYyhzcmMpO1xuICAgIGlmIChjYXApIHtcbiAgICAgIGxldCB0ZXh0ID0gY2FwWzJdLnRyaW0oKTtcblxuICAgICAgLy8gcmVtb3ZlIHRyYWlsaW5nICNzXG4gICAgICBpZiAoLyMkLy50ZXN0KHRleHQpKSB7XG4gICAgICAgIGNvbnN0IHRyaW1tZWQgPSBydHJpbSh0ZXh0LCAnIycpO1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnBlZGFudGljKSB7XG4gICAgICAgICAgdGV4dCA9IHRyaW1tZWQudHJpbSgpO1xuICAgICAgICB9IGVsc2UgaWYgKCF0cmltbWVkIHx8IC8gJC8udGVzdCh0cmltbWVkKSkge1xuICAgICAgICAgIC8vIENvbW1vbk1hcmsgcmVxdWlyZXMgc3BhY2UgYmVmb3JlIHRyYWlsaW5nICNzXG4gICAgICAgICAgdGV4dCA9IHRyaW1tZWQudHJpbSgpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdoZWFkaW5nJyxcbiAgICAgICAgcmF3OiBjYXBbMF0sXG4gICAgICAgIGRlcHRoOiBjYXBbMV0ubGVuZ3RoLFxuICAgICAgICB0ZXh0LFxuICAgICAgICB0b2tlbnM6IHRoaXMubGV4ZXIuaW5saW5lKHRleHQpXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIGhyKHNyYykge1xuICAgIGNvbnN0IGNhcCA9IHRoaXMucnVsZXMuYmxvY2suaHIuZXhlYyhzcmMpO1xuICAgIGlmIChjYXApIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdocicsXG4gICAgICAgIHJhdzogY2FwWzBdXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIGJsb2NrcXVvdGUoc3JjKSB7XG4gICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5ibG9jay5ibG9ja3F1b3RlLmV4ZWMoc3JjKTtcbiAgICBpZiAoY2FwKSB7XG4gICAgICBjb25zdCB0ZXh0ID0gY2FwWzBdLnJlcGxhY2UoL14gKj5bIFxcdF0/L2dtLCAnJyk7XG4gICAgICBjb25zdCB0b3AgPSB0aGlzLmxleGVyLnN0YXRlLnRvcDtcbiAgICAgIHRoaXMubGV4ZXIuc3RhdGUudG9wID0gdHJ1ZTtcbiAgICAgIGNvbnN0IHRva2VucyA9IHRoaXMubGV4ZXIuYmxvY2tUb2tlbnModGV4dCk7XG4gICAgICB0aGlzLmxleGVyLnN0YXRlLnRvcCA9IHRvcDtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdibG9ja3F1b3RlJyxcbiAgICAgICAgcmF3OiBjYXBbMF0sXG4gICAgICAgIHRva2VucyxcbiAgICAgICAgdGV4dFxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICBsaXN0KHNyYykge1xuICAgIGxldCBjYXAgPSB0aGlzLnJ1bGVzLmJsb2NrLmxpc3QuZXhlYyhzcmMpO1xuICAgIGlmIChjYXApIHtcbiAgICAgIGxldCByYXcsIGlzdGFzaywgaXNjaGVja2VkLCBpbmRlbnQsIGksIGJsYW5rTGluZSwgZW5kc1dpdGhCbGFua0xpbmUsXG4gICAgICAgIGxpbmUsIG5leHRMaW5lLCByYXdMaW5lLCBpdGVtQ29udGVudHMsIGVuZEVhcmx5O1xuXG4gICAgICBsZXQgYnVsbCA9IGNhcFsxXS50cmltKCk7XG4gICAgICBjb25zdCBpc29yZGVyZWQgPSBidWxsLmxlbmd0aCA+IDE7XG5cbiAgICAgIGNvbnN0IGxpc3QgPSB7XG4gICAgICAgIHR5cGU6ICdsaXN0JyxcbiAgICAgICAgcmF3OiAnJyxcbiAgICAgICAgb3JkZXJlZDogaXNvcmRlcmVkLFxuICAgICAgICBzdGFydDogaXNvcmRlcmVkID8gK2J1bGwuc2xpY2UoMCwgLTEpIDogJycsXG4gICAgICAgIGxvb3NlOiBmYWxzZSxcbiAgICAgICAgaXRlbXM6IFtdXG4gICAgICB9O1xuXG4gICAgICBidWxsID0gaXNvcmRlcmVkID8gYFxcXFxkezEsOX1cXFxcJHtidWxsLnNsaWNlKC0xKX1gIDogYFxcXFwke2J1bGx9YDtcblxuICAgICAgaWYgKHRoaXMub3B0aW9ucy5wZWRhbnRpYykge1xuICAgICAgICBidWxsID0gaXNvcmRlcmVkID8gYnVsbCA6ICdbKistXSc7XG4gICAgICB9XG5cbiAgICAgIC8vIEdldCBuZXh0IGxpc3QgaXRlbVxuICAgICAgY29uc3QgaXRlbVJlZ2V4ID0gbmV3IFJlZ0V4cChgXiggezAsM30ke2J1bGx9KSgoPzpbXFx0IF1bXlxcXFxuXSopPyg/OlxcXFxufCQpKWApO1xuXG4gICAgICAvLyBDaGVjayBpZiBjdXJyZW50IGJ1bGxldCBwb2ludCBjYW4gc3RhcnQgYSBuZXcgTGlzdCBJdGVtXG4gICAgICB3aGlsZSAoc3JjKSB7XG4gICAgICAgIGVuZEVhcmx5ID0gZmFsc2U7XG4gICAgICAgIGlmICghKGNhcCA9IGl0ZW1SZWdleC5leGVjKHNyYykpKSB7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5ydWxlcy5ibG9jay5oci50ZXN0KHNyYykpIHsgLy8gRW5kIGxpc3QgaWYgYnVsbGV0IHdhcyBhY3R1YWxseSBIUiAocG9zc2libHkgbW92ZSBpbnRvIGl0ZW1SZWdleD8pXG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICByYXcgPSBjYXBbMF07XG4gICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcocmF3Lmxlbmd0aCk7XG5cbiAgICAgICAgbGluZSA9IGNhcFsyXS5zcGxpdCgnXFxuJywgMSlbMF0ucmVwbGFjZSgvXlxcdCsvLCAodCkgPT4gJyAnLnJlcGVhdCgzICogdC5sZW5ndGgpKTtcbiAgICAgICAgbmV4dExpbmUgPSBzcmMuc3BsaXQoJ1xcbicsIDEpWzBdO1xuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMucGVkYW50aWMpIHtcbiAgICAgICAgICBpbmRlbnQgPSAyO1xuICAgICAgICAgIGl0ZW1Db250ZW50cyA9IGxpbmUudHJpbUxlZnQoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpbmRlbnQgPSBjYXBbMl0uc2VhcmNoKC9bXiBdLyk7IC8vIEZpbmQgZmlyc3Qgbm9uLXNwYWNlIGNoYXJcbiAgICAgICAgICBpbmRlbnQgPSBpbmRlbnQgPiA0ID8gMSA6IGluZGVudDsgLy8gVHJlYXQgaW5kZW50ZWQgY29kZSBibG9ja3MgKD4gNCBzcGFjZXMpIGFzIGhhdmluZyBvbmx5IDEgaW5kZW50XG4gICAgICAgICAgaXRlbUNvbnRlbnRzID0gbGluZS5zbGljZShpbmRlbnQpO1xuICAgICAgICAgIGluZGVudCArPSBjYXBbMV0ubGVuZ3RoO1xuICAgICAgICB9XG5cbiAgICAgICAgYmxhbmtMaW5lID0gZmFsc2U7XG5cbiAgICAgICAgaWYgKCFsaW5lICYmIC9eICokLy50ZXN0KG5leHRMaW5lKSkgeyAvLyBJdGVtcyBiZWdpbiB3aXRoIGF0IG1vc3Qgb25lIGJsYW5rIGxpbmVcbiAgICAgICAgICByYXcgKz0gbmV4dExpbmUgKyAnXFxuJztcbiAgICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKG5leHRMaW5lLmxlbmd0aCArIDEpO1xuICAgICAgICAgIGVuZEVhcmx5ID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghZW5kRWFybHkpIHtcbiAgICAgICAgICBjb25zdCBuZXh0QnVsbGV0UmVnZXggPSBuZXcgUmVnRXhwKGBeIHswLCR7TWF0aC5taW4oMywgaW5kZW50IC0gMSl9fSg/OlsqKy1dfFxcXFxkezEsOX1bLildKSgoPzpbIFxcdF1bXlxcXFxuXSopPyg/OlxcXFxufCQpKWApO1xuICAgICAgICAgIGNvbnN0IGhyUmVnZXggPSBuZXcgUmVnRXhwKGBeIHswLCR7TWF0aC5taW4oMywgaW5kZW50IC0gMSl9fSgoPzotICopezMsfXwoPzpfICopezMsfXwoPzpcXFxcKiAqKXszLH0pKD86XFxcXG4rfCQpYCk7XG4gICAgICAgICAgY29uc3QgZmVuY2VzQmVnaW5SZWdleCA9IG5ldyBSZWdFeHAoYF4gezAsJHtNYXRoLm1pbigzLCBpbmRlbnQgLSAxKX19KD86XFxgXFxgXFxgfH5+filgKTtcbiAgICAgICAgICBjb25zdCBoZWFkaW5nQmVnaW5SZWdleCA9IG5ldyBSZWdFeHAoYF4gezAsJHtNYXRoLm1pbigzLCBpbmRlbnQgLSAxKX19I2ApO1xuXG4gICAgICAgICAgLy8gQ2hlY2sgaWYgZm9sbG93aW5nIGxpbmVzIHNob3VsZCBiZSBpbmNsdWRlZCBpbiBMaXN0IEl0ZW1cbiAgICAgICAgICB3aGlsZSAoc3JjKSB7XG4gICAgICAgICAgICByYXdMaW5lID0gc3JjLnNwbGl0KCdcXG4nLCAxKVswXTtcbiAgICAgICAgICAgIG5leHRMaW5lID0gcmF3TGluZTtcblxuICAgICAgICAgICAgLy8gUmUtYWxpZ24gdG8gZm9sbG93IGNvbW1vbm1hcmsgbmVzdGluZyBydWxlc1xuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5wZWRhbnRpYykge1xuICAgICAgICAgICAgICBuZXh0TGluZSA9IG5leHRMaW5lLnJlcGxhY2UoL14gezEsNH0oPz0oIHs0fSkqW14gXSkvZywgJyAgJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEVuZCBsaXN0IGl0ZW0gaWYgZm91bmQgY29kZSBmZW5jZXNcbiAgICAgICAgICAgIGlmIChmZW5jZXNCZWdpblJlZ2V4LnRlc3QobmV4dExpbmUpKSB7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBFbmQgbGlzdCBpdGVtIGlmIGZvdW5kIHN0YXJ0IG9mIG5ldyBoZWFkaW5nXG4gICAgICAgICAgICBpZiAoaGVhZGluZ0JlZ2luUmVnZXgudGVzdChuZXh0TGluZSkpIHtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEVuZCBsaXN0IGl0ZW0gaWYgZm91bmQgc3RhcnQgb2YgbmV3IGJ1bGxldFxuICAgICAgICAgICAgaWYgKG5leHRCdWxsZXRSZWdleC50ZXN0KG5leHRMaW5lKSkge1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gSG9yaXpvbnRhbCBydWxlIGZvdW5kXG4gICAgICAgICAgICBpZiAoaHJSZWdleC50ZXN0KHNyYykpIHtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChuZXh0TGluZS5zZWFyY2goL1teIF0vKSA+PSBpbmRlbnQgfHwgIW5leHRMaW5lLnRyaW0oKSkgeyAvLyBEZWRlbnQgaWYgcG9zc2libGVcbiAgICAgICAgICAgICAgaXRlbUNvbnRlbnRzICs9ICdcXG4nICsgbmV4dExpbmUuc2xpY2UoaW5kZW50KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIG5vdCBlbm91Z2ggaW5kZW50YXRpb25cbiAgICAgICAgICAgICAgaWYgKGJsYW5rTGluZSkge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgLy8gcGFyYWdyYXBoIGNvbnRpbnVhdGlvbiB1bmxlc3MgbGFzdCBsaW5lIHdhcyBhIGRpZmZlcmVudCBibG9jayBsZXZlbCBlbGVtZW50XG4gICAgICAgICAgICAgIGlmIChsaW5lLnNlYXJjaCgvW14gXS8pID49IDQpIHsgLy8gaW5kZW50ZWQgY29kZSBibG9ja1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmIChmZW5jZXNCZWdpblJlZ2V4LnRlc3QobGluZSkpIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAoaGVhZGluZ0JlZ2luUmVnZXgudGVzdChsaW5lKSkge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmIChoclJlZ2V4LnRlc3QobGluZSkpIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGl0ZW1Db250ZW50cyArPSAnXFxuJyArIG5leHRMaW5lO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIWJsYW5rTGluZSAmJiAhbmV4dExpbmUudHJpbSgpKSB7IC8vIENoZWNrIGlmIGN1cnJlbnQgbGluZSBpcyBibGFua1xuICAgICAgICAgICAgICBibGFua0xpbmUgPSB0cnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByYXcgKz0gcmF3TGluZSArICdcXG4nO1xuICAgICAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhyYXdMaW5lLmxlbmd0aCArIDEpO1xuICAgICAgICAgICAgbGluZSA9IG5leHRMaW5lLnNsaWNlKGluZGVudCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFsaXN0Lmxvb3NlKSB7XG4gICAgICAgICAgLy8gSWYgdGhlIHByZXZpb3VzIGl0ZW0gZW5kZWQgd2l0aCBhIGJsYW5rIGxpbmUsIHRoZSBsaXN0IGlzIGxvb3NlXG4gICAgICAgICAgaWYgKGVuZHNXaXRoQmxhbmtMaW5lKSB7XG4gICAgICAgICAgICBsaXN0Lmxvb3NlID0gdHJ1ZTtcbiAgICAgICAgICB9IGVsc2UgaWYgKC9cXG4gKlxcbiAqJC8udGVzdChyYXcpKSB7XG4gICAgICAgICAgICBlbmRzV2l0aEJsYW5rTGluZSA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2hlY2sgZm9yIHRhc2sgbGlzdCBpdGVtc1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmdmbSkge1xuICAgICAgICAgIGlzdGFzayA9IC9eXFxbWyB4WF1cXF0gLy5leGVjKGl0ZW1Db250ZW50cyk7XG4gICAgICAgICAgaWYgKGlzdGFzaykge1xuICAgICAgICAgICAgaXNjaGVja2VkID0gaXN0YXNrWzBdICE9PSAnWyBdICc7XG4gICAgICAgICAgICBpdGVtQ29udGVudHMgPSBpdGVtQ29udGVudHMucmVwbGFjZSgvXlxcW1sgeFhdXFxdICsvLCAnJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgbGlzdC5pdGVtcy5wdXNoKHtcbiAgICAgICAgICB0eXBlOiAnbGlzdF9pdGVtJyxcbiAgICAgICAgICByYXcsXG4gICAgICAgICAgdGFzazogISFpc3Rhc2ssXG4gICAgICAgICAgY2hlY2tlZDogaXNjaGVja2VkLFxuICAgICAgICAgIGxvb3NlOiBmYWxzZSxcbiAgICAgICAgICB0ZXh0OiBpdGVtQ29udGVudHNcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbGlzdC5yYXcgKz0gcmF3O1xuICAgICAgfVxuXG4gICAgICAvLyBEbyBub3QgY29uc3VtZSBuZXdsaW5lcyBhdCBlbmQgb2YgZmluYWwgaXRlbS4gQWx0ZXJuYXRpdmVseSwgbWFrZSBpdGVtUmVnZXggKnN0YXJ0KiB3aXRoIGFueSBuZXdsaW5lcyB0byBzaW1wbGlmeS9zcGVlZCB1cCBlbmRzV2l0aEJsYW5rTGluZSBsb2dpY1xuICAgICAgbGlzdC5pdGVtc1tsaXN0Lml0ZW1zLmxlbmd0aCAtIDFdLnJhdyA9IHJhdy50cmltUmlnaHQoKTtcbiAgICAgIGxpc3QuaXRlbXNbbGlzdC5pdGVtcy5sZW5ndGggLSAxXS50ZXh0ID0gaXRlbUNvbnRlbnRzLnRyaW1SaWdodCgpO1xuICAgICAgbGlzdC5yYXcgPSBsaXN0LnJhdy50cmltUmlnaHQoKTtcblxuICAgICAgY29uc3QgbCA9IGxpc3QuaXRlbXMubGVuZ3RoO1xuXG4gICAgICAvLyBJdGVtIGNoaWxkIHRva2VucyBoYW5kbGVkIGhlcmUgYXQgZW5kIGJlY2F1c2Ugd2UgbmVlZGVkIHRvIGhhdmUgdGhlIGZpbmFsIGl0ZW0gdG8gdHJpbSBpdCBmaXJzdFxuICAgICAgZm9yIChpID0gMDsgaSA8IGw7IGkrKykge1xuICAgICAgICB0aGlzLmxleGVyLnN0YXRlLnRvcCA9IGZhbHNlO1xuICAgICAgICBsaXN0Lml0ZW1zW2ldLnRva2VucyA9IHRoaXMubGV4ZXIuYmxvY2tUb2tlbnMobGlzdC5pdGVtc1tpXS50ZXh0LCBbXSk7XG5cbiAgICAgICAgaWYgKCFsaXN0Lmxvb3NlKSB7XG4gICAgICAgICAgLy8gQ2hlY2sgaWYgbGlzdCBzaG91bGQgYmUgbG9vc2VcbiAgICAgICAgICBjb25zdCBzcGFjZXJzID0gbGlzdC5pdGVtc1tpXS50b2tlbnMuZmlsdGVyKHQgPT4gdC50eXBlID09PSAnc3BhY2UnKTtcbiAgICAgICAgICBjb25zdCBoYXNNdWx0aXBsZUxpbmVCcmVha3MgPSBzcGFjZXJzLmxlbmd0aCA+IDAgJiYgc3BhY2Vycy5zb21lKHQgPT4gL1xcbi4qXFxuLy50ZXN0KHQucmF3KSk7XG5cbiAgICAgICAgICBsaXN0Lmxvb3NlID0gaGFzTXVsdGlwbGVMaW5lQnJlYWtzO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFNldCBhbGwgaXRlbXMgdG8gbG9vc2UgaWYgbGlzdCBpcyBsb29zZVxuICAgICAgaWYgKGxpc3QubG9vc2UpIHtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgIGxpc3QuaXRlbXNbaV0ubG9vc2UgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBsaXN0O1xuICAgIH1cbiAgfVxuXG4gIGh0bWwoc3JjKSB7XG4gICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5ibG9jay5odG1sLmV4ZWMoc3JjKTtcbiAgICBpZiAoY2FwKSB7XG4gICAgICBjb25zdCB0b2tlbiA9IHtcbiAgICAgICAgdHlwZTogJ2h0bWwnLFxuICAgICAgICByYXc6IGNhcFswXSxcbiAgICAgICAgcHJlOiAhdGhpcy5vcHRpb25zLnNhbml0aXplclxuICAgICAgICAgICYmIChjYXBbMV0gPT09ICdwcmUnIHx8IGNhcFsxXSA9PT0gJ3NjcmlwdCcgfHwgY2FwWzFdID09PSAnc3R5bGUnKSxcbiAgICAgICAgdGV4dDogY2FwWzBdXG4gICAgICB9O1xuICAgICAgaWYgKHRoaXMub3B0aW9ucy5zYW5pdGl6ZSkge1xuICAgICAgICBjb25zdCB0ZXh0ID0gdGhpcy5vcHRpb25zLnNhbml0aXplciA/IHRoaXMub3B0aW9ucy5zYW5pdGl6ZXIoY2FwWzBdKSA6IGVzY2FwZShjYXBbMF0pO1xuICAgICAgICB0b2tlbi50eXBlID0gJ3BhcmFncmFwaCc7XG4gICAgICAgIHRva2VuLnRleHQgPSB0ZXh0O1xuICAgICAgICB0b2tlbi50b2tlbnMgPSB0aGlzLmxleGVyLmlubGluZSh0ZXh0KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0b2tlbjtcbiAgICB9XG4gIH1cblxuICBkZWYoc3JjKSB7XG4gICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5ibG9jay5kZWYuZXhlYyhzcmMpO1xuICAgIGlmIChjYXApIHtcbiAgICAgIGNvbnN0IHRhZyA9IGNhcFsxXS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL1xccysvZywgJyAnKTtcbiAgICAgIGNvbnN0IGhyZWYgPSBjYXBbMl0gPyBjYXBbMl0ucmVwbGFjZSgvXjwoLiopPiQvLCAnJDEnKS5yZXBsYWNlKHRoaXMucnVsZXMuaW5saW5lLl9lc2NhcGVzLCAnJDEnKSA6ICcnO1xuICAgICAgY29uc3QgdGl0bGUgPSBjYXBbM10gPyBjYXBbM10uc3Vic3RyaW5nKDEsIGNhcFszXS5sZW5ndGggLSAxKS5yZXBsYWNlKHRoaXMucnVsZXMuaW5saW5lLl9lc2NhcGVzLCAnJDEnKSA6IGNhcFszXTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdkZWYnLFxuICAgICAgICB0YWcsXG4gICAgICAgIHJhdzogY2FwWzBdLFxuICAgICAgICBocmVmLFxuICAgICAgICB0aXRsZVxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICB0YWJsZShzcmMpIHtcbiAgICBjb25zdCBjYXAgPSB0aGlzLnJ1bGVzLmJsb2NrLnRhYmxlLmV4ZWMoc3JjKTtcbiAgICBpZiAoY2FwKSB7XG4gICAgICBjb25zdCBpdGVtID0ge1xuICAgICAgICB0eXBlOiAndGFibGUnLFxuICAgICAgICBoZWFkZXI6IHNwbGl0Q2VsbHMoY2FwWzFdKS5tYXAoYyA9PiB7IHJldHVybiB7IHRleHQ6IGMgfTsgfSksXG4gICAgICAgIGFsaWduOiBjYXBbMl0ucmVwbGFjZSgvXiAqfFxcfCAqJC9nLCAnJykuc3BsaXQoLyAqXFx8ICovKSxcbiAgICAgICAgcm93czogY2FwWzNdICYmIGNhcFszXS50cmltKCkgPyBjYXBbM10ucmVwbGFjZSgvXFxuWyBcXHRdKiQvLCAnJykuc3BsaXQoJ1xcbicpIDogW11cbiAgICAgIH07XG5cbiAgICAgIGlmIChpdGVtLmhlYWRlci5sZW5ndGggPT09IGl0ZW0uYWxpZ24ubGVuZ3RoKSB7XG4gICAgICAgIGl0ZW0ucmF3ID0gY2FwWzBdO1xuXG4gICAgICAgIGxldCBsID0gaXRlbS5hbGlnbi5sZW5ndGg7XG4gICAgICAgIGxldCBpLCBqLCBrLCByb3c7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICBpZiAoL14gKi0rOiAqJC8udGVzdChpdGVtLmFsaWduW2ldKSkge1xuICAgICAgICAgICAgaXRlbS5hbGlnbltpXSA9ICdyaWdodCc7XG4gICAgICAgICAgfSBlbHNlIGlmICgvXiAqOi0rOiAqJC8udGVzdChpdGVtLmFsaWduW2ldKSkge1xuICAgICAgICAgICAgaXRlbS5hbGlnbltpXSA9ICdjZW50ZXInO1xuICAgICAgICAgIH0gZWxzZSBpZiAoL14gKjotKyAqJC8udGVzdChpdGVtLmFsaWduW2ldKSkge1xuICAgICAgICAgICAgaXRlbS5hbGlnbltpXSA9ICdsZWZ0JztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaXRlbS5hbGlnbltpXSA9IG51bGw7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgbCA9IGl0ZW0ucm93cy5sZW5ndGg7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICBpdGVtLnJvd3NbaV0gPSBzcGxpdENlbGxzKGl0ZW0ucm93c1tpXSwgaXRlbS5oZWFkZXIubGVuZ3RoKS5tYXAoYyA9PiB7IHJldHVybiB7IHRleHQ6IGMgfTsgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBwYXJzZSBjaGlsZCB0b2tlbnMgaW5zaWRlIGhlYWRlcnMgYW5kIGNlbGxzXG5cbiAgICAgICAgLy8gaGVhZGVyIGNoaWxkIHRva2Vuc1xuICAgICAgICBsID0gaXRlbS5oZWFkZXIubGVuZ3RoO1xuICAgICAgICBmb3IgKGogPSAwOyBqIDwgbDsgaisrKSB7XG4gICAgICAgICAgaXRlbS5oZWFkZXJbal0udG9rZW5zID0gdGhpcy5sZXhlci5pbmxpbmUoaXRlbS5oZWFkZXJbal0udGV4dCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBjZWxsIGNoaWxkIHRva2Vuc1xuICAgICAgICBsID0gaXRlbS5yb3dzLmxlbmd0aDtcbiAgICAgICAgZm9yIChqID0gMDsgaiA8IGw7IGorKykge1xuICAgICAgICAgIHJvdyA9IGl0ZW0ucm93c1tqXTtcbiAgICAgICAgICBmb3IgKGsgPSAwOyBrIDwgcm93Lmxlbmd0aDsgaysrKSB7XG4gICAgICAgICAgICByb3dba10udG9rZW5zID0gdGhpcy5sZXhlci5pbmxpbmUocm93W2tdLnRleHQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBpdGVtO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGxoZWFkaW5nKHNyYykge1xuICAgIGNvbnN0IGNhcCA9IHRoaXMucnVsZXMuYmxvY2subGhlYWRpbmcuZXhlYyhzcmMpO1xuICAgIGlmIChjYXApIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdoZWFkaW5nJyxcbiAgICAgICAgcmF3OiBjYXBbMF0sXG4gICAgICAgIGRlcHRoOiBjYXBbMl0uY2hhckF0KDApID09PSAnPScgPyAxIDogMixcbiAgICAgICAgdGV4dDogY2FwWzFdLFxuICAgICAgICB0b2tlbnM6IHRoaXMubGV4ZXIuaW5saW5lKGNhcFsxXSlcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgcGFyYWdyYXBoKHNyYykge1xuICAgIGNvbnN0IGNhcCA9IHRoaXMucnVsZXMuYmxvY2sucGFyYWdyYXBoLmV4ZWMoc3JjKTtcbiAgICBpZiAoY2FwKSB7XG4gICAgICBjb25zdCB0ZXh0ID0gY2FwWzFdLmNoYXJBdChjYXBbMV0ubGVuZ3RoIC0gMSkgPT09ICdcXG4nXG4gICAgICAgID8gY2FwWzFdLnNsaWNlKDAsIC0xKVxuICAgICAgICA6IGNhcFsxXTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdwYXJhZ3JhcGgnLFxuICAgICAgICByYXc6IGNhcFswXSxcbiAgICAgICAgdGV4dCxcbiAgICAgICAgdG9rZW5zOiB0aGlzLmxleGVyLmlubGluZSh0ZXh0KVxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICB0ZXh0KHNyYykge1xuICAgIGNvbnN0IGNhcCA9IHRoaXMucnVsZXMuYmxvY2sudGV4dC5leGVjKHNyYyk7XG4gICAgaWYgKGNhcCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ3RleHQnLFxuICAgICAgICByYXc6IGNhcFswXSxcbiAgICAgICAgdGV4dDogY2FwWzBdLFxuICAgICAgICB0b2tlbnM6IHRoaXMubGV4ZXIuaW5saW5lKGNhcFswXSlcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgZXNjYXBlKHNyYykge1xuICAgIGNvbnN0IGNhcCA9IHRoaXMucnVsZXMuaW5saW5lLmVzY2FwZS5leGVjKHNyYyk7XG4gICAgaWYgKGNhcCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ2VzY2FwZScsXG4gICAgICAgIHJhdzogY2FwWzBdLFxuICAgICAgICB0ZXh0OiBlc2NhcGUoY2FwWzFdKVxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICB0YWcoc3JjKSB7XG4gICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5pbmxpbmUudGFnLmV4ZWMoc3JjKTtcbiAgICBpZiAoY2FwKSB7XG4gICAgICBpZiAoIXRoaXMubGV4ZXIuc3RhdGUuaW5MaW5rICYmIC9ePGEgL2kudGVzdChjYXBbMF0pKSB7XG4gICAgICAgIHRoaXMubGV4ZXIuc3RhdGUuaW5MaW5rID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5sZXhlci5zdGF0ZS5pbkxpbmsgJiYgL148XFwvYT4vaS50ZXN0KGNhcFswXSkpIHtcbiAgICAgICAgdGhpcy5sZXhlci5zdGF0ZS5pbkxpbmsgPSBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGlmICghdGhpcy5sZXhlci5zdGF0ZS5pblJhd0Jsb2NrICYmIC9ePChwcmV8Y29kZXxrYmR8c2NyaXB0KShcXHN8PikvaS50ZXN0KGNhcFswXSkpIHtcbiAgICAgICAgdGhpcy5sZXhlci5zdGF0ZS5pblJhd0Jsb2NrID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5sZXhlci5zdGF0ZS5pblJhd0Jsb2NrICYmIC9ePFxcLyhwcmV8Y29kZXxrYmR8c2NyaXB0KShcXHN8PikvaS50ZXN0KGNhcFswXSkpIHtcbiAgICAgICAgdGhpcy5sZXhlci5zdGF0ZS5pblJhd0Jsb2NrID0gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6IHRoaXMub3B0aW9ucy5zYW5pdGl6ZVxuICAgICAgICAgID8gJ3RleHQnXG4gICAgICAgICAgOiAnaHRtbCcsXG4gICAgICAgIHJhdzogY2FwWzBdLFxuICAgICAgICBpbkxpbms6IHRoaXMubGV4ZXIuc3RhdGUuaW5MaW5rLFxuICAgICAgICBpblJhd0Jsb2NrOiB0aGlzLmxleGVyLnN0YXRlLmluUmF3QmxvY2ssXG4gICAgICAgIHRleHQ6IHRoaXMub3B0aW9ucy5zYW5pdGl6ZVxuICAgICAgICAgID8gKHRoaXMub3B0aW9ucy5zYW5pdGl6ZXJcbiAgICAgICAgICAgID8gdGhpcy5vcHRpb25zLnNhbml0aXplcihjYXBbMF0pXG4gICAgICAgICAgICA6IGVzY2FwZShjYXBbMF0pKVxuICAgICAgICAgIDogY2FwWzBdXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIGxpbmsoc3JjKSB7XG4gICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5pbmxpbmUubGluay5leGVjKHNyYyk7XG4gICAgaWYgKGNhcCkge1xuICAgICAgY29uc3QgdHJpbW1lZFVybCA9IGNhcFsyXS50cmltKCk7XG4gICAgICBpZiAoIXRoaXMub3B0aW9ucy5wZWRhbnRpYyAmJiAvXjwvLnRlc3QodHJpbW1lZFVybCkpIHtcbiAgICAgICAgLy8gY29tbW9ubWFyayByZXF1aXJlcyBtYXRjaGluZyBhbmdsZSBicmFja2V0c1xuICAgICAgICBpZiAoISgvPiQvLnRlc3QodHJpbW1lZFVybCkpKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZW5kaW5nIGFuZ2xlIGJyYWNrZXQgY2Fubm90IGJlIGVzY2FwZWRcbiAgICAgICAgY29uc3QgcnRyaW1TbGFzaCA9IHJ0cmltKHRyaW1tZWRVcmwuc2xpY2UoMCwgLTEpLCAnXFxcXCcpO1xuICAgICAgICBpZiAoKHRyaW1tZWRVcmwubGVuZ3RoIC0gcnRyaW1TbGFzaC5sZW5ndGgpICUgMiA9PT0gMCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gZmluZCBjbG9zaW5nIHBhcmVudGhlc2lzXG4gICAgICAgIGNvbnN0IGxhc3RQYXJlbkluZGV4ID0gZmluZENsb3NpbmdCcmFja2V0KGNhcFsyXSwgJygpJyk7XG4gICAgICAgIGlmIChsYXN0UGFyZW5JbmRleCA+IC0xKSB7XG4gICAgICAgICAgY29uc3Qgc3RhcnQgPSBjYXBbMF0uaW5kZXhPZignIScpID09PSAwID8gNSA6IDQ7XG4gICAgICAgICAgY29uc3QgbGlua0xlbiA9IHN0YXJ0ICsgY2FwWzFdLmxlbmd0aCArIGxhc3RQYXJlbkluZGV4O1xuICAgICAgICAgIGNhcFsyXSA9IGNhcFsyXS5zdWJzdHJpbmcoMCwgbGFzdFBhcmVuSW5kZXgpO1xuICAgICAgICAgIGNhcFswXSA9IGNhcFswXS5zdWJzdHJpbmcoMCwgbGlua0xlbikudHJpbSgpO1xuICAgICAgICAgIGNhcFszXSA9ICcnO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBsZXQgaHJlZiA9IGNhcFsyXTtcbiAgICAgIGxldCB0aXRsZSA9ICcnO1xuICAgICAgaWYgKHRoaXMub3B0aW9ucy5wZWRhbnRpYykge1xuICAgICAgICAvLyBzcGxpdCBwZWRhbnRpYyBocmVmIGFuZCB0aXRsZVxuICAgICAgICBjb25zdCBsaW5rID0gL14oW14nXCJdKlteXFxzXSlcXHMrKFsnXCJdKSguKilcXDIvLmV4ZWMoaHJlZik7XG5cbiAgICAgICAgaWYgKGxpbmspIHtcbiAgICAgICAgICBocmVmID0gbGlua1sxXTtcbiAgICAgICAgICB0aXRsZSA9IGxpbmtbM107XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRpdGxlID0gY2FwWzNdID8gY2FwWzNdLnNsaWNlKDEsIC0xKSA6ICcnO1xuICAgICAgfVxuXG4gICAgICBocmVmID0gaHJlZi50cmltKCk7XG4gICAgICBpZiAoL148Ly50ZXN0KGhyZWYpKSB7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMucGVkYW50aWMgJiYgISgvPiQvLnRlc3QodHJpbW1lZFVybCkpKSB7XG4gICAgICAgICAgLy8gcGVkYW50aWMgYWxsb3dzIHN0YXJ0aW5nIGFuZ2xlIGJyYWNrZXQgd2l0aG91dCBlbmRpbmcgYW5nbGUgYnJhY2tldFxuICAgICAgICAgIGhyZWYgPSBocmVmLnNsaWNlKDEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGhyZWYgPSBocmVmLnNsaWNlKDEsIC0xKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIG91dHB1dExpbmsoY2FwLCB7XG4gICAgICAgIGhyZWY6IGhyZWYgPyBocmVmLnJlcGxhY2UodGhpcy5ydWxlcy5pbmxpbmUuX2VzY2FwZXMsICckMScpIDogaHJlZixcbiAgICAgICAgdGl0bGU6IHRpdGxlID8gdGl0bGUucmVwbGFjZSh0aGlzLnJ1bGVzLmlubGluZS5fZXNjYXBlcywgJyQxJykgOiB0aXRsZVxuICAgICAgfSwgY2FwWzBdLCB0aGlzLmxleGVyKTtcbiAgICB9XG4gIH1cblxuICByZWZsaW5rKHNyYywgbGlua3MpIHtcbiAgICBsZXQgY2FwO1xuICAgIGlmICgoY2FwID0gdGhpcy5ydWxlcy5pbmxpbmUucmVmbGluay5leGVjKHNyYykpXG4gICAgICAgIHx8IChjYXAgPSB0aGlzLnJ1bGVzLmlubGluZS5ub2xpbmsuZXhlYyhzcmMpKSkge1xuICAgICAgbGV0IGxpbmsgPSAoY2FwWzJdIHx8IGNhcFsxXSkucmVwbGFjZSgvXFxzKy9nLCAnICcpO1xuICAgICAgbGluayA9IGxpbmtzW2xpbmsudG9Mb3dlckNhc2UoKV07XG4gICAgICBpZiAoIWxpbmspIHtcbiAgICAgICAgY29uc3QgdGV4dCA9IGNhcFswXS5jaGFyQXQoMCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgdHlwZTogJ3RleHQnLFxuICAgICAgICAgIHJhdzogdGV4dCxcbiAgICAgICAgICB0ZXh0XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICByZXR1cm4gb3V0cHV0TGluayhjYXAsIGxpbmssIGNhcFswXSwgdGhpcy5sZXhlcik7XG4gICAgfVxuICB9XG5cbiAgZW1TdHJvbmcoc3JjLCBtYXNrZWRTcmMsIHByZXZDaGFyID0gJycpIHtcbiAgICBsZXQgbWF0Y2ggPSB0aGlzLnJ1bGVzLmlubGluZS5lbVN0cm9uZy5sRGVsaW0uZXhlYyhzcmMpO1xuICAgIGlmICghbWF0Y2gpIHJldHVybjtcblxuICAgIC8vIF8gY2FuJ3QgYmUgYmV0d2VlbiB0d28gYWxwaGFudW1lcmljcy4gXFxwe0x9XFxwe059IGluY2x1ZGVzIG5vbi1lbmdsaXNoIGFscGhhYmV0L251bWJlcnMgYXMgd2VsbFxuICAgIGlmIChtYXRjaFszXSAmJiBwcmV2Q2hhci5tYXRjaCgvW1xccHtMfVxccHtOfV0vdSkpIHJldHVybjtcblxuICAgIGNvbnN0IG5leHRDaGFyID0gbWF0Y2hbMV0gfHwgbWF0Y2hbMl0gfHwgJyc7XG5cbiAgICBpZiAoIW5leHRDaGFyIHx8IChuZXh0Q2hhciAmJiAocHJldkNoYXIgPT09ICcnIHx8IHRoaXMucnVsZXMuaW5saW5lLnB1bmN0dWF0aW9uLmV4ZWMocHJldkNoYXIpKSkpIHtcbiAgICAgIGNvbnN0IGxMZW5ndGggPSBtYXRjaFswXS5sZW5ndGggLSAxO1xuICAgICAgbGV0IHJEZWxpbSwgckxlbmd0aCwgZGVsaW1Ub3RhbCA9IGxMZW5ndGgsIG1pZERlbGltVG90YWwgPSAwO1xuXG4gICAgICBjb25zdCBlbmRSZWcgPSBtYXRjaFswXVswXSA9PT0gJyonID8gdGhpcy5ydWxlcy5pbmxpbmUuZW1TdHJvbmcuckRlbGltQXN0IDogdGhpcy5ydWxlcy5pbmxpbmUuZW1TdHJvbmcuckRlbGltVW5kO1xuICAgICAgZW5kUmVnLmxhc3RJbmRleCA9IDA7XG5cbiAgICAgIC8vIENsaXAgbWFza2VkU3JjIHRvIHNhbWUgc2VjdGlvbiBvZiBzdHJpbmcgYXMgc3JjIChtb3ZlIHRvIGxleGVyPylcbiAgICAgIG1hc2tlZFNyYyA9IG1hc2tlZFNyYy5zbGljZSgtMSAqIHNyYy5sZW5ndGggKyBsTGVuZ3RoKTtcblxuICAgICAgd2hpbGUgKChtYXRjaCA9IGVuZFJlZy5leGVjKG1hc2tlZFNyYykpICE9IG51bGwpIHtcbiAgICAgICAgckRlbGltID0gbWF0Y2hbMV0gfHwgbWF0Y2hbMl0gfHwgbWF0Y2hbM10gfHwgbWF0Y2hbNF0gfHwgbWF0Y2hbNV0gfHwgbWF0Y2hbNl07XG5cbiAgICAgICAgaWYgKCFyRGVsaW0pIGNvbnRpbnVlOyAvLyBza2lwIHNpbmdsZSAqIGluIF9fYWJjKmFiY19fXG5cbiAgICAgICAgckxlbmd0aCA9IHJEZWxpbS5sZW5ndGg7XG5cbiAgICAgICAgaWYgKG1hdGNoWzNdIHx8IG1hdGNoWzRdKSB7IC8vIGZvdW5kIGFub3RoZXIgTGVmdCBEZWxpbVxuICAgICAgICAgIGRlbGltVG90YWwgKz0gckxlbmd0aDtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfSBlbHNlIGlmIChtYXRjaFs1XSB8fCBtYXRjaFs2XSkgeyAvLyBlaXRoZXIgTGVmdCBvciBSaWdodCBEZWxpbVxuICAgICAgICAgIGlmIChsTGVuZ3RoICUgMyAmJiAhKChsTGVuZ3RoICsgckxlbmd0aCkgJSAzKSkge1xuICAgICAgICAgICAgbWlkRGVsaW1Ub3RhbCArPSByTGVuZ3RoO1xuICAgICAgICAgICAgY29udGludWU7IC8vIENvbW1vbk1hcmsgRW1waGFzaXMgUnVsZXMgOS0xMFxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGRlbGltVG90YWwgLT0gckxlbmd0aDtcblxuICAgICAgICBpZiAoZGVsaW1Ub3RhbCA+IDApIGNvbnRpbnVlOyAvLyBIYXZlbid0IGZvdW5kIGVub3VnaCBjbG9zaW5nIGRlbGltaXRlcnNcblxuICAgICAgICAvLyBSZW1vdmUgZXh0cmEgY2hhcmFjdGVycy4gKmEqKiogLT4gKmEqXG4gICAgICAgIHJMZW5ndGggPSBNYXRoLm1pbihyTGVuZ3RoLCByTGVuZ3RoICsgZGVsaW1Ub3RhbCArIG1pZERlbGltVG90YWwpO1xuXG4gICAgICAgIGNvbnN0IHJhdyA9IHNyYy5zbGljZSgwLCBsTGVuZ3RoICsgbWF0Y2guaW5kZXggKyAobWF0Y2hbMF0ubGVuZ3RoIC0gckRlbGltLmxlbmd0aCkgKyByTGVuZ3RoKTtcblxuICAgICAgICAvLyBDcmVhdGUgYGVtYCBpZiBzbWFsbGVzdCBkZWxpbWl0ZXIgaGFzIG9kZCBjaGFyIGNvdW50LiAqYSoqKlxuICAgICAgICBpZiAoTWF0aC5taW4obExlbmd0aCwgckxlbmd0aCkgJSAyKSB7XG4gICAgICAgICAgY29uc3QgdGV4dCA9IHJhdy5zbGljZSgxLCAtMSk7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHR5cGU6ICdlbScsXG4gICAgICAgICAgICByYXcsXG4gICAgICAgICAgICB0ZXh0LFxuICAgICAgICAgICAgdG9rZW5zOiB0aGlzLmxleGVyLmlubGluZVRva2Vucyh0ZXh0KVxuICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDcmVhdGUgJ3N0cm9uZycgaWYgc21hbGxlc3QgZGVsaW1pdGVyIGhhcyBldmVuIGNoYXIgY291bnQuICoqYSoqKlxuICAgICAgICBjb25zdCB0ZXh0ID0gcmF3LnNsaWNlKDIsIC0yKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB0eXBlOiAnc3Ryb25nJyxcbiAgICAgICAgICByYXcsXG4gICAgICAgICAgdGV4dCxcbiAgICAgICAgICB0b2tlbnM6IHRoaXMubGV4ZXIuaW5saW5lVG9rZW5zKHRleHQpXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgY29kZXNwYW4oc3JjKSB7XG4gICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5pbmxpbmUuY29kZS5leGVjKHNyYyk7XG4gICAgaWYgKGNhcCkge1xuICAgICAgbGV0IHRleHQgPSBjYXBbMl0ucmVwbGFjZSgvXFxuL2csICcgJyk7XG4gICAgICBjb25zdCBoYXNOb25TcGFjZUNoYXJzID0gL1teIF0vLnRlc3QodGV4dCk7XG4gICAgICBjb25zdCBoYXNTcGFjZUNoYXJzT25Cb3RoRW5kcyA9IC9eIC8udGVzdCh0ZXh0KSAmJiAvICQvLnRlc3QodGV4dCk7XG4gICAgICBpZiAoaGFzTm9uU3BhY2VDaGFycyAmJiBoYXNTcGFjZUNoYXJzT25Cb3RoRW5kcykge1xuICAgICAgICB0ZXh0ID0gdGV4dC5zdWJzdHJpbmcoMSwgdGV4dC5sZW5ndGggLSAxKTtcbiAgICAgIH1cbiAgICAgIHRleHQgPSBlc2NhcGUodGV4dCwgdHJ1ZSk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAnY29kZXNwYW4nLFxuICAgICAgICByYXc6IGNhcFswXSxcbiAgICAgICAgdGV4dFxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICBicihzcmMpIHtcbiAgICBjb25zdCBjYXAgPSB0aGlzLnJ1bGVzLmlubGluZS5ici5leGVjKHNyYyk7XG4gICAgaWYgKGNhcCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ2JyJyxcbiAgICAgICAgcmF3OiBjYXBbMF1cbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgZGVsKHNyYykge1xuICAgIGNvbnN0IGNhcCA9IHRoaXMucnVsZXMuaW5saW5lLmRlbC5leGVjKHNyYyk7XG4gICAgaWYgKGNhcCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ2RlbCcsXG4gICAgICAgIHJhdzogY2FwWzBdLFxuICAgICAgICB0ZXh0OiBjYXBbMl0sXG4gICAgICAgIHRva2VuczogdGhpcy5sZXhlci5pbmxpbmVUb2tlbnMoY2FwWzJdKVxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICBhdXRvbGluayhzcmMsIG1hbmdsZSkge1xuICAgIGNvbnN0IGNhcCA9IHRoaXMucnVsZXMuaW5saW5lLmF1dG9saW5rLmV4ZWMoc3JjKTtcbiAgICBpZiAoY2FwKSB7XG4gICAgICBsZXQgdGV4dCwgaHJlZjtcbiAgICAgIGlmIChjYXBbMl0gPT09ICdAJykge1xuICAgICAgICB0ZXh0ID0gZXNjYXBlKHRoaXMub3B0aW9ucy5tYW5nbGUgPyBtYW5nbGUoY2FwWzFdKSA6IGNhcFsxXSk7XG4gICAgICAgIGhyZWYgPSAnbWFpbHRvOicgKyB0ZXh0O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGV4dCA9IGVzY2FwZShjYXBbMV0pO1xuICAgICAgICBocmVmID0gdGV4dDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ2xpbmsnLFxuICAgICAgICByYXc6IGNhcFswXSxcbiAgICAgICAgdGV4dCxcbiAgICAgICAgaHJlZixcbiAgICAgICAgdG9rZW5zOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgdHlwZTogJ3RleHQnLFxuICAgICAgICAgICAgcmF3OiB0ZXh0LFxuICAgICAgICAgICAgdGV4dFxuICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICB1cmwoc3JjLCBtYW5nbGUpIHtcbiAgICBsZXQgY2FwO1xuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmlubGluZS51cmwuZXhlYyhzcmMpKSB7XG4gICAgICBsZXQgdGV4dCwgaHJlZjtcbiAgICAgIGlmIChjYXBbMl0gPT09ICdAJykge1xuICAgICAgICB0ZXh0ID0gZXNjYXBlKHRoaXMub3B0aW9ucy5tYW5nbGUgPyBtYW5nbGUoY2FwWzBdKSA6IGNhcFswXSk7XG4gICAgICAgIGhyZWYgPSAnbWFpbHRvOicgKyB0ZXh0O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gZG8gZXh0ZW5kZWQgYXV0b2xpbmsgcGF0aCB2YWxpZGF0aW9uXG4gICAgICAgIGxldCBwcmV2Q2FwWmVybztcbiAgICAgICAgZG8ge1xuICAgICAgICAgIHByZXZDYXBaZXJvID0gY2FwWzBdO1xuICAgICAgICAgIGNhcFswXSA9IHRoaXMucnVsZXMuaW5saW5lLl9iYWNrcGVkYWwuZXhlYyhjYXBbMF0pWzBdO1xuICAgICAgICB9IHdoaWxlIChwcmV2Q2FwWmVybyAhPT0gY2FwWzBdKTtcbiAgICAgICAgdGV4dCA9IGVzY2FwZShjYXBbMF0pO1xuICAgICAgICBpZiAoY2FwWzFdID09PSAnd3d3LicpIHtcbiAgICAgICAgICBocmVmID0gJ2h0dHA6Ly8nICsgY2FwWzBdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGhyZWYgPSBjYXBbMF07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdsaW5rJyxcbiAgICAgICAgcmF3OiBjYXBbMF0sXG4gICAgICAgIHRleHQsXG4gICAgICAgIGhyZWYsXG4gICAgICAgIHRva2VuczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgICAgICAgIHJhdzogdGV4dCxcbiAgICAgICAgICAgIHRleHRcbiAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgaW5saW5lVGV4dChzcmMsIHNtYXJ0eXBhbnRzKSB7XG4gICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5pbmxpbmUudGV4dC5leGVjKHNyYyk7XG4gICAgaWYgKGNhcCkge1xuICAgICAgbGV0IHRleHQ7XG4gICAgICBpZiAodGhpcy5sZXhlci5zdGF0ZS5pblJhd0Jsb2NrKSB7XG4gICAgICAgIHRleHQgPSB0aGlzLm9wdGlvbnMuc2FuaXRpemUgPyAodGhpcy5vcHRpb25zLnNhbml0aXplciA/IHRoaXMub3B0aW9ucy5zYW5pdGl6ZXIoY2FwWzBdKSA6IGVzY2FwZShjYXBbMF0pKSA6IGNhcFswXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRleHQgPSBlc2NhcGUodGhpcy5vcHRpb25zLnNtYXJ0eXBhbnRzID8gc21hcnR5cGFudHMoY2FwWzBdKSA6IGNhcFswXSk7XG4gICAgICB9XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAndGV4dCcsXG4gICAgICAgIHJhdzogY2FwWzBdLFxuICAgICAgICB0ZXh0XG4gICAgICB9O1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEJsb2NrLUxldmVsIEdyYW1tYXJcbiAqL1xuY29uc3QgYmxvY2sgPSB7XG4gIG5ld2xpbmU6IC9eKD86ICooPzpcXG58JCkpKy8sXG4gIGNvZGU6IC9eKCB7NH1bXlxcbl0rKD86XFxuKD86ICooPzpcXG58JCkpKik/KSsvLFxuICBmZW5jZXM6IC9eIHswLDN9KGB7Myx9KD89W15gXFxuXSooPzpcXG58JCkpfH57Myx9KShbXlxcbl0qKSg/OlxcbnwkKSg/OnwoW1xcc1xcU10qPykoPzpcXG58JCkpKD86IHswLDN9XFwxW35gXSogKig/PVxcbnwkKXwkKS8sXG4gIGhyOiAvXiB7MCwzfSgoPzotW1xcdCBdKil7Myx9fCg/Ol9bIFxcdF0qKXszLH18KD86XFwqWyBcXHRdKil7Myx9KSg/Olxcbit8JCkvLFxuICBoZWFkaW5nOiAvXiB7MCwzfSgjezEsNn0pKD89XFxzfCQpKC4qKSg/Olxcbit8JCkvLFxuICBibG9ja3F1b3RlOiAvXiggezAsM30+ID8ocGFyYWdyYXBofFteXFxuXSopKD86XFxufCQpKSsvLFxuICBsaXN0OiAvXiggezAsM31idWxsKShbIFxcdF1bXlxcbl0rPyk/KD86XFxufCQpLyxcbiAgaHRtbDogJ14gezAsM30oPzonIC8vIG9wdGlvbmFsIGluZGVudGF0aW9uXG4gICAgKyAnPChzY3JpcHR8cHJlfHN0eWxlfHRleHRhcmVhKVtcXFxccz5dW1xcXFxzXFxcXFNdKj8oPzo8L1xcXFwxPlteXFxcXG5dKlxcXFxuK3wkKScgLy8gKDEpXG4gICAgKyAnfGNvbW1lbnRbXlxcXFxuXSooXFxcXG4rfCQpJyAvLyAoMilcbiAgICArICd8PFxcXFw/W1xcXFxzXFxcXFNdKj8oPzpcXFxcPz5cXFxcbip8JCknIC8vICgzKVxuICAgICsgJ3w8IVtBLVpdW1xcXFxzXFxcXFNdKj8oPzo+XFxcXG4qfCQpJyAvLyAoNClcbiAgICArICd8PCFcXFxcW0NEQVRBXFxcXFtbXFxcXHNcXFxcU10qPyg/OlxcXFxdXFxcXF0+XFxcXG4qfCQpJyAvLyAoNSlcbiAgICArICd8PC8/KHRhZykoPzogK3xcXFxcbnwvPz4pW1xcXFxzXFxcXFNdKj8oPzooPzpcXFxcbiAqKStcXFxcbnwkKScgLy8gKDYpXG4gICAgKyAnfDwoPyFzY3JpcHR8cHJlfHN0eWxlfHRleHRhcmVhKShbYS16XVtcXFxcdy1dKikoPzphdHRyaWJ1dGUpKj8gKi8/Pig/PVsgXFxcXHRdKig/OlxcXFxufCQpKVtcXFxcc1xcXFxTXSo/KD86KD86XFxcXG4gKikrXFxcXG58JCknIC8vICg3KSBvcGVuIHRhZ1xuICAgICsgJ3w8Lyg/IXNjcmlwdHxwcmV8c3R5bGV8dGV4dGFyZWEpW2Etel1bXFxcXHctXSpcXFxccyo+KD89WyBcXFxcdF0qKD86XFxcXG58JCkpW1xcXFxzXFxcXFNdKj8oPzooPzpcXFxcbiAqKStcXFxcbnwkKScgLy8gKDcpIGNsb3NpbmcgdGFnXG4gICAgKyAnKScsXG4gIGRlZjogL14gezAsM31cXFsobGFiZWwpXFxdOiAqKD86XFxuICopPyhbXjxcXHNdW15cXHNdKnw8Lio/PikoPzooPzogKyg/OlxcbiAqKT98ICpcXG4gKikodGl0bGUpKT8gKig/Olxcbit8JCkvLFxuICB0YWJsZTogbm9vcFRlc3QsXG4gIGxoZWFkaW5nOiAvXigoPzoufFxcbig/IVxcbikpKz8pXFxuIHswLDN9KD0rfC0rKSAqKD86XFxuK3wkKS8sXG4gIC8vIHJlZ2V4IHRlbXBsYXRlLCBwbGFjZWhvbGRlcnMgd2lsbCBiZSByZXBsYWNlZCBhY2NvcmRpbmcgdG8gZGlmZmVyZW50IHBhcmFncmFwaFxuICAvLyBpbnRlcnJ1cHRpb24gcnVsZXMgb2YgY29tbW9ubWFyayBhbmQgdGhlIG9yaWdpbmFsIG1hcmtkb3duIHNwZWM6XG4gIF9wYXJhZ3JhcGg6IC9eKFteXFxuXSsoPzpcXG4oPyFocnxoZWFkaW5nfGxoZWFkaW5nfGJsb2NrcXVvdGV8ZmVuY2VzfGxpc3R8aHRtbHx0YWJsZXwgK1xcbilbXlxcbl0rKSopLyxcbiAgdGV4dDogL15bXlxcbl0rL1xufTtcblxuYmxvY2suX2xhYmVsID0gLyg/IVxccypcXF0pKD86XFxcXC58W15cXFtcXF1cXFxcXSkrLztcbmJsb2NrLl90aXRsZSA9IC8oPzpcIig/OlxcXFxcIj98W15cIlxcXFxdKSpcInwnW14nXFxuXSooPzpcXG5bXidcXG5dKykqXFxuPyd8XFwoW14oKV0qXFwpKS87XG5ibG9jay5kZWYgPSBlZGl0KGJsb2NrLmRlZilcbiAgLnJlcGxhY2UoJ2xhYmVsJywgYmxvY2suX2xhYmVsKVxuICAucmVwbGFjZSgndGl0bGUnLCBibG9jay5fdGl0bGUpXG4gIC5nZXRSZWdleCgpO1xuXG5ibG9jay5idWxsZXQgPSAvKD86WyorLV18XFxkezEsOX1bLildKS87XG5ibG9jay5saXN0SXRlbVN0YXJ0ID0gZWRpdCgvXiggKikoYnVsbCkgKi8pXG4gIC5yZXBsYWNlKCdidWxsJywgYmxvY2suYnVsbGV0KVxuICAuZ2V0UmVnZXgoKTtcblxuYmxvY2subGlzdCA9IGVkaXQoYmxvY2subGlzdClcbiAgLnJlcGxhY2UoL2J1bGwvZywgYmxvY2suYnVsbGV0KVxuICAucmVwbGFjZSgnaHInLCAnXFxcXG4rKD89XFxcXDE/KD86KD86LSAqKXszLH18KD86XyAqKXszLH18KD86XFxcXCogKil7Myx9KSg/OlxcXFxuK3wkKSknKVxuICAucmVwbGFjZSgnZGVmJywgJ1xcXFxuKyg/PScgKyBibG9jay5kZWYuc291cmNlICsgJyknKVxuICAuZ2V0UmVnZXgoKTtcblxuYmxvY2suX3RhZyA9ICdhZGRyZXNzfGFydGljbGV8YXNpZGV8YmFzZXxiYXNlZm9udHxibG9ja3F1b3RlfGJvZHl8Y2FwdGlvbidcbiAgKyAnfGNlbnRlcnxjb2x8Y29sZ3JvdXB8ZGR8ZGV0YWlsc3xkaWFsb2d8ZGlyfGRpdnxkbHxkdHxmaWVsZHNldHxmaWdjYXB0aW9uJ1xuICArICd8ZmlndXJlfGZvb3Rlcnxmb3JtfGZyYW1lfGZyYW1lc2V0fGhbMS02XXxoZWFkfGhlYWRlcnxocnxodG1sfGlmcmFtZSdcbiAgKyAnfGxlZ2VuZHxsaXxsaW5rfG1haW58bWVudXxtZW51aXRlbXxtZXRhfG5hdnxub2ZyYW1lc3xvbHxvcHRncm91cHxvcHRpb24nXG4gICsgJ3xwfHBhcmFtfHNlY3Rpb258c291cmNlfHN1bW1hcnl8dGFibGV8dGJvZHl8dGR8dGZvb3R8dGh8dGhlYWR8dGl0bGV8dHInXG4gICsgJ3x0cmFja3x1bCc7XG5ibG9jay5fY29tbWVudCA9IC88IS0tKD8hLT8+KVtcXHNcXFNdKj8oPzotLT58JCkvO1xuYmxvY2suaHRtbCA9IGVkaXQoYmxvY2suaHRtbCwgJ2knKVxuICAucmVwbGFjZSgnY29tbWVudCcsIGJsb2NrLl9jb21tZW50KVxuICAucmVwbGFjZSgndGFnJywgYmxvY2suX3RhZylcbiAgLnJlcGxhY2UoJ2F0dHJpYnV0ZScsIC8gK1thLXpBLVo6X11bXFx3LjotXSooPzogKj0gKlwiW15cIlxcbl0qXCJ8ICo9IConW14nXFxuXSonfCAqPSAqW15cXHNcIic9PD5gXSspPy8pXG4gIC5nZXRSZWdleCgpO1xuXG5ibG9jay5wYXJhZ3JhcGggPSBlZGl0KGJsb2NrLl9wYXJhZ3JhcGgpXG4gIC5yZXBsYWNlKCdocicsIGJsb2NrLmhyKVxuICAucmVwbGFjZSgnaGVhZGluZycsICcgezAsM30jezEsNn0gJylcbiAgLnJlcGxhY2UoJ3xsaGVhZGluZycsICcnKSAvLyBzZXRleCBoZWFkaW5ncyBkb24ndCBpbnRlcnJ1cHQgY29tbW9ubWFyayBwYXJhZ3JhcGhzXG4gIC5yZXBsYWNlKCd8dGFibGUnLCAnJylcbiAgLnJlcGxhY2UoJ2Jsb2NrcXVvdGUnLCAnIHswLDN9PicpXG4gIC5yZXBsYWNlKCdmZW5jZXMnLCAnIHswLDN9KD86YHszLH0oPz1bXmBcXFxcbl0qXFxcXG4pfH57Myx9KVteXFxcXG5dKlxcXFxuJylcbiAgLnJlcGxhY2UoJ2xpc3QnLCAnIHswLDN9KD86WyorLV18MVsuKV0pICcpIC8vIG9ubHkgbGlzdHMgc3RhcnRpbmcgZnJvbSAxIGNhbiBpbnRlcnJ1cHRcbiAgLnJlcGxhY2UoJ2h0bWwnLCAnPC8/KD86dGFnKSg/OiArfFxcXFxufC8/Pil8PCg/OnNjcmlwdHxwcmV8c3R5bGV8dGV4dGFyZWF8IS0tKScpXG4gIC5yZXBsYWNlKCd0YWcnLCBibG9jay5fdGFnKSAvLyBwYXJzIGNhbiBiZSBpbnRlcnJ1cHRlZCBieSB0eXBlICg2KSBodG1sIGJsb2Nrc1xuICAuZ2V0UmVnZXgoKTtcblxuYmxvY2suYmxvY2txdW90ZSA9IGVkaXQoYmxvY2suYmxvY2txdW90ZSlcbiAgLnJlcGxhY2UoJ3BhcmFncmFwaCcsIGJsb2NrLnBhcmFncmFwaClcbiAgLmdldFJlZ2V4KCk7XG5cbi8qKlxuICogTm9ybWFsIEJsb2NrIEdyYW1tYXJcbiAqL1xuXG5ibG9jay5ub3JtYWwgPSB7IC4uLmJsb2NrIH07XG5cbi8qKlxuICogR0ZNIEJsb2NrIEdyYW1tYXJcbiAqL1xuXG5ibG9jay5nZm0gPSB7XG4gIC4uLmJsb2NrLm5vcm1hbCxcbiAgdGFibGU6ICdeICooW15cXFxcbiBdLipcXFxcfC4qKVxcXFxuJyAvLyBIZWFkZXJcbiAgICArICcgezAsM30oPzpcXFxcfCAqKT8oOj8tKzo/ICooPzpcXFxcfCAqOj8tKzo/ICopKikoPzpcXFxcfCAqKT8nIC8vIEFsaWduXG4gICAgKyAnKD86XFxcXG4oKD86KD8hICpcXFxcbnxocnxoZWFkaW5nfGJsb2NrcXVvdGV8Y29kZXxmZW5jZXN8bGlzdHxodG1sKS4qKD86XFxcXG58JCkpKilcXFxcbip8JCknIC8vIENlbGxzXG59O1xuXG5ibG9jay5nZm0udGFibGUgPSBlZGl0KGJsb2NrLmdmbS50YWJsZSlcbiAgLnJlcGxhY2UoJ2hyJywgYmxvY2suaHIpXG4gIC5yZXBsYWNlKCdoZWFkaW5nJywgJyB7MCwzfSN7MSw2fSAnKVxuICAucmVwbGFjZSgnYmxvY2txdW90ZScsICcgezAsM30+JylcbiAgLnJlcGxhY2UoJ2NvZGUnLCAnIHs0fVteXFxcXG5dJylcbiAgLnJlcGxhY2UoJ2ZlbmNlcycsICcgezAsM30oPzpgezMsfSg/PVteYFxcXFxuXSpcXFxcbil8fnszLH0pW15cXFxcbl0qXFxcXG4nKVxuICAucmVwbGFjZSgnbGlzdCcsICcgezAsM30oPzpbKistXXwxWy4pXSkgJykgLy8gb25seSBsaXN0cyBzdGFydGluZyBmcm9tIDEgY2FuIGludGVycnVwdFxuICAucmVwbGFjZSgnaHRtbCcsICc8Lz8oPzp0YWcpKD86ICt8XFxcXG58Lz8+KXw8KD86c2NyaXB0fHByZXxzdHlsZXx0ZXh0YXJlYXwhLS0pJylcbiAgLnJlcGxhY2UoJ3RhZycsIGJsb2NrLl90YWcpIC8vIHRhYmxlcyBjYW4gYmUgaW50ZXJydXB0ZWQgYnkgdHlwZSAoNikgaHRtbCBibG9ja3NcbiAgLmdldFJlZ2V4KCk7XG5cbmJsb2NrLmdmbS5wYXJhZ3JhcGggPSBlZGl0KGJsb2NrLl9wYXJhZ3JhcGgpXG4gIC5yZXBsYWNlKCdocicsIGJsb2NrLmhyKVxuICAucmVwbGFjZSgnaGVhZGluZycsICcgezAsM30jezEsNn0gJylcbiAgLnJlcGxhY2UoJ3xsaGVhZGluZycsICcnKSAvLyBzZXRleCBoZWFkaW5ncyBkb24ndCBpbnRlcnJ1cHQgY29tbW9ubWFyayBwYXJhZ3JhcGhzXG4gIC5yZXBsYWNlKCd0YWJsZScsIGJsb2NrLmdmbS50YWJsZSkgLy8gaW50ZXJydXB0IHBhcmFncmFwaHMgd2l0aCB0YWJsZVxuICAucmVwbGFjZSgnYmxvY2txdW90ZScsICcgezAsM30+JylcbiAgLnJlcGxhY2UoJ2ZlbmNlcycsICcgezAsM30oPzpgezMsfSg/PVteYFxcXFxuXSpcXFxcbil8fnszLH0pW15cXFxcbl0qXFxcXG4nKVxuICAucmVwbGFjZSgnbGlzdCcsICcgezAsM30oPzpbKistXXwxWy4pXSkgJykgLy8gb25seSBsaXN0cyBzdGFydGluZyBmcm9tIDEgY2FuIGludGVycnVwdFxuICAucmVwbGFjZSgnaHRtbCcsICc8Lz8oPzp0YWcpKD86ICt8XFxcXG58Lz8+KXw8KD86c2NyaXB0fHByZXxzdHlsZXx0ZXh0YXJlYXwhLS0pJylcbiAgLnJlcGxhY2UoJ3RhZycsIGJsb2NrLl90YWcpIC8vIHBhcnMgY2FuIGJlIGludGVycnVwdGVkIGJ5IHR5cGUgKDYpIGh0bWwgYmxvY2tzXG4gIC5nZXRSZWdleCgpO1xuLyoqXG4gKiBQZWRhbnRpYyBncmFtbWFyIChvcmlnaW5hbCBKb2huIEdydWJlcidzIGxvb3NlIG1hcmtkb3duIHNwZWNpZmljYXRpb24pXG4gKi9cblxuYmxvY2sucGVkYW50aWMgPSB7XG4gIC4uLmJsb2NrLm5vcm1hbCxcbiAgaHRtbDogZWRpdChcbiAgICAnXiAqKD86Y29tbWVudCAqKD86XFxcXG58XFxcXHMqJCknXG4gICAgKyAnfDwodGFnKVtcXFxcc1xcXFxTXSs/PC9cXFxcMT4gKig/OlxcXFxuezIsfXxcXFxccyokKScgLy8gY2xvc2VkIHRhZ1xuICAgICsgJ3w8dGFnKD86XCJbXlwiXSpcInxcXCdbXlxcJ10qXFwnfFxcXFxzW15cXCdcIi8+XFxcXHNdKikqPy8/PiAqKD86XFxcXG57Mix9fFxcXFxzKiQpKScpXG4gICAgLnJlcGxhY2UoJ2NvbW1lbnQnLCBibG9jay5fY29tbWVudClcbiAgICAucmVwbGFjZSgvdGFnL2csICcoPyEoPzonXG4gICAgICArICdhfGVtfHN0cm9uZ3xzbWFsbHxzfGNpdGV8cXxkZm58YWJicnxkYXRhfHRpbWV8Y29kZXx2YXJ8c2FtcHxrYmR8c3ViJ1xuICAgICAgKyAnfHN1cHxpfGJ8dXxtYXJrfHJ1Ynl8cnR8cnB8YmRpfGJkb3xzcGFufGJyfHdicnxpbnN8ZGVsfGltZyknXG4gICAgICArICdcXFxcYilcXFxcdysoPyE6fFteXFxcXHdcXFxcc0BdKkApXFxcXGInKVxuICAgIC5nZXRSZWdleCgpLFxuICBkZWY6IC9eICpcXFsoW15cXF1dKylcXF06ICo8PyhbXlxccz5dKyk+Pyg/OiArKFtcIihdW15cXG5dK1tcIildKSk/ICooPzpcXG4rfCQpLyxcbiAgaGVhZGluZzogL14oI3sxLDZ9KSguKikoPzpcXG4rfCQpLyxcbiAgZmVuY2VzOiBub29wVGVzdCwgLy8gZmVuY2VzIG5vdCBzdXBwb3J0ZWRcbiAgbGhlYWRpbmc6IC9eKC4rPylcXG4gezAsM30oPSt8LSspICooPzpcXG4rfCQpLyxcbiAgcGFyYWdyYXBoOiBlZGl0KGJsb2NrLm5vcm1hbC5fcGFyYWdyYXBoKVxuICAgIC5yZXBsYWNlKCdocicsIGJsb2NrLmhyKVxuICAgIC5yZXBsYWNlKCdoZWFkaW5nJywgJyAqI3sxLDZ9ICpbXlxcbl0nKVxuICAgIC5yZXBsYWNlKCdsaGVhZGluZycsIGJsb2NrLmxoZWFkaW5nKVxuICAgIC5yZXBsYWNlKCdibG9ja3F1b3RlJywgJyB7MCwzfT4nKVxuICAgIC5yZXBsYWNlKCd8ZmVuY2VzJywgJycpXG4gICAgLnJlcGxhY2UoJ3xsaXN0JywgJycpXG4gICAgLnJlcGxhY2UoJ3xodG1sJywgJycpXG4gICAgLmdldFJlZ2V4KClcbn07XG5cbi8qKlxuICogSW5saW5lLUxldmVsIEdyYW1tYXJcbiAqL1xuY29uc3QgaW5saW5lID0ge1xuICBlc2NhcGU6IC9eXFxcXChbIVwiIyQlJicoKSorLFxcLS4vOjs8PT4/QFxcW1xcXVxcXFxeX2B7fH1+XSkvLFxuICBhdXRvbGluazogL148KHNjaGVtZTpbXlxcc1xceDAwLVxceDFmPD5dKnxlbWFpbCk+LyxcbiAgdXJsOiBub29wVGVzdCxcbiAgdGFnOiAnXmNvbW1lbnQnXG4gICAgKyAnfF48L1thLXpBLVpdW1xcXFx3Oi1dKlxcXFxzKj4nIC8vIHNlbGYtY2xvc2luZyB0YWdcbiAgICArICd8XjxbYS16QS1aXVtcXFxcdy1dKig/OmF0dHJpYnV0ZSkqP1xcXFxzKi8/PicgLy8gb3BlbiB0YWdcbiAgICArICd8XjxcXFxcP1tcXFxcc1xcXFxTXSo/XFxcXD8+JyAvLyBwcm9jZXNzaW5nIGluc3RydWN0aW9uLCBlLmcuIDw/cGhwID8+XG4gICAgKyAnfF48IVthLXpBLVpdK1xcXFxzW1xcXFxzXFxcXFNdKj8+JyAvLyBkZWNsYXJhdGlvbiwgZS5nLiA8IURPQ1RZUEUgaHRtbD5cbiAgICArICd8XjwhXFxcXFtDREFUQVxcXFxbW1xcXFxzXFxcXFNdKj9cXFxcXVxcXFxdPicsIC8vIENEQVRBIHNlY3Rpb25cbiAgbGluazogL14hP1xcWyhsYWJlbClcXF1cXChcXHMqKGhyZWYpKD86XFxzKyh0aXRsZSkpP1xccypcXCkvLFxuICByZWZsaW5rOiAvXiE/XFxbKGxhYmVsKVxcXVxcWyhyZWYpXFxdLyxcbiAgbm9saW5rOiAvXiE/XFxbKHJlZilcXF0oPzpcXFtcXF0pPy8sXG4gIHJlZmxpbmtTZWFyY2g6ICdyZWZsaW5rfG5vbGluayg/IVxcXFwoKScsXG4gIGVtU3Ryb25nOiB7XG4gICAgbERlbGltOiAvXig/OlxcKisoPzooW3B1bmN0X10pfFteXFxzKl0pKXxeXysoPzooW3B1bmN0Kl0pfChbXlxcc19dKSkvLFxuICAgIC8vICAgICAgICAoMSkgYW5kICgyKSBjYW4gb25seSBiZSBhIFJpZ2h0IERlbGltaXRlci4gKDMpIGFuZCAoNCkgY2FuIG9ubHkgYmUgTGVmdC4gICg1KSBhbmQgKDYpIGNhbiBiZSBlaXRoZXIgTGVmdCBvciBSaWdodC5cbiAgICAvLyAgICAgICAgICAoKSBTa2lwIG9ycGhhbiBpbnNpZGUgc3Ryb25nICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoKSBDb25zdW1lIHRvIGRlbGltICAgICAoMSkgIyoqKiAgICAgICAgICAgICAgICAoMikgYSoqKiMsIGEqKiogICAgICAgICAgICAgICAgICAgICAgICAgICAgICgzKSAjKioqYSwgKioqYSAgICAgICAgICAgICAgICAgKDQpICoqKiMgICAgICAgICAgICAgICg1KSAjKioqIyAgICAgICAgICAgICAgICAgKDYpIGEqKiphXG4gICAgckRlbGltQXN0OiAvXig/OlteXypcXFxcXXxcXFxcLikqP1xcX1xcXyg/OlteXypcXFxcXXxcXFxcLikqP1xcKig/OlteXypcXFxcXXxcXFxcLikqPyg/PVxcX1xcXyl8KD86W14qXFxcXF18XFxcXC4pKyg/PVteKl0pfFtwdW5jdF9dKFxcKispKD89W1xcc118JCl8KD86W15wdW5jdCpfXFxzXFxcXF18XFxcXC4pKFxcKispKD89W3B1bmN0X1xcc118JCl8W3B1bmN0X1xcc10oXFwqKykoPz1bXnB1bmN0Kl9cXHNdKXxbXFxzXShcXCorKSg/PVtwdW5jdF9dKXxbcHVuY3RfXShcXCorKSg/PVtwdW5jdF9dKXwoPzpbXnB1bmN0Kl9cXHNcXFxcXXxcXFxcLikoXFwqKykoPz1bXnB1bmN0Kl9cXHNdKS8sXG4gICAgckRlbGltVW5kOiAvXig/OlteXypcXFxcXXxcXFxcLikqP1xcKlxcKig/OlteXypcXFxcXXxcXFxcLikqP1xcXyg/OlteXypcXFxcXXxcXFxcLikqPyg/PVxcKlxcKil8KD86W15fXFxcXF18XFxcXC4pKyg/PVteX10pfFtwdW5jdCpdKFxcXyspKD89W1xcc118JCl8KD86W15wdW5jdCpfXFxzXFxcXF18XFxcXC4pKFxcXyspKD89W3B1bmN0Klxcc118JCl8W3B1bmN0Klxcc10oXFxfKykoPz1bXnB1bmN0Kl9cXHNdKXxbXFxzXShcXF8rKSg/PVtwdW5jdCpdKXxbcHVuY3QqXShcXF8rKSg/PVtwdW5jdCpdKS8gLy8gXi0gTm90IGFsbG93ZWQgZm9yIF9cbiAgfSxcbiAgY29kZTogL14oYCspKFteYF18W15gXVtcXHNcXFNdKj9bXmBdKVxcMSg/IWApLyxcbiAgYnI6IC9eKCB7Mix9fFxcXFwpXFxuKD8hXFxzKiQpLyxcbiAgZGVsOiBub29wVGVzdCxcbiAgdGV4dDogL14oYCt8W15gXSkoPzooPz0gezIsfVxcbil8W1xcc1xcU10qPyg/Oig/PVtcXFxcPCFcXFtgKl9dfFxcYl98JCl8W14gXSg/PSB7Mix9XFxuKSkpLyxcbiAgcHVuY3R1YXRpb246IC9eKFtcXHNwdW5jdHVhdGlvbl0pL1xufTtcblxuLy8gbGlzdCBvZiBwdW5jdHVhdGlvbiBtYXJrcyBmcm9tIENvbW1vbk1hcmsgc3BlY1xuLy8gd2l0aG91dCAqIGFuZCBfIHRvIGhhbmRsZSB0aGUgZGlmZmVyZW50IGVtcGhhc2lzIG1hcmtlcnMgKiBhbmQgX1xuaW5saW5lLl9wdW5jdHVhdGlvbiA9ICchXCIjJCUmXFwnKCkrXFxcXC0uLC86Ozw9Pj9AXFxcXFtcXFxcXWBee3x9fic7XG5pbmxpbmUucHVuY3R1YXRpb24gPSBlZGl0KGlubGluZS5wdW5jdHVhdGlvbikucmVwbGFjZSgvcHVuY3R1YXRpb24vZywgaW5saW5lLl9wdW5jdHVhdGlvbikuZ2V0UmVnZXgoKTtcblxuLy8gc2VxdWVuY2VzIGVtIHNob3VsZCBza2lwIG92ZXIgW3RpdGxlXShsaW5rKSwgYGNvZGVgLCA8aHRtbD5cbmlubGluZS5ibG9ja1NraXAgPSAvXFxbW15cXF1dKj9cXF1cXChbXlxcKV0qP1xcKXxgW15gXSo/YHw8W14+XSo/Pi9nO1xuLy8gbG9va2JlaGluZCBpcyBub3QgYXZhaWxhYmxlIG9uIFNhZmFyaSBhcyBvZiB2ZXJzaW9uIDE2XG4vLyBpbmxpbmUuZXNjYXBlZEVtU3QgPSAvKD88PSg/Ol58W15cXFxcKSg/OlxcXFxbXl0pKilcXFxcWypfXS9nO1xuaW5saW5lLmVzY2FwZWRFbVN0ID0gLyg/Ol58W15cXFxcXSkoPzpcXFxcXFxcXCkqXFxcXFsqX10vZztcblxuaW5saW5lLl9jb21tZW50ID0gZWRpdChibG9jay5fY29tbWVudCkucmVwbGFjZSgnKD86LS0+fCQpJywgJy0tPicpLmdldFJlZ2V4KCk7XG5cbmlubGluZS5lbVN0cm9uZy5sRGVsaW0gPSBlZGl0KGlubGluZS5lbVN0cm9uZy5sRGVsaW0pXG4gIC5yZXBsYWNlKC9wdW5jdC9nLCBpbmxpbmUuX3B1bmN0dWF0aW9uKVxuICAuZ2V0UmVnZXgoKTtcblxuaW5saW5lLmVtU3Ryb25nLnJEZWxpbUFzdCA9IGVkaXQoaW5saW5lLmVtU3Ryb25nLnJEZWxpbUFzdCwgJ2cnKVxuICAucmVwbGFjZSgvcHVuY3QvZywgaW5saW5lLl9wdW5jdHVhdGlvbilcbiAgLmdldFJlZ2V4KCk7XG5cbmlubGluZS5lbVN0cm9uZy5yRGVsaW1VbmQgPSBlZGl0KGlubGluZS5lbVN0cm9uZy5yRGVsaW1VbmQsICdnJylcbiAgLnJlcGxhY2UoL3B1bmN0L2csIGlubGluZS5fcHVuY3R1YXRpb24pXG4gIC5nZXRSZWdleCgpO1xuXG5pbmxpbmUuX2VzY2FwZXMgPSAvXFxcXChbIVwiIyQlJicoKSorLFxcLS4vOjs8PT4/QFxcW1xcXVxcXFxeX2B7fH1+XSkvZztcblxuaW5saW5lLl9zY2hlbWUgPSAvW2EtekEtWl1bYS16QS1aMC05Ky4tXXsxLDMxfS87XG5pbmxpbmUuX2VtYWlsID0gL1thLXpBLVowLTkuISMkJSYnKisvPT9eX2B7fH1+LV0rKEApW2EtekEtWjAtOV0oPzpbYS16QS1aMC05LV17MCw2MX1bYS16QS1aMC05XSk/KD86XFwuW2EtekEtWjAtOV0oPzpbYS16QS1aMC05LV17MCw2MX1bYS16QS1aMC05XSk/KSsoPyFbLV9dKS87XG5pbmxpbmUuYXV0b2xpbmsgPSBlZGl0KGlubGluZS5hdXRvbGluaylcbiAgLnJlcGxhY2UoJ3NjaGVtZScsIGlubGluZS5fc2NoZW1lKVxuICAucmVwbGFjZSgnZW1haWwnLCBpbmxpbmUuX2VtYWlsKVxuICAuZ2V0UmVnZXgoKTtcblxuaW5saW5lLl9hdHRyaWJ1dGUgPSAvXFxzK1thLXpBLVo6X11bXFx3LjotXSooPzpcXHMqPVxccypcIlteXCJdKlwifFxccyo9XFxzKidbXiddKid8XFxzKj1cXHMqW15cXHNcIic9PD5gXSspPy87XG5cbmlubGluZS50YWcgPSBlZGl0KGlubGluZS50YWcpXG4gIC5yZXBsYWNlKCdjb21tZW50JywgaW5saW5lLl9jb21tZW50KVxuICAucmVwbGFjZSgnYXR0cmlidXRlJywgaW5saW5lLl9hdHRyaWJ1dGUpXG4gIC5nZXRSZWdleCgpO1xuXG5pbmxpbmUuX2xhYmVsID0gLyg/OlxcWyg/OlxcXFwufFteXFxbXFxdXFxcXF0pKlxcXXxcXFxcLnxgW15gXSpgfFteXFxbXFxdXFxcXGBdKSo/LztcbmlubGluZS5faHJlZiA9IC88KD86XFxcXC58W15cXG48PlxcXFxdKSs+fFteXFxzXFx4MDAtXFx4MWZdKi87XG5pbmxpbmUuX3RpdGxlID0gL1wiKD86XFxcXFwiP3xbXlwiXFxcXF0pKlwifCcoPzpcXFxcJz98W14nXFxcXF0pKid8XFwoKD86XFxcXFxcKT98W14pXFxcXF0pKlxcKS87XG5cbmlubGluZS5saW5rID0gZWRpdChpbmxpbmUubGluaylcbiAgLnJlcGxhY2UoJ2xhYmVsJywgaW5saW5lLl9sYWJlbClcbiAgLnJlcGxhY2UoJ2hyZWYnLCBpbmxpbmUuX2hyZWYpXG4gIC5yZXBsYWNlKCd0aXRsZScsIGlubGluZS5fdGl0bGUpXG4gIC5nZXRSZWdleCgpO1xuXG5pbmxpbmUucmVmbGluayA9IGVkaXQoaW5saW5lLnJlZmxpbmspXG4gIC5yZXBsYWNlKCdsYWJlbCcsIGlubGluZS5fbGFiZWwpXG4gIC5yZXBsYWNlKCdyZWYnLCBibG9jay5fbGFiZWwpXG4gIC5nZXRSZWdleCgpO1xuXG5pbmxpbmUubm9saW5rID0gZWRpdChpbmxpbmUubm9saW5rKVxuICAucmVwbGFjZSgncmVmJywgYmxvY2suX2xhYmVsKVxuICAuZ2V0UmVnZXgoKTtcblxuaW5saW5lLnJlZmxpbmtTZWFyY2ggPSBlZGl0KGlubGluZS5yZWZsaW5rU2VhcmNoLCAnZycpXG4gIC5yZXBsYWNlKCdyZWZsaW5rJywgaW5saW5lLnJlZmxpbmspXG4gIC5yZXBsYWNlKCdub2xpbmsnLCBpbmxpbmUubm9saW5rKVxuICAuZ2V0UmVnZXgoKTtcblxuLyoqXG4gKiBOb3JtYWwgSW5saW5lIEdyYW1tYXJcbiAqL1xuXG5pbmxpbmUubm9ybWFsID0geyAuLi5pbmxpbmUgfTtcblxuLyoqXG4gKiBQZWRhbnRpYyBJbmxpbmUgR3JhbW1hclxuICovXG5cbmlubGluZS5wZWRhbnRpYyA9IHtcbiAgLi4uaW5saW5lLm5vcm1hbCxcbiAgc3Ryb25nOiB7XG4gICAgc3RhcnQ6IC9eX198XFwqXFwqLyxcbiAgICBtaWRkbGU6IC9eX18oPz1cXFMpKFtcXHNcXFNdKj9cXFMpX18oPyFfKXxeXFwqXFwqKD89XFxTKShbXFxzXFxTXSo/XFxTKVxcKlxcKig/IVxcKikvLFxuICAgIGVuZEFzdDogL1xcKlxcKig/IVxcKikvZyxcbiAgICBlbmRVbmQ6IC9fXyg/IV8pL2dcbiAgfSxcbiAgZW06IHtcbiAgICBzdGFydDogL15ffFxcKi8sXG4gICAgbWlkZGxlOiAvXigpXFwqKD89XFxTKShbXFxzXFxTXSo/XFxTKVxcKig/IVxcKil8Xl8oPz1cXFMpKFtcXHNcXFNdKj9cXFMpXyg/IV8pLyxcbiAgICBlbmRBc3Q6IC9cXCooPyFcXCopL2csXG4gICAgZW5kVW5kOiAvXyg/IV8pL2dcbiAgfSxcbiAgbGluazogZWRpdCgvXiE/XFxbKGxhYmVsKVxcXVxcKCguKj8pXFwpLylcbiAgICAucmVwbGFjZSgnbGFiZWwnLCBpbmxpbmUuX2xhYmVsKVxuICAgIC5nZXRSZWdleCgpLFxuICByZWZsaW5rOiBlZGl0KC9eIT9cXFsobGFiZWwpXFxdXFxzKlxcWyhbXlxcXV0qKVxcXS8pXG4gICAgLnJlcGxhY2UoJ2xhYmVsJywgaW5saW5lLl9sYWJlbClcbiAgICAuZ2V0UmVnZXgoKVxufTtcblxuLyoqXG4gKiBHRk0gSW5saW5lIEdyYW1tYXJcbiAqL1xuXG5pbmxpbmUuZ2ZtID0ge1xuICAuLi5pbmxpbmUubm9ybWFsLFxuICBlc2NhcGU6IGVkaXQoaW5saW5lLmVzY2FwZSkucmVwbGFjZSgnXSknLCAnfnxdKScpLmdldFJlZ2V4KCksXG4gIF9leHRlbmRlZF9lbWFpbDogL1tBLVphLXowLTkuXystXSsoQClbYS16QS1aMC05LV9dKyg/OlxcLlthLXpBLVowLTktX10qW2EtekEtWjAtOV0pKyg/IVstX10pLyxcbiAgdXJsOiAvXigoPzpmdHB8aHR0cHM/KTpcXC9cXC98d3d3XFwuKSg/OlthLXpBLVowLTlcXC1dK1xcLj8pK1teXFxzPF0qfF5lbWFpbC8sXG4gIF9iYWNrcGVkYWw6IC8oPzpbXj8hLiw6OypfJ1wifigpJl0rfFxcKFteKV0qXFwpfCYoPyFbYS16QS1aMC05XSs7JCl8Wz8hLiw6OypfJ1wifildKyg/ISQpKSsvLFxuICBkZWw6IC9eKH5+PykoPz1bXlxcc35dKShbXFxzXFxTXSo/W15cXHN+XSlcXDEoPz1bXn5dfCQpLyxcbiAgdGV4dDogL14oW2B+XSt8W15gfl0pKD86KD89IHsyLH1cXG4pfCg/PVthLXpBLVowLTkuISMkJSYnKitcXC89P19ge1xcfH1+LV0rQCl8W1xcc1xcU10qPyg/Oig/PVtcXFxcPCFcXFtgKn5fXXxcXGJffGh0dHBzPzpcXC9cXC98ZnRwOlxcL1xcL3x3d3dcXC58JCl8W14gXSg/PSB7Mix9XFxuKXxbXmEtekEtWjAtOS4hIyQlJicqK1xcLz0/X2B7XFx8fX4tXSg/PVthLXpBLVowLTkuISMkJSYnKitcXC89P19ge1xcfH1+LV0rQCkpKS9cbn07XG5cbmlubGluZS5nZm0udXJsID0gZWRpdChpbmxpbmUuZ2ZtLnVybCwgJ2knKVxuICAucmVwbGFjZSgnZW1haWwnLCBpbmxpbmUuZ2ZtLl9leHRlbmRlZF9lbWFpbClcbiAgLmdldFJlZ2V4KCk7XG4vKipcbiAqIEdGTSArIExpbmUgQnJlYWtzIElubGluZSBHcmFtbWFyXG4gKi9cblxuaW5saW5lLmJyZWFrcyA9IHtcbiAgLi4uaW5saW5lLmdmbSxcbiAgYnI6IGVkaXQoaW5saW5lLmJyKS5yZXBsYWNlKCd7Mix9JywgJyonKS5nZXRSZWdleCgpLFxuICB0ZXh0OiBlZGl0KGlubGluZS5nZm0udGV4dClcbiAgICAucmVwbGFjZSgnXFxcXGJfJywgJ1xcXFxiX3wgezIsfVxcXFxuJylcbiAgICAucmVwbGFjZSgvXFx7MixcXH0vZywgJyonKVxuICAgIC5nZXRSZWdleCgpXG59O1xuXG4vKipcbiAqIHNtYXJ0eXBhbnRzIHRleHQgcmVwbGFjZW1lbnRcbiAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0XG4gKi9cbmZ1bmN0aW9uIHNtYXJ0eXBhbnRzKHRleHQpIHtcbiAgcmV0dXJuIHRleHRcbiAgICAvLyBlbS1kYXNoZXNcbiAgICAucmVwbGFjZSgvLS0tL2csICdcXHUyMDE0JylcbiAgICAvLyBlbi1kYXNoZXNcbiAgICAucmVwbGFjZSgvLS0vZywgJ1xcdTIwMTMnKVxuICAgIC8vIG9wZW5pbmcgc2luZ2xlc1xuICAgIC5yZXBsYWNlKC8oXnxbLVxcdTIwMTQvKFxcW3tcIlxcc10pJy9nLCAnJDFcXHUyMDE4JylcbiAgICAvLyBjbG9zaW5nIHNpbmdsZXMgJiBhcG9zdHJvcGhlc1xuICAgIC5yZXBsYWNlKC8nL2csICdcXHUyMDE5JylcbiAgICAvLyBvcGVuaW5nIGRvdWJsZXNcbiAgICAucmVwbGFjZSgvKF58Wy1cXHUyMDE0LyhcXFt7XFx1MjAxOFxcc10pXCIvZywgJyQxXFx1MjAxYycpXG4gICAgLy8gY2xvc2luZyBkb3VibGVzXG4gICAgLnJlcGxhY2UoL1wiL2csICdcXHUyMDFkJylcbiAgICAvLyBlbGxpcHNlc1xuICAgIC5yZXBsYWNlKC9cXC57M30vZywgJ1xcdTIwMjYnKTtcbn1cblxuLyoqXG4gKiBtYW5nbGUgZW1haWwgYWRkcmVzc2VzXG4gKiBAcGFyYW0ge3N0cmluZ30gdGV4dFxuICovXG5mdW5jdGlvbiBtYW5nbGUodGV4dCkge1xuICBsZXQgb3V0ID0gJycsXG4gICAgaSxcbiAgICBjaDtcblxuICBjb25zdCBsID0gdGV4dC5sZW5ndGg7XG4gIGZvciAoaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICBjaCA9IHRleHQuY2hhckNvZGVBdChpKTtcbiAgICBpZiAoTWF0aC5yYW5kb20oKSA+IDAuNSkge1xuICAgICAgY2ggPSAneCcgKyBjaC50b1N0cmluZygxNik7XG4gICAgfVxuICAgIG91dCArPSAnJiMnICsgY2ggKyAnOyc7XG4gIH1cblxuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIEJsb2NrIExleGVyXG4gKi9cbmNsYXNzIExleGVyIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgIHRoaXMudG9rZW5zID0gW107XG4gICAgdGhpcy50b2tlbnMubGlua3MgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHwgZGVmYXVsdHM7XG4gICAgdGhpcy5vcHRpb25zLnRva2VuaXplciA9IHRoaXMub3B0aW9ucy50b2tlbml6ZXIgfHwgbmV3IFRva2VuaXplcigpO1xuICAgIHRoaXMudG9rZW5pemVyID0gdGhpcy5vcHRpb25zLnRva2VuaXplcjtcbiAgICB0aGlzLnRva2VuaXplci5vcHRpb25zID0gdGhpcy5vcHRpb25zO1xuICAgIHRoaXMudG9rZW5pemVyLmxleGVyID0gdGhpcztcbiAgICB0aGlzLmlubGluZVF1ZXVlID0gW107XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIGluTGluazogZmFsc2UsXG4gICAgICBpblJhd0Jsb2NrOiBmYWxzZSxcbiAgICAgIHRvcDogdHJ1ZVxuICAgIH07XG5cbiAgICBjb25zdCBydWxlcyA9IHtcbiAgICAgIGJsb2NrOiBibG9jay5ub3JtYWwsXG4gICAgICBpbmxpbmU6IGlubGluZS5ub3JtYWxcbiAgICB9O1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5wZWRhbnRpYykge1xuICAgICAgcnVsZXMuYmxvY2sgPSBibG9jay5wZWRhbnRpYztcbiAgICAgIHJ1bGVzLmlubGluZSA9IGlubGluZS5wZWRhbnRpYztcbiAgICB9IGVsc2UgaWYgKHRoaXMub3B0aW9ucy5nZm0pIHtcbiAgICAgIHJ1bGVzLmJsb2NrID0gYmxvY2suZ2ZtO1xuICAgICAgaWYgKHRoaXMub3B0aW9ucy5icmVha3MpIHtcbiAgICAgICAgcnVsZXMuaW5saW5lID0gaW5saW5lLmJyZWFrcztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJ1bGVzLmlubGluZSA9IGlubGluZS5nZm07XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMudG9rZW5pemVyLnJ1bGVzID0gcnVsZXM7XG4gIH1cblxuICAvKipcbiAgICogRXhwb3NlIFJ1bGVzXG4gICAqL1xuICBzdGF0aWMgZ2V0IHJ1bGVzKCkge1xuICAgIHJldHVybiB7XG4gICAgICBibG9jayxcbiAgICAgIGlubGluZVxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogU3RhdGljIExleCBNZXRob2RcbiAgICovXG4gIHN0YXRpYyBsZXgoc3JjLCBvcHRpb25zKSB7XG4gICAgY29uc3QgbGV4ZXIgPSBuZXcgTGV4ZXIob3B0aW9ucyk7XG4gICAgcmV0dXJuIGxleGVyLmxleChzcmMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YXRpYyBMZXggSW5saW5lIE1ldGhvZFxuICAgKi9cbiAgc3RhdGljIGxleElubGluZShzcmMsIG9wdGlvbnMpIHtcbiAgICBjb25zdCBsZXhlciA9IG5ldyBMZXhlcihvcHRpb25zKTtcbiAgICByZXR1cm4gbGV4ZXIuaW5saW5lVG9rZW5zKHNyYyk7XG4gIH1cblxuICAvKipcbiAgICogUHJlcHJvY2Vzc2luZ1xuICAgKi9cbiAgbGV4KHNyYykge1xuICAgIHNyYyA9IHNyY1xuICAgICAgLnJlcGxhY2UoL1xcclxcbnxcXHIvZywgJ1xcbicpO1xuXG4gICAgdGhpcy5ibG9ja1Rva2VucyhzcmMsIHRoaXMudG9rZW5zKTtcblxuICAgIGxldCBuZXh0O1xuICAgIHdoaWxlIChuZXh0ID0gdGhpcy5pbmxpbmVRdWV1ZS5zaGlmdCgpKSB7XG4gICAgICB0aGlzLmlubGluZVRva2VucyhuZXh0LnNyYywgbmV4dC50b2tlbnMpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnRva2VucztcbiAgfVxuXG4gIC8qKlxuICAgKiBMZXhpbmdcbiAgICovXG4gIGJsb2NrVG9rZW5zKHNyYywgdG9rZW5zID0gW10pIHtcbiAgICBpZiAodGhpcy5vcHRpb25zLnBlZGFudGljKSB7XG4gICAgICBzcmMgPSBzcmMucmVwbGFjZSgvXFx0L2csICcgICAgJykucmVwbGFjZSgvXiArJC9nbSwgJycpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzcmMgPSBzcmMucmVwbGFjZSgvXiggKikoXFx0KykvZ20sIChfLCBsZWFkaW5nLCB0YWJzKSA9PiB7XG4gICAgICAgIHJldHVybiBsZWFkaW5nICsgJyAgICAnLnJlcGVhdCh0YWJzLmxlbmd0aCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBsZXQgdG9rZW4sIGxhc3RUb2tlbiwgY3V0U3JjLCBsYXN0UGFyYWdyYXBoQ2xpcHBlZDtcblxuICAgIHdoaWxlIChzcmMpIHtcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuZXh0ZW5zaW9uc1xuICAgICAgICAmJiB0aGlzLm9wdGlvbnMuZXh0ZW5zaW9ucy5ibG9ja1xuICAgICAgICAmJiB0aGlzLm9wdGlvbnMuZXh0ZW5zaW9ucy5ibG9jay5zb21lKChleHRUb2tlbml6ZXIpID0+IHtcbiAgICAgICAgICBpZiAodG9rZW4gPSBleHRUb2tlbml6ZXIuY2FsbCh7IGxleGVyOiB0aGlzIH0sIHNyYywgdG9rZW5zKSkge1xuICAgICAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0pKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBuZXdsaW5lXG4gICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci5zcGFjZShzcmMpKSB7XG4gICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgIGlmICh0b2tlbi5yYXcubGVuZ3RoID09PSAxICYmIHRva2Vucy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgLy8gaWYgdGhlcmUncyBhIHNpbmdsZSBcXG4gYXMgYSBzcGFjZXIsIGl0J3MgdGVybWluYXRpbmcgdGhlIGxhc3QgbGluZSxcbiAgICAgICAgICAvLyBzbyBtb3ZlIGl0IHRoZXJlIHNvIHRoYXQgd2UgZG9uJ3QgZ2V0IHVuZWNlc3NhcnkgcGFyYWdyYXBoIHRhZ3NcbiAgICAgICAgICB0b2tlbnNbdG9rZW5zLmxlbmd0aCAtIDFdLnJhdyArPSAnXFxuJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgIH1cbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIGNvZGVcbiAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLmNvZGUoc3JjKSkge1xuICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICBsYXN0VG9rZW4gPSB0b2tlbnNbdG9rZW5zLmxlbmd0aCAtIDFdO1xuICAgICAgICAvLyBBbiBpbmRlbnRlZCBjb2RlIGJsb2NrIGNhbm5vdCBpbnRlcnJ1cHQgYSBwYXJhZ3JhcGguXG4gICAgICAgIGlmIChsYXN0VG9rZW4gJiYgKGxhc3RUb2tlbi50eXBlID09PSAncGFyYWdyYXBoJyB8fCBsYXN0VG9rZW4udHlwZSA9PT0gJ3RleHQnKSkge1xuICAgICAgICAgIGxhc3RUb2tlbi5yYXcgKz0gJ1xcbicgKyB0b2tlbi5yYXc7XG4gICAgICAgICAgbGFzdFRva2VuLnRleHQgKz0gJ1xcbicgKyB0b2tlbi50ZXh0O1xuICAgICAgICAgIHRoaXMuaW5saW5lUXVldWVbdGhpcy5pbmxpbmVRdWV1ZS5sZW5ndGggLSAxXS5zcmMgPSBsYXN0VG9rZW4udGV4dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgIH1cbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIGZlbmNlc1xuICAgICAgaWYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIuZmVuY2VzKHNyYykpIHtcbiAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gaGVhZGluZ1xuICAgICAgaWYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIuaGVhZGluZyhzcmMpKSB7XG4gICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIGhyXG4gICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci5ocihzcmMpKSB7XG4gICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIGJsb2NrcXVvdGVcbiAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLmJsb2NrcXVvdGUoc3JjKSkge1xuICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBsaXN0XG4gICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci5saXN0KHNyYykpIHtcbiAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gaHRtbFxuICAgICAgaWYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIuaHRtbChzcmMpKSB7XG4gICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIGRlZlxuICAgICAgaWYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIuZGVmKHNyYykpIHtcbiAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgbGFzdFRva2VuID0gdG9rZW5zW3Rva2Vucy5sZW5ndGggLSAxXTtcbiAgICAgICAgaWYgKGxhc3RUb2tlbiAmJiAobGFzdFRva2VuLnR5cGUgPT09ICdwYXJhZ3JhcGgnIHx8IGxhc3RUb2tlbi50eXBlID09PSAndGV4dCcpKSB7XG4gICAgICAgICAgbGFzdFRva2VuLnJhdyArPSAnXFxuJyArIHRva2VuLnJhdztcbiAgICAgICAgICBsYXN0VG9rZW4udGV4dCArPSAnXFxuJyArIHRva2VuLnJhdztcbiAgICAgICAgICB0aGlzLmlubGluZVF1ZXVlW3RoaXMuaW5saW5lUXVldWUubGVuZ3RoIC0gMV0uc3JjID0gbGFzdFRva2VuLnRleHQ7XG4gICAgICAgIH0gZWxzZSBpZiAoIXRoaXMudG9rZW5zLmxpbmtzW3Rva2VuLnRhZ10pIHtcbiAgICAgICAgICB0aGlzLnRva2Vucy5saW5rc1t0b2tlbi50YWddID0ge1xuICAgICAgICAgICAgaHJlZjogdG9rZW4uaHJlZixcbiAgICAgICAgICAgIHRpdGxlOiB0b2tlbi50aXRsZVxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIHRhYmxlIChnZm0pXG4gICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci50YWJsZShzcmMpKSB7XG4gICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIGxoZWFkaW5nXG4gICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci5saGVhZGluZyhzcmMpKSB7XG4gICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIHRvcC1sZXZlbCBwYXJhZ3JhcGhcbiAgICAgIC8vIHByZXZlbnQgcGFyYWdyYXBoIGNvbnN1bWluZyBleHRlbnNpb25zIGJ5IGNsaXBwaW5nICdzcmMnIHRvIGV4dGVuc2lvbiBzdGFydFxuICAgICAgY3V0U3JjID0gc3JjO1xuICAgICAgaWYgKHRoaXMub3B0aW9ucy5leHRlbnNpb25zICYmIHRoaXMub3B0aW9ucy5leHRlbnNpb25zLnN0YXJ0QmxvY2spIHtcbiAgICAgICAgbGV0IHN0YXJ0SW5kZXggPSBJbmZpbml0eTtcbiAgICAgICAgY29uc3QgdGVtcFNyYyA9IHNyYy5zbGljZSgxKTtcbiAgICAgICAgbGV0IHRlbXBTdGFydDtcbiAgICAgICAgdGhpcy5vcHRpb25zLmV4dGVuc2lvbnMuc3RhcnRCbG9jay5mb3JFYWNoKGZ1bmN0aW9uKGdldFN0YXJ0SW5kZXgpIHtcbiAgICAgICAgICB0ZW1wU3RhcnQgPSBnZXRTdGFydEluZGV4LmNhbGwoeyBsZXhlcjogdGhpcyB9LCB0ZW1wU3JjKTtcbiAgICAgICAgICBpZiAodHlwZW9mIHRlbXBTdGFydCA9PT0gJ251bWJlcicgJiYgdGVtcFN0YXJ0ID49IDApIHsgc3RhcnRJbmRleCA9IE1hdGgubWluKHN0YXJ0SW5kZXgsIHRlbXBTdGFydCk7IH1cbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChzdGFydEluZGV4IDwgSW5maW5pdHkgJiYgc3RhcnRJbmRleCA+PSAwKSB7XG4gICAgICAgICAgY3V0U3JjID0gc3JjLnN1YnN0cmluZygwLCBzdGFydEluZGV4ICsgMSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLnN0YXRlLnRvcCAmJiAodG9rZW4gPSB0aGlzLnRva2VuaXplci5wYXJhZ3JhcGgoY3V0U3JjKSkpIHtcbiAgICAgICAgbGFzdFRva2VuID0gdG9rZW5zW3Rva2Vucy5sZW5ndGggLSAxXTtcbiAgICAgICAgaWYgKGxhc3RQYXJhZ3JhcGhDbGlwcGVkICYmIGxhc3RUb2tlbi50eXBlID09PSAncGFyYWdyYXBoJykge1xuICAgICAgICAgIGxhc3RUb2tlbi5yYXcgKz0gJ1xcbicgKyB0b2tlbi5yYXc7XG4gICAgICAgICAgbGFzdFRva2VuLnRleHQgKz0gJ1xcbicgKyB0b2tlbi50ZXh0O1xuICAgICAgICAgIHRoaXMuaW5saW5lUXVldWUucG9wKCk7XG4gICAgICAgICAgdGhpcy5pbmxpbmVRdWV1ZVt0aGlzLmlubGluZVF1ZXVlLmxlbmd0aCAtIDFdLnNyYyA9IGxhc3RUb2tlbi50ZXh0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgfVxuICAgICAgICBsYXN0UGFyYWdyYXBoQ2xpcHBlZCA9IChjdXRTcmMubGVuZ3RoICE9PSBzcmMubGVuZ3RoKTtcbiAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIHRleHRcbiAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLnRleHQoc3JjKSkge1xuICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICBsYXN0VG9rZW4gPSB0b2tlbnNbdG9rZW5zLmxlbmd0aCAtIDFdO1xuICAgICAgICBpZiAobGFzdFRva2VuICYmIGxhc3RUb2tlbi50eXBlID09PSAndGV4dCcpIHtcbiAgICAgICAgICBsYXN0VG9rZW4ucmF3ICs9ICdcXG4nICsgdG9rZW4ucmF3O1xuICAgICAgICAgIGxhc3RUb2tlbi50ZXh0ICs9ICdcXG4nICsgdG9rZW4udGV4dDtcbiAgICAgICAgICB0aGlzLmlubGluZVF1ZXVlLnBvcCgpO1xuICAgICAgICAgIHRoaXMuaW5saW5lUXVldWVbdGhpcy5pbmxpbmVRdWV1ZS5sZW5ndGggLSAxXS5zcmMgPSBsYXN0VG9rZW4udGV4dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgIH1cbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChzcmMpIHtcbiAgICAgICAgY29uc3QgZXJyTXNnID0gJ0luZmluaXRlIGxvb3Agb24gYnl0ZTogJyArIHNyYy5jaGFyQ29kZUF0KDApO1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnNpbGVudCkge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyTXNnKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyTXNnKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuc3RhdGUudG9wID0gdHJ1ZTtcbiAgICByZXR1cm4gdG9rZW5zO1xuICB9XG5cbiAgaW5saW5lKHNyYywgdG9rZW5zID0gW10pIHtcbiAgICB0aGlzLmlubGluZVF1ZXVlLnB1c2goeyBzcmMsIHRva2VucyB9KTtcbiAgICByZXR1cm4gdG9rZW5zO1xuICB9XG5cbiAgLyoqXG4gICAqIExleGluZy9Db21waWxpbmdcbiAgICovXG4gIGlubGluZVRva2VucyhzcmMsIHRva2VucyA9IFtdKSB7XG4gICAgbGV0IHRva2VuLCBsYXN0VG9rZW4sIGN1dFNyYztcblxuICAgIC8vIFN0cmluZyB3aXRoIGxpbmtzIG1hc2tlZCB0byBhdm9pZCBpbnRlcmZlcmVuY2Ugd2l0aCBlbSBhbmQgc3Ryb25nXG4gICAgbGV0IG1hc2tlZFNyYyA9IHNyYztcbiAgICBsZXQgbWF0Y2g7XG4gICAgbGV0IGtlZXBQcmV2Q2hhciwgcHJldkNoYXI7XG5cbiAgICAvLyBNYXNrIG91dCByZWZsaW5rc1xuICAgIGlmICh0aGlzLnRva2Vucy5saW5rcykge1xuICAgICAgY29uc3QgbGlua3MgPSBPYmplY3Qua2V5cyh0aGlzLnRva2Vucy5saW5rcyk7XG4gICAgICBpZiAobGlua3MubGVuZ3RoID4gMCkge1xuICAgICAgICB3aGlsZSAoKG1hdGNoID0gdGhpcy50b2tlbml6ZXIucnVsZXMuaW5saW5lLnJlZmxpbmtTZWFyY2guZXhlYyhtYXNrZWRTcmMpKSAhPSBudWxsKSB7XG4gICAgICAgICAgaWYgKGxpbmtzLmluY2x1ZGVzKG1hdGNoWzBdLnNsaWNlKG1hdGNoWzBdLmxhc3RJbmRleE9mKCdbJykgKyAxLCAtMSkpKSB7XG4gICAgICAgICAgICBtYXNrZWRTcmMgPSBtYXNrZWRTcmMuc2xpY2UoMCwgbWF0Y2guaW5kZXgpICsgJ1snICsgcmVwZWF0U3RyaW5nKCdhJywgbWF0Y2hbMF0ubGVuZ3RoIC0gMikgKyAnXScgKyBtYXNrZWRTcmMuc2xpY2UodGhpcy50b2tlbml6ZXIucnVsZXMuaW5saW5lLnJlZmxpbmtTZWFyY2gubGFzdEluZGV4KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgLy8gTWFzayBvdXQgb3RoZXIgYmxvY2tzXG4gICAgd2hpbGUgKChtYXRjaCA9IHRoaXMudG9rZW5pemVyLnJ1bGVzLmlubGluZS5ibG9ja1NraXAuZXhlYyhtYXNrZWRTcmMpKSAhPSBudWxsKSB7XG4gICAgICBtYXNrZWRTcmMgPSBtYXNrZWRTcmMuc2xpY2UoMCwgbWF0Y2guaW5kZXgpICsgJ1snICsgcmVwZWF0U3RyaW5nKCdhJywgbWF0Y2hbMF0ubGVuZ3RoIC0gMikgKyAnXScgKyBtYXNrZWRTcmMuc2xpY2UodGhpcy50b2tlbml6ZXIucnVsZXMuaW5saW5lLmJsb2NrU2tpcC5sYXN0SW5kZXgpO1xuICAgIH1cblxuICAgIC8vIE1hc2sgb3V0IGVzY2FwZWQgZW0gJiBzdHJvbmcgZGVsaW1pdGVyc1xuICAgIHdoaWxlICgobWF0Y2ggPSB0aGlzLnRva2VuaXplci5ydWxlcy5pbmxpbmUuZXNjYXBlZEVtU3QuZXhlYyhtYXNrZWRTcmMpKSAhPSBudWxsKSB7XG4gICAgICBtYXNrZWRTcmMgPSBtYXNrZWRTcmMuc2xpY2UoMCwgbWF0Y2guaW5kZXggKyBtYXRjaFswXS5sZW5ndGggLSAyKSArICcrKycgKyBtYXNrZWRTcmMuc2xpY2UodGhpcy50b2tlbml6ZXIucnVsZXMuaW5saW5lLmVzY2FwZWRFbVN0Lmxhc3RJbmRleCk7XG4gICAgICB0aGlzLnRva2VuaXplci5ydWxlcy5pbmxpbmUuZXNjYXBlZEVtU3QubGFzdEluZGV4LS07XG4gICAgfVxuXG4gICAgd2hpbGUgKHNyYykge1xuICAgICAgaWYgKCFrZWVwUHJldkNoYXIpIHtcbiAgICAgICAgcHJldkNoYXIgPSAnJztcbiAgICAgIH1cbiAgICAgIGtlZXBQcmV2Q2hhciA9IGZhbHNlO1xuXG4gICAgICAvLyBleHRlbnNpb25zXG4gICAgICBpZiAodGhpcy5vcHRpb25zLmV4dGVuc2lvbnNcbiAgICAgICAgJiYgdGhpcy5vcHRpb25zLmV4dGVuc2lvbnMuaW5saW5lXG4gICAgICAgICYmIHRoaXMub3B0aW9ucy5leHRlbnNpb25zLmlubGluZS5zb21lKChleHRUb2tlbml6ZXIpID0+IHtcbiAgICAgICAgICBpZiAodG9rZW4gPSBleHRUb2tlbml6ZXIuY2FsbCh7IGxleGVyOiB0aGlzIH0sIHNyYywgdG9rZW5zKSkge1xuICAgICAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0pKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBlc2NhcGVcbiAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLmVzY2FwZShzcmMpKSB7XG4gICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIHRhZ1xuICAgICAgaWYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIudGFnKHNyYykpIHtcbiAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgbGFzdFRva2VuID0gdG9rZW5zW3Rva2Vucy5sZW5ndGggLSAxXTtcbiAgICAgICAgaWYgKGxhc3RUb2tlbiAmJiB0b2tlbi50eXBlID09PSAndGV4dCcgJiYgbGFzdFRva2VuLnR5cGUgPT09ICd0ZXh0Jykge1xuICAgICAgICAgIGxhc3RUb2tlbi5yYXcgKz0gdG9rZW4ucmF3O1xuICAgICAgICAgIGxhc3RUb2tlbi50ZXh0ICs9IHRva2VuLnRleHQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICB9XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBsaW5rXG4gICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci5saW5rKHNyYykpIHtcbiAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gcmVmbGluaywgbm9saW5rXG4gICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci5yZWZsaW5rKHNyYywgdGhpcy50b2tlbnMubGlua3MpKSB7XG4gICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgIGxhc3RUb2tlbiA9IHRva2Vuc1t0b2tlbnMubGVuZ3RoIC0gMV07XG4gICAgICAgIGlmIChsYXN0VG9rZW4gJiYgdG9rZW4udHlwZSA9PT0gJ3RleHQnICYmIGxhc3RUb2tlbi50eXBlID09PSAndGV4dCcpIHtcbiAgICAgICAgICBsYXN0VG9rZW4ucmF3ICs9IHRva2VuLnJhdztcbiAgICAgICAgICBsYXN0VG9rZW4udGV4dCArPSB0b2tlbi50ZXh0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgfVxuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gZW0gJiBzdHJvbmdcbiAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLmVtU3Ryb25nKHNyYywgbWFza2VkU3JjLCBwcmV2Q2hhcikpIHtcbiAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gY29kZVxuICAgICAgaWYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIuY29kZXNwYW4oc3JjKSkge1xuICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBiclxuICAgICAgaWYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIuYnIoc3JjKSkge1xuICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBkZWwgKGdmbSlcbiAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLmRlbChzcmMpKSB7XG4gICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIGF1dG9saW5rXG4gICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci5hdXRvbGluayhzcmMsIG1hbmdsZSkpIHtcbiAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gdXJsIChnZm0pXG4gICAgICBpZiAoIXRoaXMuc3RhdGUuaW5MaW5rICYmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLnVybChzcmMsIG1hbmdsZSkpKSB7XG4gICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIHRleHRcbiAgICAgIC8vIHByZXZlbnQgaW5saW5lVGV4dCBjb25zdW1pbmcgZXh0ZW5zaW9ucyBieSBjbGlwcGluZyAnc3JjJyB0byBleHRlbnNpb24gc3RhcnRcbiAgICAgIGN1dFNyYyA9IHNyYztcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuZXh0ZW5zaW9ucyAmJiB0aGlzLm9wdGlvbnMuZXh0ZW5zaW9ucy5zdGFydElubGluZSkge1xuICAgICAgICBsZXQgc3RhcnRJbmRleCA9IEluZmluaXR5O1xuICAgICAgICBjb25zdCB0ZW1wU3JjID0gc3JjLnNsaWNlKDEpO1xuICAgICAgICBsZXQgdGVtcFN0YXJ0O1xuICAgICAgICB0aGlzLm9wdGlvbnMuZXh0ZW5zaW9ucy5zdGFydElubGluZS5mb3JFYWNoKGZ1bmN0aW9uKGdldFN0YXJ0SW5kZXgpIHtcbiAgICAgICAgICB0ZW1wU3RhcnQgPSBnZXRTdGFydEluZGV4LmNhbGwoeyBsZXhlcjogdGhpcyB9LCB0ZW1wU3JjKTtcbiAgICAgICAgICBpZiAodHlwZW9mIHRlbXBTdGFydCA9PT0gJ251bWJlcicgJiYgdGVtcFN0YXJ0ID49IDApIHsgc3RhcnRJbmRleCA9IE1hdGgubWluKHN0YXJ0SW5kZXgsIHRlbXBTdGFydCk7IH1cbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChzdGFydEluZGV4IDwgSW5maW5pdHkgJiYgc3RhcnRJbmRleCA+PSAwKSB7XG4gICAgICAgICAgY3V0U3JjID0gc3JjLnN1YnN0cmluZygwLCBzdGFydEluZGV4ICsgMSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLmlubGluZVRleHQoY3V0U3JjLCBzbWFydHlwYW50cykpIHtcbiAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgaWYgKHRva2VuLnJhdy5zbGljZSgtMSkgIT09ICdfJykgeyAvLyBUcmFjayBwcmV2Q2hhciBiZWZvcmUgc3RyaW5nIG9mIF9fX18gc3RhcnRlZFxuICAgICAgICAgIHByZXZDaGFyID0gdG9rZW4ucmF3LnNsaWNlKC0xKTtcbiAgICAgICAgfVxuICAgICAgICBrZWVwUHJldkNoYXIgPSB0cnVlO1xuICAgICAgICBsYXN0VG9rZW4gPSB0b2tlbnNbdG9rZW5zLmxlbmd0aCAtIDFdO1xuICAgICAgICBpZiAobGFzdFRva2VuICYmIGxhc3RUb2tlbi50eXBlID09PSAndGV4dCcpIHtcbiAgICAgICAgICBsYXN0VG9rZW4ucmF3ICs9IHRva2VuLnJhdztcbiAgICAgICAgICBsYXN0VG9rZW4udGV4dCArPSB0b2tlbi50ZXh0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgfVxuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKHNyYykge1xuICAgICAgICBjb25zdCBlcnJNc2cgPSAnSW5maW5pdGUgbG9vcCBvbiBieXRlOiAnICsgc3JjLmNoYXJDb2RlQXQoMCk7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuc2lsZW50KSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihlcnJNc2cpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJNc2cpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRva2VucztcbiAgfVxufVxuXG4vKipcbiAqIFJlbmRlcmVyXG4gKi9cbmNsYXNzIFJlbmRlcmVyIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHwgZGVmYXVsdHM7XG4gIH1cblxuICBjb2RlKGNvZGUsIGluZm9zdHJpbmcsIGVzY2FwZWQpIHtcbiAgICBjb25zdCBsYW5nID0gKGluZm9zdHJpbmcgfHwgJycpLm1hdGNoKC9cXFMqLylbMF07XG4gICAgaWYgKHRoaXMub3B0aW9ucy5oaWdobGlnaHQpIHtcbiAgICAgIGNvbnN0IG91dCA9IHRoaXMub3B0aW9ucy5oaWdobGlnaHQoY29kZSwgbGFuZyk7XG4gICAgICBpZiAob3V0ICE9IG51bGwgJiYgb3V0ICE9PSBjb2RlKSB7XG4gICAgICAgIGVzY2FwZWQgPSB0cnVlO1xuICAgICAgICBjb2RlID0gb3V0O1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvZGUgPSBjb2RlLnJlcGxhY2UoL1xcbiQvLCAnJykgKyAnXFxuJztcblxuICAgIGlmICghbGFuZykge1xuICAgICAgcmV0dXJuICc8cHJlPjxjb2RlPidcbiAgICAgICAgKyAoZXNjYXBlZCA/IGNvZGUgOiBlc2NhcGUoY29kZSwgdHJ1ZSkpXG4gICAgICAgICsgJzwvY29kZT48L3ByZT5cXG4nO1xuICAgIH1cblxuICAgIHJldHVybiAnPHByZT48Y29kZSBjbGFzcz1cIidcbiAgICAgICsgdGhpcy5vcHRpb25zLmxhbmdQcmVmaXhcbiAgICAgICsgZXNjYXBlKGxhbmcpXG4gICAgICArICdcIj4nXG4gICAgICArIChlc2NhcGVkID8gY29kZSA6IGVzY2FwZShjb2RlLCB0cnVlKSlcbiAgICAgICsgJzwvY29kZT48L3ByZT5cXG4nO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBxdW90ZVxuICAgKi9cbiAgYmxvY2txdW90ZShxdW90ZSkge1xuICAgIHJldHVybiBgPGJsb2NrcXVvdGU+XFxuJHtxdW90ZX08L2Jsb2NrcXVvdGU+XFxuYDtcbiAgfVxuXG4gIGh0bWwoaHRtbCkge1xuICAgIHJldHVybiBodG1sO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0XG4gICAqIEBwYXJhbSB7c3RyaW5nfSBsZXZlbFxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmF3XG4gICAqIEBwYXJhbSB7YW55fSBzbHVnZ2VyXG4gICAqL1xuICBoZWFkaW5nKHRleHQsIGxldmVsLCByYXcsIHNsdWdnZXIpIHtcbiAgICBpZiAodGhpcy5vcHRpb25zLmhlYWRlcklkcykge1xuICAgICAgY29uc3QgaWQgPSB0aGlzLm9wdGlvbnMuaGVhZGVyUHJlZml4ICsgc2x1Z2dlci5zbHVnKHJhdyk7XG4gICAgICByZXR1cm4gYDxoJHtsZXZlbH0gaWQ9XCIke2lkfVwiPiR7dGV4dH08L2gke2xldmVsfT5cXG5gO1xuICAgIH1cblxuICAgIC8vIGlnbm9yZSBJRHNcbiAgICByZXR1cm4gYDxoJHtsZXZlbH0+JHt0ZXh0fTwvaCR7bGV2ZWx9PlxcbmA7XG4gIH1cblxuICBocigpIHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLnhodG1sID8gJzxoci8+XFxuJyA6ICc8aHI+XFxuJztcbiAgfVxuXG4gIGxpc3QoYm9keSwgb3JkZXJlZCwgc3RhcnQpIHtcbiAgICBjb25zdCB0eXBlID0gb3JkZXJlZCA/ICdvbCcgOiAndWwnLFxuICAgICAgc3RhcnRhdHQgPSAob3JkZXJlZCAmJiBzdGFydCAhPT0gMSkgPyAoJyBzdGFydD1cIicgKyBzdGFydCArICdcIicpIDogJyc7XG4gICAgcmV0dXJuICc8JyArIHR5cGUgKyBzdGFydGF0dCArICc+XFxuJyArIGJvZHkgKyAnPC8nICsgdHlwZSArICc+XFxuJztcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGV4dFxuICAgKi9cbiAgbGlzdGl0ZW0odGV4dCkge1xuICAgIHJldHVybiBgPGxpPiR7dGV4dH08L2xpPlxcbmA7XG4gIH1cblxuICBjaGVja2JveChjaGVja2VkKSB7XG4gICAgcmV0dXJuICc8aW5wdXQgJ1xuICAgICAgKyAoY2hlY2tlZCA/ICdjaGVja2VkPVwiXCIgJyA6ICcnKVxuICAgICAgKyAnZGlzYWJsZWQ9XCJcIiB0eXBlPVwiY2hlY2tib3hcIidcbiAgICAgICsgKHRoaXMub3B0aW9ucy54aHRtbCA/ICcgLycgOiAnJylcbiAgICAgICsgJz4gJztcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGV4dFxuICAgKi9cbiAgcGFyYWdyYXBoKHRleHQpIHtcbiAgICByZXR1cm4gYDxwPiR7dGV4dH08L3A+XFxuYDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gaGVhZGVyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBib2R5XG4gICAqL1xuICB0YWJsZShoZWFkZXIsIGJvZHkpIHtcbiAgICBpZiAoYm9keSkgYm9keSA9IGA8dGJvZHk+JHtib2R5fTwvdGJvZHk+YDtcblxuICAgIHJldHVybiAnPHRhYmxlPlxcbidcbiAgICAgICsgJzx0aGVhZD5cXG4nXG4gICAgICArIGhlYWRlclxuICAgICAgKyAnPC90aGVhZD5cXG4nXG4gICAgICArIGJvZHlcbiAgICAgICsgJzwvdGFibGU+XFxuJztcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gY29udGVudFxuICAgKi9cbiAgdGFibGVyb3coY29udGVudCkge1xuICAgIHJldHVybiBgPHRyPlxcbiR7Y29udGVudH08L3RyPlxcbmA7XG4gIH1cblxuICB0YWJsZWNlbGwoY29udGVudCwgZmxhZ3MpIHtcbiAgICBjb25zdCB0eXBlID0gZmxhZ3MuaGVhZGVyID8gJ3RoJyA6ICd0ZCc7XG4gICAgY29uc3QgdGFnID0gZmxhZ3MuYWxpZ25cbiAgICAgID8gYDwke3R5cGV9IGFsaWduPVwiJHtmbGFncy5hbGlnbn1cIj5gXG4gICAgICA6IGA8JHt0eXBlfT5gO1xuICAgIHJldHVybiB0YWcgKyBjb250ZW50ICsgYDwvJHt0eXBlfT5cXG5gO1xuICB9XG5cbiAgLyoqXG4gICAqIHNwYW4gbGV2ZWwgcmVuZGVyZXJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHRleHRcbiAgICovXG4gIHN0cm9uZyh0ZXh0KSB7XG4gICAgcmV0dXJuIGA8c3Ryb25nPiR7dGV4dH08L3N0cm9uZz5gO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0XG4gICAqL1xuICBlbSh0ZXh0KSB7XG4gICAgcmV0dXJuIGA8ZW0+JHt0ZXh0fTwvZW0+YDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGV4dFxuICAgKi9cbiAgY29kZXNwYW4odGV4dCkge1xuICAgIHJldHVybiBgPGNvZGU+JHt0ZXh0fTwvY29kZT5gO1xuICB9XG5cbiAgYnIoKSB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy54aHRtbCA/ICc8YnIvPicgOiAnPGJyPic7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IHRleHRcbiAgICovXG4gIGRlbCh0ZXh0KSB7XG4gICAgcmV0dXJuIGA8ZGVsPiR7dGV4dH08L2RlbD5gO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBocmVmXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0aXRsZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGV4dFxuICAgKi9cbiAgbGluayhocmVmLCB0aXRsZSwgdGV4dCkge1xuICAgIGhyZWYgPSBjbGVhblVybCh0aGlzLm9wdGlvbnMuc2FuaXRpemUsIHRoaXMub3B0aW9ucy5iYXNlVXJsLCBocmVmKTtcbiAgICBpZiAoaHJlZiA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRleHQ7XG4gICAgfVxuICAgIGxldCBvdXQgPSAnPGEgaHJlZj1cIicgKyBocmVmICsgJ1wiJztcbiAgICBpZiAodGl0bGUpIHtcbiAgICAgIG91dCArPSAnIHRpdGxlPVwiJyArIHRpdGxlICsgJ1wiJztcbiAgICB9XG4gICAgb3V0ICs9ICc+JyArIHRleHQgKyAnPC9hPic7XG4gICAgcmV0dXJuIG91dDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gaHJlZlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGl0bGVcbiAgICogQHBhcmFtIHtzdHJpbmd9IHRleHRcbiAgICovXG4gIGltYWdlKGhyZWYsIHRpdGxlLCB0ZXh0KSB7XG4gICAgaHJlZiA9IGNsZWFuVXJsKHRoaXMub3B0aW9ucy5zYW5pdGl6ZSwgdGhpcy5vcHRpb25zLmJhc2VVcmwsIGhyZWYpO1xuICAgIGlmIChocmVmID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gdGV4dDtcbiAgICB9XG5cbiAgICBsZXQgb3V0ID0gYDxpbWcgc3JjPVwiJHtocmVmfVwiIGFsdD1cIiR7dGV4dH1cImA7XG4gICAgaWYgKHRpdGxlKSB7XG4gICAgICBvdXQgKz0gYCB0aXRsZT1cIiR7dGl0bGV9XCJgO1xuICAgIH1cbiAgICBvdXQgKz0gdGhpcy5vcHRpb25zLnhodG1sID8gJy8+JyA6ICc+JztcbiAgICByZXR1cm4gb3V0O1xuICB9XG5cbiAgdGV4dCh0ZXh0KSB7XG4gICAgcmV0dXJuIHRleHQ7XG4gIH1cbn1cblxuLyoqXG4gKiBUZXh0UmVuZGVyZXJcbiAqIHJldHVybnMgb25seSB0aGUgdGV4dHVhbCBwYXJ0IG9mIHRoZSB0b2tlblxuICovXG5jbGFzcyBUZXh0UmVuZGVyZXIge1xuICAvLyBubyBuZWVkIGZvciBibG9jayBsZXZlbCByZW5kZXJlcnNcbiAgc3Ryb25nKHRleHQpIHtcbiAgICByZXR1cm4gdGV4dDtcbiAgfVxuXG4gIGVtKHRleHQpIHtcbiAgICByZXR1cm4gdGV4dDtcbiAgfVxuXG4gIGNvZGVzcGFuKHRleHQpIHtcbiAgICByZXR1cm4gdGV4dDtcbiAgfVxuXG4gIGRlbCh0ZXh0KSB7XG4gICAgcmV0dXJuIHRleHQ7XG4gIH1cblxuICBodG1sKHRleHQpIHtcbiAgICByZXR1cm4gdGV4dDtcbiAgfVxuXG4gIHRleHQodGV4dCkge1xuICAgIHJldHVybiB0ZXh0O1xuICB9XG5cbiAgbGluayhocmVmLCB0aXRsZSwgdGV4dCkge1xuICAgIHJldHVybiAnJyArIHRleHQ7XG4gIH1cblxuICBpbWFnZShocmVmLCB0aXRsZSwgdGV4dCkge1xuICAgIHJldHVybiAnJyArIHRleHQ7XG4gIH1cblxuICBicigpIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cbn1cblxuLyoqXG4gKiBTbHVnZ2VyIGdlbmVyYXRlcyBoZWFkZXIgaWRcbiAqL1xuY2xhc3MgU2x1Z2dlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuc2VlbiA9IHt9O1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZVxuICAgKi9cbiAgc2VyaWFsaXplKHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlXG4gICAgICAudG9Mb3dlckNhc2UoKVxuICAgICAgLnRyaW0oKVxuICAgICAgLy8gcmVtb3ZlIGh0bWwgdGFnc1xuICAgICAgLnJlcGxhY2UoLzxbIVxcL2Etel0uKj8+L2lnLCAnJylcbiAgICAgIC8vIHJlbW92ZSB1bndhbnRlZCBjaGFyc1xuICAgICAgLnJlcGxhY2UoL1tcXHUyMDAwLVxcdTIwNkZcXHUyRTAwLVxcdTJFN0ZcXFxcJyFcIiMkJSYoKSorLC4vOjs8PT4/QFtcXF1eYHt8fX5dL2csICcnKVxuICAgICAgLnJlcGxhY2UoL1xccy9nLCAnLScpO1xuICB9XG5cbiAgLyoqXG4gICAqIEZpbmRzIHRoZSBuZXh0IHNhZmUgKHVuaXF1ZSkgc2x1ZyB0byB1c2VcbiAgICogQHBhcmFtIHtzdHJpbmd9IG9yaWdpbmFsU2x1Z1xuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzRHJ5UnVuXG4gICAqL1xuICBnZXROZXh0U2FmZVNsdWcob3JpZ2luYWxTbHVnLCBpc0RyeVJ1bikge1xuICAgIGxldCBzbHVnID0gb3JpZ2luYWxTbHVnO1xuICAgIGxldCBvY2N1cmVuY2VBY2N1bXVsYXRvciA9IDA7XG4gICAgaWYgKHRoaXMuc2Vlbi5oYXNPd25Qcm9wZXJ0eShzbHVnKSkge1xuICAgICAgb2NjdXJlbmNlQWNjdW11bGF0b3IgPSB0aGlzLnNlZW5bb3JpZ2luYWxTbHVnXTtcbiAgICAgIGRvIHtcbiAgICAgICAgb2NjdXJlbmNlQWNjdW11bGF0b3IrKztcbiAgICAgICAgc2x1ZyA9IG9yaWdpbmFsU2x1ZyArICctJyArIG9jY3VyZW5jZUFjY3VtdWxhdG9yO1xuICAgICAgfSB3aGlsZSAodGhpcy5zZWVuLmhhc093blByb3BlcnR5KHNsdWcpKTtcbiAgICB9XG4gICAgaWYgKCFpc0RyeVJ1bikge1xuICAgICAgdGhpcy5zZWVuW29yaWdpbmFsU2x1Z10gPSBvY2N1cmVuY2VBY2N1bXVsYXRvcjtcbiAgICAgIHRoaXMuc2VlbltzbHVnXSA9IDA7XG4gICAgfVxuICAgIHJldHVybiBzbHVnO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnQgc3RyaW5nIHRvIHVuaXF1ZSBpZFxuICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuZHJ5cnVuXSBHZW5lcmF0ZXMgdGhlIG5leHQgdW5pcXVlIHNsdWcgd2l0aG91dFxuICAgKiB1cGRhdGluZyB0aGUgaW50ZXJuYWwgYWNjdW11bGF0b3IuXG4gICAqL1xuICBzbHVnKHZhbHVlLCBvcHRpb25zID0ge30pIHtcbiAgICBjb25zdCBzbHVnID0gdGhpcy5zZXJpYWxpemUodmFsdWUpO1xuICAgIHJldHVybiB0aGlzLmdldE5leHRTYWZlU2x1ZyhzbHVnLCBvcHRpb25zLmRyeXJ1bik7XG4gIH1cbn1cblxuLyoqXG4gKiBQYXJzaW5nICYgQ29tcGlsaW5nXG4gKi9cbmNsYXNzIFBhcnNlciB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IGRlZmF1bHRzO1xuICAgIHRoaXMub3B0aW9ucy5yZW5kZXJlciA9IHRoaXMub3B0aW9ucy5yZW5kZXJlciB8fCBuZXcgUmVuZGVyZXIoKTtcbiAgICB0aGlzLnJlbmRlcmVyID0gdGhpcy5vcHRpb25zLnJlbmRlcmVyO1xuICAgIHRoaXMucmVuZGVyZXIub3B0aW9ucyA9IHRoaXMub3B0aW9ucztcbiAgICB0aGlzLnRleHRSZW5kZXJlciA9IG5ldyBUZXh0UmVuZGVyZXIoKTtcbiAgICB0aGlzLnNsdWdnZXIgPSBuZXcgU2x1Z2dlcigpO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YXRpYyBQYXJzZSBNZXRob2RcbiAgICovXG4gIHN0YXRpYyBwYXJzZSh0b2tlbnMsIG9wdGlvbnMpIHtcbiAgICBjb25zdCBwYXJzZXIgPSBuZXcgUGFyc2VyKG9wdGlvbnMpO1xuICAgIHJldHVybiBwYXJzZXIucGFyc2UodG9rZW5zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGF0aWMgUGFyc2UgSW5saW5lIE1ldGhvZFxuICAgKi9cbiAgc3RhdGljIHBhcnNlSW5saW5lKHRva2Vucywgb3B0aW9ucykge1xuICAgIGNvbnN0IHBhcnNlciA9IG5ldyBQYXJzZXIob3B0aW9ucyk7XG4gICAgcmV0dXJuIHBhcnNlci5wYXJzZUlubGluZSh0b2tlbnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFBhcnNlIExvb3BcbiAgICovXG4gIHBhcnNlKHRva2VucywgdG9wID0gdHJ1ZSkge1xuICAgIGxldCBvdXQgPSAnJyxcbiAgICAgIGksXG4gICAgICBqLFxuICAgICAgayxcbiAgICAgIGwyLFxuICAgICAgbDMsXG4gICAgICByb3csXG4gICAgICBjZWxsLFxuICAgICAgaGVhZGVyLFxuICAgICAgYm9keSxcbiAgICAgIHRva2VuLFxuICAgICAgb3JkZXJlZCxcbiAgICAgIHN0YXJ0LFxuICAgICAgbG9vc2UsXG4gICAgICBpdGVtQm9keSxcbiAgICAgIGl0ZW0sXG4gICAgICBjaGVja2VkLFxuICAgICAgdGFzayxcbiAgICAgIGNoZWNrYm94LFxuICAgICAgcmV0O1xuXG4gICAgY29uc3QgbCA9IHRva2Vucy5sZW5ndGg7XG4gICAgZm9yIChpID0gMDsgaSA8IGw7IGkrKykge1xuICAgICAgdG9rZW4gPSB0b2tlbnNbaV07XG5cbiAgICAgIC8vIFJ1biBhbnkgcmVuZGVyZXIgZXh0ZW5zaW9uc1xuICAgICAgaWYgKHRoaXMub3B0aW9ucy5leHRlbnNpb25zICYmIHRoaXMub3B0aW9ucy5leHRlbnNpb25zLnJlbmRlcmVycyAmJiB0aGlzLm9wdGlvbnMuZXh0ZW5zaW9ucy5yZW5kZXJlcnNbdG9rZW4udHlwZV0pIHtcbiAgICAgICAgcmV0ID0gdGhpcy5vcHRpb25zLmV4dGVuc2lvbnMucmVuZGVyZXJzW3Rva2VuLnR5cGVdLmNhbGwoeyBwYXJzZXI6IHRoaXMgfSwgdG9rZW4pO1xuICAgICAgICBpZiAocmV0ICE9PSBmYWxzZSB8fCAhWydzcGFjZScsICdocicsICdoZWFkaW5nJywgJ2NvZGUnLCAndGFibGUnLCAnYmxvY2txdW90ZScsICdsaXN0JywgJ2h0bWwnLCAncGFyYWdyYXBoJywgJ3RleHQnXS5pbmNsdWRlcyh0b2tlbi50eXBlKSkge1xuICAgICAgICAgIG91dCArPSByZXQgfHwgJyc7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgc3dpdGNoICh0b2tlbi50eXBlKSB7XG4gICAgICAgIGNhc2UgJ3NwYWNlJzoge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgJ2hyJzoge1xuICAgICAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLmhyKCk7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAnaGVhZGluZyc6IHtcbiAgICAgICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5oZWFkaW5nKFxuICAgICAgICAgICAgdGhpcy5wYXJzZUlubGluZSh0b2tlbi50b2tlbnMpLFxuICAgICAgICAgICAgdG9rZW4uZGVwdGgsXG4gICAgICAgICAgICB1bmVzY2FwZSh0aGlzLnBhcnNlSW5saW5lKHRva2VuLnRva2VucywgdGhpcy50ZXh0UmVuZGVyZXIpKSxcbiAgICAgICAgICAgIHRoaXMuc2x1Z2dlcik7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAnY29kZSc6IHtcbiAgICAgICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5jb2RlKHRva2VuLnRleHQsXG4gICAgICAgICAgICB0b2tlbi5sYW5nLFxuICAgICAgICAgICAgdG9rZW4uZXNjYXBlZCk7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAndGFibGUnOiB7XG4gICAgICAgICAgaGVhZGVyID0gJyc7XG5cbiAgICAgICAgICAvLyBoZWFkZXJcbiAgICAgICAgICBjZWxsID0gJyc7XG4gICAgICAgICAgbDIgPSB0b2tlbi5oZWFkZXIubGVuZ3RoO1xuICAgICAgICAgIGZvciAoaiA9IDA7IGogPCBsMjsgaisrKSB7XG4gICAgICAgICAgICBjZWxsICs9IHRoaXMucmVuZGVyZXIudGFibGVjZWxsKFxuICAgICAgICAgICAgICB0aGlzLnBhcnNlSW5saW5lKHRva2VuLmhlYWRlcltqXS50b2tlbnMpLFxuICAgICAgICAgICAgICB7IGhlYWRlcjogdHJ1ZSwgYWxpZ246IHRva2VuLmFsaWduW2pdIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGhlYWRlciArPSB0aGlzLnJlbmRlcmVyLnRhYmxlcm93KGNlbGwpO1xuXG4gICAgICAgICAgYm9keSA9ICcnO1xuICAgICAgICAgIGwyID0gdG9rZW4ucm93cy5sZW5ndGg7XG4gICAgICAgICAgZm9yIChqID0gMDsgaiA8IGwyOyBqKyspIHtcbiAgICAgICAgICAgIHJvdyA9IHRva2VuLnJvd3Nbal07XG5cbiAgICAgICAgICAgIGNlbGwgPSAnJztcbiAgICAgICAgICAgIGwzID0gcm93Lmxlbmd0aDtcbiAgICAgICAgICAgIGZvciAoayA9IDA7IGsgPCBsMzsgaysrKSB7XG4gICAgICAgICAgICAgIGNlbGwgKz0gdGhpcy5yZW5kZXJlci50YWJsZWNlbGwoXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJzZUlubGluZShyb3dba10udG9rZW5zKSxcbiAgICAgICAgICAgICAgICB7IGhlYWRlcjogZmFsc2UsIGFsaWduOiB0b2tlbi5hbGlnbltrXSB9XG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGJvZHkgKz0gdGhpcy5yZW5kZXJlci50YWJsZXJvdyhjZWxsKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIudGFibGUoaGVhZGVyLCBib2R5KTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjYXNlICdibG9ja3F1b3RlJzoge1xuICAgICAgICAgIGJvZHkgPSB0aGlzLnBhcnNlKHRva2VuLnRva2Vucyk7XG4gICAgICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIuYmxvY2txdW90ZShib2R5KTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjYXNlICdsaXN0Jzoge1xuICAgICAgICAgIG9yZGVyZWQgPSB0b2tlbi5vcmRlcmVkO1xuICAgICAgICAgIHN0YXJ0ID0gdG9rZW4uc3RhcnQ7XG4gICAgICAgICAgbG9vc2UgPSB0b2tlbi5sb29zZTtcbiAgICAgICAgICBsMiA9IHRva2VuLml0ZW1zLmxlbmd0aDtcblxuICAgICAgICAgIGJvZHkgPSAnJztcbiAgICAgICAgICBmb3IgKGogPSAwOyBqIDwgbDI7IGorKykge1xuICAgICAgICAgICAgaXRlbSA9IHRva2VuLml0ZW1zW2pdO1xuICAgICAgICAgICAgY2hlY2tlZCA9IGl0ZW0uY2hlY2tlZDtcbiAgICAgICAgICAgIHRhc2sgPSBpdGVtLnRhc2s7XG5cbiAgICAgICAgICAgIGl0ZW1Cb2R5ID0gJyc7XG4gICAgICAgICAgICBpZiAoaXRlbS50YXNrKSB7XG4gICAgICAgICAgICAgIGNoZWNrYm94ID0gdGhpcy5yZW5kZXJlci5jaGVja2JveChjaGVja2VkKTtcbiAgICAgICAgICAgICAgaWYgKGxvb3NlKSB7XG4gICAgICAgICAgICAgICAgaWYgKGl0ZW0udG9rZW5zLmxlbmd0aCA+IDAgJiYgaXRlbS50b2tlbnNbMF0udHlwZSA9PT0gJ3BhcmFncmFwaCcpIHtcbiAgICAgICAgICAgICAgICAgIGl0ZW0udG9rZW5zWzBdLnRleHQgPSBjaGVja2JveCArICcgJyArIGl0ZW0udG9rZW5zWzBdLnRleHQ7XG4gICAgICAgICAgICAgICAgICBpZiAoaXRlbS50b2tlbnNbMF0udG9rZW5zICYmIGl0ZW0udG9rZW5zWzBdLnRva2Vucy5sZW5ndGggPiAwICYmIGl0ZW0udG9rZW5zWzBdLnRva2Vuc1swXS50eXBlID09PSAndGV4dCcpIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbS50b2tlbnNbMF0udG9rZW5zWzBdLnRleHQgPSBjaGVja2JveCArICcgJyArIGl0ZW0udG9rZW5zWzBdLnRva2Vuc1swXS50ZXh0O1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICBpdGVtLnRva2Vucy51bnNoaWZ0KHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3RleHQnLFxuICAgICAgICAgICAgICAgICAgICB0ZXh0OiBjaGVja2JveFxuICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGl0ZW1Cb2R5ICs9IGNoZWNrYm94O1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGl0ZW1Cb2R5ICs9IHRoaXMucGFyc2UoaXRlbS50b2tlbnMsIGxvb3NlKTtcbiAgICAgICAgICAgIGJvZHkgKz0gdGhpcy5yZW5kZXJlci5saXN0aXRlbShpdGVtQm9keSwgdGFzaywgY2hlY2tlZCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIubGlzdChib2R5LCBvcmRlcmVkLCBzdGFydCk7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAnaHRtbCc6IHtcbiAgICAgICAgICAvLyBUT0RPIHBhcnNlIGlubGluZSBjb250ZW50IGlmIHBhcmFtZXRlciBtYXJrZG93bj0xXG4gICAgICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIuaHRtbCh0b2tlbi50ZXh0KTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjYXNlICdwYXJhZ3JhcGgnOiB7XG4gICAgICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIucGFyYWdyYXBoKHRoaXMucGFyc2VJbmxpbmUodG9rZW4udG9rZW5zKSk7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAndGV4dCc6IHtcbiAgICAgICAgICBib2R5ID0gdG9rZW4udG9rZW5zID8gdGhpcy5wYXJzZUlubGluZSh0b2tlbi50b2tlbnMpIDogdG9rZW4udGV4dDtcbiAgICAgICAgICB3aGlsZSAoaSArIDEgPCBsICYmIHRva2Vuc1tpICsgMV0udHlwZSA9PT0gJ3RleHQnKSB7XG4gICAgICAgICAgICB0b2tlbiA9IHRva2Vuc1srK2ldO1xuICAgICAgICAgICAgYm9keSArPSAnXFxuJyArICh0b2tlbi50b2tlbnMgPyB0aGlzLnBhcnNlSW5saW5lKHRva2VuLnRva2VucykgOiB0b2tlbi50ZXh0KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgb3V0ICs9IHRvcCA/IHRoaXMucmVuZGVyZXIucGFyYWdyYXBoKGJvZHkpIDogYm9keTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICBjb25zdCBlcnJNc2cgPSAnVG9rZW4gd2l0aCBcIicgKyB0b2tlbi50eXBlICsgJ1wiIHR5cGUgd2FzIG5vdCBmb3VuZC4nO1xuICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuc2lsZW50KSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVyck1zZyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJNc2cpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBvdXQ7XG4gIH1cblxuICAvKipcbiAgICogUGFyc2UgSW5saW5lIFRva2Vuc1xuICAgKi9cbiAgcGFyc2VJbmxpbmUodG9rZW5zLCByZW5kZXJlcikge1xuICAgIHJlbmRlcmVyID0gcmVuZGVyZXIgfHwgdGhpcy5yZW5kZXJlcjtcbiAgICBsZXQgb3V0ID0gJycsXG4gICAgICBpLFxuICAgICAgdG9rZW4sXG4gICAgICByZXQ7XG5cbiAgICBjb25zdCBsID0gdG9rZW5zLmxlbmd0aDtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgICB0b2tlbiA9IHRva2Vuc1tpXTtcblxuICAgICAgLy8gUnVuIGFueSByZW5kZXJlciBleHRlbnNpb25zXG4gICAgICBpZiAodGhpcy5vcHRpb25zLmV4dGVuc2lvbnMgJiYgdGhpcy5vcHRpb25zLmV4dGVuc2lvbnMucmVuZGVyZXJzICYmIHRoaXMub3B0aW9ucy5leHRlbnNpb25zLnJlbmRlcmVyc1t0b2tlbi50eXBlXSkge1xuICAgICAgICByZXQgPSB0aGlzLm9wdGlvbnMuZXh0ZW5zaW9ucy5yZW5kZXJlcnNbdG9rZW4udHlwZV0uY2FsbCh7IHBhcnNlcjogdGhpcyB9LCB0b2tlbik7XG4gICAgICAgIGlmIChyZXQgIT09IGZhbHNlIHx8ICFbJ2VzY2FwZScsICdodG1sJywgJ2xpbmsnLCAnaW1hZ2UnLCAnc3Ryb25nJywgJ2VtJywgJ2NvZGVzcGFuJywgJ2JyJywgJ2RlbCcsICd0ZXh0J10uaW5jbHVkZXModG9rZW4udHlwZSkpIHtcbiAgICAgICAgICBvdXQgKz0gcmV0IHx8ICcnO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHN3aXRjaCAodG9rZW4udHlwZSkge1xuICAgICAgICBjYXNlICdlc2NhcGUnOiB7XG4gICAgICAgICAgb3V0ICs9IHJlbmRlcmVyLnRleHQodG9rZW4udGV4dCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAnaHRtbCc6IHtcbiAgICAgICAgICBvdXQgKz0gcmVuZGVyZXIuaHRtbCh0b2tlbi50ZXh0KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjYXNlICdsaW5rJzoge1xuICAgICAgICAgIG91dCArPSByZW5kZXJlci5saW5rKHRva2VuLmhyZWYsIHRva2VuLnRpdGxlLCB0aGlzLnBhcnNlSW5saW5lKHRva2VuLnRva2VucywgcmVuZGVyZXIpKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjYXNlICdpbWFnZSc6IHtcbiAgICAgICAgICBvdXQgKz0gcmVuZGVyZXIuaW1hZ2UodG9rZW4uaHJlZiwgdG9rZW4udGl0bGUsIHRva2VuLnRleHQpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgJ3N0cm9uZyc6IHtcbiAgICAgICAgICBvdXQgKz0gcmVuZGVyZXIuc3Ryb25nKHRoaXMucGFyc2VJbmxpbmUodG9rZW4udG9rZW5zLCByZW5kZXJlcikpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgJ2VtJzoge1xuICAgICAgICAgIG91dCArPSByZW5kZXJlci5lbSh0aGlzLnBhcnNlSW5saW5lKHRva2VuLnRva2VucywgcmVuZGVyZXIpKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjYXNlICdjb2Rlc3Bhbic6IHtcbiAgICAgICAgICBvdXQgKz0gcmVuZGVyZXIuY29kZXNwYW4odG9rZW4udGV4dCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAnYnInOiB7XG4gICAgICAgICAgb3V0ICs9IHJlbmRlcmVyLmJyKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAnZGVsJzoge1xuICAgICAgICAgIG91dCArPSByZW5kZXJlci5kZWwodGhpcy5wYXJzZUlubGluZSh0b2tlbi50b2tlbnMsIHJlbmRlcmVyKSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAndGV4dCc6IHtcbiAgICAgICAgICBvdXQgKz0gcmVuZGVyZXIudGV4dCh0b2tlbi50ZXh0KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBkZWZhdWx0OiB7XG4gICAgICAgICAgY29uc3QgZXJyTXNnID0gJ1Rva2VuIHdpdGggXCInICsgdG9rZW4udHlwZSArICdcIiB0eXBlIHdhcyBub3QgZm91bmQuJztcbiAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnNpbGVudCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJNc2cpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyTXNnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG91dDtcbiAgfVxufVxuXG5jbGFzcyBIb29rcyB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IGRlZmF1bHRzO1xuICB9XG5cbiAgc3RhdGljIHBhc3NUaHJvdWdoSG9va3MgPSBuZXcgU2V0KFtcbiAgICAncHJlcHJvY2VzcycsXG4gICAgJ3Bvc3Rwcm9jZXNzJ1xuICBdKTtcblxuICAvKipcbiAgICogUHJvY2VzcyBtYXJrZG93biBiZWZvcmUgbWFya2VkXG4gICAqL1xuICBwcmVwcm9jZXNzKG1hcmtkb3duKSB7XG4gICAgcmV0dXJuIG1hcmtkb3duO1xuICB9XG5cbiAgLyoqXG4gICAqIFByb2Nlc3MgSFRNTCBhZnRlciBtYXJrZWQgaXMgZmluaXNoZWRcbiAgICovXG4gIHBvc3Rwcm9jZXNzKGh0bWwpIHtcbiAgICByZXR1cm4gaHRtbDtcbiAgfVxufVxuXG5mdW5jdGlvbiBvbkVycm9yKHNpbGVudCwgYXN5bmMsIGNhbGxiYWNrKSB7XG4gIHJldHVybiAoZSkgPT4ge1xuICAgIGUubWVzc2FnZSArPSAnXFxuUGxlYXNlIHJlcG9ydCB0aGlzIHRvIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXJrZWRqcy9tYXJrZWQuJztcblxuICAgIGlmIChzaWxlbnQpIHtcbiAgICAgIGNvbnN0IG1zZyA9ICc8cD5BbiBlcnJvciBvY2N1cnJlZDo8L3A+PHByZT4nXG4gICAgICAgICsgZXNjYXBlKGUubWVzc2FnZSArICcnLCB0cnVlKVxuICAgICAgICArICc8L3ByZT4nO1xuICAgICAgaWYgKGFzeW5jKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobXNnKTtcbiAgICAgIH1cbiAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayhudWxsLCBtc2cpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICByZXR1cm4gbXNnO1xuICAgIH1cblxuICAgIGlmIChhc3luYykge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGUpO1xuICAgIH1cbiAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgIGNhbGxiYWNrKGUpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aHJvdyBlO1xuICB9O1xufVxuXG5mdW5jdGlvbiBwYXJzZU1hcmtkb3duKGxleGVyLCBwYXJzZXIpIHtcbiAgcmV0dXJuIChzcmMsIG9wdCwgY2FsbGJhY2spID0+IHtcbiAgICBpZiAodHlwZW9mIG9wdCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY2FsbGJhY2sgPSBvcHQ7XG4gICAgICBvcHQgPSBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IG9yaWdPcHQgPSB7IC4uLm9wdCB9O1xuICAgIG9wdCA9IHsgLi4ubWFya2VkLmRlZmF1bHRzLCAuLi5vcmlnT3B0IH07XG4gICAgY29uc3QgdGhyb3dFcnJvciA9IG9uRXJyb3Iob3B0LnNpbGVudCwgb3B0LmFzeW5jLCBjYWxsYmFjayk7XG5cbiAgICAvLyB0aHJvdyBlcnJvciBpbiBjYXNlIG9mIG5vbiBzdHJpbmcgaW5wdXRcbiAgICBpZiAodHlwZW9mIHNyYyA9PT0gJ3VuZGVmaW5lZCcgfHwgc3JjID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhyb3dFcnJvcihuZXcgRXJyb3IoJ21hcmtlZCgpOiBpbnB1dCBwYXJhbWV0ZXIgaXMgdW5kZWZpbmVkIG9yIG51bGwnKSk7XG4gICAgfVxuICAgIGlmICh0eXBlb2Ygc3JjICE9PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuIHRocm93RXJyb3IobmV3IEVycm9yKCdtYXJrZWQoKTogaW5wdXQgcGFyYW1ldGVyIGlzIG9mIHR5cGUgJ1xuICAgICAgICArIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChzcmMpICsgJywgc3RyaW5nIGV4cGVjdGVkJykpO1xuICAgIH1cblxuICAgIGNoZWNrU2FuaXRpemVEZXByZWNhdGlvbihvcHQpO1xuXG4gICAgaWYgKG9wdC5ob29rcykge1xuICAgICAgb3B0Lmhvb2tzLm9wdGlvbnMgPSBvcHQ7XG4gICAgfVxuXG4gICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICBjb25zdCBoaWdobGlnaHQgPSBvcHQuaGlnaGxpZ2h0O1xuICAgICAgbGV0IHRva2VucztcblxuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKG9wdC5ob29rcykge1xuICAgICAgICAgIHNyYyA9IG9wdC5ob29rcy5wcmVwcm9jZXNzKHNyYyk7XG4gICAgICAgIH1cbiAgICAgICAgdG9rZW5zID0gbGV4ZXIoc3JjLCBvcHQpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICByZXR1cm4gdGhyb3dFcnJvcihlKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgZG9uZSA9IGZ1bmN0aW9uKGVycikge1xuICAgICAgICBsZXQgb3V0O1xuXG4gICAgICAgIGlmICghZXJyKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmIChvcHQud2Fsa1Rva2Vucykge1xuICAgICAgICAgICAgICBtYXJrZWQud2Fsa1Rva2Vucyh0b2tlbnMsIG9wdC53YWxrVG9rZW5zKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG91dCA9IHBhcnNlcih0b2tlbnMsIG9wdCk7XG4gICAgICAgICAgICBpZiAob3B0Lmhvb2tzKSB7XG4gICAgICAgICAgICAgIG91dCA9IG9wdC5ob29rcy5wb3N0cHJvY2VzcyhvdXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGVyciA9IGU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgb3B0LmhpZ2hsaWdodCA9IGhpZ2hsaWdodDtcblxuICAgICAgICByZXR1cm4gZXJyXG4gICAgICAgICAgPyB0aHJvd0Vycm9yKGVycilcbiAgICAgICAgICA6IGNhbGxiYWNrKG51bGwsIG91dCk7XG4gICAgICB9O1xuXG4gICAgICBpZiAoIWhpZ2hsaWdodCB8fCBoaWdobGlnaHQubGVuZ3RoIDwgMykge1xuICAgICAgICByZXR1cm4gZG9uZSgpO1xuICAgICAgfVxuXG4gICAgICBkZWxldGUgb3B0LmhpZ2hsaWdodDtcblxuICAgICAgaWYgKCF0b2tlbnMubGVuZ3RoKSByZXR1cm4gZG9uZSgpO1xuXG4gICAgICBsZXQgcGVuZGluZyA9IDA7XG4gICAgICBtYXJrZWQud2Fsa1Rva2Vucyh0b2tlbnMsIGZ1bmN0aW9uKHRva2VuKSB7XG4gICAgICAgIGlmICh0b2tlbi50eXBlID09PSAnY29kZScpIHtcbiAgICAgICAgICBwZW5kaW5nKys7XG4gICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBoaWdobGlnaHQodG9rZW4udGV4dCwgdG9rZW4ubGFuZywgZnVuY3Rpb24oZXJyLCBjb2RlKSB7XG4gICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZG9uZShlcnIpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmIChjb2RlICE9IG51bGwgJiYgY29kZSAhPT0gdG9rZW4udGV4dCkge1xuICAgICAgICAgICAgICAgIHRva2VuLnRleHQgPSBjb2RlO1xuICAgICAgICAgICAgICAgIHRva2VuLmVzY2FwZWQgPSB0cnVlO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgcGVuZGluZy0tO1xuICAgICAgICAgICAgICBpZiAocGVuZGluZyA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGRvbmUoKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSwgMCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBpZiAocGVuZGluZyA9PT0gMCkge1xuICAgICAgICBkb25lKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAob3B0LmFzeW5jKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG9wdC5ob29rcyA/IG9wdC5ob29rcy5wcmVwcm9jZXNzKHNyYykgOiBzcmMpXG4gICAgICAgIC50aGVuKHNyYyA9PiBsZXhlcihzcmMsIG9wdCkpXG4gICAgICAgIC50aGVuKHRva2VucyA9PiBvcHQud2Fsa1Rva2VucyA/IFByb21pc2UuYWxsKG1hcmtlZC53YWxrVG9rZW5zKHRva2Vucywgb3B0LndhbGtUb2tlbnMpKS50aGVuKCgpID0+IHRva2VucykgOiB0b2tlbnMpXG4gICAgICAgIC50aGVuKHRva2VucyA9PiBwYXJzZXIodG9rZW5zLCBvcHQpKVxuICAgICAgICAudGhlbihodG1sID0+IG9wdC5ob29rcyA/IG9wdC5ob29rcy5wb3N0cHJvY2VzcyhodG1sKSA6IGh0bWwpXG4gICAgICAgIC5jYXRjaCh0aHJvd0Vycm9yKTtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgaWYgKG9wdC5ob29rcykge1xuICAgICAgICBzcmMgPSBvcHQuaG9va3MucHJlcHJvY2VzcyhzcmMpO1xuICAgICAgfVxuICAgICAgY29uc3QgdG9rZW5zID0gbGV4ZXIoc3JjLCBvcHQpO1xuICAgICAgaWYgKG9wdC53YWxrVG9rZW5zKSB7XG4gICAgICAgIG1hcmtlZC53YWxrVG9rZW5zKHRva2Vucywgb3B0LndhbGtUb2tlbnMpO1xuICAgICAgfVxuICAgICAgbGV0IGh0bWwgPSBwYXJzZXIodG9rZW5zLCBvcHQpO1xuICAgICAgaWYgKG9wdC5ob29rcykge1xuICAgICAgICBodG1sID0gb3B0Lmhvb2tzLnBvc3Rwcm9jZXNzKGh0bWwpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGh0bWw7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIHRocm93RXJyb3IoZSk7XG4gICAgfVxuICB9O1xufVxuXG4vKipcbiAqIE1hcmtlZFxuICovXG5mdW5jdGlvbiBtYXJrZWQoc3JjLCBvcHQsIGNhbGxiYWNrKSB7XG4gIHJldHVybiBwYXJzZU1hcmtkb3duKExleGVyLmxleCwgUGFyc2VyLnBhcnNlKShzcmMsIG9wdCwgY2FsbGJhY2spO1xufVxuXG4vKipcbiAqIE9wdGlvbnNcbiAqL1xuXG5tYXJrZWQub3B0aW9ucyA9XG5tYXJrZWQuc2V0T3B0aW9ucyA9IGZ1bmN0aW9uKG9wdCkge1xuICBtYXJrZWQuZGVmYXVsdHMgPSB7IC4uLm1hcmtlZC5kZWZhdWx0cywgLi4ub3B0IH07XG4gIGNoYW5nZURlZmF1bHRzKG1hcmtlZC5kZWZhdWx0cyk7XG4gIHJldHVybiBtYXJrZWQ7XG59O1xuXG5tYXJrZWQuZ2V0RGVmYXVsdHMgPSBnZXREZWZhdWx0cztcblxubWFya2VkLmRlZmF1bHRzID0gZGVmYXVsdHM7XG5cbi8qKlxuICogVXNlIEV4dGVuc2lvblxuICovXG5cbm1hcmtlZC51c2UgPSBmdW5jdGlvbiguLi5hcmdzKSB7XG4gIGNvbnN0IGV4dGVuc2lvbnMgPSBtYXJrZWQuZGVmYXVsdHMuZXh0ZW5zaW9ucyB8fCB7IHJlbmRlcmVyczoge30sIGNoaWxkVG9rZW5zOiB7fSB9O1xuXG4gIGFyZ3MuZm9yRWFjaCgocGFjaykgPT4ge1xuICAgIC8vIGNvcHkgb3B0aW9ucyB0byBuZXcgb2JqZWN0XG4gICAgY29uc3Qgb3B0cyA9IHsgLi4ucGFjayB9O1xuXG4gICAgLy8gc2V0IGFzeW5jIHRvIHRydWUgaWYgaXQgd2FzIHNldCB0byB0cnVlIGJlZm9yZVxuICAgIG9wdHMuYXN5bmMgPSBtYXJrZWQuZGVmYXVsdHMuYXN5bmMgfHwgb3B0cy5hc3luYyB8fCBmYWxzZTtcblxuICAgIC8vID09LS0gUGFyc2UgXCJhZGRvblwiIGV4dGVuc2lvbnMgLS09PSAvL1xuICAgIGlmIChwYWNrLmV4dGVuc2lvbnMpIHtcbiAgICAgIHBhY2suZXh0ZW5zaW9ucy5mb3JFYWNoKChleHQpID0+IHtcbiAgICAgICAgaWYgKCFleHQubmFtZSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignZXh0ZW5zaW9uIG5hbWUgcmVxdWlyZWQnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZXh0LnJlbmRlcmVyKSB7IC8vIFJlbmRlcmVyIGV4dGVuc2lvbnNcbiAgICAgICAgICBjb25zdCBwcmV2UmVuZGVyZXIgPSBleHRlbnNpb25zLnJlbmRlcmVyc1tleHQubmFtZV07XG4gICAgICAgICAgaWYgKHByZXZSZW5kZXJlcikge1xuICAgICAgICAgICAgLy8gUmVwbGFjZSBleHRlbnNpb24gd2l0aCBmdW5jIHRvIHJ1biBuZXcgZXh0ZW5zaW9uIGJ1dCBmYWxsIGJhY2sgaWYgZmFsc2VcbiAgICAgICAgICAgIGV4dGVuc2lvbnMucmVuZGVyZXJzW2V4dC5uYW1lXSA9IGZ1bmN0aW9uKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgICAgbGV0IHJldCA9IGV4dC5yZW5kZXJlci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICAgICAgaWYgKHJldCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICByZXQgPSBwcmV2UmVuZGVyZXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIHJldDtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGV4dGVuc2lvbnMucmVuZGVyZXJzW2V4dC5uYW1lXSA9IGV4dC5yZW5kZXJlcjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGV4dC50b2tlbml6ZXIpIHsgLy8gVG9rZW5pemVyIEV4dGVuc2lvbnNcbiAgICAgICAgICBpZiAoIWV4dC5sZXZlbCB8fCAoZXh0LmxldmVsICE9PSAnYmxvY2snICYmIGV4dC5sZXZlbCAhPT0gJ2lubGluZScpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJleHRlbnNpb24gbGV2ZWwgbXVzdCBiZSAnYmxvY2snIG9yICdpbmxpbmUnXCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoZXh0ZW5zaW9uc1tleHQubGV2ZWxdKSB7XG4gICAgICAgICAgICBleHRlbnNpb25zW2V4dC5sZXZlbF0udW5zaGlmdChleHQudG9rZW5pemVyKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZXh0ZW5zaW9uc1tleHQubGV2ZWxdID0gW2V4dC50b2tlbml6ZXJdO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoZXh0LnN0YXJ0KSB7IC8vIEZ1bmN0aW9uIHRvIGNoZWNrIGZvciBzdGFydCBvZiB0b2tlblxuICAgICAgICAgICAgaWYgKGV4dC5sZXZlbCA9PT0gJ2Jsb2NrJykge1xuICAgICAgICAgICAgICBpZiAoZXh0ZW5zaW9ucy5zdGFydEJsb2NrKSB7XG4gICAgICAgICAgICAgICAgZXh0ZW5zaW9ucy5zdGFydEJsb2NrLnB1c2goZXh0LnN0YXJ0KTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBleHRlbnNpb25zLnN0YXJ0QmxvY2sgPSBbZXh0LnN0YXJ0XTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChleHQubGV2ZWwgPT09ICdpbmxpbmUnKSB7XG4gICAgICAgICAgICAgIGlmIChleHRlbnNpb25zLnN0YXJ0SW5saW5lKSB7XG4gICAgICAgICAgICAgICAgZXh0ZW5zaW9ucy5zdGFydElubGluZS5wdXNoKGV4dC5zdGFydCk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZXh0ZW5zaW9ucy5zdGFydElubGluZSA9IFtleHQuc3RhcnRdO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChleHQuY2hpbGRUb2tlbnMpIHsgLy8gQ2hpbGQgdG9rZW5zIHRvIGJlIHZpc2l0ZWQgYnkgd2Fsa1Rva2Vuc1xuICAgICAgICAgIGV4dGVuc2lvbnMuY2hpbGRUb2tlbnNbZXh0Lm5hbWVdID0gZXh0LmNoaWxkVG9rZW5zO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIG9wdHMuZXh0ZW5zaW9ucyA9IGV4dGVuc2lvbnM7XG4gICAgfVxuXG4gICAgLy8gPT0tLSBQYXJzZSBcIm92ZXJ3cml0ZVwiIGV4dGVuc2lvbnMgLS09PSAvL1xuICAgIGlmIChwYWNrLnJlbmRlcmVyKSB7XG4gICAgICBjb25zdCByZW5kZXJlciA9IG1hcmtlZC5kZWZhdWx0cy5yZW5kZXJlciB8fCBuZXcgUmVuZGVyZXIoKTtcbiAgICAgIGZvciAoY29uc3QgcHJvcCBpbiBwYWNrLnJlbmRlcmVyKSB7XG4gICAgICAgIGNvbnN0IHByZXZSZW5kZXJlciA9IHJlbmRlcmVyW3Byb3BdO1xuICAgICAgICAvLyBSZXBsYWNlIHJlbmRlcmVyIHdpdGggZnVuYyB0byBydW4gZXh0ZW5zaW9uLCBidXQgZmFsbCBiYWNrIGlmIGZhbHNlXG4gICAgICAgIHJlbmRlcmVyW3Byb3BdID0gKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgICBsZXQgcmV0ID0gcGFjay5yZW5kZXJlcltwcm9wXS5hcHBseShyZW5kZXJlciwgYXJncyk7XG4gICAgICAgICAgaWYgKHJldCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHJldCA9IHByZXZSZW5kZXJlci5hcHBseShyZW5kZXJlciwgYXJncyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiByZXQ7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBvcHRzLnJlbmRlcmVyID0gcmVuZGVyZXI7XG4gICAgfVxuICAgIGlmIChwYWNrLnRva2VuaXplcikge1xuICAgICAgY29uc3QgdG9rZW5pemVyID0gbWFya2VkLmRlZmF1bHRzLnRva2VuaXplciB8fCBuZXcgVG9rZW5pemVyKCk7XG4gICAgICBmb3IgKGNvbnN0IHByb3AgaW4gcGFjay50b2tlbml6ZXIpIHtcbiAgICAgICAgY29uc3QgcHJldlRva2VuaXplciA9IHRva2VuaXplcltwcm9wXTtcbiAgICAgICAgLy8gUmVwbGFjZSB0b2tlbml6ZXIgd2l0aCBmdW5jIHRvIHJ1biBleHRlbnNpb24sIGJ1dCBmYWxsIGJhY2sgaWYgZmFsc2VcbiAgICAgICAgdG9rZW5pemVyW3Byb3BdID0gKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgICBsZXQgcmV0ID0gcGFjay50b2tlbml6ZXJbcHJvcF0uYXBwbHkodG9rZW5pemVyLCBhcmdzKTtcbiAgICAgICAgICBpZiAocmV0ID09PSBmYWxzZSkge1xuICAgICAgICAgICAgcmV0ID0gcHJldlRva2VuaXplci5hcHBseSh0b2tlbml6ZXIsIGFyZ3MpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gcmV0O1xuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgb3B0cy50b2tlbml6ZXIgPSB0b2tlbml6ZXI7XG4gICAgfVxuXG4gICAgLy8gPT0tLSBQYXJzZSBIb29rcyBleHRlbnNpb25zIC0tPT0gLy9cbiAgICBpZiAocGFjay5ob29rcykge1xuICAgICAgY29uc3QgaG9va3MgPSBtYXJrZWQuZGVmYXVsdHMuaG9va3MgfHwgbmV3IEhvb2tzKCk7XG4gICAgICBmb3IgKGNvbnN0IHByb3AgaW4gcGFjay5ob29rcykge1xuICAgICAgICBjb25zdCBwcmV2SG9vayA9IGhvb2tzW3Byb3BdO1xuICAgICAgICBpZiAoSG9va3MucGFzc1Rocm91Z2hIb29rcy5oYXMocHJvcCkpIHtcbiAgICAgICAgICBob29rc1twcm9wXSA9IChhcmcpID0+IHtcbiAgICAgICAgICAgIGlmIChtYXJrZWQuZGVmYXVsdHMuYXN5bmMpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShwYWNrLmhvb2tzW3Byb3BdLmNhbGwoaG9va3MsIGFyZykpLnRoZW4ocmV0ID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJldkhvb2suY2FsbChob29rcywgcmV0KTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHJldCA9IHBhY2suaG9va3NbcHJvcF0uY2FsbChob29rcywgYXJnKTtcbiAgICAgICAgICAgIHJldHVybiBwcmV2SG9vay5jYWxsKGhvb2tzLCByZXQpO1xuICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaG9va3NbcHJvcF0gPSAoLi4uYXJncykgPT4ge1xuICAgICAgICAgICAgbGV0IHJldCA9IHBhY2suaG9va3NbcHJvcF0uYXBwbHkoaG9va3MsIGFyZ3MpO1xuICAgICAgICAgICAgaWYgKHJldCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgcmV0ID0gcHJldkhvb2suYXBwbHkoaG9va3MsIGFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJldDtcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBvcHRzLmhvb2tzID0gaG9va3M7XG4gICAgfVxuXG4gICAgLy8gPT0tLSBQYXJzZSBXYWxrVG9rZW5zIGV4dGVuc2lvbnMgLS09PSAvL1xuICAgIGlmIChwYWNrLndhbGtUb2tlbnMpIHtcbiAgICAgIGNvbnN0IHdhbGtUb2tlbnMgPSBtYXJrZWQuZGVmYXVsdHMud2Fsa1Rva2VucztcbiAgICAgIG9wdHMud2Fsa1Rva2VucyA9IGZ1bmN0aW9uKHRva2VuKSB7XG4gICAgICAgIGxldCB2YWx1ZXMgPSBbXTtcbiAgICAgICAgdmFsdWVzLnB1c2gocGFjay53YWxrVG9rZW5zLmNhbGwodGhpcywgdG9rZW4pKTtcbiAgICAgICAgaWYgKHdhbGtUb2tlbnMpIHtcbiAgICAgICAgICB2YWx1ZXMgPSB2YWx1ZXMuY29uY2F0KHdhbGtUb2tlbnMuY2FsbCh0aGlzLCB0b2tlbikpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2YWx1ZXM7XG4gICAgICB9O1xuICAgIH1cblxuICAgIG1hcmtlZC5zZXRPcHRpb25zKG9wdHMpO1xuICB9KTtcbn07XG5cbi8qKlxuICogUnVuIGNhbGxiYWNrIGZvciBldmVyeSB0b2tlblxuICovXG5cbm1hcmtlZC53YWxrVG9rZW5zID0gZnVuY3Rpb24odG9rZW5zLCBjYWxsYmFjaykge1xuICBsZXQgdmFsdWVzID0gW107XG4gIGZvciAoY29uc3QgdG9rZW4gb2YgdG9rZW5zKSB7XG4gICAgdmFsdWVzID0gdmFsdWVzLmNvbmNhdChjYWxsYmFjay5jYWxsKG1hcmtlZCwgdG9rZW4pKTtcbiAgICBzd2l0Y2ggKHRva2VuLnR5cGUpIHtcbiAgICAgIGNhc2UgJ3RhYmxlJzoge1xuICAgICAgICBmb3IgKGNvbnN0IGNlbGwgb2YgdG9rZW4uaGVhZGVyKSB7XG4gICAgICAgICAgdmFsdWVzID0gdmFsdWVzLmNvbmNhdChtYXJrZWQud2Fsa1Rva2VucyhjZWxsLnRva2VucywgY2FsbGJhY2spKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IHJvdyBvZiB0b2tlbi5yb3dzKSB7XG4gICAgICAgICAgZm9yIChjb25zdCBjZWxsIG9mIHJvdykge1xuICAgICAgICAgICAgdmFsdWVzID0gdmFsdWVzLmNvbmNhdChtYXJrZWQud2Fsa1Rva2VucyhjZWxsLnRva2VucywgY2FsbGJhY2spKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjYXNlICdsaXN0Jzoge1xuICAgICAgICB2YWx1ZXMgPSB2YWx1ZXMuY29uY2F0KG1hcmtlZC53YWxrVG9rZW5zKHRva2VuLml0ZW1zLCBjYWxsYmFjaykpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgaWYgKG1hcmtlZC5kZWZhdWx0cy5leHRlbnNpb25zICYmIG1hcmtlZC5kZWZhdWx0cy5leHRlbnNpb25zLmNoaWxkVG9rZW5zICYmIG1hcmtlZC5kZWZhdWx0cy5leHRlbnNpb25zLmNoaWxkVG9rZW5zW3Rva2VuLnR5cGVdKSB7IC8vIFdhbGsgYW55IGV4dGVuc2lvbnNcbiAgICAgICAgICBtYXJrZWQuZGVmYXVsdHMuZXh0ZW5zaW9ucy5jaGlsZFRva2Vuc1t0b2tlbi50eXBlXS5mb3JFYWNoKGZ1bmN0aW9uKGNoaWxkVG9rZW5zKSB7XG4gICAgICAgICAgICB2YWx1ZXMgPSB2YWx1ZXMuY29uY2F0KG1hcmtlZC53YWxrVG9rZW5zKHRva2VuW2NoaWxkVG9rZW5zXSwgY2FsbGJhY2spKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIGlmICh0b2tlbi50b2tlbnMpIHtcbiAgICAgICAgICB2YWx1ZXMgPSB2YWx1ZXMuY29uY2F0KG1hcmtlZC53YWxrVG9rZW5zKHRva2VuLnRva2VucywgY2FsbGJhY2spKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gdmFsdWVzO1xufTtcblxuLyoqXG4gKiBQYXJzZSBJbmxpbmVcbiAqIEBwYXJhbSB7c3RyaW5nfSBzcmNcbiAqL1xubWFya2VkLnBhcnNlSW5saW5lID0gcGFyc2VNYXJrZG93bihMZXhlci5sZXhJbmxpbmUsIFBhcnNlci5wYXJzZUlubGluZSk7XG5cbi8qKlxuICogRXhwb3NlXG4gKi9cbm1hcmtlZC5QYXJzZXIgPSBQYXJzZXI7XG5tYXJrZWQucGFyc2VyID0gUGFyc2VyLnBhcnNlO1xubWFya2VkLlJlbmRlcmVyID0gUmVuZGVyZXI7XG5tYXJrZWQuVGV4dFJlbmRlcmVyID0gVGV4dFJlbmRlcmVyO1xubWFya2VkLkxleGVyID0gTGV4ZXI7XG5tYXJrZWQubGV4ZXIgPSBMZXhlci5sZXg7XG5tYXJrZWQuVG9rZW5pemVyID0gVG9rZW5pemVyO1xubWFya2VkLlNsdWdnZXIgPSBTbHVnZ2VyO1xubWFya2VkLkhvb2tzID0gSG9va3M7XG5tYXJrZWQucGFyc2UgPSBtYXJrZWQ7XG5cbmNvbnN0IG9wdGlvbnMgPSBtYXJrZWQub3B0aW9ucztcbmNvbnN0IHNldE9wdGlvbnMgPSBtYXJrZWQuc2V0T3B0aW9ucztcbmNvbnN0IHVzZSA9IG1hcmtlZC51c2U7XG5jb25zdCB3YWxrVG9rZW5zID0gbWFya2VkLndhbGtUb2tlbnM7XG5jb25zdCBwYXJzZUlubGluZSA9IG1hcmtlZC5wYXJzZUlubGluZTtcbmNvbnN0IHBhcnNlID0gbWFya2VkO1xuY29uc3QgcGFyc2VyID0gUGFyc2VyLnBhcnNlO1xuY29uc3QgbGV4ZXIgPSBMZXhlci5sZXg7XG5cbmV4cG9ydCB7IEhvb2tzLCBMZXhlciwgUGFyc2VyLCBSZW5kZXJlciwgU2x1Z2dlciwgVGV4dFJlbmRlcmVyLCBUb2tlbml6ZXIsIGRlZmF1bHRzLCBnZXREZWZhdWx0cywgbGV4ZXIsIG1hcmtlZCwgb3B0aW9ucywgcGFyc2UsIHBhcnNlSW5saW5lLCBwYXJzZXIsIHNldE9wdGlvbnMsIHVzZSwgd2Fsa1Rva2VucyB9O1xuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcblx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG5cdFx0ZnVuY3Rpb24oKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG5cdFx0ZnVuY3Rpb24oKSB7IHJldHVybiBtb2R1bGU7IH07XG5cdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsIHsgYTogZ2V0dGVyIH0pO1xuXHRyZXR1cm4gZ2V0dGVyO1xufTsiLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBkZWZpbml0aW9uKSB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iaiwgcHJvcCkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCk7IH0iLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsInZhciBfX2Fzc2lnbiA9ICh0aGlzICYmIHRoaXMuX19hc3NpZ24pIHx8IGZ1bmN0aW9uICgpIHtcbiAgICBfX2Fzc2lnbiA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24odCkge1xuICAgICAgICBmb3IgKHZhciBzLCBpID0gMSwgbiA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBuOyBpKyspIHtcbiAgICAgICAgICAgIHMgPSBhcmd1bWVudHNbaV07XG4gICAgICAgICAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkpXG4gICAgICAgICAgICAgICAgdFtwXSA9IHNbcF07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHQ7XG4gICAgfTtcbiAgICByZXR1cm4gX19hc3NpZ24uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn07XG52YXIgX19hd2FpdGVyID0gKHRoaXMgJiYgdGhpcy5fX2F3YWl0ZXIpIHx8IGZ1bmN0aW9uICh0aGlzQXJnLCBfYXJndW1lbnRzLCBQLCBnZW5lcmF0b3IpIHtcbiAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH1cbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgZnVuY3Rpb24gZnVsZmlsbGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yLm5leHQodmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cbiAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpO1xuICAgIH0pO1xufTtcbnZhciBfX2dlbmVyYXRvciA9ICh0aGlzICYmIHRoaXMuX19nZW5lcmF0b3IpIHx8IGZ1bmN0aW9uICh0aGlzQXJnLCBib2R5KSB7XG4gICAgdmFyIF8gPSB7IGxhYmVsOiAwLCBzZW50OiBmdW5jdGlvbigpIHsgaWYgKHRbMF0gJiAxKSB0aHJvdyB0WzFdOyByZXR1cm4gdFsxXTsgfSwgdHJ5czogW10sIG9wczogW10gfSwgZiwgeSwgdCwgZztcbiAgICByZXR1cm4gZyA9IHsgbmV4dDogdmVyYigwKSwgXCJ0aHJvd1wiOiB2ZXJiKDEpLCBcInJldHVyblwiOiB2ZXJiKDIpIH0sIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiAoZ1tTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzOyB9KSwgZztcbiAgICBmdW5jdGlvbiB2ZXJiKG4pIHsgcmV0dXJuIGZ1bmN0aW9uICh2KSB7IHJldHVybiBzdGVwKFtuLCB2XSk7IH07IH1cbiAgICBmdW5jdGlvbiBzdGVwKG9wKSB7XG4gICAgICAgIGlmIChmKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiR2VuZXJhdG9yIGlzIGFscmVhZHkgZXhlY3V0aW5nLlwiKTtcbiAgICAgICAgd2hpbGUgKGcgJiYgKGcgPSAwLCBvcFswXSAmJiAoXyA9IDApKSwgXykgdHJ5IHtcbiAgICAgICAgICAgIGlmIChmID0gMSwgeSAmJiAodCA9IG9wWzBdICYgMiA/IHlbXCJyZXR1cm5cIl0gOiBvcFswXSA/IHlbXCJ0aHJvd1wiXSB8fCAoKHQgPSB5W1wicmV0dXJuXCJdKSAmJiB0LmNhbGwoeSksIDApIDogeS5uZXh0KSAmJiAhKHQgPSB0LmNhbGwoeSwgb3BbMV0pKS5kb25lKSByZXR1cm4gdDtcbiAgICAgICAgICAgIGlmICh5ID0gMCwgdCkgb3AgPSBbb3BbMF0gJiAyLCB0LnZhbHVlXTtcbiAgICAgICAgICAgIHN3aXRjaCAob3BbMF0pIHtcbiAgICAgICAgICAgICAgICBjYXNlIDA6IGNhc2UgMTogdCA9IG9wOyBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDQ6IF8ubGFiZWwrKzsgcmV0dXJuIHsgdmFsdWU6IG9wWzFdLCBkb25lOiBmYWxzZSB9O1xuICAgICAgICAgICAgICAgIGNhc2UgNTogXy5sYWJlbCsrOyB5ID0gb3BbMV07IG9wID0gWzBdOyBjb250aW51ZTtcbiAgICAgICAgICAgICAgICBjYXNlIDc6IG9wID0gXy5vcHMucG9wKCk7IF8udHJ5cy5wb3AoKTsgY29udGludWU7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEodCA9IF8udHJ5cywgdCA9IHQubGVuZ3RoID4gMCAmJiB0W3QubGVuZ3RoIC0gMV0pICYmIChvcFswXSA9PT0gNiB8fCBvcFswXSA9PT0gMikpIHsgXyA9IDA7IGNvbnRpbnVlOyB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChvcFswXSA9PT0gMyAmJiAoIXQgfHwgKG9wWzFdID4gdFswXSAmJiBvcFsxXSA8IHRbM10pKSkgeyBfLmxhYmVsID0gb3BbMV07IGJyZWFrOyB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChvcFswXSA9PT0gNiAmJiBfLmxhYmVsIDwgdFsxXSkgeyBfLmxhYmVsID0gdFsxXTsgdCA9IG9wOyBicmVhazsgfVxuICAgICAgICAgICAgICAgICAgICBpZiAodCAmJiBfLmxhYmVsIDwgdFsyXSkgeyBfLmxhYmVsID0gdFsyXTsgXy5vcHMucHVzaChvcCk7IGJyZWFrOyB9XG4gICAgICAgICAgICAgICAgICAgIGlmICh0WzJdKSBfLm9wcy5wb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG9wID0gYm9keS5jYWxsKHRoaXNBcmcsIF8pO1xuICAgICAgICB9IGNhdGNoIChlKSB7IG9wID0gWzYsIGVdOyB5ID0gMDsgfSBmaW5hbGx5IHsgZiA9IHQgPSAwOyB9XG4gICAgICAgIGlmIChvcFswXSAmIDUpIHRocm93IG9wWzFdOyByZXR1cm4geyB2YWx1ZTogb3BbMF0gPyBvcFsxXSA6IHZvaWQgMCwgZG9uZTogdHJ1ZSB9O1xuICAgIH1cbn07XG5pbXBvcnQgeyBnZXRfcmVzZWFyY2hfdGV4dCB9IGZyb20gXCIuL2NoYXRcIjtcbmltcG9ydCB7IHRoaXNHYW1lIH0gZnJvbSBcIi4vZ2FtZVwiO1xuaW1wb3J0IHsgZ2V0X2hlcm8gfSBmcm9tIFwiLi9nZXRfaGVyb1wiO1xuaW1wb3J0IHsgY2xpcCwgbGFzdENsaXAgfSBmcm9tIFwiLi9ob3RrZXlcIjtcbmltcG9ydCB7IHJlbmRlckxlZGdlciB9IGZyb20gXCIuL2xlZGdlclwiO1xuaW1wb3J0IHsgbWVyZ2VVc2VyIH0gZnJvbSBcIi4vdXRpbGl0aWVzL21lcmdlXCI7XG5pbXBvcnQgeyBpc192YWxpZF9pbWFnZV91cmwsIGlzX3ZhbGlkX3lvdXR1YmUgfSBmcm9tIFwiLi91dGlsaXRpZXMvcGFyc2VfdXRpbHNcIjtcbmltcG9ydCB7IGFueVN0YXJDYW5TZWUsIGRyYXdPdmVybGF5U3RyaW5nIH0gZnJvbSBcIi4vdXRpbGl0aWVzL2dyYXBoaWNzXCI7XG5pbXBvcnQgeyBob29rX25wY190aWNrX2NvdW50ZXIgfSBmcm9tIFwiLi91dGlsaXRpZXMvbnBjX2NhbGNcIjtcbmltcG9ydCB7IGdldF9hcGVfYmFkZ2VzLCBBcGVCYWRnZUljb24sIGdyb3VwQXBlQmFkZ2VzLCB9IGZyb20gXCIuL3V0aWxpdGllcy9wbGF5ZXJfYmFkZ2VzXCI7XG52YXIgU0FUX1ZFUlNJT04gPSBcImdpdC12ZXJzaW9uXCI7XG5pZiAoTmVwdHVuZXNQcmlkZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhpc0dhbWUubmVwdHVuZXNQcmlkZSA9IE5lcHR1bmVzUHJpZGU7XG59XG5TdHJpbmcucHJvdG90eXBlLnRvUHJvcGVyQ2FzZSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5yZXBsYWNlKC9cXHdcXFMqL2csIGZ1bmN0aW9uICh0eHQpIHtcbiAgICAgICAgcmV0dXJuIHR4dC5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHR4dC5zdWJzdHIoMSkudG9Mb3dlckNhc2UoKTtcbiAgICB9KTtcbn07XG4vKiBFeHRyYSBCYWRnZXMgKi9cbnZhciBhcGVfcGxheWVycyA9IFtdO1xuZnVuY3Rpb24gZ2V0X2FwZV9wbGF5ZXJzKCkge1xuICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIF9fZ2VuZXJhdG9yKHRoaXMsIGZ1bmN0aW9uIChfYSkge1xuICAgICAgICAgICAgZ2V0X2FwZV9iYWRnZXMoKVxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChwbGF5ZXJzKSB7XG4gICAgICAgICAgICAgICAgYXBlX3BsYXllcnMgPSBwbGF5ZXJzO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24gKGVycikgeyByZXR1cm4gY29uc29sZS5sb2coXCJFUlJPUjogVW5hYmxlIHRvIGdldCBBUEUgcGxheWVyc1wiLCBlcnIpOyB9KTtcbiAgICAgICAgICAgIHJldHVybiBbMiAvKnJldHVybiovXTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG5nZXRfYXBlX3BsYXllcnMoKTtcbi8vT3ZlcnJpZGUgd2lkZ2V0IGludGVmYWNlc1xudmFyIG92ZXJyaWRlQmFkZ2VXaWRnZXRzID0gZnVuY3Rpb24gKCkge1xuICAgIE5lcHR1bmVzUHJpZGUubnB1aS5iYWRnZUZpbGVOYW1lc1tcImFcIl0gPSBcImFwZVwiO1xuICAgIHZhciBpbWFnZV91cmwgPSAkKFwiI2FwZS1pbnRlbC1wbHVnaW5cIikuYXR0cihcImltYWdlc1wiKTtcbiAgICBOZXB0dW5lc1ByaWRlLm5wdWkuQmFkZ2VJY29uID0gZnVuY3Rpb24gKGZpbGVuYW1lLCBjb3VudCwgc21hbGwpIHtcbiAgICAgICAgcmV0dXJuIEFwZUJhZGdlSWNvbihDcnV4LCBpbWFnZV91cmwsIGZpbGVuYW1lLCBjb3VudCwgc21hbGwpO1xuICAgIH07XG59O1xudmFyIG92ZXJyaWRlVGVtcGxhdGVzID0gZnVuY3Rpb24gKCkge1xuICAgIENydXgubG9jYWxpc2UgPSBmdW5jdGlvbiAoaWQpIHtcbiAgICAgICAgaWYgKENydXgudGVtcGxhdGVzW2lkXSkge1xuICAgICAgICAgICAgcmV0dXJuIENydXgudGVtcGxhdGVzW2lkXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBpZC50b1Byb3BlckNhc2UoKTtcbiAgICAgICAgfVxuICAgIH07XG59O1xuJChcImFwZS1pbnRlbC1wbHVnaW5cIikucmVhZHkoZnVuY3Rpb24gKCkge1xuICAgIHBvc3RfaG9vaygpO1xuICAgIC8vJChcIiNhcGUtaW50ZWwtcGx1Z2luXCIpLnJlbW92ZSgpO1xufSk7XG5mdW5jdGlvbiBwb3N0X2hvb2soKSB7XG4gICAgb3ZlcnJpZGVUZW1wbGF0ZXMoKTtcbiAgICBvdmVycmlkZUJhZGdlV2lkZ2V0cygpO1xuICAgIFNBVF9WRVJTSU9OID0gJChcIiNhcGUtaW50ZWwtcGx1Z2luXCIpLmF0dHIoXCJ0aXRsZVwiKTtcbiAgICBjb25zb2xlLmxvZyhTQVRfVkVSU0lPTik7XG59XG4vL1RPRE86IE9yZ2FuaXplIHR5cGVzY3JpcHQgdG8gYW4gaW50ZXJmYWNlcyBkaXJlY3Rvcnlcbi8vVE9ETzogVGhlbiBtYWtlIG90aGVyIGdhbWUgZW5naW5lIG9iamVjdHNcbi8vIFBhcnQgb2YgeW91ciBjb2RlIGlzIHJlLWNyZWF0aW5nIHRoZSBnYW1lIGluIHR5cGVzY3JpcHRcbi8vIFRoZSBvdGhlciBwYXJ0IGlzIGFkZGluZyBmZWF0dXJlc1xuLy8gVGhlbiB0aGVyZSBpcyBhIHNlZ21lbnQgdGhhdCBpcyBvdmVyd3JpdGluZyBleGlzdGluZyBjb250ZW50IHRvIGFkZCBzbWFsbCBhZGRpdGlvbnMuXG4vL0FkZCBjdXN0b20gc2V0dGluZ3Mgd2hlbiBtYWtpbmcgYSBud2UgZ2FtZS5cbmZ1bmN0aW9uIG1vZGlmeV9jdXN0b21fZ2FtZSgpIHtcbiAgICBjb25zb2xlLmxvZyhcIlJ1bm5pbmcgY3VzdG9tIGdhbWUgc2V0dGluZ3MgbW9kaWZpY2F0aW9uXCIpO1xuICAgIHZhciBzZWxlY3RvciA9ICQoXCIjY29udGVudEFyZWEgPiBkaXYgPiBkaXYud2lkZ2V0LmZ1bGxzY3JlZW4gPiBkaXYud2lkZ2V0LnJlbCA+IGRpdjpudGgtY2hpbGQoNCkgPiBkaXY6bnRoLWNoaWxkKDE1KSA+IHNlbGVjdFwiKVswXTtcbiAgICBpZiAoc2VsZWN0b3IgPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIC8vTm90IGluIG1lbnVcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGV4dFN0cmluZyA9IFwiXCI7XG4gICAgZm9yICh2YXIgaSA9IDI7IGkgPD0gMzI7ICsraSkge1xuICAgICAgICB0ZXh0U3RyaW5nICs9IFwiPG9wdGlvbiB2YWx1ZT1cXFwiXCIuY29uY2F0KGksIFwiXFxcIj5cIikuY29uY2F0KGksIFwiIFBsYXllcnM8L29wdGlvbj5cIik7XG4gICAgfVxuICAgIGNvbnNvbGUubG9nKHRleHRTdHJpbmcpO1xuICAgIHNlbGVjdG9yLmlubmVySFRNTCA9IHRleHRTdHJpbmc7XG59XG5zZXRUaW1lb3V0KG1vZGlmeV9jdXN0b21fZ2FtZSwgNTAwKTtcbi8vVE9ETzogTWFrZSBpcyB3aXRoaW4gc2Nhbm5pbmcgZnVuY3Rpb25cbi8vU2hhcmUgYWxsIHRlY2ggZGlzcGxheSBhcyB0ZWNoIGlzIGFjdGl2ZWx5IHRyYWRpbmcuXG52YXIgZGlzcGxheV90ZWNoX3RyYWRpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIG5wdWkgPSBOZXB0dW5lc1ByaWRlLm5wdWk7XG4gICAgdmFyIHRlY2hfdHJhZGVfc2NyZWVuID0gbnB1aS5TY3JlZW4oXCJ0ZWNoX3RyYWRpbmdcIik7XG4gICAgbnB1aS5vbkhpZGVTY3JlZW4obnVsbCwgdHJ1ZSk7XG4gICAgbnB1aS5vbkhpZGVTZWxlY3Rpb25NZW51KCk7XG4gICAgbnB1aS50cmlnZ2VyKFwiaGlkZV9zaWRlX21lbnVcIik7XG4gICAgbnB1aS50cmlnZ2VyKFwicmVzZXRfZWRpdF9tb2RlXCIpO1xuICAgIG5wdWkuYWN0aXZlU2NyZWVuID0gdGVjaF90cmFkZV9zY3JlZW47XG4gICAgdGVjaF90cmFkZV9zY3JlZW4ucm9vc3QobnB1aS5zY3JlZW5Db250YWluZXIpO1xuICAgIG5wdWkubGF5b3V0RWxlbWVudCh0ZWNoX3RyYWRlX3NjcmVlbik7XG4gICAgdmFyIHRyYWRpbmcgPSBDcnV4LlRleHQoXCJcIiwgXCJyZWwgcGFkMTJcIikucmF3SFRNTChcIlRyYWRpbmcuLlwiKTtcbiAgICB0cmFkaW5nLnJvb3N0KHRlY2hfdHJhZGVfc2NyZWVuKTtcbiAgICB0ZWNoX3RyYWRlX3NjcmVlbi50cmFuc2FjdCA9IGZ1bmN0aW9uICh0ZXh0KSB7XG4gICAgICAgIHZhciB0cmFkaW5nID0gQ3J1eC5UZXh0KFwiXCIsIFwicmVsIHBhZDhcIikucmF3SFRNTCh0ZXh0KTtcbiAgICAgICAgdHJhZGluZy5yb29zdCh0ZWNoX3RyYWRlX3NjcmVlbik7XG4gICAgfTtcbiAgICByZXR1cm4gdGVjaF90cmFkZV9zY3JlZW47XG59O1xuLy9SZXR1cm5zIGFsbCBzdGFycyBJIHN1cHBvc2VcbnZhciBfZ2V0X3N0YXJfZ2lzID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBzdGFycyA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2UuZ2FsYXh5LnN0YXJzO1xuICAgIHZhciBvdXRwdXQgPSBbXTtcbiAgICBmb3IgKHZhciBzIGluIHN0YXJzKSB7XG4gICAgICAgIHZhciBzdGFyID0gc3RhcnNbc107XG4gICAgICAgIG91dHB1dC5wdXNoKHtcbiAgICAgICAgICAgIHg6IHN0YXIueCxcbiAgICAgICAgICAgIHk6IHN0YXIueSxcbiAgICAgICAgICAgIG93bmVyOiBzdGFyLnF1YWxpZmllZEFsaWFzLFxuICAgICAgICAgICAgZWNvbm9teTogc3Rhci5lLFxuICAgICAgICAgICAgaW5kdXN0cnk6IHN0YXIuaSxcbiAgICAgICAgICAgIHNjaWVuY2U6IHN0YXIucyxcbiAgICAgICAgICAgIHNoaXBzOiBzdGFyLnRvdGFsRGVmZW5zZXMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gb3V0cHV0O1xufTtcbnZhciBfZ2V0X3dlYXBvbnNfbmV4dCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcmVzZWFyY2ggPSBnZXRfcmVzZWFyY2goKTtcbiAgICBpZiAocmVzZWFyY2hbXCJjdXJyZW50X25hbWVcIl0gPT0gXCJXZWFwb25zXCIpIHtcbiAgICAgICAgcmV0dXJuIHJlc2VhcmNoW1wiY3VycmVudF9ldGFcIl07XG4gICAgfVxuICAgIGVsc2UgaWYgKHJlc2VhcmNoW1wibmV4dF9uYW1lXCJdID09IFwiV2VhcG9uc1wiKSB7XG4gICAgICAgIHJldHVybiByZXNlYXJjaFtcIm5leHRfZXRhXCJdO1xuICAgIH1cbiAgICByZXR1cm4gTWF0aC5wb3coMTAsIDEwKTtcbn07XG52YXIgZ2V0X3RlY2hfdHJhZGVfY29zdCA9IGZ1bmN0aW9uIChmcm9tLCB0bywgdGVjaF9uYW1lKSB7XG4gICAgaWYgKHRlY2hfbmFtZSA9PT0gdm9pZCAwKSB7IHRlY2hfbmFtZSA9IG51bGw7IH1cbiAgICB2YXIgdG90YWxfY29zdCA9IDA7XG4gICAgZm9yICh2YXIgX2kgPSAwLCBfYSA9IE9iamVjdC5lbnRyaWVzKHRvLnRlY2gpOyBfaSA8IF9hLmxlbmd0aDsgX2krKykge1xuICAgICAgICB2YXIgX2IgPSBfYVtfaV0sIHRlY2ggPSBfYlswXSwgdmFsdWUgPSBfYlsxXTtcbiAgICAgICAgaWYgKHRlY2hfbmFtZSA9PSBudWxsIHx8IHRlY2hfbmFtZSA9PSB0ZWNoKSB7XG4gICAgICAgICAgICB2YXIgbWUgPSBmcm9tLnRlY2hbdGVjaF0ubGV2ZWw7XG4gICAgICAgICAgICB2YXIgeW91ID0gdmFsdWUubGV2ZWw7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8PSBtZSAtIHlvdTsgKytpKSB7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyh0ZWNoLCh5b3UraSksKHlvdStpKSoxNSlcbiAgICAgICAgICAgICAgICB0b3RhbF9jb3N0ICs9ICh5b3UgKyBpKSAqIE5lcHR1bmVzUHJpZGUuZ2FtZUNvbmZpZy50cmFkZUNvc3Q7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRvdGFsX2Nvc3Q7XG59O1xuLy9Ib29rcyB0byBidXR0b25zIGZvciBzaGFyaW5nIGFuZCBidXlpbmdcbi8vUHJldHR5IHNpbXBsZSBob29rcyB0aGF0IGNhbiBiZSBhZGRlZCB0byBhIHR5cGVzY3JpcHQgZmlsZS5cbnZhciBhcHBseV9ob29rcyA9IGZ1bmN0aW9uICgpIHtcbiAgICBOZXB0dW5lc1ByaWRlLm5wLm9uKFwic2hhcmVfYWxsX3RlY2hcIiwgZnVuY3Rpb24gKGV2ZW50LCBwbGF5ZXIpIHtcbiAgICAgICAgdmFyIHRvdGFsX2Nvc3QgPSBnZXRfdGVjaF90cmFkZV9jb3N0KGdldF9oZXJvKE5lcHR1bmVzUHJpZGUudW5pdmVyc2UpLCBwbGF5ZXIpO1xuICAgICAgICBOZXB0dW5lc1ByaWRlLnRlbXBsYXRlc1tcImNvbmZpcm1fdGVjaF9zaGFyZV9cIi5jb25jYXQocGxheWVyLnVpZCldID0gXCJBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gc3BlbmQgJFwiLmNvbmNhdCh0b3RhbF9jb3N0LCBcIiB0byBnaXZlIFwiKS5jb25jYXQocGxheWVyLnJhd0FsaWFzLCBcIiBhbGwgb2YgeW91ciB0ZWNoP1wiKTtcbiAgICAgICAgTmVwdHVuZXNQcmlkZS5ucC50cmlnZ2VyKFwic2hvd19zY3JlZW5cIiwgW1xuICAgICAgICAgICAgXCJjb25maXJtXCIsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZTogXCJjb25maXJtX3RlY2hfc2hhcmVfXCIuY29uY2F0KHBsYXllci51aWQpLFxuICAgICAgICAgICAgICAgIGV2ZW50S2luZDogXCJjb25maXJtX3RyYWRlX3RlY2hcIixcbiAgICAgICAgICAgICAgICBldmVudERhdGE6IHBsYXllcixcbiAgICAgICAgICAgIH0sXG4gICAgICAgIF0pO1xuICAgIH0pO1xuICAgIE5lcHR1bmVzUHJpZGUubnAub24oXCJidXlfYWxsX3RlY2hcIiwgZnVuY3Rpb24gKGV2ZW50LCBkYXRhKSB7XG4gICAgICAgIHZhciBwbGF5ZXIgPSBkYXRhLnBsYXllcjtcbiAgICAgICAgdmFyIGNvc3QgPSBkYXRhLmNvc3Q7XG4gICAgICAgIE5lcHR1bmVzUHJpZGUudGVtcGxhdGVzW1wiY29uZmlybV90ZWNoX3NoYXJlX1wiLmNvbmNhdChwbGF5ZXIudWlkKV0gPSBcIkFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBzcGVuZCAkXCIuY29uY2F0KGNvc3QsIFwiIHRvIGJ1eSBhbGwgb2YgXCIpLmNvbmNhdChwbGF5ZXIucmF3QWxpYXMsIFwiJ3MgdGVjaD8gSXQgaXMgdXAgdG8gdGhlbSB0byBhY3R1YWxseSBzZW5kIGl0IHRvIHlvdS5cIik7XG4gICAgICAgIE5lcHR1bmVzUHJpZGUubnAudHJpZ2dlcihcInNob3dfc2NyZWVuXCIsIFtcbiAgICAgICAgICAgIFwiY29uZmlybVwiLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IFwiY29uZmlybV90ZWNoX3NoYXJlX1wiLmNvbmNhdChwbGF5ZXIudWlkKSxcbiAgICAgICAgICAgICAgICBldmVudEtpbmQ6IFwiY29uZmlybV9idXlfdGVjaFwiLFxuICAgICAgICAgICAgICAgIGV2ZW50RGF0YTogZGF0YSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIF0pO1xuICAgIH0pO1xuICAgIE5lcHR1bmVzUHJpZGUubnAub24oXCJidXlfb25lX3RlY2hcIiwgZnVuY3Rpb24gKGV2ZW50LCBkYXRhKSB7XG4gICAgICAgIHZhciBwbGF5ZXIgPSBkYXRhLnBsYXllcjtcbiAgICAgICAgdmFyIHRlY2ggPSBkYXRhLnRlY2g7XG4gICAgICAgIHZhciBjb3N0ID0gZGF0YS5jb3N0O1xuICAgICAgICBOZXB0dW5lc1ByaWRlLnRlbXBsYXRlc1tcImNvbmZpcm1fdGVjaF9zaGFyZV9cIi5jb25jYXQocGxheWVyLnVpZCldID0gXCJBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gc3BlbmQgJFwiLmNvbmNhdChjb3N0LCBcIiB0byBidXkgXCIpLmNvbmNhdCh0ZWNoLCBcIiBmcm9tIFwiKS5jb25jYXQocGxheWVyLnJhd0FsaWFzLCBcIj8gSXQgaXMgdXAgdG8gdGhlbSB0byBhY3R1YWxseSBzZW5kIGl0IHRvIHlvdS5cIik7XG4gICAgICAgIE5lcHR1bmVzUHJpZGUubnAudHJpZ2dlcihcInNob3dfc2NyZWVuXCIsIFtcbiAgICAgICAgICAgIFwiY29uZmlybVwiLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IFwiY29uZmlybV90ZWNoX3NoYXJlX1wiLmNvbmNhdChwbGF5ZXIudWlkKSxcbiAgICAgICAgICAgICAgICBldmVudEtpbmQ6IFwiY29uZmlybV9idXlfdGVjaFwiLFxuICAgICAgICAgICAgICAgIGV2ZW50RGF0YTogZGF0YSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIF0pO1xuICAgIH0pO1xuICAgIE5lcHR1bmVzUHJpZGUubnAub24oXCJjb25maXJtX3RyYWRlX3RlY2hcIiwgZnVuY3Rpb24gKGV2ZW4sIHBsYXllcikge1xuICAgICAgICB2YXIgaGVybyA9IGdldF9oZXJvKE5lcHR1bmVzUHJpZGUudW5pdmVyc2UpO1xuICAgICAgICB2YXIgZGlzcGxheSA9IGRpc3BsYXlfdGVjaF90cmFkaW5nKCk7XG4gICAgICAgIHZhciBjbG9zZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIE5lcHR1bmVzUHJpZGUudW5pdmVyc2Uuc2VsZWN0UGxheWVyKHBsYXllcik7XG4gICAgICAgICAgICBOZXB0dW5lc1ByaWRlLm5wLnRyaWdnZXIoXCJyZWZyZXNoX2ludGVyZmFjZVwiKTtcbiAgICAgICAgICAgIE5lcHR1bmVzUHJpZGUubnAubnB1aS5yZWZyZXNoVHVybk1hbmFnZXIoKTtcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIG9mZnNldCA9IDMwMDtcbiAgICAgICAgdmFyIF9sb29wXzEgPSBmdW5jdGlvbiAodGVjaCwgdmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBtZSA9IGhlcm8udGVjaFt0ZWNoXS5sZXZlbDtcbiAgICAgICAgICAgIHZhciB5b3UgPSB2YWx1ZS5sZXZlbDtcbiAgICAgICAgICAgIHZhciBfbG9vcF8yID0gZnVuY3Rpb24gKGkpIHtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cobWUgLSB5b3UsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwib3JkZXJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIG9yZGVyOiBcInNoYXJlX3RlY2gsXCIuY29uY2F0KHBsYXllci51aWQsIFwiLFwiKS5jb25jYXQodGVjaCksXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5LnRyYW5zYWN0KFwiU2VuZGluZyBcIi5jb25jYXQodGVjaCwgXCIgbGV2ZWwgXCIpLmNvbmNhdCh5b3UgKyBpKSk7XG4gICAgICAgICAgICAgICAgICAgIE5lcHR1bmVzUHJpZGUubnAudHJpZ2dlcihcInNlcnZlcl9yZXF1ZXN0XCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwib3JkZXJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIG9yZGVyOiBcInNoYXJlX3RlY2gsXCIuY29uY2F0KHBsYXllci51aWQsIFwiLFwiKS5jb25jYXQodGVjaCksXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaSA9PSBtZSAtIHlvdSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheS50cmFuc2FjdChcIkRvbmUuXCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgb2Zmc2V0KTtcbiAgICAgICAgICAgICAgICBvZmZzZXQgKz0gMTAwMDtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8PSBtZSAtIHlvdTsgKytpKSB7XG4gICAgICAgICAgICAgICAgX2xvb3BfMihpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwLCBfYSA9IE9iamVjdC5lbnRyaWVzKHBsYXllci50ZWNoKTsgX2kgPCBfYS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIHZhciBfYiA9IF9hW19pXSwgdGVjaCA9IF9iWzBdLCB2YWx1ZSA9IF9iWzFdO1xuICAgICAgICAgICAgX2xvb3BfMSh0ZWNoLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgc2V0VGltZW91dChjbG9zZSwgb2Zmc2V0ICsgMTAwMCk7XG4gICAgfSk7XG4gICAgLy9QYXlzIGEgcGxheWVyIGEgY2VydGFpbiBhbW91bnRcbiAgICBOZXB0dW5lc1ByaWRlLm5wLm9uKFwiY29uZmlybV9idXlfdGVjaFwiLCBmdW5jdGlvbiAoZXZlbiwgZGF0YSkge1xuICAgICAgICB2YXIgcGxheWVyID0gZGF0YS5wbGF5ZXI7XG4gICAgICAgIE5lcHR1bmVzUHJpZGUubnAudHJpZ2dlcihcInNlcnZlcl9yZXF1ZXN0XCIsIHtcbiAgICAgICAgICAgIHR5cGU6IFwib3JkZXJcIixcbiAgICAgICAgICAgIG9yZGVyOiBcInNlbmRfbW9uZXksXCIuY29uY2F0KHBsYXllci51aWQsIFwiLFwiKS5jb25jYXQoZGF0YS5jb3N0KSxcbiAgICAgICAgfSk7XG4gICAgICAgIE5lcHR1bmVzUHJpZGUudW5pdmVyc2Uuc2VsZWN0UGxheWVyKHBsYXllcik7XG4gICAgICAgIE5lcHR1bmVzUHJpZGUubnAudHJpZ2dlcihcInJlZnJlc2hfaW50ZXJmYWNlXCIpO1xuICAgIH0pO1xufTtcbnZhciBfd2lkZV92aWV3ID0gZnVuY3Rpb24gKCkge1xuICAgIE5lcHR1bmVzUHJpZGUubnAudHJpZ2dlcihcIm1hcF9jZW50ZXJfc2xpZGVcIiwgeyB4OiAwLCB5OiAwIH0pO1xuICAgIE5lcHR1bmVzUHJpZGUubnAudHJpZ2dlcihcInpvb21fbWluaW1hcFwiKTtcbn07XG5mdW5jdGlvbiBMZWdhY3lfTmVwdHVuZXNQcmlkZUFnZW50KCkge1xuICAgIHZhciBfYSwgX2I7XG4gICAgdmFyIHRpdGxlID0gKChfYSA9IGRvY3VtZW50ID09PSBudWxsIHx8IGRvY3VtZW50ID09PSB2b2lkIDAgPyB2b2lkIDAgOiBkb2N1bWVudC5jdXJyZW50U2NyaXB0KSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2EudGl0bGUpIHx8IFwiU0FUIFwiLmNvbmNhdChTQVRfVkVSU0lPTik7XG4gICAgdmFyIHZlcnNpb24gPSB0aXRsZS5yZXBsYWNlKC9eLip2LywgXCJ2XCIpO1xuICAgIGNvbnNvbGUubG9nKHRpdGxlKTtcbiAgICB2YXIgY29weSA9IGZ1bmN0aW9uIChyZXBvcnRGbikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmVwb3J0Rm4oKTtcbiAgICAgICAgICAgIG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KGxhc3RDbGlwKTtcbiAgICAgICAgfTtcbiAgICB9O1xuICAgIHZhciBob3RrZXlzID0gW107XG4gICAgdmFyIGhvdGtleSA9IGZ1bmN0aW9uIChrZXksIGFjdGlvbikge1xuICAgICAgICBob3RrZXlzLnB1c2goW2tleSwgYWN0aW9uXSk7XG4gICAgICAgIE1vdXNldHJhcC5iaW5kKGtleSwgY29weShhY3Rpb24pKTtcbiAgICB9O1xuICAgIGlmICghU3RyaW5nLnByb3RvdHlwZS5mb3JtYXQpIHtcbiAgICAgICAgU3RyaW5nLnByb3RvdHlwZS5mb3JtYXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYXJncyA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgICAgICBhcmdzW19pXSA9IGFyZ3VtZW50c1tfaV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5yZXBsYWNlKC97KFxcZCspfS9nLCBmdW5jdGlvbiAobWF0Y2gsIG51bWJlcikge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgYXJnc1tudW1iZXJdID09PSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBNYXRoLnRydW5jKGFyZ3NbbnVtYmVyXSAqIDEwMDApIC8gMTAwMDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHR5cGVvZiBhcmdzW251bWJlcl0gIT0gXCJ1bmRlZmluZWRcIiA/IGFyZ3NbbnVtYmVyXSA6IG1hdGNoO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgfVxuICAgIHZhciBsaW5rRmxlZXRzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgdW5pdmVyc2UgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlO1xuICAgICAgICB2YXIgZmxlZXRzID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5nYWxheHkuZmxlZXRzO1xuICAgICAgICBmb3IgKHZhciBmIGluIGZsZWV0cykge1xuICAgICAgICAgICAgdmFyIGZsZWV0ID0gZmxlZXRzW2ZdO1xuICAgICAgICAgICAgdmFyIGZsZWV0TGluayA9IFwiPGEgb25DbGljaz0nQ3J1eC5jcnV4LnRyaWdnZXIoXFxcInNob3dfZmxlZXRfdWlkXFxcIiwgXFxcIlwiLmNvbmNhdChmbGVldC51aWQsIFwiXFxcIiknPlwiKS5jb25jYXQoZmxlZXQubiwgXCI8L2E+XCIpO1xuICAgICAgICAgICAgdW5pdmVyc2UuaHlwZXJsaW5rZWRNZXNzYWdlSW5zZXJ0c1tmbGVldC5uXSA9IGZsZWV0TGluaztcbiAgICAgICAgfVxuICAgIH07XG4gICAgZnVuY3Rpb24gc3RhclJlcG9ydCgpIHtcbiAgICAgICAgdmFyIHBsYXllcnMgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlLmdhbGF4eS5wbGF5ZXJzO1xuICAgICAgICB2YXIgc3RhcnMgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlLmdhbGF4eS5zdGFycztcbiAgICAgICAgdmFyIG91dHB1dCA9IFtdO1xuICAgICAgICBmb3IgKHZhciBwIGluIHBsYXllcnMpIHtcbiAgICAgICAgICAgIG91dHB1dC5wdXNoKFwiW1t7MH1dXVwiLmZvcm1hdChwKSk7XG4gICAgICAgICAgICBmb3IgKHZhciBzIGluIHN0YXJzKSB7XG4gICAgICAgICAgICAgICAgdmFyIHN0YXIgPSBzdGFyc1tzXTtcbiAgICAgICAgICAgICAgICBpZiAoc3Rhci5wdWlkID09IHAgJiYgc3Rhci5zaGlwc1BlclRpY2sgPj0gMCkge1xuICAgICAgICAgICAgICAgICAgICBvdXRwdXQucHVzaChcIuKAg+KAg1tbezB9XV0gezF9L3syfS97M30gezR9IHNoaXBzXCIuZm9ybWF0KHN0YXIubiwgc3Rhci5lLCBzdGFyLmksIHN0YXIucywgc3Rhci50b3RhbERlZmVuc2VzKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNsaXAob3V0cHV0LmpvaW4oXCJcXG5cIikpO1xuICAgIH1cbiAgICBob3RrZXkoXCIqXCIsIHN0YXJSZXBvcnQpO1xuICAgIHN0YXJSZXBvcnQuaGVscCA9XG4gICAgICAgIFwiR2VuZXJhdGUgYSByZXBvcnQgb24gYWxsIHN0YXJzIGluIHlvdXIgc2Nhbm5pbmcgcmFuZ2UsIGFuZCBjb3B5IGl0IHRvIHRoZSBjbGlwYm9hcmQuXCIgK1xuICAgICAgICAgICAgXCI8cD5UaGlzIHNhbWUgcmVwb3J0IGNhbiBhbHNvIGJlIHZpZXdlZCB2aWEgdGhlIG1lbnU7IGVudGVyIHRoZSBhZ2VudCBhbmQgY2hvb3NlIGl0IGZyb20gdGhlIGRyb3Bkb3duLlwiO1xuICAgIHZhciBhbXBtID0gZnVuY3Rpb24gKGgsIG0pIHtcbiAgICAgICAgaWYgKG0gPCAxMClcbiAgICAgICAgICAgIG0gPSBcIjBcIi5jb25jYXQobSk7XG4gICAgICAgIGlmIChoIDwgMTIpIHtcbiAgICAgICAgICAgIGlmIChoID09IDApXG4gICAgICAgICAgICAgICAgaCA9IDEyO1xuICAgICAgICAgICAgcmV0dXJuIFwiezB9OnsxfSBBTVwiLmZvcm1hdChoLCBtKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChoID4gMTIpIHtcbiAgICAgICAgICAgIHJldHVybiBcInswfTp7MX0gUE1cIi5mb3JtYXQoaCAtIDEyLCBtKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gXCJ7MH06ezF9IFBNXCIuZm9ybWF0KGgsIG0pO1xuICAgIH07XG4gICAgdmFyIG1zVG9UaWNrID0gZnVuY3Rpb24gKHRpY2ssIHdob2xlVGltZSkge1xuICAgICAgICB2YXIgdW5pdmVyc2UgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlO1xuICAgICAgICB2YXIgbXNfc2luY2VfZGF0YSA9IDA7XG4gICAgICAgIHZhciB0ZiA9IHVuaXZlcnNlLmdhbGF4eS50aWNrX2ZyYWdtZW50O1xuICAgICAgICB2YXIgbHRjID0gdW5pdmVyc2UubG9jVGltZUNvcnJlY3Rpb247XG4gICAgICAgIGlmICghdW5pdmVyc2UuZ2FsYXh5LnBhdXNlZCkge1xuICAgICAgICAgICAgbXNfc2luY2VfZGF0YSA9IG5ldyBEYXRlKCkudmFsdWVPZigpIC0gdW5pdmVyc2Uubm93LnZhbHVlT2YoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAod2hvbGVUaW1lIHx8IHVuaXZlcnNlLmdhbGF4eS50dXJuX2Jhc2VkKSB7XG4gICAgICAgICAgICBtc19zaW5jZV9kYXRhID0gMDtcbiAgICAgICAgICAgIHRmID0gMDtcbiAgICAgICAgICAgIGx0YyA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIG1zX3JlbWFpbmluZyA9IHRpY2sgKiAxMDAwICogNjAgKiB1bml2ZXJzZS5nYWxheHkudGlja19yYXRlIC1cbiAgICAgICAgICAgIHRmICogMTAwMCAqIDYwICogdW5pdmVyc2UuZ2FsYXh5LnRpY2tfcmF0ZSAtXG4gICAgICAgICAgICBtc19zaW5jZV9kYXRhIC1cbiAgICAgICAgICAgIGx0YztcbiAgICAgICAgcmV0dXJuIG1zX3JlbWFpbmluZztcbiAgICB9O1xuICAgIHZhciBkYXlzID0gW1wiU3VuXCIsIFwiTW9uXCIsIFwiVHVlXCIsIFwiV2VkXCIsIFwiVGh1XCIsIFwiRnJpXCIsIFwiU2F0XCJdO1xuICAgIHZhciBtc1RvRXRhU3RyaW5nID0gZnVuY3Rpb24gKG1zcGx1cywgcHJlZml4KSB7XG4gICAgICAgIHZhciBub3cgPSBuZXcgRGF0ZSgpO1xuICAgICAgICB2YXIgYXJyaXZhbCA9IG5ldyBEYXRlKG5vdy5nZXRUaW1lKCkgKyBtc3BsdXMpO1xuICAgICAgICB2YXIgcCA9IHByZWZpeCAhPT0gdW5kZWZpbmVkID8gcHJlZml4IDogXCJFVEEgXCI7XG4gICAgICAgIC8vV2hhdCBpcyB0dHQ/XG4gICAgICAgIHZhciB0dHQgPSBwICsgYW1wbShhcnJpdmFsLmdldEhvdXJzKCksIGFycml2YWwuZ2V0TWludXRlcygpKTtcbiAgICAgICAgaWYgKCFOZXB0dW5lc1ByaWRlLmdhbWVDb25maWcudHVybkJhc2VkKSB7XG4gICAgICAgICAgICB0dHQgPSBwICsgYW1wbShhcnJpdmFsLmdldEhvdXJzKCksIGFycml2YWwuZ2V0TWludXRlcygpKTtcbiAgICAgICAgICAgIGlmIChhcnJpdmFsLmdldERheSgpICE9IG5vdy5nZXREYXkoKSlcbiAgICAgICAgICAgICAgICAvLyBHZW5lcmF0ZSB0aW1lIHN0cmluZ1xuICAgICAgICAgICAgICAgIHR0dCA9IFwiXCIuY29uY2F0KHApLmNvbmNhdChkYXlzW2Fycml2YWwuZ2V0RGF5KCldLCBcIiBAIFwiKS5jb25jYXQoYW1wbShhcnJpdmFsLmdldEhvdXJzKCksIGFycml2YWwuZ2V0TWludXRlcygpKSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB2YXIgdG90YWxFVEEgPSBhcnJpdmFsIC0gbm93O1xuICAgICAgICAgICAgdHR0ID0gcCArIENydXguZm9ybWF0VGltZSh0b3RhbEVUQSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHR0dDtcbiAgICB9O1xuICAgIHZhciB0aWNrVG9FdGFTdHJpbmcgPSBmdW5jdGlvbiAodGljaywgcHJlZml4KSB7XG4gICAgICAgIHZhciBtc3BsdXMgPSBtc1RvVGljayh0aWNrKTtcbiAgICAgICAgcmV0dXJuIG1zVG9FdGFTdHJpbmcobXNwbHVzLCBwcmVmaXgpO1xuICAgIH07XG4gICAgdmFyIG1zVG9DeWNsZVN0cmluZyA9IGZ1bmN0aW9uIChtc3BsdXMsIHByZWZpeCkge1xuICAgICAgICB2YXIgcCA9IHByZWZpeCAhPT0gdW5kZWZpbmVkID8gcHJlZml4IDogXCJFVEFcIjtcbiAgICAgICAgdmFyIGN5Y2xlTGVuZ3RoID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5nYWxheHkucHJvZHVjdGlvbl9yYXRlO1xuICAgICAgICB2YXIgdGlja0xlbmd0aCA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2UuZ2FsYXh5LnRpY2tfcmF0ZTtcbiAgICAgICAgdmFyIHRpY2tzVG9Db21wbGV0ZSA9IE1hdGguY2VpbChtc3BsdXMgLyA2MDAwMCAvIHRpY2tMZW5ndGgpO1xuICAgICAgICAvL0dlbmVyYXRlIHRpbWUgdGV4dCBzdHJpbmdcbiAgICAgICAgdmFyIHR0dCA9IFwiXCIuY29uY2F0KHApLmNvbmNhdCh0aWNrc1RvQ29tcGxldGUsIFwiIHRpY2tzIC0gXCIpLmNvbmNhdCgodGlja3NUb0NvbXBsZXRlIC8gY3ljbGVMZW5ndGgpLnRvRml4ZWQoMiksIFwiQ1wiKTtcbiAgICAgICAgcmV0dXJuIHR0dDtcbiAgICB9O1xuICAgIHZhciBmbGVldE91dGNvbWVzID0ge307XG4gICAgdmFyIGNvbWJhdEhhbmRpY2FwID0gMDtcbiAgICB2YXIgY29tYmF0T3V0Y29tZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBfYTtcbiAgICAgICAgdmFyIHVuaXZlcnNlID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZTtcbiAgICAgICAgdmFyIHBsYXllcnMgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlLmdhbGF4eS5wbGF5ZXJzO1xuICAgICAgICB2YXIgZmxlZXRzID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5nYWxheHkuZmxlZXRzO1xuICAgICAgICB2YXIgc3RhcnMgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlLmdhbGF4eS5zdGFycztcbiAgICAgICAgdmFyIGZsaWdodHMgPSBbXTtcbiAgICAgICAgZmxlZXRPdXRjb21lcyA9IHt9O1xuICAgICAgICBmb3IgKHZhciBmIGluIGZsZWV0cykge1xuICAgICAgICAgICAgdmFyIGZsZWV0ID0gZmxlZXRzW2ZdO1xuICAgICAgICAgICAgaWYgKGZsZWV0Lm8gJiYgZmxlZXQuby5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgdmFyIHN0b3BfMSA9IGZsZWV0Lm9bMF1bMV07XG4gICAgICAgICAgICAgICAgdmFyIHRpY2tzID0gZmxlZXQuZXRhRmlyc3Q7XG4gICAgICAgICAgICAgICAgdmFyIHN0YXJuYW1lID0gKF9hID0gc3RhcnNbc3RvcF8xXSkgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLm47XG4gICAgICAgICAgICAgICAgaWYgKCFzdGFybmFtZSkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmxpZ2h0cy5wdXNoKFtcbiAgICAgICAgICAgICAgICAgICAgdGlja3MsXG4gICAgICAgICAgICAgICAgICAgIFwiW1t7MH1dXSBbW3sxfV1dIHsyfSDihpIgW1t7M31dXSB7NH1cIi5mb3JtYXQoZmxlZXQucHVpZCwgZmxlZXQubiwgZmxlZXQuc3QsIHN0YXJuYW1lLCB0aWNrVG9FdGFTdHJpbmcodGlja3MpKSxcbiAgICAgICAgICAgICAgICAgICAgZmxlZXQsXG4gICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZmxpZ2h0cyA9IGZsaWdodHMuc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICAgICAgcmV0dXJuIGFbMF0gLSBiWzBdO1xuICAgICAgICB9KTtcbiAgICAgICAgdmFyIGFycml2YWxzID0ge307XG4gICAgICAgIHZhciBvdXRwdXQgPSBbXTtcbiAgICAgICAgdmFyIGFycml2YWxUaW1lcyA9IFtdO1xuICAgICAgICB2YXIgc3RhcnN0YXRlID0ge307XG4gICAgICAgIGZvciAodmFyIGkgaW4gZmxpZ2h0cykge1xuICAgICAgICAgICAgdmFyIGZsZWV0ID0gZmxpZ2h0c1tpXVsyXTtcbiAgICAgICAgICAgIGlmIChmbGVldC5vcmJpdGluZykge1xuICAgICAgICAgICAgICAgIHZhciBvcmJpdCA9IGZsZWV0Lm9yYml0aW5nLnVpZDtcbiAgICAgICAgICAgICAgICBpZiAoIXN0YXJzdGF0ZVtvcmJpdF0pIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhcnN0YXRlW29yYml0XSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RfdXBkYXRlZDogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNoaXBzOiBzdGFyc1tvcmJpdF0udG90YWxEZWZlbnNlcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHB1aWQ6IHN0YXJzW29yYml0XS5wdWlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgYzogc3RhcnNbb3JiaXRdLmMsXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIFRoaXMgZmxlZXQgaXMgZGVwYXJ0aW5nIHRoaXMgdGljazsgcmVtb3ZlIGl0IGZyb20gdGhlIG9yaWdpbiBzdGFyJ3MgdG90YWxEZWZlbnNlc1xuICAgICAgICAgICAgICAgIHN0YXJzdGF0ZVtvcmJpdF0uc2hpcHMgLT0gZmxlZXQuc3Q7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYXJyaXZhbFRpbWVzLmxlbmd0aCA9PT0gMCB8fFxuICAgICAgICAgICAgICAgIGFycml2YWxUaW1lc1thcnJpdmFsVGltZXMubGVuZ3RoIC0gMV0gIT09IGZsaWdodHNbaV1bMF0pIHtcbiAgICAgICAgICAgICAgICBhcnJpdmFsVGltZXMucHVzaChmbGlnaHRzW2ldWzBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBhcnJpdmFsS2V5ID0gW2ZsaWdodHNbaV1bMF0sIGZsZWV0Lm9bMF1bMV1dO1xuICAgICAgICAgICAgaWYgKGFycml2YWxzW2Fycml2YWxLZXldICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBhcnJpdmFsc1thcnJpdmFsS2V5XS5wdXNoKGZsZWV0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGFycml2YWxzW2Fycml2YWxLZXldID0gW2ZsZWV0XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmb3IgKHZhciBrIGluIGFycml2YWxzKSB7XG4gICAgICAgICAgICB2YXIgYXJyaXZhbCA9IGFycml2YWxzW2tdO1xuICAgICAgICAgICAgdmFyIGthID0gay5zcGxpdChcIixcIik7XG4gICAgICAgICAgICB2YXIgdGljayA9IGthWzBdO1xuICAgICAgICAgICAgdmFyIHN0YXJJZCA9IGthWzFdO1xuICAgICAgICAgICAgaWYgKCFzdGFyc3RhdGVbc3RhcklkXSkge1xuICAgICAgICAgICAgICAgIHN0YXJzdGF0ZVtzdGFySWRdID0ge1xuICAgICAgICAgICAgICAgICAgICBsYXN0X3VwZGF0ZWQ6IDAsXG4gICAgICAgICAgICAgICAgICAgIHNoaXBzOiBzdGFyc1tzdGFySWRdLnRvdGFsRGVmZW5zZXMsXG4gICAgICAgICAgICAgICAgICAgIHB1aWQ6IHN0YXJzW3N0YXJJZF0ucHVpZCxcbiAgICAgICAgICAgICAgICAgICAgYzogc3RhcnNbc3RhcklkXS5jLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoc3RhcnN0YXRlW3N0YXJJZF0ucHVpZCA9PSAtMSkge1xuICAgICAgICAgICAgICAgIC8vIGFzc2lnbiBvd25lcnNoaXAgb2YgdGhlIHN0YXIgdG8gdGhlIHBsYXllciB3aG9zZSBmbGVldCBoYXMgdHJhdmVsZWQgdGhlIGxlYXN0IGRpc3RhbmNlXG4gICAgICAgICAgICAgICAgdmFyIG1pbkRpc3RhbmNlID0gMTAwMDA7XG4gICAgICAgICAgICAgICAgdmFyIG93bmVyID0gLTE7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSBpbiBhcnJpdmFsKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBmbGVldCA9IGFycml2YWxbaV07XG4gICAgICAgICAgICAgICAgICAgIHZhciBkID0gdW5pdmVyc2UuZGlzdGFuY2Uoc3RhcnNbc3RhcklkXS54LCBzdGFyc1tzdGFySWRdLnksIGZsZWV0Lmx4LCBmbGVldC5seSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkIDwgbWluRGlzdGFuY2UgfHwgb3duZXIgPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG93bmVyID0gZmxlZXQucHVpZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1pbkRpc3RhbmNlID0gZDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzdGFyc3RhdGVbc3RhcklkXS5wdWlkID0gb3duZXI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvdXRwdXQucHVzaChcInswfTogW1t7MX1dXSBbW3syfV1dIHszfSBzaGlwc1wiLmZvcm1hdCh0aWNrVG9FdGFTdHJpbmcodGljaywgXCJAXCIpLCBzdGFyc3RhdGVbc3RhcklkXS5wdWlkLCBzdGFyc1tzdGFySWRdLm4sIHN0YXJzdGF0ZVtzdGFySWRdLnNoaXBzKSk7XG4gICAgICAgICAgICB2YXIgdGlja0RlbHRhID0gdGljayAtIHN0YXJzdGF0ZVtzdGFySWRdLmxhc3RfdXBkYXRlZCAtIDE7XG4gICAgICAgICAgICBpZiAodGlja0RlbHRhID4gMCkge1xuICAgICAgICAgICAgICAgIHZhciBvbGRTaGlwcyA9IHN0YXJzdGF0ZVtzdGFySWRdLnNoaXBzO1xuICAgICAgICAgICAgICAgIHN0YXJzdGF0ZVtzdGFySWRdLmxhc3RfdXBkYXRlZCA9IHRpY2sgLSAxO1xuICAgICAgICAgICAgICAgIGlmIChzdGFyc1tzdGFySWRdLnNoaXBzUGVyVGljaykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgb2xkYyA9IHN0YXJzdGF0ZVtzdGFySWRdLmM7XG4gICAgICAgICAgICAgICAgICAgIHN0YXJzdGF0ZVtzdGFySWRdLnNoaXBzICs9XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFyc1tzdGFySWRdLnNoaXBzUGVyVGljayAqIHRpY2tEZWx0YSArIG9sZGM7XG4gICAgICAgICAgICAgICAgICAgIHN0YXJzdGF0ZVtzdGFySWRdLmMgPVxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnN0YXRlW3N0YXJJZF0uc2hpcHMgLSBNYXRoLnRydW5jKHN0YXJzdGF0ZVtzdGFySWRdLnNoaXBzKTtcbiAgICAgICAgICAgICAgICAgICAgc3RhcnN0YXRlW3N0YXJJZF0uc2hpcHMgLT0gc3RhcnN0YXRlW3N0YXJJZF0uYztcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0LnB1c2goXCLigIPigIN7MH0rezN9ICsgezJ9L2ggPSB7MX0rezR9XCIuZm9ybWF0KG9sZFNoaXBzLCBzdGFyc3RhdGVbc3RhcklkXS5zaGlwcywgc3RhcnNbc3RhcklkXS5zaGlwc1BlclRpY2ssIG9sZGMsIHN0YXJzdGF0ZVtzdGFySWRdLmMpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKHZhciBpIGluIGFycml2YWwpIHtcbiAgICAgICAgICAgICAgICB2YXIgZmxlZXQgPSBhcnJpdmFsW2ldO1xuICAgICAgICAgICAgICAgIGlmIChmbGVldC5wdWlkID09IHN0YXJzdGF0ZVtzdGFySWRdLnB1aWQgfHxcbiAgICAgICAgICAgICAgICAgICAgc3RhcnN0YXRlW3N0YXJJZF0ucHVpZCA9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgb2xkU2hpcHMgPSBzdGFyc3RhdGVbc3RhcklkXS5zaGlwcztcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0YXJzdGF0ZVtzdGFySWRdLnB1aWQgPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJzdGF0ZVtzdGFySWRdLnNoaXBzID0gZmxlZXQuc3Q7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFyc3RhdGVbc3RhcklkXS5zaGlwcyArPSBmbGVldC5zdDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB2YXIgbGFuZGluZ1N0cmluZyA9IFwi4oCD4oCDezB9ICsgezJ9IG9uIFtbezN9XV0gPSB7MX1cIi5mb3JtYXQob2xkU2hpcHMsIHN0YXJzdGF0ZVtzdGFySWRdLnNoaXBzLCBmbGVldC5zdCwgZmxlZXQubik7XG4gICAgICAgICAgICAgICAgICAgIG91dHB1dC5wdXNoKGxhbmRpbmdTdHJpbmcpO1xuICAgICAgICAgICAgICAgICAgICBsYW5kaW5nU3RyaW5nID0gbGFuZGluZ1N0cmluZy5zdWJzdHJpbmcoMik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yICh2YXIgaSBpbiBhcnJpdmFsKSB7XG4gICAgICAgICAgICAgICAgdmFyIGZsZWV0ID0gYXJyaXZhbFtpXTtcbiAgICAgICAgICAgICAgICBpZiAoZmxlZXQucHVpZCA9PSBzdGFyc3RhdGVbc3RhcklkXS5wdWlkKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBvdXRjb21lU3RyaW5nID0gXCJ7MH0gc2hpcHMgb24gezF9XCIuZm9ybWF0KE1hdGguZmxvb3Ioc3RhcnN0YXRlW3N0YXJJZF0uc2hpcHMpLCBzdGFyc1tzdGFySWRdLm4pO1xuICAgICAgICAgICAgICAgICAgICBmbGVldE91dGNvbWVzW2ZsZWV0LnVpZF0gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBldGE6IHRpY2tUb0V0YVN0cmluZyhmbGVldC5ldGFGaXJzdCksXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRjb21lOiBvdXRjb21lU3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBhd3QgPSAwO1xuICAgICAgICAgICAgdmFyIG9mZmVuc2UgPSAwO1xuICAgICAgICAgICAgdmFyIGNvbnRyaWJ1dGlvbiA9IHt9O1xuICAgICAgICAgICAgZm9yICh2YXIgaSBpbiBhcnJpdmFsKSB7XG4gICAgICAgICAgICAgICAgdmFyIGZsZWV0ID0gYXJyaXZhbFtpXTtcbiAgICAgICAgICAgICAgICBpZiAoZmxlZXQucHVpZCAhPSBzdGFyc3RhdGVbc3RhcklkXS5wdWlkKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBvbGRhID0gb2ZmZW5zZTtcbiAgICAgICAgICAgICAgICAgICAgb2ZmZW5zZSArPSBmbGVldC5zdDtcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0LnB1c2goXCLigIPigINbW3s0fV1dISB7MH0gKyB7Mn0gb24gW1t7M31dXSA9IHsxfVwiLmZvcm1hdChvbGRhLCBvZmZlbnNlLCBmbGVldC5zdCwgZmxlZXQubiwgZmxlZXQucHVpZCkpO1xuICAgICAgICAgICAgICAgICAgICBjb250cmlidXRpb25bW2ZsZWV0LnB1aWQsIGZsZWV0LnVpZF1dID0gZmxlZXQuc3Q7XG4gICAgICAgICAgICAgICAgICAgIHZhciB3dCA9IHBsYXllcnNbZmxlZXQucHVpZF0udGVjaC53ZWFwb25zLmxldmVsO1xuICAgICAgICAgICAgICAgICAgICBpZiAod3QgPiBhd3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF3dCA9IHd0O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGF0dGFja2Vyc0FnZ3JlZ2F0ZSA9IG9mZmVuc2U7XG4gICAgICAgICAgICB3aGlsZSAob2ZmZW5zZSA+IDApIHtcbiAgICAgICAgICAgICAgICB2YXIgZHd0ID0gcGxheWVyc1tzdGFyc3RhdGVbc3RhcklkXS5wdWlkXS50ZWNoLndlYXBvbnMubGV2ZWw7XG4gICAgICAgICAgICAgICAgdmFyIGRlZmVuc2UgPSBzdGFyc3RhdGVbc3RhcklkXS5zaGlwcztcbiAgICAgICAgICAgICAgICBvdXRwdXQucHVzaChcIuKAg+KAg0NvbWJhdCEgW1t7MH1dXSBkZWZlbmRpbmdcIi5mb3JtYXQoc3RhcnN0YXRlW3N0YXJJZF0ucHVpZCkpO1xuICAgICAgICAgICAgICAgIG91dHB1dC5wdXNoKFwi4oCD4oCD4oCD4oCDRGVmZW5kZXJzIHswfSBzaGlwcywgV1MgezF9XCIuZm9ybWF0KGRlZmVuc2UsIGR3dCkpO1xuICAgICAgICAgICAgICAgIG91dHB1dC5wdXNoKFwi4oCD4oCD4oCD4oCDQXR0YWNrZXJzIHswfSBzaGlwcywgV1MgezF9XCIuZm9ybWF0KG9mZmVuc2UsIGF3dCkpO1xuICAgICAgICAgICAgICAgIGR3dCArPSAxO1xuICAgICAgICAgICAgICAgIGlmIChzdGFyc3RhdGVbc3RhcklkXS5wdWlkICE9PSB1bml2ZXJzZS5nYWxheHkucGxheWVyX3VpZCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY29tYmF0SGFuZGljYXAgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkd3QgKz0gY29tYmF0SGFuZGljYXA7XG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXQucHVzaChcIuKAg+KAg+KAg+KAg0RlZmVuZGVycyBXU3swfSA9IHsxfVwiLmZvcm1hdChoYW5kaWNhcFN0cmluZyhcIlwiKSwgZHd0KSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhd3QgLT0gY29tYmF0SGFuZGljYXA7XG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXQucHVzaChcIuKAg+KAg+KAg+KAg0F0dGFja2VycyBXU3swfSA9IHsxfVwiLmZvcm1hdChoYW5kaWNhcFN0cmluZyhcIlwiKSwgYXd0KSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb21iYXRIYW5kaWNhcCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF3dCArPSBjb21iYXRIYW5kaWNhcDtcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dC5wdXNoKFwi4oCD4oCD4oCD4oCDQXR0YWNrZXJzIFdTezB9ID0gezF9XCIuZm9ybWF0KGhhbmRpY2FwU3RyaW5nKFwiXCIpLCBhd3QpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGR3dCAtPSBjb21iYXRIYW5kaWNhcDtcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dC5wdXNoKFwi4oCD4oCD4oCD4oCDRGVmZW5kZXJzIFdTezB9ID0gezF9XCIuZm9ybWF0KGhhbmRpY2FwU3RyaW5nKFwiXCIpLCBkd3QpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodW5pdmVyc2UuZ2FsYXh5LnBsYXllcl91aWQgPT09IHN0YXJzdGF0ZVtzdGFySWRdLnB1aWQpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gdHJ1bmNhdGUgZGVmZW5zZSBpZiB3ZSdyZSBkZWZlbmRpbmcgdG8gZ2l2ZSB0aGUgbW9zdFxuICAgICAgICAgICAgICAgICAgICAvLyBjb25zZXJ2YXRpdmUgZXN0aW1hdGVcbiAgICAgICAgICAgICAgICAgICAgZGVmZW5zZSA9IE1hdGgudHJ1bmMoZGVmZW5zZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHdoaWxlIChkZWZlbnNlID4gMCAmJiBvZmZlbnNlID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBvZmZlbnNlIC09IGR3dDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9mZmVuc2UgPD0gMClcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBkZWZlbnNlIC09IGF3dDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIG5ld0FnZ3JlZ2F0ZSA9IDA7XG4gICAgICAgICAgICAgICAgdmFyIHBsYXllckNvbnRyaWJ1dGlvbiA9IHt9O1xuICAgICAgICAgICAgICAgIHZhciBiaWdnZXN0UGxheWVyID0gLTE7XG4gICAgICAgICAgICAgICAgdmFyIGJpZ2dlc3RQbGF5ZXJJZCA9IHN0YXJzdGF0ZVtzdGFySWRdLnB1aWQ7XG4gICAgICAgICAgICAgICAgaWYgKG9mZmVuc2UgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIG91dHB1dC5wdXNoKFwi4oCD4oCDQXR0YWNrZXJzIHdpbiB3aXRoIHswfSBzaGlwcyByZW1haW5pbmdcIi5mb3JtYXQob2ZmZW5zZSkpO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBrXzEgaW4gY29udHJpYnV0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIga2FfMSA9IGtfMS5zcGxpdChcIixcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZmxlZXQgPSBmbGVldHNba2FfMVsxXV07XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcGxheWVySWQgPSBrYV8xWzBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udHJpYnV0aW9uW2tfMV0gPSAob2ZmZW5zZSAqIGNvbnRyaWJ1dGlvbltrXzFdKSAvIGF0dGFja2Vyc0FnZ3JlZ2F0ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0FnZ3JlZ2F0ZSArPSBjb250cmlidXRpb25ba18xXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwbGF5ZXJDb250cmlidXRpb25bcGxheWVySWRdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGxheWVyQ29udHJpYnV0aW9uW3BsYXllcklkXSArPSBjb250cmlidXRpb25ba18xXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBsYXllckNvbnRyaWJ1dGlvbltwbGF5ZXJJZF0gPSBjb250cmlidXRpb25ba18xXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwbGF5ZXJDb250cmlidXRpb25bcGxheWVySWRdID4gYmlnZ2VzdFBsYXllcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJpZ2dlc3RQbGF5ZXIgPSBwbGF5ZXJDb250cmlidXRpb25bcGxheWVySWRdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJpZ2dlc3RQbGF5ZXJJZCA9IHBsYXllcklkO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0LnB1c2goXCLigIPigIPigIPigINbW3swfV1dIGhhcyB7MX0gb24gW1t7Mn1dXVwiLmZvcm1hdChmbGVldC5wdWlkLCBjb250cmlidXRpb25ba18xXSwgZmxlZXQubikpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG91dGNvbWVTdHJpbmcgPSBcIldpbnMhIHswfSBsYW5kLlwiLmZvcm1hdChjb250cmlidXRpb25ba18xXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBmbGVldE91dGNvbWVzW2ZsZWV0LnVpZF0gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXRhOiB0aWNrVG9FdGFTdHJpbmcoZmxlZXQuZXRhRmlyc3QpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dGNvbWU6IG91dGNvbWVTdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIG9mZmVuc2UgPSBuZXdBZ2dyZWdhdGUgLSBwbGF5ZXJDb250cmlidXRpb25bYmlnZ2VzdFBsYXllcklkXTtcbiAgICAgICAgICAgICAgICAgICAgc3RhcnN0YXRlW3N0YXJJZF0ucHVpZCA9IGJpZ2dlc3RQbGF5ZXJJZDtcbiAgICAgICAgICAgICAgICAgICAgc3RhcnN0YXRlW3N0YXJJZF0uc2hpcHMgPSBwbGF5ZXJDb250cmlidXRpb25bYmlnZ2VzdFBsYXllcklkXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXJzdGF0ZVtzdGFySWRdLnNoaXBzID0gZGVmZW5zZTtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgaSBpbiBhcnJpdmFsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZmxlZXQgPSBhcnJpdmFsW2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZsZWV0LnB1aWQgPT0gc3RhcnN0YXRlW3N0YXJJZF0ucHVpZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBvdXRjb21lU3RyaW5nID0gXCJ7MH0gc2hpcHMgb24gezF9XCIuZm9ybWF0KE1hdGguZmxvb3Ioc3RhcnN0YXRlW3N0YXJJZF0uc2hpcHMpLCBzdGFyc1tzdGFySWRdLm4pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZsZWV0T3V0Y29tZXNbZmxlZXQudWlkXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXRhOiB0aWNrVG9FdGFTdHJpbmcoZmxlZXQuZXRhRmlyc3QpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRjb21lOiBvdXRjb21lU3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIga18yIGluIGNvbnRyaWJ1dGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGthXzIgPSBrXzIuc3BsaXQoXCIsXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGZsZWV0ID0gZmxlZXRzW2thXzJbMV1dO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG91dGNvbWVTdHJpbmcgPSBcIkxvc2VzISB7MH0gbGl2ZS5cIi5mb3JtYXQoZGVmZW5zZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBmbGVldE91dGNvbWVzW2ZsZWV0LnVpZF0gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXRhOiB0aWNrVG9FdGFTdHJpbmcoZmxlZXQuZXRhRmlyc3QpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dGNvbWU6IG91dGNvbWVTdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGF0dGFja2Vyc0FnZ3JlZ2F0ZSA9IG9mZmVuc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvdXRwdXQucHVzaChcIuKAg+KAg1tbezB9XV0gW1t7MX1dXSB7Mn0gc2hpcHNcIi5mb3JtYXQoc3RhcnN0YXRlW3N0YXJJZF0ucHVpZCwgc3RhcnNbc3RhcklkXS5uLCBzdGFyc3RhdGVbc3RhcklkXS5zaGlwcykpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgfTtcbiAgICBmdW5jdGlvbiBpbmNDb21iYXRIYW5kaWNhcCgpIHtcbiAgICAgICAgY29tYmF0SGFuZGljYXAgKz0gMTtcbiAgICB9XG4gICAgZnVuY3Rpb24gZGVjQ29tYmF0SGFuZGljYXAoKSB7XG4gICAgICAgIGNvbWJhdEhhbmRpY2FwIC09IDE7XG4gICAgfVxuICAgIGhvdGtleShcIi5cIiwgaW5jQ29tYmF0SGFuZGljYXApO1xuICAgIGluY0NvbWJhdEhhbmRpY2FwLmhlbHAgPVxuICAgICAgICBcIkNoYW5nZSBjb21iYXQgY2FsY3VsYXRpb24gdG8gY3JlZGl0IHlvdXIgZW5lbWllcyB3aXRoICsxIHdlYXBvbnMuIFVzZWZ1bCBcIiArXG4gICAgICAgICAgICBcImlmIHlvdSBzdXNwZWN0IHRoZXkgd2lsbCBoYXZlIGFjaGlldmVkIHRoZSBuZXh0IGxldmVsIG9mIHRlY2ggYmVmb3JlIGEgYmF0dGxlIHlvdSBhcmUgaW52ZXN0aWdhdGluZy5cIiArXG4gICAgICAgICAgICBcIjxwPkluIHRoZSBsb3dlciBsZWZ0IG9mIHRoZSBIVUQsIGFuIGluZGljYXRvciB3aWxsIGFwcGVhciByZW1pbmRpbmcgeW91IG9mIHRoZSB3ZWFwb25zIGFkanVzdG1lbnQuIElmIHRoZSBcIiArXG4gICAgICAgICAgICBcImluZGljYXRvciBhbHJlYWR5IHNob3dzIGFuIGFkdmFudGFnZSBmb3IgZGVmZW5kZXJzLCB0aGlzIGhvdGtleSB3aWxsIHJlZHVjZSB0aGF0IGFkdmFudGFnZSBmaXJzdCBiZWZvcmUgY3JlZGl0aW5nIFwiICtcbiAgICAgICAgICAgIFwid2VhcG9ucyB0byB5b3VyIG9wcG9uZW50LlwiO1xuICAgIGhvdGtleShcIixcIiwgZGVjQ29tYmF0SGFuZGljYXApO1xuICAgIGRlY0NvbWJhdEhhbmRpY2FwLmhlbHAgPVxuICAgICAgICBcIkNoYW5nZSBjb21iYXQgY2FsY3VsYXRpb24gdG8gY3JlZGl0IHlvdXJzZWxmIHdpdGggKzEgd2VhcG9ucy4gVXNlZnVsIFwiICtcbiAgICAgICAgICAgIFwid2hlbiB5b3Ugd2lsbCBoYXZlIGFjaGlldmVkIHRoZSBuZXh0IGxldmVsIG9mIHRlY2ggYmVmb3JlIGEgYmF0dGxlIHlvdSBhcmUgaW52ZXN0aWdhdGluZy5cIiArXG4gICAgICAgICAgICBcIjxwPkluIHRoZSBsb3dlciBsZWZ0IG9mIHRoZSBIVUQsIGFuIGluZGljYXRvciB3aWxsIGFwcGVhciByZW1pbmRpbmcgeW91IG9mIHRoZSB3ZWFwb25zIGFkanVzdG1lbnQuIFdoZW4gXCIgK1xuICAgICAgICAgICAgXCJpbmRpY2F0b3IgYWxyZWFkeSBzaG93cyBhbiBhZHZhbnRhZ2UgZm9yIGF0dGFja2VycywgdGhpcyBob3RrZXkgd2lsbCByZWR1Y2UgdGhhdCBhZHZhbnRhZ2UgZmlyc3QgYmVmb3JlIGNyZWRpdGluZyBcIiArXG4gICAgICAgICAgICBcIndlYXBvbnMgdG8geW91LlwiO1xuICAgIGZ1bmN0aW9uIGxvbmdGbGVldFJlcG9ydCgpIHtcbiAgICAgICAgY2xpcChjb21iYXRPdXRjb21lcygpLmpvaW4oXCJcXG5cIikpO1xuICAgIH1cbiAgICBob3RrZXkoXCImXCIsIGxvbmdGbGVldFJlcG9ydCk7XG4gICAgbG9uZ0ZsZWV0UmVwb3J0LmhlbHAgPVxuICAgICAgICBcIkdlbmVyYXRlIGEgZGV0YWlsZWQgZmxlZXQgcmVwb3J0IG9uIGFsbCBjYXJyaWVycyBpbiB5b3VyIHNjYW5uaW5nIHJhbmdlLCBhbmQgY29weSBpdCB0byB0aGUgY2xpcGJvYXJkLlwiICtcbiAgICAgICAgICAgIFwiPHA+VGhpcyBzYW1lIHJlcG9ydCBjYW4gYWxzbyBiZSB2aWV3ZWQgdmlhIHRoZSBtZW51OyBlbnRlciB0aGUgYWdlbnQgYW5kIGNob29zZSBpdCBmcm9tIHRoZSBkcm9wZG93bi5cIjtcbiAgICBmdW5jdGlvbiBicmllZkZsZWV0UmVwb3J0KCkge1xuICAgICAgICB2YXIgX2E7XG4gICAgICAgIHZhciBmbGVldHMgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlLmdhbGF4eS5mbGVldHM7XG4gICAgICAgIHZhciBzdGFycyA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2UuZ2FsYXh5LnN0YXJzO1xuICAgICAgICB2YXIgZmxpZ2h0cyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBmIGluIGZsZWV0cykge1xuICAgICAgICAgICAgdmFyIGZsZWV0ID0gZmxlZXRzW2ZdO1xuICAgICAgICAgICAgaWYgKGZsZWV0Lm8gJiYgZmxlZXQuby5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgdmFyIHN0b3BfMiA9IGZsZWV0Lm9bMF1bMV07XG4gICAgICAgICAgICAgICAgdmFyIHRpY2tzID0gZmxlZXQuZXRhRmlyc3Q7XG4gICAgICAgICAgICAgICAgdmFyIHN0YXJuYW1lID0gKF9hID0gc3RhcnNbc3RvcF8yXSkgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLm47XG4gICAgICAgICAgICAgICAgaWYgKCFzdGFybmFtZSlcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgZmxpZ2h0cy5wdXNoKFtcbiAgICAgICAgICAgICAgICAgICAgdGlja3MsXG4gICAgICAgICAgICAgICAgICAgIFwiW1t7MH1dXSBbW3sxfV1dIHsyfSDihpIgW1t7M31dXSB7NH1cIi5mb3JtYXQoZmxlZXQucHVpZCwgZmxlZXQubiwgZmxlZXQuc3QsIHN0YXJzW3N0b3BfMl0ubiwgdGlja1RvRXRhU3RyaW5nKHRpY2tzLCBcIlwiKSksXG4gICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZmxpZ2h0cyA9IGZsaWdodHMuc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICAgICAgcmV0dXJuIGFbMF0gLSBiWzBdO1xuICAgICAgICB9KTtcbiAgICAgICAgY2xpcChmbGlnaHRzLm1hcChmdW5jdGlvbiAoeCkgeyByZXR1cm4geFsxXTsgfSkuam9pbihcIlxcblwiKSk7XG4gICAgfVxuICAgIGhvdGtleShcIl5cIiwgYnJpZWZGbGVldFJlcG9ydCk7XG4gICAgYnJpZWZGbGVldFJlcG9ydC5oZWxwID1cbiAgICAgICAgXCJHZW5lcmF0ZSBhIHN1bW1hcnkgZmxlZXQgcmVwb3J0IG9uIGFsbCBjYXJyaWVycyBpbiB5b3VyIHNjYW5uaW5nIHJhbmdlLCBhbmQgY29weSBpdCB0byB0aGUgY2xpcGJvYXJkLlwiICtcbiAgICAgICAgICAgIFwiPHA+VGhpcyBzYW1lIHJlcG9ydCBjYW4gYWxzbyBiZSB2aWV3ZWQgdmlhIHRoZSBtZW51OyBlbnRlciB0aGUgYWdlbnQgYW5kIGNob29zZSBpdCBmcm9tIHRoZSBkcm9wZG93bi5cIjtcbiAgICBmdW5jdGlvbiBzY3JlZW5zaG90KCkge1xuICAgICAgICB2YXIgbWFwID0gTmVwdHVuZXNQcmlkZS5ucHVpLm1hcDtcbiAgICAgICAgY2xpcChtYXAuY2FudmFzWzBdLnRvRGF0YVVSTChcImltYWdlL3dlYnBcIiwgMC4wNSkpO1xuICAgIH1cbiAgICBob3RrZXkoXCIjXCIsIHNjcmVlbnNob3QpO1xuICAgIHNjcmVlbnNob3QuaGVscCA9XG4gICAgICAgIFwiQ3JlYXRlIGEgZGF0YTogVVJMIG9mIHRoZSBjdXJyZW50IG1hcC4gUGFzdGUgaXQgaW50byBhIGJyb3dzZXIgd2luZG93IHRvIHZpZXcuIFRoaXMgaXMgbGlrZWx5IHRvIGJlIHJlbW92ZWQuXCI7XG4gICAgdmFyIGhvbWVQbGFuZXRzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgcCA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2UuZ2FsYXh5LnBsYXllcnM7XG4gICAgICAgIHZhciBvdXRwdXQgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgaSBpbiBwKSB7XG4gICAgICAgICAgICB2YXIgaG9tZSA9IHBbaV0uaG9tZTtcbiAgICAgICAgICAgIGlmIChob21lKSB7XG4gICAgICAgICAgICAgICAgb3V0cHV0LnB1c2goXCJQbGF5ZXIgI3swfSBpcyBbW3swfV1dIGhvbWUgezJ9IFtbezF9XV1cIi5mb3JtYXQoaSwgaG9tZS5uLCBpID09IGhvbWUucHVpZCA/IFwiaXNcIiA6IFwid2FzXCIpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIG91dHB1dC5wdXNoKFwiUGxheWVyICN7MH0gaXMgW1t7MH1dXSBob21lIHVua25vd25cIi5mb3JtYXQoaSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNsaXAob3V0cHV0LmpvaW4oXCJcXG5cIikpO1xuICAgIH07XG4gICAgaG90a2V5KFwiIVwiLCBob21lUGxhbmV0cyk7XG4gICAgaG9tZVBsYW5ldHMuaGVscCA9XG4gICAgICAgIFwiR2VuZXJhdGUgYSBwbGF5ZXIgc3VtbWFyeSByZXBvcnQgYW5kIGNvcHkgaXQgdG8gdGhlIGNsaXBib2FyZC5cIiArXG4gICAgICAgICAgICBcIjxwPlRoaXMgc2FtZSByZXBvcnQgY2FuIGFsc28gYmUgdmlld2VkIHZpYSB0aGUgbWVudTsgZW50ZXIgdGhlIGFnZW50IGFuZCBjaG9vc2UgaXQgZnJvbSB0aGUgZHJvcGRvd24uIFwiICtcbiAgICAgICAgICAgIFwiSXQgaXMgbW9zdCB1c2VmdWwgZm9yIGRpc2NvdmVyaW5nIHBsYXllciBudW1iZXJzIHNvIHRoYXQgeW91IGNhbiB3cml0ZSBbWyNdXSB0byByZWZlcmVuY2UgYSBwbGF5ZXIgaW4gbWFpbC5cIjtcbiAgICB2YXIgcGxheWVyU2hlZXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBwID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5nYWxheHkucGxheWVycztcbiAgICAgICAgdmFyIG91dHB1dCA9IFtdO1xuICAgICAgICB2YXIgZmllbGRzID0gW1xuICAgICAgICAgICAgXCJhbGlhc1wiLFxuICAgICAgICAgICAgXCJ0b3RhbF9zdGFyc1wiLFxuICAgICAgICAgICAgXCJzaGlwc1BlclRpY2tcIixcbiAgICAgICAgICAgIFwidG90YWxfc3RyZW5ndGhcIixcbiAgICAgICAgICAgIFwidG90YWxfZWNvbm9teVwiLFxuICAgICAgICAgICAgXCJ0b3RhbF9mbGVldHNcIixcbiAgICAgICAgICAgIFwidG90YWxfaW5kdXN0cnlcIixcbiAgICAgICAgICAgIFwidG90YWxfc2NpZW5jZVwiLFxuICAgICAgICBdO1xuICAgICAgICBvdXRwdXQucHVzaChmaWVsZHMuam9pbihcIixcIikpO1xuICAgICAgICB2YXIgX2xvb3BfMyA9IGZ1bmN0aW9uIChpKSB7XG4gICAgICAgICAgICBwbGF5ZXIgPSBfX2Fzc2lnbih7fSwgcFtpXSk7XG4gICAgICAgICAgICB2YXIgcmVjb3JkID0gZmllbGRzLm1hcChmdW5jdGlvbiAoZikgeyByZXR1cm4gcFtpXVtmXTsgfSk7XG4gICAgICAgICAgICBvdXRwdXQucHVzaChyZWNvcmQuam9pbihcIixcIikpO1xuICAgICAgICB9O1xuICAgICAgICBmb3IgKHZhciBpIGluIHApIHtcbiAgICAgICAgICAgIF9sb29wXzMoaSk7XG4gICAgICAgIH1cbiAgICAgICAgY2xpcChvdXRwdXQuam9pbihcIlxcblwiKSk7XG4gICAgfTtcbiAgICBob3RrZXkoXCIkXCIsIHBsYXllclNoZWV0KTtcbiAgICBwbGF5ZXJTaGVldC5oZWxwID1cbiAgICAgICAgXCJHZW5lcmF0ZSBhIHBsYXllciBzdW1tYXJ5IG1lYW4gdG8gYmUgbWFkZSBpbnRvIGEgc3ByZWFkc2hlZXQuXCIgK1xuICAgICAgICAgICAgXCI8cD5UaGUgY2xpcGJvYXJkIHNob3VsZCBiZSBwYXN0ZWQgaW50byBhIENTViBhbmQgdGhlbiBpbXBvcnRlZC5cIjtcbiAgICB2YXIgaG9va3NMb2FkZWQgPSBmYWxzZTtcbiAgICB2YXIgaGFuZGljYXBTdHJpbmcgPSBmdW5jdGlvbiAocHJlZml4KSB7XG4gICAgICAgIHZhciBwID0gcHJlZml4ICE9PSB1bmRlZmluZWQgPyBwcmVmaXggOiBjb21iYXRIYW5kaWNhcCA+IDAgPyBcIkVuZW15IFdTXCIgOiBcIk15IFdTXCI7XG4gICAgICAgIHJldHVybiBwICsgKGNvbWJhdEhhbmRpY2FwID4gMCA/IFwiK1wiIDogXCJcIikgKyBjb21iYXRIYW5kaWNhcDtcbiAgICB9O1xuICAgIHZhciBsb2FkSG9va3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBzdXBlckRyYXdUZXh0ID0gTmVwdHVuZXNQcmlkZS5ucHVpLm1hcC5kcmF3VGV4dDtcbiAgICAgICAgTmVwdHVuZXNQcmlkZS5ucHVpLm1hcC5kcmF3VGV4dCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB1bml2ZXJzZSA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2U7XG4gICAgICAgICAgICB2YXIgbWFwID0gTmVwdHVuZXNQcmlkZS5ucHVpLm1hcDtcbiAgICAgICAgICAgIHN1cGVyRHJhd1RleHQoKTtcbiAgICAgICAgICAgIG1hcC5jb250ZXh0LmZvbnQgPSBcIlwiLmNvbmNhdCgxNCAqIG1hcC5waXhlbFJhdGlvLCBcInB4IE9wZW5TYW5zUmVndWxhciwgc2Fucy1zZXJpZlwiKTtcbiAgICAgICAgICAgIG1hcC5jb250ZXh0LmZpbGxTdHlsZSA9IFwiI0ZGMDAwMFwiO1xuICAgICAgICAgICAgbWFwLmNvbnRleHQudGV4dEFsaWduID0gXCJyaWdodFwiO1xuICAgICAgICAgICAgbWFwLmNvbnRleHQudGV4dEJhc2VsaW5lID0gXCJtaWRkbGVcIjtcbiAgICAgICAgICAgIHZhciB2ID0gdmVyc2lvbjtcbiAgICAgICAgICAgIGlmIChjb21iYXRIYW5kaWNhcCAhPT0gMCkge1xuICAgICAgICAgICAgICAgIHYgPSBcIlwiLmNvbmNhdChoYW5kaWNhcFN0cmluZygpLCBcIiBcIikuY29uY2F0KHYpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZHJhd092ZXJsYXlTdHJpbmcobWFwLmNvbnRleHQsIHYsIG1hcC52aWV3cG9ydFdpZHRoIC0gMTAsIG1hcC52aWV3cG9ydEhlaWdodCAtIDE2ICogbWFwLnBpeGVsUmF0aW8pO1xuICAgICAgICAgICAgaWYgKE5lcHR1bmVzUHJpZGUub3JpZ2luYWxQbGF5ZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIE5lcHR1bmVzUHJpZGUub3JpZ2luYWxQbGF5ZXIgPSB1bml2ZXJzZS5wbGF5ZXIudWlkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKE5lcHR1bmVzUHJpZGUub3JpZ2luYWxQbGF5ZXIgIT09IHVuaXZlcnNlLnBsYXllci51aWQpIHtcbiAgICAgICAgICAgICAgICB2YXIgbiA9IHVuaXZlcnNlLmdhbGF4eS5wbGF5ZXJzW3VuaXZlcnNlLnBsYXllci51aWRdLmFsaWFzO1xuICAgICAgICAgICAgICAgIGRyYXdPdmVybGF5U3RyaW5nKG1hcC5jb250ZXh0LCBuLCBtYXAudmlld3BvcnRXaWR0aCAtIDEwMCwgbWFwLnZpZXdwb3J0SGVpZ2h0IC0gMiAqIDE2ICogbWFwLnBpeGVsUmF0aW8pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHVuaXZlcnNlLnNlbGVjdGVkRmxlZXQgJiYgdW5pdmVyc2Uuc2VsZWN0ZWRGbGVldC5wYXRoLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKFwiU2VsZWN0ZWQgZmxlZXRcIiwgdW5pdmVyc2Uuc2VsZWN0ZWRGbGVldCk7XG4gICAgICAgICAgICAgICAgbWFwLmNvbnRleHQuZm9udCA9IFwiXCIuY29uY2F0KDE0ICogbWFwLnBpeGVsUmF0aW8sIFwicHggT3BlblNhbnNSZWd1bGFyLCBzYW5zLXNlcmlmXCIpO1xuICAgICAgICAgICAgICAgIG1hcC5jb250ZXh0LmZpbGxTdHlsZSA9IFwiI0ZGMDAwMFwiO1xuICAgICAgICAgICAgICAgIG1hcC5jb250ZXh0LnRleHRBbGlnbiA9IFwibGVmdFwiO1xuICAgICAgICAgICAgICAgIG1hcC5jb250ZXh0LnRleHRCYXNlbGluZSA9IFwibWlkZGxlXCI7XG4gICAgICAgICAgICAgICAgdmFyIGR5ID0gdW5pdmVyc2Uuc2VsZWN0ZWRGbGVldC55IC0gdW5pdmVyc2Uuc2VsZWN0ZWRGbGVldC5seTtcbiAgICAgICAgICAgICAgICB2YXIgZHggPSB1bml2ZXJzZS5zZWxlY3RlZEZsZWV0LnggLSB1bml2ZXJzZS5zZWxlY3RlZEZsZWV0Lmx4O1xuICAgICAgICAgICAgICAgIGR5ID0gdW5pdmVyc2Uuc2VsZWN0ZWRGbGVldC5wYXRoWzBdLnkgLSB1bml2ZXJzZS5zZWxlY3RlZEZsZWV0Lnk7XG4gICAgICAgICAgICAgICAgZHggPSB1bml2ZXJzZS5zZWxlY3RlZEZsZWV0LnBhdGhbMF0ueCAtIHVuaXZlcnNlLnNlbGVjdGVkRmxlZXQueDtcbiAgICAgICAgICAgICAgICB2YXIgbGluZUhlaWdodCA9IDE2ICogbWFwLnBpeGVsUmF0aW87XG4gICAgICAgICAgICAgICAgdmFyIHJhZGl1cyA9IDIgKiAwLjAyOCAqIG1hcC5zY2FsZSAqIG1hcC5waXhlbFJhdGlvO1xuICAgICAgICAgICAgICAgIHZhciBhbmdsZSA9IE1hdGguYXRhbihkeSAvIGR4KTtcbiAgICAgICAgICAgICAgICB2YXIgb2Zmc2V0eCA9IHJhZGl1cyAqIE1hdGguY29zKGFuZ2xlKTtcbiAgICAgICAgICAgICAgICB2YXIgb2Zmc2V0eSA9IHJhZGl1cyAqIE1hdGguc2luKGFuZ2xlKTtcbiAgICAgICAgICAgICAgICBpZiAob2Zmc2V0eCA+IDAgJiYgZHggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIG9mZnNldHggKj0gLTE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChvZmZzZXR5ID4gMCAmJiBkeSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0eSAqPSAtMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG9mZnNldHggPCAwICYmIGR4IDwgMCkge1xuICAgICAgICAgICAgICAgICAgICBvZmZzZXR4ICo9IC0xO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAob2Zmc2V0eSA8IDAgJiYgZHkgPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgIG9mZnNldHkgKj0gLTE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbWJhdE91dGNvbWVzKCk7XG4gICAgICAgICAgICAgICAgdmFyIHMgPSBmbGVldE91dGNvbWVzW3VuaXZlcnNlLnNlbGVjdGVkRmxlZXQudWlkXS5ldGE7XG4gICAgICAgICAgICAgICAgdmFyIG8gPSBmbGVldE91dGNvbWVzW3VuaXZlcnNlLnNlbGVjdGVkRmxlZXQudWlkXS5vdXRjb21lO1xuICAgICAgICAgICAgICAgIHZhciB4ID0gbWFwLndvcmxkVG9TY3JlZW5YKHVuaXZlcnNlLnNlbGVjdGVkRmxlZXQueCkgKyBvZmZzZXR4O1xuICAgICAgICAgICAgICAgIHZhciB5ID0gbWFwLndvcmxkVG9TY3JlZW5ZKHVuaXZlcnNlLnNlbGVjdGVkRmxlZXQueSkgKyBvZmZzZXR5O1xuICAgICAgICAgICAgICAgIGlmIChvZmZzZXR4IDwgMCkge1xuICAgICAgICAgICAgICAgICAgICBtYXAuY29udGV4dC50ZXh0QWxpZ24gPSBcInJpZ2h0XCI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGRyYXdPdmVybGF5U3RyaW5nKG1hcC5jb250ZXh0LCBzLCB4LCB5KTtcbiAgICAgICAgICAgICAgICBkcmF3T3ZlcmxheVN0cmluZyhtYXAuY29udGV4dCwgbywgeCwgeSArIGxpbmVIZWlnaHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFOZXB0dW5lc1ByaWRlLmdhbWVDb25maWcudHVybkJhc2VkICYmXG4gICAgICAgICAgICAgICAgdW5pdmVyc2UudGltZVRvVGljaygxKS5sZW5ndGggPCAzKSB7XG4gICAgICAgICAgICAgICAgdmFyIGxpbmVIZWlnaHQgPSAxNiAqIG1hcC5waXhlbFJhdGlvO1xuICAgICAgICAgICAgICAgIG1hcC5jb250ZXh0LmZvbnQgPSBcIlwiLmNvbmNhdCgxNCAqIG1hcC5waXhlbFJhdGlvLCBcInB4IE9wZW5TYW5zUmVndWxhciwgc2Fucy1zZXJpZlwiKTtcbiAgICAgICAgICAgICAgICBtYXAuY29udGV4dC5maWxsU3R5bGUgPSBcIiNGRjAwMDBcIjtcbiAgICAgICAgICAgICAgICBtYXAuY29udGV4dC50ZXh0QWxpZ24gPSBcImxlZnRcIjtcbiAgICAgICAgICAgICAgICBtYXAuY29udGV4dC50ZXh0QmFzZWxpbmUgPSBcIm1pZGRsZVwiO1xuICAgICAgICAgICAgICAgIHZhciBzID0gXCJUaWNrIDwgMTBzIGF3YXkhXCI7XG4gICAgICAgICAgICAgICAgaWYgKHVuaXZlcnNlLnRpbWVUb1RpY2soMSkgPT09IFwiMHNcIikge1xuICAgICAgICAgICAgICAgICAgICBzID0gXCJUaWNrIHBhc3NlZC4gQ2xpY2sgcHJvZHVjdGlvbiBjb3VudGRvd24gdG8gcmVmcmVzaC5cIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZHJhd092ZXJsYXlTdHJpbmcobWFwLmNvbnRleHQsIHMsIDEwMDAsIGxpbmVIZWlnaHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHVuaXZlcnNlLnNlbGVjdGVkU3RhciAmJlxuICAgICAgICAgICAgICAgIHVuaXZlcnNlLnNlbGVjdGVkU3Rhci5wdWlkICE9IHVuaXZlcnNlLnBsYXllci51aWQgJiZcbiAgICAgICAgICAgICAgICB1bml2ZXJzZS5zZWxlY3RlZFN0YXIucHVpZCAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAvLyBlbmVteSBzdGFyIHNlbGVjdGVkOyBzaG93IEhVRCBmb3Igc2Nhbm5pbmcgdmlzaWJpbGl0eVxuICAgICAgICAgICAgICAgIG1hcC5jb250ZXh0LnRleHRBbGlnbiA9IFwibGVmdFwiO1xuICAgICAgICAgICAgICAgIG1hcC5jb250ZXh0LnRleHRCYXNlbGluZSA9IFwibWlkZGxlXCI7XG4gICAgICAgICAgICAgICAgdmFyIHhPZmZzZXQgPSAyNiAqIG1hcC5waXhlbFJhdGlvO1xuICAgICAgICAgICAgICAgIC8vbWFwLmNvbnRleHQudHJhbnNsYXRlKHhPZmZzZXQsIDApO1xuICAgICAgICAgICAgICAgIHZhciBmbGVldHMgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlLmdhbGF4eS5mbGVldHM7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgZiBpbiBmbGVldHMpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZsZWV0ID0gZmxlZXRzW2ZdO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZmxlZXQucHVpZCA9PT0gdW5pdmVyc2UucGxheWVyLnVpZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGR4ID0gdW5pdmVyc2Uuc2VsZWN0ZWRTdGFyLnggLSBmbGVldC54O1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGR5ID0gdW5pdmVyc2Uuc2VsZWN0ZWRTdGFyLnkgLSBmbGVldC55O1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRpc3RhbmNlID0gTWF0aC5zcXJ0KGR4ICogZHggKyBkeSAqIGR5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBvZmZzZXR4ID0geE9mZnNldDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBvZmZzZXR5ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB4ID0gbWFwLndvcmxkVG9TY3JlZW5YKGZsZWV0LngpICsgb2Zmc2V0eDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB5ID0gbWFwLndvcmxkVG9TY3JlZW5ZKGZsZWV0LnkpICsgb2Zmc2V0eTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkaXN0YW5jZSA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5pdmVyc2UuZ2FsYXh5LnBsYXllcnNbdW5pdmVyc2Uuc2VsZWN0ZWRTdGFyLnB1aWRdLnRlY2guc2Nhbm5pbmdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZsZWV0LnBhdGggJiYgZmxlZXQucGF0aC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGR4ID0gZmxlZXQucGF0aFswXS54IC0gdW5pdmVyc2Uuc2VsZWN0ZWRTdGFyLng7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGR5ID0gZmxlZXQucGF0aFswXS55IC0gdW5pdmVyc2Uuc2VsZWN0ZWRTdGFyLnk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3RhbmNlID0gTWF0aC5zcXJ0KGR4ICogZHggKyBkeSAqIGR5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRpc3RhbmNlIDxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVuaXZlcnNlLmdhbGF4eS5wbGF5ZXJzW3VuaXZlcnNlLnNlbGVjdGVkU3Rhci5wdWlkXS50ZWNoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnNjYW5uaW5nLnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgc3RlcFJhZGl1cyA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2UuZ2FsYXh5LmZsZWV0X3NwZWVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZsZWV0LndhcnBTcGVlZClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGVwUmFkaXVzICo9IDM7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkeCA9IGZsZWV0LnggLSBmbGVldC5wYXRoWzBdLng7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkeSA9IGZsZWV0LnkgLSBmbGVldC5wYXRoWzBdLnk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgYW5nbGUgPSBNYXRoLmF0YW4oZHkgLyBkeCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgc3RlcHggPSBzdGVwUmFkaXVzICogTWF0aC5jb3MoYW5nbGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHN0ZXB5ID0gc3RlcFJhZGl1cyAqIE1hdGguc2luKGFuZ2xlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdGVweCA+IDAgJiYgZHggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RlcHggKj0gLTE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3RlcHkgPiAwICYmIGR5ID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ZXB5ICo9IC0xO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN0ZXB4IDwgMCAmJiBkeCA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGVweCAqPSAtMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdGVweSA8IDAgJiYgZHkgPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RlcHkgKj0gLTE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdGlja3MgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG8ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB4XzEgPSB0aWNrcyAqIHN0ZXB4ICsgTnVtYmVyKGZsZWV0LngpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB5XzEgPSB0aWNrcyAqIHN0ZXB5ICsgTnVtYmVyKGZsZWV0LnkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vbGV0IHN4ID0gbWFwLndvcmxkVG9TY3JlZW5YKHgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vbGV0IHN5ID0gbWFwLndvcmxkVG9TY3JlZW5ZKHkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGR4ID0geF8xIC0gdW5pdmVyc2Uuc2VsZWN0ZWRTdGFyLng7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZHkgPSB5XzEgLSB1bml2ZXJzZS5zZWxlY3RlZFN0YXIueTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXN0YW5jZSA9IE1hdGguc3FydChkeCAqIGR4ICsgZHkgKiBkeSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhkaXN0YW5jZSwgeCwgeSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9kcmF3T3ZlcmxheVN0cmluZyhtYXAuY29udGV4dCwgXCJvXCIsIHN4LCBzeSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGlja3MgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gd2hpbGUgKGRpc3RhbmNlID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bml2ZXJzZS5nYWxheHkucGxheWVyc1t1bml2ZXJzZS5zZWxlY3RlZFN0YXIucHVpZF0udGVjaFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuc2Nhbm5pbmcudmFsdWUgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aWNrcyA8PSBmbGVldC5ldGFGaXJzdCArIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGlja3MgLT0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB2aXNDb2xvciA9IFwiIzAwZmYwMFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFueVN0YXJDYW5TZWUodW5pdmVyc2Uuc2VsZWN0ZWRTdGFyLnB1aWQsIGZsZWV0KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpc0NvbG9yID0gXCIjODg4ODg4XCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkcmF3T3ZlcmxheVN0cmluZyhtYXAuY29udGV4dCwgXCJTY2FuIFwiLmNvbmNhdCh0aWNrVG9FdGFTdHJpbmcodGlja3MpKSwgeCwgeSwgdmlzQ29sb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vbWFwLmNvbnRleHQudHJhbnNsYXRlKC14T2Zmc2V0LCAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh1bml2ZXJzZS5ydWxlci5zdGFycy5sZW5ndGggPT0gMikge1xuICAgICAgICAgICAgICAgIHZhciBwMSA9IHVuaXZlcnNlLnJ1bGVyLnN0YXJzWzBdLnB1aWQ7XG4gICAgICAgICAgICAgICAgdmFyIHAyID0gdW5pdmVyc2UucnVsZXIuc3RhcnNbMV0ucHVpZDtcbiAgICAgICAgICAgICAgICBpZiAocDEgIT09IHAyICYmIHAxICE9PSAtMSAmJiBwMiAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhcInR3byBzdGFyIHJ1bGVyXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgLy9UT0RPOiBMZWFybiBtb3JlIGFib3V0IHRoaXMgaG9vay4gaXRzIHJ1biB0b28gbXVjaC4uXG4gICAgICAgIENydXguZm9ybWF0ID0gZnVuY3Rpb24gKHMsIHRlbXBsYXRlRGF0YSkge1xuICAgICAgICAgICAgaWYgKCFzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiZXJyb3JcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBpO1xuICAgICAgICAgICAgdmFyIGZwO1xuICAgICAgICAgICAgdmFyIHNwO1xuICAgICAgICAgICAgdmFyIHN1YjtcbiAgICAgICAgICAgIHZhciBwYXR0ZXJuO1xuICAgICAgICAgICAgaSA9IDA7XG4gICAgICAgICAgICBmcCA9IDA7XG4gICAgICAgICAgICBzcCA9IDA7XG4gICAgICAgICAgICBzdWIgPSBcIlwiO1xuICAgICAgICAgICAgcGF0dGVybiA9IFwiXCI7XG4gICAgICAgICAgICAvLyBsb29rIGZvciBzdGFuZGFyZCBwYXR0ZXJuc1xuICAgICAgICAgICAgd2hpbGUgKGZwID49IDAgJiYgaSA8IDEwMDApIHtcbiAgICAgICAgICAgICAgICBpID0gaSArIDE7XG4gICAgICAgICAgICAgICAgZnAgPSBzLnNlYXJjaChcIlxcXFxbXFxcXFtcIik7XG4gICAgICAgICAgICAgICAgc3AgPSBzLnNlYXJjaChcIlxcXFxdXFxcXF1cIik7XG4gICAgICAgICAgICAgICAgc3ViID0gcy5zbGljZShmcCArIDIsIHNwKTtcbiAgICAgICAgICAgICAgICB2YXIgdXJpID0gc3ViLnJlcGxhY2VBbGwoXCImI3gyRjtcIiwgXCIvXCIpO1xuICAgICAgICAgICAgICAgIHBhdHRlcm4gPSBcIltbXCIuY29uY2F0KHN1YiwgXCJdXVwiKTtcbiAgICAgICAgICAgICAgICBpZiAodGVtcGxhdGVEYXRhW3N1Yl0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBzID0gcy5yZXBsYWNlKHBhdHRlcm4sIHRlbXBsYXRlRGF0YVtzdWJdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoL15hcGk6XFx3ezZ9JC8udGVzdChzdWIpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBhcGlMaW5rID0gXCI8YSBvbkNsaWNrPSdDcnV4LmNydXgudHJpZ2dlcihcXFwic3dpdGNoX3VzZXJfYXBpXFxcIiwgXFxcIlwiLmNvbmNhdChzdWIsIFwiXFxcIiknPiBWaWV3IGFzIFwiKS5jb25jYXQoc3ViLCBcIjwvYT5cIik7XG4gICAgICAgICAgICAgICAgICAgIGFwaUxpbmsgKz0gXCIgb3IgPGEgb25DbGljaz0nQ3J1eC5jcnV4LnRyaWdnZXIoXFxcIm1lcmdlX3VzZXJfYXBpXFxcIiwgXFxcIlwiLmNvbmNhdChzdWIsIFwiXFxcIiknPiBNZXJnZSBcIikuY29uY2F0KHN1YiwgXCI8L2E+XCIpO1xuICAgICAgICAgICAgICAgICAgICBzID0gcy5yZXBsYWNlKHBhdHRlcm4sIGFwaUxpbmspO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChpc192YWxpZF9pbWFnZV91cmwodXJpKSkge1xuICAgICAgICAgICAgICAgICAgICBzID0gcy5yZXBsYWNlKHBhdHRlcm4sIFwiPGltZyB3aWR0aD1cXFwiMTAwJVxcXCIgc3JjPSdcIi5jb25jYXQodXJpLCBcIicgLz5cIikpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChpc192YWxpZF95b3V0dWJlKHVyaSkpIHtcbiAgICAgICAgICAgICAgICAgICAgLy9QYXNzXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzID0gcy5yZXBsYWNlKHBhdHRlcm4sIFwiKFwiLmNvbmNhdChzdWIsIFwiKVwiKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHM7XG4gICAgICAgIH07XG4gICAgICAgIHZhciBucHVpID0gTmVwdHVuZXNQcmlkZS5ucHVpO1xuICAgICAgICAvL1Jlc2VhcmNoIGJ1dHRvbiB0byBxdWlja2x5IHRlbGwgZnJpZW5kcyByZXNlYXJjaFxuICAgICAgICBOZXB0dW5lc1ByaWRlLnRlbXBsYXRlc1tcIm5wYV9yZXNlYXJjaFwiXSA9IFwiUmVzZWFyY2hcIjtcbiAgICAgICAgdmFyIHN1cGVyTmV3TWVzc2FnZUNvbW1lbnRCb3ggPSBucHVpLk5ld01lc3NhZ2VDb21tZW50Qm94O1xuICAgICAgICB2YXIgcmVwb3J0UmVzZWFyY2hIb29rID0gZnVuY3Rpb24gKF9lLCBfZCkge1xuICAgICAgICAgICAgdmFyIHRleHQgPSBnZXRfcmVzZWFyY2hfdGV4dChOZXB0dW5lc1ByaWRlKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHRleHQpO1xuICAgICAgICAgICAgdmFyIGluYm94ID0gTmVwdHVuZXNQcmlkZS5pbmJveDtcbiAgICAgICAgICAgIGluYm94LmNvbW1lbnREcmFmdHNbaW5ib3guc2VsZWN0ZWRNZXNzYWdlLmtleV0gKz0gdGV4dDtcbiAgICAgICAgICAgIGluYm94LnRyaWdnZXIoXCJzaG93X3NjcmVlblwiLCBcImRpcGxvbWFjeV9kZXRhaWxcIik7XG4gICAgICAgIH07XG4gICAgICAgIE5lcHR1bmVzUHJpZGUubnAub24oXCJwYXN0ZV9yZXNlYXJjaFwiLCByZXBvcnRSZXNlYXJjaEhvb2spO1xuICAgICAgICBucHVpLk5ld01lc3NhZ2VDb21tZW50Qm94ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHdpZGdldCA9IHN1cGVyTmV3TWVzc2FnZUNvbW1lbnRCb3goKTtcbiAgICAgICAgICAgIHZhciByZXNlYXJjaF9idXR0b24gPSBDcnV4LkJ1dHRvbihcIm5wYV9yZXNlYXJjaFwiLCBcInBhc3RlX3Jlc2VhcmNoXCIsIFwicmVzZWFyY2hcIikuZ3JpZCgxMSwgMTIsIDgsIDMpO1xuICAgICAgICAgICAgcmVzZWFyY2hfYnV0dG9uLnJvb3N0KHdpZGdldCk7XG4gICAgICAgICAgICByZXR1cm4gd2lkZ2V0O1xuICAgICAgICB9O1xuICAgICAgICB2YXIgc3VwZXJGb3JtYXRUaW1lID0gQ3J1eC5mb3JtYXRUaW1lO1xuICAgICAgICB2YXIgcmVsYXRpdmVUaW1lcyA9IDA7XG4gICAgICAgIENydXguZm9ybWF0VGltZSA9IGZ1bmN0aW9uIChtcywgbWlucywgc2Vjcykge1xuICAgICAgICAgICAgc3dpdGNoIChyZWxhdGl2ZVRpbWVzKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAwOiAvL3N0YW5kYXJkXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzdXBlckZvcm1hdFRpbWUobXMsIG1pbnMsIHNlY3MpO1xuICAgICAgICAgICAgICAgIGNhc2UgMTogLy9FVEEsIC0gdHVybihzKSBmb3IgdHVybmJhc2VkXG4gICAgICAgICAgICAgICAgICAgIGlmICghTmVwdHVuZXNQcmlkZS5nYW1lQ29uZmlnLnR1cm5CYXNlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1zVG9FdGFTdHJpbmcobXMsIFwiXCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRpY2tfcmF0ZSA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2UuZ2FsYXh5LnRpY2tfcmF0ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBcIlwiLmNvbmNhdChzdXBlckZvcm1hdFRpbWUobXMsIG1pbnMsIHNlY3MpLCBcIiAtIFwiKS5jb25jYXQoKCgobXMgLyAzNjAwMDAwKSAqIDEwKSAvXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGlja19yYXRlKS50b0ZpeGVkKDIpLCBcIiB0dXJuKHMpXCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2FzZSAyOiAvL2N5Y2xlcyArIHRpY2tzIGZvcm1hdFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbXNUb0N5Y2xlU3RyaW5nKG1zLCBcIlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgdmFyIHN3aXRjaFRpbWVzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgLy8wID0gc3RhbmRhcmQsIDEgPSBFVEEsIC0gdHVybihzKSBmb3IgdHVybmJhc2VkLCAyID0gY3ljbGVzICsgdGlja3MgZm9ybWF0XG4gICAgICAgICAgICByZWxhdGl2ZVRpbWVzID0gKHJlbGF0aXZlVGltZXMgKyAxKSAlIDM7XG4gICAgICAgIH07XG4gICAgICAgIGhvdGtleShcIiVcIiwgc3dpdGNoVGltZXMpO1xuICAgICAgICBzd2l0Y2hUaW1lcy5oZWxwID1cbiAgICAgICAgICAgIFwiQ2hhbmdlIHRoZSBkaXNwbGF5IG9mIEVUQXMgYmV0d2VlbiByZWxhdGl2ZSB0aW1lcywgYWJzb2x1dGUgY2xvY2sgdGltZXMsIGFuZCBjeWNsZSB0aW1lcy4gTWFrZXMgcHJlZGljdGluZyBcIiArXG4gICAgICAgICAgICAgICAgXCJpbXBvcnRhbnQgdGltZXMgb2YgZGF5IHRvIHNpZ24gaW4gYW5kIGNoZWNrIG11Y2ggZWFzaWVyIGVzcGVjaWFsbHkgZm9yIG11bHRpLWxlZyBmbGVldCBtb3ZlbWVudHMuIFNvbWV0aW1lcyB5b3UgXCIgK1xuICAgICAgICAgICAgICAgIFwid2lsbCBuZWVkIHRvIHJlZnJlc2ggdGhlIGRpc3BsYXkgdG8gc2VlIHRoZSBkaWZmZXJlbnQgdGltZXMuXCI7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoQ3J1eCwgXCJ0b3VjaEVuYWJsZWRcIiwge1xuICAgICAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gZmFsc2U7IH0sXG4gICAgICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAoeCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkNydXgudG91Y2hFbmFibGVkIHNldCBpZ25vcmVkXCIsIHgpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coZSk7XG4gICAgICAgIH1cbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KE5lcHR1bmVzUHJpZGUubnB1aS5tYXAsIFwiaWdub3JlTW91c2VFdmVudHNcIiwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiBmYWxzZTsgfSxcbiAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIk5lcHR1bmVzUHJpZGUubnB1aS5tYXAuaWdub3JlTW91c2VFdmVudHMgc2V0IGlnbm9yZWRcIiwgeCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9KTtcbiAgICAgICAgaG9va3NMb2FkZWQgPSB0cnVlO1xuICAgIH07XG4gICAgdmFyIGluaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBfYTtcbiAgICAgICAgaWYgKCgoX2EgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2EuZ2FsYXh5KSAmJiBOZXB0dW5lc1ByaWRlLm5wdWkubWFwKSB7XG4gICAgICAgICAgICBsaW5rRmxlZXRzKCk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkZsZWV0IGxpbmtpbmcgY29tcGxldGUuXCIpO1xuICAgICAgICAgICAgaWYgKCFob29rc0xvYWRlZCkge1xuICAgICAgICAgICAgICAgIGxvYWRIb29rcygpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiSFVEIHNldHVwIGNvbXBsZXRlLlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiSFVEIHNldHVwIGFscmVhZHkgZG9uZTsgc2tpcHBpbmcuXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaG9tZVBsYW5ldHMoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiR2FtZSBub3QgZnVsbHkgaW5pdGlhbGl6ZWQgeWV0OyB3YWl0LlwiLCBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgaG90a2V5KFwiQFwiLCBpbml0KTtcbiAgICBpbml0LmhlbHAgPVxuICAgICAgICBcIlJlaW5pdGlhbGl6ZSBOZXB0dW5lJ3MgUHJpZGUgQWdlbnQuIFVzZSB0aGUgQCBob3RrZXkgaWYgdGhlIHZlcnNpb24gaXMgbm90IGJlaW5nIHNob3duIG9uIHRoZSBtYXAgYWZ0ZXIgZHJhZ2dpbmcuXCI7XG4gICAgaWYgKCgoX2IgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlKSA9PT0gbnVsbCB8fCBfYiA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2IuZ2FsYXh5KSAmJiBOZXB0dW5lc1ByaWRlLm5wdWkubWFwKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiVW5pdmVyc2UgYWxyZWFkeSBsb2FkZWQuIEh5cGVybGluayBmbGVldHMgJiBsb2FkIGhvb2tzLlwiKTtcbiAgICAgICAgaW5pdCgpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJVbml2ZXJzZSBub3QgbG9hZGVkLiBIb29rIG9uU2VydmVyUmVzcG9uc2UuXCIpO1xuICAgICAgICB2YXIgc3VwZXJPblNlcnZlclJlc3BvbnNlXzEgPSBOZXB0dW5lc1ByaWRlLm5wLm9uU2VydmVyUmVzcG9uc2U7XG4gICAgICAgIE5lcHR1bmVzUHJpZGUubnAub25TZXJ2ZXJSZXNwb25zZSA9IGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgc3VwZXJPblNlcnZlclJlc3BvbnNlXzEocmVzcG9uc2UpO1xuICAgICAgICAgICAgaWYgKHJlc3BvbnNlLmV2ZW50ID09PSBcIm9yZGVyOnBsYXllcl9hY2hpZXZlbWVudHNcIikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiSW5pdGlhbCBsb2FkIGNvbXBsZXRlLiBSZWluc3RhbGwuXCIpO1xuICAgICAgICAgICAgICAgIGluaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHJlc3BvbnNlLmV2ZW50ID09PSBcIm9yZGVyOmZ1bGxfdW5pdmVyc2VcIikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiVW5pdmVyc2UgcmVjZWl2ZWQuIFJlaW5zdGFsbC5cIik7XG4gICAgICAgICAgICAgICAgTmVwdHVuZXNQcmlkZS5vcmlnaW5hbFBsYXllciA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2UucGxheWVyLnVpZDtcbiAgICAgICAgICAgICAgICBpbml0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICghaG9va3NMb2FkZWQgJiYgTmVwdHVuZXNQcmlkZS5ucHVpLm1hcCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiSG9va3MgbmVlZCBsb2FkaW5nIGFuZCBtYXAgaXMgcmVhZHkuIFJlaW5zdGFsbC5cIik7XG4gICAgICAgICAgICAgICAgaW5pdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cbiAgICB2YXIgb3RoZXJVc2VyQ29kZSA9IHVuZGVmaW5lZDtcbiAgICB2YXIgZ2FtZSA9IE5lcHR1bmVzUHJpZGUuZ2FtZU51bWJlcjtcbiAgICAvL1RoaXMgcHV0cyB5b3UgaW50byB0aGVpciBwb3NpdGlvbi5cbiAgICAvL0hvdyBpcyBpdCBkaWZmZXJlbnQ/XG4gICAgdmFyIHN3aXRjaFVzZXIgPSBmdW5jdGlvbiAoZXZlbnQsIGRhdGEpIHtcbiAgICAgICAgaWYgKE5lcHR1bmVzUHJpZGUub3JpZ2luYWxQbGF5ZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgTmVwdHVuZXNQcmlkZS5vcmlnaW5hbFBsYXllciA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2UucGxheWVyLnVpZDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgY29kZSA9IChkYXRhID09PSBudWxsIHx8IGRhdGEgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGRhdGEuc3BsaXQoXCI6XCIpWzFdKSB8fCBvdGhlclVzZXJDb2RlO1xuICAgICAgICBvdGhlclVzZXJDb2RlID0gY29kZTtcbiAgICAgICAgaWYgKG90aGVyVXNlckNvZGUpIHtcbiAgICAgICAgICAgIHZhciBwYXJhbXMgPSB7XG4gICAgICAgICAgICAgICAgZ2FtZV9udW1iZXI6IGdhbWUsXG4gICAgICAgICAgICAgICAgYXBpX3ZlcnNpb246IFwiMC4xXCIsXG4gICAgICAgICAgICAgICAgY29kZTogb3RoZXJVc2VyQ29kZSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB2YXIgZWdnZXJzID0galF1ZXJ5LmFqYXgoe1xuICAgICAgICAgICAgICAgIHR5cGU6IFwiUE9TVFwiLFxuICAgICAgICAgICAgICAgIHVybDogXCJodHRwczovL25wLmlyb25oZWxtZXQuY29tL2FwaVwiLFxuICAgICAgICAgICAgICAgIGFzeW5jOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBkYXRhOiBwYXJhbXMsXG4gICAgICAgICAgICAgICAgZGF0YVR5cGU6IFwianNvblwiLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvL0xvYWRzIHRoZSBwdWxsIHVuaXZlcnNlIGRhdGEgaW50byB0aGUgZnVuY3Rpb24uIFRoYXRzIHRoZSBkaWZmZXJlbmNlLlxuICAgICAgICAgICAgLy9UaGUgb3RoZXIgdmVyc2lvbiBsb2FkcyBhbiB1cGRhdGVkIGdhbGF4eSBpbnRvIHRoZSBmdW5jdGlvblxuICAgICAgICAgICAgTmVwdHVuZXNQcmlkZS5ucC5vbkZ1bGxVbml2ZXJzZShudWxsLCBlZ2dlcnMucmVzcG9uc2VKU09OLnNjYW5uaW5nX2RhdGEpO1xuICAgICAgICAgICAgTmVwdHVuZXNQcmlkZS5ucHVpLm9uSGlkZVNjcmVlbihudWxsLCB0cnVlKTtcbiAgICAgICAgICAgIE5lcHR1bmVzUHJpZGUubnAudHJpZ2dlcihcInNlbGVjdF9wbGF5ZXJcIiwgW1xuICAgICAgICAgICAgICAgIE5lcHR1bmVzUHJpZGUudW5pdmVyc2UucGxheWVyLnVpZCxcbiAgICAgICAgICAgICAgICB0cnVlLFxuICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICBpbml0KCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGhvdGtleShcIj5cIiwgc3dpdGNoVXNlcik7XG4gICAgc3dpdGNoVXNlci5oZWxwID1cbiAgICAgICAgXCJTd2l0Y2ggdmlld3MgdG8gdGhlIGxhc3QgdXNlciB3aG9zZSBBUEkga2V5IHdhcyB1c2VkIHRvIGxvYWQgZGF0YS4gVGhlIEhVRCBzaG93cyB0aGUgY3VycmVudCB1c2VyIHdoZW4gXCIgK1xuICAgICAgICAgICAgXCJpdCBpcyBub3QgeW91ciBvd24gYWxpYXMgdG8gaGVscCByZW1pbmQgeW91IHRoYXQgeW91IGFyZW4ndCBpbiBjb250cm9sIG9mIHRoaXMgdXNlci5cIjtcbiAgICBob3RrZXkoXCJ8XCIsIG1lcmdlVXNlcik7XG4gICAgbWVyZ2VVc2VyLmhlbHAgPVxuICAgICAgICBcIk1lcmdlIHRoZSBsYXRlc3QgZGF0YSBmcm9tIHRoZSBsYXN0IHVzZXIgd2hvc2UgQVBJIGtleSB3YXMgdXNlZCB0byBsb2FkIGRhdGEuIFRoaXMgaXMgdXNlZnVsIGFmdGVyIGEgdGljayBcIiArXG4gICAgICAgICAgICBcInBhc3NlcyBhbmQgeW91J3ZlIHJlbG9hZGVkLCBidXQgeW91IHN0aWxsIHdhbnQgdGhlIG1lcmdlZCBzY2FuIGRhdGEgZnJvbSB0d28gcGxheWVycyBvbnNjcmVlbi5cIjtcbiAgICBOZXB0dW5lc1ByaWRlLm5wLm9uKFwic3dpdGNoX3VzZXJfYXBpXCIsIHN3aXRjaFVzZXIpO1xuICAgIE5lcHR1bmVzUHJpZGUubnAub24oXCJtZXJnZV91c2VyX2FwaVwiLCBtZXJnZVVzZXIpO1xuICAgIHZhciBucGFIZWxwID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgaGVscCA9IFtcIjxIMT5cIi5jb25jYXQodGl0bGUsIFwiPC9IMT5cIildO1xuICAgICAgICBmb3IgKHZhciBwYWlyIGluIGhvdGtleXMpIHtcbiAgICAgICAgICAgIHZhciBrZXkgPSBob3RrZXlzW3BhaXJdWzBdO1xuICAgICAgICAgICAgdmFyIGFjdGlvbiA9IGhvdGtleXNbcGFpcl1bMV07XG4gICAgICAgICAgICBoZWxwLnB1c2goXCI8aDI+SG90a2V5OiBcIi5jb25jYXQoa2V5LCBcIjwvaDI+XCIpKTtcbiAgICAgICAgICAgIGlmIChhY3Rpb24uaGVscCkge1xuICAgICAgICAgICAgICAgIGhlbHAucHVzaChhY3Rpb24uaGVscCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBoZWxwLnB1c2goXCI8cD5ObyBkb2N1bWVudGF0aW9uIHlldC48cD48Y29kZT5cIi5jb25jYXQoYWN0aW9uLnRvTG9jYWxlU3RyaW5nKCksIFwiPC9jb2RlPlwiKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5oZWxwSFRNTCA9IGhlbHAuam9pbihcIlwiKTtcbiAgICAgICAgTmVwdHVuZXNQcmlkZS5ucC50cmlnZ2VyKFwic2hvd19zY3JlZW5cIiwgXCJoZWxwXCIpO1xuICAgIH07XG4gICAgbnBhSGVscC5oZWxwID0gXCJEaXNwbGF5IHRoaXMgaGVscCBzY3JlZW4uXCI7XG4gICAgaG90a2V5KFwiP1wiLCBucGFIZWxwKTtcbiAgICB2YXIgYXV0b2NvbXBsZXRlTW9kZSA9IDA7XG4gICAgdmFyIGF1dG9jb21wbGV0ZVRyaWdnZXIgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICBpZiAoZS50YXJnZXQudHlwZSA9PT0gXCJ0ZXh0YXJlYVwiKSB7XG4gICAgICAgICAgICBpZiAoYXV0b2NvbXBsZXRlTW9kZSkge1xuICAgICAgICAgICAgICAgIHZhciBzdGFydCA9IGF1dG9jb21wbGV0ZU1vZGU7XG4gICAgICAgICAgICAgICAgdmFyIGVuZEJyYWNrZXQgPSBlLnRhcmdldC52YWx1ZS5pbmRleE9mKFwiXVwiLCBzdGFydCk7XG4gICAgICAgICAgICAgICAgaWYgKGVuZEJyYWNrZXQgPT09IC0xKVxuICAgICAgICAgICAgICAgICAgICBlbmRCcmFja2V0ID0gZS50YXJnZXQudmFsdWUubGVuZ3RoO1xuICAgICAgICAgICAgICAgIHZhciBhdXRvU3RyaW5nID0gZS50YXJnZXQudmFsdWUuc3Vic3RyaW5nKHN0YXJ0LCBlbmRCcmFja2V0KTtcbiAgICAgICAgICAgICAgICB2YXIga2V5ID0gZS5rZXk7XG4gICAgICAgICAgICAgICAgaWYgKGtleSA9PT0gXCJdXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgYXV0b2NvbXBsZXRlTW9kZSA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHZhciBtID0gYXV0b1N0cmluZy5tYXRjaCgvXlswLTldWzAtOV0qJC8pO1xuICAgICAgICAgICAgICAgICAgICBpZiAobSA9PT0gbnVsbCB8fCBtID09PSB2b2lkIDAgPyB2b2lkIDAgOiBtLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHB1aWQgPSBOdW1iZXIoYXV0b1N0cmluZyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZW5kID0gZS50YXJnZXQuc2VsZWN0aW9uRW5kO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGF1dG8gPSBcIlwiLmNvbmNhdChwdWlkLCBcIl1dIFwiKS5jb25jYXQoTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5nYWxheHkucGxheWVyc1twdWlkXS5hbGlhcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBlLnRhcmdldC52YWx1ZSA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZS50YXJnZXQudmFsdWUuc3Vic3RyaW5nKDAsIHN0YXJ0KSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF1dG8gK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlLnRhcmdldC52YWx1ZS5zdWJzdHJpbmcoZW5kLCBlLnRhcmdldC52YWx1ZS5sZW5ndGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZS50YXJnZXQuc2VsZWN0aW9uU3RhcnQgPSBzdGFydCArIGF1dG8ubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICAgICAgZS50YXJnZXQuc2VsZWN0aW9uRW5kID0gc3RhcnQgKyBhdXRvLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGUudGFyZ2V0LnNlbGVjdGlvblN0YXJ0ID4gMSkge1xuICAgICAgICAgICAgICAgIHZhciBzdGFydCA9IGUudGFyZ2V0LnNlbGVjdGlvblN0YXJ0IC0gMjtcbiAgICAgICAgICAgICAgICB2YXIgc3MgPSBlLnRhcmdldC52YWx1ZS5zdWJzdHJpbmcoc3RhcnQsIHN0YXJ0ICsgMik7XG4gICAgICAgICAgICAgICAgYXV0b2NvbXBsZXRlTW9kZSA9IHNzID09PSBcIltbXCIgPyBlLnRhcmdldC5zZWxlY3Rpb25TdGFydCA6IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcihcImtleXVwXCIsIGF1dG9jb21wbGV0ZVRyaWdnZXIpO1xuICAgIGNvbnNvbGUubG9nKFwiU0FUOiBOZXB0dW5lJ3MgUHJpZGUgQWdlbnQgaW5qZWN0aW9uIGZpbmlzaGVkLlwiKTtcbiAgICBjb25zb2xlLmxvZyhcIkdldHRpbmcgaGVybyFcIiwgZ2V0X2hlcm8oTmVwdHVuZXNQcmlkZS51bml2ZXJzZSkpO1xufVxudmFyIGZvcmNlX2FkZF9jdXN0b21fcGxheWVyX3BhbmVsID0gZnVuY3Rpb24gKCkge1xuICAgIGlmIChcIlBsYXllclBhbmVsXCIgaW4gTmVwdHVuZXNQcmlkZS5ucHVpKSB7XG4gICAgICAgIGFkZF9jdXN0b21fcGxheWVyX3BhbmVsKCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBzZXRUaW1lb3V0KGFkZF9jdXN0b21fcGxheWVyX3BhbmVsLCAzMDAwKTtcbiAgICB9XG59O1xudmFyIGFkZF9jdXN0b21fcGxheWVyX3BhbmVsID0gZnVuY3Rpb24gKCkge1xuICAgIE5lcHR1bmVzUHJpZGUubnB1aS5QbGF5ZXJQYW5lbCA9IGZ1bmN0aW9uIChwbGF5ZXIsIHNob3dFbXBpcmUpIHtcbiAgICAgICAgdmFyIHVuaXZlcnNlID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZTtcbiAgICAgICAgdmFyIG5wdWkgPSBOZXB0dW5lc1ByaWRlLm5wdWk7XG4gICAgICAgIHZhciBwbGF5ZXJQYW5lbCA9IENydXguV2lkZ2V0KFwicmVsXCIpLnNpemUoNDgwLCAyNjQgLSA4ICsgNDgpO1xuICAgICAgICB2YXIgaGVhZGluZyA9IFwicGxheWVyXCI7XG4gICAgICAgIGlmICh1bml2ZXJzZS5wbGF5ZXJBY2hpZXZlbWVudHMgJiZcbiAgICAgICAgICAgIE5lcHR1bmVzUHJpZGUuZ2FtZUNvbmZpZy5hbm9ueW1pdHkgPT09IDApIHtcbiAgICAgICAgICAgIGlmICh1bml2ZXJzZS5wbGF5ZXJBY2hpZXZlbWVudHNbcGxheWVyLnVpZF0pIHtcbiAgICAgICAgICAgICAgICBpZiAodW5pdmVyc2UucGxheWVyQWNoaWV2ZW1lbnRzW3BsYXllci51aWRdLnByZW1pdW0gPT09IFwicHJlbWl1bVwiKSB7XG4gICAgICAgICAgICAgICAgICAgIGhlYWRpbmcgPSBcInByZW1pdW1fcGxheWVyXCI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh1bml2ZXJzZS5wbGF5ZXJBY2hpZXZlbWVudHNbcGxheWVyLnVpZF0ucHJlbWl1bSA9PT0gXCJsaWZldGltZVwiKSB7XG4gICAgICAgICAgICAgICAgICAgIGhlYWRpbmcgPSBcImxpZmV0aW1lX3ByZW1pdW1fcGxheWVyXCI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIENydXguVGV4dChoZWFkaW5nLCBcInNlY3Rpb25fdGl0bGUgY29sX2JsYWNrXCIpXG4gICAgICAgICAgICAuZ3JpZCgwLCAwLCAzMCwgMylcbiAgICAgICAgICAgIC5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgIGlmIChwbGF5ZXIuYWkpIHtcbiAgICAgICAgICAgIENydXguVGV4dChcImFpX2FkbWluXCIsIFwidHh0X3JpZ2h0IHBhZDEyXCIpXG4gICAgICAgICAgICAgICAgLmdyaWQoMCwgMCwgMzAsIDMpXG4gICAgICAgICAgICAgICAgLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgfVxuICAgICAgICBDcnV4LkltYWdlKFwiLi4vaW1hZ2VzL2F2YXRhcnMvMTYwL1wiLmNvbmNhdChwbGF5ZXIuYXZhdGFyLCBcIi5qcGdcIiksIFwiYWJzXCIpXG4gICAgICAgICAgICAuZ3JpZCgwLCA2LCAxMCwgMTApXG4gICAgICAgICAgICAucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICBDcnV4LldpZGdldChcInBjaV80OF9cIi5jb25jYXQocGxheWVyLnVpZCkpLmdyaWQoNywgMTMsIDMsIDMpLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgQ3J1eC5XaWRnZXQoXCJjb2xfYWNjZW50XCIpLmdyaWQoMCwgMywgMzAsIDMpLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgQ3J1eC5UZXh0KFwiXCIsIFwic2NyZWVuX3N1YnRpdGxlXCIpXG4gICAgICAgICAgICAuZ3JpZCgwLCAzLCAzMCwgMylcbiAgICAgICAgICAgIC5yYXdIVE1MKHBsYXllci5xdWFsaWZpZWRBbGlhcylcbiAgICAgICAgICAgIC5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgIC8vIEFjaGlldmVtZW50c1xuICAgICAgICB2YXIgbXlBY2hpZXZlbWVudHM7XG4gICAgICAgIC8vVT0+VG94aWNcbiAgICAgICAgLy9WPT5NYWdpY1xuICAgICAgICAvLzU9PkZsb21iYWV1XG4gICAgICAgIC8vVz0+V2l6YXJkXG4gICAgICAgIGlmICh1bml2ZXJzZS5wbGF5ZXJBY2hpZXZlbWVudHMpIHtcbiAgICAgICAgICAgIG15QWNoaWV2ZW1lbnRzID0gdW5pdmVyc2UucGxheWVyQWNoaWV2ZW1lbnRzW3BsYXllci51aWRdO1xuICAgICAgICAgICAgaWYgKGFwZV9wbGF5ZXJzID09PSBudWxsIHx8IGFwZV9wbGF5ZXJzID09PSB2b2lkIDAgPyB2b2lkIDAgOiBhcGVfcGxheWVycy5pbmNsdWRlcyhwbGF5ZXIucmF3QWxpYXMpKSB7XG4gICAgICAgICAgICAgICAgaWYgKG15QWNoaWV2ZW1lbnRzLmV4dHJhX2JhZGdlcyA9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgbXlBY2hpZXZlbWVudHMuZXh0cmFfYmFkZ2VzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgbXlBY2hpZXZlbWVudHMuYmFkZ2VzID0gXCJhXCIuY29uY2F0KG15QWNoaWV2ZW1lbnRzLmJhZGdlcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHBsYXllci5yYXdBbGlhcyA9PSBcIkxvcmVudHpcIikge1xuICAgICAgICAgICAgICAgIGlmIChteUFjaGlldmVtZW50cy5kZXZfYmFkZ2UgPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIG15QWNoaWV2ZW1lbnRzLmRldl9iYWRnZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIG15QWNoaWV2ZW1lbnRzLmJhZGdlcyA9IFwiV1wiLmNvbmNhdChteUFjaGlldmVtZW50cy5iYWRnZXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHBsYXllci5yYXdBbGlhcyA9PSBcIkEgU3RvbmVkIEFwZVwiKSB7XG4gICAgICAgICAgICAgICAgaWYgKG15QWNoaWV2ZW1lbnRzLmRldl9iYWRnZSA9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgbXlBY2hpZXZlbWVudHMuZGV2X2JhZGdlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgbXlBY2hpZXZlbWVudHMuYmFkZ2VzID0gXCI1XCIuY29uY2F0KG15QWNoaWV2ZW1lbnRzLmJhZGdlcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChteUFjaGlldmVtZW50cykge1xuICAgICAgICAgICAgbnB1aVxuICAgICAgICAgICAgICAgIC5TbWFsbEJhZGdlUm93KG15QWNoaWV2ZW1lbnRzLmJhZGdlcylcbiAgICAgICAgICAgICAgICAuZ3JpZCgwLCAzLCAzMCwgMylcbiAgICAgICAgICAgICAgICAucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICB9XG4gICAgICAgIENydXguV2lkZ2V0KFwiY29sX2JsYWNrXCIpLmdyaWQoMTAsIDYsIDIwLCAzKS5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgIGlmIChwbGF5ZXIudWlkICE9IGdldF9oZXJvKE5lcHR1bmVzUHJpZGUudW5pdmVyc2UpLnVpZCAmJiBwbGF5ZXIuYWkgPT0gMCkge1xuICAgICAgICAgICAgLy9Vc2UgdGhpcyB0byBvbmx5IHZpZXcgd2hlbiB0aGV5IGFyZSB3aXRoaW4gc2Nhbm5pbmc6XG4gICAgICAgICAgICAvL3VuaXZlcnNlLnNlbGVjdGVkU3Rhci52ICE9IFwiMFwiXG4gICAgICAgICAgICB2YXIgdG90YWxfc2VsbF9jb3N0ID0gZ2V0X3RlY2hfdHJhZGVfY29zdChnZXRfaGVybyhOZXB0dW5lc1ByaWRlLnVuaXZlcnNlKSwgcGxheWVyKTtcbiAgICAgICAgICAgIC8qKiogU0hBUkUgQUxMIFRFQ0ggICoqKi9cbiAgICAgICAgICAgIHZhciBidG4gPSBDcnV4LkJ1dHRvbihcIlwiLCBcInNoYXJlX2FsbF90ZWNoXCIsIHBsYXllcilcbiAgICAgICAgICAgICAgICAuYWRkU3R5bGUoXCJmd2RcIilcbiAgICAgICAgICAgICAgICAucmF3SFRNTChcIlNoYXJlIEFsbCBUZWNoOiAkXCIuY29uY2F0KHRvdGFsX3NlbGxfY29zdCkpXG4gICAgICAgICAgICAgICAgLmdyaWQoMTAsIDMxLCAxNCwgMyk7XG4gICAgICAgICAgICAvL0Rpc2FibGUgaWYgaW4gYSBnYW1lIHdpdGggRkEgJiBTY2FuIChCVUcpXG4gICAgICAgICAgICB2YXIgY29uZmlnID0gTmVwdHVuZXNQcmlkZS5nYW1lQ29uZmlnO1xuICAgICAgICAgICAgaWYgKCEoY29uZmlnLnRyYWRlU2Nhbm5lZCAmJiBjb25maWcuYWxsaWFuY2VzKSkge1xuICAgICAgICAgICAgICAgIGlmIChnZXRfaGVybyhOZXB0dW5lc1ByaWRlLnVuaXZlcnNlKS5jYXNoID49IHRvdGFsX3NlbGxfY29zdCkge1xuICAgICAgICAgICAgICAgICAgICBidG4ucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYnRuLmRpc2FibGUoKS5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLyoqKiBQQVkgRk9SIEFMTCBURUNIICoqKi9cbiAgICAgICAgICAgIHZhciB0b3RhbF9idXlfY29zdCA9IGdldF90ZWNoX3RyYWRlX2Nvc3QocGxheWVyLCBnZXRfaGVybyhOZXB0dW5lc1ByaWRlLnVuaXZlcnNlKSk7XG4gICAgICAgICAgICBidG4gPSBDcnV4LkJ1dHRvbihcIlwiLCBcImJ1eV9hbGxfdGVjaFwiLCB7XG4gICAgICAgICAgICAgICAgcGxheWVyOiBwbGF5ZXIsXG4gICAgICAgICAgICAgICAgdGVjaDogbnVsbCxcbiAgICAgICAgICAgICAgICBjb3N0OiB0b3RhbF9idXlfY29zdCxcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmFkZFN0eWxlKFwiZndkXCIpXG4gICAgICAgICAgICAgICAgLnJhd0hUTUwoXCJQYXkgZm9yIEFsbCBUZWNoOiAkXCIuY29uY2F0KHRvdGFsX2J1eV9jb3N0KSlcbiAgICAgICAgICAgICAgICAuZ3JpZCgxMCwgNDksIDE0LCAzKTtcbiAgICAgICAgICAgIGlmIChnZXRfaGVybyhOZXB0dW5lc1ByaWRlLnVuaXZlcnNlKS5jYXNoID49IHRvdGFsX3NlbGxfY29zdCkge1xuICAgICAgICAgICAgICAgIGJ0bi5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBidG4uZGlzYWJsZSgpLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8qSW5kaXZpZHVhbCB0ZWNocyovXG4gICAgICAgICAgICB2YXIgX25hbWVfbWFwID0ge1xuICAgICAgICAgICAgICAgIHNjYW5uaW5nOiBcIlNjYW5uaW5nXCIsXG4gICAgICAgICAgICAgICAgcHJvcHVsc2lvbjogXCJIeXBlcnNwYWNlIFJhbmdlXCIsXG4gICAgICAgICAgICAgICAgdGVycmFmb3JtaW5nOiBcIlRlcnJhZm9ybWluZ1wiLFxuICAgICAgICAgICAgICAgIHJlc2VhcmNoOiBcIkV4cGVyaW1lbnRhdGlvblwiLFxuICAgICAgICAgICAgICAgIHdlYXBvbnM6IFwiV2VhcG9uc1wiLFxuICAgICAgICAgICAgICAgIGJhbmtpbmc6IFwiQmFua2luZ1wiLFxuICAgICAgICAgICAgICAgIG1hbnVmYWN0dXJpbmc6IFwiTWFudWZhY3R1cmluZ1wiLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHZhciB0ZWNocyA9IFtcbiAgICAgICAgICAgICAgICBcInNjYW5uaW5nXCIsXG4gICAgICAgICAgICAgICAgXCJwcm9wdWxzaW9uXCIsXG4gICAgICAgICAgICAgICAgXCJ0ZXJyYWZvcm1pbmdcIixcbiAgICAgICAgICAgICAgICBcInJlc2VhcmNoXCIsXG4gICAgICAgICAgICAgICAgXCJ3ZWFwb25zXCIsXG4gICAgICAgICAgICAgICAgXCJiYW5raW5nXCIsXG4gICAgICAgICAgICAgICAgXCJtYW51ZmFjdHVyaW5nXCIsXG4gICAgICAgICAgICBdO1xuICAgICAgICAgICAgdGVjaHMuZm9yRWFjaChmdW5jdGlvbiAodGVjaCwgaSkge1xuICAgICAgICAgICAgICAgIHZhciBvbmVfdGVjaF9jb3N0ID0gZ2V0X3RlY2hfdHJhZGVfY29zdChwbGF5ZXIsIGdldF9oZXJvKE5lcHR1bmVzUHJpZGUudW5pdmVyc2UpLCB0ZWNoKTtcbiAgICAgICAgICAgICAgICB2YXIgb25lX3RlY2ggPSBDcnV4LkJ1dHRvbihcIlwiLCBcImJ1eV9vbmVfdGVjaFwiLCB7XG4gICAgICAgICAgICAgICAgICAgIHBsYXllcjogcGxheWVyLFxuICAgICAgICAgICAgICAgICAgICB0ZWNoOiB0ZWNoLFxuICAgICAgICAgICAgICAgICAgICBjb3N0OiBvbmVfdGVjaF9jb3N0LFxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIC5hZGRTdHlsZShcImZ3ZFwiKVxuICAgICAgICAgICAgICAgICAgICAucmF3SFRNTChcIlBheTogJFwiLmNvbmNhdChvbmVfdGVjaF9jb3N0KSlcbiAgICAgICAgICAgICAgICAgICAgLmdyaWQoMTUsIDM0LjUgKyBpICogMiwgNywgMik7XG4gICAgICAgICAgICAgICAgaWYgKGdldF9oZXJvKE5lcHR1bmVzUHJpZGUudW5pdmVyc2UpLmNhc2ggPj0gb25lX3RlY2hfY29zdCAmJlxuICAgICAgICAgICAgICAgICAgICBvbmVfdGVjaF9jb3N0ID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBvbmVfdGVjaC5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgLy9OUEMgQ2FsY1xuICAgICAgICBob29rX25wY190aWNrX2NvdW50ZXIoTmVwdHVuZXNQcmlkZSwgQ3J1eCk7XG4gICAgICAgIENydXguVGV4dChcInlvdVwiLCBcInBhZDEyIHR4dF9jZW50ZXJcIikuZ3JpZCgyNSwgNiwgNSwgMykucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICAvLyBMYWJlbHNcbiAgICAgICAgQ3J1eC5UZXh0KFwidG90YWxfc3RhcnNcIiwgXCJwYWQ4XCIpLmdyaWQoMTAsIDksIDE1LCAzKS5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgIENydXguVGV4dChcInRvdGFsX2ZsZWV0c1wiLCBcInBhZDhcIikuZ3JpZCgxMCwgMTEsIDE1LCAzKS5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgIENydXguVGV4dChcInRvdGFsX3NoaXBzXCIsIFwicGFkOFwiKS5ncmlkKDEwLCAxMywgMTUsIDMpLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgQ3J1eC5UZXh0KFwibmV3X3NoaXBzXCIsIFwicGFkOFwiKS5ncmlkKDEwLCAxNSwgMTUsIDMpLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgLy8gVGhpcyBwbGF5ZXJzIHN0YXRzXG4gICAgICAgIGlmIChwbGF5ZXIgIT09IHVuaXZlcnNlLnBsYXllcikge1xuICAgICAgICAgICAgQ3J1eC5UZXh0KFwiXCIsIFwicGFkOCB0eHRfY2VudGVyXCIpXG4gICAgICAgICAgICAgICAgLmdyaWQoMjAsIDksIDUsIDMpXG4gICAgICAgICAgICAgICAgLnJhd0hUTUwocGxheWVyLnRvdGFsX3N0YXJzKVxuICAgICAgICAgICAgICAgIC5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgICAgICBDcnV4LlRleHQoXCJcIiwgXCJwYWQ4IHR4dF9jZW50ZXJcIilcbiAgICAgICAgICAgICAgICAuZ3JpZCgyMCwgMTEsIDUsIDMpXG4gICAgICAgICAgICAgICAgLnJhd0hUTUwocGxheWVyLnRvdGFsX2ZsZWV0cylcbiAgICAgICAgICAgICAgICAucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICAgICAgQ3J1eC5UZXh0KFwiXCIsIFwicGFkOCB0eHRfY2VudGVyXCIpXG4gICAgICAgICAgICAgICAgLmdyaWQoMjAsIDEzLCA1LCAzKVxuICAgICAgICAgICAgICAgIC5yYXdIVE1MKHBsYXllci50b3RhbF9zdHJlbmd0aClcbiAgICAgICAgICAgICAgICAucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICAgICAgQ3J1eC5UZXh0KFwiXCIsIFwicGFkOCB0eHRfY2VudGVyXCIpXG4gICAgICAgICAgICAgICAgLmdyaWQoMjAsIDE1LCA1LCAzKVxuICAgICAgICAgICAgICAgIC5yYXdIVE1MKHBsYXllci5zaGlwc1BlclRpY2spXG4gICAgICAgICAgICAgICAgLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiBzZWxlY3RIaWxpZ2h0U3R5bGUocDEsIHAyKSB7XG4gICAgICAgICAgICBwMSA9IE51bWJlcihwMSk7XG4gICAgICAgICAgICBwMiA9IE51bWJlcihwMik7XG4gICAgICAgICAgICBpZiAocDEgPCBwMilcbiAgICAgICAgICAgICAgICByZXR1cm4gXCIgdHh0X3dhcm5fYmFkXCI7XG4gICAgICAgICAgICBpZiAocDEgPiBwMilcbiAgICAgICAgICAgICAgICByZXR1cm4gXCIgdHh0X3dhcm5fZ29vZFwiO1xuICAgICAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgICAgIH1cbiAgICAgICAgLy8gWW91ciBzdGF0c1xuICAgICAgICBpZiAodW5pdmVyc2UucGxheWVyKSB7XG4gICAgICAgICAgICBDcnV4LlRleHQoXCJcIiwgXCJwYWQ4IHR4dF9jZW50ZXIgXCIuY29uY2F0KHNlbGVjdEhpbGlnaHRTdHlsZSh1bml2ZXJzZS5wbGF5ZXIudG90YWxfc3RhcnMsIHBsYXllci50b3RhbF9zdGFycykpKVxuICAgICAgICAgICAgICAgIC5ncmlkKDI1LCA5LCA1LCAzKVxuICAgICAgICAgICAgICAgIC5yYXdIVE1MKHVuaXZlcnNlLnBsYXllci50b3RhbF9zdGFycylcbiAgICAgICAgICAgICAgICAucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICAgICAgQ3J1eC5UZXh0KFwiXCIsIFwicGFkOCB0eHRfY2VudGVyXCIuY29uY2F0KHNlbGVjdEhpbGlnaHRTdHlsZSh1bml2ZXJzZS5wbGF5ZXIudG90YWxfZmxlZXRzLCBwbGF5ZXIudG90YWxfZmxlZXRzKSkpXG4gICAgICAgICAgICAgICAgLmdyaWQoMjUsIDExLCA1LCAzKVxuICAgICAgICAgICAgICAgIC5yYXdIVE1MKHVuaXZlcnNlLnBsYXllci50b3RhbF9mbGVldHMpXG4gICAgICAgICAgICAgICAgLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgICAgIENydXguVGV4dChcIlwiLCBcInBhZDggdHh0X2NlbnRlclwiLmNvbmNhdChzZWxlY3RIaWxpZ2h0U3R5bGUodW5pdmVyc2UucGxheWVyLnRvdGFsX3N0cmVuZ3RoLCBwbGF5ZXIudG90YWxfc3RyZW5ndGgpKSlcbiAgICAgICAgICAgICAgICAuZ3JpZCgyNSwgMTMsIDUsIDMpXG4gICAgICAgICAgICAgICAgLnJhd0hUTUwodW5pdmVyc2UucGxheWVyLnRvdGFsX3N0cmVuZ3RoKVxuICAgICAgICAgICAgICAgIC5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgICAgICBDcnV4LlRleHQoXCJcIiwgXCJwYWQ4IHR4dF9jZW50ZXJcIi5jb25jYXQoc2VsZWN0SGlsaWdodFN0eWxlKHVuaXZlcnNlLnBsYXllci5zaGlwc1BlclRpY2ssIHBsYXllci5zaGlwc1BlclRpY2spKSlcbiAgICAgICAgICAgICAgICAuZ3JpZCgyNSwgMTUsIDUsIDMpXG4gICAgICAgICAgICAgICAgLnJhd0hUTUwodW5pdmVyc2UucGxheWVyLnNoaXBzUGVyVGljaylcbiAgICAgICAgICAgICAgICAucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICB9XG4gICAgICAgIENydXguV2lkZ2V0KFwiY29sX2FjY2VudFwiKS5ncmlkKDAsIDE2LCAxMCwgMykucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICBpZiAodW5pdmVyc2UucGxheWVyKSB7XG4gICAgICAgICAgICB2YXIgbXNnQnRuID0gQ3J1eC5JY29uQnV0dG9uKFwiaWNvbi1tYWlsXCIsIFwiaW5ib3hfbmV3X21lc3NhZ2VfdG9fcGxheWVyXCIsIHBsYXllci51aWQpXG4gICAgICAgICAgICAgICAgLmdyaWQoMCwgMTYsIDMsIDMpXG4gICAgICAgICAgICAgICAgLmFkZFN0eWxlKFwiZndkXCIpXG4gICAgICAgICAgICAgICAgLmRpc2FibGUoKVxuICAgICAgICAgICAgICAgIC5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgICAgICBpZiAocGxheWVyICE9PSB1bml2ZXJzZS5wbGF5ZXIgJiYgcGxheWVyLmFsaWFzKSB7XG4gICAgICAgICAgICAgICAgbXNnQnRuLmVuYWJsZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgQ3J1eC5JY29uQnV0dG9uKFwiaWNvbi1jaGFydC1saW5lXCIsIFwic2hvd19pbnRlbFwiLCBwbGF5ZXIudWlkKVxuICAgICAgICAgICAgICAgIC5ncmlkKDIuNSwgMTYsIDMsIDMpXG4gICAgICAgICAgICAgICAgLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgICAgIGlmIChzaG93RW1waXJlKSB7XG4gICAgICAgICAgICAgICAgQ3J1eC5JY29uQnV0dG9uKFwiaWNvbi1leWVcIiwgXCJzaG93X3NjcmVlblwiLCBcImVtcGlyZVwiKVxuICAgICAgICAgICAgICAgICAgICAuZ3JpZCg3LCAxNiwgMywgMylcbiAgICAgICAgICAgICAgICAgICAgLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcGxheWVyUGFuZWw7XG4gICAgfTtcbn07XG52YXIgc3VwZXJTdGFySW5zcGVjdG9yID0gTmVwdHVuZXNQcmlkZS5ucHVpLlN0YXJJbnNwZWN0b3I7XG5OZXB0dW5lc1ByaWRlLm5wdWkuU3Rhckluc3BlY3RvciA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdW5pdmVyc2UgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlO1xuICAgIHZhciBjb25maWcgPSBOZXB0dW5lc1ByaWRlLmdhbWVDb25maWc7XG4gICAgLy9DYWxsIHN1cGVyIChQcmV2aW91cyBTdGFySW5zcGVjdG9yIGZyb20gZ2FtZWNvZGUpXG4gICAgdmFyIHN0YXJJbnNwZWN0b3IgPSBzdXBlclN0YXJJbnNwZWN0b3IoKTtcbiAgICBDcnV4Lkljb25CdXR0b24oXCJpY29uLWhlbHAgcmVsXCIsIFwic2hvd19oZWxwXCIsIFwic3RhcnNcIikucm9vc3Qoc3Rhckluc3BlY3Rvci5oZWFkaW5nKTtcbiAgICBDcnV4Lkljb25CdXR0b24oXCJpY29uLWRvYy10ZXh0IHJlbFwiLCBcInNob3dfc2NyZWVuXCIsIFwiY29tYmF0X2NhbGN1bGF0b3JcIikucm9vc3Qoc3Rhckluc3BlY3Rvci5oZWFkaW5nKTtcbiAgICAvL0FwcGVuZCBleHRyYSBmdW5jdGlvblxuICAgIGZ1bmN0aW9uIGFwcGx5X2ZyYWN0aW9uYWxfc2hpcHMoKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBkZXB0aCwgc2VsZWN0b3IsIGVsZW1lbnQsIGNvdW50ZXIsIGZyYWN0aW9uYWxfc2hpcCwgZnJhY3Rpb25hbF9zaGlwXzEsIG5ld192YWx1ZTtcbiAgICAgICAgICAgIHJldHVybiBfX2dlbmVyYXRvcih0aGlzLCBmdW5jdGlvbiAoX2EpIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKF9hLmxhYmVsKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHRoID0gY29uZmlnLnR1cm5CYXNlZCA/IDQgOiAzO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0b3IgPSBcIiNjb250ZW50QXJlYSA+IGRpdiA+IGRpdi53aWRnZXQuZnVsbHNjcmVlbiA+IGRpdjpudGgtY2hpbGQoXCIuY29uY2F0KGRlcHRoLCBcIikgPiBkaXYgPiBkaXY6bnRoLWNoaWxkKDUpID4gZGl2LndpZGdldC5wYWQxMi5pY29uLXJvY2tldC1pbmxpbmUudHh0X3JpZ2h0XCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudCA9ICQoc2VsZWN0b3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY291bnRlciA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICBmcmFjdGlvbmFsX3NoaXAgPSB1bml2ZXJzZS5zZWxlY3RlZFN0YXJbXCJjXCJdLnRvRml4ZWQoMik7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKHNlbGVjdG9yKS5hcHBlbmQoZnJhY3Rpb25hbF9zaGlwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIF9hLmxhYmVsID0gMTtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCEoZWxlbWVudC5sZW5ndGggPT0gMCAmJiBjb3VudGVyIDw9IDEwMCkpIHJldHVybiBbMyAvKmJyZWFrKi8sIDNdO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFs0IC8qeWllbGQqLywgbmV3IFByb21pc2UoZnVuY3Rpb24gKHIpIHsgcmV0dXJuIHNldFRpbWVvdXQociwgMTApOyB9KV07XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICAgICAgICAgIF9hLnNlbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQgPSAkKHNlbGVjdG9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZyYWN0aW9uYWxfc2hpcF8xID0gdW5pdmVyc2Uuc2VsZWN0ZWRTdGFyW1wiY1wiXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld192YWx1ZSA9IHBhcnNlSW50KCQoc2VsZWN0b3IpLnRleHQoKSkgKyBmcmFjdGlvbmFsX3NoaXBfMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICQoc2VsZWN0b3IpLnRleHQobmV3X3ZhbHVlLnRvRml4ZWQoMikpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY291bnRlciArPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFszIC8qYnJlYWsqLywgMV07XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMzogcmV0dXJuIFsyIC8qcmV0dXJuKi9dO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgaWYgKFwiY1wiIGluIHVuaXZlcnNlLnNlbGVjdGVkU3Rhcikge1xuICAgICAgICBhcHBseV9mcmFjdGlvbmFsX3NoaXBzKCk7XG4gICAgfVxuICAgIHJldHVybiBzdGFySW5zcGVjdG9yO1xufTtcbi8vSmF2YXNjcmlwdCBjYWxsXG5zZXRUaW1lb3V0KExlZ2FjeV9OZXB0dW5lc1ByaWRlQWdlbnQsIDEwMDApO1xuc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgLy9UeXBlc2NyaXB0IGNhbGxcbiAgICBwb3N0X2hvb2soKTtcbiAgICByZW5kZXJMZWRnZXIoTmVwdHVuZXNQcmlkZSwgQ3J1eCwgTW91c2V0cmFwKTtcbn0sIDgwMCk7XG5zZXRUaW1lb3V0KGFwcGx5X2hvb2tzLCAxNTAwKTtcbi8vVGVzdCB0byBzZWUgaWYgUGxheWVyUGFuZWwgaXMgdGhlcmVcbi8vSWYgaXQgaXMgb3ZlcndyaXRlcyBjdXN0b20gb25lXG4vL090aGVyd2lzZSB3aGlsZSBsb29wICYgc2V0IHRpbWVvdXQgdW50aWwgaXRzIHRoZXJlXG5mb3JjZV9hZGRfY3VzdG9tX3BsYXllcl9wYW5lbCgpO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9