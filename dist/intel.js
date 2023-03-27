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
/* harmony export */   "recieve_new_messages": function() { return /* binding */ recieve_new_messages; },
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
function mergeUserData(scanningData) {
    var galaxy = (0,_utilities_get_game_state__WEBPACK_IMPORTED_MODULE_0__.get_galaxy)();
    var stars = scanningData.stars;
    var fleets = scanningData.fleets;
    // Update stars
    for (var starId in stars) {
        var star = stars[starId];
        if (Object.keys(galaxy.stars).indexOf(starId) !== -1) {
            // The star already exists, do something
            console.log("Star already exists in the galaxy");
        }
        else {
            // The star does not exist, add it to the galaxy
            galaxy.stars[starId] = star;
        }
    }
    // Add fleets
    for (var fleetId in fleets) {
        var fleet = fleets[fleetId];
        // Check if the fleet already exists in the galaxy
        if (Object.keys(galaxy.fleets).indexOf(fleetId) !== -1) {
            // The fleet already exists, do something
            console.log("Fleet already exists in the galaxy");
        }
        else {
            // The fleet does not exist, add it to the galaxy
            galaxy.fleets[fleetId] = fleet;
        }
    }
    //NeptunesPride.np.onFullUniverse(null, galaxy);
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








var SAT_VERSION = "2.28.17-git";
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Qiw2REFBNkQ7O0FBRTdEO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTs7QUFFQSxTQUFTLGtCQUFrQjtBQUMzQjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLFdBQVcsUUFBUTtBQUNuQixXQUFXLFNBQVM7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVMsT0FBTztBQUNoQjtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLFdBQVcsUUFBUTtBQUNuQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLEtBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxzQ0FBc0MsSUFB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QUN6Qjs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0EsT0FBTztBQUNQOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMENBQTBDLGFBQWE7QUFDdkQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJDQUEyQyxhQUFhO0FBQ3hELGlFQUFpRTtBQUNqRSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0EsNEJBQTRCLGFBQWE7QUFDekM7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwQ0FBMEMsYUFBYTtBQUN2RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxnQkFBZ0IsNEJBQTRCO0FBQzVDOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWCxTQUFTO0FBQ1Q7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFF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QUNBO0FBQ0E7QUFDQSxzQ0FBc0MsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLEVBQUUsSUFBSSxHQUFHO0FBQzNEO0FBQ0E7QUFDQTtBQUNBLFFBQVEsNkNBQUk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtFQUFrRTtBQUNsRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUIsRUFBRSxFQUFFLEdBQUc7QUFDNUI7QUFDQTtBQUNBLHFCQUFxQixFQUFFLEVBQUUsR0FBRztBQUM1QjtBQUNBLGlCQUFpQixFQUFFLEVBQUUsR0FBRztBQUN4QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixFQUFFLE1BQU0sRUFBRSxJQUFJLEdBQUcsS0FBSyxFQUFFLElBQUksRUFBRTtBQUN0RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzREFBc0Q7QUFDdEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBCQUEwQixFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsSUFBSSxHQUFHO0FBQ2xEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQ0FBb0MsRUFBRSxFQUFFLEdBQUcsR0FBRyxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUU7QUFDNUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0Q0FBNEMsR0FBRyxHQUFHLEdBQUcsTUFBTSxFQUFFLE1BQU0sRUFBRTtBQUNyRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBDQUEwQyxHQUFHLFVBQVUsRUFBRTtBQUN6RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0NBQXNDLEVBQUUsS0FBSyxHQUFHLEdBQUcsR0FBRyxNQUFNLEVBQUUsTUFBTSxFQUFFO0FBQ3RFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwQ0FBMEMsRUFBRTtBQUM1Qyw0Q0FBNEMsR0FBRyxXQUFXLEVBQUU7QUFDNUQsNENBQTRDLEdBQUcsV0FBVyxFQUFFO0FBQzVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0RBQXNELEdBQUcsR0FBRyxFQUFFO0FBQzlEO0FBQ0E7QUFDQTtBQUNBLHNEQUFzRCxHQUFHLEdBQUcsRUFBRTtBQUM5RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0RBQXNELEdBQUcsR0FBRyxFQUFFO0FBQzlEO0FBQ0E7QUFDQTtBQUNBLHNEQUFzRCxHQUFHLEdBQUcsRUFBRTtBQUM5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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0VBQXdFLDJCQUEyQjtBQUNuRztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYixTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUkscURBQVk7QUFDaEIsQ0FBQztBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9uZXB0dW5lcy1wcmlkZS1hZ2VudC8uL3NvdXJjZS9jaGF0LnRzIiwid2VicGFjazovL25lcHR1bmVzLXByaWRlLWFnZW50Ly4vc291cmNlL2V2ZW50X2NhY2hlLnRzIiwid2VicGFjazovL25lcHR1bmVzLXByaWRlLWFnZW50Ly4vc291cmNlL2dhbWUudHMiLCJ3ZWJwYWNrOi8vbmVwdHVuZXMtcHJpZGUtYWdlbnQvLi9zb3VyY2UvZ2V0X2hlcm8udHMiLCJ3ZWJwYWNrOi8vbmVwdHVuZXMtcHJpZGUtYWdlbnQvLi9zb3VyY2UvaG90a2V5LnRzIiwid2VicGFjazovL25lcHR1bmVzLXByaWRlLWFnZW50Ly4vc291cmNlL2xlZGdlci50cyIsIndlYnBhY2s6Ly9uZXB0dW5lcy1wcmlkZS1hZ2VudC8uL3NvdXJjZS9tZXJnZS50cyIsIndlYnBhY2s6Ly9uZXB0dW5lcy1wcmlkZS1hZ2VudC8uL3NvdXJjZS9wYXJzZV91dGlscy50cyIsIndlYnBhY2s6Ly9uZXB0dW5lcy1wcmlkZS1hZ2VudC8uL3NvdXJjZS91dGlsaXRpZXMvYXBpLnRzIiwid2VicGFjazovL25lcHR1bmVzLXByaWRlLWFnZW50Ly4vc291cmNlL3V0aWxpdGllcy9nZXRfZ2FtZV9zdGF0ZS50cyIsIndlYnBhY2s6Ly9uZXB0dW5lcy1wcmlkZS1hZ2VudC8uL3NvdXJjZS91dGlsaXRpZXMvZ3JhcGhpY3MudHMiLCJ3ZWJwYWNrOi8vbmVwdHVuZXMtcHJpZGUtYWdlbnQvLi9ub2RlX21vZHVsZXMvbWFya2VkL2xpYi9tYXJrZWQuZXNtLmpzIiwid2VicGFjazovL25lcHR1bmVzLXByaWRlLWFnZW50L3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL25lcHR1bmVzLXByaWRlLWFnZW50L3dlYnBhY2svcnVudGltZS9jb21wYXQgZ2V0IGRlZmF1bHQgZXhwb3J0Iiwid2VicGFjazovL25lcHR1bmVzLXByaWRlLWFnZW50L3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9uZXB0dW5lcy1wcmlkZS1hZ2VudC93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL25lcHR1bmVzLXByaWRlLWFnZW50L3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vbmVwdHVuZXMtcHJpZGUtYWdlbnQvLi9zb3VyY2UvaW50ZWwuanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZ2V0X2hlcm8gfSBmcm9tIFwiLi9nZXRfaGVyb1wiO1xudmFyIFJFU0VBQ0hfTUFQID0ge1xuICAgIHNjYW5uaW5nOiBcIlNjYW5uaW5nXCIsXG4gICAgcHJvcHVsc2lvbjogXCJIeXBlcnNwYWNlIFJhbmdlXCIsXG4gICAgdGVycmFmb3JtaW5nOiBcIlRlcnJhZm9ybWluZ1wiLFxuICAgIHJlc2VhcmNoOiBcIkV4cGVyaW1lbnRhdGlvblwiLFxuICAgIHdlYXBvbnM6IFwiV2VhcG9uc1wiLFxuICAgIGJhbmtpbmc6IFwiQmFua2luZ1wiLFxuICAgIG1hbnVmYWN0dXJpbmc6IFwiTWFudWZhY3R1cmluZ1wiLFxufTtcbi8vRm9yIHF1aWNrIHJlc2VhcmNoIGRpc3BsYXlcbmZ1bmN0aW9uIGdldF9yZXNlYXJjaChnYW1lKSB7XG4gICAgdmFyIHVuaXZlcnNlID0gZ2FtZS51bml2ZXJzZTtcbiAgICB2YXIgaGVybyA9IGdldF9oZXJvKGdhbWUudW5pdmVyc2UpO1xuICAgIHZhciBzY2llbmNlID0gaGVyby50b3RhbF9zY2llbmNlO1xuICAgIC8vQ3VycmVudCBTY2llbmNlXG4gICAgdmFyIGN1cnJlbnQgPSBoZXJvLnRlY2hbaGVyby5yZXNlYXJjaGluZ107XG4gICAgdmFyIGN1cnJlbnRfcG9pbnRzX3JlbWFpbmluZyA9IGN1cnJlbnQuYnJyICogY3VycmVudC5sZXZlbCAtIGN1cnJlbnQucmVzZWFyY2g7XG4gICAgdmFyIGV0YSA9IE1hdGguY2VpbChjdXJyZW50X3BvaW50c19yZW1haW5pbmcgLyBzY2llbmNlKTsgLy9Ib3Vyc1xuICAgIC8vTmV4dCBzY2llbmNlXG4gICAgdmFyIG5leHQgPSBoZXJvLnRlY2hbaGVyby5yZXNlYXJjaGluZ19uZXh0XTtcbiAgICB2YXIgbmV4dF9wb2ludHNfcmVtYWluaW5nID0gbmV4dC5icnIgKiBuZXh0LmxldmVsIC0gbmV4dC5yZXNlYXJjaDtcbiAgICB2YXIgbmV4dF9ldGEgPSBNYXRoLmNlaWwobmV4dF9wb2ludHNfcmVtYWluaW5nIC8gc2NpZW5jZSkgKyBldGE7XG4gICAgdmFyIG5leHRfbGV2ZWwgPSBuZXh0LmxldmVsICsgMTtcbiAgICBpZiAoaGVyby5yZXNlYXJjaGluZyA9PSBoZXJvLnJlc2VhcmNoaW5nX25leHQpIHtcbiAgICAgICAgLy9SZWN1cnJpbmcgcmVzZWFyY2hcbiAgICAgICAgbmV4dF9wb2ludHNfcmVtYWluaW5nICs9IG5leHQuYnJyO1xuICAgICAgICBuZXh0X2V0YSA9IE1hdGguY2VpbCgobmV4dC5icnIgKiBuZXh0LmxldmVsICsgMSkgLyBzY2llbmNlKSArIGV0YTtcbiAgICAgICAgbmV4dF9sZXZlbCArPSAxO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICBjdXJyZW50X25hbWU6IFJFU0VBQ0hfTUFQW2hlcm8ucmVzZWFyY2hpbmddLFxuICAgICAgICBjdXJyZW50X2xldmVsOiBjdXJyZW50W1wibGV2ZWxcIl0gKyAxLFxuICAgICAgICBjdXJyZW50X2V0YTogZXRhLFxuICAgICAgICBuZXh0X25hbWU6IFJFU0VBQ0hfTUFQW2hlcm8ucmVzZWFyY2hpbmdfbmV4dF0sXG4gICAgICAgIG5leHRfbGV2ZWw6IG5leHRfbGV2ZWwsXG4gICAgICAgIG5leHRfZXRhOiBuZXh0X2V0YSxcbiAgICAgICAgc2NpZW5jZTogc2NpZW5jZSxcbiAgICB9O1xufVxuZnVuY3Rpb24gZ2V0X3Jlc2VhcmNoX3RleHQoZ2FtZSkge1xuICAgIHZhciByZXNlYXJjaCA9IGdldF9yZXNlYXJjaChnYW1lKTtcbiAgICB2YXIgZmlyc3RfbGluZSA9IFwiTm93OiBcIi5jb25jYXQocmVzZWFyY2hbXCJjdXJyZW50X25hbWVcIl0sIFwiIFwiKS5jb25jYXQocmVzZWFyY2hbXCJjdXJyZW50X2xldmVsXCJdLCBcIiAtIFwiKS5jb25jYXQocmVzZWFyY2hbXCJjdXJyZW50X2V0YVwiXSwgXCIgdGlja3MuXCIpO1xuICAgIHZhciBzZWNvbmRfbGluZSA9IFwiTmV4dDogXCIuY29uY2F0KHJlc2VhcmNoW1wibmV4dF9uYW1lXCJdLCBcIiBcIikuY29uY2F0KHJlc2VhcmNoW1wibmV4dF9sZXZlbFwiXSwgXCIgLSBcIikuY29uY2F0KHJlc2VhcmNoW1wibmV4dF9ldGFcIl0sIFwiIHRpY2tzLlwiKTtcbiAgICB2YXIgdGhpcmRfbGluZSA9IFwiTXkgU2NpZW5jZTogXCIuY29uY2F0KHJlc2VhcmNoW1wic2NpZW5jZVwiXSk7XG4gICAgcmV0dXJuIFwiXCIuY29uY2F0KGZpcnN0X2xpbmUsIFwiXFxuXCIpLmNvbmNhdChzZWNvbmRfbGluZSwgXCJcXG5cIikuY29uY2F0KHRoaXJkX2xpbmUsIFwiXFxuXCIpO1xufVxuZnVuY3Rpb24gTWFya0Rvd25NZXNzYWdlQ29tbWVudChjb250ZXh0LCB0ZXh0LCBpbmRleCkge1xuICAgIHZhciBtZXNzYWdlQ29tbWVudCA9IGNvbnRleHQuTWVzc2FnZUNvbW1lbnQodGV4dCwgaW5kZXgpO1xuICAgIHJldHVybiBcIlwiO1xufVxuZXhwb3J0IHsgZ2V0X3Jlc2VhcmNoLCBnZXRfcmVzZWFyY2hfdGV4dCwgTWFya0Rvd25NZXNzYWdlQ29tbWVudCB9O1xuIiwiaW1wb3J0IHsgZ2V0X2xlZGdlciB9IGZyb20gXCIuL2xlZGdlclwiO1xuaW1wb3J0IHsgZ2V0X2hlcm8gfSBmcm9tIFwiLi9nZXRfaGVyb1wiO1xuLy9HbG9iYWwgY2FjaGVkIGV2ZW50IHN5c3RlbS5cbmV4cG9ydCB2YXIgY2FjaGVkX2V2ZW50cyA9IFtdO1xuZXhwb3J0IHZhciBjYWNoZUZldGNoU3RhcnQgPSBuZXcgRGF0ZSgpO1xuZXhwb3J0IHZhciBjYWNoZUZldGNoU2l6ZSA9IDA7XG4vL0FzeW5jIHJlcXVlc3QgZ2FtZSBldmVudHNcbi8vZ2FtZSBpcyB1c2VkIHRvIGdldCB0aGUgYXBpIHZlcnNpb24gYW5kIHRoZSBnYW1lTnVtYmVyXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlX2V2ZW50X2NhY2hlKGdhbWUsIGNydXgsIGZldGNoU2l6ZSwgc3VjY2VzcywgZXJyb3IpIHtcbiAgICB2YXIgY291bnQgPSBjYWNoZWRfZXZlbnRzLmxlbmd0aCA+IDAgPyBmZXRjaFNpemUgOiAxMDAwMDA7XG4gICAgY2FjaGVGZXRjaFN0YXJ0ID0gbmV3IERhdGUoKTtcbiAgICBjYWNoZUZldGNoU2l6ZSA9IGNvdW50O1xuICAgIHZhciBwYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHtcbiAgICAgICAgdHlwZTogXCJmZXRjaF9nYW1lX21lc3NhZ2VzXCIsXG4gICAgICAgIGNvdW50OiBjb3VudC50b1N0cmluZygpLFxuICAgICAgICBvZmZzZXQ6IFwiMFwiLFxuICAgICAgICBncm91cDogXCJnYW1lX2V2ZW50XCIsXG4gICAgICAgIHZlcnNpb246IGdhbWUudmVyc2lvbixcbiAgICAgICAgZ2FtZV9udW1iZXI6IGdhbWUuZ2FtZU51bWJlcixcbiAgICB9KTtcbiAgICB2YXIgaGVhZGVycyA9IHtcbiAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWRuXCIsXG4gICAgfTtcbiAgICBmZXRjaChcIi90cmVxdWVzdC9mZXRjaF9nYW1lX21lc3NhZ2VzXCIsIHtcbiAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWRcIixcbiAgICAgICAgfSxcbiAgICAgICAgYm9keTogcGFyYW1zLFxuICAgIH0pXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkgeyByZXR1cm4gcmVzcG9uc2UuanNvbigpOyB9KVxuICAgICAgICAudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHsgcmV0dXJuIHN1Y2Nlc3MoZ2FtZSwgY3J1eCwgcmVzcG9uc2UpOyB9KVxuICAgICAgICAuY2F0Y2goZXJyb3IpO1xufVxuLy9DdXN0b20gVUkgQ29tcG9uZW50cyBmb3IgTGVkZ2VyXG5leHBvcnQgZnVuY3Rpb24gUGxheWVyTmFtZUljb25Sb3dMaW5rKGNydXgsIG5wdWksIHBsYXllcikge1xuICAgIHZhciBwbGF5ZXJOYW1lSWNvblJvdyA9IGNydXguV2lkZ2V0KFwicmVsIGNvbF9ibGFjayBjbGlja2FibGVcIikuc2l6ZSg0ODAsIDQ4KTtcbiAgICBucHVpLlBsYXllckljb24ocGxheWVyLCB0cnVlKS5yb29zdChwbGF5ZXJOYW1lSWNvblJvdyk7XG4gICAgY3J1eFxuICAgICAgICAuVGV4dChcIlwiLCBcInNlY3Rpb25fdGl0bGVcIilcbiAgICAgICAgLmdyaWQoNiwgMCwgMjEsIDMpXG4gICAgICAgIC5yYXdIVE1MKFwiPGEgb25jbGljaz1cXFwiQ3J1eC5jcnV4LnRyaWdnZXIoJ3Nob3dfcGxheWVyX3VpZCcsICdcIi5jb25jYXQocGxheWVyLnVpZCwgXCInIClcXFwiPlwiKS5jb25jYXQocGxheWVyLmFsaWFzLCBcIjwvYT5cIikpXG4gICAgICAgIC5yb29zdChwbGF5ZXJOYW1lSWNvblJvdyk7XG4gICAgcmV0dXJuIHBsYXllck5hbWVJY29uUm93O1xufVxuLy9IYW5kbGVyIHRvIHJlY2lldmUgbmV3IG1lc3NhZ2VzXG5leHBvcnQgZnVuY3Rpb24gcmVjaWV2ZV9uZXdfbWVzc2FnZXMoZ2FtZSwgY3J1eCwgcmVzcG9uc2UpIHtcbiAgICB2YXIgdW5pdmVyc2UgPSBnYW1lLnVuaXZlcnNlO1xuICAgIHZhciBucHVpID0gZ2FtZS5ucHVpO1xuICAgIHZhciBjYWNoZUZldGNoRW5kID0gbmV3IERhdGUoKTtcbiAgICB2YXIgZWxhcHNlZCA9IGNhY2hlRmV0Y2hFbmQuZ2V0VGltZSgpIC0gY2FjaGVGZXRjaFN0YXJ0LmdldFRpbWUoKTtcbiAgICBjb25zb2xlLmxvZyhcIkZldGNoZWQgXCIuY29uY2F0KGNhY2hlRmV0Y2hTaXplLCBcIiBldmVudHMgaW4gXCIpLmNvbmNhdChlbGFwc2VkLCBcIm1zXCIpKTtcbiAgICB2YXIgaW5jb21pbmcgPSByZXNwb25zZS5yZXBvcnQubWVzc2FnZXM7XG4gICAgaWYgKGNhY2hlZF9ldmVudHMubGVuZ3RoID4gMCkge1xuICAgICAgICB2YXIgb3ZlcmxhcE9mZnNldCA9IC0xO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGluY29taW5nLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICB2YXIgbWVzc2FnZSA9IGluY29taW5nW2ldO1xuICAgICAgICAgICAgaWYgKG1lc3NhZ2Uua2V5ID09PSBjYWNoZWRfZXZlbnRzWzBdLmtleSkge1xuICAgICAgICAgICAgICAgIG92ZXJsYXBPZmZzZXQgPSBpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChvdmVybGFwT2Zmc2V0ID49IDApIHtcbiAgICAgICAgICAgIGluY29taW5nID0gaW5jb21pbmcuc2xpY2UoMCwgb3ZlcmxhcE9mZnNldCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAob3ZlcmxhcE9mZnNldCA8IDApIHtcbiAgICAgICAgICAgIHZhciBzaXplID0gaW5jb21pbmcubGVuZ3RoICogMjtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiTWlzc2luZyBzb21lIGV2ZW50cywgZG91YmxlIGZldGNoIHRvIFwiLmNvbmNhdChzaXplKSk7XG4gICAgICAgICAgICB1cGRhdGVfZXZlbnRfY2FjaGUoZ2FtZSwgY3J1eCwgc2l6ZSwgcmVjaWV2ZV9uZXdfbWVzc2FnZXMsIGNvbnNvbGUuZXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIHdlIGhhZCBjYWNoZWQgZXZlbnRzLCBidXQgd2FudCB0byBiZSBleHRyYSBwYXJhbm9pZCBhYm91dFxuICAgICAgICAvLyBjb3JyZWN0bmVzcy4gU28gaWYgdGhlIHJlc3BvbnNlIGNvbnRhaW5lZCB0aGUgZW50aXJlIGV2ZW50XG4gICAgICAgIC8vIGxvZywgdmFsaWRhdGUgdGhhdCBpdCBleGFjdGx5IG1hdGNoZXMgdGhlIGNhY2hlZCBldmVudHMuXG4gICAgICAgIGlmIChyZXNwb25zZS5yZXBvcnQubWVzc2FnZXMubGVuZ3RoID09PSBjYWNoZWRfZXZlbnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCIqKiogVmFsaWRhdGluZyBjYWNoZWRfZXZlbnRzICoqKlwiKTtcbiAgICAgICAgICAgIHZhciB2YWxpZF8xID0gcmVzcG9uc2UucmVwb3J0Lm1lc3NhZ2VzO1xuICAgICAgICAgICAgdmFyIGludmFsaWRFbnRyaWVzID0gY2FjaGVkX2V2ZW50cy5maWx0ZXIoZnVuY3Rpb24gKGUsIGkpIHsgcmV0dXJuIGUua2V5ICE9PSB2YWxpZF8xW2ldLmtleTsgfSk7XG4gICAgICAgICAgICBpZiAoaW52YWxpZEVudHJpZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIiEhIEludmFsaWQgZW50cmllcyBmb3VuZDogXCIsIGludmFsaWRFbnRyaWVzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiKioqIFZhbGlkYXRpb24gQ29tcGxldGVkICoqKlwiKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIC8vIHRoZSByZXNwb25zZSBkaWRuJ3QgY29udGFpbiB0aGUgZW50aXJlIGV2ZW50IGxvZy4gR28gZmV0Y2hcbiAgICAgICAgICAgIC8vIGEgdmVyc2lvbiB0aGF0IF9kb2VzXy5cbiAgICAgICAgICAgIHVwZGF0ZV9ldmVudF9jYWNoZShnYW1lLCBjcnV4LCAxMDAwMDAsIHJlY2lldmVfbmV3X21lc3NhZ2VzLCBjb25zb2xlLmVycm9yKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjYWNoZWRfZXZlbnRzID0gaW5jb21pbmcuY29uY2F0KGNhY2hlZF9ldmVudHMpO1xuICAgIHZhciBwbGF5ZXJzID0gZ2V0X2xlZGdlcihnYW1lLCBjcnV4LCBjYWNoZWRfZXZlbnRzKTtcbiAgICB2YXIgbGVkZ2VyU2NyZWVuID0gbnB1aS5sZWRnZXJTY3JlZW4oKTtcbiAgICBucHVpLm9uSGlkZVNjcmVlbihudWxsLCB0cnVlKTtcbiAgICBucHVpLm9uSGlkZVNlbGVjdGlvbk1lbnUoKTtcbiAgICBucHVpLnRyaWdnZXIoXCJoaWRlX3NpZGVfbWVudVwiKTtcbiAgICBucHVpLnRyaWdnZXIoXCJyZXNldF9lZGl0X21vZGVcIik7XG4gICAgbnB1aS5hY3RpdmVTY3JlZW4gPSBsZWRnZXJTY3JlZW47XG4gICAgbGVkZ2VyU2NyZWVuLnJvb3N0KG5wdWkuc2NyZWVuQ29udGFpbmVyKTtcbiAgICBucHVpLmxheW91dEVsZW1lbnQobGVkZ2VyU2NyZWVuKTtcbiAgICBwbGF5ZXJzLmZvckVhY2goZnVuY3Rpb24gKHApIHtcbiAgICAgICAgdmFyIHBsYXllciA9IFBsYXllck5hbWVJY29uUm93TGluayhjcnV4LCBucHVpLCB1bml2ZXJzZS5nYWxheHkucGxheWVyc1twLnVpZF0pLnJvb3N0KG5wdWkuYWN0aXZlU2NyZWVuKTtcbiAgICAgICAgcGxheWVyLmFkZFN0eWxlKFwicGxheWVyX2NlbGxcIik7XG4gICAgICAgIHZhciBwcm9tcHQgPSBwLmRlYnQgPiAwID8gXCJUaGV5IG93ZVwiIDogXCJZb3Ugb3dlXCI7XG4gICAgICAgIGlmIChwLmRlYnQgPT0gMCkge1xuICAgICAgICAgICAgcHJvbXB0ID0gXCJCYWxhbmNlXCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHAuZGVidCA8IDApIHtcbiAgICAgICAgICAgIGNydXhcbiAgICAgICAgICAgICAgICAuVGV4dChcIlwiLCBcInBhZDEyIHR4dF9yaWdodCByZWQtdGV4dFwiKVxuICAgICAgICAgICAgICAgIC5yYXdIVE1MKFwiXCIuY29uY2F0KHByb21wdCwgXCI6IFwiKS5jb25jYXQocC5kZWJ0KSlcbiAgICAgICAgICAgICAgICAuZ3JpZCgyMCwgMCwgMTAsIDMpXG4gICAgICAgICAgICAgICAgLnJvb3N0KHBsYXllcik7XG4gICAgICAgICAgICBpZiAocC5kZWJ0ICogLTEgPD0gZ2V0X2hlcm8odW5pdmVyc2UpLmNhc2gpIHtcbiAgICAgICAgICAgICAgICBjcnV4XG4gICAgICAgICAgICAgICAgICAgIC5CdXR0b24oXCJmb3JnaXZlXCIsIFwiZm9yZ2l2ZV9kZWJ0XCIsIHsgdGFyZ2V0UGxheWVyOiBwLnVpZCB9KVxuICAgICAgICAgICAgICAgICAgICAuZ3JpZCgxNywgMCwgNiwgMylcbiAgICAgICAgICAgICAgICAgICAgLnJvb3N0KHBsYXllcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAocC5kZWJ0ID4gMCkge1xuICAgICAgICAgICAgY3J1eFxuICAgICAgICAgICAgICAgIC5UZXh0KFwiXCIsIFwicGFkMTIgdHh0X3JpZ2h0IGJsdWUtdGV4dFwiKVxuICAgICAgICAgICAgICAgIC5yYXdIVE1MKFwiXCIuY29uY2F0KHByb21wdCwgXCI6IFwiKS5jb25jYXQocC5kZWJ0KSlcbiAgICAgICAgICAgICAgICAuZ3JpZCgyMCwgMCwgMTAsIDMpXG4gICAgICAgICAgICAgICAgLnJvb3N0KHBsYXllcik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAocC5kZWJ0ID09IDApIHtcbiAgICAgICAgICAgIGNydXhcbiAgICAgICAgICAgICAgICAuVGV4dChcIlwiLCBcInBhZDEyIHR4dF9yaWdodCBvcmFuZ2UtdGV4dFwiKVxuICAgICAgICAgICAgICAgIC5yYXdIVE1MKFwiXCIuY29uY2F0KHByb21wdCwgXCI6IFwiKS5jb25jYXQocC5kZWJ0KSlcbiAgICAgICAgICAgICAgICAuZ3JpZCgyMCwgMCwgMTAsIDMpXG4gICAgICAgICAgICAgICAgLnJvb3N0KHBsYXllcik7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cbmV4cG9ydCBkZWZhdWx0IHtcbiAgICB1cGRhdGVfZXZlbnRfY2FjaGU6IHVwZGF0ZV9ldmVudF9jYWNoZSxcbiAgICByZWNpZXZlX25ld19tZXNzYWdlczogcmVjaWV2ZV9uZXdfbWVzc2FnZXMsXG59O1xuIiwiIiwiaW1wb3J0IHsgZ2V0X3VuaXZlcnNlIH0gZnJvbSBcIi4vdXRpbGl0aWVzL2dldF9nYW1lX3N0YXRlXCI7XG5leHBvcnQgZnVuY3Rpb24gZ2V0X2hlcm8odW5pdmVyc2UpIHtcbiAgICBpZiAodW5pdmVyc2UgPT09IHZvaWQgMCkgeyB1bml2ZXJzZSA9IGdldF91bml2ZXJzZSgpOyB9XG4gICAgcmV0dXJuIHVuaXZlcnNlLnBsYXllcjtcbn1cbiIsImV4cG9ydCB2YXIgbGFzdENsaXAgPSBcIkVycm9yXCI7XG5leHBvcnQgZnVuY3Rpb24gY2xpcCh0ZXh0KSB7XG4gICAgbGFzdENsaXAgPSB0ZXh0O1xufVxuIiwiaW1wb3J0IHsgZ2V0X2hlcm8gfSBmcm9tIFwiLi9nZXRfaGVyb1wiO1xuaW1wb3J0ICogYXMgQ2FjaGUgZnJvbSBcIi4vZXZlbnRfY2FjaGVcIjtcbi8vR2V0IGxlZGdlciBpbmZvIHRvIHNlZSB3aGF0IGlzIG93ZWRcbi8vQWN0dWFsbHkgc2hvd3MgdGhlIHBhbmVsIG9mIGxvYWRpbmdcbmV4cG9ydCBmdW5jdGlvbiBnZXRfbGVkZ2VyKGdhbWUsIGNydXgsIG1lc3NhZ2VzKSB7XG4gICAgdmFyIG5wdWkgPSBnYW1lLm5wdWk7XG4gICAgdmFyIHVuaXZlcnNlID0gZ2FtZS51bml2ZXJzZTtcbiAgICB2YXIgcGxheWVycyA9IHVuaXZlcnNlLmdhbGF4eS5wbGF5ZXJzO1xuICAgIHZhciBsb2FkaW5nID0gY3J1eFxuICAgICAgICAuVGV4dChcIlwiLCBcInJlbCB0eHRfY2VudGVyIHBhZDEyXCIpXG4gICAgICAgIC5yYXdIVE1MKFwiUGFyc2luZyBcIi5jb25jYXQobWVzc2FnZXMubGVuZ3RoLCBcIiBtZXNzYWdlcy5cIikpO1xuICAgIGxvYWRpbmcucm9vc3QobnB1aS5hY3RpdmVTY3JlZW4pO1xuICAgIHZhciB1aWQgPSBnZXRfaGVybyh1bml2ZXJzZSkudWlkO1xuICAgIC8vTGVkZ2VyIGlzIGEgbGlzdCBvZiBkZWJ0c1xuICAgIHZhciBsZWRnZXIgPSB7fTtcbiAgICBtZXNzYWdlc1xuICAgICAgICAuZmlsdGVyKGZ1bmN0aW9uIChtKSB7XG4gICAgICAgIHJldHVybiBtLnBheWxvYWQudGVtcGxhdGUgPT0gXCJtb25leV9zZW50XCIgfHxcbiAgICAgICAgICAgIG0ucGF5bG9hZC50ZW1wbGF0ZSA9PSBcInNoYXJlZF90ZWNobm9sb2d5XCI7XG4gICAgfSlcbiAgICAgICAgLm1hcChmdW5jdGlvbiAobSkgeyByZXR1cm4gbS5wYXlsb2FkOyB9KVxuICAgICAgICAuZm9yRWFjaChmdW5jdGlvbiAobSkge1xuICAgICAgICB2YXIgbGlhaXNvbiA9IG0uZnJvbV9wdWlkID09IHVpZCA/IG0udG9fcHVpZCA6IG0uZnJvbV9wdWlkO1xuICAgICAgICB2YXIgdmFsdWUgPSBtLnRlbXBsYXRlID09IFwibW9uZXlfc2VudFwiID8gbS5hbW91bnQgOiBtLnByaWNlO1xuICAgICAgICB2YWx1ZSAqPSBtLmZyb21fcHVpZCA9PSB1aWQgPyAxIDogLTE7IC8vIGFtb3VudCBpcyAoKykgaWYgY3JlZGl0ICYgKC0pIGlmIGRlYnRcbiAgICAgICAgbGlhaXNvbiBpbiBsZWRnZXJcbiAgICAgICAgICAgID8gKGxlZGdlcltsaWFpc29uXSArPSB2YWx1ZSlcbiAgICAgICAgICAgIDogKGxlZGdlcltsaWFpc29uXSA9IHZhbHVlKTtcbiAgICB9KTtcbiAgICAvL1RPRE86IFJldmlldyB0aGF0IHRoaXMgaXMgY29ycmVjdGx5IGZpbmRpbmcgYSBsaXN0IG9mIG9ubHkgcGVvcGxlIHdobyBoYXZlIGRlYnRzLlxuICAgIC8vQWNjb3VudHMgYXJlIHRoZSBjcmVkaXQgb3IgZGViaXQgcmVsYXRlZCB0byBlYWNoIHVzZXJcbiAgICB2YXIgYWNjb3VudHMgPSBbXTtcbiAgICBmb3IgKHZhciB1aWRfMSBpbiBsZWRnZXIpIHtcbiAgICAgICAgdmFyIHBsYXllciA9IHBsYXllcnNbcGFyc2VJbnQodWlkXzEpXTtcbiAgICAgICAgcGxheWVyLmRlYnQgPSBsZWRnZXJbdWlkXzFdO1xuICAgICAgICBhY2NvdW50cy5wdXNoKHBsYXllcik7XG4gICAgfVxuICAgIGdldF9oZXJvKHVuaXZlcnNlKS5sZWRnZXIgPSBsZWRnZXI7XG4gICAgY29uc29sZS5sb2coYWNjb3VudHMpO1xuICAgIHJldHVybiBhY2NvdW50cztcbn1cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJMZWRnZXIoZ2FtZSwgY3J1eCwgTW91c2VUcmFwKSB7XG4gICAgLy9EZWNvbnN0cnVjdGlvbiBvZiBkaWZmZXJlbnQgY29tcG9uZW50cyBvZiB0aGUgZ2FtZS5cbiAgICB2YXIgY29uZmlnID0gZ2FtZS5jb25maWc7XG4gICAgdmFyIG5wID0gZ2FtZS5ucDtcbiAgICB2YXIgbnB1aSA9IGdhbWUubnB1aTtcbiAgICB2YXIgdW5pdmVyc2UgPSBnYW1lLnVuaXZlcnNlO1xuICAgIHZhciB0ZW1wbGF0ZXMgPSBnYW1lLnRlbXBsYXRlcztcbiAgICB2YXIgcGxheWVycyA9IHVuaXZlcnNlLmdhbGF4eS5wbGF5ZXJzO1xuICAgIE1vdXNlVHJhcC5iaW5kKFtcIm1cIiwgXCJNXCJdLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIG5wLnRyaWdnZXIoXCJ0cmlnZ2VyX2xlZGdlclwiKTtcbiAgICB9KTtcbiAgICB0ZW1wbGF0ZXNbXCJsZWRnZXJcIl0gPSBcIkxlZGdlclwiO1xuICAgIHRlbXBsYXRlc1tcInRlY2hfdHJhZGluZ1wiXSA9IFwiVHJhZGluZyBUZWNobm9sb2d5XCI7XG4gICAgdGVtcGxhdGVzW1wiZm9yZ2l2ZVwiXSA9IFwiUGF5IERlYnRcIjtcbiAgICB0ZW1wbGF0ZXNbXCJmb3JnaXZlX2RlYnRcIl0gPSBcIkFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBmb3JnaXZlIHRoaXMgZGVidD9cIjtcbiAgICBpZiAoIW5wdWkuaGFzbWVudWl0ZW0pIHtcbiAgICAgICAgbnB1aVxuICAgICAgICAgICAgLlNpZGVNZW51SXRlbShcImljb24tZGF0YWJhc2VcIiwgXCJsZWRnZXJcIiwgXCJ0cmlnZ2VyX2xlZGdlclwiKVxuICAgICAgICAgICAgLnJvb3N0KG5wdWkuc2lkZU1lbnUpO1xuICAgICAgICBucHVpLmhhc21lbnVpdGVtID0gdHJ1ZTtcbiAgICB9XG4gICAgbnB1aS5sZWRnZXJTY3JlZW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBucHVpLlNjcmVlbihcImxlZGdlclwiKTtcbiAgICB9O1xuICAgIG5wLm9uKFwidHJpZ2dlcl9sZWRnZXJcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgbGVkZ2VyU2NyZWVuID0gbnB1aS5sZWRnZXJTY3JlZW4oKTtcbiAgICAgICAgdmFyIGxvYWRpbmcgPSBjcnV4XG4gICAgICAgICAgICAuVGV4dChcIlwiLCBcInJlbCB0eHRfY2VudGVyIHBhZDEyIHNlY3Rpb25fdGl0bGVcIilcbiAgICAgICAgICAgIC5yYXdIVE1MKFwiVGFidWxhdGluZyBMZWRnZXIuLi5cIik7XG4gICAgICAgIGxvYWRpbmcucm9vc3QobGVkZ2VyU2NyZWVuKTtcbiAgICAgICAgbnB1aS5vbkhpZGVTY3JlZW4obnVsbCwgdHJ1ZSk7XG4gICAgICAgIG5wdWkub25IaWRlU2VsZWN0aW9uTWVudSgpO1xuICAgICAgICBucHVpLnRyaWdnZXIoXCJoaWRlX3NpZGVfbWVudVwiKTtcbiAgICAgICAgbnB1aS50cmlnZ2VyKFwicmVzZXRfZWRpdF9tb2RlXCIpO1xuICAgICAgICBucHVpLmFjdGl2ZVNjcmVlbiA9IGxlZGdlclNjcmVlbjtcbiAgICAgICAgbGVkZ2VyU2NyZWVuLnJvb3N0KG5wdWkuc2NyZWVuQ29udGFpbmVyKTtcbiAgICAgICAgbnB1aS5sYXlvdXRFbGVtZW50KGxlZGdlclNjcmVlbik7XG4gICAgICAgIENhY2hlLnVwZGF0ZV9ldmVudF9jYWNoZShnYW1lLCBjcnV4LCA0LCBDYWNoZS5yZWNpZXZlX25ld19tZXNzYWdlcywgY29uc29sZS5lcnJvcik7XG4gICAgfSk7XG4gICAgLy9XaHkgbm90IG5wLm9uKFwiRm9yZ2l2ZURlYnRcIik/XG4gICAgbnAub25Gb3JnaXZlRGVidCA9IGZ1bmN0aW9uIChldmVudCwgZGF0YSkge1xuICAgICAgICB2YXIgdGFyZ2V0UGxheWVyID0gZGF0YS50YXJnZXRQbGF5ZXI7XG4gICAgICAgIHZhciBwbGF5ZXIgPSBwbGF5ZXJzW3RhcmdldFBsYXllcl07XG4gICAgICAgIHZhciBhbW91bnQgPSBwbGF5ZXIuZGVidCAqIC0xO1xuICAgICAgICAvL2xldCBhbW91bnQgPSAxXG4gICAgICAgIHVuaXZlcnNlLnBsYXllci5sZWRnZXJbdGFyZ2V0UGxheWVyXSA9IDA7XG4gICAgICAgIG5wLnRyaWdnZXIoXCJzaG93X3NjcmVlblwiLCBbXG4gICAgICAgICAgICBcImNvbmZpcm1cIixcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBcImZvcmdpdmVfZGVidFwiLFxuICAgICAgICAgICAgICAgIGV2ZW50S2luZDogXCJjb25maXJtX2ZvcmdpdmVfZGVidFwiLFxuICAgICAgICAgICAgICAgIGV2ZW50RGF0YToge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiBcIm9yZGVyXCIsXG4gICAgICAgICAgICAgICAgICAgIG9yZGVyOiBcInNlbmRfbW9uZXksXCIuY29uY2F0KHRhcmdldFBsYXllciwgXCIsXCIpLmNvbmNhdChhbW91bnQpLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICBdKTtcbiAgICB9O1xuICAgIG5wLm9uKFwiY29uZmlybV9mb3JnaXZlX2RlYnRcIiwgZnVuY3Rpb24gKGV2ZW50LCBkYXRhKSB7XG4gICAgICAgIG5wLnRyaWdnZXIoXCJzZXJ2ZXJfcmVxdWVzdFwiLCBkYXRhKTtcbiAgICAgICAgbnAudHJpZ2dlcihcInRyaWdnZXJfbGVkZ2VyXCIpO1xuICAgIH0pO1xuICAgIG5wLm9uKFwiZm9yZ2l2ZV9kZWJ0XCIsIG5wLm9uRm9yZ2l2ZURlYnQpO1xufVxuIiwiaW1wb3J0IHsgZ2V0X2dhbGF4eSwgfSBmcm9tIFwiLi91dGlsaXRpZXMvZ2V0X2dhbWVfc3RhdGVcIjtcbmltcG9ydCB7IGdldF9hcGlfZGF0YSB9IGZyb20gXCIuL3V0aWxpdGllcy9hcGlcIjtcbnZhciBvcmlnaW5hbFBsYXllciA9IHVuZGVmaW5lZDtcbi8vVGhpcyBzYXZlcyB0aGUgYWN0dWFsIGNsaWVudCdzIHBsYXllci5cbmZ1bmN0aW9uIHNldF9vcmlnaW5hbF9wbGF5ZXIoKSB7XG4gICAgaWYgKG9yaWdpbmFsUGxheWVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgb3JpZ2luYWxQbGF5ZXIgPSBOZXB0dW5lc1ByaWRlLm9yaWdpbmFsUGxheWVyO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuZnVuY3Rpb24gdmFsaWRfYXBpa2V5KGFwaWtleSkge1xuICAgIHJldHVybiB0cnVlO1xufVxuZnVuY3Rpb24gYmFkX2tleShlcnIpIHtcbiAgICBjb25zb2xlLmxvZyhcIlRoZSBrZXkgaXMgYmFkIGFuZCBtZXJnaW5nIEZBSUxFRCFcIik7XG59XG5leHBvcnQgZnVuY3Rpb24gbWVyZ2VVc2VyKGV2ZW50LCBkYXRhKSB7XG4gICAgc2V0X29yaWdpbmFsX3BsYXllcigpO1xuICAgIC8vRXh0cmFjdCB0aGF0IEtFWVxuICAgIC8vVE9ETzogQWRkIHJlZ2V4IHRvIGdldCBUSEFUIEtFWVxuICAgIHZhciBhcGlrZXkgPSBkYXRhID09PSBudWxsIHx8IGRhdGEgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGRhdGEuc3BsaXQoXCI6XCIpWzFdO1xuICAgIGNvbnNvbGUubG9nKGFwaWtleSk7XG4gICAgaWYgKHZhbGlkX2FwaWtleShhcGlrZXkpKSB7XG4gICAgICAgIGdldF9hcGlfZGF0YShhcGlrZXkpXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgcmV0dXJuIFwiZXJyb3JcIiBpbiBkYXRhXG4gICAgICAgICAgICAgICAgPyBiYWRfa2V5KGRhdGEpXG4gICAgICAgICAgICAgICAgOiBtZXJnZVVzZXJEYXRhKGRhdGEuc2Nhbm5pbmdfZGF0YSk7XG4gICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goY29uc29sZS5sb2cpO1xuICAgIH1cbn1cbi8vQ29tYmluZSBkYXRhIGZyb20gYW5vdGhlciB1c2VyXG4vL0NhbGxiYWNrIG9uIEFQSSAuLlxuLy9tZWNoYW5pYyBjbG9zZXMgYXQgNXBrLG1cbmV4cG9ydCBmdW5jdGlvbiBtZXJnZVVzZXJEYXRhKHNjYW5uaW5nRGF0YSkge1xuICAgIHZhciBnYWxheHkgPSBnZXRfZ2FsYXh5KCk7XG4gICAgdmFyIHN0YXJzID0gc2Nhbm5pbmdEYXRhLnN0YXJzO1xuICAgIHZhciBmbGVldHMgPSBzY2FubmluZ0RhdGEuZmxlZXRzO1xuICAgIC8vIFVwZGF0ZSBzdGFyc1xuICAgIGZvciAodmFyIHN0YXJJZCBpbiBzdGFycykge1xuICAgICAgICB2YXIgc3RhciA9IHN0YXJzW3N0YXJJZF07XG4gICAgICAgIGlmIChPYmplY3Qua2V5cyhnYWxheHkuc3RhcnMpLmluZGV4T2Yoc3RhcklkKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIC8vIFRoZSBzdGFyIGFscmVhZHkgZXhpc3RzLCBkbyBzb21ldGhpbmdcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiU3RhciBhbHJlYWR5IGV4aXN0cyBpbiB0aGUgZ2FsYXh5XCIpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gVGhlIHN0YXIgZG9lcyBub3QgZXhpc3QsIGFkZCBpdCB0byB0aGUgZ2FsYXh5XG4gICAgICAgICAgICBnYWxheHkuc3RhcnNbc3RhcklkXSA9IHN0YXI7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gQWRkIGZsZWV0c1xuICAgIGZvciAodmFyIGZsZWV0SWQgaW4gZmxlZXRzKSB7XG4gICAgICAgIHZhciBmbGVldCA9IGZsZWV0c1tmbGVldElkXTtcbiAgICAgICAgLy8gQ2hlY2sgaWYgdGhlIGZsZWV0IGFscmVhZHkgZXhpc3RzIGluIHRoZSBnYWxheHlcbiAgICAgICAgaWYgKE9iamVjdC5rZXlzKGdhbGF4eS5mbGVldHMpLmluZGV4T2YoZmxlZXRJZCkgIT09IC0xKSB7XG4gICAgICAgICAgICAvLyBUaGUgZmxlZXQgYWxyZWFkeSBleGlzdHMsIGRvIHNvbWV0aGluZ1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJGbGVldCBhbHJlYWR5IGV4aXN0cyBpbiB0aGUgZ2FsYXh5XCIpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gVGhlIGZsZWV0IGRvZXMgbm90IGV4aXN0LCBhZGQgaXQgdG8gdGhlIGdhbGF4eVxuICAgICAgICAgICAgZ2FsYXh5LmZsZWV0c1tmbGVldElkXSA9IGZsZWV0O1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vTmVwdHVuZXNQcmlkZS5ucC5vbkZ1bGxVbml2ZXJzZShudWxsLCBnYWxheHkpO1xuICAgIC8vTmVwdHVuZXNQcmlkZS5ucHVpLm9uSGlkZVNjcmVlbihudWxsLCB0cnVlKTtcbn1cbiIsImltcG9ydCB7IG1hcmtlZCB9IGZyb20gXCJtYXJrZWRcIjtcbmV4cG9ydCBmdW5jdGlvbiBtYXJrZG93bihtYXJrZG93blN0cmluZykge1xuICAgIHJldHVybiBtYXJrZWQucGFyc2UobWFya2Rvd25TdHJpbmcpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGlzX3ZhbGlkX2ltYWdlX3VybChzdHIpIHtcbiAgICB2YXIgcHJvdG9jb2wgPSBcIl4oaHR0cHM6XFxcXC9cXFxcLylcIjtcbiAgICB2YXIgZG9tYWlucyA9IFwiKGlcXFxcLmliYlxcXFwuY298aVxcXFwuaW1ndXJcXFxcLmNvbXxjZG5cXFxcLmRpc2NvcmRhcHBcXFxcLmNvbSlcIjtcbiAgICB2YXIgY29udGVudCA9IFwiKFsmI189O1xcXFwtXFxcXD9cXFxcL1xcXFx3XXsxLDE1MH0pXCI7XG4gICAgdmFyIGltYWdlcyA9IFwiKFxcXFwuKShnaWZ8anBlP2d8dGlmZj98cG5nfHdlYnB8Ym1wfEdJRnxKUEU/R3xUSUZGP3xQTkd8V0VCUHxCTVApJFwiO1xuICAgIHZhciByZWdleF9zdHJpbmcgPSBwcm90b2NvbCArIGRvbWFpbnMgKyBjb250ZW50ICsgaW1hZ2VzO1xuICAgIHZhciByZWdleCA9IG5ldyBSZWdFeHAocmVnZXhfc3RyaW5nKTtcbiAgICB2YXIgdmFsaWQgPSByZWdleC50ZXN0KHN0cik7XG4gICAgcmV0dXJuIHZhbGlkO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGlzX3ZhbGlkX3lvdXR1YmUoc3RyKSB7XG4gICAgdmFyIHByb3RvY29sID0gXCJeKGh0dHBzOi8vKVwiO1xuICAgIHZhciBkb21haW5zID0gXCIoeW91dHViZS5jb218d3d3LnlvdXR1YmUuY29tfHlvdXR1LmJlKVwiO1xuICAgIHZhciBjb250ZW50ID0gXCIoWyYjXz07LT8vd117MSwxNTB9KVwiO1xuICAgIHZhciByZWdleF9zdHJpbmcgPSBwcm90b2NvbCArIGRvbWFpbnMgKyBjb250ZW50O1xuICAgIHZhciByZWdleCA9IG5ldyBSZWdFeHAocmVnZXhfc3RyaW5nKTtcbiAgICByZXR1cm4gcmVnZXgudGVzdChzdHIpO1xufVxuZnVuY3Rpb24gZ2V0X3lvdXR1YmVfZW1iZWQobGluaykge1xuICAgIHJldHVybiBcIjxpZnJhbWUgd2lkdGg9XFxcIjU2MFxcXCIgaGVpZ2h0PVxcXCIzMTVcXFwiIHNyYz1cXFwiaHR0cHM6Ly93d3cueW91dHViZS5jb20vZW1iZWQvZUhzRFRHd19qWjhcXFwiIHRpdGxlPVxcXCJZb3VUdWJlIHZpZGVvIHBsYXllclxcXCIgZnJhbWVib3JkZXI9XFxcIjBcXFwiIGFsbG93PVxcXCJhY2NlbGVyb21ldGVyOyBhdXRvcGxheTsgY2xpcGJvYXJkLXdyaXRlOyBlbmNyeXB0ZWQtbWVkaWE7IGd5cm9zY29wZTsgcGljdHVyZS1pbi1waWN0dXJlOyB3ZWItc2hhcmVcXFwiIGFsbG93ZnVsbHNjcmVlbj48L2lmcmFtZT5cIjtcbn1cbiIsImltcG9ydCB7IGdldF9nYW1lX251bWJlciB9IGZyb20gXCIuL2dldF9nYW1lX3N0YXRlXCI7XG5leHBvcnQgZnVuY3Rpb24gZ2V0X2FwaV9kYXRhKGFwaWtleSkge1xuICAgIHZhciBnYW1lX251bWJlciA9IGdldF9nYW1lX251bWJlcigpO1xuICAgIHJldHVybiBmZXRjaChcImh0dHBzOi8vbnAuaXJvbmhlbG1ldC5jb20vYXBpXCIsIHtcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgYWNjZXB0OiBcImFwcGxpY2F0aW9uL2pzb24sIHRleHQvamF2YXNjcmlwdCwgKi8qOyBxPTAuMDFcIixcbiAgICAgICAgICAgIFwiYWNjZXB0LWxhbmd1YWdlXCI6IFwiZW4tVVMsZW47cT0wLjlcIixcbiAgICAgICAgICAgIFwiY29udGVudC10eXBlXCI6IFwiYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkOyBjaGFyc2V0PVVURi04XCIsXG4gICAgICAgICAgICBcIngtcmVxdWVzdGVkLXdpdGhcIjogXCJYTUxIdHRwUmVxdWVzdFwiLFxuICAgICAgICB9LFxuICAgICAgICByZWZlcnJlcjogXCJodHRwczovL25wLmlyb25oZWxtZXQuY29tL2dhbWUvXCIuY29uY2F0KGdhbWVfbnVtYmVyKSxcbiAgICAgICAgcmVmZXJyZXJQb2xpY3k6IFwic3RyaWN0LW9yaWdpbi13aGVuLWNyb3NzLW9yaWdpblwiLFxuICAgICAgICBib2R5OiBcImdhbWVfbnVtYmVyPVwiLmNvbmNhdChnYW1lX251bWJlciwgXCImYXBpX3ZlcnNpb249MC4xJmNvZGU9XCIpLmNvbmNhdChhcGlrZXkpLFxuICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgICBtb2RlOiBcImNvcnNcIixcbiAgICAgICAgY3JlZGVudGlhbHM6IFwiaW5jbHVkZVwiLFxuICAgIH0pLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7IHJldHVybiByZXNwb25zZS5qc29uKCk7IH0pO1xufVxuIiwiZXhwb3J0IGZ1bmN0aW9uIGdldF92aXNpYmxlX3N0YXJzKCkge1xuICAgIHZhciBzdGFycyA9IGdldF9hbGxfc3RhcnMoKTtcbiAgICBpZiAoc3RhcnMgPT09IHVuZGVmaW5lZClcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB2YXIgdmlzaWJsZV9zdGFycyA9IFtdO1xuICAgIGZvciAodmFyIF9pID0gMCwgX2EgPSBPYmplY3QuZW50cmllcyhzdGFycyk7IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgIHZhciBfYiA9IF9hW19pXSwgaW5kZXggPSBfYlswXSwgc3RhciA9IF9iWzFdO1xuICAgICAgICBpZiAoc3Rhci52ID09PSBcIjFcIikge1xuICAgICAgICAgICAgLy9TdGFyIGlzIHZpc2libGVcbiAgICAgICAgICAgIHZpc2libGVfc3RhcnMucHVzaChzdGFyKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdmlzaWJsZV9zdGFycztcbn1cbmV4cG9ydCBmdW5jdGlvbiBnZXRfZ2FtZV9udW1iZXIoKSB7XG4gICAgaWYgKE5lcHR1bmVzUHJpZGUgPT09IHVuZGVmaW5lZClcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICByZXR1cm4gTmVwdHVuZXNQcmlkZS5nYW1lTnVtYmVyO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGdldF9hbGxfc3RhcnMoKSB7XG4gICAgaWYgKE5lcHR1bmVzUHJpZGUgPT09IHVuZGVmaW5lZClcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICByZXR1cm4gTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5nYWxheHkuc3RhcnM7XG59XG5leHBvcnQgZnVuY3Rpb24gZ2V0X2ZsZWV0cygpIHtcbiAgICBpZiAoTmVwdHVuZXNQcmlkZSA9PT0gdW5kZWZpbmVkKVxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIHJldHVybiBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlLmdhbGF4eS5mbGVldHM7XG59XG5leHBvcnQgZnVuY3Rpb24gZ2V0X2dhbGF4eSgpIHtcbiAgICBpZiAoTmVwdHVuZXNQcmlkZSA9PT0gdW5kZWZpbmVkKVxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIHJldHVybiBnZXRfdW5pdmVyc2UoKS5nYWxheHk7XG59XG5leHBvcnQgZnVuY3Rpb24gZ2V0X3VuaXZlcnNlKCkge1xuICAgIGlmIChOZXB0dW5lc1ByaWRlID09PSB1bmRlZmluZWQpXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgcmV0dXJuIE5lcHR1bmVzUHJpZGUudW5pdmVyc2U7XG59XG5leHBvcnQgZnVuY3Rpb24gZ2V0X25lcHR1bmVzX3ByaWRlKCkge1xuICAgIGlmIChOZXB0dW5lc1ByaWRlID09PSB1bmRlZmluZWQpXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgcmV0dXJuIE5lcHR1bmVzUHJpZGUubnA7XG59XG5leHBvcnQgZnVuY3Rpb24gZ2V0X2dhbWVfc3RhdGUoKSB7XG4gICAgaWYgKE5lcHR1bmVzUHJpZGUgPT09IHVuZGVmaW5lZClcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICByZXR1cm4gTmVwdHVuZXNQcmlkZTtcbn1cbiIsImV4cG9ydCBmdW5jdGlvbiBkcmF3T3ZlcmxheVN0cmluZyhjb250ZXh0LCB0ZXh0LCB4LCB5LCBmZ0NvbG9yKSB7XG4gICAgY29udGV4dC5maWxsU3R5bGUgPSBcIiMwMDAwMDBcIjtcbiAgICBmb3IgKHZhciBzbWVhciA9IDE7IHNtZWFyIDwgNDsgKytzbWVhcikge1xuICAgICAgICBjb250ZXh0LmZpbGxUZXh0KHRleHQsIHggKyBzbWVhciwgeSArIHNtZWFyKTtcbiAgICAgICAgY29udGV4dC5maWxsVGV4dCh0ZXh0LCB4IC0gc21lYXIsIHkgKyBzbWVhcik7XG4gICAgICAgIGNvbnRleHQuZmlsbFRleHQodGV4dCwgeCAtIHNtZWFyLCB5IC0gc21lYXIpO1xuICAgICAgICBjb250ZXh0LmZpbGxUZXh0KHRleHQsIHggKyBzbWVhciwgeSAtIHNtZWFyKTtcbiAgICB9XG4gICAgY29udGV4dC5maWxsU3R5bGUgPSBmZ0NvbG9yIHx8IFwiIzAwZmYwMFwiO1xuICAgIGNvbnRleHQuZmlsbFRleHQodGV4dCwgeCwgeSk7XG59XG5leHBvcnQgZnVuY3Rpb24gYW55U3RhckNhblNlZSh1bml2ZXJzZSwgb3duZXIsIGZsZWV0KSB7XG4gICAgdmFyIHN0YXJzID0gdW5pdmVyc2UuZ2FsYXh5LnN0YXJzO1xuICAgIHZhciBzY2FuUmFuZ2UgPSB1bml2ZXJzZS5nYWxheHkucGxheWVyc1tvd25lcl0udGVjaC5zY2FubmluZy52YWx1ZTtcbiAgICBmb3IgKHZhciBzIGluIHN0YXJzKSB7XG4gICAgICAgIHZhciBzdGFyID0gc3RhcnNbc107XG4gICAgICAgIGlmIChzdGFyLnB1aWQgPT0gb3duZXIpIHtcbiAgICAgICAgICAgIHZhciBkaXN0YW5jZSA9IHVuaXZlcnNlLmRpc3RhbmNlKHN0YXIueCwgc3Rhci55LCBwYXJzZUZsb2F0KGZsZWV0LngpLCBwYXJzZUZsb2F0KGZsZWV0LnkpKTtcbiAgICAgICAgICAgIGlmIChkaXN0YW5jZSA8PSBzY2FuUmFuZ2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59XG4iLCIvKipcbiAqIG1hcmtlZCB2NC4yLjEyIC0gYSBtYXJrZG93biBwYXJzZXJcbiAqIENvcHlyaWdodCAoYykgMjAxMS0yMDIzLCBDaHJpc3RvcGhlciBKZWZmcmV5LiAoTUlUIExpY2Vuc2VkKVxuICogaHR0cHM6Ly9naXRodWIuY29tL21hcmtlZGpzL21hcmtlZFxuICovXG5cbi8qKlxuICogRE8gTk9UIEVESVQgVEhJUyBGSUxFXG4gKiBUaGUgY29kZSBpbiB0aGlzIGZpbGUgaXMgZ2VuZXJhdGVkIGZyb20gZmlsZXMgaW4gLi9zcmMvXG4gKi9cblxuZnVuY3Rpb24gZ2V0RGVmYXVsdHMoKSB7XG4gIHJldHVybiB7XG4gICAgYXN5bmM6IGZhbHNlLFxuICAgIGJhc2VVcmw6IG51bGwsXG4gICAgYnJlYWtzOiBmYWxzZSxcbiAgICBleHRlbnNpb25zOiBudWxsLFxuICAgIGdmbTogdHJ1ZSxcbiAgICBoZWFkZXJJZHM6IHRydWUsXG4gICAgaGVhZGVyUHJlZml4OiAnJyxcbiAgICBoaWdobGlnaHQ6IG51bGwsXG4gICAgbGFuZ1ByZWZpeDogJ2xhbmd1YWdlLScsXG4gICAgbWFuZ2xlOiB0cnVlLFxuICAgIHBlZGFudGljOiBmYWxzZSxcbiAgICByZW5kZXJlcjogbnVsbCxcbiAgICBzYW5pdGl6ZTogZmFsc2UsXG4gICAgc2FuaXRpemVyOiBudWxsLFxuICAgIHNpbGVudDogZmFsc2UsXG4gICAgc21hcnR5cGFudHM6IGZhbHNlLFxuICAgIHRva2VuaXplcjogbnVsbCxcbiAgICB3YWxrVG9rZW5zOiBudWxsLFxuICAgIHhodG1sOiBmYWxzZVxuICB9O1xufVxuXG5sZXQgZGVmYXVsdHMgPSBnZXREZWZhdWx0cygpO1xuXG5mdW5jdGlvbiBjaGFuZ2VEZWZhdWx0cyhuZXdEZWZhdWx0cykge1xuICBkZWZhdWx0cyA9IG5ld0RlZmF1bHRzO1xufVxuXG4vKipcbiAqIEhlbHBlcnNcbiAqL1xuY29uc3QgZXNjYXBlVGVzdCA9IC9bJjw+XCInXS87XG5jb25zdCBlc2NhcGVSZXBsYWNlID0gbmV3IFJlZ0V4cChlc2NhcGVUZXN0LnNvdXJjZSwgJ2cnKTtcbmNvbnN0IGVzY2FwZVRlc3ROb0VuY29kZSA9IC9bPD5cIiddfCYoPyEoI1xcZHsxLDd9fCNbWHhdW2EtZkEtRjAtOV17MSw2fXxcXHcrKTspLztcbmNvbnN0IGVzY2FwZVJlcGxhY2VOb0VuY29kZSA9IG5ldyBSZWdFeHAoZXNjYXBlVGVzdE5vRW5jb2RlLnNvdXJjZSwgJ2cnKTtcbmNvbnN0IGVzY2FwZVJlcGxhY2VtZW50cyA9IHtcbiAgJyYnOiAnJmFtcDsnLFxuICAnPCc6ICcmbHQ7JyxcbiAgJz4nOiAnJmd0OycsXG4gICdcIic6ICcmcXVvdDsnLFxuICBcIidcIjogJyYjMzk7J1xufTtcbmNvbnN0IGdldEVzY2FwZVJlcGxhY2VtZW50ID0gKGNoKSA9PiBlc2NhcGVSZXBsYWNlbWVudHNbY2hdO1xuZnVuY3Rpb24gZXNjYXBlKGh0bWwsIGVuY29kZSkge1xuICBpZiAoZW5jb2RlKSB7XG4gICAgaWYgKGVzY2FwZVRlc3QudGVzdChodG1sKSkge1xuICAgICAgcmV0dXJuIGh0bWwucmVwbGFjZShlc2NhcGVSZXBsYWNlLCBnZXRFc2NhcGVSZXBsYWNlbWVudCk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmIChlc2NhcGVUZXN0Tm9FbmNvZGUudGVzdChodG1sKSkge1xuICAgICAgcmV0dXJuIGh0bWwucmVwbGFjZShlc2NhcGVSZXBsYWNlTm9FbmNvZGUsIGdldEVzY2FwZVJlcGxhY2VtZW50KTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gaHRtbDtcbn1cblxuY29uc3QgdW5lc2NhcGVUZXN0ID0gLyYoIyg/OlxcZCspfCg/OiN4WzAtOUEtRmEtZl0rKXwoPzpcXHcrKSk7Py9pZztcblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30gaHRtbFxuICovXG5mdW5jdGlvbiB1bmVzY2FwZShodG1sKSB7XG4gIC8vIGV4cGxpY2l0bHkgbWF0Y2ggZGVjaW1hbCwgaGV4LCBhbmQgbmFtZWQgSFRNTCBlbnRpdGllc1xuICByZXR1cm4gaHRtbC5yZXBsYWNlKHVuZXNjYXBlVGVzdCwgKF8sIG4pID0+IHtcbiAgICBuID0gbi50b0xvd2VyQ2FzZSgpO1xuICAgIGlmIChuID09PSAnY29sb24nKSByZXR1cm4gJzonO1xuICAgIGlmIChuLmNoYXJBdCgwKSA9PT0gJyMnKSB7XG4gICAgICByZXR1cm4gbi5jaGFyQXQoMSkgPT09ICd4J1xuICAgICAgICA/IFN0cmluZy5mcm9tQ2hhckNvZGUocGFyc2VJbnQobi5zdWJzdHJpbmcoMiksIDE2KSlcbiAgICAgICAgOiBTdHJpbmcuZnJvbUNoYXJDb2RlKCtuLnN1YnN0cmluZygxKSk7XG4gICAgfVxuICAgIHJldHVybiAnJztcbiAgfSk7XG59XG5cbmNvbnN0IGNhcmV0ID0gLyhefFteXFxbXSlcXF4vZztcblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZyB8IFJlZ0V4cH0gcmVnZXhcbiAqIEBwYXJhbSB7c3RyaW5nfSBvcHRcbiAqL1xuZnVuY3Rpb24gZWRpdChyZWdleCwgb3B0KSB7XG4gIHJlZ2V4ID0gdHlwZW9mIHJlZ2V4ID09PSAnc3RyaW5nJyA/IHJlZ2V4IDogcmVnZXguc291cmNlO1xuICBvcHQgPSBvcHQgfHwgJyc7XG4gIGNvbnN0IG9iaiA9IHtcbiAgICByZXBsYWNlOiAobmFtZSwgdmFsKSA9PiB7XG4gICAgICB2YWwgPSB2YWwuc291cmNlIHx8IHZhbDtcbiAgICAgIHZhbCA9IHZhbC5yZXBsYWNlKGNhcmV0LCAnJDEnKTtcbiAgICAgIHJlZ2V4ID0gcmVnZXgucmVwbGFjZShuYW1lLCB2YWwpO1xuICAgICAgcmV0dXJuIG9iajtcbiAgICB9LFxuICAgIGdldFJlZ2V4OiAoKSA9PiB7XG4gICAgICByZXR1cm4gbmV3IFJlZ0V4cChyZWdleCwgb3B0KTtcbiAgICB9XG4gIH07XG4gIHJldHVybiBvYmo7XG59XG5cbmNvbnN0IG5vbldvcmRBbmRDb2xvblRlc3QgPSAvW15cXHc6XS9nO1xuY29uc3Qgb3JpZ2luSW5kZXBlbmRlbnRVcmwgPSAvXiR8XlthLXpdW2EtejAtOSsuLV0qOnxeWz8jXS9pO1xuXG4vKipcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gc2FuaXRpemVcbiAqIEBwYXJhbSB7c3RyaW5nfSBiYXNlXG4gKiBAcGFyYW0ge3N0cmluZ30gaHJlZlxuICovXG5mdW5jdGlvbiBjbGVhblVybChzYW5pdGl6ZSwgYmFzZSwgaHJlZikge1xuICBpZiAoc2FuaXRpemUpIHtcbiAgICBsZXQgcHJvdDtcbiAgICB0cnkge1xuICAgICAgcHJvdCA9IGRlY29kZVVSSUNvbXBvbmVudCh1bmVzY2FwZShocmVmKSlcbiAgICAgICAgLnJlcGxhY2Uobm9uV29yZEFuZENvbG9uVGVzdCwgJycpXG4gICAgICAgIC50b0xvd2VyQ2FzZSgpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBpZiAocHJvdC5pbmRleE9mKCdqYXZhc2NyaXB0OicpID09PSAwIHx8IHByb3QuaW5kZXhPZigndmJzY3JpcHQ6JykgPT09IDAgfHwgcHJvdC5pbmRleE9mKCdkYXRhOicpID09PSAwKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cbiAgaWYgKGJhc2UgJiYgIW9yaWdpbkluZGVwZW5kZW50VXJsLnRlc3QoaHJlZikpIHtcbiAgICBocmVmID0gcmVzb2x2ZVVybChiYXNlLCBocmVmKTtcbiAgfVxuICB0cnkge1xuICAgIGhyZWYgPSBlbmNvZGVVUkkoaHJlZikucmVwbGFjZSgvJTI1L2csICclJyk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICByZXR1cm4gaHJlZjtcbn1cblxuY29uc3QgYmFzZVVybHMgPSB7fTtcbmNvbnN0IGp1c3REb21haW4gPSAvXlteOl0rOlxcLypbXi9dKiQvO1xuY29uc3QgcHJvdG9jb2wgPSAvXihbXjpdKzopW1xcc1xcU10qJC87XG5jb25zdCBkb21haW4gPSAvXihbXjpdKzpcXC8qW14vXSopW1xcc1xcU10qJC87XG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmd9IGJhc2VcbiAqIEBwYXJhbSB7c3RyaW5nfSBocmVmXG4gKi9cbmZ1bmN0aW9uIHJlc29sdmVVcmwoYmFzZSwgaHJlZikge1xuICBpZiAoIWJhc2VVcmxzWycgJyArIGJhc2VdKSB7XG4gICAgLy8gd2UgY2FuIGlnbm9yZSBldmVyeXRoaW5nIGluIGJhc2UgYWZ0ZXIgdGhlIGxhc3Qgc2xhc2ggb2YgaXRzIHBhdGggY29tcG9uZW50LFxuICAgIC8vIGJ1dCB3ZSBtaWdodCBuZWVkIHRvIGFkZCBfdGhhdF9cbiAgICAvLyBodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzk4NiNzZWN0aW9uLTNcbiAgICBpZiAoanVzdERvbWFpbi50ZXN0KGJhc2UpKSB7XG4gICAgICBiYXNlVXJsc1snICcgKyBiYXNlXSA9IGJhc2UgKyAnLyc7XG4gICAgfSBlbHNlIHtcbiAgICAgIGJhc2VVcmxzWycgJyArIGJhc2VdID0gcnRyaW0oYmFzZSwgJy8nLCB0cnVlKTtcbiAgICB9XG4gIH1cbiAgYmFzZSA9IGJhc2VVcmxzWycgJyArIGJhc2VdO1xuICBjb25zdCByZWxhdGl2ZUJhc2UgPSBiYXNlLmluZGV4T2YoJzonKSA9PT0gLTE7XG5cbiAgaWYgKGhyZWYuc3Vic3RyaW5nKDAsIDIpID09PSAnLy8nKSB7XG4gICAgaWYgKHJlbGF0aXZlQmFzZSkge1xuICAgICAgcmV0dXJuIGhyZWY7XG4gICAgfVxuICAgIHJldHVybiBiYXNlLnJlcGxhY2UocHJvdG9jb2wsICckMScpICsgaHJlZjtcbiAgfSBlbHNlIGlmIChocmVmLmNoYXJBdCgwKSA9PT0gJy8nKSB7XG4gICAgaWYgKHJlbGF0aXZlQmFzZSkge1xuICAgICAgcmV0dXJuIGhyZWY7XG4gICAgfVxuICAgIHJldHVybiBiYXNlLnJlcGxhY2UoZG9tYWluLCAnJDEnKSArIGhyZWY7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGJhc2UgKyBocmVmO1xuICB9XG59XG5cbmNvbnN0IG5vb3BUZXN0ID0geyBleGVjOiBmdW5jdGlvbiBub29wVGVzdCgpIHt9IH07XG5cbmZ1bmN0aW9uIG1lcmdlKG9iaikge1xuICBsZXQgaSA9IDEsXG4gICAgdGFyZ2V0LFxuICAgIGtleTtcblxuICBmb3IgKDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgIHRhcmdldCA9IGFyZ3VtZW50c1tpXTtcbiAgICBmb3IgKGtleSBpbiB0YXJnZXQpIHtcbiAgICAgIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodGFyZ2V0LCBrZXkpKSB7XG4gICAgICAgIG9ialtrZXldID0gdGFyZ2V0W2tleV07XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG9iajtcbn1cblxuZnVuY3Rpb24gc3BsaXRDZWxscyh0YWJsZVJvdywgY291bnQpIHtcbiAgLy8gZW5zdXJlIHRoYXQgZXZlcnkgY2VsbC1kZWxpbWl0aW5nIHBpcGUgaGFzIGEgc3BhY2VcbiAgLy8gYmVmb3JlIGl0IHRvIGRpc3Rpbmd1aXNoIGl0IGZyb20gYW4gZXNjYXBlZCBwaXBlXG4gIGNvbnN0IHJvdyA9IHRhYmxlUm93LnJlcGxhY2UoL1xcfC9nLCAobWF0Y2gsIG9mZnNldCwgc3RyKSA9PiB7XG4gICAgICBsZXQgZXNjYXBlZCA9IGZhbHNlLFxuICAgICAgICBjdXJyID0gb2Zmc2V0O1xuICAgICAgd2hpbGUgKC0tY3VyciA+PSAwICYmIHN0cltjdXJyXSA9PT0gJ1xcXFwnKSBlc2NhcGVkID0gIWVzY2FwZWQ7XG4gICAgICBpZiAoZXNjYXBlZCkge1xuICAgICAgICAvLyBvZGQgbnVtYmVyIG9mIHNsYXNoZXMgbWVhbnMgfCBpcyBlc2NhcGVkXG4gICAgICAgIC8vIHNvIHdlIGxlYXZlIGl0IGFsb25lXG4gICAgICAgIHJldHVybiAnfCc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBhZGQgc3BhY2UgYmVmb3JlIHVuZXNjYXBlZCB8XG4gICAgICAgIHJldHVybiAnIHwnO1xuICAgICAgfVxuICAgIH0pLFxuICAgIGNlbGxzID0gcm93LnNwbGl0KC8gXFx8Lyk7XG4gIGxldCBpID0gMDtcblxuICAvLyBGaXJzdC9sYXN0IGNlbGwgaW4gYSByb3cgY2Fubm90IGJlIGVtcHR5IGlmIGl0IGhhcyBubyBsZWFkaW5nL3RyYWlsaW5nIHBpcGVcbiAgaWYgKCFjZWxsc1swXS50cmltKCkpIHsgY2VsbHMuc2hpZnQoKTsgfVxuICBpZiAoY2VsbHMubGVuZ3RoID4gMCAmJiAhY2VsbHNbY2VsbHMubGVuZ3RoIC0gMV0udHJpbSgpKSB7IGNlbGxzLnBvcCgpOyB9XG5cbiAgaWYgKGNlbGxzLmxlbmd0aCA+IGNvdW50KSB7XG4gICAgY2VsbHMuc3BsaWNlKGNvdW50KTtcbiAgfSBlbHNlIHtcbiAgICB3aGlsZSAoY2VsbHMubGVuZ3RoIDwgY291bnQpIGNlbGxzLnB1c2goJycpO1xuICB9XG5cbiAgZm9yICg7IGkgPCBjZWxscy5sZW5ndGg7IGkrKykge1xuICAgIC8vIGxlYWRpbmcgb3IgdHJhaWxpbmcgd2hpdGVzcGFjZSBpcyBpZ25vcmVkIHBlciB0aGUgZ2ZtIHNwZWNcbiAgICBjZWxsc1tpXSA9IGNlbGxzW2ldLnRyaW0oKS5yZXBsYWNlKC9cXFxcXFx8L2csICd8Jyk7XG4gIH1cbiAgcmV0dXJuIGNlbGxzO1xufVxuXG4vKipcbiAqIFJlbW92ZSB0cmFpbGluZyAnYydzLiBFcXVpdmFsZW50IHRvIHN0ci5yZXBsYWNlKC9jKiQvLCAnJykuXG4gKiAvYyokLyBpcyB2dWxuZXJhYmxlIHRvIFJFRE9TLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBjXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGludmVydCBSZW1vdmUgc3VmZml4IG9mIG5vbi1jIGNoYXJzIGluc3RlYWQuIERlZmF1bHQgZmFsc2V5LlxuICovXG5mdW5jdGlvbiBydHJpbShzdHIsIGMsIGludmVydCkge1xuICBjb25zdCBsID0gc3RyLmxlbmd0aDtcbiAgaWYgKGwgPT09IDApIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cblxuICAvLyBMZW5ndGggb2Ygc3VmZml4IG1hdGNoaW5nIHRoZSBpbnZlcnQgY29uZGl0aW9uLlxuICBsZXQgc3VmZkxlbiA9IDA7XG5cbiAgLy8gU3RlcCBsZWZ0IHVudGlsIHdlIGZhaWwgdG8gbWF0Y2ggdGhlIGludmVydCBjb25kaXRpb24uXG4gIHdoaWxlIChzdWZmTGVuIDwgbCkge1xuICAgIGNvbnN0IGN1cnJDaGFyID0gc3RyLmNoYXJBdChsIC0gc3VmZkxlbiAtIDEpO1xuICAgIGlmIChjdXJyQ2hhciA9PT0gYyAmJiAhaW52ZXJ0KSB7XG4gICAgICBzdWZmTGVuKys7XG4gICAgfSBlbHNlIGlmIChjdXJyQ2hhciAhPT0gYyAmJiBpbnZlcnQpIHtcbiAgICAgIHN1ZmZMZW4rKztcbiAgICB9IGVsc2Uge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHN0ci5zbGljZSgwLCBsIC0gc3VmZkxlbik7XG59XG5cbmZ1bmN0aW9uIGZpbmRDbG9zaW5nQnJhY2tldChzdHIsIGIpIHtcbiAgaWYgKHN0ci5pbmRleE9mKGJbMV0pID09PSAtMSkge1xuICAgIHJldHVybiAtMTtcbiAgfVxuICBjb25zdCBsID0gc3RyLmxlbmd0aDtcbiAgbGV0IGxldmVsID0gMCxcbiAgICBpID0gMDtcbiAgZm9yICg7IGkgPCBsOyBpKyspIHtcbiAgICBpZiAoc3RyW2ldID09PSAnXFxcXCcpIHtcbiAgICAgIGkrKztcbiAgICB9IGVsc2UgaWYgKHN0cltpXSA9PT0gYlswXSkge1xuICAgICAgbGV2ZWwrKztcbiAgICB9IGVsc2UgaWYgKHN0cltpXSA9PT0gYlsxXSkge1xuICAgICAgbGV2ZWwtLTtcbiAgICAgIGlmIChsZXZlbCA8IDApIHtcbiAgICAgICAgcmV0dXJuIGk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiAtMTtcbn1cblxuZnVuY3Rpb24gY2hlY2tTYW5pdGl6ZURlcHJlY2F0aW9uKG9wdCkge1xuICBpZiAob3B0ICYmIG9wdC5zYW5pdGl6ZSAmJiAhb3B0LnNpbGVudCkge1xuICAgIGNvbnNvbGUud2FybignbWFya2VkKCk6IHNhbml0aXplIGFuZCBzYW5pdGl6ZXIgcGFyYW1ldGVycyBhcmUgZGVwcmVjYXRlZCBzaW5jZSB2ZXJzaW9uIDAuNy4wLCBzaG91bGQgbm90IGJlIHVzZWQgYW5kIHdpbGwgYmUgcmVtb3ZlZCBpbiB0aGUgZnV0dXJlLiBSZWFkIG1vcmUgaGVyZTogaHR0cHM6Ly9tYXJrZWQuanMub3JnLyMvVVNJTkdfQURWQU5DRUQubWQjb3B0aW9ucycpO1xuICB9XG59XG5cbi8vIGNvcGllZCBmcm9tIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vYS81NDUwMTEzLzgwNjc3N1xuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30gcGF0dGVyblxuICogQHBhcmFtIHtudW1iZXJ9IGNvdW50XG4gKi9cbmZ1bmN0aW9uIHJlcGVhdFN0cmluZyhwYXR0ZXJuLCBjb3VudCkge1xuICBpZiAoY291bnQgPCAxKSB7XG4gICAgcmV0dXJuICcnO1xuICB9XG4gIGxldCByZXN1bHQgPSAnJztcbiAgd2hpbGUgKGNvdW50ID4gMSkge1xuICAgIGlmIChjb3VudCAmIDEpIHtcbiAgICAgIHJlc3VsdCArPSBwYXR0ZXJuO1xuICAgIH1cbiAgICBjb3VudCA+Pj0gMTtcbiAgICBwYXR0ZXJuICs9IHBhdHRlcm47XG4gIH1cbiAgcmV0dXJuIHJlc3VsdCArIHBhdHRlcm47XG59XG5cbmZ1bmN0aW9uIG91dHB1dExpbmsoY2FwLCBsaW5rLCByYXcsIGxleGVyKSB7XG4gIGNvbnN0IGhyZWYgPSBsaW5rLmhyZWY7XG4gIGNvbnN0IHRpdGxlID0gbGluay50aXRsZSA/IGVzY2FwZShsaW5rLnRpdGxlKSA6IG51bGw7XG4gIGNvbnN0IHRleHQgPSBjYXBbMV0ucmVwbGFjZSgvXFxcXChbXFxbXFxdXSkvZywgJyQxJyk7XG5cbiAgaWYgKGNhcFswXS5jaGFyQXQoMCkgIT09ICchJykge1xuICAgIGxleGVyLnN0YXRlLmluTGluayA9IHRydWU7XG4gICAgY29uc3QgdG9rZW4gPSB7XG4gICAgICB0eXBlOiAnbGluaycsXG4gICAgICByYXcsXG4gICAgICBocmVmLFxuICAgICAgdGl0bGUsXG4gICAgICB0ZXh0LFxuICAgICAgdG9rZW5zOiBsZXhlci5pbmxpbmVUb2tlbnModGV4dClcbiAgICB9O1xuICAgIGxleGVyLnN0YXRlLmluTGluayA9IGZhbHNlO1xuICAgIHJldHVybiB0b2tlbjtcbiAgfVxuICByZXR1cm4ge1xuICAgIHR5cGU6ICdpbWFnZScsXG4gICAgcmF3LFxuICAgIGhyZWYsXG4gICAgdGl0bGUsXG4gICAgdGV4dDogZXNjYXBlKHRleHQpXG4gIH07XG59XG5cbmZ1bmN0aW9uIGluZGVudENvZGVDb21wZW5zYXRpb24ocmF3LCB0ZXh0KSB7XG4gIGNvbnN0IG1hdGNoSW5kZW50VG9Db2RlID0gcmF3Lm1hdGNoKC9eKFxccyspKD86YGBgKS8pO1xuXG4gIGlmIChtYXRjaEluZGVudFRvQ29kZSA9PT0gbnVsbCkge1xuICAgIHJldHVybiB0ZXh0O1xuICB9XG5cbiAgY29uc3QgaW5kZW50VG9Db2RlID0gbWF0Y2hJbmRlbnRUb0NvZGVbMV07XG5cbiAgcmV0dXJuIHRleHRcbiAgICAuc3BsaXQoJ1xcbicpXG4gICAgLm1hcChub2RlID0+IHtcbiAgICAgIGNvbnN0IG1hdGNoSW5kZW50SW5Ob2RlID0gbm9kZS5tYXRjaCgvXlxccysvKTtcbiAgICAgIGlmIChtYXRjaEluZGVudEluTm9kZSA9PT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gbm9kZTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgW2luZGVudEluTm9kZV0gPSBtYXRjaEluZGVudEluTm9kZTtcblxuICAgICAgaWYgKGluZGVudEluTm9kZS5sZW5ndGggPj0gaW5kZW50VG9Db2RlLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gbm9kZS5zbGljZShpbmRlbnRUb0NvZGUubGVuZ3RoKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG5vZGU7XG4gICAgfSlcbiAgICAuam9pbignXFxuJyk7XG59XG5cbi8qKlxuICogVG9rZW5pemVyXG4gKi9cbmNsYXNzIFRva2VuaXplciB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IGRlZmF1bHRzO1xuICB9XG5cbiAgc3BhY2Uoc3JjKSB7XG4gICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5ibG9jay5uZXdsaW5lLmV4ZWMoc3JjKTtcbiAgICBpZiAoY2FwICYmIGNhcFswXS5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAnc3BhY2UnLFxuICAgICAgICByYXc6IGNhcFswXVxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICBjb2RlKHNyYykge1xuICAgIGNvbnN0IGNhcCA9IHRoaXMucnVsZXMuYmxvY2suY29kZS5leGVjKHNyYyk7XG4gICAgaWYgKGNhcCkge1xuICAgICAgY29uc3QgdGV4dCA9IGNhcFswXS5yZXBsYWNlKC9eIHsxLDR9L2dtLCAnJyk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAnY29kZScsXG4gICAgICAgIHJhdzogY2FwWzBdLFxuICAgICAgICBjb2RlQmxvY2tTdHlsZTogJ2luZGVudGVkJyxcbiAgICAgICAgdGV4dDogIXRoaXMub3B0aW9ucy5wZWRhbnRpY1xuICAgICAgICAgID8gcnRyaW0odGV4dCwgJ1xcbicpXG4gICAgICAgICAgOiB0ZXh0XG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIGZlbmNlcyhzcmMpIHtcbiAgICBjb25zdCBjYXAgPSB0aGlzLnJ1bGVzLmJsb2NrLmZlbmNlcy5leGVjKHNyYyk7XG4gICAgaWYgKGNhcCkge1xuICAgICAgY29uc3QgcmF3ID0gY2FwWzBdO1xuICAgICAgY29uc3QgdGV4dCA9IGluZGVudENvZGVDb21wZW5zYXRpb24ocmF3LCBjYXBbM10gfHwgJycpO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAnY29kZScsXG4gICAgICAgIHJhdyxcbiAgICAgICAgbGFuZzogY2FwWzJdID8gY2FwWzJdLnRyaW0oKS5yZXBsYWNlKHRoaXMucnVsZXMuaW5saW5lLl9lc2NhcGVzLCAnJDEnKSA6IGNhcFsyXSxcbiAgICAgICAgdGV4dFxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICBoZWFkaW5nKHNyYykge1xuICAgIGNvbnN0IGNhcCA9IHRoaXMucnVsZXMuYmxvY2suaGVhZGluZy5leGVjKHNyYyk7XG4gICAgaWYgKGNhcCkge1xuICAgICAgbGV0IHRleHQgPSBjYXBbMl0udHJpbSgpO1xuXG4gICAgICAvLyByZW1vdmUgdHJhaWxpbmcgI3NcbiAgICAgIGlmICgvIyQvLnRlc3QodGV4dCkpIHtcbiAgICAgICAgY29uc3QgdHJpbW1lZCA9IHJ0cmltKHRleHQsICcjJyk7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMucGVkYW50aWMpIHtcbiAgICAgICAgICB0ZXh0ID0gdHJpbW1lZC50cmltKCk7XG4gICAgICAgIH0gZWxzZSBpZiAoIXRyaW1tZWQgfHwgLyAkLy50ZXN0KHRyaW1tZWQpKSB7XG4gICAgICAgICAgLy8gQ29tbW9uTWFyayByZXF1aXJlcyBzcGFjZSBiZWZvcmUgdHJhaWxpbmcgI3NcbiAgICAgICAgICB0ZXh0ID0gdHJpbW1lZC50cmltKCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ2hlYWRpbmcnLFxuICAgICAgICByYXc6IGNhcFswXSxcbiAgICAgICAgZGVwdGg6IGNhcFsxXS5sZW5ndGgsXG4gICAgICAgIHRleHQsXG4gICAgICAgIHRva2VuczogdGhpcy5sZXhlci5pbmxpbmUodGV4dClcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgaHIoc3JjKSB7XG4gICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5ibG9jay5oci5leGVjKHNyYyk7XG4gICAgaWYgKGNhcCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ2hyJyxcbiAgICAgICAgcmF3OiBjYXBbMF1cbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgYmxvY2txdW90ZShzcmMpIHtcbiAgICBjb25zdCBjYXAgPSB0aGlzLnJ1bGVzLmJsb2NrLmJsb2NrcXVvdGUuZXhlYyhzcmMpO1xuICAgIGlmIChjYXApIHtcbiAgICAgIGNvbnN0IHRleHQgPSBjYXBbMF0ucmVwbGFjZSgvXiAqPlsgXFx0XT8vZ20sICcnKTtcbiAgICAgIGNvbnN0IHRvcCA9IHRoaXMubGV4ZXIuc3RhdGUudG9wO1xuICAgICAgdGhpcy5sZXhlci5zdGF0ZS50b3AgPSB0cnVlO1xuICAgICAgY29uc3QgdG9rZW5zID0gdGhpcy5sZXhlci5ibG9ja1Rva2Vucyh0ZXh0KTtcbiAgICAgIHRoaXMubGV4ZXIuc3RhdGUudG9wID0gdG9wO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ2Jsb2NrcXVvdGUnLFxuICAgICAgICByYXc6IGNhcFswXSxcbiAgICAgICAgdG9rZW5zLFxuICAgICAgICB0ZXh0XG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIGxpc3Qoc3JjKSB7XG4gICAgbGV0IGNhcCA9IHRoaXMucnVsZXMuYmxvY2subGlzdC5leGVjKHNyYyk7XG4gICAgaWYgKGNhcCkge1xuICAgICAgbGV0IHJhdywgaXN0YXNrLCBpc2NoZWNrZWQsIGluZGVudCwgaSwgYmxhbmtMaW5lLCBlbmRzV2l0aEJsYW5rTGluZSxcbiAgICAgICAgbGluZSwgbmV4dExpbmUsIHJhd0xpbmUsIGl0ZW1Db250ZW50cywgZW5kRWFybHk7XG5cbiAgICAgIGxldCBidWxsID0gY2FwWzFdLnRyaW0oKTtcbiAgICAgIGNvbnN0IGlzb3JkZXJlZCA9IGJ1bGwubGVuZ3RoID4gMTtcblxuICAgICAgY29uc3QgbGlzdCA9IHtcbiAgICAgICAgdHlwZTogJ2xpc3QnLFxuICAgICAgICByYXc6ICcnLFxuICAgICAgICBvcmRlcmVkOiBpc29yZGVyZWQsXG4gICAgICAgIHN0YXJ0OiBpc29yZGVyZWQgPyArYnVsbC5zbGljZSgwLCAtMSkgOiAnJyxcbiAgICAgICAgbG9vc2U6IGZhbHNlLFxuICAgICAgICBpdGVtczogW11cbiAgICAgIH07XG5cbiAgICAgIGJ1bGwgPSBpc29yZGVyZWQgPyBgXFxcXGR7MSw5fVxcXFwke2J1bGwuc2xpY2UoLTEpfWAgOiBgXFxcXCR7YnVsbH1gO1xuXG4gICAgICBpZiAodGhpcy5vcHRpb25zLnBlZGFudGljKSB7XG4gICAgICAgIGJ1bGwgPSBpc29yZGVyZWQgPyBidWxsIDogJ1sqKy1dJztcbiAgICAgIH1cblxuICAgICAgLy8gR2V0IG5leHQgbGlzdCBpdGVtXG4gICAgICBjb25zdCBpdGVtUmVnZXggPSBuZXcgUmVnRXhwKGBeKCB7MCwzfSR7YnVsbH0pKCg/OltcXHQgXVteXFxcXG5dKik/KD86XFxcXG58JCkpYCk7XG5cbiAgICAgIC8vIENoZWNrIGlmIGN1cnJlbnQgYnVsbGV0IHBvaW50IGNhbiBzdGFydCBhIG5ldyBMaXN0IEl0ZW1cbiAgICAgIHdoaWxlIChzcmMpIHtcbiAgICAgICAgZW5kRWFybHkgPSBmYWxzZTtcbiAgICAgICAgaWYgKCEoY2FwID0gaXRlbVJlZ2V4LmV4ZWMoc3JjKSkpIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnJ1bGVzLmJsb2NrLmhyLnRlc3Qoc3JjKSkgeyAvLyBFbmQgbGlzdCBpZiBidWxsZXQgd2FzIGFjdHVhbGx5IEhSIChwb3NzaWJseSBtb3ZlIGludG8gaXRlbVJlZ2V4PylcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIHJhdyA9IGNhcFswXTtcbiAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhyYXcubGVuZ3RoKTtcblxuICAgICAgICBsaW5lID0gY2FwWzJdLnNwbGl0KCdcXG4nLCAxKVswXS5yZXBsYWNlKC9eXFx0Ky8sICh0KSA9PiAnICcucmVwZWF0KDMgKiB0Lmxlbmd0aCkpO1xuICAgICAgICBuZXh0TGluZSA9IHNyYy5zcGxpdCgnXFxuJywgMSlbMF07XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5wZWRhbnRpYykge1xuICAgICAgICAgIGluZGVudCA9IDI7XG4gICAgICAgICAgaXRlbUNvbnRlbnRzID0gbGluZS50cmltTGVmdCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGluZGVudCA9IGNhcFsyXS5zZWFyY2goL1teIF0vKTsgLy8gRmluZCBmaXJzdCBub24tc3BhY2UgY2hhclxuICAgICAgICAgIGluZGVudCA9IGluZGVudCA+IDQgPyAxIDogaW5kZW50OyAvLyBUcmVhdCBpbmRlbnRlZCBjb2RlIGJsb2NrcyAoPiA0IHNwYWNlcykgYXMgaGF2aW5nIG9ubHkgMSBpbmRlbnRcbiAgICAgICAgICBpdGVtQ29udGVudHMgPSBsaW5lLnNsaWNlKGluZGVudCk7XG4gICAgICAgICAgaW5kZW50ICs9IGNhcFsxXS5sZW5ndGg7XG4gICAgICAgIH1cblxuICAgICAgICBibGFua0xpbmUgPSBmYWxzZTtcblxuICAgICAgICBpZiAoIWxpbmUgJiYgL14gKiQvLnRlc3QobmV4dExpbmUpKSB7IC8vIEl0ZW1zIGJlZ2luIHdpdGggYXQgbW9zdCBvbmUgYmxhbmsgbGluZVxuICAgICAgICAgIHJhdyArPSBuZXh0TGluZSArICdcXG4nO1xuICAgICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcobmV4dExpbmUubGVuZ3RoICsgMSk7XG4gICAgICAgICAgZW5kRWFybHkgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFlbmRFYXJseSkge1xuICAgICAgICAgIGNvbnN0IG5leHRCdWxsZXRSZWdleCA9IG5ldyBSZWdFeHAoYF4gezAsJHtNYXRoLm1pbigzLCBpbmRlbnQgLSAxKX19KD86WyorLV18XFxcXGR7MSw5fVsuKV0pKCg/OlsgXFx0XVteXFxcXG5dKik/KD86XFxcXG58JCkpYCk7XG4gICAgICAgICAgY29uc3QgaHJSZWdleCA9IG5ldyBSZWdFeHAoYF4gezAsJHtNYXRoLm1pbigzLCBpbmRlbnQgLSAxKX19KCg/Oi0gKil7Myx9fCg/Ol8gKil7Myx9fCg/OlxcXFwqICopezMsfSkoPzpcXFxcbit8JClgKTtcbiAgICAgICAgICBjb25zdCBmZW5jZXNCZWdpblJlZ2V4ID0gbmV3IFJlZ0V4cChgXiB7MCwke01hdGgubWluKDMsIGluZGVudCAtIDEpfX0oPzpcXGBcXGBcXGB8fn5+KWApO1xuICAgICAgICAgIGNvbnN0IGhlYWRpbmdCZWdpblJlZ2V4ID0gbmV3IFJlZ0V4cChgXiB7MCwke01hdGgubWluKDMsIGluZGVudCAtIDEpfX0jYCk7XG5cbiAgICAgICAgICAvLyBDaGVjayBpZiBmb2xsb3dpbmcgbGluZXMgc2hvdWxkIGJlIGluY2x1ZGVkIGluIExpc3QgSXRlbVxuICAgICAgICAgIHdoaWxlIChzcmMpIHtcbiAgICAgICAgICAgIHJhd0xpbmUgPSBzcmMuc3BsaXQoJ1xcbicsIDEpWzBdO1xuICAgICAgICAgICAgbmV4dExpbmUgPSByYXdMaW5lO1xuXG4gICAgICAgICAgICAvLyBSZS1hbGlnbiB0byBmb2xsb3cgY29tbW9ubWFyayBuZXN0aW5nIHJ1bGVzXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnBlZGFudGljKSB7XG4gICAgICAgICAgICAgIG5leHRMaW5lID0gbmV4dExpbmUucmVwbGFjZSgvXiB7MSw0fSg/PSggezR9KSpbXiBdKS9nLCAnICAnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gRW5kIGxpc3QgaXRlbSBpZiBmb3VuZCBjb2RlIGZlbmNlc1xuICAgICAgICAgICAgaWYgKGZlbmNlc0JlZ2luUmVnZXgudGVzdChuZXh0TGluZSkpIHtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEVuZCBsaXN0IGl0ZW0gaWYgZm91bmQgc3RhcnQgb2YgbmV3IGhlYWRpbmdcbiAgICAgICAgICAgIGlmIChoZWFkaW5nQmVnaW5SZWdleC50ZXN0KG5leHRMaW5lKSkge1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gRW5kIGxpc3QgaXRlbSBpZiBmb3VuZCBzdGFydCBvZiBuZXcgYnVsbGV0XG4gICAgICAgICAgICBpZiAobmV4dEJ1bGxldFJlZ2V4LnRlc3QobmV4dExpbmUpKSB7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBIb3Jpem9udGFsIHJ1bGUgZm91bmRcbiAgICAgICAgICAgIGlmIChoclJlZ2V4LnRlc3Qoc3JjKSkge1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG5leHRMaW5lLnNlYXJjaCgvW14gXS8pID49IGluZGVudCB8fCAhbmV4dExpbmUudHJpbSgpKSB7IC8vIERlZGVudCBpZiBwb3NzaWJsZVxuICAgICAgICAgICAgICBpdGVtQ29udGVudHMgKz0gJ1xcbicgKyBuZXh0TGluZS5zbGljZShpbmRlbnQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gbm90IGVub3VnaCBpbmRlbnRhdGlvblxuICAgICAgICAgICAgICBpZiAoYmxhbmtMaW5lKSB7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAvLyBwYXJhZ3JhcGggY29udGludWF0aW9uIHVubGVzcyBsYXN0IGxpbmUgd2FzIGEgZGlmZmVyZW50IGJsb2NrIGxldmVsIGVsZW1lbnRcbiAgICAgICAgICAgICAgaWYgKGxpbmUuc2VhcmNoKC9bXiBdLykgPj0gNCkgeyAvLyBpbmRlbnRlZCBjb2RlIGJsb2NrXG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWYgKGZlbmNlc0JlZ2luUmVnZXgudGVzdChsaW5lKSkge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmIChoZWFkaW5nQmVnaW5SZWdleC50ZXN0KGxpbmUpKSB7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWYgKGhyUmVnZXgudGVzdChsaW5lKSkge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgaXRlbUNvbnRlbnRzICs9ICdcXG4nICsgbmV4dExpbmU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghYmxhbmtMaW5lICYmICFuZXh0TGluZS50cmltKCkpIHsgLy8gQ2hlY2sgaWYgY3VycmVudCBsaW5lIGlzIGJsYW5rXG4gICAgICAgICAgICAgIGJsYW5rTGluZSA9IHRydWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJhdyArPSByYXdMaW5lICsgJ1xcbic7XG4gICAgICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHJhd0xpbmUubGVuZ3RoICsgMSk7XG4gICAgICAgICAgICBsaW5lID0gbmV4dExpbmUuc2xpY2UoaW5kZW50KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWxpc3QubG9vc2UpIHtcbiAgICAgICAgICAvLyBJZiB0aGUgcHJldmlvdXMgaXRlbSBlbmRlZCB3aXRoIGEgYmxhbmsgbGluZSwgdGhlIGxpc3QgaXMgbG9vc2VcbiAgICAgICAgICBpZiAoZW5kc1dpdGhCbGFua0xpbmUpIHtcbiAgICAgICAgICAgIGxpc3QubG9vc2UgPSB0cnVlO1xuICAgICAgICAgIH0gZWxzZSBpZiAoL1xcbiAqXFxuICokLy50ZXN0KHJhdykpIHtcbiAgICAgICAgICAgIGVuZHNXaXRoQmxhbmtMaW5lID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDaGVjayBmb3IgdGFzayBsaXN0IGl0ZW1zXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuZ2ZtKSB7XG4gICAgICAgICAgaXN0YXNrID0gL15cXFtbIHhYXVxcXSAvLmV4ZWMoaXRlbUNvbnRlbnRzKTtcbiAgICAgICAgICBpZiAoaXN0YXNrKSB7XG4gICAgICAgICAgICBpc2NoZWNrZWQgPSBpc3Rhc2tbMF0gIT09ICdbIF0gJztcbiAgICAgICAgICAgIGl0ZW1Db250ZW50cyA9IGl0ZW1Db250ZW50cy5yZXBsYWNlKC9eXFxbWyB4WF1cXF0gKy8sICcnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBsaXN0Lml0ZW1zLnB1c2goe1xuICAgICAgICAgIHR5cGU6ICdsaXN0X2l0ZW0nLFxuICAgICAgICAgIHJhdyxcbiAgICAgICAgICB0YXNrOiAhIWlzdGFzayxcbiAgICAgICAgICBjaGVja2VkOiBpc2NoZWNrZWQsXG4gICAgICAgICAgbG9vc2U6IGZhbHNlLFxuICAgICAgICAgIHRleHQ6IGl0ZW1Db250ZW50c1xuICAgICAgICB9KTtcblxuICAgICAgICBsaXN0LnJhdyArPSByYXc7XG4gICAgICB9XG5cbiAgICAgIC8vIERvIG5vdCBjb25zdW1lIG5ld2xpbmVzIGF0IGVuZCBvZiBmaW5hbCBpdGVtLiBBbHRlcm5hdGl2ZWx5LCBtYWtlIGl0ZW1SZWdleCAqc3RhcnQqIHdpdGggYW55IG5ld2xpbmVzIHRvIHNpbXBsaWZ5L3NwZWVkIHVwIGVuZHNXaXRoQmxhbmtMaW5lIGxvZ2ljXG4gICAgICBsaXN0Lml0ZW1zW2xpc3QuaXRlbXMubGVuZ3RoIC0gMV0ucmF3ID0gcmF3LnRyaW1SaWdodCgpO1xuICAgICAgbGlzdC5pdGVtc1tsaXN0Lml0ZW1zLmxlbmd0aCAtIDFdLnRleHQgPSBpdGVtQ29udGVudHMudHJpbVJpZ2h0KCk7XG4gICAgICBsaXN0LnJhdyA9IGxpc3QucmF3LnRyaW1SaWdodCgpO1xuXG4gICAgICBjb25zdCBsID0gbGlzdC5pdGVtcy5sZW5ndGg7XG5cbiAgICAgIC8vIEl0ZW0gY2hpbGQgdG9rZW5zIGhhbmRsZWQgaGVyZSBhdCBlbmQgYmVjYXVzZSB3ZSBuZWVkZWQgdG8gaGF2ZSB0aGUgZmluYWwgaXRlbSB0byB0cmltIGl0IGZpcnN0XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIHRoaXMubGV4ZXIuc3RhdGUudG9wID0gZmFsc2U7XG4gICAgICAgIGxpc3QuaXRlbXNbaV0udG9rZW5zID0gdGhpcy5sZXhlci5ibG9ja1Rva2VucyhsaXN0Lml0ZW1zW2ldLnRleHQsIFtdKTtcblxuICAgICAgICBpZiAoIWxpc3QubG9vc2UpIHtcbiAgICAgICAgICAvLyBDaGVjayBpZiBsaXN0IHNob3VsZCBiZSBsb29zZVxuICAgICAgICAgIGNvbnN0IHNwYWNlcnMgPSBsaXN0Lml0ZW1zW2ldLnRva2Vucy5maWx0ZXIodCA9PiB0LnR5cGUgPT09ICdzcGFjZScpO1xuICAgICAgICAgIGNvbnN0IGhhc011bHRpcGxlTGluZUJyZWFrcyA9IHNwYWNlcnMubGVuZ3RoID4gMCAmJiBzcGFjZXJzLnNvbWUodCA9PiAvXFxuLipcXG4vLnRlc3QodC5yYXcpKTtcblxuICAgICAgICAgIGxpc3QubG9vc2UgPSBoYXNNdWx0aXBsZUxpbmVCcmVha3M7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gU2V0IGFsbCBpdGVtcyB0byBsb29zZSBpZiBsaXN0IGlzIGxvb3NlXG4gICAgICBpZiAobGlzdC5sb29zZSkge1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgbGlzdC5pdGVtc1tpXS5sb29zZSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGxpc3Q7XG4gICAgfVxuICB9XG5cbiAgaHRtbChzcmMpIHtcbiAgICBjb25zdCBjYXAgPSB0aGlzLnJ1bGVzLmJsb2NrLmh0bWwuZXhlYyhzcmMpO1xuICAgIGlmIChjYXApIHtcbiAgICAgIGNvbnN0IHRva2VuID0ge1xuICAgICAgICB0eXBlOiAnaHRtbCcsXG4gICAgICAgIHJhdzogY2FwWzBdLFxuICAgICAgICBwcmU6ICF0aGlzLm9wdGlvbnMuc2FuaXRpemVyXG4gICAgICAgICAgJiYgKGNhcFsxXSA9PT0gJ3ByZScgfHwgY2FwWzFdID09PSAnc2NyaXB0JyB8fCBjYXBbMV0gPT09ICdzdHlsZScpLFxuICAgICAgICB0ZXh0OiBjYXBbMF1cbiAgICAgIH07XG4gICAgICBpZiAodGhpcy5vcHRpb25zLnNhbml0aXplKSB7XG4gICAgICAgIGNvbnN0IHRleHQgPSB0aGlzLm9wdGlvbnMuc2FuaXRpemVyID8gdGhpcy5vcHRpb25zLnNhbml0aXplcihjYXBbMF0pIDogZXNjYXBlKGNhcFswXSk7XG4gICAgICAgIHRva2VuLnR5cGUgPSAncGFyYWdyYXBoJztcbiAgICAgICAgdG9rZW4udGV4dCA9IHRleHQ7XG4gICAgICAgIHRva2VuLnRva2VucyA9IHRoaXMubGV4ZXIuaW5saW5lKHRleHQpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRva2VuO1xuICAgIH1cbiAgfVxuXG4gIGRlZihzcmMpIHtcbiAgICBjb25zdCBjYXAgPSB0aGlzLnJ1bGVzLmJsb2NrLmRlZi5leGVjKHNyYyk7XG4gICAgaWYgKGNhcCkge1xuICAgICAgY29uc3QgdGFnID0gY2FwWzFdLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvXFxzKy9nLCAnICcpO1xuICAgICAgY29uc3QgaHJlZiA9IGNhcFsyXSA/IGNhcFsyXS5yZXBsYWNlKC9ePCguKik+JC8sICckMScpLnJlcGxhY2UodGhpcy5ydWxlcy5pbmxpbmUuX2VzY2FwZXMsICckMScpIDogJyc7XG4gICAgICBjb25zdCB0aXRsZSA9IGNhcFszXSA/IGNhcFszXS5zdWJzdHJpbmcoMSwgY2FwWzNdLmxlbmd0aCAtIDEpLnJlcGxhY2UodGhpcy5ydWxlcy5pbmxpbmUuX2VzY2FwZXMsICckMScpIDogY2FwWzNdO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ2RlZicsXG4gICAgICAgIHRhZyxcbiAgICAgICAgcmF3OiBjYXBbMF0sXG4gICAgICAgIGhyZWYsXG4gICAgICAgIHRpdGxlXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIHRhYmxlKHNyYykge1xuICAgIGNvbnN0IGNhcCA9IHRoaXMucnVsZXMuYmxvY2sudGFibGUuZXhlYyhzcmMpO1xuICAgIGlmIChjYXApIHtcbiAgICAgIGNvbnN0IGl0ZW0gPSB7XG4gICAgICAgIHR5cGU6ICd0YWJsZScsXG4gICAgICAgIGhlYWRlcjogc3BsaXRDZWxscyhjYXBbMV0pLm1hcChjID0+IHsgcmV0dXJuIHsgdGV4dDogYyB9OyB9KSxcbiAgICAgICAgYWxpZ246IGNhcFsyXS5yZXBsYWNlKC9eICp8XFx8ICokL2csICcnKS5zcGxpdCgvICpcXHwgKi8pLFxuICAgICAgICByb3dzOiBjYXBbM10gJiYgY2FwWzNdLnRyaW0oKSA/IGNhcFszXS5yZXBsYWNlKC9cXG5bIFxcdF0qJC8sICcnKS5zcGxpdCgnXFxuJykgOiBbXVxuICAgICAgfTtcblxuICAgICAgaWYgKGl0ZW0uaGVhZGVyLmxlbmd0aCA9PT0gaXRlbS5hbGlnbi5sZW5ndGgpIHtcbiAgICAgICAgaXRlbS5yYXcgPSBjYXBbMF07XG5cbiAgICAgICAgbGV0IGwgPSBpdGVtLmFsaWduLmxlbmd0aDtcbiAgICAgICAgbGV0IGksIGosIGssIHJvdztcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgIGlmICgvXiAqLSs6ICokLy50ZXN0KGl0ZW0uYWxpZ25baV0pKSB7XG4gICAgICAgICAgICBpdGVtLmFsaWduW2ldID0gJ3JpZ2h0JztcbiAgICAgICAgICB9IGVsc2UgaWYgKC9eICo6LSs6ICokLy50ZXN0KGl0ZW0uYWxpZ25baV0pKSB7XG4gICAgICAgICAgICBpdGVtLmFsaWduW2ldID0gJ2NlbnRlcic7XG4gICAgICAgICAgfSBlbHNlIGlmICgvXiAqOi0rICokLy50ZXN0KGl0ZW0uYWxpZ25baV0pKSB7XG4gICAgICAgICAgICBpdGVtLmFsaWduW2ldID0gJ2xlZnQnO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpdGVtLmFsaWduW2ldID0gbnVsbDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBsID0gaXRlbS5yb3dzLmxlbmd0aDtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgIGl0ZW0ucm93c1tpXSA9IHNwbGl0Q2VsbHMoaXRlbS5yb3dzW2ldLCBpdGVtLmhlYWRlci5sZW5ndGgpLm1hcChjID0+IHsgcmV0dXJuIHsgdGV4dDogYyB9OyB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHBhcnNlIGNoaWxkIHRva2VucyBpbnNpZGUgaGVhZGVycyBhbmQgY2VsbHNcblxuICAgICAgICAvLyBoZWFkZXIgY2hpbGQgdG9rZW5zXG4gICAgICAgIGwgPSBpdGVtLmhlYWRlci5sZW5ndGg7XG4gICAgICAgIGZvciAoaiA9IDA7IGogPCBsOyBqKyspIHtcbiAgICAgICAgICBpdGVtLmhlYWRlcltqXS50b2tlbnMgPSB0aGlzLmxleGVyLmlubGluZShpdGVtLmhlYWRlcltqXS50ZXh0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGNlbGwgY2hpbGQgdG9rZW5zXG4gICAgICAgIGwgPSBpdGVtLnJvd3MubGVuZ3RoO1xuICAgICAgICBmb3IgKGogPSAwOyBqIDwgbDsgaisrKSB7XG4gICAgICAgICAgcm93ID0gaXRlbS5yb3dzW2pdO1xuICAgICAgICAgIGZvciAoayA9IDA7IGsgPCByb3cubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgICAgIHJvd1trXS50b2tlbnMgPSB0aGlzLmxleGVyLmlubGluZShyb3dba10udGV4dCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgbGhlYWRpbmcoc3JjKSB7XG4gICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5ibG9jay5saGVhZGluZy5leGVjKHNyYyk7XG4gICAgaWYgKGNhcCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ2hlYWRpbmcnLFxuICAgICAgICByYXc6IGNhcFswXSxcbiAgICAgICAgZGVwdGg6IGNhcFsyXS5jaGFyQXQoMCkgPT09ICc9JyA/IDEgOiAyLFxuICAgICAgICB0ZXh0OiBjYXBbMV0sXG4gICAgICAgIHRva2VuczogdGhpcy5sZXhlci5pbmxpbmUoY2FwWzFdKVxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICBwYXJhZ3JhcGgoc3JjKSB7XG4gICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5ibG9jay5wYXJhZ3JhcGguZXhlYyhzcmMpO1xuICAgIGlmIChjYXApIHtcbiAgICAgIGNvbnN0IHRleHQgPSBjYXBbMV0uY2hhckF0KGNhcFsxXS5sZW5ndGggLSAxKSA9PT0gJ1xcbidcbiAgICAgICAgPyBjYXBbMV0uc2xpY2UoMCwgLTEpXG4gICAgICAgIDogY2FwWzFdO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ3BhcmFncmFwaCcsXG4gICAgICAgIHJhdzogY2FwWzBdLFxuICAgICAgICB0ZXh0LFxuICAgICAgICB0b2tlbnM6IHRoaXMubGV4ZXIuaW5saW5lKHRleHQpXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIHRleHQoc3JjKSB7XG4gICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5ibG9jay50ZXh0LmV4ZWMoc3JjKTtcbiAgICBpZiAoY2FwKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAndGV4dCcsXG4gICAgICAgIHJhdzogY2FwWzBdLFxuICAgICAgICB0ZXh0OiBjYXBbMF0sXG4gICAgICAgIHRva2VuczogdGhpcy5sZXhlci5pbmxpbmUoY2FwWzBdKVxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICBlc2NhcGUoc3JjKSB7XG4gICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5pbmxpbmUuZXNjYXBlLmV4ZWMoc3JjKTtcbiAgICBpZiAoY2FwKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAnZXNjYXBlJyxcbiAgICAgICAgcmF3OiBjYXBbMF0sXG4gICAgICAgIHRleHQ6IGVzY2FwZShjYXBbMV0pXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIHRhZyhzcmMpIHtcbiAgICBjb25zdCBjYXAgPSB0aGlzLnJ1bGVzLmlubGluZS50YWcuZXhlYyhzcmMpO1xuICAgIGlmIChjYXApIHtcbiAgICAgIGlmICghdGhpcy5sZXhlci5zdGF0ZS5pbkxpbmsgJiYgL148YSAvaS50ZXN0KGNhcFswXSkpIHtcbiAgICAgICAgdGhpcy5sZXhlci5zdGF0ZS5pbkxpbmsgPSB0cnVlO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLmxleGVyLnN0YXRlLmluTGluayAmJiAvXjxcXC9hPi9pLnRlc3QoY2FwWzBdKSkge1xuICAgICAgICB0aGlzLmxleGVyLnN0YXRlLmluTGluayA9IGZhbHNlO1xuICAgICAgfVxuICAgICAgaWYgKCF0aGlzLmxleGVyLnN0YXRlLmluUmF3QmxvY2sgJiYgL148KHByZXxjb2RlfGtiZHxzY3JpcHQpKFxcc3w+KS9pLnRlc3QoY2FwWzBdKSkge1xuICAgICAgICB0aGlzLmxleGVyLnN0YXRlLmluUmF3QmxvY2sgPSB0cnVlO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLmxleGVyLnN0YXRlLmluUmF3QmxvY2sgJiYgL148XFwvKHByZXxjb2RlfGtiZHxzY3JpcHQpKFxcc3w+KS9pLnRlc3QoY2FwWzBdKSkge1xuICAgICAgICB0aGlzLmxleGVyLnN0YXRlLmluUmF3QmxvY2sgPSBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogdGhpcy5vcHRpb25zLnNhbml0aXplXG4gICAgICAgICAgPyAndGV4dCdcbiAgICAgICAgICA6ICdodG1sJyxcbiAgICAgICAgcmF3OiBjYXBbMF0sXG4gICAgICAgIGluTGluazogdGhpcy5sZXhlci5zdGF0ZS5pbkxpbmssXG4gICAgICAgIGluUmF3QmxvY2s6IHRoaXMubGV4ZXIuc3RhdGUuaW5SYXdCbG9jayxcbiAgICAgICAgdGV4dDogdGhpcy5vcHRpb25zLnNhbml0aXplXG4gICAgICAgICAgPyAodGhpcy5vcHRpb25zLnNhbml0aXplclxuICAgICAgICAgICAgPyB0aGlzLm9wdGlvbnMuc2FuaXRpemVyKGNhcFswXSlcbiAgICAgICAgICAgIDogZXNjYXBlKGNhcFswXSkpXG4gICAgICAgICAgOiBjYXBbMF1cbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgbGluayhzcmMpIHtcbiAgICBjb25zdCBjYXAgPSB0aGlzLnJ1bGVzLmlubGluZS5saW5rLmV4ZWMoc3JjKTtcbiAgICBpZiAoY2FwKSB7XG4gICAgICBjb25zdCB0cmltbWVkVXJsID0gY2FwWzJdLnRyaW0oKTtcbiAgICAgIGlmICghdGhpcy5vcHRpb25zLnBlZGFudGljICYmIC9ePC8udGVzdCh0cmltbWVkVXJsKSkge1xuICAgICAgICAvLyBjb21tb25tYXJrIHJlcXVpcmVzIG1hdGNoaW5nIGFuZ2xlIGJyYWNrZXRzXG4gICAgICAgIGlmICghKC8+JC8udGVzdCh0cmltbWVkVXJsKSkpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBlbmRpbmcgYW5nbGUgYnJhY2tldCBjYW5ub3QgYmUgZXNjYXBlZFxuICAgICAgICBjb25zdCBydHJpbVNsYXNoID0gcnRyaW0odHJpbW1lZFVybC5zbGljZSgwLCAtMSksICdcXFxcJyk7XG4gICAgICAgIGlmICgodHJpbW1lZFVybC5sZW5ndGggLSBydHJpbVNsYXNoLmxlbmd0aCkgJSAyID09PSAwKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBmaW5kIGNsb3NpbmcgcGFyZW50aGVzaXNcbiAgICAgICAgY29uc3QgbGFzdFBhcmVuSW5kZXggPSBmaW5kQ2xvc2luZ0JyYWNrZXQoY2FwWzJdLCAnKCknKTtcbiAgICAgICAgaWYgKGxhc3RQYXJlbkluZGV4ID4gLTEpIHtcbiAgICAgICAgICBjb25zdCBzdGFydCA9IGNhcFswXS5pbmRleE9mKCchJykgPT09IDAgPyA1IDogNDtcbiAgICAgICAgICBjb25zdCBsaW5rTGVuID0gc3RhcnQgKyBjYXBbMV0ubGVuZ3RoICsgbGFzdFBhcmVuSW5kZXg7XG4gICAgICAgICAgY2FwWzJdID0gY2FwWzJdLnN1YnN0cmluZygwLCBsYXN0UGFyZW5JbmRleCk7XG4gICAgICAgICAgY2FwWzBdID0gY2FwWzBdLnN1YnN0cmluZygwLCBsaW5rTGVuKS50cmltKCk7XG4gICAgICAgICAgY2FwWzNdID0gJyc7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGxldCBocmVmID0gY2FwWzJdO1xuICAgICAgbGV0IHRpdGxlID0gJyc7XG4gICAgICBpZiAodGhpcy5vcHRpb25zLnBlZGFudGljKSB7XG4gICAgICAgIC8vIHNwbGl0IHBlZGFudGljIGhyZWYgYW5kIHRpdGxlXG4gICAgICAgIGNvbnN0IGxpbmsgPSAvXihbXidcIl0qW15cXHNdKVxccysoWydcIl0pKC4qKVxcMi8uZXhlYyhocmVmKTtcblxuICAgICAgICBpZiAobGluaykge1xuICAgICAgICAgIGhyZWYgPSBsaW5rWzFdO1xuICAgICAgICAgIHRpdGxlID0gbGlua1szXTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGl0bGUgPSBjYXBbM10gPyBjYXBbM10uc2xpY2UoMSwgLTEpIDogJyc7XG4gICAgICB9XG5cbiAgICAgIGhyZWYgPSBocmVmLnRyaW0oKTtcbiAgICAgIGlmICgvXjwvLnRlc3QoaHJlZikpIHtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5wZWRhbnRpYyAmJiAhKC8+JC8udGVzdCh0cmltbWVkVXJsKSkpIHtcbiAgICAgICAgICAvLyBwZWRhbnRpYyBhbGxvd3Mgc3RhcnRpbmcgYW5nbGUgYnJhY2tldCB3aXRob3V0IGVuZGluZyBhbmdsZSBicmFja2V0XG4gICAgICAgICAgaHJlZiA9IGhyZWYuc2xpY2UoMSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaHJlZiA9IGhyZWYuc2xpY2UoMSwgLTEpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gb3V0cHV0TGluayhjYXAsIHtcbiAgICAgICAgaHJlZjogaHJlZiA/IGhyZWYucmVwbGFjZSh0aGlzLnJ1bGVzLmlubGluZS5fZXNjYXBlcywgJyQxJykgOiBocmVmLFxuICAgICAgICB0aXRsZTogdGl0bGUgPyB0aXRsZS5yZXBsYWNlKHRoaXMucnVsZXMuaW5saW5lLl9lc2NhcGVzLCAnJDEnKSA6IHRpdGxlXG4gICAgICB9LCBjYXBbMF0sIHRoaXMubGV4ZXIpO1xuICAgIH1cbiAgfVxuXG4gIHJlZmxpbmsoc3JjLCBsaW5rcykge1xuICAgIGxldCBjYXA7XG4gICAgaWYgKChjYXAgPSB0aGlzLnJ1bGVzLmlubGluZS5yZWZsaW5rLmV4ZWMoc3JjKSlcbiAgICAgICAgfHwgKGNhcCA9IHRoaXMucnVsZXMuaW5saW5lLm5vbGluay5leGVjKHNyYykpKSB7XG4gICAgICBsZXQgbGluayA9IChjYXBbMl0gfHwgY2FwWzFdKS5yZXBsYWNlKC9cXHMrL2csICcgJyk7XG4gICAgICBsaW5rID0gbGlua3NbbGluay50b0xvd2VyQ2FzZSgpXTtcbiAgICAgIGlmICghbGluaykge1xuICAgICAgICBjb25zdCB0ZXh0ID0gY2FwWzBdLmNoYXJBdCgwKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB0eXBlOiAndGV4dCcsXG4gICAgICAgICAgcmF3OiB0ZXh0LFxuICAgICAgICAgIHRleHRcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBvdXRwdXRMaW5rKGNhcCwgbGluaywgY2FwWzBdLCB0aGlzLmxleGVyKTtcbiAgICB9XG4gIH1cblxuICBlbVN0cm9uZyhzcmMsIG1hc2tlZFNyYywgcHJldkNoYXIgPSAnJykge1xuICAgIGxldCBtYXRjaCA9IHRoaXMucnVsZXMuaW5saW5lLmVtU3Ryb25nLmxEZWxpbS5leGVjKHNyYyk7XG4gICAgaWYgKCFtYXRjaCkgcmV0dXJuO1xuXG4gICAgLy8gXyBjYW4ndCBiZSBiZXR3ZWVuIHR3byBhbHBoYW51bWVyaWNzLiBcXHB7TH1cXHB7Tn0gaW5jbHVkZXMgbm9uLWVuZ2xpc2ggYWxwaGFiZXQvbnVtYmVycyBhcyB3ZWxsXG4gICAgaWYgKG1hdGNoWzNdICYmIHByZXZDaGFyLm1hdGNoKC9bXFxwe0x9XFxwe059XS91KSkgcmV0dXJuO1xuXG4gICAgY29uc3QgbmV4dENoYXIgPSBtYXRjaFsxXSB8fCBtYXRjaFsyXSB8fCAnJztcblxuICAgIGlmICghbmV4dENoYXIgfHwgKG5leHRDaGFyICYmIChwcmV2Q2hhciA9PT0gJycgfHwgdGhpcy5ydWxlcy5pbmxpbmUucHVuY3R1YXRpb24uZXhlYyhwcmV2Q2hhcikpKSkge1xuICAgICAgY29uc3QgbExlbmd0aCA9IG1hdGNoWzBdLmxlbmd0aCAtIDE7XG4gICAgICBsZXQgckRlbGltLCByTGVuZ3RoLCBkZWxpbVRvdGFsID0gbExlbmd0aCwgbWlkRGVsaW1Ub3RhbCA9IDA7XG5cbiAgICAgIGNvbnN0IGVuZFJlZyA9IG1hdGNoWzBdWzBdID09PSAnKicgPyB0aGlzLnJ1bGVzLmlubGluZS5lbVN0cm9uZy5yRGVsaW1Bc3QgOiB0aGlzLnJ1bGVzLmlubGluZS5lbVN0cm9uZy5yRGVsaW1VbmQ7XG4gICAgICBlbmRSZWcubGFzdEluZGV4ID0gMDtcblxuICAgICAgLy8gQ2xpcCBtYXNrZWRTcmMgdG8gc2FtZSBzZWN0aW9uIG9mIHN0cmluZyBhcyBzcmMgKG1vdmUgdG8gbGV4ZXI/KVxuICAgICAgbWFza2VkU3JjID0gbWFza2VkU3JjLnNsaWNlKC0xICogc3JjLmxlbmd0aCArIGxMZW5ndGgpO1xuXG4gICAgICB3aGlsZSAoKG1hdGNoID0gZW5kUmVnLmV4ZWMobWFza2VkU3JjKSkgIT0gbnVsbCkge1xuICAgICAgICByRGVsaW0gPSBtYXRjaFsxXSB8fCBtYXRjaFsyXSB8fCBtYXRjaFszXSB8fCBtYXRjaFs0XSB8fCBtYXRjaFs1XSB8fCBtYXRjaFs2XTtcblxuICAgICAgICBpZiAoIXJEZWxpbSkgY29udGludWU7IC8vIHNraXAgc2luZ2xlICogaW4gX19hYmMqYWJjX19cblxuICAgICAgICByTGVuZ3RoID0gckRlbGltLmxlbmd0aDtcblxuICAgICAgICBpZiAobWF0Y2hbM10gfHwgbWF0Y2hbNF0pIHsgLy8gZm91bmQgYW5vdGhlciBMZWZ0IERlbGltXG4gICAgICAgICAgZGVsaW1Ub3RhbCArPSByTGVuZ3RoO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9IGVsc2UgaWYgKG1hdGNoWzVdIHx8IG1hdGNoWzZdKSB7IC8vIGVpdGhlciBMZWZ0IG9yIFJpZ2h0IERlbGltXG4gICAgICAgICAgaWYgKGxMZW5ndGggJSAzICYmICEoKGxMZW5ndGggKyByTGVuZ3RoKSAlIDMpKSB7XG4gICAgICAgICAgICBtaWREZWxpbVRvdGFsICs9IHJMZW5ndGg7XG4gICAgICAgICAgICBjb250aW51ZTsgLy8gQ29tbW9uTWFyayBFbXBoYXNpcyBSdWxlcyA5LTEwXG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZGVsaW1Ub3RhbCAtPSByTGVuZ3RoO1xuXG4gICAgICAgIGlmIChkZWxpbVRvdGFsID4gMCkgY29udGludWU7IC8vIEhhdmVuJ3QgZm91bmQgZW5vdWdoIGNsb3NpbmcgZGVsaW1pdGVyc1xuXG4gICAgICAgIC8vIFJlbW92ZSBleHRyYSBjaGFyYWN0ZXJzLiAqYSoqKiAtPiAqYSpcbiAgICAgICAgckxlbmd0aCA9IE1hdGgubWluKHJMZW5ndGgsIHJMZW5ndGggKyBkZWxpbVRvdGFsICsgbWlkRGVsaW1Ub3RhbCk7XG5cbiAgICAgICAgY29uc3QgcmF3ID0gc3JjLnNsaWNlKDAsIGxMZW5ndGggKyBtYXRjaC5pbmRleCArIChtYXRjaFswXS5sZW5ndGggLSByRGVsaW0ubGVuZ3RoKSArIHJMZW5ndGgpO1xuXG4gICAgICAgIC8vIENyZWF0ZSBgZW1gIGlmIHNtYWxsZXN0IGRlbGltaXRlciBoYXMgb2RkIGNoYXIgY291bnQuICphKioqXG4gICAgICAgIGlmIChNYXRoLm1pbihsTGVuZ3RoLCByTGVuZ3RoKSAlIDIpIHtcbiAgICAgICAgICBjb25zdCB0ZXh0ID0gcmF3LnNsaWNlKDEsIC0xKTtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdHlwZTogJ2VtJyxcbiAgICAgICAgICAgIHJhdyxcbiAgICAgICAgICAgIHRleHQsXG4gICAgICAgICAgICB0b2tlbnM6IHRoaXMubGV4ZXIuaW5saW5lVG9rZW5zKHRleHQpXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENyZWF0ZSAnc3Ryb25nJyBpZiBzbWFsbGVzdCBkZWxpbWl0ZXIgaGFzIGV2ZW4gY2hhciBjb3VudC4gKiphKioqXG4gICAgICAgIGNvbnN0IHRleHQgPSByYXcuc2xpY2UoMiwgLTIpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHR5cGU6ICdzdHJvbmcnLFxuICAgICAgICAgIHJhdyxcbiAgICAgICAgICB0ZXh0LFxuICAgICAgICAgIHRva2VuczogdGhpcy5sZXhlci5pbmxpbmVUb2tlbnModGV4dClcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBjb2Rlc3BhbihzcmMpIHtcbiAgICBjb25zdCBjYXAgPSB0aGlzLnJ1bGVzLmlubGluZS5jb2RlLmV4ZWMoc3JjKTtcbiAgICBpZiAoY2FwKSB7XG4gICAgICBsZXQgdGV4dCA9IGNhcFsyXS5yZXBsYWNlKC9cXG4vZywgJyAnKTtcbiAgICAgIGNvbnN0IGhhc05vblNwYWNlQ2hhcnMgPSAvW14gXS8udGVzdCh0ZXh0KTtcbiAgICAgIGNvbnN0IGhhc1NwYWNlQ2hhcnNPbkJvdGhFbmRzID0gL14gLy50ZXN0KHRleHQpICYmIC8gJC8udGVzdCh0ZXh0KTtcbiAgICAgIGlmIChoYXNOb25TcGFjZUNoYXJzICYmIGhhc1NwYWNlQ2hhcnNPbkJvdGhFbmRzKSB7XG4gICAgICAgIHRleHQgPSB0ZXh0LnN1YnN0cmluZygxLCB0ZXh0Lmxlbmd0aCAtIDEpO1xuICAgICAgfVxuICAgICAgdGV4dCA9IGVzY2FwZSh0ZXh0LCB0cnVlKTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdjb2Rlc3BhbicsXG4gICAgICAgIHJhdzogY2FwWzBdLFxuICAgICAgICB0ZXh0XG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIGJyKHNyYykge1xuICAgIGNvbnN0IGNhcCA9IHRoaXMucnVsZXMuaW5saW5lLmJyLmV4ZWMoc3JjKTtcbiAgICBpZiAoY2FwKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAnYnInLFxuICAgICAgICByYXc6IGNhcFswXVxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICBkZWwoc3JjKSB7XG4gICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5pbmxpbmUuZGVsLmV4ZWMoc3JjKTtcbiAgICBpZiAoY2FwKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAnZGVsJyxcbiAgICAgICAgcmF3OiBjYXBbMF0sXG4gICAgICAgIHRleHQ6IGNhcFsyXSxcbiAgICAgICAgdG9rZW5zOiB0aGlzLmxleGVyLmlubGluZVRva2VucyhjYXBbMl0pXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIGF1dG9saW5rKHNyYywgbWFuZ2xlKSB7XG4gICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5pbmxpbmUuYXV0b2xpbmsuZXhlYyhzcmMpO1xuICAgIGlmIChjYXApIHtcbiAgICAgIGxldCB0ZXh0LCBocmVmO1xuICAgICAgaWYgKGNhcFsyXSA9PT0gJ0AnKSB7XG4gICAgICAgIHRleHQgPSBlc2NhcGUodGhpcy5vcHRpb25zLm1hbmdsZSA/IG1hbmdsZShjYXBbMV0pIDogY2FwWzFdKTtcbiAgICAgICAgaHJlZiA9ICdtYWlsdG86JyArIHRleHQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0ZXh0ID0gZXNjYXBlKGNhcFsxXSk7XG4gICAgICAgIGhyZWYgPSB0ZXh0O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAnbGluaycsXG4gICAgICAgIHJhdzogY2FwWzBdLFxuICAgICAgICB0ZXh0LFxuICAgICAgICBocmVmLFxuICAgICAgICB0b2tlbnM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICB0eXBlOiAndGV4dCcsXG4gICAgICAgICAgICByYXc6IHRleHQsXG4gICAgICAgICAgICB0ZXh0XG4gICAgICAgICAgfVxuICAgICAgICBdXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIHVybChzcmMsIG1hbmdsZSkge1xuICAgIGxldCBjYXA7XG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuaW5saW5lLnVybC5leGVjKHNyYykpIHtcbiAgICAgIGxldCB0ZXh0LCBocmVmO1xuICAgICAgaWYgKGNhcFsyXSA9PT0gJ0AnKSB7XG4gICAgICAgIHRleHQgPSBlc2NhcGUodGhpcy5vcHRpb25zLm1hbmdsZSA/IG1hbmdsZShjYXBbMF0pIDogY2FwWzBdKTtcbiAgICAgICAgaHJlZiA9ICdtYWlsdG86JyArIHRleHQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBkbyBleHRlbmRlZCBhdXRvbGluayBwYXRoIHZhbGlkYXRpb25cbiAgICAgICAgbGV0IHByZXZDYXBaZXJvO1xuICAgICAgICBkbyB7XG4gICAgICAgICAgcHJldkNhcFplcm8gPSBjYXBbMF07XG4gICAgICAgICAgY2FwWzBdID0gdGhpcy5ydWxlcy5pbmxpbmUuX2JhY2twZWRhbC5leGVjKGNhcFswXSlbMF07XG4gICAgICAgIH0gd2hpbGUgKHByZXZDYXBaZXJvICE9PSBjYXBbMF0pO1xuICAgICAgICB0ZXh0ID0gZXNjYXBlKGNhcFswXSk7XG4gICAgICAgIGlmIChjYXBbMV0gPT09ICd3d3cuJykge1xuICAgICAgICAgIGhyZWYgPSAnaHR0cDovLycgKyBjYXBbMF07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaHJlZiA9IGNhcFswXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ2xpbmsnLFxuICAgICAgICByYXc6IGNhcFswXSxcbiAgICAgICAgdGV4dCxcbiAgICAgICAgaHJlZixcbiAgICAgICAgdG9rZW5zOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgdHlwZTogJ3RleHQnLFxuICAgICAgICAgICAgcmF3OiB0ZXh0LFxuICAgICAgICAgICAgdGV4dFxuICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICBpbmxpbmVUZXh0KHNyYywgc21hcnR5cGFudHMpIHtcbiAgICBjb25zdCBjYXAgPSB0aGlzLnJ1bGVzLmlubGluZS50ZXh0LmV4ZWMoc3JjKTtcbiAgICBpZiAoY2FwKSB7XG4gICAgICBsZXQgdGV4dDtcbiAgICAgIGlmICh0aGlzLmxleGVyLnN0YXRlLmluUmF3QmxvY2spIHtcbiAgICAgICAgdGV4dCA9IHRoaXMub3B0aW9ucy5zYW5pdGl6ZSA/ICh0aGlzLm9wdGlvbnMuc2FuaXRpemVyID8gdGhpcy5vcHRpb25zLnNhbml0aXplcihjYXBbMF0pIDogZXNjYXBlKGNhcFswXSkpIDogY2FwWzBdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGV4dCA9IGVzY2FwZSh0aGlzLm9wdGlvbnMuc21hcnR5cGFudHMgPyBzbWFydHlwYW50cyhjYXBbMF0pIDogY2FwWzBdKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgICAgcmF3OiBjYXBbMF0sXG4gICAgICAgIHRleHRcbiAgICAgIH07XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQmxvY2stTGV2ZWwgR3JhbW1hclxuICovXG5jb25zdCBibG9jayA9IHtcbiAgbmV3bGluZTogL14oPzogKig/OlxcbnwkKSkrLyxcbiAgY29kZTogL14oIHs0fVteXFxuXSsoPzpcXG4oPzogKig/OlxcbnwkKSkqKT8pKy8sXG4gIGZlbmNlczogL14gezAsM30oYHszLH0oPz1bXmBcXG5dKlxcbil8fnszLH0pKFteXFxuXSopXFxuKD86fChbXFxzXFxTXSo/KVxcbikoPzogezAsM31cXDFbfmBdKiAqKD89XFxufCQpfCQpLyxcbiAgaHI6IC9eIHswLDN9KCg/Oi1bXFx0IF0qKXszLH18KD86X1sgXFx0XSopezMsfXwoPzpcXCpbIFxcdF0qKXszLH0pKD86XFxuK3wkKS8sXG4gIGhlYWRpbmc6IC9eIHswLDN9KCN7MSw2fSkoPz1cXHN8JCkoLiopKD86XFxuK3wkKS8sXG4gIGJsb2NrcXVvdGU6IC9eKCB7MCwzfT4gPyhwYXJhZ3JhcGh8W15cXG5dKikoPzpcXG58JCkpKy8sXG4gIGxpc3Q6IC9eKCB7MCwzfWJ1bGwpKFsgXFx0XVteXFxuXSs/KT8oPzpcXG58JCkvLFxuICBodG1sOiAnXiB7MCwzfSg/OicgLy8gb3B0aW9uYWwgaW5kZW50YXRpb25cbiAgICArICc8KHNjcmlwdHxwcmV8c3R5bGV8dGV4dGFyZWEpW1xcXFxzPl1bXFxcXHNcXFxcU10qPyg/OjwvXFxcXDE+W15cXFxcbl0qXFxcXG4rfCQpJyAvLyAoMSlcbiAgICArICd8Y29tbWVudFteXFxcXG5dKihcXFxcbit8JCknIC8vICgyKVxuICAgICsgJ3w8XFxcXD9bXFxcXHNcXFxcU10qPyg/OlxcXFw/PlxcXFxuKnwkKScgLy8gKDMpXG4gICAgKyAnfDwhW0EtWl1bXFxcXHNcXFxcU10qPyg/Oj5cXFxcbip8JCknIC8vICg0KVxuICAgICsgJ3w8IVxcXFxbQ0RBVEFcXFxcW1tcXFxcc1xcXFxTXSo/KD86XFxcXF1cXFxcXT5cXFxcbip8JCknIC8vICg1KVxuICAgICsgJ3w8Lz8odGFnKSg/OiArfFxcXFxufC8/PilbXFxcXHNcXFxcU10qPyg/Oig/OlxcXFxuICopK1xcXFxufCQpJyAvLyAoNilcbiAgICArICd8PCg/IXNjcmlwdHxwcmV8c3R5bGV8dGV4dGFyZWEpKFthLXpdW1xcXFx3LV0qKSg/OmF0dHJpYnV0ZSkqPyAqLz8+KD89WyBcXFxcdF0qKD86XFxcXG58JCkpW1xcXFxzXFxcXFNdKj8oPzooPzpcXFxcbiAqKStcXFxcbnwkKScgLy8gKDcpIG9wZW4gdGFnXG4gICAgKyAnfDwvKD8hc2NyaXB0fHByZXxzdHlsZXx0ZXh0YXJlYSlbYS16XVtcXFxcdy1dKlxcXFxzKj4oPz1bIFxcXFx0XSooPzpcXFxcbnwkKSlbXFxcXHNcXFxcU10qPyg/Oig/OlxcXFxuICopK1xcXFxufCQpJyAvLyAoNykgY2xvc2luZyB0YWdcbiAgICArICcpJyxcbiAgZGVmOiAvXiB7MCwzfVxcWyhsYWJlbClcXF06ICooPzpcXG4gKik/KFtePFxcc11bXlxcc10qfDwuKj8+KSg/Oig/OiArKD86XFxuICopP3wgKlxcbiAqKSh0aXRsZSkpPyAqKD86XFxuK3wkKS8sXG4gIHRhYmxlOiBub29wVGVzdCxcbiAgbGhlYWRpbmc6IC9eKCg/Oi58XFxuKD8hXFxuKSkrPylcXG4gezAsM30oPSt8LSspICooPzpcXG4rfCQpLyxcbiAgLy8gcmVnZXggdGVtcGxhdGUsIHBsYWNlaG9sZGVycyB3aWxsIGJlIHJlcGxhY2VkIGFjY29yZGluZyB0byBkaWZmZXJlbnQgcGFyYWdyYXBoXG4gIC8vIGludGVycnVwdGlvbiBydWxlcyBvZiBjb21tb25tYXJrIGFuZCB0aGUgb3JpZ2luYWwgbWFya2Rvd24gc3BlYzpcbiAgX3BhcmFncmFwaDogL14oW15cXG5dKyg/Olxcbig/IWhyfGhlYWRpbmd8bGhlYWRpbmd8YmxvY2txdW90ZXxmZW5jZXN8bGlzdHxodG1sfHRhYmxlfCArXFxuKVteXFxuXSspKikvLFxuICB0ZXh0OiAvXlteXFxuXSsvXG59O1xuXG5ibG9jay5fbGFiZWwgPSAvKD8hXFxzKlxcXSkoPzpcXFxcLnxbXlxcW1xcXVxcXFxdKSsvO1xuYmxvY2suX3RpdGxlID0gLyg/OlwiKD86XFxcXFwiP3xbXlwiXFxcXF0pKlwifCdbXidcXG5dKig/OlxcblteJ1xcbl0rKSpcXG4/J3xcXChbXigpXSpcXCkpLztcbmJsb2NrLmRlZiA9IGVkaXQoYmxvY2suZGVmKVxuICAucmVwbGFjZSgnbGFiZWwnLCBibG9jay5fbGFiZWwpXG4gIC5yZXBsYWNlKCd0aXRsZScsIGJsb2NrLl90aXRsZSlcbiAgLmdldFJlZ2V4KCk7XG5cbmJsb2NrLmJ1bGxldCA9IC8oPzpbKistXXxcXGR7MSw5fVsuKV0pLztcbmJsb2NrLmxpc3RJdGVtU3RhcnQgPSBlZGl0KC9eKCAqKShidWxsKSAqLylcbiAgLnJlcGxhY2UoJ2J1bGwnLCBibG9jay5idWxsZXQpXG4gIC5nZXRSZWdleCgpO1xuXG5ibG9jay5saXN0ID0gZWRpdChibG9jay5saXN0KVxuICAucmVwbGFjZSgvYnVsbC9nLCBibG9jay5idWxsZXQpXG4gIC5yZXBsYWNlKCdocicsICdcXFxcbisoPz1cXFxcMT8oPzooPzotICopezMsfXwoPzpfICopezMsfXwoPzpcXFxcKiAqKXszLH0pKD86XFxcXG4rfCQpKScpXG4gIC5yZXBsYWNlKCdkZWYnLCAnXFxcXG4rKD89JyArIGJsb2NrLmRlZi5zb3VyY2UgKyAnKScpXG4gIC5nZXRSZWdleCgpO1xuXG5ibG9jay5fdGFnID0gJ2FkZHJlc3N8YXJ0aWNsZXxhc2lkZXxiYXNlfGJhc2Vmb250fGJsb2NrcXVvdGV8Ym9keXxjYXB0aW9uJ1xuICArICd8Y2VudGVyfGNvbHxjb2xncm91cHxkZHxkZXRhaWxzfGRpYWxvZ3xkaXJ8ZGl2fGRsfGR0fGZpZWxkc2V0fGZpZ2NhcHRpb24nXG4gICsgJ3xmaWd1cmV8Zm9vdGVyfGZvcm18ZnJhbWV8ZnJhbWVzZXR8aFsxLTZdfGhlYWR8aGVhZGVyfGhyfGh0bWx8aWZyYW1lJ1xuICArICd8bGVnZW5kfGxpfGxpbmt8bWFpbnxtZW51fG1lbnVpdGVtfG1ldGF8bmF2fG5vZnJhbWVzfG9sfG9wdGdyb3VwfG9wdGlvbidcbiAgKyAnfHB8cGFyYW18c2VjdGlvbnxzb3VyY2V8c3VtbWFyeXx0YWJsZXx0Ym9keXx0ZHx0Zm9vdHx0aHx0aGVhZHx0aXRsZXx0cidcbiAgKyAnfHRyYWNrfHVsJztcbmJsb2NrLl9jb21tZW50ID0gLzwhLS0oPyEtPz4pW1xcc1xcU10qPyg/Oi0tPnwkKS87XG5ibG9jay5odG1sID0gZWRpdChibG9jay5odG1sLCAnaScpXG4gIC5yZXBsYWNlKCdjb21tZW50JywgYmxvY2suX2NvbW1lbnQpXG4gIC5yZXBsYWNlKCd0YWcnLCBibG9jay5fdGFnKVxuICAucmVwbGFjZSgnYXR0cmlidXRlJywgLyArW2EtekEtWjpfXVtcXHcuOi1dKig/OiAqPSAqXCJbXlwiXFxuXSpcInwgKj0gKidbXidcXG5dKid8ICo9ICpbXlxcc1wiJz08PmBdKyk/LylcbiAgLmdldFJlZ2V4KCk7XG5cbmJsb2NrLnBhcmFncmFwaCA9IGVkaXQoYmxvY2suX3BhcmFncmFwaClcbiAgLnJlcGxhY2UoJ2hyJywgYmxvY2suaHIpXG4gIC5yZXBsYWNlKCdoZWFkaW5nJywgJyB7MCwzfSN7MSw2fSAnKVxuICAucmVwbGFjZSgnfGxoZWFkaW5nJywgJycpIC8vIHNldGV4IGhlYWRpbmdzIGRvbid0IGludGVycnVwdCBjb21tb25tYXJrIHBhcmFncmFwaHNcbiAgLnJlcGxhY2UoJ3x0YWJsZScsICcnKVxuICAucmVwbGFjZSgnYmxvY2txdW90ZScsICcgezAsM30+JylcbiAgLnJlcGxhY2UoJ2ZlbmNlcycsICcgezAsM30oPzpgezMsfSg/PVteYFxcXFxuXSpcXFxcbil8fnszLH0pW15cXFxcbl0qXFxcXG4nKVxuICAucmVwbGFjZSgnbGlzdCcsICcgezAsM30oPzpbKistXXwxWy4pXSkgJykgLy8gb25seSBsaXN0cyBzdGFydGluZyBmcm9tIDEgY2FuIGludGVycnVwdFxuICAucmVwbGFjZSgnaHRtbCcsICc8Lz8oPzp0YWcpKD86ICt8XFxcXG58Lz8+KXw8KD86c2NyaXB0fHByZXxzdHlsZXx0ZXh0YXJlYXwhLS0pJylcbiAgLnJlcGxhY2UoJ3RhZycsIGJsb2NrLl90YWcpIC8vIHBhcnMgY2FuIGJlIGludGVycnVwdGVkIGJ5IHR5cGUgKDYpIGh0bWwgYmxvY2tzXG4gIC5nZXRSZWdleCgpO1xuXG5ibG9jay5ibG9ja3F1b3RlID0gZWRpdChibG9jay5ibG9ja3F1b3RlKVxuICAucmVwbGFjZSgncGFyYWdyYXBoJywgYmxvY2sucGFyYWdyYXBoKVxuICAuZ2V0UmVnZXgoKTtcblxuLyoqXG4gKiBOb3JtYWwgQmxvY2sgR3JhbW1hclxuICovXG5cbmJsb2NrLm5vcm1hbCA9IG1lcmdlKHt9LCBibG9jayk7XG5cbi8qKlxuICogR0ZNIEJsb2NrIEdyYW1tYXJcbiAqL1xuXG5ibG9jay5nZm0gPSBtZXJnZSh7fSwgYmxvY2subm9ybWFsLCB7XG4gIHRhYmxlOiAnXiAqKFteXFxcXG4gXS4qXFxcXHwuKilcXFxcbicgLy8gSGVhZGVyXG4gICAgKyAnIHswLDN9KD86XFxcXHwgKik/KDo/LSs6PyAqKD86XFxcXHwgKjo/LSs6PyAqKSopKD86XFxcXHwgKik/JyAvLyBBbGlnblxuICAgICsgJyg/OlxcXFxuKCg/Oig/ISAqXFxcXG58aHJ8aGVhZGluZ3xibG9ja3F1b3RlfGNvZGV8ZmVuY2VzfGxpc3R8aHRtbCkuKig/OlxcXFxufCQpKSopXFxcXG4qfCQpJyAvLyBDZWxsc1xufSk7XG5cbmJsb2NrLmdmbS50YWJsZSA9IGVkaXQoYmxvY2suZ2ZtLnRhYmxlKVxuICAucmVwbGFjZSgnaHInLCBibG9jay5ocilcbiAgLnJlcGxhY2UoJ2hlYWRpbmcnLCAnIHswLDN9I3sxLDZ9ICcpXG4gIC5yZXBsYWNlKCdibG9ja3F1b3RlJywgJyB7MCwzfT4nKVxuICAucmVwbGFjZSgnY29kZScsICcgezR9W15cXFxcbl0nKVxuICAucmVwbGFjZSgnZmVuY2VzJywgJyB7MCwzfSg/OmB7Myx9KD89W15gXFxcXG5dKlxcXFxuKXx+ezMsfSlbXlxcXFxuXSpcXFxcbicpXG4gIC5yZXBsYWNlKCdsaXN0JywgJyB7MCwzfSg/OlsqKy1dfDFbLildKSAnKSAvLyBvbmx5IGxpc3RzIHN0YXJ0aW5nIGZyb20gMSBjYW4gaW50ZXJydXB0XG4gIC5yZXBsYWNlKCdodG1sJywgJzwvPyg/OnRhZykoPzogK3xcXFxcbnwvPz4pfDwoPzpzY3JpcHR8cHJlfHN0eWxlfHRleHRhcmVhfCEtLSknKVxuICAucmVwbGFjZSgndGFnJywgYmxvY2suX3RhZykgLy8gdGFibGVzIGNhbiBiZSBpbnRlcnJ1cHRlZCBieSB0eXBlICg2KSBodG1sIGJsb2Nrc1xuICAuZ2V0UmVnZXgoKTtcblxuYmxvY2suZ2ZtLnBhcmFncmFwaCA9IGVkaXQoYmxvY2suX3BhcmFncmFwaClcbiAgLnJlcGxhY2UoJ2hyJywgYmxvY2suaHIpXG4gIC5yZXBsYWNlKCdoZWFkaW5nJywgJyB7MCwzfSN7MSw2fSAnKVxuICAucmVwbGFjZSgnfGxoZWFkaW5nJywgJycpIC8vIHNldGV4IGhlYWRpbmdzIGRvbid0IGludGVycnVwdCBjb21tb25tYXJrIHBhcmFncmFwaHNcbiAgLnJlcGxhY2UoJ3RhYmxlJywgYmxvY2suZ2ZtLnRhYmxlKSAvLyBpbnRlcnJ1cHQgcGFyYWdyYXBocyB3aXRoIHRhYmxlXG4gIC5yZXBsYWNlKCdibG9ja3F1b3RlJywgJyB7MCwzfT4nKVxuICAucmVwbGFjZSgnZmVuY2VzJywgJyB7MCwzfSg/OmB7Myx9KD89W15gXFxcXG5dKlxcXFxuKXx+ezMsfSlbXlxcXFxuXSpcXFxcbicpXG4gIC5yZXBsYWNlKCdsaXN0JywgJyB7MCwzfSg/OlsqKy1dfDFbLildKSAnKSAvLyBvbmx5IGxpc3RzIHN0YXJ0aW5nIGZyb20gMSBjYW4gaW50ZXJydXB0XG4gIC5yZXBsYWNlKCdodG1sJywgJzwvPyg/OnRhZykoPzogK3xcXFxcbnwvPz4pfDwoPzpzY3JpcHR8cHJlfHN0eWxlfHRleHRhcmVhfCEtLSknKVxuICAucmVwbGFjZSgndGFnJywgYmxvY2suX3RhZykgLy8gcGFycyBjYW4gYmUgaW50ZXJydXB0ZWQgYnkgdHlwZSAoNikgaHRtbCBibG9ja3NcbiAgLmdldFJlZ2V4KCk7XG4vKipcbiAqIFBlZGFudGljIGdyYW1tYXIgKG9yaWdpbmFsIEpvaG4gR3J1YmVyJ3MgbG9vc2UgbWFya2Rvd24gc3BlY2lmaWNhdGlvbilcbiAqL1xuXG5ibG9jay5wZWRhbnRpYyA9IG1lcmdlKHt9LCBibG9jay5ub3JtYWwsIHtcbiAgaHRtbDogZWRpdChcbiAgICAnXiAqKD86Y29tbWVudCAqKD86XFxcXG58XFxcXHMqJCknXG4gICAgKyAnfDwodGFnKVtcXFxcc1xcXFxTXSs/PC9cXFxcMT4gKig/OlxcXFxuezIsfXxcXFxccyokKScgLy8gY2xvc2VkIHRhZ1xuICAgICsgJ3w8dGFnKD86XCJbXlwiXSpcInxcXCdbXlxcJ10qXFwnfFxcXFxzW15cXCdcIi8+XFxcXHNdKikqPy8/PiAqKD86XFxcXG57Mix9fFxcXFxzKiQpKScpXG4gICAgLnJlcGxhY2UoJ2NvbW1lbnQnLCBibG9jay5fY29tbWVudClcbiAgICAucmVwbGFjZSgvdGFnL2csICcoPyEoPzonXG4gICAgICArICdhfGVtfHN0cm9uZ3xzbWFsbHxzfGNpdGV8cXxkZm58YWJicnxkYXRhfHRpbWV8Y29kZXx2YXJ8c2FtcHxrYmR8c3ViJ1xuICAgICAgKyAnfHN1cHxpfGJ8dXxtYXJrfHJ1Ynl8cnR8cnB8YmRpfGJkb3xzcGFufGJyfHdicnxpbnN8ZGVsfGltZyknXG4gICAgICArICdcXFxcYilcXFxcdysoPyE6fFteXFxcXHdcXFxcc0BdKkApXFxcXGInKVxuICAgIC5nZXRSZWdleCgpLFxuICBkZWY6IC9eICpcXFsoW15cXF1dKylcXF06ICo8PyhbXlxccz5dKyk+Pyg/OiArKFtcIihdW15cXG5dK1tcIildKSk/ICooPzpcXG4rfCQpLyxcbiAgaGVhZGluZzogL14oI3sxLDZ9KSguKikoPzpcXG4rfCQpLyxcbiAgZmVuY2VzOiBub29wVGVzdCwgLy8gZmVuY2VzIG5vdCBzdXBwb3J0ZWRcbiAgbGhlYWRpbmc6IC9eKC4rPylcXG4gezAsM30oPSt8LSspICooPzpcXG4rfCQpLyxcbiAgcGFyYWdyYXBoOiBlZGl0KGJsb2NrLm5vcm1hbC5fcGFyYWdyYXBoKVxuICAgIC5yZXBsYWNlKCdocicsIGJsb2NrLmhyKVxuICAgIC5yZXBsYWNlKCdoZWFkaW5nJywgJyAqI3sxLDZ9ICpbXlxcbl0nKVxuICAgIC5yZXBsYWNlKCdsaGVhZGluZycsIGJsb2NrLmxoZWFkaW5nKVxuICAgIC5yZXBsYWNlKCdibG9ja3F1b3RlJywgJyB7MCwzfT4nKVxuICAgIC5yZXBsYWNlKCd8ZmVuY2VzJywgJycpXG4gICAgLnJlcGxhY2UoJ3xsaXN0JywgJycpXG4gICAgLnJlcGxhY2UoJ3xodG1sJywgJycpXG4gICAgLmdldFJlZ2V4KClcbn0pO1xuXG4vKipcbiAqIElubGluZS1MZXZlbCBHcmFtbWFyXG4gKi9cbmNvbnN0IGlubGluZSA9IHtcbiAgZXNjYXBlOiAvXlxcXFwoWyFcIiMkJSYnKCkqKyxcXC0uLzo7PD0+P0BcXFtcXF1cXFxcXl9ge3x9fl0pLyxcbiAgYXV0b2xpbms6IC9ePChzY2hlbWU6W15cXHNcXHgwMC1cXHgxZjw+XSp8ZW1haWwpPi8sXG4gIHVybDogbm9vcFRlc3QsXG4gIHRhZzogJ15jb21tZW50J1xuICAgICsgJ3xePC9bYS16QS1aXVtcXFxcdzotXSpcXFxccyo+JyAvLyBzZWxmLWNsb3NpbmcgdGFnXG4gICAgKyAnfF48W2EtekEtWl1bXFxcXHctXSooPzphdHRyaWJ1dGUpKj9cXFxccyovPz4nIC8vIG9wZW4gdGFnXG4gICAgKyAnfF48XFxcXD9bXFxcXHNcXFxcU10qP1xcXFw/PicgLy8gcHJvY2Vzc2luZyBpbnN0cnVjdGlvbiwgZS5nLiA8P3BocCA/PlxuICAgICsgJ3xePCFbYS16QS1aXStcXFxcc1tcXFxcc1xcXFxTXSo/PicgLy8gZGVjbGFyYXRpb24sIGUuZy4gPCFET0NUWVBFIGh0bWw+XG4gICAgKyAnfF48IVxcXFxbQ0RBVEFcXFxcW1tcXFxcc1xcXFxTXSo/XFxcXF1cXFxcXT4nLCAvLyBDREFUQSBzZWN0aW9uXG4gIGxpbms6IC9eIT9cXFsobGFiZWwpXFxdXFwoXFxzKihocmVmKSg/OlxccysodGl0bGUpKT9cXHMqXFwpLyxcbiAgcmVmbGluazogL14hP1xcWyhsYWJlbClcXF1cXFsocmVmKVxcXS8sXG4gIG5vbGluazogL14hP1xcWyhyZWYpXFxdKD86XFxbXFxdKT8vLFxuICByZWZsaW5rU2VhcmNoOiAncmVmbGlua3xub2xpbmsoPyFcXFxcKCknLFxuICBlbVN0cm9uZzoge1xuICAgIGxEZWxpbTogL14oPzpcXCorKD86KFtwdW5jdF9dKXxbXlxccypdKSl8Xl8rKD86KFtwdW5jdCpdKXwoW15cXHNfXSkpLyxcbiAgICAvLyAgICAgICAgKDEpIGFuZCAoMikgY2FuIG9ubHkgYmUgYSBSaWdodCBEZWxpbWl0ZXIuICgzKSBhbmQgKDQpIGNhbiBvbmx5IGJlIExlZnQuICAoNSkgYW5kICg2KSBjYW4gYmUgZWl0aGVyIExlZnQgb3IgUmlnaHQuXG4gICAgLy8gICAgICAgICAgKCkgU2tpcCBvcnBoYW4gaW5zaWRlIHN0cm9uZyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCkgQ29uc3VtZSB0byBkZWxpbSAgICAgKDEpICMqKiogICAgICAgICAgICAgICAgKDIpIGEqKiojLCBhKioqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoMykgIyoqKmEsICoqKmEgICAgICAgICAgICAgICAgICg0KSAqKiojICAgICAgICAgICAgICAoNSkgIyoqKiMgICAgICAgICAgICAgICAgICg2KSBhKioqYVxuICAgIHJEZWxpbUFzdDogL14oPzpbXl8qXFxcXF18XFxcXC4pKj9cXF9cXF8oPzpbXl8qXFxcXF18XFxcXC4pKj9cXCooPzpbXl8qXFxcXF18XFxcXC4pKj8oPz1cXF9cXF8pfCg/OlteKlxcXFxdfFxcXFwuKSsoPz1bXipdKXxbcHVuY3RfXShcXCorKSg/PVtcXHNdfCQpfCg/OltecHVuY3QqX1xcc1xcXFxdfFxcXFwuKShcXCorKSg/PVtwdW5jdF9cXHNdfCQpfFtwdW5jdF9cXHNdKFxcKispKD89W15wdW5jdCpfXFxzXSl8W1xcc10oXFwqKykoPz1bcHVuY3RfXSl8W3B1bmN0X10oXFwqKykoPz1bcHVuY3RfXSl8KD86W15wdW5jdCpfXFxzXFxcXF18XFxcXC4pKFxcKispKD89W15wdW5jdCpfXFxzXSkvLFxuICAgIHJEZWxpbVVuZDogL14oPzpbXl8qXFxcXF18XFxcXC4pKj9cXCpcXCooPzpbXl8qXFxcXF18XFxcXC4pKj9cXF8oPzpbXl8qXFxcXF18XFxcXC4pKj8oPz1cXCpcXCopfCg/OlteX1xcXFxdfFxcXFwuKSsoPz1bXl9dKXxbcHVuY3QqXShcXF8rKSg/PVtcXHNdfCQpfCg/OltecHVuY3QqX1xcc1xcXFxdfFxcXFwuKShcXF8rKSg/PVtwdW5jdCpcXHNdfCQpfFtwdW5jdCpcXHNdKFxcXyspKD89W15wdW5jdCpfXFxzXSl8W1xcc10oXFxfKykoPz1bcHVuY3QqXSl8W3B1bmN0Kl0oXFxfKykoPz1bcHVuY3QqXSkvIC8vIF4tIE5vdCBhbGxvd2VkIGZvciBfXG4gIH0sXG4gIGNvZGU6IC9eKGArKShbXmBdfFteYF1bXFxzXFxTXSo/W15gXSlcXDEoPyFgKS8sXG4gIGJyOiAvXiggezIsfXxcXFxcKVxcbig/IVxccyokKS8sXG4gIGRlbDogbm9vcFRlc3QsXG4gIHRleHQ6IC9eKGArfFteYF0pKD86KD89IHsyLH1cXG4pfFtcXHNcXFNdKj8oPzooPz1bXFxcXDwhXFxbYCpfXXxcXGJffCQpfFteIF0oPz0gezIsfVxcbikpKS8sXG4gIHB1bmN0dWF0aW9uOiAvXihbXFxzcHVuY3R1YXRpb25dKS9cbn07XG5cbi8vIGxpc3Qgb2YgcHVuY3R1YXRpb24gbWFya3MgZnJvbSBDb21tb25NYXJrIHNwZWNcbi8vIHdpdGhvdXQgKiBhbmQgXyB0byBoYW5kbGUgdGhlIGRpZmZlcmVudCBlbXBoYXNpcyBtYXJrZXJzICogYW5kIF9cbmlubGluZS5fcHVuY3R1YXRpb24gPSAnIVwiIyQlJlxcJygpK1xcXFwtLiwvOjs8PT4/QFxcXFxbXFxcXF1gXnt8fX4nO1xuaW5saW5lLnB1bmN0dWF0aW9uID0gZWRpdChpbmxpbmUucHVuY3R1YXRpb24pLnJlcGxhY2UoL3B1bmN0dWF0aW9uL2csIGlubGluZS5fcHVuY3R1YXRpb24pLmdldFJlZ2V4KCk7XG5cbi8vIHNlcXVlbmNlcyBlbSBzaG91bGQgc2tpcCBvdmVyIFt0aXRsZV0obGluayksIGBjb2RlYCwgPGh0bWw+XG5pbmxpbmUuYmxvY2tTa2lwID0gL1xcW1teXFxdXSo/XFxdXFwoW15cXCldKj9cXCl8YFteYF0qP2B8PFtePl0qPz4vZztcbi8vIGxvb2tiZWhpbmQgaXMgbm90IGF2YWlsYWJsZSBvbiBTYWZhcmkgYXMgb2YgdmVyc2lvbiAxNlxuLy8gaW5saW5lLmVzY2FwZWRFbVN0ID0gLyg/PD0oPzpefFteXFxcXCkoPzpcXFxcW15dKSopXFxcXFsqX10vZztcbmlubGluZS5lc2NhcGVkRW1TdCA9IC8oPzpefFteXFxcXF0pKD86XFxcXFxcXFwpKlxcXFxbKl9dL2c7XG5cbmlubGluZS5fY29tbWVudCA9IGVkaXQoYmxvY2suX2NvbW1lbnQpLnJlcGxhY2UoJyg/Oi0tPnwkKScsICctLT4nKS5nZXRSZWdleCgpO1xuXG5pbmxpbmUuZW1TdHJvbmcubERlbGltID0gZWRpdChpbmxpbmUuZW1TdHJvbmcubERlbGltKVxuICAucmVwbGFjZSgvcHVuY3QvZywgaW5saW5lLl9wdW5jdHVhdGlvbilcbiAgLmdldFJlZ2V4KCk7XG5cbmlubGluZS5lbVN0cm9uZy5yRGVsaW1Bc3QgPSBlZGl0KGlubGluZS5lbVN0cm9uZy5yRGVsaW1Bc3QsICdnJylcbiAgLnJlcGxhY2UoL3B1bmN0L2csIGlubGluZS5fcHVuY3R1YXRpb24pXG4gIC5nZXRSZWdleCgpO1xuXG5pbmxpbmUuZW1TdHJvbmcuckRlbGltVW5kID0gZWRpdChpbmxpbmUuZW1TdHJvbmcuckRlbGltVW5kLCAnZycpXG4gIC5yZXBsYWNlKC9wdW5jdC9nLCBpbmxpbmUuX3B1bmN0dWF0aW9uKVxuICAuZ2V0UmVnZXgoKTtcblxuaW5saW5lLl9lc2NhcGVzID0gL1xcXFwoWyFcIiMkJSYnKCkqKyxcXC0uLzo7PD0+P0BcXFtcXF1cXFxcXl9ge3x9fl0pL2c7XG5cbmlubGluZS5fc2NoZW1lID0gL1thLXpBLVpdW2EtekEtWjAtOSsuLV17MSwzMX0vO1xuaW5saW5lLl9lbWFpbCA9IC9bYS16QS1aMC05LiEjJCUmJyorLz0/Xl9ge3x9fi1dKyhAKVthLXpBLVowLTldKD86W2EtekEtWjAtOS1dezAsNjF9W2EtekEtWjAtOV0pPyg/OlxcLlthLXpBLVowLTldKD86W2EtekEtWjAtOS1dezAsNjF9W2EtekEtWjAtOV0pPykrKD8hWy1fXSkvO1xuaW5saW5lLmF1dG9saW5rID0gZWRpdChpbmxpbmUuYXV0b2xpbmspXG4gIC5yZXBsYWNlKCdzY2hlbWUnLCBpbmxpbmUuX3NjaGVtZSlcbiAgLnJlcGxhY2UoJ2VtYWlsJywgaW5saW5lLl9lbWFpbClcbiAgLmdldFJlZ2V4KCk7XG5cbmlubGluZS5fYXR0cmlidXRlID0gL1xccytbYS16QS1aOl9dW1xcdy46LV0qKD86XFxzKj1cXHMqXCJbXlwiXSpcInxcXHMqPVxccyonW14nXSonfFxccyo9XFxzKlteXFxzXCInPTw+YF0rKT8vO1xuXG5pbmxpbmUudGFnID0gZWRpdChpbmxpbmUudGFnKVxuICAucmVwbGFjZSgnY29tbWVudCcsIGlubGluZS5fY29tbWVudClcbiAgLnJlcGxhY2UoJ2F0dHJpYnV0ZScsIGlubGluZS5fYXR0cmlidXRlKVxuICAuZ2V0UmVnZXgoKTtcblxuaW5saW5lLl9sYWJlbCA9IC8oPzpcXFsoPzpcXFxcLnxbXlxcW1xcXVxcXFxdKSpcXF18XFxcXC58YFteYF0qYHxbXlxcW1xcXVxcXFxgXSkqPy87XG5pbmxpbmUuX2hyZWYgPSAvPCg/OlxcXFwufFteXFxuPD5cXFxcXSkrPnxbXlxcc1xceDAwLVxceDFmXSovO1xuaW5saW5lLl90aXRsZSA9IC9cIig/OlxcXFxcIj98W15cIlxcXFxdKSpcInwnKD86XFxcXCc/fFteJ1xcXFxdKSonfFxcKCg/OlxcXFxcXCk/fFteKVxcXFxdKSpcXCkvO1xuXG5pbmxpbmUubGluayA9IGVkaXQoaW5saW5lLmxpbmspXG4gIC5yZXBsYWNlKCdsYWJlbCcsIGlubGluZS5fbGFiZWwpXG4gIC5yZXBsYWNlKCdocmVmJywgaW5saW5lLl9ocmVmKVxuICAucmVwbGFjZSgndGl0bGUnLCBpbmxpbmUuX3RpdGxlKVxuICAuZ2V0UmVnZXgoKTtcblxuaW5saW5lLnJlZmxpbmsgPSBlZGl0KGlubGluZS5yZWZsaW5rKVxuICAucmVwbGFjZSgnbGFiZWwnLCBpbmxpbmUuX2xhYmVsKVxuICAucmVwbGFjZSgncmVmJywgYmxvY2suX2xhYmVsKVxuICAuZ2V0UmVnZXgoKTtcblxuaW5saW5lLm5vbGluayA9IGVkaXQoaW5saW5lLm5vbGluaylcbiAgLnJlcGxhY2UoJ3JlZicsIGJsb2NrLl9sYWJlbClcbiAgLmdldFJlZ2V4KCk7XG5cbmlubGluZS5yZWZsaW5rU2VhcmNoID0gZWRpdChpbmxpbmUucmVmbGlua1NlYXJjaCwgJ2cnKVxuICAucmVwbGFjZSgncmVmbGluaycsIGlubGluZS5yZWZsaW5rKVxuICAucmVwbGFjZSgnbm9saW5rJywgaW5saW5lLm5vbGluaylcbiAgLmdldFJlZ2V4KCk7XG5cbi8qKlxuICogTm9ybWFsIElubGluZSBHcmFtbWFyXG4gKi9cblxuaW5saW5lLm5vcm1hbCA9IG1lcmdlKHt9LCBpbmxpbmUpO1xuXG4vKipcbiAqIFBlZGFudGljIElubGluZSBHcmFtbWFyXG4gKi9cblxuaW5saW5lLnBlZGFudGljID0gbWVyZ2Uoe30sIGlubGluZS5ub3JtYWwsIHtcbiAgc3Ryb25nOiB7XG4gICAgc3RhcnQ6IC9eX198XFwqXFwqLyxcbiAgICBtaWRkbGU6IC9eX18oPz1cXFMpKFtcXHNcXFNdKj9cXFMpX18oPyFfKXxeXFwqXFwqKD89XFxTKShbXFxzXFxTXSo/XFxTKVxcKlxcKig/IVxcKikvLFxuICAgIGVuZEFzdDogL1xcKlxcKig/IVxcKikvZyxcbiAgICBlbmRVbmQ6IC9fXyg/IV8pL2dcbiAgfSxcbiAgZW06IHtcbiAgICBzdGFydDogL15ffFxcKi8sXG4gICAgbWlkZGxlOiAvXigpXFwqKD89XFxTKShbXFxzXFxTXSo/XFxTKVxcKig/IVxcKil8Xl8oPz1cXFMpKFtcXHNcXFNdKj9cXFMpXyg/IV8pLyxcbiAgICBlbmRBc3Q6IC9cXCooPyFcXCopL2csXG4gICAgZW5kVW5kOiAvXyg/IV8pL2dcbiAgfSxcbiAgbGluazogZWRpdCgvXiE/XFxbKGxhYmVsKVxcXVxcKCguKj8pXFwpLylcbiAgICAucmVwbGFjZSgnbGFiZWwnLCBpbmxpbmUuX2xhYmVsKVxuICAgIC5nZXRSZWdleCgpLFxuICByZWZsaW5rOiBlZGl0KC9eIT9cXFsobGFiZWwpXFxdXFxzKlxcWyhbXlxcXV0qKVxcXS8pXG4gICAgLnJlcGxhY2UoJ2xhYmVsJywgaW5saW5lLl9sYWJlbClcbiAgICAuZ2V0UmVnZXgoKVxufSk7XG5cbi8qKlxuICogR0ZNIElubGluZSBHcmFtbWFyXG4gKi9cblxuaW5saW5lLmdmbSA9IG1lcmdlKHt9LCBpbmxpbmUubm9ybWFsLCB7XG4gIGVzY2FwZTogZWRpdChpbmxpbmUuZXNjYXBlKS5yZXBsYWNlKCddKScsICd+fF0pJykuZ2V0UmVnZXgoKSxcbiAgX2V4dGVuZGVkX2VtYWlsOiAvW0EtWmEtejAtOS5fKy1dKyhAKVthLXpBLVowLTktX10rKD86XFwuW2EtekEtWjAtOS1fXSpbYS16QS1aMC05XSkrKD8hWy1fXSkvLFxuICB1cmw6IC9eKCg/OmZ0cHxodHRwcz8pOlxcL1xcL3x3d3dcXC4pKD86W2EtekEtWjAtOVxcLV0rXFwuPykrW15cXHM8XSp8XmVtYWlsLyxcbiAgX2JhY2twZWRhbDogLyg/OltePyEuLDo7Kl8nXCJ+KCkmXSt8XFwoW14pXSpcXCl8Jig/IVthLXpBLVowLTldKzskKXxbPyEuLDo7Kl8nXCJ+KV0rKD8hJCkpKy8sXG4gIGRlbDogL14ofn4/KSg/PVteXFxzfl0pKFtcXHNcXFNdKj9bXlxcc35dKVxcMSg/PVtefl18JCkvLFxuICB0ZXh0OiAvXihbYH5dK3xbXmB+XSkoPzooPz0gezIsfVxcbil8KD89W2EtekEtWjAtOS4hIyQlJicqK1xcLz0/X2B7XFx8fX4tXStAKXxbXFxzXFxTXSo/KD86KD89W1xcXFw8IVxcW2Aqfl9dfFxcYl98aHR0cHM/OlxcL1xcL3xmdHA6XFwvXFwvfHd3d1xcLnwkKXxbXiBdKD89IHsyLH1cXG4pfFteYS16QS1aMC05LiEjJCUmJyorXFwvPT9fYHtcXHx9fi1dKD89W2EtekEtWjAtOS4hIyQlJicqK1xcLz0/X2B7XFx8fX4tXStAKSkpL1xufSk7XG5cbmlubGluZS5nZm0udXJsID0gZWRpdChpbmxpbmUuZ2ZtLnVybCwgJ2knKVxuICAucmVwbGFjZSgnZW1haWwnLCBpbmxpbmUuZ2ZtLl9leHRlbmRlZF9lbWFpbClcbiAgLmdldFJlZ2V4KCk7XG4vKipcbiAqIEdGTSArIExpbmUgQnJlYWtzIElubGluZSBHcmFtbWFyXG4gKi9cblxuaW5saW5lLmJyZWFrcyA9IG1lcmdlKHt9LCBpbmxpbmUuZ2ZtLCB7XG4gIGJyOiBlZGl0KGlubGluZS5icikucmVwbGFjZSgnezIsfScsICcqJykuZ2V0UmVnZXgoKSxcbiAgdGV4dDogZWRpdChpbmxpbmUuZ2ZtLnRleHQpXG4gICAgLnJlcGxhY2UoJ1xcXFxiXycsICdcXFxcYl98IHsyLH1cXFxcbicpXG4gICAgLnJlcGxhY2UoL1xcezIsXFx9L2csICcqJylcbiAgICAuZ2V0UmVnZXgoKVxufSk7XG5cbi8qKlxuICogc21hcnR5cGFudHMgdGV4dCByZXBsYWNlbWVudFxuICogQHBhcmFtIHtzdHJpbmd9IHRleHRcbiAqL1xuZnVuY3Rpb24gc21hcnR5cGFudHModGV4dCkge1xuICByZXR1cm4gdGV4dFxuICAgIC8vIGVtLWRhc2hlc1xuICAgIC5yZXBsYWNlKC8tLS0vZywgJ1xcdTIwMTQnKVxuICAgIC8vIGVuLWRhc2hlc1xuICAgIC5yZXBsYWNlKC8tLS9nLCAnXFx1MjAxMycpXG4gICAgLy8gb3BlbmluZyBzaW5nbGVzXG4gICAgLnJlcGxhY2UoLyhefFstXFx1MjAxNC8oXFxbe1wiXFxzXSknL2csICckMVxcdTIwMTgnKVxuICAgIC8vIGNsb3Npbmcgc2luZ2xlcyAmIGFwb3N0cm9waGVzXG4gICAgLnJlcGxhY2UoLycvZywgJ1xcdTIwMTknKVxuICAgIC8vIG9wZW5pbmcgZG91Ymxlc1xuICAgIC5yZXBsYWNlKC8oXnxbLVxcdTIwMTQvKFxcW3tcXHUyMDE4XFxzXSlcIi9nLCAnJDFcXHUyMDFjJylcbiAgICAvLyBjbG9zaW5nIGRvdWJsZXNcbiAgICAucmVwbGFjZSgvXCIvZywgJ1xcdTIwMWQnKVxuICAgIC8vIGVsbGlwc2VzXG4gICAgLnJlcGxhY2UoL1xcLnszfS9nLCAnXFx1MjAyNicpO1xufVxuXG4vKipcbiAqIG1hbmdsZSBlbWFpbCBhZGRyZXNzZXNcbiAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0XG4gKi9cbmZ1bmN0aW9uIG1hbmdsZSh0ZXh0KSB7XG4gIGxldCBvdXQgPSAnJyxcbiAgICBpLFxuICAgIGNoO1xuXG4gIGNvbnN0IGwgPSB0ZXh0Lmxlbmd0aDtcbiAgZm9yIChpID0gMDsgaSA8IGw7IGkrKykge1xuICAgIGNoID0gdGV4dC5jaGFyQ29kZUF0KGkpO1xuICAgIGlmIChNYXRoLnJhbmRvbSgpID4gMC41KSB7XG4gICAgICBjaCA9ICd4JyArIGNoLnRvU3RyaW5nKDE2KTtcbiAgICB9XG4gICAgb3V0ICs9ICcmIycgKyBjaCArICc7JztcbiAgfVxuXG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQmxvY2sgTGV4ZXJcbiAqL1xuY2xhc3MgTGV4ZXIge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgdGhpcy50b2tlbnMgPSBbXTtcbiAgICB0aGlzLnRva2Vucy5saW5rcyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyB8fCBkZWZhdWx0cztcbiAgICB0aGlzLm9wdGlvbnMudG9rZW5pemVyID0gdGhpcy5vcHRpb25zLnRva2VuaXplciB8fCBuZXcgVG9rZW5pemVyKCk7XG4gICAgdGhpcy50b2tlbml6ZXIgPSB0aGlzLm9wdGlvbnMudG9rZW5pemVyO1xuICAgIHRoaXMudG9rZW5pemVyLm9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG4gICAgdGhpcy50b2tlbml6ZXIubGV4ZXIgPSB0aGlzO1xuICAgIHRoaXMuaW5saW5lUXVldWUgPSBbXTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgaW5MaW5rOiBmYWxzZSxcbiAgICAgIGluUmF3QmxvY2s6IGZhbHNlLFxuICAgICAgdG9wOiB0cnVlXG4gICAgfTtcblxuICAgIGNvbnN0IHJ1bGVzID0ge1xuICAgICAgYmxvY2s6IGJsb2NrLm5vcm1hbCxcbiAgICAgIGlubGluZTogaW5saW5lLm5vcm1hbFxuICAgIH07XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLnBlZGFudGljKSB7XG4gICAgICBydWxlcy5ibG9jayA9IGJsb2NrLnBlZGFudGljO1xuICAgICAgcnVsZXMuaW5saW5lID0gaW5saW5lLnBlZGFudGljO1xuICAgIH0gZWxzZSBpZiAodGhpcy5vcHRpb25zLmdmbSkge1xuICAgICAgcnVsZXMuYmxvY2sgPSBibG9jay5nZm07XG4gICAgICBpZiAodGhpcy5vcHRpb25zLmJyZWFrcykge1xuICAgICAgICBydWxlcy5pbmxpbmUgPSBpbmxpbmUuYnJlYWtzO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcnVsZXMuaW5saW5lID0gaW5saW5lLmdmbTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy50b2tlbml6ZXIucnVsZXMgPSBydWxlcztcbiAgfVxuXG4gIC8qKlxuICAgKiBFeHBvc2UgUnVsZXNcbiAgICovXG4gIHN0YXRpYyBnZXQgcnVsZXMoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGJsb2NrLFxuICAgICAgaW5saW5lXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGF0aWMgTGV4IE1ldGhvZFxuICAgKi9cbiAgc3RhdGljIGxleChzcmMsIG9wdGlvbnMpIHtcbiAgICBjb25zdCBsZXhlciA9IG5ldyBMZXhlcihvcHRpb25zKTtcbiAgICByZXR1cm4gbGV4ZXIubGV4KHNyYyk7XG4gIH1cblxuICAvKipcbiAgICogU3RhdGljIExleCBJbmxpbmUgTWV0aG9kXG4gICAqL1xuICBzdGF0aWMgbGV4SW5saW5lKHNyYywgb3B0aW9ucykge1xuICAgIGNvbnN0IGxleGVyID0gbmV3IExleGVyKG9wdGlvbnMpO1xuICAgIHJldHVybiBsZXhlci5pbmxpbmVUb2tlbnMoc3JjKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQcmVwcm9jZXNzaW5nXG4gICAqL1xuICBsZXgoc3JjKSB7XG4gICAgc3JjID0gc3JjXG4gICAgICAucmVwbGFjZSgvXFxyXFxufFxcci9nLCAnXFxuJyk7XG5cbiAgICB0aGlzLmJsb2NrVG9rZW5zKHNyYywgdGhpcy50b2tlbnMpO1xuXG4gICAgbGV0IG5leHQ7XG4gICAgd2hpbGUgKG5leHQgPSB0aGlzLmlubGluZVF1ZXVlLnNoaWZ0KCkpIHtcbiAgICAgIHRoaXMuaW5saW5lVG9rZW5zKG5leHQuc3JjLCBuZXh0LnRva2Vucyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMudG9rZW5zO1xuICB9XG5cbiAgLyoqXG4gICAqIExleGluZ1xuICAgKi9cbiAgYmxvY2tUb2tlbnMoc3JjLCB0b2tlbnMgPSBbXSkge1xuICAgIGlmICh0aGlzLm9wdGlvbnMucGVkYW50aWMpIHtcbiAgICAgIHNyYyA9IHNyYy5yZXBsYWNlKC9cXHQvZywgJyAgICAnKS5yZXBsYWNlKC9eICskL2dtLCAnJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNyYyA9IHNyYy5yZXBsYWNlKC9eKCAqKShcXHQrKS9nbSwgKF8sIGxlYWRpbmcsIHRhYnMpID0+IHtcbiAgICAgICAgcmV0dXJuIGxlYWRpbmcgKyAnICAgICcucmVwZWF0KHRhYnMubGVuZ3RoKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGxldCB0b2tlbiwgbGFzdFRva2VuLCBjdXRTcmMsIGxhc3RQYXJhZ3JhcGhDbGlwcGVkO1xuXG4gICAgd2hpbGUgKHNyYykge1xuICAgICAgaWYgKHRoaXMub3B0aW9ucy5leHRlbnNpb25zXG4gICAgICAgICYmIHRoaXMub3B0aW9ucy5leHRlbnNpb25zLmJsb2NrXG4gICAgICAgICYmIHRoaXMub3B0aW9ucy5leHRlbnNpb25zLmJsb2NrLnNvbWUoKGV4dFRva2VuaXplcikgPT4ge1xuICAgICAgICAgIGlmICh0b2tlbiA9IGV4dFRva2VuaXplci5jYWxsKHsgbGV4ZXI6IHRoaXMgfSwgc3JjLCB0b2tlbnMpKSB7XG4gICAgICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSkpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIG5ld2xpbmVcbiAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLnNwYWNlKHNyYykpIHtcbiAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgaWYgKHRva2VuLnJhdy5sZW5ndGggPT09IDEgJiYgdG9rZW5zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAvLyBpZiB0aGVyZSdzIGEgc2luZ2xlIFxcbiBhcyBhIHNwYWNlciwgaXQncyB0ZXJtaW5hdGluZyB0aGUgbGFzdCBsaW5lLFxuICAgICAgICAgIC8vIHNvIG1vdmUgaXQgdGhlcmUgc28gdGhhdCB3ZSBkb24ndCBnZXQgdW5lY2Vzc2FyeSBwYXJhZ3JhcGggdGFnc1xuICAgICAgICAgIHRva2Vuc1t0b2tlbnMubGVuZ3RoIC0gMV0ucmF3ICs9ICdcXG4nO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgfVxuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gY29kZVxuICAgICAgaWYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIuY29kZShzcmMpKSB7XG4gICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgIGxhc3RUb2tlbiA9IHRva2Vuc1t0b2tlbnMubGVuZ3RoIC0gMV07XG4gICAgICAgIC8vIEFuIGluZGVudGVkIGNvZGUgYmxvY2sgY2Fubm90IGludGVycnVwdCBhIHBhcmFncmFwaC5cbiAgICAgICAgaWYgKGxhc3RUb2tlbiAmJiAobGFzdFRva2VuLnR5cGUgPT09ICdwYXJhZ3JhcGgnIHx8IGxhc3RUb2tlbi50eXBlID09PSAndGV4dCcpKSB7XG4gICAgICAgICAgbGFzdFRva2VuLnJhdyArPSAnXFxuJyArIHRva2VuLnJhdztcbiAgICAgICAgICBsYXN0VG9rZW4udGV4dCArPSAnXFxuJyArIHRva2VuLnRleHQ7XG4gICAgICAgICAgdGhpcy5pbmxpbmVRdWV1ZVt0aGlzLmlubGluZVF1ZXVlLmxlbmd0aCAtIDFdLnNyYyA9IGxhc3RUb2tlbi50ZXh0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgfVxuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gZmVuY2VzXG4gICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci5mZW5jZXMoc3JjKSkge1xuICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBoZWFkaW5nXG4gICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci5oZWFkaW5nKHNyYykpIHtcbiAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gaHJcbiAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLmhyKHNyYykpIHtcbiAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gYmxvY2txdW90ZVxuICAgICAgaWYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIuYmxvY2txdW90ZShzcmMpKSB7XG4gICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIGxpc3RcbiAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLmxpc3Qoc3JjKSkge1xuICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBodG1sXG4gICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci5odG1sKHNyYykpIHtcbiAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gZGVmXG4gICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci5kZWYoc3JjKSkge1xuICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICBsYXN0VG9rZW4gPSB0b2tlbnNbdG9rZW5zLmxlbmd0aCAtIDFdO1xuICAgICAgICBpZiAobGFzdFRva2VuICYmIChsYXN0VG9rZW4udHlwZSA9PT0gJ3BhcmFncmFwaCcgfHwgbGFzdFRva2VuLnR5cGUgPT09ICd0ZXh0JykpIHtcbiAgICAgICAgICBsYXN0VG9rZW4ucmF3ICs9ICdcXG4nICsgdG9rZW4ucmF3O1xuICAgICAgICAgIGxhc3RUb2tlbi50ZXh0ICs9ICdcXG4nICsgdG9rZW4ucmF3O1xuICAgICAgICAgIHRoaXMuaW5saW5lUXVldWVbdGhpcy5pbmxpbmVRdWV1ZS5sZW5ndGggLSAxXS5zcmMgPSBsYXN0VG9rZW4udGV4dDtcbiAgICAgICAgfSBlbHNlIGlmICghdGhpcy50b2tlbnMubGlua3NbdG9rZW4udGFnXSkge1xuICAgICAgICAgIHRoaXMudG9rZW5zLmxpbmtzW3Rva2VuLnRhZ10gPSB7XG4gICAgICAgICAgICBocmVmOiB0b2tlbi5ocmVmLFxuICAgICAgICAgICAgdGl0bGU6IHRva2VuLnRpdGxlXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gdGFibGUgKGdmbSlcbiAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLnRhYmxlKHNyYykpIHtcbiAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gbGhlYWRpbmdcbiAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLmxoZWFkaW5nKHNyYykpIHtcbiAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gdG9wLWxldmVsIHBhcmFncmFwaFxuICAgICAgLy8gcHJldmVudCBwYXJhZ3JhcGggY29uc3VtaW5nIGV4dGVuc2lvbnMgYnkgY2xpcHBpbmcgJ3NyYycgdG8gZXh0ZW5zaW9uIHN0YXJ0XG4gICAgICBjdXRTcmMgPSBzcmM7XG4gICAgICBpZiAodGhpcy5vcHRpb25zLmV4dGVuc2lvbnMgJiYgdGhpcy5vcHRpb25zLmV4dGVuc2lvbnMuc3RhcnRCbG9jaykge1xuICAgICAgICBsZXQgc3RhcnRJbmRleCA9IEluZmluaXR5O1xuICAgICAgICBjb25zdCB0ZW1wU3JjID0gc3JjLnNsaWNlKDEpO1xuICAgICAgICBsZXQgdGVtcFN0YXJ0O1xuICAgICAgICB0aGlzLm9wdGlvbnMuZXh0ZW5zaW9ucy5zdGFydEJsb2NrLmZvckVhY2goZnVuY3Rpb24oZ2V0U3RhcnRJbmRleCkge1xuICAgICAgICAgIHRlbXBTdGFydCA9IGdldFN0YXJ0SW5kZXguY2FsbCh7IGxleGVyOiB0aGlzIH0sIHRlbXBTcmMpO1xuICAgICAgICAgIGlmICh0eXBlb2YgdGVtcFN0YXJ0ID09PSAnbnVtYmVyJyAmJiB0ZW1wU3RhcnQgPj0gMCkgeyBzdGFydEluZGV4ID0gTWF0aC5taW4oc3RhcnRJbmRleCwgdGVtcFN0YXJ0KTsgfVxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKHN0YXJ0SW5kZXggPCBJbmZpbml0eSAmJiBzdGFydEluZGV4ID49IDApIHtcbiAgICAgICAgICBjdXRTcmMgPSBzcmMuc3Vic3RyaW5nKDAsIHN0YXJ0SW5kZXggKyAxKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHRoaXMuc3RhdGUudG9wICYmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLnBhcmFncmFwaChjdXRTcmMpKSkge1xuICAgICAgICBsYXN0VG9rZW4gPSB0b2tlbnNbdG9rZW5zLmxlbmd0aCAtIDFdO1xuICAgICAgICBpZiAobGFzdFBhcmFncmFwaENsaXBwZWQgJiYgbGFzdFRva2VuLnR5cGUgPT09ICdwYXJhZ3JhcGgnKSB7XG4gICAgICAgICAgbGFzdFRva2VuLnJhdyArPSAnXFxuJyArIHRva2VuLnJhdztcbiAgICAgICAgICBsYXN0VG9rZW4udGV4dCArPSAnXFxuJyArIHRva2VuLnRleHQ7XG4gICAgICAgICAgdGhpcy5pbmxpbmVRdWV1ZS5wb3AoKTtcbiAgICAgICAgICB0aGlzLmlubGluZVF1ZXVlW3RoaXMuaW5saW5lUXVldWUubGVuZ3RoIC0gMV0uc3JjID0gbGFzdFRva2VuLnRleHQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICB9XG4gICAgICAgIGxhc3RQYXJhZ3JhcGhDbGlwcGVkID0gKGN1dFNyYy5sZW5ndGggIT09IHNyYy5sZW5ndGgpO1xuICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gdGV4dFxuICAgICAgaWYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIudGV4dChzcmMpKSB7XG4gICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgIGxhc3RUb2tlbiA9IHRva2Vuc1t0b2tlbnMubGVuZ3RoIC0gMV07XG4gICAgICAgIGlmIChsYXN0VG9rZW4gJiYgbGFzdFRva2VuLnR5cGUgPT09ICd0ZXh0Jykge1xuICAgICAgICAgIGxhc3RUb2tlbi5yYXcgKz0gJ1xcbicgKyB0b2tlbi5yYXc7XG4gICAgICAgICAgbGFzdFRva2VuLnRleHQgKz0gJ1xcbicgKyB0b2tlbi50ZXh0O1xuICAgICAgICAgIHRoaXMuaW5saW5lUXVldWUucG9wKCk7XG4gICAgICAgICAgdGhpcy5pbmxpbmVRdWV1ZVt0aGlzLmlubGluZVF1ZXVlLmxlbmd0aCAtIDFdLnNyYyA9IGxhc3RUb2tlbi50ZXh0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgfVxuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKHNyYykge1xuICAgICAgICBjb25zdCBlcnJNc2cgPSAnSW5maW5pdGUgbG9vcCBvbiBieXRlOiAnICsgc3JjLmNoYXJDb2RlQXQoMCk7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuc2lsZW50KSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihlcnJNc2cpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJNc2cpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5zdGF0ZS50b3AgPSB0cnVlO1xuICAgIHJldHVybiB0b2tlbnM7XG4gIH1cblxuICBpbmxpbmUoc3JjLCB0b2tlbnMgPSBbXSkge1xuICAgIHRoaXMuaW5saW5lUXVldWUucHVzaCh7IHNyYywgdG9rZW5zIH0pO1xuICAgIHJldHVybiB0b2tlbnM7XG4gIH1cblxuICAvKipcbiAgICogTGV4aW5nL0NvbXBpbGluZ1xuICAgKi9cbiAgaW5saW5lVG9rZW5zKHNyYywgdG9rZW5zID0gW10pIHtcbiAgICBsZXQgdG9rZW4sIGxhc3RUb2tlbiwgY3V0U3JjO1xuXG4gICAgLy8gU3RyaW5nIHdpdGggbGlua3MgbWFza2VkIHRvIGF2b2lkIGludGVyZmVyZW5jZSB3aXRoIGVtIGFuZCBzdHJvbmdcbiAgICBsZXQgbWFza2VkU3JjID0gc3JjO1xuICAgIGxldCBtYXRjaDtcbiAgICBsZXQga2VlcFByZXZDaGFyLCBwcmV2Q2hhcjtcblxuICAgIC8vIE1hc2sgb3V0IHJlZmxpbmtzXG4gICAgaWYgKHRoaXMudG9rZW5zLmxpbmtzKSB7XG4gICAgICBjb25zdCBsaW5rcyA9IE9iamVjdC5rZXlzKHRoaXMudG9rZW5zLmxpbmtzKTtcbiAgICAgIGlmIChsaW5rcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHdoaWxlICgobWF0Y2ggPSB0aGlzLnRva2VuaXplci5ydWxlcy5pbmxpbmUucmVmbGlua1NlYXJjaC5leGVjKG1hc2tlZFNyYykpICE9IG51bGwpIHtcbiAgICAgICAgICBpZiAobGlua3MuaW5jbHVkZXMobWF0Y2hbMF0uc2xpY2UobWF0Y2hbMF0ubGFzdEluZGV4T2YoJ1snKSArIDEsIC0xKSkpIHtcbiAgICAgICAgICAgIG1hc2tlZFNyYyA9IG1hc2tlZFNyYy5zbGljZSgwLCBtYXRjaC5pbmRleCkgKyAnWycgKyByZXBlYXRTdHJpbmcoJ2EnLCBtYXRjaFswXS5sZW5ndGggLSAyKSArICddJyArIG1hc2tlZFNyYy5zbGljZSh0aGlzLnRva2VuaXplci5ydWxlcy5pbmxpbmUucmVmbGlua1NlYXJjaC5sYXN0SW5kZXgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICAvLyBNYXNrIG91dCBvdGhlciBibG9ja3NcbiAgICB3aGlsZSAoKG1hdGNoID0gdGhpcy50b2tlbml6ZXIucnVsZXMuaW5saW5lLmJsb2NrU2tpcC5leGVjKG1hc2tlZFNyYykpICE9IG51bGwpIHtcbiAgICAgIG1hc2tlZFNyYyA9IG1hc2tlZFNyYy5zbGljZSgwLCBtYXRjaC5pbmRleCkgKyAnWycgKyByZXBlYXRTdHJpbmcoJ2EnLCBtYXRjaFswXS5sZW5ndGggLSAyKSArICddJyArIG1hc2tlZFNyYy5zbGljZSh0aGlzLnRva2VuaXplci5ydWxlcy5pbmxpbmUuYmxvY2tTa2lwLmxhc3RJbmRleCk7XG4gICAgfVxuXG4gICAgLy8gTWFzayBvdXQgZXNjYXBlZCBlbSAmIHN0cm9uZyBkZWxpbWl0ZXJzXG4gICAgd2hpbGUgKChtYXRjaCA9IHRoaXMudG9rZW5pemVyLnJ1bGVzLmlubGluZS5lc2NhcGVkRW1TdC5leGVjKG1hc2tlZFNyYykpICE9IG51bGwpIHtcbiAgICAgIG1hc2tlZFNyYyA9IG1hc2tlZFNyYy5zbGljZSgwLCBtYXRjaC5pbmRleCArIG1hdGNoWzBdLmxlbmd0aCAtIDIpICsgJysrJyArIG1hc2tlZFNyYy5zbGljZSh0aGlzLnRva2VuaXplci5ydWxlcy5pbmxpbmUuZXNjYXBlZEVtU3QubGFzdEluZGV4KTtcbiAgICAgIHRoaXMudG9rZW5pemVyLnJ1bGVzLmlubGluZS5lc2NhcGVkRW1TdC5sYXN0SW5kZXgtLTtcbiAgICB9XG5cbiAgICB3aGlsZSAoc3JjKSB7XG4gICAgICBpZiAoIWtlZXBQcmV2Q2hhcikge1xuICAgICAgICBwcmV2Q2hhciA9ICcnO1xuICAgICAgfVxuICAgICAga2VlcFByZXZDaGFyID0gZmFsc2U7XG5cbiAgICAgIC8vIGV4dGVuc2lvbnNcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuZXh0ZW5zaW9uc1xuICAgICAgICAmJiB0aGlzLm9wdGlvbnMuZXh0ZW5zaW9ucy5pbmxpbmVcbiAgICAgICAgJiYgdGhpcy5vcHRpb25zLmV4dGVuc2lvbnMuaW5saW5lLnNvbWUoKGV4dFRva2VuaXplcikgPT4ge1xuICAgICAgICAgIGlmICh0b2tlbiA9IGV4dFRva2VuaXplci5jYWxsKHsgbGV4ZXI6IHRoaXMgfSwgc3JjLCB0b2tlbnMpKSB7XG4gICAgICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSkpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIGVzY2FwZVxuICAgICAgaWYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIuZXNjYXBlKHNyYykpIHtcbiAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gdGFnXG4gICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci50YWcoc3JjKSkge1xuICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICBsYXN0VG9rZW4gPSB0b2tlbnNbdG9rZW5zLmxlbmd0aCAtIDFdO1xuICAgICAgICBpZiAobGFzdFRva2VuICYmIHRva2VuLnR5cGUgPT09ICd0ZXh0JyAmJiBsYXN0VG9rZW4udHlwZSA9PT0gJ3RleHQnKSB7XG4gICAgICAgICAgbGFzdFRva2VuLnJhdyArPSB0b2tlbi5yYXc7XG4gICAgICAgICAgbGFzdFRva2VuLnRleHQgKz0gdG9rZW4udGV4dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgIH1cbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIGxpbmtcbiAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLmxpbmsoc3JjKSkge1xuICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyByZWZsaW5rLCBub2xpbmtcbiAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLnJlZmxpbmsoc3JjLCB0aGlzLnRva2Vucy5saW5rcykpIHtcbiAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgbGFzdFRva2VuID0gdG9rZW5zW3Rva2Vucy5sZW5ndGggLSAxXTtcbiAgICAgICAgaWYgKGxhc3RUb2tlbiAmJiB0b2tlbi50eXBlID09PSAndGV4dCcgJiYgbGFzdFRva2VuLnR5cGUgPT09ICd0ZXh0Jykge1xuICAgICAgICAgIGxhc3RUb2tlbi5yYXcgKz0gdG9rZW4ucmF3O1xuICAgICAgICAgIGxhc3RUb2tlbi50ZXh0ICs9IHRva2VuLnRleHQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICB9XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBlbSAmIHN0cm9uZ1xuICAgICAgaWYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIuZW1TdHJvbmcoc3JjLCBtYXNrZWRTcmMsIHByZXZDaGFyKSkge1xuICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBjb2RlXG4gICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci5jb2Rlc3BhbihzcmMpKSB7XG4gICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIGJyXG4gICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci5icihzcmMpKSB7XG4gICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIGRlbCAoZ2ZtKVxuICAgICAgaWYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIuZGVsKHNyYykpIHtcbiAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gYXV0b2xpbmtcbiAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLmF1dG9saW5rKHNyYywgbWFuZ2xlKSkge1xuICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyB1cmwgKGdmbSlcbiAgICAgIGlmICghdGhpcy5zdGF0ZS5pbkxpbmsgJiYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIudXJsKHNyYywgbWFuZ2xlKSkpIHtcbiAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gdGV4dFxuICAgICAgLy8gcHJldmVudCBpbmxpbmVUZXh0IGNvbnN1bWluZyBleHRlbnNpb25zIGJ5IGNsaXBwaW5nICdzcmMnIHRvIGV4dGVuc2lvbiBzdGFydFxuICAgICAgY3V0U3JjID0gc3JjO1xuICAgICAgaWYgKHRoaXMub3B0aW9ucy5leHRlbnNpb25zICYmIHRoaXMub3B0aW9ucy5leHRlbnNpb25zLnN0YXJ0SW5saW5lKSB7XG4gICAgICAgIGxldCBzdGFydEluZGV4ID0gSW5maW5pdHk7XG4gICAgICAgIGNvbnN0IHRlbXBTcmMgPSBzcmMuc2xpY2UoMSk7XG4gICAgICAgIGxldCB0ZW1wU3RhcnQ7XG4gICAgICAgIHRoaXMub3B0aW9ucy5leHRlbnNpb25zLnN0YXJ0SW5saW5lLmZvckVhY2goZnVuY3Rpb24oZ2V0U3RhcnRJbmRleCkge1xuICAgICAgICAgIHRlbXBTdGFydCA9IGdldFN0YXJ0SW5kZXguY2FsbCh7IGxleGVyOiB0aGlzIH0sIHRlbXBTcmMpO1xuICAgICAgICAgIGlmICh0eXBlb2YgdGVtcFN0YXJ0ID09PSAnbnVtYmVyJyAmJiB0ZW1wU3RhcnQgPj0gMCkgeyBzdGFydEluZGV4ID0gTWF0aC5taW4oc3RhcnRJbmRleCwgdGVtcFN0YXJ0KTsgfVxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKHN0YXJ0SW5kZXggPCBJbmZpbml0eSAmJiBzdGFydEluZGV4ID49IDApIHtcbiAgICAgICAgICBjdXRTcmMgPSBzcmMuc3Vic3RyaW5nKDAsIHN0YXJ0SW5kZXggKyAxKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIuaW5saW5lVGV4dChjdXRTcmMsIHNtYXJ0eXBhbnRzKSkge1xuICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICBpZiAodG9rZW4ucmF3LnNsaWNlKC0xKSAhPT0gJ18nKSB7IC8vIFRyYWNrIHByZXZDaGFyIGJlZm9yZSBzdHJpbmcgb2YgX19fXyBzdGFydGVkXG4gICAgICAgICAgcHJldkNoYXIgPSB0b2tlbi5yYXcuc2xpY2UoLTEpO1xuICAgICAgICB9XG4gICAgICAgIGtlZXBQcmV2Q2hhciA9IHRydWU7XG4gICAgICAgIGxhc3RUb2tlbiA9IHRva2Vuc1t0b2tlbnMubGVuZ3RoIC0gMV07XG4gICAgICAgIGlmIChsYXN0VG9rZW4gJiYgbGFzdFRva2VuLnR5cGUgPT09ICd0ZXh0Jykge1xuICAgICAgICAgIGxhc3RUb2tlbi5yYXcgKz0gdG9rZW4ucmF3O1xuICAgICAgICAgIGxhc3RUb2tlbi50ZXh0ICs9IHRva2VuLnRleHQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICB9XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAoc3JjKSB7XG4gICAgICAgIGNvbnN0IGVyck1zZyA9ICdJbmZpbml0ZSBsb29wIG9uIGJ5dGU6ICcgKyBzcmMuY2hhckNvZGVBdCgwKTtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5zaWxlbnQpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGVyck1zZyk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVyck1zZyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdG9rZW5zO1xuICB9XG59XG5cbi8qKlxuICogUmVuZGVyZXJcbiAqL1xuY2xhc3MgUmVuZGVyZXIge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyB8fCBkZWZhdWx0cztcbiAgfVxuXG4gIGNvZGUoY29kZSwgaW5mb3N0cmluZywgZXNjYXBlZCkge1xuICAgIGNvbnN0IGxhbmcgPSAoaW5mb3N0cmluZyB8fCAnJykubWF0Y2goL1xcUyovKVswXTtcbiAgICBpZiAodGhpcy5vcHRpb25zLmhpZ2hsaWdodCkge1xuICAgICAgY29uc3Qgb3V0ID0gdGhpcy5vcHRpb25zLmhpZ2hsaWdodChjb2RlLCBsYW5nKTtcbiAgICAgIGlmIChvdXQgIT0gbnVsbCAmJiBvdXQgIT09IGNvZGUpIHtcbiAgICAgICAgZXNjYXBlZCA9IHRydWU7XG4gICAgICAgIGNvZGUgPSBvdXQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29kZSA9IGNvZGUucmVwbGFjZSgvXFxuJC8sICcnKSArICdcXG4nO1xuXG4gICAgaWYgKCFsYW5nKSB7XG4gICAgICByZXR1cm4gJzxwcmU+PGNvZGU+J1xuICAgICAgICArIChlc2NhcGVkID8gY29kZSA6IGVzY2FwZShjb2RlLCB0cnVlKSlcbiAgICAgICAgKyAnPC9jb2RlPjwvcHJlPlxcbic7XG4gICAgfVxuXG4gICAgcmV0dXJuICc8cHJlPjxjb2RlIGNsYXNzPVwiJ1xuICAgICAgKyB0aGlzLm9wdGlvbnMubGFuZ1ByZWZpeFxuICAgICAgKyBlc2NhcGUobGFuZylcbiAgICAgICsgJ1wiPidcbiAgICAgICsgKGVzY2FwZWQgPyBjb2RlIDogZXNjYXBlKGNvZGUsIHRydWUpKVxuICAgICAgKyAnPC9jb2RlPjwvcHJlPlxcbic7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IHF1b3RlXG4gICAqL1xuICBibG9ja3F1b3RlKHF1b3RlKSB7XG4gICAgcmV0dXJuIGA8YmxvY2txdW90ZT5cXG4ke3F1b3RlfTwvYmxvY2txdW90ZT5cXG5gO1xuICB9XG5cbiAgaHRtbChodG1sKSB7XG4gICAgcmV0dXJuIGh0bWw7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IHRleHRcbiAgICogQHBhcmFtIHtzdHJpbmd9IGxldmVsXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByYXdcbiAgICogQHBhcmFtIHthbnl9IHNsdWdnZXJcbiAgICovXG4gIGhlYWRpbmcodGV4dCwgbGV2ZWwsIHJhdywgc2x1Z2dlcikge1xuICAgIGlmICh0aGlzLm9wdGlvbnMuaGVhZGVySWRzKSB7XG4gICAgICBjb25zdCBpZCA9IHRoaXMub3B0aW9ucy5oZWFkZXJQcmVmaXggKyBzbHVnZ2VyLnNsdWcocmF3KTtcbiAgICAgIHJldHVybiBgPGgke2xldmVsfSBpZD1cIiR7aWR9XCI+JHt0ZXh0fTwvaCR7bGV2ZWx9PlxcbmA7XG4gICAgfVxuXG4gICAgLy8gaWdub3JlIElEc1xuICAgIHJldHVybiBgPGgke2xldmVsfT4ke3RleHR9PC9oJHtsZXZlbH0+XFxuYDtcbiAgfVxuXG4gIGhyKCkge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnMueGh0bWwgPyAnPGhyLz5cXG4nIDogJzxocj5cXG4nO1xuICB9XG5cbiAgbGlzdChib2R5LCBvcmRlcmVkLCBzdGFydCkge1xuICAgIGNvbnN0IHR5cGUgPSBvcmRlcmVkID8gJ29sJyA6ICd1bCcsXG4gICAgICBzdGFydGF0dCA9IChvcmRlcmVkICYmIHN0YXJ0ICE9PSAxKSA/ICgnIHN0YXJ0PVwiJyArIHN0YXJ0ICsgJ1wiJykgOiAnJztcbiAgICByZXR1cm4gJzwnICsgdHlwZSArIHN0YXJ0YXR0ICsgJz5cXG4nICsgYm9keSArICc8LycgKyB0eXBlICsgJz5cXG4nO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0XG4gICAqL1xuICBsaXN0aXRlbSh0ZXh0KSB7XG4gICAgcmV0dXJuIGA8bGk+JHt0ZXh0fTwvbGk+XFxuYDtcbiAgfVxuXG4gIGNoZWNrYm94KGNoZWNrZWQpIHtcbiAgICByZXR1cm4gJzxpbnB1dCAnXG4gICAgICArIChjaGVja2VkID8gJ2NoZWNrZWQ9XCJcIiAnIDogJycpXG4gICAgICArICdkaXNhYmxlZD1cIlwiIHR5cGU9XCJjaGVja2JveFwiJ1xuICAgICAgKyAodGhpcy5vcHRpb25zLnhodG1sID8gJyAvJyA6ICcnKVxuICAgICAgKyAnPiAnO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0XG4gICAqL1xuICBwYXJhZ3JhcGgodGV4dCkge1xuICAgIHJldHVybiBgPHA+JHt0ZXh0fTwvcD5cXG5gO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBoZWFkZXJcbiAgICogQHBhcmFtIHtzdHJpbmd9IGJvZHlcbiAgICovXG4gIHRhYmxlKGhlYWRlciwgYm9keSkge1xuICAgIGlmIChib2R5KSBib2R5ID0gYDx0Ym9keT4ke2JvZHl9PC90Ym9keT5gO1xuXG4gICAgcmV0dXJuICc8dGFibGU+XFxuJ1xuICAgICAgKyAnPHRoZWFkPlxcbidcbiAgICAgICsgaGVhZGVyXG4gICAgICArICc8L3RoZWFkPlxcbidcbiAgICAgICsgYm9keVxuICAgICAgKyAnPC90YWJsZT5cXG4nO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBjb250ZW50XG4gICAqL1xuICB0YWJsZXJvdyhjb250ZW50KSB7XG4gICAgcmV0dXJuIGA8dHI+XFxuJHtjb250ZW50fTwvdHI+XFxuYDtcbiAgfVxuXG4gIHRhYmxlY2VsbChjb250ZW50LCBmbGFncykge1xuICAgIGNvbnN0IHR5cGUgPSBmbGFncy5oZWFkZXIgPyAndGgnIDogJ3RkJztcbiAgICBjb25zdCB0YWcgPSBmbGFncy5hbGlnblxuICAgICAgPyBgPCR7dHlwZX0gYWxpZ249XCIke2ZsYWdzLmFsaWdufVwiPmBcbiAgICAgIDogYDwke3R5cGV9PmA7XG4gICAgcmV0dXJuIHRhZyArIGNvbnRlbnQgKyBgPC8ke3R5cGV9PlxcbmA7XG4gIH1cblxuICAvKipcbiAgICogc3BhbiBsZXZlbCByZW5kZXJlclxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGV4dFxuICAgKi9cbiAgc3Ryb25nKHRleHQpIHtcbiAgICByZXR1cm4gYDxzdHJvbmc+JHt0ZXh0fTwvc3Ryb25nPmA7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IHRleHRcbiAgICovXG4gIGVtKHRleHQpIHtcbiAgICByZXR1cm4gYDxlbT4ke3RleHR9PC9lbT5gO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0XG4gICAqL1xuICBjb2Rlc3Bhbih0ZXh0KSB7XG4gICAgcmV0dXJuIGA8Y29kZT4ke3RleHR9PC9jb2RlPmA7XG4gIH1cblxuICBicigpIHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLnhodG1sID8gJzxici8+JyA6ICc8YnI+JztcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGV4dFxuICAgKi9cbiAgZGVsKHRleHQpIHtcbiAgICByZXR1cm4gYDxkZWw+JHt0ZXh0fTwvZGVsPmA7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IGhyZWZcbiAgICogQHBhcmFtIHtzdHJpbmd9IHRpdGxlXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0XG4gICAqL1xuICBsaW5rKGhyZWYsIHRpdGxlLCB0ZXh0KSB7XG4gICAgaHJlZiA9IGNsZWFuVXJsKHRoaXMub3B0aW9ucy5zYW5pdGl6ZSwgdGhpcy5vcHRpb25zLmJhc2VVcmwsIGhyZWYpO1xuICAgIGlmIChocmVmID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gdGV4dDtcbiAgICB9XG4gICAgbGV0IG91dCA9ICc8YSBocmVmPVwiJyArIGhyZWYgKyAnXCInO1xuICAgIGlmICh0aXRsZSkge1xuICAgICAgb3V0ICs9ICcgdGl0bGU9XCInICsgdGl0bGUgKyAnXCInO1xuICAgIH1cbiAgICBvdXQgKz0gJz4nICsgdGV4dCArICc8L2E+JztcbiAgICByZXR1cm4gb3V0O1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBocmVmXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0aXRsZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGV4dFxuICAgKi9cbiAgaW1hZ2UoaHJlZiwgdGl0bGUsIHRleHQpIHtcbiAgICBocmVmID0gY2xlYW5VcmwodGhpcy5vcHRpb25zLnNhbml0aXplLCB0aGlzLm9wdGlvbnMuYmFzZVVybCwgaHJlZik7XG4gICAgaWYgKGhyZWYgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiB0ZXh0O1xuICAgIH1cblxuICAgIGxldCBvdXQgPSBgPGltZyBzcmM9XCIke2hyZWZ9XCIgYWx0PVwiJHt0ZXh0fVwiYDtcbiAgICBpZiAodGl0bGUpIHtcbiAgICAgIG91dCArPSBgIHRpdGxlPVwiJHt0aXRsZX1cImA7XG4gICAgfVxuICAgIG91dCArPSB0aGlzLm9wdGlvbnMueGh0bWwgPyAnLz4nIDogJz4nO1xuICAgIHJldHVybiBvdXQ7XG4gIH1cblxuICB0ZXh0KHRleHQpIHtcbiAgICByZXR1cm4gdGV4dDtcbiAgfVxufVxuXG4vKipcbiAqIFRleHRSZW5kZXJlclxuICogcmV0dXJucyBvbmx5IHRoZSB0ZXh0dWFsIHBhcnQgb2YgdGhlIHRva2VuXG4gKi9cbmNsYXNzIFRleHRSZW5kZXJlciB7XG4gIC8vIG5vIG5lZWQgZm9yIGJsb2NrIGxldmVsIHJlbmRlcmVyc1xuICBzdHJvbmcodGV4dCkge1xuICAgIHJldHVybiB0ZXh0O1xuICB9XG5cbiAgZW0odGV4dCkge1xuICAgIHJldHVybiB0ZXh0O1xuICB9XG5cbiAgY29kZXNwYW4odGV4dCkge1xuICAgIHJldHVybiB0ZXh0O1xuICB9XG5cbiAgZGVsKHRleHQpIHtcbiAgICByZXR1cm4gdGV4dDtcbiAgfVxuXG4gIGh0bWwodGV4dCkge1xuICAgIHJldHVybiB0ZXh0O1xuICB9XG5cbiAgdGV4dCh0ZXh0KSB7XG4gICAgcmV0dXJuIHRleHQ7XG4gIH1cblxuICBsaW5rKGhyZWYsIHRpdGxlLCB0ZXh0KSB7XG4gICAgcmV0dXJuICcnICsgdGV4dDtcbiAgfVxuXG4gIGltYWdlKGhyZWYsIHRpdGxlLCB0ZXh0KSB7XG4gICAgcmV0dXJuICcnICsgdGV4dDtcbiAgfVxuXG4gIGJyKCkge1xuICAgIHJldHVybiAnJztcbiAgfVxufVxuXG4vKipcbiAqIFNsdWdnZXIgZ2VuZXJhdGVzIGhlYWRlciBpZFxuICovXG5jbGFzcyBTbHVnZ2VyIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5zZWVuID0ge307XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlXG4gICAqL1xuICBzZXJpYWxpemUodmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWVcbiAgICAgIC50b0xvd2VyQ2FzZSgpXG4gICAgICAudHJpbSgpXG4gICAgICAvLyByZW1vdmUgaHRtbCB0YWdzXG4gICAgICAucmVwbGFjZSgvPFshXFwvYS16XS4qPz4vaWcsICcnKVxuICAgICAgLy8gcmVtb3ZlIHVud2FudGVkIGNoYXJzXG4gICAgICAucmVwbGFjZSgvW1xcdTIwMDAtXFx1MjA2RlxcdTJFMDAtXFx1MkU3RlxcXFwnIVwiIyQlJigpKissLi86Ozw9Pj9AW1xcXV5ge3x9fl0vZywgJycpXG4gICAgICAucmVwbGFjZSgvXFxzL2csICctJyk7XG4gIH1cblxuICAvKipcbiAgICogRmluZHMgdGhlIG5leHQgc2FmZSAodW5pcXVlKSBzbHVnIHRvIHVzZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gb3JpZ2luYWxTbHVnXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNEcnlSdW5cbiAgICovXG4gIGdldE5leHRTYWZlU2x1ZyhvcmlnaW5hbFNsdWcsIGlzRHJ5UnVuKSB7XG4gICAgbGV0IHNsdWcgPSBvcmlnaW5hbFNsdWc7XG4gICAgbGV0IG9jY3VyZW5jZUFjY3VtdWxhdG9yID0gMDtcbiAgICBpZiAodGhpcy5zZWVuLmhhc093blByb3BlcnR5KHNsdWcpKSB7XG4gICAgICBvY2N1cmVuY2VBY2N1bXVsYXRvciA9IHRoaXMuc2VlbltvcmlnaW5hbFNsdWddO1xuICAgICAgZG8ge1xuICAgICAgICBvY2N1cmVuY2VBY2N1bXVsYXRvcisrO1xuICAgICAgICBzbHVnID0gb3JpZ2luYWxTbHVnICsgJy0nICsgb2NjdXJlbmNlQWNjdW11bGF0b3I7XG4gICAgICB9IHdoaWxlICh0aGlzLnNlZW4uaGFzT3duUHJvcGVydHkoc2x1ZykpO1xuICAgIH1cbiAgICBpZiAoIWlzRHJ5UnVuKSB7XG4gICAgICB0aGlzLnNlZW5bb3JpZ2luYWxTbHVnXSA9IG9jY3VyZW5jZUFjY3VtdWxhdG9yO1xuICAgICAgdGhpcy5zZWVuW3NsdWddID0gMDtcbiAgICB9XG4gICAgcmV0dXJuIHNsdWc7XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydCBzdHJpbmcgdG8gdW5pcXVlIGlkXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cbiAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5kcnlydW5dIEdlbmVyYXRlcyB0aGUgbmV4dCB1bmlxdWUgc2x1ZyB3aXRob3V0XG4gICAqIHVwZGF0aW5nIHRoZSBpbnRlcm5hbCBhY2N1bXVsYXRvci5cbiAgICovXG4gIHNsdWcodmFsdWUsIG9wdGlvbnMgPSB7fSkge1xuICAgIGNvbnN0IHNsdWcgPSB0aGlzLnNlcmlhbGl6ZSh2YWx1ZSk7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TmV4dFNhZmVTbHVnKHNsdWcsIG9wdGlvbnMuZHJ5cnVuKTtcbiAgfVxufVxuXG4vKipcbiAqIFBhcnNpbmcgJiBDb21waWxpbmdcbiAqL1xuY2xhc3MgUGFyc2VyIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHwgZGVmYXVsdHM7XG4gICAgdGhpcy5vcHRpb25zLnJlbmRlcmVyID0gdGhpcy5vcHRpb25zLnJlbmRlcmVyIHx8IG5ldyBSZW5kZXJlcigpO1xuICAgIHRoaXMucmVuZGVyZXIgPSB0aGlzLm9wdGlvbnMucmVuZGVyZXI7XG4gICAgdGhpcy5yZW5kZXJlci5vcHRpb25zID0gdGhpcy5vcHRpb25zO1xuICAgIHRoaXMudGV4dFJlbmRlcmVyID0gbmV3IFRleHRSZW5kZXJlcigpO1xuICAgIHRoaXMuc2x1Z2dlciA9IG5ldyBTbHVnZ2VyKCk7XG4gIH1cblxuICAvKipcbiAgICogU3RhdGljIFBhcnNlIE1ldGhvZFxuICAgKi9cbiAgc3RhdGljIHBhcnNlKHRva2Vucywgb3B0aW9ucykge1xuICAgIGNvbnN0IHBhcnNlciA9IG5ldyBQYXJzZXIob3B0aW9ucyk7XG4gICAgcmV0dXJuIHBhcnNlci5wYXJzZSh0b2tlbnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YXRpYyBQYXJzZSBJbmxpbmUgTWV0aG9kXG4gICAqL1xuICBzdGF0aWMgcGFyc2VJbmxpbmUodG9rZW5zLCBvcHRpb25zKSB7XG4gICAgY29uc3QgcGFyc2VyID0gbmV3IFBhcnNlcihvcHRpb25zKTtcbiAgICByZXR1cm4gcGFyc2VyLnBhcnNlSW5saW5lKHRva2Vucyk7XG4gIH1cblxuICAvKipcbiAgICogUGFyc2UgTG9vcFxuICAgKi9cbiAgcGFyc2UodG9rZW5zLCB0b3AgPSB0cnVlKSB7XG4gICAgbGV0IG91dCA9ICcnLFxuICAgICAgaSxcbiAgICAgIGosXG4gICAgICBrLFxuICAgICAgbDIsXG4gICAgICBsMyxcbiAgICAgIHJvdyxcbiAgICAgIGNlbGwsXG4gICAgICBoZWFkZXIsXG4gICAgICBib2R5LFxuICAgICAgdG9rZW4sXG4gICAgICBvcmRlcmVkLFxuICAgICAgc3RhcnQsXG4gICAgICBsb29zZSxcbiAgICAgIGl0ZW1Cb2R5LFxuICAgICAgaXRlbSxcbiAgICAgIGNoZWNrZWQsXG4gICAgICB0YXNrLFxuICAgICAgY2hlY2tib3gsXG4gICAgICByZXQ7XG5cbiAgICBjb25zdCBsID0gdG9rZW5zLmxlbmd0aDtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgICB0b2tlbiA9IHRva2Vuc1tpXTtcblxuICAgICAgLy8gUnVuIGFueSByZW5kZXJlciBleHRlbnNpb25zXG4gICAgICBpZiAodGhpcy5vcHRpb25zLmV4dGVuc2lvbnMgJiYgdGhpcy5vcHRpb25zLmV4dGVuc2lvbnMucmVuZGVyZXJzICYmIHRoaXMub3B0aW9ucy5leHRlbnNpb25zLnJlbmRlcmVyc1t0b2tlbi50eXBlXSkge1xuICAgICAgICByZXQgPSB0aGlzLm9wdGlvbnMuZXh0ZW5zaW9ucy5yZW5kZXJlcnNbdG9rZW4udHlwZV0uY2FsbCh7IHBhcnNlcjogdGhpcyB9LCB0b2tlbik7XG4gICAgICAgIGlmIChyZXQgIT09IGZhbHNlIHx8ICFbJ3NwYWNlJywgJ2hyJywgJ2hlYWRpbmcnLCAnY29kZScsICd0YWJsZScsICdibG9ja3F1b3RlJywgJ2xpc3QnLCAnaHRtbCcsICdwYXJhZ3JhcGgnLCAndGV4dCddLmluY2x1ZGVzKHRva2VuLnR5cGUpKSB7XG4gICAgICAgICAgb3V0ICs9IHJldCB8fCAnJztcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBzd2l0Y2ggKHRva2VuLnR5cGUpIHtcbiAgICAgICAgY2FzZSAnc3BhY2UnOiB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAnaHInOiB7XG4gICAgICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIuaHIoKTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjYXNlICdoZWFkaW5nJzoge1xuICAgICAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLmhlYWRpbmcoXG4gICAgICAgICAgICB0aGlzLnBhcnNlSW5saW5lKHRva2VuLnRva2VucyksXG4gICAgICAgICAgICB0b2tlbi5kZXB0aCxcbiAgICAgICAgICAgIHVuZXNjYXBlKHRoaXMucGFyc2VJbmxpbmUodG9rZW4udG9rZW5zLCB0aGlzLnRleHRSZW5kZXJlcikpLFxuICAgICAgICAgICAgdGhpcy5zbHVnZ2VyKTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjYXNlICdjb2RlJzoge1xuICAgICAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLmNvZGUodG9rZW4udGV4dCxcbiAgICAgICAgICAgIHRva2VuLmxhbmcsXG4gICAgICAgICAgICB0b2tlbi5lc2NhcGVkKTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjYXNlICd0YWJsZSc6IHtcbiAgICAgICAgICBoZWFkZXIgPSAnJztcblxuICAgICAgICAgIC8vIGhlYWRlclxuICAgICAgICAgIGNlbGwgPSAnJztcbiAgICAgICAgICBsMiA9IHRva2VuLmhlYWRlci5sZW5ndGg7XG4gICAgICAgICAgZm9yIChqID0gMDsgaiA8IGwyOyBqKyspIHtcbiAgICAgICAgICAgIGNlbGwgKz0gdGhpcy5yZW5kZXJlci50YWJsZWNlbGwoXG4gICAgICAgICAgICAgIHRoaXMucGFyc2VJbmxpbmUodG9rZW4uaGVhZGVyW2pdLnRva2VucyksXG4gICAgICAgICAgICAgIHsgaGVhZGVyOiB0cnVlLCBhbGlnbjogdG9rZW4uYWxpZ25bal0gfVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaGVhZGVyICs9IHRoaXMucmVuZGVyZXIudGFibGVyb3coY2VsbCk7XG5cbiAgICAgICAgICBib2R5ID0gJyc7XG4gICAgICAgICAgbDIgPSB0b2tlbi5yb3dzLmxlbmd0aDtcbiAgICAgICAgICBmb3IgKGogPSAwOyBqIDwgbDI7IGorKykge1xuICAgICAgICAgICAgcm93ID0gdG9rZW4ucm93c1tqXTtcblxuICAgICAgICAgICAgY2VsbCA9ICcnO1xuICAgICAgICAgICAgbDMgPSByb3cubGVuZ3RoO1xuICAgICAgICAgICAgZm9yIChrID0gMDsgayA8IGwzOyBrKyspIHtcbiAgICAgICAgICAgICAgY2VsbCArPSB0aGlzLnJlbmRlcmVyLnRhYmxlY2VsbChcbiAgICAgICAgICAgICAgICB0aGlzLnBhcnNlSW5saW5lKHJvd1trXS50b2tlbnMpLFxuICAgICAgICAgICAgICAgIHsgaGVhZGVyOiBmYWxzZSwgYWxpZ246IHRva2VuLmFsaWduW2tdIH1cbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYm9keSArPSB0aGlzLnJlbmRlcmVyLnRhYmxlcm93KGNlbGwpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci50YWJsZShoZWFkZXIsIGJvZHkpO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgJ2Jsb2NrcXVvdGUnOiB7XG4gICAgICAgICAgYm9keSA9IHRoaXMucGFyc2UodG9rZW4udG9rZW5zKTtcbiAgICAgICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5ibG9ja3F1b3RlKGJvZHkpO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgJ2xpc3QnOiB7XG4gICAgICAgICAgb3JkZXJlZCA9IHRva2VuLm9yZGVyZWQ7XG4gICAgICAgICAgc3RhcnQgPSB0b2tlbi5zdGFydDtcbiAgICAgICAgICBsb29zZSA9IHRva2VuLmxvb3NlO1xuICAgICAgICAgIGwyID0gdG9rZW4uaXRlbXMubGVuZ3RoO1xuXG4gICAgICAgICAgYm9keSA9ICcnO1xuICAgICAgICAgIGZvciAoaiA9IDA7IGogPCBsMjsgaisrKSB7XG4gICAgICAgICAgICBpdGVtID0gdG9rZW4uaXRlbXNbal07XG4gICAgICAgICAgICBjaGVja2VkID0gaXRlbS5jaGVja2VkO1xuICAgICAgICAgICAgdGFzayA9IGl0ZW0udGFzaztcblxuICAgICAgICAgICAgaXRlbUJvZHkgPSAnJztcbiAgICAgICAgICAgIGlmIChpdGVtLnRhc2spIHtcbiAgICAgICAgICAgICAgY2hlY2tib3ggPSB0aGlzLnJlbmRlcmVyLmNoZWNrYm94KGNoZWNrZWQpO1xuICAgICAgICAgICAgICBpZiAobG9vc2UpIHtcbiAgICAgICAgICAgICAgICBpZiAoaXRlbS50b2tlbnMubGVuZ3RoID4gMCAmJiBpdGVtLnRva2Vuc1swXS50eXBlID09PSAncGFyYWdyYXBoJykge1xuICAgICAgICAgICAgICAgICAgaXRlbS50b2tlbnNbMF0udGV4dCA9IGNoZWNrYm94ICsgJyAnICsgaXRlbS50b2tlbnNbMF0udGV4dDtcbiAgICAgICAgICAgICAgICAgIGlmIChpdGVtLnRva2Vuc1swXS50b2tlbnMgJiYgaXRlbS50b2tlbnNbMF0udG9rZW5zLmxlbmd0aCA+IDAgJiYgaXRlbS50b2tlbnNbMF0udG9rZW5zWzBdLnR5cGUgPT09ICd0ZXh0Jykge1xuICAgICAgICAgICAgICAgICAgICBpdGVtLnRva2Vuc1swXS50b2tlbnNbMF0udGV4dCA9IGNoZWNrYm94ICsgJyAnICsgaXRlbS50b2tlbnNbMF0udG9rZW5zWzBdLnRleHQ7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIGl0ZW0udG9rZW5zLnVuc2hpZnQoe1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAndGV4dCcsXG4gICAgICAgICAgICAgICAgICAgIHRleHQ6IGNoZWNrYm94XG4gICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaXRlbUJvZHkgKz0gY2hlY2tib3g7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaXRlbUJvZHkgKz0gdGhpcy5wYXJzZShpdGVtLnRva2VucywgbG9vc2UpO1xuICAgICAgICAgICAgYm9keSArPSB0aGlzLnJlbmRlcmVyLmxpc3RpdGVtKGl0ZW1Cb2R5LCB0YXNrLCBjaGVja2VkKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5saXN0KGJvZHksIG9yZGVyZWQsIHN0YXJ0KTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjYXNlICdodG1sJzoge1xuICAgICAgICAgIC8vIFRPRE8gcGFyc2UgaW5saW5lIGNvbnRlbnQgaWYgcGFyYW1ldGVyIG1hcmtkb3duPTFcbiAgICAgICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5odG1sKHRva2VuLnRleHQpO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgJ3BhcmFncmFwaCc6IHtcbiAgICAgICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5wYXJhZ3JhcGgodGhpcy5wYXJzZUlubGluZSh0b2tlbi50b2tlbnMpKTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjYXNlICd0ZXh0Jzoge1xuICAgICAgICAgIGJvZHkgPSB0b2tlbi50b2tlbnMgPyB0aGlzLnBhcnNlSW5saW5lKHRva2VuLnRva2VucykgOiB0b2tlbi50ZXh0O1xuICAgICAgICAgIHdoaWxlIChpICsgMSA8IGwgJiYgdG9rZW5zW2kgKyAxXS50eXBlID09PSAndGV4dCcpIHtcbiAgICAgICAgICAgIHRva2VuID0gdG9rZW5zWysraV07XG4gICAgICAgICAgICBib2R5ICs9ICdcXG4nICsgKHRva2VuLnRva2VucyA/IHRoaXMucGFyc2VJbmxpbmUodG9rZW4udG9rZW5zKSA6IHRva2VuLnRleHQpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBvdXQgKz0gdG9wID8gdGhpcy5yZW5kZXJlci5wYXJhZ3JhcGgoYm9keSkgOiBib2R5O1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgIGNvbnN0IGVyck1zZyA9ICdUb2tlbiB3aXRoIFwiJyArIHRva2VuLnR5cGUgKyAnXCIgdHlwZSB3YXMgbm90IGZvdW5kLic7XG4gICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5zaWxlbnQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyTXNnKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVyck1zZyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dDtcbiAgfVxuXG4gIC8qKlxuICAgKiBQYXJzZSBJbmxpbmUgVG9rZW5zXG4gICAqL1xuICBwYXJzZUlubGluZSh0b2tlbnMsIHJlbmRlcmVyKSB7XG4gICAgcmVuZGVyZXIgPSByZW5kZXJlciB8fCB0aGlzLnJlbmRlcmVyO1xuICAgIGxldCBvdXQgPSAnJyxcbiAgICAgIGksXG4gICAgICB0b2tlbixcbiAgICAgIHJldDtcblxuICAgIGNvbnN0IGwgPSB0b2tlbnMubGVuZ3RoO1xuICAgIGZvciAoaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICAgIHRva2VuID0gdG9rZW5zW2ldO1xuXG4gICAgICAvLyBSdW4gYW55IHJlbmRlcmVyIGV4dGVuc2lvbnNcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuZXh0ZW5zaW9ucyAmJiB0aGlzLm9wdGlvbnMuZXh0ZW5zaW9ucy5yZW5kZXJlcnMgJiYgdGhpcy5vcHRpb25zLmV4dGVuc2lvbnMucmVuZGVyZXJzW3Rva2VuLnR5cGVdKSB7XG4gICAgICAgIHJldCA9IHRoaXMub3B0aW9ucy5leHRlbnNpb25zLnJlbmRlcmVyc1t0b2tlbi50eXBlXS5jYWxsKHsgcGFyc2VyOiB0aGlzIH0sIHRva2VuKTtcbiAgICAgICAgaWYgKHJldCAhPT0gZmFsc2UgfHwgIVsnZXNjYXBlJywgJ2h0bWwnLCAnbGluaycsICdpbWFnZScsICdzdHJvbmcnLCAnZW0nLCAnY29kZXNwYW4nLCAnYnInLCAnZGVsJywgJ3RleHQnXS5pbmNsdWRlcyh0b2tlbi50eXBlKSkge1xuICAgICAgICAgIG91dCArPSByZXQgfHwgJyc7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgc3dpdGNoICh0b2tlbi50eXBlKSB7XG4gICAgICAgIGNhc2UgJ2VzY2FwZSc6IHtcbiAgICAgICAgICBvdXQgKz0gcmVuZGVyZXIudGV4dCh0b2tlbi50ZXh0KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjYXNlICdodG1sJzoge1xuICAgICAgICAgIG91dCArPSByZW5kZXJlci5odG1sKHRva2VuLnRleHQpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgJ2xpbmsnOiB7XG4gICAgICAgICAgb3V0ICs9IHJlbmRlcmVyLmxpbmsodG9rZW4uaHJlZiwgdG9rZW4udGl0bGUsIHRoaXMucGFyc2VJbmxpbmUodG9rZW4udG9rZW5zLCByZW5kZXJlcikpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgJ2ltYWdlJzoge1xuICAgICAgICAgIG91dCArPSByZW5kZXJlci5pbWFnZSh0b2tlbi5ocmVmLCB0b2tlbi50aXRsZSwgdG9rZW4udGV4dCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAnc3Ryb25nJzoge1xuICAgICAgICAgIG91dCArPSByZW5kZXJlci5zdHJvbmcodGhpcy5wYXJzZUlubGluZSh0b2tlbi50b2tlbnMsIHJlbmRlcmVyKSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAnZW0nOiB7XG4gICAgICAgICAgb3V0ICs9IHJlbmRlcmVyLmVtKHRoaXMucGFyc2VJbmxpbmUodG9rZW4udG9rZW5zLCByZW5kZXJlcikpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgJ2NvZGVzcGFuJzoge1xuICAgICAgICAgIG91dCArPSByZW5kZXJlci5jb2Rlc3Bhbih0b2tlbi50ZXh0KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjYXNlICdicic6IHtcbiAgICAgICAgICBvdXQgKz0gcmVuZGVyZXIuYnIoKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjYXNlICdkZWwnOiB7XG4gICAgICAgICAgb3V0ICs9IHJlbmRlcmVyLmRlbCh0aGlzLnBhcnNlSW5saW5lKHRva2VuLnRva2VucywgcmVuZGVyZXIpKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjYXNlICd0ZXh0Jzoge1xuICAgICAgICAgIG91dCArPSByZW5kZXJlci50ZXh0KHRva2VuLnRleHQpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICBjb25zdCBlcnJNc2cgPSAnVG9rZW4gd2l0aCBcIicgKyB0b2tlbi50eXBlICsgJ1wiIHR5cGUgd2FzIG5vdCBmb3VuZC4nO1xuICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuc2lsZW50KSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVyck1zZyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJNc2cpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb3V0O1xuICB9XG59XG5cbi8qKlxuICogTWFya2VkXG4gKi9cbmZ1bmN0aW9uIG1hcmtlZChzcmMsIG9wdCwgY2FsbGJhY2spIHtcbiAgLy8gdGhyb3cgZXJyb3IgaW4gY2FzZSBvZiBub24gc3RyaW5nIGlucHV0XG4gIGlmICh0eXBlb2Ygc3JjID09PSAndW5kZWZpbmVkJyB8fCBzcmMgPT09IG51bGwpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ21hcmtlZCgpOiBpbnB1dCBwYXJhbWV0ZXIgaXMgdW5kZWZpbmVkIG9yIG51bGwnKTtcbiAgfVxuICBpZiAodHlwZW9mIHNyYyAhPT0gJ3N0cmluZycpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ21hcmtlZCgpOiBpbnB1dCBwYXJhbWV0ZXIgaXMgb2YgdHlwZSAnXG4gICAgICArIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChzcmMpICsgJywgc3RyaW5nIGV4cGVjdGVkJyk7XG4gIH1cblxuICBpZiAodHlwZW9mIG9wdCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGNhbGxiYWNrID0gb3B0O1xuICAgIG9wdCA9IG51bGw7XG4gIH1cblxuICBvcHQgPSBtZXJnZSh7fSwgbWFya2VkLmRlZmF1bHRzLCBvcHQgfHwge30pO1xuICBjaGVja1Nhbml0aXplRGVwcmVjYXRpb24ob3B0KTtcblxuICBpZiAoY2FsbGJhY2spIHtcbiAgICBjb25zdCBoaWdobGlnaHQgPSBvcHQuaGlnaGxpZ2h0O1xuICAgIGxldCB0b2tlbnM7XG5cbiAgICB0cnkge1xuICAgICAgdG9rZW5zID0gTGV4ZXIubGV4KHNyYywgb3B0KTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gY2FsbGJhY2soZSk7XG4gICAgfVxuXG4gICAgY29uc3QgZG9uZSA9IGZ1bmN0aW9uKGVycikge1xuICAgICAgbGV0IG91dDtcblxuICAgICAgaWYgKCFlcnIpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBpZiAob3B0LndhbGtUb2tlbnMpIHtcbiAgICAgICAgICAgIG1hcmtlZC53YWxrVG9rZW5zKHRva2Vucywgb3B0LndhbGtUb2tlbnMpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBvdXQgPSBQYXJzZXIucGFyc2UodG9rZW5zLCBvcHQpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgZXJyID0gZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBvcHQuaGlnaGxpZ2h0ID0gaGlnaGxpZ2h0O1xuXG4gICAgICByZXR1cm4gZXJyXG4gICAgICAgID8gY2FsbGJhY2soZXJyKVxuICAgICAgICA6IGNhbGxiYWNrKG51bGwsIG91dCk7XG4gICAgfTtcblxuICAgIGlmICghaGlnaGxpZ2h0IHx8IGhpZ2hsaWdodC5sZW5ndGggPCAzKSB7XG4gICAgICByZXR1cm4gZG9uZSgpO1xuICAgIH1cblxuICAgIGRlbGV0ZSBvcHQuaGlnaGxpZ2h0O1xuXG4gICAgaWYgKCF0b2tlbnMubGVuZ3RoKSByZXR1cm4gZG9uZSgpO1xuXG4gICAgbGV0IHBlbmRpbmcgPSAwO1xuICAgIG1hcmtlZC53YWxrVG9rZW5zKHRva2VucywgZnVuY3Rpb24odG9rZW4pIHtcbiAgICAgIGlmICh0b2tlbi50eXBlID09PSAnY29kZScpIHtcbiAgICAgICAgcGVuZGluZysrO1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICBoaWdobGlnaHQodG9rZW4udGV4dCwgdG9rZW4ubGFuZywgZnVuY3Rpb24oZXJyLCBjb2RlKSB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgIHJldHVybiBkb25lKGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoY29kZSAhPSBudWxsICYmIGNvZGUgIT09IHRva2VuLnRleHQpIHtcbiAgICAgICAgICAgICAgdG9rZW4udGV4dCA9IGNvZGU7XG4gICAgICAgICAgICAgIHRva2VuLmVzY2FwZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBwZW5kaW5nLS07XG4gICAgICAgICAgICBpZiAocGVuZGluZyA9PT0gMCkge1xuICAgICAgICAgICAgICBkb25lKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0sIDApO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYgKHBlbmRpbmcgPT09IDApIHtcbiAgICAgIGRvbmUoKTtcbiAgICB9XG5cbiAgICByZXR1cm47XG4gIH1cblxuICBmdW5jdGlvbiBvbkVycm9yKGUpIHtcbiAgICBlLm1lc3NhZ2UgKz0gJ1xcblBsZWFzZSByZXBvcnQgdGhpcyB0byBodHRwczovL2dpdGh1Yi5jb20vbWFya2VkanMvbWFya2VkLic7XG4gICAgaWYgKG9wdC5zaWxlbnQpIHtcbiAgICAgIHJldHVybiAnPHA+QW4gZXJyb3Igb2NjdXJyZWQ6PC9wPjxwcmU+J1xuICAgICAgICArIGVzY2FwZShlLm1lc3NhZ2UgKyAnJywgdHJ1ZSlcbiAgICAgICAgKyAnPC9wcmU+JztcbiAgICB9XG4gICAgdGhyb3cgZTtcbiAgfVxuXG4gIHRyeSB7XG4gICAgY29uc3QgdG9rZW5zID0gTGV4ZXIubGV4KHNyYywgb3B0KTtcbiAgICBpZiAob3B0LndhbGtUb2tlbnMpIHtcbiAgICAgIGlmIChvcHQuYXN5bmMpIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKG1hcmtlZC53YWxrVG9rZW5zKHRva2Vucywgb3B0LndhbGtUb2tlbnMpKVxuICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBQYXJzZXIucGFyc2UodG9rZW5zLCBvcHQpO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLmNhdGNoKG9uRXJyb3IpO1xuICAgICAgfVxuICAgICAgbWFya2VkLndhbGtUb2tlbnModG9rZW5zLCBvcHQud2Fsa1Rva2Vucyk7XG4gICAgfVxuICAgIHJldHVybiBQYXJzZXIucGFyc2UodG9rZW5zLCBvcHQpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgb25FcnJvcihlKTtcbiAgfVxufVxuXG4vKipcbiAqIE9wdGlvbnNcbiAqL1xuXG5tYXJrZWQub3B0aW9ucyA9XG5tYXJrZWQuc2V0T3B0aW9ucyA9IGZ1bmN0aW9uKG9wdCkge1xuICBtZXJnZShtYXJrZWQuZGVmYXVsdHMsIG9wdCk7XG4gIGNoYW5nZURlZmF1bHRzKG1hcmtlZC5kZWZhdWx0cyk7XG4gIHJldHVybiBtYXJrZWQ7XG59O1xuXG5tYXJrZWQuZ2V0RGVmYXVsdHMgPSBnZXREZWZhdWx0cztcblxubWFya2VkLmRlZmF1bHRzID0gZGVmYXVsdHM7XG5cbi8qKlxuICogVXNlIEV4dGVuc2lvblxuICovXG5cbm1hcmtlZC51c2UgPSBmdW5jdGlvbiguLi5hcmdzKSB7XG4gIGNvbnN0IGV4dGVuc2lvbnMgPSBtYXJrZWQuZGVmYXVsdHMuZXh0ZW5zaW9ucyB8fCB7IHJlbmRlcmVyczoge30sIGNoaWxkVG9rZW5zOiB7fSB9O1xuXG4gIGFyZ3MuZm9yRWFjaCgocGFjaykgPT4ge1xuICAgIC8vIGNvcHkgb3B0aW9ucyB0byBuZXcgb2JqZWN0XG4gICAgY29uc3Qgb3B0cyA9IG1lcmdlKHt9LCBwYWNrKTtcblxuICAgIC8vIHNldCBhc3luYyB0byB0cnVlIGlmIGl0IHdhcyBzZXQgdG8gdHJ1ZSBiZWZvcmVcbiAgICBvcHRzLmFzeW5jID0gbWFya2VkLmRlZmF1bHRzLmFzeW5jIHx8IG9wdHMuYXN5bmM7XG5cbiAgICAvLyA9PS0tIFBhcnNlIFwiYWRkb25cIiBleHRlbnNpb25zIC0tPT0gLy9cbiAgICBpZiAocGFjay5leHRlbnNpb25zKSB7XG4gICAgICBwYWNrLmV4dGVuc2lvbnMuZm9yRWFjaCgoZXh0KSA9PiB7XG4gICAgICAgIGlmICghZXh0Lm5hbWUpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2V4dGVuc2lvbiBuYW1lIHJlcXVpcmVkJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGV4dC5yZW5kZXJlcikgeyAvLyBSZW5kZXJlciBleHRlbnNpb25zXG4gICAgICAgICAgY29uc3QgcHJldlJlbmRlcmVyID0gZXh0ZW5zaW9ucy5yZW5kZXJlcnNbZXh0Lm5hbWVdO1xuICAgICAgICAgIGlmIChwcmV2UmVuZGVyZXIpIHtcbiAgICAgICAgICAgIC8vIFJlcGxhY2UgZXh0ZW5zaW9uIHdpdGggZnVuYyB0byBydW4gbmV3IGV4dGVuc2lvbiBidXQgZmFsbCBiYWNrIGlmIGZhbHNlXG4gICAgICAgICAgICBleHRlbnNpb25zLnJlbmRlcmVyc1tleHQubmFtZV0gPSBmdW5jdGlvbiguLi5hcmdzKSB7XG4gICAgICAgICAgICAgIGxldCByZXQgPSBleHQucmVuZGVyZXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgICAgIGlmIChyZXQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgcmV0ID0gcHJldlJlbmRlcmVyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiByZXQ7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBleHRlbnNpb25zLnJlbmRlcmVyc1tleHQubmFtZV0gPSBleHQucmVuZGVyZXI7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChleHQudG9rZW5pemVyKSB7IC8vIFRva2VuaXplciBFeHRlbnNpb25zXG4gICAgICAgICAgaWYgKCFleHQubGV2ZWwgfHwgKGV4dC5sZXZlbCAhPT0gJ2Jsb2NrJyAmJiBleHQubGV2ZWwgIT09ICdpbmxpbmUnKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiZXh0ZW5zaW9uIGxldmVsIG11c3QgYmUgJ2Jsb2NrJyBvciAnaW5saW5lJ1wiKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGV4dGVuc2lvbnNbZXh0LmxldmVsXSkge1xuICAgICAgICAgICAgZXh0ZW5zaW9uc1tleHQubGV2ZWxdLnVuc2hpZnQoZXh0LnRva2VuaXplcik7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGV4dGVuc2lvbnNbZXh0LmxldmVsXSA9IFtleHQudG9rZW5pemVyXTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGV4dC5zdGFydCkgeyAvLyBGdW5jdGlvbiB0byBjaGVjayBmb3Igc3RhcnQgb2YgdG9rZW5cbiAgICAgICAgICAgIGlmIChleHQubGV2ZWwgPT09ICdibG9jaycpIHtcbiAgICAgICAgICAgICAgaWYgKGV4dGVuc2lvbnMuc3RhcnRCbG9jaykge1xuICAgICAgICAgICAgICAgIGV4dGVuc2lvbnMuc3RhcnRCbG9jay5wdXNoKGV4dC5zdGFydCk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZXh0ZW5zaW9ucy5zdGFydEJsb2NrID0gW2V4dC5zdGFydF07XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZXh0LmxldmVsID09PSAnaW5saW5lJykge1xuICAgICAgICAgICAgICBpZiAoZXh0ZW5zaW9ucy5zdGFydElubGluZSkge1xuICAgICAgICAgICAgICAgIGV4dGVuc2lvbnMuc3RhcnRJbmxpbmUucHVzaChleHQuc3RhcnQpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGV4dGVuc2lvbnMuc3RhcnRJbmxpbmUgPSBbZXh0LnN0YXJ0XTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoZXh0LmNoaWxkVG9rZW5zKSB7IC8vIENoaWxkIHRva2VucyB0byBiZSB2aXNpdGVkIGJ5IHdhbGtUb2tlbnNcbiAgICAgICAgICBleHRlbnNpb25zLmNoaWxkVG9rZW5zW2V4dC5uYW1lXSA9IGV4dC5jaGlsZFRva2VucztcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBvcHRzLmV4dGVuc2lvbnMgPSBleHRlbnNpb25zO1xuICAgIH1cblxuICAgIC8vID09LS0gUGFyc2UgXCJvdmVyd3JpdGVcIiBleHRlbnNpb25zIC0tPT0gLy9cbiAgICBpZiAocGFjay5yZW5kZXJlcikge1xuICAgICAgY29uc3QgcmVuZGVyZXIgPSBtYXJrZWQuZGVmYXVsdHMucmVuZGVyZXIgfHwgbmV3IFJlbmRlcmVyKCk7XG4gICAgICBmb3IgKGNvbnN0IHByb3AgaW4gcGFjay5yZW5kZXJlcikge1xuICAgICAgICBjb25zdCBwcmV2UmVuZGVyZXIgPSByZW5kZXJlcltwcm9wXTtcbiAgICAgICAgLy8gUmVwbGFjZSByZW5kZXJlciB3aXRoIGZ1bmMgdG8gcnVuIGV4dGVuc2lvbiwgYnV0IGZhbGwgYmFjayBpZiBmYWxzZVxuICAgICAgICByZW5kZXJlcltwcm9wXSA9ICguLi5hcmdzKSA9PiB7XG4gICAgICAgICAgbGV0IHJldCA9IHBhY2sucmVuZGVyZXJbcHJvcF0uYXBwbHkocmVuZGVyZXIsIGFyZ3MpO1xuICAgICAgICAgIGlmIChyZXQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICByZXQgPSBwcmV2UmVuZGVyZXIuYXBwbHkocmVuZGVyZXIsIGFyZ3MpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gcmV0O1xuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgb3B0cy5yZW5kZXJlciA9IHJlbmRlcmVyO1xuICAgIH1cbiAgICBpZiAocGFjay50b2tlbml6ZXIpIHtcbiAgICAgIGNvbnN0IHRva2VuaXplciA9IG1hcmtlZC5kZWZhdWx0cy50b2tlbml6ZXIgfHwgbmV3IFRva2VuaXplcigpO1xuICAgICAgZm9yIChjb25zdCBwcm9wIGluIHBhY2sudG9rZW5pemVyKSB7XG4gICAgICAgIGNvbnN0IHByZXZUb2tlbml6ZXIgPSB0b2tlbml6ZXJbcHJvcF07XG4gICAgICAgIC8vIFJlcGxhY2UgdG9rZW5pemVyIHdpdGggZnVuYyB0byBydW4gZXh0ZW5zaW9uLCBidXQgZmFsbCBiYWNrIGlmIGZhbHNlXG4gICAgICAgIHRva2VuaXplcltwcm9wXSA9ICguLi5hcmdzKSA9PiB7XG4gICAgICAgICAgbGV0IHJldCA9IHBhY2sudG9rZW5pemVyW3Byb3BdLmFwcGx5KHRva2VuaXplciwgYXJncyk7XG4gICAgICAgICAgaWYgKHJldCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHJldCA9IHByZXZUb2tlbml6ZXIuYXBwbHkodG9rZW5pemVyLCBhcmdzKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHJldDtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIG9wdHMudG9rZW5pemVyID0gdG9rZW5pemVyO1xuICAgIH1cblxuICAgIC8vID09LS0gUGFyc2UgV2Fsa1Rva2VucyBleHRlbnNpb25zIC0tPT0gLy9cbiAgICBpZiAocGFjay53YWxrVG9rZW5zKSB7XG4gICAgICBjb25zdCB3YWxrVG9rZW5zID0gbWFya2VkLmRlZmF1bHRzLndhbGtUb2tlbnM7XG4gICAgICBvcHRzLndhbGtUb2tlbnMgPSBmdW5jdGlvbih0b2tlbikge1xuICAgICAgICBsZXQgdmFsdWVzID0gW107XG4gICAgICAgIHZhbHVlcy5wdXNoKHBhY2sud2Fsa1Rva2Vucy5jYWxsKHRoaXMsIHRva2VuKSk7XG4gICAgICAgIGlmICh3YWxrVG9rZW5zKSB7XG4gICAgICAgICAgdmFsdWVzID0gdmFsdWVzLmNvbmNhdCh3YWxrVG9rZW5zLmNhbGwodGhpcywgdG9rZW4pKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmFsdWVzO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICBtYXJrZWQuc2V0T3B0aW9ucyhvcHRzKTtcbiAgfSk7XG59O1xuXG4vKipcbiAqIFJ1biBjYWxsYmFjayBmb3IgZXZlcnkgdG9rZW5cbiAqL1xuXG5tYXJrZWQud2Fsa1Rva2VucyA9IGZ1bmN0aW9uKHRva2VucywgY2FsbGJhY2spIHtcbiAgbGV0IHZhbHVlcyA9IFtdO1xuICBmb3IgKGNvbnN0IHRva2VuIG9mIHRva2Vucykge1xuICAgIHZhbHVlcyA9IHZhbHVlcy5jb25jYXQoY2FsbGJhY2suY2FsbChtYXJrZWQsIHRva2VuKSk7XG4gICAgc3dpdGNoICh0b2tlbi50eXBlKSB7XG4gICAgICBjYXNlICd0YWJsZSc6IHtcbiAgICAgICAgZm9yIChjb25zdCBjZWxsIG9mIHRva2VuLmhlYWRlcikge1xuICAgICAgICAgIHZhbHVlcyA9IHZhbHVlcy5jb25jYXQobWFya2VkLndhbGtUb2tlbnMoY2VsbC50b2tlbnMsIGNhbGxiYWNrKSk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCByb3cgb2YgdG9rZW4ucm93cykge1xuICAgICAgICAgIGZvciAoY29uc3QgY2VsbCBvZiByb3cpIHtcbiAgICAgICAgICAgIHZhbHVlcyA9IHZhbHVlcy5jb25jYXQobWFya2VkLndhbGtUb2tlbnMoY2VsbC50b2tlbnMsIGNhbGxiYWNrKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgY2FzZSAnbGlzdCc6IHtcbiAgICAgICAgdmFsdWVzID0gdmFsdWVzLmNvbmNhdChtYXJrZWQud2Fsa1Rva2Vucyh0b2tlbi5pdGVtcywgY2FsbGJhY2spKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBkZWZhdWx0OiB7XG4gICAgICAgIGlmIChtYXJrZWQuZGVmYXVsdHMuZXh0ZW5zaW9ucyAmJiBtYXJrZWQuZGVmYXVsdHMuZXh0ZW5zaW9ucy5jaGlsZFRva2VucyAmJiBtYXJrZWQuZGVmYXVsdHMuZXh0ZW5zaW9ucy5jaGlsZFRva2Vuc1t0b2tlbi50eXBlXSkgeyAvLyBXYWxrIGFueSBleHRlbnNpb25zXG4gICAgICAgICAgbWFya2VkLmRlZmF1bHRzLmV4dGVuc2lvbnMuY2hpbGRUb2tlbnNbdG9rZW4udHlwZV0uZm9yRWFjaChmdW5jdGlvbihjaGlsZFRva2Vucykge1xuICAgICAgICAgICAgdmFsdWVzID0gdmFsdWVzLmNvbmNhdChtYXJrZWQud2Fsa1Rva2Vucyh0b2tlbltjaGlsZFRva2Vuc10sIGNhbGxiYWNrKSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAodG9rZW4udG9rZW5zKSB7XG4gICAgICAgICAgdmFsdWVzID0gdmFsdWVzLmNvbmNhdChtYXJrZWQud2Fsa1Rva2Vucyh0b2tlbi50b2tlbnMsIGNhbGxiYWNrKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHZhbHVlcztcbn07XG5cbi8qKlxuICogUGFyc2UgSW5saW5lXG4gKiBAcGFyYW0ge3N0cmluZ30gc3JjXG4gKi9cbm1hcmtlZC5wYXJzZUlubGluZSA9IGZ1bmN0aW9uKHNyYywgb3B0KSB7XG4gIC8vIHRocm93IGVycm9yIGluIGNhc2Ugb2Ygbm9uIHN0cmluZyBpbnB1dFxuICBpZiAodHlwZW9mIHNyYyA9PT0gJ3VuZGVmaW5lZCcgfHwgc3JjID09PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdtYXJrZWQucGFyc2VJbmxpbmUoKTogaW5wdXQgcGFyYW1ldGVyIGlzIHVuZGVmaW5lZCBvciBudWxsJyk7XG4gIH1cbiAgaWYgKHR5cGVvZiBzcmMgIT09ICdzdHJpbmcnKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdtYXJrZWQucGFyc2VJbmxpbmUoKTogaW5wdXQgcGFyYW1ldGVyIGlzIG9mIHR5cGUgJ1xuICAgICAgKyBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoc3JjKSArICcsIHN0cmluZyBleHBlY3RlZCcpO1xuICB9XG5cbiAgb3B0ID0gbWVyZ2Uoe30sIG1hcmtlZC5kZWZhdWx0cywgb3B0IHx8IHt9KTtcbiAgY2hlY2tTYW5pdGl6ZURlcHJlY2F0aW9uKG9wdCk7XG5cbiAgdHJ5IHtcbiAgICBjb25zdCB0b2tlbnMgPSBMZXhlci5sZXhJbmxpbmUoc3JjLCBvcHQpO1xuICAgIGlmIChvcHQud2Fsa1Rva2Vucykge1xuICAgICAgbWFya2VkLndhbGtUb2tlbnModG9rZW5zLCBvcHQud2Fsa1Rva2Vucyk7XG4gICAgfVxuICAgIHJldHVybiBQYXJzZXIucGFyc2VJbmxpbmUodG9rZW5zLCBvcHQpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgZS5tZXNzYWdlICs9ICdcXG5QbGVhc2UgcmVwb3J0IHRoaXMgdG8gaHR0cHM6Ly9naXRodWIuY29tL21hcmtlZGpzL21hcmtlZC4nO1xuICAgIGlmIChvcHQuc2lsZW50KSB7XG4gICAgICByZXR1cm4gJzxwPkFuIGVycm9yIG9jY3VycmVkOjwvcD48cHJlPidcbiAgICAgICAgKyBlc2NhcGUoZS5tZXNzYWdlICsgJycsIHRydWUpXG4gICAgICAgICsgJzwvcHJlPic7XG4gICAgfVxuICAgIHRocm93IGU7XG4gIH1cbn07XG5cbi8qKlxuICogRXhwb3NlXG4gKi9cbm1hcmtlZC5QYXJzZXIgPSBQYXJzZXI7XG5tYXJrZWQucGFyc2VyID0gUGFyc2VyLnBhcnNlO1xubWFya2VkLlJlbmRlcmVyID0gUmVuZGVyZXI7XG5tYXJrZWQuVGV4dFJlbmRlcmVyID0gVGV4dFJlbmRlcmVyO1xubWFya2VkLkxleGVyID0gTGV4ZXI7XG5tYXJrZWQubGV4ZXIgPSBMZXhlci5sZXg7XG5tYXJrZWQuVG9rZW5pemVyID0gVG9rZW5pemVyO1xubWFya2VkLlNsdWdnZXIgPSBTbHVnZ2VyO1xubWFya2VkLnBhcnNlID0gbWFya2VkO1xuXG5jb25zdCBvcHRpb25zID0gbWFya2VkLm9wdGlvbnM7XG5jb25zdCBzZXRPcHRpb25zID0gbWFya2VkLnNldE9wdGlvbnM7XG5jb25zdCB1c2UgPSBtYXJrZWQudXNlO1xuY29uc3Qgd2Fsa1Rva2VucyA9IG1hcmtlZC53YWxrVG9rZW5zO1xuY29uc3QgcGFyc2VJbmxpbmUgPSBtYXJrZWQucGFyc2VJbmxpbmU7XG5jb25zdCBwYXJzZSA9IG1hcmtlZDtcbmNvbnN0IHBhcnNlciA9IFBhcnNlci5wYXJzZTtcbmNvbnN0IGxleGVyID0gTGV4ZXIubGV4O1xuXG5leHBvcnQgeyBMZXhlciwgUGFyc2VyLCBSZW5kZXJlciwgU2x1Z2dlciwgVGV4dFJlbmRlcmVyLCBUb2tlbml6ZXIsIGRlZmF1bHRzLCBnZXREZWZhdWx0cywgbGV4ZXIsIG1hcmtlZCwgb3B0aW9ucywgcGFyc2UsIHBhcnNlSW5saW5lLCBwYXJzZXIsIHNldE9wdGlvbnMsIHVzZSwgd2Fsa1Rva2VucyB9O1xuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcblx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG5cdFx0ZnVuY3Rpb24oKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG5cdFx0ZnVuY3Rpb24oKSB7IHJldHVybiBtb2R1bGU7IH07XG5cdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsIHsgYTogZ2V0dGVyIH0pO1xuXHRyZXR1cm4gZ2V0dGVyO1xufTsiLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBkZWZpbml0aW9uKSB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iaiwgcHJvcCkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCk7IH0iLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsInZhciBfX2Fzc2lnbiA9ICh0aGlzICYmIHRoaXMuX19hc3NpZ24pIHx8IGZ1bmN0aW9uICgpIHtcbiAgICBfX2Fzc2lnbiA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24odCkge1xuICAgICAgICBmb3IgKHZhciBzLCBpID0gMSwgbiA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBuOyBpKyspIHtcbiAgICAgICAgICAgIHMgPSBhcmd1bWVudHNbaV07XG4gICAgICAgICAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkpXG4gICAgICAgICAgICAgICAgdFtwXSA9IHNbcF07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHQ7XG4gICAgfTtcbiAgICByZXR1cm4gX19hc3NpZ24uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn07XG52YXIgX19hd2FpdGVyID0gKHRoaXMgJiYgdGhpcy5fX2F3YWl0ZXIpIHx8IGZ1bmN0aW9uICh0aGlzQXJnLCBfYXJndW1lbnRzLCBQLCBnZW5lcmF0b3IpIHtcbiAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH1cbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgZnVuY3Rpb24gZnVsZmlsbGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yLm5leHQodmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cbiAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpO1xuICAgIH0pO1xufTtcbnZhciBfX2dlbmVyYXRvciA9ICh0aGlzICYmIHRoaXMuX19nZW5lcmF0b3IpIHx8IGZ1bmN0aW9uICh0aGlzQXJnLCBib2R5KSB7XG4gICAgdmFyIF8gPSB7IGxhYmVsOiAwLCBzZW50OiBmdW5jdGlvbigpIHsgaWYgKHRbMF0gJiAxKSB0aHJvdyB0WzFdOyByZXR1cm4gdFsxXTsgfSwgdHJ5czogW10sIG9wczogW10gfSwgZiwgeSwgdCwgZztcbiAgICByZXR1cm4gZyA9IHsgbmV4dDogdmVyYigwKSwgXCJ0aHJvd1wiOiB2ZXJiKDEpLCBcInJldHVyblwiOiB2ZXJiKDIpIH0sIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiAoZ1tTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzOyB9KSwgZztcbiAgICBmdW5jdGlvbiB2ZXJiKG4pIHsgcmV0dXJuIGZ1bmN0aW9uICh2KSB7IHJldHVybiBzdGVwKFtuLCB2XSk7IH07IH1cbiAgICBmdW5jdGlvbiBzdGVwKG9wKSB7XG4gICAgICAgIGlmIChmKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiR2VuZXJhdG9yIGlzIGFscmVhZHkgZXhlY3V0aW5nLlwiKTtcbiAgICAgICAgd2hpbGUgKGcgJiYgKGcgPSAwLCBvcFswXSAmJiAoXyA9IDApKSwgXykgdHJ5IHtcbiAgICAgICAgICAgIGlmIChmID0gMSwgeSAmJiAodCA9IG9wWzBdICYgMiA/IHlbXCJyZXR1cm5cIl0gOiBvcFswXSA/IHlbXCJ0aHJvd1wiXSB8fCAoKHQgPSB5W1wicmV0dXJuXCJdKSAmJiB0LmNhbGwoeSksIDApIDogeS5uZXh0KSAmJiAhKHQgPSB0LmNhbGwoeSwgb3BbMV0pKS5kb25lKSByZXR1cm4gdDtcbiAgICAgICAgICAgIGlmICh5ID0gMCwgdCkgb3AgPSBbb3BbMF0gJiAyLCB0LnZhbHVlXTtcbiAgICAgICAgICAgIHN3aXRjaCAob3BbMF0pIHtcbiAgICAgICAgICAgICAgICBjYXNlIDA6IGNhc2UgMTogdCA9IG9wOyBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDQ6IF8ubGFiZWwrKzsgcmV0dXJuIHsgdmFsdWU6IG9wWzFdLCBkb25lOiBmYWxzZSB9O1xuICAgICAgICAgICAgICAgIGNhc2UgNTogXy5sYWJlbCsrOyB5ID0gb3BbMV07IG9wID0gWzBdOyBjb250aW51ZTtcbiAgICAgICAgICAgICAgICBjYXNlIDc6IG9wID0gXy5vcHMucG9wKCk7IF8udHJ5cy5wb3AoKTsgY29udGludWU7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEodCA9IF8udHJ5cywgdCA9IHQubGVuZ3RoID4gMCAmJiB0W3QubGVuZ3RoIC0gMV0pICYmIChvcFswXSA9PT0gNiB8fCBvcFswXSA9PT0gMikpIHsgXyA9IDA7IGNvbnRpbnVlOyB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChvcFswXSA9PT0gMyAmJiAoIXQgfHwgKG9wWzFdID4gdFswXSAmJiBvcFsxXSA8IHRbM10pKSkgeyBfLmxhYmVsID0gb3BbMV07IGJyZWFrOyB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChvcFswXSA9PT0gNiAmJiBfLmxhYmVsIDwgdFsxXSkgeyBfLmxhYmVsID0gdFsxXTsgdCA9IG9wOyBicmVhazsgfVxuICAgICAgICAgICAgICAgICAgICBpZiAodCAmJiBfLmxhYmVsIDwgdFsyXSkgeyBfLmxhYmVsID0gdFsyXTsgXy5vcHMucHVzaChvcCk7IGJyZWFrOyB9XG4gICAgICAgICAgICAgICAgICAgIGlmICh0WzJdKSBfLm9wcy5wb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG9wID0gYm9keS5jYWxsKHRoaXNBcmcsIF8pO1xuICAgICAgICB9IGNhdGNoIChlKSB7IG9wID0gWzYsIGVdOyB5ID0gMDsgfSBmaW5hbGx5IHsgZiA9IHQgPSAwOyB9XG4gICAgICAgIGlmIChvcFswXSAmIDUpIHRocm93IG9wWzFdOyByZXR1cm4geyB2YWx1ZTogb3BbMF0gPyBvcFsxXSA6IHZvaWQgMCwgZG9uZTogdHJ1ZSB9O1xuICAgIH1cbn07XG5pbXBvcnQgeyBnZXRfcmVzZWFyY2hfdGV4dCB9IGZyb20gXCIuL2NoYXRcIjtcbmltcG9ydCB7IHRoaXNHYW1lIH0gZnJvbSBcIi4vZ2FtZVwiO1xuaW1wb3J0IHsgZ2V0X2hlcm8gfSBmcm9tIFwiLi9nZXRfaGVyb1wiO1xuaW1wb3J0IHsgY2xpcCwgbGFzdENsaXAgfSBmcm9tIFwiLi9ob3RrZXlcIjtcbmltcG9ydCB7IHJlbmRlckxlZGdlciB9IGZyb20gXCIuL2xlZGdlclwiO1xuaW1wb3J0IHsgbWVyZ2VVc2VyIH0gZnJvbSBcIi4vbWVyZ2VcIjtcbmltcG9ydCB7IGlzX3ZhbGlkX2ltYWdlX3VybCwgaXNfdmFsaWRfeW91dHViZSB9IGZyb20gXCIuL3BhcnNlX3V0aWxzXCI7XG5pbXBvcnQgeyBhbnlTdGFyQ2FuU2VlLCBkcmF3T3ZlcmxheVN0cmluZyB9IGZyb20gXCIuL3V0aWxpdGllcy9ncmFwaGljc1wiO1xudmFyIFNBVF9WRVJTSU9OID0gXCIyLjI4LjE3LWdpdFwiO1xuaWYgKE5lcHR1bmVzUHJpZGUgPT09IHVuZGVmaW5lZCkge1xuICAgIHRoaXNHYW1lLm5lcHR1bmVzUHJpZGUgPSBOZXB0dW5lc1ByaWRlO1xufVxuZnVuY3Rpb24gcG9zdF9ob29rKCkge1xuICAgIC8vY29uc29sZS5sb2coc3RyaW5naWZ5KE5lcHR1bmVzUHJpZGUudW5pdmVyc2UuZ2FsYXh5LmZsZWV0c1syXSxudWxsLCBcIlxcdFwiKSlcbiAgICByZXR1cm4gbnVsbDtcbn1cbi8vVE9ETzogT3JnYW5pemUgdHlwZXNjcmlwdCB0byBhbiBpbnRlcmZhY2VzIGRpcmVjdG9yeVxuLy9UT0RPOiBUaGVuIG1ha2Ugb3RoZXIgZ2FtZSBlbmdpbmUgb2JqZWN0c1xuLy8gUGFydCBvZiB5b3VyIGNvZGUgaXMgcmUtY3JlYXRpbmcgdGhlIGdhbWUgaW4gdHlwZXNjcmlwdFxuLy8gVGhlIG90aGVyIHBhcnQgaXMgYWRkaW5nIGZlYXR1cmVzXG4vLyBUaGVuIHRoZXJlIGlzIGEgc2VnbWVudCB0aGF0IGlzIG92ZXJ3cml0aW5nIGV4aXN0aW5nIGNvbnRlbnQgdG8gYWRkIHNtYWxsIGFkZGl0aW9ucy5cbi8vQWRkIGN1c3RvbSBzZXR0aW5ncyB3aGVuIG1ha2luZyBhIG53ZSBnYW1lLlxuZnVuY3Rpb24gbW9kaWZ5X2N1c3RvbV9nYW1lKCkge1xuICAgIGNvbnNvbGUubG9nKFwiUnVubmluZyBjdXN0b20gZ2FtZSBzZXR0aW5ncyBtb2RpZmljYXRpb25cIik7XG4gICAgdmFyIHNlbGVjdG9yID0gJChcIiNjb250ZW50QXJlYSA+IGRpdiA+IGRpdi53aWRnZXQuZnVsbHNjcmVlbiA+IGRpdi53aWRnZXQucmVsID4gZGl2Om50aC1jaGlsZCg0KSA+IGRpdjpudGgtY2hpbGQoMTUpID4gc2VsZWN0XCIpWzBdO1xuICAgIGlmIChzZWxlY3RvciA9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgLy9Ob3QgaW4gbWVudVxuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0ZXh0U3RyaW5nID0gXCJcIjtcbiAgICBmb3IgKHZhciBpID0gMjsgaSA8PSAzMjsgKytpKSB7XG4gICAgICAgIHRleHRTdHJpbmcgKz0gXCI8b3B0aW9uIHZhbHVlPVxcXCJcIi5jb25jYXQoaSwgXCJcXFwiPlwiKS5jb25jYXQoaSwgXCIgUGxheWVyczwvb3B0aW9uPlwiKTtcbiAgICB9XG4gICAgY29uc29sZS5sb2codGV4dFN0cmluZyk7XG4gICAgc2VsZWN0b3IuaW5uZXJIVE1MID0gdGV4dFN0cmluZztcbn1cbnNldFRpbWVvdXQobW9kaWZ5X2N1c3RvbV9nYW1lLCA1MDApO1xuLy9UT0RPOiBNYWtlIGlzIHdpdGhpbiBzY2FubmluZyBmdW5jdGlvblxuLy9TaGFyZSBhbGwgdGVjaCBkaXNwbGF5IGFzIHRlY2ggaXMgYWN0aXZlbHkgdHJhZGluZy5cbnZhciBkaXNwbGF5X3RlY2hfdHJhZGluZyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgbnB1aSA9IE5lcHR1bmVzUHJpZGUubnB1aTtcbiAgICB2YXIgdGVjaF90cmFkZV9zY3JlZW4gPSBucHVpLlNjcmVlbihcInRlY2hfdHJhZGluZ1wiKTtcbiAgICBucHVpLm9uSGlkZVNjcmVlbihudWxsLCB0cnVlKTtcbiAgICBucHVpLm9uSGlkZVNlbGVjdGlvbk1lbnUoKTtcbiAgICBucHVpLnRyaWdnZXIoXCJoaWRlX3NpZGVfbWVudVwiKTtcbiAgICBucHVpLnRyaWdnZXIoXCJyZXNldF9lZGl0X21vZGVcIik7XG4gICAgbnB1aS5hY3RpdmVTY3JlZW4gPSB0ZWNoX3RyYWRlX3NjcmVlbjtcbiAgICB0ZWNoX3RyYWRlX3NjcmVlbi5yb29zdChucHVpLnNjcmVlbkNvbnRhaW5lcik7XG4gICAgbnB1aS5sYXlvdXRFbGVtZW50KHRlY2hfdHJhZGVfc2NyZWVuKTtcbiAgICB2YXIgdHJhZGluZyA9IENydXguVGV4dChcIlwiLCBcInJlbCBwYWQxMlwiKS5yYXdIVE1MKFwiVHJhZGluZy4uXCIpO1xuICAgIHRyYWRpbmcucm9vc3QodGVjaF90cmFkZV9zY3JlZW4pO1xuICAgIHRlY2hfdHJhZGVfc2NyZWVuLnRyYW5zYWN0ID0gZnVuY3Rpb24gKHRleHQpIHtcbiAgICAgICAgdmFyIHRyYWRpbmcgPSBDcnV4LlRleHQoXCJcIiwgXCJyZWwgcGFkOFwiKS5yYXdIVE1MKHRleHQpO1xuICAgICAgICB0cmFkaW5nLnJvb3N0KHRlY2hfdHJhZGVfc2NyZWVuKTtcbiAgICB9O1xuICAgIHJldHVybiB0ZWNoX3RyYWRlX3NjcmVlbjtcbn07XG4vL1JldHVybnMgYWxsIHN0YXJzIEkgc3VwcG9zZVxudmFyIF9nZXRfc3Rhcl9naXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHN0YXJzID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5nYWxheHkuc3RhcnM7XG4gICAgdmFyIG91dHB1dCA9IFtdO1xuICAgIGZvciAodmFyIHMgaW4gc3RhcnMpIHtcbiAgICAgICAgdmFyIHN0YXIgPSBzdGFyc1tzXTtcbiAgICAgICAgb3V0cHV0LnB1c2goe1xuICAgICAgICAgICAgeDogc3Rhci54LFxuICAgICAgICAgICAgeTogc3Rhci55LFxuICAgICAgICAgICAgb3duZXI6IHN0YXIucXVhbGlmaWVkQWxpYXMsXG4gICAgICAgICAgICBlY29ub215OiBzdGFyLmUsXG4gICAgICAgICAgICBpbmR1c3RyeTogc3Rhci5pLFxuICAgICAgICAgICAgc2NpZW5jZTogc3Rhci5zLFxuICAgICAgICAgICAgc2hpcHM6IHN0YXIudG90YWxEZWZlbnNlcyxcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBvdXRwdXQ7XG59O1xudmFyIF9nZXRfd2VhcG9uc19uZXh0ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciByZXNlYXJjaCA9IGdldF9yZXNlYXJjaCgpO1xuICAgIGlmIChyZXNlYXJjaFtcImN1cnJlbnRfbmFtZVwiXSA9PSBcIldlYXBvbnNcIikge1xuICAgICAgICByZXR1cm4gcmVzZWFyY2hbXCJjdXJyZW50X2V0YVwiXTtcbiAgICB9XG4gICAgZWxzZSBpZiAocmVzZWFyY2hbXCJuZXh0X25hbWVcIl0gPT0gXCJXZWFwb25zXCIpIHtcbiAgICAgICAgcmV0dXJuIHJlc2VhcmNoW1wibmV4dF9ldGFcIl07XG4gICAgfVxuICAgIHJldHVybiBNYXRoLnBvdygxMCwgMTApO1xufTtcbnZhciBnZXRfdGVjaF90cmFkZV9jb3N0ID0gZnVuY3Rpb24gKGZyb20sIHRvLCB0ZWNoX25hbWUpIHtcbiAgICBpZiAodGVjaF9uYW1lID09PSB2b2lkIDApIHsgdGVjaF9uYW1lID0gbnVsbDsgfVxuICAgIHZhciB0b3RhbF9jb3N0ID0gMDtcbiAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gT2JqZWN0LmVudHJpZXModG8udGVjaCk7IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgIHZhciBfYiA9IF9hW19pXSwgdGVjaCA9IF9iWzBdLCB2YWx1ZSA9IF9iWzFdO1xuICAgICAgICBpZiAodGVjaF9uYW1lID09IG51bGwgfHwgdGVjaF9uYW1lID09IHRlY2gpIHtcbiAgICAgICAgICAgIHZhciBtZSA9IGZyb20udGVjaFt0ZWNoXS5sZXZlbDtcbiAgICAgICAgICAgIHZhciB5b3UgPSB2YWx1ZS5sZXZlbDtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDw9IG1lIC0geW91OyArK2kpIHtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKHRlY2gsKHlvdStpKSwoeW91K2kpKjE1KVxuICAgICAgICAgICAgICAgIHRvdGFsX2Nvc3QgKz0gKHlvdSArIGkpICogTmVwdHVuZXNQcmlkZS5nYW1lQ29uZmlnLnRyYWRlQ29zdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdG90YWxfY29zdDtcbn07XG4vL0hvb2tzIHRvIGJ1dHRvbnMgZm9yIHNoYXJpbmcgYW5kIGJ1eWluZ1xuLy9QcmV0dHkgc2ltcGxlIGhvb2tzIHRoYXQgY2FuIGJlIGFkZGVkIHRvIGEgdHlwZXNjcmlwdCBmaWxlLlxudmFyIGFwcGx5X2hvb2tzID0gZnVuY3Rpb24gKCkge1xuICAgIE5lcHR1bmVzUHJpZGUubnAub24oXCJzaGFyZV9hbGxfdGVjaFwiLCBmdW5jdGlvbiAoZXZlbnQsIHBsYXllcikge1xuICAgICAgICB2YXIgdG90YWxfY29zdCA9IGdldF90ZWNoX3RyYWRlX2Nvc3QoZ2V0X2hlcm8oTmVwdHVuZXNQcmlkZS51bml2ZXJzZSksIHBsYXllcik7XG4gICAgICAgIE5lcHR1bmVzUHJpZGUudGVtcGxhdGVzW1wiY29uZmlybV90ZWNoX3NoYXJlX1wiLmNvbmNhdChwbGF5ZXIudWlkKV0gPSBcIkFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBzcGVuZCAkXCIuY29uY2F0KHRvdGFsX2Nvc3QsIFwiIHRvIGdpdmUgXCIpLmNvbmNhdChwbGF5ZXIucmF3QWxpYXMsIFwiIGFsbCBvZiB5b3VyIHRlY2g/XCIpO1xuICAgICAgICBOZXB0dW5lc1ByaWRlLm5wLnRyaWdnZXIoXCJzaG93X3NjcmVlblwiLCBbXG4gICAgICAgICAgICBcImNvbmZpcm1cIixcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBcImNvbmZpcm1fdGVjaF9zaGFyZV9cIi5jb25jYXQocGxheWVyLnVpZCksXG4gICAgICAgICAgICAgICAgZXZlbnRLaW5kOiBcImNvbmZpcm1fdHJhZGVfdGVjaFwiLFxuICAgICAgICAgICAgICAgIGV2ZW50RGF0YTogcGxheWVyLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgXSk7XG4gICAgfSk7XG4gICAgTmVwdHVuZXNQcmlkZS5ucC5vbihcImJ1eV9hbGxfdGVjaFwiLCBmdW5jdGlvbiAoZXZlbnQsIGRhdGEpIHtcbiAgICAgICAgdmFyIHBsYXllciA9IGRhdGEucGxheWVyO1xuICAgICAgICB2YXIgY29zdCA9IGRhdGEuY29zdDtcbiAgICAgICAgTmVwdHVuZXNQcmlkZS50ZW1wbGF0ZXNbXCJjb25maXJtX3RlY2hfc2hhcmVfXCIuY29uY2F0KHBsYXllci51aWQpXSA9IFwiQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIHNwZW5kICRcIi5jb25jYXQoY29zdCwgXCIgdG8gYnV5IGFsbCBvZiBcIikuY29uY2F0KHBsYXllci5yYXdBbGlhcywgXCIncyB0ZWNoPyBJdCBpcyB1cCB0byB0aGVtIHRvIGFjdHVhbGx5IHNlbmQgaXQgdG8geW91LlwiKTtcbiAgICAgICAgTmVwdHVuZXNQcmlkZS5ucC50cmlnZ2VyKFwic2hvd19zY3JlZW5cIiwgW1xuICAgICAgICAgICAgXCJjb25maXJtXCIsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZTogXCJjb25maXJtX3RlY2hfc2hhcmVfXCIuY29uY2F0KHBsYXllci51aWQpLFxuICAgICAgICAgICAgICAgIGV2ZW50S2luZDogXCJjb25maXJtX2J1eV90ZWNoXCIsXG4gICAgICAgICAgICAgICAgZXZlbnREYXRhOiBkYXRhLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgXSk7XG4gICAgfSk7XG4gICAgTmVwdHVuZXNQcmlkZS5ucC5vbihcImJ1eV9vbmVfdGVjaFwiLCBmdW5jdGlvbiAoZXZlbnQsIGRhdGEpIHtcbiAgICAgICAgdmFyIHBsYXllciA9IGRhdGEucGxheWVyO1xuICAgICAgICB2YXIgdGVjaCA9IGRhdGEudGVjaDtcbiAgICAgICAgdmFyIGNvc3QgPSBkYXRhLmNvc3Q7XG4gICAgICAgIE5lcHR1bmVzUHJpZGUudGVtcGxhdGVzW1wiY29uZmlybV90ZWNoX3NoYXJlX1wiLmNvbmNhdChwbGF5ZXIudWlkKV0gPSBcIkFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBzcGVuZCAkXCIuY29uY2F0KGNvc3QsIFwiIHRvIGJ1eSBcIikuY29uY2F0KHRlY2gsIFwiIGZyb20gXCIpLmNvbmNhdChwbGF5ZXIucmF3QWxpYXMsIFwiPyBJdCBpcyB1cCB0byB0aGVtIHRvIGFjdHVhbGx5IHNlbmQgaXQgdG8geW91LlwiKTtcbiAgICAgICAgTmVwdHVuZXNQcmlkZS5ucC50cmlnZ2VyKFwic2hvd19zY3JlZW5cIiwgW1xuICAgICAgICAgICAgXCJjb25maXJtXCIsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZTogXCJjb25maXJtX3RlY2hfc2hhcmVfXCIuY29uY2F0KHBsYXllci51aWQpLFxuICAgICAgICAgICAgICAgIGV2ZW50S2luZDogXCJjb25maXJtX2J1eV90ZWNoXCIsXG4gICAgICAgICAgICAgICAgZXZlbnREYXRhOiBkYXRhLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgXSk7XG4gICAgfSk7XG4gICAgTmVwdHVuZXNQcmlkZS5ucC5vbihcImNvbmZpcm1fdHJhZGVfdGVjaFwiLCBmdW5jdGlvbiAoZXZlbiwgcGxheWVyKSB7XG4gICAgICAgIHZhciBoZXJvID0gZ2V0X2hlcm8oTmVwdHVuZXNQcmlkZS51bml2ZXJzZSk7XG4gICAgICAgIHZhciBkaXNwbGF5ID0gZGlzcGxheV90ZWNoX3RyYWRpbmcoKTtcbiAgICAgICAgdmFyIGNsb3NlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5zZWxlY3RQbGF5ZXIocGxheWVyKTtcbiAgICAgICAgICAgIE5lcHR1bmVzUHJpZGUubnAudHJpZ2dlcihcInJlZnJlc2hfaW50ZXJmYWNlXCIpO1xuICAgICAgICAgICAgTmVwdHVuZXNQcmlkZS5ucC5ucHVpLnJlZnJlc2hUdXJuTWFuYWdlcigpO1xuICAgICAgICB9O1xuICAgICAgICB2YXIgb2Zmc2V0ID0gMzAwO1xuICAgICAgICB2YXIgX2xvb3BfMSA9IGZ1bmN0aW9uICh0ZWNoLCB2YWx1ZSkge1xuICAgICAgICAgICAgdmFyIG1lID0gaGVyby50ZWNoW3RlY2hdLmxldmVsO1xuICAgICAgICAgICAgdmFyIHlvdSA9IHZhbHVlLmxldmVsO1xuICAgICAgICAgICAgdmFyIF9sb29wXzIgPSBmdW5jdGlvbiAoaSkge1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhtZSAtIHlvdSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJvcmRlclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgb3JkZXI6IFwic2hhcmVfdGVjaCxcIi5jb25jYXQocGxheWVyLnVpZCwgXCIsXCIpLmNvbmNhdCh0ZWNoKSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXkudHJhbnNhY3QoXCJTZW5kaW5nIFwiLmNvbmNhdCh0ZWNoLCBcIiBsZXZlbCBcIikuY29uY2F0KHlvdSArIGkpKTtcbiAgICAgICAgICAgICAgICAgICAgTmVwdHVuZXNQcmlkZS5ucC50cmlnZ2VyKFwic2VydmVyX3JlcXVlc3RcIiwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJvcmRlclwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgb3JkZXI6IFwic2hhcmVfdGVjaCxcIi5jb25jYXQocGxheWVyLnVpZCwgXCIsXCIpLmNvbmNhdCh0ZWNoKSxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpID09IG1lIC0geW91KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkaXNwbGF5LnRyYW5zYWN0KFwiRG9uZS5cIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCBvZmZzZXQpO1xuICAgICAgICAgICAgICAgIG9mZnNldCArPSAxMDAwO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDw9IG1lIC0geW91OyArK2kpIHtcbiAgICAgICAgICAgICAgICBfbG9vcF8yKGkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBmb3IgKHZhciBfaSA9IDAsIF9hID0gT2JqZWN0LmVudHJpZXMocGxheWVyLnRlY2gpOyBfaSA8IF9hLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgdmFyIF9iID0gX2FbX2ldLCB0ZWNoID0gX2JbMF0sIHZhbHVlID0gX2JbMV07XG4gICAgICAgICAgICBfbG9vcF8xKHRlY2gsIHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBzZXRUaW1lb3V0KGNsb3NlLCBvZmZzZXQgKyAxMDAwKTtcbiAgICB9KTtcbiAgICAvL1BheXMgYSBwbGF5ZXIgYSBjZXJ0YWluIGFtb3VudFxuICAgIE5lcHR1bmVzUHJpZGUubnAub24oXCJjb25maXJtX2J1eV90ZWNoXCIsIGZ1bmN0aW9uIChldmVuLCBkYXRhKSB7XG4gICAgICAgIHZhciBwbGF5ZXIgPSBkYXRhLnBsYXllcjtcbiAgICAgICAgTmVwdHVuZXNQcmlkZS5ucC50cmlnZ2VyKFwic2VydmVyX3JlcXVlc3RcIiwge1xuICAgICAgICAgICAgdHlwZTogXCJvcmRlclwiLFxuICAgICAgICAgICAgb3JkZXI6IFwic2VuZF9tb25leSxcIi5jb25jYXQocGxheWVyLnVpZCwgXCIsXCIpLmNvbmNhdChkYXRhLmNvc3QpLFxuICAgICAgICB9KTtcbiAgICAgICAgTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5zZWxlY3RQbGF5ZXIocGxheWVyKTtcbiAgICAgICAgTmVwdHVuZXNQcmlkZS5ucC50cmlnZ2VyKFwicmVmcmVzaF9pbnRlcmZhY2VcIik7XG4gICAgfSk7XG59O1xudmFyIF93aWRlX3ZpZXcgPSBmdW5jdGlvbiAoKSB7XG4gICAgTmVwdHVuZXNQcmlkZS5ucC50cmlnZ2VyKFwibWFwX2NlbnRlcl9zbGlkZVwiLCB7IHg6IDAsIHk6IDAgfSk7XG4gICAgTmVwdHVuZXNQcmlkZS5ucC50cmlnZ2VyKFwiem9vbV9taW5pbWFwXCIpO1xufTtcbmZ1bmN0aW9uIExlZ2FjeV9OZXB0dW5lc1ByaWRlQWdlbnQoKSB7XG4gICAgdmFyIF9hLCBfYjtcbiAgICB2YXIgdGl0bGUgPSAoKF9hID0gZG9jdW1lbnQgPT09IG51bGwgfHwgZG9jdW1lbnQgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGRvY3VtZW50LmN1cnJlbnRTY3JpcHQpID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS50aXRsZSkgfHwgXCJTQVQgXCIuY29uY2F0KFNBVF9WRVJTSU9OKTtcbiAgICB2YXIgdmVyc2lvbiA9IHRpdGxlLnJlcGxhY2UoL14uKnYvLCBcInZcIik7XG4gICAgY29uc29sZS5sb2codGl0bGUpO1xuICAgIHZhciBjb3B5ID0gZnVuY3Rpb24gKHJlcG9ydEZuKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXBvcnRGbigpO1xuICAgICAgICAgICAgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQobGFzdENsaXApO1xuICAgICAgICB9O1xuICAgIH07XG4gICAgdmFyIGhvdGtleXMgPSBbXTtcbiAgICB2YXIgaG90a2V5ID0gZnVuY3Rpb24gKGtleSwgYWN0aW9uKSB7XG4gICAgICAgIGhvdGtleXMucHVzaChba2V5LCBhY3Rpb25dKTtcbiAgICAgICAgTW91c2V0cmFwLmJpbmQoa2V5LCBjb3B5KGFjdGlvbikpO1xuICAgIH07XG4gICAgaWYgKCFTdHJpbmcucHJvdG90eXBlLmZvcm1hdCkge1xuICAgICAgICBTdHJpbmcucHJvdG90eXBlLmZvcm1hdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBhcmdzID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgICAgIGFyZ3NbX2ldID0gYXJndW1lbnRzW19pXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGlzLnJlcGxhY2UoL3soXFxkKyl9L2csIGZ1bmN0aW9uIChtYXRjaCwgbnVtYmVyKSB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBhcmdzW251bWJlcl0gPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIE1hdGgudHJ1bmMoYXJnc1tudW1iZXJdICogMTAwMCkgLyAxMDAwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gdHlwZW9mIGFyZ3NbbnVtYmVyXSAhPSBcInVuZGVmaW5lZFwiID8gYXJnc1tudW1iZXJdIDogbWF0Y2g7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgdmFyIGxpbmtGbGVldHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciB1bml2ZXJzZSA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2U7XG4gICAgICAgIHZhciBmbGVldHMgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlLmdhbGF4eS5mbGVldHM7XG4gICAgICAgIGZvciAodmFyIGYgaW4gZmxlZXRzKSB7XG4gICAgICAgICAgICB2YXIgZmxlZXQgPSBmbGVldHNbZl07XG4gICAgICAgICAgICB2YXIgZmxlZXRMaW5rID0gXCI8YSBvbkNsaWNrPSdDcnV4LmNydXgudHJpZ2dlcihcXFwic2hvd19mbGVldF91aWRcXFwiLCBcXFwiXCIuY29uY2F0KGZsZWV0LnVpZCwgXCJcXFwiKSc+XCIpLmNvbmNhdChmbGVldC5uLCBcIjwvYT5cIik7XG4gICAgICAgICAgICB1bml2ZXJzZS5oeXBlcmxpbmtlZE1lc3NhZ2VJbnNlcnRzW2ZsZWV0Lm5dID0gZmxlZXRMaW5rO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBmdW5jdGlvbiBzdGFyUmVwb3J0KCkge1xuICAgICAgICB2YXIgcGxheWVycyA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2UuZ2FsYXh5LnBsYXllcnM7XG4gICAgICAgIHZhciBzdGFycyA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2UuZ2FsYXh5LnN0YXJzO1xuICAgICAgICB2YXIgb3V0cHV0ID0gW107XG4gICAgICAgIGZvciAodmFyIHAgaW4gcGxheWVycykge1xuICAgICAgICAgICAgb3V0cHV0LnB1c2goXCJbW3swfV1dXCIuZm9ybWF0KHApKTtcbiAgICAgICAgICAgIGZvciAodmFyIHMgaW4gc3RhcnMpIHtcbiAgICAgICAgICAgICAgICB2YXIgc3RhciA9IHN0YXJzW3NdO1xuICAgICAgICAgICAgICAgIGlmIChzdGFyLnB1aWQgPT0gcCAmJiBzdGFyLnNoaXBzUGVyVGljayA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIG91dHB1dC5wdXNoKFwi4oCD4oCDW1t7MH1dXSB7MX0vezJ9L3szfSB7NH0gc2hpcHNcIi5mb3JtYXQoc3Rhci5uLCBzdGFyLmUsIHN0YXIuaSwgc3Rhci5zLCBzdGFyLnRvdGFsRGVmZW5zZXMpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2xpcChvdXRwdXQuam9pbihcIlxcblwiKSk7XG4gICAgfVxuICAgIGhvdGtleShcIipcIiwgc3RhclJlcG9ydCk7XG4gICAgc3RhclJlcG9ydC5oZWxwID1cbiAgICAgICAgXCJHZW5lcmF0ZSBhIHJlcG9ydCBvbiBhbGwgc3RhcnMgaW4geW91ciBzY2FubmluZyByYW5nZSwgYW5kIGNvcHkgaXQgdG8gdGhlIGNsaXBib2FyZC5cIiArXG4gICAgICAgICAgICBcIjxwPlRoaXMgc2FtZSByZXBvcnQgY2FuIGFsc28gYmUgdmlld2VkIHZpYSB0aGUgbWVudTsgZW50ZXIgdGhlIGFnZW50IGFuZCBjaG9vc2UgaXQgZnJvbSB0aGUgZHJvcGRvd24uXCI7XG4gICAgdmFyIGFtcG0gPSBmdW5jdGlvbiAoaCwgbSkge1xuICAgICAgICBpZiAobSA8IDEwKVxuICAgICAgICAgICAgbSA9IFwiMFwiLmNvbmNhdChtKTtcbiAgICAgICAgaWYgKGggPCAxMikge1xuICAgICAgICAgICAgaWYgKGggPT0gMClcbiAgICAgICAgICAgICAgICBoID0gMTI7XG4gICAgICAgICAgICByZXR1cm4gXCJ7MH06ezF9IEFNXCIuZm9ybWF0KGgsIG0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGggPiAxMikge1xuICAgICAgICAgICAgcmV0dXJuIFwiezB9OnsxfSBQTVwiLmZvcm1hdChoIC0gMTIsIG0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBcInswfTp7MX0gUE1cIi5mb3JtYXQoaCwgbSk7XG4gICAgfTtcbiAgICB2YXIgbXNUb1RpY2sgPSBmdW5jdGlvbiAodGljaywgd2hvbGVUaW1lKSB7XG4gICAgICAgIHZhciB1bml2ZXJzZSA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2U7XG4gICAgICAgIHZhciBtc19zaW5jZV9kYXRhID0gMDtcbiAgICAgICAgdmFyIHRmID0gdW5pdmVyc2UuZ2FsYXh5LnRpY2tfZnJhZ21lbnQ7XG4gICAgICAgIHZhciBsdGMgPSB1bml2ZXJzZS5sb2NUaW1lQ29ycmVjdGlvbjtcbiAgICAgICAgaWYgKCF1bml2ZXJzZS5nYWxheHkucGF1c2VkKSB7XG4gICAgICAgICAgICBtc19zaW5jZV9kYXRhID0gbmV3IERhdGUoKS52YWx1ZU9mKCkgLSB1bml2ZXJzZS5ub3cudmFsdWVPZigpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh3aG9sZVRpbWUgfHwgdW5pdmVyc2UuZ2FsYXh5LnR1cm5fYmFzZWQpIHtcbiAgICAgICAgICAgIG1zX3NpbmNlX2RhdGEgPSAwO1xuICAgICAgICAgICAgdGYgPSAwO1xuICAgICAgICAgICAgbHRjID0gMDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgbXNfcmVtYWluaW5nID0gdGljayAqIDEwMDAgKiA2MCAqIHVuaXZlcnNlLmdhbGF4eS50aWNrX3JhdGUgLVxuICAgICAgICAgICAgdGYgKiAxMDAwICogNjAgKiB1bml2ZXJzZS5nYWxheHkudGlja19yYXRlIC1cbiAgICAgICAgICAgIG1zX3NpbmNlX2RhdGEgLVxuICAgICAgICAgICAgbHRjO1xuICAgICAgICByZXR1cm4gbXNfcmVtYWluaW5nO1xuICAgIH07XG4gICAgdmFyIGRheXMgPSBbXCJTdW5cIiwgXCJNb25cIiwgXCJUdWVcIiwgXCJXZWRcIiwgXCJUaHVcIiwgXCJGcmlcIiwgXCJTYXRcIl07XG4gICAgdmFyIG1zVG9FdGFTdHJpbmcgPSBmdW5jdGlvbiAobXNwbHVzLCBwcmVmaXgpIHtcbiAgICAgICAgdmFyIG5vdyA9IG5ldyBEYXRlKCk7XG4gICAgICAgIHZhciBhcnJpdmFsID0gbmV3IERhdGUobm93LmdldFRpbWUoKSArIG1zcGx1cyk7XG4gICAgICAgIHZhciBwID0gcHJlZml4ICE9PSB1bmRlZmluZWQgPyBwcmVmaXggOiBcIkVUQSBcIjtcbiAgICAgICAgLy9XaGF0IGlzIHR0dD9cbiAgICAgICAgdmFyIHR0dCA9IHAgKyBhbXBtKGFycml2YWwuZ2V0SG91cnMoKSwgYXJyaXZhbC5nZXRNaW51dGVzKCkpO1xuICAgICAgICBpZiAoIU5lcHR1bmVzUHJpZGUuZ2FtZUNvbmZpZy50dXJuQmFzZWQpIHtcbiAgICAgICAgICAgIHR0dCA9IHAgKyBhbXBtKGFycml2YWwuZ2V0SG91cnMoKSwgYXJyaXZhbC5nZXRNaW51dGVzKCkpO1xuICAgICAgICAgICAgaWYgKGFycml2YWwuZ2V0RGF5KCkgIT0gbm93LmdldERheSgpKVxuICAgICAgICAgICAgICAgIC8vIEdlbmVyYXRlIHRpbWUgc3RyaW5nXG4gICAgICAgICAgICAgICAgdHR0ID0gXCJcIi5jb25jYXQocCkuY29uY2F0KGRheXNbYXJyaXZhbC5nZXREYXkoKV0sIFwiIEAgXCIpLmNvbmNhdChhbXBtKGFycml2YWwuZ2V0SG91cnMoKSwgYXJyaXZhbC5nZXRNaW51dGVzKCkpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHZhciB0b3RhbEVUQSA9IGFycml2YWwgLSBub3c7XG4gICAgICAgICAgICB0dHQgPSBwICsgQ3J1eC5mb3JtYXRUaW1lKHRvdGFsRVRBKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHR0O1xuICAgIH07XG4gICAgdmFyIHRpY2tUb0V0YVN0cmluZyA9IGZ1bmN0aW9uICh0aWNrLCBwcmVmaXgpIHtcbiAgICAgICAgdmFyIG1zcGx1cyA9IG1zVG9UaWNrKHRpY2spO1xuICAgICAgICByZXR1cm4gbXNUb0V0YVN0cmluZyhtc3BsdXMsIHByZWZpeCk7XG4gICAgfTtcbiAgICB2YXIgbXNUb0N5Y2xlU3RyaW5nID0gZnVuY3Rpb24gKG1zcGx1cywgcHJlZml4KSB7XG4gICAgICAgIHZhciBwID0gcHJlZml4ICE9PSB1bmRlZmluZWQgPyBwcmVmaXggOiBcIkVUQVwiO1xuICAgICAgICB2YXIgY3ljbGVMZW5ndGggPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlLmdhbGF4eS5wcm9kdWN0aW9uX3JhdGU7XG4gICAgICAgIHZhciB0aWNrTGVuZ3RoID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5nYWxheHkudGlja19yYXRlO1xuICAgICAgICB2YXIgdGlja3NUb0NvbXBsZXRlID0gTWF0aC5jZWlsKG1zcGx1cyAvIDYwMDAwIC8gdGlja0xlbmd0aCk7XG4gICAgICAgIC8vR2VuZXJhdGUgdGltZSB0ZXh0IHN0cmluZ1xuICAgICAgICB2YXIgdHR0ID0gXCJcIi5jb25jYXQocCkuY29uY2F0KHRpY2tzVG9Db21wbGV0ZSwgXCIgdGlja3MgLSBcIikuY29uY2F0KCh0aWNrc1RvQ29tcGxldGUgLyBjeWNsZUxlbmd0aCkudG9GaXhlZCgyKSwgXCJDXCIpO1xuICAgICAgICByZXR1cm4gdHR0O1xuICAgIH07XG4gICAgdmFyIGZsZWV0T3V0Y29tZXMgPSB7fTtcbiAgICB2YXIgY29tYmF0SGFuZGljYXAgPSAwO1xuICAgIHZhciBjb21iYXRPdXRjb21lcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIF9hO1xuICAgICAgICB2YXIgdW5pdmVyc2UgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlO1xuICAgICAgICB2YXIgcGxheWVycyA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2UuZ2FsYXh5LnBsYXllcnM7XG4gICAgICAgIHZhciBmbGVldHMgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlLmdhbGF4eS5mbGVldHM7XG4gICAgICAgIHZhciBzdGFycyA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2UuZ2FsYXh5LnN0YXJzO1xuICAgICAgICB2YXIgZmxpZ2h0cyA9IFtdO1xuICAgICAgICBmbGVldE91dGNvbWVzID0ge307XG4gICAgICAgIGZvciAodmFyIGYgaW4gZmxlZXRzKSB7XG4gICAgICAgICAgICB2YXIgZmxlZXQgPSBmbGVldHNbZl07XG4gICAgICAgICAgICBpZiAoZmxlZXQubyAmJiBmbGVldC5vLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICB2YXIgc3RvcF8xID0gZmxlZXQub1swXVsxXTtcbiAgICAgICAgICAgICAgICB2YXIgdGlja3MgPSBmbGVldC5ldGFGaXJzdDtcbiAgICAgICAgICAgICAgICB2YXIgc3Rhcm5hbWUgPSAoX2EgPSBzdGFyc1tzdG9wXzFdKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2EubjtcbiAgICAgICAgICAgICAgICBpZiAoIXN0YXJuYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmbGlnaHRzLnB1c2goW1xuICAgICAgICAgICAgICAgICAgICB0aWNrcyxcbiAgICAgICAgICAgICAgICAgICAgXCJbW3swfV1dIFtbezF9XV0gezJ9IOKGkiBbW3szfV1dIHs0fVwiLmZvcm1hdChmbGVldC5wdWlkLCBmbGVldC5uLCBmbGVldC5zdCwgc3Rhcm5hbWUsIHRpY2tUb0V0YVN0cmluZyh0aWNrcykpLFxuICAgICAgICAgICAgICAgICAgICBmbGVldCxcbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmbGlnaHRzID0gZmxpZ2h0cy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgICAgICByZXR1cm4gYVswXSAtIGJbMF07XG4gICAgICAgIH0pO1xuICAgICAgICB2YXIgYXJyaXZhbHMgPSB7fTtcbiAgICAgICAgdmFyIG91dHB1dCA9IFtdO1xuICAgICAgICB2YXIgYXJyaXZhbFRpbWVzID0gW107XG4gICAgICAgIHZhciBzdGFyc3RhdGUgPSB7fTtcbiAgICAgICAgZm9yICh2YXIgaSBpbiBmbGlnaHRzKSB7XG4gICAgICAgICAgICB2YXIgZmxlZXQgPSBmbGlnaHRzW2ldWzJdO1xuICAgICAgICAgICAgaWYgKGZsZWV0Lm9yYml0aW5nKSB7XG4gICAgICAgICAgICAgICAgdmFyIG9yYml0ID0gZmxlZXQub3JiaXRpbmcudWlkO1xuICAgICAgICAgICAgICAgIGlmICghc3RhcnN0YXRlW29yYml0XSkge1xuICAgICAgICAgICAgICAgICAgICBzdGFyc3RhdGVbb3JiaXRdID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFzdF91cGRhdGVkOiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2hpcHM6IHN0YXJzW29yYml0XS50b3RhbERlZmVuc2VzLFxuICAgICAgICAgICAgICAgICAgICAgICAgcHVpZDogc3RhcnNbb3JiaXRdLnB1aWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBjOiBzdGFyc1tvcmJpdF0uYyxcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gVGhpcyBmbGVldCBpcyBkZXBhcnRpbmcgdGhpcyB0aWNrOyByZW1vdmUgaXQgZnJvbSB0aGUgb3JpZ2luIHN0YXIncyB0b3RhbERlZmVuc2VzXG4gICAgICAgICAgICAgICAgc3RhcnN0YXRlW29yYml0XS5zaGlwcyAtPSBmbGVldC5zdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChhcnJpdmFsVGltZXMubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgYXJyaXZhbFRpbWVzW2Fycml2YWxUaW1lcy5sZW5ndGggLSAxXSAhPT0gZmxpZ2h0c1tpXVswXSkge1xuICAgICAgICAgICAgICAgIGFycml2YWxUaW1lcy5wdXNoKGZsaWdodHNbaV1bMF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGFycml2YWxLZXkgPSBbZmxpZ2h0c1tpXVswXSwgZmxlZXQub1swXVsxXV07XG4gICAgICAgICAgICBpZiAoYXJyaXZhbHNbYXJyaXZhbEtleV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGFycml2YWxzW2Fycml2YWxLZXldLnB1c2goZmxlZXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgYXJyaXZhbHNbYXJyaXZhbEtleV0gPSBbZmxlZXRdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZvciAodmFyIGsgaW4gYXJyaXZhbHMpIHtcbiAgICAgICAgICAgIHZhciBhcnJpdmFsID0gYXJyaXZhbHNba107XG4gICAgICAgICAgICB2YXIga2EgPSBrLnNwbGl0KFwiLFwiKTtcbiAgICAgICAgICAgIHZhciB0aWNrID0ga2FbMF07XG4gICAgICAgICAgICB2YXIgc3RhcklkID0ga2FbMV07XG4gICAgICAgICAgICBpZiAoIXN0YXJzdGF0ZVtzdGFySWRdKSB7XG4gICAgICAgICAgICAgICAgc3RhcnN0YXRlW3N0YXJJZF0gPSB7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RfdXBkYXRlZDogMCxcbiAgICAgICAgICAgICAgICAgICAgc2hpcHM6IHN0YXJzW3N0YXJJZF0udG90YWxEZWZlbnNlcyxcbiAgICAgICAgICAgICAgICAgICAgcHVpZDogc3RhcnNbc3RhcklkXS5wdWlkLFxuICAgICAgICAgICAgICAgICAgICBjOiBzdGFyc1tzdGFySWRdLmMsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzdGFyc3RhdGVbc3RhcklkXS5wdWlkID09IC0xKSB7XG4gICAgICAgICAgICAgICAgLy8gYXNzaWduIG93bmVyc2hpcCBvZiB0aGUgc3RhciB0byB0aGUgcGxheWVyIHdob3NlIGZsZWV0IGhhcyB0cmF2ZWxlZCB0aGUgbGVhc3QgZGlzdGFuY2VcbiAgICAgICAgICAgICAgICB2YXIgbWluRGlzdGFuY2UgPSAxMDAwMDtcbiAgICAgICAgICAgICAgICB2YXIgb3duZXIgPSAtMTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpIGluIGFycml2YWwpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZsZWV0ID0gYXJyaXZhbFtpXTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGQgPSB1bml2ZXJzZS5kaXN0YW5jZShzdGFyc1tzdGFySWRdLngsIHN0YXJzW3N0YXJJZF0ueSwgZmxlZXQubHgsIGZsZWV0Lmx5KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGQgPCBtaW5EaXN0YW5jZSB8fCBvd25lciA9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3duZXIgPSBmbGVldC5wdWlkO1xuICAgICAgICAgICAgICAgICAgICAgICAgbWluRGlzdGFuY2UgPSBkO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHN0YXJzdGF0ZVtzdGFySWRdLnB1aWQgPSBvd25lcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG91dHB1dC5wdXNoKFwiezB9OiBbW3sxfV1dIFtbezJ9XV0gezN9IHNoaXBzXCIuZm9ybWF0KHRpY2tUb0V0YVN0cmluZyh0aWNrLCBcIkBcIiksIHN0YXJzdGF0ZVtzdGFySWRdLnB1aWQsIHN0YXJzW3N0YXJJZF0ubiwgc3RhcnN0YXRlW3N0YXJJZF0uc2hpcHMpKTtcbiAgICAgICAgICAgIHZhciB0aWNrRGVsdGEgPSB0aWNrIC0gc3RhcnN0YXRlW3N0YXJJZF0ubGFzdF91cGRhdGVkIC0gMTtcbiAgICAgICAgICAgIGlmICh0aWNrRGVsdGEgPiAwKSB7XG4gICAgICAgICAgICAgICAgdmFyIG9sZFNoaXBzID0gc3RhcnN0YXRlW3N0YXJJZF0uc2hpcHM7XG4gICAgICAgICAgICAgICAgc3RhcnN0YXRlW3N0YXJJZF0ubGFzdF91cGRhdGVkID0gdGljayAtIDE7XG4gICAgICAgICAgICAgICAgaWYgKHN0YXJzW3N0YXJJZF0uc2hpcHNQZXJUaWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBvbGRjID0gc3RhcnN0YXRlW3N0YXJJZF0uYztcbiAgICAgICAgICAgICAgICAgICAgc3RhcnN0YXRlW3N0YXJJZF0uc2hpcHMgKz1cbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJzW3N0YXJJZF0uc2hpcHNQZXJUaWNrICogdGlja0RlbHRhICsgb2xkYztcbiAgICAgICAgICAgICAgICAgICAgc3RhcnN0YXRlW3N0YXJJZF0uYyA9XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFyc3RhdGVbc3RhcklkXS5zaGlwcyAtIE1hdGgudHJ1bmMoc3RhcnN0YXRlW3N0YXJJZF0uc2hpcHMpO1xuICAgICAgICAgICAgICAgICAgICBzdGFyc3RhdGVbc3RhcklkXS5zaGlwcyAtPSBzdGFyc3RhdGVbc3RhcklkXS5jO1xuICAgICAgICAgICAgICAgICAgICBvdXRwdXQucHVzaChcIuKAg+KAg3swfSt7M30gKyB7Mn0vaCA9IHsxfSt7NH1cIi5mb3JtYXQob2xkU2hpcHMsIHN0YXJzdGF0ZVtzdGFySWRdLnNoaXBzLCBzdGFyc1tzdGFySWRdLnNoaXBzUGVyVGljaywgb2xkYywgc3RhcnN0YXRlW3N0YXJJZF0uYykpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAodmFyIGkgaW4gYXJyaXZhbCkge1xuICAgICAgICAgICAgICAgIHZhciBmbGVldCA9IGFycml2YWxbaV07XG4gICAgICAgICAgICAgICAgaWYgKGZsZWV0LnB1aWQgPT0gc3RhcnN0YXRlW3N0YXJJZF0ucHVpZCB8fFxuICAgICAgICAgICAgICAgICAgICBzdGFyc3RhdGVbc3RhcklkXS5wdWlkID09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBvbGRTaGlwcyA9IHN0YXJzdGF0ZVtzdGFySWRdLnNoaXBzO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3RhcnN0YXRlW3N0YXJJZF0ucHVpZCA9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnN0YXRlW3N0YXJJZF0uc2hpcHMgPSBmbGVldC5zdDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJzdGF0ZVtzdGFySWRdLnNoaXBzICs9IGZsZWV0LnN0O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHZhciBsYW5kaW5nU3RyaW5nID0gXCLigIPigIN7MH0gKyB7Mn0gb24gW1t7M31dXSA9IHsxfVwiLmZvcm1hdChvbGRTaGlwcywgc3RhcnN0YXRlW3N0YXJJZF0uc2hpcHMsIGZsZWV0LnN0LCBmbGVldC5uKTtcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0LnB1c2gobGFuZGluZ1N0cmluZyk7XG4gICAgICAgICAgICAgICAgICAgIGxhbmRpbmdTdHJpbmcgPSBsYW5kaW5nU3RyaW5nLnN1YnN0cmluZygyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKHZhciBpIGluIGFycml2YWwpIHtcbiAgICAgICAgICAgICAgICB2YXIgZmxlZXQgPSBhcnJpdmFsW2ldO1xuICAgICAgICAgICAgICAgIGlmIChmbGVldC5wdWlkID09IHN0YXJzdGF0ZVtzdGFySWRdLnB1aWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG91dGNvbWVTdHJpbmcgPSBcInswfSBzaGlwcyBvbiB7MX1cIi5mb3JtYXQoTWF0aC5mbG9vcihzdGFyc3RhdGVbc3RhcklkXS5zaGlwcyksIHN0YXJzW3N0YXJJZF0ubik7XG4gICAgICAgICAgICAgICAgICAgIGZsZWV0T3V0Y29tZXNbZmxlZXQudWlkXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV0YTogdGlja1RvRXRhU3RyaW5nKGZsZWV0LmV0YUZpcnN0KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dGNvbWU6IG91dGNvbWVTdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGF3dCA9IDA7XG4gICAgICAgICAgICB2YXIgb2ZmZW5zZSA9IDA7XG4gICAgICAgICAgICB2YXIgY29udHJpYnV0aW9uID0ge307XG4gICAgICAgICAgICBmb3IgKHZhciBpIGluIGFycml2YWwpIHtcbiAgICAgICAgICAgICAgICB2YXIgZmxlZXQgPSBhcnJpdmFsW2ldO1xuICAgICAgICAgICAgICAgIGlmIChmbGVldC5wdWlkICE9IHN0YXJzdGF0ZVtzdGFySWRdLnB1aWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG9sZGEgPSBvZmZlbnNlO1xuICAgICAgICAgICAgICAgICAgICBvZmZlbnNlICs9IGZsZWV0LnN0O1xuICAgICAgICAgICAgICAgICAgICBvdXRwdXQucHVzaChcIuKAg+KAg1tbezR9XV0hIHswfSArIHsyfSBvbiBbW3szfV1dID0gezF9XCIuZm9ybWF0KG9sZGEsIG9mZmVuc2UsIGZsZWV0LnN0LCBmbGVldC5uLCBmbGVldC5wdWlkKSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRyaWJ1dGlvbltbZmxlZXQucHVpZCwgZmxlZXQudWlkXV0gPSBmbGVldC5zdDtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHd0ID0gcGxheWVyc1tmbGVldC5wdWlkXS50ZWNoLndlYXBvbnMubGV2ZWw7XG4gICAgICAgICAgICAgICAgICAgIGlmICh3dCA+IGF3dCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXd0ID0gd3Q7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgYXR0YWNrZXJzQWdncmVnYXRlID0gb2ZmZW5zZTtcbiAgICAgICAgICAgIHdoaWxlIChvZmZlbnNlID4gMCkge1xuICAgICAgICAgICAgICAgIHZhciBkd3QgPSBwbGF5ZXJzW3N0YXJzdGF0ZVtzdGFySWRdLnB1aWRdLnRlY2gud2VhcG9ucy5sZXZlbDtcbiAgICAgICAgICAgICAgICB2YXIgZGVmZW5zZSA9IHN0YXJzdGF0ZVtzdGFySWRdLnNoaXBzO1xuICAgICAgICAgICAgICAgIG91dHB1dC5wdXNoKFwi4oCD4oCDQ29tYmF0ISBbW3swfV1dIGRlZmVuZGluZ1wiLmZvcm1hdChzdGFyc3RhdGVbc3RhcklkXS5wdWlkKSk7XG4gICAgICAgICAgICAgICAgb3V0cHV0LnB1c2goXCLigIPigIPigIPigINEZWZlbmRlcnMgezB9IHNoaXBzLCBXUyB7MX1cIi5mb3JtYXQoZGVmZW5zZSwgZHd0KSk7XG4gICAgICAgICAgICAgICAgb3V0cHV0LnB1c2goXCLigIPigIPigIPigINBdHRhY2tlcnMgezB9IHNoaXBzLCBXUyB7MX1cIi5mb3JtYXQob2ZmZW5zZSwgYXd0KSk7XG4gICAgICAgICAgICAgICAgZHd0ICs9IDE7XG4gICAgICAgICAgICAgICAgaWYgKHN0YXJzdGF0ZVtzdGFySWRdLnB1aWQgIT09IHVuaXZlcnNlLmdhbGF4eS5wbGF5ZXJfdWlkKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb21iYXRIYW5kaWNhcCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGR3dCArPSBjb21iYXRIYW5kaWNhcDtcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dC5wdXNoKFwi4oCD4oCD4oCD4oCDRGVmZW5kZXJzIFdTezB9ID0gezF9XCIuZm9ybWF0KGhhbmRpY2FwU3RyaW5nKFwiXCIpLCBkd3QpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF3dCAtPSBjb21iYXRIYW5kaWNhcDtcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dC5wdXNoKFwi4oCD4oCD4oCD4oCDQXR0YWNrZXJzIFdTezB9ID0gezF9XCIuZm9ybWF0KGhhbmRpY2FwU3RyaW5nKFwiXCIpLCBhd3QpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbWJhdEhhbmRpY2FwID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXd0ICs9IGNvbWJhdEhhbmRpY2FwO1xuICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0LnB1c2goXCLigIPigIPigIPigINBdHRhY2tlcnMgV1N7MH0gPSB7MX1cIi5mb3JtYXQoaGFuZGljYXBTdHJpbmcoXCJcIiksIGF3dCkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZHd0IC09IGNvbWJhdEhhbmRpY2FwO1xuICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0LnB1c2goXCLigIPigIPigIPigINEZWZlbmRlcnMgV1N7MH0gPSB7MX1cIi5mb3JtYXQoaGFuZGljYXBTdHJpbmcoXCJcIiksIGR3dCkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh1bml2ZXJzZS5nYWxheHkucGxheWVyX3VpZCA9PT0gc3RhcnN0YXRlW3N0YXJJZF0ucHVpZCkge1xuICAgICAgICAgICAgICAgICAgICAvLyB0cnVuY2F0ZSBkZWZlbnNlIGlmIHdlJ3JlIGRlZmVuZGluZyB0byBnaXZlIHRoZSBtb3N0XG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnNlcnZhdGl2ZSBlc3RpbWF0ZVxuICAgICAgICAgICAgICAgICAgICBkZWZlbnNlID0gTWF0aC50cnVuYyhkZWZlbnNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgd2hpbGUgKGRlZmVuc2UgPiAwICYmIG9mZmVuc2UgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIG9mZmVuc2UgLT0gZHd0O1xuICAgICAgICAgICAgICAgICAgICBpZiAob2ZmZW5zZSA8PSAwKVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGRlZmVuc2UgLT0gYXd0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgbmV3QWdncmVnYXRlID0gMDtcbiAgICAgICAgICAgICAgICB2YXIgcGxheWVyQ29udHJpYnV0aW9uID0ge307XG4gICAgICAgICAgICAgICAgdmFyIGJpZ2dlc3RQbGF5ZXIgPSAtMTtcbiAgICAgICAgICAgICAgICB2YXIgYmlnZ2VzdFBsYXllcklkID0gc3RhcnN0YXRlW3N0YXJJZF0ucHVpZDtcbiAgICAgICAgICAgICAgICBpZiAob2ZmZW5zZSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0LnB1c2goXCLigIPigINBdHRhY2tlcnMgd2luIHdpdGggezB9IHNoaXBzIHJlbWFpbmluZ1wiLmZvcm1hdChvZmZlbnNlKSk7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGtfMSBpbiBjb250cmlidXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBrYV8xID0ga18xLnNwbGl0KFwiLFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmbGVldCA9IGZsZWV0c1trYV8xWzFdXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwbGF5ZXJJZCA9IGthXzFbMF07XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250cmlidXRpb25ba18xXSA9IChvZmZlbnNlICogY29udHJpYnV0aW9uW2tfMV0pIC8gYXR0YWNrZXJzQWdncmVnYXRlO1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV3QWdncmVnYXRlICs9IGNvbnRyaWJ1dGlvbltrXzFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBsYXllckNvbnRyaWJ1dGlvbltwbGF5ZXJJZF0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbGF5ZXJDb250cmlidXRpb25bcGxheWVySWRdICs9IGNvbnRyaWJ1dGlvbltrXzFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGxheWVyQ29udHJpYnV0aW9uW3BsYXllcklkXSA9IGNvbnRyaWJ1dGlvbltrXzFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBsYXllckNvbnRyaWJ1dGlvbltwbGF5ZXJJZF0gPiBiaWdnZXN0UGxheWVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmlnZ2VzdFBsYXllciA9IHBsYXllckNvbnRyaWJ1dGlvbltwbGF5ZXJJZF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmlnZ2VzdFBsYXllcklkID0gcGxheWVySWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXQucHVzaChcIuKAg+KAg+KAg+KAg1tbezB9XV0gaGFzIHsxfSBvbiBbW3syfV1dXCIuZm9ybWF0KGZsZWV0LnB1aWQsIGNvbnRyaWJ1dGlvbltrXzFdLCBmbGVldC5uKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgb3V0Y29tZVN0cmluZyA9IFwiV2lucyEgezB9IGxhbmQuXCIuZm9ybWF0KGNvbnRyaWJ1dGlvbltrXzFdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZsZWV0T3V0Y29tZXNbZmxlZXQudWlkXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBldGE6IHRpY2tUb0V0YVN0cmluZyhmbGVldC5ldGFGaXJzdCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0Y29tZTogb3V0Y29tZVN0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgb2ZmZW5zZSA9IG5ld0FnZ3JlZ2F0ZSAtIHBsYXllckNvbnRyaWJ1dGlvbltiaWdnZXN0UGxheWVySWRdO1xuICAgICAgICAgICAgICAgICAgICBzdGFyc3RhdGVbc3RhcklkXS5wdWlkID0gYmlnZ2VzdFBsYXllcklkO1xuICAgICAgICAgICAgICAgICAgICBzdGFyc3RhdGVbc3RhcklkXS5zaGlwcyA9IHBsYXllckNvbnRyaWJ1dGlvbltiaWdnZXN0UGxheWVySWRdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhcnN0YXRlW3N0YXJJZF0uc2hpcHMgPSBkZWZlbnNlO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpIGluIGFycml2YWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmbGVldCA9IGFycml2YWxbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmxlZXQucHVpZCA9PSBzdGFyc3RhdGVbc3RhcklkXS5wdWlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG91dGNvbWVTdHJpbmcgPSBcInswfSBzaGlwcyBvbiB7MX1cIi5mb3JtYXQoTWF0aC5mbG9vcihzdGFyc3RhdGVbc3RhcklkXS5zaGlwcyksIHN0YXJzW3N0YXJJZF0ubik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmxlZXRPdXRjb21lc1tmbGVldC51aWRdID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBldGE6IHRpY2tUb0V0YVN0cmluZyhmbGVldC5ldGFGaXJzdCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dGNvbWU6IG91dGNvbWVTdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBrXzIgaW4gY29udHJpYnV0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIga2FfMiA9IGtfMi5zcGxpdChcIixcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZmxlZXQgPSBmbGVldHNba2FfMlsxXV07XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgb3V0Y29tZVN0cmluZyA9IFwiTG9zZXMhIHswfSBsaXZlLlwiLmZvcm1hdChkZWZlbnNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZsZWV0T3V0Y29tZXNbZmxlZXQudWlkXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBldGE6IHRpY2tUb0V0YVN0cmluZyhmbGVldC5ldGFGaXJzdCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0Y29tZTogb3V0Y29tZVN0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYXR0YWNrZXJzQWdncmVnYXRlID0gb2ZmZW5zZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG91dHB1dC5wdXNoKFwi4oCD4oCDW1t7MH1dXSBbW3sxfV1dIHsyfSBzaGlwc1wiLmZvcm1hdChzdGFyc3RhdGVbc3RhcklkXS5wdWlkLCBzdGFyc1tzdGFySWRdLm4sIHN0YXJzdGF0ZVtzdGFySWRdLnNoaXBzKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICB9O1xuICAgIGZ1bmN0aW9uIGluY0NvbWJhdEhhbmRpY2FwKCkge1xuICAgICAgICBjb21iYXRIYW5kaWNhcCArPSAxO1xuICAgIH1cbiAgICBmdW5jdGlvbiBkZWNDb21iYXRIYW5kaWNhcCgpIHtcbiAgICAgICAgY29tYmF0SGFuZGljYXAgLT0gMTtcbiAgICB9XG4gICAgaG90a2V5KFwiLlwiLCBpbmNDb21iYXRIYW5kaWNhcCk7XG4gICAgaW5jQ29tYmF0SGFuZGljYXAuaGVscCA9XG4gICAgICAgIFwiQ2hhbmdlIGNvbWJhdCBjYWxjdWxhdGlvbiB0byBjcmVkaXQgeW91ciBlbmVtaWVzIHdpdGggKzEgd2VhcG9ucy4gVXNlZnVsIFwiICtcbiAgICAgICAgICAgIFwiaWYgeW91IHN1c3BlY3QgdGhleSB3aWxsIGhhdmUgYWNoaWV2ZWQgdGhlIG5leHQgbGV2ZWwgb2YgdGVjaCBiZWZvcmUgYSBiYXR0bGUgeW91IGFyZSBpbnZlc3RpZ2F0aW5nLlwiICtcbiAgICAgICAgICAgIFwiPHA+SW4gdGhlIGxvd2VyIGxlZnQgb2YgdGhlIEhVRCwgYW4gaW5kaWNhdG9yIHdpbGwgYXBwZWFyIHJlbWluZGluZyB5b3Ugb2YgdGhlIHdlYXBvbnMgYWRqdXN0bWVudC4gSWYgdGhlIFwiICtcbiAgICAgICAgICAgIFwiaW5kaWNhdG9yIGFscmVhZHkgc2hvd3MgYW4gYWR2YW50YWdlIGZvciBkZWZlbmRlcnMsIHRoaXMgaG90a2V5IHdpbGwgcmVkdWNlIHRoYXQgYWR2YW50YWdlIGZpcnN0IGJlZm9yZSBjcmVkaXRpbmcgXCIgK1xuICAgICAgICAgICAgXCJ3ZWFwb25zIHRvIHlvdXIgb3Bwb25lbnQuXCI7XG4gICAgaG90a2V5KFwiLFwiLCBkZWNDb21iYXRIYW5kaWNhcCk7XG4gICAgZGVjQ29tYmF0SGFuZGljYXAuaGVscCA9XG4gICAgICAgIFwiQ2hhbmdlIGNvbWJhdCBjYWxjdWxhdGlvbiB0byBjcmVkaXQgeW91cnNlbGYgd2l0aCArMSB3ZWFwb25zLiBVc2VmdWwgXCIgK1xuICAgICAgICAgICAgXCJ3aGVuIHlvdSB3aWxsIGhhdmUgYWNoaWV2ZWQgdGhlIG5leHQgbGV2ZWwgb2YgdGVjaCBiZWZvcmUgYSBiYXR0bGUgeW91IGFyZSBpbnZlc3RpZ2F0aW5nLlwiICtcbiAgICAgICAgICAgIFwiPHA+SW4gdGhlIGxvd2VyIGxlZnQgb2YgdGhlIEhVRCwgYW4gaW5kaWNhdG9yIHdpbGwgYXBwZWFyIHJlbWluZGluZyB5b3Ugb2YgdGhlIHdlYXBvbnMgYWRqdXN0bWVudC4gV2hlbiBcIiArXG4gICAgICAgICAgICBcImluZGljYXRvciBhbHJlYWR5IHNob3dzIGFuIGFkdmFudGFnZSBmb3IgYXR0YWNrZXJzLCB0aGlzIGhvdGtleSB3aWxsIHJlZHVjZSB0aGF0IGFkdmFudGFnZSBmaXJzdCBiZWZvcmUgY3JlZGl0aW5nIFwiICtcbiAgICAgICAgICAgIFwid2VhcG9ucyB0byB5b3UuXCI7XG4gICAgZnVuY3Rpb24gbG9uZ0ZsZWV0UmVwb3J0KCkge1xuICAgICAgICBjbGlwKGNvbWJhdE91dGNvbWVzKCkuam9pbihcIlxcblwiKSk7XG4gICAgfVxuICAgIGhvdGtleShcIiZcIiwgbG9uZ0ZsZWV0UmVwb3J0KTtcbiAgICBsb25nRmxlZXRSZXBvcnQuaGVscCA9XG4gICAgICAgIFwiR2VuZXJhdGUgYSBkZXRhaWxlZCBmbGVldCByZXBvcnQgb24gYWxsIGNhcnJpZXJzIGluIHlvdXIgc2Nhbm5pbmcgcmFuZ2UsIGFuZCBjb3B5IGl0IHRvIHRoZSBjbGlwYm9hcmQuXCIgK1xuICAgICAgICAgICAgXCI8cD5UaGlzIHNhbWUgcmVwb3J0IGNhbiBhbHNvIGJlIHZpZXdlZCB2aWEgdGhlIG1lbnU7IGVudGVyIHRoZSBhZ2VudCBhbmQgY2hvb3NlIGl0IGZyb20gdGhlIGRyb3Bkb3duLlwiO1xuICAgIGZ1bmN0aW9uIGJyaWVmRmxlZXRSZXBvcnQoKSB7XG4gICAgICAgIHZhciBfYTtcbiAgICAgICAgdmFyIGZsZWV0cyA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2UuZ2FsYXh5LmZsZWV0cztcbiAgICAgICAgdmFyIHN0YXJzID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5nYWxheHkuc3RhcnM7XG4gICAgICAgIHZhciBmbGlnaHRzID0gW107XG4gICAgICAgIGZvciAodmFyIGYgaW4gZmxlZXRzKSB7XG4gICAgICAgICAgICB2YXIgZmxlZXQgPSBmbGVldHNbZl07XG4gICAgICAgICAgICBpZiAoZmxlZXQubyAmJiBmbGVldC5vLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICB2YXIgc3RvcF8yID0gZmxlZXQub1swXVsxXTtcbiAgICAgICAgICAgICAgICB2YXIgdGlja3MgPSBmbGVldC5ldGFGaXJzdDtcbiAgICAgICAgICAgICAgICB2YXIgc3Rhcm5hbWUgPSAoX2EgPSBzdGFyc1tzdG9wXzJdKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2EubjtcbiAgICAgICAgICAgICAgICBpZiAoIXN0YXJuYW1lKVxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICBmbGlnaHRzLnB1c2goW1xuICAgICAgICAgICAgICAgICAgICB0aWNrcyxcbiAgICAgICAgICAgICAgICAgICAgXCJbW3swfV1dIFtbezF9XV0gezJ9IOKGkiBbW3szfV1dIHs0fVwiLmZvcm1hdChmbGVldC5wdWlkLCBmbGVldC5uLCBmbGVldC5zdCwgc3RhcnNbc3RvcF8yXS5uLCB0aWNrVG9FdGFTdHJpbmcodGlja3MsIFwiXCIpKSxcbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmbGlnaHRzID0gZmxpZ2h0cy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgICAgICByZXR1cm4gYVswXSAtIGJbMF07XG4gICAgICAgIH0pO1xuICAgICAgICBjbGlwKGZsaWdodHMubWFwKGZ1bmN0aW9uICh4KSB7IHJldHVybiB4WzFdOyB9KS5qb2luKFwiXFxuXCIpKTtcbiAgICB9XG4gICAgaG90a2V5KFwiXlwiLCBicmllZkZsZWV0UmVwb3J0KTtcbiAgICBicmllZkZsZWV0UmVwb3J0LmhlbHAgPVxuICAgICAgICBcIkdlbmVyYXRlIGEgc3VtbWFyeSBmbGVldCByZXBvcnQgb24gYWxsIGNhcnJpZXJzIGluIHlvdXIgc2Nhbm5pbmcgcmFuZ2UsIGFuZCBjb3B5IGl0IHRvIHRoZSBjbGlwYm9hcmQuXCIgK1xuICAgICAgICAgICAgXCI8cD5UaGlzIHNhbWUgcmVwb3J0IGNhbiBhbHNvIGJlIHZpZXdlZCB2aWEgdGhlIG1lbnU7IGVudGVyIHRoZSBhZ2VudCBhbmQgY2hvb3NlIGl0IGZyb20gdGhlIGRyb3Bkb3duLlwiO1xuICAgIGZ1bmN0aW9uIHNjcmVlbnNob3QoKSB7XG4gICAgICAgIHZhciBtYXAgPSBOZXB0dW5lc1ByaWRlLm5wdWkubWFwO1xuICAgICAgICBjbGlwKG1hcC5jYW52YXNbMF0udG9EYXRhVVJMKFwiaW1hZ2Uvd2VicFwiLCAwLjA1KSk7XG4gICAgfVxuICAgIGhvdGtleShcIiNcIiwgc2NyZWVuc2hvdCk7XG4gICAgc2NyZWVuc2hvdC5oZWxwID1cbiAgICAgICAgXCJDcmVhdGUgYSBkYXRhOiBVUkwgb2YgdGhlIGN1cnJlbnQgbWFwLiBQYXN0ZSBpdCBpbnRvIGEgYnJvd3NlciB3aW5kb3cgdG8gdmlldy4gVGhpcyBpcyBsaWtlbHkgdG8gYmUgcmVtb3ZlZC5cIjtcbiAgICB2YXIgaG9tZVBsYW5ldHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBwID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5nYWxheHkucGxheWVycztcbiAgICAgICAgdmFyIG91dHB1dCA9IFtdO1xuICAgICAgICBmb3IgKHZhciBpIGluIHApIHtcbiAgICAgICAgICAgIHZhciBob21lID0gcFtpXS5ob21lO1xuICAgICAgICAgICAgaWYgKGhvbWUpIHtcbiAgICAgICAgICAgICAgICBvdXRwdXQucHVzaChcIlBsYXllciAjezB9IGlzIFtbezB9XV0gaG9tZSB7Mn0gW1t7MX1dXVwiLmZvcm1hdChpLCBob21lLm4sIGkgPT0gaG9tZS5wdWlkID8gXCJpc1wiIDogXCJ3YXNcIikpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgb3V0cHV0LnB1c2goXCJQbGF5ZXIgI3swfSBpcyBbW3swfV1dIGhvbWUgdW5rbm93blwiLmZvcm1hdChpKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2xpcChvdXRwdXQuam9pbihcIlxcblwiKSk7XG4gICAgfTtcbiAgICBob3RrZXkoXCIhXCIsIGhvbWVQbGFuZXRzKTtcbiAgICBob21lUGxhbmV0cy5oZWxwID1cbiAgICAgICAgXCJHZW5lcmF0ZSBhIHBsYXllciBzdW1tYXJ5IHJlcG9ydCBhbmQgY29weSBpdCB0byB0aGUgY2xpcGJvYXJkLlwiICtcbiAgICAgICAgICAgIFwiPHA+VGhpcyBzYW1lIHJlcG9ydCBjYW4gYWxzbyBiZSB2aWV3ZWQgdmlhIHRoZSBtZW51OyBlbnRlciB0aGUgYWdlbnQgYW5kIGNob29zZSBpdCBmcm9tIHRoZSBkcm9wZG93bi4gXCIgK1xuICAgICAgICAgICAgXCJJdCBpcyBtb3N0IHVzZWZ1bCBmb3IgZGlzY292ZXJpbmcgcGxheWVyIG51bWJlcnMgc28gdGhhdCB5b3UgY2FuIHdyaXRlIFtbI11dIHRvIHJlZmVyZW5jZSBhIHBsYXllciBpbiBtYWlsLlwiO1xuICAgIHZhciBwbGF5ZXJTaGVldCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHAgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlLmdhbGF4eS5wbGF5ZXJzO1xuICAgICAgICB2YXIgb3V0cHV0ID0gW107XG4gICAgICAgIHZhciBmaWVsZHMgPSBbXG4gICAgICAgICAgICBcImFsaWFzXCIsXG4gICAgICAgICAgICBcInRvdGFsX3N0YXJzXCIsXG4gICAgICAgICAgICBcInNoaXBzUGVyVGlja1wiLFxuICAgICAgICAgICAgXCJ0b3RhbF9zdHJlbmd0aFwiLFxuICAgICAgICAgICAgXCJ0b3RhbF9lY29ub215XCIsXG4gICAgICAgICAgICBcInRvdGFsX2ZsZWV0c1wiLFxuICAgICAgICAgICAgXCJ0b3RhbF9pbmR1c3RyeVwiLFxuICAgICAgICAgICAgXCJ0b3RhbF9zY2llbmNlXCIsXG4gICAgICAgIF07XG4gICAgICAgIG91dHB1dC5wdXNoKGZpZWxkcy5qb2luKFwiLFwiKSk7XG4gICAgICAgIHZhciBfbG9vcF8zID0gZnVuY3Rpb24gKGkpIHtcbiAgICAgICAgICAgIHBsYXllciA9IF9fYXNzaWduKHt9LCBwW2ldKTtcbiAgICAgICAgICAgIHZhciByZWNvcmQgPSBmaWVsZHMubWFwKGZ1bmN0aW9uIChmKSB7IHJldHVybiBwW2ldW2ZdOyB9KTtcbiAgICAgICAgICAgIG91dHB1dC5wdXNoKHJlY29yZC5qb2luKFwiLFwiKSk7XG4gICAgICAgIH07XG4gICAgICAgIGZvciAodmFyIGkgaW4gcCkge1xuICAgICAgICAgICAgX2xvb3BfMyhpKTtcbiAgICAgICAgfVxuICAgICAgICBjbGlwKG91dHB1dC5qb2luKFwiXFxuXCIpKTtcbiAgICB9O1xuICAgIGhvdGtleShcIiRcIiwgcGxheWVyU2hlZXQpO1xuICAgIHBsYXllclNoZWV0LmhlbHAgPVxuICAgICAgICBcIkdlbmVyYXRlIGEgcGxheWVyIHN1bW1hcnkgbWVhbiB0byBiZSBtYWRlIGludG8gYSBzcHJlYWRzaGVldC5cIiArXG4gICAgICAgICAgICBcIjxwPlRoZSBjbGlwYm9hcmQgc2hvdWxkIGJlIHBhc3RlZCBpbnRvIGEgQ1NWIGFuZCB0aGVuIGltcG9ydGVkLlwiO1xuICAgIHZhciBob29rc0xvYWRlZCA9IGZhbHNlO1xuICAgIHZhciBoYW5kaWNhcFN0cmluZyA9IGZ1bmN0aW9uIChwcmVmaXgpIHtcbiAgICAgICAgdmFyIHAgPSBwcmVmaXggIT09IHVuZGVmaW5lZCA/IHByZWZpeCA6IGNvbWJhdEhhbmRpY2FwID4gMCA/IFwiRW5lbXkgV1NcIiA6IFwiTXkgV1NcIjtcbiAgICAgICAgcmV0dXJuIHAgKyAoY29tYmF0SGFuZGljYXAgPiAwID8gXCIrXCIgOiBcIlwiKSArIGNvbWJhdEhhbmRpY2FwO1xuICAgIH07XG4gICAgdmFyIGxvYWRIb29rcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHN1cGVyRHJhd1RleHQgPSBOZXB0dW5lc1ByaWRlLm5wdWkubWFwLmRyYXdUZXh0O1xuICAgICAgICBOZXB0dW5lc1ByaWRlLm5wdWkubWFwLmRyYXdUZXh0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHVuaXZlcnNlID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZTtcbiAgICAgICAgICAgIHZhciBtYXAgPSBOZXB0dW5lc1ByaWRlLm5wdWkubWFwO1xuICAgICAgICAgICAgc3VwZXJEcmF3VGV4dCgpO1xuICAgICAgICAgICAgbWFwLmNvbnRleHQuZm9udCA9IFwiXCIuY29uY2F0KDE0ICogbWFwLnBpeGVsUmF0aW8sIFwicHggT3BlblNhbnNSZWd1bGFyLCBzYW5zLXNlcmlmXCIpO1xuICAgICAgICAgICAgbWFwLmNvbnRleHQuZmlsbFN0eWxlID0gXCIjRkYwMDAwXCI7XG4gICAgICAgICAgICBtYXAuY29udGV4dC50ZXh0QWxpZ24gPSBcInJpZ2h0XCI7XG4gICAgICAgICAgICBtYXAuY29udGV4dC50ZXh0QmFzZWxpbmUgPSBcIm1pZGRsZVwiO1xuICAgICAgICAgICAgdmFyIHYgPSB2ZXJzaW9uO1xuICAgICAgICAgICAgaWYgKGNvbWJhdEhhbmRpY2FwICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgdiA9IFwiXCIuY29uY2F0KGhhbmRpY2FwU3RyaW5nKCksIFwiIFwiKS5jb25jYXQodik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkcmF3T3ZlcmxheVN0cmluZyhtYXAuY29udGV4dCwgdiwgbWFwLnZpZXdwb3J0V2lkdGggLSAxMCwgbWFwLnZpZXdwb3J0SGVpZ2h0IC0gMTYgKiBtYXAucGl4ZWxSYXRpbyk7XG4gICAgICAgICAgICBpZiAoTmVwdHVuZXNQcmlkZS5vcmlnaW5hbFBsYXllciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgTmVwdHVuZXNQcmlkZS5vcmlnaW5hbFBsYXllciA9IHVuaXZlcnNlLnBsYXllci51aWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoTmVwdHVuZXNQcmlkZS5vcmlnaW5hbFBsYXllciAhPT0gdW5pdmVyc2UucGxheWVyLnVpZCkge1xuICAgICAgICAgICAgICAgIHZhciBuID0gdW5pdmVyc2UuZ2FsYXh5LnBsYXllcnNbdW5pdmVyc2UucGxheWVyLnVpZF0uYWxpYXM7XG4gICAgICAgICAgICAgICAgZHJhd092ZXJsYXlTdHJpbmcobWFwLmNvbnRleHQsIG4sIG1hcC52aWV3cG9ydFdpZHRoIC0gMTAwLCBtYXAudmlld3BvcnRIZWlnaHQgLSAyICogMTYgKiBtYXAucGl4ZWxSYXRpbyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodW5pdmVyc2Uuc2VsZWN0ZWRGbGVldCAmJiB1bml2ZXJzZS5zZWxlY3RlZEZsZWV0LnBhdGgubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coXCJTZWxlY3RlZCBmbGVldFwiLCB1bml2ZXJzZS5zZWxlY3RlZEZsZWV0KTtcbiAgICAgICAgICAgICAgICBtYXAuY29udGV4dC5mb250ID0gXCJcIi5jb25jYXQoMTQgKiBtYXAucGl4ZWxSYXRpbywgXCJweCBPcGVuU2Fuc1JlZ3VsYXIsIHNhbnMtc2VyaWZcIik7XG4gICAgICAgICAgICAgICAgbWFwLmNvbnRleHQuZmlsbFN0eWxlID0gXCIjRkYwMDAwXCI7XG4gICAgICAgICAgICAgICAgbWFwLmNvbnRleHQudGV4dEFsaWduID0gXCJsZWZ0XCI7XG4gICAgICAgICAgICAgICAgbWFwLmNvbnRleHQudGV4dEJhc2VsaW5lID0gXCJtaWRkbGVcIjtcbiAgICAgICAgICAgICAgICB2YXIgZHkgPSB1bml2ZXJzZS5zZWxlY3RlZEZsZWV0LnkgLSB1bml2ZXJzZS5zZWxlY3RlZEZsZWV0Lmx5O1xuICAgICAgICAgICAgICAgIHZhciBkeCA9IHVuaXZlcnNlLnNlbGVjdGVkRmxlZXQueCAtIHVuaXZlcnNlLnNlbGVjdGVkRmxlZXQubHg7XG4gICAgICAgICAgICAgICAgZHkgPSB1bml2ZXJzZS5zZWxlY3RlZEZsZWV0LnBhdGhbMF0ueSAtIHVuaXZlcnNlLnNlbGVjdGVkRmxlZXQueTtcbiAgICAgICAgICAgICAgICBkeCA9IHVuaXZlcnNlLnNlbGVjdGVkRmxlZXQucGF0aFswXS54IC0gdW5pdmVyc2Uuc2VsZWN0ZWRGbGVldC54O1xuICAgICAgICAgICAgICAgIHZhciBsaW5lSGVpZ2h0ID0gMTYgKiBtYXAucGl4ZWxSYXRpbztcbiAgICAgICAgICAgICAgICB2YXIgcmFkaXVzID0gMiAqIDAuMDI4ICogbWFwLnNjYWxlICogbWFwLnBpeGVsUmF0aW87XG4gICAgICAgICAgICAgICAgdmFyIGFuZ2xlID0gTWF0aC5hdGFuKGR5IC8gZHgpO1xuICAgICAgICAgICAgICAgIHZhciBvZmZzZXR4ID0gcmFkaXVzICogTWF0aC5jb3MoYW5nbGUpO1xuICAgICAgICAgICAgICAgIHZhciBvZmZzZXR5ID0gcmFkaXVzICogTWF0aC5zaW4oYW5nbGUpO1xuICAgICAgICAgICAgICAgIGlmIChvZmZzZXR4ID4gMCAmJiBkeCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0eCAqPSAtMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG9mZnNldHkgPiAwICYmIGR5ID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBvZmZzZXR5ICo9IC0xO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAob2Zmc2V0eCA8IDAgJiYgZHggPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgIG9mZnNldHggKj0gLTE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChvZmZzZXR5IDwgMCAmJiBkeSA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0eSAqPSAtMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29tYmF0T3V0Y29tZXMoKTtcbiAgICAgICAgICAgICAgICB2YXIgcyA9IGZsZWV0T3V0Y29tZXNbdW5pdmVyc2Uuc2VsZWN0ZWRGbGVldC51aWRdLmV0YTtcbiAgICAgICAgICAgICAgICB2YXIgbyA9IGZsZWV0T3V0Y29tZXNbdW5pdmVyc2Uuc2VsZWN0ZWRGbGVldC51aWRdLm91dGNvbWU7XG4gICAgICAgICAgICAgICAgdmFyIHggPSBtYXAud29ybGRUb1NjcmVlblgodW5pdmVyc2Uuc2VsZWN0ZWRGbGVldC54KSArIG9mZnNldHg7XG4gICAgICAgICAgICAgICAgdmFyIHkgPSBtYXAud29ybGRUb1NjcmVlblkodW5pdmVyc2Uuc2VsZWN0ZWRGbGVldC55KSArIG9mZnNldHk7XG4gICAgICAgICAgICAgICAgaWYgKG9mZnNldHggPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgIG1hcC5jb250ZXh0LnRleHRBbGlnbiA9IFwicmlnaHRcIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZHJhd092ZXJsYXlTdHJpbmcobWFwLmNvbnRleHQsIHMsIHgsIHkpO1xuICAgICAgICAgICAgICAgIGRyYXdPdmVybGF5U3RyaW5nKG1hcC5jb250ZXh0LCBvLCB4LCB5ICsgbGluZUhlaWdodCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIU5lcHR1bmVzUHJpZGUuZ2FtZUNvbmZpZy50dXJuQmFzZWQgJiZcbiAgICAgICAgICAgICAgICB1bml2ZXJzZS50aW1lVG9UaWNrKDEpLmxlbmd0aCA8IDMpIHtcbiAgICAgICAgICAgICAgICB2YXIgbGluZUhlaWdodCA9IDE2ICogbWFwLnBpeGVsUmF0aW87XG4gICAgICAgICAgICAgICAgbWFwLmNvbnRleHQuZm9udCA9IFwiXCIuY29uY2F0KDE0ICogbWFwLnBpeGVsUmF0aW8sIFwicHggT3BlblNhbnNSZWd1bGFyLCBzYW5zLXNlcmlmXCIpO1xuICAgICAgICAgICAgICAgIG1hcC5jb250ZXh0LmZpbGxTdHlsZSA9IFwiI0ZGMDAwMFwiO1xuICAgICAgICAgICAgICAgIG1hcC5jb250ZXh0LnRleHRBbGlnbiA9IFwibGVmdFwiO1xuICAgICAgICAgICAgICAgIG1hcC5jb250ZXh0LnRleHRCYXNlbGluZSA9IFwibWlkZGxlXCI7XG4gICAgICAgICAgICAgICAgdmFyIHMgPSBcIlRpY2sgPCAxMHMgYXdheSFcIjtcbiAgICAgICAgICAgICAgICBpZiAodW5pdmVyc2UudGltZVRvVGljaygxKSA9PT0gXCIwc1wiKSB7XG4gICAgICAgICAgICAgICAgICAgIHMgPSBcIlRpY2sgcGFzc2VkLiBDbGljayBwcm9kdWN0aW9uIGNvdW50ZG93biB0byByZWZyZXNoLlwiO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBkcmF3T3ZlcmxheVN0cmluZyhtYXAuY29udGV4dCwgcywgMTAwMCwgbGluZUhlaWdodCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodW5pdmVyc2Uuc2VsZWN0ZWRTdGFyICYmXG4gICAgICAgICAgICAgICAgdW5pdmVyc2Uuc2VsZWN0ZWRTdGFyLnB1aWQgIT0gdW5pdmVyc2UucGxheWVyLnVpZCAmJlxuICAgICAgICAgICAgICAgIHVuaXZlcnNlLnNlbGVjdGVkU3Rhci5wdWlkICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIC8vIGVuZW15IHN0YXIgc2VsZWN0ZWQ7IHNob3cgSFVEIGZvciBzY2FubmluZyB2aXNpYmlsaXR5XG4gICAgICAgICAgICAgICAgbWFwLmNvbnRleHQudGV4dEFsaWduID0gXCJsZWZ0XCI7XG4gICAgICAgICAgICAgICAgbWFwLmNvbnRleHQudGV4dEJhc2VsaW5lID0gXCJtaWRkbGVcIjtcbiAgICAgICAgICAgICAgICB2YXIgeE9mZnNldCA9IDI2ICogbWFwLnBpeGVsUmF0aW87XG4gICAgICAgICAgICAgICAgLy9tYXAuY29udGV4dC50cmFuc2xhdGUoeE9mZnNldCwgMCk7XG4gICAgICAgICAgICAgICAgdmFyIGZsZWV0cyA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2UuZ2FsYXh5LmZsZWV0cztcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBmIGluIGZsZWV0cykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZmxlZXQgPSBmbGVldHNbZl07XG4gICAgICAgICAgICAgICAgICAgIGlmIChmbGVldC5wdWlkID09PSB1bml2ZXJzZS5wbGF5ZXIudWlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZHggPSB1bml2ZXJzZS5zZWxlY3RlZFN0YXIueCAtIGZsZWV0Lng7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZHkgPSB1bml2ZXJzZS5zZWxlY3RlZFN0YXIueSAtIGZsZWV0Lnk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGlzdGFuY2UgPSBNYXRoLnNxcnQoZHggKiBkeCArIGR5ICogZHkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG9mZnNldHggPSB4T2Zmc2V0O1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG9mZnNldHkgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHggPSBtYXAud29ybGRUb1NjcmVlblgoZmxlZXQueCkgKyBvZmZzZXR4O1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHkgPSBtYXAud29ybGRUb1NjcmVlblkoZmxlZXQueSkgKyBvZmZzZXR5O1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRpc3RhbmNlID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bml2ZXJzZS5nYWxheHkucGxheWVyc1t1bml2ZXJzZS5zZWxlY3RlZFN0YXIucHVpZF0udGVjaC5zY2FubmluZ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmxlZXQucGF0aCAmJiBmbGVldC5wYXRoLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZHggPSBmbGVldC5wYXRoWzBdLnggLSB1bml2ZXJzZS5zZWxlY3RlZFN0YXIueDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZHkgPSBmbGVldC5wYXRoWzBdLnkgLSB1bml2ZXJzZS5zZWxlY3RlZFN0YXIueTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzdGFuY2UgPSBNYXRoLnNxcnQoZHggKiBkeCArIGR5ICogZHkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGlzdGFuY2UgPFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5pdmVyc2UuZ2FsYXh5LnBsYXllcnNbdW5pdmVyc2Uuc2VsZWN0ZWRTdGFyLnB1aWRdLnRlY2hcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuc2Nhbm5pbmcudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzdGVwUmFkaXVzID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5nYWxheHkuZmxlZXRfc3BlZWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmxlZXQud2FycFNwZWVkKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ZXBSYWRpdXMgKj0gMztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGR4ID0gZmxlZXQueCAtIGZsZWV0LnBhdGhbMF0ueDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGR5ID0gZmxlZXQueSAtIGZsZWV0LnBhdGhbMF0ueTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBhbmdsZSA9IE1hdGguYXRhbihkeSAvIGR4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzdGVweCA9IHN0ZXBSYWRpdXMgKiBNYXRoLmNvcyhhbmdsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgc3RlcHkgPSBzdGVwUmFkaXVzICogTWF0aC5zaW4oYW5nbGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN0ZXB4ID4gMCAmJiBkeCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGVweCAqPSAtMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdGVweSA+IDAgJiYgZHkgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RlcHkgKj0gLTE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3RlcHggPCAwICYmIGR4IDwgMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ZXB4ICo9IC0xO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN0ZXB5IDwgMCAmJiBkeSA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGVweSAqPSAtMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0aWNrcyA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkbyB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHhfMSA9IHRpY2tzICogc3RlcHggKyBOdW1iZXIoZmxlZXQueCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHlfMSA9IHRpY2tzICogc3RlcHkgKyBOdW1iZXIoZmxlZXQueSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9sZXQgc3ggPSBtYXAud29ybGRUb1NjcmVlblgoeCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9sZXQgc3kgPSBtYXAud29ybGRUb1NjcmVlblkoeSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZHggPSB4XzEgLSB1bml2ZXJzZS5zZWxlY3RlZFN0YXIueDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkeSA9IHlfMSAtIHVuaXZlcnNlLnNlbGVjdGVkU3Rhci55O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3RhbmNlID0gTWF0aC5zcXJ0KGR4ICogZHggKyBkeSAqIGR5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGRpc3RhbmNlLCB4LCB5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2RyYXdPdmVybGF5U3RyaW5nKG1hcC5jb250ZXh0LCBcIm9cIiwgc3gsIHN5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aWNrcyArPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSB3aGlsZSAoZGlzdGFuY2UgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVuaXZlcnNlLmdhbGF4eS5wbGF5ZXJzW3VuaXZlcnNlLnNlbGVjdGVkU3Rhci5wdWlkXS50ZWNoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zY2FubmluZy52YWx1ZSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpY2tzIDw9IGZsZWV0LmV0YUZpcnN0ICsgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aWNrcyAtPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHZpc0NvbG9yID0gXCIjMDBmZjAwXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYW55U3RhckNhblNlZSh1bml2ZXJzZS5zZWxlY3RlZFN0YXIucHVpZCwgZmxlZXQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlzQ29sb3IgPSBcIiM4ODg4ODhcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRyYXdPdmVybGF5U3RyaW5nKG1hcC5jb250ZXh0LCBcIlNjYW4gXCIuY29uY2F0KHRpY2tUb0V0YVN0cmluZyh0aWNrcykpLCB4LCB5LCB2aXNDb2xvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy9tYXAuY29udGV4dC50cmFuc2xhdGUoLXhPZmZzZXQsIDApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHVuaXZlcnNlLnJ1bGVyLnN0YXJzLmxlbmd0aCA9PSAyKSB7XG4gICAgICAgICAgICAgICAgdmFyIHAxID0gdW5pdmVyc2UucnVsZXIuc3RhcnNbMF0ucHVpZDtcbiAgICAgICAgICAgICAgICB2YXIgcDIgPSB1bml2ZXJzZS5ydWxlci5zdGFyc1sxXS5wdWlkO1xuICAgICAgICAgICAgICAgIGlmIChwMSAhPT0gcDIgJiYgcDEgIT09IC0xICYmIHAyICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKFwidHdvIHN0YXIgcnVsZXJcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICAvL1RPRE86IExlYXJuIG1vcmUgYWJvdXQgdGhpcyBob29rLiBpdHMgcnVuIHRvbyBtdWNoLi5cbiAgICAgICAgQ3J1eC5mb3JtYXQgPSBmdW5jdGlvbiAocywgdGVtcGxhdGVEYXRhKSB7XG4gICAgICAgICAgICBpZiAoIXMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJlcnJvclwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGk7XG4gICAgICAgICAgICB2YXIgZnA7XG4gICAgICAgICAgICB2YXIgc3A7XG4gICAgICAgICAgICB2YXIgc3ViO1xuICAgICAgICAgICAgdmFyIHBhdHRlcm47XG4gICAgICAgICAgICBpID0gMDtcbiAgICAgICAgICAgIGZwID0gMDtcbiAgICAgICAgICAgIHNwID0gMDtcbiAgICAgICAgICAgIHN1YiA9IFwiXCI7XG4gICAgICAgICAgICBwYXR0ZXJuID0gXCJcIjtcbiAgICAgICAgICAgIC8vIGxvb2sgZm9yIHN0YW5kYXJkIHBhdHRlcm5zXG4gICAgICAgICAgICB3aGlsZSAoZnAgPj0gMCAmJiBpIDwgMTAwMCkge1xuICAgICAgICAgICAgICAgIGkgPSBpICsgMTtcbiAgICAgICAgICAgICAgICBmcCA9IHMuc2VhcmNoKFwiXFxcXFtcXFxcW1wiKTtcbiAgICAgICAgICAgICAgICBzcCA9IHMuc2VhcmNoKFwiXFxcXF1cXFxcXVwiKTtcbiAgICAgICAgICAgICAgICBzdWIgPSBzLnNsaWNlKGZwICsgMiwgc3ApO1xuICAgICAgICAgICAgICAgIHZhciB1cmkgPSBzdWIucmVwbGFjZUFsbChcIiYjeDJGO1wiLCBcIi9cIik7XG4gICAgICAgICAgICAgICAgcGF0dGVybiA9IFwiW1tcIi5jb25jYXQoc3ViLCBcIl1dXCIpO1xuICAgICAgICAgICAgICAgIGlmICh0ZW1wbGF0ZURhdGFbc3ViXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHMgPSBzLnJlcGxhY2UocGF0dGVybiwgdGVtcGxhdGVEYXRhW3N1Yl0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmICgvXmFwaTpcXHd7Nn0kLy50ZXN0KHN1YikpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGFwaUxpbmsgPSBcIjxhIG9uQ2xpY2s9J0NydXguY3J1eC50cmlnZ2VyKFxcXCJzd2l0Y2hfdXNlcl9hcGlcXFwiLCBcXFwiXCIuY29uY2F0KHN1YiwgXCJcXFwiKSc+IFZpZXcgYXMgXCIpLmNvbmNhdChzdWIsIFwiPC9hPlwiKTtcbiAgICAgICAgICAgICAgICAgICAgYXBpTGluayArPSBcIiBvciA8YSBvbkNsaWNrPSdDcnV4LmNydXgudHJpZ2dlcihcXFwibWVyZ2VfdXNlcl9hcGlcXFwiLCBcXFwiXCIuY29uY2F0KHN1YiwgXCJcXFwiKSc+IE1lcmdlIFwiKS5jb25jYXQoc3ViLCBcIjwvYT5cIik7XG4gICAgICAgICAgICAgICAgICAgIHMgPSBzLnJlcGxhY2UocGF0dGVybiwgYXBpTGluayk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGlzX3ZhbGlkX2ltYWdlX3VybCh1cmkpKSB7XG4gICAgICAgICAgICAgICAgICAgIHMgPSBzLnJlcGxhY2UocGF0dGVybiwgXCI8aW1nIHdpZHRoPVxcXCIxMDAlXFxcIiBzcmM9J1wiLmNvbmNhdCh1cmksIFwiJyAvPlwiKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGlzX3ZhbGlkX3lvdXR1YmUodXJpKSkge1xuICAgICAgICAgICAgICAgICAgICAvL1Bhc3NcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHMgPSBzLnJlcGxhY2UocGF0dGVybiwgXCIoXCIuY29uY2F0KHN1YiwgXCIpXCIpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcztcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIG5wdWkgPSBOZXB0dW5lc1ByaWRlLm5wdWk7XG4gICAgICAgIC8vUmVzZWFyY2ggYnV0dG9uIHRvIHF1aWNrbHkgdGVsbCBmcmllbmRzIHJlc2VhcmNoXG4gICAgICAgIE5lcHR1bmVzUHJpZGUudGVtcGxhdGVzW1wibnBhX3Jlc2VhcmNoXCJdID0gXCJSZXNlYXJjaFwiO1xuICAgICAgICB2YXIgc3VwZXJOZXdNZXNzYWdlQ29tbWVudEJveCA9IG5wdWkuTmV3TWVzc2FnZUNvbW1lbnRCb3g7XG4gICAgICAgIHZhciByZXBvcnRSZXNlYXJjaEhvb2sgPSBmdW5jdGlvbiAoX2UsIF9kKSB7XG4gICAgICAgICAgICB2YXIgdGV4dCA9IGdldF9yZXNlYXJjaF90ZXh0KE5lcHR1bmVzUHJpZGUpO1xuICAgICAgICAgICAgY29uc29sZS5sb2codGV4dCk7XG4gICAgICAgICAgICB2YXIgaW5ib3ggPSBOZXB0dW5lc1ByaWRlLmluYm94O1xuICAgICAgICAgICAgaW5ib3guY29tbWVudERyYWZ0c1tpbmJveC5zZWxlY3RlZE1lc3NhZ2Uua2V5XSArPSB0ZXh0O1xuICAgICAgICAgICAgaW5ib3gudHJpZ2dlcihcInNob3dfc2NyZWVuXCIsIFwiZGlwbG9tYWN5X2RldGFpbFwiKTtcbiAgICAgICAgfTtcbiAgICAgICAgTmVwdHVuZXNQcmlkZS5ucC5vbihcInBhc3RlX3Jlc2VhcmNoXCIsIHJlcG9ydFJlc2VhcmNoSG9vayk7XG4gICAgICAgIG5wdWkuTmV3TWVzc2FnZUNvbW1lbnRCb3ggPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgd2lkZ2V0ID0gc3VwZXJOZXdNZXNzYWdlQ29tbWVudEJveCgpO1xuICAgICAgICAgICAgdmFyIHJlc2VhcmNoX2J1dHRvbiA9IENydXguQnV0dG9uKFwibnBhX3Jlc2VhcmNoXCIsIFwicGFzdGVfcmVzZWFyY2hcIiwgXCJyZXNlYXJjaFwiKS5ncmlkKDExLCAxMiwgOCwgMyk7XG4gICAgICAgICAgICByZXNlYXJjaF9idXR0b24ucm9vc3Qod2lkZ2V0KTtcbiAgICAgICAgICAgIHJldHVybiB3aWRnZXQ7XG4gICAgICAgIH07XG4gICAgICAgIHZhciBzdXBlckZvcm1hdFRpbWUgPSBDcnV4LmZvcm1hdFRpbWU7XG4gICAgICAgIHZhciByZWxhdGl2ZVRpbWVzID0gMDtcbiAgICAgICAgQ3J1eC5mb3JtYXRUaW1lID0gZnVuY3Rpb24gKG1zLCBtaW5zLCBzZWNzKSB7XG4gICAgICAgICAgICBzd2l0Y2ggKHJlbGF0aXZlVGltZXMpIHtcbiAgICAgICAgICAgICAgICBjYXNlIDA6IC8vc3RhbmRhcmRcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN1cGVyRm9ybWF0VGltZShtcywgbWlucywgc2Vjcyk7XG4gICAgICAgICAgICAgICAgY2FzZSAxOiAvL0VUQSwgLSB0dXJuKHMpIGZvciB0dXJuYmFzZWRcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFOZXB0dW5lc1ByaWRlLmdhbWVDb25maWcudHVybkJhc2VkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbXNUb0V0YVN0cmluZyhtcywgXCJcIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdGlja19yYXRlID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5nYWxheHkudGlja19yYXRlO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiXCIuY29uY2F0KHN1cGVyRm9ybWF0VGltZShtcywgbWlucywgc2VjcyksIFwiIC0gXCIpLmNvbmNhdCgoKChtcyAvIDM2MDAwMDApICogMTApIC9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aWNrX3JhdGUpLnRvRml4ZWQoMiksIFwiIHR1cm4ocylcIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXNlIDI6IC8vY3ljbGVzICsgdGlja3MgZm9ybWF0XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtc1RvQ3ljbGVTdHJpbmcobXMsIFwiXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICB2YXIgc3dpdGNoVGltZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvLzAgPSBzdGFuZGFyZCwgMSA9IEVUQSwgLSB0dXJuKHMpIGZvciB0dXJuYmFzZWQsIDIgPSBjeWNsZXMgKyB0aWNrcyBmb3JtYXRcbiAgICAgICAgICAgIHJlbGF0aXZlVGltZXMgPSAocmVsYXRpdmVUaW1lcyArIDEpICUgMztcbiAgICAgICAgfTtcbiAgICAgICAgaG90a2V5KFwiJVwiLCBzd2l0Y2hUaW1lcyk7XG4gICAgICAgIHN3aXRjaFRpbWVzLmhlbHAgPVxuICAgICAgICAgICAgXCJDaGFuZ2UgdGhlIGRpc3BsYXkgb2YgRVRBcyBiZXR3ZWVuIHJlbGF0aXZlIHRpbWVzLCBhYnNvbHV0ZSBjbG9jayB0aW1lcywgYW5kIGN5Y2xlIHRpbWVzLiBNYWtlcyBwcmVkaWN0aW5nIFwiICtcbiAgICAgICAgICAgICAgICBcImltcG9ydGFudCB0aW1lcyBvZiBkYXkgdG8gc2lnbiBpbiBhbmQgY2hlY2sgbXVjaCBlYXNpZXIgZXNwZWNpYWxseSBmb3IgbXVsdGktbGVnIGZsZWV0IG1vdmVtZW50cy4gU29tZXRpbWVzIHlvdSBcIiArXG4gICAgICAgICAgICAgICAgXCJ3aWxsIG5lZWQgdG8gcmVmcmVzaCB0aGUgZGlzcGxheSB0byBzZWUgdGhlIGRpZmZlcmVudCB0aW1lcy5cIjtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShDcnV4LCBcInRvdWNoRW5hYmxlZFwiLCB7XG4gICAgICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiBmYWxzZTsgfSxcbiAgICAgICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh4KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQ3J1eC50b3VjaEVuYWJsZWQgc2V0IGlnbm9yZWRcIiwgeCk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlKTtcbiAgICAgICAgfVxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoTmVwdHVuZXNQcmlkZS5ucHVpLm1hcCwgXCJpZ25vcmVNb3VzZUV2ZW50c1wiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIGZhbHNlOyB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAoeCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiTmVwdHVuZXNQcmlkZS5ucHVpLm1hcC5pZ25vcmVNb3VzZUV2ZW50cyBzZXQgaWdub3JlZFwiLCB4KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgICAgICBob29rc0xvYWRlZCA9IHRydWU7XG4gICAgfTtcbiAgICB2YXIgaW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIF9hO1xuICAgICAgICBpZiAoKChfYSA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2UpID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5nYWxheHkpICYmIE5lcHR1bmVzUHJpZGUubnB1aS5tYXApIHtcbiAgICAgICAgICAgIGxpbmtGbGVldHMoKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRmxlZXQgbGlua2luZyBjb21wbGV0ZS5cIik7XG4gICAgICAgICAgICBpZiAoIWhvb2tzTG9hZGVkKSB7XG4gICAgICAgICAgICAgICAgbG9hZEhvb2tzKCk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJIVUQgc2V0dXAgY29tcGxldGUuXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJIVUQgc2V0dXAgYWxyZWFkeSBkb25lOyBza2lwcGluZy5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBob21lUGxhbmV0cygpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJHYW1lIG5vdCBmdWxseSBpbml0aWFsaXplZCB5ZXQ7IHdhaXQuXCIsIE5lcHR1bmVzUHJpZGUudW5pdmVyc2UpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBob3RrZXkoXCJAXCIsIGluaXQpO1xuICAgIGluaXQuaGVscCA9XG4gICAgICAgIFwiUmVpbml0aWFsaXplIE5lcHR1bmUncyBQcmlkZSBBZ2VudC4gVXNlIHRoZSBAIGhvdGtleSBpZiB0aGUgdmVyc2lvbiBpcyBub3QgYmVpbmcgc2hvd24gb24gdGhlIG1hcCBhZnRlciBkcmFnZ2luZy5cIjtcbiAgICBpZiAoKChfYiA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2UpID09PSBudWxsIHx8IF9iID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYi5nYWxheHkpICYmIE5lcHR1bmVzUHJpZGUubnB1aS5tYXApIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJVbml2ZXJzZSBhbHJlYWR5IGxvYWRlZC4gSHlwZXJsaW5rIGZsZWV0cyAmIGxvYWQgaG9va3MuXCIpO1xuICAgICAgICBpbml0KCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyhcIlVuaXZlcnNlIG5vdCBsb2FkZWQuIEhvb2sgb25TZXJ2ZXJSZXNwb25zZS5cIik7XG4gICAgICAgIHZhciBzdXBlck9uU2VydmVyUmVzcG9uc2VfMSA9IE5lcHR1bmVzUHJpZGUubnAub25TZXJ2ZXJSZXNwb25zZTtcbiAgICAgICAgTmVwdHVuZXNQcmlkZS5ucC5vblNlcnZlclJlc3BvbnNlID0gZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICBzdXBlck9uU2VydmVyUmVzcG9uc2VfMShyZXNwb25zZSk7XG4gICAgICAgICAgICBpZiAocmVzcG9uc2UuZXZlbnQgPT09IFwib3JkZXI6cGxheWVyX2FjaGlldmVtZW50c1wiKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJJbml0aWFsIGxvYWQgY29tcGxldGUuIFJlaW5zdGFsbC5cIik7XG4gICAgICAgICAgICAgICAgaW5pdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAocmVzcG9uc2UuZXZlbnQgPT09IFwib3JkZXI6ZnVsbF91bml2ZXJzZVwiKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJVbml2ZXJzZSByZWNlaXZlZC4gUmVpbnN0YWxsLlwiKTtcbiAgICAgICAgICAgICAgICBOZXB0dW5lc1ByaWRlLm9yaWdpbmFsUGxheWVyID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5wbGF5ZXIudWlkO1xuICAgICAgICAgICAgICAgIGluaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKCFob29rc0xvYWRlZCAmJiBOZXB0dW5lc1ByaWRlLm5wdWkubWFwKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJIb29rcyBuZWVkIGxvYWRpbmcgYW5kIG1hcCBpcyByZWFkeS4gUmVpbnN0YWxsLlwiKTtcbiAgICAgICAgICAgICAgICBpbml0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuICAgIHZhciBvdGhlclVzZXJDb2RlID0gdW5kZWZpbmVkO1xuICAgIHZhciBnYW1lID0gTmVwdHVuZXNQcmlkZS5nYW1lTnVtYmVyO1xuICAgIHZhciBzd2l0Y2hVc2VyID0gZnVuY3Rpb24gKGV2ZW50LCBkYXRhKSB7XG4gICAgICAgIGlmIChOZXB0dW5lc1ByaWRlLm9yaWdpbmFsUGxheWVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIE5lcHR1bmVzUHJpZGUub3JpZ2luYWxQbGF5ZXIgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlLnBsYXllci51aWQ7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGNvZGUgPSAoZGF0YSA9PT0gbnVsbCB8fCBkYXRhID09PSB2b2lkIDAgPyB2b2lkIDAgOiBkYXRhLnNwbGl0KFwiOlwiKVsxXSkgfHwgb3RoZXJVc2VyQ29kZTtcbiAgICAgICAgb3RoZXJVc2VyQ29kZSA9IGNvZGU7XG4gICAgICAgIGlmIChvdGhlclVzZXJDb2RlKSB7XG4gICAgICAgICAgICB2YXIgcGFyYW1zID0ge1xuICAgICAgICAgICAgICAgIGdhbWVfbnVtYmVyOiBnYW1lLFxuICAgICAgICAgICAgICAgIGFwaV92ZXJzaW9uOiBcIjAuMVwiLFxuICAgICAgICAgICAgICAgIGNvZGU6IG90aGVyVXNlckNvZGUsXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdmFyIGVnZ2VycyA9IGpRdWVyeS5hamF4KHtcbiAgICAgICAgICAgICAgICB0eXBlOiBcIlBPU1RcIixcbiAgICAgICAgICAgICAgICB1cmw6IFwiaHR0cHM6Ly9ucC5pcm9uaGVsbWV0LmNvbS9hcGlcIixcbiAgICAgICAgICAgICAgICBhc3luYzogZmFsc2UsXG4gICAgICAgICAgICAgICAgZGF0YTogcGFyYW1zLFxuICAgICAgICAgICAgICAgIGRhdGFUeXBlOiBcImpzb25cIixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgTmVwdHVuZXNQcmlkZS5ucC5vbkZ1bGxVbml2ZXJzZShudWxsLCBlZ2dlcnMucmVzcG9uc2VKU09OLnNjYW5uaW5nX2RhdGEpO1xuICAgICAgICAgICAgTmVwdHVuZXNQcmlkZS5ucHVpLm9uSGlkZVNjcmVlbihudWxsLCB0cnVlKTtcbiAgICAgICAgICAgIE5lcHR1bmVzUHJpZGUubnAudHJpZ2dlcihcInNlbGVjdF9wbGF5ZXJcIiwgW1xuICAgICAgICAgICAgICAgIE5lcHR1bmVzUHJpZGUudW5pdmVyc2UucGxheWVyLnVpZCxcbiAgICAgICAgICAgICAgICB0cnVlLFxuICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICBpbml0KCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGhvdGtleShcIj5cIiwgc3dpdGNoVXNlcik7XG4gICAgc3dpdGNoVXNlci5oZWxwID1cbiAgICAgICAgXCJTd2l0Y2ggdmlld3MgdG8gdGhlIGxhc3QgdXNlciB3aG9zZSBBUEkga2V5IHdhcyB1c2VkIHRvIGxvYWQgZGF0YS4gVGhlIEhVRCBzaG93cyB0aGUgY3VycmVudCB1c2VyIHdoZW4gXCIgK1xuICAgICAgICAgICAgXCJpdCBpcyBub3QgeW91ciBvd24gYWxpYXMgdG8gaGVscCByZW1pbmQgeW91IHRoYXQgeW91IGFyZW4ndCBpbiBjb250cm9sIG9mIHRoaXMgdXNlci5cIjtcbiAgICBob3RrZXkoXCJ8XCIsIG1lcmdlVXNlcik7XG4gICAgbWVyZ2VVc2VyLmhlbHAgPVxuICAgICAgICBcIk1lcmdlIHRoZSBsYXRlc3QgZGF0YSBmcm9tIHRoZSBsYXN0IHVzZXIgd2hvc2UgQVBJIGtleSB3YXMgdXNlZCB0byBsb2FkIGRhdGEuIFRoaXMgaXMgdXNlZnVsIGFmdGVyIGEgdGljayBcIiArXG4gICAgICAgICAgICBcInBhc3NlcyBhbmQgeW91J3ZlIHJlbG9hZGVkLCBidXQgeW91IHN0aWxsIHdhbnQgdGhlIG1lcmdlZCBzY2FuIGRhdGEgZnJvbSB0d28gcGxheWVycyBvbnNjcmVlbi5cIjtcbiAgICBOZXB0dW5lc1ByaWRlLm5wLm9uKFwic3dpdGNoX3VzZXJfYXBpXCIsIHN3aXRjaFVzZXIpO1xuICAgIE5lcHR1bmVzUHJpZGUubnAub24oXCJtZXJnZV91c2VyX2FwaVwiLCBtZXJnZVVzZXIpO1xuICAgIHZhciBucGFIZWxwID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgaGVscCA9IFtcIjxIMT5cIi5jb25jYXQodGl0bGUsIFwiPC9IMT5cIildO1xuICAgICAgICBmb3IgKHZhciBwYWlyIGluIGhvdGtleXMpIHtcbiAgICAgICAgICAgIHZhciBrZXkgPSBob3RrZXlzW3BhaXJdWzBdO1xuICAgICAgICAgICAgdmFyIGFjdGlvbiA9IGhvdGtleXNbcGFpcl1bMV07XG4gICAgICAgICAgICBoZWxwLnB1c2goXCI8aDI+SG90a2V5OiBcIi5jb25jYXQoa2V5LCBcIjwvaDI+XCIpKTtcbiAgICAgICAgICAgIGlmIChhY3Rpb24uaGVscCkge1xuICAgICAgICAgICAgICAgIGhlbHAucHVzaChhY3Rpb24uaGVscCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBoZWxwLnB1c2goXCI8cD5ObyBkb2N1bWVudGF0aW9uIHlldC48cD48Y29kZT5cIi5jb25jYXQoYWN0aW9uLnRvTG9jYWxlU3RyaW5nKCksIFwiPC9jb2RlPlwiKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5oZWxwSFRNTCA9IGhlbHAuam9pbihcIlwiKTtcbiAgICAgICAgTmVwdHVuZXNQcmlkZS5ucC50cmlnZ2VyKFwic2hvd19zY3JlZW5cIiwgXCJoZWxwXCIpO1xuICAgIH07XG4gICAgbnBhSGVscC5oZWxwID0gXCJEaXNwbGF5IHRoaXMgaGVscCBzY3JlZW4uXCI7XG4gICAgaG90a2V5KFwiP1wiLCBucGFIZWxwKTtcbiAgICB2YXIgYXV0b2NvbXBsZXRlTW9kZSA9IDA7XG4gICAgdmFyIGF1dG9jb21wbGV0ZVRyaWdnZXIgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICBpZiAoZS50YXJnZXQudHlwZSA9PT0gXCJ0ZXh0YXJlYVwiKSB7XG4gICAgICAgICAgICBpZiAoYXV0b2NvbXBsZXRlTW9kZSkge1xuICAgICAgICAgICAgICAgIHZhciBzdGFydCA9IGF1dG9jb21wbGV0ZU1vZGU7XG4gICAgICAgICAgICAgICAgdmFyIGVuZEJyYWNrZXQgPSBlLnRhcmdldC52YWx1ZS5pbmRleE9mKFwiXVwiLCBzdGFydCk7XG4gICAgICAgICAgICAgICAgaWYgKGVuZEJyYWNrZXQgPT09IC0xKVxuICAgICAgICAgICAgICAgICAgICBlbmRCcmFja2V0ID0gZS50YXJnZXQudmFsdWUubGVuZ3RoO1xuICAgICAgICAgICAgICAgIHZhciBhdXRvU3RyaW5nID0gZS50YXJnZXQudmFsdWUuc3Vic3RyaW5nKHN0YXJ0LCBlbmRCcmFja2V0KTtcbiAgICAgICAgICAgICAgICB2YXIga2V5ID0gZS5rZXk7XG4gICAgICAgICAgICAgICAgaWYgKGtleSA9PT0gXCJdXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgYXV0b2NvbXBsZXRlTW9kZSA9IDA7XG4gICAgICAgICAgICAgICAgICAgIHZhciBtID0gYXV0b1N0cmluZy5tYXRjaCgvXlswLTldWzAtOV0qJC8pO1xuICAgICAgICAgICAgICAgICAgICBpZiAobSA9PT0gbnVsbCB8fCBtID09PSB2b2lkIDAgPyB2b2lkIDAgOiBtLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHB1aWQgPSBOdW1iZXIoYXV0b1N0cmluZyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZW5kID0gZS50YXJnZXQuc2VsZWN0aW9uRW5kO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGF1dG8gPSBcIlwiLmNvbmNhdChwdWlkLCBcIl1dIFwiKS5jb25jYXQoTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5nYWxheHkucGxheWVyc1twdWlkXS5hbGlhcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBlLnRhcmdldC52YWx1ZSA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZS50YXJnZXQudmFsdWUuc3Vic3RyaW5nKDAsIHN0YXJ0KSArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGF1dG8gK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlLnRhcmdldC52YWx1ZS5zdWJzdHJpbmcoZW5kLCBlLnRhcmdldC52YWx1ZS5sZW5ndGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZS50YXJnZXQuc2VsZWN0aW9uU3RhcnQgPSBzdGFydCArIGF1dG8ubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICAgICAgZS50YXJnZXQuc2VsZWN0aW9uRW5kID0gc3RhcnQgKyBhdXRvLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGUudGFyZ2V0LnNlbGVjdGlvblN0YXJ0ID4gMSkge1xuICAgICAgICAgICAgICAgIHZhciBzdGFydCA9IGUudGFyZ2V0LnNlbGVjdGlvblN0YXJ0IC0gMjtcbiAgICAgICAgICAgICAgICB2YXIgc3MgPSBlLnRhcmdldC52YWx1ZS5zdWJzdHJpbmcoc3RhcnQsIHN0YXJ0ICsgMik7XG4gICAgICAgICAgICAgICAgYXV0b2NvbXBsZXRlTW9kZSA9IHNzID09PSBcIltbXCIgPyBlLnRhcmdldC5zZWxlY3Rpb25TdGFydCA6IDA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcihcImtleXVwXCIsIGF1dG9jb21wbGV0ZVRyaWdnZXIpO1xuICAgIGNvbnNvbGUubG9nKFwiU0FUOiBOZXB0dW5lJ3MgUHJpZGUgQWdlbnQgaW5qZWN0aW9uIGZpbmlzaGVkLlwiKTtcbiAgICBjb25zb2xlLmxvZyhcIkdldHRpbmcgaGVybyFcIiwgZ2V0X2hlcm8oTmVwdHVuZXNQcmlkZS51bml2ZXJzZSkpO1xufVxudmFyIGZvcmNlX2FkZF9jdXN0b21fcGxheWVyX3BhbmVsID0gZnVuY3Rpb24gKCkge1xuICAgIGlmIChcIlBsYXllclBhbmVsXCIgaW4gTmVwdHVuZXNQcmlkZS5ucHVpKSB7XG4gICAgICAgIGFkZF9jdXN0b21fcGxheWVyX3BhbmVsKCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBzZXRUaW1lb3V0KGFkZF9jdXN0b21fcGxheWVyX3BhbmVsLCAzMDAwKTtcbiAgICB9XG59O1xudmFyIGFkZF9jdXN0b21fcGxheWVyX3BhbmVsID0gZnVuY3Rpb24gKCkge1xuICAgIE5lcHR1bmVzUHJpZGUubnB1aS5QbGF5ZXJQYW5lbCA9IGZ1bmN0aW9uIChwbGF5ZXIsIHNob3dFbXBpcmUpIHtcbiAgICAgICAgdmFyIHVuaXZlcnNlID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZTtcbiAgICAgICAgdmFyIG5wdWkgPSBOZXB0dW5lc1ByaWRlLm5wdWk7XG4gICAgICAgIHZhciBwbGF5ZXJQYW5lbCA9IENydXguV2lkZ2V0KFwicmVsXCIpLnNpemUoNDgwLCAyNjQgLSA4ICsgNDgpO1xuICAgICAgICB2YXIgaGVhZGluZyA9IFwicGxheWVyXCI7XG4gICAgICAgIGlmICh1bml2ZXJzZS5wbGF5ZXJBY2hpZXZlbWVudHMgJiZcbiAgICAgICAgICAgIE5lcHR1bmVzUHJpZGUuZ2FtZUNvbmZpZy5hbm9ueW1pdHkgPT09IDApIHtcbiAgICAgICAgICAgIGlmICh1bml2ZXJzZS5wbGF5ZXJBY2hpZXZlbWVudHNbcGxheWVyLnVpZF0pIHtcbiAgICAgICAgICAgICAgICBpZiAodW5pdmVyc2UucGxheWVyQWNoaWV2ZW1lbnRzW3BsYXllci51aWRdLnByZW1pdW0gPT09IFwicHJlbWl1bVwiKSB7XG4gICAgICAgICAgICAgICAgICAgIGhlYWRpbmcgPSBcInByZW1pdW1fcGxheWVyXCI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh1bml2ZXJzZS5wbGF5ZXJBY2hpZXZlbWVudHNbcGxheWVyLnVpZF0ucHJlbWl1bSA9PT0gXCJsaWZldGltZVwiKSB7XG4gICAgICAgICAgICAgICAgICAgIGhlYWRpbmcgPSBcImxpZmV0aW1lX3ByZW1pdW1fcGxheWVyXCI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIENydXguVGV4dChoZWFkaW5nLCBcInNlY3Rpb25fdGl0bGUgY29sX2JsYWNrXCIpXG4gICAgICAgICAgICAuZ3JpZCgwLCAwLCAzMCwgMylcbiAgICAgICAgICAgIC5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgIGlmIChwbGF5ZXIuYWkpIHtcbiAgICAgICAgICAgIENydXguVGV4dChcImFpX2FkbWluXCIsIFwidHh0X3JpZ2h0IHBhZDEyXCIpXG4gICAgICAgICAgICAgICAgLmdyaWQoMCwgMCwgMzAsIDMpXG4gICAgICAgICAgICAgICAgLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgfVxuICAgICAgICBDcnV4LkltYWdlKFwiLi4vaW1hZ2VzL2F2YXRhcnMvMTYwL1wiLmNvbmNhdChwbGF5ZXIuYXZhdGFyLCBcIi5qcGdcIiksIFwiYWJzXCIpXG4gICAgICAgICAgICAuZ3JpZCgwLCA2LCAxMCwgMTApXG4gICAgICAgICAgICAucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICBDcnV4LldpZGdldChcInBjaV80OF9cIi5jb25jYXQocGxheWVyLnVpZCkpLmdyaWQoNywgMTMsIDMsIDMpLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgQ3J1eC5XaWRnZXQoXCJjb2xfYWNjZW50XCIpLmdyaWQoMCwgMywgMzAsIDMpLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgQ3J1eC5UZXh0KFwiXCIsIFwic2NyZWVuX3N1YnRpdGxlXCIpXG4gICAgICAgICAgICAuZ3JpZCgwLCAzLCAzMCwgMylcbiAgICAgICAgICAgIC5yYXdIVE1MKHBsYXllci5xdWFsaWZpZWRBbGlhcylcbiAgICAgICAgICAgIC5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgIHZhciBteUFjaGlldmVtZW50cztcbiAgICAgICAgLy9VPT5Ub3hpY1xuICAgICAgICAvL1Y9Pk1hZ2ljXG4gICAgICAgIC8vNT0+RmxvbWJhZXVcbiAgICAgICAgLy9XPT5XaXphcmRcbiAgICAgICAgaWYgKHVuaXZlcnNlLnBsYXllckFjaGlldmVtZW50cykge1xuICAgICAgICAgICAgbXlBY2hpZXZlbWVudHMgPSB1bml2ZXJzZS5wbGF5ZXJBY2hpZXZlbWVudHNbcGxheWVyLnVpZF07XG4gICAgICAgICAgICBpZiAocGxheWVyLnJhd0FsaWFzID09IFwiTG9yZW50elwiICYmXG4gICAgICAgICAgICAgICAgXCJXXCIgIT0gbXlBY2hpZXZlbWVudHMuYmFkZ2VzLnNsaWNlKDAsIDEpKSB7XG4gICAgICAgICAgICAgICAgbXlBY2hpZXZlbWVudHMuYmFkZ2VzID0gXCJXXCIuY29uY2F0KG15QWNoaWV2ZW1lbnRzLmJhZGdlcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChwbGF5ZXIucmF3QWxpYXMgPT0gXCJBIFN0b25lZCBBcGVcIiAmJlxuICAgICAgICAgICAgICAgIFwiNVwiICE9IG15QWNoaWV2ZW1lbnRzLmJhZGdlcy5zbGljZSgwLCAxKSkge1xuICAgICAgICAgICAgICAgIG15QWNoaWV2ZW1lbnRzLmJhZGdlcyA9IFwiNVwiLmNvbmNhdChteUFjaGlldmVtZW50cy5iYWRnZXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChteUFjaGlldmVtZW50cykge1xuICAgICAgICAgICAgbnB1aVxuICAgICAgICAgICAgICAgIC5TbWFsbEJhZGdlUm93KG15QWNoaWV2ZW1lbnRzLmJhZGdlcylcbiAgICAgICAgICAgICAgICAuZ3JpZCgwLCAzLCAzMCwgMylcbiAgICAgICAgICAgICAgICAucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICB9XG4gICAgICAgIENydXguV2lkZ2V0KFwiY29sX2JsYWNrXCIpLmdyaWQoMTAsIDYsIDIwLCAzKS5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgIGlmIChwbGF5ZXIudWlkICE9IGdldF9oZXJvKE5lcHR1bmVzUHJpZGUudW5pdmVyc2UpLnVpZCAmJiBwbGF5ZXIuYWkgPT0gMCkge1xuICAgICAgICAgICAgLy9Vc2UgdGhpcyB0byBvbmx5IHZpZXcgd2hlbiB0aGV5IGFyZSB3aXRoaW4gc2Nhbm5pbmc6XG4gICAgICAgICAgICAvL3VuaXZlcnNlLnNlbGVjdGVkU3Rhci52ICE9IFwiMFwiXG4gICAgICAgICAgICB2YXIgdG90YWxfc2VsbF9jb3N0ID0gZ2V0X3RlY2hfdHJhZGVfY29zdChnZXRfaGVybyhOZXB0dW5lc1ByaWRlLnVuaXZlcnNlKSwgcGxheWVyKTtcbiAgICAgICAgICAgIC8qKiogU0hBUkUgQUxMIFRFQ0ggICoqKi9cbiAgICAgICAgICAgIHZhciBidG4gPSBDcnV4LkJ1dHRvbihcIlwiLCBcInNoYXJlX2FsbF90ZWNoXCIsIHBsYXllcilcbiAgICAgICAgICAgICAgICAuYWRkU3R5bGUoXCJmd2RcIilcbiAgICAgICAgICAgICAgICAucmF3SFRNTChcIlNoYXJlIEFsbCBUZWNoOiAkXCIuY29uY2F0KHRvdGFsX3NlbGxfY29zdCkpXG4gICAgICAgICAgICAgICAgLmdyaWQoMTAsIDMxLCAxNCwgMyk7XG4gICAgICAgICAgICAvL0Rpc2FibGUgaWYgaW4gYSBnYW1lIHdpdGggRkEgJiBTY2FuIChCVUcpXG4gICAgICAgICAgICB2YXIgY29uZmlnID0gTmVwdHVuZXNQcmlkZS5nYW1lQ29uZmlnO1xuICAgICAgICAgICAgaWYgKCEoY29uZmlnLnRyYWRlU2Nhbm5lZCAmJiBjb25maWcuYWxsaWFuY2VzKSkge1xuICAgICAgICAgICAgICAgIGlmIChnZXRfaGVybyhOZXB0dW5lc1ByaWRlLnVuaXZlcnNlKS5jYXNoID49IHRvdGFsX3NlbGxfY29zdCkge1xuICAgICAgICAgICAgICAgICAgICBidG4ucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYnRuLmRpc2FibGUoKS5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLyoqKiBQQVkgRk9SIEFMTCBURUNIICoqKi9cbiAgICAgICAgICAgIHZhciB0b3RhbF9idXlfY29zdCA9IGdldF90ZWNoX3RyYWRlX2Nvc3QocGxheWVyLCBnZXRfaGVybyhOZXB0dW5lc1ByaWRlLnVuaXZlcnNlKSk7XG4gICAgICAgICAgICBidG4gPSBDcnV4LkJ1dHRvbihcIlwiLCBcImJ1eV9hbGxfdGVjaFwiLCB7XG4gICAgICAgICAgICAgICAgcGxheWVyOiBwbGF5ZXIsXG4gICAgICAgICAgICAgICAgdGVjaDogbnVsbCxcbiAgICAgICAgICAgICAgICBjb3N0OiB0b3RhbF9idXlfY29zdCxcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmFkZFN0eWxlKFwiZndkXCIpXG4gICAgICAgICAgICAgICAgLnJhd0hUTUwoXCJQYXkgZm9yIEFsbCBUZWNoOiAkXCIuY29uY2F0KHRvdGFsX2J1eV9jb3N0KSlcbiAgICAgICAgICAgICAgICAuZ3JpZCgxMCwgNDksIDE0LCAzKTtcbiAgICAgICAgICAgIGlmIChnZXRfaGVybyhOZXB0dW5lc1ByaWRlLnVuaXZlcnNlKS5jYXNoID49IHRvdGFsX3NlbGxfY29zdCkge1xuICAgICAgICAgICAgICAgIGJ0bi5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBidG4uZGlzYWJsZSgpLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8qSW5kaXZpZHVhbCB0ZWNocyovXG4gICAgICAgICAgICB2YXIgX25hbWVfbWFwID0ge1xuICAgICAgICAgICAgICAgIHNjYW5uaW5nOiBcIlNjYW5uaW5nXCIsXG4gICAgICAgICAgICAgICAgcHJvcHVsc2lvbjogXCJIeXBlcnNwYWNlIFJhbmdlXCIsXG4gICAgICAgICAgICAgICAgdGVycmFmb3JtaW5nOiBcIlRlcnJhZm9ybWluZ1wiLFxuICAgICAgICAgICAgICAgIHJlc2VhcmNoOiBcIkV4cGVyaW1lbnRhdGlvblwiLFxuICAgICAgICAgICAgICAgIHdlYXBvbnM6IFwiV2VhcG9uc1wiLFxuICAgICAgICAgICAgICAgIGJhbmtpbmc6IFwiQmFua2luZ1wiLFxuICAgICAgICAgICAgICAgIG1hbnVmYWN0dXJpbmc6IFwiTWFudWZhY3R1cmluZ1wiLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHZhciB0ZWNocyA9IFtcbiAgICAgICAgICAgICAgICBcInNjYW5uaW5nXCIsXG4gICAgICAgICAgICAgICAgXCJwcm9wdWxzaW9uXCIsXG4gICAgICAgICAgICAgICAgXCJ0ZXJyYWZvcm1pbmdcIixcbiAgICAgICAgICAgICAgICBcInJlc2VhcmNoXCIsXG4gICAgICAgICAgICAgICAgXCJ3ZWFwb25zXCIsXG4gICAgICAgICAgICAgICAgXCJiYW5raW5nXCIsXG4gICAgICAgICAgICAgICAgXCJtYW51ZmFjdHVyaW5nXCIsXG4gICAgICAgICAgICBdO1xuICAgICAgICAgICAgdGVjaHMuZm9yRWFjaChmdW5jdGlvbiAodGVjaCwgaSkge1xuICAgICAgICAgICAgICAgIHZhciBvbmVfdGVjaF9jb3N0ID0gZ2V0X3RlY2hfdHJhZGVfY29zdChwbGF5ZXIsIGdldF9oZXJvKE5lcHR1bmVzUHJpZGUudW5pdmVyc2UpLCB0ZWNoKTtcbiAgICAgICAgICAgICAgICB2YXIgb25lX3RlY2ggPSBDcnV4LkJ1dHRvbihcIlwiLCBcImJ1eV9vbmVfdGVjaFwiLCB7XG4gICAgICAgICAgICAgICAgICAgIHBsYXllcjogcGxheWVyLFxuICAgICAgICAgICAgICAgICAgICB0ZWNoOiB0ZWNoLFxuICAgICAgICAgICAgICAgICAgICBjb3N0OiBvbmVfdGVjaF9jb3N0LFxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIC5hZGRTdHlsZShcImZ3ZFwiKVxuICAgICAgICAgICAgICAgICAgICAucmF3SFRNTChcIlBheTogJFwiLmNvbmNhdChvbmVfdGVjaF9jb3N0KSlcbiAgICAgICAgICAgICAgICAgICAgLmdyaWQoMTUsIDM0LjUgKyBpICogMiwgNywgMik7XG4gICAgICAgICAgICAgICAgaWYgKGdldF9oZXJvKE5lcHR1bmVzUHJpZGUudW5pdmVyc2UpLmNhc2ggPj0gb25lX3RlY2hfY29zdCAmJlxuICAgICAgICAgICAgICAgICAgICBvbmVfdGVjaF9jb3N0ID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBvbmVfdGVjaC5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgQ3J1eC5UZXh0KFwieW91XCIsIFwicGFkMTIgdHh0X2NlbnRlclwiKS5ncmlkKDI1LCA2LCA1LCAzKS5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgIC8vIExhYmVsc1xuICAgICAgICBDcnV4LlRleHQoXCJ0b3RhbF9zdGFyc1wiLCBcInBhZDhcIikuZ3JpZCgxMCwgOSwgMTUsIDMpLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgQ3J1eC5UZXh0KFwidG90YWxfZmxlZXRzXCIsIFwicGFkOFwiKS5ncmlkKDEwLCAxMSwgMTUsIDMpLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgQ3J1eC5UZXh0KFwidG90YWxfc2hpcHNcIiwgXCJwYWQ4XCIpLmdyaWQoMTAsIDEzLCAxNSwgMykucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICBDcnV4LlRleHQoXCJuZXdfc2hpcHNcIiwgXCJwYWQ4XCIpLmdyaWQoMTAsIDE1LCAxNSwgMykucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICAvLyBUaGlzIHBsYXllcnMgc3RhdHNcbiAgICAgICAgaWYgKHBsYXllciAhPT0gdW5pdmVyc2UucGxheWVyKSB7XG4gICAgICAgICAgICBDcnV4LlRleHQoXCJcIiwgXCJwYWQ4IHR4dF9jZW50ZXJcIilcbiAgICAgICAgICAgICAgICAuZ3JpZCgyMCwgOSwgNSwgMylcbiAgICAgICAgICAgICAgICAucmF3SFRNTChwbGF5ZXIudG90YWxfc3RhcnMpXG4gICAgICAgICAgICAgICAgLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgICAgIENydXguVGV4dChcIlwiLCBcInBhZDggdHh0X2NlbnRlclwiKVxuICAgICAgICAgICAgICAgIC5ncmlkKDIwLCAxMSwgNSwgMylcbiAgICAgICAgICAgICAgICAucmF3SFRNTChwbGF5ZXIudG90YWxfZmxlZXRzKVxuICAgICAgICAgICAgICAgIC5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgICAgICBDcnV4LlRleHQoXCJcIiwgXCJwYWQ4IHR4dF9jZW50ZXJcIilcbiAgICAgICAgICAgICAgICAuZ3JpZCgyMCwgMTMsIDUsIDMpXG4gICAgICAgICAgICAgICAgLnJhd0hUTUwocGxheWVyLnRvdGFsX3N0cmVuZ3RoKVxuICAgICAgICAgICAgICAgIC5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgICAgICBDcnV4LlRleHQoXCJcIiwgXCJwYWQ4IHR4dF9jZW50ZXJcIilcbiAgICAgICAgICAgICAgICAuZ3JpZCgyMCwgMTUsIDUsIDMpXG4gICAgICAgICAgICAgICAgLnJhd0hUTUwocGxheWVyLnNoaXBzUGVyVGljaylcbiAgICAgICAgICAgICAgICAucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIHNlbGVjdEhpbGlnaHRTdHlsZShwMSwgcDIpIHtcbiAgICAgICAgICAgIHAxID0gTnVtYmVyKHAxKTtcbiAgICAgICAgICAgIHAyID0gTnVtYmVyKHAyKTtcbiAgICAgICAgICAgIGlmIChwMSA8IHAyKVxuICAgICAgICAgICAgICAgIHJldHVybiBcIiB0eHRfd2Fybl9iYWRcIjtcbiAgICAgICAgICAgIGlmIChwMSA+IHAyKVxuICAgICAgICAgICAgICAgIHJldHVybiBcIiB0eHRfd2Fybl9nb29kXCI7XG4gICAgICAgICAgICByZXR1cm4gXCJcIjtcbiAgICAgICAgfVxuICAgICAgICAvLyBZb3VyIHN0YXRzXG4gICAgICAgIGlmICh1bml2ZXJzZS5wbGF5ZXIpIHtcbiAgICAgICAgICAgIENydXguVGV4dChcIlwiLCBcInBhZDggdHh0X2NlbnRlciBcIi5jb25jYXQoc2VsZWN0SGlsaWdodFN0eWxlKHVuaXZlcnNlLnBsYXllci50b3RhbF9zdGFycywgcGxheWVyLnRvdGFsX3N0YXJzKSkpXG4gICAgICAgICAgICAgICAgLmdyaWQoMjUsIDksIDUsIDMpXG4gICAgICAgICAgICAgICAgLnJhd0hUTUwodW5pdmVyc2UucGxheWVyLnRvdGFsX3N0YXJzKVxuICAgICAgICAgICAgICAgIC5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgICAgICBDcnV4LlRleHQoXCJcIiwgXCJwYWQ4IHR4dF9jZW50ZXJcIi5jb25jYXQoc2VsZWN0SGlsaWdodFN0eWxlKHVuaXZlcnNlLnBsYXllci50b3RhbF9mbGVldHMsIHBsYXllci50b3RhbF9mbGVldHMpKSlcbiAgICAgICAgICAgICAgICAuZ3JpZCgyNSwgMTEsIDUsIDMpXG4gICAgICAgICAgICAgICAgLnJhd0hUTUwodW5pdmVyc2UucGxheWVyLnRvdGFsX2ZsZWV0cylcbiAgICAgICAgICAgICAgICAucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICAgICAgQ3J1eC5UZXh0KFwiXCIsIFwicGFkOCB0eHRfY2VudGVyXCIuY29uY2F0KHNlbGVjdEhpbGlnaHRTdHlsZSh1bml2ZXJzZS5wbGF5ZXIudG90YWxfc3RyZW5ndGgsIHBsYXllci50b3RhbF9zdHJlbmd0aCkpKVxuICAgICAgICAgICAgICAgIC5ncmlkKDI1LCAxMywgNSwgMylcbiAgICAgICAgICAgICAgICAucmF3SFRNTCh1bml2ZXJzZS5wbGF5ZXIudG90YWxfc3RyZW5ndGgpXG4gICAgICAgICAgICAgICAgLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgICAgIENydXguVGV4dChcIlwiLCBcInBhZDggdHh0X2NlbnRlclwiLmNvbmNhdChzZWxlY3RIaWxpZ2h0U3R5bGUodW5pdmVyc2UucGxheWVyLnNoaXBzUGVyVGljaywgcGxheWVyLnNoaXBzUGVyVGljaykpKVxuICAgICAgICAgICAgICAgIC5ncmlkKDI1LCAxNSwgNSwgMylcbiAgICAgICAgICAgICAgICAucmF3SFRNTCh1bml2ZXJzZS5wbGF5ZXIuc2hpcHNQZXJUaWNrKVxuICAgICAgICAgICAgICAgIC5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgIH1cbiAgICAgICAgQ3J1eC5XaWRnZXQoXCJjb2xfYWNjZW50XCIpLmdyaWQoMCwgMTYsIDEwLCAzKS5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgIGlmICh1bml2ZXJzZS5wbGF5ZXIpIHtcbiAgICAgICAgICAgIHZhciBtc2dCdG4gPSBDcnV4Lkljb25CdXR0b24oXCJpY29uLW1haWxcIiwgXCJpbmJveF9uZXdfbWVzc2FnZV90b19wbGF5ZXJcIiwgcGxheWVyLnVpZClcbiAgICAgICAgICAgICAgICAuZ3JpZCgwLCAxNiwgMywgMylcbiAgICAgICAgICAgICAgICAuYWRkU3R5bGUoXCJmd2RcIilcbiAgICAgICAgICAgICAgICAuZGlzYWJsZSgpXG4gICAgICAgICAgICAgICAgLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgICAgIGlmIChwbGF5ZXIgIT09IHVuaXZlcnNlLnBsYXllciAmJiBwbGF5ZXIuYWxpYXMpIHtcbiAgICAgICAgICAgICAgICBtc2dCdG4uZW5hYmxlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBDcnV4Lkljb25CdXR0b24oXCJpY29uLWNoYXJ0LWxpbmVcIiwgXCJzaG93X2ludGVsXCIsIHBsYXllci51aWQpXG4gICAgICAgICAgICAgICAgLmdyaWQoMi41LCAxNiwgMywgMylcbiAgICAgICAgICAgICAgICAucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICAgICAgaWYgKHNob3dFbXBpcmUpIHtcbiAgICAgICAgICAgICAgICBDcnV4Lkljb25CdXR0b24oXCJpY29uLWV5ZVwiLCBcInNob3dfc2NyZWVuXCIsIFwiZW1waXJlXCIpXG4gICAgICAgICAgICAgICAgICAgIC5ncmlkKDcsIDE2LCAzLCAzKVxuICAgICAgICAgICAgICAgICAgICAucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwbGF5ZXJQYW5lbDtcbiAgICB9O1xufTtcbnZhciBzdXBlclN0YXJJbnNwZWN0b3IgPSBOZXB0dW5lc1ByaWRlLm5wdWkuU3Rhckluc3BlY3Rvcjtcbk5lcHR1bmVzUHJpZGUubnB1aS5TdGFySW5zcGVjdG9yID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciB1bml2ZXJzZSA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2U7XG4gICAgdmFyIGNvbmZpZyA9IE5lcHR1bmVzUHJpZGUuZ2FtZUNvbmZpZztcbiAgICAvL0NhbGwgc3VwZXIgKFByZXZpb3VzIFN0YXJJbnNwZWN0b3IgZnJvbSBnYW1lY29kZSlcbiAgICB2YXIgc3Rhckluc3BlY3RvciA9IHN1cGVyU3Rhckluc3BlY3RvcigpO1xuICAgIENydXguSWNvbkJ1dHRvbihcImljb24taGVscCByZWxcIiwgXCJzaG93X2hlbHBcIiwgXCJzdGFyc1wiKS5yb29zdChzdGFySW5zcGVjdG9yLmhlYWRpbmcpO1xuICAgIENydXguSWNvbkJ1dHRvbihcImljb24tZG9jLXRleHQgcmVsXCIsIFwic2hvd19zY3JlZW5cIiwgXCJjb21iYXRfY2FsY3VsYXRvclwiKS5yb29zdChzdGFySW5zcGVjdG9yLmhlYWRpbmcpO1xuICAgIC8vQXBwZW5kIGV4dHJhIGZ1bmN0aW9uXG4gICAgZnVuY3Rpb24gYXBwbHlfZnJhY3Rpb25hbF9zaGlwcygpIHtcbiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGRlcHRoLCBzZWxlY3RvciwgZWxlbWVudCwgY291bnRlciwgZnJhY3Rpb25hbF9zaGlwLCBmcmFjdGlvbmFsX3NoaXBfMSwgbmV3X3ZhbHVlO1xuICAgICAgICAgICAgcmV0dXJuIF9fZ2VuZXJhdG9yKHRoaXMsIGZ1bmN0aW9uIChfYSkge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAoX2EubGFiZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICAgICAgICAgICAgZGVwdGggPSBjb25maWcudHVybkJhc2VkID8gNCA6IDM7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxlY3RvciA9IFwiI2NvbnRlbnRBcmVhID4gZGl2ID4gZGl2LndpZGdldC5mdWxsc2NyZWVuID4gZGl2Om50aC1jaGlsZChcIi5jb25jYXQoZGVwdGgsIFwiKSA+IGRpdiA+IGRpdjpudGgtY2hpbGQoNSkgPiBkaXYud2lkZ2V0LnBhZDEyLmljb24tcm9ja2V0LWlubGluZS50eHRfcmlnaHRcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50ID0gJChzZWxlY3Rvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb3VudGVyID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZyYWN0aW9uYWxfc2hpcCA9IHVuaXZlcnNlLnNlbGVjdGVkU3RhcltcImNcIl0udG9GaXhlZCgyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICQoc2VsZWN0b3IpLmFwcGVuZChmcmFjdGlvbmFsX3NoaXApO1xuICAgICAgICAgICAgICAgICAgICAgICAgX2EubGFiZWwgPSAxO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIShlbGVtZW50Lmxlbmd0aCA9PSAwICYmIGNvdW50ZXIgPD0gMTAwKSkgcmV0dXJuIFszIC8qYnJlYWsqLywgM107XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzQgLyp5aWVsZCovLCBuZXcgUHJvbWlzZShmdW5jdGlvbiAocikgeyByZXR1cm4gc2V0VGltZW91dChyLCAxMCk7IH0pXTtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgICAgICAgICAgICAgX2Euc2VudCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudCA9ICQoc2VsZWN0b3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZnJhY3Rpb25hbF9zaGlwXzEgPSB1bml2ZXJzZS5zZWxlY3RlZFN0YXJbXCJjXCJdO1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV3X3ZhbHVlID0gcGFyc2VJbnQoJChzZWxlY3RvcikudGV4dCgpKSArIGZyYWN0aW9uYWxfc2hpcF8xO1xuICAgICAgICAgICAgICAgICAgICAgICAgJChzZWxlY3RvcikudGV4dChuZXdfdmFsdWUudG9GaXhlZCgyKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb3VudGVyICs9IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gWzMgLypicmVhayovLCAxXTtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAzOiByZXR1cm4gWzIgLypyZXR1cm4qL107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAoXCJjXCIgaW4gdW5pdmVyc2Uuc2VsZWN0ZWRTdGFyKSB7XG4gICAgICAgIGFwcGx5X2ZyYWN0aW9uYWxfc2hpcHMoKTtcbiAgICB9XG4gICAgcmV0dXJuIHN0YXJJbnNwZWN0b3I7XG59O1xuLy9KYXZhc2NyaXB0IGNhbGxcbnNldFRpbWVvdXQoTGVnYWN5X05lcHR1bmVzUHJpZGVBZ2VudCwgMTAwMCk7XG5zZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAvL1R5cGVzY3JpcHQgY2FsbFxuICAgIHBvc3RfaG9vaygpO1xuICAgIHJlbmRlckxlZGdlcihOZXB0dW5lc1ByaWRlLCBDcnV4LCBNb3VzZXRyYXApO1xufSwgMTUwMCk7XG5zZXRUaW1lb3V0KGFwcGx5X2hvb2tzLCAxNTAwKTtcbi8vVGVzdCB0byBzZWUgaWYgUGxheWVyUGFuZWwgaXMgdGhlcmVcbi8vSWYgaXQgaXMgb3ZlcndyaXRlcyBjdXN0b20gb25lXG4vL090aGVyd2lzZSB3aGlsZSBsb29wICYgc2V0IHRpbWVvdXQgdW50aWwgaXRzIHRoZXJlXG5mb3JjZV9hZGRfY3VzdG9tX3BsYXllcl9wYW5lbCgpO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9