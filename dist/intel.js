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
/* harmony import */ var _game_state__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./game_state */ "./source/game_state.ts");



//Global cached event system.
var cached_events = [];
var cacheFetchStart = new Date();
var cacheFetchSize = 0;
//Async request game events
//game is used to get the api version and the gameNumber
function update_event_cache(fetchSize, success, error) {
    var count = cached_events.length > 0 ? fetchSize : 100000;
    cacheFetchStart = new Date();
    cacheFetchSize = count;
    var params = new URLSearchParams({
        type: "fetch_game_messages",
        count: count.toString(),
        offset: "0",
        group: "game_event",
        version: _game_state__WEBPACK_IMPORTED_MODULE_2__.game.version,
        game_number: _game_state__WEBPACK_IMPORTED_MODULE_2__.game.gameNumber,
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
        .then(function (x) { return success(_game_state__WEBPACK_IMPORTED_MODULE_2__.game, _game_state__WEBPACK_IMPORTED_MODULE_2__.crux); })
        .catch(error);
}
//Custom UI Components for Ledger
function PlayerNameIconRowLink(player) {
    var playerNameIconRow = _game_state__WEBPACK_IMPORTED_MODULE_2__.crux.Widget("rel col_black clickable").size(480, 48);
    _game_state__WEBPACK_IMPORTED_MODULE_2__.npui.PlayerIcon(player, true).roost(playerNameIconRow);
    _game_state__WEBPACK_IMPORTED_MODULE_2__.crux.Text("", "section_title")
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
            var message_1 = incoming[i];
            if (message_1.key === cached_events[0].key) {
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
function recieve_new_messages() {
    var players = (0,_ledger__WEBPACK_IMPORTED_MODULE_0__.get_ledger)(cached_events);
    var ledgerScreen = _game_state__WEBPACK_IMPORTED_MODULE_2__.npui.ledgerScreen();
    _game_state__WEBPACK_IMPORTED_MODULE_2__.npui.onHideScreen(null, true);
    _game_state__WEBPACK_IMPORTED_MODULE_2__.npui.onHideSelectionMenu();
    _game_state__WEBPACK_IMPORTED_MODULE_2__.npui.trigger("hide_side_menu");
    _game_state__WEBPACK_IMPORTED_MODULE_2__.npui.trigger("reset_edit_mode");
    _game_state__WEBPACK_IMPORTED_MODULE_2__.npui.activeScreen = ledgerScreen;
    ledgerScreen.roost(_game_state__WEBPACK_IMPORTED_MODULE_2__.npui.screenContainer);
    _game_state__WEBPACK_IMPORTED_MODULE_2__.npui.layoutElement(ledgerScreen);
    players.forEach(function (p) {
        var player = PlayerNameIconRowLink(_game_state__WEBPACK_IMPORTED_MODULE_2__.universe.galaxy.players[p.uid]).roost(_game_state__WEBPACK_IMPORTED_MODULE_2__.npui.activeScreen);
        player.addStyle("player_cell");
        var prompt = p.debt > 0 ? "They owe" : "You owe";
        if (p.debt == 0) {
            prompt = "Balance";
        }
        if (p.debt < 0) {
            _game_state__WEBPACK_IMPORTED_MODULE_2__.crux.Text("", "pad12 txt_right red-text")
                .rawHTML("".concat(prompt, ": ").concat(p.debt))
                .grid(20, 0, 10, 3)
                .roost(player);
            if (p.debt * -1 <= (0,_get_hero__WEBPACK_IMPORTED_MODULE_1__.get_hero)(_game_state__WEBPACK_IMPORTED_MODULE_2__.universe).cash) {
                _game_state__WEBPACK_IMPORTED_MODULE_2__.crux.Button("forgive", "forgive_debt", { targetPlayer: p.uid })
                    .grid(17, 0, 6, 3)
                    .roost(player);
            }
        }
        else if (p.debt > 0) {
            _game_state__WEBPACK_IMPORTED_MODULE_2__.crux.Text("", "pad12 txt_right blue-text")
                .rawHTML("".concat(prompt, ": ").concat(p.debt))
                .grid(20, 0, 10, 3)
                .roost(player);
        }
        else if (p.debt == 0) {
            _game_state__WEBPACK_IMPORTED_MODULE_2__.crux.Text("", "pad12 txt_right orange-text")
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

/***/ "./source/game_state.ts":
/*!******************************!*\
  !*** ./source/game_state.ts ***!
  \******************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   NeptunesPride: function() { return /* binding */ NeptunesPride; },
/* harmony export */   crux: function() { return /* binding */ crux; },
/* harmony export */   galaxy: function() { return /* binding */ galaxy; },
/* harmony export */   game: function() { return /* binding */ game; },
/* harmony export */   inbox: function() { return /* binding */ inbox; },
/* harmony export */   np: function() { return /* binding */ np; },
/* harmony export */   npui: function() { return /* binding */ npui; },
/* harmony export */   set_game_state: function() { return /* binding */ set_game_state; },
/* harmony export */   universe: function() { return /* binding */ universe; }
/* harmony export */ });
var NeptunesPride = null;
var game = null;
var crux = null;
var universe = null;
var galaxy = null;
var npui = null;
var np = null;
var inbox = null;
var set_game_state = function (_game, _Crux) {
    game = _game;
    NeptunesPride = _game;
    npui = game.npui;
    np = game.np;
    crux = _Crux;
    universe = game.universe;
    galaxy = game.universe.galaxy;
    inbox = game.inbox;
};


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
/* harmony import */ var _game_state__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./game_state */ "./source/game_state.ts");



//Get ledger info to see what is owed
//Actually shows the panel of loading
function get_ledger(messages) {
    var npui = _game_state__WEBPACK_IMPORTED_MODULE_2__.game.npui;
    var universe = _game_state__WEBPACK_IMPORTED_MODULE_2__.game.universe;
    var players = universe.galaxy.players;
    var loading = _game_state__WEBPACK_IMPORTED_MODULE_2__.crux.Text("", "rel txt_center pad12")
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
function renderLedger(MouseTrap) {
    console.log(MouseTrap);
    //Deconstruction of different components of the game.
    var config = _game_state__WEBPACK_IMPORTED_MODULE_2__.game.config;
    var templates = _game_state__WEBPACK_IMPORTED_MODULE_2__.game.templates;
    var players = _game_state__WEBPACK_IMPORTED_MODULE_2__.universe.galaxy.players;
    MouseTrap.bind(["m", "M"], function () {
        _game_state__WEBPACK_IMPORTED_MODULE_2__.np.trigger("trigger_ledger");
    });
    templates["ledger"] = "Ledger";
    templates["tech_trading"] = "Trading Technology";
    templates["forgive"] = "Pay Debt";
    templates["forgive_debt"] = "Are you sure you want to forgive this debt?";
    if (!_game_state__WEBPACK_IMPORTED_MODULE_2__.npui.hasmenuitem) {
        _game_state__WEBPACK_IMPORTED_MODULE_2__.npui.SideMenuItem("icon-database", "ledger", "trigger_ledger")
            .roost(_game_state__WEBPACK_IMPORTED_MODULE_2__.npui.sideMenu);
        _game_state__WEBPACK_IMPORTED_MODULE_2__.npui.hasmenuitem = true;
    }
    _game_state__WEBPACK_IMPORTED_MODULE_2__.npui.ledgerScreen = function () {
        return _game_state__WEBPACK_IMPORTED_MODULE_2__.npui.Screen("ledger");
    };
    _game_state__WEBPACK_IMPORTED_MODULE_2__.np.on("trigger_ledger", function () {
        var ledgerScreen = _game_state__WEBPACK_IMPORTED_MODULE_2__.npui.ledgerScreen();
        var loading = _game_state__WEBPACK_IMPORTED_MODULE_2__.crux.Text("", "rel txt_center pad12 section_title")
            .rawHTML("Tabulating Ledger...");
        loading.roost(ledgerScreen);
        _game_state__WEBPACK_IMPORTED_MODULE_2__.npui.onHideScreen(null, true);
        _game_state__WEBPACK_IMPORTED_MODULE_2__.npui.onHideSelectionMenu();
        _game_state__WEBPACK_IMPORTED_MODULE_2__.npui.trigger("hide_side_menu");
        _game_state__WEBPACK_IMPORTED_MODULE_2__.npui.trigger("reset_edit_mode");
        _game_state__WEBPACK_IMPORTED_MODULE_2__.npui.activeScreen = ledgerScreen;
        ledgerScreen.roost(_game_state__WEBPACK_IMPORTED_MODULE_2__.npui.screenContainer);
        _game_state__WEBPACK_IMPORTED_MODULE_2__.npui.layoutElement(ledgerScreen);
        _event_cache__WEBPACK_IMPORTED_MODULE_1__.update_event_cache(4, _event_cache__WEBPACK_IMPORTED_MODULE_1__.recieve_new_messages, console.error);
    });
    //Why not np.on("ForgiveDebt")?
    _game_state__WEBPACK_IMPORTED_MODULE_2__.np.onForgiveDebt = function (event, data) {
        var targetPlayer = data.targetPlayer;
        var player = players[targetPlayer];
        var amount = player.debt * -1;
        //let amount = 1
        _game_state__WEBPACK_IMPORTED_MODULE_2__.universe.player.ledger[targetPlayer] = 0;
        _game_state__WEBPACK_IMPORTED_MODULE_2__.np.trigger("show_screen", [
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
    _game_state__WEBPACK_IMPORTED_MODULE_2__.np.on("confirm_forgive_debt", function (event, data) {
        _game_state__WEBPACK_IMPORTED_MODULE_2__.np.trigger("server_request", data);
        _game_state__WEBPACK_IMPORTED_MODULE_2__.np.trigger("trigger_ledger");
    });
    _game_state__WEBPACK_IMPORTED_MODULE_2__.np.on("forgive_debt", _game_state__WEBPACK_IMPORTED_MODULE_2__.np.onForgiveDebt);
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

/***/ "./source/utilities/fetch_messages.ts":
/*!********************************************!*\
  !*** ./source/utilities/fetch_messages.ts ***!
  \********************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   displayEvents: function() { return /* binding */ displayEvents; },
/* harmony export */   fetchFilteredMessages: function() { return /* binding */ fetchFilteredMessages; }
/* harmony export */ });
/* harmony import */ var _event_cache__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../event_cache */ "./source/event_cache.ts");
/* harmony import */ var _game_state__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../game_state */ "./source/game_state.ts");
//Bind to inbox.fetchMessages



var fetchFilteredMessages = function (game, Crux, inbox, filter) {
    console.log("Fethcin    g Filtered Messages");
    displayEvents();
    if (inbox.filter !== filter) {
        inbox.filter = filter;
        inbox.messages[inbox.filter] = null;
        inbox.page = 0;
    }
    if (inbox.unreadEvents)
        inbox.messages["game_event"] = null;
    if (inbox.unreadDiplomacy)
        inbox.messages["game_diplomacy"] = null;
    if (inbox.messages[inbox.filter] !== null) {
        // 1. if we are loading, we are still waiting for the server to respond
        // 2. if messages is null then we have never requested the messages
        // 3. if messages is empty array [] then the server already told us
        //    there are no messages
        return;
    }
    var super_filter = null;
    if (inbox.filter == "technology") {
        inbox.filter = "game_event";
        super_filter = "technology";
    }
    (0,_event_cache__WEBPACK_IMPORTED_MODULE_0__.update_event_cache)(10, function (game) { return displayEvents(); }, console.log);
    inbox.trigger("server_request", {
        type: "fetch_game_messages",
        count: inbox.mpp,
        offset: inbox.mpp * inbox.page,
        group: inbox.filter,
    });
    inbox.loading = true;
};
var displayEvents = function () {
    console.log(_event_cache__WEBPACK_IMPORTED_MODULE_0__.cached_events);
    var tech_updates = _event_cache__WEBPACK_IMPORTED_MODULE_0__.cached_events.filter(function (m) {
        m.payload.template == "tech_up";
    });
    console.log(tech_updates);
    _game_state__WEBPACK_IMPORTED_MODULE_1__.inbox.messages = tech_updates;
};


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
    var menu = [
        { icon: "trek", amount: 1 },
        { icon: "rebel", amount: 1 },
        { icon: "empire", amount: 1 },
        { icon: "wolf", amount: 5 },
        { icon: "pirate", amount: 5 },
        { icon: "wordsmith", amount: 2 },
        { icon: "lucky", amount: 2 },
        { icon: "ironborn", amount: 2 },
        { icon: "strange", amount: 2 },
        { icon: "ape", amount: 1 },
        { icon: "toxic", amount: 10 },
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
    var secret_menu = [
        { icon: "honour", amount: 1 },
        { icon: "wizard", amount: 1 },
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
    //let items: BadgeItemInterface[] = menu + secret_menu;
    var items = menu.concat(secret_menu);
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
/* harmony import */ var _game_state__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../game_state */ "./source/game_state.ts");
/*
 * Interface that overrides the automation text to let you know when the ai will move next
 *
 */


function get_npc_tick() {
    var ai = _game_state__WEBPACK_IMPORTED_MODULE_1__.game.universe.selectedPlayer;
    var cache = (0,_event_cache__WEBPACK_IMPORTED_MODULE_0__.get_cached_events)();
    var events = cache.map(function (e) { return e.payload; });
    var goodbyes = events.filter(function (e) {
        return e.template.includes("goodbye_to_player");
    });
    var tick = goodbyes.filter(function (e) { return e.uid == ai.uid; })[0].tick;
    console.log(tick);
    return tick;
}
function add_npc_tick_counter() {
    var tick = get_npc_tick();
    var title = document.querySelector("#contentArea > div > div.widget.fullscreen > div:nth-child(3) > div > div:nth-child(5) > div.widget.section_title.col_black");
    var subtitle = document.querySelector("#contentArea > div > div.widget.fullscreen > div:nth-child(3) > div > div:nth-child(5) > div.widget.txt_right.pad12");
    var current_tick = _game_state__WEBPACK_IMPORTED_MODULE_1__.game.universe.galaxy.tick;
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
function hook_npc_tick_counter() {
    var selectedPlayer = _game_state__WEBPACK_IMPORTED_MODULE_1__.game.universe.selectedPlayer;
    if (selectedPlayer.ai) {
        (0,_event_cache__WEBPACK_IMPORTED_MODULE_0__.update_event_cache)(4, add_npc_tick_counter, console.error);
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

/***/ "./source/utilities/star_manager.ts":
/*!******************************************!*\
  !*** ./source/utilities/star_manager.ts ***!
  \******************************************/
/***/ (function(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   hook_star_manager: function() { return /* binding */ hook_star_manager; }
/* harmony export */ });
/* harmony import */ var _game_state__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../game_state */ "./source/game_state.ts");

var get_total_natural_resources = function () {
    var player = _game_state__WEBPACK_IMPORTED_MODULE_0__.universe.player;
    var natual_resources = 0;
    var star;
    for (var s in _game_state__WEBPACK_IMPORTED_MODULE_0__.universe.galaxy.stars) {
        star = _game_state__WEBPACK_IMPORTED_MODULE_0__.universe.galaxy.stars[s];
        if (star.puid !== player.uid)
            continue;
        natual_resources += star.r;
    }
    return natual_resources;
};
var get_star_positions = function () {
    var positions = [];
    var star;
    for (var s in _game_state__WEBPACK_IMPORTED_MODULE_0__.universe.galaxy.stars) {
        star = _game_state__WEBPACK_IMPORTED_MODULE_0__.universe.galaxy.stars[s];
        positions.push({ x: star.x, y: star.y });
    }
    return positions;
};
function hook_star_manager(universe) {
    universe.get_total_natural_resources = get_total_natural_resources;
    universe.get_star_positions = get_star_positions;
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
/* harmony import */ var _get_hero__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./get_hero */ "./source/get_hero.ts");
/* harmony import */ var _hotkey__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./hotkey */ "./source/hotkey.ts");
/* harmony import */ var _ledger__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./ledger */ "./source/ledger.ts");
/* harmony import */ var _utilities_merge__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./utilities/merge */ "./source/utilities/merge.ts");
/* harmony import */ var _utilities_parse_utils__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./utilities/parse_utils */ "./source/utilities/parse_utils.ts");
/* harmony import */ var _utilities_graphics__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./utilities/graphics */ "./source/utilities/graphics.ts");
/* harmony import */ var _utilities_npc_calc__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./utilities/npc_calc */ "./source/utilities/npc_calc.ts");
/* harmony import */ var _utilities_player_badges__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./utilities/player_badges */ "./source/utilities/player_badges.ts");
/* harmony import */ var _utilities_gift_screen__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./utilities/gift_screen */ "./source/utilities/gift_screen.ts");
/* harmony import */ var _utilities_fetch_messages__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./utilities/fetch_messages */ "./source/utilities/fetch_messages.ts");
/* harmony import */ var _game_state__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./game_state */ "./source/game_state.ts");
/* harmony import */ var _utilities_star_manager__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./utilities/star_manager */ "./source/utilities/star_manager.ts");
/* harmony import */ var webpack_merge__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! webpack-merge */ "./node_modules/webpack-merge/dist/index.js");
/* harmony import */ var webpack_merge__WEBPACK_IMPORTED_MODULE_13___default = /*#__PURE__*/__webpack_require__.n(webpack_merge__WEBPACK_IMPORTED_MODULE_13__);
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
    thisGame.neptunesPride = NeptunesPride;
}
String.prototype.toProperCase = function () {
    return this.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
};
Object.defineProperties(Array.prototype, {
    count: {
        value: function (value) {
            return this.filter(function (x) { return x == value; }).length;
        },
    },
});
/* Extra Badges */
var ape_players = [];
function get_ape_players() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            (0,_utilities_player_badges__WEBPACK_IMPORTED_MODULE_8__.get_ape_badges)()
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
        return (0,_utilities_player_badges__WEBPACK_IMPORTED_MODULE_8__.ApeBadgeIcon)(Crux, image_url, filename, count, small);
    };
};
var overrideTemplates = function () {
    NeptunesPride.templates["gift_desc_ape"] =
        "<h3>Ape - 420 Credit</h3><p>Is this what you call 'evolution'? Because frankly, I've seen better designs of a banana peel.</p>";
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
    console.log(image_url);
    NeptunesPride.npui.BuyGiftScreen = function () {
        return (0,_utilities_gift_screen__WEBPACK_IMPORTED_MODULE_9__.buyApeGiftScreen)(Crux, NeptunesPride.universe, NeptunesPride.npui);
    };
    NeptunesPride.npui.GiftItem = function (item) {
        return (0,_utilities_gift_screen__WEBPACK_IMPORTED_MODULE_9__.ApeGiftItem)(Crux, image_url, item);
    };
};
var overrideShowScreen = function () {
    NeptunesPride.npui.onShowScreen = function (event, screenName, screenConfig) {
        return onShowApeScreen(NeptunesPride.npui, NeptunesPride.universe, event, screenName, screenConfig);
    };
};
$("ape-intel-plugin").ready(function () {
    //post_hook();
    //$("#ape-intel-plugin").remove();
});
function post_hook() {
    (0,_game_state__WEBPACK_IMPORTED_MODULE_11__.set_game_state)(NeptunesPride, Crux);
    overrideGiftItems();
    //overrideShowScreen(); //Not needed unless I want to add new ones.
    overrideTemplates();
    overrideBadgeWidgets();
    SAT_VERSION = $("#ape-intel-plugin").attr("title");
    console.log(SAT_VERSION, "Loaded");
    (0,_ledger__WEBPACK_IMPORTED_MODULE_3__.renderLedger)(Mousetrap);
    //Override inbox Fetch Messages
    //NeptunesPride.inbox.fetchMessages = (filter)=>fetchFilteredMessages(NeptunesPride,Crux,NeptunesPride.inbox,filter)
    //NPC Calc
    (0,_utilities_npc_calc__WEBPACK_IMPORTED_MODULE_7__.hook_npc_tick_counter)();
    //Star Manager
    (0,_utilities_star_manager__WEBPACK_IMPORTED_MODULE_12__.hook_star_manager)(NeptunesPride.universe);
}
function onGameRender() {
    NeptunesPride.np.on("order:full_universe", post_hook);
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
        var total_cost = get_tech_trade_cost((0,_get_hero__WEBPACK_IMPORTED_MODULE_1__.get_hero)(NeptunesPride.universe), player);
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
        var hero = (0,_get_hero__WEBPACK_IMPORTED_MODULE_1__.get_hero)(NeptunesPride.universe);
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
    var copy = function (reportFn) {
        return function () {
            reportFn();
            navigator.clipboard.writeText(_hotkey__WEBPACK_IMPORTED_MODULE_2__.lastClip);
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
        (0,_hotkey__WEBPACK_IMPORTED_MODULE_2__.clip)(output.join("\n"));
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
        (0,_hotkey__WEBPACK_IMPORTED_MODULE_2__.clip)(combatOutcomes().join("\n"));
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
        (0,_hotkey__WEBPACK_IMPORTED_MODULE_2__.clip)(flights.map(function (x) { return x[1]; }).join("\n"));
    }
    hotkey("^", briefFleetReport);
    briefFleetReport.help =
        "Generate a summary fleet report on all carriers in your scanning range, and copy it to the clipboard." +
            "<p>This same report can also be viewed via the menu; enter the agent and choose it from the dropdown.";
    function screenshot() {
        var map = NeptunesPride.npui.map;
        (0,_hotkey__WEBPACK_IMPORTED_MODULE_2__.clip)(map.canvas[0].toDataURL("image/webp", 0.05));
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
        (0,_hotkey__WEBPACK_IMPORTED_MODULE_2__.clip)(output.join("\n"));
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
        (0,_hotkey__WEBPACK_IMPORTED_MODULE_2__.clip)(output.join("\n"));
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
            (0,_utilities_graphics__WEBPACK_IMPORTED_MODULE_6__.drawOverlayString)(map.context, v, map.viewportWidth - 10, map.viewportHeight - 16 * map.pixelRatio);
            if (NeptunesPride.originalPlayer === undefined) {
                NeptunesPride.originalPlayer = universe.player.uid;
            }
            if (NeptunesPride.originalPlayer !== universe.player.uid) {
                var n = universe.galaxy.players[universe.player.uid].alias;
                (0,_utilities_graphics__WEBPACK_IMPORTED_MODULE_6__.drawOverlayString)(map.context, n, map.viewportWidth - 100, map.viewportHeight - 2 * 16 * map.pixelRatio);
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
                (0,_utilities_graphics__WEBPACK_IMPORTED_MODULE_6__.drawOverlayString)(map.context, s, x, y);
                (0,_utilities_graphics__WEBPACK_IMPORTED_MODULE_6__.drawOverlayString)(map.context, o, x, y + lineHeight);
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
                (0,_utilities_graphics__WEBPACK_IMPORTED_MODULE_6__.drawOverlayString)(map.context, s, 1000, lineHeight);
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
                                    if ((0,_utilities_graphics__WEBPACK_IMPORTED_MODULE_6__.anyStarCanSee)(universe.selectedStar.puid, fleet)) {
                                        visColor = "#888888";
                                    }
                                    (0,_utilities_graphics__WEBPACK_IMPORTED_MODULE_6__.drawOverlayString)(map.context, "Scan ".concat(tickToEtaString(ticks)), x, y, visColor);
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
                else if ((0,_utilities_parse_utils__WEBPACK_IMPORTED_MODULE_5__.is_valid_image_url)(uri)) {
                    s = s.replace(pattern, "<img width=\"100%\" src='".concat(uri, "' />"));
                }
                else if ((0,_utilities_parse_utils__WEBPACK_IMPORTED_MODULE_5__.is_valid_youtube)(uri)) {
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
    hotkey("|", _utilities_merge__WEBPACK_IMPORTED_MODULE_4__.mergeUser);
    _utilities_merge__WEBPACK_IMPORTED_MODULE_4__.mergeUser.help =
        "Merge the latest data from the last user whose API key was used to load data. This is useful after a tick " +
            "passes and you've reloaded, but you still want the merged scan data from two players onscreen.";
    NeptunesPride.np.on("switch_user_api", switchUser);
    NeptunesPride.np.on("merge_user_api", _utilities_merge__WEBPACK_IMPORTED_MODULE_4__.mergeUser);
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
                    ape_players.forEach(function (ape_name) {
                        if (ape_name == player.rawAlias) {
                            myAchievements.badges = "a".concat(myAchievements.badges);
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
        if (player.uid != (0,_get_hero__WEBPACK_IMPORTED_MODULE_1__.get_hero)(NeptunesPride.universe).uid && player.ai == 0) {
            //Use this to only view when they are within scanning:
            //universe.selectedStar.v != "0"
            var total_sell_cost = get_tech_trade_cost((0,_get_hero__WEBPACK_IMPORTED_MODULE_1__.get_hero)(NeptunesPride.universe), player);
            /*** SHARE ALL TECH  ***/
            var btn = Crux.Button("", "share_all_tech", player)
                .addStyle("fwd")
                .rawHTML("Share All Tech: $".concat(total_sell_cost))
                .grid(10, 31, 14, 3);
            //Disable if in a game with FA & Scan (BUG)
            var config = NeptunesPride.gameConfig;
            if (!(config.tradeScanned && config.alliances)) {
                if ((0,_get_hero__WEBPACK_IMPORTED_MODULE_1__.get_hero)(NeptunesPride.universe).cash >= total_sell_cost) {
                    btn.roost(playerPanel);
                }
                else {
                    btn.disable().roost(playerPanel);
                }
            }
            /*** PAY FOR ALL TECH ***/
            var total_buy_cost = get_tech_trade_cost(player, (0,_get_hero__WEBPACK_IMPORTED_MODULE_1__.get_hero)(NeptunesPride.universe));
            btn = Crux.Button("", "buy_all_tech", {
                player: player,
                tech: null,
                cost: total_buy_cost,
            })
                .addStyle("fwd")
                .rawHTML("Pay for All Tech: $".concat(total_buy_cost))
                .grid(10, 49, 14, 3);
            if ((0,_get_hero__WEBPACK_IMPORTED_MODULE_1__.get_hero)(NeptunesPride.universe).cash >= total_sell_cost) {
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
                var one_tech_cost = get_tech_trade_cost(player, (0,_get_hero__WEBPACK_IMPORTED_MODULE_1__.get_hero)(NeptunesPride.universe), tech);
                var one_tech = Crux.Button("", "buy_one_tech", {
                    player: player,
                    tech: tech,
                    cost: one_tech_cost,
                })
                    .addStyle("fwd")
                    .rawHTML("Pay: $".concat(one_tech_cost))
                    .grid(15, 34.5 + i * 2, 7, 2);
                if ((0,_get_hero__WEBPACK_IMPORTED_MODULE_1__.get_hero)(NeptunesPride.universe).cash >= one_tech_cost &&
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
onGameRender(); //Wait for players to be loaded
setTimeout(apply_hooks, 1500);
//Test to see if PlayerPanel is there
//If it is overwrites custom one
//Otherwise while loop & set timeout until its there
force_add_custom_player_panel();

}();
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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bkIsV0FBVyxTQUFTO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTLE9BQU87QUFDaEI7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLFdBQVcsUUFBUTtBQUNuQixXQUFXLFFBQVE7QUFDbkI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxLQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0Esc0NBQXNDLElBQUk7QUFDMUM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNB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O0FBRUE7QUFDQTtBQUNBLG9CQUFvQixPQUFPO0FBQzNCO0FBQ0Esc0JBQXNCLGdCQUFnQjtBQUN0QztBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUEsZ0RBQWdELEVBQUUsR0FBRyxHQUFHO0FBQ3hELHdDQUF3QyxFQUFFLEdBQUcsRUFBRTs7QUFFL0M7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBLCtCQUErQjs7QUFFL0I7O0FBRUEsb0NBQW9DO0FBQ3BDO0FBQ0E7QUFDQSxVQUFVLGlDQUFpQztBQUMzQztBQUNBO0FBQ0Esc0JBQXNCO0FBQ3RCO0FBQ0E7O0FBRUE7O0FBRUEsc0NBQXNDOztBQUV0QztBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7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QUNSO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0EsT0FBTztBQUNQOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMENBQTBDLGFBQWE7QUFDdkQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJDQUEyQyxhQUFhO0FBQ3hELGlFQUFpRTtBQUNqRSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0EsNEJBQTRCLGFBQWE7QUFDekM7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwQ0FBMEMsYUFBYTtBQUN2RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLHNCQUFzQjtBQUN0QixZQUFZO0FBQ1o7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiLFdBQVc7QUFDWDtBQUNBLE9BQU87O0FBRVA7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1B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O0FBQ0EscUJBQXFCLEVBQUUsRUFBRSxHQUFHO0FBQzVCO0FBQ0E7QUFDQSxxQkFBcUIsRUFBRSxFQUFFLEdBQUc7QUFDNUI7QUFDQSxpQkFBaUIsRUFBRSxFQUFFLEdBQUc7QUFDeEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IsRUFBRSxNQUFNLEVBQUUsSUFBSSxHQUFHLEtBQUssRUFBRSxJQUFJLEVBQUU7QUFDdEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0RBQXNEO0FBQ3REO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwQkFBMEIsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLElBQUksR0FBRztBQUNsRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0NBQW9DLEVBQUUsRUFBRSxHQUFHLEdBQUcsRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUFFO0FBQzVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNENBQTRDLEdBQUcsR0FBRyxHQUFHLE1BQU0sRUFBRSxNQUFNLEVBQUU7QUFDckU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwQ0FBMEMsR0FBRyxVQUFVLEVBQUU7QUFDekQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNDQUFzQyxFQUFFLEtBQUssR0FBRyxHQUFHLEdBQUcsTUFBTSxFQUFFLE1BQU0sRUFBRTtBQUN0RTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMENBQTBDLEVBQUU7QUFDNUMsNENBQTRDLEdBQUcsV0FBVyxFQUFFO0FBQzVELDRDQUE0QyxHQUFHLFdBQVcsRUFBRTtBQUM1RDtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNEQUFzRCxHQUFHLEdBQUcsRUFBRTtBQUM5RDtBQUNBO0FBQ0E7QUFDQSxzREFBc0QsR0FBRyxHQUFHLEVBQUU7QUFDOUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNEQUFzRCxHQUFHLEdBQUcsRUFBRTtBQUM5RDtBQUNBO0FBQ0E7QUFDQSxzREFBc0QsR0FBRyxHQUFHLEVBQUU7QUFDOUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdURBQXVELEdBQUc7QUFDMUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3RUFBd0UsMkJBQTJCO0FBQ25HO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9uZXB0dW5lcy1wcmlkZS1hZ2VudC8uL25vZGVfbW9kdWxlcy9jbG9uZS1kZWVwL2luZGV4LmpzIiwid2VicGFjazovL25lcHR1bmVzLXByaWRlLWFnZW50Ly4vbm9kZV9tb2R1bGVzL2lzLXBsYWluLW9iamVjdC9pbmRleC5qcyIsIndlYnBhY2s6Ly9uZXB0dW5lcy1wcmlkZS1hZ2VudC8uL25vZGVfbW9kdWxlcy9pc29iamVjdC9pbmRleC5qcyIsIndlYnBhY2s6Ly9uZXB0dW5lcy1wcmlkZS1hZ2VudC8uL25vZGVfbW9kdWxlcy9raW5kLW9mL2luZGV4LmpzIiwid2VicGFjazovL25lcHR1bmVzLXByaWRlLWFnZW50Ly4vbm9kZV9tb2R1bGVzL3NoYWxsb3ctY2xvbmUvaW5kZXguanMiLCJ3ZWJwYWNrOi8vbmVwdHVuZXMtcHJpZGUtYWdlbnQvLi9zb3VyY2UvY2hhdC50cyIsIndlYnBhY2s6Ly9uZXB0dW5lcy1wcmlkZS1hZ2VudC8uL3NvdXJjZS9ldmVudF9jYWNoZS50cyIsIndlYnBhY2s6Ly9uZXB0dW5lcy1wcmlkZS1hZ2VudC8uL3NvdXJjZS9nYW1lX3N0YXRlLnRzIiwid2VicGFjazovL25lcHR1bmVzLXByaWRlLWFnZW50Ly4vc291cmNlL2dldF9oZXJvLnRzIiwid2VicGFjazovL25lcHR1bmVzLXByaWRlLWFnZW50Ly4vc291cmNlL2hvdGtleS50cyIsIndlYnBhY2s6Ly9uZXB0dW5lcy1wcmlkZS1hZ2VudC8uL3NvdXJjZS9sZWRnZXIudHMiLCJ3ZWJwYWNrOi8vbmVwdHVuZXMtcHJpZGUtYWdlbnQvLi9zb3VyY2UvdXRpbGl0aWVzL2FwaS50cyIsIndlYnBhY2s6Ly9uZXB0dW5lcy1wcmlkZS1hZ2VudC8uL3NvdXJjZS91dGlsaXRpZXMvZmV0Y2hfbWVzc2FnZXMudHMiLCJ3ZWJwYWNrOi8vbmVwdHVuZXMtcHJpZGUtYWdlbnQvLi9zb3VyY2UvdXRpbGl0aWVzL2dldF9nYW1lX3N0YXRlLnRzIiwid2VicGFjazovL25lcHR1bmVzLXByaWRlLWFnZW50Ly4vc291cmNlL3V0aWxpdGllcy9naWZ0X3NjcmVlbi50cyIsIndlYnBhY2s6Ly9uZXB0dW5lcy1wcmlkZS1hZ2VudC8uL3NvdXJjZS91dGlsaXRpZXMvZ3JhcGhpY3MudHMiLCJ3ZWJwYWNrOi8vbmVwdHVuZXMtcHJpZGUtYWdlbnQvLi9zb3VyY2UvdXRpbGl0aWVzL21lcmdlLnRzIiwid2VicGFjazovL25lcHR1bmVzLXByaWRlLWFnZW50Ly4vc291cmNlL3V0aWxpdGllcy9ucGNfY2FsYy50cyIsIndlYnBhY2s6Ly9uZXB0dW5lcy1wcmlkZS1hZ2VudC8uL3NvdXJjZS91dGlsaXRpZXMvcGFyc2VfdXRpbHMudHMiLCJ3ZWJwYWNrOi8vbmVwdHVuZXMtcHJpZGUtYWdlbnQvLi9zb3VyY2UvdXRpbGl0aWVzL3BsYXllcl9iYWRnZXMudHMiLCJ3ZWJwYWNrOi8vbmVwdHVuZXMtcHJpZGUtYWdlbnQvLi9zb3VyY2UvdXRpbGl0aWVzL3N0YXJfbWFuYWdlci50cyIsIndlYnBhY2s6Ly9uZXB0dW5lcy1wcmlkZS1hZ2VudC8uL25vZGVfbW9kdWxlcy93ZWJwYWNrLW1lcmdlL2Rpc3QvaW5kZXguanMiLCJ3ZWJwYWNrOi8vbmVwdHVuZXMtcHJpZGUtYWdlbnQvLi9ub2RlX21vZHVsZXMvd2VicGFjay1tZXJnZS9kaXN0L2pvaW4tYXJyYXlzLmpzIiwid2VicGFjazovL25lcHR1bmVzLXByaWRlLWFnZW50Ly4vbm9kZV9tb2R1bGVzL3dlYnBhY2stbWVyZ2UvZGlzdC9tZXJnZS13aXRoLmpzIiwid2VicGFjazovL25lcHR1bmVzLXByaWRlLWFnZW50Ly4vbm9kZV9tb2R1bGVzL3dlYnBhY2stbWVyZ2UvZGlzdC90eXBlcy5qcyIsIndlYnBhY2s6Ly9uZXB0dW5lcy1wcmlkZS1hZ2VudC8uL25vZGVfbW9kdWxlcy93ZWJwYWNrLW1lcmdlL2Rpc3QvdW5pcXVlLmpzIiwid2VicGFjazovL25lcHR1bmVzLXByaWRlLWFnZW50Ly4vbm9kZV9tb2R1bGVzL3dlYnBhY2stbWVyZ2UvZGlzdC91dGlscy5qcyIsIndlYnBhY2s6Ly9uZXB0dW5lcy1wcmlkZS1hZ2VudC8uL25vZGVfbW9kdWxlcy93aWxkY2FyZC9pbmRleC5qcyIsIndlYnBhY2s6Ly9uZXB0dW5lcy1wcmlkZS1hZ2VudC8uL25vZGVfbW9kdWxlcy9tYXJrZWQvbGliL21hcmtlZC5lc20uanMiLCJ3ZWJwYWNrOi8vbmVwdHVuZXMtcHJpZGUtYWdlbnQvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vbmVwdHVuZXMtcHJpZGUtYWdlbnQvd2VicGFjay9ydW50aW1lL2NvbXBhdCBnZXQgZGVmYXVsdCBleHBvcnQiLCJ3ZWJwYWNrOi8vbmVwdHVuZXMtcHJpZGUtYWdlbnQvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL25lcHR1bmVzLXByaWRlLWFnZW50L3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vbmVwdHVuZXMtcHJpZGUtYWdlbnQvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9uZXB0dW5lcy1wcmlkZS1hZ2VudC8uL3NvdXJjZS9pbnRlbC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5cbi8qKlxuICogTW9kdWxlIGRlcGVuZGVuaWNlc1xuICovXG5cbmNvbnN0IGNsb25lID0gcmVxdWlyZSgnc2hhbGxvdy1jbG9uZScpO1xuY29uc3QgdHlwZU9mID0gcmVxdWlyZSgna2luZC1vZicpO1xuY29uc3QgaXNQbGFpbk9iamVjdCA9IHJlcXVpcmUoJ2lzLXBsYWluLW9iamVjdCcpO1xuXG5mdW5jdGlvbiBjbG9uZURlZXAodmFsLCBpbnN0YW5jZUNsb25lKSB7XG4gIHN3aXRjaCAodHlwZU9mKHZhbCkpIHtcbiAgICBjYXNlICdvYmplY3QnOlxuICAgICAgcmV0dXJuIGNsb25lT2JqZWN0RGVlcCh2YWwsIGluc3RhbmNlQ2xvbmUpO1xuICAgIGNhc2UgJ2FycmF5JzpcbiAgICAgIHJldHVybiBjbG9uZUFycmF5RGVlcCh2YWwsIGluc3RhbmNlQ2xvbmUpO1xuICAgIGRlZmF1bHQ6IHtcbiAgICAgIHJldHVybiBjbG9uZSh2YWwpO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBjbG9uZU9iamVjdERlZXAodmFsLCBpbnN0YW5jZUNsb25lKSB7XG4gIGlmICh0eXBlb2YgaW5zdGFuY2VDbG9uZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBpbnN0YW5jZUNsb25lKHZhbCk7XG4gIH1cbiAgaWYgKGluc3RhbmNlQ2xvbmUgfHwgaXNQbGFpbk9iamVjdCh2YWwpKSB7XG4gICAgY29uc3QgcmVzID0gbmV3IHZhbC5jb25zdHJ1Y3RvcigpO1xuICAgIGZvciAobGV0IGtleSBpbiB2YWwpIHtcbiAgICAgIHJlc1trZXldID0gY2xvbmVEZWVwKHZhbFtrZXldLCBpbnN0YW5jZUNsb25lKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlcztcbiAgfVxuICByZXR1cm4gdmFsO1xufVxuXG5mdW5jdGlvbiBjbG9uZUFycmF5RGVlcCh2YWwsIGluc3RhbmNlQ2xvbmUpIHtcbiAgY29uc3QgcmVzID0gbmV3IHZhbC5jb25zdHJ1Y3Rvcih2YWwubGVuZ3RoKTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCB2YWwubGVuZ3RoOyBpKyspIHtcbiAgICByZXNbaV0gPSBjbG9uZURlZXAodmFsW2ldLCBpbnN0YW5jZUNsb25lKTtcbiAgfVxuICByZXR1cm4gcmVzO1xufVxuXG4vKipcbiAqIEV4cG9zZSBgY2xvbmVEZWVwYFxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gY2xvbmVEZWVwO1xuIiwiLyohXG4gKiBpcy1wbGFpbi1vYmplY3QgPGh0dHBzOi8vZ2l0aHViLmNvbS9qb25zY2hsaW5rZXJ0L2lzLXBsYWluLW9iamVjdD5cbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQtMjAxNywgSm9uIFNjaGxpbmtlcnQuXG4gKiBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgaXNPYmplY3QgPSByZXF1aXJlKCdpc29iamVjdCcpO1xuXG5mdW5jdGlvbiBpc09iamVjdE9iamVjdChvKSB7XG4gIHJldHVybiBpc09iamVjdChvKSA9PT0gdHJ1ZVxuICAgICYmIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvKSA9PT0gJ1tvYmplY3QgT2JqZWN0XSc7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNQbGFpbk9iamVjdChvKSB7XG4gIHZhciBjdG9yLHByb3Q7XG5cbiAgaWYgKGlzT2JqZWN0T2JqZWN0KG8pID09PSBmYWxzZSkgcmV0dXJuIGZhbHNlO1xuXG4gIC8vIElmIGhhcyBtb2RpZmllZCBjb25zdHJ1Y3RvclxuICBjdG9yID0gby5jb25zdHJ1Y3RvcjtcbiAgaWYgKHR5cGVvZiBjdG9yICE9PSAnZnVuY3Rpb24nKSByZXR1cm4gZmFsc2U7XG5cbiAgLy8gSWYgaGFzIG1vZGlmaWVkIHByb3RvdHlwZVxuICBwcm90ID0gY3Rvci5wcm90b3R5cGU7XG4gIGlmIChpc09iamVjdE9iamVjdChwcm90KSA9PT0gZmFsc2UpIHJldHVybiBmYWxzZTtcblxuICAvLyBJZiBjb25zdHJ1Y3RvciBkb2VzIG5vdCBoYXZlIGFuIE9iamVjdC1zcGVjaWZpYyBtZXRob2RcbiAgaWYgKHByb3QuaGFzT3duUHJvcGVydHkoJ2lzUHJvdG90eXBlT2YnKSA9PT0gZmFsc2UpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICAvLyBNb3N0IGxpa2VseSBhIHBsYWluIE9iamVjdFxuICByZXR1cm4gdHJ1ZTtcbn07XG4iLCIvKiFcbiAqIGlzb2JqZWN0IDxodHRwczovL2dpdGh1Yi5jb20vam9uc2NobGlua2VydC9pc29iamVjdD5cbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQtMjAxNywgSm9uIFNjaGxpbmtlcnQuXG4gKiBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGlzT2JqZWN0KHZhbCkge1xuICByZXR1cm4gdmFsICE9IG51bGwgJiYgdHlwZW9mIHZhbCA9PT0gJ29iamVjdCcgJiYgQXJyYXkuaXNBcnJheSh2YWwpID09PSBmYWxzZTtcbn07XG4iLCJ2YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGtpbmRPZih2YWwpIHtcbiAgaWYgKHZhbCA9PT0gdm9pZCAwKSByZXR1cm4gJ3VuZGVmaW5lZCc7XG4gIGlmICh2YWwgPT09IG51bGwpIHJldHVybiAnbnVsbCc7XG5cbiAgdmFyIHR5cGUgPSB0eXBlb2YgdmFsO1xuICBpZiAodHlwZSA9PT0gJ2Jvb2xlYW4nKSByZXR1cm4gJ2Jvb2xlYW4nO1xuICBpZiAodHlwZSA9PT0gJ3N0cmluZycpIHJldHVybiAnc3RyaW5nJztcbiAgaWYgKHR5cGUgPT09ICdudW1iZXInKSByZXR1cm4gJ251bWJlcic7XG4gIGlmICh0eXBlID09PSAnc3ltYm9sJykgcmV0dXJuICdzeW1ib2wnO1xuICBpZiAodHlwZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiBpc0dlbmVyYXRvckZuKHZhbCkgPyAnZ2VuZXJhdG9yZnVuY3Rpb24nIDogJ2Z1bmN0aW9uJztcbiAgfVxuXG4gIGlmIChpc0FycmF5KHZhbCkpIHJldHVybiAnYXJyYXknO1xuICBpZiAoaXNCdWZmZXIodmFsKSkgcmV0dXJuICdidWZmZXInO1xuICBpZiAoaXNBcmd1bWVudHModmFsKSkgcmV0dXJuICdhcmd1bWVudHMnO1xuICBpZiAoaXNEYXRlKHZhbCkpIHJldHVybiAnZGF0ZSc7XG4gIGlmIChpc0Vycm9yKHZhbCkpIHJldHVybiAnZXJyb3InO1xuICBpZiAoaXNSZWdleHAodmFsKSkgcmV0dXJuICdyZWdleHAnO1xuXG4gIHN3aXRjaCAoY3Rvck5hbWUodmFsKSkge1xuICAgIGNhc2UgJ1N5bWJvbCc6IHJldHVybiAnc3ltYm9sJztcbiAgICBjYXNlICdQcm9taXNlJzogcmV0dXJuICdwcm9taXNlJztcblxuICAgIC8vIFNldCwgTWFwLCBXZWFrU2V0LCBXZWFrTWFwXG4gICAgY2FzZSAnV2Vha01hcCc6IHJldHVybiAnd2Vha21hcCc7XG4gICAgY2FzZSAnV2Vha1NldCc6IHJldHVybiAnd2Vha3NldCc7XG4gICAgY2FzZSAnTWFwJzogcmV0dXJuICdtYXAnO1xuICAgIGNhc2UgJ1NldCc6IHJldHVybiAnc2V0JztcblxuICAgIC8vIDgtYml0IHR5cGVkIGFycmF5c1xuICAgIGNhc2UgJ0ludDhBcnJheSc6IHJldHVybiAnaW50OGFycmF5JztcbiAgICBjYXNlICdVaW50OEFycmF5JzogcmV0dXJuICd1aW50OGFycmF5JztcbiAgICBjYXNlICdVaW50OENsYW1wZWRBcnJheSc6IHJldHVybiAndWludDhjbGFtcGVkYXJyYXknO1xuXG4gICAgLy8gMTYtYml0IHR5cGVkIGFycmF5c1xuICAgIGNhc2UgJ0ludDE2QXJyYXknOiByZXR1cm4gJ2ludDE2YXJyYXknO1xuICAgIGNhc2UgJ1VpbnQxNkFycmF5JzogcmV0dXJuICd1aW50MTZhcnJheSc7XG5cbiAgICAvLyAzMi1iaXQgdHlwZWQgYXJyYXlzXG4gICAgY2FzZSAnSW50MzJBcnJheSc6IHJldHVybiAnaW50MzJhcnJheSc7XG4gICAgY2FzZSAnVWludDMyQXJyYXknOiByZXR1cm4gJ3VpbnQzMmFycmF5JztcbiAgICBjYXNlICdGbG9hdDMyQXJyYXknOiByZXR1cm4gJ2Zsb2F0MzJhcnJheSc7XG4gICAgY2FzZSAnRmxvYXQ2NEFycmF5JzogcmV0dXJuICdmbG9hdDY0YXJyYXknO1xuICB9XG5cbiAgaWYgKGlzR2VuZXJhdG9yT2JqKHZhbCkpIHtcbiAgICByZXR1cm4gJ2dlbmVyYXRvcic7XG4gIH1cblxuICAvLyBOb24tcGxhaW4gb2JqZWN0c1xuICB0eXBlID0gdG9TdHJpbmcuY2FsbCh2YWwpO1xuICBzd2l0Y2ggKHR5cGUpIHtcbiAgICBjYXNlICdbb2JqZWN0IE9iamVjdF0nOiByZXR1cm4gJ29iamVjdCc7XG4gICAgLy8gaXRlcmF0b3JzXG4gICAgY2FzZSAnW29iamVjdCBNYXAgSXRlcmF0b3JdJzogcmV0dXJuICdtYXBpdGVyYXRvcic7XG4gICAgY2FzZSAnW29iamVjdCBTZXQgSXRlcmF0b3JdJzogcmV0dXJuICdzZXRpdGVyYXRvcic7XG4gICAgY2FzZSAnW29iamVjdCBTdHJpbmcgSXRlcmF0b3JdJzogcmV0dXJuICdzdHJpbmdpdGVyYXRvcic7XG4gICAgY2FzZSAnW29iamVjdCBBcnJheSBJdGVyYXRvcl0nOiByZXR1cm4gJ2FycmF5aXRlcmF0b3InO1xuICB9XG5cbiAgLy8gb3RoZXJcbiAgcmV0dXJuIHR5cGUuc2xpY2UoOCwgLTEpLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgvXFxzL2csICcnKTtcbn07XG5cbmZ1bmN0aW9uIGN0b3JOYW1lKHZhbCkge1xuICByZXR1cm4gdHlwZW9mIHZhbC5jb25zdHJ1Y3RvciA9PT0gJ2Z1bmN0aW9uJyA/IHZhbC5jb25zdHJ1Y3Rvci5uYW1lIDogbnVsbDtcbn1cblxuZnVuY3Rpb24gaXNBcnJheSh2YWwpIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkpIHJldHVybiBBcnJheS5pc0FycmF5KHZhbCk7XG4gIHJldHVybiB2YWwgaW5zdGFuY2VvZiBBcnJheTtcbn1cblxuZnVuY3Rpb24gaXNFcnJvcih2YWwpIHtcbiAgcmV0dXJuIHZhbCBpbnN0YW5jZW9mIEVycm9yIHx8ICh0eXBlb2YgdmFsLm1lc3NhZ2UgPT09ICdzdHJpbmcnICYmIHZhbC5jb25zdHJ1Y3RvciAmJiB0eXBlb2YgdmFsLmNvbnN0cnVjdG9yLnN0YWNrVHJhY2VMaW1pdCA9PT0gJ251bWJlcicpO1xufVxuXG5mdW5jdGlvbiBpc0RhdGUodmFsKSB7XG4gIGlmICh2YWwgaW5zdGFuY2VvZiBEYXRlKSByZXR1cm4gdHJ1ZTtcbiAgcmV0dXJuIHR5cGVvZiB2YWwudG9EYXRlU3RyaW5nID09PSAnZnVuY3Rpb24nXG4gICAgJiYgdHlwZW9mIHZhbC5nZXREYXRlID09PSAnZnVuY3Rpb24nXG4gICAgJiYgdHlwZW9mIHZhbC5zZXREYXRlID09PSAnZnVuY3Rpb24nO1xufVxuXG5mdW5jdGlvbiBpc1JlZ2V4cCh2YWwpIHtcbiAgaWYgKHZhbCBpbnN0YW5jZW9mIFJlZ0V4cCkgcmV0dXJuIHRydWU7XG4gIHJldHVybiB0eXBlb2YgdmFsLmZsYWdzID09PSAnc3RyaW5nJ1xuICAgICYmIHR5cGVvZiB2YWwuaWdub3JlQ2FzZSA9PT0gJ2Jvb2xlYW4nXG4gICAgJiYgdHlwZW9mIHZhbC5tdWx0aWxpbmUgPT09ICdib29sZWFuJ1xuICAgICYmIHR5cGVvZiB2YWwuZ2xvYmFsID09PSAnYm9vbGVhbic7XG59XG5cbmZ1bmN0aW9uIGlzR2VuZXJhdG9yRm4obmFtZSwgdmFsKSB7XG4gIHJldHVybiBjdG9yTmFtZShuYW1lKSA9PT0gJ0dlbmVyYXRvckZ1bmN0aW9uJztcbn1cblxuZnVuY3Rpb24gaXNHZW5lcmF0b3JPYmoodmFsKSB7XG4gIHJldHVybiB0eXBlb2YgdmFsLnRocm93ID09PSAnZnVuY3Rpb24nXG4gICAgJiYgdHlwZW9mIHZhbC5yZXR1cm4gPT09ICdmdW5jdGlvbidcbiAgICAmJiB0eXBlb2YgdmFsLm5leHQgPT09ICdmdW5jdGlvbic7XG59XG5cbmZ1bmN0aW9uIGlzQXJndW1lbnRzKHZhbCkge1xuICB0cnkge1xuICAgIGlmICh0eXBlb2YgdmFsLmxlbmd0aCA9PT0gJ251bWJlcicgJiYgdHlwZW9mIHZhbC5jYWxsZWUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgaWYgKGVyci5tZXNzYWdlLmluZGV4T2YoJ2NhbGxlZScpICE9PSAtMSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiBJZiB5b3UgbmVlZCB0byBzdXBwb3J0IFNhZmFyaSA1LTcgKDgtMTAgeXItb2xkIGJyb3dzZXIpLFxuICogdGFrZSBhIGxvb2sgYXQgaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9pcy1idWZmZXJcbiAqL1xuXG5mdW5jdGlvbiBpc0J1ZmZlcih2YWwpIHtcbiAgaWYgKHZhbC5jb25zdHJ1Y3RvciAmJiB0eXBlb2YgdmFsLmNvbnN0cnVjdG9yLmlzQnVmZmVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIHZhbC5jb25zdHJ1Y3Rvci5pc0J1ZmZlcih2YWwpO1xuICB9XG4gIHJldHVybiBmYWxzZTtcbn1cbiIsIi8qIVxuICogc2hhbGxvdy1jbG9uZSA8aHR0cHM6Ly9naXRodWIuY29tL2pvbnNjaGxpbmtlcnQvc2hhbGxvdy1jbG9uZT5cbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgSm9uIFNjaGxpbmtlcnQuXG4gKiBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCB2YWx1ZU9mID0gU3ltYm9sLnByb3RvdHlwZS52YWx1ZU9mO1xuY29uc3QgdHlwZU9mID0gcmVxdWlyZSgna2luZC1vZicpO1xuXG5mdW5jdGlvbiBjbG9uZSh2YWwsIGRlZXApIHtcbiAgc3dpdGNoICh0eXBlT2YodmFsKSkge1xuICAgIGNhc2UgJ2FycmF5JzpcbiAgICAgIHJldHVybiB2YWwuc2xpY2UoKTtcbiAgICBjYXNlICdvYmplY3QnOlxuICAgICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIHZhbCk7XG4gICAgY2FzZSAnZGF0ZSc6XG4gICAgICByZXR1cm4gbmV3IHZhbC5jb25zdHJ1Y3RvcihOdW1iZXIodmFsKSk7XG4gICAgY2FzZSAnbWFwJzpcbiAgICAgIHJldHVybiBuZXcgTWFwKHZhbCk7XG4gICAgY2FzZSAnc2V0JzpcbiAgICAgIHJldHVybiBuZXcgU2V0KHZhbCk7XG4gICAgY2FzZSAnYnVmZmVyJzpcbiAgICAgIHJldHVybiBjbG9uZUJ1ZmZlcih2YWwpO1xuICAgIGNhc2UgJ3N5bWJvbCc6XG4gICAgICByZXR1cm4gY2xvbmVTeW1ib2wodmFsKTtcbiAgICBjYXNlICdhcnJheWJ1ZmZlcic6XG4gICAgICByZXR1cm4gY2xvbmVBcnJheUJ1ZmZlcih2YWwpO1xuICAgIGNhc2UgJ2Zsb2F0MzJhcnJheSc6XG4gICAgY2FzZSAnZmxvYXQ2NGFycmF5JzpcbiAgICBjYXNlICdpbnQxNmFycmF5JzpcbiAgICBjYXNlICdpbnQzMmFycmF5JzpcbiAgICBjYXNlICdpbnQ4YXJyYXknOlxuICAgIGNhc2UgJ3VpbnQxNmFycmF5JzpcbiAgICBjYXNlICd1aW50MzJhcnJheSc6XG4gICAgY2FzZSAndWludDhjbGFtcGVkYXJyYXknOlxuICAgIGNhc2UgJ3VpbnQ4YXJyYXknOlxuICAgICAgcmV0dXJuIGNsb25lVHlwZWRBcnJheSh2YWwpO1xuICAgIGNhc2UgJ3JlZ2V4cCc6XG4gICAgICByZXR1cm4gY2xvbmVSZWdFeHAodmFsKTtcbiAgICBjYXNlICdlcnJvcic6XG4gICAgICByZXR1cm4gT2JqZWN0LmNyZWF0ZSh2YWwpO1xuICAgIGRlZmF1bHQ6IHtcbiAgICAgIHJldHVybiB2YWw7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGNsb25lUmVnRXhwKHZhbCkge1xuICBjb25zdCBmbGFncyA9IHZhbC5mbGFncyAhPT0gdm9pZCAwID8gdmFsLmZsYWdzIDogKC9cXHcrJC8uZXhlYyh2YWwpIHx8IHZvaWQgMCk7XG4gIGNvbnN0IHJlID0gbmV3IHZhbC5jb25zdHJ1Y3Rvcih2YWwuc291cmNlLCBmbGFncyk7XG4gIHJlLmxhc3RJbmRleCA9IHZhbC5sYXN0SW5kZXg7XG4gIHJldHVybiByZTtcbn1cblxuZnVuY3Rpb24gY2xvbmVBcnJheUJ1ZmZlcih2YWwpIHtcbiAgY29uc3QgcmVzID0gbmV3IHZhbC5jb25zdHJ1Y3Rvcih2YWwuYnl0ZUxlbmd0aCk7XG4gIG5ldyBVaW50OEFycmF5KHJlcykuc2V0KG5ldyBVaW50OEFycmF5KHZhbCkpO1xuICByZXR1cm4gcmVzO1xufVxuXG5mdW5jdGlvbiBjbG9uZVR5cGVkQXJyYXkodmFsLCBkZWVwKSB7XG4gIHJldHVybiBuZXcgdmFsLmNvbnN0cnVjdG9yKHZhbC5idWZmZXIsIHZhbC5ieXRlT2Zmc2V0LCB2YWwubGVuZ3RoKTtcbn1cblxuZnVuY3Rpb24gY2xvbmVCdWZmZXIodmFsKSB7XG4gIGNvbnN0IGxlbiA9IHZhbC5sZW5ndGg7XG4gIGNvbnN0IGJ1ZiA9IEJ1ZmZlci5hbGxvY1Vuc2FmZSA/IEJ1ZmZlci5hbGxvY1Vuc2FmZShsZW4pIDogQnVmZmVyLmZyb20obGVuKTtcbiAgdmFsLmNvcHkoYnVmKTtcbiAgcmV0dXJuIGJ1Zjtcbn1cblxuZnVuY3Rpb24gY2xvbmVTeW1ib2wodmFsKSB7XG4gIHJldHVybiB2YWx1ZU9mID8gT2JqZWN0KHZhbHVlT2YuY2FsbCh2YWwpKSA6IHt9O1xufVxuXG4vKipcbiAqIEV4cG9zZSBgY2xvbmVgXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBjbG9uZTtcbiIsImltcG9ydCB7IGdldF9oZXJvIH0gZnJvbSBcIi4vZ2V0X2hlcm9cIjtcbnZhciBSRVNFQUNIX01BUCA9IHtcbiAgICBzY2FubmluZzogXCJTY2FubmluZ1wiLFxuICAgIHByb3B1bHNpb246IFwiSHlwZXJzcGFjZSBSYW5nZVwiLFxuICAgIHRlcnJhZm9ybWluZzogXCJUZXJyYWZvcm1pbmdcIixcbiAgICByZXNlYXJjaDogXCJFeHBlcmltZW50YXRpb25cIixcbiAgICB3ZWFwb25zOiBcIldlYXBvbnNcIixcbiAgICBiYW5raW5nOiBcIkJhbmtpbmdcIixcbiAgICBtYW51ZmFjdHVyaW5nOiBcIk1hbnVmYWN0dXJpbmdcIixcbn07XG4vL0ZvciBxdWljayByZXNlYXJjaCBkaXNwbGF5XG5mdW5jdGlvbiBnZXRfcmVzZWFyY2goZ2FtZSkge1xuICAgIHZhciB1bml2ZXJzZSA9IGdhbWUudW5pdmVyc2U7XG4gICAgdmFyIGhlcm8gPSBnZXRfaGVybyhnYW1lLnVuaXZlcnNlKTtcbiAgICB2YXIgc2NpZW5jZSA9IGhlcm8udG90YWxfc2NpZW5jZTtcbiAgICAvL0N1cnJlbnQgU2NpZW5jZVxuICAgIHZhciBjdXJyZW50ID0gaGVyby50ZWNoW2hlcm8ucmVzZWFyY2hpbmddO1xuICAgIHZhciBjdXJyZW50X3BvaW50c19yZW1haW5pbmcgPSBjdXJyZW50LmJyciAqIGN1cnJlbnQubGV2ZWwgLSBjdXJyZW50LnJlc2VhcmNoO1xuICAgIHZhciBldGEgPSBNYXRoLmNlaWwoY3VycmVudF9wb2ludHNfcmVtYWluaW5nIC8gc2NpZW5jZSk7IC8vSG91cnNcbiAgICAvL05leHQgc2NpZW5jZVxuICAgIHZhciBuZXh0ID0gaGVyby50ZWNoW2hlcm8ucmVzZWFyY2hpbmdfbmV4dF07XG4gICAgdmFyIG5leHRfcG9pbnRzX3JlbWFpbmluZyA9IG5leHQuYnJyICogbmV4dC5sZXZlbCAtIG5leHQucmVzZWFyY2g7XG4gICAgdmFyIG5leHRfZXRhID0gTWF0aC5jZWlsKG5leHRfcG9pbnRzX3JlbWFpbmluZyAvIHNjaWVuY2UpICsgZXRhO1xuICAgIHZhciBuZXh0X2xldmVsID0gbmV4dC5sZXZlbCArIDE7XG4gICAgaWYgKGhlcm8ucmVzZWFyY2hpbmcgPT0gaGVyby5yZXNlYXJjaGluZ19uZXh0KSB7XG4gICAgICAgIC8vUmVjdXJyaW5nIHJlc2VhcmNoXG4gICAgICAgIG5leHRfcG9pbnRzX3JlbWFpbmluZyArPSBuZXh0LmJycjtcbiAgICAgICAgbmV4dF9ldGEgPSBNYXRoLmNlaWwoKG5leHQuYnJyICogbmV4dC5sZXZlbCArIDEpIC8gc2NpZW5jZSkgKyBldGE7XG4gICAgICAgIG5leHRfbGV2ZWwgKz0gMTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgICAgY3VycmVudF9uYW1lOiBSRVNFQUNIX01BUFtoZXJvLnJlc2VhcmNoaW5nXSxcbiAgICAgICAgY3VycmVudF9sZXZlbDogY3VycmVudFtcImxldmVsXCJdICsgMSxcbiAgICAgICAgY3VycmVudF9ldGE6IGV0YSxcbiAgICAgICAgbmV4dF9uYW1lOiBSRVNFQUNIX01BUFtoZXJvLnJlc2VhcmNoaW5nX25leHRdLFxuICAgICAgICBuZXh0X2xldmVsOiBuZXh0X2xldmVsLFxuICAgICAgICBuZXh0X2V0YTogbmV4dF9ldGEsXG4gICAgICAgIHNjaWVuY2U6IHNjaWVuY2UsXG4gICAgfTtcbn1cbmZ1bmN0aW9uIGdldF9yZXNlYXJjaF90ZXh0KGdhbWUpIHtcbiAgICB2YXIgcmVzZWFyY2ggPSBnZXRfcmVzZWFyY2goZ2FtZSk7XG4gICAgdmFyIGZpcnN0X2xpbmUgPSBcIk5vdzogXCIuY29uY2F0KHJlc2VhcmNoW1wiY3VycmVudF9uYW1lXCJdLCBcIiBcIikuY29uY2F0KHJlc2VhcmNoW1wiY3VycmVudF9sZXZlbFwiXSwgXCIgLSBcIikuY29uY2F0KHJlc2VhcmNoW1wiY3VycmVudF9ldGFcIl0sIFwiIHRpY2tzLlwiKTtcbiAgICB2YXIgc2Vjb25kX2xpbmUgPSBcIk5leHQ6IFwiLmNvbmNhdChyZXNlYXJjaFtcIm5leHRfbmFtZVwiXSwgXCIgXCIpLmNvbmNhdChyZXNlYXJjaFtcIm5leHRfbGV2ZWxcIl0sIFwiIC0gXCIpLmNvbmNhdChyZXNlYXJjaFtcIm5leHRfZXRhXCJdLCBcIiB0aWNrcy5cIik7XG4gICAgdmFyIHRoaXJkX2xpbmUgPSBcIk15IFNjaWVuY2U6IFwiLmNvbmNhdChyZXNlYXJjaFtcInNjaWVuY2VcIl0pO1xuICAgIHJldHVybiBcIlwiLmNvbmNhdChmaXJzdF9saW5lLCBcIlxcblwiKS5jb25jYXQoc2Vjb25kX2xpbmUsIFwiXFxuXCIpLmNvbmNhdCh0aGlyZF9saW5lLCBcIlxcblwiKTtcbn1cbmZ1bmN0aW9uIE1hcmtEb3duTWVzc2FnZUNvbW1lbnQoY29udGV4dCwgdGV4dCwgaW5kZXgpIHtcbiAgICB2YXIgbWVzc2FnZUNvbW1lbnQgPSBjb250ZXh0Lk1lc3NhZ2VDb21tZW50KHRleHQsIGluZGV4KTtcbiAgICByZXR1cm4gXCJcIjtcbn1cbmV4cG9ydCB7IGdldF9yZXNlYXJjaCwgZ2V0X3Jlc2VhcmNoX3RleHQsIE1hcmtEb3duTWVzc2FnZUNvbW1lbnQgfTtcbiIsImltcG9ydCB7IGdldF9sZWRnZXIgfSBmcm9tIFwiLi9sZWRnZXJcIjtcbmltcG9ydCB7IGdldF9oZXJvIH0gZnJvbSBcIi4vZ2V0X2hlcm9cIjtcbmltcG9ydCB7IGdhbWUsIGNydXgsIG5wdWksIHVuaXZlcnNlIH0gZnJvbSBcIi4vZ2FtZV9zdGF0ZVwiO1xuLy9HbG9iYWwgY2FjaGVkIGV2ZW50IHN5c3RlbS5cbmV4cG9ydCB2YXIgY2FjaGVkX2V2ZW50cyA9IFtdO1xuZXhwb3J0IHZhciBjYWNoZUZldGNoU3RhcnQgPSBuZXcgRGF0ZSgpO1xuZXhwb3J0IHZhciBjYWNoZUZldGNoU2l6ZSA9IDA7XG4vL0FzeW5jIHJlcXVlc3QgZ2FtZSBldmVudHNcbi8vZ2FtZSBpcyB1c2VkIHRvIGdldCB0aGUgYXBpIHZlcnNpb24gYW5kIHRoZSBnYW1lTnVtYmVyXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlX2V2ZW50X2NhY2hlKGZldGNoU2l6ZSwgc3VjY2VzcywgZXJyb3IpIHtcbiAgICB2YXIgY291bnQgPSBjYWNoZWRfZXZlbnRzLmxlbmd0aCA+IDAgPyBmZXRjaFNpemUgOiAxMDAwMDA7XG4gICAgY2FjaGVGZXRjaFN0YXJ0ID0gbmV3IERhdGUoKTtcbiAgICBjYWNoZUZldGNoU2l6ZSA9IGNvdW50O1xuICAgIHZhciBwYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHtcbiAgICAgICAgdHlwZTogXCJmZXRjaF9nYW1lX21lc3NhZ2VzXCIsXG4gICAgICAgIGNvdW50OiBjb3VudC50b1N0cmluZygpLFxuICAgICAgICBvZmZzZXQ6IFwiMFwiLFxuICAgICAgICBncm91cDogXCJnYW1lX2V2ZW50XCIsXG4gICAgICAgIHZlcnNpb246IGdhbWUudmVyc2lvbixcbiAgICAgICAgZ2FtZV9udW1iZXI6IGdhbWUuZ2FtZU51bWJlcixcbiAgICB9KTtcbiAgICB2YXIgaGVhZGVycyA9IHtcbiAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWRuXCIsXG4gICAgfTtcbiAgICBmZXRjaChcIi90cmVxdWVzdC9mZXRjaF9nYW1lX21lc3NhZ2VzXCIsIHtcbiAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWRcIixcbiAgICAgICAgfSxcbiAgICAgICAgYm9keTogcGFyYW1zLFxuICAgIH0pXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSkgeyByZXR1cm4gcmVzcG9uc2UuanNvbigpOyB9KVxuICAgICAgICAudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgc3luY19tZXNzYWdlX2NhY2hlKHJlc3BvbnNlKTsgLy9VcGRhdGVzIGNhY2hlZF9ldmVudHNcbiAgICAgICAgLy9jYWNoZWRfZXZlbnRzID0gc3luY19tZXNzYWdlX2NhY2hlKHJlc3BvbnNlKSlcbiAgICB9KVxuICAgICAgICAudGhlbihmdW5jdGlvbiAoeCkgeyByZXR1cm4gc3VjY2VzcyhnYW1lLCBjcnV4KTsgfSlcbiAgICAgICAgLmNhdGNoKGVycm9yKTtcbn1cbi8vQ3VzdG9tIFVJIENvbXBvbmVudHMgZm9yIExlZGdlclxuZXhwb3J0IGZ1bmN0aW9uIFBsYXllck5hbWVJY29uUm93TGluayhwbGF5ZXIpIHtcbiAgICB2YXIgcGxheWVyTmFtZUljb25Sb3cgPSBjcnV4LldpZGdldChcInJlbCBjb2xfYmxhY2sgY2xpY2thYmxlXCIpLnNpemUoNDgwLCA0OCk7XG4gICAgbnB1aS5QbGF5ZXJJY29uKHBsYXllciwgdHJ1ZSkucm9vc3QocGxheWVyTmFtZUljb25Sb3cpO1xuICAgIGNydXhcbiAgICAgICAgLlRleHQoXCJcIiwgXCJzZWN0aW9uX3RpdGxlXCIpXG4gICAgICAgIC5ncmlkKDYsIDAsIDIxLCAzKVxuICAgICAgICAucmF3SFRNTChcIjxhIG9uY2xpY2s9XFxcIkNydXguY3J1eC50cmlnZ2VyKCdzaG93X3BsYXllcl91aWQnLCAnXCIuY29uY2F0KHBsYXllci51aWQsIFwiJyApXFxcIj5cIikuY29uY2F0KHBsYXllci5hbGlhcywgXCI8L2E+XCIpKVxuICAgICAgICAucm9vc3QocGxheWVyTmFtZUljb25Sb3cpO1xuICAgIHJldHVybiBwbGF5ZXJOYW1lSWNvblJvdztcbn1cbmV4cG9ydCBmdW5jdGlvbiBzeW5jX21lc3NhZ2VfY2FjaGUocmVzcG9uc2UpIHtcbiAgICB2YXIgY2FjaGVGZXRjaEVuZCA9IG5ldyBEYXRlKCk7XG4gICAgdmFyIGVsYXBzZWQgPSBjYWNoZUZldGNoRW5kLmdldFRpbWUoKSAtIGNhY2hlRmV0Y2hTdGFydC5nZXRUaW1lKCk7XG4gICAgY29uc29sZS5sb2coXCJGZXRjaGVkIFwiLmNvbmNhdChjYWNoZUZldGNoU2l6ZSwgXCIgZXZlbnRzIGluIFwiKS5jb25jYXQoZWxhcHNlZCwgXCJtc1wiKSk7XG4gICAgdmFyIGluY29taW5nID0gcmVzcG9uc2UucmVwb3J0Lm1lc3NhZ2VzO1xuICAgIGlmIChjYWNoZWRfZXZlbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdmFyIG92ZXJsYXBPZmZzZXQgPSAtMTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBpbmNvbWluZy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgdmFyIG1lc3NhZ2VfMSA9IGluY29taW5nW2ldO1xuICAgICAgICAgICAgaWYgKG1lc3NhZ2VfMS5rZXkgPT09IGNhY2hlZF9ldmVudHNbMF0ua2V5KSB7XG4gICAgICAgICAgICAgICAgb3ZlcmxhcE9mZnNldCA9IGk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG92ZXJsYXBPZmZzZXQgPj0gMCkge1xuICAgICAgICAgICAgaW5jb21pbmcgPSBpbmNvbWluZy5zbGljZSgwLCBvdmVybGFwT2Zmc2V0KTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChvdmVybGFwT2Zmc2V0IDwgMCkge1xuICAgICAgICAgICAgdmFyIHNpemUgPSBpbmNvbWluZy5sZW5ndGggKiAyO1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJNaXNzaW5nIHNvbWUgZXZlbnRzLCBkb3VibGUgZmV0Y2ggdG8gXCIuY29uY2F0KHNpemUpKTtcbiAgICAgICAgICAgIC8vdXBkYXRlX2V2ZW50X2NhY2hlKGdhbWUsIGNydXgsIHNpemUsIHJlY2lldmVfbmV3X21lc3NhZ2VzLCBjb25zb2xlLmVycm9yKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyB3ZSBoYWQgY2FjaGVkIGV2ZW50cywgYnV0IHdhbnQgdG8gYmUgZXh0cmEgcGFyYW5vaWQgYWJvdXRcbiAgICAgICAgLy8gY29ycmVjdG5lc3MuIFNvIGlmIHRoZSByZXNwb25zZSBjb250YWluZWQgdGhlIGVudGlyZSBldmVudFxuICAgICAgICAvLyBsb2csIHZhbGlkYXRlIHRoYXQgaXQgZXhhY3RseSBtYXRjaGVzIHRoZSBjYWNoZWQgZXZlbnRzLlxuICAgICAgICBpZiAocmVzcG9uc2UucmVwb3J0Lm1lc3NhZ2VzLmxlbmd0aCA9PT0gY2FjaGVkX2V2ZW50cy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiKioqIFZhbGlkYXRpbmcgY2FjaGVkX2V2ZW50cyAqKipcIik7XG4gICAgICAgICAgICB2YXIgdmFsaWRfMSA9IHJlc3BvbnNlLnJlcG9ydC5tZXNzYWdlcztcbiAgICAgICAgICAgIHZhciBpbnZhbGlkRW50cmllcyA9IGNhY2hlZF9ldmVudHMuZmlsdGVyKGZ1bmN0aW9uIChlLCBpKSB7IHJldHVybiBlLmtleSAhPT0gdmFsaWRfMVtpXS5rZXk7IH0pO1xuICAgICAgICAgICAgaWYgKGludmFsaWRFbnRyaWVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGFsZXJ0KFwiISEgSW52YWxpZCBlbnRyaWVzIGZvdW5kXCIpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCIhISBJbnZhbGlkIGVudHJpZXMgZm91bmQ6IFwiLCBpbnZhbGlkRW50cmllcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIioqKiBWYWxpZGF0aW9uIENvbXBsZXRlZCAqKipcIik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyB0aGUgcmVzcG9uc2UgZGlkbid0IGNvbnRhaW4gdGhlIGVudGlyZSBldmVudCBsb2cuIEdvIGZldGNoXG4gICAgICAgICAgICAvLyBhIHZlcnNpb24gdGhhdCBfZG9lc18uXG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgdXBkYXRlX2V2ZW50X2NhY2hlKFxuICAgICAgICAgICAgICBnYW1lLFxuICAgICAgICAgICAgICBjcnV4LFxuICAgICAgICAgICAgICAxMDAwMDAsXG4gICAgICAgICAgICAgIHJlY2lldmVfbmV3X21lc3NhZ2VzLFxuICAgICAgICAgICAgICBjb25zb2xlLmVycm9yLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICovXG4gICAgICAgIH1cbiAgICB9XG4gICAgY2FjaGVkX2V2ZW50cyA9IGluY29taW5nLmNvbmNhdChjYWNoZWRfZXZlbnRzKTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBnZXRfY2FjaGVkX2V2ZW50cygpIHtcbiAgICByZXR1cm4gY2FjaGVkX2V2ZW50cztcbn1cbi8vSGFuZGxlciB0byByZWNpZXZlIG5ldyBtZXNzYWdlc1xuZXhwb3J0IGZ1bmN0aW9uIHJlY2lldmVfbmV3X21lc3NhZ2VzKCkge1xuICAgIHZhciBwbGF5ZXJzID0gZ2V0X2xlZGdlcihjYWNoZWRfZXZlbnRzKTtcbiAgICB2YXIgbGVkZ2VyU2NyZWVuID0gbnB1aS5sZWRnZXJTY3JlZW4oKTtcbiAgICBucHVpLm9uSGlkZVNjcmVlbihudWxsLCB0cnVlKTtcbiAgICBucHVpLm9uSGlkZVNlbGVjdGlvbk1lbnUoKTtcbiAgICBucHVpLnRyaWdnZXIoXCJoaWRlX3NpZGVfbWVudVwiKTtcbiAgICBucHVpLnRyaWdnZXIoXCJyZXNldF9lZGl0X21vZGVcIik7XG4gICAgbnB1aS5hY3RpdmVTY3JlZW4gPSBsZWRnZXJTY3JlZW47XG4gICAgbGVkZ2VyU2NyZWVuLnJvb3N0KG5wdWkuc2NyZWVuQ29udGFpbmVyKTtcbiAgICBucHVpLmxheW91dEVsZW1lbnQobGVkZ2VyU2NyZWVuKTtcbiAgICBwbGF5ZXJzLmZvckVhY2goZnVuY3Rpb24gKHApIHtcbiAgICAgICAgdmFyIHBsYXllciA9IFBsYXllck5hbWVJY29uUm93TGluayh1bml2ZXJzZS5nYWxheHkucGxheWVyc1twLnVpZF0pLnJvb3N0KG5wdWkuYWN0aXZlU2NyZWVuKTtcbiAgICAgICAgcGxheWVyLmFkZFN0eWxlKFwicGxheWVyX2NlbGxcIik7XG4gICAgICAgIHZhciBwcm9tcHQgPSBwLmRlYnQgPiAwID8gXCJUaGV5IG93ZVwiIDogXCJZb3Ugb3dlXCI7XG4gICAgICAgIGlmIChwLmRlYnQgPT0gMCkge1xuICAgICAgICAgICAgcHJvbXB0ID0gXCJCYWxhbmNlXCI7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHAuZGVidCA8IDApIHtcbiAgICAgICAgICAgIGNydXhcbiAgICAgICAgICAgICAgICAuVGV4dChcIlwiLCBcInBhZDEyIHR4dF9yaWdodCByZWQtdGV4dFwiKVxuICAgICAgICAgICAgICAgIC5yYXdIVE1MKFwiXCIuY29uY2F0KHByb21wdCwgXCI6IFwiKS5jb25jYXQocC5kZWJ0KSlcbiAgICAgICAgICAgICAgICAuZ3JpZCgyMCwgMCwgMTAsIDMpXG4gICAgICAgICAgICAgICAgLnJvb3N0KHBsYXllcik7XG4gICAgICAgICAgICBpZiAocC5kZWJ0ICogLTEgPD0gZ2V0X2hlcm8odW5pdmVyc2UpLmNhc2gpIHtcbiAgICAgICAgICAgICAgICBjcnV4XG4gICAgICAgICAgICAgICAgICAgIC5CdXR0b24oXCJmb3JnaXZlXCIsIFwiZm9yZ2l2ZV9kZWJ0XCIsIHsgdGFyZ2V0UGxheWVyOiBwLnVpZCB9KVxuICAgICAgICAgICAgICAgICAgICAuZ3JpZCgxNywgMCwgNiwgMylcbiAgICAgICAgICAgICAgICAgICAgLnJvb3N0KHBsYXllcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAocC5kZWJ0ID4gMCkge1xuICAgICAgICAgICAgY3J1eFxuICAgICAgICAgICAgICAgIC5UZXh0KFwiXCIsIFwicGFkMTIgdHh0X3JpZ2h0IGJsdWUtdGV4dFwiKVxuICAgICAgICAgICAgICAgIC5yYXdIVE1MKFwiXCIuY29uY2F0KHByb21wdCwgXCI6IFwiKS5jb25jYXQocC5kZWJ0KSlcbiAgICAgICAgICAgICAgICAuZ3JpZCgyMCwgMCwgMTAsIDMpXG4gICAgICAgICAgICAgICAgLnJvb3N0KHBsYXllcik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAocC5kZWJ0ID09IDApIHtcbiAgICAgICAgICAgIGNydXhcbiAgICAgICAgICAgICAgICAuVGV4dChcIlwiLCBcInBhZDEyIHR4dF9yaWdodCBvcmFuZ2UtdGV4dFwiKVxuICAgICAgICAgICAgICAgIC5yYXdIVE1MKFwiXCIuY29uY2F0KHByb21wdCwgXCI6IFwiKS5jb25jYXQocC5kZWJ0KSlcbiAgICAgICAgICAgICAgICAuZ3JpZCgyMCwgMCwgMTAsIDMpXG4gICAgICAgICAgICAgICAgLnJvb3N0KHBsYXllcik7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cbmV4cG9ydCBkZWZhdWx0IHtcbiAgICB1cGRhdGVfZXZlbnRfY2FjaGU6IHVwZGF0ZV9ldmVudF9jYWNoZSxcbiAgICByZWNpZXZlX25ld19tZXNzYWdlczogcmVjaWV2ZV9uZXdfbWVzc2FnZXMsXG59O1xuIiwiZXhwb3J0IHZhciBOZXB0dW5lc1ByaWRlID0gbnVsbDtcbmV4cG9ydCB2YXIgZ2FtZSA9IG51bGw7XG5leHBvcnQgdmFyIGNydXggPSBudWxsO1xuZXhwb3J0IHZhciB1bml2ZXJzZSA9IG51bGw7XG5leHBvcnQgdmFyIGdhbGF4eSA9IG51bGw7XG5leHBvcnQgdmFyIG5wdWkgPSBudWxsO1xuZXhwb3J0IHZhciBucCA9IG51bGw7XG5leHBvcnQgdmFyIGluYm94ID0gbnVsbDtcbmV4cG9ydCB2YXIgc2V0X2dhbWVfc3RhdGUgPSBmdW5jdGlvbiAoX2dhbWUsIF9DcnV4KSB7XG4gICAgZ2FtZSA9IF9nYW1lO1xuICAgIE5lcHR1bmVzUHJpZGUgPSBfZ2FtZTtcbiAgICBucHVpID0gZ2FtZS5ucHVpO1xuICAgIG5wID0gZ2FtZS5ucDtcbiAgICBjcnV4ID0gX0NydXg7XG4gICAgdW5pdmVyc2UgPSBnYW1lLnVuaXZlcnNlO1xuICAgIGdhbGF4eSA9IGdhbWUudW5pdmVyc2UuZ2FsYXh5O1xuICAgIGluYm94ID0gZ2FtZS5pbmJveDtcbn07XG4iLCJpbXBvcnQgeyBnZXRfdW5pdmVyc2UgfSBmcm9tIFwiLi91dGlsaXRpZXMvZ2V0X2dhbWVfc3RhdGVcIjtcbmV4cG9ydCBmdW5jdGlvbiBnZXRfaGVybyh1bml2ZXJzZSkge1xuICAgIGlmICh1bml2ZXJzZSA9PT0gdm9pZCAwKSB7IHVuaXZlcnNlID0gZ2V0X3VuaXZlcnNlKCk7IH1cbiAgICByZXR1cm4gdW5pdmVyc2UucGxheWVyO1xufVxuIiwiZXhwb3J0IHZhciBsYXN0Q2xpcCA9IFwiRXJyb3JcIjtcbmV4cG9ydCBmdW5jdGlvbiBjbGlwKHRleHQpIHtcbiAgICBsYXN0Q2xpcCA9IHRleHQ7XG59XG4iLCJpbXBvcnQgeyBnZXRfaGVybyB9IGZyb20gXCIuL2dldF9oZXJvXCI7XG5pbXBvcnQgKiBhcyBDYWNoZSBmcm9tIFwiLi9ldmVudF9jYWNoZVwiO1xuaW1wb3J0IHsgZ2FtZSwgY3J1eCwgdW5pdmVyc2UsIG5wLCBucHVpIH0gZnJvbSBcIi4vZ2FtZV9zdGF0ZVwiO1xuLy9HZXQgbGVkZ2VyIGluZm8gdG8gc2VlIHdoYXQgaXMgb3dlZFxuLy9BY3R1YWxseSBzaG93cyB0aGUgcGFuZWwgb2YgbG9hZGluZ1xuZXhwb3J0IGZ1bmN0aW9uIGdldF9sZWRnZXIobWVzc2FnZXMpIHtcbiAgICB2YXIgbnB1aSA9IGdhbWUubnB1aTtcbiAgICB2YXIgdW5pdmVyc2UgPSBnYW1lLnVuaXZlcnNlO1xuICAgIHZhciBwbGF5ZXJzID0gdW5pdmVyc2UuZ2FsYXh5LnBsYXllcnM7XG4gICAgdmFyIGxvYWRpbmcgPSBjcnV4XG4gICAgICAgIC5UZXh0KFwiXCIsIFwicmVsIHR4dF9jZW50ZXIgcGFkMTJcIilcbiAgICAgICAgLnJhd0hUTUwoXCJQYXJzaW5nIFwiLmNvbmNhdChtZXNzYWdlcy5sZW5ndGgsIFwiIG1lc3NhZ2VzLlwiKSk7XG4gICAgbG9hZGluZy5yb29zdChucHVpLmFjdGl2ZVNjcmVlbik7XG4gICAgdmFyIHVpZCA9IGdldF9oZXJvKHVuaXZlcnNlKS51aWQ7XG4gICAgLy9MZWRnZXIgaXMgYSBsaXN0IG9mIGRlYnRzXG4gICAgdmFyIGxlZGdlciA9IHt9O1xuICAgIG1lc3NhZ2VzXG4gICAgICAgIC5maWx0ZXIoZnVuY3Rpb24gKG0pIHtcbiAgICAgICAgcmV0dXJuIG0ucGF5bG9hZC50ZW1wbGF0ZSA9PSBcIm1vbmV5X3NlbnRcIiB8fFxuICAgICAgICAgICAgbS5wYXlsb2FkLnRlbXBsYXRlID09IFwic2hhcmVkX3RlY2hub2xvZ3lcIjtcbiAgICB9KVxuICAgICAgICAubWFwKGZ1bmN0aW9uIChtKSB7IHJldHVybiBtLnBheWxvYWQ7IH0pXG4gICAgICAgIC5mb3JFYWNoKGZ1bmN0aW9uIChtKSB7XG4gICAgICAgIHZhciBsaWFpc29uID0gbS5mcm9tX3B1aWQgPT0gdWlkID8gbS50b19wdWlkIDogbS5mcm9tX3B1aWQ7XG4gICAgICAgIHZhciB2YWx1ZSA9IG0udGVtcGxhdGUgPT0gXCJtb25leV9zZW50XCIgPyBtLmFtb3VudCA6IG0ucHJpY2U7XG4gICAgICAgIHZhbHVlICo9IG0uZnJvbV9wdWlkID09IHVpZCA/IDEgOiAtMTsgLy8gYW1vdW50IGlzICgrKSBpZiBjcmVkaXQgJiAoLSkgaWYgZGVidFxuICAgICAgICBsaWFpc29uIGluIGxlZGdlclxuICAgICAgICAgICAgPyAobGVkZ2VyW2xpYWlzb25dICs9IHZhbHVlKVxuICAgICAgICAgICAgOiAobGVkZ2VyW2xpYWlzb25dID0gdmFsdWUpO1xuICAgIH0pO1xuICAgIC8vVE9ETzogUmV2aWV3IHRoYXQgdGhpcyBpcyBjb3JyZWN0bHkgZmluZGluZyBhIGxpc3Qgb2Ygb25seSBwZW9wbGUgd2hvIGhhdmUgZGVidHMuXG4gICAgLy9BY2NvdW50cyBhcmUgdGhlIGNyZWRpdCBvciBkZWJpdCByZWxhdGVkIHRvIGVhY2ggdXNlclxuICAgIHZhciBhY2NvdW50cyA9IFtdO1xuICAgIGZvciAodmFyIHVpZF8xIGluIGxlZGdlcikge1xuICAgICAgICB2YXIgcGxheWVyID0gcGxheWVyc1twYXJzZUludCh1aWRfMSldO1xuICAgICAgICBwbGF5ZXIuZGVidCA9IGxlZGdlclt1aWRfMV07XG4gICAgICAgIGFjY291bnRzLnB1c2gocGxheWVyKTtcbiAgICB9XG4gICAgZ2V0X2hlcm8odW5pdmVyc2UpLmxlZGdlciA9IGxlZGdlcjtcbiAgICBjb25zb2xlLmxvZyhhY2NvdW50cyk7XG4gICAgcmV0dXJuIGFjY291bnRzO1xufVxuZXhwb3J0IGZ1bmN0aW9uIHJlbmRlckxlZGdlcihNb3VzZVRyYXApIHtcbiAgICBjb25zb2xlLmxvZyhNb3VzZVRyYXApO1xuICAgIC8vRGVjb25zdHJ1Y3Rpb24gb2YgZGlmZmVyZW50IGNvbXBvbmVudHMgb2YgdGhlIGdhbWUuXG4gICAgdmFyIGNvbmZpZyA9IGdhbWUuY29uZmlnO1xuICAgIHZhciB0ZW1wbGF0ZXMgPSBnYW1lLnRlbXBsYXRlcztcbiAgICB2YXIgcGxheWVycyA9IHVuaXZlcnNlLmdhbGF4eS5wbGF5ZXJzO1xuICAgIE1vdXNlVHJhcC5iaW5kKFtcIm1cIiwgXCJNXCJdLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIG5wLnRyaWdnZXIoXCJ0cmlnZ2VyX2xlZGdlclwiKTtcbiAgICB9KTtcbiAgICB0ZW1wbGF0ZXNbXCJsZWRnZXJcIl0gPSBcIkxlZGdlclwiO1xuICAgIHRlbXBsYXRlc1tcInRlY2hfdHJhZGluZ1wiXSA9IFwiVHJhZGluZyBUZWNobm9sb2d5XCI7XG4gICAgdGVtcGxhdGVzW1wiZm9yZ2l2ZVwiXSA9IFwiUGF5IERlYnRcIjtcbiAgICB0ZW1wbGF0ZXNbXCJmb3JnaXZlX2RlYnRcIl0gPSBcIkFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBmb3JnaXZlIHRoaXMgZGVidD9cIjtcbiAgICBpZiAoIW5wdWkuaGFzbWVudWl0ZW0pIHtcbiAgICAgICAgbnB1aVxuICAgICAgICAgICAgLlNpZGVNZW51SXRlbShcImljb24tZGF0YWJhc2VcIiwgXCJsZWRnZXJcIiwgXCJ0cmlnZ2VyX2xlZGdlclwiKVxuICAgICAgICAgICAgLnJvb3N0KG5wdWkuc2lkZU1lbnUpO1xuICAgICAgICBucHVpLmhhc21lbnVpdGVtID0gdHJ1ZTtcbiAgICB9XG4gICAgbnB1aS5sZWRnZXJTY3JlZW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBucHVpLlNjcmVlbihcImxlZGdlclwiKTtcbiAgICB9O1xuICAgIG5wLm9uKFwidHJpZ2dlcl9sZWRnZXJcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgbGVkZ2VyU2NyZWVuID0gbnB1aS5sZWRnZXJTY3JlZW4oKTtcbiAgICAgICAgdmFyIGxvYWRpbmcgPSBjcnV4XG4gICAgICAgICAgICAuVGV4dChcIlwiLCBcInJlbCB0eHRfY2VudGVyIHBhZDEyIHNlY3Rpb25fdGl0bGVcIilcbiAgICAgICAgICAgIC5yYXdIVE1MKFwiVGFidWxhdGluZyBMZWRnZXIuLi5cIik7XG4gICAgICAgIGxvYWRpbmcucm9vc3QobGVkZ2VyU2NyZWVuKTtcbiAgICAgICAgbnB1aS5vbkhpZGVTY3JlZW4obnVsbCwgdHJ1ZSk7XG4gICAgICAgIG5wdWkub25IaWRlU2VsZWN0aW9uTWVudSgpO1xuICAgICAgICBucHVpLnRyaWdnZXIoXCJoaWRlX3NpZGVfbWVudVwiKTtcbiAgICAgICAgbnB1aS50cmlnZ2VyKFwicmVzZXRfZWRpdF9tb2RlXCIpO1xuICAgICAgICBucHVpLmFjdGl2ZVNjcmVlbiA9IGxlZGdlclNjcmVlbjtcbiAgICAgICAgbGVkZ2VyU2NyZWVuLnJvb3N0KG5wdWkuc2NyZWVuQ29udGFpbmVyKTtcbiAgICAgICAgbnB1aS5sYXlvdXRFbGVtZW50KGxlZGdlclNjcmVlbik7XG4gICAgICAgIENhY2hlLnVwZGF0ZV9ldmVudF9jYWNoZSg0LCBDYWNoZS5yZWNpZXZlX25ld19tZXNzYWdlcywgY29uc29sZS5lcnJvcik7XG4gICAgfSk7XG4gICAgLy9XaHkgbm90IG5wLm9uKFwiRm9yZ2l2ZURlYnRcIik/XG4gICAgbnAub25Gb3JnaXZlRGVidCA9IGZ1bmN0aW9uIChldmVudCwgZGF0YSkge1xuICAgICAgICB2YXIgdGFyZ2V0UGxheWVyID0gZGF0YS50YXJnZXRQbGF5ZXI7XG4gICAgICAgIHZhciBwbGF5ZXIgPSBwbGF5ZXJzW3RhcmdldFBsYXllcl07XG4gICAgICAgIHZhciBhbW91bnQgPSBwbGF5ZXIuZGVidCAqIC0xO1xuICAgICAgICAvL2xldCBhbW91bnQgPSAxXG4gICAgICAgIHVuaXZlcnNlLnBsYXllci5sZWRnZXJbdGFyZ2V0UGxheWVyXSA9IDA7XG4gICAgICAgIG5wLnRyaWdnZXIoXCJzaG93X3NjcmVlblwiLCBbXG4gICAgICAgICAgICBcImNvbmZpcm1cIixcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiBcImZvcmdpdmVfZGVidFwiLFxuICAgICAgICAgICAgICAgIGV2ZW50S2luZDogXCJjb25maXJtX2ZvcmdpdmVfZGVidFwiLFxuICAgICAgICAgICAgICAgIGV2ZW50RGF0YToge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiBcIm9yZGVyXCIsXG4gICAgICAgICAgICAgICAgICAgIG9yZGVyOiBcInNlbmRfbW9uZXksXCIuY29uY2F0KHRhcmdldFBsYXllciwgXCIsXCIpLmNvbmNhdChhbW91bnQpLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICBdKTtcbiAgICB9O1xuICAgIG5wLm9uKFwiY29uZmlybV9mb3JnaXZlX2RlYnRcIiwgZnVuY3Rpb24gKGV2ZW50LCBkYXRhKSB7XG4gICAgICAgIG5wLnRyaWdnZXIoXCJzZXJ2ZXJfcmVxdWVzdFwiLCBkYXRhKTtcbiAgICAgICAgbnAudHJpZ2dlcihcInRyaWdnZXJfbGVkZ2VyXCIpO1xuICAgIH0pO1xuICAgIG5wLm9uKFwiZm9yZ2l2ZV9kZWJ0XCIsIG5wLm9uRm9yZ2l2ZURlYnQpO1xufVxuIiwiaW1wb3J0IHsgZ2V0X2dhbWVfbnVtYmVyIH0gZnJvbSBcIi4vZ2V0X2dhbWVfc3RhdGVcIjtcbmV4cG9ydCBmdW5jdGlvbiBnZXRfYXBpX2RhdGEoYXBpa2V5KSB7XG4gICAgdmFyIGdhbWVfbnVtYmVyID0gZ2V0X2dhbWVfbnVtYmVyKCk7XG4gICAgcmV0dXJuIGZldGNoKFwiaHR0cHM6Ly9ucC5pcm9uaGVsbWV0LmNvbS9hcGlcIiwge1xuICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICBhY2NlcHQ6IFwiYXBwbGljYXRpb24vanNvbiwgdGV4dC9qYXZhc2NyaXB0LCAqLyo7IHE9MC4wMVwiLFxuICAgICAgICAgICAgXCJhY2NlcHQtbGFuZ3VhZ2VcIjogXCJlbi1VUyxlbjtxPTAuOVwiLFxuICAgICAgICAgICAgXCJjb250ZW50LXR5cGVcIjogXCJhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQ7IGNoYXJzZXQ9VVRGLThcIixcbiAgICAgICAgICAgIFwieC1yZXF1ZXN0ZWQtd2l0aFwiOiBcIlhNTEh0dHBSZXF1ZXN0XCIsXG4gICAgICAgIH0sXG4gICAgICAgIHJlZmVycmVyOiBcImh0dHBzOi8vbnAuaXJvbmhlbG1ldC5jb20vZ2FtZS9cIi5jb25jYXQoZ2FtZV9udW1iZXIpLFxuICAgICAgICByZWZlcnJlclBvbGljeTogXCJzdHJpY3Qtb3JpZ2luLXdoZW4tY3Jvc3Mtb3JpZ2luXCIsXG4gICAgICAgIGJvZHk6IFwiZ2FtZV9udW1iZXI9XCIuY29uY2F0KGdhbWVfbnVtYmVyLCBcIiZhcGlfdmVyc2lvbj0wLjEmY29kZT1cIikuY29uY2F0KGFwaWtleSksXG4gICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgIG1vZGU6IFwiY29yc1wiLFxuICAgICAgICBjcmVkZW50aWFsczogXCJpbmNsdWRlXCIsXG4gICAgfSkudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHsgcmV0dXJuIHJlc3BvbnNlLmpzb24oKTsgfSk7XG59XG4iLCIvL0JpbmQgdG8gaW5ib3guZmV0Y2hNZXNzYWdlc1xuaW1wb3J0IHsgY2FjaGVkX2V2ZW50cyB9IGZyb20gXCIuLi9ldmVudF9jYWNoZVwiO1xuaW1wb3J0IHsgdXBkYXRlX2V2ZW50X2NhY2hlIH0gZnJvbSBcIi4uL2V2ZW50X2NhY2hlXCI7XG5pbXBvcnQgeyBpbmJveCB9IGZyb20gXCIuLi9nYW1lX3N0YXRlXCI7XG5leHBvcnQgdmFyIGZldGNoRmlsdGVyZWRNZXNzYWdlcyA9IGZ1bmN0aW9uIChnYW1lLCBDcnV4LCBpbmJveCwgZmlsdGVyKSB7XG4gICAgY29uc29sZS5sb2coXCJGZXRoY2luICAgIGcgRmlsdGVyZWQgTWVzc2FnZXNcIik7XG4gICAgZGlzcGxheUV2ZW50cygpO1xuICAgIGlmIChpbmJveC5maWx0ZXIgIT09IGZpbHRlcikge1xuICAgICAgICBpbmJveC5maWx0ZXIgPSBmaWx0ZXI7XG4gICAgICAgIGluYm94Lm1lc3NhZ2VzW2luYm94LmZpbHRlcl0gPSBudWxsO1xuICAgICAgICBpbmJveC5wYWdlID0gMDtcbiAgICB9XG4gICAgaWYgKGluYm94LnVucmVhZEV2ZW50cylcbiAgICAgICAgaW5ib3gubWVzc2FnZXNbXCJnYW1lX2V2ZW50XCJdID0gbnVsbDtcbiAgICBpZiAoaW5ib3gudW5yZWFkRGlwbG9tYWN5KVxuICAgICAgICBpbmJveC5tZXNzYWdlc1tcImdhbWVfZGlwbG9tYWN5XCJdID0gbnVsbDtcbiAgICBpZiAoaW5ib3gubWVzc2FnZXNbaW5ib3guZmlsdGVyXSAhPT0gbnVsbCkge1xuICAgICAgICAvLyAxLiBpZiB3ZSBhcmUgbG9hZGluZywgd2UgYXJlIHN0aWxsIHdhaXRpbmcgZm9yIHRoZSBzZXJ2ZXIgdG8gcmVzcG9uZFxuICAgICAgICAvLyAyLiBpZiBtZXNzYWdlcyBpcyBudWxsIHRoZW4gd2UgaGF2ZSBuZXZlciByZXF1ZXN0ZWQgdGhlIG1lc3NhZ2VzXG4gICAgICAgIC8vIDMuIGlmIG1lc3NhZ2VzIGlzIGVtcHR5IGFycmF5IFtdIHRoZW4gdGhlIHNlcnZlciBhbHJlYWR5IHRvbGQgdXNcbiAgICAgICAgLy8gICAgdGhlcmUgYXJlIG5vIG1lc3NhZ2VzXG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHN1cGVyX2ZpbHRlciA9IG51bGw7XG4gICAgaWYgKGluYm94LmZpbHRlciA9PSBcInRlY2hub2xvZ3lcIikge1xuICAgICAgICBpbmJveC5maWx0ZXIgPSBcImdhbWVfZXZlbnRcIjtcbiAgICAgICAgc3VwZXJfZmlsdGVyID0gXCJ0ZWNobm9sb2d5XCI7XG4gICAgfVxuICAgIHVwZGF0ZV9ldmVudF9jYWNoZSgxMCwgZnVuY3Rpb24gKGdhbWUpIHsgcmV0dXJuIGRpc3BsYXlFdmVudHMoKTsgfSwgY29uc29sZS5sb2cpO1xuICAgIGluYm94LnRyaWdnZXIoXCJzZXJ2ZXJfcmVxdWVzdFwiLCB7XG4gICAgICAgIHR5cGU6IFwiZmV0Y2hfZ2FtZV9tZXNzYWdlc1wiLFxuICAgICAgICBjb3VudDogaW5ib3gubXBwLFxuICAgICAgICBvZmZzZXQ6IGluYm94Lm1wcCAqIGluYm94LnBhZ2UsXG4gICAgICAgIGdyb3VwOiBpbmJveC5maWx0ZXIsXG4gICAgfSk7XG4gICAgaW5ib3gubG9hZGluZyA9IHRydWU7XG59O1xuZXhwb3J0IHZhciBkaXNwbGF5RXZlbnRzID0gZnVuY3Rpb24gKCkge1xuICAgIGNvbnNvbGUubG9nKGNhY2hlZF9ldmVudHMpO1xuICAgIHZhciB0ZWNoX3VwZGF0ZXMgPSBjYWNoZWRfZXZlbnRzLmZpbHRlcihmdW5jdGlvbiAobSkge1xuICAgICAgICBtLnBheWxvYWQudGVtcGxhdGUgPT0gXCJ0ZWNoX3VwXCI7XG4gICAgfSk7XG4gICAgY29uc29sZS5sb2codGVjaF91cGRhdGVzKTtcbiAgICBpbmJveC5tZXNzYWdlcyA9IHRlY2hfdXBkYXRlcztcbn07XG4iLCJleHBvcnQgZnVuY3Rpb24gZ2V0X3Zpc2libGVfc3RhcnMoKSB7XG4gICAgdmFyIHN0YXJzID0gZ2V0X2FsbF9zdGFycygpO1xuICAgIGlmIChzdGFycyA9PT0gdW5kZWZpbmVkKVxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIHZhciB2aXNpYmxlX3N0YXJzID0gW107XG4gICAgZm9yICh2YXIgX2kgPSAwLCBfYSA9IE9iamVjdC5lbnRyaWVzKHN0YXJzKTsgX2kgPCBfYS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgdmFyIF9iID0gX2FbX2ldLCBpbmRleCA9IF9iWzBdLCBzdGFyID0gX2JbMV07XG4gICAgICAgIGlmIChzdGFyLnYgPT09IFwiMVwiKSB7XG4gICAgICAgICAgICAvL1N0YXIgaXMgdmlzaWJsZVxuICAgICAgICAgICAgdmlzaWJsZV9zdGFycy5wdXNoKHN0YXIpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB2aXNpYmxlX3N0YXJzO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGdldF9nYW1lX251bWJlcigpIHtcbiAgICBpZiAoTmVwdHVuZXNQcmlkZSA9PT0gdW5kZWZpbmVkKVxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIHJldHVybiBOZXB0dW5lc1ByaWRlLmdhbWVOdW1iZXI7XG59XG5leHBvcnQgZnVuY3Rpb24gZ2V0X2FsbF9zdGFycygpIHtcbiAgICBpZiAoTmVwdHVuZXNQcmlkZSA9PT0gdW5kZWZpbmVkKVxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIHJldHVybiBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlLmdhbGF4eS5zdGFycztcbn1cbmV4cG9ydCBmdW5jdGlvbiBnZXRfZmxlZXRzKCkge1xuICAgIGlmIChOZXB0dW5lc1ByaWRlID09PSB1bmRlZmluZWQpXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgcmV0dXJuIE5lcHR1bmVzUHJpZGUudW5pdmVyc2UuZ2FsYXh5LmZsZWV0cztcbn1cbmV4cG9ydCBmdW5jdGlvbiBnZXRfZ2FsYXh5KCkge1xuICAgIGlmIChOZXB0dW5lc1ByaWRlID09PSB1bmRlZmluZWQpXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgcmV0dXJuIGdldF91bml2ZXJzZSgpLmdhbGF4eTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBnZXRfdW5pdmVyc2UoKSB7XG4gICAgaWYgKE5lcHR1bmVzUHJpZGUgPT09IHVuZGVmaW5lZClcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICByZXR1cm4gTmVwdHVuZXNQcmlkZS51bml2ZXJzZTtcbn1cbmV4cG9ydCBmdW5jdGlvbiBnZXRfbmVwdHVuZXNfcHJpZGUoKSB7XG4gICAgaWYgKE5lcHR1bmVzUHJpZGUgPT09IHVuZGVmaW5lZClcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICByZXR1cm4gTmVwdHVuZXNQcmlkZS5ucDtcbn1cbmV4cG9ydCBmdW5jdGlvbiBnZXRfZ2FtZV9zdGF0ZSgpIHtcbiAgICBpZiAoTmVwdHVuZXNQcmlkZSA9PT0gdW5kZWZpbmVkKVxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIHJldHVybiBOZXB0dW5lc1ByaWRlO1xufVxuIiwiZXhwb3J0IHZhciBidXlBcGVHaWZ0U2NyZWVuID0gZnVuY3Rpb24gKENydXgsIHVuaXZlcnNlLCBucHVpKSB7XG4gICAgY29uc29sZS5sb2coXCJPdmVybG9hZGRlZCBHaWZ0IFNjcmVlblwiKTtcbiAgICB2YXIgYnV5ID0gbnB1aS5TY3JlZW4oXCJnaWZ0X2hlYWRpbmdcIikuc2l6ZSg0ODApO1xuICAgIENydXguVGV4dChcImdpZnRfaW50cm9cIiwgXCJyZWwgcGFkMTIgY29sX2FjY2VudCB0eHRfY2VudGVyXCIpXG4gICAgICAgIC5mb3JtYXQoe1xuICAgICAgICBwbGF5ZXI6IHVuaXZlcnNlLnNlbGVjdGVkUGxheWVyLmNvbG91ckJveCArXG4gICAgICAgICAgICB1bml2ZXJzZS5zZWxlY3RlZFBsYXllci5oeXBlcmxpbmtlZEFsaWFzLFxuICAgIH0pXG4gICAgICAgIC5zaXplKDQ4MClcbiAgICAgICAgLnJvb3N0KGJ1eSk7XG4gICAgbnB1aS5HYWxhY3RpY0NyZWRpdEJhbGFuY2UoKS5yb29zdChidXkpO1xuICAgIHZhciBpO1xuICAgIHZhciBtZW51ID0gW1xuICAgICAgICB7IGljb246IFwidHJla1wiLCBhbW91bnQ6IDEgfSxcbiAgICAgICAgeyBpY29uOiBcInJlYmVsXCIsIGFtb3VudDogMSB9LFxuICAgICAgICB7IGljb246IFwiZW1waXJlXCIsIGFtb3VudDogMSB9LFxuICAgICAgICB7IGljb246IFwid29sZlwiLCBhbW91bnQ6IDUgfSxcbiAgICAgICAgeyBpY29uOiBcInBpcmF0ZVwiLCBhbW91bnQ6IDUgfSxcbiAgICAgICAgeyBpY29uOiBcIndvcmRzbWl0aFwiLCBhbW91bnQ6IDIgfSxcbiAgICAgICAgeyBpY29uOiBcImx1Y2t5XCIsIGFtb3VudDogMiB9LFxuICAgICAgICB7IGljb246IFwiaXJvbmJvcm5cIiwgYW1vdW50OiAyIH0sXG4gICAgICAgIHsgaWNvbjogXCJzdHJhbmdlXCIsIGFtb3VudDogMiB9LFxuICAgICAgICB7IGljb246IFwiYXBlXCIsIGFtb3VudDogMSB9LFxuICAgICAgICB7IGljb246IFwidG94aWNcIiwgYW1vdW50OiAxMCB9LFxuICAgICAgICB7IGljb246IFwiY2hlZXN5XCIsIGFtb3VudDogMSB9LFxuICAgICAgICB7IGljb246IFwic3RyYXRlZ2ljXCIsIGFtb3VudDogMSB9LFxuICAgICAgICB7IGljb246IFwiYmFkYXNzXCIsIGFtb3VudDogMSB9LFxuICAgICAgICB7IGljb246IFwibGlvbmhlYXJ0XCIsIGFtb3VudDogMSB9LFxuICAgICAgICB7IGljb246IFwiZ3VuXCIsIGFtb3VudDogMSB9LFxuICAgICAgICB7IGljb246IFwiY29tbWFuZFwiLCBhbW91bnQ6IDEgfSxcbiAgICAgICAgeyBpY29uOiBcInNjaWVuY2VcIiwgYW1vdW50OiAxIH0sXG4gICAgICAgIHsgaWNvbjogXCJuZXJkXCIsIGFtb3VudDogMSB9LFxuICAgICAgICB7IGljb246IFwibWVyaXRcIiwgYW1vdW50OiAxIH0sXG4gICAgXTtcbiAgICB2YXIgc2VjcmV0X21lbnUgPSBbXG4gICAgICAgIHsgaWNvbjogXCJob25vdXJcIiwgYW1vdW50OiAxIH0sXG4gICAgICAgIHsgaWNvbjogXCJ3aXphcmRcIiwgYW1vdW50OiAxIH0sXG4gICAgICAgIHsgaWNvbjogXCJsaWZldGltZVwiLCBhbW91bnQ6IDEgfSxcbiAgICAgICAgeyBpY29uOiBcInRvdXJuZXlfd2luXCIsIGFtb3VudDogMSB9LFxuICAgICAgICB7IGljb246IFwidG91cm5leV9qb2luXCIsIGFtb3VudDogMSB9LFxuICAgICAgICB7IGljb246IFwidG91cm5leV9qb2luXCIsIGFtb3VudDogMSB9LFxuICAgICAgICB7IGljb246IFwidG91cm5leV9qb2luXCIsIGFtb3VudDogMSB9LFxuICAgICAgICB7IGljb246IFwiYnVsbHNleWVcIiwgYW1vdW50OiAxIH0sXG4gICAgICAgIHsgaWNvbjogXCJwcm90ZXVzXCIsIGFtb3VudDogMSB9LFxuICAgICAgICB7IGljb246IFwiZmxhbWJlYXVcIiwgYW1vdW50OiAxIH0sXG4gICAgICAgIHsgaWNvbjogXCJyYXRcIiwgYW1vdW50OiAxIH0sXG4gICAgXTtcbiAgICAvL2xldCBpdGVtczogQmFkZ2VJdGVtSW50ZXJmYWNlW10gPSBtZW51ICsgc2VjcmV0X21lbnU7XG4gICAgdmFyIGl0ZW1zID0gbWVudS5jb25jYXQoc2VjcmV0X21lbnUpO1xuICAgIGZvciAoaSA9IGl0ZW1zLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgIGl0ZW1zW2ldLnB1aWQgPSB1bml2ZXJzZS5zZWxlY3RlZFBsYXllci51aWQ7XG4gICAgICAgIG5wdWkuR2lmdEl0ZW0oaXRlbXNbaV0pLnJvb3N0KGJ1eSk7XG4gICAgfVxuICAgIHJldHVybiBidXk7XG59O1xuZXhwb3J0IHZhciBBcGVHaWZ0SXRlbSA9IGZ1bmN0aW9uIChDcnV4LCB1cmwsIGl0ZW0pIHtcbiAgICB2YXIgZ2kgPSBDcnV4LldpZGdldChcInJlbFwiKS5zaXplKDQ4MCk7XG4gICAgQ3J1eC5XaWRnZXQoXCJyZWwgY29sX2Jhc2VcIikuc2l6ZSg0ODAsIDE2KS5yb29zdChnaSk7XG4gICAgdmFyIGltYWdlX3VybCA9IFwiLi4vaW1hZ2VzL2JhZGdlcy9cIi5jb25jYXQoaXRlbS5pY29uLCBcIi5wbmdcIik7XG4gICAgaWYgKGl0ZW0uaWNvbiA9PSBcImFwZVwiKSB7XG4gICAgICAgIGltYWdlX3VybCA9IFwiXCIuY29uY2F0KHVybCkuY29uY2F0KGl0ZW0uaWNvbiwgXCIucG5nXCIpO1xuICAgIH1cbiAgICBnaS5pY29uID0gQ3J1eC5JbWFnZShpbWFnZV91cmwsIFwiYWJzXCIpLmdyaWQoMC4yNSwgMSwgNiwgNikucm9vc3QoZ2kpO1xuICAgIGdpLmJvZHkgPSBDcnV4LlRleHQoXCJnaWZ0X2Rlc2NfXCIuY29uY2F0KGl0ZW0uaWNvbiksIFwicmVsIHR4dF9zZWxlY3RhYmxlXCIpXG4gICAgICAgIC5zaXplKDM4NCAtIDI0KVxuICAgICAgICAucG9zKDk2ICsgMTIpXG4gICAgICAgIC5yb29zdChnaSk7XG4gICAgZ2kuYnV5Tm93QmcgPSBDcnV4LldpZGdldChcInJlbFwiKS5zaXplKDQ4MCwgNTIpLnJvb3N0KGdpKTtcbiAgICBnaS5idXlOb3dCdXR0b24gPSBDcnV4LkJ1dHRvbihcImJ1eV9ub3dcIiwgXCJidXlfZ2lmdFwiLCBpdGVtKVxuICAgICAgICAuZ3JpZCgyMCwgMCwgMTAsIDMpXG4gICAgICAgIC5yb29zdChnaS5idXlOb3dCZyk7XG4gICAgaWYgKGl0ZW0uYW1vdW50ID4gTmVwdHVuZXNQcmlkZS5hY2NvdW50LmNyZWRpdHMpIHtcbiAgICAgICAgZ2kuYnV5Tm93QnV0dG9uLmRpc2FibGUoKTtcbiAgICB9XG4gICAgQ3J1eC5XaWRnZXQoXCJyZWwgY29sX2FjY2VudFwiKS5zaXplKDQ4MCwgNCkucm9vc3QoZ2kpO1xuICAgIHJldHVybiBnaTtcbn07XG4iLCJleHBvcnQgZnVuY3Rpb24gZHJhd092ZXJsYXlTdHJpbmcoY29udGV4dCwgdGV4dCwgeCwgeSwgZmdDb2xvcikge1xuICAgIGNvbnRleHQuZmlsbFN0eWxlID0gXCIjMDAwMDAwXCI7XG4gICAgZm9yICh2YXIgc21lYXIgPSAxOyBzbWVhciA8IDQ7ICsrc21lYXIpIHtcbiAgICAgICAgY29udGV4dC5maWxsVGV4dCh0ZXh0LCB4ICsgc21lYXIsIHkgKyBzbWVhcik7XG4gICAgICAgIGNvbnRleHQuZmlsbFRleHQodGV4dCwgeCAtIHNtZWFyLCB5ICsgc21lYXIpO1xuICAgICAgICBjb250ZXh0LmZpbGxUZXh0KHRleHQsIHggLSBzbWVhciwgeSAtIHNtZWFyKTtcbiAgICAgICAgY29udGV4dC5maWxsVGV4dCh0ZXh0LCB4ICsgc21lYXIsIHkgLSBzbWVhcik7XG4gICAgfVxuICAgIGNvbnRleHQuZmlsbFN0eWxlID0gZmdDb2xvciB8fCBcIiMwMGZmMDBcIjtcbiAgICBjb250ZXh0LmZpbGxUZXh0KHRleHQsIHgsIHkpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGFueVN0YXJDYW5TZWUodW5pdmVyc2UsIG93bmVyLCBmbGVldCkge1xuICAgIHZhciBzdGFycyA9IHVuaXZlcnNlLmdhbGF4eS5zdGFycztcbiAgICB2YXIgc2NhblJhbmdlID0gdW5pdmVyc2UuZ2FsYXh5LnBsYXllcnNbb3duZXJdLnRlY2guc2Nhbm5pbmcudmFsdWU7XG4gICAgZm9yICh2YXIgcyBpbiBzdGFycykge1xuICAgICAgICB2YXIgc3RhciA9IHN0YXJzW3NdO1xuICAgICAgICBpZiAoc3Rhci5wdWlkID09IG93bmVyKSB7XG4gICAgICAgICAgICB2YXIgZGlzdGFuY2UgPSB1bml2ZXJzZS5kaXN0YW5jZShzdGFyLngsIHN0YXIueSwgcGFyc2VGbG9hdChmbGVldC54KSwgcGFyc2VGbG9hdChmbGVldC55KSk7XG4gICAgICAgICAgICBpZiAoZGlzdGFuY2UgPD0gc2NhblJhbmdlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuIiwiaW1wb3J0IHsgZ2V0X2dhbGF4eSwgfSBmcm9tIFwiLi9nZXRfZ2FtZV9zdGF0ZVwiO1xuaW1wb3J0IHsgZ2V0X2FwaV9kYXRhIH0gZnJvbSBcIi4vYXBpXCI7XG52YXIgb3JpZ2luYWxQbGF5ZXIgPSB1bmRlZmluZWQ7XG4vL1RoaXMgc2F2ZXMgdGhlIGFjdHVhbCBjbGllbnQncyBwbGF5ZXIuXG5mdW5jdGlvbiBzZXRfb3JpZ2luYWxfcGxheWVyKCkge1xuICAgIGlmIChvcmlnaW5hbFBsYXllciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIG9yaWdpbmFsUGxheWVyID0gTmVwdHVuZXNQcmlkZS5vcmlnaW5hbFBsYXllcjtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn1cbmZ1bmN0aW9uIHZhbGlkX2FwaWtleShhcGlrZXkpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbn1cbmZ1bmN0aW9uIGJhZF9rZXkoZXJyKSB7XG4gICAgY29uc29sZS5sb2coXCJUaGUga2V5IGlzIGJhZCBhbmQgbWVyZ2luZyBGQUlMRUQhXCIpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIG1lcmdlVXNlcihldmVudCwgZGF0YSkge1xuICAgIHNldF9vcmlnaW5hbF9wbGF5ZXIoKTtcbiAgICAvL0V4dHJhY3QgdGhhdCBLRVlcbiAgICAvL1RPRE86IEFkZCByZWdleCB0byBnZXQgVEhBVCBLRVlcbiAgICB2YXIgYXBpa2V5ID0gZGF0YSA9PT0gbnVsbCB8fCBkYXRhID09PSB2b2lkIDAgPyB2b2lkIDAgOiBkYXRhLnNwbGl0KFwiOlwiKVsxXTtcbiAgICBjb25zb2xlLmxvZyhhcGlrZXkpO1xuICAgIGlmICh2YWxpZF9hcGlrZXkoYXBpa2V5KSkge1xuICAgICAgICBnZXRfYXBpX2RhdGEoYXBpa2V5KVxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgIHJldHVybiBcImVycm9yXCIgaW4gZGF0YVxuICAgICAgICAgICAgICAgID8gYmFkX2tleShkYXRhKVxuICAgICAgICAgICAgICAgIDogbWVyZ2VVc2VyRGF0YShkYXRhLnNjYW5uaW5nX2RhdGEpO1xuICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKGNvbnNvbGUubG9nKTtcbiAgICB9XG59XG4vL0NvbWJpbmUgZGF0YSBmcm9tIGFub3RoZXIgdXNlclxuLy9DYWxsYmFjayBvbiBBUEkgLi5cbi8vbWVjaGFuaWMgY2xvc2VzIGF0IDVwbVxuLy9UaGlzIHdvcmtzIGJ1dCBub3cgYWRkIGl0IHNvIGl0IGRvZXMgbm90IG92ZXJ0YWtlIHlvdXIgc3RhcnMuXG5leHBvcnQgZnVuY3Rpb24gbWVyZ2VVc2VyRGF0YShzY2FubmluZ0RhdGEpIHtcbiAgICBjb25zb2xlLmxvZyhcIlNBVCBNZXJnaW5nXCIpO1xuICAgIHZhciBnYWxheHkgPSBnZXRfZ2FsYXh5KCk7XG4gICAgdmFyIHN0YXJzID0gc2Nhbm5pbmdEYXRhLnN0YXJzO1xuICAgIHZhciBmbGVldHMgPSBzY2FubmluZ0RhdGEuZmxlZXRzO1xuICAgIC8vIFVwZGF0ZSBzdGFyc1xuICAgIGZvciAodmFyIHN0YXJJZCBpbiBzdGFycykge1xuICAgICAgICB2YXIgc3RhciA9IHN0YXJzW3N0YXJJZF07XG4gICAgICAgIGlmIChnYWxheHkuc3RhcnNbc3RhcklkXSA9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGdhbGF4eS5zdGFyc1tzdGFySWRdID0gc3RhcjtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb25zb2xlLmxvZyhcIlN5bmNpbmdcIik7XG4gICAgLy8gQWRkIGZsZWV0c1xuICAgIGZvciAodmFyIGZsZWV0SWQgaW4gZmxlZXRzKSB7XG4gICAgICAgIHZhciBmbGVldCA9IGZsZWV0c1tmbGVldElkXTtcbiAgICAgICAgaWYgKGdhbGF4eS5mbGVldHNbZmxlZXRJZF0gPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBnYWxheHkuZmxlZXRzW2ZsZWV0SWRdID0gZmxlZXQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy9vbkZ1bGxVbml2ZXJzZSBTZWVtcyB0byBhZGRpdGlvbmFsbHkgbG9hZCBhbGwgdGhlIHBsYXllcnMuXG4gICAgTmVwdHVuZXNQcmlkZS5ucC5vbkZ1bGxVbml2ZXJzZShudWxsLCBnYWxheHkpO1xuICAgIC8vTmVwdHVuZXNQcmlkZS5ucHVpLm9uSGlkZVNjcmVlbihudWxsLCB0cnVlKTtcbn1cbiIsIi8qXG4gKiBJbnRlcmZhY2UgdGhhdCBvdmVycmlkZXMgdGhlIGF1dG9tYXRpb24gdGV4dCB0byBsZXQgeW91IGtub3cgd2hlbiB0aGUgYWkgd2lsbCBtb3ZlIG5leHRcbiAqXG4gKi9cbmltcG9ydCB7IGdldF9jYWNoZWRfZXZlbnRzLCB1cGRhdGVfZXZlbnRfY2FjaGUsIH0gZnJvbSBcIi4uL2V2ZW50X2NhY2hlXCI7XG5pbXBvcnQgeyBnYW1lIH0gZnJvbSBcIi4uL2dhbWVfc3RhdGVcIjtcbmV4cG9ydCBmdW5jdGlvbiBnZXRfbnBjX3RpY2soKSB7XG4gICAgdmFyIGFpID0gZ2FtZS51bml2ZXJzZS5zZWxlY3RlZFBsYXllcjtcbiAgICB2YXIgY2FjaGUgPSBnZXRfY2FjaGVkX2V2ZW50cygpO1xuICAgIHZhciBldmVudHMgPSBjYWNoZS5tYXAoZnVuY3Rpb24gKGUpIHsgcmV0dXJuIGUucGF5bG9hZDsgfSk7XG4gICAgdmFyIGdvb2RieWVzID0gZXZlbnRzLmZpbHRlcihmdW5jdGlvbiAoZSkge1xuICAgICAgICByZXR1cm4gZS50ZW1wbGF0ZS5pbmNsdWRlcyhcImdvb2RieWVfdG9fcGxheWVyXCIpO1xuICAgIH0pO1xuICAgIHZhciB0aWNrID0gZ29vZGJ5ZXMuZmlsdGVyKGZ1bmN0aW9uIChlKSB7IHJldHVybiBlLnVpZCA9PSBhaS51aWQ7IH0pWzBdLnRpY2s7XG4gICAgY29uc29sZS5sb2codGljayk7XG4gICAgcmV0dXJuIHRpY2s7XG59XG5leHBvcnQgZnVuY3Rpb24gYWRkX25wY190aWNrX2NvdW50ZXIoKSB7XG4gICAgdmFyIHRpY2sgPSBnZXRfbnBjX3RpY2soKTtcbiAgICB2YXIgdGl0bGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2NvbnRlbnRBcmVhID4gZGl2ID4gZGl2LndpZGdldC5mdWxsc2NyZWVuID4gZGl2Om50aC1jaGlsZCgzKSA+IGRpdiA+IGRpdjpudGgtY2hpbGQoNSkgPiBkaXYud2lkZ2V0LnNlY3Rpb25fdGl0bGUuY29sX2JsYWNrXCIpO1xuICAgIHZhciBzdWJ0aXRsZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjY29udGVudEFyZWEgPiBkaXYgPiBkaXYud2lkZ2V0LmZ1bGxzY3JlZW4gPiBkaXY6bnRoLWNoaWxkKDMpID4gZGl2ID4gZGl2Om50aC1jaGlsZCg1KSA+IGRpdi53aWRnZXQudHh0X3JpZ2h0LnBhZDEyXCIpO1xuICAgIHZhciBjdXJyZW50X3RpY2sgPSBnYW1lLnVuaXZlcnNlLmdhbGF4eS50aWNrO1xuICAgIHZhciBuZXh0X21vdmUgPSAoY3VycmVudF90aWNrIC0gdGljaykgJSA0O1xuICAgIHZhciBsYXN0X21vdmUgPSA0IC0gbmV4dF9tb3ZlO1xuICAgIC8vbGV0IGxhc3RfbW92ZSA9IGN1cnJlbnRfdGljay1uZXh0X21vdmVcbiAgICB2YXIgcG9zdGZpeF8xID0gXCJcIjtcbiAgICB2YXIgcG9zdGZpeF8yID0gXCJcIjtcbiAgICBpZiAobmV4dF9tb3ZlICE9IDEpIHtcbiAgICAgICAgcG9zdGZpeF8xICs9IFwic1wiO1xuICAgIH1cbiAgICBpZiAobGFzdF9tb3ZlICE9IDEpIHtcbiAgICAgICAgcG9zdGZpeF8yICs9IFwic1wiO1xuICAgIH1cbiAgICBpZiAobmV4dF9tb3ZlID09IDApIHtcbiAgICAgICAgbmV4dF9tb3ZlID0gNDtcbiAgICAgICAgdGl0bGUuaW5uZXJUZXh0ID0gXCJBSSBtb3ZlcyBpbiBcIi5jb25jYXQobmV4dF9tb3ZlLCBcIiB0aWNrXCIpLmNvbmNhdChwb3N0Zml4XzEpO1xuICAgICAgICBzdWJ0aXRsZS5pbm5lclRleHQgPSBcIkFJIG1vdmVkIHRoaXMgdGlja1wiO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgdGl0bGUuaW5uZXJUZXh0ID0gXCJBSSBtb3ZlcyBpbiBcIi5jb25jYXQobmV4dF9tb3ZlLCBcIiB0aWNrXCIpLmNvbmNhdChwb3N0Zml4XzEpO1xuICAgICAgICBzdWJ0aXRsZS5pbm5lclRleHQgPSBcIkFJIGxhc3QgbW92ZWQgXCIuY29uY2F0KGxhc3RfbW92ZSwgXCIgdGlja1wiKS5jb25jYXQocG9zdGZpeF8yLCBcIiBhZ29cIik7XG4gICAgICAgIC8vc3VidGl0bGUuaW5uZXJUZXh0ID0gYEFJIGxhc3QgbW92ZWQgb24gdGljayAke2xhc3RfbW92ZX1gXG4gICAgfVxufVxuZXhwb3J0IGZ1bmN0aW9uIGhvb2tfbnBjX3RpY2tfY291bnRlcigpIHtcbiAgICB2YXIgc2VsZWN0ZWRQbGF5ZXIgPSBnYW1lLnVuaXZlcnNlLnNlbGVjdGVkUGxheWVyO1xuICAgIGlmIChzZWxlY3RlZFBsYXllci5haSkge1xuICAgICAgICB1cGRhdGVfZXZlbnRfY2FjaGUoNCwgYWRkX25wY190aWNrX2NvdW50ZXIsIGNvbnNvbGUuZXJyb3IpO1xuICAgIH1cbn1cbiIsImltcG9ydCB7IG1hcmtlZCB9IGZyb20gXCJtYXJrZWRcIjtcbmV4cG9ydCBmdW5jdGlvbiBtYXJrZG93bihtYXJrZG93blN0cmluZykge1xuICAgIHJldHVybiBtYXJrZWQucGFyc2UobWFya2Rvd25TdHJpbmcpO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGlzX3ZhbGlkX2ltYWdlX3VybChzdHIpIHtcbiAgICB2YXIgcHJvdG9jb2wgPSBcIl4oaHR0cHM6XFxcXC9cXFxcLylcIjtcbiAgICB2YXIgZG9tYWlucyA9IFwiKGlcXFxcLmliYlxcXFwuY298aVxcXFwuaW1ndXJcXFxcLmNvbXxjZG5cXFxcLmRpc2NvcmRhcHBcXFxcLmNvbSlcIjtcbiAgICB2YXIgY29udGVudCA9IFwiKFsmI189O1xcXFwtXFxcXD9cXFxcL1xcXFx3XXsxLDE1MH0pXCI7XG4gICAgdmFyIGltYWdlcyA9IFwiKFxcXFwuKShnaWZ8anBlP2d8dGlmZj98cG5nfHdlYnB8Ym1wfEdJRnxKUEU/R3xUSUZGP3xQTkd8V0VCUHxCTVApJFwiO1xuICAgIHZhciByZWdleF9zdHJpbmcgPSBwcm90b2NvbCArIGRvbWFpbnMgKyBjb250ZW50ICsgaW1hZ2VzO1xuICAgIHZhciByZWdleCA9IG5ldyBSZWdFeHAocmVnZXhfc3RyaW5nKTtcbiAgICB2YXIgdmFsaWQgPSByZWdleC50ZXN0KHN0cik7XG4gICAgcmV0dXJuIHZhbGlkO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGlzX3ZhbGlkX3lvdXR1YmUoc3RyKSB7XG4gICAgdmFyIHByb3RvY29sID0gXCJeKGh0dHBzOi8vKVwiO1xuICAgIHZhciBkb21haW5zID0gXCIoeW91dHViZS5jb218d3d3LnlvdXR1YmUuY29tfHlvdXR1LmJlKVwiO1xuICAgIHZhciBjb250ZW50ID0gXCIoWyYjXz07LT8vd117MSwxNTB9KVwiO1xuICAgIHZhciByZWdleF9zdHJpbmcgPSBwcm90b2NvbCArIGRvbWFpbnMgKyBjb250ZW50O1xuICAgIHZhciByZWdleCA9IG5ldyBSZWdFeHAocmVnZXhfc3RyaW5nKTtcbiAgICByZXR1cm4gcmVnZXgudGVzdChzdHIpO1xufVxuZnVuY3Rpb24gZ2V0X3lvdXR1YmVfZW1iZWQobGluaykge1xuICAgIHJldHVybiBcIjxpZnJhbWUgd2lkdGg9XFxcIjU2MFxcXCIgaGVpZ2h0PVxcXCIzMTVcXFwiIHNyYz1cXFwiaHR0cHM6Ly93d3cueW91dHViZS5jb20vZW1iZWQvZUhzRFRHd19qWjhcXFwiIHRpdGxlPVxcXCJZb3VUdWJlIHZpZGVvIHBsYXllclxcXCIgZnJhbWVib3JkZXI9XFxcIjBcXFwiIGFsbG93PVxcXCJhY2NlbGVyb21ldGVyOyBhdXRvcGxheTsgY2xpcGJvYXJkLXdyaXRlOyBlbmNyeXB0ZWQtbWVkaWE7IGd5cm9zY29wZTsgcGljdHVyZS1pbi1waWN0dXJlOyB3ZWItc2hhcmVcXFwiIGFsbG93ZnVsbHNjcmVlbj48L2lmcmFtZT5cIjtcbn1cbiIsInZhciBfX2F3YWl0ZXIgPSAodGhpcyAmJiB0aGlzLl9fYXdhaXRlcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XG4gICAgfSk7XG59O1xudmFyIF9fZ2VuZXJhdG9yID0gKHRoaXMgJiYgdGhpcy5fX2dlbmVyYXRvcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIGJvZHkpIHtcbiAgICB2YXIgXyA9IHsgbGFiZWw6IDAsIHNlbnQ6IGZ1bmN0aW9uKCkgeyBpZiAodFswXSAmIDEpIHRocm93IHRbMV07IHJldHVybiB0WzFdOyB9LCB0cnlzOiBbXSwgb3BzOiBbXSB9LCBmLCB5LCB0LCBnO1xuICAgIHJldHVybiBnID0geyBuZXh0OiB2ZXJiKDApLCBcInRocm93XCI6IHZlcmIoMSksIFwicmV0dXJuXCI6IHZlcmIoMikgfSwgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIChnW1N5bWJvbC5pdGVyYXRvcl0gPSBmdW5jdGlvbigpIHsgcmV0dXJuIHRoaXM7IH0pLCBnO1xuICAgIGZ1bmN0aW9uIHZlcmIobikgeyByZXR1cm4gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIHN0ZXAoW24sIHZdKTsgfTsgfVxuICAgIGZ1bmN0aW9uIHN0ZXAob3ApIHtcbiAgICAgICAgaWYgKGYpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJHZW5lcmF0b3IgaXMgYWxyZWFkeSBleGVjdXRpbmcuXCIpO1xuICAgICAgICB3aGlsZSAoZyAmJiAoZyA9IDAsIG9wWzBdICYmIChfID0gMCkpLCBfKSB0cnkge1xuICAgICAgICAgICAgaWYgKGYgPSAxLCB5ICYmICh0ID0gb3BbMF0gJiAyID8geVtcInJldHVyblwiXSA6IG9wWzBdID8geVtcInRocm93XCJdIHx8ICgodCA9IHlbXCJyZXR1cm5cIl0pICYmIHQuY2FsbCh5KSwgMCkgOiB5Lm5leHQpICYmICEodCA9IHQuY2FsbCh5LCBvcFsxXSkpLmRvbmUpIHJldHVybiB0O1xuICAgICAgICAgICAgaWYgKHkgPSAwLCB0KSBvcCA9IFtvcFswXSAmIDIsIHQudmFsdWVdO1xuICAgICAgICAgICAgc3dpdGNoIChvcFswXSkge1xuICAgICAgICAgICAgICAgIGNhc2UgMDogY2FzZSAxOiB0ID0gb3A7IGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgNDogXy5sYWJlbCsrOyByZXR1cm4geyB2YWx1ZTogb3BbMV0sIGRvbmU6IGZhbHNlIH07XG4gICAgICAgICAgICAgICAgY2FzZSA1OiBfLmxhYmVsKys7IHkgPSBvcFsxXTsgb3AgPSBbMF07IGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIGNhc2UgNzogb3AgPSBfLm9wcy5wb3AoKTsgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICBpZiAoISh0ID0gXy50cnlzLCB0ID0gdC5sZW5ndGggPiAwICYmIHRbdC5sZW5ndGggLSAxXSkgJiYgKG9wWzBdID09PSA2IHx8IG9wWzBdID09PSAyKSkgeyBfID0gMDsgY29udGludWU7IH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wWzBdID09PSAzICYmICghdCB8fCAob3BbMV0gPiB0WzBdICYmIG9wWzFdIDwgdFszXSkpKSB7IF8ubGFiZWwgPSBvcFsxXTsgYnJlYWs7IH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wWzBdID09PSA2ICYmIF8ubGFiZWwgPCB0WzFdKSB7IF8ubGFiZWwgPSB0WzFdOyB0ID0gb3A7IGJyZWFrOyB9XG4gICAgICAgICAgICAgICAgICAgIGlmICh0ICYmIF8ubGFiZWwgPCB0WzJdKSB7IF8ubGFiZWwgPSB0WzJdOyBfLm9wcy5wdXNoKG9wKTsgYnJlYWs7IH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHRbMl0pIF8ub3BzLnBvcCgpO1xuICAgICAgICAgICAgICAgICAgICBfLnRyeXMucG9wKCk7IGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb3AgPSBib2R5LmNhbGwodGhpc0FyZywgXyk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHsgb3AgPSBbNiwgZV07IHkgPSAwOyB9IGZpbmFsbHkgeyBmID0gdCA9IDA7IH1cbiAgICAgICAgaWYgKG9wWzBdICYgNSkgdGhyb3cgb3BbMV07IHJldHVybiB7IHZhbHVlOiBvcFswXSA/IG9wWzFdIDogdm9pZCAwLCBkb25lOiB0cnVlIH07XG4gICAgfVxufTtcbnZhciBLVl9SRVNUX0FQSV9VUkwgPSBcImh0dHBzOi8vaW1tdW5lLWNyaWNrZXQtMzYwMTEua3YudmVyY2VsLXN0b3JhZ2UuY29tXCI7XG52YXIgS1ZfUkVTVF9BUElfUkVBRF9PTkxZX1RPS0VOID0gXCJBb3lyQVNRZ056RTBNMkUyTlRNdE1tRmpOQzAwWlRGbExXSm1OVEl0TUdSbFlXWm1NbVkzTVRjMFpwdEc5NmVsYlhPalpKN19HRTd3LWFyWUFHQ2FrdG9vMjVxNERYUldMN1U9XCI7XG52YXIgY3VzdG9tX2JhZGdlcyA9IFtcImFwZVwiXTtcbi8vIEZ1bmN0aW9uIHRoYXQgY29ubmVjdHMgdG8gc2VydmVyIGFuZCByZXRyaWV2ZXMgbGlzdCBvbiBrZXkgJ2FwZSdcbmV4cG9ydCB2YXIgZ2V0X2FwZV9iYWRnZXMgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBfX2F3YWl0ZXIodm9pZCAwLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBfX2dlbmVyYXRvcih0aGlzLCBmdW5jdGlvbiAoX2EpIHtcbiAgICAgICAgcmV0dXJuIFsyIC8qcmV0dXJuKi8sIGZldGNoKEtWX1JFU1RfQVBJX1VSTCwge1xuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgICAgICAgICAgQXV0aG9yaXphdGlvbjogXCJCZWFyZXIgXCIuY29uY2F0KEtWX1JFU1RfQVBJX1JFQURfT05MWV9UT0tFTiksXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBib2R5OiAnW1wiTFJBTkdFXCIsIFwiYXBlXCIsIDAsIC0xXScsXG4gICAgICAgICAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKSB7IHJldHVybiByZXNwb25zZS5qc29uKCk7IH0pXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHsgcmV0dXJuIGRhdGEucmVzdWx0OyB9KV07XG4gICAgfSk7XG59KTsgfTtcbi8qIFVwZGF0aW5nIEJhZGdlIENsYXNzZXMgKi9cbmV4cG9ydCB2YXIgQXBlQmFkZ2VJY29uID0gZnVuY3Rpb24gKENydXgsIHVybCwgZmlsZW5hbWUsIGNvdW50LCBzbWFsbCkge1xuICAgIHZhciBlYmkgPSBDcnV4LldpZGdldCgpO1xuICAgIGlmIChzbWFsbCA9PT0gdW5kZWZpbmVkKVxuICAgICAgICBzbWFsbCA9IGZhbHNlO1xuICAgIGlmIChzbWFsbCkge1xuICAgICAgICAvKiBTbWFsbCBpbWFnZXMgKi9cbiAgICAgICAgdmFyIGltYWdlX3VybCA9IFwiL2ltYWdlcy9iYWRnZXNfc21hbGwvXCIuY29uY2F0KGZpbGVuYW1lLCBcIi5wbmdcIik7XG4gICAgICAgIGlmIChmaWxlbmFtZSA9PSBcImFwZVwiKSB7XG4gICAgICAgICAgICBpbWFnZV91cmwgPSBcIlwiLmNvbmNhdCh1cmwpLmNvbmNhdChmaWxlbmFtZSwgXCJfc21hbGwucG5nXCIpO1xuICAgICAgICB9XG4gICAgICAgIENydXguSW1hZ2UoaW1hZ2VfdXJsLCBcImFic1wiKS5ncmlkKDAuMjUsIDAuMjUsIDIuNSwgMi41KS5yb29zdChlYmkpO1xuICAgICAgICBDcnV4LkNsaWNrYWJsZShcInNob3dfc2NyZWVuXCIsIFwiYnV5X2dpZnRcIilcbiAgICAgICAgICAgIC5ncmlkKDAuMjUsIDAuMjUsIDIuNSwgMi41KVxuICAgICAgICAgICAgLnR0KFwiYmFkZ2VfXCIuY29uY2F0KGZpbGVuYW1lKSlcbiAgICAgICAgICAgIC5yb29zdChlYmkpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgLyogQmlnIGltYWdlcyAqL1xuICAgICAgICB2YXIgaW1hZ2VfdXJsID0gXCIvaW1hZ2VzL2JhZGdlcy9cIi5jb25jYXQoZmlsZW5hbWUsIFwiLnBuZ1wiKTtcbiAgICAgICAgaWYgKGZpbGVuYW1lID09IFwiYXBlXCIpIHtcbiAgICAgICAgICAgIGltYWdlX3VybCA9IFwiXCIuY29uY2F0KHVybCkuY29uY2F0KGZpbGVuYW1lLCBcIi5wbmdcIik7XG4gICAgICAgIH1cbiAgICAgICAgQ3J1eC5JbWFnZShpbWFnZV91cmwsIFwiYWJzXCIpLmdyaWQoMCwgMCwgNiwgNikudHQoZmlsZW5hbWUpLnJvb3N0KGViaSk7XG4gICAgICAgIENydXguQ2xpY2thYmxlKFwic2hvd19zY3JlZW5cIiwgXCJidXlfZ2lmdFwiKVxuICAgICAgICAgICAgLmdyaWQoMCwgMCwgNiwgNilcbiAgICAgICAgICAgIC50dChcImJhZGdlX1wiLmNvbmNhdChmaWxlbmFtZSkpXG4gICAgICAgICAgICAucm9vc3QoZWJpKTtcbiAgICB9XG4gICAgaWYgKGNvdW50ID4gMSAmJiAhc21hbGwpIHtcbiAgICAgICAgQ3J1eC5JbWFnZShcIi9pbWFnZXMvYmFkZ2VzL2NvdW50ZXIucG5nXCIsIFwiYWJzXCIpXG4gICAgICAgICAgICAuZ3JpZCgwLCAwLCA2LCA2KVxuICAgICAgICAgICAgLnR0KGZpbGVuYW1lKVxuICAgICAgICAgICAgLnJvb3N0KGViaSk7XG4gICAgICAgIENydXguVGV4dChcIlwiLCBcInR4dF9jZW50ZXIgdHh0X3RpbnlcIiwgXCJhYnNcIilcbiAgICAgICAgICAgIC5yYXdIVE1MKGNvdW50KVxuICAgICAgICAgICAgLnBvcyg1MSwgNjgpXG4gICAgICAgICAgICAuc2l6ZSgzMiwgMzIpXG4gICAgICAgICAgICAucm9vc3QoZWJpKTtcbiAgICB9XG4gICAgcmV0dXJuIGViaTtcbn07XG4vKlxuY29uc3QgZ3JvdXBBcGVCYWRnZXMgPSBmdW5jdGlvbiAoYmFkZ2VzU3RyaW5nOiBzdHJpbmcpIHtcbiAgaWYgKCFiYWRnZXNTdHJpbmcpIGJhZGdlc1N0cmluZyA9IFwiXCI7XG4gIHZhciBncm91cGVkQmFkZ2VzOiB7IFtrZXk6IHN0cmluZ106IG51bWJlciB9ID0ge307XG4gIHZhciBpO1xuICBmb3IgKGkgPSBiYWRnZXNTdHJpbmcubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICB2YXIgYmNoYXIgPSBiYWRnZXNTdHJpbmcuY2hhckF0KGkpO1xuICAgIGlmIChncm91cGVkQmFkZ2VzLmhhc093blByb3BlcnR5KGJjaGFyKSkge1xuICAgICAgZ3JvdXBlZEJhZGdlc1tiY2hhcl0gKz0gMTtcbiAgICB9IGVsc2Uge1xuICAgICAgZ3JvdXBlZEJhZGdlc1tiY2hhcl0gPSAxO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZ3JvdXBlZEJhZGdlcztcbn07XG4qL1xuIiwiaW1wb3J0IHsgdW5pdmVyc2UgfSBmcm9tIFwiLi4vZ2FtZV9zdGF0ZVwiO1xudmFyIGdldF90b3RhbF9uYXR1cmFsX3Jlc291cmNlcyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcGxheWVyID0gdW5pdmVyc2UucGxheWVyO1xuICAgIHZhciBuYXR1YWxfcmVzb3VyY2VzID0gMDtcbiAgICB2YXIgc3RhcjtcbiAgICBmb3IgKHZhciBzIGluIHVuaXZlcnNlLmdhbGF4eS5zdGFycykge1xuICAgICAgICBzdGFyID0gdW5pdmVyc2UuZ2FsYXh5LnN0YXJzW3NdO1xuICAgICAgICBpZiAoc3Rhci5wdWlkICE9PSBwbGF5ZXIudWlkKVxuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIG5hdHVhbF9yZXNvdXJjZXMgKz0gc3Rhci5yO1xuICAgIH1cbiAgICByZXR1cm4gbmF0dWFsX3Jlc291cmNlcztcbn07XG52YXIgZ2V0X3N0YXJfcG9zaXRpb25zID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBwb3NpdGlvbnMgPSBbXTtcbiAgICB2YXIgc3RhcjtcbiAgICBmb3IgKHZhciBzIGluIHVuaXZlcnNlLmdhbGF4eS5zdGFycykge1xuICAgICAgICBzdGFyID0gdW5pdmVyc2UuZ2FsYXh5LnN0YXJzW3NdO1xuICAgICAgICBwb3NpdGlvbnMucHVzaCh7IHg6IHN0YXIueCwgeTogc3Rhci55IH0pO1xuICAgIH1cbiAgICByZXR1cm4gcG9zaXRpb25zO1xufTtcbmV4cG9ydCBmdW5jdGlvbiBob29rX3N0YXJfbWFuYWdlcih1bml2ZXJzZSkge1xuICAgIHVuaXZlcnNlLmdldF90b3RhbF9uYXR1cmFsX3Jlc291cmNlcyA9IGdldF90b3RhbF9uYXR1cmFsX3Jlc291cmNlcztcbiAgICB1bml2ZXJzZS5nZXRfc3Rhcl9wb3NpdGlvbnMgPSBnZXRfc3Rhcl9wb3NpdGlvbnM7XG59XG4iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX3JlYWQgPSAodGhpcyAmJiB0aGlzLl9fcmVhZCkgfHwgZnVuY3Rpb24gKG8sIG4pIHtcbiAgICB2YXIgbSA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvW1N5bWJvbC5pdGVyYXRvcl07XG4gICAgaWYgKCFtKSByZXR1cm4gbztcbiAgICB2YXIgaSA9IG0uY2FsbChvKSwgciwgYXIgPSBbXSwgZTtcbiAgICB0cnkge1xuICAgICAgICB3aGlsZSAoKG4gPT09IHZvaWQgMCB8fCBuLS0gPiAwKSAmJiAhKHIgPSBpLm5leHQoKSkuZG9uZSkgYXIucHVzaChyLnZhbHVlKTtcbiAgICB9XG4gICAgY2F0Y2ggKGVycm9yKSB7IGUgPSB7IGVycm9yOiBlcnJvciB9OyB9XG4gICAgZmluYWxseSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAociAmJiAhci5kb25lICYmIChtID0gaVtcInJldHVyblwiXSkpIG0uY2FsbChpKTtcbiAgICAgICAgfVxuICAgICAgICBmaW5hbGx5IHsgaWYgKGUpIHRocm93IGUuZXJyb3I7IH1cbiAgICB9XG4gICAgcmV0dXJuIGFyO1xufTtcbnZhciBfX3NwcmVhZEFycmF5ID0gKHRoaXMgJiYgdGhpcy5fX3NwcmVhZEFycmF5KSB8fCBmdW5jdGlvbiAodG8sIGZyb20pIHtcbiAgICBmb3IgKHZhciBpID0gMCwgaWwgPSBmcm9tLmxlbmd0aCwgaiA9IHRvLmxlbmd0aDsgaSA8IGlsOyBpKyssIGorKylcbiAgICAgICAgdG9bal0gPSBmcm9tW2ldO1xuICAgIHJldHVybiB0bztcbn07XG52YXIgX19pbXBvcnREZWZhdWx0ID0gKHRoaXMgJiYgdGhpcy5fX2ltcG9ydERlZmF1bHQpIHx8IGZ1bmN0aW9uIChtb2QpIHtcbiAgICByZXR1cm4gKG1vZCAmJiBtb2QuX19lc01vZHVsZSkgPyBtb2QgOiB7IFwiZGVmYXVsdFwiOiBtb2QgfTtcbn07XG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuZXhwb3J0cy51bmlxdWUgPSBleHBvcnRzLm1lcmdlV2l0aFJ1bGVzID0gZXhwb3J0cy5tZXJnZVdpdGhDdXN0b21pemUgPSBleHBvcnRzW1wiZGVmYXVsdFwiXSA9IGV4cG9ydHMubWVyZ2UgPSBleHBvcnRzLkN1c3RvbWl6ZVJ1bGUgPSBleHBvcnRzLmN1c3RvbWl6ZU9iamVjdCA9IGV4cG9ydHMuY3VzdG9taXplQXJyYXkgPSB2b2lkIDA7XG52YXIgd2lsZGNhcmRfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwid2lsZGNhcmRcIikpO1xudmFyIG1lcmdlX3dpdGhfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi9tZXJnZS13aXRoXCIpKTtcbnZhciBqb2luX2FycmF5c18xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCIuL2pvaW4tYXJyYXlzXCIpKTtcbnZhciB1bmlxdWVfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi91bmlxdWVcIikpO1xuZXhwb3J0cy51bmlxdWUgPSB1bmlxdWVfMVtcImRlZmF1bHRcIl07XG52YXIgdHlwZXNfMSA9IHJlcXVpcmUoXCIuL3R5cGVzXCIpO1xuZXhwb3J0cy5DdXN0b21pemVSdWxlID0gdHlwZXNfMS5DdXN0b21pemVSdWxlO1xudmFyIHV0aWxzXzEgPSByZXF1aXJlKFwiLi91dGlsc1wiKTtcbmZ1bmN0aW9uIG1lcmdlKGZpcnN0Q29uZmlndXJhdGlvbikge1xuICAgIHZhciBjb25maWd1cmF0aW9ucyA9IFtdO1xuICAgIGZvciAodmFyIF9pID0gMTsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgIGNvbmZpZ3VyYXRpb25zW19pIC0gMV0gPSBhcmd1bWVudHNbX2ldO1xuICAgIH1cbiAgICByZXR1cm4gbWVyZ2VXaXRoQ3VzdG9taXplKHt9KS5hcHBseSh2b2lkIDAsIF9fc3ByZWFkQXJyYXkoW2ZpcnN0Q29uZmlndXJhdGlvbl0sIF9fcmVhZChjb25maWd1cmF0aW9ucykpKTtcbn1cbmV4cG9ydHMubWVyZ2UgPSBtZXJnZTtcbmV4cG9ydHNbXCJkZWZhdWx0XCJdID0gbWVyZ2U7XG5mdW5jdGlvbiBtZXJnZVdpdGhDdXN0b21pemUob3B0aW9ucykge1xuICAgIHJldHVybiBmdW5jdGlvbiBtZXJnZVdpdGhPcHRpb25zKGZpcnN0Q29uZmlndXJhdGlvbikge1xuICAgICAgICB2YXIgY29uZmlndXJhdGlvbnMgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgX2kgPSAxOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIGNvbmZpZ3VyYXRpb25zW19pIC0gMV0gPSBhcmd1bWVudHNbX2ldO1xuICAgICAgICB9XG4gICAgICAgIGlmICh1dGlsc18xLmlzVW5kZWZpbmVkKGZpcnN0Q29uZmlndXJhdGlvbikgfHwgY29uZmlndXJhdGlvbnMuc29tZSh1dGlsc18xLmlzVW5kZWZpbmVkKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIk1lcmdpbmcgdW5kZWZpbmVkIGlzIG5vdCBzdXBwb3J0ZWRcIik7XG4gICAgICAgIH1cbiAgICAgICAgLy8gQHRzLWlnbm9yZVxuICAgICAgICBpZiAoZmlyc3RDb25maWd1cmF0aW9uLnRoZW4pIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJQcm9taXNlcyBhcmUgbm90IHN1cHBvcnRlZFwiKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBObyBjb25maWd1cmF0aW9uIGF0IGFsbFxuICAgICAgICBpZiAoIWZpcnN0Q29uZmlndXJhdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuIHt9O1xuICAgICAgICB9XG4gICAgICAgIGlmIChjb25maWd1cmF0aW9ucy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KGZpcnN0Q29uZmlndXJhdGlvbikpIHtcbiAgICAgICAgICAgICAgICAvLyBFbXB0eSBhcnJheVxuICAgICAgICAgICAgICAgIGlmIChmaXJzdENvbmZpZ3VyYXRpb24ubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7fTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGZpcnN0Q29uZmlndXJhdGlvbi5zb21lKHV0aWxzXzEuaXNVbmRlZmluZWQpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJNZXJnaW5nIHVuZGVmaW5lZCBpcyBub3Qgc3VwcG9ydGVkXCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBAdHMtaWdub3JlXG4gICAgICAgICAgICAgICAgaWYgKGZpcnN0Q29uZmlndXJhdGlvblswXS50aGVuKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJQcm9taXNlcyBhcmUgbm90IHN1cHBvcnRlZFwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1lcmdlX3dpdGhfMVtcImRlZmF1bHRcIl0oZmlyc3RDb25maWd1cmF0aW9uLCBqb2luX2FycmF5c18xW1wiZGVmYXVsdFwiXShvcHRpb25zKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmlyc3RDb25maWd1cmF0aW9uO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtZXJnZV93aXRoXzFbXCJkZWZhdWx0XCJdKFtmaXJzdENvbmZpZ3VyYXRpb25dLmNvbmNhdChjb25maWd1cmF0aW9ucyksIGpvaW5fYXJyYXlzXzFbXCJkZWZhdWx0XCJdKG9wdGlvbnMpKTtcbiAgICB9O1xufVxuZXhwb3J0cy5tZXJnZVdpdGhDdXN0b21pemUgPSBtZXJnZVdpdGhDdXN0b21pemU7XG5mdW5jdGlvbiBjdXN0b21pemVBcnJheShydWxlcykge1xuICAgIHJldHVybiBmdW5jdGlvbiAoYSwgYiwga2V5KSB7XG4gICAgICAgIHZhciBtYXRjaGVkUnVsZSA9IE9iamVjdC5rZXlzKHJ1bGVzKS5maW5kKGZ1bmN0aW9uIChydWxlKSB7IHJldHVybiB3aWxkY2FyZF8xW1wiZGVmYXVsdFwiXShydWxlLCBrZXkpOyB9KSB8fCBcIlwiO1xuICAgICAgICBpZiAobWF0Y2hlZFJ1bGUpIHtcbiAgICAgICAgICAgIHN3aXRjaCAocnVsZXNbbWF0Y2hlZFJ1bGVdKSB7XG4gICAgICAgICAgICAgICAgY2FzZSB0eXBlc18xLkN1c3RvbWl6ZVJ1bGUuUHJlcGVuZDpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF9fc3ByZWFkQXJyYXkoX19zcHJlYWRBcnJheShbXSwgX19yZWFkKGIpKSwgX19yZWFkKGEpKTtcbiAgICAgICAgICAgICAgICBjYXNlIHR5cGVzXzEuQ3VzdG9taXplUnVsZS5SZXBsYWNlOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYjtcbiAgICAgICAgICAgICAgICBjYXNlIHR5cGVzXzEuQ3VzdG9taXplUnVsZS5BcHBlbmQ6XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF9fc3ByZWFkQXJyYXkoX19zcHJlYWRBcnJheShbXSwgX19yZWFkKGEpKSwgX19yZWFkKGIpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG59XG5leHBvcnRzLmN1c3RvbWl6ZUFycmF5ID0gY3VzdG9taXplQXJyYXk7XG5mdW5jdGlvbiBtZXJnZVdpdGhSdWxlcyhydWxlcykge1xuICAgIHJldHVybiBtZXJnZVdpdGhDdXN0b21pemUoe1xuICAgICAgICBjdXN0b21pemVBcnJheTogZnVuY3Rpb24gKGEsIGIsIGtleSkge1xuICAgICAgICAgICAgdmFyIGN1cnJlbnRSdWxlID0gcnVsZXM7XG4gICAgICAgICAgICBrZXkuc3BsaXQoXCIuXCIpLmZvckVhY2goZnVuY3Rpb24gKGspIHtcbiAgICAgICAgICAgICAgICBpZiAoIWN1cnJlbnRSdWxlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY3VycmVudFJ1bGUgPSBjdXJyZW50UnVsZVtrXTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKHV0aWxzXzEuaXNQbGFpbk9iamVjdChjdXJyZW50UnVsZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbWVyZ2VXaXRoUnVsZSh7IGN1cnJlbnRSdWxlOiBjdXJyZW50UnVsZSwgYTogYSwgYjogYiB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0eXBlb2YgY3VycmVudFJ1bGUgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbWVyZ2VJbmRpdmlkdWFsUnVsZSh7IGN1cnJlbnRSdWxlOiBjdXJyZW50UnVsZSwgYTogYSwgYjogYiB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cbmV4cG9ydHMubWVyZ2VXaXRoUnVsZXMgPSBtZXJnZVdpdGhSdWxlcztcbnZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheTtcbmZ1bmN0aW9uIG1lcmdlV2l0aFJ1bGUoX2EpIHtcbiAgICB2YXIgY3VycmVudFJ1bGUgPSBfYS5jdXJyZW50UnVsZSwgYSA9IF9hLmEsIGIgPSBfYS5iO1xuICAgIGlmICghaXNBcnJheShhKSkge1xuICAgICAgICByZXR1cm4gYTtcbiAgICB9XG4gICAgdmFyIGJBbGxNYXRjaGVzID0gW107XG4gICAgdmFyIHJldCA9IGEubWFwKGZ1bmN0aW9uIChhbykge1xuICAgICAgICBpZiAoIXV0aWxzXzEuaXNQbGFpbk9iamVjdChjdXJyZW50UnVsZSkpIHtcbiAgICAgICAgICAgIHJldHVybiBhbztcbiAgICAgICAgfVxuICAgICAgICB2YXIgcmV0ID0ge307XG4gICAgICAgIHZhciBydWxlc1RvTWF0Y2ggPSBbXTtcbiAgICAgICAgdmFyIG9wZXJhdGlvbnMgPSB7fTtcbiAgICAgICAgT2JqZWN0LmVudHJpZXMoY3VycmVudFJ1bGUpLmZvckVhY2goZnVuY3Rpb24gKF9hKSB7XG4gICAgICAgICAgICB2YXIgX2IgPSBfX3JlYWQoX2EsIDIpLCBrID0gX2JbMF0sIHYgPSBfYlsxXTtcbiAgICAgICAgICAgIGlmICh2ID09PSB0eXBlc18xLkN1c3RvbWl6ZVJ1bGUuTWF0Y2gpIHtcbiAgICAgICAgICAgICAgICBydWxlc1RvTWF0Y2gucHVzaChrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIG9wZXJhdGlvbnNba10gPSB2O1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdmFyIGJNYXRjaGVzID0gYi5maWx0ZXIoZnVuY3Rpb24gKG8pIHtcbiAgICAgICAgICAgIHZhciBtYXRjaGVzID0gcnVsZXNUb01hdGNoLmV2ZXJ5KGZ1bmN0aW9uIChydWxlKSB7IHZhciBfYSwgX2I7IHJldHVybiAoKF9hID0gYW9bcnVsZV0pID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS50b1N0cmluZygpKSA9PT0gKChfYiA9IG9bcnVsZV0pID09PSBudWxsIHx8IF9iID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYi50b1N0cmluZygpKTsgfSk7XG4gICAgICAgICAgICBpZiAobWF0Y2hlcykge1xuICAgICAgICAgICAgICAgIGJBbGxNYXRjaGVzLnB1c2gobyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbWF0Y2hlcztcbiAgICAgICAgfSk7XG4gICAgICAgIGlmICghdXRpbHNfMS5pc1BsYWluT2JqZWN0KGFvKSkge1xuICAgICAgICAgICAgcmV0dXJuIGFvO1xuICAgICAgICB9XG4gICAgICAgIE9iamVjdC5lbnRyaWVzKGFvKS5mb3JFYWNoKGZ1bmN0aW9uIChfYSkge1xuICAgICAgICAgICAgdmFyIF9iID0gX19yZWFkKF9hLCAyKSwgayA9IF9iWzBdLCB2ID0gX2JbMV07XG4gICAgICAgICAgICB2YXIgcnVsZSA9IGN1cnJlbnRSdWxlO1xuICAgICAgICAgICAgc3dpdGNoIChjdXJyZW50UnVsZVtrXSkge1xuICAgICAgICAgICAgICAgIGNhc2UgdHlwZXNfMS5DdXN0b21pemVSdWxlLk1hdGNoOlxuICAgICAgICAgICAgICAgICAgICByZXRba10gPSB2O1xuICAgICAgICAgICAgICAgICAgICBPYmplY3QuZW50cmllcyhydWxlKS5mb3JFYWNoKGZ1bmN0aW9uIChfYSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIF9iID0gX19yZWFkKF9hLCAyKSwgayA9IF9iWzBdLCB2ID0gX2JbMV07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodiA9PT0gdHlwZXNfMS5DdXN0b21pemVSdWxlLlJlcGxhY2UgJiYgYk1hdGNoZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB2YWwgPSBsYXN0KGJNYXRjaGVzKVtrXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHZhbCAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXRba10gPSB2YWw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSB0eXBlc18xLkN1c3RvbWl6ZVJ1bGUuQXBwZW5kOlxuICAgICAgICAgICAgICAgICAgICBpZiAoIWJNYXRjaGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0W2tdID0gdjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHZhciBhcHBlbmRWYWx1ZSA9IGxhc3QoYk1hdGNoZXMpW2tdO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWlzQXJyYXkodikgfHwgIWlzQXJyYXkoYXBwZW5kVmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiVHJ5aW5nIHRvIGFwcGVuZCBub24tYXJyYXlzXCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldFtrXSA9IHYuY29uY2F0KGFwcGVuZFZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSB0eXBlc18xLkN1c3RvbWl6ZVJ1bGUuTWVyZ2U6XG4gICAgICAgICAgICAgICAgICAgIGlmICghYk1hdGNoZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXRba10gPSB2O1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdmFyIGxhc3RWYWx1ZSA9IGxhc3QoYk1hdGNoZXMpW2tdO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIXV0aWxzXzEuaXNQbGFpbk9iamVjdCh2KSB8fCAhdXRpbHNfMS5pc1BsYWluT2JqZWN0KGxhc3RWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJUcnlpbmcgdG8gbWVyZ2Ugbm9uLW9iamVjdHNcIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gZGVlcCBtZXJnZVxuICAgICAgICAgICAgICAgICAgICByZXRba10gPSBtZXJnZSh2LCBsYXN0VmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIHR5cGVzXzEuQ3VzdG9taXplUnVsZS5QcmVwZW5kOlxuICAgICAgICAgICAgICAgICAgICBpZiAoIWJNYXRjaGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0W2tdID0gdjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHZhciBwcmVwZW5kVmFsdWUgPSBsYXN0KGJNYXRjaGVzKVtrXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFpc0FycmF5KHYpIHx8ICFpc0FycmF5KHByZXBlbmRWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJUcnlpbmcgdG8gcHJlcGVuZCBub24tYXJyYXlzXCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldFtrXSA9IHByZXBlbmRWYWx1ZS5jb25jYXQodik7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgdHlwZXNfMS5DdXN0b21pemVSdWxlLlJlcGxhY2U6XG4gICAgICAgICAgICAgICAgICAgIHJldFtrXSA9IGJNYXRjaGVzLmxlbmd0aCA+IDAgPyBsYXN0KGJNYXRjaGVzKVtrXSA6IHY7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIHZhciBjdXJyZW50UnVsZV8xID0gb3BlcmF0aW9uc1trXTtcbiAgICAgICAgICAgICAgICAgICAgLy8gVXNlIC5mbGF0KCk7IHN0YXJ0aW5nIGZyb20gTm9kZSAxMlxuICAgICAgICAgICAgICAgICAgICB2YXIgYl8xID0gYk1hdGNoZXNcbiAgICAgICAgICAgICAgICAgICAgICAgIC5tYXAoZnVuY3Rpb24gKG8pIHsgcmV0dXJuIG9ba107IH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAucmVkdWNlKGZ1bmN0aW9uIChhY2MsIHZhbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGlzQXJyYXkoYWNjKSAmJiBpc0FycmF5KHZhbCkgPyBfX3NwcmVhZEFycmF5KF9fc3ByZWFkQXJyYXkoW10sIF9fcmVhZChhY2MpKSwgX19yZWFkKHZhbCkpIDogYWNjO1xuICAgICAgICAgICAgICAgICAgICB9LCBbXSk7XG4gICAgICAgICAgICAgICAgICAgIHJldFtrXSA9IG1lcmdlV2l0aFJ1bGUoeyBjdXJyZW50UnVsZTogY3VycmVudFJ1bGVfMSwgYTogdiwgYjogYl8xIH0pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiByZXQ7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJldC5jb25jYXQoYi5maWx0ZXIoZnVuY3Rpb24gKG8pIHsgcmV0dXJuICFiQWxsTWF0Y2hlcy5pbmNsdWRlcyhvKTsgfSkpO1xufVxuZnVuY3Rpb24gbWVyZ2VJbmRpdmlkdWFsUnVsZShfYSkge1xuICAgIHZhciBjdXJyZW50UnVsZSA9IF9hLmN1cnJlbnRSdWxlLCBhID0gX2EuYSwgYiA9IF9hLmI7XG4gICAgLy8gV2hhdCBpZiB0aGVyZSdzIG5vIG1hdGNoP1xuICAgIHN3aXRjaCAoY3VycmVudFJ1bGUpIHtcbiAgICAgICAgY2FzZSB0eXBlc18xLkN1c3RvbWl6ZVJ1bGUuQXBwZW5kOlxuICAgICAgICAgICAgcmV0dXJuIGEuY29uY2F0KGIpO1xuICAgICAgICBjYXNlIHR5cGVzXzEuQ3VzdG9taXplUnVsZS5QcmVwZW5kOlxuICAgICAgICAgICAgcmV0dXJuIGIuY29uY2F0KGEpO1xuICAgICAgICBjYXNlIHR5cGVzXzEuQ3VzdG9taXplUnVsZS5SZXBsYWNlOlxuICAgICAgICAgICAgcmV0dXJuIGI7XG4gICAgfVxuICAgIHJldHVybiBhO1xufVxuZnVuY3Rpb24gbGFzdChhcnIpIHtcbiAgICByZXR1cm4gYXJyW2Fyci5sZW5ndGggLSAxXTtcbn1cbmZ1bmN0aW9uIGN1c3RvbWl6ZU9iamVjdChydWxlcykge1xuICAgIHJldHVybiBmdW5jdGlvbiAoYSwgYiwga2V5KSB7XG4gICAgICAgIHN3aXRjaCAocnVsZXNba2V5XSkge1xuICAgICAgICAgICAgY2FzZSB0eXBlc18xLkN1c3RvbWl6ZVJ1bGUuUHJlcGVuZDpcbiAgICAgICAgICAgICAgICByZXR1cm4gbWVyZ2Vfd2l0aF8xW1wiZGVmYXVsdFwiXShbYiwgYV0sIGpvaW5fYXJyYXlzXzFbXCJkZWZhdWx0XCJdKCkpO1xuICAgICAgICAgICAgY2FzZSB0eXBlc18xLkN1c3RvbWl6ZVJ1bGUuUmVwbGFjZTpcbiAgICAgICAgICAgICAgICByZXR1cm4gYjtcbiAgICAgICAgICAgIGNhc2UgdHlwZXNfMS5DdXN0b21pemVSdWxlLkFwcGVuZDpcbiAgICAgICAgICAgICAgICByZXR1cm4gbWVyZ2Vfd2l0aF8xW1wiZGVmYXVsdFwiXShbYSwgYl0sIGpvaW5fYXJyYXlzXzFbXCJkZWZhdWx0XCJdKCkpO1xuICAgICAgICB9XG4gICAgfTtcbn1cbmV4cG9ydHMuY3VzdG9taXplT2JqZWN0ID0gY3VzdG9taXplT2JqZWN0O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXguanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG52YXIgX19yZWFkID0gKHRoaXMgJiYgdGhpcy5fX3JlYWQpIHx8IGZ1bmN0aW9uIChvLCBuKSB7XG4gICAgdmFyIG0gPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb1tTeW1ib2wuaXRlcmF0b3JdO1xuICAgIGlmICghbSkgcmV0dXJuIG87XG4gICAgdmFyIGkgPSBtLmNhbGwobyksIHIsIGFyID0gW10sIGU7XG4gICAgdHJ5IHtcbiAgICAgICAgd2hpbGUgKChuID09PSB2b2lkIDAgfHwgbi0tID4gMCkgJiYgIShyID0gaS5uZXh0KCkpLmRvbmUpIGFyLnB1c2goci52YWx1ZSk7XG4gICAgfVxuICAgIGNhdGNoIChlcnJvcikgeyBlID0geyBlcnJvcjogZXJyb3IgfTsgfVxuICAgIGZpbmFsbHkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKHIgJiYgIXIuZG9uZSAmJiAobSA9IGlbXCJyZXR1cm5cIl0pKSBtLmNhbGwoaSk7XG4gICAgICAgIH1cbiAgICAgICAgZmluYWxseSB7IGlmIChlKSB0aHJvdyBlLmVycm9yOyB9XG4gICAgfVxuICAgIHJldHVybiBhcjtcbn07XG52YXIgX19zcHJlYWRBcnJheSA9ICh0aGlzICYmIHRoaXMuX19zcHJlYWRBcnJheSkgfHwgZnVuY3Rpb24gKHRvLCBmcm9tKSB7XG4gICAgZm9yICh2YXIgaSA9IDAsIGlsID0gZnJvbS5sZW5ndGgsIGogPSB0by5sZW5ndGg7IGkgPCBpbDsgaSsrLCBqKyspXG4gICAgICAgIHRvW2pdID0gZnJvbVtpXTtcbiAgICByZXR1cm4gdG87XG59O1xudmFyIF9faW1wb3J0RGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnREZWZhdWx0KSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBcImRlZmF1bHRcIjogbW9kIH07XG59O1xuZXhwb3J0cy5fX2VzTW9kdWxlID0gdHJ1ZTtcbnZhciBjbG9uZV9kZWVwXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcImNsb25lLWRlZXBcIikpO1xudmFyIG1lcmdlX3dpdGhfMSA9IF9faW1wb3J0RGVmYXVsdChyZXF1aXJlKFwiLi9tZXJnZS13aXRoXCIpKTtcbnZhciB1dGlsc18xID0gcmVxdWlyZShcIi4vdXRpbHNcIik7XG52YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXk7XG5mdW5jdGlvbiBqb2luQXJyYXlzKF9hKSB7XG4gICAgdmFyIF9iID0gX2EgPT09IHZvaWQgMCA/IHt9IDogX2EsIGN1c3RvbWl6ZUFycmF5ID0gX2IuY3VzdG9taXplQXJyYXksIGN1c3RvbWl6ZU9iamVjdCA9IF9iLmN1c3RvbWl6ZU9iamVjdCwga2V5ID0gX2Iua2V5O1xuICAgIHJldHVybiBmdW5jdGlvbiBfam9pbkFycmF5cyhhLCBiLCBrKSB7XG4gICAgICAgIHZhciBuZXdLZXkgPSBrZXkgPyBrZXkgKyBcIi5cIiArIGsgOiBrO1xuICAgICAgICBpZiAodXRpbHNfMS5pc0Z1bmN0aW9uKGEpICYmIHV0aWxzXzEuaXNGdW5jdGlvbihiKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgYXJncyA9IFtdO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9pID0gMDsgX2kgPCBhcmd1bWVudHMubGVuZ3RoOyBfaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGFyZ3NbX2ldID0gYXJndW1lbnRzW19pXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIF9qb2luQXJyYXlzKGEuYXBwbHkodm9pZCAwLCBfX3NwcmVhZEFycmF5KFtdLCBfX3JlYWQoYXJncykpKSwgYi5hcHBseSh2b2lkIDAsIF9fc3ByZWFkQXJyYXkoW10sIF9fcmVhZChhcmdzKSkpLCBrKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzQXJyYXkoYSkgJiYgaXNBcnJheShiKSkge1xuICAgICAgICAgICAgdmFyIGN1c3RvbVJlc3VsdCA9IGN1c3RvbWl6ZUFycmF5ICYmIGN1c3RvbWl6ZUFycmF5KGEsIGIsIG5ld0tleSk7XG4gICAgICAgICAgICByZXR1cm4gY3VzdG9tUmVzdWx0IHx8IF9fc3ByZWFkQXJyYXkoX19zcHJlYWRBcnJheShbXSwgX19yZWFkKGEpKSwgX19yZWFkKGIpKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodXRpbHNfMS5pc1JlZ2V4KGIpKSB7XG4gICAgICAgICAgICByZXR1cm4gYjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodXRpbHNfMS5pc1BsYWluT2JqZWN0KGEpICYmIHV0aWxzXzEuaXNQbGFpbk9iamVjdChiKSkge1xuICAgICAgICAgICAgdmFyIGN1c3RvbVJlc3VsdCA9IGN1c3RvbWl6ZU9iamVjdCAmJiBjdXN0b21pemVPYmplY3QoYSwgYiwgbmV3S2V5KTtcbiAgICAgICAgICAgIHJldHVybiAoY3VzdG9tUmVzdWx0IHx8XG4gICAgICAgICAgICAgICAgbWVyZ2Vfd2l0aF8xW1wiZGVmYXVsdFwiXShbYSwgYl0sIGpvaW5BcnJheXMoe1xuICAgICAgICAgICAgICAgICAgICBjdXN0b21pemVBcnJheTogY3VzdG9taXplQXJyYXksXG4gICAgICAgICAgICAgICAgICAgIGN1c3RvbWl6ZU9iamVjdDogY3VzdG9taXplT2JqZWN0LFxuICAgICAgICAgICAgICAgICAgICBrZXk6IG5ld0tleVxuICAgICAgICAgICAgICAgIH0pKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHV0aWxzXzEuaXNQbGFpbk9iamVjdChiKSkge1xuICAgICAgICAgICAgcmV0dXJuIGNsb25lX2RlZXBfMVtcImRlZmF1bHRcIl0oYik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzQXJyYXkoYikpIHtcbiAgICAgICAgICAgIHJldHVybiBfX3NwcmVhZEFycmF5KFtdLCBfX3JlYWQoYikpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBiO1xuICAgIH07XG59XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IGpvaW5BcnJheXM7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1qb2luLWFycmF5cy5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX3JlYWQgPSAodGhpcyAmJiB0aGlzLl9fcmVhZCkgfHwgZnVuY3Rpb24gKG8sIG4pIHtcbiAgICB2YXIgbSA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvW1N5bWJvbC5pdGVyYXRvcl07XG4gICAgaWYgKCFtKSByZXR1cm4gbztcbiAgICB2YXIgaSA9IG0uY2FsbChvKSwgciwgYXIgPSBbXSwgZTtcbiAgICB0cnkge1xuICAgICAgICB3aGlsZSAoKG4gPT09IHZvaWQgMCB8fCBuLS0gPiAwKSAmJiAhKHIgPSBpLm5leHQoKSkuZG9uZSkgYXIucHVzaChyLnZhbHVlKTtcbiAgICB9XG4gICAgY2F0Y2ggKGVycm9yKSB7IGUgPSB7IGVycm9yOiBlcnJvciB9OyB9XG4gICAgZmluYWxseSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAociAmJiAhci5kb25lICYmIChtID0gaVtcInJldHVyblwiXSkpIG0uY2FsbChpKTtcbiAgICAgICAgfVxuICAgICAgICBmaW5hbGx5IHsgaWYgKGUpIHRocm93IGUuZXJyb3I7IH1cbiAgICB9XG4gICAgcmV0dXJuIGFyO1xufTtcbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5mdW5jdGlvbiBtZXJnZVdpdGgob2JqZWN0cywgY3VzdG9taXplcikge1xuICAgIHZhciBfYSA9IF9fcmVhZChvYmplY3RzKSwgZmlyc3QgPSBfYVswXSwgcmVzdCA9IF9hLnNsaWNlKDEpO1xuICAgIHZhciByZXQgPSBmaXJzdDtcbiAgICByZXN0LmZvckVhY2goZnVuY3Rpb24gKGEpIHtcbiAgICAgICAgcmV0ID0gbWVyZ2VUbyhyZXQsIGEsIGN1c3RvbWl6ZXIpO1xuICAgIH0pO1xuICAgIHJldHVybiByZXQ7XG59XG5mdW5jdGlvbiBtZXJnZVRvKGEsIGIsIGN1c3RvbWl6ZXIpIHtcbiAgICB2YXIgcmV0ID0ge307XG4gICAgT2JqZWN0LmtleXMoYSlcbiAgICAgICAgLmNvbmNhdChPYmplY3Qua2V5cyhiKSlcbiAgICAgICAgLmZvckVhY2goZnVuY3Rpb24gKGspIHtcbiAgICAgICAgdmFyIHYgPSBjdXN0b21pemVyKGFba10sIGJba10sIGspO1xuICAgICAgICByZXRba10gPSB0eXBlb2YgdiA9PT0gXCJ1bmRlZmluZWRcIiA/IGFba10gOiB2O1xuICAgIH0pO1xuICAgIHJldHVybiByZXQ7XG59XG5leHBvcnRzW1wiZGVmYXVsdFwiXSA9IG1lcmdlV2l0aDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1lcmdlLXdpdGguanMubWFwIiwiXCJ1c2Ugc3RyaWN0XCI7XG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuZXhwb3J0cy5DdXN0b21pemVSdWxlID0gdm9pZCAwO1xudmFyIEN1c3RvbWl6ZVJ1bGU7XG4oZnVuY3Rpb24gKEN1c3RvbWl6ZVJ1bGUpIHtcbiAgICBDdXN0b21pemVSdWxlW1wiTWF0Y2hcIl0gPSBcIm1hdGNoXCI7XG4gICAgQ3VzdG9taXplUnVsZVtcIk1lcmdlXCJdID0gXCJtZXJnZVwiO1xuICAgIEN1c3RvbWl6ZVJ1bGVbXCJBcHBlbmRcIl0gPSBcImFwcGVuZFwiO1xuICAgIEN1c3RvbWl6ZVJ1bGVbXCJQcmVwZW5kXCJdID0gXCJwcmVwZW5kXCI7XG4gICAgQ3VzdG9taXplUnVsZVtcIlJlcGxhY2VcIl0gPSBcInJlcGxhY2VcIjtcbn0pKEN1c3RvbWl6ZVJ1bGUgPSBleHBvcnRzLkN1c3RvbWl6ZVJ1bGUgfHwgKGV4cG9ydHMuQ3VzdG9taXplUnVsZSA9IHt9KSk7XG4vLyMgc291cmNlTWFwcGluZ1VSTD10eXBlcy5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX3JlYWQgPSAodGhpcyAmJiB0aGlzLl9fcmVhZCkgfHwgZnVuY3Rpb24gKG8sIG4pIHtcbiAgICB2YXIgbSA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiBvW1N5bWJvbC5pdGVyYXRvcl07XG4gICAgaWYgKCFtKSByZXR1cm4gbztcbiAgICB2YXIgaSA9IG0uY2FsbChvKSwgciwgYXIgPSBbXSwgZTtcbiAgICB0cnkge1xuICAgICAgICB3aGlsZSAoKG4gPT09IHZvaWQgMCB8fCBuLS0gPiAwKSAmJiAhKHIgPSBpLm5leHQoKSkuZG9uZSkgYXIucHVzaChyLnZhbHVlKTtcbiAgICB9XG4gICAgY2F0Y2ggKGVycm9yKSB7IGUgPSB7IGVycm9yOiBlcnJvciB9OyB9XG4gICAgZmluYWxseSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAociAmJiAhci5kb25lICYmIChtID0gaVtcInJldHVyblwiXSkpIG0uY2FsbChpKTtcbiAgICAgICAgfVxuICAgICAgICBmaW5hbGx5IHsgaWYgKGUpIHRocm93IGUuZXJyb3I7IH1cbiAgICB9XG4gICAgcmV0dXJuIGFyO1xufTtcbnZhciBfX3NwcmVhZEFycmF5ID0gKHRoaXMgJiYgdGhpcy5fX3NwcmVhZEFycmF5KSB8fCBmdW5jdGlvbiAodG8sIGZyb20pIHtcbiAgICBmb3IgKHZhciBpID0gMCwgaWwgPSBmcm9tLmxlbmd0aCwgaiA9IHRvLmxlbmd0aDsgaSA8IGlsOyBpKyssIGorKylcbiAgICAgICAgdG9bal0gPSBmcm9tW2ldO1xuICAgIHJldHVybiB0bztcbn07XG5leHBvcnRzLl9fZXNNb2R1bGUgPSB0cnVlO1xuZnVuY3Rpb24gbWVyZ2VVbmlxdWUoa2V5LCB1bmlxdWVzLCBnZXR0ZXIpIHtcbiAgICB2YXIgdW5pcXVlc1NldCA9IG5ldyBTZXQodW5pcXVlcyk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIChhLCBiLCBrKSB7XG4gICAgICAgIHJldHVybiAoayA9PT0ga2V5KSAmJiBBcnJheS5mcm9tKF9fc3ByZWFkQXJyYXkoX19zcHJlYWRBcnJheShbXSwgX19yZWFkKGEpKSwgX19yZWFkKGIpKS5tYXAoZnVuY3Rpb24gKGl0KSB7IHJldHVybiAoeyBrZXk6IGdldHRlcihpdCksIHZhbHVlOiBpdCB9KTsgfSlcbiAgICAgICAgICAgIC5tYXAoZnVuY3Rpb24gKF9hKSB7XG4gICAgICAgICAgICB2YXIga2V5ID0gX2Eua2V5LCB2YWx1ZSA9IF9hLnZhbHVlO1xuICAgICAgICAgICAgcmV0dXJuICh7IGtleTogKHVuaXF1ZXNTZXQuaGFzKGtleSkgPyBrZXkgOiB2YWx1ZSksIHZhbHVlOiB2YWx1ZSB9KTtcbiAgICAgICAgfSlcbiAgICAgICAgICAgIC5yZWR1Y2UoZnVuY3Rpb24gKG0sIF9hKSB7XG4gICAgICAgICAgICB2YXIga2V5ID0gX2Eua2V5LCB2YWx1ZSA9IF9hLnZhbHVlO1xuICAgICAgICAgICAgbVtcImRlbGV0ZVwiXShrZXkpOyAvLyBUaGlzIGlzIHJlcXVpcmVkIHRvIHByZXNlcnZlIGJhY2t3YXJkIGNvbXBhdGlibGUgb3JkZXIgb2YgZWxlbWVudHMgYWZ0ZXIgYSBtZXJnZS5cbiAgICAgICAgICAgIHJldHVybiBtLnNldChrZXksIHZhbHVlKTtcbiAgICAgICAgfSwgbmV3IE1hcCgpKVxuICAgICAgICAgICAgLnZhbHVlcygpKTtcbiAgICB9O1xufVxuZXhwb3J0c1tcImRlZmF1bHRcIl0gPSBtZXJnZVVuaXF1ZTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXVuaXF1ZS5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtcbmV4cG9ydHMuX19lc01vZHVsZSA9IHRydWU7XG5leHBvcnRzLmlzVW5kZWZpbmVkID0gZXhwb3J0cy5pc1BsYWluT2JqZWN0ID0gZXhwb3J0cy5pc0Z1bmN0aW9uID0gZXhwb3J0cy5pc1JlZ2V4ID0gdm9pZCAwO1xuZnVuY3Rpb24gaXNSZWdleChvKSB7XG4gICAgcmV0dXJuIG8gaW5zdGFuY2VvZiBSZWdFeHA7XG59XG5leHBvcnRzLmlzUmVnZXggPSBpc1JlZ2V4O1xuLy8gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9hLzczNTY1MjgvMjI4ODg1XG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGZ1bmN0aW9uVG9DaGVjaykge1xuICAgIHJldHVybiAoZnVuY3Rpb25Ub0NoZWNrICYmIHt9LnRvU3RyaW5nLmNhbGwoZnVuY3Rpb25Ub0NoZWNrKSA9PT0gXCJbb2JqZWN0IEZ1bmN0aW9uXVwiKTtcbn1cbmV4cG9ydHMuaXNGdW5jdGlvbiA9IGlzRnVuY3Rpb247XG5mdW5jdGlvbiBpc1BsYWluT2JqZWN0KGEpIHtcbiAgICBpZiAoYSA9PT0gbnVsbCB8fCBBcnJheS5pc0FycmF5KGEpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHR5cGVvZiBhID09PSBcIm9iamVjdFwiO1xufVxuZXhwb3J0cy5pc1BsYWluT2JqZWN0ID0gaXNQbGFpbk9iamVjdDtcbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKGEpIHtcbiAgICByZXR1cm4gdHlwZW9mIGEgPT09IFwidW5kZWZpbmVkXCI7XG59XG5leHBvcnRzLmlzVW5kZWZpbmVkID0gaXNVbmRlZmluZWQ7XG4vLyMgc291cmNlTWFwcGluZ1VSTD11dGlscy5qcy5tYXAiLCIvKiBqc2hpbnQgbm9kZTogdHJ1ZSAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUkVHRVhQX1BBUlRTID0gLyhcXCp8XFw/KS9nO1xuXG4vKipcbiAgIyB3aWxkY2FyZFxuXG4gIFZlcnkgc2ltcGxlIHdpbGRjYXJkIG1hdGNoaW5nLCB3aGljaCBpcyBkZXNpZ25lZCB0byBwcm92aWRlIHRoZSBzYW1lXG4gIGZ1bmN0aW9uYWxpdHkgdGhhdCBpcyBmb3VuZCBpbiB0aGVcbiAgW2V2ZV0oaHR0cHM6Ly9naXRodWIuY29tL2Fkb2JlLXdlYnBsYXRmb3JtL2V2ZSkgZXZlbnRpbmcgbGlicmFyeS5cblxuICAjIyBVc2FnZVxuXG4gIEl0IHdvcmtzIHdpdGggc3RyaW5nczpcblxuICA8PDwgZXhhbXBsZXMvc3RyaW5ncy5qc1xuXG4gIEFycmF5czpcblxuICA8PDwgZXhhbXBsZXMvYXJyYXlzLmpzXG5cbiAgT2JqZWN0cyAobWF0Y2hpbmcgYWdhaW5zdCBrZXlzKTpcblxuICA8PDwgZXhhbXBsZXMvb2JqZWN0cy5qc1xuXG4gICMjIEFsdGVybmF0aXZlIEltcGxlbWVudGF0aW9uc1xuXG4gIC0gPGh0dHBzOi8vZ2l0aHViLmNvbS9pc2FhY3Mvbm9kZS1nbG9iPlxuXG4gICAgR3JlYXQgZm9yIGZ1bGwgZmlsZS1iYXNlZCB3aWxkY2FyZCBtYXRjaGluZy5cblxuICAtIDxodHRwczovL2dpdGh1Yi5jb20vc2luZHJlc29yaHVzL21hdGNoZXI+XG5cbiAgICAgQSB3ZWxsIGNhcmVkIGZvciBhbmQgbG92ZWQgSlMgd2lsZGNhcmQgbWF0Y2hlci5cbioqL1xuXG5mdW5jdGlvbiBXaWxkY2FyZE1hdGNoZXIodGV4dCwgc2VwYXJhdG9yKSB7XG4gIHRoaXMudGV4dCA9IHRleHQgPSB0ZXh0IHx8ICcnO1xuICB0aGlzLmhhc1dpbGQgPSB0ZXh0LmluZGV4T2YoJyonKSA+PSAwO1xuICB0aGlzLnNlcGFyYXRvciA9IHNlcGFyYXRvcjtcbiAgdGhpcy5wYXJ0cyA9IHRleHQuc3BsaXQoc2VwYXJhdG9yKS5tYXAodGhpcy5jbGFzc2lmeVBhcnQuYmluZCh0aGlzKSk7XG59XG5cbldpbGRjYXJkTWF0Y2hlci5wcm90b3R5cGUubWF0Y2ggPSBmdW5jdGlvbihpbnB1dCkge1xuICB2YXIgbWF0Y2hlcyA9IHRydWU7XG4gIHZhciBwYXJ0cyA9IHRoaXMucGFydHM7XG4gIHZhciBpaTtcbiAgdmFyIHBhcnRzQ291bnQgPSBwYXJ0cy5sZW5ndGg7XG4gIHZhciB0ZXN0UGFydHM7XG5cbiAgaWYgKHR5cGVvZiBpbnB1dCA9PSAnc3RyaW5nJyB8fCBpbnB1dCBpbnN0YW5jZW9mIFN0cmluZykge1xuICAgIGlmICghdGhpcy5oYXNXaWxkICYmIHRoaXMudGV4dCAhPSBpbnB1dCkge1xuICAgICAgbWF0Y2hlcyA9IGZhbHNlO1xuICAgIH0gZWxzZSB7XG4gICAgICB0ZXN0UGFydHMgPSAoaW5wdXQgfHwgJycpLnNwbGl0KHRoaXMuc2VwYXJhdG9yKTtcbiAgICAgIGZvciAoaWkgPSAwOyBtYXRjaGVzICYmIGlpIDwgcGFydHNDb3VudDsgaWkrKykge1xuICAgICAgICBpZiAocGFydHNbaWldID09PSAnKicpICB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH0gZWxzZSBpZiAoaWkgPCB0ZXN0UGFydHMubGVuZ3RoKSB7XG4gICAgICAgICAgbWF0Y2hlcyA9IHBhcnRzW2lpXSBpbnN0YW5jZW9mIFJlZ0V4cFxuICAgICAgICAgICAgPyBwYXJ0c1tpaV0udGVzdCh0ZXN0UGFydHNbaWldKVxuICAgICAgICAgICAgOiBwYXJ0c1tpaV0gPT09IHRlc3RQYXJ0c1tpaV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbWF0Y2hlcyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIElmIG1hdGNoZXMsIHRoZW4gcmV0dXJuIHRoZSBjb21wb25lbnQgcGFydHNcbiAgICAgIG1hdGNoZXMgPSBtYXRjaGVzICYmIHRlc3RQYXJ0cztcbiAgICB9XG4gIH1cbiAgZWxzZSBpZiAodHlwZW9mIGlucHV0LnNwbGljZSA9PSAnZnVuY3Rpb24nKSB7XG4gICAgbWF0Y2hlcyA9IFtdO1xuXG4gICAgZm9yIChpaSA9IGlucHV0Lmxlbmd0aDsgaWktLTsgKSB7XG4gICAgICBpZiAodGhpcy5tYXRjaChpbnB1dFtpaV0pKSB7XG4gICAgICAgIG1hdGNoZXNbbWF0Y2hlcy5sZW5ndGhdID0gaW5wdXRbaWldO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBlbHNlIGlmICh0eXBlb2YgaW5wdXQgPT0gJ29iamVjdCcpIHtcbiAgICBtYXRjaGVzID0ge307XG5cbiAgICBmb3IgKHZhciBrZXkgaW4gaW5wdXQpIHtcbiAgICAgIGlmICh0aGlzLm1hdGNoKGtleSkpIHtcbiAgICAgICAgbWF0Y2hlc1trZXldID0gaW5wdXRba2V5XTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gbWF0Y2hlcztcbn07XG5cbldpbGRjYXJkTWF0Y2hlci5wcm90b3R5cGUuY2xhc3NpZnlQYXJ0ID0gZnVuY3Rpb24ocGFydCkge1xuICAvLyBpbiB0aGUgZXZlbnQgdGhhdCB3ZSBoYXZlIGJlZW4gcHJvdmlkZWQgYSBwYXJ0IHRoYXQgaXMgbm90IGp1c3QgYSB3aWxkY2FyZFxuICAvLyB0aGVuIHR1cm4gdGhpcyBpbnRvIGEgcmVndWxhciBleHByZXNzaW9uIGZvciBtYXRjaGluZyBwdXJwb3Nlc1xuICBpZiAocGFydCA9PT0gJyonKSB7XG4gICAgcmV0dXJuIHBhcnQ7XG4gIH0gZWxzZSBpZiAocGFydC5pbmRleE9mKCcqJykgPj0gMCB8fCBwYXJ0LmluZGV4T2YoJz8nKSA+PSAwKSB7XG4gICAgcmV0dXJuIG5ldyBSZWdFeHAocGFydC5yZXBsYWNlKFJFR0VYUF9QQVJUUywgJ1xcLiQxJykpO1xuICB9XG5cbiAgcmV0dXJuIHBhcnQ7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHRleHQsIHRlc3QsIHNlcGFyYXRvcikge1xuICB2YXIgbWF0Y2hlciA9IG5ldyBXaWxkY2FyZE1hdGNoZXIodGV4dCwgc2VwYXJhdG9yIHx8IC9bXFwvXFwuXS8pO1xuICBpZiAodHlwZW9mIHRlc3QgIT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm4gbWF0Y2hlci5tYXRjaCh0ZXN0KTtcbiAgfVxuXG4gIHJldHVybiBtYXRjaGVyO1xufTtcbiIsIi8qKlxuICogbWFya2VkIHY0LjMuMCAtIGEgbWFya2Rvd24gcGFyc2VyXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTEtMjAyMywgQ2hyaXN0b3BoZXIgSmVmZnJleS4gKE1JVCBMaWNlbnNlZClcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXJrZWRqcy9tYXJrZWRcbiAqL1xuXG4vKipcbiAqIERPIE5PVCBFRElUIFRISVMgRklMRVxuICogVGhlIGNvZGUgaW4gdGhpcyBmaWxlIGlzIGdlbmVyYXRlZCBmcm9tIGZpbGVzIGluIC4vc3JjL1xuICovXG5cbmZ1bmN0aW9uIGdldERlZmF1bHRzKCkge1xuICByZXR1cm4ge1xuICAgIGFzeW5jOiBmYWxzZSxcbiAgICBiYXNlVXJsOiBudWxsLFxuICAgIGJyZWFrczogZmFsc2UsXG4gICAgZXh0ZW5zaW9uczogbnVsbCxcbiAgICBnZm06IHRydWUsXG4gICAgaGVhZGVySWRzOiB0cnVlLFxuICAgIGhlYWRlclByZWZpeDogJycsXG4gICAgaGlnaGxpZ2h0OiBudWxsLFxuICAgIGhvb2tzOiBudWxsLFxuICAgIGxhbmdQcmVmaXg6ICdsYW5ndWFnZS0nLFxuICAgIG1hbmdsZTogdHJ1ZSxcbiAgICBwZWRhbnRpYzogZmFsc2UsXG4gICAgcmVuZGVyZXI6IG51bGwsXG4gICAgc2FuaXRpemU6IGZhbHNlLFxuICAgIHNhbml0aXplcjogbnVsbCxcbiAgICBzaWxlbnQ6IGZhbHNlLFxuICAgIHNtYXJ0eXBhbnRzOiBmYWxzZSxcbiAgICB0b2tlbml6ZXI6IG51bGwsXG4gICAgd2Fsa1Rva2VuczogbnVsbCxcbiAgICB4aHRtbDogZmFsc2VcbiAgfTtcbn1cblxubGV0IGRlZmF1bHRzID0gZ2V0RGVmYXVsdHMoKTtcblxuZnVuY3Rpb24gY2hhbmdlRGVmYXVsdHMobmV3RGVmYXVsdHMpIHtcbiAgZGVmYXVsdHMgPSBuZXdEZWZhdWx0cztcbn1cblxuLyoqXG4gKiBIZWxwZXJzXG4gKi9cbmNvbnN0IGVzY2FwZVRlc3QgPSAvWyY8PlwiJ10vO1xuY29uc3QgZXNjYXBlUmVwbGFjZSA9IG5ldyBSZWdFeHAoZXNjYXBlVGVzdC5zb3VyY2UsICdnJyk7XG5jb25zdCBlc2NhcGVUZXN0Tm9FbmNvZGUgPSAvWzw+XCInXXwmKD8hKCNcXGR7MSw3fXwjW1h4XVthLWZBLUYwLTldezEsNn18XFx3Kyk7KS87XG5jb25zdCBlc2NhcGVSZXBsYWNlTm9FbmNvZGUgPSBuZXcgUmVnRXhwKGVzY2FwZVRlc3ROb0VuY29kZS5zb3VyY2UsICdnJyk7XG5jb25zdCBlc2NhcGVSZXBsYWNlbWVudHMgPSB7XG4gICcmJzogJyZhbXA7JyxcbiAgJzwnOiAnJmx0OycsXG4gICc+JzogJyZndDsnLFxuICAnXCInOiAnJnF1b3Q7JyxcbiAgXCInXCI6ICcmIzM5Oydcbn07XG5jb25zdCBnZXRFc2NhcGVSZXBsYWNlbWVudCA9IChjaCkgPT4gZXNjYXBlUmVwbGFjZW1lbnRzW2NoXTtcbmZ1bmN0aW9uIGVzY2FwZShodG1sLCBlbmNvZGUpIHtcbiAgaWYgKGVuY29kZSkge1xuICAgIGlmIChlc2NhcGVUZXN0LnRlc3QoaHRtbCkpIHtcbiAgICAgIHJldHVybiBodG1sLnJlcGxhY2UoZXNjYXBlUmVwbGFjZSwgZ2V0RXNjYXBlUmVwbGFjZW1lbnQpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpZiAoZXNjYXBlVGVzdE5vRW5jb2RlLnRlc3QoaHRtbCkpIHtcbiAgICAgIHJldHVybiBodG1sLnJlcGxhY2UoZXNjYXBlUmVwbGFjZU5vRW5jb2RlLCBnZXRFc2NhcGVSZXBsYWNlbWVudCk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGh0bWw7XG59XG5cbmNvbnN0IHVuZXNjYXBlVGVzdCA9IC8mKCMoPzpcXGQrKXwoPzojeFswLTlBLUZhLWZdKyl8KD86XFx3KykpOz8vaWc7XG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmd9IGh0bWxcbiAqL1xuZnVuY3Rpb24gdW5lc2NhcGUoaHRtbCkge1xuICAvLyBleHBsaWNpdGx5IG1hdGNoIGRlY2ltYWwsIGhleCwgYW5kIG5hbWVkIEhUTUwgZW50aXRpZXNcbiAgcmV0dXJuIGh0bWwucmVwbGFjZSh1bmVzY2FwZVRlc3QsIChfLCBuKSA9PiB7XG4gICAgbiA9IG4udG9Mb3dlckNhc2UoKTtcbiAgICBpZiAobiA9PT0gJ2NvbG9uJykgcmV0dXJuICc6JztcbiAgICBpZiAobi5jaGFyQXQoMCkgPT09ICcjJykge1xuICAgICAgcmV0dXJuIG4uY2hhckF0KDEpID09PSAneCdcbiAgICAgICAgPyBTdHJpbmcuZnJvbUNoYXJDb2RlKHBhcnNlSW50KG4uc3Vic3RyaW5nKDIpLCAxNikpXG4gICAgICAgIDogU3RyaW5nLmZyb21DaGFyQ29kZSgrbi5zdWJzdHJpbmcoMSkpO1xuICAgIH1cbiAgICByZXR1cm4gJyc7XG4gIH0pO1xufVxuXG5jb25zdCBjYXJldCA9IC8oXnxbXlxcW10pXFxeL2c7XG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmcgfCBSZWdFeHB9IHJlZ2V4XG4gKiBAcGFyYW0ge3N0cmluZ30gb3B0XG4gKi9cbmZ1bmN0aW9uIGVkaXQocmVnZXgsIG9wdCkge1xuICByZWdleCA9IHR5cGVvZiByZWdleCA9PT0gJ3N0cmluZycgPyByZWdleCA6IHJlZ2V4LnNvdXJjZTtcbiAgb3B0ID0gb3B0IHx8ICcnO1xuICBjb25zdCBvYmogPSB7XG4gICAgcmVwbGFjZTogKG5hbWUsIHZhbCkgPT4ge1xuICAgICAgdmFsID0gdmFsLnNvdXJjZSB8fCB2YWw7XG4gICAgICB2YWwgPSB2YWwucmVwbGFjZShjYXJldCwgJyQxJyk7XG4gICAgICByZWdleCA9IHJlZ2V4LnJlcGxhY2UobmFtZSwgdmFsKTtcbiAgICAgIHJldHVybiBvYmo7XG4gICAgfSxcbiAgICBnZXRSZWdleDogKCkgPT4ge1xuICAgICAgcmV0dXJuIG5ldyBSZWdFeHAocmVnZXgsIG9wdCk7XG4gICAgfVxuICB9O1xuICByZXR1cm4gb2JqO1xufVxuXG5jb25zdCBub25Xb3JkQW5kQ29sb25UZXN0ID0gL1teXFx3Ol0vZztcbmNvbnN0IG9yaWdpbkluZGVwZW5kZW50VXJsID0gL14kfF5bYS16XVthLXowLTkrLi1dKjp8Xls/I10vaTtcblxuLyoqXG4gKiBAcGFyYW0ge2Jvb2xlYW59IHNhbml0aXplXG4gKiBAcGFyYW0ge3N0cmluZ30gYmFzZVxuICogQHBhcmFtIHtzdHJpbmd9IGhyZWZcbiAqL1xuZnVuY3Rpb24gY2xlYW5Vcmwoc2FuaXRpemUsIGJhc2UsIGhyZWYpIHtcbiAgaWYgKHNhbml0aXplKSB7XG4gICAgbGV0IHByb3Q7XG4gICAgdHJ5IHtcbiAgICAgIHByb3QgPSBkZWNvZGVVUklDb21wb25lbnQodW5lc2NhcGUoaHJlZikpXG4gICAgICAgIC5yZXBsYWNlKG5vbldvcmRBbmRDb2xvblRlc3QsICcnKVxuICAgICAgICAudG9Mb3dlckNhc2UoKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgaWYgKHByb3QuaW5kZXhPZignamF2YXNjcmlwdDonKSA9PT0gMCB8fCBwcm90LmluZGV4T2YoJ3Zic2NyaXB0OicpID09PSAwIHx8IHByb3QuaW5kZXhPZignZGF0YTonKSA9PT0gMCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG4gIGlmIChiYXNlICYmICFvcmlnaW5JbmRlcGVuZGVudFVybC50ZXN0KGhyZWYpKSB7XG4gICAgaHJlZiA9IHJlc29sdmVVcmwoYmFzZSwgaHJlZik7XG4gIH1cbiAgdHJ5IHtcbiAgICBocmVmID0gZW5jb2RlVVJJKGhyZWYpLnJlcGxhY2UoLyUyNS9nLCAnJScpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgcmV0dXJuIGhyZWY7XG59XG5cbmNvbnN0IGJhc2VVcmxzID0ge307XG5jb25zdCBqdXN0RG9tYWluID0gL15bXjpdKzpcXC8qW14vXSokLztcbmNvbnN0IHByb3RvY29sID0gL14oW146XSs6KVtcXHNcXFNdKiQvO1xuY29uc3QgZG9tYWluID0gL14oW146XSs6XFwvKlteL10qKVtcXHNcXFNdKiQvO1xuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSBiYXNlXG4gKiBAcGFyYW0ge3N0cmluZ30gaHJlZlxuICovXG5mdW5jdGlvbiByZXNvbHZlVXJsKGJhc2UsIGhyZWYpIHtcbiAgaWYgKCFiYXNlVXJsc1snICcgKyBiYXNlXSkge1xuICAgIC8vIHdlIGNhbiBpZ25vcmUgZXZlcnl0aGluZyBpbiBiYXNlIGFmdGVyIHRoZSBsYXN0IHNsYXNoIG9mIGl0cyBwYXRoIGNvbXBvbmVudCxcbiAgICAvLyBidXQgd2UgbWlnaHQgbmVlZCB0byBhZGQgX3RoYXRfXG4gICAgLy8gaHR0cHM6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM5ODYjc2VjdGlvbi0zXG4gICAgaWYgKGp1c3REb21haW4udGVzdChiYXNlKSkge1xuICAgICAgYmFzZVVybHNbJyAnICsgYmFzZV0gPSBiYXNlICsgJy8nO1xuICAgIH0gZWxzZSB7XG4gICAgICBiYXNlVXJsc1snICcgKyBiYXNlXSA9IHJ0cmltKGJhc2UsICcvJywgdHJ1ZSk7XG4gICAgfVxuICB9XG4gIGJhc2UgPSBiYXNlVXJsc1snICcgKyBiYXNlXTtcbiAgY29uc3QgcmVsYXRpdmVCYXNlID0gYmFzZS5pbmRleE9mKCc6JykgPT09IC0xO1xuXG4gIGlmIChocmVmLnN1YnN0cmluZygwLCAyKSA9PT0gJy8vJykge1xuICAgIGlmIChyZWxhdGl2ZUJhc2UpIHtcbiAgICAgIHJldHVybiBocmVmO1xuICAgIH1cbiAgICByZXR1cm4gYmFzZS5yZXBsYWNlKHByb3RvY29sLCAnJDEnKSArIGhyZWY7XG4gIH0gZWxzZSBpZiAoaHJlZi5jaGFyQXQoMCkgPT09ICcvJykge1xuICAgIGlmIChyZWxhdGl2ZUJhc2UpIHtcbiAgICAgIHJldHVybiBocmVmO1xuICAgIH1cbiAgICByZXR1cm4gYmFzZS5yZXBsYWNlKGRvbWFpbiwgJyQxJykgKyBocmVmO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBiYXNlICsgaHJlZjtcbiAgfVxufVxuXG5jb25zdCBub29wVGVzdCA9IHsgZXhlYzogZnVuY3Rpb24gbm9vcFRlc3QoKSB7fSB9O1xuXG5mdW5jdGlvbiBzcGxpdENlbGxzKHRhYmxlUm93LCBjb3VudCkge1xuICAvLyBlbnN1cmUgdGhhdCBldmVyeSBjZWxsLWRlbGltaXRpbmcgcGlwZSBoYXMgYSBzcGFjZVxuICAvLyBiZWZvcmUgaXQgdG8gZGlzdGluZ3Vpc2ggaXQgZnJvbSBhbiBlc2NhcGVkIHBpcGVcbiAgY29uc3Qgcm93ID0gdGFibGVSb3cucmVwbGFjZSgvXFx8L2csIChtYXRjaCwgb2Zmc2V0LCBzdHIpID0+IHtcbiAgICAgIGxldCBlc2NhcGVkID0gZmFsc2UsXG4gICAgICAgIGN1cnIgPSBvZmZzZXQ7XG4gICAgICB3aGlsZSAoLS1jdXJyID49IDAgJiYgc3RyW2N1cnJdID09PSAnXFxcXCcpIGVzY2FwZWQgPSAhZXNjYXBlZDtcbiAgICAgIGlmIChlc2NhcGVkKSB7XG4gICAgICAgIC8vIG9kZCBudW1iZXIgb2Ygc2xhc2hlcyBtZWFucyB8IGlzIGVzY2FwZWRcbiAgICAgICAgLy8gc28gd2UgbGVhdmUgaXQgYWxvbmVcbiAgICAgICAgcmV0dXJuICd8JztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGFkZCBzcGFjZSBiZWZvcmUgdW5lc2NhcGVkIHxcbiAgICAgICAgcmV0dXJuICcgfCc7XG4gICAgICB9XG4gICAgfSksXG4gICAgY2VsbHMgPSByb3cuc3BsaXQoLyBcXHwvKTtcbiAgbGV0IGkgPSAwO1xuXG4gIC8vIEZpcnN0L2xhc3QgY2VsbCBpbiBhIHJvdyBjYW5ub3QgYmUgZW1wdHkgaWYgaXQgaGFzIG5vIGxlYWRpbmcvdHJhaWxpbmcgcGlwZVxuICBpZiAoIWNlbGxzWzBdLnRyaW0oKSkgeyBjZWxscy5zaGlmdCgpOyB9XG4gIGlmIChjZWxscy5sZW5ndGggPiAwICYmICFjZWxsc1tjZWxscy5sZW5ndGggLSAxXS50cmltKCkpIHsgY2VsbHMucG9wKCk7IH1cblxuICBpZiAoY2VsbHMubGVuZ3RoID4gY291bnQpIHtcbiAgICBjZWxscy5zcGxpY2UoY291bnQpO1xuICB9IGVsc2Uge1xuICAgIHdoaWxlIChjZWxscy5sZW5ndGggPCBjb3VudCkgY2VsbHMucHVzaCgnJyk7XG4gIH1cblxuICBmb3IgKDsgaSA8IGNlbGxzLmxlbmd0aDsgaSsrKSB7XG4gICAgLy8gbGVhZGluZyBvciB0cmFpbGluZyB3aGl0ZXNwYWNlIGlzIGlnbm9yZWQgcGVyIHRoZSBnZm0gc3BlY1xuICAgIGNlbGxzW2ldID0gY2VsbHNbaV0udHJpbSgpLnJlcGxhY2UoL1xcXFxcXHwvZywgJ3wnKTtcbiAgfVxuICByZXR1cm4gY2VsbHM7XG59XG5cbi8qKlxuICogUmVtb3ZlIHRyYWlsaW5nICdjJ3MuIEVxdWl2YWxlbnQgdG8gc3RyLnJlcGxhY2UoL2MqJC8sICcnKS5cbiAqIC9jKiQvIGlzIHZ1bG5lcmFibGUgdG8gUkVET1MuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHN0clxuICogQHBhcmFtIHtzdHJpbmd9IGNcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gaW52ZXJ0IFJlbW92ZSBzdWZmaXggb2Ygbm9uLWMgY2hhcnMgaW5zdGVhZC4gRGVmYXVsdCBmYWxzZXkuXG4gKi9cbmZ1bmN0aW9uIHJ0cmltKHN0ciwgYywgaW52ZXJ0KSB7XG4gIGNvbnN0IGwgPSBzdHIubGVuZ3RoO1xuICBpZiAobCA9PT0gMCkge1xuICAgIHJldHVybiAnJztcbiAgfVxuXG4gIC8vIExlbmd0aCBvZiBzdWZmaXggbWF0Y2hpbmcgdGhlIGludmVydCBjb25kaXRpb24uXG4gIGxldCBzdWZmTGVuID0gMDtcblxuICAvLyBTdGVwIGxlZnQgdW50aWwgd2UgZmFpbCB0byBtYXRjaCB0aGUgaW52ZXJ0IGNvbmRpdGlvbi5cbiAgd2hpbGUgKHN1ZmZMZW4gPCBsKSB7XG4gICAgY29uc3QgY3VyckNoYXIgPSBzdHIuY2hhckF0KGwgLSBzdWZmTGVuIC0gMSk7XG4gICAgaWYgKGN1cnJDaGFyID09PSBjICYmICFpbnZlcnQpIHtcbiAgICAgIHN1ZmZMZW4rKztcbiAgICB9IGVsc2UgaWYgKGN1cnJDaGFyICE9PSBjICYmIGludmVydCkge1xuICAgICAgc3VmZkxlbisrO1xuICAgIH0gZWxzZSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICByZXR1cm4gc3RyLnNsaWNlKDAsIGwgLSBzdWZmTGVuKTtcbn1cblxuZnVuY3Rpb24gZmluZENsb3NpbmdCcmFja2V0KHN0ciwgYikge1xuICBpZiAoc3RyLmluZGV4T2YoYlsxXSkgPT09IC0xKSB7XG4gICAgcmV0dXJuIC0xO1xuICB9XG4gIGNvbnN0IGwgPSBzdHIubGVuZ3RoO1xuICBsZXQgbGV2ZWwgPSAwLFxuICAgIGkgPSAwO1xuICBmb3IgKDsgaSA8IGw7IGkrKykge1xuICAgIGlmIChzdHJbaV0gPT09ICdcXFxcJykge1xuICAgICAgaSsrO1xuICAgIH0gZWxzZSBpZiAoc3RyW2ldID09PSBiWzBdKSB7XG4gICAgICBsZXZlbCsrO1xuICAgIH0gZWxzZSBpZiAoc3RyW2ldID09PSBiWzFdKSB7XG4gICAgICBsZXZlbC0tO1xuICAgICAgaWYgKGxldmVsIDwgMCkge1xuICAgICAgICByZXR1cm4gaTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIC0xO1xufVxuXG5mdW5jdGlvbiBjaGVja1Nhbml0aXplRGVwcmVjYXRpb24ob3B0KSB7XG4gIGlmIChvcHQgJiYgb3B0LnNhbml0aXplICYmICFvcHQuc2lsZW50KSB7XG4gICAgY29uc29sZS53YXJuKCdtYXJrZWQoKTogc2FuaXRpemUgYW5kIHNhbml0aXplciBwYXJhbWV0ZXJzIGFyZSBkZXByZWNhdGVkIHNpbmNlIHZlcnNpb24gMC43LjAsIHNob3VsZCBub3QgYmUgdXNlZCBhbmQgd2lsbCBiZSByZW1vdmVkIGluIHRoZSBmdXR1cmUuIFJlYWQgbW9yZSBoZXJlOiBodHRwczovL21hcmtlZC5qcy5vcmcvIy9VU0lOR19BRFZBTkNFRC5tZCNvcHRpb25zJyk7XG4gIH1cbn1cblxuLy8gY29waWVkIGZyb20gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9hLzU0NTAxMTMvODA2Nzc3XG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYXR0ZXJuXG4gKiBAcGFyYW0ge251bWJlcn0gY291bnRcbiAqL1xuZnVuY3Rpb24gcmVwZWF0U3RyaW5nKHBhdHRlcm4sIGNvdW50KSB7XG4gIGlmIChjb3VudCA8IDEpIHtcbiAgICByZXR1cm4gJyc7XG4gIH1cbiAgbGV0IHJlc3VsdCA9ICcnO1xuICB3aGlsZSAoY291bnQgPiAxKSB7XG4gICAgaWYgKGNvdW50ICYgMSkge1xuICAgICAgcmVzdWx0ICs9IHBhdHRlcm47XG4gICAgfVxuICAgIGNvdW50ID4+PSAxO1xuICAgIHBhdHRlcm4gKz0gcGF0dGVybjtcbiAgfVxuICByZXR1cm4gcmVzdWx0ICsgcGF0dGVybjtcbn1cblxuZnVuY3Rpb24gb3V0cHV0TGluayhjYXAsIGxpbmssIHJhdywgbGV4ZXIpIHtcbiAgY29uc3QgaHJlZiA9IGxpbmsuaHJlZjtcbiAgY29uc3QgdGl0bGUgPSBsaW5rLnRpdGxlID8gZXNjYXBlKGxpbmsudGl0bGUpIDogbnVsbDtcbiAgY29uc3QgdGV4dCA9IGNhcFsxXS5yZXBsYWNlKC9cXFxcKFtcXFtcXF1dKS9nLCAnJDEnKTtcblxuICBpZiAoY2FwWzBdLmNoYXJBdCgwKSAhPT0gJyEnKSB7XG4gICAgbGV4ZXIuc3RhdGUuaW5MaW5rID0gdHJ1ZTtcbiAgICBjb25zdCB0b2tlbiA9IHtcbiAgICAgIHR5cGU6ICdsaW5rJyxcbiAgICAgIHJhdyxcbiAgICAgIGhyZWYsXG4gICAgICB0aXRsZSxcbiAgICAgIHRleHQsXG4gICAgICB0b2tlbnM6IGxleGVyLmlubGluZVRva2Vucyh0ZXh0KVxuICAgIH07XG4gICAgbGV4ZXIuc3RhdGUuaW5MaW5rID0gZmFsc2U7XG4gICAgcmV0dXJuIHRva2VuO1xuICB9XG4gIHJldHVybiB7XG4gICAgdHlwZTogJ2ltYWdlJyxcbiAgICByYXcsXG4gICAgaHJlZixcbiAgICB0aXRsZSxcbiAgICB0ZXh0OiBlc2NhcGUodGV4dClcbiAgfTtcbn1cblxuZnVuY3Rpb24gaW5kZW50Q29kZUNvbXBlbnNhdGlvbihyYXcsIHRleHQpIHtcbiAgY29uc3QgbWF0Y2hJbmRlbnRUb0NvZGUgPSByYXcubWF0Y2goL14oXFxzKykoPzpgYGApLyk7XG5cbiAgaWYgKG1hdGNoSW5kZW50VG9Db2RlID09PSBudWxsKSB7XG4gICAgcmV0dXJuIHRleHQ7XG4gIH1cblxuICBjb25zdCBpbmRlbnRUb0NvZGUgPSBtYXRjaEluZGVudFRvQ29kZVsxXTtcblxuICByZXR1cm4gdGV4dFxuICAgIC5zcGxpdCgnXFxuJylcbiAgICAubWFwKG5vZGUgPT4ge1xuICAgICAgY29uc3QgbWF0Y2hJbmRlbnRJbk5vZGUgPSBub2RlLm1hdGNoKC9eXFxzKy8pO1xuICAgICAgaWYgKG1hdGNoSW5kZW50SW5Ob2RlID09PSBudWxsKSB7XG4gICAgICAgIHJldHVybiBub2RlO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBbaW5kZW50SW5Ob2RlXSA9IG1hdGNoSW5kZW50SW5Ob2RlO1xuXG4gICAgICBpZiAoaW5kZW50SW5Ob2RlLmxlbmd0aCA+PSBpbmRlbnRUb0NvZGUubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBub2RlLnNsaWNlKGluZGVudFRvQ29kZS5sZW5ndGgpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbm9kZTtcbiAgICB9KVxuICAgIC5qb2luKCdcXG4nKTtcbn1cblxuLyoqXG4gKiBUb2tlbml6ZXJcbiAqL1xuY2xhc3MgVG9rZW5pemVyIHtcbiAgY29uc3RydWN0b3Iob3B0aW9ucykge1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnMgfHwgZGVmYXVsdHM7XG4gIH1cblxuICBzcGFjZShzcmMpIHtcbiAgICBjb25zdCBjYXAgPSB0aGlzLnJ1bGVzLmJsb2NrLm5ld2xpbmUuZXhlYyhzcmMpO1xuICAgIGlmIChjYXAgJiYgY2FwWzBdLmxlbmd0aCA+IDApIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdzcGFjZScsXG4gICAgICAgIHJhdzogY2FwWzBdXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIGNvZGUoc3JjKSB7XG4gICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5ibG9jay5jb2RlLmV4ZWMoc3JjKTtcbiAgICBpZiAoY2FwKSB7XG4gICAgICBjb25zdCB0ZXh0ID0gY2FwWzBdLnJlcGxhY2UoL14gezEsNH0vZ20sICcnKTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdjb2RlJyxcbiAgICAgICAgcmF3OiBjYXBbMF0sXG4gICAgICAgIGNvZGVCbG9ja1N0eWxlOiAnaW5kZW50ZWQnLFxuICAgICAgICB0ZXh0OiAhdGhpcy5vcHRpb25zLnBlZGFudGljXG4gICAgICAgICAgPyBydHJpbSh0ZXh0LCAnXFxuJylcbiAgICAgICAgICA6IHRleHRcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgZmVuY2VzKHNyYykge1xuICAgIGNvbnN0IGNhcCA9IHRoaXMucnVsZXMuYmxvY2suZmVuY2VzLmV4ZWMoc3JjKTtcbiAgICBpZiAoY2FwKSB7XG4gICAgICBjb25zdCByYXcgPSBjYXBbMF07XG4gICAgICBjb25zdCB0ZXh0ID0gaW5kZW50Q29kZUNvbXBlbnNhdGlvbihyYXcsIGNhcFszXSB8fCAnJyk7XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdjb2RlJyxcbiAgICAgICAgcmF3LFxuICAgICAgICBsYW5nOiBjYXBbMl0gPyBjYXBbMl0udHJpbSgpLnJlcGxhY2UodGhpcy5ydWxlcy5pbmxpbmUuX2VzY2FwZXMsICckMScpIDogY2FwWzJdLFxuICAgICAgICB0ZXh0XG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIGhlYWRpbmcoc3JjKSB7XG4gICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5ibG9jay5oZWFkaW5nLmV4ZWMoc3JjKTtcbiAgICBpZiAoY2FwKSB7XG4gICAgICBsZXQgdGV4dCA9IGNhcFsyXS50cmltKCk7XG5cbiAgICAgIC8vIHJlbW92ZSB0cmFpbGluZyAjc1xuICAgICAgaWYgKC8jJC8udGVzdCh0ZXh0KSkge1xuICAgICAgICBjb25zdCB0cmltbWVkID0gcnRyaW0odGV4dCwgJyMnKTtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5wZWRhbnRpYykge1xuICAgICAgICAgIHRleHQgPSB0cmltbWVkLnRyaW0oKTtcbiAgICAgICAgfSBlbHNlIGlmICghdHJpbW1lZCB8fCAvICQvLnRlc3QodHJpbW1lZCkpIHtcbiAgICAgICAgICAvLyBDb21tb25NYXJrIHJlcXVpcmVzIHNwYWNlIGJlZm9yZSB0cmFpbGluZyAjc1xuICAgICAgICAgIHRleHQgPSB0cmltbWVkLnRyaW0oKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAnaGVhZGluZycsXG4gICAgICAgIHJhdzogY2FwWzBdLFxuICAgICAgICBkZXB0aDogY2FwWzFdLmxlbmd0aCxcbiAgICAgICAgdGV4dCxcbiAgICAgICAgdG9rZW5zOiB0aGlzLmxleGVyLmlubGluZSh0ZXh0KVxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICBocihzcmMpIHtcbiAgICBjb25zdCBjYXAgPSB0aGlzLnJ1bGVzLmJsb2NrLmhyLmV4ZWMoc3JjKTtcbiAgICBpZiAoY2FwKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAnaHInLFxuICAgICAgICByYXc6IGNhcFswXVxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICBibG9ja3F1b3RlKHNyYykge1xuICAgIGNvbnN0IGNhcCA9IHRoaXMucnVsZXMuYmxvY2suYmxvY2txdW90ZS5leGVjKHNyYyk7XG4gICAgaWYgKGNhcCkge1xuICAgICAgY29uc3QgdGV4dCA9IGNhcFswXS5yZXBsYWNlKC9eICo+WyBcXHRdPy9nbSwgJycpO1xuICAgICAgY29uc3QgdG9wID0gdGhpcy5sZXhlci5zdGF0ZS50b3A7XG4gICAgICB0aGlzLmxleGVyLnN0YXRlLnRvcCA9IHRydWU7XG4gICAgICBjb25zdCB0b2tlbnMgPSB0aGlzLmxleGVyLmJsb2NrVG9rZW5zKHRleHQpO1xuICAgICAgdGhpcy5sZXhlci5zdGF0ZS50b3AgPSB0b3A7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAnYmxvY2txdW90ZScsXG4gICAgICAgIHJhdzogY2FwWzBdLFxuICAgICAgICB0b2tlbnMsXG4gICAgICAgIHRleHRcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgbGlzdChzcmMpIHtcbiAgICBsZXQgY2FwID0gdGhpcy5ydWxlcy5ibG9jay5saXN0LmV4ZWMoc3JjKTtcbiAgICBpZiAoY2FwKSB7XG4gICAgICBsZXQgcmF3LCBpc3Rhc2ssIGlzY2hlY2tlZCwgaW5kZW50LCBpLCBibGFua0xpbmUsIGVuZHNXaXRoQmxhbmtMaW5lLFxuICAgICAgICBsaW5lLCBuZXh0TGluZSwgcmF3TGluZSwgaXRlbUNvbnRlbnRzLCBlbmRFYXJseTtcblxuICAgICAgbGV0IGJ1bGwgPSBjYXBbMV0udHJpbSgpO1xuICAgICAgY29uc3QgaXNvcmRlcmVkID0gYnVsbC5sZW5ndGggPiAxO1xuXG4gICAgICBjb25zdCBsaXN0ID0ge1xuICAgICAgICB0eXBlOiAnbGlzdCcsXG4gICAgICAgIHJhdzogJycsXG4gICAgICAgIG9yZGVyZWQ6IGlzb3JkZXJlZCxcbiAgICAgICAgc3RhcnQ6IGlzb3JkZXJlZCA/ICtidWxsLnNsaWNlKDAsIC0xKSA6ICcnLFxuICAgICAgICBsb29zZTogZmFsc2UsXG4gICAgICAgIGl0ZW1zOiBbXVxuICAgICAgfTtcblxuICAgICAgYnVsbCA9IGlzb3JkZXJlZCA/IGBcXFxcZHsxLDl9XFxcXCR7YnVsbC5zbGljZSgtMSl9YCA6IGBcXFxcJHtidWxsfWA7XG5cbiAgICAgIGlmICh0aGlzLm9wdGlvbnMucGVkYW50aWMpIHtcbiAgICAgICAgYnVsbCA9IGlzb3JkZXJlZCA/IGJ1bGwgOiAnWyorLV0nO1xuICAgICAgfVxuXG4gICAgICAvLyBHZXQgbmV4dCBsaXN0IGl0ZW1cbiAgICAgIGNvbnN0IGl0ZW1SZWdleCA9IG5ldyBSZWdFeHAoYF4oIHswLDN9JHtidWxsfSkoKD86W1xcdCBdW15cXFxcbl0qKT8oPzpcXFxcbnwkKSlgKTtcblxuICAgICAgLy8gQ2hlY2sgaWYgY3VycmVudCBidWxsZXQgcG9pbnQgY2FuIHN0YXJ0IGEgbmV3IExpc3QgSXRlbVxuICAgICAgd2hpbGUgKHNyYykge1xuICAgICAgICBlbmRFYXJseSA9IGZhbHNlO1xuICAgICAgICBpZiAoIShjYXAgPSBpdGVtUmVnZXguZXhlYyhzcmMpKSkge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMucnVsZXMuYmxvY2suaHIudGVzdChzcmMpKSB7IC8vIEVuZCBsaXN0IGlmIGJ1bGxldCB3YXMgYWN0dWFsbHkgSFIgKHBvc3NpYmx5IG1vdmUgaW50byBpdGVtUmVnZXg/KVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgcmF3ID0gY2FwWzBdO1xuICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHJhdy5sZW5ndGgpO1xuXG4gICAgICAgIGxpbmUgPSBjYXBbMl0uc3BsaXQoJ1xcbicsIDEpWzBdLnJlcGxhY2UoL15cXHQrLywgKHQpID0+ICcgJy5yZXBlYXQoMyAqIHQubGVuZ3RoKSk7XG4gICAgICAgIG5leHRMaW5lID0gc3JjLnNwbGl0KCdcXG4nLCAxKVswXTtcblxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnBlZGFudGljKSB7XG4gICAgICAgICAgaW5kZW50ID0gMjtcbiAgICAgICAgICBpdGVtQ29udGVudHMgPSBsaW5lLnRyaW1MZWZ0KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaW5kZW50ID0gY2FwWzJdLnNlYXJjaCgvW14gXS8pOyAvLyBGaW5kIGZpcnN0IG5vbi1zcGFjZSBjaGFyXG4gICAgICAgICAgaW5kZW50ID0gaW5kZW50ID4gNCA/IDEgOiBpbmRlbnQ7IC8vIFRyZWF0IGluZGVudGVkIGNvZGUgYmxvY2tzICg+IDQgc3BhY2VzKSBhcyBoYXZpbmcgb25seSAxIGluZGVudFxuICAgICAgICAgIGl0ZW1Db250ZW50cyA9IGxpbmUuc2xpY2UoaW5kZW50KTtcbiAgICAgICAgICBpbmRlbnQgKz0gY2FwWzFdLmxlbmd0aDtcbiAgICAgICAgfVxuXG4gICAgICAgIGJsYW5rTGluZSA9IGZhbHNlO1xuXG4gICAgICAgIGlmICghbGluZSAmJiAvXiAqJC8udGVzdChuZXh0TGluZSkpIHsgLy8gSXRlbXMgYmVnaW4gd2l0aCBhdCBtb3N0IG9uZSBibGFuayBsaW5lXG4gICAgICAgICAgcmF3ICs9IG5leHRMaW5lICsgJ1xcbic7XG4gICAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyhuZXh0TGluZS5sZW5ndGggKyAxKTtcbiAgICAgICAgICBlbmRFYXJseSA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWVuZEVhcmx5KSB7XG4gICAgICAgICAgY29uc3QgbmV4dEJ1bGxldFJlZ2V4ID0gbmV3IFJlZ0V4cChgXiB7MCwke01hdGgubWluKDMsIGluZGVudCAtIDEpfX0oPzpbKistXXxcXFxcZHsxLDl9Wy4pXSkoKD86WyBcXHRdW15cXFxcbl0qKT8oPzpcXFxcbnwkKSlgKTtcbiAgICAgICAgICBjb25zdCBoclJlZ2V4ID0gbmV3IFJlZ0V4cChgXiB7MCwke01hdGgubWluKDMsIGluZGVudCAtIDEpfX0oKD86LSAqKXszLH18KD86XyAqKXszLH18KD86XFxcXCogKil7Myx9KSg/OlxcXFxuK3wkKWApO1xuICAgICAgICAgIGNvbnN0IGZlbmNlc0JlZ2luUmVnZXggPSBuZXcgUmVnRXhwKGBeIHswLCR7TWF0aC5taW4oMywgaW5kZW50IC0gMSl9fSg/OlxcYFxcYFxcYHx+fn4pYCk7XG4gICAgICAgICAgY29uc3QgaGVhZGluZ0JlZ2luUmVnZXggPSBuZXcgUmVnRXhwKGBeIHswLCR7TWF0aC5taW4oMywgaW5kZW50IC0gMSl9fSNgKTtcblxuICAgICAgICAgIC8vIENoZWNrIGlmIGZvbGxvd2luZyBsaW5lcyBzaG91bGQgYmUgaW5jbHVkZWQgaW4gTGlzdCBJdGVtXG4gICAgICAgICAgd2hpbGUgKHNyYykge1xuICAgICAgICAgICAgcmF3TGluZSA9IHNyYy5zcGxpdCgnXFxuJywgMSlbMF07XG4gICAgICAgICAgICBuZXh0TGluZSA9IHJhd0xpbmU7XG5cbiAgICAgICAgICAgIC8vIFJlLWFsaWduIHRvIGZvbGxvdyBjb21tb25tYXJrIG5lc3RpbmcgcnVsZXNcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMucGVkYW50aWMpIHtcbiAgICAgICAgICAgICAgbmV4dExpbmUgPSBuZXh0TGluZS5yZXBsYWNlKC9eIHsxLDR9KD89KCB7NH0pKlteIF0pL2csICcgICcpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBFbmQgbGlzdCBpdGVtIGlmIGZvdW5kIGNvZGUgZmVuY2VzXG4gICAgICAgICAgICBpZiAoZmVuY2VzQmVnaW5SZWdleC50ZXN0KG5leHRMaW5lKSkge1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gRW5kIGxpc3QgaXRlbSBpZiBmb3VuZCBzdGFydCBvZiBuZXcgaGVhZGluZ1xuICAgICAgICAgICAgaWYgKGhlYWRpbmdCZWdpblJlZ2V4LnRlc3QobmV4dExpbmUpKSB7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBFbmQgbGlzdCBpdGVtIGlmIGZvdW5kIHN0YXJ0IG9mIG5ldyBidWxsZXRcbiAgICAgICAgICAgIGlmIChuZXh0QnVsbGV0UmVnZXgudGVzdChuZXh0TGluZSkpIHtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIEhvcml6b250YWwgcnVsZSBmb3VuZFxuICAgICAgICAgICAgaWYgKGhyUmVnZXgudGVzdChzcmMpKSB7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAobmV4dExpbmUuc2VhcmNoKC9bXiBdLykgPj0gaW5kZW50IHx8ICFuZXh0TGluZS50cmltKCkpIHsgLy8gRGVkZW50IGlmIHBvc3NpYmxlXG4gICAgICAgICAgICAgIGl0ZW1Db250ZW50cyArPSAnXFxuJyArIG5leHRMaW5lLnNsaWNlKGluZGVudCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBub3QgZW5vdWdoIGluZGVudGF0aW9uXG4gICAgICAgICAgICAgIGlmIChibGFua0xpbmUpIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIC8vIHBhcmFncmFwaCBjb250aW51YXRpb24gdW5sZXNzIGxhc3QgbGluZSB3YXMgYSBkaWZmZXJlbnQgYmxvY2sgbGV2ZWwgZWxlbWVudFxuICAgICAgICAgICAgICBpZiAobGluZS5zZWFyY2goL1teIF0vKSA+PSA0KSB7IC8vIGluZGVudGVkIGNvZGUgYmxvY2tcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAoZmVuY2VzQmVnaW5SZWdleC50ZXN0KGxpbmUpKSB7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWYgKGhlYWRpbmdCZWdpblJlZ2V4LnRlc3QobGluZSkpIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAoaHJSZWdleC50ZXN0KGxpbmUpKSB7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBpdGVtQ29udGVudHMgKz0gJ1xcbicgKyBuZXh0TGluZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCFibGFua0xpbmUgJiYgIW5leHRMaW5lLnRyaW0oKSkgeyAvLyBDaGVjayBpZiBjdXJyZW50IGxpbmUgaXMgYmxhbmtcbiAgICAgICAgICAgICAgYmxhbmtMaW5lID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmF3ICs9IHJhd0xpbmUgKyAnXFxuJztcbiAgICAgICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcocmF3TGluZS5sZW5ndGggKyAxKTtcbiAgICAgICAgICAgIGxpbmUgPSBuZXh0TGluZS5zbGljZShpbmRlbnQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghbGlzdC5sb29zZSkge1xuICAgICAgICAgIC8vIElmIHRoZSBwcmV2aW91cyBpdGVtIGVuZGVkIHdpdGggYSBibGFuayBsaW5lLCB0aGUgbGlzdCBpcyBsb29zZVxuICAgICAgICAgIGlmIChlbmRzV2l0aEJsYW5rTGluZSkge1xuICAgICAgICAgICAgbGlzdC5sb29zZSA9IHRydWU7XG4gICAgICAgICAgfSBlbHNlIGlmICgvXFxuICpcXG4gKiQvLnRlc3QocmF3KSkge1xuICAgICAgICAgICAgZW5kc1dpdGhCbGFua0xpbmUgPSB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENoZWNrIGZvciB0YXNrIGxpc3QgaXRlbXNcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5nZm0pIHtcbiAgICAgICAgICBpc3Rhc2sgPSAvXlxcW1sgeFhdXFxdIC8uZXhlYyhpdGVtQ29udGVudHMpO1xuICAgICAgICAgIGlmIChpc3Rhc2spIHtcbiAgICAgICAgICAgIGlzY2hlY2tlZCA9IGlzdGFza1swXSAhPT0gJ1sgXSAnO1xuICAgICAgICAgICAgaXRlbUNvbnRlbnRzID0gaXRlbUNvbnRlbnRzLnJlcGxhY2UoL15cXFtbIHhYXVxcXSArLywgJycpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGxpc3QuaXRlbXMucHVzaCh7XG4gICAgICAgICAgdHlwZTogJ2xpc3RfaXRlbScsXG4gICAgICAgICAgcmF3LFxuICAgICAgICAgIHRhc2s6ICEhaXN0YXNrLFxuICAgICAgICAgIGNoZWNrZWQ6IGlzY2hlY2tlZCxcbiAgICAgICAgICBsb29zZTogZmFsc2UsXG4gICAgICAgICAgdGV4dDogaXRlbUNvbnRlbnRzXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxpc3QucmF3ICs9IHJhdztcbiAgICAgIH1cblxuICAgICAgLy8gRG8gbm90IGNvbnN1bWUgbmV3bGluZXMgYXQgZW5kIG9mIGZpbmFsIGl0ZW0uIEFsdGVybmF0aXZlbHksIG1ha2UgaXRlbVJlZ2V4ICpzdGFydCogd2l0aCBhbnkgbmV3bGluZXMgdG8gc2ltcGxpZnkvc3BlZWQgdXAgZW5kc1dpdGhCbGFua0xpbmUgbG9naWNcbiAgICAgIGxpc3QuaXRlbXNbbGlzdC5pdGVtcy5sZW5ndGggLSAxXS5yYXcgPSByYXcudHJpbVJpZ2h0KCk7XG4gICAgICBsaXN0Lml0ZW1zW2xpc3QuaXRlbXMubGVuZ3RoIC0gMV0udGV4dCA9IGl0ZW1Db250ZW50cy50cmltUmlnaHQoKTtcbiAgICAgIGxpc3QucmF3ID0gbGlzdC5yYXcudHJpbVJpZ2h0KCk7XG5cbiAgICAgIGNvbnN0IGwgPSBsaXN0Lml0ZW1zLmxlbmd0aDtcblxuICAgICAgLy8gSXRlbSBjaGlsZCB0b2tlbnMgaGFuZGxlZCBoZXJlIGF0IGVuZCBiZWNhdXNlIHdlIG5lZWRlZCB0byBoYXZlIHRoZSBmaW5hbCBpdGVtIHRvIHRyaW0gaXQgZmlyc3RcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgdGhpcy5sZXhlci5zdGF0ZS50b3AgPSBmYWxzZTtcbiAgICAgICAgbGlzdC5pdGVtc1tpXS50b2tlbnMgPSB0aGlzLmxleGVyLmJsb2NrVG9rZW5zKGxpc3QuaXRlbXNbaV0udGV4dCwgW10pO1xuXG4gICAgICAgIGlmICghbGlzdC5sb29zZSkge1xuICAgICAgICAgIC8vIENoZWNrIGlmIGxpc3Qgc2hvdWxkIGJlIGxvb3NlXG4gICAgICAgICAgY29uc3Qgc3BhY2VycyA9IGxpc3QuaXRlbXNbaV0udG9rZW5zLmZpbHRlcih0ID0+IHQudHlwZSA9PT0gJ3NwYWNlJyk7XG4gICAgICAgICAgY29uc3QgaGFzTXVsdGlwbGVMaW5lQnJlYWtzID0gc3BhY2Vycy5sZW5ndGggPiAwICYmIHNwYWNlcnMuc29tZSh0ID0+IC9cXG4uKlxcbi8udGVzdCh0LnJhdykpO1xuXG4gICAgICAgICAgbGlzdC5sb29zZSA9IGhhc011bHRpcGxlTGluZUJyZWFrcztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBTZXQgYWxsIGl0ZW1zIHRvIGxvb3NlIGlmIGxpc3QgaXMgbG9vc2VcbiAgICAgIGlmIChsaXN0Lmxvb3NlKSB7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICBsaXN0Lml0ZW1zW2ldLmxvb3NlID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gbGlzdDtcbiAgICB9XG4gIH1cblxuICBodG1sKHNyYykge1xuICAgIGNvbnN0IGNhcCA9IHRoaXMucnVsZXMuYmxvY2suaHRtbC5leGVjKHNyYyk7XG4gICAgaWYgKGNhcCkge1xuICAgICAgY29uc3QgdG9rZW4gPSB7XG4gICAgICAgIHR5cGU6ICdodG1sJyxcbiAgICAgICAgcmF3OiBjYXBbMF0sXG4gICAgICAgIHByZTogIXRoaXMub3B0aW9ucy5zYW5pdGl6ZXJcbiAgICAgICAgICAmJiAoY2FwWzFdID09PSAncHJlJyB8fCBjYXBbMV0gPT09ICdzY3JpcHQnIHx8IGNhcFsxXSA9PT0gJ3N0eWxlJyksXG4gICAgICAgIHRleHQ6IGNhcFswXVxuICAgICAgfTtcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuc2FuaXRpemUpIHtcbiAgICAgICAgY29uc3QgdGV4dCA9IHRoaXMub3B0aW9ucy5zYW5pdGl6ZXIgPyB0aGlzLm9wdGlvbnMuc2FuaXRpemVyKGNhcFswXSkgOiBlc2NhcGUoY2FwWzBdKTtcbiAgICAgICAgdG9rZW4udHlwZSA9ICdwYXJhZ3JhcGgnO1xuICAgICAgICB0b2tlbi50ZXh0ID0gdGV4dDtcbiAgICAgICAgdG9rZW4udG9rZW5zID0gdGhpcy5sZXhlci5pbmxpbmUodGV4dCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdG9rZW47XG4gICAgfVxuICB9XG5cbiAgZGVmKHNyYykge1xuICAgIGNvbnN0IGNhcCA9IHRoaXMucnVsZXMuYmxvY2suZGVmLmV4ZWMoc3JjKTtcbiAgICBpZiAoY2FwKSB7XG4gICAgICBjb25zdCB0YWcgPSBjYXBbMV0udG9Mb3dlckNhc2UoKS5yZXBsYWNlKC9cXHMrL2csICcgJyk7XG4gICAgICBjb25zdCBocmVmID0gY2FwWzJdID8gY2FwWzJdLnJlcGxhY2UoL148KC4qKT4kLywgJyQxJykucmVwbGFjZSh0aGlzLnJ1bGVzLmlubGluZS5fZXNjYXBlcywgJyQxJykgOiAnJztcbiAgICAgIGNvbnN0IHRpdGxlID0gY2FwWzNdID8gY2FwWzNdLnN1YnN0cmluZygxLCBjYXBbM10ubGVuZ3RoIC0gMSkucmVwbGFjZSh0aGlzLnJ1bGVzLmlubGluZS5fZXNjYXBlcywgJyQxJykgOiBjYXBbM107XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAnZGVmJyxcbiAgICAgICAgdGFnLFxuICAgICAgICByYXc6IGNhcFswXSxcbiAgICAgICAgaHJlZixcbiAgICAgICAgdGl0bGVcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgdGFibGUoc3JjKSB7XG4gICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5ibG9jay50YWJsZS5leGVjKHNyYyk7XG4gICAgaWYgKGNhcCkge1xuICAgICAgY29uc3QgaXRlbSA9IHtcbiAgICAgICAgdHlwZTogJ3RhYmxlJyxcbiAgICAgICAgaGVhZGVyOiBzcGxpdENlbGxzKGNhcFsxXSkubWFwKGMgPT4geyByZXR1cm4geyB0ZXh0OiBjIH07IH0pLFxuICAgICAgICBhbGlnbjogY2FwWzJdLnJlcGxhY2UoL14gKnxcXHwgKiQvZywgJycpLnNwbGl0KC8gKlxcfCAqLyksXG4gICAgICAgIHJvd3M6IGNhcFszXSAmJiBjYXBbM10udHJpbSgpID8gY2FwWzNdLnJlcGxhY2UoL1xcblsgXFx0XSokLywgJycpLnNwbGl0KCdcXG4nKSA6IFtdXG4gICAgICB9O1xuXG4gICAgICBpZiAoaXRlbS5oZWFkZXIubGVuZ3RoID09PSBpdGVtLmFsaWduLmxlbmd0aCkge1xuICAgICAgICBpdGVtLnJhdyA9IGNhcFswXTtcblxuICAgICAgICBsZXQgbCA9IGl0ZW0uYWxpZ24ubGVuZ3RoO1xuICAgICAgICBsZXQgaSwgaiwgaywgcm93O1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgaWYgKC9eICotKzogKiQvLnRlc3QoaXRlbS5hbGlnbltpXSkpIHtcbiAgICAgICAgICAgIGl0ZW0uYWxpZ25baV0gPSAncmlnaHQnO1xuICAgICAgICAgIH0gZWxzZSBpZiAoL14gKjotKzogKiQvLnRlc3QoaXRlbS5hbGlnbltpXSkpIHtcbiAgICAgICAgICAgIGl0ZW0uYWxpZ25baV0gPSAnY2VudGVyJztcbiAgICAgICAgICB9IGVsc2UgaWYgKC9eICo6LSsgKiQvLnRlc3QoaXRlbS5hbGlnbltpXSkpIHtcbiAgICAgICAgICAgIGl0ZW0uYWxpZ25baV0gPSAnbGVmdCc7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGl0ZW0uYWxpZ25baV0gPSBudWxsO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGwgPSBpdGVtLnJvd3MubGVuZ3RoO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgaXRlbS5yb3dzW2ldID0gc3BsaXRDZWxscyhpdGVtLnJvd3NbaV0sIGl0ZW0uaGVhZGVyLmxlbmd0aCkubWFwKGMgPT4geyByZXR1cm4geyB0ZXh0OiBjIH07IH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gcGFyc2UgY2hpbGQgdG9rZW5zIGluc2lkZSBoZWFkZXJzIGFuZCBjZWxsc1xuXG4gICAgICAgIC8vIGhlYWRlciBjaGlsZCB0b2tlbnNcbiAgICAgICAgbCA9IGl0ZW0uaGVhZGVyLmxlbmd0aDtcbiAgICAgICAgZm9yIChqID0gMDsgaiA8IGw7IGorKykge1xuICAgICAgICAgIGl0ZW0uaGVhZGVyW2pdLnRva2VucyA9IHRoaXMubGV4ZXIuaW5saW5lKGl0ZW0uaGVhZGVyW2pdLnRleHQpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gY2VsbCBjaGlsZCB0b2tlbnNcbiAgICAgICAgbCA9IGl0ZW0ucm93cy5sZW5ndGg7XG4gICAgICAgIGZvciAoaiA9IDA7IGogPCBsOyBqKyspIHtcbiAgICAgICAgICByb3cgPSBpdGVtLnJvd3Nbal07XG4gICAgICAgICAgZm9yIChrID0gMDsgayA8IHJvdy5sZW5ndGg7IGsrKykge1xuICAgICAgICAgICAgcm93W2tdLnRva2VucyA9IHRoaXMubGV4ZXIuaW5saW5lKHJvd1trXS50ZXh0KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gaXRlbTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBsaGVhZGluZyhzcmMpIHtcbiAgICBjb25zdCBjYXAgPSB0aGlzLnJ1bGVzLmJsb2NrLmxoZWFkaW5nLmV4ZWMoc3JjKTtcbiAgICBpZiAoY2FwKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAnaGVhZGluZycsXG4gICAgICAgIHJhdzogY2FwWzBdLFxuICAgICAgICBkZXB0aDogY2FwWzJdLmNoYXJBdCgwKSA9PT0gJz0nID8gMSA6IDIsXG4gICAgICAgIHRleHQ6IGNhcFsxXSxcbiAgICAgICAgdG9rZW5zOiB0aGlzLmxleGVyLmlubGluZShjYXBbMV0pXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIHBhcmFncmFwaChzcmMpIHtcbiAgICBjb25zdCBjYXAgPSB0aGlzLnJ1bGVzLmJsb2NrLnBhcmFncmFwaC5leGVjKHNyYyk7XG4gICAgaWYgKGNhcCkge1xuICAgICAgY29uc3QgdGV4dCA9IGNhcFsxXS5jaGFyQXQoY2FwWzFdLmxlbmd0aCAtIDEpID09PSAnXFxuJ1xuICAgICAgICA/IGNhcFsxXS5zbGljZSgwLCAtMSlcbiAgICAgICAgOiBjYXBbMV07XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAncGFyYWdyYXBoJyxcbiAgICAgICAgcmF3OiBjYXBbMF0sXG4gICAgICAgIHRleHQsXG4gICAgICAgIHRva2VuczogdGhpcy5sZXhlci5pbmxpbmUodGV4dClcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgdGV4dChzcmMpIHtcbiAgICBjb25zdCBjYXAgPSB0aGlzLnJ1bGVzLmJsb2NrLnRleHQuZXhlYyhzcmMpO1xuICAgIGlmIChjYXApIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgICAgcmF3OiBjYXBbMF0sXG4gICAgICAgIHRleHQ6IGNhcFswXSxcbiAgICAgICAgdG9rZW5zOiB0aGlzLmxleGVyLmlubGluZShjYXBbMF0pXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIGVzY2FwZShzcmMpIHtcbiAgICBjb25zdCBjYXAgPSB0aGlzLnJ1bGVzLmlubGluZS5lc2NhcGUuZXhlYyhzcmMpO1xuICAgIGlmIChjYXApIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdlc2NhcGUnLFxuICAgICAgICByYXc6IGNhcFswXSxcbiAgICAgICAgdGV4dDogZXNjYXBlKGNhcFsxXSlcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgdGFnKHNyYykge1xuICAgIGNvbnN0IGNhcCA9IHRoaXMucnVsZXMuaW5saW5lLnRhZy5leGVjKHNyYyk7XG4gICAgaWYgKGNhcCkge1xuICAgICAgaWYgKCF0aGlzLmxleGVyLnN0YXRlLmluTGluayAmJiAvXjxhIC9pLnRlc3QoY2FwWzBdKSkge1xuICAgICAgICB0aGlzLmxleGVyLnN0YXRlLmluTGluayA9IHRydWU7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMubGV4ZXIuc3RhdGUuaW5MaW5rICYmIC9ePFxcL2E+L2kudGVzdChjYXBbMF0pKSB7XG4gICAgICAgIHRoaXMubGV4ZXIuc3RhdGUuaW5MaW5rID0gZmFsc2U7XG4gICAgICB9XG4gICAgICBpZiAoIXRoaXMubGV4ZXIuc3RhdGUuaW5SYXdCbG9jayAmJiAvXjwocHJlfGNvZGV8a2JkfHNjcmlwdCkoXFxzfD4pL2kudGVzdChjYXBbMF0pKSB7XG4gICAgICAgIHRoaXMubGV4ZXIuc3RhdGUuaW5SYXdCbG9jayA9IHRydWU7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMubGV4ZXIuc3RhdGUuaW5SYXdCbG9jayAmJiAvXjxcXC8ocHJlfGNvZGV8a2JkfHNjcmlwdCkoXFxzfD4pL2kudGVzdChjYXBbMF0pKSB7XG4gICAgICAgIHRoaXMubGV4ZXIuc3RhdGUuaW5SYXdCbG9jayA9IGZhbHNlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiB0aGlzLm9wdGlvbnMuc2FuaXRpemVcbiAgICAgICAgICA/ICd0ZXh0J1xuICAgICAgICAgIDogJ2h0bWwnLFxuICAgICAgICByYXc6IGNhcFswXSxcbiAgICAgICAgaW5MaW5rOiB0aGlzLmxleGVyLnN0YXRlLmluTGluayxcbiAgICAgICAgaW5SYXdCbG9jazogdGhpcy5sZXhlci5zdGF0ZS5pblJhd0Jsb2NrLFxuICAgICAgICB0ZXh0OiB0aGlzLm9wdGlvbnMuc2FuaXRpemVcbiAgICAgICAgICA/ICh0aGlzLm9wdGlvbnMuc2FuaXRpemVyXG4gICAgICAgICAgICA/IHRoaXMub3B0aW9ucy5zYW5pdGl6ZXIoY2FwWzBdKVxuICAgICAgICAgICAgOiBlc2NhcGUoY2FwWzBdKSlcbiAgICAgICAgICA6IGNhcFswXVxuICAgICAgfTtcbiAgICB9XG4gIH1cblxuICBsaW5rKHNyYykge1xuICAgIGNvbnN0IGNhcCA9IHRoaXMucnVsZXMuaW5saW5lLmxpbmsuZXhlYyhzcmMpO1xuICAgIGlmIChjYXApIHtcbiAgICAgIGNvbnN0IHRyaW1tZWRVcmwgPSBjYXBbMl0udHJpbSgpO1xuICAgICAgaWYgKCF0aGlzLm9wdGlvbnMucGVkYW50aWMgJiYgL148Ly50ZXN0KHRyaW1tZWRVcmwpKSB7XG4gICAgICAgIC8vIGNvbW1vbm1hcmsgcmVxdWlyZXMgbWF0Y2hpbmcgYW5nbGUgYnJhY2tldHNcbiAgICAgICAgaWYgKCEoLz4kLy50ZXN0KHRyaW1tZWRVcmwpKSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGVuZGluZyBhbmdsZSBicmFja2V0IGNhbm5vdCBiZSBlc2NhcGVkXG4gICAgICAgIGNvbnN0IHJ0cmltU2xhc2ggPSBydHJpbSh0cmltbWVkVXJsLnNsaWNlKDAsIC0xKSwgJ1xcXFwnKTtcbiAgICAgICAgaWYgKCh0cmltbWVkVXJsLmxlbmd0aCAtIHJ0cmltU2xhc2gubGVuZ3RoKSAlIDIgPT09IDApIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGZpbmQgY2xvc2luZyBwYXJlbnRoZXNpc1xuICAgICAgICBjb25zdCBsYXN0UGFyZW5JbmRleCA9IGZpbmRDbG9zaW5nQnJhY2tldChjYXBbMl0sICcoKScpO1xuICAgICAgICBpZiAobGFzdFBhcmVuSW5kZXggPiAtMSkge1xuICAgICAgICAgIGNvbnN0IHN0YXJ0ID0gY2FwWzBdLmluZGV4T2YoJyEnKSA9PT0gMCA/IDUgOiA0O1xuICAgICAgICAgIGNvbnN0IGxpbmtMZW4gPSBzdGFydCArIGNhcFsxXS5sZW5ndGggKyBsYXN0UGFyZW5JbmRleDtcbiAgICAgICAgICBjYXBbMl0gPSBjYXBbMl0uc3Vic3RyaW5nKDAsIGxhc3RQYXJlbkluZGV4KTtcbiAgICAgICAgICBjYXBbMF0gPSBjYXBbMF0uc3Vic3RyaW5nKDAsIGxpbmtMZW4pLnRyaW0oKTtcbiAgICAgICAgICBjYXBbM10gPSAnJztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbGV0IGhyZWYgPSBjYXBbMl07XG4gICAgICBsZXQgdGl0bGUgPSAnJztcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMucGVkYW50aWMpIHtcbiAgICAgICAgLy8gc3BsaXQgcGVkYW50aWMgaHJlZiBhbmQgdGl0bGVcbiAgICAgICAgY29uc3QgbGluayA9IC9eKFteJ1wiXSpbXlxcc10pXFxzKyhbJ1wiXSkoLiopXFwyLy5leGVjKGhyZWYpO1xuXG4gICAgICAgIGlmIChsaW5rKSB7XG4gICAgICAgICAgaHJlZiA9IGxpbmtbMV07XG4gICAgICAgICAgdGl0bGUgPSBsaW5rWzNdO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aXRsZSA9IGNhcFszXSA/IGNhcFszXS5zbGljZSgxLCAtMSkgOiAnJztcbiAgICAgIH1cblxuICAgICAgaHJlZiA9IGhyZWYudHJpbSgpO1xuICAgICAgaWYgKC9ePC8udGVzdChocmVmKSkge1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnBlZGFudGljICYmICEoLz4kLy50ZXN0KHRyaW1tZWRVcmwpKSkge1xuICAgICAgICAgIC8vIHBlZGFudGljIGFsbG93cyBzdGFydGluZyBhbmdsZSBicmFja2V0IHdpdGhvdXQgZW5kaW5nIGFuZ2xlIGJyYWNrZXRcbiAgICAgICAgICBocmVmID0gaHJlZi5zbGljZSgxKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBocmVmID0gaHJlZi5zbGljZSgxLCAtMSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBvdXRwdXRMaW5rKGNhcCwge1xuICAgICAgICBocmVmOiBocmVmID8gaHJlZi5yZXBsYWNlKHRoaXMucnVsZXMuaW5saW5lLl9lc2NhcGVzLCAnJDEnKSA6IGhyZWYsXG4gICAgICAgIHRpdGxlOiB0aXRsZSA/IHRpdGxlLnJlcGxhY2UodGhpcy5ydWxlcy5pbmxpbmUuX2VzY2FwZXMsICckMScpIDogdGl0bGVcbiAgICAgIH0sIGNhcFswXSwgdGhpcy5sZXhlcik7XG4gICAgfVxuICB9XG5cbiAgcmVmbGluayhzcmMsIGxpbmtzKSB7XG4gICAgbGV0IGNhcDtcbiAgICBpZiAoKGNhcCA9IHRoaXMucnVsZXMuaW5saW5lLnJlZmxpbmsuZXhlYyhzcmMpKVxuICAgICAgICB8fCAoY2FwID0gdGhpcy5ydWxlcy5pbmxpbmUubm9saW5rLmV4ZWMoc3JjKSkpIHtcbiAgICAgIGxldCBsaW5rID0gKGNhcFsyXSB8fCBjYXBbMV0pLnJlcGxhY2UoL1xccysvZywgJyAnKTtcbiAgICAgIGxpbmsgPSBsaW5rc1tsaW5rLnRvTG93ZXJDYXNlKCldO1xuICAgICAgaWYgKCFsaW5rKSB7XG4gICAgICAgIGNvbnN0IHRleHQgPSBjYXBbMF0uY2hhckF0KDApO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgICAgICByYXc6IHRleHQsXG4gICAgICAgICAgdGV4dFxuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgcmV0dXJuIG91dHB1dExpbmsoY2FwLCBsaW5rLCBjYXBbMF0sIHRoaXMubGV4ZXIpO1xuICAgIH1cbiAgfVxuXG4gIGVtU3Ryb25nKHNyYywgbWFza2VkU3JjLCBwcmV2Q2hhciA9ICcnKSB7XG4gICAgbGV0IG1hdGNoID0gdGhpcy5ydWxlcy5pbmxpbmUuZW1TdHJvbmcubERlbGltLmV4ZWMoc3JjKTtcbiAgICBpZiAoIW1hdGNoKSByZXR1cm47XG5cbiAgICAvLyBfIGNhbid0IGJlIGJldHdlZW4gdHdvIGFscGhhbnVtZXJpY3MuIFxccHtMfVxccHtOfSBpbmNsdWRlcyBub24tZW5nbGlzaCBhbHBoYWJldC9udW1iZXJzIGFzIHdlbGxcbiAgICBpZiAobWF0Y2hbM10gJiYgcHJldkNoYXIubWF0Y2goL1tcXHB7TH1cXHB7Tn1dL3UpKSByZXR1cm47XG5cbiAgICBjb25zdCBuZXh0Q2hhciA9IG1hdGNoWzFdIHx8IG1hdGNoWzJdIHx8ICcnO1xuXG4gICAgaWYgKCFuZXh0Q2hhciB8fCAobmV4dENoYXIgJiYgKHByZXZDaGFyID09PSAnJyB8fCB0aGlzLnJ1bGVzLmlubGluZS5wdW5jdHVhdGlvbi5leGVjKHByZXZDaGFyKSkpKSB7XG4gICAgICBjb25zdCBsTGVuZ3RoID0gbWF0Y2hbMF0ubGVuZ3RoIC0gMTtcbiAgICAgIGxldCByRGVsaW0sIHJMZW5ndGgsIGRlbGltVG90YWwgPSBsTGVuZ3RoLCBtaWREZWxpbVRvdGFsID0gMDtcblxuICAgICAgY29uc3QgZW5kUmVnID0gbWF0Y2hbMF1bMF0gPT09ICcqJyA/IHRoaXMucnVsZXMuaW5saW5lLmVtU3Ryb25nLnJEZWxpbUFzdCA6IHRoaXMucnVsZXMuaW5saW5lLmVtU3Ryb25nLnJEZWxpbVVuZDtcbiAgICAgIGVuZFJlZy5sYXN0SW5kZXggPSAwO1xuXG4gICAgICAvLyBDbGlwIG1hc2tlZFNyYyB0byBzYW1lIHNlY3Rpb24gb2Ygc3RyaW5nIGFzIHNyYyAobW92ZSB0byBsZXhlcj8pXG4gICAgICBtYXNrZWRTcmMgPSBtYXNrZWRTcmMuc2xpY2UoLTEgKiBzcmMubGVuZ3RoICsgbExlbmd0aCk7XG5cbiAgICAgIHdoaWxlICgobWF0Y2ggPSBlbmRSZWcuZXhlYyhtYXNrZWRTcmMpKSAhPSBudWxsKSB7XG4gICAgICAgIHJEZWxpbSA9IG1hdGNoWzFdIHx8IG1hdGNoWzJdIHx8IG1hdGNoWzNdIHx8IG1hdGNoWzRdIHx8IG1hdGNoWzVdIHx8IG1hdGNoWzZdO1xuXG4gICAgICAgIGlmICghckRlbGltKSBjb250aW51ZTsgLy8gc2tpcCBzaW5nbGUgKiBpbiBfX2FiYyphYmNfX1xuXG4gICAgICAgIHJMZW5ndGggPSByRGVsaW0ubGVuZ3RoO1xuXG4gICAgICAgIGlmIChtYXRjaFszXSB8fCBtYXRjaFs0XSkgeyAvLyBmb3VuZCBhbm90aGVyIExlZnQgRGVsaW1cbiAgICAgICAgICBkZWxpbVRvdGFsICs9IHJMZW5ndGg7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH0gZWxzZSBpZiAobWF0Y2hbNV0gfHwgbWF0Y2hbNl0pIHsgLy8gZWl0aGVyIExlZnQgb3IgUmlnaHQgRGVsaW1cbiAgICAgICAgICBpZiAobExlbmd0aCAlIDMgJiYgISgobExlbmd0aCArIHJMZW5ndGgpICUgMykpIHtcbiAgICAgICAgICAgIG1pZERlbGltVG90YWwgKz0gckxlbmd0aDtcbiAgICAgICAgICAgIGNvbnRpbnVlOyAvLyBDb21tb25NYXJrIEVtcGhhc2lzIFJ1bGVzIDktMTBcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBkZWxpbVRvdGFsIC09IHJMZW5ndGg7XG5cbiAgICAgICAgaWYgKGRlbGltVG90YWwgPiAwKSBjb250aW51ZTsgLy8gSGF2ZW4ndCBmb3VuZCBlbm91Z2ggY2xvc2luZyBkZWxpbWl0ZXJzXG5cbiAgICAgICAgLy8gUmVtb3ZlIGV4dHJhIGNoYXJhY3RlcnMuICphKioqIC0+ICphKlxuICAgICAgICByTGVuZ3RoID0gTWF0aC5taW4ockxlbmd0aCwgckxlbmd0aCArIGRlbGltVG90YWwgKyBtaWREZWxpbVRvdGFsKTtcblxuICAgICAgICBjb25zdCByYXcgPSBzcmMuc2xpY2UoMCwgbExlbmd0aCArIG1hdGNoLmluZGV4ICsgKG1hdGNoWzBdLmxlbmd0aCAtIHJEZWxpbS5sZW5ndGgpICsgckxlbmd0aCk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIGBlbWAgaWYgc21hbGxlc3QgZGVsaW1pdGVyIGhhcyBvZGQgY2hhciBjb3VudC4gKmEqKipcbiAgICAgICAgaWYgKE1hdGgubWluKGxMZW5ndGgsIHJMZW5ndGgpICUgMikge1xuICAgICAgICAgIGNvbnN0IHRleHQgPSByYXcuc2xpY2UoMSwgLTEpO1xuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0eXBlOiAnZW0nLFxuICAgICAgICAgICAgcmF3LFxuICAgICAgICAgICAgdGV4dCxcbiAgICAgICAgICAgIHRva2VuczogdGhpcy5sZXhlci5pbmxpbmVUb2tlbnModGV4dClcbiAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ3JlYXRlICdzdHJvbmcnIGlmIHNtYWxsZXN0IGRlbGltaXRlciBoYXMgZXZlbiBjaGFyIGNvdW50LiAqKmEqKipcbiAgICAgICAgY29uc3QgdGV4dCA9IHJhdy5zbGljZSgyLCAtMik7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgdHlwZTogJ3N0cm9uZycsXG4gICAgICAgICAgcmF3LFxuICAgICAgICAgIHRleHQsXG4gICAgICAgICAgdG9rZW5zOiB0aGlzLmxleGVyLmlubGluZVRva2Vucyh0ZXh0KVxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGNvZGVzcGFuKHNyYykge1xuICAgIGNvbnN0IGNhcCA9IHRoaXMucnVsZXMuaW5saW5lLmNvZGUuZXhlYyhzcmMpO1xuICAgIGlmIChjYXApIHtcbiAgICAgIGxldCB0ZXh0ID0gY2FwWzJdLnJlcGxhY2UoL1xcbi9nLCAnICcpO1xuICAgICAgY29uc3QgaGFzTm9uU3BhY2VDaGFycyA9IC9bXiBdLy50ZXN0KHRleHQpO1xuICAgICAgY29uc3QgaGFzU3BhY2VDaGFyc09uQm90aEVuZHMgPSAvXiAvLnRlc3QodGV4dCkgJiYgLyAkLy50ZXN0KHRleHQpO1xuICAgICAgaWYgKGhhc05vblNwYWNlQ2hhcnMgJiYgaGFzU3BhY2VDaGFyc09uQm90aEVuZHMpIHtcbiAgICAgICAgdGV4dCA9IHRleHQuc3Vic3RyaW5nKDEsIHRleHQubGVuZ3RoIC0gMSk7XG4gICAgICB9XG4gICAgICB0ZXh0ID0gZXNjYXBlKHRleHQsIHRydWUpO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ2NvZGVzcGFuJyxcbiAgICAgICAgcmF3OiBjYXBbMF0sXG4gICAgICAgIHRleHRcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgYnIoc3JjKSB7XG4gICAgY29uc3QgY2FwID0gdGhpcy5ydWxlcy5pbmxpbmUuYnIuZXhlYyhzcmMpO1xuICAgIGlmIChjYXApIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdicicsXG4gICAgICAgIHJhdzogY2FwWzBdXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIGRlbChzcmMpIHtcbiAgICBjb25zdCBjYXAgPSB0aGlzLnJ1bGVzLmlubGluZS5kZWwuZXhlYyhzcmMpO1xuICAgIGlmIChjYXApIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdkZWwnLFxuICAgICAgICByYXc6IGNhcFswXSxcbiAgICAgICAgdGV4dDogY2FwWzJdLFxuICAgICAgICB0b2tlbnM6IHRoaXMubGV4ZXIuaW5saW5lVG9rZW5zKGNhcFsyXSlcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgYXV0b2xpbmsoc3JjLCBtYW5nbGUpIHtcbiAgICBjb25zdCBjYXAgPSB0aGlzLnJ1bGVzLmlubGluZS5hdXRvbGluay5leGVjKHNyYyk7XG4gICAgaWYgKGNhcCkge1xuICAgICAgbGV0IHRleHQsIGhyZWY7XG4gICAgICBpZiAoY2FwWzJdID09PSAnQCcpIHtcbiAgICAgICAgdGV4dCA9IGVzY2FwZSh0aGlzLm9wdGlvbnMubWFuZ2xlID8gbWFuZ2xlKGNhcFsxXSkgOiBjYXBbMV0pO1xuICAgICAgICBocmVmID0gJ21haWx0bzonICsgdGV4dDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRleHQgPSBlc2NhcGUoY2FwWzFdKTtcbiAgICAgICAgaHJlZiA9IHRleHQ7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6ICdsaW5rJyxcbiAgICAgICAgcmF3OiBjYXBbMF0sXG4gICAgICAgIHRleHQsXG4gICAgICAgIGhyZWYsXG4gICAgICAgIHRva2VuczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgICAgICAgIHJhdzogdGV4dCxcbiAgICAgICAgICAgIHRleHRcbiAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgdXJsKHNyYywgbWFuZ2xlKSB7XG4gICAgbGV0IGNhcDtcbiAgICBpZiAoY2FwID0gdGhpcy5ydWxlcy5pbmxpbmUudXJsLmV4ZWMoc3JjKSkge1xuICAgICAgbGV0IHRleHQsIGhyZWY7XG4gICAgICBpZiAoY2FwWzJdID09PSAnQCcpIHtcbiAgICAgICAgdGV4dCA9IGVzY2FwZSh0aGlzLm9wdGlvbnMubWFuZ2xlID8gbWFuZ2xlKGNhcFswXSkgOiBjYXBbMF0pO1xuICAgICAgICBocmVmID0gJ21haWx0bzonICsgdGV4dDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGRvIGV4dGVuZGVkIGF1dG9saW5rIHBhdGggdmFsaWRhdGlvblxuICAgICAgICBsZXQgcHJldkNhcFplcm87XG4gICAgICAgIGRvIHtcbiAgICAgICAgICBwcmV2Q2FwWmVybyA9IGNhcFswXTtcbiAgICAgICAgICBjYXBbMF0gPSB0aGlzLnJ1bGVzLmlubGluZS5fYmFja3BlZGFsLmV4ZWMoY2FwWzBdKVswXTtcbiAgICAgICAgfSB3aGlsZSAocHJldkNhcFplcm8gIT09IGNhcFswXSk7XG4gICAgICAgIHRleHQgPSBlc2NhcGUoY2FwWzBdKTtcbiAgICAgICAgaWYgKGNhcFsxXSA9PT0gJ3d3dy4nKSB7XG4gICAgICAgICAgaHJlZiA9ICdodHRwOi8vJyArIGNhcFswXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBocmVmID0gY2FwWzBdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4ge1xuICAgICAgICB0eXBlOiAnbGluaycsXG4gICAgICAgIHJhdzogY2FwWzBdLFxuICAgICAgICB0ZXh0LFxuICAgICAgICBocmVmLFxuICAgICAgICB0b2tlbnM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICB0eXBlOiAndGV4dCcsXG4gICAgICAgICAgICByYXc6IHRleHQsXG4gICAgICAgICAgICB0ZXh0XG4gICAgICAgICAgfVxuICAgICAgICBdXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIGlubGluZVRleHQoc3JjLCBzbWFydHlwYW50cykge1xuICAgIGNvbnN0IGNhcCA9IHRoaXMucnVsZXMuaW5saW5lLnRleHQuZXhlYyhzcmMpO1xuICAgIGlmIChjYXApIHtcbiAgICAgIGxldCB0ZXh0O1xuICAgICAgaWYgKHRoaXMubGV4ZXIuc3RhdGUuaW5SYXdCbG9jaykge1xuICAgICAgICB0ZXh0ID0gdGhpcy5vcHRpb25zLnNhbml0aXplID8gKHRoaXMub3B0aW9ucy5zYW5pdGl6ZXIgPyB0aGlzLm9wdGlvbnMuc2FuaXRpemVyKGNhcFswXSkgOiBlc2NhcGUoY2FwWzBdKSkgOiBjYXBbMF07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0ZXh0ID0gZXNjYXBlKHRoaXMub3B0aW9ucy5zbWFydHlwYW50cyA/IHNtYXJ0eXBhbnRzKGNhcFswXSkgOiBjYXBbMF0pO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogJ3RleHQnLFxuICAgICAgICByYXc6IGNhcFswXSxcbiAgICAgICAgdGV4dFxuICAgICAgfTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBCbG9jay1MZXZlbCBHcmFtbWFyXG4gKi9cbmNvbnN0IGJsb2NrID0ge1xuICBuZXdsaW5lOiAvXig/OiAqKD86XFxufCQpKSsvLFxuICBjb2RlOiAvXiggezR9W15cXG5dKyg/Olxcbig/OiAqKD86XFxufCQpKSopPykrLyxcbiAgZmVuY2VzOiAvXiB7MCwzfShgezMsfSg/PVteYFxcbl0qKD86XFxufCQpKXx+ezMsfSkoW15cXG5dKikoPzpcXG58JCkoPzp8KFtcXHNcXFNdKj8pKD86XFxufCQpKSg/OiB7MCwzfVxcMVt+YF0qICooPz1cXG58JCl8JCkvLFxuICBocjogL14gezAsM30oKD86LVtcXHQgXSopezMsfXwoPzpfWyBcXHRdKil7Myx9fCg/OlxcKlsgXFx0XSopezMsfSkoPzpcXG4rfCQpLyxcbiAgaGVhZGluZzogL14gezAsM30oI3sxLDZ9KSg/PVxcc3wkKSguKikoPzpcXG4rfCQpLyxcbiAgYmxvY2txdW90ZTogL14oIHswLDN9PiA/KHBhcmFncmFwaHxbXlxcbl0qKSg/OlxcbnwkKSkrLyxcbiAgbGlzdDogL14oIHswLDN9YnVsbCkoWyBcXHRdW15cXG5dKz8pPyg/OlxcbnwkKS8sXG4gIGh0bWw6ICdeIHswLDN9KD86JyAvLyBvcHRpb25hbCBpbmRlbnRhdGlvblxuICAgICsgJzwoc2NyaXB0fHByZXxzdHlsZXx0ZXh0YXJlYSlbXFxcXHM+XVtcXFxcc1xcXFxTXSo/KD86PC9cXFxcMT5bXlxcXFxuXSpcXFxcbit8JCknIC8vICgxKVxuICAgICsgJ3xjb21tZW50W15cXFxcbl0qKFxcXFxuK3wkKScgLy8gKDIpXG4gICAgKyAnfDxcXFxcP1tcXFxcc1xcXFxTXSo/KD86XFxcXD8+XFxcXG4qfCQpJyAvLyAoMylcbiAgICArICd8PCFbQS1aXVtcXFxcc1xcXFxTXSo/KD86PlxcXFxuKnwkKScgLy8gKDQpXG4gICAgKyAnfDwhXFxcXFtDREFUQVxcXFxbW1xcXFxzXFxcXFNdKj8oPzpcXFxcXVxcXFxdPlxcXFxuKnwkKScgLy8gKDUpXG4gICAgKyAnfDwvPyh0YWcpKD86ICt8XFxcXG58Lz8+KVtcXFxcc1xcXFxTXSo/KD86KD86XFxcXG4gKikrXFxcXG58JCknIC8vICg2KVxuICAgICsgJ3w8KD8hc2NyaXB0fHByZXxzdHlsZXx0ZXh0YXJlYSkoW2Etel1bXFxcXHctXSopKD86YXR0cmlidXRlKSo/ICovPz4oPz1bIFxcXFx0XSooPzpcXFxcbnwkKSlbXFxcXHNcXFxcU10qPyg/Oig/OlxcXFxuICopK1xcXFxufCQpJyAvLyAoNykgb3BlbiB0YWdcbiAgICArICd8PC8oPyFzY3JpcHR8cHJlfHN0eWxlfHRleHRhcmVhKVthLXpdW1xcXFx3LV0qXFxcXHMqPig/PVsgXFxcXHRdKig/OlxcXFxufCQpKVtcXFxcc1xcXFxTXSo/KD86KD86XFxcXG4gKikrXFxcXG58JCknIC8vICg3KSBjbG9zaW5nIHRhZ1xuICAgICsgJyknLFxuICBkZWY6IC9eIHswLDN9XFxbKGxhYmVsKVxcXTogKig/OlxcbiAqKT8oW148XFxzXVteXFxzXSp8PC4qPz4pKD86KD86ICsoPzpcXG4gKik/fCAqXFxuICopKHRpdGxlKSk/ICooPzpcXG4rfCQpLyxcbiAgdGFibGU6IG5vb3BUZXN0LFxuICBsaGVhZGluZzogL14oKD86LnxcXG4oPyFcXG4pKSs/KVxcbiB7MCwzfSg9K3wtKykgKig/Olxcbit8JCkvLFxuICAvLyByZWdleCB0ZW1wbGF0ZSwgcGxhY2Vob2xkZXJzIHdpbGwgYmUgcmVwbGFjZWQgYWNjb3JkaW5nIHRvIGRpZmZlcmVudCBwYXJhZ3JhcGhcbiAgLy8gaW50ZXJydXB0aW9uIHJ1bGVzIG9mIGNvbW1vbm1hcmsgYW5kIHRoZSBvcmlnaW5hbCBtYXJrZG93biBzcGVjOlxuICBfcGFyYWdyYXBoOiAvXihbXlxcbl0rKD86XFxuKD8haHJ8aGVhZGluZ3xsaGVhZGluZ3xibG9ja3F1b3RlfGZlbmNlc3xsaXN0fGh0bWx8dGFibGV8ICtcXG4pW15cXG5dKykqKS8sXG4gIHRleHQ6IC9eW15cXG5dKy9cbn07XG5cbmJsb2NrLl9sYWJlbCA9IC8oPyFcXHMqXFxdKSg/OlxcXFwufFteXFxbXFxdXFxcXF0pKy87XG5ibG9jay5fdGl0bGUgPSAvKD86XCIoPzpcXFxcXCI/fFteXCJcXFxcXSkqXCJ8J1teJ1xcbl0qKD86XFxuW14nXFxuXSspKlxcbj8nfFxcKFteKCldKlxcKSkvO1xuYmxvY2suZGVmID0gZWRpdChibG9jay5kZWYpXG4gIC5yZXBsYWNlKCdsYWJlbCcsIGJsb2NrLl9sYWJlbClcbiAgLnJlcGxhY2UoJ3RpdGxlJywgYmxvY2suX3RpdGxlKVxuICAuZ2V0UmVnZXgoKTtcblxuYmxvY2suYnVsbGV0ID0gLyg/OlsqKy1dfFxcZHsxLDl9Wy4pXSkvO1xuYmxvY2subGlzdEl0ZW1TdGFydCA9IGVkaXQoL14oICopKGJ1bGwpICovKVxuICAucmVwbGFjZSgnYnVsbCcsIGJsb2NrLmJ1bGxldClcbiAgLmdldFJlZ2V4KCk7XG5cbmJsb2NrLmxpc3QgPSBlZGl0KGJsb2NrLmxpc3QpXG4gIC5yZXBsYWNlKC9idWxsL2csIGJsb2NrLmJ1bGxldClcbiAgLnJlcGxhY2UoJ2hyJywgJ1xcXFxuKyg/PVxcXFwxPyg/Oig/Oi0gKil7Myx9fCg/Ol8gKil7Myx9fCg/OlxcXFwqICopezMsfSkoPzpcXFxcbit8JCkpJylcbiAgLnJlcGxhY2UoJ2RlZicsICdcXFxcbisoPz0nICsgYmxvY2suZGVmLnNvdXJjZSArICcpJylcbiAgLmdldFJlZ2V4KCk7XG5cbmJsb2NrLl90YWcgPSAnYWRkcmVzc3xhcnRpY2xlfGFzaWRlfGJhc2V8YmFzZWZvbnR8YmxvY2txdW90ZXxib2R5fGNhcHRpb24nXG4gICsgJ3xjZW50ZXJ8Y29sfGNvbGdyb3VwfGRkfGRldGFpbHN8ZGlhbG9nfGRpcnxkaXZ8ZGx8ZHR8ZmllbGRzZXR8ZmlnY2FwdGlvbidcbiAgKyAnfGZpZ3VyZXxmb290ZXJ8Zm9ybXxmcmFtZXxmcmFtZXNldHxoWzEtNl18aGVhZHxoZWFkZXJ8aHJ8aHRtbHxpZnJhbWUnXG4gICsgJ3xsZWdlbmR8bGl8bGlua3xtYWlufG1lbnV8bWVudWl0ZW18bWV0YXxuYXZ8bm9mcmFtZXN8b2x8b3B0Z3JvdXB8b3B0aW9uJ1xuICArICd8cHxwYXJhbXxzZWN0aW9ufHNvdXJjZXxzdW1tYXJ5fHRhYmxlfHRib2R5fHRkfHRmb290fHRofHRoZWFkfHRpdGxlfHRyJ1xuICArICd8dHJhY2t8dWwnO1xuYmxvY2suX2NvbW1lbnQgPSAvPCEtLSg/IS0/PilbXFxzXFxTXSo/KD86LS0+fCQpLztcbmJsb2NrLmh0bWwgPSBlZGl0KGJsb2NrLmh0bWwsICdpJylcbiAgLnJlcGxhY2UoJ2NvbW1lbnQnLCBibG9jay5fY29tbWVudClcbiAgLnJlcGxhY2UoJ3RhZycsIGJsb2NrLl90YWcpXG4gIC5yZXBsYWNlKCdhdHRyaWJ1dGUnLCAvICtbYS16QS1aOl9dW1xcdy46LV0qKD86ICo9ICpcIlteXCJcXG5dKlwifCAqPSAqJ1teJ1xcbl0qJ3wgKj0gKlteXFxzXCInPTw+YF0rKT8vKVxuICAuZ2V0UmVnZXgoKTtcblxuYmxvY2sucGFyYWdyYXBoID0gZWRpdChibG9jay5fcGFyYWdyYXBoKVxuICAucmVwbGFjZSgnaHInLCBibG9jay5ocilcbiAgLnJlcGxhY2UoJ2hlYWRpbmcnLCAnIHswLDN9I3sxLDZ9ICcpXG4gIC5yZXBsYWNlKCd8bGhlYWRpbmcnLCAnJykgLy8gc2V0ZXggaGVhZGluZ3MgZG9uJ3QgaW50ZXJydXB0IGNvbW1vbm1hcmsgcGFyYWdyYXBoc1xuICAucmVwbGFjZSgnfHRhYmxlJywgJycpXG4gIC5yZXBsYWNlKCdibG9ja3F1b3RlJywgJyB7MCwzfT4nKVxuICAucmVwbGFjZSgnZmVuY2VzJywgJyB7MCwzfSg/OmB7Myx9KD89W15gXFxcXG5dKlxcXFxuKXx+ezMsfSlbXlxcXFxuXSpcXFxcbicpXG4gIC5yZXBsYWNlKCdsaXN0JywgJyB7MCwzfSg/OlsqKy1dfDFbLildKSAnKSAvLyBvbmx5IGxpc3RzIHN0YXJ0aW5nIGZyb20gMSBjYW4gaW50ZXJydXB0XG4gIC5yZXBsYWNlKCdodG1sJywgJzwvPyg/OnRhZykoPzogK3xcXFxcbnwvPz4pfDwoPzpzY3JpcHR8cHJlfHN0eWxlfHRleHRhcmVhfCEtLSknKVxuICAucmVwbGFjZSgndGFnJywgYmxvY2suX3RhZykgLy8gcGFycyBjYW4gYmUgaW50ZXJydXB0ZWQgYnkgdHlwZSAoNikgaHRtbCBibG9ja3NcbiAgLmdldFJlZ2V4KCk7XG5cbmJsb2NrLmJsb2NrcXVvdGUgPSBlZGl0KGJsb2NrLmJsb2NrcXVvdGUpXG4gIC5yZXBsYWNlKCdwYXJhZ3JhcGgnLCBibG9jay5wYXJhZ3JhcGgpXG4gIC5nZXRSZWdleCgpO1xuXG4vKipcbiAqIE5vcm1hbCBCbG9jayBHcmFtbWFyXG4gKi9cblxuYmxvY2subm9ybWFsID0geyAuLi5ibG9jayB9O1xuXG4vKipcbiAqIEdGTSBCbG9jayBHcmFtbWFyXG4gKi9cblxuYmxvY2suZ2ZtID0ge1xuICAuLi5ibG9jay5ub3JtYWwsXG4gIHRhYmxlOiAnXiAqKFteXFxcXG4gXS4qXFxcXHwuKilcXFxcbicgLy8gSGVhZGVyXG4gICAgKyAnIHswLDN9KD86XFxcXHwgKik/KDo/LSs6PyAqKD86XFxcXHwgKjo/LSs6PyAqKSopKD86XFxcXHwgKik/JyAvLyBBbGlnblxuICAgICsgJyg/OlxcXFxuKCg/Oig/ISAqXFxcXG58aHJ8aGVhZGluZ3xibG9ja3F1b3RlfGNvZGV8ZmVuY2VzfGxpc3R8aHRtbCkuKig/OlxcXFxufCQpKSopXFxcXG4qfCQpJyAvLyBDZWxsc1xufTtcblxuYmxvY2suZ2ZtLnRhYmxlID0gZWRpdChibG9jay5nZm0udGFibGUpXG4gIC5yZXBsYWNlKCdocicsIGJsb2NrLmhyKVxuICAucmVwbGFjZSgnaGVhZGluZycsICcgezAsM30jezEsNn0gJylcbiAgLnJlcGxhY2UoJ2Jsb2NrcXVvdGUnLCAnIHswLDN9PicpXG4gIC5yZXBsYWNlKCdjb2RlJywgJyB7NH1bXlxcXFxuXScpXG4gIC5yZXBsYWNlKCdmZW5jZXMnLCAnIHswLDN9KD86YHszLH0oPz1bXmBcXFxcbl0qXFxcXG4pfH57Myx9KVteXFxcXG5dKlxcXFxuJylcbiAgLnJlcGxhY2UoJ2xpc3QnLCAnIHswLDN9KD86WyorLV18MVsuKV0pICcpIC8vIG9ubHkgbGlzdHMgc3RhcnRpbmcgZnJvbSAxIGNhbiBpbnRlcnJ1cHRcbiAgLnJlcGxhY2UoJ2h0bWwnLCAnPC8/KD86dGFnKSg/OiArfFxcXFxufC8/Pil8PCg/OnNjcmlwdHxwcmV8c3R5bGV8dGV4dGFyZWF8IS0tKScpXG4gIC5yZXBsYWNlKCd0YWcnLCBibG9jay5fdGFnKSAvLyB0YWJsZXMgY2FuIGJlIGludGVycnVwdGVkIGJ5IHR5cGUgKDYpIGh0bWwgYmxvY2tzXG4gIC5nZXRSZWdleCgpO1xuXG5ibG9jay5nZm0ucGFyYWdyYXBoID0gZWRpdChibG9jay5fcGFyYWdyYXBoKVxuICAucmVwbGFjZSgnaHInLCBibG9jay5ocilcbiAgLnJlcGxhY2UoJ2hlYWRpbmcnLCAnIHswLDN9I3sxLDZ9ICcpXG4gIC5yZXBsYWNlKCd8bGhlYWRpbmcnLCAnJykgLy8gc2V0ZXggaGVhZGluZ3MgZG9uJ3QgaW50ZXJydXB0IGNvbW1vbm1hcmsgcGFyYWdyYXBoc1xuICAucmVwbGFjZSgndGFibGUnLCBibG9jay5nZm0udGFibGUpIC8vIGludGVycnVwdCBwYXJhZ3JhcGhzIHdpdGggdGFibGVcbiAgLnJlcGxhY2UoJ2Jsb2NrcXVvdGUnLCAnIHswLDN9PicpXG4gIC5yZXBsYWNlKCdmZW5jZXMnLCAnIHswLDN9KD86YHszLH0oPz1bXmBcXFxcbl0qXFxcXG4pfH57Myx9KVteXFxcXG5dKlxcXFxuJylcbiAgLnJlcGxhY2UoJ2xpc3QnLCAnIHswLDN9KD86WyorLV18MVsuKV0pICcpIC8vIG9ubHkgbGlzdHMgc3RhcnRpbmcgZnJvbSAxIGNhbiBpbnRlcnJ1cHRcbiAgLnJlcGxhY2UoJ2h0bWwnLCAnPC8/KD86dGFnKSg/OiArfFxcXFxufC8/Pil8PCg/OnNjcmlwdHxwcmV8c3R5bGV8dGV4dGFyZWF8IS0tKScpXG4gIC5yZXBsYWNlKCd0YWcnLCBibG9jay5fdGFnKSAvLyBwYXJzIGNhbiBiZSBpbnRlcnJ1cHRlZCBieSB0eXBlICg2KSBodG1sIGJsb2Nrc1xuICAuZ2V0UmVnZXgoKTtcbi8qKlxuICogUGVkYW50aWMgZ3JhbW1hciAob3JpZ2luYWwgSm9obiBHcnViZXIncyBsb29zZSBtYXJrZG93biBzcGVjaWZpY2F0aW9uKVxuICovXG5cbmJsb2NrLnBlZGFudGljID0ge1xuICAuLi5ibG9jay5ub3JtYWwsXG4gIGh0bWw6IGVkaXQoXG4gICAgJ14gKig/OmNvbW1lbnQgKig/OlxcXFxufFxcXFxzKiQpJ1xuICAgICsgJ3w8KHRhZylbXFxcXHNcXFxcU10rPzwvXFxcXDE+ICooPzpcXFxcbnsyLH18XFxcXHMqJCknIC8vIGNsb3NlZCB0YWdcbiAgICArICd8PHRhZyg/OlwiW15cIl0qXCJ8XFwnW15cXCddKlxcJ3xcXFxcc1teXFwnXCIvPlxcXFxzXSopKj8vPz4gKig/OlxcXFxuezIsfXxcXFxccyokKSknKVxuICAgIC5yZXBsYWNlKCdjb21tZW50JywgYmxvY2suX2NvbW1lbnQpXG4gICAgLnJlcGxhY2UoL3RhZy9nLCAnKD8hKD86J1xuICAgICAgKyAnYXxlbXxzdHJvbmd8c21hbGx8c3xjaXRlfHF8ZGZufGFiYnJ8ZGF0YXx0aW1lfGNvZGV8dmFyfHNhbXB8a2JkfHN1YidcbiAgICAgICsgJ3xzdXB8aXxifHV8bWFya3xydWJ5fHJ0fHJwfGJkaXxiZG98c3Bhbnxicnx3YnJ8aW5zfGRlbHxpbWcpJ1xuICAgICAgKyAnXFxcXGIpXFxcXHcrKD8hOnxbXlxcXFx3XFxcXHNAXSpAKVxcXFxiJylcbiAgICAuZ2V0UmVnZXgoKSxcbiAgZGVmOiAvXiAqXFxbKFteXFxdXSspXFxdOiAqPD8oW15cXHM+XSspPj8oPzogKyhbXCIoXVteXFxuXStbXCIpXSkpPyAqKD86XFxuK3wkKS8sXG4gIGhlYWRpbmc6IC9eKCN7MSw2fSkoLiopKD86XFxuK3wkKS8sXG4gIGZlbmNlczogbm9vcFRlc3QsIC8vIGZlbmNlcyBub3Qgc3VwcG9ydGVkXG4gIGxoZWFkaW5nOiAvXiguKz8pXFxuIHswLDN9KD0rfC0rKSAqKD86XFxuK3wkKS8sXG4gIHBhcmFncmFwaDogZWRpdChibG9jay5ub3JtYWwuX3BhcmFncmFwaClcbiAgICAucmVwbGFjZSgnaHInLCBibG9jay5ocilcbiAgICAucmVwbGFjZSgnaGVhZGluZycsICcgKiN7MSw2fSAqW15cXG5dJylcbiAgICAucmVwbGFjZSgnbGhlYWRpbmcnLCBibG9jay5saGVhZGluZylcbiAgICAucmVwbGFjZSgnYmxvY2txdW90ZScsICcgezAsM30+JylcbiAgICAucmVwbGFjZSgnfGZlbmNlcycsICcnKVxuICAgIC5yZXBsYWNlKCd8bGlzdCcsICcnKVxuICAgIC5yZXBsYWNlKCd8aHRtbCcsICcnKVxuICAgIC5nZXRSZWdleCgpXG59O1xuXG4vKipcbiAqIElubGluZS1MZXZlbCBHcmFtbWFyXG4gKi9cbmNvbnN0IGlubGluZSA9IHtcbiAgZXNjYXBlOiAvXlxcXFwoWyFcIiMkJSYnKCkqKyxcXC0uLzo7PD0+P0BcXFtcXF1cXFxcXl9ge3x9fl0pLyxcbiAgYXV0b2xpbms6IC9ePChzY2hlbWU6W15cXHNcXHgwMC1cXHgxZjw+XSp8ZW1haWwpPi8sXG4gIHVybDogbm9vcFRlc3QsXG4gIHRhZzogJ15jb21tZW50J1xuICAgICsgJ3xePC9bYS16QS1aXVtcXFxcdzotXSpcXFxccyo+JyAvLyBzZWxmLWNsb3NpbmcgdGFnXG4gICAgKyAnfF48W2EtekEtWl1bXFxcXHctXSooPzphdHRyaWJ1dGUpKj9cXFxccyovPz4nIC8vIG9wZW4gdGFnXG4gICAgKyAnfF48XFxcXD9bXFxcXHNcXFxcU10qP1xcXFw/PicgLy8gcHJvY2Vzc2luZyBpbnN0cnVjdGlvbiwgZS5nLiA8P3BocCA/PlxuICAgICsgJ3xePCFbYS16QS1aXStcXFxcc1tcXFxcc1xcXFxTXSo/PicgLy8gZGVjbGFyYXRpb24sIGUuZy4gPCFET0NUWVBFIGh0bWw+XG4gICAgKyAnfF48IVxcXFxbQ0RBVEFcXFxcW1tcXFxcc1xcXFxTXSo/XFxcXF1cXFxcXT4nLCAvLyBDREFUQSBzZWN0aW9uXG4gIGxpbms6IC9eIT9cXFsobGFiZWwpXFxdXFwoXFxzKihocmVmKSg/OlxccysodGl0bGUpKT9cXHMqXFwpLyxcbiAgcmVmbGluazogL14hP1xcWyhsYWJlbClcXF1cXFsocmVmKVxcXS8sXG4gIG5vbGluazogL14hP1xcWyhyZWYpXFxdKD86XFxbXFxdKT8vLFxuICByZWZsaW5rU2VhcmNoOiAncmVmbGlua3xub2xpbmsoPyFcXFxcKCknLFxuICBlbVN0cm9uZzoge1xuICAgIGxEZWxpbTogL14oPzpcXCorKD86KFtwdW5jdF9dKXxbXlxccypdKSl8Xl8rKD86KFtwdW5jdCpdKXwoW15cXHNfXSkpLyxcbiAgICAvLyAgICAgICAgKDEpIGFuZCAoMikgY2FuIG9ubHkgYmUgYSBSaWdodCBEZWxpbWl0ZXIuICgzKSBhbmQgKDQpIGNhbiBvbmx5IGJlIExlZnQuICAoNSkgYW5kICg2KSBjYW4gYmUgZWl0aGVyIExlZnQgb3IgUmlnaHQuXG4gICAgLy8gICAgICAgICAgKCkgU2tpcCBvcnBoYW4gaW5zaWRlIHN0cm9uZyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKCkgQ29uc3VtZSB0byBkZWxpbSAgICAgKDEpICMqKiogICAgICAgICAgICAgICAgKDIpIGEqKiojLCBhKioqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAoMykgIyoqKmEsICoqKmEgICAgICAgICAgICAgICAgICg0KSAqKiojICAgICAgICAgICAgICAoNSkgIyoqKiMgICAgICAgICAgICAgICAgICg2KSBhKioqYVxuICAgIHJEZWxpbUFzdDogL14oPzpbXl8qXFxcXF18XFxcXC4pKj9cXF9cXF8oPzpbXl8qXFxcXF18XFxcXC4pKj9cXCooPzpbXl8qXFxcXF18XFxcXC4pKj8oPz1cXF9cXF8pfCg/OlteKlxcXFxdfFxcXFwuKSsoPz1bXipdKXxbcHVuY3RfXShcXCorKSg/PVtcXHNdfCQpfCg/OltecHVuY3QqX1xcc1xcXFxdfFxcXFwuKShcXCorKSg/PVtwdW5jdF9cXHNdfCQpfFtwdW5jdF9cXHNdKFxcKispKD89W15wdW5jdCpfXFxzXSl8W1xcc10oXFwqKykoPz1bcHVuY3RfXSl8W3B1bmN0X10oXFwqKykoPz1bcHVuY3RfXSl8KD86W15wdW5jdCpfXFxzXFxcXF18XFxcXC4pKFxcKispKD89W15wdW5jdCpfXFxzXSkvLFxuICAgIHJEZWxpbVVuZDogL14oPzpbXl8qXFxcXF18XFxcXC4pKj9cXCpcXCooPzpbXl8qXFxcXF18XFxcXC4pKj9cXF8oPzpbXl8qXFxcXF18XFxcXC4pKj8oPz1cXCpcXCopfCg/OlteX1xcXFxdfFxcXFwuKSsoPz1bXl9dKXxbcHVuY3QqXShcXF8rKSg/PVtcXHNdfCQpfCg/OltecHVuY3QqX1xcc1xcXFxdfFxcXFwuKShcXF8rKSg/PVtwdW5jdCpcXHNdfCQpfFtwdW5jdCpcXHNdKFxcXyspKD89W15wdW5jdCpfXFxzXSl8W1xcc10oXFxfKykoPz1bcHVuY3QqXSl8W3B1bmN0Kl0oXFxfKykoPz1bcHVuY3QqXSkvIC8vIF4tIE5vdCBhbGxvd2VkIGZvciBfXG4gIH0sXG4gIGNvZGU6IC9eKGArKShbXmBdfFteYF1bXFxzXFxTXSo/W15gXSlcXDEoPyFgKS8sXG4gIGJyOiAvXiggezIsfXxcXFxcKVxcbig/IVxccyokKS8sXG4gIGRlbDogbm9vcFRlc3QsXG4gIHRleHQ6IC9eKGArfFteYF0pKD86KD89IHsyLH1cXG4pfFtcXHNcXFNdKj8oPzooPz1bXFxcXDwhXFxbYCpfXXxcXGJffCQpfFteIF0oPz0gezIsfVxcbikpKS8sXG4gIHB1bmN0dWF0aW9uOiAvXihbXFxzcHVuY3R1YXRpb25dKS9cbn07XG5cbi8vIGxpc3Qgb2YgcHVuY3R1YXRpb24gbWFya3MgZnJvbSBDb21tb25NYXJrIHNwZWNcbi8vIHdpdGhvdXQgKiBhbmQgXyB0byBoYW5kbGUgdGhlIGRpZmZlcmVudCBlbXBoYXNpcyBtYXJrZXJzICogYW5kIF9cbmlubGluZS5fcHVuY3R1YXRpb24gPSAnIVwiIyQlJlxcJygpK1xcXFwtLiwvOjs8PT4/QFxcXFxbXFxcXF1gXnt8fX4nO1xuaW5saW5lLnB1bmN0dWF0aW9uID0gZWRpdChpbmxpbmUucHVuY3R1YXRpb24pLnJlcGxhY2UoL3B1bmN0dWF0aW9uL2csIGlubGluZS5fcHVuY3R1YXRpb24pLmdldFJlZ2V4KCk7XG5cbi8vIHNlcXVlbmNlcyBlbSBzaG91bGQgc2tpcCBvdmVyIFt0aXRsZV0obGluayksIGBjb2RlYCwgPGh0bWw+XG5pbmxpbmUuYmxvY2tTa2lwID0gL1xcW1teXFxdXSo/XFxdXFwoW15cXCldKj9cXCl8YFteYF0qP2B8PFtePl0qPz4vZztcbi8vIGxvb2tiZWhpbmQgaXMgbm90IGF2YWlsYWJsZSBvbiBTYWZhcmkgYXMgb2YgdmVyc2lvbiAxNlxuLy8gaW5saW5lLmVzY2FwZWRFbVN0ID0gLyg/PD0oPzpefFteXFxcXCkoPzpcXFxcW15dKSopXFxcXFsqX10vZztcbmlubGluZS5lc2NhcGVkRW1TdCA9IC8oPzpefFteXFxcXF0pKD86XFxcXFxcXFwpKlxcXFxbKl9dL2c7XG5cbmlubGluZS5fY29tbWVudCA9IGVkaXQoYmxvY2suX2NvbW1lbnQpLnJlcGxhY2UoJyg/Oi0tPnwkKScsICctLT4nKS5nZXRSZWdleCgpO1xuXG5pbmxpbmUuZW1TdHJvbmcubERlbGltID0gZWRpdChpbmxpbmUuZW1TdHJvbmcubERlbGltKVxuICAucmVwbGFjZSgvcHVuY3QvZywgaW5saW5lLl9wdW5jdHVhdGlvbilcbiAgLmdldFJlZ2V4KCk7XG5cbmlubGluZS5lbVN0cm9uZy5yRGVsaW1Bc3QgPSBlZGl0KGlubGluZS5lbVN0cm9uZy5yRGVsaW1Bc3QsICdnJylcbiAgLnJlcGxhY2UoL3B1bmN0L2csIGlubGluZS5fcHVuY3R1YXRpb24pXG4gIC5nZXRSZWdleCgpO1xuXG5pbmxpbmUuZW1TdHJvbmcuckRlbGltVW5kID0gZWRpdChpbmxpbmUuZW1TdHJvbmcuckRlbGltVW5kLCAnZycpXG4gIC5yZXBsYWNlKC9wdW5jdC9nLCBpbmxpbmUuX3B1bmN0dWF0aW9uKVxuICAuZ2V0UmVnZXgoKTtcblxuaW5saW5lLl9lc2NhcGVzID0gL1xcXFwoWyFcIiMkJSYnKCkqKyxcXC0uLzo7PD0+P0BcXFtcXF1cXFxcXl9ge3x9fl0pL2c7XG5cbmlubGluZS5fc2NoZW1lID0gL1thLXpBLVpdW2EtekEtWjAtOSsuLV17MSwzMX0vO1xuaW5saW5lLl9lbWFpbCA9IC9bYS16QS1aMC05LiEjJCUmJyorLz0/Xl9ge3x9fi1dKyhAKVthLXpBLVowLTldKD86W2EtekEtWjAtOS1dezAsNjF9W2EtekEtWjAtOV0pPyg/OlxcLlthLXpBLVowLTldKD86W2EtekEtWjAtOS1dezAsNjF9W2EtekEtWjAtOV0pPykrKD8hWy1fXSkvO1xuaW5saW5lLmF1dG9saW5rID0gZWRpdChpbmxpbmUuYXV0b2xpbmspXG4gIC5yZXBsYWNlKCdzY2hlbWUnLCBpbmxpbmUuX3NjaGVtZSlcbiAgLnJlcGxhY2UoJ2VtYWlsJywgaW5saW5lLl9lbWFpbClcbiAgLmdldFJlZ2V4KCk7XG5cbmlubGluZS5fYXR0cmlidXRlID0gL1xccytbYS16QS1aOl9dW1xcdy46LV0qKD86XFxzKj1cXHMqXCJbXlwiXSpcInxcXHMqPVxccyonW14nXSonfFxccyo9XFxzKlteXFxzXCInPTw+YF0rKT8vO1xuXG5pbmxpbmUudGFnID0gZWRpdChpbmxpbmUudGFnKVxuICAucmVwbGFjZSgnY29tbWVudCcsIGlubGluZS5fY29tbWVudClcbiAgLnJlcGxhY2UoJ2F0dHJpYnV0ZScsIGlubGluZS5fYXR0cmlidXRlKVxuICAuZ2V0UmVnZXgoKTtcblxuaW5saW5lLl9sYWJlbCA9IC8oPzpcXFsoPzpcXFxcLnxbXlxcW1xcXVxcXFxdKSpcXF18XFxcXC58YFteYF0qYHxbXlxcW1xcXVxcXFxgXSkqPy87XG5pbmxpbmUuX2hyZWYgPSAvPCg/OlxcXFwufFteXFxuPD5cXFxcXSkrPnxbXlxcc1xceDAwLVxceDFmXSovO1xuaW5saW5lLl90aXRsZSA9IC9cIig/OlxcXFxcIj98W15cIlxcXFxdKSpcInwnKD86XFxcXCc/fFteJ1xcXFxdKSonfFxcKCg/OlxcXFxcXCk/fFteKVxcXFxdKSpcXCkvO1xuXG5pbmxpbmUubGluayA9IGVkaXQoaW5saW5lLmxpbmspXG4gIC5yZXBsYWNlKCdsYWJlbCcsIGlubGluZS5fbGFiZWwpXG4gIC5yZXBsYWNlKCdocmVmJywgaW5saW5lLl9ocmVmKVxuICAucmVwbGFjZSgndGl0bGUnLCBpbmxpbmUuX3RpdGxlKVxuICAuZ2V0UmVnZXgoKTtcblxuaW5saW5lLnJlZmxpbmsgPSBlZGl0KGlubGluZS5yZWZsaW5rKVxuICAucmVwbGFjZSgnbGFiZWwnLCBpbmxpbmUuX2xhYmVsKVxuICAucmVwbGFjZSgncmVmJywgYmxvY2suX2xhYmVsKVxuICAuZ2V0UmVnZXgoKTtcblxuaW5saW5lLm5vbGluayA9IGVkaXQoaW5saW5lLm5vbGluaylcbiAgLnJlcGxhY2UoJ3JlZicsIGJsb2NrLl9sYWJlbClcbiAgLmdldFJlZ2V4KCk7XG5cbmlubGluZS5yZWZsaW5rU2VhcmNoID0gZWRpdChpbmxpbmUucmVmbGlua1NlYXJjaCwgJ2cnKVxuICAucmVwbGFjZSgncmVmbGluaycsIGlubGluZS5yZWZsaW5rKVxuICAucmVwbGFjZSgnbm9saW5rJywgaW5saW5lLm5vbGluaylcbiAgLmdldFJlZ2V4KCk7XG5cbi8qKlxuICogTm9ybWFsIElubGluZSBHcmFtbWFyXG4gKi9cblxuaW5saW5lLm5vcm1hbCA9IHsgLi4uaW5saW5lIH07XG5cbi8qKlxuICogUGVkYW50aWMgSW5saW5lIEdyYW1tYXJcbiAqL1xuXG5pbmxpbmUucGVkYW50aWMgPSB7XG4gIC4uLmlubGluZS5ub3JtYWwsXG4gIHN0cm9uZzoge1xuICAgIHN0YXJ0OiAvXl9ffFxcKlxcKi8sXG4gICAgbWlkZGxlOiAvXl9fKD89XFxTKShbXFxzXFxTXSo/XFxTKV9fKD8hXyl8XlxcKlxcKig/PVxcUykoW1xcc1xcU10qP1xcUylcXCpcXCooPyFcXCopLyxcbiAgICBlbmRBc3Q6IC9cXCpcXCooPyFcXCopL2csXG4gICAgZW5kVW5kOiAvX18oPyFfKS9nXG4gIH0sXG4gIGVtOiB7XG4gICAgc3RhcnQ6IC9eX3xcXCovLFxuICAgIG1pZGRsZTogL14oKVxcKig/PVxcUykoW1xcc1xcU10qP1xcUylcXCooPyFcXCopfF5fKD89XFxTKShbXFxzXFxTXSo/XFxTKV8oPyFfKS8sXG4gICAgZW5kQXN0OiAvXFwqKD8hXFwqKS9nLFxuICAgIGVuZFVuZDogL18oPyFfKS9nXG4gIH0sXG4gIGxpbms6IGVkaXQoL14hP1xcWyhsYWJlbClcXF1cXCgoLio/KVxcKS8pXG4gICAgLnJlcGxhY2UoJ2xhYmVsJywgaW5saW5lLl9sYWJlbClcbiAgICAuZ2V0UmVnZXgoKSxcbiAgcmVmbGluazogZWRpdCgvXiE/XFxbKGxhYmVsKVxcXVxccypcXFsoW15cXF1dKilcXF0vKVxuICAgIC5yZXBsYWNlKCdsYWJlbCcsIGlubGluZS5fbGFiZWwpXG4gICAgLmdldFJlZ2V4KClcbn07XG5cbi8qKlxuICogR0ZNIElubGluZSBHcmFtbWFyXG4gKi9cblxuaW5saW5lLmdmbSA9IHtcbiAgLi4uaW5saW5lLm5vcm1hbCxcbiAgZXNjYXBlOiBlZGl0KGlubGluZS5lc2NhcGUpLnJlcGxhY2UoJ10pJywgJ358XSknKS5nZXRSZWdleCgpLFxuICBfZXh0ZW5kZWRfZW1haWw6IC9bQS1aYS16MC05Ll8rLV0rKEApW2EtekEtWjAtOS1fXSsoPzpcXC5bYS16QS1aMC05LV9dKlthLXpBLVowLTldKSsoPyFbLV9dKS8sXG4gIHVybDogL14oKD86ZnRwfGh0dHBzPyk6XFwvXFwvfHd3d1xcLikoPzpbYS16QS1aMC05XFwtXStcXC4/KStbXlxcczxdKnxeZW1haWwvLFxuICBfYmFja3BlZGFsOiAvKD86W14/IS4sOjsqXydcIn4oKSZdK3xcXChbXildKlxcKXwmKD8hW2EtekEtWjAtOV0rOyQpfFs/IS4sOjsqXydcIn4pXSsoPyEkKSkrLyxcbiAgZGVsOiAvXih+fj8pKD89W15cXHN+XSkoW1xcc1xcU10qP1teXFxzfl0pXFwxKD89W15+XXwkKS8sXG4gIHRleHQ6IC9eKFtgfl0rfFteYH5dKSg/Oig/PSB7Mix9XFxuKXwoPz1bYS16QS1aMC05LiEjJCUmJyorXFwvPT9fYHtcXHx9fi1dK0ApfFtcXHNcXFNdKj8oPzooPz1bXFxcXDwhXFxbYCp+X118XFxiX3xodHRwcz86XFwvXFwvfGZ0cDpcXC9cXC98d3d3XFwufCQpfFteIF0oPz0gezIsfVxcbil8W15hLXpBLVowLTkuISMkJSYnKitcXC89P19ge1xcfH1+LV0oPz1bYS16QS1aMC05LiEjJCUmJyorXFwvPT9fYHtcXHx9fi1dK0ApKSkvXG59O1xuXG5pbmxpbmUuZ2ZtLnVybCA9IGVkaXQoaW5saW5lLmdmbS51cmwsICdpJylcbiAgLnJlcGxhY2UoJ2VtYWlsJywgaW5saW5lLmdmbS5fZXh0ZW5kZWRfZW1haWwpXG4gIC5nZXRSZWdleCgpO1xuLyoqXG4gKiBHRk0gKyBMaW5lIEJyZWFrcyBJbmxpbmUgR3JhbW1hclxuICovXG5cbmlubGluZS5icmVha3MgPSB7XG4gIC4uLmlubGluZS5nZm0sXG4gIGJyOiBlZGl0KGlubGluZS5icikucmVwbGFjZSgnezIsfScsICcqJykuZ2V0UmVnZXgoKSxcbiAgdGV4dDogZWRpdChpbmxpbmUuZ2ZtLnRleHQpXG4gICAgLnJlcGxhY2UoJ1xcXFxiXycsICdcXFxcYl98IHsyLH1cXFxcbicpXG4gICAgLnJlcGxhY2UoL1xcezIsXFx9L2csICcqJylcbiAgICAuZ2V0UmVnZXgoKVxufTtcblxuLyoqXG4gKiBzbWFydHlwYW50cyB0ZXh0IHJlcGxhY2VtZW50XG4gKiBAcGFyYW0ge3N0cmluZ30gdGV4dFxuICovXG5mdW5jdGlvbiBzbWFydHlwYW50cyh0ZXh0KSB7XG4gIHJldHVybiB0ZXh0XG4gICAgLy8gZW0tZGFzaGVzXG4gICAgLnJlcGxhY2UoLy0tLS9nLCAnXFx1MjAxNCcpXG4gICAgLy8gZW4tZGFzaGVzXG4gICAgLnJlcGxhY2UoLy0tL2csICdcXHUyMDEzJylcbiAgICAvLyBvcGVuaW5nIHNpbmdsZXNcbiAgICAucmVwbGFjZSgvKF58Wy1cXHUyMDE0LyhcXFt7XCJcXHNdKScvZywgJyQxXFx1MjAxOCcpXG4gICAgLy8gY2xvc2luZyBzaW5nbGVzICYgYXBvc3Ryb3BoZXNcbiAgICAucmVwbGFjZSgvJy9nLCAnXFx1MjAxOScpXG4gICAgLy8gb3BlbmluZyBkb3VibGVzXG4gICAgLnJlcGxhY2UoLyhefFstXFx1MjAxNC8oXFxbe1xcdTIwMThcXHNdKVwiL2csICckMVxcdTIwMWMnKVxuICAgIC8vIGNsb3NpbmcgZG91Ymxlc1xuICAgIC5yZXBsYWNlKC9cIi9nLCAnXFx1MjAxZCcpXG4gICAgLy8gZWxsaXBzZXNcbiAgICAucmVwbGFjZSgvXFwuezN9L2csICdcXHUyMDI2Jyk7XG59XG5cbi8qKlxuICogbWFuZ2xlIGVtYWlsIGFkZHJlc3Nlc1xuICogQHBhcmFtIHtzdHJpbmd9IHRleHRcbiAqL1xuZnVuY3Rpb24gbWFuZ2xlKHRleHQpIHtcbiAgbGV0IG91dCA9ICcnLFxuICAgIGksXG4gICAgY2g7XG5cbiAgY29uc3QgbCA9IHRleHQubGVuZ3RoO1xuICBmb3IgKGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgY2ggPSB0ZXh0LmNoYXJDb2RlQXQoaSk7XG4gICAgaWYgKE1hdGgucmFuZG9tKCkgPiAwLjUpIHtcbiAgICAgIGNoID0gJ3gnICsgY2gudG9TdHJpbmcoMTYpO1xuICAgIH1cbiAgICBvdXQgKz0gJyYjJyArIGNoICsgJzsnO1xuICB9XG5cbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBCbG9jayBMZXhlclxuICovXG5jbGFzcyBMZXhlciB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICB0aGlzLnRva2VucyA9IFtdO1xuICAgIHRoaXMudG9rZW5zLmxpbmtzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IGRlZmF1bHRzO1xuICAgIHRoaXMub3B0aW9ucy50b2tlbml6ZXIgPSB0aGlzLm9wdGlvbnMudG9rZW5pemVyIHx8IG5ldyBUb2tlbml6ZXIoKTtcbiAgICB0aGlzLnRva2VuaXplciA9IHRoaXMub3B0aW9ucy50b2tlbml6ZXI7XG4gICAgdGhpcy50b2tlbml6ZXIub3B0aW9ucyA9IHRoaXMub3B0aW9ucztcbiAgICB0aGlzLnRva2VuaXplci5sZXhlciA9IHRoaXM7XG4gICAgdGhpcy5pbmxpbmVRdWV1ZSA9IFtdO1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBpbkxpbms6IGZhbHNlLFxuICAgICAgaW5SYXdCbG9jazogZmFsc2UsXG4gICAgICB0b3A6IHRydWVcbiAgICB9O1xuXG4gICAgY29uc3QgcnVsZXMgPSB7XG4gICAgICBibG9jazogYmxvY2subm9ybWFsLFxuICAgICAgaW5saW5lOiBpbmxpbmUubm9ybWFsXG4gICAgfTtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMucGVkYW50aWMpIHtcbiAgICAgIHJ1bGVzLmJsb2NrID0gYmxvY2sucGVkYW50aWM7XG4gICAgICBydWxlcy5pbmxpbmUgPSBpbmxpbmUucGVkYW50aWM7XG4gICAgfSBlbHNlIGlmICh0aGlzLm9wdGlvbnMuZ2ZtKSB7XG4gICAgICBydWxlcy5ibG9jayA9IGJsb2NrLmdmbTtcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuYnJlYWtzKSB7XG4gICAgICAgIHJ1bGVzLmlubGluZSA9IGlubGluZS5icmVha3M7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBydWxlcy5pbmxpbmUgPSBpbmxpbmUuZ2ZtO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnRva2VuaXplci5ydWxlcyA9IHJ1bGVzO1xuICB9XG5cbiAgLyoqXG4gICAqIEV4cG9zZSBSdWxlc1xuICAgKi9cbiAgc3RhdGljIGdldCBydWxlcygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgYmxvY2ssXG4gICAgICBpbmxpbmVcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YXRpYyBMZXggTWV0aG9kXG4gICAqL1xuICBzdGF0aWMgbGV4KHNyYywgb3B0aW9ucykge1xuICAgIGNvbnN0IGxleGVyID0gbmV3IExleGVyKG9wdGlvbnMpO1xuICAgIHJldHVybiBsZXhlci5sZXgoc3JjKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGF0aWMgTGV4IElubGluZSBNZXRob2RcbiAgICovXG4gIHN0YXRpYyBsZXhJbmxpbmUoc3JjLCBvcHRpb25zKSB7XG4gICAgY29uc3QgbGV4ZXIgPSBuZXcgTGV4ZXIob3B0aW9ucyk7XG4gICAgcmV0dXJuIGxleGVyLmlubGluZVRva2VucyhzcmMpO1xuICB9XG5cbiAgLyoqXG4gICAqIFByZXByb2Nlc3NpbmdcbiAgICovXG4gIGxleChzcmMpIHtcbiAgICBzcmMgPSBzcmNcbiAgICAgIC5yZXBsYWNlKC9cXHJcXG58XFxyL2csICdcXG4nKTtcblxuICAgIHRoaXMuYmxvY2tUb2tlbnMoc3JjLCB0aGlzLnRva2Vucyk7XG5cbiAgICBsZXQgbmV4dDtcbiAgICB3aGlsZSAobmV4dCA9IHRoaXMuaW5saW5lUXVldWUuc2hpZnQoKSkge1xuICAgICAgdGhpcy5pbmxpbmVUb2tlbnMobmV4dC5zcmMsIG5leHQudG9rZW5zKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy50b2tlbnM7XG4gIH1cblxuICAvKipcbiAgICogTGV4aW5nXG4gICAqL1xuICBibG9ja1Rva2VucyhzcmMsIHRva2VucyA9IFtdKSB7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5wZWRhbnRpYykge1xuICAgICAgc3JjID0gc3JjLnJlcGxhY2UoL1xcdC9nLCAnICAgICcpLnJlcGxhY2UoL14gKyQvZ20sICcnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3JjID0gc3JjLnJlcGxhY2UoL14oICopKFxcdCspL2dtLCAoXywgbGVhZGluZywgdGFicykgPT4ge1xuICAgICAgICByZXR1cm4gbGVhZGluZyArICcgICAgJy5yZXBlYXQodGFicy5sZW5ndGgpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgbGV0IHRva2VuLCBsYXN0VG9rZW4sIGN1dFNyYywgbGFzdFBhcmFncmFwaENsaXBwZWQ7XG5cbiAgICB3aGlsZSAoc3JjKSB7XG4gICAgICBpZiAodGhpcy5vcHRpb25zLmV4dGVuc2lvbnNcbiAgICAgICAgJiYgdGhpcy5vcHRpb25zLmV4dGVuc2lvbnMuYmxvY2tcbiAgICAgICAgJiYgdGhpcy5vcHRpb25zLmV4dGVuc2lvbnMuYmxvY2suc29tZSgoZXh0VG9rZW5pemVyKSA9PiB7XG4gICAgICAgICAgaWYgKHRva2VuID0gZXh0VG9rZW5pemVyLmNhbGwoeyBsZXhlcjogdGhpcyB9LCBzcmMsIHRva2VucykpIHtcbiAgICAgICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9KSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gbmV3bGluZVxuICAgICAgaWYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIuc3BhY2Uoc3JjKSkge1xuICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICBpZiAodG9rZW4ucmF3Lmxlbmd0aCA9PT0gMSAmJiB0b2tlbnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgIC8vIGlmIHRoZXJlJ3MgYSBzaW5nbGUgXFxuIGFzIGEgc3BhY2VyLCBpdCdzIHRlcm1pbmF0aW5nIHRoZSBsYXN0IGxpbmUsXG4gICAgICAgICAgLy8gc28gbW92ZSBpdCB0aGVyZSBzbyB0aGF0IHdlIGRvbid0IGdldCB1bmVjZXNzYXJ5IHBhcmFncmFwaCB0YWdzXG4gICAgICAgICAgdG9rZW5zW3Rva2Vucy5sZW5ndGggLSAxXS5yYXcgKz0gJ1xcbic7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICB9XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBjb2RlXG4gICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci5jb2RlKHNyYykpIHtcbiAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgbGFzdFRva2VuID0gdG9rZW5zW3Rva2Vucy5sZW5ndGggLSAxXTtcbiAgICAgICAgLy8gQW4gaW5kZW50ZWQgY29kZSBibG9jayBjYW5ub3QgaW50ZXJydXB0IGEgcGFyYWdyYXBoLlxuICAgICAgICBpZiAobGFzdFRva2VuICYmIChsYXN0VG9rZW4udHlwZSA9PT0gJ3BhcmFncmFwaCcgfHwgbGFzdFRva2VuLnR5cGUgPT09ICd0ZXh0JykpIHtcbiAgICAgICAgICBsYXN0VG9rZW4ucmF3ICs9ICdcXG4nICsgdG9rZW4ucmF3O1xuICAgICAgICAgIGxhc3RUb2tlbi50ZXh0ICs9ICdcXG4nICsgdG9rZW4udGV4dDtcbiAgICAgICAgICB0aGlzLmlubGluZVF1ZXVlW3RoaXMuaW5saW5lUXVldWUubGVuZ3RoIC0gMV0uc3JjID0gbGFzdFRva2VuLnRleHQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICB9XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBmZW5jZXNcbiAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLmZlbmNlcyhzcmMpKSB7XG4gICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIGhlYWRpbmdcbiAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLmhlYWRpbmcoc3JjKSkge1xuICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBoclxuICAgICAgaWYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIuaHIoc3JjKSkge1xuICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBibG9ja3F1b3RlXG4gICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci5ibG9ja3F1b3RlKHNyYykpIHtcbiAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gbGlzdFxuICAgICAgaWYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIubGlzdChzcmMpKSB7XG4gICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIGh0bWxcbiAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLmh0bWwoc3JjKSkge1xuICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBkZWZcbiAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLmRlZihzcmMpKSB7XG4gICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgIGxhc3RUb2tlbiA9IHRva2Vuc1t0b2tlbnMubGVuZ3RoIC0gMV07XG4gICAgICAgIGlmIChsYXN0VG9rZW4gJiYgKGxhc3RUb2tlbi50eXBlID09PSAncGFyYWdyYXBoJyB8fCBsYXN0VG9rZW4udHlwZSA9PT0gJ3RleHQnKSkge1xuICAgICAgICAgIGxhc3RUb2tlbi5yYXcgKz0gJ1xcbicgKyB0b2tlbi5yYXc7XG4gICAgICAgICAgbGFzdFRva2VuLnRleHQgKz0gJ1xcbicgKyB0b2tlbi5yYXc7XG4gICAgICAgICAgdGhpcy5pbmxpbmVRdWV1ZVt0aGlzLmlubGluZVF1ZXVlLmxlbmd0aCAtIDFdLnNyYyA9IGxhc3RUb2tlbi50ZXh0O1xuICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLnRva2Vucy5saW5rc1t0b2tlbi50YWddKSB7XG4gICAgICAgICAgdGhpcy50b2tlbnMubGlua3NbdG9rZW4udGFnXSA9IHtcbiAgICAgICAgICAgIGhyZWY6IHRva2VuLmhyZWYsXG4gICAgICAgICAgICB0aXRsZTogdG9rZW4udGl0bGVcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyB0YWJsZSAoZ2ZtKVxuICAgICAgaWYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIudGFibGUoc3JjKSkge1xuICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBsaGVhZGluZ1xuICAgICAgaWYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIubGhlYWRpbmcoc3JjKSkge1xuICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyB0b3AtbGV2ZWwgcGFyYWdyYXBoXG4gICAgICAvLyBwcmV2ZW50IHBhcmFncmFwaCBjb25zdW1pbmcgZXh0ZW5zaW9ucyBieSBjbGlwcGluZyAnc3JjJyB0byBleHRlbnNpb24gc3RhcnRcbiAgICAgIGN1dFNyYyA9IHNyYztcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuZXh0ZW5zaW9ucyAmJiB0aGlzLm9wdGlvbnMuZXh0ZW5zaW9ucy5zdGFydEJsb2NrKSB7XG4gICAgICAgIGxldCBzdGFydEluZGV4ID0gSW5maW5pdHk7XG4gICAgICAgIGNvbnN0IHRlbXBTcmMgPSBzcmMuc2xpY2UoMSk7XG4gICAgICAgIGxldCB0ZW1wU3RhcnQ7XG4gICAgICAgIHRoaXMub3B0aW9ucy5leHRlbnNpb25zLnN0YXJ0QmxvY2suZm9yRWFjaChmdW5jdGlvbihnZXRTdGFydEluZGV4KSB7XG4gICAgICAgICAgdGVtcFN0YXJ0ID0gZ2V0U3RhcnRJbmRleC5jYWxsKHsgbGV4ZXI6IHRoaXMgfSwgdGVtcFNyYyk7XG4gICAgICAgICAgaWYgKHR5cGVvZiB0ZW1wU3RhcnQgPT09ICdudW1iZXInICYmIHRlbXBTdGFydCA+PSAwKSB7IHN0YXJ0SW5kZXggPSBNYXRoLm1pbihzdGFydEluZGV4LCB0ZW1wU3RhcnQpOyB9XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoc3RhcnRJbmRleCA8IEluZmluaXR5ICYmIHN0YXJ0SW5kZXggPj0gMCkge1xuICAgICAgICAgIGN1dFNyYyA9IHNyYy5zdWJzdHJpbmcoMCwgc3RhcnRJbmRleCArIDEpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAodGhpcy5zdGF0ZS50b3AgJiYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIucGFyYWdyYXBoKGN1dFNyYykpKSB7XG4gICAgICAgIGxhc3RUb2tlbiA9IHRva2Vuc1t0b2tlbnMubGVuZ3RoIC0gMV07XG4gICAgICAgIGlmIChsYXN0UGFyYWdyYXBoQ2xpcHBlZCAmJiBsYXN0VG9rZW4udHlwZSA9PT0gJ3BhcmFncmFwaCcpIHtcbiAgICAgICAgICBsYXN0VG9rZW4ucmF3ICs9ICdcXG4nICsgdG9rZW4ucmF3O1xuICAgICAgICAgIGxhc3RUb2tlbi50ZXh0ICs9ICdcXG4nICsgdG9rZW4udGV4dDtcbiAgICAgICAgICB0aGlzLmlubGluZVF1ZXVlLnBvcCgpO1xuICAgICAgICAgIHRoaXMuaW5saW5lUXVldWVbdGhpcy5pbmxpbmVRdWV1ZS5sZW5ndGggLSAxXS5zcmMgPSBsYXN0VG9rZW4udGV4dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgIH1cbiAgICAgICAgbGFzdFBhcmFncmFwaENsaXBwZWQgPSAoY3V0U3JjLmxlbmd0aCAhPT0gc3JjLmxlbmd0aCk7XG4gICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyB0ZXh0XG4gICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci50ZXh0KHNyYykpIHtcbiAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgbGFzdFRva2VuID0gdG9rZW5zW3Rva2Vucy5sZW5ndGggLSAxXTtcbiAgICAgICAgaWYgKGxhc3RUb2tlbiAmJiBsYXN0VG9rZW4udHlwZSA9PT0gJ3RleHQnKSB7XG4gICAgICAgICAgbGFzdFRva2VuLnJhdyArPSAnXFxuJyArIHRva2VuLnJhdztcbiAgICAgICAgICBsYXN0VG9rZW4udGV4dCArPSAnXFxuJyArIHRva2VuLnRleHQ7XG4gICAgICAgICAgdGhpcy5pbmxpbmVRdWV1ZS5wb3AoKTtcbiAgICAgICAgICB0aGlzLmlubGluZVF1ZXVlW3RoaXMuaW5saW5lUXVldWUubGVuZ3RoIC0gMV0uc3JjID0gbGFzdFRva2VuLnRleHQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICB9XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAoc3JjKSB7XG4gICAgICAgIGNvbnN0IGVyck1zZyA9ICdJbmZpbml0ZSBsb29wIG9uIGJ5dGU6ICcgKyBzcmMuY2hhckNvZGVBdCgwKTtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5zaWxlbnQpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGVyck1zZyk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVyck1zZyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnN0YXRlLnRvcCA9IHRydWU7XG4gICAgcmV0dXJuIHRva2VucztcbiAgfVxuXG4gIGlubGluZShzcmMsIHRva2VucyA9IFtdKSB7XG4gICAgdGhpcy5pbmxpbmVRdWV1ZS5wdXNoKHsgc3JjLCB0b2tlbnMgfSk7XG4gICAgcmV0dXJuIHRva2VucztcbiAgfVxuXG4gIC8qKlxuICAgKiBMZXhpbmcvQ29tcGlsaW5nXG4gICAqL1xuICBpbmxpbmVUb2tlbnMoc3JjLCB0b2tlbnMgPSBbXSkge1xuICAgIGxldCB0b2tlbiwgbGFzdFRva2VuLCBjdXRTcmM7XG5cbiAgICAvLyBTdHJpbmcgd2l0aCBsaW5rcyBtYXNrZWQgdG8gYXZvaWQgaW50ZXJmZXJlbmNlIHdpdGggZW0gYW5kIHN0cm9uZ1xuICAgIGxldCBtYXNrZWRTcmMgPSBzcmM7XG4gICAgbGV0IG1hdGNoO1xuICAgIGxldCBrZWVwUHJldkNoYXIsIHByZXZDaGFyO1xuXG4gICAgLy8gTWFzayBvdXQgcmVmbGlua3NcbiAgICBpZiAodGhpcy50b2tlbnMubGlua3MpIHtcbiAgICAgIGNvbnN0IGxpbmtzID0gT2JqZWN0LmtleXModGhpcy50b2tlbnMubGlua3MpO1xuICAgICAgaWYgKGxpbmtzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgd2hpbGUgKChtYXRjaCA9IHRoaXMudG9rZW5pemVyLnJ1bGVzLmlubGluZS5yZWZsaW5rU2VhcmNoLmV4ZWMobWFza2VkU3JjKSkgIT0gbnVsbCkge1xuICAgICAgICAgIGlmIChsaW5rcy5pbmNsdWRlcyhtYXRjaFswXS5zbGljZShtYXRjaFswXS5sYXN0SW5kZXhPZignWycpICsgMSwgLTEpKSkge1xuICAgICAgICAgICAgbWFza2VkU3JjID0gbWFza2VkU3JjLnNsaWNlKDAsIG1hdGNoLmluZGV4KSArICdbJyArIHJlcGVhdFN0cmluZygnYScsIG1hdGNoWzBdLmxlbmd0aCAtIDIpICsgJ10nICsgbWFza2VkU3JjLnNsaWNlKHRoaXMudG9rZW5pemVyLnJ1bGVzLmlubGluZS5yZWZsaW5rU2VhcmNoLmxhc3RJbmRleCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIC8vIE1hc2sgb3V0IG90aGVyIGJsb2Nrc1xuICAgIHdoaWxlICgobWF0Y2ggPSB0aGlzLnRva2VuaXplci5ydWxlcy5pbmxpbmUuYmxvY2tTa2lwLmV4ZWMobWFza2VkU3JjKSkgIT0gbnVsbCkge1xuICAgICAgbWFza2VkU3JjID0gbWFza2VkU3JjLnNsaWNlKDAsIG1hdGNoLmluZGV4KSArICdbJyArIHJlcGVhdFN0cmluZygnYScsIG1hdGNoWzBdLmxlbmd0aCAtIDIpICsgJ10nICsgbWFza2VkU3JjLnNsaWNlKHRoaXMudG9rZW5pemVyLnJ1bGVzLmlubGluZS5ibG9ja1NraXAubGFzdEluZGV4KTtcbiAgICB9XG5cbiAgICAvLyBNYXNrIG91dCBlc2NhcGVkIGVtICYgc3Ryb25nIGRlbGltaXRlcnNcbiAgICB3aGlsZSAoKG1hdGNoID0gdGhpcy50b2tlbml6ZXIucnVsZXMuaW5saW5lLmVzY2FwZWRFbVN0LmV4ZWMobWFza2VkU3JjKSkgIT0gbnVsbCkge1xuICAgICAgbWFza2VkU3JjID0gbWFza2VkU3JjLnNsaWNlKDAsIG1hdGNoLmluZGV4ICsgbWF0Y2hbMF0ubGVuZ3RoIC0gMikgKyAnKysnICsgbWFza2VkU3JjLnNsaWNlKHRoaXMudG9rZW5pemVyLnJ1bGVzLmlubGluZS5lc2NhcGVkRW1TdC5sYXN0SW5kZXgpO1xuICAgICAgdGhpcy50b2tlbml6ZXIucnVsZXMuaW5saW5lLmVzY2FwZWRFbVN0Lmxhc3RJbmRleC0tO1xuICAgIH1cblxuICAgIHdoaWxlIChzcmMpIHtcbiAgICAgIGlmICgha2VlcFByZXZDaGFyKSB7XG4gICAgICAgIHByZXZDaGFyID0gJyc7XG4gICAgICB9XG4gICAgICBrZWVwUHJldkNoYXIgPSBmYWxzZTtcblxuICAgICAgLy8gZXh0ZW5zaW9uc1xuICAgICAgaWYgKHRoaXMub3B0aW9ucy5leHRlbnNpb25zXG4gICAgICAgICYmIHRoaXMub3B0aW9ucy5leHRlbnNpb25zLmlubGluZVxuICAgICAgICAmJiB0aGlzLm9wdGlvbnMuZXh0ZW5zaW9ucy5pbmxpbmUuc29tZSgoZXh0VG9rZW5pemVyKSA9PiB7XG4gICAgICAgICAgaWYgKHRva2VuID0gZXh0VG9rZW5pemVyLmNhbGwoeyBsZXhlcjogdGhpcyB9LCBzcmMsIHRva2VucykpIHtcbiAgICAgICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9KSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gZXNjYXBlXG4gICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci5lc2NhcGUoc3JjKSkge1xuICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyB0YWdcbiAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLnRhZyhzcmMpKSB7XG4gICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgIGxhc3RUb2tlbiA9IHRva2Vuc1t0b2tlbnMubGVuZ3RoIC0gMV07XG4gICAgICAgIGlmIChsYXN0VG9rZW4gJiYgdG9rZW4udHlwZSA9PT0gJ3RleHQnICYmIGxhc3RUb2tlbi50eXBlID09PSAndGV4dCcpIHtcbiAgICAgICAgICBsYXN0VG9rZW4ucmF3ICs9IHRva2VuLnJhdztcbiAgICAgICAgICBsYXN0VG9rZW4udGV4dCArPSB0b2tlbi50ZXh0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgfVxuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gbGlua1xuICAgICAgaWYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIubGluayhzcmMpKSB7XG4gICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIHJlZmxpbmssIG5vbGlua1xuICAgICAgaWYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIucmVmbGluayhzcmMsIHRoaXMudG9rZW5zLmxpbmtzKSkge1xuICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICBsYXN0VG9rZW4gPSB0b2tlbnNbdG9rZW5zLmxlbmd0aCAtIDFdO1xuICAgICAgICBpZiAobGFzdFRva2VuICYmIHRva2VuLnR5cGUgPT09ICd0ZXh0JyAmJiBsYXN0VG9rZW4udHlwZSA9PT0gJ3RleHQnKSB7XG4gICAgICAgICAgbGFzdFRva2VuLnJhdyArPSB0b2tlbi5yYXc7XG4gICAgICAgICAgbGFzdFRva2VuLnRleHQgKz0gdG9rZW4udGV4dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgIH1cbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIGVtICYgc3Ryb25nXG4gICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci5lbVN0cm9uZyhzcmMsIG1hc2tlZFNyYywgcHJldkNoYXIpKSB7XG4gICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIGNvZGVcbiAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLmNvZGVzcGFuKHNyYykpIHtcbiAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gYnJcbiAgICAgIGlmICh0b2tlbiA9IHRoaXMudG9rZW5pemVyLmJyKHNyYykpIHtcbiAgICAgICAgc3JjID0gc3JjLnN1YnN0cmluZyh0b2tlbi5yYXcubGVuZ3RoKTtcbiAgICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gZGVsIChnZm0pXG4gICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci5kZWwoc3JjKSkge1xuICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBhdXRvbGlua1xuICAgICAgaWYgKHRva2VuID0gdGhpcy50b2tlbml6ZXIuYXV0b2xpbmsoc3JjLCBtYW5nbGUpKSB7XG4gICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgIHRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIHVybCAoZ2ZtKVxuICAgICAgaWYgKCF0aGlzLnN0YXRlLmluTGluayAmJiAodG9rZW4gPSB0aGlzLnRva2VuaXplci51cmwoc3JjLCBtYW5nbGUpKSkge1xuICAgICAgICBzcmMgPSBzcmMuc3Vic3RyaW5nKHRva2VuLnJhdy5sZW5ndGgpO1xuICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyB0ZXh0XG4gICAgICAvLyBwcmV2ZW50IGlubGluZVRleHQgY29uc3VtaW5nIGV4dGVuc2lvbnMgYnkgY2xpcHBpbmcgJ3NyYycgdG8gZXh0ZW5zaW9uIHN0YXJ0XG4gICAgICBjdXRTcmMgPSBzcmM7XG4gICAgICBpZiAodGhpcy5vcHRpb25zLmV4dGVuc2lvbnMgJiYgdGhpcy5vcHRpb25zLmV4dGVuc2lvbnMuc3RhcnRJbmxpbmUpIHtcbiAgICAgICAgbGV0IHN0YXJ0SW5kZXggPSBJbmZpbml0eTtcbiAgICAgICAgY29uc3QgdGVtcFNyYyA9IHNyYy5zbGljZSgxKTtcbiAgICAgICAgbGV0IHRlbXBTdGFydDtcbiAgICAgICAgdGhpcy5vcHRpb25zLmV4dGVuc2lvbnMuc3RhcnRJbmxpbmUuZm9yRWFjaChmdW5jdGlvbihnZXRTdGFydEluZGV4KSB7XG4gICAgICAgICAgdGVtcFN0YXJ0ID0gZ2V0U3RhcnRJbmRleC5jYWxsKHsgbGV4ZXI6IHRoaXMgfSwgdGVtcFNyYyk7XG4gICAgICAgICAgaWYgKHR5cGVvZiB0ZW1wU3RhcnQgPT09ICdudW1iZXInICYmIHRlbXBTdGFydCA+PSAwKSB7IHN0YXJ0SW5kZXggPSBNYXRoLm1pbihzdGFydEluZGV4LCB0ZW1wU3RhcnQpOyB9XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoc3RhcnRJbmRleCA8IEluZmluaXR5ICYmIHN0YXJ0SW5kZXggPj0gMCkge1xuICAgICAgICAgIGN1dFNyYyA9IHNyYy5zdWJzdHJpbmcoMCwgc3RhcnRJbmRleCArIDEpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAodG9rZW4gPSB0aGlzLnRva2VuaXplci5pbmxpbmVUZXh0KGN1dFNyYywgc21hcnR5cGFudHMpKSB7XG4gICAgICAgIHNyYyA9IHNyYy5zdWJzdHJpbmcodG9rZW4ucmF3Lmxlbmd0aCk7XG4gICAgICAgIGlmICh0b2tlbi5yYXcuc2xpY2UoLTEpICE9PSAnXycpIHsgLy8gVHJhY2sgcHJldkNoYXIgYmVmb3JlIHN0cmluZyBvZiBfX19fIHN0YXJ0ZWRcbiAgICAgICAgICBwcmV2Q2hhciA9IHRva2VuLnJhdy5zbGljZSgtMSk7XG4gICAgICAgIH1cbiAgICAgICAga2VlcFByZXZDaGFyID0gdHJ1ZTtcbiAgICAgICAgbGFzdFRva2VuID0gdG9rZW5zW3Rva2Vucy5sZW5ndGggLSAxXTtcbiAgICAgICAgaWYgKGxhc3RUb2tlbiAmJiBsYXN0VG9rZW4udHlwZSA9PT0gJ3RleHQnKSB7XG4gICAgICAgICAgbGFzdFRva2VuLnJhdyArPSB0b2tlbi5yYXc7XG4gICAgICAgICAgbGFzdFRva2VuLnRleHQgKz0gdG9rZW4udGV4dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0b2tlbnMucHVzaCh0b2tlbik7XG4gICAgICAgIH1cbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGlmIChzcmMpIHtcbiAgICAgICAgY29uc3QgZXJyTXNnID0gJ0luZmluaXRlIGxvb3Agb24gYnl0ZTogJyArIHNyYy5jaGFyQ29kZUF0KDApO1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnNpbGVudCkge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyTXNnKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyTXNnKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0b2tlbnM7XG4gIH1cbn1cblxuLyoqXG4gKiBSZW5kZXJlclxuICovXG5jbGFzcyBSZW5kZXJlciB7XG4gIGNvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zIHx8IGRlZmF1bHRzO1xuICB9XG5cbiAgY29kZShjb2RlLCBpbmZvc3RyaW5nLCBlc2NhcGVkKSB7XG4gICAgY29uc3QgbGFuZyA9IChpbmZvc3RyaW5nIHx8ICcnKS5tYXRjaCgvXFxTKi8pWzBdO1xuICAgIGlmICh0aGlzLm9wdGlvbnMuaGlnaGxpZ2h0KSB7XG4gICAgICBjb25zdCBvdXQgPSB0aGlzLm9wdGlvbnMuaGlnaGxpZ2h0KGNvZGUsIGxhbmcpO1xuICAgICAgaWYgKG91dCAhPSBudWxsICYmIG91dCAhPT0gY29kZSkge1xuICAgICAgICBlc2NhcGVkID0gdHJ1ZTtcbiAgICAgICAgY29kZSA9IG91dDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb2RlID0gY29kZS5yZXBsYWNlKC9cXG4kLywgJycpICsgJ1xcbic7XG5cbiAgICBpZiAoIWxhbmcpIHtcbiAgICAgIHJldHVybiAnPHByZT48Y29kZT4nXG4gICAgICAgICsgKGVzY2FwZWQgPyBjb2RlIDogZXNjYXBlKGNvZGUsIHRydWUpKVxuICAgICAgICArICc8L2NvZGU+PC9wcmU+XFxuJztcbiAgICB9XG5cbiAgICByZXR1cm4gJzxwcmU+PGNvZGUgY2xhc3M9XCInXG4gICAgICArIHRoaXMub3B0aW9ucy5sYW5nUHJlZml4XG4gICAgICArIGVzY2FwZShsYW5nKVxuICAgICAgKyAnXCI+J1xuICAgICAgKyAoZXNjYXBlZCA/IGNvZGUgOiBlc2NhcGUoY29kZSwgdHJ1ZSkpXG4gICAgICArICc8L2NvZGU+PC9wcmU+XFxuJztcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcXVvdGVcbiAgICovXG4gIGJsb2NrcXVvdGUocXVvdGUpIHtcbiAgICByZXR1cm4gYDxibG9ja3F1b3RlPlxcbiR7cXVvdGV9PC9ibG9ja3F1b3RlPlxcbmA7XG4gIH1cblxuICBodG1sKGh0bWwpIHtcbiAgICByZXR1cm4gaHRtbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGV4dFxuICAgKiBAcGFyYW0ge3N0cmluZ30gbGV2ZWxcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJhd1xuICAgKiBAcGFyYW0ge2FueX0gc2x1Z2dlclxuICAgKi9cbiAgaGVhZGluZyh0ZXh0LCBsZXZlbCwgcmF3LCBzbHVnZ2VyKSB7XG4gICAgaWYgKHRoaXMub3B0aW9ucy5oZWFkZXJJZHMpIHtcbiAgICAgIGNvbnN0IGlkID0gdGhpcy5vcHRpb25zLmhlYWRlclByZWZpeCArIHNsdWdnZXIuc2x1ZyhyYXcpO1xuICAgICAgcmV0dXJuIGA8aCR7bGV2ZWx9IGlkPVwiJHtpZH1cIj4ke3RleHR9PC9oJHtsZXZlbH0+XFxuYDtcbiAgICB9XG5cbiAgICAvLyBpZ25vcmUgSURzXG4gICAgcmV0dXJuIGA8aCR7bGV2ZWx9PiR7dGV4dH08L2gke2xldmVsfT5cXG5gO1xuICB9XG5cbiAgaHIoKSB7XG4gICAgcmV0dXJuIHRoaXMub3B0aW9ucy54aHRtbCA/ICc8aHIvPlxcbicgOiAnPGhyPlxcbic7XG4gIH1cblxuICBsaXN0KGJvZHksIG9yZGVyZWQsIHN0YXJ0KSB7XG4gICAgY29uc3QgdHlwZSA9IG9yZGVyZWQgPyAnb2wnIDogJ3VsJyxcbiAgICAgIHN0YXJ0YXR0ID0gKG9yZGVyZWQgJiYgc3RhcnQgIT09IDEpID8gKCcgc3RhcnQ9XCInICsgc3RhcnQgKyAnXCInKSA6ICcnO1xuICAgIHJldHVybiAnPCcgKyB0eXBlICsgc3RhcnRhdHQgKyAnPlxcbicgKyBib2R5ICsgJzwvJyArIHR5cGUgKyAnPlxcbic7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IHRleHRcbiAgICovXG4gIGxpc3RpdGVtKHRleHQpIHtcbiAgICByZXR1cm4gYDxsaT4ke3RleHR9PC9saT5cXG5gO1xuICB9XG5cbiAgY2hlY2tib3goY2hlY2tlZCkge1xuICAgIHJldHVybiAnPGlucHV0ICdcbiAgICAgICsgKGNoZWNrZWQgPyAnY2hlY2tlZD1cIlwiICcgOiAnJylcbiAgICAgICsgJ2Rpc2FibGVkPVwiXCIgdHlwZT1cImNoZWNrYm94XCInXG4gICAgICArICh0aGlzLm9wdGlvbnMueGh0bWwgPyAnIC8nIDogJycpXG4gICAgICArICc+ICc7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IHRleHRcbiAgICovXG4gIHBhcmFncmFwaCh0ZXh0KSB7XG4gICAgcmV0dXJuIGA8cD4ke3RleHR9PC9wPlxcbmA7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IGhlYWRlclxuICAgKiBAcGFyYW0ge3N0cmluZ30gYm9keVxuICAgKi9cbiAgdGFibGUoaGVhZGVyLCBib2R5KSB7XG4gICAgaWYgKGJvZHkpIGJvZHkgPSBgPHRib2R5PiR7Ym9keX08L3Rib2R5PmA7XG5cbiAgICByZXR1cm4gJzx0YWJsZT5cXG4nXG4gICAgICArICc8dGhlYWQ+XFxuJ1xuICAgICAgKyBoZWFkZXJcbiAgICAgICsgJzwvdGhlYWQ+XFxuJ1xuICAgICAgKyBib2R5XG4gICAgICArICc8L3RhYmxlPlxcbic7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IGNvbnRlbnRcbiAgICovXG4gIHRhYmxlcm93KGNvbnRlbnQpIHtcbiAgICByZXR1cm4gYDx0cj5cXG4ke2NvbnRlbnR9PC90cj5cXG5gO1xuICB9XG5cbiAgdGFibGVjZWxsKGNvbnRlbnQsIGZsYWdzKSB7XG4gICAgY29uc3QgdHlwZSA9IGZsYWdzLmhlYWRlciA/ICd0aCcgOiAndGQnO1xuICAgIGNvbnN0IHRhZyA9IGZsYWdzLmFsaWduXG4gICAgICA/IGA8JHt0eXBlfSBhbGlnbj1cIiR7ZmxhZ3MuYWxpZ259XCI+YFxuICAgICAgOiBgPCR7dHlwZX0+YDtcbiAgICByZXR1cm4gdGFnICsgY29udGVudCArIGA8LyR7dHlwZX0+XFxuYDtcbiAgfVxuXG4gIC8qKlxuICAgKiBzcGFuIGxldmVsIHJlbmRlcmVyXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0XG4gICAqL1xuICBzdHJvbmcodGV4dCkge1xuICAgIHJldHVybiBgPHN0cm9uZz4ke3RleHR9PC9zdHJvbmc+YDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGV4dFxuICAgKi9cbiAgZW0odGV4dCkge1xuICAgIHJldHVybiBgPGVtPiR7dGV4dH08L2VtPmA7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IHRleHRcbiAgICovXG4gIGNvZGVzcGFuKHRleHQpIHtcbiAgICByZXR1cm4gYDxjb2RlPiR7dGV4dH08L2NvZGU+YDtcbiAgfVxuXG4gIGJyKCkge1xuICAgIHJldHVybiB0aGlzLm9wdGlvbnMueGh0bWwgPyAnPGJyLz4nIDogJzxicj4nO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0XG4gICAqL1xuICBkZWwodGV4dCkge1xuICAgIHJldHVybiBgPGRlbD4ke3RleHR9PC9kZWw+YDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gaHJlZlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGl0bGVcbiAgICogQHBhcmFtIHtzdHJpbmd9IHRleHRcbiAgICovXG4gIGxpbmsoaHJlZiwgdGl0bGUsIHRleHQpIHtcbiAgICBocmVmID0gY2xlYW5VcmwodGhpcy5vcHRpb25zLnNhbml0aXplLCB0aGlzLm9wdGlvbnMuYmFzZVVybCwgaHJlZik7XG4gICAgaWYgKGhyZWYgPT09IG51bGwpIHtcbiAgICAgIHJldHVybiB0ZXh0O1xuICAgIH1cbiAgICBsZXQgb3V0ID0gJzxhIGhyZWY9XCInICsgaHJlZiArICdcIic7XG4gICAgaWYgKHRpdGxlKSB7XG4gICAgICBvdXQgKz0gJyB0aXRsZT1cIicgKyB0aXRsZSArICdcIic7XG4gICAgfVxuICAgIG91dCArPSAnPicgKyB0ZXh0ICsgJzwvYT4nO1xuICAgIHJldHVybiBvdXQ7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IGhyZWZcbiAgICogQHBhcmFtIHtzdHJpbmd9IHRpdGxlXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0XG4gICAqL1xuICBpbWFnZShocmVmLCB0aXRsZSwgdGV4dCkge1xuICAgIGhyZWYgPSBjbGVhblVybCh0aGlzLm9wdGlvbnMuc2FuaXRpemUsIHRoaXMub3B0aW9ucy5iYXNlVXJsLCBocmVmKTtcbiAgICBpZiAoaHJlZiA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRleHQ7XG4gICAgfVxuXG4gICAgbGV0IG91dCA9IGA8aW1nIHNyYz1cIiR7aHJlZn1cIiBhbHQ9XCIke3RleHR9XCJgO1xuICAgIGlmICh0aXRsZSkge1xuICAgICAgb3V0ICs9IGAgdGl0bGU9XCIke3RpdGxlfVwiYDtcbiAgICB9XG4gICAgb3V0ICs9IHRoaXMub3B0aW9ucy54aHRtbCA/ICcvPicgOiAnPic7XG4gICAgcmV0dXJuIG91dDtcbiAgfVxuXG4gIHRleHQodGV4dCkge1xuICAgIHJldHVybiB0ZXh0O1xuICB9XG59XG5cbi8qKlxuICogVGV4dFJlbmRlcmVyXG4gKiByZXR1cm5zIG9ubHkgdGhlIHRleHR1YWwgcGFydCBvZiB0aGUgdG9rZW5cbiAqL1xuY2xhc3MgVGV4dFJlbmRlcmVyIHtcbiAgLy8gbm8gbmVlZCBmb3IgYmxvY2sgbGV2ZWwgcmVuZGVyZXJzXG4gIHN0cm9uZyh0ZXh0KSB7XG4gICAgcmV0dXJuIHRleHQ7XG4gIH1cblxuICBlbSh0ZXh0KSB7XG4gICAgcmV0dXJuIHRleHQ7XG4gIH1cblxuICBjb2Rlc3Bhbih0ZXh0KSB7XG4gICAgcmV0dXJuIHRleHQ7XG4gIH1cblxuICBkZWwodGV4dCkge1xuICAgIHJldHVybiB0ZXh0O1xuICB9XG5cbiAgaHRtbCh0ZXh0KSB7XG4gICAgcmV0dXJuIHRleHQ7XG4gIH1cblxuICB0ZXh0KHRleHQpIHtcbiAgICByZXR1cm4gdGV4dDtcbiAgfVxuXG4gIGxpbmsoaHJlZiwgdGl0bGUsIHRleHQpIHtcbiAgICByZXR1cm4gJycgKyB0ZXh0O1xuICB9XG5cbiAgaW1hZ2UoaHJlZiwgdGl0bGUsIHRleHQpIHtcbiAgICByZXR1cm4gJycgKyB0ZXh0O1xuICB9XG5cbiAgYnIoKSB7XG4gICAgcmV0dXJuICcnO1xuICB9XG59XG5cbi8qKlxuICogU2x1Z2dlciBnZW5lcmF0ZXMgaGVhZGVyIGlkXG4gKi9cbmNsYXNzIFNsdWdnZXIge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnNlZW4gPSB7fTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdmFsdWVcbiAgICovXG4gIHNlcmlhbGl6ZSh2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZVxuICAgICAgLnRvTG93ZXJDYXNlKClcbiAgICAgIC50cmltKClcbiAgICAgIC8vIHJlbW92ZSBodG1sIHRhZ3NcbiAgICAgIC5yZXBsYWNlKC88WyFcXC9hLXpdLio/Pi9pZywgJycpXG4gICAgICAvLyByZW1vdmUgdW53YW50ZWQgY2hhcnNcbiAgICAgIC5yZXBsYWNlKC9bXFx1MjAwMC1cXHUyMDZGXFx1MkUwMC1cXHUyRTdGXFxcXCchXCIjJCUmKCkqKywuLzo7PD0+P0BbXFxdXmB7fH1+XS9nLCAnJylcbiAgICAgIC5yZXBsYWNlKC9cXHMvZywgJy0nKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGaW5kcyB0aGUgbmV4dCBzYWZlICh1bmlxdWUpIHNsdWcgdG8gdXNlXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBvcmlnaW5hbFNsdWdcbiAgICogQHBhcmFtIHtib29sZWFufSBpc0RyeVJ1blxuICAgKi9cbiAgZ2V0TmV4dFNhZmVTbHVnKG9yaWdpbmFsU2x1ZywgaXNEcnlSdW4pIHtcbiAgICBsZXQgc2x1ZyA9IG9yaWdpbmFsU2x1ZztcbiAgICBsZXQgb2NjdXJlbmNlQWNjdW11bGF0b3IgPSAwO1xuICAgIGlmICh0aGlzLnNlZW4uaGFzT3duUHJvcGVydHkoc2x1ZykpIHtcbiAgICAgIG9jY3VyZW5jZUFjY3VtdWxhdG9yID0gdGhpcy5zZWVuW29yaWdpbmFsU2x1Z107XG4gICAgICBkbyB7XG4gICAgICAgIG9jY3VyZW5jZUFjY3VtdWxhdG9yKys7XG4gICAgICAgIHNsdWcgPSBvcmlnaW5hbFNsdWcgKyAnLScgKyBvY2N1cmVuY2VBY2N1bXVsYXRvcjtcbiAgICAgIH0gd2hpbGUgKHRoaXMuc2Vlbi5oYXNPd25Qcm9wZXJ0eShzbHVnKSk7XG4gICAgfVxuICAgIGlmICghaXNEcnlSdW4pIHtcbiAgICAgIHRoaXMuc2VlbltvcmlnaW5hbFNsdWddID0gb2NjdXJlbmNlQWNjdW11bGF0b3I7XG4gICAgICB0aGlzLnNlZW5bc2x1Z10gPSAwO1xuICAgIH1cbiAgICByZXR1cm4gc2x1ZztcbiAgfVxuXG4gIC8qKlxuICAgKiBDb252ZXJ0IHN0cmluZyB0byB1bmlxdWUgaWRcbiAgICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXVxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtvcHRpb25zLmRyeXJ1bl0gR2VuZXJhdGVzIHRoZSBuZXh0IHVuaXF1ZSBzbHVnIHdpdGhvdXRcbiAgICogdXBkYXRpbmcgdGhlIGludGVybmFsIGFjY3VtdWxhdG9yLlxuICAgKi9cbiAgc2x1Zyh2YWx1ZSwgb3B0aW9ucyA9IHt9KSB7XG4gICAgY29uc3Qgc2x1ZyA9IHRoaXMuc2VyaWFsaXplKHZhbHVlKTtcbiAgICByZXR1cm4gdGhpcy5nZXROZXh0U2FmZVNsdWcoc2x1Zywgb3B0aW9ucy5kcnlydW4pO1xuICB9XG59XG5cbi8qKlxuICogUGFyc2luZyAmIENvbXBpbGluZ1xuICovXG5jbGFzcyBQYXJzZXIge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyB8fCBkZWZhdWx0cztcbiAgICB0aGlzLm9wdGlvbnMucmVuZGVyZXIgPSB0aGlzLm9wdGlvbnMucmVuZGVyZXIgfHwgbmV3IFJlbmRlcmVyKCk7XG4gICAgdGhpcy5yZW5kZXJlciA9IHRoaXMub3B0aW9ucy5yZW5kZXJlcjtcbiAgICB0aGlzLnJlbmRlcmVyLm9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG4gICAgdGhpcy50ZXh0UmVuZGVyZXIgPSBuZXcgVGV4dFJlbmRlcmVyKCk7XG4gICAgdGhpcy5zbHVnZ2VyID0gbmV3IFNsdWdnZXIoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGF0aWMgUGFyc2UgTWV0aG9kXG4gICAqL1xuICBzdGF0aWMgcGFyc2UodG9rZW5zLCBvcHRpb25zKSB7XG4gICAgY29uc3QgcGFyc2VyID0gbmV3IFBhcnNlcihvcHRpb25zKTtcbiAgICByZXR1cm4gcGFyc2VyLnBhcnNlKHRva2Vucyk7XG4gIH1cblxuICAvKipcbiAgICogU3RhdGljIFBhcnNlIElubGluZSBNZXRob2RcbiAgICovXG4gIHN0YXRpYyBwYXJzZUlubGluZSh0b2tlbnMsIG9wdGlvbnMpIHtcbiAgICBjb25zdCBwYXJzZXIgPSBuZXcgUGFyc2VyKG9wdGlvbnMpO1xuICAgIHJldHVybiBwYXJzZXIucGFyc2VJbmxpbmUodG9rZW5zKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQYXJzZSBMb29wXG4gICAqL1xuICBwYXJzZSh0b2tlbnMsIHRvcCA9IHRydWUpIHtcbiAgICBsZXQgb3V0ID0gJycsXG4gICAgICBpLFxuICAgICAgaixcbiAgICAgIGssXG4gICAgICBsMixcbiAgICAgIGwzLFxuICAgICAgcm93LFxuICAgICAgY2VsbCxcbiAgICAgIGhlYWRlcixcbiAgICAgIGJvZHksXG4gICAgICB0b2tlbixcbiAgICAgIG9yZGVyZWQsXG4gICAgICBzdGFydCxcbiAgICAgIGxvb3NlLFxuICAgICAgaXRlbUJvZHksXG4gICAgICBpdGVtLFxuICAgICAgY2hlY2tlZCxcbiAgICAgIHRhc2ssXG4gICAgICBjaGVja2JveCxcbiAgICAgIHJldDtcblxuICAgIGNvbnN0IGwgPSB0b2tlbnMubGVuZ3RoO1xuICAgIGZvciAoaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICAgIHRva2VuID0gdG9rZW5zW2ldO1xuXG4gICAgICAvLyBSdW4gYW55IHJlbmRlcmVyIGV4dGVuc2lvbnNcbiAgICAgIGlmICh0aGlzLm9wdGlvbnMuZXh0ZW5zaW9ucyAmJiB0aGlzLm9wdGlvbnMuZXh0ZW5zaW9ucy5yZW5kZXJlcnMgJiYgdGhpcy5vcHRpb25zLmV4dGVuc2lvbnMucmVuZGVyZXJzW3Rva2VuLnR5cGVdKSB7XG4gICAgICAgIHJldCA9IHRoaXMub3B0aW9ucy5leHRlbnNpb25zLnJlbmRlcmVyc1t0b2tlbi50eXBlXS5jYWxsKHsgcGFyc2VyOiB0aGlzIH0sIHRva2VuKTtcbiAgICAgICAgaWYgKHJldCAhPT0gZmFsc2UgfHwgIVsnc3BhY2UnLCAnaHInLCAnaGVhZGluZycsICdjb2RlJywgJ3RhYmxlJywgJ2Jsb2NrcXVvdGUnLCAnbGlzdCcsICdodG1sJywgJ3BhcmFncmFwaCcsICd0ZXh0J10uaW5jbHVkZXModG9rZW4udHlwZSkpIHtcbiAgICAgICAgICBvdXQgKz0gcmV0IHx8ICcnO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHN3aXRjaCAodG9rZW4udHlwZSkge1xuICAgICAgICBjYXNlICdzcGFjZSc6IHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjYXNlICdocic6IHtcbiAgICAgICAgICBvdXQgKz0gdGhpcy5yZW5kZXJlci5ocigpO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgJ2hlYWRpbmcnOiB7XG4gICAgICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIuaGVhZGluZyhcbiAgICAgICAgICAgIHRoaXMucGFyc2VJbmxpbmUodG9rZW4udG9rZW5zKSxcbiAgICAgICAgICAgIHRva2VuLmRlcHRoLFxuICAgICAgICAgICAgdW5lc2NhcGUodGhpcy5wYXJzZUlubGluZSh0b2tlbi50b2tlbnMsIHRoaXMudGV4dFJlbmRlcmVyKSksXG4gICAgICAgICAgICB0aGlzLnNsdWdnZXIpO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgJ2NvZGUnOiB7XG4gICAgICAgICAgb3V0ICs9IHRoaXMucmVuZGVyZXIuY29kZSh0b2tlbi50ZXh0LFxuICAgICAgICAgICAgdG9rZW4ubGFuZyxcbiAgICAgICAgICAgIHRva2VuLmVzY2FwZWQpO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgJ3RhYmxlJzoge1xuICAgICAgICAgIGhlYWRlciA9ICcnO1xuXG4gICAgICAgICAgLy8gaGVhZGVyXG4gICAgICAgICAgY2VsbCA9ICcnO1xuICAgICAgICAgIGwyID0gdG9rZW4uaGVhZGVyLmxlbmd0aDtcbiAgICAgICAgICBmb3IgKGogPSAwOyBqIDwgbDI7IGorKykge1xuICAgICAgICAgICAgY2VsbCArPSB0aGlzLnJlbmRlcmVyLnRhYmxlY2VsbChcbiAgICAgICAgICAgICAgdGhpcy5wYXJzZUlubGluZSh0b2tlbi5oZWFkZXJbal0udG9rZW5zKSxcbiAgICAgICAgICAgICAgeyBoZWFkZXI6IHRydWUsIGFsaWduOiB0b2tlbi5hbGlnbltqXSB9XG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBoZWFkZXIgKz0gdGhpcy5yZW5kZXJlci50YWJsZXJvdyhjZWxsKTtcblxuICAgICAgICAgIGJvZHkgPSAnJztcbiAgICAgICAgICBsMiA9IHRva2VuLnJvd3MubGVuZ3RoO1xuICAgICAgICAgIGZvciAoaiA9IDA7IGogPCBsMjsgaisrKSB7XG4gICAgICAgICAgICByb3cgPSB0b2tlbi5yb3dzW2pdO1xuXG4gICAgICAgICAgICBjZWxsID0gJyc7XG4gICAgICAgICAgICBsMyA9IHJvdy5sZW5ndGg7XG4gICAgICAgICAgICBmb3IgKGsgPSAwOyBrIDwgbDM7IGsrKykge1xuICAgICAgICAgICAgICBjZWxsICs9IHRoaXMucmVuZGVyZXIudGFibGVjZWxsKFxuICAgICAgICAgICAgICAgIHRoaXMucGFyc2VJbmxpbmUocm93W2tdLnRva2VucyksXG4gICAgICAgICAgICAgICAgeyBoZWFkZXI6IGZhbHNlLCBhbGlnbjogdG9rZW4uYWxpZ25ba10gfVxuICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBib2R5ICs9IHRoaXMucmVuZGVyZXIudGFibGVyb3coY2VsbCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLnRhYmxlKGhlYWRlciwgYm9keSk7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAnYmxvY2txdW90ZSc6IHtcbiAgICAgICAgICBib2R5ID0gdGhpcy5wYXJzZSh0b2tlbi50b2tlbnMpO1xuICAgICAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLmJsb2NrcXVvdGUoYm9keSk7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAnbGlzdCc6IHtcbiAgICAgICAgICBvcmRlcmVkID0gdG9rZW4ub3JkZXJlZDtcbiAgICAgICAgICBzdGFydCA9IHRva2VuLnN0YXJ0O1xuICAgICAgICAgIGxvb3NlID0gdG9rZW4ubG9vc2U7XG4gICAgICAgICAgbDIgPSB0b2tlbi5pdGVtcy5sZW5ndGg7XG5cbiAgICAgICAgICBib2R5ID0gJyc7XG4gICAgICAgICAgZm9yIChqID0gMDsgaiA8IGwyOyBqKyspIHtcbiAgICAgICAgICAgIGl0ZW0gPSB0b2tlbi5pdGVtc1tqXTtcbiAgICAgICAgICAgIGNoZWNrZWQgPSBpdGVtLmNoZWNrZWQ7XG4gICAgICAgICAgICB0YXNrID0gaXRlbS50YXNrO1xuXG4gICAgICAgICAgICBpdGVtQm9keSA9ICcnO1xuICAgICAgICAgICAgaWYgKGl0ZW0udGFzaykge1xuICAgICAgICAgICAgICBjaGVja2JveCA9IHRoaXMucmVuZGVyZXIuY2hlY2tib3goY2hlY2tlZCk7XG4gICAgICAgICAgICAgIGlmIChsb29zZSkge1xuICAgICAgICAgICAgICAgIGlmIChpdGVtLnRva2Vucy5sZW5ndGggPiAwICYmIGl0ZW0udG9rZW5zWzBdLnR5cGUgPT09ICdwYXJhZ3JhcGgnKSB7XG4gICAgICAgICAgICAgICAgICBpdGVtLnRva2Vuc1swXS50ZXh0ID0gY2hlY2tib3ggKyAnICcgKyBpdGVtLnRva2Vuc1swXS50ZXh0O1xuICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0udG9rZW5zWzBdLnRva2VucyAmJiBpdGVtLnRva2Vuc1swXS50b2tlbnMubGVuZ3RoID4gMCAmJiBpdGVtLnRva2Vuc1swXS50b2tlbnNbMF0udHlwZSA9PT0gJ3RleHQnKSB7XG4gICAgICAgICAgICAgICAgICAgIGl0ZW0udG9rZW5zWzBdLnRva2Vuc1swXS50ZXh0ID0gY2hlY2tib3ggKyAnICcgKyBpdGVtLnRva2Vuc1swXS50b2tlbnNbMF0udGV4dDtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgaXRlbS50b2tlbnMudW5zaGlmdCh7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICd0ZXh0JyxcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogY2hlY2tib3hcbiAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpdGVtQm9keSArPSBjaGVja2JveDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpdGVtQm9keSArPSB0aGlzLnBhcnNlKGl0ZW0udG9rZW5zLCBsb29zZSk7XG4gICAgICAgICAgICBib2R5ICs9IHRoaXMucmVuZGVyZXIubGlzdGl0ZW0oaXRlbUJvZHksIHRhc2ssIGNoZWNrZWQpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLmxpc3QoYm9keSwgb3JkZXJlZCwgc3RhcnQpO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgJ2h0bWwnOiB7XG4gICAgICAgICAgLy8gVE9ETyBwYXJzZSBpbmxpbmUgY29udGVudCBpZiBwYXJhbWV0ZXIgbWFya2Rvd249MVxuICAgICAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLmh0bWwodG9rZW4udGV4dCk7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAncGFyYWdyYXBoJzoge1xuICAgICAgICAgIG91dCArPSB0aGlzLnJlbmRlcmVyLnBhcmFncmFwaCh0aGlzLnBhcnNlSW5saW5lKHRva2VuLnRva2VucykpO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgJ3RleHQnOiB7XG4gICAgICAgICAgYm9keSA9IHRva2VuLnRva2VucyA/IHRoaXMucGFyc2VJbmxpbmUodG9rZW4udG9rZW5zKSA6IHRva2VuLnRleHQ7XG4gICAgICAgICAgd2hpbGUgKGkgKyAxIDwgbCAmJiB0b2tlbnNbaSArIDFdLnR5cGUgPT09ICd0ZXh0Jykge1xuICAgICAgICAgICAgdG9rZW4gPSB0b2tlbnNbKytpXTtcbiAgICAgICAgICAgIGJvZHkgKz0gJ1xcbicgKyAodG9rZW4udG9rZW5zID8gdGhpcy5wYXJzZUlubGluZSh0b2tlbi50b2tlbnMpIDogdG9rZW4udGV4dCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIG91dCArPSB0b3AgPyB0aGlzLnJlbmRlcmVyLnBhcmFncmFwaChib2R5KSA6IGJvZHk7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBkZWZhdWx0OiB7XG4gICAgICAgICAgY29uc3QgZXJyTXNnID0gJ1Rva2VuIHdpdGggXCInICsgdG9rZW4udHlwZSArICdcIiB0eXBlIHdhcyBub3QgZm91bmQuJztcbiAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnNpbGVudCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnJNc2cpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyTXNnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gb3V0O1xuICB9XG5cbiAgLyoqXG4gICAqIFBhcnNlIElubGluZSBUb2tlbnNcbiAgICovXG4gIHBhcnNlSW5saW5lKHRva2VucywgcmVuZGVyZXIpIHtcbiAgICByZW5kZXJlciA9IHJlbmRlcmVyIHx8IHRoaXMucmVuZGVyZXI7XG4gICAgbGV0IG91dCA9ICcnLFxuICAgICAgaSxcbiAgICAgIHRva2VuLFxuICAgICAgcmV0O1xuXG4gICAgY29uc3QgbCA9IHRva2Vucy5sZW5ndGg7XG4gICAgZm9yIChpID0gMDsgaSA8IGw7IGkrKykge1xuICAgICAgdG9rZW4gPSB0b2tlbnNbaV07XG5cbiAgICAgIC8vIFJ1biBhbnkgcmVuZGVyZXIgZXh0ZW5zaW9uc1xuICAgICAgaWYgKHRoaXMub3B0aW9ucy5leHRlbnNpb25zICYmIHRoaXMub3B0aW9ucy5leHRlbnNpb25zLnJlbmRlcmVycyAmJiB0aGlzLm9wdGlvbnMuZXh0ZW5zaW9ucy5yZW5kZXJlcnNbdG9rZW4udHlwZV0pIHtcbiAgICAgICAgcmV0ID0gdGhpcy5vcHRpb25zLmV4dGVuc2lvbnMucmVuZGVyZXJzW3Rva2VuLnR5cGVdLmNhbGwoeyBwYXJzZXI6IHRoaXMgfSwgdG9rZW4pO1xuICAgICAgICBpZiAocmV0ICE9PSBmYWxzZSB8fCAhWydlc2NhcGUnLCAnaHRtbCcsICdsaW5rJywgJ2ltYWdlJywgJ3N0cm9uZycsICdlbScsICdjb2Rlc3BhbicsICdicicsICdkZWwnLCAndGV4dCddLmluY2x1ZGVzKHRva2VuLnR5cGUpKSB7XG4gICAgICAgICAgb3V0ICs9IHJldCB8fCAnJztcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBzd2l0Y2ggKHRva2VuLnR5cGUpIHtcbiAgICAgICAgY2FzZSAnZXNjYXBlJzoge1xuICAgICAgICAgIG91dCArPSByZW5kZXJlci50ZXh0KHRva2VuLnRleHQpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgJ2h0bWwnOiB7XG4gICAgICAgICAgb3V0ICs9IHJlbmRlcmVyLmh0bWwodG9rZW4udGV4dCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAnbGluayc6IHtcbiAgICAgICAgICBvdXQgKz0gcmVuZGVyZXIubGluayh0b2tlbi5ocmVmLCB0b2tlbi50aXRsZSwgdGhpcy5wYXJzZUlubGluZSh0b2tlbi50b2tlbnMsIHJlbmRlcmVyKSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAnaW1hZ2UnOiB7XG4gICAgICAgICAgb3V0ICs9IHJlbmRlcmVyLmltYWdlKHRva2VuLmhyZWYsIHRva2VuLnRpdGxlLCB0b2tlbi50ZXh0KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjYXNlICdzdHJvbmcnOiB7XG4gICAgICAgICAgb3V0ICs9IHJlbmRlcmVyLnN0cm9uZyh0aGlzLnBhcnNlSW5saW5lKHRva2VuLnRva2VucywgcmVuZGVyZXIpKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjYXNlICdlbSc6IHtcbiAgICAgICAgICBvdXQgKz0gcmVuZGVyZXIuZW0odGhpcy5wYXJzZUlubGluZSh0b2tlbi50b2tlbnMsIHJlbmRlcmVyKSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAnY29kZXNwYW4nOiB7XG4gICAgICAgICAgb3V0ICs9IHJlbmRlcmVyLmNvZGVzcGFuKHRva2VuLnRleHQpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgJ2JyJzoge1xuICAgICAgICAgIG91dCArPSByZW5kZXJlci5icigpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgJ2RlbCc6IHtcbiAgICAgICAgICBvdXQgKz0gcmVuZGVyZXIuZGVsKHRoaXMucGFyc2VJbmxpbmUodG9rZW4udG9rZW5zLCByZW5kZXJlcikpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgJ3RleHQnOiB7XG4gICAgICAgICAgb3V0ICs9IHJlbmRlcmVyLnRleHQodG9rZW4udGV4dCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgZGVmYXVsdDoge1xuICAgICAgICAgIGNvbnN0IGVyck1zZyA9ICdUb2tlbiB3aXRoIFwiJyArIHRva2VuLnR5cGUgKyAnXCIgdHlwZSB3YXMgbm90IGZvdW5kLic7XG4gICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5zaWxlbnQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyTXNnKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVyck1zZyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvdXQ7XG4gIH1cbn1cblxuY2xhc3MgSG9va3Mge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyB8fCBkZWZhdWx0cztcbiAgfVxuXG4gIHN0YXRpYyBwYXNzVGhyb3VnaEhvb2tzID0gbmV3IFNldChbXG4gICAgJ3ByZXByb2Nlc3MnLFxuICAgICdwb3N0cHJvY2VzcydcbiAgXSk7XG5cbiAgLyoqXG4gICAqIFByb2Nlc3MgbWFya2Rvd24gYmVmb3JlIG1hcmtlZFxuICAgKi9cbiAgcHJlcHJvY2VzcyhtYXJrZG93bikge1xuICAgIHJldHVybiBtYXJrZG93bjtcbiAgfVxuXG4gIC8qKlxuICAgKiBQcm9jZXNzIEhUTUwgYWZ0ZXIgbWFya2VkIGlzIGZpbmlzaGVkXG4gICAqL1xuICBwb3N0cHJvY2VzcyhodG1sKSB7XG4gICAgcmV0dXJuIGh0bWw7XG4gIH1cbn1cblxuZnVuY3Rpb24gb25FcnJvcihzaWxlbnQsIGFzeW5jLCBjYWxsYmFjaykge1xuICByZXR1cm4gKGUpID0+IHtcbiAgICBlLm1lc3NhZ2UgKz0gJ1xcblBsZWFzZSByZXBvcnQgdGhpcyB0byBodHRwczovL2dpdGh1Yi5jb20vbWFya2VkanMvbWFya2VkLic7XG5cbiAgICBpZiAoc2lsZW50KSB7XG4gICAgICBjb25zdCBtc2cgPSAnPHA+QW4gZXJyb3Igb2NjdXJyZWQ6PC9wPjxwcmU+J1xuICAgICAgICArIGVzY2FwZShlLm1lc3NhZ2UgKyAnJywgdHJ1ZSlcbiAgICAgICAgKyAnPC9wcmU+JztcbiAgICAgIGlmIChhc3luYykge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG1zZyk7XG4gICAgICB9XG4gICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgY2FsbGJhY2sobnVsbCwgbXNnKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG1zZztcbiAgICB9XG5cbiAgICBpZiAoYXN5bmMpIHtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdChlKTtcbiAgICB9XG4gICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICBjYWxsYmFjayhlKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhyb3cgZTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gcGFyc2VNYXJrZG93bihsZXhlciwgcGFyc2VyKSB7XG4gIHJldHVybiAoc3JjLCBvcHQsIGNhbGxiYWNrKSA9PiB7XG4gICAgaWYgKHR5cGVvZiBvcHQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNhbGxiYWNrID0gb3B0O1xuICAgICAgb3B0ID0gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCBvcmlnT3B0ID0geyAuLi5vcHQgfTtcbiAgICBvcHQgPSB7IC4uLm1hcmtlZC5kZWZhdWx0cywgLi4ub3JpZ09wdCB9O1xuICAgIGNvbnN0IHRocm93RXJyb3IgPSBvbkVycm9yKG9wdC5zaWxlbnQsIG9wdC5hc3luYywgY2FsbGJhY2spO1xuXG4gICAgLy8gdGhyb3cgZXJyb3IgaW4gY2FzZSBvZiBub24gc3RyaW5nIGlucHV0XG4gICAgaWYgKHR5cGVvZiBzcmMgPT09ICd1bmRlZmluZWQnIHx8IHNyYyA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIHRocm93RXJyb3IobmV3IEVycm9yKCdtYXJrZWQoKTogaW5wdXQgcGFyYW1ldGVyIGlzIHVuZGVmaW5lZCBvciBudWxsJykpO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIHNyYyAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHJldHVybiB0aHJvd0Vycm9yKG5ldyBFcnJvcignbWFya2VkKCk6IGlucHV0IHBhcmFtZXRlciBpcyBvZiB0eXBlICdcbiAgICAgICAgKyBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoc3JjKSArICcsIHN0cmluZyBleHBlY3RlZCcpKTtcbiAgICB9XG5cbiAgICBjaGVja1Nhbml0aXplRGVwcmVjYXRpb24ob3B0KTtcblxuICAgIGlmIChvcHQuaG9va3MpIHtcbiAgICAgIG9wdC5ob29rcy5vcHRpb25zID0gb3B0O1xuICAgIH1cblxuICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgY29uc3QgaGlnaGxpZ2h0ID0gb3B0LmhpZ2hsaWdodDtcbiAgICAgIGxldCB0b2tlbnM7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGlmIChvcHQuaG9va3MpIHtcbiAgICAgICAgICBzcmMgPSBvcHQuaG9va3MucHJlcHJvY2VzcyhzcmMpO1xuICAgICAgICB9XG4gICAgICAgIHRva2VucyA9IGxleGVyKHNyYywgb3B0KTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgcmV0dXJuIHRocm93RXJyb3IoZSk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGRvbmUgPSBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgbGV0IG91dDtcblxuICAgICAgICBpZiAoIWVycikge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAob3B0LndhbGtUb2tlbnMpIHtcbiAgICAgICAgICAgICAgbWFya2VkLndhbGtUb2tlbnModG9rZW5zLCBvcHQud2Fsa1Rva2Vucyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvdXQgPSBwYXJzZXIodG9rZW5zLCBvcHQpO1xuICAgICAgICAgICAgaWYgKG9wdC5ob29rcykge1xuICAgICAgICAgICAgICBvdXQgPSBvcHQuaG9va3MucG9zdHByb2Nlc3Mob3V0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBlcnIgPSBlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIG9wdC5oaWdobGlnaHQgPSBoaWdobGlnaHQ7XG5cbiAgICAgICAgcmV0dXJuIGVyclxuICAgICAgICAgID8gdGhyb3dFcnJvcihlcnIpXG4gICAgICAgICAgOiBjYWxsYmFjayhudWxsLCBvdXQpO1xuICAgICAgfTtcblxuICAgICAgaWYgKCFoaWdobGlnaHQgfHwgaGlnaGxpZ2h0Lmxlbmd0aCA8IDMpIHtcbiAgICAgICAgcmV0dXJuIGRvbmUoKTtcbiAgICAgIH1cblxuICAgICAgZGVsZXRlIG9wdC5oaWdobGlnaHQ7XG5cbiAgICAgIGlmICghdG9rZW5zLmxlbmd0aCkgcmV0dXJuIGRvbmUoKTtcblxuICAgICAgbGV0IHBlbmRpbmcgPSAwO1xuICAgICAgbWFya2VkLndhbGtUb2tlbnModG9rZW5zLCBmdW5jdGlvbih0b2tlbikge1xuICAgICAgICBpZiAodG9rZW4udHlwZSA9PT0gJ2NvZGUnKSB7XG4gICAgICAgICAgcGVuZGluZysrO1xuICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgaGlnaGxpZ2h0KHRva2VuLnRleHQsIHRva2VuLmxhbmcsIGZ1bmN0aW9uKGVyciwgY29kZSkge1xuICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRvbmUoZXJyKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAoY29kZSAhPSBudWxsICYmIGNvZGUgIT09IHRva2VuLnRleHQpIHtcbiAgICAgICAgICAgICAgICB0b2tlbi50ZXh0ID0gY29kZTtcbiAgICAgICAgICAgICAgICB0b2tlbi5lc2NhcGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIHBlbmRpbmctLTtcbiAgICAgICAgICAgICAgaWYgKHBlbmRpbmcgPT09IDApIHtcbiAgICAgICAgICAgICAgICBkb25lKCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0sIDApO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgaWYgKHBlbmRpbmcgPT09IDApIHtcbiAgICAgICAgZG9uZSgpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKG9wdC5hc3luYykge1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShvcHQuaG9va3MgPyBvcHQuaG9va3MucHJlcHJvY2VzcyhzcmMpIDogc3JjKVxuICAgICAgICAudGhlbihzcmMgPT4gbGV4ZXIoc3JjLCBvcHQpKVxuICAgICAgICAudGhlbih0b2tlbnMgPT4gb3B0LndhbGtUb2tlbnMgPyBQcm9taXNlLmFsbChtYXJrZWQud2Fsa1Rva2Vucyh0b2tlbnMsIG9wdC53YWxrVG9rZW5zKSkudGhlbigoKSA9PiB0b2tlbnMpIDogdG9rZW5zKVxuICAgICAgICAudGhlbih0b2tlbnMgPT4gcGFyc2VyKHRva2Vucywgb3B0KSlcbiAgICAgICAgLnRoZW4oaHRtbCA9PiBvcHQuaG9va3MgPyBvcHQuaG9va3MucG9zdHByb2Nlc3MoaHRtbCkgOiBodG1sKVxuICAgICAgICAuY2F0Y2godGhyb3dFcnJvcik7XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIGlmIChvcHQuaG9va3MpIHtcbiAgICAgICAgc3JjID0gb3B0Lmhvb2tzLnByZXByb2Nlc3Moc3JjKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHRva2VucyA9IGxleGVyKHNyYywgb3B0KTtcbiAgICAgIGlmIChvcHQud2Fsa1Rva2Vucykge1xuICAgICAgICBtYXJrZWQud2Fsa1Rva2Vucyh0b2tlbnMsIG9wdC53YWxrVG9rZW5zKTtcbiAgICAgIH1cbiAgICAgIGxldCBodG1sID0gcGFyc2VyKHRva2Vucywgb3B0KTtcbiAgICAgIGlmIChvcHQuaG9va3MpIHtcbiAgICAgICAgaHRtbCA9IG9wdC5ob29rcy5wb3N0cHJvY2VzcyhodG1sKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBodG1sO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiB0aHJvd0Vycm9yKGUpO1xuICAgIH1cbiAgfTtcbn1cblxuLyoqXG4gKiBNYXJrZWRcbiAqL1xuZnVuY3Rpb24gbWFya2VkKHNyYywgb3B0LCBjYWxsYmFjaykge1xuICByZXR1cm4gcGFyc2VNYXJrZG93bihMZXhlci5sZXgsIFBhcnNlci5wYXJzZSkoc3JjLCBvcHQsIGNhbGxiYWNrKTtcbn1cblxuLyoqXG4gKiBPcHRpb25zXG4gKi9cblxubWFya2VkLm9wdGlvbnMgPVxubWFya2VkLnNldE9wdGlvbnMgPSBmdW5jdGlvbihvcHQpIHtcbiAgbWFya2VkLmRlZmF1bHRzID0geyAuLi5tYXJrZWQuZGVmYXVsdHMsIC4uLm9wdCB9O1xuICBjaGFuZ2VEZWZhdWx0cyhtYXJrZWQuZGVmYXVsdHMpO1xuICByZXR1cm4gbWFya2VkO1xufTtcblxubWFya2VkLmdldERlZmF1bHRzID0gZ2V0RGVmYXVsdHM7XG5cbm1hcmtlZC5kZWZhdWx0cyA9IGRlZmF1bHRzO1xuXG4vKipcbiAqIFVzZSBFeHRlbnNpb25cbiAqL1xuXG5tYXJrZWQudXNlID0gZnVuY3Rpb24oLi4uYXJncykge1xuICBjb25zdCBleHRlbnNpb25zID0gbWFya2VkLmRlZmF1bHRzLmV4dGVuc2lvbnMgfHwgeyByZW5kZXJlcnM6IHt9LCBjaGlsZFRva2Vuczoge30gfTtcblxuICBhcmdzLmZvckVhY2goKHBhY2spID0+IHtcbiAgICAvLyBjb3B5IG9wdGlvbnMgdG8gbmV3IG9iamVjdFxuICAgIGNvbnN0IG9wdHMgPSB7IC4uLnBhY2sgfTtcblxuICAgIC8vIHNldCBhc3luYyB0byB0cnVlIGlmIGl0IHdhcyBzZXQgdG8gdHJ1ZSBiZWZvcmVcbiAgICBvcHRzLmFzeW5jID0gbWFya2VkLmRlZmF1bHRzLmFzeW5jIHx8IG9wdHMuYXN5bmMgfHwgZmFsc2U7XG5cbiAgICAvLyA9PS0tIFBhcnNlIFwiYWRkb25cIiBleHRlbnNpb25zIC0tPT0gLy9cbiAgICBpZiAocGFjay5leHRlbnNpb25zKSB7XG4gICAgICBwYWNrLmV4dGVuc2lvbnMuZm9yRWFjaCgoZXh0KSA9PiB7XG4gICAgICAgIGlmICghZXh0Lm5hbWUpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2V4dGVuc2lvbiBuYW1lIHJlcXVpcmVkJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGV4dC5yZW5kZXJlcikgeyAvLyBSZW5kZXJlciBleHRlbnNpb25zXG4gICAgICAgICAgY29uc3QgcHJldlJlbmRlcmVyID0gZXh0ZW5zaW9ucy5yZW5kZXJlcnNbZXh0Lm5hbWVdO1xuICAgICAgICAgIGlmIChwcmV2UmVuZGVyZXIpIHtcbiAgICAgICAgICAgIC8vIFJlcGxhY2UgZXh0ZW5zaW9uIHdpdGggZnVuYyB0byBydW4gbmV3IGV4dGVuc2lvbiBidXQgZmFsbCBiYWNrIGlmIGZhbHNlXG4gICAgICAgICAgICBleHRlbnNpb25zLnJlbmRlcmVyc1tleHQubmFtZV0gPSBmdW5jdGlvbiguLi5hcmdzKSB7XG4gICAgICAgICAgICAgIGxldCByZXQgPSBleHQucmVuZGVyZXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgICAgIGlmIChyZXQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgcmV0ID0gcHJldlJlbmRlcmVyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiByZXQ7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBleHRlbnNpb25zLnJlbmRlcmVyc1tleHQubmFtZV0gPSBleHQucmVuZGVyZXI7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChleHQudG9rZW5pemVyKSB7IC8vIFRva2VuaXplciBFeHRlbnNpb25zXG4gICAgICAgICAgaWYgKCFleHQubGV2ZWwgfHwgKGV4dC5sZXZlbCAhPT0gJ2Jsb2NrJyAmJiBleHQubGV2ZWwgIT09ICdpbmxpbmUnKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiZXh0ZW5zaW9uIGxldmVsIG11c3QgYmUgJ2Jsb2NrJyBvciAnaW5saW5lJ1wiKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGV4dGVuc2lvbnNbZXh0LmxldmVsXSkge1xuICAgICAgICAgICAgZXh0ZW5zaW9uc1tleHQubGV2ZWxdLnVuc2hpZnQoZXh0LnRva2VuaXplcik7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGV4dGVuc2lvbnNbZXh0LmxldmVsXSA9IFtleHQudG9rZW5pemVyXTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGV4dC5zdGFydCkgeyAvLyBGdW5jdGlvbiB0byBjaGVjayBmb3Igc3RhcnQgb2YgdG9rZW5cbiAgICAgICAgICAgIGlmIChleHQubGV2ZWwgPT09ICdibG9jaycpIHtcbiAgICAgICAgICAgICAgaWYgKGV4dGVuc2lvbnMuc3RhcnRCbG9jaykge1xuICAgICAgICAgICAgICAgIGV4dGVuc2lvbnMuc3RhcnRCbG9jay5wdXNoKGV4dC5zdGFydCk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZXh0ZW5zaW9ucy5zdGFydEJsb2NrID0gW2V4dC5zdGFydF07XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZXh0LmxldmVsID09PSAnaW5saW5lJykge1xuICAgICAgICAgICAgICBpZiAoZXh0ZW5zaW9ucy5zdGFydElubGluZSkge1xuICAgICAgICAgICAgICAgIGV4dGVuc2lvbnMuc3RhcnRJbmxpbmUucHVzaChleHQuc3RhcnQpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGV4dGVuc2lvbnMuc3RhcnRJbmxpbmUgPSBbZXh0LnN0YXJ0XTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoZXh0LmNoaWxkVG9rZW5zKSB7IC8vIENoaWxkIHRva2VucyB0byBiZSB2aXNpdGVkIGJ5IHdhbGtUb2tlbnNcbiAgICAgICAgICBleHRlbnNpb25zLmNoaWxkVG9rZW5zW2V4dC5uYW1lXSA9IGV4dC5jaGlsZFRva2VucztcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBvcHRzLmV4dGVuc2lvbnMgPSBleHRlbnNpb25zO1xuICAgIH1cblxuICAgIC8vID09LS0gUGFyc2UgXCJvdmVyd3JpdGVcIiBleHRlbnNpb25zIC0tPT0gLy9cbiAgICBpZiAocGFjay5yZW5kZXJlcikge1xuICAgICAgY29uc3QgcmVuZGVyZXIgPSBtYXJrZWQuZGVmYXVsdHMucmVuZGVyZXIgfHwgbmV3IFJlbmRlcmVyKCk7XG4gICAgICBmb3IgKGNvbnN0IHByb3AgaW4gcGFjay5yZW5kZXJlcikge1xuICAgICAgICBjb25zdCBwcmV2UmVuZGVyZXIgPSByZW5kZXJlcltwcm9wXTtcbiAgICAgICAgLy8gUmVwbGFjZSByZW5kZXJlciB3aXRoIGZ1bmMgdG8gcnVuIGV4dGVuc2lvbiwgYnV0IGZhbGwgYmFjayBpZiBmYWxzZVxuICAgICAgICByZW5kZXJlcltwcm9wXSA9ICguLi5hcmdzKSA9PiB7XG4gICAgICAgICAgbGV0IHJldCA9IHBhY2sucmVuZGVyZXJbcHJvcF0uYXBwbHkocmVuZGVyZXIsIGFyZ3MpO1xuICAgICAgICAgIGlmIChyZXQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICByZXQgPSBwcmV2UmVuZGVyZXIuYXBwbHkocmVuZGVyZXIsIGFyZ3MpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gcmV0O1xuICAgICAgICB9O1xuICAgICAgfVxuICAgICAgb3B0cy5yZW5kZXJlciA9IHJlbmRlcmVyO1xuICAgIH1cbiAgICBpZiAocGFjay50b2tlbml6ZXIpIHtcbiAgICAgIGNvbnN0IHRva2VuaXplciA9IG1hcmtlZC5kZWZhdWx0cy50b2tlbml6ZXIgfHwgbmV3IFRva2VuaXplcigpO1xuICAgICAgZm9yIChjb25zdCBwcm9wIGluIHBhY2sudG9rZW5pemVyKSB7XG4gICAgICAgIGNvbnN0IHByZXZUb2tlbml6ZXIgPSB0b2tlbml6ZXJbcHJvcF07XG4gICAgICAgIC8vIFJlcGxhY2UgdG9rZW5pemVyIHdpdGggZnVuYyB0byBydW4gZXh0ZW5zaW9uLCBidXQgZmFsbCBiYWNrIGlmIGZhbHNlXG4gICAgICAgIHRva2VuaXplcltwcm9wXSA9ICguLi5hcmdzKSA9PiB7XG4gICAgICAgICAgbGV0IHJldCA9IHBhY2sudG9rZW5pemVyW3Byb3BdLmFwcGx5KHRva2VuaXplciwgYXJncyk7XG4gICAgICAgICAgaWYgKHJldCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHJldCA9IHByZXZUb2tlbml6ZXIuYXBwbHkodG9rZW5pemVyLCBhcmdzKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHJldDtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIG9wdHMudG9rZW5pemVyID0gdG9rZW5pemVyO1xuICAgIH1cblxuICAgIC8vID09LS0gUGFyc2UgSG9va3MgZXh0ZW5zaW9ucyAtLT09IC8vXG4gICAgaWYgKHBhY2suaG9va3MpIHtcbiAgICAgIGNvbnN0IGhvb2tzID0gbWFya2VkLmRlZmF1bHRzLmhvb2tzIHx8IG5ldyBIb29rcygpO1xuICAgICAgZm9yIChjb25zdCBwcm9wIGluIHBhY2suaG9va3MpIHtcbiAgICAgICAgY29uc3QgcHJldkhvb2sgPSBob29rc1twcm9wXTtcbiAgICAgICAgaWYgKEhvb2tzLnBhc3NUaHJvdWdoSG9va3MuaGFzKHByb3ApKSB7XG4gICAgICAgICAgaG9va3NbcHJvcF0gPSAoYXJnKSA9PiB7XG4gICAgICAgICAgICBpZiAobWFya2VkLmRlZmF1bHRzLmFzeW5jKSB7XG4gICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUocGFjay5ob29rc1twcm9wXS5jYWxsKGhvb2tzLCBhcmcpKS50aGVuKHJldCA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByZXZIb29rLmNhbGwoaG9va3MsIHJldCk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCByZXQgPSBwYWNrLmhvb2tzW3Byb3BdLmNhbGwoaG9va3MsIGFyZyk7XG4gICAgICAgICAgICByZXR1cm4gcHJldkhvb2suY2FsbChob29rcywgcmV0KTtcbiAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGhvb2tzW3Byb3BdID0gKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgICAgIGxldCByZXQgPSBwYWNrLmhvb2tzW3Byb3BdLmFwcGx5KGhvb2tzLCBhcmdzKTtcbiAgICAgICAgICAgIGlmIChyZXQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgIHJldCA9IHByZXZIb29rLmFwcGx5KGhvb2tzLCBhcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXQ7XG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgb3B0cy5ob29rcyA9IGhvb2tzO1xuICAgIH1cblxuICAgIC8vID09LS0gUGFyc2UgV2Fsa1Rva2VucyBleHRlbnNpb25zIC0tPT0gLy9cbiAgICBpZiAocGFjay53YWxrVG9rZW5zKSB7XG4gICAgICBjb25zdCB3YWxrVG9rZW5zID0gbWFya2VkLmRlZmF1bHRzLndhbGtUb2tlbnM7XG4gICAgICBvcHRzLndhbGtUb2tlbnMgPSBmdW5jdGlvbih0b2tlbikge1xuICAgICAgICBsZXQgdmFsdWVzID0gW107XG4gICAgICAgIHZhbHVlcy5wdXNoKHBhY2sud2Fsa1Rva2Vucy5jYWxsKHRoaXMsIHRva2VuKSk7XG4gICAgICAgIGlmICh3YWxrVG9rZW5zKSB7XG4gICAgICAgICAgdmFsdWVzID0gdmFsdWVzLmNvbmNhdCh3YWxrVG9rZW5zLmNhbGwodGhpcywgdG9rZW4pKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdmFsdWVzO1xuICAgICAgfTtcbiAgICB9XG5cbiAgICBtYXJrZWQuc2V0T3B0aW9ucyhvcHRzKTtcbiAgfSk7XG59O1xuXG4vKipcbiAqIFJ1biBjYWxsYmFjayBmb3IgZXZlcnkgdG9rZW5cbiAqL1xuXG5tYXJrZWQud2Fsa1Rva2VucyA9IGZ1bmN0aW9uKHRva2VucywgY2FsbGJhY2spIHtcbiAgbGV0IHZhbHVlcyA9IFtdO1xuICBmb3IgKGNvbnN0IHRva2VuIG9mIHRva2Vucykge1xuICAgIHZhbHVlcyA9IHZhbHVlcy5jb25jYXQoY2FsbGJhY2suY2FsbChtYXJrZWQsIHRva2VuKSk7XG4gICAgc3dpdGNoICh0b2tlbi50eXBlKSB7XG4gICAgICBjYXNlICd0YWJsZSc6IHtcbiAgICAgICAgZm9yIChjb25zdCBjZWxsIG9mIHRva2VuLmhlYWRlcikge1xuICAgICAgICAgIHZhbHVlcyA9IHZhbHVlcy5jb25jYXQobWFya2VkLndhbGtUb2tlbnMoY2VsbC50b2tlbnMsIGNhbGxiYWNrKSk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChjb25zdCByb3cgb2YgdG9rZW4ucm93cykge1xuICAgICAgICAgIGZvciAoY29uc3QgY2VsbCBvZiByb3cpIHtcbiAgICAgICAgICAgIHZhbHVlcyA9IHZhbHVlcy5jb25jYXQobWFya2VkLndhbGtUb2tlbnMoY2VsbC50b2tlbnMsIGNhbGxiYWNrKSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgY2FzZSAnbGlzdCc6IHtcbiAgICAgICAgdmFsdWVzID0gdmFsdWVzLmNvbmNhdChtYXJrZWQud2Fsa1Rva2Vucyh0b2tlbi5pdGVtcywgY2FsbGJhY2spKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBkZWZhdWx0OiB7XG4gICAgICAgIGlmIChtYXJrZWQuZGVmYXVsdHMuZXh0ZW5zaW9ucyAmJiBtYXJrZWQuZGVmYXVsdHMuZXh0ZW5zaW9ucy5jaGlsZFRva2VucyAmJiBtYXJrZWQuZGVmYXVsdHMuZXh0ZW5zaW9ucy5jaGlsZFRva2Vuc1t0b2tlbi50eXBlXSkgeyAvLyBXYWxrIGFueSBleHRlbnNpb25zXG4gICAgICAgICAgbWFya2VkLmRlZmF1bHRzLmV4dGVuc2lvbnMuY2hpbGRUb2tlbnNbdG9rZW4udHlwZV0uZm9yRWFjaChmdW5jdGlvbihjaGlsZFRva2Vucykge1xuICAgICAgICAgICAgdmFsdWVzID0gdmFsdWVzLmNvbmNhdChtYXJrZWQud2Fsa1Rva2Vucyh0b2tlbltjaGlsZFRva2Vuc10sIGNhbGxiYWNrKSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSBpZiAodG9rZW4udG9rZW5zKSB7XG4gICAgICAgICAgdmFsdWVzID0gdmFsdWVzLmNvbmNhdChtYXJrZWQud2Fsa1Rva2Vucyh0b2tlbi50b2tlbnMsIGNhbGxiYWNrKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHZhbHVlcztcbn07XG5cbi8qKlxuICogUGFyc2UgSW5saW5lXG4gKiBAcGFyYW0ge3N0cmluZ30gc3JjXG4gKi9cbm1hcmtlZC5wYXJzZUlubGluZSA9IHBhcnNlTWFya2Rvd24oTGV4ZXIubGV4SW5saW5lLCBQYXJzZXIucGFyc2VJbmxpbmUpO1xuXG4vKipcbiAqIEV4cG9zZVxuICovXG5tYXJrZWQuUGFyc2VyID0gUGFyc2VyO1xubWFya2VkLnBhcnNlciA9IFBhcnNlci5wYXJzZTtcbm1hcmtlZC5SZW5kZXJlciA9IFJlbmRlcmVyO1xubWFya2VkLlRleHRSZW5kZXJlciA9IFRleHRSZW5kZXJlcjtcbm1hcmtlZC5MZXhlciA9IExleGVyO1xubWFya2VkLmxleGVyID0gTGV4ZXIubGV4O1xubWFya2VkLlRva2VuaXplciA9IFRva2VuaXplcjtcbm1hcmtlZC5TbHVnZ2VyID0gU2x1Z2dlcjtcbm1hcmtlZC5Ib29rcyA9IEhvb2tzO1xubWFya2VkLnBhcnNlID0gbWFya2VkO1xuXG5jb25zdCBvcHRpb25zID0gbWFya2VkLm9wdGlvbnM7XG5jb25zdCBzZXRPcHRpb25zID0gbWFya2VkLnNldE9wdGlvbnM7XG5jb25zdCB1c2UgPSBtYXJrZWQudXNlO1xuY29uc3Qgd2Fsa1Rva2VucyA9IG1hcmtlZC53YWxrVG9rZW5zO1xuY29uc3QgcGFyc2VJbmxpbmUgPSBtYXJrZWQucGFyc2VJbmxpbmU7XG5jb25zdCBwYXJzZSA9IG1hcmtlZDtcbmNvbnN0IHBhcnNlciA9IFBhcnNlci5wYXJzZTtcbmNvbnN0IGxleGVyID0gTGV4ZXIubGV4O1xuXG5leHBvcnQgeyBIb29rcywgTGV4ZXIsIFBhcnNlciwgUmVuZGVyZXIsIFNsdWdnZXIsIFRleHRSZW5kZXJlciwgVG9rZW5pemVyLCBkZWZhdWx0cywgZ2V0RGVmYXVsdHMsIGxleGVyLCBtYXJrZWQsIG9wdGlvbnMsIHBhcnNlLCBwYXJzZUlubGluZSwgcGFyc2VyLCBzZXRPcHRpb25zLCB1c2UsIHdhbGtUb2tlbnMgfTtcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuX193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG5cdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuXHRcdGZ1bmN0aW9uKCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuXHRcdGZ1bmN0aW9uKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCB7IGE6IGdldHRlciB9KTtcblx0cmV0dXJuIGdldHRlcjtcbn07IiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgZGVmaW5pdGlvbikge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmosIHByb3ApIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApOyB9IiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJ2YXIgX19hc3NpZ24gPSAodGhpcyAmJiB0aGlzLl9fYXNzaWduKSB8fCBmdW5jdGlvbiAoKSB7XG4gICAgX19hc3NpZ24gPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uKHQpIHtcbiAgICAgICAgZm9yICh2YXIgcywgaSA9IDEsIG4gPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbjsgaSsrKSB7XG4gICAgICAgICAgICBzID0gYXJndW1lbnRzW2ldO1xuICAgICAgICAgICAgZm9yICh2YXIgcCBpbiBzKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHMsIHApKVxuICAgICAgICAgICAgICAgIHRbcF0gPSBzW3BdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0O1xuICAgIH07XG4gICAgcmV0dXJuIF9fYXNzaWduLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59O1xudmFyIF9fYXdhaXRlciA9ICh0aGlzICYmIHRoaXMuX19hd2FpdGVyKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgX2FyZ3VtZW50cywgUCwgZ2VuZXJhdG9yKSB7XG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XG4gICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGZ1bmN0aW9uIGZ1bGZpbGxlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvci5uZXh0KHZhbHVlKSk7IH0gY2F0Y2ggKGUpIHsgcmVqZWN0KGUpOyB9IH1cbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHN0ZXAocmVzdWx0KSB7IHJlc3VsdC5kb25lID8gcmVzb2x2ZShyZXN1bHQudmFsdWUpIDogYWRvcHQocmVzdWx0LnZhbHVlKS50aGVuKGZ1bGZpbGxlZCwgcmVqZWN0ZWQpOyB9XG4gICAgICAgIHN0ZXAoKGdlbmVyYXRvciA9IGdlbmVyYXRvci5hcHBseSh0aGlzQXJnLCBfYXJndW1lbnRzIHx8IFtdKSkubmV4dCgpKTtcbiAgICB9KTtcbn07XG52YXIgX19nZW5lcmF0b3IgPSAodGhpcyAmJiB0aGlzLl9fZ2VuZXJhdG9yKSB8fCBmdW5jdGlvbiAodGhpc0FyZywgYm9keSkge1xuICAgIHZhciBfID0geyBsYWJlbDogMCwgc2VudDogZnVuY3Rpb24oKSB7IGlmICh0WzBdICYgMSkgdGhyb3cgdFsxXTsgcmV0dXJuIHRbMV07IH0sIHRyeXM6IFtdLCBvcHM6IFtdIH0sIGYsIHksIHQsIGc7XG4gICAgcmV0dXJuIGcgPSB7IG5leHQ6IHZlcmIoMCksIFwidGhyb3dcIjogdmVyYigxKSwgXCJyZXR1cm5cIjogdmVyYigyKSB9LCB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgKGdbU3ltYm9sLml0ZXJhdG9yXSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdGhpczsgfSksIGc7XG4gICAgZnVuY3Rpb24gdmVyYihuKSB7IHJldHVybiBmdW5jdGlvbiAodikgeyByZXR1cm4gc3RlcChbbiwgdl0pOyB9OyB9XG4gICAgZnVuY3Rpb24gc3RlcChvcCkge1xuICAgICAgICBpZiAoZikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkdlbmVyYXRvciBpcyBhbHJlYWR5IGV4ZWN1dGluZy5cIik7XG4gICAgICAgIHdoaWxlIChnICYmIChnID0gMCwgb3BbMF0gJiYgKF8gPSAwKSksIF8pIHRyeSB7XG4gICAgICAgICAgICBpZiAoZiA9IDEsIHkgJiYgKHQgPSBvcFswXSAmIDIgPyB5W1wicmV0dXJuXCJdIDogb3BbMF0gPyB5W1widGhyb3dcIl0gfHwgKCh0ID0geVtcInJldHVyblwiXSkgJiYgdC5jYWxsKHkpLCAwKSA6IHkubmV4dCkgJiYgISh0ID0gdC5jYWxsKHksIG9wWzFdKSkuZG9uZSkgcmV0dXJuIHQ7XG4gICAgICAgICAgICBpZiAoeSA9IDAsIHQpIG9wID0gW29wWzBdICYgMiwgdC52YWx1ZV07XG4gICAgICAgICAgICBzd2l0Y2ggKG9wWzBdKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAwOiBjYXNlIDE6IHQgPSBvcDsgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSA0OiBfLmxhYmVsKys7IHJldHVybiB7IHZhbHVlOiBvcFsxXSwgZG9uZTogZmFsc2UgfTtcbiAgICAgICAgICAgICAgICBjYXNlIDU6IF8ubGFiZWwrKzsgeSA9IG9wWzFdOyBvcCA9IFswXTsgY29udGludWU7XG4gICAgICAgICAgICAgICAgY2FzZSA3OiBvcCA9IF8ub3BzLnBvcCgpOyBfLnRyeXMucG9wKCk7IGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIGlmICghKHQgPSBfLnRyeXMsIHQgPSB0Lmxlbmd0aCA+IDAgJiYgdFt0Lmxlbmd0aCAtIDFdKSAmJiAob3BbMF0gPT09IDYgfHwgb3BbMF0gPT09IDIpKSB7IF8gPSAwOyBjb250aW51ZTsgfVxuICAgICAgICAgICAgICAgICAgICBpZiAob3BbMF0gPT09IDMgJiYgKCF0IHx8IChvcFsxXSA+IHRbMF0gJiYgb3BbMV0gPCB0WzNdKSkpIHsgXy5sYWJlbCA9IG9wWzFdOyBicmVhazsgfVxuICAgICAgICAgICAgICAgICAgICBpZiAob3BbMF0gPT09IDYgJiYgXy5sYWJlbCA8IHRbMV0pIHsgXy5sYWJlbCA9IHRbMV07IHQgPSBvcDsgYnJlYWs7IH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHQgJiYgXy5sYWJlbCA8IHRbMl0pIHsgXy5sYWJlbCA9IHRbMl07IF8ub3BzLnB1c2gob3ApOyBicmVhazsgfVxuICAgICAgICAgICAgICAgICAgICBpZiAodFsyXSkgXy5vcHMucG9wKCk7XG4gICAgICAgICAgICAgICAgICAgIF8udHJ5cy5wb3AoKTsgY29udGludWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvcCA9IGJvZHkuY2FsbCh0aGlzQXJnLCBfKTtcbiAgICAgICAgfSBjYXRjaCAoZSkgeyBvcCA9IFs2LCBlXTsgeSA9IDA7IH0gZmluYWxseSB7IGYgPSB0ID0gMDsgfVxuICAgICAgICBpZiAob3BbMF0gJiA1KSB0aHJvdyBvcFsxXTsgcmV0dXJuIHsgdmFsdWU6IG9wWzBdID8gb3BbMV0gOiB2b2lkIDAsIGRvbmU6IHRydWUgfTtcbiAgICB9XG59O1xuaW1wb3J0IHsgZ2V0X3Jlc2VhcmNoX3RleHQgfSBmcm9tIFwiLi9jaGF0XCI7XG5pbXBvcnQgeyBnZXRfaGVybyB9IGZyb20gXCIuL2dldF9oZXJvXCI7XG5pbXBvcnQgeyBjbGlwLCBsYXN0Q2xpcCB9IGZyb20gXCIuL2hvdGtleVwiO1xuaW1wb3J0IHsgcmVuZGVyTGVkZ2VyIH0gZnJvbSBcIi4vbGVkZ2VyXCI7XG5pbXBvcnQgeyBtZXJnZVVzZXIgfSBmcm9tIFwiLi91dGlsaXRpZXMvbWVyZ2VcIjtcbmltcG9ydCB7IGlzX3ZhbGlkX2ltYWdlX3VybCwgaXNfdmFsaWRfeW91dHViZSB9IGZyb20gXCIuL3V0aWxpdGllcy9wYXJzZV91dGlsc1wiO1xuaW1wb3J0IHsgYW55U3RhckNhblNlZSwgZHJhd092ZXJsYXlTdHJpbmcgfSBmcm9tIFwiLi91dGlsaXRpZXMvZ3JhcGhpY3NcIjtcbmltcG9ydCB7IGhvb2tfbnBjX3RpY2tfY291bnRlciB9IGZyb20gXCIuL3V0aWxpdGllcy9ucGNfY2FsY1wiO1xuaW1wb3J0IHsgZ2V0X2FwZV9iYWRnZXMsIEFwZUJhZGdlSWNvbiwgZ3JvdXBBcGVCYWRnZXMsIH0gZnJvbSBcIi4vdXRpbGl0aWVzL3BsYXllcl9iYWRnZXNcIjtcbmltcG9ydCB7IEFwZUdpZnRJdGVtLCBidXlBcGVHaWZ0U2NyZWVuIH0gZnJvbSBcIi4vdXRpbGl0aWVzL2dpZnRfc2NyZWVuXCI7XG5pbXBvcnQgeyBmZXRjaEZpbHRlcmVkTWVzc2FnZXMgfSBmcm9tIFwiLi91dGlsaXRpZXMvZmV0Y2hfbWVzc2FnZXNcIjtcbmltcG9ydCB7IHNldF9nYW1lX3N0YXRlIH0gZnJvbSBcIi4vZ2FtZV9zdGF0ZVwiO1xuaW1wb3J0IHsgaG9va19zdGFyX21hbmFnZXIgfSBmcm9tIFwiLi91dGlsaXRpZXMvc3Rhcl9tYW5hZ2VyXCI7XG5pbXBvcnQgeyB1bmlxdWUgfSBmcm9tIFwid2VicGFjay1tZXJnZVwiO1xudmFyIFNBVF9WRVJTSU9OID0gXCJnaXQtdmVyc2lvblwiO1xuaWYgKE5lcHR1bmVzUHJpZGUgPT09IHVuZGVmaW5lZCkge1xuICAgIHRoaXNHYW1lLm5lcHR1bmVzUHJpZGUgPSBOZXB0dW5lc1ByaWRlO1xufVxuU3RyaW5nLnByb3RvdHlwZS50b1Byb3BlckNhc2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmVwbGFjZSgvXFx3XFxTKi9nLCBmdW5jdGlvbiAodHh0KSB7XG4gICAgICAgIHJldHVybiB0eHQuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyB0eHQuc3Vic3RyKDEpLnRvTG93ZXJDYXNlKCk7XG4gICAgfSk7XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoQXJyYXkucHJvdG90eXBlLCB7XG4gICAgY291bnQ6IHtcbiAgICAgICAgdmFsdWU6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmlsdGVyKGZ1bmN0aW9uICh4KSB7IHJldHVybiB4ID09IHZhbHVlOyB9KS5sZW5ndGg7XG4gICAgICAgIH0sXG4gICAgfSxcbn0pO1xuLyogRXh0cmEgQmFkZ2VzICovXG52YXIgYXBlX3BsYXllcnMgPSBbXTtcbmZ1bmN0aW9uIGdldF9hcGVfcGxheWVycygpIHtcbiAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBfX2dlbmVyYXRvcih0aGlzLCBmdW5jdGlvbiAoX2EpIHtcbiAgICAgICAgICAgIGdldF9hcGVfYmFkZ2VzKClcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAocGxheWVycykge1xuICAgICAgICAgICAgICAgIGFwZV9wbGF5ZXJzID0gcGxheWVycztcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uIChlcnIpIHsgcmV0dXJuIGNvbnNvbGUubG9nKFwiRVJST1I6IFVuYWJsZSB0byBnZXQgQVBFIHBsYXllcnNcIiwgZXJyKTsgfSk7XG4gICAgICAgICAgICByZXR1cm4gWzIgLypyZXR1cm4qL107XG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxuZ2V0X2FwZV9wbGF5ZXJzKCk7XG4vL092ZXJyaWRlIHdpZGdldCBpbnRlZmFjZXNcbnZhciBvdmVycmlkZUJhZGdlV2lkZ2V0cyA9IGZ1bmN0aW9uICgpIHtcbiAgICBOZXB0dW5lc1ByaWRlLm5wdWkuYmFkZ2VGaWxlTmFtZXNbXCJhXCJdID0gXCJhcGVcIjtcbiAgICB2YXIgaW1hZ2VfdXJsID0gJChcIiNhcGUtaW50ZWwtcGx1Z2luXCIpLmF0dHIoXCJpbWFnZXNcIik7XG4gICAgTmVwdHVuZXNQcmlkZS5ucHVpLkJhZGdlSWNvbiA9IGZ1bmN0aW9uIChmaWxlbmFtZSwgY291bnQsIHNtYWxsKSB7XG4gICAgICAgIHJldHVybiBBcGVCYWRnZUljb24oQ3J1eCwgaW1hZ2VfdXJsLCBmaWxlbmFtZSwgY291bnQsIHNtYWxsKTtcbiAgICB9O1xufTtcbnZhciBvdmVycmlkZVRlbXBsYXRlcyA9IGZ1bmN0aW9uICgpIHtcbiAgICBOZXB0dW5lc1ByaWRlLnRlbXBsYXRlc1tcImdpZnRfZGVzY19hcGVcIl0gPVxuICAgICAgICBcIjxoMz5BcGUgLSA0MjAgQ3JlZGl0PC9oMz48cD5JcyB0aGlzIHdoYXQgeW91IGNhbGwgJ2V2b2x1dGlvbic/IEJlY2F1c2UgZnJhbmtseSwgSSd2ZSBzZWVuIGJldHRlciBkZXNpZ25zIG9mIGEgYmFuYW5hIHBlZWwuPC9wPlwiO1xuICAgIENydXgubG9jYWxpc2UgPSBmdW5jdGlvbiAoaWQpIHtcbiAgICAgICAgaWYgKENydXgudGVtcGxhdGVzW2lkXSkge1xuICAgICAgICAgICAgcmV0dXJuIENydXgudGVtcGxhdGVzW2lkXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBpZC50b1Byb3BlckNhc2UoKTtcbiAgICAgICAgfVxuICAgIH07XG59O1xudmFyIG92ZXJyaWRlR2lmdEl0ZW1zID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBpbWFnZV91cmwgPSAkKFwiI2FwZS1pbnRlbC1wbHVnaW5cIikuYXR0cihcImltYWdlc1wiKTtcbiAgICBjb25zb2xlLmxvZyhpbWFnZV91cmwpO1xuICAgIE5lcHR1bmVzUHJpZGUubnB1aS5CdXlHaWZ0U2NyZWVuID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gYnV5QXBlR2lmdFNjcmVlbihDcnV4LCBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlLCBOZXB0dW5lc1ByaWRlLm5wdWkpO1xuICAgIH07XG4gICAgTmVwdHVuZXNQcmlkZS5ucHVpLkdpZnRJdGVtID0gZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgcmV0dXJuIEFwZUdpZnRJdGVtKENydXgsIGltYWdlX3VybCwgaXRlbSk7XG4gICAgfTtcbn07XG52YXIgb3ZlcnJpZGVTaG93U2NyZWVuID0gZnVuY3Rpb24gKCkge1xuICAgIE5lcHR1bmVzUHJpZGUubnB1aS5vblNob3dTY3JlZW4gPSBmdW5jdGlvbiAoZXZlbnQsIHNjcmVlbk5hbWUsIHNjcmVlbkNvbmZpZykge1xuICAgICAgICByZXR1cm4gb25TaG93QXBlU2NyZWVuKE5lcHR1bmVzUHJpZGUubnB1aSwgTmVwdHVuZXNQcmlkZS51bml2ZXJzZSwgZXZlbnQsIHNjcmVlbk5hbWUsIHNjcmVlbkNvbmZpZyk7XG4gICAgfTtcbn07XG4kKFwiYXBlLWludGVsLXBsdWdpblwiKS5yZWFkeShmdW5jdGlvbiAoKSB7XG4gICAgLy9wb3N0X2hvb2soKTtcbiAgICAvLyQoXCIjYXBlLWludGVsLXBsdWdpblwiKS5yZW1vdmUoKTtcbn0pO1xuZnVuY3Rpb24gcG9zdF9ob29rKCkge1xuICAgIHNldF9nYW1lX3N0YXRlKE5lcHR1bmVzUHJpZGUsIENydXgpO1xuICAgIG92ZXJyaWRlR2lmdEl0ZW1zKCk7XG4gICAgLy9vdmVycmlkZVNob3dTY3JlZW4oKTsgLy9Ob3QgbmVlZGVkIHVubGVzcyBJIHdhbnQgdG8gYWRkIG5ldyBvbmVzLlxuICAgIG92ZXJyaWRlVGVtcGxhdGVzKCk7XG4gICAgb3ZlcnJpZGVCYWRnZVdpZGdldHMoKTtcbiAgICBTQVRfVkVSU0lPTiA9ICQoXCIjYXBlLWludGVsLXBsdWdpblwiKS5hdHRyKFwidGl0bGVcIik7XG4gICAgY29uc29sZS5sb2coU0FUX1ZFUlNJT04sIFwiTG9hZGVkXCIpO1xuICAgIHJlbmRlckxlZGdlcihNb3VzZXRyYXApO1xuICAgIC8vT3ZlcnJpZGUgaW5ib3ggRmV0Y2ggTWVzc2FnZXNcbiAgICAvL05lcHR1bmVzUHJpZGUuaW5ib3guZmV0Y2hNZXNzYWdlcyA9IChmaWx0ZXIpPT5mZXRjaEZpbHRlcmVkTWVzc2FnZXMoTmVwdHVuZXNQcmlkZSxDcnV4LE5lcHR1bmVzUHJpZGUuaW5ib3gsZmlsdGVyKVxuICAgIC8vTlBDIENhbGNcbiAgICBob29rX25wY190aWNrX2NvdW50ZXIoKTtcbiAgICAvL1N0YXIgTWFuYWdlclxuICAgIGhvb2tfc3Rhcl9tYW5hZ2VyKE5lcHR1bmVzUHJpZGUudW5pdmVyc2UpO1xufVxuZnVuY3Rpb24gb25HYW1lUmVuZGVyKCkge1xuICAgIE5lcHR1bmVzUHJpZGUubnAub24oXCJvcmRlcjpmdWxsX3VuaXZlcnNlXCIsIHBvc3RfaG9vayk7XG59XG4vL1RPRE86IE9yZ2FuaXplIHR5cGVzY3JpcHQgdG8gYW4gaW50ZXJmYWNlcyBkaXJlY3Rvcnlcbi8vVE9ETzogVGhlbiBtYWtlIG90aGVyIGdhbWUgZW5naW5lIG9iamVjdHNcbi8vIFBhcnQgb2YgeW91ciBjb2RlIGlzIHJlLWNyZWF0aW5nIHRoZSBnYW1lIGluIHR5cGVzY3JpcHRcbi8vIFRoZSBvdGhlciBwYXJ0IGlzIGFkZGluZyBmZWF0dXJlc1xuLy8gVGhlbiB0aGVyZSBpcyBhIHNlZ21lbnQgdGhhdCBpcyBvdmVyd3JpdGluZyBleGlzdGluZyBjb250ZW50IHRvIGFkZCBzbWFsbCBhZGRpdGlvbnMuXG4vL0FkZCBjdXN0b20gc2V0dGluZ3Mgd2hlbiBtYWtpbmcgYSBud2UgZ2FtZS5cbmZ1bmN0aW9uIG1vZGlmeV9jdXN0b21fZ2FtZSgpIHtcbiAgICBjb25zb2xlLmxvZyhcIlJ1bm5pbmcgY3VzdG9tIGdhbWUgc2V0dGluZ3MgbW9kaWZpY2F0aW9uXCIpO1xuICAgIHZhciBzZWxlY3RvciA9ICQoXCIjY29udGVudEFyZWEgPiBkaXYgPiBkaXYud2lkZ2V0LmZ1bGxzY3JlZW4gPiBkaXYud2lkZ2V0LnJlbCA+IGRpdjpudGgtY2hpbGQoNCkgPiBkaXY6bnRoLWNoaWxkKDE1KSA+IHNlbGVjdFwiKVswXTtcbiAgICBpZiAoc2VsZWN0b3IgPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIC8vTm90IGluIG1lbnVcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGV4dFN0cmluZyA9IFwiXCI7XG4gICAgZm9yICh2YXIgaSA9IDI7IGkgPD0gMzI7ICsraSkge1xuICAgICAgICB0ZXh0U3RyaW5nICs9IFwiPG9wdGlvbiB2YWx1ZT1cXFwiXCIuY29uY2F0KGksIFwiXFxcIj5cIikuY29uY2F0KGksIFwiIFBsYXllcnM8L29wdGlvbj5cIik7XG4gICAgfVxuICAgIGNvbnNvbGUubG9nKHRleHRTdHJpbmcpO1xuICAgIHNlbGVjdG9yLmlubmVySFRNTCA9IHRleHRTdHJpbmc7XG59XG5zZXRUaW1lb3V0KG1vZGlmeV9jdXN0b21fZ2FtZSwgNTAwKTtcbi8vVE9ETzogTWFrZSBpcyB3aXRoaW4gc2Nhbm5pbmcgZnVuY3Rpb25cbi8vU2hhcmUgYWxsIHRlY2ggZGlzcGxheSBhcyB0ZWNoIGlzIGFjdGl2ZWx5IHRyYWRpbmcuXG52YXIgZGlzcGxheV90ZWNoX3RyYWRpbmcgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIG5wdWkgPSBOZXB0dW5lc1ByaWRlLm5wdWk7XG4gICAgdmFyIHRlY2hfdHJhZGVfc2NyZWVuID0gbnB1aS5TY3JlZW4oXCJ0ZWNoX3RyYWRpbmdcIik7XG4gICAgbnB1aS5vbkhpZGVTY3JlZW4obnVsbCwgdHJ1ZSk7XG4gICAgbnB1aS5vbkhpZGVTZWxlY3Rpb25NZW51KCk7XG4gICAgbnB1aS50cmlnZ2VyKFwiaGlkZV9zaWRlX21lbnVcIik7XG4gICAgbnB1aS50cmlnZ2VyKFwicmVzZXRfZWRpdF9tb2RlXCIpO1xuICAgIG5wdWkuYWN0aXZlU2NyZWVuID0gdGVjaF90cmFkZV9zY3JlZW47XG4gICAgdGVjaF90cmFkZV9zY3JlZW4ucm9vc3QobnB1aS5zY3JlZW5Db250YWluZXIpO1xuICAgIG5wdWkubGF5b3V0RWxlbWVudCh0ZWNoX3RyYWRlX3NjcmVlbik7XG4gICAgdmFyIHRyYWRpbmcgPSBDcnV4LlRleHQoXCJcIiwgXCJyZWwgcGFkMTJcIikucmF3SFRNTChcIlRyYWRpbmcuLlwiKTtcbiAgICB0cmFkaW5nLnJvb3N0KHRlY2hfdHJhZGVfc2NyZWVuKTtcbiAgICB0ZWNoX3RyYWRlX3NjcmVlbi50cmFuc2FjdCA9IGZ1bmN0aW9uICh0ZXh0KSB7XG4gICAgICAgIHZhciB0cmFkaW5nID0gQ3J1eC5UZXh0KFwiXCIsIFwicmVsIHBhZDhcIikucmF3SFRNTCh0ZXh0KTtcbiAgICAgICAgdHJhZGluZy5yb29zdCh0ZWNoX3RyYWRlX3NjcmVlbik7XG4gICAgfTtcbiAgICByZXR1cm4gdGVjaF90cmFkZV9zY3JlZW47XG59O1xuLy9SZXR1cm5zIGFsbCBzdGFycyBJIHN1cHBvc2VcbnZhciBfZ2V0X3N0YXJfZ2lzID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBzdGFycyA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2UuZ2FsYXh5LnN0YXJzO1xuICAgIHZhciBvdXRwdXQgPSBbXTtcbiAgICBmb3IgKHZhciBzIGluIHN0YXJzKSB7XG4gICAgICAgIHZhciBzdGFyID0gc3RhcnNbc107XG4gICAgICAgIG91dHB1dC5wdXNoKHtcbiAgICAgICAgICAgIHg6IHN0YXIueCxcbiAgICAgICAgICAgIHk6IHN0YXIueSxcbiAgICAgICAgICAgIG93bmVyOiBzdGFyLnF1YWxpZmllZEFsaWFzLFxuICAgICAgICAgICAgZWNvbm9teTogc3Rhci5lLFxuICAgICAgICAgICAgaW5kdXN0cnk6IHN0YXIuaSxcbiAgICAgICAgICAgIHNjaWVuY2U6IHN0YXIucyxcbiAgICAgICAgICAgIHNoaXBzOiBzdGFyLnRvdGFsRGVmZW5zZXMsXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gb3V0cHV0O1xufTtcbnZhciBfZ2V0X3dlYXBvbnNfbmV4dCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcmVzZWFyY2ggPSBnZXRfcmVzZWFyY2goKTtcbiAgICBpZiAocmVzZWFyY2hbXCJjdXJyZW50X25hbWVcIl0gPT0gXCJXZWFwb25zXCIpIHtcbiAgICAgICAgcmV0dXJuIHJlc2VhcmNoW1wiY3VycmVudF9ldGFcIl07XG4gICAgfVxuICAgIGVsc2UgaWYgKHJlc2VhcmNoW1wibmV4dF9uYW1lXCJdID09IFwiV2VhcG9uc1wiKSB7XG4gICAgICAgIHJldHVybiByZXNlYXJjaFtcIm5leHRfZXRhXCJdO1xuICAgIH1cbiAgICByZXR1cm4gTWF0aC5wb3coMTAsIDEwKTtcbn07XG52YXIgZ2V0X3RlY2hfdHJhZGVfY29zdCA9IGZ1bmN0aW9uIChmcm9tLCB0bywgdGVjaF9uYW1lKSB7XG4gICAgaWYgKHRlY2hfbmFtZSA9PT0gdm9pZCAwKSB7IHRlY2hfbmFtZSA9IG51bGw7IH1cbiAgICB2YXIgdG90YWxfY29zdCA9IDA7XG4gICAgZm9yICh2YXIgX2kgPSAwLCBfYSA9IE9iamVjdC5lbnRyaWVzKHRvLnRlY2gpOyBfaSA8IF9hLmxlbmd0aDsgX2krKykge1xuICAgICAgICB2YXIgX2IgPSBfYVtfaV0sIHRlY2ggPSBfYlswXSwgdmFsdWUgPSBfYlsxXTtcbiAgICAgICAgaWYgKHRlY2hfbmFtZSA9PSBudWxsIHx8IHRlY2hfbmFtZSA9PSB0ZWNoKSB7XG4gICAgICAgICAgICB2YXIgbWUgPSBmcm9tLnRlY2hbdGVjaF0ubGV2ZWw7XG4gICAgICAgICAgICB2YXIgeW91ID0gdmFsdWUubGV2ZWw7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8PSBtZSAtIHlvdTsgKytpKSB7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyh0ZWNoLCh5b3UraSksKHlvdStpKSoxNSlcbiAgICAgICAgICAgICAgICB0b3RhbF9jb3N0ICs9ICh5b3UgKyBpKSAqIE5lcHR1bmVzUHJpZGUuZ2FtZUNvbmZpZy50cmFkZUNvc3Q7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRvdGFsX2Nvc3Q7XG59O1xuLy9Ib29rcyB0byBidXR0b25zIGZvciBzaGFyaW5nIGFuZCBidXlpbmdcbi8vUHJldHR5IHNpbXBsZSBob29rcyB0aGF0IGNhbiBiZSBhZGRlZCB0byBhIHR5cGVzY3JpcHQgZmlsZS5cbnZhciBhcHBseV9ob29rcyA9IGZ1bmN0aW9uICgpIHtcbiAgICBOZXB0dW5lc1ByaWRlLm5wLm9uKFwic2hhcmVfYWxsX3RlY2hcIiwgZnVuY3Rpb24gKGV2ZW50LCBwbGF5ZXIpIHtcbiAgICAgICAgdmFyIHRvdGFsX2Nvc3QgPSBnZXRfdGVjaF90cmFkZV9jb3N0KGdldF9oZXJvKE5lcHR1bmVzUHJpZGUudW5pdmVyc2UpLCBwbGF5ZXIpO1xuICAgICAgICBOZXB0dW5lc1ByaWRlLnRlbXBsYXRlc1tcImNvbmZpcm1fdGVjaF9zaGFyZV9cIi5jb25jYXQocGxheWVyLnVpZCldID0gXCJBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gc3BlbmQgJFwiLmNvbmNhdCh0b3RhbF9jb3N0LCBcIiB0byBnaXZlIFwiKS5jb25jYXQocGxheWVyLnJhd0FsaWFzLCBcIiBhbGwgb2YgeW91ciB0ZWNoP1wiKTtcbiAgICAgICAgTmVwdHVuZXNQcmlkZS5ucC50cmlnZ2VyKFwic2hvd19zY3JlZW5cIiwgW1xuICAgICAgICAgICAgXCJjb25maXJtXCIsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbWVzc2FnZTogXCJjb25maXJtX3RlY2hfc2hhcmVfXCIuY29uY2F0KHBsYXllci51aWQpLFxuICAgICAgICAgICAgICAgIGV2ZW50S2luZDogXCJjb25maXJtX3RyYWRlX3RlY2hcIixcbiAgICAgICAgICAgICAgICBldmVudERhdGE6IHBsYXllcixcbiAgICAgICAgICAgIH0sXG4gICAgICAgIF0pO1xuICAgIH0pO1xuICAgIE5lcHR1bmVzUHJpZGUubnAub24oXCJidXlfYWxsX3RlY2hcIiwgZnVuY3Rpb24gKGV2ZW50LCBkYXRhKSB7XG4gICAgICAgIHZhciBwbGF5ZXIgPSBkYXRhLnBsYXllcjtcbiAgICAgICAgdmFyIGNvc3QgPSBkYXRhLmNvc3Q7XG4gICAgICAgIE5lcHR1bmVzUHJpZGUudGVtcGxhdGVzW1wiY29uZmlybV90ZWNoX3NoYXJlX1wiLmNvbmNhdChwbGF5ZXIudWlkKV0gPSBcIkFyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBzcGVuZCAkXCIuY29uY2F0KGNvc3QsIFwiIHRvIGJ1eSBhbGwgb2YgXCIpLmNvbmNhdChwbGF5ZXIucmF3QWxpYXMsIFwiJ3MgdGVjaD8gSXQgaXMgdXAgdG8gdGhlbSB0byBhY3R1YWxseSBzZW5kIGl0IHRvIHlvdS5cIik7XG4gICAgICAgIE5lcHR1bmVzUHJpZGUubnAudHJpZ2dlcihcInNob3dfc2NyZWVuXCIsIFtcbiAgICAgICAgICAgIFwiY29uZmlybVwiLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IFwiY29uZmlybV90ZWNoX3NoYXJlX1wiLmNvbmNhdChwbGF5ZXIudWlkKSxcbiAgICAgICAgICAgICAgICBldmVudEtpbmQ6IFwiY29uZmlybV9idXlfdGVjaFwiLFxuICAgICAgICAgICAgICAgIGV2ZW50RGF0YTogZGF0YSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIF0pO1xuICAgIH0pO1xuICAgIE5lcHR1bmVzUHJpZGUubnAub24oXCJidXlfb25lX3RlY2hcIiwgZnVuY3Rpb24gKGV2ZW50LCBkYXRhKSB7XG4gICAgICAgIHZhciBwbGF5ZXIgPSBkYXRhLnBsYXllcjtcbiAgICAgICAgdmFyIHRlY2ggPSBkYXRhLnRlY2g7XG4gICAgICAgIHZhciBjb3N0ID0gZGF0YS5jb3N0O1xuICAgICAgICBOZXB0dW5lc1ByaWRlLnRlbXBsYXRlc1tcImNvbmZpcm1fdGVjaF9zaGFyZV9cIi5jb25jYXQocGxheWVyLnVpZCldID0gXCJBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gc3BlbmQgJFwiLmNvbmNhdChjb3N0LCBcIiB0byBidXkgXCIpLmNvbmNhdCh0ZWNoLCBcIiBmcm9tIFwiKS5jb25jYXQocGxheWVyLnJhd0FsaWFzLCBcIj8gSXQgaXMgdXAgdG8gdGhlbSB0byBhY3R1YWxseSBzZW5kIGl0IHRvIHlvdS5cIik7XG4gICAgICAgIE5lcHR1bmVzUHJpZGUubnAudHJpZ2dlcihcInNob3dfc2NyZWVuXCIsIFtcbiAgICAgICAgICAgIFwiY29uZmlybVwiLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2U6IFwiY29uZmlybV90ZWNoX3NoYXJlX1wiLmNvbmNhdChwbGF5ZXIudWlkKSxcbiAgICAgICAgICAgICAgICBldmVudEtpbmQ6IFwiY29uZmlybV9idXlfdGVjaFwiLFxuICAgICAgICAgICAgICAgIGV2ZW50RGF0YTogZGF0YSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgIF0pO1xuICAgIH0pO1xuICAgIE5lcHR1bmVzUHJpZGUubnAub24oXCJjb25maXJtX3RyYWRlX3RlY2hcIiwgZnVuY3Rpb24gKGV2ZW4sIHBsYXllcikge1xuICAgICAgICB2YXIgaGVybyA9IGdldF9oZXJvKE5lcHR1bmVzUHJpZGUudW5pdmVyc2UpO1xuICAgICAgICB2YXIgZGlzcGxheSA9IGRpc3BsYXlfdGVjaF90cmFkaW5nKCk7XG4gICAgICAgIHZhciBjbG9zZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIE5lcHR1bmVzUHJpZGUudW5pdmVyc2Uuc2VsZWN0UGxheWVyKHBsYXllcik7XG4gICAgICAgICAgICBOZXB0dW5lc1ByaWRlLm5wLnRyaWdnZXIoXCJyZWZyZXNoX2ludGVyZmFjZVwiKTtcbiAgICAgICAgICAgIE5lcHR1bmVzUHJpZGUubnAubnB1aS5yZWZyZXNoVHVybk1hbmFnZXIoKTtcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIG9mZnNldCA9IDMwMDtcbiAgICAgICAgdmFyIF9sb29wXzEgPSBmdW5jdGlvbiAodGVjaCwgdmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBtZSA9IGhlcm8udGVjaFt0ZWNoXS5sZXZlbDtcbiAgICAgICAgICAgIHZhciB5b3UgPSB2YWx1ZS5sZXZlbDtcbiAgICAgICAgICAgIHZhciBfbG9vcF8yID0gZnVuY3Rpb24gKGkpIHtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cobWUgLSB5b3UsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwib3JkZXJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIG9yZGVyOiBcInNoYXJlX3RlY2gsXCIuY29uY2F0KHBsYXllci51aWQsIFwiLFwiKS5jb25jYXQodGVjaCksXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBkaXNwbGF5LnRyYW5zYWN0KFwiU2VuZGluZyBcIi5jb25jYXQodGVjaCwgXCIgbGV2ZWwgXCIpLmNvbmNhdCh5b3UgKyBpKSk7XG4gICAgICAgICAgICAgICAgICAgIE5lcHR1bmVzUHJpZGUubnAudHJpZ2dlcihcInNlcnZlcl9yZXF1ZXN0XCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IFwib3JkZXJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIG9yZGVyOiBcInNoYXJlX3RlY2gsXCIuY29uY2F0KHBsYXllci51aWQsIFwiLFwiKS5jb25jYXQodGVjaCksXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaSA9PSBtZSAtIHlvdSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGlzcGxheS50cmFuc2FjdChcIkRvbmUuXCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgb2Zmc2V0KTtcbiAgICAgICAgICAgICAgICBvZmZzZXQgKz0gMTAwMDtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8PSBtZSAtIHlvdTsgKytpKSB7XG4gICAgICAgICAgICAgICAgX2xvb3BfMihpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgZm9yICh2YXIgX2kgPSAwLCBfYSA9IE9iamVjdC5lbnRyaWVzKHBsYXllci50ZWNoKTsgX2kgPCBfYS5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgIHZhciBfYiA9IF9hW19pXSwgdGVjaCA9IF9iWzBdLCB2YWx1ZSA9IF9iWzFdO1xuICAgICAgICAgICAgX2xvb3BfMSh0ZWNoLCB2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgc2V0VGltZW91dChjbG9zZSwgb2Zmc2V0ICsgMTAwMCk7XG4gICAgfSk7XG4gICAgLy9QYXlzIGEgcGxheWVyIGEgY2VydGFpbiBhbW91bnRcbiAgICBOZXB0dW5lc1ByaWRlLm5wLm9uKFwiY29uZmlybV9idXlfdGVjaFwiLCBmdW5jdGlvbiAoZXZlbiwgZGF0YSkge1xuICAgICAgICB2YXIgcGxheWVyID0gZGF0YS5wbGF5ZXI7XG4gICAgICAgIE5lcHR1bmVzUHJpZGUubnAudHJpZ2dlcihcInNlcnZlcl9yZXF1ZXN0XCIsIHtcbiAgICAgICAgICAgIHR5cGU6IFwib3JkZXJcIixcbiAgICAgICAgICAgIG9yZGVyOiBcInNlbmRfbW9uZXksXCIuY29uY2F0KHBsYXllci51aWQsIFwiLFwiKS5jb25jYXQoZGF0YS5jb3N0KSxcbiAgICAgICAgfSk7XG4gICAgICAgIE5lcHR1bmVzUHJpZGUudW5pdmVyc2Uuc2VsZWN0UGxheWVyKHBsYXllcik7XG4gICAgICAgIE5lcHR1bmVzUHJpZGUubnAudHJpZ2dlcihcInJlZnJlc2hfaW50ZXJmYWNlXCIpO1xuICAgIH0pO1xufTtcbnZhciBfd2lkZV92aWV3ID0gZnVuY3Rpb24gKCkge1xuICAgIE5lcHR1bmVzUHJpZGUubnAudHJpZ2dlcihcIm1hcF9jZW50ZXJfc2xpZGVcIiwgeyB4OiAwLCB5OiAwIH0pO1xuICAgIE5lcHR1bmVzUHJpZGUubnAudHJpZ2dlcihcInpvb21fbWluaW1hcFwiKTtcbn07XG5mdW5jdGlvbiBMZWdhY3lfTmVwdHVuZXNQcmlkZUFnZW50KCkge1xuICAgIHZhciBfYSwgX2I7XG4gICAgdmFyIHRpdGxlID0gKChfYSA9IGRvY3VtZW50ID09PSBudWxsIHx8IGRvY3VtZW50ID09PSB2b2lkIDAgPyB2b2lkIDAgOiBkb2N1bWVudC5jdXJyZW50U2NyaXB0KSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2EudGl0bGUpIHx8IFwiU0FUIFwiLmNvbmNhdChTQVRfVkVSU0lPTik7XG4gICAgdmFyIHZlcnNpb24gPSB0aXRsZS5yZXBsYWNlKC9eLip2LywgXCJ2XCIpO1xuICAgIHZhciBjb3B5ID0gZnVuY3Rpb24gKHJlcG9ydEZuKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXBvcnRGbigpO1xuICAgICAgICAgICAgbmF2aWdhdG9yLmNsaXBib2FyZC53cml0ZVRleHQobGFzdENsaXApO1xuICAgICAgICB9O1xuICAgIH07XG4gICAgdmFyIGhvdGtleXMgPSBbXTtcbiAgICB2YXIgaG90a2V5ID0gZnVuY3Rpb24gKGtleSwgYWN0aW9uKSB7XG4gICAgICAgIGhvdGtleXMucHVzaChba2V5LCBhY3Rpb25dKTtcbiAgICAgICAgTW91c2V0cmFwLmJpbmQoa2V5LCBjb3B5KGFjdGlvbikpO1xuICAgIH07XG4gICAgaWYgKCFTdHJpbmcucHJvdG90eXBlLmZvcm1hdCkge1xuICAgICAgICBTdHJpbmcucHJvdG90eXBlLmZvcm1hdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBhcmdzID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgYXJndW1lbnRzLmxlbmd0aDsgX2krKykge1xuICAgICAgICAgICAgICAgIGFyZ3NbX2ldID0gYXJndW1lbnRzW19pXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGlzLnJlcGxhY2UoL3soXFxkKyl9L2csIGZ1bmN0aW9uIChtYXRjaCwgbnVtYmVyKSB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBhcmdzW251bWJlcl0gPT09IFwibnVtYmVyXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIE1hdGgudHJ1bmMoYXJnc1tudW1iZXJdICogMTAwMCkgLyAxMDAwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gdHlwZW9mIGFyZ3NbbnVtYmVyXSAhPSBcInVuZGVmaW5lZFwiID8gYXJnc1tudW1iZXJdIDogbWF0Y2g7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgdmFyIGxpbmtGbGVldHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciB1bml2ZXJzZSA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2U7XG4gICAgICAgIHZhciBmbGVldHMgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlLmdhbGF4eS5mbGVldHM7XG4gICAgICAgIGZvciAodmFyIGYgaW4gZmxlZXRzKSB7XG4gICAgICAgICAgICB2YXIgZmxlZXQgPSBmbGVldHNbZl07XG4gICAgICAgICAgICB2YXIgZmxlZXRMaW5rID0gXCI8YSBvbkNsaWNrPSdDcnV4LmNydXgudHJpZ2dlcihcXFwic2hvd19mbGVldF91aWRcXFwiLCBcXFwiXCIuY29uY2F0KGZsZWV0LnVpZCwgXCJcXFwiKSc+XCIpLmNvbmNhdChmbGVldC5uLCBcIjwvYT5cIik7XG4gICAgICAgICAgICB1bml2ZXJzZS5oeXBlcmxpbmtlZE1lc3NhZ2VJbnNlcnRzW2ZsZWV0Lm5dID0gZmxlZXRMaW5rO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBmdW5jdGlvbiBzdGFyUmVwb3J0KCkge1xuICAgICAgICB2YXIgcGxheWVycyA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2UuZ2FsYXh5LnBsYXllcnM7XG4gICAgICAgIHZhciBzdGFycyA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2UuZ2FsYXh5LnN0YXJzO1xuICAgICAgICB2YXIgb3V0cHV0ID0gW107XG4gICAgICAgIGZvciAodmFyIHAgaW4gcGxheWVycykge1xuICAgICAgICAgICAgb3V0cHV0LnB1c2goXCJbW3swfV1dXCIuZm9ybWF0KHApKTtcbiAgICAgICAgICAgIGZvciAodmFyIHMgaW4gc3RhcnMpIHtcbiAgICAgICAgICAgICAgICB2YXIgc3RhciA9IHN0YXJzW3NdO1xuICAgICAgICAgICAgICAgIGlmIChzdGFyLnB1aWQgPT0gcCAmJiBzdGFyLnNoaXBzUGVyVGljayA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIG91dHB1dC5wdXNoKFwi4oCD4oCDW1t7MH1dXSB7MX0vezJ9L3szfSB7NH0gc2hpcHNcIi5mb3JtYXQoc3Rhci5uLCBzdGFyLmUsIHN0YXIuaSwgc3Rhci5zLCBzdGFyLnRvdGFsRGVmZW5zZXMpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2xpcChvdXRwdXQuam9pbihcIlxcblwiKSk7XG4gICAgfVxuICAgIGhvdGtleShcIipcIiwgc3RhclJlcG9ydCk7XG4gICAgc3RhclJlcG9ydC5oZWxwID1cbiAgICAgICAgXCJHZW5lcmF0ZSBhIHJlcG9ydCBvbiBhbGwgc3RhcnMgaW4geW91ciBzY2FubmluZyByYW5nZSwgYW5kIGNvcHkgaXQgdG8gdGhlIGNsaXBib2FyZC5cIiArXG4gICAgICAgICAgICBcIjxwPlRoaXMgc2FtZSByZXBvcnQgY2FuIGFsc28gYmUgdmlld2VkIHZpYSB0aGUgbWVudTsgZW50ZXIgdGhlIGFnZW50IGFuZCBjaG9vc2UgaXQgZnJvbSB0aGUgZHJvcGRvd24uXCI7XG4gICAgdmFyIGFtcG0gPSBmdW5jdGlvbiAoaCwgbSkge1xuICAgICAgICBpZiAobSA8IDEwKVxuICAgICAgICAgICAgbSA9IFwiMFwiLmNvbmNhdChtKTtcbiAgICAgICAgaWYgKGggPCAxMikge1xuICAgICAgICAgICAgaWYgKGggPT0gMClcbiAgICAgICAgICAgICAgICBoID0gMTI7XG4gICAgICAgICAgICByZXR1cm4gXCJ7MH06ezF9IEFNXCIuZm9ybWF0KGgsIG0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGggPiAxMikge1xuICAgICAgICAgICAgcmV0dXJuIFwiezB9OnsxfSBQTVwiLmZvcm1hdChoIC0gMTIsIG0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBcInswfTp7MX0gUE1cIi5mb3JtYXQoaCwgbSk7XG4gICAgfTtcbiAgICB2YXIgbXNUb1RpY2sgPSBmdW5jdGlvbiAodGljaywgd2hvbGVUaW1lKSB7XG4gICAgICAgIHZhciB1bml2ZXJzZSA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2U7XG4gICAgICAgIHZhciBtc19zaW5jZV9kYXRhID0gMDtcbiAgICAgICAgdmFyIHRmID0gdW5pdmVyc2UuZ2FsYXh5LnRpY2tfZnJhZ21lbnQ7XG4gICAgICAgIHZhciBsdGMgPSB1bml2ZXJzZS5sb2NUaW1lQ29ycmVjdGlvbjtcbiAgICAgICAgaWYgKCF1bml2ZXJzZS5nYWxheHkucGF1c2VkKSB7XG4gICAgICAgICAgICBtc19zaW5jZV9kYXRhID0gbmV3IERhdGUoKS52YWx1ZU9mKCkgLSB1bml2ZXJzZS5ub3cudmFsdWVPZigpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh3aG9sZVRpbWUgfHwgdW5pdmVyc2UuZ2FsYXh5LnR1cm5fYmFzZWQpIHtcbiAgICAgICAgICAgIG1zX3NpbmNlX2RhdGEgPSAwO1xuICAgICAgICAgICAgdGYgPSAwO1xuICAgICAgICAgICAgbHRjID0gMDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgbXNfcmVtYWluaW5nID0gdGljayAqIDEwMDAgKiA2MCAqIHVuaXZlcnNlLmdhbGF4eS50aWNrX3JhdGUgLVxuICAgICAgICAgICAgdGYgKiAxMDAwICogNjAgKiB1bml2ZXJzZS5nYWxheHkudGlja19yYXRlIC1cbiAgICAgICAgICAgIG1zX3NpbmNlX2RhdGEgLVxuICAgICAgICAgICAgbHRjO1xuICAgICAgICByZXR1cm4gbXNfcmVtYWluaW5nO1xuICAgIH07XG4gICAgdmFyIGRheXMgPSBbXCJTdW5cIiwgXCJNb25cIiwgXCJUdWVcIiwgXCJXZWRcIiwgXCJUaHVcIiwgXCJGcmlcIiwgXCJTYXRcIl07XG4gICAgdmFyIG1zVG9FdGFTdHJpbmcgPSBmdW5jdGlvbiAobXNwbHVzLCBwcmVmaXgpIHtcbiAgICAgICAgdmFyIG5vdyA9IG5ldyBEYXRlKCk7XG4gICAgICAgIHZhciBhcnJpdmFsID0gbmV3IERhdGUobm93LmdldFRpbWUoKSArIG1zcGx1cyk7XG4gICAgICAgIHZhciBwID0gcHJlZml4ICE9PSB1bmRlZmluZWQgPyBwcmVmaXggOiBcIkVUQSBcIjtcbiAgICAgICAgLy9XaGF0IGlzIHR0dD9cbiAgICAgICAgdmFyIHR0dCA9IHAgKyBhbXBtKGFycml2YWwuZ2V0SG91cnMoKSwgYXJyaXZhbC5nZXRNaW51dGVzKCkpO1xuICAgICAgICBpZiAoIU5lcHR1bmVzUHJpZGUuZ2FtZUNvbmZpZy50dXJuQmFzZWQpIHtcbiAgICAgICAgICAgIHR0dCA9IHAgKyBhbXBtKGFycml2YWwuZ2V0SG91cnMoKSwgYXJyaXZhbC5nZXRNaW51dGVzKCkpO1xuICAgICAgICAgICAgaWYgKGFycml2YWwuZ2V0RGF5KCkgIT0gbm93LmdldERheSgpKVxuICAgICAgICAgICAgICAgIC8vIEdlbmVyYXRlIHRpbWUgc3RyaW5nXG4gICAgICAgICAgICAgICAgdHR0ID0gXCJcIi5jb25jYXQocCkuY29uY2F0KGRheXNbYXJyaXZhbC5nZXREYXkoKV0sIFwiIEAgXCIpLmNvbmNhdChhbXBtKGFycml2YWwuZ2V0SG91cnMoKSwgYXJyaXZhbC5nZXRNaW51dGVzKCkpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHZhciB0b3RhbEVUQSA9IGFycml2YWwgLSBub3c7XG4gICAgICAgICAgICB0dHQgPSBwICsgQ3J1eC5mb3JtYXRUaW1lKHRvdGFsRVRBKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHR0O1xuICAgIH07XG4gICAgdmFyIHRpY2tUb0V0YVN0cmluZyA9IGZ1bmN0aW9uICh0aWNrLCBwcmVmaXgpIHtcbiAgICAgICAgdmFyIG1zcGx1cyA9IG1zVG9UaWNrKHRpY2spO1xuICAgICAgICByZXR1cm4gbXNUb0V0YVN0cmluZyhtc3BsdXMsIHByZWZpeCk7XG4gICAgfTtcbiAgICB2YXIgbXNUb0N5Y2xlU3RyaW5nID0gZnVuY3Rpb24gKG1zcGx1cywgcHJlZml4KSB7XG4gICAgICAgIHZhciBwID0gcHJlZml4ICE9PSB1bmRlZmluZWQgPyBwcmVmaXggOiBcIkVUQVwiO1xuICAgICAgICB2YXIgY3ljbGVMZW5ndGggPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlLmdhbGF4eS5wcm9kdWN0aW9uX3JhdGU7XG4gICAgICAgIHZhciB0aWNrTGVuZ3RoID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5nYWxheHkudGlja19yYXRlO1xuICAgICAgICB2YXIgdGlja3NUb0NvbXBsZXRlID0gTWF0aC5jZWlsKG1zcGx1cyAvIDYwMDAwIC8gdGlja0xlbmd0aCk7XG4gICAgICAgIC8vR2VuZXJhdGUgdGltZSB0ZXh0IHN0cmluZ1xuICAgICAgICB2YXIgdHR0ID0gXCJcIi5jb25jYXQocCkuY29uY2F0KHRpY2tzVG9Db21wbGV0ZSwgXCIgdGlja3MgLSBcIikuY29uY2F0KCh0aWNrc1RvQ29tcGxldGUgLyBjeWNsZUxlbmd0aCkudG9GaXhlZCgyKSwgXCJDXCIpO1xuICAgICAgICByZXR1cm4gdHR0O1xuICAgIH07XG4gICAgdmFyIGZsZWV0T3V0Y29tZXMgPSB7fTtcbiAgICB2YXIgY29tYmF0SGFuZGljYXAgPSAwO1xuICAgIHZhciBjb21iYXRPdXRjb21lcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIF9hO1xuICAgICAgICB2YXIgdW5pdmVyc2UgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlO1xuICAgICAgICB2YXIgcGxheWVycyA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2UuZ2FsYXh5LnBsYXllcnM7XG4gICAgICAgIHZhciBmbGVldHMgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlLmdhbGF4eS5mbGVldHM7XG4gICAgICAgIHZhciBzdGFycyA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2UuZ2FsYXh5LnN0YXJzO1xuICAgICAgICB2YXIgZmxpZ2h0cyA9IFtdO1xuICAgICAgICBmbGVldE91dGNvbWVzID0ge307XG4gICAgICAgIGZvciAodmFyIGYgaW4gZmxlZXRzKSB7XG4gICAgICAgICAgICB2YXIgZmxlZXQgPSBmbGVldHNbZl07XG4gICAgICAgICAgICBpZiAoZmxlZXQubyAmJiBmbGVldC5vLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICB2YXIgc3RvcF8xID0gZmxlZXQub1swXVsxXTtcbiAgICAgICAgICAgICAgICB2YXIgdGlja3MgPSBmbGVldC5ldGFGaXJzdDtcbiAgICAgICAgICAgICAgICB2YXIgc3Rhcm5hbWUgPSAoX2EgPSBzdGFyc1tzdG9wXzFdKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2EubjtcbiAgICAgICAgICAgICAgICBpZiAoIXN0YXJuYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmbGlnaHRzLnB1c2goW1xuICAgICAgICAgICAgICAgICAgICB0aWNrcyxcbiAgICAgICAgICAgICAgICAgICAgXCJbW3swfV1dIFtbezF9XV0gezJ9IOKGkiBbW3szfV1dIHs0fVwiLmZvcm1hdChmbGVldC5wdWlkLCBmbGVldC5uLCBmbGVldC5zdCwgc3Rhcm5hbWUsIHRpY2tUb0V0YVN0cmluZyh0aWNrcykpLFxuICAgICAgICAgICAgICAgICAgICBmbGVldCxcbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmbGlnaHRzID0gZmxpZ2h0cy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgICAgICByZXR1cm4gYVswXSAtIGJbMF07XG4gICAgICAgIH0pO1xuICAgICAgICB2YXIgYXJyaXZhbHMgPSB7fTtcbiAgICAgICAgdmFyIG91dHB1dCA9IFtdO1xuICAgICAgICB2YXIgYXJyaXZhbFRpbWVzID0gW107XG4gICAgICAgIHZhciBzdGFyc3RhdGUgPSB7fTtcbiAgICAgICAgZm9yICh2YXIgaSBpbiBmbGlnaHRzKSB7XG4gICAgICAgICAgICB2YXIgZmxlZXQgPSBmbGlnaHRzW2ldWzJdO1xuICAgICAgICAgICAgaWYgKGZsZWV0Lm9yYml0aW5nKSB7XG4gICAgICAgICAgICAgICAgdmFyIG9yYml0ID0gZmxlZXQub3JiaXRpbmcudWlkO1xuICAgICAgICAgICAgICAgIGlmICghc3RhcnN0YXRlW29yYml0XSkge1xuICAgICAgICAgICAgICAgICAgICBzdGFyc3RhdGVbb3JiaXRdID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFzdF91cGRhdGVkOiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgc2hpcHM6IHN0YXJzW29yYml0XS50b3RhbERlZmVuc2VzLFxuICAgICAgICAgICAgICAgICAgICAgICAgcHVpZDogc3RhcnNbb3JiaXRdLnB1aWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBjOiBzdGFyc1tvcmJpdF0uYyxcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gVGhpcyBmbGVldCBpcyBkZXBhcnRpbmcgdGhpcyB0aWNrOyByZW1vdmUgaXQgZnJvbSB0aGUgb3JpZ2luIHN0YXIncyB0b3RhbERlZmVuc2VzXG4gICAgICAgICAgICAgICAgc3RhcnN0YXRlW29yYml0XS5zaGlwcyAtPSBmbGVldC5zdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChhcnJpdmFsVGltZXMubGVuZ3RoID09PSAwIHx8XG4gICAgICAgICAgICAgICAgYXJyaXZhbFRpbWVzW2Fycml2YWxUaW1lcy5sZW5ndGggLSAxXSAhPT0gZmxpZ2h0c1tpXVswXSkge1xuICAgICAgICAgICAgICAgIGFycml2YWxUaW1lcy5wdXNoKGZsaWdodHNbaV1bMF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGFycml2YWxLZXkgPSBbZmxpZ2h0c1tpXVswXSwgZmxlZXQub1swXVsxXV07XG4gICAgICAgICAgICBpZiAoYXJyaXZhbHNbYXJyaXZhbEtleV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGFycml2YWxzW2Fycml2YWxLZXldLnB1c2goZmxlZXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgYXJyaXZhbHNbYXJyaXZhbEtleV0gPSBbZmxlZXRdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZvciAodmFyIGsgaW4gYXJyaXZhbHMpIHtcbiAgICAgICAgICAgIHZhciBhcnJpdmFsID0gYXJyaXZhbHNba107XG4gICAgICAgICAgICB2YXIga2EgPSBrLnNwbGl0KFwiLFwiKTtcbiAgICAgICAgICAgIHZhciB0aWNrID0ga2FbMF07XG4gICAgICAgICAgICB2YXIgc3RhcklkID0ga2FbMV07XG4gICAgICAgICAgICBpZiAoIXN0YXJzdGF0ZVtzdGFySWRdKSB7XG4gICAgICAgICAgICAgICAgc3RhcnN0YXRlW3N0YXJJZF0gPSB7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RfdXBkYXRlZDogMCxcbiAgICAgICAgICAgICAgICAgICAgc2hpcHM6IHN0YXJzW3N0YXJJZF0udG90YWxEZWZlbnNlcyxcbiAgICAgICAgICAgICAgICAgICAgcHVpZDogc3RhcnNbc3RhcklkXS5wdWlkLFxuICAgICAgICAgICAgICAgICAgICBjOiBzdGFyc1tzdGFySWRdLmMsXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzdGFyc3RhdGVbc3RhcklkXS5wdWlkID09IC0xKSB7XG4gICAgICAgICAgICAgICAgLy8gYXNzaWduIG93bmVyc2hpcCBvZiB0aGUgc3RhciB0byB0aGUgcGxheWVyIHdob3NlIGZsZWV0IGhhcyB0cmF2ZWxlZCB0aGUgbGVhc3QgZGlzdGFuY2VcbiAgICAgICAgICAgICAgICB2YXIgbWluRGlzdGFuY2UgPSAxMDAwMDtcbiAgICAgICAgICAgICAgICB2YXIgb3duZXIgPSAtMTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpIGluIGFycml2YWwpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZsZWV0ID0gYXJyaXZhbFtpXTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGQgPSB1bml2ZXJzZS5kaXN0YW5jZShzdGFyc1tzdGFySWRdLngsIHN0YXJzW3N0YXJJZF0ueSwgZmxlZXQubHgsIGZsZWV0Lmx5KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGQgPCBtaW5EaXN0YW5jZSB8fCBvd25lciA9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3duZXIgPSBmbGVldC5wdWlkO1xuICAgICAgICAgICAgICAgICAgICAgICAgbWluRGlzdGFuY2UgPSBkO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHN0YXJzdGF0ZVtzdGFySWRdLnB1aWQgPSBvd25lcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG91dHB1dC5wdXNoKFwiezB9OiBbW3sxfV1dIFtbezJ9XV0gezN9IHNoaXBzXCIuZm9ybWF0KHRpY2tUb0V0YVN0cmluZyh0aWNrLCBcIkBcIiksIHN0YXJzdGF0ZVtzdGFySWRdLnB1aWQsIHN0YXJzW3N0YXJJZF0ubiwgc3RhcnN0YXRlW3N0YXJJZF0uc2hpcHMpKTtcbiAgICAgICAgICAgIHZhciB0aWNrRGVsdGEgPSB0aWNrIC0gc3RhcnN0YXRlW3N0YXJJZF0ubGFzdF91cGRhdGVkIC0gMTtcbiAgICAgICAgICAgIGlmICh0aWNrRGVsdGEgPiAwKSB7XG4gICAgICAgICAgICAgICAgdmFyIG9sZFNoaXBzID0gc3RhcnN0YXRlW3N0YXJJZF0uc2hpcHM7XG4gICAgICAgICAgICAgICAgc3RhcnN0YXRlW3N0YXJJZF0ubGFzdF91cGRhdGVkID0gdGljayAtIDE7XG4gICAgICAgICAgICAgICAgaWYgKHN0YXJzW3N0YXJJZF0uc2hpcHNQZXJUaWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBvbGRjID0gc3RhcnN0YXRlW3N0YXJJZF0uYztcbiAgICAgICAgICAgICAgICAgICAgc3RhcnN0YXRlW3N0YXJJZF0uc2hpcHMgKz1cbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJzW3N0YXJJZF0uc2hpcHNQZXJUaWNrICogdGlja0RlbHRhICsgb2xkYztcbiAgICAgICAgICAgICAgICAgICAgc3RhcnN0YXRlW3N0YXJJZF0uYyA9XG4gICAgICAgICAgICAgICAgICAgICAgICBzdGFyc3RhdGVbc3RhcklkXS5zaGlwcyAtIE1hdGgudHJ1bmMoc3RhcnN0YXRlW3N0YXJJZF0uc2hpcHMpO1xuICAgICAgICAgICAgICAgICAgICBzdGFyc3RhdGVbc3RhcklkXS5zaGlwcyAtPSBzdGFyc3RhdGVbc3RhcklkXS5jO1xuICAgICAgICAgICAgICAgICAgICBvdXRwdXQucHVzaChcIuKAg+KAg3swfSt7M30gKyB7Mn0vaCA9IHsxfSt7NH1cIi5mb3JtYXQob2xkU2hpcHMsIHN0YXJzdGF0ZVtzdGFySWRdLnNoaXBzLCBzdGFyc1tzdGFySWRdLnNoaXBzUGVyVGljaywgb2xkYywgc3RhcnN0YXRlW3N0YXJJZF0uYykpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAodmFyIGkgaW4gYXJyaXZhbCkge1xuICAgICAgICAgICAgICAgIHZhciBmbGVldCA9IGFycml2YWxbaV07XG4gICAgICAgICAgICAgICAgaWYgKGZsZWV0LnB1aWQgPT0gc3RhcnN0YXRlW3N0YXJJZF0ucHVpZCB8fFxuICAgICAgICAgICAgICAgICAgICBzdGFyc3RhdGVbc3RhcklkXS5wdWlkID09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBvbGRTaGlwcyA9IHN0YXJzdGF0ZVtzdGFySWRdLnNoaXBzO1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3RhcnN0YXRlW3N0YXJJZF0ucHVpZCA9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhcnN0YXRlW3N0YXJJZF0uc2hpcHMgPSBmbGVldC5zdDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJzdGF0ZVtzdGFySWRdLnNoaXBzICs9IGZsZWV0LnN0O1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHZhciBsYW5kaW5nU3RyaW5nID0gXCLigIPigIN7MH0gKyB7Mn0gb24gW1t7M31dXSA9IHsxfVwiLmZvcm1hdChvbGRTaGlwcywgc3RhcnN0YXRlW3N0YXJJZF0uc2hpcHMsIGZsZWV0LnN0LCBmbGVldC5uKTtcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0LnB1c2gobGFuZGluZ1N0cmluZyk7XG4gICAgICAgICAgICAgICAgICAgIGxhbmRpbmdTdHJpbmcgPSBsYW5kaW5nU3RyaW5nLnN1YnN0cmluZygyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKHZhciBpIGluIGFycml2YWwpIHtcbiAgICAgICAgICAgICAgICB2YXIgZmxlZXQgPSBhcnJpdmFsW2ldO1xuICAgICAgICAgICAgICAgIGlmIChmbGVldC5wdWlkID09IHN0YXJzdGF0ZVtzdGFySWRdLnB1aWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG91dGNvbWVTdHJpbmcgPSBcInswfSBzaGlwcyBvbiB7MX1cIi5mb3JtYXQoTWF0aC5mbG9vcihzdGFyc3RhdGVbc3RhcklkXS5zaGlwcyksIHN0YXJzW3N0YXJJZF0ubik7XG4gICAgICAgICAgICAgICAgICAgIGZsZWV0T3V0Y29tZXNbZmxlZXQudWlkXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV0YTogdGlja1RvRXRhU3RyaW5nKGZsZWV0LmV0YUZpcnN0KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dGNvbWU6IG91dGNvbWVTdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGF3dCA9IDA7XG4gICAgICAgICAgICB2YXIgb2ZmZW5zZSA9IDA7XG4gICAgICAgICAgICB2YXIgY29udHJpYnV0aW9uID0ge307XG4gICAgICAgICAgICBmb3IgKHZhciBpIGluIGFycml2YWwpIHtcbiAgICAgICAgICAgICAgICB2YXIgZmxlZXQgPSBhcnJpdmFsW2ldO1xuICAgICAgICAgICAgICAgIGlmIChmbGVldC5wdWlkICE9IHN0YXJzdGF0ZVtzdGFySWRdLnB1aWQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG9sZGEgPSBvZmZlbnNlO1xuICAgICAgICAgICAgICAgICAgICBvZmZlbnNlICs9IGZsZWV0LnN0O1xuICAgICAgICAgICAgICAgICAgICBvdXRwdXQucHVzaChcIuKAg+KAg1tbezR9XV0hIHswfSArIHsyfSBvbiBbW3szfV1dID0gezF9XCIuZm9ybWF0KG9sZGEsIG9mZmVuc2UsIGZsZWV0LnN0LCBmbGVldC5uLCBmbGVldC5wdWlkKSk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRyaWJ1dGlvbltbZmxlZXQucHVpZCwgZmxlZXQudWlkXV0gPSBmbGVldC5zdDtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHd0ID0gcGxheWVyc1tmbGVldC5wdWlkXS50ZWNoLndlYXBvbnMubGV2ZWw7XG4gICAgICAgICAgICAgICAgICAgIGlmICh3dCA+IGF3dCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXd0ID0gd3Q7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgYXR0YWNrZXJzQWdncmVnYXRlID0gb2ZmZW5zZTtcbiAgICAgICAgICAgIHdoaWxlIChvZmZlbnNlID4gMCkge1xuICAgICAgICAgICAgICAgIHZhciBkd3QgPSBwbGF5ZXJzW3N0YXJzdGF0ZVtzdGFySWRdLnB1aWRdLnRlY2gud2VhcG9ucy5sZXZlbDtcbiAgICAgICAgICAgICAgICB2YXIgZGVmZW5zZSA9IHN0YXJzdGF0ZVtzdGFySWRdLnNoaXBzO1xuICAgICAgICAgICAgICAgIG91dHB1dC5wdXNoKFwi4oCD4oCDQ29tYmF0ISBbW3swfV1dIGRlZmVuZGluZ1wiLmZvcm1hdChzdGFyc3RhdGVbc3RhcklkXS5wdWlkKSk7XG4gICAgICAgICAgICAgICAgb3V0cHV0LnB1c2goXCLigIPigIPigIPigINEZWZlbmRlcnMgezB9IHNoaXBzLCBXUyB7MX1cIi5mb3JtYXQoZGVmZW5zZSwgZHd0KSk7XG4gICAgICAgICAgICAgICAgb3V0cHV0LnB1c2goXCLigIPigIPigIPigINBdHRhY2tlcnMgezB9IHNoaXBzLCBXUyB7MX1cIi5mb3JtYXQob2ZmZW5zZSwgYXd0KSk7XG4gICAgICAgICAgICAgICAgZHd0ICs9IDE7XG4gICAgICAgICAgICAgICAgaWYgKHN0YXJzdGF0ZVtzdGFySWRdLnB1aWQgIT09IHVuaXZlcnNlLmdhbGF4eS5wbGF5ZXJfdWlkKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb21iYXRIYW5kaWNhcCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGR3dCArPSBjb21iYXRIYW5kaWNhcDtcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dC5wdXNoKFwi4oCD4oCD4oCD4oCDRGVmZW5kZXJzIFdTezB9ID0gezF9XCIuZm9ybWF0KGhhbmRpY2FwU3RyaW5nKFwiXCIpLCBkd3QpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF3dCAtPSBjb21iYXRIYW5kaWNhcDtcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dC5wdXNoKFwi4oCD4oCD4oCD4oCDQXR0YWNrZXJzIFdTezB9ID0gezF9XCIuZm9ybWF0KGhhbmRpY2FwU3RyaW5nKFwiXCIpLCBhd3QpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbWJhdEhhbmRpY2FwID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXd0ICs9IGNvbWJhdEhhbmRpY2FwO1xuICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0LnB1c2goXCLigIPigIPigIPigINBdHRhY2tlcnMgV1N7MH0gPSB7MX1cIi5mb3JtYXQoaGFuZGljYXBTdHJpbmcoXCJcIiksIGF3dCkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZHd0IC09IGNvbWJhdEhhbmRpY2FwO1xuICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0LnB1c2goXCLigIPigIPigIPigINEZWZlbmRlcnMgV1N7MH0gPSB7MX1cIi5mb3JtYXQoaGFuZGljYXBTdHJpbmcoXCJcIiksIGR3dCkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh1bml2ZXJzZS5nYWxheHkucGxheWVyX3VpZCA9PT0gc3RhcnN0YXRlW3N0YXJJZF0ucHVpZCkge1xuICAgICAgICAgICAgICAgICAgICAvLyB0cnVuY2F0ZSBkZWZlbnNlIGlmIHdlJ3JlIGRlZmVuZGluZyB0byBnaXZlIHRoZSBtb3N0XG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnNlcnZhdGl2ZSBlc3RpbWF0ZVxuICAgICAgICAgICAgICAgICAgICBkZWZlbnNlID0gTWF0aC50cnVuYyhkZWZlbnNlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgd2hpbGUgKGRlZmVuc2UgPiAwICYmIG9mZmVuc2UgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIG9mZmVuc2UgLT0gZHd0O1xuICAgICAgICAgICAgICAgICAgICBpZiAob2ZmZW5zZSA8PSAwKVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGRlZmVuc2UgLT0gYXd0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgbmV3QWdncmVnYXRlID0gMDtcbiAgICAgICAgICAgICAgICB2YXIgcGxheWVyQ29udHJpYnV0aW9uID0ge307XG4gICAgICAgICAgICAgICAgdmFyIGJpZ2dlc3RQbGF5ZXIgPSAtMTtcbiAgICAgICAgICAgICAgICB2YXIgYmlnZ2VzdFBsYXllcklkID0gc3RhcnN0YXRlW3N0YXJJZF0ucHVpZDtcbiAgICAgICAgICAgICAgICBpZiAob2ZmZW5zZSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgb3V0cHV0LnB1c2goXCLigIPigINBdHRhY2tlcnMgd2luIHdpdGggezB9IHNoaXBzIHJlbWFpbmluZ1wiLmZvcm1hdChvZmZlbnNlKSk7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGtfMSBpbiBjb250cmlidXRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBrYV8xID0ga18xLnNwbGl0KFwiLFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmbGVldCA9IGZsZWV0c1trYV8xWzFdXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBwbGF5ZXJJZCA9IGthXzFbMF07XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250cmlidXRpb25ba18xXSA9IChvZmZlbnNlICogY29udHJpYnV0aW9uW2tfMV0pIC8gYXR0YWNrZXJzQWdncmVnYXRlO1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV3QWdncmVnYXRlICs9IGNvbnRyaWJ1dGlvbltrXzFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBsYXllckNvbnRyaWJ1dGlvbltwbGF5ZXJJZF0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbGF5ZXJDb250cmlidXRpb25bcGxheWVySWRdICs9IGNvbnRyaWJ1dGlvbltrXzFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcGxheWVyQ29udHJpYnV0aW9uW3BsYXllcklkXSA9IGNvbnRyaWJ1dGlvbltrXzFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBsYXllckNvbnRyaWJ1dGlvbltwbGF5ZXJJZF0gPiBiaWdnZXN0UGxheWVyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmlnZ2VzdFBsYXllciA9IHBsYXllckNvbnRyaWJ1dGlvbltwbGF5ZXJJZF07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYmlnZ2VzdFBsYXllcklkID0gcGxheWVySWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXQucHVzaChcIuKAg+KAg+KAg+KAg1tbezB9XV0gaGFzIHsxfSBvbiBbW3syfV1dXCIuZm9ybWF0KGZsZWV0LnB1aWQsIGNvbnRyaWJ1dGlvbltrXzFdLCBmbGVldC5uKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgb3V0Y29tZVN0cmluZyA9IFwiV2lucyEgezB9IGxhbmQuXCIuZm9ybWF0KGNvbnRyaWJ1dGlvbltrXzFdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZsZWV0T3V0Y29tZXNbZmxlZXQudWlkXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBldGE6IHRpY2tUb0V0YVN0cmluZyhmbGVldC5ldGFGaXJzdCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0Y29tZTogb3V0Y29tZVN0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgb2ZmZW5zZSA9IG5ld0FnZ3JlZ2F0ZSAtIHBsYXllckNvbnRyaWJ1dGlvbltiaWdnZXN0UGxheWVySWRdO1xuICAgICAgICAgICAgICAgICAgICBzdGFyc3RhdGVbc3RhcklkXS5wdWlkID0gYmlnZ2VzdFBsYXllcklkO1xuICAgICAgICAgICAgICAgICAgICBzdGFyc3RhdGVbc3RhcklkXS5zaGlwcyA9IHBsYXllckNvbnRyaWJ1dGlvbltiaWdnZXN0UGxheWVySWRdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc3RhcnN0YXRlW3N0YXJJZF0uc2hpcHMgPSBkZWZlbnNlO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpIGluIGFycml2YWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBmbGVldCA9IGFycml2YWxbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmxlZXQucHVpZCA9PSBzdGFyc3RhdGVbc3RhcklkXS5wdWlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG91dGNvbWVTdHJpbmcgPSBcInswfSBzaGlwcyBvbiB7MX1cIi5mb3JtYXQoTWF0aC5mbG9vcihzdGFyc3RhdGVbc3RhcklkXS5zaGlwcyksIHN0YXJzW3N0YXJJZF0ubik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmxlZXRPdXRjb21lc1tmbGVldC51aWRdID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBldGE6IHRpY2tUb0V0YVN0cmluZyhmbGVldC5ldGFGaXJzdCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dGNvbWU6IG91dGNvbWVTdHJpbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBrXzIgaW4gY29udHJpYnV0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIga2FfMiA9IGtfMi5zcGxpdChcIixcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZmxlZXQgPSBmbGVldHNba2FfMlsxXV07XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgb3V0Y29tZVN0cmluZyA9IFwiTG9zZXMhIHswfSBsaXZlLlwiLmZvcm1hdChkZWZlbnNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZsZWV0T3V0Y29tZXNbZmxlZXQudWlkXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBldGE6IHRpY2tUb0V0YVN0cmluZyhmbGVldC5ldGFGaXJzdCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0Y29tZTogb3V0Y29tZVN0cmluZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYXR0YWNrZXJzQWdncmVnYXRlID0gb2ZmZW5zZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG91dHB1dC5wdXNoKFwi4oCD4oCDW1t7MH1dXSBbW3sxfV1dIHsyfSBzaGlwc1wiLmZvcm1hdChzdGFyc3RhdGVbc3RhcklkXS5wdWlkLCBzdGFyc1tzdGFySWRdLm4sIHN0YXJzdGF0ZVtzdGFySWRdLnNoaXBzKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG91dHB1dDtcbiAgICB9O1xuICAgIGZ1bmN0aW9uIGluY0NvbWJhdEhhbmRpY2FwKCkge1xuICAgICAgICBjb21iYXRIYW5kaWNhcCArPSAxO1xuICAgIH1cbiAgICBmdW5jdGlvbiBkZWNDb21iYXRIYW5kaWNhcCgpIHtcbiAgICAgICAgY29tYmF0SGFuZGljYXAgLT0gMTtcbiAgICB9XG4gICAgaG90a2V5KFwiLlwiLCBpbmNDb21iYXRIYW5kaWNhcCk7XG4gICAgaW5jQ29tYmF0SGFuZGljYXAuaGVscCA9XG4gICAgICAgIFwiQ2hhbmdlIGNvbWJhdCBjYWxjdWxhdGlvbiB0byBjcmVkaXQgeW91ciBlbmVtaWVzIHdpdGggKzEgd2VhcG9ucy4gVXNlZnVsIFwiICtcbiAgICAgICAgICAgIFwiaWYgeW91IHN1c3BlY3QgdGhleSB3aWxsIGhhdmUgYWNoaWV2ZWQgdGhlIG5leHQgbGV2ZWwgb2YgdGVjaCBiZWZvcmUgYSBiYXR0bGUgeW91IGFyZSBpbnZlc3RpZ2F0aW5nLlwiICtcbiAgICAgICAgICAgIFwiPHA+SW4gdGhlIGxvd2VyIGxlZnQgb2YgdGhlIEhVRCwgYW4gaW5kaWNhdG9yIHdpbGwgYXBwZWFyIHJlbWluZGluZyB5b3Ugb2YgdGhlIHdlYXBvbnMgYWRqdXN0bWVudC4gSWYgdGhlIFwiICtcbiAgICAgICAgICAgIFwiaW5kaWNhdG9yIGFscmVhZHkgc2hvd3MgYW4gYWR2YW50YWdlIGZvciBkZWZlbmRlcnMsIHRoaXMgaG90a2V5IHdpbGwgcmVkdWNlIHRoYXQgYWR2YW50YWdlIGZpcnN0IGJlZm9yZSBjcmVkaXRpbmcgXCIgK1xuICAgICAgICAgICAgXCJ3ZWFwb25zIHRvIHlvdXIgb3Bwb25lbnQuXCI7XG4gICAgaG90a2V5KFwiLFwiLCBkZWNDb21iYXRIYW5kaWNhcCk7XG4gICAgZGVjQ29tYmF0SGFuZGljYXAuaGVscCA9XG4gICAgICAgIFwiQ2hhbmdlIGNvbWJhdCBjYWxjdWxhdGlvbiB0byBjcmVkaXQgeW91cnNlbGYgd2l0aCArMSB3ZWFwb25zLiBVc2VmdWwgXCIgK1xuICAgICAgICAgICAgXCJ3aGVuIHlvdSB3aWxsIGhhdmUgYWNoaWV2ZWQgdGhlIG5leHQgbGV2ZWwgb2YgdGVjaCBiZWZvcmUgYSBiYXR0bGUgeW91IGFyZSBpbnZlc3RpZ2F0aW5nLlwiICtcbiAgICAgICAgICAgIFwiPHA+SW4gdGhlIGxvd2VyIGxlZnQgb2YgdGhlIEhVRCwgYW4gaW5kaWNhdG9yIHdpbGwgYXBwZWFyIHJlbWluZGluZyB5b3Ugb2YgdGhlIHdlYXBvbnMgYWRqdXN0bWVudC4gV2hlbiBcIiArXG4gICAgICAgICAgICBcImluZGljYXRvciBhbHJlYWR5IHNob3dzIGFuIGFkdmFudGFnZSBmb3IgYXR0YWNrZXJzLCB0aGlzIGhvdGtleSB3aWxsIHJlZHVjZSB0aGF0IGFkdmFudGFnZSBmaXJzdCBiZWZvcmUgY3JlZGl0aW5nIFwiICtcbiAgICAgICAgICAgIFwid2VhcG9ucyB0byB5b3UuXCI7XG4gICAgZnVuY3Rpb24gbG9uZ0ZsZWV0UmVwb3J0KCkge1xuICAgICAgICBjbGlwKGNvbWJhdE91dGNvbWVzKCkuam9pbihcIlxcblwiKSk7XG4gICAgfVxuICAgIGhvdGtleShcIiZcIiwgbG9uZ0ZsZWV0UmVwb3J0KTtcbiAgICBsb25nRmxlZXRSZXBvcnQuaGVscCA9XG4gICAgICAgIFwiR2VuZXJhdGUgYSBkZXRhaWxlZCBmbGVldCByZXBvcnQgb24gYWxsIGNhcnJpZXJzIGluIHlvdXIgc2Nhbm5pbmcgcmFuZ2UsIGFuZCBjb3B5IGl0IHRvIHRoZSBjbGlwYm9hcmQuXCIgK1xuICAgICAgICAgICAgXCI8cD5UaGlzIHNhbWUgcmVwb3J0IGNhbiBhbHNvIGJlIHZpZXdlZCB2aWEgdGhlIG1lbnU7IGVudGVyIHRoZSBhZ2VudCBhbmQgY2hvb3NlIGl0IGZyb20gdGhlIGRyb3Bkb3duLlwiO1xuICAgIGZ1bmN0aW9uIGJyaWVmRmxlZXRSZXBvcnQoKSB7XG4gICAgICAgIHZhciBfYTtcbiAgICAgICAgdmFyIGZsZWV0cyA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2UuZ2FsYXh5LmZsZWV0cztcbiAgICAgICAgdmFyIHN0YXJzID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5nYWxheHkuc3RhcnM7XG4gICAgICAgIHZhciBmbGlnaHRzID0gW107XG4gICAgICAgIGZvciAodmFyIGYgaW4gZmxlZXRzKSB7XG4gICAgICAgICAgICB2YXIgZmxlZXQgPSBmbGVldHNbZl07XG4gICAgICAgICAgICBpZiAoZmxlZXQubyAmJiBmbGVldC5vLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICB2YXIgc3RvcF8yID0gZmxlZXQub1swXVsxXTtcbiAgICAgICAgICAgICAgICB2YXIgdGlja3MgPSBmbGVldC5ldGFGaXJzdDtcbiAgICAgICAgICAgICAgICB2YXIgc3Rhcm5hbWUgPSAoX2EgPSBzdGFyc1tzdG9wXzJdKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2EubjtcbiAgICAgICAgICAgICAgICBpZiAoIXN0YXJuYW1lKVxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICBmbGlnaHRzLnB1c2goW1xuICAgICAgICAgICAgICAgICAgICB0aWNrcyxcbiAgICAgICAgICAgICAgICAgICAgXCJbW3swfV1dIFtbezF9XV0gezJ9IOKGkiBbW3szfV1dIHs0fVwiLmZvcm1hdChmbGVldC5wdWlkLCBmbGVldC5uLCBmbGVldC5zdCwgc3RhcnNbc3RvcF8yXS5uLCB0aWNrVG9FdGFTdHJpbmcodGlja3MsIFwiXCIpKSxcbiAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmbGlnaHRzID0gZmxpZ2h0cy5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgICAgICByZXR1cm4gYVswXSAtIGJbMF07XG4gICAgICAgIH0pO1xuICAgICAgICBjbGlwKGZsaWdodHMubWFwKGZ1bmN0aW9uICh4KSB7IHJldHVybiB4WzFdOyB9KS5qb2luKFwiXFxuXCIpKTtcbiAgICB9XG4gICAgaG90a2V5KFwiXlwiLCBicmllZkZsZWV0UmVwb3J0KTtcbiAgICBicmllZkZsZWV0UmVwb3J0LmhlbHAgPVxuICAgICAgICBcIkdlbmVyYXRlIGEgc3VtbWFyeSBmbGVldCByZXBvcnQgb24gYWxsIGNhcnJpZXJzIGluIHlvdXIgc2Nhbm5pbmcgcmFuZ2UsIGFuZCBjb3B5IGl0IHRvIHRoZSBjbGlwYm9hcmQuXCIgK1xuICAgICAgICAgICAgXCI8cD5UaGlzIHNhbWUgcmVwb3J0IGNhbiBhbHNvIGJlIHZpZXdlZCB2aWEgdGhlIG1lbnU7IGVudGVyIHRoZSBhZ2VudCBhbmQgY2hvb3NlIGl0IGZyb20gdGhlIGRyb3Bkb3duLlwiO1xuICAgIGZ1bmN0aW9uIHNjcmVlbnNob3QoKSB7XG4gICAgICAgIHZhciBtYXAgPSBOZXB0dW5lc1ByaWRlLm5wdWkubWFwO1xuICAgICAgICBjbGlwKG1hcC5jYW52YXNbMF0udG9EYXRhVVJMKFwiaW1hZ2Uvd2VicFwiLCAwLjA1KSk7XG4gICAgfVxuICAgIGhvdGtleShcIiNcIiwgc2NyZWVuc2hvdCk7XG4gICAgc2NyZWVuc2hvdC5oZWxwID1cbiAgICAgICAgXCJDcmVhdGUgYSBkYXRhOiBVUkwgb2YgdGhlIGN1cnJlbnQgbWFwLiBQYXN0ZSBpdCBpbnRvIGEgYnJvd3NlciB3aW5kb3cgdG8gdmlldy4gVGhpcyBpcyBsaWtlbHkgdG8gYmUgcmVtb3ZlZC5cIjtcbiAgICB2YXIgaG9tZVBsYW5ldHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBwID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5nYWxheHkucGxheWVycztcbiAgICAgICAgdmFyIG91dHB1dCA9IFtdO1xuICAgICAgICBmb3IgKHZhciBpIGluIHApIHtcbiAgICAgICAgICAgIHZhciBob21lID0gcFtpXS5ob21lO1xuICAgICAgICAgICAgaWYgKGhvbWUpIHtcbiAgICAgICAgICAgICAgICBvdXRwdXQucHVzaChcIlBsYXllciAjezB9IGlzIFtbezB9XV0gaG9tZSB7Mn0gW1t7MX1dXVwiLmZvcm1hdChpLCBob21lLm4sIGkgPT0gaG9tZS5wdWlkID8gXCJpc1wiIDogXCJ3YXNcIikpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgb3V0cHV0LnB1c2goXCJQbGF5ZXIgI3swfSBpcyBbW3swfV1dIGhvbWUgdW5rbm93blwiLmZvcm1hdChpKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2xpcChvdXRwdXQuam9pbihcIlxcblwiKSk7XG4gICAgfTtcbiAgICBob3RrZXkoXCIhXCIsIGhvbWVQbGFuZXRzKTtcbiAgICBob21lUGxhbmV0cy5oZWxwID1cbiAgICAgICAgXCJHZW5lcmF0ZSBhIHBsYXllciBzdW1tYXJ5IHJlcG9ydCBhbmQgY29weSBpdCB0byB0aGUgY2xpcGJvYXJkLlwiICtcbiAgICAgICAgICAgIFwiPHA+VGhpcyBzYW1lIHJlcG9ydCBjYW4gYWxzbyBiZSB2aWV3ZWQgdmlhIHRoZSBtZW51OyBlbnRlciB0aGUgYWdlbnQgYW5kIGNob29zZSBpdCBmcm9tIHRoZSBkcm9wZG93bi4gXCIgK1xuICAgICAgICAgICAgXCJJdCBpcyBtb3N0IHVzZWZ1bCBmb3IgZGlzY292ZXJpbmcgcGxheWVyIG51bWJlcnMgc28gdGhhdCB5b3UgY2FuIHdyaXRlIFtbI11dIHRvIHJlZmVyZW5jZSBhIHBsYXllciBpbiBtYWlsLlwiO1xuICAgIHZhciBwbGF5ZXJTaGVldCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHAgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlLmdhbGF4eS5wbGF5ZXJzO1xuICAgICAgICB2YXIgb3V0cHV0ID0gW107XG4gICAgICAgIHZhciBmaWVsZHMgPSBbXG4gICAgICAgICAgICBcImFsaWFzXCIsXG4gICAgICAgICAgICBcInRvdGFsX3N0YXJzXCIsXG4gICAgICAgICAgICBcInNoaXBzUGVyVGlja1wiLFxuICAgICAgICAgICAgXCJ0b3RhbF9zdHJlbmd0aFwiLFxuICAgICAgICAgICAgXCJ0b3RhbF9lY29ub215XCIsXG4gICAgICAgICAgICBcInRvdGFsX2ZsZWV0c1wiLFxuICAgICAgICAgICAgXCJ0b3RhbF9pbmR1c3RyeVwiLFxuICAgICAgICAgICAgXCJ0b3RhbF9zY2llbmNlXCIsXG4gICAgICAgIF07XG4gICAgICAgIG91dHB1dC5wdXNoKGZpZWxkcy5qb2luKFwiLFwiKSk7XG4gICAgICAgIHZhciBfbG9vcF8zID0gZnVuY3Rpb24gKGkpIHtcbiAgICAgICAgICAgIHBsYXllciA9IF9fYXNzaWduKHt9LCBwW2ldKTtcbiAgICAgICAgICAgIHZhciByZWNvcmQgPSBmaWVsZHMubWFwKGZ1bmN0aW9uIChmKSB7IHJldHVybiBwW2ldW2ZdOyB9KTtcbiAgICAgICAgICAgIG91dHB1dC5wdXNoKHJlY29yZC5qb2luKFwiLFwiKSk7XG4gICAgICAgIH07XG4gICAgICAgIGZvciAodmFyIGkgaW4gcCkge1xuICAgICAgICAgICAgX2xvb3BfMyhpKTtcbiAgICAgICAgfVxuICAgICAgICBjbGlwKG91dHB1dC5qb2luKFwiXFxuXCIpKTtcbiAgICB9O1xuICAgIGhvdGtleShcIiRcIiwgcGxheWVyU2hlZXQpO1xuICAgIHBsYXllclNoZWV0LmhlbHAgPVxuICAgICAgICBcIkdlbmVyYXRlIGEgcGxheWVyIHN1bW1hcnkgbWVhbiB0byBiZSBtYWRlIGludG8gYSBzcHJlYWRzaGVldC5cIiArXG4gICAgICAgICAgICBcIjxwPlRoZSBjbGlwYm9hcmQgc2hvdWxkIGJlIHBhc3RlZCBpbnRvIGEgQ1NWIGFuZCB0aGVuIGltcG9ydGVkLlwiO1xuICAgIHZhciBob29rc0xvYWRlZCA9IGZhbHNlO1xuICAgIHZhciBoYW5kaWNhcFN0cmluZyA9IGZ1bmN0aW9uIChwcmVmaXgpIHtcbiAgICAgICAgdmFyIHAgPSBwcmVmaXggIT09IHVuZGVmaW5lZCA/IHByZWZpeCA6IGNvbWJhdEhhbmRpY2FwID4gMCA/IFwiRW5lbXkgV1NcIiA6IFwiTXkgV1NcIjtcbiAgICAgICAgcmV0dXJuIHAgKyAoY29tYmF0SGFuZGljYXAgPiAwID8gXCIrXCIgOiBcIlwiKSArIGNvbWJhdEhhbmRpY2FwO1xuICAgIH07XG4gICAgdmFyIGxvYWRIb29rcyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHN1cGVyRHJhd1RleHQgPSBOZXB0dW5lc1ByaWRlLm5wdWkubWFwLmRyYXdUZXh0O1xuICAgICAgICBOZXB0dW5lc1ByaWRlLm5wdWkubWFwLmRyYXdUZXh0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHVuaXZlcnNlID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZTtcbiAgICAgICAgICAgIHZhciBtYXAgPSBOZXB0dW5lc1ByaWRlLm5wdWkubWFwO1xuICAgICAgICAgICAgc3VwZXJEcmF3VGV4dCgpO1xuICAgICAgICAgICAgbWFwLmNvbnRleHQuZm9udCA9IFwiXCIuY29uY2F0KDE0ICogbWFwLnBpeGVsUmF0aW8sIFwicHggT3BlblNhbnNSZWd1bGFyLCBzYW5zLXNlcmlmXCIpO1xuICAgICAgICAgICAgbWFwLmNvbnRleHQuZmlsbFN0eWxlID0gXCIjRkYwMDAwXCI7XG4gICAgICAgICAgICBtYXAuY29udGV4dC50ZXh0QWxpZ24gPSBcInJpZ2h0XCI7XG4gICAgICAgICAgICBtYXAuY29udGV4dC50ZXh0QmFzZWxpbmUgPSBcIm1pZGRsZVwiO1xuICAgICAgICAgICAgdmFyIHYgPSB2ZXJzaW9uO1xuICAgICAgICAgICAgaWYgKGNvbWJhdEhhbmRpY2FwICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgdiA9IFwiXCIuY29uY2F0KGhhbmRpY2FwU3RyaW5nKCksIFwiIFwiKS5jb25jYXQodik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkcmF3T3ZlcmxheVN0cmluZyhtYXAuY29udGV4dCwgdiwgbWFwLnZpZXdwb3J0V2lkdGggLSAxMCwgbWFwLnZpZXdwb3J0SGVpZ2h0IC0gMTYgKiBtYXAucGl4ZWxSYXRpbyk7XG4gICAgICAgICAgICBpZiAoTmVwdHVuZXNQcmlkZS5vcmlnaW5hbFBsYXllciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgTmVwdHVuZXNQcmlkZS5vcmlnaW5hbFBsYXllciA9IHVuaXZlcnNlLnBsYXllci51aWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoTmVwdHVuZXNQcmlkZS5vcmlnaW5hbFBsYXllciAhPT0gdW5pdmVyc2UucGxheWVyLnVpZCkge1xuICAgICAgICAgICAgICAgIHZhciBuID0gdW5pdmVyc2UuZ2FsYXh5LnBsYXllcnNbdW5pdmVyc2UucGxheWVyLnVpZF0uYWxpYXM7XG4gICAgICAgICAgICAgICAgZHJhd092ZXJsYXlTdHJpbmcobWFwLmNvbnRleHQsIG4sIG1hcC52aWV3cG9ydFdpZHRoIC0gMTAwLCBtYXAudmlld3BvcnRIZWlnaHQgLSAyICogMTYgKiBtYXAucGl4ZWxSYXRpbyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodW5pdmVyc2Uuc2VsZWN0ZWRGbGVldCAmJiB1bml2ZXJzZS5zZWxlY3RlZEZsZWV0LnBhdGgubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coXCJTZWxlY3RlZCBmbGVldFwiLCB1bml2ZXJzZS5zZWxlY3RlZEZsZWV0KTtcbiAgICAgICAgICAgICAgICBtYXAuY29udGV4dC5mb250ID0gXCJcIi5jb25jYXQoMTQgKiBtYXAucGl4ZWxSYXRpbywgXCJweCBPcGVuU2Fuc1JlZ3VsYXIsIHNhbnMtc2VyaWZcIik7XG4gICAgICAgICAgICAgICAgbWFwLmNvbnRleHQuZmlsbFN0eWxlID0gXCIjRkYwMDAwXCI7XG4gICAgICAgICAgICAgICAgbWFwLmNvbnRleHQudGV4dEFsaWduID0gXCJsZWZ0XCI7XG4gICAgICAgICAgICAgICAgbWFwLmNvbnRleHQudGV4dEJhc2VsaW5lID0gXCJtaWRkbGVcIjtcbiAgICAgICAgICAgICAgICB2YXIgZHkgPSB1bml2ZXJzZS5zZWxlY3RlZEZsZWV0LnkgLSB1bml2ZXJzZS5zZWxlY3RlZEZsZWV0Lmx5O1xuICAgICAgICAgICAgICAgIHZhciBkeCA9IHVuaXZlcnNlLnNlbGVjdGVkRmxlZXQueCAtIHVuaXZlcnNlLnNlbGVjdGVkRmxlZXQubHg7XG4gICAgICAgICAgICAgICAgZHkgPSB1bml2ZXJzZS5zZWxlY3RlZEZsZWV0LnBhdGhbMF0ueSAtIHVuaXZlcnNlLnNlbGVjdGVkRmxlZXQueTtcbiAgICAgICAgICAgICAgICBkeCA9IHVuaXZlcnNlLnNlbGVjdGVkRmxlZXQucGF0aFswXS54IC0gdW5pdmVyc2Uuc2VsZWN0ZWRGbGVldC54O1xuICAgICAgICAgICAgICAgIHZhciBsaW5lSGVpZ2h0ID0gMTYgKiBtYXAucGl4ZWxSYXRpbztcbiAgICAgICAgICAgICAgICB2YXIgcmFkaXVzID0gMiAqIDAuMDI4ICogbWFwLnNjYWxlICogbWFwLnBpeGVsUmF0aW87XG4gICAgICAgICAgICAgICAgdmFyIGFuZ2xlID0gTWF0aC5hdGFuKGR5IC8gZHgpO1xuICAgICAgICAgICAgICAgIHZhciBvZmZzZXR4ID0gcmFkaXVzICogTWF0aC5jb3MoYW5nbGUpO1xuICAgICAgICAgICAgICAgIHZhciBvZmZzZXR5ID0gcmFkaXVzICogTWF0aC5zaW4oYW5nbGUpO1xuICAgICAgICAgICAgICAgIGlmIChvZmZzZXR4ID4gMCAmJiBkeCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0eCAqPSAtMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG9mZnNldHkgPiAwICYmIGR5ID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBvZmZzZXR5ICo9IC0xO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAob2Zmc2V0eCA8IDAgJiYgZHggPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgIG9mZnNldHggKj0gLTE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChvZmZzZXR5IDwgMCAmJiBkeSA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0eSAqPSAtMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29tYmF0T3V0Y29tZXMoKTtcbiAgICAgICAgICAgICAgICB2YXIgcyA9IGZsZWV0T3V0Y29tZXNbdW5pdmVyc2Uuc2VsZWN0ZWRGbGVldC51aWRdLmV0YTtcbiAgICAgICAgICAgICAgICB2YXIgbyA9IGZsZWV0T3V0Y29tZXNbdW5pdmVyc2Uuc2VsZWN0ZWRGbGVldC51aWRdLm91dGNvbWU7XG4gICAgICAgICAgICAgICAgdmFyIHggPSBtYXAud29ybGRUb1NjcmVlblgodW5pdmVyc2Uuc2VsZWN0ZWRGbGVldC54KSArIG9mZnNldHg7XG4gICAgICAgICAgICAgICAgdmFyIHkgPSBtYXAud29ybGRUb1NjcmVlblkodW5pdmVyc2Uuc2VsZWN0ZWRGbGVldC55KSArIG9mZnNldHk7XG4gICAgICAgICAgICAgICAgaWYgKG9mZnNldHggPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgIG1hcC5jb250ZXh0LnRleHRBbGlnbiA9IFwicmlnaHRcIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZHJhd092ZXJsYXlTdHJpbmcobWFwLmNvbnRleHQsIHMsIHgsIHkpO1xuICAgICAgICAgICAgICAgIGRyYXdPdmVybGF5U3RyaW5nKG1hcC5jb250ZXh0LCBvLCB4LCB5ICsgbGluZUhlaWdodCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIU5lcHR1bmVzUHJpZGUuZ2FtZUNvbmZpZy50dXJuQmFzZWQgJiZcbiAgICAgICAgICAgICAgICB1bml2ZXJzZS50aW1lVG9UaWNrKDEpLmxlbmd0aCA8IDMpIHtcbiAgICAgICAgICAgICAgICB2YXIgbGluZUhlaWdodCA9IDE2ICogbWFwLnBpeGVsUmF0aW87XG4gICAgICAgICAgICAgICAgbWFwLmNvbnRleHQuZm9udCA9IFwiXCIuY29uY2F0KDE0ICogbWFwLnBpeGVsUmF0aW8sIFwicHggT3BlblNhbnNSZWd1bGFyLCBzYW5zLXNlcmlmXCIpO1xuICAgICAgICAgICAgICAgIG1hcC5jb250ZXh0LmZpbGxTdHlsZSA9IFwiI0ZGMDAwMFwiO1xuICAgICAgICAgICAgICAgIG1hcC5jb250ZXh0LnRleHRBbGlnbiA9IFwibGVmdFwiO1xuICAgICAgICAgICAgICAgIG1hcC5jb250ZXh0LnRleHRCYXNlbGluZSA9IFwibWlkZGxlXCI7XG4gICAgICAgICAgICAgICAgdmFyIHMgPSBcIlRpY2sgPCAxMHMgYXdheSFcIjtcbiAgICAgICAgICAgICAgICBpZiAodW5pdmVyc2UudGltZVRvVGljaygxKSA9PT0gXCIwc1wiKSB7XG4gICAgICAgICAgICAgICAgICAgIHMgPSBcIlRpY2sgcGFzc2VkLiBDbGljayBwcm9kdWN0aW9uIGNvdW50ZG93biB0byByZWZyZXNoLlwiO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBkcmF3T3ZlcmxheVN0cmluZyhtYXAuY29udGV4dCwgcywgMTAwMCwgbGluZUhlaWdodCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodW5pdmVyc2Uuc2VsZWN0ZWRTdGFyICYmXG4gICAgICAgICAgICAgICAgdW5pdmVyc2Uuc2VsZWN0ZWRTdGFyLnB1aWQgIT0gdW5pdmVyc2UucGxheWVyLnVpZCAmJlxuICAgICAgICAgICAgICAgIHVuaXZlcnNlLnNlbGVjdGVkU3Rhci5wdWlkICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIC8vIGVuZW15IHN0YXIgc2VsZWN0ZWQ7IHNob3cgSFVEIGZvciBzY2FubmluZyB2aXNpYmlsaXR5XG4gICAgICAgICAgICAgICAgbWFwLmNvbnRleHQudGV4dEFsaWduID0gXCJsZWZ0XCI7XG4gICAgICAgICAgICAgICAgbWFwLmNvbnRleHQudGV4dEJhc2VsaW5lID0gXCJtaWRkbGVcIjtcbiAgICAgICAgICAgICAgICB2YXIgeE9mZnNldCA9IDI2ICogbWFwLnBpeGVsUmF0aW87XG4gICAgICAgICAgICAgICAgLy9tYXAuY29udGV4dC50cmFuc2xhdGUoeE9mZnNldCwgMCk7XG4gICAgICAgICAgICAgICAgdmFyIGZsZWV0cyA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2UuZ2FsYXh5LmZsZWV0cztcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBmIGluIGZsZWV0cykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZmxlZXQgPSBmbGVldHNbZl07XG4gICAgICAgICAgICAgICAgICAgIGlmIChmbGVldC5wdWlkID09PSB1bml2ZXJzZS5wbGF5ZXIudWlkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZHggPSB1bml2ZXJzZS5zZWxlY3RlZFN0YXIueCAtIGZsZWV0Lng7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZHkgPSB1bml2ZXJzZS5zZWxlY3RlZFN0YXIueSAtIGZsZWV0Lnk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgZGlzdGFuY2UgPSBNYXRoLnNxcnQoZHggKiBkeCArIGR5ICogZHkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG9mZnNldHggPSB4T2Zmc2V0O1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG9mZnNldHkgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHggPSBtYXAud29ybGRUb1NjcmVlblgoZmxlZXQueCkgKyBvZmZzZXR4O1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHkgPSBtYXAud29ybGRUb1NjcmVlblkoZmxlZXQueSkgKyBvZmZzZXR5O1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRpc3RhbmNlID5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bml2ZXJzZS5nYWxheHkucGxheWVyc1t1bml2ZXJzZS5zZWxlY3RlZFN0YXIucHVpZF0udGVjaC5zY2FubmluZ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmxlZXQucGF0aCAmJiBmbGVldC5wYXRoLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZHggPSBmbGVldC5wYXRoWzBdLnggLSB1bml2ZXJzZS5zZWxlY3RlZFN0YXIueDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZHkgPSBmbGVldC5wYXRoWzBdLnkgLSB1bml2ZXJzZS5zZWxlY3RlZFN0YXIueTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGlzdGFuY2UgPSBNYXRoLnNxcnQoZHggKiBkeCArIGR5ICogZHkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGlzdGFuY2UgPFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5pdmVyc2UuZ2FsYXh5LnBsYXllcnNbdW5pdmVyc2Uuc2VsZWN0ZWRTdGFyLnB1aWRdLnRlY2hcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuc2Nhbm5pbmcudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzdGVwUmFkaXVzID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5nYWxheHkuZmxlZXRfc3BlZWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZmxlZXQud2FycFNwZWVkKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ZXBSYWRpdXMgKj0gMztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGR4ID0gZmxlZXQueCAtIGZsZWV0LnBhdGhbMF0ueDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGR5ID0gZmxlZXQueSAtIGZsZWV0LnBhdGhbMF0ueTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBhbmdsZSA9IE1hdGguYXRhbihkeSAvIGR4KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBzdGVweCA9IHN0ZXBSYWRpdXMgKiBNYXRoLmNvcyhhbmdsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgc3RlcHkgPSBzdGVwUmFkaXVzICogTWF0aC5zaW4oYW5nbGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN0ZXB4ID4gMCAmJiBkeCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGVweCAqPSAtMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdGVweSA+IDAgJiYgZHkgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RlcHkgKj0gLTE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3RlcHggPCAwICYmIGR4IDwgMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0ZXB4ICo9IC0xO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN0ZXB5IDwgMCAmJiBkeSA8IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdGVweSAqPSAtMTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0aWNrcyA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkbyB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHhfMSA9IHRpY2tzICogc3RlcHggKyBOdW1iZXIoZmxlZXQueCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHlfMSA9IHRpY2tzICogc3RlcHkgKyBOdW1iZXIoZmxlZXQueSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9sZXQgc3ggPSBtYXAud29ybGRUb1NjcmVlblgoeCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy9sZXQgc3kgPSBtYXAud29ybGRUb1NjcmVlblkoeSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZHggPSB4XzEgLSB1bml2ZXJzZS5zZWxlY3RlZFN0YXIueDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkeSA9IHlfMSAtIHVuaXZlcnNlLnNlbGVjdGVkU3Rhci55O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc3RhbmNlID0gTWF0aC5zcXJ0KGR4ICogZHggKyBkeSAqIGR5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGRpc3RhbmNlLCB4LCB5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL2RyYXdPdmVybGF5U3RyaW5nKG1hcC5jb250ZXh0LCBcIm9cIiwgc3gsIHN5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aWNrcyArPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSB3aGlsZSAoZGlzdGFuY2UgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVuaXZlcnNlLmdhbGF4eS5wbGF5ZXJzW3VuaXZlcnNlLnNlbGVjdGVkU3Rhci5wdWlkXS50ZWNoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5zY2FubmluZy52YWx1ZSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpY2tzIDw9IGZsZWV0LmV0YUZpcnN0ICsgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aWNrcyAtPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHZpc0NvbG9yID0gXCIjMDBmZjAwXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYW55U3RhckNhblNlZSh1bml2ZXJzZS5zZWxlY3RlZFN0YXIucHVpZCwgZmxlZXQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlzQ29sb3IgPSBcIiM4ODg4ODhcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRyYXdPdmVybGF5U3RyaW5nKG1hcC5jb250ZXh0LCBcIlNjYW4gXCIuY29uY2F0KHRpY2tUb0V0YVN0cmluZyh0aWNrcykpLCB4LCB5LCB2aXNDb2xvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy9tYXAuY29udGV4dC50cmFuc2xhdGUoLXhPZmZzZXQsIDApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHVuaXZlcnNlLnJ1bGVyLnN0YXJzLmxlbmd0aCA9PSAyKSB7XG4gICAgICAgICAgICAgICAgdmFyIHAxID0gdW5pdmVyc2UucnVsZXIuc3RhcnNbMF0ucHVpZDtcbiAgICAgICAgICAgICAgICB2YXIgcDIgPSB1bml2ZXJzZS5ydWxlci5zdGFyc1sxXS5wdWlkO1xuICAgICAgICAgICAgICAgIGlmIChwMSAhPT0gcDIgJiYgcDEgIT09IC0xICYmIHAyICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKFwidHdvIHN0YXIgcnVsZXJcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICAvL1RPRE86IExlYXJuIG1vcmUgYWJvdXQgdGhpcyBob29rLiBpdHMgcnVuIHRvbyBtdWNoLi5cbiAgICAgICAgQ3J1eC5mb3JtYXQgPSBmdW5jdGlvbiAocywgdGVtcGxhdGVEYXRhKSB7XG4gICAgICAgICAgICBpZiAoIXMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJlcnJvclwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGk7XG4gICAgICAgICAgICB2YXIgZnA7XG4gICAgICAgICAgICB2YXIgc3A7XG4gICAgICAgICAgICB2YXIgc3ViO1xuICAgICAgICAgICAgdmFyIHBhdHRlcm47XG4gICAgICAgICAgICBpID0gMDtcbiAgICAgICAgICAgIGZwID0gMDtcbiAgICAgICAgICAgIHNwID0gMDtcbiAgICAgICAgICAgIHN1YiA9IFwiXCI7XG4gICAgICAgICAgICBwYXR0ZXJuID0gXCJcIjtcbiAgICAgICAgICAgIC8vIGxvb2sgZm9yIHN0YW5kYXJkIHBhdHRlcm5zXG4gICAgICAgICAgICB3aGlsZSAoZnAgPj0gMCAmJiBpIDwgMTAwMCkge1xuICAgICAgICAgICAgICAgIGkgPSBpICsgMTtcbiAgICAgICAgICAgICAgICBmcCA9IHMuc2VhcmNoKFwiXFxcXFtcXFxcW1wiKTtcbiAgICAgICAgICAgICAgICBzcCA9IHMuc2VhcmNoKFwiXFxcXF1cXFxcXVwiKTtcbiAgICAgICAgICAgICAgICBzdWIgPSBzLnNsaWNlKGZwICsgMiwgc3ApO1xuICAgICAgICAgICAgICAgIHZhciB1cmkgPSBzdWIucmVwbGFjZUFsbChcIiYjeDJGO1wiLCBcIi9cIik7XG4gICAgICAgICAgICAgICAgcGF0dGVybiA9IFwiW1tcIi5jb25jYXQoc3ViLCBcIl1dXCIpO1xuICAgICAgICAgICAgICAgIGlmICh0ZW1wbGF0ZURhdGFbc3ViXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHMgPSBzLnJlcGxhY2UocGF0dGVybiwgdGVtcGxhdGVEYXRhW3N1Yl0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmICgvXmFwaTpcXHd7Nn0kLy50ZXN0KHN1YikpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGFwaUxpbmsgPSBcIjxhIG9uQ2xpY2s9J0NydXguY3J1eC50cmlnZ2VyKFxcXCJzd2l0Y2hfdXNlcl9hcGlcXFwiLCBcXFwiXCIuY29uY2F0KHN1YiwgXCJcXFwiKSc+IFZpZXcgYXMgXCIpLmNvbmNhdChzdWIsIFwiPC9hPlwiKTtcbiAgICAgICAgICAgICAgICAgICAgYXBpTGluayArPSBcIiBvciA8YSBvbkNsaWNrPSdDcnV4LmNydXgudHJpZ2dlcihcXFwibWVyZ2VfdXNlcl9hcGlcXFwiLCBcXFwiXCIuY29uY2F0KHN1YiwgXCJcXFwiKSc+IE1lcmdlIFwiKS5jb25jYXQoc3ViLCBcIjwvYT5cIik7XG4gICAgICAgICAgICAgICAgICAgIHMgPSBzLnJlcGxhY2UocGF0dGVybiwgYXBpTGluayk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGlzX3ZhbGlkX2ltYWdlX3VybCh1cmkpKSB7XG4gICAgICAgICAgICAgICAgICAgIHMgPSBzLnJlcGxhY2UocGF0dGVybiwgXCI8aW1nIHdpZHRoPVxcXCIxMDAlXFxcIiBzcmM9J1wiLmNvbmNhdCh1cmksIFwiJyAvPlwiKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKGlzX3ZhbGlkX3lvdXR1YmUodXJpKSkge1xuICAgICAgICAgICAgICAgICAgICAvL1Bhc3NcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHMgPSBzLnJlcGxhY2UocGF0dGVybiwgXCIoXCIuY29uY2F0KHN1YiwgXCIpXCIpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gcztcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIG5wdWkgPSBOZXB0dW5lc1ByaWRlLm5wdWk7XG4gICAgICAgIC8vUmVzZWFyY2ggYnV0dG9uIHRvIHF1aWNrbHkgdGVsbCBmcmllbmRzIHJlc2VhcmNoXG4gICAgICAgIE5lcHR1bmVzUHJpZGUudGVtcGxhdGVzW1wibnBhX3Jlc2VhcmNoXCJdID0gXCJSZXNlYXJjaFwiO1xuICAgICAgICB2YXIgc3VwZXJOZXdNZXNzYWdlQ29tbWVudEJveCA9IG5wdWkuTmV3TWVzc2FnZUNvbW1lbnRCb3g7XG4gICAgICAgIHZhciByZXBvcnRSZXNlYXJjaEhvb2sgPSBmdW5jdGlvbiAoX2UsIF9kKSB7XG4gICAgICAgICAgICB2YXIgdGV4dCA9IGdldF9yZXNlYXJjaF90ZXh0KE5lcHR1bmVzUHJpZGUpO1xuICAgICAgICAgICAgY29uc29sZS5sb2codGV4dCk7XG4gICAgICAgICAgICB2YXIgaW5ib3ggPSBOZXB0dW5lc1ByaWRlLmluYm94O1xuICAgICAgICAgICAgaW5ib3guY29tbWVudERyYWZ0c1tpbmJveC5zZWxlY3RlZE1lc3NhZ2Uua2V5XSArPSB0ZXh0O1xuICAgICAgICAgICAgaW5ib3gudHJpZ2dlcihcInNob3dfc2NyZWVuXCIsIFwiZGlwbG9tYWN5X2RldGFpbFwiKTtcbiAgICAgICAgfTtcbiAgICAgICAgTmVwdHVuZXNQcmlkZS5ucC5vbihcInBhc3RlX3Jlc2VhcmNoXCIsIHJlcG9ydFJlc2VhcmNoSG9vayk7XG4gICAgICAgIG5wdWkuTmV3TWVzc2FnZUNvbW1lbnRCb3ggPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgd2lkZ2V0ID0gc3VwZXJOZXdNZXNzYWdlQ29tbWVudEJveCgpO1xuICAgICAgICAgICAgdmFyIHJlc2VhcmNoX2J1dHRvbiA9IENydXguQnV0dG9uKFwibnBhX3Jlc2VhcmNoXCIsIFwicGFzdGVfcmVzZWFyY2hcIiwgXCJyZXNlYXJjaFwiKS5ncmlkKDExLCAxMiwgOCwgMyk7XG4gICAgICAgICAgICByZXNlYXJjaF9idXR0b24ucm9vc3Qod2lkZ2V0KTtcbiAgICAgICAgICAgIHJldHVybiB3aWRnZXQ7XG4gICAgICAgIH07XG4gICAgICAgIHZhciBzdXBlckZvcm1hdFRpbWUgPSBDcnV4LmZvcm1hdFRpbWU7XG4gICAgICAgIHZhciByZWxhdGl2ZVRpbWVzID0gMDtcbiAgICAgICAgQ3J1eC5mb3JtYXRUaW1lID0gZnVuY3Rpb24gKG1zLCBtaW5zLCBzZWNzKSB7XG4gICAgICAgICAgICBzd2l0Y2ggKHJlbGF0aXZlVGltZXMpIHtcbiAgICAgICAgICAgICAgICBjYXNlIDA6IC8vc3RhbmRhcmRcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN1cGVyRm9ybWF0VGltZShtcywgbWlucywgc2Vjcyk7XG4gICAgICAgICAgICAgICAgY2FzZSAxOiAvL0VUQSwgLSB0dXJuKHMpIGZvciB0dXJuYmFzZWRcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFOZXB0dW5lc1ByaWRlLmdhbWVDb25maWcudHVybkJhc2VkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbXNUb0V0YVN0cmluZyhtcywgXCJcIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdGlja19yYXRlID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5nYWxheHkudGlja19yYXRlO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFwiXCIuY29uY2F0KHN1cGVyRm9ybWF0VGltZShtcywgbWlucywgc2VjcyksIFwiIC0gXCIpLmNvbmNhdCgoKChtcyAvIDM2MDAwMDApICogMTApIC9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aWNrX3JhdGUpLnRvRml4ZWQoMiksIFwiIHR1cm4ocylcIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXNlIDI6IC8vY3ljbGVzICsgdGlja3MgZm9ybWF0XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtc1RvQ3ljbGVTdHJpbmcobXMsIFwiXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICB2YXIgc3dpdGNoVGltZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvLzAgPSBzdGFuZGFyZCwgMSA9IEVUQSwgLSB0dXJuKHMpIGZvciB0dXJuYmFzZWQsIDIgPSBjeWNsZXMgKyB0aWNrcyBmb3JtYXRcbiAgICAgICAgICAgIHJlbGF0aXZlVGltZXMgPSAocmVsYXRpdmVUaW1lcyArIDEpICUgMztcbiAgICAgICAgfTtcbiAgICAgICAgaG90a2V5KFwiJVwiLCBzd2l0Y2hUaW1lcyk7XG4gICAgICAgIHN3aXRjaFRpbWVzLmhlbHAgPVxuICAgICAgICAgICAgXCJDaGFuZ2UgdGhlIGRpc3BsYXkgb2YgRVRBcyBiZXR3ZWVuIHJlbGF0aXZlIHRpbWVzLCBhYnNvbHV0ZSBjbG9jayB0aW1lcywgYW5kIGN5Y2xlIHRpbWVzLiBNYWtlcyBwcmVkaWN0aW5nIFwiICtcbiAgICAgICAgICAgICAgICBcImltcG9ydGFudCB0aW1lcyBvZiBkYXkgdG8gc2lnbiBpbiBhbmQgY2hlY2sgbXVjaCBlYXNpZXIgZXNwZWNpYWxseSBmb3IgbXVsdGktbGVnIGZsZWV0IG1vdmVtZW50cy4gU29tZXRpbWVzIHlvdSBcIiArXG4gICAgICAgICAgICAgICAgXCJ3aWxsIG5lZWQgdG8gcmVmcmVzaCB0aGUgZGlzcGxheSB0byBzZWUgdGhlIGRpZmZlcmVudCB0aW1lcy5cIjtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShDcnV4LCBcInRvdWNoRW5hYmxlZFwiLCB7XG4gICAgICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiBmYWxzZTsgfSxcbiAgICAgICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uICh4KSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQ3J1eC50b3VjaEVuYWJsZWQgc2V0IGlnbm9yZWRcIiwgeCk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlKTtcbiAgICAgICAgfVxuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoTmVwdHVuZXNQcmlkZS5ucHVpLm1hcCwgXCJpZ25vcmVNb3VzZUV2ZW50c1wiLCB7XG4gICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIGZhbHNlOyB9LFxuICAgICAgICAgICAgc2V0OiBmdW5jdGlvbiAoeCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiTmVwdHVuZXNQcmlkZS5ucHVpLm1hcC5pZ25vcmVNb3VzZUV2ZW50cyBzZXQgaWdub3JlZFwiLCB4KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0pO1xuICAgICAgICBob29rc0xvYWRlZCA9IHRydWU7XG4gICAgfTtcbiAgICB2YXIgaW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIF9hO1xuICAgICAgICBpZiAoKChfYSA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2UpID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS5nYWxheHkpICYmIE5lcHR1bmVzUHJpZGUubnB1aS5tYXApIHtcbiAgICAgICAgICAgIGxpbmtGbGVldHMoKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiRmxlZXQgbGlua2luZyBjb21wbGV0ZS5cIik7XG4gICAgICAgICAgICBpZiAoIWhvb2tzTG9hZGVkKSB7XG4gICAgICAgICAgICAgICAgbG9hZEhvb2tzKCk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJIVUQgc2V0dXAgY29tcGxldGUuXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJIVUQgc2V0dXAgYWxyZWFkeSBkb25lOyBza2lwcGluZy5cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBob21lUGxhbmV0cygpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJHYW1lIG5vdCBmdWxseSBpbml0aWFsaXplZCB5ZXQ7IHdhaXQuXCIsIE5lcHR1bmVzUHJpZGUudW5pdmVyc2UpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBob3RrZXkoXCJAXCIsIGluaXQpO1xuICAgIGluaXQuaGVscCA9XG4gICAgICAgIFwiUmVpbml0aWFsaXplIE5lcHR1bmUncyBQcmlkZSBBZ2VudC4gVXNlIHRoZSBAIGhvdGtleSBpZiB0aGUgdmVyc2lvbiBpcyBub3QgYmVpbmcgc2hvd24gb24gdGhlIG1hcCBhZnRlciBkcmFnZ2luZy5cIjtcbiAgICBpZiAoKChfYiA9IE5lcHR1bmVzUHJpZGUudW5pdmVyc2UpID09PSBudWxsIHx8IF9iID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYi5nYWxheHkpICYmIE5lcHR1bmVzUHJpZGUubnB1aS5tYXApIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJVbml2ZXJzZSBhbHJlYWR5IGxvYWRlZC4gSHlwZXJsaW5rIGZsZWV0cyAmIGxvYWQgaG9va3MuXCIpO1xuICAgICAgICBpbml0KCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZyhcIlVuaXZlcnNlIG5vdCBsb2FkZWQuIEhvb2sgb25TZXJ2ZXJSZXNwb25zZS5cIik7XG4gICAgICAgIHZhciBzdXBlck9uU2VydmVyUmVzcG9uc2VfMSA9IE5lcHR1bmVzUHJpZGUubnAub25TZXJ2ZXJSZXNwb25zZTtcbiAgICAgICAgTmVwdHVuZXNQcmlkZS5ucC5vblNlcnZlclJlc3BvbnNlID0gZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICBzdXBlck9uU2VydmVyUmVzcG9uc2VfMShyZXNwb25zZSk7XG4gICAgICAgICAgICBpZiAocmVzcG9uc2UuZXZlbnQgPT09IFwib3JkZXI6cGxheWVyX2FjaGlldmVtZW50c1wiKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJJbml0aWFsIGxvYWQgY29tcGxldGUuIFJlaW5zdGFsbC5cIik7XG4gICAgICAgICAgICAgICAgaW5pdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAocmVzcG9uc2UuZXZlbnQgPT09IFwib3JkZXI6ZnVsbF91bml2ZXJzZVwiKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJVbml2ZXJzZSByZWNlaXZlZC4gUmVpbnN0YWxsLlwiKTtcbiAgICAgICAgICAgICAgICBOZXB0dW5lc1ByaWRlLm9yaWdpbmFsUGxheWVyID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5wbGF5ZXIudWlkO1xuICAgICAgICAgICAgICAgIGluaXQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKCFob29rc0xvYWRlZCAmJiBOZXB0dW5lc1ByaWRlLm5wdWkubWFwKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJIb29rcyBuZWVkIGxvYWRpbmcgYW5kIG1hcCBpcyByZWFkeS4gUmVpbnN0YWxsLlwiKTtcbiAgICAgICAgICAgICAgICBpbml0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuICAgIHZhciBvdGhlclVzZXJDb2RlID0gdW5kZWZpbmVkO1xuICAgIHZhciBnYW1lID0gTmVwdHVuZXNQcmlkZS5nYW1lTnVtYmVyO1xuICAgIC8vVGhpcyBwdXRzIHlvdSBpbnRvIHRoZWlyIHBvc2l0aW9uLlxuICAgIC8vSG93IGlzIGl0IGRpZmZlcmVudD9cbiAgICB2YXIgc3dpdGNoVXNlciA9IGZ1bmN0aW9uIChldmVudCwgZGF0YSkge1xuICAgICAgICBpZiAoTmVwdHVuZXNQcmlkZS5vcmlnaW5hbFBsYXllciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBOZXB0dW5lc1ByaWRlLm9yaWdpbmFsUGxheWVyID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5wbGF5ZXIudWlkO1xuICAgICAgICB9XG4gICAgICAgIHZhciBjb2RlID0gKGRhdGEgPT09IG51bGwgfHwgZGF0YSA9PT0gdm9pZCAwID8gdm9pZCAwIDogZGF0YS5zcGxpdChcIjpcIilbMV0pIHx8IG90aGVyVXNlckNvZGU7XG4gICAgICAgIG90aGVyVXNlckNvZGUgPSBjb2RlO1xuICAgICAgICBpZiAob3RoZXJVc2VyQ29kZSkge1xuICAgICAgICAgICAgdmFyIHBhcmFtcyA9IHtcbiAgICAgICAgICAgICAgICBnYW1lX251bWJlcjogZ2FtZSxcbiAgICAgICAgICAgICAgICBhcGlfdmVyc2lvbjogXCIwLjFcIixcbiAgICAgICAgICAgICAgICBjb2RlOiBvdGhlclVzZXJDb2RlLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHZhciBlZ2dlcnMgPSBqUXVlcnkuYWpheCh7XG4gICAgICAgICAgICAgICAgdHlwZTogXCJQT1NUXCIsXG4gICAgICAgICAgICAgICAgdXJsOiBcImh0dHBzOi8vbnAuaXJvbmhlbG1ldC5jb20vYXBpXCIsXG4gICAgICAgICAgICAgICAgYXN5bmM6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGRhdGE6IHBhcmFtcyxcbiAgICAgICAgICAgICAgICBkYXRhVHlwZTogXCJqc29uXCIsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vTG9hZHMgdGhlIHB1bGwgdW5pdmVyc2UgZGF0YSBpbnRvIHRoZSBmdW5jdGlvbi4gVGhhdHMgdGhlIGRpZmZlcmVuY2UuXG4gICAgICAgICAgICAvL1RoZSBvdGhlciB2ZXJzaW9uIGxvYWRzIGFuIHVwZGF0ZWQgZ2FsYXh5IGludG8gdGhlIGZ1bmN0aW9uXG4gICAgICAgICAgICBOZXB0dW5lc1ByaWRlLm5wLm9uRnVsbFVuaXZlcnNlKG51bGwsIGVnZ2Vycy5yZXNwb25zZUpTT04uc2Nhbm5pbmdfZGF0YSk7XG4gICAgICAgICAgICBOZXB0dW5lc1ByaWRlLm5wdWkub25IaWRlU2NyZWVuKG51bGwsIHRydWUpO1xuICAgICAgICAgICAgTmVwdHVuZXNQcmlkZS5ucC50cmlnZ2VyKFwic2VsZWN0X3BsYXllclwiLCBbXG4gICAgICAgICAgICAgICAgTmVwdHVuZXNQcmlkZS51bml2ZXJzZS5wbGF5ZXIudWlkLFxuICAgICAgICAgICAgICAgIHRydWUsXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIGluaXQoKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgaG90a2V5KFwiPlwiLCBzd2l0Y2hVc2VyKTtcbiAgICBzd2l0Y2hVc2VyLmhlbHAgPVxuICAgICAgICBcIlN3aXRjaCB2aWV3cyB0byB0aGUgbGFzdCB1c2VyIHdob3NlIEFQSSBrZXkgd2FzIHVzZWQgdG8gbG9hZCBkYXRhLiBUaGUgSFVEIHNob3dzIHRoZSBjdXJyZW50IHVzZXIgd2hlbiBcIiArXG4gICAgICAgICAgICBcIml0IGlzIG5vdCB5b3VyIG93biBhbGlhcyB0byBoZWxwIHJlbWluZCB5b3UgdGhhdCB5b3UgYXJlbid0IGluIGNvbnRyb2wgb2YgdGhpcyB1c2VyLlwiO1xuICAgIGhvdGtleShcInxcIiwgbWVyZ2VVc2VyKTtcbiAgICBtZXJnZVVzZXIuaGVscCA9XG4gICAgICAgIFwiTWVyZ2UgdGhlIGxhdGVzdCBkYXRhIGZyb20gdGhlIGxhc3QgdXNlciB3aG9zZSBBUEkga2V5IHdhcyB1c2VkIHRvIGxvYWQgZGF0YS4gVGhpcyBpcyB1c2VmdWwgYWZ0ZXIgYSB0aWNrIFwiICtcbiAgICAgICAgICAgIFwicGFzc2VzIGFuZCB5b3UndmUgcmVsb2FkZWQsIGJ1dCB5b3Ugc3RpbGwgd2FudCB0aGUgbWVyZ2VkIHNjYW4gZGF0YSBmcm9tIHR3byBwbGF5ZXJzIG9uc2NyZWVuLlwiO1xuICAgIE5lcHR1bmVzUHJpZGUubnAub24oXCJzd2l0Y2hfdXNlcl9hcGlcIiwgc3dpdGNoVXNlcik7XG4gICAgTmVwdHVuZXNQcmlkZS5ucC5vbihcIm1lcmdlX3VzZXJfYXBpXCIsIG1lcmdlVXNlcik7XG4gICAgdmFyIG5wYUhlbHAgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBoZWxwID0gW1wiPEgxPlwiLmNvbmNhdCh0aXRsZSwgXCI8L0gxPlwiKV07XG4gICAgICAgIGZvciAodmFyIHBhaXIgaW4gaG90a2V5cykge1xuICAgICAgICAgICAgdmFyIGtleSA9IGhvdGtleXNbcGFpcl1bMF07XG4gICAgICAgICAgICB2YXIgYWN0aW9uID0gaG90a2V5c1twYWlyXVsxXTtcbiAgICAgICAgICAgIGhlbHAucHVzaChcIjxoMj5Ib3RrZXk6IFwiLmNvbmNhdChrZXksIFwiPC9oMj5cIikpO1xuICAgICAgICAgICAgaWYgKGFjdGlvbi5oZWxwKSB7XG4gICAgICAgICAgICAgICAgaGVscC5wdXNoKGFjdGlvbi5oZWxwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGhlbHAucHVzaChcIjxwPk5vIGRvY3VtZW50YXRpb24geWV0LjxwPjxjb2RlPlwiLmNvbmNhdChhY3Rpb24udG9Mb2NhbGVTdHJpbmcoKSwgXCI8L2NvZGU+XCIpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlLmhlbHBIVE1MID0gaGVscC5qb2luKFwiXCIpO1xuICAgICAgICBOZXB0dW5lc1ByaWRlLm5wLnRyaWdnZXIoXCJzaG93X3NjcmVlblwiLCBcImhlbHBcIik7XG4gICAgfTtcbiAgICBucGFIZWxwLmhlbHAgPSBcIkRpc3BsYXkgdGhpcyBoZWxwIHNjcmVlbi5cIjtcbiAgICBob3RrZXkoXCI/XCIsIG5wYUhlbHApO1xuICAgIHZhciBhdXRvY29tcGxldGVNb2RlID0gMDtcbiAgICB2YXIgYXV0b2NvbXBsZXRlVHJpZ2dlciA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGlmIChlLnRhcmdldC50eXBlID09PSBcInRleHRhcmVhXCIpIHtcbiAgICAgICAgICAgIGlmIChhdXRvY29tcGxldGVNb2RlKSB7XG4gICAgICAgICAgICAgICAgdmFyIHN0YXJ0ID0gYXV0b2NvbXBsZXRlTW9kZTtcbiAgICAgICAgICAgICAgICB2YXIgZW5kQnJhY2tldCA9IGUudGFyZ2V0LnZhbHVlLmluZGV4T2YoXCJdXCIsIHN0YXJ0KTtcbiAgICAgICAgICAgICAgICBpZiAoZW5kQnJhY2tldCA9PT0gLTEpXG4gICAgICAgICAgICAgICAgICAgIGVuZEJyYWNrZXQgPSBlLnRhcmdldC52YWx1ZS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgdmFyIGF1dG9TdHJpbmcgPSBlLnRhcmdldC52YWx1ZS5zdWJzdHJpbmcoc3RhcnQsIGVuZEJyYWNrZXQpO1xuICAgICAgICAgICAgICAgIHZhciBrZXkgPSBlLmtleTtcbiAgICAgICAgICAgICAgICBpZiAoa2V5ID09PSBcIl1cIikge1xuICAgICAgICAgICAgICAgICAgICBhdXRvY29tcGxldGVNb2RlID0gMDtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG0gPSBhdXRvU3RyaW5nLm1hdGNoKC9eWzAtOV1bMC05XSokLyk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChtID09PSBudWxsIHx8IG0gPT09IHZvaWQgMCA/IHZvaWQgMCA6IG0ubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcHVpZCA9IE51bWJlcihhdXRvU3RyaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBlbmQgPSBlLnRhcmdldC5zZWxlY3Rpb25FbmQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgYXV0byA9IFwiXCIuY29uY2F0KHB1aWQsIFwiXV0gXCIpLmNvbmNhdChOZXB0dW5lc1ByaWRlLnVuaXZlcnNlLmdhbGF4eS5wbGF5ZXJzW3B1aWRdLmFsaWFzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGUudGFyZ2V0LnZhbHVlID1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlLnRhcmdldC52YWx1ZS5zdWJzdHJpbmcoMCwgc3RhcnQpICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXV0byArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGUudGFyZ2V0LnZhbHVlLnN1YnN0cmluZyhlbmQsIGUudGFyZ2V0LnZhbHVlLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBlLnRhcmdldC5zZWxlY3Rpb25TdGFydCA9IHN0YXJ0ICsgYXV0by5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgICAgICBlLnRhcmdldC5zZWxlY3Rpb25FbmQgPSBzdGFydCArIGF1dG8ubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoZS50YXJnZXQuc2VsZWN0aW9uU3RhcnQgPiAxKSB7XG4gICAgICAgICAgICAgICAgdmFyIHN0YXJ0ID0gZS50YXJnZXQuc2VsZWN0aW9uU3RhcnQgLSAyO1xuICAgICAgICAgICAgICAgIHZhciBzcyA9IGUudGFyZ2V0LnZhbHVlLnN1YnN0cmluZyhzdGFydCwgc3RhcnQgKyAyKTtcbiAgICAgICAgICAgICAgICBhdXRvY29tcGxldGVNb2RlID0gc3MgPT09IFwiW1tcIiA/IGUudGFyZ2V0LnNlbGVjdGlvblN0YXJ0IDogMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG4gICAgZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKFwia2V5dXBcIiwgYXV0b2NvbXBsZXRlVHJpZ2dlcik7XG59XG52YXIgZm9yY2VfYWRkX2N1c3RvbV9wbGF5ZXJfcGFuZWwgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKFwiUGxheWVyUGFuZWxcIiBpbiBOZXB0dW5lc1ByaWRlLm5wdWkpIHtcbiAgICAgICAgYWRkX2N1c3RvbV9wbGF5ZXJfcGFuZWwoKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHNldFRpbWVvdXQoYWRkX2N1c3RvbV9wbGF5ZXJfcGFuZWwsIDMwMDApO1xuICAgIH1cbn07XG52YXIgYWRkX2N1c3RvbV9wbGF5ZXJfcGFuZWwgPSBmdW5jdGlvbiAoKSB7XG4gICAgTmVwdHVuZXNQcmlkZS5ucHVpLlBsYXllclBhbmVsID0gZnVuY3Rpb24gKHBsYXllciwgc2hvd0VtcGlyZSkge1xuICAgICAgICB2YXIgdW5pdmVyc2UgPSBOZXB0dW5lc1ByaWRlLnVuaXZlcnNlO1xuICAgICAgICB2YXIgbnB1aSA9IE5lcHR1bmVzUHJpZGUubnB1aTtcbiAgICAgICAgdmFyIHBsYXllclBhbmVsID0gQ3J1eC5XaWRnZXQoXCJyZWxcIikuc2l6ZSg0ODAsIDI2NCAtIDggKyA0OCk7XG4gICAgICAgIHZhciBoZWFkaW5nID0gXCJwbGF5ZXJcIjtcbiAgICAgICAgaWYgKHVuaXZlcnNlLnBsYXllckFjaGlldmVtZW50cyAmJlxuICAgICAgICAgICAgTmVwdHVuZXNQcmlkZS5nYW1lQ29uZmlnLmFub255bWl0eSA9PT0gMCkge1xuICAgICAgICAgICAgaWYgKHVuaXZlcnNlLnBsYXllckFjaGlldmVtZW50c1twbGF5ZXIudWlkXSkge1xuICAgICAgICAgICAgICAgIGlmICh1bml2ZXJzZS5wbGF5ZXJBY2hpZXZlbWVudHNbcGxheWVyLnVpZF0ucHJlbWl1bSA9PT0gXCJwcmVtaXVtXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgaGVhZGluZyA9IFwicHJlbWl1bV9wbGF5ZXJcIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHVuaXZlcnNlLnBsYXllckFjaGlldmVtZW50c1twbGF5ZXIudWlkXS5wcmVtaXVtID09PSBcImxpZmV0aW1lXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgaGVhZGluZyA9IFwibGlmZXRpbWVfcHJlbWl1bV9wbGF5ZXJcIjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgQ3J1eC5UZXh0KGhlYWRpbmcsIFwic2VjdGlvbl90aXRsZSBjb2xfYmxhY2tcIilcbiAgICAgICAgICAgIC5ncmlkKDAsIDAsIDMwLCAzKVxuICAgICAgICAgICAgLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgaWYgKHBsYXllci5haSkge1xuICAgICAgICAgICAgQ3J1eC5UZXh0KFwiYWlfYWRtaW5cIiwgXCJ0eHRfcmlnaHQgcGFkMTJcIilcbiAgICAgICAgICAgICAgICAuZ3JpZCgwLCAwLCAzMCwgMylcbiAgICAgICAgICAgICAgICAucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICB9XG4gICAgICAgIENydXguSW1hZ2UoXCIuLi9pbWFnZXMvYXZhdGFycy8xNjAvXCIuY29uY2F0KHBsYXllci5hdmF0YXIsIFwiLmpwZ1wiKSwgXCJhYnNcIilcbiAgICAgICAgICAgIC5ncmlkKDAsIDYsIDEwLCAxMClcbiAgICAgICAgICAgIC5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgIENydXguV2lkZ2V0KFwicGNpXzQ4X1wiLmNvbmNhdChwbGF5ZXIudWlkKSkuZ3JpZCg3LCAxMywgMywgMykucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICBDcnV4LldpZGdldChcImNvbF9hY2NlbnRcIikuZ3JpZCgwLCAzLCAzMCwgMykucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICBDcnV4LlRleHQoXCJcIiwgXCJzY3JlZW5fc3VidGl0bGVcIilcbiAgICAgICAgICAgIC5ncmlkKDAsIDMsIDMwLCAzKVxuICAgICAgICAgICAgLnJhd0hUTUwocGxheWVyLnF1YWxpZmllZEFsaWFzKVxuICAgICAgICAgICAgLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgLy8gQWNoaWV2ZW1lbnRzXG4gICAgICAgIHZhciBteUFjaGlldmVtZW50cztcbiAgICAgICAgLy9VPT5Ub3hpY1xuICAgICAgICAvL1Y9Pk1hZ2ljXG4gICAgICAgIC8vNT0+RmxvbWJhZXVcbiAgICAgICAgLy9XPT5XaXphcmRcbiAgICAgICAgaWYgKHVuaXZlcnNlLnBsYXllckFjaGlldmVtZW50cykge1xuICAgICAgICAgICAgbXlBY2hpZXZlbWVudHMgPSB1bml2ZXJzZS5wbGF5ZXJBY2hpZXZlbWVudHNbcGxheWVyLnVpZF07XG4gICAgICAgICAgICBpZiAoYXBlX3BsYXllcnMgPT09IG51bGwgfHwgYXBlX3BsYXllcnMgPT09IHZvaWQgMCA/IHZvaWQgMCA6IGFwZV9wbGF5ZXJzLmluY2x1ZGVzKHBsYXllci5yYXdBbGlhcykpIHtcbiAgICAgICAgICAgICAgICBpZiAobXlBY2hpZXZlbWVudHMuZXh0cmFfYmFkZ2VzID09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICBteUFjaGlldmVtZW50cy5leHRyYV9iYWRnZXMgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBhcGVfcGxheWVycy5mb3JFYWNoKGZ1bmN0aW9uIChhcGVfbmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGFwZV9uYW1lID09IHBsYXllci5yYXdBbGlhcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG15QWNoaWV2ZW1lbnRzLmJhZGdlcyA9IFwiYVwiLmNvbmNhdChteUFjaGlldmVtZW50cy5iYWRnZXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG15QWNoaWV2ZW1lbnRzKSB7XG4gICAgICAgICAgICBucHVpXG4gICAgICAgICAgICAgICAgLlNtYWxsQmFkZ2VSb3cobXlBY2hpZXZlbWVudHMuYmFkZ2VzKVxuICAgICAgICAgICAgICAgIC5ncmlkKDAsIDMsIDMwLCAzKVxuICAgICAgICAgICAgICAgIC5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgIH1cbiAgICAgICAgQ3J1eC5XaWRnZXQoXCJjb2xfYmxhY2tcIikuZ3JpZCgxMCwgNiwgMjAsIDMpLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgaWYgKHBsYXllci51aWQgIT0gZ2V0X2hlcm8oTmVwdHVuZXNQcmlkZS51bml2ZXJzZSkudWlkICYmIHBsYXllci5haSA9PSAwKSB7XG4gICAgICAgICAgICAvL1VzZSB0aGlzIHRvIG9ubHkgdmlldyB3aGVuIHRoZXkgYXJlIHdpdGhpbiBzY2FubmluZzpcbiAgICAgICAgICAgIC8vdW5pdmVyc2Uuc2VsZWN0ZWRTdGFyLnYgIT0gXCIwXCJcbiAgICAgICAgICAgIHZhciB0b3RhbF9zZWxsX2Nvc3QgPSBnZXRfdGVjaF90cmFkZV9jb3N0KGdldF9oZXJvKE5lcHR1bmVzUHJpZGUudW5pdmVyc2UpLCBwbGF5ZXIpO1xuICAgICAgICAgICAgLyoqKiBTSEFSRSBBTEwgVEVDSCAgKioqL1xuICAgICAgICAgICAgdmFyIGJ0biA9IENydXguQnV0dG9uKFwiXCIsIFwic2hhcmVfYWxsX3RlY2hcIiwgcGxheWVyKVxuICAgICAgICAgICAgICAgIC5hZGRTdHlsZShcImZ3ZFwiKVxuICAgICAgICAgICAgICAgIC5yYXdIVE1MKFwiU2hhcmUgQWxsIFRlY2g6ICRcIi5jb25jYXQodG90YWxfc2VsbF9jb3N0KSlcbiAgICAgICAgICAgICAgICAuZ3JpZCgxMCwgMzEsIDE0LCAzKTtcbiAgICAgICAgICAgIC8vRGlzYWJsZSBpZiBpbiBhIGdhbWUgd2l0aCBGQSAmIFNjYW4gKEJVRylcbiAgICAgICAgICAgIHZhciBjb25maWcgPSBOZXB0dW5lc1ByaWRlLmdhbWVDb25maWc7XG4gICAgICAgICAgICBpZiAoIShjb25maWcudHJhZGVTY2FubmVkICYmIGNvbmZpZy5hbGxpYW5jZXMpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGdldF9oZXJvKE5lcHR1bmVzUHJpZGUudW5pdmVyc2UpLmNhc2ggPj0gdG90YWxfc2VsbF9jb3N0KSB7XG4gICAgICAgICAgICAgICAgICAgIGJ0bi5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBidG4uZGlzYWJsZSgpLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvKioqIFBBWSBGT1IgQUxMIFRFQ0ggKioqL1xuICAgICAgICAgICAgdmFyIHRvdGFsX2J1eV9jb3N0ID0gZ2V0X3RlY2hfdHJhZGVfY29zdChwbGF5ZXIsIGdldF9oZXJvKE5lcHR1bmVzUHJpZGUudW5pdmVyc2UpKTtcbiAgICAgICAgICAgIGJ0biA9IENydXguQnV0dG9uKFwiXCIsIFwiYnV5X2FsbF90ZWNoXCIsIHtcbiAgICAgICAgICAgICAgICBwbGF5ZXI6IHBsYXllcixcbiAgICAgICAgICAgICAgICB0ZWNoOiBudWxsLFxuICAgICAgICAgICAgICAgIGNvc3Q6IHRvdGFsX2J1eV9jb3N0LFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuYWRkU3R5bGUoXCJmd2RcIilcbiAgICAgICAgICAgICAgICAucmF3SFRNTChcIlBheSBmb3IgQWxsIFRlY2g6ICRcIi5jb25jYXQodG90YWxfYnV5X2Nvc3QpKVxuICAgICAgICAgICAgICAgIC5ncmlkKDEwLCA0OSwgMTQsIDMpO1xuICAgICAgICAgICAgaWYgKGdldF9oZXJvKE5lcHR1bmVzUHJpZGUudW5pdmVyc2UpLmNhc2ggPj0gdG90YWxfc2VsbF9jb3N0KSB7XG4gICAgICAgICAgICAgICAgYnRuLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGJ0bi5kaXNhYmxlKCkucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLypJbmRpdmlkdWFsIHRlY2hzKi9cbiAgICAgICAgICAgIHZhciBfbmFtZV9tYXAgPSB7XG4gICAgICAgICAgICAgICAgc2Nhbm5pbmc6IFwiU2Nhbm5pbmdcIixcbiAgICAgICAgICAgICAgICBwcm9wdWxzaW9uOiBcIkh5cGVyc3BhY2UgUmFuZ2VcIixcbiAgICAgICAgICAgICAgICB0ZXJyYWZvcm1pbmc6IFwiVGVycmFmb3JtaW5nXCIsXG4gICAgICAgICAgICAgICAgcmVzZWFyY2g6IFwiRXhwZXJpbWVudGF0aW9uXCIsXG4gICAgICAgICAgICAgICAgd2VhcG9uczogXCJXZWFwb25zXCIsXG4gICAgICAgICAgICAgICAgYmFua2luZzogXCJCYW5raW5nXCIsXG4gICAgICAgICAgICAgICAgbWFudWZhY3R1cmluZzogXCJNYW51ZmFjdHVyaW5nXCIsXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdmFyIHRlY2hzID0gW1xuICAgICAgICAgICAgICAgIFwic2Nhbm5pbmdcIixcbiAgICAgICAgICAgICAgICBcInByb3B1bHNpb25cIixcbiAgICAgICAgICAgICAgICBcInRlcnJhZm9ybWluZ1wiLFxuICAgICAgICAgICAgICAgIFwicmVzZWFyY2hcIixcbiAgICAgICAgICAgICAgICBcIndlYXBvbnNcIixcbiAgICAgICAgICAgICAgICBcImJhbmtpbmdcIixcbiAgICAgICAgICAgICAgICBcIm1hbnVmYWN0dXJpbmdcIixcbiAgICAgICAgICAgIF07XG4gICAgICAgICAgICB0ZWNocy5mb3JFYWNoKGZ1bmN0aW9uICh0ZWNoLCBpKSB7XG4gICAgICAgICAgICAgICAgdmFyIG9uZV90ZWNoX2Nvc3QgPSBnZXRfdGVjaF90cmFkZV9jb3N0KHBsYXllciwgZ2V0X2hlcm8oTmVwdHVuZXNQcmlkZS51bml2ZXJzZSksIHRlY2gpO1xuICAgICAgICAgICAgICAgIHZhciBvbmVfdGVjaCA9IENydXguQnV0dG9uKFwiXCIsIFwiYnV5X29uZV90ZWNoXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgcGxheWVyOiBwbGF5ZXIsXG4gICAgICAgICAgICAgICAgICAgIHRlY2g6IHRlY2gsXG4gICAgICAgICAgICAgICAgICAgIGNvc3Q6IG9uZV90ZWNoX2Nvc3QsXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgLmFkZFN0eWxlKFwiZndkXCIpXG4gICAgICAgICAgICAgICAgICAgIC5yYXdIVE1MKFwiUGF5OiAkXCIuY29uY2F0KG9uZV90ZWNoX2Nvc3QpKVxuICAgICAgICAgICAgICAgICAgICAuZ3JpZCgxNSwgMzQuNSArIGkgKiAyLCA3LCAyKTtcbiAgICAgICAgICAgICAgICBpZiAoZ2V0X2hlcm8oTmVwdHVuZXNQcmlkZS51bml2ZXJzZSkuY2FzaCA+PSBvbmVfdGVjaF9jb3N0ICYmXG4gICAgICAgICAgICAgICAgICAgIG9uZV90ZWNoX2Nvc3QgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIG9uZV90ZWNoLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBDcnV4LlRleHQoXCJ5b3VcIiwgXCJwYWQxMiB0eHRfY2VudGVyXCIpLmdyaWQoMjUsIDYsIDUsIDMpLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgLy8gTGFiZWxzXG4gICAgICAgIENydXguVGV4dChcInRvdGFsX3N0YXJzXCIsIFwicGFkOFwiKS5ncmlkKDEwLCA5LCAxNSwgMykucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICBDcnV4LlRleHQoXCJ0b3RhbF9mbGVldHNcIiwgXCJwYWQ4XCIpLmdyaWQoMTAsIDExLCAxNSwgMykucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICBDcnV4LlRleHQoXCJ0b3RhbF9zaGlwc1wiLCBcInBhZDhcIikuZ3JpZCgxMCwgMTMsIDE1LCAzKS5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgIENydXguVGV4dChcIm5ld19zaGlwc1wiLCBcInBhZDhcIikuZ3JpZCgxMCwgMTUsIDE1LCAzKS5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgIC8vIFRoaXMgcGxheWVycyBzdGF0c1xuICAgICAgICBpZiAocGxheWVyICE9PSB1bml2ZXJzZS5wbGF5ZXIpIHtcbiAgICAgICAgICAgIENydXguVGV4dChcIlwiLCBcInBhZDggdHh0X2NlbnRlclwiKVxuICAgICAgICAgICAgICAgIC5ncmlkKDIwLCA5LCA1LCAzKVxuICAgICAgICAgICAgICAgIC5yYXdIVE1MKHBsYXllci50b3RhbF9zdGFycylcbiAgICAgICAgICAgICAgICAucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICAgICAgQ3J1eC5UZXh0KFwiXCIsIFwicGFkOCB0eHRfY2VudGVyXCIpXG4gICAgICAgICAgICAgICAgLmdyaWQoMjAsIDExLCA1LCAzKVxuICAgICAgICAgICAgICAgIC5yYXdIVE1MKHBsYXllci50b3RhbF9mbGVldHMpXG4gICAgICAgICAgICAgICAgLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgICAgIENydXguVGV4dChcIlwiLCBcInBhZDggdHh0X2NlbnRlclwiKVxuICAgICAgICAgICAgICAgIC5ncmlkKDIwLCAxMywgNSwgMylcbiAgICAgICAgICAgICAgICAucmF3SFRNTChwbGF5ZXIudG90YWxfc3RyZW5ndGgpXG4gICAgICAgICAgICAgICAgLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgICAgIENydXguVGV4dChcIlwiLCBcInBhZDggdHh0X2NlbnRlclwiKVxuICAgICAgICAgICAgICAgIC5ncmlkKDIwLCAxNSwgNSwgMylcbiAgICAgICAgICAgICAgICAucmF3SFRNTChwbGF5ZXIuc2hpcHNQZXJUaWNrKVxuICAgICAgICAgICAgICAgIC5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gc2VsZWN0SGlsaWdodFN0eWxlKHAxLCBwMikge1xuICAgICAgICAgICAgcDEgPSBOdW1iZXIocDEpO1xuICAgICAgICAgICAgcDIgPSBOdW1iZXIocDIpO1xuICAgICAgICAgICAgaWYgKHAxIDwgcDIpXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiIHR4dF93YXJuX2JhZFwiO1xuICAgICAgICAgICAgaWYgKHAxID4gcDIpXG4gICAgICAgICAgICAgICAgcmV0dXJuIFwiIHR4dF93YXJuX2dvb2RcIjtcbiAgICAgICAgICAgIHJldHVybiBcIlwiO1xuICAgICAgICB9XG4gICAgICAgIC8vIFlvdXIgc3RhdHNcbiAgICAgICAgaWYgKHVuaXZlcnNlLnBsYXllcikge1xuICAgICAgICAgICAgQ3J1eC5UZXh0KFwiXCIsIFwicGFkOCB0eHRfY2VudGVyIFwiLmNvbmNhdChzZWxlY3RIaWxpZ2h0U3R5bGUodW5pdmVyc2UucGxheWVyLnRvdGFsX3N0YXJzLCBwbGF5ZXIudG90YWxfc3RhcnMpKSlcbiAgICAgICAgICAgICAgICAuZ3JpZCgyNSwgOSwgNSwgMylcbiAgICAgICAgICAgICAgICAucmF3SFRNTCh1bml2ZXJzZS5wbGF5ZXIudG90YWxfc3RhcnMpXG4gICAgICAgICAgICAgICAgLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgICAgIENydXguVGV4dChcIlwiLCBcInBhZDggdHh0X2NlbnRlclwiLmNvbmNhdChzZWxlY3RIaWxpZ2h0U3R5bGUodW5pdmVyc2UucGxheWVyLnRvdGFsX2ZsZWV0cywgcGxheWVyLnRvdGFsX2ZsZWV0cykpKVxuICAgICAgICAgICAgICAgIC5ncmlkKDI1LCAxMSwgNSwgMylcbiAgICAgICAgICAgICAgICAucmF3SFRNTCh1bml2ZXJzZS5wbGF5ZXIudG90YWxfZmxlZXRzKVxuICAgICAgICAgICAgICAgIC5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgICAgICBDcnV4LlRleHQoXCJcIiwgXCJwYWQ4IHR4dF9jZW50ZXJcIi5jb25jYXQoc2VsZWN0SGlsaWdodFN0eWxlKHVuaXZlcnNlLnBsYXllci50b3RhbF9zdHJlbmd0aCwgcGxheWVyLnRvdGFsX3N0cmVuZ3RoKSkpXG4gICAgICAgICAgICAgICAgLmdyaWQoMjUsIDEzLCA1LCAzKVxuICAgICAgICAgICAgICAgIC5yYXdIVE1MKHVuaXZlcnNlLnBsYXllci50b3RhbF9zdHJlbmd0aClcbiAgICAgICAgICAgICAgICAucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICAgICAgQ3J1eC5UZXh0KFwiXCIsIFwicGFkOCB0eHRfY2VudGVyXCIuY29uY2F0KHNlbGVjdEhpbGlnaHRTdHlsZSh1bml2ZXJzZS5wbGF5ZXIuc2hpcHNQZXJUaWNrLCBwbGF5ZXIuc2hpcHNQZXJUaWNrKSkpXG4gICAgICAgICAgICAgICAgLmdyaWQoMjUsIDE1LCA1LCAzKVxuICAgICAgICAgICAgICAgIC5yYXdIVE1MKHVuaXZlcnNlLnBsYXllci5zaGlwc1BlclRpY2spXG4gICAgICAgICAgICAgICAgLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgfVxuICAgICAgICBDcnV4LldpZGdldChcImNvbF9hY2NlbnRcIikuZ3JpZCgwLCAxNiwgMTAsIDMpLnJvb3N0KHBsYXllclBhbmVsKTtcbiAgICAgICAgaWYgKHVuaXZlcnNlLnBsYXllcikge1xuICAgICAgICAgICAgdmFyIG1zZ0J0biA9IENydXguSWNvbkJ1dHRvbihcImljb24tbWFpbFwiLCBcImluYm94X25ld19tZXNzYWdlX3RvX3BsYXllclwiLCBwbGF5ZXIudWlkKVxuICAgICAgICAgICAgICAgIC5ncmlkKDAsIDE2LCAzLCAzKVxuICAgICAgICAgICAgICAgIC5hZGRTdHlsZShcImZ3ZFwiKVxuICAgICAgICAgICAgICAgIC5kaXNhYmxlKClcbiAgICAgICAgICAgICAgICAucm9vc3QocGxheWVyUGFuZWwpO1xuICAgICAgICAgICAgaWYgKHBsYXllciAhPT0gdW5pdmVyc2UucGxheWVyICYmIHBsYXllci5hbGlhcykge1xuICAgICAgICAgICAgICAgIG1zZ0J0bi5lbmFibGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIENydXguSWNvbkJ1dHRvbihcImljb24tY2hhcnQtbGluZVwiLCBcInNob3dfaW50ZWxcIiwgcGxheWVyLnVpZClcbiAgICAgICAgICAgICAgICAuZ3JpZCgyLjUsIDE2LCAzLCAzKVxuICAgICAgICAgICAgICAgIC5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgICAgICBpZiAoc2hvd0VtcGlyZSkge1xuICAgICAgICAgICAgICAgIENydXguSWNvbkJ1dHRvbihcImljb24tZXllXCIsIFwic2hvd19zY3JlZW5cIiwgXCJlbXBpcmVcIilcbiAgICAgICAgICAgICAgICAgICAgLmdyaWQoNywgMTYsIDMsIDMpXG4gICAgICAgICAgICAgICAgICAgIC5yb29zdChwbGF5ZXJQYW5lbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBsYXllclBhbmVsO1xuICAgIH07XG59O1xudmFyIHN1cGVyU3Rhckluc3BlY3RvciA9IE5lcHR1bmVzUHJpZGUubnB1aS5TdGFySW5zcGVjdG9yO1xuTmVwdHVuZXNQcmlkZS5ucHVpLlN0YXJJbnNwZWN0b3IgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHVuaXZlcnNlID0gTmVwdHVuZXNQcmlkZS51bml2ZXJzZTtcbiAgICB2YXIgY29uZmlnID0gTmVwdHVuZXNQcmlkZS5nYW1lQ29uZmlnO1xuICAgIC8vQ2FsbCBzdXBlciAoUHJldmlvdXMgU3Rhckluc3BlY3RvciBmcm9tIGdhbWVjb2RlKVxuICAgIHZhciBzdGFySW5zcGVjdG9yID0gc3VwZXJTdGFySW5zcGVjdG9yKCk7XG4gICAgQ3J1eC5JY29uQnV0dG9uKFwiaWNvbi1oZWxwIHJlbFwiLCBcInNob3dfaGVscFwiLCBcInN0YXJzXCIpLnJvb3N0KHN0YXJJbnNwZWN0b3IuaGVhZGluZyk7XG4gICAgQ3J1eC5JY29uQnV0dG9uKFwiaWNvbi1kb2MtdGV4dCByZWxcIiwgXCJzaG93X3NjcmVlblwiLCBcImNvbWJhdF9jYWxjdWxhdG9yXCIpLnJvb3N0KHN0YXJJbnNwZWN0b3IuaGVhZGluZyk7XG4gICAgLy9BcHBlbmQgZXh0cmEgZnVuY3Rpb25cbiAgICBmdW5jdGlvbiBhcHBseV9mcmFjdGlvbmFsX3NoaXBzKCkge1xuICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgZGVwdGgsIHNlbGVjdG9yLCBlbGVtZW50LCBjb3VudGVyLCBmcmFjdGlvbmFsX3NoaXAsIGZyYWN0aW9uYWxfc2hpcF8xLCBuZXdfdmFsdWU7XG4gICAgICAgICAgICByZXR1cm4gX19nZW5lcmF0b3IodGhpcywgZnVuY3Rpb24gKF9hKSB7XG4gICAgICAgICAgICAgICAgc3dpdGNoIChfYS5sYWJlbCkge1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXB0aCA9IGNvbmZpZy50dXJuQmFzZWQgPyA0IDogMztcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGVjdG9yID0gXCIjY29udGVudEFyZWEgPiBkaXYgPiBkaXYud2lkZ2V0LmZ1bGxzY3JlZW4gPiBkaXY6bnRoLWNoaWxkKFwiLmNvbmNhdChkZXB0aCwgXCIpID4gZGl2ID4gZGl2Om50aC1jaGlsZCg1KSA+IGRpdi53aWRnZXQucGFkMTIuaWNvbi1yb2NrZXQtaW5saW5lLnR4dF9yaWdodFwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQgPSAkKHNlbGVjdG9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50ZXIgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgZnJhY3Rpb25hbF9zaGlwID0gdW5pdmVyc2Uuc2VsZWN0ZWRTdGFyW1wiY1wiXS50b0ZpeGVkKDIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgJChzZWxlY3RvcikuYXBwZW5kKGZyYWN0aW9uYWxfc2hpcCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBfYS5sYWJlbCA9IDE7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghKGVsZW1lbnQubGVuZ3RoID09IDAgJiYgY291bnRlciA8PSAxMDApKSByZXR1cm4gWzMgLypicmVhayovLCAzXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbNCAvKnlpZWxkKi8sIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyKSB7IHJldHVybiBzZXRUaW1lb3V0KHIsIDEwKTsgfSldO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICAgICAgICAgICAgICBfYS5zZW50KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50ID0gJChzZWxlY3Rvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICBmcmFjdGlvbmFsX3NoaXBfMSA9IHVuaXZlcnNlLnNlbGVjdGVkU3RhcltcImNcIl07XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdfdmFsdWUgPSBwYXJzZUludCgkKHNlbGVjdG9yKS50ZXh0KCkpICsgZnJhY3Rpb25hbF9zaGlwXzE7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKHNlbGVjdG9yKS50ZXh0KG5ld192YWx1ZS50b0ZpeGVkKDIpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50ZXIgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBbMyAvKmJyZWFrKi8sIDFdO1xuICAgICAgICAgICAgICAgICAgICBjYXNlIDM6IHJldHVybiBbMiAvKnJldHVybiovXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGlmIChcImNcIiBpbiB1bml2ZXJzZS5zZWxlY3RlZFN0YXIpIHtcbiAgICAgICAgYXBwbHlfZnJhY3Rpb25hbF9zaGlwcygpO1xuICAgIH1cbiAgICByZXR1cm4gc3Rhckluc3BlY3Rvcjtcbn07XG4vL0phdmFzY3JpcHQgY2FsbFxuc2V0VGltZW91dChMZWdhY3lfTmVwdHVuZXNQcmlkZUFnZW50LCAxMDAwKTtcbm9uR2FtZVJlbmRlcigpOyAvL1dhaXQgZm9yIHBsYXllcnMgdG8gYmUgbG9hZGVkXG5zZXRUaW1lb3V0KGFwcGx5X2hvb2tzLCAxNTAwKTtcbi8vVGVzdCB0byBzZWUgaWYgUGxheWVyUGFuZWwgaXMgdGhlcmVcbi8vSWYgaXQgaXMgb3ZlcndyaXRlcyBjdXN0b20gb25lXG4vL090aGVyd2lzZSB3aGlsZSBsb29wICYgc2V0IHRpbWVvdXQgdW50aWwgaXRzIHRoZXJlXG5mb3JjZV9hZGRfY3VzdG9tX3BsYXllcl9wYW5lbCgpO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9