"use strict";
var __assign = (this && this.__assign) || function () {
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LockManager = exports.generateRandomId = void 0;
var heartBeat_1 = require("./heartBeat");
var localStorageSubscribe_1 = require("./localStorageSubscribe");
var sleep_1 = require("./sleep");
var LOCK_MODE = {
    EXCLUSIVE: "exclusive",
    SHARED: "shared",
};
var LIB_PREFIX = "$navigator.locks";
var STORAGE_KEYS;
(function (STORAGE_KEYS) {
    STORAGE_KEYS["REQUEST_QUEUE_MAP"] = "$navigator.locks-requestQueueMap";
    STORAGE_KEYS["HELD_LOCK_SET"] = "$navigator.locks-heldLockSet";
    STORAGE_KEYS["CLIENT_IDS"] = "$navigator.locks-clientIds";
})(STORAGE_KEYS || (STORAGE_KEYS = {}));
function generateRandomId() {
    return new Date().getTime() + "-" + String(Math.random()).substring(2);
}
exports.generateRandomId = generateRandomId;
var LockManager = /** @class */ (function () {
    function LockManager() {
        this._defaultOptions = {
            mode: LOCK_MODE.EXCLUSIVE,
            ifAvailable: false,
            steal: false,
        };
        this._clientId = LIB_PREFIX + "-clientId-" + generateRandomId();
        this._init();
    }
    LockManager.prototype._init = function () {
        var _this = this;
        this._storeThisClientId();
        var heartBeat = new heartBeat_1.HeartBeat({ key: this._clientId });
        heartBeat.start();
        // handle when unload could't work or the client crash, then clean
        heartBeat.detect(function () { return _this._cleanUnliveClientLocks(); });
        this._onUnload();
    };
    LockManager.prototype._getClientIds = function () {
        var clientIds = localStorageSubscribe_1.getStorageItem(STORAGE_KEYS.CLIENT_IDS);
        return (clientIds && JSON.parse(clientIds)) || [];
    };
    LockManager.prototype._storeClientIds = function (clientIds) {
        localStorageSubscribe_1.setStorageItem(STORAGE_KEYS.CLIENT_IDS, JSON.stringify(clientIds));
    };
    LockManager.prototype._storeThisClientId = function () {
        var prevClientIds = this._getClientIds();
        if (!prevClientIds.includes(this._clientId)) {
            var curClientIds = __spreadArray(__spreadArray([], __read(prevClientIds)), [this._clientId]);
            this._storeClientIds(curClientIds);
        }
    };
    LockManager.prototype.request = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var self;
            return __generator(this, function (_a) {
                self = this;
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        return __awaiter(this, void 0, void 0, function () {
                            var res, cb, _options, name, request, resolveWithCB, heldLockSet, heldLock, requestLockQueue;
                            return __generator(this, function (_a) {
                                res = self._handleRequestArgs(args, reject);
                                if (!res)
                                    return [2 /*return*/];
                                cb = res.cb, _options = res._options;
                                name = args[0];
                                request = {
                                    name: name,
                                    mode: _options.mode,
                                    clientId: self._clientId,
                                    uuid: name + "-" + generateRandomId(),
                                    resolve: resolve,
                                    reject: reject,
                                };
                                resolveWithCB = self._resolveWithCB(cb, resolve, reject);
                                heldLockSet = self._heldLockSet();
                                heldLock = heldLockSet.find(function (e) {
                                    return e.name === request.name;
                                });
                                requestLockQueue = self._requestLockQueueMap()[request.name] || [];
                                // handle request options
                                if (_options.steal === true) {
                                    if (!self._handleExceptionWhenStealIsTrue(_options, reject))
                                        return [2 /*return*/];
                                    // one held lock or multiple shared locks of this source should be remove
                                    heldLockSet = heldLockSet.filter(function (e) { return e.name !== request.name; });
                                    heldLock = heldLockSet.find(function (e) {
                                        return e.name === request.name;
                                    });
                                }
                                else if (_options.ifAvailable === true) {
                                    if ((heldLock &&
                                        !(heldLock.mode === LOCK_MODE.SHARED &&
                                            request.mode === LOCK_MODE.SHARED)) ||
                                        requestLockQueue.length) {
                                        return [2 /*return*/, resolveWithCB(null)];
                                    }
                                    else {
                                        return [2 /*return*/, self._handleNewHeldLock(request, resolveWithCB)];
                                    }
                                }
                                else if (_options.signal !== undefined) {
                                    if (!self._handleSignalExisted(_options, reject, request))
                                        return [2 /*return*/];
                                }
                                self._handleHeldLockAndRequest(heldLock, request, resolveWithCB, requestLockQueue, heldLockSet);
                                return [2 /*return*/];
                            });
                        });
                    })];
            });
        });
    };
    // add async for align with native api and type
    LockManager.prototype.query = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this._query()];
            });
        });
    };
    LockManager.prototype._pushToLockRequestQueueMap = function (request) {
        var requestQueueMap = this._requestLockQueueMap();
        var requestQueue = requestQueueMap[request.name] || [];
        requestQueueMap[request.name] = __spreadArray(__spreadArray([], __read(requestQueue)), [request]);
        this._storeRequestLockQueueMap(requestQueueMap);
        return request;
    };
    LockManager.prototype._pushToHeldLockSet = function (request, currentHeldLockSet) {
        if (currentHeldLockSet === void 0) { currentHeldLockSet = this._heldLockSet(); }
        var heldLockSet = __spreadArray(__spreadArray([], __read(currentHeldLockSet)), [request]);
        this._storeHeldLockSet(heldLockSet);
        return request;
    };
    LockManager.prototype._requestLockQueueMap = function () {
        var requestQueueMap = localStorageSubscribe_1.getStorageItem(STORAGE_KEYS.REQUEST_QUEUE_MAP);
        return (requestQueueMap && JSON.parse(requestQueueMap)) || {};
    };
    LockManager.prototype._heldLockSet = function () {
        var heldLockSet = localStorageSubscribe_1.getStorageItem(STORAGE_KEYS.HELD_LOCK_SET);
        return (heldLockSet && JSON.parse(heldLockSet)) || [];
    };
    // delete old held lock and add move first request Lock to held lock set
    LockManager.prototype._updateHeldAndRequestLocks = function (request) {
        var heldLockSet = this._heldLockSet();
        var heldLockIndex = heldLockSet.findIndex(function (lock) { return lock.uuid === request.uuid; });
        if (heldLockIndex !== -1) {
            heldLockSet.splice(heldLockIndex, 1);
            var requestLockQueueMap = this._requestLockQueueMap();
            var requestLockQueue = requestLockQueueMap[request.name] || [];
            var _a = __read(requestLockQueue), firstRequestLock = _a[0], restRequestLocks = _a.slice(1);
            if (firstRequestLock) {
                if (firstRequestLock.mode === LOCK_MODE.EXCLUSIVE ||
                    restRequestLocks.length === 0) {
                    heldLockSet.push(firstRequestLock);
                    requestLockQueueMap[request.name] = restRequestLocks;
                }
                else if (firstRequestLock.mode === LOCK_MODE.SHARED) {
                    var nonSharedLockIndex = requestLockQueue.findIndex(function (lock) { return lock.mode !== LOCK_MODE.SHARED; });
                    if (nonSharedLockIndex === -1)
                        nonSharedLockIndex = requestLockQueue.length;
                    heldLockSet = __spreadArray(__spreadArray([], __read(heldLockSet)), __read(requestLockQueue.splice(0, nonSharedLockIndex)));
                }
                this._storeHeldLockSetAndRequestLockQueueMap(heldLockSet, requestLockQueueMap);
                return firstRequestLock;
            }
            else {
                this._storeHeldLockSet(heldLockSet);
            }
        }
        else {
            console.log("this held lock which uuid is " + request.uuid + " had been steal");
        }
    };
    LockManager.prototype._handleSignalExisted = function (_options, reject, request) {
        if (!(_options.signal instanceof AbortSignal)) {
            reject(new TypeError("Failed to execute 'request' on 'LockManager': member signal is not of type AbortSignal."));
            return false;
        }
        else if (_options.signal.aborted) {
            reject(new DOMException("Failed to execute 'request' on 'LockManager': The request was aborted."));
            return false;
        }
        else {
            this._signalOnabort(_options.signal, request);
        }
        return true;
    };
    LockManager.prototype._handleExceptionWhenStealIsTrue = function (_options, reject) {
        if (_options.mode !== LOCK_MODE.EXCLUSIVE) {
            reject(new DOMException("Failed to execute 'request' on 'LockManager': The 'steal' option may only be used with 'exclusive' locks."));
            return false;
        }
        if (_options.ifAvailable === true) {
            reject(new DOMException("Failed to execute 'request' on 'LockManager': The 'steal' and 'ifAvailable' options cannot be used together."));
            return false;
        }
        return true;
    };
    LockManager.prototype._handleRequestArgs = function (args, reject) {
        var argsLength = args.length;
        var cb;
        var _options;
        // handle args in different case
        if (argsLength < 2) {
            reject(new TypeError("Failed to execute 'request' on 'LockManager': 2 arguments required, but only " + args.length + " present."));
            return null;
        }
        else if (argsLength === 2) {
            if (typeof args[1] !== "function") {
                reject(new TypeError("Failed to execute 'request' on 'LockManager': parameter 2 is not of type 'Function'."));
                return null;
            }
            else {
                cb = args[1];
                _options = this._defaultOptions;
            }
        }
        else {
            if (typeof args[2] !== "function") {
                reject(new TypeError("Failed to execute 'request' on 'LockManager': parameter 3 is not of type 'Function'."));
                return null;
            }
            else {
                cb = args[2];
                _options = __assign(__assign({}, this._defaultOptions), args[1]);
            }
        }
        if (Object.values(LOCK_MODE).indexOf(_options.mode) < 0) {
            reject(new TypeError("Failed to execute 'request' on 'LockManager': The provided value '" + _options.mode + "' is not a valid enum value of type LockMode."));
            return null;
        }
        // handle source name
        if (args[0][0] === "-") {
            reject(new DOMException("Failed to execute 'request' on 'LockManager': Names cannot start with '-'."));
            return null;
        }
        return { cb: cb, _options: _options };
    };
    LockManager.prototype._handleHeldLockAndRequest = function (heldLock, request, resolveWithCB, requestLockQueue, heldLockSet) {
        if (heldLock) {
            if (heldLock.mode === LOCK_MODE.EXCLUSIVE) {
                this._handleNewLockRequest(request, resolveWithCB);
            }
            else if (heldLock.mode === LOCK_MODE.SHARED) {
                // if this request lock is shared lock and is first request lock of this queue, then push held locks set
                if (request.mode === LOCK_MODE.SHARED &&
                    requestLockQueue.length === 0) {
                    this._handleNewHeldLock(request, resolveWithCB, heldLockSet);
                }
                else {
                    this._handleNewLockRequest(request, resolveWithCB);
                }
            }
        }
        else {
            this._handleNewHeldLock(request, resolveWithCB, heldLockSet);
        }
    };
    LockManager.prototype._signalOnabort = function (signal, _a) {
        var _this = this;
        var name = _a.name, uuid = _a.uuid;
        signal.onabort = function () {
            // clean the lock request when it is aborted
            var _requestLockQueueMap = _this._requestLockQueueMap();
            var requestLockIndex = _requestLockQueueMap[name].findIndex(function (lock) { return lock.uuid === uuid; });
            if (requestLockIndex !== -1) {
                _requestLockQueueMap[name].splice(requestLockIndex, 1);
                _this._storeRequestLockQueueMap(_requestLockQueueMap);
            }
        };
    };
    // let cb executed in Micro task
    LockManager.prototype._resolveWithCB = function (cb, resolve, reject) {
        var _this = this;
        return function (args) {
            return new Promise(function (_resolve) {
                new Promise(function (res) { return res(""); }).then(function () { return __awaiter(_this, void 0, void 0, function () {
                    var res, error_1;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 3]);
                                return [4 /*yield*/, cb(args)];
                            case 1:
                                res = _a.sent();
                                _resolve(res);
                                resolve(res);
                                return [3 /*break*/, 3];
                            case 2:
                                error_1 = _a.sent();
                                _resolve(error_1);
                                reject(error_1);
                                return [3 /*break*/, 3];
                            case 3: return [2 /*return*/];
                        }
                    });
                }); });
            });
        };
    };
    LockManager.prototype._handleNewHeldLock = function (request, resolveWithCB, currentHeldLockSet) {
        return __awaiter(this, void 0, void 0, function () {
            var callBackResolved, rejectedForSteal, listener;
            var _this = this;
            return __generator(this, function (_a) {
                this._pushToHeldLockSet(request, currentHeldLockSet);
                callBackResolved = false;
                rejectedForSteal = false;
                listener = function () {
                    if (!callBackResolved &&
                        !rejectedForSteal &&
                        !_this._isInHeldLockSet(request.uuid)) {
                        _this._handleHeldLockBeSteal(request);
                        rejectedForSteal = true;
                        return true;
                    }
                    return false;
                };
                localStorageSubscribe_1.onStorageChange(STORAGE_KEYS.HELD_LOCK_SET, listener);
                resolveWithCB({ name: request.name, mode: request.mode }).then(function () {
                    callBackResolved = true;
                    _this._updateHeldAndRequestLocks(request);
                });
                return [2 /*return*/];
            });
        });
    };
    LockManager.prototype._handleHeldLockBeSteal = function (request) {
        request.reject(new DOMException("Lock broken by another request with the 'steal' option."));
    };
    LockManager.prototype._storeHeldLockSet = function (heldLockSet) {
        localStorageSubscribe_1.setStorageItem(STORAGE_KEYS.HELD_LOCK_SET, JSON.stringify(heldLockSet));
    };
    LockManager.prototype._storeRequestLockQueueMap = function (requestLockQueueMap) {
        localStorageSubscribe_1.setStorageItem(STORAGE_KEYS.REQUEST_QUEUE_MAP, JSON.stringify(requestLockQueueMap));
    };
    LockManager.prototype._isInHeldLockSet = function (uuid) {
        return this._heldLockSet().some(function (e) { return e.uuid === uuid; });
    };
    LockManager.prototype._handleNewLockRequest = function (request, resolveWithCB) {
        var _this = this;
        this._pushToLockRequestQueueMap(request);
        var heldLockWIP = false;
        var listener = function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(!heldLockWIP && this._isInHeldLockSet(request.uuid))) return [3 /*break*/, 5];
                        heldLockWIP = true;
                        return [4 /*yield*/, resolveWithCB({ name: request.name, mode: request.mode })];
                    case 1:
                        _a.sent();
                        // check and handle if this held lock has been steal
                        if (!this._isInHeldLockSet(request.uuid)) {
                            this._handleHeldLockBeSteal(request);
                        }
                        if (!(request.mode === LOCK_MODE.EXCLUSIVE)) return [3 /*break*/, 2];
                        this._updateHeldAndRequestLocks(request);
                        return [3 /*break*/, 4];
                    case 2:
                        if (!(request.mode === LOCK_MODE.SHARED)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this._handleSharedLockFromListener(request)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/, true];
                    case 5: return [2 /*return*/, false];
                }
            });
        }); };
        localStorageSubscribe_1.onStorageChange(STORAGE_KEYS.HELD_LOCK_SET, listener);
    };
    LockManager.prototype._handleSharedLockFromListener = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var otherUnreleasedSharedHeldLocks;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // handle the issue when the shared locks release at the same time
                    return [4 /*yield*/, sleep_1.sleep(Math.floor(Math.random() * 1000))];
                    case 1:
                        // handle the issue when the shared locks release at the same time
                        _a.sent();
                        otherUnreleasedSharedHeldLocks = this._heldLockSet().filter(function (lock) {
                            return lock.name === request.name &&
                                lock.uuid !== request.uuid &&
                                lock.mode === LOCK_MODE.SHARED;
                        });
                        if (otherUnreleasedSharedHeldLocks.length) {
                            this._storeHeldLockSet(otherUnreleasedSharedHeldLocks);
                            // this._handleSharedLocksRelease(request);
                        }
                        else {
                            this._updateHeldAndRequestLocks(request);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    // private _handleSharedLocksRelease(request: Request) {
    //   let latestHeldLockSet = this._heldLockSet();
    //   if (!latestHeldLockSet.some((lock) => lock.name === request.name)) {
    //     const requestLockQueueMap = this._requestLockQueueMap();
    //     const [firstRequestLock, ...restRequestLocks] =
    //       requestLockQueueMap[request.name] || [];
    //     if (firstRequestLock) {
    //       latestHeldLockSet.push(firstRequestLock);
    //       requestLockQueueMap[request.name] = restRequestLocks;
    //       this._storeHeldLockSetAndRequestLockQueueMap(
    //         latestHeldLockSet,
    //         requestLockQueueMap
    //       );
    //     }
    //   }
    // }
    LockManager.prototype._storeHeldLockSetAndRequestLockQueueMap = function (heldLockSet, requestLockQueueMap) {
        this._storeHeldLockSet(heldLockSet);
        this._storeRequestLockQueueMap(requestLockQueueMap);
    };
    LockManager.prototype._query = function () {
        var queryResult = {
            held: this._heldLockSet(),
            pending: [],
        };
        var requestLockQueueMap = this._requestLockQueueMap();
        for (var name_1 in requestLockQueueMap) {
            var requestLockQueue = requestLockQueueMap[name_1];
            queryResult.pending = queryResult.pending.concat(requestLockQueue);
        }
        return queryResult;
    };
    LockManager.prototype._onUnload = function () {
        var _this = this;
        window.addEventListener("unload", function (e) {
            _this._cleanClientLocksByClientId(_this._clientId);
        });
    };
    LockManager.prototype._cleanClientLocksByClientId = function (clientId) {
        var requestLockQueueMap = this._requestLockQueueMap();
        this._cleanRequestLockQueueByClientId(requestLockQueueMap, clientId);
        var newHeldLockSet = this._cleanHeldLockSetByClientId(requestLockQueueMap, clientId);
        this._storeHeldLockSetAndRequestLockQueueMap(newHeldLockSet, requestLockQueueMap);
    };
    LockManager.prototype._cleanHeldLockSetByClientId = function (requestLockQueueMap, clientId) {
        var heldLockSet = this._heldLockSet();
        var newHeldLockSet = [];
        heldLockSet.forEach(function (element) {
            if (element.clientId !== clientId) {
                newHeldLockSet.push(element);
            }
            else {
                var requestLockQueue = requestLockQueueMap[element.name] || [];
                var _a = __read(requestLockQueue), firstRequestLock = _a[0], restRequestLocks = _a.slice(1);
                if (firstRequestLock) {
                    if (firstRequestLock.mode === LOCK_MODE.EXCLUSIVE ||
                        restRequestLocks.length === 0) {
                        newHeldLockSet.push(firstRequestLock);
                        requestLockQueueMap[element.name] = restRequestLocks;
                    }
                    else if (firstRequestLock.mode === LOCK_MODE.SHARED) {
                        var nonSharedLockIndex = requestLockQueue.findIndex(function (lock) { return lock.mode !== LOCK_MODE.SHARED; });
                        if (nonSharedLockIndex === -1)
                            nonSharedLockIndex = requestLockQueue.length;
                        newHeldLockSet = __spreadArray(__spreadArray([], __read(newHeldLockSet)), __read(requestLockQueue.splice(0, nonSharedLockIndex)));
                    }
                }
            }
        });
        return newHeldLockSet;
    };
    LockManager.prototype._cleanRequestLockQueueByClientId = function (requestLockQueueMap, clientId) {
        for (var sourceName in requestLockQueueMap) {
            var requestLockQueue = requestLockQueueMap[sourceName];
            requestLockQueueMap[sourceName] = requestLockQueue.filter(function (requestLock) { return requestLock.clientId !== clientId; });
        }
    };
    LockManager.prototype._cleanUnliveClientLocks = function () {
        var _this = this;
        var uniqueClientIds = __spreadArray([], __read(new Set(this._getClientIds())));
        if (!uniqueClientIds.length) {
            this._storeClientIds([]);
            return;
        }
        var aliveClientIds = [];
        uniqueClientIds.forEach(function (clientId) {
            var timeStamp = localStorageSubscribe_1.getStorageItem(clientId);
            // if unlive
            if (!timeStamp || Date.now() - Number(timeStamp) > 3100) {
                localStorageSubscribe_1.removeStorageItem(clientId);
                _this._cleanClientLocksByClientId(clientId);
            }
            else {
                aliveClientIds.push(clientId);
            }
        });
        if (JSON.stringify(uniqueClientIds) !== JSON.stringify(aliveClientIds)) {
            this._storeClientIds(aliveClientIds);
        }
    };
    return LockManager;
}());
exports.LockManager = LockManager;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9seWZpbGwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcG9seWZpbGwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSx5Q0FBd0M7QUFDeEMsaUVBS2lDO0FBQ2pDLGlDQUFnQztBQUVoQyxJQUFNLFNBQVMsR0FBRztJQUNoQixTQUFTLEVBQUUsV0FBVztJQUN0QixNQUFNLEVBQUUsUUFBUTtDQUNSLENBQUM7QUFJWCxJQUFNLFVBQVUsR0FBRyxrQkFBa0IsQ0FBQztBQUV0QyxJQUFLLFlBSUo7QUFKRCxXQUFLLFlBQVk7SUFDZixzRUFBc0QsQ0FBQTtJQUN0RCw4REFBOEMsQ0FBQTtJQUM5Qyx5REFBeUMsQ0FBQTtBQUMzQyxDQUFDLEVBSkksWUFBWSxLQUFaLFlBQVksUUFJaEI7QUFrREQsU0FBZ0IsZ0JBQWdCO0lBQzlCLE9BQVUsSUFBSSxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsU0FBSSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBRyxDQUFDO0FBQ3pFLENBQUM7QUFGRCw0Q0FFQztBQUVEO0lBSUU7UUFDRSxJQUFJLENBQUMsZUFBZSxHQUFHO1lBQ3JCLElBQUksRUFBRSxTQUFTLENBQUMsU0FBUztZQUN6QixXQUFXLEVBQUUsS0FBSztZQUNsQixLQUFLLEVBQUUsS0FBSztTQUNiLENBQUM7UUFDRixJQUFJLENBQUMsU0FBUyxHQUFNLFVBQVUsa0JBQWEsZ0JBQWdCLEVBQUksQ0FBQztRQUNoRSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDZixDQUFDO0lBRU8sMkJBQUssR0FBYjtRQUFBLGlCQU9DO1FBTkMsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDMUIsSUFBTSxTQUFTLEdBQUcsSUFBSSxxQkFBUyxDQUFD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QUFDO1lBQzNDLFlBQVk7WUFDWixJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsSUFBSSxFQUFFO2dCQUN2RCx5Q0FBaUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDNUIsS0FBSSxDQUFDLDJCQUEyQixDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQzVDO2lCQUFNO2dCQUNMLGNBQWMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7YUFDL0I7UUFDSCxDQUFDLENBQUMsQ0FBQztRQUNILElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsS0FBSyxJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxFQUFFO1lBQ3RFLElBQUksQ0FBQyxlQUFlLENBQUMsY0FBYyxDQUFDLENBQUM7U0FDdEM7SUFDSCxDQUFDO0lBQ0gsa0JBQUM7QUFBRCxDQUFDLEFBbmtCRCxJQW1rQkM7QUFua0JZLGtDQUFXIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSGVhcnRCZWF0IH0gZnJvbSBcIi4vaGVhcnRCZWF0XCI7XG5pbXBvcnQge1xuICBvblN0b3JhZ2VDaGFuZ2UsXG4gIGdldFN0b3JhZ2VJdGVtLFxuICBzZXRTdG9yYWdlSXRlbSxcbiAgcmVtb3ZlU3RvcmFnZUl0ZW0sXG59IGZyb20gXCIuL2xvY2FsU3RvcmFnZVN1YnNjcmliZVwiO1xuaW1wb3J0IHsgc2xlZXAgfSBmcm9tIFwiLi9zbGVlcFwiO1xuXG5jb25zdCBMT0NLX01PREUgPSB7XG4gIEVYQ0xVU0lWRTogXCJleGNsdXNpdmVcIixcbiAgU0hBUkVEOiBcInNoYXJlZFwiLFxufSBhcyBjb25zdDtcblxudHlwZSBMb2NrTW9kZSA9IHR5cGVvZiBMT0NLX01PREVba2V5b2YgdHlwZW9mIExPQ0tfTU9ERV07XG5cbmNvbnN0IExJQl9QUkVGSVggPSBcIiRuYXZpZ2F0b3IubG9ja3NcIjtcblxuZW51bSBTVE9SQUdFX0tFWVMge1xuICBSRVFVRVNUX1FVRVVFX01BUCA9IFwiJG5hdmlnYXRvci5sb2Nrcy1yZXF1ZXN0UXVldWVNYXBcIixcbiAgSEVMRF9MT0NLX1NFVCA9IFwiJG5hdmlnYXRvci5sb2Nrcy1oZWxkTG9ja1NldFwiLFxuICBDTElFTlRfSURTID0gXCIkbmF2aWdhdG9yLmxvY2tzLWNsaWVudElkc1wiLFxufVxuaW50ZXJmYWNlIExvY2tPcHRpb25zIHtcbiAgbW9kZTogTG9ja01vZGU7XG4gIGlmQXZhaWxhYmxlOiBCb29sZWFuO1xuICBzdGVhbDogQm9vbGVhbjtcbiAgc2lnbmFsPzogQWJvcnRTaWduYWw7XG59XG5cbmV4cG9ydCB0eXBlIExvY2sgPSB7XG4gIG1vZGU6IExvY2tNb2RlO1xuICBuYW1lOiBzdHJpbmc7XG59O1xuXG50eXBlIExvY2tHcmFudGVkQ2FsbGJhY2sgPSAobG9jaz86IExvY2sgfCBudWxsKSA9PiBQcm9taXNlPGFueT4gfCBhbnk7XG5cbmV4cG9ydCB0eXBlIExvY2tJbmZvID0gTG9jayAmIHtcbiAgY2xpZW50SWQ6IHN0cmluZztcbiAgdXVpZDogc3RyaW5nO1xufTtcblxudHlwZSBSZXF1ZXN0ID0gTG9ja0luZm8gJiB7XG4gIHJlc29sdmU6ICh2YWx1ZT86IHVua25vd24pID0+IHZvaWQ7XG4gIHJlamVjdDogKHJlYXNvbj86IGFueSkgPT4gdm9pZDtcbn07XG5cbnR5cGUgUmVxdWVzdEFyZ3NDYXNlMSA9IFtuYW1lOiBzdHJpbmcsIGNhbGxiYWNrOiBMb2NrR3JhbnRlZENhbGxiYWNrXTtcblxudHlwZSBSZXF1ZXN0QXJnc0Nhc2UyID0gW1xuICBuYW1lOiBzdHJpbmcsXG4gIG9wdGlvbnM6IFBhcnRpYWw8TG9ja09wdGlvbnM+LFxuICBjYWxsYmFjazogTG9ja0dyYW50ZWRDYWxsYmFja1xuXTtcblxudHlwZSBSZXF1ZXN0QXJnc0Nhc2UzID0gW1xuICBuYW1lOiBzdHJpbmcsXG4gIG9wdGlvbnNPckNhbGxiYWNrOiBQYXJ0aWFsPExvY2tPcHRpb25zPiB8IExvY2tHcmFudGVkQ2FsbGJhY2ssXG4gIGNhbGxiYWNrPzogTG9ja0dyYW50ZWRDYWxsYmFja1xuXTtcblxuZXhwb3J0IHR5cGUgTG9ja3NJbmZvID0gTG9ja0luZm9bXTtcblxuaW50ZXJmYWNlIFJlcXVlc3RRdWV1ZU1hcCB7XG4gIFtrZXk6IHN0cmluZ106IExvY2tzSW5mbztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBMb2NrTWFuYWdlclNuYXBzaG90IHtcbiAgaGVsZDogTG9ja3NJbmZvO1xuICBwZW5kaW5nOiBMb2Nrc0luZm87XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0ZVJhbmRvbUlkKCkge1xuICByZXR1cm4gYCR7bmV3IERhdGUoKS5nZXRUaW1lKCl9LSR7U3RyaW5nKE1hdGgucmFuZG9tKCkpLnN1YnN0cmluZygyKX1gO1xufVxuXG5leHBvcnQgY2xhc3MgTG9ja01hbmFnZXIge1xuICBwcml2YXRlIF9kZWZhdWx0T3B0aW9uczogTG9ja09wdGlvbnM7XG4gIHByaXZhdGUgX2NsaWVudElkOiBzdHJpbmc7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fZGVmYXVsdE9wdGlvbnMgPSB7XG4gICAgICBtb2RlOiBMT0NLX01PREUuRVhDTFVTSVZFLFxuICAgICAgaWZBdmFpbGFibGU6IGZhbHNlLFxuICAgICAgc3RlYWw6IGZhbHNlLFxuICAgIH07XG4gICAgdGhpcy5fY2xpZW50SWQgPSBgJHtMSUJfUFJFRklYfS1jbGllbnRJZC0ke2dlbmVyYXRlUmFuZG9tSWQoKX1gO1xuICAgIHRoaXMuX2luaXQoKTtcbiAgfVxuXG4gIHByaXZhdGUgX2luaXQoKSB7XG4gICAgdGhpcy5fc3RvcmVUaGlzQ2xpZW50SWQoKTtcbiAgICBjb25zdCBoZWFydEJlYXQgPSBuZXcgSGVhcnRCZWF0KHsga2V5OiB0aGlzLl9jbGllbnRJZCB9KTtcbiAgICBoZWFydEJlYXQuc3RhcnQoKTtcbiAgICAvLyBoYW5kbGUgd2hlbiB1bmxvYWQgY291bGQndCB3b3JrIG9yIHRoZSBjbGllbnQgY3Jhc2gsIHRoZW4gY2xlYW5cbiAgICBoZWFydEJlYXQuZGV0ZWN0KCgpID0+IHRoaXMuX2NsZWFuVW5saXZlQ2xpZW50TG9ja3MoKSk7XG4gICAgdGhpcy5fb25VbmxvYWQoKTtcbiAgfVxuXG4gIHByaXZhdGUgX2dldENsaWVudElkcygpOiBzdHJpbmdbXSB7XG4gICAgY29uc3QgY2xpZW50SWRzID0gZ2V0U3RvcmFnZUl0ZW0oU1RPUkFHRV9LRVlTLkNMSUVOVF9JRFMpO1xuICAgIHJldHVybiAoY2xpZW50SWRzICYmIEpTT04ucGFyc2UoY2xpZW50SWRzKSkgfHwgW107XG4gIH1cblxuICBwcml2YXRlIF9zdG9yZUNsaWVudElkcyhjbGllbnRJZHM6IHN0cmluZ1tdKSB7XG4gICAgc2V0U3RvcmFnZUl0ZW0oU1RPUkFHRV9LRVlTLkNMSUVOVF9JRFMsIEpTT04uc3RyaW5naWZ5KGNsaWVudElkcykpO1xuICB9XG5cbiAgcHJpdmF0ZSBfc3RvcmVUaGlzQ2xpZW50SWQoKSB7XG4gICAgY29uc3QgcHJldkNsaWVudElkcyA9IHRoaXMuX2dldENsaWVudElkcygpO1xuICAgIGlmICghcHJldkNsaWVudElkcy5pbmNsdWRlcyh0aGlzLl9jbGllbnRJZCkpIHtcbiAgICAgIGNvbnN0IGN1ckNsaWVudElkcyA9IFsuLi5wcmV2Q2xpZW50SWRzLCB0aGlzLl9jbGllbnRJZF07XG4gICAgICB0aGlzLl9zdG9yZUNsaWVudElkcyhjdXJDbGllbnRJZHMpO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBhc3luYyByZXF1ZXN0KC4uLmFyZ3M6IFJlcXVlc3RBcmdzQ2FzZTEpOiBQcm9taXNlPGFueT47XG4gIHB1YmxpYyBhc3luYyByZXF1ZXN0KC4uLmFyZ3M6IFJlcXVlc3RBcmdzQ2FzZTIpOiBQcm9taXNlPGFueT47XG4gIHB1YmxpYyBhc3luYyByZXF1ZXN0KC4uLmFyZ3M6IFJlcXVlc3RBcmdzQ2FzZTMpIHtcbiAgICBjb25zdCBzZWxmID0gdGhpcztcbiAgICByZXR1cm4gbmV3IFByb21pc2UoYXN5bmMgZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgY29uc3QgcmVzID0gc2VsZi5faGFuZGxlUmVxdWVzdEFyZ3MoYXJncywgcmVqZWN0KTtcbiAgICAgIGlmICghcmVzKSByZXR1cm47XG4gICAgICBjb25zdCB7IGNiLCBfb3B0aW9ucyB9ID0gcmVzO1xuXG4gICAgICBjb25zdCBuYW1lID0gYXJnc1swXTtcbiAgICAgIGNvbnN0IHJlcXVlc3Q6IFJlcXVlc3QgPSB7XG4gICAgICAgIG5hbWUsXG4gICAgICAgIG1vZGU6IF9vcHRpb25zLm1vZGUsXG4gICAgICAgIGNsaWVudElkOiBzZWxmLl9jbGllbnRJZCxcbiAgICAgICAgdXVpZDogYCR7bmFtZX0tJHtnZW5lcmF0ZVJhbmRvbUlkKCl9YCxcbiAgICAgICAgcmVzb2x2ZSxcbiAgICAgICAgcmVqZWN0LFxuICAgICAgfTtcblxuICAgICAgY29uc3QgcmVzb2x2ZVdpdGhDQiA9IHNlbGYuX3Jlc29sdmVXaXRoQ0IoY2IsIHJlc29sdmUsIHJlamVjdCk7XG5cbiAgICAgIGxldCBoZWxkTG9ja1NldCA9IHNlbGYuX2hlbGRMb2NrU2V0KCk7XG4gICAgICBsZXQgaGVsZExvY2sgPSBoZWxkTG9ja1NldC5maW5kKChlKSA9PiB7XG4gICAgICAgIHJldHVybiBlLm5hbWUgPT09IHJlcXVlc3QubmFtZTtcbiAgICAgIH0pO1xuICAgICAgY29uc3QgcmVxdWVzdExvY2tRdWV1ZSA9IHNlbGYuX3JlcXVlc3RMb2NrUXVldWVNYXAoKVtyZXF1ZXN0Lm5hbWVdIHx8IFtdO1xuXG4gICAgICAvLyBoYW5kbGUgcmVxdWVzdCBvcHRpb25zXG4gICAgICBpZiAoX29wdGlvbnMuc3RlYWwgPT09IHRydWUpIHtcbiAgICAgICAgaWYgKCFzZWxmLl9oYW5kbGVFeGNlcHRpb25XaGVuU3RlYWxJc1RydWUoX29wdGlvbnMsIHJlamVjdCkpIHJldHVybjtcbiAgICAgICAgLy8gb25lIGhlbGQgbG9jayBvciBtdWx0aXBsZSBzaGFyZWQgbG9ja3Mgb2YgdGhpcyBzb3VyY2Ugc2hvdWxkIGJlIHJlbW92ZVxuICAgICAgICBoZWxkTG9ja1NldCA9IGhlbGRMb2NrU2V0LmZpbHRlcigoZSkgPT4gZS5uYW1lICE9PSByZXF1ZXN0Lm5hbWUpO1xuICAgICAgICBoZWxkTG9jayA9IGhlbGRMb2NrU2V0LmZpbmQoKGUpID0+IHtcbiAgICAgICAgICByZXR1cm4gZS5uYW1lID09PSByZXF1ZXN0Lm5hbWU7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIGlmIChfb3B0aW9ucy5pZkF2YWlsYWJsZSA9PT0gdHJ1ZSkge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgKGhlbGRMb2NrICYmXG4gICAgICAgICAgICAhKFxuICAgICAgICAgICAgICBoZWxkTG9jay5tb2RlID09PSBMT0NLX01PREUuU0hBUkVEICYmXG4gICAgICAgICAgICAgIHJlcXVlc3QubW9kZSA9PT0gTE9DS19NT0RFLlNIQVJFRFxuICAgICAgICAgICAgKSkgfHxcbiAgICAgICAgICByZXF1ZXN0TG9ja1F1ZXVlLmxlbmd0aFxuICAgICAgICApIHtcbiAgICAgICAgICByZXR1cm4gcmVzb2x2ZVdpdGhDQihudWxsKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gc2VsZi5faGFuZGxlTmV3SGVsZExvY2socmVxdWVzdCwgcmVzb2x2ZVdpdGhDQik7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoX29wdGlvbnMuc2lnbmFsICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgaWYgKCFzZWxmLl9oYW5kbGVTaWduYWxFeGlzdGVkKF9vcHRpb25zLCByZWplY3QsIHJlcXVlc3QpKSByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHNlbGYuX2hhbmRsZUhlbGRMb2NrQW5kUmVxdWVzdChcbiAgICAgICAgaGVsZExvY2ssXG4gICAgICAgIHJlcXVlc3QsXG4gICAgICAgIHJlc29sdmVXaXRoQ0IsXG4gICAgICAgIHJlcXVlc3RMb2NrUXVldWUsXG4gICAgICAgIGhlbGRMb2NrU2V0XG4gICAgICApO1xuICAgIH0pO1xuICB9XG5cbiAgLy8gYWRkIGFzeW5jIGZvciBhbGlnbiB3aXRoIG5hdGl2ZSBhcGkgYW5kIHR5cGVcbiAgcHVibGljIGFzeW5jIHF1ZXJ5KCkge1xuICAgIHJldHVybiB0aGlzLl9xdWVyeSgpO1xuICB9XG5cbiAgcHJpdmF0ZSBfcHVzaFRvTG9ja1JlcXVlc3RRdWV1ZU1hcChyZXF1ZXN0OiBSZXF1ZXN0KSB7XG4gICAgY29uc3QgcmVxdWVzdFF1ZXVlTWFwID0gdGhpcy5fcmVxdWVzdExvY2tRdWV1ZU1hcCgpO1xuICAgIGNvbnN0IHJlcXVlc3RRdWV1ZSA9IHJlcXVlc3RRdWV1ZU1hcFtyZXF1ZXN0Lm5hbWVdIHx8IFtdO1xuICAgIHJlcXVlc3RRdWV1ZU1hcFtyZXF1ZXN0Lm5hbWVdID0gWy4uLnJlcXVlc3RRdWV1ZSwgcmVxdWVzdF07XG5cbiAgICB0aGlzLl9zdG9yZVJlcXVlc3RMb2NrUXVldWVNYXAocmVxdWVzdFF1ZXVlTWFwKTtcbiAgICByZXR1cm4gcmVxdWVzdDtcbiAgfVxuXG4gIHByaXZhdGUgX3B1c2hUb0hlbGRMb2NrU2V0KFxuICAgIHJlcXVlc3Q6IFJlcXVlc3QsXG4gICAgY3VycmVudEhlbGRMb2NrU2V0ID0gdGhpcy5faGVsZExvY2tTZXQoKVxuICApIHtcbiAgICBjb25zdCBoZWxkTG9ja1NldCA9IFsuLi5jdXJyZW50SGVsZExvY2tTZXQsIHJlcXVlc3RdO1xuICAgIHRoaXMuX3N0b3JlSGVsZExvY2tTZXQoaGVsZExvY2tTZXQpO1xuICAgIHJldHVybiByZXF1ZXN0O1xuICB9XG5cbiAgcHJpdmF0ZSBfcmVxdWVzdExvY2tRdWV1ZU1hcCgpOiBSZXF1ZXN0UXVldWVNYXAge1xuICAgIGNvbnN0IHJlcXVlc3RRdWV1ZU1hcCA9IGdldFN0b3JhZ2VJdGVtKFNUT1JBR0VfS0VZUy5SRVFVRVNUX1FVRVVFX01BUCk7XG4gICAgcmV0dXJuIChyZXF1ZXN0UXVldWVNYXAgJiYgSlNPTi5wYXJzZShyZXF1ZXN0UXVldWVNYXApKSB8fCB7fTtcbiAgfVxuXG4gIHByaXZhdGUgX2hlbGRMb2NrU2V0KCk6IExvY2tzSW5mbyB7XG4gICAgY29uc3QgaGVsZExvY2tTZXQgPSBnZXRTdG9yYWdlSXRlbShTVE9SQUdFX0tFWVMuSEVMRF9MT0NLX1NFVCk7XG4gICAgcmV0dXJuIChoZWxkTG9ja1NldCAmJiBKU09OLnBhcnNlKGhlbGRMb2NrU2V0KSkgfHwgW107XG4gIH1cblxuICAvLyBkZWxldGUgb2xkIGhlbGQgbG9jayBhbmQgYWRkIG1vdmUgZmlyc3QgcmVxdWVzdCBMb2NrIHRvIGhlbGQgbG9jayBzZXRcbiAgcHJpdmF0ZSBfdXBkYXRlSGVsZEFuZFJlcXVlc3RMb2NrcyhyZXF1ZXN0OiBSZXF1ZXN0KSB7XG4gICAgbGV0IGhlbGRMb2NrU2V0ID0gdGhpcy5faGVsZExvY2tTZXQoKTtcbiAgICBjb25zdCBoZWxkTG9ja0luZGV4ID0gaGVsZExvY2tTZXQuZmluZEluZGV4KFxuICAgICAgKGxvY2spID0+IGxvY2sudXVpZCA9PT0gcmVxdWVzdC51dWlkXG4gICAgKTtcbiAgICBpZiAoaGVsZExvY2tJbmRleCAhPT0gLTEpIHtcbiAgICAgIGhlbGRMb2NrU2V0LnNwbGljZShoZWxkTG9ja0luZGV4LCAxKTtcbiAgICAgIGNvbnN0IHJlcXVlc3RMb2NrUXVldWVNYXAgPSB0aGlzLl9yZXF1ZXN0TG9ja1F1ZXVlTWFwKCk7XG4gICAgICBjb25zdCByZXF1ZXN0TG9ja1F1ZXVlID0gcmVxdWVzdExvY2tRdWV1ZU1hcFtyZXF1ZXN0Lm5hbWVdIHx8IFtdO1xuICAgICAgY29uc3QgW2ZpcnN0UmVxdWVzdExvY2ssIC4uLnJlc3RSZXF1ZXN0TG9ja3NdID0gcmVxdWVzdExvY2tRdWV1ZTtcbiAgICAgIGlmIChmaXJzdFJlcXVlc3RMb2NrKSB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICBmaXJzdFJlcXVlc3RMb2NrLm1vZGUgPT09IExPQ0tfTU9ERS5FWENMVVNJVkUgfHxcbiAgICAgICAgICByZXN0UmVxdWVzdExvY2tzLmxlbmd0aCA9PT0gMFxuICAgICAgICApIHtcbiAgICAgICAgICBoZWxkTG9ja1NldC5wdXNoKGZpcnN0UmVxdWVzdExvY2spO1xuICAgICAgICAgIHJlcXVlc3RMb2NrUXVldWVNYXBbcmVxdWVzdC5uYW1lXSA9IHJlc3RSZXF1ZXN0TG9ja3M7XG4gICAgICAgIH0gZWxzZSBpZiAoZmlyc3RSZXF1ZXN0TG9jay5tb2RlID09PSBMT0NLX01PREUuU0hBUkVEKSB7XG4gICAgICAgICAgbGV0IG5vblNoYXJlZExvY2tJbmRleCA9IHJlcXVlc3RMb2NrUXVldWUuZmluZEluZGV4KFxuICAgICAgICAgICAgKGxvY2spID0+IGxvY2subW9kZSAhPT0gTE9DS19NT0RFLlNIQVJFRFxuICAgICAgICAgICk7XG4gICAgICAgICAgaWYgKG5vblNoYXJlZExvY2tJbmRleCA9PT0gLTEpXG4gICAgICAgICAgICBub25TaGFyZWRMb2NrSW5kZXggPSByZXF1ZXN0TG9ja1F1ZXVlLmxlbmd0aDtcbiAgICAgICAgICBoZWxkTG9ja1NldCA9IFtcbiAgICAgICAgICAgIC4uLmhlbGRMb2NrU2V0LFxuICAgICAgICAgICAgLi4ucmVxdWVzdExvY2tRdWV1ZS5zcGxpY2UoMCwgbm9uU2hhcmVkTG9ja0luZGV4KSxcbiAgICAgICAgICBdO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fc3RvcmVIZWxkTG9ja1NldEFuZFJlcXVlc3RMb2NrUXVldWVNYXAoXG4gICAgICAgICAgaGVsZExvY2tTZXQsXG4gICAgICAgICAgcmVxdWVzdExvY2tRdWV1ZU1hcFxuICAgICAgICApO1xuXG4gICAgICAgIHJldHVybiBmaXJzdFJlcXVlc3RMb2NrO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fc3RvcmVIZWxkTG9ja1NldChoZWxkTG9ja1NldCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICBgdGhpcyBoZWxkIGxvY2sgd2hpY2ggdXVpZCBpcyAke3JlcXVlc3QudXVpZH0gaGFkIGJlZW4gc3RlYWxgXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2hhbmRsZVNpZ25hbEV4aXN0ZWQoXG4gICAgX29wdGlvbnM6IExvY2tPcHRpb25zLFxuICAgIHJlamVjdDogKHJlYXNvbj86IGFueSkgPT4gdm9pZCxcbiAgICByZXF1ZXN0OiBSZXF1ZXN0XG4gICkge1xuICAgIGlmICghKF9vcHRpb25zLnNpZ25hbCBpbnN0YW5jZW9mIEFib3J0U2lnbmFsKSkge1xuICAgICAgcmVqZWN0KFxuICAgICAgICBuZXcgVHlwZUVycm9yKFxuICAgICAgICAgIFwiRmFpbGVkIHRvIGV4ZWN1dGUgJ3JlcXVlc3QnIG9uICdMb2NrTWFuYWdlcic6IG1lbWJlciBzaWduYWwgaXMgbm90IG9mIHR5cGUgQWJvcnRTaWduYWwuXCJcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IGVsc2UgaWYgKF9vcHRpb25zLnNpZ25hbC5hYm9ydGVkKSB7XG4gICAgICByZWplY3QoXG4gICAgICAgIG5ldyBET01FeGNlcHRpb24oXG4gICAgICAgICAgXCJGYWlsZWQgdG8gZXhlY3V0ZSAncmVxdWVzdCcgb24gJ0xvY2tNYW5hZ2VyJzogVGhlIHJlcXVlc3Qgd2FzIGFib3J0ZWQuXCJcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fc2lnbmFsT25hYm9ydChfb3B0aW9ucy5zaWduYWwsIHJlcXVlc3QpO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHByaXZhdGUgX2hhbmRsZUV4Y2VwdGlvbldoZW5TdGVhbElzVHJ1ZShcbiAgICBfb3B0aW9uczogTG9ja09wdGlvbnMsXG4gICAgcmVqZWN0OiAocmVhc29uPzogYW55KSA9PiB2b2lkXG4gICkge1xuICAgIGlmIChfb3B0aW9ucy5tb2RlICE9PSBMT0NLX01PREUuRVhDTFVTSVZFKSB7XG4gICAgICByZWplY3QoXG4gICAgICAgIG5ldyBET01FeGNlcHRpb24oXG4gICAgICAgICAgXCJGYWlsZWQgdG8gZXhlY3V0ZSAncmVxdWVzdCcgb24gJ0xvY2tNYW5hZ2VyJzogVGhlICdzdGVhbCcgb3B0aW9uIG1heSBvbmx5IGJlIHVzZWQgd2l0aCAnZXhjbHVzaXZlJyBsb2Nrcy5cIlxuICAgICAgICApXG4gICAgICApO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBpZiAoX29wdGlvbnMuaWZBdmFpbGFibGUgPT09IHRydWUpIHtcbiAgICAgIHJlamVjdChcbiAgICAgICAgbmV3IERPTUV4Y2VwdGlvbihcbiAgICAgICAgICBcIkZhaWxlZCB0byBleGVjdXRlICdyZXF1ZXN0JyBvbiAnTG9ja01hbmFnZXInOiBUaGUgJ3N0ZWFsJyBhbmQgJ2lmQXZhaWxhYmxlJyBvcHRpb25zIGNhbm5vdCBiZSB1c2VkIHRvZ2V0aGVyLlwiXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcHJpdmF0ZSBfaGFuZGxlUmVxdWVzdEFyZ3MoXG4gICAgYXJnczogUmVxdWVzdEFyZ3NDYXNlMSB8IFJlcXVlc3RBcmdzQ2FzZTIgfCBSZXF1ZXN0QXJnc0Nhc2UzLFxuICAgIHJlamVjdDogKHJlYXNvbj86IGFueSkgPT4gdm9pZFxuICApIHtcbiAgICBjb25zdCBhcmdzTGVuZ3RoID0gYXJncy5sZW5ndGg7XG4gICAgbGV0IGNiOiBMb2NrR3JhbnRlZENhbGxiYWNrO1xuICAgIGxldCBfb3B0aW9uczogTG9ja09wdGlvbnM7XG4gICAgLy8gaGFuZGxlIGFyZ3MgaW4gZGlmZmVyZW50IGNhc2VcbiAgICBpZiAoYXJnc0xlbmd0aCA8IDIpIHtcbiAgICAgIHJlamVjdChcbiAgICAgICAgbmV3IFR5cGVFcnJvcihcbiAgICAgICAgICBgRmFpbGVkIHRvIGV4ZWN1dGUgJ3JlcXVlc3QnIG9uICdMb2NrTWFuYWdlcic6IDIgYXJndW1lbnRzIHJlcXVpcmVkLCBidXQgb25seSAke2FyZ3MubGVuZ3RofSBwcmVzZW50LmBcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0gZWxzZSBpZiAoYXJnc0xlbmd0aCA9PT0gMikge1xuICAgICAgaWYgKHR5cGVvZiBhcmdzWzFdICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgcmVqZWN0KFxuICAgICAgICAgIG5ldyBUeXBlRXJyb3IoXG4gICAgICAgICAgICBcIkZhaWxlZCB0byBleGVjdXRlICdyZXF1ZXN0JyBvbiAnTG9ja01hbmFnZXInOiBwYXJhbWV0ZXIgMiBpcyBub3Qgb2YgdHlwZSAnRnVuY3Rpb24nLlwiXG4gICAgICAgICAgKVxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNiID0gYXJnc1sxXTtcbiAgICAgICAgX29wdGlvbnMgPSB0aGlzLl9kZWZhdWx0T3B0aW9ucztcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHR5cGVvZiBhcmdzWzJdICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgcmVqZWN0KFxuICAgICAgICAgIG5ldyBUeXBlRXJyb3IoXG4gICAgICAgICAgICBcIkZhaWxlZCB0byBleGVjdXRlICdyZXF1ZXN0JyBvbiAnTG9ja01hbmFnZXInOiBwYXJhbWV0ZXIgMyBpcyBub3Qgb2YgdHlwZSAnRnVuY3Rpb24nLlwiXG4gICAgICAgICAgKVxuICAgICAgICApO1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNiID0gYXJnc1syXTtcbiAgICAgICAgX29wdGlvbnMgPSB7IC4uLnRoaXMuX2RlZmF1bHRPcHRpb25zLCAuLi5hcmdzWzFdIH07XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChPYmplY3QudmFsdWVzKExPQ0tfTU9ERSkuaW5kZXhPZihfb3B0aW9ucy5tb2RlKSA8IDApIHtcbiAgICAgIHJlamVjdChcbiAgICAgICAgbmV3IFR5cGVFcnJvcihcbiAgICAgICAgICBgRmFpbGVkIHRvIGV4ZWN1dGUgJ3JlcXVlc3QnIG9uICdMb2NrTWFuYWdlcic6IFRoZSBwcm92aWRlZCB2YWx1ZSAnJHtfb3B0aW9ucy5tb2RlfScgaXMgbm90IGEgdmFsaWQgZW51bSB2YWx1ZSBvZiB0eXBlIExvY2tNb2RlLmBcbiAgICAgICAgKVxuICAgICAgKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIC8vIGhhbmRsZSBzb3VyY2UgbmFtZVxuICAgIGlmIChhcmdzWzBdWzBdID09PSBcIi1cIikge1xuICAgICAgcmVqZWN0KFxuICAgICAgICBuZXcgRE9NRXhjZXB0aW9uKFxuICAgICAgICAgIFwiRmFpbGVkIHRvIGV4ZWN1dGUgJ3JlcXVlc3QnIG9uICdMb2NrTWFuYWdlcic6IE5hbWVzIGNhbm5vdCBzdGFydCB3aXRoICctJy5cIlxuICAgICAgICApXG4gICAgICApO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiB7IGNiLCBfb3B0aW9ucyB9O1xuICB9XG5cbiAgcHJpdmF0ZSBfaGFuZGxlSGVsZExvY2tBbmRSZXF1ZXN0KFxuICAgIGhlbGRMb2NrOiBMb2NrSW5mbyB8IHVuZGVmaW5lZCxcbiAgICByZXF1ZXN0OiBSZXF1ZXN0LFxuICAgIHJlc29sdmVXaXRoQ0I6IChhcmdzOiBMb2NrIHwgbnVsbCkgPT4gUHJvbWlzZTx1bmtub3duPixcbiAgICByZXF1ZXN0TG9ja1F1ZXVlOiBMb2Nrc0luZm8sXG4gICAgaGVsZExvY2tTZXQ6IExvY2tzSW5mb1xuICApIHtcbiAgICBpZiAoaGVsZExvY2spIHtcbiAgICAgIGlmIChoZWxkTG9jay5tb2RlID09PSBMT0NLX01PREUuRVhDTFVTSVZFKSB7XG4gICAgICAgIHRoaXMuX2hhbmRsZU5ld0xvY2tSZXF1ZXN0KHJlcXVlc3QsIHJlc29sdmVXaXRoQ0IpO1xuICAgICAgfSBlbHNlIGlmIChoZWxkTG9jay5tb2RlID09PSBMT0NLX01PREUuU0hBUkVEKSB7XG4gICAgICAgIC8vIGlmIHRoaXMgcmVxdWVzdCBsb2NrIGlzIHNoYXJlZCBsb2NrIGFuZCBpcyBmaXJzdCByZXF1ZXN0IGxvY2sgb2YgdGhpcyBxdWV1ZSwgdGhlbiBwdXNoIGhlbGQgbG9ja3Mgc2V0XG4gICAgICAgIGlmIChcbiAgICAgICAgICByZXF1ZXN0Lm1vZGUgPT09IExPQ0tfTU9ERS5TSEFSRUQgJiZcbiAgICAgICAgICByZXF1ZXN0TG9ja1F1ZXVlLmxlbmd0aCA9PT0gMFxuICAgICAgICApIHtcbiAgICAgICAgICB0aGlzLl9oYW5kbGVOZXdIZWxkTG9jayhyZXF1ZXN0LCByZXNvbHZlV2l0aENCLCBoZWxkTG9ja1NldCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5faGFuZGxlTmV3TG9ja1JlcXVlc3QocmVxdWVzdCwgcmVzb2x2ZVdpdGhDQik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5faGFuZGxlTmV3SGVsZExvY2socmVxdWVzdCwgcmVzb2x2ZVdpdGhDQiwgaGVsZExvY2tTZXQpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3NpZ25hbE9uYWJvcnQoc2lnbmFsOiBBYm9ydFNpZ25hbCwgeyBuYW1lLCB1dWlkIH06IFJlcXVlc3QpIHtcbiAgICBzaWduYWwub25hYm9ydCA9ICgpID0+IHtcbiAgICAgIC8vIGNsZWFuIHRoZSBsb2NrIHJlcXVlc3Qgd2hlbiBpdCBpcyBhYm9ydGVkXG4gICAgICBjb25zdCBfcmVxdWVzdExvY2tRdWV1ZU1hcCA9IHRoaXMuX3JlcXVlc3RMb2NrUXVldWVNYXAoKTtcbiAgICAgIGNvbnN0IHJlcXVlc3RMb2NrSW5kZXggPSBfcmVxdWVzdExvY2tRdWV1ZU1hcFtuYW1lXS5maW5kSW5kZXgoXG4gICAgICAgIChsb2NrKSA9PiBsb2NrLnV1aWQgPT09IHV1aWRcbiAgICAgICk7XG4gICAgICBpZiAocmVxdWVzdExvY2tJbmRleCAhPT0gLTEpIHtcbiAgICAgICAgX3JlcXVlc3RMb2NrUXVldWVNYXBbbmFtZV0uc3BsaWNlKHJlcXVlc3RMb2NrSW5kZXgsIDEpO1xuICAgICAgICB0aGlzLl9zdG9yZVJlcXVlc3RMb2NrUXVldWVNYXAoX3JlcXVlc3RMb2NrUXVldWVNYXApO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvLyBsZXQgY2IgZXhlY3V0ZWQgaW4gTWljcm8gdGFza1xuICBwcml2YXRlIF9yZXNvbHZlV2l0aENCKFxuICAgIGNiOiBMb2NrR3JhbnRlZENhbGxiYWNrLFxuICAgIHJlc29sdmU6ICh2YWx1ZT86IHVua25vd24pID0+IHZvaWQsXG4gICAgcmVqZWN0OiAocmVhc29uPzogYW55KSA9PiB2b2lkXG4gICkge1xuICAgIHJldHVybiAoYXJnczogTG9jayB8IG51bGwpID0+IHtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgoX3Jlc29sdmUpID0+IHtcbiAgICAgICAgbmV3IFByb21pc2UoKHJlcykgPT4gcmVzKFwiXCIpKS50aGVuKGFzeW5jICgpID0+IHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgcmVzID0gYXdhaXQgY2IoYXJncyk7XG4gICAgICAgICAgICBfcmVzb2x2ZShyZXMpO1xuICAgICAgICAgICAgcmVzb2x2ZShyZXMpO1xuICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBfcmVzb2x2ZShlcnJvcik7XG4gICAgICAgICAgICByZWplY3QoZXJyb3IpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBfaGFuZGxlTmV3SGVsZExvY2soXG4gICAgcmVxdWVzdDogUmVxdWVzdCxcbiAgICByZXNvbHZlV2l0aENCOiAoYXJnczogTG9jayB8IG51bGwpID0+IFByb21pc2U8dW5rbm93bj4sXG4gICAgY3VycmVudEhlbGRMb2NrU2V0PzogTG9ja3NJbmZvXG4gICkge1xuICAgIHRoaXMuX3B1c2hUb0hlbGRMb2NrU2V0KHJlcXVlc3QsIGN1cnJlbnRIZWxkTG9ja1NldCk7XG5cbiAgICAvLyBjaGVjayBhbmQgaGFuZGxlIGlmIHRoaXMgaGVsZCBsb2NrIGhhcyBiZWVuIHN0ZWFsXG4gICAgbGV0IGNhbGxCYWNrUmVzb2x2ZWQgPSBmYWxzZTtcbiAgICBsZXQgcmVqZWN0ZWRGb3JTdGVhbCA9IGZhbHNlO1xuICAgIGNvbnN0IGxpc3RlbmVyID0gKCkgPT4ge1xuICAgICAgaWYgKFxuICAgICAgICAhY2FsbEJhY2tSZXNvbHZlZCAmJlxuICAgICAgICAhcmVqZWN0ZWRGb3JTdGVhbCAmJlxuICAgICAgICAhdGhpcy5faXNJbkhlbGRMb2NrU2V0KHJlcXVlc3QudXVpZClcbiAgICAgICkge1xuICAgICAgICB0aGlzLl9oYW5kbGVIZWxkTG9ja0JlU3RlYWwocmVxdWVzdCk7XG4gICAgICAgIHJlamVjdGVkRm9yU3RlYWwgPSB0cnVlO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuICAgIG9uU3RvcmFnZUNoYW5nZShTVE9SQUdFX0tFWVMuSEVMRF9MT0NLX1NFVCwgbGlzdGVuZXIpO1xuXG4gICAgcmVzb2x2ZVdpdGhDQih7IG5hbWU6IHJlcXVlc3QubmFtZSwgbW9kZTogcmVxdWVzdC5tb2RlIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgY2FsbEJhY2tSZXNvbHZlZCA9IHRydWU7XG4gICAgICB0aGlzLl91cGRhdGVIZWxkQW5kUmVxdWVzdExvY2tzKHJlcXVlc3QpO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBfaGFuZGxlSGVsZExvY2tCZVN0ZWFsKHJlcXVlc3Q6IFJlcXVlc3QpIHtcbiAgICByZXF1ZXN0LnJlamVjdChcbiAgICAgIG5ldyBET01FeGNlcHRpb24oXG4gICAgICAgIFwiTG9jayBicm9rZW4gYnkgYW5vdGhlciByZXF1ZXN0IHdpdGggdGhlICdzdGVhbCcgb3B0aW9uLlwiXG4gICAgICApXG4gICAgKTtcbiAgfVxuXG4gIHByaXZhdGUgX3N0b3JlSGVsZExvY2tTZXQoaGVsZExvY2tTZXQ6IExvY2tzSW5mbykge1xuICAgIHNldFN0b3JhZ2VJdGVtKFNUT1JBR0VfS0VZUy5IRUxEX0xPQ0tfU0VULCBKU09OLnN0cmluZ2lmeShoZWxkTG9ja1NldCkpO1xuICB9XG5cbiAgcHJpdmF0ZSBfc3RvcmVSZXF1ZXN0TG9ja1F1ZXVlTWFwKHJlcXVlc3RMb2NrUXVldWVNYXA6IFJlcXVlc3RRdWV1ZU1hcCkge1xuICAgIHNldFN0b3JhZ2VJdGVtKFxuICAgICAgU1RPUkFHRV9LRVlTLlJFUVVFU1RfUVVFVUVfTUFQLFxuICAgICAgSlNPTi5zdHJpbmdpZnkocmVxdWVzdExvY2tRdWV1ZU1hcClcbiAgICApO1xuICB9XG5cbiAgcHJpdmF0ZSBfaXNJbkhlbGRMb2NrU2V0KHV1aWQ6IHN0cmluZykge1xuICAgIHJldHVybiB0aGlzLl9oZWxkTG9ja1NldCgpLnNvbWUoKGUpID0+IGUudXVpZCA9PT0gdXVpZCk7XG4gIH1cblxuICBwcml2YXRlIF9oYW5kbGVOZXdMb2NrUmVxdWVzdChcbiAgICByZXF1ZXN0OiBSZXF1ZXN0LFxuICAgIHJlc29sdmVXaXRoQ0I6IChhcmdzOiBMb2NrIHwgbnVsbCkgPT4gUHJvbWlzZTx1bmtub3duPlxuICApIHtcbiAgICB0aGlzLl9wdXNoVG9Mb2NrUmVxdWVzdFF1ZXVlTWFwKHJlcXVlc3QpO1xuICAgIGxldCBoZWxkTG9ja1dJUCA9IGZhbHNlO1xuICAgIGNvbnN0IGxpc3RlbmVyID0gYXN5bmMgKCkgPT4ge1xuICAgICAgaWYgKCFoZWxkTG9ja1dJUCAmJiB0aGlzLl9pc0luSGVsZExvY2tTZXQocmVxdWVzdC51dWlkKSkge1xuICAgICAgICBoZWxkTG9ja1dJUCA9IHRydWU7XG4gICAgICAgIGF3YWl0IHJlc29sdmVXaXRoQ0IoeyBuYW1lOiByZXF1ZXN0Lm5hbWUsIG1vZGU6IHJlcXVlc3QubW9kZSB9KTtcbiAgICAgICAgLy8gY2hlY2sgYW5kIGhhbmRsZSBpZiB0aGlzIGhlbGQgbG9jayBoYXMgYmVlbiBzdGVhbFxuICAgICAgICBpZiAoIXRoaXMuX2lzSW5IZWxkTG9ja1NldChyZXF1ZXN0LnV1aWQpKSB7XG4gICAgICAgICAgdGhpcy5faGFuZGxlSGVsZExvY2tCZVN0ZWFsKHJlcXVlc3QpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHJlcXVlc3QubW9kZSA9PT0gTE9DS19NT0RFLkVYQ0xVU0lWRSkge1xuICAgICAgICAgIHRoaXMuX3VwZGF0ZUhlbGRBbmRSZXF1ZXN0TG9ja3MocmVxdWVzdCk7XG4gICAgICAgIH0gZWxzZSBpZiAocmVxdWVzdC5tb2RlID09PSBMT0NLX01PREUuU0hBUkVEKSB7XG4gICAgICAgICAgYXdhaXQgdGhpcy5faGFuZGxlU2hhcmVkTG9ja0Zyb21MaXN0ZW5lcihyZXF1ZXN0KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuICAgIG9uU3RvcmFnZUNoYW5nZShTVE9SQUdFX0tFWVMuSEVMRF9MT0NLX1NFVCwgbGlzdGVuZXIpO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBfaGFuZGxlU2hhcmVkTG9ja0Zyb21MaXN0ZW5lcihyZXF1ZXN0OiBSZXF1ZXN0KSB7XG4gICAgLy8gaGFuZGxlIHRoZSBpc3N1ZSB3aGVuIHRoZSBzaGFyZWQgbG9ja3MgcmVsZWFzZSBhdCB0aGUgc2FtZSB0aW1lXG4gICAgYXdhaXQgc2xlZXAoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTAwMCkpO1xuICAgIGNvbnN0IG90aGVyVW5yZWxlYXNlZFNoYXJlZEhlbGRMb2NrcyA9IHRoaXMuX2hlbGRMb2NrU2V0KCkuZmlsdGVyKFxuICAgICAgKGxvY2spID0+XG4gICAgICAgIGxvY2submFtZSA9PT0gcmVxdWVzdC5uYW1lICYmXG4gICAgICAgIGxvY2sudXVpZCAhPT0gcmVxdWVzdC51dWlkICYmXG4gICAgICAgIGxvY2subW9kZSA9PT0gTE9DS19NT0RFLlNIQVJFRFxuICAgICk7XG4gICAgaWYgKG90aGVyVW5yZWxlYXNlZFNoYXJlZEhlbGRMb2Nrcy5sZW5ndGgpIHtcbiAgICAgIHRoaXMuX3N0b3JlSGVsZExvY2tTZXQob3RoZXJVbnJlbGVhc2VkU2hhcmVkSGVsZExvY2tzKTtcbiAgICAgIC8vIHRoaXMuX2hhbmRsZVNoYXJlZExvY2tzUmVsZWFzZShyZXF1ZXN0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fdXBkYXRlSGVsZEFuZFJlcXVlc3RMb2NrcyhyZXF1ZXN0KTtcbiAgICB9XG4gIH1cblxuICAvLyBwcml2YXRlIF9oYW5kbGVTaGFyZWRMb2Nrc1JlbGVhc2UocmVxdWVzdDogUmVxdWVzdCkge1xuICAvLyAgIGxldCBsYXRlc3RIZWxkTG9ja1NldCA9IHRoaXMuX2hlbGRMb2NrU2V0KCk7XG4gIC8vICAgaWYgKCFsYXRlc3RIZWxkTG9ja1NldC5zb21lKChsb2NrKSA9PiBsb2NrLm5hbWUgPT09IHJlcXVlc3QubmFtZSkpIHtcbiAgLy8gICAgIGNvbnN0IHJlcXVlc3RMb2NrUXVldWVNYXAgPSB0aGlzLl9yZXF1ZXN0TG9ja1F1ZXVlTWFwKCk7XG4gIC8vICAgICBjb25zdCBbZmlyc3RSZXF1ZXN0TG9jaywgLi4ucmVzdFJlcXVlc3RMb2Nrc10gPVxuICAvLyAgICAgICByZXF1ZXN0TG9ja1F1ZXVlTWFwW3JlcXVlc3QubmFtZV0gfHwgW107XG4gIC8vICAgICBpZiAoZmlyc3RSZXF1ZXN0TG9jaykge1xuICAvLyAgICAgICBsYXRlc3RIZWxkTG9ja1NldC5wdXNoKGZpcnN0UmVxdWVzdExvY2spO1xuICAvLyAgICAgICByZXF1ZXN0TG9ja1F1ZXVlTWFwW3JlcXVlc3QubmFtZV0gPSByZXN0UmVxdWVzdExvY2tzO1xuICAvLyAgICAgICB0aGlzLl9zdG9yZUhlbGRMb2NrU2V0QW5kUmVxdWVzdExvY2tRdWV1ZU1hcChcbiAgLy8gICAgICAgICBsYXRlc3RIZWxkTG9ja1NldCxcbiAgLy8gICAgICAgICByZXF1ZXN0TG9ja1F1ZXVlTWFwXG4gIC8vICAgICAgICk7XG4gIC8vICAgICB9XG4gIC8vICAgfVxuICAvLyB9XG5cbiAgcHJpdmF0ZSBfc3RvcmVIZWxkTG9ja1NldEFuZFJlcXVlc3RMb2NrUXVldWVNYXAoXG4gICAgaGVsZExvY2tTZXQ6IExvY2tzSW5mbyxcbiAgICByZXF1ZXN0TG9ja1F1ZXVlTWFwOiBSZXF1ZXN0UXVldWVNYXBcbiAgKSB7XG4gICAgdGhpcy5fc3RvcmVIZWxkTG9ja1NldChoZWxkTG9ja1NldCk7XG4gICAgdGhpcy5fc3RvcmVSZXF1ZXN0TG9ja1F1ZXVlTWFwKHJlcXVlc3RMb2NrUXVldWVNYXApO1xuICB9XG5cbiAgcHJpdmF0ZSBfcXVlcnkoKSB7XG4gICAgY29uc3QgcXVlcnlSZXN1bHQ6IExvY2tNYW5hZ2VyU25hcHNob3QgPSB7XG4gICAgICBoZWxkOiB0aGlzLl9oZWxkTG9ja1NldCgpLFxuICAgICAgcGVuZGluZzogW10sXG4gICAgfTtcbiAgICBjb25zdCByZXF1ZXN0TG9ja1F1ZXVlTWFwID0gdGhpcy5fcmVxdWVzdExvY2tRdWV1ZU1hcCgpO1xuICAgIGZvciAoY29uc3QgbmFtZSBpbiByZXF1ZXN0TG9ja1F1ZXVlTWFwKSB7XG4gICAgICBjb25zdCByZXF1ZXN0TG9ja1F1ZXVlID0gcmVxdWVzdExvY2tRdWV1ZU1hcFtuYW1lXTtcbiAgICAgIHF1ZXJ5UmVzdWx0LnBlbmRpbmcgPSBxdWVyeVJlc3VsdC5wZW5kaW5nLmNvbmNhdChyZXF1ZXN0TG9ja1F1ZXVlKTtcbiAgICB9XG4gICAgcmV0dXJuIHF1ZXJ5UmVzdWx0O1xuICB9XG5cbiAgcHJpdmF0ZSBfb25VbmxvYWQoKSB7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJ1bmxvYWRcIiwgKGUpID0+IHtcbiAgICAgIHRoaXMuX2NsZWFuQ2xpZW50TG9ja3NCeUNsaWVudElkKHRoaXMuX2NsaWVudElkKTtcbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2NsZWFuQ2xpZW50TG9ja3NCeUNsaWVudElkKGNsaWVudElkOiBzdHJpbmcpIHtcbiAgICBjb25zdCByZXF1ZXN0TG9ja1F1ZXVlTWFwID0gdGhpcy5fcmVxdWVzdExvY2tRdWV1ZU1hcCgpO1xuICAgIHRoaXMuX2NsZWFuUmVxdWVzdExvY2tRdWV1ZUJ5Q2xpZW50SWQocmVxdWVzdExvY2tRdWV1ZU1hcCwgY2xpZW50SWQpO1xuXG4gICAgbGV0IG5ld0hlbGRMb2NrU2V0OiBMb2Nrc0luZm8gPSB0aGlzLl9jbGVhbkhlbGRMb2NrU2V0QnlDbGllbnRJZChcbiAgICAgIHJlcXVlc3RMb2NrUXVldWVNYXAsXG4gICAgICBjbGllbnRJZFxuICAgICk7XG5cbiAgICB0aGlzLl9zdG9yZUhlbGRMb2NrU2V0QW5kUmVxdWVzdExvY2tRdWV1ZU1hcChcbiAgICAgIG5ld0hlbGRMb2NrU2V0LFxuICAgICAgcmVxdWVzdExvY2tRdWV1ZU1hcFxuICAgICk7XG4gIH1cblxuICBwcml2YXRlIF9jbGVhbkhlbGRMb2NrU2V0QnlDbGllbnRJZChcbiAgICByZXF1ZXN0TG9ja1F1ZXVlTWFwOiBSZXF1ZXN0UXVldWVNYXAsXG4gICAgY2xpZW50SWQ6IHN0cmluZ1xuICApIHtcbiAgICBjb25zdCBoZWxkTG9ja1NldCA9IHRoaXMuX2hlbGRMb2NrU2V0KCk7XG4gICAgbGV0IG5ld0hlbGRMb2NrU2V0OiBMb2Nrc0luZm8gPSBbXTtcblxuICAgIGhlbGRMb2NrU2V0LmZvckVhY2goKGVsZW1lbnQpID0+IHtcbiAgICAgIGlmIChlbGVtZW50LmNsaWVudElkICE9PSBjbGllbnRJZCkge1xuICAgICAgICBuZXdIZWxkTG9ja1NldC5wdXNoKGVsZW1lbnQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgcmVxdWVzdExvY2tRdWV1ZSA9IHJlcXVlc3RMb2NrUXVldWVNYXBbZWxlbWVudC5uYW1lXSB8fCBbXTtcbiAgICAgICAgY29uc3QgW2ZpcnN0UmVxdWVzdExvY2ssIC4uLnJlc3RSZXF1ZXN0TG9ja3NdID0gcmVxdWVzdExvY2tRdWV1ZTtcbiAgICAgICAgaWYgKGZpcnN0UmVxdWVzdExvY2spIHtcbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICBmaXJzdFJlcXVlc3RMb2NrLm1vZGUgPT09IExPQ0tfTU9ERS5FWENMVVNJVkUgfHxcbiAgICAgICAgICAgIHJlc3RSZXF1ZXN0TG9ja3MubGVuZ3RoID09PSAwXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICBuZXdIZWxkTG9ja1NldC5wdXNoKGZpcnN0UmVxdWVzdExvY2spO1xuICAgICAgICAgICAgcmVxdWVzdExvY2tRdWV1ZU1hcFtlbGVtZW50Lm5hbWVdID0gcmVzdFJlcXVlc3RMb2NrcztcbiAgICAgICAgICB9IGVsc2UgaWYgKGZpcnN0UmVxdWVzdExvY2subW9kZSA9PT0gTE9DS19NT0RFLlNIQVJFRCkge1xuICAgICAgICAgICAgbGV0IG5vblNoYXJlZExvY2tJbmRleCA9IHJlcXVlc3RMb2NrUXVldWUuZmluZEluZGV4KFxuICAgICAgICAgICAgICAobG9jaykgPT4gbG9jay5tb2RlICE9PSBMT0NLX01PREUuU0hBUkVEXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgaWYgKG5vblNoYXJlZExvY2tJbmRleCA9PT0gLTEpXG4gICAgICAgICAgICAgIG5vblNoYXJlZExvY2tJbmRleCA9IHJlcXVlc3RMb2NrUXVldWUubGVuZ3RoO1xuICAgICAgICAgICAgbmV3SGVsZExvY2tTZXQgPSBbXG4gICAgICAgICAgICAgIC4uLm5ld0hlbGRMb2NrU2V0LFxuICAgICAgICAgICAgICAuLi5yZXF1ZXN0TG9ja1F1ZXVlLnNwbGljZSgwLCBub25TaGFyZWRMb2NrSW5kZXgpLFxuICAgICAgICAgICAgXTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gbmV3SGVsZExvY2tTZXQ7XG4gIH1cblxuICBwcml2YXRlIF9jbGVhblJlcXVlc3RMb2NrUXVldWVCeUNsaWVudElkKFxuICAgIHJlcXVlc3RMb2NrUXVldWVNYXA6IFJlcXVlc3RRdWV1ZU1hcCxcbiAgICBjbGllbnRJZDogc3RyaW5nXG4gICkge1xuICAgIGZvciAoY29uc3Qgc291cmNlTmFtZSBpbiByZXF1ZXN0TG9ja1F1ZXVlTWFwKSB7XG4gICAgICBjb25zdCByZXF1ZXN0TG9ja1F1ZXVlID0gcmVxdWVzdExvY2tRdWV1ZU1hcFtzb3VyY2VOYW1lXTtcbiAgICAgIHJlcXVlc3RMb2NrUXVldWVNYXBbc291cmNlTmFtZV0gPSByZXF1ZXN0TG9ja1F1ZXVlLmZpbHRlcihcbiAgICAgICAgKHJlcXVlc3RMb2NrKSA9PiByZXF1ZXN0TG9jay5jbGllbnRJZCAhPT0gY2xpZW50SWRcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBfY2xlYW5VbmxpdmVDbGllbnRMb2NrcygpIHtcbiAgICBjb25zdCB1bmlxdWVDbGllbnRJZHMgPSBbLi4ubmV3IFNldCh0aGlzLl9nZXRDbGllbnRJZHMoKSldO1xuICAgIGlmICghdW5pcXVlQ2xpZW50SWRzLmxlbmd0aCkge1xuICAgICAgdGhpcy5fc3RvcmVDbGllbnRJZHMoW10pO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGFsaXZlQ2xpZW50SWRzOiBzdHJpbmdbXSA9IFtdO1xuICAgIHVuaXF1ZUNsaWVudElkcy5mb3JFYWNoKChjbGllbnRJZCkgPT4ge1xuICAgICAgY29uc3QgdGltZVN0YW1wID0gZ2V0U3RvcmFnZUl0ZW0oY2xpZW50SWQpO1xuICAgICAgLy8gaWYgdW5saXZlXG4gICAgICBpZiAoIXRpbWVTdGFtcCB8fCBEYXRlLm5vdygpIC0gTnVtYmVyKHRpbWVTdGFtcCkgPiAzMTAwKSB7XG4gICAgICAgIHJlbW92ZVN0b3JhZ2VJdGVtKGNsaWVudElkKTtcbiAgICAgICAgdGhpcy5fY2xlYW5DbGllbnRMb2Nrc0J5Q2xpZW50SWQoY2xpZW50SWQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYWxpdmVDbGllbnRJZHMucHVzaChjbGllbnRJZCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgaWYgKEpTT04uc3RyaW5naWZ5KHVuaXF1ZUNsaWVudElkcykgIT09IEpTT04uc3RyaW5naWZ5KGFsaXZlQ2xpZW50SWRzKSkge1xuICAgICAgdGhpcy5fc3RvcmVDbGllbnRJZHMoYWxpdmVDbGllbnRJZHMpO1xuICAgIH1cbiAgfVxufVxuIl19