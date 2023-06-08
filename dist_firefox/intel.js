/******/ (function() { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/clone-deep/index.js":
/*!******************************************!*\
  !*** ./node_modules/clone-deep/index.js ***!
  \******************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


/**
 * Module dependenices
 */

const clone = __webpack_require__(/*! shallow-clone */ "./node_modules/shallow-clone/index.js");
const typeOf = __webpack_require__(/*! kind-of */ "./node_modules/kind-of/index.js");
const isPlainObject = __webpack_require__(/*! is-plain-object */ "./node_modules/is-plain-object/index.js");

function cloneDeep(val, instanceClone) {
  switch (typeOf(val)) {
    case 'object':
      return cloneObjectDeep(val, instanceClone);
    case 'array':
      return cloneArrayDeep(val, instanceClone);
    default: {
      return clone(val);
    }
  }
}

function cloneObjectDeep(val, instanceClone) {
  if (typeof instanceClone === 'function') {
    return instanceClone(val);
  }
  if (instanceClone || isPlainObject(val)) {
    const res = new val.constructor();
    for (let key in val) {
      res[key] = cloneDeep(val[key], instanceClone);
    }
    return res;
  }
  return val;
}

function cloneArrayDeep(val, instanceClone) {
  const res = new val.constructor(val.length);
  for (let i = 0; i < val.length; i++) {
    res[i] = cloneDeep(val[i], instanceClone);
  }
  return res;
}

/**
 * Expose `cloneDeep`
 */

module.exports = cloneDeep;


/***/ }),

/***/ "./node_modules/is-plain-object/index.js":
/*!***********************************************!*\
  !*** ./node_modules/is-plain-object/index.js ***!
  \***********************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";
/*!
 * is-plain-object <https://github.com/jonschlinkert/is-plain-object>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */



var isObject = __webpack_require__(/*! isobject */ "./node_modules/isobject/index.js");

function isObjectObject(o) {
  return isObject(o) === true
    && Object.prototype.toString.call(o) === '[object Object]';
}

module.exports = function isPlainObject(o) {
  var ctor,prot;

  if (isObjectObject(o) === false) return false;

  // If has modified constructor
  ctor = o.constructor;
  if (typeof ctor !== 'function') return false;

  // If has modified prototype
  prot = ctor.prototype;
  if (isObjectObject(prot) === false) return false;

  // If constructor does not have an Object-specific method
  if (prot.hasOwnProperty('isPrototypeOf') === false) {
    return false;
  }

  // Most likely a plain Object
  return true;
};


/***/ }),

/***/ "./node_modules/isobject/index.js":
/*!****************************************!*\
  !*** ./node_modules/isobject/index.js ***!
  \****************************************/
/***/ (function(module) {

"use strict";
/*!
 * isobject <https://github.com/jonschlinkert/isobject>
 *
 * Copyright (c) 2014-2017, Jon Schlinkert.
 * Released under the MIT License.
 */



module.exports = function isObject(val) {
  return val != null && typeof val === 'object' && Array.isArray(val) === false;
};


/***/ }),

/***/ "./node_modules/kind-of/index.js":
/*!***************************************!*\
  !*** ./node_modules/kind-of/index.js ***!
  \***************************************/
/***/ (function(module) {

var toString = Object.prototype.toString;

module.exports = function kindOf(val) {
  if (val === void 0) return 'undefined';
  if (val === null) return 'null';

  var type = typeof val;
  if (type === 'boolean') return 'boolean';
  if (type === 'string') return 'string';
  if (type === 'number') return 'number';
  if (type === 'symbol') return 'symbol';
  if (type === 'function') {
    return isGeneratorFn(val) ? 'generatorfunction' : 'function';
  }

  if (isArray(val)) return 'array';
  if (isBuffer(val)) return 'buffer';
  if (isArguments(val)) return 'arguments';
  if (isDate(val)) return 'date';
  if (isError(val)) return 'error';
  if (isRegexp(val)) return 'regexp';

  switch (ctorName(val)) {
    case 'Symbol': return 'symbol';
    case 'Promise': return 'promise';

    // Set, Map, WeakSet, WeakMap
    case 'WeakMap': return 'weakmap';
    case 'WeakSet': return 'weakset';
    case 'Map': return 'map';
    case 'Set': return 'set';

    // 8-bit typed arrays
    case 'Int8Array': return 'int8array';
    case 'Uint8Array': return 'uint8array';
    case 'Uint8ClampedArray': return 'uint8clampedarray';

    // 16-bit typed arrays
    case 'Int16Array': return 'int16array';
    case 'Uint16Array': return 'uint16array';

    // 32-bit typed arrays
    case 'Int32Array': return 'int32array';
    case 'Uint32Array': return 'uint32array';
    case 'Float32Array': return 'float32array';
    case 'Float64Array': return 'float64array';
  }

  if (isGeneratorObj(val)) {
    return 'generator';
  }

  // Non-plain objects
  type = toString.call(val);
  switch (type) {
    case '[object Object]': return 'object';
    // iterators
    case '[object Map Iterator]': return 'mapiterator';
    case '[object Set Iterator]': return 'setiterator';
    case '[object String Iterator]': return 'stringiterator';
    case '[object Array Iterator]': return 'arrayiterator';
  }

  // other
  return type.slice(8, -1).toLowerCase().replace(/\s/g, '');
};

function ctorName(val) {
  return typeof val.constructor === 'function' ? val.constructor.name : null;
}

function isArray(val) {
  if (Array.isArray) return Array.isArray(val);
  return val instanceof Array;
}

function isError(val) {
  return val instanceof Error || (typeof val.message === 'string' && val.constructor && typeof val.constructor.stackTraceLimit === 'number');
}

function isDate(val) {
  if (val instanceof Date) return true;
  return typeof val.toDateString === 'function'
    && typeof val.getDate === 'function'
    && typeof val.setDate === 'function';
}

function isRegexp(val) {
  if (val instanceof RegExp) return true;
  return typeof val.flags === 'string'
    && typeof val.ignoreCase === 'boolean'
    && typeof val.multiline === 'boolean'
    && typeof val.global === 'boolean';
}

function isGeneratorFn(name, val) {
  return ctorName(name) === 'GeneratorFunction';
}

function isGeneratorObj(val) {
  return typeof val.throw === 'function'
    && typeof val.return === 'function'
    && typeof val.next === 'function';
}

function isArguments(val) {
  try {
    if (typeof val.length === 'number' && typeof val.callee === 'function') {
      return true;
    }
  } catch (err) {
    if (err.message.indexOf('callee') !== -1) {
      return true;
    }
  }
  return false;
}

/**
 * If you need to support Safari 5-7 (8-10 yr-old browser),
 * take a look at https://github.com/feross/is-buffer
 */

function isBuffer(val) {
  if (val.constructor && typeof val.constructor.isBuffer === 'function') {
    return val.constructor.isBuffer(val);
  }
  return false;
}


/***/ }),

/***/ "./node_modules/shallow-clone/index.js":
/*!*********************************************!*\
  !*** ./node_modules/shallow-clone/index.js ***!
  \*********************************************/
/***/ (function(module, __unused_webpack_exports, __webpack_require__) {

"use strict";
/*!
 * shallow-clone <https://github.com/jonschlinkert/shallow-clone>
 *
 * Copyright (c) 2015-present, Jon Schlinkert.
 * Released under the MIT License.
 */



const valueOf = Symbol.prototype.valueOf;
const typeOf = __webpack_require__(/*! kind-of */ "./node_modules/kind-of/index.js");

function clone(val, deep) {
  switch (typeOf(val)) {
    case 'array':
      return val.slice();
    case 'object':
      return Object.assign({}, val);
    case 'date':
      return new val.constructor(Number(val));
    case 'map':
      return new Map(val);
    case 'set':
      return new Set(val);
    case 'buffer':
      return cloneBuffer(val);
    case 'symbol':
      return cloneSymbol(val);
    case 'arraybuffer':
      return cloneArrayBuffer(val);
    case 'float32array':
    case 'float64array':
    case 'int16array':
    case 'int32array':
    case 'int8array':
    case 'uint16array':
    case 'uint32array':
    case 'uint8clampedarray':
    case 'uint8array':
      return cloneTypedArray(val);
    case 'regexp':
      return cloneRegExp(val);
    case 'error':
      return Object.create(val);
    default: {
      return val;
    }
  }
}

function cloneRegExp(val) {
  const flags = val.flags !== void 0 ? val.flags : (/\w+$/.exec(val) || void 0);
  const re = new val.constructor(val.source, flags);
  re.lastIndex = val.lastIndex;
  return re;
}

function cloneArrayBuffer(val) {
  const res = new val.constructor(val.byteLength);
  new Uint8Array(res).set(new Uint8Array(val));
  return res;
}

function cloneTypedArray(val, deep) {
  return new val.constructor(val.buffer, val.byteOffset, val.length);
}

function cloneBuffer(val) {
  const len = val.length;
  const buf = Buffer.allocUnsafe ? Buffer.allocUnsafe(len) : Buffer.from(len);
  val.copy(buf);
  return buf;
}

function cloneSymbol(val) {
  return valueOf ? Object(valueOf.call(val)) : {};
}

/**
 * Expose `clone`
 */

module.exports = clone;


/***/ }),

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

const RESEACH_MAP = {
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
    let universe = game.universe;
    let hero = (0,_get_hero__WEBPACK_IMPORTED_MODULE_0__.get_hero)(game.universe);
    let science = hero.total_science;
    //Current Science
    let current = hero.tech[hero.researching];
    let current_points_remaining = current.brr * current.level - current.research;
    let eta = Math.ceil(current_points_remaining / science); //Hours
    //Next science
    let next = hero.tech[hero.researching_next];
    let next_points_remaining = next.brr * next.level - next.research;
    let next_eta = Math.ceil(next_points_remaining / science) + eta;
    let next_level = next.level + 1;
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
    const research = get_research(game);
    let first_line = `Now: ${research["current_name"]} ${research["current_level"]} - ${research["current_eta"]} ticks.`;
    let second_line = `Next: ${research["next_name"]} ${research["next_level"]} - ${research["next_eta"]} ticks.`;
    let third_line = `My Science: ${research["science"]}`;
    return `${first_line}\n${second_line}\n${third_line}\n`;
}
function MarkDownMessageComment(context, text, index) {
    let messageComment = context.MessageComment(text, index);
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
let cached_events = [];
let cacheFetchStart = new Date();
let cacheFetchSize = 0;
//Async request game events
//game is used to get the api version and the gameNumber
function update_event_cache(game, crux, fetchSize, success, error) {
    const count = cached_events.length > 0 ? fetchSize : 100000;
    cacheFetchStart = new Date();
    cacheFetchSize = count;
    const params = new URLSearchParams({
        type: "fetch_game_messages",
        count: count.toString(),
        offset: "0",
        group: "game_event",
        version: game.version,
        game_number: game.gameNumber,
    });
    const headers = {
        "Content-Type": "application/x-www-form-urlencodedn",
    };
    fetch("/trequest/fetch_game_messages", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params,
    })
        .then((response) => response.json())
        .then((response) => {
        sync_message_cache(response); //Updates cached_events
        //cached_events = sync_message_cache(response))
    })
        .then((x) => success(game, crux))
        .catch(error);
}
//Custom UI Components for Ledger
function PlayerNameIconRowLink(crux, npui, player) {
    let playerNameIconRow = crux.Widget("rel col_black clickable").size(480, 48);
    npui.PlayerIcon(player, true).roost(playerNameIconRow);
    crux
        .Text("", "section_title")
        .grid(6, 0, 21, 3)
        .rawHTML(`<a onclick="Crux.crux.trigger('show_player_uid', '${player.uid}' )">${player.alias}</a>`)
        .roost(playerNameIconRow);
    return playerNameIconRow;
}
function sync_message_cache(response) {
    const cacheFetchEnd = new Date();
    const elapsed = cacheFetchEnd.getTime() - cacheFetchStart.getTime();
    console.log(`Fetched ${cacheFetchSize} events in ${elapsed}ms`);
    let incoming = response.report.messages;
    if (cached_events.length > 0) {
        let overlapOffset = -1;
        for (let i = 0; i < incoming.length; ++i) {
            const message = incoming[i];
            if (message.key === cached_events[0].key) {
                overlapOffset = i;
                break;
            }
        }
        if (overlapOffset >= 0) {
            incoming = incoming.slice(0, overlapOffset);
        }
        else if (overlapOffset < 0) {
            const size = incoming.length * 2;
            console.log(`Missing some events, double fetch to ${size}`);
            //update_event_cache(game, crux, size, recieve_new_messages, console.error);
            return;
        }
        // we had cached events, but want to be extra paranoid about
        // correctness. So if the response contained the entire event
        // log, validate that it exactly matches the cached events.
        if (response.report.messages.length === cached_events.length) {
            console.log("*** Validating cached_events ***");
            const valid = response.report.messages;
            let invalidEntries = cached_events.filter((e, i) => e.key !== valid[i].key);
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
    let universe = game.universe;
    let npui = game.npui;
    const players = (0,_ledger__WEBPACK_IMPORTED_MODULE_0__.get_ledger)(game, crux, cached_events);
    const ledgerScreen = npui.ledgerScreen();
    npui.onHideScreen(null, true);
    npui.onHideSelectionMenu();
    npui.trigger("hide_side_menu");
    npui.trigger("reset_edit_mode");
    npui.activeScreen = ledgerScreen;
    ledgerScreen.roost(npui.screenContainer);
    npui.layoutElement(ledgerScreen);
    players.forEach((p) => {
        let player = PlayerNameIconRowLink(crux, npui, universe.galaxy.players[p.uid]).roost(npui.activeScreen);
        player.addStyle("player_cell");
        let prompt = p.debt > 0 ? "They owe" : "You owe";
        if (p.debt == 0) {
            prompt = "Balance";
        }
        if (p.debt < 0) {
            crux
                .Text("", "pad12 txt_right red-text")
                .rawHTML(`${prompt}: ${p.debt}`)
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
                .rawHTML(`${prompt}: ${p.debt}`)
                .grid(20, 0, 10, 3)
                .roost(player);
        }
        else if (p.debt == 0) {
            crux
                .Text("", "pad12 txt_right orange-text")
                .rawHTML(`${prompt}: ${p.debt}`)
                .grid(20, 0, 10, 3)
                .roost(player);
        }
    });
}
/* harmony default export */ __webpack_exports__["default"] = ({
    update_event_cache,
    recieve_new_messages,
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

function get_hero(universe = (0,_utilities_get_game_state__WEBPACK_IMPORTED_MODULE_0__.get_universe)()) {
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
    let npui = game.npui;
    let universe = game.universe;
    let players = universe.galaxy.players;
    let loading = crux
        .Text("", "rel txt_center pad12")
        .rawHTML(`Parsing ${messages.length} messages.`);
    loading.roost(npui.activeScreen);
    let uid = (0,_get_hero__WEBPACK_IMPORTED_MODULE_0__.get_hero)(universe).uid;
    //Ledger is a list of debts
    let ledger = {};
    messages
        .filter((m) => m.payload.template == "money_sent" ||
        m.payload.template == "shared_technology")
        .map((m) => m.payload)
        .forEach((m) => {
        let liaison = m.from_puid == uid ? m.to_puid : m.from_puid;
        let value = m.template == "money_sent" ? m.amount : m.price;
        value *= m.from_puid == uid ? 1 : -1; // amount is (+) if credit & (-) if debt
        liaison in ledger
            ? (ledger[liaison] += value)
            : (ledger[liaison] = value);
    });
    //TODO: Review that this is correctly finding a list of only people who have debts.
    //Accounts are the credit or debit related to each user
    let accounts = [];
    for (let uid in ledger) {
        let player = players[parseInt(uid)];
        player.debt = ledger[uid];
        accounts.push(player);
    }
    (0,_get_hero__WEBPACK_IMPORTED_MODULE_0__.get_hero)(universe).ledger = ledger;
    console.log(accounts);
    return accounts;
}
function renderLedger(game, crux, MouseTrap) {
    //Deconstruction of different components of the game.
    let config = game.config;
    let np = game.np;
    let npui = game.npui;
    let universe = game.universe;
    let templates = game.templates;
    let players = universe.galaxy.players;
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
    npui.ledgerScreen = () => {
        return npui.Screen("ledger");
    };
    np.on("trigger_ledger", () => {
        const ledgerScreen = npui.ledgerScreen();
        let loading = crux
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
        let targetPlayer = data.targetPlayer;
        let player = players[targetPlayer];
        let amount = player.debt * -1;
        //let amount = 1
        universe.player.ledger[targetPlayer] = 0;
        np.trigger("show_screen", [
            "confirm",
            {
                message: "forgive_debt",
                eventKind: "confirm_forgive_debt",
                eventData: {
                    type: "order",
                    order: `send_money,${targetPlayer},${amount}`,
                },
            },
        ]);
    };
    np.on("confirm_forgive_debt", (event, data) => {
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
    let game_number = (0,_get_game_state__WEBPACK_IMPORTED_MODULE_0__.get_game_number)();
    return fetch("https://np.ironhelmet.com/api", {
        headers: {
            accept: "application/json, text/javascript, */*; q=0.01",
            "accept-language": "en-US,en;q=0.9",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "x-requested-with": "XMLHttpRequest",
        },
        referrer: `https://np.ironhelmet.com/game/${game_number}`,
        referrerPolicy: "strict-origin-when-cross-origin",
        body: `game_number=${game_number}&api_version=0.1&code=${apikey}`,
        method: "POST",
        mode: "cors",
        credentials: "include",
    }).then((response) => response.json());
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
    let stars = get_all_stars();
    if (stars === undefined)
        return undefined;
    let visible_stars = [];
    for (let [index, star] of Object.entries(stars)) {
        if (star.v === "1") {
            //Star is visible
            visible_stars.push(star);
        }
    }
    return visible_stars;
}
var global;
(function (global) {
})(global || (global = {}));
NeptunesPride;
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

/***/ "./source/utilities/gift_shop.ts":
/*!***************************************!*\
  !*** ./source/utilities/gift_shop.ts ***!
  \***************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ApeGiftItem: function() { return /* binding */ ApeGiftItem; },
/* harmony export */   buyApeGiftScreen: function() { return /* binding */ buyApeGiftScreen; }
/* harmony export */ });
const buyApeGiftScreen = function (Crux, universe, npui) {
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
        { icon: "proteus", amount: 1 },
        { icon: "lifetime", amount: 1 },
        { icon: "tourney_win", amount: 1 },
        { icon: "tourney_join", amount: 1 },
        { icon: "honour", amount: 1 },
        { icon: "wizard", amount: 1 },
        { icon: "rat", amount: 1 },
        { icon: "flambeau", amount: 1 },
        { icon: "bullseye", amount: 1 },
        { icon: "trek", amount: 1 },
        { icon: "rebel", amount: 1 },
        { icon: "empire", amount: 1 },
        { icon: "wolf", amount: 5 },
        { icon: "toxic", amount: 10 },
        { icon: "pirate", amount: 5 },
        { icon: "wordsmith", amount: 2 },
        { icon: "lucky", amount: 2 },
        { icon: "ironborn", amount: 2 },
        { icon: "strange", amount: 2 },
        { icon: "ape", amount: 1 },
        { icon: "cheesy", amount: 1 },
        { icon: "strategic", amount: 1 },
        { icon: "badass", amount: 1 },
        { icon: "lionheart", amount: 1 },
        { icon: "gun", amount: 1 },
        { icon: "command", amount: 1 },
        { icon: "science", amount: 1 },
        { icon: "nerd", amount: 1 },
        { icon: "merit", amount: 1 },
    ];
    let secret_menu = [
    /**/
    ];
    for (i = items.length - 1; i >= 0; i--) {
        items[i].puid = universe.selectedPlayer.uid;
        npui.GiftItem(items[i]).roost(buy);
    }
    return buy;
};
const ApeGiftItem = function (Crux, url, item) {
    var gi = Crux.Widget("rel").size(480);
    Crux.Widget("rel col_base").size(480, 16).roost(gi);
    let image_url = `../images/badges/${item.icon}.png`;
    if (item.icon == "ape") {
        image_url = `${url}${item.icon}.png`;
    }
    gi.icon = Crux.Image(image_url, "abs").grid(0.25, 1, 6, 6).roost(gi);
    gi.body = Crux.Text(`gift_desc_${item.icon}`, "rel txt_selectable")
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
    for (let smear = 1; smear < 4; ++smear) {
        context.fillText(text, x + smear, y + smear);
        context.fillText(text, x - smear, y + smear);
        context.fillText(text, x - smear, y - smear);
        context.fillText(text, x + smear, y - smear);
    }
    context.fillStyle = fgColor || "#00ff00";
    context.fillText(text, x, y);
}
function anyStarCanSee(universe, owner, fleet) {
    let stars = universe.galaxy.stars;
    let scanRange = universe.galaxy.players[owner].tech.scanning.value;
    for (const s in stars) {
        let star = stars[s];
        if (star.puid == owner) {
            let distance = universe.distance(star.x, star.y, parseFloat(fleet.x), parseFloat(fleet.y));
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


let originalPlayer = undefined;
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
    let apikey = data === null || data === void 0 ? void 0 : data.split(":")[1];
    console.log(apikey);
    if (valid_apikey(apikey)) {
        (0,_api__WEBPACK_IMPORTED_MODULE_1__.get_api_data)(apikey)
            .then((data) => {
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
    let galaxy = (0,_get_game_state__WEBPACK_IMPORTED_MODULE_0__.get_galaxy)();
    let stars = scanningData.stars;
    let fleets = scanningData.fleets;
    // Update stars
    for (const starId in stars) {
        const star = stars[starId];
        if (galaxy.stars[starId] == undefined) {
            galaxy.stars[starId] = star;
        }
    }
    console.log("Syncing");
    // Add fleets
    for (const fleetId in fleets) {
        const fleet = fleets[fleetId];
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
    let ai = game.universe.selectedPlayer;
    let cache = (0,_event_cache__WEBPACK_IMPORTED_MODULE_0__.get_cached_events)();
    let events = cache.map((e) => e.payload);
    let goodbyes = events.filter((e) => e.template.includes("goodbye_to_player"));
    let tick = goodbyes.filter((e) => e.uid == ai.uid)[0].tick;
    console.log(tick);
    return tick;
}
function add_npc_tick_counter(game, crux) {
    let tick = get_npc_tick(game, crux);
    let title = document.querySelector("#contentArea > div > div.widget.fullscreen > div:nth-child(3) > div > div:nth-child(5) > div.widget.section_title.col_black");
    let subtitle = document.querySelector("#contentArea > div > div.widget.fullscreen > div:nth-child(3) > div > div:nth-child(5) > div.widget.txt_right.pad12");
    let current_tick = game.universe.galaxy.tick;
    let next_move = (current_tick - tick) % 4;
    let last_move = 4 - next_move;
    //let last_move = current_tick-next_move
    let postfix_1 = "";
    let postfix_2 = "";
    if (next_move != 1) {
        postfix_1 += "s";
    }
    if (last_move != 1) {
        postfix_2 += "s";
    }
    if (next_move == 0) {
        next_move = 4;
        title.innerText = `AI moves in ${next_move} tick${postfix_1}`;
        subtitle.innerText = "AI moved this tick";
    }
    else {
        title.innerText = `AI moves in ${next_move} tick${postfix_1}`;
        subtitle.innerText = `AI last moved ${last_move} tick${postfix_2} ago`;
        //subtitle.innerText = `AI last moved on tick ${last_move}`
    }
}
function hook_npc_tick_counter(game, crux) {
    const selectedPlayer = game.universe.selectedPlayer;
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
    const protocol = "^(https:\\/\\/)";
    const domains = "(i\\.ibb\\.co|i\\.imgur\\.com|cdn\\.discordapp\\.com)";
    const content = "([&#_=;\\-\\?\\/\\w]{1,150})";
    const images = "(\\.)(gif|jpe?g|tiff?|png|webp|bmp|GIF|JPE?G|TIFF?|PNG|WEBP|BMP)$";
    const regex_string = protocol + domains + content + images;
    let regex = new RegExp(regex_string);
    let valid = regex.test(str);
    return valid;
}
function is_valid_youtube(str) {
    const protocol = "^(https://)";
    const domains = "(youtube.com|www.youtube.com|youtu.be)";
    const content = "([&#_=;-?/w]{1,150})";
    const regex_string = protocol + domains + content;
    let regex = new RegExp(regex_string);
    return regex.test(str);
}
function get_youtube_embed(link) {
    return `<iframe width="560" height="315" src="https://www.youtube.com/embed/eHsDTGw_jZ8" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
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
const KV_REST_API_URL = "https://immune-cricket-36011.kv.vercel-storage.com";
const KV_REST_API_READ_ONLY_TOKEN = "AoyrASQgNzE0M2E2NTMtMmFjNC00ZTFlLWJmNTItMGRlYWZmMmY3MTc0ZptG96elbXOjZJ7_GE7w-arYAGCaktoo25q4DXRWL7U=";
const custom_badges = ["ape"];
// Function that connects to server and retrieves list on key 'ape'
const get_ape_badges = () => __awaiter(void 0, void 0, void 0, function* () {
    return fetch(KV_REST_API_URL, {
        headers: {
            Authorization: `Bearer ${KV_REST_API_READ_ONLY_TOKEN}`,
        },
        body: '["LRANGE", "ape", 0, -1]',
        method: "POST",
    })
        .then((response) => response.json())
        .then((data) => data.result);
});
/* Updating Badge Classes */
const ApeBadgeIcon = function (Crux, url, filename, count, small) {
    var ebi = Crux.Widget();
    if (small === undefined)
        small = false;
    if (small) {
        /* Small images */
        let image_url = `/images/badges_small/${filename}.png`;
        if (filename == "ape") {
            image_url = `${url}${filename}_small.png`;
        }
        Crux.Image(image_url, "abs").grid(0.25, 0.25, 2.5, 2.5).roost(ebi);
        Crux.Clickable("show_screen", "buy_gift")
            .grid(0.25, 0.25, 2.5, 2.5)
            .tt(`badge_${filename}`)
            .roost(ebi);
    }
    else {
        /* Big images */
        let image_url = `/images/badges/${filename}.png`;
        if (filename == "ape") {
            image_url = `${url}${filename}.png`;
        }
        Crux.Image(image_url, "abs").grid(0, 0, 6, 6).tt(filename).roost(ebi);
        Crux.Clickable("show_screen", "buy_gift")
            .grid(0, 0, 6, 6)
            .tt(`badge_${filename}`)
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

/***/ "./source/utilities/territory.ts":
/*!***************************************!*\
  !*** ./source/utilities/territory.ts ***!
  \***************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getTerritory: function() { return /* binding */ getTerritory; }
/* harmony export */ });
/* harmony import */ var d3_delaunay__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! d3-delaunay */ "./node_modules/d3-delaunay/src/delaunay.js");

function getTerritory(universe, canvas) {
    let star_map = universe.galaxy.stars;
    let stars = [];
    for (let star_id in star_map) {
        stars.push(star_map[star_id]);
    }
    let positions = stars.map((star) => {
        return [star.x, star.y];
    });
    const delaunay = d3_delaunay__WEBPACK_IMPORTED_MODULE_0__["default"].from(positions);
    const voronoi = delaunay.voronoi([0, 0, 960, 500]);
    const context = canvas.getContext("2d");
    if (context) {
        context.beginPath();
        for (const polygon of voronoi.cellPolygons()) {
            context.moveTo(polygon[0][0], polygon[0][1]);
            for (const point of polygon) {
                context.lineTo(point[0], point[1]);
            }
            context.closePath();
        }
        context.stroke();
    }
}


/***/ }),

/***/ "./node_modules/webpack-merge/dist/index.js":
/*!**************************************************!*\
  !*** ./node_modules/webpack-merge/dist/index.js ***!
  \**************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.unique = exports.mergeWithRules = exports.mergeWithCustomize = exports["default"] = exports.merge = exports.CustomizeRule = exports.customizeObject = exports.customizeArray = void 0;
var wildcard_1 = __importDefault(__webpack_require__(/*! wildcard */ "./node_modules/wildcard/index.js"));
var merge_with_1 = __importDefault(__webpack_require__(/*! ./merge-with */ "./node_modules/webpack-merge/dist/merge-with.js"));
var join_arrays_1 = __importDefault(__webpack_require__(/*! ./join-arrays */ "./node_modules/webpack-merge/dist/join-arrays.js"));
var unique_1 = __importDefault(__webpack_require__(/*! ./unique */ "./node_modules/webpack-merge/dist/unique.js"));
exports.unique = unique_1["default"];
var types_1 = __webpack_require__(/*! ./types */ "./node_modules/webpack-merge/dist/types.js");
exports.CustomizeRule = types_1.CustomizeRule;
var utils_1 = __webpack_require__(/*! ./utils */ "./node_modules/webpack-merge/dist/utils.js");
function merge(firstConfiguration) {
    var configurations = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        configurations[_i - 1] = arguments[_i];
    }
    return mergeWithCustomize({}).apply(void 0, __spreadArray([firstConfiguration], __read(configurations)));
}
exports.merge = merge;
exports["default"] = merge;
function mergeWithCustomize(options) {
    return function mergeWithOptions(firstConfiguration) {
        var configurations = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            configurations[_i - 1] = arguments[_i];
        }
        if (utils_1.isUndefined(firstConfiguration) || configurations.some(utils_1.isUndefined)) {
            throw new TypeError("Merging undefined is not supported");
        }
        // @ts-ignore
        if (firstConfiguration.then) {
            throw new TypeError("Promises are not supported");
        }
        // No configuration at all
        if (!firstConfiguration) {
            return {};
        }
        if (configurations.length === 0) {
            if (Array.isArray(firstConfiguration)) {
                // Empty array
                if (firstConfiguration.length === 0) {
                    return {};
                }
                if (firstConfiguration.some(utils_1.isUndefined)) {
                    throw new TypeError("Merging undefined is not supported");
                }
                // @ts-ignore
                if (firstConfiguration[0].then) {
                    throw new TypeError("Promises are not supported");
                }
                return merge_with_1["default"](firstConfiguration, join_arrays_1["default"](options));
            }
            return firstConfiguration;
        }
        return merge_with_1["default"]([firstConfiguration].concat(configurations), join_arrays_1["default"](options));
    };
}
exports.mergeWithCustomize = mergeWithCustomize;
function customizeArray(rules) {
    return function (a, b, key) {
        var matchedRule = Object.keys(rules).find(function (rule) { return wildcard_1["default"](rule, key); }) || "";
        if (matchedRule) {
            switch (rules[matchedRule]) {
                case types_1.CustomizeRule.Prepend:
                    return __spreadArray(__spreadArray([], __read(b)), __read(a));
                case types_1.CustomizeRule.Replace:
                    return b;
                case types_1.CustomizeRule.Append:
                default:
                    return __spreadArray(__spreadArray([], __read(a)), __read(b));
            }
        }
    };
}
exports.customizeArray = customizeArray;
function mergeWithRules(rules) {
    return mergeWithCustomize({
        customizeArray: function (a, b, key) {
            var currentRule = rules;
            key.split(".").forEach(function (k) {
                if (!currentRule) {
                    return;
                }
                currentRule = currentRule[k];
            });
            if (utils_1.isPlainObject(currentRule)) {
                return mergeWithRule({ currentRule: currentRule, a: a, b: b });
            }
            if (typeof currentRule === "string") {
                return mergeIndividualRule({ currentRule: currentRule, a: a, b: b });
            }
            return undefined;
        }
    });
}
exports.mergeWithRules = mergeWithRules;
var isArray = Array.isArray;
function mergeWithRule(_a) {
    var currentRule = _a.currentRule, a = _a.a, b = _a.b;
    if (!isArray(a)) {
        return a;
    }
    var bAllMatches = [];
    var ret = a.map(function (ao) {
        if (!utils_1.isPlainObject(currentRule)) {
            return ao;
        }
        var ret = {};
        var rulesToMatch = [];
        var operations = {};
        Object.entries(currentRule).forEach(function (_a) {
            var _b = __read(_a, 2), k = _b[0], v = _b[1];
            if (v === types_1.CustomizeRule.Match) {
                rulesToMatch.push(k);
            }
            else {
                operations[k] = v;
            }
        });
        var bMatches = b.filter(function (o) {
            var matches = rulesToMatch.every(function (rule) { var _a, _b; return ((_a = ao[rule]) === null || _a === void 0 ? void 0 : _a.toString()) === ((_b = o[rule]) === null || _b === void 0 ? void 0 : _b.toString()); });
            if (matches) {
                bAllMatches.push(o);
            }
            return matches;
        });
        if (!utils_1.isPlainObject(ao)) {
            return ao;
        }
        Object.entries(ao).forEach(function (_a) {
            var _b = __read(_a, 2), k = _b[0], v = _b[1];
            var rule = currentRule;
            switch (currentRule[k]) {
                case types_1.CustomizeRule.Match:
                    ret[k] = v;
                    Object.entries(rule).forEach(function (_a) {
                        var _b = __read(_a, 2), k = _b[0], v = _b[1];
                        if (v === types_1.CustomizeRule.Replace && bMatches.length > 0) {
                            var val = last(bMatches)[k];
                            if (typeof val !== "undefined") {
                                ret[k] = val;
                            }
                        }
                    });
                    break;
                case types_1.CustomizeRule.Append:
                    if (!bMatches.length) {
                        ret[k] = v;
                        break;
                    }
                    var appendValue = last(bMatches)[k];
                    if (!isArray(v) || !isArray(appendValue)) {
                        throw new TypeError("Trying to append non-arrays");
                    }
                    ret[k] = v.concat(appendValue);
                    break;
                case types_1.CustomizeRule.Merge:
                    if (!bMatches.length) {
                        ret[k] = v;
                        break;
                    }
                    var lastValue = last(bMatches)[k];
                    if (!utils_1.isPlainObject(v) || !utils_1.isPlainObject(lastValue)) {
                        throw new TypeError("Trying to merge non-objects");
                    }
                    // deep merge
                    ret[k] = merge(v, lastValue);
                    break;
                case types_1.CustomizeRule.Prepend:
                    if (!bMatches.length) {
                        ret[k] = v;
                        break;
                    }
                    var prependValue = last(bMatches)[k];
                    if (!isArray(v) || !isArray(prependValue)) {
                        throw new TypeError("Trying to prepend non-arrays");
                    }
                    ret[k] = prependValue.concat(v);
                    break;
                case types_1.CustomizeRule.Replace:
                    ret[k] = bMatches.length > 0 ? last(bMatches)[k] : v;
                    break;
                default:
                    var currentRule_1 = operations[k];
                    // Use .flat(); starting from Node 12
                    var b_1 = bMatches
                        .map(function (o) { return o[k]; })
                        .reduce(function (acc, val) {
                        return isArray(acc) && isArray(val) ? __spreadArray(__spreadArray([], __read(acc)), __read(val)) : acc;
                    }, []);
                    ret[k] = mergeWithRule({ currentRule: currentRule_1, a: v, b: b_1 });
                    break;
            }
        });
        return ret;
    });
    return ret.concat(b.filter(function (o) { return !bAllMatches.includes(o); }));
}
function mergeIndividualRule(_a) {
    var currentRule = _a.currentRule, a = _a.a, b = _a.b;
    // What if there's no match?
    switch (currentRule) {
        case types_1.CustomizeRule.Append:
            return a.concat(b);
        case types_1.CustomizeRule.Prepend:
            return b.concat(a);
        case types_1.CustomizeRule.Replace:
            return b;
    }
    return a;
}
function last(arr) {
    return arr[arr.length - 1];
}
function customizeObject(rules) {
    return function (a, b, key) {
        switch (rules[key]) {
            case types_1.CustomizeRule.Prepend:
                return merge_with_1["default"]([b, a], join_arrays_1["default"]());
            case types_1.CustomizeRule.Replace:
                return b;
            case types_1.CustomizeRule.Append:
                return merge_with_1["default"]([a, b], join_arrays_1["default"]());
        }
    };
}
exports.customizeObject = customizeObject;
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "./node_modules/webpack-merge/dist/join-arrays.js":
/*!********************************************************!*\
  !*** ./node_modules/webpack-merge/dist/join-arrays.js ***!
  \********************************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var clone_deep_1 = __importDefault(__webpack_require__(/*! clone-deep */ "./node_modules/clone-deep/index.js"));
var merge_with_1 = __importDefault(__webpack_require__(/*! ./merge-with */ "./node_modules/webpack-merge/dist/merge-with.js"));
var utils_1 = __webpack_require__(/*! ./utils */ "./node_modules/webpack-merge/dist/utils.js");
var isArray = Array.isArray;
function joinArrays(_a) {
    var _b = _a === void 0 ? {} : _a, customizeArray = _b.customizeArray, customizeObject = _b.customizeObject, key = _b.key;
    return function _joinArrays(a, b, k) {
        var newKey = key ? key + "." + k : k;
        if (utils_1.isFunction(a) && utils_1.isFunction(b)) {
            return function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return _joinArrays(a.apply(void 0, __spreadArray([], __read(args))), b.apply(void 0, __spreadArray([], __read(args))), k);
            };
        }
        if (isArray(a) && isArray(b)) {
            var customResult = customizeArray && customizeArray(a, b, newKey);
            return customResult || __spreadArray(__spreadArray([], __read(a)), __read(b));
        }
        if (utils_1.isRegex(b)) {
            return b;
        }
        if (utils_1.isPlainObject(a) && utils_1.isPlainObject(b)) {
            var customResult = customizeObject && customizeObject(a, b, newKey);
            return (customResult ||
                merge_with_1["default"]([a, b], joinArrays({
                    customizeArray: customizeArray,
                    customizeObject: customizeObject,
                    key: newKey
                })));
        }
        if (utils_1.isPlainObject(b)) {
            return clone_deep_1["default"](b);
        }
        if (isArray(b)) {
            return __spreadArray([], __read(b));
        }
        return b;
    };
}
exports["default"] = joinArrays;
//# sourceMappingURL=join-arrays.js.map

/***/ }),

/***/ "./node_modules/webpack-merge/dist/merge-with.js":
/*!*******************************************************!*\
  !*** ./node_modules/webpack-merge/dist/merge-with.js ***!
  \*******************************************************/
/***/ (function(__unused_webpack_module, exports) {

"use strict";

var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
exports.__esModule = true;
function mergeWith(objects, customizer) {
    var _a = __read(objects), first = _a[0], rest = _a.slice(1);
    var ret = first;
    rest.forEach(function (a) {
        ret = mergeTo(ret, a, customizer);
    });
    return ret;
}
function mergeTo(a, b, customizer) {
    var ret = {};
    Object.keys(a)
        .concat(Object.keys(b))
        .forEach(function (k) {
        var v = customizer(a[k], b[k], k);
        ret[k] = typeof v === "undefined" ? a[k] : v;
    });
    return ret;
}
exports["default"] = mergeWith;
//# sourceMappingURL=merge-with.js.map

/***/ }),

/***/ "./node_modules/webpack-merge/dist/types.js":
/*!**************************************************!*\
  !*** ./node_modules/webpack-merge/dist/types.js ***!
  \**************************************************/
/***/ (function(__unused_webpack_module, exports) {

"use strict";

exports.__esModule = true;
exports.CustomizeRule = void 0;
var CustomizeRule;
(function (CustomizeRule) {
    CustomizeRule["Match"] = "match";
    CustomizeRule["Merge"] = "merge";
    CustomizeRule["Append"] = "append";
    CustomizeRule["Prepend"] = "prepend";
    CustomizeRule["Replace"] = "replace";
})(CustomizeRule = exports.CustomizeRule || (exports.CustomizeRule = {}));
//# sourceMappingURL=types.js.map

/***/ }),

/***/ "./node_modules/webpack-merge/dist/unique.js":
/*!***************************************************!*\
  !*** ./node_modules/webpack-merge/dist/unique.js ***!
  \***************************************************/
/***/ (function(__unused_webpack_module, exports) {

"use strict";

var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
exports.__esModule = true;
function mergeUnique(key, uniques, getter) {
    var uniquesSet = new Set(uniques);
    return function (a, b, k) {
        return (k === key) && Array.from(__spreadArray(__spreadArray([], __read(a)), __read(b)).map(function (it) { return ({ key: getter(it), value: it }); })
            .map(function (_a) {
            var key = _a.key, value = _a.value;
            return ({ key: (uniquesSet.has(key) ? key : value), value: value });
        })
            .reduce(function (m, _a) {
            var key = _a.key, value = _a.value;
            m["delete"](key); // This is required to preserve backward compatible order of elements after a merge.
            return m.set(key, value);
        }, new Map())
            .values());
    };
}
exports["default"] = mergeUnique;
//# sourceMappingURL=unique.js.map

/***/ }),

/***/ "./node_modules/webpack-merge/dist/utils.js":
/*!**************************************************!*\
  !*** ./node_modules/webpack-merge/dist/utils.js ***!
  \**************************************************/
/***/ (function(__unused_webpack_module, exports) {

"use strict";

exports.__esModule = true;
exports.isUndefined = exports.isPlainObject = exports.isFunction = exports.isRegex = void 0;
function isRegex(o) {
    return o instanceof RegExp;
}
exports.isRegex = isRegex;
// https://stackoverflow.com/a/7356528/228885
function isFunction(functionToCheck) {
    return (functionToCheck && {}.toString.call(functionToCheck) === "[object Function]");
}
exports.isFunction = isFunction;
function isPlainObject(a) {
    if (a === null || Array.isArray(a)) {
        return false;
    }
    return typeof a === "object";
}
exports.isPlainObject = isPlainObject;
function isUndefined(a) {
    return typeof a === "undefined";
}
exports.isUndefined = isUndefined;
//# sourceMappingURL=utils.js.map

/***/ }),

/***/ "./node_modules/wildcard/index.js":
/*!****************************************!*\
  !*** ./node_modules/wildcard/index.js ***!
  \****************************************/
/***/ (function(module) {

"use strict";
/* jshint node: true */


var REGEXP_PARTS = /(\*|\?)/g;

/**
  # wildcard

  Very simple wildcard matching, which is designed to provide the same
  functionality that is found in the
  [eve](https://github.com/adobe-webplatform/eve) eventing library.

  ## Usage

  It works with strings:

  <<< examples/strings.js

  Arrays:

  <<< examples/arrays.js

  Objects (matching against keys):

  <<< examples/objects.js

  ## Alternative Implementations

  - <https://github.com/isaacs/node-glob>

    Great for full file-based wildcard matching.

  - <https://github.com/sindresorhus/matcher>

     A well cared for and loved JS wildcard matcher.
**/

function WildcardMatcher(text, separator) {
  this.text = text = text || '';
  this.hasWild = text.indexOf('*') >= 0;
  this.separator = separator;
  this.parts = text.split(separator).map(this.classifyPart.bind(this));
}

WildcardMatcher.prototype.match = function(input) {
  var matches = true;
  var parts = this.parts;
  var ii;
  var partsCount = parts.length;
  var testParts;

  if (typeof input == 'string' || input instanceof String) {
    if (!this.hasWild && this.text != input) {
      matches = false;
    } else {
      testParts = (input || '').split(this.separator);
      for (ii = 0; matches && ii < partsCount; ii++) {
        if (parts[ii] === '*')  {
          continue;
        } else if (ii < testParts.length) {
          matches = parts[ii] instanceof RegExp
            ? parts[ii].test(testParts[ii])
            : parts[ii] === testParts[ii];
        } else {
          matches = false;
        }
      }

      // If matches, then return the component parts
      matches = matches && testParts;
    }
  }
  else if (typeof input.splice == 'function') {
    matches = [];

    for (ii = input.length; ii--; ) {
      if (this.match(input[ii])) {
        matches[matches.length] = input[ii];
      }
    }
  }
  else if (typeof input == 'object') {
    matches = {};

    for (var key in input) {
      if (this.match(key)) {
        matches[key] = input[key];
      }
    }
  }

  return matches;
};

WildcardMatcher.prototype.classifyPart = function(part) {
  // in the event that we have been provided a part that is not just a wildcard
  // then turn this into a regular expression for matching purposes
  if (part === '*') {
    return part;
  } else if (part.indexOf('*') >= 0 || part.indexOf('?') >= 0) {
    return new RegExp(part.replace(REGEXP_PARTS, '\.$1'));
  }

  return part;
};

module.exports = function(text, test, separator) {
  var matcher = new WildcardMatcher(text, separator || /[\/\.]/);
  if (typeof test != 'undefined') {
    return matcher.match(test);
  }

  return matcher;
};


/***/ }),

/***/ "./node_modules/d3-delaunay/src/delaunay.js":
/*!**************************************************!*\
  !*** ./node_modules/d3-delaunay/src/delaunay.js ***!
  \**************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ Delaunay; }
/* harmony export */ });
/* harmony import */ var delaunator__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! delaunator */ "./node_modules/delaunator/index.js");
/* harmony import */ var _path_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./path.js */ "./node_modules/d3-delaunay/src/path.js");
/* harmony import */ var _polygon_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./polygon.js */ "./node_modules/d3-delaunay/src/polygon.js");
/* harmony import */ var _voronoi_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./voronoi.js */ "./node_modules/d3-delaunay/src/voronoi.js");





const tau = 2 * Math.PI, pow = Math.pow;

function pointX(p) {
  return p[0];
}

function pointY(p) {
  return p[1];
}

// A triangulation is collinear if all its triangles have a non-null area
function collinear(d) {
  const {triangles, coords} = d;
  for (let i = 0; i < triangles.length; i += 3) {
    const a = 2 * triangles[i],
          b = 2 * triangles[i + 1],
          c = 2 * triangles[i + 2],
          cross = (coords[c] - coords[a]) * (coords[b + 1] - coords[a + 1])
                - (coords[b] - coords[a]) * (coords[c + 1] - coords[a + 1]);
    if (cross > 1e-10) return false;
  }
  return true;
}

function jitter(x, y, r) {
  return [x + Math.sin(x + y) * r, y + Math.cos(x - y) * r];
}

class Delaunay {
  static from(points, fx = pointX, fy = pointY, that) {
    return new Delaunay("length" in points
        ? flatArray(points, fx, fy, that)
        : Float64Array.from(flatIterable(points, fx, fy, that)));
  }
  constructor(points) {
    this._delaunator = new delaunator__WEBPACK_IMPORTED_MODULE_0__["default"](points);
    this.inedges = new Int32Array(points.length / 2);
    this._hullIndex = new Int32Array(points.length / 2);
    this.points = this._delaunator.coords;
    this._init();
  }
  update() {
    this._delaunator.update();
    this._init();
    return this;
  }
  _init() {
    const d = this._delaunator, points = this.points;

    // check for collinear
    if (d.hull && d.hull.length > 2 && collinear(d)) {
      this.collinear = Int32Array.from({length: points.length/2}, (_,i) => i)
        .sort((i, j) => points[2 * i] - points[2 * j] || points[2 * i + 1] - points[2 * j + 1]); // for exact neighbors
      const e = this.collinear[0], f = this.collinear[this.collinear.length - 1],
        bounds = [ points[2 * e], points[2 * e + 1], points[2 * f], points[2 * f + 1] ],
        r = 1e-8 * Math.hypot(bounds[3] - bounds[1], bounds[2] - bounds[0]);
      for (let i = 0, n = points.length / 2; i < n; ++i) {
        const p = jitter(points[2 * i], points[2 * i + 1], r);
        points[2 * i] = p[0];
        points[2 * i + 1] = p[1];
      }
      this._delaunator = new delaunator__WEBPACK_IMPORTED_MODULE_0__["default"](points);
    } else {
      delete this.collinear;
    }

    const halfedges = this.halfedges = this._delaunator.halfedges;
    const hull = this.hull = this._delaunator.hull;
    const triangles = this.triangles = this._delaunator.triangles;
    const inedges = this.inedges.fill(-1);
    const hullIndex = this._hullIndex.fill(-1);

    // Compute an index from each point to an (arbitrary) incoming halfedge
    // Used to give the first neighbor of each point; for this reason,
    // on the hull we give priority to exterior halfedges
    for (let e = 0, n = halfedges.length; e < n; ++e) {
      const p = triangles[e % 3 === 2 ? e - 2 : e + 1];
      if (halfedges[e] === -1 || inedges[p] === -1) inedges[p] = e;
    }
    for (let i = 0, n = hull.length; i < n; ++i) {
      hullIndex[hull[i]] = i;
    }

    // degenerate case: 1 or 2 (distinct) points
    if (hull.length <= 2 && hull.length > 0) {
      this.triangles = new Int32Array(3).fill(-1);
      this.halfedges = new Int32Array(3).fill(-1);
      this.triangles[0] = hull[0];
      inedges[hull[0]] = 1;
      if (hull.length === 2) {
        inedges[hull[1]] = 0;
        this.triangles[1] = hull[1];
        this.triangles[2] = hull[1];
      }
    }
  }
  voronoi(bounds) {
    return new _voronoi_js__WEBPACK_IMPORTED_MODULE_1__["default"](this, bounds);
  }
  *neighbors(i) {
    const {inedges, hull, _hullIndex, halfedges, triangles, collinear} = this;

    // degenerate case with several collinear points
    if (collinear) {
      const l = collinear.indexOf(i);
      if (l > 0) yield collinear[l - 1];
      if (l < collinear.length - 1) yield collinear[l + 1];
      return;
    }

    const e0 = inedges[i];
    if (e0 === -1) return; // coincident point
    let e = e0, p0 = -1;
    do {
      yield p0 = triangles[e];
      e = e % 3 === 2 ? e - 2 : e + 1;
      if (triangles[e] !== i) return; // bad triangulation
      e = halfedges[e];
      if (e === -1) {
        const p = hull[(_hullIndex[i] + 1) % hull.length];
        if (p !== p0) yield p;
        return;
      }
    } while (e !== e0);
  }
  find(x, y, i = 0) {
    if ((x = +x, x !== x) || (y = +y, y !== y)) return -1;
    const i0 = i;
    let c;
    while ((c = this._step(i, x, y)) >= 0 && c !== i && c !== i0) i = c;
    return c;
  }
  _step(i, x, y) {
    const {inedges, hull, _hullIndex, halfedges, triangles, points} = this;
    if (inedges[i] === -1 || !points.length) return (i + 1) % (points.length >> 1);
    let c = i;
    let dc = pow(x - points[i * 2], 2) + pow(y - points[i * 2 + 1], 2);
    const e0 = inedges[i];
    let e = e0;
    do {
      let t = triangles[e];
      const dt = pow(x - points[t * 2], 2) + pow(y - points[t * 2 + 1], 2);
      if (dt < dc) dc = dt, c = t;
      e = e % 3 === 2 ? e - 2 : e + 1;
      if (triangles[e] !== i) break; // bad triangulation
      e = halfedges[e];
      if (e === -1) {
        e = hull[(_hullIndex[i] + 1) % hull.length];
        if (e !== t) {
          if (pow(x - points[e * 2], 2) + pow(y - points[e * 2 + 1], 2) < dc) return e;
        }
        break;
      }
    } while (e !== e0);
    return c;
  }
  render(context) {
    const buffer = context == null ? context = new _path_js__WEBPACK_IMPORTED_MODULE_2__["default"] : undefined;
    const {points, halfedges, triangles} = this;
    for (let i = 0, n = halfedges.length; i < n; ++i) {
      const j = halfedges[i];
      if (j < i) continue;
      const ti = triangles[i] * 2;
      const tj = triangles[j] * 2;
      context.moveTo(points[ti], points[ti + 1]);
      context.lineTo(points[tj], points[tj + 1]);
    }
    this.renderHull(context);
    return buffer && buffer.value();
  }
  renderPoints(context, r) {
    if (r === undefined && (!context || typeof context.moveTo !== "function")) r = context, context = null;
    r = r == undefined ? 2 : +r;
    const buffer = context == null ? context = new _path_js__WEBPACK_IMPORTED_MODULE_2__["default"] : undefined;
    const {points} = this;
    for (let i = 0, n = points.length; i < n; i += 2) {
      const x = points[i], y = points[i + 1];
      context.moveTo(x + r, y);
      context.arc(x, y, r, 0, tau);
    }
    return buffer && buffer.value();
  }
  renderHull(context) {
    const buffer = context == null ? context = new _path_js__WEBPACK_IMPORTED_MODULE_2__["default"] : undefined;
    const {hull, points} = this;
    const h = hull[0] * 2, n = hull.length;
    context.moveTo(points[h], points[h + 1]);
    for (let i = 1; i < n; ++i) {
      const h = 2 * hull[i];
      context.lineTo(points[h], points[h + 1]);
    }
    context.closePath();
    return buffer && buffer.value();
  }
  hullPolygon() {
    const polygon = new _polygon_js__WEBPACK_IMPORTED_MODULE_3__["default"];
    this.renderHull(polygon);
    return polygon.value();
  }
  renderTriangle(i, context) {
    const buffer = context == null ? context = new _path_js__WEBPACK_IMPORTED_MODULE_2__["default"] : undefined;
    const {points, triangles} = this;
    const t0 = triangles[i *= 3] * 2;
    const t1 = triangles[i + 1] * 2;
    const t2 = triangles[i + 2] * 2;
    context.moveTo(points[t0], points[t0 + 1]);
    context.lineTo(points[t1], points[t1 + 1]);
    context.lineTo(points[t2], points[t2 + 1]);
    context.closePath();
    return buffer && buffer.value();
  }
  *trianglePolygons() {
    const {triangles} = this;
    for (let i = 0, n = triangles.length / 3; i < n; ++i) {
      yield this.trianglePolygon(i);
    }
  }
  trianglePolygon(i) {
    const polygon = new _polygon_js__WEBPACK_IMPORTED_MODULE_3__["default"];
    this.renderTriangle(i, polygon);
    return polygon.value();
  }
}

function flatArray(points, fx, fy, that) {
  const n = points.length;
  const array = new Float64Array(n * 2);
  for (let i = 0; i < n; ++i) {
    const p = points[i];
    array[i * 2] = fx.call(that, p, i, points);
    array[i * 2 + 1] = fy.call(that, p, i, points);
  }
  return array;
}

function* flatIterable(points, fx, fy, that) {
  let i = 0;
  for (const p of points) {
    yield fx.call(that, p, i, points);
    yield fy.call(that, p, i, points);
    ++i;
  }
}


/***/ }),

/***/ "./node_modules/d3-delaunay/src/path.js":
/*!**********************************************!*\
  !*** ./node_modules/d3-delaunay/src/path.js ***!
  \**********************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ Path; }
/* harmony export */ });
const epsilon = 1e-6;

class Path {
  constructor() {
    this._x0 = this._y0 = // start of current subpath
    this._x1 = this._y1 = null; // end of current subpath
    this._ = "";
  }
  moveTo(x, y) {
    this._ += `M${this._x0 = this._x1 = +x},${this._y0 = this._y1 = +y}`;
  }
  closePath() {
    if (this._x1 !== null) {
      this._x1 = this._x0, this._y1 = this._y0;
      this._ += "Z";
    }
  }
  lineTo(x, y) {
    this._ += `L${this._x1 = +x},${this._y1 = +y}`;
  }
  arc(x, y, r) {
    x = +x, y = +y, r = +r;
    const x0 = x + r;
    const y0 = y;
    if (r < 0) throw new Error("negative radius");
    if (this._x1 === null) this._ += `M${x0},${y0}`;
    else if (Math.abs(this._x1 - x0) > epsilon || Math.abs(this._y1 - y0) > epsilon) this._ += "L" + x0 + "," + y0;
    if (!r) return;
    this._ += `A${r},${r},0,1,1,${x - r},${y}A${r},${r},0,1,1,${this._x1 = x0},${this._y1 = y0}`;
  }
  rect(x, y, w, h) {
    this._ += `M${this._x0 = this._x1 = +x},${this._y0 = this._y1 = +y}h${+w}v${+h}h${-w}Z`;
  }
  value() {
    return this._ || null;
  }
}


/***/ }),

/***/ "./node_modules/d3-delaunay/src/polygon.js":
/*!*************************************************!*\
  !*** ./node_modules/d3-delaunay/src/polygon.js ***!
  \*************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ Polygon; }
/* harmony export */ });
class Polygon {
  constructor() {
    this._ = [];
  }
  moveTo(x, y) {
    this._.push([x, y]);
  }
  closePath() {
    this._.push(this._[0].slice());
  }
  lineTo(x, y) {
    this._.push([x, y]);
  }
  value() {
    return this._.length ? this._ : null;
  }
}


/***/ }),

/***/ "./node_modules/d3-delaunay/src/voronoi.js":
/*!*************************************************!*\
  !*** ./node_modules/d3-delaunay/src/voronoi.js ***!
  \*************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ Voronoi; }
/* harmony export */ });
/* harmony import */ var _path_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./path.js */ "./node_modules/d3-delaunay/src/path.js");
/* harmony import */ var _polygon_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./polygon.js */ "./node_modules/d3-delaunay/src/polygon.js");



class Voronoi {
  constructor(delaunay, [xmin, ymin, xmax, ymax] = [0, 0, 960, 500]) {
    if (!((xmax = +xmax) >= (xmin = +xmin)) || !((ymax = +ymax) >= (ymin = +ymin))) throw new Error("invalid bounds");
    this.delaunay = delaunay;
    this._circumcenters = new Float64Array(delaunay.points.length * 2);
    this.vectors = new Float64Array(delaunay.points.length * 2);
    this.xmax = xmax, this.xmin = xmin;
    this.ymax = ymax, this.ymin = ymin;
    this._init();
  }
  update() {
    this.delaunay.update();
    this._init();
    return this;
  }
  _init() {
    const {delaunay: {points, hull, triangles}, vectors} = this;
    let bx, by; // lazily computed barycenter of the hull

    // Compute circumcenters.
    const circumcenters = this.circumcenters = this._circumcenters.subarray(0, triangles.length / 3 * 2);
    for (let i = 0, j = 0, n = triangles.length, x, y; i < n; i += 3, j += 2) {
      const t1 = triangles[i] * 2;
      const t2 = triangles[i + 1] * 2;
      const t3 = triangles[i + 2] * 2;
      const x1 = points[t1];
      const y1 = points[t1 + 1];
      const x2 = points[t2];
      const y2 = points[t2 + 1];
      const x3 = points[t3];
      const y3 = points[t3 + 1];

      const dx = x2 - x1;
      const dy = y2 - y1;
      const ex = x3 - x1;
      const ey = y3 - y1;
      const ab = (dx * ey - dy * ex) * 2;

      if (Math.abs(ab) < 1e-9) {
        // For a degenerate triangle, the circumcenter is at the infinity, in a
        // direction orthogonal to the halfedge and away from the “center” of
        // the diagram <bx, by>, defined as the hull’s barycenter.
        if (bx === undefined) {
          bx = by = 0;
          for (const i of hull) bx += points[i * 2], by += points[i * 2 + 1];
          bx /= hull.length, by /= hull.length;
        }
        const a = 1e9 * Math.sign((bx - x1) * ey - (by - y1) * ex);
        x = (x1 + x3) / 2 - a * ey;
        y = (y1 + y3) / 2 + a * ex;
      } else {
        const d = 1 / ab;
        const bl = dx * dx + dy * dy;
        const cl = ex * ex + ey * ey;
        x = x1 + (ey * bl - dy * cl) * d;
        y = y1 + (dx * cl - ex * bl) * d;
      }
      circumcenters[j] = x;
      circumcenters[j + 1] = y;
    }

    // Compute exterior cell rays.
    let h = hull[hull.length - 1];
    let p0, p1 = h * 4;
    let x0, x1 = points[2 * h];
    let y0, y1 = points[2 * h + 1];
    vectors.fill(0);
    for (let i = 0; i < hull.length; ++i) {
      h = hull[i];
      p0 = p1, x0 = x1, y0 = y1;
      p1 = h * 4, x1 = points[2 * h], y1 = points[2 * h + 1];
      vectors[p0 + 2] = vectors[p1] = y0 - y1;
      vectors[p0 + 3] = vectors[p1 + 1] = x1 - x0;
    }
  }
  render(context) {
    const buffer = context == null ? context = new _path_js__WEBPACK_IMPORTED_MODULE_0__["default"] : undefined;
    const {delaunay: {halfedges, inedges, hull}, circumcenters, vectors} = this;
    if (hull.length <= 1) return null;
    for (let i = 0, n = halfedges.length; i < n; ++i) {
      const j = halfedges[i];
      if (j < i) continue;
      const ti = Math.floor(i / 3) * 2;
      const tj = Math.floor(j / 3) * 2;
      const xi = circumcenters[ti];
      const yi = circumcenters[ti + 1];
      const xj = circumcenters[tj];
      const yj = circumcenters[tj + 1];
      this._renderSegment(xi, yi, xj, yj, context);
    }
    let h0, h1 = hull[hull.length - 1];
    for (let i = 0; i < hull.length; ++i) {
      h0 = h1, h1 = hull[i];
      const t = Math.floor(inedges[h1] / 3) * 2;
      const x = circumcenters[t];
      const y = circumcenters[t + 1];
      const v = h0 * 4;
      const p = this._project(x, y, vectors[v + 2], vectors[v + 3]);
      if (p) this._renderSegment(x, y, p[0], p[1], context);
    }
    return buffer && buffer.value();
  }
  renderBounds(context) {
    const buffer = context == null ? context = new _path_js__WEBPACK_IMPORTED_MODULE_0__["default"] : undefined;
    context.rect(this.xmin, this.ymin, this.xmax - this.xmin, this.ymax - this.ymin);
    return buffer && buffer.value();
  }
  renderCell(i, context) {
    const buffer = context == null ? context = new _path_js__WEBPACK_IMPORTED_MODULE_0__["default"] : undefined;
    const points = this._clip(i);
    if (points === null || !points.length) return;
    context.moveTo(points[0], points[1]);
    let n = points.length;
    while (points[0] === points[n-2] && points[1] === points[n-1] && n > 1) n -= 2;
    for (let i = 2; i < n; i += 2) {
      if (points[i] !== points[i-2] || points[i+1] !== points[i-1])
        context.lineTo(points[i], points[i + 1]);
    }
    context.closePath();
    return buffer && buffer.value();
  }
  *cellPolygons() {
    const {delaunay: {points}} = this;
    for (let i = 0, n = points.length / 2; i < n; ++i) {
      const cell = this.cellPolygon(i);
      if (cell) cell.index = i, yield cell;
    }
  }
  cellPolygon(i) {
    const polygon = new _polygon_js__WEBPACK_IMPORTED_MODULE_1__["default"];
    this.renderCell(i, polygon);
    return polygon.value();
  }
  _renderSegment(x0, y0, x1, y1, context) {
    let S;
    const c0 = this._regioncode(x0, y0);
    const c1 = this._regioncode(x1, y1);
    if (c0 === 0 && c1 === 0) {
      context.moveTo(x0, y0);
      context.lineTo(x1, y1);
    } else if (S = this._clipSegment(x0, y0, x1, y1, c0, c1)) {
      context.moveTo(S[0], S[1]);
      context.lineTo(S[2], S[3]);
    }
  }
  contains(i, x, y) {
    if ((x = +x, x !== x) || (y = +y, y !== y)) return false;
    return this.delaunay._step(i, x, y) === i;
  }
  *neighbors(i) {
    const ci = this._clip(i);
    if (ci) for (const j of this.delaunay.neighbors(i)) {
      const cj = this._clip(j);
      // find the common edge
      if (cj) loop: for (let ai = 0, li = ci.length; ai < li; ai += 2) {
        for (let aj = 0, lj = cj.length; aj < lj; aj += 2) {
          if (ci[ai] === cj[aj]
              && ci[ai + 1] === cj[aj + 1]
              && ci[(ai + 2) % li] === cj[(aj + lj - 2) % lj]
              && ci[(ai + 3) % li] === cj[(aj + lj - 1) % lj]) {
            yield j;
            break loop;
          }
        }
      }
    }
  }
  _cell(i) {
    const {circumcenters, delaunay: {inedges, halfedges, triangles}} = this;
    const e0 = inedges[i];
    if (e0 === -1) return null; // coincident point
    const points = [];
    let e = e0;
    do {
      const t = Math.floor(e / 3);
      points.push(circumcenters[t * 2], circumcenters[t * 2 + 1]);
      e = e % 3 === 2 ? e - 2 : e + 1;
      if (triangles[e] !== i) break; // bad triangulation
      e = halfedges[e];
    } while (e !== e0 && e !== -1);
    return points;
  }
  _clip(i) {
    // degenerate case (1 valid point: return the box)
    if (i === 0 && this.delaunay.hull.length === 1) {
      return [this.xmax, this.ymin, this.xmax, this.ymax, this.xmin, this.ymax, this.xmin, this.ymin];
    }
    const points = this._cell(i);
    if (points === null) return null;
    const {vectors: V} = this;
    const v = i * 4;
    return this._simplify(V[v] || V[v + 1]
        ? this._clipInfinite(i, points, V[v], V[v + 1], V[v + 2], V[v + 3])
        : this._clipFinite(i, points));
  }
  _clipFinite(i, points) {
    const n = points.length;
    let P = null;
    let x0, y0, x1 = points[n - 2], y1 = points[n - 1];
    let c0, c1 = this._regioncode(x1, y1);
    let e0, e1 = 0;
    for (let j = 0; j < n; j += 2) {
      x0 = x1, y0 = y1, x1 = points[j], y1 = points[j + 1];
      c0 = c1, c1 = this._regioncode(x1, y1);
      if (c0 === 0 && c1 === 0) {
        e0 = e1, e1 = 0;
        if (P) P.push(x1, y1);
        else P = [x1, y1];
      } else {
        let S, sx0, sy0, sx1, sy1;
        if (c0 === 0) {
          if ((S = this._clipSegment(x0, y0, x1, y1, c0, c1)) === null) continue;
          [sx0, sy0, sx1, sy1] = S;
        } else {
          if ((S = this._clipSegment(x1, y1, x0, y0, c1, c0)) === null) continue;
          [sx1, sy1, sx0, sy0] = S;
          e0 = e1, e1 = this._edgecode(sx0, sy0);
          if (e0 && e1) this._edge(i, e0, e1, P, P.length);
          if (P) P.push(sx0, sy0);
          else P = [sx0, sy0];
        }
        e0 = e1, e1 = this._edgecode(sx1, sy1);
        if (e0 && e1) this._edge(i, e0, e1, P, P.length);
        if (P) P.push(sx1, sy1);
        else P = [sx1, sy1];
      }
    }
    if (P) {
      e0 = e1, e1 = this._edgecode(P[0], P[1]);
      if (e0 && e1) this._edge(i, e0, e1, P, P.length);
    } else if (this.contains(i, (this.xmin + this.xmax) / 2, (this.ymin + this.ymax) / 2)) {
      return [this.xmax, this.ymin, this.xmax, this.ymax, this.xmin, this.ymax, this.xmin, this.ymin];
    }
    return P;
  }
  _clipSegment(x0, y0, x1, y1, c0, c1) {
    // for more robustness, always consider the segment in the same order
    const flip = c0 < c1;
    if (flip) [x0, y0, x1, y1, c0, c1] = [x1, y1, x0, y0, c1, c0];
    while (true) {
      if (c0 === 0 && c1 === 0) return flip ? [x1, y1, x0, y0] : [x0, y0, x1, y1];
      if (c0 & c1) return null;
      let x, y, c = c0 || c1;
      if (c & 0b1000) x = x0 + (x1 - x0) * (this.ymax - y0) / (y1 - y0), y = this.ymax;
      else if (c & 0b0100) x = x0 + (x1 - x0) * (this.ymin - y0) / (y1 - y0), y = this.ymin;
      else if (c & 0b0010) y = y0 + (y1 - y0) * (this.xmax - x0) / (x1 - x0), x = this.xmax;
      else y = y0 + (y1 - y0) * (this.xmin - x0) / (x1 - x0), x = this.xmin;
      if (c0) x0 = x, y0 = y, c0 = this._regioncode(x0, y0);
      else x1 = x, y1 = y, c1 = this._regioncode(x1, y1);
    }
  }
  _clipInfinite(i, points, vx0, vy0, vxn, vyn) {
    let P = Array.from(points), p;
    if (p = this._project(P[0], P[1], vx0, vy0)) P.unshift(p[0], p[1]);
    if (p = this._project(P[P.length - 2], P[P.length - 1], vxn, vyn)) P.push(p[0], p[1]);
    if (P = this._clipFinite(i, P)) {
      for (let j = 0, n = P.length, c0, c1 = this._edgecode(P[n - 2], P[n - 1]); j < n; j += 2) {
        c0 = c1, c1 = this._edgecode(P[j], P[j + 1]);
        if (c0 && c1) j = this._edge(i, c0, c1, P, j), n = P.length;
      }
    } else if (this.contains(i, (this.xmin + this.xmax) / 2, (this.ymin + this.ymax) / 2)) {
      P = [this.xmin, this.ymin, this.xmax, this.ymin, this.xmax, this.ymax, this.xmin, this.ymax];
    }
    return P;
  }
  _edge(i, e0, e1, P, j) {
    while (e0 !== e1) {
      let x, y;
      switch (e0) {
        case 0b0101: e0 = 0b0100; continue; // top-left
        case 0b0100: e0 = 0b0110, x = this.xmax, y = this.ymin; break; // top
        case 0b0110: e0 = 0b0010; continue; // top-right
        case 0b0010: e0 = 0b1010, x = this.xmax, y = this.ymax; break; // right
        case 0b1010: e0 = 0b1000; continue; // bottom-right
        case 0b1000: e0 = 0b1001, x = this.xmin, y = this.ymax; break; // bottom
        case 0b1001: e0 = 0b0001; continue; // bottom-left
        case 0b0001: e0 = 0b0101, x = this.xmin, y = this.ymin; break; // left
      }
      // Note: this implicitly checks for out of bounds: if P[j] or P[j+1] are
      // undefined, the conditional statement will be executed.
      if ((P[j] !== x || P[j + 1] !== y) && this.contains(i, x, y)) {
        P.splice(j, 0, x, y), j += 2;
      }
    }
    return j;
  }
  _project(x0, y0, vx, vy) {
    let t = Infinity, c, x, y;
    if (vy < 0) { // top
      if (y0 <= this.ymin) return null;
      if ((c = (this.ymin - y0) / vy) < t) y = this.ymin, x = x0 + (t = c) * vx;
    } else if (vy > 0) { // bottom
      if (y0 >= this.ymax) return null;
      if ((c = (this.ymax - y0) / vy) < t) y = this.ymax, x = x0 + (t = c) * vx;
    }
    if (vx > 0) { // right
      if (x0 >= this.xmax) return null;
      if ((c = (this.xmax - x0) / vx) < t) x = this.xmax, y = y0 + (t = c) * vy;
    } else if (vx < 0) { // left
      if (x0 <= this.xmin) return null;
      if ((c = (this.xmin - x0) / vx) < t) x = this.xmin, y = y0 + (t = c) * vy;
    }
    return [x, y];
  }
  _edgecode(x, y) {
    return (x === this.xmin ? 0b0001
        : x === this.xmax ? 0b0010 : 0b0000)
        | (y === this.ymin ? 0b0100
        : y === this.ymax ? 0b1000 : 0b0000);
  }
  _regioncode(x, y) {
    return (x < this.xmin ? 0b0001
        : x > this.xmax ? 0b0010 : 0b0000)
        | (y < this.ymin ? 0b0100
        : y > this.ymax ? 0b1000 : 0b0000);
  }
  _simplify(P) {
    if (P && P.length > 4) {
      for (let i = 0; i < P.length; i+= 2) {
        const j = (i + 2) % P.length, k = (i + 4) % P.length;
        if (P[i] === P[j] && P[j] === P[k] || P[i + 1] === P[j + 1] && P[j + 1] === P[k + 1]) {
          P.splice(j, 2), i -= 2;
        }
      }
      if (!P.length) P = null;
    }
    return P;
  }
}


/***/ }),

/***/ "./node_modules/delaunator/index.js":
/*!******************************************!*\
  !*** ./node_modules/delaunator/index.js ***!
  \******************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": function() { return /* binding */ Delaunator; }
/* harmony export */ });
/* harmony import */ var robust_predicates__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! robust-predicates */ "./node_modules/robust-predicates/index.js");

const EPSILON = Math.pow(2, -52);
const EDGE_STACK = new Uint32Array(512);



class Delaunator {

    static from(points, getX = defaultGetX, getY = defaultGetY) {
        const n = points.length;
        const coords = new Float64Array(n * 2);

        for (let i = 0; i < n; i++) {
            const p = points[i];
            coords[2 * i] = getX(p);
            coords[2 * i + 1] = getY(p);
        }

        return new Delaunator(coords);
    }

    constructor(coords) {
        const n = coords.length >> 1;
        if (n > 0 && typeof coords[0] !== 'number') throw new Error('Expected coords to contain numbers.');

        this.coords = coords;

        // arrays that will store the triangulation graph
        const maxTriangles = Math.max(2 * n - 5, 0);
        this._triangles = new Uint32Array(maxTriangles * 3);
        this._halfedges = new Int32Array(maxTriangles * 3);

        // temporary arrays for tracking the edges of the advancing convex hull
        this._hashSize = Math.ceil(Math.sqrt(n));
        this._hullPrev = new Uint32Array(n); // edge to prev edge
        this._hullNext = new Uint32Array(n); // edge to next edge
        this._hullTri = new Uint32Array(n); // edge to adjacent triangle
        this._hullHash = new Int32Array(this._hashSize).fill(-1); // angular edge hash

        // temporary arrays for sorting points
        this._ids = new Uint32Array(n);
        this._dists = new Float64Array(n);

        this.update();
    }

    update() {
        const {coords, _hullPrev: hullPrev, _hullNext: hullNext, _hullTri: hullTri, _hullHash: hullHash} =  this;
        const n = coords.length >> 1;

        // populate an array of point indices; calculate input data bbox
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        for (let i = 0; i < n; i++) {
            const x = coords[2 * i];
            const y = coords[2 * i + 1];
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
            this._ids[i] = i;
        }
        const cx = (minX + maxX) / 2;
        const cy = (minY + maxY) / 2;

        let minDist = Infinity;
        let i0, i1, i2;

        // pick a seed point close to the center
        for (let i = 0; i < n; i++) {
            const d = dist(cx, cy, coords[2 * i], coords[2 * i + 1]);
            if (d < minDist) {
                i0 = i;
                minDist = d;
            }
        }
        const i0x = coords[2 * i0];
        const i0y = coords[2 * i0 + 1];

        minDist = Infinity;

        // find the point closest to the seed
        for (let i = 0; i < n; i++) {
            if (i === i0) continue;
            const d = dist(i0x, i0y, coords[2 * i], coords[2 * i + 1]);
            if (d < minDist && d > 0) {
                i1 = i;
                minDist = d;
            }
        }
        let i1x = coords[2 * i1];
        let i1y = coords[2 * i1 + 1];

        let minRadius = Infinity;

        // find the third point which forms the smallest circumcircle with the first two
        for (let i = 0; i < n; i++) {
            if (i === i0 || i === i1) continue;
            const r = circumradius(i0x, i0y, i1x, i1y, coords[2 * i], coords[2 * i + 1]);
            if (r < minRadius) {
                i2 = i;
                minRadius = r;
            }
        }
        let i2x = coords[2 * i2];
        let i2y = coords[2 * i2 + 1];

        if (minRadius === Infinity) {
            // order collinear points by dx (or dy if all x are identical)
            // and return the list as a hull
            for (let i = 0; i < n; i++) {
                this._dists[i] = (coords[2 * i] - coords[0]) || (coords[2 * i + 1] - coords[1]);
            }
            quicksort(this._ids, this._dists, 0, n - 1);
            const hull = new Uint32Array(n);
            let j = 0;
            for (let i = 0, d0 = -Infinity; i < n; i++) {
                const id = this._ids[i];
                if (this._dists[id] > d0) {
                    hull[j++] = id;
                    d0 = this._dists[id];
                }
            }
            this.hull = hull.subarray(0, j);
            this.triangles = new Uint32Array(0);
            this.halfedges = new Uint32Array(0);
            return;
        }

        // swap the order of the seed points for counter-clockwise orientation
        if ((0,robust_predicates__WEBPACK_IMPORTED_MODULE_0__.orient2d)(i0x, i0y, i1x, i1y, i2x, i2y) < 0) {
            const i = i1;
            const x = i1x;
            const y = i1y;
            i1 = i2;
            i1x = i2x;
            i1y = i2y;
            i2 = i;
            i2x = x;
            i2y = y;
        }

        const center = circumcenter(i0x, i0y, i1x, i1y, i2x, i2y);
        this._cx = center.x;
        this._cy = center.y;

        for (let i = 0; i < n; i++) {
            this._dists[i] = dist(coords[2 * i], coords[2 * i + 1], center.x, center.y);
        }

        // sort the points by distance from the seed triangle circumcenter
        quicksort(this._ids, this._dists, 0, n - 1);

        // set up the seed triangle as the starting hull
        this._hullStart = i0;
        let hullSize = 3;

        hullNext[i0] = hullPrev[i2] = i1;
        hullNext[i1] = hullPrev[i0] = i2;
        hullNext[i2] = hullPrev[i1] = i0;

        hullTri[i0] = 0;
        hullTri[i1] = 1;
        hullTri[i2] = 2;

        hullHash.fill(-1);
        hullHash[this._hashKey(i0x, i0y)] = i0;
        hullHash[this._hashKey(i1x, i1y)] = i1;
        hullHash[this._hashKey(i2x, i2y)] = i2;

        this.trianglesLen = 0;
        this._addTriangle(i0, i1, i2, -1, -1, -1);

        for (let k = 0, xp, yp; k < this._ids.length; k++) {
            const i = this._ids[k];
            const x = coords[2 * i];
            const y = coords[2 * i + 1];

            // skip near-duplicate points
            if (k > 0 && Math.abs(x - xp) <= EPSILON && Math.abs(y - yp) <= EPSILON) continue;
            xp = x;
            yp = y;

            // skip seed triangle points
            if (i === i0 || i === i1 || i === i2) continue;

            // find a visible edge on the convex hull using edge hash
            let start = 0;
            for (let j = 0, key = this._hashKey(x, y); j < this._hashSize; j++) {
                start = hullHash[(key + j) % this._hashSize];
                if (start !== -1 && start !== hullNext[start]) break;
            }

            start = hullPrev[start];
            let e = start, q;
            while (q = hullNext[e], (0,robust_predicates__WEBPACK_IMPORTED_MODULE_0__.orient2d)(x, y, coords[2 * e], coords[2 * e + 1], coords[2 * q], coords[2 * q + 1]) >= 0) {
                e = q;
                if (e === start) {
                    e = -1;
                    break;
                }
            }
            if (e === -1) continue; // likely a near-duplicate point; skip it

            // add the first triangle from the point
            let t = this._addTriangle(e, i, hullNext[e], -1, -1, hullTri[e]);

            // recursively flip triangles from the point until they satisfy the Delaunay condition
            hullTri[i] = this._legalize(t + 2);
            hullTri[e] = t; // keep track of boundary triangles on the hull
            hullSize++;

            // walk forward through the hull, adding more triangles and flipping recursively
            let n = hullNext[e];
            while (q = hullNext[n], (0,robust_predicates__WEBPACK_IMPORTED_MODULE_0__.orient2d)(x, y, coords[2 * n], coords[2 * n + 1], coords[2 * q], coords[2 * q + 1]) < 0) {
                t = this._addTriangle(n, i, q, hullTri[i], -1, hullTri[n]);
                hullTri[i] = this._legalize(t + 2);
                hullNext[n] = n; // mark as removed
                hullSize--;
                n = q;
            }

            // walk backward from the other side, adding more triangles and flipping
            if (e === start) {
                while (q = hullPrev[e], (0,robust_predicates__WEBPACK_IMPORTED_MODULE_0__.orient2d)(x, y, coords[2 * q], coords[2 * q + 1], coords[2 * e], coords[2 * e + 1]) < 0) {
                    t = this._addTriangle(q, i, e, -1, hullTri[e], hullTri[q]);
                    this._legalize(t + 2);
                    hullTri[q] = t;
                    hullNext[e] = e; // mark as removed
                    hullSize--;
                    e = q;
                }
            }

            // update the hull indices
            this._hullStart = hullPrev[i] = e;
            hullNext[e] = hullPrev[n] = i;
            hullNext[i] = n;

            // save the two new edges in the hash table
            hullHash[this._hashKey(x, y)] = i;
            hullHash[this._hashKey(coords[2 * e], coords[2 * e + 1])] = e;
        }

        this.hull = new Uint32Array(hullSize);
        for (let i = 0, e = this._hullStart; i < hullSize; i++) {
            this.hull[i] = e;
            e = hullNext[e];
        }

        // trim typed triangle mesh arrays
        this.triangles = this._triangles.subarray(0, this.trianglesLen);
        this.halfedges = this._halfedges.subarray(0, this.trianglesLen);
    }

    _hashKey(x, y) {
        return Math.floor(pseudoAngle(x - this._cx, y - this._cy) * this._hashSize) % this._hashSize;
    }

    _legalize(a) {
        const {_triangles: triangles, _halfedges: halfedges, coords} = this;

        let i = 0;
        let ar = 0;

        // recursion eliminated with a fixed-size stack
        while (true) {
            const b = halfedges[a];

            /* if the pair of triangles doesn't satisfy the Delaunay condition
             * (p1 is inside the circumcircle of [p0, pl, pr]), flip them,
             * then do the same check/flip recursively for the new pair of triangles
             *
             *           pl                    pl
             *          /||\                  /  \
             *       al/ || \bl            al/    \a
             *        /  ||  \              /      \
             *       /  a||b  \    flip    /___ar___\
             *     p0\   ||   /p1   =>   p0\---bl---/p1
             *        \  ||  /              \      /
             *       ar\ || /br             b\    /br
             *          \||/                  \  /
             *           pr                    pr
             */
            const a0 = a - a % 3;
            ar = a0 + (a + 2) % 3;

            if (b === -1) { // convex hull edge
                if (i === 0) break;
                a = EDGE_STACK[--i];
                continue;
            }

            const b0 = b - b % 3;
            const al = a0 + (a + 1) % 3;
            const bl = b0 + (b + 2) % 3;

            const p0 = triangles[ar];
            const pr = triangles[a];
            const pl = triangles[al];
            const p1 = triangles[bl];

            const illegal = inCircle(
                coords[2 * p0], coords[2 * p0 + 1],
                coords[2 * pr], coords[2 * pr + 1],
                coords[2 * pl], coords[2 * pl + 1],
                coords[2 * p1], coords[2 * p1 + 1]);

            if (illegal) {
                triangles[a] = p1;
                triangles[b] = p0;

                const hbl = halfedges[bl];

                // edge swapped on the other side of the hull (rare); fix the halfedge reference
                if (hbl === -1) {
                    let e = this._hullStart;
                    do {
                        if (this._hullTri[e] === bl) {
                            this._hullTri[e] = a;
                            break;
                        }
                        e = this._hullPrev[e];
                    } while (e !== this._hullStart);
                }
                this._link(a, hbl);
                this._link(b, halfedges[ar]);
                this._link(ar, bl);

                const br = b0 + (b + 1) % 3;

                // don't worry about hitting the cap: it can only happen on extremely degenerate input
                if (i < EDGE_STACK.length) {
                    EDGE_STACK[i++] = br;
                }
            } else {
                if (i === 0) break;
                a = EDGE_STACK[--i];
            }
        }

        return ar;
    }

    _link(a, b) {
        this._halfedges[a] = b;
        if (b !== -1) this._halfedges[b] = a;
    }

    // add a new triangle given vertex indices and adjacent half-edge ids
    _addTriangle(i0, i1, i2, a, b, c) {
        const t = this.trianglesLen;

        this._triangles[t] = i0;
        this._triangles[t + 1] = i1;
        this._triangles[t + 2] = i2;

        this._link(t, a);
        this._link(t + 1, b);
        this._link(t + 2, c);

        this.trianglesLen += 3;

        return t;
    }
}

// monotonically increases with real angle, but doesn't need expensive trigonometry
function pseudoAngle(dx, dy) {
    const p = dx / (Math.abs(dx) + Math.abs(dy));
    return (dy > 0 ? 3 - p : 1 + p) / 4; // [0..1]
}

function dist(ax, ay, bx, by) {
    const dx = ax - bx;
    const dy = ay - by;
    return dx * dx + dy * dy;
}

function inCircle(ax, ay, bx, by, cx, cy, px, py) {
    const dx = ax - px;
    const dy = ay - py;
    const ex = bx - px;
    const ey = by - py;
    const fx = cx - px;
    const fy = cy - py;

    const ap = dx * dx + dy * dy;
    const bp = ex * ex + ey * ey;
    const cp = fx * fx + fy * fy;

    return dx * (ey * cp - bp * fy) -
           dy * (ex * cp - bp * fx) +
           ap * (ex * fy - ey * fx) < 0;
}

function circumradius(ax, ay, bx, by, cx, cy) {
    const dx = bx - ax;
    const dy = by - ay;
    const ex = cx - ax;
    const ey = cy - ay;

    const bl = dx * dx + dy * dy;
    const cl = ex * ex + ey * ey;
    const d = 0.5 / (dx * ey - dy * ex);

    const x = (ey * bl - dy * cl) * d;
    const y = (dx * cl - ex * bl) * d;

    return x * x + y * y;
}

function circumcenter(ax, ay, bx, by, cx, cy) {
    const dx = bx - ax;
    const dy = by - ay;
    const ex = cx - ax;
    const ey = cy - ay;

    const bl = dx * dx + dy * dy;
    const cl = ex * ex + ey * ey;
    const d = 0.5 / (dx * ey - dy * ex);

    const x = ax + (ey * bl - dy * cl) * d;
    const y = ay + (dx * cl - ex * bl) * d;

    return {x, y};
}

function quicksort(ids, dists, left, right) {
    if (right - left <= 20) {
        for (let i = left + 1; i <= right; i++) {
            const temp = ids[i];
            const tempDist = dists[temp];
            let j = i - 1;
            while (j >= left && dists[ids[j]] > tempDist) ids[j + 1] = ids[j--];
            ids[j + 1] = temp;
        }
    } else {
        const median = (left + right) >> 1;
        let i = left + 1;
        let j = right;
        swap(ids, median, i);
        if (dists[ids[left]] > dists[ids[right]]) swap(ids, left, right);
        if (dists[ids[i]] > dists[ids[right]]) swap(ids, i, right);
        if (dists[ids[left]] > dists[ids[i]]) swap(ids, left, i);

        const temp = ids[i];
        const tempDist = dists[temp];
        while (true) {
            do i++; while (dists[ids[i]] < tempDist);
            do j--; while (dists[ids[j]] > tempDist);
            if (j < i) break;
            swap(ids, i, j);
        }
        ids[left + 1] = ids[j];
        ids[j] = temp;

        if (right - i + 1 >= j - left) {
            quicksort(ids, dists, i, right);
            quicksort(ids, dists, left, j - 1);
        } else {
            quicksort(ids, dists, left, j - 1);
            quicksort(ids, dists, i, right);
        }
    }
}

function swap(arr, i, j) {
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
}

function defaultGetX(p) {
    return p[0];
}
function defaultGetY(p) {
    return p[1];
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




/***/ }),

/***/ "./node_modules/robust-predicates/esm/incircle.js":
/*!********************************************************!*\
  !*** ./node_modules/robust-predicates/esm/incircle.js ***!
  \********************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   incircle: function() { return /* binding */ incircle; },
/* harmony export */   incirclefast: function() { return /* binding */ incirclefast; }
/* harmony export */ });
/* harmony import */ var _util_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./util.js */ "./node_modules/robust-predicates/esm/util.js");


const iccerrboundA = (10 + 96 * _util_js__WEBPACK_IMPORTED_MODULE_0__.epsilon) * _util_js__WEBPACK_IMPORTED_MODULE_0__.epsilon;
const iccerrboundB = (4 + 48 * _util_js__WEBPACK_IMPORTED_MODULE_0__.epsilon) * _util_js__WEBPACK_IMPORTED_MODULE_0__.epsilon;
const iccerrboundC = (44 + 576 * _util_js__WEBPACK_IMPORTED_MODULE_0__.epsilon) * _util_js__WEBPACK_IMPORTED_MODULE_0__.epsilon * _util_js__WEBPACK_IMPORTED_MODULE_0__.epsilon;

const bc = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(4);
const ca = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(4);
const ab = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(4);
const aa = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(4);
const bb = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(4);
const cc = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(4);
const u = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(4);
const v = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(4);
const axtbc = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(8);
const aytbc = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(8);
const bxtca = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(8);
const bytca = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(8);
const cxtab = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(8);
const cytab = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(8);
const abt = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(8);
const bct = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(8);
const cat = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(8);
const abtt = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(4);
const bctt = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(4);
const catt = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(4);

const _8 = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(8);
const _16 = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(16);
const _16b = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(16);
const _16c = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(16);
const _32 = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(32);
const _32b = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(32);
const _48 = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(48);
const _64 = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(64);

let fin = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(1152);
let fin2 = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(1152);

function finadd(finlen, a, alen) {
    finlen = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.sum)(finlen, fin, a, alen, fin2);
    const tmp = fin; fin = fin2; fin2 = tmp;
    return finlen;
}

function incircleadapt(ax, ay, bx, by, cx, cy, dx, dy, permanent) {
    let finlen;
    let adxtail, bdxtail, cdxtail, adytail, bdytail, cdytail;
    let axtbclen, aytbclen, bxtcalen, bytcalen, cxtablen, cytablen;
    let abtlen, bctlen, catlen;
    let abttlen, bcttlen, cattlen;
    let n1, n0;

    let bvirt, c, ahi, alo, bhi, blo, _i, _j, _0, s1, s0, t1, t0, u3;

    const adx = ax - dx;
    const bdx = bx - dx;
    const cdx = cx - dx;
    const ady = ay - dy;
    const bdy = by - dy;
    const cdy = cy - dy;

    s1 = bdx * cdy;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * bdx;
    ahi = c - (c - bdx);
    alo = bdx - ahi;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * cdy;
    bhi = c - (c - cdy);
    blo = cdy - bhi;
    s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
    t1 = cdx * bdy;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * cdx;
    ahi = c - (c - cdx);
    alo = cdx - ahi;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * bdy;
    bhi = c - (c - bdy);
    blo = bdy - bhi;
    t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
    _i = s0 - t0;
    bvirt = s0 - _i;
    bc[0] = s0 - (_i + bvirt) + (bvirt - t0);
    _j = s1 + _i;
    bvirt = _j - s1;
    _0 = s1 - (_j - bvirt) + (_i - bvirt);
    _i = _0 - t1;
    bvirt = _0 - _i;
    bc[1] = _0 - (_i + bvirt) + (bvirt - t1);
    u3 = _j + _i;
    bvirt = u3 - _j;
    bc[2] = _j - (u3 - bvirt) + (_i - bvirt);
    bc[3] = u3;
    s1 = cdx * ady;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * cdx;
    ahi = c - (c - cdx);
    alo = cdx - ahi;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * ady;
    bhi = c - (c - ady);
    blo = ady - bhi;
    s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
    t1 = adx * cdy;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * adx;
    ahi = c - (c - adx);
    alo = adx - ahi;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * cdy;
    bhi = c - (c - cdy);
    blo = cdy - bhi;
    t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
    _i = s0 - t0;
    bvirt = s0 - _i;
    ca[0] = s0 - (_i + bvirt) + (bvirt - t0);
    _j = s1 + _i;
    bvirt = _j - s1;
    _0 = s1 - (_j - bvirt) + (_i - bvirt);
    _i = _0 - t1;
    bvirt = _0 - _i;
    ca[1] = _0 - (_i + bvirt) + (bvirt - t1);
    u3 = _j + _i;
    bvirt = u3 - _j;
    ca[2] = _j - (u3 - bvirt) + (_i - bvirt);
    ca[3] = u3;
    s1 = adx * bdy;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * adx;
    ahi = c - (c - adx);
    alo = adx - ahi;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * bdy;
    bhi = c - (c - bdy);
    blo = bdy - bhi;
    s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
    t1 = bdx * ady;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * bdx;
    ahi = c - (c - bdx);
    alo = bdx - ahi;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * ady;
    bhi = c - (c - ady);
    blo = ady - bhi;
    t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
    _i = s0 - t0;
    bvirt = s0 - _i;
    ab[0] = s0 - (_i + bvirt) + (bvirt - t0);
    _j = s1 + _i;
    bvirt = _j - s1;
    _0 = s1 - (_j - bvirt) + (_i - bvirt);
    _i = _0 - t1;
    bvirt = _0 - _i;
    ab[1] = _0 - (_i + bvirt) + (bvirt - t1);
    u3 = _j + _i;
    bvirt = u3 - _j;
    ab[2] = _j - (u3 - bvirt) + (_i - bvirt);
    ab[3] = u3;

    finlen = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.sum)(
        (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.sum)(
            (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.sum)(
                (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)((0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(4, bc, adx, _8), _8, adx, _16), _16,
                (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)((0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(4, bc, ady, _8), _8, ady, _16b), _16b, _32), _32,
            (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.sum)(
                (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)((0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(4, ca, bdx, _8), _8, bdx, _16), _16,
                (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)((0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(4, ca, bdy, _8), _8, bdy, _16b), _16b, _32b), _32b, _64), _64,
        (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.sum)(
            (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)((0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(4, ab, cdx, _8), _8, cdx, _16), _16,
            (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)((0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(4, ab, cdy, _8), _8, cdy, _16b), _16b, _32), _32, fin);

    let det = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.estimate)(finlen, fin);
    let errbound = iccerrboundB * permanent;
    if (det >= errbound || -det >= errbound) {
        return det;
    }

    bvirt = ax - adx;
    adxtail = ax - (adx + bvirt) + (bvirt - dx);
    bvirt = ay - ady;
    adytail = ay - (ady + bvirt) + (bvirt - dy);
    bvirt = bx - bdx;
    bdxtail = bx - (bdx + bvirt) + (bvirt - dx);
    bvirt = by - bdy;
    bdytail = by - (bdy + bvirt) + (bvirt - dy);
    bvirt = cx - cdx;
    cdxtail = cx - (cdx + bvirt) + (bvirt - dx);
    bvirt = cy - cdy;
    cdytail = cy - (cdy + bvirt) + (bvirt - dy);
    if (adxtail === 0 && bdxtail === 0 && cdxtail === 0 && adytail === 0 && bdytail === 0 && cdytail === 0) {
        return det;
    }

    errbound = iccerrboundC * permanent + _util_js__WEBPACK_IMPORTED_MODULE_0__.resulterrbound * Math.abs(det);
    det += ((adx * adx + ady * ady) * ((bdx * cdytail + cdy * bdxtail) - (bdy * cdxtail + cdx * bdytail)) +
        2 * (adx * adxtail + ady * adytail) * (bdx * cdy - bdy * cdx)) +
        ((bdx * bdx + bdy * bdy) * ((cdx * adytail + ady * cdxtail) - (cdy * adxtail + adx * cdytail)) +
        2 * (bdx * bdxtail + bdy * bdytail) * (cdx * ady - cdy * adx)) +
        ((cdx * cdx + cdy * cdy) * ((adx * bdytail + bdy * adxtail) - (ady * bdxtail + bdx * adytail)) +
        2 * (cdx * cdxtail + cdy * cdytail) * (adx * bdy - ady * bdx));

    if (det >= errbound || -det >= errbound) {
        return det;
    }

    if (bdxtail !== 0 || bdytail !== 0 || cdxtail !== 0 || cdytail !== 0) {
        s1 = adx * adx;
        c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * adx;
        ahi = c - (c - adx);
        alo = adx - ahi;
        s0 = alo * alo - (s1 - ahi * ahi - (ahi + ahi) * alo);
        t1 = ady * ady;
        c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * ady;
        ahi = c - (c - ady);
        alo = ady - ahi;
        t0 = alo * alo - (t1 - ahi * ahi - (ahi + ahi) * alo);
        _i = s0 + t0;
        bvirt = _i - s0;
        aa[0] = s0 - (_i - bvirt) + (t0 - bvirt);
        _j = s1 + _i;
        bvirt = _j - s1;
        _0 = s1 - (_j - bvirt) + (_i - bvirt);
        _i = _0 + t1;
        bvirt = _i - _0;
        aa[1] = _0 - (_i - bvirt) + (t1 - bvirt);
        u3 = _j + _i;
        bvirt = u3 - _j;
        aa[2] = _j - (u3 - bvirt) + (_i - bvirt);
        aa[3] = u3;
    }
    if (cdxtail !== 0 || cdytail !== 0 || adxtail !== 0 || adytail !== 0) {
        s1 = bdx * bdx;
        c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * bdx;
        ahi = c - (c - bdx);
        alo = bdx - ahi;
        s0 = alo * alo - (s1 - ahi * ahi - (ahi + ahi) * alo);
        t1 = bdy * bdy;
        c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * bdy;
        ahi = c - (c - bdy);
        alo = bdy - ahi;
        t0 = alo * alo - (t1 - ahi * ahi - (ahi + ahi) * alo);
        _i = s0 + t0;
        bvirt = _i - s0;
        bb[0] = s0 - (_i - bvirt) + (t0 - bvirt);
        _j = s1 + _i;
        bvirt = _j - s1;
        _0 = s1 - (_j - bvirt) + (_i - bvirt);
        _i = _0 + t1;
        bvirt = _i - _0;
        bb[1] = _0 - (_i - bvirt) + (t1 - bvirt);
        u3 = _j + _i;
        bvirt = u3 - _j;
        bb[2] = _j - (u3 - bvirt) + (_i - bvirt);
        bb[3] = u3;
    }
    if (adxtail !== 0 || adytail !== 0 || bdxtail !== 0 || bdytail !== 0) {
        s1 = cdx * cdx;
        c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * cdx;
        ahi = c - (c - cdx);
        alo = cdx - ahi;
        s0 = alo * alo - (s1 - ahi * ahi - (ahi + ahi) * alo);
        t1 = cdy * cdy;
        c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * cdy;
        ahi = c - (c - cdy);
        alo = cdy - ahi;
        t0 = alo * alo - (t1 - ahi * ahi - (ahi + ahi) * alo);
        _i = s0 + t0;
        bvirt = _i - s0;
        cc[0] = s0 - (_i - bvirt) + (t0 - bvirt);
        _j = s1 + _i;
        bvirt = _j - s1;
        _0 = s1 - (_j - bvirt) + (_i - bvirt);
        _i = _0 + t1;
        bvirt = _i - _0;
        cc[1] = _0 - (_i - bvirt) + (t1 - bvirt);
        u3 = _j + _i;
        bvirt = u3 - _j;
        cc[2] = _j - (u3 - bvirt) + (_i - bvirt);
        cc[3] = u3;
    }

    if (adxtail !== 0) {
        axtbclen = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(4, bc, adxtail, axtbc);
        finlen = finadd(finlen, (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.sum_three)(
            (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(axtbclen, axtbc, 2 * adx, _16), _16,
            (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)((0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(4, cc, adxtail, _8), _8, bdy, _16b), _16b,
            (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)((0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(4, bb, adxtail, _8), _8, -cdy, _16c), _16c, _32, _48), _48);
    }
    if (adytail !== 0) {
        aytbclen = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(4, bc, adytail, aytbc);
        finlen = finadd(finlen, (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.sum_three)(
            (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(aytbclen, aytbc, 2 * ady, _16), _16,
            (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)((0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(4, bb, adytail, _8), _8, cdx, _16b), _16b,
            (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)((0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(4, cc, adytail, _8), _8, -bdx, _16c), _16c, _32, _48), _48);
    }
    if (bdxtail !== 0) {
        bxtcalen = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(4, ca, bdxtail, bxtca);
        finlen = finadd(finlen, (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.sum_three)(
            (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(bxtcalen, bxtca, 2 * bdx, _16), _16,
            (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)((0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(4, aa, bdxtail, _8), _8, cdy, _16b), _16b,
            (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)((0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(4, cc, bdxtail, _8), _8, -ady, _16c), _16c, _32, _48), _48);
    }
    if (bdytail !== 0) {
        bytcalen = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(4, ca, bdytail, bytca);
        finlen = finadd(finlen, (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.sum_three)(
            (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(bytcalen, bytca, 2 * bdy, _16), _16,
            (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)((0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(4, cc, bdytail, _8), _8, adx, _16b), _16b,
            (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)((0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(4, aa, bdytail, _8), _8, -cdx, _16c), _16c, _32, _48), _48);
    }
    if (cdxtail !== 0) {
        cxtablen = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(4, ab, cdxtail, cxtab);
        finlen = finadd(finlen, (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.sum_three)(
            (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(cxtablen, cxtab, 2 * cdx, _16), _16,
            (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)((0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(4, bb, cdxtail, _8), _8, ady, _16b), _16b,
            (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)((0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(4, aa, cdxtail, _8), _8, -bdy, _16c), _16c, _32, _48), _48);
    }
    if (cdytail !== 0) {
        cytablen = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(4, ab, cdytail, cytab);
        finlen = finadd(finlen, (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.sum_three)(
            (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(cytablen, cytab, 2 * cdy, _16), _16,
            (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)((0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(4, aa, cdytail, _8), _8, bdx, _16b), _16b,
            (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)((0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(4, bb, cdytail, _8), _8, -adx, _16c), _16c, _32, _48), _48);
    }

    if (adxtail !== 0 || adytail !== 0) {
        if (bdxtail !== 0 || bdytail !== 0 || cdxtail !== 0 || cdytail !== 0) {
            s1 = bdxtail * cdy;
            c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * bdxtail;
            ahi = c - (c - bdxtail);
            alo = bdxtail - ahi;
            c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * cdy;
            bhi = c - (c - cdy);
            blo = cdy - bhi;
            s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
            t1 = bdx * cdytail;
            c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * bdx;
            ahi = c - (c - bdx);
            alo = bdx - ahi;
            c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * cdytail;
            bhi = c - (c - cdytail);
            blo = cdytail - bhi;
            t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
            _i = s0 + t0;
            bvirt = _i - s0;
            u[0] = s0 - (_i - bvirt) + (t0 - bvirt);
            _j = s1 + _i;
            bvirt = _j - s1;
            _0 = s1 - (_j - bvirt) + (_i - bvirt);
            _i = _0 + t1;
            bvirt = _i - _0;
            u[1] = _0 - (_i - bvirt) + (t1 - bvirt);
            u3 = _j + _i;
            bvirt = u3 - _j;
            u[2] = _j - (u3 - bvirt) + (_i - bvirt);
            u[3] = u3;
            s1 = cdxtail * -bdy;
            c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * cdxtail;
            ahi = c - (c - cdxtail);
            alo = cdxtail - ahi;
            c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * -bdy;
            bhi = c - (c - -bdy);
            blo = -bdy - bhi;
            s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
            t1 = cdx * -bdytail;
            c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * cdx;
            ahi = c - (c - cdx);
            alo = cdx - ahi;
            c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * -bdytail;
            bhi = c - (c - -bdytail);
            blo = -bdytail - bhi;
            t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
            _i = s0 + t0;
            bvirt = _i - s0;
            v[0] = s0 - (_i - bvirt) + (t0 - bvirt);
            _j = s1 + _i;
            bvirt = _j - s1;
            _0 = s1 - (_j - bvirt) + (_i - bvirt);
            _i = _0 + t1;
            bvirt = _i - _0;
            v[1] = _0 - (_i - bvirt) + (t1 - bvirt);
            u3 = _j + _i;
            bvirt = u3 - _j;
            v[2] = _j - (u3 - bvirt) + (_i - bvirt);
            v[3] = u3;
            bctlen = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.sum)(4, u, 4, v, bct);
            s1 = bdxtail * cdytail;
            c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * bdxtail;
            ahi = c - (c - bdxtail);
            alo = bdxtail - ahi;
            c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * cdytail;
            bhi = c - (c - cdytail);
            blo = cdytail - bhi;
            s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
            t1 = cdxtail * bdytail;
            c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * cdxtail;
            ahi = c - (c - cdxtail);
            alo = cdxtail - ahi;
            c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * bdytail;
            bhi = c - (c - bdytail);
            blo = bdytail - bhi;
            t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
            _i = s0 - t0;
            bvirt = s0 - _i;
            bctt[0] = s0 - (_i + bvirt) + (bvirt - t0);
            _j = s1 + _i;
            bvirt = _j - s1;
            _0 = s1 - (_j - bvirt) + (_i - bvirt);
            _i = _0 - t1;
            bvirt = _0 - _i;
            bctt[1] = _0 - (_i + bvirt) + (bvirt - t1);
            u3 = _j + _i;
            bvirt = u3 - _j;
            bctt[2] = _j - (u3 - bvirt) + (_i - bvirt);
            bctt[3] = u3;
            bcttlen = 4;
        } else {
            bct[0] = 0;
            bctlen = 1;
            bctt[0] = 0;
            bcttlen = 1;
        }
        if (adxtail !== 0) {
            const len = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(bctlen, bct, adxtail, _16c);
            finlen = finadd(finlen, (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.sum)(
                (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(axtbclen, axtbc, adxtail, _16), _16,
                (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(len, _16c, 2 * adx, _32), _32, _48), _48);

            const len2 = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(bcttlen, bctt, adxtail, _8);
            finlen = finadd(finlen, (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.sum_three)(
                (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(len2, _8, 2 * adx, _16), _16,
                (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(len2, _8, adxtail, _16b), _16b,
                (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(len, _16c, adxtail, _32), _32, _32b, _64), _64);

            if (bdytail !== 0) {
                finlen = finadd(finlen, (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)((0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(4, cc, adxtail, _8), _8, bdytail, _16), _16);
            }
            if (cdytail !== 0) {
                finlen = finadd(finlen, (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)((0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(4, bb, -adxtail, _8), _8, cdytail, _16), _16);
            }
        }
        if (adytail !== 0) {
            const len = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(bctlen, bct, adytail, _16c);
            finlen = finadd(finlen, (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.sum)(
                (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(aytbclen, aytbc, adytail, _16), _16,
                (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(len, _16c, 2 * ady, _32), _32, _48), _48);

            const len2 = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(bcttlen, bctt, adytail, _8);
            finlen = finadd(finlen, (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.sum_three)(
                (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(len2, _8, 2 * ady, _16), _16,
                (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(len2, _8, adytail, _16b), _16b,
                (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(len, _16c, adytail, _32), _32, _32b, _64), _64);
        }
    }
    if (bdxtail !== 0 || bdytail !== 0) {
        if (cdxtail !== 0 || cdytail !== 0 || adxtail !== 0 || adytail !== 0) {
            s1 = cdxtail * ady;
            c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * cdxtail;
            ahi = c - (c - cdxtail);
            alo = cdxtail - ahi;
            c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * ady;
            bhi = c - (c - ady);
            blo = ady - bhi;
            s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
            t1 = cdx * adytail;
            c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * cdx;
            ahi = c - (c - cdx);
            alo = cdx - ahi;
            c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * adytail;
            bhi = c - (c - adytail);
            blo = adytail - bhi;
            t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
            _i = s0 + t0;
            bvirt = _i - s0;
            u[0] = s0 - (_i - bvirt) + (t0 - bvirt);
            _j = s1 + _i;
            bvirt = _j - s1;
            _0 = s1 - (_j - bvirt) + (_i - bvirt);
            _i = _0 + t1;
            bvirt = _i - _0;
            u[1] = _0 - (_i - bvirt) + (t1 - bvirt);
            u3 = _j + _i;
            bvirt = u3 - _j;
            u[2] = _j - (u3 - bvirt) + (_i - bvirt);
            u[3] = u3;
            n1 = -cdy;
            n0 = -cdytail;
            s1 = adxtail * n1;
            c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * adxtail;
            ahi = c - (c - adxtail);
            alo = adxtail - ahi;
            c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * n1;
            bhi = c - (c - n1);
            blo = n1 - bhi;
            s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
            t1 = adx * n0;
            c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * adx;
            ahi = c - (c - adx);
            alo = adx - ahi;
            c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * n0;
            bhi = c - (c - n0);
            blo = n0 - bhi;
            t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
            _i = s0 + t0;
            bvirt = _i - s0;
            v[0] = s0 - (_i - bvirt) + (t0 - bvirt);
            _j = s1 + _i;
            bvirt = _j - s1;
            _0 = s1 - (_j - bvirt) + (_i - bvirt);
            _i = _0 + t1;
            bvirt = _i - _0;
            v[1] = _0 - (_i - bvirt) + (t1 - bvirt);
            u3 = _j + _i;
            bvirt = u3 - _j;
            v[2] = _j - (u3 - bvirt) + (_i - bvirt);
            v[3] = u3;
            catlen = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.sum)(4, u, 4, v, cat);
            s1 = cdxtail * adytail;
            c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * cdxtail;
            ahi = c - (c - cdxtail);
            alo = cdxtail - ahi;
            c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * adytail;
            bhi = c - (c - adytail);
            blo = adytail - bhi;
            s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
            t1 = adxtail * cdytail;
            c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * adxtail;
            ahi = c - (c - adxtail);
            alo = adxtail - ahi;
            c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * cdytail;
            bhi = c - (c - cdytail);
            blo = cdytail - bhi;
            t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
            _i = s0 - t0;
            bvirt = s0 - _i;
            catt[0] = s0 - (_i + bvirt) + (bvirt - t0);
            _j = s1 + _i;
            bvirt = _j - s1;
            _0 = s1 - (_j - bvirt) + (_i - bvirt);
            _i = _0 - t1;
            bvirt = _0 - _i;
            catt[1] = _0 - (_i + bvirt) + (bvirt - t1);
            u3 = _j + _i;
            bvirt = u3 - _j;
            catt[2] = _j - (u3 - bvirt) + (_i - bvirt);
            catt[3] = u3;
            cattlen = 4;
        } else {
            cat[0] = 0;
            catlen = 1;
            catt[0] = 0;
            cattlen = 1;
        }
        if (bdxtail !== 0) {
            const len = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(catlen, cat, bdxtail, _16c);
            finlen = finadd(finlen, (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.sum)(
                (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(bxtcalen, bxtca, bdxtail, _16), _16,
                (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(len, _16c, 2 * bdx, _32), _32, _48), _48);

            const len2 = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(cattlen, catt, bdxtail, _8);
            finlen = finadd(finlen, (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.sum_three)(
                (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(len2, _8, 2 * bdx, _16), _16,
                (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(len2, _8, bdxtail, _16b), _16b,
                (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(len, _16c, bdxtail, _32), _32, _32b, _64), _64);

            if (cdytail !== 0) {
                finlen = finadd(finlen, (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)((0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(4, aa, bdxtail, _8), _8, cdytail, _16), _16);
            }
            if (adytail !== 0) {
                finlen = finadd(finlen, (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)((0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(4, cc, -bdxtail, _8), _8, adytail, _16), _16);
            }
        }
        if (bdytail !== 0) {
            const len = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(catlen, cat, bdytail, _16c);
            finlen = finadd(finlen, (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.sum)(
                (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(bytcalen, bytca, bdytail, _16), _16,
                (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(len, _16c, 2 * bdy, _32), _32, _48), _48);

            const len2 = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(cattlen, catt, bdytail, _8);
            finlen = finadd(finlen, (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.sum_three)(
                (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(len2, _8, 2 * bdy, _16), _16,
                (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(len2, _8, bdytail, _16b), _16b,
                (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(len, _16c, bdytail, _32), _32,  _32b, _64), _64);
        }
    }
    if (cdxtail !== 0 || cdytail !== 0) {
        if (adxtail !== 0 || adytail !== 0 || bdxtail !== 0 || bdytail !== 0) {
            s1 = adxtail * bdy;
            c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * adxtail;
            ahi = c - (c - adxtail);
            alo = adxtail - ahi;
            c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * bdy;
            bhi = c - (c - bdy);
            blo = bdy - bhi;
            s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
            t1 = adx * bdytail;
            c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * adx;
            ahi = c - (c - adx);
            alo = adx - ahi;
            c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * bdytail;
            bhi = c - (c - bdytail);
            blo = bdytail - bhi;
            t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
            _i = s0 + t0;
            bvirt = _i - s0;
            u[0] = s0 - (_i - bvirt) + (t0 - bvirt);
            _j = s1 + _i;
            bvirt = _j - s1;
            _0 = s1 - (_j - bvirt) + (_i - bvirt);
            _i = _0 + t1;
            bvirt = _i - _0;
            u[1] = _0 - (_i - bvirt) + (t1 - bvirt);
            u3 = _j + _i;
            bvirt = u3 - _j;
            u[2] = _j - (u3 - bvirt) + (_i - bvirt);
            u[3] = u3;
            n1 = -ady;
            n0 = -adytail;
            s1 = bdxtail * n1;
            c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * bdxtail;
            ahi = c - (c - bdxtail);
            alo = bdxtail - ahi;
            c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * n1;
            bhi = c - (c - n1);
            blo = n1 - bhi;
            s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
            t1 = bdx * n0;
            c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * bdx;
            ahi = c - (c - bdx);
            alo = bdx - ahi;
            c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * n0;
            bhi = c - (c - n0);
            blo = n0 - bhi;
            t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
            _i = s0 + t0;
            bvirt = _i - s0;
            v[0] = s0 - (_i - bvirt) + (t0 - bvirt);
            _j = s1 + _i;
            bvirt = _j - s1;
            _0 = s1 - (_j - bvirt) + (_i - bvirt);
            _i = _0 + t1;
            bvirt = _i - _0;
            v[1] = _0 - (_i - bvirt) + (t1 - bvirt);
            u3 = _j + _i;
            bvirt = u3 - _j;
            v[2] = _j - (u3 - bvirt) + (_i - bvirt);
            v[3] = u3;
            abtlen = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.sum)(4, u, 4, v, abt);
            s1 = adxtail * bdytail;
            c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * adxtail;
            ahi = c - (c - adxtail);
            alo = adxtail - ahi;
            c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * bdytail;
            bhi = c - (c - bdytail);
            blo = bdytail - bhi;
            s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
            t1 = bdxtail * adytail;
            c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * bdxtail;
            ahi = c - (c - bdxtail);
            alo = bdxtail - ahi;
            c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * adytail;
            bhi = c - (c - adytail);
            blo = adytail - bhi;
            t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
            _i = s0 - t0;
            bvirt = s0 - _i;
            abtt[0] = s0 - (_i + bvirt) + (bvirt - t0);
            _j = s1 + _i;
            bvirt = _j - s1;
            _0 = s1 - (_j - bvirt) + (_i - bvirt);
            _i = _0 - t1;
            bvirt = _0 - _i;
            abtt[1] = _0 - (_i + bvirt) + (bvirt - t1);
            u3 = _j + _i;
            bvirt = u3 - _j;
            abtt[2] = _j - (u3 - bvirt) + (_i - bvirt);
            abtt[3] = u3;
            abttlen = 4;
        } else {
            abt[0] = 0;
            abtlen = 1;
            abtt[0] = 0;
            abttlen = 1;
        }
        if (cdxtail !== 0) {
            const len = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(abtlen, abt, cdxtail, _16c);
            finlen = finadd(finlen, (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.sum)(
                (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(cxtablen, cxtab, cdxtail, _16), _16,
                (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(len, _16c, 2 * cdx, _32), _32, _48), _48);

            const len2 = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(abttlen, abtt, cdxtail, _8);
            finlen = finadd(finlen, (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.sum_three)(
                (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(len2, _8, 2 * cdx, _16), _16,
                (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(len2, _8, cdxtail, _16b), _16b,
                (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(len, _16c, cdxtail, _32), _32, _32b, _64), _64);

            if (adytail !== 0) {
                finlen = finadd(finlen, (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)((0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(4, bb, cdxtail, _8), _8, adytail, _16), _16);
            }
            if (bdytail !== 0) {
                finlen = finadd(finlen, (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)((0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(4, aa, -cdxtail, _8), _8, bdytail, _16), _16);
            }
        }
        if (cdytail !== 0) {
            const len = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(abtlen, abt, cdytail, _16c);
            finlen = finadd(finlen, (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.sum)(
                (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(cytablen, cytab, cdytail, _16), _16,
                (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(len, _16c, 2 * cdy, _32), _32, _48), _48);

            const len2 = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(abttlen, abtt, cdytail, _8);
            finlen = finadd(finlen, (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.sum_three)(
                (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(len2, _8, 2 * cdy, _16), _16,
                (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(len2, _8, cdytail, _16b), _16b,
                (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(len, _16c, cdytail, _32), _32, _32b, _64), _64);
        }
    }

    return fin[finlen - 1];
}

function incircle(ax, ay, bx, by, cx, cy, dx, dy) {
    const adx = ax - dx;
    const bdx = bx - dx;
    const cdx = cx - dx;
    const ady = ay - dy;
    const bdy = by - dy;
    const cdy = cy - dy;

    const bdxcdy = bdx * cdy;
    const cdxbdy = cdx * bdy;
    const alift = adx * adx + ady * ady;

    const cdxady = cdx * ady;
    const adxcdy = adx * cdy;
    const blift = bdx * bdx + bdy * bdy;

    const adxbdy = adx * bdy;
    const bdxady = bdx * ady;
    const clift = cdx * cdx + cdy * cdy;

    const det =
        alift * (bdxcdy - cdxbdy) +
        blift * (cdxady - adxcdy) +
        clift * (adxbdy - bdxady);

    const permanent =
        (Math.abs(bdxcdy) + Math.abs(cdxbdy)) * alift +
        (Math.abs(cdxady) + Math.abs(adxcdy)) * blift +
        (Math.abs(adxbdy) + Math.abs(bdxady)) * clift;

    const errbound = iccerrboundA * permanent;

    if (det > errbound || -det > errbound) {
        return det;
    }
    return incircleadapt(ax, ay, bx, by, cx, cy, dx, dy, permanent);
}

function incirclefast(ax, ay, bx, by, cx, cy, dx, dy) {
    const adx = ax - dx;
    const ady = ay - dy;
    const bdx = bx - dx;
    const bdy = by - dy;
    const cdx = cx - dx;
    const cdy = cy - dy;

    const abdet = adx * bdy - bdx * ady;
    const bcdet = bdx * cdy - cdx * bdy;
    const cadet = cdx * ady - adx * cdy;
    const alift = adx * adx + ady * ady;
    const blift = bdx * bdx + bdy * bdy;
    const clift = cdx * cdx + cdy * cdy;

    return alift * bcdet + blift * cadet + clift * abdet;
}


/***/ }),

/***/ "./node_modules/robust-predicates/esm/insphere.js":
/*!********************************************************!*\
  !*** ./node_modules/robust-predicates/esm/insphere.js ***!
  \********************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   insphere: function() { return /* binding */ insphere; },
/* harmony export */   inspherefast: function() { return /* binding */ inspherefast; }
/* harmony export */ });
/* harmony import */ var _util_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./util.js */ "./node_modules/robust-predicates/esm/util.js");


const isperrboundA = (16 + 224 * _util_js__WEBPACK_IMPORTED_MODULE_0__.epsilon) * _util_js__WEBPACK_IMPORTED_MODULE_0__.epsilon;
const isperrboundB = (5 + 72 * _util_js__WEBPACK_IMPORTED_MODULE_0__.epsilon) * _util_js__WEBPACK_IMPORTED_MODULE_0__.epsilon;
const isperrboundC = (71 + 1408 * _util_js__WEBPACK_IMPORTED_MODULE_0__.epsilon) * _util_js__WEBPACK_IMPORTED_MODULE_0__.epsilon * _util_js__WEBPACK_IMPORTED_MODULE_0__.epsilon;

const ab = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(4);
const bc = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(4);
const cd = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(4);
const de = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(4);
const ea = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(4);
const ac = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(4);
const bd = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(4);
const ce = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(4);
const da = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(4);
const eb = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(4);

const abc = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(24);
const bcd = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(24);
const cde = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(24);
const dea = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(24);
const eab = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(24);
const abd = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(24);
const bce = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(24);
const cda = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(24);
const deb = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(24);
const eac = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(24);

const adet = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(1152);
const bdet = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(1152);
const cdet = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(1152);
const ddet = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(1152);
const edet = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(1152);
const abdet = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(2304);
const cddet = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(2304);
const cdedet = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(3456);
const deter = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(5760);

const _8 = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(8);
const _8b = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(8);
const _8c = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(8);
const _16 = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(16);
const _24 = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(24);
const _48 = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(48);
const _48b = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(48);
const _96 = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(96);
const _192 = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(192);
const _384x = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(384);
const _384y = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(384);
const _384z = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(384);
const _768 = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(768);

function sum_three_scale(a, b, c, az, bz, cz, out) {
    return (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.sum_three)(
        (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(4, a, az, _8), _8,
        (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(4, b, bz, _8b), _8b,
        (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(4, c, cz, _8c), _8c, _16, out);
}

function liftexact(alen, a, blen, b, clen, c, dlen, d, x, y, z, out) {
    const len = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.sum)(
        (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.sum)(alen, a, blen, b, _48), _48,
        (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.negate)((0,_util_js__WEBPACK_IMPORTED_MODULE_0__.sum)(clen, c, dlen, d, _48b), _48b), _48b, _96);

    return (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.sum_three)(
        (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)((0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(len, _96, x, _192), _192, x, _384x), _384x,
        (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)((0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(len, _96, y, _192), _192, y, _384y), _384y,
        (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)((0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(len, _96, z, _192), _192, z, _384z), _384z, _768, out);
}

function insphereexact(ax, ay, az, bx, by, bz, cx, cy, cz, dx, dy, dz, ex, ey, ez) {
    let bvirt, c, ahi, alo, bhi, blo, _i, _j, _0, s1, s0, t1, t0, u3;

    s1 = ax * by;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * ax;
    ahi = c - (c - ax);
    alo = ax - ahi;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * by;
    bhi = c - (c - by);
    blo = by - bhi;
    s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
    t1 = bx * ay;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * bx;
    ahi = c - (c - bx);
    alo = bx - ahi;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * ay;
    bhi = c - (c - ay);
    blo = ay - bhi;
    t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
    _i = s0 - t0;
    bvirt = s0 - _i;
    ab[0] = s0 - (_i + bvirt) + (bvirt - t0);
    _j = s1 + _i;
    bvirt = _j - s1;
    _0 = s1 - (_j - bvirt) + (_i - bvirt);
    _i = _0 - t1;
    bvirt = _0 - _i;
    ab[1] = _0 - (_i + bvirt) + (bvirt - t1);
    u3 = _j + _i;
    bvirt = u3 - _j;
    ab[2] = _j - (u3 - bvirt) + (_i - bvirt);
    ab[3] = u3;
    s1 = bx * cy;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * bx;
    ahi = c - (c - bx);
    alo = bx - ahi;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * cy;
    bhi = c - (c - cy);
    blo = cy - bhi;
    s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
    t1 = cx * by;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * cx;
    ahi = c - (c - cx);
    alo = cx - ahi;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * by;
    bhi = c - (c - by);
    blo = by - bhi;
    t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
    _i = s0 - t0;
    bvirt = s0 - _i;
    bc[0] = s0 - (_i + bvirt) + (bvirt - t0);
    _j = s1 + _i;
    bvirt = _j - s1;
    _0 = s1 - (_j - bvirt) + (_i - bvirt);
    _i = _0 - t1;
    bvirt = _0 - _i;
    bc[1] = _0 - (_i + bvirt) + (bvirt - t1);
    u3 = _j + _i;
    bvirt = u3 - _j;
    bc[2] = _j - (u3 - bvirt) + (_i - bvirt);
    bc[3] = u3;
    s1 = cx * dy;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * cx;
    ahi = c - (c - cx);
    alo = cx - ahi;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * dy;
    bhi = c - (c - dy);
    blo = dy - bhi;
    s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
    t1 = dx * cy;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * dx;
    ahi = c - (c - dx);
    alo = dx - ahi;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * cy;
    bhi = c - (c - cy);
    blo = cy - bhi;
    t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
    _i = s0 - t0;
    bvirt = s0 - _i;
    cd[0] = s0 - (_i + bvirt) + (bvirt - t0);
    _j = s1 + _i;
    bvirt = _j - s1;
    _0 = s1 - (_j - bvirt) + (_i - bvirt);
    _i = _0 - t1;
    bvirt = _0 - _i;
    cd[1] = _0 - (_i + bvirt) + (bvirt - t1);
    u3 = _j + _i;
    bvirt = u3 - _j;
    cd[2] = _j - (u3 - bvirt) + (_i - bvirt);
    cd[3] = u3;
    s1 = dx * ey;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * dx;
    ahi = c - (c - dx);
    alo = dx - ahi;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * ey;
    bhi = c - (c - ey);
    blo = ey - bhi;
    s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
    t1 = ex * dy;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * ex;
    ahi = c - (c - ex);
    alo = ex - ahi;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * dy;
    bhi = c - (c - dy);
    blo = dy - bhi;
    t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
    _i = s0 - t0;
    bvirt = s0 - _i;
    de[0] = s0 - (_i + bvirt) + (bvirt - t0);
    _j = s1 + _i;
    bvirt = _j - s1;
    _0 = s1 - (_j - bvirt) + (_i - bvirt);
    _i = _0 - t1;
    bvirt = _0 - _i;
    de[1] = _0 - (_i + bvirt) + (bvirt - t1);
    u3 = _j + _i;
    bvirt = u3 - _j;
    de[2] = _j - (u3 - bvirt) + (_i - bvirt);
    de[3] = u3;
    s1 = ex * ay;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * ex;
    ahi = c - (c - ex);
    alo = ex - ahi;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * ay;
    bhi = c - (c - ay);
    blo = ay - bhi;
    s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
    t1 = ax * ey;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * ax;
    ahi = c - (c - ax);
    alo = ax - ahi;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * ey;
    bhi = c - (c - ey);
    blo = ey - bhi;
    t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
    _i = s0 - t0;
    bvirt = s0 - _i;
    ea[0] = s0 - (_i + bvirt) + (bvirt - t0);
    _j = s1 + _i;
    bvirt = _j - s1;
    _0 = s1 - (_j - bvirt) + (_i - bvirt);
    _i = _0 - t1;
    bvirt = _0 - _i;
    ea[1] = _0 - (_i + bvirt) + (bvirt - t1);
    u3 = _j + _i;
    bvirt = u3 - _j;
    ea[2] = _j - (u3 - bvirt) + (_i - bvirt);
    ea[3] = u3;
    s1 = ax * cy;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * ax;
    ahi = c - (c - ax);
    alo = ax - ahi;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * cy;
    bhi = c - (c - cy);
    blo = cy - bhi;
    s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
    t1 = cx * ay;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * cx;
    ahi = c - (c - cx);
    alo = cx - ahi;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * ay;
    bhi = c - (c - ay);
    blo = ay - bhi;
    t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
    _i = s0 - t0;
    bvirt = s0 - _i;
    ac[0] = s0 - (_i + bvirt) + (bvirt - t0);
    _j = s1 + _i;
    bvirt = _j - s1;
    _0 = s1 - (_j - bvirt) + (_i - bvirt);
    _i = _0 - t1;
    bvirt = _0 - _i;
    ac[1] = _0 - (_i + bvirt) + (bvirt - t1);
    u3 = _j + _i;
    bvirt = u3 - _j;
    ac[2] = _j - (u3 - bvirt) + (_i - bvirt);
    ac[3] = u3;
    s1 = bx * dy;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * bx;
    ahi = c - (c - bx);
    alo = bx - ahi;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * dy;
    bhi = c - (c - dy);
    blo = dy - bhi;
    s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
    t1 = dx * by;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * dx;
    ahi = c - (c - dx);
    alo = dx - ahi;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * by;
    bhi = c - (c - by);
    blo = by - bhi;
    t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
    _i = s0 - t0;
    bvirt = s0 - _i;
    bd[0] = s0 - (_i + bvirt) + (bvirt - t0);
    _j = s1 + _i;
    bvirt = _j - s1;
    _0 = s1 - (_j - bvirt) + (_i - bvirt);
    _i = _0 - t1;
    bvirt = _0 - _i;
    bd[1] = _0 - (_i + bvirt) + (bvirt - t1);
    u3 = _j + _i;
    bvirt = u3 - _j;
    bd[2] = _j - (u3 - bvirt) + (_i - bvirt);
    bd[3] = u3;
    s1 = cx * ey;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * cx;
    ahi = c - (c - cx);
    alo = cx - ahi;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * ey;
    bhi = c - (c - ey);
    blo = ey - bhi;
    s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
    t1 = ex * cy;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * ex;
    ahi = c - (c - ex);
    alo = ex - ahi;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * cy;
    bhi = c - (c - cy);
    blo = cy - bhi;
    t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
    _i = s0 - t0;
    bvirt = s0 - _i;
    ce[0] = s0 - (_i + bvirt) + (bvirt - t0);
    _j = s1 + _i;
    bvirt = _j - s1;
    _0 = s1 - (_j - bvirt) + (_i - bvirt);
    _i = _0 - t1;
    bvirt = _0 - _i;
    ce[1] = _0 - (_i + bvirt) + (bvirt - t1);
    u3 = _j + _i;
    bvirt = u3 - _j;
    ce[2] = _j - (u3 - bvirt) + (_i - bvirt);
    ce[3] = u3;
    s1 = dx * ay;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * dx;
    ahi = c - (c - dx);
    alo = dx - ahi;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * ay;
    bhi = c - (c - ay);
    blo = ay - bhi;
    s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
    t1 = ax * dy;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * ax;
    ahi = c - (c - ax);
    alo = ax - ahi;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * dy;
    bhi = c - (c - dy);
    blo = dy - bhi;
    t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
    _i = s0 - t0;
    bvirt = s0 - _i;
    da[0] = s0 - (_i + bvirt) + (bvirt - t0);
    _j = s1 + _i;
    bvirt = _j - s1;
    _0 = s1 - (_j - bvirt) + (_i - bvirt);
    _i = _0 - t1;
    bvirt = _0 - _i;
    da[1] = _0 - (_i + bvirt) + (bvirt - t1);
    u3 = _j + _i;
    bvirt = u3 - _j;
    da[2] = _j - (u3 - bvirt) + (_i - bvirt);
    da[3] = u3;
    s1 = ex * by;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * ex;
    ahi = c - (c - ex);
    alo = ex - ahi;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * by;
    bhi = c - (c - by);
    blo = by - bhi;
    s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
    t1 = bx * ey;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * bx;
    ahi = c - (c - bx);
    alo = bx - ahi;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * ey;
    bhi = c - (c - ey);
    blo = ey - bhi;
    t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
    _i = s0 - t0;
    bvirt = s0 - _i;
    eb[0] = s0 - (_i + bvirt) + (bvirt - t0);
    _j = s1 + _i;
    bvirt = _j - s1;
    _0 = s1 - (_j - bvirt) + (_i - bvirt);
    _i = _0 - t1;
    bvirt = _0 - _i;
    eb[1] = _0 - (_i + bvirt) + (bvirt - t1);
    u3 = _j + _i;
    bvirt = u3 - _j;
    eb[2] = _j - (u3 - bvirt) + (_i - bvirt);
    eb[3] = u3;

    const abclen = sum_three_scale(ab, bc, ac, cz, az, -bz, abc);
    const bcdlen = sum_three_scale(bc, cd, bd, dz, bz, -cz, bcd);
    const cdelen = sum_three_scale(cd, de, ce, ez, cz, -dz, cde);
    const dealen = sum_three_scale(de, ea, da, az, dz, -ez, dea);
    const eablen = sum_three_scale(ea, ab, eb, bz, ez, -az, eab);
    const abdlen = sum_three_scale(ab, bd, da, dz, az, bz, abd);
    const bcelen = sum_three_scale(bc, ce, eb, ez, bz, cz, bce);
    const cdalen = sum_three_scale(cd, da, ac, az, cz, dz, cda);
    const deblen = sum_three_scale(de, eb, bd, bz, dz, ez, deb);
    const eaclen = sum_three_scale(ea, ac, ce, cz, ez, az, eac);

    const deterlen = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.sum_three)(
        liftexact(cdelen, cde, bcelen, bce, deblen, deb, bcdlen, bcd, ax, ay, az, adet), adet,
        liftexact(dealen, dea, cdalen, cda, eaclen, eac, cdelen, cde, bx, by, bz, bdet), bdet,
        (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.sum_three)(
            liftexact(eablen, eab, deblen, deb, abdlen, abd, dealen, dea, cx, cy, cz, cdet), cdet,
            liftexact(abclen, abc, eaclen, eac, bcelen, bce, eablen, eab, dx, dy, dz, ddet), ddet,
            liftexact(bcdlen, bcd, abdlen, abd, cdalen, cda, abclen, abc, ex, ey, ez, edet), edet, cddet, cdedet), cdedet, abdet, deter);

    return deter[deterlen - 1];
}

const xdet = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(96);
const ydet = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(96);
const zdet = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(96);
const fin = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(1152);

function liftadapt(a, b, c, az, bz, cz, x, y, z, out) {
    const len = sum_three_scale(a, b, c, az, bz, cz, _24);
    return (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.sum_three)(
        (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)((0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(len, _24, x, _48), _48, x, xdet), xdet,
        (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)((0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(len, _24, y, _48), _48, y, ydet), ydet,
        (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)((0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(len, _24, z, _48), _48, z, zdet), zdet, _192, out);
}

function insphereadapt(ax, ay, az, bx, by, bz, cx, cy, cz, dx, dy, dz, ex, ey, ez, permanent) {
    let ab3, bc3, cd3, da3, ac3, bd3;

    let aextail, bextail, cextail, dextail;
    let aeytail, beytail, ceytail, deytail;
    let aeztail, beztail, ceztail, deztail;

    let bvirt, c, ahi, alo, bhi, blo, _i, _j, _0, s1, s0, t1, t0;

    const aex = ax - ex;
    const bex = bx - ex;
    const cex = cx - ex;
    const dex = dx - ex;
    const aey = ay - ey;
    const bey = by - ey;
    const cey = cy - ey;
    const dey = dy - ey;
    const aez = az - ez;
    const bez = bz - ez;
    const cez = cz - ez;
    const dez = dz - ez;

    s1 = aex * bey;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * aex;
    ahi = c - (c - aex);
    alo = aex - ahi;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * bey;
    bhi = c - (c - bey);
    blo = bey - bhi;
    s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
    t1 = bex * aey;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * bex;
    ahi = c - (c - bex);
    alo = bex - ahi;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * aey;
    bhi = c - (c - aey);
    blo = aey - bhi;
    t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
    _i = s0 - t0;
    bvirt = s0 - _i;
    ab[0] = s0 - (_i + bvirt) + (bvirt - t0);
    _j = s1 + _i;
    bvirt = _j - s1;
    _0 = s1 - (_j - bvirt) + (_i - bvirt);
    _i = _0 - t1;
    bvirt = _0 - _i;
    ab[1] = _0 - (_i + bvirt) + (bvirt - t1);
    ab3 = _j + _i;
    bvirt = ab3 - _j;
    ab[2] = _j - (ab3 - bvirt) + (_i - bvirt);
    ab[3] = ab3;
    s1 = bex * cey;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * bex;
    ahi = c - (c - bex);
    alo = bex - ahi;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * cey;
    bhi = c - (c - cey);
    blo = cey - bhi;
    s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
    t1 = cex * bey;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * cex;
    ahi = c - (c - cex);
    alo = cex - ahi;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * bey;
    bhi = c - (c - bey);
    blo = bey - bhi;
    t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
    _i = s0 - t0;
    bvirt = s0 - _i;
    bc[0] = s0 - (_i + bvirt) + (bvirt - t0);
    _j = s1 + _i;
    bvirt = _j - s1;
    _0 = s1 - (_j - bvirt) + (_i - bvirt);
    _i = _0 - t1;
    bvirt = _0 - _i;
    bc[1] = _0 - (_i + bvirt) + (bvirt - t1);
    bc3 = _j + _i;
    bvirt = bc3 - _j;
    bc[2] = _j - (bc3 - bvirt) + (_i - bvirt);
    bc[3] = bc3;
    s1 = cex * dey;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * cex;
    ahi = c - (c - cex);
    alo = cex - ahi;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * dey;
    bhi = c - (c - dey);
    blo = dey - bhi;
    s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
    t1 = dex * cey;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * dex;
    ahi = c - (c - dex);
    alo = dex - ahi;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * cey;
    bhi = c - (c - cey);
    blo = cey - bhi;
    t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
    _i = s0 - t0;
    bvirt = s0 - _i;
    cd[0] = s0 - (_i + bvirt) + (bvirt - t0);
    _j = s1 + _i;
    bvirt = _j - s1;
    _0 = s1 - (_j - bvirt) + (_i - bvirt);
    _i = _0 - t1;
    bvirt = _0 - _i;
    cd[1] = _0 - (_i + bvirt) + (bvirt - t1);
    cd3 = _j + _i;
    bvirt = cd3 - _j;
    cd[2] = _j - (cd3 - bvirt) + (_i - bvirt);
    cd[3] = cd3;
    s1 = dex * aey;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * dex;
    ahi = c - (c - dex);
    alo = dex - ahi;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * aey;
    bhi = c - (c - aey);
    blo = aey - bhi;
    s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
    t1 = aex * dey;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * aex;
    ahi = c - (c - aex);
    alo = aex - ahi;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * dey;
    bhi = c - (c - dey);
    blo = dey - bhi;
    t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
    _i = s0 - t0;
    bvirt = s0 - _i;
    da[0] = s0 - (_i + bvirt) + (bvirt - t0);
    _j = s1 + _i;
    bvirt = _j - s1;
    _0 = s1 - (_j - bvirt) + (_i - bvirt);
    _i = _0 - t1;
    bvirt = _0 - _i;
    da[1] = _0 - (_i + bvirt) + (bvirt - t1);
    da3 = _j + _i;
    bvirt = da3 - _j;
    da[2] = _j - (da3 - bvirt) + (_i - bvirt);
    da[3] = da3;
    s1 = aex * cey;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * aex;
    ahi = c - (c - aex);
    alo = aex - ahi;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * cey;
    bhi = c - (c - cey);
    blo = cey - bhi;
    s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
    t1 = cex * aey;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * cex;
    ahi = c - (c - cex);
    alo = cex - ahi;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * aey;
    bhi = c - (c - aey);
    blo = aey - bhi;
    t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
    _i = s0 - t0;
    bvirt = s0 - _i;
    ac[0] = s0 - (_i + bvirt) + (bvirt - t0);
    _j = s1 + _i;
    bvirt = _j - s1;
    _0 = s1 - (_j - bvirt) + (_i - bvirt);
    _i = _0 - t1;
    bvirt = _0 - _i;
    ac[1] = _0 - (_i + bvirt) + (bvirt - t1);
    ac3 = _j + _i;
    bvirt = ac3 - _j;
    ac[2] = _j - (ac3 - bvirt) + (_i - bvirt);
    ac[3] = ac3;
    s1 = bex * dey;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * bex;
    ahi = c - (c - bex);
    alo = bex - ahi;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * dey;
    bhi = c - (c - dey);
    blo = dey - bhi;
    s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
    t1 = dex * bey;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * dex;
    ahi = c - (c - dex);
    alo = dex - ahi;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * bey;
    bhi = c - (c - bey);
    blo = bey - bhi;
    t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
    _i = s0 - t0;
    bvirt = s0 - _i;
    bd[0] = s0 - (_i + bvirt) + (bvirt - t0);
    _j = s1 + _i;
    bvirt = _j - s1;
    _0 = s1 - (_j - bvirt) + (_i - bvirt);
    _i = _0 - t1;
    bvirt = _0 - _i;
    bd[1] = _0 - (_i + bvirt) + (bvirt - t1);
    bd3 = _j + _i;
    bvirt = bd3 - _j;
    bd[2] = _j - (bd3 - bvirt) + (_i - bvirt);
    bd[3] = bd3;

    const finlen = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.sum)(
        (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.sum)(
            (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.negate)(liftadapt(bc, cd, bd, dez, bez, -cez, aex, aey, aez, adet), adet), adet,
            liftadapt(cd, da, ac, aez, cez, dez, bex, bey, bez, bdet), bdet, abdet), abdet,
        (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.sum)(
            (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.negate)(liftadapt(da, ab, bd, bez, dez, aez, cex, cey, cez, cdet), cdet), cdet,
            liftadapt(ab, bc, ac, cez, aez, -bez, dex, dey, dez, ddet), ddet, cddet), cddet, fin);

    let det = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.estimate)(finlen, fin);
    let errbound = isperrboundB * permanent;
    if (det >= errbound || -det >= errbound) {
        return det;
    }

    bvirt = ax - aex;
    aextail = ax - (aex + bvirt) + (bvirt - ex);
    bvirt = ay - aey;
    aeytail = ay - (aey + bvirt) + (bvirt - ey);
    bvirt = az - aez;
    aeztail = az - (aez + bvirt) + (bvirt - ez);
    bvirt = bx - bex;
    bextail = bx - (bex + bvirt) + (bvirt - ex);
    bvirt = by - bey;
    beytail = by - (bey + bvirt) + (bvirt - ey);
    bvirt = bz - bez;
    beztail = bz - (bez + bvirt) + (bvirt - ez);
    bvirt = cx - cex;
    cextail = cx - (cex + bvirt) + (bvirt - ex);
    bvirt = cy - cey;
    ceytail = cy - (cey + bvirt) + (bvirt - ey);
    bvirt = cz - cez;
    ceztail = cz - (cez + bvirt) + (bvirt - ez);
    bvirt = dx - dex;
    dextail = dx - (dex + bvirt) + (bvirt - ex);
    bvirt = dy - dey;
    deytail = dy - (dey + bvirt) + (bvirt - ey);
    bvirt = dz - dez;
    deztail = dz - (dez + bvirt) + (bvirt - ez);
    if (aextail === 0 && aeytail === 0 && aeztail === 0 &&
        bextail === 0 && beytail === 0 && beztail === 0 &&
        cextail === 0 && ceytail === 0 && ceztail === 0 &&
        dextail === 0 && deytail === 0 && deztail === 0) {
        return det;
    }

    errbound = isperrboundC * permanent + _util_js__WEBPACK_IMPORTED_MODULE_0__.resulterrbound * Math.abs(det);

    const abeps = (aex * beytail + bey * aextail) - (aey * bextail + bex * aeytail);
    const bceps = (bex * ceytail + cey * bextail) - (bey * cextail + cex * beytail);
    const cdeps = (cex * deytail + dey * cextail) - (cey * dextail + dex * ceytail);
    const daeps = (dex * aeytail + aey * dextail) - (dey * aextail + aex * deytail);
    const aceps = (aex * ceytail + cey * aextail) - (aey * cextail + cex * aeytail);
    const bdeps = (bex * deytail + dey * bextail) - (bey * dextail + dex * beytail);
    det +=
        (((bex * bex + bey * bey + bez * bez) * ((cez * daeps + dez * aceps + aez * cdeps) +
        (ceztail * da3 + deztail * ac3 + aeztail * cd3)) + (dex * dex + dey * dey + dez * dez) *
        ((aez * bceps - bez * aceps + cez * abeps) + (aeztail * bc3 - beztail * ac3 + ceztail * ab3))) -
        ((aex * aex + aey * aey + aez * aez) * ((bez * cdeps - cez * bdeps + dez * bceps) +
        (beztail * cd3 - ceztail * bd3 + deztail * bc3)) + (cex * cex + cey * cey + cez * cez) *
        ((dez * abeps + aez * bdeps + bez * daeps) + (deztail * ab3 + aeztail * bd3 + beztail * da3)))) +
        2 * (((bex * bextail + bey * beytail + bez * beztail) * (cez * da3 + dez * ac3 + aez * cd3) +
        (dex * dextail + dey * deytail + dez * deztail) * (aez * bc3 - bez * ac3 + cez * ab3)) -
        ((aex * aextail + aey * aeytail + aez * aeztail) * (bez * cd3 - cez * bd3 + dez * bc3) +
        (cex * cextail + cey * ceytail + cez * ceztail) * (dez * ab3 + aez * bd3 + bez * da3)));

    if (det >= errbound || -det >= errbound) {
        return det;
    }

    return insphereexact(ax, ay, az, bx, by, bz, cx, cy, cz, dx, dy, dz, ex, ey, ez);
}

function insphere(ax, ay, az, bx, by, bz, cx, cy, cz, dx, dy, dz, ex, ey, ez) {
    const aex = ax - ex;
    const bex = bx - ex;
    const cex = cx - ex;
    const dex = dx - ex;
    const aey = ay - ey;
    const bey = by - ey;
    const cey = cy - ey;
    const dey = dy - ey;
    const aez = az - ez;
    const bez = bz - ez;
    const cez = cz - ez;
    const dez = dz - ez;

    const aexbey = aex * bey;
    const bexaey = bex * aey;
    const ab = aexbey - bexaey;
    const bexcey = bex * cey;
    const cexbey = cex * bey;
    const bc = bexcey - cexbey;
    const cexdey = cex * dey;
    const dexcey = dex * cey;
    const cd = cexdey - dexcey;
    const dexaey = dex * aey;
    const aexdey = aex * dey;
    const da = dexaey - aexdey;
    const aexcey = aex * cey;
    const cexaey = cex * aey;
    const ac = aexcey - cexaey;
    const bexdey = bex * dey;
    const dexbey = dex * bey;
    const bd = bexdey - dexbey;

    const alift = aex * aex + aey * aey + aez * aez;
    const blift = bex * bex + bey * bey + bez * bez;
    const clift = cex * cex + cey * cey + cez * cez;
    const dlift = dex * dex + dey * dey + dez * dez;

    const det =
        (clift * (dez * ab + aez * bd + bez * da) - dlift * (aez * bc - bez * ac + cez * ab)) +
        (alift * (bez * cd - cez * bd + dez * bc) - blift * (cez * da + dez * ac + aez * cd));

    const aezplus = Math.abs(aez);
    const bezplus = Math.abs(bez);
    const cezplus = Math.abs(cez);
    const dezplus = Math.abs(dez);
    const aexbeyplus = Math.abs(aexbey) + Math.abs(bexaey);
    const bexceyplus = Math.abs(bexcey) + Math.abs(cexbey);
    const cexdeyplus = Math.abs(cexdey) + Math.abs(dexcey);
    const dexaeyplus = Math.abs(dexaey) + Math.abs(aexdey);
    const aexceyplus = Math.abs(aexcey) + Math.abs(cexaey);
    const bexdeyplus = Math.abs(bexdey) + Math.abs(dexbey);
    const permanent =
        (cexdeyplus * bezplus + bexdeyplus * cezplus + bexceyplus * dezplus) * alift +
        (dexaeyplus * cezplus + aexceyplus * dezplus + cexdeyplus * aezplus) * blift +
        (aexbeyplus * dezplus + bexdeyplus * aezplus + dexaeyplus * bezplus) * clift +
        (bexceyplus * aezplus + aexceyplus * bezplus + aexbeyplus * cezplus) * dlift;

    const errbound = isperrboundA * permanent;
    if (det > errbound || -det > errbound) {
        return det;
    }
    return -insphereadapt(ax, ay, az, bx, by, bz, cx, cy, cz, dx, dy, dz, ex, ey, ez, permanent);
}

function inspherefast(pax, pay, paz, pbx, pby, pbz, pcx, pcy, pcz, pdx, pdy, pdz, pex, pey, pez) {
    const aex = pax - pex;
    const bex = pbx - pex;
    const cex = pcx - pex;
    const dex = pdx - pex;
    const aey = pay - pey;
    const bey = pby - pey;
    const cey = pcy - pey;
    const dey = pdy - pey;
    const aez = paz - pez;
    const bez = pbz - pez;
    const cez = pcz - pez;
    const dez = pdz - pez;

    const ab = aex * bey - bex * aey;
    const bc = bex * cey - cex * bey;
    const cd = cex * dey - dex * cey;
    const da = dex * aey - aex * dey;
    const ac = aex * cey - cex * aey;
    const bd = bex * dey - dex * bey;

    const abc = aez * bc - bez * ac + cez * ab;
    const bcd = bez * cd - cez * bd + dez * bc;
    const cda = cez * da + dez * ac + aez * cd;
    const dab = dez * ab + aez * bd + bez * da;

    const alift = aex * aex + aey * aey + aez * aez;
    const blift = bex * bex + bey * bey + bez * bez;
    const clift = cex * cex + cey * cey + cez * cez;
    const dlift = dex * dex + dey * dey + dez * dez;

    return (clift * dab - dlift * abc) + (alift * bcd - blift * cda);
}


/***/ }),

/***/ "./node_modules/robust-predicates/esm/orient2d.js":
/*!********************************************************!*\
  !*** ./node_modules/robust-predicates/esm/orient2d.js ***!
  \********************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   orient2d: function() { return /* binding */ orient2d; },
/* harmony export */   orient2dfast: function() { return /* binding */ orient2dfast; }
/* harmony export */ });
/* harmony import */ var _util_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./util.js */ "./node_modules/robust-predicates/esm/util.js");


const ccwerrboundA = (3 + 16 * _util_js__WEBPACK_IMPORTED_MODULE_0__.epsilon) * _util_js__WEBPACK_IMPORTED_MODULE_0__.epsilon;
const ccwerrboundB = (2 + 12 * _util_js__WEBPACK_IMPORTED_MODULE_0__.epsilon) * _util_js__WEBPACK_IMPORTED_MODULE_0__.epsilon;
const ccwerrboundC = (9 + 64 * _util_js__WEBPACK_IMPORTED_MODULE_0__.epsilon) * _util_js__WEBPACK_IMPORTED_MODULE_0__.epsilon * _util_js__WEBPACK_IMPORTED_MODULE_0__.epsilon;

const B = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(4);
const C1 = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(8);
const C2 = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(12);
const D = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(16);
const u = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(4);

function orient2dadapt(ax, ay, bx, by, cx, cy, detsum) {
    let acxtail, acytail, bcxtail, bcytail;
    let bvirt, c, ahi, alo, bhi, blo, _i, _j, _0, s1, s0, t1, t0, u3;

    const acx = ax - cx;
    const bcx = bx - cx;
    const acy = ay - cy;
    const bcy = by - cy;

    s1 = acx * bcy;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * acx;
    ahi = c - (c - acx);
    alo = acx - ahi;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * bcy;
    bhi = c - (c - bcy);
    blo = bcy - bhi;
    s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
    t1 = acy * bcx;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * acy;
    ahi = c - (c - acy);
    alo = acy - ahi;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * bcx;
    bhi = c - (c - bcx);
    blo = bcx - bhi;
    t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
    _i = s0 - t0;
    bvirt = s0 - _i;
    B[0] = s0 - (_i + bvirt) + (bvirt - t0);
    _j = s1 + _i;
    bvirt = _j - s1;
    _0 = s1 - (_j - bvirt) + (_i - bvirt);
    _i = _0 - t1;
    bvirt = _0 - _i;
    B[1] = _0 - (_i + bvirt) + (bvirt - t1);
    u3 = _j + _i;
    bvirt = u3 - _j;
    B[2] = _j - (u3 - bvirt) + (_i - bvirt);
    B[3] = u3;

    let det = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.estimate)(4, B);
    let errbound = ccwerrboundB * detsum;
    if (det >= errbound || -det >= errbound) {
        return det;
    }

    bvirt = ax - acx;
    acxtail = ax - (acx + bvirt) + (bvirt - cx);
    bvirt = bx - bcx;
    bcxtail = bx - (bcx + bvirt) + (bvirt - cx);
    bvirt = ay - acy;
    acytail = ay - (acy + bvirt) + (bvirt - cy);
    bvirt = by - bcy;
    bcytail = by - (bcy + bvirt) + (bvirt - cy);

    if (acxtail === 0 && acytail === 0 && bcxtail === 0 && bcytail === 0) {
        return det;
    }

    errbound = ccwerrboundC * detsum + _util_js__WEBPACK_IMPORTED_MODULE_0__.resulterrbound * Math.abs(det);
    det += (acx * bcytail + bcy * acxtail) - (acy * bcxtail + bcx * acytail);
    if (det >= errbound || -det >= errbound) return det;

    s1 = acxtail * bcy;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * acxtail;
    ahi = c - (c - acxtail);
    alo = acxtail - ahi;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * bcy;
    bhi = c - (c - bcy);
    blo = bcy - bhi;
    s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
    t1 = acytail * bcx;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * acytail;
    ahi = c - (c - acytail);
    alo = acytail - ahi;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * bcx;
    bhi = c - (c - bcx);
    blo = bcx - bhi;
    t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
    _i = s0 - t0;
    bvirt = s0 - _i;
    u[0] = s0 - (_i + bvirt) + (bvirt - t0);
    _j = s1 + _i;
    bvirt = _j - s1;
    _0 = s1 - (_j - bvirt) + (_i - bvirt);
    _i = _0 - t1;
    bvirt = _0 - _i;
    u[1] = _0 - (_i + bvirt) + (bvirt - t1);
    u3 = _j + _i;
    bvirt = u3 - _j;
    u[2] = _j - (u3 - bvirt) + (_i - bvirt);
    u[3] = u3;
    const C1len = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.sum)(4, B, 4, u, C1);

    s1 = acx * bcytail;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * acx;
    ahi = c - (c - acx);
    alo = acx - ahi;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * bcytail;
    bhi = c - (c - bcytail);
    blo = bcytail - bhi;
    s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
    t1 = acy * bcxtail;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * acy;
    ahi = c - (c - acy);
    alo = acy - ahi;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * bcxtail;
    bhi = c - (c - bcxtail);
    blo = bcxtail - bhi;
    t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
    _i = s0 - t0;
    bvirt = s0 - _i;
    u[0] = s0 - (_i + bvirt) + (bvirt - t0);
    _j = s1 + _i;
    bvirt = _j - s1;
    _0 = s1 - (_j - bvirt) + (_i - bvirt);
    _i = _0 - t1;
    bvirt = _0 - _i;
    u[1] = _0 - (_i + bvirt) + (bvirt - t1);
    u3 = _j + _i;
    bvirt = u3 - _j;
    u[2] = _j - (u3 - bvirt) + (_i - bvirt);
    u[3] = u3;
    const C2len = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.sum)(C1len, C1, 4, u, C2);

    s1 = acxtail * bcytail;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * acxtail;
    ahi = c - (c - acxtail);
    alo = acxtail - ahi;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * bcytail;
    bhi = c - (c - bcytail);
    blo = bcytail - bhi;
    s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
    t1 = acytail * bcxtail;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * acytail;
    ahi = c - (c - acytail);
    alo = acytail - ahi;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * bcxtail;
    bhi = c - (c - bcxtail);
    blo = bcxtail - bhi;
    t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
    _i = s0 - t0;
    bvirt = s0 - _i;
    u[0] = s0 - (_i + bvirt) + (bvirt - t0);
    _j = s1 + _i;
    bvirt = _j - s1;
    _0 = s1 - (_j - bvirt) + (_i - bvirt);
    _i = _0 - t1;
    bvirt = _0 - _i;
    u[1] = _0 - (_i + bvirt) + (bvirt - t1);
    u3 = _j + _i;
    bvirt = u3 - _j;
    u[2] = _j - (u3 - bvirt) + (_i - bvirt);
    u[3] = u3;
    const Dlen = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.sum)(C2len, C2, 4, u, D);

    return D[Dlen - 1];
}

function orient2d(ax, ay, bx, by, cx, cy) {
    const detleft = (ay - cy) * (bx - cx);
    const detright = (ax - cx) * (by - cy);
    const det = detleft - detright;

    const detsum = Math.abs(detleft + detright);
    if (Math.abs(det) >= ccwerrboundA * detsum) return det;

    return -orient2dadapt(ax, ay, bx, by, cx, cy, detsum);
}

function orient2dfast(ax, ay, bx, by, cx, cy) {
    return (ay - cy) * (bx - cx) - (ax - cx) * (by - cy);
}


/***/ }),

/***/ "./node_modules/robust-predicates/esm/orient3d.js":
/*!********************************************************!*\
  !*** ./node_modules/robust-predicates/esm/orient3d.js ***!
  \********************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   orient3d: function() { return /* binding */ orient3d; },
/* harmony export */   orient3dfast: function() { return /* binding */ orient3dfast; }
/* harmony export */ });
/* harmony import */ var _util_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./util.js */ "./node_modules/robust-predicates/esm/util.js");


const o3derrboundA = (7 + 56 * _util_js__WEBPACK_IMPORTED_MODULE_0__.epsilon) * _util_js__WEBPACK_IMPORTED_MODULE_0__.epsilon;
const o3derrboundB = (3 + 28 * _util_js__WEBPACK_IMPORTED_MODULE_0__.epsilon) * _util_js__WEBPACK_IMPORTED_MODULE_0__.epsilon;
const o3derrboundC = (26 + 288 * _util_js__WEBPACK_IMPORTED_MODULE_0__.epsilon) * _util_js__WEBPACK_IMPORTED_MODULE_0__.epsilon * _util_js__WEBPACK_IMPORTED_MODULE_0__.epsilon;

const bc = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(4);
const ca = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(4);
const ab = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(4);
const at_b = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(4);
const at_c = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(4);
const bt_c = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(4);
const bt_a = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(4);
const ct_a = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(4);
const ct_b = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(4);
const bct = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(8);
const cat = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(8);
const abt = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(8);
const u = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(4);

const _8 = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(8);
const _8b = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(8);
const _16 = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(8);
const _12 = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(12);

let fin = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(192);
let fin2 = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.vec)(192);

function finadd(finlen, alen, a) {
    finlen = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.sum)(finlen, fin, alen, a, fin2);
    const tmp = fin; fin = fin2; fin2 = tmp;
    return finlen;
}

function tailinit(xtail, ytail, ax, ay, bx, by, a, b) {
    let bvirt, c, ahi, alo, bhi, blo, _i, _j, _k, _0, s1, s0, t1, t0, u3, negate;
    if (xtail === 0) {
        if (ytail === 0) {
            a[0] = 0;
            b[0] = 0;
            return 1;
        } else {
            negate = -ytail;
            s1 = negate * ax;
            c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * negate;
            ahi = c - (c - negate);
            alo = negate - ahi;
            c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * ax;
            bhi = c - (c - ax);
            blo = ax - bhi;
            a[0] = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
            a[1] = s1;
            s1 = ytail * bx;
            c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * ytail;
            ahi = c - (c - ytail);
            alo = ytail - ahi;
            c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * bx;
            bhi = c - (c - bx);
            blo = bx - bhi;
            b[0] = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
            b[1] = s1;
            return 2;
        }
    } else {
        if (ytail === 0) {
            s1 = xtail * ay;
            c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * xtail;
            ahi = c - (c - xtail);
            alo = xtail - ahi;
            c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * ay;
            bhi = c - (c - ay);
            blo = ay - bhi;
            a[0] = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
            a[1] = s1;
            negate = -xtail;
            s1 = negate * by;
            c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * negate;
            ahi = c - (c - negate);
            alo = negate - ahi;
            c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * by;
            bhi = c - (c - by);
            blo = by - bhi;
            b[0] = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
            b[1] = s1;
            return 2;
        } else {
            s1 = xtail * ay;
            c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * xtail;
            ahi = c - (c - xtail);
            alo = xtail - ahi;
            c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * ay;
            bhi = c - (c - ay);
            blo = ay - bhi;
            s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
            t1 = ytail * ax;
            c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * ytail;
            ahi = c - (c - ytail);
            alo = ytail - ahi;
            c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * ax;
            bhi = c - (c - ax);
            blo = ax - bhi;
            t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
            _i = s0 - t0;
            bvirt = s0 - _i;
            a[0] = s0 - (_i + bvirt) + (bvirt - t0);
            _j = s1 + _i;
            bvirt = _j - s1;
            _0 = s1 - (_j - bvirt) + (_i - bvirt);
            _i = _0 - t1;
            bvirt = _0 - _i;
            a[1] = _0 - (_i + bvirt) + (bvirt - t1);
            u3 = _j + _i;
            bvirt = u3 - _j;
            a[2] = _j - (u3 - bvirt) + (_i - bvirt);
            a[3] = u3;
            s1 = ytail * bx;
            c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * ytail;
            ahi = c - (c - ytail);
            alo = ytail - ahi;
            c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * bx;
            bhi = c - (c - bx);
            blo = bx - bhi;
            s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
            t1 = xtail * by;
            c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * xtail;
            ahi = c - (c - xtail);
            alo = xtail - ahi;
            c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * by;
            bhi = c - (c - by);
            blo = by - bhi;
            t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
            _i = s0 - t0;
            bvirt = s0 - _i;
            b[0] = s0 - (_i + bvirt) + (bvirt - t0);
            _j = s1 + _i;
            bvirt = _j - s1;
            _0 = s1 - (_j - bvirt) + (_i - bvirt);
            _i = _0 - t1;
            bvirt = _0 - _i;
            b[1] = _0 - (_i + bvirt) + (bvirt - t1);
            u3 = _j + _i;
            bvirt = u3 - _j;
            b[2] = _j - (u3 - bvirt) + (_i - bvirt);
            b[3] = u3;
            return 4;
        }
    }
}

function tailadd(finlen, a, b, k, z) {
    let bvirt, c, ahi, alo, bhi, blo, _i, _j, _k, _0, s1, s0, u3;
    s1 = a * b;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * a;
    ahi = c - (c - a);
    alo = a - ahi;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * b;
    bhi = c - (c - b);
    blo = b - bhi;
    s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * k;
    bhi = c - (c - k);
    blo = k - bhi;
    _i = s0 * k;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * s0;
    ahi = c - (c - s0);
    alo = s0 - ahi;
    u[0] = alo * blo - (_i - ahi * bhi - alo * bhi - ahi * blo);
    _j = s1 * k;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * s1;
    ahi = c - (c - s1);
    alo = s1 - ahi;
    _0 = alo * blo - (_j - ahi * bhi - alo * bhi - ahi * blo);
    _k = _i + _0;
    bvirt = _k - _i;
    u[1] = _i - (_k - bvirt) + (_0 - bvirt);
    u3 = _j + _k;
    u[2] = _k - (u3 - _j);
    u[3] = u3;
    finlen = finadd(finlen, 4, u);
    if (z !== 0) {
        c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * z;
        bhi = c - (c - z);
        blo = z - bhi;
        _i = s0 * z;
        c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * s0;
        ahi = c - (c - s0);
        alo = s0 - ahi;
        u[0] = alo * blo - (_i - ahi * bhi - alo * bhi - ahi * blo);
        _j = s1 * z;
        c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * s1;
        ahi = c - (c - s1);
        alo = s1 - ahi;
        _0 = alo * blo - (_j - ahi * bhi - alo * bhi - ahi * blo);
        _k = _i + _0;
        bvirt = _k - _i;
        u[1] = _i - (_k - bvirt) + (_0 - bvirt);
        u3 = _j + _k;
        u[2] = _k - (u3 - _j);
        u[3] = u3;
        finlen = finadd(finlen, 4, u);
    }
    return finlen;
}

function orient3dadapt(ax, ay, az, bx, by, bz, cx, cy, cz, dx, dy, dz, permanent) {
    let finlen;
    let adxtail, bdxtail, cdxtail;
    let adytail, bdytail, cdytail;
    let adztail, bdztail, cdztail;
    let bvirt, c, ahi, alo, bhi, blo, _i, _j, _k, _0, s1, s0, t1, t0, u3;

    const adx = ax - dx;
    const bdx = bx - dx;
    const cdx = cx - dx;
    const ady = ay - dy;
    const bdy = by - dy;
    const cdy = cy - dy;
    const adz = az - dz;
    const bdz = bz - dz;
    const cdz = cz - dz;

    s1 = bdx * cdy;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * bdx;
    ahi = c - (c - bdx);
    alo = bdx - ahi;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * cdy;
    bhi = c - (c - cdy);
    blo = cdy - bhi;
    s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
    t1 = cdx * bdy;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * cdx;
    ahi = c - (c - cdx);
    alo = cdx - ahi;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * bdy;
    bhi = c - (c - bdy);
    blo = bdy - bhi;
    t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
    _i = s0 - t0;
    bvirt = s0 - _i;
    bc[0] = s0 - (_i + bvirt) + (bvirt - t0);
    _j = s1 + _i;
    bvirt = _j - s1;
    _0 = s1 - (_j - bvirt) + (_i - bvirt);
    _i = _0 - t1;
    bvirt = _0 - _i;
    bc[1] = _0 - (_i + bvirt) + (bvirt - t1);
    u3 = _j + _i;
    bvirt = u3 - _j;
    bc[2] = _j - (u3 - bvirt) + (_i - bvirt);
    bc[3] = u3;
    s1 = cdx * ady;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * cdx;
    ahi = c - (c - cdx);
    alo = cdx - ahi;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * ady;
    bhi = c - (c - ady);
    blo = ady - bhi;
    s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
    t1 = adx * cdy;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * adx;
    ahi = c - (c - adx);
    alo = adx - ahi;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * cdy;
    bhi = c - (c - cdy);
    blo = cdy - bhi;
    t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
    _i = s0 - t0;
    bvirt = s0 - _i;
    ca[0] = s0 - (_i + bvirt) + (bvirt - t0);
    _j = s1 + _i;
    bvirt = _j - s1;
    _0 = s1 - (_j - bvirt) + (_i - bvirt);
    _i = _0 - t1;
    bvirt = _0 - _i;
    ca[1] = _0 - (_i + bvirt) + (bvirt - t1);
    u3 = _j + _i;
    bvirt = u3 - _j;
    ca[2] = _j - (u3 - bvirt) + (_i - bvirt);
    ca[3] = u3;
    s1 = adx * bdy;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * adx;
    ahi = c - (c - adx);
    alo = adx - ahi;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * bdy;
    bhi = c - (c - bdy);
    blo = bdy - bhi;
    s0 = alo * blo - (s1 - ahi * bhi - alo * bhi - ahi * blo);
    t1 = bdx * ady;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * bdx;
    ahi = c - (c - bdx);
    alo = bdx - ahi;
    c = _util_js__WEBPACK_IMPORTED_MODULE_0__.splitter * ady;
    bhi = c - (c - ady);
    blo = ady - bhi;
    t0 = alo * blo - (t1 - ahi * bhi - alo * bhi - ahi * blo);
    _i = s0 - t0;
    bvirt = s0 - _i;
    ab[0] = s0 - (_i + bvirt) + (bvirt - t0);
    _j = s1 + _i;
    bvirt = _j - s1;
    _0 = s1 - (_j - bvirt) + (_i - bvirt);
    _i = _0 - t1;
    bvirt = _0 - _i;
    ab[1] = _0 - (_i + bvirt) + (bvirt - t1);
    u3 = _j + _i;
    bvirt = u3 - _j;
    ab[2] = _j - (u3 - bvirt) + (_i - bvirt);
    ab[3] = u3;

    finlen = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.sum)(
        (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.sum)(
            (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(4, bc, adz, _8), _8,
            (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(4, ca, bdz, _8b), _8b, _16), _16,
        (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(4, ab, cdz, _8), _8, fin);

    let det = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.estimate)(finlen, fin);
    let errbound = o3derrboundB * permanent;
    if (det >= errbound || -det >= errbound) {
        return det;
    }

    bvirt = ax - adx;
    adxtail = ax - (adx + bvirt) + (bvirt - dx);
    bvirt = bx - bdx;
    bdxtail = bx - (bdx + bvirt) + (bvirt - dx);
    bvirt = cx - cdx;
    cdxtail = cx - (cdx + bvirt) + (bvirt - dx);
    bvirt = ay - ady;
    adytail = ay - (ady + bvirt) + (bvirt - dy);
    bvirt = by - bdy;
    bdytail = by - (bdy + bvirt) + (bvirt - dy);
    bvirt = cy - cdy;
    cdytail = cy - (cdy + bvirt) + (bvirt - dy);
    bvirt = az - adz;
    adztail = az - (adz + bvirt) + (bvirt - dz);
    bvirt = bz - bdz;
    bdztail = bz - (bdz + bvirt) + (bvirt - dz);
    bvirt = cz - cdz;
    cdztail = cz - (cdz + bvirt) + (bvirt - dz);

    if (adxtail === 0 && bdxtail === 0 && cdxtail === 0 &&
        adytail === 0 && bdytail === 0 && cdytail === 0 &&
        adztail === 0 && bdztail === 0 && cdztail === 0) {
        return det;
    }

    errbound = o3derrboundC * permanent + _util_js__WEBPACK_IMPORTED_MODULE_0__.resulterrbound * Math.abs(det);
    det +=
        adz * (bdx * cdytail + cdy * bdxtail - (bdy * cdxtail + cdx * bdytail)) + adztail * (bdx * cdy - bdy * cdx) +
        bdz * (cdx * adytail + ady * cdxtail - (cdy * adxtail + adx * cdytail)) + bdztail * (cdx * ady - cdy * adx) +
        cdz * (adx * bdytail + bdy * adxtail - (ady * bdxtail + bdx * adytail)) + cdztail * (adx * bdy - ady * bdx);
    if (det >= errbound || -det >= errbound) {
        return det;
    }

    const at_len = tailinit(adxtail, adytail, bdx, bdy, cdx, cdy, at_b, at_c);
    const bt_len = tailinit(bdxtail, bdytail, cdx, cdy, adx, ady, bt_c, bt_a);
    const ct_len = tailinit(cdxtail, cdytail, adx, ady, bdx, bdy, ct_a, ct_b);

    const bctlen = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.sum)(bt_len, bt_c, ct_len, ct_b, bct);
    finlen = finadd(finlen, (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(bctlen, bct, adz, _16), _16);

    const catlen = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.sum)(ct_len, ct_a, at_len, at_c, cat);
    finlen = finadd(finlen, (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(catlen, cat, bdz, _16), _16);

    const abtlen = (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.sum)(at_len, at_b, bt_len, bt_a, abt);
    finlen = finadd(finlen, (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(abtlen, abt, cdz, _16), _16);

    if (adztail !== 0) {
        finlen = finadd(finlen, (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(4, bc, adztail, _12), _12);
        finlen = finadd(finlen, (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(bctlen, bct, adztail, _16), _16);
    }
    if (bdztail !== 0) {
        finlen = finadd(finlen, (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(4, ca, bdztail, _12), _12);
        finlen = finadd(finlen, (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(catlen, cat, bdztail, _16), _16);
    }
    if (cdztail !== 0) {
        finlen = finadd(finlen, (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(4, ab, cdztail, _12), _12);
        finlen = finadd(finlen, (0,_util_js__WEBPACK_IMPORTED_MODULE_0__.scale)(abtlen, abt, cdztail, _16), _16);
    }

    if (adxtail !== 0) {
        if (bdytail !== 0) {
            finlen = tailadd(finlen, adxtail, bdytail, cdz, cdztail);
        }
        if (cdytail !== 0) {
            finlen = tailadd(finlen, -adxtail, cdytail, bdz, bdztail);
        }
    }
    if (bdxtail !== 0) {
        if (cdytail !== 0) {
            finlen = tailadd(finlen, bdxtail, cdytail, adz, adztail);
        }
        if (adytail !== 0) {
            finlen = tailadd(finlen, -bdxtail, adytail, cdz, cdztail);
        }
    }
    if (cdxtail !== 0) {
        if (adytail !== 0) {
            finlen = tailadd(finlen, cdxtail, adytail, bdz, bdztail);
        }
        if (bdytail !== 0) {
            finlen = tailadd(finlen, -cdxtail, bdytail, adz, adztail);
        }
    }

    return fin[finlen - 1];
}

function orient3d(ax, ay, az, bx, by, bz, cx, cy, cz, dx, dy, dz) {
    const adx = ax - dx;
    const bdx = bx - dx;
    const cdx = cx - dx;
    const ady = ay - dy;
    const bdy = by - dy;
    const cdy = cy - dy;
    const adz = az - dz;
    const bdz = bz - dz;
    const cdz = cz - dz;

    const bdxcdy = bdx * cdy;
    const cdxbdy = cdx * bdy;

    const cdxady = cdx * ady;
    const adxcdy = adx * cdy;

    const adxbdy = adx * bdy;
    const bdxady = bdx * ady;

    const det =
        adz * (bdxcdy - cdxbdy) +
        bdz * (cdxady - adxcdy) +
        cdz * (adxbdy - bdxady);

    const permanent =
        (Math.abs(bdxcdy) + Math.abs(cdxbdy)) * Math.abs(adz) +
        (Math.abs(cdxady) + Math.abs(adxcdy)) * Math.abs(bdz) +
        (Math.abs(adxbdy) + Math.abs(bdxady)) * Math.abs(cdz);

    const errbound = o3derrboundA * permanent;
    if (det > errbound || -det > errbound) {
        return det;
    }

    return orient3dadapt(ax, ay, az, bx, by, bz, cx, cy, cz, dx, dy, dz, permanent);
}

function orient3dfast(ax, ay, az, bx, by, bz, cx, cy, cz, dx, dy, dz) {
    const adx = ax - dx;
    const bdx = bx - dx;
    const cdx = cx - dx;
    const ady = ay - dy;
    const bdy = by - dy;
    const cdy = cy - dy;
    const adz = az - dz;
    const bdz = bz - dz;
    const cdz = cz - dz;

    return adx * (bdy * cdz - bdz * cdy) +
        bdx * (cdy * adz - cdz * ady) +
        cdx * (ady * bdz - adz * bdy);
}


/***/ }),

/***/ "./node_modules/robust-predicates/esm/util.js":
/*!****************************************************!*\
  !*** ./node_modules/robust-predicates/esm/util.js ***!
  \****************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   epsilon: function() { return /* binding */ epsilon; },
/* harmony export */   estimate: function() { return /* binding */ estimate; },
/* harmony export */   negate: function() { return /* binding */ negate; },
/* harmony export */   resulterrbound: function() { return /* binding */ resulterrbound; },
/* harmony export */   scale: function() { return /* binding */ scale; },
/* harmony export */   splitter: function() { return /* binding */ splitter; },
/* harmony export */   sum: function() { return /* binding */ sum; },
/* harmony export */   sum_three: function() { return /* binding */ sum_three; },
/* harmony export */   vec: function() { return /* binding */ vec; }
/* harmony export */ });
const epsilon = 1.1102230246251565e-16;
const splitter = 134217729;
const resulterrbound = (3 + 8 * epsilon) * epsilon;

// fast_expansion_sum_zeroelim routine from oritinal code
function sum(elen, e, flen, f, h) {
    let Q, Qnew, hh, bvirt;
    let enow = e[0];
    let fnow = f[0];
    let eindex = 0;
    let findex = 0;
    if ((fnow > enow) === (fnow > -enow)) {
        Q = enow;
        enow = e[++eindex];
    } else {
        Q = fnow;
        fnow = f[++findex];
    }
    let hindex = 0;
    if (eindex < elen && findex < flen) {
        if ((fnow > enow) === (fnow > -enow)) {
            Qnew = enow + Q;
            hh = Q - (Qnew - enow);
            enow = e[++eindex];
        } else {
            Qnew = fnow + Q;
            hh = Q - (Qnew - fnow);
            fnow = f[++findex];
        }
        Q = Qnew;
        if (hh !== 0) {
            h[hindex++] = hh;
        }
        while (eindex < elen && findex < flen) {
            if ((fnow > enow) === (fnow > -enow)) {
                Qnew = Q + enow;
                bvirt = Qnew - Q;
                hh = Q - (Qnew - bvirt) + (enow - bvirt);
                enow = e[++eindex];
            } else {
                Qnew = Q + fnow;
                bvirt = Qnew - Q;
                hh = Q - (Qnew - bvirt) + (fnow - bvirt);
                fnow = f[++findex];
            }
            Q = Qnew;
            if (hh !== 0) {
                h[hindex++] = hh;
            }
        }
    }
    while (eindex < elen) {
        Qnew = Q + enow;
        bvirt = Qnew - Q;
        hh = Q - (Qnew - bvirt) + (enow - bvirt);
        enow = e[++eindex];
        Q = Qnew;
        if (hh !== 0) {
            h[hindex++] = hh;
        }
    }
    while (findex < flen) {
        Qnew = Q + fnow;
        bvirt = Qnew - Q;
        hh = Q - (Qnew - bvirt) + (fnow - bvirt);
        fnow = f[++findex];
        Q = Qnew;
        if (hh !== 0) {
            h[hindex++] = hh;
        }
    }
    if (Q !== 0 || hindex === 0) {
        h[hindex++] = Q;
    }
    return hindex;
}

function sum_three(alen, a, blen, b, clen, c, tmp, out) {
    return sum(sum(alen, a, blen, b, tmp), tmp, clen, c, out);
}

// scale_expansion_zeroelim routine from oritinal code
function scale(elen, e, b, h) {
    let Q, sum, hh, product1, product0;
    let bvirt, c, ahi, alo, bhi, blo;

    c = splitter * b;
    bhi = c - (c - b);
    blo = b - bhi;
    let enow = e[0];
    Q = enow * b;
    c = splitter * enow;
    ahi = c - (c - enow);
    alo = enow - ahi;
    hh = alo * blo - (Q - ahi * bhi - alo * bhi - ahi * blo);
    let hindex = 0;
    if (hh !== 0) {
        h[hindex++] = hh;
    }
    for (let i = 1; i < elen; i++) {
        enow = e[i];
        product1 = enow * b;
        c = splitter * enow;
        ahi = c - (c - enow);
        alo = enow - ahi;
        product0 = alo * blo - (product1 - ahi * bhi - alo * bhi - ahi * blo);
        sum = Q + product0;
        bvirt = sum - Q;
        hh = Q - (sum - bvirt) + (product0 - bvirt);
        if (hh !== 0) {
            h[hindex++] = hh;
        }
        Q = product1 + sum;
        hh = sum - (Q - product1);
        if (hh !== 0) {
            h[hindex++] = hh;
        }
    }
    if (Q !== 0 || hindex === 0) {
        h[hindex++] = Q;
    }
    return hindex;
}

function negate(elen, e) {
    for (let i = 0; i < elen; i++) e[i] = -e[i];
    return elen;
}

function estimate(elen, e) {
    let Q = e[0];
    for (let i = 1; i < elen; i++) Q += e[i];
    return Q;
}

function vec(n) {
    return new Float64Array(n);
}


/***/ }),

/***/ "./node_modules/robust-predicates/index.js":
/*!*************************************************!*\
  !*** ./node_modules/robust-predicates/index.js ***!
  \*************************************************/
/***/ (function(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   incircle: function() { return /* reexport safe */ _esm_incircle_js__WEBPACK_IMPORTED_MODULE_2__.incircle; },
/* harmony export */   incirclefast: function() { return /* reexport safe */ _esm_incircle_js__WEBPACK_IMPORTED_MODULE_2__.incirclefast; },
/* harmony export */   insphere: function() { return /* reexport safe */ _esm_insphere_js__WEBPACK_IMPORTED_MODULE_3__.insphere; },
/* harmony export */   inspherefast: function() { return /* reexport safe */ _esm_insphere_js__WEBPACK_IMPORTED_MODULE_3__.inspherefast; },
/* harmony export */   orient2d: function() { return /* reexport safe */ _esm_orient2d_js__WEBPACK_IMPORTED_MODULE_0__.orient2d; },
/* harmony export */   orient2dfast: function() { return /* reexport safe */ _esm_orient2d_js__WEBPACK_IMPORTED_MODULE_0__.orient2dfast; },
/* harmony export */   orient3d: function() { return /* reexport safe */ _esm_orient3d_js__WEBPACK_IMPORTED_MODULE_1__.orient3d; },
/* harmony export */   orient3dfast: function() { return /* reexport safe */ _esm_orient3d_js__WEBPACK_IMPORTED_MODULE_1__.orient3dfast; }
/* harmony export */ });
/* harmony import */ var _esm_orient2d_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./esm/orient2d.js */ "./node_modules/robust-predicates/esm/orient2d.js");
/* harmony import */ var _esm_orient3d_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./esm/orient3d.js */ "./node_modules/robust-predicates/esm/orient3d.js");
/* harmony import */ var _esm_incircle_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./esm/incircle.js */ "./node_modules/robust-predicates/esm/incircle.js");
/* harmony import */ var _esm_insphere_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./esm/insphere.js */ "./node_modules/robust-predicates/esm/insphere.js");







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
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
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
/* harmony import */ var _utilities_gift_shop__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./utilities/gift_shop */ "./source/utilities/gift_shop.ts");
/* harmony import */ var _utilities_territory__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./utilities/territory */ "./source/utilities/territory.ts");
/* harmony import */ var webpack_merge__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! webpack-merge */ "./node_modules/webpack-merge/dist/index.js");
/* harmony import */ var webpack_merge__WEBPACK_IMPORTED_MODULE_12___default = /*#__PURE__*/__webpack_require__.n(webpack_merge__WEBPACK_IMPORTED_MODULE_12__);
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};













let SAT_VERSION = "git-version";
if (NeptunesPride === undefined) {
    _game__WEBPACK_IMPORTED_MODULE_1__.thisGame.neptunesPride = NeptunesPride;
}
// toProperCase makes a string Title Case
String.prototype.toProperCase = function () {
    return this.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
};
//This should count the quantity of an array given a filter
// TODO: Find out where this is used?
Object.defineProperties(Array.prototype, {
    find: {
        value: function (value) {
            return this.filter((x) => x == value).length;
        },
    },
});
/* Extra Badges */
let ape_players = [];
function get_ape_players() {
    return __awaiter(this, void 0, void 0, function* () {
        (0,_utilities_player_badges__WEBPACK_IMPORTED_MODULE_9__.get_ape_badges)()
            .then((players) => {
            ape_players = players;
        })
            .catch((err) => console.log("ERROR: Unable to get APE players", err));
    });
}
get_ape_players();
//Override widget intefaces
const overrideBadgeWidgets = () => {
    NeptunesPride.npui.badgeFileNames["a"] = "ape";
    const image_url = $("#ape-intel-plugin").attr("images");
    NeptunesPride.npui.BadgeIcon = (filename, count, small) => (0,_utilities_player_badges__WEBPACK_IMPORTED_MODULE_9__.ApeBadgeIcon)(Crux, image_url, filename, count, small);
};
const overrideTemplates = () => {
    let ape = "<h3>Ape - 420 Credits</h3><p>Is this what you call 'evolution'? Because frankly, I've seen better designs of a banana peel.</p>";
    let wizard = "<h3>Wizard Badge - ? Credits</h3><p>Awarded to members of the community that have made a significant contribution to the game. Code for a new feature or a map design we all enjoyed.</p>";
    let rat = "<h3>Lab Rat - ? Crets  </h3><p>Awarded to players who have helped test the most crazy new features and game types. Keep an eye on the forums if you would like to subject yourself to the game's experiments.</p>";
    let bullseye = "<h3>Bullseye - ? Credits  </h3><p>They really hit the target.</p>";
    let flambeau = "<h3>Flambeau - ? Credits  </h3><p>This player really lit up your life.</p>";
    let tourney_join = "<h3>Tournement Participation - ? Credits  </h3><p>Hey at least you tried.\nAwarded to each player that participates in an official tournament.</p>";
    let tourney_win = "<h3>Tournement Winner - ? Credits  </h3><p>Hey at least you won.\nAwarded to the winner of an official tournament.</p>";
    let proteus = "<h3>Proteus Victory - ? Credits  </h3><p>Awarded to players who win a game of Proteus!</p>";
    let honour = "<h3>Special Badge of Honor - ? Credits  </h3><p>Buy one get one free!\nAwarded for every gift purchased for another player. These players go above and beyond the call of duty in support of the game!</p>";
    NeptunesPride.templates["gift_desc_ape"] = ape;
    NeptunesPride.templates["gift_desc_wizard"] = wizard;
    NeptunesPride.templates["gift_desc_rat"] = rat;
    NeptunesPride.templates["gift_desc_bullseye"] = bullseye;
    NeptunesPride.templates["gift_desc_flambeau"] = flambeau;
    NeptunesPride.templates["gift_desc_tourney_join"] = tourney_join;
    NeptunesPride.templates["gift_desc_tourney_win"] = tourney_win;
    NeptunesPride.templates["gift_desc_proteus"] = proteus;
    NeptunesPride.templates["gift_desc_honour"] = honour;
    //NeptunesPride.templates["gift_desc_lifetime"] = lifetime
    Crux.localise = function (id) {
        if (Crux.templates[id]) {
            return Crux.templates[id];
        }
        else {
            return id.toProperCase();
        }
    };
};
const overrideGiftItems = () => {
    const image_url = $("#ape-intel-plugin").attr("images");
    NeptunesPride.npui.BuyGiftScreen = () => {
        return (0,_utilities_gift_shop__WEBPACK_IMPORTED_MODULE_10__.buyApeGiftScreen)(Crux, NeptunesPride.universe, NeptunesPride.npui);
    };
    NeptunesPride.npui.GiftItem = (item) => {
        return (0,_utilities_gift_shop__WEBPACK_IMPORTED_MODULE_10__.ApeGiftItem)(Crux, image_url, item);
    };
};
const overrideShowScreen = () => {
    NeptunesPride.npui.onShowScreen = (event, screenName, screenConfig) => {
        return onShowApeScreen(NeptunesPride.npui, NeptunesPride.universe, event, screenName, screenConfig);
    };
};
/*$("ape-intel-plugin").ready(() => {
  //$("#ape-intel-plugin").remove();
});*/
function post_hook() {
    overrideGiftItems();
    //overrideShowScreen(); //Not needed unless I want to add new ones.
    overrideTemplates();
    overrideBadgeWidgets();
    (0,_utilities_territory__WEBPACK_IMPORTED_MODULE_11__.getTerritory)(NeptunesPride.universe, $("canvas")[0]);
    SAT_VERSION = $("#ape-intel-plugin").attr("title");
    console.log(SAT_VERSION, "Loaded");
}
//TODO: Organize typescript to an interfaces directory
//TODO: Then make other gFame engine objects
// Part of your code is re-creating the game in typescript
// The other part is adding features
// Then there is a segment that is overwriting existing content to add small additions.
//Add custom settings when making a nwe game.
function modify_custom_game() {
    console.log("Running custom game settings modification");
    let selector = $("#contentArea > div > div.widget.fullscreen > div.widget.rel > div:nth-child(4) > div:nth-child(15) > select")[0];
    if (selector == undefined) {
        //Not in menu
        return;
    }
    let textString = "";
    for (let i = 2; i <= 32; ++i) {
        textString += `<option value="${i}">${i} Players</option>`;
    }
    console.log(textString);
    selector.innerHTML = textString;
}
setTimeout(modify_custom_game, 500);
//TODO: Make is within scanning function
//Share all tech display as tech is actively trading.
const display_tech_trading = () => {
    let npui = NeptunesPride.npui;
    var tech_trade_screen = npui.Screen("tech_trading");
    npui.onHideScreen(null, true);
    npui.onHideSelectionMenu();
    npui.trigger("hide_side_menu");
    npui.trigger("reset_edit_mode");
    npui.activeScreen = tech_trade_screen;
    tech_trade_screen.roost(npui.screenContainer);
    npui.layoutElement(tech_trade_screen);
    let trading = Crux.Text("", "rel pad12").rawHTML("Trading..");
    trading.roost(tech_trade_screen);
    tech_trade_screen.transact = (text) => {
        let trading = Crux.Text("", "rel pad8").rawHTML(text);
        trading.roost(tech_trade_screen);
    };
    return tech_trade_screen;
};
//Returns all stars I suppose
const _get_star_gis = () => {
    let stars = NeptunesPride.universe.galaxy.stars;
    let output = [];
    for (const s in stars) {
        let star = stars[s];
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
const _get_weapons_next = () => {
    const research = get_research();
    if (research["current_name"] == "Weapons") {
        return research["current_eta"];
    }
    else if (research["next_name"] == "Weapons") {
        return research["next_eta"];
    }
    return Math.pow(10, 10);
};
const get_tech_trade_cost = (from, to, tech_name = null) => {
    let total_cost = 0;
    for (const [tech, value] of Object.entries(to.tech)) {
        if (tech_name == null || tech_name == tech) {
            let me = from.tech[tech].level;
            let you = value.level;
            for (let i = 1; i <= me - you; ++i) {
                //console.log(tech,(you+i),(you+i)*15)
                total_cost += (you + i) * NeptunesPride.gameConfig.tradeCost;
            }
        }
    }
    return total_cost;
};
//Hooks to buttons for sharing and buying
//Pretty simple hooks that can be added to a typescript file.
const apply_hooks = () => {
    NeptunesPride.np.on("share_all_tech", (event, player) => {
        let total_cost = get_tech_trade_cost((0,_get_hero__WEBPACK_IMPORTED_MODULE_2__.get_hero)(NeptunesPride.universe), player);
        NeptunesPride.templates[`confirm_tech_share_${player.uid}`] = `Are you sure you want to spend $${total_cost} to give ${player.rawAlias} all of your tech?`;
        NeptunesPride.np.trigger("show_screen", [
            "confirm",
            {
                message: `confirm_tech_share_${player.uid}`,
                eventKind: "confirm_trade_tech",
                eventData: player,
            },
        ]);
    });
    NeptunesPride.np.on("buy_all_tech", (event, data) => {
        let player = data.player;
        let cost = data.cost;
        NeptunesPride.templates[`confirm_tech_share_${player.uid}`] = `Are you sure you want to spend $${cost} to buy all of ${player.rawAlias}'s tech? It is up to them to actually send it to you.`;
        NeptunesPride.np.trigger("show_screen", [
            "confirm",
            {
                message: `confirm_tech_share_${player.uid}`,
                eventKind: "confirm_buy_tech",
                eventData: data,
            },
        ]);
    });
    NeptunesPride.np.on("buy_one_tech", (event, data) => {
        let player = data.player;
        let tech = data.tech;
        let cost = data.cost;
        NeptunesPride.templates[`confirm_tech_share_${player.uid}`] = `Are you sure you want to spend $${cost} to buy ${tech} from ${player.rawAlias}? It is up to them to actually send it to you.`;
        NeptunesPride.np.trigger("show_screen", [
            "confirm",
            {
                message: `confirm_tech_share_${player.uid}`,
                eventKind: "confirm_buy_tech",
                eventData: data,
            },
        ]);
    });
    NeptunesPride.np.on("confirm_trade_tech", (even, player) => {
        let hero = (0,_get_hero__WEBPACK_IMPORTED_MODULE_2__.get_hero)(NeptunesPride.universe);
        let display = display_tech_trading();
        const close = () => {
            NeptunesPride.universe.selectPlayer(player);
            NeptunesPride.np.trigger("refresh_interface");
            NeptunesPride.np.npui.refreshTurnManager();
        };
        let offset = 300;
        for (const [tech, value] of Object.entries(player.tech)) {
            let me = hero.tech[tech].level;
            let you = value.level;
            for (let i = 1; i <= me - you; ++i) {
                setTimeout(() => {
                    console.log(me - you, {
                        type: "order",
                        order: `share_tech,${player.uid},${tech}`,
                    });
                    display.transact(`Sending ${tech} level ${you + i}`);
                    NeptunesPride.np.trigger("server_request", {
                        type: "order",
                        order: `share_tech,${player.uid},${tech}`,
                    });
                    if (i == me - you) {
                        display.transact("Done.");
                    }
                }, offset);
                offset += 1000;
            }
        }
        setTimeout(close, offset + 1000);
    });
    //Pays a player a certain amount
    NeptunesPride.np.on("confirm_buy_tech", (even, data) => {
        let player = data.player;
        NeptunesPride.np.trigger("server_request", {
            type: "order",
            order: `send_money,${player.uid},${data.cost}`,
        });
        NeptunesPride.universe.selectPlayer(player);
        NeptunesPride.np.trigger("refresh_interface");
    });
};
const _wide_view = () => {
    NeptunesPride.np.trigger("map_center_slide", { x: 0, y: 0 });
    NeptunesPride.np.trigger("zoom_minimap");
};
function Legacy_NeptunesPrideAgent() {
    var _a, _b;
    let title = ((_a = document === null || document === void 0 ? void 0 : document.currentScript) === null || _a === void 0 ? void 0 : _a.title) || `SAT ${SAT_VERSION}`;
    let version = title.replace(/^.*v/, "v");
    let copy = function (reportFn) {
        return function () {
            reportFn();
            navigator.clipboard.writeText(_hotkey__WEBPACK_IMPORTED_MODULE_3__.lastClip);
        };
    };
    let hotkeys = [];
    let hotkey = function (key, action) {
        hotkeys.push([key, action]);
        Mousetrap.bind(key, copy(action));
    };
    if (!String.prototype.format) {
        String.prototype.format = function (...args) {
            return this.replace(/{(\d+)}/g, function (match, number) {
                if (typeof args[number] === "number") {
                    return Math.trunc(args[number] * 1000) / 1000;
                }
                return typeof args[number] != "undefined" ? args[number] : match;
            });
        };
    }
    const linkFleets = function () {
        let universe = NeptunesPride.universe;
        let fleets = NeptunesPride.universe.galaxy.fleets;
        for (const f in fleets) {
            let fleet = fleets[f];
            let fleetLink = `<a onClick='Crux.crux.trigger(\"show_fleet_uid\", \"${fleet.uid}\")'>${fleet.n}</a>`;
            universe.hyperlinkedMessageInserts[fleet.n] = fleetLink;
        }
    };
    function starReport() {
        let players = NeptunesPride.universe.galaxy.players;
        let stars = NeptunesPride.universe.galaxy.stars;
        let output = [];
        for (const p in players) {
            output.push("[[{0}]]".format(p));
            for (const s in stars) {
                let star = stars[s];
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
    let ampm = function (h, m) {
        if (m < 10)
            m = `0${m}`;
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
    let msToTick = function (tick, wholeTime) {
        let universe = NeptunesPride.universe;
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
    let days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    let msToEtaString = function (msplus, prefix) {
        let now = new Date();
        let arrival = new Date(now.getTime() + msplus);
        let p = prefix !== undefined ? prefix : "ETA ";
        //What is ttt?
        let ttt = p + ampm(arrival.getHours(), arrival.getMinutes());
        if (!NeptunesPride.gameConfig.turnBased) {
            ttt = p + ampm(arrival.getHours(), arrival.getMinutes());
            if (arrival.getDay() != now.getDay())
                // Generate time string
                ttt = `${p}${days[arrival.getDay()]} @ ${ampm(arrival.getHours(), arrival.getMinutes())}`;
        }
        else {
            let totalETA = arrival - now;
            ttt = p + Crux.formatTime(totalETA);
        }
        return ttt;
    };
    let tickToEtaString = function (tick, prefix) {
        let msplus = msToTick(tick);
        return msToEtaString(msplus, prefix);
    };
    let msToCycleString = function (msplus, prefix) {
        let p = prefix !== undefined ? prefix : "ETA";
        let cycleLength = NeptunesPride.universe.galaxy.production_rate;
        let tickLength = NeptunesPride.universe.galaxy.tick_rate;
        let ticksToComplete = Math.ceil(msplus / 60000 / tickLength);
        //Generate time text string
        let ttt = `${p}${ticksToComplete} ticks - ${(ticksToComplete / cycleLength).toFixed(2)}C`;
        return ttt;
    };
    let fleetOutcomes = {};
    let combatHandicap = 0;
    let combatOutcomes = function () {
        var _a;
        let universe = NeptunesPride.universe;
        let players = NeptunesPride.universe.galaxy.players;
        let fleets = NeptunesPride.universe.galaxy.fleets;
        let stars = NeptunesPride.universe.galaxy.stars;
        let flights = [];
        fleetOutcomes = {};
        for (const f in fleets) {
            let fleet = fleets[f];
            if (fleet.o && fleet.o.length > 0) {
                let stop = fleet.o[0][1];
                let ticks = fleet.etaFirst;
                let starname = (_a = stars[stop]) === null || _a === void 0 ? void 0 : _a.n;
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
        let arrivals = {};
        let output = [];
        let arrivalTimes = [];
        let starstate = {};
        for (const i in flights) {
            let fleet = flights[i][2];
            if (fleet.orbiting) {
                let orbit = fleet.orbiting.uid;
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
            let arrivalKey = [flights[i][0], fleet.o[0][1]];
            if (arrivals[arrivalKey] !== undefined) {
                arrivals[arrivalKey].push(fleet);
            }
            else {
                arrivals[arrivalKey] = [fleet];
            }
        }
        for (const k in arrivals) {
            let arrival = arrivals[k];
            let ka = k.split(",");
            let tick = ka[0];
            let starId = ka[1];
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
                let minDistance = 10000;
                let owner = -1;
                for (const i in arrival) {
                    let fleet = arrival[i];
                    let d = universe.distance(stars[starId].x, stars[starId].y, fleet.lx, fleet.ly);
                    if (d < minDistance || owner == -1) {
                        owner = fleet.puid;
                        minDistance = d;
                    }
                }
                starstate[starId].puid = owner;
            }
            output.push("{0}: [[{1}]] [[{2}]] {3} ships".format(tickToEtaString(tick, "@"), starstate[starId].puid, stars[starId].n, starstate[starId].ships));
            let tickDelta = tick - starstate[starId].last_updated - 1;
            if (tickDelta > 0) {
                let oldShips = starstate[starId].ships;
                starstate[starId].last_updated = tick - 1;
                if (stars[starId].shipsPerTick) {
                    let oldc = starstate[starId].c;
                    starstate[starId].ships +=
                        stars[starId].shipsPerTick * tickDelta + oldc;
                    starstate[starId].c =
                        starstate[starId].ships - Math.trunc(starstate[starId].ships);
                    starstate[starId].ships -= starstate[starId].c;
                    output.push("  {0}+{3} + {2}/h = {1}+{4}".format(oldShips, starstate[starId].ships, stars[starId].shipsPerTick, oldc, starstate[starId].c));
                }
            }
            for (const i in arrival) {
                let fleet = arrival[i];
                if (fleet.puid == starstate[starId].puid ||
                    starstate[starId].puid == -1) {
                    let oldShips = starstate[starId].ships;
                    if (starstate[starId].puid == -1) {
                        starstate[starId].ships = fleet.st;
                    }
                    else {
                        starstate[starId].ships += fleet.st;
                    }
                    let landingString = "  {0} + {2} on [[{3}]] = {1}".format(oldShips, starstate[starId].ships, fleet.st, fleet.n);
                    output.push(landingString);
                    landingString = landingString.substring(2);
                }
            }
            for (const i in arrival) {
                let fleet = arrival[i];
                if (fleet.puid == starstate[starId].puid) {
                    let outcomeString = "{0} ships on {1}".format(Math.floor(starstate[starId].ships), stars[starId].n);
                    fleetOutcomes[fleet.uid] = {
                        eta: tickToEtaString(fleet.etaFirst),
                        outcome: outcomeString,
                    };
                }
            }
            let awt = 0;
            let offense = 0;
            let contribution = {};
            for (const i in arrival) {
                let fleet = arrival[i];
                if (fleet.puid != starstate[starId].puid) {
                    let olda = offense;
                    offense += fleet.st;
                    output.push("  [[{4}]]! {0} + {2} on [[{3}]] = {1}".format(olda, offense, fleet.st, fleet.n, fleet.puid));
                    contribution[[fleet.puid, fleet.uid]] = fleet.st;
                    let wt = players[fleet.puid].tech.weapons.level;
                    if (wt > awt) {
                        awt = wt;
                    }
                }
            }
            let attackersAggregate = offense;
            while (offense > 0) {
                let dwt = players[starstate[starId].puid].tech.weapons.level;
                let defense = starstate[starId].ships;
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
                let newAggregate = 0;
                let playerContribution = {};
                let biggestPlayer = -1;
                let biggestPlayerId = starstate[starId].puid;
                if (offense > 0) {
                    output.push("  Attackers win with {0} ships remaining".format(offense));
                    for (const k in contribution) {
                        let ka = k.split(",");
                        let fleet = fleets[ka[1]];
                        let playerId = ka[0];
                        contribution[k] = (offense * contribution[k]) / attackersAggregate;
                        newAggregate += contribution[k];
                        if (playerContribution[playerId]) {
                            playerContribution[playerId] += contribution[k];
                        }
                        else {
                            playerContribution[playerId] = contribution[k];
                        }
                        if (playerContribution[playerId] > biggestPlayer) {
                            biggestPlayer = playerContribution[playerId];
                            biggestPlayerId = playerId;
                        }
                        output.push("    [[{0}]] has {1} on [[{2}]]".format(fleet.puid, contribution[k], fleet.n));
                        let outcomeString = "Wins! {0} land.".format(contribution[k]);
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
                    for (const i in arrival) {
                        let fleet = arrival[i];
                        if (fleet.puid == starstate[starId].puid) {
                            let outcomeString = "{0} ships on {1}".format(Math.floor(starstate[starId].ships), stars[starId].n);
                            fleetOutcomes[fleet.uid] = {
                                eta: tickToEtaString(fleet.etaFirst),
                                outcome: outcomeString,
                            };
                        }
                    }
                    for (const k in contribution) {
                        let ka = k.split(",");
                        let fleet = fleets[ka[1]];
                        let outcomeString = "Loses! {0} live.".format(defense);
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
        let fleets = NeptunesPride.universe.galaxy.fleets;
        let stars = NeptunesPride.universe.galaxy.stars;
        let flights = [];
        for (const f in fleets) {
            let fleet = fleets[f];
            if (fleet.o && fleet.o.length > 0) {
                let stop = fleet.o[0][1];
                let ticks = fleet.etaFirst;
                let starname = (_a = stars[stop]) === null || _a === void 0 ? void 0 : _a.n;
                if (!starname)
                    continue;
                flights.push([
                    ticks,
                    "[[{0}]] [[{1}]] {2} → [[{3}]] {4}".format(fleet.puid, fleet.n, fleet.st, stars[stop].n, tickToEtaString(ticks, "")),
                ]);
            }
        }
        flights = flights.sort(function (a, b) {
            return a[0] - b[0];
        });
        (0,_hotkey__WEBPACK_IMPORTED_MODULE_3__.clip)(flights.map((x) => x[1]).join("\n"));
    }
    hotkey("^", briefFleetReport);
    briefFleetReport.help =
        "Generate a summary fleet report on all carriers in your scanning range, and copy it to the clipboard." +
            "<p>This same report can also be viewed via the menu; enter the agent and choose it from the dropdown.";
    function screenshot() {
        let map = NeptunesPride.npui.map;
        (0,_hotkey__WEBPACK_IMPORTED_MODULE_3__.clip)(map.canvas[0].toDataURL("image/webp", 0.05));
    }
    hotkey("#", screenshot);
    screenshot.help =
        "Create a data: URL of the current map. Paste it into a browser window to view. This is likely to be removed.";
    let homePlanets = function () {
        let p = NeptunesPride.universe.galaxy.players;
        let output = [];
        for (let i in p) {
            let home = p[i].home;
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
    let playerSheet = function () {
        let p = NeptunesPride.universe.galaxy.players;
        let output = [];
        let fields = [
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
        for (let i in p) {
            player = Object.assign({}, p[i]);
            const record = fields.map((f) => p[i][f]);
            output.push(record.join(","));
        }
        (0,_hotkey__WEBPACK_IMPORTED_MODULE_3__.clip)(output.join("\n"));
    };
    hotkey("$", playerSheet);
    playerSheet.help =
        "Generate a player summary mean to be made into a spreadsheet." +
            "<p>The clipboard should be pasted into a CSV and then imported.";
    let hooksLoaded = false;
    let handicapString = function (prefix) {
        let p = prefix !== undefined ? prefix : combatHandicap > 0 ? "Enemy WS" : "My WS";
        return p + (combatHandicap > 0 ? "+" : "") + combatHandicap;
    };
    let loadHooks = function () {
        post_hook();
        let superDrawText = NeptunesPride.npui.map.drawText;
        NeptunesPride.npui.map.drawText = function () {
            let universe = NeptunesPride.universe;
            let map = NeptunesPride.npui.map;
            superDrawText();
            map.context.font = `${14 * map.pixelRatio}px OpenSansRegular, sans-serif`;
            map.context.fillStyle = "#FF0000";
            map.context.textAlign = "right";
            map.context.textBaseline = "middle";
            let v = version;
            if (combatHandicap !== 0) {
                v = `${handicapString()} ${v}`;
            }
            (0,_utilities_graphics__WEBPACK_IMPORTED_MODULE_7__.drawOverlayString)(map.context, v, map.viewportWidth - 10, map.viewportHeight - 16 * map.pixelRatio);
            if (NeptunesPride.originalPlayer === undefined) {
                NeptunesPride.originalPlayer = universe.player.uid;
            }
            if (NeptunesPride.originalPlayer !== universe.player.uid) {
                let n = universe.galaxy.players[universe.player.uid].alias;
                (0,_utilities_graphics__WEBPACK_IMPORTED_MODULE_7__.drawOverlayString)(map.context, n, map.viewportWidth - 100, map.viewportHeight - 2 * 16 * map.pixelRatio);
            }
            if (universe.selectedFleet && universe.selectedFleet.path.length > 0) {
                //console.log("Selected fleet", universe.selectedFleet);
                map.context.font = `${14 * map.pixelRatio}px OpenSansRegular, sans-serif`;
                map.context.fillStyle = "#FF0000";
                map.context.textAlign = "left";
                map.context.textBaseline = "middle";
                let dy = universe.selectedFleet.y - universe.selectedFleet.ly;
                let dx = universe.selectedFleet.x - universe.selectedFleet.lx;
                dy = universe.selectedFleet.path[0].y - universe.selectedFleet.y;
                dx = universe.selectedFleet.path[0].x - universe.selectedFleet.x;
                let lineHeight = 16 * map.pixelRatio;
                let radius = 2 * 0.028 * map.scale * map.pixelRatio;
                let angle = Math.atan(dy / dx);
                let offsetx = radius * Math.cos(angle);
                let offsety = radius * Math.sin(angle);
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
                let s = fleetOutcomes[universe.selectedFleet.uid].eta;
                let o = fleetOutcomes[universe.selectedFleet.uid].outcome;
                let x = map.worldToScreenX(universe.selectedFleet.x) + offsetx;
                let y = map.worldToScreenY(universe.selectedFleet.y) + offsety;
                if (offsetx < 0) {
                    map.context.textAlign = "right";
                }
                (0,_utilities_graphics__WEBPACK_IMPORTED_MODULE_7__.drawOverlayString)(map.context, s, x, y);
                (0,_utilities_graphics__WEBPACK_IMPORTED_MODULE_7__.drawOverlayString)(map.context, o, x, y + lineHeight);
            }
            if (!NeptunesPride.gameConfig.turnBased &&
                universe.timeToTick(1).length < 3) {
                let lineHeight = 16 * map.pixelRatio;
                map.context.font = `${14 * map.pixelRatio}px OpenSansRegular, sans-serif`;
                map.context.fillStyle = "#FF0000";
                map.context.textAlign = "left";
                map.context.textBaseline = "middle";
                let s = "Tick < 10s away!";
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
                let xOffset = 26 * map.pixelRatio;
                //map.context.translate(xOffset, 0);
                let fleets = NeptunesPride.universe.galaxy.fleets;
                for (const f in fleets) {
                    let fleet = fleets[f];
                    if (fleet.puid === universe.player.uid) {
                        let dx = universe.selectedStar.x - fleet.x;
                        let dy = universe.selectedStar.y - fleet.y;
                        let distance = Math.sqrt(dx * dx + dy * dy);
                        let offsetx = xOffset;
                        let offsety = 0;
                        let x = map.worldToScreenX(fleet.x) + offsetx;
                        let y = map.worldToScreenY(fleet.y) + offsety;
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
                                    let stepRadius = NeptunesPride.universe.galaxy.fleet_speed;
                                    if (fleet.warpSpeed)
                                        stepRadius *= 3;
                                    dx = fleet.x - fleet.path[0].x;
                                    dy = fleet.y - fleet.path[0].y;
                                    let angle = Math.atan(dy / dx);
                                    let stepx = stepRadius * Math.cos(angle);
                                    let stepy = stepRadius * Math.sin(angle);
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
                                    let ticks = 0;
                                    do {
                                        let x = ticks * stepx + Number(fleet.x);
                                        let y = ticks * stepy + Number(fleet.y);
                                        //let sx = map.worldToScreenX(x);
                                        //let sy = map.worldToScreenY(y);
                                        dx = x - universe.selectedStar.x;
                                        dy = y - universe.selectedStar.y;
                                        distance = Math.sqrt(dx * dx + dy * dy);
                                        //console.log(distance, x, y);
                                        //drawOverlayString(map.context, "o", sx, sy);
                                        ticks += 1;
                                    } while (distance >
                                        universe.galaxy.players[universe.selectedStar.puid].tech
                                            .scanning.value &&
                                        ticks <= fleet.etaFirst + 1);
                                    ticks -= 1;
                                    let visColor = "#00ff00";
                                    if ((0,_utilities_graphics__WEBPACK_IMPORTED_MODULE_7__.anyStarCanSee)(universe.selectedStar.puid, fleet)) {
                                        visColor = "#888888";
                                    }
                                    (0,_utilities_graphics__WEBPACK_IMPORTED_MODULE_7__.drawOverlayString)(map.context, `Scan ${tickToEtaString(ticks)}`, x, y, visColor);
                                }
                            }
                        }
                    }
                }
                //map.context.translate(-xOffset, 0);
            }
            if (universe.ruler.stars.length == 2) {
                let p1 = universe.ruler.stars[0].puid;
                let p2 = universe.ruler.stars[1].puid;
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
                let uri = sub.replaceAll("&#x2F;", "/");
                pattern = `[[${sub}]]`;
                if (templateData[sub] !== undefined) {
                    s = s.replace(pattern, templateData[sub]);
                }
                else if (/^api:\w{6}$/.test(sub)) {
                    let apiLink = `<a onClick='Crux.crux.trigger(\"switch_user_api\", \"${sub}\")'> View as ${sub}</a>`;
                    apiLink += ` or <a onClick='Crux.crux.trigger(\"merge_user_api\", \"${sub}\")'> Merge ${sub}</a>`;
                    s = s.replace(pattern, apiLink);
                }
                else if ((0,_utilities_parse_utils__WEBPACK_IMPORTED_MODULE_6__.is_valid_image_url)(uri)) {
                    s = s.replace(pattern, `<img width="100%" src='${uri}' />`);
                }
                else if ((0,_utilities_parse_utils__WEBPACK_IMPORTED_MODULE_6__.is_valid_youtube)(uri)) {
                    //Pass
                }
                else {
                    s = s.replace(pattern, `(${sub})`);
                }
            }
            return s;
        };
        let npui = NeptunesPride.npui;
        //Research button to quickly tell friends research
        NeptunesPride.templates["npa_research"] = "Research";
        let superNewMessageCommentBox = npui.NewMessageCommentBox;
        let reportResearchHook = function (_e, _d) {
            let text = (0,_chat__WEBPACK_IMPORTED_MODULE_0__.get_research_text)(NeptunesPride);
            console.log(text);
            let inbox = NeptunesPride.inbox;
            inbox.commentDrafts[inbox.selectedMessage.key] += text;
            inbox.trigger("show_screen", "diplomacy_detail");
        };
        NeptunesPride.np.on("paste_research", reportResearchHook);
        npui.NewMessageCommentBox = function () {
            let widget = superNewMessageCommentBox();
            let research_button = Crux.Button("npa_research", "paste_research", "research").grid(11, 12, 8, 3);
            research_button.roost(widget);
            return widget;
        };
        let superFormatTime = Crux.formatTime;
        let relativeTimes = 0;
        Crux.formatTime = function (ms, mins, secs) {
            switch (relativeTimes) {
                case 0: //standard
                    return superFormatTime(ms, mins, secs);
                case 1: //ETA, - turn(s) for turnbased
                    if (!NeptunesPride.gameConfig.turnBased) {
                        return msToEtaString(ms, "");
                    }
                    else {
                        const tick_rate = NeptunesPride.universe.galaxy.tick_rate;
                        return `${superFormatTime(ms, mins, secs)} - ${(((ms / 3600000) * 10) /
                            tick_rate).toFixed(2)} turn(s)`;
                    }
                case 2: //cycles + ticks format
                    return msToCycleString(ms, "");
            }
        };
        let switchTimes = function () {
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
                get: () => false,
                set: (x) => {
                    console.log("Crux.touchEnabled set ignored", x);
                },
            });
        }
        catch (e) {
            console.log(e);
        }
        Object.defineProperty(NeptunesPride.npui.map, "ignoreMouseEvents", {
            get: () => false,
            set: (x) => {
                console.log("NeptunesPride.npui.map.ignoreMouseEvents set ignored", x);
            },
        });
        hooksLoaded = true;
    };
    let init = function () {
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
        let superOnServerResponse = NeptunesPride.np.onServerResponse;
        NeptunesPride.np.onServerResponse = function (response) {
            superOnServerResponse(response);
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
    let game = NeptunesPride.gameNumber;
    //This puts you into their position.
    //How is it different?
    let switchUser = function (event, data) {
        if (NeptunesPride.originalPlayer === undefined) {
            NeptunesPride.originalPlayer = NeptunesPride.universe.player.uid;
        }
        let code = (data === null || data === void 0 ? void 0 : data.split(":")[1]) || otherUserCode;
        otherUserCode = code;
        if (otherUserCode) {
            let params = {
                game_number: game,
                api_version: "0.1",
                code: otherUserCode,
            };
            let eggers = jQuery.ajax({
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
    let npaHelp = function () {
        let help = [`<H1>${title}</H1>`];
        for (let pair in hotkeys) {
            let key = hotkeys[pair][0];
            let action = hotkeys[pair][1];
            help.push(`<h2>Hotkey: ${key}</h2>`);
            if (action.help) {
                help.push(action.help);
            }
            else {
                help.push(`<p>No documentation yet.<p><code>${action.toLocaleString()}</code>`);
            }
        }
        NeptunesPride.universe.helpHTML = help.join("");
        NeptunesPride.np.trigger("show_screen", "help");
    };
    npaHelp.help = "Display this help screen.";
    hotkey("?", npaHelp);
    var autocompleteMode = 0;
    let autocompleteTrigger = function (e) {
        if (e.target.type === "textarea") {
            if (autocompleteMode) {
                let start = autocompleteMode;
                let endBracket = e.target.value.indexOf("]", start);
                if (endBracket === -1)
                    endBracket = e.target.value.length;
                let autoString = e.target.value.substring(start, endBracket);
                let key = e.key;
                if (key === "]") {
                    autocompleteMode = 0;
                    let m = autoString.match(/^[0-9][0-9]*$/);
                    if (m === null || m === void 0 ? void 0 : m.length) {
                        let puid = Number(autoString);
                        let end = e.target.selectionEnd;
                        let auto = `${puid}]] ${NeptunesPride.universe.galaxy.players[puid].alias}`;
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
                let start = e.target.selectionStart - 2;
                let ss = e.target.value.substring(start, start + 2);
                autocompleteMode = ss === "[[" ? e.target.selectionStart : 0;
            }
        }
    };
    document.body.addEventListener("keyup", autocompleteTrigger);
}
const force_add_custom_player_panel = () => {
    if ("PlayerPanel" in NeptunesPride.npui) {
        add_custom_player_panel();
    }
    else {
        setTimeout(add_custom_player_panel, 3000);
    }
};
const add_custom_player_panel = () => {
    NeptunesPride.npui.PlayerPanel = function (player, showEmpire) {
        let universe = NeptunesPride.universe;
        let npui = NeptunesPride.npui;
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
        Crux.Image(`../images/avatars/160/${player.avatar}.jpg`, "abs")
            .grid(0, 6, 10, 10)
            .roost(playerPanel);
        Crux.Widget(`pci_48_${player.uid}`).grid(7, 13, 3, 3).roost(playerPanel);
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
                    ape_players.forEach((ape_name) => {
                        if (ape_name == player.rawAlias) {
                            myAchievements.badges = `a${myAchievements.badges}`;
                        }
                    });
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
            let total_sell_cost = get_tech_trade_cost((0,_get_hero__WEBPACK_IMPORTED_MODULE_2__.get_hero)(NeptunesPride.universe), player);
            /*** SHARE ALL TECH  ***/
            let btn = Crux.Button("", "share_all_tech", player)
                .addStyle("fwd")
                .rawHTML(`Share All Tech: $${total_sell_cost}`)
                .grid(10, 31, 14, 3);
            //Disable if in a game with FA & Scan (BUG)
            let config = NeptunesPride.gameConfig;
            if (!(config.tradeScanned && config.alliances)) {
                if ((0,_get_hero__WEBPACK_IMPORTED_MODULE_2__.get_hero)(NeptunesPride.universe).cash >= total_sell_cost) {
                    btn.roost(playerPanel);
                }
                else {
                    btn.disable().roost(playerPanel);
                }
            }
            /*** PAY FOR ALL TECH ***/
            let total_buy_cost = get_tech_trade_cost(player, (0,_get_hero__WEBPACK_IMPORTED_MODULE_2__.get_hero)(NeptunesPride.universe));
            btn = Crux.Button("", "buy_all_tech", {
                player: player,
                tech: null,
                cost: total_buy_cost,
            })
                .addStyle("fwd")
                .rawHTML(`Pay for All Tech: $${total_buy_cost}`)
                .grid(10, 49, 14, 3);
            if ((0,_get_hero__WEBPACK_IMPORTED_MODULE_2__.get_hero)(NeptunesPride.universe).cash >= total_sell_cost) {
                btn.roost(playerPanel);
            }
            else {
                btn.disable().roost(playerPanel);
            }
            /*Individual techs*/
            let _name_map = {
                scanning: "Scanning",
                propulsion: "Hyperspace Range",
                terraforming: "Terraforming",
                research: "Experimentation",
                weapons: "Weapons",
                banking: "Banking",
                manufacturing: "Manufacturing",
            };
            let techs = [
                "scanning",
                "propulsion",
                "terraforming",
                "research",
                "weapons",
                "banking",
                "manufacturing",
            ];
            techs.forEach((tech, i) => {
                let one_tech_cost = get_tech_trade_cost(player, (0,_get_hero__WEBPACK_IMPORTED_MODULE_2__.get_hero)(NeptunesPride.universe), tech);
                let one_tech = Crux.Button("", "buy_one_tech", {
                    player: player,
                    tech: tech,
                    cost: one_tech_cost,
                })
                    .addStyle("fwd")
                    .rawHTML(`Pay: $${one_tech_cost}`)
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
            Crux.Text("", `pad8 txt_center ${selectHilightStyle(universe.player.total_stars, player.total_stars)}`)
                .grid(25, 9, 5, 3)
                .rawHTML(universe.player.total_stars)
                .roost(playerPanel);
            Crux.Text("", `pad8 txt_center${selectHilightStyle(universe.player.total_fleets, player.total_fleets)}`)
                .grid(25, 11, 5, 3)
                .rawHTML(universe.player.total_fleets)
                .roost(playerPanel);
            Crux.Text("", `pad8 txt_center${selectHilightStyle(universe.player.total_strength, player.total_strength)}`)
                .grid(25, 13, 5, 3)
                .rawHTML(universe.player.total_strength)
                .roost(playerPanel);
            Crux.Text("", `pad8 txt_center${selectHilightStyle(universe.player.shipsPerTick, player.shipsPerTick)}`)
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
let superStarInspector = NeptunesPride.npui.StarInspector;
NeptunesPride.npui.StarInspector = function () {
    let universe = NeptunesPride.universe;
    let config = NeptunesPride.gameConfig;
    //Call super (Previous StarInspector from gamecode)
    let starInspector = superStarInspector();
    Crux.IconButton("icon-help rel", "show_help", "stars").roost(starInspector.heading);
    Crux.IconButton("icon-doc-text rel", "show_screen", "combat_calculator").roost(starInspector.heading);
    //Append extra function
    function apply_fractional_ships() {
        return __awaiter(this, void 0, void 0, function* () {
            let depth = config.turnBased ? 4 : 3;
            let selector = `#contentArea > div > div.widget.fullscreen > div:nth-child(${depth}) > div > div:nth-child(5) > div.widget.pad12.icon-rocket-inline.txt_right`;
            let element = $(selector);
            let counter = 0;
            let fractional_ship = universe.selectedStar["c"].toFixed(2);
            $(selector).append(fractional_ship);
            while (element.length == 0 && counter <= 100) {
                yield new Promise((r) => setTimeout(r, 10));
                element = $(selector);
                let fractional_ship = universe.selectedStar["c"];
                let new_value = parseInt($(selector).text()) + fractional_ship;
                $(selector).text(new_value.toFixed(2));
                counter += 1;
            }
        });
    }
    if ("c" in universe.selectedStar) {
        apply_fractional_ships();
    }
    return starInspector;
};
//Javascript call
setTimeout(Legacy_NeptunesPrideAgent, 1000);
setTimeout(() => {
    //Typescript call
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFJO0FBQ0o7QUFDQTs7QUFFQSxTQUFTLGtCQUFrQjtBQUMzQjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLFdBQVcsUUFBUTtBQUNuQixXQUFXLFNBQVM7QUFDcEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVMsT0FBTztBQUNoQjtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsV0FBVyxRQUFRO0FBQ25CLFdBQVcsUUFBUTtBQUNuQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLEtBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxzQ0FBc0MsSUFBSTtBQUMxQztBQUNBO0FBQ0E7QUFDQTtBQUNB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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwQ0FBMEMsYUFBYTtBQUN2RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkNBQTJDLGFBQWE7QUFDeEQsaUVBQWlFO0FBQ2pFLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSw0QkFBNEIsYUFBYTtBQUN6QztBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBDQUEwQyxhQUFhO0FBQ3ZEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsc0JBQXNCO0FBQ3RCLFlBQVk7QUFDWjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2IsV0FBVztBQUNYO0FBQ0EsT0FBTzs7QUFFUDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7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SyxDQUFDLCtDQUFLO0FBQ25COztBQUVBO0FBQ0E7O0FBRUE7QUFDQSxRQUFRLDhDQUFRO0FBQ2hCO0FBQ0E7QUFDQSxRQUFRLDhDQUFRO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUSw4Q0FBUTtBQUNoQjtBQUNBO0FBQ0EsUUFBUSw4Q0FBUTtBQUNoQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUSw4Q0FBUTtBQUNoQjtBQUNBO0FBQ0EsUUFBUSw4Q0FBUTtBQUNoQjtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVEsOENBQVE7QUFDaEI7QUFDQTtBQUNBLFFBQVEsOENBQVE7QUFDaEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVEsOENBQVE7QUFDaEI7QUFDQTtBQUNBLFFBQVEsOENBQVE7QUFDaEI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRLDhDQUFRO0FBQ2hCO0FBQ0E7QUFDQSxRQUFRLDhDQUFRO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRLDhDQUFRO0FBQ2hCO0FBQ0E7QUFDQSxRQUFRLDhDQUFRO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUSw4Q0FBUTtBQUNoQjtBQUNBO0FBQ0EsUUFBUSw4Q0FBUTtBQUNoQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUSw4Q0FBUTtBQUNoQjtBQUNBO0FBQ0EsUUFBUSw4Q0FBUTtBQUNoQjtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVEsOENBQVE7QUFDaEI7QUFDQTtBQUNBLFFBQVEsOENBQVE7QUFDaEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVEsOENBQVE7QUFDaEI7QUFDQTtBQUNBLFFBQVEsOENBQVE7QUFDaEI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRLDhDQUFRO0FBQ2hCO0FBQ0E7QUFDQSxRQUFRLDhDQUFRO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRLDhDQUFRO0FBQ2hCO0FBQ0E7QUFDQSxRQUFRLDhDQUFRO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUSw4Q0FBUTtBQUNoQjtBQUNBO0FBQ0EsUUFBUSw4Q0FBUTtBQUNoQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUSw4Q0FBUTtBQUNoQjtBQUNBO0FBQ0EsUUFBUSw4Q0FBUTtBQUNoQjtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVEsOENBQVE7QUFDaEI7QUFDQTtBQUNBLFFBQVEsOENBQVE7QUFDaEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVEsOENBQVE7QUFDaEI7QUFDQTtBQUNBLFFBQVEsOENBQVE7QUFDaEI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRLDhDQUFRO0FBQ2hCO0FBQ0E7QUFDQSxRQUFRLDhDQUFRO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRLDhDQUFRO0FBQ2hCO0FBQ0E7QUFDQSxRQUFRLDhDQUFRO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUSw4Q0FBUTtBQUNoQjtBQUNBO0FBQ0EsUUFBUSw4Q0FBUTtBQUNoQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxxQkFBcUIsbURBQVM7QUFDOUI7QUFDQTtBQUNBLFFBQVEsbURBQVM7QUFDakI7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUEsYUFBYSw2Q0FBRztBQUNoQixhQUFhLDZDQUFHO0FBQ2hCLGFBQWEsNkNBQUc7QUFDaEIsWUFBWSw2Q0FBRzs7QUFFZjtBQUNBO0FBQ0EsV0FBVyxtREFBUztBQUNwQixRQUFRLCtDQUFLLENBQUMsK0NBQUs7QUFDbkIsUUFBUSwrQ0FBSyxDQUFDLCtDQUFLO0FBQ25CLFFBQVEsK0NBQUssQ0FBQywrQ0FBSztBQUNuQjs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxRQUFRLDhDQUFRO0FBQ2hCO0FBQ0E7QUFDQSxRQUFRLDhDQUFRO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUSw4Q0FBUTtBQUNoQjtBQUNBO0FBQ0EsUUFBUSw4Q0FBUTtBQUNoQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUSw4Q0FBUTtBQUNoQjtBQUNBO0FBQ0EsUUFBUSw4Q0FBUTtBQUNoQjtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVEsOENBQVE7QUFDaEI7QUFDQTtBQUNBLFFBQVEsOENBQVE7QUFDaEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVEsOENBQVE7QUFDaEI7QUFDQTtBQUNBLFFBQVEsOENBQVE7QUFDaEI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRLDhDQUFRO0FBQ2hCO0FBQ0E7QUFDQSxRQUFRLDhDQUFRO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRLDhDQUFRO0FBQ2hCO0FBQ0E7QUFDQSxRQUFRLDhDQUFRO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUSw4Q0FBUTtBQUNoQjtBQUNBO0FBQ0EsUUFBUSw4Q0FBUTtBQUNoQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUSw4Q0FBUTtBQUNoQjtBQUNBO0FBQ0EsUUFBUSw4Q0FBUTtBQUNoQjtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVEsOENBQVE7QUFDaEI7QUFDQTtBQUNBLFFBQVEsOENBQVE7QUFDaEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVEsOENBQVE7QUFDaEI7QUFDQTtBQUNBLFFBQVEsOENBQVE7QUFDaEI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRLDhDQUFRO0FBQ2hCO0FBQ0E7QUFDQSxRQUFRLDhDQUFRO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLG1CQUFtQiw2Q0FBRztBQUN0QixRQUFRLDZDQUFHO0FBQ1gsWUFBWSxnREFBTTtBQUNsQjtBQUNBLFFBQVEsNkNBQUc7QUFD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QUFRO0FBQ3hCO0FBQ0E7QUFDQSxnQkFBZ0IsOENBQVE7QUFDeEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQSxnQkFBZ0IsOENBQVE7QUFDeEI7QUFDQTtBQUNBLGdCQUFnQiw4Q0FBUTtBQUN4QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IsOENBQVE7QUFDeEI7QUFDQTtBQUNBLGdCQUFnQiw4Q0FBUTtBQUN4QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0EsZ0JBQWdCLDhDQUFRO0FBQ3hCO0FBQ0E7QUFDQSxnQkFBZ0IsOENBQVE7QUFDeEI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IsOENBQVE7QUFDeEI7QUFDQTtBQUNBLGdCQUFnQiw4Q0FBUTtBQUN4QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLDhDQUFRO0FBQ3hCO0FBQ0E7QUFDQSxnQkFBZ0IsOENBQVE7QUFDeEI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IsOENBQVE7QUFDeEI7QUFDQTtBQUNBLGdCQUFnQiw4Q0FBUTtBQUN4QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFFBQVEsOENBQVE7QUFDaEI7QUFDQTtBQUNBLFFBQVEsOENBQVE7QUFDaEI7QUFDQTtBQUNBO0FBQ0EsUUFBUSw4Q0FBUTtBQUNoQjtBQUNBO0FBQ0E7QUFDQSxRQUFRLDhDQUFRO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUSw4Q0FBUTtBQUNoQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWSw4Q0FBUTtB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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMEJBQTBCLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxJQUFJLEdBQUc7QUFDbEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9DQUFvQyxFQUFFLEVBQUUsR0FBRyxHQUFHLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRTtBQUM1RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRDQUE0QyxHQUFHLEdBQUcsR0FBRyxNQUFNLEVBQUUsTUFBTSxFQUFFO0FBQ3JFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMENBQTBDLEdBQUcsVUFBVSxFQUFFO0FBQ3pEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQ0FBc0MsRUFBRSxLQUFLLEdBQUcsR0FBRyxHQUFHLE1BQU0sRUFBRSxNQUFNLEVBQUU7QUFDdEU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBDQUEwQyxFQUFFO0FBQzVDLDRDQUE0QyxHQUFHLFdBQVcsRUFBRTtBQUM1RCw0Q0FBNEMsR0FBRyxXQUFXLEVBQUU7QUFDNUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzREFBc0QsR0FBRyxHQUFHLEVBQUU7QUFDOUQ7QUFDQTtBQUNBO0FBQ0Esc0RBQXNELEdBQUcsR0FBRyxFQUFFO0FBQzlEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzREFBc0QsR0FBRyxHQUFHLEVBQUU7QUFDOUQ7QUFDQTtBQUNBO0FBQ0Esc0RBQXNELEdBQUcsR0FBRyxFQUFFO0FBQzlEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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Olsid2VicGFjazovL25lcHR1bmVzLXByaWRlLWFnZW50Ly4vbm9kZV9tb2R1bGVzL2Nsb25lLWRlZXAvaW5kZXguanMiLCJ3ZWJwYWNrOi8vbmVwdHVuZXMtcHJpZGUtYWdlbnQvLi9ub2RlX21vZHVsZXMvaXMtcGxhaW4tb2JqZWN0L2luZGV4LmpzIiwid2VicGFjazovL25lcHR1bmVzLXByaWRlLWFnZW50Ly4vbm9kZV9tb2R1bGVzL2lzb2JqZWN0L2luZGV4LmpzIiwid2VicGFjazovL25lcHR1bmVzLXByaWRlLWFnZW50Ly4vbm9kZV9tb2R1bGVzL2tpbmQtb2YvaW5kZXguanMiLCJ3ZWJwYWNrOi8vbmVwdHVuZXMtcHJpZGUtYWdlbnQvLi9ub2RlX21vZHVsZXMvc2hhbGxvdy1jbG9uZS9pbmRleC5qcyIsIndlYnBhY2s6Ly9uZXB0dW5lcy1wcmlkZS1hZ2VudC8uL3NvdXJjZS9jaGF0LnRzIiwid2VicGFjazovL25lcHR1bmVzLXByaWRlLWFnZW50Ly4vc291cmNlL2V2ZW50X2NhY2hlLnRzIiwid2VicGFjazovL25lcHR1bmVzLXByaWRlLWFnZW50Ly4vc291cmNlL2dhbWUudHMiLCJ3ZWJwYWNrOi8vbmVwdHVuZXMtcHJpZGUtYWdlbnQvLi9zb3VyY2UvZ2V0X2hlcm8udHMiLCJ3ZWJwYWNrOi8vbmVwdHVuZXMtcHJpZGUtYWdlbnQvLi9zb3VyY2UvaG90a2V5LnRzIiwid2VicGFjazovL25lcHR1bmVzLXByaWRlLWFnZW50Ly4vc291cmNlL2xlZGdlci50cyIsIndlYnBhY2s6Ly9uZXB0dW5lcy1wcmlkZS1hZ2VudC8uL3NvdXJjZS91dGlsaXRpZXMvYXBpLnRzIiwid2VicGFjazovL25lcHR1bmVzLXByaWRlLWFnZW50Ly4vc291cmNlL3V0aWxpdGllcy9nZXRfZ2FtZV9zdGF0ZS50cyIsIndlYnBhY2s6Ly9uZXB0dW5lcy1wcmlkZS1hZ2VudC8uL3NvdXJjZS91dGlsaXRpZXMvZ2lmdF9zaG9wLnRzIiwid2VicGFjazovL25lcHR1bmVzLXByaWRlLWFnZW50Ly4vc291cmNlL3V0aWxpdGllcy9ncmFwaGljcy50cyIsIndlYnBhY2s6Ly9uZXB0dW5lcy1wcmlkZS1hZ2VudC8uL3NvdXJjZS91dGlsaXRpZXMvbWVyZ2UudHMiLCJ3ZWJwYWNrOi8vbmVwdHVuZXMtcHJpZGUtYWdlbnQvLi9zb3VyY2UvdXRpbGl0aWVzL25wY19jYWxjLnRzIiwid2VicGFjazovL25lcHR1bmVzLXByaWRlLWFnZW50Ly4vc291cmNlL3V0aWxpdGllcy9wYXJzZV91dGlscy50cyIsIndlYnBhY2s6Ly9uZXB0dW5lcy1wcmlkZS1hZ2VudC8uL3NvdXJjZS91dGlsaXRpZXMvcGxheWVyX2JhZGdlcy50cyIsIndlYnBhY2s6Ly9uZXB0dW5lcy1wcmlkZS1hZ2VudC8uL3NvdXJjZS91dGlsaXRpZXMvdGVycml0b3J5LnRzIiwid2VicGFjazovL25lcHR1bmVzLXByaWRlLWFnZW50Ly4vbm9kZV9tb2R1bGVzL3dlYnBhY2stbWVyZ2UvZGlzdC9pbmRleC5qcyIsIndlYnBhY2s6Ly9uZXB0dW5lcy1wcmlkZS1hZ2VudC8uL25vZGVfbW9kdWxlcy93ZWJwYWNrLW1lcmdlL2Rpc3Qvam9pbi1hcnJheXMuanMiLCJ3ZWJwYWNrOi8vbmVwdHVuZXMtcHJpZGUtYWdlbnQvLi9ub2RlX21vZHVsZXMvd2VicGFjay1tZXJnZS9kaXN0L21lcmdlLXdpdGguanMiLCJ3ZWJwYWNrOi8vbmVwdHVuZXMtcHJpZGUtYWdlbnQvLi9ub2RlX21vZHVsZXMvd2VicGFjay1tZXJnZS9kaXN0L3R5cGVzLmpzIiwid2VicGFjazovL25lcHR1bmVzLXByaWRlLWFnZW50Ly4vbm9kZV9tb2R1bGVzL3dlYnBhY2stbWVyZ2UvZGlzdC91bmlxdWUuanMiLCJ3ZWJwYWNrOi8vbmVwdHVuZXMtcHJpZGUtYWdlbnQvLi9ub2RlX21vZHVsZXMvd2VicGFjay1tZXJnZS9kaXN0L3V0aWxzLmpzIiwid2VicGFjazovL25lcHR1bmVzLXByaWRlLWFnZW50Ly4vbm9kZV9tb2R1bGVzL3dpbGRjYXJkL2luZGV4LmpzIiwid2VicGFjazovL25lcHR1bmVzLXByaWRlLWFnZW50Ly4vbm9kZV9tb2R1bGVzL2QzLWRlbGF1bmF5L3NyYy9kZWxhdW5heS5qcyIsIndlYnBhY2s6Ly9uZXB0dW5lcy1wcmlkZS1hZ2VudC8uL25vZGVfbW9kdWxlcy9kMy1kZWxhdW5heS9zcmMvcGF0aC5qcyIsIndlYnBhY2s6Ly9uZXB0dW5lcy1wcmlkZS1hZ2VudC8uL25vZGVfbW9kdWxlcy9kMy1kZWxhdW5heS9zcmMvcG9seWdvbi5qcyIsIndlYnBhY2s6Ly9uZXB0dW5lcy1wcmlkZS1hZ2VudC8uL25vZGVfbW9kdWxlcy9kMy1kZWxhdW5heS9zcmMvdm9yb25vaS5qcyIsIndlYnBhY2s6Ly9uZXB0dW5lcy1wcmlkZS1hZ2VudC8uL25vZGVfbW9kdWxlcy9kZWxhdW5hdG9yL2luZGV4LmpzIiwid2VicGFjazovL25lcHR1bmVzLXByaWRlLWFnZW50Ly4vbm9kZV9tb2R1bGVzL21hcmtlZC9saWIvbWFya2VkLmVzbS5qcyIsIndlYnBhY2s6Ly9uZXB0dW5lcy1wcmlkZS1hZ2VudC8uL25vZGVfbW9kdWxlcy9yb2J1c3QtcHJlZGljYXRlcy9lc20vaW5jaXJjbGUuanMiLCJ3ZWJwYWNrOi8vbmVwdHVuZXMtcHJpZGUtYWdlbnQvLi9ub2RlX21vZHVsZXMvcm9idXN0LXByZWRpY2F0ZXMvZXNtL2luc3BoZXJlLmpzIiwid2VicGFjazovL25lcHR1bmVzLXByaWRlLWFnZW50Ly4vbm9kZV9tb2R1bGVzL3JvYnVzdC1wcmVkaWNhdGVzL2VzbS9vcmllbnQyZC5qcyIsIndlYnBhY2s6Ly9uZXB0dW5lcy1wcmlkZS1hZ2VudC8uL25vZGVfbW9kdWxlcy9yb2J1c3QtcHJlZGljYXRlcy9lc20vb3JpZW50M2QuanMiLCJ3ZWJwYWNrOi8vbmVwdHVuZXMtcHJpZGUtYWdlbnQvLi9ub2RlX21vZHVsZXMvcm9idXN0LXByZWRpY2F0ZXMvZXNtL3V0aWwuanMiLCJ3ZWJwYWNrOi8vbmVwdHVuZXMtcHJpZGUtYWdlbnQvLi9ub2RlX21vZHVsZXMvcm9idXN0LXByZWRpY2F0ZXMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vbmVwdHVuZXMtcHJpZGUtYWdlbnQvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vbmVwdHVuZXMtcHJpZGUtYWdlbnQvd2VicGFjay9ydW50aW1lL2NvbXBhdCBnZXQgZGVmYXVsdCBleHBvcnQiLCJ3ZWJwYWNrOi8vbmVwdHVuZXMtcHJpZGUtYWdlbnQvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL25lcHR1bmVzLXByaWRlLWFnZW50L3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vbmVwdHVuZXMtcHJpZGUtYWdlbnQvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9uZXB0dW5lcy1wcmlkZS1hZ2VudC8uL3NvdXJjZS9pbnRlbC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogTW9kdWxlIGRlcGVuZGVuaWNlc1xuICovXG5cbmNvbnN0IGNsb25lID0gcmVxdWlyZSgnc2hhbGxvdy1jbG9uZScpO1xuY29uc3QgdHlwZU9mID0gcmVxdWlyZSgna2luZC1vZicpO1xuY29uc3QgaXNQbGFpbk9iamVjdCA9IHJlcXVpcmUoJ2lzLXBsYWluLW9iamVjdCcpO1xuXG5mdW5jdGlvbiBjbG9uZURlZXAodmFsLCBpbnN0YW5jZUNsb25lKSB7XG4gIHN3aXRjaCAodHlwZU9mKHZhbCkpIHtcbiAgICBjYXNlICdvYmplY3QnOlxuICAgICAgcmV0dXJuIGNsb25lT2JqZWN0RGVlcCh2YWwsIGluc3RhbmNlQ2xvbmUpO1xuICAgIGNhc2UgJ2FycmF5JzpcbiAgICAgIHJldHVybiBjbG9uZUFycmF5RGVlcCh2YWwsIGluc3RhbmNlQ2xvbmUpO1xuICAgIGRlZmF1bHQ6IHtcbiAgICAgIHJldHVybiBjbG9uZSh2YWwpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBjbG9uZU9iamVjdERlZXAodmFsLCBpbnN0YW5jZUNsb25lKSB7XG4gIGlmICh0eXBlb2YgaW5zdGFuY2VDbG9uZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBpbnN0YW5jZUNsb25lKHZhbCk7XG4gIH1cbiAgaWYgKGluc3RhbmNlQ2xvbmUgfHwgaXNQbGFpbk9iamVjdCh2YWwpKSB7XG4gICAgY29uc3QgcmVzID0gbmV3IHZhbC5jb25zdHJ1Y3RvcigpO1xuICAgIGZvciAobGV0IGtleSBpbiB2YWwpIHtcbiAgICAgIHJlc1trZXldID0gY2xvbmVEZWVwKHZhbFtrZXldLCBpbnN0YW5jZUNsb25lKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuICByZXR1cm4gdmFsO1xufVxuXG5mdW5jdGlvbiBjbG9uZUFycmF5RGVlcCh2YWwsIGluc3RhbmNlQ2xvbmUpIHtcbiAgY29uc3QgcmVzID0gbmV3IHZhbC5jb25zdHJ1Y3Rvcih2YWwubGVuZ3RoKTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCB2YWwubGVuZ3RoOyBpKyspIHtcbiAgICByZXNbaV0gPSBjbG9uZURlZXAodmFsW2ldLCBpbnN0YW5jZUNsb25lKTtcbiAgfVxuICByZXR1cm4gcmVzO1xufVxuXG4vKipcbiAqIEV4cG9zZSBgY2xvbmVEZWVwYFxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gY2xvbmVEZWVwO1xuIiwiLyohXG4gKiBpcy1wbGFpbi1vYmplY3QgPGh0dHBzOi8vZ2l0aHViLmNvbS9qb25zY2hsaW5rZXJ0L2lzLXBsYWluLW9iamVjdD5cbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQtMjAxNywgSm9uIFNjaGxpbmtlcnQuXG4gKiBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgaXNPYmplY3QgPSByZXF1aXJlKCdpc29iamVjdCcpO1xuXG5mdW5jdGlvbiBpc09iamVjdE9iamVjdChvKSB7XG4gIHJldHVybiBpc09iamVjdChvKSA9PT0gdHJ1ZVxuICAgICYmIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvKSA9PT0gJ1tvYmplY3QgT2JqZWN0XSc7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNQbGFpbk9iamVjdChvKSB7XG4gIHZhciBjdG9yLHByb3Q7XG5cbiAgaWYgKGlzT2JqZWN0T2JqZWN0KG8pID09PSBmYWxzZSkgcmV0dXJuIGZhbHNlO1xuXG4gIC8vIElmIGhhcyBtb2RpZmllZCBjb25zdHJ1Y3RvclxuICBjdG9yID0gby5jb25zdHJ1Y3RvcjtcbiAgaWYgKHR5cGVvZiBjdG9yICE9PSAnZnVuY3Rpb24nKSByZXR1cm4gZmFsc2U7XG5cbiAgLy8gSWYgaGFzIG1vZGlmaWVkIHByb3RvdHlwZVxuICBwcm90ID0gY3Rvci5wcm90b3R5cGU7XG4gIGlmIChpc09iamVjdE9iamVjdChwcm90KSA9PT0gZmFsc2UpIHJldHVybiBmYWxzZTtcblxuICAvLyBJZiBjb25zdHJ1Y3RvciBkb2VzIG5vdCBoYXZlIGFuIE9iamVjdC1zcGVjaWZpYyBtZXRob2RcbiAgaWYgKHByb3QuaGFzT3duUHJvcGVydHkoJ2lzUHJvdG90eXBlT2YnKSA9PT0gZmFsc2UpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBNb3N0IGxpa2VseSBhIHBsYWluIE9iamVjdFxuICByZXR1cm4gdHJ1ZTtcbn07XG4iLCIvKiFcbiAqIGlzb2JqZWN0IDxodHRwczovL2dpdGh1Yi5jb20vam9uc2NobGlua2VydC9pc29iamVjdD5cbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQtMjAxNywgSm9uIFNjaGxpbmtlcnQuXG4gKiBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzT2JqZWN0KHZhbCkge1xuICByZXR1cm4gdmFsICE9IG51bGwgJiYgdHlwZW9mIHZhbCA9PT0gJ29iamVjdCcgJiYgQXJyYXkuaXNBcnJheSh2YWwpID09PSBmYWxzZTtcbn07XG4iLCJ2YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGtpbmRPZih2YWwpIHtcbiAgaWYgKHZhbCA9PT0gdm9pZCAwKSByZXR1cm4gJ3VuZGVmaW5lZCc7XG4gIGlmICh2YWwgPT09IG51bGwpIHJldHVybiAnbnVsbCc7XG5cbiAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsO1xuICBpZiAodHlwZSA9PT0gJ2Jvb2xlYW4nKSByZXR1cm4gJ2Jvb2xlYW4nO1xuICBpZiAodHlwZSA9PT0gJ3N0cmluZycpIHJldHVybiAnc3RyaW5nJztcbiAgaWYgKHR5cGUgPT09ICdudW1iZXInKSByZXR1cm4gJ251bWJlcic7XG4gIGlmICh0eXBlID09PSAnc3ltYm9sJykgcmV0dXJuICdzeW1ib2wnO1xuICBpZiAodHlwZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBpc0dlbmVyYXRvckZuKHZhbCkgPyAnZ2VuZXJhdG9yZnVuY3Rpb24nIDogJ2Z1bmN0aW9uJztcbiAgfVxuXG4gIGlmIChpc0FycmF5KHZhbCkpIHJldHVybiAnYXJyYXknO1xuICBpZiAoaXNCdWZmZXIodmFsKSkgcmV0dXJuICdidWZmZXInO1xuICBpZiAoaXNBcmd1bWVudHModmFsKSkgcmV0dXJuICdhcmd1bWVudHMnO1xuICBpZiAoaXNEYXRlKHZhbCkpIHJldHVybiAnZGF0ZSc7XG4gIGlmIChpc0Vycm9yKHZhbCkpIHJldHVybiAnZXJyb3InO1xuICBpZiAoaXNSZWdleHAodmFsKSkgcmV0dXJuICdyZWdleHAnO1xuXG4gIHN3aXRjaCAoY3Rvck5hbWUodmFsKSkge1xuICAgIGNhc2UgJ1N5bWJvbCc6IHJldHVybiAnc3ltYm9sJztcbiAgICBjYXNlICdQcm9taXNlJzogcmV0dXJuICdwcm9taXNlJztcblxuICAgIC8vIFNldCwgTWFwLCBXZWFrU2V0LCBXZWFrTWFwXG4gICAgY2FzZSAnV2Vha01hcCc6IHJldHVybiAnd2Vha21hcCc7XG4gICAgY2FzZSAnV2Vha1NldCc6IHJldHVybiAnd2Vha3NldCc7XG4gICAgY2FzZSAnTWFwJzogcmV0dXJuICdtYXAnO1xuICAgIGNhc2UgJ1NldCc6IHJldHVybiAnc2V0JztcblxuICAgIC8vIDgtYml0IHR5cGVkIGFycmF5c1xuICAgIGNhc2UgJ0ludDhBcnJheSc6IHJldHVybiAnaW50OGFycmF5JztcbiAgICBjYXNlICdVaW50OEFycmF5JzogcmV0dXJuICd1aW50OGFycmF5JztcbiAgICBjYXNlICdVaW50OENsYW1wZWRBcnJheSc6IHJldHVybiAndWludDhjbGFtcGVkYXJyYXknO1xuXG4gICAgLy8gMTYtYml0IHR5cGVkIGFycmF5c1xuICAgIGNhc2UgJ0ludDE2QXJyYXknOiByZXR1cm4gJ2ludDE2YXJyYXknO1xuICAgIGNhc2UgJ1VpbnQxNkFycmF5JzogcmV0dXJuICd1aW50MTZhcnJheSc7XG5cbiAgICAvLyAzMi1iaXQgdHlwZWQgYXJyYXlzXG4gICAgY2FzZSAnSW50MzJBcnJheSc6IHJldHVybiAnaW50MzJhcnJheSc7XG4gICAgY2FzZSAnVWludDMyQXJyYXknOiByZXR1cm4gJ3VpbnQzMmFycmF5JztcbiAgICBjYXNlICdGbG9hdDMyQXJyYXknOiByZXR1cm4gJ2Zsb2F0MzJhcnJheSc7XG4gICAgY2FzZSAnRmxvYXQ2NEFycmF5JzogcmV0dXJuICdmbG9hdDY0YXJyYXknO1xuICB9XG5cbiAgaWYgKGlzR2VuZXJhdG9yT2JqKHZhbCkpIHtcbiAgICByZXR1cm4gJ2dlbmVyYXRvcic7XG4gIH1cblxuICAvLyBOb24tcGxhaW4gb2JqZWN0c1xuICB0eXBlID0gdG9TdHJpbmcuY2FsbCh2YWwpO1xuICBzd2l0Y2ggKHR5cGUpIHtcbiAgICBjYXNlICdbb2JqZWN0IE9iamVjdF0nOiByZXR1cm4gJ29iamVjdCc7XG4gICAgLy8gaXRlcmF0b3JzXG4gICAgY2FzZSAnW29iamVjdCBNYXAgSXRlcmF0b3JdJzogcmV0dXJuICdtYXBpdGVyYXRvcic7XG4gICAgY2FzZSAnW29iamVjdCBTZXQgSXRlcmF0b3JdJzogcmV0dXJuICdzZXRpdGVyYXRvcic7XG4gICAgY2FzZSAnW29iamVjdCBTdHJpbmcgSXRlcmF0b3JdJzogcmV0dXJuICdzdHJpbmdpdGVyYXRvcic7XG4gICAgY2FzZSAnW29iamVjdCBBcnJheSBJdGVyYXRvcl0nOiByZXR1cm4gJ2FycmF5aXRlcmF0b3InO1xuICB9XG5cbiAgLy8gb3RoZXJcbiAgcmV0dXJuIHR5cGUuc2xpY2UoOCwgLTEpLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvXFxzL2csICcnKTtcbn07XG5cbmZ1bmN0aW9uIGN0b3JOYW1lKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbC5jb25zdHJ1Y3RvciA9PT0gJ2Z1bmN0aW9uJyA/IHZhbC5jb25zdHJ1Y3Rvci5uYW1lIDogbnVsbDtcbn1cblxuZnVuY3Rpb24gaXNBcnJheSh2YWwpIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkpIHJldHVybiBBcnJheS5pc0FycmF5KHZhbCk7XG4gIHJldHVybiB2YWwgaW5zdGFuY2VvZiBBcnJheTtcbn1cblxuZnVuY3Rpb24gaXNFcnJvcih2YWwpIHtcbiAgcmV0dXJuIHZhbCBpbnN0YW5jZW9mIEVycm9yIHx8ICh0eXBlb2YgdmFsLm1lc3NhZ2UgPT09ICdzdHJpbmcnICYmIHZhbC5jb25zdHJ1Y3RvciAmJiB0eXBlb2YgdmFsLmNvbnN0cnVjdG9yLnN0YWNrVHJhY2VMaW1pdCA9PT0gJ251bWJlcicpO1xufVxuXG5mdW5jdGlvbiBpc0RhdGUodmFsKSB7XG4gIGlmICh2YWwgaW5zdGFuY2VvZiBEYXRlKSByZXR1cm4gdHJ1ZTtcbiAgcmV0dXJuIHR5cGVvZiB2YWwudG9EYXRlU3RyaW5nID09PSAnZnVuY3Rpb24nXG4gICAgJiYgdHlwZW9mIHZhbC5nZXREYXRlID09PSAnZnVuY3Rpb24nXG4gICAgJiYgdHlwZW9mIHZhbC5zZXREYXRlID09PSAnZnVuY3Rpb24nO1xufVxuXG5mdW5jdGlvbiBpc1JlZ2V4cCh2YWwpIHtcbiAgaWYgKHZhbCBpbnN0YW5jZW9mIFJlZ0V4cCkgcmV0dXJuIHRydWU7XG4gIHJldHVybiB0eXBlb2YgdmFsLmZsYWdzID09PSAnc3RyaW5nJ1xuICAgICYmIHR5cGVvZiB2YWwuaWdub3JlQ2FzZSA9PT0gJ2Jvb2xlYW4nXG4gICAgJiYgdHlwZW9mIHZhbC5tdWx0aWxpbmUgPT09ICdib29sZWFuJ1xuICAgICYmIHR5cGVvZiB2YWwuZ2xvYmFsID09PSAnYm9vbGVhbic7XG59XG5cbmZ1bmN0aW9uIGlzR2VuZXJhdG9yRm4obmFtZSwgdmFsKSB7XG4gIHJldHVybiBjdG9yTmFtZShuYW1lKSA9PT0gJ0dlbmVyYXRvckZ1bmN0aW9uJztcbn1cblxuZnVuY3Rpb24gaXNHZW5lcmF0b3JPYmoodmFsKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsLnRocm93ID09PSAnZnVuY3Rpb24nXG4gICAgJiYgdHlwZW9mIHZhbC5yZXR1cm4gPT09ICdmdW5jdGlvbidcbiAgICAmJiB0eXBlb2YgdmFsLm5leHQgPT09ICdmdW5jdGlvbic7XG59XG5cbmZ1bmN0aW9uIGlzQXJndW1lbnRzKHZhbCkge1xuICB0cnkge1xuICAgIGlmICh0eXBlb2YgdmFsLmxlbmd0aCA9PT0gJ251bWJlcicgJiYgdHlwZW9mIHZhbC5jYWxsZWUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgaWYgKGVyci5tZXNzYWdlLmluZGV4T2YoJ2NhbGxlZScpICE9PSAtMSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiBJZiB5b3UgbmVlZCB0byBzdXBwb3J0IFNhZmFyaSA1LTcgKDgtMTAgeXItb2xkIGJyb3dzZXIpLFxuICogdGFrZSBhIGxvb2sgYXQgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9pcy1idWZmZXJcbiAqL1xuXG5mdW5jdGlvbiBpc0J1ZmZlcih2YWwpIHtcbiAgaWYgKHZhbC5jb25zdHJ1Y3RvciAmJiB0eXBlb2YgdmFsLmNvbnN0cnVjdG9yLmlzQnVmZmVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIHZhbC5jb25zdHJ1Y3Rvci5pc0J1ZmZlcih2YWwpO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cbiIsIi8qIVxuICogc2hhbGxvdy1jbG9uZSA8aHR0cHM6Ly9naXRodWIuY29tL2pvbnNjaGxpbmtlcnQvc2hhbGxvdy1jbG9uZT5cbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgSm9uIFNjaGxpbmtlcnQuXG4gKiBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCB2YWx1ZU9mID0gU3ltYm9sLnByb3RvdHlwZS52YWx1ZU9mO1xuY29uc3QgdHlwZU9mID0gcmVxdWlyZSgna2luZC1vZicpO1xuXG5mdW5jdGlvbiBjbG9uZSh2YWwsIGRlZXApIHtcbiAgc3dpdGNoICh0eXBlT2YodmFsKSkge1xuICAgIGNhc2UgJ2FycmF5JzpcbiAgICAgIHJldHVybiB2YWwuc2xpY2UoKTtcbiAgICBjYXNlICdvYmplY3QnOlxuICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIHZhbCk7XG4gICAgY2FzZSAnZGF0ZSc6XG4gICAgICByZXR1cm4gbmV3IHZhbC5jb25zdHJ1Y3RvcihOdW1iZXIodmFsKSk7XG4gICAgY2FzZSAnbWFwJzpcbiAgICAgIHJldHVybiBuZXcgTWFwKHZhbCk7XG4gICAgY2FzZSAnc2V0JzpcbiAgICAgIHJldHVybiBuZXcgU2V0KHZhbCk7XG4gICAgY2FzZSAnYnVmZmVyJzpcbiAgICAgIHJldHVybiBjbG9uZUJ1ZmZlcih2YWwpO1xuICAgIGNhc2UgJ3N5bWJvbCc6XG4gICAgICByZXR1cm4gY2xvbmVTeW1ib2wodmFsKTtcbiAgICBjYXNlICdhcnJheWJ1ZmZlcic6XG4gICAgICByZXR1cm4gY2xvbmVBcnJheUJ1ZmZlcih2YWwpO1xuICAgIGNhc2UgJ2Zsb2F0MzJhcnJheSc6XG4gICAgY2FzZSAnZmxvYXQ2NGFycmF5JzpcbiAgICBjYXNlICdpbnQxNmFycmF5JzpcbiAgICBjYXNlICdpbnQzMmFycmF5JzpcbiAgICBjYXNlICdpbnQ4YXJyYXknOlxuICAgIGNhc2UgJ3VpbnQxNmFycmF5JzpcbiAgICBjYXNlICd1aW50MzJhcnJheSc6XG4gICAgY2FzZSAndWludDhjbGFtcGVkYXJyYXknOlxuICAgIGNhc2UgJ3VpbnQ4YXJyYXknOlxuICAgICAgcmV0dXJuIGNsb25lVHlwZWRBcnJheSh2YWwpO1xuICAgIGNhc2UgJ3JlZ2V4cCc6XG4gICAgICByZXR1cm4gY2xvbmVSZWdFeHAodmFsKTtcbiAgICBjYXNlICdlcnJvcic6XG4gICAgICByZXR1cm4gT2JqZWN0LmNyZWF0ZSh2YWwpO1xuICAgIGRlZmF1bHQ6IHtcbiAgICAgIHJldHVybiB2YWw7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGNsb25lUmVnRXhwKHZhbCkge1xuICBjb25zdCBmbGFncyA9IHZhbC5mbGFncyAhPT0gdm9pZCAwID8gdmFsLmZsYWdzIDogKC9cXHcrJC8uZXhlYyh2YWwpIHx8IHZvaWQgMCk7XG4gIGNvbnN0IHJlID0gbmV3IHZhbC5jb25zdHJ1Y3Rvcih2YWwuc291cmNlLCBmbGFncyk7XG4gIHJlLmxhc3RJbmRleCA9IHZhbC5sYXN0SW5kZXg7XG4gIHJldHVybiByZTtcbn1cblxuZnVuY3Rpb24gY2xvbmVBcnJheUJ1ZmZlcih2YWwpIHtcbiAgY29uc3QgcmVzID0gbmV3IHZhbC5jb25zdHJ1Y3Rvcih2YWwuYnl0ZUxlbmd0aCk7XG4gIG5ldyBVaW50OEFycmF5KHJlcykuc2V0KG5ldyBVaW50OEFycmF5KHZhbCkpO1xuICByZXR1cm4gcmVzO1xufVxuXG5mdW5jdGlvbiBjbG9uZVR5cGVkQXJyYXkodmFsLCBkZWVwKSB7XG4gIHJldHVybiBuZXcgdmFsLmNvbnN0cnVjdG9yKHZhbC5idWZmZXIsIHZhbC5ieXRlT2Zmc2V0LCB2YWwubGVuZ3RoKTtcbn1cblxuZnVuY3Rpb24gY2xvbmVCdWZmZXIodmFsKSB7XG4gIGNvbnN0IGxlbiA9IHZhbC5sZW5ndGg7XG4gIGNvbnN0IGJ1ZiA9IEJ1ZmZlci5hbGxvY1Vuc2FmZSA/IEJ1ZmZlci5hbGxvY1Vuc2FmZShsZW4pIDogQnVmZmVyLmZyb20obGVuKTtcbiAgdmFsLmNvcHkoYnVmKTtcbiAgcmV0dXJuIGJ1Zjtcbn1cblxuZnVuY3Rpb24gY2xvbmVTeW1ib2wodmFsKSB7XG4gIHJldHVybiB2YWx1ZU9mID8gT2JqZWN0KHZhbHVlT2YuY2FsbCh2YWwpKSA6IHt9O1xufVxuXG4vKipcbiAqIEV4cG9zZSBgY2xvbmVgXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBjbG9uZTtcbiIsImltcG9ydCB7IGdldF9oZXJvIH0gZnJvbSBcIi4vZ2V0X2hlcm9cIjtcbmNvbnN0IFJFU0VBQ0hfTUFQID0ge1xuICAgIHNjYW5uaW5nOiBcIlNjYW5uaW5nXCIsXG4gICAgcHJvcHVsc2lvbjogXCJIeXBlcnNwYWNlIFJhbmdlXCIsXG4gICAgdGVycmFmb3JtaW5nOiBcIlRlcnJhZm9ybWluZ1wiLFxuICAgIHJlc2VhcmNoOiBcIkV4cGVyaW1lbnRhdGlvblwiLFxuICAgIHdlYXBvbnM6IFwiV2VhcG9uc1wiLFxuICAgIGJhbmtpbmc6IFwiQmFua2luZ1wiLFxuICAgIG1hbnVmYWN0dXJpbmc6IFwiTWFudWZhY3R1cmluZ1wiLFxufTtcbi8vRm9yIHF1aWNrIHJlc2VhcmNoIGRpc3BsYXlcbmZ1bmN0aW9uIGdldF9yZXNlYXJjaChnYW1lKSB7XG4gICAgbGV0IHVuaXZlcnNlID0gZ2FtZS51bml2ZXJzZTtcbiAgICBsZXQgaGVybyA9IGdldF9oZXJvKGdhbWUudW5pdmVyc2UpO1xuICAgIGxldCBzY2llbmNlID0gaGVyby50b3RhbF9zY2llbmNlO1xuICAgIC8vQ3VycmVudCBTY2llbmNlXG4gICAgbGV0IGN1cnJlbnQgPSBoZXJvLnRlY2hbaGVyby5yZXNlYXJjaGluZ107XG4gICAgbGV0IGN1cnJlbnRfcG9pbnRzX3JlbWFpbmluZyA9IGN1cnJlbnQuYnJyICogY3VycmVudC5sZXZlbCAtIGN1cnJlbnQucmVzZWFyY2g7XG4gICAgbGV0IGV0YSA9IE1hdGguY2VpbChjdXJyZW50X3BvaW50c19yZW1haW5pbmcgLyBzY2llbmNlKTsgLy9Ib3Vyc1xuICAgIC8vTmV4dCBzY2llbmNlXG4gICAgbGV0IG5leHQgPSBoZXJvLnRlY2hbaGVyby5yZXNlYXJjaGluZ19uZXh0XTtcbiAgICBsZXQgbmV4dF9wb2ludHNfcmVtYWluaW5nID0gbmV4dC5icnIgKiBuZXh0LmxldmVsIC0gbmV4dC5yZXNlYXJjaDtcbiAgICBsZXQgbmV4dF9ldGEgPSBNYXRoLmNlaWwobmV4dF9wb2ludHNfcmVtYWluaW5nIC8gc2NpZW5jZSkgKyBldGE7XG4gICAgbGV0IG5leHRfbGV2ZWwgPSBuZXh0LmxldmVsICsgMTtcbiAgICBpZiAoaGVyby5yZXNlYXJjaGluZyA9PSBoZXJvLnJlc2VhcmNoaW5nX25leHQpIHtcbiAgICAgICAgLy9SZWN1cnJpbmcgcmVzZWFyY2hcbiAgICAgICAgbmV4dF9wb2ludHNfcmVtYWluaW5nICs9IG5leHQuYnJyO1xuICAgICAgICBuZXh0X2V0YSA9IE1hdGguY2VpbCgobmV4dC5icnIgKiBuZXh0LmxldmVsICsgMSkgLyBzY2llbmNlKSArIGV0YTtcbiAgICAgICAgbmV4dF9sZXZlbCArPSAxO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgICBjdXJyZW50X25hbWU6IFJFU0VBQ0hfTUFQW2hlcm8ucmVzZWFyY2hpbmddLFxuICAgICAgICBjdXJyZW50X2xldmVsOiBjdXJyZW50W1wibGV2ZWxcIl0gKyAxLFxuICAgICAgICBjdXJyZW50X2V0YTogZXRhLFxuICAgICAgICBuZXh0X25hbWU6IFJFU0VBQ0hfTUFQW2hlcm8ucmVzZWFyY2hpbmdfbmV4dF0sXG4gICAgICAgIG5leHRfbGV2ZWw6IG5leHRfbGV2ZWwsXG4gICAgICAgIG5leHRfZXRhOiBuZXh0X2V0YSxcbiAgICAgICAgc2NpZW5jZTogc2NpZW5jZSxcbiAgICB9O1xufVxuZnVuY3Rpb24gZ2V0X3Jlc2VhcmNoX3RleHQoZ2FtZSkge1xuICAgIGNvbnN0IHJlc2VhcmNoID0gZ2V0X3Jlc2VhcmNoKGdhbWUpO1xuICAgIGxldCBmaXJzdF9saW5lID0gYE5vdzogJHtyZXNlYXJjaFtcImN1cnJlbnRfbmFtZVwiXX0gJHtyZXNlYXJjaFtcImN1cnJlbnRfbGV2ZWxcIl19IC0gJHtyZXNlYXJjaFtcImN1cnJlbnRfZXRhXCJdfSB0aWNrcy5gO1xuICAgIGxldCBzZWNvbmRfbGluZSA9IGBOZXh0OiAke3Jlc2VhcmNoW1wibmV4dF9uYW1lXCJdfSAke3Jlc2VhcmNoW1wibmV4dF9sZXZlbFwiXX0gLSAke3Jlc2VhcmNoW1wibmV4dF9ldGFcIl19IHRpY2tzLmA7XG4gICAgbGV0IHRoaXJkX2xpbmUgPSBgTXkgU2NpZW5jZTogJHtyZXNlYXJjaFtcInNjaWVuY2VcIl19YDtcbiAgICByZXR1cm4gYCR7Zmlyc3RfbGluZX1cXG4ke3NlY29uZF9saW5lfVxcbiR7dGhpcmRfbGluZX1cXG5gO1xufVxuZnVuY3Rpb24gTWFya0Rvd25NZXNzYWdlQ29tbWVudChjb250ZXh0LCB0ZXh0LCBpbmRleCkge1xuICAgIGxldCBtZXNzYWdlQ29tbWVudCA9IGNvbnRleHQuTWVzc2FnZUNvbW1lbnQodGV4dCwgaW5kZXgpO1xuICAgIHJldHVybiBcIlwiO1xufVxuZXhwb3J0IHsgZ2V0X3Jlc2VhcmNoLCBnZXRfcmVzZWFyY2hfdGV4dCwgTWFya0Rvd25NZXNzYWdlQ29tbWVudCB9O1xuIiwiaW1wb3J0IHsgZ2V0X2xlZGdlciB9IGZyb20gXCIuL2xlZGdlclwiO1xuaW1wb3J0IHsgZ2V0X2hlcm8gfSBmcm9tIFwiLi9nZXRfaGVyb1wiO1xuLy9HbG9iYWwgY2FjaGVkIGV2ZW50IHN5c3RlbS5cbmV4cG9ydCBsZXQgY2FjaGVkX2V2ZW50cyA9IFtdO1xuZXhwb3J0IGxldCBjYWNoZUZldGNoU3RhcnQgPSBuZXcgRGF0ZSgpO1xuZXhwb3J0IGxldCBjYWNoZUZldGNoU2l6ZSA9IDA7XG4vL0FzeW5jIHJlcXVlc3QgZ2FtZSBldmVudHNcbi8vZ2FtZSBpcyB1c2VkIHRvIGdldCB0aGUgYXBpIHZlcnNpb24gYW5kIHRoZSBnYW1lTnVtYmVyXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlX2V2ZW50X2NhY2hlKGdhbWUsIGNydXgsIGZldGNoU2l6ZSwgc3VjY2VzcywgZXJyb3IpIHtcbiAgICBjb25zdCBjb3VudCA9IGNhY2hlZF9ldmVudHMubGVuZ3RoID4gMCA/IGZldGNoU2l6ZSA6IDEwMDAwMDtcbiAgICBjYWNoZUZldGNoU3RhcnQgPSBuZXcgRGF0ZSgpO1xuICAgIGNhY2hlRmV0Y2hTaXplID0gY291bnQ7XG4gICAgY29uc3QgcGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh7XG4gICAgICAgIHR5cGU6IFwiZmV0Y2hfZ2FtZV9tZXNzYWdlc1wiLFxuICAgICAgICBjb3VudDogY291bnQudG9TdHJpbmcoKSxcbiAgICAgICAgb2Zmc2V0OiBcIjBcIixcbiAgICAgICAgZ3JvdXA6IFwiZ2FtZV9ldmVudFwiLFxuICAgICAgICB2ZXJzaW9uOiBnYW1lLnZlcnNpb24sXG4gICAgICAgIGdhbWVfbnVtYmVyOiBnYW1lLmdhbWVOdW1iZXIsXG4gICAgfSk7XG4gICAgY29uc3QgaGVhZGVycyA9IHtcbiAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWRuXCIsXG4gICAgfTtcbiAgICBmZXRjaChcIi90cmVxdWVzdC9mZXRjaF9nYW1lX21lc3NhZ2VzXCIsIHtcbiAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWRcIixcbiAgICAgICAgfSxcbiAgICAgICAgYm9keTogcGFyYW1zLFxuICAgIH0pXG4gICAgICAgIC50aGVuKChyZXNwb25zZSkgPT4gcmVzcG9uc2UuanNvbigpKVxuICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcbiAgICAgICAgc3luY19tZXNzYWdlX2NhY2hlKHJlc3BvbnNlKTsgLy9VcGRhdGVzIGNhY2hlZF9ldmVudHNcbiAgICAgICAgLy9jYWNoZWRfZXZlbnRzID0gc3luY19tZXNzYWdlX2NhY2hlKHJlc3BvbnNlKSlcbiAgICB9KVxuICAgICAgICAudGhlbigoeCkgPT4gc3VjY2VzcyhnYW1lLCBjcnV4KSlcbiAgICAgICAgLmNhdGNoKGVycm9yKTtcbn1cbi8vQ3VzdG9tIFVJIENvbXBvbmVudHMgZm9yIExlZGdlclxuZXhwb3J0IGZ1bmN0aW9uIFBsYXllck5hbWVJY29uUm93TGluayhjcnV4LCBucHVpLCBwbGF5ZXIpIHtcbiAgICBsZXQgcGxheWVyTmFtZUljb25Sb3cgPSBjcnV4LldpZGdldChcInJlbCBjb2xfYmxhY2sgY2xpY2thYmxlXCIpLnNpemUoNDgwLCA0OCk7XG4gICAgbnB1aS5QbGF5ZXJJY29uKHBsYXllciwgdHJ1ZSkucm9vc3QocGxheWVyTmFtZUljb25Sb3cpO1xuICAgIGNydXhcbiAgICAgICAgLlRleHQoXCJcIiwgXCJzZWN0aW9uX3RpdGxlXCIpXG4gICAgICAgIC5ncmlkKDYsIDAsIDIxLCAzKVxuICAgICAgICAucmF3SFRNTChgPGEgb25jbGljaz1cIkNydXguY3J1eC50cmlnZ2VyKCdzaG93X3BsYXllcl91aWQnLCAnJHtwbGF5ZXIudWlkfScgKVwiPiR7cGxheWVyLmFsaWFzfTwvYT5gKVxuICAgICAgICAucm9vc3QocGxheWVyTmFtZUljb25Sb3cpO1xuICAgIHJldHVybiBwbGF5ZXJOYW1lSWNvblJvdztcbn1cbmV4cG9ydCBmdW5jdGlvbiBzeW5jX21lc3NhZ2VfY2FjaGUocmVzcG9uc2UpIHtcbiAgICBjb25zdCBjYWNoZUZldGNoRW5kID0gbmV3IERhdGUoKTtcbiAgICBjb25zdCBlbGFwc2VkID0gY2FjaGVGZXRjaEVuZC5nZXRUaW1lKCkgLSBjYWNoZUZldGNoU3RhcnQuZ2V0VGltZSgpO1xuICAgIGNvbnNvbGUubG9nKGBGZXRjaGVkICR7Y2FjaGVGZXRjaFNpemV9IGV2ZW50cyBpbiAke2VsYXBzZWR9bXNgKTtcbiAgICBsZXQgaW5jb21pbmcgPSByZXNwb25zZS5yZXBvcnQubWVzc2FnZXM7XG4gICAgaWYgKGNhY2hlZF9ldmVudHMubGVuZ3RoID4gMCkge1xuICAgICAgICBsZXQgb3ZlcmxhcE9mZnNldCA9IC0xO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGluY29taW5nLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICBjb25zdCBtZXNzYWdlID0gaW5jb21pbmdbaV07XG4gICAgICAgICAgICBpZiAobWVzc2FnZS5rZXkgPT09IGNhY2hlZF9ldmVudHNbMF0ua2V5KSB7XG4gICAgICAgICAgICAgICAgb3ZlcmxhcE9mZnNldCA9IGk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG92ZXJsYXBPZmZzZXQgPj0gMCkge1xuICAgICAgICAgICAgaW5jb21pbmcgPSBpbmNvbWluZy5zbGljZSgwLCBvdmVybGFwT2Zmc2V0KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChvdmVybGFwT2Zmc2V0IDwgMCkge1xuICAgICAgICAgICAgY29uc3Qgc2l6ZSA9IGluY29taW5nLmxlbmd0aCAqIDI7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgTWlzc2luZyBzb21lIGV2ZW50cywgZG91YmxlIGZldGNoIHRvICR7c2l6ZX1gKTtcbiAgICAgICAgICAgIC8vdXBkYXRlX2V2ZW50X2NhY2hlKGdhbWUsIGNydXgsIHNpemUsIHJlY2lldmVfbmV3X21lc3NhZ2VzLCBjb25zb2xlLmVycm9yKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyB3ZSBoYWQgY2FjaGVkIGV2ZW50cywgYnV0IHdhbnQgdG8gYmUgZXh0cmEgcGFyYW5vaWQgYWJvdXRcbiAgICAgICAgLy8gY29ycmVjdG5lc3MuIFNvIGlmIHRoZSByZXNwb25zZSBjb250YWluZWQgdGhlIGVudGlyZSBldmVudFxuICAgICAgICAvLyBsb2csIHZhbGlkYXRlIHRoYXQgaXQgZXhhY3RseSBtYXRjaGVzIHRoZSBjYWNoZWQgZXZlbnRzLlxuICAgICAgICBpZiAocmVzcG9uc2UucmVwb3J0Lm1lc3NhZ2VzLmxlbmd0aCA9PT0gY2FjaGVkX2V2ZW50cy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiKioqIFZhbGlkYXRpbmcgY2FjaGVkX2V2ZW50cyAqKipcIik7XG4gICAgICAgICAgICBjb25zdCB2YWxpZCA9IHJlc3BvbnNlLnJlcG9ydC5tZXNzYWdlcztcbiAgICAgICAgICAgIGxldCBpbnZhbGlkRW50cmllcyA9IGNhY2hlZF9ldmVudHMuZmlsdGVyKChlLCBpKSA9PiBlLmtleSAhPT0gdmFsaWRbaV0ua2V5KTtcbiAgICAgICAgICAgIGlmIChpbnZhbGlkRW50cmllcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBhbGVydChcIiEhIEludmFsaWQgZW50cmllcyBmb3VuZFwiKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiISEgSW52YWxpZCBlbnRyaWVzIGZvdW5kOiBcIiwgaW52YWxpZEVudHJpZXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc29sZS5sb2coXCIqKiogVmFsaWRhdGlvbiBDb21wbGV0ZWQgKioqXCIpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gdGhlIHJlc3BvbnNlIGRpZG4ndCBjb250YWluIHRoZSBlbnRpcmUgZXZlbnQgbG9nLiBHbyBmZXRjaFxuICAgICAgICAgICAgLy8gYSB2ZXJzaW9uIHRoYXQgX2RvZXNfLlxuICAgICAgICAgICAgLypcbiAgICAgICAgICAgIHVwZGF0ZV9ldmVudF9jYWNoZShcbiAgICAgICAgICAgICAgZ2FtZSxcbiAgICAgICAgICAgICAgY3J1eCxcbiAgICAgICAgICAgICAgMTAwMDAwLFxuICAgICAgICAgICAgICByZWNpZXZlX25ld19tZXNzYWdlcyxcbiAgICAgICAgICAgICAgY29uc29sZS5lcnJvcixcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICAqL1xuICAgICAgICB9XG4gICAgfVxuICAgIGNhY2hlZF9ldmVudHMgPSBpbmNvbWluZy5jb25jYXQoY2FjaGVkX2V2ZW50cyk7XG59XG5leHBvcnQgZnVuY3Rpb24gZ2V0X2NhY2hlZF9ldmVudHMoKSB7XG4gICAgcmV0dXJuIGNhY2hlZF9ldmVudHM7XG59XG4vL0hhbmRsZXIgdG8gcmVjaWV2ZSBuZXcgbWVzc2FnZXNcbmV4cG9ydCBmdW5jdGlvbiByZWNpZXZlX25ld19tZXNzYWdlcyhnYW1lLCBjcnV4KSB7XG4gICAgbGV0IHVuaXZlcnNlID0gZ2FtZS51bml2ZXJzZTtcbiAgICBsZXQgbnB1aSA9IGdhbWUubnB1aTtcbiAgICBjb25zdCBwbGF5ZXJzID0gZ2V0X2xlZGdlcihnYW1lLCBjcnV4LCBjYWNoZWRfZXZlbnRzKTtcbiAgICBjb25zdCBsZWRnZXJTY3JlZW4gPSBucHVpLmxlZGdlclNjcmVlbigpO1xuICAgIG5wdWkub25IaWRlU2NyZWVuKG51bGwsIHRydWUpO1xuICAgIG5wdWkub25IaWRlU2VsZWN0aW9uTWVudSgpO1xuICAgIG5wdWkudHJpZ2dlcihcImhpZGVfc2lkZV9tZW51XCIpO1xuICAgIG5wdWkudHJpZ2dlcihcInJlc2V0X2VkaXRfbW9kZVwiKTtcbiAgICBucHVpLmFjdGl2ZVNjcmVlbiA9IGxlZGdlclNjcmVlbjtcbiAgICBsZWRnZXJTY3JlZW4ucm9vc3QobnB1aS5zY3JlZW5Db250YWluZXIpO1xuICAgIG5wdWkubGF5b3V0RWxlbWVudChsZWRnZXJTY3JlZW4pO1xuICAgIHBsYXllcnMuZm9yRWFjaCgocCkgPT4ge1xuICAgICAgICBsZXQgcGxheWVyID0gUGxheWVyTmFtZUljb25Sb3dMaW5rKGNydXgsIG5wdWksIHVuaXZlcnNlLmdhbGF4eS5wbGF5ZXJzW3AudWlkXSkucm9vc3QobnB1aS5hY3RpdmVTY3JlZW4pO1xuICAgICAgICBwbGF5ZXIuYWRkU3R5bGUoXCJwbGF5ZXJfY2VsbFwiKTtcbiAgICAgICAgbGV0IHByb21wdCA9IHAuZGVidCA+IDAgPyBcIlRoZXkgb3dlXCIgOiBcIllvdSBvd2VcIjtcbiAgICAgICAgaWYgKHAuZGVidCA9PSAwKSB7XG4gICAgICAgICAgICBwcm9tcHQgPSBcIkJhbGFuY2VcIjtcbiAgICAgICAgfVxuICAgICAgICBpZiAocC5kZWJ0IDwgMCkge1xuICAgICAgICAgICAgY3J1eFxuICAgICAgICAgICAgICAgIC5UZXh0KFwiXCIsIFwicGFkMTIgdHh0X3JpZ2h0IHJlZC10ZXh0XCIpXG4gICAgICAgICAgICAgICAgLnJhd0hUTUwoYCR7cHJvbXB0fTogJHtwLmRlYnR9YClcbiAgICAgICAgICAgICAgICAuZ3JpZCgyMCwgMCwgMTAsIDMpXG4gICAgICAgICAgICAgICAgLnJvb3N0KHBsYXllcik7XG4gICAgICAgICAgICBpZiAocC5kZWJ0ICogLTEgPD0gZ2V0X2hlcm8odW5pdmVyc2UpLmNhc2gpIHtcbiAgICAgICAgICAgICAgICBjcnV4XG4gICAgICAgICAgICAgICAgICAgIC5CdXR0b24oXCJmb3JnaXZlXCIsIFwiZm9yZ2l2ZV9kZWJ0XCIsIHsgdGFyZ2V0UGxheWVyOiBwLnVpZCB9KVxuICAgICAgICAgICAgICAgICAgICAuZ3JpZCgxNywgMCwgNiwgMylcbiAgICAgICAgICAgICAgICAgICAgLnJvb3N0KHBsYXllcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAocC5kZWJ0ID4gMCkge1xuICAgICAgICAgICAgY3J1eFxuICAgICAgICAgICAgICAgIC5UZXh0KFwiXCIsIFwicGFkMTIgdHh0X3JpZ2h0IGJsdWUtdGV4dFwiKVxuICAgICAgICAgICAgICAgIC5yYXdIVE1MKGAke3Byb21wdH06ICR7cC5kZWJ0fWApXG4gICAgICAgICAgICAgICAgLmdyaWQoMjAsIDAsIDEwLCAzKVxuICAgICAgICAgICAgICAgIC5yb29zdChwbGF5ZXIpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHAuZGVidCA9PSAwKSB7XG4gICAgICAgICAgICBjcnV4XG4gICAgICAgICAgICAgICAgLlRleHQoXCJcIiwgXCJwYWQxMiB0eHRfcmlnaHQgb3JhbmdlLXRleHRcIilcbiAgICAgICAgICAgICAgICAucmF3SFRNTChgJHtwcm9tcHR9OiAke3AuZGVidH1gKVxuICAgICAgICAgICAgICAgIC5ncmlkKDIwLCAwLCAxMCwgMylcbiAgICAgICAgICAgICAgICAucm9vc3QocGxheWVyKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuZXhwb3J0IGRlZmF1bHQge1xuICAgIHVwZGF0ZV9ldmVudF9jYWNoZSxcbiAgICByZWNpZXZlX25ld19tZXNzYWdlcyxcbn07XG4iLCIiLCJpbXBvcnQgeyBnZXRfdW5pdmVyc2UgfSBmcm9tIFwiLi91dGlsaXRpZXMvZ2V0X2dhbWVfc3RhdGVcIjtcbmV4cG9ydCBmdW5jdGlvbiBnZXRfaGVybyh1bml2ZXJzZSA9IGdldF91bml2ZXJzZSgpKSB7XG4gICAgcmV0dXJuIHVuaXZlcnNlLnBsYXllcjtcbn1cbiIsImV4cG9ydCB2YXIgbGFzdENsaXAgPSBcIkVycm9yXCI7XG5leHBvcnQgZnVuY3Rpb24gY2xpcCh0ZXh0KSB7XG4gICAgbGFzdENsaXAgPSB0ZXh0O1xufVxuIiwiaW1wb3J0IHsgZ2V0X2hlcm8gfSBmcm9tIFwiLi9nZXRfaGVyb1wiO1xuaW1wb3J0ICogYXMgQ2FjaGUgZnJvbSBcIi4vZXZlbnRfY2FjaGVcIjtcbi8vR2V0IGxlZGdlciBpbmZvIHRvIHNlZSB3aGF0IGlzIG93ZWRcbi8vQWN0dWFsbHkgc2hvd3MgdGhlIHBhbmVsIG9mIGxvYWRpbmdcbmV4cG9ydCBmdW5jdGlvbiBnZXRfbGVkZ2VyKGdhbWUsIGNydXgsIG1lc3NhZ2VzKSB7XG4gICAgbGV0IG5wdWkgPSBnYW1lLm5wdWk7XG4gICAgbGV0IHVuaXZlcnNlID0gZ2FtZS51bml2ZXJzZTtcbiAgICBsZXQgcGxheWVycyA9IHVuaXZlcnNlLmdhbGF4eS5wbGF5ZXJzO1xuICAgIGxldCBsb2FkaW5nID0gY3J1eFxuICAgICAgICAuVGV4dChcIlwiLCBcInJlbCB0eHRfY2VudGVyIHBhZDEyXCIpXG4gICAgICAgIC5yYXdIVE1MKGBQYXJzaW5nICR7bWVzc2FnZXMubGVuZ3RofSBtZXNzYWdlcy5gKTtcbiAgICBsb2FkaW5nLnJvb3N0KG5wdWkuYWN0aXZlU2NyZWVuKTtcbiAgICBsZXQgdWlkID0gZ2V0X2hlcm8odW5pdmVyc2UpLnVpZDtcbiAgICAvL0xlZGdlciBpcyBhIGxpc3Qgb2YgZGVidHNcbiAgICBsZXQgbGVkZ2VyID0ge307XG4gICAgbWVzc2FnZXNcbiAgICAgICAgLmZpbHRlcigobSkgPT4gbS5wYXlsb2FkLnRlbXBsYXRlID09IFwibW9uZXlfc2VudFwiIHx8XG4gICAgICAgIG0ucGF5bG9hZC50ZW1wbGF0ZSA9PSBcInNoYXJlZF90ZWNobm9sb2d5XCIpXG4gICAgICAgIC5tYXAoKG0pID0+IG0ucGF5bG9hZClcbiAgICAgICAgLmZvckVhY2goKG0pID0+IHtcbiAgICAgICAgbGV0IGxpYWlzb24gPSBtLmZyb21fcHVpZCA9PSB1aWQgPyBtLnRvX3B1aWQgOiBtLmZyb21fcHVpZDtcbiAgICAgICAgbGV0IHZhbHVlID0gbS50ZW1wbGF0ZSA9PSBcIm1vbmV5X3NlbnRcIiA/IG0uYW1vdW50IDogbS5wcmljZTtcbiAgICAgICAgdmFsdWUgKj0gbS5mcm9tX3B1aWQgPT0gdWlkID8gMSA6IC0xOyAvLyBhbW91bnQgaXMgKCspIGlmIGNyZWRpdCAmICgtKSBpZiBkZWJ0XG4gICAgICAgIGxpYWlzb24gaW4gbGVkZ2VyXG4gICAgICAgICAgICA/IChsZWRnZXJbbGlhaXNvbl0gKz0gdmFsdWUpXG4gICAgICAgICAgICA6IChsZWRnZXJbbGlhaXNvbl0gPSB2YWx1ZSk7XG4gICAgfSk7XG4gICAgLy9UT0RPOiBSZXZpZXcgdGhhdCB0aGlzIGlzIGNvcnJlY3RseSBmaW5kaW5nIGEgbGlzdCBvZiBvbmx5IHBlb3BsZSB3aG8gaGF2ZSBkZWJ0cy5cbiAgICAvL0FjY291bnRzIGFyZSB0aGUgY3JlZGl0IG9yIGRlYml0IHJlbGF0ZWQgdG8gZWFjaCB1c2VyXG4gICAgbGV0IGFjY291bnRzID0gW107XG4gICAgZm9yIChsZXQgdWlkIGluIGxlZGdlcikge1xuICAgICAgICBsZXQgcGxheWVyID0gcGxheWVyc1twYXJzZUludCh1aWQpXTtcbiAgICAgICAgcGxheWVyLmRlYnQgPSBsZWRnZXJbdWlkXTtcbiAgICAgICAgYWNjb3VudHMucHVzaChwbGF5ZXIpO1xuICAgIH1cbiAgICBnZXRfaGVybyh1bml2ZXJzZSkubGVkZ2VyID0gbGVkZ2VyO1xuICAgIGNvbnNvbGUubG9nKGFjY291bnRzKTtcbiAgICByZXR1cm4gYWNjb3VudHM7XG59XG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyTGVkZ2VyKGdhbWUsIGNydXgsIE1vdXNlVHJhcCkge1xuICAgIC8vRGVjb25zdHJ1Y3Rpb24gb2YgZGlmZmVyZW50IGNvbXBvbmVudHMgb2YgdGhlIGdhbWUuXG4gICAgbGV0IGNvbmZpZyA9IGdhbWUuY29uZmlnO1xuICAgIGxldCBucCA9IGdhbWUubnA7XG4gICAgbGV0IG5wdWkgPSBnYW1lLm5wdWk7XG4gICAgbGV0IHVuaXZlcnNlID0gZ2FtZS51bml2ZXJzZTtcbiAgICBsZXQgdGVtcGxhdGVzID0gZ2FtZS50ZW1wbGF0ZXM7XG4gICAgbGV0IHBsYXllcnMgPSB1bml2ZXJzZS5nYWxheHkucGxheWVycztcbiAgICBNb3VzZVRyYXAuYmluZChbXCJtXCIsIFwiTVwiXSwgZnVuY3Rpb24gKCkge1xuICAgICAgICBucC50cmlnZ2VyKFwidHJpZ2dlcl9sZWRnZXJcIik7XG4gICAgfSk7XG4gICAgdGVtcGxhdGVzW1wibGVkZ2VyXCJdID0gXCJMZWRnZXJcIjtcbiAgICB0ZW1wbGF0ZXNbXCJ0ZWNoX3RyYWRpbmdcIl0gPSBcIlRyYWRpbmcgVGVjaG5vbG9neVwiO1xuICAgIHRlbXBsYXRlc1tcImZvcmdpdmVcIl0gPSBcIlBheSBEZWJ0XCI7XG4gICAgdGVtcGxhdGVzW1wiZm9yZ2l2ZV9kZWJ0XCJdID0gXCJBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gZm9yZ2l2ZSB0aGlzIGRlYnQ/XCI7XG4gICAgaWYgKCFucHVpLmhhc21lbnVpdGVtKSB7XG4gICAgICAgIG5wdWlcbiAgICAgICAgICAgIC5TaWRlTWVudUl0ZW0oXCJpY29uLWRhdGFiYXNlXCIsIFwibGVkZ2VyXCIsIFwidHJpZ2dlcl9sZWRnZXJcIilcbiAgICAgICAgICAgIC5yb29zdChucHVpLnNpZGVNZW51KTtcbiAgICAgICAgbnB1aS5oYXNtZW51aXRlbSA9IHRydWU7XG4gICAgfVxuICAgIG5wdWkubGVkZ2VyU2NyZWVuID0gKCkgPT4ge1xuICAgICAgICByZXR1cm4gbnB1aS5TY3JlZW4oXCJsZWRnZXJcIik7XG4gICAgfTtcbiAgICBucC5vbihcInRyaWdnZXJfbGVkZ2VyXCIsICgpID0+IHtcbiAgICAgICAgY29uc3QgbGVkZ2VyU2NyZWVuID0gbnB1aS5sZWRnZXJTY3JlZW4oKTtcbiAgICAgICAgbGV0IGxvYWRpbmcgPSBjcnV4XG4gICAgICAgICAgICAuVGV4dChcIlwiLCBcInJlbCB0eHRfY2VudGVyIHBhZDEyIHNlY3Rpb25fdGl0bGVcIilcbiAgICAgICAgICAgIC5yYXdIVE1MKFwiVGFidWxhdGluZyBMZWRnZXIuLi5cIik7XG4gICAgICAgIGxvYWRpbmcucm9vc3QobGVkZ2VyU2NyZWVuKTtcbiAgICAgICAgbnB1aS5vbkhpZGVTY3JlZW4obnVsbCwgdHJ1ZSk7XG4gICAgICAgIG5wdWkub25IaWRlU2VsZWN0aW9uTWVudSgpO1xuICAgICAgICBucHVpLnRyaWdnZXIoXCJoaWRlX3NpZGVfbWVudVwiKTtcbiAgICAgICAgbnB1aS50cmlnZ2VyKFwicmVzZXRfZWRpdF9tb2RlXCIpO1xuICAgICAgICBucHVpLmFjdGl2ZVNjcmVlbiA9IGxlZGdlclNjcmVlbjtcbiAgICAgICAgbGVkZ2VyU2NyZWVuLnJvb3N0KG5wdWkuc2NyZWVuQ29udGFpbmVyKTtcbiAgICAgICAgbnB1aS5sYXlvdXRFbGVtZW50KGxlZGdlclNjcmVlbik7XG4gICAgICAgIENhY2hlLnVwZGF0ZV9ldmVudF9jYWNoZShnYW1lLCBjcnV4LCA0LCBDYWNoZS5yZWNpZXZlX25ld19tZXNzYWdlcywgY29uc29sZS5lcnJvcik7XG4gICAgfSk7XG4gICAgLy9XaHkgbm90IG5wLm9uKFwiRm9yZ2l2ZURlYnRcIik/XG4gICAgbnAub25Gb3JnaXZlRGVidCA9IGZ1bmN0aW9uIChldmVudCwgZGF0YSkge1xuICAgICAgICBsZXQgdGFyZ2V0UGxheWVyID0gZGF0YS50YXJnZXRQbGF5ZXI7XG4gICAgICAgIGxldCBwbGF5ZXIgPSBwbGF5ZXJzW3RhcmdldFBsYXllcl07XG4gICAgICAgIGxldCBhbW91bnQgPSBwbGF5ZXIuZGVidCAqIC0xO1xuICAgICAgICAvL2xldCBhbW91bnQgPSAxXG4gICAgICAgIHVuaXZlcnNlLnBsYXllci5sZWRnZXJbdGFyZ2V0UGxheWVyXSA9IDA7XG4gICAgICAgIG5wLnRyaWdnZXIoXCJzaG93X3NjcmVlblwiLCBbXG4gICAgICAgICAgICBcImNvbmZpcm1cIixcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBcImZvcmdpdmVfZGVidFwiLFxuICAgICAgICAgICAgICAgIGV2ZW50S2luZDogXCJjb25maXJtX2ZvcmdpdmVfZGVidFwiLFxuICAgICAgICAgICAgICAgIGV2ZW50RGF0YToge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiBcIm9yZGVyXCIsXG4gICAgICAgICAgICAgICAgICAgIG9yZGVyOiBgc2VuZF9tb25leSwke3RhcmdldFBsYXllcn0sJHthbW91bnR9YCxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgXSk7XG4gICAgfTtcbiAgICBucC5vbihcImNvbmZpcm1fZm9yZ2l2ZV9kZWJ0XCIsIChldmVudCwgZGF0YSkgPT4ge1xuICAgICAgICBucC50cmlnZ2VyKFwic2VydmVyX3JlcXVlc3RcIiwgZGF0YSk7XG4gICAgICAgIG5wLnRyaWdnZXIoXCJ0cmlnZ2VyX2xlZGdlclwiKTtcbiAgICB9KTtcbiAgICBucC5vbihcImZvcmdpdmVfZGVidFwiLCBucC5vbkZvcmdpdmVEZWJ0KTtcbn1cbiIsImltcG9ydCB7IGdldF9nYW1lX251bWJlciB9IGZyb20gXCIuL2dldF9nYW1lX3N0YXRlXCI7XG5leHBvcnQgZnVuY3Rpb24gZ2V0X2FwaV9kYXRhKGFwaWtleSkge1xuICAgIGxldCBnYW1lX251bWJlciA9IGdldF9nYW1lX251bWJlcigpO1xuICAgIHJldHVybiBmZXRjaChcImh0dHBzOi8vbnAuaXJvbmhlbG1ldC5jb20vYXBpXCIsIHtcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgYWNjZXB0OiBcImFwcGxpY2F0aW9uL2pzb24sIHRleHQvamF2YXNjcmlwdCwgKi8qOyBxPTAuMDFcIixcbiAgICAgICAgICAgIFwiYWNjZXB0LWxhbmd1YWdlXCI6IFwiZW4tVVMsZW47cT0wLjlcIixcbiAgICAgICAgICAgIFwiY29udGVudC10eXBlXCI6IFwiYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkOyBjaGFyc2V0PVVURi04XCIsXG4gICAgICAgICAgICBcIngtcmVxdWVzdGVkLXdpdGhcIjogXCJYTUxIdHRwUmVxdWVzdFwiLFxuICAgICAgICB9LFxuICAgICAgICByZWZlcnJlcjogYGh0dHBzOi8vbnAuaXJvbmhlbG1ldC5jb20vZ2FtZS8ke2dhbWVfbnVtYmVyfWAsXG4gICAgICAgIHJlZmVycmVyUG9saWN5OiBcInN0cmljdC1vcmlnaW4td2hlbi1jcm9zcy1vcmlnaW5cIixcbiAgICAgICAgYm9keTogYGdhbWVfbnVtYmVyPSR7Z2FtZV9udW1iZXJ9JmFwaV92ZXJzaW9uPTAuMSZjb2RlPSR7YXBpa2V5fWAsXG4gICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgIG1vZGU6IFwiY29yc1wiLFxuICAgICAgICBjcmVkZW50aWFsczogXCJpbmNsdWRlXCIsXG4gICAgfSkudGhlbigocmVzcG9uc2UpID0+IHJlc3BvbnNlLmpzb24oKSk7XG59XG4iLCJleHBvcnQgZnVuY3Rpb24gZ2V0X3Zpc2libGVfc3RhcnMoKSB7XG4gICAgbGV0IHN0YXJzID0gZ2V0X2FsbF9zdGFycygpO1xuICAgIGlmIChzdGFycyA9PT0gdW5kZWZpbmVkKVxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIGxldCB2aXNpYmxlX3N0YXJzID0gW107XG4gICAgZm9yIChsZXQgW2luZGV4LCBzdGFyXSBvZiBPYmplY3QuZW50cmllcyhzdGFycykpIHtcbiAgICAgICAgaWYgKHN0YXIudiA9PT0gXCIxXCIpIHtcbiAgICAgICAgICAgIC8vU3RhciBpcyB2aXNpYmxlXG4gICAgICAgICAgICB2aXNpYmxlX3N0YXJzLnB1c2goc3Rhcik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHZpc2libGVfc3RhcnM7XG59XG52YXIgZ2xvYmFsO1xuKGZ1bmN0aW9uIChnbG9iYWwpIHtcbn0pKGdsb2JhbCB8fCAoZ2xvYmFsID0ge30pKTtcbk5lcHR1bmVzUHJpZGU7XG5leHBvcnQgZnVuY3Rpb24gZ2V0X2dhbWVfbnVtYmVyKCkge1xuICAgIGlmIChOZXB0dW5lc1ByaWRlID09PSB1bmRlZmluZWQpXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgcmV0dXJuIE5lcHR1bmVzUHJpZGUuZ2FtZU51bWJlcjtcbn1cbmV4cG9ydCBmdW5jdGlvbiBnZXRfYWxsX3N0YXJzKCkge1xuICAgIGlmIChOZXB0dW5lc1ByaWRlID09PSB1bmRlZmluZWQpXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgcmV0dXJuIE5lcHR1bmVzUHJpZGUudW5pdmVyc2UuZ2FsYXh5LnN0YXJzO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGdldF9mbGVldHMoKSB7XG4gICAgaWYgKE5lcHR1bmVzUHJpZGUgPT09IHVuZGVmaW5lZClcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICByZXR1cm4gTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5nYWxheHkuZmxlZXRzO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGdldF9nYWxheHkoKSB7XG4gICAgaWYgKE5lcHR1bmVzUHJpZGUgPT09IHVuZGVmaW5lZClcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICByZXR1cm4gZ2V0X3VuaXZlcnNlKCkuZ2FsYXh5O1xufVxuZXhwb3J0IGZ1bmN0aW9uIGdldF91bml2ZXJzZSgpIHtcbiAgICBpZiAoTmVwdHVuZXNQcmlkZSA9PT0gdW5kZWZpbmVkKVxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIHJldHVybiBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGdldF9uZXB0dW5lc19wcmlkZSgpIHtcbiAgICBpZiAoTmVwdHVuZXNQcmlkZSA9PT0gdW5kZWZpbmVkKVxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIHJldHVybiBOZXB0dW5lc1ByaWRlLm5wO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGdldF9nYW1lX3N0YXRlKCkge1xuICAgIGlmIChOZXB0dW5lc1ByaWRlID09PSB1bmRlZmluZWQpXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgcmV0dXJuIE5lcHR1bmVzUHJpZGU7XG59XG4iLCJleHBvcnQgY29uc3QgYnV5QXBlR2lmdFNjcmVlbiA9IGZ1bmN0aW9uIChDcnV4LCB1bml2ZXJzZSwgbnB1aSkge1xuICAgIGNvbnNvbGUubG9nKFwiT3ZlcmxvYWRkZWQgR2lmdCBTY3JlZW5cIik7XG4gICAgdmFyIGJ1eSA9IG5wdWkuU2NyZWVuKFwiZ2lmdF9oZWFkaW5nXCIpLnNpemUoNDgwKTtcbiAgICBDcnV4LlRleHQoXCJnaWZ0X2ludHJvXCIsIFwicmVsIHBhZDEyIGNvbF9hY2NlbnQgdHh0X2NlbnRlclwiKVxuICAgICAgICAuZm9ybWF0KHtcbiAgICAgICAgcGxheWVyOiB1bml2ZXJzZS5zZWxlY3RlZFBsYXllci5jb2xvdXJCb3ggK1xuICAgICAgICAgICAgdW5pdmVyc2Uuc2VsZWN0ZWRQbGF5ZXIuaHlwZXJsaW5rZWRBbGlhcyxcbiAgICB9KVxuICAgICAgICAuc2l6ZSg0ODApXG4gICAgICAgIC5yb29zdChidXkpO1xuICAgIG5wdWkuR2FsYWN0aWNDcmVkaXRCYWxhbmNlKCkucm9vc3QoYnV5KTtcbiAgICB2YXIgaTtcbiAgICB2YXIgaXRlbXMgPSBbXG4gICAgICAgIHsgaWNvbjogXCJwcm90ZXVzXCIsIGFtb3VudDogMSB9LFxuICAgICAgICB7IGljb246IFwibGlmZXRpbWVcIiwgYW1vdW50OiAxIH0sXG4gICAgICAgIHsgaWNvbjogXCJ0b3VybmV5X3dpblwiLCBhbW91bnQ6IDEgfSxcbiAgICAgICAgeyBpY29uOiBcInRvdXJuZXlfam9pblwiLCBhbW91bnQ6IDEgfSxcbiAgICAgICAgeyBpY29uOiBcImhvbm91clwiLCBhbW91bnQ6IDEgfSxcbiAgICAgICAgeyBpY29uOiBcIndpemFyZFwiLCBhbW91bnQ6IDEgfSxcbiAgICAgICAgeyBpY29uOiBcInJhdFwiLCBhbW91bnQ6IDEgfSxcbiAgICAgICAgeyBpY29uOiBcImZsYW1iZWF1XCIsIGFtb3VudDogMSB9LFxuICAgICAgICB7IGljb246IFwiYnVsbHNleWVcIiwgYW1vdW50OiAxIH0sXG4gICAgICAgIHsgaWNvbjogXCJ0cmVrXCIsIGFtb3VudDogMSB9LFxuICAgICAgICB7IGljb246IFwicmViZWxcIiwgYW1vdW50OiAxIH0sXG4gICAgICAgIHsgaWNvbjogXCJlbXBpcmVcIiwgYW1vdW50OiAxIH0sXG4gICAgICAgIHsgaWNvbjogXCJ3b2xmXCIsIGFtb3VudDogNSB9LFxuICAgICAgICB7IGljb246IFwidG94aWNcIiwgYW1vdW50OiAxMCB9LFxuICAgICAgICB7IGljb246IFwicGlyYXRlXCIsIGFtb3VudDogNSB9LFxuICAgICAgICB7IGljb246IFwid29yZHNtaXRoXCIsIGFtb3VudDogMiB9LFxuICAgICAgICB7IGljb246IFwibHVja3lcIiwgYW1vdW50OiAyIH0sXG4gICAgICAgIHsgaWNvbjogXCJpcm9uYm9yblwiLCBhbW91bnQ6IDIgfSxcbiAgICAgICAgeyBpY29uOiBcInN0cmFuZ2VcIiwgYW1vdW50OiAyIH0sXG4gICAgICAgIHsgaWNvbjogXCJhcGVcIiwgYW1vdW50OiAxIH0sXG4gICAgICAgIHsgaWNvbjogXCJjaGVlc3lcIiwgYW1vdW50OiAxIH0sXG4gICAgICAgIHsgaWNvbjogXCJzdHJhdGVnaWNcIiwgYW1vdW50OiAxIH0sXG4gICAgICAgIHsgaWNvbjogXCJiYWRhc3NcIiwgYW1vdW50OiAxIH0sXG4gICAgICAgIHsgaWNvbjogXCJsaW9uaGVhcnRcIiwgYW1vdW50OiAxIH0sXG4gICAgICAgIHsgaWNvbjogXCJndW5cIiwgYW1vdW50OiAxIH0sXG4gICAgICAgIHsgaWNvbjogXCJjb21tYW5kXCIsIGFtb3VudDogMSB9LFxuICAgICAgICB7IGljb246IFwic2NpZW5jZVwiLCBhbW91bnQ6IDEgfSxcbiAgICAgICAgeyBpY29uOiBcIm5lcmRcIiwgYW1vdW50OiAxIH0sXG4gICAgICAgIHsgaWNvbjogXCJtZXJpdFwiLCBhbW91bnQ6IDEgfSxcbiAgICBdO1xuICAgIGxldCBzZWNyZXRfbWVudSA9IFtcbiAgICAvKiovXG4gICAgXTtcbiAgICBmb3IgKGkgPSBpdGVtcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICBpdGVtc1tpXS5wdWlkID0gdW5pdmVyc2Uuc2VsZWN0ZWRQbGF5ZXIudWlkO1xuICAgICAgICBucHVpLkdpZnRJdGVtKGl0ZW1zW2ldKS5yb29zdChidXkpO1xuICAgIH1cbiAgICByZXR1cm4gYnV5O1xufTtcbmV4cG9ydCBjb25zdCBBcGVHaWZ0SXRlbSA9IGZ1bmN0aW9uIChDcnV4LCB1cmwsIGl0ZW0pIHtcbiAgICB2YXIgZ2kgPSBDcnV4LldpZGdldChcInJlbFwiKS5zaXplKDQ4MCk7XG4gICAgQ3J1eC5XaWRnZXQoXCJyZWwgY29sX2Jhc2VcIikuc2l6ZSg0ODAsIDE2KS5yb29zdChnaSk7XG4gICAgbGV0IGltYWdlX3VybCA9IGAuLi9pbWFnZXMvYmFkZ2VzLyR7aXRlbS5pY29ufS5wbmdgO1xuICAgIGlmIChpdGVtLmljb24gPT0gXCJhcGVcIikge1xuICAgICAgICBpbWFnZV91cmwgPSBgJHt1cmx9JHtpdGVtLmljb259LnBuZ2A7XG4gICAgfVxuICAgIGdpLmljb24gPSBDcnV4LkltYWdlKGltYWdlX3VybCwgXCJhYnNcIikuZ3JpZCgwLjI1LCAxLCA2LCA2KS5yb29zdChnaSk7XG4gICAgZ2kuYm9keSA9IENydXguVGV4dChgZ2lmdF9kZXNjXyR7aXRlbS5pY29ufWAsIFwicmVsIHR4dF9zZWxlY3RhYmxlXCIpXG4gICAgICAgIC5zaXplKDM4NCAtIDI0KVxuICAgICAgICAucG9zKDk2ICsgMTIpXG4gICAgICAgIC5yb29zdChnaSk7XG4gICAgZ2kuYnV5Tm93QmcgPSBDcnV4LldpZGdldChcInJlbFwiKS5zaXplKDQ4MCwgNTIpLnJvb3N0KGdpKTtcbiAgICBnaS5idXlOb3dCdXR0b24gPSBDcnV4LkJ1dHRvbihcImJ1eV9ub3dcIiwgXCJidXlfZ2lmdFwiLCBpdGVtKVxuICAgICAgICAuZ3JpZCgyMCwgMCwgMTAsIDMpXG4gICAgICAgIC5yb29zdChnaS5idXlOb3dCZyk7XG4gICAgaWYgKGl0ZW0uYW1vdW50ID4gTmVwdHVuZXNQcmlkZS5hY2NvdW50LmNyZWRpdHMpIHtcbiAgICAgICAgZ2kuYnV5Tm93QnV0dG9uLmRpc2FibGUoKTtcbiAgICB9XG4gICAgQ3J1eC5XaWRnZXQoXCJyZWwgY29sX2FjY2VudFwiKS5zaXplKDQ4MCwgNCkucm9vc3QoZ2kpO1xuICAgIHJldHVybiBnaTtcbn07XG4iLCJleHBvcnQgZnVuY3Rpb24gZHJhd092ZXJsYXlTdHJpbmcoY29udGV4dCwgdGV4dCwgeCwgeSwgZmdDb2xvcikge1xuICAgIGNvbnRleHQuZmlsbFN0eWxlID0gXCIjMDAwMDAwXCI7XG4gICAgZm9yIChsZXQgc21lYXIgPSAxOyBzbWVhciA8IDQ7ICsrc21lYXIpIHtcbiAgICAgICAgY29udGV4dC5maWxsVGV4dCh0ZXh0LCB4ICsgc21lYXIsIHkgKyBzbWVhcik7XG4gICAgICAgIGNvbnRleHQuZmlsbFRleHQodGV4dCwgeCAtIHNtZWFyLCB5ICsgc21lYXIpO1xuICAgICAgICBjb250ZXh0LmZpbGxUZXh0KHRleHQsIHggLSBzbWVhciwgeSAtIHNtZWFyKTtcbiAgICAgICAgY29udGV4dC5maWxsVGV4dCh0ZXh0LCB4ICsgc21lYXIsIHkgLSBzbWVhcik7XG4gICAgfVxuICAgIGNvbnRleHQuZmlsbFN0eWxlID0gZmdDb2xvciB8fCBcIiMwMGZmMDBcIjtcbiAgICBjb250ZXh0LmZpbGxUZXh0KHRleHQsIHgsIHkpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGFueVN0YXJDYW5TZWUodW5pdmVyc2UsIG93bmVyLCBmbGVldCkge1xuICAgIGxldCBzdGFycyA9IHVuaXZlcnNlLmdhbGF4eS5zdGFycztcbiAgICBsZXQgc2NhblJhbmdlID0gdW5pdmVyc2UuZ2FsYXh5LnBsYXllcnNbb3duZXJdLnRlY2guc2Nhbm5pbmcudmFsdWU7XG4gICAgZm9yIChjb25zdCBzIGluIHN0YXJzKSB7XG4gICAgICAgIGxldCBzdGFyID0gc3RhcnNbc107XG4gICAgICAgIGlmIChzdGFyLnB1aWQgPT0gb3duZXIpIHtcbiAgICAgICAgICAgIGxldCBkaXN0YW5jZSA9IHVuaXZlcnNlLmRpc3RhbmNlKHN0YXIueCwgc3Rhci55LCBwYXJzZUZsb2F0KGZsZWV0LngpLCBwYXJzZUZsb2F0KGZsZWV0LnkpKTtcbiAgICAgICAgICAgIGlmIChkaXN0YW5jZSA8PSBzY2FuUmFuZ2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59XG4iLCJpbXBvcnQgeyBnZXRfZ2FsYXh5LCB9IGZyb20gXCIuL2dldF9nYW1lX3N0YXRlXCI7XG5pbXBvcnQgeyBnZXRfYXBpX2RhdGEgfSBmcm9tIFwiLi9hcGlcIjtcbmxldCBvcmlnaW5hbFBsYXllciA9IHVuZGVmaW5lZDtcbi8vVGhpcyBzYXZlcyB0aGUgYWN0dWFsIGNsaWVudCdzIHBsYXllci5cbmZ1bmN0aW9uIHNldF9vcmlnaW5hbF9wbGF5ZXIoKSB7XG4gICAgaWYgKG9yaWdpbmFsUGxheWVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgb3JpZ2luYWxQbGF5ZXIgPSBOZXB0dW5lc1ByaWRlLm9yaWdpbmFsUGxheWVyO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuZnVuY3Rpb24gdmFsaWRfYXBpa2V5KGFwaWtleSkge1xuICAgIHJldHVybiB0cnVlO1xufVxuZnVuY3Rpb24gYmFkX2tleShlcnIpIHtcbiAgICBjb25zb2xlLmxvZyhcIlRoZSBrZXkgaXMgYmFkIGFuZCBtZXJnaW5nIEZBSUxFRCFcIik7XG59XG5leHBvcnQgZnVuY3Rpb24gbWVyZ2VVc2VyKGV2ZW50LCBkYXRhKSB7XG4gICAgc2V0X29yaWdpbmFsX3BsYXllcigpO1xuICAgIC8vRXh0cmFjdCB0aGF0IEtFWVxuICAgIC8vVE9ETzogQWRkIHJlZ2V4IHRvIGdldCBUSEFUIEtFWVxuICAgIGxldCBhcGlrZXkgPSBkYXRhID09PSBudWxsIHx8IGRhdGEgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGRhdGEuc3BsaXQoXCI6XCIpWzFdO1xuICAgIGNvbnNvbGUubG9nKGFwaWtleSk7XG4gICAgaWYgKHZhbGlkX2FwaWtleShhcGlrZXkpKSB7XG4gICAgICAgIGdldF9hcGlfZGF0YShhcGlrZXkpXG4gICAgICAgICAgICAudGhlbigoZGF0YSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIFwiZXJyb3JcIiBpbiBkYXRhXG4gICAgICAgICAgICAgICAgPyBiYWRfa2V5KGRhdGEpXG4gICAgICAgICAgICAgICAgOiBtZXJnZVVzZXJEYXRhKGRhdGEuc2Nhbm5pbmdfZGF0YSk7XG4gICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goY29uc29sZS5sb2cpO1xuICAgIH1cbn1cbi8vQ29tYmluZSBkYXRhIGZyb20gYW5vdGhlciB1c2VyXG4vL0NhbGxiYWNrIG9uIEFQSSAuLlxuLy9tZWNoYW5pYyBjbG9zZXMgYXQgNXBtXG4vL1RoaXMgd29ya3MgYnV0IG5vdyBhZGQgaXQgc28gaXQgZG9lcyBub3Qgb3ZlcnRha2UgeW91ciBzdGFycy5cbmV4cG9ydCBmdW5jdGlvbiBtZXJnZVVzZXJEYXRhKHNjYW5uaW5nRGF0YSkge1xuICAgIGNvbnNvbGUubG9nKFwiU0FUIE1lcmdpbmdcIik7XG4gICAgbGV0IGdhbGF4eSA9IGdldF9nYWxheHkoKTtcbiAgICBsZXQgc3RhcnMgPSBzY2FubmluZ0RhdGEuc3RhcnM7XG4gICAgbGV0IGZsZWV0cyA9IHNjYW5uaW5nRGF0YS5mbGVldHM7XG4gICAgLy8gVXBkYXRlIHN0YXJzXG4gICAgZm9yIChjb25zdCBzdGFySWQgaW4gc3RhcnMpIHtcbiAgICAgICAgY29uc3Qgc3RhciA9IHN0YXJzW3N0YXJJZF07XG4gICAgICAgIGlmIChnYWxheHkuc3RhcnNbc3RhcklkXSA9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGdhbGF4eS5zdGFyc1tzdGFySWRdID0gc3RhcjtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb25zb2xlLmxvZyhcIlN5bmNpbmdcIik7XG4gICAgLy8gQWRkIGZsZWV0c1xuICAgIGZvciAoY29uc3QgZmxlZXRJZCBpbiBmbGVldHMpIHtcbiAgICAgICAgY29uc3QgZmxlZXQgPSBmbGVldHNbZmxlZXRJZF07XG4gICAgICAgIGlmIChnYWxheHkuZmxlZXRzW2ZsZWV0SWRdID09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgZ2FsYXh5LmZsZWV0c1tmbGVldElkXSA9IGZsZWV0O1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vb25GdWxsVW5pdmVyc2UgU2VlbXMgdG8gYWRkaXRpb25hbGx5IGxvYWQgYWxsIHRoZSBwbGF5ZXJzLlxuICAgIE5lcHR1bmVzUHJpZGUubnAub25GdWxsVW5pdmVyc2UobnVsbCwgZ2FsYXh5KTtcbiAgICAvL05lcHR1bmVzUHJpZGUubnB1aS5vbkhpZGVTY3JlZW4obnVsbCwgdHJ1ZSk7XG59XG4iLCJpbXBvcnQgeyBnZXRfY2FjaGVkX2V2ZW50cywgdXBkYXRlX2V2ZW50X2NhY2hlLCB9IGZyb20gXCIuLi9ldmVudF9jYWNoZVwiO1xuZXhwb3J0IGZ1bmN0aW9uIGdldF9ucGNfdGljayhnYW1lLCBjcnV4KSB7XG4gICAgbGV0IGFpID0gZ2FtZS51bml2ZXJzZS5zZWxlY3RlZFBsYXllcjtcbiAgICBsZXQgY2FjaGUgPSBnZXRfY2FjaGVkX2V2ZW50cygpO1xuICAgIGxldCBldmVudHMgPSBjYWNoZS5tYXAoKGUpID0+IGUucGF5bG9hZCk7XG4gICAgbGV0IGdvb2RieWVzID0gZXZlbnRzLmZpbHRlcigoZSkgPT4gZS50ZW1wbGF0ZS5pbmNsdWRlcyhcImdvb2RieWVfdG9fcGxheWVyXCIpKTtcbiAgICBsZXQgdGljayA9IGdvb2RieWVzLmZpbHRlcigoZSkgPT4gZS51aWQgPT0gYWkudWlkKVswXS50aWNrO1xuICAgIGNvbnNvbGUubG9nKHRpY2spO1xuICAgIHJldHVybiB0aWNrO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGFkZF9ucGNfdGlja19jb3VudGVyKGdhbWUsIGNydXgpIHtcbiAgICBsZXQgdGljayA9IGdldF9ucGNfdGljayhnYW1lLCBjcnV4KTtcbiAgICBsZXQgdGl0bGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2NvbnRlbnRBcmVhID4gZGl2ID4gZGl2LndpZGdldC5mdWxsc2NyZWVuID4gZGl2Om50aC1jaGlsZCgzKSA+IGRpdiA+IGRpdjpudGgtY2hpbGQoNSkgPiBkaXYud2lkZ2V0LnNlY3Rpb25fdGl0bGUuY29sX2JsYWNrXCIpO1xuICAgIGxldCBzdWJ0aXRsZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjY29udGVudEFyZWEgPiBkaXYgPiBkaXYud2lkZ2V0LmZ1bGxzY3JlZW4gPiBkaXY6bnRoLWNoaWxkKDMpID4gZGl2ID4gZGl2Om50aC1jaGlsZCg1KSA+IGRpdi53aWRnZXQudHh0X3JpZ2h0LnBhZDEyXCIpO1xuICAgIGxldCBjdXJyZW50X3RpY2sgPSBnYW1lLnVuaXZlcnNlLmdhbGF4eS50aWNrO1xuICAgIGxldCBuZXh0X21vdmUgPSAoY3VycmVudF90aWNrIC0gdGljaykgJSA0O1xuICAgIGxldCBsYXN0X21vdmUgPSA0IC0gbmV4dF9tb3ZlO1xuICAgIC8vbGV0IGxhc3RfbW92ZSA9IGN1cnJlbnRfdGljay1uZXh0X21vdmVcbiAgICBsZXQgcG9zdGZpeF8xID0gXCJcIjtcbiAgICBsZXQgcG9zdGZpeF8yID0gXCJcIjtcbiAgICBpZiAobmV4dF9tb3ZlICE9IDEpIHtcbiAgICAgICAgcG9zdGZpeF8xICs9IFwic1wiO1xuICAgIH1cbiAgICBpZiAobGFzdF9tb3ZlICE9IDEpIHtcbiAgICAgICAgcG9zdGZpeF8yICs9IFwic1wiO1xuICAgIH1cbiAgICBpZiAobmV4dF9tb3ZlID09IDApIHtcbiAgICAgICAgbmV4dF9tb3ZlID0gNDtcbiAgICAgICAgdGl0bGUuaW5uZXJUZXh0ID0gYEFJIG1vdmVzIGluICR7bmV4dF9tb3ZlfSB0aWNrJHtwb3N0Zml4XzF9YDtcbiAgICAgICAgc3VidGl0bGUuaW5uZXJUZXh0ID0gXCJBSSBtb3ZlZCB0aGlzIHRpY2tcIjtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHRpdGxlLmlubmVyVGV4dCA9IGBBSSBtb3ZlcyBpbiAke25leHRfbW92ZX0gdGljayR7cG9zdGZpeF8xfWA7XG4gICAgICAgIHN1YnRpdGxlLmlubmVyVGV4dCA9IGBBSSBsYXN0IG1vdmVkICR7bGFzdF9tb3ZlfSB0aWNrJHtwb3N0Zml4XzJ9IGFnb2A7XG4gICAgICAgIC8vc3VidGl0bGUuaW5uZXJUZXh0ID0gYEFJIGxhc3QgbW92ZWQgb24gdGljayAke2xhc3RfbW92ZX1gXG4gICAgfVxufVxuZXhwb3J0IGZ1bmN0aW9uIGhvb2tfbnBjX3RpY2tfY291bnRlcihnYW1lLCBjcnV4KSB7XG4gICAgY29uc3Qgc2VsZWN0ZWRQbGF5ZXIgPSBnYW1lLnVuaXZlcnNlLnNlbGVjdGVkUGxheWVyO1xuICAgIGlmIChzZWxlY3RlZFBsYXllci5haSkge1xuICAgICAgICB1cGRhdGVfZXZlbnRfY2FjaGUoZ2FtZSwgY3J1eCwgNCwgYWRkX25wY190aWNrX2NvdW50ZXIsIGNvbnNvbGUuZXJyb3IpO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IG1hcmtlZCB9IGZyb20gXCJtYXJrZWRcIjtcbmV4cG9ydCBmdW5jdGlvbiBtYXJrZG93bihtYXJrZG93blN0cmluZykge1xuICAgIHJldHVybiBtYXJrZWQucGFyc2UobWFya2Rvd25TdHJpbmcpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGlzX3ZhbGlkX2ltYWdlX3VybChzdHIpIHtcbiAgICBjb25zdCBwcm90b2NvbCA9IFwiXihodHRwczpcXFxcL1xcXFwvKVwiO1xuICAgIGNvbnN0IGRvbWFpbnMgPSBcIihpXFxcXC5pYmJcXFxcLmNvfGlcXFxcLmltZ3VyXFxcXC5jb218Y2RuXFxcXC5kaXNjb3JkYXBwXFxcXC5jb20pXCI7XG4gICAgY29uc3QgY29udGVudCA9IFwiKFsmI189O1xcXFwtXFxcXD9cXFxcL1xcXFx3XXsxLDE1MH0pXCI7XG4gICAgY29uc3QgaW1hZ2VzID0gXCIoXFxcXC4pKGdpZnxqcGU/Z3x0aWZmP3xwbmd8d2VicHxibXB8R0lGfEpQRT9HfFRJRkY/fFBOR3xXRUJQfEJNUCkkXCI7XG4gICAgY29uc3QgcmVnZXhfc3RyaW5nID0gcHJvdG9jb2wgKyBkb21haW5zICsgY29udGVudCArIGltYWdlcztcbiAgICBsZXQgcmVnZXggPSBuZXcgUmVnRXhwKHJlZ2V4X3N0cmluZyk7XG4gICAgbGV0IHZhbGlkID0gcmVnZXgudGVzdChzdHIpO1xuICAgIHJldHVybiB2YWxpZDtcbn1cbmV4cG9ydCBmdW5jdGlvbiBpc192YWxpZF95b3V0dWJlKHN0cikge1xuICAgIGNvbnN0IHByb3RvY29sID0gXCJeKGh0dHBzOi8vKVwiO1xuICAgIGNvbnN0IGRvbWFpbnMgPSBcIih5b3V0dWJlLmNvbXx3d3cueW91dHViZS5jb218eW91dHUuYmUpXCI7XG4gICAgY29uc3QgY29udGVudCA9IFwiKFsmI189Oy0/L3ddezEsMTUwfSlcIjtcbiAgICBjb25zdCByZWdleF9zdHJpbmcgPSBwcm90b2NvbCArIGRvbWFpbnMgKyBjb250ZW50O1xuICAgIGxldCByZWdleCA9IG5ldyBSZWdFeHAocmVnZXhfc3RyaW5nKTtcbiAgICByZXR1cm4gcmVnZXgudGVzdChzdHIpO1xufVxuZnVuY3Rpb24gZ2V0X3lvdXR1YmVfZW1iZWQobGluaykge1xuICAgIHJldHVybiBgPGlmcmFtZSB3aWR0aD1cIjU2MFwiIGhlaWdodD1cIjMxNVwiIHNyYz1cImh0dHBzOi8vd3d3LnlvdXR1YmUuY29tL2VtYmVkL2VIc0RUR3dfalo4XCIgdGl0bGU9XCJZb3VUdWJlIHZpZGVvIHBsYXllclwiIGZyYW1lYm9yZGVyPVwiMFwiIGFsbG93PVwiYWNjZWxlcm9tZXRlcjsgYXV0b3BsYXk7IGNsaXBib2FyZC13cml0ZTsgZW5jcnlwdGVkLW1lZGlhOyBneXJvc2NvcGU7IHBpY3R1cmUtaW4tcGljdHVyZTsgd2ViLXNoYXJlXCIgYWxsb3dmdWxsc2NyZWVuPjwvaWZyYW1lPmA7XG59XG4iLCJ2YXIgX19hd2FpdGVyID0gKHRoaXMgJiYgdGhpcy5fX2F3YWl0ZXIpIHx8IGZ1bmN0aW9uICh0aGlzQXJnLCBfYXJndW1lbnRzLCBQLCBnZW5lcmF0b3IpIHtcbiAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH1cbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgZnVuY3Rpb24gZnVsZmlsbGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yLm5leHQodmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvcltcInRocm93XCJdKHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cbiAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpO1xuICAgIH0pO1xufTtcbmNvbnN0IEtWX1JFU1RfQVBJX1VSTCA9IFwiaHR0cHM6Ly9pbW11bmUtY3JpY2tldC0zNjAxMS5rdi52ZXJjZWwtc3RvcmFnZS5jb21cIjtcbmNvbnN0IEtWX1JFU1RfQVBJX1JFQURfT05MWV9UT0tFTiA9IFwiQW95ckFTUWdOekUwTTJFMk5UTXRNbUZqTkMwMFpURmxMV0ptTlRJdE1HUmxZV1ptTW1ZM01UYzBacHRHOTZlbGJYT2paSjdfR0U3dy1hcllBR0Nha3RvbzI1cTREWFJXTDdVPVwiO1xuY29uc3QgY3VzdG9tX2JhZGdlcyA9IFtcImFwZVwiXTtcbi8vIEZ1bmN0aW9uIHRoYXQgY29ubmVjdHMgdG8gc2VydmVyIGFuZCByZXRyaWV2ZXMgbGlzdCBvbiBrZXkgJ2FwZSdcbmV4cG9ydCBjb25zdCBnZXRfYXBlX2JhZGdlcyA9ICgpID0+IF9fYXdhaXRlcih2b2lkIDAsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkge1xuICAgIHJldHVybiBmZXRjaChLVl9SRVNUX0FQSV9VUkwsIHtcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgQXV0aG9yaXphdGlvbjogYEJlYXJlciAke0tWX1JFU1RfQVBJX1JFQURfT05MWV9UT0tFTn1gLFxuICAgICAgICB9LFxuICAgICAgICBib2R5OiAnW1wiTFJBTkdFXCIsIFwiYXBlXCIsIDAsIC0xXScsXG4gICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgfSlcbiAgICAgICAgLnRoZW4oKHJlc3BvbnNlKSA9PiByZXNwb25zZS5qc29uKCkpXG4gICAgICAgIC50aGVuKChkYXRhKSA9PiBkYXRhLnJlc3VsdCk7XG59KTtcbi8qIFVwZGF0aW5nIEJhZGdlIENsYXNzZXMgKi9cbmV4cG9ydCBjb25zdCBBcGVCYWRnZUljb24gPSBmdW5jdGlvbiAoQ3J1eCwgdXJsLCBmaWxlbmFtZSwgY291bnQsIHNtYWxsKSB7XG4gICAgdmFyIGViaSA9IENydXguV2lkZ2V0KCk7XG4gICAgaWYgKHNtYWxsID09PSB1bmRlZmluZWQpXG4gICAgICAgIHNtYWxsID0gZmFsc2U7XG4gICAgaWYgKHNtYWxsKSB7XG4gICAgICAgIC8qIFNtYWxsIGltYWdlcyAqL1xuICAgICAgICBsZXQgaW1hZ2VfdXJsID0gYC9pbWFnZXMvYmFkZ2VzX3NtYWxsLyR7ZmlsZW5hbWV9LnBuZ2A7XG4gICAgICAgIGlmIChmaWxlbmFtZSA9PSBcImFwZVwiKSB7XG4gICAgICAgICAgICBpbWFnZV91cmwgPSBgJHt1cmx9JHtmaWxlbmFtZX1fc21hbGwucG5nYDtcbiAgICAgICAgfVxuICAgICAgICBDcnV4LkltYWdlKGltYWdlX3VybCwgXCJhYnNcIikuZ3JpZCgwLjI1LCAwLjI1LCAyLjUsIDIuNSkucm9vc3QoZWJpKTtcbiAgICAgICAgQ3J1eC5DbGlja2FibGUoXCJzaG93X3NjcmVlblwiLCBcImJ1eV9naWZ0XCIpXG4gICAgICAgICAgICAuZ3JpZCgwLjI1LCAwLjI1LCAyLjUsIDIuNSlcbiAgICAgICAgICAgIC50dChgYmFkZ2VfJHtmaWxlbmFtZX1gKVxuICAgICAgICAgICAgLnJvb3N0KGViaSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICAvKiBCaWcgaW1hZ2VzICovXG4gICAgICAgIGxldCBpbWFnZV91cmwgPSBgL2ltYWdlcy9iYWRnZXMvJHtmaWxlbmFtZX0ucG5nYDtcbiAgICAgICAgaWYgKGZpbGVuYW1lID09IFwiYXBlXCIpIHtcbiAgICAgICAgICAgIGltYWdlX3VybCA9IGAke3VybH0ke2ZpbGVuYW1lfS5wbmdgO1xuICAgICAgICB9XG4gICAgICAgIENydXguSW1hZ2UoaW1hZ2VfdXJsLCBcImFic1wiKS5ncmlkKDAsIDAsIDYsIDYpLnR0KGZpbGVuYW1lKS5yb29zdChlYmkpO1xuICAgICAgICBDcnV4LkNsaWNrYWJsZShcInNob3dfc2NyZWVuXCIsIFwiYnV5X2dpZnRcIilcbiAgICAgICAgICAgIC5ncmlkKDAsIDAsIDYsIDYpXG4gICAgICAgICAgICAudHQoYGJhZGdlXyR7ZmlsZW5hbWV9YClcbiAgICAgICAgICAgIC5yb29zdChlYmkpO1xuICAgIH1cbiAgICBpZiAoY291bnQgPiAxICYmICFzbWFsbCkge1xuICAgICAgICBDcnV4LkltYWdlKFwiL2ltYWdlcy9iYWRnZXMvY291bnRlci5wbmdcIiwgXCJhYnNcIilcbiAgICAgICAgICAgIC5ncmlkKDAsIDAsIDYsIDYpXG4gICAgICAgICAgICAudHQoZmlsZW5hbWUpXG4gICAgICAgICAgICAucm9vc3QoZWJpKTtcbiAgICAgICAgQ3J1eC5UZXh0KFwiXCIsIFwidHh0X2NlbnRlciB0eHRfdGlueVwiLCBcImFic1wiKVxuICAgICAgICAgICAgLnJhd0hUTUwoY291bnQpXG4gICAgICAgICAgICAucG9zKDUxLCA2OClcbiAgICAgICAgICAgIC5zaXplKDMyLCAzMilcbiAgICAgICAgICAgIC5yb29zdChlYmkpO1xuICAgIH1cbiAgICByZXR1cm4gZWJpO1xufTtcbi8qXG5jb25zdCBncm91cEFwZUJhZGdlcyA9IGZ1bmN0aW9uIChiYWRnZXNTdHJpbmc6IHN0cmluZykge1xuICBpZiAoIWJhZGdlc1N0cmluZykgYmFkZ2VzU3RyaW5nID0gXCJcIjtcbiAgdmFyIGdyb3VwZWRCYWRnZXM6IHsgW2tleTogc3RyaW5nXTogbnVtYmVyIH0gPSB7fTtcbiAgdmFyIGk7XG4gIGZvciAoaSA9IGJhZGdlc1N0cmluZy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIHZhciBiY2hhciA9IGJhZGdlc1N0cmluZy5jaGFyQXQoaSk7XG4gICAgaWYgKGdyb3VwZWRCYWRnZXMuaGFzT3duUHJvcGVydHkoYmNoYXIpKSB7XG4gICAgICBncm91cGVkQmFkZ2VzW2JjaGFyXSArPSAxO1xuICAgIH0gZWxzZSB7XG4gICAgICBncm91cGVkQmFkZ2VzW2JjaGFyXSA9IDE7XG4gICAgfVxuICB9XG4gIHJldHVybiBncm91cGVkQmFkZ2VzO1xufTtcbiovXG4iLCJpbXBvcnQgeyBEZWxhdW5heSB9IGZyb20gXCJkMy1kZWxhdW5heVwiO1xuZXhwb3J0IGZ1bmN0aW9uIGdldFRlcnJpdG9yeSh1bml2ZXJzZSwgY2FudmFzKSB7XG4gICAgbGV0IHN0YXJfbWFwID0gdW5pdmVyc2UuZ2FsYXh5LnN0YXJzO1xuICAgIGxldCBzdGFycyA9IFtdO1xuICAgIGZvciAobGV0IHN0YXJfaWQgaW4gc3Rhcl9tYXApIHtcbiAgICAgICAgc3RhcnMucHVzaChzdGFyX21hcFtzdGFyX2lkXSk7XG4gICAgfVxuICAgIGxldCBwb3NpdGlvbnMgPSBzdGFycy5tYXAoKHN0YXIpID0+IHtcbiAgICAgICAgcmV0dXJuIFtzdGFyLngsIHN0YXIueV07XG4gICAgfSk7XG4gICAgY29uc3QgZGVsYXVuYXkgPSBEZWxhdW5heS5mcm9tKHBvc2l0aW9ucyk7XG4gICAgY29uc3Qgdm9yb25vaSA9IGRlbGF1bmF5LnZvcm9ub2koWzAsIDAsIDk2MCwgNTAwXSk7XG4gICAgY29uc3QgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XG4gICAgaWYgKGNvbnRleHQpIHtcbiAgICAgICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICAgICAgZm9yIChjb25zdCBwb2x5Z29uIG9mIHZvcm9ub2kuY2VsbFBvbHlnb25zKCkpIHtcbiAgICAgICAgICAgIGNvbnRleHQubW92ZVRvKHBvbHlnb25bMF1bMF0sIHBvbHlnb25bMF1bMV0pO1xuICAgICAgICAgICAgZm9yIChjb25zdCBwb2ludCBvZiBwb2x5Z29uKSB7XG4gICAgICAgICAgICAgICAgY29udGV4dC5saW5lVG8ocG9pbnRbMF0sIHBvaW50WzFdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnRleHQuY2xvc2VQYXRoKCk7XG4gICAgICAgIH1cbiAgICAgICAgY29udGV4dC5zdHJva2UoKTtcbiAgICB9XG59XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX3JlYWQgPSAodGhpcyAmJiB0aGlzLl9fcmVhZCkgfHwgZnVuY3Rpb24gKG8sIG4pIHtcbiAgICB2YXIgbSA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvW1N5bWJvbC5pdGVyYXRvcl07XG4gICAgaWYgKCFtKSByZXR1cm4gbztcbiAgICB2YXIgaSA9IG0uY2FsbChvKSwgciwgYXIgPSBbXSwgZTtcbiAgICB0cnkge1xuICAgICAgICB3aGlsZSAoKG4gPT09IHZvaWQgMCB8fCBuLS0gPiAwKSAmJiAhKHIgPSBpLm5leHQoKSkuZG9uZSkgYXIucHVzaChyLnZhbHVlKTtcbiAgICB9XG4gICAgY2F0Y2ggKGVycm9yKSB7IGUgPSB7IGVycm9yOiBlcnJvciB9OyB9XG4gICAgZmluYWxseSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAociAmJiAhci5kb25lICYmIChtID0gaVtcInJldHVyblwiXSkpIG0uY2FsbChpKTtcbiAgICAgICAgfVxuICAgICAgICBmaW5hbGx5IHsgaWYgKGUpIHRocm93IGUuZXJyb3I7IH1cbiAgICB9XG4gICAgcmV0dXJuIGFyO1xufTtcbnZhciBfX3NwcmVhZEFycmF5ID0gKHRoaXMgJiYgdGhpcy5fX3NwcmVhZEFycmF5KSB8fCBmdW5jdGlvbiAodG8sIGZyb20pIHtcbiAgICBmb3IgKHZhciBpID0gMCwgaWwgPSBmcm9tLmxlbmd0aCwgaiA9IHRvLmxlbmd0aDsgaSA8IGlsOyBpKyssIGorKylcbiAgICAgICAgdG9bal0gPSBmcm9tW2ldO1xuICAgIHJldHVybiB0bztcbn07XG52YXIgX19pbXBvcnREZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydERlZmF1bHQpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IFwiZGVmYXVsdFwiOiBtb2QgfTtcbn07XG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuZXhwb3J0cy51bmlxdWUgPSBleHBvcnRzLm1lcmdlV2l0aFJ1bGVzID0gZXhwb3J0cy5tZXJnZVdpdGhDdXN0b21pemUgPSBleHBvcnRzW1wiZGVmYXVsdFwiXSA9IGV4cG9ydHMubWVyZ2UgPSBleHBvcnRzLkN1c3RvbWl6ZVJ1bGUgPSBleHBvcnRzLmN1c3RvbWl6ZU9iamVjdCA9IGV4cG9ydHMuY3VzdG9taXplQXJyYXkgPSB2b2lkIDA7XG52YXIgd2lsZGNhcmRfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwid2lsZGNhcmRcIikpO1xudmFyIG1lcmdlX3dpdGhfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi9tZXJnZS13aXRoXCIpKTtcbnZhciBqb2luX2FycmF5c18xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuL2pvaW4tYXJyYXlzXCIpKTtcbnZhciB1bmlxdWVfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi91bmlxdWVcIikpO1xuZXhwb3J0cy51bmlxdWUgPSB1bmlxdWVfMVtcImRlZmF1bHRcIl07XG52YXIgdHlwZXNfMSA9IHJlcXVpcmUoXCIuL3R5cGVzXCIpO1xuZXhwb3J0cy5DdXN0b21pemVSdWxlID0gdHlwZXNfMS5DdXN0b21pemVSdWxlO1xudmFyIHV0aWxzXzEgPSByZXF1aXJlKFwiLi91dGlsc1wiKTtcbmZ1bmN0aW9uIG1lcmdlKGZpcnN0Q29uZmlndXJhdGlvbikge1xuICAgIHZhciBjb25maWd1cmF0aW9ucyA9IFtdO1xuICAgIGZvciAodmFyIF9pID0gMTsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgIGNvbmZpZ3VyYXRpb25zW19pIC0gMV0gPSBhcmd1bWVudHNbX2ldO1xuICAgIH1cbiAgICByZXR1cm4gbWVyZ2VXaXRoQ3VzdG9taXplKHt9KS5hcHBseSh2b2lkIDAsIF9fc3ByZWFkQXJyYXkoW2ZpcnN0Q29uZmlndXJhdGlvbl0sIF9fcmVhZChjb25maWd1cmF0aW9ucykpKTtcbn1cbmV4cG9ydHMubWVyZ2UgPSBtZXJnZTtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gbWVyZ2U7XG5mdW5jdGlvbiBtZXJnZVdpdGhDdXN0b21pemUob3B0aW9ucykge1xuICAgIHJldHVybiBmdW5jdGlvbiBtZXJnZVdpdGhPcHRpb25zKGZpcnN0Q29uZmlndXJhdGlvbikge1xuICAgICAgICB2YXIgY29uZmlndXJhdGlvbnMgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgX2kgPSAxOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb25zW19pIC0gMV0gPSBhcmd1bWVudHNbX2ldO1xuICAgICAgICB9XG4gICAgICAgIGlmICh1dGlsc18xLmlzVW5kZWZpbmVkKGZpcnN0Q29uZmlndXJhdGlvbikgfHwgY29uZmlndXJhdGlvbnMuc29tZSh1dGlsc18xLmlzVW5kZWZpbmVkKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIk1lcmdpbmcgdW5kZWZpbmVkIGlzIG5vdCBzdXBwb3J0ZWRcIik7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICBpZiAoZmlyc3RDb25maWd1cmF0aW9uLnRoZW4pIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJQcm9taXNlcyBhcmUgbm90IHN1cHBvcnRlZFwiKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBObyBjb25maWd1cmF0aW9uIGF0IGFsbFxuICAgICAgICBpZiAoIWZpcnN0Q29uZmlndXJhdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuIHt9O1xuICAgICAgICB9XG4gICAgICAgIGlmIChjb25maWd1cmF0aW9ucy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGZpcnN0Q29uZmlndXJhdGlvbikpIHtcbiAgICAgICAgICAgICAgICAvLyBFbXB0eSBhcnJheVxuICAgICAgICAgICAgICAgIGlmIChmaXJzdENvbmZpZ3VyYXRpb24ubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7fTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGZpcnN0Q29uZmlndXJhdGlvbi5zb21lKHV0aWxzXzEuaXNVbmRlZmluZWQpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJNZXJnaW5nIHVuZGVmaW5lZCBpcyBub3Qgc3VwcG9ydGVkXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICAgICAgaWYgKGZpcnN0Q29uZmlndXJhdGlvblswXS50aGVuKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJQcm9taXNlcyBhcmUgbm90IHN1cHBvcnRlZFwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1lcmdlX3dpdGhfMVtcImRlZmF1bHRcIl0oZmlyc3RDb25maWd1cmF0aW9uLCBqb2luX2FycmF5c18xW1wiZGVmYXVsdFwiXShvcHRpb25zKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmlyc3RDb25maWd1cmF0aW9uO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtZXJnZV93aXRoXzFbXCJkZWZhdWx0XCJdKFtmaXJzdENvbmZpZ3VyYXRpb25dLmNvbmNhdChjb25maWd1cmF0aW9ucyksIGpvaW5fYXJyYXlzXzFbXCJkZWZhdWx0XCJdKG9wdGlvbnMpKTtcbiAgICB9O1xufVxuZXhwb3J0cy5tZXJnZVdpdGhDdXN0b21pemUgPSBtZXJnZVdpdGhDdXN0b21pemU7XG5mdW5jdGlvbiBjdXN0b21pemVBcnJheShydWxlcykge1xuICAgIHJldHVybiBmdW5jdGlvbiAoYSwgYiwga2V5KSB7XG4gICAgICAgIHZhciBtYXRjaGVkUnVsZSA9IE9iamVjdC5rZXlzKHJ1bGVzKS5maW5kKGZ1bmN0aW9uIChydWxlKSB7IHJldHVybiB3aWxkY2FyZF8xW1wiZGVmYXVsdFwiXShydWxlLCBrZXkpOyB9KSB8fCBcIlwiO1xuICAgICAgICBpZiAobWF0Y2hlZFJ1bGUpIHtcbiAgICAgICAgICAgIHN3aXRjaCAocnVsZXNbbWF0Y2hlZFJ1bGVdKSB7XG4gICAgICAgICAgICAgICAgY2FzZSB0eXBlc18xLkN1c3RvbWl6ZVJ1bGUuUHJlcGVuZDpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF9fc3ByZWFkQXJyYXkoX19zcHJlYWRBcnJheShbXSwgX19yZWFkKGIpKSwgX19yZWFkKGEpKTtcbiAgICAgICAgICAgICAgICBjYXNlIHR5cGVzXzEuQ3VzdG9taXplUnVsZS5SZXBsYWNlOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYjtcbiAgICAgICAgICAgICAgICBjYXNlIHR5cGVzXzEuQ3VzdG9taXplUnVsZS5BcHBlbmQ6XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF9fc3ByZWFkQXJyYXkoX19zcHJlYWRBcnJheShbXSwgX19yZWFkKGEpKSwgX19yZWFkKGIpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG59XG5leHBvcnRzLmN1c3RvbWl6ZUFycmF5ID0gY3VzdG9taXplQXJyYXk7XG5mdW5jdGlvbiBtZXJnZVdpdGhSdWxlcyhydWxlcykge1xuICAgIHJldHVybiBtZXJnZVdpdGhDdXN0b21pemUoe1xuICAgICAgICBjdXN0b21pemVBcnJheTogZnVuY3Rpb24gKGEsIGIsIGtleSkge1xuICAgICAgICAgICAgdmFyIGN1cnJlbnRSdWxlID0gcnVsZXM7XG4gICAgICAgICAgICBrZXkuc3BsaXQoXCIuXCIpLmZvckVhY2goZnVuY3Rpb24gKGspIHtcbiAgICAgICAgICAgICAgICBpZiAoIWN1cnJlbnRSdWxlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY3VycmVudFJ1bGUgPSBjdXJyZW50UnVsZVtrXTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKHV0aWxzXzEuaXNQbGFpbk9iamVjdChjdXJyZW50UnVsZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbWVyZ2VXaXRoUnVsZSh7IGN1cnJlbnRSdWxlOiBjdXJyZW50UnVsZSwgYTogYSwgYjogYiB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0eXBlb2YgY3VycmVudFJ1bGUgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbWVyZ2VJbmRpdmlkdWFsUnVsZSh7IGN1cnJlbnRSdWxlOiBjdXJyZW50UnVsZSwgYTogYSwgYjogYiB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cbmV4cG9ydHMubWVyZ2VXaXRoUnVsZXMgPSBtZXJnZVdpdGhSdWxlcztcbnZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheTtcbmZ1bmN0aW9uIG1lcmdlV2l0aFJ1bGUoX2EpIHtcbiAgICB2YXIgY3VycmVudFJ1bGUgPSBfYS5jdXJyZW50UnVsZSwgYSA9IF9hLmEsIGIgPSBfYS5iO1xuICAgIGlmICghaXNBcnJheShhKSkge1xuICAgICAgICByZXR1cm4gYTtcbiAgICB9XG4gICAgdmFyIGJBbGxNYXRjaGVzID0gW107XG4gICAgdmFyIHJldCA9IGEubWFwKGZ1bmN0aW9uIChhbykge1xuICAgICAgICBpZiAoIXV0aWxzXzEuaXNQbGFpbk9iamVjdChjdXJyZW50UnVsZSkpIHtcbiAgICAgICAgICAgIHJldHVybiBhbztcbiAgICAgICAgfVxuICAgICAgICB2YXIgcmV0ID0ge307XG4gICAgICAgIHZhciBydWxlc1RvTWF0Y2ggPSBbXTtcbiAgICAgICAgdmFyIG9wZXJhdGlvbnMgPSB7fTtcbiAgICAgICAgT2JqZWN0LmVudHJpZXMoY3VycmVudFJ1bGUpLmZvckVhY2goZnVuY3Rpb24gKF9hKSB7XG4gICAgICAgICAgICB2YXIgX2IgPSBfX3JlYWQoX2EsIDIpLCBrID0gX2JbMF0sIHYgPSBfYlsxXTtcbiAgICAgICAgICAgIGlmICh2ID09PSB0eXBlc18xLkN1c3RvbWl6ZVJ1bGUuTWF0Y2gpIHtcbiAgICAgICAgICAgICAgICBydWxlc1RvTWF0Y2gucHVzaChrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIG9wZXJhdGlvbnNba10gPSB2O1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdmFyIGJNYXRjaGVzID0gYi5maWx0ZXIoZnVuY3Rpb24gKG8pIHtcbiAgICAgICAgICAgIHZhciBtYXRjaGVzID0gcnVsZXNUb01hdGNoLmV2ZXJ5KGZ1bmN0aW9uIChydWxlKSB7IHZhciBfYSwgX2I7IHJldHVybiAoKF9hID0gYW9bcnVsZV0pID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS50b1N0cmluZygpKSA9PT0gKChfYiA9IG9bcnVsZV0pID09PSBudWxsIHx8IF9iID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYi50b1N0cmluZygpKTsgfSk7XG4gICAgICAgICAgICBpZiAobWF0Y2hlcykge1xuICAgICAgICAgICAgICAgIGJBbGxNYXRjaGVzLnB1c2gobyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbWF0Y2hlcztcbiAgICAgICAgfSk7XG4gICAgICAgIGlmICghdXRpbHNfMS5pc1BsYWluT2JqZWN0KGFvKSkge1xuICAgICAgICAgICAgcmV0dXJuIGFvO1xuICAgICAgICB9XG4gICAgICAgIE9iamVjdC5lbnRyaWVzKGFvKS5mb3JFYWNoKGZ1bmN0aW9uIChfYSkge1xuICAgICAgICAgICAgdmFyIF9iID0gX19yZWFkKF9hLCAyKSwgayA9IF9iWzBdLCB2ID0gX2JbMV07XG4gICAgICAgICAgICB2YXIgcnVsZSA9IGN1cnJlbnRSdWxlO1xuICAgICAgICAgICAgc3dpdGNoIChjdXJyZW50UnVsZVtrXSkge1xuICAgICAgICAgICAgICAgIGNhc2UgdHlwZXNfMS5DdXN0b21pemVSdWxlLk1hdGNoOlxuICAgICAgICAgICAgICAgICAgICByZXRba10gPSB2O1xuICAgICAgICAgICAgICAgICAgICBPYmplY3QuZW50cmllcyhydWxlKS5mb3JFYWNoKGZ1bmN0aW9uIChfYSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIF9iID0gX19yZWFkKF9hLCAyKSwgayA9IF9iWzBdLCB2ID0gX2JbMV07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodiA9PT0gdHlwZXNfMS5DdXN0b21pemVSdWxlLlJlcGxhY2UgJiYgYk1hdGNoZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB2YWwgPSBsYXN0KGJNYXRjaGVzKVtrXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHZhbCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXRba10gPSB2YWw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSB0eXBlc18xLkN1c3RvbWl6ZVJ1bGUuQXBwZW5kOlxuICAgICAgICAgICAgICAgICAgICBpZiAoIWJNYXRjaGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0W2tdID0gdjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHZhciBhcHBlbmRWYWx1ZSA9IGxhc3QoYk1hdGNoZXMpW2tdO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWlzQXJyYXkodikgfHwgIWlzQXJyYXkoYXBwZW5kVmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiVHJ5aW5nIHRvIGFwcGVuZCBub24tYXJyYXlzXCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldFtrXSA9IHYuY29uY2F0KGFwcGVuZFZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSB0eXBlc18xLkN1c3RvbWl6ZVJ1bGUuTWVyZ2U6XG4gICAgICAgICAgICAgICAgICAgIGlmICghYk1hdGNoZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXRba10gPSB2O1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdmFyIGxhc3RWYWx1ZSA9IGxhc3QoYk1hdGNoZXMpW2tdO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXV0aWxzXzEuaXNQbGFpbk9iamVjdCh2KSB8fCAhdXRpbHNfMS5pc1BsYWluT2JqZWN0KGxhc3RWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJUcnlpbmcgdG8gbWVyZ2Ugbm9uLW9iamVjdHNcIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gZGVlcCBtZXJnZVxuICAgICAgICAgICAgICAgICAgICByZXRba10gPSBtZXJnZSh2LCBsYXN0VmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIHR5cGVzXzEuQ3VzdG9taXplUnVsZS5QcmVwZW5kOlxuICAgICAgICAgICAgICAgICAgICBpZiAoIWJNYXRjaGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0W2tdID0gdjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHZhciBwcmVwZW5kVmFsdWUgPSBsYXN0KGJNYXRjaGVzKVtrXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpc0FycmF5KHYpIHx8ICFpc0FycmF5KHByZXBlbmRWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJUcnlpbmcgdG8gcHJlcGVuZCBub24tYXJyYXlzXCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldFtrXSA9IHByZXBlbmRWYWx1ZS5jb25jYXQodik7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgdHlwZXNfMS5DdXN0b21pemVSdWxlLlJlcGxhY2U6XG4gICAgICAgICAgICAgICAgICAgIHJldFtrXSA9IGJNYXRjaGVzLmxlbmd0aCA+IDAgPyBsYXN0KGJNYXRjaGVzKVtrXSA6IHY7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIHZhciBjdXJyZW50UnVsZV8xID0gb3BlcmF0aW9uc1trXTtcbiAgICAgICAgICAgICAgICAgICAgLy8gVXNlIC5mbGF0KCk7IHN0YXJ0aW5nIGZyb20gTm9kZSAxMlxuICAgICAgICAgICAgICAgICAgICB2YXIgYl8xID0gYk1hdGNoZXNcbiAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAoZnVuY3Rpb24gKG8pIHsgcmV0dXJuIG9ba107IH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAucmVkdWNlKGZ1bmN0aW9uIChhY2MsIHZhbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGlzQXJyYXkoYWNjKSAmJiBpc0FycmF5KHZhbCkgPyBfX3NwcmVhZEFycmF5KF9fc3ByZWFkQXJyYXkoW10sIF9fcmVhZChhY2MpKSwgX19yZWFkKHZhbCkpIDogYWNjO1xuICAgICAgICAgICAgICAgICAgICB9LCBbXSk7XG4gICAgICAgICAgICAgICAgICAgIHJldFtrXSA9IG1lcmdlV2l0aFJ1bGUoeyBjdXJyZW50UnVsZTogY3VycmVudFJ1bGVfMSwgYTogdiwgYjogYl8xIH0pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJldC5jb25jYXQoYi5maWx0ZXIoZnVuY3Rpb24gKG8pIHsgcmV0dXJuICFiQWxsTWF0Y2hlcy5pbmNsdWRlcyhvKTsgfSkpO1xufVxuZnVuY3Rpb24gbWVyZ2VJbmRpdmlkdWFsUnVsZShfYSkge1xuICAgIHZhciBjdXJyZW50UnVsZSA9IF9hLmN1cnJlbnRSdWxlLCBhID0gX2EuYSwgYiA9IF9hLmI7XG4gICAgLy8gV2hhdCBpZiB0aGVyZSdzIG5vIG1hdGNoP1xuICAgIHN3aXRjaCAoY3VycmVudFJ1bGUpIHtcbiAgICAgICAgY2FzZSB0eXBlc18xLkN1c3RvbWl6ZVJ1bGUuQXBwZW5kOlxuICAgICAgICAgICAgcmV0dXJuIGEuY29uY2F0KGIpO1xuICAgICAgICBjYXNlIHR5cGVzXzEuQ3VzdG9taXplUnVsZS5QcmVwZW5kOlxuICAgICAgICAgICAgcmV0dXJuIGIuY29uY2F0KGEpO1xuICAgICAgICBjYXNlIHR5cGVzXzEuQ3VzdG9taXplUnVsZS5SZXBsYWNlOlxuICAgICAgICAgICAgcmV0dXJuIGI7XG4gICAgfVxuICAgIHJldHVybiBhO1xufVxuZnVuY3Rpb24gbGFzdChhcnIpIHtcbiAgICByZXR1cm4gYXJyW2Fyci5sZW5ndGggLSAxXTtcbn1cbmZ1bmN0aW9uIGN1c3RvbWl6ZU9iamVjdChydWxlcykge1xuICAgIHJldHVybiBmdW5jdGlvbiAoYSwgYiwga2V5KSB7XG4gICAgICAgIHN3aXRjaCAocnVsZXNba2V5XSkge1xuICAgICAgICAgICAgY2FzZSB0eXBlc18xLkN1c3RvbWl6ZVJ1bGUuUHJlcGVuZDpcbiAgICAgICAgICAgICAgICByZXR1cm4gbWVyZ2Vfd2l0aF8xW1wiZGVmYXVsdFwiXShbYiwgYV0sIGpvaW5fYXJyYXlzXzFbXCJkZWZhdWx0XCJdKCkpO1xuICAgICAgICAgICAgY2FzZSB0eXBlc18xLkN1c3RvbWl6ZVJ1bGUuUmVwbGFjZTpcbiAgICAgICAgICAgICAgICByZXR1cm4gYjtcbiAgICAgICAgICAgIGNhc2UgdHlwZXNfMS5DdXN0b21pemVSdWxlLkFwcGVuZDpcbiAgICAgICAgICAgICAgICByZXR1cm4gbWVyZ2Vfd2l0aF8xW1wiZGVmYXVsdFwiXShbYSwgYl0sIGpvaW5fYXJyYXlzXzFbXCJkZWZhdWx0XCJdKCkpO1xuICAgICAgICB9XG4gICAgfTtcbn1cbmV4cG9ydHMuY3VzdG9taXplT2JqZWN0ID0gY3VzdG9taXplT2JqZWN0O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXguanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19yZWFkID0gKHRoaXMgJiYgdGhpcy5fX3JlYWQpIHx8IGZ1bmN0aW9uIChvLCBuKSB7XG4gICAgdmFyIG0gPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb1tTeW1ib2wuaXRlcmF0b3JdO1xuICAgIGlmICghbSkgcmV0dXJuIG87XG4gICAgdmFyIGkgPSBtLmNhbGwobyksIHIsIGFyID0gW10sIGU7XG4gICAgdHJ5IHtcbiAgICAgICAgd2hpbGUgKChuID09PSB2b2lkIDAgfHwgbi0tID4gMCkgJiYgIShyID0gaS5uZXh0KCkpLmRvbmUpIGFyLnB1c2goci52YWx1ZSk7XG4gICAgfVxuICAgIGNhdGNoIChlcnJvcikgeyBlID0geyBlcnJvcjogZXJyb3IgfTsgfVxuICAgIGZpbmFsbHkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKHIgJiYgIXIuZG9uZSAmJiAobSA9IGlbXCJyZXR1cm5cIl0pKSBtLmNhbGwoaSk7XG4gICAgICAgIH1cbiAgICAgICAgZmluYWxseSB7IGlmIChlKSB0aHJvdyBlLmVycm9yOyB9XG4gICAgfVxuICAgIHJldHVybiBhcjtcbn07XG52YXIgX19zcHJlYWRBcnJheSA9ICh0aGlzICYmIHRoaXMuX19zcHJlYWRBcnJheSkgfHwgZnVuY3Rpb24gKHRvLCBmcm9tKSB7XG4gICAgZm9yICh2YXIgaSA9IDAsIGlsID0gZnJvbS5sZW5ndGgsIGogPSB0by5sZW5ndGg7IGkgPCBpbDsgaSsrLCBqKyspXG4gICAgICAgIHRvW2pdID0gZnJvbVtpXTtcbiAgICByZXR1cm4gdG87XG59O1xudmFyIF9faW1wb3J0RGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnREZWZhdWx0KSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBcImRlZmF1bHRcIjogbW9kIH07XG59O1xuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbnZhciBjbG9uZV9kZWVwXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcImNsb25lLWRlZXBcIikpO1xudmFyIG1lcmdlX3dpdGhfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi9tZXJnZS13aXRoXCIpKTtcbnZhciB1dGlsc18xID0gcmVxdWlyZShcIi4vdXRpbHNcIik7XG52YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXk7XG5mdW5jdGlvbiBqb2luQXJyYXlzKF9hKSB7XG4gICAgdmFyIF9iID0gX2EgPT09IHZvaWQgMCA/IHt9IDogX2EsIGN1c3RvbWl6ZUFycmF5ID0gX2IuY3VzdG9taXplQXJyYXksIGN1c3RvbWl6ZU9iamVjdCA9IF9iLmN1c3RvbWl6ZU9iamVjdCwga2V5ID0gX2Iua2V5O1xuICAgIHJldHVybiBmdW5jdGlvbiBfam9pbkFycmF5cyhhLCBiLCBrKSB7XG4gICAgICAgIHZhciBuZXdLZXkgPSBrZXkgPyBrZXkgKyBcIi5cIiArIGsgOiBrO1xuICAgICAgICBpZiAodXRpbHNfMS5pc0Z1bmN0aW9uKGEpICYmIHV0aWxzXzEuaXNGdW5jdGlvbihiKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgYXJncyA9IFtdO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGFyZ3NbX2ldID0gYXJndW1lbnRzW19pXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9qb2luQXJyYXlzKGEuYXBwbHkodm9pZCAwLCBfX3NwcmVhZEFycmF5KFtdLCBfX3JlYWQoYXJncykpKSwgYi5hcHBseSh2b2lkIDAsIF9fc3ByZWFkQXJyYXkoW10sIF9fcmVhZChhcmdzKSkpLCBrKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzQXJyYXkoYSkgJiYgaXNBcnJheShiKSkge1xuICAgICAgICAgICAgdmFyIGN1c3RvbVJlc3VsdCA9IGN1c3RvbWl6ZUFycmF5ICYmIGN1c3RvbWl6ZUFycmF5KGEsIGIsIG5ld0tleSk7XG4gICAgICAgICAgICByZXR1cm4gY3VzdG9tUmVzdWx0IHx8IF9fc3ByZWFkQXJyYXkoX19zcHJlYWRBcnJheShbXSwgX19yZWFkKGEpKSwgX19yZWFkKGIpKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodXRpbHNfMS5pc1JlZ2V4KGIpKSB7XG4gICAgICAgICAgICByZXR1cm4gYjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodXRpbHNfMS5pc1BsYWluT2JqZWN0KGEpICYmIHV0aWxzXzEuaXNQbGFpbk9iamVjdChiKSkge1xuICAgICAgICAgICAgdmFyIGN1c3RvbVJlc3VsdCA9IGN1c3RvbWl6ZU9iamVjdCAmJiBjdXN0b21pemVPYmplY3QoYSwgYiwgbmV3S2V5KTtcbiAgICAgICAgICAgIHJldHVybiAoY3VzdG9tUmVzdWx0IHx8XG4gICAgICAgICAgICAgICAgbWVyZ2Vfd2l0aF8xW1wiZGVmYXVsdFwiXShbYSwgYl0sIGpvaW5BcnJheXMoe1xuICAgICAgICAgICAgICAgICAgICBjdXN0b21pemVBcnJheTogY3VzdG9taXplQXJyYXksXG4gICAgICAgICAgICAgICAgICAgIGN1c3RvbWl6ZU9iamVjdDogY3VzdG9taXplT2JqZWN0LFxuICAgICAgICAgICAgICAgICAgICBrZXk6IG5ld0tleVxuICAgICAgICAgICAgICAgIH0pKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHV0aWxzXzEuaXNQbGFpbk9iamVjdChiKSkge1xuICAgICAgICAgICAgcmV0dXJuIGNsb25lX2RlZXBfMVtcImRlZmF1bHRcIl0oYik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzQXJyYXkoYikpIHtcbiAgICAgICAgICAgIHJldHVybiBfX3NwcmVhZEFycmF5KFtdLCBfX3JlYWQoYikpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBiO1xuICAgIH07XG59XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IGpvaW5BcnJheXM7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1qb2luLWFycmF5cy5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX3JlYWQgPSAodGhpcyAmJiB0aGlzLl9fcmVhZCkgfHwgZnVuY3Rpb24gKG8sIG4pIHtcbiAgICB2YXIgbSA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvW1N5bWJvbC5pdGVyYXRvcl07XG4gICAgaWYgKCFtKSByZXR1cm4gbztcbiAgICB2YXIgaSA9IG0uY2FsbChvKSwgciwgYXIgPSBbXSwgZTtcbiAgICB0cnkge1xuICAgICAgICB3aGlsZSAoKG4gPT09IHZvaWQgMCB8fCBuLS0gPiAwKSAmJiAhKHIgPSBpLm5leHQoKSkuZG9uZSkgYXIucHVzaChyLnZhbHVlKTtcbiAgICB9XG4gICAgY2F0Y2ggKGVycm9yKSB7IGUgPSB7IGVycm9yOiBlcnJvciB9OyB9XG4gICAgZmluYWxseSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAociAmJiAhci5kb25lICYmIChtID0gaVtcInJldHVyblwiXSkpIG0uY2FsbChpKTtcbiAgICAgICAgfVxuICAgICAgICBmaW5hbGx5IHsgaWYgKGUpIHRocm93IGUuZXJyb3I7IH1cbiAgICB9XG4gICAgcmV0dXJuIGFyO1xufTtcbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5mdW5jdGlvbiBtZXJnZVdpdGgob2JqZWN0cywgY3VzdG9taXplcikge1xuICAgIHZhciBfYSA9IF9fcmVhZChvYmplY3RzKSwgZmlyc3QgPSBfYVswXSwgcmVzdCA9IF9hLnNsaWNlKDEpO1xuICAgIHZhciByZXQgPSBmaXJzdDtcbiAgICByZXN0LmZvckVhY2goZnVuY3Rpb24gKGEpIHtcbiAgICAgICAgcmV0ID0gbWVyZ2VUbyhyZXQsIGEsIGN1c3RvbWl6ZXIpO1xuICAgIH0pO1xuICAgIHJldHVybiByZXQ7XG59XG5mdW5jdGlvbiBtZXJnZVRvKGEsIGIsIGN1c3RvbWl6ZXIpIHtcbiAgICB2YXIgcmV0ID0ge307XG4gICAgT2JqZWN0LmtleXMoYSlcbiAgICAgICAgLmNvbmNhdChPYmplY3Qua2V5cyhiKSlcbiAgICAgICAgLmZvckVhY2goZnVuY3Rpb24gKGspIHtcbiAgICAgICAgdmFyIHYgPSBjdXN0b21pemVyKGFba10sIGJba10sIGspO1xuICAgICAgICByZXRba10gPSB0eXBlb2YgdiA9PT0gXCJ1bmRlZmluZWRcIiA/IGFba10gOiB2O1xuICAgIH0pO1xuICAgIHJldHVybiByZXQ7XG59XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IG1lcmdlV2l0aDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1lcmdlLXdpdGguanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuZXhwb3J0cy5DdXN0b21pemVSdWxlID0gdm9pZCAwO1xudmFyIEN1c3RvbWl6ZVJ1bGU7XG4oZnVuY3Rpb24gKEN1c3RvbWl6ZVJ1bGUpIHtcbiAgICBDdXN0b21pemVSdWxlW1wiTWF0Y2hcIl0gPSBcIm1hdGNoXCI7XG4gICAgQ3VzdG9taXplUnVsZVtcIk1lcmdlXCJdID0gXCJtZXJnZVwiO1xuICAgIEN1c3RvbWl6ZVJ1bGVbXCJBcHBlbmRcIl0gPSBcImFwcGVuZFwiO1xuICAgIEN1c3RvbWl6ZVJ1bGVbXCJQcmVwZW5kXCJdID0gXCJwcmVwZW5kXCI7XG4gICAgQ3VzdG9taXplUnVsZVtcIlJlcGxhY2VcIl0gPSBcInJlcGxhY2VcIjtcbn0pKEN1c3RvbWl6ZVJ1bGUgPSBleHBvcnRzLkN1c3RvbWl6ZVJ1bGUgfHwgKGV4cG9ydHMuQ3VzdG9taXplUnVsZSA9IHt9KSk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD10eXBlcy5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX3JlYWQgPSAodGhpcyAmJiB0aGlzLl9fcmVhZCkgfHwgZnVuY3Rpb24gKG8sIG4pIHtcbiAgICB2YXIgbSA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvW1N5bWJvbC5pdGVyYXRvcl07XG4gICAgaWYgKCFtKSByZXR1cm4gbztcbiAgICB2YXIgaSA9IG0uY2FsbChvKSwgciwgYXIgPSBbXSwgZTtcbiAgICB0cnkge1xuICAgICAgICB3aGlsZSAoKG4gPT09IHZvaWQgMCB8fCBuLS0gPiAwKSAmJiAhKHIgPSBpLm5leHQoKSkuZG9uZSkgYXIucHVzaChyLnZhbHVlKTtcbiAgICB9XG4gICAgY2F0Y2ggKGVycm9yKSB7IGUgPSB7IGVycm9yOiBlcnJvciB9OyB9XG4gICAgZmluYWxseSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAociAmJiAhci5kb25lICYmIChtID0gaVtcInJldHVyblwiXSkpIG0uY2FsbChpKTtcbiAgICAgICAgfVxuICAgICAgICBmaW5hbGx5IHsgaWYgKGUpIHRocm93IGUuZXJyb3I7IH1cbiAgICB9XG4gICAgcmV0dXJuIGFyO1xufTtcbnZhciBfX3NwcmVhZEFycmF5ID0gKHRoaXMgJiYgdGhpcy5fX3NwcmVhZEFycmF5KSB8fCBmdW5jdGlvbiAodG8sIGZyb20pIHtcbiAgICBmb3IgKHZhciBpID0gMCwgaWwgPSBmcm9tLmxlbmd0aCwgaiA9IHRvLmxlbmd0aDsgaSA8IGlsOyBpKyssIGorKylcbiAgICAgICAgdG9bal0gPSBmcm9tW2ldO1xuICAgIHJldHVybiB0bztcbn07XG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuZnVuY3Rpb24gbWVyZ2VVbmlxdWUoa2V5LCB1bmlxdWVzLCBnZXR0ZXIpIHtcbiAgICB2YXIgdW5pcXVlc1NldCA9IG5ldyBTZXQodW5pcXVlcyk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChhLCBiLCBrKSB7XG4gICAgICAgIHJldHVybiAoayA9PT0ga2V5KSAmJiBBcnJheS5mcm9tKF9fc3ByZWFkQXJyYXkoX19zcHJlYWRBcnJheShbXSwgX19yZWFkKGEpKSwgX19yZWFkKGIpKS5tYXAoZnVuY3Rpb24gKGl0KSB7IHJldHVybiAoeyBrZXk6IGdldHRlcihpdCksIHZhbHVlOiBpdCB9KTsgfSlcbiAgICAgICAgICAgIC5tYXAoZnVuY3Rpb24gKF9hKSB7XG4gICAgICAgICAgICB2YXIga2V5ID0gX2Eua2V5LCB2YWx1ZSA9IF9hLnZhbHVlO1xuICAgICAgICAgICAgcmV0dXJuICh7IGtleTogKHVuaXF1ZXNTZXQuaGFzKGtleSkgPyBrZXkgOiB2YWx1ZSksIHZhbHVlOiB2YWx1ZSB9KTtcbiAgICAgICAgfSlcbiAgICAgICAgICAgIC5yZWR1Y2UoZnVuY3Rpb24gKG0sIF9hKSB7XG4gICAgICAgICAgICB2YXIga2V5ID0gX2Eua2V5LCB2YWx1ZSA9IF9hLnZhbHVlO1xuICAgICAgICAgICAgbVtcImRlbGV0ZVwiXShrZXkpOyAvLyBUaGlzIGlzIHJlcXVpcmVkIHRvIHByZXNlcnZlIGJhY2t3YXJkIGNvbXBhdGlibGUgb3JkZXIgb2YgZWxlbWVudHMgYWZ0ZXIgYSBtZXJnZS5cbiAgICAgICAgICAgIHJldHVybiBtLnNldChrZXksIHZhbHVlKTtcbiAgICAgICAgfSwgbmV3IE1hcCgpKVxuICAgICAgICAgICAgLnZhbHVlcygpKTtcbiAgICB9O1xufVxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBtZXJnZVVuaXF1ZTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXVuaXF1ZS5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5leHBvcnRzLmlzVW5kZWZpbmVkID0gZXhwb3J0cy5pc1BsYWluT2JqZWN0ID0gZXhwb3J0cy5pc0Z1bmN0aW9uID0gZXhwb3J0cy5pc1JlZ2V4ID0gdm9pZCAwO1xuZnVuY3Rpb24gaXNSZWdleChvKSB7XG4gICAgcmV0dXJuIG8gaW5zdGFuY2VvZiBSZWdFeHA7XG59XG5leHBvcnRzLmlzUmVnZXggPSBpc1JlZ2V4O1xuLy8gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9hLzczNTY1MjgvMjI4ODg1XG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGZ1bmN0aW9uVG9DaGVjaykge1xuICAgIHJldHVybiAoZnVuY3Rpb25Ub0NoZWNrICYmIHt9LnRvU3RyaW5nLmNhbGwoZnVuY3Rpb25Ub0NoZWNrKSA9PT0gXCJbb2JqZWN0IEZ1bmN0aW9uXVwiKTtcbn1cbmV4cG9ydHMuaXNGdW5jdGlvbiA9IGlzRnVuY3Rpb247XG5mdW5jdGlvbiBpc1BsYWluT2JqZWN0KGEpIHtcbiAgICBpZiAoYSA9PT0gbnVsbCB8fCBBcnJheS5pc0FycmF5KGEpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHR5cGVvZiBhID09PSBcIm9iamVjdFwiO1xufVxuZXhwb3J0cy5pc1BsYWluT2JqZWN0ID0gaXNQbGFpbk9iamVjdDtcbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKGEpIHtcbiAgICByZXR1cm4gdHlwZW9mIGEgPT09IFwidW5kZWZpbmVkXCI7XG59XG5leHBvcnRzLmlzVW5kZWZpbmVkID0gaXNVbmRlZmluZWQ7XG4vLyMgc291cmNlTWFwcGluZ1VSTD11dGlscy5qcy5tYXAiLCIvKiBqc2hpbnQgbm9kZTogdHJ1ZSAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUkVHRVhQX1BBUlRTID0gLyhcXCp8XFw/KS9nO1xuXG4vKipcbiAgIyB3aWxkY2FyZFxuXG4gIFZlcnkgc2ltcGxlIHdpbGRjYXJkIG1hdGNoaW5nLCB3aGljaCBpcyBkZXNpZ25lZCB0byBwcm92aWRlIHRoZSBzYW1lXG4gIGZ1bmN0aW9uYWxpdHkgdGhhdCBpcyBmb3VuZCBpbiB0aGVcbiAgW2V2ZV0oaHR0cHM6Ly9naXRodWIuY29tL2Fkb2JlLXdlYnBsYXRmb3JtL2V2ZSkgZXZlbnRpbmcgbGlicmFyeS5cblxuICAjIyBVc2FnZVxuXG4gIEl0IHdvcmtzIHdpdGggc3RyaW5nczpcblxuICA8PDwgZXhhbXBsZXMvc3RyaW5ncy5qc1xuXG4gIEFycmF5czpcblxuICA8PDwgZXhhbXBsZXMvYXJyYXlzLmpzXG5cbiAgT2JqZWN0cyAobWF0Y2hpbmcgYWdhaW5zdCBrZXlzKTpcblxuICA8PDwgZXhhbXBsZXMvb2JqZWN0cy5qc1xuXG4gICMjIEFsdGVybmF0aXZlIEltcGxlbWVudGF0aW9uc1xuXG4gIC0gPGh0dHBzOi8vZ2l0aHViLmNvbS9pc2FhY3Mvbm9kZS1nbG9iPlxuXG4gICAgR3JlYXQgZm9yIGZ1bGwgZmlsZS1iYXNlZCB3aWxkY2FyZCBtYXRjaGluZy5cblxuICAtIDxodHRwczovL2dpdGh1Yi5jb20vc2luZHJlc29yaHVzL21hdGNoZXI+XG5cbiAgICAgQSB3ZWxsIGNhcmVkIGZvciBhbmQgbG92ZWQgSlMgd2lsZGNhcmQgbWF0Y2hlci5cbioqL1xuXG5mdW5jdGlvbiBXaWxkY2FyZE1hdGNoZXIodGV4dCwgc2VwYXJhdG9yKSB7XG4gIHRoaXMudGV4dCA9IHRleHQgPSB0ZXh0IHx8ICcnO1xuICB0aGlzLmhhc1dpbGQgPSB0ZXh0LmluZGV4T2YoJyonKSA+PSAwO1xuICB0aGlzLnNlcGFyYXRvciA9IHNlcGFyYXRvcjtcbiAgdGhpcy5wYXJ0cyA9IHRleHQuc3BsaXQoc2VwYXJhdG9yKS5tYXAodGhpcy5jbGFzc2lmeVBhcnQuYmluZCh0aGlzKSk7XG59XG5cbldpbGRjYXJkTWF0Y2hlci5wcm90b3R5cGUubWF0Y2ggPSBmdW5jdGlvbihpbnB1dCkge1xuICB2YXIgbWF0Y2hlcyA9IHRydWU7XG4gIHZhciBwYXJ0cyA9IHRoaXMucGFydHM7XG4gIHZhciBpaTtcbiAgdmFyIHBhcnRzQ291bnQgPSBwYXJ0cy5sZW5ndGg7XG4gIHZhciB0ZXN0UGFydHM7XG5cbiAgaWYgKHR5cGVvZiBpbnB1dCA9PSAnc3RyaW5nJyB8fCBpbnB1dCBpbnN0YW5jZW9mIFN0cmluZykge1xuICAgIGlmICghdGhpcy5oYXNXaWxkICYmIHRoaXMudGV4dCAhPSBpbnB1dCkge1xuICAgICAgbWF0Y2hlcyA9IGZhbHNlO1xuICAgIH0gZWxzZSB7XG4gICAgICB0ZXN0UGFydHMgPSAoaW5wdXQgfHwgJycpLnNwbGl0KHRoaXMuc2VwYXJhdG9yKTtcbiAgICAgIGZvciAoaWkgPSAwOyBtYXRjaGVzICYmIGlpIDwgcGFydHNDb3VudDsgaWkrKykge1xuICAgICAgICBpZiAocGFydHNbaWldID09PSAnKicpICB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH0gZWxzZSBpZiAoaWkgPCB0ZXN0UGFydHMubGVuZ3RoKSB7XG4gICAgICAgICAgbWF0Y2hlcyA9IHBhcnRzW2lpXSBpbnN0YW5jZW9mIFJlZ0V4cFxuICAgICAgICAgICAgPyBwYXJ0c1tpaV0udGVzdCh0ZXN0UGFydHNbaWldKVxuICAgICAgICAgICAgOiBwYXJ0c1tpaV0gPT09IHRlc3RQYXJ0c1tpaV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbWF0Y2hlcyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIElmIG1hdGNoZXMsIHRoZW4gcmV0dXJuIHRoZSBjb21wb25lbnQgcGFydHNcbiAgICAgIG1hdGNoZXMgPSBtYXRjaGVzICYmIHRlc3RQYXJ0cztcbiAgICB9XG4gIH1cbiAgZWxzZSBpZiAodHlwZW9mIGlucHV0LnNwbGljZSA9PSAnZnVuY3Rpb24nKSB7XG4gICAgbWF0Y2hlcyA9IFtdO1xuXG4gICAgZm9yIChpaSA9IGlucHV0Lmxlbmd0aDsgaWktLTsgKSB7XG4gICAgICBpZiAodGhpcy5tYXRjaChpbnB1dFtpaV0pKSB7XG4gICAgICAgIG1hdGNoZXNbbWF0Y2hlcy5sZW5ndGhdID0gaW5wdXRbaWldO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBlbHNlIGlmICh0eXBlb2YgaW5wdXQgPT0gJ29iamVjdCcpIHtcbiAgICBtYXRjaGVzID0ge307XG5cbiAgICBmb3IgKHZhciBrZXkgaW4gaW5wdXQpIHtcbiAgICAgIGlmICh0aGlzLm1hdGNoKGtleSkpIHtcbiAgICAgICAgbWF0Y2hlc1trZXldID0gaW5wdXRba2V5XTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gbWF0Y2hlcztcbn07XG5cbldpbGRjYXJkTWF0Y2hlci5wcm90b3R5cGUuY2xhc3NpZnlQYXJ0ID0gZnVuY3Rpb24ocGFydCkge1xuICAvLyBpbiB0aGUgZXZlbnQgdGhhdCB3ZSBoYXZlIGJlZW4gcHJvdmlkZWQgYSBwYXJ0IHRoYXQgaXMgbm90IGp1c3QgYSB3aWxkY2FyZFxuICAvLyB0aGVuIHR1cm4gdGhpcyBpbnRvIGEgcmVndWxhciBleHByZXNzaW9uIGZvciBtYXRjaGluZyBwdXJwb3Nlc1xuICBpZiAocGFydCA9PT0gJyonKSB7XG4gICAgcmV0dXJuIHBhcnQ7XG4gIH0gZWxzZSBpZiAocGFydC5pbmRleE9mKCcqJykgPj0gMCB8fCBwYXJ0LmluZGV4T2YoJz8nKSA+PSAwKSB7XG4gICAgcmV0dXJuIG5ldyBSZWdFeHAocGFydC5yZXBsYWNlKFJFR0VYUF9QQVJUUywgJ1xcLiQxJykpO1xuICB9XG5cbiAgcmV0dXJuIHBhcnQ7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHRleHQsIHRlc3QsIHNlcGFyYXRvcikge1xuICB2YXIgbWF0Y2hlciA9IG5ldyBXaWxkY2FyZE1hdGNoZXIodGV4dCwgc2VwYXJhdG9yIHx8IC9bXFwvXFwuXS8pO1xuICBpZiAodHlwZW9mIHRlc3QgIT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm4gbWF0Y2hlci5tYXRjaCh0ZXN0KTtcbiAgfVxuXG4gIHJldHVybiBtYXRjaGVyO1xufTtcbiIsImltcG9ydCBEZWxhdW5hdG9yIGZyb20gXCJkZWxhdW5hdG9yXCI7XG5pbXBvcnQgUGF0aCBmcm9tIFwiLi9wYXRoLmpzXCI7XG5pbXBvcnQgUG9seWdvbiBmcm9tIFwiLi9wb2x5Z29uLmpzXCI7XG5pbXBvcnQgVm9yb25vaSBmcm9tIFwiLi92b3Jvbm9pLmpzXCI7XG5cbmNvbnN0IHRhdSA9IDIgKiBNYXRoLlBJLCBwb3cgPSBNYXRoLnBvdztcblxuZnVuY3Rpb24gcG9pbnRYKHApIHtcbiAgcmV0dXJuIHBbMF07XG59XG5cbmZ1bmN0aW9uIHBvaW50WShwKSB7XG4gIHJldHVybiBwWzFdO1xufVxuXG4vLyBBIHRyaWFuZ3VsYXRpb24gaXMgY29sbGluZWFyIGlmIGFsbCBpdHMgdHJpYW5nbGVzIGhhdmUgYSBub24tbnVsbCBhcmVhXG5mdW5jdGlvbiBjb2xsaW5lYXIoZCkge1xuICBjb25zdCB7dHJpYW5nbGVzLCBjb29yZHN9ID0gZDtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCB0cmlhbmdsZXMubGVuZ3RoOyBpICs9IDMpIHtcbiAgICBjb25zdCBhID0gMiAqIHRyaWFuZ2xlc1tpXSxcbiAgICAgICAgICBiID0gMiAqIHRyaWFuZ2xlc1tpICsgMV0sXG4gICAgICAgICAgYyA9IDIgKiB0cmlhbmdsZXNbaSArIDJdLFxuICAgICAgICAgIGNyb3NzID0gKGNvb3Jkc1tjXSAtIGNvb3Jkc1thXSkgKiAoY29vcmRzW2IgKyAxXSAtIGNvb3Jkc1thICsgMV0pXG4gICAgICAgICAgICAgICAgLSAoY29vcmRzW2JdIC0gY29vcmRzW2FdKSAqIChjb29yZHNbYyArIDFdIC0gY29vcmRzW2EgKyAxXSk7XG4gICAgaWYgKGNyb3NzID4gMWUtMTApIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gaml0dGVyKHgsIHksIHIpIHtcbiAgcmV0dXJuIFt4ICsgTWF0aC5zaW4oeCArIHkpICogciwgeSArIE1hdGguY29zKHggLSB5KSAqIHJdO1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEZWxhdW5heSB7XG4gIHN0YXRpYyBmcm9tKHBvaW50cywgZnggPSBwb2ludFgsIGZ5ID0gcG9pbnRZLCB0aGF0KSB7XG4gICAgcmV0dXJuIG5ldyBEZWxhdW5heShcImxlbmd0aFwiIGluIHBvaW50c1xuICAgICAgICA/IGZsYXRBcnJheShwb2ludHMsIGZ4LCBmeSwgdGhhdClcbiAgICAgICAgOiBGbG9hdDY0QXJyYXkuZnJvbShmbGF0SXRlcmFibGUocG9pbnRzLCBmeCwgZnksIHRoYXQpKSk7XG4gIH1cbiAgY29uc3RydWN0b3IocG9pbnRzKSB7XG4gICAgdGhpcy5fZGVsYXVuYXRvciA9IG5ldyBEZWxhdW5hdG9yKHBvaW50cyk7XG4gICAgdGhpcy5pbmVkZ2VzID0gbmV3IEludDMyQXJyYXkocG9pbnRzLmxlbmd0aCAvIDIpO1xuICAgIHRoaXMuX2h1bGxJbmRleCA9IG5ldyBJbnQzMkFycmF5KHBvaW50cy5sZW5ndGggLyAyKTtcbiAgICB0aGlzLnBvaW50cyA9IHRoaXMuX2RlbGF1bmF0b3IuY29vcmRzO1xuICAgIHRoaXMuX2luaXQoKTtcbiAgfVxuICB1cGRhdGUoKSB7XG4gICAgdGhpcy5fZGVsYXVuYXRvci51cGRhdGUoKTtcbiAgICB0aGlzLl9pbml0KCk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgX2luaXQoKSB7XG4gICAgY29uc3QgZCA9IHRoaXMuX2RlbGF1bmF0b3IsIHBvaW50cyA9IHRoaXMucG9pbnRzO1xuXG4gICAgLy8gY2hlY2sgZm9yIGNvbGxpbmVhclxuICAgIGlmIChkLmh1bGwgJiYgZC5odWxsLmxlbmd0aCA+IDIgJiYgY29sbGluZWFyKGQpKSB7XG4gICAgICB0aGlzLmNvbGxpbmVhciA9IEludDMyQXJyYXkuZnJvbSh7bGVuZ3RoOiBwb2ludHMubGVuZ3RoLzJ9LCAoXyxpKSA9PiBpKVxuICAgICAgICAuc29ydCgoaSwgaikgPT4gcG9pbnRzWzIgKiBpXSAtIHBvaW50c1syICogal0gfHwgcG9pbnRzWzIgKiBpICsgMV0gLSBwb2ludHNbMiAqIGogKyAxXSk7IC8vIGZvciBleGFjdCBuZWlnaGJvcnNcbiAgICAgIGNvbnN0IGUgPSB0aGlzLmNvbGxpbmVhclswXSwgZiA9IHRoaXMuY29sbGluZWFyW3RoaXMuY29sbGluZWFyLmxlbmd0aCAtIDFdLFxuICAgICAgICBib3VuZHMgPSBbIHBvaW50c1syICogZV0sIHBvaW50c1syICogZSArIDFdLCBwb2ludHNbMiAqIGZdLCBwb2ludHNbMiAqIGYgKyAxXSBdLFxuICAgICAgICByID0gMWUtOCAqIE1hdGguaHlwb3QoYm91bmRzWzNdIC0gYm91bmRzWzFdLCBib3VuZHNbMl0gLSBib3VuZHNbMF0pO1xuICAgICAgZm9yIChsZXQgaSA9IDAsIG4gPSBwb2ludHMubGVuZ3RoIC8gMjsgaSA8IG47ICsraSkge1xuICAgICAgICBjb25zdCBwID0gaml0dGVyKHBvaW50c1syICogaV0sIHBvaW50c1syICogaSArIDFdLCByKTtcbiAgICAgICAgcG9pbnRzWzIgKiBpXSA9IHBbMF07XG4gICAgICAgIHBvaW50c1syICogaSArIDFdID0gcFsxXTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2RlbGF1bmF0b3IgPSBuZXcgRGVsYXVuYXRvcihwb2ludHMpO1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWxldGUgdGhpcy5jb2xsaW5lYXI7XG4gICAgfVxuXG4gICAgY29uc3QgaGFsZmVkZ2VzID0gdGhpcy5oYWxmZWRnZXMgPSB0aGlzLl9kZWxhdW5hdG9yLmhhbGZlZGdlcztcbiAgICBjb25zdCBodWxsID0gdGhpcy5odWxsID0gdGhpcy5fZGVsYXVuYXRvci5odWxsO1xuICAgIGNvbnN0IHRyaWFuZ2xlcyA9IHRoaXMudHJpYW5nbGVzID0gdGhpcy5fZGVsYXVuYXRvci50cmlhbmdsZXM7XG4gICAgY29uc3QgaW5lZGdlcyA9IHRoaXMuaW5lZGdlcy5maWxsKC0xKTtcbiAgICBjb25zdCBodWxsSW5kZXggPSB0aGlzLl9odWxsSW5kZXguZmlsbCgtMSk7XG5cbiAgICAvLyBDb21wdXRlIGFuIGluZGV4IGZyb20gZWFjaCBwb2ludCB0byBhbiAoYXJiaXRyYXJ5KSBpbmNvbWluZyBoYWxmZWRnZVxuICAgIC8vIFVzZWQgdG8gZ2l2ZSB0aGUgZmlyc3QgbmVpZ2hib3Igb2YgZWFjaCBwb2ludDsgZm9yIHRoaXMgcmVhc29uLFxuICAgIC8vIG9uIHRoZSBodWxsIHdlIGdpdmUgcHJpb3JpdHkgdG8gZXh0ZXJpb3IgaGFsZmVkZ2VzXG4gICAgZm9yIChsZXQgZSA9IDAsIG4gPSBoYWxmZWRnZXMubGVuZ3RoOyBlIDwgbjsgKytlKSB7XG4gICAgICBjb25zdCBwID0gdHJpYW5nbGVzW2UgJSAzID09PSAyID8gZSAtIDIgOiBlICsgMV07XG4gICAgICBpZiAoaGFsZmVkZ2VzW2VdID09PSAtMSB8fCBpbmVkZ2VzW3BdID09PSAtMSkgaW5lZGdlc1twXSA9IGU7XG4gICAgfVxuICAgIGZvciAobGV0IGkgPSAwLCBuID0gaHVsbC5sZW5ndGg7IGkgPCBuOyArK2kpIHtcbiAgICAgIGh1bGxJbmRleFtodWxsW2ldXSA9IGk7XG4gICAgfVxuXG4gICAgLy8gZGVnZW5lcmF0ZSBjYXNlOiAxIG9yIDIgKGRpc3RpbmN0KSBwb2ludHNcbiAgICBpZiAoaHVsbC5sZW5ndGggPD0gMiAmJiBodWxsLmxlbmd0aCA+IDApIHtcbiAgICAgIHRoaXMudHJpYW5nbGVzID0gbmV3IEludDMyQXJyYXkoMykuZmlsbCgtMSk7XG4gICAgICB0aGlzLmhhbGZlZGdlcyA9IG5ldyBJbnQzMkFycmF5KDMpLmZpbGwoLTEpO1xuICAgICAgdGhpcy50cmlhbmdsZXNbMF0gPSBodWxsWzBdO1xuICAgICAgaW5lZGdlc1todWxsWzBdXSA9IDE7XG4gICAgICBpZiAoaHVsbC5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgaW5lZGdlc1todWxsWzFdXSA9IDA7XG4gICAgICAgIHRoaXMudHJpYW5nbGVzWzFdID0gaHVsbFsxXTtcbiAgICAgICAgdGhpcy50cmlhbmdsZXNbMl0gPSBodWxsWzFdO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICB2b3Jvbm9pKGJvdW5kcykge1xuICAgIHJldHVybiBuZXcgVm9yb25vaSh0aGlzLCBib3VuZHMpO1xuICB9XG4gICpuZWlnaGJvcnMoaSkge1xuICAgIGNvbnN0IHtpbmVkZ2VzLCBodWxsLCBfaHVsbEluZGV4LCBoYWxmZWRnZXMsIHRyaWFuZ2xlcywgY29sbGluZWFyfSA9IHRoaXM7XG5cbiAgICAvLyBkZWdlbmVyYXRlIGNhc2Ugd2l0aCBzZXZlcmFsIGNvbGxpbmVhciBwb2ludHNcbiAgICBpZiAoY29sbGluZWFyKSB7XG4gICAgICBjb25zdCBsID0gY29sbGluZWFyLmluZGV4T2YoaSk7XG4gICAgICBpZiAobCA+IDApIHlpZWxkIGNvbGxpbmVhcltsIC0gMV07XG4gICAgICBpZiAobCA8IGNvbGxpbmVhci5sZW5ndGggLSAxKSB5aWVsZCBjb2xsaW5lYXJbbCArIDFdO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGUwID0gaW5lZGdlc1tpXTtcbiAgICBpZiAoZTAgPT09IC0xKSByZXR1cm47IC8vIGNvaW5jaWRlbnQgcG9pbnRcbiAgICBsZXQgZSA9IGUwLCBwMCA9IC0xO1xuICAgIGRvIHtcbiAgICAgIHlpZWxkIHAwID0gdHJpYW5nbGVzW2VdO1xuICAgICAgZSA9IGUgJSAzID09PSAyID8gZSAtIDIgOiBlICsgMTtcbiAgICAgIGlmICh0cmlhbmdsZXNbZV0gIT09IGkpIHJldHVybjsgLy8gYmFkIHRyaWFuZ3VsYXRpb25cbiAgICAgIGUgPSBoYWxmZWRnZXNbZV07XG4gICAgICBpZiAoZSA9PT0gLTEpIHtcbiAgICAgICAgY29uc3QgcCA9IGh1bGxbKF9odWxsSW5kZXhbaV0gKyAxKSAlIGh1bGwubGVuZ3RoXTtcbiAgICAgICAgaWYgKHAgIT09IHAwKSB5aWVsZCBwO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfSB3aGlsZSAoZSAhPT0gZTApO1xuICB9XG4gIGZpbmQoeCwgeSwgaSA9IDApIHtcbiAgICBpZiAoKHggPSAreCwgeCAhPT0geCkgfHwgKHkgPSAreSwgeSAhPT0geSkpIHJldHVybiAtMTtcbiAgICBjb25zdCBpMCA9IGk7XG4gICAgbGV0IGM7XG4gICAgd2hpbGUgKChjID0gdGhpcy5fc3RlcChpLCB4LCB5KSkgPj0gMCAmJiBjICE9PSBpICYmIGMgIT09IGkwKSBpID0gYztcbiAgICByZXR1cm4gYztcbiAgfVxuICBfc3RlcChpLCB4LCB5KSB7XG4gICAgY29uc3Qge2luZWRnZXMsIGh1bGwsIF9odWxsSW5kZXgsIGhhbGZlZGdlcywgdHJpYW5nbGVzLCBwb2ludHN9ID0gdGhpcztcbiAgICBpZiAoaW5lZGdlc1tpXSA9PT0gLTEgfHwgIXBvaW50cy5sZW5ndGgpIHJldHVybiAoaSArIDEpICUgKHBvaW50cy5sZW5ndGggPj4gMSk7XG4gICAgbGV0IGMgPSBpO1xuICAgIGxldCBkYyA9IHBvdyh4IC0gcG9pbnRzW2kgKiAyXSwgMikgKyBwb3coeSAtIHBvaW50c1tpICogMiArIDFdLCAyKTtcbiAgICBjb25zdCBlMCA9IGluZWRnZXNbaV07XG4gICAgbGV0IGUgPSBlMDtcbiAgICBkbyB7XG4gICAgICBsZXQgdCA9IHRyaWFuZ2xlc1tlXTtcbiAgICAgIGNvbnN0IGR0ID0gcG93KHggLSBwb2ludHNbdCAqIDJdLCAyKSArIHBvdyh5IC0gcG9pbnRzW3QgKiAyICsgMV0sIDIpO1xuICAgICAgaWYgKGR0IDwgZGMpIGRjID0gZHQsIGMgPSB0O1xuICAgICAgZSA9IGUgJSAzID09PSAyID8gZSAtIDIgOiBlICsgMTtcbiAgICAgIGlmICh0cmlhbmdsZXNbZV0gIT09IGkpIGJyZWFrOyAvLyBiYWQgdHJpYW5ndWxhdGlvblxuICAgICAgZSA9IGhhbGZlZGdlc1tlXTtcbiAgICAgIGlmIChlID09PSAtMSkge1xuICAgICAgICBlID0gaHVsbFsoX2h1bGxJbmRleFtpXSArIDEpICUgaHVsbC5sZW5ndGhdO1xuICAgICAgICBpZiAoZSAhPT0gdCkge1xuICAgICAgICAgIGlmIChwb3coeCAtIHBvaW50c1tlICogMl0sIDIpICsgcG93KHkgLSBwb2ludHNbZSAqIDIgKyAxXSwgMikgPCBkYykgcmV0dXJuIGU7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfSB3aGlsZSAoZSAhPT0gZTApO1xuICAgIHJldHVybiBjO1xuICB9XG4gIHJlbmRlcihjb250ZXh0KSB7XG4gICAgY29uc3QgYnVmZmVyID0gY29udGV4dCA9PSBudWxsID8gY29udGV4dCA9IG5ldyBQYXRoIDogdW5kZWZpbmVkO1xuICAgIGNvbnN0IHtwb2ludHMsIGhhbGZlZGdlcywgdHJpYW5nbGVzfSA9IHRoaXM7XG4gICAgZm9yIChsZXQgaSA9IDAsIG4gPSBoYWxmZWRnZXMubGVuZ3RoOyBpIDwgbjsgKytpKSB7XG4gICAgICBjb25zdCBqID0gaGFsZmVkZ2VzW2ldO1xuICAgICAgaWYgKGogPCBpKSBjb250aW51ZTtcbiAgICAgIGNvbnN0IHRpID0gdHJpYW5nbGVzW2ldICogMjtcbiAgICAgIGNvbnN0IHRqID0gdHJpYW5nbGVzW2pdICogMjtcbiAgICAgIGNvbnRleHQubW92ZVRvKHBvaW50c1t0aV0sIHBvaW50c1t0aSArIDFdKTtcbiAgICAgIGNvbnRleHQubGluZVRvKHBvaW50c1t0al0sIHBvaW50c1t0aiArIDFdKTtcbiAgICB9XG4gICAgdGhpcy5yZW5kZXJIdWxsKGNvbnRleHQpO1xuICAgIHJldHVybiBidWZmZXIgJiYgYnVmZmVyLnZhbHVlKCk7XG4gIH1cbiAgcmVuZGVyUG9pbnRzKGNvbnRleHQsIHIpIHtcbiAgICBpZiAociA9PT0gdW5kZWZpbmVkICYmICghY29udGV4dCB8fCB0eXBlb2YgY29udGV4dC5tb3ZlVG8gIT09IFwiZnVuY3Rpb25cIikpIHIgPSBjb250ZXh0LCBjb250ZXh0ID0gbnVsbDtcbiAgICByID0gciA9PSB1bmRlZmluZWQgPyAyIDogK3I7XG4gICAgY29uc3QgYnVmZmVyID0gY29udGV4dCA9PSBudWxsID8gY29udGV4dCA9IG5ldyBQYXRoIDogdW5kZWZpbmVkO1xuICAgIGNvbnN0IHtwb2ludHN9ID0gdGhpcztcbiAgICBmb3IgKGxldCBpID0gMCwgbiA9IHBvaW50cy5sZW5ndGg7IGkgPCBuOyBpICs9IDIpIHtcbiAgICAgIGNvbnN0IHggPSBwb2ludHNbaV0sIHkgPSBwb2ludHNbaSArIDFdO1xuICAgICAgY29udGV4dC5tb3ZlVG8oeCArIHIsIHkpO1xuICAgICAgY29udGV4dC5hcmMoeCwgeSwgciwgMCwgdGF1KTtcbiAgICB9XG4gICAgcmV0dXJuIGJ1ZmZlciAmJiBidWZmZXIudmFsdWUoKTtcbiAgfVxuICByZW5kZXJIdWxsKGNvbnRleHQpIHtcbiAgICBjb25zdCBidWZmZXIgPSBjb250ZXh0ID09IG51bGwgPyBjb250ZXh0ID0gbmV3IFBhdGggOiB1bmRlZmluZWQ7XG4gICAgY29uc3Qge2h1bGwsIHBvaW50c30gPSB0aGlzO1xuICAgIGNvbnN0IGggPSBodWxsWzBdICogMiwgbiA9IGh1bGwubGVuZ3RoO1xuICAgIGNvbnRleHQubW92ZVRvKHBvaW50c1toXSwgcG9pbnRzW2ggKyAxXSk7XG4gICAgZm9yIChsZXQgaSA9IDE7IGkgPCBuOyArK2kpIHtcbiAgICAgIGNvbnN0IGggPSAyICogaHVsbFtpXTtcbiAgICAgIGNvbnRleHQubGluZVRvKHBvaW50c1toXSwgcG9pbnRzW2ggKyAxXSk7XG4gICAgfVxuICAgIGNvbnRleHQuY2xvc2VQYXRoKCk7XG4gICAgcmV0dXJuIGJ1ZmZlciAmJiBidWZmZXIudmFsdWUoKTtcbiAgfVxuICBodWxsUG9seWdvbigpIHtcbiAgICBjb25zdCBwb2x5Z29uID0gbmV3IFBvbHlnb247XG4gICAgdGhpcy5yZW5kZXJIdWxsKHBvbHlnb24pO1xuICAgIHJldHVybiBwb2x5Z29uLnZhbHVlKCk7XG4gIH1cbiAgcmVuZGVyVHJpYW5nbGUoaSwgY29udGV4dCkge1xuICAgIGNvbnN0IGJ1ZmZlciA9IGNvbnRleHQgPT0gbnVsbCA/IGNvbnRleHQgPSBuZXcgUGF0aCA6IHVuZGVmaW5lZDtcbiAgICBjb25zdCB7cG9pbnRzLCB0cmlhbmdsZXN9ID0gdGhpcztcbiAgICBjb25zdCB0MCA9IHRyaWFuZ2xlc1tpICo9IDNdICogMjtcbiAgICBjb25zdCB0MSA9IHRyaWFuZ2xlc1tpICsgMV0gKiAyO1xuICAgIGNvbnN0IHQyID0gdHJpYW5nbGVzW2kgKyAyXSAqIDI7XG4gICAgY29udGV4dC5tb3ZlVG8ocG9pbnRzW3QwXSwgcG9pbnRzW3QwICsgMV0pO1xuICAgIGNvbnRleHQubGluZVRvKHBvaW50c1t0MV0sIHBvaW50c1t0MSArIDFdKTtcbiAgICBjb250ZXh0LmxpbmVUbyhwb2ludHNbdDJdLCBwb2ludHNbdDIgKyAxXSk7XG4gICAgY29udGV4dC5jbG9zZVBhdGgoKTtcbiAgICByZXR1cm4gYnVmZmVyICYmIGJ1ZmZlci52YWx1ZSgpO1xuICB9XG4gICp0cmlhbmdsZVBvbHlnb25zKCkge1xuICAgIGNvbnN0IHt0cmlhbmdsZXN9ID0gdGhpcztcbiAgICBmb3IgKGxldCBpID0gMCwgbiA9IHRyaWFuZ2xlcy5sZW5ndGggLyAzOyBpIDwgbjsgKytpKSB7XG4gICAgICB5aWVsZCB0aGlzLnRyaWFuZ2xlUG9seWdvbihpKTtcbiAgICB9XG4gIH1cbiAgdHJpYW5nbGVQb2x5Z29uKGkpIHtcbiAgICBjb25zdCBwb2x5Z29uID0gbmV3IFBvbHlnb247XG4gICAgdGhpcy5yZW5kZXJUcmlhbmdsZShpLCBwb2x5Z29uKTtcbiAgICByZXR1cm4gcG9seWdvbi52YWx1ZSgpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGZsYXRBcnJheShwb2ludHMsIGZ4LCBmeSwgdGhhdCkge1xuICBjb25zdCBuID0gcG9pbnRzLmxlbmd0aDtcbiAgY29uc3QgYXJyYXkgPSBuZXcgRmxvYXQ2NEFycmF5KG4gKiAyKTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBuOyArK2kpIHtcbiAgICBjb25zdCBwID0gcG9pbnRzW2ldO1xuICAgIGFycmF5W2kgKiAyXSA9IGZ4LmNhbGwodGhhdCwgcCwgaSwgcG9pbnRzKTtcbiAgICBhcnJheVtpICogMiArIDFdID0gZnkuY2FsbCh0aGF0LCBwLCBpLCBwb2ludHMpO1xuICB9XG4gIHJldHVybiBhcnJheTtcbn1cblxuZnVuY3Rpb24qIGZsYXRJdGVyYWJsZShwb2ludHMsIGZ4LCBmeSwgdGhhdCkge1xuICBsZXQgaSA9IDA7XG4gIGZvciAoY29uc3QgcCBvZiBwb2ludHMpIHtcbiAgICB5aWVsZCBmeC5jYWxsKHRoYXQsIHAsIGksIHBvaW50cyk7XG4gICAgeWllbGQgZnkuY2FsbCh0aGF0LCBwLCBpLCBwb2ludHMpO1xuICAgICsraTtcbiAgfVxufVxuIiwiY29uc3QgZXBzaWxvbiA9IDFlLTY7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBhdGgge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl94MCA9IHRoaXMuX3kwID0gLy8gc3RhcnQgb2YgY3VycmVudCBzdWJwYXRoXG4gICAgdGhpcy5feDEgPSB0aGlzLl95MSA9IG51bGw7IC8vIGVuZCBvZiBjdXJyZW50IHN1YnBhdGhcbiAgICB0aGlzLl8gPSBcIlwiO1xuICB9XG4gIG1vdmVUbyh4LCB5KSB7XG4gICAgdGhpcy5fICs9IGBNJHt0aGlzLl94MCA9IHRoaXMuX3gxID0gK3h9LCR7dGhpcy5feTAgPSB0aGlzLl95MSA9ICt5fWA7XG4gIH1cbiAgY2xvc2VQYXRoKCkge1xuICAgIGlmICh0aGlzLl94MSAhPT0gbnVsbCkge1xuICAgICAgdGhpcy5feDEgPSB0aGlzLl94MCwgdGhpcy5feTEgPSB0aGlzLl95MDtcbiAgICAgIHRoaXMuXyArPSBcIlpcIjtcbiAgICB9XG4gIH1cbiAgbGluZVRvKHgsIHkpIHtcbiAgICB0aGlzLl8gKz0gYEwke3RoaXMuX3gxID0gK3h9LCR7dGhpcy5feTEgPSAreX1gO1xuICB9XG4gIGFyYyh4LCB5LCByKSB7XG4gICAgeCA9ICt4LCB5ID0gK3ksIHIgPSArcjtcbiAgICBjb25zdCB4MCA9IHggKyByO1xuICAgIGNvbnN0IHkwID0geTtcbiAgICBpZiAociA8IDApIHRocm93IG5ldyBFcnJvcihcIm5lZ2F0aXZlIHJhZGl1c1wiKTtcbiAgICBpZiAodGhpcy5feDEgPT09IG51bGwpIHRoaXMuXyArPSBgTSR7eDB9LCR7eTB9YDtcbiAgICBlbHNlIGlmIChNYXRoLmFicyh0aGlzLl94MSAtIHgwKSA+IGVwc2lsb24gfHwgTWF0aC5hYnModGhpcy5feTEgLSB5MCkgPiBlcHNpbG9uKSB0aGlzLl8gKz0gXCJMXCIgKyB4MCArIFwiLFwiICsgeTA7XG4gICAgaWYgKCFyKSByZXR1cm47XG4gICAgdGhpcy5fICs9IGBBJHtyfSwke3J9LDAsMSwxLCR7eCAtIHJ9LCR7eX1BJHtyfSwke3J9LDAsMSwxLCR7dGhpcy5feDEgPSB4MH0sJHt0aGlzLl95MSA9IHkwfWA7XG4gIH1cbiAgcmVjdCh4LCB5LCB3LCBoKSB7XG4gICAgdGhpcy5fICs9IGBNJHt0aGlzLl94MCA9IHRoaXMuX3gxID0gK3h9LCR7dGhpcy5feTAgPSB0aGlzLl95MSA9ICt5fWgkeyt3fXYkeytofWgkey13fVpgO1xuICB9XG4gIHZhbHVlKCkge1xuICAgIHJldHVybiB0aGlzLl8gfHwgbnVsbDtcbiAgfVxufVxuIiwiZXhwb3J0IGRlZmF1bHQgY2xhc3MgUG9seWdvbiB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuXyA9IFtdO1xuICB9XG4gIG1vdmVUbyh4LCB5KSB7XG4gICAgdGhpcy5fLnB1c2goW3gsIHldKTtcbiAgfVxuICBjbG9zZVBhdGgoKSB7XG4gICAgdGhpcy5fLnB1c2godGhpcy5fWzBdLnNsaWNlKCkpO1xuICB9XG4gIGxpbmVUbyh4LCB5KSB7XG4gICAgdGhpcy5fLnB1c2goW3gsIHldKTtcbiAgfVxuICB2YWx1ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fLmxlbmd0aCA/IHRoaXMuXyA6IG51bGw7XG4gIH1cbn1cbiIsImltcG9ydCBQYXRoIGZyb20gXCIuL3BhdGguanNcIjtcbmltcG9ydCBQb2x5Z29uIGZyb20gXCIuL3BvbHlnb24uanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgVm9yb25vaSB7XG4gIGNvbnN0cnVjdG9yKGRlbGF1bmF5LCBbeG1pbiwgeW1pbiwgeG1heCwgeW1heF0gPSBbMCwgMCwgOTYwLCA1MDBdKSB7XG4gICAgaWYgKCEoKHhtYXggPSAreG1heCkgPj0gKHhtaW4gPSAreG1pbikpIHx8ICEoKHltYXggPSAreW1heCkgPj0gKHltaW4gPSAreW1pbikpKSB0aHJvdyBuZXcgRXJyb3IoXCJpbnZhbGlkIGJvdW5kc1wiKTtcbiAgICB0aGlzLmRlbGF1bmF5ID0gZGVsYXVuYXk7XG4gICAgdGhpcy5fY2lyY3VtY2VudGVycyA9IG5ldyBGbG9hdDY0QXJyYXkoZGVsYXVuYXkucG9pbnRzLmxlbmd0aCAqIDIpO1xuICAgIHRoaXMudmVjdG9ycyA9IG5ldyBGbG9hdDY0QXJyYXkoZGVsYXVuYXkucG9pbnRzLmxlbmd0aCAqIDIpO1xuICAgIHRoaXMueG1heCA9IHhtYXgsIHRoaXMueG1pbiA9IHhtaW47XG4gICAgdGhpcy55bWF4ID0geW1heCwgdGhpcy55bWluID0geW1pbjtcbiAgICB0aGlzLl9pbml0KCk7XG4gIH1cbiAgdXBkYXRlKCkge1xuICAgIHRoaXMuZGVsYXVuYXkudXBkYXRlKCk7XG4gICAgdGhpcy5faW5pdCgpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIF9pbml0KCkge1xuICAgIGNvbnN0IHtkZWxhdW5heToge3BvaW50cywgaHVsbCwgdHJpYW5nbGVzfSwgdmVjdG9yc30gPSB0aGlzO1xuICAgIGxldCBieCwgYnk7IC8vIGxhemlseSBjb21wdXRlZCBiYXJ5Y2VudGVyIG9mIHRoZSBodWxsXG5cbiAgICAvLyBDb21wdXRlIGNpcmN1bWNlbnRlcnMuXG4gICAgY29uc3QgY2lyY3VtY2VudGVycyA9IHRoaXMuY2lyY3VtY2VudGVycyA9IHRoaXMuX2NpcmN1bWNlbnRlcnMuc3ViYXJyYXkoMCwgdHJpYW5nbGVzLmxlbmd0aCAvIDMgKiAyKTtcbiAgICBmb3IgKGxldCBpID0gMCwgaiA9IDAsIG4gPSB0cmlhbmdsZXMubGVuZ3RoLCB4LCB5OyBpIDwgbjsgaSArPSAzLCBqICs9IDIpIHtcbiAgICAgIGNvbnN0IHQxID0gdHJpYW5nbGVzW2ldICogMjtcbiAgICAgIGNvbnN0IHQyID0gdHJpYW5nbGVzW2kgKyAxXSAqIDI7XG4gICAgICBjb25zdCB0MyA9IHRyaWFuZ2xlc1tpICsgMl0gKiAyO1xuICAgICAgY29uc3QgeDEgPSBwb2ludHNbdDFdO1xuICAgICAgY29uc3QgeTEgPSBwb2ludHNbdDEgKyAxXTtcbiAgICAgIGNvbnN0IHgyID0gcG9pbnRzW3QyXTtcbiAgICAgIGNvbnN0IHkyID0gcG9pbnRzW3QyICsgMV07XG4gICAgICBjb25zdCB4MyA9IHBvaW50c1t0M107XG4gICAgICBjb25zdCB5MyA9IHBvaW50c1t0MyArIDFdO1xuXG4gICAgICBjb25zdCBkeCA9IHgyIC0geDE7XG4gICAgICBjb25zdCBkeSA9IHkyIC0geTE7XG4gICAgICBjb25zdCBleCA9IHgzIC0geDE7XG4gICAgICBjb25zdCBleSA9IHkzIC0geTE7XG4gICAgICBjb25zdCBhYiA9IChkeCAqIGV5IC0gZHkgKiBleCkgKiAyO1xuXG4gICAgICBpZiAoTWF0aC5hYnMoYWIpIDwgMWUtOSkge1xuICAgICAgICAvLyBGb3IgYSBkZWdlbmVyYXRlIHRyaWFuZ2xlLCB0aGUgY2lyY3VtY2VudGVyIGlzIGF0IHRoZSBpbmZpbml0eSwgaW4gYVxuICAgICAgICAvLyBkaXJlY3Rpb24gb3J0aG9nb25hbCB0byB0aGUgaGFsZmVkZ2UgYW5kIGF3YXkgZnJvbSB0aGUg4oCcY2VudGVy4oCdIG9mXG4gICAgICAgIC8vIHRoZSBkaWFncmFtIDxieCwgYnk+LCBkZWZpbmVkIGFzIHRoZSBodWxs4oCZcyBiYXJ5Y2VudGVyLlxuICAgICAgICBpZiAoYnggPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGJ4ID0gYnkgPSAwO1xuICAgICAgICAgIGZvciAoY29uc3QgaSBvZiBodWxsKSBieCArPSBwb2ludHNbaSAqIDJdLCBieSArPSBwb2ludHNbaSAqIDIgKyAxXTtcbiAgICAgICAgICBieCAvPSBodWxsLmxlbmd0aCwgYnkgLz0gaHVsbC5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYSA9IDFlOSAqIE1hdGguc2lnbigoYnggLSB4MSkgKiBleSAtIChieSAtIHkxKSAqIGV4KTtcbiAgICAgICAgeCA9ICh4MSArIHgzKSAvIDIgLSBhICogZXk7XG4gICAgICAgIHkgPSAoeTEgKyB5MykgLyAyICsgYSAqIGV4O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgZCA9IDEgLyBhYjtcbiAgICAgICAgY29uc3QgYmwgPSBkeCAqIGR4ICsgZHkgKiBkeTtcbiAgICAgICAgY29uc3QgY2wgPSBleCAqIGV4ICsgZXkgKiBleTtcbiAgICAgICAgeCA9IHgxICsgKGV5ICogYmwgLSBkeSAqIGNsKSAqIGQ7XG4gICAgICAgIHkgPSB5MSArIChkeCAqIGNsIC0gZXggKiBibCkgKiBkO1xuICAgICAgfVxuICAgICAgY2lyY3VtY2VudGVyc1tqXSA9IHg7XG4gICAgICBjaXJjdW1jZW50ZXJzW2ogKyAxXSA9IHk7XG4gICAgfVxuXG4gICAgLy8gQ29tcHV0ZSBleHRlcmlvciBjZWxsIHJheXMuXG4gICAgbGV0IGggPSBodWxsW2h1bGwubGVuZ3RoIC0gMV07XG4gICAgbGV0IHAwLCBwMSA9IGggKiA0O1xuICAgIGxldCB4MCwgeDEgPSBwb2ludHNbMiAqIGhdO1xuICAgIGxldCB5MCwgeTEgPSBwb2ludHNbMiAqIGggKyAxXTtcbiAgICB2ZWN0b3JzLmZpbGwoMCk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBodWxsLmxlbmd0aDsgKytpKSB7XG4gICAgICBoID0gaHVsbFtpXTtcbiAgICAgIHAwID0gcDEsIHgwID0geDEsIHkwID0geTE7XG4gICAgICBwMSA9IGggKiA0LCB4MSA9IHBvaW50c1syICogaF0sIHkxID0gcG9pbnRzWzIgKiBoICsgMV07XG4gICAgICB2ZWN0b3JzW3AwICsgMl0gPSB2ZWN0b3JzW3AxXSA9IHkwIC0geTE7XG4gICAgICB2ZWN0b3JzW3AwICsgM10gPSB2ZWN0b3JzW3AxICsgMV0gPSB4MSAtIHgwO1xuICAgIH1cbiAgfVxuICByZW5kZXIoY29udGV4dCkge1xuICAgIGNvbnN0IGJ1ZmZlciA9IGNvbnRleHQgPT0gbnVsbCA/IGNvbnRleHQgPSBuZXcgUGF0aCA6IHVuZGVmaW5lZDtcbiAgICBjb25zdCB7ZGVsYXVuYXk6IHtoYWxmZWRnZXMsIGluZWRnZXMsIGh1bGx9LCBjaXJjdW1jZW50ZXJzLCB2ZWN0b3JzfSA9IHRoaXM7XG4gICAgaWYgKGh1bGwubGVuZ3RoIDw9IDEpIHJldHVybiBudWxsO1xuICAgIGZvciAobGV0IGkgPSAwLCBuID0gaGFsZmVkZ2VzLmxlbmd0aDsgaSA8IG47ICsraSkge1xuICAgICAgY29uc3QgaiA9IGhhbGZlZGdlc1tpXTtcbiAgICAgIGlmIChqIDwgaSkgY29udGludWU7XG4gICAgICBjb25zdCB0aSA9IE1hdGguZmxvb3IoaSAvIDMpICogMjtcbiAgICAgIGNvbnN0IHRqID0gTWF0aC5mbG9vcihqIC8gMykgKiAyO1xuICAgICAgY29uc3QgeGkgPSBjaXJjdW1jZW50ZXJzW3RpXTtcbiAgICAgIGNvbnN0IHlpID0gY2lyY3VtY2VudGVyc1t0aSArIDFdO1xuICAgICAgY29uc3QgeGogPSBjaXJjdW1jZW50ZXJzW3RqXTtcbiAgICAgIGNvbnN0IHlqID0gY2lyY3VtY2VudGVyc1t0aiArIDFdO1xuICAgICAgdGhpcy5fcmVuZGVyU2VnbWVudCh4aSwgeWksIHhqLCB5aiwgY29udGV4dCk7XG4gICAgfVxuICAgIGxldCBoMCwgaDEgPSBodWxsW2h1bGwubGVuZ3RoIC0gMV07XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBodWxsLmxlbmd0aDsgKytpKSB7XG4gICAgICBoMCA9IGgxLCBoMSA9IGh1bGxbaV07XG4gICAgICBjb25zdCB0ID0gTWF0aC5mbG9vcihpbmVkZ2VzW2gxXSAvIDMpICogMjtcbiAgICAgIGNvbnN0IHggPSBjaXJjdW1jZW50ZXJzW3RdO1xuICAgICAgY29uc3QgeSA9IGNpcmN1bWNlbnRlcnNbdCArIDFdO1xuICAgICAgY29uc3QgdiA9IGgwICogNDtcbiAgICAgIGNvbnN0IHAgPSB0aGlzLl9wcm9qZWN0KHgsIHksIHZlY3RvcnNbdiArIDJdLCB2ZWN0b3JzW3YgKyAzXSk7XG4gICAgICBpZiAocCkgdGhpcy5fcmVuZGVyU2VnbWVudCh4LCB5LCBwWzBdLCBwWzFdLCBjb250ZXh0KTtcbiAgICB9XG4gICAgcmV0dXJuIGJ1ZmZlciAmJiBidWZmZXIudmFsdWUoKTtcbiAgfVxuICByZW5kZXJCb3VuZHMoY29udGV4dCkge1xuICAgIGNvbnN0IGJ1ZmZlciA9IGNvbnRleHQgPT0gbnVsbCA/IGNvbnRleHQgPSBuZXcgUGF0aCA6IHVuZGVmaW5lZDtcbiAgICBjb250ZXh0LnJlY3QodGhpcy54bWluLCB0aGlzLnltaW4sIHRoaXMueG1heCAtIHRoaXMueG1pbiwgdGhpcy55bWF4IC0gdGhpcy55bWluKTtcbiAgICByZXR1cm4gYnVmZmVyICYmIGJ1ZmZlci52YWx1ZSgpO1xuICB9XG4gIHJlbmRlckNlbGwoaSwgY29udGV4dCkge1xuICAgIGNvbnN0IGJ1ZmZlciA9IGNvbnRleHQgPT0gbnVsbCA/IGNvbnRleHQgPSBuZXcgUGF0aCA6IHVuZGVmaW5lZDtcbiAgICBjb25zdCBwb2ludHMgPSB0aGlzLl9jbGlwKGkpO1xuICAgIGlmIChwb2ludHMgPT09IG51bGwgfHwgIXBvaW50cy5sZW5ndGgpIHJldHVybjtcbiAgICBjb250ZXh0Lm1vdmVUbyhwb2ludHNbMF0sIHBvaW50c1sxXSk7XG4gICAgbGV0IG4gPSBwb2ludHMubGVuZ3RoO1xuICAgIHdoaWxlIChwb2ludHNbMF0gPT09IHBvaW50c1tuLTJdICYmIHBvaW50c1sxXSA9PT0gcG9pbnRzW24tMV0gJiYgbiA+IDEpIG4gLT0gMjtcbiAgICBmb3IgKGxldCBpID0gMjsgaSA8IG47IGkgKz0gMikge1xuICAgICAgaWYgKHBvaW50c1tpXSAhPT0gcG9pbnRzW2ktMl0gfHwgcG9pbnRzW2krMV0gIT09IHBvaW50c1tpLTFdKVxuICAgICAgICBjb250ZXh0LmxpbmVUbyhwb2ludHNbaV0sIHBvaW50c1tpICsgMV0pO1xuICAgIH1cbiAgICBjb250ZXh0LmNsb3NlUGF0aCgpO1xuICAgIHJldHVybiBidWZmZXIgJiYgYnVmZmVyLnZhbHVlKCk7XG4gIH1cbiAgKmNlbGxQb2x5Z29ucygpIHtcbiAgICBjb25zdCB7ZGVsYXVuYXk6IHtwb2ludHN9fSA9IHRoaXM7XG4gICAgZm9yIChsZXQgaSA9IDAsIG4gPSBwb2ludHMubGVuZ3RoIC8gMjsgaSA8IG47ICsraSkge1xuICAgICAgY29uc3QgY2VsbCA9IHRoaXMuY2VsbFBvbHlnb24oaSk7XG4gICAgICBpZiAoY2VsbCkgY2VsbC5pbmRleCA9IGksIHlpZWxkIGNlbGw7XG4gICAgfVxuICB9XG4gIGNlbGxQb2x5Z29uKGkpIHtcbiAgICBjb25zdCBwb2x5Z29uID0gbmV3IFBvbHlnb247XG4gICAgdGhpcy5yZW5kZXJDZWxsKGksIHBvbHlnb24pO1xuICAgIHJldHVybiBwb2x5Z29uLnZhbHVlKCk7XG4gIH1cbiAgX3JlbmRlclNlZ21lbnQoeDAsIHkwLCB4MSwgeTEsIGNvbnRleHQpIHtcbiAgICBsZXQgUztcbiAgICBjb25zdCBjMCA9IHRoaXMuX3JlZ2lvbmNvZGUoeDAsIHkwKTtcbiAgICBjb25zdCBjMSA9IHRoaXMuX3JlZ2lvbmNvZGUoeDEsIHkxKTtcbiAgICBpZiAoYzAgPT09IDAgJiYgYzEgPT09IDApIHtcbiAgICAgIGNvbnRleHQubW92ZVRvKHgwLCB5MCk7XG4gICAgICBjb250ZXh0LmxpbmVUbyh4MSwgeTEpO1xuICAgIH0gZWxzZSBpZiAoUyA9IHRoaXMuX2NsaXBTZWdtZW50KHgwLCB5MCwgeDEsIHkxLCBjMCwgYzEpKSB7XG4gICAgICBjb250ZXh0Lm1vdmVUbyhTWzBdLCBTWzFdKTtcbiAgICAgIGNvbnRleHQubGluZVRvKFNbMl0sIFNbM10pO1xuICAgIH1cbiAgfVxuICBjb250YWlucyhpLCB4LCB5KSB7XG4gICAgaWYgKCh4ID0gK3gsIHggIT09IHgpIHx8ICh5ID0gK3ksIHkgIT09IHkpKSByZXR1cm4gZmFsc2U7XG4gICAgcmV0dXJuIHRoaXMuZGVsYXVuYXkuX3N0ZXAoaSwgeCwgeSkgPT09IGk7XG4gIH1cbiAgKm5laWdoYm9ycyhpKSB7XG4gICAgY29uc3QgY2kgPSB0aGlzLl9jbGlwKGkpO1xuICAgIGlmIChjaSkgZm9yIChjb25zdCBqIG9mIHRoaXMuZGVsYXVuYXkubmVpZ2hib3JzKGkpKSB7XG4gICAgICBjb25zdCBjaiA9IHRoaXMuX2NsaXAoaik7XG4gICAgICAvLyBmaW5kIHRoZSBjb21tb24gZWRnZVxuICAgICAgaWYgKGNqKSBsb29wOiBmb3IgKGxldCBhaSA9IDAsIGxpID0gY2kubGVuZ3RoOyBhaSA8IGxpOyBhaSArPSAyKSB7XG4gICAgICAgIGZvciAobGV0IGFqID0gMCwgbGogPSBjai5sZW5ndGg7IGFqIDwgbGo7IGFqICs9IDIpIHtcbiAgICAgICAgICBpZiAoY2lbYWldID09PSBjalthal1cbiAgICAgICAgICAgICAgJiYgY2lbYWkgKyAxXSA9PT0gY2pbYWogKyAxXVxuICAgICAgICAgICAgICAmJiBjaVsoYWkgKyAyKSAlIGxpXSA9PT0gY2pbKGFqICsgbGogLSAyKSAlIGxqXVxuICAgICAgICAgICAgICAmJiBjaVsoYWkgKyAzKSAlIGxpXSA9PT0gY2pbKGFqICsgbGogLSAxKSAlIGxqXSkge1xuICAgICAgICAgICAgeWllbGQgajtcbiAgICAgICAgICAgIGJyZWFrIGxvb3A7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG4gIF9jZWxsKGkpIHtcbiAgICBjb25zdCB7Y2lyY3VtY2VudGVycywgZGVsYXVuYXk6IHtpbmVkZ2VzLCBoYWxmZWRnZXMsIHRyaWFuZ2xlc319ID0gdGhpcztcbiAgICBjb25zdCBlMCA9IGluZWRnZXNbaV07XG4gICAgaWYgKGUwID09PSAtMSkgcmV0dXJuIG51bGw7IC8vIGNvaW5jaWRlbnQgcG9pbnRcbiAgICBjb25zdCBwb2ludHMgPSBbXTtcbiAgICBsZXQgZSA9IGUwO1xuICAgIGRvIHtcbiAgICAgIGNvbnN0IHQgPSBNYXRoLmZsb29yKGUgLyAzKTtcbiAgICAgIHBvaW50cy5wdXNoKGNpcmN1bWNlbnRlcnNbdCAqIDJdLCBjaXJjdW1jZW50ZXJzW3QgKiAyICsgMV0pO1xuICAgICAgZSA9IGUgJSAzID09PSAyID8gZSAtIDIgOiBlICsgMTtcbiAgICAgIGlmICh0cmlhbmdsZXNbZV0gIT09IGkpIGJyZWFrOyAvLyBiYWQgdHJpYW5ndWxhdGlvblxuICAgICAgZSA9IGhhbGZlZGdlc1tlXTtcbiAgICB9IHdoaWxlIChlICE9PSBlMCAmJiBlICE9PSAtMSk7XG4gICAgcmV0dXJuIHBvaW50cztcbiAgfVxuICBfY2xpcChpKSB7XG4gICAgLy8gZGVnZW5lcmF0ZSBjYXNlICgxIHZhbGlkIHBvaW50OiByZXR1cm4gdGhlIGJveClcbiAgICBpZiAoaSA9PT0gMCAmJiB0aGlzLmRlbGF1bmF5Lmh1bGwubGVuZ3RoID09PSAxKSB7XG4gICAgICByZXR1cm4gW3RoaXMueG1heCwgdGhpcy55bWluLCB0aGlzLnhtYXgsIHRoaXMueW1heCwgdGhpcy54bWluLCB0aGlzLnltYXgsIHRoaXMueG1pbiwgdGhpcy55bWluXTtcbiAgICB9XG4gICAgY29uc3QgcG9pbnRzID0gdGhpcy5fY2VsbChpKTtcbiAgICBpZiAocG9pbnRzID09PSBudWxsKSByZXR1cm4gbnVsbDtcbiAgICBjb25zdCB7dmVjdG9yczogVn0gPSB0aGlzO1xuICAgIGNvbnN0IHYgPSBpICogNDtcbiAgICByZXR1cm4gdGhpcy5fc2ltcGxpZnkoVlt2XSB8fCBWW3YgKyAxXVxuICAgICAgICA/IHRoaXMuX2NsaXBJbmZpbml0ZShpLCBwb2ludHMsIFZbdl0sIFZbdiArIDFdLCBWW3YgKyAyXSwgVlt2ICsgM10pXG4gICAgICAgIDogdGhpcy5fY2xpcEZpbml0ZShpLCBwb2ludHMpKTtcbiAgfVxuICBfY2xpcEZpbml0ZShpLCBwb2ludHMpIHtcbiAgICBjb25zdCBuID0gcG9pbnRzLmxlbmd0aDtcbiAgICBsZXQgUCA9IG51bGw7XG4gICAgbGV0IHgwLCB5MCwgeDEgPSBwb2ludHNbbiAtIDJdLCB5MSA9IHBvaW50c1tuIC0gMV07XG4gICAgbGV0IGMwLCBjMSA9IHRoaXMuX3JlZ2lvbmNvZGUoeDEsIHkxKTtcbiAgICBsZXQgZTAsIGUxID0gMDtcbiAgICBmb3IgKGxldCBqID0gMDsgaiA8IG47IGogKz0gMikge1xuICAgICAgeDAgPSB4MSwgeTAgPSB5MSwgeDEgPSBwb2ludHNbal0sIHkxID0gcG9pbnRzW2ogKyAxXTtcbiAgICAgIGMwID0gYzEsIGMxID0gdGhpcy5fcmVnaW9uY29kZSh4MSwgeTEpO1xuICAgICAgaWYgKGMwID09PSAwICYmIGMxID09PSAwKSB7XG4gICAgICAgIGUwID0gZTEsIGUxID0gMDtcbiAgICAgICAgaWYgKFApIFAucHVzaCh4MSwgeTEpO1xuICAgICAgICBlbHNlIFAgPSBbeDEsIHkxXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCBTLCBzeDAsIHN5MCwgc3gxLCBzeTE7XG4gICAgICAgIGlmIChjMCA9PT0gMCkge1xuICAgICAgICAgIGlmICgoUyA9IHRoaXMuX2NsaXBTZWdtZW50KHgwLCB5MCwgeDEsIHkxLCBjMCwgYzEpKSA9PT0gbnVsbCkgY29udGludWU7XG4gICAgICAgICAgW3N4MCwgc3kwLCBzeDEsIHN5MV0gPSBTO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmICgoUyA9IHRoaXMuX2NsaXBTZWdtZW50KHgxLCB5MSwgeDAsIHkwLCBjMSwgYzApKSA9PT0gbnVsbCkgY29udGludWU7XG4gICAgICAgICAgW3N4MSwgc3kxLCBzeDAsIHN5MF0gPSBTO1xuICAgICAgICAgIGUwID0gZTEsIGUxID0gdGhpcy5fZWRnZWNvZGUoc3gwLCBzeTApO1xuICAgICAgICAgIGlmIChlMCAmJiBlMSkgdGhpcy5fZWRnZShpLCBlMCwgZTEsIFAsIFAubGVuZ3RoKTtcbiAgICAgICAgICBpZiAoUCkgUC5wdXNoKHN4MCwgc3kwKTtcbiAgICAgICAgICBlbHNlIFAgPSBbc3gwLCBzeTBdO1xuICAgICAgICB9XG4gICAgICAgIGUwID0gZTEsIGUxID0gdGhpcy5fZWRnZWNvZGUoc3gxLCBzeTEpO1xuICAgICAgICBpZiAoZTAgJiYgZTEpIHRoaXMuX2VkZ2UoaSwgZTAsIGUxLCBQLCBQLmxlbmd0aCk7XG4gICAgICAgIGlmIChQKSBQLnB1c2goc3gxLCBzeTEpO1xuICAgICAgICBlbHNlIFAgPSBbc3gxLCBzeTFdO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoUCkge1xuICAgICAgZTAgPSBlMSwgZTEgPSB0aGlzLl9lZGdlY29kZShQWzBdLCBQWzFdKTtcbiAgICAgIGlmIChlMCAmJiBlMSkgdGhpcy5fZWRnZShpLCBlMCwgZTEsIFAsIFAubGVuZ3RoKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuY29udGFpbnMoaSwgKHRoaXMueG1pbiArIHRoaXMueG1heCkgLyAyLCAodGhpcy55bWluICsgdGhpcy55bWF4KSAvIDIpKSB7XG4gICAgICByZXR1cm4gW3RoaXMueG1heCwgdGhpcy55bWluLCB0aGlzLnhtYXgsIHRoaXMueW1heCwgdGhpcy54bWluLCB0aGlzLnltYXgsIHRoaXMueG1pbiwgdGhpcy55bWluXTtcbiAgICB9XG4gICAgcmV0dXJuIFA7XG4gIH1cbiAgX2NsaXBTZWdtZW50KHgwLCB5MCwgeDEsIHkxLCBjMCwgYzEpIHtcbiAgICAvLyBmb3IgbW9yZSByb2J1c3RuZXNzLCBhbHdheXMgY29uc2lkZXIgdGhlIHNlZ21lbnQgaW4gdGhlIHNhbWUgb3JkZXJcbiAgICBjb25zdCBmbGlwID0gYzAgPCBjMTtcbiAgICBpZiAoZmxpcCkgW3gwLCB5MCwgeDEsIHkxLCBjMCwgYzFdID0gW3gxLCB5MSwgeDAsIHkwLCBjMSwgYzBdO1xuICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICBpZiAoYzAgPT09IDAgJiYgYzEgPT09IDApIHJldHVybiBmbGlwID8gW3gxLCB5MSwgeDAsIHkwXSA6IFt4MCwgeTAsIHgxLCB5MV07XG4gICAgICBpZiAoYzAgJiBjMSkgcmV0dXJuIG51bGw7XG4gICAgICBsZXQgeCwgeSwgYyA9IGMwIHx8IGMxO1xuICAgICAgaWYgKGMgJiAwYjEwMDApIHggPSB4MCArICh4MSAtIHgwKSAqICh0aGlzLnltYXggLSB5MCkgLyAoeTEgLSB5MCksIHkgPSB0aGlzLnltYXg7XG4gICAgICBlbHNlIGlmIChjICYgMGIwMTAwKSB4ID0geDAgKyAoeDEgLSB4MCkgKiAodGhpcy55bWluIC0geTApIC8gKHkxIC0geTApLCB5ID0gdGhpcy55bWluO1xuICAgICAgZWxzZSBpZiAoYyAmIDBiMDAxMCkgeSA9IHkwICsgKHkxIC0geTApICogKHRoaXMueG1heCAtIHgwKSAvICh4MSAtIHgwKSwgeCA9IHRoaXMueG1heDtcbiAgICAgIGVsc2UgeSA9IHkwICsgKHkxIC0geTApICogKHRoaXMueG1pbiAtIHgwKSAvICh4MSAtIHgwKSwgeCA9IHRoaXMueG1pbjtcbiAgICAgIGlmIChjMCkgeDAgPSB4LCB5MCA9IHksIGMwID0gdGhpcy5fcmVnaW9uY29kZSh4MCwgeTApO1xuICAgICAgZWxzZSB4MSA9IHgsIHkxID0geSwgYzEgPSB0aGlzLl9yZWdpb25jb2RlKHgxLCB5MSk7XG4gICAgfVxuICB9XG4gIF9jbGlwSW5maW5pdGUoaSwgcG9pbnRzLCB2eDAsIHZ5MCwgdnhuLCB2eW4pIHtcbiAgICBsZXQgUCA9IEFycmF5LmZyb20ocG9pbnRzKSwgcDtcbiAgICBpZiAocCA9IHRoaXMuX3Byb2plY3QoUFswXSwgUFsxXSwgdngwLCB2eTApKSBQLnVuc2hpZnQocFswXSwgcFsxXSk7XG4gICAgaWYgKHAgPSB0aGlzLl9wcm9qZWN0KFBbUC5sZW5ndGggLSAyXSwgUFtQLmxlbmd0aCAtIDFdLCB2eG4sIHZ5bikpIFAucHVzaChwWzBdLCBwWzFdKTtcbiAgICBpZiAoUCA9IHRoaXMuX2NsaXBGaW5pdGUoaSwgUCkpIHtcbiAgICAgIGZvciAobGV0IGogPSAwLCBuID0gUC5sZW5ndGgsIGMwLCBjMSA9IHRoaXMuX2VkZ2Vjb2RlKFBbbiAtIDJdLCBQW24gLSAxXSk7IGogPCBuOyBqICs9IDIpIHtcbiAgICAgICAgYzAgPSBjMSwgYzEgPSB0aGlzLl9lZGdlY29kZShQW2pdLCBQW2ogKyAxXSk7XG4gICAgICAgIGlmIChjMCAmJiBjMSkgaiA9IHRoaXMuX2VkZ2UoaSwgYzAsIGMxLCBQLCBqKSwgbiA9IFAubGVuZ3RoO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodGhpcy5jb250YWlucyhpLCAodGhpcy54bWluICsgdGhpcy54bWF4KSAvIDIsICh0aGlzLnltaW4gKyB0aGlzLnltYXgpIC8gMikpIHtcbiAgICAgIFAgPSBbdGhpcy54bWluLCB0aGlzLnltaW4sIHRoaXMueG1heCwgdGhpcy55bWluLCB0aGlzLnhtYXgsIHRoaXMueW1heCwgdGhpcy54bWluLCB0aGlzLnltYXhdO1xuICAgIH1cbiAgICByZXR1cm4gUDtcbiAgfVxuICBfZWRnZShpLCBlMCwgZTEsIFAsIGopIHtcbiAgICB3aGlsZSAoZTAgIT09IGUxKSB7XG4gICAgICBsZXQgeCwgeTtcbiAgICAgIHN3aXRjaCAoZTApIHtcbiAgICAgICAgY2FzZSAwYjAxMDE6IGUwID0gMGIwMTAwOyBjb250aW51ZTsgLy8gdG9wLWxlZnRcbiAgICAgICAgY2FzZSAwYjAxMDA6IGUwID0gMGIwMTEwLCB4ID0gdGhpcy54bWF4LCB5ID0gdGhpcy55bWluOyBicmVhazsgLy8gdG9wXG4gICAgICAgIGNhc2UgMGIwMTEwOiBlMCA9IDBiMDAxMDsgY29udGludWU7IC8vIHRvcC1yaWdodFxuICAgICAgICBjYXNlIDBiMDAxMDogZTAgPSAwYjEwMTAsIHggPSB0aGlzLnhtYXgsIHkgPSB0aGlzLnltYXg7IGJyZWFrOyAvLyByaWdodFxuICAgICAgICBjYXNlIDBiMTAxMDogZTAgPSAwYjEwMDA7IGNvbnRpbnVlOyAvLyBib3R0b20tcmlnaHRcbiAgICAgICAgY2FzZSAwYjEwMDA6IGUwID0gMGIxMDAxLCB4ID0gdGhpcy54bWluLCB5ID0gdGhpcy55bWF4OyBicmVhazsgLy8gYm90dG9tXG4gICAgICAgIGNhc2UgMGIxMDAxOiBlMCA9IDBiMDAwMTsgY29udGludWU7IC8vIGJvdHRvbS1sZWZ0XG4gICAgICAgIGNhc2UgMGIwMDAxOiBlMCA9IDBiMDEwMSwgeCA9IHRoaXMueG1pbiwgeSA9IHRoaXMueW1pbjsgYnJlYWs7IC8vIGxlZnRcbiAgICAgIH1cbiAgICAgIC8vIE5vdGU6IHRoaXMgaW1wbGljaXRseSBjaGVja3MgZm9yIG91dCBvZiBib3VuZHM6IGlmIFBbal0gb3IgUFtqKzFdIGFyZVxuICAgICAgLy8gdW5kZWZpbmVkLCB0aGUgY29uZGl0aW9uYWwgc3RhdGVtZW50IHdpbGwgYmUgZXhlY3V0ZWQuXG4gICAgICBpZiAoKFBbal0gIT09IHggfHwgUFtqICsgMV0gIT09IHkpICYmIHRoaXMuY29udGFpbnMoaSwgeCwgeSkpIHtcbiAgICAgICAgUC5zcGxpY2UoaiwgMCwgeCwgeSksIGogKz0gMjtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGo7XG4gIH1cbiAgX3Byb2plY3QoeDAsIHkwLCB2eCwgdnkpIHtcbiAgICBsZXQgdCA9IEluZmluaXR5LCBjLCB4LCB5O1xuICAgIGlmICh2eSA8IDApIHsgLy8gdG9wXG4gICAgICBpZiAoeTAgPD0gdGhpcy55bWluKSByZXR1cm4gbnVsbDtcbiAgICAgIGlmICgoYyA9ICh0aGlzLnltaW4gLSB5MCkgLyB2eSkgPCB0KSB5ID0gdGhpcy55bWluLCB4ID0geDAgKyAodCA9IGMpICogdng7XG4gICAgfSBlbHNlIGlmICh2eSA+IDApIHsgLy8gYm90dG9tXG4gICAgICBpZiAoeTAgPj0gdGhpcy55bWF4KSByZXR1cm4gbnVsbDtcbiAgICAgIGlmICgoYyA9ICh0aGlzLnltYXggLSB5MCkgLyB2eSkgPCB0KSB5ID0gdGhpcy55bWF4LCB4ID0geDAgKyAodCA9IGMpICogdng7XG4gICAgfVxuICAgIGlmICh2eCA+IDApIHsgLy8gcmlnaHRcbiAgICAgIGlmICh4MCA+PSB0aGlzLnhtYXgpIHJldHVybiBudWxsO1xuICAgICAgaWYgKChjID0gKHRoaXMueG1heCAtIHgwKSAvIHZ4KSA8IHQpIHggPSB0aGlzLnhtYXgsIHkgPSB5MCArICh0ID0gYykgKiB2eTtcbiAgICB9IGVsc2UgaWYgKHZ4IDwgMCkgeyAvLyBsZWZ0XG4gICAgICBpZiAoeDAgPD0gdGhpcy54bWluKSByZXR1cm4gbnVsbDtcbiAgICAgIGlmICgoYyA9ICh0aGlzLnhtaW4gLSB4MCkgLyB2eCkgPCB0KSB4ID0gdGhpcy54bWluLCB5ID0geTAgKyAodCA9IGMpICogdnk7XG4gICAgfVxuICAgIHJldHVybiBbeCwgeV07XG4gIH1cbiAgX2VkZ2Vjb2RlKHgsIHkpIHtcbiAgICByZXR1cm4gKHggPT09IHRoaXMueG1pbiA/IDBiMDAwMVxuICAgICAgICA6IHggPT09IHRoaXMueG1heCA/IDBiMDAxMCA6IDBiMDAwMClcbiAgICAgICAgfCAoeSA9PT0gdGhpcy55bWluID8gMGIwMTAwXG4gICAgICAgIDogeSA9PT0gdGhpcy55bWF4ID8gMGIxMDAwIDogMGIwMDAwKTtcbiAgfVxuICBfcmVnaW9uY29kZSh4LCB5KSB7XG4gICAgcmV0dXJuICh4IDwgdGhpcy54bWluID8gMGIwMDAxXG4gICAgICAgIDogeCA+IHRoaXMueG1heCA/IDBiMDAxMCA6IDBiMDAwMClcbiAgICAgICAgfCAoeSA8IHRoaXMueW1pbiA/IDBiMDEwMFxuICAgICAgICA6IHkgPiB0aGlzLnltYXggPyAwYjEwMDAgOiAwYjAwMDApO1xuICB9XG4gIF9zaW1wbGlmeShQKSB7XG4gICAgaWYgKFAgJiYgUC5sZW5ndGggPiA0KSB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IFAubGVuZ3RoOyBpKz0gMikge1xuICAgICAgICBjb25zdCBqID0gKGkgKyAyKSAlIFAubGVuZ3RoLCBrID0gKGkgKyA0KSAlIFAubGVuZ3RoO1xuICAgICAgICBpZiAoUFtpXSA9PT0gUFtqXSAmJiBQW2pdID09PSBQW2tdIHx8IFBbaSArIDFdID09PSBQW2ogKyAxXSAmJiBQW2ogKyAxXSA9PT0gUFtrICsgMV0pIHtcbiAgICAgICAgICBQLnNwbGljZShqLCAyKSwgaSAtPSAyO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoIVAubGVuZ3RoKSBQID0gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIFA7XG4gIH1cbn1cbiIsIlxuY29uc3QgRVBTSUxPTiA9IE1hdGgucG93KDIsIC01Mik7XG5jb25zdCBFREdFX1NUQUNLID0gbmV3IFVpbnQzMkFycmF5KDUxMik7XG5cbmltcG9ydCB7b3JpZW50MmR9IGZyb20gJ3JvYnVzdC1wcmVkaWNhdGVzJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGVsYXVuYXRvciB7XG5cbiAgICBzdGF0aWMgZnJvbShwb2ludHMsIGdldFggPSBkZWZhdWx0R2V0WCwgZ2V0WSA9IGRlZmF1bHRHZXRZKSB7XG4gICAgICAgIGNvbnN0IG4gPSBwb2ludHMubGVuZ3RoO1xuICAgICAgICBjb25zdCBjb29yZHMgPSBuZXcgRmxvYXQ2NEFycmF5KG4gKiAyKTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG47IGkrKykge1xuICAgICAgICAgICAgY29uc3QgcCA9IHBvaW50c1tpXTtcbiAgICAgICAgICAgIGNvb3Jkc1syICogaV0gPSBnZXRYKHApO1xuICAgICAgICAgICAgY29vcmRzWzIgKiBpICsgMV0gPSBnZXRZKHApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIG5ldyBEZWxhdW5hdG9yKGNvb3Jkcyk7XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IoY29vcmRzKSB7XG4gICAgICAgIGNvbnN0IG4gPSBjb29yZHMubGVuZ3RoID4+IDE7XG4gICAgICAgIGlmIChuID4gMCAmJiB0eXBlb2YgY29vcmRzWzBdICE9PSAnbnVtYmVyJykgdGhyb3cgbmV3IEVycm9yKCdFeHBlY3RlZCBjb29yZHMgdG8gY29udGFpbiBudW1iZXJzLicpO1xuXG4gICAgICAgIHRoaXMuY29vcmRzID0gY29vcmRzO1xuXG4gICAgICAgIC8vIGFycmF5cyB0aGF0IHdpbGwgc3RvcmUgdGhlIHRyaWFuZ3VsYXRpb24gZ3JhcGhcbiAgICAgICAgY29uc3QgbWF4VHJpYW5nbGVzID0gTWF0aC5tYXgoMiAqIG4gLSA1LCAwKTtcbiAgICAgICAgdGhpcy5fdHJpYW5nbGVzID0gbmV3IFVpbnQzMkFycmF5KG1heFRyaWFuZ2xlcyAqIDMpO1xuICAgICAgICB0aGlzLl9oYWxmZWRnZXMgPSBuZXcgSW50MzJBcnJheShtYXhUcmlhbmdsZXMgKiAzKTtcblxuICAgICAgICAvLyB0ZW1wb3JhcnkgYXJyYXlzIGZvciB0cmFja2luZyB0aGUgZWRnZXMgb2YgdGhlIGFkdmFuY2luZyBjb252ZXggaHVsbFxuICAgICAgICB0aGlzLl9oYXNoU2l6ZSA9IE1hdGguY2VpbChNYXRoLnNxcnQobikpO1xuICAgICAgICB0aGlzLl9odWxsUHJldiA9IG5ldyBVaW50MzJBcnJheShuKTsgLy8gZWRnZSB0byBwcmV2IGVkZ2VcbiAgICAgICAgdGhpcy5faHVsbE5leHQgPSBuZXcgVWludDMyQXJyYXkobik7IC8vIGVkZ2UgdG8gbmV4dCBlZGdlXG4gICAgICAgIHRoaXMuX2h1bGxUcmkgPSBuZXcgVWludDMyQXJyYXkobik7IC8vIGVkZ2UgdG8gYWRqYWNlbnQgdHJpYW5nbGVcbiAgICAgICAgdGhpcy5faHVsbEhhc2ggPSBuZXcgSW50MzJBcnJheSh0aGlzLl9oYXNoU2l6ZSkuZmlsbCgtMSk7IC8vIGFuZ3VsYXIgZWRnZSBoYXNoXG5cbiAgICAgICAgLy8gdGVtcG9yYXJ5IGFycmF5cyBmb3Igc29ydGluZyBwb2ludHNcbiAgICAgICAgdGhpcy5faWRzID0gbmV3IFVpbnQzMkFycmF5KG4pO1xuICAgICAgICB0aGlzLl9kaXN0cyA9IG5ldyBGbG9hdDY0QXJyYXkobik7XG5cbiAgICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICB9XG5cbiAgICB1cGRhdGUoKSB7XG4gICAgICAgIGNvbnN0IHtjb29yZHMsIF9odWxsUHJldjogaHVsbFByZXYsIF9odWxsTmV4dDogaHVsbE5leHQsIF9odWxsVHJpOiBodWxsVHJpLCBfaHVsbEhhc2g6IGh1bGxIYXNofSA9ICB0aGlzO1xuICAgICAgICBjb25zdCBuID0gY29vcmRzLmxlbmd0aCA+PiAxO1xuXG4gICAgICAgIC8vIHBvcHVsYXRlIGFuIGFycmF5IG9mIHBvaW50IGluZGljZXM7IGNhbGN1bGF0ZSBpbnB1dCBkYXRhIGJib3hcbiAgICAgICAgbGV0IG1pblggPSBJbmZpbml0eTtcbiAgICAgICAgbGV0IG1pblkgPSBJbmZpbml0eTtcbiAgICAgICAgbGV0IG1heFggPSAtSW5maW5pdHk7XG4gICAgICAgIGxldCBtYXhZID0gLUluZmluaXR5O1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbjsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCB4ID0gY29vcmRzWzIgKiBpXTtcbiAgICAgICAgICAgIGNvbnN0IHkgPSBjb29yZHNbMiAqIGkgKyAxXTtcbiAgICAgICAgICAgIGlmICh4IDwgbWluWCkgbWluWCA9IHg7XG4gICAgICAgICAgICBpZiAoeSA8IG1pblkpIG1pblkgPSB5O1xuICAgICAgICAgICAgaWYgKHggPiBtYXhYKSBtYXhYID0geDtcbiAgICAgICAgICAgIGlmICh5ID4gbWF4WSkgbWF4WSA9IHk7XG4gICAgICAgICAgICB0aGlzLl9pZHNbaV0gPSBpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGN4ID0gKG1pblggKyBtYXhYKSAvIDI7XG4gICAgICAgIGNvbnN0IGN5ID0gKG1pblkgKyBtYXhZKSAvIDI7XG5cbiAgICAgICAgbGV0IG1pbkRpc3QgPSBJbmZpbml0eTtcbiAgICAgICAgbGV0IGkwLCBpMSwgaTI7XG5cbiAgICAgICAgLy8gcGljayBhIHNlZWQgcG9pbnQgY2xvc2UgdG8gdGhlIGNlbnRlclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG47IGkrKykge1xuICAgICAgICAgICAgY29uc3QgZCA9IGRpc3QoY3gsIGN5LCBjb29yZHNbMiAqIGldLCBjb29yZHNbMiAqIGkgKyAxXSk7XG4gICAgICAgICAgICBpZiAoZCA8IG1pbkRpc3QpIHtcbiAgICAgICAgICAgICAgICBpMCA9IGk7XG4gICAgICAgICAgICAgICAgbWluRGlzdCA9IGQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaTB4ID0gY29vcmRzWzIgKiBpMF07XG4gICAgICAgIGNvbnN0IGkweSA9IGNvb3Jkc1syICogaTAgKyAxXTtcblxuICAgICAgICBtaW5EaXN0ID0gSW5maW5pdHk7XG5cbiAgICAgICAgLy8gZmluZCB0aGUgcG9pbnQgY2xvc2VzdCB0byB0aGUgc2VlZFxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG47IGkrKykge1xuICAgICAgICAgICAgaWYgKGkgPT09IGkwKSBjb250aW51ZTtcbiAgICAgICAgICAgIGNvbnN0IGQgPSBkaXN0KGkweCwgaTB5LCBjb29yZHNbMiAqIGldLCBjb29yZHNbMiAqIGkgKyAxXSk7XG4gICAgICAgICAgICBpZiAoZCA8IG1pbkRpc3QgJiYgZCA+IDApIHtcbiAgICAgICAgICAgICAgICBpMSA9IGk7XG4gICAgICAgICAgICAgICAgbWluRGlzdCA9IGQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGkxeCA9IGNvb3Jkc1syICogaTFdO1xuICAgICAgICBsZXQgaTF5ID0gY29vcmRzWzIgKiBpMSArIDFdO1xuXG4gICAgICAgIGxldCBtaW5SYWRpdXMgPSBJbmZpbml0eTtcblxuICAgICAgICAvLyBmaW5kIHRoZSB0aGlyZCBwb2ludCB3aGljaCBmb3JtcyB0aGUgc21hbGxlc3QgY2lyY3VtY2lyY2xlIHdpdGggdGhlIGZpcnN0IHR3b1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG47IGkrKykge1xuICAgICAgICAgICAgaWYgKGkgPT09IGkwIHx8IGkgPT09IGkxKSBjb250aW51ZTtcbiAgICAgICAgICAgIGNvbnN0IHIgPSBjaXJjdW1yYWRpdXMoaTB4LCBpMHksIGkxeCwgaTF5LCBjb29yZHNbMiAqIGldLCBjb29yZHNbMiAqIGkgKyAxXSk7XG4gICAgICAgICAgICBpZiAociA8IG1pblJhZGl1cykge1xuICAgICAgICAgICAgICAgIGkyID0gaTtcbiAgICAgICAgICAgICAgICBtaW5SYWRpdXMgPSByO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGxldCBpMnggPSBjb29yZHNbMiAqIGkyXTtcbiAgICAgICAgbGV0IGkyeSA9IGNvb3Jkc1syICogaTIgKyAxXTtcblxuICAgICAgICBpZiAobWluUmFkaXVzID09PSBJbmZpbml0eSkge1xuICAgICAgICAgICAgLy8gb3JkZXIgY29sbGluZWFyIHBvaW50cyBieSBkeCAob3IgZHkgaWYgYWxsIHggYXJlIGlkZW50aWNhbClcbiAgICAgICAgICAgIC8vIGFuZCByZXR1cm4gdGhlIGxpc3QgYXMgYSBodWxsXG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG47IGkrKykge1xuICAgICAgICAgICAgICAgIHRoaXMuX2Rpc3RzW2ldID0gKGNvb3Jkc1syICogaV0gLSBjb29yZHNbMF0pIHx8IChjb29yZHNbMiAqIGkgKyAxXSAtIGNvb3Jkc1sxXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBxdWlja3NvcnQodGhpcy5faWRzLCB0aGlzLl9kaXN0cywgMCwgbiAtIDEpO1xuICAgICAgICAgICAgY29uc3QgaHVsbCA9IG5ldyBVaW50MzJBcnJheShuKTtcbiAgICAgICAgICAgIGxldCBqID0gMDtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwLCBkMCA9IC1JbmZpbml0eTsgaSA8IG47IGkrKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGlkID0gdGhpcy5faWRzW2ldO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9kaXN0c1tpZF0gPiBkMCkge1xuICAgICAgICAgICAgICAgICAgICBodWxsW2orK10gPSBpZDtcbiAgICAgICAgICAgICAgICAgICAgZDAgPSB0aGlzLl9kaXN0c1tpZF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5odWxsID0gaHVsbC5zdWJhcnJheSgwLCBqKTtcbiAgICAgICAgICAgIHRoaXMudHJpYW5nbGVzID0gbmV3IFVpbnQzMkFycmF5KDApO1xuICAgICAgICAgICAgdGhpcy5oYWxmZWRnZXMgPSBuZXcgVWludDMyQXJyYXkoMCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBzd2FwIHRoZSBvcmRlciBvZiB0aGUgc2VlZCBwb2ludHMgZm9yIGNvdW50ZXItY2xvY2t3aXNlIG9yaWVudGF0aW9uXG4gICAgICAgIGlmIChvcmllbnQyZChpMHgsIGkweSwgaTF4LCBpMXksIGkyeCwgaTJ5KSA8IDApIHtcbiAgICAgICAgICAgIGNvbnN0IGkgPSBpMTtcbiAgICAgICAgICAgIGNvbnN0IHggPSBpMXg7XG4gICAgICAgICAgICBjb25zdCB5ID0gaTF5O1xuICAgICAgICAgICAgaTEgPSBpMjtcbiAgICAgICAgICAgIGkxeCA9IGkyeDtcbiAgICAgICAgICAgIGkxeSA9IGkyeTtcbiAgICAgICAgICAgIGkyID0gaTtcbiAgICAgICAgICAgIGkyeCA9IHg7XG4gICAgICAgICAgICBpMnkgPSB5O1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgY2VudGVyID0gY2lyY3VtY2VudGVyKGkweCwgaTB5LCBpMXgsIGkxeSwgaTJ4LCBpMnkpO1xuICAgICAgICB0aGlzLl9jeCA9IGNlbnRlci54O1xuICAgICAgICB0aGlzLl9jeSA9IGNlbnRlci55O1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbjsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLl9kaXN0c1tpXSA9IGRpc3QoY29vcmRzWzIgKiBpXSwgY29vcmRzWzIgKiBpICsgMV0sIGNlbnRlci54LCBjZW50ZXIueSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBzb3J0IHRoZSBwb2ludHMgYnkgZGlzdGFuY2UgZnJvbSB0aGUgc2VlZCB0cmlhbmdsZSBjaXJjdW1jZW50ZXJcbiAgICAgICAgcXVpY2tzb3J0KHRoaXMuX2lkcywgdGhpcy5fZGlzdHMsIDAsIG4gLSAxKTtcblxuICAgICAgICAvLyBzZXQgdXAgdGhlIHNlZWQgdHJpYW5nbGUgYXMgdGhlIHN0YXJ0aW5nIGh1bGxcbiAgICAgICAgdGhpcy5faHVsbFN0YXJ0ID0gaTA7XG4gICAgICAgIGxldCBodWxsU2l6ZSA9IDM7XG5cbiAgICAgICAgaHVsbE5leHRbaTBdID0gaHVsbFByZXZbaTJdID0gaTE7XG4gICAgICAgIGh1bGxOZXh0W2kxXSA9IGh1bGxQcmV2W2kwXSA9IGkyO1xuICAgICAgICBodWxsTmV4dFtpMl0gPSBodWxsUHJldltpMV0gPSBpMDtcblxuICAgICAgICBodWxsVHJpW2kwXSA9IDA7XG4gICAgICAgIGh1bGxUcmlbaTFdID0gMTtcbiAgICAgICAgaHVsbFRyaVtpMl0gPSAyO1xuXG4gICAgICAgIGh1bGxIYXNoLmZpbGwoLTEpO1xuICAgICAgICBodWxsSGFzaFt0aGlzLl9oYXNoS2V5KGkweCwgaTB5KV0gPSBpMDtcbiAgICAgICAgaHVsbEhhc2hbdGhpcy5faGFzaEtleShpMXgsIGkxeSldID0gaTE7XG4gICAgICAgIGh1bGxIYXNoW3RoaXMuX2hhc2hLZXkoaTJ4LCBpMnkpXSA9IGkyO1xuXG4gICAgICAgIHRoaXMudHJpYW5nbGVzTGVuID0gMDtcbiAgICAgICAgdGhpcy5fYWRkVHJpYW5nbGUoaTAsIGkxLCBpMiwgLTEsIC0xLCAtMSk7XG5cbiAgICAgICAgZm9yIChsZXQgayA9IDAsIHhwLCB5cDsgayA8IHRoaXMuX2lkcy5sZW5ndGg7IGsrKykge1xuICAgICAgICAgICAgY29uc3QgaSA9IHRoaXMuX2lkc1trXTtcbiAgICAgICAgICAgIGNvbnN0IHggPSBjb29yZHNbMiAqIGldO1xuICAgICAgICAgICAgY29uc3QgeSA9IGNvb3Jkc1syICogaSArIDFdO1xuXG4gICAgICAgICAgICAvLyBza2lwIG5lYXItZHVwbGljYXRlIHBvaW50c1xuICAgICAgICAgICAgaWYgKGsgPiAwICYmIE1hdGguYWJzKHggLSB4cCkgPD0gRVBTSUxPTiAmJiBNYXRoLmFicyh5IC0geXApIDw9IEVQU0lMT04pIGNvbnRpbnVlO1xuICAgICAgICAgICAgeHAgPSB4O1xuICAgICAgICAgICAgeXAgPSB5O1xuXG4gICAgICAgICAgICAvLyBza2lwIHNlZWQgdHJpYW5nbGUgcG9pbnRzXG4gICAgICAgICAgICBpZiAoaSA9PT0gaTAgfHwgaSA9PT0gaTEgfHwgaSA9PT0gaTIpIGNvbnRpbnVlO1xuXG4gICAgICAgICAgICAvLyBmaW5kIGEgdmlzaWJsZSBlZGdlIG9uIHRoZSBjb252ZXggaHVsbCB1c2luZyBlZGdlIGhhc2hcbiAgICAgICAgICAgIGxldCBzdGFydCA9IDA7XG4gICAgICAgICAgICBmb3IgKGxldCBqID0gMCwga2V5ID0gdGhpcy5faGFzaEtleSh4LCB5KTsgaiA8IHRoaXMuX2hhc2hTaXplOyBqKyspIHtcbiAgICAgICAgICAgICAgICBzdGFydCA9IGh1bGxIYXNoWyhrZXkgKyBqKSAlIHRoaXMuX2hhc2hTaXplXTtcbiAgICAgICAgICAgICAgICBpZiAoc3RhcnQgIT09IC0xICYmIHN0YXJ0ICE9PSBodWxsTmV4dFtzdGFydF0pIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzdGFydCA9IGh1bGxQcmV2W3N0YXJ0XTtcbiAgICAgICAgICAgIGxldCBlID0gc3RhcnQsIHE7XG4gICAgICAgICAgICB3aGlsZSAocSA9IGh1bGxOZXh0W2VdLCBvcmllbnQyZCh4LCB5LCBjb29yZHNbMiAqIGVdLCBjb29yZHNbMiAqIGUgKyAxXSwgY29vcmRzWzIgKiBxXSwgY29vcmRzWzIgKiBxICsgMV0pID49IDApIHtcbiAgICAgICAgICAgICAgICBlID0gcTtcbiAgICAgICAgICAgICAgICBpZiAoZSA9PT0gc3RhcnQpIHtcbiAgICAgICAgICAgICAgICAgICAgZSA9IC0xO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZSA9PT0gLTEpIGNvbnRpbnVlOyAvLyBsaWtlbHkgYSBuZWFyLWR1cGxpY2F0ZSBwb2ludDsgc2tpcCBpdFxuXG4gICAgICAgICAgICAvLyBhZGQgdGhlIGZpcnN0IHRyaWFuZ2xlIGZyb20gdGhlIHBvaW50XG4gICAgICAgICAgICBsZXQgdCA9IHRoaXMuX2FkZFRyaWFuZ2xlKGUsIGksIGh1bGxOZXh0W2VdLCAtMSwgLTEsIGh1bGxUcmlbZV0pO1xuXG4gICAgICAgICAgICAvLyByZWN1cnNpdmVseSBmbGlwIHRyaWFuZ2xlcyBmcm9tIHRoZSBwb2ludCB1bnRpbCB0aGV5IHNhdGlzZnkgdGhlIERlbGF1bmF5IGNvbmRpdGlvblxuICAgICAgICAgICAgaHVsbFRyaVtpXSA9IHRoaXMuX2xlZ2FsaXplKHQgKyAyKTtcbiAgICAgICAgICAgIGh1bGxUcmlbZV0gPSB0OyAvLyBrZWVwIHRyYWNrIG9mIGJvdW5kYXJ5IHRyaWFuZ2xlcyBvbiB0aGUgaHVsbFxuICAgICAgICAgICAgaHVsbFNpemUrKztcblxuICAgICAgICAgICAgLy8gd2FsayBmb3J3YXJkIHRocm91Z2ggdGhlIGh1bGwsIGFkZGluZyBtb3JlIHRyaWFuZ2xlcyBhbmQgZmxpcHBpbmcgcmVjdXJzaXZlbHlcbiAgICAgICAgICAgIGxldCBuID0gaHVsbE5leHRbZV07XG4gICAgICAgICAgICB3aGlsZSAocSA9IGh1bGxOZXh0W25dLCBvcmllbnQyZCh4LCB5LCBjb29yZHNbMiAqIG5dLCBjb29yZHNbMiAqIG4gKyAxXSwgY29vcmRzWzIgKiBxXSwgY29vcmRzWzIgKiBxICsgMV0pIDwgMCkge1xuICAgICAgICAgICAgICAgIHQgPSB0aGlzLl9hZGRUcmlhbmdsZShuLCBpLCBxLCBodWxsVHJpW2ldLCAtMSwgaHVsbFRyaVtuXSk7XG4gICAgICAgICAgICAgICAgaHVsbFRyaVtpXSA9IHRoaXMuX2xlZ2FsaXplKHQgKyAyKTtcbiAgICAgICAgICAgICAgICBodWxsTmV4dFtuXSA9IG47IC8vIG1hcmsgYXMgcmVtb3ZlZFxuICAgICAgICAgICAgICAgIGh1bGxTaXplLS07XG4gICAgICAgICAgICAgICAgbiA9IHE7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIHdhbGsgYmFja3dhcmQgZnJvbSB0aGUgb3RoZXIgc2lkZSwgYWRkaW5nIG1vcmUgdHJpYW5nbGVzIGFuZCBmbGlwcGluZ1xuICAgICAgICAgICAgaWYgKGUgPT09IHN0YXJ0KSB7XG4gICAgICAgICAgICAgICAgd2hpbGUgKHEgPSBodWxsUHJldltlXSwgb3JpZW50MmQoeCwgeSwgY29vcmRzWzIgKiBxXSwgY29vcmRzWzIgKiBxICsgMV0sIGNvb3Jkc1syICogZV0sIGNvb3Jkc1syICogZSArIDFdKSA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdCA9IHRoaXMuX2FkZFRyaWFuZ2xlKHEsIGksIGUsIC0xLCBodWxsVHJpW2VdLCBodWxsVHJpW3FdKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fbGVnYWxpemUodCArIDIpO1xuICAgICAgICAgICAgICAgICAgICBodWxsVHJpW3FdID0gdDtcbiAgICAgICAgICAgICAgICAgICAgaHVsbE5leHRbZV0gPSBlOyAvLyBtYXJrIGFzIHJlbW92ZWRcbiAgICAgICAgICAgICAgICAgICAgaHVsbFNpemUtLTtcbiAgICAgICAgICAgICAgICAgICAgZSA9IHE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyB1cGRhdGUgdGhlIGh1bGwgaW5kaWNlc1xuICAgICAgICAgICAgdGhpcy5faHVsbFN0YXJ0ID0gaHVsbFByZXZbaV0gPSBlO1xuICAgICAgICAgICAgaHVsbE5leHRbZV0gPSBodWxsUHJldltuXSA9IGk7XG4gICAgICAgICAgICBodWxsTmV4dFtpXSA9IG47XG5cbiAgICAgICAgICAgIC8vIHNhdmUgdGhlIHR3byBuZXcgZWRnZXMgaW4gdGhlIGhhc2ggdGFibGVcbiAgICAgICAgICAgIGh1bGxIYXNoW3RoaXMuX2hhc2hLZXkoeCwgeSldID0gaTtcbiAgICAgICAgICAgIGh1bGxIYXNoW3RoaXMuX2hhc2hLZXkoY29vcmRzWzIgKiBlXSwgY29vcmRzWzIgKiBlICsgMV0pXSA9IGU7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmh1bGwgPSBuZXcgVWludDMyQXJyYXkoaHVsbFNpemUpO1xuICAgICAgICBmb3IgKGxldCBpID0gMCwgZSA9IHRoaXMuX2h1bGxTdGFydDsgaSA8IGh1bGxTaXplOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMuaHVsbFtpXSA9IGU7XG4gICAgICAgICAgICBlID0gaHVsbE5leHRbZV07XG4gICAgICAgIH1cblxuICAgICAgICAvLyB0cmltIHR5cGVkIHRyaWFuZ2xlIG1lc2ggYXJyYXlzXG4gICAgICAgIHRoaXMudHJpYW5nbGVzID0gdGhpcy5fdHJpYW5nbGVzLnN1YmFycmF5KDAsIHRoaXMudHJpYW5nbGVzTGVuKTtcbiAgICAgICAgdGhpcy5oYWxmZWRnZXMgPSB0aGlzLl9oYWxmZWRnZXMuc3ViYXJyYXkoMCwgdGhpcy50cmlhbmdsZXNMZW4pO1xuICAgIH1cblxuICAgIF9oYXNoS2V5KHgsIHkpIHtcbiAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IocHNldWRvQW5nbGUoeCAtIHRoaXMuX2N4LCB5IC0gdGhpcy5fY3kpICogdGhpcy5faGFzaFNpemUpICUgdGhpcy5faGFzaFNpemU7XG4gICAgfVxuXG4gICAgX2xlZ2FsaXplKGEpIHtcbiAgICAgICAgY29uc3Qge190cmlhbmdsZXM6IHRyaWFuZ2xlcywgX2hhbGZlZGdlczogaGFsZmVkZ2VzLCBjb29yZHN9ID0gdGhpcztcblxuICAgICAgICBsZXQgaSA9IDA7XG4gICAgICAgIGxldCBhciA9IDA7XG5cbiAgICAgICAgLy8gcmVjdXJzaW9uIGVsaW1pbmF0ZWQgd2l0aCBhIGZpeGVkLXNpemUgc3RhY2tcbiAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICAgIGNvbnN0IGIgPSBoYWxmZWRnZXNbYV07XG5cbiAgICAgICAgICAgIC8qIGlmIHRoZSBwYWlyIG9mIHRyaWFuZ2xlcyBkb2Vzbid0IHNhdGlzZnkgdGhlIERlbGF1bmF5IGNvbmRpdGlvblxuICAgICAgICAgICAgICogKHAxIGlzIGluc2lkZSB0aGUgY2lyY3VtY2lyY2xlIG9mIFtwMCwgcGwsIHByXSksIGZsaXAgdGhlbSxcbiAgICAgICAgICAgICAqIHRoZW4gZG8gdGhlIHNhbWUgY2hlY2svZmxpcCByZWN1cnNpdmVseSBmb3IgdGhlIG5ldyBwYWlyIG9mIHRyaWFuZ2xlc1xuICAgICAgICAgICAgICpcbiAgICAgICAgICAgICAqICAgICAgICAgICBwbCAgICAgICAgICAgICAgICAgICAgcGxcbiAgICAgICAgICAgICAqICAgICAgICAgIC98fFxcICAgICAgICAgICAgICAgICAgLyAgXFxcbiAgICAgICAgICAgICAqICAgICAgIGFsLyB8fCBcXGJsICAgICAgICAgICAgYWwvICAgIFxcYVxuICAgICAgICAgICAgICogICAgICAgIC8gIHx8ICBcXCAgICAgICAgICAgICAgLyAgICAgIFxcXG4gICAgICAgICAgICAgKiAgICAgICAvICBhfHxiICBcXCAgICBmbGlwICAgIC9fX19hcl9fX1xcXG4gICAgICAgICAgICAgKiAgICAgcDBcXCAgIHx8ICAgL3AxICAgPT4gICBwMFxcLS0tYmwtLS0vcDFcbiAgICAgICAgICAgICAqICAgICAgICBcXCAgfHwgIC8gICAgICAgICAgICAgIFxcICAgICAgL1xuICAgICAgICAgICAgICogICAgICAgYXJcXCB8fCAvYnIgICAgICAgICAgICAgYlxcICAgIC9iclxuICAgICAgICAgICAgICogICAgICAgICAgXFx8fC8gICAgICAgICAgICAgICAgICBcXCAgL1xuICAgICAgICAgICAgICogICAgICAgICAgIHByICAgICAgICAgICAgICAgICAgICBwclxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBjb25zdCBhMCA9IGEgLSBhICUgMztcbiAgICAgICAgICAgIGFyID0gYTAgKyAoYSArIDIpICUgMztcblxuICAgICAgICAgICAgaWYgKGIgPT09IC0xKSB7IC8vIGNvbnZleCBodWxsIGVkZ2VcbiAgICAgICAgICAgICAgICBpZiAoaSA9PT0gMCkgYnJlYWs7XG4gICAgICAgICAgICAgICAgYSA9IEVER0VfU1RBQ0tbLS1pXTtcbiAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgYjAgPSBiIC0gYiAlIDM7XG4gICAgICAgICAgICBjb25zdCBhbCA9IGEwICsgKGEgKyAxKSAlIDM7XG4gICAgICAgICAgICBjb25zdCBibCA9IGIwICsgKGIgKyAyKSAlIDM7XG5cbiAgICAgICAgICAgIGNvbnN0IHAwID0gdHJpYW5nbGVzW2FyXTtcbiAgICAgICAgICAgIGNvbnN0IHByID0gdHJpYW5nbGVzW2FdO1xuICAgICAgICAgICAgY29uc3QgcGwgPSB0cmlhbmdsZXNbYWxdO1xuICAgICAgICAgICAgY29uc3QgcDEgPSB0cmlhbmdsZXNbYmxdO1xuXG4gICAgICAgICAgICBjb25zdCBpbGxlZ2FsID0gaW5DaXJjbGUoXG4gICAgICAgICAgICAgICAgY29vcmRzWzIgKiBwMF0sIGNvb3Jkc1syICogcDAgKyAxXSxcbiAgICAgICAgICAgICAgICBjb29yZHNbMiAqIHByXSwgY29vcmRzWzIgKiBwciArIDFdLFxuICAgICAgICAgICAgICAgIGNvb3Jkc1syICogcGxdLCBjb29yZHNbMiAqIHBsICsgMV0sXG4gICAgICAgICAgICAgICAgY29vcmRzWzIgKiBwMV0sIGNvb3Jkc1syICogcDEgKyAxXSk7XG5cbiAgICAgICAgICAgIGlmIChpbGxlZ2FsKSB7XG4gICAgICAgICAgICAgICAgdHJpYW5nbGVzW2FdID0gcDE7XG4gICAgICAgICAgICAgICAgdHJpYW5nbGVzW2JdID0gcDA7XG5cbiAgICAgICAgICAgICAgICBjb25zdCBoYmwgPSBoYWxmZWRnZXNbYmxdO1xuXG4gICAgICAgICAgICAgICAgLy8gZWRnZSBzd2FwcGVkIG9uIHRoZSBvdGhlciBzaWRlIG9mIHRoZSBodWxsIChyYXJlKTsgZml4IHRoZSBoYWxmZWRnZSByZWZlcmVuY2VcbiAgICAgICAgICAgICAgICBpZiAoaGJsID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgZSA9IHRoaXMuX2h1bGxTdGFydDtcbiAgICAgICAgICAgICAgICAgICAgZG8ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX2h1bGxUcmlbZV0gPT09IGJsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5faHVsbFRyaVtlXSA9IGE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlID0gdGhpcy5faHVsbFByZXZbZV07XG4gICAgICAgICAgICAgICAgICAgIH0gd2hpbGUgKGUgIT09IHRoaXMuX2h1bGxTdGFydCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuX2xpbmsoYSwgaGJsKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9saW5rKGIsIGhhbGZlZGdlc1thcl0pO1xuICAgICAgICAgICAgICAgIHRoaXMuX2xpbmsoYXIsIGJsKTtcblxuICAgICAgICAgICAgICAgIGNvbnN0IGJyID0gYjAgKyAoYiArIDEpICUgMztcblxuICAgICAgICAgICAgICAgIC8vIGRvbid0IHdvcnJ5IGFib3V0IGhpdHRpbmcgdGhlIGNhcDogaXQgY2FuIG9ubHkgaGFwcGVuIG9uIGV4dHJlbWVseSBkZWdlbmVyYXRlIGlucHV0XG4gICAgICAgICAgICAgICAgaWYgKGkgPCBFREdFX1NUQUNLLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBFREdFX1NUQUNLW2krK10gPSBicjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChpID09PSAwKSBicmVhaztcbiAgICAgICAgICAgICAgICBhID0gRURHRV9TVEFDS1stLWldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGFyO1xuICAgIH1cblxuICAgIF9saW5rKGEsIGIpIHtcbiAgICAgICAgdGhpcy5faGFsZmVkZ2VzW2FdID0gYjtcbiAgICAgICAgaWYgKGIgIT09IC0xKSB0aGlzLl9oYWxmZWRnZXNbYl0gPSBhO1xuICAgIH1cblxuICAgIC8vIGFkZCBhIG5ldyB0cmlhbmdsZSBnaXZlbiB2ZXJ0ZXggaW5kaWNlcyBhbmQgYWRqYWNlbnQgaGFsZi1lZGdlIGlkc1xuICAgIF9hZGRUcmlhbmdsZShpMCwgaTEsIGkyLCBhLCBiLCBjKSB7XG4gICAgICAgIGNvbnN0IHQgPSB0aGlzLnRyaWFuZ2xlc0xlbjtcblxuICAgICAgICB0aGlzLl90cmlhbmdsZXNbdF0gPSBpMDtcbiAgICAgICAgdGhpcy5fdHJpYW5nbGVzW3QgKyAxXSA9IGkxO1xuICAgICAgICB0aGlzLl90cmlhbmdsZXNbdCArIDJdID0gaTI7XG5cbiAgICAgICAgdGhpcy5fbGluayh0LCBhKTtcbiAgICAgICAgdGhpcy5fbGluayh0ICsgMSwgYik7XG4gICAgICAgIHRoaXMuX2xpbmsodCArIDIsIGMpO1xuXG4gICAgICAgIHRoaXMudHJpYW5nbGVzTGVuICs9IDM7XG5cbiAgICAgICAgcmV0dXJuIHQ7XG4gICAgfVxufVxuXG4vLyBtb25vdG9uaWNhbGx5IGluY3JlYXNlcyB3aXRoIHJlYWwgYW5nbGUsIGJ1dCBkb2Vzbid0IG5lZWQgZXhwZW5zaXZlIHRyaWdvbm9tZXRyeVxuZnVuY3Rpb24gcHNldWRvQW5nbGUoZHgsIGR5KSB7XG4gICAgY29uc3QgcCA9IGR4IC8gKE1hdGguYWJzKGR4KSArIE1hdGguYWJzKGR5KSk7XG4gICAgcmV0dXJuIChkeSA+IDAgPyAzIC0gcCA6IDEgKyBwKSAvIDQ7IC8vIFswLi4xXVxufVxuXG5mdW5jdGlvbiBkaXN0KGF4LCBheSwgYngsIGJ5KSB7XG4gICAgY29uc3QgZHggPSBheCAtIGJ4O1xuICAgIGNvbnN0IGR5ID0gYXkgLSBieTtcbiAgICByZXR1cm4gZHggKiBkeCArIGR5ICogZHk7XG59XG5cbmZ1bmN0aW9uIGluQ2lyY2xlKGF4LCBheSwgYngsIGJ5LCBjeCwgY3ksIHB4LCBweSkge1xuICAgIGNvbnN0IGR4ID0gYXggLSBweDtcbiAgICBjb25zdCBkeSA9IGF5IC0gcHk7XG4gICAgY29uc3QgZXggPSBieCAtIHB4O1xuICAgIGNvbnN0IGV5ID0gYnkgLSBweTtcbiAgICBjb25zdCBmeCA9IGN4IC0gcHg7XG4gICAgY29uc3QgZnkgPSBjeSAtIHB5O1xuXG4gICAgY29uc3QgYXAgPSBkeCAqIGR4ICsgZHkgKiBkeTtcbiAgICBjb25zdCBicCA9IGV4ICogZXggKyBleSAqIGV5O1xuICAgIGNvbnN0IGNwID0gZnggKiBmeCArIGZ5ICogZnk7XG5cbiAgICByZXR1cm4gZHggKiAoZXkgKiBjcCAtIGJwICogZnkpIC1cbiAgICAgICAgICAgZHkgKiAoZXggKiBjcCAtIGJwICogZngpICtcbiAgICAgICAgICAgYXAgKiAoZXggKiBmeSAtIGV5ICogZngpIDwgMDtcbn1cblxuZnVuY3Rpb24gY2lyY3VtcmFkaXVzKGF4LCBheSwgYngsIGJ5LCBjeCwgY3kpIHtcbiAgICBjb25zdCBkeCA9IGJ4IC0gYXg7XG4gICAgY29uc3QgZHkgPSBieSAtIGF5O1xuICAgIGNvbnN0IGV4ID0gY3ggLSBheDtcbiAgICBjb25zdCBleSA9IGN5IC0gYXk7XG5cbiAgICBjb25zdCBibCA9IGR4ICogZHggKyBkeSAqIGR5O1xuICAgIGNvbnN0IGNsID0gZXggKiBleCArIGV5ICogZXk7XG4gICAgY29uc3QgZCA9IDAuNSAvIChkeCAqIGV5IC0gZHkgKiBleCk7XG5cbiAgICBjb25zdCB4ID0gKGV5ICogYmwgLSBkeSAqIGNsKSAqIGQ7XG4gICAgY29uc3QgeSA9IChkeCAqIGNsIC0gZXggKiBibCkgKiBkO1xuXG4gICAgcmV0dXJuIHggKiB4ICsgeSAqIHk7XG59XG5cbmZ1bmN0aW9uIGNpcmN1bWNlbnRlcihheCwgYXksIGJ4LCBieSwgY3gsIGN5KSB7XG4gICAgY29uc3QgZHggPSBieCAtIGF4O1xuICAgIGNvbnN0IGR5ID0gYnkgLSBheTtcbiAgICBjb25zdCBleCA9IGN4IC0gYXg7XG4gICAgY29uc3QgZXkgPSBjeSAtIGF5O1xuXG4gICAgY29uc3QgYmwgPSBkeCAqIGR4ICsgZHkgKiBkeTtcbiAgICBjb25zdCBjbCA9IGV4ICogZXggKyBleSAqIGV5O1xuICAgIGNvbnN0IGQgPSAwLjUgLyAoZHggKiBleSAtIGR5ICogZXgpO1xuXG4gICAgY29uc3QgeCA9IGF4ICsgKGV5ICogYmwgLSBkeSAqIGNsKSAqIGQ7XG4gICAgY29uc3QgeSA9IGF5ICsgKGR4ICogY2wgLSBleCAqIGJsKSAqIGQ7XG5cbiAgICByZXR1cm4ge3gsIHl9O1xufVxuXG5mdW5jdGlvbiBxdWlja3NvcnQoaWRzLCBkaXN0cywgbGVmdCwgcmlnaHQpIHtcbiAgICBpZiAocmlnaHQgLSBsZWZ0IDw9IDIwKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSBsZWZ0ICsgMTsgaSA8PSByaWdodDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCB0ZW1wID0gaWRzW2ldO1xuICAgICAgICAgICAgY29uc3QgdGVtcERpc3QgPSBkaXN0c1t0ZW1wXTtcbiAgICAgICAgICAgIGxldCBqID0gaSAtIDE7XG4gICAgICAgICAgICB3aGlsZSAoaiA+PSBsZWZ0ICYmIGRpc3RzW2lkc1tqXV0gPiB0ZW1wRGlzdCkgaWRzW2ogKyAxXSA9IGlkc1tqLS1dO1xuICAgICAgICAgICAgaWRzW2ogKyAxXSA9IHRlbXA7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBtZWRpYW4gPSAobGVmdCArIHJpZ2h0KSA+PiAxO1xuICAgICAgICBsZXQgaSA9IGxlZnQgKyAxO1xuICAgICAgICBsZXQgaiA9IHJpZ2h0O1xuICAgICAgICBzd2FwKGlkcywgbWVkaWFuLCBpKTtcbiAgICAgICAgaWYgKGRpc3RzW2lkc1tsZWZ0XV0gPiBkaXN0c1tpZHNbcmlnaHRdXSkgc3dhcChpZHMsIGxlZnQsIHJpZ2h0KTtcbiAgICAgICAgaWYgKGRpc3RzW2lkc1tpXV0gPiBkaXN0c1tpZHNbcmlnaHRdXSkgc3dhcChpZHMsIGksIHJpZ2h0KTtcbiAgICAgICAgaWYgKGRpc3RzW2lkc1tsZWZ0XV0gPiBkaXN0c1tpZHNbaV1dKSBzd2FwKGlkcywgbGVmdCwgaSk7XG5cbiAgICAgICAgY29uc3QgdGVtcCA9IGlkc1tpXTtcbiAgICAgICAgY29uc3QgdGVtcERpc3QgPSBkaXN0c1t0ZW1wXTtcbiAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICAgIGRvIGkrKzsgd2hpbGUgKGRpc3RzW2lkc1tpXV0gPCB0ZW1wRGlzdCk7XG4gICAgICAgICAgICBkbyBqLS07IHdoaWxlIChkaXN0c1tpZHNbal1dID4gdGVtcERpc3QpO1xuICAgICAgICAgICAgaWYgKGogPCBpKSBicmVhaztcbiAgICAgICAgICAgIHN3YXAoaWRzLCBpLCBqKTtcbiAgICAgICAgfVxuICAgICAgICBpZHNbbGVmdCArIDFdID0gaWRzW2pdO1xuICAgICAgICBpZHNbal0gPSB0ZW1wO1xuXG4gICAgICAgIGlmIChyaWdodCAtIGkgKyAxID49IGogLSBsZWZ0KSB7XG4gICAgICAgICAgICBxdWlja3NvcnQoaWRzLCBkaXN0cywgaSwgcmlnaHQpO1xuICAgICAgICAgICAgcXVpY2tzb3J0KGlkcywgZGlzdHMsIGxlZnQsIGogLSAxKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHF1aWNrc29ydChpZHMsIGRpc3RzLCBsZWZ0LCBqIC0gMSk7XG4gICAgICAgICAgICBxdWlja3NvcnQoaWRzLCBkaXN0cywgaSwgcmlnaHQpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5mdW5jdGlvbiBzd2FwKGFyciwgaSwgaikge1xuICAgIGNvbnN0IHRtcCA9IGFycltpXTtcbiAgICBhcnJbaV0gPSBhcnJbal07XG4gICAgYXJyW2pdID0gdG1wO1xufVxuXG5mdW5jdGlvbiBkZWZhdWx0R2V0WChwKSB7XG4gICAgcmV0dXJuIHBbMF07XG59XG5mdW5jdGlvbiBkZWZhdWx0R2V0WShwKSB7XG4gICAgcmV0dXJuIHBbMV07XG59XG4iLCIvKipcbiAqIG1hcmtlZCB2NC4zLjAgLSBhIG1hcmtkb3duIHBhcnNlclxuICogQ29weXJpZ2h0IChjKSAyMDExLTIwMjMsIENocmlzdG9waGVyIEplZmZyZXkuIChNSVQgTGljZW5zZWQpXG4gKiBodHRwczovL2dpdGh1Yi5jb20vbWFya2VkanMvbWFya2VkXG4gKi9cblxuLyoqXG4gKiBETyBOT1QgRURJVCBUSElTIEZJTEVcbiAqIFRoZSBjb2RlIGluIHRoaXMgZmlsZSBpcyBnZW5lcmF0ZWQgZnJvbSBmaWxlcyBpbiAuL3NyYy9cbiAqL1xuXG5mdW5jdGlvbiBnZXREZWZhdWx0cygpIHtcbiAgcmV0dXJuIHtcbiAgICBhc3luYzogZmFsc2UsXG4gICAgYmFzZVVybDogbnVsbCxcbiAgICBicmVha3M6IGZhbHNlLFxuICAgIGV4dGVuc2lvbnM6IG51bGwsXG4gICAgZ2ZtOiB0cnVlLFxuICAgIGhlYWRlcklkczogdHJ1ZSxcbiAgICBoZWFkZXJQcmVmaXg6ICcnLFxuICAgIGhpZ2hsaWdodDogbnVsbCxcbiAgICBob29rczogbnVsbCxcbiAgICBsYW5nUHJlZml4OiAnbGFuZ3VhZ2UtJyxcbiAgICBtYW5nbGU6IHRydWUsXG4gICAgcGVkYW50aWM6IGZhbHNlLFxuICAgIHJlbmRlcmVyOiBudWxsLFxuICAgIHNhbml0aXplOiBmYWxzZSxcbiAgICBzYW5pdGl6ZXI6IG51bGwsXG4gICAgc2lsZW50OiBmYWxzZSxcbiAgICBzbWFydHlwYW50czogZmFsc2UsXG4gICAgdG9rZW5pemVyOiBudWxsLFxuICAgIHdhbGtUb2tlbnM6IG51bGwsXG4gICAgeGh0bWw6IGZhbHNlXG4gIH07XG59XG5cbmxldCBkZWZhdWx0cyA9IGdldERlZmF1bHRzKCk7XG5cbmZ1bmN0aW9uIGNoYW5nZURlZmF1bHRzKG5ld0RlZmF1bHRzKSB7XG4gIGRlZmF1bHRzID0gbmV3RGVmYXVsdHM7XG59XG5cbi8qKlxuICogSGVscGVyc1xuICovXG5jb25zdCBlc2NhcGVUZXN0ID0gL1smPD5cIiddLztcbmNvbnN0IGVzY2FwZVJlcGxhY2UgPSBuZXcgUmVnRXhwKGVzY2FwZVRlc3Quc291cmNlLCAnZycpO1xuY29uc3QgZXNjYXBlVGVzdE5vRW5jb2RlID0gL1s8PlwiJ118Jig/ISgjXFxkezEsN318I1tYeF1bYS1mQS1GMC05XXsxLDZ9fFxcdyspOykvO1xuY29uc3QgZXNjYXBlUmVwbGFjZU5vRW5jb2RlID0gbmV3IFJlZ0V4cChlc2NhcGVUZXN0Tm9FbmNvZGUuc291cmNlLCAnZycpO1xuY29uc3QgZXNjYXBlUmVwbGFjZW1lbnRzID0ge1xuICAnJic6ICcmYW1wOycsXG4gICc8JzogJyZsdDsnLFxuICAnPic6ICcmZ3Q7JyxcbiAgJ1wiJzogJyZxdW90OycsXG4gIFwiJ1wiOiAnJiMzOTsnXG59O1xuY29uc3QgZ2V0RXNjYXBlUmVwbGFjZW1lbnQgPSAoY2gpID0+IGVzY2FwZVJlcGxhY2VtZW50c1tjaF07XG5mdW5jdGlvbiBlc2NhcGUoaHRtbCwgZW5jb2RlKSB7XG4gIGlmIChlbmNvZGUpIHtcbiAgICBpZiAoZXNjYXBlVGVzdC50ZXN0KGh0bWwpKSB7XG4gICAgICByZXR1cm4gaHRtbC5yZXBsYWNlKGVzY2FwZVJlcGxhY2UsIGdldEVzY2FwZVJlcGxhY2VtZW50KTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKGVzY2FwZVRlc3ROb0VuY29kZS50ZXN0KGh0bWwpKSB7XG4gICAgICByZXR1cm4gaHRtbC5yZXBsYWNlKGVzY2FwZVJlcGxhY2VOb0VuY29kZSwgZ2V0RXNjYXBlUmVwbGFjZW1lbnQpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBodG1sO1xufVxuXG5jb25zdCB1bmVzY2FwZVRlc3QgPSAvJigjKD86XFxkKyl8KD86I3hbMC05QS1GYS1mXSspfCg/OlxcdyspKTs/L2lnO1xuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSBodG1sXG4gKi9cbmZ1bmN0aW9uIHVuZXNjYXBlKGh0bWwpIHtcbiAgLy8gZXhwbGljaXRseSBtYXRjaCBkZWNpbWFsLCBoZXgsIGFuZCBuYW1lZCBIVE1MIGVudGl0aWVzXG4gIHJldHVybiBodG1sLnJlcGxhY2UodW5lc2NhcGVUZXN0LCAoXywgbikgPT4ge1xuICAgIG4gPSBuLnRvTG93ZXJDYXNlKCk7XG4gICAgaWYgKG4gPT09ICdjb2xvbicpIHJldHVybiAnOic7XG4gICAgaWYgKG4uY2hhckF0KDApID09PSAnIycpIHtcbiAgICAgIHJldHVybiBuLmNoYXJBdCgxKSA9PT0gJ3gnXG4gICAgICAgID8gU3RyaW5nLmZyb21DaGFyQ29kZShwYXJzZUludChuLnN1YnN0cmluZygyKSwgMTYpKVxuICAgICAgICA6IFN0cmluZy5mcm9tQ2hhckNvZGUoK24uc3Vic3RyaW5nKDEpKTtcbiAgICB9XG4gICAgcmV0dXJuICcnO1xuICB9KTtcbn1cblxuY29uc3QgY2FyZXQgPSAvKF58W15cXFtdKVxcXi9nO1xuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nIHwgUmVnRXhwfSByZWdleFxuICogQHBhcmFtIHtzdHJpbmd9IG9wdFxuICovXG5mdW5jdGlvbiBlZGl0KHJlZ2V4LCBvcHQpIHtcbiAgcmVnZXggPSB0eXBlb2YgcmVnZXggPT09ICdzdHJpbmcnID8gcmVnZXggOiByZWdleC5zb3VyY2U7XG4gIG9wdCA9IG9wdCB8fCAnJztcbiAgY29uc3Qgb2JqID0ge1xuICAgIHJlcGxhY2U6IChuYW1lLCB2YWwpID0+IHtcbiAgICAgIHZhbCA9IHZhbC5zb3VyY2UgfHwgdmFsO1xuICAgICAgdmFsID0gdmFsLnJlcGxhY2UoY2FyZXQsICckMScpO1xuICAgICAgcmVnZXggPSByZWdleC5yZXBsYWNlKG5hbWUsIHZhbCk7XG4gICAgICByZXR1cm4gb2JqO1xuICAgIH0sXG4gICAgZ2V0UmVnZXg6ICgpID0+IHtcbiAgICAgIHJldHVybiBuZXcgUmVnRXhwKHJlZ2V4LCBvcHQpO1xuICAgIH1cbiAgfTtcbiAgcmV0dXJuIG9iajtcbn1cblxuY29uc3Qgbm9uV29yZEFuZENvbG9uVGVzdCA9IC9bXlxcdzpdL2c7XG5jb25zdCBvcmlnaW5JbmRlcGVuZGVudFVybCA9IC9eJHxeW2Etel1bYS16MC05Ky4tXSo6fF5bPyNdL2k7XG5cbi8qKlxuICogQHBhcmFtIHtib29sZWFufSBzYW5pdGl6ZVxuICogQHBhcmFtIHtzdHJpbmd9IGJhc2VcbiAqIEBwYXJhbSB7c3RyaW5nfSBocmVmXG4gKi9cbmZ1bmN0aW9uIGNsZWFuVXJsKHNhbml0aXplLCBiYXNlLCBocmVmKSB7XG4gIGlmIChzYW5pdGl6ZSkge1xuICAgIGxldCBwcm90O1xuICAgIHRyeSB7XG4gICAgICBwcm90ID0gZGVjb2RlVVJJQ29tcG9uZW50KHVuZXNjYXBlKGhyZWYpKVxuICAgICAgICAucmVwbGFjZShub25Xb3JkQW5kQ29sb25UZXN0LCAnJylcbiAgICAgICAgLnRvTG93ZXJDYXNlKCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGlmIChwcm90LmluZGV4T2YoJ2phdmFzY3JpcHQ6JykgPT09IDAgfHwgcHJvdC5pbmRleE9mKCd2YnNjcmlwdDonKSA9PT0gMCB8fCBwcm90LmluZGV4T2YoJ2RhdGE6JykgPT09IDApIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuICBpZiAoYmFzZSAmJiAhb3JpZ2luSW5kZXBlbmRlbnRVcmwudGVzdChocmVmKSkge1xuICAgIGhyZWYgPSByZXNvbHZlVXJsKGJhc2UsIGhyZWYpO1xuICB9XG4gIHRyeSB7XG4gICAgaHJlZiA9IGVuY29kZVVSSShocmVmKS5yZXBsYWNlKC8lMjUvZywgJyUnKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIHJldHVybiBocmVmO1xufVxuXG5jb25zdCBiYXNlVXJscyA9IHt9O1xuY29uc3QganVzdERvbWFpbiA9IC9eW146XSs6XFwvKlteL10qJC87XG5jb25zdCBwcm90b2NvbCA9IC9eKFteOl0rOilbXFxzXFxTXSokLztcbmNvbnN0IGRvbWFpbiA9IC9eKFteOl0rOlxcLypbXi9dKilbXFxzXFxTXSokLztcblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30gYmFzZVxuICogQHBhcmFtIHtzdHJpbmd9IGhyZWZcbiAqL1xuZnVuY3Rpb24gcmVzb2x2ZVVybChiYXNlLCBocmVmKSB7XG4gIGlmICghYmFzZVVybHNbJyAnICsgYmFzZV0pIHtcbiAgICAvLyB3ZSBjYW4gaWdub3JlIGV2ZXJ5dGhpbmcgaW4gYmFzZSBhZnRlciB0aGUgbGFzdCBzbGFzaCBvZiBpdHMgcGF0aCBjb21wb25lbnQsXG4gICAgLy8gYnV0IHdlIG1pZ2h0IG5lZWQgdG8gYWRkIF90aGF0X1xuICAgIC8vIGh0dHBzOi8vdG9vbHMuaWV0Zi5vcmcvaHRtbC9yZmMzOTg2I3NlY3Rpb24tM1xuICAgIGlmIChqdXN0RG9tYWluLnRlc3QoYmFzZSkpIHtcbiAgICAgIGJhc2VVcmxzWycgJyArIGJhc2VdID0gYmFzZSArICcvJztcbiAgICB9IGVsc2Uge1xuICAgICAgYmFzZVVybHNbJyAnICsgYmFzZV0gPSBydHJpbShiYXNlLCAnLycsIHRydWUpO1xuICAgIH1cbiAgfVxuICBiYXNlID0gYmFzZVVybHNbJyAnICsgYmFzZV07XG4gIGNvbnN0IHJlbGF0aXZlQmFzZSA9IGJhc2UuaW5kZXhPZignOicpID09PSAtMTtcblxuICBpZiAoaHJlZi5zdWJzdHJpbmcoMCwgMikgPT09ICcvLycpIHtcbiAgICBpZiAocmVsYXRpdmVCYXNlKSB7XG4gICAgICByZXR1cm4gaHJlZjtcbiAgICB9XG4gICAgcmV0dXJuIGJhc2UucmVwbGFjZShwcm90b2NvbCwgJyQxJykgKyBocmVmO1xuICB9IGVsc2UgaWYgKGhyZWYuY2hhckF0KDApID09PSAnLycpIHtcbiAgICBpZiAocmVsYXRpdmVCYXNlKSB7XG4gICAgICByZXR1cm4gaHJlZjtcbiAgICB9XG4gICAgcmV0dXJuIGJhc2UucmVwbGFjZShkb21haW4sICckMScpICsgaHJlZjtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gYmFzZSArIGhyZWY7XG4gIH1cbn1cblxuY29uc3Qgbm9vcFRlc3QgPSB7IGV4ZWM6IGZ1bmN0aW9uIG5vb3BUZXN0KCkge30gfTtcblxuZnVuY3Rpb24gc3BsaXRDZWxscyh0YWJsZVJvdywgY291bnQpIHtcbiAgLy8gZW5zdXJlIHRoYXQgZXZlcnkgY2VsbC1kZWxpbWl0aW5nIHBpcGUgaGFzIGEgc3BhY2VcbiAgLy8gYmVmb3JlIGl0IHRvIGRpc3Rpbmd1aXNoIGl0IGZyb20gYW4gZXNjYXBlZCBwaXBlXG4gIGNvbnN0IHJvdyA9IHRhYmxlUm93LnJlcGxhY2UoL1xcfC9nLCAobWF0Y2gsIG9mZnNldCwgc3RyKSA9PiB7XG4gICAgICBsZXQgZXNjYXBlZCA9IGZhbHNlLFxuICAgICAgICBjdXJyID0gb2Zmc2V0O1xuICAgICAgd2hpbGUgKC0tY3VyciA+PSAwICYmIHN0cltjdXJyXSA9PT0gJ1xcXFwnKSBlc2NhcGVkID0gIWVzY2FwZWQ7XG4gICAgICBpZiAoZXNjYXBlZCkge1xuICAgICAgICAvLyBvZGQgbnVtYmVyIG9mIHNsYXNoZXMgbWVhbnMgfCBpcyBlc2NhcGVkXG4gICAgICAgIC8vIHNvIHdlIGxlYXZlIGl0IGFsb25lXG4gICAgICAgIHJldHVybiAnfCc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBhZGQgc3BhY2UgYmVmb3JlIHVuZXNjYXBlZCB8XG4gICAgICAgIHJldHVybiAnIHwnO1xuICAgICAgfVxuICAgIH0pLFxuICAgIGNlbGxzID0gcm93LnNwbGl0KC8gXFx8Lyk7XG4gIGxldCBpID0gMDtcblxuICAvLyBGaXJzdC9sYXN0IGNlbGwgaW4gYSByb3cgY2Fubm90IGJlIGVtcHR5IGlmIGl0IGhhcyBubyBsZWFkaW5nL3RyYWlsaW5nIHBpcGVcbiAgaWYgKCFjZWxsc1swXS50cmltKCkpIHsgY2VsbHMuc2hpZnQoKTsgfVxuICBpZiAoY2VsbHMubGVuZ3RoID4gMCAmJiAhY2VsbHNbY2VsbHMubGVuZ3RoIC0gMV0udHJpbSgpKSB7IGNlbGxzLnBvcCgpOyB9XG5cbiAgaWYgKGNlbGxzLmxlbmd0aCA+IGNvdW50KSB7XG4gICAgY2VsbHMuc3BsaWNlKGNvdW50KTtcbiAgfSBlbHNlIHtcbiAgICB3aGlsZSAoY2VsbHMubGVuZ3RoIDwgY291bnQpIGNlbGxzLnB1c2goJycpO1xuICB9XG5cbiAgZm9yICg7IGkgPCBjZWxscy5sZW5ndGg7IGkrKykge1xuICAgIC8vIGxlYWRpbmcgb3IgdHJhaWxpbmcgd2hpdGVzcGFjZSBpcyBpZ25vcmVkIHBlciB0aGUgZ2ZtIHNwZWNcbiAgICBjZWxsc1tpXSA9IGNlbGxzW2ldLnRyaW0oKS5yZXBsYWNlKC9cXFxcXFx8L2csICd8Jyk7XG4gIH1cbiAgcmV0dXJuIGNlbGxzO1xufVxuXG4vKipcbiAqIFJlbW92ZSB0cmFpbGluZyAnYydzLiBFcXVpdmFsZW50IHRvIHN0ci5yZXBsYWNlKC9jKiQvLCAnJykuXG4gKiAvYyokLyBpcyB2dWxuZXJhYmxlIHRvIFJFRE9TLlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdHJcbiAqIEBwYXJhbSB7c3RyaW5nfSBjXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGludmVydCBSZW1vdmUgc3VmZml4IG9mIG5vbi1jIGNoYXJzIGluc3RlYWQuIERlZmF1bHQgZmFsc2V5LlxuICovXG5mdW5jdGlvbiBydHJpbShzdHIsIGMsIGludmVydCkge1xuICBjb25zdCBsID0gc3RyLmxlbmd0aDtcbiAgaWYgKGwgPT09IDApIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cblxuICAvLyBMZW5ndGggb2Ygc3VmZml4IG1hdGNoaW5nIHRoZSBpbnZlcnQgY29uZGl0aW9uLlxuICBsZXQgc3VmZkxlbiA9IDA7XG5cbiAgLy8gU3RlcCBsZWZ0IHVudGlsIHdlIGZhaWwgdG8gbWF0Y2ggdGhlIGludmVydCBjb25kaXRpb24uXG4gIHdoaWxlIChzdWZmTGVuIDwgbCkge1xuICAgIGNvbnN0IGN1cnJDaGFyID0gc3RyLmNoYXJBdChsIC0gc3VmZkxlbiAtIDEpO1xuICAgIGlmIChjdXJyQ2hhciA9PT0gYyAmJiAhaW52ZXJ0KSB7XG4gICAgICBzdWZmTGVuKys7XG4gICAgfSBlbHNlIGlmIChjdXJyQ2hhciAhPT0gYyAmJiBpbnZlcnQpIHtcbiAgICAgIHN1ZmZMZW4rKztcbiAgICB9IGVsc2Uge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHN0ci5zbGljZSgwLCBsIC0gc3VmZkxlbik7XG59XG5cbmZ1bmN0aW9uIGZpbmRDbG9zaW5nQnJhY2tldChzdHIsIGIpIHtcbiAgaWYgKHN0ci5pbmRleE9mKGJbMV0pID09PSAtMSkge1xuICAgIHJldHVybiAtMTtcbiAgfVxuICBjb25zdCBsID0gc3RyLmxlbmd0aDtcbiAgbGV0IGxldmVsID0gMCxcbiAgICBpID0gMDtcbiAgZm9yICg7IGkgPCBsOyBpKyspIHtcbiAgICBpZiAoc3RyW2ldID09PSAnXFxcXCcpIHtcbiAgICAgIGkrKztcbiAgICB9IGVsc2UgaWYgKHN0cltpXSA9PT0gYlswXSkge1xuICAgICAgbGV2ZWwrKztcbiAgICB9IGVsc2UgaWYgKHN0cltpXSA9PT0gYlsxXSkge1xuICAgICAgbGV2ZWwtLTtcbiAgICAgIGlmIChsZXZlbCA8IDApIHtcbiAgICAgICAgcmV0dXJuIGk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiAtMTtcbn1cblxuZnVuY3Rpb24gY2hlY2tTYW5pdGl6ZURlcHJlY2F0aW9uKG9wdCkge1xuICBpZiAob3B0ICYmIG9wdC5zYW5pdGl6ZSAmJiAhb3B0LnNpbGVudCkge1xuICAgIGNvbnNvbGUud2FybignbWFya2VkKCk6IHNhbml0aXplIGFuZCBzYW5pdGl6ZXIgcGFyYW1ldGVycyBhcmUgZGVwcmVjYXRlZCBzaW5jZSB2ZXJzaW9uIDAuNy4wLCBzaG91bGQgbm90IGJlIHVzZWQgYW5kIHdpbGwgYmUgcmVtb3ZlZCBpbiB0aGUgZnV0dXJlLiBSZWFkIG1vcmUgaGVyZTogaHR0cHM6Ly9tYXJrZWQuanMub3JnLyMvVVNJTkdfQURWQU5DRUQubWQjb3B0aW9ucycpO1xuICB9XG59XG5cbi8vIGNvcGllZCBmcm9tIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vYS81NDUwMTEzLzgwNjc3N1xuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30gcGF0dGVyblxuICogQHBhcmFtIHtudW1iZXJ9IGNvdW50XG4gKi9cbmZ1bmN0aW9uIHJlcGVhdFN0cmluZyhwYXR0ZXJuLCBjb3VudCkge1xuICBpZiAoY291bnQgPCAxKSB7XG4gICAgcmV0dXJuICcnO1xuICB9XG4gIGxldCByZXN1bHQgPSAnJztcbiAgd2hpbGUgKGNvdW50ID4gMSkge1xuICAgIGlmIChjb3VudCAmIDEpIHtcbiAgICAgIHJlc3VsdCArPSBwYXR0ZXJuO1xuICAgIH1cbiAgICBjb3VudCA+Pj0gMTtcbiAgICBwYXR0ZXJuICs9IHBhdHRlcm47XG4gIH1cbiAgcmV0dXJuIHJlc3VsdCArIHBhdHRlcm47XG59XG5cbmZ1bmN0aW9uIG91dHB1dExpbmsoY2FwLCBsaW5rLCByYXcsIGxleGVyKSB7XG4gIGNvbnN0IGhyZWYgPSBsaW5rLmhyZWY7XG4gIGNvbnN0IHRpdGxlID0gbGluay50aXRsZSA/IGVzY2FwZShsaW5rLnRpdGxlKSA6IG51bGw7XG4gIGNvbnN0IHRleHQgPSBjYXBbMV0ucmVwbGFjZSgvXFxcXChbXFxbXFxdXSkvZywgJyQxJyk7XG5cbiAgaWYgKGNhcFswXS5jaGFyQXQoMCkgIT09ICchJykge1xuICAgIGxleGVyLnN0YXRlLmluTGluayA9IHRydWU7XG4gICAgY29uc3QgdG9rZW4gPSB7XG4gICAgICB0eXBlOiAnbGluaycsXG4gICAgICByYXcsXG4gICAgICBocmVmLFxuICAgICAgdGl0bGUsXG4gICAgICB0ZXh0LFxuICAgICAgdG9rZW5zOiBsZXhlci5pbmxpbmVUb2tlbnModGV4dClcbiAgICB9O1xuICAgIGxleGVyLnN0YXRlLmluTGluayA9IGZhbHNlO1xuICAgIHJldHVybiB0b2tlbjtcbiAgfVxuICByZXR1cm4ge1xuICAgIHR5cGU6ICdpbWFnZScsXG4gICAgcmF3LFxuICAgIGhyZWYsXG4gICAgdGl0bGUsXG4gICAgdGV4dDogZXNjYXBlKHRleHQpXG4gIH07XG59XG5cbmZ1bmN0aW9uIGluZGVudENvZGVDb21wZW5zYXRpb24ocmF3LCB0ZXh0KSB7XG4gIGNvbnN0IG1hdGNoSW5kZW50VG9Db2RlID0gcmF3Lm1hdGNoKC9eKFxccyspKD86YGBgKS8pO1xuXG4gIGlmIChtYXRjaEluZGVudFRvQ29kZSA9PT0gbnVsbCkge1xuICAgIHJldHVybiB0ZXh0O1xuICB9XG5cbiAgY29uc3QgaW5kZW50VG9Db2RlID0gbWF0Y2hJbmRlbnRUb0NvZGVbMV07XG5cbiAgcmV0dXJuIHRleHRcbiAgICAuc3BsaXQoJ1xcbicpXG4gICAgLm1hcChub2RlID0+IHtcbiAgICAgIGNvbnN0IG1hdGNoSW5kZW50SW5Ob2RlID0gbm9kZS5tYXRjaCgvXlxccysvKTtcbiAgICAgIGlmIChtYXRjaEluZGVudEluTm9kZSA9PT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gbm9kZTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgW2luZGVudEluTm9kZV0gPSBtYXRjaEluZGVudEluTm9kZTtcblxuICAgICAgaWYgKGluZGVudEluTm9kZS5sZW5ndGggPj0gaW5kZW50VG9Db2RlLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gbm9kZS5zbGljZShpbmRlbnRUb0NvZGUubGVuZ3RoKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG5vZGU7XG4gICAgfSlcbiAgICAuam9pbignXFxuJyk7XG59XG5cbi8qKlxuICogVG9rZW5pemVyXG4gKi9cbmNsYXNzIFRva2VuaXplciB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IGRlZmF1bHRzO1xuICB9XG5cbiAgc3BhY2Uoc3JjKSB7XG4gICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5ibG9jay5uZXdsaW5lLmV4ZWMoc3JjKTtcbiAgICBpZiAoY2FwICYmIGNhcFswXS5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAnc3BhY2UnLFxuICAgICAgICByYXc6IGNhcFswXVxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICBjb2RlKHNyYykge1xuICAgIGNvbnN0IGNhcCA9IHRoaXMucnVsZXMuYmxvY2suY29kZS5leGVjKHNyYyk7XG4gICAgaWYgKGNhcCkge1xuICAgICAgY29uc3QgdGV4dCA9IGNhcFswXS5yZXBsYWNlKC9eIHsxLDR9L2dtLCAnJyk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAnY29kZScsXG4gICAgICAgIHJhdzogY2FwWzBdLFxuICAgICAgICBjb2RlQmxvY2tTdHlsZTogJ2luZGVudGVkJyxcbiAgICAgICAgdGV4dDogIXRoaXMub3B0aW9ucy5wZWRhbnRpY1xuICAgICAgICAgID8gcnRyaW0odGV4dCwgJ1xcbicpXG4gICAgICAgICAgOiB0ZXh0XG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIGZlbmNlcyhzcmMpIHtcbiAgICBjb25zdCBjYXAgPSB0aGlzLnJ1bGVzLmJsb2NrLmZlbmNlcy5leGVjKHNyYyk7XG4gICAgaWYgKGNhcCkge1xuICAgICAgY29uc3QgcmF3ID0gY2FwWzBdO1xuICAgICAgY29uc3QgdGV4dCA9IGluZGVudENvZGVDb21wZW5zYXRpb24ocmF3LCBjYXBbM10gfHwgJycpO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAnY29kZScsXG4gICAgICAgIHJhdyxcbiAgICAgICAgbGFuZzogY2FwWzJdID8gY2FwWzJdLnRyaW0oKS5yZXBsYWNlKHRoaXMucnVsZXMuaW5saW5lLl9lc2NhcGVzLCAnJDEnKSA6IGNhcFsyXSxcbiAgICAgICAgdGV4dFxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICBoZWFkaW5nKHNyYykge1xuICAgIGNvbnN0IGNhcCA9IHRoaXMucnVsZXMuYmxvY2suaGVhZGluZy5leGVjKHNyYyk7XG4gICAgaWYgKGNhcCkge1xuICAgICAgbGV0IHRleHQgPSBjYXBbMl0udHJpbSgpO1xuXG4gICAgICAvLyByZW1vdmUgdHJhaWxpbmcgI3NcbiAgICAgIGlmICgvIyQvLnRlc3QodGV4dCkpIHtcbiAgICAgICAgY29uc3QgdHJpbW1lZCA9IHJ0cmltKHRleHQsICcjJyk7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMucGVkYW50aWMpIHtcbiAgICAgICAgICB0ZXh0ID0gdHJpbW1lZC50cmltKCk7XG4gICAgICAgIH0gZWxzZSBpZiAoIXRyaW1tZWQgfHwgLyAkLy50ZXN0KHRyaW1tZWQpKSB7XG4gICAgICAgICAgLy8gQ29tbW9uTWFyayByZXF1aXJlcyBzcGFjZSBiZWZvcmUgdHJhaWxpbmcgI3NcbiAgICAgICAgICB0ZXh0ID0gdHJpbW1lZC50cmltKCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ2hlYWRpbmcnLFxuICAgICAgICByYXc6IGNhcFswXSxcbiAgICAgICAgZGVwdGg6IGNhcFsxXS5sZW5ndGgsXG4gICAgICAgIHRleHQsXG4gICAgICAgIHRva2VuczogdGhpcy5sZXhlci5pbmxpbmUodGV4dClcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgaHIoc3JjKSB7XG4gICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5ibG9jay5oci5leGVjKHNyYyk7XG4gICAgaWYgKGNhcCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ2hyJyxcbiAgICAgICAgcmF3OiBjYXBbMF1cbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgYmxvY2txdW90ZShzcmMpIHtcbiAgICBjb25zdCBjYXAgPSB0aGlzLnJ1bGVzLmJsb2NrLmJsb2NrcXVvdGUuZXhlYyhzcmMpO1xuICAgIGlmIChjYXApIHtcbiAgICAgIGNvbnN0IHRleHQgPSBjYXBbMF0ucmVwbGFjZSgvXiAqPlsgXFx0XT8vZ20sICcnKTtcbiAgICAgIGNvbnN0IHRvcCA9IHRoaXMubGV4ZXIuc3RhdGUudG9wO1xuICAgICAgdGhpcy5sZXhlci5zdGF0ZS50b3AgPSB0cnVlO1xuICAgICAgY29uc3QgdG9rZW5zID0gdGhpcy5sZXhlci5ibG9ja1Rva2Vucyh0ZXh0KTtcbiAgICAgIHRoaXMubGV4ZXIuc3RhdGUudG9wID0gdG9wO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ2Jsb2NrcXVvdGUnLFxuICAgICAgICByYXc6IGNhcFswXSxcbiAgICAgICAgdG9rZW5zLFxuICAgICAgICB0ZXh0XG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIGxpc3Qoc3JjKSB7XG4gICAgbGV0IGNhcCA9IHRoaXMucnVsZXMuYmxvY2subGlzdC5leGVjKHNyYyk7XG4gICAgaWYgKGNhcCkge1xuICAgICAgbGV0IHJhdywgaXN0YXNrLCBpc2NoZWNrZWQsIGluZGVudCwgaSwgYmxhbmtMaW5lLCBlbmRzV2l0aEJsYW5rTGluZSxcbiAgICAgICAgbGluZSwgbmV4dExpbmUsIHJhd0xpbmUsIGl0ZW1Db250ZW50cywgZW5kRWFybHk7XG5cbiAgICAgIGxldCBidWxsID0gY2FwWzFdLnRyaW0oKTtcbiAgICAgIGNvbnN0IGlzb3JkZXJlZCA9IGJ1bGwubGVuZ3RoID4gMTtcblxuICAgICAgY29uc3QgbGlzdCA9IHtcbiAgICAgICAgdHlwZTogJ2xpc3QnLFxuICAgICAgICByYXc6ICcnLFxuICAgICAgICBvcmRlcmVkOiBpc29yZGVyZWQsXG4gICAgICAgIHN0YXJ0OiBpc29yZGVyZWQgPyArYnVsbC5zbGljZSgwLCAtMSkgOiAnJyxcbiAgICAgICAgbG9vc2U6IGZhbHNlLFxuICAgICAgICBpdGVtczogW11cbiAgICAgIH07XG5cbiAgICAgIGJ1bGwgPSBpc29yZGVyZWQgPyBgXFxcXGR7MSw5fVxcXFwke2J1bGwuc2xpY2UoLTEpfWAgOiBgXFxcXCR7YnVsbH1gO1xuXG4gICAgICBpZiAodGhpcy5vcHRpb25zLnBlZGFudGljKSB7XG4gICAgICAgIGJ1bGwgPSBpc29yZGVyZWQgPyBidWxsIDogJ1sqKy1dJztcbiAgICAgIH1cblxuICAgICAgLy8gR2V0IG5leHQgbGlzdCBpdGVtXG4gICAgICBjb25zdCBpdGVtUmVnZXggPSBuZXcgUmVnRXhwKGBeKCB7MCwzfSR7YnVsbH0pKCg/OltcXHQgXVteXFxcXG5dKik/KD86XFxcXG58JCkpYCk7XG5cbiAgICAgIC8vIENoZWNrIGlmIGN1cnJlbnQgYnVsbGV0IHBvaW50IGNhbiBzdGFydCBhIG5ldyBMaXN0IEl0ZW1cbiAgICAgIHdoaWxlIChzcmMpIHtcbiAgICAgICAgZW5kRWFybHkgPSBmYWxzZTtcbiAgICAgICAgaWYgKCEoY2FwID0gaXRlbVJlZ2V4LmV4ZWMoc3JjKSkpIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnJ1bGVzLmJsb2NrLmhyLnRlc3Qoc3JjKSkgeyAvLyBFbmQgbGlzdCBpZiBidWxsZXQgd2FzIGFjdHVhbGx5IEhSIChwb3NzaWJseSBtb3ZlIGludG8gaXRlbVJlZ2V4PylcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIHJhdyA9IGNhcFswXTtcbiAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhyYXcubGVuZ3RoKTtcblxuICAgICAgICBsaW5lID0gY2FwWzJdLnNwbGl0KCdcXG4nLCAxKVswXS5yZXBsYWNlKC9eXFx0Ky8sICh0KSA9PiAnICcucmVwZWF0KDMgKiB0Lmxlbmd0aCkpO1xuICAgICAgICBuZXh0TGluZSA9IHNyYy5zcGxpdCgnXFxuJywgMSlbMF07XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5wZWRhbnRpYykge1xuICAgICAgICAgIGluZGVudCA9IDI7XG4gICAgICAgICAgaXRlbUNvbnRlbnRzID0gbGluZS50cmltTGVmdCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGluZGVudCA9IGNhcFsyXS5zZWFyY2goL1teIF0vKTsgLy8gRmluZCBmaXJzdCBub24tc3BhY2UgY2hhclxuICAgICAgICAgIGluZGVudCA9IGluZGVudCA+IDQgPyAxIDogaW5kZW50OyAvLyBUcmVhdCBpbmRlbnRlZCBjb2RlIGJsb2NrcyAoPiA0IHNwYWNlcykgYXMgaGF2aW5nIG9ubHkgMSBpbmRlbnRcbiAgICAgICAgICBpdGVtQ29udGVudHMgPSBsaW5lLnNsaWNlKGluZGVudCk7XG4gICAgICAgICAgaW5kZW50ICs9IGNhcFsxXS5sZW5ndGg7XG4gICAgICAgIH1cblxuICAgICAgICBibGFua0xpbmUgPSBmYWxzZTtcblxuICAgICAgICBpZiAoIWxpbmUgJiYgL14gKiQvLnRlc3QobmV4dExpbmUpKSB7IC8vIEl0ZW1zIGJlZ2luIHdpdGggYXQgbW9zdCBvbmUgYmxhbmsgbGluZVxuICAgICAgICAgIHJhdyArPSBuZXh0TGluZSArICdcXG4nO1xuICAgICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcobmV4dExpbmUubGVuZ3RoICsgMSk7XG4gICAgICAgICAgZW5kRWFybHkgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFlbmRFYXJseSkge1xuICAgICAgICAgIGNvbnN0IG5leHRCdWxsZXRSZWdleCA9IG5ldyBSZWdFeHAoYF4gezAsJHtNYXRoLm1pbigzLCBpbmRlbnQgLSAxKX19KD86WyorLV18XFxcXGR7MSw5fVsuKV0pKCg/OlsgXFx0XVteXFxcXG5dKik/KD86XFxcXG58JCkpYCk7XG4gICAgICAgICAgY29uc3QgaHJSZWdleCA9IG5ldyBSZWdFeHAoYF4gezAsJHtNYXRoLm1pbigzLCBpbmRlbnQgLSAxKX19KCg/Oi0gKil7Myx9fCg/Ol8gKil7Myx9fCg/OlxcXFwqICopezMsfSkoPzpcXFxcbit8JClgKTtcbiAgICAgICAgICBjb25zdCBmZW5jZXNCZWdpblJlZ2V4ID0gbmV3IFJlZ0V4cChgXiB7MCwke01hdGgubWluKDMsIGluZGVudCAtIDEpfX0oPzpcXGBcXGBcXGB8fn5+KWApO1xuICAgICAgICAgIGNvbnN0IGhlYWRpbmdCZWdpblJlZ2V4ID0gbmV3IFJlZ0V4cChgXiB7MCwke01hdGgubWluKDMsIGluZGVudCAtIDEpfX0jYCk7XG5cbiAgICAgICAgICAvLyBDaGVjayBpZiBmb2xsb3dpbmcgbGluZXMgc2hvdWxkIGJlIGluY2x1ZGVkIGluIExpc3QgSXRlbVxuICAgICAgICAgIHdoaWxlIChzcmMpIHtcbiAgICAgICAgICAgIHJhd0xpbmUgPSBzcmMuc3BsaXQoJ1xcbicsIDEpWzBdO1xuICAgICAgICAgICAgbmV4dExpbmUgPSByYXdMaW5lO1xuXG4gICAgICAgICAgICAvLyBSZS1hbGlnbiB0byBmb2xsb3cgY29tbW9ubWFyayBuZXN0aW5nIHJ1bGVzXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnBlZGFudGljKSB7XG4gICAgICAgICAgICAgIG5leHRMaW5lID0gbmV4dExpbmUucmVwbGFjZSgvXiB7MSw0fSg/PSggezR9KSpbXiBdKS9nLCAnICAnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gRW5kIGxpc3QgaXRlbSBpZiBmb3VuZCBjb2RlIGZlbmNlc1xuICAgICAgICAgICAgaWYgKGZlbmNlc0JlZ2luUmVnZXgudGVzdChuZXh0TGluZSkpIHtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEVuZCBsaXN0IGl0ZW0gaWYgZm91bmQgc3RhcnQgb2YgbmV3IGhlYWRpbmdcbiAgICAgICAgICAgIGlmIChoZWFkaW5nQmVnaW5SZWdleC50ZXN0KG5leHRMaW5lKSkge1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gRW5kIGxpc3QgaXRlbSBpZiBmb3VuZCBzdGFydCBvZiBuZXcgYnVsbGV0XG4gICAgICAgICAgICBpZiAobmV4dEJ1bGxldFJlZ2V4LnRlc3QobmV4dExpbmUpKSB7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBIb3Jpem9udGFsIHJ1bGUgZm91bmRcbiAgICAgICAgICAgIGlmIChoclJlZ2V4LnRlc3Qoc3JjKSkge1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG5leHRMaW5lLnNlYXJjaCgvW14gXS8pID49IGluZGVudCB8fCAhbmV4dExpbmUudHJpbSgpKSB7IC8vIERlZGVudCBpZiBwb3NzaWJsZVxuICAgICAgICAgICAgICBpdGVtQ29udGVudHMgKz0gJ1xcbicgKyBuZXh0TGluZS5zbGljZShpbmRlbnQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gbm90IGVub3VnaCBpbmRlbnRhdGlvblxuICAgICAgICAgICAgICBpZiAoYmxhbmtMaW5lKSB7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAvLyBwYXJhZ3JhcGggY29udGludWF0aW9uIHVubGVzcyBsYXN0IGxpbmUgd2FzIGEgZGlmZmVyZW50IGJsb2NrIGxldmVsIGVsZW1lbnRcbiAgICAgICAgICAgICAgaWYgKGxpbmUuc2VhcmNoKC9bXiBdLykgPj0gNCkgeyAvLyBpbmRlbnRlZCBjb2RlIGJsb2NrXG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWYgKGZlbmNlc0JlZ2luUmVnZXgudGVzdChsaW5lKSkge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmIChoZWFkaW5nQmVnaW5SZWdleC50ZXN0KGxpbmUpKSB7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWYgKGhyUmVnZXgudGVzdChsaW5lKSkge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgaXRlbUNvbnRlbnRzICs9ICdcXG4nICsgbmV4dExpbmU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghYmxhbmtMaW5lICYmICFuZXh0TGluZS50cmltKCkpIHsgLy8gQ2hlY2sgaWYgY3VycmVudCBsaW5lIGlzIGJsYW5rXG4gICAgICAgICAgICAgIGJsYW5rTGluZSA9IHRydWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJhdyArPSByYXdMaW5lICsgJ1xcbic7XG4gICAgICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHJhd0xpbmUubGVuZ3RoICsgMSk7XG4gICAgICAgICAgICBsaW5lID0gbmV4dExpbmUuc2xpY2UoaW5kZW50KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWxpc3QubG9vc2UpIHtcbiAgICAgICAgICAvLyBJZiB0aGUgcHJldmlvdXMgaXRlbSBlbmRlZCB3aXRoIGEgYmxhbmsgbGluZSwgdGhlIGxpc3QgaXMgbG9vc2VcbiAgICAgICAgICBpZiAoZW5kc1dpdGhCbGFua0xpbmUpIHtcbiAgICAgICAgICAgIGxpc3QubG9vc2UgPSB0cnVlO1xuICAgICAgICAgIH0gZWxzZSBpZiAoL1xcbiAqXFxuICokLy50ZXN0KHJhdykpIHtcbiAgICAgICAgICAgIGVuZHNXaXRoQmxhbmtMaW5lID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDaGVjayBmb3IgdGFzayBsaXN0IGl0ZW1zXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuZ2ZtKSB7XG4gICAgICAgICAgaXN0YXNrID0gL15cXFtbIHhYXVxcXSAvLmV4ZWMoaXRlbUNvbnRlbnRzKTtcbiAgICAgICAgICBpZiAoaXN0YXNrKSB7XG4gICAgICAgICAgICBpc2NoZWNrZWQgPSBpc3Rhc2tbMF0gIT09ICdbIF0gJztcbiAgICAgICAgICAgIGl0ZW1Db250ZW50cyA9IGl0ZW1Db250ZW50cy5yZXBsYWNlKC9eXFxbWyB4WF1cXF0gKy8sICcnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBsaXN0Lml0ZW1zLnB1c2goe1xuICAgICAgICAgIHR5cGU6ICdsaXN0X2l0ZW0nLFxuICAgICAgICAgIHJhdyxcbiAgICAgICAgICB0YXNrOiAhIWlzdGFzayxcbiAgICAgICAgICBjaGVja2VkOiBpc2NoZWNrZWQsXG4gICAgICAgICAgbG9vc2U6IGZhbHNlLFxuICAgICAgICAgIHRleHQ6IGl0ZW1Db250ZW50c1xuICAgICAgICB9KTtcblxuICAgICAgICBsaXN0LnJhdyArPSByYXc7XG4gICAgICB9XG5cbiAgICAgIC8vIERvIG5vdCBjb25zdW1lIG5ld2xpbmVzIGF0IGVuZCBvZiBmaW5hbCBpdGVtLiBBbHRlcm5hdGl2ZWx5LCBtYWtlIGl0ZW1SZWdleCAqc3RhcnQqIHdpdGggYW55IG5ld2xpbmVzIHRvIHNpbXBsaWZ5L3NwZWVkIHVwIGVuZHNXaXRoQmxhbmtMaW5lIGxvZ2ljXG4gICAgICBsaXN0Lml0ZW1zW2xpc3QuaXRlbXMubGVuZ3RoIC0gMV0ucmF3ID0gcmF3LnRyaW1SaWdodCgpO1xuICAgICAgbGlzdC5pdGVtc1tsaXN0Lml0ZW1zLmxlbmd0aCAtIDFdLnRleHQgPSBpdGVtQ29udGVudHMudHJpbVJpZ2h0KCk7XG4gICAgICBsaXN0LnJhdyA9IGxpc3QucmF3LnRyaW1SaWdodCgpO1xuXG4gICAgICBjb25zdCBsID0gbGlzdC5pdGVtcy5sZW5ndGg7XG5cbiAgICAgIC8vIEl0ZW0gY2hpbGQgdG9rZW5zIGhhbmRsZWQgaGVyZSBhdCBlbmQgYmVjYXVzZSB3ZSBuZWVkZWQgdG8gaGF2ZSB0aGUgZmluYWwgaXRlbSB0byB0cmltIGl0IGZpcnN0XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIHRoaXMubGV4ZXIuc3RhdGUudG9wID0gZmFsc2U7XG4gICAgICAgIGxpc3QuaXRlbXNbaV0udG9rZW5zID0gdGhpcy5sZXhlci5ibG9ja1Rva2VucyhsaXN0Lml0ZW1zW2ldLnRleHQsIFtdKTtcblxuICAgICAgICBpZiAoIWxpc3QubG9vc2UpIHtcbiAgICAgICAgICAvLyBDaGVjayBpZiBsaXN0IHNob3VsZCBiZSBsb29zZVxuICAgICAgICAgIGNvbnN0IHNwYWNlcnMgPSBsaXN0Lml0ZW1zW2ldLnRva2Vucy5maWx0ZXIodCA9PiB0LnR5cGUgPT09ICdzcGFjZScpO1xuICAgICAgICAgIGNvbnN0IGhhc011bHRpcGxlTGluZUJyZWFrcyA9IHNwYWNlcnMubGVuZ3RoID4gMCAmJiBzcGFjZXJzLnNvbWUodCA9PiAvXFxuLipcXG4vLnRlc3QodC5yYXcpKTtcblxuICAgICAgICAgIGxpc3QubG9vc2UgPSBoYXNNdWx0aXBsZUxpbmVCcmVha3M7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gU2V0IGFsbCBpdGVtcyB0byBsb29zZSBpZiBsaXN0IGlzIGxvb3NlXG4gICAgICBpZiAobGlzdC5sb29zZSkge1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgbGlzdC5pdGVtc1tpXS5sb29zZSA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGxpc3Q7XG4gICAgfVxuICB9XG5cbiAgaHRtbChzcmMpIHtcbiAgICBjb25zdCBjYXAgPSB0aGlzLnJ1bGVzLmJsb2NrLmh0bWwuZXhlYyhzcmMpO1xuICAgIGlmIChjYXApIHtcbiAgICAgIGNvbnN0IHRva2VuID0ge1xuICAgICAgICB0eXBlOiAnaHRtbCcsXG4gICAgICAgIHJhdzogY2FwWzBdLFxuICAgICAgICBwcmU6ICF0aGlzLm9wdGlvbnMuc2FuaXRpemVyXG4gICAgICAgICAgJiYgKGNhcFsxXSA9PT0gJ3ByZScgfHwgY2FwWzFdID09PSAnc2NyaXB0JyB8fCBjYXBbMV0gPT09ICdzdHlsZScpLFxuICAgICAgICB0ZXh0OiBjYXBbMF1cbiAgICAgIH07XG4gICAgICBpZiAodGhpcy5vcHRpb25zLnNhbml0aXplKSB7XG4gICAgICAgIGNvbnN0IHRleHQgPSB0aGlzLm9wdGlvbnMuc2FuaXRpemVyID8gdGhpcy5vcHRpb25zLnNhbml0aXplcihjYXBbMF0pIDogZXNjYXBlKGNhcFswXSk7XG4gICAgICAgIHRva2VuLnR5cGUgPSAncGFyYWdyYXBoJztcbiAgICAgICAgdG9rZW4udGV4dCA9IHRleHQ7XG4gICAgICAgIHRva2VuLnRva2VucyA9IHRoaXMubGV4ZXIuaW5saW5lKHRleHQpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRva2VuO1xuICAgIH1cbiAgfVxuXG4gIGRlZihzcmMpIHtcbiAgICBjb25zdCBjYXAgPSB0aGlzLnJ1bGVzLmJsb2NrLmRlZi5leGVjKHNyYyk7XG4gICAgaWYgKGNhcCkge1xuICAgICAgY29uc3QgdGFnID0gY2FwWzFdLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvXFxzKy9nLCAnICcpO1xuICAgICAgY29uc3QgaHJlZiA9IGNhcFsyXSA/IGNhcFsyXS5yZXBsYWNlKC9ePCguKik+JC8sICckMScpLnJlcGxhY2UodGhpcy5ydWxlcy5pbmxpbmUuX2VzY2FwZXMsICckMScpIDogJyc7XG4gICAgICBjb25zdCB0aXRsZSA9IGNhcFszXSA/IGNhcFszXS5zdWJzdHJpbmcoMSwgY2FwWzNdLmxlbmd0aCAtIDEpLnJlcGxhY2UodGhpcy5ydWxlcy5pbmxpbmUuX2VzY2FwZXMsICckMScpIDogY2FwWzNdO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ2RlZicsXG4gICAgICAgIHRhZyxcbiAgICAgICAgcmF3OiBjYXBbMF0sXG4gICAgICAgIGhyZWYsXG4gICAgICAgIHRpdGxlXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIHRhYmxlKHNyYykge1xuICAgIGNvbnN0IGNhcCA9IHRoaXMucnVsZXMuYmxvY2sudGFibGUuZXhlYyhzcmMpO1xuICAgIGlmIChjYXApIHtcbiAgICAgIGNvbnN0IGl0ZW0gPSB7XG4gICAgICAgIHR5cGU6ICd0YWJsZScsXG4gICAgICAgIGhlYWRlcjogc3BsaXRDZWxscyhjYXBbMV0pLm1hcChjID0+IHsgcmV0dXJuIHsgdGV4dDogYyB9OyB9KSxcbiAgICAgICAgYWxpZ246IGNhcFsyXS5yZXBsYWNlKC9eICp8XFx8ICokL2csICcnKS5zcGxpdCgvICpcXHwgKi8pLFxuICAgICAgICByb3dzOiBjYXBbM10gJiYgY2FwWzNdLnRyaW0oKSA/IGNhcFszXS5yZXBsYWNlKC9cXG5bIFxcdF0qJC8sICcnKS5zcGxpdCgnXFxuJykgOiBbXVxuICAgICAgfTtcblxuICAgICAgaWYgKGl0ZW0uaGVhZGVyLmxlbmd0aCA9PT0gaXRlbS5hbGlnbi5sZW5ndGgpIHtcbiAgICAgICAgaXRlbS5yYXcgPSBjYXBbMF07XG5cbiAgICAgICAgbGV0IGwgPSBpdGVtLmFsaWduLmxlbmd0aDtcbiAgICAgICAgbGV0IGksIGosIGssIHJvdztcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgIGlmICgvXiAqLSs6ICokLy50ZXN0KGl0ZW0uYWxpZ25baV0pKSB7XG4gICAgICAgICAgICBpdGVtLmFsaWduW2ldID0gJ3JpZ2h0JztcbiAgICAgICAgICB9IGVsc2UgaWYgKC9eICo6LSs6ICokLy50ZXN0KGl0ZW0uYWxpZ25baV0pKSB7XG4gICAgICAgICAgICBpdGVtLmFsaWduW2ldID0gJ2NlbnRlcic7XG4gICAgICAgICAgfSBlbHNlIGlmICgvXiAqOi0rICokLy50ZXN0KGl0ZW0uYWxpZ25baV0pKSB7XG4gICAgICAgICAgICBpdGVtLmFsaWduW2ldID0gJ2xlZnQnO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpdGVtLmFsaWduW2ldID0gbnVsbDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBsID0gaXRlbS5yb3dzLmxlbmd0aDtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgIGl0ZW0ucm93c1tpXSA9IHNwbGl0Q2VsbHMoaXRlbS5yb3dzW2ldLCBpdGVtLmhlYWRlci5sZW5ndGgpLm1hcChjID0+IHsgcmV0dXJuIHsgdGV4dDogYyB9OyB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHBhcnNlIGNoaWxkIHRva2VucyBpbnNpZGUgaGVhZGVycyBhbmQgY2VsbHNcblxuICAgICAgICAvLyBoZWFkZXIgY2hpbGQgdG9rZW5zXG4gICAgICAgIGwgPSBpdGVtLmhlYWRlci5sZW5ndGg7XG4gICAgICAgIGZvciAoaiA9IDA7IGogPCBsOyBqKyspIHtcbiAgICAgICAgICBpdGVtLmhlYWRlcltqXS50b2tlbnMgPSB0aGlzLmxleGVyLmlubGluZShpdGVtLmhlYWRlcltqXS50ZXh0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGNlbGwgY2hpbGQgdG9rZW5zXG4gICAgICAgIGwgPSBpdGVtLnJvd3MubGVuZ3RoO1xuICAgICAgICBmb3IgKGogPSAwOyBqIDwgbDsgaisrKSB7XG4gICAgICAgICAgcm93ID0gaXRlbS5yb3dzW2pdO1xuICAgICAgICAgIGZvciAoayA9IDA7IGsgPCByb3cubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgICAgIHJvd1trXS50b2tlbnMgPSB0aGlzLmxleGVyLmlubGluZShyb3dba10udGV4dCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgbGhlYWRpbmcoc3JjKSB7XG4gICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5ibG9jay5saGVhZGluZy5leGVjKHNyYyk7XG4gICAgaWYgKGNhcCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ2hlYWRpbmcnLFxuICAgICAgICByYXc6IGNhcFswXSxcbiAgICAgICAgZGVwdGg6IGNhcFsyXS5jaGFyQXQoMCkgPT09ICc9JyA/IDEgOiAyLFxuICAgICAgICB0ZXh0OiBjYXBbMV0sXG4gICAgICAgIHRva2VuczogdGhpcy5sZXhlci5pbmxpbmUoY2FwWzFdKVxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICBwYXJhZ3JhcGgoc3JjKSB7XG4gICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5ibG9jay5wYXJhZ3JhcGguZXhlYyhzcmMpO1xuICAgIGlmIChjYXApIHtcbiAgICAgIGNvbnN0IHRleHQgPSBjYXBbMV0uY2hhckF0KGNhcFsxXS5sZW5ndGggLSAxKSA9PT0gJ1xcbidcbiAgICAgICAgPyBjYXBbMV0uc2xpY2UoMCwgLTEpXG4gICAgICAgIDogY2FwWzFdO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ3BhcmFncmFwaCcsXG4gICAgICAgIHJhdzogY2FwWzBdLFxuICAgICAgICB0ZXh0LFxuICAgICAgICB0b2tlbnM6IHRoaXMubGV4ZXIuaW5saW5lKHRleHQpXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIHRleHQoc3JjKSB7XG4gICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5ibG9jay50ZXh0LmV4ZWMoc3JjKTtcbiAgICBpZiAoY2FwKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAndGV4dCcsXG4gICAgICAgIHJhdzogY2FwWzBdLFxuICAgICAgICB0ZXh0OiBjYXBbMF0sXG4gICAgICAgIHRva2VuczogdGhpcy5sZXhlci5pbmxpbmUoY2FwWzBdKVxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICBlc2NhcGUoc3JjKSB7XG4gICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5pbmxpbmUuZXNjYXBlLmV4ZWMoc3JjKTtcbiAgICBpZiAoY2FwKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAnZXNjYXBlJyxcbiAgICAgICAgcmF3OiBjYXBbMF0sXG4gICAgICAgIHRleHQ6IGVzY2FwZShjYXBbMV0pXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIHRhZyhzcmMpIHtcbiAgICBjb25zdCBjYXAgPSB0aGlzLnJ1bGVzLmlubGluZS50YWcuZXhlYyhzcmMpO1xuICAgIGlmIChjYXApIHtcbiAgICAgIGlmICghdGhpcy5sZXhlci5zdGF0ZS5pbkxpbmsgJiYgL148YSAvaS50ZXN0KGNhcFswXSkpIHtcbiAgICAgICAgdGhpcy5sZXhlci5zdGF0ZS5pbkxpbmsgPSB0cnVlO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLmxleGVyLnN0YXRlLmluTGluayAmJiAvXjxcXC9hPi9pLnRlc3QoY2FwWzBdKSkge1xuICAgICAgICB0aGlzLmxleGVyLnN0YXRlLmluTGluayA9IGZhbHNlO1xuICAgICAgfVxuICAgICAgaWYgKCF0aGlzLmxleGVyLnN0YXRlLmluUmF3QmxvY2sgJiYgL148KHByZXxjb2RlfGtiZHxzY3JpcHQpKFxcc3w+KS9pLnRlc3QoY2FwWzBdKSkge1xuICAgICAgICB0aGlzLmxleGVyLnN0YXRlLmluUmF3QmxvY2sgPSB0cnVlO1xuICAgICAgfSBlbHNlIGlmICh0aGlzLmxleGVyLnN0YXRlLmluUmF3QmxvY2sgJiYgL148XFwvKHByZXxjb2RlfGtiZHxzY3JpcHQpKFxcc3w+KS9pLnRlc3QoY2FwWzBdKSkge1xuICAgICAgICB0aGlzLmxleGVyLnN0YXRlLmluUmF3QmxvY2sgPSBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogdGhpcy5vcHRpb25zLnNhbml0aXplXG4gICAgICAgICAgPyAndGV4dCdcbiAgICAgICAgICA6ICdodG1sJyxcbiAgICAgICAgcmF3OiBjYXBbMF0sXG4gICAgICAgIGluTGluazogdGhpcy5sZXhlci5zdGF0ZS5pbkxpbmssXG4gICAgICAgIGluUmF3QmxvY2s6IHRoaXMubGV4ZXIuc3RhdGUuaW5SYXdCbG9jayxcbiAgICAgICAgdGV4dDogdGhpcy5vcHRpb25zLnNhbml0aXplXG4gICAgICAgICAgPyAodGhpcy5vcHRpb25zLnNhbml0aXplclxuICAgICAgICAgICAgPyB0aGlzLm9wdGlvbnMuc2FuaXRpemVyKGNhcFswXSlcbiAgICAgICAgICAgIDogZXNjYXBlKGNhcFswXSkpXG4gICAgICAgICAgOiBjYXBbMF1cbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgbGluayhzcmMpIHtcbiAgICBjb25zdCBjYXAgPSB0aGlzLnJ1bGVzLmlubGluZS5saW5rLmV4ZWMoc3JjKTtcbiAgICBpZiAoY2FwKSB7XG4gICAgICBjb25zdCB0cmltbWVkVXJsID0gY2FwWzJdLnRyaW0oKTtcbiAgICAgIGlmICghdGhpcy5vcHRpb25zLnBlZGFudGljICYmIC9ePC8udGVzdCh0cmltbWVkVXJsKSkge1xuICAgICAgICAvLyBjb21tb25tYXJrIHJlcXVpcmVzIG1hdGNoaW5nIGFuZ2xlIGJyYWNrZXRzXG4gICAgICAgIGlmICghKC8+JC8udGVzdCh0cmltbWVkVXJsKSkpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBlbmRpbmcgYW5nbGUgYnJhY2tldCBjYW5ub3QgYmUgZXNjYXBlZFxuICAgICAgICBjb25zdCBydHJpbVNsYXNoID0gcnRyaW0odHJpbW1lZFVybC5zbGljZSgwLCAtMSksICdcXFxcJyk7XG4gICAgICAgIGlmICgodHJpbW1lZFVybC5sZW5ndGggLSBydHJpbVNsYXNoLmxlbmd0aCkgJSAyID09PSAwKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBmaW5kIGNsb3NpbmcgcGFyZW50aGVzaXNcbiAgICAgICAgY29uc3QgbGFzdFBhcmVuSW5kZXggPSBmaW5kQ2xvc2luZ0JyYWNrZXQoY2FwWzJdLCAnKCknKTtcbiAgICAgICAgaWYgKGxhc3RQYXJlbkluZGV4ID4gLTEpIHtcbiAgICAgICAgICBjb25zdCBzdGFydCA9IGNhcFswXS5pbmRleE9mKCchJykgPT09IDAgPyA1IDogNDtcbiAgICAgICAgICBjb25zdCBsaW5rTGVuID0gc3RhcnQgKyBjYXBbMV0ubGVuZ3RoICsgbGFzdFBhcmVuSW5kZXg7XG4gICAgICAgICAgY2FwWzJdID0gY2FwWzJdLnN1YnN0cmluZygwLCBsYXN0UGFyZW5JbmRleCk7XG4gICAgICAgICAgY2FwWzBdID0gY2FwWzBdLnN1YnN0cmluZygwLCBsaW5rTGVuKS50cmltKCk7XG4gICAgICAgICAgY2FwWzNdID0gJyc7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGxldCBocmVmID0gY2FwWzJdO1xuICAgICAgbGV0IHRpdGxlID0gJyc7XG4gICAgICBpZiAodGhpcy5vcHRpb25zLnBlZGFudGljKSB7XG4gICAgICAgIC8vIHNwbGl0IHBlZGFudGljIGhyZWYgYW5kIHRpdGxlXG4gICAgICAgIGNvbnN0IGxpbmsgPSAvXihbXidcIl0qW15cXHNdKVxccysoWydcIl0pKC4qKVxcMi8uZXhlYyhocmVmKTtcblxuICAgICAgICBpZiAobGluaykge1xuICAgICAgICAgIGhyZWYgPSBsaW5rWzFdO1xuICAgICAgICAgIHRpdGxlID0gbGlua1szXTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGl0bGUgPSBjYXBbM10gPyBjYXBbM10uc2xpY2UoMSwgLTEpIDogJyc7XG4gICAgICB9XG5cbiAgICAgIGhyZWYgPSBocmVmLnRyaW0oKTtcbiAgICAgIGlmICgvXjwvLnRlc3QoaHJlZikpIHtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5wZWRhbnRpYyAmJiAhKC8+JC8udGVzdCh0cmltbWVkVXJsKSkpIHtcbiAgICAgICAgICAvLyBwZWRhbnRpYyBhbGxvd3Mgc3RhcnRpbmcgYW5nbGUgYnJhY2tldCB3aXRob3V0IGVuZGluZyBhbmdsZSBicmFja2V0XG4gICAgICAgICAgaHJlZiA9IGhyZWYuc2xpY2UoMSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaHJlZiA9IGhyZWYuc2xpY2UoMSwgLTEpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gb3V0cHV0TGluayhjYXAsIHtcbiAgICAgICAgaHJlZjogaHJlZiA/IGhyZWYucmVwbGFjZSh0aGlzLnJ1bGVzLmlubGluZS5fZXNjYXBlcywgJyQxJykgOiBocmVmLFxuICAgICAgICB0aXRsZTogdGl0bGUgPyB0aXRsZS5yZXBsYWNlKHRoaXMucnVsZXMuaW5saW5lLl9lc2NhcGVzLCAnJDEnKSA6IHRpdGxlXG4gICAgICB9LCBjYXBbMF0sIHRoaXMubGV4ZXIpO1xuICAgIH1cbiAgfVxuXG4gIHJlZmxpbmsoc3JjLCBsaW5rcykge1xuICAgIGxldCBjYXA7XG4gICAgaWYgKChjYXAgPSB0aGlzLnJ1bGVzLmlubGluZS5yZWZsaW5rLmV4ZWMoc3JjKSlcbiAgICAgICAgfHwgKGNhcCA9IHRoaXMucnVsZXMuaW5saW5lLm5vbGluay5leGVjKHNyYykpKSB7XG4gICAgICBsZXQgbGluayA9IChjYXBbMl0gfHwgY2FwWzFdKS5yZXBsYWNlKC9cXHMrL2csICcgJyk7XG4gICAgICBsaW5rID0gbGlua3NbbGluay50b0xvd2VyQ2FzZSgpXTtcbiAgICAgIGlmICghbGluaykge1xuICAgICAgICBjb25zdCB0ZXh0ID0gY2FwWzBdLmNoYXJBdCgwKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICB0eXBlOiAndGV4dCcsXG4gICAgICAgICAgcmF3OiB0ZXh0LFxuICAgICAgICAgIHRleHRcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBvdXRwdXRMaW5rKGNhcCwgbGluaywgY2FwWzBdLCB0aGlzLmxleGVyKTtcbiAgICB9XG4gIH1cblxuICBlbVN0cm9uZyhzcmMsIG1hc2tlZFNyYywgcHJldkNoYXIgPSAnJykge1xuICAgIGxldCBtYXRjaCA9IHRoaXMucnVsZXMuaW5saW5lLmVtU3Ryb25nLmxEZWxpbS5leGVjKHNyYyk7XG4gICAgaWYgKCFtYXRjaCkgcmV0dXJuO1xuXG4gICAgLy8gXyBjYW4ndCBiZSBiZXR3ZWVuIHR3byBhbHBoYW51bWVyaWNzLiBcXHB7TH1cXHB7Tn0gaW5jbHVkZXMgbm9uLWVuZ2xpc2ggYWxwaGFiZXQvbnVtYmVycyBhcyB3ZWxsXG4gICAgaWYgKG1hdGNoWzNdICYmIHByZXZDaGFyLm1hdGNoKC9bXFxwe0x9XFxwe059XS91KSkgcmV0dXJuO1xuXG4gICAgY29uc3QgbmV4dENoYXIgPSBtYXRjaFsxXSB8fCBtYXRjaFsyXSB8fCAnJztcblxuICAgIGlmICghbmV4dENoYXIgfHwgKG5leHRDaGFyICYmIChwcmV2Q2hhciA9PT0gJycgfHwgdGhpcy5ydWxlcy5pbmxpbmUucHVuY3R1YXRpb24uZXhlYyhwcmV2Q2hhcikpKSkge1xuICAgICAgY29uc3QgbExlbmd0aCA9IG1hdGNoWzBdLmxlbmd0aCAtIDE7XG4gICAgICBsZXQgckRlbGltLCByTGVuZ3RoLCBkZWxpbVRvdGFsID0gbExlbmd0aCwgbWlkRGVsaW1Ub3RhbCA9IDA7XG5cbiAgICAgIGNvbnN0IGVuZFJlZyA9IG1hdGNoWzBdWzBdID09PSAnKicgPyB0aGlzLnJ1bGVzLmlubGluZS5lbVN0cm9uZy5yRGVsaW1Bc3QgOiB0aGlzLnJ1bGVzLmlubGluZS5lbVN0cm9uZy5yRGVsaW1VbmQ7XG4gICAgICBlbmRSZWcubGFzdEluZGV4ID0gMDtcblxuICAgICAgLy8gQ2xpcCBtYXNrZWRTcmMgdG8gc2FtZSBzZWN0aW9uIG9mIHN0cmluZyBhcyBzcmMgKG1vdmUgdG8gbGV4ZXI/KVxuICAgICAgbWFza2VkU3JjID0gbWFza2VkU3JjLnNsaWNlKC0xICogc3JjLmxlbmd0aCArIGxMZW5ndGgpO1xuXG4gICAgICB3aGlsZSAoKG1hdGNoID0gZW5kUmVnLmV4ZWMobWFza2VkU3JjKSkgIT0gbnVsbCkge1xuICAgICAgICByRGVsaW0gPSBtYXRjaFsxXSB8fCBtYXRjaFsyXSB8fCBtYXRjaFszXSB8fCBtYXRjaFs0XSB8fCBtYXRjaFs1XSB8fCBtYXRjaFs2XTtcblxuICAgICAgICBpZiAoIXJEZWxpbSkgY29udGludWU7IC8vIHNraXAgc2luZ2xlICogaW4gX19hYmMqYWJjX19cblxuICAgICAgICByTGVuZ3RoID0gckRlbGltLmxlbmd0aDtcblxuICAgICAgICBpZiAobWF0Y2hbM10gfHwgbWF0Y2hbNF0pIHsgLy8gZm91bmQgYW5vdGhlciBMZWZ0IERlbGltXG4gICAgICAgICAgZGVsaW1Ub3RhbCArPSByTGVuZ3RoO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9IGVsc2UgaWYgKG1hdGNoWzVdIHx8IG1hdGNoWzZdKSB7IC8vIGVpdGhlciBMZWZ0IG9yIFJpZ2h0IERlbGltXG4gICAgICAgICAgaWYgKGxMZW5ndGggJSAzICYmICEoKGxMZW5ndGggKyByTGVuZ3RoKSAlIDMpKSB7XG4gICAgICAgICAgICBtaWREZWxpbVRvdGFsICs9IHJMZW5ndGg7XG4gICAgICAgICAgICBjb250aW51ZTsgLy8gQ29tbW9uTWFyayBFbXBoYXNpcyBSdWxlcyA5LTEwXG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZGVsaW1Ub3RhbCAtPSByTGVuZ3RoO1xuXG4gICAgICAgIGlmIChkZWxpbVRvdGFsID4gMCkgY29udGludWU7IC8vIEhhdmVuJ3QgZm91bmQgZW5vdWdoIGNsb3NpbmcgZGVsaW1pdGVyc1xuXG4gICAgICAgIC8vIFJlbW92ZSBleHRyYSBjaGFyYWN0ZXJzLiAqYSoqKiAtPiAqYSpcbiAgICAgICAgckxlbmd0aCA9IE1hdGgubWluKHJMZW5ndGgsIHJMZW5ndGggKyBkZWxpbVRvdGFsICsgbWlkRGVsaW1Ub3RhbCk7XG5cbiAgICAgICAgY29uc3QgcmF3ID0gc3JjLnNsaWNlKDAsIGxMZW5ndGggKyBtYXRjaC5pbmRleCArIChtYXRjaFswXS5sZW5ndGggLSByRGVsaW0ubGVuZ3RoKSArIHJMZW5ndGgpO1xuXG4gICAgICAgIC8vIENyZWF0ZSBgZW1gIGlmIHNtYWxsZXN0IGRlbGltaXRlciBoYXMgb2RkIGNoYXIgY291bnQuICphKioqXG4gICAgICAgIGlmIChNYXRoLm1pbihsTGVuZ3RoLCByTGVuZ3RoKSAlIDIpIHtcbiAgICAgICAgICBjb25zdCB0ZXh0ID0gcmF3LnNsaWNlKDEsIC0xKTtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdHlwZTogJ2VtJyxcbiAgICAgICAgICAgIHJhdyxcbiAgICAgICAgICAgIHRleHQsXG4gICAgICAgICAgICB0b2tlbnM6IHRoaXMubGV4ZXIuaW5saW5lVG9rZW5zKHRleHQpXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENyZWF0ZSAnc3Ryb25nJyBpZiBzbWFsbGVzdCBkZWxpbWl0ZXIgaGFzIGV2ZW4gY2hhciBjb3VudC4gKiphKioqXG4gICAgICAgIGNvbnN0IHRleHQgPSByYXcuc2xpY2UoMiwgLTIpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHR5cGU6ICdzdHJvbmcnLFxuICAgICAgICAgIHJhdyxcbiAgICAgICAgICB0ZXh0LFxuICAgICAgICAgIHRva2VuczogdGhpcy5sZXhlci5pbmxpbmVUb2tlbnModGV4dClcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBjb2Rlc3BhbihzcmMpIHtcbiAgICBjb25zdCBjYXAgPSB0aGlzLnJ1bGVzLmlubGluZS5jb2RlLmV4ZWMoc3JjKTtcbiAgICBpZiAoY2FwKSB7XG4gICAgICBsZXQgdGV4dCA9IGNhcFsyXS5yZXBsYWNlKC9cXG4vZywgJyAnKTtcbiAgICAgIGNvbnN0IGhhc05vblNwYWNlQ2hhcnMgPSAvW14gXS8udGVzdCh0ZXh0KTtcbiAgICAgIGNvbnN0IGhhc1NwYWNlQ2hhcnNPbkJvdGhFbmRzID0gL14gLy50ZXN0KHRleHQpICYmIC8gJC8udGVzdCh0ZXh0KTtcbiAgICAgIGlmIChoYXNOb25TcGFjZUNoYXJzICYmIGhhc1NwYWNlQ2hhcnNPbkJvdGhFbmRzKSB7XG4gICAgICAgIHRleHQgPSB0ZXh0LnN1YnN0cmluZygxLCB0ZXh0Lmxlbmd0aCAtIDEpO1xuICAgICAgfVxuICAgICAgdGV4dCA9IGVzY2FwZSh0ZXh0LCB0cnVlKTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdjb2Rlc3BhbicsXG4gICAgICAgIHJhdzogY2FwWzBdLFxuICAgICAgICB0ZXh0XG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIGJyKHNyYykge1xuICAgIGNvbnN0IGNhcCA9IHRoaXMucnVsZXMuaW5saW5lLmJyLmV4ZWMoc3JjKTtcbiAgICBpZiAoY2FwKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAnYnInLFxuICAgICAgICByYXc6IGNhcFswXVxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICBkZWwoc3JjKSB7XG4gICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5pbmxpbmUuZGVsLmV4ZWMoc3JjKTtcbiAgICBpZiAoY2FwKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAnZGVsJyxcbiAgICAgICAgcmF3OiBjYXBbMF0sXG4gICAgICAgIHRleHQ6IGNhcFsyXSxcbiAgICAgICAgdG9rZW5zOiB0aGlzLmxleGVyLmlubGluZVRva2VucyhjYXBbMl0pXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIGF1dG9saW5rKHNyYywgbWFuZ2xlKSB7XG4gICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5pbmxpbmUuYXV0b2xpbmsuZXhlYyhzcmMpO1xuICAgIGlmIChjYXApIHtcbiAgICAgIGxldCB0ZXh0LCBocmVmO1xuICAgICAgaWYgKGNhcFsyXSA9PT0gJ0AnKSB7XG4gICAgICAgIHRleHQgPSBlc2NhcGUodGhpcy5vcHRpb25zLm1hbmdsZSA/IG1hbmdsZShjYXBbMV0pIDogY2FwWzFdKTtcbiAgICAgICAgaHJlZiA9ICdtYWlsdG86JyArIHRleHQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0ZXh0ID0gZXNjYXBlKGNhcFsxXSk7XG4gICAgICAgIGhyZWYgPSB0ZXh0O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAnbGluaycsXG4gICAgICAgIHJhdzogY2FwWzBdLFxuICAgICAgICB0ZXh0LFxuICAgICAgICBocmVmLFxuICAgICAgICB0b2tlbnM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICB0eXBlOiAndGV4dCcsXG4gICAgICAgICAgICByYXc6IHRleHQsXG4gICAgICAgICAgICB0ZXh0XG4gICAgICAgICAgfVxuICAgICAgICBdXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIHVybChzcmMsIG1hbmdsZSkge1xuICAgIGxldCBjYXA7XG4gICAgaWYgKGNhcCA9IHRoaXMucnVsZXMuaW5saW5lLnVybC5leGVjKHNyYykpIHtcbiAgICAgIGxldCB0ZXh0LCBocmVmO1xuICAgICAgaWYgKGNhcFsyXSA9PT0gJ0AnKSB7XG4gICAgICAgIHRleHQgPSBlc2NhcGUodGhpcy5vcHRpb25zLm1hbmdsZSA/IG1hbmdsZShjYXBbMF0pIDogY2FwWzBdKTtcbiAgICAgICAgaHJlZiA9ICdtYWlsdG86JyArIHRleHQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBkbyBleHRlbmRlZCBhdXRvbGluayBwYXRoIHZhbGlkYXRpb25cbiAgICAgICAgbGV0IHByZXZDYXBaZXJvO1xuICAgICAgICBkbyB7XG4gICAgICAgICAgcHJldkNhcFplcm8gPSBjYXBbMF07XG4gICAgICAgICAgY2FwWzBdID0gdGhpcy5ydWxlcy5pbmxpbmUuX2JhY2twZWRhbC5leGVjKGNhcFswXSlbMF07XG4gICAgICAgIH0gd2hpbGUgKHByZXZDYXBaZXJvICE9PSBjYXBbMF0pO1xuICAgICAgICB0ZXh0ID0gZXNjYXBlKGNhcFswXSk7XG4gICAgICAgIGlmIChjYXBbMV0gPT09ICd3d3cuJykge1xuICAgICAgICAgIGhyZWYgPSAnaHR0cDovLycgKyBjYXBbMF07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaHJlZiA9IGNhcFswXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ2xpbmsnLFxuICAgICAgICByYXc6IGNhcFswXSxcbiAgICAgICAgdGV4dCxcbiAgICAgICAgaHJlZixcbiAgICAgICAgdG9rZW5zOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgdHlwZTogJ3RleHQnLFxuICAgICAgICAgICAgcmF3OiB0ZXh0LFxuICAgICAgICAgICAgdGV4dFxuICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICBpbmxpbmVUZXh0KHNyYywgc21hcnR5cGFudHMpIHtcbiAgICBjb25zdCBjYXAgPSB0aGlzLnJ1bGVzLmlubGluZS50ZXh0LmV4ZWMoc3JjKTtcbiAgICBpZiAoY2FwKSB7XG4gICAgICBsZXQgdGV4dDtcbiAgICAgIGlmICh0aGlzLmxleGVyLnN0YXRlLmluUmF3QmxvY2spIHtcbiAgICAgICAgdGV4dCA9IHRoaXMub3B0aW9ucy5zYW5pdGl6ZSA/ICh0aGlzLm9wdGlvbnMuc2FuaXRpemVyID8gdGhpcy5vcHRpb25zLnNhbml0aXplcihjYXBbMF0pIDogZXNjYXBlKGNhcFswXSkpIDogY2FwWzBdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGV4dCA9IGVzY2FwZSh0aGlzLm9wdGlvbnMuc21hcnR5cGFudHMgPyBzbWFydHlwYW50cyhjYXBbMF0pIDogY2FwWzBdKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgICAgcmF3OiBjYXBbMF0sXG4gICAgICAgIHRleHRcbiAgICAgIH07XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQmxvY2stTGV2ZWwgR3JhbW1hclxuICovXG5jb25zdCBibG9jayA9IHtcbiAgbmV3bGluZTogL14oPzogKig/OlxcbnwkKSkrLyxcbiAgY29kZTogL14oIHs0fVteXFxuXSsoPzpcXG4oPzogKig/OlxcbnwkKSkqKT8pKy8sXG4gIGZlbmNlczogL14gezAsM30oYHszLH0oPz1bXmBcXG5dKig/OlxcbnwkKSl8fnszLH0pKFteXFxuXSopKD86XFxufCQpKD86fChbXFxzXFxTXSo/KSg/OlxcbnwkKSkoPzogezAsM31cXDFbfmBdKiAqKD89XFxufCQpfCQpLyxcbiAgaHI6IC9eIHswLDN9KCg/Oi1bXFx0IF0qKXszLH18KD86X1sgXFx0XSopezMsfXwoPzpcXCpbIFxcdF0qKXszLH0pKD86XFxuK3wkKS8sXG4gIGhlYWRpbmc6IC9eIHswLDN9KCN7MSw2fSkoPz1cXHN8JCkoLiopKD86XFxuK3wkKS8sXG4gIGJsb2NrcXVvdGU6IC9eKCB7MCwzfT4gPyhwYXJhZ3JhcGh8W15cXG5dKikoPzpcXG58JCkpKy8sXG4gIGxpc3Q6IC9eKCB7MCwzfWJ1bGwpKFsgXFx0XVteXFxuXSs/KT8oPzpcXG58JCkvLFxuICBodG1sOiAnXiB7MCwzfSg/OicgLy8gb3B0aW9uYWwgaW5kZW50YXRpb25cbiAgICArICc8KHNjcmlwdHxwcmV8c3R5bGV8dGV4dGFyZWEpW1xcXFxzPl1bXFxcXHNcXFxcU10qPyg/OjwvXFxcXDE+W15cXFxcbl0qXFxcXG4rfCQpJyAvLyAoMSlcbiAgICArICd8Y29tbWVudFteXFxcXG5dKihcXFxcbit8JCknIC8vICgyKVxuICAgICsgJ3w8XFxcXD9bXFxcXHNcXFxcU10qPyg/OlxcXFw/PlxcXFxuKnwkKScgLy8gKDMpXG4gICAgKyAnfDwhW0EtWl1bXFxcXHNcXFxcU10qPyg/Oj5cXFxcbip8JCknIC8vICg0KVxuICAgICsgJ3w8IVxcXFxbQ0RBVEFcXFxcW1tcXFxcc1xcXFxTXSo/KD86XFxcXF1cXFxcXT5cXFxcbip8JCknIC8vICg1KVxuICAgICsgJ3w8Lz8odGFnKSg/OiArfFxcXFxufC8/PilbXFxcXHNcXFxcU10qPyg/Oig/OlxcXFxuICopK1xcXFxufCQpJyAvLyAoNilcbiAgICArICd8PCg/IXNjcmlwdHxwcmV8c3R5bGV8dGV4dGFyZWEpKFthLXpdW1xcXFx3LV0qKSg/OmF0dHJpYnV0ZSkqPyAqLz8+KD89WyBcXFxcdF0qKD86XFxcXG58JCkpW1xcXFxzXFxcXFNdKj8oPzooPzpcXFxcbiAqKStcXFxcbnwkKScgLy8gKDcpIG9wZW4gdGFnXG4gICAgKyAnfDwvKD8hc2NyaXB0fHByZXxzdHlsZXx0ZXh0YXJlYSlbYS16XVtcXFxcdy1dKlxcXFxzKj4oPz1bIFxcXFx0XSooPzpcXFxcbnwkKSlbXFxcXHNcXFxcU10qPyg/Oig/OlxcXFxuICopK1xcXFxufCQpJyAvLyAoNykgY2xvc2luZyB0YWdcbiAgICArICcpJyxcbiAgZGVmOiAvXiB7MCwzfVxcWyhsYWJlbClcXF06ICooPzpcXG4gKik/KFtePFxcc11bXlxcc10qfDwuKj8+KSg/Oig/OiArKD86XFxuICopP3wgKlxcbiAqKSh0aXRsZSkpPyAqKD86XFxuK3wkKS8sXG4gIHRhYmxlOiBub29wVGVzdCxcbiAgbGhlYWRpbmc6IC9eKCg/Oi58XFxuKD8hXFxuKSkrPylcXG4gezAsM30oPSt8LSspICooPzpcXG4rfCQpLyxcbiAgLy8gcmVnZXggdGVtcGxhdGUsIHBsYWNlaG9sZGVycyB3aWxsIGJlIHJlcGxhY2VkIGFjY29yZGluZyB0byBkaWZmZXJlbnQgcGFyYWdyYXBoXG4gIC8vIGludGVycnVwdGlvbiBydWxlcyBvZiBjb21tb25tYXJrIGFuZCB0aGUgb3JpZ2luYWwgbWFya2Rvd24gc3BlYzpcbiAgX3BhcmFncmFwaDogL14oW15cXG5dKyg/Olxcbig/IWhyfGhlYWRpbmd8bGhlYWRpbmd8YmxvY2txdW90ZXxmZW5jZXN8bGlzdHxodG1sfHRhYmxlfCArXFxuKVteXFxuXSspKikvLFxuICB0ZXh0OiAvXlteXFxuXSsvXG59O1xuXG5ibG9jay5fbGFiZWwgPSAvKD8hXFxzKlxcXSkoPzpcXFxcLnxbXlxcW1xcXVxcXFxdKSsvO1xuYmxvY2suX3RpdGxlID0gLyg/OlwiKD86XFxcXFwiP3xbXlwiXFxcXF0pKlwifCdbXidcXG5dKig/OlxcblteJ1xcbl0rKSpcXG4/J3xcXChbXigpXSpcXCkpLztcbmJsb2NrLmRlZiA9IGVkaXQoYmxvY2suZGVmKVxuICAucmVwbGFjZSgnbGFiZWwnLCBibG9jay5fbGFiZWwpXG4gIC5yZXBsYWNlKCd0aXRsZScsIGJsb2NrLl90aXRsZSlcbiAgLmdldFJlZ2V4KCk7XG5cbmJsb2NrLmJ1bGxldCA9IC8oPzpbKistXXxcXGR7MSw5fVsuKV0pLztcbmJsb2NrLmxpc3RJdGVtU3RhcnQgPSBlZGl0KC9eKCAqKShidWxsKSAqLylcbiAgLnJlcGxhY2UoJ2J1bGwnLCBibG9jay5idWxsZXQpXG4gIC5nZXRSZWdleCgpO1xuXG5ibG9jay5saXN0ID0gZWRpdChibG9jay5saXN0KVxuICAucmVwbGFjZSgvYnVsbC9nLCBibG9jay5idWxsZXQpXG4gIC5yZXBsYWNlKCdocicsICdcXFxcbisoPz1cXFxcMT8oPzooPzotICopezMsfXwoPzpfICopezMsfXwoPzpcXFxcKiAqKXszLH0pKD86XFxcXG4rfCQpKScpXG4gIC5yZXBsYWNlKCdkZWYnLCAnXFxcXG4rKD89JyArIGJsb2NrLmRlZi5zb3VyY2UgKyAnKScpXG4gIC5nZXRSZWdleCgpO1xuXG5ibG9jay5fdGFnID0gJ2FkZHJlc3N8YXJ0aWNsZXxhc2lkZXxiYXNlfGJhc2Vmb250fGJsb2NrcXVvdGV8Ym9keXxjYXB0aW9uJ1xuICArICd8Y2VudGVyfGNvbHxjb2xncm91cHxkZHxkZXRhaWxzfGRpYWxvZ3xkaXJ8ZGl2fGRsfGR0fGZpZWxkc2V0fGZpZ2NhcHRpb24nXG4gICsgJ3xmaWd1cmV8Zm9vdGVyfGZvcm18ZnJhbWV8ZnJhbWVzZXR8aFsxLTZdfGhlYWR8aGVhZGVyfGhyfGh0bWx8aWZyYW1lJ1xuICArICd8bGVnZW5kfGxpfGxpbmt8bWFpbnxtZW51fG1lbnVpdGVtfG1ldGF8bmF2fG5vZnJhbWVzfG9sfG9wdGdyb3VwfG9wdGlvbidcbiAgKyAnfHB8cGFyYW18c2VjdGlvbnxzb3VyY2V8c3VtbWFyeXx0YWJsZXx0Ym9keXx0ZHx0Zm9vdHx0aHx0aGVhZHx0aXRsZXx0cidcbiAgKyAnfHRyYWNrfHVsJztcbmJsb2NrLl9jb21tZW50ID0gLzwhLS0oPyEtPz4pW1xcc1xcU10qPyg/Oi0tPnwkKS87XG5ibG9jay5odG1sID0gZWRpdChibG9jay5odG1sLCAnaScpXG4gIC5yZXBsYWNlKCdjb21tZW50JywgYmxvY2suX2NvbW1lbnQpXG4gIC5yZXBsYWNlKCd0YWcnLCBibG9jay5fdGFnKVxuICAucmVwbGFjZSgnYXR0cmlidXRlJywgLyArW2EtekEtWjpfXVtcXHcuOi1dKig/OiAqPSAqXCJbXlwiXFxuXSpcInwgKj0gKidbXidcXG5dKid8ICo9ICpbXlxcc1wiJz08PmBdKyk/LylcbiAgLmdldFJlZ2V4KCk7XG5cbmJsb2NrLnBhcmFncmFwaCA9IGVkaXQoYmxvY2suX3BhcmFncmFwaClcbiAgLnJlcGxhY2UoJ2hyJywgYmxvY2suaHIpXG4gIC5yZXBsYWNlKCdoZWFkaW5nJywgJyB7MCwzfSN7MSw2fSAnKVxuICAucmVwbGFjZSgnfGxoZWFkaW5nJywgJycpIC8vIHNldGV4IGhlYWRpbmdzIGRvbid0IGludGVycnVwdCBjb21tb25tYXJrIHBhcmFncmFwaHNcbiAgLnJlcGxhY2UoJ3x0YWJsZScsICcnKVxuICAucmVwbGFjZSgnYmxvY2txdW90ZScsICcgezAsM30+JylcbiAgLnJlcGxhY2UoJ2ZlbmNlcycsICcgezAsM30oPzpgezMsfSg/PVteYFxcXFxuXSpcXFxcbil8fnszLH0pW15cXFxcbl0qXFxcXG4nKVxuICAucmVwbGFjZSgnbGlzdCcsICcgezAsM30oPzpbKistXXwxWy4pXSkgJykgLy8gb25seSBsaXN0cyBzdGFydGluZyBmcm9tIDEgY2FuIGludGVycnVwdFxuICAucmVwbGFjZSgnaHRtbCcsICc8Lz8oPzp0YWcpKD86ICt8XFxcXG58Lz8+KXw8KD86c2NyaXB0fHByZXxzdHlsZXx0ZXh0YXJlYXwhLS0pJylcbiAgLnJlcGxhY2UoJ3RhZycsIGJsb2NrLl90YWcpIC8vIHBhcnMgY2FuIGJlIGludGVycnVwdGVkIGJ5IHR5cGUgKDYpIGh0bWwgYmxvY2tzXG4gIC5nZXRSZWdleCgpO1xuXG5ibG9jay5ibG9ja3F1b3RlID0gZWRpdChibG9jay5ibG9ja3F1b3RlKVxuICAucmVwbGFjZSgncGFyYWdyYXBoJywgYmxvY2sucGFyYWdyYXBoKVxuICAuZ2V0UmVnZXgoKTtcblxuLyoqXG4gKiBOb3JtYWwgQmxvY2sgR3JhbW1hclxuICovXG5cbmJsb2NrLm5vcm1hbCA9IHsgLi4uYmxvY2sgfTtcblxuLyoqXG4gKiBHRk0gQmxvY2sgR3JhbW1hclxuICovXG5cbmJsb2NrLmdmbSA9IHtcbiAgLi4uYmxvY2subm9ybWFsLFxuICB0YWJsZTogJ14gKihbXlxcXFxuIF0uKlxcXFx8LiopXFxcXG4nIC8vIEhlYWRlclxuICAgICsgJyB7MCwzfSg/OlxcXFx8ICopPyg6Py0rOj8gKig/OlxcXFx8ICo6Py0rOj8gKikqKSg/OlxcXFx8ICopPycgLy8gQWxpZ25cbiAgICArICcoPzpcXFxcbigoPzooPyEgKlxcXFxufGhyfGhlYWRpbmd8YmxvY2txdW90ZXxjb2RlfGZlbmNlc3xsaXN0fGh0bWwpLiooPzpcXFxcbnwkKSkqKVxcXFxuKnwkKScgLy8gQ2VsbHNcbn07XG5cbmJsb2NrLmdmbS50YWJsZSA9IGVkaXQoYmxvY2suZ2ZtLnRhYmxlKVxuICAucmVwbGFjZSgnaHInLCBibG9jay5ocilcbiAgLnJlcGxhY2UoJ2hlYWRpbmcnLCAnIHswLDN9I3sxLDZ9ICcpXG4gIC5yZXBsYWNlKCdibG9ja3F1b3RlJywgJyB7MCwzfT4nKVxuICAucmVwbGFjZSgnY29kZScsICcgezR9W15cXFxcbl0nKVxuICAucmVwbGFjZSgnZmVuY2VzJywgJyB7MCwzfSg/OmB7Myx9KD89W15gXFxcXG5dKlxcXFxuKXx+ezMsfSlbXlxcXFxuXSpcXFxcbicpXG4gIC5yZXBsYWNlKCdsaXN0JywgJyB7MCwzfSg/OlsqKy1dfDFbLildKSAnKSAvLyBvbmx5IGxpc3RzIHN0YXJ0aW5nIGZyb20gMSBjYW4gaW50ZXJydXB0XG4gIC5yZXBsYWNlKCdodG1sJywgJzwvPyg/OnRhZykoPzogK3xcXFxcbnwvPz4pfDwoPzpzY3JpcHR8cHJlfHN0eWxlfHRleHRhcmVhfCEtLSknKVxuICAucmVwbGFjZSgndGFnJywgYmxvY2suX3RhZykgLy8gdGFibGVzIGNhbiBiZSBpbnRlcnJ1cHRlZCBieSB0eXBlICg2KSBodG1sIGJsb2Nrc1xuICAuZ2V0UmVnZXgoKTtcblxuYmxvY2suZ2ZtLnBhcmFncmFwaCA9IGVkaXQoYmxvY2suX3BhcmFncmFwaClcbiAgLnJlcGxhY2UoJ2hyJywgYmxvY2suaHIpXG4gIC5yZXBsYWNlKCdoZWFkaW5nJywgJyB7MCwzfSN7MSw2fSAnKVxuICAucmVwbGFjZSgnfGxoZWFkaW5nJywgJycpIC8vIHNldGV4IGhlYWRpbmdzIGRvbid0IGludGVycnVwdCBjb21tb25tYXJrIHBhcmFncmFwaHNcbiAgLnJlcGxhY2UoJ3RhYmxlJywgYmxvY2suZ2ZtLnRhYmxlKSAvLyBpbnRlcnJ1cHQgcGFyYWdyYXBocyB3aXRoIHRhYmxlXG4gIC5yZXBsYWNlKCdibG9ja3F1b3RlJywgJyB7MCwzfT4nKVxuICAucmVwbGFjZSgnZmVuY2VzJywgJyB7MCwzfSg/OmB7Myx9KD89W15gXFxcXG5dKlxcXFxuKXx+ezMsfSlbXlxcXFxuXSpcXFxcbicpXG4gIC5yZXBsYWNlKCdsaXN0JywgJyB7MCwzfSg/OlsqKy1dfDFbLildKSAnKSAvLyBvbmx5IGxpc3RzIHN0YXJ0aW5nIGZyb20gMSBjYW4gaW50ZXJydXB0XG4gIC5yZXBsYWNlKCdodG1sJywgJzwvPyg/OnRhZykoPzogK3xcXFxcbnwvPz4pfDwoPzpzY3JpcHR8cHJlfHN0eWxlfHRleHRhcmVhfCEtLSknKVxuICAucmVwbGFjZSgndGFnJywgYmxvY2suX3RhZykgLy8gcGFycyBjYW4gYmUgaW50ZXJydXB0ZWQgYnkgdHlwZSAoNikgaHRtbCBibG9ja3NcbiAgLmdldFJlZ2V4KCk7XG4vKipcbiAqIFBlZGFudGljIGdyYW1tYXIgKG9yaWdpbmFsIEpvaG4gR3J1YmVyJ3MgbG9vc2UgbWFya2Rvd24gc3BlY2lmaWNhdGlvbilcbiAqL1xuXG5ibG9jay5wZWRhbnRpYyA9IHtcbiAgLi4uYmxvY2subm9ybWFsLFxuICBodG1sOiBlZGl0KFxuICAgICdeICooPzpjb21tZW50ICooPzpcXFxcbnxcXFxccyokKSdcbiAgICArICd8PCh0YWcpW1xcXFxzXFxcXFNdKz88L1xcXFwxPiAqKD86XFxcXG57Mix9fFxcXFxzKiQpJyAvLyBjbG9zZWQgdGFnXG4gICAgKyAnfDx0YWcoPzpcIlteXCJdKlwifFxcJ1teXFwnXSpcXCd8XFxcXHNbXlxcJ1wiLz5cXFxcc10qKSo/Lz8+ICooPzpcXFxcbnsyLH18XFxcXHMqJCkpJylcbiAgICAucmVwbGFjZSgnY29tbWVudCcsIGJsb2NrLl9jb21tZW50KVxuICAgIC5yZXBsYWNlKC90YWcvZywgJyg/ISg/OidcbiAgICAgICsgJ2F8ZW18c3Ryb25nfHNtYWxsfHN8Y2l0ZXxxfGRmbnxhYmJyfGRhdGF8dGltZXxjb2RlfHZhcnxzYW1wfGtiZHxzdWInXG4gICAgICArICd8c3VwfGl8Ynx1fG1hcmt8cnVieXxydHxycHxiZGl8YmRvfHNwYW58YnJ8d2JyfGluc3xkZWx8aW1nKSdcbiAgICAgICsgJ1xcXFxiKVxcXFx3Kyg/ITp8W15cXFxcd1xcXFxzQF0qQClcXFxcYicpXG4gICAgLmdldFJlZ2V4KCksXG4gIGRlZjogL14gKlxcWyhbXlxcXV0rKVxcXTogKjw/KFteXFxzPl0rKT4/KD86ICsoW1wiKF1bXlxcbl0rW1wiKV0pKT8gKig/Olxcbit8JCkvLFxuICBoZWFkaW5nOiAvXigjezEsNn0pKC4qKSg/Olxcbit8JCkvLFxuICBmZW5jZXM6IG5vb3BUZXN0LCAvLyBmZW5jZXMgbm90IHN1cHBvcnRlZFxuICBsaGVhZGluZzogL14oLis/KVxcbiB7MCwzfSg9K3wtKykgKig/Olxcbit8JCkvLFxuICBwYXJhZ3JhcGg6IGVkaXQoYmxvY2subm9ybWFsLl9wYXJhZ3JhcGgpXG4gICAgLnJlcGxhY2UoJ2hyJywgYmxvY2suaHIpXG4gICAgLnJlcGxhY2UoJ2hlYWRpbmcnLCAnICojezEsNn0gKlteXFxuXScpXG4gICAgLnJlcGxhY2UoJ2xoZWFkaW5nJywgYmxvY2subGhlYWRpbmcpXG4gICAgLnJlcGxhY2UoJ2Jsb2NrcXVvdGUnLCAnIHswLDN9PicpXG4gICAgLnJlcGxhY2UoJ3xmZW5jZXMnLCAnJylcbiAgICAucmVwbGFjZSgnfGxpc3QnLCAnJylcbiAgICAucmVwbGFjZSgnfGh0bWwnLCAnJylcbiAgICAuZ2V0UmVnZXgoKVxufTtcblxuLyoqXG4gKiBJbmxpbmUtTGV2ZWwgR3JhbW1hclxuICovXG5jb25zdCBpbmxpbmUgPSB7XG4gIGVzY2FwZTogL15cXFxcKFshXCIjJCUmJygpKissXFwtLi86Ozw9Pj9AXFxbXFxdXFxcXF5fYHt8fX5dKS8sXG4gIGF1dG9saW5rOiAvXjwoc2NoZW1lOlteXFxzXFx4MDAtXFx4MWY8Pl0qfGVtYWlsKT4vLFxuICB1cmw6IG5vb3BUZXN0LFxuICB0YWc6ICdeY29tbWVudCdcbiAgICArICd8XjwvW2EtekEtWl1bXFxcXHc6LV0qXFxcXHMqPicgLy8gc2VsZi1jbG9zaW5nIHRhZ1xuICAgICsgJ3xePFthLXpBLVpdW1xcXFx3LV0qKD86YXR0cmlidXRlKSo/XFxcXHMqLz8+JyAvLyBvcGVuIHRhZ1xuICAgICsgJ3xePFxcXFw/W1xcXFxzXFxcXFNdKj9cXFxcPz4nIC8vIHByb2Nlc3NpbmcgaW5zdHJ1Y3Rpb24sIGUuZy4gPD9waHAgPz5cbiAgICArICd8XjwhW2EtekEtWl0rXFxcXHNbXFxcXHNcXFxcU10qPz4nIC8vIGRlY2xhcmF0aW9uLCBlLmcuIDwhRE9DVFlQRSBodG1sPlxuICAgICsgJ3xePCFcXFxcW0NEQVRBXFxcXFtbXFxcXHNcXFxcU10qP1xcXFxdXFxcXF0+JywgLy8gQ0RBVEEgc2VjdGlvblxuICBsaW5rOiAvXiE/XFxbKGxhYmVsKVxcXVxcKFxccyooaHJlZikoPzpcXHMrKHRpdGxlKSk/XFxzKlxcKS8sXG4gIHJlZmxpbms6IC9eIT9cXFsobGFiZWwpXFxdXFxbKHJlZilcXF0vLFxuICBub2xpbms6IC9eIT9cXFsocmVmKVxcXSg/OlxcW1xcXSk/LyxcbiAgcmVmbGlua1NlYXJjaDogJ3JlZmxpbmt8bm9saW5rKD8hXFxcXCgpJyxcbiAgZW1TdHJvbmc6IHtcbiAgICBsRGVsaW06IC9eKD86XFwqKyg/OihbcHVuY3RfXSl8W15cXHMqXSkpfF5fKyg/OihbcHVuY3QqXSl8KFteXFxzX10pKS8sXG4gICAgLy8gICAgICAgICgxKSBhbmQgKDIpIGNhbiBvbmx5IGJlIGEgUmlnaHQgRGVsaW1pdGVyLiAoMykgYW5kICg0KSBjYW4gb25seSBiZSBMZWZ0LiAgKDUpIGFuZCAoNikgY2FuIGJlIGVpdGhlciBMZWZ0IG9yIFJpZ2h0LlxuICAgIC8vICAgICAgICAgICgpIFNraXAgb3JwaGFuIGluc2lkZSBzdHJvbmcgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICgpIENvbnN1bWUgdG8gZGVsaW0gICAgICgxKSAjKioqICAgICAgICAgICAgICAgICgyKSBhKioqIywgYSoqKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKDMpICMqKiphLCAqKiphICAgICAgICAgICAgICAgICAoNCkgKioqIyAgICAgICAgICAgICAgKDUpICMqKiojICAgICAgICAgICAgICAgICAoNikgYSoqKmFcbiAgICByRGVsaW1Bc3Q6IC9eKD86W15fKlxcXFxdfFxcXFwuKSo/XFxfXFxfKD86W15fKlxcXFxdfFxcXFwuKSo/XFwqKD86W15fKlxcXFxdfFxcXFwuKSo/KD89XFxfXFxfKXwoPzpbXipcXFxcXXxcXFxcLikrKD89W14qXSl8W3B1bmN0X10oXFwqKykoPz1bXFxzXXwkKXwoPzpbXnB1bmN0Kl9cXHNcXFxcXXxcXFxcLikoXFwqKykoPz1bcHVuY3RfXFxzXXwkKXxbcHVuY3RfXFxzXShcXCorKSg/PVtecHVuY3QqX1xcc10pfFtcXHNdKFxcKispKD89W3B1bmN0X10pfFtwdW5jdF9dKFxcKispKD89W3B1bmN0X10pfCg/OltecHVuY3QqX1xcc1xcXFxdfFxcXFwuKShcXCorKSg/PVtecHVuY3QqX1xcc10pLyxcbiAgICByRGVsaW1VbmQ6IC9eKD86W15fKlxcXFxdfFxcXFwuKSo/XFwqXFwqKD86W15fKlxcXFxdfFxcXFwuKSo/XFxfKD86W15fKlxcXFxdfFxcXFwuKSo/KD89XFwqXFwqKXwoPzpbXl9cXFxcXXxcXFxcLikrKD89W15fXSl8W3B1bmN0Kl0oXFxfKykoPz1bXFxzXXwkKXwoPzpbXnB1bmN0Kl9cXHNcXFxcXXxcXFxcLikoXFxfKykoPz1bcHVuY3QqXFxzXXwkKXxbcHVuY3QqXFxzXShcXF8rKSg/PVtecHVuY3QqX1xcc10pfFtcXHNdKFxcXyspKD89W3B1bmN0Kl0pfFtwdW5jdCpdKFxcXyspKD89W3B1bmN0Kl0pLyAvLyBeLSBOb3QgYWxsb3dlZCBmb3IgX1xuICB9LFxuICBjb2RlOiAvXihgKykoW15gXXxbXmBdW1xcc1xcU10qP1teYF0pXFwxKD8hYCkvLFxuICBicjogL14oIHsyLH18XFxcXClcXG4oPyFcXHMqJCkvLFxuICBkZWw6IG5vb3BUZXN0LFxuICB0ZXh0OiAvXihgK3xbXmBdKSg/Oig/PSB7Mix9XFxuKXxbXFxzXFxTXSo/KD86KD89W1xcXFw8IVxcW2AqX118XFxiX3wkKXxbXiBdKD89IHsyLH1cXG4pKSkvLFxuICBwdW5jdHVhdGlvbjogL14oW1xcc3B1bmN0dWF0aW9uXSkvXG59O1xuXG4vLyBsaXN0IG9mIHB1bmN0dWF0aW9uIG1hcmtzIGZyb20gQ29tbW9uTWFyayBzcGVjXG4vLyB3aXRob3V0ICogYW5kIF8gdG8gaGFuZGxlIHRoZSBkaWZmZXJlbnQgZW1waGFzaXMgbWFya2VycyAqIGFuZCBfXG5pbmxpbmUuX3B1bmN0dWF0aW9uID0gJyFcIiMkJSZcXCcoKStcXFxcLS4sLzo7PD0+P0BcXFxcW1xcXFxdYF57fH1+JztcbmlubGluZS5wdW5jdHVhdGlvbiA9IGVkaXQoaW5saW5lLnB1bmN0dWF0aW9uKS5yZXBsYWNlKC9wdW5jdHVhdGlvbi9nLCBpbmxpbmUuX3B1bmN0dWF0aW9uKS5nZXRSZWdleCgpO1xuXG4vLyBzZXF1ZW5jZXMgZW0gc2hvdWxkIHNraXAgb3ZlciBbdGl0bGVdKGxpbmspLCBgY29kZWAsIDxodG1sPlxuaW5saW5lLmJsb2NrU2tpcCA9IC9cXFtbXlxcXV0qP1xcXVxcKFteXFwpXSo/XFwpfGBbXmBdKj9gfDxbXj5dKj8+L2c7XG4vLyBsb29rYmVoaW5kIGlzIG5vdCBhdmFpbGFibGUgb24gU2FmYXJpIGFzIG9mIHZlcnNpb24gMTZcbi8vIGlubGluZS5lc2NhcGVkRW1TdCA9IC8oPzw9KD86XnxbXlxcXFwpKD86XFxcXFteXSkqKVxcXFxbKl9dL2c7XG5pbmxpbmUuZXNjYXBlZEVtU3QgPSAvKD86XnxbXlxcXFxdKSg/OlxcXFxcXFxcKSpcXFxcWypfXS9nO1xuXG5pbmxpbmUuX2NvbW1lbnQgPSBlZGl0KGJsb2NrLl9jb21tZW50KS5yZXBsYWNlKCcoPzotLT58JCknLCAnLS0+JykuZ2V0UmVnZXgoKTtcblxuaW5saW5lLmVtU3Ryb25nLmxEZWxpbSA9IGVkaXQoaW5saW5lLmVtU3Ryb25nLmxEZWxpbSlcbiAgLnJlcGxhY2UoL3B1bmN0L2csIGlubGluZS5fcHVuY3R1YXRpb24pXG4gIC5nZXRSZWdleCgpO1xuXG5pbmxpbmUuZW1TdHJvbmcuckRlbGltQXN0ID0gZWRpdChpbmxpbmUuZW1TdHJvbmcuckRlbGltQXN0LCAnZycpXG4gIC5yZXBsYWNlKC9wdW5jdC9nLCBpbmxpbmUuX3B1bmN0dWF0aW9uKVxuICAuZ2V0UmVnZXgoKTtcblxuaW5saW5lLmVtU3Ryb25nLnJEZWxpbVVuZCA9IGVkaXQoaW5saW5lLmVtU3Ryb25nLnJEZWxpbVVuZCwgJ2cnKVxuICAucmVwbGFjZSgvcHVuY3QvZywgaW5saW5lLl9wdW5jdHVhdGlvbilcbiAgLmdldFJlZ2V4KCk7XG5cbmlubGluZS5fZXNjYXBlcyA9IC9cXFxcKFshXCIjJCUmJygpKissXFwtLi86Ozw9Pj9AXFxbXFxdXFxcXF5fYHt8fX5dKS9nO1xuXG5pbmxpbmUuX3NjaGVtZSA9IC9bYS16QS1aXVthLXpBLVowLTkrLi1dezEsMzF9LztcbmlubGluZS5fZW1haWwgPSAvW2EtekEtWjAtOS4hIyQlJicqKy89P15fYHt8fX4tXSsoQClbYS16QS1aMC05XSg/OlthLXpBLVowLTktXXswLDYxfVthLXpBLVowLTldKT8oPzpcXC5bYS16QS1aMC05XSg/OlthLXpBLVowLTktXXswLDYxfVthLXpBLVowLTldKT8pKyg/IVstX10pLztcbmlubGluZS5hdXRvbGluayA9IGVkaXQoaW5saW5lLmF1dG9saW5rKVxuICAucmVwbGFjZSgnc2NoZW1lJywgaW5saW5lLl9zY2hlbWUpXG4gIC5yZXBsYWNlKCdlbWFpbCcsIGlubGluZS5fZW1haWwpXG4gIC5nZXRSZWdleCgpO1xuXG5pbmxpbmUuX2F0dHJpYnV0ZSA9IC9cXHMrW2EtekEtWjpfXVtcXHcuOi1dKig/Olxccyo9XFxzKlwiW15cIl0qXCJ8XFxzKj1cXHMqJ1teJ10qJ3xcXHMqPVxccypbXlxcc1wiJz08PmBdKyk/LztcblxuaW5saW5lLnRhZyA9IGVkaXQoaW5saW5lLnRhZylcbiAgLnJlcGxhY2UoJ2NvbW1lbnQnLCBpbmxpbmUuX2NvbW1lbnQpXG4gIC5yZXBsYWNlKCdhdHRyaWJ1dGUnLCBpbmxpbmUuX2F0dHJpYnV0ZSlcbiAgLmdldFJlZ2V4KCk7XG5cbmlubGluZS5fbGFiZWwgPSAvKD86XFxbKD86XFxcXC58W15cXFtcXF1cXFxcXSkqXFxdfFxcXFwufGBbXmBdKmB8W15cXFtcXF1cXFxcYF0pKj8vO1xuaW5saW5lLl9ocmVmID0gLzwoPzpcXFxcLnxbXlxcbjw+XFxcXF0pKz58W15cXHNcXHgwMC1cXHgxZl0qLztcbmlubGluZS5fdGl0bGUgPSAvXCIoPzpcXFxcXCI/fFteXCJcXFxcXSkqXCJ8Jyg/OlxcXFwnP3xbXidcXFxcXSkqJ3xcXCgoPzpcXFxcXFwpP3xbXilcXFxcXSkqXFwpLztcblxuaW5saW5lLmxpbmsgPSBlZGl0KGlubGluZS5saW5rKVxuICAucmVwbGFjZSgnbGFiZWwnLCBpbmxpbmUuX2xhYmVsKVxuICAucmVwbGFjZSgnaHJlZicsIGlubGluZS5faHJlZilcbiAgLnJlcGxhY2UoJ3RpdGxlJywgaW5saW5lLl90aXRsZSlcbiAgLmdldFJlZ2V4KCk7XG5cbmlubGluZS5yZWZsaW5rID0gZWRpdChpbmxpbmUucmVmbGluaylcbiAgLnJlcGxhY2UoJ2xhYmVsJywgaW5saW5lLl9sYWJlbClcbiAgLnJlcGxhY2UoJ3JlZicsIGJsb2NrLl9sYWJlbClcbiAgLmdldFJlZ2V4KCk7XG5cbmlubGluZS5ub2xpbmsgPSBlZGl0KGlubGluZS5ub2xpbmspXG4gIC5yZXBsYWNlKCdyZWYnLCBibG9jay5fbGFiZWwpXG4gIC5nZXRSZWdleCgpO1xuXG5pbmxpbmUucmVmbGlua1NlYXJjaCA9IGVkaXQoaW5saW5lLnJlZmxpbmtTZWFyY2gsICdnJylcbiAgLnJlcGxhY2UoJ3JlZmxpbmsnLCBpbmxpbmUucmVmbGluaylcbiAgLnJlcGxhY2UoJ25vbGluaycsIGlubGluZS5ub2xpbmspXG4gIC5nZXRSZWdleCgpO1xuXG4vKipcbiAqIE5vcm1hbCBJbmxpbmUgR3JhbW1hclxuICovXG5cbmlubGluZS5ub3JtYWwgPSB7IC4uLmlubGluZSB9O1xuXG4vKipcbiAqIFBlZGFudGljIElubGluZSBHcmFtbWFyXG4gKi9cblxuaW5saW5lLnBlZGFudGljID0ge1xuICAuLi5pbmxpbmUubm9ybWFsLFxuICBzdHJvbmc6IHtcbiAgICBzdGFydDogL15fX3xcXCpcXCovLFxuICAgIG1pZGRsZTogL15fXyg/PVxcUykoW1xcc1xcU10qP1xcUylfXyg/IV8pfF5cXCpcXCooPz1cXFMpKFtcXHNcXFNdKj9cXFMpXFwqXFwqKD8hXFwqKS8sXG4gICAgZW5kQXN0OiAvXFwqXFwqKD8hXFwqKS9nLFxuICAgIGVuZFVuZDogL19fKD8hXykvZ1xuICB9LFxuICBlbToge1xuICAgIHN0YXJ0OiAvXl98XFwqLyxcbiAgICBtaWRkbGU6IC9eKClcXCooPz1cXFMpKFtcXHNcXFNdKj9cXFMpXFwqKD8hXFwqKXxeXyg/PVxcUykoW1xcc1xcU10qP1xcUylfKD8hXykvLFxuICAgIGVuZEFzdDogL1xcKig/IVxcKikvZyxcbiAgICBlbmRVbmQ6IC9fKD8hXykvZ1xuICB9LFxuICBsaW5rOiBlZGl0KC9eIT9cXFsobGFiZWwpXFxdXFwoKC4qPylcXCkvKVxuICAgIC5yZXBsYWNlKCdsYWJlbCcsIGlubGluZS5fbGFiZWwpXG4gICAgLmdldFJlZ2V4KCksXG4gIHJlZmxpbms6IGVkaXQoL14hP1xcWyhsYWJlbClcXF1cXHMqXFxbKFteXFxdXSopXFxdLylcbiAgICAucmVwbGFjZSgnbGFiZWwnLCBpbmxpbmUuX2xhYmVsKVxuICAgIC5nZXRSZWdleCgpXG59O1xuXG4vKipcbiAqIEdGTSBJbmxpbmUgR3JhbW1hclxuICovXG5cbmlubGluZS5nZm0gPSB7XG4gIC4uLmlubGluZS5ub3JtYWwsXG4gIGVzY2FwZTogZWRpdChpbmxpbmUuZXNjYXBlKS5yZXBsYWNlKCddKScsICd+fF0pJykuZ2V0UmVnZXgoKSxcbiAgX2V4dGVuZGVkX2VtYWlsOiAvW0EtWmEtejAtOS5fKy1dKyhAKVthLXpBLVowLTktX10rKD86XFwuW2EtekEtWjAtOS1fXSpbYS16QS1aMC05XSkrKD8hWy1fXSkvLFxuICB1cmw6IC9eKCg/OmZ0cHxodHRwcz8pOlxcL1xcL3x3d3dcXC4pKD86W2EtekEtWjAtOVxcLV0rXFwuPykrW15cXHM8XSp8XmVtYWlsLyxcbiAgX2JhY2twZWRhbDogLyg/OltePyEuLDo7Kl8nXCJ+KCkmXSt8XFwoW14pXSpcXCl8Jig/IVthLXpBLVowLTldKzskKXxbPyEuLDo7Kl8nXCJ+KV0rKD8hJCkpKy8sXG4gIGRlbDogL14ofn4/KSg/PVteXFxzfl0pKFtcXHNcXFNdKj9bXlxcc35dKVxcMSg/PVtefl18JCkvLFxuICB0ZXh0OiAvXihbYH5dK3xbXmB+XSkoPzooPz0gezIsfVxcbil8KD89W2EtekEtWjAtOS4hIyQlJicqK1xcLz0/X2B7XFx8fX4tXStAKXxbXFxzXFxTXSo/KD86KD89W1xcXFw8IVxcW2Aqfl9dfFxcYl98aHR0cHM/OlxcL1xcL3xmdHA6XFwvXFwvfHd3d1xcLnwkKXxbXiBdKD89IHsyLH1cXG4pfFteYS16QS1aMC05LiEjJCUmJyorXFwvPT9fYHtcXHx9fi1dKD89W2EtekEtWjAtOS4hIyQlJicqK1xcLz0/X2B7XFx8fX4tXStAKSkpL1xufTtcblxuaW5saW5lLmdmbS51cmwgPSBlZGl0KGlubGluZS5nZm0udXJsLCAnaScpXG4gIC5yZXBsYWNlKCdlbWFpbCcsIGlubGluZS5nZm0uX2V4dGVuZGVkX2VtYWlsKVxuICAuZ2V0UmVnZXgoKTtcbi8qKlxuICogR0ZNICsgTGluZSBCcmVha3MgSW5saW5lIEdyYW1tYXJcbiAqL1xuXG5pbmxpbmUuYnJlYWtzID0ge1xuICAuLi5pbmxpbmUuZ2ZtLFxuICBicjogZWRpdChpbmxpbmUuYnIpLnJlcGxhY2UoJ3syLH0nLCAnKicpLmdldFJlZ2V4KCksXG4gIHRleHQ6IGVkaXQoaW5saW5lLmdmbS50ZXh0KVxuICAgIC5yZXBsYWNlKCdcXFxcYl8nLCAnXFxcXGJffCB7Mix9XFxcXG4nKVxuICAgIC5yZXBsYWNlKC9cXHsyLFxcfS9nLCAnKicpXG4gICAgLmdldFJlZ2V4KClcbn07XG5cbi8qKlxuICogc21hcnR5cGFudHMgdGV4dCByZXBsYWNlbWVudFxuICogQHBhcmFtIHtzdHJpbmd9IHRleHRcbiAqL1xuZnVuY3Rpb24gc21hcnR5cGFudHModGV4dCkge1xuICByZXR1cm4gdGV4dFxuICAgIC8vIGVtLWRhc2hlc1xuICAgIC5yZXBsYWNlKC8tLS0vZywgJ1xcdTIwMTQnKVxuICAgIC8vIGVuLWRhc2hlc1xuICAgIC5yZXBsYWNlKC8tLS9nLCAnXFx1MjAxMycpXG4gICAgLy8gb3BlbmluZyBzaW5nbGVzXG4gICAgLnJlcGxhY2UoLyhefFstXFx1MjAxNC8oXFxbe1wiXFxzXSknL2csICckMVxcdTIwMTgnKVxuICAgIC8vIGNsb3Npbmcgc2luZ2xlcyAmIGFwb3N0cm9waGVzXG4gICAgLnJlcGxhY2UoLycvZywgJ1xcdTIwMTknKVxuICAgIC8vIG9wZW5pbmcgZG91Ymxlc1xuICAgIC5yZXBsYWNlKC8oXnxbLVxcdTIwMTQvKFxcW3tcXHUyMDE4XFxzXSlcIi9nLCAnJDFcXHUyMDFjJylcbiAgICAvLyBjbG9zaW5nIGRvdWJsZXNcbiAgICAucmVwbGFjZSgvXCIvZywgJ1xcdTIwMWQnKVxuICAgIC8vIGVsbGlwc2VzXG4gICAgLnJlcGxhY2UoL1xcLnszfS9nLCAnXFx1MjAyNicpO1xufVxuXG4vKipcbiAqIG1hbmdsZSBlbWFpbCBhZGRyZXNzZXNcbiAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0XG4gKi9cbmZ1bmN0aW9uIG1hbmdsZSh0ZXh0KSB7XG4gIGxldCBvdXQgPSAnJyxcbiAgICBpLFxuICAgIGNoO1xuXG4gIGNvbnN0IGwgPSB0ZXh0Lmxlbmd0aDtcbiAgZm9yIChpID0gMDsgaSA8IGw7IGkrKykge1xuICAgIGNoID0gdGV4dC5jaGFyQ29kZUF0KGkpO1xuICAgIGlmIChNYXRoLnJhbmRvbSgpID4gMC41KSB7XG4gICAgICBjaCA9ICd4JyArIGNoLnRvU3RyaW5nKDE2KTtcbiAgICB9XG4gICAgb3V0ICs9ICcmIycgKyBjaCArICc7JztcbiAgfVxuXG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQmxvY2sgTGV4ZXJcbiAqL1xuY2xhc3MgTGV4ZXIge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgdGhpcy50b2tlbnMgPSBbXTtcbiAgICB0aGlzLnRva2Vucy5saW5rcyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyB8fCBkZWZhdWx0cztcbiAgICB0aGlzLm9wdGlvbnMudG9rZW5pemVyID0gdGhpcy5vcHRpb25zLnRva2VuaXplciB8fCBuZXcgVG9rZW5pemVyKCk7XG4gICAgdGhpcy50b2tlbml6ZXIgPSB0aGlzLm9wdGlvbnMudG9rZW5pemVyO1xuICAgIHRoaXMudG9rZW5pemVyLm9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG4gICAgdGhpcy50b2tlbml6ZXIubGV4ZXIgPSB0aGlzO1xuICAgIHRoaXMuaW5saW5lUXVldWUgPSBbXTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgaW5MaW5rOiBmYWxzZSxcbiAgICAgIGluUmF3QmxvY2s6IGZhbHNlLFxuICAgICAgdG9wOiB0cnVlXG4gICAgfTtcblxuICAgIGNvbnN0IHJ1bGVzID0ge1xuICAgICAgYmxvY2s6IGJsb2NrLm5vcm1hbCxcbiAgICAgIGlubGluZTogaW5saW5lLm5vcm1hbFxuICAgIH07XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLnBlZGFudGljKSB7XG4gICAgICBydWxlcy5ibG9jayA9IGJsb2NrLnBlZGFudGljO1xuICAgICAgcnVsZXMuaW5saW5lID0gaW5saW5lLnBlZGFudGljO1xuICAgIH0gZWxzZSBpZiAodGhpcy5vcHRpb25zLmdmbSkge1xuICAgICAgcnVsZXMuYmxvY2sgPSBibG9jay5nZm07XG4gICAgICBpZiAodGhpcy5vcHRpb25zLmJyZWFrcykge1xuICAgICAgICBydWxlcy5pbmxpbmUgPSBpbmxpbmUuYnJlYWtzO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcnVsZXMuaW5saW5lID0gaW5saW5lLmdmbTtcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy50b2tlbml6ZXIucnVsZXMgPSBydWxlcztcbiAgfVxuXG4gIC8qKlxuICAgKiBFeHBvc2UgUnVsZXNcbiAgICovXG4gIHN0YXRpYyBnZXQgcnVsZXMoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGJsb2NrLFxuICAgICAgaW5saW5lXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGF0aWMgTGV4IE1ldGhvZFxuICAgKi9cbiAgc3RhdGljIGxleChzcmMsIG9wdGlvbnMpIHtcbiAgICBjb25zdCBsZXhlciA9IG5ldyBMZXhlcihvcHRpb25zKTtcbiAgICByZXR1cm4gbGV4ZXIubGV4KHNyYyk7XG4gIH1cblxuICAvKipcbiAgICogU3RhdGljIExleCBJbmxpbmUgTWV0aG9kXG4gICAqL1xuICBzdGF0aWMgbGV4SW5saW5lKHNyYywgb3B0aW9ucykge1xuICAgIGNvbnN0IGxleGVyID0gbmV3IExleGVyKG9wdGlvbnMpO1xuICAgIHJldHVybiBsZXhlci5pbmxpbmVUb2tlbnMoc3JjKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQcmVwcm9jZXNzaW5nXG4gICAqL1xuICBsZXgoc3JjKSB7XG4gICAgc3JjID0gc3JjXG4gICAgICAucmVwbGFjZSgvXFxyXFxufFxcci9nLCAnXFxuJyk7XG5cbiAgICB0aGlzLmJsb2NrVG9rZW5zKHNyYywgdGhpcy50b2tlbnMpO1xuXG4gICAgbGV0IG5leHQ7XG4gICAgd2hpbGUgKG5leHQgPSB0aGlzLmlubGluZVF1ZXVlLnNoaWZ0KCkpIHtcbiAgICAgIHRoaXMuaW5saW5lVG9rZW5zKG5leHQuc3JjLCBuZXh0LnRva2Vucyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMudG9rZW5zO1xuICB9XG5cbiAgLyoqXG4gICAqIExleGluZ1xuICAgKi9cbiAgYmxvY2tUb2tlbnMoc3JjLCB0b2tlbnMgPSBbXSkge1xuICAgIGlmICh0aGlzLm9wdGlvbnMucGVkYW50aWMpIHtcbiAgICAgIHNyYyA9IHNyYy5yZXBsYWNlKC9cXHQvZywgJyAgICAnKS5yZXBsYWNlKC9eICskL2dtLCAnJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNyYyA9IHNyYy5yZXBsYWNlKC9eKCAqKShcXHQrKS9nbSwgKF8sIGxlYWRpbmcsIHRhYnMpID0+IHtcbiAgICAgICAgcmV0dXJuIGxlYWRpbmcgKyAnICAgICcucmVwZWF0KHRhYnMubGVuZ3RoKTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGxldCB0b2tlbiwgbGFzdFRva2VuLCBjdXRTcmMsIGxhc3RQYXJhZ3JhcGhDbGlwcGVkO1xuXG4gICAgd2hpbGUgKHNyYykge1xuICAgICAgaWYgKHRoaXMub3B0aW9ucy5leHRlbnNpb25zXG4gICAgICAgICYmIHRoaXMub3B0aW9ucy5leHRlbnNpb25zLmJsb2NrXG4gICAgICAgICYmIHRoaXMub3B0aW9ucy5leHRlbnNpb25zLmJsb2NrLnNvbWUoKGV4dFRva2VuaXplcikgPT4ge1xuICAgICAgICAgIGlmICh0b2tlbiA9IGV4dFRva2VuaXplci5jYWxsKHsgbGV4ZXI6IHRoaXMgfSwgc3JjLCB0b2tlbnMpKSB7XG4gICAgICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSkpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIG5ld2xpbmVcbiAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLnNwYWNlKHNyYykpIHtcbiAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgaWYgKHRva2VuLnJhdy5sZW5ndGggPT09IDEgJiYgdG9rZW5zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAvLyBpZiB0aGVyZSdzIGEgc2luZ2xlIFxcbiBhcyBhIHNwYWNlciwgaXQncyB0ZXJtaW5hdGluZyB0aGUgbGFzdCBsaW5lLFxuICAgICAgICAgIC8vIHNvIG1vdmUgaXQgdGhlcmUgc28gdGhhdCB3ZSBkb24ndCBnZXQgdW5lY2Vzc2FyeSBwYXJhZ3JhcGggdGFnc1xuICAgICAgICAgIHRva2Vuc1t0b2tlbnMubGVuZ3RoIC0gMV0ucmF3ICs9ICdcXG4nO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgfVxuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gY29kZVxuICAgICAgaWYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIuY29kZShzcmMpKSB7XG4gICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgIGxhc3RUb2tlbiA9IHRva2Vuc1t0b2tlbnMubGVuZ3RoIC0gMV07XG4gICAgICAgIC8vIEFuIGluZGVudGVkIGNvZGUgYmxvY2sgY2Fubm90IGludGVycnVwdCBhIHBhcmFncmFwaC5cbiAgICAgICAgaWYgKGxhc3RUb2tlbiAmJiAobGFzdFRva2VuLnR5cGUgPT09ICdwYXJhZ3JhcGgnIHx8IGxhc3RUb2tlbi50eXBlID09PSAndGV4dCcpKSB7XG4gICAgICAgICAgbGFzdFRva2VuLnJhdyArPSAnXFxuJyArIHRva2VuLnJhdztcbiAgICAgICAgICBsYXN0VG9rZW4udGV4dCArPSAnXFxuJyArIHRva2VuLnRleHQ7XG4gICAgICAgICAgdGhpcy5pbmxpbmVRdWV1ZVt0aGlzLmlubGluZVF1ZXVlLmxlbmd0aCAtIDFdLnNyYyA9IGxhc3RUb2tlbi50ZXh0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgfVxuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gZmVuY2VzXG4gICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci5mZW5jZXMoc3JjKSkge1xuICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBoZWFkaW5nXG4gICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci5oZWFkaW5nKHNyYykpIHtcbiAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gaHJcbiAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLmhyKHNyYykpIHtcbiAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gYmxvY2txdW90ZVxuICAgICAgaWYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIuYmxvY2txdW90ZShzcmMpKSB7XG4gICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIGxpc3RcbiAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLmxpc3Qoc3JjKSkge1xuICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBodG1sXG4gICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci5odG1sKHNyYykpIHtcbiAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gZGVmXG4gICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci5kZWYoc3JjKSkge1xuICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICBsYXN0VG9rZW4gPSB0b2tlbnNbdG9rZW5zLmxlbmd0aCAtIDFdO1xuICAgICAgICBpZiAobGFzdFRva2VuICYmIChsYXN0VG9rZW4udHlwZSA9PT0gJ3BhcmFncmFwaCcgfHwgbGFzdFRva2VuLnR5cGUgPT09ICd0ZXh0JykpIHtcbiAgICAgICAgICBsYXN0VG9rZW4ucmF3ICs9ICdcXG4nICsgdG9rZW4ucmF3O1xuICAgICAgICAgIGxhc3RUb2tlbi50ZXh0ICs9ICdcXG4nICsgdG9rZW4ucmF3O1xuICAgICAgICAgIHRoaXMuaW5saW5lUXVldWVbdGhpcy5pbmxpbmVRdWV1ZS5sZW5ndGggLSAxXS5zcmMgPSBsYXN0VG9rZW4udGV4dDtcbiAgICAgICAgfSBlbHNlIGlmICghdGhpcy50b2tlbnMubGlua3NbdG9rZW4udGFnXSkge1xuICAgICAgICAgIHRoaXMudG9rZW5zLmxpbmtzW3Rva2VuLnRhZ10gPSB7XG4gICAgICAgICAgICBocmVmOiB0b2tlbi5ocmVmLFxuICAgICAgICAgICAgdGl0bGU6IHRva2VuLnRpdGxlXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gdGFibGUgKGdmbSlcbiAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLnRhYmxlKHNyYykpIHtcbiAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gbGhlYWRpbmdcbiAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLmxoZWFkaW5nKHNyYykpIHtcbiAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gdG9wLWxldmVsIHBhcmFncmFwaFxuICAgICAgLy8gcHJldmVudCBwYXJhZ3JhcGggY29uc3VtaW5nIGV4dGVuc2lvbnMgYnkgY2xpcHBpbmcgJ3NyYycgdG8gZXh0ZW5zaW9uIHN0YXJ0XG4gICAgICBjdXRTcmMgPSBzcmM7XG4gICAgICBpZiAodGhpcy5vcHRpb25zLmV4dGVuc2lvbnMgJiYgdGhpcy5vcHRpb25zLmV4dGVuc2lvbnMuc3RhcnRCbG9jaykge1xuICAgICAgICBsZXQgc3RhcnRJbmRleCA9IEluZmluaXR5O1xuICAgICAgICBjb25zdCB0ZW1wU3JjID0gc3JjLnNsaWNlKDEpO1xuICAgICAgICBsZXQgdGVtcFN0YXJ0O1xuICAgICAgICB0aGlzLm9wdGlvbnMuZXh0ZW5zaW9ucy5zdGFydEJsb2NrLmZvckVhY2goZnVuY3Rpb24oZ2V0U3RhcnRJbmRleCkge1xuICAgICAgICAgIHRlbXBTdGFydCA9IGdldFN0YXJ0SW5kZXguY2FsbCh7IGxleGVyOiB0aGlzIH0sIHRlbXBTcmMpO1xuICAgICAgICAgIGlmICh0eXBlb2YgdGVtcFN0YXJ0ID09PSAnbnVtYmVyJyAmJiB0ZW1wU3RhcnQgPj0gMCkgeyBzdGFydEluZGV4ID0gTWF0aC5taW4oc3RhcnRJbmRleCwgdGVtcFN0YXJ0KTsgfVxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKHN0YXJ0SW5kZXggPCBJbmZpbml0eSAmJiBzdGFydEluZGV4ID49IDApIHtcbiAgICAgICAgICBjdXRTcmMgPSBzcmMuc3Vic3RyaW5nKDAsIHN0YXJ0SW5kZXggKyAxKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHRoaXMuc3RhdGUudG9wICYmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLnBhcmFncmFwaChjdXRTcmMpKSkge1xuICAgICAgICBsYXN0VG9rZW4gPSB0b2tlbnNbdG9rZW5zLmxlbmd0aCAtIDFdO1xuICAgICAgICBpZiAobGFzdFBhcmFncmFwaENsaXBwZWQgJiYgbGFzdFRva2VuLnR5cGUgPT09ICdwYXJhZ3JhcGgnKSB7XG4gICAgICAgICAgbGFzdFRva2VuLnJhdyArPSAnXFxuJyArIHRva2VuLnJhdztcbiAgICAgICAgICBsYXN0VG9rZW4udGV4dCArPSAnXFxuJyArIHRva2VuLnRleHQ7XG4gICAgICAgICAgdGhpcy5pbmxpbmVRdWV1ZS5wb3AoKTtcbiAgICAgICAgICB0aGlzLmlubGluZVF1ZXVlW3RoaXMuaW5saW5lUXVldWUubGVuZ3RoIC0gMV0uc3JjID0gbGFzdFRva2VuLnRleHQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICB9XG4gICAgICAgIGxhc3RQYXJhZ3JhcGhDbGlwcGVkID0gKGN1dFNyYy5sZW5ndGggIT09IHNyYy5sZW5ndGgpO1xuICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gdGV4dFxuICAgICAgaWYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIudGV4dChzcmMpKSB7XG4gICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgIGxhc3RUb2tlbiA9IHRva2Vuc1t0b2tlbnMubGVuZ3RoIC0gMV07XG4gICAgICAgIGlmIChsYXN0VG9rZW4gJiYgbGFzdFRva2VuLnR5cGUgPT09ICd0ZXh0Jykge1xuICAgICAgICAgIGxhc3RUb2tlbi5yYXcgKz0gJ1xcbicgKyB0b2tlbi5yYXc7XG4gICAgICAgICAgbGFzdFRva2VuLnRleHQgKz0gJ1xcbicgKyB0b2tlbi50ZXh0O1xuICAgICAgICAgIHRoaXMuaW5saW5lUXVldWUucG9wKCk7XG4gICAgICAgICAgdGhpcy5pbmxpbmVRdWV1ZVt0aGlzLmlubGluZVF1ZXVlLmxlbmd0aCAtIDFdLnNyYyA9IGxhc3RUb2tlbi50ZXh0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgfVxuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKHNyYykge1xuICAgICAgICBjb25zdCBlcnJNc2cgPSAnSW5maW5pdGUgbG9vcCBvbiBieXRlOiAnICsgc3JjLmNoYXJDb2RlQXQoMCk7XG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuc2lsZW50KSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihlcnJNc2cpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJNc2cpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5zdGF0ZS50b3AgPSB0cnVlO1xuICAgIHJldHVybiB0b2tlbnM7XG4gIH1cblxuICBpbmxpbmUoc3JjLCB0b2tlbnMgPSBbXSkge1xuICAgIHRoaXMuaW5saW5lUXVldWUucHVzaCh7IHNyYywgdG9rZW5zIH0pO1xuICAgIHJldHVybiB0b2tlbnM7XG4gIH1cblxuICAvKipcbiAgICogTGV4aW5nL0NvbXBpbGluZ1xuICAgKi9cbiAgaW5saW5lVG9rZW5zKHNyYywgdG9rZW5zID0gW10pIHtcbiAgICBsZXQgdG9rZW4sIGxhc3RUb2tlbiwgY3V0U3JjO1xuXG4gICAgLy8gU3RyaW5nIHdpdGggbGlua3MgbWFza2VkIHRvIGF2b2lkIGludGVyZmVyZW5jZSB3aXRoIGVtIGFuZCBzdHJvbmdcbiAgICBsZXQgbWFza2VkU3JjID0gc3JjO1xuICAgIGxldCBtYXRjaDtcbiAgICBsZXQga2VlcFByZXZDaGFyLCBwcmV2Q2hhcjtcblxuICAgIC8vIE1hc2sgb3V0IHJlZmxpbmtzXG4gICAgaWYgKHRoaXMudG9rZW5zLmxpbmtzKSB7XG4gICAgICBjb25zdCBsaW5rcyA9IE9iamVjdC5rZXlzKHRoaXMudG9rZW5zLmxpbmtzKTtcbiAgICAgIGlmIChsaW5rcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHdoaWxlICgobWF0Y2ggPSB0aGlzLnRva2VuaXplci5ydWxlcy5pbmxpbmUucmVmbGlua1NlYXJjaC5leGVjKG1hc2tlZFNyYykpICE9IG51bGwpIHtcbiAgICAgICAgICBpZiAobGlua3MuaW5jbHVkZXMobWF0Y2hbMF0uc2xpY2UobWF0Y2hbMF0ubGFzdEluZGV4T2YoJ1snKSArIDEsIC0xKSkpIHtcbiAgICAgICAgICAgIG1hc2tlZFNyYyA9IG1hc2tlZFNyYy5zbGljZSgwLCBtYXRjaC5pbmRleCkgKyAnWycgKyByZXBlYXRTdHJpbmcoJ2EnLCBtYXRjaFswXS5sZW5ndGggLSAyKSArICddJyArIG1hc2tlZFNyYy5zbGljZSh0aGlzLnRva2VuaXplci5ydWxlcy5pbmxpbmUucmVmbGlua1NlYXJjaC5sYXN0SW5kZXgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICAvLyBNYXNrIG91dCBvdGhlciBibG9ja3NcbiAgICB3aGlsZSAoKG1hdGNoID0gdGhpcy50b2tlbml6ZXIucnVsZXMuaW5saW5lLmJsb2NrU2tpcC5leGVjKG1hc2tlZFNyYykpICE9IG51bGwpIHtcbiAgICAgIG1hc2tlZFNyYyA9IG1hc2tlZFNyYy5zbGljZSgwLCBtYXRjaC5pbmRleCkgKyAnWycgKyByZXBlYXRTdHJpbmcoJ2EnLCBtYXRjaFswXS5sZW5ndGggLSAyKSArICddJyArIG1hc2tlZFNyYy5zbGljZSh0aGlzLnRva2VuaXplci5ydWxlcy5pbmxpbmUuYmxvY2tTa2lwLmxhc3RJbmRleCk7XG4gICAgfVxuXG4gICAgLy8gTWFzayBvdXQgZXNjYXBlZCBlbSAmIHN0cm9uZyBkZWxpbWl0ZXJzXG4gICAgd2hpbGUgKChtYXRjaCA9IHRoaXMudG9rZW5pemVyLnJ1bGVzLmlubGluZS5lc2NhcGVkRW1TdC5leGVjKG1hc2tlZFNyYykpICE9IG51bGwpIHtcbiAgICAgIG1hc2tlZFNyYyA9IG1hc2tlZFNyYy5zbGljZSgwLCBtYXRjaC5pbmRleCArIG1hdGNoWzBdLmxlbmd0aCAtIDIpICsgJysrJyArIG1hc2tlZFNyYy5zbGljZSh0aGlzLnRva2VuaXplci5ydWxlcy5pbmxpbmUuZXNjYXBlZEVtU3QubGFzdEluZGV4KTtcbiAgICAgIHRoaXMudG9rZW5pemVyLnJ1bGVzLmlubGluZS5lc2NhcGVkRW1TdC5sYXN0SW5kZXgtLTtcbiAgICB9XG5cbiAgICB3aGlsZSAoc3JjKSB7XG4gICAgICBpZiAoIWtlZXBQcmV2Q2hhcikge1xuICAgICAgICBwcmV2Q2hhciA9ICcnO1xuICAgICAgfVxuICAgICAga2VlcFByZXZDaGFyID0gZmFsc2U7XG5cbiAgICAgIC8vIGV4dGVuc2lvbnNcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuZXh0ZW5zaW9uc1xuICAgICAgICAmJiB0aGlzLm9wdGlvbnMuZXh0ZW5zaW9ucy5pbmxpbmVcbiAgICAgICAgJiYgdGhpcy5vcHRpb25zLmV4dGVuc2lvbnMuaW5saW5lLnNvbWUoKGV4dFRva2VuaXplcikgPT4ge1xuICAgICAgICAgIGlmICh0b2tlbiA9IGV4dFRva2VuaXplci5jYWxsKHsgbGV4ZXI6IHRoaXMgfSwgc3JjLCB0b2tlbnMpKSB7XG4gICAgICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSkpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIGVzY2FwZVxuICAgICAgaWYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIuZXNjYXBlKHNyYykpIHtcbiAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gdGFnXG4gICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci50YWcoc3JjKSkge1xuICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICBsYXN0VG9rZW4gPSB0b2tlbnNbdG9rZW5zLmxlbmd0aCAtIDFdO1xuICAgICAgICBpZiAobGFzdFRva2VuICYmIHRva2VuLnR5cGUgPT09ICd0ZXh0JyAmJiBsYXN0VG9rZW4udHlwZSA9PT0gJ3RleHQnKSB7XG4gICAgICAgICAgbGFzdFRva2VuLnJhdyArPSB0b2tlbi5yYXc7XG4gICAgICAgICAgbGFzdFRva2VuLnRleHQgKz0gdG9rZW4udGV4dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgIH1cbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIGxpbmtcbiAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLmxpbmsoc3JjKSkge1xuICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyByZWZsaW5rLCBub2xpbmtcbiAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLnJlZmxpbmsoc3JjLCB0aGlzLnRva2Vucy5saW5rcykpIHtcbiAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgbGFzdFRva2VuID0gdG9rZW5zW3Rva2Vucy5sZW5ndGggLSAxXTtcbiAgICAgICAgaWYgKGxhc3RUb2tlbiAmJiB0b2tlbi50eXBlID09PSAndGV4dCcgJiYgbGFzdFRva2VuLnR5cGUgPT09ICd0ZXh0Jykge1xuICAgICAgICAgIGxhc3RUb2tlbi5yYXcgKz0gdG9rZW4ucmF3O1xuICAgICAgICAgIGxhc3RUb2tlbi50ZXh0ICs9IHRva2VuLnRleHQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICB9XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBlbSAmIHN0cm9uZ1xuICAgICAgaWYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIuZW1TdHJvbmcoc3JjLCBtYXNrZWRTcmMsIHByZXZDaGFyKSkge1xuICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBjb2RlXG4gICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci5jb2Rlc3BhbihzcmMpKSB7XG4gICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIGJyXG4gICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci5icihzcmMpKSB7XG4gICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIGRlbCAoZ2ZtKVxuICAgICAgaWYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIuZGVsKHNyYykpIHtcbiAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gYXV0b2xpbmtcbiAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLmF1dG9saW5rKHNyYywgbWFuZ2xlKSkge1xuICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyB1cmwgKGdmbSlcbiAgICAgIGlmICghdGhpcy5zdGF0ZS5pbkxpbmsgJiYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIudXJsKHNyYywgbWFuZ2xlKSkpIHtcbiAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gdGV4dFxuICAgICAgLy8gcHJldmVudCBpbmxpbmVUZXh0IGNvbnN1bWluZyBleHRlbnNpb25zIGJ5IGNsaXBwaW5nICdzcmMnIHRvIGV4dGVuc2lvbiBzdGFydFxuICAgICAgY3V0U3JjID0gc3JjO1xuICAgICAgaWYgKHRoaXMub3B0aW9ucy5leHRlbnNpb25zICYmIHRoaXMub3B0aW9ucy5leHRlbnNpb25zLnN0YXJ0SW5saW5lKSB7XG4gICAgICAgIGxldCBzdGFydEluZGV4ID0gSW5maW5pdHk7XG4gICAgICAgIGNvbnN0IHRlbXBTcmMgPSBzcmMuc2xpY2UoMSk7XG4gICAgICAgIGxldCB0ZW1wU3RhcnQ7XG4gICAgICAgIHRoaXMub3B0aW9ucy5leHRlbnNpb25zLnN0YXJ0SW5saW5lLmZvckVhY2goZnVuY3Rpb24oZ2V0U3RhcnRJbmRleCkge1xuICAgICAgICAgIHRlbXBTdGFydCA9IGdldFN0YXJ0SW5kZXguY2FsbCh7IGxleGVyOiB0aGlzIH0sIHRlbXBTcmMpO1xuICAgICAgICAgIGlmICh0eXBlb2YgdGVtcFN0YXJ0ID09PSAnbnVtYmVyJyAmJiB0ZW1wU3RhcnQgPj0gMCkgeyBzdGFydEluZGV4ID0gTWF0aC5taW4oc3RhcnRJbmRleCwgdGVtcFN0YXJ0KTsgfVxuICAgICAgICB9KTtcbiAgICAgICAgaWYgKHN0YXJ0SW5kZXggPCBJbmZpbml0eSAmJiBzdGFydEluZGV4ID49IDApIHtcbiAgICAgICAgICBjdXRTcmMgPSBzcmMuc3Vic3RyaW5nKDAsIHN0YXJ0SW5kZXggKyAxKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIuaW5saW5lVGV4dChjdXRTcmMsIHNtYXJ0eXBhbnRzKSkge1xuICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICBpZiAodG9rZW4ucmF3LnNsaWNlKC0xKSAhPT0gJ18nKSB7IC8vIFRyYWNrIHByZXZDaGFyIGJlZm9yZSBzdHJpbmcgb2YgX19fXyBzdGFydGVkXG4gICAgICAgICAgcHJldkNoYXIgPSB0b2tlbi5yYXcuc2xpY2UoLTEpO1xuICAgICAgICB9XG4gICAgICAgIGtlZXBQcmV2Q2hhciA9IHRydWU7XG4gICAgICAgIGxhc3RUb2tlbiA9IHRva2Vuc1t0b2tlbnMubGVuZ3RoIC0gMV07XG4gICAgICAgIGlmIChsYXN0VG9rZW4gJiYgbGFzdFRva2VuLnR5cGUgPT09ICd0ZXh0Jykge1xuICAgICAgICAgIGxhc3RUb2tlbi5yYXcgKz0gdG9rZW4ucmF3O1xuICAgICAgICAgIGxhc3RUb2tlbi50ZXh0ICs9IHRva2VuLnRleHQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICB9XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAoc3JjKSB7XG4gICAgICAgIGNvbnN0IGVyck1zZyA9ICdJbmZpbml0ZSBsb29wIG9uIGJ5dGU6ICcgKyBzcmMuY2hhckNvZGVBdCgwKTtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5zaWxlbnQpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGVyck1zZyk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVyck1zZyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdG9rZW5zO1xuICB9XG59XG5cbi8qKlxuICogUmVuZGVyZXJcbiAqL1xuY2xhc3MgUmVuZGVyZXIge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyB8fCBkZWZhdWx0cztcbiAgfVxuXG4gIGNvZGUoY29kZSwgaW5mb3N0cmluZywgZXNjYXBlZCkge1xuICAgIGNvbnN0IGxhbmcgPSAoaW5mb3N0cmluZyB8fCAnJykubWF0Y2goL1xcUyovKVswXTtcbiAgICBpZiAodGhpcy5vcHRpb25zLmhpZ2hsaWdodCkge1xuICAgICAgY29uc3Qgb3V0ID0gdGhpcy5vcHRpb25zLmhpZ2hsaWdodChjb2RlLCBsYW5nKTtcbiAgICAgIGlmIChvdXQgIT0gbnVsbCAmJiBvdXQgIT09IGNvZGUpIHtcbiAgICAgICAgZXNjYXBlZCA9IHRydWU7XG4gICAgICAgIGNvZGUgPSBvdXQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29kZSA9IGNvZGUucmVwbGFjZSgvXFxuJC8sICcnKSArICdcXG4nO1xuXG4gICAgaWYgKCFsYW5nKSB7XG4gICAgICByZXR1cm4gJzxwcmU+PGNvZGU+J1xuICAgICAgICArIChlc2NhcGVkID8gY29kZSA6IGVzY2FwZShjb2RlLCB0cnVlKSlcbiAgICAgICAgKyAnPC9jb2RlPjwvcHJlPlxcbic7XG4gICAgfVxuXG4gICAgcmV0dXJuICc8cHJlPjxjb2RlIGNsYXNzPVwiJ1xuICAgICAgKyB0aGlzLm9wdGlvbnMubGFuZ1ByZWZpeFxuICAgICAgKyBlc2NhcGUobGFuZylcbiAgICAgICsgJ1wiPidcbiAgICAgICsgKGVzY2FwZWQgPyBjb2RlIDogZXNjYXBlKGNvZGUsIHRydWUpKVxuICAgICAgKyAnPC9jb2RlPjwvcHJlPlxcbic7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IHF1b3RlXG4gICAqL1xuICBibG9ja3F1b3RlKHF1b3RlKSB7XG4gICAgcmV0dXJuIGA8YmxvY2txdW90ZT5cXG4ke3F1b3RlfTwvYmxvY2txdW90ZT5cXG5gO1xuICB9XG5cbiAgaHRtbChodG1sKSB7XG4gICAgcmV0dXJuIGh0bWw7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IHRleHRcbiAgICogQHBhcmFtIHtzdHJpbmd9IGxldmVsXG4gICAqIEBwYXJhbSB7c3RyaW5nfSByYXdcbiAgICogQHBhcmFtIHthbnl9IHNsdWdnZXJcbiAgICovXG4gIGhlYWRpbmcodGV4dCwgbGV2ZWwsIHJhdywgc2x1Z2dlcikge1xuICAgIGlmICh0aGlzLm9wdGlvbnMuaGVhZGVySWRzKSB7XG4gICAgICBjb25zdCBpZCA9IHRoaXMub3B0aW9ucy5oZWFkZXJQcmVmaXggKyBzbHVnZ2VyLnNsdWcocmF3KTtcbiAgICAgIHJldHVybiBgPGgke2xldmVsfSBpZD1cIiR7aWR9XCI+JHt0ZXh0fTwvaCR7bGV2ZWx9PlxcbmA7XG4gICAgfVxuXG4gICAgLy8gaWdub3JlIElEc1xuICAgIHJldHVybiBgPGgke2xldmVsfT4ke3RleHR9PC9oJHtsZXZlbH0+XFxuYDtcbiAgfVxuXG4gIGhyKCkge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnMueGh0bWwgPyAnPGhyLz5cXG4nIDogJzxocj5cXG4nO1xuICB9XG5cbiAgbGlzdChib2R5LCBvcmRlcmVkLCBzdGFydCkge1xuICAgIGNvbnN0IHR5cGUgPSBvcmRlcmVkID8gJ29sJyA6ICd1bCcsXG4gICAgICBzdGFydGF0dCA9IChvcmRlcmVkICYmIHN0YXJ0ICE9PSAxKSA/ICgnIHN0YXJ0PVwiJyArIHN0YXJ0ICsgJ1wiJykgOiAnJztcbiAgICByZXR1cm4gJzwnICsgdHlwZSArIHN0YXJ0YXR0ICsgJz5cXG4nICsgYm9keSArICc8LycgKyB0eXBlICsgJz5cXG4nO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0XG4gICAqL1xuICBsaXN0aXRlbSh0ZXh0KSB7XG4gICAgcmV0dXJuIGA8bGk+JHt0ZXh0fTwvbGk+XFxuYDtcbiAgfVxuXG4gIGNoZWNrYm94KGNoZWNrZWQpIHtcbiAgICByZXR1cm4gJzxpbnB1dCAnXG4gICAgICArIChjaGVja2VkID8gJ2NoZWNrZWQ9XCJcIiAnIDogJycpXG4gICAgICArICdkaXNhYmxlZD1cIlwiIHR5cGU9XCJjaGVja2JveFwiJ1xuICAgICAgKyAodGhpcy5vcHRpb25zLnhodG1sID8gJyAvJyA6ICcnKVxuICAgICAgKyAnPiAnO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0XG4gICAqL1xuICBwYXJhZ3JhcGgodGV4dCkge1xuICAgIHJldHVybiBgPHA+JHt0ZXh0fTwvcD5cXG5gO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBoZWFkZXJcbiAgICogQHBhcmFtIHtzdHJpbmd9IGJvZHlcbiAgICovXG4gIHRhYmxlKGhlYWRlciwgYm9keSkge1xuICAgIGlmIChib2R5KSBib2R5ID0gYDx0Ym9keT4ke2JvZHl9PC90Ym9keT5gO1xuXG4gICAgcmV0dXJuICc8dGFibGU+XFxuJ1xuICAgICAgKyAnPHRoZWFkPlxcbidcbiAgICAgICsgaGVhZGVyXG4gICAgICArICc8L3RoZWFkPlxcbidcbiAgICAgICsgYm9keVxuICAgICAgKyAnPC90YWJsZT5cXG4nO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBjb250ZW50XG4gICAqL1xuICB0YWJsZXJvdyhjb250ZW50KSB7XG4gICAgcmV0dXJuIGA8dHI+XFxuJHtjb250ZW50fTwvdHI+XFxuYDtcbiAgfVxuXG4gIHRhYmxlY2VsbChjb250ZW50LCBmbGFncykge1xuICAgIGNvbnN0IHR5cGUgPSBmbGFncy5oZWFkZXIgPyAndGgnIDogJ3RkJztcbiAgICBjb25zdCB0YWcgPSBmbGFncy5hbGlnblxuICAgICAgPyBgPCR7dHlwZX0gYWxpZ249XCIke2ZsYWdzLmFsaWdufVwiPmBcbiAgICAgIDogYDwke3R5cGV9PmA7XG4gICAgcmV0dXJuIHRhZyArIGNvbnRlbnQgKyBgPC8ke3R5cGV9PlxcbmA7XG4gIH1cblxuICAvKipcbiAgICogc3BhbiBsZXZlbCByZW5kZXJlclxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGV4dFxuICAgKi9cbiAgc3Ryb25nKHRleHQpIHtcbiAgICByZXR1cm4gYDxzdHJvbmc+JHt0ZXh0fTwvc3Ryb25nPmA7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IHRleHRcbiAgICovXG4gIGVtKHRleHQpIHtcbiAgICByZXR1cm4gYDxlbT4ke3RleHR9PC9lbT5gO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0XG4gICAqL1xuICBjb2Rlc3Bhbih0ZXh0KSB7XG4gICAgcmV0dXJuIGA8Y29kZT4ke3RleHR9PC9jb2RlPmA7XG4gIH1cblxuICBicigpIHtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLnhodG1sID8gJzxici8+JyA6ICc8YnI+JztcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGV4dFxuICAgKi9cbiAgZGVsKHRleHQpIHtcbiAgICByZXR1cm4gYDxkZWw+JHt0ZXh0fTwvZGVsPmA7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IGhyZWZcbiAgICogQHBhcmFtIHtzdHJpbmd9IHRpdGxlXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0XG4gICAqL1xuICBsaW5rKGhyZWYsIHRpdGxlLCB0ZXh0KSB7XG4gICAgaHJlZiA9IGNsZWFuVXJsKHRoaXMub3B0aW9ucy5zYW5pdGl6ZSwgdGhpcy5vcHRpb25zLmJhc2VVcmwsIGhyZWYpO1xuICAgIGlmIChocmVmID09PSBudWxsKSB7XG4gICAgICByZXR1cm4gdGV4dDtcbiAgICB9XG4gICAgbGV0IG91dCA9ICc8YSBocmVmPVwiJyArIGhyZWYgKyAnXCInO1xuICAgIGlmICh0aXRsZSkge1xuICAgICAgb3V0ICs9ICcgdGl0bGU9XCInICsgdGl0bGUgKyAnXCInO1xuICAgIH1cbiAgICBvdXQgKz0gJz4nICsgdGV4dCArICc8L2E+JztcbiAgICByZXR1cm4gb3V0O1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBocmVmXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0aXRsZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGV4dFxuICAgKi9cbiAgaW1hZ2UoaHJlZiwgdGl0bGUsIHRleHQpIHtcbiAgICBocmVmID0gY2xlYW5VcmwodGhpcy5vcHRpb25zLnNhbml0aXplLCB0aGlzLm9wdGlvbnMuYmFzZVVybCwgaHJlZik7XG4gICAgaWYgKGhyZWYgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiB0ZXh0O1xuICAgIH1cblxuICAgIGxldCBvdXQgPSBgPGltZyBzcmM9XCIke2hyZWZ9XCIgYWx0PVwiJHt0ZXh0fVwiYDtcbiAgICBpZiAodGl0bGUpIHtcbiAgICAgIG91dCArPSBgIHRpdGxlPVwiJHt0aXRsZX1cImA7XG4gICAgfVxuICAgIG91dCArPSB0aGlzLm9wdGlvbnMueGh0bWwgPyAnLz4nIDogJz4nO1xuICAgIHJldHVybiBvdXQ7XG4gIH1cblxuICB0ZXh0KHRleHQpIHtcbiAgICByZXR1cm4gdGV4dDtcbiAgfVxufVxuXG4vKipcbiAqIFRleHRSZW5kZXJlclxuICogcmV0dXJucyBvbmx5IHRoZSB0ZXh0dWFsIHBhcnQgb2YgdGhlIHRva2VuXG4gKi9cbmNsYXNzIFRleHRSZW5kZXJlciB7XG4gIC8vIG5vIG5lZWQgZm9yIGJsb2NrIGxldmVsIHJlbmRlcmVyc1xuICBzdHJvbmcodGV4dCkge1xuICAgIHJldHVybiB0ZXh0O1xuICB9XG5cbiAgZW0odGV4dCkge1xuICAgIHJldHVybiB0ZXh0O1xuICB9XG5cbiAgY29kZXNwYW4odGV4dCkge1xuICAgIHJldHVybiB0ZXh0O1xuICB9XG5cbiAgZGVsKHRleHQpIHtcbiAgICByZXR1cm4gdGV4dDtcbiAgfVxuXG4gIGh0bWwodGV4dCkge1xuICAgIHJldHVybiB0ZXh0O1xuICB9XG5cbiAgdGV4dCh0ZXh0KSB7XG4gICAgcmV0dXJuIHRleHQ7XG4gIH1cblxuICBsaW5rKGhyZWYsIHRpdGxlLCB0ZXh0KSB7XG4gICAgcmV0dXJuICcnICsgdGV4dDtcbiAgfVxuXG4gIGltYWdlKGhyZWYsIHRpdGxlLCB0ZXh0KSB7XG4gICAgcmV0dXJuICcnICsgdGV4dDtcbiAgfVxuXG4gIGJyKCkge1xuICAgIHJldHVybiAnJztcbiAgfVxufVxuXG4vKipcbiAqIFNsdWdnZXIgZ2VuZXJhdGVzIGhlYWRlciBpZFxuICovXG5jbGFzcyBTbHVnZ2VyIHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5zZWVuID0ge307XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IHZhbHVlXG4gICAqL1xuICBzZXJpYWxpemUodmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWVcbiAgICAgIC50b0xvd2VyQ2FzZSgpXG4gICAgICAudHJpbSgpXG4gICAgICAvLyByZW1vdmUgaHRtbCB0YWdzXG4gICAgICAucmVwbGFjZSgvPFshXFwvYS16XS4qPz4vaWcsICcnKVxuICAgICAgLy8gcmVtb3ZlIHVud2FudGVkIGNoYXJzXG4gICAgICAucmVwbGFjZSgvW1xcdTIwMDAtXFx1MjA2RlxcdTJFMDAtXFx1MkU3RlxcXFwnIVwiIyQlJigpKissLi86Ozw9Pj9AW1xcXV5ge3x9fl0vZywgJycpXG4gICAgICAucmVwbGFjZSgvXFxzL2csICctJyk7XG4gIH1cblxuICAvKipcbiAgICogRmluZHMgdGhlIG5leHQgc2FmZSAodW5pcXVlKSBzbHVnIHRvIHVzZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gb3JpZ2luYWxTbHVnXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNEcnlSdW5cbiAgICovXG4gIGdldE5leHRTYWZlU2x1ZyhvcmlnaW5hbFNsdWcsIGlzRHJ5UnVuKSB7XG4gICAgbGV0IHNsdWcgPSBvcmlnaW5hbFNsdWc7XG4gICAgbGV0IG9jY3VyZW5jZUFjY3VtdWxhdG9yID0gMDtcbiAgICBpZiAodGhpcy5zZWVuLmhhc093blByb3BlcnR5KHNsdWcpKSB7XG4gICAgICBvY2N1cmVuY2VBY2N1bXVsYXRvciA9IHRoaXMuc2VlbltvcmlnaW5hbFNsdWddO1xuICAgICAgZG8ge1xuICAgICAgICBvY2N1cmVuY2VBY2N1bXVsYXRvcisrO1xuICAgICAgICBzbHVnID0gb3JpZ2luYWxTbHVnICsgJy0nICsgb2NjdXJlbmNlQWNjdW11bGF0b3I7XG4gICAgICB9IHdoaWxlICh0aGlzLnNlZW4uaGFzT3duUHJvcGVydHkoc2x1ZykpO1xuICAgIH1cbiAgICBpZiAoIWlzRHJ5UnVuKSB7XG4gICAgICB0aGlzLnNlZW5bb3JpZ2luYWxTbHVnXSA9IG9jY3VyZW5jZUFjY3VtdWxhdG9yO1xuICAgICAgdGhpcy5zZWVuW3NsdWddID0gMDtcbiAgICB9XG4gICAgcmV0dXJuIHNsdWc7XG4gIH1cblxuICAvKipcbiAgICogQ29udmVydCBzdHJpbmcgdG8gdW5pcXVlIGlkXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc11cbiAgICogQHBhcmFtIHtib29sZWFufSBbb3B0aW9ucy5kcnlydW5dIEdlbmVyYXRlcyB0aGUgbmV4dCB1bmlxdWUgc2x1ZyB3aXRob3V0XG4gICAqIHVwZGF0aW5nIHRoZSBpbnRlcm5hbCBhY2N1bXVsYXRvci5cbiAgICovXG4gIHNsdWcodmFsdWUsIG9wdGlvbnMgPSB7fSkge1xuICAgIGNvbnN0IHNsdWcgPSB0aGlzLnNlcmlhbGl6ZSh2YWx1ZSk7XG4gICAgcmV0dXJuIHRoaXMuZ2V0TmV4dFNhZmVTbHVnKHNsdWcsIG9wdGlvbnMuZHJ5cnVuKTtcbiAgfVxufVxuXG4vKipcbiAqIFBhcnNpbmcgJiBDb21waWxpbmdcbiAqL1xuY2xhc3MgUGFyc2VyIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHwgZGVmYXVsdHM7XG4gICAgdGhpcy5vcHRpb25zLnJlbmRlcmVyID0gdGhpcy5vcHRpb25zLnJlbmRlcmVyIHx8IG5ldyBSZW5kZXJlcigpO1xuICAgIHRoaXMucmVuZGVyZXIgPSB0aGlzLm9wdGlvbnMucmVuZGVyZXI7XG4gICAgdGhpcy5yZW5kZXJlci5vcHRpb25zID0gdGhpcy5vcHRpb25zO1xuICAgIHRoaXMudGV4dFJlbmRlcmVyID0gbmV3IFRleHRSZW5kZXJlcigpO1xuICAgIHRoaXMuc2x1Z2dlciA9IG5ldyBTbHVnZ2VyKCk7XG4gIH1cblxuICAvKipcbiAgICogU3RhdGljIFBhcnNlIE1ldGhvZFxuICAgKi9cbiAgc3RhdGljIHBhcnNlKHRva2Vucywgb3B0aW9ucykge1xuICAgIGNvbnN0IHBhcnNlciA9IG5ldyBQYXJzZXIob3B0aW9ucyk7XG4gICAgcmV0dXJuIHBhcnNlci5wYXJzZSh0b2tlbnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YXRpYyBQYXJzZSBJbmxpbmUgTWV0aG9kXG4gICAqL1xuICBzdGF0aWMgcGFyc2VJbmxpbmUodG9rZW5zLCBvcHRpb25zKSB7XG4gICAgY29uc3QgcGFyc2VyID0gbmV3IFBhcnNlcihvcHRpb25zKTtcbiAgICByZXR1cm4gcGFyc2VyLnBhcnNlSW5saW5lKHRva2Vucyk7XG4gIH1cblxuICAvKipcbiAgICogUGFyc2UgTG9vcFxuICAgKi9cbiAgcGFyc2UodG9rZW5zLCB0b3AgPSB0cnVlKSB7XG4gICAgbGV0IG91dCA9ICcnLFxuICAgICAgaSxcbiAgICAgIGosXG4gICAgICBrLFxuICAgICAgbDIsXG4gICAgICBsMyxcbiAgICAgIHJvdyxcbiAgICAgIGNlbGwsXG4gICAgICBoZWFkZXIsXG4gICAgICBib2R5LFxuICAgICAgdG9rZW4sXG4gICAgICBvcmRlcmVkLFxuICAgICAgc3RhcnQsXG4gICAgICBsb29zZSxcbiAgICAgIGl0ZW1Cb2R5LFxuICAgICAgaXRlbSxcbiAgICAgIGNoZWNrZWQsXG4gICAgICB0YXNrLFxuICAgICAgY2hlY2tib3gsXG4gICAgICByZXQ7XG5cbiAgICBjb25zdCBsID0gdG9rZW5zLmxlbmd0aDtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgICB0b2tlbiA9IHRva2Vuc1tpXTtcblxuICAgICAgLy8gUnVuIGFueSByZW5kZXJlciBleHRlbnNpb25zXG4gICAgICBpZiAodGhpcy5vcHRpb25zLmV4dGVuc2lvbnMgJiYgdGhpcy5vcHRpb25zLmV4dGVuc2lvbnMucmVuZGVyZXJzICYmIHRoaXMub3B0aW9ucy5leHRlbnNpb25zLnJlbmRlcmVyc1t0b2tlbi50eXBlXSkge1xuICAgICAgICByZXQgPSB0aGlzLm9wdGlvbnMuZXh0ZW5zaW9ucy5yZW5kZXJlcnNbdG9rZW4udHlwZV0uY2FsbCh7IHBhcnNlcjogdGhpcyB9LCB0b2tlbik7XG4gICAgICAgIGlmIChyZXQgIT09IGZhbHNlIHx8ICFbJ3NwYWNlJywgJ2hyJywgJ2hlYWRpbmcnLCAnY29kZScsICd0YWJsZScsICdibG9ja3F1b3RlJywgJ2xpc3QnLCAnaHRtbCcsICdwYXJhZ3JhcGgnLCAndGV4dCddLmluY2x1ZGVzKHRva2VuLnR5cGUpKSB7XG4gICAgICAgICAgb3V0ICs9IHJldCB8fCAnJztcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBzd2l0Y2ggKHRva2VuLnR5cGUpIHtcbiAgICAgICAgY2FzZSAnc3BhY2UnOiB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAnaHInOiB7XG4gICAgICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIuaHIoKTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjYXNlICdoZWFkaW5nJzoge1xuICAgICAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLmhlYWRpbmcoXG4gICAgICAgICAgICB0aGlzLnBhcnNlSW5saW5lKHRva2VuLnRva2VucyksXG4gICAgICAgICAgICB0b2tlbi5kZXB0aCxcbiAgICAgICAgICAgIHVuZXNjYXBlKHRoaXMucGFyc2VJbmxpbmUodG9rZW4udG9rZW5zLCB0aGlzLnRleHRSZW5kZXJlcikpLFxuICAgICAgICAgICAgdGhpcy5zbHVnZ2VyKTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjYXNlICdjb2RlJzoge1xuICAgICAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLmNvZGUodG9rZW4udGV4dCxcbiAgICAgICAgICAgIHRva2VuLmxhbmcsXG4gICAgICAgICAgICB0b2tlbi5lc2NhcGVkKTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjYXNlICd0YWJsZSc6IHtcbiAgICAgICAgICBoZWFkZXIgPSAnJztcblxuICAgICAgICAgIC8vIGhlYWRlclxuICAgICAgICAgIGNlbGwgPSAnJztcbiAgICAgICAgICBsMiA9IHRva2VuLmhlYWRlci5sZW5ndGg7XG4gICAgICAgICAgZm9yIChqID0gMDsgaiA8IGwyOyBqKyspIHtcbiAgICAgICAgICAgIGNlbGwgKz0gdGhpcy5yZW5kZXJlci50YWJsZWNlbGwoXG4gICAgICAgICAgICAgIHRoaXMucGFyc2VJbmxpbmUodG9rZW4uaGVhZGVyW2pdLnRva2VucyksXG4gICAgICAgICAgICAgIHsgaGVhZGVyOiB0cnVlLCBhbGlnbjogdG9rZW4uYWxpZ25bal0gfVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaGVhZGVyICs9IHRoaXMucmVuZGVyZXIudGFibGVyb3coY2VsbCk7XG5cbiAgICAgICAgICBib2R5ID0gJyc7XG4gICAgICAgICAgbDIgPSB0b2tlbi5yb3dzLmxlbmd0aDtcbiAgICAgICAgICBmb3IgKGogPSAwOyBqIDwgbDI7IGorKykge1xuICAgICAgICAgICAgcm93ID0gdG9rZW4ucm93c1tqXTtcblxuICAgICAgICAgICAgY2VsbCA9ICcnO1xuICAgICAgICAgICAgbDMgPSByb3cubGVuZ3RoO1xuICAgICAgICAgICAgZm9yIChrID0gMDsgayA8IGwzOyBrKyspIHtcbiAgICAgICAgICAgICAgY2VsbCArPSB0aGlzLnJlbmRlcmVyLnRhYmxlY2VsbChcbiAgICAgICAgICAgICAgICB0aGlzLnBhcnNlSW5saW5lKHJvd1trXS50b2tlbnMpLFxuICAgICAgICAgICAgICAgIHsgaGVhZGVyOiBmYWxzZSwgYWxpZ246IHRva2VuLmFsaWduW2tdIH1cbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYm9keSArPSB0aGlzLnJlbmRlcmVyLnRhYmxlcm93KGNlbGwpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci50YWJsZShoZWFkZXIsIGJvZHkpO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgJ2Jsb2NrcXVvdGUnOiB7XG4gICAgICAgICAgYm9keSA9IHRoaXMucGFyc2UodG9rZW4udG9rZW5zKTtcbiAgICAgICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5ibG9ja3F1b3RlKGJvZHkpO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgJ2xpc3QnOiB7XG4gICAgICAgICAgb3JkZXJlZCA9IHRva2VuLm9yZGVyZWQ7XG4gICAgICAgICAgc3RhcnQgPSB0b2tlbi5zdGFydDtcbiAgICAgICAgICBsb29zZSA9IHRva2VuLmxvb3NlO1xuICAgICAgICAgIGwyID0gdG9rZW4uaXRlbXMubGVuZ3RoO1xuXG4gICAgICAgICAgYm9keSA9ICcnO1xuICAgICAgICAgIGZvciAoaiA9IDA7IGogPCBsMjsgaisrKSB7XG4gICAgICAgICAgICBpdGVtID0gdG9rZW4uaXRlbXNbal07XG4gICAgICAgICAgICBjaGVja2VkID0gaXRlbS5jaGVja2VkO1xuICAgICAgICAgICAgdGFzayA9IGl0ZW0udGFzaztcblxuICAgICAgICAgICAgaXRlbUJvZHkgPSAnJztcbiAgICAgICAgICAgIGlmIChpdGVtLnRhc2spIHtcbiAgICAgICAgICAgICAgY2hlY2tib3ggPSB0aGlzLnJlbmRlcmVyLmNoZWNrYm94KGNoZWNrZWQpO1xuICAgICAgICAgICAgICBpZiAobG9vc2UpIHtcbiAgICAgICAgICAgICAgICBpZiAoaXRlbS50b2tlbnMubGVuZ3RoID4gMCAmJiBpdGVtLnRva2Vuc1swXS50eXBlID09PSAncGFyYWdyYXBoJykge1xuICAgICAgICAgICAgICAgICAgaXRlbS50b2tlbnNbMF0udGV4dCA9IGNoZWNrYm94ICsgJyAnICsgaXRlbS50b2tlbnNbMF0udGV4dDtcbiAgICAgICAgICAgICAgICAgIGlmIChpdGVtLnRva2Vuc1swXS50b2tlbnMgJiYgaXRlbS50b2tlbnNbMF0udG9rZW5zLmxlbmd0aCA+IDAgJiYgaXRlbS50b2tlbnNbMF0udG9rZW5zWzBdLnR5cGUgPT09ICd0ZXh0Jykge1xuICAgICAgICAgICAgICAgICAgICBpdGVtLnRva2Vuc1swXS50b2tlbnNbMF0udGV4dCA9IGNoZWNrYm94ICsgJyAnICsgaXRlbS50b2tlbnNbMF0udG9rZW5zWzBdLnRleHQ7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIGl0ZW0udG9rZW5zLnVuc2hpZnQoe1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAndGV4dCcsXG4gICAgICAgICAgICAgICAgICAgIHRleHQ6IGNoZWNrYm94XG4gICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaXRlbUJvZHkgKz0gY2hlY2tib3g7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaXRlbUJvZHkgKz0gdGhpcy5wYXJzZShpdGVtLnRva2VucywgbG9vc2UpO1xuICAgICAgICAgICAgYm9keSArPSB0aGlzLnJlbmRlcmVyLmxpc3RpdGVtKGl0ZW1Cb2R5LCB0YXNrLCBjaGVja2VkKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5saXN0KGJvZHksIG9yZGVyZWQsIHN0YXJ0KTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjYXNlICdodG1sJzoge1xuICAgICAgICAgIC8vIFRPRE8gcGFyc2UgaW5saW5lIGNvbnRlbnQgaWYgcGFyYW1ldGVyIG1hcmtkb3duPTFcbiAgICAgICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5odG1sKHRva2VuLnRleHQpO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgJ3BhcmFncmFwaCc6IHtcbiAgICAgICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5wYXJhZ3JhcGgodGhpcy5wYXJzZUlubGluZSh0b2tlbi50b2tlbnMpKTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjYXNlICd0ZXh0Jzoge1xuICAgICAgICAgIGJvZHkgPSB0b2tlbi50b2tlbnMgPyB0aGlzLnBhcnNlSW5saW5lKHRva2VuLnRva2VucykgOiB0b2tlbi50ZXh0O1xuICAgICAgICAgIHdoaWxlIChpICsgMSA8IGwgJiYgdG9rZW5zW2kgKyAxXS50eXBlID09PSAndGV4dCcpIHtcbiAgICAgICAgICAgIHRva2VuID0gdG9rZW5zWysraV07XG4gICAgICAgICAgICBib2R5ICs9ICdcXG4nICsgKHRva2VuLnRva2VucyA/IHRoaXMucGFyc2VJbmxpbmUodG9rZW4udG9rZW5zKSA6IHRva2VuLnRleHQpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBvdXQgKz0gdG9wID8gdGhpcy5yZW5kZXJlci5wYXJhZ3JhcGgoYm9keSkgOiBib2R5O1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgIGNvbnN0IGVyck1zZyA9ICdUb2tlbiB3aXRoIFwiJyArIHRva2VuLnR5cGUgKyAnXCIgdHlwZSB3YXMgbm90IGZvdW5kLic7XG4gICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5zaWxlbnQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyTXNnKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVyck1zZyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG91dDtcbiAgfVxuXG4gIC8qKlxuICAgKiBQYXJzZSBJbmxpbmUgVG9rZW5zXG4gICAqL1xuICBwYXJzZUlubGluZSh0b2tlbnMsIHJlbmRlcmVyKSB7XG4gICAgcmVuZGVyZXIgPSByZW5kZXJlciB8fCB0aGlzLnJlbmRlcmVyO1xuICAgIGxldCBvdXQgPSAnJyxcbiAgICAgIGksXG4gICAgICB0b2tlbixcbiAgICAgIHJldDtcblxuICAgIGNvbnN0IGwgPSB0b2tlbnMubGVuZ3RoO1xuICAgIGZvciAoaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICAgIHRva2VuID0gdG9rZW5zW2ldO1xuXG4gICAgICAvLyBSdW4gYW55IHJlbmRlcmVyIGV4dGVuc2lvbnNcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuZXh0ZW5zaW9ucyAmJiB0aGlzLm9wdGlvbnMuZXh0ZW5zaW9ucy5yZW5kZXJlcnMgJiYgdGhpcy5vcHRpb25zLmV4dGVuc2lvbnMucmVuZGVyZXJzW3Rva2VuLnR5cGVdKSB7XG4gICAgICAgIHJldCA9IHRoaXMub3B0aW9ucy5leHRlbnNpb25zLnJlbmRlcmVyc1t0b2tlbi50eXBlXS5jYWxsKHsgcGFyc2VyOiB0aGlzIH0sIHRva2VuKTtcbiAgICAgICAgaWYgKHJldCAhPT0gZmFsc2UgfHwgIVsnZXNjYXBlJywgJ2h0bWwnLCAnbGluaycsICdpbWFnZScsICdzdHJvbmcnLCAnZW0nLCAnY29kZXNwYW4nLCAnYnInLCAnZGVsJywgJ3RleHQnXS5pbmNsdWRlcyh0b2tlbi50eXBlKSkge1xuICAgICAgICAgIG91dCArPSByZXQgfHwgJyc7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgc3dpdGNoICh0b2tlbi50eXBlKSB7XG4gICAgICAgIGNhc2UgJ2VzY2FwZSc6IHtcbiAgICAgICAgICBvdXQgKz0gcmVuZGVyZXIudGV4dCh0b2tlbi50ZXh0KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjYXNlICdodG1sJzoge1xuICAgICAgICAgIG91dCArPSByZW5kZXJlci5odG1sKHRva2VuLnRleHQpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgJ2xpbmsnOiB7XG4gICAgICAgICAgb3V0ICs9IHJlbmRlcmVyLmxpbmsodG9rZW4uaHJlZiwgdG9rZW4udGl0bGUsIHRoaXMucGFyc2VJbmxpbmUodG9rZW4udG9rZW5zLCByZW5kZXJlcikpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgJ2ltYWdlJzoge1xuICAgICAgICAgIG91dCArPSByZW5kZXJlci5pbWFnZSh0b2tlbi5ocmVmLCB0b2tlbi50aXRsZSwgdG9rZW4udGV4dCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAnc3Ryb25nJzoge1xuICAgICAgICAgIG91dCArPSByZW5kZXJlci5zdHJvbmcodGhpcy5wYXJzZUlubGluZSh0b2tlbi50b2tlbnMsIHJlbmRlcmVyKSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAnZW0nOiB7XG4gICAgICAgICAgb3V0ICs9IHJlbmRlcmVyLmVtKHRoaXMucGFyc2VJbmxpbmUodG9rZW4udG9rZW5zLCByZW5kZXJlcikpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgJ2NvZGVzcGFuJzoge1xuICAgICAgICAgIG91dCArPSByZW5kZXJlci5jb2Rlc3Bhbih0b2tlbi50ZXh0KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjYXNlICdicic6IHtcbiAgICAgICAgICBvdXQgKz0gcmVuZGVyZXIuYnIoKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjYXNlICdkZWwnOiB7XG4gICAgICAgICAgb3V0ICs9IHJlbmRlcmVyLmRlbCh0aGlzLnBhcnNlSW5saW5lKHRva2VuLnRva2VucywgcmVuZGVyZXIpKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjYXNlICd0ZXh0Jzoge1xuICAgICAgICAgIG91dCArPSByZW5kZXJlci50ZXh0KHRva2VuLnRleHQpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGRlZmF1bHQ6IHtcbiAgICAgICAgICBjb25zdCBlcnJNc2cgPSAnVG9rZW4gd2l0aCBcIicgKyB0b2tlbi50eXBlICsgJ1wiIHR5cGUgd2FzIG5vdCBmb3VuZC4nO1xuICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuc2lsZW50KSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKGVyck1zZyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnJNc2cpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb3V0O1xuICB9XG59XG5cbmNsYXNzIEhvb2tzIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHwgZGVmYXVsdHM7XG4gIH1cblxuICBzdGF0aWMgcGFzc1Rocm91Z2hIb29rcyA9IG5ldyBTZXQoW1xuICAgICdwcmVwcm9jZXNzJyxcbiAgICAncG9zdHByb2Nlc3MnXG4gIF0pO1xuXG4gIC8qKlxuICAgKiBQcm9jZXNzIG1hcmtkb3duIGJlZm9yZSBtYXJrZWRcbiAgICovXG4gIHByZXByb2Nlc3MobWFya2Rvd24pIHtcbiAgICByZXR1cm4gbWFya2Rvd247XG4gIH1cblxuICAvKipcbiAgICogUHJvY2VzcyBIVE1MIGFmdGVyIG1hcmtlZCBpcyBmaW5pc2hlZFxuICAgKi9cbiAgcG9zdHByb2Nlc3MoaHRtbCkge1xuICAgIHJldHVybiBodG1sO1xuICB9XG59XG5cbmZ1bmN0aW9uIG9uRXJyb3Ioc2lsZW50LCBhc3luYywgY2FsbGJhY2spIHtcbiAgcmV0dXJuIChlKSA9PiB7XG4gICAgZS5tZXNzYWdlICs9ICdcXG5QbGVhc2UgcmVwb3J0IHRoaXMgdG8gaHR0cHM6Ly9naXRodWIuY29tL21hcmtlZGpzL21hcmtlZC4nO1xuXG4gICAgaWYgKHNpbGVudCkge1xuICAgICAgY29uc3QgbXNnID0gJzxwPkFuIGVycm9yIG9jY3VycmVkOjwvcD48cHJlPidcbiAgICAgICAgKyBlc2NhcGUoZS5tZXNzYWdlICsgJycsIHRydWUpXG4gICAgICAgICsgJzwvcHJlPic7XG4gICAgICBpZiAoYXN5bmMpIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShtc2cpO1xuICAgICAgfVxuICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrKG51bGwsIG1zZyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHJldHVybiBtc2c7XG4gICAgfVxuXG4gICAgaWYgKGFzeW5jKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZWplY3QoZSk7XG4gICAgfVxuICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgY2FsbGJhY2soZSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRocm93IGU7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHBhcnNlTWFya2Rvd24obGV4ZXIsIHBhcnNlcikge1xuICByZXR1cm4gKHNyYywgb3B0LCBjYWxsYmFjaykgPT4ge1xuICAgIGlmICh0eXBlb2Ygb3B0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjYWxsYmFjayA9IG9wdDtcbiAgICAgIG9wdCA9IG51bGw7XG4gICAgfVxuXG4gICAgY29uc3Qgb3JpZ09wdCA9IHsgLi4ub3B0IH07XG4gICAgb3B0ID0geyAuLi5tYXJrZWQuZGVmYXVsdHMsIC4uLm9yaWdPcHQgfTtcbiAgICBjb25zdCB0aHJvd0Vycm9yID0gb25FcnJvcihvcHQuc2lsZW50LCBvcHQuYXN5bmMsIGNhbGxiYWNrKTtcblxuICAgIC8vIHRocm93IGVycm9yIGluIGNhc2Ugb2Ygbm9uIHN0cmluZyBpbnB1dFxuICAgIGlmICh0eXBlb2Ygc3JjID09PSAndW5kZWZpbmVkJyB8fCBzcmMgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiB0aHJvd0Vycm9yKG5ldyBFcnJvcignbWFya2VkKCk6IGlucHV0IHBhcmFtZXRlciBpcyB1bmRlZmluZWQgb3IgbnVsbCcpKTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBzcmMgIT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gdGhyb3dFcnJvcihuZXcgRXJyb3IoJ21hcmtlZCgpOiBpbnB1dCBwYXJhbWV0ZXIgaXMgb2YgdHlwZSAnXG4gICAgICAgICsgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHNyYykgKyAnLCBzdHJpbmcgZXhwZWN0ZWQnKSk7XG4gICAgfVxuXG4gICAgY2hlY2tTYW5pdGl6ZURlcHJlY2F0aW9uKG9wdCk7XG5cbiAgICBpZiAob3B0Lmhvb2tzKSB7XG4gICAgICBvcHQuaG9va3Mub3B0aW9ucyA9IG9wdDtcbiAgICB9XG5cbiAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgIGNvbnN0IGhpZ2hsaWdodCA9IG9wdC5oaWdobGlnaHQ7XG4gICAgICBsZXQgdG9rZW5zO1xuXG4gICAgICB0cnkge1xuICAgICAgICBpZiAob3B0Lmhvb2tzKSB7XG4gICAgICAgICAgc3JjID0gb3B0Lmhvb2tzLnByZXByb2Nlc3Moc3JjKTtcbiAgICAgICAgfVxuICAgICAgICB0b2tlbnMgPSBsZXhlcihzcmMsIG9wdCk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHJldHVybiB0aHJvd0Vycm9yKGUpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBkb25lID0gZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgIGxldCBvdXQ7XG5cbiAgICAgICAgaWYgKCFlcnIpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKG9wdC53YWxrVG9rZW5zKSB7XG4gICAgICAgICAgICAgIG1hcmtlZC53YWxrVG9rZW5zKHRva2Vucywgb3B0LndhbGtUb2tlbnMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb3V0ID0gcGFyc2VyKHRva2Vucywgb3B0KTtcbiAgICAgICAgICAgIGlmIChvcHQuaG9va3MpIHtcbiAgICAgICAgICAgICAgb3V0ID0gb3B0Lmhvb2tzLnBvc3Rwcm9jZXNzKG91dCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgZXJyID0gZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBvcHQuaGlnaGxpZ2h0ID0gaGlnaGxpZ2h0O1xuXG4gICAgICAgIHJldHVybiBlcnJcbiAgICAgICAgICA/IHRocm93RXJyb3IoZXJyKVxuICAgICAgICAgIDogY2FsbGJhY2sobnVsbCwgb3V0KTtcbiAgICAgIH07XG5cbiAgICAgIGlmICghaGlnaGxpZ2h0IHx8IGhpZ2hsaWdodC5sZW5ndGggPCAzKSB7XG4gICAgICAgIHJldHVybiBkb25lKCk7XG4gICAgICB9XG5cbiAgICAgIGRlbGV0ZSBvcHQuaGlnaGxpZ2h0O1xuXG4gICAgICBpZiAoIXRva2Vucy5sZW5ndGgpIHJldHVybiBkb25lKCk7XG5cbiAgICAgIGxldCBwZW5kaW5nID0gMDtcbiAgICAgIG1hcmtlZC53YWxrVG9rZW5zKHRva2VucywgZnVuY3Rpb24odG9rZW4pIHtcbiAgICAgICAgaWYgKHRva2VuLnR5cGUgPT09ICdjb2RlJykge1xuICAgICAgICAgIHBlbmRpbmcrKztcbiAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGhpZ2hsaWdodCh0b2tlbi50ZXh0LCB0b2tlbi5sYW5nLCBmdW5jdGlvbihlcnIsIGNvZGUpIHtcbiAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIHJldHVybiBkb25lKGVycik7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWYgKGNvZGUgIT0gbnVsbCAmJiBjb2RlICE9PSB0b2tlbi50ZXh0KSB7XG4gICAgICAgICAgICAgICAgdG9rZW4udGV4dCA9IGNvZGU7XG4gICAgICAgICAgICAgICAgdG9rZW4uZXNjYXBlZCA9IHRydWU7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBwZW5kaW5nLS07XG4gICAgICAgICAgICAgIGlmIChwZW5kaW5nID09PSAwKSB7XG4gICAgICAgICAgICAgICAgZG9uZSgpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9LCAwKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGlmIChwZW5kaW5nID09PSAwKSB7XG4gICAgICAgIGRvbmUoKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChvcHQuYXN5bmMpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUob3B0Lmhvb2tzID8gb3B0Lmhvb2tzLnByZXByb2Nlc3Moc3JjKSA6IHNyYylcbiAgICAgICAgLnRoZW4oc3JjID0+IGxleGVyKHNyYywgb3B0KSlcbiAgICAgICAgLnRoZW4odG9rZW5zID0+IG9wdC53YWxrVG9rZW5zID8gUHJvbWlzZS5hbGwobWFya2VkLndhbGtUb2tlbnModG9rZW5zLCBvcHQud2Fsa1Rva2VucykpLnRoZW4oKCkgPT4gdG9rZW5zKSA6IHRva2VucylcbiAgICAgICAgLnRoZW4odG9rZW5zID0+IHBhcnNlcih0b2tlbnMsIG9wdCkpXG4gICAgICAgIC50aGVuKGh0bWwgPT4gb3B0Lmhvb2tzID8gb3B0Lmhvb2tzLnBvc3Rwcm9jZXNzKGh0bWwpIDogaHRtbClcbiAgICAgICAgLmNhdGNoKHRocm93RXJyb3IpO1xuICAgIH1cblxuICAgIHRyeSB7XG4gICAgICBpZiAob3B0Lmhvb2tzKSB7XG4gICAgICAgIHNyYyA9IG9wdC5ob29rcy5wcmVwcm9jZXNzKHNyYyk7XG4gICAgICB9XG4gICAgICBjb25zdCB0b2tlbnMgPSBsZXhlcihzcmMsIG9wdCk7XG4gICAgICBpZiAob3B0LndhbGtUb2tlbnMpIHtcbiAgICAgICAgbWFya2VkLndhbGtUb2tlbnModG9rZW5zLCBvcHQud2Fsa1Rva2Vucyk7XG4gICAgICB9XG4gICAgICBsZXQgaHRtbCA9IHBhcnNlcih0b2tlbnMsIG9wdCk7XG4gICAgICBpZiAob3B0Lmhvb2tzKSB7XG4gICAgICAgIGh0bWwgPSBvcHQuaG9va3MucG9zdHByb2Nlc3MoaHRtbCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gaHRtbDtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gdGhyb3dFcnJvcihlKTtcbiAgICB9XG4gIH07XG59XG5cbi8qKlxuICogTWFya2VkXG4gKi9cbmZ1bmN0aW9uIG1hcmtlZChzcmMsIG9wdCwgY2FsbGJhY2spIHtcbiAgcmV0dXJuIHBhcnNlTWFya2Rvd24oTGV4ZXIubGV4LCBQYXJzZXIucGFyc2UpKHNyYywgb3B0LCBjYWxsYmFjayk7XG59XG5cbi8qKlxuICogT3B0aW9uc1xuICovXG5cbm1hcmtlZC5vcHRpb25zID1cbm1hcmtlZC5zZXRPcHRpb25zID0gZnVuY3Rpb24ob3B0KSB7XG4gIG1hcmtlZC5kZWZhdWx0cyA9IHsgLi4ubWFya2VkLmRlZmF1bHRzLCAuLi5vcHQgfTtcbiAgY2hhbmdlRGVmYXVsdHMobWFya2VkLmRlZmF1bHRzKTtcbiAgcmV0dXJuIG1hcmtlZDtcbn07XG5cbm1hcmtlZC5nZXREZWZhdWx0cyA9IGdldERlZmF1bHRzO1xuXG5tYXJrZWQuZGVmYXVsdHMgPSBkZWZhdWx0cztcblxuLyoqXG4gKiBVc2UgRXh0ZW5zaW9uXG4gKi9cblxubWFya2VkLnVzZSA9IGZ1bmN0aW9uKC4uLmFyZ3MpIHtcbiAgY29uc3QgZXh0ZW5zaW9ucyA9IG1hcmtlZC5kZWZhdWx0cy5leHRlbnNpb25zIHx8IHsgcmVuZGVyZXJzOiB7fSwgY2hpbGRUb2tlbnM6IHt9IH07XG5cbiAgYXJncy5mb3JFYWNoKChwYWNrKSA9PiB7XG4gICAgLy8gY29weSBvcHRpb25zIHRvIG5ldyBvYmplY3RcbiAgICBjb25zdCBvcHRzID0geyAuLi5wYWNrIH07XG5cbiAgICAvLyBzZXQgYXN5bmMgdG8gdHJ1ZSBpZiBpdCB3YXMgc2V0IHRvIHRydWUgYmVmb3JlXG4gICAgb3B0cy5hc3luYyA9IG1hcmtlZC5kZWZhdWx0cy5hc3luYyB8fCBvcHRzLmFzeW5jIHx8IGZhbHNlO1xuXG4gICAgLy8gPT0tLSBQYXJzZSBcImFkZG9uXCIgZXh0ZW5zaW9ucyAtLT09IC8vXG4gICAgaWYgKHBhY2suZXh0ZW5zaW9ucykge1xuICAgICAgcGFjay5leHRlbnNpb25zLmZvckVhY2goKGV4dCkgPT4ge1xuICAgICAgICBpZiAoIWV4dC5uYW1lKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdleHRlbnNpb24gbmFtZSByZXF1aXJlZCcpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChleHQucmVuZGVyZXIpIHsgLy8gUmVuZGVyZXIgZXh0ZW5zaW9uc1xuICAgICAgICAgIGNvbnN0IHByZXZSZW5kZXJlciA9IGV4dGVuc2lvbnMucmVuZGVyZXJzW2V4dC5uYW1lXTtcbiAgICAgICAgICBpZiAocHJldlJlbmRlcmVyKSB7XG4gICAgICAgICAgICAvLyBSZXBsYWNlIGV4dGVuc2lvbiB3aXRoIGZ1bmMgdG8gcnVuIG5ldyBleHRlbnNpb24gYnV0IGZhbGwgYmFjayBpZiBmYWxzZVxuICAgICAgICAgICAgZXh0ZW5zaW9ucy5yZW5kZXJlcnNbZXh0Lm5hbWVdID0gZnVuY3Rpb24oLi4uYXJncykge1xuICAgICAgICAgICAgICBsZXQgcmV0ID0gZXh0LnJlbmRlcmVyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgICAgICBpZiAocmV0ID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHJldCA9IHByZXZSZW5kZXJlci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gcmV0O1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZXh0ZW5zaW9ucy5yZW5kZXJlcnNbZXh0Lm5hbWVdID0gZXh0LnJlbmRlcmVyO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoZXh0LnRva2VuaXplcikgeyAvLyBUb2tlbml6ZXIgRXh0ZW5zaW9uc1xuICAgICAgICAgIGlmICghZXh0LmxldmVsIHx8IChleHQubGV2ZWwgIT09ICdibG9jaycgJiYgZXh0LmxldmVsICE9PSAnaW5saW5lJykpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcImV4dGVuc2lvbiBsZXZlbCBtdXN0IGJlICdibG9jaycgb3IgJ2lubGluZSdcIik7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChleHRlbnNpb25zW2V4dC5sZXZlbF0pIHtcbiAgICAgICAgICAgIGV4dGVuc2lvbnNbZXh0LmxldmVsXS51bnNoaWZ0KGV4dC50b2tlbml6ZXIpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBleHRlbnNpb25zW2V4dC5sZXZlbF0gPSBbZXh0LnRva2VuaXplcl07XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChleHQuc3RhcnQpIHsgLy8gRnVuY3Rpb24gdG8gY2hlY2sgZm9yIHN0YXJ0IG9mIHRva2VuXG4gICAgICAgICAgICBpZiAoZXh0LmxldmVsID09PSAnYmxvY2snKSB7XG4gICAgICAgICAgICAgIGlmIChleHRlbnNpb25zLnN0YXJ0QmxvY2spIHtcbiAgICAgICAgICAgICAgICBleHRlbnNpb25zLnN0YXJ0QmxvY2sucHVzaChleHQuc3RhcnQpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGV4dGVuc2lvbnMuc3RhcnRCbG9jayA9IFtleHQuc3RhcnRdO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGV4dC5sZXZlbCA9PT0gJ2lubGluZScpIHtcbiAgICAgICAgICAgICAgaWYgKGV4dGVuc2lvbnMuc3RhcnRJbmxpbmUpIHtcbiAgICAgICAgICAgICAgICBleHRlbnNpb25zLnN0YXJ0SW5saW5lLnB1c2goZXh0LnN0YXJ0KTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBleHRlbnNpb25zLnN0YXJ0SW5saW5lID0gW2V4dC5zdGFydF07XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGV4dC5jaGlsZFRva2VucykgeyAvLyBDaGlsZCB0b2tlbnMgdG8gYmUgdmlzaXRlZCBieSB3YWxrVG9rZW5zXG4gICAgICAgICAgZXh0ZW5zaW9ucy5jaGlsZFRva2Vuc1tleHQubmFtZV0gPSBleHQuY2hpbGRUb2tlbnM7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgb3B0cy5leHRlbnNpb25zID0gZXh0ZW5zaW9ucztcbiAgICB9XG5cbiAgICAvLyA9PS0tIFBhcnNlIFwib3ZlcndyaXRlXCIgZXh0ZW5zaW9ucyAtLT09IC8vXG4gICAgaWYgKHBhY2sucmVuZGVyZXIpIHtcbiAgICAgIGNvbnN0IHJlbmRlcmVyID0gbWFya2VkLmRlZmF1bHRzLnJlbmRlcmVyIHx8IG5ldyBSZW5kZXJlcigpO1xuICAgICAgZm9yIChjb25zdCBwcm9wIGluIHBhY2sucmVuZGVyZXIpIHtcbiAgICAgICAgY29uc3QgcHJldlJlbmRlcmVyID0gcmVuZGVyZXJbcHJvcF07XG4gICAgICAgIC8vIFJlcGxhY2UgcmVuZGVyZXIgd2l0aCBmdW5jIHRvIHJ1biBleHRlbnNpb24sIGJ1dCBmYWxsIGJhY2sgaWYgZmFsc2VcbiAgICAgICAgcmVuZGVyZXJbcHJvcF0gPSAoLi4uYXJncykgPT4ge1xuICAgICAgICAgIGxldCByZXQgPSBwYWNrLnJlbmRlcmVyW3Byb3BdLmFwcGx5KHJlbmRlcmVyLCBhcmdzKTtcbiAgICAgICAgICBpZiAocmV0ID09PSBmYWxzZSkge1xuICAgICAgICAgICAgcmV0ID0gcHJldlJlbmRlcmVyLmFwcGx5KHJlbmRlcmVyLCBhcmdzKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHJldDtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIG9wdHMucmVuZGVyZXIgPSByZW5kZXJlcjtcbiAgICB9XG4gICAgaWYgKHBhY2sudG9rZW5pemVyKSB7XG4gICAgICBjb25zdCB0b2tlbml6ZXIgPSBtYXJrZWQuZGVmYXVsdHMudG9rZW5pemVyIHx8IG5ldyBUb2tlbml6ZXIoKTtcbiAgICAgIGZvciAoY29uc3QgcHJvcCBpbiBwYWNrLnRva2VuaXplcikge1xuICAgICAgICBjb25zdCBwcmV2VG9rZW5pemVyID0gdG9rZW5pemVyW3Byb3BdO1xuICAgICAgICAvLyBSZXBsYWNlIHRva2VuaXplciB3aXRoIGZ1bmMgdG8gcnVuIGV4dGVuc2lvbiwgYnV0IGZhbGwgYmFjayBpZiBmYWxzZVxuICAgICAgICB0b2tlbml6ZXJbcHJvcF0gPSAoLi4uYXJncykgPT4ge1xuICAgICAgICAgIGxldCByZXQgPSBwYWNrLnRva2VuaXplcltwcm9wXS5hcHBseSh0b2tlbml6ZXIsIGFyZ3MpO1xuICAgICAgICAgIGlmIChyZXQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICByZXQgPSBwcmV2VG9rZW5pemVyLmFwcGx5KHRva2VuaXplciwgYXJncyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiByZXQ7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBvcHRzLnRva2VuaXplciA9IHRva2VuaXplcjtcbiAgICB9XG5cbiAgICAvLyA9PS0tIFBhcnNlIEhvb2tzIGV4dGVuc2lvbnMgLS09PSAvL1xuICAgIGlmIChwYWNrLmhvb2tzKSB7XG4gICAgICBjb25zdCBob29rcyA9IG1hcmtlZC5kZWZhdWx0cy5ob29rcyB8fCBuZXcgSG9va3MoKTtcbiAgICAgIGZvciAoY29uc3QgcHJvcCBpbiBwYWNrLmhvb2tzKSB7XG4gICAgICAgIGNvbnN0IHByZXZIb29rID0gaG9va3NbcHJvcF07XG4gICAgICAgIGlmIChIb29rcy5wYXNzVGhyb3VnaEhvb2tzLmhhcyhwcm9wKSkge1xuICAgICAgICAgIGhvb2tzW3Byb3BdID0gKGFyZykgPT4ge1xuICAgICAgICAgICAgaWYgKG1hcmtlZC5kZWZhdWx0cy5hc3luYykge1xuICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHBhY2suaG9va3NbcHJvcF0uY2FsbChob29rcywgYXJnKSkudGhlbihyZXQgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBwcmV2SG9vay5jYWxsKGhvb2tzLCByZXQpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgcmV0ID0gcGFjay5ob29rc1twcm9wXS5jYWxsKGhvb2tzLCBhcmcpO1xuICAgICAgICAgICAgcmV0dXJuIHByZXZIb29rLmNhbGwoaG9va3MsIHJldCk7XG4gICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBob29rc1twcm9wXSA9ICguLi5hcmdzKSA9PiB7XG4gICAgICAgICAgICBsZXQgcmV0ID0gcGFjay5ob29rc1twcm9wXS5hcHBseShob29rcywgYXJncyk7XG4gICAgICAgICAgICBpZiAocmV0ID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICByZXQgPSBwcmV2SG9vay5hcHBseShob29rcywgYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcmV0O1xuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIG9wdHMuaG9va3MgPSBob29rcztcbiAgICB9XG5cbiAgICAvLyA9PS0tIFBhcnNlIFdhbGtUb2tlbnMgZXh0ZW5zaW9ucyAtLT09IC8vXG4gICAgaWYgKHBhY2sud2Fsa1Rva2Vucykge1xuICAgICAgY29uc3Qgd2Fsa1Rva2VucyA9IG1hcmtlZC5kZWZhdWx0cy53YWxrVG9rZW5zO1xuICAgICAgb3B0cy53YWxrVG9rZW5zID0gZnVuY3Rpb24odG9rZW4pIHtcbiAgICAgICAgbGV0IHZhbHVlcyA9IFtdO1xuICAgICAgICB2YWx1ZXMucHVzaChwYWNrLndhbGtUb2tlbnMuY2FsbCh0aGlzLCB0b2tlbikpO1xuICAgICAgICBpZiAod2Fsa1Rva2Vucykge1xuICAgICAgICAgIHZhbHVlcyA9IHZhbHVlcy5jb25jYXQod2Fsa1Rva2Vucy5jYWxsKHRoaXMsIHRva2VuKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZhbHVlcztcbiAgICAgIH07XG4gICAgfVxuXG4gICAgbWFya2VkLnNldE9wdGlvbnMob3B0cyk7XG4gIH0pO1xufTtcblxuLyoqXG4gKiBSdW4gY2FsbGJhY2sgZm9yIGV2ZXJ5IHRva2VuXG4gKi9cblxubWFya2VkLndhbGtUb2tlbnMgPSBmdW5jdGlvbih0b2tlbnMsIGNhbGxiYWNrKSB7XG4gIGxldCB2YWx1ZXMgPSBbXTtcbiAgZm9yIChjb25zdCB0b2tlbiBvZiB0b2tlbnMpIHtcbiAgICB2YWx1ZXMgPSB2YWx1ZXMuY29uY2F0KGNhbGxiYWNrLmNhbGwobWFya2VkLCB0b2tlbikpO1xuICAgIHN3aXRjaCAodG9rZW4udHlwZSkge1xuICAgICAgY2FzZSAndGFibGUnOiB7XG4gICAgICAgIGZvciAoY29uc3QgY2VsbCBvZiB0b2tlbi5oZWFkZXIpIHtcbiAgICAgICAgICB2YWx1ZXMgPSB2YWx1ZXMuY29uY2F0KG1hcmtlZC53YWxrVG9rZW5zKGNlbGwudG9rZW5zLCBjYWxsYmFjaykpO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoY29uc3Qgcm93IG9mIHRva2VuLnJvd3MpIHtcbiAgICAgICAgICBmb3IgKGNvbnN0IGNlbGwgb2Ygcm93KSB7XG4gICAgICAgICAgICB2YWx1ZXMgPSB2YWx1ZXMuY29uY2F0KG1hcmtlZC53YWxrVG9rZW5zKGNlbGwudG9rZW5zLCBjYWxsYmFjaykpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGNhc2UgJ2xpc3QnOiB7XG4gICAgICAgIHZhbHVlcyA9IHZhbHVlcy5jb25jYXQobWFya2VkLndhbGtUb2tlbnModG9rZW4uaXRlbXMsIGNhbGxiYWNrKSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgZGVmYXVsdDoge1xuICAgICAgICBpZiAobWFya2VkLmRlZmF1bHRzLmV4dGVuc2lvbnMgJiYgbWFya2VkLmRlZmF1bHRzLmV4dGVuc2lvbnMuY2hpbGRUb2tlbnMgJiYgbWFya2VkLmRlZmF1bHRzLmV4dGVuc2lvbnMuY2hpbGRUb2tlbnNbdG9rZW4udHlwZV0pIHsgLy8gV2FsayBhbnkgZXh0ZW5zaW9uc1xuICAgICAgICAgIG1hcmtlZC5kZWZhdWx0cy5leHRlbnNpb25zLmNoaWxkVG9rZW5zW3Rva2VuLnR5cGVdLmZvckVhY2goZnVuY3Rpb24oY2hpbGRUb2tlbnMpIHtcbiAgICAgICAgICAgIHZhbHVlcyA9IHZhbHVlcy5jb25jYXQobWFya2VkLndhbGtUb2tlbnModG9rZW5bY2hpbGRUb2tlbnNdLCBjYWxsYmFjaykpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2UgaWYgKHRva2VuLnRva2Vucykge1xuICAgICAgICAgIHZhbHVlcyA9IHZhbHVlcy5jb25jYXQobWFya2VkLndhbGtUb2tlbnModG9rZW4udG9rZW5zLCBjYWxsYmFjaykpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiB2YWx1ZXM7XG59O1xuXG4vKipcbiAqIFBhcnNlIElubGluZVxuICogQHBhcmFtIHtzdHJpbmd9IHNyY1xuICovXG5tYXJrZWQucGFyc2VJbmxpbmUgPSBwYXJzZU1hcmtkb3duKExleGVyLmxleElubGluZSwgUGFyc2VyLnBhcnNlSW5saW5lKTtcblxuLyoqXG4gKiBFeHBvc2VcbiAqL1xubWFya2VkLlBhcnNlciA9IFBhcnNlcjtcbm1hcmtlZC5wYXJzZXIgPSBQYXJzZXIucGFyc2U7XG5tYXJrZWQuUmVuZGVyZXIgPSBSZW5kZXJlcjtcbm1hcmtlZC5UZXh0UmVuZGVyZXIgPSBUZXh0UmVuZGVyZXI7XG5tYXJrZWQuTGV4ZXIgPSBMZXhlcjtcbm1hcmtlZC5sZXhlciA9IExleGVyLmxleDtcbm1hcmtlZC5Ub2tlbml6ZXIgPSBUb2tlbml6ZXI7XG5tYXJrZWQuU2x1Z2dlciA9IFNsdWdnZXI7XG5tYXJrZWQuSG9va3MgPSBIb29rcztcbm1hcmtlZC5wYXJzZSA9IG1hcmtlZDtcblxuY29uc3Qgb3B0aW9ucyA9IG1hcmtlZC5vcHRpb25zO1xuY29uc3Qgc2V0T3B0aW9ucyA9IG1hcmtlZC5zZXRPcHRpb25zO1xuY29uc3QgdXNlID0gbWFya2VkLnVzZTtcbmNvbnN0IHdhbGtUb2tlbnMgPSBtYXJrZWQud2Fsa1Rva2VucztcbmNvbnN0IHBhcnNlSW5saW5lID0gbWFya2VkLnBhcnNlSW5saW5lO1xuY29uc3QgcGFyc2UgPSBtYXJrZWQ7XG5jb25zdCBwYXJzZXIgPSBQYXJzZXIucGFyc2U7XG5jb25zdCBsZXhlciA9IExleGVyLmxleDtcblxuZXhwb3J0IHsgSG9va3MsIExleGVyLCBQYXJzZXIsIFJlbmRlcmVyLCBTbHVnZ2VyLCBUZXh0UmVuZGVyZXIsIFRva2VuaXplciwgZGVmYXVsdHMsIGdldERlZmF1bHRzLCBsZXhlciwgbWFya2VkLCBvcHRpb25zLCBwYXJzZSwgcGFyc2VJbmxpbmUsIHBhcnNlciwgc2V0T3B0aW9ucywgdXNlLCB3YWxrVG9rZW5zIH07XG4iLCJpbXBvcnQge2Vwc2lsb24sIHNwbGl0dGVyLCByZXN1bHRlcnJib3VuZCwgZXN0aW1hdGUsIHZlYywgc3VtLCBzdW1fdGhyZWUsIHNjYWxlfSBmcm9tICcuL3V0aWwuanMnO1xuXG5jb25zdCBpY2NlcnJib3VuZEEgPSAoMTAgKyA5NiAqIGVwc2lsb24pICogZXBzaWxvbjtcbmNvbnN0IGljY2VycmJvdW5kQiA9ICg0ICsgNDggKiBlcHNpbG9uKSAqIGVwc2lsb247XG5jb25zdCBpY2NlcnJib3VuZEMgPSAoNDQgKyA1NzYgKiBlcHNpbG9uKSAqIGVwc2lsb24gKiBlcHNpbG9uO1xuXG5jb25zdCBiYyA9IHZlYyg0KTtcbmNvbnN0IGNhID0gdmVjKDQpO1xuY29uc3QgYWIgPSB2ZWMoNCk7XG5jb25zdCBhYSA9IHZlYyg0KTtcbmNvbnN0IGJiID0gdmVjKDQpO1xuY29uc3QgY2MgPSB2ZWMoNCk7XG5jb25zdCB1ID0gdmVjKDQpO1xuY29uc3QgdiA9IHZlYyg0KTtcbmNvbnN0IGF4dGJjID0gdmVjKDgpO1xuY29uc3QgYXl0YmMgPSB2ZWMoOCk7XG5jb25zdCBieHRjYSA9IHZlYyg4KTtcbmNvbnN0IGJ5dGNhID0gdmVjKDgpO1xuY29uc3QgY3h0YWIgPSB2ZWMoOCk7XG5jb25zdCBjeXRhYiA9IHZlYyg4KTtcbmNvbnN0IGFidCA9IHZlYyg4KTtcbmNvbnN0IGJjdCA9IHZlYyg4KTtcbmNvbnN0IGNhdCA9IHZlYyg4KTtcbmNvbnN0IGFidHQgPSB2ZWMoNCk7XG5jb25zdCBiY3R0ID0gdmVjKDQpO1xuY29uc3QgY2F0dCA9IHZlYyg0KTtcblxuY29uc3QgXzggPSB2ZWMoOCk7XG5jb25zdCBfMTYgPSB2ZWMoMTYpO1xuY29uc3QgXzE2YiA9IHZlYygxNik7XG5jb25zdCBfMTZjID0gdmVjKDE2KTtcbmNvbnN0IF8zMiA9IHZlYygzMik7XG5jb25zdCBfMzJiID0gdmVjKDMyKTtcbmNvbnN0IF80OCA9IHZlYyg0OCk7XG5jb25zdCBfNjQgPSB2ZWMoNjQpO1xuXG5sZXQgZmluID0gdmVjKDExNTIpO1xubGV0IGZpbjIgPSB2ZWMoMTE1Mik7XG5cbmZ1bmN0aW9uIGZpbmFkZChmaW5sZW4sIGEsIGFsZW4pIHtcbiAgICBmaW5sZW4gPSBzdW0oZmlubGVuLCBmaW4sIGEsIGFsZW4sIGZpbjIpO1xuICAgIGNvbnN0IHRtcCA9IGZpbjsgZmluID0gZmluMjsgZmluMiA9IHRtcDtcbiAgICByZXR1cm4gZmlubGVuO1xufVxuXG5mdW5jdGlvbiBpbmNpcmNsZWFkYXB0KGF4LCBheSwgYngsIGJ5LCBjeCwgY3ksIGR4LCBkeSwgcGVybWFuZW50KSB7XG4gICAgbGV0IGZpbmxlbjtcbiAgICBsZXQgYWR4dGFpbCwgYmR4dGFpbCwgY2R4dGFpbCwgYWR5dGFpbCwgYmR5dGFpbCwgY2R5dGFpbDtcbiAgICBsZXQgYXh0YmNsZW4sIGF5dGJjbGVuLCBieHRjYWxlbiwgYnl0Y2FsZW4sIGN4dGFibGVuLCBjeXRhYmxlbjtcbiAgICBsZXQgYWJ0bGVuLCBiY3RsZW4sIGNhdGxlbjtcbiAgICBsZXQgYWJ0dGxlbiwgYmN0dGxlbiwgY2F0dGxlbjtcbiAgICBsZXQgbjEsIG4wO1xuXG4gICAgbGV0IGJ2aXJ0LCBjLCBhaGksIGFsbywgYmhpLCBibG8sIF9pLCBfaiwgXzAsIHMxLCBzMCwgdDEsIHQwLCB1MztcblxuICAgIGNvbnN0IGFkeCA9IGF4IC0gZHg7XG4gICAgY29uc3QgYmR4ID0gYnggLSBkeDtcbiAgICBjb25zdCBjZHggPSBjeCAtIGR4O1xuICAgIGNvbnN0IGFkeSA9IGF5IC0gZHk7XG4gICAgY29uc3QgYmR5ID0gYnkgLSBkeTtcbiAgICBjb25zdCBjZHkgPSBjeSAtIGR5O1xuXG4gICAgczEgPSBiZHggKiBjZHk7XG4gICAgYyA9IHNwbGl0dGVyICogYmR4O1xuICAgIGFoaSA9IGMgLSAoYyAtIGJkeCk7XG4gICAgYWxvID0gYmR4IC0gYWhpO1xuICAgIGMgPSBzcGxpdHRlciAqIGNkeTtcbiAgICBiaGkgPSBjIC0gKGMgLSBjZHkpO1xuICAgIGJsbyA9IGNkeSAtIGJoaTtcbiAgICBzMCA9IGFsbyAqIGJsbyAtIChzMSAtIGFoaSAqIGJoaSAtIGFsbyAqIGJoaSAtIGFoaSAqIGJsbyk7XG4gICAgdDEgPSBjZHggKiBiZHk7XG4gICAgYyA9IHNwbGl0dGVyICogY2R4O1xuICAgIGFoaSA9IGMgLSAoYyAtIGNkeCk7XG4gICAgYWxvID0gY2R4IC0gYWhpO1xuICAgIGMgPSBzcGxpdHRlciAqIGJkeTtcbiAgICBiaGkgPSBjIC0gKGMgLSBiZHkpO1xuICAgIGJsbyA9IGJkeSAtIGJoaTtcbiAgICB0MCA9IGFsbyAqIGJsbyAtICh0MSAtIGFoaSAqIGJoaSAtIGFsbyAqIGJoaSAtIGFoaSAqIGJsbyk7XG4gICAgX2kgPSBzMCAtIHQwO1xuICAgIGJ2aXJ0ID0gczAgLSBfaTtcbiAgICBiY1swXSA9IHMwIC0gKF9pICsgYnZpcnQpICsgKGJ2aXJ0IC0gdDApO1xuICAgIF9qID0gczEgKyBfaTtcbiAgICBidmlydCA9IF9qIC0gczE7XG4gICAgXzAgPSBzMSAtIChfaiAtIGJ2aXJ0KSArIChfaSAtIGJ2aXJ0KTtcbiAgICBfaSA9IF8wIC0gdDE7XG4gICAgYnZpcnQgPSBfMCAtIF9pO1xuICAgIGJjWzFdID0gXzAgLSAoX2kgKyBidmlydCkgKyAoYnZpcnQgLSB0MSk7XG4gICAgdTMgPSBfaiArIF9pO1xuICAgIGJ2aXJ0ID0gdTMgLSBfajtcbiAgICBiY1syXSA9IF9qIC0gKHUzIC0gYnZpcnQpICsgKF9pIC0gYnZpcnQpO1xuICAgIGJjWzNdID0gdTM7XG4gICAgczEgPSBjZHggKiBhZHk7XG4gICAgYyA9IHNwbGl0dGVyICogY2R4O1xuICAgIGFoaSA9IGMgLSAoYyAtIGNkeCk7XG4gICAgYWxvID0gY2R4IC0gYWhpO1xuICAgIGMgPSBzcGxpdHRlciAqIGFkeTtcbiAgICBiaGkgPSBjIC0gKGMgLSBhZHkpO1xuICAgIGJsbyA9IGFkeSAtIGJoaTtcbiAgICBzMCA9IGFsbyAqIGJsbyAtIChzMSAtIGFoaSAqIGJoaSAtIGFsbyAqIGJoaSAtIGFoaSAqIGJsbyk7XG4gICAgdDEgPSBhZHggKiBjZHk7XG4gICAgYyA9IHNwbGl0dGVyICogYWR4O1xuICAgIGFoaSA9IGMgLSAoYyAtIGFkeCk7XG4gICAgYWxvID0gYWR4IC0gYWhpO1xuICAgIGMgPSBzcGxpdHRlciAqIGNkeTtcbiAgICBiaGkgPSBjIC0gKGMgLSBjZHkpO1xuICAgIGJsbyA9IGNkeSAtIGJoaTtcbiAgICB0MCA9IGFsbyAqIGJsbyAtICh0MSAtIGFoaSAqIGJoaSAtIGFsbyAqIGJoaSAtIGFoaSAqIGJsbyk7XG4gICAgX2kgPSBzMCAtIHQwO1xuICAgIGJ2aXJ0ID0gczAgLSBfaTtcbiAgICBjYVswXSA9IHMwIC0gKF9pICsgYnZpcnQpICsgKGJ2aXJ0IC0gdDApO1xuICAgIF9qID0gczEgKyBfaTtcbiAgICBidmlydCA9IF9qIC0gczE7XG4gICAgXzAgPSBzMSAtIChfaiAtIGJ2aXJ0KSArIChfaSAtIGJ2aXJ0KTtcbiAgICBfaSA9IF8wIC0gdDE7XG4gICAgYnZpcnQgPSBfMCAtIF9pO1xuICAgIGNhWzFdID0gXzAgLSAoX2kgKyBidmlydCkgKyAoYnZpcnQgLSB0MSk7XG4gICAgdTMgPSBfaiArIF9pO1xuICAgIGJ2aXJ0ID0gdTMgLSBfajtcbiAgICBjYVsyXSA9IF9qIC0gKHUzIC0gYnZpcnQpICsgKF9pIC0gYnZpcnQpO1xuICAgIGNhWzNdID0gdTM7XG4gICAgczEgPSBhZHggKiBiZHk7XG4gICAgYyA9IHNwbGl0dGVyICogYWR4O1xuICAgIGFoaSA9IGMgLSAoYyAtIGFkeCk7XG4gICAgYWxvID0gYWR4IC0gYWhpO1xuICAgIGMgPSBzcGxpdHRlciAqIGJkeTtcbiAgICBiaGkgPSBjIC0gKGMgLSBiZHkpO1xuICAgIGJsbyA9IGJkeSAtIGJoaTtcbiAgICBzMCA9IGFsbyAqIGJsbyAtIChzMSAtIGFoaSAqIGJoaSAtIGFsbyAqIGJoaSAtIGFoaSAqIGJsbyk7XG4gICAgdDEgPSBiZHggKiBhZHk7XG4gICAgYyA9IHNwbGl0dGVyICogYmR4O1xuICAgIGFoaSA9IGMgLSAoYyAtIGJkeCk7XG4gICAgYWxvID0gYmR4IC0gYWhpO1xuICAgIGMgPSBzcGxpdHRlciAqIGFkeTtcbiAgICBiaGkgPSBjIC0gKGMgLSBhZHkpO1xuICAgIGJsbyA9IGFkeSAtIGJoaTtcbiAgICB0MCA9IGFsbyAqIGJsbyAtICh0MSAtIGFoaSAqIGJoaSAtIGFsbyAqIGJoaSAtIGFoaSAqIGJsbyk7XG4gICAgX2kgPSBzMCAtIHQwO1xuICAgIGJ2aXJ0ID0gczAgLSBfaTtcbiAgICBhYlswXSA9IHMwIC0gKF9pICsgYnZpcnQpICsgKGJ2aXJ0IC0gdDApO1xuICAgIF9qID0gczEgKyBfaTtcbiAgICBidmlydCA9IF9qIC0gczE7XG4gICAgXzAgPSBzMSAtIChfaiAtIGJ2aXJ0KSArIChfaSAtIGJ2aXJ0KTtcbiAgICBfaSA9IF8wIC0gdDE7XG4gICAgYnZpcnQgPSBfMCAtIF9pO1xuICAgIGFiWzFdID0gXzAgLSAoX2kgKyBidmlydCkgKyAoYnZpcnQgLSB0MSk7XG4gICAgdTMgPSBfaiArIF9pO1xuICAgIGJ2aXJ0ID0gdTMgLSBfajtcbiAgICBhYlsyXSA9IF9qIC0gKHUzIC0gYnZpcnQpICsgKF9pIC0gYnZpcnQpO1xuICAgIGFiWzNdID0gdTM7XG5cbiAgICBmaW5sZW4gPSBzdW0oXG4gICAgICAgIHN1bShcbiAgICAgICAgICAgIHN1bShcbiAgICAgICAgICAgICAgICBzY2FsZShzY2FsZSg0LCBiYywgYWR4LCBfOCksIF84LCBhZHgsIF8xNiksIF8xNixcbiAgICAgICAgICAgICAgICBzY2FsZShzY2FsZSg0LCBiYywgYWR5LCBfOCksIF84LCBhZHksIF8xNmIpLCBfMTZiLCBfMzIpLCBfMzIsXG4gICAgICAgICAgICBzdW0oXG4gICAgICAgICAgICAgICAgc2NhbGUoc2NhbGUoNCwgY2EsIGJkeCwgXzgpLCBfOCwgYmR4LCBfMTYpLCBfMTYsXG4gICAgICAgICAgICAgICAgc2NhbGUoc2NhbGUoNCwgY2EsIGJkeSwgXzgpLCBfOCwgYmR5LCBfMTZiKSwgXzE2YiwgXzMyYiksIF8zMmIsIF82NCksIF82NCxcbiAgICAgICAgc3VtKFxuICAgICAgICAgICAgc2NhbGUoc2NhbGUoNCwgYWIsIGNkeCwgXzgpLCBfOCwgY2R4LCBfMTYpLCBfMTYsXG4gICAgICAgICAgICBzY2FsZShzY2FsZSg0LCBhYiwgY2R5LCBfOCksIF84LCBjZHksIF8xNmIpLCBfMTZiLCBfMzIpLCBfMzIsIGZpbik7XG5cbiAgICBsZXQgZGV0ID0gZXN0aW1hdGUoZmlubGVuLCBmaW4pO1xuICAgIGxldCBlcnJib3VuZCA9IGljY2VycmJvdW5kQiAqIHBlcm1hbmVudDtcbiAgICBpZiAoZGV0ID49IGVycmJvdW5kIHx8IC1kZXQgPj0gZXJyYm91bmQpIHtcbiAgICAgICAgcmV0dXJuIGRldDtcbiAgICB9XG5cbiAgICBidmlydCA9IGF4IC0gYWR4O1xuICAgIGFkeHRhaWwgPSBheCAtIChhZHggKyBidmlydCkgKyAoYnZpcnQgLSBkeCk7XG4gICAgYnZpcnQgPSBheSAtIGFkeTtcbiAgICBhZHl0YWlsID0gYXkgLSAoYWR5ICsgYnZpcnQpICsgKGJ2aXJ0IC0gZHkpO1xuICAgIGJ2aXJ0ID0gYnggLSBiZHg7XG4gICAgYmR4dGFpbCA9IGJ4IC0gKGJkeCArIGJ2aXJ0KSArIChidmlydCAtIGR4KTtcbiAgICBidmlydCA9IGJ5IC0gYmR5O1xuICAgIGJkeXRhaWwgPSBieSAtIChiZHkgKyBidmlydCkgKyAoYnZpcnQgLSBkeSk7XG4gICAgYnZpcnQgPSBjeCAtIGNkeDtcbiAgICBjZHh0YWlsID0gY3ggLSAoY2R4ICsgYnZpcnQpICsgKGJ2aXJ0IC0gZHgpO1xuICAgIGJ2aXJ0ID0gY3kgLSBjZHk7XG4gICAgY2R5dGFpbCA9IGN5IC0gKGNkeSArIGJ2aXJ0KSArIChidmlydCAtIGR5KTtcbiAgICBpZiAoYWR4dGFpbCA9PT0gMCAmJiBiZHh0YWlsID09PSAwICYmIGNkeHRhaWwgPT09IDAgJiYgYWR5dGFpbCA9PT0gMCAmJiBiZHl0YWlsID09PSAwICYmIGNkeXRhaWwgPT09IDApIHtcbiAgICAgICAgcmV0dXJuIGRldDtcbiAgICB9XG5cbiAgICBlcnJib3VuZCA9IGljY2VycmJvdW5kQyAqIHBlcm1hbmVudCArIHJlc3VsdGVycmJvdW5kICogTWF0aC5hYnMoZGV0KTtcbiAgICBkZXQgKz0gKChhZHggKiBhZHggKyBhZHkgKiBhZHkpICogKChiZHggKiBjZHl0YWlsICsgY2R5ICogYmR4dGFpbCkgLSAoYmR5ICogY2R4dGFpbCArIGNkeCAqIGJkeXRhaWwpKSArXG4gICAgICAgIDIgKiAoYWR4ICogYWR4dGFpbCArIGFkeSAqIGFkeXRhaWwpICogKGJkeCAqIGNkeSAtIGJkeSAqIGNkeCkpICtcbiAgICAgICAgKChiZHggKiBiZHggKyBiZHkgKiBiZHkpICogKChjZHggKiBhZHl0YWlsICsgYWR5ICogY2R4dGFpbCkgLSAoY2R5ICogYWR4dGFpbCArIGFkeCAqIGNkeXRhaWwpKSArXG4gICAgICAgIDIgKiAoYmR4ICogYmR4dGFpbCArIGJkeSAqIGJkeXRhaWwpICogKGNkeCAqIGFkeSAtIGNkeSAqIGFkeCkpICtcbiAgICAgICAgKChjZHggKiBjZHggKyBjZHkgKiBjZHkpICogKChhZHggKiBiZHl0YWlsICsgYmR5ICogYWR4dGFpbCkgLSAoYWR5ICogYmR4dGFpbCArIGJkeCAqIGFkeXRhaWwpKSArXG4gICAgICAgIDIgKiAoY2R4ICogY2R4dGFpbCArIGNkeSAqIGNkeXRhaWwpICogKGFkeCAqIGJkeSAtIGFkeSAqIGJkeCkpO1xuXG4gICAgaWYgKGRldCA+PSBlcnJib3VuZCB8fCAtZGV0ID49IGVycmJvdW5kKSB7XG4gICAgICAgIHJldHVybiBkZXQ7XG4gICAgfVxuXG4gICAgaWYgKGJkeHRhaWwgIT09IDAgfHwgYmR5dGFpbCAhPT0gMCB8fCBjZHh0YWlsICE9PSAwIHx8IGNkeXRhaWwgIT09IDApIHtcbiAgICAgICAgczEgPSBhZHggKiBhZHg7XG4gICAgICAgIGMgPSBzcGxpdHRlciAqIGFkeDtcbiAgICAgICAgYWhpID0gYyAtIChjIC0gYWR4KTtcbiAgICAgICAgYWxvID0gYWR4IC0gYWhpO1xuICAgICAgICBzMCA9IGFsbyAqIGFsbyAtIChzMSAtIGFoaSAqIGFoaSAtIChhaGkgKyBhaGkpICogYWxvKTtcbiAgICAgICAgdDEgPSBhZHkgKiBhZHk7XG4gICAgICAgIGMgPSBzcGxpdHRlciAqIGFkeTtcbiAgICAgICAgYWhpID0gYyAtIChjIC0gYWR5KTtcbiAgICAgICAgYWxvID0gYWR5IC0gYWhpO1xuICAgICAgICB0MCA9IGFsbyAqIGFsbyAtICh0MSAtIGFoaSAqIGFoaSAtIChhaGkgKyBhaGkpICogYWxvKTtcbiAgICAgICAgX2kgPSBzMCArIHQwO1xuICAgICAgICBidmlydCA9IF9pIC0gczA7XG4gICAgICAgIGFhWzBdID0gczAgLSAoX2kgLSBidmlydCkgKyAodDAgLSBidmlydCk7XG4gICAgICAgIF9qID0gczEgKyBfaTtcbiAgICAgICAgYnZpcnQgPSBfaiAtIHMxO1xuICAgICAgICBfMCA9IHMxIC0gKF9qIC0gYnZpcnQpICsgKF9pIC0gYnZpcnQpO1xuICAgICAgICBfaSA9IF8wICsgdDE7XG4gICAgICAgIGJ2aXJ0ID0gX2kgLSBfMDtcbiAgICAgICAgYWFbMV0gPSBfMCAtIChfaSAtIGJ2aXJ0KSArICh0MSAtIGJ2aXJ0KTtcbiAgICAgICAgdTMgPSBfaiArIF9pO1xuICAgICAgICBidmlydCA9IHUzIC0gX2o7XG4gICAgICAgIGFhWzJdID0gX2ogLSAodTMgLSBidmlydCkgKyAoX2kgLSBidmlydCk7XG4gICAgICAgIGFhWzNdID0gdTM7XG4gICAgfVxuICAgIGlmIChjZHh0YWlsICE9PSAwIHx8IGNkeXRhaWwgIT09IDAgfHwgYWR4dGFpbCAhPT0gMCB8fCBhZHl0YWlsICE9PSAwKSB7XG4gICAgICAgIHMxID0gYmR4ICogYmR4O1xuICAgICAgICBjID0gc3BsaXR0ZXIgKiBiZHg7XG4gICAgICAgIGFoaSA9IGMgLSAoYyAtIGJkeCk7XG4gICAgICAgIGFsbyA9IGJkeCAtIGFoaTtcbiAgICAgICAgczAgPSBhbG8gKiBhbG8gLSAoczEgLSBhaGkgKiBhaGkgLSAoYWhpICsgYWhpKSAqIGFsbyk7XG4gICAgICAgIHQxID0gYmR5ICogYmR5O1xuICAgICAgICBjID0gc3BsaXR0ZXIgKiBiZHk7XG4gICAgICAgIGFoaSA9IGMgLSAoYyAtIGJkeSk7XG4gICAgICAgIGFsbyA9IGJkeSAtIGFoaTtcbiAgICAgICAgdDAgPSBhbG8gKiBhbG8gLSAodDEgLSBhaGkgKiBhaGkgLSAoYWhpICsgYWhpKSAqIGFsbyk7XG4gICAgICAgIF9pID0gczAgKyB0MDtcbiAgICAgICAgYnZpcnQgPSBfaSAtIHMwO1xuICAgICAgICBiYlswXSA9IHMwIC0gKF9pIC0gYnZpcnQpICsgKHQwIC0gYnZpcnQpO1xuICAgICAgICBfaiA9IHMxICsgX2k7XG4gICAgICAgIGJ2aXJ0ID0gX2ogLSBzMTtcbiAgICAgICAgXzAgPSBzMSAtIChfaiAtIGJ2aXJ0KSArIChfaSAtIGJ2aXJ0KTtcbiAgICAgICAgX2kgPSBfMCArIHQxO1xuICAgICAgICBidmlydCA9IF9pIC0gXzA7XG4gICAgICAgIGJiWzFdID0gXzAgLSAoX2kgLSBidmlydCkgKyAodDEgLSBidmlydCk7XG4gICAgICAgIHUzID0gX2ogKyBfaTtcbiAgICAgICAgYnZpcnQgPSB1MyAtIF9qO1xuICAgICAgICBiYlsyXSA9IF9qIC0gKHUzIC0gYnZpcnQpICsgKF9pIC0gYnZpcnQpO1xuICAgICAgICBiYlszXSA9IHUzO1xuICAgIH1cbiAgICBpZiAoYWR4dGFpbCAhPT0gMCB8fCBhZHl0YWlsICE9PSAwIHx8IGJkeHRhaWwgIT09IDAgfHwgYmR5dGFpbCAhPT0gMCkge1xuICAgICAgICBzMSA9IGNkeCAqIGNkeDtcbiAgICAgICAgYyA9IHNwbGl0dGVyICogY2R4O1xuICAgICAgICBhaGkgPSBjIC0gKGMgLSBjZHgpO1xuICAgICAgICBhbG8gPSBjZHggLSBhaGk7XG4gICAgICAgIHMwID0gYWxvICogYWxvIC0gKHMxIC0gYWhpICogYWhpIC0gKGFoaSArIGFoaSkgKiBhbG8pO1xuICAgICAgICB0MSA9IGNkeSAqIGNkeTtcbiAgICAgICAgYyA9IHNwbGl0dGVyICogY2R5O1xuICAgICAgICBhaGkgPSBjIC0gKGMgLSBjZHkpO1xuICAgICAgICBhbG8gPSBjZHkgLSBhaGk7XG4gICAgICAgIHQwID0gYWxvICogYWxvIC0gKHQxIC0gYWhpICogYWhpIC0gKGFoaSArIGFoaSkgKiBhbG8pO1xuICAgICAgICBfaSA9IHMwICsgdDA7XG4gICAgICAgIGJ2aXJ0ID0gX2kgLSBzMDtcbiAgICAgICAgY2NbMF0gPSBzMCAtIChfaSAtIGJ2aXJ0KSArICh0MCAtIGJ2aXJ0KTtcbiAgICAgICAgX2ogPSBzMSArIF9pO1xuICAgICAgICBidmlydCA9IF9qIC0gczE7XG4gICAgICAgIF8wID0gczEgLSAoX2ogLSBidmlydCkgKyAoX2kgLSBidmlydCk7XG4gICAgICAgIF9pID0gXzAgKyB0MTtcbiAgICAgICAgYnZpcnQgPSBfaSAtIF8wO1xuICAgICAgICBjY1sxXSA9IF8wIC0gKF9pIC0gYnZpcnQpICsgKHQxIC0gYnZpcnQpO1xuICAgICAgICB1MyA9IF9qICsgX2k7XG4gICAgICAgIGJ2aXJ0ID0gdTMgLSBfajtcbiAgICAgICAgY2NbMl0gPSBfaiAtICh1MyAtIGJ2aXJ0KSArIChfaSAtIGJ2aXJ0KTtcbiAgICAgICAgY2NbM10gPSB1MztcbiAgICB9XG5cbiAgICBpZiAoYWR4dGFpbCAhPT0gMCkge1xuICAgICAgICBheHRiY2xlbiA9IHNjYWxlKDQsIGJjLCBhZHh0YWlsLCBheHRiYyk7XG4gICAgICAgIGZpbmxlbiA9IGZpbmFkZChmaW5sZW4sIHN1bV90aHJlZShcbiAgICAgICAgICAgIHNjYWxlKGF4dGJjbGVuLCBheHRiYywgMiAqIGFkeCwgXzE2KSwgXzE2LFxuICAgICAgICAgICAgc2NhbGUoc2NhbGUoNCwgY2MsIGFkeHRhaWwsIF84KSwgXzgsIGJkeSwgXzE2YiksIF8xNmIsXG4gICAgICAgICAgICBzY2FsZShzY2FsZSg0LCBiYiwgYWR4dGFpbCwgXzgpLCBfOCwgLWNkeSwgXzE2YyksIF8xNmMsIF8zMiwgXzQ4KSwgXzQ4KTtcbiAgICB9XG4gICAgaWYgKGFkeXRhaWwgIT09IDApIHtcbiAgICAgICAgYXl0YmNsZW4gPSBzY2FsZSg0LCBiYywgYWR5dGFpbCwgYXl0YmMpO1xuICAgICAgICBmaW5sZW4gPSBmaW5hZGQoZmlubGVuLCBzdW1fdGhyZWUoXG4gICAgICAgICAgICBzY2FsZShheXRiY2xlbiwgYXl0YmMsIDIgKiBhZHksIF8xNiksIF8xNixcbiAgICAgICAgICAgIHNjYWxlKHNjYWxlKDQsIGJiLCBhZHl0YWlsLCBfOCksIF84LCBjZHgsIF8xNmIpLCBfMTZiLFxuICAgICAgICAgICAgc2NhbGUoc2NhbGUoNCwgY2MsIGFkeXRhaWwsIF84KSwgXzgsIC1iZHgsIF8xNmMpLCBfMTZjLCBfMzIsIF80OCksIF80OCk7XG4gICAgfVxuICAgIGlmIChiZHh0YWlsICE9PSAwKSB7XG4gICAgICAgIGJ4dGNhbGVuID0gc2NhbGUoNCwgY2EsIGJkeHRhaWwsIGJ4dGNhKTtcbiAgICAgICAgZmlubGVuID0gZmluYWRkKGZpbmxlbiwgc3VtX3RocmVlKFxuICAgICAgICAgICAgc2NhbGUoYnh0Y2FsZW4sIGJ4dGNhLCAyICogYmR4LCBfMTYpLCBfMTYsXG4gICAgICAgICAgICBzY2FsZShzY2FsZSg0LCBhYSwgYmR4dGFpbCwgXzgpLCBfOCwgY2R5LCBfMTZiKSwgXzE2YixcbiAgICAgICAgICAgIHNjYWxlKHNjYWxlKDQsIGNjLCBiZHh0YWlsLCBfOCksIF84LCAtYWR5LCBfMTZjKSwgXzE2YywgXzMyLCBfNDgpLCBfNDgpO1xuICAgIH1cbiAgICBpZiAoYmR5dGFpbCAhPT0gMCkge1xuICAgICAgICBieXRjYWxlbiA9IHNjYWxlKDQsIGNhLCBiZHl0YWlsLCBieXRjYSk7XG4gICAgICAgIGZpbmxlbiA9IGZpbmFkZChmaW5sZW4sIHN1bV90aHJlZShcbiAgICAgICAgICAgIHNjYWxlKGJ5dGNhbGVuLCBieXRjYSwgMiAqIGJkeSwgXzE2KSwgXzE2LFxuICAgICAgICAgICAgc2NhbGUoc2NhbGUoNCwgY2MsIGJkeXRhaWwsIF84KSwgXzgsIGFkeCwgXzE2YiksIF8xNmIsXG4gICAgICAgICAgICBzY2FsZShzY2FsZSg0LCBhYSwgYmR5dGFpbCwgXzgpLCBfOCwgLWNkeCwgXzE2YyksIF8xNmMsIF8zMiwgXzQ4KSwgXzQ4KTtcbiAgICB9XG4gICAgaWYgKGNkeHRhaWwgIT09IDApIHtcbiAgICAgICAgY3h0YWJsZW4gPSBzY2FsZSg0LCBhYiwgY2R4dGFpbCwgY3h0YWIpO1xuICAgICAgICBmaW5sZW4gPSBmaW5hZGQoZmlubGVuLCBzdW1fdGhyZWUoXG4gICAgICAgICAgICBzY2FsZShjeHRhYmxlbiwgY3h0YWIsIDIgKiBjZHgsIF8xNiksIF8xNixcbiAgICAgICAgICAgIHNjYWxlKHNjYWxlKDQsIGJiLCBjZHh0YWlsLCBfOCksIF84LCBhZHksIF8xNmIpLCBfMTZiLFxuICAgICAgICAgICAgc2NhbGUoc2NhbGUoNCwgYWEsIGNkeHRhaWwsIF84KSwgXzgsIC1iZHksIF8xNmMpLCBfMTZjLCBfMzIsIF80OCksIF80OCk7XG4gICAgfVxuICAgIGlmIChjZHl0YWlsICE9PSAwKSB7XG4gICAgICAgIGN5dGFibGVuID0gc2NhbGUoNCwgYWIsIGNkeXRhaWwsIGN5dGFiKTtcbiAgICAgICAgZmlubGVuID0gZmluYWRkKGZpbmxlbiwgc3VtX3RocmVlKFxuICAgICAgICAgICAgc2NhbGUoY3l0YWJsZW4sIGN5dGFiLCAyICogY2R5LCBfMTYpLCBfMTYsXG4gICAgICAgICAgICBzY2FsZShzY2FsZSg0LCBhYSwgY2R5dGFpbCwgXzgpLCBfOCwgYmR4LCBfMTZiKSwgXzE2YixcbiAgICAgICAgICAgIHNjYWxlKHNjYWxlKDQsIGJiLCBjZHl0YWlsLCBfOCksIF84LCAtYWR4LCBfMTZjKSwgXzE2YywgXzMyLCBfNDgpLCBfNDgpO1xuICAgIH1cblxuICAgIGlmIChhZHh0YWlsICE9PSAwIHx8IGFkeXRhaWwgIT09IDApIHtcbiAgICAgICAgaWYgKGJkeHRhaWwgIT09IDAgfHwgYmR5dGFpbCAhPT0gMCB8fCBjZHh0YWlsICE9PSAwIHx8IGNkeXRhaWwgIT09IDApIHtcbiAgICAgICAgICAgIHMxID0gYmR4dGFpbCAqIGNkeTtcbiAgICAgICAgICAgIGMgPSBzcGxpdHRlciAqIGJkeHRhaWw7XG4gICAgICAgICAgICBhaGkgPSBjIC0gKGMgLSBiZHh0YWlsKTtcbiAgICAgICAgICAgIGFsbyA9IGJkeHRhaWwgLSBhaGk7XG4gICAgICAgICAgICBjID0gc3BsaXR0ZXIgKiBjZHk7XG4gICAgICAgICAgICBiaGkgPSBjIC0gKGMgLSBjZHkpO1xuICAgICAgICAgICAgYmxvID0gY2R5IC0gYmhpO1xuICAgICAgICAgICAgczAgPSBhbG8gKiBibG8gLSAoczEgLSBhaGkgKiBiaGkgLSBhbG8gKiBiaGkgLSBhaGkgKiBibG8pO1xuICAgICAgICAgICAgdDEgPSBiZHggKiBjZHl0YWlsO1xuICAgICAgICAgICAgYyA9IHNwbGl0dGVyICogYmR4O1xuICAgICAgICAgICAgYWhpID0gYyAtIChjIC0gYmR4KTtcbiAgICAgICAgICAgIGFsbyA9IGJkeCAtIGFoaTtcbiAgICAgICAgICAgIGMgPSBzcGxpdHRlciAqIGNkeXRhaWw7XG4gICAgICAgICAgICBiaGkgPSBjIC0gKGMgLSBjZHl0YWlsKTtcbiAgICAgICAgICAgIGJsbyA9IGNkeXRhaWwgLSBiaGk7XG4gICAgICAgICAgICB0MCA9IGFsbyAqIGJsbyAtICh0MSAtIGFoaSAqIGJoaSAtIGFsbyAqIGJoaSAtIGFoaSAqIGJsbyk7XG4gICAgICAgICAgICBfaSA9IHMwICsgdDA7XG4gICAgICAgICAgICBidmlydCA9IF9pIC0gczA7XG4gICAgICAgICAgICB1WzBdID0gczAgLSAoX2kgLSBidmlydCkgKyAodDAgLSBidmlydCk7XG4gICAgICAgICAgICBfaiA9IHMxICsgX2k7XG4gICAgICAgICAgICBidmlydCA9IF9qIC0gczE7XG4gICAgICAgICAgICBfMCA9IHMxIC0gKF9qIC0gYnZpcnQpICsgKF9pIC0gYnZpcnQpO1xuICAgICAgICAgICAgX2kgPSBfMCArIHQxO1xuICAgICAgICAgICAgYnZpcnQgPSBfaSAtIF8wO1xuICAgICAgICAgICAgdVsxXSA9IF8wIC0gKF9pIC0gYnZpcnQpICsgKHQxIC0gYnZpcnQpO1xuICAgICAgICAgICAgdTMgPSBfaiArIF9pO1xuICAgICAgICAgICAgYnZpcnQgPSB1MyAtIF9qO1xuICAgICAgICAgICAgdVsyXSA9IF9qIC0gKHUzIC0gYnZpcnQpICsgKF9pIC0gYnZpcnQpO1xuICAgICAgICAgICAgdVszXSA9IHUzO1xuICAgICAgICAgICAgczEgPSBjZHh0YWlsICogLWJkeTtcbiAgICAgICAgICAgIGMgPSBzcGxpdHRlciAqIGNkeHRhaWw7XG4gICAgICAgICAgICBhaGkgPSBjIC0gKGMgLSBjZHh0YWlsKTtcbiAgICAgICAgICAgIGFsbyA9IGNkeHRhaWwgLSBhaGk7XG4gICAgICAgICAgICBjID0gc3BsaXR0ZXIgKiAtYmR5O1xuICAgICAgICAgICAgYmhpID0gYyAtIChjIC0gLWJkeSk7XG4gICAgICAgICAgICBibG8gPSAtYmR5IC0gYmhpO1xuICAgICAgICAgICAgczAgPSBhbG8gKiBibG8gLSAoczEgLSBhaGkgKiBiaGkgLSBhbG8gKiBiaGkgLSBhaGkgKiBibG8pO1xuICAgICAgICAgICAgdDEgPSBjZHggKiAtYmR5dGFpbDtcbiAgICAgICAgICAgIGMgPSBzcGxpdHRlciAqIGNkeDtcbiAgICAgICAgICAgIGFoaSA9IGMgLSAoYyAtIGNkeCk7XG4gICAgICAgICAgICBhbG8gPSBjZHggLSBhaGk7XG4gICAgICAgICAgICBjID0gc3BsaXR0ZXIgKiAtYmR5dGFpbDtcbiAgICAgICAgICAgIGJoaSA9IGMgLSAoYyAtIC1iZHl0YWlsKTtcbiAgICAgICAgICAgIGJsbyA9IC1iZHl0YWlsIC0gYmhpO1xuICAgICAgICAgICAgdDAgPSBhbG8gKiBibG8gLSAodDEgLSBhaGkgKiBiaGkgLSBhbG8gKiBiaGkgLSBhaGkgKiBibG8pO1xuICAgICAgICAgICAgX2kgPSBzMCArIHQwO1xuICAgICAgICAgICAgYnZpcnQgPSBfaSAtIHMwO1xuICAgICAgICAgICAgdlswXSA9IHMwIC0gKF9pIC0gYnZpcnQpICsgKHQwIC0gYnZpcnQpO1xuICAgICAgICAgICAgX2ogPSBzMSArIF9pO1xuICAgICAgICAgICAgYnZpcnQgPSBfaiAtIHMxO1xuICAgICAgICAgICAgXzAgPSBzMSAtIChfaiAtIGJ2aXJ0KSArIChfaSAtIGJ2aXJ0KTtcbiAgICAgICAgICAgIF9pID0gXzAgKyB0MTtcbiAgICAgICAgICAgIGJ2aXJ0ID0gX2kgLSBfMDtcbiAgICAgICAgICAgIHZbMV0gPSBfMCAtIChfaSAtIGJ2aXJ0KSArICh0MSAtIGJ2aXJ0KTtcbiAgICAgICAgICAgIHUzID0gX2ogKyBfaTtcbiAgICAgICAgICAgIGJ2aXJ0ID0gdTMgLSBfajtcbiAgICAgICAgICAgIHZbMl0gPSBfaiAtICh1MyAtIGJ2aXJ0KSArIChfaSAtIGJ2aXJ0KTtcbiAgICAgICAgICAgIHZbM10gPSB1MztcbiAgICAgICAgICAgIGJjdGxlbiA9IHN1bSg0LCB1LCA0LCB2LCBiY3QpO1xuICAgICAgICAgICAgczEgPSBiZHh0YWlsICogY2R5dGFpbDtcbiAgICAgICAgICAgIGMgPSBzcGxpdHRlciAqIGJkeHRhaWw7XG4gICAgICAgICAgICBhaGkgPSBjIC0gKGMgLSBiZHh0YWlsKTtcbiAgICAgICAgICAgIGFsbyA9IGJkeHRhaWwgLSBhaGk7XG4gICAgICAgICAgICBjID0gc3BsaXR0ZXIgKiBjZHl0YWlsO1xuICAgICAgICAgICAgYmhpID0gYyAtIChjIC0gY2R5dGFpbCk7XG4gICAgICAgICAgICBibG8gPSBjZHl0YWlsIC0gYmhpO1xuICAgICAgICAgICAgczAgPSBhbG8gKiBibG8gLSAoczEgLSBhaGkgKiBiaGkgLSBhbG8gKiBiaGkgLSBhaGkgKiBibG8pO1xuICAgICAgICAgICAgdDEgPSBjZHh0YWlsICogYmR5dGFpbDtcbiAgICAgICAgICAgIGMgPSBzcGxpdHRlciAqIGNkeHRhaWw7XG4gICAgICAgICAgICBhaGkgPSBjIC0gKGMgLSBjZHh0YWlsKTtcbiAgICAgICAgICAgIGFsbyA9IGNkeHRhaWwgLSBhaGk7XG4gICAgICAgICAgICBjID0gc3BsaXR0ZXIgKiBiZHl0YWlsO1xuICAgICAgICAgICAgYmhpID0gYyAtIChjIC0gYmR5dGFpbCk7XG4gICAgICAgICAgICBibG8gPSBiZHl0YWlsIC0gYmhpO1xuICAgICAgICAgICAgdDAgPSBhbG8gKiBibG8gLSAodDEgLSBhaGkgKiBiaGkgLSBhbG8gKiBiaGkgLSBhaGkgKiBibG8pO1xuICAgICAgICAgICAgX2kgPSBzMCAtIHQwO1xuICAgICAgICAgICAgYnZpcnQgPSBzMCAtIF9pO1xuICAgICAgICAgICAgYmN0dFswXSA9IHMwIC0gKF9pICsgYnZpcnQpICsgKGJ2aXJ0IC0gdDApO1xuICAgICAgICAgICAgX2ogPSBzMSArIF9pO1xuICAgICAgICAgICAgYnZpcnQgPSBfaiAtIHMxO1xuICAgICAgICAgICAgXzAgPSBzMSAtIChfaiAtIGJ2aXJ0KSArIChfaSAtIGJ2aXJ0KTtcbiAgICAgICAgICAgIF9pID0gXzAgLSB0MTtcbiAgICAgICAgICAgIGJ2aXJ0ID0gXzAgLSBfaTtcbiAgICAgICAgICAgIGJjdHRbMV0gPSBfMCAtIChfaSArIGJ2aXJ0KSArIChidmlydCAtIHQxKTtcbiAgICAgICAgICAgIHUzID0gX2ogKyBfaTtcbiAgICAgICAgICAgIGJ2aXJ0ID0gdTMgLSBfajtcbiAgICAgICAgICAgIGJjdHRbMl0gPSBfaiAtICh1MyAtIGJ2aXJ0KSArIChfaSAtIGJ2aXJ0KTtcbiAgICAgICAgICAgIGJjdHRbM10gPSB1MztcbiAgICAgICAgICAgIGJjdHRsZW4gPSA0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYmN0WzBdID0gMDtcbiAgICAgICAgICAgIGJjdGxlbiA9IDE7XG4gICAgICAgICAgICBiY3R0WzBdID0gMDtcbiAgICAgICAgICAgIGJjdHRsZW4gPSAxO1xuICAgICAgICB9XG4gICAgICAgIGlmIChhZHh0YWlsICE9PSAwKSB7XG4gICAgICAgICAgICBjb25zdCBsZW4gPSBzY2FsZShiY3RsZW4sIGJjdCwgYWR4dGFpbCwgXzE2Yyk7XG4gICAgICAgICAgICBmaW5sZW4gPSBmaW5hZGQoZmlubGVuLCBzdW0oXG4gICAgICAgICAgICAgICAgc2NhbGUoYXh0YmNsZW4sIGF4dGJjLCBhZHh0YWlsLCBfMTYpLCBfMTYsXG4gICAgICAgICAgICAgICAgc2NhbGUobGVuLCBfMTZjLCAyICogYWR4LCBfMzIpLCBfMzIsIF80OCksIF80OCk7XG5cbiAgICAgICAgICAgIGNvbnN0IGxlbjIgPSBzY2FsZShiY3R0bGVuLCBiY3R0LCBhZHh0YWlsLCBfOCk7XG4gICAgICAgICAgICBmaW5sZW4gPSBmaW5hZGQoZmlubGVuLCBzdW1fdGhyZWUoXG4gICAgICAgICAgICAgICAgc2NhbGUobGVuMiwgXzgsIDIgKiBhZHgsIF8xNiksIF8xNixcbiAgICAgICAgICAgICAgICBzY2FsZShsZW4yLCBfOCwgYWR4dGFpbCwgXzE2YiksIF8xNmIsXG4gICAgICAgICAgICAgICAgc2NhbGUobGVuLCBfMTZjLCBhZHh0YWlsLCBfMzIpLCBfMzIsIF8zMmIsIF82NCksIF82NCk7XG5cbiAgICAgICAgICAgIGlmIChiZHl0YWlsICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgZmlubGVuID0gZmluYWRkKGZpbmxlbiwgc2NhbGUoc2NhbGUoNCwgY2MsIGFkeHRhaWwsIF84KSwgXzgsIGJkeXRhaWwsIF8xNiksIF8xNik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoY2R5dGFpbCAhPT0gMCkge1xuICAgICAgICAgICAgICAgIGZpbmxlbiA9IGZpbmFkZChmaW5sZW4sIHNjYWxlKHNjYWxlKDQsIGJiLCAtYWR4dGFpbCwgXzgpLCBfOCwgY2R5dGFpbCwgXzE2KSwgXzE2KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoYWR5dGFpbCAhPT0gMCkge1xuICAgICAgICAgICAgY29uc3QgbGVuID0gc2NhbGUoYmN0bGVuLCBiY3QsIGFkeXRhaWwsIF8xNmMpO1xuICAgICAgICAgICAgZmlubGVuID0gZmluYWRkKGZpbmxlbiwgc3VtKFxuICAgICAgICAgICAgICAgIHNjYWxlKGF5dGJjbGVuLCBheXRiYywgYWR5dGFpbCwgXzE2KSwgXzE2LFxuICAgICAgICAgICAgICAgIHNjYWxlKGxlbiwgXzE2YywgMiAqIGFkeSwgXzMyKSwgXzMyLCBfNDgpLCBfNDgpO1xuXG4gICAgICAgICAgICBjb25zdCBsZW4yID0gc2NhbGUoYmN0dGxlbiwgYmN0dCwgYWR5dGFpbCwgXzgpO1xuICAgICAgICAgICAgZmlubGVuID0gZmluYWRkKGZpbmxlbiwgc3VtX3RocmVlKFxuICAgICAgICAgICAgICAgIHNjYWxlKGxlbjIsIF84LCAyICogYWR5LCBfMTYpLCBfMTYsXG4gICAgICAgICAgICAgICAgc2NhbGUobGVuMiwgXzgsIGFkeXRhaWwsIF8xNmIpLCBfMTZiLFxuICAgICAgICAgICAgICAgIHNjYWxlKGxlbiwgXzE2YywgYWR5dGFpbCwgXzMyKSwgXzMyLCBfMzJiLCBfNjQpLCBfNjQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChiZHh0YWlsICE9PSAwIHx8IGJkeXRhaWwgIT09IDApIHtcbiAgICAgICAgaWYgKGNkeHRhaWwgIT09IDAgfHwgY2R5dGFpbCAhPT0gMCB8fCBhZHh0YWlsICE9PSAwIHx8IGFkeXRhaWwgIT09IDApIHtcbiAgICAgICAgICAgIHMxID0gY2R4dGFpbCAqIGFkeTtcbiAgICAgICAgICAgIGMgPSBzcGxpdHRlciAqIGNkeHRhaWw7XG4gICAgICAgICAgICBhaGkgPSBjIC0gKGMgLSBjZHh0YWlsKTtcbiAgICAgICAgICAgIGFsbyA9IGNkeHRhaWwgLSBhaGk7XG4gICAgICAgICAgICBjID0gc3BsaXR0ZXIgKiBhZHk7XG4gICAgICAgICAgICBiaGkgPSBjIC0gKGMgLSBhZHkpO1xuICAgICAgICAgICAgYmxvID0gYWR5IC0gYmhpO1xuICAgICAgICAgICAgczAgPSBhbG8gKiBibG8gLSAoczEgLSBhaGkgKiBiaGkgLSBhbG8gKiBiaGkgLSBhaGkgKiBibG8pO1xuICAgICAgICAgICAgdDEgPSBjZHggKiBhZHl0YWlsO1xuICAgICAgICAgICAgYyA9IHNwbGl0dGVyICogY2R4O1xuICAgICAgICAgICAgYWhpID0gYyAtIChjIC0gY2R4KTtcbiAgICAgICAgICAgIGFsbyA9IGNkeCAtIGFoaTtcbiAgICAgICAgICAgIGMgPSBzcGxpdHRlciAqIGFkeXRhaWw7XG4gICAgICAgICAgICBiaGkgPSBjIC0gKGMgLSBhZHl0YWlsKTtcbiAgICAgICAgICAgIGJsbyA9IGFkeXRhaWwgLSBiaGk7XG4gICAgICAgICAgICB0MCA9IGFsbyAqIGJsbyAtICh0MSAtIGFoaSAqIGJoaSAtIGFsbyAqIGJoaSAtIGFoaSAqIGJsbyk7XG4gICAgICAgICAgICBfaSA9IHMwICsgdDA7XG4gICAgICAgICAgICBidmlydCA9IF9pIC0gczA7XG4gICAgICAgICAgICB1WzBdID0gczAgLSAoX2kgLSBidmlydCkgKyAodDAgLSBidmlydCk7XG4gICAgICAgICAgICBfaiA9IHMxICsgX2k7XG4gICAgICAgICAgICBidmlydCA9IF9qIC0gczE7XG4gICAgICAgICAgICBfMCA9IHMxIC0gKF9qIC0gYnZpcnQpICsgKF9pIC0gYnZpcnQpO1xuICAgICAgICAgICAgX2kgPSBfMCArIHQxO1xuICAgICAgICAgICAgYnZpcnQgPSBfaSAtIF8wO1xuICAgICAgICAgICAgdVsxXSA9IF8wIC0gKF9pIC0gYnZpcnQpICsgKHQxIC0gYnZpcnQpO1xuICAgICAgICAgICAgdTMgPSBfaiArIF9pO1xuICAgICAgICAgICAgYnZpcnQgPSB1MyAtIF9qO1xuICAgICAgICAgICAgdVsyXSA9IF9qIC0gKHUzIC0gYnZpcnQpICsgKF9pIC0gYnZpcnQpO1xuICAgICAgICAgICAgdVszXSA9IHUzO1xuICAgICAgICAgICAgbjEgPSAtY2R5O1xuICAgICAgICAgICAgbjAgPSAtY2R5dGFpbDtcbiAgICAgICAgICAgIHMxID0gYWR4dGFpbCAqIG4xO1xuICAgICAgICAgICAgYyA9IHNwbGl0dGVyICogYWR4dGFpbDtcbiAgICAgICAgICAgIGFoaSA9IGMgLSAoYyAtIGFkeHRhaWwpO1xuICAgICAgICAgICAgYWxvID0gYWR4dGFpbCAtIGFoaTtcbiAgICAgICAgICAgIGMgPSBzcGxpdHRlciAqIG4xO1xuICAgICAgICAgICAgYmhpID0gYyAtIChjIC0gbjEpO1xuICAgICAgICAgICAgYmxvID0gbjEgLSBiaGk7XG4gICAgICAgICAgICBzMCA9IGFsbyAqIGJsbyAtIChzMSAtIGFoaSAqIGJoaSAtIGFsbyAqIGJoaSAtIGFoaSAqIGJsbyk7XG4gICAgICAgICAgICB0MSA9IGFkeCAqIG4wO1xuICAgICAgICAgICAgYyA9IHNwbGl0dGVyICogYWR4O1xuICAgICAgICAgICAgYWhpID0gYyAtIChjIC0gYWR4KTtcbiAgICAgICAgICAgIGFsbyA9IGFkeCAtIGFoaTtcbiAgICAgICAgICAgIGMgPSBzcGxpdHRlciAqIG4wO1xuICAgICAgICAgICAgYmhpID0gYyAtIChjIC0gbjApO1xuICAgICAgICAgICAgYmxvID0gbjAgLSBiaGk7XG4gICAgICAgICAgICB0MCA9IGFsbyAqIGJsbyAtICh0MSAtIGFoaSAqIGJoaSAtIGFsbyAqIGJoaSAtIGFoaSAqIGJsbyk7XG4gICAgICAgICAgICBfaSA9IHMwICsgdDA7XG4gICAgICAgICAgICBidmlydCA9IF9pIC0gczA7XG4gICAgICAgICAgICB2WzBdID0gczAgLSAoX2kgLSBidmlydCkgKyAodDAgLSBidmlydCk7XG4gICAgICAgICAgICBfaiA9IHMxICsgX2k7XG4gICAgICAgICAgICBidmlydCA9IF9qIC0gczE7XG4gICAgICAgICAgICBfMCA9IHMxIC0gKF9qIC0gYnZpcnQpICsgKF9pIC0gYnZpcnQpO1xuICAgICAgICAgICAgX2kgPSBfMCArIHQxO1xuICAgICAgICAgICAgYnZpcnQgPSBfaSAtIF8wO1xuICAgICAgICAgICAgdlsxXSA9IF8wIC0gKF9pIC0gYnZpcnQpICsgKHQxIC0gYnZpcnQpO1xuICAgICAgICAgICAgdTMgPSBfaiArIF9pO1xuICAgICAgICAgICAgYnZpcnQgPSB1MyAtIF9qO1xuICAgICAgICAgICAgdlsyXSA9IF9qIC0gKHUzIC0gYnZpcnQpICsgKF9pIC0gYnZpcnQpO1xuICAgICAgICAgICAgdlszXSA9IHUzO1xuICAgICAgICAgICAgY2F0bGVuID0gc3VtKDQsIHUsIDQsIHYsIGNhdCk7XG4gICAgICAgICAgICBzMSA9IGNkeHRhaWwgKiBhZHl0YWlsO1xuICAgICAgICAgICAgYyA9IHNwbGl0dGVyICogY2R4dGFpbDtcbiAgICAgICAgICAgIGFoaSA9IGMgLSAoYyAtIGNkeHRhaWwpO1xuICAgICAgICAgICAgYWxvID0gY2R4dGFpbCAtIGFoaTtcbiAgICAgICAgICAgIGMgPSBzcGxpdHRlciAqIGFkeXRhaWw7XG4gICAgICAgICAgICBiaGkgPSBjIC0gKGMgLSBhZHl0YWlsKTtcbiAgICAgICAgICAgIGJsbyA9IGFkeXRhaWwgLSBiaGk7XG4gICAgICAgICAgICBzMCA9IGFsbyAqIGJsbyAtIChzMSAtIGFoaSAqIGJoaSAtIGFsbyAqIGJoaSAtIGFoaSAqIGJsbyk7XG4gICAgICAgICAgICB0MSA9IGFkeHRhaWwgKiBjZHl0YWlsO1xuICAgICAgICAgICAgYyA9IHNwbGl0dGVyICogYWR4dGFpbDtcbiAgICAgICAgICAgIGFoaSA9IGMgLSAoYyAtIGFkeHRhaWwpO1xuICAgICAgICAgICAgYWxvID0gYWR4dGFpbCAtIGFoaTtcbiAgICAgICAgICAgIGMgPSBzcGxpdHRlciAqIGNkeXRhaWw7XG4gICAgICAgICAgICBiaGkgPSBjIC0gKGMgLSBjZHl0YWlsKTtcbiAgICAgICAgICAgIGJsbyA9IGNkeXRhaWwgLSBiaGk7XG4gICAgICAgICAgICB0MCA9IGFsbyAqIGJsbyAtICh0MSAtIGFoaSAqIGJoaSAtIGFsbyAqIGJoaSAtIGFoaSAqIGJsbyk7XG4gICAgICAgICAgICBfaSA9IHMwIC0gdDA7XG4gICAgICAgICAgICBidmlydCA9IHMwIC0gX2k7XG4gICAgICAgICAgICBjYXR0WzBdID0gczAgLSAoX2kgKyBidmlydCkgKyAoYnZpcnQgLSB0MCk7XG4gICAgICAgICAgICBfaiA9IHMxICsgX2k7XG4gICAgICAgICAgICBidmlydCA9IF9qIC0gczE7XG4gICAgICAgICAgICBfMCA9IHMxIC0gKF9qIC0gYnZpcnQpICsgKF9pIC0gYnZpcnQpO1xuICAgICAgICAgICAgX2kgPSBfMCAtIHQxO1xuICAgICAgICAgICAgYnZpcnQgPSBfMCAtIF9pO1xuICAgICAgICAgICAgY2F0dFsxXSA9IF8wIC0gKF9pICsgYnZpcnQpICsgKGJ2aXJ0IC0gdDEpO1xuICAgICAgICAgICAgdTMgPSBfaiArIF9pO1xuICAgICAgICAgICAgYnZpcnQgPSB1MyAtIF9qO1xuICAgICAgICAgICAgY2F0dFsyXSA9IF9qIC0gKHUzIC0gYnZpcnQpICsgKF9pIC0gYnZpcnQpO1xuICAgICAgICAgICAgY2F0dFszXSA9IHUzO1xuICAgICAgICAgICAgY2F0dGxlbiA9IDQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYXRbMF0gPSAwO1xuICAgICAgICAgICAgY2F0bGVuID0gMTtcbiAgICAgICAgICAgIGNhdHRbMF0gPSAwO1xuICAgICAgICAgICAgY2F0dGxlbiA9IDE7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGJkeHRhaWwgIT09IDApIHtcbiAgICAgICAgICAgIGNvbnN0IGxlbiA9IHNjYWxlKGNhdGxlbiwgY2F0LCBiZHh0YWlsLCBfMTZjKTtcbiAgICAgICAgICAgIGZpbmxlbiA9IGZpbmFkZChmaW5sZW4sIHN1bShcbiAgICAgICAgICAgICAgICBzY2FsZShieHRjYWxlbiwgYnh0Y2EsIGJkeHRhaWwsIF8xNiksIF8xNixcbiAgICAgICAgICAgICAgICBzY2FsZShsZW4sIF8xNmMsIDIgKiBiZHgsIF8zMiksIF8zMiwgXzQ4KSwgXzQ4KTtcblxuICAgICAgICAgICAgY29uc3QgbGVuMiA9IHNjYWxlKGNhdHRsZW4sIGNhdHQsIGJkeHRhaWwsIF84KTtcbiAgICAgICAgICAgIGZpbmxlbiA9IGZpbmFkZChmaW5sZW4sIHN1bV90aHJlZShcbiAgICAgICAgICAgICAgICBzY2FsZShsZW4yLCBfOCwgMiAqIGJkeCwgXzE2KSwgXzE2LFxuICAgICAgICAgICAgICAgIHNjYWxlKGxlbjIsIF84LCBiZHh0YWlsLCBfMTZiKSwgXzE2YixcbiAgICAgICAgICAgICAgICBzY2FsZShsZW4sIF8xNmMsIGJkeHRhaWwsIF8zMiksIF8zMiwgXzMyYiwgXzY0KSwgXzY0KTtcblxuICAgICAgICAgICAgaWYgKGNkeXRhaWwgIT09IDApIHtcbiAgICAgICAgICAgICAgICBmaW5sZW4gPSBmaW5hZGQoZmlubGVuLCBzY2FsZShzY2FsZSg0LCBhYSwgYmR4dGFpbCwgXzgpLCBfOCwgY2R5dGFpbCwgXzE2KSwgXzE2KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChhZHl0YWlsICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgZmlubGVuID0gZmluYWRkKGZpbmxlbiwgc2NhbGUoc2NhbGUoNCwgY2MsIC1iZHh0YWlsLCBfOCksIF84LCBhZHl0YWlsLCBfMTYpLCBfMTYpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChiZHl0YWlsICE9PSAwKSB7XG4gICAgICAgICAgICBjb25zdCBsZW4gPSBzY2FsZShjYXRsZW4sIGNhdCwgYmR5dGFpbCwgXzE2Yyk7XG4gICAgICAgICAgICBmaW5sZW4gPSBmaW5hZGQoZmlubGVuLCBzdW0oXG4gICAgICAgICAgICAgICAgc2NhbGUoYnl0Y2FsZW4sIGJ5dGNhLCBiZHl0YWlsLCBfMTYpLCBfMTYsXG4gICAgICAgICAgICAgICAgc2NhbGUobGVuLCBfMTZjLCAyICogYmR5LCBfMzIpLCBfMzIsIF80OCksIF80OCk7XG5cbiAgICAgICAgICAgIGNvbnN0IGxlbjIgPSBzY2FsZShjYXR0bGVuLCBjYXR0LCBiZHl0YWlsLCBfOCk7XG4gICAgICAgICAgICBmaW5sZW4gPSBmaW5hZGQoZmlubGVuLCBzdW1fdGhyZWUoXG4gICAgICAgICAgICAgICAgc2NhbGUobGVuMiwgXzgsIDIgKiBiZHksIF8xNiksIF8xNixcbiAgICAgICAgICAgICAgICBzY2FsZShsZW4yLCBfOCwgYmR5dGFpbCwgXzE2YiksIF8xNmIsXG4gICAgICAgICAgICAgICAgc2NhbGUobGVuLCBfMTZjLCBiZHl0YWlsLCBfMzIpLCBfMzIsICBfMzJiLCBfNjQpLCBfNjQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChjZHh0YWlsICE9PSAwIHx8IGNkeXRhaWwgIT09IDApIHtcbiAgICAgICAgaWYgKGFkeHRhaWwgIT09IDAgfHwgYWR5dGFpbCAhPT0gMCB8fCBiZHh0YWlsICE9PSAwIHx8IGJkeXRhaWwgIT09IDApIHtcbiAgICAgICAgICAgIHMxID0gYWR4dGFpbCAqIGJkeTtcbiAgICAgICAgICAgIGMgPSBzcGxpdHRlciAqIGFkeHRhaWw7XG4gICAgICAgICAgICBhaGkgPSBjIC0gKGMgLSBhZHh0YWlsKTtcbiAgICAgICAgICAgIGFsbyA9IGFkeHRhaWwgLSBhaGk7XG4gICAgICAgICAgICBjID0gc3BsaXR0ZXIgKiBiZHk7XG4gICAgICAgICAgICBiaGkgPSBjIC0gKGMgLSBiZHkpO1xuICAgICAgICAgICAgYmxvID0gYmR5IC0gYmhpO1xuICAgICAgICAgICAgczAgPSBhbG8gKiBibG8gLSAoczEgLSBhaGkgKiBiaGkgLSBhbG8gKiBiaGkgLSBhaGkgKiBibG8pO1xuICAgICAgICAgICAgdDEgPSBhZHggKiBiZHl0YWlsO1xuICAgICAgICAgICAgYyA9IHNwbGl0dGVyICogYWR4O1xuICAgICAgICAgICAgYWhpID0gYyAtIChjIC0gYWR4KTtcbiAgICAgICAgICAgIGFsbyA9IGFkeCAtIGFoaTtcbiAgICAgICAgICAgIGMgPSBzcGxpdHRlciAqIGJkeXRhaWw7XG4gICAgICAgICAgICBiaGkgPSBjIC0gKGMgLSBiZHl0YWlsKTtcbiAgICAgICAgICAgIGJsbyA9IGJkeXRhaWwgLSBiaGk7XG4gICAgICAgICAgICB0MCA9IGFsbyAqIGJsbyAtICh0MSAtIGFoaSAqIGJoaSAtIGFsbyAqIGJoaSAtIGFoaSAqIGJsbyk7XG4gICAgICAgICAgICBfaSA9IHMwICsgdDA7XG4gICAgICAgICAgICBidmlydCA9IF9pIC0gczA7XG4gICAgICAgICAgICB1WzBdID0gczAgLSAoX2kgLSBidmlydCkgKyAodDAgLSBidmlydCk7XG4gICAgICAgICAgICBfaiA9IHMxICsgX2k7XG4gICAgICAgICAgICBidmlydCA9IF9qIC0gczE7XG4gICAgICAgICAgICBfMCA9IHMxIC0gKF9qIC0gYnZpcnQpICsgKF9pIC0gYnZpcnQpO1xuICAgICAgICAgICAgX2kgPSBfMCArIHQxO1xuICAgICAgICAgICAgYnZpcnQgPSBfaSAtIF8wO1xuICAgICAgICAgICAgdVsxXSA9IF8wIC0gKF9pIC0gYnZpcnQpICsgKHQxIC0gYnZpcnQpO1xuICAgICAgICAgICAgdTMgPSBfaiArIF9pO1xuICAgICAgICAgICAgYnZpcnQgPSB1MyAtIF9qO1xuICAgICAgICAgICAgdVsyXSA9IF9qIC0gKHUzIC0gYnZpcnQpICsgKF9pIC0gYnZpcnQpO1xuICAgICAgICAgICAgdVszXSA9IHUzO1xuICAgICAgICAgICAgbjEgPSAtYWR5O1xuICAgICAgICAgICAgbjAgPSAtYWR5dGFpbDtcbiAgICAgICAgICAgIHMxID0gYmR4dGFpbCAqIG4xO1xuICAgICAgICAgICAgYyA9IHNwbGl0dGVyICogYmR4dGFpbDtcbiAgICAgICAgICAgIGFoaSA9IGMgLSAoYyAtIGJkeHRhaWwpO1xuICAgICAgICAgICAgYWxvID0gYmR4dGFpbCAtIGFoaTtcbiAgICAgICAgICAgIGMgPSBzcGxpdHRlciAqIG4xO1xuICAgICAgICAgICAgYmhpID0gYyAtIChjIC0gbjEpO1xuICAgICAgICAgICAgYmxvID0gbjEgLSBiaGk7XG4gICAgICAgICAgICBzMCA9IGFsbyAqIGJsbyAtIChzMSAtIGFoaSAqIGJoaSAtIGFsbyAqIGJoaSAtIGFoaSAqIGJsbyk7XG4gICAgICAgICAgICB0MSA9IGJkeCAqIG4wO1xuICAgICAgICAgICAgYyA9IHNwbGl0dGVyICogYmR4O1xuICAgICAgICAgICAgYWhpID0gYyAtIChjIC0gYmR4KTtcbiAgICAgICAgICAgIGFsbyA9IGJkeCAtIGFoaTtcbiAgICAgICAgICAgIGMgPSBzcGxpdHRlciAqIG4wO1xuICAgICAgICAgICAgYmhpID0gYyAtIChjIC0gbjApO1xuICAgICAgICAgICAgYmxvID0gbjAgLSBiaGk7XG4gICAgICAgICAgICB0MCA9IGFsbyAqIGJsbyAtICh0MSAtIGFoaSAqIGJoaSAtIGFsbyAqIGJoaSAtIGFoaSAqIGJsbyk7XG4gICAgICAgICAgICBfaSA9IHMwICsgdDA7XG4gICAgICAgICAgICBidmlydCA9IF9pIC0gczA7XG4gICAgICAgICAgICB2WzBdID0gczAgLSAoX2kgLSBidmlydCkgKyAodDAgLSBidmlydCk7XG4gICAgICAgICAgICBfaiA9IHMxICsgX2k7XG4gICAgICAgICAgICBidmlydCA9IF9qIC0gczE7XG4gICAgICAgICAgICBfMCA9IHMxIC0gKF9qIC0gYnZpcnQpICsgKF9pIC0gYnZpcnQpO1xuICAgICAgICAgICAgX2kgPSBfMCArIHQxO1xuICAgICAgICAgICAgYnZpcnQgPSBfaSAtIF8wO1xuICAgICAgICAgICAgdlsxXSA9IF8wIC0gKF9pIC0gYnZpcnQpICsgKHQxIC0gYnZpcnQpO1xuICAgICAgICAgICAgdTMgPSBfaiArIF9pO1xuICAgICAgICAgICAgYnZpcnQgPSB1MyAtIF9qO1xuICAgICAgICAgICAgdlsyXSA9IF9qIC0gKHUzIC0gYnZpcnQpICsgKF9pIC0gYnZpcnQpO1xuICAgICAgICAgICAgdlszXSA9IHUzO1xuICAgICAgICAgICAgYWJ0bGVuID0gc3VtKDQsIHUsIDQsIHYsIGFidCk7XG4gICAgICAgICAgICBzMSA9IGFkeHRhaWwgKiBiZHl0YWlsO1xuICAgICAgICAgICAgYyA9IHNwbGl0dGVyICogYWR4dGFpbDtcbiAgICAgICAgICAgIGFoaSA9IGMgLSAoYyAtIGFkeHRhaWwpO1xuICAgICAgICAgICAgYWxvID0gYWR4dGFpbCAtIGFoaTtcbiAgICAgICAgICAgIGMgPSBzcGxpdHRlciAqIGJkeXRhaWw7XG4gICAgICAgICAgICBiaGkgPSBjIC0gKGMgLSBiZHl0YWlsKTtcbiAgICAgICAgICAgIGJsbyA9IGJkeXRhaWwgLSBiaGk7XG4gICAgICAgICAgICBzMCA9IGFsbyAqIGJsbyAtIChzMSAtIGFoaSAqIGJoaSAtIGFsbyAqIGJoaSAtIGFoaSAqIGJsbyk7XG4gICAgICAgICAgICB0MSA9IGJkeHRhaWwgKiBhZHl0YWlsO1xuICAgICAgICAgICAgYyA9IHNwbGl0dGVyICogYmR4dGFpbDtcbiAgICAgICAgICAgIGFoaSA9IGMgLSAoYyAtIGJkeHRhaWwpO1xuICAgICAgICAgICAgYWxvID0gYmR4dGFpbCAtIGFoaTtcbiAgICAgICAgICAgIGMgPSBzcGxpdHRlciAqIGFkeXRhaWw7XG4gICAgICAgICAgICBiaGkgPSBjIC0gKGMgLSBhZHl0YWlsKTtcbiAgICAgICAgICAgIGJsbyA9IGFkeXRhaWwgLSBiaGk7XG4gICAgICAgICAgICB0MCA9IGFsbyAqIGJsbyAtICh0MSAtIGFoaSAqIGJoaSAtIGFsbyAqIGJoaSAtIGFoaSAqIGJsbyk7XG4gICAgICAgICAgICBfaSA9IHMwIC0gdDA7XG4gICAgICAgICAgICBidmlydCA9IHMwIC0gX2k7XG4gICAgICAgICAgICBhYnR0WzBdID0gczAgLSAoX2kgKyBidmlydCkgKyAoYnZpcnQgLSB0MCk7XG4gICAgICAgICAgICBfaiA9IHMxICsgX2k7XG4gICAgICAgICAgICBidmlydCA9IF9qIC0gczE7XG4gICAgICAgICAgICBfMCA9IHMxIC0gKF9qIC0gYnZpcnQpICsgKF9pIC0gYnZpcnQpO1xuICAgICAgICAgICAgX2kgPSBfMCAtIHQxO1xuICAgICAgICAgICAgYnZpcnQgPSBfMCAtIF9pO1xuICAgICAgICAgICAgYWJ0dFsxXSA9IF8wIC0gKF9pICsgYnZpcnQpICsgKGJ2aXJ0IC0gdDEpO1xuICAgICAgICAgICAgdTMgPSBfaiArIF9pO1xuICAgICAgICAgICAgYnZpcnQgPSB1MyAtIF9qO1xuICAgICAgICAgICAgYWJ0dFsyXSA9IF9qIC0gKHUzIC0gYnZpcnQpICsgKF9pIC0gYnZpcnQpO1xuICAgICAgICAgICAgYWJ0dFszXSA9IHUzO1xuICAgICAgICAgICAgYWJ0dGxlbiA9IDQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhYnRbMF0gPSAwO1xuICAgICAgICAgICAgYWJ0bGVuID0gMTtcbiAgICAgICAgICAgIGFidHRbMF0gPSAwO1xuICAgICAgICAgICAgYWJ0dGxlbiA9IDE7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNkeHRhaWwgIT09IDApIHtcbiAgICAgICAgICAgIGNvbnN0IGxlbiA9IHNjYWxlKGFidGxlbiwgYWJ0LCBjZHh0YWlsLCBfMTZjKTtcbiAgICAgICAgICAgIGZpbmxlbiA9IGZpbmFkZChmaW5sZW4sIHN1bShcbiAgICAgICAgICAgICAgICBzY2FsZShjeHRhYmxlbiwgY3h0YWIsIGNkeHRhaWwsIF8xNiksIF8xNixcbiAgICAgICAgICAgICAgICBzY2FsZShsZW4sIF8xNmMsIDIgKiBjZHgsIF8zMiksIF8zMiwgXzQ4KSwgXzQ4KTtcblxuICAgICAgICAgICAgY29uc3QgbGVuMiA9IHNjYWxlKGFidHRsZW4sIGFidHQsIGNkeHRhaWwsIF84KTtcbiAgICAgICAgICAgIGZpbmxlbiA9IGZpbmFkZChmaW5sZW4sIHN1bV90aHJlZShcbiAgICAgICAgICAgICAgICBzY2FsZShsZW4yLCBfOCwgMiAqIGNkeCwgXzE2KSwgXzE2LFxuICAgICAgICAgICAgICAgIHNjYWxlKGxlbjIsIF84LCBjZHh0YWlsLCBfMTZiKSwgXzE2YixcbiAgICAgICAgICAgICAgICBzY2FsZShsZW4sIF8xNmMsIGNkeHRhaWwsIF8zMiksIF8zMiwgXzMyYiwgXzY0KSwgXzY0KTtcblxuICAgICAgICAgICAgaWYgKGFkeXRhaWwgIT09IDApIHtcbiAgICAgICAgICAgICAgICBmaW5sZW4gPSBmaW5hZGQoZmlubGVuLCBzY2FsZShzY2FsZSg0LCBiYiwgY2R4dGFpbCwgXzgpLCBfOCwgYWR5dGFpbCwgXzE2KSwgXzE2KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChiZHl0YWlsICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgZmlubGVuID0gZmluYWRkKGZpbmxlbiwgc2NhbGUoc2NhbGUoNCwgYWEsIC1jZHh0YWlsLCBfOCksIF84LCBiZHl0YWlsLCBfMTYpLCBfMTYpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChjZHl0YWlsICE9PSAwKSB7XG4gICAgICAgICAgICBjb25zdCBsZW4gPSBzY2FsZShhYnRsZW4sIGFidCwgY2R5dGFpbCwgXzE2Yyk7XG4gICAgICAgICAgICBmaW5sZW4gPSBmaW5hZGQoZmlubGVuLCBzdW0oXG4gICAgICAgICAgICAgICAgc2NhbGUoY3l0YWJsZW4sIGN5dGFiLCBjZHl0YWlsLCBfMTYpLCBfMTYsXG4gICAgICAgICAgICAgICAgc2NhbGUobGVuLCBfMTZjLCAyICogY2R5LCBfMzIpLCBfMzIsIF80OCksIF80OCk7XG5cbiAgICAgICAgICAgIGNvbnN0IGxlbjIgPSBzY2FsZShhYnR0bGVuLCBhYnR0LCBjZHl0YWlsLCBfOCk7XG4gICAgICAgICAgICBmaW5sZW4gPSBmaW5hZGQoZmlubGVuLCBzdW1fdGhyZWUoXG4gICAgICAgICAgICAgICAgc2NhbGUobGVuMiwgXzgsIDIgKiBjZHksIF8xNiksIF8xNixcbiAgICAgICAgICAgICAgICBzY2FsZShsZW4yLCBfOCwgY2R5dGFpbCwgXzE2YiksIF8xNmIsXG4gICAgICAgICAgICAgICAgc2NhbGUobGVuLCBfMTZjLCBjZHl0YWlsLCBfMzIpLCBfMzIsIF8zMmIsIF82NCksIF82NCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmluW2ZpbmxlbiAtIDFdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5jaXJjbGUoYXgsIGF5LCBieCwgYnksIGN4LCBjeSwgZHgsIGR5KSB7XG4gICAgY29uc3QgYWR4ID0gYXggLSBkeDtcbiAgICBjb25zdCBiZHggPSBieCAtIGR4O1xuICAgIGNvbnN0IGNkeCA9IGN4IC0gZHg7XG4gICAgY29uc3QgYWR5ID0gYXkgLSBkeTtcbiAgICBjb25zdCBiZHkgPSBieSAtIGR5O1xuICAgIGNvbnN0IGNkeSA9IGN5IC0gZHk7XG5cbiAgICBjb25zdCBiZHhjZHkgPSBiZHggKiBjZHk7XG4gICAgY29uc3QgY2R4YmR5ID0gY2R4ICogYmR5O1xuICAgIGNvbnN0IGFsaWZ0ID0gYWR4ICogYWR4ICsgYWR5ICogYWR5O1xuXG4gICAgY29uc3QgY2R4YWR5ID0gY2R4ICogYWR5O1xuICAgIGNvbnN0IGFkeGNkeSA9IGFkeCAqIGNkeTtcbiAgICBjb25zdCBibGlmdCA9IGJkeCAqIGJkeCArIGJkeSAqIGJkeTtcblxuICAgIGNvbnN0IGFkeGJkeSA9IGFkeCAqIGJkeTtcbiAgICBjb25zdCBiZHhhZHkgPSBiZHggKiBhZHk7XG4gICAgY29uc3QgY2xpZnQgPSBjZHggKiBjZHggKyBjZHkgKiBjZHk7XG5cbiAgICBjb25zdCBkZXQgPVxuICAgICAgICBhbGlmdCAqIChiZHhjZHkgLSBjZHhiZHkpICtcbiAgICAgICAgYmxpZnQgKiAoY2R4YWR5IC0gYWR4Y2R5KSArXG4gICAgICAgIGNsaWZ0ICogKGFkeGJkeSAtIGJkeGFkeSk7XG5cbiAgICBjb25zdCBwZXJtYW5lbnQgPVxuICAgICAgICAoTWF0aC5hYnMoYmR4Y2R5KSArIE1hdGguYWJzKGNkeGJkeSkpICogYWxpZnQgK1xuICAgICAgICAoTWF0aC5hYnMoY2R4YWR5KSArIE1hdGguYWJzKGFkeGNkeSkpICogYmxpZnQgK1xuICAgICAgICAoTWF0aC5hYnMoYWR4YmR5KSArIE1hdGguYWJzKGJkeGFkeSkpICogY2xpZnQ7XG5cbiAgICBjb25zdCBlcnJib3VuZCA9IGljY2VycmJvdW5kQSAqIHBlcm1hbmVudDtcblxuICAgIGlmIChkZXQgPiBlcnJib3VuZCB8fCAtZGV0ID4gZXJyYm91bmQpIHtcbiAgICAgICAgcmV0dXJuIGRldDtcbiAgICB9XG4gICAgcmV0dXJuIGluY2lyY2xlYWRhcHQoYXgsIGF5LCBieCwgYnksIGN4LCBjeSwgZHgsIGR5LCBwZXJtYW5lbnQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5jaXJjbGVmYXN0KGF4LCBheSwgYngsIGJ5LCBjeCwgY3ksIGR4LCBkeSkge1xuICAgIGNvbnN0IGFkeCA9IGF4IC0gZHg7XG4gICAgY29uc3QgYWR5ID0gYXkgLSBkeTtcbiAgICBjb25zdCBiZHggPSBieCAtIGR4O1xuICAgIGNvbnN0IGJkeSA9IGJ5IC0gZHk7XG4gICAgY29uc3QgY2R4ID0gY3ggLSBkeDtcbiAgICBjb25zdCBjZHkgPSBjeSAtIGR5O1xuXG4gICAgY29uc3QgYWJkZXQgPSBhZHggKiBiZHkgLSBiZHggKiBhZHk7XG4gICAgY29uc3QgYmNkZXQgPSBiZHggKiBjZHkgLSBjZHggKiBiZHk7XG4gICAgY29uc3QgY2FkZXQgPSBjZHggKiBhZHkgLSBhZHggKiBjZHk7XG4gICAgY29uc3QgYWxpZnQgPSBhZHggKiBhZHggKyBhZHkgKiBhZHk7XG4gICAgY29uc3QgYmxpZnQgPSBiZHggKiBiZHggKyBiZHkgKiBiZHk7XG4gICAgY29uc3QgY2xpZnQgPSBjZHggKiBjZHggKyBjZHkgKiBjZHk7XG5cbiAgICByZXR1cm4gYWxpZnQgKiBiY2RldCArIGJsaWZ0ICogY2FkZXQgKyBjbGlmdCAqIGFiZGV0O1xufVxuIiwiaW1wb3J0IHtlcHNpbG9uLCBzcGxpdHRlciwgcmVzdWx0ZXJyYm91bmQsIGVzdGltYXRlLCB2ZWMsIHN1bSwgc3VtX3RocmVlLCBzY2FsZSwgbmVnYXRlfSBmcm9tICcuL3V0aWwuanMnO1xuXG5jb25zdCBpc3BlcnJib3VuZEEgPSAoMTYgKyAyMjQgKiBlcHNpbG9uKSAqIGVwc2lsb247XG5jb25zdCBpc3BlcnJib3VuZEIgPSAoNSArIDcyICogZXBzaWxvbikgKiBlcHNpbG9uO1xuY29uc3QgaXNwZXJyYm91bmRDID0gKDcxICsgMTQwOCAqIGVwc2lsb24pICogZXBzaWxvbiAqIGVwc2lsb247XG5cbmNvbnN0IGFiID0gdmVjKDQpO1xuY29uc3QgYmMgPSB2ZWMoNCk7XG5jb25zdCBjZCA9IHZlYyg0KTtcbmNvbnN0IGRlID0gdmVjKDQpO1xuY29uc3QgZWEgPSB2ZWMoNCk7XG5jb25zdCBhYyA9IHZlYyg0KTtcbmNvbnN0IGJkID0gdmVjKDQpO1xuY29uc3QgY2UgPSB2ZWMoNCk7XG5jb25zdCBkYSA9IHZlYyg0KTtcbmNvbnN0IGViID0gdmVjKDQpO1xuXG5jb25zdCBhYmMgPSB2ZWMoMjQpO1xuY29uc3QgYmNkID0gdmVjKDI0KTtcbmNvbnN0IGNkZSA9IHZlYygyNCk7XG5jb25zdCBkZWEgPSB2ZWMoMjQpO1xuY29uc3QgZWFiID0gdmVjKDI0KTtcbmNvbnN0IGFiZCA9IHZlYygyNCk7XG5jb25zdCBiY2UgPSB2ZWMoMjQpO1xuY29uc3QgY2RhID0gdmVjKDI0KTtcbmNvbnN0IGRlYiA9IHZlYygyNCk7XG5jb25zdCBlYWMgPSB2ZWMoMjQpO1xuXG5jb25zdCBhZGV0ID0gdmVjKDExNTIpO1xuY29uc3QgYmRldCA9IHZlYygxMTUyKTtcbmNvbnN0IGNkZXQgPSB2ZWMoMTE1Mik7XG5jb25zdCBkZGV0ID0gdmVjKDExNTIpO1xuY29uc3QgZWRldCA9IHZlYygxMTUyKTtcbmNvbnN0IGFiZGV0ID0gdmVjKDIzMDQpO1xuY29uc3QgY2RkZXQgPSB2ZWMoMjMwNCk7XG5jb25zdCBjZGVkZXQgPSB2ZWMoMzQ1Nik7XG5jb25zdCBkZXRlciA9IHZlYyg1NzYwKTtcblxuY29uc3QgXzggPSB2ZWMoOCk7XG5jb25zdCBfOGIgPSB2ZWMoOCk7XG5jb25zdCBfOGMgPSB2ZWMoOCk7XG5jb25zdCBfMTYgPSB2ZWMoMTYpO1xuY29uc3QgXzI0ID0gdmVjKDI0KTtcbmNvbnN0IF80OCA9IHZlYyg0OCk7XG5jb25zdCBfNDhiID0gdmVjKDQ4KTtcbmNvbnN0IF85NiA9IHZlYyg5Nik7XG5jb25zdCBfMTkyID0gdmVjKDE5Mik7XG5jb25zdCBfMzg0eCA9IHZlYygzODQpO1xuY29uc3QgXzM4NHkgPSB2ZWMoMzg0KTtcbmNvbnN0IF8zODR6ID0gdmVjKDM4NCk7XG5jb25zdCBfNzY4ID0gdmVjKDc2OCk7XG5cbmZ1bmN0aW9uIHN1bV90aHJlZV9zY2FsZShhLCBiLCBjLCBheiwgYnosIGN6LCBvdXQpIHtcbiAgICByZXR1cm4gc3VtX3RocmVlKFxuICAgICAgICBzY2FsZSg0LCBhLCBheiwgXzgpLCBfOCxcbiAgICAgICAgc2NhbGUoNCwgYiwgYnosIF84YiksIF84YixcbiAgICAgICAgc2NhbGUoNCwgYywgY3osIF84YyksIF84YywgXzE2LCBvdXQpO1xufVxuXG5mdW5jdGlvbiBsaWZ0ZXhhY3QoYWxlbiwgYSwgYmxlbiwgYiwgY2xlbiwgYywgZGxlbiwgZCwgeCwgeSwgeiwgb3V0KSB7XG4gICAgY29uc3QgbGVuID0gc3VtKFxuICAgICAgICBzdW0oYWxlbiwgYSwgYmxlbiwgYiwgXzQ4KSwgXzQ4LFxuICAgICAgICBuZWdhdGUoc3VtKGNsZW4sIGMsIGRsZW4sIGQsIF80OGIpLCBfNDhiKSwgXzQ4YiwgXzk2KTtcblxuICAgIHJldHVybiBzdW1fdGhyZWUoXG4gICAgICAgIHNjYWxlKHNjYWxlKGxlbiwgXzk2LCB4LCBfMTkyKSwgXzE5MiwgeCwgXzM4NHgpLCBfMzg0eCxcbiAgICAgICAgc2NhbGUoc2NhbGUobGVuLCBfOTYsIHksIF8xOTIpLCBfMTkyLCB5LCBfMzg0eSksIF8zODR5LFxuICAgICAgICBzY2FsZShzY2FsZShsZW4sIF85NiwgeiwgXzE5MiksIF8xOTIsIHosIF8zODR6KSwgXzM4NHosIF83NjgsIG91dCk7XG59XG5cbmZ1bmN0aW9uIGluc3BoZXJlZXhhY3QoYXgsIGF5LCBheiwgYngsIGJ5LCBieiwgY3gsIGN5LCBjeiwgZHgsIGR5LCBkeiwgZXgsIGV5LCBleikge1xuICAgIGxldCBidmlydCwgYywgYWhpLCBhbG8sIGJoaSwgYmxvLCBfaSwgX2osIF8wLCBzMSwgczAsIHQxLCB0MCwgdTM7XG5cbiAgICBzMSA9IGF4ICogYnk7XG4gICAgYyA9IHNwbGl0dGVyICogYXg7XG4gICAgYWhpID0gYyAtIChjIC0gYXgpO1xuICAgIGFsbyA9IGF4IC0gYWhpO1xuICAgIGMgPSBzcGxpdHRlciAqIGJ5O1xuICAgIGJoaSA9IGMgLSAoYyAtIGJ5KTtcbiAgICBibG8gPSBieSAtIGJoaTtcbiAgICBzMCA9IGFsbyAqIGJsbyAtIChzMSAtIGFoaSAqIGJoaSAtIGFsbyAqIGJoaSAtIGFoaSAqIGJsbyk7XG4gICAgdDEgPSBieCAqIGF5O1xuICAgIGMgPSBzcGxpdHRlciAqIGJ4O1xuICAgIGFoaSA9IGMgLSAoYyAtIGJ4KTtcbiAgICBhbG8gPSBieCAtIGFoaTtcbiAgICBjID0gc3BsaXR0ZXIgKiBheTtcbiAgICBiaGkgPSBjIC0gKGMgLSBheSk7XG4gICAgYmxvID0gYXkgLSBiaGk7XG4gICAgdDAgPSBhbG8gKiBibG8gLSAodDEgLSBhaGkgKiBiaGkgLSBhbG8gKiBiaGkgLSBhaGkgKiBibG8pO1xuICAgIF9pID0gczAgLSB0MDtcbiAgICBidmlydCA9IHMwIC0gX2k7XG4gICAgYWJbMF0gPSBzMCAtIChfaSArIGJ2aXJ0KSArIChidmlydCAtIHQwKTtcbiAgICBfaiA9IHMxICsgX2k7XG4gICAgYnZpcnQgPSBfaiAtIHMxO1xuICAgIF8wID0gczEgLSAoX2ogLSBidmlydCkgKyAoX2kgLSBidmlydCk7XG4gICAgX2kgPSBfMCAtIHQxO1xuICAgIGJ2aXJ0ID0gXzAgLSBfaTtcbiAgICBhYlsxXSA9IF8wIC0gKF9pICsgYnZpcnQpICsgKGJ2aXJ0IC0gdDEpO1xuICAgIHUzID0gX2ogKyBfaTtcbiAgICBidmlydCA9IHUzIC0gX2o7XG4gICAgYWJbMl0gPSBfaiAtICh1MyAtIGJ2aXJ0KSArIChfaSAtIGJ2aXJ0KTtcbiAgICBhYlszXSA9IHUzO1xuICAgIHMxID0gYnggKiBjeTtcbiAgICBjID0gc3BsaXR0ZXIgKiBieDtcbiAgICBhaGkgPSBjIC0gKGMgLSBieCk7XG4gICAgYWxvID0gYnggLSBhaGk7XG4gICAgYyA9IHNwbGl0dGVyICogY3k7XG4gICAgYmhpID0gYyAtIChjIC0gY3kpO1xuICAgIGJsbyA9IGN5IC0gYmhpO1xuICAgIHMwID0gYWxvICogYmxvIC0gKHMxIC0gYWhpICogYmhpIC0gYWxvICogYmhpIC0gYWhpICogYmxvKTtcbiAgICB0MSA9IGN4ICogYnk7XG4gICAgYyA9IHNwbGl0dGVyICogY3g7XG4gICAgYWhpID0gYyAtIChjIC0gY3gpO1xuICAgIGFsbyA9IGN4IC0gYWhpO1xuICAgIGMgPSBzcGxpdHRlciAqIGJ5O1xuICAgIGJoaSA9IGMgLSAoYyAtIGJ5KTtcbiAgICBibG8gPSBieSAtIGJoaTtcbiAgICB0MCA9IGFsbyAqIGJsbyAtICh0MSAtIGFoaSAqIGJoaSAtIGFsbyAqIGJoaSAtIGFoaSAqIGJsbyk7XG4gICAgX2kgPSBzMCAtIHQwO1xuICAgIGJ2aXJ0ID0gczAgLSBfaTtcbiAgICBiY1swXSA9IHMwIC0gKF9pICsgYnZpcnQpICsgKGJ2aXJ0IC0gdDApO1xuICAgIF9qID0gczEgKyBfaTtcbiAgICBidmlydCA9IF9qIC0gczE7XG4gICAgXzAgPSBzMSAtIChfaiAtIGJ2aXJ0KSArIChfaSAtIGJ2aXJ0KTtcbiAgICBfaSA9IF8wIC0gdDE7XG4gICAgYnZpcnQgPSBfMCAtIF9pO1xuICAgIGJjWzFdID0gXzAgLSAoX2kgKyBidmlydCkgKyAoYnZpcnQgLSB0MSk7XG4gICAgdTMgPSBfaiArIF9pO1xuICAgIGJ2aXJ0ID0gdTMgLSBfajtcbiAgICBiY1syXSA9IF9qIC0gKHUzIC0gYnZpcnQpICsgKF9pIC0gYnZpcnQpO1xuICAgIGJjWzNdID0gdTM7XG4gICAgczEgPSBjeCAqIGR5O1xuICAgIGMgPSBzcGxpdHRlciAqIGN4O1xuICAgIGFoaSA9IGMgLSAoYyAtIGN4KTtcbiAgICBhbG8gPSBjeCAtIGFoaTtcbiAgICBjID0gc3BsaXR0ZXIgKiBkeTtcbiAgICBiaGkgPSBjIC0gKGMgLSBkeSk7XG4gICAgYmxvID0gZHkgLSBiaGk7XG4gICAgczAgPSBhbG8gKiBibG8gLSAoczEgLSBhaGkgKiBiaGkgLSBhbG8gKiBiaGkgLSBhaGkgKiBibG8pO1xuICAgIHQxID0gZHggKiBjeTtcbiAgICBjID0gc3BsaXR0ZXIgKiBkeDtcbiAgICBhaGkgPSBjIC0gKGMgLSBkeCk7XG4gICAgYWxvID0gZHggLSBhaGk7XG4gICAgYyA9IHNwbGl0dGVyICogY3k7XG4gICAgYmhpID0gYyAtIChjIC0gY3kpO1xuICAgIGJsbyA9IGN5IC0gYmhpO1xuICAgIHQwID0gYWxvICogYmxvIC0gKHQxIC0gYWhpICogYmhpIC0gYWxvICogYmhpIC0gYWhpICogYmxvKTtcbiAgICBfaSA9IHMwIC0gdDA7XG4gICAgYnZpcnQgPSBzMCAtIF9pO1xuICAgIGNkWzBdID0gczAgLSAoX2kgKyBidmlydCkgKyAoYnZpcnQgLSB0MCk7XG4gICAgX2ogPSBzMSArIF9pO1xuICAgIGJ2aXJ0ID0gX2ogLSBzMTtcbiAgICBfMCA9IHMxIC0gKF9qIC0gYnZpcnQpICsgKF9pIC0gYnZpcnQpO1xuICAgIF9pID0gXzAgLSB0MTtcbiAgICBidmlydCA9IF8wIC0gX2k7XG4gICAgY2RbMV0gPSBfMCAtIChfaSArIGJ2aXJ0KSArIChidmlydCAtIHQxKTtcbiAgICB1MyA9IF9qICsgX2k7XG4gICAgYnZpcnQgPSB1MyAtIF9qO1xuICAgIGNkWzJdID0gX2ogLSAodTMgLSBidmlydCkgKyAoX2kgLSBidmlydCk7XG4gICAgY2RbM10gPSB1MztcbiAgICBzMSA9IGR4ICogZXk7XG4gICAgYyA9IHNwbGl0dGVyICogZHg7XG4gICAgYWhpID0gYyAtIChjIC0gZHgpO1xuICAgIGFsbyA9IGR4IC0gYWhpO1xuICAgIGMgPSBzcGxpdHRlciAqIGV5O1xuICAgIGJoaSA9IGMgLSAoYyAtIGV5KTtcbiAgICBibG8gPSBleSAtIGJoaTtcbiAgICBzMCA9IGFsbyAqIGJsbyAtIChzMSAtIGFoaSAqIGJoaSAtIGFsbyAqIGJoaSAtIGFoaSAqIGJsbyk7XG4gICAgdDEgPSBleCAqIGR5O1xuICAgIGMgPSBzcGxpdHRlciAqIGV4O1xuICAgIGFoaSA9IGMgLSAoYyAtIGV4KTtcbiAgICBhbG8gPSBleCAtIGFoaTtcbiAgICBjID0gc3BsaXR0ZXIgKiBkeTtcbiAgICBiaGkgPSBjIC0gKGMgLSBkeSk7XG4gICAgYmxvID0gZHkgLSBiaGk7XG4gICAgdDAgPSBhbG8gKiBibG8gLSAodDEgLSBhaGkgKiBiaGkgLSBhbG8gKiBiaGkgLSBhaGkgKiBibG8pO1xuICAgIF9pID0gczAgLSB0MDtcbiAgICBidmlydCA9IHMwIC0gX2k7XG4gICAgZGVbMF0gPSBzMCAtIChfaSArIGJ2aXJ0KSArIChidmlydCAtIHQwKTtcbiAgICBfaiA9IHMxICsgX2k7XG4gICAgYnZpcnQgPSBfaiAtIHMxO1xuICAgIF8wID0gczEgLSAoX2ogLSBidmlydCkgKyAoX2kgLSBidmlydCk7XG4gICAgX2kgPSBfMCAtIHQxO1xuICAgIGJ2aXJ0ID0gXzAgLSBfaTtcbiAgICBkZVsxXSA9IF8wIC0gKF9pICsgYnZpcnQpICsgKGJ2aXJ0IC0gdDEpO1xuICAgIHUzID0gX2ogKyBfaTtcbiAgICBidmlydCA9IHUzIC0gX2o7XG4gICAgZGVbMl0gPSBfaiAtICh1MyAtIGJ2aXJ0KSArIChfaSAtIGJ2aXJ0KTtcbiAgICBkZVszXSA9IHUzO1xuICAgIHMxID0gZXggKiBheTtcbiAgICBjID0gc3BsaXR0ZXIgKiBleDtcbiAgICBhaGkgPSBjIC0gKGMgLSBleCk7XG4gICAgYWxvID0gZXggLSBhaGk7XG4gICAgYyA9IHNwbGl0dGVyICogYXk7XG4gICAgYmhpID0gYyAtIChjIC0gYXkpO1xuICAgIGJsbyA9IGF5IC0gYmhpO1xuICAgIHMwID0gYWxvICogYmxvIC0gKHMxIC0gYWhpICogYmhpIC0gYWxvICogYmhpIC0gYWhpICogYmxvKTtcbiAgICB0MSA9IGF4ICogZXk7XG4gICAgYyA9IHNwbGl0dGVyICogYXg7XG4gICAgYWhpID0gYyAtIChjIC0gYXgpO1xuICAgIGFsbyA9IGF4IC0gYWhpO1xuICAgIGMgPSBzcGxpdHRlciAqIGV5O1xuICAgIGJoaSA9IGMgLSAoYyAtIGV5KTtcbiAgICBibG8gPSBleSAtIGJoaTtcbiAgICB0MCA9IGFsbyAqIGJsbyAtICh0MSAtIGFoaSAqIGJoaSAtIGFsbyAqIGJoaSAtIGFoaSAqIGJsbyk7XG4gICAgX2kgPSBzMCAtIHQwO1xuICAgIGJ2aXJ0ID0gczAgLSBfaTtcbiAgICBlYVswXSA9IHMwIC0gKF9pICsgYnZpcnQpICsgKGJ2aXJ0IC0gdDApO1xuICAgIF9qID0gczEgKyBfaTtcbiAgICBidmlydCA9IF9qIC0gczE7XG4gICAgXzAgPSBzMSAtIChfaiAtIGJ2aXJ0KSArIChfaSAtIGJ2aXJ0KTtcbiAgICBfaSA9IF8wIC0gdDE7XG4gICAgYnZpcnQgPSBfMCAtIF9pO1xuICAgIGVhWzFdID0gXzAgLSAoX2kgKyBidmlydCkgKyAoYnZpcnQgLSB0MSk7XG4gICAgdTMgPSBfaiArIF9pO1xuICAgIGJ2aXJ0ID0gdTMgLSBfajtcbiAgICBlYVsyXSA9IF9qIC0gKHUzIC0gYnZpcnQpICsgKF9pIC0gYnZpcnQpO1xuICAgIGVhWzNdID0gdTM7XG4gICAgczEgPSBheCAqIGN5O1xuICAgIGMgPSBzcGxpdHRlciAqIGF4O1xuICAgIGFoaSA9IGMgLSAoYyAtIGF4KTtcbiAgICBhbG8gPSBheCAtIGFoaTtcbiAgICBjID0gc3BsaXR0ZXIgKiBjeTtcbiAgICBiaGkgPSBjIC0gKGMgLSBjeSk7XG4gICAgYmxvID0gY3kgLSBiaGk7XG4gICAgczAgPSBhbG8gKiBibG8gLSAoczEgLSBhaGkgKiBiaGkgLSBhbG8gKiBiaGkgLSBhaGkgKiBibG8pO1xuICAgIHQxID0gY3ggKiBheTtcbiAgICBjID0gc3BsaXR0ZXIgKiBjeDtcbiAgICBhaGkgPSBjIC0gKGMgLSBjeCk7XG4gICAgYWxvID0gY3ggLSBhaGk7XG4gICAgYyA9IHNwbGl0dGVyICogYXk7XG4gICAgYmhpID0gYyAtIChjIC0gYXkpO1xuICAgIGJsbyA9IGF5IC0gYmhpO1xuICAgIHQwID0gYWxvICogYmxvIC0gKHQxIC0gYWhpICogYmhpIC0gYWxvICogYmhpIC0gYWhpICogYmxvKTtcbiAgICBfaSA9IHMwIC0gdDA7XG4gICAgYnZpcnQgPSBzMCAtIF9pO1xuICAgIGFjWzBdID0gczAgLSAoX2kgKyBidmlydCkgKyAoYnZpcnQgLSB0MCk7XG4gICAgX2ogPSBzMSArIF9pO1xuICAgIGJ2aXJ0ID0gX2ogLSBzMTtcbiAgICBfMCA9IHMxIC0gKF9qIC0gYnZpcnQpICsgKF9pIC0gYnZpcnQpO1xuICAgIF9pID0gXzAgLSB0MTtcbiAgICBidmlydCA9IF8wIC0gX2k7XG4gICAgYWNbMV0gPSBfMCAtIChfaSArIGJ2aXJ0KSArIChidmlydCAtIHQxKTtcbiAgICB1MyA9IF9qICsgX2k7XG4gICAgYnZpcnQgPSB1MyAtIF9qO1xuICAgIGFjWzJdID0gX2ogLSAodTMgLSBidmlydCkgKyAoX2kgLSBidmlydCk7XG4gICAgYWNbM10gPSB1MztcbiAgICBzMSA9IGJ4ICogZHk7XG4gICAgYyA9IHNwbGl0dGVyICogYng7XG4gICAgYWhpID0gYyAtIChjIC0gYngpO1xuICAgIGFsbyA9IGJ4IC0gYWhpO1xuICAgIGMgPSBzcGxpdHRlciAqIGR5O1xuICAgIGJoaSA9IGMgLSAoYyAtIGR5KTtcbiAgICBibG8gPSBkeSAtIGJoaTtcbiAgICBzMCA9IGFsbyAqIGJsbyAtIChzMSAtIGFoaSAqIGJoaSAtIGFsbyAqIGJoaSAtIGFoaSAqIGJsbyk7XG4gICAgdDEgPSBkeCAqIGJ5O1xuICAgIGMgPSBzcGxpdHRlciAqIGR4O1xuICAgIGFoaSA9IGMgLSAoYyAtIGR4KTtcbiAgICBhbG8gPSBkeCAtIGFoaTtcbiAgICBjID0gc3BsaXR0ZXIgKiBieTtcbiAgICBiaGkgPSBjIC0gKGMgLSBieSk7XG4gICAgYmxvID0gYnkgLSBiaGk7XG4gICAgdDAgPSBhbG8gKiBibG8gLSAodDEgLSBhaGkgKiBiaGkgLSBhbG8gKiBiaGkgLSBhaGkgKiBibG8pO1xuICAgIF9pID0gczAgLSB0MDtcbiAgICBidmlydCA9IHMwIC0gX2k7XG4gICAgYmRbMF0gPSBzMCAtIChfaSArIGJ2aXJ0KSArIChidmlydCAtIHQwKTtcbiAgICBfaiA9IHMxICsgX2k7XG4gICAgYnZpcnQgPSBfaiAtIHMxO1xuICAgIF8wID0gczEgLSAoX2ogLSBidmlydCkgKyAoX2kgLSBidmlydCk7XG4gICAgX2kgPSBfMCAtIHQxO1xuICAgIGJ2aXJ0ID0gXzAgLSBfaTtcbiAgICBiZFsxXSA9IF8wIC0gKF9pICsgYnZpcnQpICsgKGJ2aXJ0IC0gdDEpO1xuICAgIHUzID0gX2ogKyBfaTtcbiAgICBidmlydCA9IHUzIC0gX2o7XG4gICAgYmRbMl0gPSBfaiAtICh1MyAtIGJ2aXJ0KSArIChfaSAtIGJ2aXJ0KTtcbiAgICBiZFszXSA9IHUzO1xuICAgIHMxID0gY3ggKiBleTtcbiAgICBjID0gc3BsaXR0ZXIgKiBjeDtcbiAgICBhaGkgPSBjIC0gKGMgLSBjeCk7XG4gICAgYWxvID0gY3ggLSBhaGk7XG4gICAgYyA9IHNwbGl0dGVyICogZXk7XG4gICAgYmhpID0gYyAtIChjIC0gZXkpO1xuICAgIGJsbyA9IGV5IC0gYmhpO1xuICAgIHMwID0gYWxvICogYmxvIC0gKHMxIC0gYWhpICogYmhpIC0gYWxvICogYmhpIC0gYWhpICogYmxvKTtcbiAgICB0MSA9IGV4ICogY3k7XG4gICAgYyA9IHNwbGl0dGVyICogZXg7XG4gICAgYWhpID0gYyAtIChjIC0gZXgpO1xuICAgIGFsbyA9IGV4IC0gYWhpO1xuICAgIGMgPSBzcGxpdHRlciAqIGN5O1xuICAgIGJoaSA9IGMgLSAoYyAtIGN5KTtcbiAgICBibG8gPSBjeSAtIGJoaTtcbiAgICB0MCA9IGFsbyAqIGJsbyAtICh0MSAtIGFoaSAqIGJoaSAtIGFsbyAqIGJoaSAtIGFoaSAqIGJsbyk7XG4gICAgX2kgPSBzMCAtIHQwO1xuICAgIGJ2aXJ0ID0gczAgLSBfaTtcbiAgICBjZVswXSA9IHMwIC0gKF9pICsgYnZpcnQpICsgKGJ2aXJ0IC0gdDApO1xuICAgIF9qID0gczEgKyBfaTtcbiAgICBidmlydCA9IF9qIC0gczE7XG4gICAgXzAgPSBzMSAtIChfaiAtIGJ2aXJ0KSArIChfaSAtIGJ2aXJ0KTtcbiAgICBfaSA9IF8wIC0gdDE7XG4gICAgYnZpcnQgPSBfMCAtIF9pO1xuICAgIGNlWzFdID0gXzAgLSAoX2kgKyBidmlydCkgKyAoYnZpcnQgLSB0MSk7XG4gICAgdTMgPSBfaiArIF9pO1xuICAgIGJ2aXJ0ID0gdTMgLSBfajtcbiAgICBjZVsyXSA9IF9qIC0gKHUzIC0gYnZpcnQpICsgKF9pIC0gYnZpcnQpO1xuICAgIGNlWzNdID0gdTM7XG4gICAgczEgPSBkeCAqIGF5O1xuICAgIGMgPSBzcGxpdHRlciAqIGR4O1xuICAgIGFoaSA9IGMgLSAoYyAtIGR4KTtcbiAgICBhbG8gPSBkeCAtIGFoaTtcbiAgICBjID0gc3BsaXR0ZXIgKiBheTtcbiAgICBiaGkgPSBjIC0gKGMgLSBheSk7XG4gICAgYmxvID0gYXkgLSBiaGk7XG4gICAgczAgPSBhbG8gKiBibG8gLSAoczEgLSBhaGkgKiBiaGkgLSBhbG8gKiBiaGkgLSBhaGkgKiBibG8pO1xuICAgIHQxID0gYXggKiBkeTtcbiAgICBjID0gc3BsaXR0ZXIgKiBheDtcbiAgICBhaGkgPSBjIC0gKGMgLSBheCk7XG4gICAgYWxvID0gYXggLSBhaGk7XG4gICAgYyA9IHNwbGl0dGVyICogZHk7XG4gICAgYmhpID0gYyAtIChjIC0gZHkpO1xuICAgIGJsbyA9IGR5IC0gYmhpO1xuICAgIHQwID0gYWxvICogYmxvIC0gKHQxIC0gYWhpICogYmhpIC0gYWxvICogYmhpIC0gYWhpICogYmxvKTtcbiAgICBfaSA9IHMwIC0gdDA7XG4gICAgYnZpcnQgPSBzMCAtIF9pO1xuICAgIGRhWzBdID0gczAgLSAoX2kgKyBidmlydCkgKyAoYnZpcnQgLSB0MCk7XG4gICAgX2ogPSBzMSArIF9pO1xuICAgIGJ2aXJ0ID0gX2ogLSBzMTtcbiAgICBfMCA9IHMxIC0gKF9qIC0gYnZpcnQpICsgKF9pIC0gYnZpcnQpO1xuICAgIF9pID0gXzAgLSB0MTtcbiAgICBidmlydCA9IF8wIC0gX2k7XG4gICAgZGFbMV0gPSBfMCAtIChfaSArIGJ2aXJ0KSArIChidmlydCAtIHQxKTtcbiAgICB1MyA9IF9qICsgX2k7XG4gICAgYnZpcnQgPSB1MyAtIF9qO1xuICAgIGRhWzJdID0gX2ogLSAodTMgLSBidmlydCkgKyAoX2kgLSBidmlydCk7XG4gICAgZGFbM10gPSB1MztcbiAgICBzMSA9IGV4ICogYnk7XG4gICAgYyA9IHNwbGl0dGVyICogZXg7XG4gICAgYWhpID0gYyAtIChjIC0gZXgpO1xuICAgIGFsbyA9IGV4IC0gYWhpO1xuICAgIGMgPSBzcGxpdHRlciAqIGJ5O1xuICAgIGJoaSA9IGMgLSAoYyAtIGJ5KTtcbiAgICBibG8gPSBieSAtIGJoaTtcbiAgICBzMCA9IGFsbyAqIGJsbyAtIChzMSAtIGFoaSAqIGJoaSAtIGFsbyAqIGJoaSAtIGFoaSAqIGJsbyk7XG4gICAgdDEgPSBieCAqIGV5O1xuICAgIGMgPSBzcGxpdHRlciAqIGJ4O1xuICAgIGFoaSA9IGMgLSAoYyAtIGJ4KTtcbiAgICBhbG8gPSBieCAtIGFoaTtcbiAgICBjID0gc3BsaXR0ZXIgKiBleTtcbiAgICBiaGkgPSBjIC0gKGMgLSBleSk7XG4gICAgYmxvID0gZXkgLSBiaGk7XG4gICAgdDAgPSBhbG8gKiBibG8gLSAodDEgLSBhaGkgKiBiaGkgLSBhbG8gKiBiaGkgLSBhaGkgKiBibG8pO1xuICAgIF9pID0gczAgLSB0MDtcbiAgICBidmlydCA9IHMwIC0gX2k7XG4gICAgZWJbMF0gPSBzMCAtIChfaSArIGJ2aXJ0KSArIChidmlydCAtIHQwKTtcbiAgICBfaiA9IHMxICsgX2k7XG4gICAgYnZpcnQgPSBfaiAtIHMxO1xuICAgIF8wID0gczEgLSAoX2ogLSBidmlydCkgKyAoX2kgLSBidmlydCk7XG4gICAgX2kgPSBfMCAtIHQxO1xuICAgIGJ2aXJ0ID0gXzAgLSBfaTtcbiAgICBlYlsxXSA9IF8wIC0gKF9pICsgYnZpcnQpICsgKGJ2aXJ0IC0gdDEpO1xuICAgIHUzID0gX2ogKyBfaTtcbiAgICBidmlydCA9IHUzIC0gX2o7XG4gICAgZWJbMl0gPSBfaiAtICh1MyAtIGJ2aXJ0KSArIChfaSAtIGJ2aXJ0KTtcbiAgICBlYlszXSA9IHUzO1xuXG4gICAgY29uc3QgYWJjbGVuID0gc3VtX3RocmVlX3NjYWxlKGFiLCBiYywgYWMsIGN6LCBheiwgLWJ6LCBhYmMpO1xuICAgIGNvbnN0IGJjZGxlbiA9IHN1bV90aHJlZV9zY2FsZShiYywgY2QsIGJkLCBkeiwgYnosIC1jeiwgYmNkKTtcbiAgICBjb25zdCBjZGVsZW4gPSBzdW1fdGhyZWVfc2NhbGUoY2QsIGRlLCBjZSwgZXosIGN6LCAtZHosIGNkZSk7XG4gICAgY29uc3QgZGVhbGVuID0gc3VtX3RocmVlX3NjYWxlKGRlLCBlYSwgZGEsIGF6LCBkeiwgLWV6LCBkZWEpO1xuICAgIGNvbnN0IGVhYmxlbiA9IHN1bV90aHJlZV9zY2FsZShlYSwgYWIsIGViLCBieiwgZXosIC1heiwgZWFiKTtcbiAgICBjb25zdCBhYmRsZW4gPSBzdW1fdGhyZWVfc2NhbGUoYWIsIGJkLCBkYSwgZHosIGF6LCBieiwgYWJkKTtcbiAgICBjb25zdCBiY2VsZW4gPSBzdW1fdGhyZWVfc2NhbGUoYmMsIGNlLCBlYiwgZXosIGJ6LCBjeiwgYmNlKTtcbiAgICBjb25zdCBjZGFsZW4gPSBzdW1fdGhyZWVfc2NhbGUoY2QsIGRhLCBhYywgYXosIGN6LCBkeiwgY2RhKTtcbiAgICBjb25zdCBkZWJsZW4gPSBzdW1fdGhyZWVfc2NhbGUoZGUsIGViLCBiZCwgYnosIGR6LCBleiwgZGViKTtcbiAgICBjb25zdCBlYWNsZW4gPSBzdW1fdGhyZWVfc2NhbGUoZWEsIGFjLCBjZSwgY3osIGV6LCBheiwgZWFjKTtcblxuICAgIGNvbnN0IGRldGVybGVuID0gc3VtX3RocmVlKFxuICAgICAgICBsaWZ0ZXhhY3QoY2RlbGVuLCBjZGUsIGJjZWxlbiwgYmNlLCBkZWJsZW4sIGRlYiwgYmNkbGVuLCBiY2QsIGF4LCBheSwgYXosIGFkZXQpLCBhZGV0LFxuICAgICAgICBsaWZ0ZXhhY3QoZGVhbGVuLCBkZWEsIGNkYWxlbiwgY2RhLCBlYWNsZW4sIGVhYywgY2RlbGVuLCBjZGUsIGJ4LCBieSwgYnosIGJkZXQpLCBiZGV0LFxuICAgICAgICBzdW1fdGhyZWUoXG4gICAgICAgICAgICBsaWZ0ZXhhY3QoZWFibGVuLCBlYWIsIGRlYmxlbiwgZGViLCBhYmRsZW4sIGFiZCwgZGVhbGVuLCBkZWEsIGN4LCBjeSwgY3osIGNkZXQpLCBjZGV0LFxuICAgICAgICAgICAgbGlmdGV4YWN0KGFiY2xlbiwgYWJjLCBlYWNsZW4sIGVhYywgYmNlbGVuLCBiY2UsIGVhYmxlbiwgZWFiLCBkeCwgZHksIGR6LCBkZGV0KSwgZGRldCxcbiAgICAgICAgICAgIGxpZnRleGFjdChiY2RsZW4sIGJjZCwgYWJkbGVuLCBhYmQsIGNkYWxlbiwgY2RhLCBhYmNsZW4sIGFiYywgZXgsIGV5LCBleiwgZWRldCksIGVkZXQsIGNkZGV0LCBjZGVkZXQpLCBjZGVkZXQsIGFiZGV0LCBkZXRlcik7XG5cbiAgICByZXR1cm4gZGV0ZXJbZGV0ZXJsZW4gLSAxXTtcbn1cblxuY29uc3QgeGRldCA9IHZlYyg5Nik7XG5jb25zdCB5ZGV0ID0gdmVjKDk2KTtcbmNvbnN0IHpkZXQgPSB2ZWMoOTYpO1xuY29uc3QgZmluID0gdmVjKDExNTIpO1xuXG5mdW5jdGlvbiBsaWZ0YWRhcHQoYSwgYiwgYywgYXosIGJ6LCBjeiwgeCwgeSwgeiwgb3V0KSB7XG4gICAgY29uc3QgbGVuID0gc3VtX3RocmVlX3NjYWxlKGEsIGIsIGMsIGF6LCBieiwgY3osIF8yNCk7XG4gICAgcmV0dXJuIHN1bV90aHJlZShcbiAgICAgICAgc2NhbGUoc2NhbGUobGVuLCBfMjQsIHgsIF80OCksIF80OCwgeCwgeGRldCksIHhkZXQsXG4gICAgICAgIHNjYWxlKHNjYWxlKGxlbiwgXzI0LCB5LCBfNDgpLCBfNDgsIHksIHlkZXQpLCB5ZGV0LFxuICAgICAgICBzY2FsZShzY2FsZShsZW4sIF8yNCwgeiwgXzQ4KSwgXzQ4LCB6LCB6ZGV0KSwgemRldCwgXzE5Miwgb3V0KTtcbn1cblxuZnVuY3Rpb24gaW5zcGhlcmVhZGFwdChheCwgYXksIGF6LCBieCwgYnksIGJ6LCBjeCwgY3ksIGN6LCBkeCwgZHksIGR6LCBleCwgZXksIGV6LCBwZXJtYW5lbnQpIHtcbiAgICBsZXQgYWIzLCBiYzMsIGNkMywgZGEzLCBhYzMsIGJkMztcblxuICAgIGxldCBhZXh0YWlsLCBiZXh0YWlsLCBjZXh0YWlsLCBkZXh0YWlsO1xuICAgIGxldCBhZXl0YWlsLCBiZXl0YWlsLCBjZXl0YWlsLCBkZXl0YWlsO1xuICAgIGxldCBhZXp0YWlsLCBiZXp0YWlsLCBjZXp0YWlsLCBkZXp0YWlsO1xuXG4gICAgbGV0IGJ2aXJ0LCBjLCBhaGksIGFsbywgYmhpLCBibG8sIF9pLCBfaiwgXzAsIHMxLCBzMCwgdDEsIHQwO1xuXG4gICAgY29uc3QgYWV4ID0gYXggLSBleDtcbiAgICBjb25zdCBiZXggPSBieCAtIGV4O1xuICAgIGNvbnN0IGNleCA9IGN4IC0gZXg7XG4gICAgY29uc3QgZGV4ID0gZHggLSBleDtcbiAgICBjb25zdCBhZXkgPSBheSAtIGV5O1xuICAgIGNvbnN0IGJleSA9IGJ5IC0gZXk7XG4gICAgY29uc3QgY2V5ID0gY3kgLSBleTtcbiAgICBjb25zdCBkZXkgPSBkeSAtIGV5O1xuICAgIGNvbnN0IGFleiA9IGF6IC0gZXo7XG4gICAgY29uc3QgYmV6ID0gYnogLSBlejtcbiAgICBjb25zdCBjZXogPSBjeiAtIGV6O1xuICAgIGNvbnN0IGRleiA9IGR6IC0gZXo7XG5cbiAgICBzMSA9IGFleCAqIGJleTtcbiAgICBjID0gc3BsaXR0ZXIgKiBhZXg7XG4gICAgYWhpID0gYyAtIChjIC0gYWV4KTtcbiAgICBhbG8gPSBhZXggLSBhaGk7XG4gICAgYyA9IHNwbGl0dGVyICogYmV5O1xuICAgIGJoaSA9IGMgLSAoYyAtIGJleSk7XG4gICAgYmxvID0gYmV5IC0gYmhpO1xuICAgIHMwID0gYWxvICogYmxvIC0gKHMxIC0gYWhpICogYmhpIC0gYWxvICogYmhpIC0gYWhpICogYmxvKTtcbiAgICB0MSA9IGJleCAqIGFleTtcbiAgICBjID0gc3BsaXR0ZXIgKiBiZXg7XG4gICAgYWhpID0gYyAtIChjIC0gYmV4KTtcbiAgICBhbG8gPSBiZXggLSBhaGk7XG4gICAgYyA9IHNwbGl0dGVyICogYWV5O1xuICAgIGJoaSA9IGMgLSAoYyAtIGFleSk7XG4gICAgYmxvID0gYWV5IC0gYmhpO1xuICAgIHQwID0gYWxvICogYmxvIC0gKHQxIC0gYWhpICogYmhpIC0gYWxvICogYmhpIC0gYWhpICogYmxvKTtcbiAgICBfaSA9IHMwIC0gdDA7XG4gICAgYnZpcnQgPSBzMCAtIF9pO1xuICAgIGFiWzBdID0gczAgLSAoX2kgKyBidmlydCkgKyAoYnZpcnQgLSB0MCk7XG4gICAgX2ogPSBzMSArIF9pO1xuICAgIGJ2aXJ0ID0gX2ogLSBzMTtcbiAgICBfMCA9IHMxIC0gKF9qIC0gYnZpcnQpICsgKF9pIC0gYnZpcnQpO1xuICAgIF9pID0gXzAgLSB0MTtcbiAgICBidmlydCA9IF8wIC0gX2k7XG4gICAgYWJbMV0gPSBfMCAtIChfaSArIGJ2aXJ0KSArIChidmlydCAtIHQxKTtcbiAgICBhYjMgPSBfaiArIF9pO1xuICAgIGJ2aXJ0ID0gYWIzIC0gX2o7XG4gICAgYWJbMl0gPSBfaiAtIChhYjMgLSBidmlydCkgKyAoX2kgLSBidmlydCk7XG4gICAgYWJbM10gPSBhYjM7XG4gICAgczEgPSBiZXggKiBjZXk7XG4gICAgYyA9IHNwbGl0dGVyICogYmV4O1xuICAgIGFoaSA9IGMgLSAoYyAtIGJleCk7XG4gICAgYWxvID0gYmV4IC0gYWhpO1xuICAgIGMgPSBzcGxpdHRlciAqIGNleTtcbiAgICBiaGkgPSBjIC0gKGMgLSBjZXkpO1xuICAgIGJsbyA9IGNleSAtIGJoaTtcbiAgICBzMCA9IGFsbyAqIGJsbyAtIChzMSAtIGFoaSAqIGJoaSAtIGFsbyAqIGJoaSAtIGFoaSAqIGJsbyk7XG4gICAgdDEgPSBjZXggKiBiZXk7XG4gICAgYyA9IHNwbGl0dGVyICogY2V4O1xuICAgIGFoaSA9IGMgLSAoYyAtIGNleCk7XG4gICAgYWxvID0gY2V4IC0gYWhpO1xuICAgIGMgPSBzcGxpdHRlciAqIGJleTtcbiAgICBiaGkgPSBjIC0gKGMgLSBiZXkpO1xuICAgIGJsbyA9IGJleSAtIGJoaTtcbiAgICB0MCA9IGFsbyAqIGJsbyAtICh0MSAtIGFoaSAqIGJoaSAtIGFsbyAqIGJoaSAtIGFoaSAqIGJsbyk7XG4gICAgX2kgPSBzMCAtIHQwO1xuICAgIGJ2aXJ0ID0gczAgLSBfaTtcbiAgICBiY1swXSA9IHMwIC0gKF9pICsgYnZpcnQpICsgKGJ2aXJ0IC0gdDApO1xuICAgIF9qID0gczEgKyBfaTtcbiAgICBidmlydCA9IF9qIC0gczE7XG4gICAgXzAgPSBzMSAtIChfaiAtIGJ2aXJ0KSArIChfaSAtIGJ2aXJ0KTtcbiAgICBfaSA9IF8wIC0gdDE7XG4gICAgYnZpcnQgPSBfMCAtIF9pO1xuICAgIGJjWzFdID0gXzAgLSAoX2kgKyBidmlydCkgKyAoYnZpcnQgLSB0MSk7XG4gICAgYmMzID0gX2ogKyBfaTtcbiAgICBidmlydCA9IGJjMyAtIF9qO1xuICAgIGJjWzJdID0gX2ogLSAoYmMzIC0gYnZpcnQpICsgKF9pIC0gYnZpcnQpO1xuICAgIGJjWzNdID0gYmMzO1xuICAgIHMxID0gY2V4ICogZGV5O1xuICAgIGMgPSBzcGxpdHRlciAqIGNleDtcbiAgICBhaGkgPSBjIC0gKGMgLSBjZXgpO1xuICAgIGFsbyA9IGNleCAtIGFoaTtcbiAgICBjID0gc3BsaXR0ZXIgKiBkZXk7XG4gICAgYmhpID0gYyAtIChjIC0gZGV5KTtcbiAgICBibG8gPSBkZXkgLSBiaGk7XG4gICAgczAgPSBhbG8gKiBibG8gLSAoczEgLSBhaGkgKiBiaGkgLSBhbG8gKiBiaGkgLSBhaGkgKiBibG8pO1xuICAgIHQxID0gZGV4ICogY2V5O1xuICAgIGMgPSBzcGxpdHRlciAqIGRleDtcbiAgICBhaGkgPSBjIC0gKGMgLSBkZXgpO1xuICAgIGFsbyA9IGRleCAtIGFoaTtcbiAgICBjID0gc3BsaXR0ZXIgKiBjZXk7XG4gICAgYmhpID0gYyAtIChjIC0gY2V5KTtcbiAgICBibG8gPSBjZXkgLSBiaGk7XG4gICAgdDAgPSBhbG8gKiBibG8gLSAodDEgLSBhaGkgKiBiaGkgLSBhbG8gKiBiaGkgLSBhaGkgKiBibG8pO1xuICAgIF9pID0gczAgLSB0MDtcbiAgICBidmlydCA9IHMwIC0gX2k7XG4gICAgY2RbMF0gPSBzMCAtIChfaSArIGJ2aXJ0KSArIChidmlydCAtIHQwKTtcbiAgICBfaiA9IHMxICsgX2k7XG4gICAgYnZpcnQgPSBfaiAtIHMxO1xuICAgIF8wID0gczEgLSAoX2ogLSBidmlydCkgKyAoX2kgLSBidmlydCk7XG4gICAgX2kgPSBfMCAtIHQxO1xuICAgIGJ2aXJ0ID0gXzAgLSBfaTtcbiAgICBjZFsxXSA9IF8wIC0gKF9pICsgYnZpcnQpICsgKGJ2aXJ0IC0gdDEpO1xuICAgIGNkMyA9IF9qICsgX2k7XG4gICAgYnZpcnQgPSBjZDMgLSBfajtcbiAgICBjZFsyXSA9IF9qIC0gKGNkMyAtIGJ2aXJ0KSArIChfaSAtIGJ2aXJ0KTtcbiAgICBjZFszXSA9IGNkMztcbiAgICBzMSA9IGRleCAqIGFleTtcbiAgICBjID0gc3BsaXR0ZXIgKiBkZXg7XG4gICAgYWhpID0gYyAtIChjIC0gZGV4KTtcbiAgICBhbG8gPSBkZXggLSBhaGk7XG4gICAgYyA9IHNwbGl0dGVyICogYWV5O1xuICAgIGJoaSA9IGMgLSAoYyAtIGFleSk7XG4gICAgYmxvID0gYWV5IC0gYmhpO1xuICAgIHMwID0gYWxvICogYmxvIC0gKHMxIC0gYWhpICogYmhpIC0gYWxvICogYmhpIC0gYWhpICogYmxvKTtcbiAgICB0MSA9IGFleCAqIGRleTtcbiAgICBjID0gc3BsaXR0ZXIgKiBhZXg7XG4gICAgYWhpID0gYyAtIChjIC0gYWV4KTtcbiAgICBhbG8gPSBhZXggLSBhaGk7XG4gICAgYyA9IHNwbGl0dGVyICogZGV5O1xuICAgIGJoaSA9IGMgLSAoYyAtIGRleSk7XG4gICAgYmxvID0gZGV5IC0gYmhpO1xuICAgIHQwID0gYWxvICogYmxvIC0gKHQxIC0gYWhpICogYmhpIC0gYWxvICogYmhpIC0gYWhpICogYmxvKTtcbiAgICBfaSA9IHMwIC0gdDA7XG4gICAgYnZpcnQgPSBzMCAtIF9pO1xuICAgIGRhWzBdID0gczAgLSAoX2kgKyBidmlydCkgKyAoYnZpcnQgLSB0MCk7XG4gICAgX2ogPSBzMSArIF9pO1xuICAgIGJ2aXJ0ID0gX2ogLSBzMTtcbiAgICBfMCA9IHMxIC0gKF9qIC0gYnZpcnQpICsgKF9pIC0gYnZpcnQpO1xuICAgIF9pID0gXzAgLSB0MTtcbiAgICBidmlydCA9IF8wIC0gX2k7XG4gICAgZGFbMV0gPSBfMCAtIChfaSArIGJ2aXJ0KSArIChidmlydCAtIHQxKTtcbiAgICBkYTMgPSBfaiArIF9pO1xuICAgIGJ2aXJ0ID0gZGEzIC0gX2o7XG4gICAgZGFbMl0gPSBfaiAtIChkYTMgLSBidmlydCkgKyAoX2kgLSBidmlydCk7XG4gICAgZGFbM10gPSBkYTM7XG4gICAgczEgPSBhZXggKiBjZXk7XG4gICAgYyA9IHNwbGl0dGVyICogYWV4O1xuICAgIGFoaSA9IGMgLSAoYyAtIGFleCk7XG4gICAgYWxvID0gYWV4IC0gYWhpO1xuICAgIGMgPSBzcGxpdHRlciAqIGNleTtcbiAgICBiaGkgPSBjIC0gKGMgLSBjZXkpO1xuICAgIGJsbyA9IGNleSAtIGJoaTtcbiAgICBzMCA9IGFsbyAqIGJsbyAtIChzMSAtIGFoaSAqIGJoaSAtIGFsbyAqIGJoaSAtIGFoaSAqIGJsbyk7XG4gICAgdDEgPSBjZXggKiBhZXk7XG4gICAgYyA9IHNwbGl0dGVyICogY2V4O1xuICAgIGFoaSA9IGMgLSAoYyAtIGNleCk7XG4gICAgYWxvID0gY2V4IC0gYWhpO1xuICAgIGMgPSBzcGxpdHRlciAqIGFleTtcbiAgICBiaGkgPSBjIC0gKGMgLSBhZXkpO1xuICAgIGJsbyA9IGFleSAtIGJoaTtcbiAgICB0MCA9IGFsbyAqIGJsbyAtICh0MSAtIGFoaSAqIGJoaSAtIGFsbyAqIGJoaSAtIGFoaSAqIGJsbyk7XG4gICAgX2kgPSBzMCAtIHQwO1xuICAgIGJ2aXJ0ID0gczAgLSBfaTtcbiAgICBhY1swXSA9IHMwIC0gKF9pICsgYnZpcnQpICsgKGJ2aXJ0IC0gdDApO1xuICAgIF9qID0gczEgKyBfaTtcbiAgICBidmlydCA9IF9qIC0gczE7XG4gICAgXzAgPSBzMSAtIChfaiAtIGJ2aXJ0KSArIChfaSAtIGJ2aXJ0KTtcbiAgICBfaSA9IF8wIC0gdDE7XG4gICAgYnZpcnQgPSBfMCAtIF9pO1xuICAgIGFjWzFdID0gXzAgLSAoX2kgKyBidmlydCkgKyAoYnZpcnQgLSB0MSk7XG4gICAgYWMzID0gX2ogKyBfaTtcbiAgICBidmlydCA9IGFjMyAtIF9qO1xuICAgIGFjWzJdID0gX2ogLSAoYWMzIC0gYnZpcnQpICsgKF9pIC0gYnZpcnQpO1xuICAgIGFjWzNdID0gYWMzO1xuICAgIHMxID0gYmV4ICogZGV5O1xuICAgIGMgPSBzcGxpdHRlciAqIGJleDtcbiAgICBhaGkgPSBjIC0gKGMgLSBiZXgpO1xuICAgIGFsbyA9IGJleCAtIGFoaTtcbiAgICBjID0gc3BsaXR0ZXIgKiBkZXk7XG4gICAgYmhpID0gYyAtIChjIC0gZGV5KTtcbiAgICBibG8gPSBkZXkgLSBiaGk7XG4gICAgczAgPSBhbG8gKiBibG8gLSAoczEgLSBhaGkgKiBiaGkgLSBhbG8gKiBiaGkgLSBhaGkgKiBibG8pO1xuICAgIHQxID0gZGV4ICogYmV5O1xuICAgIGMgPSBzcGxpdHRlciAqIGRleDtcbiAgICBhaGkgPSBjIC0gKGMgLSBkZXgpO1xuICAgIGFsbyA9IGRleCAtIGFoaTtcbiAgICBjID0gc3BsaXR0ZXIgKiBiZXk7XG4gICAgYmhpID0gYyAtIChjIC0gYmV5KTtcbiAgICBibG8gPSBiZXkgLSBiaGk7XG4gICAgdDAgPSBhbG8gKiBibG8gLSAodDEgLSBhaGkgKiBiaGkgLSBhbG8gKiBiaGkgLSBhaGkgKiBibG8pO1xuICAgIF9pID0gczAgLSB0MDtcbiAgICBidmlydCA9IHMwIC0gX2k7XG4gICAgYmRbMF0gPSBzMCAtIChfaSArIGJ2aXJ0KSArIChidmlydCAtIHQwKTtcbiAgICBfaiA9IHMxICsgX2k7XG4gICAgYnZpcnQgPSBfaiAtIHMxO1xuICAgIF8wID0gczEgLSAoX2ogLSBidmlydCkgKyAoX2kgLSBidmlydCk7XG4gICAgX2kgPSBfMCAtIHQxO1xuICAgIGJ2aXJ0ID0gXzAgLSBfaTtcbiAgICBiZFsxXSA9IF8wIC0gKF9pICsgYnZpcnQpICsgKGJ2aXJ0IC0gdDEpO1xuICAgIGJkMyA9IF9qICsgX2k7XG4gICAgYnZpcnQgPSBiZDMgLSBfajtcbiAgICBiZFsyXSA9IF9qIC0gKGJkMyAtIGJ2aXJ0KSArIChfaSAtIGJ2aXJ0KTtcbiAgICBiZFszXSA9IGJkMztcblxuICAgIGNvbnN0IGZpbmxlbiA9IHN1bShcbiAgICAgICAgc3VtKFxuICAgICAgICAgICAgbmVnYXRlKGxpZnRhZGFwdChiYywgY2QsIGJkLCBkZXosIGJleiwgLWNleiwgYWV4LCBhZXksIGFleiwgYWRldCksIGFkZXQpLCBhZGV0LFxuICAgICAgICAgICAgbGlmdGFkYXB0KGNkLCBkYSwgYWMsIGFleiwgY2V6LCBkZXosIGJleCwgYmV5LCBiZXosIGJkZXQpLCBiZGV0LCBhYmRldCksIGFiZGV0LFxuICAgICAgICBzdW0oXG4gICAgICAgICAgICBuZWdhdGUobGlmdGFkYXB0KGRhLCBhYiwgYmQsIGJleiwgZGV6LCBhZXosIGNleCwgY2V5LCBjZXosIGNkZXQpLCBjZGV0KSwgY2RldCxcbiAgICAgICAgICAgIGxpZnRhZGFwdChhYiwgYmMsIGFjLCBjZXosIGFleiwgLWJleiwgZGV4LCBkZXksIGRleiwgZGRldCksIGRkZXQsIGNkZGV0KSwgY2RkZXQsIGZpbik7XG5cbiAgICBsZXQgZGV0ID0gZXN0aW1hdGUoZmlubGVuLCBmaW4pO1xuICAgIGxldCBlcnJib3VuZCA9IGlzcGVycmJvdW5kQiAqIHBlcm1hbmVudDtcbiAgICBpZiAoZGV0ID49IGVycmJvdW5kIHx8IC1kZXQgPj0gZXJyYm91bmQpIHtcbiAgICAgICAgcmV0dXJuIGRldDtcbiAgICB9XG5cbiAgICBidmlydCA9IGF4IC0gYWV4O1xuICAgIGFleHRhaWwgPSBheCAtIChhZXggKyBidmlydCkgKyAoYnZpcnQgLSBleCk7XG4gICAgYnZpcnQgPSBheSAtIGFleTtcbiAgICBhZXl0YWlsID0gYXkgLSAoYWV5ICsgYnZpcnQpICsgKGJ2aXJ0IC0gZXkpO1xuICAgIGJ2aXJ0ID0gYXogLSBhZXo7XG4gICAgYWV6dGFpbCA9IGF6IC0gKGFleiArIGJ2aXJ0KSArIChidmlydCAtIGV6KTtcbiAgICBidmlydCA9IGJ4IC0gYmV4O1xuICAgIGJleHRhaWwgPSBieCAtIChiZXggKyBidmlydCkgKyAoYnZpcnQgLSBleCk7XG4gICAgYnZpcnQgPSBieSAtIGJleTtcbiAgICBiZXl0YWlsID0gYnkgLSAoYmV5ICsgYnZpcnQpICsgKGJ2aXJ0IC0gZXkpO1xuICAgIGJ2aXJ0ID0gYnogLSBiZXo7XG4gICAgYmV6dGFpbCA9IGJ6IC0gKGJleiArIGJ2aXJ0KSArIChidmlydCAtIGV6KTtcbiAgICBidmlydCA9IGN4IC0gY2V4O1xuICAgIGNleHRhaWwgPSBjeCAtIChjZXggKyBidmlydCkgKyAoYnZpcnQgLSBleCk7XG4gICAgYnZpcnQgPSBjeSAtIGNleTtcbiAgICBjZXl0YWlsID0gY3kgLSAoY2V5ICsgYnZpcnQpICsgKGJ2aXJ0IC0gZXkpO1xuICAgIGJ2aXJ0ID0gY3ogLSBjZXo7XG4gICAgY2V6dGFpbCA9IGN6IC0gKGNleiArIGJ2aXJ0KSArIChidmlydCAtIGV6KTtcbiAgICBidmlydCA9IGR4IC0gZGV4O1xuICAgIGRleHRhaWwgPSBkeCAtIChkZXggKyBidmlydCkgKyAoYnZpcnQgLSBleCk7XG4gICAgYnZpcnQgPSBkeSAtIGRleTtcbiAgICBkZXl0YWlsID0gZHkgLSAoZGV5ICsgYnZpcnQpICsgKGJ2aXJ0IC0gZXkpO1xuICAgIGJ2aXJ0ID0gZHogLSBkZXo7XG4gICAgZGV6dGFpbCA9IGR6IC0gKGRleiArIGJ2aXJ0KSArIChidmlydCAtIGV6KTtcbiAgICBpZiAoYWV4dGFpbCA9PT0gMCAmJiBhZXl0YWlsID09PSAwICYmIGFlenRhaWwgPT09IDAgJiZcbiAgICAgICAgYmV4dGFpbCA9PT0gMCAmJiBiZXl0YWlsID09PSAwICYmIGJlenRhaWwgPT09IDAgJiZcbiAgICAgICAgY2V4dGFpbCA9PT0gMCAmJiBjZXl0YWlsID09PSAwICYmIGNlenRhaWwgPT09IDAgJiZcbiAgICAgICAgZGV4dGFpbCA9PT0gMCAmJiBkZXl0YWlsID09PSAwICYmIGRlenRhaWwgPT09IDApIHtcbiAgICAgICAgcmV0dXJuIGRldDtcbiAgICB9XG5cbiAgICBlcnJib3VuZCA9IGlzcGVycmJvdW5kQyAqIHBlcm1hbmVudCArIHJlc3VsdGVycmJvdW5kICogTWF0aC5hYnMoZGV0KTtcblxuICAgIGNvbnN0IGFiZXBzID0gKGFleCAqIGJleXRhaWwgKyBiZXkgKiBhZXh0YWlsKSAtIChhZXkgKiBiZXh0YWlsICsgYmV4ICogYWV5dGFpbCk7XG4gICAgY29uc3QgYmNlcHMgPSAoYmV4ICogY2V5dGFpbCArIGNleSAqIGJleHRhaWwpIC0gKGJleSAqIGNleHRhaWwgKyBjZXggKiBiZXl0YWlsKTtcbiAgICBjb25zdCBjZGVwcyA9IChjZXggKiBkZXl0YWlsICsgZGV5ICogY2V4dGFpbCkgLSAoY2V5ICogZGV4dGFpbCArIGRleCAqIGNleXRhaWwpO1xuICAgIGNvbnN0IGRhZXBzID0gKGRleCAqIGFleXRhaWwgKyBhZXkgKiBkZXh0YWlsKSAtIChkZXkgKiBhZXh0YWlsICsgYWV4ICogZGV5dGFpbCk7XG4gICAgY29uc3QgYWNlcHMgPSAoYWV4ICogY2V5dGFpbCArIGNleSAqIGFleHRhaWwpIC0gKGFleSAqIGNleHRhaWwgKyBjZXggKiBhZXl0YWlsKTtcbiAgICBjb25zdCBiZGVwcyA9IChiZXggKiBkZXl0YWlsICsgZGV5ICogYmV4dGFpbCkgLSAoYmV5ICogZGV4dGFpbCArIGRleCAqIGJleXRhaWwpO1xuICAgIGRldCArPVxuICAgICAgICAoKChiZXggKiBiZXggKyBiZXkgKiBiZXkgKyBiZXogKiBiZXopICogKChjZXogKiBkYWVwcyArIGRleiAqIGFjZXBzICsgYWV6ICogY2RlcHMpICtcbiAgICAgICAgKGNlenRhaWwgKiBkYTMgKyBkZXp0YWlsICogYWMzICsgYWV6dGFpbCAqIGNkMykpICsgKGRleCAqIGRleCArIGRleSAqIGRleSArIGRleiAqIGRleikgKlxuICAgICAgICAoKGFleiAqIGJjZXBzIC0gYmV6ICogYWNlcHMgKyBjZXogKiBhYmVwcykgKyAoYWV6dGFpbCAqIGJjMyAtIGJlenRhaWwgKiBhYzMgKyBjZXp0YWlsICogYWIzKSkpIC1cbiAgICAgICAgKChhZXggKiBhZXggKyBhZXkgKiBhZXkgKyBhZXogKiBhZXopICogKChiZXogKiBjZGVwcyAtIGNleiAqIGJkZXBzICsgZGV6ICogYmNlcHMpICtcbiAgICAgICAgKGJlenRhaWwgKiBjZDMgLSBjZXp0YWlsICogYmQzICsgZGV6dGFpbCAqIGJjMykpICsgKGNleCAqIGNleCArIGNleSAqIGNleSArIGNleiAqIGNleikgKlxuICAgICAgICAoKGRleiAqIGFiZXBzICsgYWV6ICogYmRlcHMgKyBiZXogKiBkYWVwcykgKyAoZGV6dGFpbCAqIGFiMyArIGFlenRhaWwgKiBiZDMgKyBiZXp0YWlsICogZGEzKSkpKSArXG4gICAgICAgIDIgKiAoKChiZXggKiBiZXh0YWlsICsgYmV5ICogYmV5dGFpbCArIGJleiAqIGJlenRhaWwpICogKGNleiAqIGRhMyArIGRleiAqIGFjMyArIGFleiAqIGNkMykgK1xuICAgICAgICAoZGV4ICogZGV4dGFpbCArIGRleSAqIGRleXRhaWwgKyBkZXogKiBkZXp0YWlsKSAqIChhZXogKiBiYzMgLSBiZXogKiBhYzMgKyBjZXogKiBhYjMpKSAtXG4gICAgICAgICgoYWV4ICogYWV4dGFpbCArIGFleSAqIGFleXRhaWwgKyBhZXogKiBhZXp0YWlsKSAqIChiZXogKiBjZDMgLSBjZXogKiBiZDMgKyBkZXogKiBiYzMpICtcbiAgICAgICAgKGNleCAqIGNleHRhaWwgKyBjZXkgKiBjZXl0YWlsICsgY2V6ICogY2V6dGFpbCkgKiAoZGV6ICogYWIzICsgYWV6ICogYmQzICsgYmV6ICogZGEzKSkpO1xuXG4gICAgaWYgKGRldCA+PSBlcnJib3VuZCB8fCAtZGV0ID49IGVycmJvdW5kKSB7XG4gICAgICAgIHJldHVybiBkZXQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIGluc3BoZXJlZXhhY3QoYXgsIGF5LCBheiwgYngsIGJ5LCBieiwgY3gsIGN5LCBjeiwgZHgsIGR5LCBkeiwgZXgsIGV5LCBleik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbnNwaGVyZShheCwgYXksIGF6LCBieCwgYnksIGJ6LCBjeCwgY3ksIGN6LCBkeCwgZHksIGR6LCBleCwgZXksIGV6KSB7XG4gICAgY29uc3QgYWV4ID0gYXggLSBleDtcbiAgICBjb25zdCBiZXggPSBieCAtIGV4O1xuICAgIGNvbnN0IGNleCA9IGN4IC0gZXg7XG4gICAgY29uc3QgZGV4ID0gZHggLSBleDtcbiAgICBjb25zdCBhZXkgPSBheSAtIGV5O1xuICAgIGNvbnN0IGJleSA9IGJ5IC0gZXk7XG4gICAgY29uc3QgY2V5ID0gY3kgLSBleTtcbiAgICBjb25zdCBkZXkgPSBkeSAtIGV5O1xuICAgIGNvbnN0IGFleiA9IGF6IC0gZXo7XG4gICAgY29uc3QgYmV6ID0gYnogLSBlejtcbiAgICBjb25zdCBjZXogPSBjeiAtIGV6O1xuICAgIGNvbnN0IGRleiA9IGR6IC0gZXo7XG5cbiAgICBjb25zdCBhZXhiZXkgPSBhZXggKiBiZXk7XG4gICAgY29uc3QgYmV4YWV5ID0gYmV4ICogYWV5O1xuICAgIGNvbnN0IGFiID0gYWV4YmV5IC0gYmV4YWV5O1xuICAgIGNvbnN0IGJleGNleSA9IGJleCAqIGNleTtcbiAgICBjb25zdCBjZXhiZXkgPSBjZXggKiBiZXk7XG4gICAgY29uc3QgYmMgPSBiZXhjZXkgLSBjZXhiZXk7XG4gICAgY29uc3QgY2V4ZGV5ID0gY2V4ICogZGV5O1xuICAgIGNvbnN0IGRleGNleSA9IGRleCAqIGNleTtcbiAgICBjb25zdCBjZCA9IGNleGRleSAtIGRleGNleTtcbiAgICBjb25zdCBkZXhhZXkgPSBkZXggKiBhZXk7XG4gICAgY29uc3QgYWV4ZGV5ID0gYWV4ICogZGV5O1xuICAgIGNvbnN0IGRhID0gZGV4YWV5IC0gYWV4ZGV5O1xuICAgIGNvbnN0IGFleGNleSA9IGFleCAqIGNleTtcbiAgICBjb25zdCBjZXhhZXkgPSBjZXggKiBhZXk7XG4gICAgY29uc3QgYWMgPSBhZXhjZXkgLSBjZXhhZXk7XG4gICAgY29uc3QgYmV4ZGV5ID0gYmV4ICogZGV5O1xuICAgIGNvbnN0IGRleGJleSA9IGRleCAqIGJleTtcbiAgICBjb25zdCBiZCA9IGJleGRleSAtIGRleGJleTtcblxuICAgIGNvbnN0IGFsaWZ0ID0gYWV4ICogYWV4ICsgYWV5ICogYWV5ICsgYWV6ICogYWV6O1xuICAgIGNvbnN0IGJsaWZ0ID0gYmV4ICogYmV4ICsgYmV5ICogYmV5ICsgYmV6ICogYmV6O1xuICAgIGNvbnN0IGNsaWZ0ID0gY2V4ICogY2V4ICsgY2V5ICogY2V5ICsgY2V6ICogY2V6O1xuICAgIGNvbnN0IGRsaWZ0ID0gZGV4ICogZGV4ICsgZGV5ICogZGV5ICsgZGV6ICogZGV6O1xuXG4gICAgY29uc3QgZGV0ID1cbiAgICAgICAgKGNsaWZ0ICogKGRleiAqIGFiICsgYWV6ICogYmQgKyBiZXogKiBkYSkgLSBkbGlmdCAqIChhZXogKiBiYyAtIGJleiAqIGFjICsgY2V6ICogYWIpKSArXG4gICAgICAgIChhbGlmdCAqIChiZXogKiBjZCAtIGNleiAqIGJkICsgZGV6ICogYmMpIC0gYmxpZnQgKiAoY2V6ICogZGEgKyBkZXogKiBhYyArIGFleiAqIGNkKSk7XG5cbiAgICBjb25zdCBhZXpwbHVzID0gTWF0aC5hYnMoYWV6KTtcbiAgICBjb25zdCBiZXpwbHVzID0gTWF0aC5hYnMoYmV6KTtcbiAgICBjb25zdCBjZXpwbHVzID0gTWF0aC5hYnMoY2V6KTtcbiAgICBjb25zdCBkZXpwbHVzID0gTWF0aC5hYnMoZGV6KTtcbiAgICBjb25zdCBhZXhiZXlwbHVzID0gTWF0aC5hYnMoYWV4YmV5KSArIE1hdGguYWJzKGJleGFleSk7XG4gICAgY29uc3QgYmV4Y2V5cGx1cyA9IE1hdGguYWJzKGJleGNleSkgKyBNYXRoLmFicyhjZXhiZXkpO1xuICAgIGNvbnN0IGNleGRleXBsdXMgPSBNYXRoLmFicyhjZXhkZXkpICsgTWF0aC5hYnMoZGV4Y2V5KTtcbiAgICBjb25zdCBkZXhhZXlwbHVzID0gTWF0aC5hYnMoZGV4YWV5KSArIE1hdGguYWJzKGFleGRleSk7XG4gICAgY29uc3QgYWV4Y2V5cGx1cyA9IE1hdGguYWJzKGFleGNleSkgKyBNYXRoLmFicyhjZXhhZXkpO1xuICAgIGNvbnN0IGJleGRleXBsdXMgPSBNYXRoLmFicyhiZXhkZXkpICsgTWF0aC5hYnMoZGV4YmV5KTtcbiAgICBjb25zdCBwZXJtYW5lbnQgPVxuICAgICAgICAoY2V4ZGV5cGx1cyAqIGJlenBsdXMgKyBiZXhkZXlwbHVzICogY2V6cGx1cyArIGJleGNleXBsdXMgKiBkZXpwbHVzKSAqIGFsaWZ0ICtcbiAgICAgICAgKGRleGFleXBsdXMgKiBjZXpwbHVzICsgYWV4Y2V5cGx1cyAqIGRlenBsdXMgKyBjZXhkZXlwbHVzICogYWV6cGx1cykgKiBibGlmdCArXG4gICAgICAgIChhZXhiZXlwbHVzICogZGV6cGx1cyArIGJleGRleXBsdXMgKiBhZXpwbHVzICsgZGV4YWV5cGx1cyAqIGJlenBsdXMpICogY2xpZnQgK1xuICAgICAgICAoYmV4Y2V5cGx1cyAqIGFlenBsdXMgKyBhZXhjZXlwbHVzICogYmV6cGx1cyArIGFleGJleXBsdXMgKiBjZXpwbHVzKSAqIGRsaWZ0O1xuXG4gICAgY29uc3QgZXJyYm91bmQgPSBpc3BlcnJib3VuZEEgKiBwZXJtYW5lbnQ7XG4gICAgaWYgKGRldCA+IGVycmJvdW5kIHx8IC1kZXQgPiBlcnJib3VuZCkge1xuICAgICAgICByZXR1cm4gZGV0O1xuICAgIH1cbiAgICByZXR1cm4gLWluc3BoZXJlYWRhcHQoYXgsIGF5LCBheiwgYngsIGJ5LCBieiwgY3gsIGN5LCBjeiwgZHgsIGR5LCBkeiwgZXgsIGV5LCBleiwgcGVybWFuZW50KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluc3BoZXJlZmFzdChwYXgsIHBheSwgcGF6LCBwYngsIHBieSwgcGJ6LCBwY3gsIHBjeSwgcGN6LCBwZHgsIHBkeSwgcGR6LCBwZXgsIHBleSwgcGV6KSB7XG4gICAgY29uc3QgYWV4ID0gcGF4IC0gcGV4O1xuICAgIGNvbnN0IGJleCA9IHBieCAtIHBleDtcbiAgICBjb25zdCBjZXggPSBwY3ggLSBwZXg7XG4gICAgY29uc3QgZGV4ID0gcGR4IC0gcGV4O1xuICAgIGNvbnN0IGFleSA9IHBheSAtIHBleTtcbiAgICBjb25zdCBiZXkgPSBwYnkgLSBwZXk7XG4gICAgY29uc3QgY2V5ID0gcGN5IC0gcGV5O1xuICAgIGNvbnN0IGRleSA9IHBkeSAtIHBleTtcbiAgICBjb25zdCBhZXogPSBwYXogLSBwZXo7XG4gICAgY29uc3QgYmV6ID0gcGJ6IC0gcGV6O1xuICAgIGNvbnN0IGNleiA9IHBjeiAtIHBlejtcbiAgICBjb25zdCBkZXogPSBwZHogLSBwZXo7XG5cbiAgICBjb25zdCBhYiA9IGFleCAqIGJleSAtIGJleCAqIGFleTtcbiAgICBjb25zdCBiYyA9IGJleCAqIGNleSAtIGNleCAqIGJleTtcbiAgICBjb25zdCBjZCA9IGNleCAqIGRleSAtIGRleCAqIGNleTtcbiAgICBjb25zdCBkYSA9IGRleCAqIGFleSAtIGFleCAqIGRleTtcbiAgICBjb25zdCBhYyA9IGFleCAqIGNleSAtIGNleCAqIGFleTtcbiAgICBjb25zdCBiZCA9IGJleCAqIGRleSAtIGRleCAqIGJleTtcblxuICAgIGNvbnN0IGFiYyA9IGFleiAqIGJjIC0gYmV6ICogYWMgKyBjZXogKiBhYjtcbiAgICBjb25zdCBiY2QgPSBiZXogKiBjZCAtIGNleiAqIGJkICsgZGV6ICogYmM7XG4gICAgY29uc3QgY2RhID0gY2V6ICogZGEgKyBkZXogKiBhYyArIGFleiAqIGNkO1xuICAgIGNvbnN0IGRhYiA9IGRleiAqIGFiICsgYWV6ICogYmQgKyBiZXogKiBkYTtcblxuICAgIGNvbnN0IGFsaWZ0ID0gYWV4ICogYWV4ICsgYWV5ICogYWV5ICsgYWV6ICogYWV6O1xuICAgIGNvbnN0IGJsaWZ0ID0gYmV4ICogYmV4ICsgYmV5ICogYmV5ICsgYmV6ICogYmV6O1xuICAgIGNvbnN0IGNsaWZ0ID0gY2V4ICogY2V4ICsgY2V5ICogY2V5ICsgY2V6ICogY2V6O1xuICAgIGNvbnN0IGRsaWZ0ID0gZGV4ICogZGV4ICsgZGV5ICogZGV5ICsgZGV6ICogZGV6O1xuXG4gICAgcmV0dXJuIChjbGlmdCAqIGRhYiAtIGRsaWZ0ICogYWJjKSArIChhbGlmdCAqIGJjZCAtIGJsaWZ0ICogY2RhKTtcbn1cbiIsImltcG9ydCB7ZXBzaWxvbiwgc3BsaXR0ZXIsIHJlc3VsdGVycmJvdW5kLCBlc3RpbWF0ZSwgdmVjLCBzdW19IGZyb20gJy4vdXRpbC5qcyc7XG5cbmNvbnN0IGNjd2VycmJvdW5kQSA9ICgzICsgMTYgKiBlcHNpbG9uKSAqIGVwc2lsb247XG5jb25zdCBjY3dlcnJib3VuZEIgPSAoMiArIDEyICogZXBzaWxvbikgKiBlcHNpbG9uO1xuY29uc3QgY2N3ZXJyYm91bmRDID0gKDkgKyA2NCAqIGVwc2lsb24pICogZXBzaWxvbiAqIGVwc2lsb247XG5cbmNvbnN0IEIgPSB2ZWMoNCk7XG5jb25zdCBDMSA9IHZlYyg4KTtcbmNvbnN0IEMyID0gdmVjKDEyKTtcbmNvbnN0IEQgPSB2ZWMoMTYpO1xuY29uc3QgdSA9IHZlYyg0KTtcblxuZnVuY3Rpb24gb3JpZW50MmRhZGFwdChheCwgYXksIGJ4LCBieSwgY3gsIGN5LCBkZXRzdW0pIHtcbiAgICBsZXQgYWN4dGFpbCwgYWN5dGFpbCwgYmN4dGFpbCwgYmN5dGFpbDtcbiAgICBsZXQgYnZpcnQsIGMsIGFoaSwgYWxvLCBiaGksIGJsbywgX2ksIF9qLCBfMCwgczEsIHMwLCB0MSwgdDAsIHUzO1xuXG4gICAgY29uc3QgYWN4ID0gYXggLSBjeDtcbiAgICBjb25zdCBiY3ggPSBieCAtIGN4O1xuICAgIGNvbnN0IGFjeSA9IGF5IC0gY3k7XG4gICAgY29uc3QgYmN5ID0gYnkgLSBjeTtcblxuICAgIHMxID0gYWN4ICogYmN5O1xuICAgIGMgPSBzcGxpdHRlciAqIGFjeDtcbiAgICBhaGkgPSBjIC0gKGMgLSBhY3gpO1xuICAgIGFsbyA9IGFjeCAtIGFoaTtcbiAgICBjID0gc3BsaXR0ZXIgKiBiY3k7XG4gICAgYmhpID0gYyAtIChjIC0gYmN5KTtcbiAgICBibG8gPSBiY3kgLSBiaGk7XG4gICAgczAgPSBhbG8gKiBibG8gLSAoczEgLSBhaGkgKiBiaGkgLSBhbG8gKiBiaGkgLSBhaGkgKiBibG8pO1xuICAgIHQxID0gYWN5ICogYmN4O1xuICAgIGMgPSBzcGxpdHRlciAqIGFjeTtcbiAgICBhaGkgPSBjIC0gKGMgLSBhY3kpO1xuICAgIGFsbyA9IGFjeSAtIGFoaTtcbiAgICBjID0gc3BsaXR0ZXIgKiBiY3g7XG4gICAgYmhpID0gYyAtIChjIC0gYmN4KTtcbiAgICBibG8gPSBiY3ggLSBiaGk7XG4gICAgdDAgPSBhbG8gKiBibG8gLSAodDEgLSBhaGkgKiBiaGkgLSBhbG8gKiBiaGkgLSBhaGkgKiBibG8pO1xuICAgIF9pID0gczAgLSB0MDtcbiAgICBidmlydCA9IHMwIC0gX2k7XG4gICAgQlswXSA9IHMwIC0gKF9pICsgYnZpcnQpICsgKGJ2aXJ0IC0gdDApO1xuICAgIF9qID0gczEgKyBfaTtcbiAgICBidmlydCA9IF9qIC0gczE7XG4gICAgXzAgPSBzMSAtIChfaiAtIGJ2aXJ0KSArIChfaSAtIGJ2aXJ0KTtcbiAgICBfaSA9IF8wIC0gdDE7XG4gICAgYnZpcnQgPSBfMCAtIF9pO1xuICAgIEJbMV0gPSBfMCAtIChfaSArIGJ2aXJ0KSArIChidmlydCAtIHQxKTtcbiAgICB1MyA9IF9qICsgX2k7XG4gICAgYnZpcnQgPSB1MyAtIF9qO1xuICAgIEJbMl0gPSBfaiAtICh1MyAtIGJ2aXJ0KSArIChfaSAtIGJ2aXJ0KTtcbiAgICBCWzNdID0gdTM7XG5cbiAgICBsZXQgZGV0ID0gZXN0aW1hdGUoNCwgQik7XG4gICAgbGV0IGVycmJvdW5kID0gY2N3ZXJyYm91bmRCICogZGV0c3VtO1xuICAgIGlmIChkZXQgPj0gZXJyYm91bmQgfHwgLWRldCA+PSBlcnJib3VuZCkge1xuICAgICAgICByZXR1cm4gZGV0O1xuICAgIH1cblxuICAgIGJ2aXJ0ID0gYXggLSBhY3g7XG4gICAgYWN4dGFpbCA9IGF4IC0gKGFjeCArIGJ2aXJ0KSArIChidmlydCAtIGN4KTtcbiAgICBidmlydCA9IGJ4IC0gYmN4O1xuICAgIGJjeHRhaWwgPSBieCAtIChiY3ggKyBidmlydCkgKyAoYnZpcnQgLSBjeCk7XG4gICAgYnZpcnQgPSBheSAtIGFjeTtcbiAgICBhY3l0YWlsID0gYXkgLSAoYWN5ICsgYnZpcnQpICsgKGJ2aXJ0IC0gY3kpO1xuICAgIGJ2aXJ0ID0gYnkgLSBiY3k7XG4gICAgYmN5dGFpbCA9IGJ5IC0gKGJjeSArIGJ2aXJ0KSArIChidmlydCAtIGN5KTtcblxuICAgIGlmIChhY3h0YWlsID09PSAwICYmIGFjeXRhaWwgPT09IDAgJiYgYmN4dGFpbCA9PT0gMCAmJiBiY3l0YWlsID09PSAwKSB7XG4gICAgICAgIHJldHVybiBkZXQ7XG4gICAgfVxuXG4gICAgZXJyYm91bmQgPSBjY3dlcnJib3VuZEMgKiBkZXRzdW0gKyByZXN1bHRlcnJib3VuZCAqIE1hdGguYWJzKGRldCk7XG4gICAgZGV0ICs9IChhY3ggKiBiY3l0YWlsICsgYmN5ICogYWN4dGFpbCkgLSAoYWN5ICogYmN4dGFpbCArIGJjeCAqIGFjeXRhaWwpO1xuICAgIGlmIChkZXQgPj0gZXJyYm91bmQgfHwgLWRldCA+PSBlcnJib3VuZCkgcmV0dXJuIGRldDtcblxuICAgIHMxID0gYWN4dGFpbCAqIGJjeTtcbiAgICBjID0gc3BsaXR0ZXIgKiBhY3h0YWlsO1xuICAgIGFoaSA9IGMgLSAoYyAtIGFjeHRhaWwpO1xuICAgIGFsbyA9IGFjeHRhaWwgLSBhaGk7XG4gICAgYyA9IHNwbGl0dGVyICogYmN5O1xuICAgIGJoaSA9IGMgLSAoYyAtIGJjeSk7XG4gICAgYmxvID0gYmN5IC0gYmhpO1xuICAgIHMwID0gYWxvICogYmxvIC0gKHMxIC0gYWhpICogYmhpIC0gYWxvICogYmhpIC0gYWhpICogYmxvKTtcbiAgICB0MSA9IGFjeXRhaWwgKiBiY3g7XG4gICAgYyA9IHNwbGl0dGVyICogYWN5dGFpbDtcbiAgICBhaGkgPSBjIC0gKGMgLSBhY3l0YWlsKTtcbiAgICBhbG8gPSBhY3l0YWlsIC0gYWhpO1xuICAgIGMgPSBzcGxpdHRlciAqIGJjeDtcbiAgICBiaGkgPSBjIC0gKGMgLSBiY3gpO1xuICAgIGJsbyA9IGJjeCAtIGJoaTtcbiAgICB0MCA9IGFsbyAqIGJsbyAtICh0MSAtIGFoaSAqIGJoaSAtIGFsbyAqIGJoaSAtIGFoaSAqIGJsbyk7XG4gICAgX2kgPSBzMCAtIHQwO1xuICAgIGJ2aXJ0ID0gczAgLSBfaTtcbiAgICB1WzBdID0gczAgLSAoX2kgKyBidmlydCkgKyAoYnZpcnQgLSB0MCk7XG4gICAgX2ogPSBzMSArIF9pO1xuICAgIGJ2aXJ0ID0gX2ogLSBzMTtcbiAgICBfMCA9IHMxIC0gKF9qIC0gYnZpcnQpICsgKF9pIC0gYnZpcnQpO1xuICAgIF9pID0gXzAgLSB0MTtcbiAgICBidmlydCA9IF8wIC0gX2k7XG4gICAgdVsxXSA9IF8wIC0gKF9pICsgYnZpcnQpICsgKGJ2aXJ0IC0gdDEpO1xuICAgIHUzID0gX2ogKyBfaTtcbiAgICBidmlydCA9IHUzIC0gX2o7XG4gICAgdVsyXSA9IF9qIC0gKHUzIC0gYnZpcnQpICsgKF9pIC0gYnZpcnQpO1xuICAgIHVbM10gPSB1MztcbiAgICBjb25zdCBDMWxlbiA9IHN1bSg0LCBCLCA0LCB1LCBDMSk7XG5cbiAgICBzMSA9IGFjeCAqIGJjeXRhaWw7XG4gICAgYyA9IHNwbGl0dGVyICogYWN4O1xuICAgIGFoaSA9IGMgLSAoYyAtIGFjeCk7XG4gICAgYWxvID0gYWN4IC0gYWhpO1xuICAgIGMgPSBzcGxpdHRlciAqIGJjeXRhaWw7XG4gICAgYmhpID0gYyAtIChjIC0gYmN5dGFpbCk7XG4gICAgYmxvID0gYmN5dGFpbCAtIGJoaTtcbiAgICBzMCA9IGFsbyAqIGJsbyAtIChzMSAtIGFoaSAqIGJoaSAtIGFsbyAqIGJoaSAtIGFoaSAqIGJsbyk7XG4gICAgdDEgPSBhY3kgKiBiY3h0YWlsO1xuICAgIGMgPSBzcGxpdHRlciAqIGFjeTtcbiAgICBhaGkgPSBjIC0gKGMgLSBhY3kpO1xuICAgIGFsbyA9IGFjeSAtIGFoaTtcbiAgICBjID0gc3BsaXR0ZXIgKiBiY3h0YWlsO1xuICAgIGJoaSA9IGMgLSAoYyAtIGJjeHRhaWwpO1xuICAgIGJsbyA9IGJjeHRhaWwgLSBiaGk7XG4gICAgdDAgPSBhbG8gKiBibG8gLSAodDEgLSBhaGkgKiBiaGkgLSBhbG8gKiBiaGkgLSBhaGkgKiBibG8pO1xuICAgIF9pID0gczAgLSB0MDtcbiAgICBidmlydCA9IHMwIC0gX2k7XG4gICAgdVswXSA9IHMwIC0gKF9pICsgYnZpcnQpICsgKGJ2aXJ0IC0gdDApO1xuICAgIF9qID0gczEgKyBfaTtcbiAgICBidmlydCA9IF9qIC0gczE7XG4gICAgXzAgPSBzMSAtIChfaiAtIGJ2aXJ0KSArIChfaSAtIGJ2aXJ0KTtcbiAgICBfaSA9IF8wIC0gdDE7XG4gICAgYnZpcnQgPSBfMCAtIF9pO1xuICAgIHVbMV0gPSBfMCAtIChfaSArIGJ2aXJ0KSArIChidmlydCAtIHQxKTtcbiAgICB1MyA9IF9qICsgX2k7XG4gICAgYnZpcnQgPSB1MyAtIF9qO1xuICAgIHVbMl0gPSBfaiAtICh1MyAtIGJ2aXJ0KSArIChfaSAtIGJ2aXJ0KTtcbiAgICB1WzNdID0gdTM7XG4gICAgY29uc3QgQzJsZW4gPSBzdW0oQzFsZW4sIEMxLCA0LCB1LCBDMik7XG5cbiAgICBzMSA9IGFjeHRhaWwgKiBiY3l0YWlsO1xuICAgIGMgPSBzcGxpdHRlciAqIGFjeHRhaWw7XG4gICAgYWhpID0gYyAtIChjIC0gYWN4dGFpbCk7XG4gICAgYWxvID0gYWN4dGFpbCAtIGFoaTtcbiAgICBjID0gc3BsaXR0ZXIgKiBiY3l0YWlsO1xuICAgIGJoaSA9IGMgLSAoYyAtIGJjeXRhaWwpO1xuICAgIGJsbyA9IGJjeXRhaWwgLSBiaGk7XG4gICAgczAgPSBhbG8gKiBibG8gLSAoczEgLSBhaGkgKiBiaGkgLSBhbG8gKiBiaGkgLSBhaGkgKiBibG8pO1xuICAgIHQxID0gYWN5dGFpbCAqIGJjeHRhaWw7XG4gICAgYyA9IHNwbGl0dGVyICogYWN5dGFpbDtcbiAgICBhaGkgPSBjIC0gKGMgLSBhY3l0YWlsKTtcbiAgICBhbG8gPSBhY3l0YWlsIC0gYWhpO1xuICAgIGMgPSBzcGxpdHRlciAqIGJjeHRhaWw7XG4gICAgYmhpID0gYyAtIChjIC0gYmN4dGFpbCk7XG4gICAgYmxvID0gYmN4dGFpbCAtIGJoaTtcbiAgICB0MCA9IGFsbyAqIGJsbyAtICh0MSAtIGFoaSAqIGJoaSAtIGFsbyAqIGJoaSAtIGFoaSAqIGJsbyk7XG4gICAgX2kgPSBzMCAtIHQwO1xuICAgIGJ2aXJ0ID0gczAgLSBfaTtcbiAgICB1WzBdID0gczAgLSAoX2kgKyBidmlydCkgKyAoYnZpcnQgLSB0MCk7XG4gICAgX2ogPSBzMSArIF9pO1xuICAgIGJ2aXJ0ID0gX2ogLSBzMTtcbiAgICBfMCA9IHMxIC0gKF9qIC0gYnZpcnQpICsgKF9pIC0gYnZpcnQpO1xuICAgIF9pID0gXzAgLSB0MTtcbiAgICBidmlydCA9IF8wIC0gX2k7XG4gICAgdVsxXSA9IF8wIC0gKF9pICsgYnZpcnQpICsgKGJ2aXJ0IC0gdDEpO1xuICAgIHUzID0gX2ogKyBfaTtcbiAgICBidmlydCA9IHUzIC0gX2o7XG4gICAgdVsyXSA9IF9qIC0gKHUzIC0gYnZpcnQpICsgKF9pIC0gYnZpcnQpO1xuICAgIHVbM10gPSB1MztcbiAgICBjb25zdCBEbGVuID0gc3VtKEMybGVuLCBDMiwgNCwgdSwgRCk7XG5cbiAgICByZXR1cm4gRFtEbGVuIC0gMV07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBvcmllbnQyZChheCwgYXksIGJ4LCBieSwgY3gsIGN5KSB7XG4gICAgY29uc3QgZGV0bGVmdCA9IChheSAtIGN5KSAqIChieCAtIGN4KTtcbiAgICBjb25zdCBkZXRyaWdodCA9IChheCAtIGN4KSAqIChieSAtIGN5KTtcbiAgICBjb25zdCBkZXQgPSBkZXRsZWZ0IC0gZGV0cmlnaHQ7XG5cbiAgICBjb25zdCBkZXRzdW0gPSBNYXRoLmFicyhkZXRsZWZ0ICsgZGV0cmlnaHQpO1xuICAgIGlmIChNYXRoLmFicyhkZXQpID49IGNjd2VycmJvdW5kQSAqIGRldHN1bSkgcmV0dXJuIGRldDtcblxuICAgIHJldHVybiAtb3JpZW50MmRhZGFwdChheCwgYXksIGJ4LCBieSwgY3gsIGN5LCBkZXRzdW0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gb3JpZW50MmRmYXN0KGF4LCBheSwgYngsIGJ5LCBjeCwgY3kpIHtcbiAgICByZXR1cm4gKGF5IC0gY3kpICogKGJ4IC0gY3gpIC0gKGF4IC0gY3gpICogKGJ5IC0gY3kpO1xufVxuIiwiaW1wb3J0IHtlcHNpbG9uLCBzcGxpdHRlciwgcmVzdWx0ZXJyYm91bmQsIGVzdGltYXRlLCB2ZWMsIHN1bSwgc2NhbGV9IGZyb20gJy4vdXRpbC5qcyc7XG5cbmNvbnN0IG8zZGVycmJvdW5kQSA9ICg3ICsgNTYgKiBlcHNpbG9uKSAqIGVwc2lsb247XG5jb25zdCBvM2RlcnJib3VuZEIgPSAoMyArIDI4ICogZXBzaWxvbikgKiBlcHNpbG9uO1xuY29uc3QgbzNkZXJyYm91bmRDID0gKDI2ICsgMjg4ICogZXBzaWxvbikgKiBlcHNpbG9uICogZXBzaWxvbjtcblxuY29uc3QgYmMgPSB2ZWMoNCk7XG5jb25zdCBjYSA9IHZlYyg0KTtcbmNvbnN0IGFiID0gdmVjKDQpO1xuY29uc3QgYXRfYiA9IHZlYyg0KTtcbmNvbnN0IGF0X2MgPSB2ZWMoNCk7XG5jb25zdCBidF9jID0gdmVjKDQpO1xuY29uc3QgYnRfYSA9IHZlYyg0KTtcbmNvbnN0IGN0X2EgPSB2ZWMoNCk7XG5jb25zdCBjdF9iID0gdmVjKDQpO1xuY29uc3QgYmN0ID0gdmVjKDgpO1xuY29uc3QgY2F0ID0gdmVjKDgpO1xuY29uc3QgYWJ0ID0gdmVjKDgpO1xuY29uc3QgdSA9IHZlYyg0KTtcblxuY29uc3QgXzggPSB2ZWMoOCk7XG5jb25zdCBfOGIgPSB2ZWMoOCk7XG5jb25zdCBfMTYgPSB2ZWMoOCk7XG5jb25zdCBfMTIgPSB2ZWMoMTIpO1xuXG5sZXQgZmluID0gdmVjKDE5Mik7XG5sZXQgZmluMiA9IHZlYygxOTIpO1xuXG5mdW5jdGlvbiBmaW5hZGQoZmlubGVuLCBhbGVuLCBhKSB7XG4gICAgZmlubGVuID0gc3VtKGZpbmxlbiwgZmluLCBhbGVuLCBhLCBmaW4yKTtcbiAgICBjb25zdCB0bXAgPSBmaW47IGZpbiA9IGZpbjI7IGZpbjIgPSB0bXA7XG4gICAgcmV0dXJuIGZpbmxlbjtcbn1cblxuZnVuY3Rpb24gdGFpbGluaXQoeHRhaWwsIHl0YWlsLCBheCwgYXksIGJ4LCBieSwgYSwgYikge1xuICAgIGxldCBidmlydCwgYywgYWhpLCBhbG8sIGJoaSwgYmxvLCBfaSwgX2osIF9rLCBfMCwgczEsIHMwLCB0MSwgdDAsIHUzLCBuZWdhdGU7XG4gICAgaWYgKHh0YWlsID09PSAwKSB7XG4gICAgICAgIGlmICh5dGFpbCA9PT0gMCkge1xuICAgICAgICAgICAgYVswXSA9IDA7XG4gICAgICAgICAgICBiWzBdID0gMDtcbiAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbmVnYXRlID0gLXl0YWlsO1xuICAgICAgICAgICAgczEgPSBuZWdhdGUgKiBheDtcbiAgICAgICAgICAgIGMgPSBzcGxpdHRlciAqIG5lZ2F0ZTtcbiAgICAgICAgICAgIGFoaSA9IGMgLSAoYyAtIG5lZ2F0ZSk7XG4gICAgICAgICAgICBhbG8gPSBuZWdhdGUgLSBhaGk7XG4gICAgICAgICAgICBjID0gc3BsaXR0ZXIgKiBheDtcbiAgICAgICAgICAgIGJoaSA9IGMgLSAoYyAtIGF4KTtcbiAgICAgICAgICAgIGJsbyA9IGF4IC0gYmhpO1xuICAgICAgICAgICAgYVswXSA9IGFsbyAqIGJsbyAtIChzMSAtIGFoaSAqIGJoaSAtIGFsbyAqIGJoaSAtIGFoaSAqIGJsbyk7XG4gICAgICAgICAgICBhWzFdID0gczE7XG4gICAgICAgICAgICBzMSA9IHl0YWlsICogYng7XG4gICAgICAgICAgICBjID0gc3BsaXR0ZXIgKiB5dGFpbDtcbiAgICAgICAgICAgIGFoaSA9IGMgLSAoYyAtIHl0YWlsKTtcbiAgICAgICAgICAgIGFsbyA9IHl0YWlsIC0gYWhpO1xuICAgICAgICAgICAgYyA9IHNwbGl0dGVyICogYng7XG4gICAgICAgICAgICBiaGkgPSBjIC0gKGMgLSBieCk7XG4gICAgICAgICAgICBibG8gPSBieCAtIGJoaTtcbiAgICAgICAgICAgIGJbMF0gPSBhbG8gKiBibG8gLSAoczEgLSBhaGkgKiBiaGkgLSBhbG8gKiBiaGkgLSBhaGkgKiBibG8pO1xuICAgICAgICAgICAgYlsxXSA9IHMxO1xuICAgICAgICAgICAgcmV0dXJuIDI7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoeXRhaWwgPT09IDApIHtcbiAgICAgICAgICAgIHMxID0geHRhaWwgKiBheTtcbiAgICAgICAgICAgIGMgPSBzcGxpdHRlciAqIHh0YWlsO1xuICAgICAgICAgICAgYWhpID0gYyAtIChjIC0geHRhaWwpO1xuICAgICAgICAgICAgYWxvID0geHRhaWwgLSBhaGk7XG4gICAgICAgICAgICBjID0gc3BsaXR0ZXIgKiBheTtcbiAgICAgICAgICAgIGJoaSA9IGMgLSAoYyAtIGF5KTtcbiAgICAgICAgICAgIGJsbyA9IGF5IC0gYmhpO1xuICAgICAgICAgICAgYVswXSA9IGFsbyAqIGJsbyAtIChzMSAtIGFoaSAqIGJoaSAtIGFsbyAqIGJoaSAtIGFoaSAqIGJsbyk7XG4gICAgICAgICAgICBhWzFdID0gczE7XG4gICAgICAgICAgICBuZWdhdGUgPSAteHRhaWw7XG4gICAgICAgICAgICBzMSA9IG5lZ2F0ZSAqIGJ5O1xuICAgICAgICAgICAgYyA9IHNwbGl0dGVyICogbmVnYXRlO1xuICAgICAgICAgICAgYWhpID0gYyAtIChjIC0gbmVnYXRlKTtcbiAgICAgICAgICAgIGFsbyA9IG5lZ2F0ZSAtIGFoaTtcbiAgICAgICAgICAgIGMgPSBzcGxpdHRlciAqIGJ5O1xuICAgICAgICAgICAgYmhpID0gYyAtIChjIC0gYnkpO1xuICAgICAgICAgICAgYmxvID0gYnkgLSBiaGk7XG4gICAgICAgICAgICBiWzBdID0gYWxvICogYmxvIC0gKHMxIC0gYWhpICogYmhpIC0gYWxvICogYmhpIC0gYWhpICogYmxvKTtcbiAgICAgICAgICAgIGJbMV0gPSBzMTtcbiAgICAgICAgICAgIHJldHVybiAyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgczEgPSB4dGFpbCAqIGF5O1xuICAgICAgICAgICAgYyA9IHNwbGl0dGVyICogeHRhaWw7XG4gICAgICAgICAgICBhaGkgPSBjIC0gKGMgLSB4dGFpbCk7XG4gICAgICAgICAgICBhbG8gPSB4dGFpbCAtIGFoaTtcbiAgICAgICAgICAgIGMgPSBzcGxpdHRlciAqIGF5O1xuICAgICAgICAgICAgYmhpID0gYyAtIChjIC0gYXkpO1xuICAgICAgICAgICAgYmxvID0gYXkgLSBiaGk7XG4gICAgICAgICAgICBzMCA9IGFsbyAqIGJsbyAtIChzMSAtIGFoaSAqIGJoaSAtIGFsbyAqIGJoaSAtIGFoaSAqIGJsbyk7XG4gICAgICAgICAgICB0MSA9IHl0YWlsICogYXg7XG4gICAgICAgICAgICBjID0gc3BsaXR0ZXIgKiB5dGFpbDtcbiAgICAgICAgICAgIGFoaSA9IGMgLSAoYyAtIHl0YWlsKTtcbiAgICAgICAgICAgIGFsbyA9IHl0YWlsIC0gYWhpO1xuICAgICAgICAgICAgYyA9IHNwbGl0dGVyICogYXg7XG4gICAgICAgICAgICBiaGkgPSBjIC0gKGMgLSBheCk7XG4gICAgICAgICAgICBibG8gPSBheCAtIGJoaTtcbiAgICAgICAgICAgIHQwID0gYWxvICogYmxvIC0gKHQxIC0gYWhpICogYmhpIC0gYWxvICogYmhpIC0gYWhpICogYmxvKTtcbiAgICAgICAgICAgIF9pID0gczAgLSB0MDtcbiAgICAgICAgICAgIGJ2aXJ0ID0gczAgLSBfaTtcbiAgICAgICAgICAgIGFbMF0gPSBzMCAtIChfaSArIGJ2aXJ0KSArIChidmlydCAtIHQwKTtcbiAgICAgICAgICAgIF9qID0gczEgKyBfaTtcbiAgICAgICAgICAgIGJ2aXJ0ID0gX2ogLSBzMTtcbiAgICAgICAgICAgIF8wID0gczEgLSAoX2ogLSBidmlydCkgKyAoX2kgLSBidmlydCk7XG4gICAgICAgICAgICBfaSA9IF8wIC0gdDE7XG4gICAgICAgICAgICBidmlydCA9IF8wIC0gX2k7XG4gICAgICAgICAgICBhWzFdID0gXzAgLSAoX2kgKyBidmlydCkgKyAoYnZpcnQgLSB0MSk7XG4gICAgICAgICAgICB1MyA9IF9qICsgX2k7XG4gICAgICAgICAgICBidmlydCA9IHUzIC0gX2o7XG4gICAgICAgICAgICBhWzJdID0gX2ogLSAodTMgLSBidmlydCkgKyAoX2kgLSBidmlydCk7XG4gICAgICAgICAgICBhWzNdID0gdTM7XG4gICAgICAgICAgICBzMSA9IHl0YWlsICogYng7XG4gICAgICAgICAgICBjID0gc3BsaXR0ZXIgKiB5dGFpbDtcbiAgICAgICAgICAgIGFoaSA9IGMgLSAoYyAtIHl0YWlsKTtcbiAgICAgICAgICAgIGFsbyA9IHl0YWlsIC0gYWhpO1xuICAgICAgICAgICAgYyA9IHNwbGl0dGVyICogYng7XG4gICAgICAgICAgICBiaGkgPSBjIC0gKGMgLSBieCk7XG4gICAgICAgICAgICBibG8gPSBieCAtIGJoaTtcbiAgICAgICAgICAgIHMwID0gYWxvICogYmxvIC0gKHMxIC0gYWhpICogYmhpIC0gYWxvICogYmhpIC0gYWhpICogYmxvKTtcbiAgICAgICAgICAgIHQxID0geHRhaWwgKiBieTtcbiAgICAgICAgICAgIGMgPSBzcGxpdHRlciAqIHh0YWlsO1xuICAgICAgICAgICAgYWhpID0gYyAtIChjIC0geHRhaWwpO1xuICAgICAgICAgICAgYWxvID0geHRhaWwgLSBhaGk7XG4gICAgICAgICAgICBjID0gc3BsaXR0ZXIgKiBieTtcbiAgICAgICAgICAgIGJoaSA9IGMgLSAoYyAtIGJ5KTtcbiAgICAgICAgICAgIGJsbyA9IGJ5IC0gYmhpO1xuICAgICAgICAgICAgdDAgPSBhbG8gKiBibG8gLSAodDEgLSBhaGkgKiBiaGkgLSBhbG8gKiBiaGkgLSBhaGkgKiBibG8pO1xuICAgICAgICAgICAgX2kgPSBzMCAtIHQwO1xuICAgICAgICAgICAgYnZpcnQgPSBzMCAtIF9pO1xuICAgICAgICAgICAgYlswXSA9IHMwIC0gKF9pICsgYnZpcnQpICsgKGJ2aXJ0IC0gdDApO1xuICAgICAgICAgICAgX2ogPSBzMSArIF9pO1xuICAgICAgICAgICAgYnZpcnQgPSBfaiAtIHMxO1xuICAgICAgICAgICAgXzAgPSBzMSAtIChfaiAtIGJ2aXJ0KSArIChfaSAtIGJ2aXJ0KTtcbiAgICAgICAgICAgIF9pID0gXzAgLSB0MTtcbiAgICAgICAgICAgIGJ2aXJ0ID0gXzAgLSBfaTtcbiAgICAgICAgICAgIGJbMV0gPSBfMCAtIChfaSArIGJ2aXJ0KSArIChidmlydCAtIHQxKTtcbiAgICAgICAgICAgIHUzID0gX2ogKyBfaTtcbiAgICAgICAgICAgIGJ2aXJ0ID0gdTMgLSBfajtcbiAgICAgICAgICAgIGJbMl0gPSBfaiAtICh1MyAtIGJ2aXJ0KSArIChfaSAtIGJ2aXJ0KTtcbiAgICAgICAgICAgIGJbM10gPSB1MztcbiAgICAgICAgICAgIHJldHVybiA0O1xuICAgICAgICB9XG4gICAgfVxufVxuXG5mdW5jdGlvbiB0YWlsYWRkKGZpbmxlbiwgYSwgYiwgaywgeikge1xuICAgIGxldCBidmlydCwgYywgYWhpLCBhbG8sIGJoaSwgYmxvLCBfaSwgX2osIF9rLCBfMCwgczEsIHMwLCB1MztcbiAgICBzMSA9IGEgKiBiO1xuICAgIGMgPSBzcGxpdHRlciAqIGE7XG4gICAgYWhpID0gYyAtIChjIC0gYSk7XG4gICAgYWxvID0gYSAtIGFoaTtcbiAgICBjID0gc3BsaXR0ZXIgKiBiO1xuICAgIGJoaSA9IGMgLSAoYyAtIGIpO1xuICAgIGJsbyA9IGIgLSBiaGk7XG4gICAgczAgPSBhbG8gKiBibG8gLSAoczEgLSBhaGkgKiBiaGkgLSBhbG8gKiBiaGkgLSBhaGkgKiBibG8pO1xuICAgIGMgPSBzcGxpdHRlciAqIGs7XG4gICAgYmhpID0gYyAtIChjIC0gayk7XG4gICAgYmxvID0gayAtIGJoaTtcbiAgICBfaSA9IHMwICogaztcbiAgICBjID0gc3BsaXR0ZXIgKiBzMDtcbiAgICBhaGkgPSBjIC0gKGMgLSBzMCk7XG4gICAgYWxvID0gczAgLSBhaGk7XG4gICAgdVswXSA9IGFsbyAqIGJsbyAtIChfaSAtIGFoaSAqIGJoaSAtIGFsbyAqIGJoaSAtIGFoaSAqIGJsbyk7XG4gICAgX2ogPSBzMSAqIGs7XG4gICAgYyA9IHNwbGl0dGVyICogczE7XG4gICAgYWhpID0gYyAtIChjIC0gczEpO1xuICAgIGFsbyA9IHMxIC0gYWhpO1xuICAgIF8wID0gYWxvICogYmxvIC0gKF9qIC0gYWhpICogYmhpIC0gYWxvICogYmhpIC0gYWhpICogYmxvKTtcbiAgICBfayA9IF9pICsgXzA7XG4gICAgYnZpcnQgPSBfayAtIF9pO1xuICAgIHVbMV0gPSBfaSAtIChfayAtIGJ2aXJ0KSArIChfMCAtIGJ2aXJ0KTtcbiAgICB1MyA9IF9qICsgX2s7XG4gICAgdVsyXSA9IF9rIC0gKHUzIC0gX2opO1xuICAgIHVbM10gPSB1MztcbiAgICBmaW5sZW4gPSBmaW5hZGQoZmlubGVuLCA0LCB1KTtcbiAgICBpZiAoeiAhPT0gMCkge1xuICAgICAgICBjID0gc3BsaXR0ZXIgKiB6O1xuICAgICAgICBiaGkgPSBjIC0gKGMgLSB6KTtcbiAgICAgICAgYmxvID0geiAtIGJoaTtcbiAgICAgICAgX2kgPSBzMCAqIHo7XG4gICAgICAgIGMgPSBzcGxpdHRlciAqIHMwO1xuICAgICAgICBhaGkgPSBjIC0gKGMgLSBzMCk7XG4gICAgICAgIGFsbyA9IHMwIC0gYWhpO1xuICAgICAgICB1WzBdID0gYWxvICogYmxvIC0gKF9pIC0gYWhpICogYmhpIC0gYWxvICogYmhpIC0gYWhpICogYmxvKTtcbiAgICAgICAgX2ogPSBzMSAqIHo7XG4gICAgICAgIGMgPSBzcGxpdHRlciAqIHMxO1xuICAgICAgICBhaGkgPSBjIC0gKGMgLSBzMSk7XG4gICAgICAgIGFsbyA9IHMxIC0gYWhpO1xuICAgICAgICBfMCA9IGFsbyAqIGJsbyAtIChfaiAtIGFoaSAqIGJoaSAtIGFsbyAqIGJoaSAtIGFoaSAqIGJsbyk7XG4gICAgICAgIF9rID0gX2kgKyBfMDtcbiAgICAgICAgYnZpcnQgPSBfayAtIF9pO1xuICAgICAgICB1WzFdID0gX2kgLSAoX2sgLSBidmlydCkgKyAoXzAgLSBidmlydCk7XG4gICAgICAgIHUzID0gX2ogKyBfaztcbiAgICAgICAgdVsyXSA9IF9rIC0gKHUzIC0gX2opO1xuICAgICAgICB1WzNdID0gdTM7XG4gICAgICAgIGZpbmxlbiA9IGZpbmFkZChmaW5sZW4sIDQsIHUpO1xuICAgIH1cbiAgICByZXR1cm4gZmlubGVuO1xufVxuXG5mdW5jdGlvbiBvcmllbnQzZGFkYXB0KGF4LCBheSwgYXosIGJ4LCBieSwgYnosIGN4LCBjeSwgY3osIGR4LCBkeSwgZHosIHBlcm1hbmVudCkge1xuICAgIGxldCBmaW5sZW47XG4gICAgbGV0IGFkeHRhaWwsIGJkeHRhaWwsIGNkeHRhaWw7XG4gICAgbGV0IGFkeXRhaWwsIGJkeXRhaWwsIGNkeXRhaWw7XG4gICAgbGV0IGFkenRhaWwsIGJkenRhaWwsIGNkenRhaWw7XG4gICAgbGV0IGJ2aXJ0LCBjLCBhaGksIGFsbywgYmhpLCBibG8sIF9pLCBfaiwgX2ssIF8wLCBzMSwgczAsIHQxLCB0MCwgdTM7XG5cbiAgICBjb25zdCBhZHggPSBheCAtIGR4O1xuICAgIGNvbnN0IGJkeCA9IGJ4IC0gZHg7XG4gICAgY29uc3QgY2R4ID0gY3ggLSBkeDtcbiAgICBjb25zdCBhZHkgPSBheSAtIGR5O1xuICAgIGNvbnN0IGJkeSA9IGJ5IC0gZHk7XG4gICAgY29uc3QgY2R5ID0gY3kgLSBkeTtcbiAgICBjb25zdCBhZHogPSBheiAtIGR6O1xuICAgIGNvbnN0IGJkeiA9IGJ6IC0gZHo7XG4gICAgY29uc3QgY2R6ID0gY3ogLSBkejtcblxuICAgIHMxID0gYmR4ICogY2R5O1xuICAgIGMgPSBzcGxpdHRlciAqIGJkeDtcbiAgICBhaGkgPSBjIC0gKGMgLSBiZHgpO1xuICAgIGFsbyA9IGJkeCAtIGFoaTtcbiAgICBjID0gc3BsaXR0ZXIgKiBjZHk7XG4gICAgYmhpID0gYyAtIChjIC0gY2R5KTtcbiAgICBibG8gPSBjZHkgLSBiaGk7XG4gICAgczAgPSBhbG8gKiBibG8gLSAoczEgLSBhaGkgKiBiaGkgLSBhbG8gKiBiaGkgLSBhaGkgKiBibG8pO1xuICAgIHQxID0gY2R4ICogYmR5O1xuICAgIGMgPSBzcGxpdHRlciAqIGNkeDtcbiAgICBhaGkgPSBjIC0gKGMgLSBjZHgpO1xuICAgIGFsbyA9IGNkeCAtIGFoaTtcbiAgICBjID0gc3BsaXR0ZXIgKiBiZHk7XG4gICAgYmhpID0gYyAtIChjIC0gYmR5KTtcbiAgICBibG8gPSBiZHkgLSBiaGk7XG4gICAgdDAgPSBhbG8gKiBibG8gLSAodDEgLSBhaGkgKiBiaGkgLSBhbG8gKiBiaGkgLSBhaGkgKiBibG8pO1xuICAgIF9pID0gczAgLSB0MDtcbiAgICBidmlydCA9IHMwIC0gX2k7XG4gICAgYmNbMF0gPSBzMCAtIChfaSArIGJ2aXJ0KSArIChidmlydCAtIHQwKTtcbiAgICBfaiA9IHMxICsgX2k7XG4gICAgYnZpcnQgPSBfaiAtIHMxO1xuICAgIF8wID0gczEgLSAoX2ogLSBidmlydCkgKyAoX2kgLSBidmlydCk7XG4gICAgX2kgPSBfMCAtIHQxO1xuICAgIGJ2aXJ0ID0gXzAgLSBfaTtcbiAgICBiY1sxXSA9IF8wIC0gKF9pICsgYnZpcnQpICsgKGJ2aXJ0IC0gdDEpO1xuICAgIHUzID0gX2ogKyBfaTtcbiAgICBidmlydCA9IHUzIC0gX2o7XG4gICAgYmNbMl0gPSBfaiAtICh1MyAtIGJ2aXJ0KSArIChfaSAtIGJ2aXJ0KTtcbiAgICBiY1szXSA9IHUzO1xuICAgIHMxID0gY2R4ICogYWR5O1xuICAgIGMgPSBzcGxpdHRlciAqIGNkeDtcbiAgICBhaGkgPSBjIC0gKGMgLSBjZHgpO1xuICAgIGFsbyA9IGNkeCAtIGFoaTtcbiAgICBjID0gc3BsaXR0ZXIgKiBhZHk7XG4gICAgYmhpID0gYyAtIChjIC0gYWR5KTtcbiAgICBibG8gPSBhZHkgLSBiaGk7XG4gICAgczAgPSBhbG8gKiBibG8gLSAoczEgLSBhaGkgKiBiaGkgLSBhbG8gKiBiaGkgLSBhaGkgKiBibG8pO1xuICAgIHQxID0gYWR4ICogY2R5O1xuICAgIGMgPSBzcGxpdHRlciAqIGFkeDtcbiAgICBhaGkgPSBjIC0gKGMgLSBhZHgpO1xuICAgIGFsbyA9IGFkeCAtIGFoaTtcbiAgICBjID0gc3BsaXR0ZXIgKiBjZHk7XG4gICAgYmhpID0gYyAtIChjIC0gY2R5KTtcbiAgICBibG8gPSBjZHkgLSBiaGk7XG4gICAgdDAgPSBhbG8gKiBibG8gLSAodDEgLSBhaGkgKiBiaGkgLSBhbG8gKiBiaGkgLSBhaGkgKiBibG8pO1xuICAgIF9pID0gczAgLSB0MDtcbiAgICBidmlydCA9IHMwIC0gX2k7XG4gICAgY2FbMF0gPSBzMCAtIChfaSArIGJ2aXJ0KSArIChidmlydCAtIHQwKTtcbiAgICBfaiA9IHMxICsgX2k7XG4gICAgYnZpcnQgPSBfaiAtIHMxO1xuICAgIF8wID0gczEgLSAoX2ogLSBidmlydCkgKyAoX2kgLSBidmlydCk7XG4gICAgX2kgPSBfMCAtIHQxO1xuICAgIGJ2aXJ0ID0gXzAgLSBfaTtcbiAgICBjYVsxXSA9IF8wIC0gKF9pICsgYnZpcnQpICsgKGJ2aXJ0IC0gdDEpO1xuICAgIHUzID0gX2ogKyBfaTtcbiAgICBidmlydCA9IHUzIC0gX2o7XG4gICAgY2FbMl0gPSBfaiAtICh1MyAtIGJ2aXJ0KSArIChfaSAtIGJ2aXJ0KTtcbiAgICBjYVszXSA9IHUzO1xuICAgIHMxID0gYWR4ICogYmR5O1xuICAgIGMgPSBzcGxpdHRlciAqIGFkeDtcbiAgICBhaGkgPSBjIC0gKGMgLSBhZHgpO1xuICAgIGFsbyA9IGFkeCAtIGFoaTtcbiAgICBjID0gc3BsaXR0ZXIgKiBiZHk7XG4gICAgYmhpID0gYyAtIChjIC0gYmR5KTtcbiAgICBibG8gPSBiZHkgLSBiaGk7XG4gICAgczAgPSBhbG8gKiBibG8gLSAoczEgLSBhaGkgKiBiaGkgLSBhbG8gKiBiaGkgLSBhaGkgKiBibG8pO1xuICAgIHQxID0gYmR4ICogYWR5O1xuICAgIGMgPSBzcGxpdHRlciAqIGJkeDtcbiAgICBhaGkgPSBjIC0gKGMgLSBiZHgpO1xuICAgIGFsbyA9IGJkeCAtIGFoaTtcbiAgICBjID0gc3BsaXR0ZXIgKiBhZHk7XG4gICAgYmhpID0gYyAtIChjIC0gYWR5KTtcbiAgICBibG8gPSBhZHkgLSBiaGk7XG4gICAgdDAgPSBhbG8gKiBibG8gLSAodDEgLSBhaGkgKiBiaGkgLSBhbG8gKiBiaGkgLSBhaGkgKiBibG8pO1xuICAgIF9pID0gczAgLSB0MDtcbiAgICBidmlydCA9IHMwIC0gX2k7XG4gICAgYWJbMF0gPSBzMCAtIChfaSArIGJ2aXJ0KSArIChidmlydCAtIHQwKTtcbiAgICBfaiA9IHMxICsgX2k7XG4gICAgYnZpcnQgPSBfaiAtIHMxO1xuICAgIF8wID0gczEgLSAoX2ogLSBidmlydCkgKyAoX2kgLSBidmlydCk7XG4gICAgX2kgPSBfMCAtIHQxO1xuICAgIGJ2aXJ0ID0gXzAgLSBfaTtcbiAgICBhYlsxXSA9IF8wIC0gKF9pICsgYnZpcnQpICsgKGJ2aXJ0IC0gdDEpO1xuICAgIHUzID0gX2ogKyBfaTtcbiAgICBidmlydCA9IHUzIC0gX2o7XG4gICAgYWJbMl0gPSBfaiAtICh1MyAtIGJ2aXJ0KSArIChfaSAtIGJ2aXJ0KTtcbiAgICBhYlszXSA9IHUzO1xuXG4gICAgZmlubGVuID0gc3VtKFxuICAgICAgICBzdW0oXG4gICAgICAgICAgICBzY2FsZSg0LCBiYywgYWR6LCBfOCksIF84LFxuICAgICAgICAgICAgc2NhbGUoNCwgY2EsIGJkeiwgXzhiKSwgXzhiLCBfMTYpLCBfMTYsXG4gICAgICAgIHNjYWxlKDQsIGFiLCBjZHosIF84KSwgXzgsIGZpbik7XG5cbiAgICBsZXQgZGV0ID0gZXN0aW1hdGUoZmlubGVuLCBmaW4pO1xuICAgIGxldCBlcnJib3VuZCA9IG8zZGVycmJvdW5kQiAqIHBlcm1hbmVudDtcbiAgICBpZiAoZGV0ID49IGVycmJvdW5kIHx8IC1kZXQgPj0gZXJyYm91bmQpIHtcbiAgICAgICAgcmV0dXJuIGRldDtcbiAgICB9XG5cbiAgICBidmlydCA9IGF4IC0gYWR4O1xuICAgIGFkeHRhaWwgPSBheCAtIChhZHggKyBidmlydCkgKyAoYnZpcnQgLSBkeCk7XG4gICAgYnZpcnQgPSBieCAtIGJkeDtcbiAgICBiZHh0YWlsID0gYnggLSAoYmR4ICsgYnZpcnQpICsgKGJ2aXJ0IC0gZHgpO1xuICAgIGJ2aXJ0ID0gY3ggLSBjZHg7XG4gICAgY2R4dGFpbCA9IGN4IC0gKGNkeCArIGJ2aXJ0KSArIChidmlydCAtIGR4KTtcbiAgICBidmlydCA9IGF5IC0gYWR5O1xuICAgIGFkeXRhaWwgPSBheSAtIChhZHkgKyBidmlydCkgKyAoYnZpcnQgLSBkeSk7XG4gICAgYnZpcnQgPSBieSAtIGJkeTtcbiAgICBiZHl0YWlsID0gYnkgLSAoYmR5ICsgYnZpcnQpICsgKGJ2aXJ0IC0gZHkpO1xuICAgIGJ2aXJ0ID0gY3kgLSBjZHk7XG4gICAgY2R5dGFpbCA9IGN5IC0gKGNkeSArIGJ2aXJ0KSArIChidmlydCAtIGR5KTtcbiAgICBidmlydCA9IGF6IC0gYWR6O1xuICAgIGFkenRhaWwgPSBheiAtIChhZHogKyBidmlydCkgKyAoYnZpcnQgLSBkeik7XG4gICAgYnZpcnQgPSBieiAtIGJkejtcbiAgICBiZHp0YWlsID0gYnogLSAoYmR6ICsgYnZpcnQpICsgKGJ2aXJ0IC0gZHopO1xuICAgIGJ2aXJ0ID0gY3ogLSBjZHo7XG4gICAgY2R6dGFpbCA9IGN6IC0gKGNkeiArIGJ2aXJ0KSArIChidmlydCAtIGR6KTtcblxuICAgIGlmIChhZHh0YWlsID09PSAwICYmIGJkeHRhaWwgPT09IDAgJiYgY2R4dGFpbCA9PT0gMCAmJlxuICAgICAgICBhZHl0YWlsID09PSAwICYmIGJkeXRhaWwgPT09IDAgJiYgY2R5dGFpbCA9PT0gMCAmJlxuICAgICAgICBhZHp0YWlsID09PSAwICYmIGJkenRhaWwgPT09IDAgJiYgY2R6dGFpbCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gZGV0O1xuICAgIH1cblxuICAgIGVycmJvdW5kID0gbzNkZXJyYm91bmRDICogcGVybWFuZW50ICsgcmVzdWx0ZXJyYm91bmQgKiBNYXRoLmFicyhkZXQpO1xuICAgIGRldCArPVxuICAgICAgICBhZHogKiAoYmR4ICogY2R5dGFpbCArIGNkeSAqIGJkeHRhaWwgLSAoYmR5ICogY2R4dGFpbCArIGNkeCAqIGJkeXRhaWwpKSArIGFkenRhaWwgKiAoYmR4ICogY2R5IC0gYmR5ICogY2R4KSArXG4gICAgICAgIGJkeiAqIChjZHggKiBhZHl0YWlsICsgYWR5ICogY2R4dGFpbCAtIChjZHkgKiBhZHh0YWlsICsgYWR4ICogY2R5dGFpbCkpICsgYmR6dGFpbCAqIChjZHggKiBhZHkgLSBjZHkgKiBhZHgpICtcbiAgICAgICAgY2R6ICogKGFkeCAqIGJkeXRhaWwgKyBiZHkgKiBhZHh0YWlsIC0gKGFkeSAqIGJkeHRhaWwgKyBiZHggKiBhZHl0YWlsKSkgKyBjZHp0YWlsICogKGFkeCAqIGJkeSAtIGFkeSAqIGJkeCk7XG4gICAgaWYgKGRldCA+PSBlcnJib3VuZCB8fCAtZGV0ID49IGVycmJvdW5kKSB7XG4gICAgICAgIHJldHVybiBkZXQ7XG4gICAgfVxuXG4gICAgY29uc3QgYXRfbGVuID0gdGFpbGluaXQoYWR4dGFpbCwgYWR5dGFpbCwgYmR4LCBiZHksIGNkeCwgY2R5LCBhdF9iLCBhdF9jKTtcbiAgICBjb25zdCBidF9sZW4gPSB0YWlsaW5pdChiZHh0YWlsLCBiZHl0YWlsLCBjZHgsIGNkeSwgYWR4LCBhZHksIGJ0X2MsIGJ0X2EpO1xuICAgIGNvbnN0IGN0X2xlbiA9IHRhaWxpbml0KGNkeHRhaWwsIGNkeXRhaWwsIGFkeCwgYWR5LCBiZHgsIGJkeSwgY3RfYSwgY3RfYik7XG5cbiAgICBjb25zdCBiY3RsZW4gPSBzdW0oYnRfbGVuLCBidF9jLCBjdF9sZW4sIGN0X2IsIGJjdCk7XG4gICAgZmlubGVuID0gZmluYWRkKGZpbmxlbiwgc2NhbGUoYmN0bGVuLCBiY3QsIGFkeiwgXzE2KSwgXzE2KTtcblxuICAgIGNvbnN0IGNhdGxlbiA9IHN1bShjdF9sZW4sIGN0X2EsIGF0X2xlbiwgYXRfYywgY2F0KTtcbiAgICBmaW5sZW4gPSBmaW5hZGQoZmlubGVuLCBzY2FsZShjYXRsZW4sIGNhdCwgYmR6LCBfMTYpLCBfMTYpO1xuXG4gICAgY29uc3QgYWJ0bGVuID0gc3VtKGF0X2xlbiwgYXRfYiwgYnRfbGVuLCBidF9hLCBhYnQpO1xuICAgIGZpbmxlbiA9IGZpbmFkZChmaW5sZW4sIHNjYWxlKGFidGxlbiwgYWJ0LCBjZHosIF8xNiksIF8xNik7XG5cbiAgICBpZiAoYWR6dGFpbCAhPT0gMCkge1xuICAgICAgICBmaW5sZW4gPSBmaW5hZGQoZmlubGVuLCBzY2FsZSg0LCBiYywgYWR6dGFpbCwgXzEyKSwgXzEyKTtcbiAgICAgICAgZmlubGVuID0gZmluYWRkKGZpbmxlbiwgc2NhbGUoYmN0bGVuLCBiY3QsIGFkenRhaWwsIF8xNiksIF8xNik7XG4gICAgfVxuICAgIGlmIChiZHp0YWlsICE9PSAwKSB7XG4gICAgICAgIGZpbmxlbiA9IGZpbmFkZChmaW5sZW4sIHNjYWxlKDQsIGNhLCBiZHp0YWlsLCBfMTIpLCBfMTIpO1xuICAgICAgICBmaW5sZW4gPSBmaW5hZGQoZmlubGVuLCBzY2FsZShjYXRsZW4sIGNhdCwgYmR6dGFpbCwgXzE2KSwgXzE2KTtcbiAgICB9XG4gICAgaWYgKGNkenRhaWwgIT09IDApIHtcbiAgICAgICAgZmlubGVuID0gZmluYWRkKGZpbmxlbiwgc2NhbGUoNCwgYWIsIGNkenRhaWwsIF8xMiksIF8xMik7XG4gICAgICAgIGZpbmxlbiA9IGZpbmFkZChmaW5sZW4sIHNjYWxlKGFidGxlbiwgYWJ0LCBjZHp0YWlsLCBfMTYpLCBfMTYpO1xuICAgIH1cblxuICAgIGlmIChhZHh0YWlsICE9PSAwKSB7XG4gICAgICAgIGlmIChiZHl0YWlsICE9PSAwKSB7XG4gICAgICAgICAgICBmaW5sZW4gPSB0YWlsYWRkKGZpbmxlbiwgYWR4dGFpbCwgYmR5dGFpbCwgY2R6LCBjZHp0YWlsKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoY2R5dGFpbCAhPT0gMCkge1xuICAgICAgICAgICAgZmlubGVuID0gdGFpbGFkZChmaW5sZW4sIC1hZHh0YWlsLCBjZHl0YWlsLCBiZHosIGJkenRhaWwpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChiZHh0YWlsICE9PSAwKSB7XG4gICAgICAgIGlmIChjZHl0YWlsICE9PSAwKSB7XG4gICAgICAgICAgICBmaW5sZW4gPSB0YWlsYWRkKGZpbmxlbiwgYmR4dGFpbCwgY2R5dGFpbCwgYWR6LCBhZHp0YWlsKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYWR5dGFpbCAhPT0gMCkge1xuICAgICAgICAgICAgZmlubGVuID0gdGFpbGFkZChmaW5sZW4sIC1iZHh0YWlsLCBhZHl0YWlsLCBjZHosIGNkenRhaWwpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChjZHh0YWlsICE9PSAwKSB7XG4gICAgICAgIGlmIChhZHl0YWlsICE9PSAwKSB7XG4gICAgICAgICAgICBmaW5sZW4gPSB0YWlsYWRkKGZpbmxlbiwgY2R4dGFpbCwgYWR5dGFpbCwgYmR6LCBiZHp0YWlsKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYmR5dGFpbCAhPT0gMCkge1xuICAgICAgICAgICAgZmlubGVuID0gdGFpbGFkZChmaW5sZW4sIC1jZHh0YWlsLCBiZHl0YWlsLCBhZHosIGFkenRhaWwpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZpbltmaW5sZW4gLSAxXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9yaWVudDNkKGF4LCBheSwgYXosIGJ4LCBieSwgYnosIGN4LCBjeSwgY3osIGR4LCBkeSwgZHopIHtcbiAgICBjb25zdCBhZHggPSBheCAtIGR4O1xuICAgIGNvbnN0IGJkeCA9IGJ4IC0gZHg7XG4gICAgY29uc3QgY2R4ID0gY3ggLSBkeDtcbiAgICBjb25zdCBhZHkgPSBheSAtIGR5O1xuICAgIGNvbnN0IGJkeSA9IGJ5IC0gZHk7XG4gICAgY29uc3QgY2R5ID0gY3kgLSBkeTtcbiAgICBjb25zdCBhZHogPSBheiAtIGR6O1xuICAgIGNvbnN0IGJkeiA9IGJ6IC0gZHo7XG4gICAgY29uc3QgY2R6ID0gY3ogLSBkejtcblxuICAgIGNvbnN0IGJkeGNkeSA9IGJkeCAqIGNkeTtcbiAgICBjb25zdCBjZHhiZHkgPSBjZHggKiBiZHk7XG5cbiAgICBjb25zdCBjZHhhZHkgPSBjZHggKiBhZHk7XG4gICAgY29uc3QgYWR4Y2R5ID0gYWR4ICogY2R5O1xuXG4gICAgY29uc3QgYWR4YmR5ID0gYWR4ICogYmR5O1xuICAgIGNvbnN0IGJkeGFkeSA9IGJkeCAqIGFkeTtcblxuICAgIGNvbnN0IGRldCA9XG4gICAgICAgIGFkeiAqIChiZHhjZHkgLSBjZHhiZHkpICtcbiAgICAgICAgYmR6ICogKGNkeGFkeSAtIGFkeGNkeSkgK1xuICAgICAgICBjZHogKiAoYWR4YmR5IC0gYmR4YWR5KTtcblxuICAgIGNvbnN0IHBlcm1hbmVudCA9XG4gICAgICAgIChNYXRoLmFicyhiZHhjZHkpICsgTWF0aC5hYnMoY2R4YmR5KSkgKiBNYXRoLmFicyhhZHopICtcbiAgICAgICAgKE1hdGguYWJzKGNkeGFkeSkgKyBNYXRoLmFicyhhZHhjZHkpKSAqIE1hdGguYWJzKGJkeikgK1xuICAgICAgICAoTWF0aC5hYnMoYWR4YmR5KSArIE1hdGguYWJzKGJkeGFkeSkpICogTWF0aC5hYnMoY2R6KTtcblxuICAgIGNvbnN0IGVycmJvdW5kID0gbzNkZXJyYm91bmRBICogcGVybWFuZW50O1xuICAgIGlmIChkZXQgPiBlcnJib3VuZCB8fCAtZGV0ID4gZXJyYm91bmQpIHtcbiAgICAgICAgcmV0dXJuIGRldDtcbiAgICB9XG5cbiAgICByZXR1cm4gb3JpZW50M2RhZGFwdChheCwgYXksIGF6LCBieCwgYnksIGJ6LCBjeCwgY3ksIGN6LCBkeCwgZHksIGR6LCBwZXJtYW5lbnQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gb3JpZW50M2RmYXN0KGF4LCBheSwgYXosIGJ4LCBieSwgYnosIGN4LCBjeSwgY3osIGR4LCBkeSwgZHopIHtcbiAgICBjb25zdCBhZHggPSBheCAtIGR4O1xuICAgIGNvbnN0IGJkeCA9IGJ4IC0gZHg7XG4gICAgY29uc3QgY2R4ID0gY3ggLSBkeDtcbiAgICBjb25zdCBhZHkgPSBheSAtIGR5O1xuICAgIGNvbnN0IGJkeSA9IGJ5IC0gZHk7XG4gICAgY29uc3QgY2R5ID0gY3kgLSBkeTtcbiAgICBjb25zdCBhZHogPSBheiAtIGR6O1xuICAgIGNvbnN0IGJkeiA9IGJ6IC0gZHo7XG4gICAgY29uc3QgY2R6ID0gY3ogLSBkejtcblxuICAgIHJldHVybiBhZHggKiAoYmR5ICogY2R6IC0gYmR6ICogY2R5KSArXG4gICAgICAgIGJkeCAqIChjZHkgKiBhZHogLSBjZHogKiBhZHkpICtcbiAgICAgICAgY2R4ICogKGFkeSAqIGJkeiAtIGFkeiAqIGJkeSk7XG59XG4iLCJleHBvcnQgY29uc3QgZXBzaWxvbiA9IDEuMTEwMjIzMDI0NjI1MTU2NWUtMTY7XG5leHBvcnQgY29uc3Qgc3BsaXR0ZXIgPSAxMzQyMTc3Mjk7XG5leHBvcnQgY29uc3QgcmVzdWx0ZXJyYm91bmQgPSAoMyArIDggKiBlcHNpbG9uKSAqIGVwc2lsb247XG5cbi8vIGZhc3RfZXhwYW5zaW9uX3N1bV96ZXJvZWxpbSByb3V0aW5lIGZyb20gb3JpdGluYWwgY29kZVxuZXhwb3J0IGZ1bmN0aW9uIHN1bShlbGVuLCBlLCBmbGVuLCBmLCBoKSB7XG4gICAgbGV0IFEsIFFuZXcsIGhoLCBidmlydDtcbiAgICBsZXQgZW5vdyA9IGVbMF07XG4gICAgbGV0IGZub3cgPSBmWzBdO1xuICAgIGxldCBlaW5kZXggPSAwO1xuICAgIGxldCBmaW5kZXggPSAwO1xuICAgIGlmICgoZm5vdyA+IGVub3cpID09PSAoZm5vdyA+IC1lbm93KSkge1xuICAgICAgICBRID0gZW5vdztcbiAgICAgICAgZW5vdyA9IGVbKytlaW5kZXhdO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIFEgPSBmbm93O1xuICAgICAgICBmbm93ID0gZlsrK2ZpbmRleF07XG4gICAgfVxuICAgIGxldCBoaW5kZXggPSAwO1xuICAgIGlmIChlaW5kZXggPCBlbGVuICYmIGZpbmRleCA8IGZsZW4pIHtcbiAgICAgICAgaWYgKChmbm93ID4gZW5vdykgPT09IChmbm93ID4gLWVub3cpKSB7XG4gICAgICAgICAgICBRbmV3ID0gZW5vdyArIFE7XG4gICAgICAgICAgICBoaCA9IFEgLSAoUW5ldyAtIGVub3cpO1xuICAgICAgICAgICAgZW5vdyA9IGVbKytlaW5kZXhdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgUW5ldyA9IGZub3cgKyBRO1xuICAgICAgICAgICAgaGggPSBRIC0gKFFuZXcgLSBmbm93KTtcbiAgICAgICAgICAgIGZub3cgPSBmWysrZmluZGV4XTtcbiAgICAgICAgfVxuICAgICAgICBRID0gUW5ldztcbiAgICAgICAgaWYgKGhoICE9PSAwKSB7XG4gICAgICAgICAgICBoW2hpbmRleCsrXSA9IGhoO1xuICAgICAgICB9XG4gICAgICAgIHdoaWxlIChlaW5kZXggPCBlbGVuICYmIGZpbmRleCA8IGZsZW4pIHtcbiAgICAgICAgICAgIGlmICgoZm5vdyA+IGVub3cpID09PSAoZm5vdyA+IC1lbm93KSkge1xuICAgICAgICAgICAgICAgIFFuZXcgPSBRICsgZW5vdztcbiAgICAgICAgICAgICAgICBidmlydCA9IFFuZXcgLSBRO1xuICAgICAgICAgICAgICAgIGhoID0gUSAtIChRbmV3IC0gYnZpcnQpICsgKGVub3cgLSBidmlydCk7XG4gICAgICAgICAgICAgICAgZW5vdyA9IGVbKytlaW5kZXhdO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBRbmV3ID0gUSArIGZub3c7XG4gICAgICAgICAgICAgICAgYnZpcnQgPSBRbmV3IC0gUTtcbiAgICAgICAgICAgICAgICBoaCA9IFEgLSAoUW5ldyAtIGJ2aXJ0KSArIChmbm93IC0gYnZpcnQpO1xuICAgICAgICAgICAgICAgIGZub3cgPSBmWysrZmluZGV4XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFEgPSBRbmV3O1xuICAgICAgICAgICAgaWYgKGhoICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgaFtoaW5kZXgrK10gPSBoaDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICB3aGlsZSAoZWluZGV4IDwgZWxlbikge1xuICAgICAgICBRbmV3ID0gUSArIGVub3c7XG4gICAgICAgIGJ2aXJ0ID0gUW5ldyAtIFE7XG4gICAgICAgIGhoID0gUSAtIChRbmV3IC0gYnZpcnQpICsgKGVub3cgLSBidmlydCk7XG4gICAgICAgIGVub3cgPSBlWysrZWluZGV4XTtcbiAgICAgICAgUSA9IFFuZXc7XG4gICAgICAgIGlmIChoaCAhPT0gMCkge1xuICAgICAgICAgICAgaFtoaW5kZXgrK10gPSBoaDtcbiAgICAgICAgfVxuICAgIH1cbiAgICB3aGlsZSAoZmluZGV4IDwgZmxlbikge1xuICAgICAgICBRbmV3ID0gUSArIGZub3c7XG4gICAgICAgIGJ2aXJ0ID0gUW5ldyAtIFE7XG4gICAgICAgIGhoID0gUSAtIChRbmV3IC0gYnZpcnQpICsgKGZub3cgLSBidmlydCk7XG4gICAgICAgIGZub3cgPSBmWysrZmluZGV4XTtcbiAgICAgICAgUSA9IFFuZXc7XG4gICAgICAgIGlmIChoaCAhPT0gMCkge1xuICAgICAgICAgICAgaFtoaW5kZXgrK10gPSBoaDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoUSAhPT0gMCB8fCBoaW5kZXggPT09IDApIHtcbiAgICAgICAgaFtoaW5kZXgrK10gPSBRO1xuICAgIH1cbiAgICByZXR1cm4gaGluZGV4O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3VtX3RocmVlKGFsZW4sIGEsIGJsZW4sIGIsIGNsZW4sIGMsIHRtcCwgb3V0KSB7XG4gICAgcmV0dXJuIHN1bShzdW0oYWxlbiwgYSwgYmxlbiwgYiwgdG1wKSwgdG1wLCBjbGVuLCBjLCBvdXQpO1xufVxuXG4vLyBzY2FsZV9leHBhbnNpb25femVyb2VsaW0gcm91dGluZSBmcm9tIG9yaXRpbmFsIGNvZGVcbmV4cG9ydCBmdW5jdGlvbiBzY2FsZShlbGVuLCBlLCBiLCBoKSB7XG4gICAgbGV0IFEsIHN1bSwgaGgsIHByb2R1Y3QxLCBwcm9kdWN0MDtcbiAgICBsZXQgYnZpcnQsIGMsIGFoaSwgYWxvLCBiaGksIGJsbztcblxuICAgIGMgPSBzcGxpdHRlciAqIGI7XG4gICAgYmhpID0gYyAtIChjIC0gYik7XG4gICAgYmxvID0gYiAtIGJoaTtcbiAgICBsZXQgZW5vdyA9IGVbMF07XG4gICAgUSA9IGVub3cgKiBiO1xuICAgIGMgPSBzcGxpdHRlciAqIGVub3c7XG4gICAgYWhpID0gYyAtIChjIC0gZW5vdyk7XG4gICAgYWxvID0gZW5vdyAtIGFoaTtcbiAgICBoaCA9IGFsbyAqIGJsbyAtIChRIC0gYWhpICogYmhpIC0gYWxvICogYmhpIC0gYWhpICogYmxvKTtcbiAgICBsZXQgaGluZGV4ID0gMDtcbiAgICBpZiAoaGggIT09IDApIHtcbiAgICAgICAgaFtoaW5kZXgrK10gPSBoaDtcbiAgICB9XG4gICAgZm9yIChsZXQgaSA9IDE7IGkgPCBlbGVuOyBpKyspIHtcbiAgICAgICAgZW5vdyA9IGVbaV07XG4gICAgICAgIHByb2R1Y3QxID0gZW5vdyAqIGI7XG4gICAgICAgIGMgPSBzcGxpdHRlciAqIGVub3c7XG4gICAgICAgIGFoaSA9IGMgLSAoYyAtIGVub3cpO1xuICAgICAgICBhbG8gPSBlbm93IC0gYWhpO1xuICAgICAgICBwcm9kdWN0MCA9IGFsbyAqIGJsbyAtIChwcm9kdWN0MSAtIGFoaSAqIGJoaSAtIGFsbyAqIGJoaSAtIGFoaSAqIGJsbyk7XG4gICAgICAgIHN1bSA9IFEgKyBwcm9kdWN0MDtcbiAgICAgICAgYnZpcnQgPSBzdW0gLSBRO1xuICAgICAgICBoaCA9IFEgLSAoc3VtIC0gYnZpcnQpICsgKHByb2R1Y3QwIC0gYnZpcnQpO1xuICAgICAgICBpZiAoaGggIT09IDApIHtcbiAgICAgICAgICAgIGhbaGluZGV4KytdID0gaGg7XG4gICAgICAgIH1cbiAgICAgICAgUSA9IHByb2R1Y3QxICsgc3VtO1xuICAgICAgICBoaCA9IHN1bSAtIChRIC0gcHJvZHVjdDEpO1xuICAgICAgICBpZiAoaGggIT09IDApIHtcbiAgICAgICAgICAgIGhbaGluZGV4KytdID0gaGg7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKFEgIT09IDAgfHwgaGluZGV4ID09PSAwKSB7XG4gICAgICAgIGhbaGluZGV4KytdID0gUTtcbiAgICB9XG4gICAgcmV0dXJuIGhpbmRleDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5lZ2F0ZShlbGVuLCBlKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBlbGVuOyBpKyspIGVbaV0gPSAtZVtpXTtcbiAgICByZXR1cm4gZWxlbjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVzdGltYXRlKGVsZW4sIGUpIHtcbiAgICBsZXQgUSA9IGVbMF07XG4gICAgZm9yIChsZXQgaSA9IDE7IGkgPCBlbGVuOyBpKyspIFEgKz0gZVtpXTtcbiAgICByZXR1cm4gUTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHZlYyhuKSB7XG4gICAgcmV0dXJuIG5ldyBGbG9hdDY0QXJyYXkobik7XG59XG4iLCJcbmV4cG9ydCB7b3JpZW50MmQsIG9yaWVudDJkZmFzdH0gZnJvbSAnLi9lc20vb3JpZW50MmQuanMnO1xuZXhwb3J0IHtvcmllbnQzZCwgb3JpZW50M2RmYXN0fSBmcm9tICcuL2VzbS9vcmllbnQzZC5qcyc7XG5leHBvcnQge2luY2lyY2xlLCBpbmNpcmNsZWZhc3R9IGZyb20gJy4vZXNtL2luY2lyY2xlLmpzJztcbmV4cG9ydCB7aW5zcGhlcmUsIGluc3BoZXJlZmFzdH0gZnJvbSAnLi9lc20vaW5zcGhlcmUuanMnO1xuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcblx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG5cdFx0ZnVuY3Rpb24oKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG5cdFx0ZnVuY3Rpb24oKSB7IHJldHVybiBtb2R1bGU7IH07XG5cdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsIHsgYTogZ2V0dGVyIH0pO1xuXHRyZXR1cm4gZ2V0dGVyO1xufTsiLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBkZWZpbml0aW9uKSB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iaiwgcHJvcCkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCk7IH0iLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsInZhciBfX2F3YWl0ZXIgPSAodGhpcyAmJiB0aGlzLl9fYXdhaXRlcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XG4gICAgfSk7XG59O1xuaW1wb3J0IHsgZ2V0X3Jlc2VhcmNoX3RleHQgfSBmcm9tIFwiLi9jaGF0XCI7XG5pbXBvcnQgeyB0aGlzR2FtZSB9IGZyb20gXCIuL2dhbWVcIjtcbmltcG9ydCB7IGdldF9oZXJvIH0gZnJvbSBcIi4vZ2V0X2hlcm9cIjtcbmltcG9ydCB7IGNsaXAsIGxhc3RDbGlwIH0gZnJvbSBcIi4vaG90a2V5XCI7XG5pbXBvcnQgeyByZW5kZXJMZWRnZXIgfSBmcm9tIFwiLi9sZWRnZXJcIjtcbmltcG9ydCB7IG1lcmdlVXNlciB9IGZyb20gXCIuL3V0aWxpdGllcy9tZXJnZVwiO1xuaW1wb3J0IHsgaXNfdmFsaWRfaW1hZ2VfdXJsLCBpc192YWxpZF95b3V0dWJlIH0gZnJvbSBcIi4vdXRpbGl0aWVzL3BhcnNlX3V0aWxzXCI7XG5pbXBvcnQgeyBhbnlTdGFyQ2FuU2VlLCBkcmF3T3ZlcmxheVN0cmluZyB9IGZyb20gXCIuL3V0aWxpdGllcy9ncmFwaGljc1wiO1xuaW1wb3J0IHsgaG9va19ucGNfdGlja19jb3VudGVyIH0gZnJvbSBcIi4vdXRpbGl0aWVzL25wY19jYWxjXCI7XG5pbXBvcnQgeyBnZXRfYXBlX2JhZGdlcywgQXBlQmFkZ2VJY29uLCBncm91cEFwZUJhZGdlcywgfSBmcm9tIFwiLi91dGlsaXRpZXMvcGxheWVyX2JhZGdlc1wiO1xuaW1wb3J0IHsgQXBlR2lmdEl0ZW0sIGJ1eUFwZUdpZnRTY3JlZW4gfSBmcm9tIFwiLi91dGlsaXRpZXMvZ2lmdF9zaG9wXCI7XG5pbXBvcnQgeyBnZXRUZXJyaXRvcnkgfSBmcm9tIFwiLi91dGlsaXRpZXMvdGVycml0b3J5XCI7XG5pbXBvcnQgeyB1bmlxdWUgfSBmcm9tIFwid2VicGFjay1tZXJnZVwiO1xubGV0IFNBVF9WRVJTSU9OID0gXCJnaXQtdmVyc2lvblwiO1xuaWYgKE5lcHR1bmVzUHJpZGUgPT09IHVuZGVmaW5lZCkge1xuICAgIHRoaXNHYW1lLm5lcHR1bmVzUHJpZGUgPSBOZXB0dW5lc1ByaWRlO1xufVxuLy8gdG9Qcm9wZXJDYXNlIG1ha2VzIGEgc3RyaW5nIFRpdGxlIENhc2VcblN0cmluZy5wcm90b3R5cGUudG9Qcm9wZXJDYXNlID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLnJlcGxhY2UoL1xcd1xcUyovZywgZnVuY3Rpb24gKHR4dCkge1xuICAgICAgICByZXR1cm4gdHh0LmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgdHh0LnN1YnN0cigxKS50b0xvd2VyQ2FzZSgpO1xuICAgIH0pO1xufTtcbi8vVGhpcyBzaG91bGQgY291bnQgdGhlIHF1YW50aXR5IG9mIGFuIGFycmF5IGdpdmVuIGEgZmlsdGVyXG4vLyBUT0RPOiBGaW5kIG91dCB3aGVyZSB0aGlzIGlzIHVzZWQ/XG5PYmplY3QuZGVmaW5lUHJvcGVydGllcyhBcnJheS5wcm90b3R5cGUsIHtcbiAgICBmaW5kOiB7XG4gICAgICAgIHZhbHVlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZpbHRlcigoeCkgPT4geCA9PSB2YWx1ZSkubGVuZ3RoO1xuICAgICAgICB9LFxuICAgIH0sXG59KTtcbi8qIEV4dHJhIEJhZGdlcyAqL1xubGV0IGFwZV9wbGF5ZXJzID0gW107XG5mdW5jdGlvbiBnZXRfYXBlX3BsYXllcnMoKSB7XG4gICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgZ2V0X2FwZV9iYWRnZXMoKVxuICAgICAgICAgICAgLnRoZW4oKHBsYXllcnMpID0+IHtcbiAgICAgICAgICAgIGFwZV9wbGF5ZXJzID0gcGxheWVycztcbiAgICAgICAgfSlcbiAgICAgICAgICAgIC5jYXRjaCgoZXJyKSA9PiBjb25zb2xlLmxvZyhcIkVSUk9SOiBVbmFibGUgdG8gZ2V0IEFQRSBwbGF5ZXJzXCIsIGVycikpO1xuICAgIH0pO1xufVxuZ2V0X2FwZV9wbGF5ZXJzKCk7XG4vL092ZXJyaWRlIHdpZGdldCBpbnRlZmFjZXNcbmNvbnN0IG92ZXJyaWRlQmFkZ2VXaWRnZXRzID0gKCkgPT4ge1xuICAgIE5lcHR1bmVzUHJpZGUubnB1aS5iYWRnZUZpbGVOYW1lc1tcImFcIl0gPSBcImFwZVwiO1xuICAgIGNvbnN0IGltYWdlX3VybCA9ICQoXCIjYXBlLWludGVsLXBsdWdpblwiKS5hdHRyKFwiaW1hZ2VzXCIpO1xuICAgIE5lcHR1bmVzUHJpZGUubnB1aS5CYWRnZUljb24gPSAoZmlsZW5hbWUsIGNvdW50LCBzbWFsbCkgPT4gQXBlQmFkZ2VJY29uKENydXgsIGltYWdlX3VybCwgZmlsZW5hbWUsIGNvdW50LCBzbWFsbCk7XG59O1xuY29uc3Qgb3ZlcnJpZGVUZW1wbGF0ZXMgPSAoKSA9PiB7XG4gICAgbGV0IGFwZSA9IFwiPGgzPkFwZSAtIDQyMCBDcmVkaXRzPC9oMz48cD5JcyB0aGlzIHdoYXQgeW91IGNhbGwgJ2V2b2x1dGlvbic/IEJlY2F1c2UgZnJhbmtseSwgSSd2ZSBzZWVuIGJldHRlciBkZXNpZ25zIG9mIGEgYmFuYW5hIHBlZWwuPC9wPlwiO1xuICAgIGxldCB3aXphcmQgPSBcIjxoMz5XaXphcmQgQmFkZ2UgLSA/IENyZWRpdHM8L2gzPjxwPkF3YXJkZWQgdG8gbWVtYmVycyBvZiB0aGUgY29tbXVuaXR5IHRoYXQgaGF2ZSBtYWRlIGEgc2lnbmlmaWNhbnQgY29udHJpYnV0aW9uIHRvIHRoZSBnYW1lLiBDb2RlIGZvciBhIG5ldyBmZWF0dXJlIG9yIGEgbWFwIGRlc2lnbiB3ZSBhbGwgZW5qb3llZC48L3A+XCI7XG4gICAgbGV0IHJhdCA9IFwiPGgzPkxhYiBSYXQgLSA/IENyZXRzICA8L2gzPjxwPkF3YXJkZWQgdG8gcGxheWVycyB3aG8gaGF2ZSBoZWxwZWQgdGVzdCB0aGUgbW9zdCBjcmF6eSBuZXcgZmVhdHVyZXMgYW5kIGdhbWUgdHlwZXMuIEtlZXAgYW4gZXllIG9uIHRoZSBmb3J1bXMgaWYgeW91IHdvdWxkIGxpa2UgdG8gc3ViamVjdCB5b3Vyc2VsZiB0byB0aGUgZ2FtZSdzIGV4cGVyaW1lbnRzLjwvcD5cIjtcbiAgICBsZXQgYnVsbHNleWUgPSBcIjxoMz5CdWxsc2V5ZSAtID8gQ3JlZGl0cyAgPC9oMz48cD5UaGV5IHJlYWxseSBoaXQgdGhlIHRhcmdldC48L3A+XCI7XG4gICAgbGV0IGZsYW1iZWF1ID0gXCI8aDM+RmxhbWJlYXUgLSA/IENyZWRpdHMgIDwvaDM+PHA+VGhpcyBwbGF5ZXIgcmVhbGx5IGxpdCB1cCB5b3VyIGxpZmUuPC9wPlwiO1xuICAgIGxldCB0b3VybmV5X2pvaW4gPSBcIjxoMz5Ub3VybmVtZW50IFBhcnRpY2lwYXRpb24gLSA/IENyZWRpdHMgIDwvaDM+PHA+SGV5IGF0IGxlYXN0IHlvdSB0cmllZC5cXG5Bd2FyZGVkIHRvIGVhY2ggcGxheWVyIHRoYXQgcGFydGljaXBhdGVzIGluIGFuIG9mZmljaWFsIHRvdXJuYW1lbnQuPC9wPlwiO1xuICAgIGxldCB0b3VybmV5X3dpbiA9IFwiPGgzPlRvdXJuZW1lbnQgV2lubmVyIC0gPyBDcmVkaXRzICA8L2gzPjxwPkhleSBhdCBsZWFzdCB5b3Ugd29uLlxcbkF3YXJkZWQgdG8gdGhlIHdpbm5lciBvZiBhbiBvZmZpY2lhbCB0b3VybmFtZW50LjwvcD5cIjtcbiAgICBsZXQgcHJvdGV1cyA9IFwiPGgzPlByb3RldXMgVmljdG9yeSAtID8gQ3JlZGl0cyAgPC9oMz48cD5Bd2FyZGVkIHRvIHBsYXllcnMgd2hvIHdpbiBhIGdhbWUgb2YgUHJvdGV1cyE8L3A+XCI7XG4gICAgbGV0IGhvbm91ciA9IFwiPGgzPlNwZWNpYWwgQmFkZ2Ugb2YgSG9ub3IgLSA/IENyZWRpdHMgIDwvaDM+PHA+QnV5IG9uZSBnZXQgb25lIGZyZWUhXFxuQXdhcmRlZCBmb3IgZXZlcnkgZ2lmdCBwdXJjaGFzZWQgZm9yIGFub3RoZXIgcGxheWVyLiBUaGVzZSBwbGF5ZXJzIGdvIGFib3ZlIGFuZCBiZXlvbmQgdGhlIGNhbGwgb2YgZHV0eSBpbiBzdXBwb3J0IG9mIHRoZSBnYW1lITwvcD5cIjtcbiAgICBOZXB0dW5lc1ByaWRlLnRlbXBsYXRlc1tcImdpZnRfZGVzY19hcGVcIl0gPSBhcGU7XG4gICAgTmVwdHVuZXNQcmlkZS50ZW1wbGF0ZXNbXCJnaWZ0X2Rlc2Nfd2l6YXJkXCJdID0gd2l6YXJkO1xuICAgIE5lcHR1bmVzUHJpZGUudGVtcGxhdGVzW1wiZ2lmdF9kZXNjX3JhdFwiXSA9IHJhdDtcbiAgICBOZXB0dW5lc1ByaWRlLnRlbXBsYXRlc1tcImdpZnRfZGVzY19idWxsc2V5ZVwiXSA9IGJ1bGxzZXllO1xuICAgIE5lcHR1bmVzUHJpZGUudGVtcGxhdGVzW1wiZ2lmdF9kZXNjX2ZsYW1iZWF1XCJdID0gZmxhbWJlYXU7XG4gICAgTmVwdHVuZXNQcmlkZS50ZW1wbGF0ZXNbXCJnaWZ0X2Rlc2NfdG91cm5leV9qb2luXCJdID0gdG91cm5leV9qb2luO1xuICAgIE5lcHR1bmVzUHJpZGUudGVtcGxhdGVzW1wiZ2lmdF9kZXNjX3RvdXJuZXlfd2luXCJdID0gdG91cm5leV93aW47XG4gICAgTmVwdHVuZXNQcmlkZS50ZW1wbGF0ZXNbXCJnaWZ0X2Rlc2NfcHJvdGV1c1wiXSA9IHByb3RldXM7XG4gICAgTmVwdHVuZXNQcmlkZS50ZW1wbGF0ZXNbXCJnaWZ0X2Rlc2NfaG9ub3VyXCJdID0gaG9ub3VyO1xuICAgIC8vTmVwdHVuZXNQcmlkZS50ZW1wbGF0ZXNbXCJnaWZ0X2Rlc2NfbGlmZXRpbWVcIl0gPSBsaWZldGltZVxuICAgIENydXgubG9jYWxpc2UgPSBmdW5jdGlvbiAoaWQpIHtcbiAgICAgICAgaWYgKENydXgudGVtcGxhdGVzW2lkXSkge1xuICAgICAgICAgICAgcmV0dXJuIENydXgudGVtcGxhdGVzW2lkXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBpZC50b1Byb3BlckNhc2UoKTtcbiAgICAgICAgfVxuICAgIH07XG59O1xuY29uc3Qgb3ZlcnJpZGVHaWZ0SXRlbXMgPSAoKSA9PiB7XG4gICAgY29uc3QgaW1hZ2VfdXJsID0gJChcIiNhcGUtaW50ZWwtcGx1Z2luXCIpLmF0dHIoXCJpbWFnZXNcIik7XG4gICAgTmVwdHVuZXNQcmlkZS5ucHVpLkJ1eUdpZnRTY3JlZW4gPSAoKSA9PiB7XG4gICAgICAgIHJldHVybiBidXlBcGVHaWZ0U2NyZWVuKENydXgsIE5lcHR1bmVzUHJpZGUudW5pdmVyc2UsIE5lcHR1bmVzUHJpZGUubnB1aSk7XG4gICAgfTtcbiAgICBOZXB0dW5lc1ByaWRlLm5wdWkuR2lmdEl0ZW0gPSAoaXRlbSkgPT4ge1xuICAgICAgICByZXR1cm4gQXBlR2lmdEl0ZW0oQ3J1eCwgaW1hZ2VfdXJsLCBpdGVtKTtcbiAgICB9O1xufTtcbmNvbnN0IG92ZXJyaWRlU2hvd1NjcmVlbiA9ICgpID0+IHtcbiAgICBOZXB0dW5lc1ByaWRlLm5wdWkub25TaG93U2NyZWVuID0gKGV2ZW50LCBzY3JlZW5OYW1lLCBzY3JlZW5Db25maWcpID0+IHtcbiAgICAgICAgcmV0dXJuIG9uU2hvd0FwZVNjcmVlbihOZXB0dW5lc1ByaWRlLm5wdWksIE5lcHR1bmVzUHJpZGUudW5pdmVyc2UsIGV2ZW50LCBzY3JlZW5OYW1lLCBzY3JlZW5Db25maWcpO1xuICAgIH07XG59O1xuLyokKFwiYXBlLWludGVsLXBsdWdpblwiKS5yZWFkeSgoKSA9PiB7XG4gIC8vJChcIiNhcGUtaW50ZWwtcGx1Z2luXCIpLnJlbW92ZSgpO1xufSk7Ki9cbmZ1bmN0aW9uIHBvc3RfaG9vaygpIHtcbiAgICBvdmVycmlkZUdpZnRJdGVtcygpO1xuICAgIC8vb3ZlcnJpZGVTaG93U2NyZWVuKCk7IC8vTm90IG5lZWRlZCB1bmxlc3MgSSB3YW50IHRvIGFkZCBuZXcgb25lcy5cbiAgICBvdmVycmlkZVRlbXBsYXRlcygpO1xuICAgIG92ZXJyaWRlQmFkZ2VXaWRnZXRzKCk7XG4gICAgZ2V0VGVycml0b3J5KE5lcHR1bmVzUHJpZGUudW5pdmVyc2UsICQoXCJjYW52YXNcIilbMF0pO1xuICAgIFNBVF9WRVJTSU9OID0gJChcIiNhcGUtaW50ZWwtcGx1Z2luXCIpLmF0dHIoXCJ0aXRsZVwiKTtcbiAgICBjb25zb2xlLmxvZyhTQVRfVkVSU0lPTiwgXCJMb2FkZWRcIik7XG59XG4vL1RPRE86IE9yZ2FuaXplIHR5cGVzY3JpcHQgdG8gYW4gaW50ZXJmYWNlcyBkaXJlY3Rvcnlcbi8vVE9ETzogVGhlbiBtYWtlIG90aGVyIGdGYW1lIGVuZ2luZSBvYmplY3RzXG4vLyBQYXJ0IG9mIHlvdXIgY29kZSBpcyByZS1jcmVhdGluZyB0aGUgZ2FtZSBpbiB0eXBlc2NyaXB0XG4vLyBUaGUgb3RoZXIgcGFydCBpcyBhZGRpbmcgZmVhdHVyZXNcbi8vIFRoZW4gdGhlcmUgaXMgYSBzZWdtZW50IHRoYXQgaXMgb3ZlcndyaXRpbmcgZXhpc3RpbmcgY29udGVudCB0byBhZGQgc21hbGwgYWRkaXRpb25zLlxuLy9BZGQgY3VzdG9tIHNldHRpbmdzIHdoZW4gbWFraW5nIGEgbndlIGdhbWUuXG5mdW5jdGlvbiBtb2RpZnlfY3VzdG9tX2dhbWUoKSB7XG4gICAgY29uc29sZS5sb2coXCJSdW5uaW5nIGN1c3RvbSBnYW1lIHNldHRpbmdzIG1vZGlmaWNhdGlvblwiKTtcbiAgICBsZXQgc2VsZWN0b3IgPSAkKFwiI2NvbnRlbnRBcmVhID4gZGl2ID4gZGl2LndpZGdldC5mdWxsc2NyZWVuID4gZGl2LndpZGdldC5yZWwgPiBkaXY6bnRoLWNoaWxkKDQpID4gZGl2Om50aC1jaGlsZCgxNSkgPiBzZWxlY3RcIilbMF07XG4gICAgaWYgKHNlbGVjdG9yID09IHVuZGVmaW5lZCkge1xuICAgICAgICAvL05vdCBpbiBtZW51XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgbGV0IHRleHRTdHJpbmcgPSBcIlwiO1xuICAgIGZvciAobGV0IGkgPSAyOyBpIDw9IDMyOyArK2kpIHtcbiAgICAgICAgdGV4dFN0cmluZyArPSBgPG9wdGlvbiB2YWx1ZT1cIiR7aX1cIj4ke2l9IFBsYXllcnM8L29wdGlvbj5gO1xuICAgIH1cbiAgICBjb25zb2xlLmxvZyh0ZXh0U3RyaW5nKTtcbiAgICBzZWxlY3Rvci5pbm5lckhUTUwgPSB0ZXh0U3RyaW5nO1xufVxuc2V0VGltZW91dChtb2RpZnlfY3VzdG9tX2dhbWUsIDUwMCk7XG4vL1RPRE86IE1ha2UgaXMgd2l0aGluIHNjYW5uaW5nIGZ1bmN0aW9uXG4vL1NoYXJlIGFsbCB0ZWNoIGRpc3BsYXkgYXMgdGVjaCBpcyBhY3RpdmVseSB0cmFkaW5nLlxuY29uc3QgZGlzcGxheV90ZWNoX3RyYWRpbmcgPSAoKSA9PiB7XG4gICAgbGV0IG5wdWkgPSBOZXB0dW5lc1ByaWRlLm5wdWk7XG4gICAgdmFyIHRlY2hfdHJhZGVfc2NyZWVuID0gbnB1aS5TY3JlZW4oXCJ0ZWNoX3RyYWRpbmdcIik7XG4gICAgbnB1aS5vbkhpZGVTY3JlZW4obnVsbCwgdHJ1ZSk7XG4gICAgbnB1aS5vbkhpZGVTZWxlY3Rpb25NZW51KCk7XG4gICAgbnB1aS50cmlnZ2VyKFwiaGlkZV9zaWRlX21lbnVcIik7XG4gICAgbnB1aS50cmlnZ2VyKFwicmVzZXRfZWRpdF9tb2RlXCIpO1xuICAgIG5wdWkuYWN0aXZlU2NyZWVuID0gdGVjaF90cmFkZV9zY3JlZW47XG4gICAgdGVjaF90cmFkZV9zY3JlZW4ucm9vc3QobnB1aS5zY3JlZW5Db250YWluZXIpO1xuICAgIG5wdWkubGF5b3V0RWxlbWVudCh0ZWNoX3RyYWRlX3NjcmVlbik7XG4gICAgbGV0IHRyYWRpbmcgPSBDcnV4LlRleHQoXCJcIiwgXCJyZWwgcGFkMTJcIikucmF3SFRNTChcIlRyYWRpbmcuLlwiKTtcbiAgICB0cmFkaW5nLnJvb3N0KHRlY2hfdHJhZGVfc2NyZWVuKTtcbiAgICB0ZWNoX3RyYWRlX3NjcmVlbi50cmFuc2FjdCA9ICh0ZXh0KSA9PiB7XG4gICAgICAgIGxldCB0cmFkaW5nID0gQ3J1eC5UZXh0KFwiXCIsIFwicmVsIHBhZDhcIikucmF3SFRNTCh0ZXh0KTtcbiAgICAgICAgdHJhZGluZy5yb29zdCh0ZWNoX3RyYWRlX3NjcmVlbik7XG4gICAgfTtcbiAgICByZXR1cm4gdGVjaF90cmFkZV9zY3JlZW47XG59O1xuLy9SZXR1cm5zIGFsbCBzdGFycyBJIHN1cHBvc2VcbmNvbnN0IF9nZXRfc3Rhcl9naXMgPSAoKSA9PiB7XG4gICAgbGV0IHN0YXJzID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5nYWxheHkuc3RhcnM7XG4gICAgbGV0IG91dHB1dCA9IFtdO1xuICAgIGZvciAoY29uc3QgcyBpbiBzdGFycykge1xuICAgICAgICBsZXQgc3RhciA9IHN0YXJzW3NdO1xuICAgICAgICBvdXRwdXQucHVzaCh7XG4gICAgICAgICAgICB4OiBzdGFyLngsXG4gICAgICAgICAgICB5OiBzdGFyLnksXG4gICAgICAgICAgICBvd25lcjogc3Rhci5xdWFsaWZpZWRBbGlhcyxcbiAgICAgICAgICAgIGVjb25vbXk6IHN0YXIuZSxcbiAgICAgICAgICAgIGluZHVzdHJ5OiBzdGFyLmksXG4gICAgICAgICAgICBzY2llbmNlOiBzdGFyLnMsXG4gICAgICAgICAgICBzaGlwczogc3Rhci50b3RhbERlZmVuc2VzLFxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIG91dHB1dDtcbn07XG5jb25zdCBfZ2V0X3dlYXBvbnNfbmV4dCA9ICgpID0+IHtcbiAgICBjb25zdCByZXNlYXJjaCA9IGdldF9yZXNlYXJjaCgpO1xuICAgIGlmIChyZXNlYXJjaFtcImN1cnJlbnRfbmFtZVwiXSA9PSBcIldlYXBvbnNcIikge1xuICAgICAgICByZXR1cm4gcmVzZWFyY2hbXCJjdXJyZW50X2V0YVwiXTtcbiAgICB9XG4gICAgZWxzZSBpZiAocmVzZWFyY2hbXCJuZXh0X25hbWVcIl0gPT0gXCJXZWFwb25zXCIpIHtcbiAgICAgICAgcmV0dXJuIHJlc2VhcmNoW1wibmV4dF9ldGFcIl07XG4gICAgfVxuICAgIHJldHVybiBNYXRoLnBvdygxMCwgMTApO1xufTtcbmNvbnN0IGdldF90ZWNoX3RyYWRlX2Nvc3QgPSAoZnJvbSwgdG8sIHRlY2hfbmFtZSA9IG51bGwpID0+IHtcbiAgICBsZXQgdG90YWxfY29zdCA9IDA7XG4gICAgZm9yIChjb25zdCBbdGVjaCwgdmFsdWVdIG9mIE9iamVjdC5lbnRyaWVzKHRvLnRlY2gpKSB7XG4gICAgICAgIGlmICh0ZWNoX25hbWUgPT0gbnVsbCB8fCB0ZWNoX25hbWUgPT0gdGVjaCkge1xuICAgICAgICAgICAgbGV0IG1lID0gZnJvbS50ZWNoW3RlY2hdLmxldmVsO1xuICAgICAgICAgICAgbGV0IHlvdSA9IHZhbHVlLmxldmVsO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPD0gbWUgLSB5b3U7ICsraSkge1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2codGVjaCwoeW91K2kpLCh5b3UraSkqMTUpXG4gICAgICAgICAgICAgICAgdG90YWxfY29zdCArPSAoeW91ICsgaSkgKiBOZXB0dW5lc1ByaWRlLmdhbWVDb25maWcudHJhZGVDb3N0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0b3RhbF9jb3N0O1xufTtcbi8vSG9va3MgdG8gYnV0dG9ucyBmb3Igc2hhcmluZyBhbmQgYnV5aW5nXG4vL1ByZXR0eSBzaW1wbGUgaG9va3MgdGhhdCBjYW4gYmUgYWRkZWQgdG8gYSB0eXBlc2NyaXB0IGZpbGUuXG5jb25zdCBhcHBseV9ob29rcyA9ICgpID0+IHtcbiAgICBOZXB0dW5lc1ByaWRlLm5wLm9uKFwic2hhcmVfYWxsX3RlY2hcIiwgKGV2ZW50LCBwbGF5ZXIpID0+IHtcbiAgICAgICAgbGV0IHRvdGFsX2Nvc3QgPSBnZXRfdGVjaF90cmFkZV9jb3N0KGdldF9oZXJvKE5lcHR1bmVzUHJpZGUudW5pdmVyc2UpLCBwbGF5ZXIpO1xuICAgICAgICBOZXB0dW5lc1ByaWRlLnRlbXBsYXRlc1tgY29uZmlybV90ZWNoX3NoYXJlXyR7cGxheWVyLnVpZH1gXSA9IGBBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gc3BlbmQgJCR7dG90YWxfY29zdH0gdG8gZ2l2ZSAke3BsYXllci5yYXdBbGlhc30gYWxsIG9mIHlvdXIgdGVjaD9gO1xuICAgICAgICBOZXB0dW5lc1ByaWRlLm5wLnRyaWdnZXIoXCJzaG93X3NjcmVlblwiLCBbXG4gICAgICAgICAgICBcImNvbmZpcm1cIixcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBgY29uZmlybV90ZWNoX3NoYXJlXyR7cGxheWVyLnVpZH1gLFxuICAgICAgICAgICAgICAgIGV2ZW50S2luZDogXCJjb25maXJtX3RyYWRlX3RlY2hcIixcbiAgICAgICAgICAgICAgICBldmVudERhdGE6IHBsYXllcixcbiAgICAgICAgICAgIH0sXG4gICAgICAgIF0pO1xuICAgIH0pO1xuICAgIE5lcHR1bmVzUHJpZGUubnAub24oXCJidXlfYWxsX3RlY2hcIiwgKGV2ZW50LCBkYXRhKSA9PiB7XG4gICAgICAgIGxldCBwbGF5ZXIgPSBkYXRhLnBsYXllcjtcbiAgICAgICAgbGV0IGNvc3QgPSBkYXRhLmNvc3Q7XG4gICAgICAgIE5lcHR1bmVzUHJpZGUudGVtcGxhdGVzW2Bjb25maXJtX3RlY2hfc2hhcmVfJHtwbGF5ZXIudWlkfWBdID0gYEFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBzcGVuZCAkJHtjb3N0fSB0byBidXkgYWxsIG9mICR7cGxheWVyLnJhd0FsaWFzfSdzIHRlY2g/IEl0IGlzIHVwIHRvIHRoZW0gdG8gYWN0dWFsbHkgc2VuZCBpdCB0byB5b3UuYDtcbiAgICAgICAgTmVwdHVuZXNQcmlkZS5ucC50cmlnZ2VyKFwic2hvd19zY3JlZW5cIiwgW1xuICAgICAgICAgICAgXCJjb25maXJtXCIsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZTogYGNvbmZpcm1fdGVjaF9zaGFyZV8ke3BsYXllci51aWR9YCxcbiAgICAgICAgICAgICAgICBldmVudEtpbmQ6IFwiY29uZmlybV9idXlfdGVjaFwiLFxuICAgICAgICAgICAgICAgIGV2ZW50RGF0YTogZGF0YSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIF0pO1xuICAgIH0pO1xuICAgIE5lcHR1bmVzUHJpZGUubnAub24oXCJidXlfb25lX3RlY2hcIiwgKGV2ZW50LCBkYXRhKSA9PiB7XG4gICAgICAgIGxldCBwbGF5ZXIgPSBkYXRhLnBsYXllcjtcbiAgICAgICAgbGV0IHRlY2ggPSBkYXRhLnRlY2g7XG4gICAgICAgIGxldCBjb3N0ID0gZGF0YS5jb3N0O1xuICAgICAgICBOZXB0dW5lc1ByaWRlLnRlbXBsYXRlc1tgY29uZmlybV90ZWNoX3NoYXJlXyR7cGxheWVyLnVpZH1gXSA9IGBBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gc3BlbmQgJCR7Y29zdH0gdG8gYnV5ICR7dGVjaH0gZnJvbSAke3BsYXllci5yYXdBbGlhc30/IEl0IGlzIHVwIHRvIHRoZW0gdG8gYWN0dWFsbHkgc2VuZCBpdCB0byB5b3UuYDtcbiAgICAgICAgTmVwdHVuZXNQcmlkZS5ucC50cmlnZ2VyKFwic2hvd19zY3JlZW5cIiwgW1xuICAgICAgICAgICAgXCJjb25maXJtXCIsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZTogYGNvbmZpcm1fdGVjaF9zaGFyZV8ke3BsYXllci51aWR9YCxcbiAgICAgICAgICAgICAgICBldmVudEtpbmQ6IFwiY29uZmlybV9idXlfdGVjaFwiLFxuICAgICAgICAgICAgICAgIGV2ZW50RGF0YTogZGF0YSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIF0pO1xuICAgIH0pO1xuICAgIE5lcHR1bmVzUHJpZGUubnAub24oXCJjb25maXJtX3RyYWRlX3RlY2hcIiwgKGV2ZW4sIHBsYXllcikgPT4ge1xuICAgICAgICBsZXQgaGVybyA9IGdldF9oZXJvKE5lcHR1bmVzUHJpZGUudW5pdmVyc2UpO1xuICAgICAgICBsZXQgZGlzcGxheSA9IGRpc3BsYXlfdGVjaF90cmFkaW5nKCk7XG4gICAgICAgIGNvbnN0IGNsb3NlID0gKCkgPT4ge1xuICAgICAgICAgICAgTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5zZWxlY3RQbGF5ZXIocGxheWVyKTtcbiAgICAgICAgICAgIE5lcHR1bmVzUHJpZGUubnAudHJpZ2dlcihcInJlZnJlc2hfaW50ZXJmYWNlXCIpO1xuICAgICAgICAgICAgTmVwdHVuZXNQcmlkZS5ucC5ucHVpLnJlZnJlc2hUdXJuTWFuYWdlcigpO1xuICAgICAgICB9O1xuICAgICAgICBsZXQgb2Zmc2V0ID0gMzAwO1xuICAgICAgICBmb3IgKGNvbnN0IFt0ZWNoLCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMocGxheWVyLnRlY2gpKSB7XG4gICAgICAgICAgICBsZXQgbWUgPSBoZXJvLnRlY2hbdGVjaF0ubGV2ZWw7XG4gICAgICAgICAgICBsZXQgeW91ID0gdmFsdWUubGV2ZWw7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMTsgaSA8PSBtZSAtIHlvdTsgKytpKSB7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKG1lIC0geW91LCB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBcIm9yZGVyXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBvcmRlcjogYHNoYXJlX3RlY2gsJHtwbGF5ZXIudWlkfSwke3RlY2h9YCxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGRpc3BsYXkudHJhbnNhY3QoYFNlbmRpbmcgJHt0ZWNofSBsZXZlbCAke3lvdSArIGl9YCk7XG4gICAgICAgICAgICAgICAgICAgIE5lcHR1bmVzUHJpZGUubnAudHJpZ2dlcihcInNlcnZlcl9yZXF1ZXN0XCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwib3JkZXJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIG9yZGVyOiBgc2hhcmVfdGVjaCwke3BsYXllci51aWR9LCR7dGVjaH1gLFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGkgPT0gbWUgLSB5b3UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc3BsYXkudHJhbnNhY3QoXCJEb25lLlwiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sIG9mZnNldCk7XG4gICAgICAgICAgICAgICAgb2Zmc2V0ICs9IDEwMDA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgc2V0VGltZW91dChjbG9zZSwgb2Zmc2V0ICsgMTAwMCk7XG4gICAgfSk7XG4gICAgLy9QYXlzIGEgcGxheWVyIGEgY2VydGFpbiBhbW91bnRcbiAgICBOZXB0dW5lc1ByaWRlLm5wLm9uKFwiY29uZmlybV9idXlfdGVjaFwiLCAoZXZlbiwgZGF0YSkgPT4ge1xuICAgICAgICBsZXQgcGxheWVyID0gZGF0YS5wbGF5ZXI7XG4gICAgICAgIE5lcHR1bmVzUHJpZGUubnAudHJpZ2dlcihcInNlcnZlcl9yZXF1ZXN0XCIsIHtcbiAgICAgICAgICAgIHR5cGU6IFwib3JkZXJcIixcbiAgICAgICAgICAgIG9yZGVyOiBgc2VuZF9tb25leSwke3BsYXllci51aWR9LCR7ZGF0YS5jb3N0fWAsXG4gICAgICAgIH0pO1xuICAgICAgICBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlLnNlbGVjdFBsYXllcihwbGF5ZXIpO1xuICAgICAgICBOZXB0dW5lc1ByaWRlLm5wLnRyaWdnZXIoXCJyZWZyZXNoX2ludGVyZmFjZVwiKTtcbiAgICB9KTtcbn07XG5jb25zdCBfd2lkZV92aWV3ID0gKCkgPT4ge1xuICAgIE5lcHR1bmVzUHJpZGUubnAudHJpZ2dlcihcIm1hcF9jZW50ZXJfc2xpZGVcIiwgeyB4OiAwLCB5OiAwIH0pO1xuICAgIE5lcHR1bmVzUHJpZGUubnAudHJpZ2dlcihcInpvb21fbWluaW1hcFwiKTtcbn07XG5mdW5jdGlvbiBMZWdhY3lfTmVwdHVuZXNQcmlkZUFnZW50KCkge1xuICAgIHZhciBfYSwgX2I7XG4gICAgbGV0IHRpdGxlID0gKChfYSA9IGRvY3VtZW50ID09PSBudWxsIHx8IGRvY3VtZW50ID09PSB2b2lkIDAgPyB2b2lkIDAgOiBkb2N1bWVudC5jdXJyZW50U2NyaXB0KSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2EudGl0bGUpIHx8IGBTQVQgJHtTQVRfVkVSU0lPTn1gO1xuICAgIGxldCB2ZXJzaW9uID0gdGl0bGUucmVwbGFjZSgvXi4qdi8sIFwidlwiKTtcbiAgICBsZXQgY29weSA9IGZ1bmN0aW9uIChyZXBvcnRGbikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmVwb3J0Rm4oKTtcbiAgICAgICAgICAgIG5hdmlnYXRvci5jbGlwYm9hcmQud3JpdGVUZXh0KGxhc3RDbGlwKTtcbiAgICAgICAgfTtcbiAgICB9O1xuICAgIGxldCBob3RrZXlzID0gW107XG4gICAgbGV0IGhvdGtleSA9IGZ1bmN0aW9uIChrZXksIGFjdGlvbikge1xuICAgICAgICBob3RrZXlzLnB1c2goW2tleSwgYWN0aW9uXSk7XG4gICAgICAgIE1vdXNldHJhcC5iaW5kKGtleSwgY29weShhY3Rpb24pKTtcbiAgICB9O1xuICAgIGlmICghU3RyaW5nLnByb3RvdHlwZS5mb3JtYXQpIHtcbiAgICAgICAgU3RyaW5nLnByb3RvdHlwZS5mb3JtYXQgPSBmdW5jdGlvbiAoLi4uYXJncykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVwbGFjZSgveyhcXGQrKX0vZywgZnVuY3Rpb24gKG1hdGNoLCBudW1iZXIpIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGFyZ3NbbnVtYmVyXSA9PT0gXCJudW1iZXJcIikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gTWF0aC50cnVuYyhhcmdzW251bWJlcl0gKiAxMDAwKSAvIDEwMDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB0eXBlb2YgYXJnc1tudW1iZXJdICE9IFwidW5kZWZpbmVkXCIgPyBhcmdzW251bWJlcl0gOiBtYXRjaDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgIH1cbiAgICBjb25zdCBsaW5rRmxlZXRzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBsZXQgdW5pdmVyc2UgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlO1xuICAgICAgICBsZXQgZmxlZXRzID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5nYWxheHkuZmxlZXRzO1xuICAgICAgICBmb3IgKGNvbnN0IGYgaW4gZmxlZXRzKSB7XG4gICAgICAgICAgICBsZXQgZmxlZXQgPSBmbGVldHNbZl07XG4gICAgICAgICAgICBsZXQgZmxlZXRMaW5rID0gYDxhIG9uQ2xpY2s9J0NydXguY3J1eC50cmlnZ2VyKFxcXCJzaG93X2ZsZWV0X3VpZFxcXCIsIFxcXCIke2ZsZWV0LnVpZH1cXFwiKSc+JHtmbGVldC5ufTwvYT5gO1xuICAgICAgICAgICAgdW5pdmVyc2UuaHlwZXJsaW5rZWRNZXNzYWdlSW5zZXJ0c1tmbGVldC5uXSA9IGZsZWV0TGluaztcbiAgICAgICAgfVxuICAgIH07XG4gICAgZnVuY3Rpb24gc3RhclJlcG9ydCgpIHtcbiAgICAgICAgbGV0IHBsYXllcnMgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlLmdhbGF4eS5wbGF5ZXJzO1xuICAgICAgICBsZXQgc3RhcnMgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlLmdhbGF4eS5zdGFycztcbiAgICAgICAgbGV0IG91dHB1dCA9IFtdO1xuICAgICAgICBmb3IgKGNvbnN0IHAgaW4gcGxheWVycykge1xuICAgICAgICAgICAgb3V0cHV0LnB1c2goXCJbW3swfV1dXCIuZm9ybWF0KHApKTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgcyBpbiBzdGFycykge1xuICAgICAgICAgICAgICAgIGxldCBzdGFyID0gc3RhcnNbc107XG4gICAgICAgICAgICAgICAgaWYgKHN0YXIucHVpZCA9PSBwICYmIHN0YXIuc2hpcHNQZXJUaWNrID49IDApIHtcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0LnB1c2goXCLigIPigINbW3swfV1dIHsxfS97Mn0vezN9IHs0fSBzaGlwc1wiLmZvcm1hdChzdGFyLm4sIHN0YXIuZSwgc3Rhci5pLCBzdGFyLnMsIHN0YXIudG90YWxEZWZlbnNlcykpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjbGlwKG91dHB1dC5qb2luKFwiXFxuXCIpKTtcbiAgICB9XG4gICAgaG90a2V5KFwiKlwiLCBzdGFyUmVwb3J0KTtcbiAgICBzdGFyUmVwb3J0LmhlbHAgPVxuICAgICAgICBcIkdlbmVyYXRlIGEgcmVwb3J0IG9uIGFsbCBzdGFycyBpbiB5b3VyIHNjYW5uaW5nIHJhbmdlLCBhbmQgY29weSBpdCB0byB0aGUgY2xpcGJvYXJkLlwiICtcbiAgICAgICAgICAgIFwiPHA+VGhpcyBzYW1lIHJlcG9ydCBjYW4gYWxzbyBiZSB2aWV3ZWQgdmlhIHRoZSBtZW51OyBlbnRlciB0aGUgYWdlbnQgYW5kIGNob29zZSBpdCBmcm9tIHRoZSBkcm9wZG93bi5cIjtcbiAgICBsZXQgYW1wbSA9IGZ1bmN0aW9uIChoLCBtKSB7XG4gICAgICAgIGlmIChtIDwgMTApXG4gICAgICAgICAgICBtID0gYDAke219YDtcbiAgICAgICAgaWYgKGggPCAxMikge1xuICAgICAgICAgICAgaWYgKGggPT0gMClcbiAgICAgICAgICAgICAgICBoID0gMTI7XG4gICAgICAgICAgICByZXR1cm4gXCJ7MH06ezF9IEFNXCIuZm9ybWF0KGgsIG0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGggPiAxMikge1xuICAgICAgICAgICAgcmV0dXJuIFwiezB9OnsxfSBQTVwiLmZvcm1hdChoIC0gMTIsIG0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBcInswfTp7MX0gUE1cIi5mb3JtYXQoaCwgbSk7XG4gICAgfTtcbiAgICBsZXQgbXNUb1RpY2sgPSBmdW5jdGlvbiAodGljaywgd2hvbGVUaW1lKSB7XG4gICAgICAgIGxldCB1bml2ZXJzZSA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2U7XG4gICAgICAgIHZhciBtc19zaW5jZV9kYXRhID0gMDtcbiAgICAgICAgdmFyIHRmID0gdW5pdmVyc2UuZ2FsYXh5LnRpY2tfZnJhZ21lbnQ7XG4gICAgICAgIHZhciBsdGMgPSB1bml2ZXJzZS5sb2NUaW1lQ29ycmVjdGlvbjtcbiAgICAgICAgaWYgKCF1bml2ZXJzZS5nYWxheHkucGF1c2VkKSB7XG4gICAgICAgICAgICBtc19zaW5jZV9kYXRhID0gbmV3IERhdGUoKS52YWx1ZU9mKCkgLSB1bml2ZXJzZS5ub3cudmFsdWVPZigpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh3aG9sZVRpbWUgfHwgdW5pdmVyc2UuZ2FsYXh5LnR1cm5fYmFzZWQpIHtcbiAgICAgICAgICAgIG1zX3NpbmNlX2RhdGEgPSAwO1xuICAgICAgICAgICAgdGYgPSAwO1xuICAgICAgICAgICAgbHRjID0gMDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgbXNfcmVtYWluaW5nID0gdGljayAqIDEwMDAgKiA2MCAqIHVuaXZlcnNlLmdhbGF4eS50aWNrX3JhdGUgLVxuICAgICAgICAgICAgdGYgKiAxMDAwICogNjAgKiB1bml2ZXJzZS5nYWxheHkudGlja19yYXRlIC1cbiAgICAgICAgICAgIG1zX3NpbmNlX2RhdGEgLVxuICAgICAgICAgICAgbHRjO1xuICAgICAgICByZXR1cm4gbXNfcmVtYWluaW5nO1xuICAgIH07XG4gICAgbGV0IGRheXMgPSBbXCJTdW5cIiwgXCJNb25cIiwgXCJUdWVcIiwgXCJXZWRcIiwgXCJUaHVcIiwgXCJGcmlcIiwgXCJTYXRcIl07XG4gICAgbGV0IG1zVG9FdGFTdHJpbmcgPSBmdW5jdGlvbiAobXNwbHVzLCBwcmVmaXgpIHtcbiAgICAgICAgbGV0IG5vdyA9IG5ldyBEYXRlKCk7XG4gICAgICAgIGxldCBhcnJpdmFsID0gbmV3IERhdGUobm93LmdldFRpbWUoKSArIG1zcGx1cyk7XG4gICAgICAgIGxldCBwID0gcHJlZml4ICE9PSB1bmRlZmluZWQgPyBwcmVmaXggOiBcIkVUQSBcIjtcbiAgICAgICAgLy9XaGF0IGlzIHR0dD9cbiAgICAgICAgbGV0IHR0dCA9IHAgKyBhbXBtKGFycml2YWwuZ2V0SG91cnMoKSwgYXJyaXZhbC5nZXRNaW51dGVzKCkpO1xuICAgICAgICBpZiAoIU5lcHR1bmVzUHJpZGUuZ2FtZUNvbmZpZy50dXJuQmFzZWQpIHtcbiAgICAgICAgICAgIHR0dCA9IHAgKyBhbXBtKGFycml2YWwuZ2V0SG91cnMoKSwgYXJyaXZhbC5nZXRNaW51dGVzKCkpO1xuICAgICAgICAgICAgaWYgKGFycml2YWwuZ2V0RGF5KCkgIT0gbm93LmdldERheSgpKVxuICAgICAgICAgICAgICAgIC8vIEdlbmVyYXRlIHRpbWUgc3RyaW5nXG4gICAgICAgICAgICAgICAgdHR0ID0gYCR7cH0ke2RheXNbYXJyaXZhbC5nZXREYXkoKV19IEAgJHthbXBtKGFycml2YWwuZ2V0SG91cnMoKSwgYXJyaXZhbC5nZXRNaW51dGVzKCkpfWA7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBsZXQgdG90YWxFVEEgPSBhcnJpdmFsIC0gbm93O1xuICAgICAgICAgICAgdHR0ID0gcCArIENydXguZm9ybWF0VGltZSh0b3RhbEVUQSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHR0dDtcbiAgICB9O1xuICAgIGxldCB0aWNrVG9FdGFTdHJpbmcgPSBmdW5jdGlvbiAodGljaywgcHJlZml4KSB7XG4gICAgICAgIGxldCBtc3BsdXMgPSBtc1RvVGljayh0aWNrKTtcbiAgICAgICAgcmV0dXJuIG1zVG9FdGFTdHJpbmcobXNwbHVzLCBwcmVmaXgpO1xuICAgIH07XG4gICAgbGV0IG1zVG9DeWNsZVN0cmluZyA9IGZ1bmN0aW9uIChtc3BsdXMsIHByZWZpeCkge1xuICAgICAgICBsZXQgcCA9IHByZWZpeCAhPT0gdW5kZWZpbmVkID8gcHJlZml4IDogXCJFVEFcIjtcbiAgICAgICAgbGV0IGN5Y2xlTGVuZ3RoID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5nYWxheHkucHJvZHVjdGlvbl9yYXRlO1xuICAgICAgICBsZXQgdGlja0xlbmd0aCA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2UuZ2FsYXh5LnRpY2tfcmF0ZTtcbiAgICAgICAgbGV0IHRpY2tzVG9Db21wbGV0ZSA9IE1hdGguY2VpbChtc3BsdXMgLyA2MDAwMCAvIHRpY2tMZW5ndGgpO1xuICAgICAgICAvL0dlbmVyYXRlIHRpbWUgdGV4dCBzdHJpbmdcbiAgICAgICAgbGV0IHR0dCA9IGAke3B9JHt0aWNrc1RvQ29tcGxldGV9IHRpY2tzIC0gJHsodGlja3NUb0NvbXBsZXRlIC8gY3ljbGVMZW5ndGgpLnRvRml4ZWQoMil9Q2A7XG4gICAgICAgIHJldHVybiB0dHQ7XG4gICAgfTtcbiAgICBsZXQgZmxlZXRPdXRjb21lcyA9IHt9O1xuICAgIGxldCBjb21iYXRIYW5kaWNhcCA9IDA7XG4gICAgbGV0IGNvbWJhdE91dGNvbWVzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgX2E7XG4gICAgICAgIGxldCB1bml2ZXJzZSA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2U7XG4gICAgICAgIGxldCBwbGF5ZXJzID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5nYWxheHkucGxheWVycztcbiAgICAgICAgbGV0IGZsZWV0cyA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2UuZ2FsYXh5LmZsZWV0cztcbiAgICAgICAgbGV0IHN0YXJzID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5nYWxheHkuc3RhcnM7XG4gICAgICAgIGxldCBmbGlnaHRzID0gW107XG4gICAgICAgIGZsZWV0T3V0Y29tZXMgPSB7fTtcbiAgICAgICAgZm9yIChjb25zdCBmIGluIGZsZWV0cykge1xuICAgICAgICAgICAgbGV0IGZsZWV0ID0gZmxlZXRzW2ZdO1xuICAgICAgICAgICAgaWYgKGZsZWV0Lm8gJiYgZmxlZXQuby5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgbGV0IHN0b3AgPSBmbGVldC5vWzBdWzFdO1xuICAgICAgICAgICAgICAgIGxldCB0aWNrcyA9IGZsZWV0LmV0YUZpcnN0O1xuICAgICAgICAgICAgICAgIGxldCBzdGFybmFtZSA9IChfYSA9IHN0YXJzW3N0b3BdKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2EubjtcbiAgICAgICAgICAgICAgICBpZiAoIXN0YXJuYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmbGlnaHRzLnB1c2goW1xuICAgICAgICAgICAgICAgICAgICB0aWNrcyxcbiAgICAgICAgICAgICAgICAgICAgXCJbW3swfV1dIFtbezF9XV0gezJ9IOKGkiBbW3szfV1dIHs0fVwiLmZvcm1hdChmbGVldC5wdWlkLCBmbGVldC5uLCBmbGVldC5zdCwgc3Rhcm5hbWUsIHRpY2tUb0V0YVN0cmluZyh0aWNrcykpLFxuICAgICAgICAgICAgICAgICAgICBmbGVldCxcbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmbGlnaHRzID0gZmxpZ2h0cy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgICAgICByZXR1cm4gYVswXSAtIGJbMF07XG4gICAgICAgIH0pO1xuICAgICAgICBsZXQgYXJyaXZhbHMgPSB7fTtcbiAgICAgICAgbGV0IG91dHB1dCA9IFtdO1xuICAgICAgICBsZXQgYXJyaXZhbFRpbWVzID0gW107XG4gICAgICAgIGxldCBzdGFyc3RhdGUgPSB7fTtcbiAgICAgICAgZm9yIChjb25zdCBpIGluIGZsaWdodHMpIHtcbiAgICAgICAgICAgIGxldCBmbGVldCA9IGZsaWdodHNbaV1bMl07XG4gICAgICAgICAgICBpZiAoZmxlZXQub3JiaXRpbmcpIHtcbiAgICAgICAgICAgICAgICBsZXQgb3JiaXQgPSBmbGVldC5vcmJpdGluZy51aWQ7XG4gICAgICAgICAgICAgICAgaWYgKCFzdGFyc3RhdGVbb3JiaXRdKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXJzdGF0ZVtvcmJpdF0gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYXN0X3VwZGF0ZWQ6IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICBzaGlwczogc3RhcnNbb3JiaXRdLnRvdGFsRGVmZW5zZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBwdWlkOiBzdGFyc1tvcmJpdF0ucHVpZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGM6IHN0YXJzW29yYml0XS5jLFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBUaGlzIGZsZWV0IGlzIGRlcGFydGluZyB0aGlzIHRpY2s7IHJlbW92ZSBpdCBmcm9tIHRoZSBvcmlnaW4gc3RhcidzIHRvdGFsRGVmZW5zZXNcbiAgICAgICAgICAgICAgICBzdGFyc3RhdGVbb3JiaXRdLnNoaXBzIC09IGZsZWV0LnN0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGFycml2YWxUaW1lcy5sZW5ndGggPT09IDAgfHxcbiAgICAgICAgICAgICAgICBhcnJpdmFsVGltZXNbYXJyaXZhbFRpbWVzLmxlbmd0aCAtIDFdICE9PSBmbGlnaHRzW2ldWzBdKSB7XG4gICAgICAgICAgICAgICAgYXJyaXZhbFRpbWVzLnB1c2goZmxpZ2h0c1tpXVswXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgYXJyaXZhbEtleSA9IFtmbGlnaHRzW2ldWzBdLCBmbGVldC5vWzBdWzFdXTtcbiAgICAgICAgICAgIGlmIChhcnJpdmFsc1thcnJpdmFsS2V5XSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgYXJyaXZhbHNbYXJyaXZhbEtleV0ucHVzaChmbGVldCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBhcnJpdmFsc1thcnJpdmFsS2V5XSA9IFtmbGVldF07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCBrIGluIGFycml2YWxzKSB7XG4gICAgICAgICAgICBsZXQgYXJyaXZhbCA9IGFycml2YWxzW2tdO1xuICAgICAgICAgICAgbGV0IGthID0gay5zcGxpdChcIixcIik7XG4gICAgICAgICAgICBsZXQgdGljayA9IGthWzBdO1xuICAgICAgICAgICAgbGV0IHN0YXJJZCA9IGthWzFdO1xuICAgICAgICAgICAgaWYgKCFzdGFyc3RhdGVbc3RhcklkXSkge1xuICAgICAgICAgICAgICAgIHN0YXJzdGF0ZVtzdGFySWRdID0ge1xuICAgICAgICAgICAgICAgICAgICBsYXN0X3VwZGF0ZWQ6IDAsXG4gICAgICAgICAgICAgICAgICAgIHNoaXBzOiBzdGFyc1tzdGFySWRdLnRvdGFsRGVmZW5zZXMsXG4gICAgICAgICAgICAgICAgICAgIHB1aWQ6IHN0YXJzW3N0YXJJZF0ucHVpZCxcbiAgICAgICAgICAgICAgICAgICAgYzogc3RhcnNbc3RhcklkXS5jLFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoc3RhcnN0YXRlW3N0YXJJZF0ucHVpZCA9PSAtMSkge1xuICAgICAgICAgICAgICAgIC8vIGFzc2lnbiBvd25lcnNoaXAgb2YgdGhlIHN0YXIgdG8gdGhlIHBsYXllciB3aG9zZSBmbGVldCBoYXMgdHJhdmVsZWQgdGhlIGxlYXN0IGRpc3RhbmNlXG4gICAgICAgICAgICAgICAgbGV0IG1pbkRpc3RhbmNlID0gMTAwMDA7XG4gICAgICAgICAgICAgICAgbGV0IG93bmVyID0gLTE7XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBpIGluIGFycml2YWwpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGZsZWV0ID0gYXJyaXZhbFtpXTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGQgPSB1bml2ZXJzZS5kaXN0YW5jZShzdGFyc1tzdGFySWRdLngsIHN0YXJzW3N0YXJJZF0ueSwgZmxlZXQubHgsIGZsZWV0Lmx5KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGQgPCBtaW5EaXN0YW5jZSB8fCBvd25lciA9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3duZXIgPSBmbGVldC5wdWlkO1xuICAgICAgICAgICAgICAgICAgICAgICAgbWluRGlzdGFuY2UgPSBkO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHN0YXJzdGF0ZVtzdGFySWRdLnB1aWQgPSBvd25lcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG91dHB1dC5wdXNoKFwiezB9OiBbW3sxfV1dIFtbezJ9XV0gezN9IHNoaXBzXCIuZm9ybWF0KHRpY2tUb0V0YVN0cmluZyh0aWNrLCBcIkBcIiksIHN0YXJzdGF0ZVtzdGFySWRdLnB1aWQsIHN0YXJzW3N0YXJJZF0ubiwgc3RhcnN0YXRlW3N0YXJJZF0uc2hpcHMpKTtcbiAgICAgICAgICAgIGxldCB0aWNrRGVsdGEgPSB0aWNrIC0gc3RhcnN0YXRlW3N0YXJJZF0ubGFzdF91cGRhdGVkIC0gMTtcbiAgICAgICAgICAgIGlmICh0aWNrRGVsdGEgPiAwKSB7XG4gICAgICAgICAgICAgICAgbGV0IG9sZFNoaXBzID0gc3RhcnN0YXRlW3N0YXJJZF0uc2hpcHM7XG4gICAgICAgICAgICAgICAgc3RhcnN0YXRlW3N0YXJJZF0ubGFzdF91cGRhdGVkID0gdGljayAtIDE7XG4gICAgICAgICAgICAgICAgaWYgKHN0YXJzW3N0YXJJZF0uc2hpcHNQZXJUaWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBvbGRjID0gc3RhcnN0YXRlW3N0YXJJZF0uYztcbiAgICAgICAgICAgICAgICAgICAgc3RhcnN0YXRlW3N0YXJJZF0uc2hpcHMgKz1cbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJzW3N0YXJJZF0uc2hpcHNQZXJUaWNrICogdGlja0RlbHRhICsgb2xkYztcbiAgICAgICAgICAgICAgICAgICAgc3RhcnN0YXRlW3N0YXJJZF0uYyA9XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFyc3RhdGVbc3RhcklkXS5zaGlwcyAtIE1hdGgudHJ1bmMoc3RhcnN0YXRlW3N0YXJJZF0uc2hpcHMpO1xuICAgICAgICAgICAgICAgICAgICBzdGFyc3RhdGVbc3RhcklkXS5zaGlwcyAtPSBzdGFyc3RhdGVbc3RhcklkXS5jO1xuICAgICAgICAgICAgICAgICAgICBvdXRwdXQucHVzaChcIuKAg+KAg3swfSt7M30gKyB7Mn0vaCA9IHsxfSt7NH1cIi5mb3JtYXQob2xkU2hpcHMsIHN0YXJzdGF0ZVtzdGFySWRdLnNoaXBzLCBzdGFyc1tzdGFySWRdLnNoaXBzUGVyVGljaywgb2xkYywgc3RhcnN0YXRlW3N0YXJJZF0uYykpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAoY29uc3QgaSBpbiBhcnJpdmFsKSB7XG4gICAgICAgICAgICAgICAgbGV0IGZsZWV0ID0gYXJyaXZhbFtpXTtcbiAgICAgICAgICAgICAgICBpZiAoZmxlZXQucHVpZCA9PSBzdGFyc3RhdGVbc3RhcklkXS5wdWlkIHx8XG4gICAgICAgICAgICAgICAgICAgIHN0YXJzdGF0ZVtzdGFySWRdLnB1aWQgPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG9sZFNoaXBzID0gc3RhcnN0YXRlW3N0YXJJZF0uc2hpcHM7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzdGFyc3RhdGVbc3RhcklkXS5wdWlkID09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFyc3RhdGVbc3RhcklkXS5zaGlwcyA9IGZsZWV0LnN0O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnN0YXRlW3N0YXJJZF0uc2hpcHMgKz0gZmxlZXQuc3Q7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgbGV0IGxhbmRpbmdTdHJpbmcgPSBcIuKAg+KAg3swfSArIHsyfSBvbiBbW3szfV1dID0gezF9XCIuZm9ybWF0KG9sZFNoaXBzLCBzdGFyc3RhdGVbc3RhcklkXS5zaGlwcywgZmxlZXQuc3QsIGZsZWV0Lm4pO1xuICAgICAgICAgICAgICAgICAgICBvdXRwdXQucHVzaChsYW5kaW5nU3RyaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgbGFuZGluZ1N0cmluZyA9IGxhbmRpbmdTdHJpbmcuc3Vic3RyaW5nKDIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAoY29uc3QgaSBpbiBhcnJpdmFsKSB7XG4gICAgICAgICAgICAgICAgbGV0IGZsZWV0ID0gYXJyaXZhbFtpXTtcbiAgICAgICAgICAgICAgICBpZiAoZmxlZXQucHVpZCA9PSBzdGFyc3RhdGVbc3RhcklkXS5wdWlkKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBvdXRjb21lU3RyaW5nID0gXCJ7MH0gc2hpcHMgb24gezF9XCIuZm9ybWF0KE1hdGguZmxvb3Ioc3RhcnN0YXRlW3N0YXJJZF0uc2hpcHMpLCBzdGFyc1tzdGFySWRdLm4pO1xuICAgICAgICAgICAgICAgICAgICBmbGVldE91dGNvbWVzW2ZsZWV0LnVpZF0gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBldGE6IHRpY2tUb0V0YVN0cmluZyhmbGVldC5ldGFGaXJzdCksXG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRjb21lOiBvdXRjb21lU3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCBhd3QgPSAwO1xuICAgICAgICAgICAgbGV0IG9mZmVuc2UgPSAwO1xuICAgICAgICAgICAgbGV0IGNvbnRyaWJ1dGlvbiA9IHt9O1xuICAgICAgICAgICAgZm9yIChjb25zdCBpIGluIGFycml2YWwpIHtcbiAgICAgICAgICAgICAgICBsZXQgZmxlZXQgPSBhcnJpdmFsW2ldO1xuICAgICAgICAgICAgICAgIGlmIChmbGVldC5wdWlkICE9IHN0YXJzdGF0ZVtzdGFySWRdLnB1aWQpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IG9sZGEgPSBvZmZlbnNlO1xuICAgICAgICAgICAgICAgICAgICBvZmZlbnNlICs9IGZsZWV0LnN0O1xuICAgICAgICAgICAgICAgICAgICBvdXRwdXQucHVzaChcIuKAg+KAg1tbezR9XV0hIHswfSArIHsyfSBvbiBbW3szfV1dID0gezF9XCIuZm9ybWF0KG9sZGEsIG9mZmVuc2UsIGZsZWV0LnN0LCBmbGVldC5uLCBmbGVldC5wdWlkKSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRyaWJ1dGlvbltbZmxlZXQucHVpZCwgZmxlZXQudWlkXV0gPSBmbGVldC5zdDtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHd0ID0gcGxheWVyc1tmbGVldC5wdWlkXS50ZWNoLndlYXBvbnMubGV2ZWw7XG4gICAgICAgICAgICAgICAgICAgIGlmICh3dCA+IGF3dCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXd0ID0gd3Q7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgYXR0YWNrZXJzQWdncmVnYXRlID0gb2ZmZW5zZTtcbiAgICAgICAgICAgIHdoaWxlIChvZmZlbnNlID4gMCkge1xuICAgICAgICAgICAgICAgIGxldCBkd3QgPSBwbGF5ZXJzW3N0YXJzdGF0ZVtzdGFySWRdLnB1aWRdLnRlY2gud2VhcG9ucy5sZXZlbDtcbiAgICAgICAgICAgICAgICBsZXQgZGVmZW5zZSA9IHN0YXJzdGF0ZVtzdGFySWRdLnNoaXBzO1xuICAgICAgICAgICAgICAgIG91dHB1dC5wdXNoKFwi4oCD4oCDQ29tYmF0ISBbW3swfV1dIGRlZmVuZGluZ1wiLmZvcm1hdChzdGFyc3RhdGVbc3RhcklkXS5wdWlkKSk7XG4gICAgICAgICAgICAgICAgb3V0cHV0LnB1c2goXCLigIPigIPigIPigINEZWZlbmRlcnMgezB9IHNoaXBzLCBXUyB7MX1cIi5mb3JtYXQoZGVmZW5zZSwgZHd0KSk7XG4gICAgICAgICAgICAgICAgb3V0cHV0LnB1c2goXCLigIPigIPigIPigINBdHRhY2tlcnMgezB9IHNoaXBzLCBXUyB7MX1cIi5mb3JtYXQob2ZmZW5zZSwgYXd0KSk7XG4gICAgICAgICAgICAgICAgZHd0ICs9IDE7XG4gICAgICAgICAgICAgICAgaWYgKHN0YXJzdGF0ZVtzdGFySWRdLnB1aWQgIT09IHVuaXZlcnNlLmdhbGF4eS5wbGF5ZXJfdWlkKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb21iYXRIYW5kaWNhcCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGR3dCArPSBjb21iYXRIYW5kaWNhcDtcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dC5wdXNoKFwi4oCD4oCD4oCD4oCDRGVmZW5kZXJzIFdTezB9ID0gezF9XCIuZm9ybWF0KGhhbmRpY2FwU3RyaW5nKFwiXCIpLCBkd3QpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF3dCAtPSBjb21iYXRIYW5kaWNhcDtcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dC5wdXNoKFwi4oCD4oCD4oCD4oCDQXR0YWNrZXJzIFdTezB9ID0gezF9XCIuZm9ybWF0KGhhbmRpY2FwU3RyaW5nKFwiXCIpLCBhd3QpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbWJhdEhhbmRpY2FwID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXd0ICs9IGNvbWJhdEhhbmRpY2FwO1xuICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0LnB1c2goXCLigIPigIPigIPigINBdHRhY2tlcnMgV1N7MH0gPSB7MX1cIi5mb3JtYXQoaGFuZGljYXBTdHJpbmcoXCJcIiksIGF3dCkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZHd0IC09IGNvbWJhdEhhbmRpY2FwO1xuICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0LnB1c2goXCLigIPigIPigIPigINEZWZlbmRlcnMgV1N7MH0gPSB7MX1cIi5mb3JtYXQoaGFuZGljYXBTdHJpbmcoXCJcIiksIGR3dCkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh1bml2ZXJzZS5nYWxheHkucGxheWVyX3VpZCA9PT0gc3RhcnN0YXRlW3N0YXJJZF0ucHVpZCkge1xuICAgICAgICAgICAgICAgICAgICAvLyB0cnVuY2F0ZSBkZWZlbnNlIGlmIHdlJ3JlIGRlZmVuZGluZyB0byBnaXZlIHRoZSBtb3N0XG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnNlcnZhdGl2ZSBlc3RpbWF0ZVxuICAgICAgICAgICAgICAgICAgICBkZWZlbnNlID0gTWF0aC50cnVuYyhkZWZlbnNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgd2hpbGUgKGRlZmVuc2UgPiAwICYmIG9mZmVuc2UgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIG9mZmVuc2UgLT0gZHd0O1xuICAgICAgICAgICAgICAgICAgICBpZiAob2ZmZW5zZSA8PSAwKVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGRlZmVuc2UgLT0gYXd0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBsZXQgbmV3QWdncmVnYXRlID0gMDtcbiAgICAgICAgICAgICAgICBsZXQgcGxheWVyQ29udHJpYnV0aW9uID0ge307XG4gICAgICAgICAgICAgICAgbGV0IGJpZ2dlc3RQbGF5ZXIgPSAtMTtcbiAgICAgICAgICAgICAgICBsZXQgYmlnZ2VzdFBsYXllcklkID0gc3RhcnN0YXRlW3N0YXJJZF0ucHVpZDtcbiAgICAgICAgICAgICAgICBpZiAob2ZmZW5zZSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0LnB1c2goXCLigIPigINBdHRhY2tlcnMgd2luIHdpdGggezB9IHNoaXBzIHJlbWFpbmluZ1wiLmZvcm1hdChvZmZlbnNlKSk7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgayBpbiBjb250cmlidXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBrYSA9IGsuc3BsaXQoXCIsXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGZsZWV0ID0gZmxlZXRzW2thWzFdXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBwbGF5ZXJJZCA9IGthWzBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udHJpYnV0aW9uW2tdID0gKG9mZmVuc2UgKiBjb250cmlidXRpb25ba10pIC8gYXR0YWNrZXJzQWdncmVnYXRlO1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV3QWdncmVnYXRlICs9IGNvbnRyaWJ1dGlvbltrXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwbGF5ZXJDb250cmlidXRpb25bcGxheWVySWRdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGxheWVyQ29udHJpYnV0aW9uW3BsYXllcklkXSArPSBjb250cmlidXRpb25ba107XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbGF5ZXJDb250cmlidXRpb25bcGxheWVySWRdID0gY29udHJpYnV0aW9uW2tdO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBsYXllckNvbnRyaWJ1dGlvbltwbGF5ZXJJZF0gPiBiaWdnZXN0UGxheWVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmlnZ2VzdFBsYXllciA9IHBsYXllckNvbnRyaWJ1dGlvbltwbGF5ZXJJZF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmlnZ2VzdFBsYXllcklkID0gcGxheWVySWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXQucHVzaChcIuKAg+KAg+KAg+KAg1tbezB9XV0gaGFzIHsxfSBvbiBbW3syfV1dXCIuZm9ybWF0KGZsZWV0LnB1aWQsIGNvbnRyaWJ1dGlvbltrXSwgZmxlZXQubikpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG91dGNvbWVTdHJpbmcgPSBcIldpbnMhIHswfSBsYW5kLlwiLmZvcm1hdChjb250cmlidXRpb25ba10pO1xuICAgICAgICAgICAgICAgICAgICAgICAgZmxlZXRPdXRjb21lc1tmbGVldC51aWRdID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV0YTogdGlja1RvRXRhU3RyaW5nKGZsZWV0LmV0YUZpcnN0KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRjb21lOiBvdXRjb21lU3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBvZmZlbnNlID0gbmV3QWdncmVnYXRlIC0gcGxheWVyQ29udHJpYnV0aW9uW2JpZ2dlc3RQbGF5ZXJJZF07XG4gICAgICAgICAgICAgICAgICAgIHN0YXJzdGF0ZVtzdGFySWRdLnB1aWQgPSBiaWdnZXN0UGxheWVySWQ7XG4gICAgICAgICAgICAgICAgICAgIHN0YXJzdGF0ZVtzdGFySWRdLnNoaXBzID0gcGxheWVyQ29udHJpYnV0aW9uW2JpZ2dlc3RQbGF5ZXJJZF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzdGFyc3RhdGVbc3RhcklkXS5zaGlwcyA9IGRlZmVuc2U7XG4gICAgICAgICAgICAgICAgICAgIGZvciAoY29uc3QgaSBpbiBhcnJpdmFsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZmxlZXQgPSBhcnJpdmFsW2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGZsZWV0LnB1aWQgPT0gc3RhcnN0YXRlW3N0YXJJZF0ucHVpZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBvdXRjb21lU3RyaW5nID0gXCJ7MH0gc2hpcHMgb24gezF9XCIuZm9ybWF0KE1hdGguZmxvb3Ioc3RhcnN0YXRlW3N0YXJJZF0uc2hpcHMpLCBzdGFyc1tzdGFySWRdLm4pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZsZWV0T3V0Y29tZXNbZmxlZXQudWlkXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXRhOiB0aWNrVG9FdGFTdHJpbmcoZmxlZXQuZXRhRmlyc3QpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRjb21lOiBvdXRjb21lU3RyaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZm9yIChjb25zdCBrIGluIGNvbnRyaWJ1dGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGthID0gay5zcGxpdChcIixcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZmxlZXQgPSBmbGVldHNba2FbMV1dO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IG91dGNvbWVTdHJpbmcgPSBcIkxvc2VzISB7MH0gbGl2ZS5cIi5mb3JtYXQoZGVmZW5zZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBmbGVldE91dGNvbWVzW2ZsZWV0LnVpZF0gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZXRhOiB0aWNrVG9FdGFTdHJpbmcoZmxlZXQuZXRhRmlyc3QpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dGNvbWU6IG91dGNvbWVTdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGF0dGFja2Vyc0FnZ3JlZ2F0ZSA9IG9mZmVuc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvdXRwdXQucHVzaChcIuKAg+KAg1tbezB9XV0gW1t7MX1dXSB7Mn0gc2hpcHNcIi5mb3JtYXQoc3RhcnN0YXRlW3N0YXJJZF0ucHVpZCwgc3RhcnNbc3RhcklkXS5uLCBzdGFyc3RhdGVbc3RhcklkXS5zaGlwcykpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgfTtcbiAgICBmdW5jdGlvbiBpbmNDb21iYXRIYW5kaWNhcCgpIHtcbiAgICAgICAgY29tYmF0SGFuZGljYXAgKz0gMTtcbiAgICB9XG4gICAgZnVuY3Rpb24gZGVjQ29tYmF0SGFuZGljYXAoKSB7XG4gICAgICAgIGNvbWJhdEhhbmRpY2FwIC09IDE7XG4gICAgfVxuICAgIGhvdGtleShcIi5cIiwgaW5jQ29tYmF0SGFuZGljYXApO1xuICAgIGluY0NvbWJhdEhhbmRpY2FwLmhlbHAgPVxuICAgICAgICBcIkNoYW5nZSBjb21iYXQgY2FsY3VsYXRpb24gdG8gY3JlZGl0IHlvdXIgZW5lbWllcyB3aXRoICsxIHdlYXBvbnMuIFVzZWZ1bCBcIiArXG4gICAgICAgICAgICBcImlmIHlvdSBzdXNwZWN0IHRoZXkgd2lsbCBoYXZlIGFjaGlldmVkIHRoZSBuZXh0IGxldmVsIG9mIHRlY2ggYmVmb3JlIGEgYmF0dGxlIHlvdSBhcmUgaW52ZXN0aWdhdGluZy5cIiArXG4gICAgICAgICAgICBcIjxwPkluIHRoZSBsb3dlciBsZWZ0IG9mIHRoZSBIVUQsIGFuIGluZGljYXRvciB3aWxsIGFwcGVhciByZW1pbmRpbmcgeW91IG9mIHRoZSB3ZWFwb25zIGFkanVzdG1lbnQuIElmIHRoZSBcIiArXG4gICAgICAgICAgICBcImluZGljYXRvciBhbHJlYWR5IHNob3dzIGFuIGFkdmFudGFnZSBmb3IgZGVmZW5kZXJzLCB0aGlzIGhvdGtleSB3aWxsIHJlZHVjZSB0aGF0IGFkdmFudGFnZSBmaXJzdCBiZWZvcmUgY3JlZGl0aW5nIFwiICtcbiAgICAgICAgICAgIFwid2VhcG9ucyB0byB5b3VyIG9wcG9uZW50LlwiO1xuICAgIGhvdGtleShcIixcIiwgZGVjQ29tYmF0SGFuZGljYXApO1xuICAgIGRlY0NvbWJhdEhhbmRpY2FwLmhlbHAgPVxuICAgICAgICBcIkNoYW5nZSBjb21iYXQgY2FsY3VsYXRpb24gdG8gY3JlZGl0IHlvdXJzZWxmIHdpdGggKzEgd2VhcG9ucy4gVXNlZnVsIFwiICtcbiAgICAgICAgICAgIFwid2hlbiB5b3Ugd2lsbCBoYXZlIGFjaGlldmVkIHRoZSBuZXh0IGxldmVsIG9mIHRlY2ggYmVmb3JlIGEgYmF0dGxlIHlvdSBhcmUgaW52ZXN0aWdhdGluZy5cIiArXG4gICAgICAgICAgICBcIjxwPkluIHRoZSBsb3dlciBsZWZ0IG9mIHRoZSBIVUQsIGFuIGluZGljYXRvciB3aWxsIGFwcGVhciByZW1pbmRpbmcgeW91IG9mIHRoZSB3ZWFwb25zIGFkanVzdG1lbnQuIFdoZW4gXCIgK1xuICAgICAgICAgICAgXCJpbmRpY2F0b3IgYWxyZWFkeSBzaG93cyBhbiBhZHZhbnRhZ2UgZm9yIGF0dGFja2VycywgdGhpcyBob3RrZXkgd2lsbCByZWR1Y2UgdGhhdCBhZHZhbnRhZ2UgZmlyc3QgYmVmb3JlIGNyZWRpdGluZyBcIiArXG4gICAgICAgICAgICBcIndlYXBvbnMgdG8geW91LlwiO1xuICAgIGZ1bmN0aW9uIGxvbmdGbGVldFJlcG9ydCgpIHtcbiAgICAgICAgY2xpcChjb21iYXRPdXRjb21lcygpLmpvaW4oXCJcXG5cIikpO1xuICAgIH1cbiAgICBob3RrZXkoXCImXCIsIGxvbmdGbGVldFJlcG9ydCk7XG4gICAgbG9uZ0ZsZWV0UmVwb3J0LmhlbHAgPVxuICAgICAgICBcIkdlbmVyYXRlIGEgZGV0YWlsZWQgZmxlZXQgcmVwb3J0IG9uIGFsbCBjYXJyaWVycyBpbiB5b3VyIHNjYW5uaW5nIHJhbmdlLCBhbmQgY29weSBpdCB0byB0aGUgY2xpcGJvYXJkLlwiICtcbiAgICAgICAgICAgIFwiPHA+VGhpcyBzYW1lIHJlcG9ydCBjYW4gYWxzbyBiZSB2aWV3ZWQgdmlhIHRoZSBtZW51OyBlbnRlciB0aGUgYWdlbnQgYW5kIGNob29zZSBpdCBmcm9tIHRoZSBkcm9wZG93bi5cIjtcbiAgICBmdW5jdGlvbiBicmllZkZsZWV0UmVwb3J0KCkge1xuICAgICAgICB2YXIgX2E7XG4gICAgICAgIGxldCBmbGVldHMgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlLmdhbGF4eS5mbGVldHM7XG4gICAgICAgIGxldCBzdGFycyA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2UuZ2FsYXh5LnN0YXJzO1xuICAgICAgICBsZXQgZmxpZ2h0cyA9IFtdO1xuICAgICAgICBmb3IgKGNvbnN0IGYgaW4gZmxlZXRzKSB7XG4gICAgICAgICAgICBsZXQgZmxlZXQgPSBmbGVldHNbZl07XG4gICAgICAgICAgICBpZiAoZmxlZXQubyAmJiBmbGVldC5vLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBsZXQgc3RvcCA9IGZsZWV0Lm9bMF1bMV07XG4gICAgICAgICAgICAgICAgbGV0IHRpY2tzID0gZmxlZXQuZXRhRmlyc3Q7XG4gICAgICAgICAgICAgICAgbGV0IHN0YXJuYW1lID0gKF9hID0gc3RhcnNbc3RvcF0pID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5uO1xuICAgICAgICAgICAgICAgIGlmICghc3Rhcm5hbWUpXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIGZsaWdodHMucHVzaChbXG4gICAgICAgICAgICAgICAgICAgIHRpY2tzLFxuICAgICAgICAgICAgICAgICAgICBcIltbezB9XV0gW1t7MX1dXSB7Mn0g4oaSIFtbezN9XV0gezR9XCIuZm9ybWF0KGZsZWV0LnB1aWQsIGZsZWV0Lm4sIGZsZWV0LnN0LCBzdGFyc1tzdG9wXS5uLCB0aWNrVG9FdGFTdHJpbmcodGlja3MsIFwiXCIpKSxcbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmbGlnaHRzID0gZmxpZ2h0cy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgICAgICByZXR1cm4gYVswXSAtIGJbMF07XG4gICAgICAgIH0pO1xuICAgICAgICBjbGlwKGZsaWdodHMubWFwKCh4KSA9PiB4WzFdKS5qb2luKFwiXFxuXCIpKTtcbiAgICB9XG4gICAgaG90a2V5KFwiXlwiLCBicmllZkZsZWV0UmVwb3J0KTtcbiAgICBicmllZkZsZWV0UmVwb3J0LmhlbHAgPVxuICAgICAgICBcIkdlbmVyYXRlIGEgc3VtbWFyeSBmbGVldCByZXBvcnQgb24gYWxsIGNhcnJpZXJzIGluIHlvdXIgc2Nhbm5pbmcgcmFuZ2UsIGFuZCBjb3B5IGl0IHRvIHRoZSBjbGlwYm9hcmQuXCIgK1xuICAgICAgICAgICAgXCI8cD5UaGlzIHNhbWUgcmVwb3J0IGNhbiBhbHNvIGJlIHZpZXdlZCB2aWEgdGhlIG1lbnU7IGVudGVyIHRoZSBhZ2VudCBhbmQgY2hvb3NlIGl0IGZyb20gdGhlIGRyb3Bkb3duLlwiO1xuICAgIGZ1bmN0aW9uIHNjcmVlbnNob3QoKSB7XG4gICAgICAgIGxldCBtYXAgPSBOZXB0dW5lc1ByaWRlLm5wdWkubWFwO1xuICAgICAgICBjbGlwKG1hcC5jYW52YXNbMF0udG9EYXRhVVJMKFwiaW1hZ2Uvd2VicFwiLCAwLjA1KSk7XG4gICAgfVxuICAgIGhvdGtleShcIiNcIiwgc2NyZWVuc2hvdCk7XG4gICAgc2NyZWVuc2hvdC5oZWxwID1cbiAgICAgICAgXCJDcmVhdGUgYSBkYXRhOiBVUkwgb2YgdGhlIGN1cnJlbnQgbWFwLiBQYXN0ZSBpdCBpbnRvIGEgYnJvd3NlciB3aW5kb3cgdG8gdmlldy4gVGhpcyBpcyBsaWtlbHkgdG8gYmUgcmVtb3ZlZC5cIjtcbiAgICBsZXQgaG9tZVBsYW5ldHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGxldCBwID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5nYWxheHkucGxheWVycztcbiAgICAgICAgbGV0IG91dHB1dCA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpIGluIHApIHtcbiAgICAgICAgICAgIGxldCBob21lID0gcFtpXS5ob21lO1xuICAgICAgICAgICAgaWYgKGhvbWUpIHtcbiAgICAgICAgICAgICAgICBvdXRwdXQucHVzaChcIlBsYXllciAjezB9IGlzIFtbezB9XV0gaG9tZSB7Mn0gW1t7MX1dXVwiLmZvcm1hdChpLCBob21lLm4sIGkgPT0gaG9tZS5wdWlkID8gXCJpc1wiIDogXCJ3YXNcIikpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgb3V0cHV0LnB1c2goXCJQbGF5ZXIgI3swfSBpcyBbW3swfV1dIGhvbWUgdW5rbm93blwiLmZvcm1hdChpKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2xpcChvdXRwdXQuam9pbihcIlxcblwiKSk7XG4gICAgfTtcbiAgICBob3RrZXkoXCIhXCIsIGhvbWVQbGFuZXRzKTtcbiAgICBob21lUGxhbmV0cy5oZWxwID1cbiAgICAgICAgXCJHZW5lcmF0ZSBhIHBsYXllciBzdW1tYXJ5IHJlcG9ydCBhbmQgY29weSBpdCB0byB0aGUgY2xpcGJvYXJkLlwiICtcbiAgICAgICAgICAgIFwiPHA+VGhpcyBzYW1lIHJlcG9ydCBjYW4gYWxzbyBiZSB2aWV3ZWQgdmlhIHRoZSBtZW51OyBlbnRlciB0aGUgYWdlbnQgYW5kIGNob29zZSBpdCBmcm9tIHRoZSBkcm9wZG93bi4gXCIgK1xuICAgICAgICAgICAgXCJJdCBpcyBtb3N0IHVzZWZ1bCBmb3IgZGlzY292ZXJpbmcgcGxheWVyIG51bWJlcnMgc28gdGhhdCB5b3UgY2FuIHdyaXRlIFtbI11dIHRvIHJlZmVyZW5jZSBhIHBsYXllciBpbiBtYWlsLlwiO1xuICAgIGxldCBwbGF5ZXJTaGVldCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgbGV0IHAgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlLmdhbGF4eS5wbGF5ZXJzO1xuICAgICAgICBsZXQgb3V0cHV0ID0gW107XG4gICAgICAgIGxldCBmaWVsZHMgPSBbXG4gICAgICAgICAgICBcImFsaWFzXCIsXG4gICAgICAgICAgICBcInRvdGFsX3N0YXJzXCIsXG4gICAgICAgICAgICBcInNoaXBzUGVyVGlja1wiLFxuICAgICAgICAgICAgXCJ0b3RhbF9zdHJlbmd0aFwiLFxuICAgICAgICAgICAgXCJ0b3RhbF9lY29ub215XCIsXG4gICAgICAgICAgICBcInRvdGFsX2ZsZWV0c1wiLFxuICAgICAgICAgICAgXCJ0b3RhbF9pbmR1c3RyeVwiLFxuICAgICAgICAgICAgXCJ0b3RhbF9zY2llbmNlXCIsXG4gICAgICAgIF07XG4gICAgICAgIG91dHB1dC5wdXNoKGZpZWxkcy5qb2luKFwiLFwiKSk7XG4gICAgICAgIGZvciAobGV0IGkgaW4gcCkge1xuICAgICAgICAgICAgcGxheWVyID0gT2JqZWN0LmFzc2lnbih7fSwgcFtpXSk7XG4gICAgICAgICAgICBjb25zdCByZWNvcmQgPSBmaWVsZHMubWFwKChmKSA9PiBwW2ldW2ZdKTtcbiAgICAgICAgICAgIG91dHB1dC5wdXNoKHJlY29yZC5qb2luKFwiLFwiKSk7XG4gICAgICAgIH1cbiAgICAgICAgY2xpcChvdXRwdXQuam9pbihcIlxcblwiKSk7XG4gICAgfTtcbiAgICBob3RrZXkoXCIkXCIsIHBsYXllclNoZWV0KTtcbiAgICBwbGF5ZXJTaGVldC5oZWxwID1cbiAgICAgICAgXCJHZW5lcmF0ZSBhIHBsYXllciBzdW1tYXJ5IG1lYW4gdG8gYmUgbWFkZSBpbnRvIGEgc3ByZWFkc2hlZXQuXCIgK1xuICAgICAgICAgICAgXCI8cD5UaGUgY2xpcGJvYXJkIHNob3VsZCBiZSBwYXN0ZWQgaW50byBhIENTViBhbmQgdGhlbiBpbXBvcnRlZC5cIjtcbiAgICBsZXQgaG9va3NMb2FkZWQgPSBmYWxzZTtcbiAgICBsZXQgaGFuZGljYXBTdHJpbmcgPSBmdW5jdGlvbiAocHJlZml4KSB7XG4gICAgICAgIGxldCBwID0gcHJlZml4ICE9PSB1bmRlZmluZWQgPyBwcmVmaXggOiBjb21iYXRIYW5kaWNhcCA+IDAgPyBcIkVuZW15IFdTXCIgOiBcIk15IFdTXCI7XG4gICAgICAgIHJldHVybiBwICsgKGNvbWJhdEhhbmRpY2FwID4gMCA/IFwiK1wiIDogXCJcIikgKyBjb21iYXRIYW5kaWNhcDtcbiAgICB9O1xuICAgIGxldCBsb2FkSG9va3MgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHBvc3RfaG9vaygpO1xuICAgICAgICBsZXQgc3VwZXJEcmF3VGV4dCA9IE5lcHR1bmVzUHJpZGUubnB1aS5tYXAuZHJhd1RleHQ7XG4gICAgICAgIE5lcHR1bmVzUHJpZGUubnB1aS5tYXAuZHJhd1RleHQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBsZXQgdW5pdmVyc2UgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlO1xuICAgICAgICAgICAgbGV0IG1hcCA9IE5lcHR1bmVzUHJpZGUubnB1aS5tYXA7XG4gICAgICAgICAgICBzdXBlckRyYXdUZXh0KCk7XG4gICAgICAgICAgICBtYXAuY29udGV4dC5mb250ID0gYCR7MTQgKiBtYXAucGl4ZWxSYXRpb31weCBPcGVuU2Fuc1JlZ3VsYXIsIHNhbnMtc2VyaWZgO1xuICAgICAgICAgICAgbWFwLmNvbnRleHQuZmlsbFN0eWxlID0gXCIjRkYwMDAwXCI7XG4gICAgICAgICAgICBtYXAuY29udGV4dC50ZXh0QWxpZ24gPSBcInJpZ2h0XCI7XG4gICAgICAgICAgICBtYXAuY29udGV4dC50ZXh0QmFzZWxpbmUgPSBcIm1pZGRsZVwiO1xuICAgICAgICAgICAgbGV0IHYgPSB2ZXJzaW9uO1xuICAgICAgICAgICAgaWYgKGNvbWJhdEhhbmRpY2FwICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgdiA9IGAke2hhbmRpY2FwU3RyaW5nKCl9ICR7dn1gO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZHJhd092ZXJsYXlTdHJpbmcobWFwLmNvbnRleHQsIHYsIG1hcC52aWV3cG9ydFdpZHRoIC0gMTAsIG1hcC52aWV3cG9ydEhlaWdodCAtIDE2ICogbWFwLnBpeGVsUmF0aW8pO1xuICAgICAgICAgICAgaWYgKE5lcHR1bmVzUHJpZGUub3JpZ2luYWxQbGF5ZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIE5lcHR1bmVzUHJpZGUub3JpZ2luYWxQbGF5ZXIgPSB1bml2ZXJzZS5wbGF5ZXIudWlkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKE5lcHR1bmVzUHJpZGUub3JpZ2luYWxQbGF5ZXIgIT09IHVuaXZlcnNlLnBsYXllci51aWQpIHtcbiAgICAgICAgICAgICAgICBsZXQgbiA9IHVuaXZlcnNlLmdhbGF4eS5wbGF5ZXJzW3VuaXZlcnNlLnBsYXllci51aWRdLmFsaWFzO1xuICAgICAgICAgICAgICAgIGRyYXdPdmVybGF5U3RyaW5nKG1hcC5jb250ZXh0LCBuLCBtYXAudmlld3BvcnRXaWR0aCAtIDEwMCwgbWFwLnZpZXdwb3J0SGVpZ2h0IC0gMiAqIDE2ICogbWFwLnBpeGVsUmF0aW8pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHVuaXZlcnNlLnNlbGVjdGVkRmxlZXQgJiYgdW5pdmVyc2Uuc2VsZWN0ZWRGbGVldC5wYXRoLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKFwiU2VsZWN0ZWQgZmxlZXRcIiwgdW5pdmVyc2Uuc2VsZWN0ZWRGbGVldCk7XG4gICAgICAgICAgICAgICAgbWFwLmNvbnRleHQuZm9udCA9IGAkezE0ICogbWFwLnBpeGVsUmF0aW99cHggT3BlblNhbnNSZWd1bGFyLCBzYW5zLXNlcmlmYDtcbiAgICAgICAgICAgICAgICBtYXAuY29udGV4dC5maWxsU3R5bGUgPSBcIiNGRjAwMDBcIjtcbiAgICAgICAgICAgICAgICBtYXAuY29udGV4dC50ZXh0QWxpZ24gPSBcImxlZnRcIjtcbiAgICAgICAgICAgICAgICBtYXAuY29udGV4dC50ZXh0QmFzZWxpbmUgPSBcIm1pZGRsZVwiO1xuICAgICAgICAgICAgICAgIGxldCBkeSA9IHVuaXZlcnNlLnNlbGVjdGVkRmxlZXQueSAtIHVuaXZlcnNlLnNlbGVjdGVkRmxlZXQubHk7XG4gICAgICAgICAgICAgICAgbGV0IGR4ID0gdW5pdmVyc2Uuc2VsZWN0ZWRGbGVldC54IC0gdW5pdmVyc2Uuc2VsZWN0ZWRGbGVldC5seDtcbiAgICAgICAgICAgICAgICBkeSA9IHVuaXZlcnNlLnNlbGVjdGVkRmxlZXQucGF0aFswXS55IC0gdW5pdmVyc2Uuc2VsZWN0ZWRGbGVldC55O1xuICAgICAgICAgICAgICAgIGR4ID0gdW5pdmVyc2Uuc2VsZWN0ZWRGbGVldC5wYXRoWzBdLnggLSB1bml2ZXJzZS5zZWxlY3RlZEZsZWV0Lng7XG4gICAgICAgICAgICAgICAgbGV0IGxpbmVIZWlnaHQgPSAxNiAqIG1hcC5waXhlbFJhdGlvO1xuICAgICAgICAgICAgICAgIGxldCByYWRpdXMgPSAyICogMC4wMjggKiBtYXAuc2NhbGUgKiBtYXAucGl4ZWxSYXRpbztcbiAgICAgICAgICAgICAgICBsZXQgYW5nbGUgPSBNYXRoLmF0YW4oZHkgLyBkeCk7XG4gICAgICAgICAgICAgICAgbGV0IG9mZnNldHggPSByYWRpdXMgKiBNYXRoLmNvcyhhbmdsZSk7XG4gICAgICAgICAgICAgICAgbGV0IG9mZnNldHkgPSByYWRpdXMgKiBNYXRoLnNpbihhbmdsZSk7XG4gICAgICAgICAgICAgICAgaWYgKG9mZnNldHggPiAwICYmIGR4ID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBvZmZzZXR4ICo9IC0xO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAob2Zmc2V0eSA+IDAgJiYgZHkgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIG9mZnNldHkgKj0gLTE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChvZmZzZXR4IDwgMCAmJiBkeCA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0eCAqPSAtMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG9mZnNldHkgPCAwICYmIGR5IDwgMCkge1xuICAgICAgICAgICAgICAgICAgICBvZmZzZXR5ICo9IC0xO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb21iYXRPdXRjb21lcygpO1xuICAgICAgICAgICAgICAgIGxldCBzID0gZmxlZXRPdXRjb21lc1t1bml2ZXJzZS5zZWxlY3RlZEZsZWV0LnVpZF0uZXRhO1xuICAgICAgICAgICAgICAgIGxldCBvID0gZmxlZXRPdXRjb21lc1t1bml2ZXJzZS5zZWxlY3RlZEZsZWV0LnVpZF0ub3V0Y29tZTtcbiAgICAgICAgICAgICAgICBsZXQgeCA9IG1hcC53b3JsZFRvU2NyZWVuWCh1bml2ZXJzZS5zZWxlY3RlZEZsZWV0LngpICsgb2Zmc2V0eDtcbiAgICAgICAgICAgICAgICBsZXQgeSA9IG1hcC53b3JsZFRvU2NyZWVuWSh1bml2ZXJzZS5zZWxlY3RlZEZsZWV0LnkpICsgb2Zmc2V0eTtcbiAgICAgICAgICAgICAgICBpZiAob2Zmc2V0eCA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgbWFwLmNvbnRleHQudGV4dEFsaWduID0gXCJyaWdodFwiO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBkcmF3T3ZlcmxheVN0cmluZyhtYXAuY29udGV4dCwgcywgeCwgeSk7XG4gICAgICAgICAgICAgICAgZHJhd092ZXJsYXlTdHJpbmcobWFwLmNvbnRleHQsIG8sIHgsIHkgKyBsaW5lSGVpZ2h0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghTmVwdHVuZXNQcmlkZS5nYW1lQ29uZmlnLnR1cm5CYXNlZCAmJlxuICAgICAgICAgICAgICAgIHVuaXZlcnNlLnRpbWVUb1RpY2soMSkubGVuZ3RoIDwgMykge1xuICAgICAgICAgICAgICAgIGxldCBsaW5lSGVpZ2h0ID0gMTYgKiBtYXAucGl4ZWxSYXRpbztcbiAgICAgICAgICAgICAgICBtYXAuY29udGV4dC5mb250ID0gYCR7MTQgKiBtYXAucGl4ZWxSYXRpb31weCBPcGVuU2Fuc1JlZ3VsYXIsIHNhbnMtc2VyaWZgO1xuICAgICAgICAgICAgICAgIG1hcC5jb250ZXh0LmZpbGxTdHlsZSA9IFwiI0ZGMDAwMFwiO1xuICAgICAgICAgICAgICAgIG1hcC5jb250ZXh0LnRleHRBbGlnbiA9IFwibGVmdFwiO1xuICAgICAgICAgICAgICAgIG1hcC5jb250ZXh0LnRleHRCYXNlbGluZSA9IFwibWlkZGxlXCI7XG4gICAgICAgICAgICAgICAgbGV0IHMgPSBcIlRpY2sgPCAxMHMgYXdheSFcIjtcbiAgICAgICAgICAgICAgICBpZiAodW5pdmVyc2UudGltZVRvVGljaygxKSA9PT0gXCIwc1wiKSB7XG4gICAgICAgICAgICAgICAgICAgIHMgPSBcIlRpY2sgcGFzc2VkLiBDbGljayBwcm9kdWN0aW9uIGNvdW50ZG93biB0byByZWZyZXNoLlwiO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBkcmF3T3ZlcmxheVN0cmluZyhtYXAuY29udGV4dCwgcywgMTAwMCwgbGluZUhlaWdodCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodW5pdmVyc2Uuc2VsZWN0ZWRTdGFyICYmXG4gICAgICAgICAgICAgICAgdW5pdmVyc2Uuc2VsZWN0ZWRTdGFyLnB1aWQgIT0gdW5pdmVyc2UucGxheWVyLnVpZCAmJlxuICAgICAgICAgICAgICAgIHVuaXZlcnNlLnNlbGVjdGVkU3Rhci5wdWlkICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIC8vIGVuZW15IHN0YXIgc2VsZWN0ZWQ7IHNob3cgSFVEIGZvciBzY2FubmluZyB2aXNpYmlsaXR5XG4gICAgICAgICAgICAgICAgbWFwLmNvbnRleHQudGV4dEFsaWduID0gXCJsZWZ0XCI7XG4gICAgICAgICAgICAgICAgbWFwLmNvbnRleHQudGV4dEJhc2VsaW5lID0gXCJtaWRkbGVcIjtcbiAgICAgICAgICAgICAgICBsZXQgeE9mZnNldCA9IDI2ICogbWFwLnBpeGVsUmF0aW87XG4gICAgICAgICAgICAgICAgLy9tYXAuY29udGV4dC50cmFuc2xhdGUoeE9mZnNldCwgMCk7XG4gICAgICAgICAgICAgICAgbGV0IGZsZWV0cyA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2UuZ2FsYXh5LmZsZWV0cztcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGYgaW4gZmxlZXRzKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBmbGVldCA9IGZsZWV0c1tmXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZsZWV0LnB1aWQgPT09IHVuaXZlcnNlLnBsYXllci51aWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBkeCA9IHVuaXZlcnNlLnNlbGVjdGVkU3Rhci54IC0gZmxlZXQueDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBkeSA9IHVuaXZlcnNlLnNlbGVjdGVkU3Rhci55IC0gZmxlZXQueTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBkaXN0YW5jZSA9IE1hdGguc3FydChkeCAqIGR4ICsgZHkgKiBkeSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgb2Zmc2V0eCA9IHhPZmZzZXQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgb2Zmc2V0eSA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgeCA9IG1hcC53b3JsZFRvU2NyZWVuWChmbGVldC54KSArIG9mZnNldHg7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgeSA9IG1hcC53b3JsZFRvU2NyZWVuWShmbGVldC55KSArIG9mZnNldHk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGlzdGFuY2UgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVuaXZlcnNlLmdhbGF4eS5wbGF5ZXJzW3VuaXZlcnNlLnNlbGVjdGVkU3Rhci5wdWlkXS50ZWNoLnNjYW5uaW5nXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmbGVldC5wYXRoICYmIGZsZWV0LnBhdGgubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkeCA9IGZsZWV0LnBhdGhbMF0ueCAtIHVuaXZlcnNlLnNlbGVjdGVkU3Rhci54O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkeSA9IGZsZWV0LnBhdGhbMF0ueSAtIHVuaXZlcnNlLnNlbGVjdGVkU3Rhci55O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXN0YW5jZSA9IE1hdGguc3FydChkeCAqIGR4ICsgZHkgKiBkeSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkaXN0YW5jZSA8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bml2ZXJzZS5nYWxheHkucGxheWVyc1t1bml2ZXJzZS5zZWxlY3RlZFN0YXIucHVpZF0udGVjaFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zY2FubmluZy52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHN0ZXBSYWRpdXMgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlLmdhbGF4eS5mbGVldF9zcGVlZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmbGVldC53YXJwU3BlZWQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RlcFJhZGl1cyAqPSAzO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZHggPSBmbGVldC54IC0gZmxlZXQucGF0aFswXS54O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZHkgPSBmbGVldC55IC0gZmxlZXQucGF0aFswXS55O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGFuZ2xlID0gTWF0aC5hdGFuKGR5IC8gZHgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHN0ZXB4ID0gc3RlcFJhZGl1cyAqIE1hdGguY29zKGFuZ2xlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxldCBzdGVweSA9IHN0ZXBSYWRpdXMgKiBNYXRoLnNpbihhbmdsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3RlcHggPiAwICYmIGR4ID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ZXB4ICo9IC0xO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN0ZXB5ID4gMCAmJiBkeSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGVweSAqPSAtMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdGVweCA8IDAgJiYgZHggPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RlcHggKj0gLTE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3RlcHkgPCAwICYmIGR5IDwgMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ZXB5ICo9IC0xO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHRpY2tzID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsZXQgeCA9IHRpY2tzICogc3RlcHggKyBOdW1iZXIoZmxlZXQueCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHkgPSB0aWNrcyAqIHN0ZXB5ICsgTnVtYmVyKGZsZWV0LnkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vbGV0IHN4ID0gbWFwLndvcmxkVG9TY3JlZW5YKHgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vbGV0IHN5ID0gbWFwLndvcmxkVG9TY3JlZW5ZKHkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGR4ID0geCAtIHVuaXZlcnNlLnNlbGVjdGVkU3Rhci54O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGR5ID0geSAtIHVuaXZlcnNlLnNlbGVjdGVkU3Rhci55O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3RhbmNlID0gTWF0aC5zcXJ0KGR4ICogZHggKyBkeSAqIGR5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGRpc3RhbmNlLCB4LCB5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2RyYXdPdmVybGF5U3RyaW5nKG1hcC5jb250ZXh0LCBcIm9cIiwgc3gsIHN5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aWNrcyArPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSB3aGlsZSAoZGlzdGFuY2UgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVuaXZlcnNlLmdhbGF4eS5wbGF5ZXJzW3VuaXZlcnNlLnNlbGVjdGVkU3Rhci5wdWlkXS50ZWNoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zY2FubmluZy52YWx1ZSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpY2tzIDw9IGZsZWV0LmV0YUZpcnN0ICsgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aWNrcyAtPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHZpc0NvbG9yID0gXCIjMDBmZjAwXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYW55U3RhckNhblNlZSh1bml2ZXJzZS5zZWxlY3RlZFN0YXIucHVpZCwgZmxlZXQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlzQ29sb3IgPSBcIiM4ODg4ODhcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRyYXdPdmVybGF5U3RyaW5nKG1hcC5jb250ZXh0LCBgU2NhbiAke3RpY2tUb0V0YVN0cmluZyh0aWNrcyl9YCwgeCwgeSwgdmlzQ29sb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vbWFwLmNvbnRleHQudHJhbnNsYXRlKC14T2Zmc2V0LCAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh1bml2ZXJzZS5ydWxlci5zdGFycy5sZW5ndGggPT0gMikge1xuICAgICAgICAgICAgICAgIGxldCBwMSA9IHVuaXZlcnNlLnJ1bGVyLnN0YXJzWzBdLnB1aWQ7XG4gICAgICAgICAgICAgICAgbGV0IHAyID0gdW5pdmVyc2UucnVsZXIuc3RhcnNbMV0ucHVpZDtcbiAgICAgICAgICAgICAgICBpZiAocDEgIT09IHAyICYmIHAxICE9PSAtMSAmJiBwMiAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhcInR3byBzdGFyIHJ1bGVyXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgLy9UT0RPOiBMZWFybiBtb3JlIGFib3V0IHRoaXMgaG9vay4gaXRzIHJ1biB0b28gbXVjaC4uXG4gICAgICAgIENydXguZm9ybWF0ID0gZnVuY3Rpb24gKHMsIHRlbXBsYXRlRGF0YSkge1xuICAgICAgICAgICAgaWYgKCFzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiZXJyb3JcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBpO1xuICAgICAgICAgICAgdmFyIGZwO1xuICAgICAgICAgICAgdmFyIHNwO1xuICAgICAgICAgICAgdmFyIHN1YjtcbiAgICAgICAgICAgIHZhciBwYXR0ZXJuO1xuICAgICAgICAgICAgaSA9IDA7XG4gICAgICAgICAgICBmcCA9IDA7XG4gICAgICAgICAgICBzcCA9IDA7XG4gICAgICAgICAgICBzdWIgPSBcIlwiO1xuICAgICAgICAgICAgcGF0dGVybiA9IFwiXCI7XG4gICAgICAgICAgICAvLyBsb29rIGZvciBzdGFuZGFyZCBwYXR0ZXJuc1xuICAgICAgICAgICAgd2hpbGUgKGZwID49IDAgJiYgaSA8IDEwMDApIHtcbiAgICAgICAgICAgICAgICBpID0gaSArIDE7XG4gICAgICAgICAgICAgICAgZnAgPSBzLnNlYXJjaChcIlxcXFxbXFxcXFtcIik7XG4gICAgICAgICAgICAgICAgc3AgPSBzLnNlYXJjaChcIlxcXFxdXFxcXF1cIik7XG4gICAgICAgICAgICAgICAgc3ViID0gcy5zbGljZShmcCArIDIsIHNwKTtcbiAgICAgICAgICAgICAgICBsZXQgdXJpID0gc3ViLnJlcGxhY2VBbGwoXCImI3gyRjtcIiwgXCIvXCIpO1xuICAgICAgICAgICAgICAgIHBhdHRlcm4gPSBgW1ske3N1Yn1dXWA7XG4gICAgICAgICAgICAgICAgaWYgKHRlbXBsYXRlRGF0YVtzdWJdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcyA9IHMucmVwbGFjZShwYXR0ZXJuLCB0ZW1wbGF0ZURhdGFbc3ViXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKC9eYXBpOlxcd3s2fSQvLnRlc3Qoc3ViKSkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgYXBpTGluayA9IGA8YSBvbkNsaWNrPSdDcnV4LmNydXgudHJpZ2dlcihcXFwic3dpdGNoX3VzZXJfYXBpXFxcIiwgXFxcIiR7c3VifVxcXCIpJz4gVmlldyBhcyAke3N1Yn08L2E+YDtcbiAgICAgICAgICAgICAgICAgICAgYXBpTGluayArPSBgIG9yIDxhIG9uQ2xpY2s9J0NydXguY3J1eC50cmlnZ2VyKFxcXCJtZXJnZV91c2VyX2FwaVxcXCIsIFxcXCIke3N1Yn1cXFwiKSc+IE1lcmdlICR7c3VifTwvYT5gO1xuICAgICAgICAgICAgICAgICAgICBzID0gcy5yZXBsYWNlKHBhdHRlcm4sIGFwaUxpbmspO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChpc192YWxpZF9pbWFnZV91cmwodXJpKSkge1xuICAgICAgICAgICAgICAgICAgICBzID0gcy5yZXBsYWNlKHBhdHRlcm4sIGA8aW1nIHdpZHRoPVwiMTAwJVwiIHNyYz0nJHt1cml9JyAvPmApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChpc192YWxpZF95b3V0dWJlKHVyaSkpIHtcbiAgICAgICAgICAgICAgICAgICAgLy9QYXNzXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzID0gcy5yZXBsYWNlKHBhdHRlcm4sIGAoJHtzdWJ9KWApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBzO1xuICAgICAgICB9O1xuICAgICAgICBsZXQgbnB1aSA9IE5lcHR1bmVzUHJpZGUubnB1aTtcbiAgICAgICAgLy9SZXNlYXJjaCBidXR0b24gdG8gcXVpY2tseSB0ZWxsIGZyaWVuZHMgcmVzZWFyY2hcbiAgICAgICAgTmVwdHVuZXNQcmlkZS50ZW1wbGF0ZXNbXCJucGFfcmVzZWFyY2hcIl0gPSBcIlJlc2VhcmNoXCI7XG4gICAgICAgIGxldCBzdXBlck5ld01lc3NhZ2VDb21tZW50Qm94ID0gbnB1aS5OZXdNZXNzYWdlQ29tbWVudEJveDtcbiAgICAgICAgbGV0IHJlcG9ydFJlc2VhcmNoSG9vayA9IGZ1bmN0aW9uIChfZSwgX2QpIHtcbiAgICAgICAgICAgIGxldCB0ZXh0ID0gZ2V0X3Jlc2VhcmNoX3RleHQoTmVwdHVuZXNQcmlkZSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyh0ZXh0KTtcbiAgICAgICAgICAgIGxldCBpbmJveCA9IE5lcHR1bmVzUHJpZGUuaW5ib3g7XG4gICAgICAgICAgICBpbmJveC5jb21tZW50RHJhZnRzW2luYm94LnNlbGVjdGVkTWVzc2FnZS5rZXldICs9IHRleHQ7XG4gICAgICAgICAgICBpbmJveC50cmlnZ2VyKFwic2hvd19zY3JlZW5cIiwgXCJkaXBsb21hY3lfZGV0YWlsXCIpO1xuICAgICAgICB9O1xuICAgICAgICBOZXB0dW5lc1ByaWRlLm5wLm9uKFwicGFzdGVfcmVzZWFyY2hcIiwgcmVwb3J0UmVzZWFyY2hIb29rKTtcbiAgICAgICAgbnB1aS5OZXdNZXNzYWdlQ29tbWVudEJveCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGxldCB3aWRnZXQgPSBzdXBlck5ld01lc3NhZ2VDb21tZW50Qm94KCk7XG4gICAgICAgICAgICBsZXQgcmVzZWFyY2hfYnV0dG9uID0gQ3J1eC5CdXR0b24oXCJucGFfcmVzZWFyY2hcIiwgXCJwYXN0ZV9yZXNlYXJjaFwiLCBcInJlc2VhcmNoXCIpLmdyaWQoMTEsIDEyLCA4LCAzKTtcbiAgICAgICAgICAgIHJlc2VhcmNoX2J1dHRvbi5yb29zdCh3aWRnZXQpO1xuICAgICAgICAgICAgcmV0dXJuIHdpZGdldDtcbiAgICAgICAgfTtcbiAgICAgICAgbGV0IHN1cGVyRm9ybWF0VGltZSA9IENydXguZm9ybWF0VGltZTtcbiAgICAgICAgbGV0IHJlbGF0aXZlVGltZXMgPSAwO1xuICAgICAgICBDcnV4LmZvcm1hdFRpbWUgPSBmdW5jdGlvbiAobXMsIG1pbnMsIHNlY3MpIHtcbiAgICAgICAgICAgIHN3aXRjaCAocmVsYXRpdmVUaW1lcykge1xuICAgICAgICAgICAgICAgIGNhc2UgMDogLy9zdGFuZGFyZFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3VwZXJGb3JtYXRUaW1lKG1zLCBtaW5zLCBzZWNzKTtcbiAgICAgICAgICAgICAgICBjYXNlIDE6IC8vRVRBLCAtIHR1cm4ocykgZm9yIHR1cm5iYXNlZFxuICAgICAgICAgICAgICAgICAgICBpZiAoIU5lcHR1bmVzUHJpZGUuZ2FtZUNvbmZpZy50dXJuQmFzZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBtc1RvRXRhU3RyaW5nKG1zLCBcIlwiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRpY2tfcmF0ZSA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2UuZ2FsYXh5LnRpY2tfcmF0ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBgJHtzdXBlckZvcm1hdFRpbWUobXMsIG1pbnMsIHNlY3MpfSAtICR7KCgobXMgLyAzNjAwMDAwKSAqIDEwKSAvXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGlja19yYXRlKS50b0ZpeGVkKDIpfSB0dXJuKHMpYDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhc2UgMjogLy9jeWNsZXMgKyB0aWNrcyBmb3JtYXRcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1zVG9DeWNsZVN0cmluZyhtcywgXCJcIik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGxldCBzd2l0Y2hUaW1lcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vMCA9IHN0YW5kYXJkLCAxID0gRVRBLCAtIHR1cm4ocykgZm9yIHR1cm5iYXNlZCwgMiA9IGN5Y2xlcyArIHRpY2tzIGZvcm1hdFxuICAgICAgICAgICAgcmVsYXRpdmVUaW1lcyA9IChyZWxhdGl2ZVRpbWVzICsgMSkgJSAzO1xuICAgICAgICB9O1xuICAgICAgICBob3RrZXkoXCIlXCIsIHN3aXRjaFRpbWVzKTtcbiAgICAgICAgc3dpdGNoVGltZXMuaGVscCA9XG4gICAgICAgICAgICBcIkNoYW5nZSB0aGUgZGlzcGxheSBvZiBFVEFzIGJldHdlZW4gcmVsYXRpdmUgdGltZXMsIGFic29sdXRlIGNsb2NrIHRpbWVzLCBhbmQgY3ljbGUgdGltZXMuIE1ha2VzIHByZWRpY3RpbmcgXCIgK1xuICAgICAgICAgICAgICAgIFwiaW1wb3J0YW50IHRpbWVzIG9mIGRheSB0byBzaWduIGluIGFuZCBjaGVjayBtdWNoIGVhc2llciBlc3BlY2lhbGx5IGZvciBtdWx0aS1sZWcgZmxlZXQgbW92ZW1lbnRzLiBTb21ldGltZXMgeW91IFwiICtcbiAgICAgICAgICAgICAgICBcIndpbGwgbmVlZCB0byByZWZyZXNoIHRoZSBkaXNwbGF5IHRvIHNlZSB0aGUgZGlmZmVyZW50IHRpbWVzLlwiO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KENydXgsIFwidG91Y2hFbmFibGVkXCIsIHtcbiAgICAgICAgICAgICAgICBnZXQ6ICgpID0+IGZhbHNlLFxuICAgICAgICAgICAgICAgIHNldDogKHgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJDcnV4LnRvdWNoRW5hYmxlZCBzZXQgaWdub3JlZFwiLCB4KTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGUpO1xuICAgICAgICB9XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShOZXB0dW5lc1ByaWRlLm5wdWkubWFwLCBcImlnbm9yZU1vdXNlRXZlbnRzXCIsIHtcbiAgICAgICAgICAgIGdldDogKCkgPT4gZmFsc2UsXG4gICAgICAgICAgICBzZXQ6ICh4KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJOZXB0dW5lc1ByaWRlLm5wdWkubWFwLmlnbm9yZU1vdXNlRXZlbnRzIHNldCBpZ25vcmVkXCIsIHgpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfSk7XG4gICAgICAgIGhvb2tzTG9hZGVkID0gdHJ1ZTtcbiAgICB9O1xuICAgIGxldCBpbml0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgX2E7XG4gICAgICAgIGlmICgoKF9hID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZSkgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLmdhbGF4eSkgJiYgTmVwdHVuZXNQcmlkZS5ucHVpLm1hcCkge1xuICAgICAgICAgICAgbGlua0ZsZWV0cygpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJGbGVldCBsaW5raW5nIGNvbXBsZXRlLlwiKTtcbiAgICAgICAgICAgIGlmICghaG9va3NMb2FkZWQpIHtcbiAgICAgICAgICAgICAgICBsb2FkSG9va3MoKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkhVRCBzZXR1cCBjb21wbGV0ZS5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIkhVRCBzZXR1cCBhbHJlYWR5IGRvbmU7IHNraXBwaW5nLlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGhvbWVQbGFuZXRzKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkdhbWUgbm90IGZ1bGx5IGluaXRpYWxpemVkIHlldDsgd2FpdC5cIiwgTmVwdHVuZXNQcmlkZS51bml2ZXJzZSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGhvdGtleShcIkBcIiwgaW5pdCk7XG4gICAgaW5pdC5oZWxwID1cbiAgICAgICAgXCJSZWluaXRpYWxpemUgTmVwdHVuZSdzIFByaWRlIEFnZW50LiBVc2UgdGhlIEAgaG90a2V5IGlmIHRoZSB2ZXJzaW9uIGlzIG5vdCBiZWluZyBzaG93biBvbiB0aGUgbWFwIGFmdGVyIGRyYWdnaW5nLlwiO1xuICAgIGlmICgoKF9iID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZSkgPT09IG51bGwgfHwgX2IgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9iLmdhbGF4eSkgJiYgTmVwdHVuZXNQcmlkZS5ucHVpLm1hcCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIlVuaXZlcnNlIGFscmVhZHkgbG9hZGVkLiBIeXBlcmxpbmsgZmxlZXRzICYgbG9hZCBob29rcy5cIik7XG4gICAgICAgIGluaXQoKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiVW5pdmVyc2Ugbm90IGxvYWRlZC4gSG9vayBvblNlcnZlclJlc3BvbnNlLlwiKTtcbiAgICAgICAgbGV0IHN1cGVyT25TZXJ2ZXJSZXNwb25zZSA9IE5lcHR1bmVzUHJpZGUubnAub25TZXJ2ZXJSZXNwb25zZTtcbiAgICAgICAgTmVwdHVuZXNQcmlkZS5ucC5vblNlcnZlclJlc3BvbnNlID0gZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICBzdXBlck9uU2VydmVyUmVzcG9uc2UocmVzcG9uc2UpO1xuICAgICAgICAgICAgaWYgKHJlc3BvbnNlLmV2ZW50ID09PSBcIm9yZGVyOnBsYXllcl9hY2hpZXZlbWVudHNcIikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiSW5pdGlhbCBsb2FkIGNvbXBsZXRlLiBSZWluc3RhbGwuXCIpO1xuICAgICAgICAgICAgICAgIGluaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHJlc3BvbnNlLmV2ZW50ID09PSBcIm9yZGVyOmZ1bGxfdW5pdmVyc2VcIikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiVW5pdmVyc2UgcmVjZWl2ZWQuIFJlaW5zdGFsbC5cIik7XG4gICAgICAgICAgICAgICAgTmVwdHVuZXNQcmlkZS5vcmlnaW5hbFBsYXllciA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2UucGxheWVyLnVpZDtcbiAgICAgICAgICAgICAgICBpbml0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmICghaG9va3NMb2FkZWQgJiYgTmVwdHVuZXNQcmlkZS5ucHVpLm1hcCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiSG9va3MgbmVlZCBsb2FkaW5nIGFuZCBtYXAgaXMgcmVhZHkuIFJlaW5zdGFsbC5cIik7XG4gICAgICAgICAgICAgICAgaW5pdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cbiAgICB2YXIgb3RoZXJVc2VyQ29kZSA9IHVuZGVmaW5lZDtcbiAgICBsZXQgZ2FtZSA9IE5lcHR1bmVzUHJpZGUuZ2FtZU51bWJlcjtcbiAgICAvL1RoaXMgcHV0cyB5b3UgaW50byB0aGVpciBwb3NpdGlvbi5cbiAgICAvL0hvdyBpcyBpdCBkaWZmZXJlbnQ/XG4gICAgbGV0IHN3aXRjaFVzZXIgPSBmdW5jdGlvbiAoZXZlbnQsIGRhdGEpIHtcbiAgICAgICAgaWYgKE5lcHR1bmVzUHJpZGUub3JpZ2luYWxQbGF5ZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgTmVwdHVuZXNQcmlkZS5vcmlnaW5hbFBsYXllciA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2UucGxheWVyLnVpZDtcbiAgICAgICAgfVxuICAgICAgICBsZXQgY29kZSA9IChkYXRhID09PSBudWxsIHx8IGRhdGEgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGRhdGEuc3BsaXQoXCI6XCIpWzFdKSB8fCBvdGhlclVzZXJDb2RlO1xuICAgICAgICBvdGhlclVzZXJDb2RlID0gY29kZTtcbiAgICAgICAgaWYgKG90aGVyVXNlckNvZGUpIHtcbiAgICAgICAgICAgIGxldCBwYXJhbXMgPSB7XG4gICAgICAgICAgICAgICAgZ2FtZV9udW1iZXI6IGdhbWUsXG4gICAgICAgICAgICAgICAgYXBpX3ZlcnNpb246IFwiMC4xXCIsXG4gICAgICAgICAgICAgICAgY29kZTogb3RoZXJVc2VyQ29kZSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBsZXQgZWdnZXJzID0galF1ZXJ5LmFqYXgoe1xuICAgICAgICAgICAgICAgIHR5cGU6IFwiUE9TVFwiLFxuICAgICAgICAgICAgICAgIHVybDogXCJodHRwczovL25wLmlyb25oZWxtZXQuY29tL2FwaVwiLFxuICAgICAgICAgICAgICAgIGFzeW5jOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBkYXRhOiBwYXJhbXMsXG4gICAgICAgICAgICAgICAgZGF0YVR5cGU6IFwianNvblwiLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvL0xvYWRzIHRoZSBwdWxsIHVuaXZlcnNlIGRhdGEgaW50byB0aGUgZnVuY3Rpb24uIFRoYXRzIHRoZSBkaWZmZXJlbmNlLlxuICAgICAgICAgICAgLy9UaGUgb3RoZXIgdmVyc2lvbiBsb2FkcyBhbiB1cGRhdGVkIGdhbGF4eSBpbnRvIHRoZSBmdW5jdGlvblxuICAgICAgICAgICAgTmVwdHVuZXNQcmlkZS5ucC5vbkZ1bGxVbml2ZXJzZShudWxsLCBlZ2dlcnMucmVzcG9uc2VKU09OLnNjYW5uaW5nX2RhdGEpO1xuICAgICAgICAgICAgTmVwdHVuZXNQcmlkZS5ucHVpLm9uSGlkZVNjcmVlbihudWxsLCB0cnVlKTtcbiAgICAgICAgICAgIE5lcHR1bmVzUHJpZGUubnAudHJpZ2dlcihcInNlbGVjdF9wbGF5ZXJcIiwgW1xuICAgICAgICAgICAgICAgIE5lcHR1bmVzUHJpZGUudW5pdmVyc2UucGxheWVyLnVpZCxcbiAgICAgICAgICAgICAgICB0cnVlLFxuICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICBpbml0KCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGhvdGtleShcIj5cIiwgc3dpdGNoVXNlcik7XG4gICAgc3dpdGNoVXNlci5oZWxwID1cbiAgICAgICAgXCJTd2l0Y2ggdmlld3MgdG8gdGhlIGxhc3QgdXNlciB3aG9zZSBBUEkga2V5IHdhcyB1c2VkIHRvIGxvYWQgZGF0YS4gVGhlIEhVRCBzaG93cyB0aGUgY3VycmVudCB1c2VyIHdoZW4gXCIgK1xuICAgICAgICAgICAgXCJpdCBpcyBub3QgeW91ciBvd24gYWxpYXMgdG8gaGVscCByZW1pbmQgeW91IHRoYXQgeW91IGFyZW4ndCBpbiBjb250cm9sIG9mIHRoaXMgdXNlci5cIjtcbiAgICBob3RrZXkoXCJ8XCIsIG1lcmdlVXNlcik7XG4gICAgbWVyZ2VVc2VyLmhlbHAgPVxuICAgICAgICBcIk1lcmdlIHRoZSBsYXRlc3QgZGF0YSBmcm9tIHRoZSBsYXN0IHVzZXIgd2hvc2UgQVBJIGtleSB3YXMgdXNlZCB0byBsb2FkIGRhdGEuIFRoaXMgaXMgdXNlZnVsIGFmdGVyIGEgdGljayBcIiArXG4gICAgICAgICAgICBcInBhc3NlcyBhbmQgeW91J3ZlIHJlbG9hZGVkLCBidXQgeW91IHN0aWxsIHdhbnQgdGhlIG1lcmdlZCBzY2FuIGRhdGEgZnJvbSB0d28gcGxheWVycyBvbnNjcmVlbi5cIjtcbiAgICBOZXB0dW5lc1ByaWRlLm5wLm9uKFwic3dpdGNoX3VzZXJfYXBpXCIsIHN3aXRjaFVzZXIpO1xuICAgIE5lcHR1bmVzUHJpZGUubnAub24oXCJtZXJnZV91c2VyX2FwaVwiLCBtZXJnZVVzZXIpO1xuICAgIGxldCBucGFIZWxwID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBsZXQgaGVscCA9IFtgPEgxPiR7dGl0bGV9PC9IMT5gXTtcbiAgICAgICAgZm9yIChsZXQgcGFpciBpbiBob3RrZXlzKSB7XG4gICAgICAgICAgICBsZXQga2V5ID0gaG90a2V5c1twYWlyXVswXTtcbiAgICAgICAgICAgIGxldCBhY3Rpb24gPSBob3RrZXlzW3BhaXJdWzFdO1xuICAgICAgICAgICAgaGVscC5wdXNoKGA8aDI+SG90a2V5OiAke2tleX08L2gyPmApO1xuICAgICAgICAgICAgaWYgKGFjdGlvbi5oZWxwKSB7XG4gICAgICAgICAgICAgICAgaGVscC5wdXNoKGFjdGlvbi5oZWxwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGhlbHAucHVzaChgPHA+Tm8gZG9jdW1lbnRhdGlvbiB5ZXQuPHA+PGNvZGU+JHthY3Rpb24udG9Mb2NhbGVTdHJpbmcoKX08L2NvZGU+YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5oZWxwSFRNTCA9IGhlbHAuam9pbihcIlwiKTtcbiAgICAgICAgTmVwdHVuZXNQcmlkZS5ucC50cmlnZ2VyKFwic2hvd19zY3JlZW5cIiwgXCJoZWxwXCIpO1xuICAgIH07XG4gICAgbnBhSGVscC5oZWxwID0gXCJEaXNwbGF5IHRoaXMgaGVscCBzY3JlZW4uXCI7XG4gICAgaG90a2V5KFwiP1wiLCBucGFIZWxwKTtcbiAgICB2YXIgYXV0b2NvbXBsZXRlTW9kZSA9IDA7XG4gICAgbGV0IGF1dG9jb21wbGV0ZVRyaWdnZXIgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICBpZiAoZS50YXJnZXQudHlwZSA9PT0gXCJ0ZXh0YXJlYVwiKSB7XG4gICAgICAgICAgICBpZiAoYXV0b2NvbXBsZXRlTW9kZSkge1xuICAgICAgICAgICAgICAgIGxldCBzdGFydCA9IGF1dG9jb21wbGV0ZU1vZGU7XG4gICAgICAgICAgICAgICAgbGV0IGVuZEJyYWNrZXQgPSBlLnRhcmdldC52YWx1ZS5pbmRleE9mKFwiXVwiLCBzdGFydCk7XG4gICAgICAgICAgICAgICAgaWYgKGVuZEJyYWNrZXQgPT09IC0xKVxuICAgICAgICAgICAgICAgICAgICBlbmRCcmFja2V0ID0gZS50YXJnZXQudmFsdWUubGVuZ3RoO1xuICAgICAgICAgICAgICAgIGxldCBhdXRvU3RyaW5nID0gZS50YXJnZXQudmFsdWUuc3Vic3RyaW5nKHN0YXJ0LCBlbmRCcmFja2V0KTtcbiAgICAgICAgICAgICAgICBsZXQga2V5ID0gZS5rZXk7XG4gICAgICAgICAgICAgICAgaWYgKGtleSA9PT0gXCJdXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgYXV0b2NvbXBsZXRlTW9kZSA9IDA7XG4gICAgICAgICAgICAgICAgICAgIGxldCBtID0gYXV0b1N0cmluZy5tYXRjaCgvXlswLTldWzAtOV0qJC8pO1xuICAgICAgICAgICAgICAgICAgICBpZiAobSA9PT0gbnVsbCB8fCBtID09PSB2b2lkIDAgPyB2b2lkIDAgOiBtLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IHB1aWQgPSBOdW1iZXIoYXV0b1N0cmluZyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZW5kID0gZS50YXJnZXQuc2VsZWN0aW9uRW5kO1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGF1dG8gPSBgJHtwdWlkfV1dICR7TmVwdHVuZXNQcmlkZS51bml2ZXJzZS5nYWxheHkucGxheWVyc1twdWlkXS5hbGlhc31gO1xuICAgICAgICAgICAgICAgICAgICAgICAgZS50YXJnZXQudmFsdWUgPVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUudGFyZ2V0LnZhbHVlLnN1YnN0cmluZygwLCBzdGFydCkgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhdXRvICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZS50YXJnZXQudmFsdWUuc3Vic3RyaW5nKGVuZCwgZS50YXJnZXQudmFsdWUubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGUudGFyZ2V0LnNlbGVjdGlvblN0YXJ0ID0gc3RhcnQgKyBhdXRvLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGUudGFyZ2V0LnNlbGVjdGlvbkVuZCA9IHN0YXJ0ICsgYXV0by5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChlLnRhcmdldC5zZWxlY3Rpb25TdGFydCA+IDEpIHtcbiAgICAgICAgICAgICAgICBsZXQgc3RhcnQgPSBlLnRhcmdldC5zZWxlY3Rpb25TdGFydCAtIDI7XG4gICAgICAgICAgICAgICAgbGV0IHNzID0gZS50YXJnZXQudmFsdWUuc3Vic3RyaW5nKHN0YXJ0LCBzdGFydCArIDIpO1xuICAgICAgICAgICAgICAgIGF1dG9jb21wbGV0ZU1vZGUgPSBzcyA9PT0gXCJbW1wiID8gZS50YXJnZXQuc2VsZWN0aW9uU3RhcnQgOiAwO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbiAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXl1cFwiLCBhdXRvY29tcGxldGVUcmlnZ2VyKTtcbn1cbmNvbnN0IGZvcmNlX2FkZF9jdXN0b21fcGxheWVyX3BhbmVsID0gKCkgPT4ge1xuICAgIGlmIChcIlBsYXllclBhbmVsXCIgaW4gTmVwdHVuZXNQcmlkZS5ucHVpKSB7XG4gICAgICAgIGFkZF9jdXN0b21fcGxheWVyX3BhbmVsKCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBzZXRUaW1lb3V0KGFkZF9jdXN0b21fcGxheWVyX3BhbmVsLCAzMDAwKTtcbiAgICB9XG59O1xuY29uc3QgYWRkX2N1c3RvbV9wbGF5ZXJfcGFuZWwgPSAoKSA9PiB7XG4gICAgTmVwdHVuZXNQcmlkZS5ucHVpLlBsYXllclBhbmVsID0gZnVuY3Rpb24gKHBsYXllciwgc2hvd0VtcGlyZSkge1xuICAgICAgICBsZXQgdW5pdmVyc2UgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlO1xuICAgICAgICBsZXQgbnB1aSA9IE5lcHR1bmVzUHJpZGUubnB1aTtcbiAgICAgICAgdmFyIHBsYXllclBhbmVsID0gQ3J1eC5XaWRnZXQoXCJyZWxcIikuc2l6ZSg0ODAsIDI2NCAtIDggKyA0OCk7XG4gICAgICAgIHZhciBoZWFkaW5nID0gXCJwbGF5ZXJcIjtcbiAgICAgICAgaWYgKHVuaXZlcnNlLnBsYXllckFjaGlldmVtZW50cyAmJlxuICAgICAgICAgICAgTmVwdHVuZXNQcmlkZS5nYW1lQ29uZmlnLmFub255bWl0eSA9PT0gMCkge1xuICAgICAgICAgICAgaWYgKHVuaXZlcnNlLnBsYXllckFjaGlldmVtZW50c1twbGF5ZXIudWlkXSkge1xuICAgICAgICAgICAgICAgIGlmICh1bml2ZXJzZS5wbGF5ZXJBY2hpZXZlbWVudHNbcGxheWVyLnVpZF0ucHJlbWl1bSA9PT0gXCJwcmVtaXVtXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgaGVhZGluZyA9IFwicHJlbWl1bV9wbGF5ZXJcIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHVuaXZlcnNlLnBsYXllckFjaGlldmVtZW50c1twbGF5ZXIudWlkXS5wcmVtaXVtID09PSBcImxpZmV0aW1lXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgaGVhZGluZyA9IFwibGlmZXRpbWVfcHJlbWl1bV9wbGF5ZXJcIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgQ3J1eC5UZXh0KGhlYWRpbmcsIFwic2VjdGlvbl90aXRsZSBjb2xfYmxhY2tcIilcbiAgICAgICAgICAgIC5ncmlkKDAsIDAsIDMwLCAzKVxuICAgICAgICAgICAgLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgaWYgKHBsYXllci5haSkge1xuICAgICAgICAgICAgQ3J1eC5UZXh0KFwiYWlfYWRtaW5cIiwgXCJ0eHRfcmlnaHQgcGFkMTJcIilcbiAgICAgICAgICAgICAgICAuZ3JpZCgwLCAwLCAzMCwgMylcbiAgICAgICAgICAgICAgICAucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICB9XG4gICAgICAgIENydXguSW1hZ2UoYC4uL2ltYWdlcy9hdmF0YXJzLzE2MC8ke3BsYXllci5hdmF0YXJ9LmpwZ2AsIFwiYWJzXCIpXG4gICAgICAgICAgICAuZ3JpZCgwLCA2LCAxMCwgMTApXG4gICAgICAgICAgICAucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICBDcnV4LldpZGdldChgcGNpXzQ4XyR7cGxheWVyLnVpZH1gKS5ncmlkKDcsIDEzLCAzLCAzKS5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgIENydXguV2lkZ2V0KFwiY29sX2FjY2VudFwiKS5ncmlkKDAsIDMsIDMwLCAzKS5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgIENydXguVGV4dChcIlwiLCBcInNjcmVlbl9zdWJ0aXRsZVwiKVxuICAgICAgICAgICAgLmdyaWQoMCwgMywgMzAsIDMpXG4gICAgICAgICAgICAucmF3SFRNTChwbGF5ZXIucXVhbGlmaWVkQWxpYXMpXG4gICAgICAgICAgICAucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICAvLyBBY2hpZXZlbWVudHNcbiAgICAgICAgdmFyIG15QWNoaWV2ZW1lbnRzO1xuICAgICAgICAvL1U9PlRveGljXG4gICAgICAgIC8vVj0+TWFnaWNcbiAgICAgICAgLy81PT5GbG9tYmFldVxuICAgICAgICAvL1c9PldpemFyZFxuICAgICAgICBpZiAodW5pdmVyc2UucGxheWVyQWNoaWV2ZW1lbnRzKSB7XG4gICAgICAgICAgICBteUFjaGlldmVtZW50cyA9IHVuaXZlcnNlLnBsYXllckFjaGlldmVtZW50c1twbGF5ZXIudWlkXTtcbiAgICAgICAgICAgIGlmIChhcGVfcGxheWVycyA9PT0gbnVsbCB8fCBhcGVfcGxheWVycyA9PT0gdm9pZCAwID8gdm9pZCAwIDogYXBlX3BsYXllcnMuaW5jbHVkZXMocGxheWVyLnJhd0FsaWFzKSkge1xuICAgICAgICAgICAgICAgIGlmIChteUFjaGlldmVtZW50cy5leHRyYV9iYWRnZXMgPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIG15QWNoaWV2ZW1lbnRzLmV4dHJhX2JhZGdlcyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGFwZV9wbGF5ZXJzLmZvckVhY2goKGFwZV9uYW1lKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYXBlX25hbWUgPT0gcGxheWVyLnJhd0FsaWFzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbXlBY2hpZXZlbWVudHMuYmFkZ2VzID0gYGEke215QWNoaWV2ZW1lbnRzLmJhZGdlc31gO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG15QWNoaWV2ZW1lbnRzKSB7XG4gICAgICAgICAgICBucHVpXG4gICAgICAgICAgICAgICAgLlNtYWxsQmFkZ2VSb3cobXlBY2hpZXZlbWVudHMuYmFkZ2VzKVxuICAgICAgICAgICAgICAgIC5ncmlkKDAsIDMsIDMwLCAzKVxuICAgICAgICAgICAgICAgIC5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgIH1cbiAgICAgICAgQ3J1eC5XaWRnZXQoXCJjb2xfYmxhY2tcIikuZ3JpZCgxMCwgNiwgMjAsIDMpLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgaWYgKHBsYXllci51aWQgIT0gZ2V0X2hlcm8oTmVwdHVuZXNQcmlkZS51bml2ZXJzZSkudWlkICYmIHBsYXllci5haSA9PSAwKSB7XG4gICAgICAgICAgICAvL1VzZSB0aGlzIHRvIG9ubHkgdmlldyB3aGVuIHRoZXkgYXJlIHdpdGhpbiBzY2FubmluZzpcbiAgICAgICAgICAgIC8vdW5pdmVyc2Uuc2VsZWN0ZWRTdGFyLnYgIT0gXCIwXCJcbiAgICAgICAgICAgIGxldCB0b3RhbF9zZWxsX2Nvc3QgPSBnZXRfdGVjaF90cmFkZV9jb3N0KGdldF9oZXJvKE5lcHR1bmVzUHJpZGUudW5pdmVyc2UpLCBwbGF5ZXIpO1xuICAgICAgICAgICAgLyoqKiBTSEFSRSBBTEwgVEVDSCAgKioqL1xuICAgICAgICAgICAgbGV0IGJ0biA9IENydXguQnV0dG9uKFwiXCIsIFwic2hhcmVfYWxsX3RlY2hcIiwgcGxheWVyKVxuICAgICAgICAgICAgICAgIC5hZGRTdHlsZShcImZ3ZFwiKVxuICAgICAgICAgICAgICAgIC5yYXdIVE1MKGBTaGFyZSBBbGwgVGVjaDogJCR7dG90YWxfc2VsbF9jb3N0fWApXG4gICAgICAgICAgICAgICAgLmdyaWQoMTAsIDMxLCAxNCwgMyk7XG4gICAgICAgICAgICAvL0Rpc2FibGUgaWYgaW4gYSBnYW1lIHdpdGggRkEgJiBTY2FuIChCVUcpXG4gICAgICAgICAgICBsZXQgY29uZmlnID0gTmVwdHVuZXNQcmlkZS5nYW1lQ29uZmlnO1xuICAgICAgICAgICAgaWYgKCEoY29uZmlnLnRyYWRlU2Nhbm5lZCAmJiBjb25maWcuYWxsaWFuY2VzKSkge1xuICAgICAgICAgICAgICAgIGlmIChnZXRfaGVybyhOZXB0dW5lc1ByaWRlLnVuaXZlcnNlKS5jYXNoID49IHRvdGFsX3NlbGxfY29zdCkge1xuICAgICAgICAgICAgICAgICAgICBidG4ucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYnRuLmRpc2FibGUoKS5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLyoqKiBQQVkgRk9SIEFMTCBURUNIICoqKi9cbiAgICAgICAgICAgIGxldCB0b3RhbF9idXlfY29zdCA9IGdldF90ZWNoX3RyYWRlX2Nvc3QocGxheWVyLCBnZXRfaGVybyhOZXB0dW5lc1ByaWRlLnVuaXZlcnNlKSk7XG4gICAgICAgICAgICBidG4gPSBDcnV4LkJ1dHRvbihcIlwiLCBcImJ1eV9hbGxfdGVjaFwiLCB7XG4gICAgICAgICAgICAgICAgcGxheWVyOiBwbGF5ZXIsXG4gICAgICAgICAgICAgICAgdGVjaDogbnVsbCxcbiAgICAgICAgICAgICAgICBjb3N0OiB0b3RhbF9idXlfY29zdCxcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmFkZFN0eWxlKFwiZndkXCIpXG4gICAgICAgICAgICAgICAgLnJhd0hUTUwoYFBheSBmb3IgQWxsIFRlY2g6ICQke3RvdGFsX2J1eV9jb3N0fWApXG4gICAgICAgICAgICAgICAgLmdyaWQoMTAsIDQ5LCAxNCwgMyk7XG4gICAgICAgICAgICBpZiAoZ2V0X2hlcm8oTmVwdHVuZXNQcmlkZS51bml2ZXJzZSkuY2FzaCA+PSB0b3RhbF9zZWxsX2Nvc3QpIHtcbiAgICAgICAgICAgICAgICBidG4ucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgYnRuLmRpc2FibGUoKS5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvKkluZGl2aWR1YWwgdGVjaHMqL1xuICAgICAgICAgICAgbGV0IF9uYW1lX21hcCA9IHtcbiAgICAgICAgICAgICAgICBzY2FubmluZzogXCJTY2FubmluZ1wiLFxuICAgICAgICAgICAgICAgIHByb3B1bHNpb246IFwiSHlwZXJzcGFjZSBSYW5nZVwiLFxuICAgICAgICAgICAgICAgIHRlcnJhZm9ybWluZzogXCJUZXJyYWZvcm1pbmdcIixcbiAgICAgICAgICAgICAgICByZXNlYXJjaDogXCJFeHBlcmltZW50YXRpb25cIixcbiAgICAgICAgICAgICAgICB3ZWFwb25zOiBcIldlYXBvbnNcIixcbiAgICAgICAgICAgICAgICBiYW5raW5nOiBcIkJhbmtpbmdcIixcbiAgICAgICAgICAgICAgICBtYW51ZmFjdHVyaW5nOiBcIk1hbnVmYWN0dXJpbmdcIixcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBsZXQgdGVjaHMgPSBbXG4gICAgICAgICAgICAgICAgXCJzY2FubmluZ1wiLFxuICAgICAgICAgICAgICAgIFwicHJvcHVsc2lvblwiLFxuICAgICAgICAgICAgICAgIFwidGVycmFmb3JtaW5nXCIsXG4gICAgICAgICAgICAgICAgXCJyZXNlYXJjaFwiLFxuICAgICAgICAgICAgICAgIFwid2VhcG9uc1wiLFxuICAgICAgICAgICAgICAgIFwiYmFua2luZ1wiLFxuICAgICAgICAgICAgICAgIFwibWFudWZhY3R1cmluZ1wiLFxuICAgICAgICAgICAgXTtcbiAgICAgICAgICAgIHRlY2hzLmZvckVhY2goKHRlY2gsIGkpID0+IHtcbiAgICAgICAgICAgICAgICBsZXQgb25lX3RlY2hfY29zdCA9IGdldF90ZWNoX3RyYWRlX2Nvc3QocGxheWVyLCBnZXRfaGVybyhOZXB0dW5lc1ByaWRlLnVuaXZlcnNlKSwgdGVjaCk7XG4gICAgICAgICAgICAgICAgbGV0IG9uZV90ZWNoID0gQ3J1eC5CdXR0b24oXCJcIiwgXCJidXlfb25lX3RlY2hcIiwge1xuICAgICAgICAgICAgICAgICAgICBwbGF5ZXI6IHBsYXllcixcbiAgICAgICAgICAgICAgICAgICAgdGVjaDogdGVjaCxcbiAgICAgICAgICAgICAgICAgICAgY29zdDogb25lX3RlY2hfY29zdCxcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAuYWRkU3R5bGUoXCJmd2RcIilcbiAgICAgICAgICAgICAgICAgICAgLnJhd0hUTUwoYFBheTogJCR7b25lX3RlY2hfY29zdH1gKVxuICAgICAgICAgICAgICAgICAgICAuZ3JpZCgxNSwgMzQuNSArIGkgKiAyLCA3LCAyKTtcbiAgICAgICAgICAgICAgICBpZiAoZ2V0X2hlcm8oTmVwdHVuZXNQcmlkZS51bml2ZXJzZSkuY2FzaCA+PSBvbmVfdGVjaF9jb3N0ICYmXG4gICAgICAgICAgICAgICAgICAgIG9uZV90ZWNoX2Nvc3QgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIG9uZV90ZWNoLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICAvL05QQyBDYWxjXG4gICAgICAgIGhvb2tfbnBjX3RpY2tfY291bnRlcihOZXB0dW5lc1ByaWRlLCBDcnV4KTtcbiAgICAgICAgQ3J1eC5UZXh0KFwieW91XCIsIFwicGFkMTIgdHh0X2NlbnRlclwiKS5ncmlkKDI1LCA2LCA1LCAzKS5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgIC8vIExhYmVsc1xuICAgICAgICBDcnV4LlRleHQoXCJ0b3RhbF9zdGFyc1wiLCBcInBhZDhcIikuZ3JpZCgxMCwgOSwgMTUsIDMpLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgQ3J1eC5UZXh0KFwidG90YWxfZmxlZXRzXCIsIFwicGFkOFwiKS5ncmlkKDEwLCAxMSwgMTUsIDMpLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgQ3J1eC5UZXh0KFwidG90YWxfc2hpcHNcIiwgXCJwYWQ4XCIpLmdyaWQoMTAsIDEzLCAxNSwgMykucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICBDcnV4LlRleHQoXCJuZXdfc2hpcHNcIiwgXCJwYWQ4XCIpLmdyaWQoMTAsIDE1LCAxNSwgMykucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICAvLyBUaGlzIHBsYXllcnMgc3RhdHNcbiAgICAgICAgaWYgKHBsYXllciAhPT0gdW5pdmVyc2UucGxheWVyKSB7XG4gICAgICAgICAgICBDcnV4LlRleHQoXCJcIiwgXCJwYWQ4IHR4dF9jZW50ZXJcIilcbiAgICAgICAgICAgICAgICAuZ3JpZCgyMCwgOSwgNSwgMylcbiAgICAgICAgICAgICAgICAucmF3SFRNTChwbGF5ZXIudG90YWxfc3RhcnMpXG4gICAgICAgICAgICAgICAgLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgICAgIENydXguVGV4dChcIlwiLCBcInBhZDggdHh0X2NlbnRlclwiKVxuICAgICAgICAgICAgICAgIC5ncmlkKDIwLCAxMSwgNSwgMylcbiAgICAgICAgICAgICAgICAucmF3SFRNTChwbGF5ZXIudG90YWxfZmxlZXRzKVxuICAgICAgICAgICAgICAgIC5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgICAgICBDcnV4LlRleHQoXCJcIiwgXCJwYWQ4IHR4dF9jZW50ZXJcIilcbiAgICAgICAgICAgICAgICAuZ3JpZCgyMCwgMTMsIDUsIDMpXG4gICAgICAgICAgICAgICAgLnJhd0hUTUwocGxheWVyLnRvdGFsX3N0cmVuZ3RoKVxuICAgICAgICAgICAgICAgIC5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgICAgICBDcnV4LlRleHQoXCJcIiwgXCJwYWQ4IHR4dF9jZW50ZXJcIilcbiAgICAgICAgICAgICAgICAuZ3JpZCgyMCwgMTUsIDUsIDMpXG4gICAgICAgICAgICAgICAgLnJhd0hUTUwocGxheWVyLnNoaXBzUGVyVGljaylcbiAgICAgICAgICAgICAgICAucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIHNlbGVjdEhpbGlnaHRTdHlsZShwMSwgcDIpIHtcbiAgICAgICAgICAgIHAxID0gTnVtYmVyKHAxKTtcbiAgICAgICAgICAgIHAyID0gTnVtYmVyKHAyKTtcbiAgICAgICAgICAgIGlmIChwMSA8IHAyKVxuICAgICAgICAgICAgICAgIHJldHVybiBcIiB0eHRfd2Fybl9iYWRcIjtcbiAgICAgICAgICAgIGlmIChwMSA+IHAyKVxuICAgICAgICAgICAgICAgIHJldHVybiBcIiB0eHRfd2Fybl9nb29kXCI7XG4gICAgICAgICAgICByZXR1cm4gXCJcIjtcbiAgICAgICAgfVxuICAgICAgICAvLyBZb3VyIHN0YXRzXG4gICAgICAgIGlmICh1bml2ZXJzZS5wbGF5ZXIpIHtcbiAgICAgICAgICAgIENydXguVGV4dChcIlwiLCBgcGFkOCB0eHRfY2VudGVyICR7c2VsZWN0SGlsaWdodFN0eWxlKHVuaXZlcnNlLnBsYXllci50b3RhbF9zdGFycywgcGxheWVyLnRvdGFsX3N0YXJzKX1gKVxuICAgICAgICAgICAgICAgIC5ncmlkKDI1LCA5LCA1LCAzKVxuICAgICAgICAgICAgICAgIC5yYXdIVE1MKHVuaXZlcnNlLnBsYXllci50b3RhbF9zdGFycylcbiAgICAgICAgICAgICAgICAucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICAgICAgQ3J1eC5UZXh0KFwiXCIsIGBwYWQ4IHR4dF9jZW50ZXIke3NlbGVjdEhpbGlnaHRTdHlsZSh1bml2ZXJzZS5wbGF5ZXIudG90YWxfZmxlZXRzLCBwbGF5ZXIudG90YWxfZmxlZXRzKX1gKVxuICAgICAgICAgICAgICAgIC5ncmlkKDI1LCAxMSwgNSwgMylcbiAgICAgICAgICAgICAgICAucmF3SFRNTCh1bml2ZXJzZS5wbGF5ZXIudG90YWxfZmxlZXRzKVxuICAgICAgICAgICAgICAgIC5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgICAgICBDcnV4LlRleHQoXCJcIiwgYHBhZDggdHh0X2NlbnRlciR7c2VsZWN0SGlsaWdodFN0eWxlKHVuaXZlcnNlLnBsYXllci50b3RhbF9zdHJlbmd0aCwgcGxheWVyLnRvdGFsX3N0cmVuZ3RoKX1gKVxuICAgICAgICAgICAgICAgIC5ncmlkKDI1LCAxMywgNSwgMylcbiAgICAgICAgICAgICAgICAucmF3SFRNTCh1bml2ZXJzZS5wbGF5ZXIudG90YWxfc3RyZW5ndGgpXG4gICAgICAgICAgICAgICAgLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgICAgIENydXguVGV4dChcIlwiLCBgcGFkOCB0eHRfY2VudGVyJHtzZWxlY3RIaWxpZ2h0U3R5bGUodW5pdmVyc2UucGxheWVyLnNoaXBzUGVyVGljaywgcGxheWVyLnNoaXBzUGVyVGljayl9YClcbiAgICAgICAgICAgICAgICAuZ3JpZCgyNSwgMTUsIDUsIDMpXG4gICAgICAgICAgICAgICAgLnJhd0hUTUwodW5pdmVyc2UucGxheWVyLnNoaXBzUGVyVGljaylcbiAgICAgICAgICAgICAgICAucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICB9XG4gICAgICAgIENydXguV2lkZ2V0KFwiY29sX2FjY2VudFwiKS5ncmlkKDAsIDE2LCAxMCwgMykucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICBpZiAodW5pdmVyc2UucGxheWVyKSB7XG4gICAgICAgICAgICB2YXIgbXNnQnRuID0gQ3J1eC5JY29uQnV0dG9uKFwiaWNvbi1tYWlsXCIsIFwiaW5ib3hfbmV3X21lc3NhZ2VfdG9fcGxheWVyXCIsIHBsYXllci51aWQpXG4gICAgICAgICAgICAgICAgLmdyaWQoMCwgMTYsIDMsIDMpXG4gICAgICAgICAgICAgICAgLmFkZFN0eWxlKFwiZndkXCIpXG4gICAgICAgICAgICAgICAgLmRpc2FibGUoKVxuICAgICAgICAgICAgICAgIC5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgICAgICBpZiAocGxheWVyICE9PSB1bml2ZXJzZS5wbGF5ZXIgJiYgcGxheWVyLmFsaWFzKSB7XG4gICAgICAgICAgICAgICAgbXNnQnRuLmVuYWJsZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgQ3J1eC5JY29uQnV0dG9uKFwiaWNvbi1jaGFydC1saW5lXCIsIFwic2hvd19pbnRlbFwiLCBwbGF5ZXIudWlkKVxuICAgICAgICAgICAgICAgIC5ncmlkKDIuNSwgMTYsIDMsIDMpXG4gICAgICAgICAgICAgICAgLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgICAgIGlmIChzaG93RW1waXJlKSB7XG4gICAgICAgICAgICAgICAgQ3J1eC5JY29uQnV0dG9uKFwiaWNvbi1leWVcIiwgXCJzaG93X3NjcmVlblwiLCBcImVtcGlyZVwiKVxuICAgICAgICAgICAgICAgICAgICAuZ3JpZCg3LCAxNiwgMywgMylcbiAgICAgICAgICAgICAgICAgICAgLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcGxheWVyUGFuZWw7XG4gICAgfTtcbn07XG5sZXQgc3VwZXJTdGFySW5zcGVjdG9yID0gTmVwdHVuZXNQcmlkZS5ucHVpLlN0YXJJbnNwZWN0b3I7XG5OZXB0dW5lc1ByaWRlLm5wdWkuU3Rhckluc3BlY3RvciA9IGZ1bmN0aW9uICgpIHtcbiAgICBsZXQgdW5pdmVyc2UgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlO1xuICAgIGxldCBjb25maWcgPSBOZXB0dW5lc1ByaWRlLmdhbWVDb25maWc7XG4gICAgLy9DYWxsIHN1cGVyIChQcmV2aW91cyBTdGFySW5zcGVjdG9yIGZyb20gZ2FtZWNvZGUpXG4gICAgbGV0IHN0YXJJbnNwZWN0b3IgPSBzdXBlclN0YXJJbnNwZWN0b3IoKTtcbiAgICBDcnV4Lkljb25CdXR0b24oXCJpY29uLWhlbHAgcmVsXCIsIFwic2hvd19oZWxwXCIsIFwic3RhcnNcIikucm9vc3Qoc3Rhckluc3BlY3Rvci5oZWFkaW5nKTtcbiAgICBDcnV4Lkljb25CdXR0b24oXCJpY29uLWRvYy10ZXh0IHJlbFwiLCBcInNob3dfc2NyZWVuXCIsIFwiY29tYmF0X2NhbGN1bGF0b3JcIikucm9vc3Qoc3Rhckluc3BlY3Rvci5oZWFkaW5nKTtcbiAgICAvL0FwcGVuZCBleHRyYSBmdW5jdGlvblxuICAgIGZ1bmN0aW9uIGFwcGx5X2ZyYWN0aW9uYWxfc2hpcHMoKSB7XG4gICAgICAgIHJldHVybiBfX2F3YWl0ZXIodGhpcywgdm9pZCAwLCB2b2lkIDAsIGZ1bmN0aW9uKiAoKSB7XG4gICAgICAgICAgICBsZXQgZGVwdGggPSBjb25maWcudHVybkJhc2VkID8gNCA6IDM7XG4gICAgICAgICAgICBsZXQgc2VsZWN0b3IgPSBgI2NvbnRlbnRBcmVhID4gZGl2ID4gZGl2LndpZGdldC5mdWxsc2NyZWVuID4gZGl2Om50aC1jaGlsZCgke2RlcHRofSkgPiBkaXYgPiBkaXY6bnRoLWNoaWxkKDUpID4gZGl2LndpZGdldC5wYWQxMi5pY29uLXJvY2tldC1pbmxpbmUudHh0X3JpZ2h0YDtcbiAgICAgICAgICAgIGxldCBlbGVtZW50ID0gJChzZWxlY3Rvcik7XG4gICAgICAgICAgICBsZXQgY291bnRlciA9IDA7XG4gICAgICAgICAgICBsZXQgZnJhY3Rpb25hbF9zaGlwID0gdW5pdmVyc2Uuc2VsZWN0ZWRTdGFyW1wiY1wiXS50b0ZpeGVkKDIpO1xuICAgICAgICAgICAgJChzZWxlY3RvcikuYXBwZW5kKGZyYWN0aW9uYWxfc2hpcCk7XG4gICAgICAgICAgICB3aGlsZSAoZWxlbWVudC5sZW5ndGggPT0gMCAmJiBjb3VudGVyIDw9IDEwMCkge1xuICAgICAgICAgICAgICAgIHlpZWxkIG5ldyBQcm9taXNlKChyKSA9PiBzZXRUaW1lb3V0KHIsIDEwKSk7XG4gICAgICAgICAgICAgICAgZWxlbWVudCA9ICQoc2VsZWN0b3IpO1xuICAgICAgICAgICAgICAgIGxldCBmcmFjdGlvbmFsX3NoaXAgPSB1bml2ZXJzZS5zZWxlY3RlZFN0YXJbXCJjXCJdO1xuICAgICAgICAgICAgICAgIGxldCBuZXdfdmFsdWUgPSBwYXJzZUludCgkKHNlbGVjdG9yKS50ZXh0KCkpICsgZnJhY3Rpb25hbF9zaGlwO1xuICAgICAgICAgICAgICAgICQoc2VsZWN0b3IpLnRleHQobmV3X3ZhbHVlLnRvRml4ZWQoMikpO1xuICAgICAgICAgICAgICAgIGNvdW50ZXIgKz0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGlmIChcImNcIiBpbiB1bml2ZXJzZS5zZWxlY3RlZFN0YXIpIHtcbiAgICAgICAgYXBwbHlfZnJhY3Rpb25hbF9zaGlwcygpO1xuICAgIH1cbiAgICByZXR1cm4gc3Rhckluc3BlY3Rvcjtcbn07XG4vL0phdmFzY3JpcHQgY2FsbFxuc2V0VGltZW91dChMZWdhY3lfTmVwdHVuZXNQcmlkZUFnZW50LCAxMDAwKTtcbnNldFRpbWVvdXQoKCkgPT4ge1xuICAgIC8vVHlwZXNjcmlwdCBjYWxsXG4gICAgcmVuZGVyTGVkZ2VyKE5lcHR1bmVzUHJpZGUsIENydXgsIE1vdXNldHJhcCk7XG59LCA4MDApO1xuc2V0VGltZW91dChhcHBseV9ob29rcywgMTUwMCk7XG4vL1Rlc3QgdG8gc2VlIGlmIFBsYXllclBhbmVsIGlzIHRoZXJlXG4vL0lmIGl0IGlzIG92ZXJ3cml0ZXMgY3VzdG9tIG9uZVxuLy9PdGhlcndpc2Ugd2hpbGUgbG9vcCAmIHNldCB0aW1lb3V0IHVudGlsIGl0cyB0aGVyZVxuZm9yY2VfYWRkX2N1c3RvbV9wbGF5ZXJfcGFuZWwoKTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==