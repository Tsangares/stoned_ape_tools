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

/***/ "./source/utilities/gift_screen.ts":
/*!*****************************************!*\
  !*** ./source/utilities/gift_screen.ts ***!
  \*****************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ApeGiftItem: function() { return /* binding */ ApeGiftItem; },
/* harmony export */   buyApeGiftScreen: function() { return /* binding */ buyApeGiftScreen; }
/* harmony export */ });
var buyApeGiftScreen = function (Crux, universe, npui) {
    console.log("Overloadded Gift Screen");
    var buy = npui.Screen("gift_heading").size(480);
    Crux.Text("gift_intro", "rel pad12 col_accent txt_center")
        .format({
        player: universe.selectedPlayer.colourBox +
            universe.selectedPlayer.hyperlinkedAlias,
    })
        .size(480)
        .roost(buy);
    npui.GalacticCreditBalance().roost(buy);
    var i;
    var items = [
        { icon: "trek", amount: 1 },
        { icon: "rebel", amount: 1 },
        { icon: "empire", amount: 1 },
        { icon: "toxic", amount: 1 },
        { icon: "wolf", amount: 5 },
        { icon: "wizard", amount: 1 },
        { icon: "pirate", amount: 5 },
        { icon: "wordsmith", amount: 2 },
        { icon: "lucky", amount: 2 },
        { icon: "ape", amount: 999 },
        { icon: "ironborn", amount: 2 },
        { icon: "strange", amount: 2 },
        { icon: "cheesy", amount: 1 },
        { icon: "strategic", amount: 1 },
        { icon: "badass", amount: 1 },
        { icon: "lionheart", amount: 1 },
        { icon: "gun", amount: 1 },
        { icon: "command", amount: 1 },
        { icon: "science", amount: 1 },
        { icon: "nerd", amount: 1 },
        { icon: "merit", amount: 1 },
        { icon: "honour", amount: 1 },
        { icon: "lifetime", amount: 1 },
        { icon: "tourney_win", amount: 1 },
        { icon: "tourney_join", amount: 1 },
        { icon: "tourney_join", amount: 1 },
        { icon: "tourney_join", amount: 1 },
        { icon: "bullseye", amount: 1 },
        { icon: "proteus", amount: 1 },
        { icon: "flambeau", amount: 1 },
        { icon: "rat", amount: 1 },
    ];
    for (i = items.length - 1; i >= 0; i--) {
        items[i].puid = universe.selectedPlayer.uid;
        npui.GiftItem(items[i]).roost(buy);
    }
    return buy;
};
var ApeGiftItem = function (Crux, url, item) {
    var gi = Crux.Widget("rel").size(480);
    Crux.Widget("rel col_base").size(480, 16).roost(gi);
    var image_url = "../images/badges/".concat(item.icon, ".png");
    if (item.icon == "ape") {
        image_url = "".concat(url).concat(item.icon, ".png");
    }
    gi.icon = Crux.Image(image_url, "abs").grid(0.25, 1, 6, 6).roost(gi);
    gi.body = Crux.Text("gift_desc_".concat(item.icon), "rel txt_selectable")
        .size(384 - 24)
        .pos(96 + 12)
        .roost(gi);
    gi.buyNowBg = Crux.Widget("rel").size(480, 52).roost(gi);
    gi.buyNowButton = Crux.Button("buy_now", "buy_gift", item)
        .grid(20, 0, 10, 3)
        .roost(gi.buyNowBg);
    if (item.amount > NeptunesPride.account.credits) {
        gi.buyNowButton.disable();
    }
    Crux.Widget("rel col_accent").size(480, 4).roost(gi);
    return gi;
};


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
var custom_badges = ["ape"];
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
            .pos(51, 68)
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
/* harmony import */ var _utilities_gift_screen__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./utilities/gift_screen */ "./source/utilities/gift_screen.ts");
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
    NeptunesPride.templates["gift_desc_ape"] =
        "<h3>Ape - 420 Credit</h3><p>Is this what you call 'evolution'? Because frankly, I've seen better designs on a banana peel.</p>";
    Crux.localise = function (id) {
        if (Crux.templates[id]) {
            return Crux.templates[id];
        }
        else {
            return id.toProperCase();
        }
    };
};
var overrideGiftItems = function () {
    var image_url = $("#ape-intel-plugin").attr("images");
    NeptunesPride.npui.BuyGiftScreen = function () {
        return (0,_utilities_gift_screen__WEBPACK_IMPORTED_MODULE_10__.buyApeGiftScreen)(Crux, NeptunesPride.universe, NeptunesPride.npui);
    };
    NeptunesPride.npui.GiftItem = function (item) {
        return (0,_utilities_gift_screen__WEBPACK_IMPORTED_MODULE_10__.ApeGiftItem)(Crux, image_url, item);
    };
};
var overrideShowScreen = function () {
    NeptunesPride.npui.onShowScreen = function (event, screenName, screenConfig) {
        return onShowApeScreen(NeptunesPride.npui, NeptunesPride.universe, event, screenName, screenConfig);
    };
};
$("ape-intel-plugin").ready(function () {
    post_hook();
    //$("#ape-intel-plugin").remove();
});
function post_hook() {
    overrideGiftItems();
    //overrideShowScreen();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxLQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0Esc0NBQXNDLElBQUk7QUFDMUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSw4QkFBOEIsSUFBSSxJQUFJLGVBQWUsU0FBUyxLQUFLOztBQUVuRTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSx3Q0FBd0MsSUFBSSxFQUFFLEtBQUs7O0FBRW5EO0FB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Q0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJDQUEyQyxhQUFhO0FBQ3hELGlFQUFpRTtBQUNqRSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0EsNEJBQTRCLGFBQWE7QUFDekM7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwQ0FBMEMsYUFBYTtBQUN2RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkNBQTJDLGFBQWE7QUFDeEQsaUVBQWlFO0FBQ2pFLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQ0FBMkM7QUFDM0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFD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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxnQkFBZ0IsT0FBTztBQUN2Qjs7QUFFQTtBQUNBO0FBQ0EsbUVBQW1FLGNBQWM7QUFDakY7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLHNCQUFzQjtBQUN0QixZQUFZO0FBQ1o7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNEQUFzRDtBQUN0RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMEJBQTBCLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxJQUFJLEdBQUc7QUFDbEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9DQUFvQyxFQUFFLEVBQUUsR0FBRyxHQUFHLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRTtBQUM1RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRDQUE0QyxHQUFHLEdBQUcsR0FBRyxNQUFNLEVBQUUsTUFBTSxFQUFFO0FBQ3JFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMENBQTBDLEdBQUcsVUFBVSxFQUFFO0FBQ3pEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQ0FBc0MsRUFBRSxLQUFLLEdBQUcsR0FBRyxHQUFHLE1BQU0sRUFBRSxNQUFNLEVBQUU7QUFDdEU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBDQUEwQyxFQUFFO0FBQzVDLDRDQUE0QyxHQUFHLFdBQVcsRUFBRTtBQUM1RCw0Q0FBNEMsR0FBRyxXQUFXLEVBQUU7QUFDNUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzREFBc0QsR0FB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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBCQUEwQixtREFBUTtBQUNsQztBQUNBO0FBQ0Esc0RBQXNELG1EQUFRO0FBQzlEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0IsbURBQVE7QUFDNUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw2REFBNkQsbURBQVE7QUFDckU7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLG1EQUFRO0FBQ3hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0VBQWdFLG1EQUFRO0FBQ3hFO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQixtREFBUTtBQUM1QjtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBLFFBQVEsMEVBQXFCO0FBQzdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdFQUF3RSwyQkFBMkI7QUFDbkc7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2IsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJLHFEQUFZO0FBQ2hCLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vbmVwdHVuZXMtcHJpZGUtYWdlbnQvLi9zb3VyY2UvY2hhdC50cyIsIndlYnBhY2s6Ly9uZXB0dW5lcy1wcmlkZS1hZ2VudC8uL3NvdXJjZS9ldmVudF9jYWNoZS50cyIsIndlYnBhY2s6Ly9uZXB0dW5lcy1wcmlkZS1hZ2VudC8uL3NvdXJjZS9nYW1lLnRzIiwid2VicGFjazovL25lcHR1bmVzLXByaWRlLWFnZW50Ly4vc291cmNlL2dldF9oZXJvLnRzIiwid2VicGFjazovL25lcHR1bmVzLXByaWRlLWFnZW50Ly4vc291cmNlL2hvdGtleS50cyIsIndlYnBhY2s6Ly9uZXB0dW5lcy1wcmlkZS1hZ2VudC8uL3NvdXJjZS9sZWRnZXIudHMiLCJ3ZWJwYWNrOi8vbmVwdHVuZXMtcHJpZGUtYWdlbnQvLi9zb3VyY2UvdXRpbGl0aWVzL2FwaS50cyIsIndlYnBhY2s6Ly9uZXB0dW5lcy1wcmlkZS1hZ2VudC8uL3NvdXJjZS91dGlsaXRpZXMvZ2V0X2dhbWVfc3RhdGUudHMiLCJ3ZWJwYWNrOi8vbmVwdHVuZXMtcHJpZGUtYWdlbnQvLi9zb3VyY2UvdXRpbGl0aWVzL2dpZnRfc2NyZWVuLnRzIiwid2VicGFjazovL25lcHR1bmVzLXByaWRlLWFnZW50Ly4vc291cmNlL3V0aWxpdGllcy9ncmFwaGljcy50cyIsIndlYnBhY2s6Ly9uZXB0dW5lcy1wcmlkZS1hZ2VudC8uL3NvdXJjZS91dGlsaXRpZXMvbWVyZ2UudHMiLCJ3ZWJwYWNrOi8vbmVwdHVuZXMtcHJpZGUtYWdlbnQvLi9zb3VyY2UvdXRpbGl0aWVzL25wY19jYWxjLnRzIiwid2VicGFjazovL25lcHR1bmVzLXByaWRlLWFnZW50Ly4vc291cmNlL3V0aWxpdGllcy9wYXJzZV91dGlscy50cyIsIndlYnBhY2s6Ly9uZXB0dW5lcy1wcmlkZS1hZ2VudC8uL3NvdXJjZS91dGlsaXRpZXMvcGxheWVyX2JhZGdlcy50cyIsIndlYnBhY2s6Ly9uZXB0dW5lcy1wcmlkZS1hZ2VudC8uL25vZGVfbW9kdWxlcy9tYXJrZWQvbGliL21hcmtlZC5lc20uanMiLCJ3ZWJwYWNrOi8vbmVwdHVuZXMtcHJpZGUtYWdlbnQvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vbmVwdHVuZXMtcHJpZGUtYWdlbnQvd2VicGFjay9ydW50aW1lL2NvbXBhdCBnZXQgZGVmYXVsdCBleHBvcnQiLCJ3ZWJwYWNrOi8vbmVwdHVuZXMtcHJpZGUtYWdlbnQvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL25lcHR1bmVzLXByaWRlLWFnZW50L3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vbmVwdHVuZXMtcHJpZGUtYWdlbnQvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9uZXB0dW5lcy1wcmlkZS1hZ2VudC8uL3NvdXJjZS9pbnRlbC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBnZXRfaGVybyB9IGZyb20gXCIuL2dldF9oZXJvXCI7XG52YXIgUkVTRUFDSF9NQVAgPSB7XG4gICAgc2Nhbm5pbmc6IFwiU2Nhbm5pbmdcIixcbiAgICBwcm9wdWxzaW9uOiBcIkh5cGVyc3BhY2UgUmFuZ2VcIixcbiAgICB0ZXJyYWZvcm1pbmc6IFwiVGVycmFmb3JtaW5nXCIsXG4gICAgcmVzZWFyY2g6IFwiRXhwZXJpbWVudGF0aW9uXCIsXG4gICAgd2VhcG9uczogXCJXZWFwb25zXCIsXG4gICAgYmFua2luZzogXCJCYW5raW5nXCIsXG4gICAgbWFudWZhY3R1cmluZzogXCJNYW51ZmFjdHVyaW5nXCIsXG59O1xuLy9Gb3IgcXVpY2sgcmVzZWFyY2ggZGlzcGxheVxuZnVuY3Rpb24gZ2V0X3Jlc2VhcmNoKGdhbWUpIHtcbiAgICB2YXIgdW5pdmVyc2UgPSBnYW1lLnVuaXZlcnNlO1xuICAgIHZhciBoZXJvID0gZ2V0X2hlcm8oZ2FtZS51bml2ZXJzZSk7XG4gICAgdmFyIHNjaWVuY2UgPSBoZXJvLnRvdGFsX3NjaWVuY2U7XG4gICAgLy9DdXJyZW50IFNjaWVuY2VcbiAgICB2YXIgY3VycmVudCA9IGhlcm8udGVjaFtoZXJvLnJlc2VhcmNoaW5nXTtcbiAgICB2YXIgY3VycmVudF9wb2ludHNfcmVtYWluaW5nID0gY3VycmVudC5icnIgKiBjdXJyZW50LmxldmVsIC0gY3VycmVudC5yZXNlYXJjaDtcbiAgICB2YXIgZXRhID0gTWF0aC5jZWlsKGN1cnJlbnRfcG9pbnRzX3JlbWFpbmluZyAvIHNjaWVuY2UpOyAvL0hvdXJzXG4gICAgLy9OZXh0IHNjaWVuY2VcbiAgICB2YXIgbmV4dCA9IGhlcm8udGVjaFtoZXJvLnJlc2VhcmNoaW5nX25leHRdO1xuICAgIHZhciBuZXh0X3BvaW50c19yZW1haW5pbmcgPSBuZXh0LmJyciAqIG5leHQubGV2ZWwgLSBuZXh0LnJlc2VhcmNoO1xuICAgIHZhciBuZXh0X2V0YSA9IE1hdGguY2VpbChuZXh0X3BvaW50c19yZW1haW5pbmcgLyBzY2llbmNlKSArIGV0YTtcbiAgICB2YXIgbmV4dF9sZXZlbCA9IG5leHQubGV2ZWwgKyAxO1xuICAgIGlmIChoZXJvLnJlc2VhcmNoaW5nID09IGhlcm8ucmVzZWFyY2hpbmdfbmV4dCkge1xuICAgICAgICAvL1JlY3VycmluZyByZXNlYXJjaFxuICAgICAgICBuZXh0X3BvaW50c19yZW1haW5pbmcgKz0gbmV4dC5icnI7XG4gICAgICAgIG5leHRfZXRhID0gTWF0aC5jZWlsKChuZXh0LmJyciAqIG5leHQubGV2ZWwgKyAxKSAvIHNjaWVuY2UpICsgZXRhO1xuICAgICAgICBuZXh0X2xldmVsICs9IDE7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIGN1cnJlbnRfbmFtZTogUkVTRUFDSF9NQVBbaGVyby5yZXNlYXJjaGluZ10sXG4gICAgICAgIGN1cnJlbnRfbGV2ZWw6IGN1cnJlbnRbXCJsZXZlbFwiXSArIDEsXG4gICAgICAgIGN1cnJlbnRfZXRhOiBldGEsXG4gICAgICAgIG5leHRfbmFtZTogUkVTRUFDSF9NQVBbaGVyby5yZXNlYXJjaGluZ19uZXh0XSxcbiAgICAgICAgbmV4dF9sZXZlbDogbmV4dF9sZXZlbCxcbiAgICAgICAgbmV4dF9ldGE6IG5leHRfZXRhLFxuICAgICAgICBzY2llbmNlOiBzY2llbmNlLFxuICAgIH07XG59XG5mdW5jdGlvbiBnZXRfcmVzZWFyY2hfdGV4dChnYW1lKSB7XG4gICAgdmFyIHJlc2VhcmNoID0gZ2V0X3Jlc2VhcmNoKGdhbWUpO1xuICAgIHZhciBmaXJzdF9saW5lID0gXCJOb3c6IFwiLmNvbmNhdChyZXNlYXJjaFtcImN1cnJlbnRfbmFtZVwiXSwgXCIgXCIpLmNvbmNhdChyZXNlYXJjaFtcImN1cnJlbnRfbGV2ZWxcIl0sIFwiIC0gXCIpLmNvbmNhdChyZXNlYXJjaFtcImN1cnJlbnRfZXRhXCJdLCBcIiB0aWNrcy5cIik7XG4gICAgdmFyIHNlY29uZF9saW5lID0gXCJOZXh0OiBcIi5jb25jYXQocmVzZWFyY2hbXCJuZXh0X25hbWVcIl0sIFwiIFwiKS5jb25jYXQocmVzZWFyY2hbXCJuZXh0X2xldmVsXCJdLCBcIiAtIFwiKS5jb25jYXQocmVzZWFyY2hbXCJuZXh0X2V0YVwiXSwgXCIgdGlja3MuXCIpO1xuICAgIHZhciB0aGlyZF9saW5lID0gXCJNeSBTY2llbmNlOiBcIi5jb25jYXQocmVzZWFyY2hbXCJzY2llbmNlXCJdKTtcbiAgICByZXR1cm4gXCJcIi5jb25jYXQoZmlyc3RfbGluZSwgXCJcXG5cIikuY29uY2F0KHNlY29uZF9saW5lLCBcIlxcblwiKS5jb25jYXQodGhpcmRfbGluZSwgXCJcXG5cIik7XG59XG5mdW5jdGlvbiBNYXJrRG93bk1lc3NhZ2VDb21tZW50KGNvbnRleHQsIHRleHQsIGluZGV4KSB7XG4gICAgdmFyIG1lc3NhZ2VDb21tZW50ID0gY29udGV4dC5NZXNzYWdlQ29tbWVudCh0ZXh0LCBpbmRleCk7XG4gICAgcmV0dXJuIFwiXCI7XG59XG5leHBvcnQgeyBnZXRfcmVzZWFyY2gsIGdldF9yZXNlYXJjaF90ZXh0LCBNYXJrRG93bk1lc3NhZ2VDb21tZW50IH07XG4iLCJpbXBvcnQgeyBnZXRfbGVkZ2VyIH0gZnJvbSBcIi4vbGVkZ2VyXCI7XG5pbXBvcnQgeyBnZXRfaGVybyB9IGZyb20gXCIuL2dldF9oZXJvXCI7XG4vL0dsb2JhbCBjYWNoZWQgZXZlbnQgc3lzdGVtLlxuZXhwb3J0IHZhciBjYWNoZWRfZXZlbnRzID0gW107XG5leHBvcnQgdmFyIGNhY2hlRmV0Y2hTdGFydCA9IG5ldyBEYXRlKCk7XG5leHBvcnQgdmFyIGNhY2hlRmV0Y2hTaXplID0gMDtcbi8vQXN5bmMgcmVxdWVzdCBnYW1lIGV2ZW50c1xuLy9nYW1lIGlzIHVzZWQgdG8gZ2V0IHRoZSBhcGkgdmVyc2lvbiBhbmQgdGhlIGdhbWVOdW1iZXJcbmV4cG9ydCBmdW5jdGlvbiB1cGRhdGVfZXZlbnRfY2FjaGUoZ2FtZSwgY3J1eCwgZmV0Y2hTaXplLCBzdWNjZXNzLCBlcnJvcikge1xuICAgIHZhciBjb3VudCA9IGNhY2hlZF9ldmVudHMubGVuZ3RoID4gMCA/IGZldGNoU2l6ZSA6IDEwMDAwMDtcbiAgICBjYWNoZUZldGNoU3RhcnQgPSBuZXcgRGF0ZSgpO1xuICAgIGNhY2hlRmV0Y2hTaXplID0gY291bnQ7XG4gICAgdmFyIHBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMoe1xuICAgICAgICB0eXBlOiBcImZldGNoX2dhbWVfbWVzc2FnZXNcIixcbiAgICAgICAgY291bnQ6IGNvdW50LnRvU3RyaW5nKCksXG4gICAgICAgIG9mZnNldDogXCIwXCIsXG4gICAgICAgIGdyb3VwOiBcImdhbWVfZXZlbnRcIixcbiAgICAgICAgdmVyc2lvbjogZ2FtZS52ZXJzaW9uLFxuICAgICAgICBnYW1lX251bWJlcjogZ2FtZS5nYW1lTnVtYmVyLFxuICAgIH0pO1xuICAgIHZhciBoZWFkZXJzID0ge1xuICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZG5cIixcbiAgICB9O1xuICAgIGZldGNoKFwiL3RyZXF1ZXN0L2ZldGNoX2dhbWVfbWVzc2FnZXNcIiwge1xuICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZFwiLFxuICAgICAgICB9LFxuICAgICAgICBib2R5OiBwYXJhbXMsXG4gICAgfSlcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7IHJldHVybiByZXNwb25zZS5qc29uKCk7IH0pXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICBzeW5jX21lc3NhZ2VfY2FjaGUocmVzcG9uc2UpOyAvL1VwZGF0ZXMgY2FjaGVkX2V2ZW50c1xuICAgICAgICAvL2NhY2hlZF9ldmVudHMgPSBzeW5jX21lc3NhZ2VfY2FjaGUocmVzcG9uc2UpKVxuICAgIH0pXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uICh4KSB7IHJldHVybiBzdWNjZXNzKGdhbWUsIGNydXgpOyB9KVxuICAgICAgICAuY2F0Y2goZXJyb3IpO1xufVxuLy9DdXN0b20gVUkgQ29tcG9uZW50cyBmb3IgTGVkZ2VyXG5leHBvcnQgZnVuY3Rpb24gUGxheWVyTmFtZUljb25Sb3dMaW5rKGNydXgsIG5wdWksIHBsYXllcikge1xuICAgIHZhciBwbGF5ZXJOYW1lSWNvblJvdyA9IGNydXguV2lkZ2V0KFwicmVsIGNvbF9ibGFjayBjbGlja2FibGVcIikuc2l6ZSg0ODAsIDQ4KTtcbiAgICBucHVpLlBsYXllckljb24ocGxheWVyLCB0cnVlKS5yb29zdChwbGF5ZXJOYW1lSWNvblJvdyk7XG4gICAgY3J1eFxuICAgICAgICAuVGV4dChcIlwiLCBcInNlY3Rpb25fdGl0bGVcIilcbiAgICAgICAgLmdyaWQoNiwgMCwgMjEsIDMpXG4gICAgICAgIC5yYXdIVE1MKFwiPGEgb25jbGljaz1cXFwiQ3J1eC5jcnV4LnRyaWdnZXIoJ3Nob3dfcGxheWVyX3VpZCcsICdcIi5jb25jYXQocGxheWVyLnVpZCwgXCInIClcXFwiPlwiKS5jb25jYXQocGxheWVyLmFsaWFzLCBcIjwvYT5cIikpXG4gICAgICAgIC5yb29zdChwbGF5ZXJOYW1lSWNvblJvdyk7XG4gICAgcmV0dXJuIHBsYXllck5hbWVJY29uUm93O1xufVxuZXhwb3J0IGZ1bmN0aW9uIHN5bmNfbWVzc2FnZV9jYWNoZShyZXNwb25zZSkge1xuICAgIHZhciBjYWNoZUZldGNoRW5kID0gbmV3IERhdGUoKTtcbiAgICB2YXIgZWxhcHNlZCA9IGNhY2hlRmV0Y2hFbmQuZ2V0VGltZSgpIC0gY2FjaGVGZXRjaFN0YXJ0LmdldFRpbWUoKTtcbiAgICBjb25zb2xlLmxvZyhcIkZldGNoZWQgXCIuY29uY2F0KGNhY2hlRmV0Y2hTaXplLCBcIiBldmVudHMgaW4gXCIpLmNvbmNhdChlbGFwc2VkLCBcIm1zXCIpKTtcbiAgICB2YXIgaW5jb21pbmcgPSByZXNwb25zZS5yZXBvcnQubWVzc2FnZXM7XG4gICAgaWYgKGNhY2hlZF9ldmVudHMubGVuZ3RoID4gMCkge1xuICAgICAgICB2YXIgb3ZlcmxhcE9mZnNldCA9IC0xO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGluY29taW5nLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICB2YXIgbWVzc2FnZSA9IGluY29taW5nW2ldO1xuICAgICAgICAgICAgaWYgKG1lc3NhZ2Uua2V5ID09PSBjYWNoZWRfZXZlbnRzWzBdLmtleSkge1xuICAgICAgICAgICAgICAgIG92ZXJsYXBPZmZzZXQgPSBpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChvdmVybGFwT2Zmc2V0ID49IDApIHtcbiAgICAgICAgICAgIGluY29taW5nID0gaW5jb21pbmcuc2xpY2UoMCwgb3ZlcmxhcE9mZnNldCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAob3ZlcmxhcE9mZnNldCA8IDApIHtcbiAgICAgICAgICAgIHZhciBzaXplID0gaW5jb21pbmcubGVuZ3RoICogMjtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiTWlzc2luZyBzb21lIGV2ZW50cywgZG91YmxlIGZldGNoIHRvIFwiLmNvbmNhdChzaXplKSk7XG4gICAgICAgICAgICAvL3VwZGF0ZV9ldmVudF9jYWNoZShnYW1lLCBjcnV4LCBzaXplLCByZWNpZXZlX25ld19tZXNzYWdlcywgY29uc29sZS5lcnJvcik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gd2UgaGFkIGNhY2hlZCBldmVudHMsIGJ1dCB3YW50IHRvIGJlIGV4dHJhIHBhcmFub2lkIGFib3V0XG4gICAgICAgIC8vIGNvcnJlY3RuZXNzLiBTbyBpZiB0aGUgcmVzcG9uc2UgY29udGFpbmVkIHRoZSBlbnRpcmUgZXZlbnRcbiAgICAgICAgLy8gbG9nLCB2YWxpZGF0ZSB0aGF0IGl0IGV4YWN0bHkgbWF0Y2hlcyB0aGUgY2FjaGVkIGV2ZW50cy5cbiAgICAgICAgaWYgKHJlc3BvbnNlLnJlcG9ydC5tZXNzYWdlcy5sZW5ndGggPT09IGNhY2hlZF9ldmVudHMubGVuZ3RoKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIioqKiBWYWxpZGF0aW5nIGNhY2hlZF9ldmVudHMgKioqXCIpO1xuICAgICAgICAgICAgdmFyIHZhbGlkXzEgPSByZXNwb25zZS5yZXBvcnQubWVzc2FnZXM7XG4gICAgICAgICAgICB2YXIgaW52YWxpZEVudHJpZXMgPSBjYWNoZWRfZXZlbnRzLmZpbHRlcihmdW5jdGlvbiAoZSwgaSkgeyByZXR1cm4gZS5rZXkgIT09IHZhbGlkXzFbaV0ua2V5OyB9KTtcbiAgICAgICAgICAgIGlmIChpbnZhbGlkRW50cmllcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBhbGVydChcIiEhIEludmFsaWQgZW50cmllcyBmb3VuZFwiKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiISEgSW52YWxpZCBlbnRyaWVzIGZvdW5kOiBcIiwgaW52YWxpZEVudHJpZXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc29sZS5sb2coXCIqKiogVmFsaWRhdGlvbiBDb21wbGV0ZWQgKioqXCIpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gdGhlIHJlc3BvbnNlIGRpZG4ndCBjb250YWluIHRoZSBlbnRpcmUgZXZlbnQgbG9nLiBHbyBmZXRjaFxuICAgICAgICAgICAgLy8gYSB2ZXJzaW9uIHRoYXQgX2RvZXNfLlxuICAgICAgICAgICAgLypcbiAgICAgICAgICAgIHVwZGF0ZV9ldmVudF9jYWNoZShcbiAgICAgICAgICAgICAgZ2FtZSxcbiAgICAgICAgICAgICAgY3J1eCxcbiAgICAgICAgICAgICAgMTAwMDAwLFxuICAgICAgICAgICAgICByZWNpZXZlX25ld19tZXNzYWdlcyxcbiAgICAgICAgICAgICAgY29uc29sZS5lcnJvcixcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICAqL1xuICAgICAgICB9XG4gICAgfVxuICAgIGNhY2hlZF9ldmVudHMgPSBpbmNvbWluZy5jb25jYXQoY2FjaGVkX2V2ZW50cyk7XG59XG5leHBvcnQgZnVuY3Rpb24gZ2V0X2NhY2hlZF9ldmVudHMoKSB7XG4gICAgcmV0dXJuIGNhY2hlZF9ldmVudHM7XG59XG4vL0hhbmRsZXIgdG8gcmVjaWV2ZSBuZXcgbWVzc2FnZXNcbmV4cG9ydCBmdW5jdGlvbiByZWNpZXZlX25ld19tZXNzYWdlcyhnYW1lLCBjcnV4KSB7XG4gICAgdmFyIHVuaXZlcnNlID0gZ2FtZS51bml2ZXJzZTtcbiAgICB2YXIgbnB1aSA9IGdhbWUubnB1aTtcbiAgICB2YXIgcGxheWVycyA9IGdldF9sZWRnZXIoZ2FtZSwgY3J1eCwgY2FjaGVkX2V2ZW50cyk7XG4gICAgdmFyIGxlZGdlclNjcmVlbiA9IG5wdWkubGVkZ2VyU2NyZWVuKCk7XG4gICAgbnB1aS5vbkhpZGVTY3JlZW4obnVsbCwgdHJ1ZSk7XG4gICAgbnB1aS5vbkhpZGVTZWxlY3Rpb25NZW51KCk7XG4gICAgbnB1aS50cmlnZ2VyKFwiaGlkZV9zaWRlX21lbnVcIik7XG4gICAgbnB1aS50cmlnZ2VyKFwicmVzZXRfZWRpdF9tb2RlXCIpO1xuICAgIG5wdWkuYWN0aXZlU2NyZWVuID0gbGVkZ2VyU2NyZWVuO1xuICAgIGxlZGdlclNjcmVlbi5yb29zdChucHVpLnNjcmVlbkNvbnRhaW5lcik7XG4gICAgbnB1aS5sYXlvdXRFbGVtZW50KGxlZGdlclNjcmVlbik7XG4gICAgcGxheWVycy5mb3JFYWNoKGZ1bmN0aW9uIChwKSB7XG4gICAgICAgIHZhciBwbGF5ZXIgPSBQbGF5ZXJOYW1lSWNvblJvd0xpbmsoY3J1eCwgbnB1aSwgdW5pdmVyc2UuZ2FsYXh5LnBsYXllcnNbcC51aWRdKS5yb29zdChucHVpLmFjdGl2ZVNjcmVlbik7XG4gICAgICAgIHBsYXllci5hZGRTdHlsZShcInBsYXllcl9jZWxsXCIpO1xuICAgICAgICB2YXIgcHJvbXB0ID0gcC5kZWJ0ID4gMCA/IFwiVGhleSBvd2VcIiA6IFwiWW91IG93ZVwiO1xuICAgICAgICBpZiAocC5kZWJ0ID09IDApIHtcbiAgICAgICAgICAgIHByb21wdCA9IFwiQmFsYW5jZVwiO1xuICAgICAgICB9XG4gICAgICAgIGlmIChwLmRlYnQgPCAwKSB7XG4gICAgICAgICAgICBjcnV4XG4gICAgICAgICAgICAgICAgLlRleHQoXCJcIiwgXCJwYWQxMiB0eHRfcmlnaHQgcmVkLXRleHRcIilcbiAgICAgICAgICAgICAgICAucmF3SFRNTChcIlwiLmNvbmNhdChwcm9tcHQsIFwiOiBcIikuY29uY2F0KHAuZGVidCkpXG4gICAgICAgICAgICAgICAgLmdyaWQoMjAsIDAsIDEwLCAzKVxuICAgICAgICAgICAgICAgIC5yb29zdChwbGF5ZXIpO1xuICAgICAgICAgICAgaWYgKHAuZGVidCAqIC0xIDw9IGdldF9oZXJvKHVuaXZlcnNlKS5jYXNoKSB7XG4gICAgICAgICAgICAgICAgY3J1eFxuICAgICAgICAgICAgICAgICAgICAuQnV0dG9uKFwiZm9yZ2l2ZVwiLCBcImZvcmdpdmVfZGVidFwiLCB7IHRhcmdldFBsYXllcjogcC51aWQgfSlcbiAgICAgICAgICAgICAgICAgICAgLmdyaWQoMTcsIDAsIDYsIDMpXG4gICAgICAgICAgICAgICAgICAgIC5yb29zdChwbGF5ZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHAuZGVidCA+IDApIHtcbiAgICAgICAgICAgIGNydXhcbiAgICAgICAgICAgICAgICAuVGV4dChcIlwiLCBcInBhZDEyIHR4dF9yaWdodCBibHVlLXRleHRcIilcbiAgICAgICAgICAgICAgICAucmF3SFRNTChcIlwiLmNvbmNhdChwcm9tcHQsIFwiOiBcIikuY29uY2F0KHAuZGVidCkpXG4gICAgICAgICAgICAgICAgLmdyaWQoMjAsIDAsIDEwLCAzKVxuICAgICAgICAgICAgICAgIC5yb29zdChwbGF5ZXIpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHAuZGVidCA9PSAwKSB7XG4gICAgICAgICAgICBjcnV4XG4gICAgICAgICAgICAgICAgLlRleHQoXCJcIiwgXCJwYWQxMiB0eHRfcmlnaHQgb3JhbmdlLXRleHRcIilcbiAgICAgICAgICAgICAgICAucmF3SFRNTChcIlwiLmNvbmNhdChwcm9tcHQsIFwiOiBcIikuY29uY2F0KHAuZGVidCkpXG4gICAgICAgICAgICAgICAgLmdyaWQoMjAsIDAsIDEwLCAzKVxuICAgICAgICAgICAgICAgIC5yb29zdChwbGF5ZXIpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5leHBvcnQgZGVmYXVsdCB7XG4gICAgdXBkYXRlX2V2ZW50X2NhY2hlOiB1cGRhdGVfZXZlbnRfY2FjaGUsXG4gICAgcmVjaWV2ZV9uZXdfbWVzc2FnZXM6IHJlY2lldmVfbmV3X21lc3NhZ2VzLFxufTtcbiIsIiIsImltcG9ydCB7IGdldF91bml2ZXJzZSB9IGZyb20gXCIuL3V0aWxpdGllcy9nZXRfZ2FtZV9zdGF0ZVwiO1xuZXhwb3J0IGZ1bmN0aW9uIGdldF9oZXJvKHVuaXZlcnNlKSB7XG4gICAgaWYgKHVuaXZlcnNlID09PSB2b2lkIDApIHsgdW5pdmVyc2UgPSBnZXRfdW5pdmVyc2UoKTsgfVxuICAgIHJldHVybiB1bml2ZXJzZS5wbGF5ZXI7XG59XG4iLCJleHBvcnQgdmFyIGxhc3RDbGlwID0gXCJFcnJvclwiO1xuZXhwb3J0IGZ1bmN0aW9uIGNsaXAodGV4dCkge1xuICAgIGxhc3RDbGlwID0gdGV4dDtcbn1cbiIsImltcG9ydCB7IGdldF9oZXJvIH0gZnJvbSBcIi4vZ2V0X2hlcm9cIjtcbmltcG9ydCAqIGFzIENhY2hlIGZyb20gXCIuL2V2ZW50X2NhY2hlXCI7XG4vL0dldCBsZWRnZXIgaW5mbyB0byBzZWUgd2hhdCBpcyBvd2VkXG4vL0FjdHVhbGx5IHNob3dzIHRoZSBwYW5lbCBvZiBsb2FkaW5nXG5leHBvcnQgZnVuY3Rpb24gZ2V0X2xlZGdlcihnYW1lLCBjcnV4LCBtZXNzYWdlcykge1xuICAgIHZhciBucHVpID0gZ2FtZS5ucHVpO1xuICAgIHZhciB1bml2ZXJzZSA9IGdhbWUudW5pdmVyc2U7XG4gICAgdmFyIHBsYXllcnMgPSB1bml2ZXJzZS5nYWxheHkucGxheWVycztcbiAgICB2YXIgbG9hZGluZyA9IGNydXhcbiAgICAgICAgLlRleHQoXCJcIiwgXCJyZWwgdHh0X2NlbnRlciBwYWQxMlwiKVxuICAgICAgICAucmF3SFRNTChcIlBhcnNpbmcgXCIuY29uY2F0KG1lc3NhZ2VzLmxlbmd0aCwgXCIgbWVzc2FnZXMuXCIpKTtcbiAgICBsb2FkaW5nLnJvb3N0KG5wdWkuYWN0aXZlU2NyZWVuKTtcbiAgICB2YXIgdWlkID0gZ2V0X2hlcm8odW5pdmVyc2UpLnVpZDtcbiAgICAvL0xlZGdlciBpcyBhIGxpc3Qgb2YgZGVidHNcbiAgICB2YXIgbGVkZ2VyID0ge307XG4gICAgbWVzc2FnZXNcbiAgICAgICAgLmZpbHRlcihmdW5jdGlvbiAobSkge1xuICAgICAgICByZXR1cm4gbS5wYXlsb2FkLnRlbXBsYXRlID09IFwibW9uZXlfc2VudFwiIHx8XG4gICAgICAgICAgICBtLnBheWxvYWQudGVtcGxhdGUgPT0gXCJzaGFyZWRfdGVjaG5vbG9neVwiO1xuICAgIH0pXG4gICAgICAgIC5tYXAoZnVuY3Rpb24gKG0pIHsgcmV0dXJuIG0ucGF5bG9hZDsgfSlcbiAgICAgICAgLmZvckVhY2goZnVuY3Rpb24gKG0pIHtcbiAgICAgICAgdmFyIGxpYWlzb24gPSBtLmZyb21fcHVpZCA9PSB1aWQgPyBtLnRvX3B1aWQgOiBtLmZyb21fcHVpZDtcbiAgICAgICAgdmFyIHZhbHVlID0gbS50ZW1wbGF0ZSA9PSBcIm1vbmV5X3NlbnRcIiA/IG0uYW1vdW50IDogbS5wcmljZTtcbiAgICAgICAgdmFsdWUgKj0gbS5mcm9tX3B1aWQgPT0gdWlkID8gMSA6IC0xOyAvLyBhbW91bnQgaXMgKCspIGlmIGNyZWRpdCAmICgtKSBpZiBkZWJ0XG4gICAgICAgIGxpYWlzb24gaW4gbGVkZ2VyXG4gICAgICAgICAgICA/IChsZWRnZXJbbGlhaXNvbl0gKz0gdmFsdWUpXG4gICAgICAgICAgICA6IChsZWRnZXJbbGlhaXNvbl0gPSB2YWx1ZSk7XG4gICAgfSk7XG4gICAgLy9UT0RPOiBSZXZpZXcgdGhhdCB0aGlzIGlzIGNvcnJlY3RseSBmaW5kaW5nIGEgbGlzdCBvZiBvbmx5IHBlb3BsZSB3aG8gaGF2ZSBkZWJ0cy5cbiAgICAvL0FjY291bnRzIGFyZSB0aGUgY3JlZGl0IG9yIGRlYml0IHJlbGF0ZWQgdG8gZWFjaCB1c2VyXG4gICAgdmFyIGFjY291bnRzID0gW107XG4gICAgZm9yICh2YXIgdWlkXzEgaW4gbGVkZ2VyKSB7XG4gICAgICAgIHZhciBwbGF5ZXIgPSBwbGF5ZXJzW3BhcnNlSW50KHVpZF8xKV07XG4gICAgICAgIHBsYXllci5kZWJ0ID0gbGVkZ2VyW3VpZF8xXTtcbiAgICAgICAgYWNjb3VudHMucHVzaChwbGF5ZXIpO1xuICAgIH1cbiAgICBnZXRfaGVybyh1bml2ZXJzZSkubGVkZ2VyID0gbGVkZ2VyO1xuICAgIGNvbnNvbGUubG9nKGFjY291bnRzKTtcbiAgICByZXR1cm4gYWNjb3VudHM7XG59XG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyTGVkZ2VyKGdhbWUsIGNydXgsIE1vdXNlVHJhcCkge1xuICAgIC8vRGVjb25zdHJ1Y3Rpb24gb2YgZGlmZmVyZW50IGNvbXBvbmVudHMgb2YgdGhlIGdhbWUuXG4gICAgdmFyIGNvbmZpZyA9IGdhbWUuY29uZmlnO1xuICAgIHZhciBucCA9IGdhbWUubnA7XG4gICAgdmFyIG5wdWkgPSBnYW1lLm5wdWk7XG4gICAgdmFyIHVuaXZlcnNlID0gZ2FtZS51bml2ZXJzZTtcbiAgICB2YXIgdGVtcGxhdGVzID0gZ2FtZS50ZW1wbGF0ZXM7XG4gICAgdmFyIHBsYXllcnMgPSB1bml2ZXJzZS5nYWxheHkucGxheWVycztcbiAgICBNb3VzZVRyYXAuYmluZChbXCJtXCIsIFwiTVwiXSwgZnVuY3Rpb24gKCkge1xuICAgICAgICBucC50cmlnZ2VyKFwidHJpZ2dlcl9sZWRnZXJcIik7XG4gICAgfSk7XG4gICAgdGVtcGxhdGVzW1wibGVkZ2VyXCJdID0gXCJMZWRnZXJcIjtcbiAgICB0ZW1wbGF0ZXNbXCJ0ZWNoX3RyYWRpbmdcIl0gPSBcIlRyYWRpbmcgVGVjaG5vbG9neVwiO1xuICAgIHRlbXBsYXRlc1tcImZvcmdpdmVcIl0gPSBcIlBheSBEZWJ0XCI7XG4gICAgdGVtcGxhdGVzW1wiZm9yZ2l2ZV9kZWJ0XCJdID0gXCJBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gZm9yZ2l2ZSB0aGlzIGRlYnQ/XCI7XG4gICAgaWYgKCFucHVpLmhhc21lbnVpdGVtKSB7XG4gICAgICAgIG5wdWlcbiAgICAgICAgICAgIC5TaWRlTWVudUl0ZW0oXCJpY29uLWRhdGFiYXNlXCIsIFwibGVkZ2VyXCIsIFwidHJpZ2dlcl9sZWRnZXJcIilcbiAgICAgICAgICAgIC5yb29zdChucHVpLnNpZGVNZW51KTtcbiAgICAgICAgbnB1aS5oYXNtZW51aXRlbSA9IHRydWU7XG4gICAgfVxuICAgIG5wdWkubGVkZ2VyU2NyZWVuID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gbnB1aS5TY3JlZW4oXCJsZWRnZXJcIik7XG4gICAgfTtcbiAgICBucC5vbihcInRyaWdnZXJfbGVkZ2VyXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGxlZGdlclNjcmVlbiA9IG5wdWkubGVkZ2VyU2NyZWVuKCk7XG4gICAgICAgIHZhciBsb2FkaW5nID0gY3J1eFxuICAgICAgICAgICAgLlRleHQoXCJcIiwgXCJyZWwgdHh0X2NlbnRlciBwYWQxMiBzZWN0aW9uX3RpdGxlXCIpXG4gICAgICAgICAgICAucmF3SFRNTChcIlRhYnVsYXRpbmcgTGVkZ2VyLi4uXCIpO1xuICAgICAgICBsb2FkaW5nLnJvb3N0KGxlZGdlclNjcmVlbik7XG4gICAgICAgIG5wdWkub25IaWRlU2NyZWVuKG51bGwsIHRydWUpO1xuICAgICAgICBucHVpLm9uSGlkZVNlbGVjdGlvbk1lbnUoKTtcbiAgICAgICAgbnB1aS50cmlnZ2VyKFwiaGlkZV9zaWRlX21lbnVcIik7XG4gICAgICAgIG5wdWkudHJpZ2dlcihcInJlc2V0X2VkaXRfbW9kZVwiKTtcbiAgICAgICAgbnB1aS5hY3RpdmVTY3JlZW4gPSBsZWRnZXJTY3JlZW47XG4gICAgICAgIGxlZGdlclNjcmVlbi5yb29zdChucHVpLnNjcmVlbkNvbnRhaW5lcik7XG4gICAgICAgIG5wdWkubGF5b3V0RWxlbWVudChsZWRnZXJTY3JlZW4pO1xuICAgICAgICBDYWNoZS51cGRhdGVfZXZlbnRfY2FjaGUoZ2FtZSwgY3J1eCwgNCwgQ2FjaGUucmVjaWV2ZV9uZXdfbWVzc2FnZXMsIGNvbnNvbGUuZXJyb3IpO1xuICAgIH0pO1xuICAgIC8vV2h5IG5vdCBucC5vbihcIkZvcmdpdmVEZWJ0XCIpP1xuICAgIG5wLm9uRm9yZ2l2ZURlYnQgPSBmdW5jdGlvbiAoZXZlbnQsIGRhdGEpIHtcbiAgICAgICAgdmFyIHRhcmdldFBsYXllciA9IGRhdGEudGFyZ2V0UGxheWVyO1xuICAgICAgICB2YXIgcGxheWVyID0gcGxheWVyc1t0YXJnZXRQbGF5ZXJdO1xuICAgICAgICB2YXIgYW1vdW50ID0gcGxheWVyLmRlYnQgKiAtMTtcbiAgICAgICAgLy9sZXQgYW1vdW50ID0gMVxuICAgICAgICB1bml2ZXJzZS5wbGF5ZXIubGVkZ2VyW3RhcmdldFBsYXllcl0gPSAwO1xuICAgICAgICBucC50cmlnZ2VyKFwic2hvd19zY3JlZW5cIiwgW1xuICAgICAgICAgICAgXCJjb25maXJtXCIsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZTogXCJmb3JnaXZlX2RlYnRcIixcbiAgICAgICAgICAgICAgICBldmVudEtpbmQ6IFwiY29uZmlybV9mb3JnaXZlX2RlYnRcIixcbiAgICAgICAgICAgICAgICBldmVudERhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJvcmRlclwiLFxuICAgICAgICAgICAgICAgICAgICBvcmRlcjogXCJzZW5kX21vbmV5LFwiLmNvbmNhdCh0YXJnZXRQbGF5ZXIsIFwiLFwiKS5jb25jYXQoYW1vdW50KSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgXSk7XG4gICAgfTtcbiAgICBucC5vbihcImNvbmZpcm1fZm9yZ2l2ZV9kZWJ0XCIsIGZ1bmN0aW9uIChldmVudCwgZGF0YSkge1xuICAgICAgICBucC50cmlnZ2VyKFwic2VydmVyX3JlcXVlc3RcIiwgZGF0YSk7XG4gICAgICAgIG5wLnRyaWdnZXIoXCJ0cmlnZ2VyX2xlZGdlclwiKTtcbiAgICB9KTtcbiAgICBucC5vbihcImZvcmdpdmVfZGVidFwiLCBucC5vbkZvcmdpdmVEZWJ0KTtcbn1cbiIsImltcG9ydCB7IGdldF9nYW1lX251bWJlciB9IGZyb20gXCIuL2dldF9nYW1lX3N0YXRlXCI7XG5leHBvcnQgZnVuY3Rpb24gZ2V0X2FwaV9kYXRhKGFwaWtleSkge1xuICAgIHZhciBnYW1lX251bWJlciA9IGdldF9nYW1lX251bWJlcigpO1xuICAgIHJldHVybiBmZXRjaChcImh0dHBzOi8vbnAuaXJvbmhlbG1ldC5jb20vYXBpXCIsIHtcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgYWNjZXB0OiBcImFwcGxpY2F0aW9uL2pzb24sIHRleHQvamF2YXNjcmlwdCwgKi8qOyBxPTAuMDFcIixcbiAgICAgICAgICAgIFwiYWNjZXB0LWxhbmd1YWdlXCI6IFwiZW4tVVMsZW47cT0wLjlcIixcbiAgICAgICAgICAgIFwiY29udGVudC10eXBlXCI6IFwiYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkOyBjaGFyc2V0PVVURi04XCIsXG4gICAgICAgICAgICBcIngtcmVxdWVzdGVkLXdpdGhcIjogXCJYTUxIdHRwUmVxdWVzdFwiLFxuICAgICAgICB9LFxuICAgICAgICByZWZlcnJlcjogXCJodHRwczovL25wLmlyb25oZWxtZXQuY29tL2dhbWUvXCIuY29uY2F0KGdhbWVfbnVtYmVyKSxcbiAgICAgICAgcmVmZXJyZXJQb2xpY3k6IFwic3RyaWN0LW9yaWdpbi13aGVuLWNyb3NzLW9yaWdpblwiLFxuICAgICAgICBib2R5OiBcImdhbWVfbnVtYmVyPVwiLmNvbmNhdChnYW1lX251bWJlciwgXCImYXBpX3ZlcnNpb249MC4xJmNvZGU9XCIpLmNvbmNhdChhcGlrZXkpLFxuICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgICBtb2RlOiBcImNvcnNcIixcbiAgICAgICAgY3JlZGVudGlhbHM6IFwiaW5jbHVkZVwiLFxuICAgIH0pLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7IHJldHVybiByZXNwb25zZS5qc29uKCk7IH0pO1xufVxuIiwiZXhwb3J0IGZ1bmN0aW9uIGdldF92aXNpYmxlX3N0YXJzKCkge1xuICAgIHZhciBzdGFycyA9IGdldF9hbGxfc3RhcnMoKTtcbiAgICBpZiAoc3RhcnMgPT09IHVuZGVmaW5lZClcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB2YXIgdmlzaWJsZV9zdGFycyA9IFtdO1xuICAgIGZvciAodmFyIF9pID0gMCwgX2EgPSBPYmplY3QuZW50cmllcyhzdGFycyk7IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgIHZhciBfYiA9IF9hW19pXSwgaW5kZXggPSBfYlswXSwgc3RhciA9IF9iWzFdO1xuICAgICAgICBpZiAoc3Rhci52ID09PSBcIjFcIikge1xuICAgICAgICAgICAgLy9TdGFyIGlzIHZpc2libGVcbiAgICAgICAgICAgIHZpc2libGVfc3RhcnMucHVzaChzdGFyKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdmlzaWJsZV9zdGFycztcbn1cbmV4cG9ydCBmdW5jdGlvbiBnZXRfZ2FtZV9udW1iZXIoKSB7XG4gICAgaWYgKE5lcHR1bmVzUHJpZGUgPT09IHVuZGVmaW5lZClcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICByZXR1cm4gTmVwdHVuZXNQcmlkZS5nYW1lTnVtYmVyO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGdldF9hbGxfc3RhcnMoKSB7XG4gICAgaWYgKE5lcHR1bmVzUHJpZGUgPT09IHVuZGVmaW5lZClcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICByZXR1cm4gTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5nYWxheHkuc3RhcnM7XG59XG5leHBvcnQgZnVuY3Rpb24gZ2V0X2ZsZWV0cygpIHtcbiAgICBpZiAoTmVwdHVuZXNQcmlkZSA9PT0gdW5kZWZpbmVkKVxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIHJldHVybiBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlLmdhbGF4eS5mbGVldHM7XG59XG5leHBvcnQgZnVuY3Rpb24gZ2V0X2dhbGF4eSgpIHtcbiAgICBpZiAoTmVwdHVuZXNQcmlkZSA9PT0gdW5kZWZpbmVkKVxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIHJldHVybiBnZXRfdW5pdmVyc2UoKS5nYWxheHk7XG59XG5leHBvcnQgZnVuY3Rpb24gZ2V0X3VuaXZlcnNlKCkge1xuICAgIGlmIChOZXB0dW5lc1ByaWRlID09PSB1bmRlZmluZWQpXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgcmV0dXJuIE5lcHR1bmVzUHJpZGUudW5pdmVyc2U7XG59XG5leHBvcnQgZnVuY3Rpb24gZ2V0X25lcHR1bmVzX3ByaWRlKCkge1xuICAgIGlmIChOZXB0dW5lc1ByaWRlID09PSB1bmRlZmluZWQpXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgcmV0dXJuIE5lcHR1bmVzUHJpZGUubnA7XG59XG5leHBvcnQgZnVuY3Rpb24gZ2V0X2dhbWVfc3RhdGUoKSB7XG4gICAgaWYgKE5lcHR1bmVzUHJpZGUgPT09IHVuZGVmaW5lZClcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICByZXR1cm4gTmVwdHVuZXNQcmlkZTtcbn1cbiIsImV4cG9ydCB2YXIgYnV5QXBlR2lmdFNjcmVlbiA9IGZ1bmN0aW9uIChDcnV4LCB1bml2ZXJzZSwgbnB1aSkge1xuICAgIGNvbnNvbGUubG9nKFwiT3ZlcmxvYWRkZWQgR2lmdCBTY3JlZW5cIik7XG4gICAgdmFyIGJ1eSA9IG5wdWkuU2NyZWVuKFwiZ2lmdF9oZWFkaW5nXCIpLnNpemUoNDgwKTtcbiAgICBDcnV4LlRleHQoXCJnaWZ0X2ludHJvXCIsIFwicmVsIHBhZDEyIGNvbF9hY2NlbnQgdHh0X2NlbnRlclwiKVxuICAgICAgICAuZm9ybWF0KHtcbiAgICAgICAgcGxheWVyOiB1bml2ZXJzZS5zZWxlY3RlZFBsYXllci5jb2xvdXJCb3ggK1xuICAgICAgICAgICAgdW5pdmVyc2Uuc2VsZWN0ZWRQbGF5ZXIuaHlwZXJsaW5rZWRBbGlhcyxcbiAgICB9KVxuICAgICAgICAuc2l6ZSg0ODApXG4gICAgICAgIC5yb29zdChidXkpO1xuICAgIG5wdWkuR2FsYWN0aWNDcmVkaXRCYWxhbmNlKCkucm9vc3QoYnV5KTtcbiAgICB2YXIgaTtcbiAgICB2YXIgaXRlbXMgPSBbXG4gICAgICAgIHsgaWNvbjogXCJ0cmVrXCIsIGFtb3VudDogMSB9LFxuICAgICAgICB7IGljb246IFwicmViZWxcIiwgYW1vdW50OiAxIH0sXG4gICAgICAgIHsgaWNvbjogXCJlbXBpcmVcIiwgYW1vdW50OiAxIH0sXG4gICAgICAgIHsgaWNvbjogXCJ0b3hpY1wiLCBhbW91bnQ6IDEgfSxcbiAgICAgICAgeyBpY29uOiBcIndvbGZcIiwgYW1vdW50OiA1IH0sXG4gICAgICAgIHsgaWNvbjogXCJ3aXphcmRcIiwgYW1vdW50OiAxIH0sXG4gICAgICAgIHsgaWNvbjogXCJwaXJhdGVcIiwgYW1vdW50OiA1IH0sXG4gICAgICAgIHsgaWNvbjogXCJ3b3Jkc21pdGhcIiwgYW1vdW50OiAyIH0sXG4gICAgICAgIHsgaWNvbjogXCJsdWNreVwiLCBhbW91bnQ6IDIgfSxcbiAgICAgICAgeyBpY29uOiBcImFwZVwiLCBhbW91bnQ6IDk5OSB9LFxuICAgICAgICB7IGljb246IFwiaXJvbmJvcm5cIiwgYW1vdW50OiAyIH0sXG4gICAgICAgIHsgaWNvbjogXCJzdHJhbmdlXCIsIGFtb3VudDogMiB9LFxuICAgICAgICB7IGljb246IFwiY2hlZXN5XCIsIGFtb3VudDogMSB9LFxuICAgICAgICB7IGljb246IFwic3RyYXRlZ2ljXCIsIGFtb3VudDogMSB9LFxuICAgICAgICB7IGljb246IFwiYmFkYXNzXCIsIGFtb3VudDogMSB9LFxuICAgICAgICB7IGljb246IFwibGlvbmhlYXJ0XCIsIGFtb3VudDogMSB9LFxuICAgICAgICB7IGljb246IFwiZ3VuXCIsIGFtb3VudDogMSB9LFxuICAgICAgICB7IGljb246IFwiY29tbWFuZFwiLCBhbW91bnQ6IDEgfSxcbiAgICAgICAgeyBpY29uOiBcInNjaWVuY2VcIiwgYW1vdW50OiAxIH0sXG4gICAgICAgIHsgaWNvbjogXCJuZXJkXCIsIGFtb3VudDogMSB9LFxuICAgICAgICB7IGljb246IFwibWVyaXRcIiwgYW1vdW50OiAxIH0sXG4gICAgICAgIHsgaWNvbjogXCJob25vdXJcIiwgYW1vdW50OiAxIH0sXG4gICAgICAgIHsgaWNvbjogXCJsaWZldGltZVwiLCBhbW91bnQ6IDEgfSxcbiAgICAgICAgeyBpY29uOiBcInRvdXJuZXlfd2luXCIsIGFtb3VudDogMSB9LFxuICAgICAgICB7IGljb246IFwidG91cm5leV9qb2luXCIsIGFtb3VudDogMSB9LFxuICAgICAgICB7IGljb246IFwidG91cm5leV9qb2luXCIsIGFtb3VudDogMSB9LFxuICAgICAgICB7IGljb246IFwidG91cm5leV9qb2luXCIsIGFtb3VudDogMSB9LFxuICAgICAgICB7IGljb246IFwiYnVsbHNleWVcIiwgYW1vdW50OiAxIH0sXG4gICAgICAgIHsgaWNvbjogXCJwcm90ZXVzXCIsIGFtb3VudDogMSB9LFxuICAgICAgICB7IGljb246IFwiZmxhbWJlYXVcIiwgYW1vdW50OiAxIH0sXG4gICAgICAgIHsgaWNvbjogXCJyYXRcIiwgYW1vdW50OiAxIH0sXG4gICAgXTtcbiAgICBmb3IgKGkgPSBpdGVtcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICBpdGVtc1tpXS5wdWlkID0gdW5pdmVyc2Uuc2VsZWN0ZWRQbGF5ZXIudWlkO1xuICAgICAgICBucHVpLkdpZnRJdGVtKGl0ZW1zW2ldKS5yb29zdChidXkpO1xuICAgIH1cbiAgICByZXR1cm4gYnV5O1xufTtcbmV4cG9ydCB2YXIgQXBlR2lmdEl0ZW0gPSBmdW5jdGlvbiAoQ3J1eCwgdXJsLCBpdGVtKSB7XG4gICAgdmFyIGdpID0gQ3J1eC5XaWRnZXQoXCJyZWxcIikuc2l6ZSg0ODApO1xuICAgIENydXguV2lkZ2V0KFwicmVsIGNvbF9iYXNlXCIpLnNpemUoNDgwLCAxNikucm9vc3QoZ2kpO1xuICAgIHZhciBpbWFnZV91cmwgPSBcIi4uL2ltYWdlcy9iYWRnZXMvXCIuY29uY2F0KGl0ZW0uaWNvbiwgXCIucG5nXCIpO1xuICAgIGlmIChpdGVtLmljb24gPT0gXCJhcGVcIikge1xuICAgICAgICBpbWFnZV91cmwgPSBcIlwiLmNvbmNhdCh1cmwpLmNvbmNhdChpdGVtLmljb24sIFwiLnBuZ1wiKTtcbiAgICB9XG4gICAgZ2kuaWNvbiA9IENydXguSW1hZ2UoaW1hZ2VfdXJsLCBcImFic1wiKS5ncmlkKDAuMjUsIDEsIDYsIDYpLnJvb3N0KGdpKTtcbiAgICBnaS5ib2R5ID0gQ3J1eC5UZXh0KFwiZ2lmdF9kZXNjX1wiLmNvbmNhdChpdGVtLmljb24pLCBcInJlbCB0eHRfc2VsZWN0YWJsZVwiKVxuICAgICAgICAuc2l6ZSgzODQgLSAyNClcbiAgICAgICAgLnBvcyg5NiArIDEyKVxuICAgICAgICAucm9vc3QoZ2kpO1xuICAgIGdpLmJ1eU5vd0JnID0gQ3J1eC5XaWRnZXQoXCJyZWxcIikuc2l6ZSg0ODAsIDUyKS5yb29zdChnaSk7XG4gICAgZ2kuYnV5Tm93QnV0dG9uID0gQ3J1eC5CdXR0b24oXCJidXlfbm93XCIsIFwiYnV5X2dpZnRcIiwgaXRlbSlcbiAgICAgICAgLmdyaWQoMjAsIDAsIDEwLCAzKVxuICAgICAgICAucm9vc3QoZ2kuYnV5Tm93QmcpO1xuICAgIGlmIChpdGVtLmFtb3VudCA+IE5lcHR1bmVzUHJpZGUuYWNjb3VudC5jcmVkaXRzKSB7XG4gICAgICAgIGdpLmJ1eU5vd0J1dHRvbi5kaXNhYmxlKCk7XG4gICAgfVxuICAgIENydXguV2lkZ2V0KFwicmVsIGNvbF9hY2NlbnRcIikuc2l6ZSg0ODAsIDQpLnJvb3N0KGdpKTtcbiAgICByZXR1cm4gZ2k7XG59O1xuIiwiZXhwb3J0IGZ1bmN0aW9uIGRyYXdPdmVybGF5U3RyaW5nKGNvbnRleHQsIHRleHQsIHgsIHksIGZnQ29sb3IpIHtcbiAgICBjb250ZXh0LmZpbGxTdHlsZSA9IFwiIzAwMDAwMFwiO1xuICAgIGZvciAodmFyIHNtZWFyID0gMTsgc21lYXIgPCA0OyArK3NtZWFyKSB7XG4gICAgICAgIGNvbnRleHQuZmlsbFRleHQodGV4dCwgeCArIHNtZWFyLCB5ICsgc21lYXIpO1xuICAgICAgICBjb250ZXh0LmZpbGxUZXh0KHRleHQsIHggLSBzbWVhciwgeSArIHNtZWFyKTtcbiAgICAgICAgY29udGV4dC5maWxsVGV4dCh0ZXh0LCB4IC0gc21lYXIsIHkgLSBzbWVhcik7XG4gICAgICAgIGNvbnRleHQuZmlsbFRleHQodGV4dCwgeCArIHNtZWFyLCB5IC0gc21lYXIpO1xuICAgIH1cbiAgICBjb250ZXh0LmZpbGxTdHlsZSA9IGZnQ29sb3IgfHwgXCIjMDBmZjAwXCI7XG4gICAgY29udGV4dC5maWxsVGV4dCh0ZXh0LCB4LCB5KTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBhbnlTdGFyQ2FuU2VlKHVuaXZlcnNlLCBvd25lciwgZmxlZXQpIHtcbiAgICB2YXIgc3RhcnMgPSB1bml2ZXJzZS5nYWxheHkuc3RhcnM7XG4gICAgdmFyIHNjYW5SYW5nZSA9IHVuaXZlcnNlLmdhbGF4eS5wbGF5ZXJzW293bmVyXS50ZWNoLnNjYW5uaW5nLnZhbHVlO1xuICAgIGZvciAodmFyIHMgaW4gc3RhcnMpIHtcbiAgICAgICAgdmFyIHN0YXIgPSBzdGFyc1tzXTtcbiAgICAgICAgaWYgKHN0YXIucHVpZCA9PSBvd25lcikge1xuICAgICAgICAgICAgdmFyIGRpc3RhbmNlID0gdW5pdmVyc2UuZGlzdGFuY2Uoc3Rhci54LCBzdGFyLnksIHBhcnNlRmxvYXQoZmxlZXQueCksIHBhcnNlRmxvYXQoZmxlZXQueSkpO1xuICAgICAgICAgICAgaWYgKGRpc3RhbmNlIDw9IHNjYW5SYW5nZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn1cbiIsImltcG9ydCB7IGdldF9nYWxheHksIH0gZnJvbSBcIi4vZ2V0X2dhbWVfc3RhdGVcIjtcbmltcG9ydCB7IGdldF9hcGlfZGF0YSB9IGZyb20gXCIuL2FwaVwiO1xudmFyIG9yaWdpbmFsUGxheWVyID0gdW5kZWZpbmVkO1xuLy9UaGlzIHNhdmVzIHRoZSBhY3R1YWwgY2xpZW50J3MgcGxheWVyLlxuZnVuY3Rpb24gc2V0X29yaWdpbmFsX3BsYXllcigpIHtcbiAgICBpZiAob3JpZ2luYWxQbGF5ZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBvcmlnaW5hbFBsYXllciA9IE5lcHR1bmVzUHJpZGUub3JpZ2luYWxQbGF5ZXI7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59XG5mdW5jdGlvbiB2YWxpZF9hcGlrZXkoYXBpa2V5KSB7XG4gICAgcmV0dXJuIHRydWU7XG59XG5mdW5jdGlvbiBiYWRfa2V5KGVycikge1xuICAgIGNvbnNvbGUubG9nKFwiVGhlIGtleSBpcyBiYWQgYW5kIG1lcmdpbmcgRkFJTEVEIVwiKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBtZXJnZVVzZXIoZXZlbnQsIGRhdGEpIHtcbiAgICBzZXRfb3JpZ2luYWxfcGxheWVyKCk7XG4gICAgLy9FeHRyYWN0IHRoYXQgS0VZXG4gICAgLy9UT0RPOiBBZGQgcmVnZXggdG8gZ2V0IFRIQVQgS0VZXG4gICAgdmFyIGFwaWtleSA9IGRhdGEgPT09IG51bGwgfHwgZGF0YSA9PT0gdm9pZCAwID8gdm9pZCAwIDogZGF0YS5zcGxpdChcIjpcIilbMV07XG4gICAgY29uc29sZS5sb2coYXBpa2V5KTtcbiAgICBpZiAodmFsaWRfYXBpa2V5KGFwaWtleSkpIHtcbiAgICAgICAgZ2V0X2FwaV9kYXRhKGFwaWtleSlcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICByZXR1cm4gXCJlcnJvclwiIGluIGRhdGFcbiAgICAgICAgICAgICAgICA/IGJhZF9rZXkoZGF0YSlcbiAgICAgICAgICAgICAgICA6IG1lcmdlVXNlckRhdGEoZGF0YS5zY2FubmluZ19kYXRhKTtcbiAgICAgICAgfSlcbiAgICAgICAgICAgIC5jYXRjaChjb25zb2xlLmxvZyk7XG4gICAgfVxufVxuLy9Db21iaW5lIGRhdGEgZnJvbSBhbm90aGVyIHVzZXJcbi8vQ2FsbGJhY2sgb24gQVBJIC4uXG4vL21lY2hhbmljIGNsb3NlcyBhdCA1cG1cbi8vVGhpcyB3b3JrcyBidXQgbm93IGFkZCBpdCBzbyBpdCBkb2VzIG5vdCBvdmVydGFrZSB5b3VyIHN0YXJzLlxuZXhwb3J0IGZ1bmN0aW9uIG1lcmdlVXNlckRhdGEoc2Nhbm5pbmdEYXRhKSB7XG4gICAgY29uc29sZS5sb2coXCJTQVQgTWVyZ2luZ1wiKTtcbiAgICB2YXIgZ2FsYXh5ID0gZ2V0X2dhbGF4eSgpO1xuICAgIHZhciBzdGFycyA9IHNjYW5uaW5nRGF0YS5zdGFycztcbiAgICB2YXIgZmxlZXRzID0gc2Nhbm5pbmdEYXRhLmZsZWV0cztcbiAgICAvLyBVcGRhdGUgc3RhcnNcbiAgICBmb3IgKHZhciBzdGFySWQgaW4gc3RhcnMpIHtcbiAgICAgICAgdmFyIHN0YXIgPSBzdGFyc1tzdGFySWRdO1xuICAgICAgICBpZiAoZ2FsYXh5LnN0YXJzW3N0YXJJZF0gPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBnYWxheHkuc3RhcnNbc3RhcklkXSA9IHN0YXI7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc29sZS5sb2coXCJTeW5jaW5nXCIpO1xuICAgIC8vIEFkZCBmbGVldHNcbiAgICBmb3IgKHZhciBmbGVldElkIGluIGZsZWV0cykge1xuICAgICAgICB2YXIgZmxlZXQgPSBmbGVldHNbZmxlZXRJZF07XG4gICAgICAgIGlmIChnYWxheHkuZmxlZXRzW2ZsZWV0SWRdID09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgZ2FsYXh5LmZsZWV0c1tmbGVldElkXSA9IGZsZWV0O1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vb25GdWxsVW5pdmVyc2UgU2VlbXMgdG8gYWRkaXRpb25hbGx5IGxvYWQgYWxsIHRoZSBwbGF5ZXJzLlxuICAgIE5lcHR1bmVzUHJpZGUubnAub25GdWxsVW5pdmVyc2UobnVsbCwgZ2FsYXh5KTtcbiAgICAvL05lcHR1bmVzUHJpZGUubnB1aS5vbkhpZGVTY3JlZW4obnVsbCwgdHJ1ZSk7XG59XG4iLCJpbXBvcnQgeyBnZXRfY2FjaGVkX2V2ZW50cywgdXBkYXRlX2V2ZW50X2NhY2hlLCB9IGZyb20gXCIuLi9ldmVudF9jYWNoZVwiO1xuZXhwb3J0IGZ1bmN0aW9uIGdldF9ucGNfdGljayhnYW1lLCBjcnV4KSB7XG4gICAgdmFyIGFpID0gZ2FtZS51bml2ZXJzZS5zZWxlY3RlZFBsYXllcjtcbiAgICB2YXIgY2FjaGUgPSBnZXRfY2FjaGVkX2V2ZW50cygpO1xuICAgIHZhciBldmVudHMgPSBjYWNoZS5tYXAoZnVuY3Rpb24gKGUpIHsgcmV0dXJuIGUucGF5bG9hZDsgfSk7XG4gICAgdmFyIGdvb2RieWVzID0gZXZlbnRzLmZpbHRlcihmdW5jdGlvbiAoZSkge1xuICAgICAgICByZXR1cm4gZS50ZW1wbGF0ZS5pbmNsdWRlcyhcImdvb2RieWVfdG9fcGxheWVyXCIpO1xuICAgIH0pO1xuICAgIHZhciB0aWNrID0gZ29vZGJ5ZXMuZmlsdGVyKGZ1bmN0aW9uIChlKSB7IHJldHVybiBlLnVpZCA9PSBhaS51aWQ7IH0pWzBdLnRpY2s7XG4gICAgY29uc29sZS5sb2codGljayk7XG4gICAgcmV0dXJuIHRpY2s7XG59XG5leHBvcnQgZnVuY3Rpb24gYWRkX25wY190aWNrX2NvdW50ZXIoZ2FtZSwgY3J1eCkge1xuICAgIHZhciB0aWNrID0gZ2V0X25wY190aWNrKGdhbWUsIGNydXgpO1xuICAgIHZhciB0aXRsZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjY29udGVudEFyZWEgPiBkaXYgPiBkaXYud2lkZ2V0LmZ1bGxzY3JlZW4gPiBkaXY6bnRoLWNoaWxkKDMpID4gZGl2ID4gZGl2Om50aC1jaGlsZCg1KSA+IGRpdi53aWRnZXQuc2VjdGlvbl90aXRsZS5jb2xfYmxhY2tcIik7XG4gICAgdmFyIHN1YnRpdGxlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNjb250ZW50QXJlYSA+IGRpdiA+IGRpdi53aWRnZXQuZnVsbHNjcmVlbiA+IGRpdjpudGgtY2hpbGQoMykgPiBkaXYgPiBkaXY6bnRoLWNoaWxkKDUpID4gZGl2LndpZGdldC50eHRfcmlnaHQucGFkMTJcIik7XG4gICAgdmFyIGN1cnJlbnRfdGljayA9IGdhbWUudW5pdmVyc2UuZ2FsYXh5LnRpY2s7XG4gICAgdmFyIG5leHRfbW92ZSA9IChjdXJyZW50X3RpY2sgLSB0aWNrKSAlIDQ7XG4gICAgdmFyIGxhc3RfbW92ZSA9IDQgLSBuZXh0X21vdmU7XG4gICAgLy9sZXQgbGFzdF9tb3ZlID0gY3VycmVudF90aWNrLW5leHRfbW92ZVxuICAgIHZhciBwb3N0Zml4XzEgPSBcIlwiO1xuICAgIHZhciBwb3N0Zml4XzIgPSBcIlwiO1xuICAgIGlmIChuZXh0X21vdmUgIT0gMSkge1xuICAgICAgICBwb3N0Zml4XzEgKz0gXCJzXCI7XG4gICAgfVxuICAgIGlmIChsYXN0X21vdmUgIT0gMSkge1xuICAgICAgICBwb3N0Zml4XzIgKz0gXCJzXCI7XG4gICAgfVxuICAgIGlmIChuZXh0X21vdmUgPT0gMCkge1xuICAgICAgICBuZXh0X21vdmUgPSA0O1xuICAgICAgICB0aXRsZS5pbm5lclRleHQgPSBcIkFJIG1vdmVzIGluIFwiLmNvbmNhdChuZXh0X21vdmUsIFwiIHRpY2tcIikuY29uY2F0KHBvc3RmaXhfMSk7XG4gICAgICAgIHN1YnRpdGxlLmlubmVyVGV4dCA9IFwiQUkgbW92ZWQgdGhpcyB0aWNrXCI7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB0aXRsZS5pbm5lclRleHQgPSBcIkFJIG1vdmVzIGluIFwiLmNvbmNhdChuZXh0X21vdmUsIFwiIHRpY2tcIikuY29uY2F0KHBvc3RmaXhfMSk7XG4gICAgICAgIHN1YnRpdGxlLmlubmVyVGV4dCA9IFwiQUkgbGFzdCBtb3ZlZCBcIi5jb25jYXQobGFzdF9tb3ZlLCBcIiB0aWNrXCIpLmNvbmNhdChwb3N0Zml4XzIsIFwiIGFnb1wiKTtcbiAgICAgICAgLy9zdWJ0aXRsZS5pbm5lclRleHQgPSBgQUkgbGFzdCBtb3ZlZCBvbiB0aWNrICR7bGFzdF9tb3ZlfWBcbiAgICB9XG59XG5leHBvcnQgZnVuY3Rpb24gaG9va19ucGNfdGlja19jb3VudGVyKGdhbWUsIGNydXgpIHtcbiAgICB2YXIgc2VsZWN0ZWRQbGF5ZXIgPSBnYW1lLnVuaXZlcnNlLnNlbGVjdGVkUGxheWVyO1xuICAgIGlmIChzZWxlY3RlZFBsYXllci5haSkge1xuICAgICAgICB1cGRhdGVfZXZlbnRfY2FjaGUoZ2FtZSwgY3J1eCwgNCwgYWRkX25wY190aWNrX2NvdW50ZXIsIGNvbnNvbGUuZXJyb3IpO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IG1hcmtlZCB9IGZyb20gXCJtYXJrZWRcIjtcbmV4cG9ydCBmdW5jdGlvbiBtYXJrZG93bihtYXJrZG93blN0cmluZykge1xuICAgIHJldHVybiBtYXJrZWQucGFyc2UobWFya2Rvd25TdHJpbmcpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGlzX3ZhbGlkX2ltYWdlX3VybChzdHIpIHtcbiAgICB2YXIgcHJvdG9jb2wgPSBcIl4oaHR0cHM6XFxcXC9cXFxcLylcIjtcbiAgICB2YXIgZG9tYWlucyA9IFwiKGlcXFxcLmliYlxcXFwuY298aVxcXFwuaW1ndXJcXFxcLmNvbXxjZG5cXFxcLmRpc2NvcmRhcHBcXFxcLmNvbSlcIjtcbiAgICB2YXIgY29udGVudCA9IFwiKFsmI189O1xcXFwtXFxcXD9cXFxcL1xcXFx3XXsxLDE1MH0pXCI7XG4gICAgdmFyIGltYWdlcyA9IFwiKFxcXFwuKShnaWZ8anBlP2d8dGlmZj98cG5nfHdlYnB8Ym1wfEdJRnxKUEU/R3xUSUZGP3xQTkd8V0VCUHxCTVApJFwiO1xuICAgIHZhciByZWdleF9zdHJpbmcgPSBwcm90b2NvbCArIGRvbWFpbnMgKyBjb250ZW50ICsgaW1hZ2VzO1xuICAgIHZhciByZWdleCA9IG5ldyBSZWdFeHAocmVnZXhfc3RyaW5nKTtcbiAgICB2YXIgdmFsaWQgPSByZWdleC50ZXN0KHN0cik7XG4gICAgcmV0dXJuIHZhbGlkO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGlzX3ZhbGlkX3lvdXR1YmUoc3RyKSB7XG4gICAgdmFyIHByb3RvY29sID0gXCJeKGh0dHBzOi8vKVwiO1xuICAgIHZhciBkb21haW5zID0gXCIoeW91dHViZS5jb218d3d3LnlvdXR1YmUuY29tfHlvdXR1LmJlKVwiO1xuICAgIHZhciBjb250ZW50ID0gXCIoWyYjXz07LT8vd117MSwxNTB9KVwiO1xuICAgIHZhciByZWdleF9zdHJpbmcgPSBwcm90b2NvbCArIGRvbWFpbnMgKyBjb250ZW50O1xuICAgIHZhciByZWdleCA9IG5ldyBSZWdFeHAocmVnZXhfc3RyaW5nKTtcbiAgICByZXR1cm4gcmVnZXgudGVzdChzdHIpO1xufVxuZnVuY3Rpb24gZ2V0X3lvdXR1YmVfZW1iZWQobGluaykge1xuICAgIHJldHVybiBcIjxpZnJhbWUgd2lkdGg9XFxcIjU2MFxcXCIgaGVpZ2h0PVxcXCIzMTVcXFwiIHNyYz1cXFwiaHR0cHM6Ly93d3cueW91dHViZS5jb20vZW1iZWQvZUhzRFRHd19qWjhcXFwiIHRpdGxlPVxcXCJZb3VUdWJlIHZpZGVvIHBsYXllclxcXCIgZnJhbWVib3JkZXI9XFxcIjBcXFwiIGFsbG93PVxcXCJhY2NlbGVyb21ldGVyOyBhdXRvcGxheTsgY2xpcGJvYXJkLXdyaXRlOyBlbmNyeXB0ZWQtbWVkaWE7IGd5cm9zY29wZTsgcGljdHVyZS1pbi1waWN0dXJlOyB3ZWItc2hhcmVcXFwiIGFsbG93ZnVsbHNjcmVlbj48L2lmcmFtZT5cIjtcbn1cbiIsInZhciBfX2F3YWl0ZXIgPSAodGhpcyAmJiB0aGlzLl9fYXdhaXRlcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XG4gICAgfSk7XG59O1xudmFyIF9fZ2VuZXJhdG9yID0gKHRoaXMgJiYgdGhpcy5fX2dlbmVyYXRvcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIGJvZHkpIHtcbiAgICB2YXIgXyA9IHsgbGFiZWw6IDAsIHNlbnQ6IGZ1bmN0aW9uKCkgeyBpZiAodFswXSAmIDEpIHRocm93IHRbMV07IHJldHVybiB0WzFdOyB9LCB0cnlzOiBbXSwgb3BzOiBbXSB9LCBmLCB5LCB0LCBnO1xuICAgIHJldHVybiBnID0geyBuZXh0OiB2ZXJiKDApLCBcInRocm93XCI6IHZlcmIoMSksIFwicmV0dXJuXCI6IHZlcmIoMikgfSwgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIChnW1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXM7IH0pLCBnO1xuICAgIGZ1bmN0aW9uIHZlcmIobikgeyByZXR1cm4gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIHN0ZXAoW24sIHZdKTsgfTsgfVxuICAgIGZ1bmN0aW9uIHN0ZXAob3ApIHtcbiAgICAgICAgaWYgKGYpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJHZW5lcmF0b3IgaXMgYWxyZWFkeSBleGVjdXRpbmcuXCIpO1xuICAgICAgICB3aGlsZSAoZyAmJiAoZyA9IDAsIG9wWzBdICYmIChfID0gMCkpLCBfKSB0cnkge1xuICAgICAgICAgICAgaWYgKGYgPSAxLCB5ICYmICh0ID0gb3BbMF0gJiAyID8geVtcInJldHVyblwiXSA6IG9wWzBdID8geVtcInRocm93XCJdIHx8ICgodCA9IHlbXCJyZXR1cm5cIl0pICYmIHQuY2FsbCh5KSwgMCkgOiB5Lm5leHQpICYmICEodCA9IHQuY2FsbCh5LCBvcFsxXSkpLmRvbmUpIHJldHVybiB0O1xuICAgICAgICAgICAgaWYgKHkgPSAwLCB0KSBvcCA9IFtvcFswXSAmIDIsIHQudmFsdWVdO1xuICAgICAgICAgICAgc3dpdGNoIChvcFswXSkge1xuICAgICAgICAgICAgICAgIGNhc2UgMDogY2FzZSAxOiB0ID0gb3A7IGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgNDogXy5sYWJlbCsrOyByZXR1cm4geyB2YWx1ZTogb3BbMV0sIGRvbmU6IGZhbHNlIH07XG4gICAgICAgICAgICAgICAgY2FzZSA1OiBfLmxhYmVsKys7IHkgPSBvcFsxXTsgb3AgPSBbMF07IGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIGNhc2UgNzogb3AgPSBfLm9wcy5wb3AoKTsgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICBpZiAoISh0ID0gXy50cnlzLCB0ID0gdC5sZW5ndGggPiAwICYmIHRbdC5sZW5ndGggLSAxXSkgJiYgKG9wWzBdID09PSA2IHx8IG9wWzBdID09PSAyKSkgeyBfID0gMDsgY29udGludWU7IH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wWzBdID09PSAzICYmICghdCB8fCAob3BbMV0gPiB0WzBdICYmIG9wWzFdIDwgdFszXSkpKSB7IF8ubGFiZWwgPSBvcFsxXTsgYnJlYWs7IH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wWzBdID09PSA2ICYmIF8ubGFiZWwgPCB0WzFdKSB7IF8ubGFiZWwgPSB0WzFdOyB0ID0gb3A7IGJyZWFrOyB9XG4gICAgICAgICAgICAgICAgICAgIGlmICh0ICYmIF8ubGFiZWwgPCB0WzJdKSB7IF8ubGFiZWwgPSB0WzJdOyBfLm9wcy5wdXNoKG9wKTsgYnJlYWs7IH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRbMl0pIF8ub3BzLnBvcCgpO1xuICAgICAgICAgICAgICAgICAgICBfLnRyeXMucG9wKCk7IGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb3AgPSBib2R5LmNhbGwodGhpc0FyZywgXyk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHsgb3AgPSBbNiwgZV07IHkgPSAwOyB9IGZpbmFsbHkgeyBmID0gdCA9IDA7IH1cbiAgICAgICAgaWYgKG9wWzBdICYgNSkgdGhyb3cgb3BbMV07IHJldHVybiB7IHZhbHVlOiBvcFswXSA/IG9wWzFdIDogdm9pZCAwLCBkb25lOiB0cnVlIH07XG4gICAgfVxufTtcbnZhciBLVl9SRVNUX0FQSV9VUkwgPSBcImh0dHBzOi8vaW1tdW5lLWNyaWNrZXQtMzYwMTEua3YudmVyY2VsLXN0b3JhZ2UuY29tXCI7XG52YXIgS1ZfUkVTVF9BUElfUkVBRF9PTkxZX1RPS0VOID0gXCJBb3lyQVNRZ056RTBNMkUyTlRNdE1tRmpOQzAwWlRGbExXSm1OVEl0TUdSbFlXWm1NbVkzTVRjMFpwdEc5NmVsYlhPalpKN19HRTd3LWFyWUFHQ2FrdG9vMjVxNERYUldMN1U9XCI7XG52YXIgY3VzdG9tX2JhZGdlcyA9IFtcImFwZVwiXTtcbi8vIEZ1bmN0aW9uIHRoYXQgY29ubmVjdHMgdG8gc2VydmVyIGFuZCByZXRyaWV2ZXMgbGlzdCBvbiBrZXkgJ2FwZSdcbmV4cG9ydCB2YXIgZ2V0X2FwZV9iYWRnZXMgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBfX2F3YWl0ZXIodm9pZCAwLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBfX2dlbmVyYXRvcih0aGlzLCBmdW5jdGlvbiAoX2EpIHtcbiAgICAgICAgcmV0dXJuIFsyIC8qcmV0dXJuKi8sIGZldGNoKEtWX1JFU1RfQVBJX1VSTCwge1xuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgQXV0aG9yaXphdGlvbjogXCJCZWFyZXIgXCIuY29uY2F0KEtWX1JFU1RfQVBJX1JFQURfT05MWV9UT0tFTiksXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBib2R5OiAnW1wiTFJBTkdFXCIsIFwiYXBlXCIsIDAsIC0xXScsXG4gICAgICAgICAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7IHJldHVybiByZXNwb25zZS5qc29uKCk7IH0pXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHsgcmV0dXJuIGRhdGEucmVzdWx0OyB9KV07XG4gICAgfSk7XG59KTsgfTtcbi8qIFVwZGF0aW5nIEJhZGdlIENsYXNzZXMgKi9cbmV4cG9ydCB2YXIgQXBlQmFkZ2VJY29uID0gZnVuY3Rpb24gKENydXgsIHVybCwgZmlsZW5hbWUsIGNvdW50LCBzbWFsbCkge1xuICAgIHZhciBlYmkgPSBDcnV4LldpZGdldCgpO1xuICAgIGlmIChzbWFsbCA9PT0gdW5kZWZpbmVkKVxuICAgICAgICBzbWFsbCA9IGZhbHNlO1xuICAgIGlmIChzbWFsbCkge1xuICAgICAgICAvKiBTbWFsbCBpbWFnZXMgKi9cbiAgICAgICAgdmFyIGltYWdlX3VybCA9IFwiL2ltYWdlcy9iYWRnZXNfc21hbGwvXCIuY29uY2F0KGZpbGVuYW1lLCBcIi5wbmdcIik7XG4gICAgICAgIGlmIChmaWxlbmFtZSA9PSBcImFwZVwiKSB7XG4gICAgICAgICAgICBpbWFnZV91cmwgPSBcIlwiLmNvbmNhdCh1cmwpLmNvbmNhdChmaWxlbmFtZSwgXCJfc21hbGwucG5nXCIpO1xuICAgICAgICB9XG4gICAgICAgIENydXguSW1hZ2UoaW1hZ2VfdXJsLCBcImFic1wiKS5ncmlkKDAuMjUsIDAuMjUsIDIuNSwgMi41KS5yb29zdChlYmkpO1xuICAgICAgICBDcnV4LkNsaWNrYWJsZShcInNob3dfc2NyZWVuXCIsIFwiYnV5X2dpZnRcIilcbiAgICAgICAgICAgIC5ncmlkKDAuMjUsIDAuMjUsIDIuNSwgMi41KVxuICAgICAgICAgICAgLnR0KFwiYmFkZ2VfXCIuY29uY2F0KGZpbGVuYW1lKSlcbiAgICAgICAgICAgIC5yb29zdChlYmkpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgLyogQmlnIGltYWdlcyAqL1xuICAgICAgICB2YXIgaW1hZ2VfdXJsID0gXCIvaW1hZ2VzL2JhZGdlcy9cIi5jb25jYXQoZmlsZW5hbWUsIFwiLnBuZ1wiKTtcbiAgICAgICAgaWYgKGZpbGVuYW1lID09IFwiYXBlXCIpIHtcbiAgICAgICAgICAgIGltYWdlX3VybCA9IFwiXCIuY29uY2F0KHVybCkuY29uY2F0KGZpbGVuYW1lLCBcIi5wbmdcIik7XG4gICAgICAgIH1cbiAgICAgICAgQ3J1eC5JbWFnZShpbWFnZV91cmwsIFwiYWJzXCIpLmdyaWQoMCwgMCwgNiwgNikudHQoZmlsZW5hbWUpLnJvb3N0KGViaSk7XG4gICAgICAgIENydXguQ2xpY2thYmxlKFwic2hvd19zY3JlZW5cIiwgXCJidXlfZ2lmdFwiKVxuICAgICAgICAgICAgLmdyaWQoMCwgMCwgNiwgNilcbiAgICAgICAgICAgIC50dChcImJhZGdlX1wiLmNvbmNhdChmaWxlbmFtZSkpXG4gICAgICAgICAgICAucm9vc3QoZWJpKTtcbiAgICB9XG4gICAgaWYgKGNvdW50ID4gMSAmJiAhc21hbGwpIHtcbiAgICAgICAgQ3J1eC5JbWFnZShcIi9pbWFnZXMvYmFkZ2VzL2NvdW50ZXIucG5nXCIsIFwiYWJzXCIpXG4gICAgICAgICAgICAuZ3JpZCgwLCAwLCA2LCA2KVxuICAgICAgICAgICAgLnR0KGZpbGVuYW1lKVxuICAgICAgICAgICAgLnJvb3N0KGViaSk7XG4gICAgICAgIENydXguVGV4dChcIlwiLCBcInR4dF9jZW50ZXIgdHh0X3RpbnlcIiwgXCJhYnNcIilcbiAgICAgICAgICAgIC5yYXdIVE1MKGNvdW50KVxuICAgICAgICAgICAgLnBvcyg1MSwgNjgpXG4gICAgICAgICAgICAuc2l6ZSgzMiwgMzIpXG4gICAgICAgICAgICAucm9vc3QoZWJpKTtcbiAgICB9XG4gICAgcmV0dXJuIGViaTtcbn07XG4vKlxuY29uc3QgZ3JvdXBBcGVCYWRnZXMgPSBmdW5jdGlvbiAoYmFkZ2VzU3RyaW5nOiBzdHJpbmcpIHtcbiAgaWYgKCFiYWRnZXNTdHJpbmcpIGJhZGdlc1N0cmluZyA9IFwiXCI7XG4gIHZhciBncm91cGVkQmFkZ2VzOiB7IFtrZXk6IHN0cmluZ106IG51bWJlciB9ID0ge307XG4gIHZhciBpO1xuICBmb3IgKGkgPSBiYWRnZXNTdHJpbmcubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICB2YXIgYmNoYXIgPSBiYWRnZXNTdHJpbmcuY2hhckF0KGkpO1xuICAgIGlmIChncm91cGVkQmFkZ2VzLmhhc093blByb3BlcnR5KGJjaGFyKSkge1xuICAgICAgZ3JvdXBlZEJhZGdlc1tiY2hhcl0gKz0gMTtcbiAgICB9IGVsc2Uge1xuICAgICAgZ3JvdXBlZEJhZGdlc1tiY2hhcl0gPSAxO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZ3JvdXBlZEJhZGdlcztcbn07XG4qL1xuIiwiLyoqXG4gKiBtYXJrZWQgdjQuMy4wIC0gYSBtYXJrZG93biBwYXJzZXJcbiAqIENvcHlyaWdodCAoYykgMjAxMS0yMDIzLCBDaHJpc3RvcGhlciBKZWZmcmV5LiAoTUlUIExpY2Vuc2VkKVxuICogaHR0cHM6Ly9naXRodWIuY29tL21hcmtlZGpzL21hcmtlZFxuICovXG5cbi8qKlxuICogRE8gTk9UIEVESVQgVEhJUyBGSUxFXG4gKiBUaGUgY29kZSBpbiB0aGlzIGZpbGUgaXMgZ2VuZXJhdGVkIGZyb20gZmlsZXMgaW4gLi9zcmMvXG4gKi9cblxuZnVuY3Rpb24gZ2V0RGVmYXVsdHMoKSB7XG4gIHJldHVybiB7XG4gICAgYXN5bmM6IGZhbHNlLFxuICAgIGJhc2VVcmw6IG51bGwsXG4gICAgYnJlYWtzOiBmYWxzZSxcbiAgICBleHRlbnNpb25zOiBudWxsLFxuICAgIGdmbTogdHJ1ZSxcbiAgICBoZWFkZXJJZHM6IHRydWUsXG4gICAgaGVhZGVyUHJlZml4OiAnJyxcbiAgICBoaWdobGlnaHQ6IG51bGwsXG4gICAgaG9va3M6IG51bGwsXG4gICAgbGFuZ1ByZWZpeDogJ2xhbmd1YWdlLScsXG4gICAgbWFuZ2xlOiB0cnVlLFxuICAgIHBlZGFudGljOiBmYWxzZSxcbiAgICByZW5kZXJlcjogbnVsbCxcbiAgICBzYW5pdGl6ZTogZmFsc2UsXG4gICAgc2FuaXRpemVyOiBudWxsLFxuICAgIHNpbGVudDogZmFsc2UsXG4gICAgc21hcnR5cGFudHM6IGZhbHNlLFxuICAgIHRva2VuaXplcjogbnVsbCxcbiAgICB3YWxrVG9rZW5zOiBudWxsLFxuICAgIHhodG1sOiBmYWxzZVxuICB9O1xufVxuXG5sZXQgZGVmYXVsdHMgPSBnZXREZWZhdWx0cygpO1xuXG5mdW5jdGlvbiBjaGFuZ2VEZWZhdWx0cyhuZXdEZWZhdWx0cykge1xuICBkZWZhdWx0cyA9IG5ld0RlZmF1bHRzO1xufVxuXG4vKipcbiAqIEhlbHBlcnNcbiAqL1xuY29uc3QgZXNjYXBlVGVzdCA9IC9bJjw+XCInXS87XG5jb25zdCBlc2NhcGVSZXBsYWNlID0gbmV3IFJlZ0V4cChlc2NhcGVUZXN0LnNvdXJjZSwgJ2cnKTtcbmNvbnN0IGVzY2FwZVRlc3ROb0VuY29kZSA9IC9bPD5cIiddfCYoPyEoI1xcZHsxLDd9fCNbWHhdW2EtZkEtRjAtOV17MSw2fXxcXHcrKTspLztcbmNvbnN0IGVzY2FwZVJlcGxhY2VOb0VuY29kZSA9IG5ldyBSZWdFeHAoZXNjYXBlVGVzdE5vRW5jb2RlLnNvdXJjZSwgJ2cnKTtcbmNvbnN0IGVzY2FwZVJlcGxhY2VtZW50cyA9IHtcbiAgJyYnOiAnJmFtcDsnLFxuICAnPCc6ICcmbHQ7JyxcbiAgJz4nOiAnJmd0OycsXG4gICdcIic6ICcmcXVvdDsnLFxuICBcIidcIjogJyYjMzk7J1xufTtcbmNvbnN0IGdldEVzY2FwZVJlcGxhY2VtZW50ID0gKGNoKSA9PiBlc2NhcGVSZXBsYWNlbWVudHNbY2hdO1xuZnVuY3Rpb24gZXNjYXBlKGh0bWwsIGVuY29kZSkge1xuICBpZiAoZW5jb2RlKSB7XG4gICAgaWYgKGVzY2FwZVRlc3QudGVzdChodG1sKSkge1xuICAgICAgcmV0dXJuIGh0bWwucmVwbGFjZShlc2NhcGVSZXBsYWNlLCBnZXRFc2NhcGVSZXBsYWNlbWVudCk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmIChlc2NhcGVUZXN0Tm9FbmNvZGUudGVzdChodG1sKSkge1xuICAgICAgcmV0dXJuIGh0bWwucmVwbGFjZShlc2NhcGVSZXBsYWNlTm9FbmNvZGUsIGdldEVzY2FwZVJlcGxhY2VtZW50KTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gaHRtbDtcbn1cblxuY29uc3QgdW5lc2NhcGVUZXN0ID0gLyYoIyg/OlxcZCspfCg/OiN4WzAtOUEtRmEtZl0rKXwoPzpcXHcrKSk7Py9pZztcblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30gaHRtbFxuICovXG5mdW5jdGlvbiB1bmVzY2FwZShodG1sKSB7XG4gIC8vIGV4cGxpY2l0bHkgbWF0Y2ggZGVjaW1hbCwgaGV4LCBhbmQgbmFtZWQgSFRNTCBlbnRpdGllc1xuICByZXR1cm4gaHRtbC5yZXBsYWNlKHVuZXNjYXBlVGVzdCwgKF8sIG4pID0+IHtcbiAgICBuID0gbi50b0xvd2VyQ2FzZSgpO1xuICAgIGlmIChuID09PSAnY29sb24nKSByZXR1cm4gJzonO1xuICAgIGlmIChuLmNoYXJBdCgwKSA9PT0gJyMnKSB7XG4gICAgICByZXR1cm4gbi5jaGFyQXQoMSkgPT09ICd4J1xuICAgICAgICA/IFN0cmluZy5mcm9tQ2hhckNvZGUocGFyc2VJbnQobi5zdWJzdHJpbmcoMiksIDE2KSlcbiAgICAgICAgOiBTdHJpbmcuZnJvbUNoYXJDb2RlKCtuLnN1YnN0cmluZygxKSk7XG4gICAgfVxuICAgIHJldHVybiAnJztcbiAgfSk7XG59XG5cbmNvbnN0IGNhcmV0ID0gLyhefFteXFxbXSlcXF4vZztcblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZyB8IFJlZ0V4cH0gcmVnZXhcbiAqIEBwYXJhbSB7c3RyaW5nfSBvcHRcbiAqL1xuZnVuY3Rpb24gZWRpdChyZWdleCwgb3B0KSB7XG4gIHJlZ2V4ID0gdHlwZW9mIHJlZ2V4ID09PSAnc3RyaW5nJyA/IHJlZ2V4IDogcmVnZXguc291cmNlO1xuICBvcHQgPSBvcHQgfHwgJyc7XG4gIGNvbnN0IG9iaiA9IHtcbiAgICByZXBsYWNlOiAobmFtZSwgdmFsKSA9PiB7XG4gICAgICB2YWwgPSB2YWwuc291cmNlIHx8IHZhbDtcbiAgICAgIHZhbCA9IHZhbC5yZXBsYWNlKGNhcmV0LCAnJDEnKTtcbiAgICAgIHJlZ2V4ID0gcmVnZXgucmVwbGFjZShuYW1lLCB2YWwpO1xuICAgICAgcmV0dXJuIG9iajtcbiAgICB9LFxuICAgIGdldFJlZ2V4OiAoKSA9PiB7XG4gICAgICByZXR1cm4gbmV3IFJlZ0V4cChyZWdleCwgb3B0KTtcbiAgICB9XG4gIH07XG4gIHJldHVybiBvYmo7XG59XG5cbmNvbnN0IG5vbldvcmRBbmRDb2xvblRlc3QgPSAvW15cXHc6XS9nO1xuY29uc3Qgb3JpZ2luSW5kZXBlbmRlbnRVcmwgPSAvXiR8XlthLXpdW2EtejAtOSsuLV0qOnxeWz8jXS9pO1xuXG4vKipcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gc2FuaXRpemVcbiAqIEBwYXJhbSB7c3RyaW5nfSBiYXNlXG4gKiBAcGFyYW0ge3N0cmluZ30gaHJlZlxuICovXG5mdW5jdGlvbiBjbGVhblVybChzYW5pdGl6ZSwgYmFzZSwgaHJlZikge1xuICBpZiAoc2FuaXRpemUpIHtcbiAgICBsZXQgcHJvdDtcbiAgICB0cnkge1xuICAgICAgcHJvdCA9IGRlY29kZVVSSUNvbXBvbmVudCh1bmVzY2FwZShocmVmKSlcbiAgICAgICAgLnJlcGxhY2Uobm9uV29yZEFuZENvbG9uVGVzdCwgJycpXG4gICAgICAgIC50b0xvd2VyQ2FzZSgpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBpZiAocHJvdC5pbmRleE9mKCdqYXZhc2NyaXB0OicpID09PSAwIHx8IHByb3QuaW5kZXhPZigndmJzY3JpcHQ6JykgPT09IDAgfHwgcHJvdC5pbmRleE9mKCdkYXRhOicpID09PSAwKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cbiAgaWYgKGJhc2UgJiYgIW9yaWdpbkluZGVwZW5kZW50VXJsLnRlc3QoaHJlZikpIHtcbiAgICBocmVmID0gcmVzb2x2ZVVybChiYXNlLCBocmVmKTtcbiAgfVxuICB0cnkge1xuICAgIGhyZWYgPSBlbmNvZGVVUkkoaHJlZikucmVwbGFjZSgvJTI1L2csICclJyk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICByZXR1cm4gaHJlZjtcbn1cblxuY29uc3QgYmFzZVVybHMgPSB7fTtcbmNvbnN0IGp1c3REb21haW4gPSAvXlteOl0rOlxcLypbXi9dKiQvO1xuY29uc3QgcHJvdG9jb2wgPSAvXihbXjpdKzopW1xcc1xcU10qJC87XG5jb25zdCBkb21haW4gPSAvXihbXjpdKzpcXC8qW14vXSopW1xcc1xcU10qJC87XG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmd9IGJhc2VcbiAqIEBwYXJhbSB7c3RyaW5nfSBocmVmXG4gKi9cbmZ1bmN0aW9uIHJlc29sdmVVcmwoYmFzZSwgaHJlZikge1xuICBpZiAoIWJhc2VVcmxzWycgJyArIGJhc2VdKSB7XG4gICAgLy8gd2UgY2FuIGlnbm9yZSBldmVyeXRoaW5nIGluIGJhc2UgYWZ0ZXIgdGhlIGxhc3Qgc2xhc2ggb2YgaXRzIHBhdGggY29tcG9uZW50LFxuICAgIC8vIGJ1dCB3ZSBtaWdodCBuZWVkIHRvIGFkZCBfdGhhdF9cbiAgICAvLyBodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzk4NiNzZWN0aW9uLTNcbiAgICBpZiAoanVzdERvbWFpbi50ZXN0KGJhc2UpKSB7XG4gICAgICBiYXNlVXJsc1snICcgKyBiYXNlXSA9IGJhc2UgKyAnLyc7XG4gICAgfSBlbHNlIHtcbiAgICAgIGJhc2VVcmxzWycgJyArIGJhc2VdID0gcnRyaW0oYmFzZSwgJy8nLCB0cnVlKTtcbiAgICB9XG4gIH1cbiAgYmFzZSA9IGJhc2VVcmxzWycgJyArIGJhc2VdO1xuICBjb25zdCByZWxhdGl2ZUJhc2UgPSBiYXNlLmluZGV4T2YoJzonKSA9PT0gLTE7XG5cbiAgaWYgKGhyZWYuc3Vic3RyaW5nKDAsIDIpID09PSAnLy8nKSB7XG4gICAgaWYgKHJlbGF0aXZlQmFzZSkge1xuICAgICAgcmV0dXJuIGhyZWY7XG4gICAgfVxuICAgIHJldHVybiBiYXNlLnJlcGxhY2UocHJvdG9jb2wsICckMScpICsgaHJlZjtcbiAgfSBlbHNlIGlmIChocmVmLmNoYXJBdCgwKSA9PT0gJy8nKSB7XG4gICAgaWYgKHJlbGF0aXZlQmFzZSkge1xuICAgICAgcmV0dXJuIGhyZWY7XG4gICAgfVxuICAgIHJldHVybiBiYXNlLnJlcGxhY2UoZG9tYWluLCAnJDEnKSArIGhyZWY7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGJhc2UgKyBocmVmO1xuICB9XG59XG5cbmNvbnN0IG5vb3BUZXN0ID0geyBleGVjOiBmdW5jdGlvbiBub29wVGVzdCgpIHt9IH07XG5cbmZ1bmN0aW9uIHNwbGl0Q2VsbHModGFibGVSb3csIGNvdW50KSB7XG4gIC8vIGVuc3VyZSB0aGF0IGV2ZXJ5IGNlbGwtZGVsaW1pdGluZyBwaXBlIGhhcyBhIHNwYWNlXG4gIC8vIGJlZm9yZSBpdCB0byBkaXN0aW5ndWlzaCBpdCBmcm9tIGFuIGVzY2FwZWQgcGlwZVxuICBjb25zdCByb3cgPSB0YWJsZVJvdy5yZXBsYWNlKC9cXHwvZywgKG1hdGNoLCBvZmZzZXQsIHN0cikgPT4ge1xuICAgICAgbGV0IGVzY2FwZWQgPSBmYWxzZSxcbiAgICAgICAgY3VyciA9IG9mZnNldDtcbiAgICAgIHdoaWxlICgtLWN1cnIgPj0gMCAmJiBzdHJbY3Vycl0gPT09ICdcXFxcJykgZXNjYXBlZCA9ICFlc2NhcGVkO1xuICAgICAgaWYgKGVzY2FwZWQpIHtcbiAgICAgICAgLy8gb2RkIG51bWJlciBvZiBzbGFzaGVzIG1lYW5zIHwgaXMgZXNjYXBlZFxuICAgICAgICAvLyBzbyB3ZSBsZWF2ZSBpdCBhbG9uZVxuICAgICAgICByZXR1cm4gJ3wnO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gYWRkIHNwYWNlIGJlZm9yZSB1bmVzY2FwZWQgfFxuICAgICAgICByZXR1cm4gJyB8JztcbiAgICAgIH1cbiAgICB9KSxcbiAgICBjZWxscyA9IHJvdy5zcGxpdCgvIFxcfC8pO1xuICBsZXQgaSA9IDA7XG5cbiAgLy8gRmlyc3QvbGFzdCBjZWxsIGluIGEgcm93IGNhbm5vdCBiZSBlbXB0eSBpZiBpdCBoYXMgbm8gbGVhZGluZy90cmFpbGluZyBwaXBlXG4gIGlmICghY2VsbHNbMF0udHJpbSgpKSB7IGNlbGxzLnNoaWZ0KCk7IH1cbiAgaWYgKGNlbGxzLmxlbmd0aCA+IDAgJiYgIWNlbGxzW2NlbGxzLmxlbmd0aCAtIDFdLnRyaW0oKSkgeyBjZWxscy5wb3AoKTsgfVxuXG4gIGlmIChjZWxscy5sZW5ndGggPiBjb3VudCkge1xuICAgIGNlbGxzLnNwbGljZShjb3VudCk7XG4gIH0gZWxzZSB7XG4gICAgd2hpbGUgKGNlbGxzLmxlbmd0aCA8IGNvdW50KSBjZWxscy5wdXNoKCcnKTtcbiAgfVxuXG4gIGZvciAoOyBpIDwgY2VsbHMubGVuZ3RoOyBpKyspIHtcbiAgICAvLyBsZWFkaW5nIG9yIHRyYWlsaW5nIHdoaXRlc3BhY2UgaXMgaWdub3JlZCBwZXIgdGhlIGdmbSBzcGVjXG4gICAgY2VsbHNbaV0gPSBjZWxsc1tpXS50cmltKCkucmVwbGFjZSgvXFxcXFxcfC9nLCAnfCcpO1xuICB9XG4gIHJldHVybiBjZWxscztcbn1cblxuLyoqXG4gKiBSZW1vdmUgdHJhaWxpbmcgJ2Mncy4gRXF1aXZhbGVudCB0byBzdHIucmVwbGFjZSgvYyokLywgJycpLlxuICogL2MqJC8gaXMgdnVsbmVyYWJsZSB0byBSRURPUy5cbiAqXG4gKiBAcGFyYW0ge3N0cmluZ30gc3RyXG4gKiBAcGFyYW0ge3N0cmluZ30gY1xuICogQHBhcmFtIHtib29sZWFufSBpbnZlcnQgUmVtb3ZlIHN1ZmZpeCBvZiBub24tYyBjaGFycyBpbnN0ZWFkLiBEZWZhdWx0IGZhbHNleS5cbiAqL1xuZnVuY3Rpb24gcnRyaW0oc3RyLCBjLCBpbnZlcnQpIHtcbiAgY29uc3QgbCA9IHN0ci5sZW5ndGg7XG4gIGlmIChsID09PSAwKSB7XG4gICAgcmV0dXJuICcnO1xuICB9XG5cbiAgLy8gTGVuZ3RoIG9mIHN1ZmZpeCBtYXRjaGluZyB0aGUgaW52ZXJ0IGNvbmRpdGlvbi5cbiAgbGV0IHN1ZmZMZW4gPSAwO1xuXG4gIC8vIFN0ZXAgbGVmdCB1bnRpbCB3ZSBmYWlsIHRvIG1hdGNoIHRoZSBpbnZlcnQgY29uZGl0aW9uLlxuICB3aGlsZSAoc3VmZkxlbiA8IGwpIHtcbiAgICBjb25zdCBjdXJyQ2hhciA9IHN0ci5jaGFyQXQobCAtIHN1ZmZMZW4gLSAxKTtcbiAgICBpZiAoY3VyckNoYXIgPT09IGMgJiYgIWludmVydCkge1xuICAgICAgc3VmZkxlbisrO1xuICAgIH0gZWxzZSBpZiAoY3VyckNoYXIgIT09IGMgJiYgaW52ZXJ0KSB7XG4gICAgICBzdWZmTGVuKys7XG4gICAgfSBlbHNlIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBzdHIuc2xpY2UoMCwgbCAtIHN1ZmZMZW4pO1xufVxuXG5mdW5jdGlvbiBmaW5kQ2xvc2luZ0JyYWNrZXQoc3RyLCBiKSB7XG4gIGlmIChzdHIuaW5kZXhPZihiWzFdKSA9PT0gLTEpIHtcbiAgICByZXR1cm4gLTE7XG4gIH1cbiAgY29uc3QgbCA9IHN0ci5sZW5ndGg7XG4gIGxldCBsZXZlbCA9IDAsXG4gICAgaSA9IDA7XG4gIGZvciAoOyBpIDwgbDsgaSsrKSB7XG4gICAgaWYgKHN0cltpXSA9PT0gJ1xcXFwnKSB7XG4gICAgICBpKys7XG4gICAgfSBlbHNlIGlmIChzdHJbaV0gPT09IGJbMF0pIHtcbiAgICAgIGxldmVsKys7XG4gICAgfSBlbHNlIGlmIChzdHJbaV0gPT09IGJbMV0pIHtcbiAgICAgIGxldmVsLS07XG4gICAgICBpZiAobGV2ZWwgPCAwKSB7XG4gICAgICAgIHJldHVybiBpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gLTE7XG59XG5cbmZ1bmN0aW9uIGNoZWNrU2FuaXRpemVEZXByZWNhdGlvbihvcHQpIHtcbiAgaWYgKG9wdCAmJiBvcHQuc2FuaXRpemUgJiYgIW9wdC5zaWxlbnQpIHtcbiAgICBjb25zb2xlLndhcm4oJ21hcmtlZCgpOiBzYW5pdGl6ZSBhbmQgc2FuaXRpemVyIHBhcmFtZXRlcnMgYXJlIGRlcHJlY2F0ZWQgc2luY2UgdmVyc2lvbiAwLjcuMCwgc2hvdWxkIG5vdCBiZSB1c2VkIGFuZCB3aWxsIGJlIHJlbW92ZWQgaW4gdGhlIGZ1dHVyZS4gUmVhZCBtb3JlIGhlcmU6IGh0dHBzOi8vbWFya2VkLmpzLm9yZy8jL1VTSU5HX0FEVkFOQ0VELm1kI29wdGlvbnMnKTtcbiAgfVxufVxuXG4vLyBjb3BpZWQgZnJvbSBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL2EvNTQ1MDExMy84MDY3Nzdcbi8qKlxuICogQHBhcmFtIHtzdHJpbmd9IHBhdHRlcm5cbiAqIEBwYXJhbSB7bnVtYmVyfSBjb3VudFxuICovXG5mdW5jdGlvbiByZXBlYXRTdHJpbmcocGF0dGVybiwgY291bnQpIHtcbiAgaWYgKGNvdW50IDwgMSkge1xuICAgIHJldHVybiAnJztcbiAgfVxuICBsZXQgcmVzdWx0ID0gJyc7XG4gIHdoaWxlIChjb3VudCA+IDEpIHtcbiAgICBpZiAoY291bnQgJiAxKSB7XG4gICAgICByZXN1bHQgKz0gcGF0dGVybjtcbiAgICB9XG4gICAgY291bnQgPj49IDE7XG4gICAgcGF0dGVybiArPSBwYXR0ZXJuO1xuICB9XG4gIHJldHVybiByZXN1bHQgKyBwYXR0ZXJuO1xufVxuXG5mdW5jdGlvbiBvdXRwdXRMaW5rKGNhcCwgbGluaywgcmF3LCBsZXhlcikge1xuICBjb25zdCBocmVmID0gbGluay5ocmVmO1xuICBjb25zdCB0aXRsZSA9IGxpbmsudGl0bGUgPyBlc2NhcGUobGluay50aXRsZSkgOiBudWxsO1xuICBjb25zdCB0ZXh0ID0gY2FwWzFdLnJlcGxhY2UoL1xcXFwoW1xcW1xcXV0pL2csICckMScpO1xuXG4gIGlmIChjYXBbMF0uY2hhckF0KDApICE9PSAnIScpIHtcbiAgICBsZXhlci5zdGF0ZS5pbkxpbmsgPSB0cnVlO1xuICAgIGNvbnN0IHRva2VuID0ge1xuICAgICAgdHlwZTogJ2xpbmsnLFxuICAgICAgcmF3LFxuICAgICAgaHJlZixcbiAgICAgIHRpdGxlLFxuICAgICAgdGV4dCxcbiAgICAgIHRva2VuczogbGV4ZXIuaW5saW5lVG9rZW5zKHRleHQpXG4gICAgfTtcbiAgICBsZXhlci5zdGF0ZS5pbkxpbmsgPSBmYWxzZTtcbiAgICByZXR1cm4gdG9rZW47XG4gIH1cbiAgcmV0dXJuIHtcbiAgICB0eXBlOiAnaW1hZ2UnLFxuICAgIHJhdyxcbiAgICBocmVmLFxuICAgIHRpdGxlLFxuICAgIHRleHQ6IGVzY2FwZSh0ZXh0KVxuICB9O1xufVxuXG5mdW5jdGlvbiBpbmRlbnRDb2RlQ29tcGVuc2F0aW9uKHJhdywgdGV4dCkge1xuICBjb25zdCBtYXRjaEluZGVudFRvQ29kZSA9IHJhdy5tYXRjaCgvXihcXHMrKSg/OmBgYCkvKTtcblxuICBpZiAobWF0Y2hJbmRlbnRUb0NvZGUgPT09IG51bGwpIHtcbiAgICByZXR1cm4gdGV4dDtcbiAgfVxuXG4gIGNvbnN0IGluZGVudFRvQ29kZSA9IG1hdGNoSW5kZW50VG9Db2RlWzFdO1xuXG4gIHJldHVybiB0ZXh0XG4gICAgLnNwbGl0KCdcXG4nKVxuICAgIC5tYXAobm9kZSA9PiB7XG4gICAgICBjb25zdCBtYXRjaEluZGVudEluTm9kZSA9IG5vZGUubWF0Y2goL15cXHMrLyk7XG4gICAgICBpZiAobWF0Y2hJbmRlbnRJbk5vZGUgPT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIG5vZGU7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IFtpbmRlbnRJbk5vZGVdID0gbWF0Y2hJbmRlbnRJbk5vZGU7XG5cbiAgICAgIGlmIChpbmRlbnRJbk5vZGUubGVuZ3RoID49IGluZGVudFRvQ29kZS5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIG5vZGUuc2xpY2UoaW5kZW50VG9Db2RlLmxlbmd0aCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBub2RlO1xuICAgIH0pXG4gICAgLmpvaW4oJ1xcbicpO1xufVxuXG4vKipcbiAqIFRva2VuaXplclxuICovXG5jbGFzcyBUb2tlbml6ZXIge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyB8fCBkZWZhdWx0cztcbiAgfVxuXG4gIHNwYWNlKHNyYykge1xuICAgIGNvbnN0IGNhcCA9IHRoaXMucnVsZXMuYmxvY2submV3bGluZS5leGVjKHNyYyk7XG4gICAgaWYgKGNhcCAmJiBjYXBbMF0ubGVuZ3RoID4gMCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ3NwYWNlJyxcbiAgICAgICAgcmF3OiBjYXBbMF1cbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgY29kZShzcmMpIHtcbiAgICBjb25zdCBjYXAgPSB0aGlzLnJ1bGVzLmJsb2NrLmNvZGUuZXhlYyhzcmMpO1xuICAgIGlmIChjYXApIHtcbiAgICAgIGNvbnN0IHRleHQgPSBjYXBbMF0ucmVwbGFjZSgvXiB7MSw0fS9nbSwgJycpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ2NvZGUnLFxuICAgICAgICByYXc6IGNhcFswXSxcbiAgICAgICAgY29kZUJsb2NrU3R5bGU6ICdpbmRlbnRlZCcsXG4gICAgICAgIHRleHQ6ICF0aGlzLm9wdGlvbnMucGVkYW50aWNcbiAgICAgICAgICA/IHJ0cmltKHRleHQsICdcXG4nKVxuICAgICAgICAgIDogdGV4dFxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICBmZW5jZXMoc3JjKSB7XG4gICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5ibG9jay5mZW5jZXMuZXhlYyhzcmMpO1xuICAgIGlmIChjYXApIHtcbiAgICAgIGNvbnN0IHJhdyA9IGNhcFswXTtcbiAgICAgIGNvbnN0IHRleHQgPSBpbmRlbnRDb2RlQ29tcGVuc2F0aW9uKHJhdywgY2FwWzNdIHx8ICcnKTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ2NvZGUnLFxuICAgICAgICByYXcsXG4gICAgICAgIGxhbmc6IGNhcFsyXSA/IGNhcFsyXS50cmltKCkucmVwbGFjZSh0aGlzLnJ1bGVzLmlubGluZS5fZXNjYXBlcywgJyQxJykgOiBjYXBbMl0sXG4gICAgICAgIHRleHRcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgaGVhZGluZyhzcmMpIHtcbiAgICBjb25zdCBjYXAgPSB0aGlzLnJ1bGVzLmJsb2NrLmhlYWRpbmcuZXhlYyhzcmMpO1xuICAgIGlmIChjYXApIHtcbiAgICAgIGxldCB0ZXh0ID0gY2FwWzJdLnRyaW0oKTtcblxuICAgICAgLy8gcmVtb3ZlIHRyYWlsaW5nICNzXG4gICAgICBpZiAoLyMkLy50ZXN0KHRleHQpKSB7XG4gICAgICAgIGNvbnN0IHRyaW1tZWQgPSBydHJpbSh0ZXh0LCAnIycpO1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnBlZGFudGljKSB7XG4gICAgICAgICAgdGV4dCA9IHRyaW1tZWQudHJpbSgpO1xuICAgICAgICB9IGVsc2UgaWYgKCF0cmltbWVkIHx8IC8gJC8udGVzdCh0cmltbWVkKSkge1xuICAgICAgICAgIC8vIENvbW1vbk1hcmsgcmVxdWlyZXMgc3BhY2UgYmVmb3JlIHRyYWlsaW5nICNzXG4gICAgICAgICAgdGV4dCA9IHRyaW1tZWQudHJpbSgpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdoZWFkaW5nJyxcbiAgICAgICAgcmF3OiBjYXBbMF0sXG4gICAgICAgIGRlcHRoOiBjYXBbMV0ubGVuZ3RoLFxuICAgICAgICB0ZXh0LFxuICAgICAgICB0b2tlbnM6IHRoaXMubGV4ZXIuaW5saW5lKHRleHQpXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIGhyKHNyYykge1xuICAgIGNvbnN0IGNhcCA9IHRoaXMucnVsZXMuYmxvY2suaHIuZXhlYyhzcmMpO1xuICAgIGlmIChjYXApIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdocicsXG4gICAgICAgIHJhdzogY2FwWzBdXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIGJsb2NrcXVvdGUoc3JjKSB7XG4gICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5ibG9jay5ibG9ja3F1b3RlLmV4ZWMoc3JjKTtcbiAgICBpZiAoY2FwKSB7XG4gICAgICBjb25zdCB0ZXh0ID0gY2FwWzBdLnJlcGxhY2UoL14gKj5bIFxcdF0/L2dtLCAnJyk7XG4gICAgICBjb25zdCB0b3AgPSB0aGlzLmxleGVyLnN0YXRlLnRvcDtcbiAgICAgIHRoaXMubGV4ZXIuc3RhdGUudG9wID0gdHJ1ZTtcbiAgICAgIGNvbnN0IHRva2VucyA9IHRoaXMubGV4ZXIuYmxvY2tUb2tlbnModGV4dCk7XG4gICAgICB0aGlzLmxleGVyLnN0YXRlLnRvcCA9IHRvcDtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdibG9ja3F1b3RlJyxcbiAgICAgICAgcmF3OiBjYXBbMF0sXG4gICAgICAgIHRva2VucyxcbiAgICAgICAgdGV4dFxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICBsaXN0KHNyYykge1xuICAgIGxldCBjYXAgPSB0aGlzLnJ1bGVzLmJsb2NrLmxpc3QuZXhlYyhzcmMpO1xuICAgIGlmIChjYXApIHtcbiAgICAgIGxldCByYXcsIGlzdGFzaywgaXNjaGVja2VkLCBpbmRlbnQsIGksIGJsYW5rTGluZSwgZW5kc1dpdGhCbGFua0xpbmUsXG4gICAgICAgIGxpbmUsIG5leHRMaW5lLCByYXdMaW5lLCBpdGVtQ29udGVudHMsIGVuZEVhcmx5O1xuXG4gICAgICBsZXQgYnVsbCA9IGNhcFsxXS50cmltKCk7XG4gICAgICBjb25zdCBpc29yZGVyZWQgPSBidWxsLmxlbmd0aCA+IDE7XG5cbiAgICAgIGNvbnN0IGxpc3QgPSB7XG4gICAgICAgIHR5cGU6ICdsaXN0JyxcbiAgICAgICAgcmF3OiAnJyxcbiAgICAgICAgb3JkZXJlZDogaXNvcmRlcmVkLFxuICAgICAgICBzdGFydDogaXNvcmRlcmVkID8gK2J1bGwuc2xpY2UoMCwgLTEpIDogJycsXG4gICAgICAgIGxvb3NlOiBmYWxzZSxcbiAgICAgICAgaXRlbXM6IFtdXG4gICAgICB9O1xuXG4gICAgICBidWxsID0gaXNvcmRlcmVkID8gYFxcXFxkezEsOX1cXFxcJHtidWxsLnNsaWNlKC0xKX1gIDogYFxcXFwke2J1bGx9YDtcblxuICAgICAgaWYgKHRoaXMub3B0aW9ucy5wZWRhbnRpYykge1xuICAgICAgICBidWxsID0gaXNvcmRlcmVkID8gYnVsbCA6ICdbKistXSc7XG4gICAgICB9XG5cbiAgICAgIC8vIEdldCBuZXh0IGxpc3QgaXRlbVxuICAgICAgY29uc3QgaXRlbVJlZ2V4ID0gbmV3IFJlZ0V4cChgXiggezAsM30ke2J1bGx9KSgoPzpbXFx0IF1bXlxcXFxuXSopPyg/OlxcXFxufCQpKWApO1xuXG4gICAgICAvLyBDaGVjayBpZiBjdXJyZW50IGJ1bGxldCBwb2ludCBjYW4gc3RhcnQgYSBuZXcgTGlzdCBJdGVtXG4gICAgICB3aGlsZSAoc3JjKSB7XG4gICAgICAgIGVuZEVhcmx5ID0gZmFsc2U7XG4gICAgICAgIGlmICghKGNhcCA9IGl0ZW1SZWdleC5leGVjKHNyYykpKSB7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5ydWxlcy5ibG9jay5oci50ZXN0KHNyYykpIHsgLy8gRW5kIGxpc3QgaWYgYnVsbGV0IHdhcyBhY3R1YWxseSBIUiAocG9zc2libHkgbW92ZSBpbnRvIGl0ZW1SZWdleD8pXG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICByYXcgPSBjYXBbMF07XG4gICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcocmF3Lmxlbmd0aCk7XG5cbiAgICAgICAgbGluZSA9IGNhcFsyXS5zcGxpdCgnXFxuJywgMSlbMF0ucmVwbGFjZSgvXlxcdCsvLCAodCkgPT4gJyAnLnJlcGVhdCgzICogdC5sZW5ndGgpKTtcbiAgICAgICAgbmV4dExpbmUgPSBzcmMuc3BsaXQoJ1xcbicsIDEpWzBdO1xuXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMucGVkYW50aWMpIHtcbiAgICAgICAgICBpbmRlbnQgPSAyO1xuICAgICAgICAgIGl0ZW1Db250ZW50cyA9IGxpbmUudHJpbUxlZnQoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpbmRlbnQgPSBjYXBbMl0uc2VhcmNoKC9bXiBdLyk7IC8vIEZpbmQgZmlyc3Qgbm9uLXNwYWNlIGNoYXJcbiAgICAgICAgICBpbmRlbnQgPSBpbmRlbnQgPiA0ID8gMSA6IGluZGVudDsgLy8gVHJlYXQgaW5kZW50ZWQgY29kZSBibG9ja3MgKD4gNCBzcGFjZXMpIGFzIGhhdmluZyBvbmx5IDEgaW5kZW50XG4gICAgICAgICAgaXRlbUNvbnRlbnRzID0gbGluZS5zbGljZShpbmRlbnQpO1xuICAgICAgICAgIGluZGVudCArPSBjYXBbMV0ubGVuZ3RoO1xuICAgICAgICB9XG5cbiAgICAgICAgYmxhbmtMaW5lID0gZmFsc2U7XG5cbiAgICAgICAgaWYgKCFsaW5lICYmIC9eICokLy50ZXN0KG5leHRMaW5lKSkgeyAvLyBJdGVtcyBiZWdpbiB3aXRoIGF0IG1vc3Qgb25lIGJsYW5rIGxpbmVcbiAgICAgICAgICByYXcgKz0gbmV4dExpbmUgKyAnXFxuJztcbiAgICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKG5leHRMaW5lLmxlbmd0aCArIDEpO1xuICAgICAgICAgIGVuZEVhcmx5ID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghZW5kRWFybHkpIHtcbiAgICAgICAgICBjb25zdCBuZXh0QnVsbGV0UmVnZXggPSBuZXcgUmVnRXhwKGBeIHswLCR7TWF0aC5taW4oMywgaW5kZW50IC0gMSl9fSg/OlsqKy1dfFxcXFxkezEsOX1bLildKSgoPzpbIFxcdF1bXlxcXFxuXSopPyg/OlxcXFxufCQpKWApO1xuICAgICAgICAgIGNvbnN0IGhyUmVnZXggPSBuZXcgUmVnRXhwKGBeIHswLCR7TWF0aC5taW4oMywgaW5kZW50IC0gMSl9fSgoPzotICopezMsfXwoPzpfICopezMsfXwoPzpcXFxcKiAqKXszLH0pKD86XFxcXG4rfCQpYCk7XG4gICAgICAgICAgY29uc3QgZmVuY2VzQmVnaW5SZWdleCA9IG5ldyBSZWdFeHAoYF4gezAsJHtNYXRoLm1pbigzLCBpbmRlbnQgLSAxKX19KD86XFxgXFxgXFxgfH5+filgKTtcbiAgICAgICAgICBjb25zdCBoZWFkaW5nQmVnaW5SZWdleCA9IG5ldyBSZWdFeHAoYF4gezAsJHtNYXRoLm1pbigzLCBpbmRlbnQgLSAxKX19I2ApO1xuXG4gICAgICAgICAgLy8gQ2hlY2sgaWYgZm9sbG93aW5nIGxpbmVzIHNob3VsZCBiZSBpbmNsdWRlZCBpbiBMaXN0IEl0ZW1cbiAgICAgICAgICB3aGlsZSAoc3JjKSB7XG4gICAgICAgICAgICByYXdMaW5lID0gc3JjLnNwbGl0KCdcXG4nLCAxKVswXTtcbiAgICAgICAgICAgIG5leHRMaW5lID0gcmF3TGluZTtcblxuICAgICAgICAgICAgLy8gUmUtYWxpZ24gdG8gZm9sbG93IGNvbW1vbm1hcmsgbmVzdGluZyBydWxlc1xuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5wZWRhbnRpYykge1xuICAgICAgICAgICAgICBuZXh0TGluZSA9IG5leHRMaW5lLnJlcGxhY2UoL14gezEsNH0oPz0oIHs0fSkqW14gXSkvZywgJyAgJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEVuZCBsaXN0IGl0ZW0gaWYgZm91bmQgY29kZSBmZW5jZXNcbiAgICAgICAgICAgIGlmIChmZW5jZXNCZWdpblJlZ2V4LnRlc3QobmV4dExpbmUpKSB7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBFbmQgbGlzdCBpdGVtIGlmIGZvdW5kIHN0YXJ0IG9mIG5ldyBoZWFkaW5nXG4gICAgICAgICAgICBpZiAoaGVhZGluZ0JlZ2luUmVnZXgudGVzdChuZXh0TGluZSkpIHtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEVuZCBsaXN0IGl0ZW0gaWYgZm91bmQgc3RhcnQgb2YgbmV3IGJ1bGxldFxuICAgICAgICAgICAgaWYgKG5leHRCdWxsZXRSZWdleC50ZXN0KG5leHRMaW5lKSkge1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gSG9yaXpvbnRhbCBydWxlIGZvdW5kXG4gICAgICAgICAgICBpZiAoaHJSZWdleC50ZXN0KHNyYykpIHtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChuZXh0TGluZS5zZWFyY2goL1teIF0vKSA+PSBpbmRlbnQgfHwgIW5leHRMaW5lLnRyaW0oKSkgeyAvLyBEZWRlbnQgaWYgcG9zc2libGVcbiAgICAgICAgICAgICAgaXRlbUNvbnRlbnRzICs9ICdcXG4nICsgbmV4dExpbmUuc2xpY2UoaW5kZW50KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIG5vdCBlbm91Z2ggaW5kZW50YXRpb25cbiAgICAgICAgICAgICAgaWYgKGJsYW5rTGluZSkge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgLy8gcGFyYWdyYXBoIGNvbnRpbnVhdGlvbiB1bmxlc3MgbGFzdCBsaW5lIHdhcyBhIGRpZmZlcmVudCBibG9jayBsZXZlbCBlbGVtZW50XG4gICAgICAgICAgICAgIGlmIChsaW5lLnNlYXJjaCgvW14gXS8pID49IDQpIHsgLy8gaW5kZW50ZWQgY29kZSBibG9ja1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmIChmZW5jZXNCZWdpblJlZ2V4LnRlc3QobGluZSkpIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAoaGVhZGluZ0JlZ2luUmVnZXgudGVzdChsaW5lKSkge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmIChoclJlZ2V4LnRlc3QobGluZSkpIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGl0ZW1Db250ZW50cyArPSAnXFxuJyArIG5leHRMaW5lO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIWJsYW5rTGluZSAmJiAhbmV4dExpbmUudHJpbSgpKSB7IC8vIENoZWNrIGlmIGN1cnJlbnQgbGluZSBpcyBibGFua1xuICAgICAgICAgICAgICBibGFua0xpbmUgPSB0cnVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByYXcgKz0gcmF3TGluZSArICdcXG4nO1xuICAgICAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhyYXdMaW5lLmxlbmd0aCArIDEpO1xuICAgICAgICAgICAgbGluZSA9IG5leHRMaW5lLnNsaWNlKGluZGVudCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFsaXN0Lmxvb3NlKSB7XG4gICAgICAgICAgLy8gSWYgdGhlIHByZXZpb3VzIGl0ZW0gZW5kZWQgd2l0aCBhIGJsYW5rIGxpbmUsIHRoZSBsaXN0IGlzIGxvb3NlXG4gICAgICAgICAgaWYgKGVuZHNXaXRoQmxhbmtMaW5lKSB7XG4gICAgICAgICAgICBsaXN0Lmxvb3NlID0gdHJ1ZTtcbiAgICAgICAgICB9IGVsc2UgaWYgKC9cXG4gKlxcbiAqJC8udGVzdChyYXcpKSB7XG4gICAgICAgICAgICBlbmRzV2l0aEJsYW5rTGluZSA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2hlY2sgZm9yIHRhc2sgbGlzdCBpdGVtc1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLmdmbSkge1xuICAgICAgICAgIGlzdGFzayA9IC9eXFxbWyB4WF1cXF0gLy5leGVjKGl0ZW1Db250ZW50cyk7XG4gICAgICAgICAgaWYgKGlzdGFzaykge1xuICAgICAgICAgICAgaXNjaGVja2VkID0gaXN0YXNrWzBdICE9PSAnWyBdICc7XG4gICAgICAgICAgICBpdGVtQ29udGVudHMgPSBpdGVtQ29udGVudHMucmVwbGFjZSgvXlxcW1sgeFhdXFxdICsvLCAnJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgbGlzdC5pdGVtcy5wdXNoKHtcbiAgICAgICAgICB0eXBlOiAnbGlzdF9pdGVtJyxcbiAgICAgICAgICByYXcsXG4gICAgICAgICAgdGFzazogISFpc3Rhc2ssXG4gICAgICAgICAgY2hlY2tlZDogaXNjaGVja2VkLFxuICAgICAgICAgIGxvb3NlOiBmYWxzZSxcbiAgICAgICAgICB0ZXh0OiBpdGVtQ29udGVudHNcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbGlzdC5yYXcgKz0gcmF3O1xuICAgICAgfVxuXG4gICAgICAvLyBEbyBub3QgY29uc3VtZSBuZXdsaW5lcyBhdCBlbmQgb2YgZmluYWwgaXRlbS4gQWx0ZXJuYXRpdmVseSwgbWFrZSBpdGVtUmVnZXggKnN0YXJ0KiB3aXRoIGFueSBuZXdsaW5lcyB0byBzaW1wbGlmeS9zcGVlZCB1cCBlbmRzV2l0aEJsYW5rTGluZSBsb2dpY1xuICAgICAgbGlzdC5pdGVtc1tsaXN0Lml0ZW1zLmxlbmd0aCAtIDFdLnJhdyA9IHJhdy50cmltUmlnaHQoKTtcbiAgICAgIGxpc3QuaXRlbXNbbGlzdC5pdGVtcy5sZW5ndGggLSAxXS50ZXh0ID0gaXRlbUNvbnRlbnRzLnRyaW1SaWdodCgpO1xuICAgICAgbGlzdC5yYXcgPSBsaXN0LnJhdy50cmltUmlnaHQoKTtcblxuICAgICAgY29uc3QgbCA9IGxpc3QuaXRlbXMubGVuZ3RoO1xuXG4gICAgICAvLyBJdGVtIGNoaWxkIHRva2VucyBoYW5kbGVkIGhlcmUgYXQgZW5kIGJlY2F1c2Ugd2UgbmVlZGVkIHRvIGhhdmUgdGhlIGZpbmFsIGl0ZW0gdG8gdHJpbSBpdCBmaXJzdFxuICAgICAgZm9yIChpID0gMDsgaSA8IGw7IGkrKykge1xuICAgICAgICB0aGlzLmxleGVyLnN0YXRlLnRvcCA9IGZhbHNlO1xuICAgICAgICBsaXN0Lml0ZW1zW2ldLnRva2VucyA9IHRoaXMubGV4ZXIuYmxvY2tUb2tlbnMobGlzdC5pdGVtc1tpXS50ZXh0LCBbXSk7XG5cbiAgICAgICAgaWYgKCFsaXN0Lmxvb3NlKSB7XG4gICAgICAgICAgLy8gQ2hlY2sgaWYgbGlzdCBzaG91bGQgYmUgbG9vc2VcbiAgICAgICAgICBjb25zdCBzcGFjZXJzID0gbGlzdC5pdGVtc1tpXS50b2tlbnMuZmlsdGVyKHQgPT4gdC50eXBlID09PSAnc3BhY2UnKTtcbiAgICAgICAgICBjb25zdCBoYXNNdWx0aXBsZUxpbmVCcmVha3MgPSBzcGFjZXJzLmxlbmd0aCA+IDAgJiYgc3BhY2Vycy5zb21lKHQgPT4gL1xcbi4qXFxuLy50ZXN0KHQucmF3KSk7XG5cbiAgICAgICAgICBsaXN0Lmxvb3NlID0gaGFzTXVsdGlwbGVMaW5lQnJlYWtzO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFNldCBhbGwgaXRlbXMgdG8gbG9vc2UgaWYgbGlzdCBpcyBsb29zZVxuICAgICAgaWYgKGxpc3QubG9vc2UpIHtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgIGxpc3QuaXRlbXNbaV0ubG9vc2UgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBsaXN0O1xuICAgIH1cbiAgfVxuXG4gIGh0bWwoc3JjKSB7XG4gICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5ibG9jay5odG1sLmV4ZWMoc3JjKTtcbiAgICBpZiAoY2FwKSB7XG4gICAgICBjb25zdCB0b2tlbiA9IHtcbiAgICAgICAgdHlwZTogJ2h0bWwnLFxuICAgICAgICByYXc6IGNhcFswXSxcbiAgICAgICAgcHJlOiAhdGhpcy5vcHRpb25zLnNhbml0aXplclxuICAgICAgICAgICYmIChjYXBbMV0gPT09ICdwcmUnIHx8IGNhcFsxXSA9PT0gJ3NjcmlwdCcgfHwgY2FwWzFdID09PSAnc3R5bGUnKSxcbiAgICAgICAgdGV4dDogY2FwWzBdXG4gICAgICB9O1xuICAgICAgaWYgKHRoaXMub3B0aW9ucy5zYW5pdGl6ZSkge1xuICAgICAgICBjb25zdCB0ZXh0ID0gdGhpcy5vcHRpb25zLnNhbml0aXplciA/IHRoaXMub3B0aW9ucy5zYW5pdGl6ZXIoY2FwWzBdKSA6IGVzY2FwZShjYXBbMF0pO1xuICAgICAgICB0b2tlbi50eXBlID0gJ3BhcmFncmFwaCc7XG4gICAgICAgIHRva2VuLnRleHQgPSB0ZXh0O1xuICAgICAgICB0b2tlbi50b2tlbnMgPSB0aGlzLmxleGVyLmlubGluZSh0ZXh0KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0b2tlbjtcbiAgICB9XG4gIH1cblxuICBkZWYoc3JjKSB7XG4gICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5ibG9jay5kZWYuZXhlYyhzcmMpO1xuICAgIGlmIChjYXApIHtcbiAgICAgIGNvbnN0IHRhZyA9IGNhcFsxXS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL1xccysvZywgJyAnKTtcbiAgICAgIGNvbnN0IGhyZWYgPSBjYXBbMl0gPyBjYXBbMl0ucmVwbGFjZSgvXjwoLiopPiQvLCAnJDEnKS5yZXBsYWNlKHRoaXMucnVsZXMuaW5saW5lLl9lc2NhcGVzLCAnJDEnKSA6ICcnO1xuICAgICAgY29uc3QgdGl0bGUgPSBjYXBbM10gPyBjYXBbM10uc3Vic3RyaW5nKDEsIGNhcFszXS5sZW5ndGggLSAxKS5yZXBsYWNlKHRoaXMucnVsZXMuaW5saW5lLl9lc2NhcGVzLCAnJDEnKSA6IGNhcFszXTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdkZWYnLFxuICAgICAgICB0YWcsXG4gICAgICAgIHJhdzogY2FwWzBdLFxuICAgICAgICBocmVmLFxuICAgICAgICB0aXRsZVxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICB0YWJsZShzcmMpIHtcbiAgICBjb25zdCBjYXAgPSB0aGlzLnJ1bGVzLmJsb2NrLnRhYmxlLmV4ZWMoc3JjKTtcbiAgICBpZiAoY2FwKSB7XG4gICAgICBjb25zdCBpdGVtID0ge1xuICAgICAgICB0eXBlOiAndGFibGUnLFxuICAgICAgICBoZWFkZXI6IHNwbGl0Q2VsbHMoY2FwWzFdKS5tYXAoYyA9PiB7IHJldHVybiB7IHRleHQ6IGMgfTsgfSksXG4gICAgICAgIGFsaWduOiBjYXBbMl0ucmVwbGFjZSgvXiAqfFxcfCAqJC9nLCAnJykuc3BsaXQoLyAqXFx8ICovKSxcbiAgICAgICAgcm93czogY2FwWzNdICYmIGNhcFszXS50cmltKCkgPyBjYXBbM10ucmVwbGFjZSgvXFxuWyBcXHRdKiQvLCAnJykuc3BsaXQoJ1xcbicpIDogW11cbiAgICAgIH07XG5cbiAgICAgIGlmIChpdGVtLmhlYWRlci5sZW5ndGggPT09IGl0ZW0uYWxpZ24ubGVuZ3RoKSB7XG4gICAgICAgIGl0ZW0ucmF3ID0gY2FwWzBdO1xuXG4gICAgICAgIGxldCBsID0gaXRlbS5hbGlnbi5sZW5ndGg7XG4gICAgICAgIGxldCBpLCBqLCBrLCByb3c7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICBpZiAoL14gKi0rOiAqJC8udGVzdChpdGVtLmFsaWduW2ldKSkge1xuICAgICAgICAgICAgaXRlbS5hbGlnbltpXSA9ICdyaWdodCc7XG4gICAgICAgICAgfSBlbHNlIGlmICgvXiAqOi0rOiAqJC8udGVzdChpdGVtLmFsaWduW2ldKSkge1xuICAgICAgICAgICAgaXRlbS5hbGlnbltpXSA9ICdjZW50ZXInO1xuICAgICAgICAgIH0gZWxzZSBpZiAoL14gKjotKyAqJC8udGVzdChpdGVtLmFsaWduW2ldKSkge1xuICAgICAgICAgICAgaXRlbS5hbGlnbltpXSA9ICdsZWZ0JztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaXRlbS5hbGlnbltpXSA9IG51bGw7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgbCA9IGl0ZW0ucm93cy5sZW5ndGg7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICBpdGVtLnJvd3NbaV0gPSBzcGxpdENlbGxzKGl0ZW0ucm93c1tpXSwgaXRlbS5oZWFkZXIubGVuZ3RoKS5tYXAoYyA9PiB7IHJldHVybiB7IHRleHQ6IGMgfTsgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBwYXJzZSBjaGlsZCB0b2tlbnMgaW5zaWRlIGhlYWRlcnMgYW5kIGNlbGxzXG5cbiAgICAgICAgLy8gaGVhZGVyIGNoaWxkIHRva2Vuc1xuICAgICAgICBsID0gaXRlbS5oZWFkZXIubGVuZ3RoO1xuICAgICAgICBmb3IgKGogPSAwOyBqIDwgbDsgaisrKSB7XG4gICAgICAgICAgaXRlbS5oZWFkZXJbal0udG9rZW5zID0gdGhpcy5sZXhlci5pbmxpbmUoaXRlbS5oZWFkZXJbal0udGV4dCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBjZWxsIGNoaWxkIHRva2Vuc1xuICAgICAgICBsID0gaXRlbS5yb3dzLmxlbmd0aDtcbiAgICAgICAgZm9yIChqID0gMDsgaiA8IGw7IGorKykge1xuICAgICAgICAgIHJvdyA9IGl0ZW0ucm93c1tqXTtcbiAgICAgICAgICBmb3IgKGsgPSAwOyBrIDwgcm93Lmxlbmd0aDsgaysrKSB7XG4gICAgICAgICAgICByb3dba10udG9rZW5zID0gdGhpcy5sZXhlci5pbmxpbmUocm93W2tdLnRleHQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBpdGVtO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGxoZWFkaW5nKHNyYykge1xuICAgIGNvbnN0IGNhcCA9IHRoaXMucnVsZXMuYmxvY2subGhlYWRpbmcuZXhlYyhzcmMpO1xuICAgIGlmIChjYXApIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdoZWFkaW5nJyxcbiAgICAgICAgcmF3OiBjYXBbMF0sXG4gICAgICAgIGRlcHRoOiBjYXBbMl0uY2hhckF0KDApID09PSAnPScgPyAxIDogMixcbiAgICAgICAgdGV4dDogY2FwWzFdLFxuICAgICAgICB0b2tlbnM6IHRoaXMubGV4ZXIuaW5saW5lKGNhcFsxXSlcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgcGFyYWdyYXBoKHNyYykge1xuICAgIGNvbnN0IGNhcCA9IHRoaXMucnVsZXMuYmxvY2sucGFyYWdyYXBoLmV4ZWMoc3JjKTtcbiAgICBpZiAoY2FwKSB7XG4gICAgICBjb25zdCB0ZXh0ID0gY2FwWzFdLmNoYXJBdChjYXBbMV0ubGVuZ3RoIC0gMSkgPT09ICdcXG4nXG4gICAgICAgID8gY2FwWzFdLnNsaWNlKDAsIC0xKVxuICAgICAgICA6IGNhcFsxXTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdwYXJhZ3JhcGgnLFxuICAgICAgICByYXc6IGNhcFswXSxcbiAgICAgICAgdGV4dCxcbiAgICAgICAgdG9rZW5zOiB0aGlzLmxleGVyLmlubGluZSh0ZXh0KVxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICB0ZXh0KHNyYykge1xuICAgIGNvbnN0IGNhcCA9IHRoaXMucnVsZXMuYmxvY2sudGV4dC5leGVjKHNyYyk7XG4gICAgaWYgKGNhcCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ3RleHQnLFxuICAgICAgICByYXc6IGNhcFswXSxcbiAgICAgICAgdGV4dDogY2FwWzBdLFxuICAgICAgICB0b2tlbnM6IHRoaXMubGV4ZXIuaW5saW5lKGNhcFswXSlcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgZXNjYXBlKHNyYykge1xuICAgIGNvbnN0IGNhcCA9IHRoaXMucnVsZXMuaW5saW5lLmVzY2FwZS5leGVjKHNyYyk7XG4gICAgaWYgKGNhcCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ2VzY2FwZScsXG4gICAgICAgIHJhdzogY2FwWzBdLFxuICAgICAgICB0ZXh0OiBlc2NhcGUoY2FwWzFdKVxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICB0YWcoc3JjKSB7XG4gICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5pbmxpbmUudGFnLmV4ZWMoc3JjKTtcbiAgICBpZiAoY2FwKSB7XG4gICAgICBpZiAoIXRoaXMubGV4ZXIuc3RhdGUuaW5MaW5rICYmIC9ePGEgL2kudGVzdChjYXBbMF0pKSB7XG4gICAgICAgIHRoaXMubGV4ZXIuc3RhdGUuaW5MaW5rID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5sZXhlci5zdGF0ZS5pbkxpbmsgJiYgL148XFwvYT4vaS50ZXN0KGNhcFswXSkpIHtcbiAgICAgICAgdGhpcy5sZXhlci5zdGF0ZS5pbkxpbmsgPSBmYWxzZTtcbiAgICAgIH1cbiAgICAgIGlmICghdGhpcy5sZXhlci5zdGF0ZS5pblJhd0Jsb2NrICYmIC9ePChwcmV8Y29kZXxrYmR8c2NyaXB0KShcXHN8PikvaS50ZXN0KGNhcFswXSkpIHtcbiAgICAgICAgdGhpcy5sZXhlci5zdGF0ZS5pblJhd0Jsb2NrID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSBpZiAodGhpcy5sZXhlci5zdGF0ZS5pblJhd0Jsb2NrICYmIC9ePFxcLyhwcmV8Y29kZXxrYmR8c2NyaXB0KShcXHN8PikvaS50ZXN0KGNhcFswXSkpIHtcbiAgICAgICAgdGhpcy5sZXhlci5zdGF0ZS5pblJhd0Jsb2NrID0gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6IHRoaXMub3B0aW9ucy5zYW5pdGl6ZVxuICAgICAgICAgID8gJ3RleHQnXG4gICAgICAgICAgOiAnaHRtbCcsXG4gICAgICAgIHJhdzogY2FwWzBdLFxuICAgICAgICBpbkxpbms6IHRoaXMubGV4ZXIuc3RhdGUuaW5MaW5rLFxuICAgICAgICBpblJhd0Jsb2NrOiB0aGlzLmxleGVyLnN0YXRlLmluUmF3QmxvY2ssXG4gICAgICAgIHRleHQ6IHRoaXMub3B0aW9ucy5zYW5pdGl6ZVxuICAgICAgICAgID8gKHRoaXMub3B0aW9ucy5zYW5pdGl6ZXJcbiAgICAgICAgICAgID8gdGhpcy5vcHRpb25zLnNhbml0aXplcihjYXBbMF0pXG4gICAgICAgICAgICA6IGVzY2FwZShjYXBbMF0pKVxuICAgICAgICAgIDogY2FwWzBdXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIGxpbmsoc3JjKSB7XG4gICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5pbmxpbmUubGluay5leGVjKHNyYyk7XG4gICAgaWYgKGNhcCkge1xuICAgICAgY29uc3QgdHJpbW1lZFVybCA9IGNhcFsyXS50cmltKCk7XG4gICAgICBpZiAoIXRoaXMub3B0aW9ucy5wZWRhbnRpYyAmJiAvXjwvLnRlc3QodHJpbW1lZFVybCkpIHtcbiAgICAgICAgLy8gY29tbW9ubWFyayByZXF1aXJlcyBtYXRjaGluZyBhbmdsZSBicmFja2V0c1xuICAgICAgICBpZiAoISgvPiQvLnRlc3QodHJpbW1lZFVybCkpKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZW5kaW5nIGFuZ2xlIGJyYWNrZXQgY2Fubm90IGJlIGVzY2FwZWRcbiAgICAgICAgY29uc3QgcnRyaW1TbGFzaCA9IHJ0cmltKHRyaW1tZWRVcmwuc2xpY2UoMCwgLTEpLCAnXFxcXCcpO1xuICAgICAgICBpZiAoKHRyaW1tZWRVcmwubGVuZ3RoIC0gcnRyaW1TbGFzaC5sZW5ndGgpICUgMiA9PT0gMCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gZmluZCBjbG9zaW5nIHBhcmVudGhlc2lzXG4gICAgICAgIGNvbnN0IGxhc3RQYXJlbkluZGV4ID0gZmluZENsb3NpbmdCcmFja2V0KGNhcFsyXSwgJygpJyk7XG4gICAgICAgIGlmIChsYXN0UGFyZW5JbmRleCA+IC0xKSB7XG4gICAgICAgICAgY29uc3Qgc3RhcnQgPSBjYXBbMF0uaW5kZXhPZignIScpID09PSAwID8gNSA6IDQ7XG4gICAgICAgICAgY29uc3QgbGlua0xlbiA9IHN0YXJ0ICsgY2FwWzFdLmxlbmd0aCArIGxhc3RQYXJlbkluZGV4O1xuICAgICAgICAgIGNhcFsyXSA9IGNhcFsyXS5zdWJzdHJpbmcoMCwgbGFzdFBhcmVuSW5kZXgpO1xuICAgICAgICAgIGNhcFswXSA9IGNhcFswXS5zdWJzdHJpbmcoMCwgbGlua0xlbikudHJpbSgpO1xuICAgICAgICAgIGNhcFszXSA9ICcnO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBsZXQgaHJlZiA9IGNhcFsyXTtcbiAgICAgIGxldCB0aXRsZSA9ICcnO1xuICAgICAgaWYgKHRoaXMub3B0aW9ucy5wZWRhbnRpYykge1xuICAgICAgICAvLyBzcGxpdCBwZWRhbnRpYyBocmVmIGFuZCB0aXRsZVxuICAgICAgICBjb25zdCBsaW5rID0gL14oW14nXCJdKlteXFxzXSlcXHMrKFsnXCJdKSguKilcXDIvLmV4ZWMoaHJlZik7XG5cbiAgICAgICAgaWYgKGxpbmspIHtcbiAgICAgICAgICBocmVmID0gbGlua1sxXTtcbiAgICAgICAgICB0aXRsZSA9IGxpbmtbM107XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRpdGxlID0gY2FwWzNdID8gY2FwWzNdLnNsaWNlKDEsIC0xKSA6ICcnO1xuICAgICAgfVxuXG4gICAgICBocmVmID0gaHJlZi50cmltKCk7XG4gICAgICBpZiAoL148Ly50ZXN0KGhyZWYpKSB7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMucGVkYW50aWMgJiYgISgvPiQvLnRlc3QodHJpbW1lZFVybCkpKSB7XG4gICAgICAgICAgLy8gcGVkYW50aWMgYWxsb3dzIHN0YXJ0aW5nIGFuZ2xlIGJyYWNrZXQgd2l0aG91dCBlbmRpbmcgYW5nbGUgYnJhY2tldFxuICAgICAgICAgIGhyZWYgPSBocmVmLnNsaWNlKDEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGhyZWYgPSBocmVmLnNsaWNlKDEsIC0xKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIG91dHB1dExpbmsoY2FwLCB7XG4gICAgICAgIGhyZWY6IGhyZWYgPyBocmVmLnJlcGxhY2UodGhpcy5ydWxlcy5pbmxpbmUuX2VzY2FwZXMsICckMScpIDogaHJlZixcbiAgICAgICAgdGl0bGU6IHRpdGxlID8gdGl0bGUucmVwbGFjZSh0aGlzLnJ1bGVzLmlubGluZS5fZXNjYXBlcywgJyQxJykgOiB0aXRsZVxuICAgICAgfSwgY2FwWzBdLCB0aGlzLmxleGVyKTtcbiAgICB9XG4gIH1cblxuICByZWZsaW5rKHNyYywgbGlua3MpIHtcbiAgICBsZXQgY2FwO1xuICAgIGlmICgoY2FwID0gdGhpcy5ydWxlcy5pbmxpbmUucmVmbGluay5leGVjKHNyYykpXG4gICAgICAgIHx8IChjYXAgPSB0aGlzLnJ1bGVzLmlubGluZS5ub2xpbmsuZXhlYyhzcmMpKSkge1xuICAgICAgbGV0IGxpbmsgPSAoY2FwWzJdIHx8IGNhcFsxXSkucmVwbGFjZSgvXFxzKy9nLCAnICcpO1xuICAgICAgbGluayA9IGxpbmtzW2xpbmsudG9Mb3dlckNhc2UoKV07XG4gICAgICBpZiAoIWxpbmspIHtcbiAgICAgICAgY29uc3QgdGV4dCA9IGNhcFswXS5jaGFyQXQoMCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgdHlwZTogJ3RleHQnLFxuICAgICAgICAgIHJhdzogdGV4dCxcbiAgICAgICAgICB0ZXh0XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICByZXR1cm4gb3V0cHV0TGluayhjYXAsIGxpbmssIGNhcFswXSwgdGhpcy5sZXhlcik7XG4gICAgfVxuICB9XG5cbiAgZW1TdHJvbmcoc3JjLCBtYXNrZWRTcmMsIHByZXZDaGFyID0gJycpIHtcbiAgICBsZXQgbWF0Y2ggPSB0aGlzLnJ1bGVzLmlubGluZS5lbVN0cm9uZy5sRGVsaW0uZXhlYyhzcmMpO1xuICAgIGlmICghbWF0Y2gpIHJldHVybjtcblxuICAgIC8vIF8gY2FuJ3QgYmUgYmV0d2VlbiB0d28gYWxwaGFudW1lcmljcy4gXFxwe0x9XFxwe059IGluY2x1ZGVzIG5vbi1lbmdsaXNoIGFscGhhYmV0L251bWJlcnMgYXMgd2VsbFxuICAgIGlmIChtYXRjaFszXSAmJiBwcmV2Q2hhci5tYXRjaCgvW1xccHtMfVxccHtOfV0vdSkpIHJldHVybjtcblxuICAgIGNvbnN0IG5leHRDaGFyID0gbWF0Y2hbMV0gfHwgbWF0Y2hbMl0gfHwgJyc7XG5cbiAgICBpZiAoIW5leHRDaGFyIHx8IChuZXh0Q2hhciAmJiAocHJldkNoYXIgPT09ICcnIHx8IHRoaXMucnVsZXMuaW5saW5lLnB1bmN0dWF0aW9uLmV4ZWMocHJldkNoYXIpKSkpIHtcbiAgICAgIGNvbnN0IGxMZW5ndGggPSBtYXRjaFswXS5sZW5ndGggLSAxO1xuICAgICAgbGV0IHJEZWxpbSwgckxlbmd0aCwgZGVsaW1Ub3RhbCA9IGxMZW5ndGgsIG1pZERlbGltVG90YWwgPSAwO1xuXG4gICAgICBjb25zdCBlbmRSZWcgPSBtYXRjaFswXVswXSA9PT0gJyonID8gdGhpcy5ydWxlcy5pbmxpbmUuZW1TdHJvbmcuckRlbGltQXN0IDogdGhpcy5ydWxlcy5pbmxpbmUuZW1TdHJvbmcuckRlbGltVW5kO1xuICAgICAgZW5kUmVnLmxhc3RJbmRleCA9IDA7XG5cbiAgICAgIC8vIENsaXAgbWFza2VkU3JjIHRvIHNhbWUgc2VjdGlvbiBvZiBzdHJpbmcgYXMgc3JjIChtb3ZlIHRvIGxleGVyPylcbiAgICAgIG1hc2tlZFNyYyA9IG1hc2tlZFNyYy5zbGljZSgtMSAqIHNyYy5sZW5ndGggKyBsTGVuZ3RoKTtcblxuICAgICAgd2hpbGUgKChtYXRjaCA9IGVuZFJlZy5leGVjKG1hc2tlZFNyYykpICE9IG51bGwpIHtcbiAgICAgICAgckRlbGltID0gbWF0Y2hbMV0gfHwgbWF0Y2hbMl0gfHwgbWF0Y2hbM10gfHwgbWF0Y2hbNF0gfHwgbWF0Y2hbNV0gfHwgbWF0Y2hbNl07XG5cbiAgICAgICAgaWYgKCFyRGVsaW0pIGNvbnRpbnVlOyAvLyBza2lwIHNpbmdsZSAqIGluIF9fYWJjKmFiY19fXG5cbiAgICAgICAgckxlbmd0aCA9IHJEZWxpbS5sZW5ndGg7XG5cbiAgICAgICAgaWYgKG1hdGNoWzNdIHx8IG1hdGNoWzRdKSB7IC8vIGZvdW5kIGFub3RoZXIgTGVmdCBEZWxpbVxuICAgICAgICAgIGRlbGltVG90YWwgKz0gckxlbmd0aDtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfSBlbHNlIGlmIChtYXRjaFs1XSB8fCBtYXRjaFs2XSkgeyAvLyBlaXRoZXIgTGVmdCBvciBSaWdodCBEZWxpbVxuICAgICAgICAgIGlmIChsTGVuZ3RoICUgMyAmJiAhKChsTGVuZ3RoICsgckxlbmd0aCkgJSAzKSkge1xuICAgICAgICAgICAgbWlkRGVsaW1Ub3RhbCArPSByTGVuZ3RoO1xuICAgICAgICAgICAgY29udGludWU7IC8vIENvbW1vbk1hcmsgRW1waGFzaXMgUnVsZXMgOS0xMFxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGRlbGltVG90YWwgLT0gckxlbmd0aDtcblxuICAgICAgICBpZiAoZGVsaW1Ub3RhbCA+IDApIGNvbnRpbnVlOyAvLyBIYXZlbid0IGZvdW5kIGVub3VnaCBjbG9zaW5nIGRlbGltaXRlcnNcblxuICAgICAgICAvLyBSZW1vdmUgZXh0cmEgY2hhcmFjdGVycy4gKmEqKiogLT4gKmEqXG4gICAgICAgIHJMZW5ndGggPSBNYXRoLm1pbihyTGVuZ3RoLCByTGVuZ3RoICsgZGVsaW1Ub3RhbCArIG1pZERlbGltVG90YWwpO1xuXG4gICAgICAgIGNvbnN0IHJhdyA9IHNyYy5zbGljZSgwLCBsTGVuZ3RoICsgbWF0Y2guaW5kZXggKyAobWF0Y2hbMF0ubGVuZ3RoIC0gckRlbGltLmxlbmd0aCkgKyByTGVuZ3RoKTtcblxuICAgICAgICAvLyBDcmVhdGUgYGVtYCBpZiBzbWFsbGVzdCBkZWxpbWl0ZXIgaGFzIG9kZCBjaGFyIGNvdW50LiAqYSoqKlxuICAgICAgICBpZiAoTWF0aC5taW4obExlbmd0aCwgckxlbmd0aCkgJSAyKSB7XG4gICAgICAgICAgY29uc3QgdGV4dCA9IHJhdy5zbGljZSgxLCAtMSk7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHR5cGU6ICdlbScsXG4gICAgICAgICAgICByYXcsXG4gICAgICAgICAgICB0ZXh0LFxuICAgICAgICAgICAgdG9rZW5zOiB0aGlzLmxleGVyLmlubGluZVRva2Vucyh0ZXh0KVxuICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDcmVhdGUgJ3N0cm9uZycgaWYgc21hbGxlc3QgZGVsaW1pdGVyIGhhcyBldmVuIGNoYXIgY291bnQuICoqYSoqKlxuICAgICAgICBjb25zdCB0ZXh0ID0gcmF3LnNsaWNlKDIsIC0yKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB0eXBlOiAnc3Ryb25nJyxcbiAgICAgICAgICByYXcsXG4gICAgICAgICAgdGV4dCxcbiAgICAgICAgICB0b2tlbnM6IHRoaXMubGV4ZXIuaW5saW5lVG9rZW5zKHRleHQpXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgY29kZXNwYW4oc3JjKSB7XG4gICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5pbmxpbmUuY29kZS5leGVjKHNyYyk7XG4gICAgaWYgKGNhcCkge1xuICAgICAgbGV0IHRleHQgPSBjYXBbMl0ucmVwbGFjZSgvXFxuL2csICcgJyk7XG4gICAgICBjb25zdCBoYXNOb25TcGFjZUNoYXJzID0gL1teIF0vLnRlc3QodGV4dCk7XG4gICAgICBjb25zdCBoYXNTcGFjZUNoYXJzT25Cb3RoRW5kcyA9IC9eIC8udGVzdCh0ZXh0KSAmJiAvICQvLnRlc3QodGV4dCk7XG4gICAgICBpZiAoaGFzTm9uU3BhY2VDaGFycyAmJiBoYXNTcGFjZUNoYXJzT25Cb3RoRW5kcykge1xuICAgICAgICB0ZXh0ID0gdGV4dC5zdWJzdHJpbmcoMSwgdGV4dC5sZW5ndGggLSAxKTtcbiAgICAgIH1cbiAgICAgIHRleHQgPSBlc2NhcGUodGV4dCwgdHJ1ZSk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAnY29kZXNwYW4nLFxuICAgICAgICByYXc6IGNhcFswXSxcbiAgICAgICAgdGV4dFxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICBicihzcmMpIHtcbiAgICBjb25zdCBjYXAgPSB0aGlzLnJ1bGVzLmlubGluZS5ici5leGVjKHNyYyk7XG4gICAgaWYgKGNhcCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ2JyJyxcbiAgICAgICAgcmF3OiBjYXBbMF1cbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgZGVsKHNyYykge1xuICAgIGNvbnN0IGNhcCA9IHRoaXMucnVsZXMuaW5saW5lLmRlbC5leGVjKHNyYyk7XG4gICAgaWYgKGNhcCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ2RlbCcsXG4gICAgICAgIHJhdzogY2FwWzBdLFxuICAgICAgICB0ZXh0OiBjYXBbMl0sXG4gICAgICAgIHRva2VuczogdGhpcy5sZXhlci5pbmxpbmVUb2tlbnMoY2FwWzJdKVxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICBhdXRvbGluayhzcmMsIG1hbmdsZSkge1xuICAgIGNvbnN0IGNhcCA9IHRoaXMucnVsZXMuaW5saW5lLmF1dG9saW5rLmV4ZWMoc3JjKTtcbiAgICBpZiAoY2FwKSB7XG4gICAgICBsZXQgdGV4dCwgaHJlZjtcbiAgICAgIGlmIChjYXBbMl0gPT09ICdAJykge1xuICAgICAgICB0ZXh0ID0gZXNjYXBlKHRoaXMub3B0aW9ucy5tYW5nbGUgPyBtYW5nbGUoY2FwWzFdKSA6IGNhcFsxXSk7XG4gICAgICAgIGhyZWYgPSAnbWFpbHRvOicgKyB0ZXh0O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGV4dCA9IGVzY2FwZShjYXBbMV0pO1xuICAgICAgICBocmVmID0gdGV4dDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ2xpbmsnLFxuICAgICAgICByYXc6IGNhcFswXSxcbiAgICAgICAgdGV4dCxcbiAgICAgICAgaHJlZixcbiAgICAgICAgdG9rZW5zOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgdHlwZTogJ3RleHQnLFxuICAgICAgICAgICAgcmF3OiB0ZXh0LFxuICAgICAgICAgICAgdGV4dFxuICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICB1cmwoc3JjLCBtYW5nbGUpIHtcbiAgICBsZXQgY2FwO1xuICAgIGlmIChjYXAgPSB0aGlzLnJ1bGVzLmlubGluZS51cmwuZXhlYyhzcmMpKSB7XG4gICAgICBsZXQgdGV4dCwgaHJlZjtcbiAgICAgIGlmIChjYXBbMl0gPT09ICdAJykge1xuICAgICAgICB0ZXh0ID0gZXNjYXBlKHRoaXMub3B0aW9ucy5tYW5nbGUgPyBtYW5nbGUoY2FwWzBdKSA6IGNhcFswXSk7XG4gICAgICAgIGhyZWYgPSAnbWFpbHRvOicgKyB0ZXh0O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gZG8gZXh0ZW5kZWQgYXV0b2xpbmsgcGF0aCB2YWxpZGF0aW9uXG4gICAgICAgIGxldCBwcmV2Q2FwWmVybztcbiAgICAgICAgZG8ge1xuICAgICAgICAgIHByZXZDYXBaZXJvID0gY2FwWzBdO1xuICAgICAgICAgIGNhcFswXSA9IHRoaXMucnVsZXMuaW5saW5lLl9iYWNrcGVkYWwuZXhlYyhjYXBbMF0pWzBdO1xuICAgICAgICB9IHdoaWxlIChwcmV2Q2FwWmVybyAhPT0gY2FwWzBdKTtcbiAgICAgICAgdGV4dCA9IGVzY2FwZShjYXBbMF0pO1xuICAgICAgICBpZiAoY2FwWzFdID09PSAnd3d3LicpIHtcbiAgICAgICAgICBocmVmID0gJ2h0dHA6Ly8nICsgY2FwWzBdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGhyZWYgPSBjYXBbMF07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdsaW5rJyxcbiAgICAgICAgcmF3OiBjYXBbMF0sXG4gICAgICAgIHRleHQsXG4gICAgICAgIGhyZWYsXG4gICAgICAgIHRva2VuczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgICAgICAgIHJhdzogdGV4dCxcbiAgICAgICAgICAgIHRleHRcbiAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgaW5saW5lVGV4dChzcmMsIHNtYXJ0eXBhbnRzKSB7XG4gICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5pbmxpbmUudGV4dC5leGVjKHNyYyk7XG4gICAgaWYgKGNhcCkge1xuICAgICAgbGV0IHRleHQ7XG4gICAgICBpZiAodGhpcy5sZXhlci5zdGF0ZS5pblJhd0Jsb2NrKSB7XG4gICAgICAgIHRleHQgPSB0aGlzLm9wdGlvbnMuc2FuaXRpemUgPyAodGhpcy5vcHRpb25zLnNhbml0aXplciA/IHRoaXMub3B0aW9ucy5zYW5pdGl6ZXIoY2FwWzBdKSA6IGVzY2FwZShjYXBbMF0pKSA6IGNhcFswXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRleHQgPSBlc2NhcGUodGhpcy5vcHRpb25zLnNtYXJ0eXBhbnRzID8gc21hcnR5cGFudHMoY2FwWzBdKSA6IGNhcFswXSk7XG4gICAgICB9XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAndGV4dCcsXG4gICAgICAgIHJhdzogY2FwWzBdLFxuICAgICAgICB0ZXh0XG4gICAgICB9O1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEJsb2NrLUxldmVsIEdyYW1tYXJcbiAqL1xuY29uc3QgYmxvY2sgPSB7XG4gIG5ld2xpbmU6IC9eKD86ICooPzpcXG58JCkpKy8sXG4gIGNvZGU6IC9eKCB7NH1bXlxcbl0rKD86XFxuKD86ICooPzpcXG58JCkpKik/KSsvLFxuICBmZW5jZXM6IC9eIHswLDN9KGB7Myx9KD89W15gXFxuXSooPzpcXG58JCkpfH57Myx9KShbXlxcbl0qKSg/OlxcbnwkKSg/OnwoW1xcc1xcU10qPykoPzpcXG58JCkpKD86IHswLDN9XFwxW35gXSogKig/PVxcbnwkKXwkKS8sXG4gIGhyOiAvXiB7MCwzfSgoPzotW1xcdCBdKil7Myx9fCg/Ol9bIFxcdF0qKXszLH18KD86XFwqWyBcXHRdKil7Myx9KSg/Olxcbit8JCkvLFxuICBoZWFkaW5nOiAvXiB7MCwzfSgjezEsNn0pKD89XFxzfCQpKC4qKSg/Olxcbit8JCkvLFxuICBibG9ja3F1b3RlOiAvXiggezAsM30+ID8ocGFyYWdyYXBofFteXFxuXSopKD86XFxufCQpKSsvLFxuICBsaXN0OiAvXiggezAsM31idWxsKShbIFxcdF1bXlxcbl0rPyk/KD86XFxufCQpLyxcbiAgaHRtbDogJ14gezAsM30oPzonIC8vIG9wdGlvbmFsIGluZGVudGF0aW9uXG4gICAgKyAnPChzY3JpcHR8cHJlfHN0eWxlfHRleHRhcmVhKVtcXFxccz5dW1xcXFxzXFxcXFNdKj8oPzo8L1xcXFwxPlteXFxcXG5dKlxcXFxuK3wkKScgLy8gKDEpXG4gICAgKyAnfGNvbW1lbnRbXlxcXFxuXSooXFxcXG4rfCQpJyAvLyAoMilcbiAgICArICd8PFxcXFw/W1xcXFxzXFxcXFNdKj8oPzpcXFxcPz5cXFxcbip8JCknIC8vICgzKVxuICAgICsgJ3w8IVtBLVpdW1xcXFxzXFxcXFNdKj8oPzo+XFxcXG4qfCQpJyAvLyAoNClcbiAgICArICd8PCFcXFxcW0NEQVRBXFxcXFtbXFxcXHNcXFxcU10qPyg/OlxcXFxdXFxcXF0+XFxcXG4qfCQpJyAvLyAoNSlcbiAgICArICd8PC8/KHRhZykoPzogK3xcXFxcbnwvPz4pW1xcXFxzXFxcXFNdKj8oPzooPzpcXFxcbiAqKStcXFxcbnwkKScgLy8gKDYpXG4gICAgKyAnfDwoPyFzY3JpcHR8cHJlfHN0eWxlfHRleHRhcmVhKShbYS16XVtcXFxcdy1dKikoPzphdHRyaWJ1dGUpKj8gKi8/Pig/PVsgXFxcXHRdKig/OlxcXFxufCQpKVtcXFxcc1xcXFxTXSo/KD86KD86XFxcXG4gKikrXFxcXG58JCknIC8vICg3KSBvcGVuIHRhZ1xuICAgICsgJ3w8Lyg/IXNjcmlwdHxwcmV8c3R5bGV8dGV4dGFyZWEpW2Etel1bXFxcXHctXSpcXFxccyo+KD89WyBcXFxcdF0qKD86XFxcXG58JCkpW1xcXFxzXFxcXFNdKj8oPzooPzpcXFxcbiAqKStcXFxcbnwkKScgLy8gKDcpIGNsb3NpbmcgdGFnXG4gICAgKyAnKScsXG4gIGRlZjogL14gezAsM31cXFsobGFiZWwpXFxdOiAqKD86XFxuICopPyhbXjxcXHNdW15cXHNdKnw8Lio/PikoPzooPzogKyg/OlxcbiAqKT98ICpcXG4gKikodGl0bGUpKT8gKig/Olxcbit8JCkvLFxuICB0YWJsZTogbm9vcFRlc3QsXG4gIGxoZWFkaW5nOiAvXigoPzoufFxcbig/IVxcbikpKz8pXFxuIHswLDN9KD0rfC0rKSAqKD86XFxuK3wkKS8sXG4gIC8vIHJlZ2V4IHRlbXBsYXRlLCBwbGFjZWhvbGRlcnMgd2lsbCBiZSByZXBsYWNlZCBhY2NvcmRpbmcgdG8gZGlmZmVyZW50IHBhcmFncmFwaFxuICAvLyBpbnRlcnJ1cHRpb24gcnVsZXMgb2YgY29tbW9ubWFyayBhbmQgdGhlIG9yaWdpbmFsIG1hcmtkb3duIHNwZWM6XG4gIF9wYXJhZ3JhcGg6IC9eKFteXFxuXSsoPzpcXG4oPyFocnxoZWFkaW5nfGxoZWFkaW5nfGJsb2NrcXVvdGV8ZmVuY2VzfGxpc3R8aHRtbHx0YWJsZXwgK1xcbilbXlxcbl0rKSopLyxcbiAgdGV4dDogL15bXlxcbl0rL1xufTtcblxuYmxvY2suX2xhYmVsID0gLyg/IVxccypcXF0pKD86XFxcXC58W15cXFtcXF1cXFxcXSkrLztcbmJsb2NrLl90aXRsZSA9IC8oPzpcIig/OlxcXFxcIj98W15cIlxcXFxdKSpcInwnW14nXFxuXSooPzpcXG5bXidcXG5dKykqXFxuPyd8XFwoW14oKV0qXFwpKS87XG5ibG9jay5kZWYgPSBlZGl0KGJsb2NrLmRlZilcbiAgLnJlcGxhY2UoJ2xhYmVsJywgYmxvY2suX2xhYmVsKVxuICAucmVwbGFjZSgndGl0bGUnLCBibG9jay5fdGl0bGUpXG4gIC5nZXRSZWdleCgpO1xuXG5ibG9jay5idWxsZXQgPSAvKD86WyorLV18XFxkezEsOX1bLildKS87XG5ibG9jay5saXN0SXRlbVN0YXJ0ID0gZWRpdCgvXiggKikoYnVsbCkgKi8pXG4gIC5yZXBsYWNlKCdidWxsJywgYmxvY2suYnVsbGV0KVxuICAuZ2V0UmVnZXgoKTtcblxuYmxvY2subGlzdCA9IGVkaXQoYmxvY2subGlzdClcbiAgLnJlcGxhY2UoL2J1bGwvZywgYmxvY2suYnVsbGV0KVxuICAucmVwbGFjZSgnaHInLCAnXFxcXG4rKD89XFxcXDE/KD86KD86LSAqKXszLH18KD86XyAqKXszLH18KD86XFxcXCogKil7Myx9KSg/OlxcXFxuK3wkKSknKVxuICAucmVwbGFjZSgnZGVmJywgJ1xcXFxuKyg/PScgKyBibG9jay5kZWYuc291cmNlICsgJyknKVxuICAuZ2V0UmVnZXgoKTtcblxuYmxvY2suX3RhZyA9ICdhZGRyZXNzfGFydGljbGV8YXNpZGV8YmFzZXxiYXNlZm9udHxibG9ja3F1b3RlfGJvZHl8Y2FwdGlvbidcbiAgKyAnfGNlbnRlcnxjb2x8Y29sZ3JvdXB8ZGR8ZGV0YWlsc3xkaWFsb2d8ZGlyfGRpdnxkbHxkdHxmaWVsZHNldHxmaWdjYXB0aW9uJ1xuICArICd8ZmlndXJlfGZvb3Rlcnxmb3JtfGZyYW1lfGZyYW1lc2V0fGhbMS02XXxoZWFkfGhlYWRlcnxocnxodG1sfGlmcmFtZSdcbiAgKyAnfGxlZ2VuZHxsaXxsaW5rfG1haW58bWVudXxtZW51aXRlbXxtZXRhfG5hdnxub2ZyYW1lc3xvbHxvcHRncm91cHxvcHRpb24nXG4gICsgJ3xwfHBhcmFtfHNlY3Rpb258c291cmNlfHN1bW1hcnl8dGFibGV8dGJvZHl8dGR8dGZvb3R8dGh8dGhlYWR8dGl0bGV8dHInXG4gICsgJ3x0cmFja3x1bCc7XG5ibG9jay5fY29tbWVudCA9IC88IS0tKD8hLT8+KVtcXHNcXFNdKj8oPzotLT58JCkvO1xuYmxvY2suaHRtbCA9IGVkaXQoYmxvY2suaHRtbCwgJ2knKVxuICAucmVwbGFjZSgnY29tbWVudCcsIGJsb2NrLl9jb21tZW50KVxuICAucmVwbGFjZSgndGFnJywgYmxvY2suX3RhZylcbiAgLnJlcGxhY2UoJ2F0dHJpYnV0ZScsIC8gK1thLXpBLVo6X11bXFx3LjotXSooPzogKj0gKlwiW15cIlxcbl0qXCJ8ICo9IConW14nXFxuXSonfCAqPSAqW15cXHNcIic9PD5gXSspPy8pXG4gIC5nZXRSZWdleCgpO1xuXG5ibG9jay5wYXJhZ3JhcGggPSBlZGl0KGJsb2NrLl9wYXJhZ3JhcGgpXG4gIC5yZXBsYWNlKCdocicsIGJsb2NrLmhyKVxuICAucmVwbGFjZSgnaGVhZGluZycsICcgezAsM30jezEsNn0gJylcbiAgLnJlcGxhY2UoJ3xsaGVhZGluZycsICcnKSAvLyBzZXRleCBoZWFkaW5ncyBkb24ndCBpbnRlcnJ1cHQgY29tbW9ubWFyayBwYXJhZ3JhcGhzXG4gIC5yZXBsYWNlKCd8dGFibGUnLCAnJylcbiAgLnJlcGxhY2UoJ2Jsb2NrcXVvdGUnLCAnIHswLDN9PicpXG4gIC5yZXBsYWNlKCdmZW5jZXMnLCAnIHswLDN9KD86YHszLH0oPz1bXmBcXFxcbl0qXFxcXG4pfH57Myx9KVteXFxcXG5dKlxcXFxuJylcbiAgLnJlcGxhY2UoJ2xpc3QnLCAnIHswLDN9KD86WyorLV18MVsuKV0pICcpIC8vIG9ubHkgbGlzdHMgc3RhcnRpbmcgZnJvbSAxIGNhbiBpbnRlcnJ1cHRcbiAgLnJlcGxhY2UoJ2h0bWwnLCAnPC8/KD86dGFnKSg/OiArfFxcXFxufC8/Pil8PCg/OnNjcmlwdHxwcmV8c3R5bGV8dGV4dGFyZWF8IS0tKScpXG4gIC5yZXBsYWNlKCd0YWcnLCBibG9jay5fdGFnKSAvLyBwYXJzIGNhbiBiZSBpbnRlcnJ1cHRlZCBieSB0eXBlICg2KSBodG1sIGJsb2Nrc1xuICAuZ2V0UmVnZXgoKTtcblxuYmxvY2suYmxvY2txdW90ZSA9IGVkaXQoYmxvY2suYmxvY2txdW90ZSlcbiAgLnJlcGxhY2UoJ3BhcmFncmFwaCcsIGJsb2NrLnBhcmFncmFwaClcbiAgLmdldFJlZ2V4KCk7XG5cbi8qKlxuICogTm9ybWFsIEJsb2NrIEdyYW1tYXJcbiAqL1xuXG5ibG9jay5ub3JtYWwgPSB7IC4uLmJsb2NrIH07XG5cbi8qKlxuICogR0ZNIEJsb2NrIEdyYW1tYXJcbiAqL1xuXG5ibG9jay5nZm0gPSB7XG4gIC4uLmJsb2NrLm5vcm1hbCxcbiAgdGFibGU6ICdeICooW15cXFxcbiBdLipcXFxcfC4qKVxcXFxuJyAvLyBIZWFkZXJcbiAgICArICcgezAsM30oPzpcXFxcfCAqKT8oOj8tKzo/ICooPzpcXFxcfCAqOj8tKzo/ICopKikoPzpcXFxcfCAqKT8nIC8vIEFsaWduXG4gICAgKyAnKD86XFxcXG4oKD86KD8hICpcXFxcbnxocnxoZWFkaW5nfGJsb2NrcXVvdGV8Y29kZXxmZW5jZXN8bGlzdHxodG1sKS4qKD86XFxcXG58JCkpKilcXFxcbip8JCknIC8vIENlbGxzXG59O1xuXG5ibG9jay5nZm0udGFibGUgPSBlZGl0KGJsb2NrLmdmbS50YWJsZSlcbiAgLnJlcGxhY2UoJ2hyJywgYmxvY2suaHIpXG4gIC5yZXBsYWNlKCdoZWFkaW5nJywgJyB7MCwzfSN7MSw2fSAnKVxuICAucmVwbGFjZSgnYmxvY2txdW90ZScsICcgezAsM30+JylcbiAgLnJlcGxhY2UoJ2NvZGUnLCAnIHs0fVteXFxcXG5dJylcbiAgLnJlcGxhY2UoJ2ZlbmNlcycsICcgezAsM30oPzpgezMsfSg/PVteYFxcXFxuXSpcXFxcbil8fnszLH0pW15cXFxcbl0qXFxcXG4nKVxuICAucmVwbGFjZSgnbGlzdCcsICcgezAsM30oPzpbKistXXwxWy4pXSkgJykgLy8gb25seSBsaXN0cyBzdGFydGluZyBmcm9tIDEgY2FuIGludGVycnVwdFxuICAucmVwbGFjZSgnaHRtbCcsICc8Lz8oPzp0YWcpKD86ICt8XFxcXG58Lz8+KXw8KD86c2NyaXB0fHByZXxzdHlsZXx0ZXh0YXJlYXwhLS0pJylcbiAgLnJlcGxhY2UoJ3RhZycsIGJsb2NrLl90YWcpIC8vIHRhYmxlcyBjYW4gYmUgaW50ZXJydXB0ZWQgYnkgdHlwZSAoNikgaHRtbCBibG9ja3NcbiAgLmdldFJlZ2V4KCk7XG5cbmJsb2NrLmdmbS5wYXJhZ3JhcGggPSBlZGl0KGJsb2NrLl9wYXJhZ3JhcGgpXG4gIC5yZXBsYWNlKCdocicsIGJsb2NrLmhyKVxuICAucmVwbGFjZSgnaGVhZGluZycsICcgezAsM30jezEsNn0gJylcbiAgLnJlcGxhY2UoJ3xsaGVhZGluZycsICcnKSAvLyBzZXRleCBoZWFkaW5ncyBkb24ndCBpbnRlcnJ1cHQgY29tbW9ubWFyayBwYXJhZ3JhcGhzXG4gIC5yZXBsYWNlKCd0YWJsZScsIGJsb2NrLmdmbS50YWJsZSkgLy8gaW50ZXJydXB0IHBhcmFncmFwaHMgd2l0aCB0YWJsZVxuICAucmVwbGFjZSgnYmxvY2txdW90ZScsICcgezAsM30+JylcbiAgLnJlcGxhY2UoJ2ZlbmNlcycsICcgezAsM30oPzpgezMsfSg/PVteYFxcXFxuXSpcXFxcbil8fnszLH0pW15cXFxcbl0qXFxcXG4nKVxuICAucmVwbGFjZSgnbGlzdCcsICcgezAsM30oPzpbKistXXwxWy4pXSkgJykgLy8gb25seSBsaXN0cyBzdGFydGluZyBmcm9tIDEgY2FuIGludGVycnVwdFxuICAucmVwbGFjZSgnaHRtbCcsICc8Lz8oPzp0YWcpKD86ICt8XFxcXG58Lz8+KXw8KD86c2NyaXB0fHByZXxzdHlsZXx0ZXh0YXJlYXwhLS0pJylcbiAgLnJlcGxhY2UoJ3RhZycsIGJsb2NrLl90YWcpIC8vIHBhcnMgY2FuIGJlIGludGVycnVwdGVkIGJ5IHR5cGUgKDYpIGh0bWwgYmxvY2tzXG4gIC5nZXRSZWdleCgpO1xuLyoqXG4gKiBQZWRhbnRpYyBncmFtbWFyIChvcmlnaW5hbCBKb2huIEdydWJlcidzIGxvb3NlIG1hcmtkb3duIHNwZWNpZmljYXRpb24pXG4gKi9cblxuYmxvY2sucGVkYW50aWMgPSB7XG4gIC4uLmJsb2NrLm5vcm1hbCxcbiAgaHRtbDogZWRpdChcbiAgICAnXiAqKD86Y29tbWVudCAqKD86XFxcXG58XFxcXHMqJCknXG4gICAgKyAnfDwodGFnKVtcXFxcc1xcXFxTXSs/PC9cXFxcMT4gKig/OlxcXFxuezIsfXxcXFxccyokKScgLy8gY2xvc2VkIHRhZ1xuICAgICsgJ3w8dGFnKD86XCJbXlwiXSpcInxcXCdbXlxcJ10qXFwnfFxcXFxzW15cXCdcIi8+XFxcXHNdKikqPy8/PiAqKD86XFxcXG57Mix9fFxcXFxzKiQpKScpXG4gICAgLnJlcGxhY2UoJ2NvbW1lbnQnLCBibG9jay5fY29tbWVudClcbiAgICAucmVwbGFjZSgvdGFnL2csICcoPyEoPzonXG4gICAgICArICdhfGVtfHN0cm9uZ3xzbWFsbHxzfGNpdGV8cXxkZm58YWJicnxkYXRhfHRpbWV8Y29kZXx2YXJ8c2FtcHxrYmR8c3ViJ1xuICAgICAgKyAnfHN1cHxpfGJ8dXxtYXJrfHJ1Ynl8cnR8cnB8YmRpfGJkb3xzcGFufGJyfHdicnxpbnN8ZGVsfGltZyknXG4gICAgICArICdcXFxcYilcXFxcdysoPyE6fFteXFxcXHdcXFxcc0BdKkApXFxcXGInKVxuICAgIC5nZXRSZWdleCgpLFxuICBkZWY6IC9eICpcXFsoW15cXF1dKylcXF06ICo8PyhbXlxccz5dKyk+Pyg/OiArKFtcIihdW15cXG5dK1tcIildKSk/ICooPzpcXG4rfCQpLyxcbiAgaGVhZGluZzogL14oI3sxLDZ9KSguKikoPzpcXG4rfCQpLyxcbiAgZmVuY2VzOiBub29wVGVzdCwgLy8gZmVuY2VzIG5vdCBzdXBwb3J0ZWRcbiAgbGhlYWRpbmc6IC9eKC4rPylcXG4gezAsM30oPSt8LSspICooPzpcXG4rfCQpLyxcbiAgcGFyYWdyYXBoOiBlZGl0KGJsb2NrLm5vcm1hbC5fcGFyYWdyYXBoKVxuICAgIC5yZXBsYWNlKCdocicsIGJsb2NrLmhyKVxuICAgIC5yZXBsYWNlKCdoZWFkaW5nJywgJyAqI3sxLDZ9ICpbXlxcbl0nKVxuICAgIC5yZXBsYWNlKCdsaGVhZGluZycsIGJsb2NrLmxoZWFkaW5nKVxuICAgIC5yZXBsYWNlKCdibG9ja3F1b3RlJywgJyB7MCwzfT4nKVxuICAgIC5yZXBsYWNlKCd8ZmVuY2VzJywgJycpXG4gICAgLnJlcGxhY2UoJ3xsaXN0JywgJycpXG4gICAgLnJlcGxhY2UoJ3xodG1sJywgJycpXG4gICAgLmdldFJlZ2V4KClcbn07XG5cbi8qKlxuICogSW5saW5lLUxldmVsIEdyYW1tYXJcbiAqL1xuY29uc3QgaW5saW5lID0ge1xuICBlc2NhcGU6IC9eXFxcXChbIVwiIyQlJicoKSorLFxcLS4vOjs8PT4/QFxcW1xcXVxcXFxeX2B7fH1+XSkvLFxuICBhdXRvbGluazogL148KHNjaGVtZTpbXlxcc1xceDAwLVxceDFmPD5dKnxlbWFpbCk+LyxcbiAgdXJsOiBub29wVGVzdCxcbiAgdGFnOiAnXmNvbW1lbnQnXG4gICAgKyAnfF48L1thLXpBLVpdW1xcXFx3Oi1dKlxcXFxzKj4nIC8vIHNlbGYtY2xvc2luZyB0YWdcbiAgICArICd8XjxbYS16QS1aXVtcXFxcdy1dKig/OmF0dHJpYnV0ZSkqP1xcXFxzKi8/PicgLy8gb3BlbiB0YWdcbiAgICArICd8XjxcXFxcP1tcXFxcc1xcXFxTXSo/XFxcXD8+JyAvLyBwcm9jZXNzaW5nIGluc3RydWN0aW9uLCBlLmcuIDw/cGhwID8+XG4gICAgKyAnfF48IVthLXpBLVpdK1xcXFxzW1xcXFxzXFxcXFNdKj8+JyAvLyBkZWNsYXJhdGlvbiwgZS5nLiA8IURPQ1RZUEUgaHRtbD5cbiAgICArICd8XjwhXFxcXFtDREFUQVxcXFxbW1xcXFxzXFxcXFNdKj9cXFxcXVxcXFxdPicsIC8vIENEQVRBIHNlY3Rpb25cbiAgbGluazogL14hP1xcWyhsYWJlbClcXF1cXChcXHMqKGhyZWYpKD86XFxzKyh0aXRsZSkpP1xccypcXCkvLFxuICByZWZsaW5rOiAvXiE/XFxbKGxhYmVsKVxcXVxcWyhyZWYpXFxdLyxcbiAgbm9saW5rOiAvXiE/XFxbKHJlZilcXF0oPzpcXFtcXF0pPy8sXG4gIHJlZmxpbmtTZWFyY2g6ICdyZWZsaW5rfG5vbGluayg/IVxcXFwoKScsXG4gIGVtU3Ryb25nOiB7XG4gICAgbERlbGltOiAvXig/OlxcKisoPzooW3B1bmN0X10pfFteXFxzKl0pKXxeXysoPzooW3B1bmN0Kl0pfChbXlxcc19dKSkvLFxuICAgIC8vICAgICAgICAoMSkgYW5kICgyKSBjYW4gb25seSBiZSBhIFJpZ2h0IERlbGltaXRlci4gKDMpIGFuZCAoNCkgY2FuIG9ubHkgYmUgTGVmdC4gICg1KSBhbmQgKDYpIGNhbiBiZSBlaXRoZXIgTGVmdCBvciBSaWdodC5cbiAgICAvLyAgICAgICAgICAoKSBTa2lwIG9ycGhhbiBpbnNpZGUgc3Ryb25nICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoKSBDb25zdW1lIHRvIGRlbGltICAgICAoMSkgIyoqKiAgICAgICAgICAgICAgICAoMikgYSoqKiMsIGEqKiogICAgICAgICAgICAgICAgICAgICAgICAgICAgICgzKSAjKioqYSwgKioqYSAgICAgICAgICAgICAgICAgKDQpICoqKiMgICAgICAgICAgICAgICg1KSAjKioqIyAgICAgICAgICAgICAgICAgKDYpIGEqKiphXG4gICAgckRlbGltQXN0OiAvXig/OlteXypcXFxcXXxcXFxcLikqP1xcX1xcXyg/OlteXypcXFxcXXxcXFxcLikqP1xcKig/OlteXypcXFxcXXxcXFxcLikqPyg/PVxcX1xcXyl8KD86W14qXFxcXF18XFxcXC4pKyg/PVteKl0pfFtwdW5jdF9dKFxcKispKD89W1xcc118JCl8KD86W15wdW5jdCpfXFxzXFxcXF18XFxcXC4pKFxcKispKD89W3B1bmN0X1xcc118JCl8W3B1bmN0X1xcc10oXFwqKykoPz1bXnB1bmN0Kl9cXHNdKXxbXFxzXShcXCorKSg/PVtwdW5jdF9dKXxbcHVuY3RfXShcXCorKSg/PVtwdW5jdF9dKXwoPzpbXnB1bmN0Kl9cXHNcXFxcXXxcXFxcLikoXFwqKykoPz1bXnB1bmN0Kl9cXHNdKS8sXG4gICAgckRlbGltVW5kOiAvXig/OlteXypcXFxcXXxcXFxcLikqP1xcKlxcKig/OlteXypcXFxcXXxcXFxcLikqP1xcXyg/OlteXypcXFxcXXxcXFxcLikqPyg/PVxcKlxcKil8KD86W15fXFxcXF18XFxcXC4pKyg/PVteX10pfFtwdW5jdCpdKFxcXyspKD89W1xcc118JCl8KD86W15wdW5jdCpfXFxzXFxcXF18XFxcXC4pKFxcXyspKD89W3B1bmN0Klxcc118JCl8W3B1bmN0Klxcc10oXFxfKykoPz1bXnB1bmN0Kl9cXHNdKXxbXFxzXShcXF8rKSg/PVtwdW5jdCpdKXxbcHVuY3QqXShcXF8rKSg/PVtwdW5jdCpdKS8gLy8gXi0gTm90IGFsbG93ZWQgZm9yIF9cbiAgfSxcbiAgY29kZTogL14oYCspKFteYF18W15gXVtcXHNcXFNdKj9bXmBdKVxcMSg/IWApLyxcbiAgYnI6IC9eKCB7Mix9fFxcXFwpXFxuKD8hXFxzKiQpLyxcbiAgZGVsOiBub29wVGVzdCxcbiAgdGV4dDogL14oYCt8W15gXSkoPzooPz0gezIsfVxcbil8W1xcc1xcU10qPyg/Oig/PVtcXFxcPCFcXFtgKl9dfFxcYl98JCl8W14gXSg/PSB7Mix9XFxuKSkpLyxcbiAgcHVuY3R1YXRpb246IC9eKFtcXHNwdW5jdHVhdGlvbl0pL1xufTtcblxuLy8gbGlzdCBvZiBwdW5jdHVhdGlvbiBtYXJrcyBmcm9tIENvbW1vbk1hcmsgc3BlY1xuLy8gd2l0aG91dCAqIGFuZCBfIHRvIGhhbmRsZSB0aGUgZGlmZmVyZW50IGVtcGhhc2lzIG1hcmtlcnMgKiBhbmQgX1xuaW5saW5lLl9wdW5jdHVhdGlvbiA9ICchXCIjJCUmXFwnKCkrXFxcXC0uLC86Ozw9Pj9AXFxcXFtcXFxcXWBee3x9fic7XG5pbmxpbmUucHVuY3R1YXRpb24gPSBlZGl0KGlubGluZS5wdW5jdHVhdGlvbikucmVwbGFjZSgvcHVuY3R1YXRpb24vZywgaW5saW5lLl9wdW5jdHVhdGlvbikuZ2V0UmVnZXgoKTtcblxuLy8gc2VxdWVuY2VzIGVtIHNob3VsZCBza2lwIG92ZXIgW3RpdGxlXShsaW5rKSwgYGNvZGVgLCA8aHRtbD5cbmlubGluZS5ibG9ja1NraXAgPSAvXFxbW15cXF1dKj9cXF1cXChbXlxcKV0qP1xcKXxgW15gXSo/YHw8W14+XSo/Pi9nO1xuLy8gbG9va2JlaGluZCBpcyBub3QgYXZhaWxhYmxlIG9uIFNhZmFyaSBhcyBvZiB2ZXJzaW9uIDE2XG4vLyBpbmxpbmUuZXNjYXBlZEVtU3QgPSAvKD88PSg/Ol58W15cXFxcKSg/OlxcXFxbXl0pKilcXFxcWypfXS9nO1xuaW5saW5lLmVzY2FwZWRFbVN0ID0gLyg/Ol58W15cXFxcXSkoPzpcXFxcXFxcXCkqXFxcXFsqX10vZztcblxuaW5saW5lLl9jb21tZW50ID0gZWRpdChibG9jay5fY29tbWVudCkucmVwbGFjZSgnKD86LS0+fCQpJywgJy0tPicpLmdldFJlZ2V4KCk7XG5cbmlubGluZS5lbVN0cm9uZy5sRGVsaW0gPSBlZGl0KGlubGluZS5lbVN0cm9uZy5sRGVsaW0pXG4gIC5yZXBsYWNlKC9wdW5jdC9nLCBpbmxpbmUuX3B1bmN0dWF0aW9uKVxuICAuZ2V0UmVnZXgoKTtcblxuaW5saW5lLmVtU3Ryb25nLnJEZWxpbUFzdCA9IGVkaXQoaW5saW5lLmVtU3Ryb25nLnJEZWxpbUFzdCwgJ2cnKVxuICAucmVwbGFjZSgvcHVuY3QvZywgaW5saW5lLl9wdW5jdHVhdGlvbilcbiAgLmdldFJlZ2V4KCk7XG5cbmlubGluZS5lbVN0cm9uZy5yRGVsaW1VbmQgPSBlZGl0KGlubGluZS5lbVN0cm9uZy5yRGVsaW1VbmQsICdnJylcbiAgLnJlcGxhY2UoL3B1bmN0L2csIGlubGluZS5fcHVuY3R1YXRpb24pXG4gIC5nZXRSZWdleCgpO1xuXG5pbmxpbmUuX2VzY2FwZXMgPSAvXFxcXChbIVwiIyQlJicoKSorLFxcLS4vOjs8PT4/QFxcW1xcXVxcXFxeX2B7fH1+XSkvZztcblxuaW5saW5lLl9zY2hlbWUgPSAvW2EtekEtWl1bYS16QS1aMC05Ky4tXXsxLDMxfS87XG5pbmxpbmUuX2VtYWlsID0gL1thLXpBLVowLTkuISMkJSYnKisvPT9eX2B7fH1+LV0rKEApW2EtekEtWjAtOV0oPzpbYS16QS1aMC05LV17MCw2MX1bYS16QS1aMC05XSk/KD86XFwuW2EtekEtWjAtOV0oPzpbYS16QS1aMC05LV17MCw2MX1bYS16QS1aMC05XSk/KSsoPyFbLV9dKS87XG5pbmxpbmUuYXV0b2xpbmsgPSBlZGl0KGlubGluZS5hdXRvbGluaylcbiAgLnJlcGxhY2UoJ3NjaGVtZScsIGlubGluZS5fc2NoZW1lKVxuICAucmVwbGFjZSgnZW1haWwnLCBpbmxpbmUuX2VtYWlsKVxuICAuZ2V0UmVnZXgoKTtcblxuaW5saW5lLl9hdHRyaWJ1dGUgPSAvXFxzK1thLXpBLVo6X11bXFx3LjotXSooPzpcXHMqPVxccypcIlteXCJdKlwifFxccyo9XFxzKidbXiddKid8XFxzKj1cXHMqW15cXHNcIic9PD5gXSspPy87XG5cbmlubGluZS50YWcgPSBlZGl0KGlubGluZS50YWcpXG4gIC5yZXBsYWNlKCdjb21tZW50JywgaW5saW5lLl9jb21tZW50KVxuICAucmVwbGFjZSgnYXR0cmlidXRlJywgaW5saW5lLl9hdHRyaWJ1dGUpXG4gIC5nZXRSZWdleCgpO1xuXG5pbmxpbmUuX2xhYmVsID0gLyg/OlxcWyg/OlxcXFwufFteXFxbXFxdXFxcXF0pKlxcXXxcXFxcLnxgW15gXSpgfFteXFxbXFxdXFxcXGBdKSo/LztcbmlubGluZS5faHJlZiA9IC88KD86XFxcXC58W15cXG48PlxcXFxdKSs+fFteXFxzXFx4MDAtXFx4MWZdKi87XG5pbmxpbmUuX3RpdGxlID0gL1wiKD86XFxcXFwiP3xbXlwiXFxcXF0pKlwifCcoPzpcXFxcJz98W14nXFxcXF0pKid8XFwoKD86XFxcXFxcKT98W14pXFxcXF0pKlxcKS87XG5cbmlubGluZS5saW5rID0gZWRpdChpbmxpbmUubGluaylcbiAgLnJlcGxhY2UoJ2xhYmVsJywgaW5saW5lLl9sYWJlbClcbiAgLnJlcGxhY2UoJ2hyZWYnLCBpbmxpbmUuX2hyZWYpXG4gIC5yZXBsYWNlKCd0aXRsZScsIGlubGluZS5fdGl0bGUpXG4gIC5nZXRSZWdleCgpO1xuXG5pbmxpbmUucmVmbGluayA9IGVkaXQoaW5saW5lLnJlZmxpbmspXG4gIC5yZXBsYWNlKCdsYWJlbCcsIGlubGluZS5fbGFiZWwpXG4gIC5yZXBsYWNlKCdyZWYnLCBibG9jay5fbGFiZWwpXG4gIC5nZXRSZWdleCgpO1xuXG5pbmxpbmUubm9saW5rID0gZWRpdChpbmxpbmUubm9saW5rKVxuICAucmVwbGFjZSgncmVmJywgYmxvY2suX2xhYmVsKVxuICAuZ2V0UmVnZXgoKTtcblxuaW5saW5lLnJlZmxpbmtTZWFyY2ggPSBlZGl0KGlubGluZS5yZWZsaW5rU2VhcmNoLCAnZycpXG4gIC5yZXBsYWNlKCdyZWZsaW5rJywgaW5saW5lLnJlZmxpbmspXG4gIC5yZXBsYWNlKCdub2xpbmsnLCBpbmxpbmUubm9saW5rKVxuICAuZ2V0UmVnZXgoKTtcblxuLyoqXG4gKiBOb3JtYWwgSW5saW5lIEdyYW1tYXJcbiAqL1xuXG5pbmxpbmUubm9ybWFsID0geyAuLi5pbmxpbmUgfTtcblxuLyoqXG4gKiBQZWRhbnRpYyBJbmxpbmUgR3JhbW1hclxuICovXG5cbmlubGluZS5wZWRhbnRpYyA9IHtcbiAgLi4uaW5saW5lLm5vcm1hbCxcbiAgc3Ryb25nOiB7XG4gICAgc3RhcnQ6IC9eX198XFwqXFwqLyxcbiAgICBtaWRkbGU6IC9eX18oPz1cXFMpKFtcXHNcXFNdKj9cXFMpX18oPyFfKXxeXFwqXFwqKD89XFxTKShbXFxzXFxTXSo/XFxTKVxcKlxcKig/IVxcKikvLFxuICAgIGVuZEFzdDogL1xcKlxcKig/IVxcKikvZyxcbiAgICBlbmRVbmQ6IC9fXyg/IV8pL2dcbiAgfSxcbiAgZW06IHtcbiAgICBzdGFydDogL15ffFxcKi8sXG4gICAgbWlkZGxlOiAvXigpXFwqKD89XFxTKShbXFxzXFxTXSo/XFxTKVxcKig/IVxcKil8Xl8oPz1cXFMpKFtcXHNcXFNdKj9cXFMpXyg/IV8pLyxcbiAgICBlbmRBc3Q6IC9cXCooPyFcXCopL2csXG4gICAgZW5kVW5kOiAvXyg/IV8pL2dcbiAgfSxcbiAgbGluazogZWRpdCgvXiE/XFxbKGxhYmVsKVxcXVxcKCguKj8pXFwpLylcbiAgICAucmVwbGFjZSgnbGFiZWwnLCBpbmxpbmUuX2xhYmVsKVxuICAgIC5nZXRSZWdleCgpLFxuICByZWZsaW5rOiBlZGl0KC9eIT9cXFsobGFiZWwpXFxdXFxzKlxcWyhbXlxcXV0qKVxcXS8pXG4gICAgLnJlcGxhY2UoJ2xhYmVsJywgaW5saW5lLl9sYWJlbClcbiAgICAuZ2V0UmVnZXgoKVxufTtcblxuLyoqXG4gKiBHRk0gSW5saW5lIEdyYW1tYXJcbiAqL1xuXG5pbmxpbmUuZ2ZtID0ge1xuICAuLi5pbmxpbmUubm9ybWFsLFxuICBlc2NhcGU6IGVkaXQoaW5saW5lLmVzY2FwZSkucmVwbGFjZSgnXSknLCAnfnxdKScpLmdldFJlZ2V4KCksXG4gIF9leHRlbmRlZF9lbWFpbDogL1tBLVphLXowLTkuXystXSsoQClbYS16QS1aMC05LV9dKyg/OlxcLlthLXpBLVowLTktX10qW2EtekEtWjAtOV0pKyg/IVstX10pLyxcbiAgdXJsOiAvXigoPzpmdHB8aHR0cHM/KTpcXC9cXC98d3d3XFwuKSg/OlthLXpBLVowLTlcXC1dK1xcLj8pK1teXFxzPF0qfF5lbWFpbC8sXG4gIF9iYWNrcGVkYWw6IC8oPzpbXj8hLiw6OypfJ1wifigpJl0rfFxcKFteKV0qXFwpfCYoPyFbYS16QS1aMC05XSs7JCl8Wz8hLiw6OypfJ1wifildKyg/ISQpKSsvLFxuICBkZWw6IC9eKH5+PykoPz1bXlxcc35dKShbXFxzXFxTXSo/W15cXHN+XSlcXDEoPz1bXn5dfCQpLyxcbiAgdGV4dDogL14oW2B+XSt8W15gfl0pKD86KD89IHsyLH1cXG4pfCg/PVthLXpBLVowLTkuISMkJSYnKitcXC89P19ge1xcfH1+LV0rQCl8W1xcc1xcU10qPyg/Oig/PVtcXFxcPCFcXFtgKn5fXXxcXGJffGh0dHBzPzpcXC9cXC98ZnRwOlxcL1xcL3x3d3dcXC58JCl8W14gXSg/PSB7Mix9XFxuKXxbXmEtekEtWjAtOS4hIyQlJicqK1xcLz0/X2B7XFx8fX4tXSg/PVthLXpBLVowLTkuISMkJSYnKitcXC89P19ge1xcfH1+LV0rQCkpKS9cbn07XG5cbmlubGluZS5nZm0udXJsID0gZWRpdChpbmxpbmUuZ2ZtLnVybCwgJ2knKVxuICAucmVwbGFjZSgnZW1haWwnLCBpbmxpbmUuZ2ZtLl9leHRlbmRlZF9lbWFpbClcbiAgLmdldFJlZ2V4KCk7XG4vKipcbiAqIEdGTSArIExpbmUgQnJlYWtzIElubGluZSBHcmFtbWFyXG4gKi9cblxuaW5saW5lLmJyZWFrcyA9IHtcbiAgLi4uaW5saW5lLmdmbSxcbiAgYnI6IGVkaXQoaW5saW5lLmJyKS5yZXBsYWNlKCd7Mix9JywgJyonKS5nZXRSZWdleCgpLFxuICB0ZXh0OiBlZGl0KGlubGluZS5nZm0udGV4dClcbiAgICAucmVwbGFjZSgnXFxcXGJfJywgJ1xcXFxiX3wgezIsfVxcXFxuJylcbiAgICAucmVwbGFjZSgvXFx7MixcXH0vZywgJyonKVxuICAgIC5nZXRSZWdleCgpXG59O1xuXG4vKipcbiAqIHNtYXJ0eXBhbnRzIHRleHQgcmVwbGFjZW1lbnRcbiAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0XG4gKi9cbmZ1bmN0aW9uIHNtYXJ0eXBhbnRzKHRleHQpIHtcbiAgcmV0dXJuIHRleHRcbiAgICAvLyBlbS1kYXNoZXNcbiAgICAucmVwbGFjZSgvLS0tL2csICdcXHUyMDE0JylcbiAgICAvLyBlbi1kYXNoZXNcbiAgICAucmVwbGFjZSgvLS0vZywgJ1xcdTIwMTMnKVxuICAgIC8vIG9wZW5pbmcgc2luZ2xlc1xuICAgIC5yZXBsYWNlKC8oXnxbLVxcdTIwMTQvKFxcW3tcIlxcc10pJy9nLCAnJDFcXHUyMDE4JylcbiAgICAvLyBjbG9zaW5nIHNpbmdsZXMgJiBhcG9zdHJvcGhlc1xuICAgIC5yZXBsYWNlKC8nL2csICdcXHUyMDE5JylcbiAgICAvLyBvcGVuaW5nIGRvdWJsZXNcbiAgICAucmVwbGFjZSgvKF58Wy1cXHUyMDE0LyhcXFt7XFx1MjAxOFxcc10pXCIvZywgJyQxXFx1MjAxYycpXG4gICAgLy8gY2xvc2luZyBkb3VibGVzXG4gICAgLnJlcGxhY2UoL1wiL2csICdcXHUyMDFkJylcbiAgICAvLyBlbGxpcHNlc1xuICAgIC5yZXBsYWNlKC9cXC57M30vZywgJ1xcdTIwMjYnKTtcbn1cblxuLyoqXG4gKiBtYW5nbGUgZW1haWwgYWRkcmVzc2VzXG4gKiBAcGFyYW0ge3N0cmluZ30gdGV4dFxuICovXG5mdW5jdGlvbiBtYW5nbGUodGV4dCkge1xuICBsZXQgb3V0ID0gJycsXG4gICAgaSxcbiAgICBjaDtcblxuICBjb25zdCBsID0gdGV4dC5sZW5ndGg7XG4gIGZvciAoaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICBjaCA9IHRleHQuY2hhckNvZGVBdChpKTtcbiAgICBpZiAoTWF0aC5yYW5kb20oKSA+IDAuNSkge1xuICAgICAgY2ggPSAneCcgKyBjaC50b1N0cmluZygxNik7XG4gICAgfVxuICAgIG91dCArPSAnJiMnICsgY2ggKyAnOyc7XG4gIH1cblxuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIEJsb2NrIExleGVyXG4gKi9cbmNsYXNzIExleGVyIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgIHRoaXMudG9rZW5zID0gW107XG4gICAgdGhpcy50b2tlbnMubGlua3MgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHwgZGVmYXVsdHM7XG4gICAgdGhpcy5vcHRpb25zLnRva2VuaXplciA9IHRoaXMub3B0aW9ucy50b2tlbml6ZXIgfHwgbmV3IFRva2VuaXplcigpO1xuICAgIHRoaXMudG9rZW5pemVyID0gdGhpcy5vcHRpb25zLnRva2VuaXplcjtcbiAgICB0aGlzLnRva2VuaXplci5vcHRpb25zID0gdGhpcy5vcHRpb25zO1xuICAgIHRoaXMudG9rZW5pemVyLmxleGVyID0gdGhpcztcbiAgICB0aGlzLmlubGluZVF1ZXVlID0gW107XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIGluTGluazogZmFsc2UsXG4gICAgICBpblJhd0Jsb2NrOiBmYWxzZSxcbiAgICAgIHRvcDogdHJ1ZVxuICAgIH07XG5cbiAgICBjb25zdCBydWxlcyA9IHtcbiAgICAgIGJsb2NrOiBibG9jay5ub3JtYWwsXG4gICAgICBpbmxpbmU6IGlubGluZS5ub3JtYWxcbiAgICB9O1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5wZWRhbnRpYykge1xuICAgICAgcnVsZXMuYmxvY2sgPSBibG9jay5wZWRhbnRpYztcbiAgICAgIHJ1bGVzLmlubGluZSA9IGlubGluZS5wZWRhbnRpYztcbiAgICB9IGVsc2UgaWYgKHRoaXMub3B0aW9ucy5nZm0pIHtcbiAgICAgIHJ1bGVzLmJsb2NrID0gYmxvY2suZ2ZtO1xuICAgICAgaWYgKHRoaXMub3B0aW9ucy5icmVha3MpIHtcbiAgICAgICAgcnVsZXMuaW5saW5lID0gaW5saW5lLmJyZWFrcztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJ1bGVzLmlubGluZSA9IGlubGluZS5nZm07XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMudG9rZW5pemVyLnJ1bGVzID0gcnVsZXM7XG4gIH1cblxuICAvKipcbiAgICogRXhwb3NlIFJ1bGVzXG4gICAqL1xuICBzdGF0aWMgZ2V0IHJ1bGVzKCkge1xuICAgIHJldHVybiB7XG4gICAgICBibG9jayxcbiAgICAgIGlubGluZVxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogU3RhdGljIExleCBNZXRob2RcbiAgICovXG4gIHN0YXRpYyBsZXgoc3JjLCBvcHRpb25zKSB7XG4gICAgY29uc3QgbGV4ZXIgPSBuZXcgTGV4ZXIob3B0aW9ucyk7XG4gICAgcmV0dXJuIGxleGVyLmxleChzcmMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YXRpYyBMZXggSW5saW5lIE1ldGhvZFxuICAgKi9cbiAgc3RhdGljIGxleElubGluZShzcmMsIG9wdGlvbnMpIHtcbiAgICBjb25zdCBsZXhlciA9IG5ldyBMZXhlcihvcHRpb25zKTtcbiAgICByZXR1cm4gbGV4ZXIuaW5saW5lVG9rZW5zKHNyYyk7XG4gIH1cblxuICAvKipcbiAgICogUHJlcHJvY2Vzc2luZ1xuICAgKi9cbiAgbGV4KHNyYykge1xuICAgIHNyYyA9IHNyY1xuICAgICAgLnJlcGxhY2UoL1xcclxcbnxcXHIvZywgJ1xcbicpO1xuXG4gICAgdGhpcy5ibG9ja1Rva2VucyhzcmMsIHRoaXMudG9rZW5zKTtcblxuICAgIGxldCBuZXh0O1xuICAgIHdoaWxlIChuZXh0ID0gdGhpcy5pbmxpbmVRdWV1ZS5zaGlmdCgpKSB7XG4gICAgICB0aGlzLmlubGluZVRva2VucyhuZXh0LnNyYywgbmV4dC50b2tlbnMpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnRva2VucztcbiAgfVxuXG4gIC8qKlxuICAgKiBMZXhpbmdcbiAgICovXG4gIGJsb2NrVG9rZW5zKHNyYywgdG9rZW5zID0gW10pIHtcbiAgICBpZiAodGhpcy5vcHRpb25zLnBlZGFudGljKSB7XG4gICAgICBzcmMgPSBzcmMucmVwbGFjZSgvXFx0L2csICcgICAgJykucmVwbGFjZSgvXiArJC9nbSwgJycpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzcmMgPSBzcmMucmVwbGFjZSgvXiggKikoXFx0KykvZ20sIChfLCBsZWFkaW5nLCB0YWJzKSA9PiB7XG4gICAgICAgIHJldHVybiBsZWFkaW5nICsgJyAgICAnLnJlcGVhdCh0YWJzLmxlbmd0aCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBsZXQgdG9rZW4sIGxhc3RUb2tlbiwgY3V0U3JjLCBsYXN0UGFyYWdyYXBoQ2xpcHBlZDtcblxuICAgIHdoaWxlIChzcmMpIHtcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuZXh0ZW5zaW9uc1xuICAgICAgICAmJiB0aGlzLm9wdGlvbnMuZXh0ZW5zaW9ucy5ibG9ja1xuICAgICAgICAmJiB0aGlzLm9wdGlvbnMuZXh0ZW5zaW9ucy5ibG9jay5zb21lKChleHRUb2tlbml6ZXIpID0+IHtcbiAgICAgICAgICBpZiAodG9rZW4gPSBleHRUb2tlbml6ZXIuY2FsbCh7IGxleGVyOiB0aGlzIH0sIHNyYywgdG9rZW5zKSkge1xuICAgICAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0pKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBuZXdsaW5lXG4gICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci5zcGFjZShzcmMpKSB7XG4gICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgIGlmICh0b2tlbi5yYXcubGVuZ3RoID09PSAxICYmIHRva2Vucy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgLy8gaWYgdGhlcmUncyBhIHNpbmdsZSBcXG4gYXMgYSBzcGFjZXIsIGl0J3MgdGVybWluYXRpbmcgdGhlIGxhc3QgbGluZSxcbiAgICAgICAgICAvLyBzbyBtb3ZlIGl0IHRoZXJlIHNvIHRoYXQgd2UgZG9uJ3QgZ2V0IHVuZWNlc3NhcnkgcGFyYWdyYXBoIHRhZ3NcbiAgICAgICAgICB0b2tlbnNbdG9rZW5zLmxlbmd0aCAtIDFdLnJhdyArPSAnXFxuJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgIH1cbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIGNvZGVcbiAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLmNvZGUoc3JjKSkge1xuICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICBsYXN0VG9rZW4gPSB0b2tlbnNbdG9rZW5zLmxlbmd0aCAtIDFdO1xuICAgICAgICAvLyBBbiBpbmRlbnRlZCBjb2RlIGJsb2NrIGNhbm5vdCBpbnRlcnJ1cHQgYSBwYXJhZ3JhcGguXG4gICAgICAgIGlmIChsYXN0VG9rZW4gJiYgKGxhc3RUb2tlbi50eXBlID09PSAncGFyYWdyYXBoJyB8fCBsYXN0VG9rZW4udHlwZSA9PT0gJ3RleHQnKSkge1xuICAgICAgICAgIGxhc3RUb2tlbi5yYXcgKz0gJ1xcbicgKyB0b2tlbi5yYXc7XG4gICAgICAgICAgbGFzdFRva2VuLnRleHQgKz0gJ1xcbicgKyB0b2tlbi50ZXh0O1xuICAgICAgICAgIHRoaXMuaW5saW5lUXVldWVbdGhpcy5pbmxpbmVRdWV1ZS5sZW5ndGggLSAxXS5zcmMgPSBsYXN0VG9rZW4udGV4dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgIH1cbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIGZlbmNlc1xuICAgICAgaWYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIuZmVuY2VzKHNyYykpIHtcbiAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gaGVhZGluZ1xuICAgICAgaWYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIuaGVhZGluZyhzcmMpKSB7XG4gICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIGhyXG4gICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci5ocihzcmMpKSB7XG4gICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIGJsb2NrcXVvdGVcbiAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLmJsb2NrcXVvdGUoc3JjKSkge1xuICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBsaXN0XG4gICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci5saXN0KHNyYykpIHtcbiAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gaHRtbFxuICAgICAgaWYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIuaHRtbChzcmMpKSB7XG4gICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIGRlZlxuICAgICAgaWYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIuZGVmKHNyYykpIHtcbiAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgbGFzdFRva2VuID0gdG9rZW5zW3Rva2Vucy5sZW5ndGggLSAxXTtcbiAgICAgICAgaWYgKGxhc3RUb2tlbiAmJiAobGFzdFRva2VuLnR5cGUgPT09ICdwYXJhZ3JhcGgnIHx8IGxhc3RUb2tlbi50eXBlID09PSAndGV4dCcpKSB7XG4gICAgICAgICAgbGFzdFRva2VuLnJhdyArPSAnXFxuJyArIHRva2VuLnJhdztcbiAgICAgICAgICBsYXN0VG9rZW4udGV4dCArPSAnXFxuJyArIHRva2VuLnJhdztcbiAgICAgICAgICB0aGlzLmlubGluZVF1ZXVlW3RoaXMuaW5saW5lUXVldWUubGVuZ3RoIC0gMV0uc3JjID0gbGFzdFRva2VuLnRleHQ7XG4gICAgICAgIH0gZWxzZSBpZiAoIXRoaXMudG9rZW5zLmxpbmtzW3Rva2VuLnRhZ10pIHtcbiAgICAgICAgICB0aGlzLnRva2Vucy5saW5rc1t0b2tlbi50YWddID0ge1xuICAgICAgICAgICAgaHJlZjogdG9rZW4uaHJlZixcbiAgICAgICAgICAgIHRpdGxlOiB0b2tlbi50aXRsZVxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIHRhYmxlIChnZm0pXG4gICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci50YWJsZShzcmMpKSB7XG4gICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIGxoZWFkaW5nXG4gICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci5saGVhZGluZyhzcmMpKSB7XG4gICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIHRvcC1sZXZlbCBwYXJhZ3JhcGhcbiAgICAgIC8vIHByZXZlbnQgcGFyYWdyYXBoIGNvbnN1bWluZyBleHRlbnNpb25zIGJ5IGNsaXBwaW5nICdzcmMnIHRvIGV4dGVuc2lvbiBzdGFydFxuICAgICAgY3V0U3JjID0gc3JjO1xuICAgICAgaWYgKHRoaXMub3B0aW9ucy5leHRlbnNpb25zICYmIHRoaXMub3B0aW9ucy5leHRlbnNpb25zLnN0YXJ0QmxvY2spIHtcbiAgICAgICAgbGV0IHN0YXJ0SW5kZXggPSBJbmZpbml0eTtcbiAgICAgICAgY29uc3QgdGVtcFNyYyA9IHNyYy5zbGljZSgxKTtcbiAgICAgICAgbGV0IHRlbXBTdGFydDtcbiAgICAgICAgdGhpcy5vcHRpb25zLmV4dGVuc2lvbnMuc3RhcnRCbG9jay5mb3JFYWNoKGZ1bmN0aW9uKGdldFN0YXJ0SW5kZXgpIHtcbiAgICAgICAgICB0ZW1wU3RhcnQgPSBnZXRTdGFydEluZGV4LmNhbGwoeyBsZXhlcjogdGhpcyB9LCB0ZW1wU3JjKTtcbiAgICAgICAgICBpZiAodHlwZW9mIHRlbXBTdGFydCA9PT0gJ251bWJlcicgJiYgdGVtcFN0YXJ0ID49IDApIHsgc3RhcnRJbmRleCA9IE1hdGgubWluKHN0YXJ0SW5kZXgsIHRlbXBTdGFydCk7IH1cbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChzdGFydEluZGV4IDwgSW5maW5pdHkgJiYgc3RhcnRJbmRleCA+PSAwKSB7XG4gICAgICAgICAgY3V0U3JjID0gc3JjLnN1YnN0cmluZygwLCBzdGFydEluZGV4ICsgMSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLnN0YXRlLnRvcCAmJiAodG9rZW4gPSB0aGlzLnRva2VuaXplci5wYXJhZ3JhcGgoY3V0U3JjKSkpIHtcbiAgICAgICAgbGFzdFRva2VuID0gdG9rZW5zW3Rva2Vucy5sZW5ndGggLSAxXTtcbiAgICAgICAgaWYgKGxhc3RQYXJhZ3JhcGhDbGlwcGVkICYmIGxhc3RUb2tlbi50eXBlID09PSAncGFyYWdyYXBoJykge1xuICAgICAgICAgIGxhc3RUb2tlbi5yYXcgKz0gJ1xcbicgKyB0b2tlbi5yYXc7XG4gICAgICAgICAgbGFzdFRva2VuLnRleHQgKz0gJ1xcbicgKyB0b2tlbi50ZXh0O1xuICAgICAgICAgIHRoaXMuaW5saW5lUXVldWUucG9wKCk7XG4gICAgICAgICAgdGhpcy5pbmxpbmVRdWV1ZVt0aGlzLmlubGluZVF1ZXVlLmxlbmd0aCAtIDFdLnNyYyA9IGxhc3RUb2tlbi50ZXh0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgfVxuICAgICAgICBsYXN0UGFyYWdyYXBoQ2xpcHBlZCA9IChjdXRTcmMubGVuZ3RoICE9PSBzcmMubGVuZ3RoKTtcbiAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIHRleHRcbiAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLnRleHQoc3JjKSkge1xuICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICBsYXN0VG9rZW4gPSB0b2tlbnNbdG9rZW5zLmxlbmd0aCAtIDFdO1xuICAgICAgICBpZiAobGFzdFRva2VuICYmIGxhc3RUb2tlbi50eXBlID09PSAndGV4dCcpIHtcbiAgICAgICAgICBsYXN0VG9rZW4ucmF3ICs9ICdcXG4nICsgdG9rZW4ucmF3O1xuICAgICAgICAgIGxhc3RUb2tlbi50ZXh0ICs9ICdcXG4nICsgdG9rZW4udGV4dDtcbiAgICAgICAgICB0aGlzLmlubGluZVF1ZXVlLnBvcCgpO1xuICAgICAgICAgIHRoaXMuaW5saW5lUXVldWVbdGhpcy5pbmxpbmVRdWV1ZS5sZW5ndGggLSAxXS5zcmMgPSBsYXN0VG9rZW4udGV4dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgIH1cbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChzcmMpIHtcbiAgICAgICAgY29uc3QgZXJyTXNnID0gJ0luZmluaXRlIGxvb3Agb24gYnl0ZTogJyArIHNyYy5jaGFyQ29kZUF0KDApO1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnNpbGVudCkge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyTXNnKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyTXNnKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuc3RhdGUudG9wID0gdHJ1ZTtcbiAgICByZXR1cm4gdG9rZW5zO1xuICB9XG5cbiAgaW5saW5lKHNyYywgdG9rZW5zID0gW10pIHtcbiAgICB0aGlzLmlubGluZVF1ZXVlLnB1c2goeyBzcmMsIHRva2VucyB9KTtcbiAgICByZXR1cm4gdG9rZW5zO1xuICB9XG5cbiAgLyoqXG4gICAqIExleGluZy9Db21waWxpbmdcbiAgICovXG4gIGlubGluZVRva2VucyhzcmMsIHRva2VucyA9IFtdKSB7XG4gICAgbGV0IHRva2VuLCBsYXN0VG9rZW4sIGN1dFNyYztcblxuICAgIC8vIFN0cmluZyB3aXRoIGxpbmtzIG1hc2tlZCB0byBhdm9pZCBpbnRlcmZlcmVuY2Ugd2l0aCBlbSBhbmQgc3Ryb25nXG4gICAgbGV0IG1hc2tlZFNyYyA9IHNyYztcbiAgICBsZXQgbWF0Y2g7XG4gICAgbGV0IGtlZXBQcmV2Q2hhciwgcHJldkNoYXI7XG5cbiAgICAvLyBNYXNrIG91dCByZWZsaW5rc1xuICAgIGlmICh0aGlzLnRva2Vucy5saW5rcykge1xuICAgICAgY29uc3QgbGlua3MgPSBPYmplY3Qua2V5cyh0aGlzLnRva2Vucy5saW5rcyk7XG4gICAgICBpZiAobGlua3MubGVuZ3RoID4gMCkge1xuICAgICAgICB3aGlsZSAoKG1hdGNoID0gdGhpcy50b2tlbml6ZXIucnVsZXMuaW5saW5lLnJlZmxpbmtTZWFyY2guZXhlYyhtYXNrZWRTcmMpKSAhPSBudWxsKSB7XG4gICAgICAgICAgaWYgKGxpbmtzLmluY2x1ZGVzKG1hdGNoWzBdLnNsaWNlKG1hdGNoWzBdLmxhc3RJbmRleE9mKCdbJykgKyAxLCAtMSkpKSB7XG4gICAgICAgICAgICBtYXNrZWRTcmMgPSBtYXNrZWRTcmMuc2xpY2UoMCwgbWF0Y2guaW5kZXgpICsgJ1snICsgcmVwZWF0U3RyaW5nKCdhJywgbWF0Y2hbMF0ubGVuZ3RoIC0gMikgKyAnXScgKyBtYXNrZWRTcmMuc2xpY2UodGhpcy50b2tlbml6ZXIucnVsZXMuaW5saW5lLnJlZmxpbmtTZWFyY2gubGFzdEluZGV4KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgLy8gTWFzayBvdXQgb3RoZXIgYmxvY2tzXG4gICAgd2hpbGUgKChtYXRjaCA9IHRoaXMudG9rZW5pemVyLnJ1bGVzLmlubGluZS5ibG9ja1NraXAuZXhlYyhtYXNrZWRTcmMpKSAhPSBudWxsKSB7XG4gICAgICBtYXNrZWRTcmMgPSBtYXNrZWRTcmMuc2xpY2UoMCwgbWF0Y2guaW5kZXgpICsgJ1snICsgcmVwZWF0U3RyaW5nKCdhJywgbWF0Y2hbMF0ubGVuZ3RoIC0gMikgKyAnXScgKyBtYXNrZWRTcmMuc2xpY2UodGhpcy50b2tlbml6ZXIucnVsZXMuaW5saW5lLmJsb2NrU2tpcC5sYXN0SW5kZXgpO1xuICAgIH1cblxuICAgIC8vIE1hc2sgb3V0IGVzY2FwZWQgZW0gJiBzdHJvbmcgZGVsaW1pdGVyc1xuICAgIHdoaWxlICgobWF0Y2ggPSB0aGlzLnRva2VuaXplci5ydWxlcy5pbmxpbmUuZXNjYXBlZEVtU3QuZXhlYyhtYXNrZWRTcmMpKSAhPSBudWxsKSB7XG4gICAgICBtYXNrZWRTcmMgPSBtYXNrZWRTcmMuc2xpY2UoMCwgbWF0Y2guaW5kZXggKyBtYXRjaFswXS5sZW5ndGggLSAyKSArICcrKycgKyBtYXNrZWRTcmMuc2xpY2UodGhpcy50b2tlbml6ZXIucnVsZXMuaW5saW5lLmVzY2FwZWRFbVN0Lmxhc3RJbmRleCk7XG4gICAgICB0aGlzLnRva2VuaXplci5ydWxlcy5pbmxpbmUuZXNjYXBlZEVtU3QubGFzdEluZGV4LS07XG4gICAgfVxuXG4gICAgd2hpbGUgKHNyYykge1xuICAgICAgaWYgKCFrZWVwUHJldkNoYXIpIHtcbiAgICAgICAgcHJldkNoYXIgPSAnJztcbiAgICAgIH1cbiAgICAgIGtlZXBQcmV2Q2hhciA9IGZhbHNlO1xuXG4gICAgICAvLyBleHRlbnNpb25zXG4gICAgICBpZiAodGhpcy5vcHRpb25zLmV4dGVuc2lvbnNcbiAgICAgICAgJiYgdGhpcy5vcHRpb25zLmV4dGVuc2lvbnMuaW5saW5lXG4gICAgICAgICYmIHRoaXMub3B0aW9ucy5leHRlbnNpb25zLmlubGluZS5zb21lKChleHRUb2tlbml6ZXIpID0+IHtcbiAgICAgICAgICBpZiAodG9rZW4gPSBleHRUb2tlbml6ZXIuY2FsbCh7IGxleGVyOiB0aGlzIH0sIHNyYywgdG9rZW5zKSkge1xuICAgICAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0pKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBlc2NhcGVcbiAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLmVzY2FwZShzcmMpKSB7XG4gICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIHRhZ1xuICAgICAgaWYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIudGFnKHNyYykpIHtcbiAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgbGFzdFRva2VuID0gdG9rZW5zW3Rva2Vucy5sZW5ndGggLSAxXTtcbiAgICAgICAgaWYgKGxhc3RUb2tlbiAmJiB0b2tlbi50eXBlID09PSAndGV4dCcgJiYgbGFzdFRva2VuLnR5cGUgPT09ICd0ZXh0Jykge1xuICAgICAgICAgIGxhc3RUb2tlbi5yYXcgKz0gdG9rZW4ucmF3O1xuICAgICAgICAgIGxhc3RUb2tlbi50ZXh0ICs9IHRva2VuLnRleHQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICB9XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBsaW5rXG4gICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci5saW5rKHNyYykpIHtcbiAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gcmVmbGluaywgbm9saW5rXG4gICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci5yZWZsaW5rKHNyYywgdGhpcy50b2tlbnMubGlua3MpKSB7XG4gICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgIGxhc3RUb2tlbiA9IHRva2Vuc1t0b2tlbnMubGVuZ3RoIC0gMV07XG4gICAgICAgIGlmIChsYXN0VG9rZW4gJiYgdG9rZW4udHlwZSA9PT0gJ3RleHQnICYmIGxhc3RUb2tlbi50eXBlID09PSAndGV4dCcpIHtcbiAgICAgICAgICBsYXN0VG9rZW4ucmF3ICs9IHRva2VuLnJhdztcbiAgICAgICAgICBsYXN0VG9rZW4udGV4dCArPSB0b2tlbi50ZXh0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgfVxuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gZW0gJiBzdHJvbmdcbiAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLmVtU3Ryb25nKHNyYywgbWFza2VkU3JjLCBwcmV2Q2hhcikpIHtcbiAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gY29kZVxuICAgICAgaWYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIuY29kZXNwYW4oc3JjKSkge1xuICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBiclxuICAgICAgaWYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIuYnIoc3JjKSkge1xuICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBkZWwgKGdmbSlcbiAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLmRlbChzcmMpKSB7XG4gICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIGF1dG9saW5rXG4gICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci5hdXRvbGluayhzcmMsIG1hbmdsZSkpIHtcbiAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gdXJsIChnZm0pXG4gICAgICBpZiAoIXRoaXMuc3RhdGUuaW5MaW5rICYmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLnVybChzcmMsIG1hbmdsZSkpKSB7XG4gICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIHRleHRcbiAgICAgIC8vIHByZXZlbnQgaW5saW5lVGV4dCBjb25zdW1pbmcgZXh0ZW5zaW9ucyBieSBjbGlwcGluZyAnc3JjJyB0byBleHRlbnNpb24gc3RhcnRcbiAgICAgIGN1dFNyYyA9IHNyYztcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuZXh0ZW5zaW9ucyAmJiB0aGlzLm9wdGlvbnMuZXh0ZW5zaW9ucy5zdGFydElubGluZSkge1xuICAgICAgICBsZXQgc3RhcnRJbmRleCA9IEluZmluaXR5O1xuICAgICAgICBjb25zdCB0ZW1wU3JjID0gc3JjLnNsaWNlKDEpO1xuICAgICAgICBsZXQgdGVtcFN0YXJ0O1xuICAgICAgICB0aGlzLm9wdGlvbnMuZXh0ZW5zaW9ucy5zdGFydElubGluZS5mb3JFYWNoKGZ1bmN0aW9uKGdldFN0YXJ0SW5kZXgpIHtcbiAgICAgICAgICB0ZW1wU3RhcnQgPSBnZXRTdGFydEluZGV4LmNhbGwoeyBsZXhlcjogdGhpcyB9LCB0ZW1wU3JjKTtcbiAgICAgICAgICBpZiAodHlwZW9mIHRlbXBTdGFydCA9PT0gJ251bWJlcicgJiYgdGVtcFN0YXJ0ID49IDApIHsgc3RhcnRJbmRleCA9IE1hdGgubWluKHN0YXJ0SW5kZXgsIHRlbXBTdGFydCk7IH1cbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChzdGFydEluZGV4IDwgSW5maW5pdHkgJiYgc3RhcnRJbmRleCA+PSAwKSB7XG4gICAgICAgICAgY3V0U3JjID0gc3JjLnN1YnN0cmluZygwLCBzdGFydEluZGV4ICsgMSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLmlubGluZVRleHQoY3V0U3JjLCBzbWFydHlwYW50cykpIHtcbiAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgaWYgKHRva2VuLnJhdy5zbGljZSgtMSkgIT09ICdfJykgeyAvLyBUcmFjayBwcmV2Q2hhciBiZWZvcmUgc3RyaW5nIG9mIF9fX18gc3RhcnRlZFxuICAgICAgICAgIHByZXZDaGFyID0gdG9rZW4ucmF3LnNsaWNlKC0xKTtcbiAgICAgICAgfVxuICAgICAgICBrZWVwUHJldkNoYXIgPSB0cnVlO1xuICAgICAgICBsYXN0VG9rZW4gPSB0b2tlbnNbdG9rZW5zLmxlbmd0aCAtIDFdO1xuICAgICAgICBpZiAobGFzdFRva2VuICYmIGxhc3RUb2tlbi50eXBlID09PSAndGV4dCcpIHtcbiAgICAgICAgICBsYXN0VG9rZW4ucmF3ICs9IHRva2VuLnJhdztcbiAgICAgICAgICBsYXN0VG9rZW4udGV4dCArPSB0b2tlbi50ZXh0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgfVxuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKHNyYykge1xuICAgICAgICBjb25zdCBlcnJNc2cgPSAnSW5maW5pdGUgbG9vcCBvbiBieXRlOiAnICsgc3JjLmNoYXJDb2RlQXQoMCk7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuc2lsZW50KSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihlcnJNc2cpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJNc2cpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRva2VucztcbiAgfVxufVxuXG4vKipcbiAqIFJlbmRlcmVyXG4gKi9cbmNsYXNzIFJlbmRlcmVyIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHwgZGVmYXVsdHM7XG4gIH1cblxuICBjb2RlKGNvZGUsIGluZm9zdHJpbmcsIGVzY2FwZWQpIHtcbiAgICBjb25zdCBsYW5nID0gKGluZm9zdHJpbmcgfHwgJycpLm1hdGNoKC9cXFMqLylbMF07XG4gICAgaWYgKHRoaXMub3B0aW9ucy5oaWdobGlnaHQpIHtcbiAgICAgIGNvbnN0IG91dCA9IHRoaXMub3B0aW9ucy5oaWdobGlnaHQoY29kZSwgbGFuZyk7XG4gICAgICBpZiAob3V0ICE9IG51bGwgJiYgb3V0ICE9PSBjb2RlKSB7XG4gICAgICAgIGVzY2FwZWQgPSB0cnVlO1xuICAgICAgICBjb2RlID0gb3V0O1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvZGUgPSBjb2RlLnJlcGxhY2UoL1xcbiQvLCAnJykgKyAnXFxuJztcblxuICAgIGlmICghbGFuZykge1xuICAgICAgcmV0dXJuICc8cHJlPjxjb2RlPidcbiAgICAgICAgKyAoZXNjYXBlZCA/IGNvZGUgOiBlc2NhcGUoY29kZSwgdHJ1ZSkpXG4gICAgICAgICsgJzwvY29kZT48L3ByZT5cXG4nO1xuICAgIH1cblxuICAgIHJldHVybiAnPHByZT48Y29kZSBjbGFzcz1cIidcbiAgICAgICsgdGhpcy5vcHRpb25zLmxhbmdQcmVmaXhcbiAgICAgICsgZXNjYXBlKGxhbmcpXG4gICAgICArICdcIj4nXG4gICAgICArIChlc2NhcGVkID8gY29kZSA6IGVzY2FwZShjb2RlLCB0cnVlKSlcbiAgICAgICsgJzwvY29kZT48L3ByZT5cXG4nO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBxdW90ZVxuICAgKi9cbiAgYmxvY2txdW90ZShxdW90ZSkge1xuICAgIHJldHVybiBgPGJsb2NrcXVvdGU+XFxuJHtxdW90ZX08L2Jsb2NrcXVvdGU+XFxuYDtcbiAgfVxuXG4gIGh0bWwoaHRtbCkge1xuICAgIHJldHVybiBodG1sO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0XG4gICAqIEBwYXJhbSB7c3RyaW5nfSBsZXZlbFxuICAgKiBAcGFyYW0ge3N0cmluZ30gcmF3XG4gICAqIEBwYXJhbSB7YW55fSBzbHVnZ2VyXG4gICAqL1xuICBoZWFkaW5nKHRleHQsIGxldmVsLCByYXcsIHNsdWdnZXIpIHtcbiAgICBpZiAodGhpcy5vcHRpb25zLmhlYWRlcklkcykge1xuICAgICAgY29uc3QgaWQgPSB0aGlzLm9wdGlvbnMuaGVhZGVyUHJlZml4ICsgc2x1Z2dlci5zbHVnKHJhdyk7XG4gICAgICByZXR1cm4gYDxoJHtsZXZlbH0gaWQ9XCIke2lkfVwiPiR7dGV4dH08L2gke2xldmVsfT5cXG5gO1xuICAgIH1cblxuICAgIC8vIGlnbm9yZSBJRHNcbiAgICByZXR1cm4gYDxoJHtsZXZlbH0+JHt0ZXh0fTwvaCR7bGV2ZWx9PlxcbmA7XG4gIH1cblxuICBocigpIHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLnhodG1sID8gJzxoci8+XFxuJyA6ICc8aHI+XFxuJztcbiAgfVxuXG4gIGxpc3QoYm9keSwgb3JkZXJlZCwgc3RhcnQpIHtcbiAgICBjb25zdCB0eXBlID0gb3JkZXJlZCA/ICdvbCcgOiAndWwnLFxuICAgICAgc3RhcnRhdHQgPSAob3JkZXJlZCAmJiBzdGFydCAhPT0gMSkgPyAoJyBzdGFydD1cIicgKyBzdGFydCArICdcIicpIDogJyc7XG4gICAgcmV0dXJuICc8JyArIHR5cGUgKyBzdGFydGF0dCArICc+XFxuJyArIGJvZHkgKyAnPC8nICsgdHlwZSArICc+XFxuJztcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGV4dFxuICAgKi9cbiAgbGlzdGl0ZW0odGV4dCkge1xuICAgIHJldHVybiBgPGxpPiR7dGV4dH08L2xpPlxcbmA7XG4gIH1cblxuICBjaGVja2JveChjaGVja2VkKSB7XG4gICAgcmV0dXJuICc8aW5wdXQgJ1xuICAgICAgKyAoY2hlY2tlZCA/ICdjaGVja2VkPVwiXCIgJyA6ICcnKVxuICAgICAgKyAnZGlzYWJsZWQ9XCJcIiB0eXBlPVwiY2hlY2tib3hcIidcbiAgICAgICsgKHRoaXMub3B0aW9ucy54aHRtbCA/ICcgLycgOiAnJylcbiAgICAgICsgJz4gJztcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGV4dFxuICAgKi9cbiAgcGFyYWdyYXBoKHRleHQpIHtcbiAgICByZXR1cm4gYDxwPiR7dGV4dH08L3A+XFxuYDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gaGVhZGVyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBib2R5XG4gICAqL1xuICB0YWJsZShoZWFkZXIsIGJvZHkpIHtcbiAgICBpZiAoYm9keSkgYm9keSA9IGA8dGJvZHk+JHtib2R5fTwvdGJvZHk+YDtcblxuICAgIHJldHVybiAnPHRhYmxlPlxcbidcbiAgICAgICsgJzx0aGVhZD5cXG4nXG4gICAgICArIGhlYWRlclxuICAgICAgKyAnPC90aGVhZD5cXG4nXG4gICAgICArIGJvZHlcbiAgICAgICsgJzwvdGFibGU+XFxuJztcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gY29udGVudFxuICAgKi9cbiAgdGFibGVyb3coY29udGVudCkge1xuICAgIHJldHVybiBgPHRyPlxcbiR7Y29udGVudH08L3RyPlxcbmA7XG4gIH1cblxuICB0YWJsZWNlbGwoY29udGVudCwgZmxhZ3MpIHtcbiAgICBjb25zdCB0eXBlID0gZmxhZ3MuaGVhZGVyID8gJ3RoJyA6ICd0ZCc7XG4gICAgY29uc3QgdGFnID0gZmxhZ3MuYWxpZ25cbiAgICAgID8gYDwke3R5cGV9IGFsaWduPVwiJHtmbGFncy5hbGlnbn1cIj5gXG4gICAgICA6IGA8JHt0eXBlfT5gO1xuICAgIHJldHVybiB0YWcgKyBjb250ZW50ICsgYDwvJHt0eXBlfT5cXG5gO1xuICB9XG5cbiAgLyoqXG4gICAqIHNwYW4gbGV2ZWwgcmVuZGVyZXJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHRleHRcbiAgICovXG4gIHN0cm9uZyh0ZXh0KSB7XG4gICAgcmV0dXJuIGA8c3Ryb25nPiR7dGV4dH08L3N0cm9uZz5gO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0XG4gICAqL1xuICBlbSh0ZXh0KSB7XG4gICAgcmV0dXJuIGA8ZW0+JHt0ZXh0fTwvZW0+YDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGV4dFxuICAgKi9cbiAgY29kZXNwYW4odGV4dCkge1xuICAgIHJldHVybiBgPGNvZGU+JHt0ZXh0fTwvY29kZT5gO1xuICB9XG5cbiAgYnIoKSB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy54aHRtbCA/ICc8YnIvPicgOiAnPGJyPic7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IHRleHRcbiAgICovXG4gIGRlbCh0ZXh0KSB7XG4gICAgcmV0dXJuIGA8ZGVsPiR7dGV4dH08L2RlbD5gO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBocmVmXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0aXRsZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGV4dFxuICAgKi9cbiAgbGluayhocmVmLCB0aXRsZSwgdGV4dCkge1xuICAgIGhyZWYgPSBjbGVhblVybCh0aGlzLm9wdGlvbnMuc2FuaXRpemUsIHRoaXMub3B0aW9ucy5iYXNlVXJsLCBocmVmKTtcbiAgICBpZiAoaHJlZiA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRleHQ7XG4gICAgfVxuICAgIGxldCBvdXQgPSAnPGEgaHJlZj1cIicgKyBocmVmICsgJ1wiJztcbiAgICBpZiAodGl0bGUpIHtcbiAgICAgIG91dCArPSAnIHRpdGxlPVwiJyArIHRpdGxlICsgJ1wiJztcbiAgICB9XG4gICAgb3V0ICs9ICc+JyArIHRleHQgKyAnPC9hPic7XG4gICAgcmV0dXJuIG91dDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gaHJlZlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGl0bGVcbiAgICogQHBhcmFtIHtzdHJpbmd9IHRleHRcbiAgICovXG4gIGltYWdlKGhyZWYsIHRpdGxlLCB0ZXh0KSB7XG4gICAgaHJlZiA9IGNsZWFuVXJsKHRoaXMub3B0aW9ucy5zYW5pdGl6ZSwgdGhpcy5vcHRpb25zLmJhc2VVcmwsIGhyZWYpO1xuICAgIGlmIChocmVmID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gdGV4dDtcbiAgICB9XG5cbiAgICBsZXQgb3V0ID0gYDxpbWcgc3JjPVwiJHtocmVmfVwiIGFsdD1cIiR7dGV4dH1cImA7XG4gICAgaWYgKHRpdGxlKSB7XG4gICAgICBvdXQgKz0gYCB0aXRsZT1cIiR7dGl0bGV9XCJgO1xuICAgIH1cbiAgICBvdXQgKz0gdGhpcy5vcHRpb25zLnhodG1sID8gJy8+JyA6ICc+JztcbiAgICByZXR1cm4gb3V0O1xuICB9XG5cbiAgdGV4dCh0ZXh0KSB7XG4gICAgcmV0dXJuIHRleHQ7XG4gIH1cbn1cblxuLyoqXG4gKiBUZXh0UmVuZGVyZXJcbiAqIHJldHVybnMgb25seSB0aGUgdGV4dHVhbCBwYXJ0IG9mIHRoZSB0b2tlblxuICovXG5jbGFzcyBUZXh0UmVuZGVyZXIge1xuICAvLyBubyBuZWVkIGZvciBibG9jayBsZXZlbCByZW5kZXJlcnNcbiAgc3Ryb25nKHRleHQpIHtcbiAgICByZXR1cm4gdGV4dDtcbiAgfVxuXG4gIGVtKHRleHQpIHtcbiAgICByZXR1cm4gdGV4dDtcbiAgfVxuXG4gIGNvZGVzcGFuKHRleHQpIHtcbiAgICByZXR1cm4gdGV4dDtcbiAgfVxuXG4gIGRlbCh0ZXh0KSB7XG4gICAgcmV0dXJuIHRleHQ7XG4gIH1cblxuICBodG1sKHRleHQpIHtcbiAgICByZXR1cm4gdGV4dDtcbiAgfVxuXG4gIHRleHQodGV4dCkge1xuICAgIHJldHVybiB0ZXh0O1xuICB9XG5cbiAgbGluayhocmVmLCB0aXRsZSwgdGV4dCkge1xuICAgIHJldHVybiAnJyArIHRleHQ7XG4gIH1cblxuICBpbWFnZShocmVmLCB0aXRsZSwgdGV4dCkge1xuICAgIHJldHVybiAnJyArIHRleHQ7XG4gIH1cblxuICBicigpIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cbn1cblxuLyoqXG4gKiBTbHVnZ2VyIGdlbmVyYXRlcyBoZWFkZXIgaWRcbiAqL1xuY2xhc3MgU2x1Z2dlciB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuc2VlbiA9IHt9O1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZVxuICAgKi9cbiAgc2VyaWFsaXplKHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlXG4gICAgICAudG9Mb3dlckNhc2UoKVxuICAgICAgLnRyaW0oKVxuICAgICAgLy8gcmVtb3ZlIGh0bWwgdGFnc1xuICAgICAgLnJlcGxhY2UoLzxbIVxcL2Etel0uKj8+L2lnLCAnJylcbiAgICAgIC8vIHJlbW92ZSB1bndhbnRlZCBjaGFyc1xuICAgICAgLnJlcGxhY2UoL1tcXHUyMDAwLVxcdTIwNkZcXHUyRTAwLVxcdTJFN0ZcXFxcJyFcIiMkJSYoKSorLC4vOjs8PT4/QFtcXF1eYHt8fX5dL2csICcnKVxuICAgICAgLnJlcGxhY2UoL1xccy9nLCAnLScpO1xuICB9XG5cbiAgLyoqXG4gICAqIEZpbmRzIHRoZSBuZXh0IHNhZmUgKHVuaXF1ZSkgc2x1ZyB0byB1c2VcbiAgICogQHBhcmFtIHtzdHJpbmd9IG9yaWdpbmFsU2x1Z1xuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGlzRHJ5UnVuXG4gICAqL1xuICBnZXROZXh0U2FmZVNsdWcob3JpZ2luYWxTbHVnLCBpc0RyeVJ1bikge1xuICAgIGxldCBzbHVnID0gb3JpZ2luYWxTbHVnO1xuICAgIGxldCBvY2N1cmVuY2VBY2N1bXVsYXRvciA9IDA7XG4gICAgaWYgKHRoaXMuc2Vlbi5oYXNPd25Qcm9wZXJ0eShzbHVnKSkge1xuICAgICAgb2NjdXJlbmNlQWNjdW11bGF0b3IgPSB0aGlzLnNlZW5bb3JpZ2luYWxTbHVnXTtcbiAgICAgIGRvIHtcbiAgICAgICAgb2NjdXJlbmNlQWNjdW11bGF0b3IrKztcbiAgICAgICAgc2x1ZyA9IG9yaWdpbmFsU2x1ZyArICctJyArIG9jY3VyZW5jZUFjY3VtdWxhdG9yO1xuICAgICAgfSB3aGlsZSAodGhpcy5zZWVuLmhhc093blByb3BlcnR5KHNsdWcpKTtcbiAgICB9XG4gICAgaWYgKCFpc0RyeVJ1bikge1xuICAgICAgdGhpcy5zZWVuW29yaWdpbmFsU2x1Z10gPSBvY2N1cmVuY2VBY2N1bXVsYXRvcjtcbiAgICAgIHRoaXMuc2VlbltzbHVnXSA9IDA7XG4gICAgfVxuICAgIHJldHVybiBzbHVnO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlcnQgc3RyaW5nIHRvIHVuaXF1ZSBpZFxuICAgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnNdXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gW29wdGlvbnMuZHJ5cnVuXSBHZW5lcmF0ZXMgdGhlIG5leHQgdW5pcXVlIHNsdWcgd2l0aG91dFxuICAgKiB1cGRhdGluZyB0aGUgaW50ZXJuYWwgYWNjdW11bGF0b3IuXG4gICAqL1xuICBzbHVnKHZhbHVlLCBvcHRpb25zID0ge30pIHtcbiAgICBjb25zdCBzbHVnID0gdGhpcy5zZXJpYWxpemUodmFsdWUpO1xuICAgIHJldHVybiB0aGlzLmdldE5leHRTYWZlU2x1ZyhzbHVnLCBvcHRpb25zLmRyeXJ1bik7XG4gIH1cbn1cblxuLyoqXG4gKiBQYXJzaW5nICYgQ29tcGlsaW5nXG4gKi9cbmNsYXNzIFBhcnNlciB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IGRlZmF1bHRzO1xuICAgIHRoaXMub3B0aW9ucy5yZW5kZXJlciA9IHRoaXMub3B0aW9ucy5yZW5kZXJlciB8fCBuZXcgUmVuZGVyZXIoKTtcbiAgICB0aGlzLnJlbmRlcmVyID0gdGhpcy5vcHRpb25zLnJlbmRlcmVyO1xuICAgIHRoaXMucmVuZGVyZXIub3B0aW9ucyA9IHRoaXMub3B0aW9ucztcbiAgICB0aGlzLnRleHRSZW5kZXJlciA9IG5ldyBUZXh0UmVuZGVyZXIoKTtcbiAgICB0aGlzLnNsdWdnZXIgPSBuZXcgU2x1Z2dlcigpO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YXRpYyBQYXJzZSBNZXRob2RcbiAgICovXG4gIHN0YXRpYyBwYXJzZSh0b2tlbnMsIG9wdGlvbnMpIHtcbiAgICBjb25zdCBwYXJzZXIgPSBuZXcgUGFyc2VyKG9wdGlvbnMpO1xuICAgIHJldHVybiBwYXJzZXIucGFyc2UodG9rZW5zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGF0aWMgUGFyc2UgSW5saW5lIE1ldGhvZFxuICAgKi9cbiAgc3RhdGljIHBhcnNlSW5saW5lKHRva2Vucywgb3B0aW9ucykge1xuICAgIGNvbnN0IHBhcnNlciA9IG5ldyBQYXJzZXIob3B0aW9ucyk7XG4gICAgcmV0dXJuIHBhcnNlci5wYXJzZUlubGluZSh0b2tlbnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFBhcnNlIExvb3BcbiAgICovXG4gIHBhcnNlKHRva2VucywgdG9wID0gdHJ1ZSkge1xuICAgIGxldCBvdXQgPSAnJyxcbiAgICAgIGksXG4gICAgICBqLFxuICAgICAgayxcbiAgICAgIGwyLFxuICAgICAgbDMsXG4gICAgICByb3csXG4gICAgICBjZWxsLFxuICAgICAgaGVhZGVyLFxuICAgICAgYm9keSxcbiAgICAgIHRva2VuLFxuICAgICAgb3JkZXJlZCxcbiAgICAgIHN0YXJ0LFxuICAgICAgbG9vc2UsXG4gICAgICBpdGVtQm9keSxcbiAgICAgIGl0ZW0sXG4gICAgICBjaGVja2VkLFxuICAgICAgdGFzayxcbiAgICAgIGNoZWNrYm94LFxuICAgICAgcmV0O1xuXG4gICAgY29uc3QgbCA9IHRva2Vucy5sZW5ndGg7XG4gICAgZm9yIChpID0gMDsgaSA8IGw7IGkrKykge1xuICAgICAgdG9rZW4gPSB0b2tlbnNbaV07XG5cbiAgICAgIC8vIFJ1biBhbnkgcmVuZGVyZXIgZXh0ZW5zaW9uc1xuICAgICAgaWYgKHRoaXMub3B0aW9ucy5leHRlbnNpb25zICYmIHRoaXMub3B0aW9ucy5leHRlbnNpb25zLnJlbmRlcmVycyAmJiB0aGlzLm9wdGlvbnMuZXh0ZW5zaW9ucy5yZW5kZXJlcnNbdG9rZW4udHlwZV0pIHtcbiAgICAgICAgcmV0ID0gdGhpcy5vcHRpb25zLmV4dGVuc2lvbnMucmVuZGVyZXJzW3Rva2VuLnR5cGVdLmNhbGwoeyBwYXJzZXI6IHRoaXMgfSwgdG9rZW4pO1xuICAgICAgICBpZiAocmV0ICE9PSBmYWxzZSB8fCAhWydzcGFjZScsICdocicsICdoZWFkaW5nJywgJ2NvZGUnLCAndGFibGUnLCAnYmxvY2txdW90ZScsICdsaXN0JywgJ2h0bWwnLCAncGFyYWdyYXBoJywgJ3RleHQnXS5pbmNsdWRlcyh0b2tlbi50eXBlKSkge1xuICAgICAgICAgIG91dCArPSByZXQgfHwgJyc7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgc3dpdGNoICh0b2tlbi50eXBlKSB7XG4gICAgICAgIGNhc2UgJ3NwYWNlJzoge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgJ2hyJzoge1xuICAgICAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLmhyKCk7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAnaGVhZGluZyc6IHtcbiAgICAgICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5oZWFkaW5nKFxuICAgICAgICAgICAgdGhpcy5wYXJzZUlubGluZSh0b2tlbi50b2tlbnMpLFxuICAgICAgICAgICAgdG9rZW4uZGVwdGgsXG4gICAgICAgICAgICB1bmVzY2FwZSh0aGlzLnBhcnNlSW5saW5lKHRva2VuLnRva2VucywgdGhpcy50ZXh0UmVuZGVyZXIpKSxcbiAgICAgICAgICAgIHRoaXMuc2x1Z2dlcik7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAnY29kZSc6IHtcbiAgICAgICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5jb2RlKHRva2VuLnRleHQsXG4gICAgICAgICAgICB0b2tlbi5sYW5nLFxuICAgICAgICAgICAgdG9rZW4uZXNjYXBlZCk7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAndGFibGUnOiB7XG4gICAgICAgICAgaGVhZGVyID0gJyc7XG5cbiAgICAgICAgICAvLyBoZWFkZXJcbiAgICAgICAgICBjZWxsID0gJyc7XG4gICAgICAgICAgbDIgPSB0b2tlbi5oZWFkZXIubGVuZ3RoO1xuICAgICAgICAgIGZvciAoaiA9IDA7IGogPCBsMjsgaisrKSB7XG4gICAgICAgICAgICBjZWxsICs9IHRoaXMucmVuZGVyZXIudGFibGVjZWxsKFxuICAgICAgICAgICAgICB0aGlzLnBhcnNlSW5saW5lKHRva2VuLmhlYWRlcltqXS50b2tlbnMpLFxuICAgICAgICAgICAgICB7IGhlYWRlcjogdHJ1ZSwgYWxpZ246IHRva2VuLmFsaWduW2pdIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGhlYWRlciArPSB0aGlzLnJlbmRlcmVyLnRhYmxlcm93KGNlbGwpO1xuXG4gICAgICAgICAgYm9keSA9ICcnO1xuICAgICAgICAgIGwyID0gdG9rZW4ucm93cy5sZW5ndGg7XG4gICAgICAgICAgZm9yIChqID0gMDsgaiA8IGwyOyBqKyspIHtcbiAgICAgICAgICAgIHJvdyA9IHRva2VuLnJvd3Nbal07XG5cbiAgICAgICAgICAgIGNlbGwgPSAnJztcbiAgICAgICAgICAgIGwzID0gcm93Lmxlbmd0aDtcbiAgICAgICAgICAgIGZvciAoayA9IDA7IGsgPCBsMzsgaysrKSB7XG4gICAgICAgICAgICAgIGNlbGwgKz0gdGhpcy5yZW5kZXJlci50YWJsZWNlbGwoXG4gICAgICAgICAgICAgICAgdGhpcy5wYXJzZUlubGluZShyb3dba10udG9rZW5zKSxcbiAgICAgICAgICAgICAgICB7IGhlYWRlcjogZmFsc2UsIGFsaWduOiB0b2tlbi5hbGlnbltrXSB9XG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGJvZHkgKz0gdGhpcy5yZW5kZXJlci50YWJsZXJvdyhjZWxsKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIudGFibGUoaGVhZGVyLCBib2R5KTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjYXNlICdibG9ja3F1b3RlJzoge1xuICAgICAgICAgIGJvZHkgPSB0aGlzLnBhcnNlKHRva2VuLnRva2Vucyk7XG4gICAgICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIuYmxvY2txdW90ZShib2R5KTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjYXNlICdsaXN0Jzoge1xuICAgICAgICAgIG9yZGVyZWQgPSB0b2tlbi5vcmRlcmVkO1xuICAgICAgICAgIHN0YXJ0ID0gdG9rZW4uc3RhcnQ7XG4gICAgICAgICAgbG9vc2UgPSB0b2tlbi5sb29zZTtcbiAgICAgICAgICBsMiA9IHRva2VuLml0ZW1zLmxlbmd0aDtcblxuICAgICAgICAgIGJvZHkgPSAnJztcbiAgICAgICAgICBmb3IgKGogPSAwOyBqIDwgbDI7IGorKykge1xuICAgICAgICAgICAgaXRlbSA9IHRva2VuLml0ZW1zW2pdO1xuICAgICAgICAgICAgY2hlY2tlZCA9IGl0ZW0uY2hlY2tlZDtcbiAgICAgICAgICAgIHRhc2sgPSBpdGVtLnRhc2s7XG5cbiAgICAgICAgICAgIGl0ZW1Cb2R5ID0gJyc7XG4gICAgICAgICAgICBpZiAoaXRlbS50YXNrKSB7XG4gICAgICAgICAgICAgIGNoZWNrYm94ID0gdGhpcy5yZW5kZXJlci5jaGVja2JveChjaGVja2VkKTtcbiAgICAgICAgICAgICAgaWYgKGxvb3NlKSB7XG4gICAgICAgICAgICAgICAgaWYgKGl0ZW0udG9rZW5zLmxlbmd0aCA+IDAgJiYgaXRlbS50b2tlbnNbMF0udHlwZSA9PT0gJ3BhcmFncmFwaCcpIHtcbiAgICAgICAgICAgICAgICAgIGl0ZW0udG9rZW5zWzBdLnRleHQgPSBjaGVja2JveCArICcgJyArIGl0ZW0udG9rZW5zWzBdLnRleHQ7XG4gICAgICAgICAgICAgICAgICBpZiAoaXRlbS50b2tlbnNbMF0udG9rZW5zICYmIGl0ZW0udG9rZW5zWzBdLnRva2Vucy5sZW5ndGggPiAwICYmIGl0ZW0udG9rZW5zWzBdLnRva2Vuc1swXS50eXBlID09PSAndGV4dCcpIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbS50b2tlbnNbMF0udG9rZW5zWzBdLnRleHQgPSBjaGVja2JveCArICcgJyArIGl0ZW0udG9rZW5zWzBdLnRva2Vuc1swXS50ZXh0O1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICBpdGVtLnRva2Vucy51bnNoaWZ0KHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3RleHQnLFxuICAgICAgICAgICAgICAgICAgICB0ZXh0OiBjaGVja2JveFxuICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGl0ZW1Cb2R5ICs9IGNoZWNrYm94O1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGl0ZW1Cb2R5ICs9IHRoaXMucGFyc2UoaXRlbS50b2tlbnMsIGxvb3NlKTtcbiAgICAgICAgICAgIGJvZHkgKz0gdGhpcy5yZW5kZXJlci5saXN0aXRlbShpdGVtQm9keSwgdGFzaywgY2hlY2tlZCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIubGlzdChib2R5LCBvcmRlcmVkLCBzdGFydCk7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAnaHRtbCc6IHtcbiAgICAgICAgICAvLyBUT0RPIHBhcnNlIGlubGluZSBjb250ZW50IGlmIHBhcmFtZXRlciBtYXJrZG93bj0xXG4gICAgICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIuaHRtbCh0b2tlbi50ZXh0KTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjYXNlICdwYXJhZ3JhcGgnOiB7XG4gICAgICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIucGFyYWdyYXBoKHRoaXMucGFyc2VJbmxpbmUodG9rZW4udG9rZW5zKSk7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAndGV4dCc6IHtcbiAgICAgICAgICBib2R5ID0gdG9rZW4udG9rZW5zID8gdGhpcy5wYXJzZUlubGluZSh0b2tlbi50b2tlbnMpIDogdG9rZW4udGV4dDtcbiAgICAgICAgICB3aGlsZSAoaSArIDEgPCBsICYmIHRva2Vuc1tpICsgMV0udHlwZSA9PT0gJ3RleHQnKSB7XG4gICAgICAgICAgICB0b2tlbiA9IHRva2Vuc1srK2ldO1xuICAgICAgICAgICAgYm9keSArPSAnXFxuJyArICh0b2tlbi50b2tlbnMgPyB0aGlzLnBhcnNlSW5saW5lKHRva2VuLnRva2VucykgOiB0b2tlbi50ZXh0KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgb3V0ICs9IHRvcCA/IHRoaXMucmVuZGVyZXIucGFyYWdyYXBoKGJvZHkpIDogYm9keTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICBjb25zdCBlcnJNc2cgPSAnVG9rZW4gd2l0aCBcIicgKyB0b2tlbi50eXBlICsgJ1wiIHR5cGUgd2FzIG5vdCBmb3VuZC4nO1xuICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuc2lsZW50KSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVyck1zZyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJNc2cpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBvdXQ7XG4gIH1cblxuICAvKipcbiAgICogUGFyc2UgSW5saW5lIFRva2Vuc1xuICAgKi9cbiAgcGFyc2VJbmxpbmUodG9rZW5zLCByZW5kZXJlcikge1xuICAgIHJlbmRlcmVyID0gcmVuZGVyZXIgfHwgdGhpcy5yZW5kZXJlcjtcbiAgICBsZXQgb3V0ID0gJycsXG4gICAgICBpLFxuICAgICAgdG9rZW4sXG4gICAgICByZXQ7XG5cbiAgICBjb25zdCBsID0gdG9rZW5zLmxlbmd0aDtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgICB0b2tlbiA9IHRva2Vuc1tpXTtcblxuICAgICAgLy8gUnVuIGFueSByZW5kZXJlciBleHRlbnNpb25zXG4gICAgICBpZiAodGhpcy5vcHRpb25zLmV4dGVuc2lvbnMgJiYgdGhpcy5vcHRpb25zLmV4dGVuc2lvbnMucmVuZGVyZXJzICYmIHRoaXMub3B0aW9ucy5leHRlbnNpb25zLnJlbmRlcmVyc1t0b2tlbi50eXBlXSkge1xuICAgICAgICByZXQgPSB0aGlzLm9wdGlvbnMuZXh0ZW5zaW9ucy5yZW5kZXJlcnNbdG9rZW4udHlwZV0uY2FsbCh7IHBhcnNlcjogdGhpcyB9LCB0b2tlbik7XG4gICAgICAgIGlmIChyZXQgIT09IGZhbHNlIHx8ICFbJ2VzY2FwZScsICdodG1sJywgJ2xpbmsnLCAnaW1hZ2UnLCAnc3Ryb25nJywgJ2VtJywgJ2NvZGVzcGFuJywgJ2JyJywgJ2RlbCcsICd0ZXh0J10uaW5jbHVkZXModG9rZW4udHlwZSkpIHtcbiAgICAgICAgICBvdXQgKz0gcmV0IHx8ICcnO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHN3aXRjaCAodG9rZW4udHlwZSkge1xuICAgICAgICBjYXNlICdlc2NhcGUnOiB7XG4gICAgICAgICAgb3V0ICs9IHJlbmRlcmVyLnRleHQodG9rZW4udGV4dCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAnaHRtbCc6IHtcbiAgICAgICAgICBvdXQgKz0gcmVuZGVyZXIuaHRtbCh0b2tlbi50ZXh0KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjYXNlICdsaW5rJzoge1xuICAgICAgICAgIG91dCArPSByZW5kZXJlci5saW5rKHRva2VuLmhyZWYsIHRva2VuLnRpdGxlLCB0aGlzLnBhcnNlSW5saW5lKHRva2VuLnRva2VucywgcmVuZGVyZXIpKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjYXNlICdpbWFnZSc6IHtcbiAgICAgICAgICBvdXQgKz0gcmVuZGVyZXIuaW1hZ2UodG9rZW4uaHJlZiwgdG9rZW4udGl0bGUsIHRva2VuLnRleHQpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgJ3N0cm9uZyc6IHtcbiAgICAgICAgICBvdXQgKz0gcmVuZGVyZXIuc3Ryb25nKHRoaXMucGFyc2VJbmxpbmUodG9rZW4udG9rZW5zLCByZW5kZXJlcikpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgJ2VtJzoge1xuICAgICAgICAgIG91dCArPSByZW5kZXJlci5lbSh0aGlzLnBhcnNlSW5saW5lKHRva2VuLnRva2VucywgcmVuZGVyZXIpKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjYXNlICdjb2Rlc3Bhbic6IHtcbiAgICAgICAgICBvdXQgKz0gcmVuZGVyZXIuY29kZXNwYW4odG9rZW4udGV4dCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAnYnInOiB7XG4gICAgICAgICAgb3V0ICs9IHJlbmRlcmVyLmJyKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAnZGVsJzoge1xuICAgICAgICAgIG91dCArPSByZW5kZXJlci5kZWwodGhpcy5wYXJzZUlubGluZSh0b2tlbi50b2tlbnMsIHJlbmRlcmVyKSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAndGV4dCc6IHtcbiAgICAgICAgICBvdXQgKz0gcmVuZGVyZXIudGV4dCh0b2tlbi50ZXh0KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBkZWZhdWx0OiB7XG4gICAgICAgICAgY29uc3QgZXJyTXNnID0gJ1Rva2VuIHdpdGggXCInICsgdG9rZW4udHlwZSArICdcIiB0eXBlIHdhcyBub3QgZm91bmQuJztcbiAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnNpbGVudCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJNc2cpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyTXNnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG91dDtcbiAgfVxufVxuXG5jbGFzcyBIb29rcyB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IGRlZmF1bHRzO1xuICB9XG5cbiAgc3RhdGljIHBhc3NUaHJvdWdoSG9va3MgPSBuZXcgU2V0KFtcbiAgICAncHJlcHJvY2VzcycsXG4gICAgJ3Bvc3Rwcm9jZXNzJ1xuICBdKTtcblxuICAvKipcbiAgICogUHJvY2VzcyBtYXJrZG93biBiZWZvcmUgbWFya2VkXG4gICAqL1xuICBwcmVwcm9jZXNzKG1hcmtkb3duKSB7XG4gICAgcmV0dXJuIG1hcmtkb3duO1xuICB9XG5cbiAgLyoqXG4gICAqIFByb2Nlc3MgSFRNTCBhZnRlciBtYXJrZWQgaXMgZmluaXNoZWRcbiAgICovXG4gIHBvc3Rwcm9jZXNzKGh0bWwpIHtcbiAgICByZXR1cm4gaHRtbDtcbiAgfVxufVxuXG5mdW5jdGlvbiBvbkVycm9yKHNpbGVudCwgYXN5bmMsIGNhbGxiYWNrKSB7XG4gIHJldHVybiAoZSkgPT4ge1xuICAgIGUubWVzc2FnZSArPSAnXFxuUGxlYXNlIHJlcG9ydCB0aGlzIHRvIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXJrZWRqcy9tYXJrZWQuJztcblxuICAgIGlmIChzaWxlbnQpIHtcbiAgICAgIGNvbnN0IG1zZyA9ICc8cD5BbiBlcnJvciBvY2N1cnJlZDo8L3A+PHByZT4nXG4gICAgICAgICsgZXNjYXBlKGUubWVzc2FnZSArICcnLCB0cnVlKVxuICAgICAgICArICc8L3ByZT4nO1xuICAgICAgaWYgKGFzeW5jKSB7XG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobXNnKTtcbiAgICAgIH1cbiAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayhudWxsLCBtc2cpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICByZXR1cm4gbXNnO1xuICAgIH1cblxuICAgIGlmIChhc3luYykge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVqZWN0KGUpO1xuICAgIH1cbiAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgIGNhbGxiYWNrKGUpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aHJvdyBlO1xuICB9O1xufVxuXG5mdW5jdGlvbiBwYXJzZU1hcmtkb3duKGxleGVyLCBwYXJzZXIpIHtcbiAgcmV0dXJuIChzcmMsIG9wdCwgY2FsbGJhY2spID0+IHtcbiAgICBpZiAodHlwZW9mIG9wdCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY2FsbGJhY2sgPSBvcHQ7XG4gICAgICBvcHQgPSBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IG9yaWdPcHQgPSB7IC4uLm9wdCB9O1xuICAgIG9wdCA9IHsgLi4ubWFya2VkLmRlZmF1bHRzLCAuLi5vcmlnT3B0IH07XG4gICAgY29uc3QgdGhyb3dFcnJvciA9IG9uRXJyb3Iob3B0LnNpbGVudCwgb3B0LmFzeW5jLCBjYWxsYmFjayk7XG5cbiAgICAvLyB0aHJvdyBlcnJvciBpbiBjYXNlIG9mIG5vbiBzdHJpbmcgaW5wdXRcbiAgICBpZiAodHlwZW9mIHNyYyA9PT0gJ3VuZGVmaW5lZCcgfHwgc3JjID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gdGhyb3dFcnJvcihuZXcgRXJyb3IoJ21hcmtlZCgpOiBpbnB1dCBwYXJhbWV0ZXIgaXMgdW5kZWZpbmVkIG9yIG51bGwnKSk7XG4gICAgfVxuICAgIGlmICh0eXBlb2Ygc3JjICE9PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuIHRocm93RXJyb3IobmV3IEVycm9yKCdtYXJrZWQoKTogaW5wdXQgcGFyYW1ldGVyIGlzIG9mIHR5cGUgJ1xuICAgICAgICArIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChzcmMpICsgJywgc3RyaW5nIGV4cGVjdGVkJykpO1xuICAgIH1cblxuICAgIGNoZWNrU2FuaXRpemVEZXByZWNhdGlvbihvcHQpO1xuXG4gICAgaWYgKG9wdC5ob29rcykge1xuICAgICAgb3B0Lmhvb2tzLm9wdGlvbnMgPSBvcHQ7XG4gICAgfVxuXG4gICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICBjb25zdCBoaWdobGlnaHQgPSBvcHQuaGlnaGxpZ2h0O1xuICAgICAgbGV0IHRva2VucztcblxuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKG9wdC5ob29rcykge1xuICAgICAgICAgIHNyYyA9IG9wdC5ob29rcy5wcmVwcm9jZXNzKHNyYyk7XG4gICAgICAgIH1cbiAgICAgICAgdG9rZW5zID0gbGV4ZXIoc3JjLCBvcHQpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICByZXR1cm4gdGhyb3dFcnJvcihlKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgZG9uZSA9IGZ1bmN0aW9uKGVycikge1xuICAgICAgICBsZXQgb3V0O1xuXG4gICAgICAgIGlmICghZXJyKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmIChvcHQud2Fsa1Rva2Vucykge1xuICAgICAgICAgICAgICBtYXJrZWQud2Fsa1Rva2Vucyh0b2tlbnMsIG9wdC53YWxrVG9rZW5zKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG91dCA9IHBhcnNlcih0b2tlbnMsIG9wdCk7XG4gICAgICAgICAgICBpZiAob3B0Lmhvb2tzKSB7XG4gICAgICAgICAgICAgIG91dCA9IG9wdC5ob29rcy5wb3N0cHJvY2VzcyhvdXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGVyciA9IGU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgb3B0LmhpZ2hsaWdodCA9IGhpZ2hsaWdodDtcblxuICAgICAgICByZXR1cm4gZXJyXG4gICAgICAgICAgPyB0aHJvd0Vycm9yKGVycilcbiAgICAgICAgICA6IGNhbGxiYWNrKG51bGwsIG91dCk7XG4gICAgICB9O1xuXG4gICAgICBpZiAoIWhpZ2hsaWdodCB8fCBoaWdobGlnaHQubGVuZ3RoIDwgMykge1xuICAgICAgICByZXR1cm4gZG9uZSgpO1xuICAgICAgfVxuXG4gICAgICBkZWxldGUgb3B0LmhpZ2hsaWdodDtcblxuICAgICAgaWYgKCF0b2tlbnMubGVuZ3RoKSByZXR1cm4gZG9uZSgpO1xuXG4gICAgICBsZXQgcGVuZGluZyA9IDA7XG4gICAgICBtYXJrZWQud2Fsa1Rva2Vucyh0b2tlbnMsIGZ1bmN0aW9uKHRva2VuKSB7XG4gICAgICAgIGlmICh0b2tlbi50eXBlID09PSAnY29kZScpIHtcbiAgICAgICAgICBwZW5kaW5nKys7XG4gICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBoaWdobGlnaHQodG9rZW4udGV4dCwgdG9rZW4ubGFuZywgZnVuY3Rpb24oZXJyLCBjb2RlKSB7XG4gICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZG9uZShlcnIpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmIChjb2RlICE9IG51bGwgJiYgY29kZSAhPT0gdG9rZW4udGV4dCkge1xuICAgICAgICAgICAgICAgIHRva2VuLnRleHQgPSBjb2RlO1xuICAgICAgICAgICAgICAgIHRva2VuLmVzY2FwZWQgPSB0cnVlO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgcGVuZGluZy0tO1xuICAgICAgICAgICAgICBpZiAocGVuZGluZyA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGRvbmUoKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSwgMCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBpZiAocGVuZGluZyA9PT0gMCkge1xuICAgICAgICBkb25lKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAob3B0LmFzeW5jKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG9wdC5ob29rcyA/IG9wdC5ob29rcy5wcmVwcm9jZXNzKHNyYykgOiBzcmMpXG4gICAgICAgIC50aGVuKHNyYyA9PiBsZXhlcihzcmMsIG9wdCkpXG4gICAgICAgIC50aGVuKHRva2VucyA9PiBvcHQud2Fsa1Rva2VucyA/IFByb21pc2UuYWxsKG1hcmtlZC53YWxrVG9rZW5zKHRva2Vucywgb3B0LndhbGtUb2tlbnMpKS50aGVuKCgpID0+IHRva2VucykgOiB0b2tlbnMpXG4gICAgICAgIC50aGVuKHRva2VucyA9PiBwYXJzZXIodG9rZW5zLCBvcHQpKVxuICAgICAgICAudGhlbihodG1sID0+IG9wdC5ob29rcyA/IG9wdC5ob29rcy5wb3N0cHJvY2VzcyhodG1sKSA6IGh0bWwpXG4gICAgICAgIC5jYXRjaCh0aHJvd0Vycm9yKTtcbiAgICB9XG5cbiAgICB0cnkge1xuICAgICAgaWYgKG9wdC5ob29rcykge1xuICAgICAgICBzcmMgPSBvcHQuaG9va3MucHJlcHJvY2VzcyhzcmMpO1xuICAgICAgfVxuICAgICAgY29uc3QgdG9rZW5zID0gbGV4ZXIoc3JjLCBvcHQpO1xuICAgICAgaWYgKG9wdC53YWxrVG9rZW5zKSB7XG4gICAgICAgIG1hcmtlZC53YWxrVG9rZW5zKHRva2Vucywgb3B0LndhbGtUb2tlbnMpO1xuICAgICAgfVxuICAgICAgbGV0IGh0bWwgPSBwYXJzZXIodG9rZW5zLCBvcHQpO1xuICAgICAgaWYgKG9wdC5ob29rcykge1xuICAgICAgICBodG1sID0gb3B0Lmhvb2tzLnBvc3Rwcm9jZXNzKGh0bWwpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGh0bWw7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIHRocm93RXJyb3IoZSk7XG4gICAgfVxuICB9O1xufVxuXG4vKipcbiAqIE1hcmtlZFxuICovXG5mdW5jdGlvbiBtYXJrZWQoc3JjLCBvcHQsIGNhbGxiYWNrKSB7XG4gIHJldHVybiBwYXJzZU1hcmtkb3duKExleGVyLmxleCwgUGFyc2VyLnBhcnNlKShzcmMsIG9wdCwgY2FsbGJhY2spO1xufVxuXG4vKipcbiAqIE9wdGlvbnNcbiAqL1xuXG5tYXJrZWQub3B0aW9ucyA9XG5tYXJrZWQuc2V0T3B0aW9ucyA9IGZ1bmN0aW9uKG9wdCkge1xuICBtYXJrZWQuZGVmYXVsdHMgPSB7IC4uLm1hcmtlZC5kZWZhdWx0cywgLi4ub3B0IH07XG4gIGNoYW5nZURlZmF1bHRzKG1hcmtlZC5kZWZhdWx0cyk7XG4gIHJldHVybiBtYXJrZWQ7XG59O1xuXG5tYXJrZWQuZ2V0RGVmYXVsdHMgPSBnZXREZWZhdWx0cztcblxubWFya2VkLmRlZmF1bHRzID0gZGVmYXVsdHM7XG5cbi8qKlxuICogVXNlIEV4dGVuc2lvblxuICovXG5cbm1hcmtlZC51c2UgPSBmdW5jdGlvbiguLi5hcmdzKSB7XG4gIGNvbnN0IGV4dGVuc2lvbnMgPSBtYXJrZWQuZGVmYXVsdHMuZXh0ZW5zaW9ucyB8fCB7IHJlbmRlcmVyczoge30sIGNoaWxkVG9rZW5zOiB7fSB9O1xuXG4gIGFyZ3MuZm9yRWFjaCgocGFjaykgPT4ge1xuICAgIC8vIGNvcHkgb3B0aW9ucyB0byBuZXcgb2JqZWN0XG4gICAgY29uc3Qgb3B0cyA9IHsgLi4ucGFjayB9O1xuXG4gICAgLy8gc2V0IGFzeW5jIHRvIHRydWUgaWYgaXQgd2FzIHNldCB0byB0cnVlIGJlZm9yZVxuICAgIG9wdHMuYXN5bmMgPSBtYXJrZWQuZGVmYXVsdHMuYXN5bmMgfHwgb3B0cy5hc3luYyB8fCBmYWxzZTtcblxuICAgIC8vID09LS0gUGFyc2UgXCJhZGRvblwiIGV4dGVuc2lvbnMgLS09PSAvL1xuICAgIGlmIChwYWNrLmV4dGVuc2lvbnMpIHtcbiAgICAgIHBhY2suZXh0ZW5zaW9ucy5mb3JFYWNoKChleHQpID0+IHtcbiAgICAgICAgaWYgKCFleHQubmFtZSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignZXh0ZW5zaW9uIG5hbWUgcmVxdWlyZWQnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZXh0LnJlbmRlcmVyKSB7IC8vIFJlbmRlcmVyIGV4dGVuc2lvbnNcbiAgICAgICAgICBjb25zdCBwcmV2UmVuZGVyZXIgPSBleHRlbnNpb25zLnJlbmRlcmVyc1tleHQubmFtZV07XG4gICAgICAgICAgaWYgKHByZXZSZW5kZXJlcikge1xuICAgICAgICAgICAgLy8gUmVwbGFjZSBleHRlbnNpb24gd2l0aCBmdW5jIHRvIHJ1biBuZXcgZXh0ZW5zaW9uIGJ1dCBmYWxsIGJhY2sgaWYgZmFsc2VcbiAgICAgICAgICAgIGV4dGVuc2lvbnMucmVuZGVyZXJzW2V4dC5uYW1lXSA9IGZ1bmN0aW9uKC4uLmFyZ3MpIHtcbiAgICAgICAgICAgICAgbGV0IHJldCA9IGV4dC5yZW5kZXJlci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICAgICAgaWYgKHJldCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICByZXQgPSBwcmV2UmVuZGVyZXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgcmV0dXJuIHJldDtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGV4dGVuc2lvbnMucmVuZGVyZXJzW2V4dC5uYW1lXSA9IGV4dC5yZW5kZXJlcjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGV4dC50b2tlbml6ZXIpIHsgLy8gVG9rZW5pemVyIEV4dGVuc2lvbnNcbiAgICAgICAgICBpZiAoIWV4dC5sZXZlbCB8fCAoZXh0LmxldmVsICE9PSAnYmxvY2snICYmIGV4dC5sZXZlbCAhPT0gJ2lubGluZScpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJleHRlbnNpb24gbGV2ZWwgbXVzdCBiZSAnYmxvY2snIG9yICdpbmxpbmUnXCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoZXh0ZW5zaW9uc1tleHQubGV2ZWxdKSB7XG4gICAgICAgICAgICBleHRlbnNpb25zW2V4dC5sZXZlbF0udW5zaGlmdChleHQudG9rZW5pemVyKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZXh0ZW5zaW9uc1tleHQubGV2ZWxdID0gW2V4dC50b2tlbml6ZXJdO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoZXh0LnN0YXJ0KSB7IC8vIEZ1bmN0aW9uIHRvIGNoZWNrIGZvciBzdGFydCBvZiB0b2tlblxuICAgICAgICAgICAgaWYgKGV4dC5sZXZlbCA9PT0gJ2Jsb2NrJykge1xuICAgICAgICAgICAgICBpZiAoZXh0ZW5zaW9ucy5zdGFydEJsb2NrKSB7XG4gICAgICAgICAgICAgICAgZXh0ZW5zaW9ucy5zdGFydEJsb2NrLnB1c2goZXh0LnN0YXJ0KTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBleHRlbnNpb25zLnN0YXJ0QmxvY2sgPSBbZXh0LnN0YXJ0XTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChleHQubGV2ZWwgPT09ICdpbmxpbmUnKSB7XG4gICAgICAgICAgICAgIGlmIChleHRlbnNpb25zLnN0YXJ0SW5saW5lKSB7XG4gICAgICAgICAgICAgICAgZXh0ZW5zaW9ucy5zdGFydElubGluZS5wdXNoKGV4dC5zdGFydCk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZXh0ZW5zaW9ucy5zdGFydElubGluZSA9IFtleHQuc3RhcnRdO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChleHQuY2hpbGRUb2tlbnMpIHsgLy8gQ2hpbGQgdG9rZW5zIHRvIGJlIHZpc2l0ZWQgYnkgd2Fsa1Rva2Vuc1xuICAgICAgICAgIGV4dGVuc2lvbnMuY2hpbGRUb2tlbnNbZXh0Lm5hbWVdID0gZXh0LmNoaWxkVG9rZW5zO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIG9wdHMuZXh0ZW5zaW9ucyA9IGV4dGVuc2lvbnM7XG4gICAgfVxuXG4gICAgLy8gPT0tLSBQYXJzZSBcIm92ZXJ3cml0ZVwiIGV4dGVuc2lvbnMgLS09PSAvL1xuICAgIGlmIChwYWNrLnJlbmRlcmVyKSB7XG4gICAgICBjb25zdCByZW5kZXJlciA9IG1hcmtlZC5kZWZhdWx0cy5yZW5kZXJlciB8fCBuZXcgUmVuZGVyZXIoKTtcbiAgICAgIGZvciAoY29uc3QgcHJvcCBpbiBwYWNrLnJlbmRlcmVyKSB7XG4gICAgICAgIGNvbnN0IHByZXZSZW5kZXJlciA9IHJlbmRlcmVyW3Byb3BdO1xuICAgICAgICAvLyBSZXBsYWNlIHJlbmRlcmVyIHdpdGggZnVuYyB0byBydW4gZXh0ZW5zaW9uLCBidXQgZmFsbCBiYWNrIGlmIGZhbHNlXG4gICAgICAgIHJlbmRlcmVyW3Byb3BdID0gKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgICBsZXQgcmV0ID0gcGFjay5yZW5kZXJlcltwcm9wXS5hcHBseShyZW5kZXJlciwgYXJncyk7XG4gICAgICAgICAgaWYgKHJldCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHJldCA9IHByZXZSZW5kZXJlci5hcHBseShyZW5kZXJlciwgYXJncyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiByZXQ7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBvcHRzLnJlbmRlcmVyID0gcmVuZGVyZXI7XG4gICAgfVxuICAgIGlmIChwYWNrLnRva2VuaXplcikge1xuICAgICAgY29uc3QgdG9rZW5pemVyID0gbWFya2VkLmRlZmF1bHRzLnRva2VuaXplciB8fCBuZXcgVG9rZW5pemVyKCk7XG4gICAgICBmb3IgKGNvbnN0IHByb3AgaW4gcGFjay50b2tlbml6ZXIpIHtcbiAgICAgICAgY29uc3QgcHJldlRva2VuaXplciA9IHRva2VuaXplcltwcm9wXTtcbiAgICAgICAgLy8gUmVwbGFjZSB0b2tlbml6ZXIgd2l0aCBmdW5jIHRvIHJ1biBleHRlbnNpb24sIGJ1dCBmYWxsIGJhY2sgaWYgZmFsc2VcbiAgICAgICAgdG9rZW5pemVyW3Byb3BdID0gKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgICBsZXQgcmV0ID0gcGFjay50b2tlbml6ZXJbcHJvcF0uYXBwbHkodG9rZW5pemVyLCBhcmdzKTtcbiAgICAgICAgICBpZiAocmV0ID09PSBmYWxzZSkge1xuICAgICAgICAgICAgcmV0ID0gcHJldlRva2VuaXplci5hcHBseSh0b2tlbml6ZXIsIGFyZ3MpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gcmV0O1xuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgb3B0cy50b2tlbml6ZXIgPSB0b2tlbml6ZXI7XG4gICAgfVxuXG4gICAgLy8gPT0tLSBQYXJzZSBIb29rcyBleHRlbnNpb25zIC0tPT0gLy9cbiAgICBpZiAocGFjay5ob29rcykge1xuICAgICAgY29uc3QgaG9va3MgPSBtYXJrZWQuZGVmYXVsdHMuaG9va3MgfHwgbmV3IEhvb2tzKCk7XG4gICAgICBmb3IgKGNvbnN0IHByb3AgaW4gcGFjay5ob29rcykge1xuICAgICAgICBjb25zdCBwcmV2SG9vayA9IGhvb2tzW3Byb3BdO1xuICAgICAgICBpZiAoSG9va3MucGFzc1Rocm91Z2hIb29rcy5oYXMocHJvcCkpIHtcbiAgICAgICAgICBob29rc1twcm9wXSA9IChhcmcpID0+IHtcbiAgICAgICAgICAgIGlmIChtYXJrZWQuZGVmYXVsdHMuYXN5bmMpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShwYWNrLmhvb2tzW3Byb3BdLmNhbGwoaG9va3MsIGFyZykpLnRoZW4ocmV0ID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcHJldkhvb2suY2FsbChob29rcywgcmV0KTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHJldCA9IHBhY2suaG9va3NbcHJvcF0uY2FsbChob29rcywgYXJnKTtcbiAgICAgICAgICAgIHJldHVybiBwcmV2SG9vay5jYWxsKGhvb2tzLCByZXQpO1xuICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaG9va3NbcHJvcF0gPSAoLi4uYXJncykgPT4ge1xuICAgICAgICAgICAgbGV0IHJldCA9IHBhY2suaG9va3NbcHJvcF0uYXBwbHkoaG9va3MsIGFyZ3MpO1xuICAgICAgICAgICAgaWYgKHJldCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgcmV0ID0gcHJldkhvb2suYXBwbHkoaG9va3MsIGFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJldDtcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBvcHRzLmhvb2tzID0gaG9va3M7XG4gICAgfVxuXG4gICAgLy8gPT0tLSBQYXJzZSBXYWxrVG9rZW5zIGV4dGVuc2lvbnMgLS09PSAvL1xuICAgIGlmIChwYWNrLndhbGtUb2tlbnMpIHtcbiAgICAgIGNvbnN0IHdhbGtUb2tlbnMgPSBtYXJrZWQuZGVmYXVsdHMud2Fsa1Rva2VucztcbiAgICAgIG9wdHMud2Fsa1Rva2VucyA9IGZ1bmN0aW9uKHRva2VuKSB7XG4gICAgICAgIGxldCB2YWx1ZXMgPSBbXTtcbiAgICAgICAgdmFsdWVzLnB1c2gocGFjay53YWxrVG9rZW5zLmNhbGwodGhpcywgdG9rZW4pKTtcbiAgICAgICAgaWYgKHdhbGtUb2tlbnMpIHtcbiAgICAgICAgICB2YWx1ZXMgPSB2YWx1ZXMuY29uY2F0KHdhbGtUb2tlbnMuY2FsbCh0aGlzLCB0b2tlbikpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2YWx1ZXM7XG4gICAgICB9O1xuICAgIH1cblxuICAgIG1hcmtlZC5zZXRPcHRpb25zKG9wdHMpO1xuICB9KTtcbn07XG5cbi8qKlxuICogUnVuIGNhbGxiYWNrIGZvciBldmVyeSB0b2tlblxuICovXG5cbm1hcmtlZC53YWxrVG9rZW5zID0gZnVuY3Rpb24odG9rZW5zLCBjYWxsYmFjaykge1xuICBsZXQgdmFsdWVzID0gW107XG4gIGZvciAoY29uc3QgdG9rZW4gb2YgdG9rZW5zKSB7XG4gICAgdmFsdWVzID0gdmFsdWVzLmNvbmNhdChjYWxsYmFjay5jYWxsKG1hcmtlZCwgdG9rZW4pKTtcbiAgICBzd2l0Y2ggKHRva2VuLnR5cGUpIHtcbiAgICAgIGNhc2UgJ3RhYmxlJzoge1xuICAgICAgICBmb3IgKGNvbnN0IGNlbGwgb2YgdG9rZW4uaGVhZGVyKSB7XG4gICAgICAgICAgdmFsdWVzID0gdmFsdWVzLmNvbmNhdChtYXJrZWQud2Fsa1Rva2VucyhjZWxsLnRva2VucywgY2FsbGJhY2spKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGNvbnN0IHJvdyBvZiB0b2tlbi5yb3dzKSB7XG4gICAgICAgICAgZm9yIChjb25zdCBjZWxsIG9mIHJvdykge1xuICAgICAgICAgICAgdmFsdWVzID0gdmFsdWVzLmNvbmNhdChtYXJrZWQud2Fsa1Rva2VucyhjZWxsLnRva2VucywgY2FsbGJhY2spKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjYXNlICdsaXN0Jzoge1xuICAgICAgICB2YWx1ZXMgPSB2YWx1ZXMuY29uY2F0KG1hcmtlZC53YWxrVG9rZW5zKHRva2VuLml0ZW1zLCBjYWxsYmFjaykpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgaWYgKG1hcmtlZC5kZWZhdWx0cy5leHRlbnNpb25zICYmIG1hcmtlZC5kZWZhdWx0cy5leHRlbnNpb25zLmNoaWxkVG9rZW5zICYmIG1hcmtlZC5kZWZhdWx0cy5leHRlbnNpb25zLmNoaWxkVG9rZW5zW3Rva2VuLnR5cGVdKSB7IC8vIFdhbGsgYW55IGV4dGVuc2lvbnNcbiAgICAgICAgICBtYXJrZWQuZGVmYXVsdHMuZXh0ZW5zaW9ucy5jaGlsZFRva2Vuc1t0b2tlbi50eXBlXS5mb3JFYWNoKGZ1bmN0aW9uKGNoaWxkVG9rZW5zKSB7XG4gICAgICAgICAgICB2YWx1ZXMgPSB2YWx1ZXMuY29uY2F0KG1hcmtlZC53YWxrVG9rZW5zKHRva2VuW2NoaWxkVG9rZW5zXSwgY2FsbGJhY2spKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIGlmICh0b2tlbi50b2tlbnMpIHtcbiAgICAgICAgICB2YWx1ZXMgPSB2YWx1ZXMuY29uY2F0KG1hcmtlZC53YWxrVG9rZW5zKHRva2VuLnRva2VucywgY2FsbGJhY2spKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gdmFsdWVzO1xufTtcblxuLyoqXG4gKiBQYXJzZSBJbmxpbmVcbiAqIEBwYXJhbSB7c3RyaW5nfSBzcmNcbiAqL1xubWFya2VkLnBhcnNlSW5saW5lID0gcGFyc2VNYXJrZG93bihMZXhlci5sZXhJbmxpbmUsIFBhcnNlci5wYXJzZUlubGluZSk7XG5cbi8qKlxuICogRXhwb3NlXG4gKi9cbm1hcmtlZC5QYXJzZXIgPSBQYXJzZXI7XG5tYXJrZWQucGFyc2VyID0gUGFyc2VyLnBhcnNlO1xubWFya2VkLlJlbmRlcmVyID0gUmVuZGVyZXI7XG5tYXJrZWQuVGV4dFJlbmRlcmVyID0gVGV4dFJlbmRlcmVyO1xubWFya2VkLkxleGVyID0gTGV4ZXI7XG5tYXJrZWQubGV4ZXIgPSBMZXhlci5sZXg7XG5tYXJrZWQuVG9rZW5pemVyID0gVG9rZW5pemVyO1xubWFya2VkLlNsdWdnZXIgPSBTbHVnZ2VyO1xubWFya2VkLkhvb2tzID0gSG9va3M7XG5tYXJrZWQucGFyc2UgPSBtYXJrZWQ7XG5cbmNvbnN0IG9wdGlvbnMgPSBtYXJrZWQub3B0aW9ucztcbmNvbnN0IHNldE9wdGlvbnMgPSBtYXJrZWQuc2V0T3B0aW9ucztcbmNvbnN0IHVzZSA9IG1hcmtlZC51c2U7XG5jb25zdCB3YWxrVG9rZW5zID0gbWFya2VkLndhbGtUb2tlbnM7XG5jb25zdCBwYXJzZUlubGluZSA9IG1hcmtlZC5wYXJzZUlubGluZTtcbmNvbnN0IHBhcnNlID0gbWFya2VkO1xuY29uc3QgcGFyc2VyID0gUGFyc2VyLnBhcnNlO1xuY29uc3QgbGV4ZXIgPSBMZXhlci5sZXg7XG5cbmV4cG9ydCB7IEhvb2tzLCBMZXhlciwgUGFyc2VyLCBSZW5kZXJlciwgU2x1Z2dlciwgVGV4dFJlbmRlcmVyLCBUb2tlbml6ZXIsIGRlZmF1bHRzLCBnZXREZWZhdWx0cywgbGV4ZXIsIG1hcmtlZCwgb3B0aW9ucywgcGFyc2UsIHBhcnNlSW5saW5lLCBwYXJzZXIsIHNldE9wdGlvbnMsIHVzZSwgd2Fsa1Rva2VucyB9O1xuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcblx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG5cdFx0ZnVuY3Rpb24oKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG5cdFx0ZnVuY3Rpb24oKSB7IHJldHVybiBtb2R1bGU7IH07XG5cdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsIHsgYTogZ2V0dGVyIH0pO1xuXHRyZXR1cm4gZ2V0dGVyO1xufTsiLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBkZWZpbml0aW9uKSB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iaiwgcHJvcCkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCk7IH0iLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsInZhciBfX2Fzc2lnbiA9ICh0aGlzICYmIHRoaXMuX19hc3NpZ24pIHx8IGZ1bmN0aW9uICgpIHtcbiAgICBfX2Fzc2lnbiA9IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24odCkge1xuICAgICAgICBmb3IgKHZhciBzLCBpID0gMSwgbiA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBuOyBpKyspIHtcbiAgICAgICAgICAgIHMgPSBhcmd1bWVudHNbaV07XG4gICAgICAgICAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkpXG4gICAgICAgICAgICAgICAgdFtwXSA9IHNbcF07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHQ7XG4gICAgfTtcbiAgICByZXR1cm4gX19hc3NpZ24uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn07XG52YXIgX19hd2FpdGVyID0gKHRoaXMgJiYgdGhpcy5fX2F3YWl0ZXIpIHx8IGZ1bmN0aW9uICh0aGlzQXJnLCBfYXJndW1lbnRzLCBQLCBnZW5lcmF0b3IpIHtcbiAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH1cbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgZnVuY3Rpb24gZnVsZmlsbGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yLm5leHQodmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cbiAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpO1xuICAgIH0pO1xufTtcbnZhciBfX2dlbmVyYXRvciA9ICh0aGlzICYmIHRoaXMuX19nZW5lcmF0b3IpIHx8IGZ1bmN0aW9uICh0aGlzQXJnLCBib2R5KSB7XG4gICAgdmFyIF8gPSB7IGxhYmVsOiAwLCBzZW50OiBmdW5jdGlvbigpIHsgaWYgKHRbMF0gJiAxKSB0aHJvdyB0WzFdOyByZXR1cm4gdFsxXTsgfSwgdHJ5czogW10sIG9wczogW10gfSwgZiwgeSwgdCwgZztcbiAgICByZXR1cm4gZyA9IHsgbmV4dDogdmVyYigwKSwgXCJ0aHJvd1wiOiB2ZXJiKDEpLCBcInJldHVyblwiOiB2ZXJiKDIpIH0sIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiAoZ1tTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzOyB9KSwgZztcbiAgICBmdW5jdGlvbiB2ZXJiKG4pIHsgcmV0dXJuIGZ1bmN0aW9uICh2KSB7IHJldHVybiBzdGVwKFtuLCB2XSk7IH07IH1cbiAgICBmdW5jdGlvbiBzdGVwKG9wKSB7XG4gICAgICAgIGlmIChmKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiR2VuZXJhdG9yIGlzIGFscmVhZHkgZXhlY3V0aW5nLlwiKTtcbiAgICAgICAgd2hpbGUgKGcgJiYgKGcgPSAwLCBvcFswXSAmJiAoXyA9IDApKSwgXykgdHJ5IHtcbiAgICAgICAgICAgIGlmIChmID0gMSwgeSAmJiAodCA9IG9wWzBdICYgMiA/IHlbXCJyZXR1cm5cIl0gOiBvcFswXSA/IHlbXCJ0aHJvd1wiXSB8fCAoKHQgPSB5W1wicmV0dXJuXCJdKSAmJiB0LmNhbGwoeSksIDApIDogeS5uZXh0KSAmJiAhKHQgPSB0LmNhbGwoeSwgb3BbMV0pKS5kb25lKSByZXR1cm4gdDtcbiAgICAgICAgICAgIGlmICh5ID0gMCwgdCkgb3AgPSBbb3BbMF0gJiAyLCB0LnZhbHVlXTtcbiAgICAgICAgICAgIHN3aXRjaCAob3BbMF0pIHtcbiAgICAgICAgICAgICAgICBjYXNlIDA6IGNhc2UgMTogdCA9IG9wOyBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDQ6IF8ubGFiZWwrKzsgcmV0dXJuIHsgdmFsdWU6IG9wWzFdLCBkb25lOiBmYWxzZSB9O1xuICAgICAgICAgICAgICAgIGNhc2UgNTogXy5sYWJlbCsrOyB5ID0gb3BbMV07IG9wID0gWzBdOyBjb250aW51ZTtcbiAgICAgICAgICAgICAgICBjYXNlIDc6IG9wID0gXy5vcHMucG9wKCk7IF8udHJ5cy5wb3AoKTsgY29udGludWU7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEodCA9IF8udHJ5cywgdCA9IHQubGVuZ3RoID4gMCAmJiB0W3QubGVuZ3RoIC0gMV0pICYmIChvcFswXSA9PT0gNiB8fCBvcFswXSA9PT0gMikpIHsgXyA9IDA7IGNvbnRpbnVlOyB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChvcFswXSA9PT0gMyAmJiAoIXQgfHwgKG9wWzFdID4gdFswXSAmJiBvcFsxXSA8IHRbM10pKSkgeyBfLmxhYmVsID0gb3BbMV07IGJyZWFrOyB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChvcFswXSA9PT0gNiAmJiBfLmxhYmVsIDwgdFsxXSkgeyBfLmxhYmVsID0gdFsxXTsgdCA9IG9wOyBicmVhazsgfVxuICAgICAgICAgICAgICAgICAgICBpZiAodCAmJiBfLmxhYmVsIDwgdFsyXSkgeyBfLmxhYmVsID0gdFsyXTsgXy5vcHMucHVzaChvcCk7IGJyZWFrOyB9XG4gICAgICAgICAgICAgICAgICAgIGlmICh0WzJdKSBfLm9wcy5wb3AoKTtcbiAgICAgICAgICAgICAgICAgICAgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG9wID0gYm9keS5jYWxsKHRoaXNBcmcsIF8pO1xuICAgICAgICB9IGNhdGNoIChlKSB7IG9wID0gWzYsIGVdOyB5ID0gMDsgfSBmaW5hbGx5IHsgZiA9IHQgPSAwOyB9XG4gICAgICAgIGlmIChvcFswXSAmIDUpIHRocm93IG9wWzFdOyByZXR1cm4geyB2YWx1ZTogb3BbMF0gPyBvcFsxXSA6IHZvaWQgMCwgZG9uZTogdHJ1ZSB9O1xuICAgIH1cbn07XG5pbXBvcnQgeyBnZXRfcmVzZWFyY2hfdGV4dCB9IGZyb20gXCIuL2NoYXRcIjtcbmltcG9ydCB7IHRoaXNHYW1lIH0gZnJvbSBcIi4vZ2FtZVwiO1xuaW1wb3J0IHsgZ2V0X2hlcm8gfSBmcm9tIFwiLi9nZXRfaGVyb1wiO1xuaW1wb3J0IHsgY2xpcCwgbGFzdENsaXAgfSBmcm9tIFwiLi9ob3RrZXlcIjtcbmltcG9ydCB7IHJlbmRlckxlZGdlciB9IGZyb20gXCIuL2xlZGdlclwiO1xuaW1wb3J0IHsgbWVyZ2VVc2VyIH0gZnJvbSBcIi4vdXRpbGl0aWVzL21lcmdlXCI7XG5pbXBvcnQgeyBpc192YWxpZF9pbWFnZV91cmwsIGlzX3ZhbGlkX3lvdXR1YmUgfSBmcm9tIFwiLi91dGlsaXRpZXMvcGFyc2VfdXRpbHNcIjtcbmltcG9ydCB7IGFueVN0YXJDYW5TZWUsIGRyYXdPdmVybGF5U3RyaW5nIH0gZnJvbSBcIi4vdXRpbGl0aWVzL2dyYXBoaWNzXCI7XG5pbXBvcnQgeyBob29rX25wY190aWNrX2NvdW50ZXIgfSBmcm9tIFwiLi91dGlsaXRpZXMvbnBjX2NhbGNcIjtcbmltcG9ydCB7IGdldF9hcGVfYmFkZ2VzLCBBcGVCYWRnZUljb24sIGdyb3VwQXBlQmFkZ2VzLCB9IGZyb20gXCIuL3V0aWxpdGllcy9wbGF5ZXJfYmFkZ2VzXCI7XG5pbXBvcnQgeyBBcGVHaWZ0SXRlbSwgYnV5QXBlR2lmdFNjcmVlbiB9IGZyb20gXCIuL3V0aWxpdGllcy9naWZ0X3NjcmVlblwiO1xudmFyIFNBVF9WRVJTSU9OID0gXCJnaXQtdmVyc2lvblwiO1xuaWYgKE5lcHR1bmVzUHJpZGUgPT09IHVuZGVmaW5lZCkge1xuICAgIHRoaXNHYW1lLm5lcHR1bmVzUHJpZGUgPSBOZXB0dW5lc1ByaWRlO1xufVxuU3RyaW5nLnByb3RvdHlwZS50b1Byb3BlckNhc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVwbGFjZSgvXFx3XFxTKi9nLCBmdW5jdGlvbiAodHh0KSB7XG4gICAgICAgIHJldHVybiB0eHQuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyB0eHQuc3Vic3RyKDEpLnRvTG93ZXJDYXNlKCk7XG4gICAgfSk7XG59O1xuLyogRXh0cmEgQmFkZ2VzICovXG52YXIgYXBlX3BsYXllcnMgPSBbXTtcbmZ1bmN0aW9uIGdldF9hcGVfcGxheWVycygpIHtcbiAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBfX2dlbmVyYXRvcih0aGlzLCBmdW5jdGlvbiAoX2EpIHtcbiAgICAgICAgICAgIGdldF9hcGVfYmFkZ2VzKClcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAocGxheWVycykge1xuICAgICAgICAgICAgICAgIGFwZV9wbGF5ZXJzID0gcGxheWVycztcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uIChlcnIpIHsgcmV0dXJuIGNvbnNvbGUubG9nKFwiRVJST1I6IFVuYWJsZSB0byBnZXQgQVBFIHBsYXllcnNcIiwgZXJyKTsgfSk7XG4gICAgICAgICAgICByZXR1cm4gWzIgLypyZXR1cm4qL107XG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxuZ2V0X2FwZV9wbGF5ZXJzKCk7XG4vL092ZXJyaWRlIHdpZGdldCBpbnRlZmFjZXNcbnZhciBvdmVycmlkZUJhZGdlV2lkZ2V0cyA9IGZ1bmN0aW9uICgpIHtcbiAgICBOZXB0dW5lc1ByaWRlLm5wdWkuYmFkZ2VGaWxlTmFtZXNbXCJhXCJdID0gXCJhcGVcIjtcbiAgICB2YXIgaW1hZ2VfdXJsID0gJChcIiNhcGUtaW50ZWwtcGx1Z2luXCIpLmF0dHIoXCJpbWFnZXNcIik7XG4gICAgTmVwdHVuZXNQcmlkZS5ucHVpLkJhZGdlSWNvbiA9IGZ1bmN0aW9uIChmaWxlbmFtZSwgY291bnQsIHNtYWxsKSB7XG4gICAgICAgIHJldHVybiBBcGVCYWRnZUljb24oQ3J1eCwgaW1hZ2VfdXJsLCBmaWxlbmFtZSwgY291bnQsIHNtYWxsKTtcbiAgICB9O1xufTtcbnZhciBvdmVycmlkZVRlbXBsYXRlcyA9IGZ1bmN0aW9uICgpIHtcbiAgICBOZXB0dW5lc1ByaWRlLnRlbXBsYXRlc1tcImdpZnRfZGVzY19hcGVcIl0gPVxuICAgICAgICBcIjxoMz5BcGUgLSA0MjAgQ3JlZGl0PC9oMz48cD5JcyB0aGlzIHdoYXQgeW91IGNhbGwgJ2V2b2x1dGlvbic/IEJlY2F1c2UgZnJhbmtseSwgSSd2ZSBzZWVuIGJldHRlciBkZXNpZ25zIG9uIGEgYmFuYW5hIHBlZWwuPC9wPlwiO1xuICAgIENydXgubG9jYWxpc2UgPSBmdW5jdGlvbiAoaWQpIHtcbiAgICAgICAgaWYgKENydXgudGVtcGxhdGVzW2lkXSkge1xuICAgICAgICAgICAgcmV0dXJuIENydXgudGVtcGxhdGVzW2lkXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBpZC50b1Byb3BlckNhc2UoKTtcbiAgICAgICAgfVxuICAgIH07XG59O1xudmFyIG92ZXJyaWRlR2lmdEl0ZW1zID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBpbWFnZV91cmwgPSAkKFwiI2FwZS1pbnRlbC1wbHVnaW5cIikuYXR0cihcImltYWdlc1wiKTtcbiAgICBOZXB0dW5lc1ByaWRlLm5wdWkuQnV5R2lmdFNjcmVlbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIGJ1eUFwZUdpZnRTY3JlZW4oQ3J1eCwgTmVwdHVuZXNQcmlkZS51bml2ZXJzZSwgTmVwdHVuZXNQcmlkZS5ucHVpKTtcbiAgICB9O1xuICAgIE5lcHR1bmVzUHJpZGUubnB1aS5HaWZ0SXRlbSA9IGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgIHJldHVybiBBcGVHaWZ0SXRlbShDcnV4LCBpbWFnZV91cmwsIGl0ZW0pO1xuICAgIH07XG59O1xudmFyIG92ZXJyaWRlU2hvd1NjcmVlbiA9IGZ1bmN0aW9uICgpIHtcbiAgICBOZXB0dW5lc1ByaWRlLm5wdWkub25TaG93U2NyZWVuID0gZnVuY3Rpb24gKGV2ZW50LCBzY3JlZW5OYW1lLCBzY3JlZW5Db25maWcpIHtcbiAgICAgICAgcmV0dXJuIG9uU2hvd0FwZVNjcmVlbihOZXB0dW5lc1ByaWRlLm5wdWksIE5lcHR1bmVzUHJpZGUudW5pdmVyc2UsIGV2ZW50LCBzY3JlZW5OYW1lLCBzY3JlZW5Db25maWcpO1xuICAgIH07XG59O1xuJChcImFwZS1pbnRlbC1wbHVnaW5cIikucmVhZHkoZnVuY3Rpb24gKCkge1xuICAgIHBvc3RfaG9vaygpO1xuICAgIC8vJChcIiNhcGUtaW50ZWwtcGx1Z2luXCIpLnJlbW92ZSgpO1xufSk7XG5mdW5jdGlvbiBwb3N0X2hvb2soKSB7XG4gICAgb3ZlcnJpZGVHaWZ0SXRlbXMoKTtcbiAgICAvL292ZXJyaWRlU2hvd1NjcmVlbigpO1xuICAgIG92ZXJyaWRlVGVtcGxhdGVzKCk7XG4gICAgb3ZlcnJpZGVCYWRnZVdpZGdldHMoKTtcbiAgICBTQVRfVkVSU0lPTiA9ICQoXCIjYXBlLWludGVsLXBsdWdpblwiKS5hdHRyKFwidGl0bGVcIik7XG4gICAgY29uc29sZS5sb2coU0FUX1ZFUlNJT04pO1xufVxuLy9UT0RPOiBPcmdhbml6ZSB0eXBlc2NyaXB0IHRvIGFuIGludGVyZmFjZXMgZGlyZWN0b3J5XG4vL1RPRE86IFRoZW4gbWFrZSBvdGhlciBnYW1lIGVuZ2luZSBvYmplY3RzXG4vLyBQYXJ0IG9mIHlvdXIgY29kZSBpcyByZS1jcmVhdGluZyB0aGUgZ2FtZSBpbiB0eXBlc2NyaXB0XG4vLyBUaGUgb3RoZXIgcGFydCBpcyBhZGRpbmcgZmVhdHVyZXNcbi8vIFRoZW4gdGhlcmUgaXMgYSBzZWdtZW50IHRoYXQgaXMgb3ZlcndyaXRpbmcgZXhpc3RpbmcgY29udGVudCB0byBhZGQgc21hbGwgYWRkaXRpb25zLlxuLy9BZGQgY3VzdG9tIHNldHRpbmdzIHdoZW4gbWFraW5nIGEgbndlIGdhbWUuXG5mdW5jdGlvbiBtb2RpZnlfY3VzdG9tX2dhbWUoKSB7XG4gICAgY29uc29sZS5sb2coXCJSdW5uaW5nIGN1c3RvbSBnYW1lIHNldHRpbmdzIG1vZGlmaWNhdGlvblwiKTtcbiAgICB2YXIgc2VsZWN0b3IgPSAkKFwiI2NvbnRlbnRBcmVhID4gZGl2ID4gZGl2LndpZGdldC5mdWxsc2NyZWVuID4gZGl2LndpZGdldC5yZWwgPiBkaXY6bnRoLWNoaWxkKDQpID4gZGl2Om50aC1jaGlsZCgxNSkgPiBzZWxlY3RcIilbMF07XG4gICAgaWYgKHNlbGVjdG9yID09IHVuZGVmaW5lZCkge1xuICAgICAgICAvL05vdCBpbiBtZW51XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRleHRTdHJpbmcgPSBcIlwiO1xuICAgIGZvciAodmFyIGkgPSAyOyBpIDw9IDMyOyArK2kpIHtcbiAgICAgICAgdGV4dFN0cmluZyArPSBcIjxvcHRpb24gdmFsdWU9XFxcIlwiLmNvbmNhdChpLCBcIlxcXCI+XCIpLmNvbmNhdChpLCBcIiBQbGF5ZXJzPC9vcHRpb24+XCIpO1xuICAgIH1cbiAgICBjb25zb2xlLmxvZyh0ZXh0U3RyaW5nKTtcbiAgICBzZWxlY3Rvci5pbm5lckhUTUwgPSB0ZXh0U3RyaW5nO1xufVxuc2V0VGltZW91dChtb2RpZnlfY3VzdG9tX2dhbWUsIDUwMCk7XG4vL1RPRE86IE1ha2UgaXMgd2l0aGluIHNjYW5uaW5nIGZ1bmN0aW9uXG4vL1NoYXJlIGFsbCB0ZWNoIGRpc3BsYXkgYXMgdGVjaCBpcyBhY3RpdmVseSB0cmFkaW5nLlxudmFyIGRpc3BsYXlfdGVjaF90cmFkaW5nID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBucHVpID0gTmVwdHVuZXNQcmlkZS5ucHVpO1xuICAgIHZhciB0ZWNoX3RyYWRlX3NjcmVlbiA9IG5wdWkuU2NyZWVuKFwidGVjaF90cmFkaW5nXCIpO1xuICAgIG5wdWkub25IaWRlU2NyZWVuKG51bGwsIHRydWUpO1xuICAgIG5wdWkub25IaWRlU2VsZWN0aW9uTWVudSgpO1xuICAgIG5wdWkudHJpZ2dlcihcImhpZGVfc2lkZV9tZW51XCIpO1xuICAgIG5wdWkudHJpZ2dlcihcInJlc2V0X2VkaXRfbW9kZVwiKTtcbiAgICBucHVpLmFjdGl2ZVNjcmVlbiA9IHRlY2hfdHJhZGVfc2NyZWVuO1xuICAgIHRlY2hfdHJhZGVfc2NyZWVuLnJvb3N0KG5wdWkuc2NyZWVuQ29udGFpbmVyKTtcbiAgICBucHVpLmxheW91dEVsZW1lbnQodGVjaF90cmFkZV9zY3JlZW4pO1xuICAgIHZhciB0cmFkaW5nID0gQ3J1eC5UZXh0KFwiXCIsIFwicmVsIHBhZDEyXCIpLnJhd0hUTUwoXCJUcmFkaW5nLi5cIik7XG4gICAgdHJhZGluZy5yb29zdCh0ZWNoX3RyYWRlX3NjcmVlbik7XG4gICAgdGVjaF90cmFkZV9zY3JlZW4udHJhbnNhY3QgPSBmdW5jdGlvbiAodGV4dCkge1xuICAgICAgICB2YXIgdHJhZGluZyA9IENydXguVGV4dChcIlwiLCBcInJlbCBwYWQ4XCIpLnJhd0hUTUwodGV4dCk7XG4gICAgICAgIHRyYWRpbmcucm9vc3QodGVjaF90cmFkZV9zY3JlZW4pO1xuICAgIH07XG4gICAgcmV0dXJuIHRlY2hfdHJhZGVfc2NyZWVuO1xufTtcbi8vUmV0dXJucyBhbGwgc3RhcnMgSSBzdXBwb3NlXG52YXIgX2dldF9zdGFyX2dpcyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc3RhcnMgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlLmdhbGF4eS5zdGFycztcbiAgICB2YXIgb3V0cHV0ID0gW107XG4gICAgZm9yICh2YXIgcyBpbiBzdGFycykge1xuICAgICAgICB2YXIgc3RhciA9IHN0YXJzW3NdO1xuICAgICAgICBvdXRwdXQucHVzaCh7XG4gICAgICAgICAgICB4OiBzdGFyLngsXG4gICAgICAgICAgICB5OiBzdGFyLnksXG4gICAgICAgICAgICBvd25lcjogc3Rhci5xdWFsaWZpZWRBbGlhcyxcbiAgICAgICAgICAgIGVjb25vbXk6IHN0YXIuZSxcbiAgICAgICAgICAgIGluZHVzdHJ5OiBzdGFyLmksXG4gICAgICAgICAgICBzY2llbmNlOiBzdGFyLnMsXG4gICAgICAgICAgICBzaGlwczogc3Rhci50b3RhbERlZmVuc2VzLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIG91dHB1dDtcbn07XG52YXIgX2dldF93ZWFwb25zX25leHQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHJlc2VhcmNoID0gZ2V0X3Jlc2VhcmNoKCk7XG4gICAgaWYgKHJlc2VhcmNoW1wiY3VycmVudF9uYW1lXCJdID09IFwiV2VhcG9uc1wiKSB7XG4gICAgICAgIHJldHVybiByZXNlYXJjaFtcImN1cnJlbnRfZXRhXCJdO1xuICAgIH1cbiAgICBlbHNlIGlmIChyZXNlYXJjaFtcIm5leHRfbmFtZVwiXSA9PSBcIldlYXBvbnNcIikge1xuICAgICAgICByZXR1cm4gcmVzZWFyY2hbXCJuZXh0X2V0YVwiXTtcbiAgICB9XG4gICAgcmV0dXJuIE1hdGgucG93KDEwLCAxMCk7XG59O1xudmFyIGdldF90ZWNoX3RyYWRlX2Nvc3QgPSBmdW5jdGlvbiAoZnJvbSwgdG8sIHRlY2hfbmFtZSkge1xuICAgIGlmICh0ZWNoX25hbWUgPT09IHZvaWQgMCkgeyB0ZWNoX25hbWUgPSBudWxsOyB9XG4gICAgdmFyIHRvdGFsX2Nvc3QgPSAwO1xuICAgIGZvciAodmFyIF9pID0gMCwgX2EgPSBPYmplY3QuZW50cmllcyh0by50ZWNoKTsgX2kgPCBfYS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgdmFyIF9iID0gX2FbX2ldLCB0ZWNoID0gX2JbMF0sIHZhbHVlID0gX2JbMV07XG4gICAgICAgIGlmICh0ZWNoX25hbWUgPT0gbnVsbCB8fCB0ZWNoX25hbWUgPT0gdGVjaCkge1xuICAgICAgICAgICAgdmFyIG1lID0gZnJvbS50ZWNoW3RlY2hdLmxldmVsO1xuICAgICAgICAgICAgdmFyIHlvdSA9IHZhbHVlLmxldmVsO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPD0gbWUgLSB5b3U7ICsraSkge1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2codGVjaCwoeW91K2kpLCh5b3UraSkqMTUpXG4gICAgICAgICAgICAgICAgdG90YWxfY29zdCArPSAoeW91ICsgaSkgKiBOZXB0dW5lc1ByaWRlLmdhbWVDb25maWcudHJhZGVDb3N0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0b3RhbF9jb3N0O1xufTtcbi8vSG9va3MgdG8gYnV0dG9ucyBmb3Igc2hhcmluZyBhbmQgYnV5aW5nXG4vL1ByZXR0eSBzaW1wbGUgaG9va3MgdGhhdCBjYW4gYmUgYWRkZWQgdG8gYSB0eXBlc2NyaXB0IGZpbGUuXG52YXIgYXBwbHlfaG9va3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgTmVwdHVuZXNQcmlkZS5ucC5vbihcInNoYXJlX2FsbF90ZWNoXCIsIGZ1bmN0aW9uIChldmVudCwgcGxheWVyKSB7XG4gICAgICAgIHZhciB0b3RhbF9jb3N0ID0gZ2V0X3RlY2hfdHJhZGVfY29zdChnZXRfaGVybyhOZXB0dW5lc1ByaWRlLnVuaXZlcnNlKSwgcGxheWVyKTtcbiAgICAgICAgTmVwdHVuZXNQcmlkZS50ZW1wbGF0ZXNbXCJjb25maXJtX3RlY2hfc2hhcmVfXCIuY29uY2F0KHBsYXllci51aWQpXSA9IFwiQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIHNwZW5kICRcIi5jb25jYXQodG90YWxfY29zdCwgXCIgdG8gZ2l2ZSBcIikuY29uY2F0KHBsYXllci5yYXdBbGlhcywgXCIgYWxsIG9mIHlvdXIgdGVjaD9cIik7XG4gICAgICAgIE5lcHR1bmVzUHJpZGUubnAudHJpZ2dlcihcInNob3dfc2NyZWVuXCIsIFtcbiAgICAgICAgICAgIFwiY29uZmlybVwiLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IFwiY29uZmlybV90ZWNoX3NoYXJlX1wiLmNvbmNhdChwbGF5ZXIudWlkKSxcbiAgICAgICAgICAgICAgICBldmVudEtpbmQ6IFwiY29uZmlybV90cmFkZV90ZWNoXCIsXG4gICAgICAgICAgICAgICAgZXZlbnREYXRhOiBwbGF5ZXIsXG4gICAgICAgICAgICB9LFxuICAgICAgICBdKTtcbiAgICB9KTtcbiAgICBOZXB0dW5lc1ByaWRlLm5wLm9uKFwiYnV5X2FsbF90ZWNoXCIsIGZ1bmN0aW9uIChldmVudCwgZGF0YSkge1xuICAgICAgICB2YXIgcGxheWVyID0gZGF0YS5wbGF5ZXI7XG4gICAgICAgIHZhciBjb3N0ID0gZGF0YS5jb3N0O1xuICAgICAgICBOZXB0dW5lc1ByaWRlLnRlbXBsYXRlc1tcImNvbmZpcm1fdGVjaF9zaGFyZV9cIi5jb25jYXQocGxheWVyLnVpZCldID0gXCJBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gc3BlbmQgJFwiLmNvbmNhdChjb3N0LCBcIiB0byBidXkgYWxsIG9mIFwiKS5jb25jYXQocGxheWVyLnJhd0FsaWFzLCBcIidzIHRlY2g/IEl0IGlzIHVwIHRvIHRoZW0gdG8gYWN0dWFsbHkgc2VuZCBpdCB0byB5b3UuXCIpO1xuICAgICAgICBOZXB0dW5lc1ByaWRlLm5wLnRyaWdnZXIoXCJzaG93X3NjcmVlblwiLCBbXG4gICAgICAgICAgICBcImNvbmZpcm1cIixcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBcImNvbmZpcm1fdGVjaF9zaGFyZV9cIi5jb25jYXQocGxheWVyLnVpZCksXG4gICAgICAgICAgICAgICAgZXZlbnRLaW5kOiBcImNvbmZpcm1fYnV5X3RlY2hcIixcbiAgICAgICAgICAgICAgICBldmVudERhdGE6IGRhdGEsXG4gICAgICAgICAgICB9LFxuICAgICAgICBdKTtcbiAgICB9KTtcbiAgICBOZXB0dW5lc1ByaWRlLm5wLm9uKFwiYnV5X29uZV90ZWNoXCIsIGZ1bmN0aW9uIChldmVudCwgZGF0YSkge1xuICAgICAgICB2YXIgcGxheWVyID0gZGF0YS5wbGF5ZXI7XG4gICAgICAgIHZhciB0ZWNoID0gZGF0YS50ZWNoO1xuICAgICAgICB2YXIgY29zdCA9IGRhdGEuY29zdDtcbiAgICAgICAgTmVwdHVuZXNQcmlkZS50ZW1wbGF0ZXNbXCJjb25maXJtX3RlY2hfc2hhcmVfXCIuY29uY2F0KHBsYXllci51aWQpXSA9IFwiQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIHNwZW5kICRcIi5jb25jYXQoY29zdCwgXCIgdG8gYnV5IFwiKS5jb25jYXQodGVjaCwgXCIgZnJvbSBcIikuY29uY2F0KHBsYXllci5yYXdBbGlhcywgXCI/IEl0IGlzIHVwIHRvIHRoZW0gdG8gYWN0dWFsbHkgc2VuZCBpdCB0byB5b3UuXCIpO1xuICAgICAgICBOZXB0dW5lc1ByaWRlLm5wLnRyaWdnZXIoXCJzaG93X3NjcmVlblwiLCBbXG4gICAgICAgICAgICBcImNvbmZpcm1cIixcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBcImNvbmZpcm1fdGVjaF9zaGFyZV9cIi5jb25jYXQocGxheWVyLnVpZCksXG4gICAgICAgICAgICAgICAgZXZlbnRLaW5kOiBcImNvbmZpcm1fYnV5X3RlY2hcIixcbiAgICAgICAgICAgICAgICBldmVudERhdGE6IGRhdGEsXG4gICAgICAgICAgICB9LFxuICAgICAgICBdKTtcbiAgICB9KTtcbiAgICBOZXB0dW5lc1ByaWRlLm5wLm9uKFwiY29uZmlybV90cmFkZV90ZWNoXCIsIGZ1bmN0aW9uIChldmVuLCBwbGF5ZXIpIHtcbiAgICAgICAgdmFyIGhlcm8gPSBnZXRfaGVybyhOZXB0dW5lc1ByaWRlLnVuaXZlcnNlKTtcbiAgICAgICAgdmFyIGRpc3BsYXkgPSBkaXNwbGF5X3RlY2hfdHJhZGluZygpO1xuICAgICAgICB2YXIgY2xvc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlLnNlbGVjdFBsYXllcihwbGF5ZXIpO1xuICAgICAgICAgICAgTmVwdHVuZXNQcmlkZS5ucC50cmlnZ2VyKFwicmVmcmVzaF9pbnRlcmZhY2VcIik7XG4gICAgICAgICAgICBOZXB0dW5lc1ByaWRlLm5wLm5wdWkucmVmcmVzaFR1cm5NYW5hZ2VyKCk7XG4gICAgICAgIH07XG4gICAgICAgIHZhciBvZmZzZXQgPSAzMDA7XG4gICAgICAgIHZhciBfbG9vcF8xID0gZnVuY3Rpb24gKHRlY2gsIHZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgbWUgPSBoZXJvLnRlY2hbdGVjaF0ubGV2ZWw7XG4gICAgICAgICAgICB2YXIgeW91ID0gdmFsdWUubGV2ZWw7XG4gICAgICAgICAgICB2YXIgX2xvb3BfMiA9IGZ1bmN0aW9uIChpKSB7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKG1lIC0geW91LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcIm9yZGVyXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBvcmRlcjogXCJzaGFyZV90ZWNoLFwiLmNvbmNhdChwbGF5ZXIudWlkLCBcIixcIikuY29uY2F0KHRlY2gpLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgZGlzcGxheS50cmFuc2FjdChcIlNlbmRpbmcgXCIuY29uY2F0KHRlY2gsIFwiIGxldmVsIFwiKS5jb25jYXQoeW91ICsgaSkpO1xuICAgICAgICAgICAgICAgICAgICBOZXB0dW5lc1ByaWRlLm5wLnRyaWdnZXIoXCJzZXJ2ZXJfcmVxdWVzdFwiLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcIm9yZGVyXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBvcmRlcjogXCJzaGFyZV90ZWNoLFwiLmNvbmNhdChwbGF5ZXIudWlkLCBcIixcIikuY29uY2F0KHRlY2gpLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGkgPT0gbWUgLSB5b3UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXkudHJhbnNhY3QoXCJEb25lLlwiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIG9mZnNldCk7XG4gICAgICAgICAgICAgICAgb2Zmc2V0ICs9IDEwMDA7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPD0gbWUgLSB5b3U7ICsraSkge1xuICAgICAgICAgICAgICAgIF9sb29wXzIoaSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGZvciAodmFyIF9pID0gMCwgX2EgPSBPYmplY3QuZW50cmllcyhwbGF5ZXIudGVjaCk7IF9pIDwgX2EubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICB2YXIgX2IgPSBfYVtfaV0sIHRlY2ggPSBfYlswXSwgdmFsdWUgPSBfYlsxXTtcbiAgICAgICAgICAgIF9sb29wXzEodGVjaCwgdmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIHNldFRpbWVvdXQoY2xvc2UsIG9mZnNldCArIDEwMDApO1xuICAgIH0pO1xuICAgIC8vUGF5cyBhIHBsYXllciBhIGNlcnRhaW4gYW1vdW50XG4gICAgTmVwdHVuZXNQcmlkZS5ucC5vbihcImNvbmZpcm1fYnV5X3RlY2hcIiwgZnVuY3Rpb24gKGV2ZW4sIGRhdGEpIHtcbiAgICAgICAgdmFyIHBsYXllciA9IGRhdGEucGxheWVyO1xuICAgICAgICBOZXB0dW5lc1ByaWRlLm5wLnRyaWdnZXIoXCJzZXJ2ZXJfcmVxdWVzdFwiLCB7XG4gICAgICAgICAgICB0eXBlOiBcIm9yZGVyXCIsXG4gICAgICAgICAgICBvcmRlcjogXCJzZW5kX21vbmV5LFwiLmNvbmNhdChwbGF5ZXIudWlkLCBcIixcIikuY29uY2F0KGRhdGEuY29zdCksXG4gICAgICAgIH0pO1xuICAgICAgICBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlLnNlbGVjdFBsYXllcihwbGF5ZXIpO1xuICAgICAgICBOZXB0dW5lc1ByaWRlLm5wLnRyaWdnZXIoXCJyZWZyZXNoX2ludGVyZmFjZVwiKTtcbiAgICB9KTtcbn07XG52YXIgX3dpZGVfdmlldyA9IGZ1bmN0aW9uICgpIHtcbiAgICBOZXB0dW5lc1ByaWRlLm5wLnRyaWdnZXIoXCJtYXBfY2VudGVyX3NsaWRlXCIsIHsgeDogMCwgeTogMCB9KTtcbiAgICBOZXB0dW5lc1ByaWRlLm5wLnRyaWdnZXIoXCJ6b29tX21pbmltYXBcIik7XG59O1xuZnVuY3Rpb24gTGVnYWN5X05lcHR1bmVzUHJpZGVBZ2VudCgpIHtcbiAgICB2YXIgX2EsIF9iO1xuICAgIHZhciB0aXRsZSA9ICgoX2EgPSBkb2N1bWVudCA9PT0gbnVsbCB8fCBkb2N1bWVudCA9PT0gdm9pZCAwID8gdm9pZCAwIDogZG9jdW1lbnQuY3VycmVudFNjcmlwdCkgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLnRpdGxlKSB8fCBcIlNBVCBcIi5jb25jYXQoU0FUX1ZFUlNJT04pO1xuICAgIHZhciB2ZXJzaW9uID0gdGl0bGUucmVwbGFjZSgvXi4qdi8sIFwidlwiKTtcbiAgICBjb25zb2xlLmxvZyh0aXRsZSk7XG4gICAgdmFyIGNvcHkgPSBmdW5jdGlvbiAocmVwb3J0Rm4pIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJlcG9ydEZuKCk7XG4gICAgICAgICAgICBuYXZpZ2F0b3IuY2xpcGJvYXJkLndyaXRlVGV4dChsYXN0Q2xpcCk7XG4gICAgICAgIH07XG4gICAgfTtcbiAgICB2YXIgaG90a2V5cyA9IFtdO1xuICAgIHZhciBob3RrZXkgPSBmdW5jdGlvbiAoa2V5LCBhY3Rpb24pIHtcbiAgICAgICAgaG90a2V5cy5wdXNoKFtrZXksIGFjdGlvbl0pO1xuICAgICAgICBNb3VzZXRyYXAuYmluZChrZXksIGNvcHkoYWN0aW9uKSk7XG4gICAgfTtcbiAgICBpZiAoIVN0cmluZy5wcm90b3R5cGUuZm9ybWF0KSB7XG4gICAgICAgIFN0cmluZy5wcm90b3R5cGUuZm9ybWF0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGFyZ3MgPSBbXTtcbiAgICAgICAgICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICAgICAgYXJnc1tfaV0gPSBhcmd1bWVudHNbX2ldO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVwbGFjZSgveyhcXGQrKX0vZywgZnVuY3Rpb24gKG1hdGNoLCBudW1iZXIpIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGFyZ3NbbnVtYmVyXSA9PT0gXCJudW1iZXJcIikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gTWF0aC50cnVuYyhhcmdzW251bWJlcl0gKiAxMDAwKSAvIDEwMDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB0eXBlb2YgYXJnc1tudW1iZXJdICE9IFwidW5kZWZpbmVkXCIgPyBhcmdzW251bWJlcl0gOiBtYXRjaDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgIH1cbiAgICB2YXIgbGlua0ZsZWV0cyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHVuaXZlcnNlID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZTtcbiAgICAgICAgdmFyIGZsZWV0cyA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2UuZ2FsYXh5LmZsZWV0cztcbiAgICAgICAgZm9yICh2YXIgZiBpbiBmbGVldHMpIHtcbiAgICAgICAgICAgIHZhciBmbGVldCA9IGZsZWV0c1tmXTtcbiAgICAgICAgICAgIHZhciBmbGVldExpbmsgPSBcIjxhIG9uQ2xpY2s9J0NydXguY3J1eC50cmlnZ2VyKFxcXCJzaG93X2ZsZWV0X3VpZFxcXCIsIFxcXCJcIi5jb25jYXQoZmxlZXQudWlkLCBcIlxcXCIpJz5cIikuY29uY2F0KGZsZWV0Lm4sIFwiPC9hPlwiKTtcbiAgICAgICAgICAgIHVuaXZlcnNlLmh5cGVybGlua2VkTWVzc2FnZUluc2VydHNbZmxlZXQubl0gPSBmbGVldExpbms7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGZ1bmN0aW9uIHN0YXJSZXBvcnQoKSB7XG4gICAgICAgIHZhciBwbGF5ZXJzID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5nYWxheHkucGxheWVycztcbiAgICAgICAgdmFyIHN0YXJzID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5nYWxheHkuc3RhcnM7XG4gICAgICAgIHZhciBvdXRwdXQgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgcCBpbiBwbGF5ZXJzKSB7XG4gICAgICAgICAgICBvdXRwdXQucHVzaChcIltbezB9XV1cIi5mb3JtYXQocCkpO1xuICAgICAgICAgICAgZm9yICh2YXIgcyBpbiBzdGFycykge1xuICAgICAgICAgICAgICAgIHZhciBzdGFyID0gc3RhcnNbc107XG4gICAgICAgICAgICAgICAgaWYgKHN0YXIucHVpZCA9PSBwICYmIHN0YXIuc2hpcHNQZXJUaWNrID49IDApIHtcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0LnB1c2goXCLigIPigINbW3swfV1dIHsxfS97Mn0vezN9IHs0fSBzaGlwc1wiLmZvcm1hdChzdGFyLm4sIHN0YXIuZSwgc3Rhci5pLCBzdGFyLnMsIHN0YXIudG90YWxEZWZlbnNlcykpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjbGlwKG91dHB1dC5qb2luKFwiXFxuXCIpKTtcbiAgICB9XG4gICAgaG90a2V5KFwiKlwiLCBzdGFyUmVwb3J0KTtcbiAgICBzdGFyUmVwb3J0LmhlbHAgPVxuICAgICAgICBcIkdlbmVyYXRlIGEgcmVwb3J0IG9uIGFsbCBzdGFycyBpbiB5b3VyIHNjYW5uaW5nIHJhbmdlLCBhbmQgY29weSBpdCB0byB0aGUgY2xpcGJvYXJkLlwiICtcbiAgICAgICAgICAgIFwiPHA+VGhpcyBzYW1lIHJlcG9ydCBjYW4gYWxzbyBiZSB2aWV3ZWQgdmlhIHRoZSBtZW51OyBlbnRlciB0aGUgYWdlbnQgYW5kIGNob29zZSBpdCBmcm9tIHRoZSBkcm9wZG93bi5cIjtcbiAgICB2YXIgYW1wbSA9IGZ1bmN0aW9uIChoLCBtKSB7XG4gICAgICAgIGlmIChtIDwgMTApXG4gICAgICAgICAgICBtID0gXCIwXCIuY29uY2F0KG0pO1xuICAgICAgICBpZiAoaCA8IDEyKSB7XG4gICAgICAgICAgICBpZiAoaCA9PSAwKVxuICAgICAgICAgICAgICAgIGggPSAxMjtcbiAgICAgICAgICAgIHJldHVybiBcInswfTp7MX0gQU1cIi5mb3JtYXQoaCwgbSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoaCA+IDEyKSB7XG4gICAgICAgICAgICByZXR1cm4gXCJ7MH06ezF9IFBNXCIuZm9ybWF0KGggLSAxMiwgbSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFwiezB9OnsxfSBQTVwiLmZvcm1hdChoLCBtKTtcbiAgICB9O1xuICAgIHZhciBtc1RvVGljayA9IGZ1bmN0aW9uICh0aWNrLCB3aG9sZVRpbWUpIHtcbiAgICAgICAgdmFyIHVuaXZlcnNlID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZTtcbiAgICAgICAgdmFyIG1zX3NpbmNlX2RhdGEgPSAwO1xuICAgICAgICB2YXIgdGYgPSB1bml2ZXJzZS5nYWxheHkudGlja19mcmFnbWVudDtcbiAgICAgICAgdmFyIGx0YyA9IHVuaXZlcnNlLmxvY1RpbWVDb3JyZWN0aW9uO1xuICAgICAgICBpZiAoIXVuaXZlcnNlLmdhbGF4eS5wYXVzZWQpIHtcbiAgICAgICAgICAgIG1zX3NpbmNlX2RhdGEgPSBuZXcgRGF0ZSgpLnZhbHVlT2YoKSAtIHVuaXZlcnNlLm5vdy52YWx1ZU9mKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHdob2xlVGltZSB8fCB1bml2ZXJzZS5nYWxheHkudHVybl9iYXNlZCkge1xuICAgICAgICAgICAgbXNfc2luY2VfZGF0YSA9IDA7XG4gICAgICAgICAgICB0ZiA9IDA7XG4gICAgICAgICAgICBsdGMgPSAwO1xuICAgICAgICB9XG4gICAgICAgIHZhciBtc19yZW1haW5pbmcgPSB0aWNrICogMTAwMCAqIDYwICogdW5pdmVyc2UuZ2FsYXh5LnRpY2tfcmF0ZSAtXG4gICAgICAgICAgICB0ZiAqIDEwMDAgKiA2MCAqIHVuaXZlcnNlLmdhbGF4eS50aWNrX3JhdGUgLVxuICAgICAgICAgICAgbXNfc2luY2VfZGF0YSAtXG4gICAgICAgICAgICBsdGM7XG4gICAgICAgIHJldHVybiBtc19yZW1haW5pbmc7XG4gICAgfTtcbiAgICB2YXIgZGF5cyA9IFtcIlN1blwiLCBcIk1vblwiLCBcIlR1ZVwiLCBcIldlZFwiLCBcIlRodVwiLCBcIkZyaVwiLCBcIlNhdFwiXTtcbiAgICB2YXIgbXNUb0V0YVN0cmluZyA9IGZ1bmN0aW9uIChtc3BsdXMsIHByZWZpeCkge1xuICAgICAgICB2YXIgbm93ID0gbmV3IERhdGUoKTtcbiAgICAgICAgdmFyIGFycml2YWwgPSBuZXcgRGF0ZShub3cuZ2V0VGltZSgpICsgbXNwbHVzKTtcbiAgICAgICAgdmFyIHAgPSBwcmVmaXggIT09IHVuZGVmaW5lZCA/IHByZWZpeCA6IFwiRVRBIFwiO1xuICAgICAgICAvL1doYXQgaXMgdHR0P1xuICAgICAgICB2YXIgdHR0ID0gcCArIGFtcG0oYXJyaXZhbC5nZXRIb3VycygpLCBhcnJpdmFsLmdldE1pbnV0ZXMoKSk7XG4gICAgICAgIGlmICghTmVwdHVuZXNQcmlkZS5nYW1lQ29uZmlnLnR1cm5CYXNlZCkge1xuICAgICAgICAgICAgdHR0ID0gcCArIGFtcG0oYXJyaXZhbC5nZXRIb3VycygpLCBhcnJpdmFsLmdldE1pbnV0ZXMoKSk7XG4gICAgICAgICAgICBpZiAoYXJyaXZhbC5nZXREYXkoKSAhPSBub3cuZ2V0RGF5KCkpXG4gICAgICAgICAgICAgICAgLy8gR2VuZXJhdGUgdGltZSBzdHJpbmdcbiAgICAgICAgICAgICAgICB0dHQgPSBcIlwiLmNvbmNhdChwKS5jb25jYXQoZGF5c1thcnJpdmFsLmdldERheSgpXSwgXCIgQCBcIikuY29uY2F0KGFtcG0oYXJyaXZhbC5nZXRIb3VycygpLCBhcnJpdmFsLmdldE1pbnV0ZXMoKSkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdmFyIHRvdGFsRVRBID0gYXJyaXZhbCAtIG5vdztcbiAgICAgICAgICAgIHR0dCA9IHAgKyBDcnV4LmZvcm1hdFRpbWUodG90YWxFVEEpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0dHQ7XG4gICAgfTtcbiAgICB2YXIgdGlja1RvRXRhU3RyaW5nID0gZnVuY3Rpb24gKHRpY2ssIHByZWZpeCkge1xuICAgICAgICB2YXIgbXNwbHVzID0gbXNUb1RpY2sodGljayk7XG4gICAgICAgIHJldHVybiBtc1RvRXRhU3RyaW5nKG1zcGx1cywgcHJlZml4KTtcbiAgICB9O1xuICAgIHZhciBtc1RvQ3ljbGVTdHJpbmcgPSBmdW5jdGlvbiAobXNwbHVzLCBwcmVmaXgpIHtcbiAgICAgICAgdmFyIHAgPSBwcmVmaXggIT09IHVuZGVmaW5lZCA/IHByZWZpeCA6IFwiRVRBXCI7XG4gICAgICAgIHZhciBjeWNsZUxlbmd0aCA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2UuZ2FsYXh5LnByb2R1Y3Rpb25fcmF0ZTtcbiAgICAgICAgdmFyIHRpY2tMZW5ndGggPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlLmdhbGF4eS50aWNrX3JhdGU7XG4gICAgICAgIHZhciB0aWNrc1RvQ29tcGxldGUgPSBNYXRoLmNlaWwobXNwbHVzIC8gNjAwMDAgLyB0aWNrTGVuZ3RoKTtcbiAgICAgICAgLy9HZW5lcmF0ZSB0aW1lIHRleHQgc3RyaW5nXG4gICAgICAgIHZhciB0dHQgPSBcIlwiLmNvbmNhdChwKS5jb25jYXQodGlja3NUb0NvbXBsZXRlLCBcIiB0aWNrcyAtIFwiKS5jb25jYXQoKHRpY2tzVG9Db21wbGV0ZSAvIGN5Y2xlTGVuZ3RoKS50b0ZpeGVkKDIpLCBcIkNcIik7XG4gICAgICAgIHJldHVybiB0dHQ7XG4gICAgfTtcbiAgICB2YXIgZmxlZXRPdXRjb21lcyA9IHt9O1xuICAgIHZhciBjb21iYXRIYW5kaWNhcCA9IDA7XG4gICAgdmFyIGNvbWJhdE91dGNvbWVzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgX2E7XG4gICAgICAgIHZhciB1bml2ZXJzZSA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2U7XG4gICAgICAgIHZhciBwbGF5ZXJzID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5nYWxheHkucGxheWVycztcbiAgICAgICAgdmFyIGZsZWV0cyA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2UuZ2FsYXh5LmZsZWV0cztcbiAgICAgICAgdmFyIHN0YXJzID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5nYWxheHkuc3RhcnM7XG4gICAgICAgIHZhciBmbGlnaHRzID0gW107XG4gICAgICAgIGZsZWV0T3V0Y29tZXMgPSB7fTtcbiAgICAgICAgZm9yICh2YXIgZiBpbiBmbGVldHMpIHtcbiAgICAgICAgICAgIHZhciBmbGVldCA9IGZsZWV0c1tmXTtcbiAgICAgICAgICAgIGlmIChmbGVldC5vICYmIGZsZWV0Lm8ubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHZhciBzdG9wXzEgPSBmbGVldC5vWzBdWzFdO1xuICAgICAgICAgICAgICAgIHZhciB0aWNrcyA9IGZsZWV0LmV0YUZpcnN0O1xuICAgICAgICAgICAgICAgIHZhciBzdGFybmFtZSA9IChfYSA9IHN0YXJzW3N0b3BfMV0pID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5uO1xuICAgICAgICAgICAgICAgIGlmICghc3Rhcm5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZsaWdodHMucHVzaChbXG4gICAgICAgICAgICAgICAgICAgIHRpY2tzLFxuICAgICAgICAgICAgICAgICAgICBcIltbezB9XV0gW1t7MX1dXSB7Mn0g4oaSIFtbezN9XV0gezR9XCIuZm9ybWF0KGZsZWV0LnB1aWQsIGZsZWV0Lm4sIGZsZWV0LnN0LCBzdGFybmFtZSwgdGlja1RvRXRhU3RyaW5nKHRpY2tzKSksXG4gICAgICAgICAgICAgICAgICAgIGZsZWV0LFxuICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZsaWdodHMgPSBmbGlnaHRzLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgICAgIHJldHVybiBhWzBdIC0gYlswXTtcbiAgICAgICAgfSk7XG4gICAgICAgIHZhciBhcnJpdmFscyA9IHt9O1xuICAgICAgICB2YXIgb3V0cHV0ID0gW107XG4gICAgICAgIHZhciBhcnJpdmFsVGltZXMgPSBbXTtcbiAgICAgICAgdmFyIHN0YXJzdGF0ZSA9IHt9O1xuICAgICAgICBmb3IgKHZhciBpIGluIGZsaWdodHMpIHtcbiAgICAgICAgICAgIHZhciBmbGVldCA9IGZsaWdodHNbaV1bMl07XG4gICAgICAgICAgICBpZiAoZmxlZXQub3JiaXRpbmcpIHtcbiAgICAgICAgICAgICAgICB2YXIgb3JiaXQgPSBmbGVldC5vcmJpdGluZy51aWQ7XG4gICAgICAgICAgICAgICAgaWYgKCFzdGFyc3RhdGVbb3JiaXRdKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXJzdGF0ZVtvcmJpdF0gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYXN0X3VwZGF0ZWQ6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICBzaGlwczogc3RhcnNbb3JiaXRdLnRvdGFsRGVmZW5zZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBwdWlkOiBzdGFyc1tvcmJpdF0ucHVpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGM6IHN0YXJzW29yYml0XS5jLFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBUaGlzIGZsZWV0IGlzIGRlcGFydGluZyB0aGlzIHRpY2s7IHJlbW92ZSBpdCBmcm9tIHRoZSBvcmlnaW4gc3RhcidzIHRvdGFsRGVmZW5zZXNcbiAgICAgICAgICAgICAgICBzdGFyc3RhdGVbb3JiaXRdLnNoaXBzIC09IGZsZWV0LnN0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGFycml2YWxUaW1lcy5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBhcnJpdmFsVGltZXNbYXJyaXZhbFRpbWVzLmxlbmd0aCAtIDFdICE9PSBmbGlnaHRzW2ldWzBdKSB7XG4gICAgICAgICAgICAgICAgYXJyaXZhbFRpbWVzLnB1c2goZmxpZ2h0c1tpXVswXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgYXJyaXZhbEtleSA9IFtmbGlnaHRzW2ldWzBdLCBmbGVldC5vWzBdWzFdXTtcbiAgICAgICAgICAgIGlmIChhcnJpdmFsc1thcnJpdmFsS2V5XSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgYXJyaXZhbHNbYXJyaXZhbEtleV0ucHVzaChmbGVldCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBhcnJpdmFsc1thcnJpdmFsS2V5XSA9IFtmbGVldF07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZm9yICh2YXIgayBpbiBhcnJpdmFscykge1xuICAgICAgICAgICAgdmFyIGFycml2YWwgPSBhcnJpdmFsc1trXTtcbiAgICAgICAgICAgIHZhciBrYSA9IGsuc3BsaXQoXCIsXCIpO1xuICAgICAgICAgICAgdmFyIHRpY2sgPSBrYVswXTtcbiAgICAgICAgICAgIHZhciBzdGFySWQgPSBrYVsxXTtcbiAgICAgICAgICAgIGlmICghc3RhcnN0YXRlW3N0YXJJZF0pIHtcbiAgICAgICAgICAgICAgICBzdGFyc3RhdGVbc3RhcklkXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgbGFzdF91cGRhdGVkOiAwLFxuICAgICAgICAgICAgICAgICAgICBzaGlwczogc3RhcnNbc3RhcklkXS50b3RhbERlZmVuc2VzLFxuICAgICAgICAgICAgICAgICAgICBwdWlkOiBzdGFyc1tzdGFySWRdLnB1aWQsXG4gICAgICAgICAgICAgICAgICAgIGM6IHN0YXJzW3N0YXJJZF0uYyxcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHN0YXJzdGF0ZVtzdGFySWRdLnB1aWQgPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAvLyBhc3NpZ24gb3duZXJzaGlwIG9mIHRoZSBzdGFyIHRvIHRoZSBwbGF5ZXIgd2hvc2UgZmxlZXQgaGFzIHRyYXZlbGVkIHRoZSBsZWFzdCBkaXN0YW5jZVxuICAgICAgICAgICAgICAgIHZhciBtaW5EaXN0YW5jZSA9IDEwMDAwO1xuICAgICAgICAgICAgICAgIHZhciBvd25lciA9IC0xO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgaW4gYXJyaXZhbCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZmxlZXQgPSBhcnJpdmFsW2ldO1xuICAgICAgICAgICAgICAgICAgICB2YXIgZCA9IHVuaXZlcnNlLmRpc3RhbmNlKHN0YXJzW3N0YXJJZF0ueCwgc3RhcnNbc3RhcklkXS55LCBmbGVldC5seCwgZmxlZXQubHkpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZCA8IG1pbkRpc3RhbmNlIHx8IG93bmVyID09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvd25lciA9IGZsZWV0LnB1aWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBtaW5EaXN0YW5jZSA9IGQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc3RhcnN0YXRlW3N0YXJJZF0ucHVpZCA9IG93bmVyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb3V0cHV0LnB1c2goXCJ7MH06IFtbezF9XV0gW1t7Mn1dXSB7M30gc2hpcHNcIi5mb3JtYXQodGlja1RvRXRhU3RyaW5nKHRpY2ssIFwiQFwiKSwgc3RhcnN0YXRlW3N0YXJJZF0ucHVpZCwgc3RhcnNbc3RhcklkXS5uLCBzdGFyc3RhdGVbc3RhcklkXS5zaGlwcykpO1xuICAgICAgICAgICAgdmFyIHRpY2tEZWx0YSA9IHRpY2sgLSBzdGFyc3RhdGVbc3RhcklkXS5sYXN0X3VwZGF0ZWQgLSAxO1xuICAgICAgICAgICAgaWYgKHRpY2tEZWx0YSA+IDApIHtcbiAgICAgICAgICAgICAgICB2YXIgb2xkU2hpcHMgPSBzdGFyc3RhdGVbc3RhcklkXS5zaGlwcztcbiAgICAgICAgICAgICAgICBzdGFyc3RhdGVbc3RhcklkXS5sYXN0X3VwZGF0ZWQgPSB0aWNrIC0gMTtcbiAgICAgICAgICAgICAgICBpZiAoc3RhcnNbc3RhcklkXS5zaGlwc1BlclRpY2spIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG9sZGMgPSBzdGFyc3RhdGVbc3RhcklkXS5jO1xuICAgICAgICAgICAgICAgICAgICBzdGFyc3RhdGVbc3RhcklkXS5zaGlwcyArPVxuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnNbc3RhcklkXS5zaGlwc1BlclRpY2sgKiB0aWNrRGVsdGEgKyBvbGRjO1xuICAgICAgICAgICAgICAgICAgICBzdGFyc3RhdGVbc3RhcklkXS5jID1cbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJzdGF0ZVtzdGFySWRdLnNoaXBzIC0gTWF0aC50cnVuYyhzdGFyc3RhdGVbc3RhcklkXS5zaGlwcyk7XG4gICAgICAgICAgICAgICAgICAgIHN0YXJzdGF0ZVtzdGFySWRdLnNoaXBzIC09IHN0YXJzdGF0ZVtzdGFySWRdLmM7XG4gICAgICAgICAgICAgICAgICAgIG91dHB1dC5wdXNoKFwi4oCD4oCDezB9K3szfSArIHsyfS9oID0gezF9K3s0fVwiLmZvcm1hdChvbGRTaGlwcywgc3RhcnN0YXRlW3N0YXJJZF0uc2hpcHMsIHN0YXJzW3N0YXJJZF0uc2hpcHNQZXJUaWNrLCBvbGRjLCBzdGFyc3RhdGVbc3RhcklkXS5jKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZm9yICh2YXIgaSBpbiBhcnJpdmFsKSB7XG4gICAgICAgICAgICAgICAgdmFyIGZsZWV0ID0gYXJyaXZhbFtpXTtcbiAgICAgICAgICAgICAgICBpZiAoZmxlZXQucHVpZCA9PSBzdGFyc3RhdGVbc3RhcklkXS5wdWlkIHx8XG4gICAgICAgICAgICAgICAgICAgIHN0YXJzdGF0ZVtzdGFySWRdLnB1aWQgPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG9sZFNoaXBzID0gc3RhcnN0YXRlW3N0YXJJZF0uc2hpcHM7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzdGFyc3RhdGVbc3RhcklkXS5wdWlkID09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFyc3RhdGVbc3RhcklkXS5zaGlwcyA9IGZsZWV0LnN0O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnN0YXRlW3N0YXJJZF0uc2hpcHMgKz0gZmxlZXQuc3Q7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdmFyIGxhbmRpbmdTdHJpbmcgPSBcIuKAg+KAg3swfSArIHsyfSBvbiBbW3szfV1dID0gezF9XCIuZm9ybWF0KG9sZFNoaXBzLCBzdGFyc3RhdGVbc3RhcklkXS5zaGlwcywgZmxlZXQuc3QsIGZsZWV0Lm4pO1xuICAgICAgICAgICAgICAgICAgICBvdXRwdXQucHVzaChsYW5kaW5nU3RyaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgbGFuZGluZ1N0cmluZyA9IGxhbmRpbmdTdHJpbmcuc3Vic3RyaW5nKDIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAodmFyIGkgaW4gYXJyaXZhbCkge1xuICAgICAgICAgICAgICAgIHZhciBmbGVldCA9IGFycml2YWxbaV07XG4gICAgICAgICAgICAgICAgaWYgKGZsZWV0LnB1aWQgPT0gc3RhcnN0YXRlW3N0YXJJZF0ucHVpZCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgb3V0Y29tZVN0cmluZyA9IFwiezB9IHNoaXBzIG9uIHsxfVwiLmZvcm1hdChNYXRoLmZsb29yKHN0YXJzdGF0ZVtzdGFySWRdLnNoaXBzKSwgc3RhcnNbc3RhcklkXS5uKTtcbiAgICAgICAgICAgICAgICAgICAgZmxlZXRPdXRjb21lc1tmbGVldC51aWRdID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZXRhOiB0aWNrVG9FdGFTdHJpbmcoZmxlZXQuZXRhRmlyc3QpLFxuICAgICAgICAgICAgICAgICAgICAgICAgb3V0Y29tZTogb3V0Y29tZVN0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgYXd0ID0gMDtcbiAgICAgICAgICAgIHZhciBvZmZlbnNlID0gMDtcbiAgICAgICAgICAgIHZhciBjb250cmlidXRpb24gPSB7fTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgaW4gYXJyaXZhbCkge1xuICAgICAgICAgICAgICAgIHZhciBmbGVldCA9IGFycml2YWxbaV07XG4gICAgICAgICAgICAgICAgaWYgKGZsZWV0LnB1aWQgIT0gc3RhcnN0YXRlW3N0YXJJZF0ucHVpZCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgb2xkYSA9IG9mZmVuc2U7XG4gICAgICAgICAgICAgICAgICAgIG9mZmVuc2UgKz0gZmxlZXQuc3Q7XG4gICAgICAgICAgICAgICAgICAgIG91dHB1dC5wdXNoKFwi4oCD4oCDW1t7NH1dXSEgezB9ICsgezJ9IG9uIFtbezN9XV0gPSB7MX1cIi5mb3JtYXQob2xkYSwgb2ZmZW5zZSwgZmxlZXQuc3QsIGZsZWV0Lm4sIGZsZWV0LnB1aWQpKTtcbiAgICAgICAgICAgICAgICAgICAgY29udHJpYnV0aW9uW1tmbGVldC5wdWlkLCBmbGVldC51aWRdXSA9IGZsZWV0LnN0O1xuICAgICAgICAgICAgICAgICAgICB2YXIgd3QgPSBwbGF5ZXJzW2ZsZWV0LnB1aWRdLnRlY2gud2VhcG9ucy5sZXZlbDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHd0ID4gYXd0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhd3QgPSB3dDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBhdHRhY2tlcnNBZ2dyZWdhdGUgPSBvZmZlbnNlO1xuICAgICAgICAgICAgd2hpbGUgKG9mZmVuc2UgPiAwKSB7XG4gICAgICAgICAgICAgICAgdmFyIGR3dCA9IHBsYXllcnNbc3RhcnN0YXRlW3N0YXJJZF0ucHVpZF0udGVjaC53ZWFwb25zLmxldmVsO1xuICAgICAgICAgICAgICAgIHZhciBkZWZlbnNlID0gc3RhcnN0YXRlW3N0YXJJZF0uc2hpcHM7XG4gICAgICAgICAgICAgICAgb3V0cHV0LnB1c2goXCLigIPigINDb21iYXQhIFtbezB9XV0gZGVmZW5kaW5nXCIuZm9ybWF0KHN0YXJzdGF0ZVtzdGFySWRdLnB1aWQpKTtcbiAgICAgICAgICAgICAgICBvdXRwdXQucHVzaChcIuKAg+KAg+KAg+KAg0RlZmVuZGVycyB7MH0gc2hpcHMsIFdTIHsxfVwiLmZvcm1hdChkZWZlbnNlLCBkd3QpKTtcbiAgICAgICAgICAgICAgICBvdXRwdXQucHVzaChcIuKAg+KAg+KAg+KAg0F0dGFja2VycyB7MH0gc2hpcHMsIFdTIHsxfVwiLmZvcm1hdChvZmZlbnNlLCBhd3QpKTtcbiAgICAgICAgICAgICAgICBkd3QgKz0gMTtcbiAgICAgICAgICAgICAgICBpZiAoc3RhcnN0YXRlW3N0YXJJZF0ucHVpZCAhPT0gdW5pdmVyc2UuZ2FsYXh5LnBsYXllcl91aWQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbWJhdEhhbmRpY2FwID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZHd0ICs9IGNvbWJhdEhhbmRpY2FwO1xuICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0LnB1c2goXCLigIPigIPigIPigINEZWZlbmRlcnMgV1N7MH0gPSB7MX1cIi5mb3JtYXQoaGFuZGljYXBTdHJpbmcoXCJcIiksIGR3dCkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXd0IC09IGNvbWJhdEhhbmRpY2FwO1xuICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0LnB1c2goXCLigIPigIPigIPigINBdHRhY2tlcnMgV1N7MH0gPSB7MX1cIi5mb3JtYXQoaGFuZGljYXBTdHJpbmcoXCJcIiksIGF3dCkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY29tYmF0SGFuZGljYXAgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhd3QgKz0gY29tYmF0SGFuZGljYXA7XG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXQucHVzaChcIuKAg+KAg+KAg+KAg0F0dGFja2VycyBXU3swfSA9IHsxfVwiLmZvcm1hdChoYW5kaWNhcFN0cmluZyhcIlwiKSwgYXd0KSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkd3QgLT0gY29tYmF0SGFuZGljYXA7XG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXQucHVzaChcIuKAg+KAg+KAg+KAg0RlZmVuZGVycyBXU3swfSA9IHsxfVwiLmZvcm1hdChoYW5kaWNhcFN0cmluZyhcIlwiKSwgZHd0KSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHVuaXZlcnNlLmdhbGF4eS5wbGF5ZXJfdWlkID09PSBzdGFyc3RhdGVbc3RhcklkXS5wdWlkKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIHRydW5jYXRlIGRlZmVuc2UgaWYgd2UncmUgZGVmZW5kaW5nIHRvIGdpdmUgdGhlIG1vc3RcbiAgICAgICAgICAgICAgICAgICAgLy8gY29uc2VydmF0aXZlIGVzdGltYXRlXG4gICAgICAgICAgICAgICAgICAgIGRlZmVuc2UgPSBNYXRoLnRydW5jKGRlZmVuc2UpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB3aGlsZSAoZGVmZW5zZSA+IDAgJiYgb2ZmZW5zZSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgb2ZmZW5zZSAtPSBkd3Q7XG4gICAgICAgICAgICAgICAgICAgIGlmIChvZmZlbnNlIDw9IDApXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgZGVmZW5zZSAtPSBhd3Q7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciBuZXdBZ2dyZWdhdGUgPSAwO1xuICAgICAgICAgICAgICAgIHZhciBwbGF5ZXJDb250cmlidXRpb24gPSB7fTtcbiAgICAgICAgICAgICAgICB2YXIgYmlnZ2VzdFBsYXllciA9IC0xO1xuICAgICAgICAgICAgICAgIHZhciBiaWdnZXN0UGxheWVySWQgPSBzdGFyc3RhdGVbc3RhcklkXS5wdWlkO1xuICAgICAgICAgICAgICAgIGlmIChvZmZlbnNlID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBvdXRwdXQucHVzaChcIuKAg+KAg0F0dGFja2VycyB3aW4gd2l0aCB7MH0gc2hpcHMgcmVtYWluaW5nXCIuZm9ybWF0KG9mZmVuc2UpKTtcbiAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIga18xIGluIGNvbnRyaWJ1dGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGthXzEgPSBrXzEuc3BsaXQoXCIsXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGZsZWV0ID0gZmxlZXRzW2thXzFbMV1dO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHBsYXllcklkID0ga2FfMVswXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyaWJ1dGlvbltrXzFdID0gKG9mZmVuc2UgKiBjb250cmlidXRpb25ba18xXSkgLyBhdHRhY2tlcnNBZ2dyZWdhdGU7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdBZ2dyZWdhdGUgKz0gY29udHJpYnV0aW9uW2tfMV07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocGxheWVyQ29udHJpYnV0aW9uW3BsYXllcklkXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBsYXllckNvbnRyaWJ1dGlvbltwbGF5ZXJJZF0gKz0gY29udHJpYnV0aW9uW2tfMV07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbGF5ZXJDb250cmlidXRpb25bcGxheWVySWRdID0gY29udHJpYnV0aW9uW2tfMV07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocGxheWVyQ29udHJpYnV0aW9uW3BsYXllcklkXSA+IGJpZ2dlc3RQbGF5ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiaWdnZXN0UGxheWVyID0gcGxheWVyQ29udHJpYnV0aW9uW3BsYXllcklkXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiaWdnZXN0UGxheWVySWQgPSBwbGF5ZXJJZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dC5wdXNoKFwi4oCD4oCD4oCD4oCDW1t7MH1dXSBoYXMgezF9IG9uIFtbezJ9XV1cIi5mb3JtYXQoZmxlZXQucHVpZCwgY29udHJpYnV0aW9uW2tfMV0sIGZsZWV0Lm4pKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBvdXRjb21lU3RyaW5nID0gXCJXaW5zISB7MH0gbGFuZC5cIi5mb3JtYXQoY29udHJpYnV0aW9uW2tfMV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgZmxlZXRPdXRjb21lc1tmbGVldC51aWRdID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV0YTogdGlja1RvRXRhU3RyaW5nKGZsZWV0LmV0YUZpcnN0KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRjb21lOiBvdXRjb21lU3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBvZmZlbnNlID0gbmV3QWdncmVnYXRlIC0gcGxheWVyQ29udHJpYnV0aW9uW2JpZ2dlc3RQbGF5ZXJJZF07XG4gICAgICAgICAgICAgICAgICAgIHN0YXJzdGF0ZVtzdGFySWRdLnB1aWQgPSBiaWdnZXN0UGxheWVySWQ7XG4gICAgICAgICAgICAgICAgICAgIHN0YXJzdGF0ZVtzdGFySWRdLnNoaXBzID0gcGxheWVyQ29udHJpYnV0aW9uW2JpZ2dlc3RQbGF5ZXJJZF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzdGFyc3RhdGVbc3RhcklkXS5zaGlwcyA9IGRlZmVuc2U7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgaW4gYXJyaXZhbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGZsZWV0ID0gYXJyaXZhbFtpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmbGVldC5wdWlkID09IHN0YXJzdGF0ZVtzdGFySWRdLnB1aWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgb3V0Y29tZVN0cmluZyA9IFwiezB9IHNoaXBzIG9uIHsxfVwiLmZvcm1hdChNYXRoLmZsb29yKHN0YXJzdGF0ZVtzdGFySWRdLnNoaXBzKSwgc3RhcnNbc3RhcklkXS5uKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmbGVldE91dGNvbWVzW2ZsZWV0LnVpZF0gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV0YTogdGlja1RvRXRhU3RyaW5nKGZsZWV0LmV0YUZpcnN0KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0Y29tZTogb3V0Y29tZVN0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGtfMiBpbiBjb250cmlidXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBrYV8yID0ga18yLnNwbGl0KFwiLFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmbGVldCA9IGZsZWV0c1trYV8yWzFdXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBvdXRjb21lU3RyaW5nID0gXCJMb3NlcyEgezB9IGxpdmUuXCIuZm9ybWF0KGRlZmVuc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZmxlZXRPdXRjb21lc1tmbGVldC51aWRdID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV0YTogdGlja1RvRXRhU3RyaW5nKGZsZWV0LmV0YUZpcnN0KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRjb21lOiBvdXRjb21lU3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBhdHRhY2tlcnNBZ2dyZWdhdGUgPSBvZmZlbnNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb3V0cHV0LnB1c2goXCLigIPigINbW3swfV1dIFtbezF9XV0gezJ9IHNoaXBzXCIuZm9ybWF0KHN0YXJzdGF0ZVtzdGFySWRdLnB1aWQsIHN0YXJzW3N0YXJJZF0ubiwgc3RhcnN0YXRlW3N0YXJJZF0uc2hpcHMpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb3V0cHV0O1xuICAgIH07XG4gICAgZnVuY3Rpb24gaW5jQ29tYmF0SGFuZGljYXAoKSB7XG4gICAgICAgIGNvbWJhdEhhbmRpY2FwICs9IDE7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGRlY0NvbWJhdEhhbmRpY2FwKCkge1xuICAgICAgICBjb21iYXRIYW5kaWNhcCAtPSAxO1xuICAgIH1cbiAgICBob3RrZXkoXCIuXCIsIGluY0NvbWJhdEhhbmRpY2FwKTtcbiAgICBpbmNDb21iYXRIYW5kaWNhcC5oZWxwID1cbiAgICAgICAgXCJDaGFuZ2UgY29tYmF0IGNhbGN1bGF0aW9uIHRvIGNyZWRpdCB5b3VyIGVuZW1pZXMgd2l0aCArMSB3ZWFwb25zLiBVc2VmdWwgXCIgK1xuICAgICAgICAgICAgXCJpZiB5b3Ugc3VzcGVjdCB0aGV5IHdpbGwgaGF2ZSBhY2hpZXZlZCB0aGUgbmV4dCBsZXZlbCBvZiB0ZWNoIGJlZm9yZSBhIGJhdHRsZSB5b3UgYXJlIGludmVzdGlnYXRpbmcuXCIgK1xuICAgICAgICAgICAgXCI8cD5JbiB0aGUgbG93ZXIgbGVmdCBvZiB0aGUgSFVELCBhbiBpbmRpY2F0b3Igd2lsbCBhcHBlYXIgcmVtaW5kaW5nIHlvdSBvZiB0aGUgd2VhcG9ucyBhZGp1c3RtZW50LiBJZiB0aGUgXCIgK1xuICAgICAgICAgICAgXCJpbmRpY2F0b3IgYWxyZWFkeSBzaG93cyBhbiBhZHZhbnRhZ2UgZm9yIGRlZmVuZGVycywgdGhpcyBob3RrZXkgd2lsbCByZWR1Y2UgdGhhdCBhZHZhbnRhZ2UgZmlyc3QgYmVmb3JlIGNyZWRpdGluZyBcIiArXG4gICAgICAgICAgICBcIndlYXBvbnMgdG8geW91ciBvcHBvbmVudC5cIjtcbiAgICBob3RrZXkoXCIsXCIsIGRlY0NvbWJhdEhhbmRpY2FwKTtcbiAgICBkZWNDb21iYXRIYW5kaWNhcC5oZWxwID1cbiAgICAgICAgXCJDaGFuZ2UgY29tYmF0IGNhbGN1bGF0aW9uIHRvIGNyZWRpdCB5b3Vyc2VsZiB3aXRoICsxIHdlYXBvbnMuIFVzZWZ1bCBcIiArXG4gICAgICAgICAgICBcIndoZW4geW91IHdpbGwgaGF2ZSBhY2hpZXZlZCB0aGUgbmV4dCBsZXZlbCBvZiB0ZWNoIGJlZm9yZSBhIGJhdHRsZSB5b3UgYXJlIGludmVzdGlnYXRpbmcuXCIgK1xuICAgICAgICAgICAgXCI8cD5JbiB0aGUgbG93ZXIgbGVmdCBvZiB0aGUgSFVELCBhbiBpbmRpY2F0b3Igd2lsbCBhcHBlYXIgcmVtaW5kaW5nIHlvdSBvZiB0aGUgd2VhcG9ucyBhZGp1c3RtZW50LiBXaGVuIFwiICtcbiAgICAgICAgICAgIFwiaW5kaWNhdG9yIGFscmVhZHkgc2hvd3MgYW4gYWR2YW50YWdlIGZvciBhdHRhY2tlcnMsIHRoaXMgaG90a2V5IHdpbGwgcmVkdWNlIHRoYXQgYWR2YW50YWdlIGZpcnN0IGJlZm9yZSBjcmVkaXRpbmcgXCIgK1xuICAgICAgICAgICAgXCJ3ZWFwb25zIHRvIHlvdS5cIjtcbiAgICBmdW5jdGlvbiBsb25nRmxlZXRSZXBvcnQoKSB7XG4gICAgICAgIGNsaXAoY29tYmF0T3V0Y29tZXMoKS5qb2luKFwiXFxuXCIpKTtcbiAgICB9XG4gICAgaG90a2V5KFwiJlwiLCBsb25nRmxlZXRSZXBvcnQpO1xuICAgIGxvbmdGbGVldFJlcG9ydC5oZWxwID1cbiAgICAgICAgXCJHZW5lcmF0ZSBhIGRldGFpbGVkIGZsZWV0IHJlcG9ydCBvbiBhbGwgY2FycmllcnMgaW4geW91ciBzY2FubmluZyByYW5nZSwgYW5kIGNvcHkgaXQgdG8gdGhlIGNsaXBib2FyZC5cIiArXG4gICAgICAgICAgICBcIjxwPlRoaXMgc2FtZSByZXBvcnQgY2FuIGFsc28gYmUgdmlld2VkIHZpYSB0aGUgbWVudTsgZW50ZXIgdGhlIGFnZW50IGFuZCBjaG9vc2UgaXQgZnJvbSB0aGUgZHJvcGRvd24uXCI7XG4gICAgZnVuY3Rpb24gYnJpZWZGbGVldFJlcG9ydCgpIHtcbiAgICAgICAgdmFyIF9hO1xuICAgICAgICB2YXIgZmxlZXRzID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5nYWxheHkuZmxlZXRzO1xuICAgICAgICB2YXIgc3RhcnMgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlLmdhbGF4eS5zdGFycztcbiAgICAgICAgdmFyIGZsaWdodHMgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgZiBpbiBmbGVldHMpIHtcbiAgICAgICAgICAgIHZhciBmbGVldCA9IGZsZWV0c1tmXTtcbiAgICAgICAgICAgIGlmIChmbGVldC5vICYmIGZsZWV0Lm8ubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHZhciBzdG9wXzIgPSBmbGVldC5vWzBdWzFdO1xuICAgICAgICAgICAgICAgIHZhciB0aWNrcyA9IGZsZWV0LmV0YUZpcnN0O1xuICAgICAgICAgICAgICAgIHZhciBzdGFybmFtZSA9IChfYSA9IHN0YXJzW3N0b3BfMl0pID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5uO1xuICAgICAgICAgICAgICAgIGlmICghc3Rhcm5hbWUpXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIGZsaWdodHMucHVzaChbXG4gICAgICAgICAgICAgICAgICAgIHRpY2tzLFxuICAgICAgICAgICAgICAgICAgICBcIltbezB9XV0gW1t7MX1dXSB7Mn0g4oaSIFtbezN9XV0gezR9XCIuZm9ybWF0KGZsZWV0LnB1aWQsIGZsZWV0Lm4sIGZsZWV0LnN0LCBzdGFyc1tzdG9wXzJdLm4sIHRpY2tUb0V0YVN0cmluZyh0aWNrcywgXCJcIikpLFxuICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZsaWdodHMgPSBmbGlnaHRzLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgICAgIHJldHVybiBhWzBdIC0gYlswXTtcbiAgICAgICAgfSk7XG4gICAgICAgIGNsaXAoZmxpZ2h0cy5tYXAoZnVuY3Rpb24gKHgpIHsgcmV0dXJuIHhbMV07IH0pLmpvaW4oXCJcXG5cIikpO1xuICAgIH1cbiAgICBob3RrZXkoXCJeXCIsIGJyaWVmRmxlZXRSZXBvcnQpO1xuICAgIGJyaWVmRmxlZXRSZXBvcnQuaGVscCA9XG4gICAgICAgIFwiR2VuZXJhdGUgYSBzdW1tYXJ5IGZsZWV0IHJlcG9ydCBvbiBhbGwgY2FycmllcnMgaW4geW91ciBzY2FubmluZyByYW5nZSwgYW5kIGNvcHkgaXQgdG8gdGhlIGNsaXBib2FyZC5cIiArXG4gICAgICAgICAgICBcIjxwPlRoaXMgc2FtZSByZXBvcnQgY2FuIGFsc28gYmUgdmlld2VkIHZpYSB0aGUgbWVudTsgZW50ZXIgdGhlIGFnZW50IGFuZCBjaG9vc2UgaXQgZnJvbSB0aGUgZHJvcGRvd24uXCI7XG4gICAgZnVuY3Rpb24gc2NyZWVuc2hvdCgpIHtcbiAgICAgICAgdmFyIG1hcCA9IE5lcHR1bmVzUHJpZGUubnB1aS5tYXA7XG4gICAgICAgIGNsaXAobWFwLmNhbnZhc1swXS50b0RhdGFVUkwoXCJpbWFnZS93ZWJwXCIsIDAuMDUpKTtcbiAgICB9XG4gICAgaG90a2V5KFwiI1wiLCBzY3JlZW5zaG90KTtcbiAgICBzY3JlZW5zaG90LmhlbHAgPVxuICAgICAgICBcIkNyZWF0ZSBhIGRhdGE6IFVSTCBvZiB0aGUgY3VycmVudCBtYXAuIFBhc3RlIGl0IGludG8gYSBicm93c2VyIHdpbmRvdyB0byB2aWV3LiBUaGlzIGlzIGxpa2VseSB0byBiZSByZW1vdmVkLlwiO1xuICAgIHZhciBob21lUGxhbmV0cyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHAgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlLmdhbGF4eS5wbGF5ZXJzO1xuICAgICAgICB2YXIgb3V0cHV0ID0gW107XG4gICAgICAgIGZvciAodmFyIGkgaW4gcCkge1xuICAgICAgICAgICAgdmFyIGhvbWUgPSBwW2ldLmhvbWU7XG4gICAgICAgICAgICBpZiAoaG9tZSkge1xuICAgICAgICAgICAgICAgIG91dHB1dC5wdXNoKFwiUGxheWVyICN7MH0gaXMgW1t7MH1dXSBob21lIHsyfSBbW3sxfV1dXCIuZm9ybWF0KGksIGhvbWUubiwgaSA9PSBob21lLnB1aWQgPyBcImlzXCIgOiBcIndhc1wiKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBvdXRwdXQucHVzaChcIlBsYXllciAjezB9IGlzIFtbezB9XV0gaG9tZSB1bmtub3duXCIuZm9ybWF0KGkpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjbGlwKG91dHB1dC5qb2luKFwiXFxuXCIpKTtcbiAgICB9O1xuICAgIGhvdGtleShcIiFcIiwgaG9tZVBsYW5ldHMpO1xuICAgIGhvbWVQbGFuZXRzLmhlbHAgPVxuICAgICAgICBcIkdlbmVyYXRlIGEgcGxheWVyIHN1bW1hcnkgcmVwb3J0IGFuZCBjb3B5IGl0IHRvIHRoZSBjbGlwYm9hcmQuXCIgK1xuICAgICAgICAgICAgXCI8cD5UaGlzIHNhbWUgcmVwb3J0IGNhbiBhbHNvIGJlIHZpZXdlZCB2aWEgdGhlIG1lbnU7IGVudGVyIHRoZSBhZ2VudCBhbmQgY2hvb3NlIGl0IGZyb20gdGhlIGRyb3Bkb3duLiBcIiArXG4gICAgICAgICAgICBcIkl0IGlzIG1vc3QgdXNlZnVsIGZvciBkaXNjb3ZlcmluZyBwbGF5ZXIgbnVtYmVycyBzbyB0aGF0IHlvdSBjYW4gd3JpdGUgW1sjXV0gdG8gcmVmZXJlbmNlIGEgcGxheWVyIGluIG1haWwuXCI7XG4gICAgdmFyIHBsYXllclNoZWV0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgcCA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2UuZ2FsYXh5LnBsYXllcnM7XG4gICAgICAgIHZhciBvdXRwdXQgPSBbXTtcbiAgICAgICAgdmFyIGZpZWxkcyA9IFtcbiAgICAgICAgICAgIFwiYWxpYXNcIixcbiAgICAgICAgICAgIFwidG90YWxfc3RhcnNcIixcbiAgICAgICAgICAgIFwic2hpcHNQZXJUaWNrXCIsXG4gICAgICAgICAgICBcInRvdGFsX3N0cmVuZ3RoXCIsXG4gICAgICAgICAgICBcInRvdGFsX2Vjb25vbXlcIixcbiAgICAgICAgICAgIFwidG90YWxfZmxlZXRzXCIsXG4gICAgICAgICAgICBcInRvdGFsX2luZHVzdHJ5XCIsXG4gICAgICAgICAgICBcInRvdGFsX3NjaWVuY2VcIixcbiAgICAgICAgXTtcbiAgICAgICAgb3V0cHV0LnB1c2goZmllbGRzLmpvaW4oXCIsXCIpKTtcbiAgICAgICAgdmFyIF9sb29wXzMgPSBmdW5jdGlvbiAoaSkge1xuICAgICAgICAgICAgcGxheWVyID0gX19hc3NpZ24oe30sIHBbaV0pO1xuICAgICAgICAgICAgdmFyIHJlY29yZCA9IGZpZWxkcy5tYXAoZnVuY3Rpb24gKGYpIHsgcmV0dXJuIHBbaV1bZl07IH0pO1xuICAgICAgICAgICAgb3V0cHV0LnB1c2gocmVjb3JkLmpvaW4oXCIsXCIpKTtcbiAgICAgICAgfTtcbiAgICAgICAgZm9yICh2YXIgaSBpbiBwKSB7XG4gICAgICAgICAgICBfbG9vcF8zKGkpO1xuICAgICAgICB9XG4gICAgICAgIGNsaXAob3V0cHV0LmpvaW4oXCJcXG5cIikpO1xuICAgIH07XG4gICAgaG90a2V5KFwiJFwiLCBwbGF5ZXJTaGVldCk7XG4gICAgcGxheWVyU2hlZXQuaGVscCA9XG4gICAgICAgIFwiR2VuZXJhdGUgYSBwbGF5ZXIgc3VtbWFyeSBtZWFuIHRvIGJlIG1hZGUgaW50byBhIHNwcmVhZHNoZWV0LlwiICtcbiAgICAgICAgICAgIFwiPHA+VGhlIGNsaXBib2FyZCBzaG91bGQgYmUgcGFzdGVkIGludG8gYSBDU1YgYW5kIHRoZW4gaW1wb3J0ZWQuXCI7XG4gICAgdmFyIGhvb2tzTG9hZGVkID0gZmFsc2U7XG4gICAgdmFyIGhhbmRpY2FwU3RyaW5nID0gZnVuY3Rpb24gKHByZWZpeCkge1xuICAgICAgICB2YXIgcCA9IHByZWZpeCAhPT0gdW5kZWZpbmVkID8gcHJlZml4IDogY29tYmF0SGFuZGljYXAgPiAwID8gXCJFbmVteSBXU1wiIDogXCJNeSBXU1wiO1xuICAgICAgICByZXR1cm4gcCArIChjb21iYXRIYW5kaWNhcCA+IDAgPyBcIitcIiA6IFwiXCIpICsgY29tYmF0SGFuZGljYXA7XG4gICAgfTtcbiAgICB2YXIgbG9hZEhvb2tzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgc3VwZXJEcmF3VGV4dCA9IE5lcHR1bmVzUHJpZGUubnB1aS5tYXAuZHJhd1RleHQ7XG4gICAgICAgIE5lcHR1bmVzUHJpZGUubnB1aS5tYXAuZHJhd1RleHQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdW5pdmVyc2UgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlO1xuICAgICAgICAgICAgdmFyIG1hcCA9IE5lcHR1bmVzUHJpZGUubnB1aS5tYXA7XG4gICAgICAgICAgICBzdXBlckRyYXdUZXh0KCk7XG4gICAgICAgICAgICBtYXAuY29udGV4dC5mb250ID0gXCJcIi5jb25jYXQoMTQgKiBtYXAucGl4ZWxSYXRpbywgXCJweCBPcGVuU2Fuc1JlZ3VsYXIsIHNhbnMtc2VyaWZcIik7XG4gICAgICAgICAgICBtYXAuY29udGV4dC5maWxsU3R5bGUgPSBcIiNGRjAwMDBcIjtcbiAgICAgICAgICAgIG1hcC5jb250ZXh0LnRleHRBbGlnbiA9IFwicmlnaHRcIjtcbiAgICAgICAgICAgIG1hcC5jb250ZXh0LnRleHRCYXNlbGluZSA9IFwibWlkZGxlXCI7XG4gICAgICAgICAgICB2YXIgdiA9IHZlcnNpb247XG4gICAgICAgICAgICBpZiAoY29tYmF0SGFuZGljYXAgIT09IDApIHtcbiAgICAgICAgICAgICAgICB2ID0gXCJcIi5jb25jYXQoaGFuZGljYXBTdHJpbmcoKSwgXCIgXCIpLmNvbmNhdCh2KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRyYXdPdmVybGF5U3RyaW5nKG1hcC5jb250ZXh0LCB2LCBtYXAudmlld3BvcnRXaWR0aCAtIDEwLCBtYXAudmlld3BvcnRIZWlnaHQgLSAxNiAqIG1hcC5waXhlbFJhdGlvKTtcbiAgICAgICAgICAgIGlmIChOZXB0dW5lc1ByaWRlLm9yaWdpbmFsUGxheWVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBOZXB0dW5lc1ByaWRlLm9yaWdpbmFsUGxheWVyID0gdW5pdmVyc2UucGxheWVyLnVpZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChOZXB0dW5lc1ByaWRlLm9yaWdpbmFsUGxheWVyICE9PSB1bml2ZXJzZS5wbGF5ZXIudWlkKSB7XG4gICAgICAgICAgICAgICAgdmFyIG4gPSB1bml2ZXJzZS5nYWxheHkucGxheWVyc1t1bml2ZXJzZS5wbGF5ZXIudWlkXS5hbGlhcztcbiAgICAgICAgICAgICAgICBkcmF3T3ZlcmxheVN0cmluZyhtYXAuY29udGV4dCwgbiwgbWFwLnZpZXdwb3J0V2lkdGggLSAxMDAsIG1hcC52aWV3cG9ydEhlaWdodCAtIDIgKiAxNiAqIG1hcC5waXhlbFJhdGlvKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh1bml2ZXJzZS5zZWxlY3RlZEZsZWV0ICYmIHVuaXZlcnNlLnNlbGVjdGVkRmxlZXQucGF0aC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhcIlNlbGVjdGVkIGZsZWV0XCIsIHVuaXZlcnNlLnNlbGVjdGVkRmxlZXQpO1xuICAgICAgICAgICAgICAgIG1hcC5jb250ZXh0LmZvbnQgPSBcIlwiLmNvbmNhdCgxNCAqIG1hcC5waXhlbFJhdGlvLCBcInB4IE9wZW5TYW5zUmVndWxhciwgc2Fucy1zZXJpZlwiKTtcbiAgICAgICAgICAgICAgICBtYXAuY29udGV4dC5maWxsU3R5bGUgPSBcIiNGRjAwMDBcIjtcbiAgICAgICAgICAgICAgICBtYXAuY29udGV4dC50ZXh0QWxpZ24gPSBcImxlZnRcIjtcbiAgICAgICAgICAgICAgICBtYXAuY29udGV4dC50ZXh0QmFzZWxpbmUgPSBcIm1pZGRsZVwiO1xuICAgICAgICAgICAgICAgIHZhciBkeSA9IHVuaXZlcnNlLnNlbGVjdGVkRmxlZXQueSAtIHVuaXZlcnNlLnNlbGVjdGVkRmxlZXQubHk7XG4gICAgICAgICAgICAgICAgdmFyIGR4ID0gdW5pdmVyc2Uuc2VsZWN0ZWRGbGVldC54IC0gdW5pdmVyc2Uuc2VsZWN0ZWRGbGVldC5seDtcbiAgICAgICAgICAgICAgICBkeSA9IHVuaXZlcnNlLnNlbGVjdGVkRmxlZXQucGF0aFswXS55IC0gdW5pdmVyc2Uuc2VsZWN0ZWRGbGVldC55O1xuICAgICAgICAgICAgICAgIGR4ID0gdW5pdmVyc2Uuc2VsZWN0ZWRGbGVldC5wYXRoWzBdLnggLSB1bml2ZXJzZS5zZWxlY3RlZEZsZWV0Lng7XG4gICAgICAgICAgICAgICAgdmFyIGxpbmVIZWlnaHQgPSAxNiAqIG1hcC5waXhlbFJhdGlvO1xuICAgICAgICAgICAgICAgIHZhciByYWRpdXMgPSAyICogMC4wMjggKiBtYXAuc2NhbGUgKiBtYXAucGl4ZWxSYXRpbztcbiAgICAgICAgICAgICAgICB2YXIgYW5nbGUgPSBNYXRoLmF0YW4oZHkgLyBkeCk7XG4gICAgICAgICAgICAgICAgdmFyIG9mZnNldHggPSByYWRpdXMgKiBNYXRoLmNvcyhhbmdsZSk7XG4gICAgICAgICAgICAgICAgdmFyIG9mZnNldHkgPSByYWRpdXMgKiBNYXRoLnNpbihhbmdsZSk7XG4gICAgICAgICAgICAgICAgaWYgKG9mZnNldHggPiAwICYmIGR4ID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBvZmZzZXR4ICo9IC0xO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAob2Zmc2V0eSA+IDAgJiYgZHkgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIG9mZnNldHkgKj0gLTE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChvZmZzZXR4IDwgMCAmJiBkeCA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0eCAqPSAtMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG9mZnNldHkgPCAwICYmIGR5IDwgMCkge1xuICAgICAgICAgICAgICAgICAgICBvZmZzZXR5ICo9IC0xO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb21iYXRPdXRjb21lcygpO1xuICAgICAgICAgICAgICAgIHZhciBzID0gZmxlZXRPdXRjb21lc1t1bml2ZXJzZS5zZWxlY3RlZEZsZWV0LnVpZF0uZXRhO1xuICAgICAgICAgICAgICAgIHZhciBvID0gZmxlZXRPdXRjb21lc1t1bml2ZXJzZS5zZWxlY3RlZEZsZWV0LnVpZF0ub3V0Y29tZTtcbiAgICAgICAgICAgICAgICB2YXIgeCA9IG1hcC53b3JsZFRvU2NyZWVuWCh1bml2ZXJzZS5zZWxlY3RlZEZsZWV0LngpICsgb2Zmc2V0eDtcbiAgICAgICAgICAgICAgICB2YXIgeSA9IG1hcC53b3JsZFRvU2NyZWVuWSh1bml2ZXJzZS5zZWxlY3RlZEZsZWV0LnkpICsgb2Zmc2V0eTtcbiAgICAgICAgICAgICAgICBpZiAob2Zmc2V0eCA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgbWFwLmNvbnRleHQudGV4dEFsaWduID0gXCJyaWdodFwiO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBkcmF3T3ZlcmxheVN0cmluZyhtYXAuY29udGV4dCwgcywgeCwgeSk7XG4gICAgICAgICAgICAgICAgZHJhd092ZXJsYXlTdHJpbmcobWFwLmNvbnRleHQsIG8sIHgsIHkgKyBsaW5lSGVpZ2h0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghTmVwdHVuZXNQcmlkZS5nYW1lQ29uZmlnLnR1cm5CYXNlZCAmJlxuICAgICAgICAgICAgICAgIHVuaXZlcnNlLnRpbWVUb1RpY2soMSkubGVuZ3RoIDwgMykge1xuICAgICAgICAgICAgICAgIHZhciBsaW5lSGVpZ2h0ID0gMTYgKiBtYXAucGl4ZWxSYXRpbztcbiAgICAgICAgICAgICAgICBtYXAuY29udGV4dC5mb250ID0gXCJcIi5jb25jYXQoMTQgKiBtYXAucGl4ZWxSYXRpbywgXCJweCBPcGVuU2Fuc1JlZ3VsYXIsIHNhbnMtc2VyaWZcIik7XG4gICAgICAgICAgICAgICAgbWFwLmNvbnRleHQuZmlsbFN0eWxlID0gXCIjRkYwMDAwXCI7XG4gICAgICAgICAgICAgICAgbWFwLmNvbnRleHQudGV4dEFsaWduID0gXCJsZWZ0XCI7XG4gICAgICAgICAgICAgICAgbWFwLmNvbnRleHQudGV4dEJhc2VsaW5lID0gXCJtaWRkbGVcIjtcbiAgICAgICAgICAgICAgICB2YXIgcyA9IFwiVGljayA8IDEwcyBhd2F5IVwiO1xuICAgICAgICAgICAgICAgIGlmICh1bml2ZXJzZS50aW1lVG9UaWNrKDEpID09PSBcIjBzXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgcyA9IFwiVGljayBwYXNzZWQuIENsaWNrIHByb2R1Y3Rpb24gY291bnRkb3duIHRvIHJlZnJlc2guXCI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGRyYXdPdmVybGF5U3RyaW5nKG1hcC5jb250ZXh0LCBzLCAxMDAwLCBsaW5lSGVpZ2h0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh1bml2ZXJzZS5zZWxlY3RlZFN0YXIgJiZcbiAgICAgICAgICAgICAgICB1bml2ZXJzZS5zZWxlY3RlZFN0YXIucHVpZCAhPSB1bml2ZXJzZS5wbGF5ZXIudWlkICYmXG4gICAgICAgICAgICAgICAgdW5pdmVyc2Uuc2VsZWN0ZWRTdGFyLnB1aWQgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgLy8gZW5lbXkgc3RhciBzZWxlY3RlZDsgc2hvdyBIVUQgZm9yIHNjYW5uaW5nIHZpc2liaWxpdHlcbiAgICAgICAgICAgICAgICBtYXAuY29udGV4dC50ZXh0QWxpZ24gPSBcImxlZnRcIjtcbiAgICAgICAgICAgICAgICBtYXAuY29udGV4dC50ZXh0QmFzZWxpbmUgPSBcIm1pZGRsZVwiO1xuICAgICAgICAgICAgICAgIHZhciB4T2Zmc2V0ID0gMjYgKiBtYXAucGl4ZWxSYXRpbztcbiAgICAgICAgICAgICAgICAvL21hcC5jb250ZXh0LnRyYW5zbGF0ZSh4T2Zmc2V0LCAwKTtcbiAgICAgICAgICAgICAgICB2YXIgZmxlZXRzID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5nYWxheHkuZmxlZXRzO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGYgaW4gZmxlZXRzKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBmbGVldCA9IGZsZWV0c1tmXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZsZWV0LnB1aWQgPT09IHVuaXZlcnNlLnBsYXllci51aWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkeCA9IHVuaXZlcnNlLnNlbGVjdGVkU3Rhci54IC0gZmxlZXQueDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkeSA9IHVuaXZlcnNlLnNlbGVjdGVkU3Rhci55IC0gZmxlZXQueTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBkaXN0YW5jZSA9IE1hdGguc3FydChkeCAqIGR4ICsgZHkgKiBkeSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgb2Zmc2V0eCA9IHhPZmZzZXQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgb2Zmc2V0eSA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgeCA9IG1hcC53b3JsZFRvU2NyZWVuWChmbGVldC54KSArIG9mZnNldHg7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgeSA9IG1hcC53b3JsZFRvU2NyZWVuWShmbGVldC55KSArIG9mZnNldHk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGlzdGFuY2UgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVuaXZlcnNlLmdhbGF4eS5wbGF5ZXJzW3VuaXZlcnNlLnNlbGVjdGVkU3Rhci5wdWlkXS50ZWNoLnNjYW5uaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmbGVldC5wYXRoICYmIGZsZWV0LnBhdGgubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkeCA9IGZsZWV0LnBhdGhbMF0ueCAtIHVuaXZlcnNlLnNlbGVjdGVkU3Rhci54O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkeSA9IGZsZWV0LnBhdGhbMF0ueSAtIHVuaXZlcnNlLnNlbGVjdGVkU3Rhci55O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXN0YW5jZSA9IE1hdGguc3FydChkeCAqIGR4ICsgZHkgKiBkeSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkaXN0YW5jZSA8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bml2ZXJzZS5nYWxheHkucGxheWVyc1t1bml2ZXJzZS5zZWxlY3RlZFN0YXIucHVpZF0udGVjaFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zY2FubmluZy52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHN0ZXBSYWRpdXMgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlLmdhbGF4eS5mbGVldF9zcGVlZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmbGVldC53YXJwU3BlZWQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RlcFJhZGl1cyAqPSAzO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZHggPSBmbGVldC54IC0gZmxlZXQucGF0aFswXS54O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZHkgPSBmbGVldC55IC0gZmxlZXQucGF0aFswXS55O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGFuZ2xlID0gTWF0aC5hdGFuKGR5IC8gZHgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHN0ZXB4ID0gc3RlcFJhZGl1cyAqIE1hdGguY29zKGFuZ2xlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzdGVweSA9IHN0ZXBSYWRpdXMgKiBNYXRoLnNpbihhbmdsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3RlcHggPiAwICYmIGR4ID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ZXB4ICo9IC0xO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN0ZXB5ID4gMCAmJiBkeSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGVweSAqPSAtMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdGVweCA8IDAgJiYgZHggPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RlcHggKj0gLTE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3RlcHkgPCAwICYmIGR5IDwgMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ZXB5ICo9IC0xO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHRpY2tzID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgeF8xID0gdGlja3MgKiBzdGVweCArIE51bWJlcihmbGVldC54KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgeV8xID0gdGlja3MgKiBzdGVweSArIE51bWJlcihmbGVldC55KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2xldCBzeCA9IG1hcC53b3JsZFRvU2NyZWVuWCh4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2xldCBzeSA9IG1hcC53b3JsZFRvU2NyZWVuWSh5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkeCA9IHhfMSAtIHVuaXZlcnNlLnNlbGVjdGVkU3Rhci54O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGR5ID0geV8xIC0gdW5pdmVyc2Uuc2VsZWN0ZWRTdGFyLnk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzdGFuY2UgPSBNYXRoLnNxcnQoZHggKiBkeCArIGR5ICogZHkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coZGlzdGFuY2UsIHgsIHkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vZHJhd092ZXJsYXlTdHJpbmcobWFwLmNvbnRleHQsIFwib1wiLCBzeCwgc3kpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpY2tzICs9IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IHdoaWxlIChkaXN0YW5jZSA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5pdmVyc2UuZ2FsYXh5LnBsYXllcnNbdW5pdmVyc2Uuc2VsZWN0ZWRTdGFyLnB1aWRdLnRlY2hcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnNjYW5uaW5nLnZhbHVlICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGlja3MgPD0gZmxlZXQuZXRhRmlyc3QgKyAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpY2tzIC09IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdmlzQ29sb3IgPSBcIiMwMGZmMDBcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhbnlTdGFyQ2FuU2VlKHVuaXZlcnNlLnNlbGVjdGVkU3Rhci5wdWlkLCBmbGVldCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aXNDb2xvciA9IFwiIzg4ODg4OFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZHJhd092ZXJsYXlTdHJpbmcobWFwLmNvbnRleHQsIFwiU2NhbiBcIi5jb25jYXQodGlja1RvRXRhU3RyaW5nKHRpY2tzKSksIHgsIHksIHZpc0NvbG9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvL21hcC5jb250ZXh0LnRyYW5zbGF0ZSgteE9mZnNldCwgMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodW5pdmVyc2UucnVsZXIuc3RhcnMubGVuZ3RoID09IDIpIHtcbiAgICAgICAgICAgICAgICB2YXIgcDEgPSB1bml2ZXJzZS5ydWxlci5zdGFyc1swXS5wdWlkO1xuICAgICAgICAgICAgICAgIHZhciBwMiA9IHVuaXZlcnNlLnJ1bGVyLnN0YXJzWzFdLnB1aWQ7XG4gICAgICAgICAgICAgICAgaWYgKHAxICE9PSBwMiAmJiBwMSAhPT0gLTEgJiYgcDIgIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coXCJ0d28gc3RhciBydWxlclwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIC8vVE9ETzogTGVhcm4gbW9yZSBhYm91dCB0aGlzIGhvb2suIGl0cyBydW4gdG9vIG11Y2guLlxuICAgICAgICBDcnV4LmZvcm1hdCA9IGZ1bmN0aW9uIChzLCB0ZW1wbGF0ZURhdGEpIHtcbiAgICAgICAgICAgIGlmICghcykge1xuICAgICAgICAgICAgICAgIHJldHVybiBcImVycm9yXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgaTtcbiAgICAgICAgICAgIHZhciBmcDtcbiAgICAgICAgICAgIHZhciBzcDtcbiAgICAgICAgICAgIHZhciBzdWI7XG4gICAgICAgICAgICB2YXIgcGF0dGVybjtcbiAgICAgICAgICAgIGkgPSAwO1xuICAgICAgICAgICAgZnAgPSAwO1xuICAgICAgICAgICAgc3AgPSAwO1xuICAgICAgICAgICAgc3ViID0gXCJcIjtcbiAgICAgICAgICAgIHBhdHRlcm4gPSBcIlwiO1xuICAgICAgICAgICAgLy8gbG9vayBmb3Igc3RhbmRhcmQgcGF0dGVybnNcbiAgICAgICAgICAgIHdoaWxlIChmcCA+PSAwICYmIGkgPCAxMDAwKSB7XG4gICAgICAgICAgICAgICAgaSA9IGkgKyAxO1xuICAgICAgICAgICAgICAgIGZwID0gcy5zZWFyY2goXCJcXFxcW1xcXFxbXCIpO1xuICAgICAgICAgICAgICAgIHNwID0gcy5zZWFyY2goXCJcXFxcXVxcXFxdXCIpO1xuICAgICAgICAgICAgICAgIHN1YiA9IHMuc2xpY2UoZnAgKyAyLCBzcCk7XG4gICAgICAgICAgICAgICAgdmFyIHVyaSA9IHN1Yi5yZXBsYWNlQWxsKFwiJiN4MkY7XCIsIFwiL1wiKTtcbiAgICAgICAgICAgICAgICBwYXR0ZXJuID0gXCJbW1wiLmNvbmNhdChzdWIsIFwiXV1cIik7XG4gICAgICAgICAgICAgICAgaWYgKHRlbXBsYXRlRGF0YVtzdWJdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcyA9IHMucmVwbGFjZShwYXR0ZXJuLCB0ZW1wbGF0ZURhdGFbc3ViXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKC9eYXBpOlxcd3s2fSQvLnRlc3Qoc3ViKSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgYXBpTGluayA9IFwiPGEgb25DbGljaz0nQ3J1eC5jcnV4LnRyaWdnZXIoXFxcInN3aXRjaF91c2VyX2FwaVxcXCIsIFxcXCJcIi5jb25jYXQoc3ViLCBcIlxcXCIpJz4gVmlldyBhcyBcIikuY29uY2F0KHN1YiwgXCI8L2E+XCIpO1xuICAgICAgICAgICAgICAgICAgICBhcGlMaW5rICs9IFwiIG9yIDxhIG9uQ2xpY2s9J0NydXguY3J1eC50cmlnZ2VyKFxcXCJtZXJnZV91c2VyX2FwaVxcXCIsIFxcXCJcIi5jb25jYXQoc3ViLCBcIlxcXCIpJz4gTWVyZ2UgXCIpLmNvbmNhdChzdWIsIFwiPC9hPlwiKTtcbiAgICAgICAgICAgICAgICAgICAgcyA9IHMucmVwbGFjZShwYXR0ZXJuLCBhcGlMaW5rKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoaXNfdmFsaWRfaW1hZ2VfdXJsKHVyaSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcyA9IHMucmVwbGFjZShwYXR0ZXJuLCBcIjxpbWcgd2lkdGg9XFxcIjEwMCVcXFwiIHNyYz0nXCIuY29uY2F0KHVyaSwgXCInIC8+XCIpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoaXNfdmFsaWRfeW91dHViZSh1cmkpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vUGFzc1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcyA9IHMucmVwbGFjZShwYXR0ZXJuLCBcIihcIi5jb25jYXQoc3ViLCBcIilcIikpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBzO1xuICAgICAgICB9O1xuICAgICAgICB2YXIgbnB1aSA9IE5lcHR1bmVzUHJpZGUubnB1aTtcbiAgICAgICAgLy9SZXNlYXJjaCBidXR0b24gdG8gcXVpY2tseSB0ZWxsIGZyaWVuZHMgcmVzZWFyY2hcbiAgICAgICAgTmVwdHVuZXNQcmlkZS50ZW1wbGF0ZXNbXCJucGFfcmVzZWFyY2hcIl0gPSBcIlJlc2VhcmNoXCI7XG4gICAgICAgIHZhciBzdXBlck5ld01lc3NhZ2VDb21tZW50Qm94ID0gbnB1aS5OZXdNZXNzYWdlQ29tbWVudEJveDtcbiAgICAgICAgdmFyIHJlcG9ydFJlc2VhcmNoSG9vayA9IGZ1bmN0aW9uIChfZSwgX2QpIHtcbiAgICAgICAgICAgIHZhciB0ZXh0ID0gZ2V0X3Jlc2VhcmNoX3RleHQoTmVwdHVuZXNQcmlkZSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyh0ZXh0KTtcbiAgICAgICAgICAgIHZhciBpbmJveCA9IE5lcHR1bmVzUHJpZGUuaW5ib3g7XG4gICAgICAgICAgICBpbmJveC5jb21tZW50RHJhZnRzW2luYm94LnNlbGVjdGVkTWVzc2FnZS5rZXldICs9IHRleHQ7XG4gICAgICAgICAgICBpbmJveC50cmlnZ2VyKFwic2hvd19zY3JlZW5cIiwgXCJkaXBsb21hY3lfZGV0YWlsXCIpO1xuICAgICAgICB9O1xuICAgICAgICBOZXB0dW5lc1ByaWRlLm5wLm9uKFwicGFzdGVfcmVzZWFyY2hcIiwgcmVwb3J0UmVzZWFyY2hIb29rKTtcbiAgICAgICAgbnB1aS5OZXdNZXNzYWdlQ29tbWVudEJveCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB3aWRnZXQgPSBzdXBlck5ld01lc3NhZ2VDb21tZW50Qm94KCk7XG4gICAgICAgICAgICB2YXIgcmVzZWFyY2hfYnV0dG9uID0gQ3J1eC5CdXR0b24oXCJucGFfcmVzZWFyY2hcIiwgXCJwYXN0ZV9yZXNlYXJjaFwiLCBcInJlc2VhcmNoXCIpLmdyaWQoMTEsIDEyLCA4LCAzKTtcbiAgICAgICAgICAgIHJlc2VhcmNoX2J1dHRvbi5yb29zdCh3aWRnZXQpO1xuICAgICAgICAgICAgcmV0dXJuIHdpZGdldDtcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIHN1cGVyRm9ybWF0VGltZSA9IENydXguZm9ybWF0VGltZTtcbiAgICAgICAgdmFyIHJlbGF0aXZlVGltZXMgPSAwO1xuICAgICAgICBDcnV4LmZvcm1hdFRpbWUgPSBmdW5jdGlvbiAobXMsIG1pbnMsIHNlY3MpIHtcbiAgICAgICAgICAgIHN3aXRjaCAocmVsYXRpdmVUaW1lcykge1xuICAgICAgICAgICAgICAgIGNhc2UgMDogLy9zdGFuZGFyZFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3VwZXJGb3JtYXRUaW1lKG1zLCBtaW5zLCBzZWNzKTtcbiAgICAgICAgICAgICAgICBjYXNlIDE6IC8vRVRBLCAtIHR1cm4ocykgZm9yIHR1cm5iYXNlZFxuICAgICAgICAgICAgICAgICAgICBpZiAoIU5lcHR1bmVzUHJpZGUuZ2FtZUNvbmZpZy50dXJuQmFzZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtc1RvRXRhU3RyaW5nKG1zLCBcIlwiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0aWNrX3JhdGUgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlLmdhbGF4eS50aWNrX3JhdGU7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gXCJcIi5jb25jYXQoc3VwZXJGb3JtYXRUaW1lKG1zLCBtaW5zLCBzZWNzKSwgXCIgLSBcIikuY29uY2F0KCgoKG1zIC8gMzYwMDAwMCkgKiAxMCkgL1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpY2tfcmF0ZSkudG9GaXhlZCgyKSwgXCIgdHVybihzKVwiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhc2UgMjogLy9jeWNsZXMgKyB0aWNrcyBmb3JtYXRcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1zVG9DeWNsZVN0cmluZyhtcywgXCJcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHZhciBzd2l0Y2hUaW1lcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vMCA9IHN0YW5kYXJkLCAxID0gRVRBLCAtIHR1cm4ocykgZm9yIHR1cm5iYXNlZCwgMiA9IGN5Y2xlcyArIHRpY2tzIGZvcm1hdFxuICAgICAgICAgICAgcmVsYXRpdmVUaW1lcyA9IChyZWxhdGl2ZVRpbWVzICsgMSkgJSAzO1xuICAgICAgICB9O1xuICAgICAgICBob3RrZXkoXCIlXCIsIHN3aXRjaFRpbWVzKTtcbiAgICAgICAgc3dpdGNoVGltZXMuaGVscCA9XG4gICAgICAgICAgICBcIkNoYW5nZSB0aGUgZGlzcGxheSBvZiBFVEFzIGJldHdlZW4gcmVsYXRpdmUgdGltZXMsIGFic29sdXRlIGNsb2NrIHRpbWVzLCBhbmQgY3ljbGUgdGltZXMuIE1ha2VzIHByZWRpY3RpbmcgXCIgK1xuICAgICAgICAgICAgICAgIFwiaW1wb3J0YW50IHRpbWVzIG9mIGRheSB0byBzaWduIGluIGFuZCBjaGVjayBtdWNoIGVhc2llciBlc3BlY2lhbGx5IGZvciBtdWx0aS1sZWcgZmxlZXQgbW92ZW1lbnRzLiBTb21ldGltZXMgeW91IFwiICtcbiAgICAgICAgICAgICAgICBcIndpbGwgbmVlZCB0byByZWZyZXNoIHRoZSBkaXNwbGF5IHRvIHNlZSB0aGUgZGlmZmVyZW50IHRpbWVzLlwiO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KENydXgsIFwidG91Y2hFbmFibGVkXCIsIHtcbiAgICAgICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIGZhbHNlOyB9LFxuICAgICAgICAgICAgICAgIHNldDogZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJDcnV4LnRvdWNoRW5hYmxlZCBzZXQgaWdub3JlZFwiLCB4KTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xuICAgICAgICB9XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShOZXB0dW5lc1ByaWRlLm5wdWkubWFwLCBcImlnbm9yZU1vdXNlRXZlbnRzXCIsIHtcbiAgICAgICAgICAgIGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gZmFsc2U7IH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh4KSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJOZXB0dW5lc1ByaWRlLm5wdWkubWFwLmlnbm9yZU1vdXNlRXZlbnRzIHNldCBpZ25vcmVkXCIsIHgpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgICAgIGhvb2tzTG9hZGVkID0gdHJ1ZTtcbiAgICB9O1xuICAgIHZhciBpbml0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgX2E7XG4gICAgICAgIGlmICgoKF9hID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZSkgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLmdhbGF4eSkgJiYgTmVwdHVuZXNQcmlkZS5ucHVpLm1hcCkge1xuICAgICAgICAgICAgbGlua0ZsZWV0cygpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJGbGVldCBsaW5raW5nIGNvbXBsZXRlLlwiKTtcbiAgICAgICAgICAgIGlmICghaG9va3NMb2FkZWQpIHtcbiAgICAgICAgICAgICAgICBsb2FkSG9va3MoKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkhVRCBzZXR1cCBjb21wbGV0ZS5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkhVRCBzZXR1cCBhbHJlYWR5IGRvbmU7IHNraXBwaW5nLlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGhvbWVQbGFuZXRzKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkdhbWUgbm90IGZ1bGx5IGluaXRpYWxpemVkIHlldDsgd2FpdC5cIiwgTmVwdHVuZXNQcmlkZS51bml2ZXJzZSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGhvdGtleShcIkBcIiwgaW5pdCk7XG4gICAgaW5pdC5oZWxwID1cbiAgICAgICAgXCJSZWluaXRpYWxpemUgTmVwdHVuZSdzIFByaWRlIEFnZW50LiBVc2UgdGhlIEAgaG90a2V5IGlmIHRoZSB2ZXJzaW9uIGlzIG5vdCBiZWluZyBzaG93biBvbiB0aGUgbWFwIGFmdGVyIGRyYWdnaW5nLlwiO1xuICAgIGlmICgoKF9iID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZSkgPT09IG51bGwgfHwgX2IgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9iLmdhbGF4eSkgJiYgTmVwdHVuZXNQcmlkZS5ucHVpLm1hcCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIlVuaXZlcnNlIGFscmVhZHkgbG9hZGVkLiBIeXBlcmxpbmsgZmxlZXRzICYgbG9hZCBob29rcy5cIik7XG4gICAgICAgIGluaXQoKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiVW5pdmVyc2Ugbm90IGxvYWRlZC4gSG9vayBvblNlcnZlclJlc3BvbnNlLlwiKTtcbiAgICAgICAgdmFyIHN1cGVyT25TZXJ2ZXJSZXNwb25zZV8xID0gTmVwdHVuZXNQcmlkZS5ucC5vblNlcnZlclJlc3BvbnNlO1xuICAgICAgICBOZXB0dW5lc1ByaWRlLm5wLm9uU2VydmVyUmVzcG9uc2UgPSBmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgIHN1cGVyT25TZXJ2ZXJSZXNwb25zZV8xKHJlc3BvbnNlKTtcbiAgICAgICAgICAgIGlmIChyZXNwb25zZS5ldmVudCA9PT0gXCJvcmRlcjpwbGF5ZXJfYWNoaWV2ZW1lbnRzXCIpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkluaXRpYWwgbG9hZCBjb21wbGV0ZS4gUmVpbnN0YWxsLlwiKTtcbiAgICAgICAgICAgICAgICBpbml0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChyZXNwb25zZS5ldmVudCA9PT0gXCJvcmRlcjpmdWxsX3VuaXZlcnNlXCIpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIlVuaXZlcnNlIHJlY2VpdmVkLiBSZWluc3RhbGwuXCIpO1xuICAgICAgICAgICAgICAgIE5lcHR1bmVzUHJpZGUub3JpZ2luYWxQbGF5ZXIgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlLnBsYXllci51aWQ7XG4gICAgICAgICAgICAgICAgaW5pdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoIWhvb2tzTG9hZGVkICYmIE5lcHR1bmVzUHJpZGUubnB1aS5tYXApIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkhvb2tzIG5lZWQgbG9hZGluZyBhbmQgbWFwIGlzIHJlYWR5LiBSZWluc3RhbGwuXCIpO1xuICAgICAgICAgICAgICAgIGluaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG4gICAgdmFyIG90aGVyVXNlckNvZGUgPSB1bmRlZmluZWQ7XG4gICAgdmFyIGdhbWUgPSBOZXB0dW5lc1ByaWRlLmdhbWVOdW1iZXI7XG4gICAgLy9UaGlzIHB1dHMgeW91IGludG8gdGhlaXIgcG9zaXRpb24uXG4gICAgLy9Ib3cgaXMgaXQgZGlmZmVyZW50P1xuICAgIHZhciBzd2l0Y2hVc2VyID0gZnVuY3Rpb24gKGV2ZW50LCBkYXRhKSB7XG4gICAgICAgIGlmIChOZXB0dW5lc1ByaWRlLm9yaWdpbmFsUGxheWVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIE5lcHR1bmVzUHJpZGUub3JpZ2luYWxQbGF5ZXIgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlLnBsYXllci51aWQ7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGNvZGUgPSAoZGF0YSA9PT0gbnVsbCB8fCBkYXRhID09PSB2b2lkIDAgPyB2b2lkIDAgOiBkYXRhLnNwbGl0KFwiOlwiKVsxXSkgfHwgb3RoZXJVc2VyQ29kZTtcbiAgICAgICAgb3RoZXJVc2VyQ29kZSA9IGNvZGU7XG4gICAgICAgIGlmIChvdGhlclVzZXJDb2RlKSB7XG4gICAgICAgICAgICB2YXIgcGFyYW1zID0ge1xuICAgICAgICAgICAgICAgIGdhbWVfbnVtYmVyOiBnYW1lLFxuICAgICAgICAgICAgICAgIGFwaV92ZXJzaW9uOiBcIjAuMVwiLFxuICAgICAgICAgICAgICAgIGNvZGU6IG90aGVyVXNlckNvZGUsXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdmFyIGVnZ2VycyA9IGpRdWVyeS5hamF4KHtcbiAgICAgICAgICAgICAgICB0eXBlOiBcIlBPU1RcIixcbiAgICAgICAgICAgICAgICB1cmw6IFwiaHR0cHM6Ly9ucC5pcm9uaGVsbWV0LmNvbS9hcGlcIixcbiAgICAgICAgICAgICAgICBhc3luYzogZmFsc2UsXG4gICAgICAgICAgICAgICAgZGF0YTogcGFyYW1zLFxuICAgICAgICAgICAgICAgIGRhdGFUeXBlOiBcImpzb25cIixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy9Mb2FkcyB0aGUgcHVsbCB1bml2ZXJzZSBkYXRhIGludG8gdGhlIGZ1bmN0aW9uLiBUaGF0cyB0aGUgZGlmZmVyZW5jZS5cbiAgICAgICAgICAgIC8vVGhlIG90aGVyIHZlcnNpb24gbG9hZHMgYW4gdXBkYXRlZCBnYWxheHkgaW50byB0aGUgZnVuY3Rpb25cbiAgICAgICAgICAgIE5lcHR1bmVzUHJpZGUubnAub25GdWxsVW5pdmVyc2UobnVsbCwgZWdnZXJzLnJlc3BvbnNlSlNPTi5zY2FubmluZ19kYXRhKTtcbiAgICAgICAgICAgIE5lcHR1bmVzUHJpZGUubnB1aS5vbkhpZGVTY3JlZW4obnVsbCwgdHJ1ZSk7XG4gICAgICAgICAgICBOZXB0dW5lc1ByaWRlLm5wLnRyaWdnZXIoXCJzZWxlY3RfcGxheWVyXCIsIFtcbiAgICAgICAgICAgICAgICBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlLnBsYXllci51aWQsXG4gICAgICAgICAgICAgICAgdHJ1ZSxcbiAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgaW5pdCgpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBob3RrZXkoXCI+XCIsIHN3aXRjaFVzZXIpO1xuICAgIHN3aXRjaFVzZXIuaGVscCA9XG4gICAgICAgIFwiU3dpdGNoIHZpZXdzIHRvIHRoZSBsYXN0IHVzZXIgd2hvc2UgQVBJIGtleSB3YXMgdXNlZCB0byBsb2FkIGRhdGEuIFRoZSBIVUQgc2hvd3MgdGhlIGN1cnJlbnQgdXNlciB3aGVuIFwiICtcbiAgICAgICAgICAgIFwiaXQgaXMgbm90IHlvdXIgb3duIGFsaWFzIHRvIGhlbHAgcmVtaW5kIHlvdSB0aGF0IHlvdSBhcmVuJ3QgaW4gY29udHJvbCBvZiB0aGlzIHVzZXIuXCI7XG4gICAgaG90a2V5KFwifFwiLCBtZXJnZVVzZXIpO1xuICAgIG1lcmdlVXNlci5oZWxwID1cbiAgICAgICAgXCJNZXJnZSB0aGUgbGF0ZXN0IGRhdGEgZnJvbSB0aGUgbGFzdCB1c2VyIHdob3NlIEFQSSBrZXkgd2FzIHVzZWQgdG8gbG9hZCBkYXRhLiBUaGlzIGlzIHVzZWZ1bCBhZnRlciBhIHRpY2sgXCIgK1xuICAgICAgICAgICAgXCJwYXNzZXMgYW5kIHlvdSd2ZSByZWxvYWRlZCwgYnV0IHlvdSBzdGlsbCB3YW50IHRoZSBtZXJnZWQgc2NhbiBkYXRhIGZyb20gdHdvIHBsYXllcnMgb25zY3JlZW4uXCI7XG4gICAgTmVwdHVuZXNQcmlkZS5ucC5vbihcInN3aXRjaF91c2VyX2FwaVwiLCBzd2l0Y2hVc2VyKTtcbiAgICBOZXB0dW5lc1ByaWRlLm5wLm9uKFwibWVyZ2VfdXNlcl9hcGlcIiwgbWVyZ2VVc2VyKTtcbiAgICB2YXIgbnBhSGVscCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGhlbHAgPSBbXCI8SDE+XCIuY29uY2F0KHRpdGxlLCBcIjwvSDE+XCIpXTtcbiAgICAgICAgZm9yICh2YXIgcGFpciBpbiBob3RrZXlzKSB7XG4gICAgICAgICAgICB2YXIga2V5ID0gaG90a2V5c1twYWlyXVswXTtcbiAgICAgICAgICAgIHZhciBhY3Rpb24gPSBob3RrZXlzW3BhaXJdWzFdO1xuICAgICAgICAgICAgaGVscC5wdXNoKFwiPGgyPkhvdGtleTogXCIuY29uY2F0KGtleSwgXCI8L2gyPlwiKSk7XG4gICAgICAgICAgICBpZiAoYWN0aW9uLmhlbHApIHtcbiAgICAgICAgICAgICAgICBoZWxwLnB1c2goYWN0aW9uLmhlbHApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgaGVscC5wdXNoKFwiPHA+Tm8gZG9jdW1lbnRhdGlvbiB5ZXQuPHA+PGNvZGU+XCIuY29uY2F0KGFjdGlvbi50b0xvY2FsZVN0cmluZygpLCBcIjwvY29kZT5cIikpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIE5lcHR1bmVzUHJpZGUudW5pdmVyc2UuaGVscEhUTUwgPSBoZWxwLmpvaW4oXCJcIik7XG4gICAgICAgIE5lcHR1bmVzUHJpZGUubnAudHJpZ2dlcihcInNob3dfc2NyZWVuXCIsIFwiaGVscFwiKTtcbiAgICB9O1xuICAgIG5wYUhlbHAuaGVscCA9IFwiRGlzcGxheSB0aGlzIGhlbHAgc2NyZWVuLlwiO1xuICAgIGhvdGtleShcIj9cIiwgbnBhSGVscCk7XG4gICAgdmFyIGF1dG9jb21wbGV0ZU1vZGUgPSAwO1xuICAgIHZhciBhdXRvY29tcGxldGVUcmlnZ2VyID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgaWYgKGUudGFyZ2V0LnR5cGUgPT09IFwidGV4dGFyZWFcIikge1xuICAgICAgICAgICAgaWYgKGF1dG9jb21wbGV0ZU1vZGUpIHtcbiAgICAgICAgICAgICAgICB2YXIgc3RhcnQgPSBhdXRvY29tcGxldGVNb2RlO1xuICAgICAgICAgICAgICAgIHZhciBlbmRCcmFja2V0ID0gZS50YXJnZXQudmFsdWUuaW5kZXhPZihcIl1cIiwgc3RhcnQpO1xuICAgICAgICAgICAgICAgIGlmIChlbmRCcmFja2V0ID09PSAtMSlcbiAgICAgICAgICAgICAgICAgICAgZW5kQnJhY2tldCA9IGUudGFyZ2V0LnZhbHVlLmxlbmd0aDtcbiAgICAgICAgICAgICAgICB2YXIgYXV0b1N0cmluZyA9IGUudGFyZ2V0LnZhbHVlLnN1YnN0cmluZyhzdGFydCwgZW5kQnJhY2tldCk7XG4gICAgICAgICAgICAgICAgdmFyIGtleSA9IGUua2V5O1xuICAgICAgICAgICAgICAgIGlmIChrZXkgPT09IFwiXVwiKSB7XG4gICAgICAgICAgICAgICAgICAgIGF1dG9jb21wbGV0ZU1vZGUgPSAwO1xuICAgICAgICAgICAgICAgICAgICB2YXIgbSA9IGF1dG9TdHJpbmcubWF0Y2goL15bMC05XVswLTldKiQvKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG0gPT09IG51bGwgfHwgbSA9PT0gdm9pZCAwID8gdm9pZCAwIDogbS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwdWlkID0gTnVtYmVyKGF1dG9TdHJpbmcpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGVuZCA9IGUudGFyZ2V0LnNlbGVjdGlvbkVuZDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBhdXRvID0gXCJcIi5jb25jYXQocHVpZCwgXCJdXSBcIikuY29uY2F0KE5lcHR1bmVzUHJpZGUudW5pdmVyc2UuZ2FsYXh5LnBsYXllcnNbcHVpZF0uYWxpYXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZS50YXJnZXQudmFsdWUgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUudGFyZ2V0LnZhbHVlLnN1YnN0cmluZygwLCBzdGFydCkgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdXRvICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZS50YXJnZXQudmFsdWUuc3Vic3RyaW5nKGVuZCwgZS50YXJnZXQudmFsdWUubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGUudGFyZ2V0LnNlbGVjdGlvblN0YXJ0ID0gc3RhcnQgKyBhdXRvLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGUudGFyZ2V0LnNlbGVjdGlvbkVuZCA9IHN0YXJ0ICsgYXV0by5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChlLnRhcmdldC5zZWxlY3Rpb25TdGFydCA+IDEpIHtcbiAgICAgICAgICAgICAgICB2YXIgc3RhcnQgPSBlLnRhcmdldC5zZWxlY3Rpb25TdGFydCAtIDI7XG4gICAgICAgICAgICAgICAgdmFyIHNzID0gZS50YXJnZXQudmFsdWUuc3Vic3RyaW5nKHN0YXJ0LCBzdGFydCArIDIpO1xuICAgICAgICAgICAgICAgIGF1dG9jb21wbGV0ZU1vZGUgPSBzcyA9PT0gXCJbW1wiID8gZS50YXJnZXQuc2VsZWN0aW9uU3RhcnQgOiAwO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbiAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXl1cFwiLCBhdXRvY29tcGxldGVUcmlnZ2VyKTtcbn1cbnZhciBmb3JjZV9hZGRfY3VzdG9tX3BsYXllcl9wYW5lbCA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoXCJQbGF5ZXJQYW5lbFwiIGluIE5lcHR1bmVzUHJpZGUubnB1aSkge1xuICAgICAgICBhZGRfY3VzdG9tX3BsYXllcl9wYW5lbCgpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgc2V0VGltZW91dChhZGRfY3VzdG9tX3BsYXllcl9wYW5lbCwgMzAwMCk7XG4gICAgfVxufTtcbnZhciBhZGRfY3VzdG9tX3BsYXllcl9wYW5lbCA9IGZ1bmN0aW9uICgpIHtcbiAgICBOZXB0dW5lc1ByaWRlLm5wdWkuUGxheWVyUGFuZWwgPSBmdW5jdGlvbiAocGxheWVyLCBzaG93RW1waXJlKSB7XG4gICAgICAgIHZhciB1bml2ZXJzZSA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2U7XG4gICAgICAgIHZhciBucHVpID0gTmVwdHVuZXNQcmlkZS5ucHVpO1xuICAgICAgICB2YXIgcGxheWVyUGFuZWwgPSBDcnV4LldpZGdldChcInJlbFwiKS5zaXplKDQ4MCwgMjY0IC0gOCArIDQ4KTtcbiAgICAgICAgdmFyIGhlYWRpbmcgPSBcInBsYXllclwiO1xuICAgICAgICBpZiAodW5pdmVyc2UucGxheWVyQWNoaWV2ZW1lbnRzICYmXG4gICAgICAgICAgICBOZXB0dW5lc1ByaWRlLmdhbWVDb25maWcuYW5vbnltaXR5ID09PSAwKSB7XG4gICAgICAgICAgICBpZiAodW5pdmVyc2UucGxheWVyQWNoaWV2ZW1lbnRzW3BsYXllci51aWRdKSB7XG4gICAgICAgICAgICAgICAgaWYgKHVuaXZlcnNlLnBsYXllckFjaGlldmVtZW50c1twbGF5ZXIudWlkXS5wcmVtaXVtID09PSBcInByZW1pdW1cIikge1xuICAgICAgICAgICAgICAgICAgICBoZWFkaW5nID0gXCJwcmVtaXVtX3BsYXllclwiO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodW5pdmVyc2UucGxheWVyQWNoaWV2ZW1lbnRzW3BsYXllci51aWRdLnByZW1pdW0gPT09IFwibGlmZXRpbWVcIikge1xuICAgICAgICAgICAgICAgICAgICBoZWFkaW5nID0gXCJsaWZldGltZV9wcmVtaXVtX3BsYXllclwiO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBDcnV4LlRleHQoaGVhZGluZywgXCJzZWN0aW9uX3RpdGxlIGNvbF9ibGFja1wiKVxuICAgICAgICAgICAgLmdyaWQoMCwgMCwgMzAsIDMpXG4gICAgICAgICAgICAucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICBpZiAocGxheWVyLmFpKSB7XG4gICAgICAgICAgICBDcnV4LlRleHQoXCJhaV9hZG1pblwiLCBcInR4dF9yaWdodCBwYWQxMlwiKVxuICAgICAgICAgICAgICAgIC5ncmlkKDAsIDAsIDMwLCAzKVxuICAgICAgICAgICAgICAgIC5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgIH1cbiAgICAgICAgQ3J1eC5JbWFnZShcIi4uL2ltYWdlcy9hdmF0YXJzLzE2MC9cIi5jb25jYXQocGxheWVyLmF2YXRhciwgXCIuanBnXCIpLCBcImFic1wiKVxuICAgICAgICAgICAgLmdyaWQoMCwgNiwgMTAsIDEwKVxuICAgICAgICAgICAgLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgQ3J1eC5XaWRnZXQoXCJwY2lfNDhfXCIuY29uY2F0KHBsYXllci51aWQpKS5ncmlkKDcsIDEzLCAzLCAzKS5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgIENydXguV2lkZ2V0KFwiY29sX2FjY2VudFwiKS5ncmlkKDAsIDMsIDMwLCAzKS5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgIENydXguVGV4dChcIlwiLCBcInNjcmVlbl9zdWJ0aXRsZVwiKVxuICAgICAgICAgICAgLmdyaWQoMCwgMywgMzAsIDMpXG4gICAgICAgICAgICAucmF3SFRNTChwbGF5ZXIucXVhbGlmaWVkQWxpYXMpXG4gICAgICAgICAgICAucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICAvLyBBY2hpZXZlbWVudHNcbiAgICAgICAgdmFyIG15QWNoaWV2ZW1lbnRzO1xuICAgICAgICAvL1U9PlRveGljXG4gICAgICAgIC8vVj0+TWFnaWNcbiAgICAgICAgLy81PT5GbG9tYmFldVxuICAgICAgICAvL1c9PldpemFyZFxuICAgICAgICBpZiAodW5pdmVyc2UucGxheWVyQWNoaWV2ZW1lbnRzKSB7XG4gICAgICAgICAgICBteUFjaGlldmVtZW50cyA9IHVuaXZlcnNlLnBsYXllckFjaGlldmVtZW50c1twbGF5ZXIudWlkXTtcbiAgICAgICAgICAgIGlmIChhcGVfcGxheWVycyA9PT0gbnVsbCB8fCBhcGVfcGxheWVycyA9PT0gdm9pZCAwID8gdm9pZCAwIDogYXBlX3BsYXllcnMuaW5jbHVkZXMocGxheWVyLnJhd0FsaWFzKSkge1xuICAgICAgICAgICAgICAgIGlmIChteUFjaGlldmVtZW50cy5leHRyYV9iYWRnZXMgPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIG15QWNoaWV2ZW1lbnRzLmV4dHJhX2JhZGdlcyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIG15QWNoaWV2ZW1lbnRzLmJhZGdlcyA9IFwiYVwiLmNvbmNhdChteUFjaGlldmVtZW50cy5iYWRnZXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChwbGF5ZXIucmF3QWxpYXMgPT0gXCJMb3JlbnR6XCIpIHtcbiAgICAgICAgICAgICAgICBpZiAobXlBY2hpZXZlbWVudHMuZGV2X2JhZGdlID09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBteUFjaGlldmVtZW50cy5kZXZfYmFkZ2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBteUFjaGlldmVtZW50cy5iYWRnZXMgPSBcIldcIi5jb25jYXQobXlBY2hpZXZlbWVudHMuYmFkZ2VzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChwbGF5ZXIucmF3QWxpYXMgPT0gXCJBIFN0b25lZCBBcGVcIikge1xuICAgICAgICAgICAgICAgIGlmIChteUFjaGlldmVtZW50cy5kZXZfYmFkZ2UgPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIG15QWNoaWV2ZW1lbnRzLmRldl9iYWRnZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIG15QWNoaWV2ZW1lbnRzLmJhZGdlcyA9IFwiNVwiLmNvbmNhdChteUFjaGlldmVtZW50cy5iYWRnZXMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAobXlBY2hpZXZlbWVudHMpIHtcbiAgICAgICAgICAgIG5wdWlcbiAgICAgICAgICAgICAgICAuU21hbGxCYWRnZVJvdyhteUFjaGlldmVtZW50cy5iYWRnZXMpXG4gICAgICAgICAgICAgICAgLmdyaWQoMCwgMywgMzAsIDMpXG4gICAgICAgICAgICAgICAgLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgfVxuICAgICAgICBDcnV4LldpZGdldChcImNvbF9ibGFja1wiKS5ncmlkKDEwLCA2LCAyMCwgMykucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICBpZiAocGxheWVyLnVpZCAhPSBnZXRfaGVybyhOZXB0dW5lc1ByaWRlLnVuaXZlcnNlKS51aWQgJiYgcGxheWVyLmFpID09IDApIHtcbiAgICAgICAgICAgIC8vVXNlIHRoaXMgdG8gb25seSB2aWV3IHdoZW4gdGhleSBhcmUgd2l0aGluIHNjYW5uaW5nOlxuICAgICAgICAgICAgLy91bml2ZXJzZS5zZWxlY3RlZFN0YXIudiAhPSBcIjBcIlxuICAgICAgICAgICAgdmFyIHRvdGFsX3NlbGxfY29zdCA9IGdldF90ZWNoX3RyYWRlX2Nvc3QoZ2V0X2hlcm8oTmVwdHVuZXNQcmlkZS51bml2ZXJzZSksIHBsYXllcik7XG4gICAgICAgICAgICAvKioqIFNIQVJFIEFMTCBURUNIICAqKiovXG4gICAgICAgICAgICB2YXIgYnRuID0gQ3J1eC5CdXR0b24oXCJcIiwgXCJzaGFyZV9hbGxfdGVjaFwiLCBwbGF5ZXIpXG4gICAgICAgICAgICAgICAgLmFkZFN0eWxlKFwiZndkXCIpXG4gICAgICAgICAgICAgICAgLnJhd0hUTUwoXCJTaGFyZSBBbGwgVGVjaDogJFwiLmNvbmNhdCh0b3RhbF9zZWxsX2Nvc3QpKVxuICAgICAgICAgICAgICAgIC5ncmlkKDEwLCAzMSwgMTQsIDMpO1xuICAgICAgICAgICAgLy9EaXNhYmxlIGlmIGluIGEgZ2FtZSB3aXRoIEZBICYgU2NhbiAoQlVHKVxuICAgICAgICAgICAgdmFyIGNvbmZpZyA9IE5lcHR1bmVzUHJpZGUuZ2FtZUNvbmZpZztcbiAgICAgICAgICAgIGlmICghKGNvbmZpZy50cmFkZVNjYW5uZWQgJiYgY29uZmlnLmFsbGlhbmNlcykpIHtcbiAgICAgICAgICAgICAgICBpZiAoZ2V0X2hlcm8oTmVwdHVuZXNQcmlkZS51bml2ZXJzZSkuY2FzaCA+PSB0b3RhbF9zZWxsX2Nvc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgYnRuLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGJ0bi5kaXNhYmxlKCkucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8qKiogUEFZIEZPUiBBTEwgVEVDSCAqKiovXG4gICAgICAgICAgICB2YXIgdG90YWxfYnV5X2Nvc3QgPSBnZXRfdGVjaF90cmFkZV9jb3N0KHBsYXllciwgZ2V0X2hlcm8oTmVwdHVuZXNQcmlkZS51bml2ZXJzZSkpO1xuICAgICAgICAgICAgYnRuID0gQ3J1eC5CdXR0b24oXCJcIiwgXCJidXlfYWxsX3RlY2hcIiwge1xuICAgICAgICAgICAgICAgIHBsYXllcjogcGxheWVyLFxuICAgICAgICAgICAgICAgIHRlY2g6IG51bGwsXG4gICAgICAgICAgICAgICAgY29zdDogdG90YWxfYnV5X2Nvc3QsXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5hZGRTdHlsZShcImZ3ZFwiKVxuICAgICAgICAgICAgICAgIC5yYXdIVE1MKFwiUGF5IGZvciBBbGwgVGVjaDogJFwiLmNvbmNhdCh0b3RhbF9idXlfY29zdCkpXG4gICAgICAgICAgICAgICAgLmdyaWQoMTAsIDQ5LCAxNCwgMyk7XG4gICAgICAgICAgICBpZiAoZ2V0X2hlcm8oTmVwdHVuZXNQcmlkZS51bml2ZXJzZSkuY2FzaCA+PSB0b3RhbF9zZWxsX2Nvc3QpIHtcbiAgICAgICAgICAgICAgICBidG4ucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgYnRuLmRpc2FibGUoKS5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvKkluZGl2aWR1YWwgdGVjaHMqL1xuICAgICAgICAgICAgdmFyIF9uYW1lX21hcCA9IHtcbiAgICAgICAgICAgICAgICBzY2FubmluZzogXCJTY2FubmluZ1wiLFxuICAgICAgICAgICAgICAgIHByb3B1bHNpb246IFwiSHlwZXJzcGFjZSBSYW5nZVwiLFxuICAgICAgICAgICAgICAgIHRlcnJhZm9ybWluZzogXCJUZXJyYWZvcm1pbmdcIixcbiAgICAgICAgICAgICAgICByZXNlYXJjaDogXCJFeHBlcmltZW50YXRpb25cIixcbiAgICAgICAgICAgICAgICB3ZWFwb25zOiBcIldlYXBvbnNcIixcbiAgICAgICAgICAgICAgICBiYW5raW5nOiBcIkJhbmtpbmdcIixcbiAgICAgICAgICAgICAgICBtYW51ZmFjdHVyaW5nOiBcIk1hbnVmYWN0dXJpbmdcIixcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB2YXIgdGVjaHMgPSBbXG4gICAgICAgICAgICAgICAgXCJzY2FubmluZ1wiLFxuICAgICAgICAgICAgICAgIFwicHJvcHVsc2lvblwiLFxuICAgICAgICAgICAgICAgIFwidGVycmFmb3JtaW5nXCIsXG4gICAgICAgICAgICAgICAgXCJyZXNlYXJjaFwiLFxuICAgICAgICAgICAgICAgIFwid2VhcG9uc1wiLFxuICAgICAgICAgICAgICAgIFwiYmFua2luZ1wiLFxuICAgICAgICAgICAgICAgIFwibWFudWZhY3R1cmluZ1wiLFxuICAgICAgICAgICAgXTtcbiAgICAgICAgICAgIHRlY2hzLmZvckVhY2goZnVuY3Rpb24gKHRlY2gsIGkpIHtcbiAgICAgICAgICAgICAgICB2YXIgb25lX3RlY2hfY29zdCA9IGdldF90ZWNoX3RyYWRlX2Nvc3QocGxheWVyLCBnZXRfaGVybyhOZXB0dW5lc1ByaWRlLnVuaXZlcnNlKSwgdGVjaCk7XG4gICAgICAgICAgICAgICAgdmFyIG9uZV90ZWNoID0gQ3J1eC5CdXR0b24oXCJcIiwgXCJidXlfb25lX3RlY2hcIiwge1xuICAgICAgICAgICAgICAgICAgICBwbGF5ZXI6IHBsYXllcixcbiAgICAgICAgICAgICAgICAgICAgdGVjaDogdGVjaCxcbiAgICAgICAgICAgICAgICAgICAgY29zdDogb25lX3RlY2hfY29zdCxcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAuYWRkU3R5bGUoXCJmd2RcIilcbiAgICAgICAgICAgICAgICAgICAgLnJhd0hUTUwoXCJQYXk6ICRcIi5jb25jYXQob25lX3RlY2hfY29zdCkpXG4gICAgICAgICAgICAgICAgICAgIC5ncmlkKDE1LCAzNC41ICsgaSAqIDIsIDcsIDIpO1xuICAgICAgICAgICAgICAgIGlmIChnZXRfaGVybyhOZXB0dW5lc1ByaWRlLnVuaXZlcnNlKS5jYXNoID49IG9uZV90ZWNoX2Nvc3QgJiZcbiAgICAgICAgICAgICAgICAgICAgb25lX3RlY2hfY29zdCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgb25lX3RlY2gucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIC8vTlBDIENhbGNcbiAgICAgICAgaG9va19ucGNfdGlja19jb3VudGVyKE5lcHR1bmVzUHJpZGUsIENydXgpO1xuICAgICAgICBDcnV4LlRleHQoXCJ5b3VcIiwgXCJwYWQxMiB0eHRfY2VudGVyXCIpLmdyaWQoMjUsIDYsIDUsIDMpLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgLy8gTGFiZWxzXG4gICAgICAgIENydXguVGV4dChcInRvdGFsX3N0YXJzXCIsIFwicGFkOFwiKS5ncmlkKDEwLCA5LCAxNSwgMykucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICBDcnV4LlRleHQoXCJ0b3RhbF9mbGVldHNcIiwgXCJwYWQ4XCIpLmdyaWQoMTAsIDExLCAxNSwgMykucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICBDcnV4LlRleHQoXCJ0b3RhbF9zaGlwc1wiLCBcInBhZDhcIikuZ3JpZCgxMCwgMTMsIDE1LCAzKS5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgIENydXguVGV4dChcIm5ld19zaGlwc1wiLCBcInBhZDhcIikuZ3JpZCgxMCwgMTUsIDE1LCAzKS5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgIC8vIFRoaXMgcGxheWVycyBzdGF0c1xuICAgICAgICBpZiAocGxheWVyICE9PSB1bml2ZXJzZS5wbGF5ZXIpIHtcbiAgICAgICAgICAgIENydXguVGV4dChcIlwiLCBcInBhZDggdHh0X2NlbnRlclwiKVxuICAgICAgICAgICAgICAgIC5ncmlkKDIwLCA5LCA1LCAzKVxuICAgICAgICAgICAgICAgIC5yYXdIVE1MKHBsYXllci50b3RhbF9zdGFycylcbiAgICAgICAgICAgICAgICAucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICAgICAgQ3J1eC5UZXh0KFwiXCIsIFwicGFkOCB0eHRfY2VudGVyXCIpXG4gICAgICAgICAgICAgICAgLmdyaWQoMjAsIDExLCA1LCAzKVxuICAgICAgICAgICAgICAgIC5yYXdIVE1MKHBsYXllci50b3RhbF9mbGVldHMpXG4gICAgICAgICAgICAgICAgLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgICAgIENydXguVGV4dChcIlwiLCBcInBhZDggdHh0X2NlbnRlclwiKVxuICAgICAgICAgICAgICAgIC5ncmlkKDIwLCAxMywgNSwgMylcbiAgICAgICAgICAgICAgICAucmF3SFRNTChwbGF5ZXIudG90YWxfc3RyZW5ndGgpXG4gICAgICAgICAgICAgICAgLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgICAgIENydXguVGV4dChcIlwiLCBcInBhZDggdHh0X2NlbnRlclwiKVxuICAgICAgICAgICAgICAgIC5ncmlkKDIwLCAxNSwgNSwgMylcbiAgICAgICAgICAgICAgICAucmF3SFRNTChwbGF5ZXIuc2hpcHNQZXJUaWNrKVxuICAgICAgICAgICAgICAgIC5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gc2VsZWN0SGlsaWdodFN0eWxlKHAxLCBwMikge1xuICAgICAgICAgICAgcDEgPSBOdW1iZXIocDEpO1xuICAgICAgICAgICAgcDIgPSBOdW1iZXIocDIpO1xuICAgICAgICAgICAgaWYgKHAxIDwgcDIpXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiIHR4dF93YXJuX2JhZFwiO1xuICAgICAgICAgICAgaWYgKHAxID4gcDIpXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiIHR4dF93YXJuX2dvb2RcIjtcbiAgICAgICAgICAgIHJldHVybiBcIlwiO1xuICAgICAgICB9XG4gICAgICAgIC8vIFlvdXIgc3RhdHNcbiAgICAgICAgaWYgKHVuaXZlcnNlLnBsYXllcikge1xuICAgICAgICAgICAgQ3J1eC5UZXh0KFwiXCIsIFwicGFkOCB0eHRfY2VudGVyIFwiLmNvbmNhdChzZWxlY3RIaWxpZ2h0U3R5bGUodW5pdmVyc2UucGxheWVyLnRvdGFsX3N0YXJzLCBwbGF5ZXIudG90YWxfc3RhcnMpKSlcbiAgICAgICAgICAgICAgICAuZ3JpZCgyNSwgOSwgNSwgMylcbiAgICAgICAgICAgICAgICAucmF3SFRNTCh1bml2ZXJzZS5wbGF5ZXIudG90YWxfc3RhcnMpXG4gICAgICAgICAgICAgICAgLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgICAgIENydXguVGV4dChcIlwiLCBcInBhZDggdHh0X2NlbnRlclwiLmNvbmNhdChzZWxlY3RIaWxpZ2h0U3R5bGUodW5pdmVyc2UucGxheWVyLnRvdGFsX2ZsZWV0cywgcGxheWVyLnRvdGFsX2ZsZWV0cykpKVxuICAgICAgICAgICAgICAgIC5ncmlkKDI1LCAxMSwgNSwgMylcbiAgICAgICAgICAgICAgICAucmF3SFRNTCh1bml2ZXJzZS5wbGF5ZXIudG90YWxfZmxlZXRzKVxuICAgICAgICAgICAgICAgIC5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgICAgICBDcnV4LlRleHQoXCJcIiwgXCJwYWQ4IHR4dF9jZW50ZXJcIi5jb25jYXQoc2VsZWN0SGlsaWdodFN0eWxlKHVuaXZlcnNlLnBsYXllci50b3RhbF9zdHJlbmd0aCwgcGxheWVyLnRvdGFsX3N0cmVuZ3RoKSkpXG4gICAgICAgICAgICAgICAgLmdyaWQoMjUsIDEzLCA1LCAzKVxuICAgICAgICAgICAgICAgIC5yYXdIVE1MKHVuaXZlcnNlLnBsYXllci50b3RhbF9zdHJlbmd0aClcbiAgICAgICAgICAgICAgICAucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICAgICAgQ3J1eC5UZXh0KFwiXCIsIFwicGFkOCB0eHRfY2VudGVyXCIuY29uY2F0KHNlbGVjdEhpbGlnaHRTdHlsZSh1bml2ZXJzZS5wbGF5ZXIuc2hpcHNQZXJUaWNrLCBwbGF5ZXIuc2hpcHNQZXJUaWNrKSkpXG4gICAgICAgICAgICAgICAgLmdyaWQoMjUsIDE1LCA1LCAzKVxuICAgICAgICAgICAgICAgIC5yYXdIVE1MKHVuaXZlcnNlLnBsYXllci5zaGlwc1BlclRpY2spXG4gICAgICAgICAgICAgICAgLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgfVxuICAgICAgICBDcnV4LldpZGdldChcImNvbF9hY2NlbnRcIikuZ3JpZCgwLCAxNiwgMTAsIDMpLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgaWYgKHVuaXZlcnNlLnBsYXllcikge1xuICAgICAgICAgICAgdmFyIG1zZ0J0biA9IENydXguSWNvbkJ1dHRvbihcImljb24tbWFpbFwiLCBcImluYm94X25ld19tZXNzYWdlX3RvX3BsYXllclwiLCBwbGF5ZXIudWlkKVxuICAgICAgICAgICAgICAgIC5ncmlkKDAsIDE2LCAzLCAzKVxuICAgICAgICAgICAgICAgIC5hZGRTdHlsZShcImZ3ZFwiKVxuICAgICAgICAgICAgICAgIC5kaXNhYmxlKClcbiAgICAgICAgICAgICAgICAucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICAgICAgaWYgKHBsYXllciAhPT0gdW5pdmVyc2UucGxheWVyICYmIHBsYXllci5hbGlhcykge1xuICAgICAgICAgICAgICAgIG1zZ0J0bi5lbmFibGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIENydXguSWNvbkJ1dHRvbihcImljb24tY2hhcnQtbGluZVwiLCBcInNob3dfaW50ZWxcIiwgcGxheWVyLnVpZClcbiAgICAgICAgICAgICAgICAuZ3JpZCgyLjUsIDE2LCAzLCAzKVxuICAgICAgICAgICAgICAgIC5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgICAgICBpZiAoc2hvd0VtcGlyZSkge1xuICAgICAgICAgICAgICAgIENydXguSWNvbkJ1dHRvbihcImljb24tZXllXCIsIFwic2hvd19zY3JlZW5cIiwgXCJlbXBpcmVcIilcbiAgICAgICAgICAgICAgICAgICAgLmdyaWQoNywgMTYsIDMsIDMpXG4gICAgICAgICAgICAgICAgICAgIC5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBsYXllclBhbmVsO1xuICAgIH07XG59O1xudmFyIHN1cGVyU3Rhckluc3BlY3RvciA9IE5lcHR1bmVzUHJpZGUubnB1aS5TdGFySW5zcGVjdG9yO1xuTmVwdHVuZXNQcmlkZS5ucHVpLlN0YXJJbnNwZWN0b3IgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHVuaXZlcnNlID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZTtcbiAgICB2YXIgY29uZmlnID0gTmVwdHVuZXNQcmlkZS5nYW1lQ29uZmlnO1xuICAgIC8vQ2FsbCBzdXBlciAoUHJldmlvdXMgU3Rhckluc3BlY3RvciBmcm9tIGdhbWVjb2RlKVxuICAgIHZhciBzdGFySW5zcGVjdG9yID0gc3VwZXJTdGFySW5zcGVjdG9yKCk7XG4gICAgQ3J1eC5JY29uQnV0dG9uKFwiaWNvbi1oZWxwIHJlbFwiLCBcInNob3dfaGVscFwiLCBcInN0YXJzXCIpLnJvb3N0KHN0YXJJbnNwZWN0b3IuaGVhZGluZyk7XG4gICAgQ3J1eC5JY29uQnV0dG9uKFwiaWNvbi1kb2MtdGV4dCByZWxcIiwgXCJzaG93X3NjcmVlblwiLCBcImNvbWJhdF9jYWxjdWxhdG9yXCIpLnJvb3N0KHN0YXJJbnNwZWN0b3IuaGVhZGluZyk7XG4gICAgLy9BcHBlbmQgZXh0cmEgZnVuY3Rpb25cbiAgICBmdW5jdGlvbiBhcHBseV9mcmFjdGlvbmFsX3NoaXBzKCkge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgZGVwdGgsIHNlbGVjdG9yLCBlbGVtZW50LCBjb3VudGVyLCBmcmFjdGlvbmFsX3NoaXAsIGZyYWN0aW9uYWxfc2hpcF8xLCBuZXdfdmFsdWU7XG4gICAgICAgICAgICByZXR1cm4gX19nZW5lcmF0b3IodGhpcywgZnVuY3Rpb24gKF9hKSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoIChfYS5sYWJlbCkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXB0aCA9IGNvbmZpZy50dXJuQmFzZWQgPyA0IDogMztcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdG9yID0gXCIjY29udGVudEFyZWEgPiBkaXYgPiBkaXYud2lkZ2V0LmZ1bGxzY3JlZW4gPiBkaXY6bnRoLWNoaWxkKFwiLmNvbmNhdChkZXB0aCwgXCIpID4gZGl2ID4gZGl2Om50aC1jaGlsZCg1KSA+IGRpdi53aWRnZXQucGFkMTIuaWNvbi1yb2NrZXQtaW5saW5lLnR4dF9yaWdodFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQgPSAkKHNlbGVjdG9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50ZXIgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgZnJhY3Rpb25hbF9zaGlwID0gdW5pdmVyc2Uuc2VsZWN0ZWRTdGFyW1wiY1wiXS50b0ZpeGVkKDIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgJChzZWxlY3RvcikuYXBwZW5kKGZyYWN0aW9uYWxfc2hpcCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBfYS5sYWJlbCA9IDE7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghKGVsZW1lbnQubGVuZ3RoID09IDAgJiYgY291bnRlciA8PSAxMDApKSByZXR1cm4gWzMgLypicmVhayovLCAzXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbNCAvKnlpZWxkKi8sIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyKSB7IHJldHVybiBzZXRUaW1lb3V0KHIsIDEwKTsgfSldO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgICAgICAgICBfYS5zZW50KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50ID0gJChzZWxlY3Rvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICBmcmFjdGlvbmFsX3NoaXBfMSA9IHVuaXZlcnNlLnNlbGVjdGVkU3RhcltcImNcIl07XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdfdmFsdWUgPSBwYXJzZUludCgkKHNlbGVjdG9yKS50ZXh0KCkpICsgZnJhY3Rpb25hbF9zaGlwXzE7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKHNlbGVjdG9yKS50ZXh0KG5ld192YWx1ZS50b0ZpeGVkKDIpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50ZXIgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbMyAvKmJyZWFrKi8sIDFdO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDM6IHJldHVybiBbMiAvKnJldHVybiovXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGlmIChcImNcIiBpbiB1bml2ZXJzZS5zZWxlY3RlZFN0YXIpIHtcbiAgICAgICAgYXBwbHlfZnJhY3Rpb25hbF9zaGlwcygpO1xuICAgIH1cbiAgICByZXR1cm4gc3Rhckluc3BlY3Rvcjtcbn07XG4vL0phdmFzY3JpcHQgY2FsbFxuc2V0VGltZW91dChMZWdhY3lfTmVwdHVuZXNQcmlkZUFnZW50LCAxMDAwKTtcbnNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgIC8vVHlwZXNjcmlwdCBjYWxsXG4gICAgcG9zdF9ob29rKCk7XG4gICAgcmVuZGVyTGVkZ2VyKE5lcHR1bmVzUHJpZGUsIENydXgsIE1vdXNldHJhcCk7XG59LCA4MDApO1xuc2V0VGltZW91dChhcHBseV9ob29rcywgMTUwMCk7XG4vL1Rlc3QgdG8gc2VlIGlmIFBsYXllclBhbmVsIGlzIHRoZXJlXG4vL0lmIGl0IGlzIG92ZXJ3cml0ZXMgY3VzdG9tIG9uZVxuLy9PdGhlcndpc2Ugd2hpbGUgbG9vcCAmIHNldCB0aW1lb3V0IHVudGlsIGl0cyB0aGVyZVxuZm9yY2VfYWRkX2N1c3RvbV9wbGF5ZXJfcGFuZWwoKTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==