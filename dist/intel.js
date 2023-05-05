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
/* harmony export */   "MarkDownMessageComment": function() { return /* binding */ MarkDownMessageComment; },
/* harmony export */   "get_research": function() { return /* binding */ get_research; },
/* harmony export */   "get_research_text": function() { return /* binding */ get_research_text; }
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
/* harmony export */   "PlayerNameIconRowLink": function() { return /* binding */ PlayerNameIconRowLink; },
/* harmony export */   "cacheFetchSize": function() { return /* binding */ cacheFetchSize; },
/* harmony export */   "cacheFetchStart": function() { return /* binding */ cacheFetchStart; },
/* harmony export */   "cached_events": function() { return /* binding */ cached_events; },
/* harmony export */   "get_cached_events": function() { return /* binding */ get_cached_events; },
/* harmony export */   "recieve_new_messages": function() { return /* binding */ recieve_new_messages; },
/* harmony export */   "sync_message_cache": function() { return /* binding */ sync_message_cache; },
/* harmony export */   "update_event_cache": function() { return /* binding */ update_event_cache; }
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
/* harmony export */   "get_hero": function() { return /* binding */ get_hero; }
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

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "get_ledger": function() { return /* binding */ get_ledger; },
/* harmony export */   "renderLedger": function() { return /* binding */ renderLedger; }
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

/***/ "./source/merge.ts":
/*!*************************!*\
  !*** ./source/merge.ts ***!
  \*************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "mergeUser": function() { return /* binding */ mergeUser; },
/* harmony export */   "mergeUserData": function() { return /* binding */ mergeUserData; }
/* harmony export */ });
/* harmony import */ var _utilities_get_game_state__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utilities/get_game_state */ "./source/utilities/get_game_state.ts");
/* harmony import */ var _utilities_api__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utilities/api */ "./source/utilities/api.ts");


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
        (0,_utilities_api__WEBPACK_IMPORTED_MODULE_1__.get_api_data)(apikey)
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
//mechanic closes at 5pk,m
//This works but now add it so it does not overtake your stars.
function mergeUserData(scanningData) {
    var galaxy = (0,_utilities_get_game_state__WEBPACK_IMPORTED_MODULE_0__.get_galaxy)();
    var stars = scanningData.stars;
    var fleets = scanningData.fleets;
    // Update stars
    for (var starId in stars) {
        var star = stars[starId];
        galaxy.stars[starId] = star;
    }
    console.log("Syncing");
    // Add fleets
    for (var fleetId in fleets) {
        var fleet = fleets[fleetId];
        galaxy.fleets[fleetId] = fleet;
    }
    //onFullUniverse Seems to additionally load all the players.
    NeptunesPride.np.onFullUniverse(null, galaxy);
    //NeptunesPride.npui.onHideScreen(null, true);
}


/***/ }),

/***/ "./source/parse_utils.ts":
/*!*******************************!*\
  !*** ./source/parse_utils.ts ***!
  \*******************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
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

/***/ "./source/utilities/api.ts":
/*!*********************************!*\
  !*** ./source/utilities/api.ts ***!
  \*********************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "get_api_data": function() { return /* binding */ get_api_data; }
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
/* harmony export */   "get_all_stars": function() { return /* binding */ get_all_stars; },
/* harmony export */   "get_fleets": function() { return /* binding */ get_fleets; },
/* harmony export */   "get_galaxy": function() { return /* binding */ get_galaxy; },
/* harmony export */   "get_game_number": function() { return /* binding */ get_game_number; },
/* harmony export */   "get_game_state": function() { return /* binding */ get_game_state; },
/* harmony export */   "get_neptunes_pride": function() { return /* binding */ get_neptunes_pride; },
/* harmony export */   "get_universe": function() { return /* binding */ get_universe; },
/* harmony export */   "get_visible_stars": function() { return /* binding */ get_visible_stars; }
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
/* harmony export */   "anyStarCanSee": function() { return /* binding */ anyStarCanSee; },
/* harmony export */   "drawOverlayString": function() { return /* binding */ drawOverlayString; }
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

/***/ "./source/utilities/npc_calc.ts":
/*!**************************************!*\
  !*** ./source/utilities/npc_calc.ts ***!
  \**************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "add_npc_tick_counter": function() { return /* binding */ add_npc_tick_counter; },
/* harmony export */   "get_npc_tick": function() { return /* binding */ get_npc_tick; },
/* harmony export */   "hook_npc_tick_counter": function() { return /* binding */ hook_npc_tick_counter; }
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

/***/ "./node_modules/marked/lib/marked.esm.js":
/*!***********************************************!*\
  !*** ./node_modules/marked/lib/marked.esm.js ***!
  \***********************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
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
/* harmony import */ var _merge__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./merge */ "./source/merge.ts");
/* harmony import */ var _parse_utils__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./parse_utils */ "./source/parse_utils.ts");
/* harmony import */ var _utilities_graphics__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./utilities/graphics */ "./source/utilities/graphics.ts");
/* harmony import */ var _utilities_npc_calc__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./utilities/npc_calc */ "./source/utilities/npc_calc.ts");
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









var SAT_VERSION = "2.28.22-git";
if (NeptunesPride === undefined) {
    _game__WEBPACK_IMPORTED_MODULE_1__.thisGame.neptunesPride = NeptunesPride;
}
function post_hook() {
    //console.log(stringify(NeptunesPride.universe.galaxy.fleets[2],null, "\t"))
    return null;
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
                else if ((0,_parse_utils__WEBPACK_IMPORTED_MODULE_6__.is_valid_image_url)(uri)) {
                    s = s.replace(pattern, "<img width=\"100%\" src='".concat(uri, "' />"));
                }
                else if ((0,_parse_utils__WEBPACK_IMPORTED_MODULE_6__.is_valid_youtube)(uri)) {
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
    hotkey("|", _merge__WEBPACK_IMPORTED_MODULE_5__.mergeUser);
    _merge__WEBPACK_IMPORTED_MODULE_5__.mergeUser.help =
        "Merge the latest data from the last user whose API key was used to load data. This is useful after a tick " +
            "passes and you've reloaded, but you still want the merged scan data from two players onscreen.";
    NeptunesPride.np.on("switch_user_api", switchUser);
    NeptunesPride.np.on("merge_user_api", _merge__WEBPACK_IMPORTED_MODULE_5__.mergeUser);
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
}, 1500);
setTimeout(apply_hooks, 1500);
//Test to see if PlayerPanel is there
//If it is overwrites custom one
//Otherwise while loop & set timeout until its there
force_add_custom_player_panel();

}();
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLEtBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxzQ0FBc0MsSUFBSTtBQUMxQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLDhCQUE4QixJQUFJLElBQUksZUFBZSxTQUFTLEtBQUs7O0FBRW5FO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLHdDQUF3QyxJQUFJLEVB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QUNBLFNBQVM7QUFDVDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJDQUEyQyxhQUFhO0FBQ3hELGlFQUFpRTtBQUNqRSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0EsNEJBQTRCLGFBQWE7QUFDekM7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwQ0FBMEMsYUFBYTtBQUN2RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkNBQTJDLGFBQWE7QUFDeEQsaUVBQWlFO0FBQ2pFLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQ0FBMkM7QUFDM0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFD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QUFnQjtBQUNoQjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxnQkFBZ0IsT0FBTztBQUN2Qjs7QUFFQTtBQUNBO0FBQ0EsbUVBQW1FLGNBQWM7QUFDakY7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxnQkFBZ0IsNEJBQTRCO0FBQzVDOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFF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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixFQUFFLE1BQU0sRUFBRSxJQUFJLEdBQUcsS0FBSyxFQUFFLElBQUksRUFBRTtBQUN0RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzREFBc0Q7QUFDdEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBCQUEwQixFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsSUFBSSxHQUFHO0FBQ2xEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQ0FBb0MsRUFBRSxFQUFFLEdBQUcsR0FBRyxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUU7QUFDNUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0Q0FBNEMsR0FBRyxHQUFHLEdBQUcsTUFBTSxFQUFFLE1BQU0sRUFBRTtBQUNyRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBDQUEwQyxHQUFHLFVBQVUsRUFBRTtBQUN6RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYixTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUkscURBQVk7QUFDaEIsQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9uZXB0dW5lcy1wcmlkZS1hZ2VudC8uL3NvdXJjZS9jaGF0LnRzIiwid2VicGFjazovL25lcHR1bmVzLXByaWRlLWFnZW50Ly4vc291cmNlL2V2ZW50X2NhY2hlLnRzIiwid2VicGFjazovL25lcHR1bmVzLXByaWRlLWFnZW50Ly4vc291cmNlL2dhbWUudHMiLCJ3ZWJwYWNrOi8vbmVwdHVuZXMtcHJpZGUtYWdlbnQvLi9zb3VyY2UvZ2V0X2hlcm8udHMiLCJ3ZWJwYWNrOi8vbmVwdHVuZXMtcHJpZGUtYWdlbnQvLi9zb3VyY2UvaG90a2V5LnRzIiwid2VicGFjazovL25lcHR1bmVzLXByaWRlLWFnZW50Ly4vc291cmNlL2xlZGdlci50cyIsIndlYnBhY2s6Ly9uZXB0dW5lcy1wcmlkZS1hZ2VudC8uL3NvdXJjZS9tZXJnZS50cyIsIndlYnBhY2s6Ly9uZXB0dW5lcy1wcmlkZS1hZ2VudC8uL3NvdXJjZS9wYXJzZV91dGlscy50cyIsIndlYnBhY2s6Ly9uZXB0dW5lcy1wcmlkZS1hZ2VudC8uL3NvdXJjZS91dGlsaXRpZXMvYXBpLnRzIiwid2VicGFjazovL25lcHR1bmVzLXByaWRlLWFnZW50Ly4vc291cmNlL3V0aWxpdGllcy9nZXRfZ2FtZV9zdGF0ZS50cyIsIndlYnBhY2s6Ly9uZXB0dW5lcy1wcmlkZS1hZ2VudC8uL3NvdXJjZS91dGlsaXRpZXMvZ3JhcGhpY3MudHMiLCJ3ZWJwYWNrOi8vbmVwdHVuZXMtcHJpZGUtYWdlbnQvLi9zb3VyY2UvdXRpbGl0aWVzL25wY19jYWxjLnRzIiwid2VicGFjazovL25lcHR1bmVzLXByaWRlLWFnZW50Ly4vbm9kZV9tb2R1bGVzL21hcmtlZC9saWIvbWFya2VkLmVzbS5qcyIsIndlYnBhY2s6Ly9uZXB0dW5lcy1wcmlkZS1hZ2VudC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9uZXB0dW5lcy1wcmlkZS1hZ2VudC93ZWJwYWNrL3J1bnRpbWUvY29tcGF0IGdldCBkZWZhdWx0IGV4cG9ydCIsIndlYnBhY2s6Ly9uZXB0dW5lcy1wcmlkZS1hZ2VudC93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vbmVwdHVuZXMtcHJpZGUtYWdlbnQvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9uZXB0dW5lcy1wcmlkZS1hZ2VudC93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL25lcHR1bmVzLXByaWRlLWFnZW50Ly4vc291cmNlL2ludGVsLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGdldF9oZXJvIH0gZnJvbSBcIi4vZ2V0X2hlcm9cIjtcbnZhciBSRVNFQUNIX01BUCA9IHtcbiAgICBzY2FubmluZzogXCJTY2FubmluZ1wiLFxuICAgIHByb3B1bHNpb246IFwiSHlwZXJzcGFjZSBSYW5nZVwiLFxuICAgIHRlcnJhZm9ybWluZzogXCJUZXJyYWZvcm1pbmdcIixcbiAgICByZXNlYXJjaDogXCJFeHBlcmltZW50YXRpb25cIixcbiAgICB3ZWFwb25zOiBcIldlYXBvbnNcIixcbiAgICBiYW5raW5nOiBcIkJhbmtpbmdcIixcbiAgICBtYW51ZmFjdHVyaW5nOiBcIk1hbnVmYWN0dXJpbmdcIixcbn07XG4vL0ZvciBxdWljayByZXNlYXJjaCBkaXNwbGF5XG5mdW5jdGlvbiBnZXRfcmVzZWFyY2goZ2FtZSkge1xuICAgIHZhciB1bml2ZXJzZSA9IGdhbWUudW5pdmVyc2U7XG4gICAgdmFyIGhlcm8gPSBnZXRfaGVybyhnYW1lLnVuaXZlcnNlKTtcbiAgICB2YXIgc2NpZW5jZSA9IGhlcm8udG90YWxfc2NpZW5jZTtcbiAgICAvL0N1cnJlbnQgU2NpZW5jZVxuICAgIHZhciBjdXJyZW50ID0gaGVyby50ZWNoW2hlcm8ucmVzZWFyY2hpbmddO1xuICAgIHZhciBjdXJyZW50X3BvaW50c19yZW1haW5pbmcgPSBjdXJyZW50LmJyciAqIGN1cnJlbnQubGV2ZWwgLSBjdXJyZW50LnJlc2VhcmNoO1xuICAgIHZhciBldGEgPSBNYXRoLmNlaWwoY3VycmVudF9wb2ludHNfcmVtYWluaW5nIC8gc2NpZW5jZSk7IC8vSG91cnNcbiAgICAvL05leHQgc2NpZW5jZVxuICAgIHZhciBuZXh0ID0gaGVyby50ZWNoW2hlcm8ucmVzZWFyY2hpbmdfbmV4dF07XG4gICAgdmFyIG5leHRfcG9pbnRzX3JlbWFpbmluZyA9IG5leHQuYnJyICogbmV4dC5sZXZlbCAtIG5leHQucmVzZWFyY2g7XG4gICAgdmFyIG5leHRfZXRhID0gTWF0aC5jZWlsKG5leHRfcG9pbnRzX3JlbWFpbmluZyAvIHNjaWVuY2UpICsgZXRhO1xuICAgIHZhciBuZXh0X2xldmVsID0gbmV4dC5sZXZlbCArIDE7XG4gICAgaWYgKGhlcm8ucmVzZWFyY2hpbmcgPT0gaGVyby5yZXNlYXJjaGluZ19uZXh0KSB7XG4gICAgICAgIC8vUmVjdXJyaW5nIHJlc2VhcmNoXG4gICAgICAgIG5leHRfcG9pbnRzX3JlbWFpbmluZyArPSBuZXh0LmJycjtcbiAgICAgICAgbmV4dF9ldGEgPSBNYXRoLmNlaWwoKG5leHQuYnJyICogbmV4dC5sZXZlbCArIDEpIC8gc2NpZW5jZSkgKyBldGE7XG4gICAgICAgIG5leHRfbGV2ZWwgKz0gMTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY3VycmVudF9uYW1lOiBSRVNFQUNIX01BUFtoZXJvLnJlc2VhcmNoaW5nXSxcbiAgICAgICAgY3VycmVudF9sZXZlbDogY3VycmVudFtcImxldmVsXCJdICsgMSxcbiAgICAgICAgY3VycmVudF9ldGE6IGV0YSxcbiAgICAgICAgbmV4dF9uYW1lOiBSRVNFQUNIX01BUFtoZXJvLnJlc2VhcmNoaW5nX25leHRdLFxuICAgICAgICBuZXh0X2xldmVsOiBuZXh0X2xldmVsLFxuICAgICAgICBuZXh0X2V0YTogbmV4dF9ldGEsXG4gICAgICAgIHNjaWVuY2U6IHNjaWVuY2UsXG4gICAgfTtcbn1cbmZ1bmN0aW9uIGdldF9yZXNlYXJjaF90ZXh0KGdhbWUpIHtcbiAgICB2YXIgcmVzZWFyY2ggPSBnZXRfcmVzZWFyY2goZ2FtZSk7XG4gICAgdmFyIGZpcnN0X2xpbmUgPSBcIk5vdzogXCIuY29uY2F0KHJlc2VhcmNoW1wiY3VycmVudF9uYW1lXCJdLCBcIiBcIikuY29uY2F0KHJlc2VhcmNoW1wiY3VycmVudF9sZXZlbFwiXSwgXCIgLSBcIikuY29uY2F0KHJlc2VhcmNoW1wiY3VycmVudF9ldGFcIl0sIFwiIHRpY2tzLlwiKTtcbiAgICB2YXIgc2Vjb25kX2xpbmUgPSBcIk5leHQ6IFwiLmNvbmNhdChyZXNlYXJjaFtcIm5leHRfbmFtZVwiXSwgXCIgXCIpLmNvbmNhdChyZXNlYXJjaFtcIm5leHRfbGV2ZWxcIl0sIFwiIC0gXCIpLmNvbmNhdChyZXNlYXJjaFtcIm5leHRfZXRhXCJdLCBcIiB0aWNrcy5cIik7XG4gICAgdmFyIHRoaXJkX2xpbmUgPSBcIk15IFNjaWVuY2U6IFwiLmNvbmNhdChyZXNlYXJjaFtcInNjaWVuY2VcIl0pO1xuICAgIHJldHVybiBcIlwiLmNvbmNhdChmaXJzdF9saW5lLCBcIlxcblwiKS5jb25jYXQoc2Vjb25kX2xpbmUsIFwiXFxuXCIpLmNvbmNhdCh0aGlyZF9saW5lLCBcIlxcblwiKTtcbn1cbmZ1bmN0aW9uIE1hcmtEb3duTWVzc2FnZUNvbW1lbnQoY29udGV4dCwgdGV4dCwgaW5kZXgpIHtcbiAgICB2YXIgbWVzc2FnZUNvbW1lbnQgPSBjb250ZXh0Lk1lc3NhZ2VDb21tZW50KHRleHQsIGluZGV4KTtcbiAgICByZXR1cm4gXCJcIjtcbn1cbmV4cG9ydCB7IGdldF9yZXNlYXJjaCwgZ2V0X3Jlc2VhcmNoX3RleHQsIE1hcmtEb3duTWVzc2FnZUNvbW1lbnQgfTtcbiIsImltcG9ydCB7IGdldF9sZWRnZXIgfSBmcm9tIFwiLi9sZWRnZXJcIjtcbmltcG9ydCB7IGdldF9oZXJvIH0gZnJvbSBcIi4vZ2V0X2hlcm9cIjtcbi8vR2xvYmFsIGNhY2hlZCBldmVudCBzeXN0ZW0uXG5leHBvcnQgdmFyIGNhY2hlZF9ldmVudHMgPSBbXTtcbmV4cG9ydCB2YXIgY2FjaGVGZXRjaFN0YXJ0ID0gbmV3IERhdGUoKTtcbmV4cG9ydCB2YXIgY2FjaGVGZXRjaFNpemUgPSAwO1xuLy9Bc3luYyByZXF1ZXN0IGdhbWUgZXZlbnRzXG4vL2dhbWUgaXMgdXNlZCB0byBnZXQgdGhlIGFwaSB2ZXJzaW9uIGFuZCB0aGUgZ2FtZU51bWJlclxuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZV9ldmVudF9jYWNoZShnYW1lLCBjcnV4LCBmZXRjaFNpemUsIHN1Y2Nlc3MsIGVycm9yKSB7XG4gICAgdmFyIGNvdW50ID0gY2FjaGVkX2V2ZW50cy5sZW5ndGggPiAwID8gZmV0Y2hTaXplIDogMTAwMDAwO1xuICAgIGNhY2hlRmV0Y2hTdGFydCA9IG5ldyBEYXRlKCk7XG4gICAgY2FjaGVGZXRjaFNpemUgPSBjb3VudDtcbiAgICB2YXIgcGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh7XG4gICAgICAgIHR5cGU6IFwiZmV0Y2hfZ2FtZV9tZXNzYWdlc1wiLFxuICAgICAgICBjb3VudDogY291bnQudG9TdHJpbmcoKSxcbiAgICAgICAgb2Zmc2V0OiBcIjBcIixcbiAgICAgICAgZ3JvdXA6IFwiZ2FtZV9ldmVudFwiLFxuICAgICAgICB2ZXJzaW9uOiBnYW1lLnZlcnNpb24sXG4gICAgICAgIGdhbWVfbnVtYmVyOiBnYW1lLmdhbWVOdW1iZXIsXG4gICAgfSk7XG4gICAgdmFyIGhlYWRlcnMgPSB7XG4gICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkblwiLFxuICAgIH07XG4gICAgZmV0Y2goXCIvdHJlcXVlc3QvZmV0Y2hfZ2FtZV9tZXNzYWdlc1wiLCB7XG4gICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkXCIsXG4gICAgICAgIH0sXG4gICAgICAgIGJvZHk6IHBhcmFtcyxcbiAgICB9KVxuICAgICAgICAudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHsgcmV0dXJuIHJlc3BvbnNlLmpzb24oKTsgfSlcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgIHN5bmNfbWVzc2FnZV9jYWNoZShyZXNwb25zZSk7IC8vVXBkYXRlcyBjYWNoZWRfZXZlbnRzXG4gICAgICAgIC8vY2FjaGVkX2V2ZW50cyA9IHN5bmNfbWVzc2FnZV9jYWNoZShyZXNwb25zZSkpXG4gICAgfSlcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHgpIHsgcmV0dXJuIHN1Y2Nlc3MoZ2FtZSwgY3J1eCk7IH0pXG4gICAgICAgIC5jYXRjaChlcnJvcik7XG59XG4vL0N1c3RvbSBVSSBDb21wb25lbnRzIGZvciBMZWRnZXJcbmV4cG9ydCBmdW5jdGlvbiBQbGF5ZXJOYW1lSWNvblJvd0xpbmsoY3J1eCwgbnB1aSwgcGxheWVyKSB7XG4gICAgdmFyIHBsYXllck5hbWVJY29uUm93ID0gY3J1eC5XaWRnZXQoXCJyZWwgY29sX2JsYWNrIGNsaWNrYWJsZVwiKS5zaXplKDQ4MCwgNDgpO1xuICAgIG5wdWkuUGxheWVySWNvbihwbGF5ZXIsIHRydWUpLnJvb3N0KHBsYXllck5hbWVJY29uUm93KTtcbiAgICBjcnV4XG4gICAgICAgIC5UZXh0KFwiXCIsIFwic2VjdGlvbl90aXRsZVwiKVxuICAgICAgICAuZ3JpZCg2LCAwLCAyMSwgMylcbiAgICAgICAgLnJhd0hUTUwoXCI8YSBvbmNsaWNrPVxcXCJDcnV4LmNydXgudHJpZ2dlcignc2hvd19wbGF5ZXJfdWlkJywgJ1wiLmNvbmNhdChwbGF5ZXIudWlkLCBcIicgKVxcXCI+XCIpLmNvbmNhdChwbGF5ZXIuYWxpYXMsIFwiPC9hPlwiKSlcbiAgICAgICAgLnJvb3N0KHBsYXllck5hbWVJY29uUm93KTtcbiAgICByZXR1cm4gcGxheWVyTmFtZUljb25Sb3c7XG59XG5leHBvcnQgZnVuY3Rpb24gc3luY19tZXNzYWdlX2NhY2hlKHJlc3BvbnNlKSB7XG4gICAgdmFyIGNhY2hlRmV0Y2hFbmQgPSBuZXcgRGF0ZSgpO1xuICAgIHZhciBlbGFwc2VkID0gY2FjaGVGZXRjaEVuZC5nZXRUaW1lKCkgLSBjYWNoZUZldGNoU3RhcnQuZ2V0VGltZSgpO1xuICAgIGNvbnNvbGUubG9nKFwiRmV0Y2hlZCBcIi5jb25jYXQoY2FjaGVGZXRjaFNpemUsIFwiIGV2ZW50cyBpbiBcIikuY29uY2F0KGVsYXBzZWQsIFwibXNcIikpO1xuICAgIHZhciBpbmNvbWluZyA9IHJlc3BvbnNlLnJlcG9ydC5tZXNzYWdlcztcbiAgICBpZiAoY2FjaGVkX2V2ZW50cy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHZhciBvdmVybGFwT2Zmc2V0ID0gLTE7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaW5jb21pbmcubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIHZhciBtZXNzYWdlID0gaW5jb21pbmdbaV07XG4gICAgICAgICAgICBpZiAobWVzc2FnZS5rZXkgPT09IGNhY2hlZF9ldmVudHNbMF0ua2V5KSB7XG4gICAgICAgICAgICAgICAgb3ZlcmxhcE9mZnNldCA9IGk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG92ZXJsYXBPZmZzZXQgPj0gMCkge1xuICAgICAgICAgICAgaW5jb21pbmcgPSBpbmNvbWluZy5zbGljZSgwLCBvdmVybGFwT2Zmc2V0KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChvdmVybGFwT2Zmc2V0IDwgMCkge1xuICAgICAgICAgICAgdmFyIHNpemUgPSBpbmNvbWluZy5sZW5ndGggKiAyO1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJNaXNzaW5nIHNvbWUgZXZlbnRzLCBkb3VibGUgZmV0Y2ggdG8gXCIuY29uY2F0KHNpemUpKTtcbiAgICAgICAgICAgIC8vdXBkYXRlX2V2ZW50X2NhY2hlKGdhbWUsIGNydXgsIHNpemUsIHJlY2lldmVfbmV3X21lc3NhZ2VzLCBjb25zb2xlLmVycm9yKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyB3ZSBoYWQgY2FjaGVkIGV2ZW50cywgYnV0IHdhbnQgdG8gYmUgZXh0cmEgcGFyYW5vaWQgYWJvdXRcbiAgICAgICAgLy8gY29ycmVjdG5lc3MuIFNvIGlmIHRoZSByZXNwb25zZSBjb250YWluZWQgdGhlIGVudGlyZSBldmVudFxuICAgICAgICAvLyBsb2csIHZhbGlkYXRlIHRoYXQgaXQgZXhhY3RseSBtYXRjaGVzIHRoZSBjYWNoZWQgZXZlbnRzLlxuICAgICAgICBpZiAocmVzcG9uc2UucmVwb3J0Lm1lc3NhZ2VzLmxlbmd0aCA9PT0gY2FjaGVkX2V2ZW50cy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiKioqIFZhbGlkYXRpbmcgY2FjaGVkX2V2ZW50cyAqKipcIik7XG4gICAgICAgICAgICB2YXIgdmFsaWRfMSA9IHJlc3BvbnNlLnJlcG9ydC5tZXNzYWdlcztcbiAgICAgICAgICAgIHZhciBpbnZhbGlkRW50cmllcyA9IGNhY2hlZF9ldmVudHMuZmlsdGVyKGZ1bmN0aW9uIChlLCBpKSB7IHJldHVybiBlLmtleSAhPT0gdmFsaWRfMVtpXS5rZXk7IH0pO1xuICAgICAgICAgICAgaWYgKGludmFsaWRFbnRyaWVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGFsZXJ0KFwiISEgSW52YWxpZCBlbnRyaWVzIGZvdW5kXCIpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCIhISBJbnZhbGlkIGVudHJpZXMgZm91bmQ6IFwiLCBpbnZhbGlkRW50cmllcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIioqKiBWYWxpZGF0aW9uIENvbXBsZXRlZCAqKipcIik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyB0aGUgcmVzcG9uc2UgZGlkbid0IGNvbnRhaW4gdGhlIGVudGlyZSBldmVudCBsb2cuIEdvIGZldGNoXG4gICAgICAgICAgICAvLyBhIHZlcnNpb24gdGhhdCBfZG9lc18uXG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgdXBkYXRlX2V2ZW50X2NhY2hlKFxuICAgICAgICAgICAgICBnYW1lLFxuICAgICAgICAgICAgICBjcnV4LFxuICAgICAgICAgICAgICAxMDAwMDAsXG4gICAgICAgICAgICAgIHJlY2lldmVfbmV3X21lc3NhZ2VzLFxuICAgICAgICAgICAgICBjb25zb2xlLmVycm9yLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICovXG4gICAgICAgIH1cbiAgICB9XG4gICAgY2FjaGVkX2V2ZW50cyA9IGluY29taW5nLmNvbmNhdChjYWNoZWRfZXZlbnRzKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBnZXRfY2FjaGVkX2V2ZW50cygpIHtcbiAgICByZXR1cm4gY2FjaGVkX2V2ZW50cztcbn1cbi8vSGFuZGxlciB0byByZWNpZXZlIG5ldyBtZXNzYWdlc1xuZXhwb3J0IGZ1bmN0aW9uIHJlY2lldmVfbmV3X21lc3NhZ2VzKGdhbWUsIGNydXgpIHtcbiAgICB2YXIgdW5pdmVyc2UgPSBnYW1lLnVuaXZlcnNlO1xuICAgIHZhciBucHVpID0gZ2FtZS5ucHVpO1xuICAgIHZhciBwbGF5ZXJzID0gZ2V0X2xlZGdlcihnYW1lLCBjcnV4LCBjYWNoZWRfZXZlbnRzKTtcbiAgICB2YXIgbGVkZ2VyU2NyZWVuID0gbnB1aS5sZWRnZXJTY3JlZW4oKTtcbiAgICBucHVpLm9uSGlkZVNjcmVlbihudWxsLCB0cnVlKTtcbiAgICBucHVpLm9uSGlkZVNlbGVjdGlvbk1lbnUoKTtcbiAgICBucHVpLnRyaWdnZXIoXCJoaWRlX3NpZGVfbWVudVwiKTtcbiAgICBucHVpLnRyaWdnZXIoXCJyZXNldF9lZGl0X21vZGVcIik7XG4gICAgbnB1aS5hY3RpdmVTY3JlZW4gPSBsZWRnZXJTY3JlZW47XG4gICAgbGVkZ2VyU2NyZWVuLnJvb3N0KG5wdWkuc2NyZWVuQ29udGFpbmVyKTtcbiAgICBucHVpLmxheW91dEVsZW1lbnQobGVkZ2VyU2NyZWVuKTtcbiAgICBwbGF5ZXJzLmZvckVhY2goZnVuY3Rpb24gKHApIHtcbiAgICAgICAgdmFyIHBsYXllciA9IFBsYXllck5hbWVJY29uUm93TGluayhjcnV4LCBucHVpLCB1bml2ZXJzZS5nYWxheHkucGxheWVyc1twLnVpZF0pLnJvb3N0KG5wdWkuYWN0aXZlU2NyZWVuKTtcbiAgICAgICAgcGxheWVyLmFkZFN0eWxlKFwicGxheWVyX2NlbGxcIik7XG4gICAgICAgIHZhciBwcm9tcHQgPSBwLmRlYnQgPiAwID8gXCJUaGV5IG93ZVwiIDogXCJZb3Ugb3dlXCI7XG4gICAgICAgIGlmIChwLmRlYnQgPT0gMCkge1xuICAgICAgICAgICAgcHJvbXB0ID0gXCJCYWxhbmNlXCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHAuZGVidCA8IDApIHtcbiAgICAgICAgICAgIGNydXhcbiAgICAgICAgICAgICAgICAuVGV4dChcIlwiLCBcInBhZDEyIHR4dF9yaWdodCByZWQtdGV4dFwiKVxuICAgICAgICAgICAgICAgIC5yYXdIVE1MKFwiXCIuY29uY2F0KHByb21wdCwgXCI6IFwiKS5jb25jYXQocC5kZWJ0KSlcbiAgICAgICAgICAgICAgICAuZ3JpZCgyMCwgMCwgMTAsIDMpXG4gICAgICAgICAgICAgICAgLnJvb3N0KHBsYXllcik7XG4gICAgICAgICAgICBpZiAocC5kZWJ0ICogLTEgPD0gZ2V0X2hlcm8odW5pdmVyc2UpLmNhc2gpIHtcbiAgICAgICAgICAgICAgICBjcnV4XG4gICAgICAgICAgICAgICAgICAgIC5CdXR0b24oXCJmb3JnaXZlXCIsIFwiZm9yZ2l2ZV9kZWJ0XCIsIHsgdGFyZ2V0UGxheWVyOiBwLnVpZCB9KVxuICAgICAgICAgICAgICAgICAgICAuZ3JpZCgxNywgMCwgNiwgMylcbiAgICAgICAgICAgICAgICAgICAgLnJvb3N0KHBsYXllcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAocC5kZWJ0ID4gMCkge1xuICAgICAgICAgICAgY3J1eFxuICAgICAgICAgICAgICAgIC5UZXh0KFwiXCIsIFwicGFkMTIgdHh0X3JpZ2h0IGJsdWUtdGV4dFwiKVxuICAgICAgICAgICAgICAgIC5yYXdIVE1MKFwiXCIuY29uY2F0KHByb21wdCwgXCI6IFwiKS5jb25jYXQocC5kZWJ0KSlcbiAgICAgICAgICAgICAgICAuZ3JpZCgyMCwgMCwgMTAsIDMpXG4gICAgICAgICAgICAgICAgLnJvb3N0KHBsYXllcik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAocC5kZWJ0ID09IDApIHtcbiAgICAgICAgICAgIGNydXhcbiAgICAgICAgICAgICAgICAuVGV4dChcIlwiLCBcInBhZDEyIHR4dF9yaWdodCBvcmFuZ2UtdGV4dFwiKVxuICAgICAgICAgICAgICAgIC5yYXdIVE1MKFwiXCIuY29uY2F0KHByb21wdCwgXCI6IFwiKS5jb25jYXQocC5kZWJ0KSlcbiAgICAgICAgICAgICAgICAuZ3JpZCgyMCwgMCwgMTAsIDMpXG4gICAgICAgICAgICAgICAgLnJvb3N0KHBsYXllcik7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cbmV4cG9ydCBkZWZhdWx0IHtcbiAgICB1cGRhdGVfZXZlbnRfY2FjaGU6IHVwZGF0ZV9ldmVudF9jYWNoZSxcbiAgICByZWNpZXZlX25ld19tZXNzYWdlczogcmVjaWV2ZV9uZXdfbWVzc2FnZXMsXG59O1xuIiwiIiwiaW1wb3J0IHsgZ2V0X3VuaXZlcnNlIH0gZnJvbSBcIi4vdXRpbGl0aWVzL2dldF9nYW1lX3N0YXRlXCI7XG5leHBvcnQgZnVuY3Rpb24gZ2V0X2hlcm8odW5pdmVyc2UpIHtcbiAgICBpZiAodW5pdmVyc2UgPT09IHZvaWQgMCkgeyB1bml2ZXJzZSA9IGdldF91bml2ZXJzZSgpOyB9XG4gICAgcmV0dXJuIHVuaXZlcnNlLnBsYXllcjtcbn1cbiIsImV4cG9ydCB2YXIgbGFzdENsaXAgPSBcIkVycm9yXCI7XG5leHBvcnQgZnVuY3Rpb24gY2xpcCh0ZXh0KSB7XG4gICAgbGFzdENsaXAgPSB0ZXh0O1xufVxuIiwiaW1wb3J0IHsgZ2V0X2hlcm8gfSBmcm9tIFwiLi9nZXRfaGVyb1wiO1xuaW1wb3J0ICogYXMgQ2FjaGUgZnJvbSBcIi4vZXZlbnRfY2FjaGVcIjtcbi8vR2V0IGxlZGdlciBpbmZvIHRvIHNlZSB3aGF0IGlzIG93ZWRcbi8vQWN0dWFsbHkgc2hvd3MgdGhlIHBhbmVsIG9mIGxvYWRpbmdcbmV4cG9ydCBmdW5jdGlvbiBnZXRfbGVkZ2VyKGdhbWUsIGNydXgsIG1lc3NhZ2VzKSB7XG4gICAgdmFyIG5wdWkgPSBnYW1lLm5wdWk7XG4gICAgdmFyIHVuaXZlcnNlID0gZ2FtZS51bml2ZXJzZTtcbiAgICB2YXIgcGxheWVycyA9IHVuaXZlcnNlLmdhbGF4eS5wbGF5ZXJzO1xuICAgIHZhciBsb2FkaW5nID0gY3J1eFxuICAgICAgICAuVGV4dChcIlwiLCBcInJlbCB0eHRfY2VudGVyIHBhZDEyXCIpXG4gICAgICAgIC5yYXdIVE1MKFwiUGFyc2luZyBcIi5jb25jYXQobWVzc2FnZXMubGVuZ3RoLCBcIiBtZXNzYWdlcy5cIikpO1xuICAgIGxvYWRpbmcucm9vc3QobnB1aS5hY3RpdmVTY3JlZW4pO1xuICAgIHZhciB1aWQgPSBnZXRfaGVybyh1bml2ZXJzZSkudWlkO1xuICAgIC8vTGVkZ2VyIGlzIGEgbGlzdCBvZiBkZWJ0c1xuICAgIHZhciBsZWRnZXIgPSB7fTtcbiAgICBtZXNzYWdlc1xuICAgICAgICAuZmlsdGVyKGZ1bmN0aW9uIChtKSB7XG4gICAgICAgIHJldHVybiBtLnBheWxvYWQudGVtcGxhdGUgPT0gXCJtb25leV9zZW50XCIgfHxcbiAgICAgICAgICAgIG0ucGF5bG9hZC50ZW1wbGF0ZSA9PSBcInNoYXJlZF90ZWNobm9sb2d5XCI7XG4gICAgfSlcbiAgICAgICAgLm1hcChmdW5jdGlvbiAobSkgeyByZXR1cm4gbS5wYXlsb2FkOyB9KVxuICAgICAgICAuZm9yRWFjaChmdW5jdGlvbiAobSkge1xuICAgICAgICB2YXIgbGlhaXNvbiA9IG0uZnJvbV9wdWlkID09IHVpZCA/IG0udG9fcHVpZCA6IG0uZnJvbV9wdWlkO1xuICAgICAgICB2YXIgdmFsdWUgPSBtLnRlbXBsYXRlID09IFwibW9uZXlfc2VudFwiID8gbS5hbW91bnQgOiBtLnByaWNlO1xuICAgICAgICB2YWx1ZSAqPSBtLmZyb21fcHVpZCA9PSB1aWQgPyAxIDogLTE7IC8vIGFtb3VudCBpcyAoKykgaWYgY3JlZGl0ICYgKC0pIGlmIGRlYnRcbiAgICAgICAgbGlhaXNvbiBpbiBsZWRnZXJcbiAgICAgICAgICAgID8gKGxlZGdlcltsaWFpc29uXSArPSB2YWx1ZSlcbiAgICAgICAgICAgIDogKGxlZGdlcltsaWFpc29uXSA9IHZhbHVlKTtcbiAgICB9KTtcbiAgICAvL1RPRE86IFJldmlldyB0aGF0IHRoaXMgaXMgY29ycmVjdGx5IGZpbmRpbmcgYSBsaXN0IG9mIG9ubHkgcGVvcGxlIHdobyBoYXZlIGRlYnRzLlxuICAgIC8vQWNjb3VudHMgYXJlIHRoZSBjcmVkaXQgb3IgZGViaXQgcmVsYXRlZCB0byBlYWNoIHVzZXJcbiAgICB2YXIgYWNjb3VudHMgPSBbXTtcbiAgICBmb3IgKHZhciB1aWRfMSBpbiBsZWRnZXIpIHtcbiAgICAgICAgdmFyIHBsYXllciA9IHBsYXllcnNbcGFyc2VJbnQodWlkXzEpXTtcbiAgICAgICAgcGxheWVyLmRlYnQgPSBsZWRnZXJbdWlkXzFdO1xuICAgICAgICBhY2NvdW50cy5wdXNoKHBsYXllcik7XG4gICAgfVxuICAgIGdldF9oZXJvKHVuaXZlcnNlKS5sZWRnZXIgPSBsZWRnZXI7XG4gICAgY29uc29sZS5sb2coYWNjb3VudHMpO1xuICAgIHJldHVybiBhY2NvdW50cztcbn1cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJMZWRnZXIoZ2FtZSwgY3J1eCwgTW91c2VUcmFwKSB7XG4gICAgLy9EZWNvbnN0cnVjdGlvbiBvZiBkaWZmZXJlbnQgY29tcG9uZW50cyBvZiB0aGUgZ2FtZS5cbiAgICB2YXIgY29uZmlnID0gZ2FtZS5jb25maWc7XG4gICAgdmFyIG5wID0gZ2FtZS5ucDtcbiAgICB2YXIgbnB1aSA9IGdhbWUubnB1aTtcbiAgICB2YXIgdW5pdmVyc2UgPSBnYW1lLnVuaXZlcnNlO1xuICAgIHZhciB0ZW1wbGF0ZXMgPSBnYW1lLnRlbXBsYXRlcztcbiAgICB2YXIgcGxheWVycyA9IHVuaXZlcnNlLmdhbGF4eS5wbGF5ZXJzO1xuICAgIE1vdXNlVHJhcC5iaW5kKFtcIm1cIiwgXCJNXCJdLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIG5wLnRyaWdnZXIoXCJ0cmlnZ2VyX2xlZGdlclwiKTtcbiAgICB9KTtcbiAgICB0ZW1wbGF0ZXNbXCJsZWRnZXJcIl0gPSBcIkxlZGdlclwiO1xuICAgIHRlbXBsYXRlc1tcInRlY2hfdHJhZGluZ1wiXSA9IFwiVHJhZGluZyBUZWNobm9sb2d5XCI7XG4gICAgdGVtcGxhdGVzW1wiZm9yZ2l2ZVwiXSA9IFwiUGF5IERlYnRcIjtcbiAgICB0ZW1wbGF0ZXNbXCJmb3JnaXZlX2RlYnRcIl0gPSBcIkFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBmb3JnaXZlIHRoaXMgZGVidD9cIjtcbiAgICBpZiAoIW5wdWkuaGFzbWVudWl0ZW0pIHtcbiAgICAgICAgbnB1aVxuICAgICAgICAgICAgLlNpZGVNZW51SXRlbShcImljb24tZGF0YWJhc2VcIiwgXCJsZWRnZXJcIiwgXCJ0cmlnZ2VyX2xlZGdlclwiKVxuICAgICAgICAgICAgLnJvb3N0KG5wdWkuc2lkZU1lbnUpO1xuICAgICAgICBucHVpLmhhc21lbnVpdGVtID0gdHJ1ZTtcbiAgICB9XG4gICAgbnB1aS5sZWRnZXJTY3JlZW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBucHVpLlNjcmVlbihcImxlZGdlclwiKTtcbiAgICB9O1xuICAgIG5wLm9uKFwidHJpZ2dlcl9sZWRnZXJcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgbGVkZ2VyU2NyZWVuID0gbnB1aS5sZWRnZXJTY3JlZW4oKTtcbiAgICAgICAgdmFyIGxvYWRpbmcgPSBjcnV4XG4gICAgICAgICAgICAuVGV4dChcIlwiLCBcInJlbCB0eHRfY2VudGVyIHBhZDEyIHNlY3Rpb25fdGl0bGVcIilcbiAgICAgICAgICAgIC5yYXdIVE1MKFwiVGFidWxhdGluZyBMZWRnZXIuLi5cIik7XG4gICAgICAgIGxvYWRpbmcucm9vc3QobGVkZ2VyU2NyZWVuKTtcbiAgICAgICAgbnB1aS5vbkhpZGVTY3JlZW4obnVsbCwgdHJ1ZSk7XG4gICAgICAgIG5wdWkub25IaWRlU2VsZWN0aW9uTWVudSgpO1xuICAgICAgICBucHVpLnRyaWdnZXIoXCJoaWRlX3NpZGVfbWVudVwiKTtcbiAgICAgICAgbnB1aS50cmlnZ2VyKFwicmVzZXRfZWRpdF9tb2RlXCIpO1xuICAgICAgICBucHVpLmFjdGl2ZVNjcmVlbiA9IGxlZGdlclNjcmVlbjtcbiAgICAgICAgbGVkZ2VyU2NyZWVuLnJvb3N0KG5wdWkuc2NyZWVuQ29udGFpbmVyKTtcbiAgICAgICAgbnB1aS5sYXlvdXRFbGVtZW50KGxlZGdlclNjcmVlbik7XG4gICAgICAgIENhY2hlLnVwZGF0ZV9ldmVudF9jYWNoZShnYW1lLCBjcnV4LCA0LCBDYWNoZS5yZWNpZXZlX25ld19tZXNzYWdlcywgY29uc29sZS5lcnJvcik7XG4gICAgfSk7XG4gICAgLy9XaHkgbm90IG5wLm9uKFwiRm9yZ2l2ZURlYnRcIik/XG4gICAgbnAub25Gb3JnaXZlRGVidCA9IGZ1bmN0aW9uIChldmVudCwgZGF0YSkge1xuICAgICAgICB2YXIgdGFyZ2V0UGxheWVyID0gZGF0YS50YXJnZXRQbGF5ZXI7XG4gICAgICAgIHZhciBwbGF5ZXIgPSBwbGF5ZXJzW3RhcmdldFBsYXllcl07XG4gICAgICAgIHZhciBhbW91bnQgPSBwbGF5ZXIuZGVidCAqIC0xO1xuICAgICAgICAvL2xldCBhbW91bnQgPSAxXG4gICAgICAgIHVuaXZlcnNlLnBsYXllci5sZWRnZXJbdGFyZ2V0UGxheWVyXSA9IDA7XG4gICAgICAgIG5wLnRyaWdnZXIoXCJzaG93X3NjcmVlblwiLCBbXG4gICAgICAgICAgICBcImNvbmZpcm1cIixcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBcImZvcmdpdmVfZGVidFwiLFxuICAgICAgICAgICAgICAgIGV2ZW50S2luZDogXCJjb25maXJtX2ZvcmdpdmVfZGVidFwiLFxuICAgICAgICAgICAgICAgIGV2ZW50RGF0YToge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiBcIm9yZGVyXCIsXG4gICAgICAgICAgICAgICAgICAgIG9yZGVyOiBcInNlbmRfbW9uZXksXCIuY29uY2F0KHRhcmdldFBsYXllciwgXCIsXCIpLmNvbmNhdChhbW91bnQpLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICBdKTtcbiAgICB9O1xuICAgIG5wLm9uKFwiY29uZmlybV9mb3JnaXZlX2RlYnRcIiwgZnVuY3Rpb24gKGV2ZW50LCBkYXRhKSB7XG4gICAgICAgIG5wLnRyaWdnZXIoXCJzZXJ2ZXJfcmVxdWVzdFwiLCBkYXRhKTtcbiAgICAgICAgbnAudHJpZ2dlcihcInRyaWdnZXJfbGVkZ2VyXCIpO1xuICAgIH0pO1xuICAgIG5wLm9uKFwiZm9yZ2l2ZV9kZWJ0XCIsIG5wLm9uRm9yZ2l2ZURlYnQpO1xufVxuIiwiaW1wb3J0IHsgZ2V0X2dhbGF4eSwgfSBmcm9tIFwiLi91dGlsaXRpZXMvZ2V0X2dhbWVfc3RhdGVcIjtcbmltcG9ydCB7IGdldF9hcGlfZGF0YSB9IGZyb20gXCIuL3V0aWxpdGllcy9hcGlcIjtcbnZhciBvcmlnaW5hbFBsYXllciA9IHVuZGVmaW5lZDtcbi8vVGhpcyBzYXZlcyB0aGUgYWN0dWFsIGNsaWVudCdzIHBsYXllci5cbmZ1bmN0aW9uIHNldF9vcmlnaW5hbF9wbGF5ZXIoKSB7XG4gICAgaWYgKG9yaWdpbmFsUGxheWVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgb3JpZ2luYWxQbGF5ZXIgPSBOZXB0dW5lc1ByaWRlLm9yaWdpbmFsUGxheWVyO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuZnVuY3Rpb24gdmFsaWRfYXBpa2V5KGFwaWtleSkge1xuICAgIHJldHVybiB0cnVlO1xufVxuZnVuY3Rpb24gYmFkX2tleShlcnIpIHtcbiAgICBjb25zb2xlLmxvZyhcIlRoZSBrZXkgaXMgYmFkIGFuZCBtZXJnaW5nIEZBSUxFRCFcIik7XG59XG5leHBvcnQgZnVuY3Rpb24gbWVyZ2VVc2VyKGV2ZW50LCBkYXRhKSB7XG4gICAgc2V0X29yaWdpbmFsX3BsYXllcigpO1xuICAgIC8vRXh0cmFjdCB0aGF0IEtFWVxuICAgIC8vVE9ETzogQWRkIHJlZ2V4IHRvIGdldCBUSEFUIEtFWVxuICAgIHZhciBhcGlrZXkgPSBkYXRhID09PSBudWxsIHx8IGRhdGEgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGRhdGEuc3BsaXQoXCI6XCIpWzFdO1xuICAgIGNvbnNvbGUubG9nKGFwaWtleSk7XG4gICAgaWYgKHZhbGlkX2FwaWtleShhcGlrZXkpKSB7XG4gICAgICAgIGdldF9hcGlfZGF0YShhcGlrZXkpXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgcmV0dXJuIFwiZXJyb3JcIiBpbiBkYXRhXG4gICAgICAgICAgICAgICAgPyBiYWRfa2V5KGRhdGEpXG4gICAgICAgICAgICAgICAgOiBtZXJnZVVzZXJEYXRhKGRhdGEuc2Nhbm5pbmdfZGF0YSk7XG4gICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goY29uc29sZS5sb2cpO1xuICAgIH1cbn1cbi8vQ29tYmluZSBkYXRhIGZyb20gYW5vdGhlciB1c2VyXG4vL0NhbGxiYWNrIG9uIEFQSSAuLlxuLy9tZWNoYW5pYyBjbG9zZXMgYXQgNXBrLG1cbi8vVGhpcyB3b3JrcyBidXQgbm93IGFkZCBpdCBzbyBpdCBkb2VzIG5vdCBvdmVydGFrZSB5b3VyIHN0YXJzLlxuZXhwb3J0IGZ1bmN0aW9uIG1lcmdlVXNlckRhdGEoc2Nhbm5pbmdEYXRhKSB7XG4gICAgdmFyIGdhbGF4eSA9IGdldF9nYWxheHkoKTtcbiAgICB2YXIgc3RhcnMgPSBzY2FubmluZ0RhdGEuc3RhcnM7XG4gICAgdmFyIGZsZWV0cyA9IHNjYW5uaW5nRGF0YS5mbGVldHM7XG4gICAgLy8gVXBkYXRlIHN0YXJzXG4gICAgZm9yICh2YXIgc3RhcklkIGluIHN0YXJzKSB7XG4gICAgICAgIHZhciBzdGFyID0gc3RhcnNbc3RhcklkXTtcbiAgICAgICAgZ2FsYXh5LnN0YXJzW3N0YXJJZF0gPSBzdGFyO1xuICAgIH1cbiAgICBjb25zb2xlLmxvZyhcIlN5bmNpbmdcIik7XG4gICAgLy8gQWRkIGZsZWV0c1xuICAgIGZvciAodmFyIGZsZWV0SWQgaW4gZmxlZXRzKSB7XG4gICAgICAgIHZhciBmbGVldCA9IGZsZWV0c1tmbGVldElkXTtcbiAgICAgICAgZ2FsYXh5LmZsZWV0c1tmbGVldElkXSA9IGZsZWV0O1xuICAgIH1cbiAgICAvL29uRnVsbFVuaXZlcnNlIFNlZW1zIHRvIGFkZGl0aW9uYWxseSBsb2FkIGFsbCB0aGUgcGxheWVycy5cbiAgICBOZXB0dW5lc1ByaWRlLm5wLm9uRnVsbFVuaXZlcnNlKG51bGwsIGdhbGF4eSk7XG4gICAgLy9OZXB0dW5lc1ByaWRlLm5wdWkub25IaWRlU2NyZWVuKG51bGwsIHRydWUpO1xufVxuIiwiaW1wb3J0IHsgbWFya2VkIH0gZnJvbSBcIm1hcmtlZFwiO1xuZXhwb3J0IGZ1bmN0aW9uIG1hcmtkb3duKG1hcmtkb3duU3RyaW5nKSB7XG4gICAgcmV0dXJuIG1hcmtlZC5wYXJzZShtYXJrZG93blN0cmluZyk7XG59XG5leHBvcnQgZnVuY3Rpb24gaXNfdmFsaWRfaW1hZ2VfdXJsKHN0cikge1xuICAgIHZhciBwcm90b2NvbCA9IFwiXihodHRwczpcXFxcL1xcXFwvKVwiO1xuICAgIHZhciBkb21haW5zID0gXCIoaVxcXFwuaWJiXFxcXC5jb3xpXFxcXC5pbWd1clxcXFwuY29tfGNkblxcXFwuZGlzY29yZGFwcFxcXFwuY29tKVwiO1xuICAgIHZhciBjb250ZW50ID0gXCIoWyYjXz07XFxcXC1cXFxcP1xcXFwvXFxcXHddezEsMTUwfSlcIjtcbiAgICB2YXIgaW1hZ2VzID0gXCIoXFxcXC4pKGdpZnxqcGU/Z3x0aWZmP3xwbmd8d2VicHxibXB8R0lGfEpQRT9HfFRJRkY/fFBOR3xXRUJQfEJNUCkkXCI7XG4gICAgdmFyIHJlZ2V4X3N0cmluZyA9IHByb3RvY29sICsgZG9tYWlucyArIGNvbnRlbnQgKyBpbWFnZXM7XG4gICAgdmFyIHJlZ2V4ID0gbmV3IFJlZ0V4cChyZWdleF9zdHJpbmcpO1xuICAgIHZhciB2YWxpZCA9IHJlZ2V4LnRlc3Qoc3RyKTtcbiAgICByZXR1cm4gdmFsaWQ7XG59XG5leHBvcnQgZnVuY3Rpb24gaXNfdmFsaWRfeW91dHViZShzdHIpIHtcbiAgICB2YXIgcHJvdG9jb2wgPSBcIl4oaHR0cHM6Ly8pXCI7XG4gICAgdmFyIGRvbWFpbnMgPSBcIih5b3V0dWJlLmNvbXx3d3cueW91dHViZS5jb218eW91dHUuYmUpXCI7XG4gICAgdmFyIGNvbnRlbnQgPSBcIihbJiNfPTstPy93XXsxLDE1MH0pXCI7XG4gICAgdmFyIHJlZ2V4X3N0cmluZyA9IHByb3RvY29sICsgZG9tYWlucyArIGNvbnRlbnQ7XG4gICAgdmFyIHJlZ2V4ID0gbmV3IFJlZ0V4cChyZWdleF9zdHJpbmcpO1xuICAgIHJldHVybiByZWdleC50ZXN0KHN0cik7XG59XG5mdW5jdGlvbiBnZXRfeW91dHViZV9lbWJlZChsaW5rKSB7XG4gICAgcmV0dXJuIFwiPGlmcmFtZSB3aWR0aD1cXFwiNTYwXFxcIiBoZWlnaHQ9XFxcIjMxNVxcXCIgc3JjPVxcXCJodHRwczovL3d3dy55b3V0dWJlLmNvbS9lbWJlZC9lSHNEVEd3X2paOFxcXCIgdGl0bGU9XFxcIllvdVR1YmUgdmlkZW8gcGxheWVyXFxcIiBmcmFtZWJvcmRlcj1cXFwiMFxcXCIgYWxsb3c9XFxcImFjY2VsZXJvbWV0ZXI7IGF1dG9wbGF5OyBjbGlwYm9hcmQtd3JpdGU7IGVuY3J5cHRlZC1tZWRpYTsgZ3lyb3Njb3BlOyBwaWN0dXJlLWluLXBpY3R1cmU7IHdlYi1zaGFyZVxcXCIgYWxsb3dmdWxsc2NyZWVuPjwvaWZyYW1lPlwiO1xufVxuIiwiaW1wb3J0IHsgZ2V0X2dhbWVfbnVtYmVyIH0gZnJvbSBcIi4vZ2V0X2dhbWVfc3RhdGVcIjtcbmV4cG9ydCBmdW5jdGlvbiBnZXRfYXBpX2RhdGEoYXBpa2V5KSB7XG4gICAgdmFyIGdhbWVfbnVtYmVyID0gZ2V0X2dhbWVfbnVtYmVyKCk7XG4gICAgcmV0dXJuIGZldGNoKFwiaHR0cHM6Ly9ucC5pcm9uaGVsbWV0LmNvbS9hcGlcIiwge1xuICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICBhY2NlcHQ6IFwiYXBwbGljYXRpb24vanNvbiwgdGV4dC9qYXZhc2NyaXB0LCAqLyo7IHE9MC4wMVwiLFxuICAgICAgICAgICAgXCJhY2NlcHQtbGFuZ3VhZ2VcIjogXCJlbi1VUyxlbjtxPTAuOVwiLFxuICAgICAgICAgICAgXCJjb250ZW50LXR5cGVcIjogXCJhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQ7IGNoYXJzZXQ9VVRGLThcIixcbiAgICAgICAgICAgIFwieC1yZXF1ZXN0ZWQtd2l0aFwiOiBcIlhNTEh0dHBSZXF1ZXN0XCIsXG4gICAgICAgIH0sXG4gICAgICAgIHJlZmVycmVyOiBcImh0dHBzOi8vbnAuaXJvbmhlbG1ldC5jb20vZ2FtZS9cIi5jb25jYXQoZ2FtZV9udW1iZXIpLFxuICAgICAgICByZWZlcnJlclBvbGljeTogXCJzdHJpY3Qtb3JpZ2luLXdoZW4tY3Jvc3Mtb3JpZ2luXCIsXG4gICAgICAgIGJvZHk6IFwiZ2FtZV9udW1iZXI9XCIuY29uY2F0KGdhbWVfbnVtYmVyLCBcIiZhcGlfdmVyc2lvbj0wLjEmY29kZT1cIikuY29uY2F0KGFwaWtleSksXG4gICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgIG1vZGU6IFwiY29yc1wiLFxuICAgICAgICBjcmVkZW50aWFsczogXCJpbmNsdWRlXCIsXG4gICAgfSkudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHsgcmV0dXJuIHJlc3BvbnNlLmpzb24oKTsgfSk7XG59XG4iLCJleHBvcnQgZnVuY3Rpb24gZ2V0X3Zpc2libGVfc3RhcnMoKSB7XG4gICAgdmFyIHN0YXJzID0gZ2V0X2FsbF9zdGFycygpO1xuICAgIGlmIChzdGFycyA9PT0gdW5kZWZpbmVkKVxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIHZhciB2aXNpYmxlX3N0YXJzID0gW107XG4gICAgZm9yICh2YXIgX2kgPSAwLCBfYSA9IE9iamVjdC5lbnRyaWVzKHN0YXJzKTsgX2kgPCBfYS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgdmFyIF9iID0gX2FbX2ldLCBpbmRleCA9IF9iWzBdLCBzdGFyID0gX2JbMV07XG4gICAgICAgIGlmIChzdGFyLnYgPT09IFwiMVwiKSB7XG4gICAgICAgICAgICAvL1N0YXIgaXMgdmlzaWJsZVxuICAgICAgICAgICAgdmlzaWJsZV9zdGFycy5wdXNoKHN0YXIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB2aXNpYmxlX3N0YXJzO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGdldF9nYW1lX251bWJlcigpIHtcbiAgICBpZiAoTmVwdHVuZXNQcmlkZSA9PT0gdW5kZWZpbmVkKVxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIHJldHVybiBOZXB0dW5lc1ByaWRlLmdhbWVOdW1iZXI7XG59XG5leHBvcnQgZnVuY3Rpb24gZ2V0X2FsbF9zdGFycygpIHtcbiAgICBpZiAoTmVwdHVuZXNQcmlkZSA9PT0gdW5kZWZpbmVkKVxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIHJldHVybiBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlLmdhbGF4eS5zdGFycztcbn1cbmV4cG9ydCBmdW5jdGlvbiBnZXRfZmxlZXRzKCkge1xuICAgIGlmIChOZXB0dW5lc1ByaWRlID09PSB1bmRlZmluZWQpXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgcmV0dXJuIE5lcHR1bmVzUHJpZGUudW5pdmVyc2UuZ2FsYXh5LmZsZWV0cztcbn1cbmV4cG9ydCBmdW5jdGlvbiBnZXRfZ2FsYXh5KCkge1xuICAgIGlmIChOZXB0dW5lc1ByaWRlID09PSB1bmRlZmluZWQpXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgcmV0dXJuIGdldF91bml2ZXJzZSgpLmdhbGF4eTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBnZXRfdW5pdmVyc2UoKSB7XG4gICAgaWYgKE5lcHR1bmVzUHJpZGUgPT09IHVuZGVmaW5lZClcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICByZXR1cm4gTmVwdHVuZXNQcmlkZS51bml2ZXJzZTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBnZXRfbmVwdHVuZXNfcHJpZGUoKSB7XG4gICAgaWYgKE5lcHR1bmVzUHJpZGUgPT09IHVuZGVmaW5lZClcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICByZXR1cm4gTmVwdHVuZXNQcmlkZS5ucDtcbn1cbmV4cG9ydCBmdW5jdGlvbiBnZXRfZ2FtZV9zdGF0ZSgpIHtcbiAgICBpZiAoTmVwdHVuZXNQcmlkZSA9PT0gdW5kZWZpbmVkKVxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIHJldHVybiBOZXB0dW5lc1ByaWRlO1xufVxuIiwiZXhwb3J0IGZ1bmN0aW9uIGRyYXdPdmVybGF5U3RyaW5nKGNvbnRleHQsIHRleHQsIHgsIHksIGZnQ29sb3IpIHtcbiAgICBjb250ZXh0LmZpbGxTdHlsZSA9IFwiIzAwMDAwMFwiO1xuICAgIGZvciAodmFyIHNtZWFyID0gMTsgc21lYXIgPCA0OyArK3NtZWFyKSB7XG4gICAgICAgIGNvbnRleHQuZmlsbFRleHQodGV4dCwgeCArIHNtZWFyLCB5ICsgc21lYXIpO1xuICAgICAgICBjb250ZXh0LmZpbGxUZXh0KHRleHQsIHggLSBzbWVhciwgeSArIHNtZWFyKTtcbiAgICAgICAgY29udGV4dC5maWxsVGV4dCh0ZXh0LCB4IC0gc21lYXIsIHkgLSBzbWVhcik7XG4gICAgICAgIGNvbnRleHQuZmlsbFRleHQodGV4dCwgeCArIHNtZWFyLCB5IC0gc21lYXIpO1xuICAgIH1cbiAgICBjb250ZXh0LmZpbGxTdHlsZSA9IGZnQ29sb3IgfHwgXCIjMDBmZjAwXCI7XG4gICAgY29udGV4dC5maWxsVGV4dCh0ZXh0LCB4LCB5KTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBhbnlTdGFyQ2FuU2VlKHVuaXZlcnNlLCBvd25lciwgZmxlZXQpIHtcbiAgICB2YXIgc3RhcnMgPSB1bml2ZXJzZS5nYWxheHkuc3RhcnM7XG4gICAgdmFyIHNjYW5SYW5nZSA9IHVuaXZlcnNlLmdhbGF4eS5wbGF5ZXJzW293bmVyXS50ZWNoLnNjYW5uaW5nLnZhbHVlO1xuICAgIGZvciAodmFyIHMgaW4gc3RhcnMpIHtcbiAgICAgICAgdmFyIHN0YXIgPSBzdGFyc1tzXTtcbiAgICAgICAgaWYgKHN0YXIucHVpZCA9PSBvd25lcikge1xuICAgICAgICAgICAgdmFyIGRpc3RhbmNlID0gdW5pdmVyc2UuZGlzdGFuY2Uoc3Rhci54LCBzdGFyLnksIHBhcnNlRmxvYXQoZmxlZXQueCksIHBhcnNlRmxvYXQoZmxlZXQueSkpO1xuICAgICAgICAgICAgaWYgKGRpc3RhbmNlIDw9IHNjYW5SYW5nZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn1cbiIsImltcG9ydCB7IGdldF9jYWNoZWRfZXZlbnRzLCB1cGRhdGVfZXZlbnRfY2FjaGUsIH0gZnJvbSBcIi4uL2V2ZW50X2NhY2hlXCI7XG5leHBvcnQgZnVuY3Rpb24gZ2V0X25wY190aWNrKGdhbWUsIGNydXgpIHtcbiAgICB2YXIgYWkgPSBnYW1lLnVuaXZlcnNlLnNlbGVjdGVkUGxheWVyO1xuICAgIHZhciBjYWNoZSA9IGdldF9jYWNoZWRfZXZlbnRzKCk7XG4gICAgdmFyIGV2ZW50cyA9IGNhY2hlLm1hcChmdW5jdGlvbiAoZSkgeyByZXR1cm4gZS5wYXlsb2FkOyB9KTtcbiAgICB2YXIgZ29vZGJ5ZXMgPSBldmVudHMuZmlsdGVyKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIHJldHVybiBlLnRlbXBsYXRlLmluY2x1ZGVzKFwiZ29vZGJ5ZV90b19wbGF5ZXJcIik7XG4gICAgfSk7XG4gICAgdmFyIHRpY2sgPSBnb29kYnllcy5maWx0ZXIoZnVuY3Rpb24gKGUpIHsgcmV0dXJuIGUudWlkID09IGFpLnVpZDsgfSlbMF0udGljaztcbiAgICBjb25zb2xlLmxvZyh0aWNrKTtcbiAgICByZXR1cm4gdGljaztcbn1cbmV4cG9ydCBmdW5jdGlvbiBhZGRfbnBjX3RpY2tfY291bnRlcihnYW1lLCBjcnV4KSB7XG4gICAgdmFyIHRpY2sgPSBnZXRfbnBjX3RpY2soZ2FtZSwgY3J1eCk7XG4gICAgdmFyIHRpdGxlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNjb250ZW50QXJlYSA+IGRpdiA+IGRpdi53aWRnZXQuZnVsbHNjcmVlbiA+IGRpdjpudGgtY2hpbGQoMykgPiBkaXYgPiBkaXY6bnRoLWNoaWxkKDUpID4gZGl2LndpZGdldC5zZWN0aW9uX3RpdGxlLmNvbF9ibGFja1wiKTtcbiAgICB2YXIgc3VidGl0bGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2NvbnRlbnRBcmVhID4gZGl2ID4gZGl2LndpZGdldC5mdWxsc2NyZWVuID4gZGl2Om50aC1jaGlsZCgzKSA+IGRpdiA+IGRpdjpudGgtY2hpbGQoNSkgPiBkaXYud2lkZ2V0LnR4dF9yaWdodC5wYWQxMlwiKTtcbiAgICB2YXIgY3VycmVudF90aWNrID0gZ2FtZS51bml2ZXJzZS5nYWxheHkudGljaztcbiAgICB2YXIgbmV4dF9tb3ZlID0gKGN1cnJlbnRfdGljayAtIHRpY2spICUgNDtcbiAgICB2YXIgbGFzdF9tb3ZlID0gNCAtIG5leHRfbW92ZTtcbiAgICAvL2xldCBsYXN0X21vdmUgPSBjdXJyZW50X3RpY2stbmV4dF9tb3ZlXG4gICAgdmFyIHBvc3RmaXhfMSA9IFwiXCI7XG4gICAgdmFyIHBvc3RmaXhfMiA9IFwiXCI7XG4gICAgaWYgKG5leHRfbW92ZSAhPSAxKSB7XG4gICAgICAgIHBvc3RmaXhfMSArPSBcInNcIjtcbiAgICB9XG4gICAgaWYgKGxhc3RfbW92ZSAhPSAxKSB7XG4gICAgICAgIHBvc3RmaXhfMiArPSBcInNcIjtcbiAgICB9XG4gICAgaWYgKG5leHRfbW92ZSA9PSAwKSB7XG4gICAgICAgIG5leHRfbW92ZSA9IDQ7XG4gICAgICAgIHRpdGxlLmlubmVyVGV4dCA9IFwiQUkgbW92ZXMgaW4gXCIuY29uY2F0KG5leHRfbW92ZSwgXCIgdGlja1wiKS5jb25jYXQocG9zdGZpeF8xKTtcbiAgICAgICAgc3VidGl0bGUuaW5uZXJUZXh0ID0gXCJBSSBtb3ZlZCB0aGlzIHRpY2tcIjtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHRpdGxlLmlubmVyVGV4dCA9IFwiQUkgbW92ZXMgaW4gXCIuY29uY2F0KG5leHRfbW92ZSwgXCIgdGlja1wiKS5jb25jYXQocG9zdGZpeF8xKTtcbiAgICAgICAgc3VidGl0bGUuaW5uZXJUZXh0ID0gXCJBSSBsYXN0IG1vdmVkIFwiLmNvbmNhdChsYXN0X21vdmUsIFwiIHRpY2tcIikuY29uY2F0KHBvc3RmaXhfMiwgXCIgYWdvXCIpO1xuICAgICAgICAvL3N1YnRpdGxlLmlubmVyVGV4dCA9IGBBSSBsYXN0IG1vdmVkIG9uIHRpY2sgJHtsYXN0X21vdmV9YFxuICAgIH1cbn1cbmV4cG9ydCBmdW5jdGlvbiBob29rX25wY190aWNrX2NvdW50ZXIoZ2FtZSwgY3J1eCkge1xuICAgIHZhciBzZWxlY3RlZFBsYXllciA9IGdhbWUudW5pdmVyc2Uuc2VsZWN0ZWRQbGF5ZXI7XG4gICAgaWYgKHNlbGVjdGVkUGxheWVyLmFpKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiQUkgU2VsZWN0ZWRcIik7XG4gICAgICAgIHVwZGF0ZV9ldmVudF9jYWNoZShnYW1lLCBjcnV4LCA0LCBhZGRfbnBjX3RpY2tfY291bnRlciwgY29uc29sZS5lcnJvcik7XG4gICAgfVxufVxuIiwiLyoqXG4gKiBtYXJrZWQgdjQuMi4xMiAtIGEgbWFya2Rvd24gcGFyc2VyXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTEtMjAyMywgQ2hyaXN0b3BoZXIgSmVmZnJleS4gKE1JVCBMaWNlbnNlZClcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXJrZWRqcy9tYXJrZWRcbiAqL1xuXG4vKipcbiAqIERPIE5PVCBFRElUIFRISVMgRklMRVxuICogVGhlIGNvZGUgaW4gdGhpcyBmaWxlIGlzIGdlbmVyYXRlZCBmcm9tIGZpbGVzIGluIC4vc3JjL1xuICovXG5cbmZ1bmN0aW9uIGdldERlZmF1bHRzKCkge1xuICByZXR1cm4ge1xuICAgIGFzeW5jOiBmYWxzZSxcbiAgICBiYXNlVXJsOiBudWxsLFxuICAgIGJyZWFrczogZmFsc2UsXG4gICAgZXh0ZW5zaW9uczogbnVsbCxcbiAgICBnZm06IHRydWUsXG4gICAgaGVhZGVySWRzOiB0cnVlLFxuICAgIGhlYWRlclByZWZpeDogJycsXG4gICAgaGlnaGxpZ2h0OiBudWxsLFxuICAgIGxhbmdQcmVmaXg6ICdsYW5ndWFnZS0nLFxuICAgIG1hbmdsZTogdHJ1ZSxcbiAgICBwZWRhbnRpYzogZmFsc2UsXG4gICAgcmVuZGVyZXI6IG51bGwsXG4gICAgc2FuaXRpemU6IGZhbHNlLFxuICAgIHNhbml0aXplcjogbnVsbCxcbiAgICBzaWxlbnQ6IGZhbHNlLFxuICAgIHNtYXJ0eXBhbnRzOiBmYWxzZSxcbiAgICB0b2tlbml6ZXI6IG51bGwsXG4gICAgd2Fsa1Rva2VuczogbnVsbCxcbiAgICB4aHRtbDogZmFsc2VcbiAgfTtcbn1cblxubGV0IGRlZmF1bHRzID0gZ2V0RGVmYXVsdHMoKTtcblxuZnVuY3Rpb24gY2hhbmdlRGVmYXVsdHMobmV3RGVmYXVsdHMpIHtcbiAgZGVmYXVsdHMgPSBuZXdEZWZhdWx0cztcbn1cblxuLyoqXG4gKiBIZWxwZXJzXG4gKi9cbmNvbnN0IGVzY2FwZVRlc3QgPSAvWyY8PlwiJ10vO1xuY29uc3QgZXNjYXBlUmVwbGFjZSA9IG5ldyBSZWdFeHAoZXNjYXBlVGVzdC5zb3VyY2UsICdnJyk7XG5jb25zdCBlc2NhcGVUZXN0Tm9FbmNvZGUgPSAvWzw+XCInXXwmKD8hKCNcXGR7MSw3fXwjW1h4XVthLWZBLUYwLTldezEsNn18XFx3Kyk7KS87XG5jb25zdCBlc2NhcGVSZXBsYWNlTm9FbmNvZGUgPSBuZXcgUmVnRXhwKGVzY2FwZVRlc3ROb0VuY29kZS5zb3VyY2UsICdnJyk7XG5jb25zdCBlc2NhcGVSZXBsYWNlbWVudHMgPSB7XG4gICcmJzogJyZhbXA7JyxcbiAgJzwnOiAnJmx0OycsXG4gICc+JzogJyZndDsnLFxuICAnXCInOiAnJnF1b3Q7JyxcbiAgXCInXCI6ICcmIzM5Oydcbn07XG5jb25zdCBnZXRFc2NhcGVSZXBsYWNlbWVudCA9IChjaCkgPT4gZXNjYXBlUmVwbGFjZW1lbnRzW2NoXTtcbmZ1bmN0aW9uIGVzY2FwZShodG1sLCBlbmNvZGUpIHtcbiAgaWYgKGVuY29kZSkge1xuICAgIGlmIChlc2NhcGVUZXN0LnRlc3QoaHRtbCkpIHtcbiAgICAgIHJldHVybiBodG1sLnJlcGxhY2UoZXNjYXBlUmVwbGFjZSwgZ2V0RXNjYXBlUmVwbGFjZW1lbnQpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpZiAoZXNjYXBlVGVzdE5vRW5jb2RlLnRlc3QoaHRtbCkpIHtcbiAgICAgIHJldHVybiBodG1sLnJlcGxhY2UoZXNjYXBlUmVwbGFjZU5vRW5jb2RlLCBnZXRFc2NhcGVSZXBsYWNlbWVudCk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGh0bWw7XG59XG5cbmNvbnN0IHVuZXNjYXBlVGVzdCA9IC8mKCMoPzpcXGQrKXwoPzojeFswLTlBLUZhLWZdKyl8KD86XFx3KykpOz8vaWc7XG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmd9IGh0bWxcbiAqL1xuZnVuY3Rpb24gdW5lc2NhcGUoaHRtbCkge1xuICAvLyBleHBsaWNpdGx5IG1hdGNoIGRlY2ltYWwsIGhleCwgYW5kIG5hbWVkIEhUTUwgZW50aXRpZXNcbiAgcmV0dXJuIGh0bWwucmVwbGFjZSh1bmVzY2FwZVRlc3QsIChfLCBuKSA9PiB7XG4gICAgbiA9IG4udG9Mb3dlckNhc2UoKTtcbiAgICBpZiAobiA9PT0gJ2NvbG9uJykgcmV0dXJuICc6JztcbiAgICBpZiAobi5jaGFyQXQoMCkgPT09ICcjJykge1xuICAgICAgcmV0dXJuIG4uY2hhckF0KDEpID09PSAneCdcbiAgICAgICAgPyBTdHJpbmcuZnJvbUNoYXJDb2RlKHBhcnNlSW50KG4uc3Vic3RyaW5nKDIpLCAxNikpXG4gICAgICAgIDogU3RyaW5nLmZyb21DaGFyQ29kZSgrbi5zdWJzdHJpbmcoMSkpO1xuICAgIH1cbiAgICByZXR1cm4gJyc7XG4gIH0pO1xufVxuXG5jb25zdCBjYXJldCA9IC8oXnxbXlxcW10pXFxeL2c7XG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmcgfCBSZWdFeHB9IHJlZ2V4XG4gKiBAcGFyYW0ge3N0cmluZ30gb3B0XG4gKi9cbmZ1bmN0aW9uIGVkaXQocmVnZXgsIG9wdCkge1xuICByZWdleCA9IHR5cGVvZiByZWdleCA9PT0gJ3N0cmluZycgPyByZWdleCA6IHJlZ2V4LnNvdXJjZTtcbiAgb3B0ID0gb3B0IHx8ICcnO1xuICBjb25zdCBvYmogPSB7XG4gICAgcmVwbGFjZTogKG5hbWUsIHZhbCkgPT4ge1xuICAgICAgdmFsID0gdmFsLnNvdXJjZSB8fCB2YWw7XG4gICAgICB2YWwgPSB2YWwucmVwbGFjZShjYXJldCwgJyQxJyk7XG4gICAgICByZWdleCA9IHJlZ2V4LnJlcGxhY2UobmFtZSwgdmFsKTtcbiAgICAgIHJldHVybiBvYmo7XG4gICAgfSxcbiAgICBnZXRSZWdleDogKCkgPT4ge1xuICAgICAgcmV0dXJuIG5ldyBSZWdFeHAocmVnZXgsIG9wdCk7XG4gICAgfVxuICB9O1xuICByZXR1cm4gb2JqO1xufVxuXG5jb25zdCBub25Xb3JkQW5kQ29sb25UZXN0ID0gL1teXFx3Ol0vZztcbmNvbnN0IG9yaWdpbkluZGVwZW5kZW50VXJsID0gL14kfF5bYS16XVthLXowLTkrLi1dKjp8Xls/I10vaTtcblxuLyoqXG4gKiBAcGFyYW0ge2Jvb2xlYW59IHNhbml0aXplXG4gKiBAcGFyYW0ge3N0cmluZ30gYmFzZVxuICogQHBhcmFtIHtzdHJpbmd9IGhyZWZcbiAqL1xuZnVuY3Rpb24gY2xlYW5Vcmwoc2FuaXRpemUsIGJhc2UsIGhyZWYpIHtcbiAgaWYgKHNhbml0aXplKSB7XG4gICAgbGV0IHByb3Q7XG4gICAgdHJ5IHtcbiAgICAgIHByb3QgPSBkZWNvZGVVUklDb21wb25lbnQodW5lc2NhcGUoaHJlZikpXG4gICAgICAgIC5yZXBsYWNlKG5vbldvcmRBbmRDb2xvblRlc3QsICcnKVxuICAgICAgICAudG9Mb3dlckNhc2UoKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgaWYgKHByb3QuaW5kZXhPZignamF2YXNjcmlwdDonKSA9PT0gMCB8fCBwcm90LmluZGV4T2YoJ3Zic2NyaXB0OicpID09PSAwIHx8IHByb3QuaW5kZXhPZignZGF0YTonKSA9PT0gMCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG4gIGlmIChiYXNlICYmICFvcmlnaW5JbmRlcGVuZGVudFVybC50ZXN0KGhyZWYpKSB7XG4gICAgaHJlZiA9IHJlc29sdmVVcmwoYmFzZSwgaHJlZik7XG4gIH1cbiAgdHJ5IHtcbiAgICBocmVmID0gZW5jb2RlVVJJKGhyZWYpLnJlcGxhY2UoLyUyNS9nLCAnJScpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgcmV0dXJuIGhyZWY7XG59XG5cbmNvbnN0IGJhc2VVcmxzID0ge307XG5jb25zdCBqdXN0RG9tYWluID0gL15bXjpdKzpcXC8qW14vXSokLztcbmNvbnN0IHByb3RvY29sID0gL14oW146XSs6KVtcXHNcXFNdKiQvO1xuY29uc3QgZG9tYWluID0gL14oW146XSs6XFwvKlteL10qKVtcXHNcXFNdKiQvO1xuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSBiYXNlXG4gKiBAcGFyYW0ge3N0cmluZ30gaHJlZlxuICovXG5mdW5jdGlvbiByZXNvbHZlVXJsKGJhc2UsIGhyZWYpIHtcbiAgaWYgKCFiYXNlVXJsc1snICcgKyBiYXNlXSkge1xuICAgIC8vIHdlIGNhbiBpZ25vcmUgZXZlcnl0aGluZyBpbiBiYXNlIGFmdGVyIHRoZSBsYXN0IHNsYXNoIG9mIGl0cyBwYXRoIGNvbXBvbmVudCxcbiAgICAvLyBidXQgd2UgbWlnaHQgbmVlZCB0byBhZGQgX3RoYXRfXG4gICAgLy8gaHR0cHM6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM5ODYjc2VjdGlvbi0zXG4gICAgaWYgKGp1c3REb21haW4udGVzdChiYXNlKSkge1xuICAgICAgYmFzZVVybHNbJyAnICsgYmFzZV0gPSBiYXNlICsgJy8nO1xuICAgIH0gZWxzZSB7XG4gICAgICBiYXNlVXJsc1snICcgKyBiYXNlXSA9IHJ0cmltKGJhc2UsICcvJywgdHJ1ZSk7XG4gICAgfVxuICB9XG4gIGJhc2UgPSBiYXNlVXJsc1snICcgKyBiYXNlXTtcbiAgY29uc3QgcmVsYXRpdmVCYXNlID0gYmFzZS5pbmRleE9mKCc6JykgPT09IC0xO1xuXG4gIGlmIChocmVmLnN1YnN0cmluZygwLCAyKSA9PT0gJy8vJykge1xuICAgIGlmIChyZWxhdGl2ZUJhc2UpIHtcbiAgICAgIHJldHVybiBocmVmO1xuICAgIH1cbiAgICByZXR1cm4gYmFzZS5yZXBsYWNlKHByb3RvY29sLCAnJDEnKSArIGhyZWY7XG4gIH0gZWxzZSBpZiAoaHJlZi5jaGFyQXQoMCkgPT09ICcvJykge1xuICAgIGlmIChyZWxhdGl2ZUJhc2UpIHtcbiAgICAgIHJldHVybiBocmVmO1xuICAgIH1cbiAgICByZXR1cm4gYmFzZS5yZXBsYWNlKGRvbWFpbiwgJyQxJykgKyBocmVmO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBiYXNlICsgaHJlZjtcbiAgfVxufVxuXG5jb25zdCBub29wVGVzdCA9IHsgZXhlYzogZnVuY3Rpb24gbm9vcFRlc3QoKSB7fSB9O1xuXG5mdW5jdGlvbiBtZXJnZShvYmopIHtcbiAgbGV0IGkgPSAxLFxuICAgIHRhcmdldCxcbiAgICBrZXk7XG5cbiAgZm9yICg7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICB0YXJnZXQgPSBhcmd1bWVudHNbaV07XG4gICAgZm9yIChrZXkgaW4gdGFyZ2V0KSB7XG4gICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHRhcmdldCwga2V5KSkge1xuICAgICAgICBvYmpba2V5XSA9IHRhcmdldFtrZXldO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBvYmo7XG59XG5cbmZ1bmN0aW9uIHNwbGl0Q2VsbHModGFibGVSb3csIGNvdW50KSB7XG4gIC8vIGVuc3VyZSB0aGF0IGV2ZXJ5IGNlbGwtZGVsaW1pdGluZyBwaXBlIGhhcyBhIHNwYWNlXG4gIC8vIGJlZm9yZSBpdCB0byBkaXN0aW5ndWlzaCBpdCBmcm9tIGFuIGVzY2FwZWQgcGlwZVxuICBjb25zdCByb3cgPSB0YWJsZVJvdy5yZXBsYWNlKC9cXHwvZywgKG1hdGNoLCBvZmZzZXQsIHN0cikgPT4ge1xuICAgICAgbGV0IGVzY2FwZWQgPSBmYWxzZSxcbiAgICAgICAgY3VyciA9IG9mZnNldDtcbiAgICAgIHdoaWxlICgtLWN1cnIgPj0gMCAmJiBzdHJbY3Vycl0gPT09ICdcXFxcJykgZXNjYXBlZCA9ICFlc2NhcGVkO1xuICAgICAgaWYgKGVzY2FwZWQpIHtcbiAgICAgICAgLy8gb2RkIG51bWJlciBvZiBzbGFzaGVzIG1lYW5zIHwgaXMgZXNjYXBlZFxuICAgICAgICAvLyBzbyB3ZSBsZWF2ZSBpdCBhbG9uZVxuICAgICAgICByZXR1cm4gJ3wnO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gYWRkIHNwYWNlIGJlZm9yZSB1bmVzY2FwZWQgfFxuICAgICAgICByZXR1cm4gJyB8JztcbiAgICAgIH1cbiAgICB9KSxcbiAgICBjZWxscyA9IHJvdy5zcGxpdCgvIFxcfC8pO1xuICBsZXQgaSA9IDA7XG5cbiAgLy8gRmlyc3QvbGFzdCBjZWxsIGluIGEgcm93IGNhbm5vdCBiZSBlbXB0eSBpZiBpdCBoYXMgbm8gbGVhZGluZy90cmFpbGluZyBwaXBlXG4gIGlmICghY2VsbHNbMF0udHJpbSgpKSB7IGNlbGxzLnNoaWZ0KCk7IH1cbiAgaWYgKGNlbGxzLmxlbmd0aCA+IDAgJiYgIWNlbGxzW2NlbGxzLmxlbmd0aCAtIDFdLnRyaW0oKSkgeyBjZWxscy5wb3AoKTsgfVxuXG4gIGlmIChjZWxscy5sZW5ndGggPiBjb3VudCkge1xuICAgIGNlbGxzLnNwbGljZShjb3VudCk7XG4gIH0gZWxzZSB7XG4gICAgd2hpbGUgKGNlbGxzLmxlbmd0aCA8IGNvdW50KSBjZWxscy5wdXNoKCcnKTtcbiAgfVxuXG4gIGZvciAoOyBpIDwgY2VsbHMubGVuZ3RoOyBpKyspIHtcbiAgICAvLyBsZWFkaW5nIG9yIHRyYWlsaW5nIHdoaXRlc3BhY2UgaXMgaWdub3JlZCBwZXIgdGhlIGdmbSBzcGVjXG4gICAgY2VsbHNbaV0gPSBjZWxsc1tpXS50cmltKCkucmVwbGFjZSgvXFxcXFxcfC9nLCAnfCcpO1xuICB9XG4gIHJldHVybiBjZWxscztcbn1cblxuLyoqXG4gKiBSZW1vdmUgdHJhaWxpbmcgJ2Mncy4gRXF1aXZhbGVudCB0byBzdHIucmVwbGFjZSgvYyokLywgJycpLlxuICogL2MqJC8gaXMgdnVsbmVyYWJsZSB0byBSRURPUy5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RyXG4gKiBAcGFyYW0ge3N0cmluZ30gY1xuICogQHBhcmFtIHtib29sZWFufSBpbnZlcnQgUmVtb3ZlIHN1ZmZpeCBvZiBub24tYyBjaGFycyBpbnN0ZWFkLiBEZWZhdWx0IGZhbHNleS5cbiAqL1xuZnVuY3Rpb24gcnRyaW0oc3RyLCBjLCBpbnZlcnQpIHtcbiAgY29uc3QgbCA9IHN0ci5sZW5ndGg7XG4gIGlmIChsID09PSAwKSB7XG4gICAgcmV0dXJuICcnO1xuICB9XG5cbiAgLy8gTGVuZ3RoIG9mIHN1ZmZpeCBtYXRjaGluZyB0aGUgaW52ZXJ0IGNvbmRpdGlvbi5cbiAgbGV0IHN1ZmZMZW4gPSAwO1xuXG4gIC8vIFN0ZXAgbGVmdCB1bnRpbCB3ZSBmYWlsIHRvIG1hdGNoIHRoZSBpbnZlcnQgY29uZGl0aW9uLlxuICB3aGlsZSAoc3VmZkxlbiA8IGwpIHtcbiAgICBjb25zdCBjdXJyQ2hhciA9IHN0ci5jaGFyQXQobCAtIHN1ZmZMZW4gLSAxKTtcbiAgICBpZiAoY3VyckNoYXIgPT09IGMgJiYgIWludmVydCkge1xuICAgICAgc3VmZkxlbisrO1xuICAgIH0gZWxzZSBpZiAoY3VyckNoYXIgIT09IGMgJiYgaW52ZXJ0KSB7XG4gICAgICBzdWZmTGVuKys7XG4gICAgfSBlbHNlIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBzdHIuc2xpY2UoMCwgbCAtIHN1ZmZMZW4pO1xufVxuXG5mdW5jdGlvbiBmaW5kQ2xvc2luZ0JyYWNrZXQoc3RyLCBiKSB7XG4gIGlmIChzdHIuaW5kZXhPZihiWzFdKSA9PT0gLTEpIHtcbiAgICByZXR1cm4gLTE7XG4gIH1cbiAgY29uc3QgbCA9IHN0ci5sZW5ndGg7XG4gIGxldCBsZXZlbCA9IDAsXG4gICAgaSA9IDA7XG4gIGZvciAoOyBpIDwgbDsgaSsrKSB7XG4gICAgaWYgKHN0cltpXSA9PT0gJ1xcXFwnKSB7XG4gICAgICBpKys7XG4gICAgfSBlbHNlIGlmIChzdHJbaV0gPT09IGJbMF0pIHtcbiAgICAgIGxldmVsKys7XG4gICAgfSBlbHNlIGlmIChzdHJbaV0gPT09IGJbMV0pIHtcbiAgICAgIGxldmVsLS07XG4gICAgICBpZiAobGV2ZWwgPCAwKSB7XG4gICAgICAgIHJldHVybiBpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gLTE7XG59XG5cbmZ1bmN0aW9uIGNoZWNrU2FuaXRpemVEZXByZWNhdGlvbihvcHQpIHtcbiAgaWYgKG9wdCAmJiBvcHQuc2FuaXRpemUgJiYgIW9wdC5zaWxlbnQpIHtcbiAgICBjb25zb2xlLndhcm4oJ21hcmtlZCgpOiBzYW5pdGl6ZSBhbmQgc2FuaXRpemVyIHBhcmFtZXRlcnMgYXJlIGRlcHJlY2F0ZWQgc2luY2UgdmVyc2lvbiAwLjcuMCwgc2hvdWxkIG5vdCBiZSB1c2VkIGFuZCB3aWxsIGJlIHJlbW92ZWQgaW4gdGhlIGZ1dHVyZS4gUmVhZCBtb3JlIGhlcmU6IGh0dHBzOi8vbWFya2VkLmpzLm9yZy8jL1VTSU5HX0FEVkFOQ0VELm1kI29wdGlvbnMnKTtcbiAgfVxufVxuXG4vLyBjb3BpZWQgZnJvbSBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL2EvNTQ1MDExMy84MDY3Nzdcbi8qKlxuICogQHBhcmFtIHtzdHJpbmd9IHBhdHRlcm5cbiAqIEBwYXJhbSB7bnVtYmVyfSBjb3VudFxuICovXG5mdW5jdGlvbiByZXBlYXRTdHJpbmcocGF0dGVybiwgY291bnQpIHtcbiAgaWYgKGNvdW50IDwgMSkge1xuICAgIHJldHVybiAnJztcbiAgfVxuICBsZXQgcmVzdWx0ID0gJyc7XG4gIHdoaWxlIChjb3VudCA+IDEpIHtcbiAgICBpZiAoY291bnQgJiAxKSB7XG4gICAgICByZXN1bHQgKz0gcGF0dGVybjtcbiAgICB9XG4gICAgY291bnQgPj49IDE7XG4gICAgcGF0dGVybiArPSBwYXR0ZXJuO1xuICB9XG4gIHJldHVybiByZXN1bHQgKyBwYXR0ZXJuO1xufVxuXG5mdW5jdGlvbiBvdXRwdXRMaW5rKGNhcCwgbGluaywgcmF3LCBsZXhlcikge1xuICBjb25zdCBocmVmID0gbGluay5ocmVmO1xuICBjb25zdCB0aXRsZSA9IGxpbmsudGl0bGUgPyBlc2NhcGUobGluay50aXRsZSkgOiBudWxsO1xuICBjb25zdCB0ZXh0ID0gY2FwWzFdLnJlcGxhY2UoL1xcXFwoW1xcW1xcXV0pL2csICckMScpO1xuXG4gIGlmIChjYXBbMF0uY2hhckF0KDApICE9PSAnIScpIHtcbiAgICBsZXhlci5zdGF0ZS5pbkxpbmsgPSB0cnVlO1xuICAgIGNvbnN0IHRva2VuID0ge1xuICAgICAgdHlwZTogJ2xpbmsnLFxuICAgICAgcmF3LFxuICAgICAgaHJlZixcbiAgICAgIHRpdGxlLFxuICAgICAgdGV4dCxcbiAgICAgIHRva2VuczogbGV4ZXIuaW5saW5lVG9rZW5zKHRleHQpXG4gICAgfTtcbiAgICBsZXhlci5zdGF0ZS5pbkxpbmsgPSBmYWxzZTtcbiAgICByZXR1cm4gdG9rZW47XG4gIH1cbiAgcmV0dXJuIHtcbiAgICB0eXBlOiAnaW1hZ2UnLFxuICAgIHJhdyxcbiAgICBocmVmLFxuICAgIHRpdGxlLFxuICAgIHRleHQ6IGVzY2FwZSh0ZXh0KVxuICB9O1xufVxuXG5mdW5jdGlvbiBpbmRlbnRDb2RlQ29tcGVuc2F0aW9uKHJhdywgdGV4dCkge1xuICBjb25zdCBtYXRjaEluZGVudFRvQ29kZSA9IHJhdy5tYXRjaCgvXihcXHMrKSg/OmBgYCkvKTtcblxuICBpZiAobWF0Y2hJbmRlbnRUb0NvZGUgPT09IG51bGwpIHtcbiAgICByZXR1cm4gdGV4dDtcbiAgfVxuXG4gIGNvbnN0IGluZGVudFRvQ29kZSA9IG1hdGNoSW5kZW50VG9Db2RlWzFdO1xuXG4gIHJldHVybiB0ZXh0XG4gICAgLnNwbGl0KCdcXG4nKVxuICAgIC5tYXAobm9kZSA9PiB7XG4gICAgICBjb25zdCBtYXRjaEluZGVudEluTm9kZSA9IG5vZGUubWF0Y2goL15cXHMrLyk7XG4gICAgICBpZiAobWF0Y2hJbmRlbnRJbk5vZGUgPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IFtpbmRlbnRJbk5vZGVdID0gbWF0Y2hJbmRlbnRJbk5vZGU7XG5cbiAgICAgIGlmIChpbmRlbnRJbk5vZGUubGVuZ3RoID49IGluZGVudFRvQ29kZS5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIG5vZGUuc2xpY2UoaW5kZW50VG9Db2RlLmxlbmd0aCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBub2RlO1xuICAgIH0pXG4gICAgLmpvaW4oJ1xcbicpO1xufVxuXG4vKipcbiAqIFRva2VuaXplclxuICovXG5jbGFzcyBUb2tlbml6ZXIge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyB8fCBkZWZhdWx0cztcbiAgfVxuXG4gIHNwYWNlKHNyYykge1xuICAgIGNvbnN0IGNhcCA9IHRoaXMucnVsZXMuYmxvY2submV3bGluZS5leGVjKHNyYyk7XG4gICAgaWYgKGNhcCAmJiBjYXBbMF0ubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ3NwYWNlJyxcbiAgICAgICAgcmF3OiBjYXBbMF1cbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgY29kZShzcmMpIHtcbiAgICBjb25zdCBjYXAgPSB0aGlzLnJ1bGVzLmJsb2NrLmNvZGUuZXhlYyhzcmMpO1xuICAgIGlmIChjYXApIHtcbiAgICAgIGNvbnN0IHRleHQgPSBjYXBbMF0ucmVwbGFjZSgvXiB7MSw0fS9nbSwgJycpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ2NvZGUnLFxuICAgICAgICByYXc6IGNhcFswXSxcbiAgICAgICAgY29kZUJsb2NrU3R5bGU6ICdpbmRlbnRlZCcsXG4gICAgICAgIHRleHQ6ICF0aGlzLm9wdGlvbnMucGVkYW50aWNcbiAgICAgICAgICA/IHJ0cmltKHRleHQsICdcXG4nKVxuICAgICAgICAgIDogdGV4dFxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICBmZW5jZXMoc3JjKSB7XG4gICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5ibG9jay5mZW5jZXMuZXhlYyhzcmMpO1xuICAgIGlmIChjYXApIHtcbiAgICAgIGNvbnN0IHJhdyA9IGNhcFswXTtcbiAgICAgIGNvbnN0IHRleHQgPSBpbmRlbnRDb2RlQ29tcGVuc2F0aW9uKHJhdywgY2FwWzNdIHx8ICcnKTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ2NvZGUnLFxuICAgICAgICByYXcsXG4gICAgICAgIGxhbmc6IGNhcFsyXSA/IGNhcFsyXS50cmltKCkucmVwbGFjZSh0aGlzLnJ1bGVzLmlubGluZS5fZXNjYXBlcywgJyQxJykgOiBjYXBbMl0sXG4gICAgICAgIHRleHRcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgaGVhZGluZyhzcmMpIHtcbiAgICBjb25zdCBjYXAgPSB0aGlzLnJ1bGVzLmJsb2NrLmhlYWRpbmcuZXhlYyhzcmMpO1xuICAgIGlmIChjYXApIHtcbiAgICAgIGxldCB0ZXh0ID0gY2FwWzJdLnRyaW0oKTtcblxuICAgICAgLy8gcmVtb3ZlIHRyYWlsaW5nICNzXG4gICAgICBpZiAoLyMkLy50ZXN0KHRleHQpKSB7XG4gICAgICAgIGNvbnN0IHRyaW1tZWQgPSBydHJpbSh0ZXh0LCAnIycpO1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnBlZGFudGljKSB7XG4gICAgICAgICAgdGV4dCA9IHRyaW1tZWQudHJpbSgpO1xuICAgICAgICB9IGVsc2UgaWYgKCF0cmltbWVkIHx8IC8gJC8udGVzdCh0cmltbWVkKSkge1xuICAgICAgICAgIC8vIENvbW1vbk1hcmsgcmVxdWlyZXMgc3BhY2UgYmVmb3JlIHRyYWlsaW5nICNzXG4gICAgICAgICAgdGV4dCA9IHRyaW1tZWQudHJpbSgpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdoZWFkaW5nJyxcbiAgICAgICAgcmF3OiBjYXBbMF0sXG4gICAgICAgIGRlcHRoOiBjYXBbMV0ubGVuZ3RoLFxuICAgICAgICB0ZXh0LFxuICAgICAgICB0b2tlbnM6IHRoaXMubGV4ZXIuaW5saW5lKHRleHQpXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIGhyKHNyYykge1xuICAgIGNvbnN0IGNhcCA9IHRoaXMucnVsZXMuYmxvY2suaHIuZXhlYyhzcmMpO1xuICAgIGlmIChjYXApIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdocicsXG4gICAgICAgIHJhdzogY2FwWzBdXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIGJsb2NrcXVvdGUoc3JjKSB7XG4gICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5ibG9jay5ibG9ja3F1b3RlLmV4ZWMoc3JjKTtcbiAgICBpZiAoY2FwKSB7XG4gICAgICBjb25zdCB0ZXh0ID0gY2FwWzBdLnJlcGxhY2UoL14gKj5bIFxcdF0/L2dtLCAnJyk7XG4gICAgICBjb25zdCB0b3AgPSB0aGlzLmxleGVyLnN0YXRlLnRvcDtcbiAgICAgIHRoaXMubGV4ZXIuc3RhdGUudG9wID0gdHJ1ZTtcbiAgICAgIGNvbnN0IHRva2VucyA9IHRoaXMubGV4ZXIuYmxvY2tUb2tlbnModGV4dCk7XG4gICAgICB0aGlzLmxleGVyLnN0YXRlLnRvcCA9IHRvcDtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdibG9ja3F1b3RlJyxcbiAgICAgICAgcmF3OiBjYXBbMF0sXG4gICAgICAgIHRva2VucyxcbiAgICAgICAgdGV4dFxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICBsaXN0KHNyYykge1xuICAgIGxldCBjYXAgPSB0aGlzLnJ1bGVzLmJsb2NrLmxpc3QuZXhlYyhzcmMpO1xuICAgIGlmIChjYXApIHtcbiAgICAgIGxldCByYXcsIGlzdGFzaywgaXNjaGVja2VkLCBpbmRlbnQsIGksIGJsYW5rTGluZSwgZW5kc1dpdGhCbGFua0xpbmUsXG4gICAgICAgIGxpbmUsIG5leHRMaW5lLCByYXdMaW5lLCBpdGVtQ29udGVudHMsIGVuZEVhcmx5O1xuXG4gICAgICBsZXQgYnVsbCA9IGNhcFsxXS50cmltKCk7XG4gICAgICBjb25zdCBpc29yZGVyZWQgPSBidWxsLmxlbmd0aCA+IDE7XG5cbiAgICAgIGNvbnN0IGxpc3QgPSB7XG4gICAgICAgIHR5cGU6ICdsaXN0JyxcbiAgICAgICAgcmF3OiAnJyxcbiAgICAgICAgb3JkZXJlZDogaXNvcmRlcmVkLFxuICAgICAgICBzdGFydDogaXNvcmRlcmVkID8gK2J1bGwuc2xpY2UoMCwgLTEpIDogJycsXG4gICAgICAgIGxvb3NlOiBmYWxzZSxcbiAgICAgICAgaXRlbXM6IFtdXG4gICAgICB9O1xuXG4gICAgICBidWxsID0gaXNvcmRlcmVkID8gYFxcXFxkezEsOX1cXFxcJHtidWxsLnNsaWNlKC0xKX1gIDogYFxcXFwke2J1bGx9YDtcblxuICAgICAgaWYgKHRoaXMub3B0aW9ucy5wZWRhbnRpYykge1xuICAgICAgICBidWxsID0gaXNvcmRlcmVkID8gYnVsbCA6ICdbKistXSc7XG4gICAgICB9XG5cbiAgICAgIC8vIEdldCBuZXh0IGxpc3QgaXRlbVxuICAgICAgY29uc3QgaXRlbVJlZ2V4ID0gbmV3IFJlZ0V4cChgXiggezAsM30ke2J1bGx9KSgoPzpbXFx0IF1bXlxcXFxuXSopPyg/OlxcXFxufCQpKWApO1xuXG4gICAgICAvLyBDaGVjayBpZiBjdXJyZW50IGJ1bGxldCBwb2ludCBjYW4gc3RhcnQgYSBuZXcgTGlzdCBJdGVtXG4gICAgICB3aGlsZSAoc3JjKSB7XG4gICAgICAgIGVuZEVhcmx5ID0gZmFsc2U7XG4gICAgICAgIGlmICghKGNhcCA9IGl0ZW1SZWdleC5leGVjKHNyYykpKSB7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5ydWxlcy5ibG9jay5oci50ZXN0KHNyYykpIHsgLy8gRW5kIGxpc3QgaWYgYnVsbGV0IHdhcyBhY3R1YWxseSBIUiAocG9zc2libHkgbW92ZSBpbnRvIGl0ZW1SZWdleD8pXG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICByYXcgPSBjYXBbMF07XG4gICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcocmF3Lmxlbmd0aCk7XG5cbiAgICAgICAgbGluZSA9IGNhcFsyXS5zcGxpdCgnXFxuJywgMSlbMF0ucmVwbGFjZSgvXlxcdCsvLCAodCkgPT4gJyAnLnJlcGVhdCgzICogdC5sZW5ndGgpKTtcbiAgICAgICAgbmV4dExpbmUgPSBzcmMuc3BsaXQoJ1xcbicsIDEpWzBdO1xuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMucGVkYW50aWMpIHtcbiAgICAgICAgICBpbmRlbnQgPSAyO1xuICAgICAgICAgIGl0ZW1Db250ZW50cyA9IGxpbmUudHJpbUxlZnQoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpbmRlbnQgPSBjYXBbMl0uc2VhcmNoKC9bXiBdLyk7IC8vIEZpbmQgZmlyc3Qgbm9uLXNwYWNlIGNoYXJcbiAgICAgICAgICBpbmRlbnQgPSBpbmRlbnQgPiA0ID8gMSA6IGluZGVudDsgLy8gVHJlYXQgaW5kZW50ZWQgY29kZSBibG9ja3MgKD4gNCBzcGFjZXMpIGFzIGhhdmluZyBvbmx5IDEgaW5kZW50XG4gICAgICAgICAgaXRlbUNvbnRlbnRzID0gbGluZS5zbGljZShpbmRlbnQpO1xuICAgICAgICAgIGluZGVudCArPSBjYXBbMV0ubGVuZ3RoO1xuICAgICAgICB9XG5cbiAgICAgICAgYmxhbmtMaW5lID0gZmFsc2U7XG5cbiAgICAgICAgaWYgKCFsaW5lICYmIC9eICokLy50ZXN0KG5leHRMaW5lKSkgeyAvLyBJdGVtcyBiZWdpbiB3aXRoIGF0IG1vc3Qgb25lIGJsYW5rIGxpbmVcbiAgICAgICAgICByYXcgKz0gbmV4dExpbmUgKyAnXFxuJztcbiAgICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKG5leHRMaW5lLmxlbmd0aCArIDEpO1xuICAgICAgICAgIGVuZEVhcmx5ID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghZW5kRWFybHkpIHtcbiAgICAgICAgICBjb25zdCBuZXh0QnVsbGV0UmVnZXggPSBuZXcgUmVnRXhwKGBeIHswLCR7TWF0aC5taW4oMywgaW5kZW50IC0gMSl9fSg/OlsqKy1dfFxcXFxkezEsOX1bLildKSgoPzpbIFxcdF1bXlxcXFxuXSopPyg/OlxcXFxufCQpKWApO1xuICAgICAgICAgIGNvbnN0IGhyUmVnZXggPSBuZXcgUmVnRXhwKGBeIHswLCR7TWF0aC5taW4oMywgaW5kZW50IC0gMSl9fSgoPzotICopezMsfXwoPzpfICopezMsfXwoPzpcXFxcKiAqKXszLH0pKD86XFxcXG4rfCQpYCk7XG4gICAgICAgICAgY29uc3QgZmVuY2VzQmVnaW5SZWdleCA9IG5ldyBSZWdFeHAoYF4gezAsJHtNYXRoLm1pbigzLCBpbmRlbnQgLSAxKX19KD86XFxgXFxgXFxgfH5+filgKTtcbiAgICAgICAgICBjb25zdCBoZWFkaW5nQmVnaW5SZWdleCA9IG5ldyBSZWdFeHAoYF4gezAsJHtNYXRoLm1pbigzLCBpbmRlbnQgLSAxKX19I2ApO1xuXG4gICAgICAgICAgLy8gQ2hlY2sgaWYgZm9sbG93aW5nIGxpbmVzIHNob3VsZCBiZSBpbmNsdWRlZCBpbiBMaXN0IEl0ZW1cbiAgICAgICAgICB3aGlsZSAoc3JjKSB7XG4gICAgICAgICAgICByYXdMaW5lID0gc3JjLnNwbGl0KCdcXG4nLCAxKVswXTtcbiAgICAgICAgICAgIG5leHRMaW5lID0gcmF3TGluZTtcblxuICAgICAgICAgICAgLy8gUmUtYWxpZ24gdG8gZm9sbG93IGNvbW1vbm1hcmsgbmVzdGluZyBydWxlc1xuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5wZWRhbnRpYykge1xuICAgICAgICAgICAgICBuZXh0TGluZSA9IG5leHRMaW5lLnJlcGxhY2UoL14gezEsNH0oPz0oIHs0fSkqW14gXSkvZywgJyAgJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEVuZCBsaXN0IGl0ZW0gaWYgZm91bmQgY29kZSBmZW5jZXNcbiAgICAgICAgICAgIGlmIChmZW5jZXNCZWdpblJlZ2V4LnRlc3QobmV4dExpbmUpKSB7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBFbmQgbGlzdCBpdGVtIGlmIGZvdW5kIHN0YXJ0IG9mIG5ldyBoZWFkaW5nXG4gICAgICAgICAgICBpZiAoaGVhZGluZ0JlZ2luUmVnZXgudGVzdChuZXh0TGluZSkpIHtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEVuZCBsaXN0IGl0ZW0gaWYgZm91bmQgc3RhcnQgb2YgbmV3IGJ1bGxldFxuICAgICAgICAgICAgaWYgKG5leHRCdWxsZXRSZWdleC50ZXN0KG5leHRMaW5lKSkge1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gSG9yaXpvbnRhbCBydWxlIGZvdW5kXG4gICAgICAgICAgICBpZiAoaHJSZWdleC50ZXN0KHNyYykpIHtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChuZXh0TGluZS5zZWFyY2goL1teIF0vKSA+PSBpbmRlbnQgfHwgIW5leHRMaW5lLnRyaW0oKSkgeyAvLyBEZWRlbnQgaWYgcG9zc2libGVcbiAgICAgICAgICAgICAgaXRlbUNvbnRlbnRzICs9ICdcXG4nICsgbmV4dExpbmUuc2xpY2UoaW5kZW50KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIG5vdCBlbm91Z2ggaW5kZW50YXRpb25cbiAgICAgICAgICAgICAgaWYgKGJsYW5rTGluZSkge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgLy8gcGFyYWdyYXBoIGNvbnRpbnVhdGlvbiB1bmxlc3MgbGFzdCBsaW5lIHdhcyBhIGRpZmZlcmVudCBibG9jayBsZXZlbCBlbGVtZW50XG4gICAgICAgICAgICAgIGlmIChsaW5lLnNlYXJjaCgvW14gXS8pID49IDQpIHsgLy8gaW5kZW50ZWQgY29kZSBibG9ja1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmIChmZW5jZXNCZWdpblJlZ2V4LnRlc3QobGluZSkpIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAoaGVhZGluZ0JlZ2luUmVnZXgudGVzdChsaW5lKSkge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmIChoclJlZ2V4LnRlc3QobGluZSkpIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGl0ZW1Db250ZW50cyArPSAnXFxuJyArIG5leHRMaW5lO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIWJsYW5rTGluZSAmJiAhbmV4dExpbmUudHJpbSgpKSB7IC8vIENoZWNrIGlmIGN1cnJlbnQgbGluZSBpcyBibGFua1xuICAgICAgICAgICAgICBibGFua0xpbmUgPSB0cnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByYXcgKz0gcmF3TGluZSArICdcXG4nO1xuICAgICAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhyYXdMaW5lLmxlbmd0aCArIDEpO1xuICAgICAgICAgICAgbGluZSA9IG5leHRMaW5lLnNsaWNlKGluZGVudCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFsaXN0Lmxvb3NlKSB7XG4gICAgICAgICAgLy8gSWYgdGhlIHByZXZpb3VzIGl0ZW0gZW5kZWQgd2l0aCBhIGJsYW5rIGxpbmUsIHRoZSBsaXN0IGlzIGxvb3NlXG4gICAgICAgICAgaWYgKGVuZHNXaXRoQmxhbmtMaW5lKSB7XG4gICAgICAgICAgICBsaXN0Lmxvb3NlID0gdHJ1ZTtcbiAgICAgICAgICB9IGVsc2UgaWYgKC9cXG4gKlxcbiAqJC8udGVzdChyYXcpKSB7XG4gICAgICAgICAgICBlbmRzV2l0aEJsYW5rTGluZSA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2hlY2sgZm9yIHRhc2sgbGlzdCBpdGVtc1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmdmbSkge1xuICAgICAgICAgIGlzdGFzayA9IC9eXFxbWyB4WF1cXF0gLy5leGVjKGl0ZW1Db250ZW50cyk7XG4gICAgICAgICAgaWYgKGlzdGFzaykge1xuICAgICAgICAgICAgaXNjaGVja2VkID0gaXN0YXNrWzBdICE9PSAnWyBdICc7XG4gICAgICAgICAgICBpdGVtQ29udGVudHMgPSBpdGVtQ29udGVudHMucmVwbGFjZSgvXlxcW1sgeFhdXFxdICsvLCAnJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgbGlzdC5pdGVtcy5wdXNoKHtcbiAgICAgICAgICB0eXBlOiAnbGlzdF9pdGVtJyxcbiAgICAgICAgICByYXcsXG4gICAgICAgICAgdGFzazogISFpc3Rhc2ssXG4gICAgICAgICAgY2hlY2tlZDogaXNjaGVja2VkLFxuICAgICAgICAgIGxvb3NlOiBmYWxzZSxcbiAgICAgICAgICB0ZXh0OiBpdGVtQ29udGVudHNcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbGlzdC5yYXcgKz0gcmF3O1xuICAgICAgfVxuXG4gICAgICAvLyBEbyBub3QgY29uc3VtZSBuZXdsaW5lcyBhdCBlbmQgb2YgZmluYWwgaXRlbS4gQWx0ZXJuYXRpdmVseSwgbWFrZSBpdGVtUmVnZXggKnN0YXJ0KiB3aXRoIGFueSBuZXdsaW5lcyB0byBzaW1wbGlmeS9zcGVlZCB1cCBlbmRzV2l0aEJsYW5rTGluZSBsb2dpY1xuICAgICAgbGlzdC5pdGVtc1tsaXN0Lml0ZW1zLmxlbmd0aCAtIDFdLnJhdyA9IHJhdy50cmltUmlnaHQoKTtcbiAgICAgIGxpc3QuaXRlbXNbbGlzdC5pdGVtcy5sZW5ndGggLSAxXS50ZXh0ID0gaXRlbUNvbnRlbnRzLnRyaW1SaWdodCgpO1xuICAgICAgbGlzdC5yYXcgPSBsaXN0LnJhdy50cmltUmlnaHQoKTtcblxuICAgICAgY29uc3QgbCA9IGxpc3QuaXRlbXMubGVuZ3RoO1xuXG4gICAgICAvLyBJdGVtIGNoaWxkIHRva2VucyBoYW5kbGVkIGhlcmUgYXQgZW5kIGJlY2F1c2Ugd2UgbmVlZGVkIHRvIGhhdmUgdGhlIGZpbmFsIGl0ZW0gdG8gdHJpbSBpdCBmaXJzdFxuICAgICAgZm9yIChpID0gMDsgaSA8IGw7IGkrKykge1xuICAgICAgICB0aGlzLmxleGVyLnN0YXRlLnRvcCA9IGZhbHNlO1xuICAgICAgICBsaXN0Lml0ZW1zW2ldLnRva2VucyA9IHRoaXMubGV4ZXIuYmxvY2tUb2tlbnMobGlzdC5pdGVtc1tpXS50ZXh0LCBbXSk7XG5cbiAgICAgICAgaWYgKCFsaXN0Lmxvb3NlKSB7XG4gICAgICAgICAgLy8gQ2hlY2sgaWYgbGlzdCBzaG91bGQgYmUgbG9vc2VcbiAgICAgICAgICBjb25zdCBzcGFjZXJzID0gbGlzdC5pdGVtc1tpXS50b2tlbnMuZmlsdGVyKHQgPT4gdC50eXBlID09PSAnc3BhY2UnKTtcbiAgICAgICAgICBjb25zdCBoYXNNdWx0aXBsZUxpbmVCcmVha3MgPSBzcGFjZXJzLmxlbmd0aCA+IDAgJiYgc3BhY2Vycy5zb21lKHQgPT4gL1xcbi4qXFxuLy50ZXN0KHQucmF3KSk7XG5cbiAgICAgICAgICBsaXN0Lmxvb3NlID0gaGFzTXVsdGlwbGVMaW5lQnJlYWtzO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFNldCBhbGwgaXRlbXMgdG8gbG9vc2UgaWYgbGlzdCBpcyBsb29zZVxuICAgICAgaWYgKGxpc3QubG9vc2UpIHtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgIGxpc3QuaXRlbXNbaV0ubG9vc2UgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBsaXN0O1xuICAgIH1cbiAgfVxuXG4gIGh0bWwoc3JjKSB7XG4gICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5ibG9jay5odG1sLmV4ZWMoc3JjKTtcbiAgICBpZiAoY2FwKSB7XG4gICAgICBjb25zdCB0b2tlbiA9IHtcbiAgICAgICAgdHlwZTogJ2h0bWwnLFxuICAgICAgICByYXc6IGNhcFswXSxcbiAgICAgICAgcHJlOiAhdGhpcy5vcHRpb25zLnNhbml0aXplclxuICAgICAgICAgICYmIChjYXBbMV0gPT09ICdwcmUnIHx8IGNhcFsxXSA9PT0gJ3NjcmlwdCcgfHwgY2FwWzFdID09PSAnc3R5bGUnKSxcbiAgICAgICAgdGV4dDogY2FwWzBdXG4gICAgICB9O1xuICAgICAgaWYgKHRoaXMub3B0aW9ucy5zYW5pdGl6ZSkge1xuICAgICAgICBjb25zdCB0ZXh0ID0gdGhpcy5vcHRpb25zLnNhbml0aXplciA/IHRoaXMub3B0aW9ucy5zYW5pdGl6ZXIoY2FwWzBdKSA6IGVzY2FwZShjYXBbMF0pO1xuICAgICAgICB0b2tlbi50eXBlID0gJ3BhcmFncmFwaCc7XG4gICAgICAgIHRva2VuLnRleHQgPSB0ZXh0O1xuICAgICAgICB0b2tlbi50b2tlbnMgPSB0aGlzLmxleGVyLmlubGluZSh0ZXh0KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0b2tlbjtcbiAgICB9XG4gIH1cblxuICBkZWYoc3JjKSB7XG4gICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5ibG9jay5kZWYuZXhlYyhzcmMpO1xuICAgIGlmIChjYXApIHtcbiAgICAgIGNvbnN0IHRhZyA9IGNhcFsxXS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL1xccysvZywgJyAnKTtcbiAgICAgIGNvbnN0IGhyZWYgPSBjYXBbMl0gPyBjYXBbMl0ucmVwbGFjZSgvXjwoLiopPiQvLCAnJDEnKS5yZXBsYWNlKHRoaXMucnVsZXMuaW5saW5lLl9lc2NhcGVzLCAnJDEnKSA6ICcnO1xuICAgICAgY29uc3QgdGl0bGUgPSBjYXBbM10gPyBjYXBbM10uc3Vic3RyaW5nKDEsIGNhcFszXS5sZW5ndGggLSAxKS5yZXBsYWNlKHRoaXMucnVsZXMuaW5saW5lLl9lc2NhcGVzLCAnJDEnKSA6IGNhcFszXTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdkZWYnLFxuICAgICAgICB0YWcsXG4gICAgICAgIHJhdzogY2FwWzBdLFxuICAgICAgICBocmVmLFxuICAgICAgICB0aXRsZVxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICB0YWJsZShzcmMpIHtcbiAgICBjb25zdCBjYXAgPSB0aGlzLnJ1bGVzLmJsb2NrLnRhYmxlLmV4ZWMoc3JjKTtcbiAgICBpZiAoY2FwKSB7XG4gICAgICBjb25zdCBpdGVtID0ge1xuICAgICAgICB0eXBlOiAndGFibGUnLFxuICAgICAgICBoZWFkZXI6IHNwbGl0Q2VsbHMoY2FwWzFdKS5tYXAoYyA9PiB7IHJldHVybiB7IHRleHQ6IGMgfTsgfSksXG4gICAgICAgIGFsaWduOiBjYXBbMl0ucmVwbGFjZSgvXiAqfFxcfCAqJC9nLCAnJykuc3BsaXQoLyAqXFx8ICovKSxcbiAgICAgICAgcm93czogY2FwWzNdICYmIGNhcFszXS50cmltKCkgPyBjYXBbM10ucmVwbGFjZSgvXFxuWyBcXHRdKiQvLCAnJykuc3BsaXQoJ1xcbicpIDogW11cbiAgICAgIH07XG5cbiAgICAgIGlmIChpdGVtLmhlYWRlci5sZW5ndGggPT09IGl0ZW0uYWxpZ24ubGVuZ3RoKSB7XG4gICAgICAgIGl0ZW0ucmF3ID0gY2FwWzBdO1xuXG4gICAgICAgIGxldCBsID0gaXRlbS5hbGlnbi5sZW5ndGg7XG4gICAgICAgIGxldCBpLCBqLCBrLCByb3c7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICBpZiAoL14gKi0rOiAqJC8udGVzdChpdGVtLmFsaWduW2ldKSkge1xuICAgICAgICAgICAgaXRlbS5hbGlnbltpXSA9ICdyaWdodCc7XG4gICAgICAgICAgfSBlbHNlIGlmICgvXiAqOi0rOiAqJC8udGVzdChpdGVtLmFsaWduW2ldKSkge1xuICAgICAgICAgICAgaXRlbS5hbGlnbltpXSA9ICdjZW50ZXInO1xuICAgICAgICAgIH0gZWxzZSBpZiAoL14gKjotKyAqJC8udGVzdChpdGVtLmFsaWduW2ldKSkge1xuICAgICAgICAgICAgaXRlbS5hbGlnbltpXSA9ICdsZWZ0JztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaXRlbS5hbGlnbltpXSA9IG51bGw7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgbCA9IGl0ZW0ucm93cy5sZW5ndGg7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICBpdGVtLnJvd3NbaV0gPSBzcGxpdENlbGxzKGl0ZW0ucm93c1tpXSwgaXRlbS5oZWFkZXIubGVuZ3RoKS5tYXAoYyA9PiB7IHJldHVybiB7IHRleHQ6IGMgfTsgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBwYXJzZSBjaGlsZCB0b2tlbnMgaW5zaWRlIGhlYWRlcnMgYW5kIGNlbGxzXG5cbiAgICAgICAgLy8gaGVhZGVyIGNoaWxkIHRva2Vuc1xuICAgICAgICBsID0gaXRlbS5oZWFkZXIubGVuZ3RoO1xuICAgICAgICBmb3IgKGogPSAwOyBqIDwgbDsgaisrKSB7XG4gICAgICAgICAgaXRlbS5oZWFkZXJbal0udG9rZW5zID0gdGhpcy5sZXhlci5pbmxpbmUoaXRlbS5oZWFkZXJbal0udGV4dCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBjZWxsIGNoaWxkIHRva2Vuc1xuICAgICAgICBsID0gaXRlbS5yb3dzLmxlbmd0aDtcbiAgICAgICAgZm9yIChqID0gMDsgaiA8IGw7IGorKykge1xuICAgICAgICAgIHJvdyA9IGl0ZW0ucm93c1tqXTtcbiAgICAgICAgICBmb3IgKGsgPSAwOyBrIDwgcm93Lmxlbmd0aDsgaysrKSB7XG4gICAgICAgICAgICByb3dba10udG9rZW5zID0gdGhpcy5sZXhlci5pbmxpbmUocm93W2tdLnRleHQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBpdGVtO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGxoZWFkaW5nKHNyYykge1xuICAgIGNvbnN0IGNhcCA9IHRoaXMucnVsZXMuYmxvY2subGhlYWRpbmcuZXhlYyhzcmMpO1xuICAgIGlmIChjYXApIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdoZWFkaW5nJyxcbiAgICAgICAgcmF3OiBjYXBbMF0sXG4gICAgICAgIGRlcHRoOiBjYXBbMl0uY2hhckF0KDApID09PSAnPScgPyAxIDogMixcbiAgICAgICAgdGV4dDogY2FwWzFdLFxuICAgICAgICB0b2tlbnM6IHRoaXMubGV4ZXIuaW5saW5lKGNhcFsxXSlcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgcGFyYWdyYXBoKHNyYykge1xuICAgIGNvbnN0IGNhcCA9IHRoaXMucnVsZXMuYmxvY2sucGFyYWdyYXBoLmV4ZWMoc3JjKTtcbiAgICBpZiAoY2FwKSB7XG4gICAgICBjb25zdCB0ZXh0ID0gY2FwWzFdLmNoYXJBdChjYXBbMV0ubGVuZ3RoIC0gMSkgPT09ICdcXG4nXG4gICAgICAgID8gY2FwWzFdLnNsaWNlKDAsIC0xKVxuICAgICAgICA6IGNhcFsxXTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdwYXJhZ3JhcGgnLFxuICAgICAgICByYXc6IGNhcFswXSxcbiAgICAgICAgdGV4dCxcbiAgICAgICAgdG9rZW5zOiB0aGlzLmxleGVyLmlubGluZSh0ZXh0KVxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICB0ZXh0KHNyYykge1xuICAgIGNvbnN0IGNhcCA9IHRoaXMucnVsZXMuYmxvY2sudGV4dC5leGVjKHNyYyk7XG4gICAgaWYgKGNhcCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ3RleHQnLFxuICAgICAgICByYXc6IGNhcFswXSxcbiAgICAgICAgdGV4dDogY2FwWzBdLFxuICAgICAgICB0b2tlbnM6IHRoaXMubGV4ZXIuaW5saW5lKGNhcFswXSlcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgZXNjYXBlKHNyYykge1xuICAgIGNvbnN0IGNhcCA9IHRoaXMucnVsZXMuaW5saW5lLmVzY2FwZS5leGVjKHNyYyk7XG4gICAgaWYgKGNhcCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ2VzY2FwZScsXG4gICAgICAgIHJhdzogY2FwWzBdLFxuICAgICAgICB0ZXh0OiBlc2NhcGUoY2FwWzFdKVxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICB0YWcoc3JjKSB7XG4gICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5pbmxpbmUudGFnLmV4ZWMoc3JjKTtcbiAgICBpZiAoY2FwKSB7XG4gICAgICBpZiAoIXRoaXMubGV4ZXIuc3RhdGUuaW5MaW5rICYmIC9ePGEgL2kudGVzdChjYXBbMF0pKSB7XG4gICAgICAgIHRoaXMubGV4ZXIuc3RhdGUuaW5MaW5rID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5sZXhlci5zdGF0ZS5pbkxpbmsgJiYgL148XFwvYT4vaS50ZXN0KGNhcFswXSkpIHtcbiAgICAgICAgdGhpcy5sZXhlci5zdGF0ZS5pbkxpbmsgPSBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGlmICghdGhpcy5sZXhlci5zdGF0ZS5pblJhd0Jsb2NrICYmIC9ePChwcmV8Y29kZXxrYmR8c2NyaXB0KShcXHN8PikvaS50ZXN0KGNhcFswXSkpIHtcbiAgICAgICAgdGhpcy5sZXhlci5zdGF0ZS5pblJhd0Jsb2NrID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5sZXhlci5zdGF0ZS5pblJhd0Jsb2NrICYmIC9ePFxcLyhwcmV8Y29kZXxrYmR8c2NyaXB0KShcXHN8PikvaS50ZXN0KGNhcFswXSkpIHtcbiAgICAgICAgdGhpcy5sZXhlci5zdGF0ZS5pblJhd0Jsb2NrID0gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6IHRoaXMub3B0aW9ucy5zYW5pdGl6ZVxuICAgICAgICAgID8gJ3RleHQnXG4gICAgICAgICAgOiAnaHRtbCcsXG4gICAgICAgIHJhdzogY2FwWzBdLFxuICAgICAgICBpbkxpbms6IHRoaXMubGV4ZXIuc3RhdGUuaW5MaW5rLFxuICAgICAgICBpblJhd0Jsb2NrOiB0aGlzLmxleGVyLnN0YXRlLmluUmF3QmxvY2ssXG4gICAgICAgIHRleHQ6IHRoaXMub3B0aW9ucy5zYW5pdGl6ZVxuICAgICAgICAgID8gKHRoaXMub3B0aW9ucy5zYW5pdGl6ZXJcbiAgICAgICAgICAgID8gdGhpcy5vcHRpb25zLnNhbml0aXplcihjYXBbMF0pXG4gICAgICAgICAgICA6IGVzY2FwZShjYXBbMF0pKVxuICAgICAgICAgIDogY2FwWzBdXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIGxpbmsoc3JjKSB7XG4gICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5pbmxpbmUubGluay5leGVjKHNyYyk7XG4gICAgaWYgKGNhcCkge1xuICAgICAgY29uc3QgdHJpbW1lZFVybCA9IGNhcFsyXS50cmltKCk7XG4gICAgICBpZiAoIXRoaXMub3B0aW9ucy5wZWRhbnRpYyAmJiAvXjwvLnRlc3QodHJpbW1lZFVybCkpIHtcbiAgICAgICAgLy8gY29tbW9ubWFyayByZXF1aXJlcyBtYXRjaGluZyBhbmdsZSBicmFja2V0c1xuICAgICAgICBpZiAoISgvPiQvLnRlc3QodHJpbW1lZFVybCkpKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZW5kaW5nIGFuZ2xlIGJyYWNrZXQgY2Fubm90IGJlIGVzY2FwZWRcbiAgICAgICAgY29uc3QgcnRyaW1TbGFzaCA9IHJ0cmltKHRyaW1tZWRVcmwuc2xpY2UoMCwgLTEpLCAnXFxcXCcpO1xuICAgICAgICBpZiAoKHRyaW1tZWRVcmwubGVuZ3RoIC0gcnRyaW1TbGFzaC5sZW5ndGgpICUgMiA9PT0gMCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gZmluZCBjbG9zaW5nIHBhcmVudGhlc2lzXG4gICAgICAgIGNvbnN0IGxhc3RQYXJlbkluZGV4ID0gZmluZENsb3NpbmdCcmFja2V0KGNhcFsyXSwgJygpJyk7XG4gICAgICAgIGlmIChsYXN0UGFyZW5JbmRleCA+IC0xKSB7XG4gICAgICAgICAgY29uc3Qgc3RhcnQgPSBjYXBbMF0uaW5kZXhPZignIScpID09PSAwID8gNSA6IDQ7XG4gICAgICAgICAgY29uc3QgbGlua0xlbiA9IHN0YXJ0ICsgY2FwWzFdLmxlbmd0aCArIGxhc3RQYXJlbkluZGV4O1xuICAgICAgICAgIGNhcFsyXSA9IGNhcFsyXS5zdWJzdHJpbmcoMCwgbGFzdFBhcmVuSW5kZXgpO1xuICAgICAgICAgIGNhcFswXSA9IGNhcFswXS5zdWJzdHJpbmcoMCwgbGlua0xlbikudHJpbSgpO1xuICAgICAgICAgIGNhcFszXSA9ICcnO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBsZXQgaHJlZiA9IGNhcFsyXTtcbiAgICAgIGxldCB0aXRsZSA9ICcnO1xuICAgICAgaWYgKHRoaXMub3B0aW9ucy5wZWRhbnRpYykge1xuICAgICAgICAvLyBzcGxpdCBwZWRhbnRpYyBocmVmIGFuZCB0aXRsZVxuICAgICAgICBjb25zdCBsaW5rID0gL14oW14nXCJdKlteXFxzXSlcXHMrKFsnXCJdKSguKilcXDIvLmV4ZWMoaHJlZik7XG5cbiAgICAgICAgaWYgKGxpbmspIHtcbiAgICAgICAgICBocmVmID0gbGlua1sxXTtcbiAgICAgICAgICB0aXRsZSA9IGxpbmtbM107XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRpdGxlID0gY2FwWzNdID8gY2FwWzNdLnNsaWNlKDEsIC0xKSA6ICcnO1xuICAgICAgfVxuXG4gICAgICBocmVmID0gaHJlZi50cmltKCk7XG4gICAgICBpZiAoL148Ly50ZXN0KGhyZWYpKSB7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMucGVkYW50aWMgJiYgISgvPiQvLnRlc3QodHJpbW1lZFVybCkpKSB7XG4gICAgICAgICAgLy8gcGVkYW50aWMgYWxsb3dzIHN0YXJ0aW5nIGFuZ2xlIGJyYWNrZXQgd2l0aG91dCBlbmRpbmcgYW5nbGUgYnJhY2tldFxuICAgICAgICAgIGhyZWYgPSBocmVmLnNsaWNlKDEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGhyZWYgPSBocmVmLnNsaWNlKDEsIC0xKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIG91dHB1dExpbmsoY2FwLCB7XG4gICAgICAgIGhyZWY6IGhyZWYgPyBocmVmLnJlcGxhY2UodGhpcy5ydWxlcy5pbmxpbmUuX2VzY2FwZXMsICckMScpIDogaHJlZixcbiAgICAgICAgdGl0bGU6IHRpdGxlID8gdGl0bGUucmVwbGFjZSh0aGlzLnJ1bGVzLmlubGluZS5fZXNjYXBlcywgJyQxJykgOiB0aXRsZVxuICAgICAgfSwgY2FwWzBdLCB0aGlzLmxleGVyKTtcbiAgICB9XG4gIH1cblxuICByZWZsaW5rKHNyYywgbGlua3MpIHtcbiAgICBsZXQgY2FwO1xuICAgIGlmICgoY2FwID0gdGhpcy5ydWxlcy5pbmxpbmUucmVmbGluay5leGVjKHNyYykpXG4gICAgICAgIHx8IChjYXAgPSB0aGlzLnJ1bGVzLmlubGluZS5ub2xpbmsuZXhlYyhzcmMpKSkge1xuICAgICAgbGV0IGxpbmsgPSAoY2FwWzJdIHx8IGNhcFsxXSkucmVwbGFjZSgvXFxzKy9nLCAnICcpO1xuICAgICAgbGluayA9IGxpbmtzW2xpbmsudG9Mb3dlckNhc2UoKV07XG4gICAgICBpZiAoIWxpbmspIHtcbiAgICAgICAgY29uc3QgdGV4dCA9IGNhcFswXS5jaGFyQXQoMCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgdHlwZTogJ3RleHQnLFxuICAgICAgICAgIHJhdzogdGV4dCxcbiAgICAgICAgICB0ZXh0XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICByZXR1cm4gb3V0cHV0TGluayhjYXAsIGxpbmssIGNhcFswXSwgdGhpcy5sZXhlcik7XG4gICAgfVxuICB9XG5cbiAgZW1TdHJvbmcoc3JjLCBtYXNrZWRTcmMsIHByZXZDaGFyID0gJycpIHtcbiAgICBsZXQgbWF0Y2ggPSB0aGlzLnJ1bGVzLmlubGluZS5lbVN0cm9uZy5sRGVsaW0uZXhlYyhzcmMpO1xuICAgIGlmICghbWF0Y2gpIHJldHVybjtcblxuICAgIC8vIF8gY2FuJ3QgYmUgYmV0d2VlbiB0d28gYWxwaGFudW1lcmljcy4gXFxwe0x9XFxwe059IGluY2x1ZGVzIG5vbi1lbmdsaXNoIGFscGhhYmV0L251bWJlcnMgYXMgd2VsbFxuICAgIGlmIChtYXRjaFszXSAmJiBwcmV2Q2hhci5tYXRjaCgvW1xccHtMfVxccHtOfV0vdSkpIHJldHVybjtcblxuICAgIGNvbnN0IG5leHRDaGFyID0gbWF0Y2hbMV0gfHwgbWF0Y2hbMl0gfHwgJyc7XG5cbiAgICBpZiAoIW5leHRDaGFyIHx8IChuZXh0Q2hhciAmJiAocHJldkNoYXIgPT09ICcnIHx8IHRoaXMucnVsZXMuaW5saW5lLnB1bmN0dWF0aW9uLmV4ZWMocHJldkNoYXIpKSkpIHtcbiAgICAgIGNvbnN0IGxMZW5ndGggPSBtYXRjaFswXS5sZW5ndGggLSAxO1xuICAgICAgbGV0IHJEZWxpbSwgckxlbmd0aCwgZGVsaW1Ub3RhbCA9IGxMZW5ndGgsIG1pZERlbGltVG90YWwgPSAwO1xuXG4gICAgICBjb25zdCBlbmRSZWcgPSBtYXRjaFswXVswXSA9PT0gJyonID8gdGhpcy5ydWxlcy5pbmxpbmUuZW1TdHJvbmcuckRlbGltQXN0IDogdGhpcy5ydWxlcy5pbmxpbmUuZW1TdHJvbmcuckRlbGltVW5kO1xuICAgICAgZW5kUmVnLmxhc3RJbmRleCA9IDA7XG5cbiAgICAgIC8vIENsaXAgbWFza2VkU3JjIHRvIHNhbWUgc2VjdGlvbiBvZiBzdHJpbmcgYXMgc3JjIChtb3ZlIHRvIGxleGVyPylcbiAgICAgIG1hc2tlZFNyYyA9IG1hc2tlZFNyYy5zbGljZSgtMSAqIHNyYy5sZW5ndGggKyBsTGVuZ3RoKTtcblxuICAgICAgd2hpbGUgKChtYXRjaCA9IGVuZFJlZy5leGVjKG1hc2tlZFNyYykpICE9IG51bGwpIHtcbiAgICAgICAgckRlbGltID0gbWF0Y2hbMV0gfHwgbWF0Y2hbMl0gfHwgbWF0Y2hbM10gfHwgbWF0Y2hbNF0gfHwgbWF0Y2hbNV0gfHwgbWF0Y2hbNl07XG5cbiAgICAgICAgaWYgKCFyRGVsaW0pIGNvbnRpbnVlOyAvLyBza2lwIHNpbmdsZSAqIGluIF9fYWJjKmFiY19fXG5cbiAgICAgICAgckxlbmd0aCA9IHJEZWxpbS5sZW5ndGg7XG5cbiAgICAgICAgaWYgKG1hdGNoWzNdIHx8IG1hdGNoWzRdKSB7IC8vIGZvdW5kIGFub3RoZXIgTGVmdCBEZWxpbVxuICAgICAgICAgIGRlbGltVG90YWwgKz0gckxlbmd0aDtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfSBlbHNlIGlmIChtYXRjaFs1XSB8fCBtYXRjaFs2XSkgeyAvLyBlaXRoZXIgTGVmdCBvciBSaWdodCBEZWxpbVxuICAgICAgICAgIGlmIChsTGVuZ3RoICUgMyAmJiAhKChsTGVuZ3RoICsgckxlbmd0aCkgJSAzKSkge1xuICAgICAgICAgICAgbWlkRGVsaW1Ub3RhbCArPSByTGVuZ3RoO1xuICAgICAgICAgICAgY29udGludWU7IC8vIENvbW1vbk1hcmsgRW1waGFzaXMgUnVsZXMgOS0xMFxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGRlbGltVG90YWwgLT0gckxlbmd0aDtcblxuICAgICAgICBpZiAoZGVsaW1Ub3RhbCA+IDApIGNvbnRpbnVlOyAvLyBIYXZlbid0IGZvdW5kIGVub3VnaCBjbG9zaW5nIGRlbGltaXRlcnNcblxuICAgICAgICAvLyBSZW1vdmUgZXh0cmEgY2hhcmFjdGVycy4gKmEqKiogLT4gKmEqXG4gICAgICAgIHJMZW5ndGggPSBNYXRoLm1pbihyTGVuZ3RoLCByTGVuZ3RoICsgZGVsaW1Ub3RhbCArIG1pZERlbGltVG90YWwpO1xuXG4gICAgICAgIGNvbnN0IHJhdyA9IHNyYy5zbGljZSgwLCBsTGVuZ3RoICsgbWF0Y2guaW5kZXggKyAobWF0Y2hbMF0ubGVuZ3RoIC0gckRlbGltLmxlbmd0aCkgKyByTGVuZ3RoKTtcblxuICAgICAgICAvLyBDcmVhdGUgYGVtYCBpZiBzbWFsbGVzdCBkZWxpbWl0ZXIgaGFzIG9kZCBjaGFyIGNvdW50LiAqYSoqKlxuICAgICAgICBpZiAoTWF0aC5taW4obExlbmd0aCwgckxlbmd0aCkgJSAyKSB7XG4gICAgICAgICAgY29uc3QgdGV4dCA9IHJhdy5zbGljZSgxLCAtMSk7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHR5cGU6ICdlbScsXG4gICAgICAgICAgICByYXcsXG4gICAgICAgICAgICB0ZXh0LFxuICAgICAgICAgICAgdG9rZW5zOiB0aGlzLmxleGVyLmlubGluZVRva2Vucyh0ZXh0KVxuICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDcmVhdGUgJ3N0cm9uZycgaWYgc21hbGxlc3QgZGVsaW1pdGVyIGhhcyBldmVuIGNoYXIgY291bnQuICoqYSoqKlxuICAgICAgICBjb25zdCB0ZXh0ID0gcmF3LnNsaWNlKDIsIC0yKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB0eXBlOiAnc3Ryb25nJyxcbiAgICAgICAgICByYXcsXG4gICAgICAgICAgdGV4dCxcbiAgICAgICAgICB0b2tlbnM6IHRoaXMubGV4ZXIuaW5saW5lVG9rZW5zKHRleHQpXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgY29kZXNwYW4oc3JjKSB7XG4gICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5pbmxpbmUuY29kZS5leGVjKHNyYyk7XG4gICAgaWYgKGNhcCkge1xuICAgICAgbGV0IHRleHQgPSBjYXBbMl0ucmVwbGFjZSgvXFxuL2csICcgJyk7XG4gICAgICBjb25zdCBoYXNOb25TcGFjZUNoYXJzID0gL1teIF0vLnRlc3QodGV4dCk7XG4gICAgICBjb25zdCBoYXNTcGFjZUNoYXJzT25Cb3RoRW5kcyA9IC9eIC8udGVzdCh0ZXh0KSAmJiAvICQvLnRlc3QodGV4dCk7XG4gICAgICBpZiAoaGFzTm9uU3BhY2VDaGFycyAmJiBoYXNTcGFjZUNoYXJzT25Cb3RoRW5kcykge1xuICAgICAgICB0ZXh0ID0gdGV4dC5zdWJzdHJpbmcoMSwgdGV4dC5sZW5ndGggLSAxKTtcbiAgICAgIH1cbiAgICAgIHRleHQgPSBlc2NhcGUodGV4dCwgdHJ1ZSk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAnY29kZXNwYW4nLFxuICAgICAgICByYXc6IGNhcFswXSxcbiAgICAgICAgdGV4dFxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICBicihzcmMpIHtcbiAgICBjb25zdCBjYXAgPSB0aGlzLnJ1bGVzLmlubGluZS5ici5leGVjKHNyYyk7XG4gICAgaWYgKGNhcCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ2JyJyxcbiAgICAgICAgcmF3OiBjYXBbMF1cbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgZGVsKHNyYykge1xuICAgIGNvbnN0IGNhcCA9IHRoaXMucnVsZXMuaW5saW5lLmRlbC5leGVjKHNyYyk7XG4gICAgaWYgKGNhcCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ2RlbCcsXG4gICAgICAgIHJhdzogY2FwWzBdLFxuICAgICAgICB0ZXh0OiBjYXBbMl0sXG4gICAgICAgIHRva2VuczogdGhpcy5sZXhlci5pbmxpbmVUb2tlbnMoY2FwWzJdKVxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICBhdXRvbGluayhzcmMsIG1hbmdsZSkge1xuICAgIGNvbnN0IGNhcCA9IHRoaXMucnVsZXMuaW5saW5lLmF1dG9saW5rLmV4ZWMoc3JjKTtcbiAgICBpZiAoY2FwKSB7XG4gICAgICBsZXQgdGV4dCwgaHJlZjtcbiAgICAgIGlmIChjYXBbMl0gPT09ICdAJykge1xuICAgICAgICB0ZXh0ID0gZXNjYXBlKHRoaXMub3B0aW9ucy5tYW5nbGUgPyBtYW5nbGUoY2FwWzFdKSA6IGNhcFsxXSk7XG4gICAgICAgIGhyZWYgPSAnbWFpbHRvOicgKyB0ZXh0O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGV4dCA9IGVzY2FwZShjYXBbMV0pO1xuICAgICAgICBocmVmID0gdGV4dDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ2xpbmsnLFxuICAgICAgICByYXc6IGNhcFswXSxcbiAgICAgICAgdGV4dCxcbiAgICAgICAgaHJlZixcbiAgICAgICAgdG9rZW5zOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgdHlwZTogJ3RleHQnLFxuICAgICAgICAgICAgcmF3OiB0ZXh0LFxuICAgICAgICAgICAgdGV4dFxuICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICB1cmwoc3JjLCBtYW5nbGUpIHtcbiAgICBsZXQgY2FwO1xuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmlubGluZS51cmwuZXhlYyhzcmMpKSB7XG4gICAgICBsZXQgdGV4dCwgaHJlZjtcbiAgICAgIGlmIChjYXBbMl0gPT09ICdAJykge1xuICAgICAgICB0ZXh0ID0gZXNjYXBlKHRoaXMub3B0aW9ucy5tYW5nbGUgPyBtYW5nbGUoY2FwWzBdKSA6IGNhcFswXSk7XG4gICAgICAgIGhyZWYgPSAnbWFpbHRvOicgKyB0ZXh0O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gZG8gZXh0ZW5kZWQgYXV0b2xpbmsgcGF0aCB2YWxpZGF0aW9uXG4gICAgICAgIGxldCBwcmV2Q2FwWmVybztcbiAgICAgICAgZG8ge1xuICAgICAgICAgIHByZXZDYXBaZXJvID0gY2FwWzBdO1xuICAgICAgICAgIGNhcFswXSA9IHRoaXMucnVsZXMuaW5saW5lLl9iYWNrcGVkYWwuZXhlYyhjYXBbMF0pWzBdO1xuICAgICAgICB9IHdoaWxlIChwcmV2Q2FwWmVybyAhPT0gY2FwWzBdKTtcbiAgICAgICAgdGV4dCA9IGVzY2FwZShjYXBbMF0pO1xuICAgICAgICBpZiAoY2FwWzFdID09PSAnd3d3LicpIHtcbiAgICAgICAgICBocmVmID0gJ2h0dHA6Ly8nICsgY2FwWzBdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGhyZWYgPSBjYXBbMF07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdsaW5rJyxcbiAgICAgICAgcmF3OiBjYXBbMF0sXG4gICAgICAgIHRleHQsXG4gICAgICAgIGhyZWYsXG4gICAgICAgIHRva2VuczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgICAgICAgIHJhdzogdGV4dCxcbiAgICAgICAgICAgIHRleHRcbiAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgaW5saW5lVGV4dChzcmMsIHNtYXJ0eXBhbnRzKSB7XG4gICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5pbmxpbmUudGV4dC5leGVjKHNyYyk7XG4gICAgaWYgKGNhcCkge1xuICAgICAgbGV0IHRleHQ7XG4gICAgICBpZiAodGhpcy5sZXhlci5zdGF0ZS5pblJhd0Jsb2NrKSB7XG4gICAgICAgIHRleHQgPSB0aGlzLm9wdGlvbnMuc2FuaXRpemUgPyAodGhpcy5vcHRpb25zLnNhbml0aXplciA/IHRoaXMub3B0aW9ucy5zYW5pdGl6ZXIoY2FwWzBdKSA6IGVzY2FwZShjYXBbMF0pKSA6IGNhcFswXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRleHQgPSBlc2NhcGUodGhpcy5vcHRpb25zLnNtYXJ0eXBhbnRzID8gc21hcnR5cGFudHMoY2FwWzBdKSA6IGNhcFswXSk7XG4gICAgICB9XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAndGV4dCcsXG4gICAgICAgIHJhdzogY2FwWzBdLFxuICAgICAgICB0ZXh0XG4gICAgICB9O1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEJsb2NrLUxldmVsIEdyYW1tYXJcbiAqL1xuY29uc3QgYmxvY2sgPSB7XG4gIG5ld2xpbmU6IC9eKD86ICooPzpcXG58JCkpKy8sXG4gIGNvZGU6IC9eKCB7NH1bXlxcbl0rKD86XFxuKD86ICooPzpcXG58JCkpKik/KSsvLFxuICBmZW5jZXM6IC9eIHswLDN9KGB7Myx9KD89W15gXFxuXSpcXG4pfH57Myx9KShbXlxcbl0qKVxcbig/OnwoW1xcc1xcU10qPylcXG4pKD86IHswLDN9XFwxW35gXSogKig/PVxcbnwkKXwkKS8sXG4gIGhyOiAvXiB7MCwzfSgoPzotW1xcdCBdKil7Myx9fCg/Ol9bIFxcdF0qKXszLH18KD86XFwqWyBcXHRdKil7Myx9KSg/Olxcbit8JCkvLFxuICBoZWFkaW5nOiAvXiB7MCwzfSgjezEsNn0pKD89XFxzfCQpKC4qKSg/Olxcbit8JCkvLFxuICBibG9ja3F1b3RlOiAvXiggezAsM30+ID8ocGFyYWdyYXBofFteXFxuXSopKD86XFxufCQpKSsvLFxuICBsaXN0OiAvXiggezAsM31idWxsKShbIFxcdF1bXlxcbl0rPyk/KD86XFxufCQpLyxcbiAgaHRtbDogJ14gezAsM30oPzonIC8vIG9wdGlvbmFsIGluZGVudGF0aW9uXG4gICAgKyAnPChzY3JpcHR8cHJlfHN0eWxlfHRleHRhcmVhKVtcXFxccz5dW1xcXFxzXFxcXFNdKj8oPzo8L1xcXFwxPlteXFxcXG5dKlxcXFxuK3wkKScgLy8gKDEpXG4gICAgKyAnfGNvbW1lbnRbXlxcXFxuXSooXFxcXG4rfCQpJyAvLyAoMilcbiAgICArICd8PFxcXFw/W1xcXFxzXFxcXFNdKj8oPzpcXFxcPz5cXFxcbip8JCknIC8vICgzKVxuICAgICsgJ3w8IVtBLVpdW1xcXFxzXFxcXFNdKj8oPzo+XFxcXG4qfCQpJyAvLyAoNClcbiAgICArICd8PCFcXFxcW0NEQVRBXFxcXFtbXFxcXHNcXFxcU10qPyg/OlxcXFxdXFxcXF0+XFxcXG4qfCQpJyAvLyAoNSlcbiAgICArICd8PC8/KHRhZykoPzogK3xcXFxcbnwvPz4pW1xcXFxzXFxcXFNdKj8oPzooPzpcXFxcbiAqKStcXFxcbnwkKScgLy8gKDYpXG4gICAgKyAnfDwoPyFzY3JpcHR8cHJlfHN0eWxlfHRleHRhcmVhKShbYS16XVtcXFxcdy1dKikoPzphdHRyaWJ1dGUpKj8gKi8/Pig/PVsgXFxcXHRdKig/OlxcXFxufCQpKVtcXFxcc1xcXFxTXSo/KD86KD86XFxcXG4gKikrXFxcXG58JCknIC8vICg3KSBvcGVuIHRhZ1xuICAgICsgJ3w8Lyg/IXNjcmlwdHxwcmV8c3R5bGV8dGV4dGFyZWEpW2Etel1bXFxcXHctXSpcXFxccyo+KD89WyBcXFxcdF0qKD86XFxcXG58JCkpW1xcXFxzXFxcXFNdKj8oPzooPzpcXFxcbiAqKStcXFxcbnwkKScgLy8gKDcpIGNsb3NpbmcgdGFnXG4gICAgKyAnKScsXG4gIGRlZjogL14gezAsM31cXFsobGFiZWwpXFxdOiAqKD86XFxuICopPyhbXjxcXHNdW15cXHNdKnw8Lio/PikoPzooPzogKyg/OlxcbiAqKT98ICpcXG4gKikodGl0bGUpKT8gKig/Olxcbit8JCkvLFxuICB0YWJsZTogbm9vcFRlc3QsXG4gIGxoZWFkaW5nOiAvXigoPzoufFxcbig/IVxcbikpKz8pXFxuIHswLDN9KD0rfC0rKSAqKD86XFxuK3wkKS8sXG4gIC8vIHJlZ2V4IHRlbXBsYXRlLCBwbGFjZWhvbGRlcnMgd2lsbCBiZSByZXBsYWNlZCBhY2NvcmRpbmcgdG8gZGlmZmVyZW50IHBhcmFncmFwaFxuICAvLyBpbnRlcnJ1cHRpb24gcnVsZXMgb2YgY29tbW9ubWFyayBhbmQgdGhlIG9yaWdpbmFsIG1hcmtkb3duIHNwZWM6XG4gIF9wYXJhZ3JhcGg6IC9eKFteXFxuXSsoPzpcXG4oPyFocnxoZWFkaW5nfGxoZWFkaW5nfGJsb2NrcXVvdGV8ZmVuY2VzfGxpc3R8aHRtbHx0YWJsZXwgK1xcbilbXlxcbl0rKSopLyxcbiAgdGV4dDogL15bXlxcbl0rL1xufTtcblxuYmxvY2suX2xhYmVsID0gLyg/IVxccypcXF0pKD86XFxcXC58W15cXFtcXF1cXFxcXSkrLztcbmJsb2NrLl90aXRsZSA9IC8oPzpcIig/OlxcXFxcIj98W15cIlxcXFxdKSpcInwnW14nXFxuXSooPzpcXG5bXidcXG5dKykqXFxuPyd8XFwoW14oKV0qXFwpKS87XG5ibG9jay5kZWYgPSBlZGl0KGJsb2NrLmRlZilcbiAgLnJlcGxhY2UoJ2xhYmVsJywgYmxvY2suX2xhYmVsKVxuICAucmVwbGFjZSgndGl0bGUnLCBibG9jay5fdGl0bGUpXG4gIC5nZXRSZWdleCgpO1xuXG5ibG9jay5idWxsZXQgPSAvKD86WyorLV18XFxkezEsOX1bLildKS87XG5ibG9jay5saXN0SXRlbVN0YXJ0ID0gZWRpdCgvXiggKikoYnVsbCkgKi8pXG4gIC5yZXBsYWNlKCdidWxsJywgYmxvY2suYnVsbGV0KVxuICAuZ2V0UmVnZXgoKTtcblxuYmxvY2subGlzdCA9IGVkaXQoYmxvY2subGlzdClcbiAgLnJlcGxhY2UoL2J1bGwvZywgYmxvY2suYnVsbGV0KVxuICAucmVwbGFjZSgnaHInLCAnXFxcXG4rKD89XFxcXDE/KD86KD86LSAqKXszLH18KD86XyAqKXszLH18KD86XFxcXCogKil7Myx9KSg/OlxcXFxuK3wkKSknKVxuICAucmVwbGFjZSgnZGVmJywgJ1xcXFxuKyg/PScgKyBibG9jay5kZWYuc291cmNlICsgJyknKVxuICAuZ2V0UmVnZXgoKTtcblxuYmxvY2suX3RhZyA9ICdhZGRyZXNzfGFydGljbGV8YXNpZGV8YmFzZXxiYXNlZm9udHxibG9ja3F1b3RlfGJvZHl8Y2FwdGlvbidcbiAgKyAnfGNlbnRlcnxjb2x8Y29sZ3JvdXB8ZGR8ZGV0YWlsc3xkaWFsb2d8ZGlyfGRpdnxkbHxkdHxmaWVsZHNldHxmaWdjYXB0aW9uJ1xuICArICd8ZmlndXJlfGZvb3Rlcnxmb3JtfGZyYW1lfGZyYW1lc2V0fGhbMS02XXxoZWFkfGhlYWRlcnxocnxodG1sfGlmcmFtZSdcbiAgKyAnfGxlZ2VuZHxsaXxsaW5rfG1haW58bWVudXxtZW51aXRlbXxtZXRhfG5hdnxub2ZyYW1lc3xvbHxvcHRncm91cHxvcHRpb24nXG4gICsgJ3xwfHBhcmFtfHNlY3Rpb258c291cmNlfHN1bW1hcnl8dGFibGV8dGJvZHl8dGR8dGZvb3R8dGh8dGhlYWR8dGl0bGV8dHInXG4gICsgJ3x0cmFja3x1bCc7XG5ibG9jay5fY29tbWVudCA9IC88IS0tKD8hLT8+KVtcXHNcXFNdKj8oPzotLT58JCkvO1xuYmxvY2suaHRtbCA9IGVkaXQoYmxvY2suaHRtbCwgJ2knKVxuICAucmVwbGFjZSgnY29tbWVudCcsIGJsb2NrLl9jb21tZW50KVxuICAucmVwbGFjZSgndGFnJywgYmxvY2suX3RhZylcbiAgLnJlcGxhY2UoJ2F0dHJpYnV0ZScsIC8gK1thLXpBLVo6X11bXFx3LjotXSooPzogKj0gKlwiW15cIlxcbl0qXCJ8ICo9IConW14nXFxuXSonfCAqPSAqW15cXHNcIic9PD5gXSspPy8pXG4gIC5nZXRSZWdleCgpO1xuXG5ibG9jay5wYXJhZ3JhcGggPSBlZGl0KGJsb2NrLl9wYXJhZ3JhcGgpXG4gIC5yZXBsYWNlKCdocicsIGJsb2NrLmhyKVxuICAucmVwbGFjZSgnaGVhZGluZycsICcgezAsM30jezEsNn0gJylcbiAgLnJlcGxhY2UoJ3xsaGVhZGluZycsICcnKSAvLyBzZXRleCBoZWFkaW5ncyBkb24ndCBpbnRlcnJ1cHQgY29tbW9ubWFyayBwYXJhZ3JhcGhzXG4gIC5yZXBsYWNlKCd8dGFibGUnLCAnJylcbiAgLnJlcGxhY2UoJ2Jsb2NrcXVvdGUnLCAnIHswLDN9PicpXG4gIC5yZXBsYWNlKCdmZW5jZXMnLCAnIHswLDN9KD86YHszLH0oPz1bXmBcXFxcbl0qXFxcXG4pfH57Myx9KVteXFxcXG5dKlxcXFxuJylcbiAgLnJlcGxhY2UoJ2xpc3QnLCAnIHswLDN9KD86WyorLV18MVsuKV0pICcpIC8vIG9ubHkgbGlzdHMgc3RhcnRpbmcgZnJvbSAxIGNhbiBpbnRlcnJ1cHRcbiAgLnJlcGxhY2UoJ2h0bWwnLCAnPC8/KD86dGFnKSg/OiArfFxcXFxufC8/Pil8PCg/OnNjcmlwdHxwcmV8c3R5bGV8dGV4dGFyZWF8IS0tKScpXG4gIC5yZXBsYWNlKCd0YWcnLCBibG9jay5fdGFnKSAvLyBwYXJzIGNhbiBiZSBpbnRlcnJ1cHRlZCBieSB0eXBlICg2KSBodG1sIGJsb2Nrc1xuICAuZ2V0UmVnZXgoKTtcblxuYmxvY2suYmxvY2txdW90ZSA9IGVkaXQoYmxvY2suYmxvY2txdW90ZSlcbiAgLnJlcGxhY2UoJ3BhcmFncmFwaCcsIGJsb2NrLnBhcmFncmFwaClcbiAgLmdldFJlZ2V4KCk7XG5cbi8qKlxuICogTm9ybWFsIEJsb2NrIEdyYW1tYXJcbiAqL1xuXG5ibG9jay5ub3JtYWwgPSBtZXJnZSh7fSwgYmxvY2spO1xuXG4vKipcbiAqIEdGTSBCbG9jayBHcmFtbWFyXG4gKi9cblxuYmxvY2suZ2ZtID0gbWVyZ2Uoe30sIGJsb2NrLm5vcm1hbCwge1xuICB0YWJsZTogJ14gKihbXlxcXFxuIF0uKlxcXFx8LiopXFxcXG4nIC8vIEhlYWRlclxuICAgICsgJyB7MCwzfSg/OlxcXFx8ICopPyg6Py0rOj8gKig/OlxcXFx8ICo6Py0rOj8gKikqKSg/OlxcXFx8ICopPycgLy8gQWxpZ25cbiAgICArICcoPzpcXFxcbigoPzooPyEgKlxcXFxufGhyfGhlYWRpbmd8YmxvY2txdW90ZXxjb2RlfGZlbmNlc3xsaXN0fGh0bWwpLiooPzpcXFxcbnwkKSkqKVxcXFxuKnwkKScgLy8gQ2VsbHNcbn0pO1xuXG5ibG9jay5nZm0udGFibGUgPSBlZGl0KGJsb2NrLmdmbS50YWJsZSlcbiAgLnJlcGxhY2UoJ2hyJywgYmxvY2suaHIpXG4gIC5yZXBsYWNlKCdoZWFkaW5nJywgJyB7MCwzfSN7MSw2fSAnKVxuICAucmVwbGFjZSgnYmxvY2txdW90ZScsICcgezAsM30+JylcbiAgLnJlcGxhY2UoJ2NvZGUnLCAnIHs0fVteXFxcXG5dJylcbiAgLnJlcGxhY2UoJ2ZlbmNlcycsICcgezAsM30oPzpgezMsfSg/PVteYFxcXFxuXSpcXFxcbil8fnszLH0pW15cXFxcbl0qXFxcXG4nKVxuICAucmVwbGFjZSgnbGlzdCcsICcgezAsM30oPzpbKistXXwxWy4pXSkgJykgLy8gb25seSBsaXN0cyBzdGFydGluZyBmcm9tIDEgY2FuIGludGVycnVwdFxuICAucmVwbGFjZSgnaHRtbCcsICc8Lz8oPzp0YWcpKD86ICt8XFxcXG58Lz8+KXw8KD86c2NyaXB0fHByZXxzdHlsZXx0ZXh0YXJlYXwhLS0pJylcbiAgLnJlcGxhY2UoJ3RhZycsIGJsb2NrLl90YWcpIC8vIHRhYmxlcyBjYW4gYmUgaW50ZXJydXB0ZWQgYnkgdHlwZSAoNikgaHRtbCBibG9ja3NcbiAgLmdldFJlZ2V4KCk7XG5cbmJsb2NrLmdmbS5wYXJhZ3JhcGggPSBlZGl0KGJsb2NrLl9wYXJhZ3JhcGgpXG4gIC5yZXBsYWNlKCdocicsIGJsb2NrLmhyKVxuICAucmVwbGFjZSgnaGVhZGluZycsICcgezAsM30jezEsNn0gJylcbiAgLnJlcGxhY2UoJ3xsaGVhZGluZycsICcnKSAvLyBzZXRleCBoZWFkaW5ncyBkb24ndCBpbnRlcnJ1cHQgY29tbW9ubWFyayBwYXJhZ3JhcGhzXG4gIC5yZXBsYWNlKCd0YWJsZScsIGJsb2NrLmdmbS50YWJsZSkgLy8gaW50ZXJydXB0IHBhcmFncmFwaHMgd2l0aCB0YWJsZVxuICAucmVwbGFjZSgnYmxvY2txdW90ZScsICcgezAsM30+JylcbiAgLnJlcGxhY2UoJ2ZlbmNlcycsICcgezAsM30oPzpgezMsfSg/PVteYFxcXFxuXSpcXFxcbil8fnszLH0pW15cXFxcbl0qXFxcXG4nKVxuICAucmVwbGFjZSgnbGlzdCcsICcgezAsM30oPzpbKistXXwxWy4pXSkgJykgLy8gb25seSBsaXN0cyBzdGFydGluZyBmcm9tIDEgY2FuIGludGVycnVwdFxuICAucmVwbGFjZSgnaHRtbCcsICc8Lz8oPzp0YWcpKD86ICt8XFxcXG58Lz8+KXw8KD86c2NyaXB0fHByZXxzdHlsZXx0ZXh0YXJlYXwhLS0pJylcbiAgLnJlcGxhY2UoJ3RhZycsIGJsb2NrLl90YWcpIC8vIHBhcnMgY2FuIGJlIGludGVycnVwdGVkIGJ5IHR5cGUgKDYpIGh0bWwgYmxvY2tzXG4gIC5nZXRSZWdleCgpO1xuLyoqXG4gKiBQZWRhbnRpYyBncmFtbWFyIChvcmlnaW5hbCBKb2huIEdydWJlcidzIGxvb3NlIG1hcmtkb3duIHNwZWNpZmljYXRpb24pXG4gKi9cblxuYmxvY2sucGVkYW50aWMgPSBtZXJnZSh7fSwgYmxvY2subm9ybWFsLCB7XG4gIGh0bWw6IGVkaXQoXG4gICAgJ14gKig/OmNvbW1lbnQgKig/OlxcXFxufFxcXFxzKiQpJ1xuICAgICsgJ3w8KHRhZylbXFxcXHNcXFxcU10rPzwvXFxcXDE+ICooPzpcXFxcbnsyLH18XFxcXHMqJCknIC8vIGNsb3NlZCB0YWdcbiAgICArICd8PHRhZyg/OlwiW15cIl0qXCJ8XFwnW15cXCddKlxcJ3xcXFxcc1teXFwnXCIvPlxcXFxzXSopKj8vPz4gKig/OlxcXFxuezIsfXxcXFxccyokKSknKVxuICAgIC5yZXBsYWNlKCdjb21tZW50JywgYmxvY2suX2NvbW1lbnQpXG4gICAgLnJlcGxhY2UoL3RhZy9nLCAnKD8hKD86J1xuICAgICAgKyAnYXxlbXxzdHJvbmd8c21hbGx8c3xjaXRlfHF8ZGZufGFiYnJ8ZGF0YXx0aW1lfGNvZGV8dmFyfHNhbXB8a2JkfHN1YidcbiAgICAgICsgJ3xzdXB8aXxifHV8bWFya3xydWJ5fHJ0fHJwfGJkaXxiZG98c3Bhbnxicnx3YnJ8aW5zfGRlbHxpbWcpJ1xuICAgICAgKyAnXFxcXGIpXFxcXHcrKD8hOnxbXlxcXFx3XFxcXHNAXSpAKVxcXFxiJylcbiAgICAuZ2V0UmVnZXgoKSxcbiAgZGVmOiAvXiAqXFxbKFteXFxdXSspXFxdOiAqPD8oW15cXHM+XSspPj8oPzogKyhbXCIoXVteXFxuXStbXCIpXSkpPyAqKD86XFxuK3wkKS8sXG4gIGhlYWRpbmc6IC9eKCN7MSw2fSkoLiopKD86XFxuK3wkKS8sXG4gIGZlbmNlczogbm9vcFRlc3QsIC8vIGZlbmNlcyBub3Qgc3VwcG9ydGVkXG4gIGxoZWFkaW5nOiAvXiguKz8pXFxuIHswLDN9KD0rfC0rKSAqKD86XFxuK3wkKS8sXG4gIHBhcmFncmFwaDogZWRpdChibG9jay5ub3JtYWwuX3BhcmFncmFwaClcbiAgICAucmVwbGFjZSgnaHInLCBibG9jay5ocilcbiAgICAucmVwbGFjZSgnaGVhZGluZycsICcgKiN7MSw2fSAqW15cXG5dJylcbiAgICAucmVwbGFjZSgnbGhlYWRpbmcnLCBibG9jay5saGVhZGluZylcbiAgICAucmVwbGFjZSgnYmxvY2txdW90ZScsICcgezAsM30+JylcbiAgICAucmVwbGFjZSgnfGZlbmNlcycsICcnKVxuICAgIC5yZXBsYWNlKCd8bGlzdCcsICcnKVxuICAgIC5yZXBsYWNlKCd8aHRtbCcsICcnKVxuICAgIC5nZXRSZWdleCgpXG59KTtcblxuLyoqXG4gKiBJbmxpbmUtTGV2ZWwgR3JhbW1hclxuICovXG5jb25zdCBpbmxpbmUgPSB7XG4gIGVzY2FwZTogL15cXFxcKFshXCIjJCUmJygpKissXFwtLi86Ozw9Pj9AXFxbXFxdXFxcXF5fYHt8fX5dKS8sXG4gIGF1dG9saW5rOiAvXjwoc2NoZW1lOlteXFxzXFx4MDAtXFx4MWY8Pl0qfGVtYWlsKT4vLFxuICB1cmw6IG5vb3BUZXN0LFxuICB0YWc6ICdeY29tbWVudCdcbiAgICArICd8XjwvW2EtekEtWl1bXFxcXHc6LV0qXFxcXHMqPicgLy8gc2VsZi1jbG9zaW5nIHRhZ1xuICAgICsgJ3xePFthLXpBLVpdW1xcXFx3LV0qKD86YXR0cmlidXRlKSo/XFxcXHMqLz8+JyAvLyBvcGVuIHRhZ1xuICAgICsgJ3xePFxcXFw/W1xcXFxzXFxcXFNdKj9cXFxcPz4nIC8vIHByb2Nlc3NpbmcgaW5zdHJ1Y3Rpb24sIGUuZy4gPD9waHAgPz5cbiAgICArICd8XjwhW2EtekEtWl0rXFxcXHNbXFxcXHNcXFxcU10qPz4nIC8vIGRlY2xhcmF0aW9uLCBlLmcuIDwhRE9DVFlQRSBodG1sPlxuICAgICsgJ3xePCFcXFxcW0NEQVRBXFxcXFtbXFxcXHNcXFxcU10qP1xcXFxdXFxcXF0+JywgLy8gQ0RBVEEgc2VjdGlvblxuICBsaW5rOiAvXiE/XFxbKGxhYmVsKVxcXVxcKFxccyooaHJlZikoPzpcXHMrKHRpdGxlKSk/XFxzKlxcKS8sXG4gIHJlZmxpbms6IC9eIT9cXFsobGFiZWwpXFxdXFxbKHJlZilcXF0vLFxuICBub2xpbms6IC9eIT9cXFsocmVmKVxcXSg/OlxcW1xcXSk/LyxcbiAgcmVmbGlua1NlYXJjaDogJ3JlZmxpbmt8bm9saW5rKD8hXFxcXCgpJyxcbiAgZW1TdHJvbmc6IHtcbiAgICBsRGVsaW06IC9eKD86XFwqKyg/OihbcHVuY3RfXSl8W15cXHMqXSkpfF5fKyg/OihbcHVuY3QqXSl8KFteXFxzX10pKS8sXG4gICAgLy8gICAgICAgICgxKSBhbmQgKDIpIGNhbiBvbmx5IGJlIGEgUmlnaHQgRGVsaW1pdGVyLiAoMykgYW5kICg0KSBjYW4gb25seSBiZSBMZWZ0LiAgKDUpIGFuZCAoNikgY2FuIGJlIGVpdGhlciBMZWZ0IG9yIFJpZ2h0LlxuICAgIC8vICAgICAgICAgICgpIFNraXAgb3JwaGFuIGluc2lkZSBzdHJvbmcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICgpIENvbnN1bWUgdG8gZGVsaW0gICAgICgxKSAjKioqICAgICAgICAgICAgICAgICgyKSBhKioqIywgYSoqKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKDMpICMqKiphLCAqKiphICAgICAgICAgICAgICAgICAoNCkgKioqIyAgICAgICAgICAgICAgKDUpICMqKiojICAgICAgICAgICAgICAgICAoNikgYSoqKmFcbiAgICByRGVsaW1Bc3Q6IC9eKD86W15fKlxcXFxdfFxcXFwuKSo/XFxfXFxfKD86W15fKlxcXFxdfFxcXFwuKSo/XFwqKD86W15fKlxcXFxdfFxcXFwuKSo/KD89XFxfXFxfKXwoPzpbXipcXFxcXXxcXFxcLikrKD89W14qXSl8W3B1bmN0X10oXFwqKykoPz1bXFxzXXwkKXwoPzpbXnB1bmN0Kl9cXHNcXFxcXXxcXFxcLikoXFwqKykoPz1bcHVuY3RfXFxzXXwkKXxbcHVuY3RfXFxzXShcXCorKSg/PVtecHVuY3QqX1xcc10pfFtcXHNdKFxcKispKD89W3B1bmN0X10pfFtwdW5jdF9dKFxcKispKD89W3B1bmN0X10pfCg/OltecHVuY3QqX1xcc1xcXFxdfFxcXFwuKShcXCorKSg/PVtecHVuY3QqX1xcc10pLyxcbiAgICByRGVsaW1VbmQ6IC9eKD86W15fKlxcXFxdfFxcXFwuKSo/XFwqXFwqKD86W15fKlxcXFxdfFxcXFwuKSo/XFxfKD86W15fKlxcXFxdfFxcXFwuKSo/KD89XFwqXFwqKXwoPzpbXl9cXFxcXXxcXFxcLikrKD89W15fXSl8W3B1bmN0Kl0oXFxfKykoPz1bXFxzXXwkKXwoPzpbXnB1bmN0Kl9cXHNcXFxcXXxcXFxcLikoXFxfKykoPz1bcHVuY3QqXFxzXXwkKXxbcHVuY3QqXFxzXShcXF8rKSg/PVtecHVuY3QqX1xcc10pfFtcXHNdKFxcXyspKD89W3B1bmN0Kl0pfFtwdW5jdCpdKFxcXyspKD89W3B1bmN0Kl0pLyAvLyBeLSBOb3QgYWxsb3dlZCBmb3IgX1xuICB9LFxuICBjb2RlOiAvXihgKykoW15gXXxbXmBdW1xcc1xcU10qP1teYF0pXFwxKD8hYCkvLFxuICBicjogL14oIHsyLH18XFxcXClcXG4oPyFcXHMqJCkvLFxuICBkZWw6IG5vb3BUZXN0LFxuICB0ZXh0OiAvXihgK3xbXmBdKSg/Oig/PSB7Mix9XFxuKXxbXFxzXFxTXSo/KD86KD89W1xcXFw8IVxcW2AqX118XFxiX3wkKXxbXiBdKD89IHsyLH1cXG4pKSkvLFxuICBwdW5jdHVhdGlvbjogL14oW1xcc3B1bmN0dWF0aW9uXSkvXG59O1xuXG4vLyBsaXN0IG9mIHB1bmN0dWF0aW9uIG1hcmtzIGZyb20gQ29tbW9uTWFyayBzcGVjXG4vLyB3aXRob3V0ICogYW5kIF8gdG8gaGFuZGxlIHRoZSBkaWZmZXJlbnQgZW1waGFzaXMgbWFya2VycyAqIGFuZCBfXG5pbmxpbmUuX3B1bmN0dWF0aW9uID0gJyFcIiMkJSZcXCcoKStcXFxcLS4sLzo7PD0+P0BcXFxcW1xcXFxdYF57fH1+JztcbmlubGluZS5wdW5jdHVhdGlvbiA9IGVkaXQoaW5saW5lLnB1bmN0dWF0aW9uKS5yZXBsYWNlKC9wdW5jdHVhdGlvbi9nLCBpbmxpbmUuX3B1bmN0dWF0aW9uKS5nZXRSZWdleCgpO1xuXG4vLyBzZXF1ZW5jZXMgZW0gc2hvdWxkIHNraXAgb3ZlciBbdGl0bGVdKGxpbmspLCBgY29kZWAsIDxodG1sPlxuaW5saW5lLmJsb2NrU2tpcCA9IC9cXFtbXlxcXV0qP1xcXVxcKFteXFwpXSo/XFwpfGBbXmBdKj9gfDxbXj5dKj8+L2c7XG4vLyBsb29rYmVoaW5kIGlzIG5vdCBhdmFpbGFibGUgb24gU2FmYXJpIGFzIG9mIHZlcnNpb24gMTZcbi8vIGlubGluZS5lc2NhcGVkRW1TdCA9IC8oPzw9KD86XnxbXlxcXFwpKD86XFxcXFteXSkqKVxcXFxbKl9dL2c7XG5pbmxpbmUuZXNjYXBlZEVtU3QgPSAvKD86XnxbXlxcXFxdKSg/OlxcXFxcXFxcKSpcXFxcWypfXS9nO1xuXG5pbmxpbmUuX2NvbW1lbnQgPSBlZGl0KGJsb2NrLl9jb21tZW50KS5yZXBsYWNlKCcoPzotLT58JCknLCAnLS0+JykuZ2V0UmVnZXgoKTtcblxuaW5saW5lLmVtU3Ryb25nLmxEZWxpbSA9IGVkaXQoaW5saW5lLmVtU3Ryb25nLmxEZWxpbSlcbiAgLnJlcGxhY2UoL3B1bmN0L2csIGlubGluZS5fcHVuY3R1YXRpb24pXG4gIC5nZXRSZWdleCgpO1xuXG5pbmxpbmUuZW1TdHJvbmcuckRlbGltQXN0ID0gZWRpdChpbmxpbmUuZW1TdHJvbmcuckRlbGltQXN0LCAnZycpXG4gIC5yZXBsYWNlKC9wdW5jdC9nLCBpbmxpbmUuX3B1bmN0dWF0aW9uKVxuICAuZ2V0UmVnZXgoKTtcblxuaW5saW5lLmVtU3Ryb25nLnJEZWxpbVVuZCA9IGVkaXQoaW5saW5lLmVtU3Ryb25nLnJEZWxpbVVuZCwgJ2cnKVxuICAucmVwbGFjZSgvcHVuY3QvZywgaW5saW5lLl9wdW5jdHVhdGlvbilcbiAgLmdldFJlZ2V4KCk7XG5cbmlubGluZS5fZXNjYXBlcyA9IC9cXFxcKFshXCIjJCUmJygpKissXFwtLi86Ozw9Pj9AXFxbXFxdXFxcXF5fYHt8fX5dKS9nO1xuXG5pbmxpbmUuX3NjaGVtZSA9IC9bYS16QS1aXVthLXpBLVowLTkrLi1dezEsMzF9LztcbmlubGluZS5fZW1haWwgPSAvW2EtekEtWjAtOS4hIyQlJicqKy89P15fYHt8fX4tXSsoQClbYS16QS1aMC05XSg/OlthLXpBLVowLTktXXswLDYxfVthLXpBLVowLTldKT8oPzpcXC5bYS16QS1aMC05XSg/OlthLXpBLVowLTktXXswLDYxfVthLXpBLVowLTldKT8pKyg/IVstX10pLztcbmlubGluZS5hdXRvbGluayA9IGVkaXQoaW5saW5lLmF1dG9saW5rKVxuICAucmVwbGFjZSgnc2NoZW1lJywgaW5saW5lLl9zY2hlbWUpXG4gIC5yZXBsYWNlKCdlbWFpbCcsIGlubGluZS5fZW1haWwpXG4gIC5nZXRSZWdleCgpO1xuXG5pbmxpbmUuX2F0dHJpYnV0ZSA9IC9cXHMrW2EtekEtWjpfXVtcXHcuOi1dKig/Olxccyo9XFxzKlwiW15cIl0qXCJ8XFxzKj1cXHMqJ1teJ10qJ3xcXHMqPVxccypbXlxcc1wiJz08PmBdKyk/LztcblxuaW5saW5lLnRhZyA9IGVkaXQoaW5saW5lLnRhZylcbiAgLnJlcGxhY2UoJ2NvbW1lbnQnLCBpbmxpbmUuX2NvbW1lbnQpXG4gIC5yZXBsYWNlKCdhdHRyaWJ1dGUnLCBpbmxpbmUuX2F0dHJpYnV0ZSlcbiAgLmdldFJlZ2V4KCk7XG5cbmlubGluZS5fbGFiZWwgPSAvKD86XFxbKD86XFxcXC58W15cXFtcXF1cXFxcXSkqXFxdfFxcXFwufGBbXmBdKmB8W15cXFtcXF1cXFxcYF0pKj8vO1xuaW5saW5lLl9ocmVmID0gLzwoPzpcXFxcLnxbXlxcbjw+XFxcXF0pKz58W15cXHNcXHgwMC1cXHgxZl0qLztcbmlubGluZS5fdGl0bGUgPSAvXCIoPzpcXFxcXCI/fFteXCJcXFxcXSkqXCJ8Jyg/OlxcXFwnP3xbXidcXFxcXSkqJ3xcXCgoPzpcXFxcXFwpP3xbXilcXFxcXSkqXFwpLztcblxuaW5saW5lLmxpbmsgPSBlZGl0KGlubGluZS5saW5rKVxuICAucmVwbGFjZSgnbGFiZWwnLCBpbmxpbmUuX2xhYmVsKVxuICAucmVwbGFjZSgnaHJlZicsIGlubGluZS5faHJlZilcbiAgLnJlcGxhY2UoJ3RpdGxlJywgaW5saW5lLl90aXRsZSlcbiAgLmdldFJlZ2V4KCk7XG5cbmlubGluZS5yZWZsaW5rID0gZWRpdChpbmxpbmUucmVmbGluaylcbiAgLnJlcGxhY2UoJ2xhYmVsJywgaW5saW5lLl9sYWJlbClcbiAgLnJlcGxhY2UoJ3JlZicsIGJsb2NrLl9sYWJlbClcbiAgLmdldFJlZ2V4KCk7XG5cbmlubGluZS5ub2xpbmsgPSBlZGl0KGlubGluZS5ub2xpbmspXG4gIC5yZXBsYWNlKCdyZWYnLCBibG9jay5fbGFiZWwpXG4gIC5nZXRSZWdleCgpO1xuXG5pbmxpbmUucmVmbGlua1NlYXJjaCA9IGVkaXQoaW5saW5lLnJlZmxpbmtTZWFyY2gsICdnJylcbiAgLnJlcGxhY2UoJ3JlZmxpbmsnLCBpbmxpbmUucmVmbGluaylcbiAgLnJlcGxhY2UoJ25vbGluaycsIGlubGluZS5ub2xpbmspXG4gIC5nZXRSZWdleCgpO1xuXG4vKipcbiAqIE5vcm1hbCBJbmxpbmUgR3JhbW1hclxuICovXG5cbmlubGluZS5ub3JtYWwgPSBtZXJnZSh7fSwgaW5saW5lKTtcblxuLyoqXG4gKiBQZWRhbnRpYyBJbmxpbmUgR3JhbW1hclxuICovXG5cbmlubGluZS5wZWRhbnRpYyA9IG1lcmdlKHt9LCBpbmxpbmUubm9ybWFsLCB7XG4gIHN0cm9uZzoge1xuICAgIHN0YXJ0OiAvXl9ffFxcKlxcKi8sXG4gICAgbWlkZGxlOiAvXl9fKD89XFxTKShbXFxzXFxTXSo/XFxTKV9fKD8hXyl8XlxcKlxcKig/PVxcUykoW1xcc1xcU10qP1xcUylcXCpcXCooPyFcXCopLyxcbiAgICBlbmRBc3Q6IC9cXCpcXCooPyFcXCopL2csXG4gICAgZW5kVW5kOiAvX18oPyFfKS9nXG4gIH0sXG4gIGVtOiB7XG4gICAgc3RhcnQ6IC9eX3xcXCovLFxuICAgIG1pZGRsZTogL14oKVxcKig/PVxcUykoW1xcc1xcU10qP1xcUylcXCooPyFcXCopfF5fKD89XFxTKShbXFxzXFxTXSo/XFxTKV8oPyFfKS8sXG4gICAgZW5kQXN0OiAvXFwqKD8hXFwqKS9nLFxuICAgIGVuZFVuZDogL18oPyFfKS9nXG4gIH0sXG4gIGxpbms6IGVkaXQoL14hP1xcWyhsYWJlbClcXF1cXCgoLio/KVxcKS8pXG4gICAgLnJlcGxhY2UoJ2xhYmVsJywgaW5saW5lLl9sYWJlbClcbiAgICAuZ2V0UmVnZXgoKSxcbiAgcmVmbGluazogZWRpdCgvXiE/XFxbKGxhYmVsKVxcXVxccypcXFsoW15cXF1dKilcXF0vKVxuICAgIC5yZXBsYWNlKCdsYWJlbCcsIGlubGluZS5fbGFiZWwpXG4gICAgLmdldFJlZ2V4KClcbn0pO1xuXG4vKipcbiAqIEdGTSBJbmxpbmUgR3JhbW1hclxuICovXG5cbmlubGluZS5nZm0gPSBtZXJnZSh7fSwgaW5saW5lLm5vcm1hbCwge1xuICBlc2NhcGU6IGVkaXQoaW5saW5lLmVzY2FwZSkucmVwbGFjZSgnXSknLCAnfnxdKScpLmdldFJlZ2V4KCksXG4gIF9leHRlbmRlZF9lbWFpbDogL1tBLVphLXowLTkuXystXSsoQClbYS16QS1aMC05LV9dKyg/OlxcLlthLXpBLVowLTktX10qW2EtekEtWjAtOV0pKyg/IVstX10pLyxcbiAgdXJsOiAvXigoPzpmdHB8aHR0cHM/KTpcXC9cXC98d3d3XFwuKSg/OlthLXpBLVowLTlcXC1dK1xcLj8pK1teXFxzPF0qfF5lbWFpbC8sXG4gIF9iYWNrcGVkYWw6IC8oPzpbXj8hLiw6OypfJ1wifigpJl0rfFxcKFteKV0qXFwpfCYoPyFbYS16QS1aMC05XSs7JCl8Wz8hLiw6OypfJ1wifildKyg/ISQpKSsvLFxuICBkZWw6IC9eKH5+PykoPz1bXlxcc35dKShbXFxzXFxTXSo/W15cXHN+XSlcXDEoPz1bXn5dfCQpLyxcbiAgdGV4dDogL14oW2B+XSt8W15gfl0pKD86KD89IHsyLH1cXG4pfCg/PVthLXpBLVowLTkuISMkJSYnKitcXC89P19ge1xcfH1+LV0rQCl8W1xcc1xcU10qPyg/Oig/PVtcXFxcPCFcXFtgKn5fXXxcXGJffGh0dHBzPzpcXC9cXC98ZnRwOlxcL1xcL3x3d3dcXC58JCl8W14gXSg/PSB7Mix9XFxuKXxbXmEtekEtWjAtOS4hIyQlJicqK1xcLz0/X2B7XFx8fX4tXSg/PVthLXpBLVowLTkuISMkJSYnKitcXC89P19ge1xcfH1+LV0rQCkpKS9cbn0pO1xuXG5pbmxpbmUuZ2ZtLnVybCA9IGVkaXQoaW5saW5lLmdmbS51cmwsICdpJylcbiAgLnJlcGxhY2UoJ2VtYWlsJywgaW5saW5lLmdmbS5fZXh0ZW5kZWRfZW1haWwpXG4gIC5nZXRSZWdleCgpO1xuLyoqXG4gKiBHRk0gKyBMaW5lIEJyZWFrcyBJbmxpbmUgR3JhbW1hclxuICovXG5cbmlubGluZS5icmVha3MgPSBtZXJnZSh7fSwgaW5saW5lLmdmbSwge1xuICBicjogZWRpdChpbmxpbmUuYnIpLnJlcGxhY2UoJ3syLH0nLCAnKicpLmdldFJlZ2V4KCksXG4gIHRleHQ6IGVkaXQoaW5saW5lLmdmbS50ZXh0KVxuICAgIC5yZXBsYWNlKCdcXFxcYl8nLCAnXFxcXGJffCB7Mix9XFxcXG4nKVxuICAgIC5yZXBsYWNlKC9cXHsyLFxcfS9nLCAnKicpXG4gICAgLmdldFJlZ2V4KClcbn0pO1xuXG4vKipcbiAqIHNtYXJ0eXBhbnRzIHRleHQgcmVwbGFjZW1lbnRcbiAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0XG4gKi9cbmZ1bmN0aW9uIHNtYXJ0eXBhbnRzKHRleHQpIHtcbiAgcmV0dXJuIHRleHRcbiAgICAvLyBlbS1kYXNoZXNcbiAgICAucmVwbGFjZSgvLS0tL2csICdcXHUyMDE0JylcbiAgICAvLyBlbi1kYXNoZXNcbiAgICAucmVwbGFjZSgvLS0vZywgJ1xcdTIwMTMnKVxuICAgIC8vIG9wZW5pbmcgc2luZ2xlc1xuICAgIC5yZXBsYWNlKC8oXnxbLVxcdTIwMTQvKFxcW3tcIlxcc10pJy9nLCAnJDFcXHUyMDE4JylcbiAgICAvLyBjbG9zaW5nIHNpbmdsZXMgJiBhcG9zdHJvcGhlc1xuICAgIC5yZXBsYWNlKC8nL2csICdcXHUyMDE5JylcbiAgICAvLyBvcGVuaW5nIGRvdWJsZXNcbiAgICAucmVwbGFjZSgvKF58Wy1cXHUyMDE0LyhcXFt7XFx1MjAxOFxcc10pXCIvZywgJyQxXFx1MjAxYycpXG4gICAgLy8gY2xvc2luZyBkb3VibGVzXG4gICAgLnJlcGxhY2UoL1wiL2csICdcXHUyMDFkJylcbiAgICAvLyBlbGxpcHNlc1xuICAgIC5yZXBsYWNlKC9cXC57M30vZywgJ1xcdTIwMjYnKTtcbn1cblxuLyoqXG4gKiBtYW5nbGUgZW1haWwgYWRkcmVzc2VzXG4gKiBAcGFyYW0ge3N0cmluZ30gdGV4dFxuICovXG5mdW5jdGlvbiBtYW5nbGUodGV4dCkge1xuICBsZXQgb3V0ID0gJycsXG4gICAgaSxcbiAgICBjaDtcblxuICBjb25zdCBsID0gdGV4dC5sZW5ndGg7XG4gIGZvciAoaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICBjaCA9IHRleHQuY2hhckNvZGVBdChpKTtcbiAgICBpZiAoTWF0aC5yYW5kb20oKSA+IDAuNSkge1xuICAgICAgY2ggPSAneCcgKyBjaC50b1N0cmluZygxNik7XG4gICAgfVxuICAgIG91dCArPSAnJiMnICsgY2ggKyAnOyc7XG4gIH1cblxuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIEJsb2NrIExleGVyXG4gKi9cbmNsYXNzIExleGVyIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgIHRoaXMudG9rZW5zID0gW107XG4gICAgdGhpcy50b2tlbnMubGlua3MgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHwgZGVmYXVsdHM7XG4gICAgdGhpcy5vcHRpb25zLnRva2VuaXplciA9IHRoaXMub3B0aW9ucy50b2tlbml6ZXIgfHwgbmV3IFRva2VuaXplcigpO1xuICAgIHRoaXMudG9rZW5pemVyID0gdGhpcy5vcHRpb25zLnRva2VuaXplcjtcbiAgICB0aGlzLnRva2VuaXplci5vcHRpb25zID0gdGhpcy5vcHRpb25zO1xuICAgIHRoaXMudG9rZW5pemVyLmxleGVyID0gdGhpcztcbiAgICB0aGlzLmlubGluZVF1ZXVlID0gW107XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIGluTGluazogZmFsc2UsXG4gICAgICBpblJhd0Jsb2NrOiBmYWxzZSxcbiAgICAgIHRvcDogdHJ1ZVxuICAgIH07XG5cbiAgICBjb25zdCBydWxlcyA9IHtcbiAgICAgIGJsb2NrOiBibG9jay5ub3JtYWwsXG4gICAgICBpbmxpbmU6IGlubGluZS5ub3JtYWxcbiAgICB9O1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5wZWRhbnRpYykge1xuICAgICAgcnVsZXMuYmxvY2sgPSBibG9jay5wZWRhbnRpYztcbiAgICAgIHJ1bGVzLmlubGluZSA9IGlubGluZS5wZWRhbnRpYztcbiAgICB9IGVsc2UgaWYgKHRoaXMub3B0aW9ucy5nZm0pIHtcbiAgICAgIHJ1bGVzLmJsb2NrID0gYmxvY2suZ2ZtO1xuICAgICAgaWYgKHRoaXMub3B0aW9ucy5icmVha3MpIHtcbiAgICAgICAgcnVsZXMuaW5saW5lID0gaW5saW5lLmJyZWFrcztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJ1bGVzLmlubGluZSA9IGlubGluZS5nZm07XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMudG9rZW5pemVyLnJ1bGVzID0gcnVsZXM7XG4gIH1cblxuICAvKipcbiAgICogRXhwb3NlIFJ1bGVzXG4gICAqL1xuICBzdGF0aWMgZ2V0IHJ1bGVzKCkge1xuICAgIHJldHVybiB7XG4gICAgICBibG9jayxcbiAgICAgIGlubGluZVxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogU3RhdGljIExleCBNZXRob2RcbiAgICovXG4gIHN0YXRpYyBsZXgoc3JjLCBvcHRpb25zKSB7XG4gICAgY29uc3QgbGV4ZXIgPSBuZXcgTGV4ZXIob3B0aW9ucyk7XG4gICAgcmV0dXJuIGxleGVyLmxleChzcmMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YXRpYyBMZXggSW5saW5lIE1ldGhvZFxuICAgKi9cbiAgc3RhdGljIGxleElubGluZShzcmMsIG9wdGlvbnMpIHtcbiAgICBjb25zdCBsZXhlciA9IG5ldyBMZXhlcihvcHRpb25zKTtcbiAgICByZXR1cm4gbGV4ZXIuaW5saW5lVG9rZW5zKHNyYyk7XG4gIH1cblxuICAvKipcbiAgICogUHJlcHJvY2Vzc2luZ1xuICAgKi9cbiAgbGV4KHNyYykge1xuICAgIHNyYyA9IHNyY1xuICAgICAgLnJlcGxhY2UoL1xcclxcbnxcXHIvZywgJ1xcbicpO1xuXG4gICAgdGhpcy5ibG9ja1Rva2VucyhzcmMsIHRoaXMudG9rZW5zKTtcblxuICAgIGxldCBuZXh0O1xuICAgIHdoaWxlIChuZXh0ID0gdGhpcy5pbmxpbmVRdWV1ZS5zaGlmdCgpKSB7XG4gICAgICB0aGlzLmlubGluZVRva2VucyhuZXh0LnNyYywgbmV4dC50b2tlbnMpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnRva2VucztcbiAgfVxuXG4gIC8qKlxuICAgKiBMZXhpbmdcbiAgICovXG4gIGJsb2NrVG9rZW5zKHNyYywgdG9rZW5zID0gW10pIHtcbiAgICBpZiAodGhpcy5vcHRpb25zLnBlZGFudGljKSB7XG4gICAgICBzcmMgPSBzcmMucmVwbGFjZSgvXFx0L2csICcgICAgJykucmVwbGFjZSgvXiArJC9nbSwgJycpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzcmMgPSBzcmMucmVwbGFjZSgvXiggKikoXFx0KykvZ20sIChfLCBsZWFkaW5nLCB0YWJzKSA9PiB7XG4gICAgICAgIHJldHVybiBsZWFkaW5nICsgJyAgICAnLnJlcGVhdCh0YWJzLmxlbmd0aCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBsZXQgdG9rZW4sIGxhc3RUb2tlbiwgY3V0U3JjLCBsYXN0UGFyYWdyYXBoQ2xpcHBlZDtcblxuICAgIHdoaWxlIChzcmMpIHtcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuZXh0ZW5zaW9uc1xuICAgICAgICAmJiB0aGlzLm9wdGlvbnMuZXh0ZW5zaW9ucy5ibG9ja1xuICAgICAgICAmJiB0aGlzLm9wdGlvbnMuZXh0ZW5zaW9ucy5ibG9jay5zb21lKChleHRUb2tlbml6ZXIpID0+IHtcbiAgICAgICAgICBpZiAodG9rZW4gPSBleHRUb2tlbml6ZXIuY2FsbCh7IGxleGVyOiB0aGlzIH0sIHNyYywgdG9rZW5zKSkge1xuICAgICAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0pKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBuZXdsaW5lXG4gICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci5zcGFjZShzcmMpKSB7XG4gICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgIGlmICh0b2tlbi5yYXcubGVuZ3RoID09PSAxICYmIHRva2Vucy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgLy8gaWYgdGhlcmUncyBhIHNpbmdsZSBcXG4gYXMgYSBzcGFjZXIsIGl0J3MgdGVybWluYXRpbmcgdGhlIGxhc3QgbGluZSxcbiAgICAgICAgICAvLyBzbyBtb3ZlIGl0IHRoZXJlIHNvIHRoYXQgd2UgZG9uJ3QgZ2V0IHVuZWNlc3NhcnkgcGFyYWdyYXBoIHRhZ3NcbiAgICAgICAgICB0b2tlbnNbdG9rZW5zLmxlbmd0aCAtIDFdLnJhdyArPSAnXFxuJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgIH1cbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIGNvZGVcbiAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLmNvZGUoc3JjKSkge1xuICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICBsYXN0VG9rZW4gPSB0b2tlbnNbdG9rZW5zLmxlbmd0aCAtIDFdO1xuICAgICAgICAvLyBBbiBpbmRlbnRlZCBjb2RlIGJsb2NrIGNhbm5vdCBpbnRlcnJ1cHQgYSBwYXJhZ3JhcGguXG4gICAgICAgIGlmIChsYXN0VG9rZW4gJiYgKGxhc3RUb2tlbi50eXBlID09PSAncGFyYWdyYXBoJyB8fCBsYXN0VG9rZW4udHlwZSA9PT0gJ3RleHQnKSkge1xuICAgICAgICAgIGxhc3RUb2tlbi5yYXcgKz0gJ1xcbicgKyB0b2tlbi5yYXc7XG4gICAgICAgICAgbGFzdFRva2VuLnRleHQgKz0gJ1xcbicgKyB0b2tlbi50ZXh0O1xuICAgICAgICAgIHRoaXMuaW5saW5lUXVldWVbdGhpcy5pbmxpbmVRdWV1ZS5sZW5ndGggLSAxXS5zcmMgPSBsYXN0VG9rZW4udGV4dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgIH1cbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIGZlbmNlc1xuICAgICAgaWYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIuZmVuY2VzKHNyYykpIHtcbiAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gaGVhZGluZ1xuICAgICAgaWYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIuaGVhZGluZyhzcmMpKSB7XG4gICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIGhyXG4gICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci5ocihzcmMpKSB7XG4gICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIGJsb2NrcXVvdGVcbiAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLmJsb2NrcXVvdGUoc3JjKSkge1xuICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBsaXN0XG4gICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci5saXN0KHNyYykpIHtcbiAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gaHRtbFxuICAgICAgaWYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIuaHRtbChzcmMpKSB7XG4gICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIGRlZlxuICAgICAgaWYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIuZGVmKHNyYykpIHtcbiAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgbGFzdFRva2VuID0gdG9rZW5zW3Rva2Vucy5sZW5ndGggLSAxXTtcbiAgICAgICAgaWYgKGxhc3RUb2tlbiAmJiAobGFzdFRva2VuLnR5cGUgPT09ICdwYXJhZ3JhcGgnIHx8IGxhc3RUb2tlbi50eXBlID09PSAndGV4dCcpKSB7XG4gICAgICAgICAgbGFzdFRva2VuLnJhdyArPSAnXFxuJyArIHRva2VuLnJhdztcbiAgICAgICAgICBsYXN0VG9rZW4udGV4dCArPSAnXFxuJyArIHRva2VuLnJhdztcbiAgICAgICAgICB0aGlzLmlubGluZVF1ZXVlW3RoaXMuaW5saW5lUXVldWUubGVuZ3RoIC0gMV0uc3JjID0gbGFzdFRva2VuLnRleHQ7XG4gICAgICAgIH0gZWxzZSBpZiAoIXRoaXMudG9rZW5zLmxpbmtzW3Rva2VuLnRhZ10pIHtcbiAgICAgICAgICB0aGlzLnRva2Vucy5saW5rc1t0b2tlbi50YWddID0ge1xuICAgICAgICAgICAgaHJlZjogdG9rZW4uaHJlZixcbiAgICAgICAgICAgIHRpdGxlOiB0b2tlbi50aXRsZVxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIHRhYmxlIChnZm0pXG4gICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci50YWJsZShzcmMpKSB7XG4gICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIGxoZWFkaW5nXG4gICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci5saGVhZGluZyhzcmMpKSB7XG4gICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIHRvcC1sZXZlbCBwYXJhZ3JhcGhcbiAgICAgIC8vIHByZXZlbnQgcGFyYWdyYXBoIGNvbnN1bWluZyBleHRlbnNpb25zIGJ5IGNsaXBwaW5nICdzcmMnIHRvIGV4dGVuc2lvbiBzdGFydFxuICAgICAgY3V0U3JjID0gc3JjO1xuICAgICAgaWYgKHRoaXMub3B0aW9ucy5leHRlbnNpb25zICYmIHRoaXMub3B0aW9ucy5leHRlbnNpb25zLnN0YXJ0QmxvY2spIHtcbiAgICAgICAgbGV0IHN0YXJ0SW5kZXggPSBJbmZpbml0eTtcbiAgICAgICAgY29uc3QgdGVtcFNyYyA9IHNyYy5zbGljZSgxKTtcbiAgICAgICAgbGV0IHRlbXBTdGFydDtcbiAgICAgICAgdGhpcy5vcHRpb25zLmV4dGVuc2lvbnMuc3RhcnRCbG9jay5mb3JFYWNoKGZ1bmN0aW9uKGdldFN0YXJ0SW5kZXgpIHtcbiAgICAgICAgICB0ZW1wU3RhcnQgPSBnZXRTdGFydEluZGV4LmNhbGwoeyBsZXhlcjogdGhpcyB9LCB0ZW1wU3JjKTtcbiAgICAgICAgICBpZiAodHlwZW9mIHRlbXBTdGFydCA9PT0gJ251bWJlcicgJiYgdGVtcFN0YXJ0ID49IDApIHsgc3RhcnRJbmRleCA9IE1hdGgubWluKHN0YXJ0SW5kZXgsIHRlbXBTdGFydCk7IH1cbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChzdGFydEluZGV4IDwgSW5maW5pdHkgJiYgc3RhcnRJbmRleCA+PSAwKSB7XG4gICAgICAgICAgY3V0U3JjID0gc3JjLnN1YnN0cmluZygwLCBzdGFydEluZGV4ICsgMSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLnN0YXRlLnRvcCAmJiAodG9rZW4gPSB0aGlzLnRva2VuaXplci5wYXJhZ3JhcGgoY3V0U3JjKSkpIHtcbiAgICAgICAgbGFzdFRva2VuID0gdG9rZW5zW3Rva2Vucy5sZW5ndGggLSAxXTtcbiAgICAgICAgaWYgKGxhc3RQYXJhZ3JhcGhDbGlwcGVkICYmIGxhc3RUb2tlbi50eXBlID09PSAncGFyYWdyYXBoJykge1xuICAgICAgICAgIGxhc3RUb2tlbi5yYXcgKz0gJ1xcbicgKyB0b2tlbi5yYXc7XG4gICAgICAgICAgbGFzdFRva2VuLnRleHQgKz0gJ1xcbicgKyB0b2tlbi50ZXh0O1xuICAgICAgICAgIHRoaXMuaW5saW5lUXVldWUucG9wKCk7XG4gICAgICAgICAgdGhpcy5pbmxpbmVRdWV1ZVt0aGlzLmlubGluZVF1ZXVlLmxlbmd0aCAtIDFdLnNyYyA9IGxhc3RUb2tlbi50ZXh0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgfVxuICAgICAgICBsYXN0UGFyYWdyYXBoQ2xpcHBlZCA9IChjdXRTcmMubGVuZ3RoICE9PSBzcmMubGVuZ3RoKTtcbiAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIHRleHRcbiAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLnRleHQoc3JjKSkge1xuICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICBsYXN0VG9rZW4gPSB0b2tlbnNbdG9rZW5zLmxlbmd0aCAtIDFdO1xuICAgICAgICBpZiAobGFzdFRva2VuICYmIGxhc3RUb2tlbi50eXBlID09PSAndGV4dCcpIHtcbiAgICAgICAgICBsYXN0VG9rZW4ucmF3ICs9ICdcXG4nICsgdG9rZW4ucmF3O1xuICAgICAgICAgIGxhc3RUb2tlbi50ZXh0ICs9ICdcXG4nICsgdG9rZW4udGV4dDtcbiAgICAgICAgICB0aGlzLmlubGluZVF1ZXVlLnBvcCgpO1xuICAgICAgICAgIHRoaXMuaW5saW5lUXVldWVbdGhpcy5pbmxpbmVRdWV1ZS5sZW5ndGggLSAxXS5zcmMgPSBsYXN0VG9rZW4udGV4dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgIH1cbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChzcmMpIHtcbiAgICAgICAgY29uc3QgZXJyTXNnID0gJ0luZmluaXRlIGxvb3Agb24gYnl0ZTogJyArIHNyYy5jaGFyQ29kZUF0KDApO1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnNpbGVudCkge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyTXNnKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyTXNnKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuc3RhdGUudG9wID0gdHJ1ZTtcbiAgICByZXR1cm4gdG9rZW5zO1xuICB9XG5cbiAgaW5saW5lKHNyYywgdG9rZW5zID0gW10pIHtcbiAgICB0aGlzLmlubGluZVF1ZXVlLnB1c2goeyBzcmMsIHRva2VucyB9KTtcbiAgICByZXR1cm4gdG9rZW5zO1xuICB9XG5cbiAgLyoqXG4gICAqIExleGluZy9Db21waWxpbmdcbiAgICovXG4gIGlubGluZVRva2VucyhzcmMsIHRva2VucyA9IFtdKSB7XG4gICAgbGV0IHRva2VuLCBsYXN0VG9rZW4sIGN1dFNyYztcblxuICAgIC8vIFN0cmluZyB3aXRoIGxpbmtzIG1hc2tlZCB0byBhdm9pZCBpbnRlcmZlcmVuY2Ugd2l0aCBlbSBhbmQgc3Ryb25nXG4gICAgbGV0IG1hc2tlZFNyYyA9IHNyYztcbiAgICBsZXQgbWF0Y2g7XG4gICAgbGV0IGtlZXBQcmV2Q2hhciwgcHJldkNoYXI7XG5cbiAgICAvLyBNYXNrIG91dCByZWZsaW5rc1xuICAgIGlmICh0aGlzLnRva2Vucy5saW5rcykge1xuICAgICAgY29uc3QgbGlua3MgPSBPYmplY3Qua2V5cyh0aGlzLnRva2Vucy5saW5rcyk7XG4gICAgICBpZiAobGlua3MubGVuZ3RoID4gMCkge1xuICAgICAgICB3aGlsZSAoKG1hdGNoID0gdGhpcy50b2tlbml6ZXIucnVsZXMuaW5saW5lLnJlZmxpbmtTZWFyY2guZXhlYyhtYXNrZWRTcmMpKSAhPSBudWxsKSB7XG4gICAgICAgICAgaWYgKGxpbmtzLmluY2x1ZGVzKG1hdGNoWzBdLnNsaWNlKG1hdGNoWzBdLmxhc3RJbmRleE9mKCdbJykgKyAxLCAtMSkpKSB7XG4gICAgICAgICAgICBtYXNrZWRTcmMgPSBtYXNrZWRTcmMuc2xpY2UoMCwgbWF0Y2guaW5kZXgpICsgJ1snICsgcmVwZWF0U3RyaW5nKCdhJywgbWF0Y2hbMF0ubGVuZ3RoIC0gMikgKyAnXScgKyBtYXNrZWRTcmMuc2xpY2UodGhpcy50b2tlbml6ZXIucnVsZXMuaW5saW5lLnJlZmxpbmtTZWFyY2gubGFzdEluZGV4KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgLy8gTWFzayBvdXQgb3RoZXIgYmxvY2tzXG4gICAgd2hpbGUgKChtYXRjaCA9IHRoaXMudG9rZW5pemVyLnJ1bGVzLmlubGluZS5ibG9ja1NraXAuZXhlYyhtYXNrZWRTcmMpKSAhPSBudWxsKSB7XG4gICAgICBtYXNrZWRTcmMgPSBtYXNrZWRTcmMuc2xpY2UoMCwgbWF0Y2guaW5kZXgpICsgJ1snICsgcmVwZWF0U3RyaW5nKCdhJywgbWF0Y2hbMF0ubGVuZ3RoIC0gMikgKyAnXScgKyBtYXNrZWRTcmMuc2xpY2UodGhpcy50b2tlbml6ZXIucnVsZXMuaW5saW5lLmJsb2NrU2tpcC5sYXN0SW5kZXgpO1xuICAgIH1cblxuICAgIC8vIE1hc2sgb3V0IGVzY2FwZWQgZW0gJiBzdHJvbmcgZGVsaW1pdGVyc1xuICAgIHdoaWxlICgobWF0Y2ggPSB0aGlzLnRva2VuaXplci5ydWxlcy5pbmxpbmUuZXNjYXBlZEVtU3QuZXhlYyhtYXNrZWRTcmMpKSAhPSBudWxsKSB7XG4gICAgICBtYXNrZWRTcmMgPSBtYXNrZWRTcmMuc2xpY2UoMCwgbWF0Y2guaW5kZXggKyBtYXRjaFswXS5sZW5ndGggLSAyKSArICcrKycgKyBtYXNrZWRTcmMuc2xpY2UodGhpcy50b2tlbml6ZXIucnVsZXMuaW5saW5lLmVzY2FwZWRFbVN0Lmxhc3RJbmRleCk7XG4gICAgICB0aGlzLnRva2VuaXplci5ydWxlcy5pbmxpbmUuZXNjYXBlZEVtU3QubGFzdEluZGV4LS07XG4gICAgfVxuXG4gICAgd2hpbGUgKHNyYykge1xuICAgICAgaWYgKCFrZWVwUHJldkNoYXIpIHtcbiAgICAgICAgcHJldkNoYXIgPSAnJztcbiAgICAgIH1cbiAgICAgIGtlZXBQcmV2Q2hhciA9IGZhbHNlO1xuXG4gICAgICAvLyBleHRlbnNpb25zXG4gICAgICBpZiAodGhpcy5vcHRpb25zLmV4dGVuc2lvbnNcbiAgICAgICAgJiYgdGhpcy5vcHRpb25zLmV4dGVuc2lvbnMuaW5saW5lXG4gICAgICAgICYmIHRoaXMub3B0aW9ucy5leHRlbnNpb25zLmlubGluZS5zb21lKChleHRUb2tlbml6ZXIpID0+IHtcbiAgICAgICAgICBpZiAodG9rZW4gPSBleHRUb2tlbml6ZXIuY2FsbCh7IGxleGVyOiB0aGlzIH0sIHNyYywgdG9rZW5zKSkge1xuICAgICAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0pKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBlc2NhcGVcbiAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLmVzY2FwZShzcmMpKSB7XG4gICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIHRhZ1xuICAgICAgaWYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIudGFnKHNyYykpIHtcbiAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgbGFzdFRva2VuID0gdG9rZW5zW3Rva2Vucy5sZW5ndGggLSAxXTtcbiAgICAgICAgaWYgKGxhc3RUb2tlbiAmJiB0b2tlbi50eXBlID09PSAndGV4dCcgJiYgbGFzdFRva2VuLnR5cGUgPT09ICd0ZXh0Jykge1xuICAgICAgICAgIGxhc3RUb2tlbi5yYXcgKz0gdG9rZW4ucmF3O1xuICAgICAgICAgIGxhc3RUb2tlbi50ZXh0ICs9IHRva2VuLnRleHQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICB9XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBsaW5rXG4gICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci5saW5rKHNyYykpIHtcbiAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gcmVmbGluaywgbm9saW5rXG4gICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci5yZWZsaW5rKHNyYywgdGhpcy50b2tlbnMubGlua3MpKSB7XG4gICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgIGxhc3RUb2tlbiA9IHRva2Vuc1t0b2tlbnMubGVuZ3RoIC0gMV07XG4gICAgICAgIGlmIChsYXN0VG9rZW4gJiYgdG9rZW4udHlwZSA9PT0gJ3RleHQnICYmIGxhc3RUb2tlbi50eXBlID09PSAndGV4dCcpIHtcbiAgICAgICAgICBsYXN0VG9rZW4ucmF3ICs9IHRva2VuLnJhdztcbiAgICAgICAgICBsYXN0VG9rZW4udGV4dCArPSB0b2tlbi50ZXh0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgfVxuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gZW0gJiBzdHJvbmdcbiAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLmVtU3Ryb25nKHNyYywgbWFza2VkU3JjLCBwcmV2Q2hhcikpIHtcbiAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gY29kZVxuICAgICAgaWYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIuY29kZXNwYW4oc3JjKSkge1xuICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBiclxuICAgICAgaWYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIuYnIoc3JjKSkge1xuICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBkZWwgKGdmbSlcbiAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLmRlbChzcmMpKSB7XG4gICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIGF1dG9saW5rXG4gICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci5hdXRvbGluayhzcmMsIG1hbmdsZSkpIHtcbiAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gdXJsIChnZm0pXG4gICAgICBpZiAoIXRoaXMuc3RhdGUuaW5MaW5rICYmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLnVybChzcmMsIG1hbmdsZSkpKSB7XG4gICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIHRleHRcbiAgICAgIC8vIHByZXZlbnQgaW5saW5lVGV4dCBjb25zdW1pbmcgZXh0ZW5zaW9ucyBieSBjbGlwcGluZyAnc3JjJyB0byBleHRlbnNpb24gc3RhcnRcbiAgICAgIGN1dFNyYyA9IHNyYztcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuZXh0ZW5zaW9ucyAmJiB0aGlzLm9wdGlvbnMuZXh0ZW5zaW9ucy5zdGFydElubGluZSkge1xuICAgICAgICBsZXQgc3RhcnRJbmRleCA9IEluZmluaXR5O1xuICAgICAgICBjb25zdCB0ZW1wU3JjID0gc3JjLnNsaWNlKDEpO1xuICAgICAgICBsZXQgdGVtcFN0YXJ0O1xuICAgICAgICB0aGlzLm9wdGlvbnMuZXh0ZW5zaW9ucy5zdGFydElubGluZS5mb3JFYWNoKGZ1bmN0aW9uKGdldFN0YXJ0SW5kZXgpIHtcbiAgICAgICAgICB0ZW1wU3RhcnQgPSBnZXRTdGFydEluZGV4LmNhbGwoeyBsZXhlcjogdGhpcyB9LCB0ZW1wU3JjKTtcbiAgICAgICAgICBpZiAodHlwZW9mIHRlbXBTdGFydCA9PT0gJ251bWJlcicgJiYgdGVtcFN0YXJ0ID49IDApIHsgc3RhcnRJbmRleCA9IE1hdGgubWluKHN0YXJ0SW5kZXgsIHRlbXBTdGFydCk7IH1cbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChzdGFydEluZGV4IDwgSW5maW5pdHkgJiYgc3RhcnRJbmRleCA+PSAwKSB7XG4gICAgICAgICAgY3V0U3JjID0gc3JjLnN1YnN0cmluZygwLCBzdGFydEluZGV4ICsgMSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLmlubGluZVRleHQoY3V0U3JjLCBzbWFydHlwYW50cykpIHtcbiAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgaWYgKHRva2VuLnJhdy5zbGljZSgtMSkgIT09ICdfJykgeyAvLyBUcmFjayBwcmV2Q2hhciBiZWZvcmUgc3RyaW5nIG9mIF9fX18gc3RhcnRlZFxuICAgICAgICAgIHByZXZDaGFyID0gdG9rZW4ucmF3LnNsaWNlKC0xKTtcbiAgICAgICAgfVxuICAgICAgICBrZWVwUHJldkNoYXIgPSB0cnVlO1xuICAgICAgICBsYXN0VG9rZW4gPSB0b2tlbnNbdG9rZW5zLmxlbmd0aCAtIDFdO1xuICAgICAgICBpZiAobGFzdFRva2VuICYmIGxhc3RUb2tlbi50eXBlID09PSAndGV4dCcpIHtcbiAgICAgICAgICBsYXN0VG9rZW4ucmF3ICs9IHRva2VuLnJhdztcbiAgICAgICAgICBsYXN0VG9rZW4udGV4dCArPSB0b2tlbi50ZXh0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgfVxuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKHNyYykge1xuICAgICAgICBjb25zdCBlcnJNc2cgPSAnSW5maW5pdGUgbG9vcCBvbiBieXRlOiAnICsgc3JjLmNoYXJDb2RlQXQoMCk7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuc2lsZW50KSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihlcnJNc2cpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJNc2cpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRva2VucztcbiAgfVxufVxuXG4vKipcbiAqIFJlbmRlcmVyXG4gKi9cbmNsYXNzIFJlbmRlcmVyIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHwgZGVmYXVsdHM7XG4gIH1cblxuICBjb2RlKGNvZGUsIGluZm9zdHJpbmcsIGVzY2FwZWQpIHtcbiAgICBjb25zdCBsYW5nID0gKGluZm9zdHJpbmcgfHwgJycpLm1hdGNoKC9cXFMqLylbMF07XG4gICAgaWYgKHRoaXMub3B0aW9ucy5oaWdobGlnaHQpIHtcbiAgICAgIGNvbnN0IG91dCA9IHRoaXMub3B0aW9ucy5oaWdobGlnaHQoY29kZSwgbGFuZyk7XG4gICAgICBpZiAob3V0ICE9IG51bGwgJiYgb3V0ICE9PSBjb2RlKSB7XG4gICAgICAgIGVzY2FwZWQgPSB0cnVlO1xuICAgICAgICBjb2RlID0gb3V0O1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvZGUgPSBjb2RlLnJlcGxhY2UoL1xcbiQvLCAnJykgKyAnXFxuJztcblxuICAgIGlmICghbGFuZykge1xuICAgICAgcmV0dXJuICc8cHJlPjxjb2RlPidcbiAgICAgICAgKyAoZXNjYXBlZCA/IGNvZGUgOiBlc2NhcGUoY29kZSwgdHJ1ZSkpXG4gICAgICAgICsgJzwvY29kZT48L3ByZT5cXG4nO1xuICAgIH1cblxuICAgIHJldHVybiAnPHByZT48Y29kZSBjbGFzcz1cIidcbiAgICAgICsgdGhpcy5vcHRpb25zLmxhbmdQcmVmaXhcbiAgICAgICsgZXNjYXBlKGxhbmcpXG4gICAgICArICdcIj4nXG4gICAgICArIChlc2NhcGVkID8gY29kZSA6IGVzY2FwZShjb2RlLCB0cnVlKSlcbiAgICAgICsgJzwvY29kZT48L3ByZT5cXG4nO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBxdW90ZVxuICAgKi9cbiAgYmxvY2txdW90ZShxdW90ZSkge1xuICAgIHJldHVybiBgPGJsb2NrcXVvdGU+XFxuJHtxdW90ZX08L2Jsb2NrcXVvdGU+XFxuYDtcbiAgfVxuXG4gIGh0bWwoaHRtbCkge1xuICAgIHJldHVybiBodG1sO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0XG4gICAqIEBwYXJhbSB7c3RyaW5nfSBsZXZlbFxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmF3XG4gICAqIEBwYXJhbSB7YW55fSBzbHVnZ2VyXG4gICAqL1xuICBoZWFkaW5nKHRleHQsIGxldmVsLCByYXcsIHNsdWdnZXIpIHtcbiAgICBpZiAodGhpcy5vcHRpb25zLmhlYWRlcklkcykge1xuICAgICAgY29uc3QgaWQgPSB0aGlzLm9wdGlvbnMuaGVhZGVyUHJlZml4ICsgc2x1Z2dlci5zbHVnKHJhdyk7XG4gICAgICByZXR1cm4gYDxoJHtsZXZlbH0gaWQ9XCIke2lkfVwiPiR7dGV4dH08L2gke2xldmVsfT5cXG5gO1xuICAgIH1cblxuICAgIC8vIGlnbm9yZSBJRHNcbiAgICByZXR1cm4gYDxoJHtsZXZlbH0+JHt0ZXh0fTwvaCR7bGV2ZWx9PlxcbmA7XG4gIH1cblxuICBocigpIHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLnhodG1sID8gJzxoci8+XFxuJyA6ICc8aHI+XFxuJztcbiAgfVxuXG4gIGxpc3QoYm9keSwgb3JkZXJlZCwgc3RhcnQpIHtcbiAgICBjb25zdCB0eXBlID0gb3JkZXJlZCA/ICdvbCcgOiAndWwnLFxuICAgICAgc3RhcnRhdHQgPSAob3JkZXJlZCAmJiBzdGFydCAhPT0gMSkgPyAoJyBzdGFydD1cIicgKyBzdGFydCArICdcIicpIDogJyc7XG4gICAgcmV0dXJuICc8JyArIHR5cGUgKyBzdGFydGF0dCArICc+XFxuJyArIGJvZHkgKyAnPC8nICsgdHlwZSArICc+XFxuJztcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGV4dFxuICAgKi9cbiAgbGlzdGl0ZW0odGV4dCkge1xuICAgIHJldHVybiBgPGxpPiR7dGV4dH08L2xpPlxcbmA7XG4gIH1cblxuICBjaGVja2JveChjaGVja2VkKSB7XG4gICAgcmV0dXJuICc8aW5wdXQgJ1xuICAgICAgKyAoY2hlY2tlZCA/ICdjaGVja2VkPVwiXCIgJyA6ICcnKVxuICAgICAgKyAnZGlzYWJsZWQ9XCJcIiB0eXBlPVwiY2hlY2tib3hcIidcbiAgICAgICsgKHRoaXMub3B0aW9ucy54aHRtbCA/ICcgLycgOiAnJylcbiAgICAgICsgJz4gJztcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGV4dFxuICAgKi9cbiAgcGFyYWdyYXBoKHRleHQpIHtcbiAgICByZXR1cm4gYDxwPiR7dGV4dH08L3A+XFxuYDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gaGVhZGVyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBib2R5XG4gICAqL1xuICB0YWJsZShoZWFkZXIsIGJvZHkpIHtcbiAgICBpZiAoYm9keSkgYm9keSA9IGA8dGJvZHk+JHtib2R5fTwvdGJvZHk+YDtcblxuICAgIHJldHVybiAnPHRhYmxlPlxcbidcbiAgICAgICsgJzx0aGVhZD5cXG4nXG4gICAgICArIGhlYWRlclxuICAgICAgKyAnPC90aGVhZD5cXG4nXG4gICAgICArIGJvZHlcbiAgICAgICsgJzwvdGFibGU+XFxuJztcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gY29udGVudFxuICAgKi9cbiAgdGFibGVyb3coY29udGVudCkge1xuICAgIHJldHVybiBgPHRyPlxcbiR7Y29udGVudH08L3RyPlxcbmA7XG4gIH1cblxuICB0YWJsZWNlbGwoY29udGVudCwgZmxhZ3MpIHtcbiAgICBjb25zdCB0eXBlID0gZmxhZ3MuaGVhZGVyID8gJ3RoJyA6ICd0ZCc7XG4gICAgY29uc3QgdGFnID0gZmxhZ3MuYWxpZ25cbiAgICAgID8gYDwke3R5cGV9IGFsaWduPVwiJHtmbGFncy5hbGlnbn1cIj5gXG4gICAgICA6IGA8JHt0eXBlfT5gO1xuICAgIHJldHVybiB0YWcgKyBjb250ZW50ICsgYDwvJHt0eXBlfT5cXG5gO1xuICB9XG5cbiAgLyoqXG4gICAqIHNwYW4gbGV2ZWwgcmVuZGVyZXJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHRleHRcbiAgICovXG4gIHN0cm9uZyh0ZXh0KSB7XG4gICAgcmV0dXJuIGA8c3Ryb25nPiR7dGV4dH08L3N0cm9uZz5gO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0XG4gICAqL1xuICBlbSh0ZXh0KSB7XG4gICAgcmV0dXJuIGA8ZW0+JHt0ZXh0fTwvZW0+YDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGV4dFxuICAgKi9cbiAgY29kZXNwYW4odGV4dCkge1xuICAgIHJldHVybiBgPGNvZGU+JHt0ZXh0fTwvY29kZT5gO1xuICB9XG5cbiAgYnIoKSB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy54aHRtbCA/ICc8YnIvPicgOiAnPGJyPic7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IHRleHRcbiAgICovXG4gIGRlbCh0ZXh0KSB7XG4gICAgcmV0dXJuIGA8ZGVsPiR7dGV4dH08L2RlbD5gO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBocmVmXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0aXRsZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGV4dFxuICAgKi9cbiAgbGluayhocmVmLCB0aXRsZSwgdGV4dCkge1xuICAgIGhyZWYgPSBjbGVhblVybCh0aGlzLm9wdGlvbnMuc2FuaXRpemUsIHRoaXMub3B0aW9ucy5iYXNlVXJsLCBocmVmKTtcbiAgICBpZiAoaHJlZiA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRleHQ7XG4gICAgfVxuICAgIGxldCBvdXQgPSAnPGEgaHJlZj1cIicgKyBocmVmICsgJ1wiJztcbiAgICBpZiAodGl0bGUpIHtcbiAgICAgIG91dCArPSAnIHRpdGxlPVwiJyArIHRpdGxlICsgJ1wiJztcbiAgICB9XG4gICAgb3V0ICs9ICc+JyArIHRleHQgKyAnPC9hPic7XG4gICAgcmV0dXJuIG91dDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gaHJlZlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGl0bGVcbiAgICogQHBhcmFtIHtzdHJpbmd9IHRleHRcbiAgICovXG4gIGltYWdlKGhyZWYsIHRpdGxlLCB0ZXh0KSB7XG4gICAgaHJlZiA9IGNsZWFuVXJsKHRoaXMub3B0aW9ucy5zYW5pdGl6ZSwgdGhpcy5vcHRpb25zLmJhc2VVcmwsIGhyZWYpO1xuICAgIGlmIChocmVmID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gdGV4dDtcbiAgICB9XG5cbiAgICBsZXQgb3V0ID0gYDxpbWcgc3JjPVwiJHtocmVmfVwiIGFsdD1cIiR7dGV4dH1cImA7XG4gICAgaWYgKHRpdGxlKSB7XG4gICAgICBvdXQgKz0gYCB0aXRsZT1cIiR7dGl0bGV9XCJgO1xuICAgIH1cbiAgICBvdXQgKz0gdGhpcy5vcHRpb25zLnhodG1sID8gJy8+JyA6ICc+JztcbiAgICByZXR1cm4gb3V0O1xuICB9XG5cbiAgdGV4dCh0ZXh0KSB7XG4gICAgcmV0dXJuIHRleHQ7XG4gIH1cbn1cblxuLyoqXG4gKiBUZXh0UmVuZGVyZXJcbiAqIHJldHVybnMgb25seSB0aGUgdGV4dHVhbCBwYXJ0IG9mIHRoZSB0b2tlblxuICovXG5jbGFzcyBUZXh0UmVuZGVyZXIge1xuICAvLyBubyBuZWVkIGZvciBibG9jayBsZXZlbCByZW5kZXJlcnNcbiAgc3Ryb25nKHRleHQpIHtcbiAgICByZXR1cm4gdGV4dDtcbiAgfVxuXG4gIGVtKHRleHQpIHtcbiAgICByZXR1cm4gdGV4dDtcbiAgfVxuXG4gIGNvZGVzcGFuKHRleHQpIHtcbiAgICByZXR1cm4gdGV4dDtcbiAgfVxuXG4gIGRlbCh0ZXh0KSB7XG4gICAgcmV0dXJuIHRleHQ7XG4gIH1cblxuICBodG1sKHRleHQpIHtcbiAgICByZXR1cm4gdGV4dDtcbiAgfVxuXG4gIHRleHQodGV4dCkge1xuICAgIHJldHVybiB0ZXh0O1xuICB9XG5cbiAgbGluayhocmVmLCB0aXRsZSwgdGV4dCkge1xuICAgIHJldHVybiAnJyArIHRleHQ7XG4gIH1cblxuICBpbWFnZShocmVmLCB0aXRsZSwgdGV4dCkge1xuICAgIHJldHVybiAnJyArIHRleHQ7XG4gIH1cblxuICBicigpIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cbn1cblxuLyoqXG4gKiBTbHVnZ2VyIGdlbmVyYXRlcyBoZWFkZXIgaWRcbiAqL1xuY2xhc3MgU2x1Z2dlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuc2VlbiA9IHt9O1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZVxuICAgKi9cbiAgc2VyaWFsaXplKHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlXG4gICAgICAudG9Mb3dlckNhc2UoKVxuICAgICAgLnRyaW0oKVxuICAgICAgLy8gcmVtb3ZlIGh0bWwgdGFnc1xuICAgICAgLnJlcGxhY2UoLzxbIVxcL2Etel0uKj8+L2lnLCAnJylcbiAgICAgIC8vIHJlbW92ZSB1bndhbnRlZCBjaGFyc1xuICAgICAgLnJlcGxhY2UoL1tcXHUyMDAwLVxcdTIwNkZcXHUyRTAwLVxcdTJFN0ZcXFxcJyFcIiMkJSYoKSorLC4vOjs8PT4/QFtcXF1eYHt8fX5dL2csICcnKVxuICAgICAgLnJlcGxhY2UoL1xccy9nLCAnLScpO1xuICB9XG5cbiAgLyoqXG4gICAqIEZpbmRzIHRoZSBuZXh0IHNhZmUgKHVuaXF1ZSkgc2x1ZyB0byB1c2VcbiAgICogQHBhcmFtIHtzdHJpbmd9IG9yaWdpbmFsU2x1Z1xuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzRHJ5UnVuXG4gICAqL1xuICBnZXROZXh0U2FmZVNsdWcob3JpZ2luYWxTbHVnLCBpc0RyeVJ1bikge1xuICAgIGxldCBzbHVnID0gb3JpZ2luYWxTbHVnO1xuICAgIGxldCBvY2N1cmVuY2VBY2N1bXVsYXRvciA9IDA7XG4gICAgaWYgKHRoaXMuc2Vlbi5oYXNPd25Qcm9wZXJ0eShzbHVnKSkge1xuICAgICAgb2NjdXJlbmNlQWNjdW11bGF0b3IgPSB0aGlzLnNlZW5bb3JpZ2luYWxTbHVnXTtcbiAgICAgIGRvIHtcbiAgICAgICAgb2NjdXJlbmNlQWNjdW11bGF0b3IrKztcbiAgICAgICAgc2x1ZyA9IG9yaWdpbmFsU2x1ZyArICctJyArIG9jY3VyZW5jZUFjY3VtdWxhdG9yO1xuICAgICAgfSB3aGlsZSAodGhpcy5zZWVuLmhhc093blByb3BlcnR5KHNsdWcpKTtcbiAgICB9XG4gICAgaWYgKCFpc0RyeVJ1bikge1xuICAgICAgdGhpcy5zZWVuW29yaWdpbmFsU2x1Z10gPSBvY2N1cmVuY2VBY2N1bXVsYXRvcjtcbiAgICAgIHRoaXMuc2VlbltzbHVnXSA9IDA7XG4gICAgfVxuICAgIHJldHVybiBzbHVnO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnQgc3RyaW5nIHRvIHVuaXF1ZSBpZFxuICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuZHJ5cnVuXSBHZW5lcmF0ZXMgdGhlIG5leHQgdW5pcXVlIHNsdWcgd2l0aG91dFxuICAgKiB1cGRhdGluZyB0aGUgaW50ZXJuYWwgYWNjdW11bGF0b3IuXG4gICAqL1xuICBzbHVnKHZhbHVlLCBvcHRpb25zID0ge30pIHtcbiAgICBjb25zdCBzbHVnID0gdGhpcy5zZXJpYWxpemUodmFsdWUpO1xuICAgIHJldHVybiB0aGlzLmdldE5leHRTYWZlU2x1ZyhzbHVnLCBvcHRpb25zLmRyeXJ1bik7XG4gIH1cbn1cblxuLyoqXG4gKiBQYXJzaW5nICYgQ29tcGlsaW5nXG4gKi9cbmNsYXNzIFBhcnNlciB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IGRlZmF1bHRzO1xuICAgIHRoaXMub3B0aW9ucy5yZW5kZXJlciA9IHRoaXMub3B0aW9ucy5yZW5kZXJlciB8fCBuZXcgUmVuZGVyZXIoKTtcbiAgICB0aGlzLnJlbmRlcmVyID0gdGhpcy5vcHRpb25zLnJlbmRlcmVyO1xuICAgIHRoaXMucmVuZGVyZXIub3B0aW9ucyA9IHRoaXMub3B0aW9ucztcbiAgICB0aGlzLnRleHRSZW5kZXJlciA9IG5ldyBUZXh0UmVuZGVyZXIoKTtcbiAgICB0aGlzLnNsdWdnZXIgPSBuZXcgU2x1Z2dlcigpO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YXRpYyBQYXJzZSBNZXRob2RcbiAgICovXG4gIHN0YXRpYyBwYXJzZSh0b2tlbnMsIG9wdGlvbnMpIHtcbiAgICBjb25zdCBwYXJzZXIgPSBuZXcgUGFyc2VyKG9wdGlvbnMpO1xuICAgIHJldHVybiBwYXJzZXIucGFyc2UodG9rZW5zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGF0aWMgUGFyc2UgSW5saW5lIE1ldGhvZFxuICAgKi9cbiAgc3RhdGljIHBhcnNlSW5saW5lKHRva2Vucywgb3B0aW9ucykge1xuICAgIGNvbnN0IHBhcnNlciA9IG5ldyBQYXJzZXIob3B0aW9ucyk7XG4gICAgcmV0dXJuIHBhcnNlci5wYXJzZUlubGluZSh0b2tlbnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFBhcnNlIExvb3BcbiAgICovXG4gIHBhcnNlKHRva2VucywgdG9wID0gdHJ1ZSkge1xuICAgIGxldCBvdXQgPSAnJyxcbiAgICAgIGksXG4gICAgICBqLFxuICAgICAgayxcbiAgICAgIGwyLFxuICAgICAgbDMsXG4gICAgICByb3csXG4gICAgICBjZWxsLFxuICAgICAgaGVhZGVyLFxuICAgICAgYm9keSxcbiAgICAgIHRva2VuLFxuICAgICAgb3JkZXJlZCxcbiAgICAgIHN0YXJ0LFxuICAgICAgbG9vc2UsXG4gICAgICBpdGVtQm9keSxcbiAgICAgIGl0ZW0sXG4gICAgICBjaGVja2VkLFxuICAgICAgdGFzayxcbiAgICAgIGNoZWNrYm94LFxuICAgICAgcmV0O1xuXG4gICAgY29uc3QgbCA9IHRva2Vucy5sZW5ndGg7XG4gICAgZm9yIChpID0gMDsgaSA8IGw7IGkrKykge1xuICAgICAgdG9rZW4gPSB0b2tlbnNbaV07XG5cbiAgICAgIC8vIFJ1biBhbnkgcmVuZGVyZXIgZXh0ZW5zaW9uc1xuICAgICAgaWYgKHRoaXMub3B0aW9ucy5leHRlbnNpb25zICYmIHRoaXMub3B0aW9ucy5leHRlbnNpb25zLnJlbmRlcmVycyAmJiB0aGlzLm9wdGlvbnMuZXh0ZW5zaW9ucy5yZW5kZXJlcnNbdG9rZW4udHlwZV0pIHtcbiAgICAgICAgcmV0ID0gdGhpcy5vcHRpb25zLmV4dGVuc2lvbnMucmVuZGVyZXJzW3Rva2VuLnR5cGVdLmNhbGwoeyBwYXJzZXI6IHRoaXMgfSwgdG9rZW4pO1xuICAgICAgICBpZiAocmV0ICE9PSBmYWxzZSB8fCAhWydzcGFjZScsICdocicsICdoZWFkaW5nJywgJ2NvZGUnLCAndGFibGUnLCAnYmxvY2txdW90ZScsICdsaXN0JywgJ2h0bWwnLCAncGFyYWdyYXBoJywgJ3RleHQnXS5pbmNsdWRlcyh0b2tlbi50eXBlKSkge1xuICAgICAgICAgIG91dCArPSByZXQgfHwgJyc7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgc3dpdGNoICh0b2tlbi50eXBlKSB7XG4gICAgICAgIGNhc2UgJ3NwYWNlJzoge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgJ2hyJzoge1xuICAgICAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLmhyKCk7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAnaGVhZGluZyc6IHtcbiAgICAgICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5oZWFkaW5nKFxuICAgICAgICAgICAgdGhpcy5wYXJzZUlubGluZSh0b2tlbi50b2tlbnMpLFxuICAgICAgICAgICAgdG9rZW4uZGVwdGgsXG4gICAgICAgICAgICB1bmVzY2FwZSh0aGlzLnBhcnNlSW5saW5lKHRva2VuLnRva2VucywgdGhpcy50ZXh0UmVuZGVyZXIpKSxcbiAgICAgICAgICAgIHRoaXMuc2x1Z2dlcik7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAnY29kZSc6IHtcbiAgICAgICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5jb2RlKHRva2VuLnRleHQsXG4gICAgICAgICAgICB0b2tlbi5sYW5nLFxuICAgICAgICAgICAgdG9rZW4uZXNjYXBlZCk7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAndGFibGUnOiB7XG4gICAgICAgICAgaGVhZGVyID0gJyc7XG5cbiAgICAgICAgICAvLyBoZWFkZXJcbiAgICAgICAgICBjZWxsID0gJyc7XG4gICAgICAgICAgbDIgPSB0b2tlbi5oZWFkZXIubGVuZ3RoO1xuICAgICAgICAgIGZvciAoaiA9IDA7IGogPCBsMjsgaisrKSB7XG4gICAgICAgICAgICBjZWxsICs9IHRoaXMucmVuZGVyZXIudGFibGVjZWxsKFxuICAgICAgICAgICAgICB0aGlzLnBhcnNlSW5saW5lKHRva2VuLmhlYWRlcltqXS50b2tlbnMpLFxuICAgICAgICAgICAgICB7IGhlYWRlcjogdHJ1ZSwgYWxpZ246IHRva2VuLmFsaWduW2pdIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGhlYWRlciArPSB0aGlzLnJlbmRlcmVyLnRhYmxlcm93KGNlbGwpO1xuXG4gICAgICAgICAgYm9keSA9ICcnO1xuICAgICAgICAgIGwyID0gdG9rZW4ucm93cy5sZW5ndGg7XG4gICAgICAgICAgZm9yIChqID0gMDsgaiA8IGwyOyBqKyspIHtcbiAgICAgICAgICAgIHJvdyA9IHRva2VuLnJvd3Nbal07XG5cbiAgICAgICAgICAgIGNlbGwgPSAnJztcbiAgICAgICAgICAgIGwzID0gcm93Lmxlbmd0aDtcbiAgICAgICAgICAgIGZvciAoayA9IDA7IGsgPCBsMzsgaysrKSB7XG4gICAgICAgICAgICAgIGNlbGwgKz0gdGhpcy5yZW5kZXJlci50YWJsZWNlbGwoXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJzZUlubGluZShyb3dba10udG9rZW5zKSxcbiAgICAgICAgICAgICAgICB7IGhlYWRlcjogZmFsc2UsIGFsaWduOiB0b2tlbi5hbGlnbltrXSB9XG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGJvZHkgKz0gdGhpcy5yZW5kZXJlci50YWJsZXJvdyhjZWxsKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIudGFibGUoaGVhZGVyLCBib2R5KTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjYXNlICdibG9ja3F1b3RlJzoge1xuICAgICAgICAgIGJvZHkgPSB0aGlzLnBhcnNlKHRva2VuLnRva2Vucyk7XG4gICAgICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIuYmxvY2txdW90ZShib2R5KTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjYXNlICdsaXN0Jzoge1xuICAgICAgICAgIG9yZGVyZWQgPSB0b2tlbi5vcmRlcmVkO1xuICAgICAgICAgIHN0YXJ0ID0gdG9rZW4uc3RhcnQ7XG4gICAgICAgICAgbG9vc2UgPSB0b2tlbi5sb29zZTtcbiAgICAgICAgICBsMiA9IHRva2VuLml0ZW1zLmxlbmd0aDtcblxuICAgICAgICAgIGJvZHkgPSAnJztcbiAgICAgICAgICBmb3IgKGogPSAwOyBqIDwgbDI7IGorKykge1xuICAgICAgICAgICAgaXRlbSA9IHRva2VuLml0ZW1zW2pdO1xuICAgICAgICAgICAgY2hlY2tlZCA9IGl0ZW0uY2hlY2tlZDtcbiAgICAgICAgICAgIHRhc2sgPSBpdGVtLnRhc2s7XG5cbiAgICAgICAgICAgIGl0ZW1Cb2R5ID0gJyc7XG4gICAgICAgICAgICBpZiAoaXRlbS50YXNrKSB7XG4gICAgICAgICAgICAgIGNoZWNrYm94ID0gdGhpcy5yZW5kZXJlci5jaGVja2JveChjaGVja2VkKTtcbiAgICAgICAgICAgICAgaWYgKGxvb3NlKSB7XG4gICAgICAgICAgICAgICAgaWYgKGl0ZW0udG9rZW5zLmxlbmd0aCA+IDAgJiYgaXRlbS50b2tlbnNbMF0udHlwZSA9PT0gJ3BhcmFncmFwaCcpIHtcbiAgICAgICAgICAgICAgICAgIGl0ZW0udG9rZW5zWzBdLnRleHQgPSBjaGVja2JveCArICcgJyArIGl0ZW0udG9rZW5zWzBdLnRleHQ7XG4gICAgICAgICAgICAgICAgICBpZiAoaXRlbS50b2tlbnNbMF0udG9rZW5zICYmIGl0ZW0udG9rZW5zWzBdLnRva2Vucy5sZW5ndGggPiAwICYmIGl0ZW0udG9rZW5zWzBdLnRva2Vuc1swXS50eXBlID09PSAndGV4dCcpIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbS50b2tlbnNbMF0udG9rZW5zWzBdLnRleHQgPSBjaGVja2JveCArICcgJyArIGl0ZW0udG9rZW5zWzBdLnRva2Vuc1swXS50ZXh0O1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICBpdGVtLnRva2Vucy51bnNoaWZ0KHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3RleHQnLFxuICAgICAgICAgICAgICAgICAgICB0ZXh0OiBjaGVja2JveFxuICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGl0ZW1Cb2R5ICs9IGNoZWNrYm94O1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGl0ZW1Cb2R5ICs9IHRoaXMucGFyc2UoaXRlbS50b2tlbnMsIGxvb3NlKTtcbiAgICAgICAgICAgIGJvZHkgKz0gdGhpcy5yZW5kZXJlci5saXN0aXRlbShpdGVtQm9keSwgdGFzaywgY2hlY2tlZCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIubGlzdChib2R5LCBvcmRlcmVkLCBzdGFydCk7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAnaHRtbCc6IHtcbiAgICAgICAgICAvLyBUT0RPIHBhcnNlIGlubGluZSBjb250ZW50IGlmIHBhcmFtZXRlciBtYXJrZG93bj0xXG4gICAgICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIuaHRtbCh0b2tlbi50ZXh0KTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjYXNlICdwYXJhZ3JhcGgnOiB7XG4gICAgICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIucGFyYWdyYXBoKHRoaXMucGFyc2VJbmxpbmUodG9rZW4udG9rZW5zKSk7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAndGV4dCc6IHtcbiAgICAgICAgICBib2R5ID0gdG9rZW4udG9rZW5zID8gdGhpcy5wYXJzZUlubGluZSh0b2tlbi50b2tlbnMpIDogdG9rZW4udGV4dDtcbiAgICAgICAgICB3aGlsZSAoaSArIDEgPCBsICYmIHRva2Vuc1tpICsgMV0udHlwZSA9PT0gJ3RleHQnKSB7XG4gICAgICAgICAgICB0b2tlbiA9IHRva2Vuc1srK2ldO1xuICAgICAgICAgICAgYm9keSArPSAnXFxuJyArICh0b2tlbi50b2tlbnMgPyB0aGlzLnBhcnNlSW5saW5lKHRva2VuLnRva2VucykgOiB0b2tlbi50ZXh0KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgb3V0ICs9IHRvcCA/IHRoaXMucmVuZGVyZXIucGFyYWdyYXBoKGJvZHkpIDogYm9keTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICBjb25zdCBlcnJNc2cgPSAnVG9rZW4gd2l0aCBcIicgKyB0b2tlbi50eXBlICsgJ1wiIHR5cGUgd2FzIG5vdCBmb3VuZC4nO1xuICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuc2lsZW50KSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVyck1zZyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJNc2cpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBvdXQ7XG4gIH1cblxuICAvKipcbiAgICogUGFyc2UgSW5saW5lIFRva2Vuc1xuICAgKi9cbiAgcGFyc2VJbmxpbmUodG9rZW5zLCByZW5kZXJlcikge1xuICAgIHJlbmRlcmVyID0gcmVuZGVyZXIgfHwgdGhpcy5yZW5kZXJlcjtcbiAgICBsZXQgb3V0ID0gJycsXG4gICAgICBpLFxuICAgICAgdG9rZW4sXG4gICAgICByZXQ7XG5cbiAgICBjb25zdCBsID0gdG9rZW5zLmxlbmd0aDtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgICB0b2tlbiA9IHRva2Vuc1tpXTtcblxuICAgICAgLy8gUnVuIGFueSByZW5kZXJlciBleHRlbnNpb25zXG4gICAgICBpZiAodGhpcy5vcHRpb25zLmV4dGVuc2lvbnMgJiYgdGhpcy5vcHRpb25zLmV4dGVuc2lvbnMucmVuZGVyZXJzICYmIHRoaXMub3B0aW9ucy5leHRlbnNpb25zLnJlbmRlcmVyc1t0b2tlbi50eXBlXSkge1xuICAgICAgICByZXQgPSB0aGlzLm9wdGlvbnMuZXh0ZW5zaW9ucy5yZW5kZXJlcnNbdG9rZW4udHlwZV0uY2FsbCh7IHBhcnNlcjogdGhpcyB9LCB0b2tlbik7XG4gICAgICAgIGlmIChyZXQgIT09IGZhbHNlIHx8ICFbJ2VzY2FwZScsICdodG1sJywgJ2xpbmsnLCAnaW1hZ2UnLCAnc3Ryb25nJywgJ2VtJywgJ2NvZGVzcGFuJywgJ2JyJywgJ2RlbCcsICd0ZXh0J10uaW5jbHVkZXModG9rZW4udHlwZSkpIHtcbiAgICAgICAgICBvdXQgKz0gcmV0IHx8ICcnO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHN3aXRjaCAodG9rZW4udHlwZSkge1xuICAgICAgICBjYXNlICdlc2NhcGUnOiB7XG4gICAgICAgICAgb3V0ICs9IHJlbmRlcmVyLnRleHQodG9rZW4udGV4dCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAnaHRtbCc6IHtcbiAgICAgICAgICBvdXQgKz0gcmVuZGVyZXIuaHRtbCh0b2tlbi50ZXh0KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjYXNlICdsaW5rJzoge1xuICAgICAgICAgIG91dCArPSByZW5kZXJlci5saW5rKHRva2VuLmhyZWYsIHRva2VuLnRpdGxlLCB0aGlzLnBhcnNlSW5saW5lKHRva2VuLnRva2VucywgcmVuZGVyZXIpKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjYXNlICdpbWFnZSc6IHtcbiAgICAgICAgICBvdXQgKz0gcmVuZGVyZXIuaW1hZ2UodG9rZW4uaHJlZiwgdG9rZW4udGl0bGUsIHRva2VuLnRleHQpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgJ3N0cm9uZyc6IHtcbiAgICAgICAgICBvdXQgKz0gcmVuZGVyZXIuc3Ryb25nKHRoaXMucGFyc2VJbmxpbmUodG9rZW4udG9rZW5zLCByZW5kZXJlcikpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgJ2VtJzoge1xuICAgICAgICAgIG91dCArPSByZW5kZXJlci5lbSh0aGlzLnBhcnNlSW5saW5lKHRva2VuLnRva2VucywgcmVuZGVyZXIpKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjYXNlICdjb2Rlc3Bhbic6IHtcbiAgICAgICAgICBvdXQgKz0gcmVuZGVyZXIuY29kZXNwYW4odG9rZW4udGV4dCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAnYnInOiB7XG4gICAgICAgICAgb3V0ICs9IHJlbmRlcmVyLmJyKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAnZGVsJzoge1xuICAgICAgICAgIG91dCArPSByZW5kZXJlci5kZWwodGhpcy5wYXJzZUlubGluZSh0b2tlbi50b2tlbnMsIHJlbmRlcmVyKSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAndGV4dCc6IHtcbiAgICAgICAgICBvdXQgKz0gcmVuZGVyZXIudGV4dCh0b2tlbi50ZXh0KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBkZWZhdWx0OiB7XG4gICAgICAgICAgY29uc3QgZXJyTXNnID0gJ1Rva2VuIHdpdGggXCInICsgdG9rZW4udHlwZSArICdcIiB0eXBlIHdhcyBub3QgZm91bmQuJztcbiAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnNpbGVudCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJNc2cpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyTXNnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG91dDtcbiAgfVxufVxuXG4vKipcbiAqIE1hcmtlZFxuICovXG5mdW5jdGlvbiBtYXJrZWQoc3JjLCBvcHQsIGNhbGxiYWNrKSB7XG4gIC8vIHRocm93IGVycm9yIGluIGNhc2Ugb2Ygbm9uIHN0cmluZyBpbnB1dFxuICBpZiAodHlwZW9mIHNyYyA9PT0gJ3VuZGVmaW5lZCcgfHwgc3JjID09PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdtYXJrZWQoKTogaW5wdXQgcGFyYW1ldGVyIGlzIHVuZGVmaW5lZCBvciBudWxsJyk7XG4gIH1cbiAgaWYgKHR5cGVvZiBzcmMgIT09ICdzdHJpbmcnKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdtYXJrZWQoKTogaW5wdXQgcGFyYW1ldGVyIGlzIG9mIHR5cGUgJ1xuICAgICAgKyBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoc3JjKSArICcsIHN0cmluZyBleHBlY3RlZCcpO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBvcHQgPT09ICdmdW5jdGlvbicpIHtcbiAgICBjYWxsYmFjayA9IG9wdDtcbiAgICBvcHQgPSBudWxsO1xuICB9XG5cbiAgb3B0ID0gbWVyZ2Uoe30sIG1hcmtlZC5kZWZhdWx0cywgb3B0IHx8IHt9KTtcbiAgY2hlY2tTYW5pdGl6ZURlcHJlY2F0aW9uKG9wdCk7XG5cbiAgaWYgKGNhbGxiYWNrKSB7XG4gICAgY29uc3QgaGlnaGxpZ2h0ID0gb3B0LmhpZ2hsaWdodDtcbiAgICBsZXQgdG9rZW5zO1xuXG4gICAgdHJ5IHtcbiAgICAgIHRva2VucyA9IExleGVyLmxleChzcmMsIG9wdCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIGNhbGxiYWNrKGUpO1xuICAgIH1cblxuICAgIGNvbnN0IGRvbmUgPSBmdW5jdGlvbihlcnIpIHtcbiAgICAgIGxldCBvdXQ7XG5cbiAgICAgIGlmICghZXJyKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgaWYgKG9wdC53YWxrVG9rZW5zKSB7XG4gICAgICAgICAgICBtYXJrZWQud2Fsa1Rva2Vucyh0b2tlbnMsIG9wdC53YWxrVG9rZW5zKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgb3V0ID0gUGFyc2VyLnBhcnNlKHRva2Vucywgb3B0KTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIGVyciA9IGU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgb3B0LmhpZ2hsaWdodCA9IGhpZ2hsaWdodDtcblxuICAgICAgcmV0dXJuIGVyclxuICAgICAgICA/IGNhbGxiYWNrKGVycilcbiAgICAgICAgOiBjYWxsYmFjayhudWxsLCBvdXQpO1xuICAgIH07XG5cbiAgICBpZiAoIWhpZ2hsaWdodCB8fCBoaWdobGlnaHQubGVuZ3RoIDwgMykge1xuICAgICAgcmV0dXJuIGRvbmUoKTtcbiAgICB9XG5cbiAgICBkZWxldGUgb3B0LmhpZ2hsaWdodDtcblxuICAgIGlmICghdG9rZW5zLmxlbmd0aCkgcmV0dXJuIGRvbmUoKTtcblxuICAgIGxldCBwZW5kaW5nID0gMDtcbiAgICBtYXJrZWQud2Fsa1Rva2Vucyh0b2tlbnMsIGZ1bmN0aW9uKHRva2VuKSB7XG4gICAgICBpZiAodG9rZW4udHlwZSA9PT0gJ2NvZGUnKSB7XG4gICAgICAgIHBlbmRpbmcrKztcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgaGlnaGxpZ2h0KHRva2VuLnRleHQsIHRva2VuLmxhbmcsIGZ1bmN0aW9uKGVyciwgY29kZSkge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICByZXR1cm4gZG9uZShlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGNvZGUgIT0gbnVsbCAmJiBjb2RlICE9PSB0b2tlbi50ZXh0KSB7XG4gICAgICAgICAgICAgIHRva2VuLnRleHQgPSBjb2RlO1xuICAgICAgICAgICAgICB0b2tlbi5lc2NhcGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcGVuZGluZy0tO1xuICAgICAgICAgICAgaWYgKHBlbmRpbmcgPT09IDApIHtcbiAgICAgICAgICAgICAgZG9uZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9LCAwKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGlmIChwZW5kaW5nID09PSAwKSB7XG4gICAgICBkb25lKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuO1xuICB9XG5cbiAgZnVuY3Rpb24gb25FcnJvcihlKSB7XG4gICAgZS5tZXNzYWdlICs9ICdcXG5QbGVhc2UgcmVwb3J0IHRoaXMgdG8gaHR0cHM6Ly9naXRodWIuY29tL21hcmtlZGpzL21hcmtlZC4nO1xuICAgIGlmIChvcHQuc2lsZW50KSB7XG4gICAgICByZXR1cm4gJzxwPkFuIGVycm9yIG9jY3VycmVkOjwvcD48cHJlPidcbiAgICAgICAgKyBlc2NhcGUoZS5tZXNzYWdlICsgJycsIHRydWUpXG4gICAgICAgICsgJzwvcHJlPic7XG4gICAgfVxuICAgIHRocm93IGU7XG4gIH1cblxuICB0cnkge1xuICAgIGNvbnN0IHRva2VucyA9IExleGVyLmxleChzcmMsIG9wdCk7XG4gICAgaWYgKG9wdC53YWxrVG9rZW5zKSB7XG4gICAgICBpZiAob3B0LmFzeW5jKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLmFsbChtYXJrZWQud2Fsa1Rva2Vucyh0b2tlbnMsIG9wdC53YWxrVG9rZW5zKSlcbiAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gUGFyc2VyLnBhcnNlKHRva2Vucywgb3B0KTtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5jYXRjaChvbkVycm9yKTtcbiAgICAgIH1cbiAgICAgIG1hcmtlZC53YWxrVG9rZW5zKHRva2Vucywgb3B0LndhbGtUb2tlbnMpO1xuICAgIH1cbiAgICByZXR1cm4gUGFyc2VyLnBhcnNlKHRva2Vucywgb3B0KTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIG9uRXJyb3IoZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBPcHRpb25zXG4gKi9cblxubWFya2VkLm9wdGlvbnMgPVxubWFya2VkLnNldE9wdGlvbnMgPSBmdW5jdGlvbihvcHQpIHtcbiAgbWVyZ2UobWFya2VkLmRlZmF1bHRzLCBvcHQpO1xuICBjaGFuZ2VEZWZhdWx0cyhtYXJrZWQuZGVmYXVsdHMpO1xuICByZXR1cm4gbWFya2VkO1xufTtcblxubWFya2VkLmdldERlZmF1bHRzID0gZ2V0RGVmYXVsdHM7XG5cbm1hcmtlZC5kZWZhdWx0cyA9IGRlZmF1bHRzO1xuXG4vKipcbiAqIFVzZSBFeHRlbnNpb25cbiAqL1xuXG5tYXJrZWQudXNlID0gZnVuY3Rpb24oLi4uYXJncykge1xuICBjb25zdCBleHRlbnNpb25zID0gbWFya2VkLmRlZmF1bHRzLmV4dGVuc2lvbnMgfHwgeyByZW5kZXJlcnM6IHt9LCBjaGlsZFRva2Vuczoge30gfTtcblxuICBhcmdzLmZvckVhY2goKHBhY2spID0+IHtcbiAgICAvLyBjb3B5IG9wdGlvbnMgdG8gbmV3IG9iamVjdFxuICAgIGNvbnN0IG9wdHMgPSBtZXJnZSh7fSwgcGFjayk7XG5cbiAgICAvLyBzZXQgYXN5bmMgdG8gdHJ1ZSBpZiBpdCB3YXMgc2V0IHRvIHRydWUgYmVmb3JlXG4gICAgb3B0cy5hc3luYyA9IG1hcmtlZC5kZWZhdWx0cy5hc3luYyB8fCBvcHRzLmFzeW5jO1xuXG4gICAgLy8gPT0tLSBQYXJzZSBcImFkZG9uXCIgZXh0ZW5zaW9ucyAtLT09IC8vXG4gICAgaWYgKHBhY2suZXh0ZW5zaW9ucykge1xuICAgICAgcGFjay5leHRlbnNpb25zLmZvckVhY2goKGV4dCkgPT4ge1xuICAgICAgICBpZiAoIWV4dC5uYW1lKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdleHRlbnNpb24gbmFtZSByZXF1aXJlZCcpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChleHQucmVuZGVyZXIpIHsgLy8gUmVuZGVyZXIgZXh0ZW5zaW9uc1xuICAgICAgICAgIGNvbnN0IHByZXZSZW5kZXJlciA9IGV4dGVuc2lvbnMucmVuZGVyZXJzW2V4dC5uYW1lXTtcbiAgICAgICAgICBpZiAocHJldlJlbmRlcmVyKSB7XG4gICAgICAgICAgICAvLyBSZXBsYWNlIGV4dGVuc2lvbiB3aXRoIGZ1bmMgdG8gcnVuIG5ldyBleHRlbnNpb24gYnV0IGZhbGwgYmFjayBpZiBmYWxzZVxuICAgICAgICAgICAgZXh0ZW5zaW9ucy5yZW5kZXJlcnNbZXh0Lm5hbWVdID0gZnVuY3Rpb24oLi4uYXJncykge1xuICAgICAgICAgICAgICBsZXQgcmV0ID0gZXh0LnJlbmRlcmVyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgICAgICBpZiAocmV0ID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHJldCA9IHByZXZSZW5kZXJlci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gcmV0O1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZXh0ZW5zaW9ucy5yZW5kZXJlcnNbZXh0Lm5hbWVdID0gZXh0LnJlbmRlcmVyO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoZXh0LnRva2VuaXplcikgeyAvLyBUb2tlbml6ZXIgRXh0ZW5zaW9uc1xuICAgICAgICAgIGlmICghZXh0LmxldmVsIHx8IChleHQubGV2ZWwgIT09ICdibG9jaycgJiYgZXh0LmxldmVsICE9PSAnaW5saW5lJykpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcImV4dGVuc2lvbiBsZXZlbCBtdXN0IGJlICdibG9jaycgb3IgJ2lubGluZSdcIik7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChleHRlbnNpb25zW2V4dC5sZXZlbF0pIHtcbiAgICAgICAgICAgIGV4dGVuc2lvbnNbZXh0LmxldmVsXS51bnNoaWZ0KGV4dC50b2tlbml6ZXIpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBleHRlbnNpb25zW2V4dC5sZXZlbF0gPSBbZXh0LnRva2VuaXplcl07XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChleHQuc3RhcnQpIHsgLy8gRnVuY3Rpb24gdG8gY2hlY2sgZm9yIHN0YXJ0IG9mIHRva2VuXG4gICAgICAgICAgICBpZiAoZXh0LmxldmVsID09PSAnYmxvY2snKSB7XG4gICAgICAgICAgICAgIGlmIChleHRlbnNpb25zLnN0YXJ0QmxvY2spIHtcbiAgICAgICAgICAgICAgICBleHRlbnNpb25zLnN0YXJ0QmxvY2sucHVzaChleHQuc3RhcnQpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGV4dGVuc2lvbnMuc3RhcnRCbG9jayA9IFtleHQuc3RhcnRdO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGV4dC5sZXZlbCA9PT0gJ2lubGluZScpIHtcbiAgICAgICAgICAgICAgaWYgKGV4dGVuc2lvbnMuc3RhcnRJbmxpbmUpIHtcbiAgICAgICAgICAgICAgICBleHRlbnNpb25zLnN0YXJ0SW5saW5lLnB1c2goZXh0LnN0YXJ0KTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBleHRlbnNpb25zLnN0YXJ0SW5saW5lID0gW2V4dC5zdGFydF07XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGV4dC5jaGlsZFRva2VucykgeyAvLyBDaGlsZCB0b2tlbnMgdG8gYmUgdmlzaXRlZCBieSB3YWxrVG9rZW5zXG4gICAgICAgICAgZXh0ZW5zaW9ucy5jaGlsZFRva2Vuc1tleHQubmFtZV0gPSBleHQuY2hpbGRUb2tlbnM7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgb3B0cy5leHRlbnNpb25zID0gZXh0ZW5zaW9ucztcbiAgICB9XG5cbiAgICAvLyA9PS0tIFBhcnNlIFwib3ZlcndyaXRlXCIgZXh0ZW5zaW9ucyAtLT09IC8vXG4gICAgaWYgKHBhY2sucmVuZGVyZXIpIHtcbiAgICAgIGNvbnN0IHJlbmRlcmVyID0gbWFya2VkLmRlZmF1bHRzLnJlbmRlcmVyIHx8IG5ldyBSZW5kZXJlcigpO1xuICAgICAgZm9yIChjb25zdCBwcm9wIGluIHBhY2sucmVuZGVyZXIpIHtcbiAgICAgICAgY29uc3QgcHJldlJlbmRlcmVyID0gcmVuZGVyZXJbcHJvcF07XG4gICAgICAgIC8vIFJlcGxhY2UgcmVuZGVyZXIgd2l0aCBmdW5jIHRvIHJ1biBleHRlbnNpb24sIGJ1dCBmYWxsIGJhY2sgaWYgZmFsc2VcbiAgICAgICAgcmVuZGVyZXJbcHJvcF0gPSAoLi4uYXJncykgPT4ge1xuICAgICAgICAgIGxldCByZXQgPSBwYWNrLnJlbmRlcmVyW3Byb3BdLmFwcGx5KHJlbmRlcmVyLCBhcmdzKTtcbiAgICAgICAgICBpZiAocmV0ID09PSBmYWxzZSkge1xuICAgICAgICAgICAgcmV0ID0gcHJldlJlbmRlcmVyLmFwcGx5KHJlbmRlcmVyLCBhcmdzKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHJldDtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIG9wdHMucmVuZGVyZXIgPSByZW5kZXJlcjtcbiAgICB9XG4gICAgaWYgKHBhY2sudG9rZW5pemVyKSB7XG4gICAgICBjb25zdCB0b2tlbml6ZXIgPSBtYXJrZWQuZGVmYXVsdHMudG9rZW5pemVyIHx8IG5ldyBUb2tlbml6ZXIoKTtcbiAgICAgIGZvciAoY29uc3QgcHJvcCBpbiBwYWNrLnRva2VuaXplcikge1xuICAgICAgICBjb25zdCBwcmV2VG9rZW5pemVyID0gdG9rZW5pemVyW3Byb3BdO1xuICAgICAgICAvLyBSZXBsYWNlIHRva2VuaXplciB3aXRoIGZ1bmMgdG8gcnVuIGV4dGVuc2lvbiwgYnV0IGZhbGwgYmFjayBpZiBmYWxzZVxuICAgICAgICB0b2tlbml6ZXJbcHJvcF0gPSAoLi4uYXJncykgPT4ge1xuICAgICAgICAgIGxldCByZXQgPSBwYWNrLnRva2VuaXplcltwcm9wXS5hcHBseSh0b2tlbml6ZXIsIGFyZ3MpO1xuICAgICAgICAgIGlmIChyZXQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICByZXQgPSBwcmV2VG9rZW5pemVyLmFwcGx5KHRva2VuaXplciwgYXJncyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiByZXQ7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBvcHRzLnRva2VuaXplciA9IHRva2VuaXplcjtcbiAgICB9XG5cbiAgICAvLyA9PS0tIFBhcnNlIFdhbGtUb2tlbnMgZXh0ZW5zaW9ucyAtLT09IC8vXG4gICAgaWYgKHBhY2sud2Fsa1Rva2Vucykge1xuICAgICAgY29uc3Qgd2Fsa1Rva2VucyA9IG1hcmtlZC5kZWZhdWx0cy53YWxrVG9rZW5zO1xuICAgICAgb3B0cy53YWxrVG9rZW5zID0gZnVuY3Rpb24odG9rZW4pIHtcbiAgICAgICAgbGV0IHZhbHVlcyA9IFtdO1xuICAgICAgICB2YWx1ZXMucHVzaChwYWNrLndhbGtUb2tlbnMuY2FsbCh0aGlzLCB0b2tlbikpO1xuICAgICAgICBpZiAod2Fsa1Rva2Vucykge1xuICAgICAgICAgIHZhbHVlcyA9IHZhbHVlcy5jb25jYXQod2Fsa1Rva2Vucy5jYWxsKHRoaXMsIHRva2VuKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZhbHVlcztcbiAgICAgIH07XG4gICAgfVxuXG4gICAgbWFya2VkLnNldE9wdGlvbnMob3B0cyk7XG4gIH0pO1xufTtcblxuLyoqXG4gKiBSdW4gY2FsbGJhY2sgZm9yIGV2ZXJ5IHRva2VuXG4gKi9cblxubWFya2VkLndhbGtUb2tlbnMgPSBmdW5jdGlvbih0b2tlbnMsIGNhbGxiYWNrKSB7XG4gIGxldCB2YWx1ZXMgPSBbXTtcbiAgZm9yIChjb25zdCB0b2tlbiBvZiB0b2tlbnMpIHtcbiAgICB2YWx1ZXMgPSB2YWx1ZXMuY29uY2F0KGNhbGxiYWNrLmNhbGwobWFya2VkLCB0b2tlbikpO1xuICAgIHN3aXRjaCAodG9rZW4udHlwZSkge1xuICAgICAgY2FzZSAndGFibGUnOiB7XG4gICAgICAgIGZvciAoY29uc3QgY2VsbCBvZiB0b2tlbi5oZWFkZXIpIHtcbiAgICAgICAgICB2YWx1ZXMgPSB2YWx1ZXMuY29uY2F0KG1hcmtlZC53YWxrVG9rZW5zKGNlbGwudG9rZW5zLCBjYWxsYmFjaykpO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3Qgcm93IG9mIHRva2VuLnJvd3MpIHtcbiAgICAgICAgICBmb3IgKGNvbnN0IGNlbGwgb2Ygcm93KSB7XG4gICAgICAgICAgICB2YWx1ZXMgPSB2YWx1ZXMuY29uY2F0KG1hcmtlZC53YWxrVG9rZW5zKGNlbGwudG9rZW5zLCBjYWxsYmFjaykpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGNhc2UgJ2xpc3QnOiB7XG4gICAgICAgIHZhbHVlcyA9IHZhbHVlcy5jb25jYXQobWFya2VkLndhbGtUb2tlbnModG9rZW4uaXRlbXMsIGNhbGxiYWNrKSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgZGVmYXVsdDoge1xuICAgICAgICBpZiAobWFya2VkLmRlZmF1bHRzLmV4dGVuc2lvbnMgJiYgbWFya2VkLmRlZmF1bHRzLmV4dGVuc2lvbnMuY2hpbGRUb2tlbnMgJiYgbWFya2VkLmRlZmF1bHRzLmV4dGVuc2lvbnMuY2hpbGRUb2tlbnNbdG9rZW4udHlwZV0pIHsgLy8gV2FsayBhbnkgZXh0ZW5zaW9uc1xuICAgICAgICAgIG1hcmtlZC5kZWZhdWx0cy5leHRlbnNpb25zLmNoaWxkVG9rZW5zW3Rva2VuLnR5cGVdLmZvckVhY2goZnVuY3Rpb24oY2hpbGRUb2tlbnMpIHtcbiAgICAgICAgICAgIHZhbHVlcyA9IHZhbHVlcy5jb25jYXQobWFya2VkLndhbGtUb2tlbnModG9rZW5bY2hpbGRUb2tlbnNdLCBjYWxsYmFjaykpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKHRva2VuLnRva2Vucykge1xuICAgICAgICAgIHZhbHVlcyA9IHZhbHVlcy5jb25jYXQobWFya2VkLndhbGtUb2tlbnModG9rZW4udG9rZW5zLCBjYWxsYmFjaykpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiB2YWx1ZXM7XG59O1xuXG4vKipcbiAqIFBhcnNlIElubGluZVxuICogQHBhcmFtIHtzdHJpbmd9IHNyY1xuICovXG5tYXJrZWQucGFyc2VJbmxpbmUgPSBmdW5jdGlvbihzcmMsIG9wdCkge1xuICAvLyB0aHJvdyBlcnJvciBpbiBjYXNlIG9mIG5vbiBzdHJpbmcgaW5wdXRcbiAgaWYgKHR5cGVvZiBzcmMgPT09ICd1bmRlZmluZWQnIHx8IHNyYyA9PT0gbnVsbCkge1xuICAgIHRocm93IG5ldyBFcnJvcignbWFya2VkLnBhcnNlSW5saW5lKCk6IGlucHV0IHBhcmFtZXRlciBpcyB1bmRlZmluZWQgb3IgbnVsbCcpO1xuICB9XG4gIGlmICh0eXBlb2Ygc3JjICE9PSAnc3RyaW5nJykge1xuICAgIHRocm93IG5ldyBFcnJvcignbWFya2VkLnBhcnNlSW5saW5lKCk6IGlucHV0IHBhcmFtZXRlciBpcyBvZiB0eXBlICdcbiAgICAgICsgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHNyYykgKyAnLCBzdHJpbmcgZXhwZWN0ZWQnKTtcbiAgfVxuXG4gIG9wdCA9IG1lcmdlKHt9LCBtYXJrZWQuZGVmYXVsdHMsIG9wdCB8fCB7fSk7XG4gIGNoZWNrU2FuaXRpemVEZXByZWNhdGlvbihvcHQpO1xuXG4gIHRyeSB7XG4gICAgY29uc3QgdG9rZW5zID0gTGV4ZXIubGV4SW5saW5lKHNyYywgb3B0KTtcbiAgICBpZiAob3B0LndhbGtUb2tlbnMpIHtcbiAgICAgIG1hcmtlZC53YWxrVG9rZW5zKHRva2Vucywgb3B0LndhbGtUb2tlbnMpO1xuICAgIH1cbiAgICByZXR1cm4gUGFyc2VyLnBhcnNlSW5saW5lKHRva2Vucywgb3B0KTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGUubWVzc2FnZSArPSAnXFxuUGxlYXNlIHJlcG9ydCB0aGlzIHRvIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXJrZWRqcy9tYXJrZWQuJztcbiAgICBpZiAob3B0LnNpbGVudCkge1xuICAgICAgcmV0dXJuICc8cD5BbiBlcnJvciBvY2N1cnJlZDo8L3A+PHByZT4nXG4gICAgICAgICsgZXNjYXBlKGUubWVzc2FnZSArICcnLCB0cnVlKVxuICAgICAgICArICc8L3ByZT4nO1xuICAgIH1cbiAgICB0aHJvdyBlO1xuICB9XG59O1xuXG4vKipcbiAqIEV4cG9zZVxuICovXG5tYXJrZWQuUGFyc2VyID0gUGFyc2VyO1xubWFya2VkLnBhcnNlciA9IFBhcnNlci5wYXJzZTtcbm1hcmtlZC5SZW5kZXJlciA9IFJlbmRlcmVyO1xubWFya2VkLlRleHRSZW5kZXJlciA9IFRleHRSZW5kZXJlcjtcbm1hcmtlZC5MZXhlciA9IExleGVyO1xubWFya2VkLmxleGVyID0gTGV4ZXIubGV4O1xubWFya2VkLlRva2VuaXplciA9IFRva2VuaXplcjtcbm1hcmtlZC5TbHVnZ2VyID0gU2x1Z2dlcjtcbm1hcmtlZC5wYXJzZSA9IG1hcmtlZDtcblxuY29uc3Qgb3B0aW9ucyA9IG1hcmtlZC5vcHRpb25zO1xuY29uc3Qgc2V0T3B0aW9ucyA9IG1hcmtlZC5zZXRPcHRpb25zO1xuY29uc3QgdXNlID0gbWFya2VkLnVzZTtcbmNvbnN0IHdhbGtUb2tlbnMgPSBtYXJrZWQud2Fsa1Rva2VucztcbmNvbnN0IHBhcnNlSW5saW5lID0gbWFya2VkLnBhcnNlSW5saW5lO1xuY29uc3QgcGFyc2UgPSBtYXJrZWQ7XG5jb25zdCBwYXJzZXIgPSBQYXJzZXIucGFyc2U7XG5jb25zdCBsZXhlciA9IExleGVyLmxleDtcblxuZXhwb3J0IHsgTGV4ZXIsIFBhcnNlciwgUmVuZGVyZXIsIFNsdWdnZXIsIFRleHRSZW5kZXJlciwgVG9rZW5pemVyLCBkZWZhdWx0cywgZ2V0RGVmYXVsdHMsIGxleGVyLCBtYXJrZWQsIG9wdGlvbnMsIHBhcnNlLCBwYXJzZUlubGluZSwgcGFyc2VyLCBzZXRPcHRpb25zLCB1c2UsIHdhbGtUb2tlbnMgfTtcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuX193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG5cdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuXHRcdGZ1bmN0aW9uKCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuXHRcdGZ1bmN0aW9uKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCB7IGE6IGdldHRlciB9KTtcblx0cmV0dXJuIGdldHRlcjtcbn07IiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgZGVmaW5pdGlvbikge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmosIHByb3ApIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApOyB9IiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJ2YXIgX19hc3NpZ24gPSAodGhpcyAmJiB0aGlzLl9fYXNzaWduKSB8fCBmdW5jdGlvbiAoKSB7XG4gICAgX19hc3NpZ24gPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uKHQpIHtcbiAgICAgICAgZm9yICh2YXIgcywgaSA9IDEsIG4gPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbjsgaSsrKSB7XG4gICAgICAgICAgICBzID0gYXJndW1lbnRzW2ldO1xuICAgICAgICAgICAgZm9yICh2YXIgcCBpbiBzKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHMsIHApKVxuICAgICAgICAgICAgICAgIHRbcF0gPSBzW3BdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0O1xuICAgIH07XG4gICAgcmV0dXJuIF9fYXNzaWduLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59O1xudmFyIF9fYXdhaXRlciA9ICh0aGlzICYmIHRoaXMuX19hd2FpdGVyKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogYWRvcHQocmVzdWx0LnZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcbiAgICB9KTtcbn07XG52YXIgX19nZW5lcmF0b3IgPSAodGhpcyAmJiB0aGlzLl9fZ2VuZXJhdG9yKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgYm9keSkge1xuICAgIHZhciBfID0geyBsYWJlbDogMCwgc2VudDogZnVuY3Rpb24oKSB7IGlmICh0WzBdICYgMSkgdGhyb3cgdFsxXTsgcmV0dXJuIHRbMV07IH0sIHRyeXM6IFtdLCBvcHM6IFtdIH0sIGYsIHksIHQsIGc7XG4gICAgcmV0dXJuIGcgPSB7IG5leHQ6IHZlcmIoMCksIFwidGhyb3dcIjogdmVyYigxKSwgXCJyZXR1cm5cIjogdmVyYigyKSB9LCB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgKGdbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpczsgfSksIGc7XG4gICAgZnVuY3Rpb24gdmVyYihuKSB7IHJldHVybiBmdW5jdGlvbiAodikgeyByZXR1cm4gc3RlcChbbiwgdl0pOyB9OyB9XG4gICAgZnVuY3Rpb24gc3RlcChvcCkge1xuICAgICAgICBpZiAoZikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkdlbmVyYXRvciBpcyBhbHJlYWR5IGV4ZWN1dGluZy5cIik7XG4gICAgICAgIHdoaWxlIChnICYmIChnID0gMCwgb3BbMF0gJiYgKF8gPSAwKSksIF8pIHRyeSB7XG4gICAgICAgICAgICBpZiAoZiA9IDEsIHkgJiYgKHQgPSBvcFswXSAmIDIgPyB5W1wicmV0dXJuXCJdIDogb3BbMF0gPyB5W1widGhyb3dcIl0gfHwgKCh0ID0geVtcInJldHVyblwiXSkgJiYgdC5jYWxsKHkpLCAwKSA6IHkubmV4dCkgJiYgISh0ID0gdC5jYWxsKHksIG9wWzFdKSkuZG9uZSkgcmV0dXJuIHQ7XG4gICAgICAgICAgICBpZiAoeSA9IDAsIHQpIG9wID0gW29wWzBdICYgMiwgdC52YWx1ZV07XG4gICAgICAgICAgICBzd2l0Y2ggKG9wWzBdKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAwOiBjYXNlIDE6IHQgPSBvcDsgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSA0OiBfLmxhYmVsKys7IHJldHVybiB7IHZhbHVlOiBvcFsxXSwgZG9uZTogZmFsc2UgfTtcbiAgICAgICAgICAgICAgICBjYXNlIDU6IF8ubGFiZWwrKzsgeSA9IG9wWzFdOyBvcCA9IFswXTsgY29udGludWU7XG4gICAgICAgICAgICAgICAgY2FzZSA3OiBvcCA9IF8ub3BzLnBvcCgpOyBfLnRyeXMucG9wKCk7IGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIGlmICghKHQgPSBfLnRyeXMsIHQgPSB0Lmxlbmd0aCA+IDAgJiYgdFt0Lmxlbmd0aCAtIDFdKSAmJiAob3BbMF0gPT09IDYgfHwgb3BbMF0gPT09IDIpKSB7IF8gPSAwOyBjb250aW51ZTsgfVxuICAgICAgICAgICAgICAgICAgICBpZiAob3BbMF0gPT09IDMgJiYgKCF0IHx8IChvcFsxXSA+IHRbMF0gJiYgb3BbMV0gPCB0WzNdKSkpIHsgXy5sYWJlbCA9IG9wWzFdOyBicmVhazsgfVxuICAgICAgICAgICAgICAgICAgICBpZiAob3BbMF0gPT09IDYgJiYgXy5sYWJlbCA8IHRbMV0pIHsgXy5sYWJlbCA9IHRbMV07IHQgPSBvcDsgYnJlYWs7IH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHQgJiYgXy5sYWJlbCA8IHRbMl0pIHsgXy5sYWJlbCA9IHRbMl07IF8ub3BzLnB1c2gob3ApOyBicmVhazsgfVxuICAgICAgICAgICAgICAgICAgICBpZiAodFsyXSkgXy5vcHMucG9wKCk7XG4gICAgICAgICAgICAgICAgICAgIF8udHJ5cy5wb3AoKTsgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvcCA9IGJvZHkuY2FsbCh0aGlzQXJnLCBfKTtcbiAgICAgICAgfSBjYXRjaCAoZSkgeyBvcCA9IFs2LCBlXTsgeSA9IDA7IH0gZmluYWxseSB7IGYgPSB0ID0gMDsgfVxuICAgICAgICBpZiAob3BbMF0gJiA1KSB0aHJvdyBvcFsxXTsgcmV0dXJuIHsgdmFsdWU6IG9wWzBdID8gb3BbMV0gOiB2b2lkIDAsIGRvbmU6IHRydWUgfTtcbiAgICB9XG59O1xuaW1wb3J0IHsgZ2V0X3Jlc2VhcmNoX3RleHQgfSBmcm9tIFwiLi9jaGF0XCI7XG5pbXBvcnQgeyB0aGlzR2FtZSB9IGZyb20gXCIuL2dhbWVcIjtcbmltcG9ydCB7IGdldF9oZXJvIH0gZnJvbSBcIi4vZ2V0X2hlcm9cIjtcbmltcG9ydCB7IGNsaXAsIGxhc3RDbGlwIH0gZnJvbSBcIi4vaG90a2V5XCI7XG5pbXBvcnQgeyByZW5kZXJMZWRnZXIgfSBmcm9tIFwiLi9sZWRnZXJcIjtcbmltcG9ydCB7IG1lcmdlVXNlciB9IGZyb20gXCIuL21lcmdlXCI7XG5pbXBvcnQgeyBpc192YWxpZF9pbWFnZV91cmwsIGlzX3ZhbGlkX3lvdXR1YmUgfSBmcm9tIFwiLi9wYXJzZV91dGlsc1wiO1xuaW1wb3J0IHsgYW55U3RhckNhblNlZSwgZHJhd092ZXJsYXlTdHJpbmcgfSBmcm9tIFwiLi91dGlsaXRpZXMvZ3JhcGhpY3NcIjtcbmltcG9ydCB7IGhvb2tfbnBjX3RpY2tfY291bnRlciB9IGZyb20gXCIuL3V0aWxpdGllcy9ucGNfY2FsY1wiO1xudmFyIFNBVF9WRVJTSU9OID0gXCIyLjI4LjIyLWdpdFwiO1xuaWYgKE5lcHR1bmVzUHJpZGUgPT09IHVuZGVmaW5lZCkge1xuICAgIHRoaXNHYW1lLm5lcHR1bmVzUHJpZGUgPSBOZXB0dW5lc1ByaWRlO1xufVxuZnVuY3Rpb24gcG9zdF9ob29rKCkge1xuICAgIC8vY29uc29sZS5sb2coc3RyaW5naWZ5KE5lcHR1bmVzUHJpZGUudW5pdmVyc2UuZ2FsYXh5LmZsZWV0c1syXSxudWxsLCBcIlxcdFwiKSlcbiAgICByZXR1cm4gbnVsbDtcbn1cbi8vVE9ETzogT3JnYW5pemUgdHlwZXNjcmlwdCB0byBhbiBpbnRlcmZhY2VzIGRpcmVjdG9yeVxuLy9UT0RPOiBUaGVuIG1ha2Ugb3RoZXIgZ2FtZSBlbmdpbmUgb2JqZWN0c1xuLy8gUGFydCBvZiB5b3VyIGNvZGUgaXMgcmUtY3JlYXRpbmcgdGhlIGdhbWUgaW4gdHlwZXNjcmlwdFxuLy8gVGhlIG90aGVyIHBhcnQgaXMgYWRkaW5nIGZlYXR1cmVzXG4vLyBUaGVuIHRoZXJlIGlzIGEgc2VnbWVudCB0aGF0IGlzIG92ZXJ3cml0aW5nIGV4aXN0aW5nIGNvbnRlbnQgdG8gYWRkIHNtYWxsIGFkZGl0aW9ucy5cbi8vQWRkIGN1c3RvbSBzZXR0aW5ncyB3aGVuIG1ha2luZyBhIG53ZSBnYW1lLlxuZnVuY3Rpb24gbW9kaWZ5X2N1c3RvbV9nYW1lKCkge1xuICAgIGNvbnNvbGUubG9nKFwiUnVubmluZyBjdXN0b20gZ2FtZSBzZXR0aW5ncyBtb2RpZmljYXRpb25cIik7XG4gICAgdmFyIHNlbGVjdG9yID0gJChcIiNjb250ZW50QXJlYSA+IGRpdiA+IGRpdi53aWRnZXQuZnVsbHNjcmVlbiA+IGRpdi53aWRnZXQucmVsID4gZGl2Om50aC1jaGlsZCg0KSA+IGRpdjpudGgtY2hpbGQoMTUpID4gc2VsZWN0XCIpWzBdO1xuICAgIGlmIChzZWxlY3RvciA9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgLy9Ob3QgaW4gbWVudVxuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0ZXh0U3RyaW5nID0gXCJcIjtcbiAgICBmb3IgKHZhciBpID0gMjsgaSA8PSAzMjsgKytpKSB7XG4gICAgICAgIHRleHRTdHJpbmcgKz0gXCI8b3B0aW9uIHZhbHVlPVxcXCJcIi5jb25jYXQoaSwgXCJcXFwiPlwiKS5jb25jYXQoaSwgXCIgUGxheWVyczwvb3B0aW9uPlwiKTtcbiAgICB9XG4gICAgY29uc29sZS5sb2codGV4dFN0cmluZyk7XG4gICAgc2VsZWN0b3IuaW5uZXJIVE1MID0gdGV4dFN0cmluZztcbn1cbnNldFRpbWVvdXQobW9kaWZ5X2N1c3RvbV9nYW1lLCA1MDApO1xuLy9UT0RPOiBNYWtlIGlzIHdpdGhpbiBzY2FubmluZyBmdW5jdGlvblxuLy9TaGFyZSBhbGwgdGVjaCBkaXNwbGF5IGFzIHRlY2ggaXMgYWN0aXZlbHkgdHJhZGluZy5cbnZhciBkaXNwbGF5X3RlY2hfdHJhZGluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgbnB1aSA9IE5lcHR1bmVzUHJpZGUubnB1aTtcbiAgICB2YXIgdGVjaF90cmFkZV9zY3JlZW4gPSBucHVpLlNjcmVlbihcInRlY2hfdHJhZGluZ1wiKTtcbiAgICBucHVpLm9uSGlkZVNjcmVlbihudWxsLCB0cnVlKTtcbiAgICBucHVpLm9uSGlkZVNlbGVjdGlvbk1lbnUoKTtcbiAgICBucHVpLnRyaWdnZXIoXCJoaWRlX3NpZGVfbWVudVwiKTtcbiAgICBucHVpLnRyaWdnZXIoXCJyZXNldF9lZGl0X21vZGVcIik7XG4gICAgbnB1aS5hY3RpdmVTY3JlZW4gPSB0ZWNoX3RyYWRlX3NjcmVlbjtcbiAgICB0ZWNoX3RyYWRlX3NjcmVlbi5yb29zdChucHVpLnNjcmVlbkNvbnRhaW5lcik7XG4gICAgbnB1aS5sYXlvdXRFbGVtZW50KHRlY2hfdHJhZGVfc2NyZWVuKTtcbiAgICB2YXIgdHJhZGluZyA9IENydXguVGV4dChcIlwiLCBcInJlbCBwYWQxMlwiKS5yYXdIVE1MKFwiVHJhZGluZy4uXCIpO1xuICAgIHRyYWRpbmcucm9vc3QodGVjaF90cmFkZV9zY3JlZW4pO1xuICAgIHRlY2hfdHJhZGVfc2NyZWVuLnRyYW5zYWN0ID0gZnVuY3Rpb24gKHRleHQpIHtcbiAgICAgICAgdmFyIHRyYWRpbmcgPSBDcnV4LlRleHQoXCJcIiwgXCJyZWwgcGFkOFwiKS5yYXdIVE1MKHRleHQpO1xuICAgICAgICB0cmFkaW5nLnJvb3N0KHRlY2hfdHJhZGVfc2NyZWVuKTtcbiAgICB9O1xuICAgIHJldHVybiB0ZWNoX3RyYWRlX3NjcmVlbjtcbn07XG4vL1JldHVybnMgYWxsIHN0YXJzIEkgc3VwcG9zZVxudmFyIF9nZXRfc3Rhcl9naXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHN0YXJzID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5nYWxheHkuc3RhcnM7XG4gICAgdmFyIG91dHB1dCA9IFtdO1xuICAgIGZvciAodmFyIHMgaW4gc3RhcnMpIHtcbiAgICAgICAgdmFyIHN0YXIgPSBzdGFyc1tzXTtcbiAgICAgICAgb3V0cHV0LnB1c2goe1xuICAgICAgICAgICAgeDogc3Rhci54LFxuICAgICAgICAgICAgeTogc3Rhci55LFxuICAgICAgICAgICAgb3duZXI6IHN0YXIucXVhbGlmaWVkQWxpYXMsXG4gICAgICAgICAgICBlY29ub215OiBzdGFyLmUsXG4gICAgICAgICAgICBpbmR1c3RyeTogc3Rhci5pLFxuICAgICAgICAgICAgc2NpZW5jZTogc3Rhci5zLFxuICAgICAgICAgICAgc2hpcHM6IHN0YXIudG90YWxEZWZlbnNlcyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBvdXRwdXQ7XG59O1xudmFyIF9nZXRfd2VhcG9uc19uZXh0ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciByZXNlYXJjaCA9IGdldF9yZXNlYXJjaCgpO1xuICAgIGlmIChyZXNlYXJjaFtcImN1cnJlbnRfbmFtZVwiXSA9PSBcIldlYXBvbnNcIikge1xuICAgICAgICByZXR1cm4gcmVzZWFyY2hbXCJjdXJyZW50X2V0YVwiXTtcbiAgICB9XG4gICAgZWxzZSBpZiAocmVzZWFyY2hbXCJuZXh0X25hbWVcIl0gPT0gXCJXZWFwb25zXCIpIHtcbiAgICAgICAgcmV0dXJuIHJlc2VhcmNoW1wibmV4dF9ldGFcIl07XG4gICAgfVxuICAgIHJldHVybiBNYXRoLnBvdygxMCwgMTApO1xufTtcbnZhciBnZXRfdGVjaF90cmFkZV9jb3N0ID0gZnVuY3Rpb24gKGZyb20sIHRvLCB0ZWNoX25hbWUpIHtcbiAgICBpZiAodGVjaF9uYW1lID09PSB2b2lkIDApIHsgdGVjaF9uYW1lID0gbnVsbDsgfVxuICAgIHZhciB0b3RhbF9jb3N0ID0gMDtcbiAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gT2JqZWN0LmVudHJpZXModG8udGVjaCk7IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgIHZhciBfYiA9IF9hW19pXSwgdGVjaCA9IF9iWzBdLCB2YWx1ZSA9IF9iWzFdO1xuICAgICAgICBpZiAodGVjaF9uYW1lID09IG51bGwgfHwgdGVjaF9uYW1lID09IHRlY2gpIHtcbiAgICAgICAgICAgIHZhciBtZSA9IGZyb20udGVjaFt0ZWNoXS5sZXZlbDtcbiAgICAgICAgICAgIHZhciB5b3UgPSB2YWx1ZS5sZXZlbDtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDw9IG1lIC0geW91OyArK2kpIHtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKHRlY2gsKHlvdStpKSwoeW91K2kpKjE1KVxuICAgICAgICAgICAgICAgIHRvdGFsX2Nvc3QgKz0gKHlvdSArIGkpICogTmVwdHVuZXNQcmlkZS5nYW1lQ29uZmlnLnRyYWRlQ29zdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdG90YWxfY29zdDtcbn07XG4vL0hvb2tzIHRvIGJ1dHRvbnMgZm9yIHNoYXJpbmcgYW5kIGJ1eWluZ1xuLy9QcmV0dHkgc2ltcGxlIGhvb2tzIHRoYXQgY2FuIGJlIGFkZGVkIHRvIGEgdHlwZXNjcmlwdCBmaWxlLlxudmFyIGFwcGx5X2hvb2tzID0gZnVuY3Rpb24gKCkge1xuICAgIE5lcHR1bmVzUHJpZGUubnAub24oXCJzaGFyZV9hbGxfdGVjaFwiLCBmdW5jdGlvbiAoZXZlbnQsIHBsYXllcikge1xuICAgICAgICB2YXIgdG90YWxfY29zdCA9IGdldF90ZWNoX3RyYWRlX2Nvc3QoZ2V0X2hlcm8oTmVwdHVuZXNQcmlkZS51bml2ZXJzZSksIHBsYXllcik7XG4gICAgICAgIE5lcHR1bmVzUHJpZGUudGVtcGxhdGVzW1wiY29uZmlybV90ZWNoX3NoYXJlX1wiLmNvbmNhdChwbGF5ZXIudWlkKV0gPSBcIkFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBzcGVuZCAkXCIuY29uY2F0KHRvdGFsX2Nvc3QsIFwiIHRvIGdpdmUgXCIpLmNvbmNhdChwbGF5ZXIucmF3QWxpYXMsIFwiIGFsbCBvZiB5b3VyIHRlY2g/XCIpO1xuICAgICAgICBOZXB0dW5lc1ByaWRlLm5wLnRyaWdnZXIoXCJzaG93X3NjcmVlblwiLCBbXG4gICAgICAgICAgICBcImNvbmZpcm1cIixcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBcImNvbmZpcm1fdGVjaF9zaGFyZV9cIi5jb25jYXQocGxheWVyLnVpZCksXG4gICAgICAgICAgICAgICAgZXZlbnRLaW5kOiBcImNvbmZpcm1fdHJhZGVfdGVjaFwiLFxuICAgICAgICAgICAgICAgIGV2ZW50RGF0YTogcGxheWVyLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgXSk7XG4gICAgfSk7XG4gICAgTmVwdHVuZXNQcmlkZS5ucC5vbihcImJ1eV9hbGxfdGVjaFwiLCBmdW5jdGlvbiAoZXZlbnQsIGRhdGEpIHtcbiAgICAgICAgdmFyIHBsYXllciA9IGRhdGEucGxheWVyO1xuICAgICAgICB2YXIgY29zdCA9IGRhdGEuY29zdDtcbiAgICAgICAgTmVwdHVuZXNQcmlkZS50ZW1wbGF0ZXNbXCJjb25maXJtX3RlY2hfc2hhcmVfXCIuY29uY2F0KHBsYXllci51aWQpXSA9IFwiQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIHNwZW5kICRcIi5jb25jYXQoY29zdCwgXCIgdG8gYnV5IGFsbCBvZiBcIikuY29uY2F0KHBsYXllci5yYXdBbGlhcywgXCIncyB0ZWNoPyBJdCBpcyB1cCB0byB0aGVtIHRvIGFjdHVhbGx5IHNlbmQgaXQgdG8geW91LlwiKTtcbiAgICAgICAgTmVwdHVuZXNQcmlkZS5ucC50cmlnZ2VyKFwic2hvd19zY3JlZW5cIiwgW1xuICAgICAgICAgICAgXCJjb25maXJtXCIsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZTogXCJjb25maXJtX3RlY2hfc2hhcmVfXCIuY29uY2F0KHBsYXllci51aWQpLFxuICAgICAgICAgICAgICAgIGV2ZW50S2luZDogXCJjb25maXJtX2J1eV90ZWNoXCIsXG4gICAgICAgICAgICAgICAgZXZlbnREYXRhOiBkYXRhLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgXSk7XG4gICAgfSk7XG4gICAgTmVwdHVuZXNQcmlkZS5ucC5vbihcImJ1eV9vbmVfdGVjaFwiLCBmdW5jdGlvbiAoZXZlbnQsIGRhdGEpIHtcbiAgICAgICAgdmFyIHBsYXllciA9IGRhdGEucGxheWVyO1xuICAgICAgICB2YXIgdGVjaCA9IGRhdGEudGVjaDtcbiAgICAgICAgdmFyIGNvc3QgPSBkYXRhLmNvc3Q7XG4gICAgICAgIE5lcHR1bmVzUHJpZGUudGVtcGxhdGVzW1wiY29uZmlybV90ZWNoX3NoYXJlX1wiLmNvbmNhdChwbGF5ZXIudWlkKV0gPSBcIkFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBzcGVuZCAkXCIuY29uY2F0KGNvc3QsIFwiIHRvIGJ1eSBcIikuY29uY2F0KHRlY2gsIFwiIGZyb20gXCIpLmNvbmNhdChwbGF5ZXIucmF3QWxpYXMsIFwiPyBJdCBpcyB1cCB0byB0aGVtIHRvIGFjdHVhbGx5IHNlbmQgaXQgdG8geW91LlwiKTtcbiAgICAgICAgTmVwdHVuZXNQcmlkZS5ucC50cmlnZ2VyKFwic2hvd19zY3JlZW5cIiwgW1xuICAgICAgICAgICAgXCJjb25maXJtXCIsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZTogXCJjb25maXJtX3RlY2hfc2hhcmVfXCIuY29uY2F0KHBsYXllci51aWQpLFxuICAgICAgICAgICAgICAgIGV2ZW50S2luZDogXCJjb25maXJtX2J1eV90ZWNoXCIsXG4gICAgICAgICAgICAgICAgZXZlbnREYXRhOiBkYXRhLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgXSk7XG4gICAgfSk7XG4gICAgTmVwdHVuZXNQcmlkZS5ucC5vbihcImNvbmZpcm1fdHJhZGVfdGVjaFwiLCBmdW5jdGlvbiAoZXZlbiwgcGxheWVyKSB7XG4gICAgICAgIHZhciBoZXJvID0gZ2V0X2hlcm8oTmVwdHVuZXNQcmlkZS51bml2ZXJzZSk7XG4gICAgICAgIHZhciBkaXNwbGF5ID0gZGlzcGxheV90ZWNoX3RyYWRpbmcoKTtcbiAgICAgICAgdmFyIGNsb3NlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5zZWxlY3RQbGF5ZXIocGxheWVyKTtcbiAgICAgICAgICAgIE5lcHR1bmVzUHJpZGUubnAudHJpZ2dlcihcInJlZnJlc2hfaW50ZXJmYWNlXCIpO1xuICAgICAgICAgICAgTmVwdHVuZXNQcmlkZS5ucC5ucHVpLnJlZnJlc2hUdXJuTWFuYWdlcigpO1xuICAgICAgICB9O1xuICAgICAgICB2YXIgb2Zmc2V0ID0gMzAwO1xuICAgICAgICB2YXIgX2xvb3BfMSA9IGZ1bmN0aW9uICh0ZWNoLCB2YWx1ZSkge1xuICAgICAgICAgICAgdmFyIG1lID0gaGVyby50ZWNoW3RlY2hdLmxldmVsO1xuICAgICAgICAgICAgdmFyIHlvdSA9IHZhbHVlLmxldmVsO1xuICAgICAgICAgICAgdmFyIF9sb29wXzIgPSBmdW5jdGlvbiAoaSkge1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhtZSAtIHlvdSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJvcmRlclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgb3JkZXI6IFwic2hhcmVfdGVjaCxcIi5jb25jYXQocGxheWVyLnVpZCwgXCIsXCIpLmNvbmNhdCh0ZWNoKSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXkudHJhbnNhY3QoXCJTZW5kaW5nIFwiLmNvbmNhdCh0ZWNoLCBcIiBsZXZlbCBcIikuY29uY2F0KHlvdSArIGkpKTtcbiAgICAgICAgICAgICAgICAgICAgTmVwdHVuZXNQcmlkZS5ucC50cmlnZ2VyKFwic2VydmVyX3JlcXVlc3RcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJvcmRlclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgb3JkZXI6IFwic2hhcmVfdGVjaCxcIi5jb25jYXQocGxheWVyLnVpZCwgXCIsXCIpLmNvbmNhdCh0ZWNoKSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpID09IG1lIC0geW91KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5LnRyYW5zYWN0KFwiRG9uZS5cIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCBvZmZzZXQpO1xuICAgICAgICAgICAgICAgIG9mZnNldCArPSAxMDAwO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDw9IG1lIC0geW91OyArK2kpIHtcbiAgICAgICAgICAgICAgICBfbG9vcF8yKGkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gT2JqZWN0LmVudHJpZXMocGxheWVyLnRlY2gpOyBfaSA8IF9hLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgdmFyIF9iID0gX2FbX2ldLCB0ZWNoID0gX2JbMF0sIHZhbHVlID0gX2JbMV07XG4gICAgICAgICAgICBfbG9vcF8xKHRlY2gsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBzZXRUaW1lb3V0KGNsb3NlLCBvZmZzZXQgKyAxMDAwKTtcbiAgICB9KTtcbiAgICAvL1BheXMgYSBwbGF5ZXIgYSBjZXJ0YWluIGFtb3VudFxuICAgIE5lcHR1bmVzUHJpZGUubnAub24oXCJjb25maXJtX2J1eV90ZWNoXCIsIGZ1bmN0aW9uIChldmVuLCBkYXRhKSB7XG4gICAgICAgIHZhciBwbGF5ZXIgPSBkYXRhLnBsYXllcjtcbiAgICAgICAgTmVwdHVuZXNQcmlkZS5ucC50cmlnZ2VyKFwic2VydmVyX3JlcXVlc3RcIiwge1xuICAgICAgICAgICAgdHlwZTogXCJvcmRlclwiLFxuICAgICAgICAgICAgb3JkZXI6IFwic2VuZF9tb25leSxcIi5jb25jYXQocGxheWVyLnVpZCwgXCIsXCIpLmNvbmNhdChkYXRhLmNvc3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5zZWxlY3RQbGF5ZXIocGxheWVyKTtcbiAgICAgICAgTmVwdHVuZXNQcmlkZS5ucC50cmlnZ2VyKFwicmVmcmVzaF9pbnRlcmZhY2VcIik7XG4gICAgfSk7XG59O1xudmFyIF93aWRlX3ZpZXcgPSBmdW5jdGlvbiAoKSB7XG4gICAgTmVwdHVuZXNQcmlkZS5ucC50cmlnZ2VyKFwibWFwX2NlbnRlcl9zbGlkZVwiLCB7IHg6IDAsIHk6IDAgfSk7XG4gICAgTmVwdHVuZXNQcmlkZS5ucC50cmlnZ2VyKFwiem9vbV9taW5pbWFwXCIpO1xufTtcbmZ1bmN0aW9uIExlZ2FjeV9OZXB0dW5lc1ByaWRlQWdlbnQoKSB7XG4gICAgdmFyIF9hLCBfYjtcbiAgICB2YXIgdGl0bGUgPSAoKF9hID0gZG9jdW1lbnQgPT09IG51bGwgfHwgZG9jdW1lbnQgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGRvY3VtZW50LmN1cnJlbnRTY3JpcHQpID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS50aXRsZSkgfHwgXCJTQVQgXCIuY29uY2F0KFNBVF9WRVJTSU9OKTtcbiAgICB2YXIgdmVyc2lvbiA9IHRpdGxlLnJlcGxhY2UoL14uKnYvLCBcInZcIik7XG4gICAgY29uc29sZS5sb2codGl0bGUpO1xuICAgIHZhciBjb3B5ID0gZnVuY3Rpb24gKHJlcG9ydEZuKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXBvcnRGbigpO1xuICAgICAgICAgICAgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQobGFzdENsaXApO1xuICAgICAgICB9O1xuICAgIH07XG4gICAgdmFyIGhvdGtleXMgPSBbXTtcbiAgICB2YXIgaG90a2V5ID0gZnVuY3Rpb24gKGtleSwgYWN0aW9uKSB7XG4gICAgICAgIGhvdGtleXMucHVzaChba2V5LCBhY3Rpb25dKTtcbiAgICAgICAgTW91c2V0cmFwLmJpbmQoa2V5LCBjb3B5KGFjdGlvbikpO1xuICAgIH07XG4gICAgaWYgKCFTdHJpbmcucHJvdG90eXBlLmZvcm1hdCkge1xuICAgICAgICBTdHJpbmcucHJvdG90eXBlLmZvcm1hdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBhcmdzID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgICAgIGFyZ3NbX2ldID0gYXJndW1lbnRzW19pXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGlzLnJlcGxhY2UoL3soXFxkKyl9L2csIGZ1bmN0aW9uIChtYXRjaCwgbnVtYmVyKSB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBhcmdzW251bWJlcl0gPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIE1hdGgudHJ1bmMoYXJnc1tudW1iZXJdICogMTAwMCkgLyAxMDAwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gdHlwZW9mIGFyZ3NbbnVtYmVyXSAhPSBcInVuZGVmaW5lZFwiID8gYXJnc1tudW1iZXJdIDogbWF0Y2g7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgdmFyIGxpbmtGbGVldHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciB1bml2ZXJzZSA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2U7XG4gICAgICAgIHZhciBmbGVldHMgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlLmdhbGF4eS5mbGVldHM7XG4gICAgICAgIGZvciAodmFyIGYgaW4gZmxlZXRzKSB7XG4gICAgICAgICAgICB2YXIgZmxlZXQgPSBmbGVldHNbZl07XG4gICAgICAgICAgICB2YXIgZmxlZXRMaW5rID0gXCI8YSBvbkNsaWNrPSdDcnV4LmNydXgudHJpZ2dlcihcXFwic2hvd19mbGVldF91aWRcXFwiLCBcXFwiXCIuY29uY2F0KGZsZWV0LnVpZCwgXCJcXFwiKSc+XCIpLmNvbmNhdChmbGVldC5uLCBcIjwvYT5cIik7XG4gICAgICAgICAgICB1bml2ZXJzZS5oeXBlcmxpbmtlZE1lc3NhZ2VJbnNlcnRzW2ZsZWV0Lm5dID0gZmxlZXRMaW5rO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBmdW5jdGlvbiBzdGFyUmVwb3J0KCkge1xuICAgICAgICB2YXIgcGxheWVycyA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2UuZ2FsYXh5LnBsYXllcnM7XG4gICAgICAgIHZhciBzdGFycyA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2UuZ2FsYXh5LnN0YXJzO1xuICAgICAgICB2YXIgb3V0cHV0ID0gW107XG4gICAgICAgIGZvciAodmFyIHAgaW4gcGxheWVycykge1xuICAgICAgICAgICAgb3V0cHV0LnB1c2goXCJbW3swfV1dXCIuZm9ybWF0KHApKTtcbiAgICAgICAgICAgIGZvciAodmFyIHMgaW4gc3RhcnMpIHtcbiAgICAgICAgICAgICAgICB2YXIgc3RhciA9IHN0YXJzW3NdO1xuICAgICAgICAgICAgICAgIGlmIChzdGFyLnB1aWQgPT0gcCAmJiBzdGFyLnNoaXBzUGVyVGljayA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIG91dHB1dC5wdXNoKFwi4oCD4oCDW1t7MH1dXSB7MX0vezJ9L3szfSB7NH0gc2hpcHNcIi5mb3JtYXQoc3Rhci5uLCBzdGFyLmUsIHN0YXIuaSwgc3Rhci5zLCBzdGFyLnRvdGFsRGVmZW5zZXMpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2xpcChvdXRwdXQuam9pbihcIlxcblwiKSk7XG4gICAgfVxuICAgIGhvdGtleShcIipcIiwgc3RhclJlcG9ydCk7XG4gICAgc3RhclJlcG9ydC5oZWxwID1cbiAgICAgICAgXCJHZW5lcmF0ZSBhIHJlcG9ydCBvbiBhbGwgc3RhcnMgaW4geW91ciBzY2FubmluZyByYW5nZSwgYW5kIGNvcHkgaXQgdG8gdGhlIGNsaXBib2FyZC5cIiArXG4gICAgICAgICAgICBcIjxwPlRoaXMgc2FtZSByZXBvcnQgY2FuIGFsc28gYmUgdmlld2VkIHZpYSB0aGUgbWVudTsgZW50ZXIgdGhlIGFnZW50IGFuZCBjaG9vc2UgaXQgZnJvbSB0aGUgZHJvcGRvd24uXCI7XG4gICAgdmFyIGFtcG0gPSBmdW5jdGlvbiAoaCwgbSkge1xuICAgICAgICBpZiAobSA8IDEwKVxuICAgICAgICAgICAgbSA9IFwiMFwiLmNvbmNhdChtKTtcbiAgICAgICAgaWYgKGggPCAxMikge1xuICAgICAgICAgICAgaWYgKGggPT0gMClcbiAgICAgICAgICAgICAgICBoID0gMTI7XG4gICAgICAgICAgICByZXR1cm4gXCJ7MH06ezF9IEFNXCIuZm9ybWF0KGgsIG0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGggPiAxMikge1xuICAgICAgICAgICAgcmV0dXJuIFwiezB9OnsxfSBQTVwiLmZvcm1hdChoIC0gMTIsIG0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBcInswfTp7MX0gUE1cIi5mb3JtYXQoaCwgbSk7XG4gICAgfTtcbiAgICB2YXIgbXNUb1RpY2sgPSBmdW5jdGlvbiAodGljaywgd2hvbGVUaW1lKSB7XG4gICAgICAgIHZhciB1bml2ZXJzZSA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2U7XG4gICAgICAgIHZhciBtc19zaW5jZV9kYXRhID0gMDtcbiAgICAgICAgdmFyIHRmID0gdW5pdmVyc2UuZ2FsYXh5LnRpY2tfZnJhZ21lbnQ7XG4gICAgICAgIHZhciBsdGMgPSB1bml2ZXJzZS5sb2NUaW1lQ29ycmVjdGlvbjtcbiAgICAgICAgaWYgKCF1bml2ZXJzZS5nYWxheHkucGF1c2VkKSB7XG4gICAgICAgICAgICBtc19zaW5jZV9kYXRhID0gbmV3IERhdGUoKS52YWx1ZU9mKCkgLSB1bml2ZXJzZS5ub3cudmFsdWVPZigpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh3aG9sZVRpbWUgfHwgdW5pdmVyc2UuZ2FsYXh5LnR1cm5fYmFzZWQpIHtcbiAgICAgICAgICAgIG1zX3NpbmNlX2RhdGEgPSAwO1xuICAgICAgICAgICAgdGYgPSAwO1xuICAgICAgICAgICAgbHRjID0gMDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgbXNfcmVtYWluaW5nID0gdGljayAqIDEwMDAgKiA2MCAqIHVuaXZlcnNlLmdhbGF4eS50aWNrX3JhdGUgLVxuICAgICAgICAgICAgdGYgKiAxMDAwICogNjAgKiB1bml2ZXJzZS5nYWxheHkudGlja19yYXRlIC1cbiAgICAgICAgICAgIG1zX3NpbmNlX2RhdGEgLVxuICAgICAgICAgICAgbHRjO1xuICAgICAgICByZXR1cm4gbXNfcmVtYWluaW5nO1xuICAgIH07XG4gICAgdmFyIGRheXMgPSBbXCJTdW5cIiwgXCJNb25cIiwgXCJUdWVcIiwgXCJXZWRcIiwgXCJUaHVcIiwgXCJGcmlcIiwgXCJTYXRcIl07XG4gICAgdmFyIG1zVG9FdGFTdHJpbmcgPSBmdW5jdGlvbiAobXNwbHVzLCBwcmVmaXgpIHtcbiAgICAgICAgdmFyIG5vdyA9IG5ldyBEYXRlKCk7XG4gICAgICAgIHZhciBhcnJpdmFsID0gbmV3IERhdGUobm93LmdldFRpbWUoKSArIG1zcGx1cyk7XG4gICAgICAgIHZhciBwID0gcHJlZml4ICE9PSB1bmRlZmluZWQgPyBwcmVmaXggOiBcIkVUQSBcIjtcbiAgICAgICAgLy9XaGF0IGlzIHR0dD9cbiAgICAgICAgdmFyIHR0dCA9IHAgKyBhbXBtKGFycml2YWwuZ2V0SG91cnMoKSwgYXJyaXZhbC5nZXRNaW51dGVzKCkpO1xuICAgICAgICBpZiAoIU5lcHR1bmVzUHJpZGUuZ2FtZUNvbmZpZy50dXJuQmFzZWQpIHtcbiAgICAgICAgICAgIHR0dCA9IHAgKyBhbXBtKGFycml2YWwuZ2V0SG91cnMoKSwgYXJyaXZhbC5nZXRNaW51dGVzKCkpO1xuICAgICAgICAgICAgaWYgKGFycml2YWwuZ2V0RGF5KCkgIT0gbm93LmdldERheSgpKVxuICAgICAgICAgICAgICAgIC8vIEdlbmVyYXRlIHRpbWUgc3RyaW5nXG4gICAgICAgICAgICAgICAgdHR0ID0gXCJcIi5jb25jYXQocCkuY29uY2F0KGRheXNbYXJyaXZhbC5nZXREYXkoKV0sIFwiIEAgXCIpLmNvbmNhdChhbXBtKGFycml2YWwuZ2V0SG91cnMoKSwgYXJyaXZhbC5nZXRNaW51dGVzKCkpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHZhciB0b3RhbEVUQSA9IGFycml2YWwgLSBub3c7XG4gICAgICAgICAgICB0dHQgPSBwICsgQ3J1eC5mb3JtYXRUaW1lKHRvdGFsRVRBKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHR0O1xuICAgIH07XG4gICAgdmFyIHRpY2tUb0V0YVN0cmluZyA9IGZ1bmN0aW9uICh0aWNrLCBwcmVmaXgpIHtcbiAgICAgICAgdmFyIG1zcGx1cyA9IG1zVG9UaWNrKHRpY2spO1xuICAgICAgICByZXR1cm4gbXNUb0V0YVN0cmluZyhtc3BsdXMsIHByZWZpeCk7XG4gICAgfTtcbiAgICB2YXIgbXNUb0N5Y2xlU3RyaW5nID0gZnVuY3Rpb24gKG1zcGx1cywgcHJlZml4KSB7XG4gICAgICAgIHZhciBwID0gcHJlZml4ICE9PSB1bmRlZmluZWQgPyBwcmVmaXggOiBcIkVUQVwiO1xuICAgICAgICB2YXIgY3ljbGVMZW5ndGggPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlLmdhbGF4eS5wcm9kdWN0aW9uX3JhdGU7XG4gICAgICAgIHZhciB0aWNrTGVuZ3RoID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5nYWxheHkudGlja19yYXRlO1xuICAgICAgICB2YXIgdGlja3NUb0NvbXBsZXRlID0gTWF0aC5jZWlsKG1zcGx1cyAvIDYwMDAwIC8gdGlja0xlbmd0aCk7XG4gICAgICAgIC8vR2VuZXJhdGUgdGltZSB0ZXh0IHN0cmluZ1xuICAgICAgICB2YXIgdHR0ID0gXCJcIi5jb25jYXQocCkuY29uY2F0KHRpY2tzVG9Db21wbGV0ZSwgXCIgdGlja3MgLSBcIikuY29uY2F0KCh0aWNrc1RvQ29tcGxldGUgLyBjeWNsZUxlbmd0aCkudG9GaXhlZCgyKSwgXCJDXCIpO1xuICAgICAgICByZXR1cm4gdHR0O1xuICAgIH07XG4gICAgdmFyIGZsZWV0T3V0Y29tZXMgPSB7fTtcbiAgICB2YXIgY29tYmF0SGFuZGljYXAgPSAwO1xuICAgIHZhciBjb21iYXRPdXRjb21lcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIF9hO1xuICAgICAgICB2YXIgdW5pdmVyc2UgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlO1xuICAgICAgICB2YXIgcGxheWVycyA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2UuZ2FsYXh5LnBsYXllcnM7XG4gICAgICAgIHZhciBmbGVldHMgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlLmdhbGF4eS5mbGVldHM7XG4gICAgICAgIHZhciBzdGFycyA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2UuZ2FsYXh5LnN0YXJzO1xuICAgICAgICB2YXIgZmxpZ2h0cyA9IFtdO1xuICAgICAgICBmbGVldE91dGNvbWVzID0ge307XG4gICAgICAgIGZvciAodmFyIGYgaW4gZmxlZXRzKSB7XG4gICAgICAgICAgICB2YXIgZmxlZXQgPSBmbGVldHNbZl07XG4gICAgICAgICAgICBpZiAoZmxlZXQubyAmJiBmbGVldC5vLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICB2YXIgc3RvcF8xID0gZmxlZXQub1swXVsxXTtcbiAgICAgICAgICAgICAgICB2YXIgdGlja3MgPSBmbGVldC5ldGFGaXJzdDtcbiAgICAgICAgICAgICAgICB2YXIgc3Rhcm5hbWUgPSAoX2EgPSBzdGFyc1tzdG9wXzFdKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2EubjtcbiAgICAgICAgICAgICAgICBpZiAoIXN0YXJuYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmbGlnaHRzLnB1c2goW1xuICAgICAgICAgICAgICAgICAgICB0aWNrcyxcbiAgICAgICAgICAgICAgICAgICAgXCJbW3swfV1dIFtbezF9XV0gezJ9IOKGkiBbW3szfV1dIHs0fVwiLmZvcm1hdChmbGVldC5wdWlkLCBmbGVldC5uLCBmbGVldC5zdCwgc3Rhcm5hbWUsIHRpY2tUb0V0YVN0cmluZyh0aWNrcykpLFxuICAgICAgICAgICAgICAgICAgICBmbGVldCxcbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmbGlnaHRzID0gZmxpZ2h0cy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgICAgICByZXR1cm4gYVswXSAtIGJbMF07XG4gICAgICAgIH0pO1xuICAgICAgICB2YXIgYXJyaXZhbHMgPSB7fTtcbiAgICAgICAgdmFyIG91dHB1dCA9IFtdO1xuICAgICAgICB2YXIgYXJyaXZhbFRpbWVzID0gW107XG4gICAgICAgIHZhciBzdGFyc3RhdGUgPSB7fTtcbiAgICAgICAgZm9yICh2YXIgaSBpbiBmbGlnaHRzKSB7XG4gICAgICAgICAgICB2YXIgZmxlZXQgPSBmbGlnaHRzW2ldWzJdO1xuICAgICAgICAgICAgaWYgKGZsZWV0Lm9yYml0aW5nKSB7XG4gICAgICAgICAgICAgICAgdmFyIG9yYml0ID0gZmxlZXQub3JiaXRpbmcudWlkO1xuICAgICAgICAgICAgICAgIGlmICghc3RhcnN0YXRlW29yYml0XSkge1xuICAgICAgICAgICAgICAgICAgICBzdGFyc3RhdGVbb3JiaXRdID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFzdF91cGRhdGVkOiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2hpcHM6IHN0YXJzW29yYml0XS50b3RhbERlZmVuc2VzLFxuICAgICAgICAgICAgICAgICAgICAgICAgcHVpZDogc3RhcnNbb3JiaXRdLnB1aWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBjOiBzdGFyc1tvcmJpdF0uYyxcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gVGhpcyBmbGVldCBpcyBkZXBhcnRpbmcgdGhpcyB0aWNrOyByZW1vdmUgaXQgZnJvbSB0aGUgb3JpZ2luIHN0YXIncyB0b3RhbERlZmVuc2VzXG4gICAgICAgICAgICAgICAgc3RhcnN0YXRlW29yYml0XS5zaGlwcyAtPSBmbGVldC5zdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChhcnJpdmFsVGltZXMubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgYXJyaXZhbFRpbWVzW2Fycml2YWxUaW1lcy5sZW5ndGggLSAxXSAhPT0gZmxpZ2h0c1tpXVswXSkge1xuICAgICAgICAgICAgICAgIGFycml2YWxUaW1lcy5wdXNoKGZsaWdodHNbaV1bMF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGFycml2YWxLZXkgPSBbZmxpZ2h0c1tpXVswXSwgZmxlZXQub1swXVsxXV07XG4gICAgICAgICAgICBpZiAoYXJyaXZhbHNbYXJyaXZhbEtleV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGFycml2YWxzW2Fycml2YWxLZXldLnB1c2goZmxlZXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgYXJyaXZhbHNbYXJyaXZhbEtleV0gPSBbZmxlZXRdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZvciAodmFyIGsgaW4gYXJyaXZhbHMpIHtcbiAgICAgICAgICAgIHZhciBhcnJpdmFsID0gYXJyaXZhbHNba107XG4gICAgICAgICAgICB2YXIga2EgPSBrLnNwbGl0KFwiLFwiKTtcbiAgICAgICAgICAgIHZhciB0aWNrID0ga2FbMF07XG4gICAgICAgICAgICB2YXIgc3RhcklkID0ga2FbMV07XG4gICAgICAgICAgICBpZiAoIXN0YXJzdGF0ZVtzdGFySWRdKSB7XG4gICAgICAgICAgICAgICAgc3RhcnN0YXRlW3N0YXJJZF0gPSB7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RfdXBkYXRlZDogMCxcbiAgICAgICAgICAgICAgICAgICAgc2hpcHM6IHN0YXJzW3N0YXJJZF0udG90YWxEZWZlbnNlcyxcbiAgICAgICAgICAgICAgICAgICAgcHVpZDogc3RhcnNbc3RhcklkXS5wdWlkLFxuICAgICAgICAgICAgICAgICAgICBjOiBzdGFyc1tzdGFySWRdLmMsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzdGFyc3RhdGVbc3RhcklkXS5wdWlkID09IC0xKSB7XG4gICAgICAgICAgICAgICAgLy8gYXNzaWduIG93bmVyc2hpcCBvZiB0aGUgc3RhciB0byB0aGUgcGxheWVyIHdob3NlIGZsZWV0IGhhcyB0cmF2ZWxlZCB0aGUgbGVhc3QgZGlzdGFuY2VcbiAgICAgICAgICAgICAgICB2YXIgbWluRGlzdGFuY2UgPSAxMDAwMDtcbiAgICAgICAgICAgICAgICB2YXIgb3duZXIgPSAtMTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpIGluIGFycml2YWwpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZsZWV0ID0gYXJyaXZhbFtpXTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGQgPSB1bml2ZXJzZS5kaXN0YW5jZShzdGFyc1tzdGFySWRdLngsIHN0YXJzW3N0YXJJZF0ueSwgZmxlZXQubHgsIGZsZWV0Lmx5KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGQgPCBtaW5EaXN0YW5jZSB8fCBvd25lciA9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3duZXIgPSBmbGVldC5wdWlkO1xuICAgICAgICAgICAgICAgICAgICAgICAgbWluRGlzdGFuY2UgPSBkO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHN0YXJzdGF0ZVtzdGFySWRdLnB1aWQgPSBvd25lcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG91dHB1dC5wdXNoKFwiezB9OiBbW3sxfV1dIFtbezJ9XV0gezN9IHNoaXBzXCIuZm9ybWF0KHRpY2tUb0V0YVN0cmluZyh0aWNrLCBcIkBcIiksIHN0YXJzdGF0ZVtzdGFySWRdLnB1aWQsIHN0YXJzW3N0YXJJZF0ubiwgc3RhcnN0YXRlW3N0YXJJZF0uc2hpcHMpKTtcbiAgICAgICAgICAgIHZhciB0aWNrRGVsdGEgPSB0aWNrIC0gc3RhcnN0YXRlW3N0YXJJZF0ubGFzdF91cGRhdGVkIC0gMTtcbiAgICAgICAgICAgIGlmICh0aWNrRGVsdGEgPiAwKSB7XG4gICAgICAgICAgICAgICAgdmFyIG9sZFNoaXBzID0gc3RhcnN0YXRlW3N0YXJJZF0uc2hpcHM7XG4gICAgICAgICAgICAgICAgc3RhcnN0YXRlW3N0YXJJZF0ubGFzdF91cGRhdGVkID0gdGljayAtIDE7XG4gICAgICAgICAgICAgICAgaWYgKHN0YXJzW3N0YXJJZF0uc2hpcHNQZXJUaWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBvbGRjID0gc3RhcnN0YXRlW3N0YXJJZF0uYztcbiAgICAgICAgICAgICAgICAgICAgc3RhcnN0YXRlW3N0YXJJZF0uc2hpcHMgKz1cbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJzW3N0YXJJZF0uc2hpcHNQZXJUaWNrICogdGlja0RlbHRhICsgb2xkYztcbiAgICAgICAgICAgICAgICAgICAgc3RhcnN0YXRlW3N0YXJJZF0uYyA9XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFyc3RhdGVbc3RhcklkXS5zaGlwcyAtIE1hdGgudHJ1bmMoc3RhcnN0YXRlW3N0YXJJZF0uc2hpcHMpO1xuICAgICAgICAgICAgICAgICAgICBzdGFyc3RhdGVbc3RhcklkXS5zaGlwcyAtPSBzdGFyc3RhdGVbc3RhcklkXS5jO1xuICAgICAgICAgICAgICAgICAgICBvdXRwdXQucHVzaChcIuKAg+KAg3swfSt7M30gKyB7Mn0vaCA9IHsxfSt7NH1cIi5mb3JtYXQob2xkU2hpcHMsIHN0YXJzdGF0ZVtzdGFySWRdLnNoaXBzLCBzdGFyc1tzdGFySWRdLnNoaXBzUGVyVGljaywgb2xkYywgc3RhcnN0YXRlW3N0YXJJZF0uYykpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAodmFyIGkgaW4gYXJyaXZhbCkge1xuICAgICAgICAgICAgICAgIHZhciBmbGVldCA9IGFycml2YWxbaV07XG4gICAgICAgICAgICAgICAgaWYgKGZsZWV0LnB1aWQgPT0gc3RhcnN0YXRlW3N0YXJJZF0ucHVpZCB8fFxuICAgICAgICAgICAgICAgICAgICBzdGFyc3RhdGVbc3RhcklkXS5wdWlkID09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBvbGRTaGlwcyA9IHN0YXJzdGF0ZVtzdGFySWRdLnNoaXBzO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3RhcnN0YXRlW3N0YXJJZF0ucHVpZCA9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnN0YXRlW3N0YXJJZF0uc2hpcHMgPSBmbGVldC5zdDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJzdGF0ZVtzdGFySWRdLnNoaXBzICs9IGZsZWV0LnN0O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHZhciBsYW5kaW5nU3RyaW5nID0gXCLigIPigIN7MH0gKyB7Mn0gb24gW1t7M31dXSA9IHsxfVwiLmZvcm1hdChvbGRTaGlwcywgc3RhcnN0YXRlW3N0YXJJZF0uc2hpcHMsIGZsZWV0LnN0LCBmbGVldC5uKTtcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0LnB1c2gobGFuZGluZ1N0cmluZyk7XG4gICAgICAgICAgICAgICAgICAgIGxhbmRpbmdTdHJpbmcgPSBsYW5kaW5nU3RyaW5nLnN1YnN0cmluZygyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKHZhciBpIGluIGFycml2YWwpIHtcbiAgICAgICAgICAgICAgICB2YXIgZmxlZXQgPSBhcnJpdmFsW2ldO1xuICAgICAgICAgICAgICAgIGlmIChmbGVldC5wdWlkID09IHN0YXJzdGF0ZVtzdGFySWRdLnB1aWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG91dGNvbWVTdHJpbmcgPSBcInswfSBzaGlwcyBvbiB7MX1cIi5mb3JtYXQoTWF0aC5mbG9vcihzdGFyc3RhdGVbc3RhcklkXS5zaGlwcyksIHN0YXJzW3N0YXJJZF0ubik7XG4gICAgICAgICAgICAgICAgICAgIGZsZWV0T3V0Y29tZXNbZmxlZXQudWlkXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV0YTogdGlja1RvRXRhU3RyaW5nKGZsZWV0LmV0YUZpcnN0KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dGNvbWU6IG91dGNvbWVTdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGF3dCA9IDA7XG4gICAgICAgICAgICB2YXIgb2ZmZW5zZSA9IDA7XG4gICAgICAgICAgICB2YXIgY29udHJpYnV0aW9uID0ge307XG4gICAgICAgICAgICBmb3IgKHZhciBpIGluIGFycml2YWwpIHtcbiAgICAgICAgICAgICAgICB2YXIgZmxlZXQgPSBhcnJpdmFsW2ldO1xuICAgICAgICAgICAgICAgIGlmIChmbGVldC5wdWlkICE9IHN0YXJzdGF0ZVtzdGFySWRdLnB1aWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG9sZGEgPSBvZmZlbnNlO1xuICAgICAgICAgICAgICAgICAgICBvZmZlbnNlICs9IGZsZWV0LnN0O1xuICAgICAgICAgICAgICAgICAgICBvdXRwdXQucHVzaChcIuKAg+KAg1tbezR9XV0hIHswfSArIHsyfSBvbiBbW3szfV1dID0gezF9XCIuZm9ybWF0KG9sZGEsIG9mZmVuc2UsIGZsZWV0LnN0LCBmbGVldC5uLCBmbGVldC5wdWlkKSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRyaWJ1dGlvbltbZmxlZXQucHVpZCwgZmxlZXQudWlkXV0gPSBmbGVldC5zdDtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHd0ID0gcGxheWVyc1tmbGVldC5wdWlkXS50ZWNoLndlYXBvbnMubGV2ZWw7XG4gICAgICAgICAgICAgICAgICAgIGlmICh3dCA+IGF3dCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXd0ID0gd3Q7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgYXR0YWNrZXJzQWdncmVnYXRlID0gb2ZmZW5zZTtcbiAgICAgICAgICAgIHdoaWxlIChvZmZlbnNlID4gMCkge1xuICAgICAgICAgICAgICAgIHZhciBkd3QgPSBwbGF5ZXJzW3N0YXJzdGF0ZVtzdGFySWRdLnB1aWRdLnRlY2gud2VhcG9ucy5sZXZlbDtcbiAgICAgICAgICAgICAgICB2YXIgZGVmZW5zZSA9IHN0YXJzdGF0ZVtzdGFySWRdLnNoaXBzO1xuICAgICAgICAgICAgICAgIG91dHB1dC5wdXNoKFwi4oCD4oCDQ29tYmF0ISBbW3swfV1dIGRlZmVuZGluZ1wiLmZvcm1hdChzdGFyc3RhdGVbc3RhcklkXS5wdWlkKSk7XG4gICAgICAgICAgICAgICAgb3V0cHV0LnB1c2goXCLigIPigIPigIPigINEZWZlbmRlcnMgezB9IHNoaXBzLCBXUyB7MX1cIi5mb3JtYXQoZGVmZW5zZSwgZHd0KSk7XG4gICAgICAgICAgICAgICAgb3V0cHV0LnB1c2goXCLigIPigIPigIPigINBdHRhY2tlcnMgezB9IHNoaXBzLCBXUyB7MX1cIi5mb3JtYXQob2ZmZW5zZSwgYXd0KSk7XG4gICAgICAgICAgICAgICAgZHd0ICs9IDE7XG4gICAgICAgICAgICAgICAgaWYgKHN0YXJzdGF0ZVtzdGFySWRdLnB1aWQgIT09IHVuaXZlcnNlLmdhbGF4eS5wbGF5ZXJfdWlkKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb21iYXRIYW5kaWNhcCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGR3dCArPSBjb21iYXRIYW5kaWNhcDtcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dC5wdXNoKFwi4oCD4oCD4oCD4oCDRGVmZW5kZXJzIFdTezB9ID0gezF9XCIuZm9ybWF0KGhhbmRpY2FwU3RyaW5nKFwiXCIpLCBkd3QpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF3dCAtPSBjb21iYXRIYW5kaWNhcDtcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dC5wdXNoKFwi4oCD4oCD4oCD4oCDQXR0YWNrZXJzIFdTezB9ID0gezF9XCIuZm9ybWF0KGhhbmRpY2FwU3RyaW5nKFwiXCIpLCBhd3QpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbWJhdEhhbmRpY2FwID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXd0ICs9IGNvbWJhdEhhbmRpY2FwO1xuICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0LnB1c2goXCLigIPigIPigIPigINBdHRhY2tlcnMgV1N7MH0gPSB7MX1cIi5mb3JtYXQoaGFuZGljYXBTdHJpbmcoXCJcIiksIGF3dCkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZHd0IC09IGNvbWJhdEhhbmRpY2FwO1xuICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0LnB1c2goXCLigIPigIPigIPigINEZWZlbmRlcnMgV1N7MH0gPSB7MX1cIi5mb3JtYXQoaGFuZGljYXBTdHJpbmcoXCJcIiksIGR3dCkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh1bml2ZXJzZS5nYWxheHkucGxheWVyX3VpZCA9PT0gc3RhcnN0YXRlW3N0YXJJZF0ucHVpZCkge1xuICAgICAgICAgICAgICAgICAgICAvLyB0cnVuY2F0ZSBkZWZlbnNlIGlmIHdlJ3JlIGRlZmVuZGluZyB0byBnaXZlIHRoZSBtb3N0XG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnNlcnZhdGl2ZSBlc3RpbWF0ZVxuICAgICAgICAgICAgICAgICAgICBkZWZlbnNlID0gTWF0aC50cnVuYyhkZWZlbnNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgd2hpbGUgKGRlZmVuc2UgPiAwICYmIG9mZmVuc2UgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIG9mZmVuc2UgLT0gZHd0O1xuICAgICAgICAgICAgICAgICAgICBpZiAob2ZmZW5zZSA8PSAwKVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGRlZmVuc2UgLT0gYXd0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgbmV3QWdncmVnYXRlID0gMDtcbiAgICAgICAgICAgICAgICB2YXIgcGxheWVyQ29udHJpYnV0aW9uID0ge307XG4gICAgICAgICAgICAgICAgdmFyIGJpZ2dlc3RQbGF5ZXIgPSAtMTtcbiAgICAgICAgICAgICAgICB2YXIgYmlnZ2VzdFBsYXllcklkID0gc3RhcnN0YXRlW3N0YXJJZF0ucHVpZDtcbiAgICAgICAgICAgICAgICBpZiAob2ZmZW5zZSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0LnB1c2goXCLigIPigINBdHRhY2tlcnMgd2luIHdpdGggezB9IHNoaXBzIHJlbWFpbmluZ1wiLmZvcm1hdChvZmZlbnNlKSk7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGtfMSBpbiBjb250cmlidXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBrYV8xID0ga18xLnNwbGl0KFwiLFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmbGVldCA9IGZsZWV0c1trYV8xWzFdXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwbGF5ZXJJZCA9IGthXzFbMF07XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250cmlidXRpb25ba18xXSA9IChvZmZlbnNlICogY29udHJpYnV0aW9uW2tfMV0pIC8gYXR0YWNrZXJzQWdncmVnYXRlO1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV3QWdncmVnYXRlICs9IGNvbnRyaWJ1dGlvbltrXzFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBsYXllckNvbnRyaWJ1dGlvbltwbGF5ZXJJZF0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbGF5ZXJDb250cmlidXRpb25bcGxheWVySWRdICs9IGNvbnRyaWJ1dGlvbltrXzFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGxheWVyQ29udHJpYnV0aW9uW3BsYXllcklkXSA9IGNvbnRyaWJ1dGlvbltrXzFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBsYXllckNvbnRyaWJ1dGlvbltwbGF5ZXJJZF0gPiBiaWdnZXN0UGxheWVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmlnZ2VzdFBsYXllciA9IHBsYXllckNvbnRyaWJ1dGlvbltwbGF5ZXJJZF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmlnZ2VzdFBsYXllcklkID0gcGxheWVySWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXQucHVzaChcIuKAg+KAg+KAg+KAg1tbezB9XV0gaGFzIHsxfSBvbiBbW3syfV1dXCIuZm9ybWF0KGZsZWV0LnB1aWQsIGNvbnRyaWJ1dGlvbltrXzFdLCBmbGVldC5uKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgb3V0Y29tZVN0cmluZyA9IFwiV2lucyEgezB9IGxhbmQuXCIuZm9ybWF0KGNvbnRyaWJ1dGlvbltrXzFdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZsZWV0T3V0Y29tZXNbZmxlZXQudWlkXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBldGE6IHRpY2tUb0V0YVN0cmluZyhmbGVldC5ldGFGaXJzdCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0Y29tZTogb3V0Y29tZVN0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgb2ZmZW5zZSA9IG5ld0FnZ3JlZ2F0ZSAtIHBsYXllckNvbnRyaWJ1dGlvbltiaWdnZXN0UGxheWVySWRdO1xuICAgICAgICAgICAgICAgICAgICBzdGFyc3RhdGVbc3RhcklkXS5wdWlkID0gYmlnZ2VzdFBsYXllcklkO1xuICAgICAgICAgICAgICAgICAgICBzdGFyc3RhdGVbc3RhcklkXS5zaGlwcyA9IHBsYXllckNvbnRyaWJ1dGlvbltiaWdnZXN0UGxheWVySWRdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhcnN0YXRlW3N0YXJJZF0uc2hpcHMgPSBkZWZlbnNlO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpIGluIGFycml2YWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmbGVldCA9IGFycml2YWxbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmxlZXQucHVpZCA9PSBzdGFyc3RhdGVbc3RhcklkXS5wdWlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG91dGNvbWVTdHJpbmcgPSBcInswfSBzaGlwcyBvbiB7MX1cIi5mb3JtYXQoTWF0aC5mbG9vcihzdGFyc3RhdGVbc3RhcklkXS5zaGlwcyksIHN0YXJzW3N0YXJJZF0ubik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmxlZXRPdXRjb21lc1tmbGVldC51aWRdID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBldGE6IHRpY2tUb0V0YVN0cmluZyhmbGVldC5ldGFGaXJzdCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dGNvbWU6IG91dGNvbWVTdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBrXzIgaW4gY29udHJpYnV0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIga2FfMiA9IGtfMi5zcGxpdChcIixcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZmxlZXQgPSBmbGVldHNba2FfMlsxXV07XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgb3V0Y29tZVN0cmluZyA9IFwiTG9zZXMhIHswfSBsaXZlLlwiLmZvcm1hdChkZWZlbnNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZsZWV0T3V0Y29tZXNbZmxlZXQudWlkXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBldGE6IHRpY2tUb0V0YVN0cmluZyhmbGVldC5ldGFGaXJzdCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0Y29tZTogb3V0Y29tZVN0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYXR0YWNrZXJzQWdncmVnYXRlID0gb2ZmZW5zZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG91dHB1dC5wdXNoKFwi4oCD4oCDW1t7MH1dXSBbW3sxfV1dIHsyfSBzaGlwc1wiLmZvcm1hdChzdGFyc3RhdGVbc3RhcklkXS5wdWlkLCBzdGFyc1tzdGFySWRdLm4sIHN0YXJzdGF0ZVtzdGFySWRdLnNoaXBzKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICB9O1xuICAgIGZ1bmN0aW9uIGluY0NvbWJhdEhhbmRpY2FwKCkge1xuICAgICAgICBjb21iYXRIYW5kaWNhcCArPSAxO1xuICAgIH1cbiAgICBmdW5jdGlvbiBkZWNDb21iYXRIYW5kaWNhcCgpIHtcbiAgICAgICAgY29tYmF0SGFuZGljYXAgLT0gMTtcbiAgICB9XG4gICAgaG90a2V5KFwiLlwiLCBpbmNDb21iYXRIYW5kaWNhcCk7XG4gICAgaW5jQ29tYmF0SGFuZGljYXAuaGVscCA9XG4gICAgICAgIFwiQ2hhbmdlIGNvbWJhdCBjYWxjdWxhdGlvbiB0byBjcmVkaXQgeW91ciBlbmVtaWVzIHdpdGggKzEgd2VhcG9ucy4gVXNlZnVsIFwiICtcbiAgICAgICAgICAgIFwiaWYgeW91IHN1c3BlY3QgdGhleSB3aWxsIGhhdmUgYWNoaWV2ZWQgdGhlIG5leHQgbGV2ZWwgb2YgdGVjaCBiZWZvcmUgYSBiYXR0bGUgeW91IGFyZSBpbnZlc3RpZ2F0aW5nLlwiICtcbiAgICAgICAgICAgIFwiPHA+SW4gdGhlIGxvd2VyIGxlZnQgb2YgdGhlIEhVRCwgYW4gaW5kaWNhdG9yIHdpbGwgYXBwZWFyIHJlbWluZGluZyB5b3Ugb2YgdGhlIHdlYXBvbnMgYWRqdXN0bWVudC4gSWYgdGhlIFwiICtcbiAgICAgICAgICAgIFwiaW5kaWNhdG9yIGFscmVhZHkgc2hvd3MgYW4gYWR2YW50YWdlIGZvciBkZWZlbmRlcnMsIHRoaXMgaG90a2V5IHdpbGwgcmVkdWNlIHRoYXQgYWR2YW50YWdlIGZpcnN0IGJlZm9yZSBjcmVkaXRpbmcgXCIgK1xuICAgICAgICAgICAgXCJ3ZWFwb25zIHRvIHlvdXIgb3Bwb25lbnQuXCI7XG4gICAgaG90a2V5KFwiLFwiLCBkZWNDb21iYXRIYW5kaWNhcCk7XG4gICAgZGVjQ29tYmF0SGFuZGljYXAuaGVscCA9XG4gICAgICAgIFwiQ2hhbmdlIGNvbWJhdCBjYWxjdWxhdGlvbiB0byBjcmVkaXQgeW91cnNlbGYgd2l0aCArMSB3ZWFwb25zLiBVc2VmdWwgXCIgK1xuICAgICAgICAgICAgXCJ3aGVuIHlvdSB3aWxsIGhhdmUgYWNoaWV2ZWQgdGhlIG5leHQgbGV2ZWwgb2YgdGVjaCBiZWZvcmUgYSBiYXR0bGUgeW91IGFyZSBpbnZlc3RpZ2F0aW5nLlwiICtcbiAgICAgICAgICAgIFwiPHA+SW4gdGhlIGxvd2VyIGxlZnQgb2YgdGhlIEhVRCwgYW4gaW5kaWNhdG9yIHdpbGwgYXBwZWFyIHJlbWluZGluZyB5b3Ugb2YgdGhlIHdlYXBvbnMgYWRqdXN0bWVudC4gV2hlbiBcIiArXG4gICAgICAgICAgICBcImluZGljYXRvciBhbHJlYWR5IHNob3dzIGFuIGFkdmFudGFnZSBmb3IgYXR0YWNrZXJzLCB0aGlzIGhvdGtleSB3aWxsIHJlZHVjZSB0aGF0IGFkdmFudGFnZSBmaXJzdCBiZWZvcmUgY3JlZGl0aW5nIFwiICtcbiAgICAgICAgICAgIFwid2VhcG9ucyB0byB5b3UuXCI7XG4gICAgZnVuY3Rpb24gbG9uZ0ZsZWV0UmVwb3J0KCkge1xuICAgICAgICBjbGlwKGNvbWJhdE91dGNvbWVzKCkuam9pbihcIlxcblwiKSk7XG4gICAgfVxuICAgIGhvdGtleShcIiZcIiwgbG9uZ0ZsZWV0UmVwb3J0KTtcbiAgICBsb25nRmxlZXRSZXBvcnQuaGVscCA9XG4gICAgICAgIFwiR2VuZXJhdGUgYSBkZXRhaWxlZCBmbGVldCByZXBvcnQgb24gYWxsIGNhcnJpZXJzIGluIHlvdXIgc2Nhbm5pbmcgcmFuZ2UsIGFuZCBjb3B5IGl0IHRvIHRoZSBjbGlwYm9hcmQuXCIgK1xuICAgICAgICAgICAgXCI8cD5UaGlzIHNhbWUgcmVwb3J0IGNhbiBhbHNvIGJlIHZpZXdlZCB2aWEgdGhlIG1lbnU7IGVudGVyIHRoZSBhZ2VudCBhbmQgY2hvb3NlIGl0IGZyb20gdGhlIGRyb3Bkb3duLlwiO1xuICAgIGZ1bmN0aW9uIGJyaWVmRmxlZXRSZXBvcnQoKSB7XG4gICAgICAgIHZhciBfYTtcbiAgICAgICAgdmFyIGZsZWV0cyA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2UuZ2FsYXh5LmZsZWV0cztcbiAgICAgICAgdmFyIHN0YXJzID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5nYWxheHkuc3RhcnM7XG4gICAgICAgIHZhciBmbGlnaHRzID0gW107XG4gICAgICAgIGZvciAodmFyIGYgaW4gZmxlZXRzKSB7XG4gICAgICAgICAgICB2YXIgZmxlZXQgPSBmbGVldHNbZl07XG4gICAgICAgICAgICBpZiAoZmxlZXQubyAmJiBmbGVldC5vLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICB2YXIgc3RvcF8yID0gZmxlZXQub1swXVsxXTtcbiAgICAgICAgICAgICAgICB2YXIgdGlja3MgPSBmbGVldC5ldGFGaXJzdDtcbiAgICAgICAgICAgICAgICB2YXIgc3Rhcm5hbWUgPSAoX2EgPSBzdGFyc1tzdG9wXzJdKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2EubjtcbiAgICAgICAgICAgICAgICBpZiAoIXN0YXJuYW1lKVxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICBmbGlnaHRzLnB1c2goW1xuICAgICAgICAgICAgICAgICAgICB0aWNrcyxcbiAgICAgICAgICAgICAgICAgICAgXCJbW3swfV1dIFtbezF9XV0gezJ9IOKGkiBbW3szfV1dIHs0fVwiLmZvcm1hdChmbGVldC5wdWlkLCBmbGVldC5uLCBmbGVldC5zdCwgc3RhcnNbc3RvcF8yXS5uLCB0aWNrVG9FdGFTdHJpbmcodGlja3MsIFwiXCIpKSxcbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmbGlnaHRzID0gZmxpZ2h0cy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgICAgICByZXR1cm4gYVswXSAtIGJbMF07XG4gICAgICAgIH0pO1xuICAgICAgICBjbGlwKGZsaWdodHMubWFwKGZ1bmN0aW9uICh4KSB7IHJldHVybiB4WzFdOyB9KS5qb2luKFwiXFxuXCIpKTtcbiAgICB9XG4gICAgaG90a2V5KFwiXlwiLCBicmllZkZsZWV0UmVwb3J0KTtcbiAgICBicmllZkZsZWV0UmVwb3J0LmhlbHAgPVxuICAgICAgICBcIkdlbmVyYXRlIGEgc3VtbWFyeSBmbGVldCByZXBvcnQgb24gYWxsIGNhcnJpZXJzIGluIHlvdXIgc2Nhbm5pbmcgcmFuZ2UsIGFuZCBjb3B5IGl0IHRvIHRoZSBjbGlwYm9hcmQuXCIgK1xuICAgICAgICAgICAgXCI8cD5UaGlzIHNhbWUgcmVwb3J0IGNhbiBhbHNvIGJlIHZpZXdlZCB2aWEgdGhlIG1lbnU7IGVudGVyIHRoZSBhZ2VudCBhbmQgY2hvb3NlIGl0IGZyb20gdGhlIGRyb3Bkb3duLlwiO1xuICAgIGZ1bmN0aW9uIHNjcmVlbnNob3QoKSB7XG4gICAgICAgIHZhciBtYXAgPSBOZXB0dW5lc1ByaWRlLm5wdWkubWFwO1xuICAgICAgICBjbGlwKG1hcC5jYW52YXNbMF0udG9EYXRhVVJMKFwiaW1hZ2Uvd2VicFwiLCAwLjA1KSk7XG4gICAgfVxuICAgIGhvdGtleShcIiNcIiwgc2NyZWVuc2hvdCk7XG4gICAgc2NyZWVuc2hvdC5oZWxwID1cbiAgICAgICAgXCJDcmVhdGUgYSBkYXRhOiBVUkwgb2YgdGhlIGN1cnJlbnQgbWFwLiBQYXN0ZSBpdCBpbnRvIGEgYnJvd3NlciB3aW5kb3cgdG8gdmlldy4gVGhpcyBpcyBsaWtlbHkgdG8gYmUgcmVtb3ZlZC5cIjtcbiAgICB2YXIgaG9tZVBsYW5ldHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBwID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5nYWxheHkucGxheWVycztcbiAgICAgICAgdmFyIG91dHB1dCA9IFtdO1xuICAgICAgICBmb3IgKHZhciBpIGluIHApIHtcbiAgICAgICAgICAgIHZhciBob21lID0gcFtpXS5ob21lO1xuICAgICAgICAgICAgaWYgKGhvbWUpIHtcbiAgICAgICAgICAgICAgICBvdXRwdXQucHVzaChcIlBsYXllciAjezB9IGlzIFtbezB9XV0gaG9tZSB7Mn0gW1t7MX1dXVwiLmZvcm1hdChpLCBob21lLm4sIGkgPT0gaG9tZS5wdWlkID8gXCJpc1wiIDogXCJ3YXNcIikpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgb3V0cHV0LnB1c2goXCJQbGF5ZXIgI3swfSBpcyBbW3swfV1dIGhvbWUgdW5rbm93blwiLmZvcm1hdChpKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2xpcChvdXRwdXQuam9pbihcIlxcblwiKSk7XG4gICAgfTtcbiAgICBob3RrZXkoXCIhXCIsIGhvbWVQbGFuZXRzKTtcbiAgICBob21lUGxhbmV0cy5oZWxwID1cbiAgICAgICAgXCJHZW5lcmF0ZSBhIHBsYXllciBzdW1tYXJ5IHJlcG9ydCBhbmQgY29weSBpdCB0byB0aGUgY2xpcGJvYXJkLlwiICtcbiAgICAgICAgICAgIFwiPHA+VGhpcyBzYW1lIHJlcG9ydCBjYW4gYWxzbyBiZSB2aWV3ZWQgdmlhIHRoZSBtZW51OyBlbnRlciB0aGUgYWdlbnQgYW5kIGNob29zZSBpdCBmcm9tIHRoZSBkcm9wZG93bi4gXCIgK1xuICAgICAgICAgICAgXCJJdCBpcyBtb3N0IHVzZWZ1bCBmb3IgZGlzY292ZXJpbmcgcGxheWVyIG51bWJlcnMgc28gdGhhdCB5b3UgY2FuIHdyaXRlIFtbI11dIHRvIHJlZmVyZW5jZSBhIHBsYXllciBpbiBtYWlsLlwiO1xuICAgIHZhciBwbGF5ZXJTaGVldCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHAgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlLmdhbGF4eS5wbGF5ZXJzO1xuICAgICAgICB2YXIgb3V0cHV0ID0gW107XG4gICAgICAgIHZhciBmaWVsZHMgPSBbXG4gICAgICAgICAgICBcImFsaWFzXCIsXG4gICAgICAgICAgICBcInRvdGFsX3N0YXJzXCIsXG4gICAgICAgICAgICBcInNoaXBzUGVyVGlja1wiLFxuICAgICAgICAgICAgXCJ0b3RhbF9zdHJlbmd0aFwiLFxuICAgICAgICAgICAgXCJ0b3RhbF9lY29ub215XCIsXG4gICAgICAgICAgICBcInRvdGFsX2ZsZWV0c1wiLFxuICAgICAgICAgICAgXCJ0b3RhbF9pbmR1c3RyeVwiLFxuICAgICAgICAgICAgXCJ0b3RhbF9zY2llbmNlXCIsXG4gICAgICAgIF07XG4gICAgICAgIG91dHB1dC5wdXNoKGZpZWxkcy5qb2luKFwiLFwiKSk7XG4gICAgICAgIHZhciBfbG9vcF8zID0gZnVuY3Rpb24gKGkpIHtcbiAgICAgICAgICAgIHBsYXllciA9IF9fYXNzaWduKHt9LCBwW2ldKTtcbiAgICAgICAgICAgIHZhciByZWNvcmQgPSBmaWVsZHMubWFwKGZ1bmN0aW9uIChmKSB7IHJldHVybiBwW2ldW2ZdOyB9KTtcbiAgICAgICAgICAgIG91dHB1dC5wdXNoKHJlY29yZC5qb2luKFwiLFwiKSk7XG4gICAgICAgIH07XG4gICAgICAgIGZvciAodmFyIGkgaW4gcCkge1xuICAgICAgICAgICAgX2xvb3BfMyhpKTtcbiAgICAgICAgfVxuICAgICAgICBjbGlwKG91dHB1dC5qb2luKFwiXFxuXCIpKTtcbiAgICB9O1xuICAgIGhvdGtleShcIiRcIiwgcGxheWVyU2hlZXQpO1xuICAgIHBsYXllclNoZWV0LmhlbHAgPVxuICAgICAgICBcIkdlbmVyYXRlIGEgcGxheWVyIHN1bW1hcnkgbWVhbiB0byBiZSBtYWRlIGludG8gYSBzcHJlYWRzaGVldC5cIiArXG4gICAgICAgICAgICBcIjxwPlRoZSBjbGlwYm9hcmQgc2hvdWxkIGJlIHBhc3RlZCBpbnRvIGEgQ1NWIGFuZCB0aGVuIGltcG9ydGVkLlwiO1xuICAgIHZhciBob29rc0xvYWRlZCA9IGZhbHNlO1xuICAgIHZhciBoYW5kaWNhcFN0cmluZyA9IGZ1bmN0aW9uIChwcmVmaXgpIHtcbiAgICAgICAgdmFyIHAgPSBwcmVmaXggIT09IHVuZGVmaW5lZCA/IHByZWZpeCA6IGNvbWJhdEhhbmRpY2FwID4gMCA/IFwiRW5lbXkgV1NcIiA6IFwiTXkgV1NcIjtcbiAgICAgICAgcmV0dXJuIHAgKyAoY29tYmF0SGFuZGljYXAgPiAwID8gXCIrXCIgOiBcIlwiKSArIGNvbWJhdEhhbmRpY2FwO1xuICAgIH07XG4gICAgdmFyIGxvYWRIb29rcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHN1cGVyRHJhd1RleHQgPSBOZXB0dW5lc1ByaWRlLm5wdWkubWFwLmRyYXdUZXh0O1xuICAgICAgICBOZXB0dW5lc1ByaWRlLm5wdWkubWFwLmRyYXdUZXh0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHVuaXZlcnNlID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZTtcbiAgICAgICAgICAgIHZhciBtYXAgPSBOZXB0dW5lc1ByaWRlLm5wdWkubWFwO1xuICAgICAgICAgICAgc3VwZXJEcmF3VGV4dCgpO1xuICAgICAgICAgICAgbWFwLmNvbnRleHQuZm9udCA9IFwiXCIuY29uY2F0KDE0ICogbWFwLnBpeGVsUmF0aW8sIFwicHggT3BlblNhbnNSZWd1bGFyLCBzYW5zLXNlcmlmXCIpO1xuICAgICAgICAgICAgbWFwLmNvbnRleHQuZmlsbFN0eWxlID0gXCIjRkYwMDAwXCI7XG4gICAgICAgICAgICBtYXAuY29udGV4dC50ZXh0QWxpZ24gPSBcInJpZ2h0XCI7XG4gICAgICAgICAgICBtYXAuY29udGV4dC50ZXh0QmFzZWxpbmUgPSBcIm1pZGRsZVwiO1xuICAgICAgICAgICAgdmFyIHYgPSB2ZXJzaW9uO1xuICAgICAgICAgICAgaWYgKGNvbWJhdEhhbmRpY2FwICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgdiA9IFwiXCIuY29uY2F0KGhhbmRpY2FwU3RyaW5nKCksIFwiIFwiKS5jb25jYXQodik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkcmF3T3ZlcmxheVN0cmluZyhtYXAuY29udGV4dCwgdiwgbWFwLnZpZXdwb3J0V2lkdGggLSAxMCwgbWFwLnZpZXdwb3J0SGVpZ2h0IC0gMTYgKiBtYXAucGl4ZWxSYXRpbyk7XG4gICAgICAgICAgICBpZiAoTmVwdHVuZXNQcmlkZS5vcmlnaW5hbFBsYXllciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgTmVwdHVuZXNQcmlkZS5vcmlnaW5hbFBsYXllciA9IHVuaXZlcnNlLnBsYXllci51aWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoTmVwdHVuZXNQcmlkZS5vcmlnaW5hbFBsYXllciAhPT0gdW5pdmVyc2UucGxheWVyLnVpZCkge1xuICAgICAgICAgICAgICAgIHZhciBuID0gdW5pdmVyc2UuZ2FsYXh5LnBsYXllcnNbdW5pdmVyc2UucGxheWVyLnVpZF0uYWxpYXM7XG4gICAgICAgICAgICAgICAgZHJhd092ZXJsYXlTdHJpbmcobWFwLmNvbnRleHQsIG4sIG1hcC52aWV3cG9ydFdpZHRoIC0gMTAwLCBtYXAudmlld3BvcnRIZWlnaHQgLSAyICogMTYgKiBtYXAucGl4ZWxSYXRpbyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodW5pdmVyc2Uuc2VsZWN0ZWRGbGVldCAmJiB1bml2ZXJzZS5zZWxlY3RlZEZsZWV0LnBhdGgubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coXCJTZWxlY3RlZCBmbGVldFwiLCB1bml2ZXJzZS5zZWxlY3RlZEZsZWV0KTtcbiAgICAgICAgICAgICAgICBtYXAuY29udGV4dC5mb250ID0gXCJcIi5jb25jYXQoMTQgKiBtYXAucGl4ZWxSYXRpbywgXCJweCBPcGVuU2Fuc1JlZ3VsYXIsIHNhbnMtc2VyaWZcIik7XG4gICAgICAgICAgICAgICAgbWFwLmNvbnRleHQuZmlsbFN0eWxlID0gXCIjRkYwMDAwXCI7XG4gICAgICAgICAgICAgICAgbWFwLmNvbnRleHQudGV4dEFsaWduID0gXCJsZWZ0XCI7XG4gICAgICAgICAgICAgICAgbWFwLmNvbnRleHQudGV4dEJhc2VsaW5lID0gXCJtaWRkbGVcIjtcbiAgICAgICAgICAgICAgICB2YXIgZHkgPSB1bml2ZXJzZS5zZWxlY3RlZEZsZWV0LnkgLSB1bml2ZXJzZS5zZWxlY3RlZEZsZWV0Lmx5O1xuICAgICAgICAgICAgICAgIHZhciBkeCA9IHVuaXZlcnNlLnNlbGVjdGVkRmxlZXQueCAtIHVuaXZlcnNlLnNlbGVjdGVkRmxlZXQubHg7XG4gICAgICAgICAgICAgICAgZHkgPSB1bml2ZXJzZS5zZWxlY3RlZEZsZWV0LnBhdGhbMF0ueSAtIHVuaXZlcnNlLnNlbGVjdGVkRmxlZXQueTtcbiAgICAgICAgICAgICAgICBkeCA9IHVuaXZlcnNlLnNlbGVjdGVkRmxlZXQucGF0aFswXS54IC0gdW5pdmVyc2Uuc2VsZWN0ZWRGbGVldC54O1xuICAgICAgICAgICAgICAgIHZhciBsaW5lSGVpZ2h0ID0gMTYgKiBtYXAucGl4ZWxSYXRpbztcbiAgICAgICAgICAgICAgICB2YXIgcmFkaXVzID0gMiAqIDAuMDI4ICogbWFwLnNjYWxlICogbWFwLnBpeGVsUmF0aW87XG4gICAgICAgICAgICAgICAgdmFyIGFuZ2xlID0gTWF0aC5hdGFuKGR5IC8gZHgpO1xuICAgICAgICAgICAgICAgIHZhciBvZmZzZXR4ID0gcmFkaXVzICogTWF0aC5jb3MoYW5nbGUpO1xuICAgICAgICAgICAgICAgIHZhciBvZmZzZXR5ID0gcmFkaXVzICogTWF0aC5zaW4oYW5nbGUpO1xuICAgICAgICAgICAgICAgIGlmIChvZmZzZXR4ID4gMCAmJiBkeCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0eCAqPSAtMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG9mZnNldHkgPiAwICYmIGR5ID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBvZmZzZXR5ICo9IC0xO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAob2Zmc2V0eCA8IDAgJiYgZHggPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgIG9mZnNldHggKj0gLTE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChvZmZzZXR5IDwgMCAmJiBkeSA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0eSAqPSAtMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29tYmF0T3V0Y29tZXMoKTtcbiAgICAgICAgICAgICAgICB2YXIgcyA9IGZsZWV0T3V0Y29tZXNbdW5pdmVyc2Uuc2VsZWN0ZWRGbGVldC51aWRdLmV0YTtcbiAgICAgICAgICAgICAgICB2YXIgbyA9IGZsZWV0T3V0Y29tZXNbdW5pdmVyc2Uuc2VsZWN0ZWRGbGVldC51aWRdLm91dGNvbWU7XG4gICAgICAgICAgICAgICAgdmFyIHggPSBtYXAud29ybGRUb1NjcmVlblgodW5pdmVyc2Uuc2VsZWN0ZWRGbGVldC54KSArIG9mZnNldHg7XG4gICAgICAgICAgICAgICAgdmFyIHkgPSBtYXAud29ybGRUb1NjcmVlblkodW5pdmVyc2Uuc2VsZWN0ZWRGbGVldC55KSArIG9mZnNldHk7XG4gICAgICAgICAgICAgICAgaWYgKG9mZnNldHggPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgIG1hcC5jb250ZXh0LnRleHRBbGlnbiA9IFwicmlnaHRcIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZHJhd092ZXJsYXlTdHJpbmcobWFwLmNvbnRleHQsIHMsIHgsIHkpO1xuICAgICAgICAgICAgICAgIGRyYXdPdmVybGF5U3RyaW5nKG1hcC5jb250ZXh0LCBvLCB4LCB5ICsgbGluZUhlaWdodCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIU5lcHR1bmVzUHJpZGUuZ2FtZUNvbmZpZy50dXJuQmFzZWQgJiZcbiAgICAgICAgICAgICAgICB1bml2ZXJzZS50aW1lVG9UaWNrKDEpLmxlbmd0aCA8IDMpIHtcbiAgICAgICAgICAgICAgICB2YXIgbGluZUhlaWdodCA9IDE2ICogbWFwLnBpeGVsUmF0aW87XG4gICAgICAgICAgICAgICAgbWFwLmNvbnRleHQuZm9udCA9IFwiXCIuY29uY2F0KDE0ICogbWFwLnBpeGVsUmF0aW8sIFwicHggT3BlblNhbnNSZWd1bGFyLCBzYW5zLXNlcmlmXCIpO1xuICAgICAgICAgICAgICAgIG1hcC5jb250ZXh0LmZpbGxTdHlsZSA9IFwiI0ZGMDAwMFwiO1xuICAgICAgICAgICAgICAgIG1hcC5jb250ZXh0LnRleHRBbGlnbiA9IFwibGVmdFwiO1xuICAgICAgICAgICAgICAgIG1hcC5jb250ZXh0LnRleHRCYXNlbGluZSA9IFwibWlkZGxlXCI7XG4gICAgICAgICAgICAgICAgdmFyIHMgPSBcIlRpY2sgPCAxMHMgYXdheSFcIjtcbiAgICAgICAgICAgICAgICBpZiAodW5pdmVyc2UudGltZVRvVGljaygxKSA9PT0gXCIwc1wiKSB7XG4gICAgICAgICAgICAgICAgICAgIHMgPSBcIlRpY2sgcGFzc2VkLiBDbGljayBwcm9kdWN0aW9uIGNvdW50ZG93biB0byByZWZyZXNoLlwiO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBkcmF3T3ZlcmxheVN0cmluZyhtYXAuY29udGV4dCwgcywgMTAwMCwgbGluZUhlaWdodCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodW5pdmVyc2Uuc2VsZWN0ZWRTdGFyICYmXG4gICAgICAgICAgICAgICAgdW5pdmVyc2Uuc2VsZWN0ZWRTdGFyLnB1aWQgIT0gdW5pdmVyc2UucGxheWVyLnVpZCAmJlxuICAgICAgICAgICAgICAgIHVuaXZlcnNlLnNlbGVjdGVkU3Rhci5wdWlkICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIC8vIGVuZW15IHN0YXIgc2VsZWN0ZWQ7IHNob3cgSFVEIGZvciBzY2FubmluZyB2aXNpYmlsaXR5XG4gICAgICAgICAgICAgICAgbWFwLmNvbnRleHQudGV4dEFsaWduID0gXCJsZWZ0XCI7XG4gICAgICAgICAgICAgICAgbWFwLmNvbnRleHQudGV4dEJhc2VsaW5lID0gXCJtaWRkbGVcIjtcbiAgICAgICAgICAgICAgICB2YXIgeE9mZnNldCA9IDI2ICogbWFwLnBpeGVsUmF0aW87XG4gICAgICAgICAgICAgICAgLy9tYXAuY29udGV4dC50cmFuc2xhdGUoeE9mZnNldCwgMCk7XG4gICAgICAgICAgICAgICAgdmFyIGZsZWV0cyA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2UuZ2FsYXh5LmZsZWV0cztcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBmIGluIGZsZWV0cykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZmxlZXQgPSBmbGVldHNbZl07XG4gICAgICAgICAgICAgICAgICAgIGlmIChmbGVldC5wdWlkID09PSB1bml2ZXJzZS5wbGF5ZXIudWlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZHggPSB1bml2ZXJzZS5zZWxlY3RlZFN0YXIueCAtIGZsZWV0Lng7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZHkgPSB1bml2ZXJzZS5zZWxlY3RlZFN0YXIueSAtIGZsZWV0Lnk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGlzdGFuY2UgPSBNYXRoLnNxcnQoZHggKiBkeCArIGR5ICogZHkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG9mZnNldHggPSB4T2Zmc2V0O1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG9mZnNldHkgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHggPSBtYXAud29ybGRUb1NjcmVlblgoZmxlZXQueCkgKyBvZmZzZXR4O1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHkgPSBtYXAud29ybGRUb1NjcmVlblkoZmxlZXQueSkgKyBvZmZzZXR5O1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRpc3RhbmNlID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bml2ZXJzZS5nYWxheHkucGxheWVyc1t1bml2ZXJzZS5zZWxlY3RlZFN0YXIucHVpZF0udGVjaC5zY2FubmluZ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmxlZXQucGF0aCAmJiBmbGVldC5wYXRoLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZHggPSBmbGVldC5wYXRoWzBdLnggLSB1bml2ZXJzZS5zZWxlY3RlZFN0YXIueDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZHkgPSBmbGVldC5wYXRoWzBdLnkgLSB1bml2ZXJzZS5zZWxlY3RlZFN0YXIueTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzdGFuY2UgPSBNYXRoLnNxcnQoZHggKiBkeCArIGR5ICogZHkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGlzdGFuY2UgPFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5pdmVyc2UuZ2FsYXh5LnBsYXllcnNbdW5pdmVyc2Uuc2VsZWN0ZWRTdGFyLnB1aWRdLnRlY2hcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuc2Nhbm5pbmcudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzdGVwUmFkaXVzID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5nYWxheHkuZmxlZXRfc3BlZWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmxlZXQud2FycFNwZWVkKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ZXBSYWRpdXMgKj0gMztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGR4ID0gZmxlZXQueCAtIGZsZWV0LnBhdGhbMF0ueDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGR5ID0gZmxlZXQueSAtIGZsZWV0LnBhdGhbMF0ueTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBhbmdsZSA9IE1hdGguYXRhbihkeSAvIGR4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzdGVweCA9IHN0ZXBSYWRpdXMgKiBNYXRoLmNvcyhhbmdsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgc3RlcHkgPSBzdGVwUmFkaXVzICogTWF0aC5zaW4oYW5nbGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN0ZXB4ID4gMCAmJiBkeCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGVweCAqPSAtMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdGVweSA+IDAgJiYgZHkgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RlcHkgKj0gLTE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3RlcHggPCAwICYmIGR4IDwgMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ZXB4ICo9IC0xO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN0ZXB5IDwgMCAmJiBkeSA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGVweSAqPSAtMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0aWNrcyA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkbyB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHhfMSA9IHRpY2tzICogc3RlcHggKyBOdW1iZXIoZmxlZXQueCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHlfMSA9IHRpY2tzICogc3RlcHkgKyBOdW1iZXIoZmxlZXQueSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9sZXQgc3ggPSBtYXAud29ybGRUb1NjcmVlblgoeCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9sZXQgc3kgPSBtYXAud29ybGRUb1NjcmVlblkoeSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZHggPSB4XzEgLSB1bml2ZXJzZS5zZWxlY3RlZFN0YXIueDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkeSA9IHlfMSAtIHVuaXZlcnNlLnNlbGVjdGVkU3Rhci55O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3RhbmNlID0gTWF0aC5zcXJ0KGR4ICogZHggKyBkeSAqIGR5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGRpc3RhbmNlLCB4LCB5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2RyYXdPdmVybGF5U3RyaW5nKG1hcC5jb250ZXh0LCBcIm9cIiwgc3gsIHN5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aWNrcyArPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSB3aGlsZSAoZGlzdGFuY2UgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVuaXZlcnNlLmdhbGF4eS5wbGF5ZXJzW3VuaXZlcnNlLnNlbGVjdGVkU3Rhci5wdWlkXS50ZWNoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zY2FubmluZy52YWx1ZSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpY2tzIDw9IGZsZWV0LmV0YUZpcnN0ICsgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aWNrcyAtPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHZpc0NvbG9yID0gXCIjMDBmZjAwXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYW55U3RhckNhblNlZSh1bml2ZXJzZS5zZWxlY3RlZFN0YXIucHVpZCwgZmxlZXQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlzQ29sb3IgPSBcIiM4ODg4ODhcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRyYXdPdmVybGF5U3RyaW5nKG1hcC5jb250ZXh0LCBcIlNjYW4gXCIuY29uY2F0KHRpY2tUb0V0YVN0cmluZyh0aWNrcykpLCB4LCB5LCB2aXNDb2xvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy9tYXAuY29udGV4dC50cmFuc2xhdGUoLXhPZmZzZXQsIDApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHVuaXZlcnNlLnJ1bGVyLnN0YXJzLmxlbmd0aCA9PSAyKSB7XG4gICAgICAgICAgICAgICAgdmFyIHAxID0gdW5pdmVyc2UucnVsZXIuc3RhcnNbMF0ucHVpZDtcbiAgICAgICAgICAgICAgICB2YXIgcDIgPSB1bml2ZXJzZS5ydWxlci5zdGFyc1sxXS5wdWlkO1xuICAgICAgICAgICAgICAgIGlmIChwMSAhPT0gcDIgJiYgcDEgIT09IC0xICYmIHAyICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKFwidHdvIHN0YXIgcnVsZXJcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICAvL1RPRE86IExlYXJuIG1vcmUgYWJvdXQgdGhpcyBob29rLiBpdHMgcnVuIHRvbyBtdWNoLi5cbiAgICAgICAgQ3J1eC5mb3JtYXQgPSBmdW5jdGlvbiAocywgdGVtcGxhdGVEYXRhKSB7XG4gICAgICAgICAgICBpZiAoIXMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJlcnJvclwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGk7XG4gICAgICAgICAgICB2YXIgZnA7XG4gICAgICAgICAgICB2YXIgc3A7XG4gICAgICAgICAgICB2YXIgc3ViO1xuICAgICAgICAgICAgdmFyIHBhdHRlcm47XG4gICAgICAgICAgICBpID0gMDtcbiAgICAgICAgICAgIGZwID0gMDtcbiAgICAgICAgICAgIHNwID0gMDtcbiAgICAgICAgICAgIHN1YiA9IFwiXCI7XG4gICAgICAgICAgICBwYXR0ZXJuID0gXCJcIjtcbiAgICAgICAgICAgIC8vIGxvb2sgZm9yIHN0YW5kYXJkIHBhdHRlcm5zXG4gICAgICAgICAgICB3aGlsZSAoZnAgPj0gMCAmJiBpIDwgMTAwMCkge1xuICAgICAgICAgICAgICAgIGkgPSBpICsgMTtcbiAgICAgICAgICAgICAgICBmcCA9IHMuc2VhcmNoKFwiXFxcXFtcXFxcW1wiKTtcbiAgICAgICAgICAgICAgICBzcCA9IHMuc2VhcmNoKFwiXFxcXF1cXFxcXVwiKTtcbiAgICAgICAgICAgICAgICBzdWIgPSBzLnNsaWNlKGZwICsgMiwgc3ApO1xuICAgICAgICAgICAgICAgIHZhciB1cmkgPSBzdWIucmVwbGFjZUFsbChcIiYjeDJGO1wiLCBcIi9cIik7XG4gICAgICAgICAgICAgICAgcGF0dGVybiA9IFwiW1tcIi5jb25jYXQoc3ViLCBcIl1dXCIpO1xuICAgICAgICAgICAgICAgIGlmICh0ZW1wbGF0ZURhdGFbc3ViXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHMgPSBzLnJlcGxhY2UocGF0dGVybiwgdGVtcGxhdGVEYXRhW3N1Yl0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmICgvXmFwaTpcXHd7Nn0kLy50ZXN0KHN1YikpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGFwaUxpbmsgPSBcIjxhIG9uQ2xpY2s9J0NydXguY3J1eC50cmlnZ2VyKFxcXCJzd2l0Y2hfdXNlcl9hcGlcXFwiLCBcXFwiXCIuY29uY2F0KHN1YiwgXCJcXFwiKSc+IFZpZXcgYXMgXCIpLmNvbmNhdChzdWIsIFwiPC9hPlwiKTtcbiAgICAgICAgICAgICAgICAgICAgYXBpTGluayArPSBcIiBvciA8YSBvbkNsaWNrPSdDcnV4LmNydXgudHJpZ2dlcihcXFwibWVyZ2VfdXNlcl9hcGlcXFwiLCBcXFwiXCIuY29uY2F0KHN1YiwgXCJcXFwiKSc+IE1lcmdlIFwiKS5jb25jYXQoc3ViLCBcIjwvYT5cIik7XG4gICAgICAgICAgICAgICAgICAgIHMgPSBzLnJlcGxhY2UocGF0dGVybiwgYXBpTGluayk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGlzX3ZhbGlkX2ltYWdlX3VybCh1cmkpKSB7XG4gICAgICAgICAgICAgICAgICAgIHMgPSBzLnJlcGxhY2UocGF0dGVybiwgXCI8aW1nIHdpZHRoPVxcXCIxMDAlXFxcIiBzcmM9J1wiLmNvbmNhdCh1cmksIFwiJyAvPlwiKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGlzX3ZhbGlkX3lvdXR1YmUodXJpKSkge1xuICAgICAgICAgICAgICAgICAgICAvL1Bhc3NcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHMgPSBzLnJlcGxhY2UocGF0dGVybiwgXCIoXCIuY29uY2F0KHN1YiwgXCIpXCIpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcztcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIG5wdWkgPSBOZXB0dW5lc1ByaWRlLm5wdWk7XG4gICAgICAgIC8vUmVzZWFyY2ggYnV0dG9uIHRvIHF1aWNrbHkgdGVsbCBmcmllbmRzIHJlc2VhcmNoXG4gICAgICAgIE5lcHR1bmVzUHJpZGUudGVtcGxhdGVzW1wibnBhX3Jlc2VhcmNoXCJdID0gXCJSZXNlYXJjaFwiO1xuICAgICAgICB2YXIgc3VwZXJOZXdNZXNzYWdlQ29tbWVudEJveCA9IG5wdWkuTmV3TWVzc2FnZUNvbW1lbnRCb3g7XG4gICAgICAgIHZhciByZXBvcnRSZXNlYXJjaEhvb2sgPSBmdW5jdGlvbiAoX2UsIF9kKSB7XG4gICAgICAgICAgICB2YXIgdGV4dCA9IGdldF9yZXNlYXJjaF90ZXh0KE5lcHR1bmVzUHJpZGUpO1xuICAgICAgICAgICAgY29uc29sZS5sb2codGV4dCk7XG4gICAgICAgICAgICB2YXIgaW5ib3ggPSBOZXB0dW5lc1ByaWRlLmluYm94O1xuICAgICAgICAgICAgaW5ib3guY29tbWVudERyYWZ0c1tpbmJveC5zZWxlY3RlZE1lc3NhZ2Uua2V5XSArPSB0ZXh0O1xuICAgICAgICAgICAgaW5ib3gudHJpZ2dlcihcInNob3dfc2NyZWVuXCIsIFwiZGlwbG9tYWN5X2RldGFpbFwiKTtcbiAgICAgICAgfTtcbiAgICAgICAgTmVwdHVuZXNQcmlkZS5ucC5vbihcInBhc3RlX3Jlc2VhcmNoXCIsIHJlcG9ydFJlc2VhcmNoSG9vayk7XG4gICAgICAgIG5wdWkuTmV3TWVzc2FnZUNvbW1lbnRCb3ggPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgd2lkZ2V0ID0gc3VwZXJOZXdNZXNzYWdlQ29tbWVudEJveCgpO1xuICAgICAgICAgICAgdmFyIHJlc2VhcmNoX2J1dHRvbiA9IENydXguQnV0dG9uKFwibnBhX3Jlc2VhcmNoXCIsIFwicGFzdGVfcmVzZWFyY2hcIiwgXCJyZXNlYXJjaFwiKS5ncmlkKDExLCAxMiwgOCwgMyk7XG4gICAgICAgICAgICByZXNlYXJjaF9idXR0b24ucm9vc3Qod2lkZ2V0KTtcbiAgICAgICAgICAgIHJldHVybiB3aWRnZXQ7XG4gICAgICAgIH07XG4gICAgICAgIHZhciBzdXBlckZvcm1hdFRpbWUgPSBDcnV4LmZvcm1hdFRpbWU7XG4gICAgICAgIHZhciByZWxhdGl2ZVRpbWVzID0gMDtcbiAgICAgICAgQ3J1eC5mb3JtYXRUaW1lID0gZnVuY3Rpb24gKG1zLCBtaW5zLCBzZWNzKSB7XG4gICAgICAgICAgICBzd2l0Y2ggKHJlbGF0aXZlVGltZXMpIHtcbiAgICAgICAgICAgICAgICBjYXNlIDA6IC8vc3RhbmRhcmRcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN1cGVyRm9ybWF0VGltZShtcywgbWlucywgc2Vjcyk7XG4gICAgICAgICAgICAgICAgY2FzZSAxOiAvL0VUQSwgLSB0dXJuKHMpIGZvciB0dXJuYmFzZWRcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFOZXB0dW5lc1ByaWRlLmdhbWVDb25maWcudHVybkJhc2VkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbXNUb0V0YVN0cmluZyhtcywgXCJcIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdGlja19yYXRlID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5nYWxheHkudGlja19yYXRlO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiXCIuY29uY2F0KHN1cGVyRm9ybWF0VGltZShtcywgbWlucywgc2VjcyksIFwiIC0gXCIpLmNvbmNhdCgoKChtcyAvIDM2MDAwMDApICogMTApIC9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aWNrX3JhdGUpLnRvRml4ZWQoMiksIFwiIHR1cm4ocylcIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXNlIDI6IC8vY3ljbGVzICsgdGlja3MgZm9ybWF0XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtc1RvQ3ljbGVTdHJpbmcobXMsIFwiXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICB2YXIgc3dpdGNoVGltZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvLzAgPSBzdGFuZGFyZCwgMSA9IEVUQSwgLSB0dXJuKHMpIGZvciB0dXJuYmFzZWQsIDIgPSBjeWNsZXMgKyB0aWNrcyBmb3JtYXRcbiAgICAgICAgICAgIHJlbGF0aXZlVGltZXMgPSAocmVsYXRpdmVUaW1lcyArIDEpICUgMztcbiAgICAgICAgfTtcbiAgICAgICAgaG90a2V5KFwiJVwiLCBzd2l0Y2hUaW1lcyk7XG4gICAgICAgIHN3aXRjaFRpbWVzLmhlbHAgPVxuICAgICAgICAgICAgXCJDaGFuZ2UgdGhlIGRpc3BsYXkgb2YgRVRBcyBiZXR3ZWVuIHJlbGF0aXZlIHRpbWVzLCBhYnNvbHV0ZSBjbG9jayB0aW1lcywgYW5kIGN5Y2xlIHRpbWVzLiBNYWtlcyBwcmVkaWN0aW5nIFwiICtcbiAgICAgICAgICAgICAgICBcImltcG9ydGFudCB0aW1lcyBvZiBkYXkgdG8gc2lnbiBpbiBhbmQgY2hlY2sgbXVjaCBlYXNpZXIgZXNwZWNpYWxseSBmb3IgbXVsdGktbGVnIGZsZWV0IG1vdmVtZW50cy4gU29tZXRpbWVzIHlvdSBcIiArXG4gICAgICAgICAgICAgICAgXCJ3aWxsIG5lZWQgdG8gcmVmcmVzaCB0aGUgZGlzcGxheSB0byBzZWUgdGhlIGRpZmZlcmVudCB0aW1lcy5cIjtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShDcnV4LCBcInRvdWNoRW5hYmxlZFwiLCB7XG4gICAgICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiBmYWxzZTsgfSxcbiAgICAgICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh4KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQ3J1eC50b3VjaEVuYWJsZWQgc2V0IGlnbm9yZWRcIiwgeCk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlKTtcbiAgICAgICAgfVxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoTmVwdHVuZXNQcmlkZS5ucHVpLm1hcCwgXCJpZ25vcmVNb3VzZUV2ZW50c1wiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIGZhbHNlOyB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAoeCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiTmVwdHVuZXNQcmlkZS5ucHVpLm1hcC5pZ25vcmVNb3VzZUV2ZW50cyBzZXQgaWdub3JlZFwiLCB4KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgICAgICBob29rc0xvYWRlZCA9IHRydWU7XG4gICAgfTtcbiAgICB2YXIgaW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIF9hO1xuICAgICAgICBpZiAoKChfYSA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2UpID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5nYWxheHkpICYmIE5lcHR1bmVzUHJpZGUubnB1aS5tYXApIHtcbiAgICAgICAgICAgIGxpbmtGbGVldHMoKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRmxlZXQgbGlua2luZyBjb21wbGV0ZS5cIik7XG4gICAgICAgICAgICBpZiAoIWhvb2tzTG9hZGVkKSB7XG4gICAgICAgICAgICAgICAgbG9hZEhvb2tzKCk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJIVUQgc2V0dXAgY29tcGxldGUuXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJIVUQgc2V0dXAgYWxyZWFkeSBkb25lOyBza2lwcGluZy5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBob21lUGxhbmV0cygpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJHYW1lIG5vdCBmdWxseSBpbml0aWFsaXplZCB5ZXQ7IHdhaXQuXCIsIE5lcHR1bmVzUHJpZGUudW5pdmVyc2UpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBob3RrZXkoXCJAXCIsIGluaXQpO1xuICAgIGluaXQuaGVscCA9XG4gICAgICAgIFwiUmVpbml0aWFsaXplIE5lcHR1bmUncyBQcmlkZSBBZ2VudC4gVXNlIHRoZSBAIGhvdGtleSBpZiB0aGUgdmVyc2lvbiBpcyBub3QgYmVpbmcgc2hvd24gb24gdGhlIG1hcCBhZnRlciBkcmFnZ2luZy5cIjtcbiAgICBpZiAoKChfYiA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2UpID09PSBudWxsIHx8IF9iID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYi5nYWxheHkpICYmIE5lcHR1bmVzUHJpZGUubnB1aS5tYXApIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJVbml2ZXJzZSBhbHJlYWR5IGxvYWRlZC4gSHlwZXJsaW5rIGZsZWV0cyAmIGxvYWQgaG9va3MuXCIpO1xuICAgICAgICBpbml0KCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyhcIlVuaXZlcnNlIG5vdCBsb2FkZWQuIEhvb2sgb25TZXJ2ZXJSZXNwb25zZS5cIik7XG4gICAgICAgIHZhciBzdXBlck9uU2VydmVyUmVzcG9uc2VfMSA9IE5lcHR1bmVzUHJpZGUubnAub25TZXJ2ZXJSZXNwb25zZTtcbiAgICAgICAgTmVwdHVuZXNQcmlkZS5ucC5vblNlcnZlclJlc3BvbnNlID0gZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICBzdXBlck9uU2VydmVyUmVzcG9uc2VfMShyZXNwb25zZSk7XG4gICAgICAgICAgICBpZiAocmVzcG9uc2UuZXZlbnQgPT09IFwib3JkZXI6cGxheWVyX2FjaGlldmVtZW50c1wiKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJJbml0aWFsIGxvYWQgY29tcGxldGUuIFJlaW5zdGFsbC5cIik7XG4gICAgICAgICAgICAgICAgaW5pdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAocmVzcG9uc2UuZXZlbnQgPT09IFwib3JkZXI6ZnVsbF91bml2ZXJzZVwiKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJVbml2ZXJzZSByZWNlaXZlZC4gUmVpbnN0YWxsLlwiKTtcbiAgICAgICAgICAgICAgICBOZXB0dW5lc1ByaWRlLm9yaWdpbmFsUGxheWVyID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5wbGF5ZXIudWlkO1xuICAgICAgICAgICAgICAgIGluaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKCFob29rc0xvYWRlZCAmJiBOZXB0dW5lc1ByaWRlLm5wdWkubWFwKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJIb29rcyBuZWVkIGxvYWRpbmcgYW5kIG1hcCBpcyByZWFkeS4gUmVpbnN0YWxsLlwiKTtcbiAgICAgICAgICAgICAgICBpbml0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuICAgIHZhciBvdGhlclVzZXJDb2RlID0gdW5kZWZpbmVkO1xuICAgIHZhciBnYW1lID0gTmVwdHVuZXNQcmlkZS5nYW1lTnVtYmVyO1xuICAgIC8vVGhpcyBwdXRzIHlvdSBpbnRvIHRoZWlyIHBvc2l0aW9uLlxuICAgIC8vSG93IGlzIGl0IGRpZmZlcmVudD9cbiAgICB2YXIgc3dpdGNoVXNlciA9IGZ1bmN0aW9uIChldmVudCwgZGF0YSkge1xuICAgICAgICBpZiAoTmVwdHVuZXNQcmlkZS5vcmlnaW5hbFBsYXllciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBOZXB0dW5lc1ByaWRlLm9yaWdpbmFsUGxheWVyID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5wbGF5ZXIudWlkO1xuICAgICAgICB9XG4gICAgICAgIHZhciBjb2RlID0gKGRhdGEgPT09IG51bGwgfHwgZGF0YSA9PT0gdm9pZCAwID8gdm9pZCAwIDogZGF0YS5zcGxpdChcIjpcIilbMV0pIHx8IG90aGVyVXNlckNvZGU7XG4gICAgICAgIG90aGVyVXNlckNvZGUgPSBjb2RlO1xuICAgICAgICBpZiAob3RoZXJVc2VyQ29kZSkge1xuICAgICAgICAgICAgdmFyIHBhcmFtcyA9IHtcbiAgICAgICAgICAgICAgICBnYW1lX251bWJlcjogZ2FtZSxcbiAgICAgICAgICAgICAgICBhcGlfdmVyc2lvbjogXCIwLjFcIixcbiAgICAgICAgICAgICAgICBjb2RlOiBvdGhlclVzZXJDb2RlLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHZhciBlZ2dlcnMgPSBqUXVlcnkuYWpheCh7XG4gICAgICAgICAgICAgICAgdHlwZTogXCJQT1NUXCIsXG4gICAgICAgICAgICAgICAgdXJsOiBcImh0dHBzOi8vbnAuaXJvbmhlbG1ldC5jb20vYXBpXCIsXG4gICAgICAgICAgICAgICAgYXN5bmM6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGRhdGE6IHBhcmFtcyxcbiAgICAgICAgICAgICAgICBkYXRhVHlwZTogXCJqc29uXCIsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vTG9hZHMgdGhlIHB1bGwgdW5pdmVyc2UgZGF0YSBpbnRvIHRoZSBmdW5jdGlvbi4gVGhhdHMgdGhlIGRpZmZlcmVuY2UuXG4gICAgICAgICAgICAvL1RoZSBvdGhlciB2ZXJzaW9uIGxvYWRzIGFuIHVwZGF0ZWQgZ2FsYXh5IGludG8gdGhlIGZ1bmN0aW9uXG4gICAgICAgICAgICBOZXB0dW5lc1ByaWRlLm5wLm9uRnVsbFVuaXZlcnNlKG51bGwsIGVnZ2Vycy5yZXNwb25zZUpTT04uc2Nhbm5pbmdfZGF0YSk7XG4gICAgICAgICAgICBOZXB0dW5lc1ByaWRlLm5wdWkub25IaWRlU2NyZWVuKG51bGwsIHRydWUpO1xuICAgICAgICAgICAgTmVwdHVuZXNQcmlkZS5ucC50cmlnZ2VyKFwic2VsZWN0X3BsYXllclwiLCBbXG4gICAgICAgICAgICAgICAgTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5wbGF5ZXIudWlkLFxuICAgICAgICAgICAgICAgIHRydWUsXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIGluaXQoKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgaG90a2V5KFwiPlwiLCBzd2l0Y2hVc2VyKTtcbiAgICBzd2l0Y2hVc2VyLmhlbHAgPVxuICAgICAgICBcIlN3aXRjaCB2aWV3cyB0byB0aGUgbGFzdCB1c2VyIHdob3NlIEFQSSBrZXkgd2FzIHVzZWQgdG8gbG9hZCBkYXRhLiBUaGUgSFVEIHNob3dzIHRoZSBjdXJyZW50IHVzZXIgd2hlbiBcIiArXG4gICAgICAgICAgICBcIml0IGlzIG5vdCB5b3VyIG93biBhbGlhcyB0byBoZWxwIHJlbWluZCB5b3UgdGhhdCB5b3UgYXJlbid0IGluIGNvbnRyb2wgb2YgdGhpcyB1c2VyLlwiO1xuICAgIGhvdGtleShcInxcIiwgbWVyZ2VVc2VyKTtcbiAgICBtZXJnZVVzZXIuaGVscCA9XG4gICAgICAgIFwiTWVyZ2UgdGhlIGxhdGVzdCBkYXRhIGZyb20gdGhlIGxhc3QgdXNlciB3aG9zZSBBUEkga2V5IHdhcyB1c2VkIHRvIGxvYWQgZGF0YS4gVGhpcyBpcyB1c2VmdWwgYWZ0ZXIgYSB0aWNrIFwiICtcbiAgICAgICAgICAgIFwicGFzc2VzIGFuZCB5b3UndmUgcmVsb2FkZWQsIGJ1dCB5b3Ugc3RpbGwgd2FudCB0aGUgbWVyZ2VkIHNjYW4gZGF0YSBmcm9tIHR3byBwbGF5ZXJzIG9uc2NyZWVuLlwiO1xuICAgIE5lcHR1bmVzUHJpZGUubnAub24oXCJzd2l0Y2hfdXNlcl9hcGlcIiwgc3dpdGNoVXNlcik7XG4gICAgTmVwdHVuZXNQcmlkZS5ucC5vbihcIm1lcmdlX3VzZXJfYXBpXCIsIG1lcmdlVXNlcik7XG4gICAgdmFyIG5wYUhlbHAgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBoZWxwID0gW1wiPEgxPlwiLmNvbmNhdCh0aXRsZSwgXCI8L0gxPlwiKV07XG4gICAgICAgIGZvciAodmFyIHBhaXIgaW4gaG90a2V5cykge1xuICAgICAgICAgICAgdmFyIGtleSA9IGhvdGtleXNbcGFpcl1bMF07XG4gICAgICAgICAgICB2YXIgYWN0aW9uID0gaG90a2V5c1twYWlyXVsxXTtcbiAgICAgICAgICAgIGhlbHAucHVzaChcIjxoMj5Ib3RrZXk6IFwiLmNvbmNhdChrZXksIFwiPC9oMj5cIikpO1xuICAgICAgICAgICAgaWYgKGFjdGlvbi5oZWxwKSB7XG4gICAgICAgICAgICAgICAgaGVscC5wdXNoKGFjdGlvbi5oZWxwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGhlbHAucHVzaChcIjxwPk5vIGRvY3VtZW50YXRpb24geWV0LjxwPjxjb2RlPlwiLmNvbmNhdChhY3Rpb24udG9Mb2NhbGVTdHJpbmcoKSwgXCI8L2NvZGU+XCIpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlLmhlbHBIVE1MID0gaGVscC5qb2luKFwiXCIpO1xuICAgICAgICBOZXB0dW5lc1ByaWRlLm5wLnRyaWdnZXIoXCJzaG93X3NjcmVlblwiLCBcImhlbHBcIik7XG4gICAgfTtcbiAgICBucGFIZWxwLmhlbHAgPSBcIkRpc3BsYXkgdGhpcyBoZWxwIHNjcmVlbi5cIjtcbiAgICBob3RrZXkoXCI/XCIsIG5wYUhlbHApO1xuICAgIHZhciBhdXRvY29tcGxldGVNb2RlID0gMDtcbiAgICB2YXIgYXV0b2NvbXBsZXRlVHJpZ2dlciA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGlmIChlLnRhcmdldC50eXBlID09PSBcInRleHRhcmVhXCIpIHtcbiAgICAgICAgICAgIGlmIChhdXRvY29tcGxldGVNb2RlKSB7XG4gICAgICAgICAgICAgICAgdmFyIHN0YXJ0ID0gYXV0b2NvbXBsZXRlTW9kZTtcbiAgICAgICAgICAgICAgICB2YXIgZW5kQnJhY2tldCA9IGUudGFyZ2V0LnZhbHVlLmluZGV4T2YoXCJdXCIsIHN0YXJ0KTtcbiAgICAgICAgICAgICAgICBpZiAoZW5kQnJhY2tldCA9PT0gLTEpXG4gICAgICAgICAgICAgICAgICAgIGVuZEJyYWNrZXQgPSBlLnRhcmdldC52YWx1ZS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgdmFyIGF1dG9TdHJpbmcgPSBlLnRhcmdldC52YWx1ZS5zdWJzdHJpbmcoc3RhcnQsIGVuZEJyYWNrZXQpO1xuICAgICAgICAgICAgICAgIHZhciBrZXkgPSBlLmtleTtcbiAgICAgICAgICAgICAgICBpZiAoa2V5ID09PSBcIl1cIikge1xuICAgICAgICAgICAgICAgICAgICBhdXRvY29tcGxldGVNb2RlID0gMDtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG0gPSBhdXRvU3RyaW5nLm1hdGNoKC9eWzAtOV1bMC05XSokLyk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChtID09PSBudWxsIHx8IG0gPT09IHZvaWQgMCA/IHZvaWQgMCA6IG0ubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcHVpZCA9IE51bWJlcihhdXRvU3RyaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBlbmQgPSBlLnRhcmdldC5zZWxlY3Rpb25FbmQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgYXV0byA9IFwiXCIuY29uY2F0KHB1aWQsIFwiXV0gXCIpLmNvbmNhdChOZXB0dW5lc1ByaWRlLnVuaXZlcnNlLmdhbGF4eS5wbGF5ZXJzW3B1aWRdLmFsaWFzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGUudGFyZ2V0LnZhbHVlID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlLnRhcmdldC52YWx1ZS5zdWJzdHJpbmcoMCwgc3RhcnQpICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXV0byArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUudGFyZ2V0LnZhbHVlLnN1YnN0cmluZyhlbmQsIGUudGFyZ2V0LnZhbHVlLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBlLnRhcmdldC5zZWxlY3Rpb25TdGFydCA9IHN0YXJ0ICsgYXV0by5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgICAgICBlLnRhcmdldC5zZWxlY3Rpb25FbmQgPSBzdGFydCArIGF1dG8ubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoZS50YXJnZXQuc2VsZWN0aW9uU3RhcnQgPiAxKSB7XG4gICAgICAgICAgICAgICAgdmFyIHN0YXJ0ID0gZS50YXJnZXQuc2VsZWN0aW9uU3RhcnQgLSAyO1xuICAgICAgICAgICAgICAgIHZhciBzcyA9IGUudGFyZ2V0LnZhbHVlLnN1YnN0cmluZyhzdGFydCwgc3RhcnQgKyAyKTtcbiAgICAgICAgICAgICAgICBhdXRvY29tcGxldGVNb2RlID0gc3MgPT09IFwiW1tcIiA/IGUudGFyZ2V0LnNlbGVjdGlvblN0YXJ0IDogMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG4gICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKFwia2V5dXBcIiwgYXV0b2NvbXBsZXRlVHJpZ2dlcik7XG4gICAgY29uc29sZS5sb2coXCJTQVQ6IE5lcHR1bmUncyBQcmlkZSBBZ2VudCBpbmplY3Rpb24gZmluaXNoZWQuXCIpO1xuICAgIGNvbnNvbGUubG9nKFwiR2V0dGluZyBoZXJvIVwiLCBnZXRfaGVybyhOZXB0dW5lc1ByaWRlLnVuaXZlcnNlKSk7XG59XG52YXIgZm9yY2VfYWRkX2N1c3RvbV9wbGF5ZXJfcGFuZWwgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKFwiUGxheWVyUGFuZWxcIiBpbiBOZXB0dW5lc1ByaWRlLm5wdWkpIHtcbiAgICAgICAgYWRkX2N1c3RvbV9wbGF5ZXJfcGFuZWwoKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHNldFRpbWVvdXQoYWRkX2N1c3RvbV9wbGF5ZXJfcGFuZWwsIDMwMDApO1xuICAgIH1cbn07XG52YXIgYWRkX2N1c3RvbV9wbGF5ZXJfcGFuZWwgPSBmdW5jdGlvbiAoKSB7XG4gICAgTmVwdHVuZXNQcmlkZS5ucHVpLlBsYXllclBhbmVsID0gZnVuY3Rpb24gKHBsYXllciwgc2hvd0VtcGlyZSkge1xuICAgICAgICB2YXIgdW5pdmVyc2UgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlO1xuICAgICAgICB2YXIgbnB1aSA9IE5lcHR1bmVzUHJpZGUubnB1aTtcbiAgICAgICAgdmFyIHBsYXllclBhbmVsID0gQ3J1eC5XaWRnZXQoXCJyZWxcIikuc2l6ZSg0ODAsIDI2NCAtIDggKyA0OCk7XG4gICAgICAgIHZhciBoZWFkaW5nID0gXCJwbGF5ZXJcIjtcbiAgICAgICAgaWYgKHVuaXZlcnNlLnBsYXllckFjaGlldmVtZW50cyAmJlxuICAgICAgICAgICAgTmVwdHVuZXNQcmlkZS5nYW1lQ29uZmlnLmFub255bWl0eSA9PT0gMCkge1xuICAgICAgICAgICAgaWYgKHVuaXZlcnNlLnBsYXllckFjaGlldmVtZW50c1twbGF5ZXIudWlkXSkge1xuICAgICAgICAgICAgICAgIGlmICh1bml2ZXJzZS5wbGF5ZXJBY2hpZXZlbWVudHNbcGxheWVyLnVpZF0ucHJlbWl1bSA9PT0gXCJwcmVtaXVtXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgaGVhZGluZyA9IFwicHJlbWl1bV9wbGF5ZXJcIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHVuaXZlcnNlLnBsYXllckFjaGlldmVtZW50c1twbGF5ZXIudWlkXS5wcmVtaXVtID09PSBcImxpZmV0aW1lXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgaGVhZGluZyA9IFwibGlmZXRpbWVfcHJlbWl1bV9wbGF5ZXJcIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgQ3J1eC5UZXh0KGhlYWRpbmcsIFwic2VjdGlvbl90aXRsZSBjb2xfYmxhY2tcIilcbiAgICAgICAgICAgIC5ncmlkKDAsIDAsIDMwLCAzKVxuICAgICAgICAgICAgLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgaWYgKHBsYXllci5haSkge1xuICAgICAgICAgICAgQ3J1eC5UZXh0KFwiYWlfYWRtaW5cIiwgXCJ0eHRfcmlnaHQgcGFkMTJcIilcbiAgICAgICAgICAgICAgICAuZ3JpZCgwLCAwLCAzMCwgMylcbiAgICAgICAgICAgICAgICAucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICB9XG4gICAgICAgIENydXguSW1hZ2UoXCIuLi9pbWFnZXMvYXZhdGFycy8xNjAvXCIuY29uY2F0KHBsYXllci5hdmF0YXIsIFwiLmpwZ1wiKSwgXCJhYnNcIilcbiAgICAgICAgICAgIC5ncmlkKDAsIDYsIDEwLCAxMClcbiAgICAgICAgICAgIC5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgIENydXguV2lkZ2V0KFwicGNpXzQ4X1wiLmNvbmNhdChwbGF5ZXIudWlkKSkuZ3JpZCg3LCAxMywgMywgMykucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICBDcnV4LldpZGdldChcImNvbF9hY2NlbnRcIikuZ3JpZCgwLCAzLCAzMCwgMykucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICBDcnV4LlRleHQoXCJcIiwgXCJzY3JlZW5fc3VidGl0bGVcIilcbiAgICAgICAgICAgIC5ncmlkKDAsIDMsIDMwLCAzKVxuICAgICAgICAgICAgLnJhd0hUTUwocGxheWVyLnF1YWxpZmllZEFsaWFzKVxuICAgICAgICAgICAgLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgLy8gQWNoaWV2ZW1lbnRzXG4gICAgICAgIHZhciBteUFjaGlldmVtZW50cztcbiAgICAgICAgLy9VPT5Ub3hpY1xuICAgICAgICAvL1Y9Pk1hZ2ljXG4gICAgICAgIC8vNT0+RmxvbWJhZXVcbiAgICAgICAgLy9XPT5XaXphcmRcbiAgICAgICAgaWYgKHVuaXZlcnNlLnBsYXllckFjaGlldmVtZW50cykge1xuICAgICAgICAgICAgbXlBY2hpZXZlbWVudHMgPSB1bml2ZXJzZS5wbGF5ZXJBY2hpZXZlbWVudHNbcGxheWVyLnVpZF07XG4gICAgICAgICAgICBpZiAocGxheWVyLnJhd0FsaWFzID09IFwiTG9yZW50elwiICYmXG4gICAgICAgICAgICAgICAgXCJXXCIgIT0gbXlBY2hpZXZlbWVudHMuYmFkZ2VzLnNsaWNlKDAsIDEpKSB7XG4gICAgICAgICAgICAgICAgbXlBY2hpZXZlbWVudHMuYmFkZ2VzID0gXCJXXCIuY29uY2F0KG15QWNoaWV2ZW1lbnRzLmJhZGdlcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChwbGF5ZXIucmF3QWxpYXMgPT0gXCJBIFN0b25lZCBBcGVcIiAmJlxuICAgICAgICAgICAgICAgIFwiNVwiICE9IG15QWNoaWV2ZW1lbnRzLmJhZGdlcy5zbGljZSgwLCAxKSkge1xuICAgICAgICAgICAgICAgIG15QWNoaWV2ZW1lbnRzLmJhZGdlcyA9IFwiNVwiLmNvbmNhdChteUFjaGlldmVtZW50cy5iYWRnZXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChteUFjaGlldmVtZW50cykge1xuICAgICAgICAgICAgbnB1aVxuICAgICAgICAgICAgICAgIC5TbWFsbEJhZGdlUm93KG15QWNoaWV2ZW1lbnRzLmJhZGdlcylcbiAgICAgICAgICAgICAgICAuZ3JpZCgwLCAzLCAzMCwgMylcbiAgICAgICAgICAgICAgICAucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICB9XG4gICAgICAgIENydXguV2lkZ2V0KFwiY29sX2JsYWNrXCIpLmdyaWQoMTAsIDYsIDIwLCAzKS5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgIGlmIChwbGF5ZXIudWlkICE9IGdldF9oZXJvKE5lcHR1bmVzUHJpZGUudW5pdmVyc2UpLnVpZCAmJiBwbGF5ZXIuYWkgPT0gMCkge1xuICAgICAgICAgICAgLy9Vc2UgdGhpcyB0byBvbmx5IHZpZXcgd2hlbiB0aGV5IGFyZSB3aXRoaW4gc2Nhbm5pbmc6XG4gICAgICAgICAgICAvL3VuaXZlcnNlLnNlbGVjdGVkU3Rhci52ICE9IFwiMFwiXG4gICAgICAgICAgICB2YXIgdG90YWxfc2VsbF9jb3N0ID0gZ2V0X3RlY2hfdHJhZGVfY29zdChnZXRfaGVybyhOZXB0dW5lc1ByaWRlLnVuaXZlcnNlKSwgcGxheWVyKTtcbiAgICAgICAgICAgIC8qKiogU0hBUkUgQUxMIFRFQ0ggICoqKi9cbiAgICAgICAgICAgIHZhciBidG4gPSBDcnV4LkJ1dHRvbihcIlwiLCBcInNoYXJlX2FsbF90ZWNoXCIsIHBsYXllcilcbiAgICAgICAgICAgICAgICAuYWRkU3R5bGUoXCJmd2RcIilcbiAgICAgICAgICAgICAgICAucmF3SFRNTChcIlNoYXJlIEFsbCBUZWNoOiAkXCIuY29uY2F0KHRvdGFsX3NlbGxfY29zdCkpXG4gICAgICAgICAgICAgICAgLmdyaWQoMTAsIDMxLCAxNCwgMyk7XG4gICAgICAgICAgICAvL0Rpc2FibGUgaWYgaW4gYSBnYW1lIHdpdGggRkEgJiBTY2FuIChCVUcpXG4gICAgICAgICAgICB2YXIgY29uZmlnID0gTmVwdHVuZXNQcmlkZS5nYW1lQ29uZmlnO1xuICAgICAgICAgICAgaWYgKCEoY29uZmlnLnRyYWRlU2Nhbm5lZCAmJiBjb25maWcuYWxsaWFuY2VzKSkge1xuICAgICAgICAgICAgICAgIGlmIChnZXRfaGVybyhOZXB0dW5lc1ByaWRlLnVuaXZlcnNlKS5jYXNoID49IHRvdGFsX3NlbGxfY29zdCkge1xuICAgICAgICAgICAgICAgICAgICBidG4ucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYnRuLmRpc2FibGUoKS5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLyoqKiBQQVkgRk9SIEFMTCBURUNIICoqKi9cbiAgICAgICAgICAgIHZhciB0b3RhbF9idXlfY29zdCA9IGdldF90ZWNoX3RyYWRlX2Nvc3QocGxheWVyLCBnZXRfaGVybyhOZXB0dW5lc1ByaWRlLnVuaXZlcnNlKSk7XG4gICAgICAgICAgICBidG4gPSBDcnV4LkJ1dHRvbihcIlwiLCBcImJ1eV9hbGxfdGVjaFwiLCB7XG4gICAgICAgICAgICAgICAgcGxheWVyOiBwbGF5ZXIsXG4gICAgICAgICAgICAgICAgdGVjaDogbnVsbCxcbiAgICAgICAgICAgICAgICBjb3N0OiB0b3RhbF9idXlfY29zdCxcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmFkZFN0eWxlKFwiZndkXCIpXG4gICAgICAgICAgICAgICAgLnJhd0hUTUwoXCJQYXkgZm9yIEFsbCBUZWNoOiAkXCIuY29uY2F0KHRvdGFsX2J1eV9jb3N0KSlcbiAgICAgICAgICAgICAgICAuZ3JpZCgxMCwgNDksIDE0LCAzKTtcbiAgICAgICAgICAgIGlmIChnZXRfaGVybyhOZXB0dW5lc1ByaWRlLnVuaXZlcnNlKS5jYXNoID49IHRvdGFsX3NlbGxfY29zdCkge1xuICAgICAgICAgICAgICAgIGJ0bi5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBidG4uZGlzYWJsZSgpLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8qSW5kaXZpZHVhbCB0ZWNocyovXG4gICAgICAgICAgICB2YXIgX25hbWVfbWFwID0ge1xuICAgICAgICAgICAgICAgIHNjYW5uaW5nOiBcIlNjYW5uaW5nXCIsXG4gICAgICAgICAgICAgICAgcHJvcHVsc2lvbjogXCJIeXBlcnNwYWNlIFJhbmdlXCIsXG4gICAgICAgICAgICAgICAgdGVycmFmb3JtaW5nOiBcIlRlcnJhZm9ybWluZ1wiLFxuICAgICAgICAgICAgICAgIHJlc2VhcmNoOiBcIkV4cGVyaW1lbnRhdGlvblwiLFxuICAgICAgICAgICAgICAgIHdlYXBvbnM6IFwiV2VhcG9uc1wiLFxuICAgICAgICAgICAgICAgIGJhbmtpbmc6IFwiQmFua2luZ1wiLFxuICAgICAgICAgICAgICAgIG1hbnVmYWN0dXJpbmc6IFwiTWFudWZhY3R1cmluZ1wiLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHZhciB0ZWNocyA9IFtcbiAgICAgICAgICAgICAgICBcInNjYW5uaW5nXCIsXG4gICAgICAgICAgICAgICAgXCJwcm9wdWxzaW9uXCIsXG4gICAgICAgICAgICAgICAgXCJ0ZXJyYWZvcm1pbmdcIixcbiAgICAgICAgICAgICAgICBcInJlc2VhcmNoXCIsXG4gICAgICAgICAgICAgICAgXCJ3ZWFwb25zXCIsXG4gICAgICAgICAgICAgICAgXCJiYW5raW5nXCIsXG4gICAgICAgICAgICAgICAgXCJtYW51ZmFjdHVyaW5nXCIsXG4gICAgICAgICAgICBdO1xuICAgICAgICAgICAgdGVjaHMuZm9yRWFjaChmdW5jdGlvbiAodGVjaCwgaSkge1xuICAgICAgICAgICAgICAgIHZhciBvbmVfdGVjaF9jb3N0ID0gZ2V0X3RlY2hfdHJhZGVfY29zdChwbGF5ZXIsIGdldF9oZXJvKE5lcHR1bmVzUHJpZGUudW5pdmVyc2UpLCB0ZWNoKTtcbiAgICAgICAgICAgICAgICB2YXIgb25lX3RlY2ggPSBDcnV4LkJ1dHRvbihcIlwiLCBcImJ1eV9vbmVfdGVjaFwiLCB7XG4gICAgICAgICAgICAgICAgICAgIHBsYXllcjogcGxheWVyLFxuICAgICAgICAgICAgICAgICAgICB0ZWNoOiB0ZWNoLFxuICAgICAgICAgICAgICAgICAgICBjb3N0OiBvbmVfdGVjaF9jb3N0LFxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIC5hZGRTdHlsZShcImZ3ZFwiKVxuICAgICAgICAgICAgICAgICAgICAucmF3SFRNTChcIlBheTogJFwiLmNvbmNhdChvbmVfdGVjaF9jb3N0KSlcbiAgICAgICAgICAgICAgICAgICAgLmdyaWQoMTUsIDM0LjUgKyBpICogMiwgNywgMik7XG4gICAgICAgICAgICAgICAgaWYgKGdldF9oZXJvKE5lcHR1bmVzUHJpZGUudW5pdmVyc2UpLmNhc2ggPj0gb25lX3RlY2hfY29zdCAmJlxuICAgICAgICAgICAgICAgICAgICBvbmVfdGVjaF9jb3N0ID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBvbmVfdGVjaC5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgLy9OUEMgQ2FsY1xuICAgICAgICBob29rX25wY190aWNrX2NvdW50ZXIoTmVwdHVuZXNQcmlkZSwgQ3J1eCk7XG4gICAgICAgIENydXguVGV4dChcInlvdVwiLCBcInBhZDEyIHR4dF9jZW50ZXJcIikuZ3JpZCgyNSwgNiwgNSwgMykucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICAvLyBMYWJlbHNcbiAgICAgICAgQ3J1eC5UZXh0KFwidG90YWxfc3RhcnNcIiwgXCJwYWQ4XCIpLmdyaWQoMTAsIDksIDE1LCAzKS5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgIENydXguVGV4dChcInRvdGFsX2ZsZWV0c1wiLCBcInBhZDhcIikuZ3JpZCgxMCwgMTEsIDE1LCAzKS5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgIENydXguVGV4dChcInRvdGFsX3NoaXBzXCIsIFwicGFkOFwiKS5ncmlkKDEwLCAxMywgMTUsIDMpLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgQ3J1eC5UZXh0KFwibmV3X3NoaXBzXCIsIFwicGFkOFwiKS5ncmlkKDEwLCAxNSwgMTUsIDMpLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgLy8gVGhpcyBwbGF5ZXJzIHN0YXRzXG4gICAgICAgIGlmIChwbGF5ZXIgIT09IHVuaXZlcnNlLnBsYXllcikge1xuICAgICAgICAgICAgQ3J1eC5UZXh0KFwiXCIsIFwicGFkOCB0eHRfY2VudGVyXCIpXG4gICAgICAgICAgICAgICAgLmdyaWQoMjAsIDksIDUsIDMpXG4gICAgICAgICAgICAgICAgLnJhd0hUTUwocGxheWVyLnRvdGFsX3N0YXJzKVxuICAgICAgICAgICAgICAgIC5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgICAgICBDcnV4LlRleHQoXCJcIiwgXCJwYWQ4IHR4dF9jZW50ZXJcIilcbiAgICAgICAgICAgICAgICAuZ3JpZCgyMCwgMTEsIDUsIDMpXG4gICAgICAgICAgICAgICAgLnJhd0hUTUwocGxheWVyLnRvdGFsX2ZsZWV0cylcbiAgICAgICAgICAgICAgICAucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICAgICAgQ3J1eC5UZXh0KFwiXCIsIFwicGFkOCB0eHRfY2VudGVyXCIpXG4gICAgICAgICAgICAgICAgLmdyaWQoMjAsIDEzLCA1LCAzKVxuICAgICAgICAgICAgICAgIC5yYXdIVE1MKHBsYXllci50b3RhbF9zdHJlbmd0aClcbiAgICAgICAgICAgICAgICAucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICAgICAgQ3J1eC5UZXh0KFwiXCIsIFwicGFkOCB0eHRfY2VudGVyXCIpXG4gICAgICAgICAgICAgICAgLmdyaWQoMjAsIDE1LCA1LCAzKVxuICAgICAgICAgICAgICAgIC5yYXdIVE1MKHBsYXllci5zaGlwc1BlclRpY2spXG4gICAgICAgICAgICAgICAgLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiBzZWxlY3RIaWxpZ2h0U3R5bGUocDEsIHAyKSB7XG4gICAgICAgICAgICBwMSA9IE51bWJlcihwMSk7XG4gICAgICAgICAgICBwMiA9IE51bWJlcihwMik7XG4gICAgICAgICAgICBpZiAocDEgPCBwMilcbiAgICAgICAgICAgICAgICByZXR1cm4gXCIgdHh0X3dhcm5fYmFkXCI7XG4gICAgICAgICAgICBpZiAocDEgPiBwMilcbiAgICAgICAgICAgICAgICByZXR1cm4gXCIgdHh0X3dhcm5fZ29vZFwiO1xuICAgICAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgICAgIH1cbiAgICAgICAgLy8gWW91ciBzdGF0c1xuICAgICAgICBpZiAodW5pdmVyc2UucGxheWVyKSB7XG4gICAgICAgICAgICBDcnV4LlRleHQoXCJcIiwgXCJwYWQ4IHR4dF9jZW50ZXIgXCIuY29uY2F0KHNlbGVjdEhpbGlnaHRTdHlsZSh1bml2ZXJzZS5wbGF5ZXIudG90YWxfc3RhcnMsIHBsYXllci50b3RhbF9zdGFycykpKVxuICAgICAgICAgICAgICAgIC5ncmlkKDI1LCA5LCA1LCAzKVxuICAgICAgICAgICAgICAgIC5yYXdIVE1MKHVuaXZlcnNlLnBsYXllci50b3RhbF9zdGFycylcbiAgICAgICAgICAgICAgICAucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICAgICAgQ3J1eC5UZXh0KFwiXCIsIFwicGFkOCB0eHRfY2VudGVyXCIuY29uY2F0KHNlbGVjdEhpbGlnaHRTdHlsZSh1bml2ZXJzZS5wbGF5ZXIudG90YWxfZmxlZXRzLCBwbGF5ZXIudG90YWxfZmxlZXRzKSkpXG4gICAgICAgICAgICAgICAgLmdyaWQoMjUsIDExLCA1LCAzKVxuICAgICAgICAgICAgICAgIC5yYXdIVE1MKHVuaXZlcnNlLnBsYXllci50b3RhbF9mbGVldHMpXG4gICAgICAgICAgICAgICAgLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgICAgIENydXguVGV4dChcIlwiLCBcInBhZDggdHh0X2NlbnRlclwiLmNvbmNhdChzZWxlY3RIaWxpZ2h0U3R5bGUodW5pdmVyc2UucGxheWVyLnRvdGFsX3N0cmVuZ3RoLCBwbGF5ZXIudG90YWxfc3RyZW5ndGgpKSlcbiAgICAgICAgICAgICAgICAuZ3JpZCgyNSwgMTMsIDUsIDMpXG4gICAgICAgICAgICAgICAgLnJhd0hUTUwodW5pdmVyc2UucGxheWVyLnRvdGFsX3N0cmVuZ3RoKVxuICAgICAgICAgICAgICAgIC5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgICAgICBDcnV4LlRleHQoXCJcIiwgXCJwYWQ4IHR4dF9jZW50ZXJcIi5jb25jYXQoc2VsZWN0SGlsaWdodFN0eWxlKHVuaXZlcnNlLnBsYXllci5zaGlwc1BlclRpY2ssIHBsYXllci5zaGlwc1BlclRpY2spKSlcbiAgICAgICAgICAgICAgICAuZ3JpZCgyNSwgMTUsIDUsIDMpXG4gICAgICAgICAgICAgICAgLnJhd0hUTUwodW5pdmVyc2UucGxheWVyLnNoaXBzUGVyVGljaylcbiAgICAgICAgICAgICAgICAucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICB9XG4gICAgICAgIENydXguV2lkZ2V0KFwiY29sX2FjY2VudFwiKS5ncmlkKDAsIDE2LCAxMCwgMykucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICBpZiAodW5pdmVyc2UucGxheWVyKSB7XG4gICAgICAgICAgICB2YXIgbXNnQnRuID0gQ3J1eC5JY29uQnV0dG9uKFwiaWNvbi1tYWlsXCIsIFwiaW5ib3hfbmV3X21lc3NhZ2VfdG9fcGxheWVyXCIsIHBsYXllci51aWQpXG4gICAgICAgICAgICAgICAgLmdyaWQoMCwgMTYsIDMsIDMpXG4gICAgICAgICAgICAgICAgLmFkZFN0eWxlKFwiZndkXCIpXG4gICAgICAgICAgICAgICAgLmRpc2FibGUoKVxuICAgICAgICAgICAgICAgIC5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgICAgICBpZiAocGxheWVyICE9PSB1bml2ZXJzZS5wbGF5ZXIgJiYgcGxheWVyLmFsaWFzKSB7XG4gICAgICAgICAgICAgICAgbXNnQnRuLmVuYWJsZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgQ3J1eC5JY29uQnV0dG9uKFwiaWNvbi1jaGFydC1saW5lXCIsIFwic2hvd19pbnRlbFwiLCBwbGF5ZXIudWlkKVxuICAgICAgICAgICAgICAgIC5ncmlkKDIuNSwgMTYsIDMsIDMpXG4gICAgICAgICAgICAgICAgLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgICAgIGlmIChzaG93RW1waXJlKSB7XG4gICAgICAgICAgICAgICAgQ3J1eC5JY29uQnV0dG9uKFwiaWNvbi1leWVcIiwgXCJzaG93X3NjcmVlblwiLCBcImVtcGlyZVwiKVxuICAgICAgICAgICAgICAgICAgICAuZ3JpZCg3LCAxNiwgMywgMylcbiAgICAgICAgICAgICAgICAgICAgLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcGxheWVyUGFuZWw7XG4gICAgfTtcbn07XG52YXIgc3VwZXJTdGFySW5zcGVjdG9yID0gTmVwdHVuZXNQcmlkZS5ucHVpLlN0YXJJbnNwZWN0b3I7XG5OZXB0dW5lc1ByaWRlLm5wdWkuU3Rhckluc3BlY3RvciA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdW5pdmVyc2UgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlO1xuICAgIHZhciBjb25maWcgPSBOZXB0dW5lc1ByaWRlLmdhbWVDb25maWc7XG4gICAgLy9DYWxsIHN1cGVyIChQcmV2aW91cyBTdGFySW5zcGVjdG9yIGZyb20gZ2FtZWNvZGUpXG4gICAgdmFyIHN0YXJJbnNwZWN0b3IgPSBzdXBlclN0YXJJbnNwZWN0b3IoKTtcbiAgICBDcnV4Lkljb25CdXR0b24oXCJpY29uLWhlbHAgcmVsXCIsIFwic2hvd19oZWxwXCIsIFwic3RhcnNcIikucm9vc3Qoc3Rhckluc3BlY3Rvci5oZWFkaW5nKTtcbiAgICBDcnV4Lkljb25CdXR0b24oXCJpY29uLWRvYy10ZXh0IHJlbFwiLCBcInNob3dfc2NyZWVuXCIsIFwiY29tYmF0X2NhbGN1bGF0b3JcIikucm9vc3Qoc3Rhckluc3BlY3Rvci5oZWFkaW5nKTtcbiAgICAvL0FwcGVuZCBleHRyYSBmdW5jdGlvblxuICAgIGZ1bmN0aW9uIGFwcGx5X2ZyYWN0aW9uYWxfc2hpcHMoKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBkZXB0aCwgc2VsZWN0b3IsIGVsZW1lbnQsIGNvdW50ZXIsIGZyYWN0aW9uYWxfc2hpcCwgZnJhY3Rpb25hbF9zaGlwXzEsIG5ld192YWx1ZTtcbiAgICAgICAgICAgIHJldHVybiBfX2dlbmVyYXRvcih0aGlzLCBmdW5jdGlvbiAoX2EpIHtcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKF9hLmxhYmVsKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlcHRoID0gY29uZmlnLnR1cm5CYXNlZCA/IDQgOiAzO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZWN0b3IgPSBcIiNjb250ZW50QXJlYSA+IGRpdiA+IGRpdi53aWRnZXQuZnVsbHNjcmVlbiA+IGRpdjpudGgtY2hpbGQoXCIuY29uY2F0KGRlcHRoLCBcIikgPiBkaXYgPiBkaXY6bnRoLWNoaWxkKDUpID4gZGl2LndpZGdldC5wYWQxMi5pY29uLXJvY2tldC1pbmxpbmUudHh0X3JpZ2h0XCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudCA9ICQoc2VsZWN0b3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY291bnRlciA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICBmcmFjdGlvbmFsX3NoaXAgPSB1bml2ZXJzZS5zZWxlY3RlZFN0YXJbXCJjXCJdLnRvRml4ZWQoMik7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKHNlbGVjdG9yKS5hcHBlbmQoZnJhY3Rpb25hbF9zaGlwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIF9hLmxhYmVsID0gMTtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCEoZWxlbWVudC5sZW5ndGggPT0gMCAmJiBjb3VudGVyIDw9IDEwMCkpIHJldHVybiBbMyAvKmJyZWFrKi8sIDNdO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFs0IC8qeWllbGQqLywgbmV3IFByb21pc2UoZnVuY3Rpb24gKHIpIHsgcmV0dXJuIHNldFRpbWVvdXQociwgMTApOyB9KV07XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICAgICAgICAgIF9hLnNlbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQgPSAkKHNlbGVjdG9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZyYWN0aW9uYWxfc2hpcF8xID0gdW5pdmVyc2Uuc2VsZWN0ZWRTdGFyW1wiY1wiXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld192YWx1ZSA9IHBhcnNlSW50KCQoc2VsZWN0b3IpLnRleHQoKSkgKyBmcmFjdGlvbmFsX3NoaXBfMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICQoc2VsZWN0b3IpLnRleHQobmV3X3ZhbHVlLnRvRml4ZWQoMikpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY291bnRlciArPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFszIC8qYnJlYWsqLywgMV07XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMzogcmV0dXJuIFsyIC8qcmV0dXJuKi9dO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgaWYgKFwiY1wiIGluIHVuaXZlcnNlLnNlbGVjdGVkU3Rhcikge1xuICAgICAgICBhcHBseV9mcmFjdGlvbmFsX3NoaXBzKCk7XG4gICAgfVxuICAgIHJldHVybiBzdGFySW5zcGVjdG9yO1xufTtcbi8vSmF2YXNjcmlwdCBjYWxsXG5zZXRUaW1lb3V0KExlZ2FjeV9OZXB0dW5lc1ByaWRlQWdlbnQsIDEwMDApO1xuc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgLy9UeXBlc2NyaXB0IGNhbGxcbiAgICBwb3N0X2hvb2soKTtcbiAgICByZW5kZXJMZWRnZXIoTmVwdHVuZXNQcmlkZSwgQ3J1eCwgTW91c2V0cmFwKTtcbn0sIDE1MDApO1xuc2V0VGltZW91dChhcHBseV9ob29rcywgMTUwMCk7XG4vL1Rlc3QgdG8gc2VlIGlmIFBsYXllclBhbmVsIGlzIHRoZXJlXG4vL0lmIGl0IGlzIG92ZXJ3cml0ZXMgY3VzdG9tIG9uZVxuLy9PdGhlcndpc2Ugd2hpbGUgbG9vcCAmIHNldCB0aW1lb3V0IHVudGlsIGl0cyB0aGVyZVxuZm9yY2VfYWRkX2N1c3RvbV9wbGF5ZXJfcGFuZWwoKTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==