(function () {

    //! moment.js
    //! version : 2.20.1
    //! authors : Tim Wood, Iskren Chernev, Moment.js contributors
    //! license : MIT
    //! momentjs.com

    ; (function (global, factory) {
        typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
            typeof define === 'function' && define.amd ? define(factory) :
                global.moment = factory()
    }(this, (function () {
        'use strict';

        var hookCallback;

        function hooks() {
            return hookCallback.apply(null, arguments);
        }

        // This is done to register the method called with moment()
        // without creating circular dependencies.
        function setHookCallback(callback) {
            hookCallback = callback;
        }

        function isArray(input) {
            return input instanceof Array || Object.prototype.toString.call(input) === '[object Array]';
        }

        function isObject(input) {
            // IE8 will treat undefined and null as object if it wasn't for
            // input != null
            return input != null && Object.prototype.toString.call(input) === '[object Object]';
        }

        function isObjectEmpty(obj) {
            if (Object.getOwnPropertyNames) {
                return (Object.getOwnPropertyNames(obj).length === 0);
            } else {
                var k;
                for (k in obj) {
                    if (obj.hasOwnProperty(k)) {
                        return false;
                    }
                }
                return true;
            }
        }

        function isUndefined(input) {
            return input === void 0;
        }

        function isNumber(input) {
            return typeof input === 'number' || Object.prototype.toString.call(input) === '[object Number]';
        }

        function isDate(input) {
            return input instanceof Date || Object.prototype.toString.call(input) === '[object Date]';
        }

        function map(arr, fn) {
            var res = [], i;
            for (i = 0; i < arr.length; ++i) {
                res.push(fn(arr[i], i));
            }
            return res;
        }

        function hasOwnProp(a, b) {
            return Object.prototype.hasOwnProperty.call(a, b);
        }

        function extend(a, b) {
            for (var i in b) {
                if (hasOwnProp(b, i)) {
                    a[i] = b[i];
                }
            }

            if (hasOwnProp(b, 'toString')) {
                a.toString = b.toString;
            }

            if (hasOwnProp(b, 'valueOf')) {
                a.valueOf = b.valueOf;
            }

            return a;
        }

        function createUTC(input, format, locale, strict) {
            return createLocalOrUTC(input, format, locale, strict, true).utc();
        }

        function defaultParsingFlags() {
            // We need to deep clone this object.
            return {
                empty: false,
                unusedTokens: [],
                unusedInput: [],
                overflow: -2,
                charsLeftOver: 0,
                nullInput: false,
                invalidMonth: null,
                invalidFormat: false,
                userInvalidated: false,
                iso: false,
                parsedDateParts: [],
                meridiem: null,
                rfc2822: false,
                weekdayMismatch: false
            };
        }

        function getParsingFlags(m) {
            if (m._pf == null) {
                m._pf = defaultParsingFlags();
            }
            return m._pf;
        }

        var some;
        if (Array.prototype.some) {
            some = Array.prototype.some;
        } else {
            some = function (fun) {
                var t = Object(this);
                var len = t.length >>> 0;

                for (var i = 0; i < len; i++) {
                    if (i in t && fun.call(this, t[i], i, t)) {
                        return true;
                    }
                }

                return false;
            };
        }

        function isValid(m) {
            if (m._isValid == null) {
                var flags = getParsingFlags(m);
                var parsedParts = some.call(flags.parsedDateParts, function (i) {
                    return i != null;
                });
                var isNowValid = !isNaN(m._d.getTime()) &&
                    flags.overflow < 0 &&
                    !flags.empty &&
                    !flags.invalidMonth &&
                    !flags.invalidWeekday &&
                    !flags.weekdayMismatch &&
                    !flags.nullInput &&
                    !flags.invalidFormat &&
                    !flags.userInvalidated &&
                    (!flags.meridiem || (flags.meridiem && parsedParts));

                if (m._strict) {
                    isNowValid = isNowValid &&
                        flags.charsLeftOver === 0 &&
                        flags.unusedTokens.length === 0 &&
                        flags.bigHour === undefined;
                }

                if (Object.isFrozen == null || !Object.isFrozen(m)) {
                    m._isValid = isNowValid;
                }
                else {
                    return isNowValid;
                }
            }
            return m._isValid;
        }

        function createInvalid(flags) {
            var m = createUTC(NaN);
            if (flags != null) {
                extend(getParsingFlags(m), flags);
            }
            else {
                getParsingFlags(m).userInvalidated = true;
            }

            return m;
        }

        // Plugins that add properties should also add the key here (null value),
        // so we can properly clone ourselves.
        var momentProperties = hooks.momentProperties = [];

        function copyConfig(to, from) {
            var i, prop, val;

            if (!isUndefined(from._isAMomentObject)) {
                to._isAMomentObject = from._isAMomentObject;
            }
            if (!isUndefined(from._i)) {
                to._i = from._i;
            }
            if (!isUndefined(from._f)) {
                to._f = from._f;
            }
            if (!isUndefined(from._l)) {
                to._l = from._l;
            }
            if (!isUndefined(from._strict)) {
                to._strict = from._strict;
            }
            if (!isUndefined(from._tzm)) {
                to._tzm = from._tzm;
            }
            if (!isUndefined(from._isUTC)) {
                to._isUTC = from._isUTC;
            }
            if (!isUndefined(from._offset)) {
                to._offset = from._offset;
            }
            if (!isUndefined(from._pf)) {
                to._pf = getParsingFlags(from);
            }
            if (!isUndefined(from._locale)) {
                to._locale = from._locale;
            }

            if (momentProperties.length > 0) {
                for (i = 0; i < momentProperties.length; i++) {
                    prop = momentProperties[i];
                    val = from[prop];
                    if (!isUndefined(val)) {
                        to[prop] = val;
                    }
                }
            }

            return to;
        }

        var updateInProgress = false;

        // Moment prototype object
        function Moment(config) {
            copyConfig(this, config);
            this._d = new Date(config._d != null ? config._d.getTime() : NaN);
            if (!this.isValid()) {
                this._d = new Date(NaN);
            }
            // Prevent infinite loop in case updateOffset creates new moment
            // objects.
            if (updateInProgress === false) {
                updateInProgress = true;
                hooks.updateOffset(this);
                updateInProgress = false;
            }
        }

        function isMoment(obj) {
            return obj instanceof Moment || (obj != null && obj._isAMomentObject != null);
        }

        function absFloor(number) {
            if (number < 0) {
                // -0 -> 0
                return Math.ceil(number) || 0;
            } else {
                return Math.floor(number);
            }
        }

        function toInt(argumentForCoercion) {
            var coercedNumber = +argumentForCoercion,
                value = 0;

            if (coercedNumber !== 0 && isFinite(coercedNumber)) {
                value = absFloor(coercedNumber);
            }

            return value;
        }

        // compare two arrays, return the number of differences
        function compareArrays(array1, array2, dontConvert) {
            var len = Math.min(array1.length, array2.length),
                lengthDiff = Math.abs(array1.length - array2.length),
                diffs = 0,
                i;
            for (i = 0; i < len; i++) {
                if ((dontConvert && array1[i] !== array2[i]) ||
                    (!dontConvert && toInt(array1[i]) !== toInt(array2[i]))) {
                    diffs++;
                }
            }
            return diffs + lengthDiff;
        }

        function warn(msg) {
            if (hooks.suppressDeprecationWarnings === false &&
                (typeof console !== 'undefined') && console.warn) {
                console.warn('Deprecation warning: ' + msg);
            }
        }

        function deprecate(msg, fn) {
            var firstTime = true;

            return extend(function () {
                if (hooks.deprecationHandler != null) {
                    hooks.deprecationHandler(null, msg);
                }
                if (firstTime) {
                    var args = [];
                    var arg;
                    for (var i = 0; i < arguments.length; i++) {
                        arg = '';
                        if (typeof arguments[i] === 'object') {
                            arg += '\n[' + i + '] ';
                            for (var key in arguments[0]) {
                                arg += key + ': ' + arguments[0][key] + ', ';
                            }
                            arg = arg.slice(0, -2); // Remove trailing comma and space
                        } else {
                            arg = arguments[i];
                        }
                        args.push(arg);
                    }
                    warn(msg + '\nArguments: ' + Array.prototype.slice.call(args).join('') + '\n' + (new Error()).stack);
                    firstTime = false;
                }
                return fn.apply(this, arguments);
            }, fn);
        }

        var deprecations = {};

        function deprecateSimple(name, msg) {
            if (hooks.deprecationHandler != null) {
                hooks.deprecationHandler(name, msg);
            }
            if (!deprecations[name]) {
                warn(msg);
                deprecations[name] = true;
            }
        }

        hooks.suppressDeprecationWarnings = false;
        hooks.deprecationHandler = null;

        function isFunction(input) {
            return input instanceof Function || Object.prototype.toString.call(input) === '[object Function]';
        }

        function set(config) {
            var prop, i;
            for (i in config) {
                prop = config[i];
                if (isFunction(prop)) {
                    this[i] = prop;
                } else {
                    this['_' + i] = prop;
                }
            }
            this._config = config;
            // Lenient ordinal parsing accepts just a number in addition to
            // number + (possibly) stuff coming from _dayOfMonthOrdinalParse.
            // TODO: Remove "ordinalParse" fallback in next major release.
            this._dayOfMonthOrdinalParseLenient = new RegExp(
                (this._dayOfMonthOrdinalParse.source || this._ordinalParse.source) +
                '|' + (/\d{1,2}/).source);
        }

        function mergeConfigs(parentConfig, childConfig) {
            var res = extend({}, parentConfig), prop;
            for (prop in childConfig) {
                if (hasOwnProp(childConfig, prop)) {
                    if (isObject(parentConfig[prop]) && isObject(childConfig[prop])) {
                        res[prop] = {};
                        extend(res[prop], parentConfig[prop]);
                        extend(res[prop], childConfig[prop]);
                    } else if (childConfig[prop] != null) {
                        res[prop] = childConfig[prop];
                    } else {
                        delete res[prop];
                    }
                }
            }
            for (prop in parentConfig) {
                if (hasOwnProp(parentConfig, prop) &&
                    !hasOwnProp(childConfig, prop) &&
                    isObject(parentConfig[prop])) {
                    // make sure changes to properties don't modify parent config
                    res[prop] = extend({}, res[prop]);
                }
            }
            return res;
        }

        function Locale(config) {
            if (config != null) {
                this.set(config);
            }
        }

        var keys;

        if (Object.keys) {
            keys = Object.keys;
        } else {
            keys = function (obj) {
                var i, res = [];
                for (i in obj) {
                    if (hasOwnProp(obj, i)) {
                        res.push(i);
                    }
                }
                return res;
            };
        }

        var defaultCalendar = {
            sameDay: '[Today at] LT',
            nextDay: '[Tomorrow at] LT',
            nextWeek: 'dddd [at] LT',
            lastDay: '[Yesterday at] LT',
            lastWeek: '[Last] dddd [at] LT',
            sameElse: 'L'
        };

        function calendar(key, mom, now) {
            var output = this._calendar[key] || this._calendar['sameElse'];
            return isFunction(output) ? output.call(mom, now) : output;
        }

        var defaultLongDateFormat = {
            LTS: 'h:mm:ss A',
            LT: 'h:mm A',
            L: 'MM/DD/YYYY',
            LL: 'MMMM D, YYYY',
            LLL: 'MMMM D, YYYY h:mm A',
            LLLL: 'dddd, MMMM D, YYYY h:mm A'
        };

        function longDateFormat(key) {
            var format = this._longDateFormat[key],
                formatUpper = this._longDateFormat[key.toUpperCase()];

            if (format || !formatUpper) {
                return format;
            }

            this._longDateFormat[key] = formatUpper.replace(/MMMM|MM|DD|dddd/g, function (val) {
                return val.slice(1);
            });

            return this._longDateFormat[key];
        }

        var defaultInvalidDate = 'Invalid date';

        function invalidDate() {
            return this._invalidDate;
        }

        var defaultOrdinal = '%d';
        var defaultDayOfMonthOrdinalParse = /\d{1,2}/;

        function ordinal(number) {
            return this._ordinal.replace('%d', number);
        }

        var defaultRelativeTime = {
            future: 'in %s',
            past: '%s ago',
            s: 'a few seconds',
            ss: '%d seconds',
            m: 'a minute',
            mm: '%d minutes',
            h: 'an hour',
            hh: '%d hours',
            d: 'a day',
            dd: '%d days',
            M: 'a month',
            MM: '%d months',
            y: 'a year',
            yy: '%d years'
        };

        function relativeTime(number, withoutSuffix, string, isFuture) {
            var output = this._relativeTime[string];
            return (isFunction(output)) ?
                output(number, withoutSuffix, string, isFuture) :
                output.replace(/%d/i, number);
        }

        function pastFuture(diff, output) {
            var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
            return isFunction(format) ? format(output) : format.replace(/%s/i, output);
        }

        var aliases = {};

        function addUnitAlias(unit, shorthand) {
            var lowerCase = unit.toLowerCase();
            aliases[lowerCase] = aliases[lowerCase + 's'] = aliases[shorthand] = unit;
        }

        function normalizeUnits(units) {
            return typeof units === 'string' ? aliases[units] || aliases[units.toLowerCase()] : undefined;
        }

        function normalizeObjectUnits(inputObject) {
            var normalizedInput = {},
                normalizedProp,
                prop;

            for (prop in inputObject) {
                if (hasOwnProp(inputObject, prop)) {
                    normalizedProp = normalizeUnits(prop);
                    if (normalizedProp) {
                        normalizedInput[normalizedProp] = inputObject[prop];
                    }
                }
            }

            return normalizedInput;
        }

        var priorities = {};

        function addUnitPriority(unit, priority) {
            priorities[unit] = priority;
        }

        function getPrioritizedUnits(unitsObj) {
            var units = [];
            for (var u in unitsObj) {
                units.push({ unit: u, priority: priorities[u] });
            }
            units.sort(function (a, b) {
                return a.priority - b.priority;
            });
            return units;
        }

        function zeroFill(number, targetLength, forceSign) {
            var absNumber = '' + Math.abs(number),
                zerosToFill = targetLength - absNumber.length,
                sign = number >= 0;
            return (sign ? (forceSign ? '+' : '') : '-') +
                Math.pow(10, Math.max(0, zerosToFill)).toString().substr(1) + absNumber;
        }

        var formattingTokens = /(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|YYYYYY|YYYYY|YYYY|YY|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g;

        var localFormattingTokens = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g;

        var formatFunctions = {};

        var formatTokenFunctions = {};

        // token:    'M'
        // padded:   ['MM', 2]
        // ordinal:  'Mo'
        // callback: function () { this.month() + 1 }
        function addFormatToken(token, padded, ordinal, callback) {
            var func = callback;
            if (typeof callback === 'string') {
                func = function () {
                    return this[callback]();
                };
            }
            if (token) {
                formatTokenFunctions[token] = func;
            }
            if (padded) {
                formatTokenFunctions[padded[0]] = function () {
                    return zeroFill(func.apply(this, arguments), padded[1], padded[2]);
                };
            }
            if (ordinal) {
                formatTokenFunctions[ordinal] = function () {
                    return this.localeData().ordinal(func.apply(this, arguments), token);
                };
            }
        }

        function removeFormattingTokens(input) {
            if (input.match(/\[[\s\S]/)) {
                return input.replace(/^\[|\]$/g, '');
            }
            return input.replace(/\\/g, '');
        }

        function makeFormatFunction(format) {
            var array = format.match(formattingTokens), i, length;

            for (i = 0, length = array.length; i < length; i++) {
                if (formatTokenFunctions[array[i]]) {
                    array[i] = formatTokenFunctions[array[i]];
                } else {
                    array[i] = removeFormattingTokens(array[i]);
                }
            }

            return function (mom) {
                var output = '', i;
                for (i = 0; i < length; i++) {
                    output += isFunction(array[i]) ? array[i].call(mom, format) : array[i];
                }
                return output;
            };
        }

        // format date using native date object
        function formatMoment(m, format) {
            if (!m.isValid()) {
                return m.localeData().invalidDate();
            }

            format = expandFormat(format, m.localeData());
            formatFunctions[format] = formatFunctions[format] || makeFormatFunction(format);

            return formatFunctions[format](m);
        }

        function expandFormat(format, locale) {
            var i = 5;

            function replaceLongDateFormatTokens(input) {
                return locale.longDateFormat(input) || input;
            }

            localFormattingTokens.lastIndex = 0;
            while (i >= 0 && localFormattingTokens.test(format)) {
                format = format.replace(localFormattingTokens, replaceLongDateFormatTokens);
                localFormattingTokens.lastIndex = 0;
                i -= 1;
            }

            return format;
        }

        var match1 = /\d/;            //       0 - 9
        var match2 = /\d\d/;          //      00 - 99
        var match3 = /\d{3}/;         //     000 - 999
        var match4 = /\d{4}/;         //    0000 - 9999
        var match6 = /[+-]?\d{6}/;    // -999999 - 999999
        var match1to2 = /\d\d?/;         //       0 - 99
        var match3to4 = /\d\d\d\d?/;     //     999 - 9999
        var match5to6 = /\d\d\d\d\d\d?/; //   99999 - 999999
        var match1to3 = /\d{1,3}/;       //       0 - 999
        var match1to4 = /\d{1,4}/;       //       0 - 9999
        var match1to6 = /[+-]?\d{1,6}/;  // -999999 - 999999

        var matchUnsigned = /\d+/;           //       0 - inf
        var matchSigned = /[+-]?\d+/;      //    -inf - inf

        var matchOffset = /Z|[+-]\d\d:?\d\d/gi; // +00:00 -00:00 +0000 -0000 or Z
        var matchShortOffset = /Z|[+-]\d\d(?::?\d\d)?/gi; // +00 -00 +00:00 -00:00 +0000 -0000 or Z

        var matchTimestamp = /[+-]?\d+(\.\d{1,3})?/; // 123456789 123456789.123

        // any word (or two) characters or numbers including two/three word month in arabic.
        // includes scottish gaelic two word and hyphenated months
        var matchWord = /[0-9]{0,256}['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFF07\uFF10-\uFFEF]{1,256}|[\u0600-\u06FF\/]{1,256}(\s*?[\u0600-\u06FF]{1,256}){1,2}/i;


        var regexes = {};

        function addRegexToken(token, regex, strictRegex) {
            regexes[token] = isFunction(regex) ? regex : function (isStrict, localeData) {
                return (isStrict && strictRegex) ? strictRegex : regex;
            };
        }

        function getParseRegexForToken(token, config) {
            if (!hasOwnProp(regexes, token)) {
                return new RegExp(unescapeFormat(token));
            }

            return regexes[token](config._strict, config._locale);
        }

        // Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
        function unescapeFormat(s) {
            return regexEscape(s.replace('\\', '').replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (matched, p1, p2, p3, p4) {
                return p1 || p2 || p3 || p4;
            }));
        }

        function regexEscape(s) {
            return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        }

        var tokens = {};

        function addParseToken(token, callback) {
            var i, func = callback;
            if (typeof token === 'string') {
                token = [token];
            }
            if (isNumber(callback)) {
                func = function (input, array) {
                    array[callback] = toInt(input);
                };
            }
            for (i = 0; i < token.length; i++) {
                tokens[token[i]] = func;
            }
        }

        function addWeekParseToken(token, callback) {
            addParseToken(token, function (input, array, config, token) {
                config._w = config._w || {};
                callback(input, config._w, config, token);
            });
        }

        function addTimeToArrayFromToken(token, input, config) {
            if (input != null && hasOwnProp(tokens, token)) {
                tokens[token](input, config._a, config, token);
            }
        }

        var YEAR = 0;
        var MONTH = 1;
        var DATE = 2;
        var HOUR = 3;
        var MINUTE = 4;
        var SECOND = 5;
        var MILLISECOND = 6;
        var WEEK = 7;
        var WEEKDAY = 8;

        // FORMATTING

        addFormatToken('Y', 0, 0, function () {
            var y = this.year();
            return y <= 9999 ? '' + y : '+' + y;
        });

        addFormatToken(0, ['YY', 2], 0, function () {
            return this.year() % 100;
        });

        addFormatToken(0, ['YYYY', 4], 0, 'year');
        addFormatToken(0, ['YYYYY', 5], 0, 'year');
        addFormatToken(0, ['YYYYYY', 6, true], 0, 'year');

        // ALIASES

        addUnitAlias('year', 'y');

        // PRIORITIES

        addUnitPriority('year', 1);

        // PARSING

        addRegexToken('Y', matchSigned);
        addRegexToken('YY', match1to2, match2);
        addRegexToken('YYYY', match1to4, match4);
        addRegexToken('YYYYY', match1to6, match6);
        addRegexToken('YYYYYY', match1to6, match6);

        addParseToken(['YYYYY', 'YYYYYY'], YEAR);
        addParseToken('YYYY', function (input, array) {
            array[YEAR] = input.length === 2 ? hooks.parseTwoDigitYear(input) : toInt(input);
        });
        addParseToken('YY', function (input, array) {
            array[YEAR] = hooks.parseTwoDigitYear(input);
        });
        addParseToken('Y', function (input, array) {
            array[YEAR] = parseInt(input, 10);
        });

        // HELPERS

        function daysInYear(year) {
            return isLeapYear(year) ? 366 : 365;
        }

        function isLeapYear(year) {
            return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
        }

        // HOOKS

        hooks.parseTwoDigitYear = function (input) {
            return toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
        };

        // MOMENTS

        var getSetYear = makeGetSet('FullYear', true);

        function getIsLeapYear() {
            return isLeapYear(this.year());
        }

        function makeGetSet(unit, keepTime) {
            return function (value) {
                if (value != null) {
                    set$1(this, unit, value);
                    hooks.updateOffset(this, keepTime);
                    return this;
                } else {
                    return get(this, unit);
                }
            };
        }

        function get(mom, unit) {
            return mom.isValid() ?
                mom._d['get' + (mom._isUTC ? 'UTC' : '') + unit]() : NaN;
        }

        function set$1(mom, unit, value) {
            if (mom.isValid() && !isNaN(value)) {
                if (unit === 'FullYear' && isLeapYear(mom.year()) && mom.month() === 1 && mom.date() === 29) {
                    mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value, mom.month(), daysInMonth(value, mom.month()));
                }
                else {
                    mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value);
                }
            }
        }

        // MOMENTS

        function stringGet(units) {
            units = normalizeUnits(units);
            if (isFunction(this[units])) {
                return this[units]();
            }
            return this;
        }


        function stringSet(units, value) {
            if (typeof units === 'object') {
                units = normalizeObjectUnits(units);
                var prioritized = getPrioritizedUnits(units);
                for (var i = 0; i < prioritized.length; i++) {
                    this[prioritized[i].unit](units[prioritized[i].unit]);
                }
            } else {
                units = normalizeUnits(units);
                if (isFunction(this[units])) {
                    return this[units](value);
                }
            }
            return this;
        }

        function mod(n, x) {
            return ((n % x) + x) % x;
        }

        var indexOf;

        if (Array.prototype.indexOf) {
            indexOf = Array.prototype.indexOf;
        } else {
            indexOf = function (o) {
                // I know
                var i;
                for (i = 0; i < this.length; ++i) {
                    if (this[i] === o) {
                        return i;
                    }
                }
                return -1;
            };
        }

        function daysInMonth(year, month) {
            if (isNaN(year) || isNaN(month)) {
                return NaN;
            }
            var modMonth = mod(month, 12);
            year += (month - modMonth) / 12;
            return modMonth === 1 ? (isLeapYear(year) ? 29 : 28) : (31 - modMonth % 7 % 2);
        }

        // FORMATTING

        addFormatToken('M', ['MM', 2], 'Mo', function () {
            return this.month() + 1;
        });

        addFormatToken('MMM', 0, 0, function (format) {
            return this.localeData().monthsShort(this, format);
        });

        addFormatToken('MMMM', 0, 0, function (format) {
            return this.localeData().months(this, format);
        });

        // ALIASES

        addUnitAlias('month', 'M');

        // PRIORITY

        addUnitPriority('month', 8);

        // PARSING

        addRegexToken('M', match1to2);
        addRegexToken('MM', match1to2, match2);
        addRegexToken('MMM', function (isStrict, locale) {
            return locale.monthsShortRegex(isStrict);
        });
        addRegexToken('MMMM', function (isStrict, locale) {
            return locale.monthsRegex(isStrict);
        });

        addParseToken(['M', 'MM'], function (input, array) {
            array[MONTH] = toInt(input) - 1;
        });

        addParseToken(['MMM', 'MMMM'], function (input, array, config, token) {
            var month = config._locale.monthsParse(input, token, config._strict);
            // if we didn't find a month name, mark the date as invalid.
            if (month != null) {
                array[MONTH] = month;
            } else {
                getParsingFlags(config).invalidMonth = input;
            }
        });

        // LOCALES

        var MONTHS_IN_FORMAT = /D[oD]?(\[[^\[\]]*\]|\s)+MMMM?/;
        var defaultLocaleMonths = 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_');
        function localeMonths(m, format) {
            if (!m) {
                return isArray(this._months) ? this._months :
                    this._months['standalone'];
            }
            return isArray(this._months) ? this._months[m.month()] :
                this._months[(this._months.isFormat || MONTHS_IN_FORMAT).test(format) ? 'format' : 'standalone'][m.month()];
        }

        var defaultLocaleMonthsShort = 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_');
        function localeMonthsShort(m, format) {
            if (!m) {
                return isArray(this._monthsShort) ? this._monthsShort :
                    this._monthsShort['standalone'];
            }
            return isArray(this._monthsShort) ? this._monthsShort[m.month()] :
                this._monthsShort[MONTHS_IN_FORMAT.test(format) ? 'format' : 'standalone'][m.month()];
        }

        function handleStrictParse(monthName, format, strict) {
            var i, ii, mom, llc = monthName.toLocaleLowerCase();
            if (!this._monthsParse) {
                // this is not used
                this._monthsParse = [];
                this._longMonthsParse = [];
                this._shortMonthsParse = [];
                for (i = 0; i < 12; ++i) {
                    mom = createUTC([2000, i]);
                    this._shortMonthsParse[i] = this.monthsShort(mom, '').toLocaleLowerCase();
                    this._longMonthsParse[i] = this.months(mom, '').toLocaleLowerCase();
                }
            }

            if (strict) {
                if (format === 'MMM') {
                    ii = indexOf.call(this._shortMonthsParse, llc);
                    return ii !== -1 ? ii : null;
                } else {
                    ii = indexOf.call(this._longMonthsParse, llc);
                    return ii !== -1 ? ii : null;
                }
            } else {
                if (format === 'MMM') {
                    ii = indexOf.call(this._shortMonthsParse, llc);
                    if (ii !== -1) {
                        return ii;
                    }
                    ii = indexOf.call(this._longMonthsParse, llc);
                    return ii !== -1 ? ii : null;
                } else {
                    ii = indexOf.call(this._longMonthsParse, llc);
                    if (ii !== -1) {
                        return ii;
                    }
                    ii = indexOf.call(this._shortMonthsParse, llc);
                    return ii !== -1 ? ii : null;
                }
            }
        }

        function localeMonthsParse(monthName, format, strict) {
            var i, mom, regex;

            if (this._monthsParseExact) {
                return handleStrictParse.call(this, monthName, format, strict);
            }

            if (!this._monthsParse) {
                this._monthsParse = [];
                this._longMonthsParse = [];
                this._shortMonthsParse = [];
            }

            // TODO: add sorting
            // Sorting makes sure if one month (or abbr) is a prefix of another
            // see sorting in computeMonthsParse
            for (i = 0; i < 12; i++) {
                // make the regex if we don't have it already
                mom = createUTC([2000, i]);
                if (strict && !this._longMonthsParse[i]) {
                    this._longMonthsParse[i] = new RegExp('^' + this.months(mom, '').replace('.', '') + '$', 'i');
                    this._shortMonthsParse[i] = new RegExp('^' + this.monthsShort(mom, '').replace('.', '') + '$', 'i');
                }
                if (!strict && !this._monthsParse[i]) {
                    regex = '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
                    this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
                }
                // test the regex
                if (strict && format === 'MMMM' && this._longMonthsParse[i].test(monthName)) {
                    return i;
                } else if (strict && format === 'MMM' && this._shortMonthsParse[i].test(monthName)) {
                    return i;
                } else if (!strict && this._monthsParse[i].test(monthName)) {
                    return i;
                }
            }
        }

        // MOMENTS

        function setMonth(mom, value) {
            var dayOfMonth;

            if (!mom.isValid()) {
                // No op
                return mom;
            }

            if (typeof value === 'string') {
                if (/^\d+$/.test(value)) {
                    value = toInt(value);
                } else {
                    value = mom.localeData().monthsParse(value);
                    // TODO: Another silent failure?
                    if (!isNumber(value)) {
                        return mom;
                    }
                }
            }

            dayOfMonth = Math.min(mom.date(), daysInMonth(mom.year(), value));
            mom._d['set' + (mom._isUTC ? 'UTC' : '') + 'Month'](value, dayOfMonth);
            return mom;
        }

        function getSetMonth(value) {
            if (value != null) {
                setMonth(this, value);
                hooks.updateOffset(this, true);
                return this;
            } else {
                return get(this, 'Month');
            }
        }

        function getDaysInMonth() {
            return daysInMonth(this.year(), this.month());
        }

        var defaultMonthsShortRegex = matchWord;
        function monthsShortRegex(isStrict) {
            if (this._monthsParseExact) {
                if (!hasOwnProp(this, '_monthsRegex')) {
                    computeMonthsParse.call(this);
                }
                if (isStrict) {
                    return this._monthsShortStrictRegex;
                } else {
                    return this._monthsShortRegex;
                }
            } else {
                if (!hasOwnProp(this, '_monthsShortRegex')) {
                    this._monthsShortRegex = defaultMonthsShortRegex;
                }
                return this._monthsShortStrictRegex && isStrict ?
                    this._monthsShortStrictRegex : this._monthsShortRegex;
            }
        }

        var defaultMonthsRegex = matchWord;
        function monthsRegex(isStrict) {
            if (this._monthsParseExact) {
                if (!hasOwnProp(this, '_monthsRegex')) {
                    computeMonthsParse.call(this);
                }
                if (isStrict) {
                    return this._monthsStrictRegex;
                } else {
                    return this._monthsRegex;
                }
            } else {
                if (!hasOwnProp(this, '_monthsRegex')) {
                    this._monthsRegex = defaultMonthsRegex;
                }
                return this._monthsStrictRegex && isStrict ?
                    this._monthsStrictRegex : this._monthsRegex;
            }
        }

        function computeMonthsParse() {
            function cmpLenRev(a, b) {
                return b.length - a.length;
            }

            var shortPieces = [], longPieces = [], mixedPieces = [],
                i, mom;
            for (i = 0; i < 12; i++) {
                // make the regex if we don't have it already
                mom = createUTC([2000, i]);
                shortPieces.push(this.monthsShort(mom, ''));
                longPieces.push(this.months(mom, ''));
                mixedPieces.push(this.months(mom, ''));
                mixedPieces.push(this.monthsShort(mom, ''));
            }
            // Sorting makes sure if one month (or abbr) is a prefix of another it
            // will match the longer piece.
            shortPieces.sort(cmpLenRev);
            longPieces.sort(cmpLenRev);
            mixedPieces.sort(cmpLenRev);
            for (i = 0; i < 12; i++) {
                shortPieces[i] = regexEscape(shortPieces[i]);
                longPieces[i] = regexEscape(longPieces[i]);
            }
            for (i = 0; i < 24; i++) {
                mixedPieces[i] = regexEscape(mixedPieces[i]);
            }

            this._monthsRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
            this._monthsShortRegex = this._monthsRegex;
            this._monthsStrictRegex = new RegExp('^(' + longPieces.join('|') + ')', 'i');
            this._monthsShortStrictRegex = new RegExp('^(' + shortPieces.join('|') + ')', 'i');
        }

        function createDate(y, m, d, h, M, s, ms) {
            // can't just apply() to create a date:
            // https://stackoverflow.com/q/181348
            var date = new Date(y, m, d, h, M, s, ms);

            // the date constructor remaps years 0-99 to 1900-1999
            if (y < 100 && y >= 0 && isFinite(date.getFullYear())) {
                date.setFullYear(y);
            }
            return date;
        }

        function createUTCDate(y) {
            var date = new Date(Date.UTC.apply(null, arguments));

            // the Date.UTC function remaps years 0-99 to 1900-1999
            if (y < 100 && y >= 0 && isFinite(date.getUTCFullYear())) {
                date.setUTCFullYear(y);
            }
            return date;
        }

        // start-of-first-week - start-of-year
        function firstWeekOffset(year, dow, doy) {
            var // first-week day -- which january is always in the first week (4 for iso, 1 for other)
                fwd = 7 + dow - doy,
                // first-week day local weekday -- which local weekday is fwd
                fwdlw = (7 + createUTCDate(year, 0, fwd).getUTCDay() - dow) % 7;

            return -fwdlw + fwd - 1;
        }

        // https://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday
        function dayOfYearFromWeeks(year, week, weekday, dow, doy) {
            var localWeekday = (7 + weekday - dow) % 7,
                weekOffset = firstWeekOffset(year, dow, doy),
                dayOfYear = 1 + 7 * (week - 1) + localWeekday + weekOffset,
                resYear, resDayOfYear;

            if (dayOfYear <= 0) {
                resYear = year - 1;
                resDayOfYear = daysInYear(resYear) + dayOfYear;
            } else if (dayOfYear > daysInYear(year)) {
                resYear = year + 1;
                resDayOfYear = dayOfYear - daysInYear(year);
            } else {
                resYear = year;
                resDayOfYear = dayOfYear;
            }

            return {
                year: resYear,
                dayOfYear: resDayOfYear
            };
        }

        function weekOfYear(mom, dow, doy) {
            var weekOffset = firstWeekOffset(mom.year(), dow, doy),
                week = Math.floor((mom.dayOfYear() - weekOffset - 1) / 7) + 1,
                resWeek, resYear;

            if (week < 1) {
                resYear = mom.year() - 1;
                resWeek = week + weeksInYear(resYear, dow, doy);
            } else if (week > weeksInYear(mom.year(), dow, doy)) {
                resWeek = week - weeksInYear(mom.year(), dow, doy);
                resYear = mom.year() + 1;
            } else {
                resYear = mom.year();
                resWeek = week;
            }

            return {
                week: resWeek,
                year: resYear
            };
        }

        function weeksInYear(year, dow, doy) {
            var weekOffset = firstWeekOffset(year, dow, doy),
                weekOffsetNext = firstWeekOffset(year + 1, dow, doy);
            return (daysInYear(year) - weekOffset + weekOffsetNext) / 7;
        }

        // FORMATTING

        addFormatToken('w', ['ww', 2], 'wo', 'week');
        addFormatToken('W', ['WW', 2], 'Wo', 'isoWeek');

        // ALIASES

        addUnitAlias('week', 'w');
        addUnitAlias('isoWeek', 'W');

        // PRIORITIES

        addUnitPriority('week', 5);
        addUnitPriority('isoWeek', 5);

        // PARSING

        addRegexToken('w', match1to2);
        addRegexToken('ww', match1to2, match2);
        addRegexToken('W', match1to2);
        addRegexToken('WW', match1to2, match2);

        addWeekParseToken(['w', 'ww', 'W', 'WW'], function (input, week, config, token) {
            week[token.substr(0, 1)] = toInt(input);
        });

        // HELPERS

        // LOCALES

        function localeWeek(mom) {
            return weekOfYear(mom, this._week.dow, this._week.doy).week;
        }

        var defaultLocaleWeek = {
            dow: 0, // Sunday is the first day of the week.
            doy: 6  // The week that contains Jan 1st is the first week of the year.
        };

        function localeFirstDayOfWeek() {
            return this._week.dow;
        }

        function localeFirstDayOfYear() {
            return this._week.doy;
        }

        // MOMENTS

        function getSetWeek(input) {
            var week = this.localeData().week(this);
            return input == null ? week : this.add((input - week) * 7, 'd');
        }

        function getSetISOWeek(input) {
            var week = weekOfYear(this, 1, 4).week;
            return input == null ? week : this.add((input - week) * 7, 'd');
        }

        // FORMATTING

        addFormatToken('d', 0, 'do', 'day');

        addFormatToken('dd', 0, 0, function (format) {
            return this.localeData().weekdaysMin(this, format);
        });

        addFormatToken('ddd', 0, 0, function (format) {
            return this.localeData().weekdaysShort(this, format);
        });

        addFormatToken('dddd', 0, 0, function (format) {
            return this.localeData().weekdays(this, format);
        });

        addFormatToken('e', 0, 0, 'weekday');
        addFormatToken('E', 0, 0, 'isoWeekday');

        // ALIASES

        addUnitAlias('day', 'd');
        addUnitAlias('weekday', 'e');
        addUnitAlias('isoWeekday', 'E');

        // PRIORITY
        addUnitPriority('day', 11);
        addUnitPriority('weekday', 11);
        addUnitPriority('isoWeekday', 11);

        // PARSING

        addRegexToken('d', match1to2);
        addRegexToken('e', match1to2);
        addRegexToken('E', match1to2);
        addRegexToken('dd', function (isStrict, locale) {
            return locale.weekdaysMinRegex(isStrict);
        });
        addRegexToken('ddd', function (isStrict, locale) {
            return locale.weekdaysShortRegex(isStrict);
        });
        addRegexToken('dddd', function (isStrict, locale) {
            return locale.weekdaysRegex(isStrict);
        });

        addWeekParseToken(['dd', 'ddd', 'dddd'], function (input, week, config, token) {
            var weekday = config._locale.weekdaysParse(input, token, config._strict);
            // if we didn't get a weekday name, mark the date as invalid
            if (weekday != null) {
                week.d = weekday;
            } else {
                getParsingFlags(config).invalidWeekday = input;
            }
        });

        addWeekParseToken(['d', 'e', 'E'], function (input, week, config, token) {
            week[token] = toInt(input);
        });

        // HELPERS

        function parseWeekday(input, locale) {
            if (typeof input !== 'string') {
                return input;
            }

            if (!isNaN(input)) {
                return parseInt(input, 10);
            }

            input = locale.weekdaysParse(input);
            if (typeof input === 'number') {
                return input;
            }

            return null;
        }

        function parseIsoWeekday(input, locale) {
            if (typeof input === 'string') {
                return locale.weekdaysParse(input) % 7 || 7;
            }
            return isNaN(input) ? null : input;
        }

        // LOCALES

        var defaultLocaleWeekdays = 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_');
        function localeWeekdays(m, format) {
            if (!m) {
                return isArray(this._weekdays) ? this._weekdays :
                    this._weekdays['standalone'];
            }
            return isArray(this._weekdays) ? this._weekdays[m.day()] :
                this._weekdays[this._weekdays.isFormat.test(format) ? 'format' : 'standalone'][m.day()];
        }

        var defaultLocaleWeekdaysShort = 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_');
        function localeWeekdaysShort(m) {
            return (m) ? this._weekdaysShort[m.day()] : this._weekdaysShort;
        }

        var defaultLocaleWeekdaysMin = 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_');
        function localeWeekdaysMin(m) {
            return (m) ? this._weekdaysMin[m.day()] : this._weekdaysMin;
        }

        function handleStrictParse$1(weekdayName, format, strict) {
            var i, ii, mom, llc = weekdayName.toLocaleLowerCase();
            if (!this._weekdaysParse) {
                this._weekdaysParse = [];
                this._shortWeekdaysParse = [];
                this._minWeekdaysParse = [];

                for (i = 0; i < 7; ++i) {
                    mom = createUTC([2000, 1]).day(i);
                    this._minWeekdaysParse[i] = this.weekdaysMin(mom, '').toLocaleLowerCase();
                    this._shortWeekdaysParse[i] = this.weekdaysShort(mom, '').toLocaleLowerCase();
                    this._weekdaysParse[i] = this.weekdays(mom, '').toLocaleLowerCase();
                }
            }

            if (strict) {
                if (format === 'dddd') {
                    ii = indexOf.call(this._weekdaysParse, llc);
                    return ii !== -1 ? ii : null;
                } else if (format === 'ddd') {
                    ii = indexOf.call(this._shortWeekdaysParse, llc);
                    return ii !== -1 ? ii : null;
                } else {
                    ii = indexOf.call(this._minWeekdaysParse, llc);
                    return ii !== -1 ? ii : null;
                }
            } else {
                if (format === 'dddd') {
                    ii = indexOf.call(this._weekdaysParse, llc);
                    if (ii !== -1) {
                        return ii;
                    }
                    ii = indexOf.call(this._shortWeekdaysParse, llc);
                    if (ii !== -1) {
                        return ii;
                    }
                    ii = indexOf.call(this._minWeekdaysParse, llc);
                    return ii !== -1 ? ii : null;
                } else if (format === 'ddd') {
                    ii = indexOf.call(this._shortWeekdaysParse, llc);
                    if (ii !== -1) {
                        return ii;
                    }
                    ii = indexOf.call(this._weekdaysParse, llc);
                    if (ii !== -1) {
                        return ii;
                    }
                    ii = indexOf.call(this._minWeekdaysParse, llc);
                    return ii !== -1 ? ii : null;
                } else {
                    ii = indexOf.call(this._minWeekdaysParse, llc);
                    if (ii !== -1) {
                        return ii;
                    }
                    ii = indexOf.call(this._weekdaysParse, llc);
                    if (ii !== -1) {
                        return ii;
                    }
                    ii = indexOf.call(this._shortWeekdaysParse, llc);
                    return ii !== -1 ? ii : null;
                }
            }
        }

        function localeWeekdaysParse(weekdayName, format, strict) {
            var i, mom, regex;

            if (this._weekdaysParseExact) {
                return handleStrictParse$1.call(this, weekdayName, format, strict);
            }

            if (!this._weekdaysParse) {
                this._weekdaysParse = [];
                this._minWeekdaysParse = [];
                this._shortWeekdaysParse = [];
                this._fullWeekdaysParse = [];
            }

            for (i = 0; i < 7; i++) {
                // make the regex if we don't have it already

                mom = createUTC([2000, 1]).day(i);
                if (strict && !this._fullWeekdaysParse[i]) {
                    this._fullWeekdaysParse[i] = new RegExp('^' + this.weekdays(mom, '').replace('.', '\.?') + '$', 'i');
                    this._shortWeekdaysParse[i] = new RegExp('^' + this.weekdaysShort(mom, '').replace('.', '\.?') + '$', 'i');
                    this._minWeekdaysParse[i] = new RegExp('^' + this.weekdaysMin(mom, '').replace('.', '\.?') + '$', 'i');
                }
                if (!this._weekdaysParse[i]) {
                    regex = '^' + this.weekdays(mom, '') + '|^' + this.weekdaysShort(mom, '') + '|^' + this.weekdaysMin(mom, '');
                    this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
                }
                // test the regex
                if (strict && format === 'dddd' && this._fullWeekdaysParse[i].test(weekdayName)) {
                    return i;
                } else if (strict && format === 'ddd' && this._shortWeekdaysParse[i].test(weekdayName)) {
                    return i;
                } else if (strict && format === 'dd' && this._minWeekdaysParse[i].test(weekdayName)) {
                    return i;
                } else if (!strict && this._weekdaysParse[i].test(weekdayName)) {
                    return i;
                }
            }
        }

        // MOMENTS

        function getSetDayOfWeek(input) {
            if (!this.isValid()) {
                return input != null ? this : NaN;
            }
            var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
            if (input != null) {
                input = parseWeekday(input, this.localeData());
                return this.add(input - day, 'd');
            } else {
                return day;
            }
        }

        function getSetLocaleDayOfWeek(input) {
            if (!this.isValid()) {
                return input != null ? this : NaN;
            }
            var weekday = (this.day() + 7 - this.localeData()._week.dow) % 7;
            return input == null ? weekday : this.add(input - weekday, 'd');
        }

        function getSetISODayOfWeek(input) {
            if (!this.isValid()) {
                return input != null ? this : NaN;
            }

            // behaves the same as moment#day except
            // as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
            // as a setter, sunday should belong to the previous week.

            if (input != null) {
                var weekday = parseIsoWeekday(input, this.localeData());
                return this.day(this.day() % 7 ? weekday : weekday - 7);
            } else {
                return this.day() || 7;
            }
        }

        var defaultWeekdaysRegex = matchWord;
        function weekdaysRegex(isStrict) {
            if (this._weekdaysParseExact) {
                if (!hasOwnProp(this, '_weekdaysRegex')) {
                    computeWeekdaysParse.call(this);
                }
                if (isStrict) {
                    return this._weekdaysStrictRegex;
                } else {
                    return this._weekdaysRegex;
                }
            } else {
                if (!hasOwnProp(this, '_weekdaysRegex')) {
                    this._weekdaysRegex = defaultWeekdaysRegex;
                }
                return this._weekdaysStrictRegex && isStrict ?
                    this._weekdaysStrictRegex : this._weekdaysRegex;
            }
        }

        var defaultWeekdaysShortRegex = matchWord;
        function weekdaysShortRegex(isStrict) {
            if (this._weekdaysParseExact) {
                if (!hasOwnProp(this, '_weekdaysRegex')) {
                    computeWeekdaysParse.call(this);
                }
                if (isStrict) {
                    return this._weekdaysShortStrictRegex;
                } else {
                    return this._weekdaysShortRegex;
                }
            } else {
                if (!hasOwnProp(this, '_weekdaysShortRegex')) {
                    this._weekdaysShortRegex = defaultWeekdaysShortRegex;
                }
                return this._weekdaysShortStrictRegex && isStrict ?
                    this._weekdaysShortStrictRegex : this._weekdaysShortRegex;
            }
        }

        var defaultWeekdaysMinRegex = matchWord;
        function weekdaysMinRegex(isStrict) {
            if (this._weekdaysParseExact) {
                if (!hasOwnProp(this, '_weekdaysRegex')) {
                    computeWeekdaysParse.call(this);
                }
                if (isStrict) {
                    return this._weekdaysMinStrictRegex;
                } else {
                    return this._weekdaysMinRegex;
                }
            } else {
                if (!hasOwnProp(this, '_weekdaysMinRegex')) {
                    this._weekdaysMinRegex = defaultWeekdaysMinRegex;
                }
                return this._weekdaysMinStrictRegex && isStrict ?
                    this._weekdaysMinStrictRegex : this._weekdaysMinRegex;
            }
        }


        function computeWeekdaysParse() {
            function cmpLenRev(a, b) {
                return b.length - a.length;
            }

            var minPieces = [], shortPieces = [], longPieces = [], mixedPieces = [],
                i, mom, minp, shortp, longp;
            for (i = 0; i < 7; i++) {
                // make the regex if we don't have it already
                mom = createUTC([2000, 1]).day(i);
                minp = this.weekdaysMin(mom, '');
                shortp = this.weekdaysShort(mom, '');
                longp = this.weekdays(mom, '');
                minPieces.push(minp);
                shortPieces.push(shortp);
                longPieces.push(longp);
                mixedPieces.push(minp);
                mixedPieces.push(shortp);
                mixedPieces.push(longp);
            }
            // Sorting makes sure if one weekday (or abbr) is a prefix of another it
            // will match the longer piece.
            minPieces.sort(cmpLenRev);
            shortPieces.sort(cmpLenRev);
            longPieces.sort(cmpLenRev);
            mixedPieces.sort(cmpLenRev);
            for (i = 0; i < 7; i++) {
                shortPieces[i] = regexEscape(shortPieces[i]);
                longPieces[i] = regexEscape(longPieces[i]);
                mixedPieces[i] = regexEscape(mixedPieces[i]);
            }

            this._weekdaysRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
            this._weekdaysShortRegex = this._weekdaysRegex;
            this._weekdaysMinRegex = this._weekdaysRegex;

            this._weekdaysStrictRegex = new RegExp('^(' + longPieces.join('|') + ')', 'i');
            this._weekdaysShortStrictRegex = new RegExp('^(' + shortPieces.join('|') + ')', 'i');
            this._weekdaysMinStrictRegex = new RegExp('^(' + minPieces.join('|') + ')', 'i');
        }

        // FORMATTING

        function hFormat() {
            return this.hours() % 12 || 12;
        }

        function kFormat() {
            return this.hours() || 24;
        }

        addFormatToken('H', ['HH', 2], 0, 'hour');
        addFormatToken('h', ['hh', 2], 0, hFormat);
        addFormatToken('k', ['kk', 2], 0, kFormat);

        addFormatToken('hmm', 0, 0, function () {
            return '' + hFormat.apply(this) + zeroFill(this.minutes(), 2);
        });

        addFormatToken('hmmss', 0, 0, function () {
            return '' + hFormat.apply(this) + zeroFill(this.minutes(), 2) +
                zeroFill(this.seconds(), 2);
        });

        addFormatToken('Hmm', 0, 0, function () {
            return '' + this.hours() + zeroFill(this.minutes(), 2);
        });

        addFormatToken('Hmmss', 0, 0, function () {
            return '' + this.hours() + zeroFill(this.minutes(), 2) +
                zeroFill(this.seconds(), 2);
        });

        function meridiem(token, lowercase) {
            addFormatToken(token, 0, 0, function () {
                return this.localeData().meridiem(this.hours(), this.minutes(), lowercase);
            });
        }

        meridiem('a', true);
        meridiem('A', false);

        // ALIASES

        addUnitAlias('hour', 'h');

        // PRIORITY
        addUnitPriority('hour', 13);

        // PARSING

        function matchMeridiem(isStrict, locale) {
            return locale._meridiemParse;
        }

        addRegexToken('a', matchMeridiem);
        addRegexToken('A', matchMeridiem);
        addRegexToken('H', match1to2);
        addRegexToken('h', match1to2);
        addRegexToken('k', match1to2);
        addRegexToken('HH', match1to2, match2);
        addRegexToken('hh', match1to2, match2);
        addRegexToken('kk', match1to2, match2);

        addRegexToken('hmm', match3to4);
        addRegexToken('hmmss', match5to6);
        addRegexToken('Hmm', match3to4);
        addRegexToken('Hmmss', match5to6);

        addParseToken(['H', 'HH'], HOUR);
        addParseToken(['k', 'kk'], function (input, array, config) {
            var kInput = toInt(input);
            array[HOUR] = kInput === 24 ? 0 : kInput;
        });
        addParseToken(['a', 'A'], function (input, array, config) {
            config._isPm = config._locale.isPM(input);
            config._meridiem = input;
        });
        addParseToken(['h', 'hh'], function (input, array, config) {
            array[HOUR] = toInt(input);
            getParsingFlags(config).bigHour = true;
        });
        addParseToken('hmm', function (input, array, config) {
            var pos = input.length - 2;
            array[HOUR] = toInt(input.substr(0, pos));
            array[MINUTE] = toInt(input.substr(pos));
            getParsingFlags(config).bigHour = true;
        });
        addParseToken('hmmss', function (input, array, config) {
            var pos1 = input.length - 4;
            var pos2 = input.length - 2;
            array[HOUR] = toInt(input.substr(0, pos1));
            array[MINUTE] = toInt(input.substr(pos1, 2));
            array[SECOND] = toInt(input.substr(pos2));
            getParsingFlags(config).bigHour = true;
        });
        addParseToken('Hmm', function (input, array, config) {
            var pos = input.length - 2;
            array[HOUR] = toInt(input.substr(0, pos));
            array[MINUTE] = toInt(input.substr(pos));
        });
        addParseToken('Hmmss', function (input, array, config) {
            var pos1 = input.length - 4;
            var pos2 = input.length - 2;
            array[HOUR] = toInt(input.substr(0, pos1));
            array[MINUTE] = toInt(input.substr(pos1, 2));
            array[SECOND] = toInt(input.substr(pos2));
        });

        // LOCALES

        function localeIsPM(input) {
            // IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
            // Using charAt should be more compatible.
            return ((input + '').toLowerCase().charAt(0) === 'p');
        }

        var defaultLocaleMeridiemParse = /[ap]\.?m?\.?/i;
        function localeMeridiem(hours, minutes, isLower) {
            if (hours > 11) {
                return isLower ? 'pm' : 'PM';
            } else {
                return isLower ? 'am' : 'AM';
            }
        }


        // MOMENTS

        // Setting the hour should keep the time, because the user explicitly
        // specified which hour he wants. So trying to maintain the same hour (in
        // a new timezone) makes sense. Adding/subtracting hours does not follow
        // this rule.
        var getSetHour = makeGetSet('Hours', true);

        // months
        // week
        // weekdays
        // meridiem
        var baseConfig = {
            calendar: defaultCalendar,
            longDateFormat: defaultLongDateFormat,
            invalidDate: defaultInvalidDate,
            ordinal: defaultOrdinal,
            dayOfMonthOrdinalParse: defaultDayOfMonthOrdinalParse,
            relativeTime: defaultRelativeTime,

            months: defaultLocaleMonths,
            monthsShort: defaultLocaleMonthsShort,

            week: defaultLocaleWeek,

            weekdays: defaultLocaleWeekdays,
            weekdaysMin: defaultLocaleWeekdaysMin,
            weekdaysShort: defaultLocaleWeekdaysShort,

            meridiemParse: defaultLocaleMeridiemParse
        };

        // internal storage for locale config files
        var locales = {};
        var localeFamilies = {};
        var globalLocale;

        function normalizeLocale(key) {
            return key ? key.toLowerCase().replace('_', '-') : key;
        }

        // pick the locale from the array
        // try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each
        // substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
        function chooseLocale(names) {
            var i = 0, j, next, locale, split;

            while (i < names.length) {
                split = normalizeLocale(names[i]).split('-');
                j = split.length;
                next = normalizeLocale(names[i + 1]);
                next = next ? next.split('-') : null;
                while (j > 0) {
                    locale = loadLocale(split.slice(0, j).join('-'));
                    if (locale) {
                        return locale;
                    }
                    if (next && next.length >= j && compareArrays(split, next, true) >= j - 1) {
                        //the next array item is better than a shallower substring of this one
                        break;
                    }
                    j--;
                }
                i++;
            }
            return null;
        }

        function loadLocale(name) {
            var oldLocale = null;
            // TODO: Find a better way to register and load all the locales in Node
            if (!locales[name] && (typeof module !== 'undefined') &&
                module && module.exports) {
                try {
                    oldLocale = globalLocale._abbr;
                    var aliasedRequire = require;
                    aliasedRequire('./locale/' + name);
                    getSetGlobalLocale(oldLocale);
                } catch (e) { }
            }
            return locales[name];
        }

        // This function will load locale and then set the global locale.  If
        // no arguments are passed in, it will simply return the current global
        // locale key.
        function getSetGlobalLocale(key, values) {
            var data;
            if (key) {
                if (isUndefined(values)) {
                    data = getLocale(key);
                }
                else {
                    data = defineLocale(key, values);
                }

                if (data) {
                    // moment.duration._locale = moment._locale = data;
                    globalLocale = data;
                }
            }

            return globalLocale._abbr;
        }

        function defineLocale(name, config) {
            if (config !== null) {
                var parentConfig = baseConfig;
                config.abbr = name;
                if (locales[name] != null) {
                    deprecateSimple('defineLocaleOverride',
                        'use moment.updateLocale(localeName, config) to change ' +
                        'an existing locale. moment.defineLocale(localeName, ' +
                        'config) should only be used for creating a new locale ' +
                        'See http://momentjs.com/guides/#/warnings/define-locale/ for more info.');
                    parentConfig = locales[name]._config;
                } else if (config.parentLocale != null) {
                    if (locales[config.parentLocale] != null) {
                        parentConfig = locales[config.parentLocale]._config;
                    } else {
                        if (!localeFamilies[config.parentLocale]) {
                            localeFamilies[config.parentLocale] = [];
                        }
                        localeFamilies[config.parentLocale].push({
                            name: name,
                            config: config
                        });
                        return null;
                    }
                }
                locales[name] = new Locale(mergeConfigs(parentConfig, config));

                if (localeFamilies[name]) {
                    localeFamilies[name].forEach(function (x) {
                        defineLocale(x.name, x.config);
                    });
                }

                // backwards compat for now: also set the locale
                // make sure we set the locale AFTER all child locales have been
                // created, so we won't end up with the child locale set.
                getSetGlobalLocale(name);


                return locales[name];
            } else {
                // useful for testing
                delete locales[name];
                return null;
            }
        }

        function updateLocale(name, config) {
            if (config != null) {
                var locale, tmpLocale, parentConfig = baseConfig;
                // MERGE
                tmpLocale = loadLocale(name);
                if (tmpLocale != null) {
                    parentConfig = tmpLocale._config;
                }
                config = mergeConfigs(parentConfig, config);
                locale = new Locale(config);
                locale.parentLocale = locales[name];
                locales[name] = locale;

                // backwards compat for now: also set the locale
                getSetGlobalLocale(name);
            } else {
                // pass null for config to unupdate, useful for tests
                if (locales[name] != null) {
                    if (locales[name].parentLocale != null) {
                        locales[name] = locales[name].parentLocale;
                    } else if (locales[name] != null) {
                        delete locales[name];
                    }
                }
            }
            return locales[name];
        }

        // returns locale data
        function getLocale(key) {
            var locale;

            if (key && key._locale && key._locale._abbr) {
                key = key._locale._abbr;
            }

            if (!key) {
                return globalLocale;
            }

            if (!isArray(key)) {
                //short-circuit everything else
                locale = loadLocale(key);
                if (locale) {
                    return locale;
                }
                key = [key];
            }

            return chooseLocale(key);
        }

        function listLocales() {
            return keys(locales);
        }

        function checkOverflow(m) {
            var overflow;
            var a = m._a;

            if (a && getParsingFlags(m).overflow === -2) {
                overflow =
                    a[MONTH] < 0 || a[MONTH] > 11 ? MONTH :
                        a[DATE] < 1 || a[DATE] > daysInMonth(a[YEAR], a[MONTH]) ? DATE :
                            a[HOUR] < 0 || a[HOUR] > 24 || (a[HOUR] === 24 && (a[MINUTE] !== 0 || a[SECOND] !== 0 || a[MILLISECOND] !== 0)) ? HOUR :
                                a[MINUTE] < 0 || a[MINUTE] > 59 ? MINUTE :
                                    a[SECOND] < 0 || a[SECOND] > 59 ? SECOND :
                                        a[MILLISECOND] < 0 || a[MILLISECOND] > 999 ? MILLISECOND :
                                            -1;

                if (getParsingFlags(m)._overflowDayOfYear && (overflow < YEAR || overflow > DATE)) {
                    overflow = DATE;
                }
                if (getParsingFlags(m)._overflowWeeks && overflow === -1) {
                    overflow = WEEK;
                }
                if (getParsingFlags(m)._overflowWeekday && overflow === -1) {
                    overflow = WEEKDAY;
                }

                getParsingFlags(m).overflow = overflow;
            }

            return m;
        }

        // Pick the first defined of two or three arguments.
        function defaults(a, b, c) {
            if (a != null) {
                return a;
            }
            if (b != null) {
                return b;
            }
            return c;
        }

        function currentDateArray(config) {
            // hooks is actually the exported moment object
            var nowValue = new Date(hooks.now());
            if (config._useUTC) {
                return [nowValue.getUTCFullYear(), nowValue.getUTCMonth(), nowValue.getUTCDate()];
            }
            return [nowValue.getFullYear(), nowValue.getMonth(), nowValue.getDate()];
        }

        // convert an array to a date.
        // the array should mirror the parameters below
        // note: all values past the year are optional and will default to the lowest possible value.
        // [year, month, day , hour, minute, second, millisecond]
        function configFromArray(config) {
            var i, date, input = [], currentDate, expectedWeekday, yearToUse;

            if (config._d) {
                return;
            }

            currentDate = currentDateArray(config);

            //compute day of the year from weeks and weekdays
            if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
                dayOfYearFromWeekInfo(config);
            }

            //if the day of the year is set, figure out what it is
            if (config._dayOfYear != null) {
                yearToUse = defaults(config._a[YEAR], currentDate[YEAR]);

                if (config._dayOfYear > daysInYear(yearToUse) || config._dayOfYear === 0) {
                    getParsingFlags(config)._overflowDayOfYear = true;
                }

                date = createUTCDate(yearToUse, 0, config._dayOfYear);
                config._a[MONTH] = date.getUTCMonth();
                config._a[DATE] = date.getUTCDate();
            }

            // Default to current date.
            // * if no year, month, day of month are given, default to today
            // * if day of month is given, default month and year
            // * if month is given, default only year
            // * if year is given, don't default anything
            for (i = 0; i < 3 && config._a[i] == null; ++i) {
                config._a[i] = input[i] = currentDate[i];
            }

            // Zero out whatever was not defaulted, including time
            for (; i < 7; i++) {
                config._a[i] = input[i] = (config._a[i] == null) ? (i === 2 ? 1 : 0) : config._a[i];
            }

            // Check for 24:00:00.000
            if (config._a[HOUR] === 24 &&
                config._a[MINUTE] === 0 &&
                config._a[SECOND] === 0 &&
                config._a[MILLISECOND] === 0) {
                config._nextDay = true;
                config._a[HOUR] = 0;
            }

            config._d = (config._useUTC ? createUTCDate : createDate).apply(null, input);
            expectedWeekday = config._useUTC ? config._d.getUTCDay() : config._d.getDay();

            // Apply timezone offset from input. The actual utcOffset can be changed
            // with parseZone.
            if (config._tzm != null) {
                config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);
            }

            if (config._nextDay) {
                config._a[HOUR] = 24;
            }

            // check for mismatching day of week
            if (config._w && typeof config._w.d !== 'undefined' && config._w.d !== expectedWeekday) {
                getParsingFlags(config).weekdayMismatch = true;
            }
        }

        function dayOfYearFromWeekInfo(config) {
            var w, weekYear, week, weekday, dow, doy, temp, weekdayOverflow;

            w = config._w;
            if (w.GG != null || w.W != null || w.E != null) {
                dow = 1;
                doy = 4;

                // TODO: We need to take the current isoWeekYear, but that depends on
                // how we interpret now (local, utc, fixed offset). So create
                // a now version of current config (take local/utc/offset flags, and
                // create now).
                weekYear = defaults(w.GG, config._a[YEAR], weekOfYear(createLocal(), 1, 4).year);
                week = defaults(w.W, 1);
                weekday = defaults(w.E, 1);
                if (weekday < 1 || weekday > 7) {
                    weekdayOverflow = true;
                }
            } else {
                dow = config._locale._week.dow;
                doy = config._locale._week.doy;

                var curWeek = weekOfYear(createLocal(), dow, doy);

                weekYear = defaults(w.gg, config._a[YEAR], curWeek.year);

                // Default to current week.
                week = defaults(w.w, curWeek.week);

                if (w.d != null) {
                    // weekday -- low day numbers are considered next week
                    weekday = w.d;
                    if (weekday < 0 || weekday > 6) {
                        weekdayOverflow = true;
                    }
                } else if (w.e != null) {
                    // local weekday -- counting starts from begining of week
                    weekday = w.e + dow;
                    if (w.e < 0 || w.e > 6) {
                        weekdayOverflow = true;
                    }
                } else {
                    // default to begining of week
                    weekday = dow;
                }
            }
            if (week < 1 || week > weeksInYear(weekYear, dow, doy)) {
                getParsingFlags(config)._overflowWeeks = true;
            } else if (weekdayOverflow != null) {
                getParsingFlags(config)._overflowWeekday = true;
            } else {
                temp = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy);
                config._a[YEAR] = temp.year;
                config._dayOfYear = temp.dayOfYear;
            }
        }

        // iso 8601 regex
        // 0000-00-00 0000-W00 or 0000-W00-0 + T + 00 or 00:00 or 00:00:00 or 00:00:00.000 + +00:00 or +0000 or +00)
        var extendedIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/;
        var basicIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([\+\-]\d\d(?::?\d\d)?|\s*Z)?)?$/;

        var tzRegex = /Z|[+-]\d\d(?::?\d\d)?/;

        var isoDates = [
            ['YYYYYY-MM-DD', /[+-]\d{6}-\d\d-\d\d/],
            ['YYYY-MM-DD', /\d{4}-\d\d-\d\d/],
            ['GGGG-[W]WW-E', /\d{4}-W\d\d-\d/],
            ['GGGG-[W]WW', /\d{4}-W\d\d/, false],
            ['YYYY-DDD', /\d{4}-\d{3}/],
            ['YYYY-MM', /\d{4}-\d\d/, false],
            ['YYYYYYMMDD', /[+-]\d{10}/],
            ['YYYYMMDD', /\d{8}/],
            // YYYYMM is NOT allowed by the standard
            ['GGGG[W]WWE', /\d{4}W\d{3}/],
            ['GGGG[W]WW', /\d{4}W\d{2}/, false],
            ['YYYYDDD', /\d{7}/]
        ];

        // iso time formats and regexes
        var isoTimes = [
            ['HH:mm:ss.SSSS', /\d\d:\d\d:\d\d\.\d+/],
            ['HH:mm:ss,SSSS', /\d\d:\d\d:\d\d,\d+/],
            ['HH:mm:ss', /\d\d:\d\d:\d\d/],
            ['HH:mm', /\d\d:\d\d/],
            ['HHmmss.SSSS', /\d\d\d\d\d\d\.\d+/],
            ['HHmmss,SSSS', /\d\d\d\d\d\d,\d+/],
            ['HHmmss', /\d\d\d\d\d\d/],
            ['HHmm', /\d\d\d\d/],
            ['HH', /\d\d/]
        ];

        var aspNetJsonRegex = /^\/?Date\((\-?\d+)/i;

        // date from iso format
        function configFromISO(config) {
            var i, l,
                string = config._i,
                match = extendedIsoRegex.exec(string) || basicIsoRegex.exec(string),
                allowTime, dateFormat, timeFormat, tzFormat;

            if (match) {
                getParsingFlags(config).iso = true;

                for (i = 0, l = isoDates.length; i < l; i++) {
                    if (isoDates[i][1].exec(match[1])) {
                        dateFormat = isoDates[i][0];
                        allowTime = isoDates[i][2] !== false;
                        break;
                    }
                }
                if (dateFormat == null) {
                    config._isValid = false;
                    return;
                }
                if (match[3]) {
                    for (i = 0, l = isoTimes.length; i < l; i++) {
                        if (isoTimes[i][1].exec(match[3])) {
                            // match[2] should be 'T' or space
                            timeFormat = (match[2] || ' ') + isoTimes[i][0];
                            break;
                        }
                    }
                    if (timeFormat == null) {
                        config._isValid = false;
                        return;
                    }
                }
                if (!allowTime && timeFormat != null) {
                    config._isValid = false;
                    return;
                }
                if (match[4]) {
                    if (tzRegex.exec(match[4])) {
                        tzFormat = 'Z';
                    } else {
                        config._isValid = false;
                        return;
                    }
                }
                config._f = dateFormat + (timeFormat || '') + (tzFormat || '');
                configFromStringAndFormat(config);
            } else {
                config._isValid = false;
            }
        }

        // RFC 2822 regex: For details see https://tools.ietf.org/html/rfc2822#section-3.3
        var rfc2822 = /^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s)?(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{2,4})\s(\d\d):(\d\d)(?::(\d\d))?\s(?:(UT|GMT|[ECMP][SD]T)|([Zz])|([+-]\d{4}))$/;

        function extractFromRFC2822Strings(yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr) {
            var result = [
                untruncateYear(yearStr),
                defaultLocaleMonthsShort.indexOf(monthStr),
                parseInt(dayStr, 10),
                parseInt(hourStr, 10),
                parseInt(minuteStr, 10)
            ];

            if (secondStr) {
                result.push(parseInt(secondStr, 10));
            }

            return result;
        }

        function untruncateYear(yearStr) {
            var year = parseInt(yearStr, 10);
            if (year <= 49) {
                return 2000 + year;
            } else if (year <= 999) {
                return 1900 + year;
            }
            return year;
        }

        function preprocessRFC2822(s) {
            // Remove comments and folding whitespace and replace multiple-spaces with a single space
            return s.replace(/\([^)]*\)|[\n\t]/g, ' ').replace(/(\s\s+)/g, ' ').trim();
        }

        function checkWeekday(weekdayStr, parsedInput, config) {
            if (weekdayStr) {
                // TODO: Replace the vanilla JS Date object with an indepentent day-of-week check.
                var weekdayProvided = defaultLocaleWeekdaysShort.indexOf(weekdayStr),
                    weekdayActual = new Date(parsedInput[0], parsedInput[1], parsedInput[2]).getDay();
                if (weekdayProvided !== weekdayActual) {
                    getParsingFlags(config).weekdayMismatch = true;
                    config._isValid = false;
                    return false;
                }
            }
            return true;
        }

        var obsOffsets = {
            UT: 0,
            GMT: 0,
            EDT: -4 * 60,
            EST: -5 * 60,
            CDT: -5 * 60,
            CST: -6 * 60,
            MDT: -6 * 60,
            MST: -7 * 60,
            PDT: -7 * 60,
            PST: -8 * 60
        };

        function calculateOffset(obsOffset, militaryOffset, numOffset) {
            if (obsOffset) {
                return obsOffsets[obsOffset];
            } else if (militaryOffset) {
                // the only allowed military tz is Z
                return 0;
            } else {
                var hm = parseInt(numOffset, 10);
                var m = hm % 100, h = (hm - m) / 100;
                return h * 60 + m;
            }
        }

        // date and time from ref 2822 format
        function configFromRFC2822(config) {
            var match = rfc2822.exec(preprocessRFC2822(config._i));
            if (match) {
                var parsedArray = extractFromRFC2822Strings(match[4], match[3], match[2], match[5], match[6], match[7]);
                if (!checkWeekday(match[1], parsedArray, config)) {
                    return;
                }

                config._a = parsedArray;
                config._tzm = calculateOffset(match[8], match[9], match[10]);

                config._d = createUTCDate.apply(null, config._a);
                config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);

                getParsingFlags(config).rfc2822 = true;
            } else {
                config._isValid = false;
            }
        }

        // date from iso format or fallback
        function configFromString(config) {
            var matched = aspNetJsonRegex.exec(config._i);

            if (matched !== null) {
                config._d = new Date(+matched[1]);
                return;
            }

            configFromISO(config);
            if (config._isValid === false) {
                delete config._isValid;
            } else {
                return;
            }

            configFromRFC2822(config);
            if (config._isValid === false) {
                delete config._isValid;
            } else {
                return;
            }

            // Final attempt, use Input Fallback
            hooks.createFromInputFallback(config);
        }

        hooks.createFromInputFallback = deprecate(
            'value provided is not in a recognized RFC2822 or ISO format. moment construction falls back to js Date(), ' +
            'which is not reliable across all browsers and versions. Non RFC2822/ISO date formats are ' +
            'discouraged and will be removed in an upcoming major release. Please refer to ' +
            'http://momentjs.com/guides/#/warnings/js-date/ for more info.',
            function (config) {
                config._d = new Date(config._i + (config._useUTC ? ' UTC' : ''));
            }
        );

        // constant that refers to the ISO standard
        hooks.ISO_8601 = function () { };

        // constant that refers to the RFC 2822 form
        hooks.RFC_2822 = function () { };

        // date from string and format string
        function configFromStringAndFormat(config) {
            // TODO: Move this to another part of the creation flow to prevent circular deps
            if (config._f === hooks.ISO_8601) {
                configFromISO(config);
                return;
            }
            if (config._f === hooks.RFC_2822) {
                configFromRFC2822(config);
                return;
            }
            config._a = [];
            getParsingFlags(config).empty = true;

            // This array is used to make a Date, either with `new Date` or `Date.UTC`
            var string = '' + config._i,
                i, parsedInput, tokens, token, skipped,
                stringLength = string.length,
                totalParsedInputLength = 0;

            tokens = expandFormat(config._f, config._locale).match(formattingTokens) || [];

            for (i = 0; i < tokens.length; i++) {
                token = tokens[i];
                parsedInput = (string.match(getParseRegexForToken(token, config)) || [])[0];
                // console.log('token', token, 'parsedInput', parsedInput,
                //         'regex', getParseRegexForToken(token, config));
                if (parsedInput) {
                    skipped = string.substr(0, string.indexOf(parsedInput));
                    if (skipped.length > 0) {
                        getParsingFlags(config).unusedInput.push(skipped);
                    }
                    string = string.slice(string.indexOf(parsedInput) + parsedInput.length);
                    totalParsedInputLength += parsedInput.length;
                }
                // don't parse if it's not a known token
                if (formatTokenFunctions[token]) {
                    if (parsedInput) {
                        getParsingFlags(config).empty = false;
                    }
                    else {
                        getParsingFlags(config).unusedTokens.push(token);
                    }
                    addTimeToArrayFromToken(token, parsedInput, config);
                }
                else if (config._strict && !parsedInput) {
                    getParsingFlags(config).unusedTokens.push(token);
                }
            }

            // add remaining unparsed input length to the string
            getParsingFlags(config).charsLeftOver = stringLength - totalParsedInputLength;
            if (string.length > 0) {
                getParsingFlags(config).unusedInput.push(string);
            }

            // clear _12h flag if hour is <= 12
            if (config._a[HOUR] <= 12 &&
                getParsingFlags(config).bigHour === true &&
                config._a[HOUR] > 0) {
                getParsingFlags(config).bigHour = undefined;
            }

            getParsingFlags(config).parsedDateParts = config._a.slice(0);
            getParsingFlags(config).meridiem = config._meridiem;
            // handle meridiem
            config._a[HOUR] = meridiemFixWrap(config._locale, config._a[HOUR], config._meridiem);

            configFromArray(config);
            checkOverflow(config);
        }


        function meridiemFixWrap(locale, hour, meridiem) {
            var isPm;

            if (meridiem == null) {
                // nothing to do
                return hour;
            }
            if (locale.meridiemHour != null) {
                return locale.meridiemHour(hour, meridiem);
            } else if (locale.isPM != null) {
                // Fallback
                isPm = locale.isPM(meridiem);
                if (isPm && hour < 12) {
                    hour += 12;
                }
                if (!isPm && hour === 12) {
                    hour = 0;
                }
                return hour;
            } else {
                // this is not supposed to happen
                return hour;
            }
        }

        // date from string and array of format strings
        function configFromStringAndArray(config) {
            var tempConfig,
                bestMoment,

                scoreToBeat,
                i,
                currentScore;

            if (config._f.length === 0) {
                getParsingFlags(config).invalidFormat = true;
                config._d = new Date(NaN);
                return;
            }

            for (i = 0; i < config._f.length; i++) {
                currentScore = 0;
                tempConfig = copyConfig({}, config);
                if (config._useUTC != null) {
                    tempConfig._useUTC = config._useUTC;
                }
                tempConfig._f = config._f[i];
                configFromStringAndFormat(tempConfig);

                if (!isValid(tempConfig)) {
                    continue;
                }

                // if there is any input that was not parsed add a penalty for that format
                currentScore += getParsingFlags(tempConfig).charsLeftOver;

                //or tokens
                currentScore += getParsingFlags(tempConfig).unusedTokens.length * 10;

                getParsingFlags(tempConfig).score = currentScore;

                if (scoreToBeat == null || currentScore < scoreToBeat) {
                    scoreToBeat = currentScore;
                    bestMoment = tempConfig;
                }
            }

            extend(config, bestMoment || tempConfig);
        }

        function configFromObject(config) {
            if (config._d) {
                return;
            }

            var i = normalizeObjectUnits(config._i);
            config._a = map([i.year, i.month, i.day || i.date, i.hour, i.minute, i.second, i.millisecond], function (obj) {
                return obj && parseInt(obj, 10);
            });

            configFromArray(config);
        }

        function createFromConfig(config) {
            var res = new Moment(checkOverflow(prepareConfig(config)));
            if (res._nextDay) {
                // Adding is smart enough around DST
                res.add(1, 'd');
                res._nextDay = undefined;
            }

            return res;
        }

        function prepareConfig(config) {
            var input = config._i,
                format = config._f;

            config._locale = config._locale || getLocale(config._l);

            if (input === null || (format === undefined && input === '')) {
                return createInvalid({ nullInput: true });
            }

            if (typeof input === 'string') {
                config._i = input = config._locale.preparse(input);
            }

            if (isMoment(input)) {
                return new Moment(checkOverflow(input));
            } else if (isDate(input)) {
                config._d = input;
            } else if (isArray(format)) {
                configFromStringAndArray(config);
            } else if (format) {
                configFromStringAndFormat(config);
            } else {
                configFromInput(config);
            }

            if (!isValid(config)) {
                config._d = null;
            }

            return config;
        }

        function configFromInput(config) {
            var input = config._i;
            if (isUndefined(input)) {
                config._d = new Date(hooks.now());
            } else if (isDate(input)) {
                config._d = new Date(input.valueOf());
            } else if (typeof input === 'string') {
                configFromString(config);
            } else if (isArray(input)) {
                config._a = map(input.slice(0), function (obj) {
                    return parseInt(obj, 10);
                });
                configFromArray(config);
            } else if (isObject(input)) {
                configFromObject(config);
            } else if (isNumber(input)) {
                // from milliseconds
                config._d = new Date(input);
            } else {
                hooks.createFromInputFallback(config);
            }
        }

        function createLocalOrUTC(input, format, locale, strict, isUTC) {
            var c = {};

            if (locale === true || locale === false) {
                strict = locale;
                locale = undefined;
            }

            if ((isObject(input) && isObjectEmpty(input)) ||
                (isArray(input) && input.length === 0)) {
                input = undefined;
            }
            // object construction must be done this way.
            // https://github.com/moment/moment/issues/1423
            c._isAMomentObject = true;
            c._useUTC = c._isUTC = isUTC;
            c._l = locale;
            c._i = input;
            c._f = format;
            c._strict = strict;

            return createFromConfig(c);
        }

        function createLocal(input, format, locale, strict) {
            return createLocalOrUTC(input, format, locale, strict, false);
        }

        var prototypeMin = deprecate(
            'moment().min is deprecated, use moment.max instead. http://momentjs.com/guides/#/warnings/min-max/',
            function () {
                var other = createLocal.apply(null, arguments);
                if (this.isValid() && other.isValid()) {
                    return other < this ? this : other;
                } else {
                    return createInvalid();
                }
            }
        );

        var prototypeMax = deprecate(
            'moment().max is deprecated, use moment.min instead. http://momentjs.com/guides/#/warnings/min-max/',
            function () {
                var other = createLocal.apply(null, arguments);
                if (this.isValid() && other.isValid()) {
                    return other > this ? this : other;
                } else {
                    return createInvalid();
                }
            }
        );

        // Pick a moment m from moments so that m[fn](other) is true for all
        // other. This relies on the function fn to be transitive.
        //
        // moments should either be an array of moment objects or an array, whose
        // first element is an array of moment objects.
        function pickBy(fn, moments) {
            var res, i;
            if (moments.length === 1 && isArray(moments[0])) {
                moments = moments[0];
            }
            if (!moments.length) {
                return createLocal();
            }
            res = moments[0];
            for (i = 1; i < moments.length; ++i) {
                if (!moments[i].isValid() || moments[i][fn](res)) {
                    res = moments[i];
                }
            }
            return res;
        }

        // TODO: Use [].sort instead?
        function min() {
            var args = [].slice.call(arguments, 0);

            return pickBy('isBefore', args);
        }

        function max() {
            var args = [].slice.call(arguments, 0);

            return pickBy('isAfter', args);
        }

        var now = function () {
            return Date.now ? Date.now() : +(new Date());
        };

        var ordering = ['year', 'quarter', 'month', 'week', 'day', 'hour', 'minute', 'second', 'millisecond'];

        function isDurationValid(m) {
            for (var key in m) {
                if (!(indexOf.call(ordering, key) !== -1 && (m[key] == null || !isNaN(m[key])))) {
                    return false;
                }
            }

            var unitHasDecimal = false;
            for (var i = 0; i < ordering.length; ++i) {
                if (m[ordering[i]]) {
                    if (unitHasDecimal) {
                        return false; // only allow non-integers for smallest unit
                    }
                    if (parseFloat(m[ordering[i]]) !== toInt(m[ordering[i]])) {
                        unitHasDecimal = true;
                    }
                }
            }

            return true;
        }

        function isValid$1() {
            return this._isValid;
        }

        function createInvalid$1() {
            return createDuration(NaN);
        }

        function Duration(duration) {
            var normalizedInput = normalizeObjectUnits(duration),
                years = normalizedInput.year || 0,
                quarters = normalizedInput.quarter || 0,
                months = normalizedInput.month || 0,
                weeks = normalizedInput.week || 0,
                days = normalizedInput.day || 0,
                hours = normalizedInput.hour || 0,
                minutes = normalizedInput.minute || 0,
                seconds = normalizedInput.second || 0,
                milliseconds = normalizedInput.millisecond || 0;

            this._isValid = isDurationValid(normalizedInput);

            // representation for dateAddRemove
            this._milliseconds = +milliseconds +
                seconds * 1e3 + // 1000
                minutes * 6e4 + // 1000 * 60
                hours * 1000 * 60 * 60; //using 1000 * 60 * 60 instead of 36e5 to avoid floating point rounding errors https://github.com/moment/moment/issues/2978
            // Because of dateAddRemove treats 24 hours as different from a
            // day when working around DST, we need to store them separately
            this._days = +days +
                weeks * 7;
            // It is impossible to translate months into days without knowing
            // which months you are are talking about, so we have to store
            // it separately.
            this._months = +months +
                quarters * 3 +
                years * 12;

            this._data = {};

            this._locale = getLocale();

            this._bubble();
        }

        function isDuration(obj) {
            return obj instanceof Duration;
        }

        function absRound(number) {
            if (number < 0) {
                return Math.round(-1 * number) * -1;
            } else {
                return Math.round(number);
            }
        }

        // FORMATTING

        function offset(token, separator) {
            addFormatToken(token, 0, 0, function () {
                var offset = this.utcOffset();
                var sign = '+';
                if (offset < 0) {
                    offset = -offset;
                    sign = '-';
                }
                return sign + zeroFill(~~(offset / 60), 2) + separator + zeroFill(~~(offset) % 60, 2);
            });
        }

        offset('Z', ':');
        offset('ZZ', '');

        // PARSING

        addRegexToken('Z', matchShortOffset);
        addRegexToken('ZZ', matchShortOffset);
        addParseToken(['Z', 'ZZ'], function (input, array, config) {
            config._useUTC = true;
            config._tzm = offsetFromString(matchShortOffset, input);
        });

        // HELPERS

        // timezone chunker
        // '+10:00' > ['10',  '00']
        // '-1530'  > ['-15', '30']
        var chunkOffset = /([\+\-]|\d\d)/gi;

        function offsetFromString(matcher, string) {
            var matches = (string || '').match(matcher);

            if (matches === null) {
                return null;
            }

            var chunk = matches[matches.length - 1] || [];
            var parts = (chunk + '').match(chunkOffset) || ['-', 0, 0];
            var minutes = +(parts[1] * 60) + toInt(parts[2]);

            return minutes === 0 ?
                0 :
                parts[0] === '+' ? minutes : -minutes;
        }

        // Return a moment from input, that is local/utc/zone equivalent to model.
        function cloneWithOffset(input, model) {
            var res, diff;
            if (model._isUTC) {
                res = model.clone();
                diff = (isMoment(input) || isDate(input) ? input.valueOf() : createLocal(input).valueOf()) - res.valueOf();
                // Use low-level api, because this fn is low-level api.
                res._d.setTime(res._d.valueOf() + diff);
                hooks.updateOffset(res, false);
                return res;
            } else {
                return createLocal(input).local();
            }
        }

        function getDateOffset(m) {
            // On Firefox.24 Date#getTimezoneOffset returns a floating point.
            // https://github.com/moment/moment/pull/1871
            return -Math.round(m._d.getTimezoneOffset() / 15) * 15;
        }

        // HOOKS

        // This function will be called whenever a moment is mutated.
        // It is intended to keep the offset in sync with the timezone.
        hooks.updateOffset = function () { };

        // MOMENTS

        // keepLocalTime = true means only change the timezone, without
        // affecting the local hour. So 5:31:26 +0300 --[utcOffset(2, true)]-->
        // 5:31:26 +0200 It is possible that 5:31:26 doesn't exist with offset
        // +0200, so we adjust the time as needed, to be valid.
        //
        // Keeping the time actually adds/subtracts (one hour)
        // from the actual represented time. That is why we call updateOffset
        // a second time. In case it wants us to change the offset again
        // _changeInProgress == true case, then we have to adjust, because
        // there is no such time in the given timezone.
        function getSetOffset(input, keepLocalTime, keepMinutes) {
            var offset = this._offset || 0,
                localAdjust;
            if (!this.isValid()) {
                return input != null ? this : NaN;
            }
            if (input != null) {
                if (typeof input === 'string') {
                    input = offsetFromString(matchShortOffset, input);
                    if (input === null) {
                        return this;
                    }
                } else if (Math.abs(input) < 16 && !keepMinutes) {
                    input = input * 60;
                }
                if (!this._isUTC && keepLocalTime) {
                    localAdjust = getDateOffset(this);
                }
                this._offset = input;
                this._isUTC = true;
                if (localAdjust != null) {
                    this.add(localAdjust, 'm');
                }
                if (offset !== input) {
                    if (!keepLocalTime || this._changeInProgress) {
                        addSubtract(this, createDuration(input - offset, 'm'), 1, false);
                    } else if (!this._changeInProgress) {
                        this._changeInProgress = true;
                        hooks.updateOffset(this, true);
                        this._changeInProgress = null;
                    }
                }
                return this;
            } else {
                return this._isUTC ? offset : getDateOffset(this);
            }
        }

        function getSetZone(input, keepLocalTime) {
            if (input != null) {
                if (typeof input !== 'string') {
                    input = -input;
                }

                this.utcOffset(input, keepLocalTime);

                return this;
            } else {
                return -this.utcOffset();
            }
        }

        function setOffsetToUTC(keepLocalTime) {
            return this.utcOffset(0, keepLocalTime);
        }

        function setOffsetToLocal(keepLocalTime) {
            if (this._isUTC) {
                this.utcOffset(0, keepLocalTime);
                this._isUTC = false;

                if (keepLocalTime) {
                    this.subtract(getDateOffset(this), 'm');
                }
            }
            return this;
        }

        function setOffsetToParsedOffset() {
            if (this._tzm != null) {
                this.utcOffset(this._tzm, false, true);
            } else if (typeof this._i === 'string') {
                var tZone = offsetFromString(matchOffset, this._i);
                if (tZone != null) {
                    this.utcOffset(tZone);
                }
                else {
                    this.utcOffset(0, true);
                }
            }
            return this;
        }

        function hasAlignedHourOffset(input) {
            if (!this.isValid()) {
                return false;
            }
            input = input ? createLocal(input).utcOffset() : 0;

            return (this.utcOffset() - input) % 60 === 0;
        }

        function isDaylightSavingTime() {
            return (
                this.utcOffset() > this.clone().month(0).utcOffset() ||
                this.utcOffset() > this.clone().month(5).utcOffset()
            );
        }

        function isDaylightSavingTimeShifted() {
            if (!isUndefined(this._isDSTShifted)) {
                return this._isDSTShifted;
            }

            var c = {};

            copyConfig(c, this);
            c = prepareConfig(c);

            if (c._a) {
                var other = c._isUTC ? createUTC(c._a) : createLocal(c._a);
                this._isDSTShifted = this.isValid() &&
                    compareArrays(c._a, other.toArray()) > 0;
            } else {
                this._isDSTShifted = false;
            }

            return this._isDSTShifted;
        }

        function isLocal() {
            return this.isValid() ? !this._isUTC : false;
        }

        function isUtcOffset() {
            return this.isValid() ? this._isUTC : false;
        }

        function isUtc() {
            return this.isValid() ? this._isUTC && this._offset === 0 : false;
        }

        // ASP.NET json date format regex
        var aspNetRegex = /^(\-|\+)?(?:(\d*)[. ])?(\d+)\:(\d+)(?:\:(\d+)(\.\d*)?)?$/;

        // from http://docs.closure-library.googlecode.com/git/closure_goog_date_date.js.source.html
        // somewhat more in line with 4.4.3.2 2004 spec, but allows decimal anywhere
        // and further modified to allow for strings containing both week and day
        var isoRegex = /^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/;

        function createDuration(input, key) {
            var duration = input,
                // matching against regexp is expensive, do it on demand
                match = null,
                sign,
                ret,
                diffRes;

            if (isDuration(input)) {
                duration = {
                    ms: input._milliseconds,
                    d: input._days,
                    M: input._months
                };
            } else if (isNumber(input)) {
                duration = {};
                if (key) {
                    duration[key] = input;
                } else {
                    duration.milliseconds = input;
                }
            } else if (!!(match = aspNetRegex.exec(input))) {
                sign = (match[1] === '-') ? -1 : 1;
                duration = {
                    y: 0,
                    d: toInt(match[DATE]) * sign,
                    h: toInt(match[HOUR]) * sign,
                    m: toInt(match[MINUTE]) * sign,
                    s: toInt(match[SECOND]) * sign,
                    ms: toInt(absRound(match[MILLISECOND] * 1000)) * sign // the millisecond decimal point is included in the match
                };
            } else if (!!(match = isoRegex.exec(input))) {
                sign = (match[1] === '-') ? -1 : (match[1] === '+') ? 1 : 1;
                duration = {
                    y: parseIso(match[2], sign),
                    M: parseIso(match[3], sign),
                    w: parseIso(match[4], sign),
                    d: parseIso(match[5], sign),
                    h: parseIso(match[6], sign),
                    m: parseIso(match[7], sign),
                    s: parseIso(match[8], sign)
                };
            } else if (duration == null) {// checks for null or undefined
                duration = {};
            } else if (typeof duration === 'object' && ('from' in duration || 'to' in duration)) {
                diffRes = momentsDifference(createLocal(duration.from), createLocal(duration.to));

                duration = {};
                duration.ms = diffRes.milliseconds;
                duration.M = diffRes.months;
            }

            ret = new Duration(duration);

            if (isDuration(input) && hasOwnProp(input, '_locale')) {
                ret._locale = input._locale;
            }

            return ret;
        }

        createDuration.fn = Duration.prototype;
        createDuration.invalid = createInvalid$1;

        function parseIso(inp, sign) {
            // We'd normally use ~~inp for this, but unfortunately it also
            // converts floats to ints.
            // inp may be undefined, so careful calling replace on it.
            var res = inp && parseFloat(inp.replace(',', '.'));
            // apply sign while we're at it
            return (isNaN(res) ? 0 : res) * sign;
        }

        function positiveMomentsDifference(base, other) {
            var res = { milliseconds: 0, months: 0 };

            res.months = other.month() - base.month() +
                (other.year() - base.year()) * 12;
            if (base.clone().add(res.months, 'M').isAfter(other)) {
                --res.months;
            }

            res.milliseconds = +other - +(base.clone().add(res.months, 'M'));

            return res;
        }

        function momentsDifference(base, other) {
            var res;
            if (!(base.isValid() && other.isValid())) {
                return { milliseconds: 0, months: 0 };
            }

            other = cloneWithOffset(other, base);
            if (base.isBefore(other)) {
                res = positiveMomentsDifference(base, other);
            } else {
                res = positiveMomentsDifference(other, base);
                res.milliseconds = -res.milliseconds;
                res.months = -res.months;
            }

            return res;
        }

        // TODO: remove 'name' arg after deprecation is removed
        function createAdder(direction, name) {
            return function (val, period) {
                var dur, tmp;
                //invert the arguments, but complain about it
                if (period !== null && !isNaN(+period)) {
                    deprecateSimple(name, 'moment().' + name + '(period, number) is deprecated. Please use moment().' + name + '(number, period). ' +
                        'See http://momentjs.com/guides/#/warnings/add-inverted-param/ for more info.');
                    tmp = val; val = period; period = tmp;
                }

                val = typeof val === 'string' ? +val : val;
                dur = createDuration(val, period);
                addSubtract(this, dur, direction);
                return this;
            };
        }

        function addSubtract(mom, duration, isAdding, updateOffset) {
            var milliseconds = duration._milliseconds,
                days = absRound(duration._days),
                months = absRound(duration._months);

            if (!mom.isValid()) {
                // No op
                return;
            }

            updateOffset = updateOffset == null ? true : updateOffset;

            if (months) {
                setMonth(mom, get(mom, 'Month') + months * isAdding);
            }
            if (days) {
                set$1(mom, 'Date', get(mom, 'Date') + days * isAdding);
            }
            if (milliseconds) {
                mom._d.setTime(mom._d.valueOf() + milliseconds * isAdding);
            }
            if (updateOffset) {
                hooks.updateOffset(mom, days || months);
            }
        }

        var add = createAdder(1, 'add');
        var subtract = createAdder(-1, 'subtract');

        function getCalendarFormat(myMoment, now) {
            var diff = myMoment.diff(now, 'days', true);
            return diff < -6 ? 'sameElse' :
                diff < -1 ? 'lastWeek' :
                    diff < 0 ? 'lastDay' :
                        diff < 1 ? 'sameDay' :
                            diff < 2 ? 'nextDay' :
                                diff < 7 ? 'nextWeek' : 'sameElse';
        }

        function calendar$1(time, formats) {
            // We want to compare the start of today, vs this.
            // Getting start-of-today depends on whether we're local/utc/offset or not.
            var now = time || createLocal(),
                sod = cloneWithOffset(now, this).startOf('day'),
                format = hooks.calendarFormat(this, sod) || 'sameElse';

            var output = formats && (isFunction(formats[format]) ? formats[format].call(this, now) : formats[format]);

            return this.format(output || this.localeData().calendar(format, this, createLocal(now)));
        }

        function clone() {
            return new Moment(this);
        }

        function isAfter(input, units) {
            var localInput = isMoment(input) ? input : createLocal(input);
            if (!(this.isValid() && localInput.isValid())) {
                return false;
            }
            units = normalizeUnits(!isUndefined(units) ? units : 'millisecond');
            if (units === 'millisecond') {
                return this.valueOf() > localInput.valueOf();
            } else {
                return localInput.valueOf() < this.clone().startOf(units).valueOf();
            }
        }

        function isBefore(input, units) {
            var localInput = isMoment(input) ? input : createLocal(input);
            if (!(this.isValid() && localInput.isValid())) {
                return false;
            }
            units = normalizeUnits(!isUndefined(units) ? units : 'millisecond');
            if (units === 'millisecond') {
                return this.valueOf() < localInput.valueOf();
            } else {
                return this.clone().endOf(units).valueOf() < localInput.valueOf();
            }
        }

        function isBetween(from, to, units, inclusivity) {
            inclusivity = inclusivity || '()';
            return (inclusivity[0] === '(' ? this.isAfter(from, units) : !this.isBefore(from, units)) &&
                (inclusivity[1] === ')' ? this.isBefore(to, units) : !this.isAfter(to, units));
        }

        function isSame(input, units) {
            var localInput = isMoment(input) ? input : createLocal(input),
                inputMs;
            if (!(this.isValid() && localInput.isValid())) {
                return false;
            }
            units = normalizeUnits(units || 'millisecond');
            if (units === 'millisecond') {
                return this.valueOf() === localInput.valueOf();
            } else {
                inputMs = localInput.valueOf();
                return this.clone().startOf(units).valueOf() <= inputMs && inputMs <= this.clone().endOf(units).valueOf();
            }
        }

        function isSameOrAfter(input, units) {
            return this.isSame(input, units) || this.isAfter(input, units);
        }

        function isSameOrBefore(input, units) {
            return this.isSame(input, units) || this.isBefore(input, units);
        }

        function diff(input, units, asFloat) {
            var that,
                zoneDelta,
                delta, output;

            if (!this.isValid()) {
                return NaN;
            }

            that = cloneWithOffset(input, this);

            if (!that.isValid()) {
                return NaN;
            }

            zoneDelta = (that.utcOffset() - this.utcOffset()) * 6e4;

            units = normalizeUnits(units);

            switch (units) {
                case 'year': output = monthDiff(this, that) / 12; break;
                case 'month': output = monthDiff(this, that); break;
                case 'quarter': output = monthDiff(this, that) / 3; break;
                case 'second': output = (this - that) / 1e3; break; // 1000
                case 'minute': output = (this - that) / 6e4; break; // 1000 * 60
                case 'hour': output = (this - that) / 36e5; break; // 1000 * 60 * 60
                case 'day': output = (this - that - zoneDelta) / 864e5; break; // 1000 * 60 * 60 * 24, negate dst
                case 'week': output = (this - that - zoneDelta) / 6048e5; break; // 1000 * 60 * 60 * 24 * 7, negate dst
                default: output = this - that;
            }

            return asFloat ? output : absFloor(output);
        }

        function monthDiff(a, b) {
            // difference in months
            var wholeMonthDiff = ((b.year() - a.year()) * 12) + (b.month() - a.month()),
                // b is in (anchor - 1 month, anchor + 1 month)
                anchor = a.clone().add(wholeMonthDiff, 'months'),
                anchor2, adjust;

            if (b - anchor < 0) {
                anchor2 = a.clone().add(wholeMonthDiff - 1, 'months');
                // linear across the month
                adjust = (b - anchor) / (anchor - anchor2);
            } else {
                anchor2 = a.clone().add(wholeMonthDiff + 1, 'months');
                // linear across the month
                adjust = (b - anchor) / (anchor2 - anchor);
            }

            //check for negative zero, return zero if negative zero
            return -(wholeMonthDiff + adjust) || 0;
        }

        hooks.defaultFormat = 'YYYY-MM-DDTHH:mm:ssZ';
        hooks.defaultFormatUtc = 'YYYY-MM-DDTHH:mm:ss[Z]';

        function toString() {
            return this.clone().locale('en').format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
        }

        function toISOString(keepOffset) {
            if (!this.isValid()) {
                return null;
            }
            var utc = keepOffset !== true;
            var m = utc ? this.clone().utc() : this;
            if (m.year() < 0 || m.year() > 9999) {
                return formatMoment(m, utc ? 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]' : 'YYYYYY-MM-DD[T]HH:mm:ss.SSSZ');
            }
            if (isFunction(Date.prototype.toISOString)) {
                // native implementation is ~50x faster, use it when we can
                if (utc) {
                    return this.toDate().toISOString();
                } else {
                    return new Date(this._d.valueOf()).toISOString().replace('Z', formatMoment(m, 'Z'));
                }
            }
            return formatMoment(m, utc ? 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]' : 'YYYY-MM-DD[T]HH:mm:ss.SSSZ');
        }

        /**
         * Return a human readable representation of a moment that can
         * also be evaluated to get a new moment which is the same
         *
         * @link https://nodejs.org/dist/latest/docs/api/util.html#util_custom_inspect_function_on_objects
         */
        function inspect() {
            if (!this.isValid()) {
                return 'moment.invalid(/* ' + this._i + ' */)';
            }
            var func = 'moment';
            var zone = '';
            if (!this.isLocal()) {
                func = this.utcOffset() === 0 ? 'moment.utc' : 'moment.parseZone';
                zone = 'Z';
            }
            var prefix = '[' + func + '("]';
            var year = (0 <= this.year() && this.year() <= 9999) ? 'YYYY' : 'YYYYYY';
            var datetime = '-MM-DD[T]HH:mm:ss.SSS';
            var suffix = zone + '[")]';

            return this.format(prefix + year + datetime + suffix);
        }

        function format(inputString) {
            if (!inputString) {
                inputString = this.isUtc() ? hooks.defaultFormatUtc : hooks.defaultFormat;
            }
            var output = formatMoment(this, inputString);
            return this.localeData().postformat(output);
        }

        function from(time, withoutSuffix) {
            if (this.isValid() &&
                ((isMoment(time) && time.isValid()) ||
                    createLocal(time).isValid())) {
                return createDuration({ to: this, from: time }).locale(this.locale()).humanize(!withoutSuffix);
            } else {
                return this.localeData().invalidDate();
            }
        }

        function fromNow(withoutSuffix) {
            return this.from(createLocal(), withoutSuffix);
        }

        function to(time, withoutSuffix) {
            if (this.isValid() &&
                ((isMoment(time) && time.isValid()) ||
                    createLocal(time).isValid())) {
                return createDuration({ from: this, to: time }).locale(this.locale()).humanize(!withoutSuffix);
            } else {
                return this.localeData().invalidDate();
            }
        }

        function toNow(withoutSuffix) {
            return this.to(createLocal(), withoutSuffix);
        }

        // If passed a locale key, it will set the locale for this
        // instance.  Otherwise, it will return the locale configuration
        // variables for this instance.
        function locale(key) {
            var newLocaleData;

            if (key === undefined) {
                return this._locale._abbr;
            } else {
                newLocaleData = getLocale(key);
                if (newLocaleData != null) {
                    this._locale = newLocaleData;
                }
                return this;
            }
        }

        var lang = deprecate(
            'moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.',
            function (key) {
                if (key === undefined) {
                    return this.localeData();
                } else {
                    return this.locale(key);
                }
            }
        );

        function localeData() {
            return this._locale;
        }

        function startOf(units) {
            units = normalizeUnits(units);
            // the following switch intentionally omits break keywords
            // to utilize falling through the cases.
            switch (units) {
                case 'year':
                    this.month(0);
                /* falls through */
                case 'quarter':
                case 'month':
                    this.date(1);
                /* falls through */
                case 'week':
                case 'isoWeek':
                case 'day':
                case 'date':
                    this.hours(0);
                /* falls through */
                case 'hour':
                    this.minutes(0);
                /* falls through */
                case 'minute':
                    this.seconds(0);
                /* falls through */
                case 'second':
                    this.milliseconds(0);
            }

            // weeks are a special case
            if (units === 'week') {
                this.weekday(0);
            }
            if (units === 'isoWeek') {
                this.isoWeekday(1);
            }

            // quarters are also special
            if (units === 'quarter') {
                this.month(Math.floor(this.month() / 3) * 3);
            }

            return this;
        }

        function endOf(units) {
            units = normalizeUnits(units);
            if (units === undefined || units === 'millisecond') {
                return this;
            }

            // 'date' is an alias for 'day', so it should be considered as such.
            if (units === 'date') {
                units = 'day';
            }

            return this.startOf(units).add(1, (units === 'isoWeek' ? 'week' : units)).subtract(1, 'ms');
        }

        function valueOf() {
            return this._d.valueOf() - ((this._offset || 0) * 60000);
        }

        function unix() {
            return Math.floor(this.valueOf() / 1000);
        }

        function toDate() {
            return new Date(this.valueOf());
        }

        function toArray() {
            var m = this;
            return [m.year(), m.month(), m.date(), m.hour(), m.minute(), m.second(), m.millisecond()];
        }

        function toObject() {
            var m = this;
            return {
                years: m.year(),
                months: m.month(),
                date: m.date(),
                hours: m.hours(),
                minutes: m.minutes(),
                seconds: m.seconds(),
                milliseconds: m.milliseconds()
            };
        }

        function toJSON() {
            // new Date(NaN).toJSON() === null
            return this.isValid() ? this.toISOString() : null;
        }

        function isValid$2() {
            return isValid(this);
        }

        function parsingFlags() {
            return extend({}, getParsingFlags(this));
        }

        function invalidAt() {
            return getParsingFlags(this).overflow;
        }

        function creationData() {
            return {
                input: this._i,
                format: this._f,
                locale: this._locale,
                isUTC: this._isUTC,
                strict: this._strict
            };
        }

        // FORMATTING

        addFormatToken(0, ['gg', 2], 0, function () {
            return this.weekYear() % 100;
        });

        addFormatToken(0, ['GG', 2], 0, function () {
            return this.isoWeekYear() % 100;
        });

        function addWeekYearFormatToken(token, getter) {
            addFormatToken(0, [token, token.length], 0, getter);
        }

        addWeekYearFormatToken('gggg', 'weekYear');
        addWeekYearFormatToken('ggggg', 'weekYear');
        addWeekYearFormatToken('GGGG', 'isoWeekYear');
        addWeekYearFormatToken('GGGGG', 'isoWeekYear');

        // ALIASES

        addUnitAlias('weekYear', 'gg');
        addUnitAlias('isoWeekYear', 'GG');

        // PRIORITY

        addUnitPriority('weekYear', 1);
        addUnitPriority('isoWeekYear', 1);


        // PARSING

        addRegexToken('G', matchSigned);
        addRegexToken('g', matchSigned);
        addRegexToken('GG', match1to2, match2);
        addRegexToken('gg', match1to2, match2);
        addRegexToken('GGGG', match1to4, match4);
        addRegexToken('gggg', match1to4, match4);
        addRegexToken('GGGGG', match1to6, match6);
        addRegexToken('ggggg', match1to6, match6);

        addWeekParseToken(['gggg', 'ggggg', 'GGGG', 'GGGGG'], function (input, week, config, token) {
            week[token.substr(0, 2)] = toInt(input);
        });

        addWeekParseToken(['gg', 'GG'], function (input, week, config, token) {
            week[token] = hooks.parseTwoDigitYear(input);
        });

        // MOMENTS

        function getSetWeekYear(input) {
            return getSetWeekYearHelper.call(this,
                input,
                this.week(),
                this.weekday(),
                this.localeData()._week.dow,
                this.localeData()._week.doy);
        }

        function getSetISOWeekYear(input) {
            return getSetWeekYearHelper.call(this,
                input, this.isoWeek(), this.isoWeekday(), 1, 4);
        }

        function getISOWeeksInYear() {
            return weeksInYear(this.year(), 1, 4);
        }

        function getWeeksInYear() {
            var weekInfo = this.localeData()._week;
            return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
        }

        function getSetWeekYearHelper(input, week, weekday, dow, doy) {
            var weeksTarget;
            if (input == null) {
                return weekOfYear(this, dow, doy).year;
            } else {
                weeksTarget = weeksInYear(input, dow, doy);
                if (week > weeksTarget) {
                    week = weeksTarget;
                }
                return setWeekAll.call(this, input, week, weekday, dow, doy);
            }
        }

        function setWeekAll(weekYear, week, weekday, dow, doy) {
            var dayOfYearData = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy),
                date = createUTCDate(dayOfYearData.year, 0, dayOfYearData.dayOfYear);

            this.year(date.getUTCFullYear());
            this.month(date.getUTCMonth());
            this.date(date.getUTCDate());
            return this;
        }

        // FORMATTING

        addFormatToken('Q', 0, 'Qo', 'quarter');

        // ALIASES

        addUnitAlias('quarter', 'Q');

        // PRIORITY

        addUnitPriority('quarter', 7);

        // PARSING

        addRegexToken('Q', match1);
        addParseToken('Q', function (input, array) {
            array[MONTH] = (toInt(input) - 1) * 3;
        });

        // MOMENTS

        function getSetQuarter(input) {
            return input == null ? Math.ceil((this.month() + 1) / 3) : this.month((input - 1) * 3 + this.month() % 3);
        }

        // FORMATTING

        addFormatToken('D', ['DD', 2], 'Do', 'date');

        // ALIASES

        addUnitAlias('date', 'D');

        // PRIOROITY
        addUnitPriority('date', 9);

        // PARSING

        addRegexToken('D', match1to2);
        addRegexToken('DD', match1to2, match2);
        addRegexToken('Do', function (isStrict, locale) {
            // TODO: Remove "ordinalParse" fallback in next major release.
            return isStrict ?
                (locale._dayOfMonthOrdinalParse || locale._ordinalParse) :
                locale._dayOfMonthOrdinalParseLenient;
        });

        addParseToken(['D', 'DD'], DATE);
        addParseToken('Do', function (input, array) {
            array[DATE] = toInt(input.match(match1to2)[0]);
        });

        // MOMENTS

        var getSetDayOfMonth = makeGetSet('Date', true);

        // FORMATTING

        addFormatToken('DDD', ['DDDD', 3], 'DDDo', 'dayOfYear');

        // ALIASES

        addUnitAlias('dayOfYear', 'DDD');

        // PRIORITY
        addUnitPriority('dayOfYear', 4);

        // PARSING

        addRegexToken('DDD', match1to3);
        addRegexToken('DDDD', match3);
        addParseToken(['DDD', 'DDDD'], function (input, array, config) {
            config._dayOfYear = toInt(input);
        });

        // HELPERS

        // MOMENTS

        function getSetDayOfYear(input) {
            var dayOfYear = Math.round((this.clone().startOf('day') - this.clone().startOf('year')) / 864e5) + 1;
            return input == null ? dayOfYear : this.add((input - dayOfYear), 'd');
        }

        // FORMATTING

        addFormatToken('m', ['mm', 2], 0, 'minute');

        // ALIASES

        addUnitAlias('minute', 'm');

        // PRIORITY

        addUnitPriority('minute', 14);

        // PARSING

        addRegexToken('m', match1to2);
        addRegexToken('mm', match1to2, match2);
        addParseToken(['m', 'mm'], MINUTE);

        // MOMENTS

        var getSetMinute = makeGetSet('Minutes', false);

        // FORMATTING

        addFormatToken('s', ['ss', 2], 0, 'second');

        // ALIASES

        addUnitAlias('second', 's');

        // PRIORITY

        addUnitPriority('second', 15);

        // PARSING

        addRegexToken('s', match1to2);
        addRegexToken('ss', match1to2, match2);
        addParseToken(['s', 'ss'], SECOND);

        // MOMENTS

        var getSetSecond = makeGetSet('Seconds', false);

        // FORMATTING

        addFormatToken('S', 0, 0, function () {
            return ~~(this.millisecond() / 100);
        });

        addFormatToken(0, ['SS', 2], 0, function () {
            return ~~(this.millisecond() / 10);
        });

        addFormatToken(0, ['SSS', 3], 0, 'millisecond');
        addFormatToken(0, ['SSSS', 4], 0, function () {
            return this.millisecond() * 10;
        });
        addFormatToken(0, ['SSSSS', 5], 0, function () {
            return this.millisecond() * 100;
        });
        addFormatToken(0, ['SSSSSS', 6], 0, function () {
            return this.millisecond() * 1000;
        });
        addFormatToken(0, ['SSSSSSS', 7], 0, function () {
            return this.millisecond() * 10000;
        });
        addFormatToken(0, ['SSSSSSSS', 8], 0, function () {
            return this.millisecond() * 100000;
        });
        addFormatToken(0, ['SSSSSSSSS', 9], 0, function () {
            return this.millisecond() * 1000000;
        });


        // ALIASES

        addUnitAlias('millisecond', 'ms');

        // PRIORITY

        addUnitPriority('millisecond', 16);

        // PARSING

        addRegexToken('S', match1to3, match1);
        addRegexToken('SS', match1to3, match2);
        addRegexToken('SSS', match1to3, match3);

        var token;
        for (token = 'SSSS'; token.length <= 9; token += 'S') {
            addRegexToken(token, matchUnsigned);
        }

        function parseMs(input, array) {
            array[MILLISECOND] = toInt(('0.' + input) * 1000);
        }

        for (token = 'S'; token.length <= 9; token += 'S') {
            addParseToken(token, parseMs);
        }
        // MOMENTS

        var getSetMillisecond = makeGetSet('Milliseconds', false);

        // FORMATTING

        addFormatToken('z', 0, 0, 'zoneAbbr');
        addFormatToken('zz', 0, 0, 'zoneName');

        // MOMENTS

        function getZoneAbbr() {
            return this._isUTC ? 'UTC' : '';
        }

        function getZoneName() {
            return this._isUTC ? 'Coordinated Universal Time' : '';
        }

        var proto = Moment.prototype;

        proto.add = add;
        proto.calendar = calendar$1;
        proto.clone = clone;
        proto.diff = diff;
        proto.endOf = endOf;
        proto.format = format;
        proto.from = from;
        proto.fromNow = fromNow;
        proto.to = to;
        proto.toNow = toNow;
        proto.get = stringGet;
        proto.invalidAt = invalidAt;
        proto.isAfter = isAfter;
        proto.isBefore = isBefore;
        proto.isBetween = isBetween;
        proto.isSame = isSame;
        proto.isSameOrAfter = isSameOrAfter;
        proto.isSameOrBefore = isSameOrBefore;
        proto.isValid = isValid$2;
        proto.lang = lang;
        proto.locale = locale;
        proto.localeData = localeData;
        proto.max = prototypeMax;
        proto.min = prototypeMin;
        proto.parsingFlags = parsingFlags;
        proto.set = stringSet;
        proto.startOf = startOf;
        proto.subtract = subtract;
        proto.toArray = toArray;
        proto.toObject = toObject;
        proto.toDate = toDate;
        proto.toISOString = toISOString;
        proto.inspect = inspect;
        proto.toJSON = toJSON;
        proto.toString = toString;
        proto.unix = unix;
        proto.valueOf = valueOf;
        proto.creationData = creationData;

        // Year
        proto.year = getSetYear;
        proto.isLeapYear = getIsLeapYear;

        // Week Year
        proto.weekYear = getSetWeekYear;
        proto.isoWeekYear = getSetISOWeekYear;

        // Quarter
        proto.quarter = proto.quarters = getSetQuarter;

        // Month
        proto.month = getSetMonth;
        proto.daysInMonth = getDaysInMonth;

        // Week
        proto.week = proto.weeks = getSetWeek;
        proto.isoWeek = proto.isoWeeks = getSetISOWeek;
        proto.weeksInYear = getWeeksInYear;
        proto.isoWeeksInYear = getISOWeeksInYear;

        // Day
        proto.date = getSetDayOfMonth;
        proto.day = proto.days = getSetDayOfWeek;
        proto.weekday = getSetLocaleDayOfWeek;
        proto.isoWeekday = getSetISODayOfWeek;
        proto.dayOfYear = getSetDayOfYear;

        // Hour
        proto.hour = proto.hours = getSetHour;

        // Minute
        proto.minute = proto.minutes = getSetMinute;

        // Second
        proto.second = proto.seconds = getSetSecond;

        // Millisecond
        proto.millisecond = proto.milliseconds = getSetMillisecond;

        // Offset
        proto.utcOffset = getSetOffset;
        proto.utc = setOffsetToUTC;
        proto.local = setOffsetToLocal;
        proto.parseZone = setOffsetToParsedOffset;
        proto.hasAlignedHourOffset = hasAlignedHourOffset;
        proto.isDST = isDaylightSavingTime;
        proto.isLocal = isLocal;
        proto.isUtcOffset = isUtcOffset;
        proto.isUtc = isUtc;
        proto.isUTC = isUtc;

        // Timezone
        proto.zoneAbbr = getZoneAbbr;
        proto.zoneName = getZoneName;

        // Deprecations
        proto.dates = deprecate('dates accessor is deprecated. Use date instead.', getSetDayOfMonth);
        proto.months = deprecate('months accessor is deprecated. Use month instead', getSetMonth);
        proto.years = deprecate('years accessor is deprecated. Use year instead', getSetYear);
        proto.zone = deprecate('moment().zone is deprecated, use moment().utcOffset instead. http://momentjs.com/guides/#/warnings/zone/', getSetZone);
        proto.isDSTShifted = deprecate('isDSTShifted is deprecated. See http://momentjs.com/guides/#/warnings/dst-shifted/ for more information', isDaylightSavingTimeShifted);

        function createUnix(input) {
            return createLocal(input * 1000);
        }

        function createInZone() {
            return createLocal.apply(null, arguments).parseZone();
        }

        function preParsePostFormat(string) {
            return string;
        }

        var proto$1 = Locale.prototype;

        proto$1.calendar = calendar;
        proto$1.longDateFormat = longDateFormat;
        proto$1.invalidDate = invalidDate;
        proto$1.ordinal = ordinal;
        proto$1.preparse = preParsePostFormat;
        proto$1.postformat = preParsePostFormat;
        proto$1.relativeTime = relativeTime;
        proto$1.pastFuture = pastFuture;
        proto$1.set = set;

        // Month
        proto$1.months = localeMonths;
        proto$1.monthsShort = localeMonthsShort;
        proto$1.monthsParse = localeMonthsParse;
        proto$1.monthsRegex = monthsRegex;
        proto$1.monthsShortRegex = monthsShortRegex;

        // Week
        proto$1.week = localeWeek;
        proto$1.firstDayOfYear = localeFirstDayOfYear;
        proto$1.firstDayOfWeek = localeFirstDayOfWeek;

        // Day of Week
        proto$1.weekdays = localeWeekdays;
        proto$1.weekdaysMin = localeWeekdaysMin;
        proto$1.weekdaysShort = localeWeekdaysShort;
        proto$1.weekdaysParse = localeWeekdaysParse;

        proto$1.weekdaysRegex = weekdaysRegex;
        proto$1.weekdaysShortRegex = weekdaysShortRegex;
        proto$1.weekdaysMinRegex = weekdaysMinRegex;

        // Hours
        proto$1.isPM = localeIsPM;
        proto$1.meridiem = localeMeridiem;

        function get$1(format, index, field, setter) {
            var locale = getLocale();
            var utc = createUTC().set(setter, index);
            return locale[field](utc, format);
        }

        function listMonthsImpl(format, index, field) {
            if (isNumber(format)) {
                index = format;
                format = undefined;
            }

            format = format || '';

            if (index != null) {
                return get$1(format, index, field, 'month');
            }

            var i;
            var out = [];
            for (i = 0; i < 12; i++) {
                out[i] = get$1(format, i, field, 'month');
            }
            return out;
        }

        // ()
        // (5)
        // (fmt, 5)
        // (fmt)
        // (true)
        // (true, 5)
        // (true, fmt, 5)
        // (true, fmt)
        function listWeekdaysImpl(localeSorted, format, index, field) {
            if (typeof localeSorted === 'boolean') {
                if (isNumber(format)) {
                    index = format;
                    format = undefined;
                }

                format = format || '';
            } else {
                format = localeSorted;
                index = format;
                localeSorted = false;

                if (isNumber(format)) {
                    index = format;
                    format = undefined;
                }

                format = format || '';
            }

            var locale = getLocale(),
                shift = localeSorted ? locale._week.dow : 0;

            if (index != null) {
                return get$1(format, (index + shift) % 7, field, 'day');
            }

            var i;
            var out = [];
            for (i = 0; i < 7; i++) {
                out[i] = get$1(format, (i + shift) % 7, field, 'day');
            }
            return out;
        }

        function listMonths(format, index) {
            return listMonthsImpl(format, index, 'months');
        }

        function listMonthsShort(format, index) {
            return listMonthsImpl(format, index, 'monthsShort');
        }

        function listWeekdays(localeSorted, format, index) {
            return listWeekdaysImpl(localeSorted, format, index, 'weekdays');
        }

        function listWeekdaysShort(localeSorted, format, index) {
            return listWeekdaysImpl(localeSorted, format, index, 'weekdaysShort');
        }

        function listWeekdaysMin(localeSorted, format, index) {
            return listWeekdaysImpl(localeSorted, format, index, 'weekdaysMin');
        }

        getSetGlobalLocale('en', {
            dayOfMonthOrdinalParse: /\d{1,2}(th|st|nd|rd)/,
            ordinal: function (number) {
                var b = number % 10,
                    output = (toInt(number % 100 / 10) === 1) ? 'th' :
                        (b === 1) ? 'st' :
                            (b === 2) ? 'nd' :
                                (b === 3) ? 'rd' : 'th';
                return number + output;
            }
        });

        // Side effect imports
        hooks.lang = deprecate('moment.lang is deprecated. Use moment.locale instead.', getSetGlobalLocale);
        hooks.langData = deprecate('moment.langData is deprecated. Use moment.localeData instead.', getLocale);

        var mathAbs = Math.abs;

        function abs() {
            var data = this._data;

            this._milliseconds = mathAbs(this._milliseconds);
            this._days = mathAbs(this._days);
            this._months = mathAbs(this._months);

            data.milliseconds = mathAbs(data.milliseconds);
            data.seconds = mathAbs(data.seconds);
            data.minutes = mathAbs(data.minutes);
            data.hours = mathAbs(data.hours);
            data.months = mathAbs(data.months);
            data.years = mathAbs(data.years);

            return this;
        }

        function addSubtract$1(duration, input, value, direction) {
            var other = createDuration(input, value);

            duration._milliseconds += direction * other._milliseconds;
            duration._days += direction * other._days;
            duration._months += direction * other._months;

            return duration._bubble();
        }

        // supports only 2.0-style add(1, 's') or add(duration)
        function add$1(input, value) {
            return addSubtract$1(this, input, value, 1);
        }

        // supports only 2.0-style subtract(1, 's') or subtract(duration)
        function subtract$1(input, value) {
            return addSubtract$1(this, input, value, -1);
        }

        function absCeil(number) {
            if (number < 0) {
                return Math.floor(number);
            } else {
                return Math.ceil(number);
            }
        }

        function bubble() {
            var milliseconds = this._milliseconds;
            var days = this._days;
            var months = this._months;
            var data = this._data;
            var seconds, minutes, hours, years, monthsFromDays;

            // if we have a mix of positive and negative values, bubble down first
            // check: https://github.com/moment/moment/issues/2166
            if (!((milliseconds >= 0 && days >= 0 && months >= 0) ||
                (milliseconds <= 0 && days <= 0 && months <= 0))) {
                milliseconds += absCeil(monthsToDays(months) + days) * 864e5;
                days = 0;
                months = 0;
            }

            // The following code bubbles up values, see the tests for
            // examples of what that means.
            data.milliseconds = milliseconds % 1000;

            seconds = absFloor(milliseconds / 1000);
            data.seconds = seconds % 60;

            minutes = absFloor(seconds / 60);
            data.minutes = minutes % 60;

            hours = absFloor(minutes / 60);
            data.hours = hours % 24;

            days += absFloor(hours / 24);

            // convert days to months
            monthsFromDays = absFloor(daysToMonths(days));
            months += monthsFromDays;
            days -= absCeil(monthsToDays(monthsFromDays));

            // 12 months -> 1 year
            years = absFloor(months / 12);
            months %= 12;

            data.days = days;
            data.months = months;
            data.years = years;

            return this;
        }

        function daysToMonths(days) {
            // 400 years have 146097 days (taking into account leap year rules)
            // 400 years have 12 months === 4800
            return days * 4800 / 146097;
        }

        function monthsToDays(months) {
            // the reverse of daysToMonths
            return months * 146097 / 4800;
        }

        function as(units) {
            if (!this.isValid()) {
                return NaN;
            }
            var days;
            var months;
            var milliseconds = this._milliseconds;

            units = normalizeUnits(units);

            if (units === 'month' || units === 'year') {
                days = this._days + milliseconds / 864e5;
                months = this._months + daysToMonths(days);
                return units === 'month' ? months : months / 12;
            } else {
                // handle milliseconds separately because of floating point math errors (issue #1867)
                days = this._days + Math.round(monthsToDays(this._months));
                switch (units) {
                    case 'week': return days / 7 + milliseconds / 6048e5;
                    case 'day': return days + milliseconds / 864e5;
                    case 'hour': return days * 24 + milliseconds / 36e5;
                    case 'minute': return days * 1440 + milliseconds / 6e4;
                    case 'second': return days * 86400 + milliseconds / 1000;
                    // Math.floor prevents floating point math errors here
                    case 'millisecond': return Math.floor(days * 864e5) + milliseconds;
                    default: throw new Error('Unknown unit ' + units);
                }
            }
        }

        // TODO: Use this.as('ms')?
        function valueOf$1() {
            if (!this.isValid()) {
                return NaN;
            }
            return (
                this._milliseconds +
                this._days * 864e5 +
                (this._months % 12) * 2592e6 +
                toInt(this._months / 12) * 31536e6
            );
        }

        function makeAs(alias) {
            return function () {
                return this.as(alias);
            };
        }

        var asMilliseconds = makeAs('ms');
        var asSeconds = makeAs('s');
        var asMinutes = makeAs('m');
        var asHours = makeAs('h');
        var asDays = makeAs('d');
        var asWeeks = makeAs('w');
        var asMonths = makeAs('M');
        var asYears = makeAs('y');

        function clone$1() {
            return createDuration(this);
        }

        function get$2(units) {
            units = normalizeUnits(units);
            return this.isValid() ? this[units + 's']() : NaN;
        }

        function makeGetter(name) {
            return function () {
                return this.isValid() ? this._data[name] : NaN;
            };
        }

        var milliseconds = makeGetter('milliseconds');
        var seconds = makeGetter('seconds');
        var minutes = makeGetter('minutes');
        var hours = makeGetter('hours');
        var days = makeGetter('days');
        var months = makeGetter('months');
        var years = makeGetter('years');

        function weeks() {
            return absFloor(this.days() / 7);
        }

        var round = Math.round;
        var thresholds = {
            ss: 44,         // a few seconds to seconds
            s: 45,         // seconds to minute
            m: 45,         // minutes to hour
            h: 22,         // hours to day
            d: 26,         // days to month
            M: 11          // months to year
        };

        // helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
        function substituteTimeAgo(string, number, withoutSuffix, isFuture, locale) {
            return locale.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
        }

        function relativeTime$1(posNegDuration, withoutSuffix, locale) {
            var duration = createDuration(posNegDuration).abs();
            var seconds = round(duration.as('s'));
            var minutes = round(duration.as('m'));
            var hours = round(duration.as('h'));
            var days = round(duration.as('d'));
            var months = round(duration.as('M'));
            var years = round(duration.as('y'));

            var a = seconds <= thresholds.ss && ['s', seconds] ||
                seconds < thresholds.s && ['ss', seconds] ||
                minutes <= 1 && ['m'] ||
                minutes < thresholds.m && ['mm', minutes] ||
                hours <= 1 && ['h'] ||
                hours < thresholds.h && ['hh', hours] ||
                days <= 1 && ['d'] ||
                days < thresholds.d && ['dd', days] ||
                months <= 1 && ['M'] ||
                months < thresholds.M && ['MM', months] ||
                years <= 1 && ['y'] || ['yy', years];

            a[2] = withoutSuffix;
            a[3] = +posNegDuration > 0;
            a[4] = locale;
            return substituteTimeAgo.apply(null, a);
        }

        // This function allows you to set the rounding function for relative time strings
        function getSetRelativeTimeRounding(roundingFunction) {
            if (roundingFunction === undefined) {
                return round;
            }
            if (typeof (roundingFunction) === 'function') {
                round = roundingFunction;
                return true;
            }
            return false;
        }

        // This function allows you to set a threshold for relative time strings
        function getSetRelativeTimeThreshold(threshold, limit) {
            if (thresholds[threshold] === undefined) {
                return false;
            }
            if (limit === undefined) {
                return thresholds[threshold];
            }
            thresholds[threshold] = limit;
            if (threshold === 's') {
                thresholds.ss = limit - 1;
            }
            return true;
        }

        function humanize(withSuffix) {
            if (!this.isValid()) {
                return this.localeData().invalidDate();
            }

            var locale = this.localeData();
            var output = relativeTime$1(this, !withSuffix, locale);

            if (withSuffix) {
                output = locale.pastFuture(+this, output);
            }

            return locale.postformat(output);
        }

        var abs$1 = Math.abs;

        function sign(x) {
            return ((x > 0) - (x < 0)) || +x;
        }

        function toISOString$1() {
            // for ISO strings we do not use the normal bubbling rules:
            //  * milliseconds bubble up until they become hours
            //  * days do not bubble at all
            //  * months bubble up until they become years
            // This is because there is no context-free conversion between hours and days
            // (think of clock changes)
            // and also not between days and months (28-31 days per month)
            if (!this.isValid()) {
                return this.localeData().invalidDate();
            }

            var seconds = abs$1(this._milliseconds) / 1000;
            var days = abs$1(this._days);
            var months = abs$1(this._months);
            var minutes, hours, years;

            // 3600 seconds -> 60 minutes -> 1 hour
            minutes = absFloor(seconds / 60);
            hours = absFloor(minutes / 60);
            seconds %= 60;
            minutes %= 60;

            // 12 months -> 1 year
            years = absFloor(months / 12);
            months %= 12;


            // inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js
            var Y = years;
            var M = months;
            var D = days;
            var h = hours;
            var m = minutes;
            var s = seconds ? seconds.toFixed(3).replace(/\.?0+$/, '') : '';
            var total = this.asSeconds();

            if (!total) {
                // this is the same as C#'s (Noda) and python (isodate)...
                // but not other JS (goog.date)
                return 'P0D';
            }

            var totalSign = total < 0 ? '-' : '';
            var ymSign = sign(this._months) !== sign(total) ? '-' : '';
            var daysSign = sign(this._days) !== sign(total) ? '-' : '';
            var hmsSign = sign(this._milliseconds) !== sign(total) ? '-' : '';

            return totalSign + 'P' +
                (Y ? ymSign + Y + 'Y' : '') +
                (M ? ymSign + M + 'M' : '') +
                (D ? daysSign + D + 'D' : '') +
                ((h || m || s) ? 'T' : '') +
                (h ? hmsSign + h + 'H' : '') +
                (m ? hmsSign + m + 'M' : '') +
                (s ? hmsSign + s + 'S' : '');
        }

        var proto$2 = Duration.prototype;

        proto$2.isValid = isValid$1;
        proto$2.abs = abs;
        proto$2.add = add$1;
        proto$2.subtract = subtract$1;
        proto$2.as = as;
        proto$2.asMilliseconds = asMilliseconds;
        proto$2.asSeconds = asSeconds;
        proto$2.asMinutes = asMinutes;
        proto$2.asHours = asHours;
        proto$2.asDays = asDays;
        proto$2.asWeeks = asWeeks;
        proto$2.asMonths = asMonths;
        proto$2.asYears = asYears;
        proto$2.valueOf = valueOf$1;
        proto$2._bubble = bubble;
        proto$2.clone = clone$1;
        proto$2.get = get$2;
        proto$2.milliseconds = milliseconds;
        proto$2.seconds = seconds;
        proto$2.minutes = minutes;
        proto$2.hours = hours;
        proto$2.days = days;
        proto$2.weeks = weeks;
        proto$2.months = months;
        proto$2.years = years;
        proto$2.humanize = humanize;
        proto$2.toISOString = toISOString$1;
        proto$2.toString = toISOString$1;
        proto$2.toJSON = toISOString$1;
        proto$2.locale = locale;
        proto$2.localeData = localeData;

        // Deprecations
        proto$2.toIsoString = deprecate('toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)', toISOString$1);
        proto$2.lang = lang;

        // Side effect imports

        // FORMATTING

        addFormatToken('X', 0, 0, 'unix');
        addFormatToken('x', 0, 0, 'valueOf');

        // PARSING

        addRegexToken('x', matchSigned);
        addRegexToken('X', matchTimestamp);
        addParseToken('X', function (input, array, config) {
            config._d = new Date(parseFloat(input, 10) * 1000);
        });
        addParseToken('x', function (input, array, config) {
            config._d = new Date(toInt(input));
        });

        // Side effect imports


        hooks.version = '2.20.1';

        setHookCallback(createLocal);

        hooks.fn = proto;
        hooks.min = min;
        hooks.max = max;
        hooks.now = now;
        hooks.utc = createUTC;
        hooks.unix = createUnix;
        hooks.months = listMonths;
        hooks.isDate = isDate;
        hooks.locale = getSetGlobalLocale;
        hooks.invalid = createInvalid;
        hooks.duration = createDuration;
        hooks.isMoment = isMoment;
        hooks.weekdays = listWeekdays;
        hooks.parseZone = createInZone;
        hooks.localeData = getLocale;
        hooks.isDuration = isDuration;
        hooks.monthsShort = listMonthsShort;
        hooks.weekdaysMin = listWeekdaysMin;
        hooks.defineLocale = defineLocale;
        hooks.updateLocale = updateLocale;
        hooks.locales = listLocales;
        hooks.weekdaysShort = listWeekdaysShort;
        hooks.normalizeUnits = normalizeUnits;
        hooks.relativeTimeRounding = getSetRelativeTimeRounding;
        hooks.relativeTimeThreshold = getSetRelativeTimeThreshold;
        hooks.calendarFormat = getCalendarFormat;
        hooks.prototype = proto;

        // currently HTML5 input type only supports 24-hour formats
        hooks.HTML5_FMT = {
            DATETIME_LOCAL: 'YYYY-MM-DDTHH:mm',             // <input type="datetime-local" />
            DATETIME_LOCAL_SECONDS: 'YYYY-MM-DDTHH:mm:ss',  // <input type="datetime-local" step="1" />
            DATETIME_LOCAL_MS: 'YYYY-MM-DDTHH:mm:ss.SSS',   // <input type="datetime-local" step="0.001" />
            DATE: 'YYYY-MM-DD',                             // <input type="date" />
            TIME: 'HH:mm',                                  // <input type="time" />
            TIME_SECONDS: 'HH:mm:ss',                       // <input type="time" step="1" />
            TIME_MS: 'HH:mm:ss.SSS',                        // <input type="time" step="0.001" />
            WEEK: 'YYYY-[W]WW',                             // <input type="week" />
            MONTH: 'YYYY-MM'                                // <input type="month" />
        };

        return hooks;

    })));


    (function (factory) {
        if (typeof define === 'function' && define.amd) {
            // AMD. Register as an anonymous module.
            define(['jquery', 'moment'], factory);
        } else if (typeof exports === 'object' && typeof module !== 'undefined') {
            // CommonJS. Register as a module
            module.exports = factory(require('jquery'), require('moment'));
        } else {
            // Browser globals
            factory(jQuery, moment);
        }
    }(function ($, moment) {
        'use strict';
        $.dateRangePickerLanguages = {
            "default": //default language: English
            {
                "selected": "Selected:",
                "day": "Day",
                "days": "Days",
                "apply": "Close",
                "week-1": "mo",
                "week-2": "tu",
                "week-3": "we",
                "week-4": "th",
                "week-5": "fr",
                "week-6": "sa",
                "week-7": "su",
                "week-number": "W",
                "month-name": ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"],
                "shortcuts": "Shortcuts",
                "custom-values": "Custom Values",
                "past": "Past",
                "following": "Following",
                "previous": "Previous",
                "prev-week": "Week",
                "prev-month": "Month",
                "prev-year": "Year",
                "next": "Next",
                "next-week": "Week",
                "next-month": "Month",
                "next-year": "Year",
                "less-than": "Date range should not be more than %d days",
                "more-than": "Date range should not be less than %d days",
                "default-more": "Please select a date range longer than %d days",
                "default-single": "Please select a date",
                "default-less": "Please select a date range less than %d days",
                "default-range": "Please select a date range between %d and %d days",
                "default-default": "Please select a date range",
                "time": "Time",
                "hour": "Hour",
                "minute": "Minute"
            },
            "ko": {
                "selected": "기간:",
                "day": "일",
                "days": "일간",
                "apply": "닫기",
                "week-1": "월",
                "week-2": "화",
                "week-3": "수",
                "week-4": "목",
                "week-5": "금",
                "week-6": "토",
                "week-7": "일",
                "week-number": "주",
                "month-name": ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
                "shortcuts": "단축키들",
                "past": "지난(오늘기준)",
                "following": "이후(오늘기준)",
                "previous": "이전",
                "prev-week": "1주",
                "prev-month": "1달",
                "prev-year": "1년",
                "next": "다음",
                "next-week": "1주",
                "next-month": "1달",
                "next-year": "1년",
                "less-than": "날짜 범위는 %d 일보다 많을 수 없습니다",
                "more-than": "날짜 범위는 %d 일보다 작을 수 없습니다",
                "default-more": "날짜 범위를 %d 일보다 길게 선택해 주세요",
                "default-single": "날짜를 선택해 주세요",
                "default-less": "%d 일보다 작은 날짜를 선택해 주세요",
                "default-range": "%d와 %d 일 사이의 날짜 범위를 선택해 주세요",
                "default-default": "날짜 범위를 선택해 주세요",
                "time": "시각",
                "hour": "시",
                "minute": "분"
            }
        };

        $.fn.dateRangePicker = function (opt) {
            if (!opt) opt = {};
            opt = $.extend(true, {
                autoClose: true,
                format: 'YYYY-MM-DD',
                separator: ' to ',
                language: 'ko',
                startOfWeek: 'sunday', // or monday
                getValue: function () {
                    return $(this).val();
                },
                setValue: function (s) {
                    if (!$(this).attr('readonly') && !$(this).is(':disabled') && s != $(this).val()) {
                        $(this).val(s);
                    }
                },
                startDate: false,
                endDate: false,
                time: {
                    enabled: false
                },
                minDays: 0,
                maxDays: 0,
                showShortcuts: false,
                shortcuts: {
                    //'prev-days': [1,3,5,7],
                    // 'next-days': [3,5,7],
                    //'prev' : ['week','month','year'],
                    // 'next' : ['week','month','year']
                },
                customShortcuts: [],
                inline: false,
                container: 'body',
                alwaysOpen: false,
                singleDate: false,
                lookBehind: false,
                batchMode: false,
                duration: 200,
                stickyMonths: false,
                dayDivAttrs: [],
                dayTdAttrs: [],
                selectForward: false,
                selectBackward: false,
                applyBtnClass: '',
                singleMonth: 'auto',
                hoveringTooltip: function (days, startTime, hoveringTime) {
                    return days > 1 ? days + ' ' + translate('days') : '';
                },
                showTopbar: true,
                swapTime: false,
                showWeekNumbers: false,
                getWeekNumber: function (date) //date will be the first day of a week
                {
                    return moment(date).format('w');
                },
                customOpenAnimation: null,
                customCloseAnimation: null,
                customArrowPrevSymbol: null,
                customArrowNextSymbol: null,
                monthSelect: false,
                yearSelect: false,
                drops: 'up'
            }, opt);

            opt.start = false;
            opt.end = false;

            opt.startWeek = false;

            //detect a touch device
            opt.isTouchDevice = 'ontouchstart' in window || navigator.msMaxTouchPoints;

            //if it is a touch device, hide hovering tooltip
            if (opt.isTouchDevice) opt.hoveringTooltip = false;

            //show one month on mobile devices
            // if (opt.singleMonth == 'auto') opt.singleMonth = $(window).width() < 480;
            if (opt.singleMonth == 'auto') opt.singleMonth = $(window).width() < 200;
            if (opt.singleMonth) opt.stickyMonths = false;

            if (!opt.showTopbar) opt.autoClose = true;

            if (opt.startDate && typeof opt.startDate == 'string') opt.startDate = moment(opt.startDate, opt.format).toDate();
            if (opt.endDate && typeof opt.endDate == 'string') opt.endDate = moment(opt.endDate, opt.format).toDate();

            if (opt.yearSelect && typeof opt.yearSelect === 'boolean') {
                opt.yearSelect = function (current) { return [current - 5, current + 5]; }
            }

            var languages = getLanguages();
            var box;
            var initiated = false;
            var self = this;
            var selfDom = $(self).get(0);
            var domChangeTimer;

            $(this).unbind('.datepicker').bind('click.datepicker', function (evt) {
                var isOpen = box.is(':visible');
                if (!isOpen) open(opt.duration);
            }).bind('change.datepicker', function (evt) {
                checkAndSetDefaultValue();
            }).bind('keyup.datepicker', function () {
                try {
                    clearTimeout(domChangeTimer);
                } catch (e) { }
                domChangeTimer = setTimeout(function () {
                    checkAndSetDefaultValue();
                }, 2000);
            });

            init_datepicker.call(this);

            if (opt.alwaysOpen) {
                open(0);
            }

            // expose some api
            $(this).data('dateRangePicker', {
                setStart: function (d1) {
                    if (typeof d1 == 'string') {
                        d1 = moment(d1, opt.format).toDate();
                    }

                    opt.end = false;
                    setSingleDate(d1);

                    return this;
                },
                setEnd: function (d2, silent) {
                    var start = new Date();
                    start.setTime(opt.start);
                    if (typeof d2 == 'string') {
                        d2 = moment(d2, opt.format).toDate();
                    }
                    setDateRange(start, d2, silent);
                    return this;
                },
                setDateRange: function (d1, d2, silent) {
                    if (typeof d1 == 'string' && typeof d2 == 'string') {
                        d1 = moment(d1, opt.format).toDate();
                        d2 = moment(d2, opt.format).toDate();
                    }
                    setDateRange(d1, d2, silent);
                },
                clear: clearSelection,
                close: closeDatePicker,
                open: open,
                redraw: redrawDatePicker,
                getDatePicker: getDatePicker,
                resetMonthsView: resetMonthsView,
                destroy: function () {
                    $(self).unbind('.datepicker');
                    $(self).data('dateRangePicker', '');
                    $(self).data('date-picker-opened', null);
                    box.remove();
                    $(window).unbind('resize.datepicker', calcPosition);
                    $(document).unbind('click.datepicker', closeDatePicker);
                }
            });

            $(window).bind('resize.datepicker', calcPosition);

            return this;

            function IsOwnDatePickerClicked(evt, selfObj) {
                return (selfObj.contains(evt.target) || evt.target == selfObj || (selfObj.childNodes != undefined && $.inArray(evt.target, selfObj.childNodes) >= 0));
            }

            function init_datepicker() {
                var self = this;

                if ($(this).data('date-picker-opened')) {
                    closeDatePicker();
                    return;
                }
                $(this).data('date-picker-opened', true);


                box = createDom().hide();
                box.append('<div class="date-range-length-tip"></div>');

                $(opt.container).append(box);

                if (!opt.inline) {
                    calcPosition();
                } else {
                    box.addClass('inline-wrapper');
                }

                if (opt.alwaysOpen) {
                    box.find('.apply-btn').hide();
                }

                var defaultTime = getDefaultTime();
                resetMonthsView(defaultTime);

                if (opt.time.enabled) {
                    if ((opt.startDate && opt.endDate) || (opt.start && opt.end)) {
                        showTime(moment(opt.start || opt.startDate).toDate(), 'time1');
                        showTime(moment(opt.end || opt.endDate).toDate(), 'time2');
                    } else {
                        var defaultEndTime = opt.defaultEndTime ? opt.defaultEndTime : defaultTime;
                        showTime(defaultTime, 'time1');
                        showTime(defaultEndTime, 'time2');
                    }
                }

                //showSelectedInfo();


                var defaultTopText = '';
                if (opt.singleDate)
                    defaultTopText = translate('default-single');
                else if (opt.minDays && opt.maxDays)
                    defaultTopText = translate('default-range');
                else if (opt.minDays)
                    defaultTopText = translate('default-more');
                else if (opt.maxDays)
                    defaultTopText = translate('default-less');
                else
                    defaultTopText = translate('default-default');

                box.find('.default-top').html(defaultTopText.replace(/\%d/, opt.minDays).replace(/\%d/, opt.maxDays));
                if (opt.singleMonth) {
                    box.addClass('single-month');
                } else {
                    box.addClass('two-months');
                }


                setTimeout(function () {
                    updateCalendarWidth();
                    initiated = true;
                }, 0);

                box.click(function (evt) {
                    evt.stopPropagation();
                });

                //if user click other place of the webpage, close date range picker window
                $(document).bind('click.datepicker', function (evt) {
                    if (!IsOwnDatePickerClicked(evt, self[0])) {
                        if (box.is(':visible')) closeDatePicker();
                    }
                });

                box.find('.next').click(function () {
                    if (!opt.stickyMonths)
                        gotoNextMonth(this);
                    else
                        gotoNextMonth_stickily(this);
                });

                function gotoNextMonth(self) {
                    var isMonth2 = $(self).parents('table').hasClass('month2');
                    var month = isMonth2 ? opt.month2 : opt.month1;
                    month = nextMonth(month);
                    if (!opt.singleMonth && !opt.singleDate && !isMonth2 && compare_month(month, opt.month2) >= 0 || isMonthOutOfBounds(month)) return;
                    showMonth(month, isMonth2 ? 'month2' : 'month1');
                    showGap();
                }

                function gotoNextMonth_stickily(self) {
                    var nextMonth1 = nextMonth(opt.month1);
                    var nextMonth2 = nextMonth(opt.month2);
                    if (isMonthOutOfBounds(nextMonth2)) return;
                    if (!opt.singleDate && compare_month(nextMonth1, nextMonth2) >= 0) return;
                    showMonth(nextMonth1, 'month1');
                    showMonth(nextMonth2, 'month2');
                    showSelectedDays();
                }


                box.find('.prev').click(function () {
                    if (!opt.stickyMonths)
                        gotoPrevMonth(this);
                    else
                        gotoPrevMonth_stickily(this);
                });

                function gotoPrevMonth(self) {
                    var isMonth2 = $(self).parents('table').hasClass('month2');
                    var month = isMonth2 ? opt.month2 : opt.month1;
                    month = prevMonth(month);
                    if (isMonth2 && compare_month(month, opt.month1) <= 0 || isMonthOutOfBounds(month)) return;
                    showMonth(month, isMonth2 ? 'month2' : 'month1');
                    showGap();
                }

                function gotoPrevMonth_stickily(self) {
                    var prevMonth1 = prevMonth(opt.month1);
                    var prevMonth2 = prevMonth(opt.month2);
                    if (isMonthOutOfBounds(prevMonth1)) return;
                    if (!opt.singleDate && compare_month(prevMonth2, prevMonth1) <= 0) return;
                    showMonth(prevMonth2, 'month2');
                    showMonth(prevMonth1, 'month1');
                    showSelectedDays();
                }

                box.attr('unselectable', 'on')
                    .css('user-select', 'none')
                    .bind('selectstart', function (e) {
                        e.preventDefault();
                        return false;
                    });

                box.find('.apply-btn').click(function () {
                    closeDatePicker();
                    var dateRange = getDateString(new Date(opt.start)) + opt.separator + getDateString(new Date(opt.end));
                    $(self).trigger('datepicker-apply', {
                        'value': dateRange,
                        'date1': new Date(opt.start),
                        'date2': new Date(opt.end)
                    });
                });

                box.find('[custom]').click(function () {
                    var valueName = $(this).attr('custom');
                    opt.start = false;
                    opt.end = false;
                    box.find('.day.checked').removeClass('checked');
                    opt.setValue.call(selfDom, valueName);
                    checkSelectionValid();
                    showSelectedInfo(true);
                    showSelectedDays();
                    if (opt.autoClose) closeDatePicker();
                });

                box.find('[shortcut]').click(function () {
                    var shortcut = $(this).attr('shortcut');
                    var end = new Date(),
                        start = false;
                    var dir;
                    if (shortcut.indexOf('day') != -1) {
                        var day = parseInt(shortcut.split(',', 2)[1], 10);
                        start = new Date(new Date().getTime() + 86400000 * day);
                        end = new Date(end.getTime() + 86400000 * (day > 0 ? 1 : -1));
                    } else if (shortcut.indexOf('week') != -1) {
                        dir = shortcut.indexOf('prev,') != -1 ? -1 : 1;
                        var stopDay;
                        if (dir == 1)
                            stopDay = opt.startOfWeek == 'monday' ? 1 : 0;
                        else
                            stopDay = opt.startOfWeek == 'monday' ? 0 : 6;

                        end = new Date(end.getTime() - 86400000);
                        while (end.getDay() != stopDay) end = new Date(end.getTime() + dir * 86400000);
                        start = new Date(end.getTime() + dir * 86400000 * 6);
                    } else if (shortcut.indexOf('month') != -1) {
                        dir = shortcut.indexOf('prev,') != -1 ? -1 : 1;
                        if (dir == 1)
                            start = nextMonth(end);
                        else
                            start = prevMonth(end);
                        start.setDate(1);
                        end = nextMonth(start);
                        end.setDate(1);
                        end = new Date(end.getTime() - 86400000);
                    } else if (shortcut.indexOf('year') != -1) {
                        dir = shortcut.indexOf('prev,') != -1 ? -1 : 1;
                        start = new Date();
                        start.setFullYear(end.getFullYear() + dir);
                        start.setMonth(0);
                        start.setDate(1);
                        end.setFullYear(end.getFullYear() + dir);
                        end.setMonth(11);
                        end.setDate(31);
                    } else if (shortcut == 'custom') {
                        var name = $(this).html();
                        if (opt.customShortcuts && opt.customShortcuts.length > 0) {
                            for (var i = 0; i < opt.customShortcuts.length; i++) {
                                var sh = opt.customShortcuts[i];
                                if (sh.name == name) {
                                    var data = [];
                                    // try
                                    // {
                                    data = sh['dates'].call();
                                    //}catch(e){}
                                    if (data && data.length == 2) {
                                        start = data[0];
                                        end = data[1];
                                    }

                                    // if only one date is specified then just move calendars there
                                    // move calendars to show this date's month and next months
                                    if (data && data.length == 1) {
                                        var movetodate = data[0];
                                        showMonth(movetodate, 'month1');
                                        showMonth(nextMonth(movetodate), 'month2');
                                        showGap();
                                    }

                                    break;
                                }
                            }
                        }
                    }
                    if (start && end) {
                        setDateRange(start, end);
                        checkSelectionValid();
                    }
                });

                box.find('.time1 input[type=range]').bind('change touchmove', function (e) {
                    var target = e.target,
                        hour = target.name == 'hour' ? $(target).val().replace(/^(\d{1})$/, '0$1') : undefined,
                        min = target.name == 'minute' ? $(target).val().replace(/^(\d{1})$/, '0$1') : undefined;
                    setTime('time1', hour, min);
                });

                box.find('.time2 input[type=range]').bind('change touchmove', function (e) {
                    var target = e.target,
                        hour = target.name == 'hour' ? $(target).val().replace(/^(\d{1})$/, '0$1') : undefined,
                        min = target.name == 'minute' ? $(target).val().replace(/^(\d{1})$/, '0$1') : undefined;
                    setTime('time2', hour, min);
                });

            }


            function calcPosition() {
                if (!opt.inline) {
                    var offset = $(self).offset();
                    if ($(opt.container).css('position') == 'relative') {
                        var containerOffset = $(opt.container).offset();
                        var leftIndent = Math.max(0, offset.left + box.outerWidth() - $('body').width() + 16);
                        box.css({
                            top: offset.top - containerOffset.top + $(self).outerHeight() + 4,
                            left: offset.left - containerOffset.left - leftIndent
                        });
                    } else {
                        if (offset.left < 460) //left to right
                        {
                            box.css({
                                top: offset.top + $(self).outerHeight() + parseInt($('body').css('border-top') || 0, 10) - 330, // -330 추가
                                left: offset.left
                            });
                        } else {
                            box.css({
                                top: offset.top + $(self).outerHeight() + parseInt($('body').css('border-top') || 0, 10) - 330, // -330 추가
                                left: offset.left + $(self).width() - box.width() - 16
                            });
                        }
                    }
                }
            }

            // Return the date picker wrapper element
            function getDatePicker() {
                return box;
            }

            function open(animationTime) {
                redrawDatePicker();
                checkAndSetDefaultValue();
                if (opt.customOpenAnimation) {
                    opt.customOpenAnimation.call(box.get(0), function () {
                        $(self).trigger('datepicker-opened', {
                            relatedTarget: box
                        });
                    });
                } else {
                    box.slideDown(animationTime, function () {
                        $(self).trigger('datepicker-opened', {
                            relatedTarget: box
                        });
                    });
                }
                $(self).trigger('datepicker-open', {
                    relatedTarget: box
                });
                showGap();
                updateCalendarWidth();
                calcPosition();
            }

            function checkAndSetDefaultValue() {
                // var __default_string = opt.getValue.call(selfDom);
                // var defaults = __default_string ? __default_string.split(opt.separator) : '';
                // 
                // if (defaults && ((defaults.length == 1 && opt.singleDate) || defaults.length >= 2)) {
                // var ___format = opt.format;
                // if (___format.match(/Do/)) {
                // 
                // ___format = ___format.replace(/Do/, 'D');
                // defaults[0] = defaults[0].replace(/(\d+)(th|nd|st)/, '$1');
                // if (defaults.length >= 2) {
                // defaults[1] = defaults[1].replace(/(\d+)(th|nd|st)/, '$1');
                // }
                // }
                // // set initiated  to avoid triggerring datepicker-change event
                // initiated = false;
                // if (defaults.length >= 2) {
                // setDateRange(getValidValue(defaults[0], ___format, moment.locale(opt.language)), getValidValue(defaults[1], ___format, moment.locale(opt.language)));
                // } else if (defaults.length == 1 && opt.singleDate) {
                // setSingleDate(getValidValue(defaults[0], ___format, moment.locale(opt.language)));
                // }
                // 
                // initiated = true;
                // }
            }

            function getValidValue(date, format, locale) {
                if (moment(date, format, locale).isValid()) {
                    return moment(date, format, locale).toDate();
                } else {
                    return moment().toDate();
                }
            }

            function updateCalendarWidth() {
                var gapMargin = box.find('.gap').css('margin-left');
                if (gapMargin) gapMargin = parseInt(gapMargin);
                var w1 = box.find('.month1').width();
                var w2 = box.find('.gap').width() + (gapMargin ? gapMargin * 2 : 0);
                var w3 = box.find('.month2').width();
                // box.find('.month-wrapper').width(w1 + w2 + w3);
            }

            function renderTime(name, date) {
                box.find('.' + name + ' input[type=range].hour-range').val(moment(date).hours());
                box.find('.' + name + ' input[type=range].minute-range').val(moment(date).minutes());
                setTime(name, moment(date).format('HH'), moment(date).format('mm'));
            }

            function changeTime(name, date) {
                opt[name] = parseInt(
                    moment(parseInt(date))
                        .startOf('day')
                        .add(moment(opt[name + 'Time']).format('HH'), 'h')
                        .add(moment(opt[name + 'Time']).format('mm'), 'm').valueOf()
                );
            }

            function swapTime() {
                renderTime('time1', opt.start);
                renderTime('time2', opt.end);
            }

            function setTime(name, hour, minute) {
                hour && (box.find('.' + name + ' .hour-val').text(hour));
                minute && (box.find('.' + name + ' .minute-val').text(minute));
                switch (name) {
                    case 'time1':
                        if (opt.start) {
                            setRange('start', moment(opt.start));
                        }
                        setRange('startTime', moment(opt.startTime || moment().valueOf()));
                        break;
                    case 'time2':
                        if (opt.end) {
                            setRange('end', moment(opt.end));
                        }
                        setRange('endTime', moment(opt.endTime || moment().valueOf()));
                        break;
                }

                function setRange(name, timePoint) {
                    var h = timePoint.format('HH'),
                        m = timePoint.format('mm');
                    opt[name] = timePoint
                        .startOf('day')
                        .add(hour || h, 'h')
                        .add(minute || m, 'm')
                        .valueOf();
                }
                checkSelectionValid();
                showSelectedInfo();
                showSelectedDays();
            }

            function clearSelection() {
                opt.start = false;
                opt.end = false;
                box.find('.day.checked').removeClass('checked');
                box.find('.day.last-date-selected').removeClass('last-date-selected');
                box.find('.day.first-date-selected').removeClass('first-date-selected');
                opt.setValue.call(selfDom, '');
                checkSelectionValid();
                showSelectedInfo();
                showSelectedDays();
            }

            function handleStart(time) {
                var r = time;
                if (opt.batchMode === 'week-range') {
                    if (opt.startOfWeek === 'monday') {
                        r = moment(parseInt(time)).startOf('isoweek').valueOf();
                    } else {
                        r = moment(parseInt(time)).startOf('week').valueOf();
                    }
                } else if (opt.batchMode === 'month-range') {
                    r = moment(parseInt(time)).startOf('month').valueOf();
                }
                return r;
            }

            function handleEnd(time) {
                var r = time;
                if (opt.batchMode === 'week-range') {
                    if (opt.startOfWeek === 'monday') {
                        r = moment(parseInt(time)).endOf('isoweek').valueOf();
                    } else {
                        r = moment(parseInt(time)).endOf('week').valueOf();
                    }
                } else if (opt.batchMode === 'month-range') {
                    r = moment(parseInt(time)).endOf('month').valueOf();
                }
                return r;
            }


            function dayClicked(day) {
                if (day.hasClass('invalid')) return;
                var time = day.attr('time');
                day.addClass('checked');
                if (opt.singleDate) {
                    opt.start = time;
                    opt.end = false;
                } else if (opt.batchMode === 'week') {
                    if (opt.startOfWeek === 'monday') {
                        opt.start = moment(parseInt(time)).startOf('isoweek').valueOf();
                        opt.end = moment(parseInt(time)).endOf('isoweek').valueOf();
                    } else {
                        opt.end = moment(parseInt(time)).endOf('week').valueOf();
                        opt.start = moment(parseInt(time)).startOf('week').valueOf();
                    }
                } else if (opt.batchMode === 'workweek') {
                    opt.start = moment(parseInt(time)).day(1).valueOf();
                    opt.end = moment(parseInt(time)).day(5).valueOf();
                } else if (opt.batchMode === 'weekend') {
                    opt.start = moment(parseInt(time)).day(6).valueOf();
                    opt.end = moment(parseInt(time)).day(7).valueOf();
                } else if (opt.batchMode === 'month') {
                    opt.start = moment(parseInt(time)).startOf('month').valueOf();
                    opt.end = moment(parseInt(time)).endOf('month').valueOf();
                } else if ((opt.start && opt.end) || (!opt.start && !opt.end)) {
                    opt.start = handleStart(time);
                    opt.end = false;
                } else if (opt.start) {
                    opt.end = handleEnd(time);
                    if (opt.time.enabled) {
                        changeTime('end', opt.end);
                    }
                }

                //Update time in case it is enabled and timestamps are available
                if (opt.time.enabled) {
                    if (opt.start) {
                        changeTime('start', opt.start);
                    }
                    if (opt.end) {
                        changeTime('end', opt.end);
                    }
                }

                //In case the start is after the end, swap the timestamps
                if (!opt.singleDate && opt.start && opt.end && opt.start > opt.end) {
                    var tmp = opt.end;
                    opt.end = handleEnd(opt.start);
                    opt.start = handleStart(tmp);
                    if (opt.time.enabled && opt.swapTime) {
                        swapTime();
                    }
                }

                opt.start = parseInt(opt.start);
                opt.end = parseInt(opt.end);

                clearHovering();
                if (opt.start && !opt.end) {
                    $(self).trigger('datepicker-first-date-selected', {
                        'date1': new Date(opt.start)
                    });
                    dayHovering(day);
                }
                updateSelectableRange(time);

                checkSelectionValid();
                showSelectedInfo();
                showSelectedDays();
                autoclose();
            }


            function weekNumberClicked(weekNumberDom) {
                var thisTime = parseInt(weekNumberDom.attr('data-start-time'), 10);
                var date1, date2;
                if (!opt.startWeek) {
                    opt.startWeek = thisTime;
                    weekNumberDom.addClass('week-number-selected');
                    date1 = new Date(thisTime);
                    opt.start = moment(date1).day(opt.startOfWeek == 'monday' ? 1 : 0).valueOf();
                    opt.end = moment(date1).day(opt.startOfWeek == 'monday' ? 7 : 6).valueOf();
                } else {
                    box.find('.week-number-selected').removeClass('week-number-selected');
                    date1 = new Date(thisTime < opt.startWeek ? thisTime : opt.startWeek);
                    date2 = new Date(thisTime < opt.startWeek ? opt.startWeek : thisTime);
                    opt.startWeek = false;
                    opt.start = moment(date1).day(opt.startOfWeek == 'monday' ? 1 : 0).valueOf();
                    opt.end = moment(date2).day(opt.startOfWeek == 'monday' ? 7 : 6).valueOf();
                }
                updateSelectableRange();
                checkSelectionValid();
                showSelectedInfo();
                showSelectedDays();
                autoclose();
            }

            function isValidTime(time) {
                time = parseInt(time, 10);
                if (opt.startDate && compare_day(time, opt.startDate) < 0) return false;
                if (opt.endDate && compare_day(time, opt.endDate) > 0) return false;

                if (opt.start && !opt.end && !opt.singleDate) {
                    //check maxDays and minDays setting
                    if (opt.maxDays > 0 && countDays(time, opt.start) > opt.maxDays) return false;
                    if (opt.minDays > 0 && countDays(time, opt.start) < opt.minDays) return false;

                    //check selectForward and selectBackward
                    if (opt.selectForward && time < opt.start) return false;
                    if (opt.selectBackward && time > opt.start) return false;

                    //check disabled days
                    if (opt.beforeShowDay && typeof opt.beforeShowDay == 'function') {
                        var valid = true;
                        var timeTmp = time;
                        while (countDays(timeTmp, opt.start) > 1) {
                            var arr = opt.beforeShowDay(new Date(timeTmp));
                            if (!arr[0]) {
                                valid = false;
                                break;
                            }
                            if (Math.abs(timeTmp - opt.start) < 86400000) break;
                            if (timeTmp > opt.start) timeTmp -= 86400000;
                            if (timeTmp < opt.start) timeTmp += 86400000;
                        }
                        if (!valid) return false;
                    }
                }
                return true;
            }


            function updateSelectableRange() {
                box.find('.day.invalid.tmp').removeClass('tmp invalid').addClass('valid');
                if (opt.start && !opt.end) {
                    box.find('.day.toMonth.valid').each(function () {
                        var time = parseInt($(this).attr('time'), 10);
                        if (!isValidTime(time))
                            $(this).addClass('invalid tmp').removeClass('valid');
                        else
                            $(this).addClass('valid tmp').removeClass('invalid');
                    });
                }

                return true;
            }


            function dayHovering(day) {
                var hoverTime = parseInt(day.attr('time'));
                var tooltip = '';

                if (day.hasClass('has-tooltip') && day.attr('data-tooltip')) {
                    tooltip = '<span style="white-space:nowrap">' + day.attr('data-tooltip') + '</span>';
                } else if (!day.hasClass('invalid')) {
                    if (opt.singleDate) {
                        box.find('.day.hovering').removeClass('hovering');
                        day.addClass('hovering');
                    } else {
                        box.find('.day').each(function () {
                            var time = parseInt($(this).attr('time')),
                                start = opt.start,
                                end = opt.end;

                            if (time == hoverTime) {
                                $(this).addClass('hovering');
                            } else {
                                $(this).removeClass('hovering');
                            }

                            if (
                                (opt.start && !opt.end) &&
                                (
                                    (opt.start < time && hoverTime >= time) ||
                                    (opt.start > time && hoverTime <= time)
                                )
                            ) {
                                $(this).addClass('hovering');
                            } else {
                                $(this).removeClass('hovering');
                            }
                        });

                        if (opt.start && !opt.end) {
                            var days = countDays(hoverTime, opt.start);
                            if (opt.hoveringTooltip) {
                                if (typeof opt.hoveringTooltip == 'function') {
                                    tooltip = opt.hoveringTooltip(days, opt.start, hoverTime);
                                } else if (opt.hoveringTooltip === true && days > 1) {
                                    tooltip = days + ' ' + translate('days');
                                }
                            }
                        }
                    }
                }

                if (tooltip) {
                    var posDay = day.offset();
                    var posBox = box.offset();

                    var _left = posDay.left - posBox.left;
                    var _top = posDay.top - posBox.top;
                    _left += day.width() / 2;


                    var $tip = box.find('.date-range-length-tip');
                    var w = $tip.css({
                        'visibility': 'hidden',
                        'display': 'none'
                    }).html(tooltip).width();
                    var h = $tip.height();
                    _left -= w / 2;
                    _top -= h;
                    setTimeout(function () {
                        $tip.css({
                            left: _left,
                            top: _top,
                            display: 'block',
                            'visibility': 'visible'
                        });
                    }, 10);
                } else {
                    box.find('.date-range-length-tip').hide();
                }
            }

            function clearHovering() {
                box.find('.day.hovering').removeClass('hovering');
                box.find('.date-range-length-tip').hide();
            }

            function dateChanged(date) {
                var value = date.val();
                var name = date.attr('name');
                var type = date.parents('table').hasClass('month1') ? 'month1' : 'month2';
                var oppositeType = type === 'month1' ? 'month2' : 'month1';
                var startDate = opt.startDate ? moment(opt.startDate) : false;
                var endDate = opt.endDate ? moment(opt.endDate) : false;
                var newDate = moment(opt[type])[name](value);


                if (startDate && newDate.isSameOrBefore(startDate)) {
                    newDate = startDate.add(type === 'month2' ? 1 : 0, 'month');
                }

                if (endDate && newDate.isSameOrAfter(endDate)) {
                    newDate = endDate.add(!opt.singleMonth && type === 'month1' ? -1 : 0, 'month');
                }

                showMonth(newDate, type);

                if (type === 'month1') {
                    if (opt.stickyMonths || moment(newDate).isSameOrAfter(opt[oppositeType], 'month')) {
                        showMonth(moment(newDate).add(1, 'month'), oppositeType);
                    }
                } else {
                    if (opt.stickyMonths || moment(newDate).isSameOrBefore(opt[oppositeType], 'month')) {
                        showMonth(moment(newDate).add(-1, 'month'), oppositeType);
                    }
                }

                showGap();
            }

            function autoclose() {
                if (opt.singleDate === true) {
                    if (initiated && opt.start) {
                        if (opt.autoClose) closeDatePicker();
                    }
                } else {
                    if (initiated && opt.start && opt.end) {
                        if (opt.autoClose) closeDatePicker();
                    }
                }
            }

            function checkSelectionValid() {
                var days = Math.ceil((opt.end - opt.start) / 86400000) + 1;
                if (opt.singleDate) { // Validate if only start is there
                    if (opt.start && !opt.end)
                        box.find('.drp_top-bar').removeClass('error').addClass('normal');
                    else
                        box.find('.drp_top-bar').removeClass('error').removeClass('normal');
                } else if (opt.maxDays && days > opt.maxDays) {
                    opt.start = false;
                    opt.end = false;
                    box.find('.day').removeClass('checked');
                    box.find('.drp_top-bar').removeClass('normal').addClass('error').find('.error-top').html(translate('less-than').replace('%d', opt.maxDays));
                } else if (opt.minDays && days < opt.minDays) {
                    opt.start = false;
                    opt.end = false;
                    box.find('.day').removeClass('checked');
                    box.find('.drp_top-bar').removeClass('normal').addClass('error').find('.error-top').html(translate('more-than').replace('%d', opt.minDays));
                } else {
                    if (opt.start || opt.end)
                        box.find('.drp_top-bar').removeClass('error').addClass('normal');
                    else
                        box.find('.drp_top-bar').removeClass('error').removeClass('normal');
                }

                if ((opt.singleDate && opt.start && !opt.end) || (!opt.singleDate && opt.start && opt.end)) {
                    box.find('.apply-btn').removeClass('disabled');
                } else {
                    box.find('.apply-btn').addClass('disabled');
                }

                if (opt.batchMode) {
                    if (
                        (opt.start && opt.startDate && compare_day(opt.start, opt.startDate) < 0) ||
                        (opt.end && opt.endDate && compare_day(opt.end, opt.endDate) > 0)
                    ) {
                        opt.start = false;
                        opt.end = false;
                        box.find('.day').removeClass('checked');
                    }
                }
            }

            function showSelectedInfo(forceValid, silent) {
                box.find('.start-day').html('...');
                box.find('.end-day').html('...');
                box.find('.selected-days').hide();

                if (opt.start) {
                    box.find('.start-day').html(getDateString(new Date(parseInt(opt.start))));
                }

                if (opt.end) {
                    box.find('.end-day').html(getDateString(new Date(parseInt(opt.end))));
                }

                var dateRange;
                if (opt.start && opt.singleDate) {
                    box.find('.apply-btn').removeClass('disabled');
                    dateRange = getDateString(new Date(opt.start));
                    opt.setValue.call(selfDom, dateRange, getDateString(new Date(opt.start)), getDateString(new Date(opt.end)));

                    if (initiated && !silent) {
                        $(self).trigger('datepicker-change', {
                            'value': dateRange,
                            'date1': new Date(opt.start)
                        });
                    }
                } else if (opt.start && opt.end) {
                    box.find('.selected-days').show().find('.selected-days-num').html(countDays(opt.end, opt.start));
                    box.find('.apply-btn').removeClass('disabled');
                    dateRange = getDateString(new Date(opt.start)) + opt.separator + getDateString(new Date(opt.end));
                    opt.setValue.call(selfDom, dateRange, getDateString(new Date(opt.start)), getDateString(new Date(opt.end)));
                    if (initiated && !silent) {
                        $(self).trigger('datepicker-change', {
                            'value': dateRange,
                            'date1': new Date(opt.start),
                            'date2': new Date(opt.end)
                        });
                    }
                } else if (forceValid) {
                    box.find('.apply-btn').removeClass('disabled');
                } else {
                    box.find('.apply-btn').addClass('disabled');
                }
            }

            function countDays(start, end) {
                return Math.abs(daysFrom1970(start) - daysFrom1970(end)) + 1;
            }

            function setDateRange(date1, date2, silent) {
                if (date1.getTime() > date2.getTime()) {
                    var tmp = date2;
                    date2 = date1;
                    date1 = tmp;
                    tmp = null;
                }
                var valid = true;
                if (opt.startDate && compare_day(date1, opt.startDate) < 0) valid = false;
                if (opt.endDate && compare_day(date2, opt.endDate) > 0) valid = false;
                if (!valid) {
                    showMonth(opt.startDate, 'month1');
                    showMonth(nextMonth(opt.startDate), 'month2');
                    showGap();
                    return;
                }

                opt.start = date1.getTime();
                opt.end = date2.getTime();

                if (opt.time.enabled) {
                    renderTime('time1', date1);
                    renderTime('time2', date2);
                }

                if (opt.stickyMonths || (compare_day(date1, date2) > 0 && compare_month(date1, date2) === 0)) {
                    if (opt.lookBehind) {
                        date1 = prevMonth(date2);
                    } else {
                        date2 = nextMonth(date1);
                    }
                }

                if (opt.stickyMonths && opt.endDate !== false && compare_month(date2, opt.endDate) > 0) {
                    date1 = prevMonth(date1);
                    date2 = prevMonth(date2);
                }

                if (!opt.stickyMonths) {
                    if (compare_month(date1, date2) === 0) {
                        if (opt.lookBehind) {
                            date1 = prevMonth(date2);
                        } else {
                            date2 = nextMonth(date1);
                        }
                    }
                }

                showMonth(date1, 'month1');
                showMonth(date2, 'month2');
                showGap();
                checkSelectionValid();
                showSelectedInfo(false, silent);
                autoclose();
            }

            function setSingleDate(date1) {

                var valid = true;
                if (opt.startDate && compare_day(date1, opt.startDate) < 0) valid = false;
                if (opt.endDate && compare_day(date1, opt.endDate) > 0) valid = false;
                if (!valid) {
                    showMonth(opt.startDate, 'month1');
                    return;
                }

                opt.start = date1.getTime();


                if (opt.time.enabled) {
                    renderTime('time1', date1);

                }
                showMonth(date1, 'month1');
                if (opt.singleMonth !== true) {
                    var date2 = nextMonth(date1);
                    showMonth(date2, 'month2');
                }
                showGap();
                showSelectedInfo();
                autoclose();
            }

            function showSelectedDays() {
                if (!opt.start && !opt.end) return;
                box.find('.day').each(function () {
                    var time = parseInt($(this).attr('time')),
                        start = opt.start,
                        end = opt.end;
                    if (opt.time.enabled) {
                        time = moment(time).startOf('day').valueOf();
                        start = moment(start || moment().valueOf()).startOf('day').valueOf();
                        end = moment(end || moment().valueOf()).startOf('day').valueOf();
                    }
                    if (
                        (opt.start && opt.end && end >= time && start <= time) ||
                        (opt.start && !opt.end && moment(start).format('YYYY-MM-DD') == moment(time).format('YYYY-MM-DD'))
                    ) {
                        $(this).addClass('checked');
                    } else {
                        $(this).removeClass('checked');
                    }

                    //add first-date-selected class name to the first date selected
                    if (opt.start && moment(start).format('YYYY-MM-DD') == moment(time).format('YYYY-MM-DD')) {
                        $(this).addClass('first-date-selected');
                    } else {
                        $(this).removeClass('first-date-selected');
                    }
                    //add last-date-selected
                    if (opt.end && moment(end).format('YYYY-MM-DD') == moment(time).format('YYYY-MM-DD')) {
                        $(this).addClass('last-date-selected');
                    } else {
                        $(this).removeClass('last-date-selected');
                    }
                });

                box.find('.week-number').each(function () {
                    if ($(this).attr('data-start-time') == opt.startWeek) {
                        $(this).addClass('week-number-selected');
                    }
                });
            }

            function showMonth(date, month) {
                date = moment(date).toDate();
                var monthElement = generateMonthElement(date, month);
                var yearElement = generateYearElement(date, month);

                box.find('.' + month + ' .month-name').html(monthElement + ' ' + yearElement);
                box.find('.' + month + ' tbody').html(createMonthHTML(date));
                opt[month] = date;
                updateSelectableRange();
                bindEvents();
            }

            function generateMonthElement(date, month) {
                var range;
                var startDate = opt.startDate ? moment(opt.startDate).add(!opt.singleMonth && month === 'month2' ? 1 : 0, 'month') : false;
                var endDate = opt.endDate ? moment(opt.endDate).add(!opt.singleMonth && month === 'month1' ? -1 : 0, 'month') : false;
                date = moment(date);

                if (!opt.monthSelect ||
                    startDate && endDate && startDate.isSame(endDate, 'month')) {
                    return '<div class="month-element">' + nameMonth(date.get('month')) + '</div>';
                }

                range = [
                    startDate && date.isSame(startDate, 'year') ? startDate.get('month') : 0,
                    endDate && date.isSame(endDate, 'year') ? endDate.get('month') : 11
                ];

                if (range[0] === range[1]) {
                    return '<div class="month-element select-wrapper"><span class="select"><select class="month" name="month" disabled><option value="' + range[1] + '">' + nameMonth(date.get('month')) + '</option></select></span></div>';
                }

                return generateSelect(
                    'month',
                    generateSelectData(
                        range,
                        date.get('month'),
                        function (value) { return nameMonth(value); }
                    )
                );
            }

            function generateYearElement(date, month) {
                date = moment(date);
                var startDate = opt.startDate ? moment(opt.startDate).add(!opt.singleMonth && month === 'month2' ? 1 : 0, 'month') : false;
                var endDate = opt.endDate ? moment(opt.endDate).add(!opt.singleMonth && month === 'month1' ? -1 : 0, 'month') : false;
                var fullYear = date.get('year');
                var isYearFunction = opt.yearSelect && typeof opt.yearSelect === 'function';
                var range;

                if (!opt.yearSelect ||
                    startDate && endDate && startDate.isSame(moment(endDate), 'year')) {
                    return '<div class="month-element select-wrapper"><span class="select"><select class="year" name="year" disabled><option value="' + fullYear + '">' + fullYear + '</option></select></span></div>';
                }

                range = isYearFunction ? opt.yearSelect(fullYear) : opt.yearSelect.slice();

                range = [
                    startDate ? Math.max(range[0], startDate.get('year')) : Math.min(range[0], fullYear),
                    endDate ? Math.min(range[1], endDate.get('year')) : Math.max(range[1], fullYear)
                ];

                return generateSelect('year', generateSelectData(range, fullYear));
            }


            function generateSelectData(range, current, valueBeautifier) {
                var data = [];
                valueBeautifier = valueBeautifier || function (value) { return value; };

                for (var i = range[0]; i <= range[1]; i++) {
                    data.push({
                        value: i,
                        text: valueBeautifier(i),
                        isCurrent: i === current
                    });
                }

                return data;
            }

            function generateSelect(name, data) {
                var select = '<div class="select-wrapper"><span class="select"><select class="' + name + '" name="' + name + '">';
                var current;

                for (var i = 0, l = data.length; i < l; i++) {
                    select += '<option value="' + data[i].value + '"' + (data[i].isCurrent ? ' selected' : '') + '>';
                    select += data[i].text;
                    select += '</option>';

                    if (data[i].isCurrent) {
                        current = data[i].text;
                    }
                }

                // select += '</select></span>' + current + '</div>';
                select += '</select></span></div>';

                return select;
            }

            function bindEvents() {
                box.find('.day').unbind("click").click(function (evt) {
                    dayClicked($(this));
                });

                box.find('.day').unbind("mouseenter").mouseenter(function (evt) {
                    dayHovering($(this));
                });

                box.find('.day').unbind("mouseleave").mouseleave(function (evt) {
                    box.find('.date-range-length-tip').hide();
                    if (opt.singleDate) {
                        clearHovering();
                    }
                });

                box.find('.week-number').unbind("click").click(function (evt) {
                    weekNumberClicked($(this));
                });

                box.find('.month').unbind("change").change(function (evt) {
                    dateChanged($(this));
                });

                box.find('.year').unbind("change").change(function (evt) {
                    dateChanged($(this));
                });
            }

            function showTime(date, name) {
                box.find('.' + name).append(getTimeHTML());
                renderTime(name, date);
            }

            function nameMonth(m) {
                return translate('month-name')[m];
            }

            function getDateString(d) {
                return moment(d).format(opt.format);
            }

            function showGap() {
                showSelectedDays();
                var m1 = parseInt(moment(opt.month1).format('YYYYMM'));
                var m2 = parseInt(moment(opt.month2).format('YYYYMM'));
                var p = Math.abs(m1 - m2);
                var shouldShow = (p > 1 && p != 89);
                if (shouldShow) {
                    box.addClass('has-gap').removeClass('no-gap').find('.gap').css('visibility', 'visible');
                } else {
                    box.removeClass('has-gap').addClass('no-gap').find('.gap').css('visibility', 'hidden');
                }
                var h1 = box.find('table.month1').height();
                var h2 = box.find('table.month2').height();
                box.find('.gap').height(Math.max(h1, h2) + 10);
            }

            function closeDatePicker() {
                if (opt.alwaysOpen) return;

                var afterAnim = function () {
                    $(self).data('date-picker-opened', false);
                    $(self).trigger('datepicker-closed', {
                        relatedTarget: box
                    });
                };
                if (opt.customCloseAnimation) {
                    opt.customCloseAnimation.call(box.get(0), afterAnim);
                } else {
                    $(box).slideUp(opt.duration, afterAnim);
                }
                $(self).trigger('datepicker-close', {
                    relatedTarget: box
                });
            }

            function redrawDatePicker() {
                showMonth(opt.month1, 'month1');
                showMonth(opt.month2, 'month2');
            }

            function compare_month(m1, m2) {
                var p = parseInt(moment(m1).format('YYYYMM')) - parseInt(moment(m2).format('YYYYMM'));
                if (p > 0) return 1;
                if (p === 0) return 0;
                return -1;
            }

            function compare_day(m1, m2) {
                var p = parseInt(moment(m1).format('YYYYMMDD')) - parseInt(moment(m2).format('YYYYMMDD'));
                if (p > 0) return 1;
                if (p === 0) return 0;
                return -1;
            }

            function nextMonth(month) {
                return moment(month).add(1, 'months').toDate();
            }

            function prevMonth(month) {
                return moment(month).add(-1, 'months').toDate();
            }

            function getTimeHTML() {
                return '<div>' +
                    '<span>' + translate('Time') + ': <span class="hour-val">00</span>:<span class="minute-val">00</span></span>' +
                    '</div>' +
                    '<div class="hour">' +
                    '<label>' + translate('Hour') + ': <input type="range" class="hour-range" name="hour" min="0" max="23"></label>' +
                    '</div>' +
                    '<div class="minute">' +
                    '<label>' + translate('Minute') + ': <input type="range" class="minute-range" name="minute" min="0" max="59"></label>' +
                    '</div>';
            }

            function createDom() {
                var html = '<div class="date-picker-wrapper';
                if (opt.extraClass) html += ' ' + opt.extraClass + ' ';
                if (opt.singleDate) html += ' single-date ';
                if (!opt.showShortcuts) html += ' no-shortcuts ';
                if (!opt.showTopbar) html += ' no-topbar ';
                if (opt.customTopBar) html += ' custom-topbar ';
                html += '">';

                if (opt.showTopbar) {
                    html += '<div class="drp_top-bar">';

                    if (opt.customTopBar) {
                        if (typeof opt.customTopBar == 'function') opt.customTopBar = opt.customTopBar();
                        html += '<div class="custom-top">' + opt.customTopBar + '</div>';
                    } else {
                        html += '<div class="normal-top">' +
                            '<span style="color:#333">' + translate('selected') + ' </span> <b class="start-day">...</b>';
                        if (!opt.singleDate) {
                            html += ' <span class="separator-day">' + opt.separator + '</span> <b class="end-day">...</b> <i class="selected-days">(<span class="selected-days-num">3</span> ' + translate('days') + ')</i>';
                        }
                        html += '</div>';
                        html += '<div class="error-top">error</div>' +
                            '<div class="default-top">default</div>';
                    }

                    html += '<input type="button" class="apply-btn disabled' + getApplyBtnClass() + '" value="' + translate('apply') + '" />';
                    html += '</div>';
                }

                var _colspan = opt.showWeekNumbers ? 6 : 5;

                var arrowPrev = '&lt;';
                if (opt.customArrowPrevSymbol) arrowPrev = opt.customArrowPrevSymbol;

                var arrowNext = '&gt;';
                if (opt.customArrowNextSymbol) arrowNext = opt.customArrowNextSymbol;

                html += '<div class="month-wrapper">' +
                    '   <table class="month1" cellspacing="0" border="0" cellpadding="0">' +
                    '       <thead>' +
                    '           <tr class="caption">' +
                    '               <th style="width:32px;">' +
                    '                   <span class="prev">' +
                    arrowPrev +
                    '                   </span>' +
                    '               </th>' +
                    '               <th colspan="' + _colspan + '" class="month-name">' +
                    '               </th>' +
                    '               <th style="width:32px;">' +
                    (opt.singleDate || !opt.stickyMonths ? '<span class="next">' + arrowNext + '</span>' : '') +
                    '               </th>' +
                    '           </tr>' +
                    '           <tr class="week-name">' + getWeekHead() +
                    '       </thead>' +
                    '       <tbody></tbody>' +
                    '   </table>';

                if (hasMonth2()) {
                    html += '<div class="gap">' + getGapHTML() + '</div>' +
                        '<table class="month2" cellspacing="0" border="0" cellpadding="0">' +
                        '   <thead>' +
                        '   <tr class="caption">' +
                        '       <th style="width:32px;">' +
                        (!opt.stickyMonths ? '<span class="prev">' + arrowPrev + '</span>' : '') +
                        '       </th>' +
                        '       <th colspan="' + _colspan + '" class="month-name">' +
                        '       </th>' +
                        '       <th style="width:32px;">' +
                        '           <span class="next">' + arrowNext + '</span>' +
                        '       </th>' +
                        '   </tr>' +
                        '   <tr class="week-name">' + getWeekHead() +
                        '   </thead>' +
                        '   <tbody></tbody>' +
                        '</table>';

                }
                //+'</div>'
                html += '<div style="clear:both;height:0;font-size:0;"></div>' +
                    '<div class="time">' +
                    '<div class="time1"></div>';
                if (!opt.singleDate) {
                    html += '<div class="time2"></div>';
                }
                html += '</div>' +
                    '<div style="clear:both;height:0;font-size:0;"></div>' +
                    '</div>';

                html += '<div class="footer">';
                if (opt.showShortcuts) {
                    html += '<div class="shortcuts"><b>' + translate('shortcuts') + '</b>';

                    var data = opt.shortcuts;
                    if (data) {
                        var name;
                        if (data['prev-days'] && data['prev-days'].length > 0) {
                            html += '&nbsp;<span class="prev-days">' + translate('past');
                            for (var i = 0; i < data['prev-days'].length; i++) {
                                name = data['prev-days'][i];
                                name += (data['prev-days'][i] > 1) ? translate('days') : translate('day');
                                html += ' <a href="javascript:;" shortcut="day,-' + data['prev-days'][i] + '">' + name + '</a>';
                            }
                            html += '</span>';
                        }

                        if (data['next-days'] && data['next-days'].length > 0) {
                            html += '&nbsp;<span class="next-days">' + translate('following');
                            for (var i = 0; i < data['next-days'].length; i++) {
                                name = data['next-days'][i];
                                name += (data['next-days'][i] > 1) ? translate('days') : translate('day');
                                html += ' <a href="javascript:;" shortcut="day,' + data['next-days'][i] + '">' + name + '</a>';
                            }
                            html += '</span>';
                        }

                        if (data.prev && data.prev.length > 0) {
                            html += '&nbsp;<span class="prev-buttons">' + translate('previous');
                            for (var i = 0; i < data.prev.length; i++) {
                                name = translate('prev-' + data.prev[i]);
                                html += ' <a href="javascript:;" shortcut="prev,' + data.prev[i] + '">' + name + '</a>';
                            }
                            html += '</span>';
                        }

                        if (data.next && data.next.length > 0) {
                            html += '&nbsp;<span class="next-buttons">' + translate('next');
                            for (var i = 0; i < data.next.length; i++) {
                                name = translate('next-' + data.next[i]);
                                html += ' <a href="javascript:;" shortcut="next,' + data.next[i] + '">' + name + '</a>';
                            }
                            html += '</span>';
                        }
                    }

                    if (opt.customShortcuts) {
                        for (var i = 0; i < opt.customShortcuts.length; i++) {
                            var sh = opt.customShortcuts[i];
                            html += '&nbsp;<span class="custom-shortcut"><a href="javascript:;" shortcut="custom">' + sh.name + '</a></span>';
                        }
                    }
                    html += '</div>';
                }

                // Add Custom Values Dom
                if (opt.showCustomValues) {
                    html += '<div class="customValues"><b>' + (opt.customValueLabel || translate('custom-values')) + '</b>';

                    if (opt.customValues) {
                        for (var i = 0; i < opt.customValues.length; i++) {
                            var val = opt.customValues[i];
                            html += '&nbsp;<span class="custom-value"><a href="javascript:;" custom="' + val.value + '">' + val.name + '</a></span>';
                        }
                    }
                }

                html += '</div></div>';


                return $(html);
            }

            function getApplyBtnClass() {
                var klass = '';
                if (opt.autoClose === true) {
                    klass += ' hide';
                }
                if (opt.applyBtnClass !== '') {
                    klass += ' ' + opt.applyBtnClass;
                }
                return klass;
            }

            function getWeekHead() {
                var prepend = opt.showWeekNumbers ? '<th>' + translate('week-number') + '</th>' : '';
                if (opt.startOfWeek == 'monday') {
                    return prepend + '<th>' + translate('week-1') + '</th>' +
                        '<th>' + translate('week-2') + '</th>' +
                        '<th>' + translate('week-3') + '</th>' +
                        '<th>' + translate('week-4') + '</th>' +
                        '<th>' + translate('week-5') + '</th>' +
                        '<th>' + translate('week-6') + '</th>' +
                        '<th>' + translate('week-7') + '</th>';
                } else {
                    return prepend + '<th class="sun">' + translate('week-7') + '</th>' +
                        '<th>' + translate('week-1') + '</th>' +
                        '<th>' + translate('week-2') + '</th>' +
                        '<th>' + translate('week-3') + '</th>' +
                        '<th>' + translate('week-4') + '</th>' +
                        '<th>' + translate('week-5') + '</th>' +
                        '<th class="sat">' + translate('week-6') + '</th>';
                }
            }

            function isMonthOutOfBounds(month) {
                month = moment(month);
                if (opt.startDate && month.endOf('month').isBefore(opt.startDate)) {
                    return true;
                }
                if (opt.endDate && month.startOf('month').isAfter(opt.endDate)) {
                    return true;
                }
                return false;
            }

            function getGapHTML() {
                var html = ['<div class="gap-top-mask"></div><div class="gap-bottom-mask"></div><div class="gap-lines">'];
                for (var i = 0; i < 20; i++) {
                    html.push('<div class="gap-line">' +
                        '<div class="gap-1"></div>' +
                        '<div class="gap-2"></div>' +
                        '<div class="gap-3"></div>' +
                        '</div>');
                }
                html.push('</div>');
                return html.join('');
            }

            function hasMonth2() {
                return (!opt.singleMonth);
            }

            function attributesCallbacks(initialObject, callbacksArray, today) {
                var resultObject = $.extend(true, {}, initialObject);

                $.each(callbacksArray, function (cbAttrIndex, cbAttr) {
                    var addAttributes = cbAttr(today);
                    for (var attr in addAttributes) {
                        if (resultObject.hasOwnProperty(attr)) {
                            resultObject[attr] += addAttributes[attr];
                        } else {
                            resultObject[attr] = addAttributes[attr];
                        }
                    }
                });

                var attrString = '';

                for (var attr in resultObject) {
                    if (resultObject.hasOwnProperty(attr)) {
                        attrString += attr + '="' + resultObject[attr] + '" ';
                    }
                }

                return attrString;
            }

            function daysFrom1970(t) {
                return Math.floor(toLocalTimestamp(t) / 86400000);
            }

            function toLocalTimestamp(t) {
                if (moment.isMoment(t)) t = t.toDate().getTime();
                if (typeof t == 'object' && t.getTime) t = t.getTime();
                if (typeof t == 'string' && !t.match(/\d{13}/)) t = moment(t, opt.format).toDate().getTime();
                t = parseInt(t, 10) - new Date().getTimezoneOffset() * 60 * 1000;
                return t;
            }

            function createMonthHTML(d) {
                var days = [];
                d.setDate(1);
                var lastMonth = new Date(d.getTime() - 86400000);
                var now = new Date();

                var dayOfWeek = d.getDay();
                if ((dayOfWeek === 0) && (opt.startOfWeek === 'monday')) {
                    // add one week
                    dayOfWeek = 7;
                }
                var today, valid;

                if (dayOfWeek > 0) {
                    for (var i = dayOfWeek; i > 0; i--) {
                        var day = new Date(d.getTime() - 86400000 * i);
                        valid = isValidTime(day.getTime());
                        if (opt.startDate && compare_day(day, opt.startDate) < 0) valid = false;
                        if (opt.endDate && compare_day(day, opt.endDate) > 0) valid = false;
                        days.push({
                            date: day,
                            type: 'lastMonth',
                            day: day.getDate(),
                            time: day.getTime(),
                            valid: valid
                        });
                    }
                }
                var toMonth = d.getMonth();
                for (var i = 0; i < 40; i++) {
                    today = moment(d).add(i, 'days').toDate();
                    valid = isValidTime(today.getTime());
                    if (opt.startDate && compare_day(today, opt.startDate) < 0) valid = false;
                    if (opt.endDate && compare_day(today, opt.endDate) > 0) valid = false;
                    days.push({
                        date: today,
                        type: today.getMonth() == toMonth ? 'toMonth' : 'nextMonth',
                        day: today.getDate(),
                        time: today.getTime(),
                        valid: valid
                    });
                }
                var html = [];
                for (var week = 0; week < 6; week++) {
                    if (days[week * 7].type == 'nextMonth') break;
                    html.push('<tr>');

                    for (var day = 0; day < 7; day++) {
                        var _day = (opt.startOfWeek == 'monday') ? day + 1 : day;
                        today = days[week * 7 + _day];
                        var highlightToday = moment(today.time).format('L') == moment(now).format('L');
                        today.extraClass = '';
                        today.tooltip = '';
                        if (today.valid && opt.beforeShowDay && typeof opt.beforeShowDay == 'function') {
                            var _r = opt.beforeShowDay(moment(today.time).toDate());
                            today.valid = _r[0];
                            today.extraClass = _r[1] || '';
                            today.tooltip = _r[2] || '';
                            if (today.tooltip !== '') today.extraClass += ' has-tooltip ';
                        }

                        var todayDivAttr = {
                            time: today.time,
                            'data-tooltip': today.tooltip,
                            'class': 'day ' + today.type + ' ' + today.extraClass + ' ' + (today.valid ? 'valid' : 'invalid') + ' ' + (highlightToday ? 'real-today' : '')
                        };

                        if (day === 0 && opt.showWeekNumbers) {
                            html.push('<td><div class="week-number" data-start-time="' + today.time + '">' + opt.getWeekNumber(today.date) + '</div></td>');
                        }

                        html.push('<td ' + attributesCallbacks({}, opt.dayTdAttrs, today) + '><div ' + attributesCallbacks(todayDivAttr, opt.dayDivAttrs, today) + '>' + showDayHTML(today.time, today.day) + '</div></td>');
                    }
                    html.push('</tr>');
                }
                return html.join('');
            }

            function showDayHTML(time, date) {
                if (opt.showDateFilter && typeof opt.showDateFilter == 'function') return opt.showDateFilter(time, date);
                return date;
            }

            function getLanguages() {
                if (opt.language == 'auto') {
                    var language = navigator.language ? navigator.language : navigator.browserLanguage;
                    if (!language) {
                        return $.dateRangePickerLanguages['default'];
                    }
                    language = language.toLowerCase();
                    if (language in $.dateRangePickerLanguages) {
                        return $.dateRangePickerLanguages[language];
                    }

                    return $.dateRangePickerLanguages['default'];
                } else if (opt.language && opt.language in $.dateRangePickerLanguages) {
                    return $.dateRangePickerLanguages[opt.language];
                } else {
                    return $.dateRangePickerLanguages['default'];
                }
            }

	        /**
	         * Translate language string, try both the provided translation key, as the lower case version
	         */
            function translate(translationKey) {
                var translationKeyLowerCase = translationKey.toLowerCase();
                var result = (translationKey in languages) ? languages[translationKey] : (translationKeyLowerCase in languages) ? languages[translationKeyLowerCase] : null;
                var defaultLanguage = $.dateRangePickerLanguages['default'];
                if (result == null) result = (translationKey in defaultLanguage) ? defaultLanguage[translationKey] : (translationKeyLowerCase in defaultLanguage) ? defaultLanguage[translationKeyLowerCase] : '';

                return result;
            }

            function getDefaultTime() {
                var defaultTime = opt.defaultTime ? opt.defaultTime : new Date();

                if (opt.lookBehind) {
                    if (opt.startDate && compare_month(defaultTime, opt.startDate) < 0) defaultTime = nextMonth(moment(opt.startDate).toDate());
                    if (opt.endDate && compare_month(defaultTime, opt.endDate) > 0) defaultTime = moment(opt.endDate).toDate();
                } else {
                    if (opt.startDate && compare_month(defaultTime, opt.startDate) < 0) defaultTime = moment(opt.startDate).toDate();
                    if (opt.endDate && compare_month(nextMonth(defaultTime), opt.endDate) > 0) defaultTime = prevMonth(moment(opt.endDate).toDate());
                }

                if (opt.singleDate) {
                    if (opt.startDate && compare_month(defaultTime, opt.startDate) < 0) defaultTime = moment(opt.startDate).toDate();
                    if (opt.endDate && compare_month(defaultTime, opt.endDate) > 0) defaultTime = moment(opt.endDate).toDate();
                }

                return defaultTime;
            }

            function resetMonthsView(time) {
                if (!time) {
                    time = getDefaultTime();
                }

                if (opt.lookBehind) {
                    showMonth(prevMonth(time), 'month1');
                    showMonth(time, 'month2');
                } else {
                    showMonth(time, 'month1');
                    showMonth(nextMonth(time), 'month2');
                }

                if (opt.singleDate) {
                    showMonth(time, 'month1');
                }

                showSelectedDays();
                showGap();
            }

        };
    }));

    /*!
     * Datepicker v0.5.4
     * https://github.com/fengyuanchen/datepicker
     *
     * Copyright (c) 2014-2017 Fengyuan Chen
     * Released under the MIT license
     *
     * Date: 2017-08-05T07:14:03.474Z
     */

    (function (factory) {
        if (typeof define === 'function' && define.amd) {
            // AMD. Register as anonymous module.
            define('datepicker', ['jquery'], factory);
        } else if (typeof exports === 'object') {
            // Node / CommonJS
            factory(require('jquery'));
        } else {
            // Browser globals.
            factory(jQuery);
        }
    })(function ($) {

        'use strict';

        var $window = $(window);
        var document = window.document;
        var $document = $(document);
        var Number = window.Number;
        var NAMESPACE = 'datepicker';

        // Events
        var EVENT_CLICK = 'click.' + NAMESPACE;
        var EVENT_KEYUP = 'keyup.' + NAMESPACE;
        var EVENT_FOCUS = 'focus.' + NAMESPACE;
        var EVENT_RESIZE = 'resize.' + NAMESPACE;
        var EVENT_SHOW = 'show.' + NAMESPACE;
        var EVENT_HIDE = 'hide.' + NAMESPACE;
        var EVENT_PICK = 'pick.' + NAMESPACE;

        // RegExps
        var REGEXP_FORMAT = /(y|m|d)+/g;
        var REGEXP_DIGITS = /\d+/g;
        var REGEXP_YEAR = /^\d{2,4}$/;

        // Classes
        var CLASS_INLINE = NAMESPACE + '-inline';
        var CLASS_DROPDOWN = NAMESPACE + '-dropdown';
        var CLASS_TOP_LEFT = NAMESPACE + '-top-left';
        var CLASS_TOP_RIGHT = NAMESPACE + '-top-right';
        var CLASS_BOTTOM_LEFT = NAMESPACE + '-bottom-left';
        var CLASS_BOTTOM_RIGHT = NAMESPACE + '-bottom-right';
        var CLASS_PLACEMENTS = [
            CLASS_TOP_LEFT,
            CLASS_TOP_RIGHT,
            CLASS_BOTTOM_LEFT,
            CLASS_BOTTOM_RIGHT
        ].join(' ');
        var CLASS_HIDE = NAMESPACE + '-hide';

        // Views
        var VIEWS = {
            DAYS: 0,
            MONTHS: 1,
            YEARS: 2
        };

        // Maths
        var min = Math.min;

        // Utilities
        var toString = Object.prototype.toString;

        function typeOf(obj) {
            return toString.call(obj).slice(8, -1).toLowerCase();
        }

        function isString(str) {
            return typeof str === 'string';
        }

        function isNumber(num) {
            return typeof num === 'number' && !isNaN(num);
        }

        function isUndefined(obj) {
            return typeof obj === 'undefined';
        }

        function isDate(date) {
            return typeOf(date) === 'date';
        }

        function toArray(obj, offset) {
            var args = [];

            if (Array.from) {
                return Array.from(obj).slice(offset || 0);
            }

            // This is necessary for IE8
            if (isNumber(offset)) {
                args.push(offset);
            }

            return args.slice.apply(obj, args);
        }

        // Custom proxy to avoid jQuery's guid
        function proxy(fn, context) {
            var args = toArray(arguments, 2);

            return function () {
                return fn.apply(context, args.concat(toArray(arguments)));
            };
        }

        function isLeapYear(year) {
            return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
        }

        function getDaysInMonth(year, month) {
            return [31, (isLeapYear(year) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
        }

        function parseFormat(format) {
            var source = String(format).toLowerCase();
            var parts = source.match(REGEXP_FORMAT);
            var length;
            var i;

            if (!parts || parts.length === 0) {
                throw new Error('Invalid date format.');
            }

            format = {
                source: source,
                parts: parts
            };

            length = parts.length;

            for (i = 0; i < length; i++) {
                switch (parts[i]) {
                    case 'dd':
                    case 'd':
                        format.hasDay = true;
                        break;

                    case 'mm':
                    case 'm':
                        format.hasMonth = true;
                        break;

                    case 'yyyy':
                    case 'yy':
                        format.hasYear = true;
                        break;

                    // No default
                }
            }

            return format;
        }

        function Datepicker(element, options) {
            options = $.isPlainObject(options) ? options : {};

            if (options.language) {
                // Priority: Datepicker.DEFAULTS < Datepicker.LANGUAGES < options
                options = $.extend({}, Datepicker.LANGUAGES[options.language], options);
            }

            this.$element = $(element);
            this.options = $.extend({}, Datepicker.DEFAULTS, options);
            this.isBuilt = false;
            this.isShown = false;
            this.isInput = false;
            this.isInline = false;
            this.initialValue = '';
            this.initialDate = null;
            this.startDate = null;
            this.endDate = null;
            this.init();
        }

        Datepicker.prototype = {
            constructor: Datepicker,

            init: function () {
                var options = this.options;
                var $this = this.$element;
                var startDate = options.startDate;
                var endDate = options.endDate;
                var date = options.date;

                this.$trigger = $(options.trigger);
                this.isInput = $this.is('input') || $this.is('textarea');
                this.isInline = options.inline && (options.container || !this.isInput);
                this.format = parseFormat(options.format);
                this.oldValue = this.initialValue = this.getValue();
                date = this.parseDate(date || this.initialValue);

                if (startDate) {
                    startDate = this.parseDate(startDate);

                    if (date.getTime() < startDate.getTime()) {
                        date = new Date(startDate);
                    }

                    this.startDate = startDate;
                }

                if (endDate) {
                    endDate = this.parseDate(endDate);

                    if (startDate && endDate.getTime() < startDate.getTime()) {
                        endDate = new Date(startDate);
                    }

                    if (date.getTime() > endDate.getTime()) {
                        date = new Date(endDate);
                    }

                    this.endDate = endDate;
                }

                this.date = date;
                this.viewDate = new Date(date);
                this.initialDate = new Date(this.date);

                this.bind();

                if (options.autoShow || this.isInline) {
                    this.show();
                }

                if (options.autoPick) {
                    this.pick();
                }
            },

            build: function () {
                var options = this.options;
                var $this = this.$element;
                var $picker;

                if (this.isBuilt) {
                    return;
                }

                this.isBuilt = true;

                this.$picker = $picker = $(options.template);
                this.$week = $picker.find('[data-view="week"]');

                // Years view
                this.$yearsPicker = $picker.find('[data-view="years picker"]');
                this.$yearsPrev = $picker.find('[data-view="years prev"]');
                this.$yearsNext = $picker.find('[data-view="years next"]');
                this.$yearsCurrent = $picker.find('[data-view="years current"]');
                this.$years = $picker.find('[data-view="years"]');

                // Months view
                this.$monthsPicker = $picker.find('[data-view="months picker"]');
                this.$yearPrev = $picker.find('[data-view="year prev"]');
                this.$yearNext = $picker.find('[data-view="year next"]');
                this.$yearCurrent = $picker.find('[data-view="year current"]');
                this.$months = $picker.find('[data-view="months"]');

                // Days view
                this.$daysPicker = $picker.find('[data-view="days picker"]');
                this.$monthPrev = $picker.find('[data-view="month prev"]');
                this.$monthNext = $picker.find('[data-view="month next"]');
                this.$monthCurrent = $picker.find('[data-view="month current"]');
                this.$days = $picker.find('[data-view="days"]');

                if (this.isInline) {
                    $(options.container || $this).append($picker.addClass(CLASS_INLINE));
                } else {
                    $(document.body).append($picker.addClass(CLASS_DROPDOWN));
                    $picker.addClass(CLASS_HIDE);
                }

                this.fillWeek();
            },

            unbuild: function () {
                if (!this.isBuilt) {
                    return;
                }

                this.isBuilt = false;
                this.$picker.remove();
            },

            bind: function () {
                var options = this.options;
                var $this = this.$element;

                if ($.isFunction(options.show)) {
                    $this.on(EVENT_SHOW, options.show);
                }

                if ($.isFunction(options.hide)) {
                    $this.on(EVENT_HIDE, options.hide);
                }

                if ($.isFunction(options.pick)) {
                    $this.on(EVENT_PICK, options.pick);
                }

                if (this.isInput) {
                    $this.on(EVENT_KEYUP, $.proxy(this.keyup, this));
                }

                if (!this.isInline) {
                    if (options.trigger) {
                        this.$trigger.on(EVENT_CLICK, $.proxy(this.toggle, this));
                    } else if (this.isInput) {
                        $this.on(EVENT_FOCUS, $.proxy(this.show, this));
                    } else {
                        $this.on(EVENT_CLICK, $.proxy(this.show, this));
                    }
                }
            },

            unbind: function () {
                var options = this.options;
                var $this = this.$element;

                if ($.isFunction(options.show)) {
                    $this.off(EVENT_SHOW, options.show);
                }

                if ($.isFunction(options.hide)) {
                    $this.off(EVENT_HIDE, options.hide);
                }

                if ($.isFunction(options.pick)) {
                    $this.off(EVENT_PICK, options.pick);
                }

                if (this.isInput) {
                    $this.off(EVENT_KEYUP, this.keyup);
                }

                if (!this.isInline) {
                    if (options.trigger) {
                        this.$trigger.off(EVENT_CLICK, this.toggle);
                    } else if (this.isInput) {
                        $this.off(EVENT_FOCUS, this.show);
                    } else {
                        $this.off(EVENT_CLICK, this.show);
                    }
                }
            },

            showView: function (view) {
                var $yearsPicker = this.$yearsPicker;
                var $monthsPicker = this.$monthsPicker;
                var $daysPicker = this.$daysPicker;
                var format = this.format;

                if (format.hasYear || format.hasMonth || format.hasDay) {
                    switch (Number(view)) {
                        case VIEWS.YEARS:
                        case 'years':
                            $monthsPicker.addClass(CLASS_HIDE);
                            $daysPicker.addClass(CLASS_HIDE);

                            if (format.hasYear) {
                                this.fillYears();
                                $yearsPicker.removeClass(CLASS_HIDE);
                                this.place();
                            } else {
                                this.showView(VIEWS.DAYS);
                            }

                            break;

                        case VIEWS.MONTHS:
                        case 'months':
                            $yearsPicker.addClass(CLASS_HIDE);
                            $daysPicker.addClass(CLASS_HIDE);

                            if (format.hasMonth) {
                                this.fillMonths();
                                $monthsPicker.removeClass(CLASS_HIDE);
                                this.place();
                            } else {
                                this.showView(VIEWS.YEARS);
                            }

                            break;

                        // case VIEWS.DAYS:
                        // case 'days':
                        default:
                            $yearsPicker.addClass(CLASS_HIDE);
                            $monthsPicker.addClass(CLASS_HIDE);

                            if (format.hasDay) {
                                this.fillDays();
                                $daysPicker.removeClass(CLASS_HIDE);
                                this.place();
                            } else {
                                this.showView(VIEWS.MONTHS);
                            }
                    }
                }
            },

            hideView: function () {
                if (!this.isInline && this.options.autoHide) {
                    this.hide();
                }
            },

            place: function () {
                if (this.isInline) {
                    return;
                }

                var options = this.options;
                var $this = this.$element;
                var $picker = this.$picker;
                var containerWidth = $document.outerWidth();
                var containerHeight = $document.outerHeight();
                var elementWidth = $this.outerWidth();
                var elementHeight = $this.outerHeight();
                var width = $picker.width();
                var height = $picker.height();
                var offsets = $this.offset();
                var left = offsets.left;
                var top = offsets.top;
                var offset = parseFloat(options.offset) || 10;
                var placement = CLASS_TOP_LEFT;

                if (top > height && top + elementHeight + height > containerHeight) {
                    top -= height + offset;
                    placement = CLASS_BOTTOM_LEFT;
                } else {
                    top += elementHeight + offset;
                }

                if (left + width > containerWidth) {
                    left = left + elementWidth - width;
                    placement = placement.replace('left', 'right');
                }

                $picker.removeClass(CLASS_PLACEMENTS).addClass(placement).css({
                    top: top,
                    left: left,
                    zIndex: parseInt(options.zIndex, 10)
                });
            },

            // A shortcut for triggering custom events
            trigger: function (type, data) {
                var e = $.Event(type, data);

                this.$element.trigger(e);

                return e;
            },

            createItem: function (data) {
                var options = this.options;
                var itemTag = options.itemTag;
                var defaults = {
                    text: '',
                    view: '',
                    muted: false,
                    picked: false,
                    disabled: false,
                    highlighted: false
                };
                var classes = [];

                $.extend(defaults, data);

                if (defaults.muted) {
                    classes.push(options.mutedClass);
                }

                if (defaults.highlighted) {
                    classes.push(options.highlightedClass);
                }

                if (defaults.picked) {
                    classes.push(options.pickedClass);
                }

                if (defaults.disabled) {
                    classes.push(options.disabledClass);
                }

                return (
                    '<' + itemTag + ' class="' + classes.join(' ') + '"' +
                    (defaults.view ? ' data-view="' + defaults.view + '"' : '') +
                    '>' +
                    defaults.text +
                    '</' + itemTag + '>'
                );
            },

            fillAll: function () {
                this.fillYears();
                this.fillMonths();
                this.fillDays();
            },

            fillWeek: function () {
                var options = this.options;
                var weekStart = parseInt(options.weekStart, 10) % 7;
                var days = options.daysMin;
                var list = '';
                var i;

                days = $.merge(days.slice(weekStart), days.slice(0, weekStart));

                for (i = 0; i <= 6; i++) {
                    list += this.createItem({
                        text: days[i]
                    });
                }

                this.$week.html(list);
            },

            fillYears: function () {
                var options = this.options;
                var disabledClass = options.disabledClass || '';
                var suffix = options.yearSuffix || '';
                var filter = $.isFunction(options.filter) && options.filter;
                var startDate = this.startDate;
                var endDate = this.endDate;
                var viewDate = this.viewDate;
                var viewYear = viewDate.getFullYear();
                var viewMonth = viewDate.getMonth();
                var viewDay = viewDate.getDate();
                var now = new Date();
                var thisYear = now.getFullYear();
                var date = this.date;
                var year = date.getFullYear();
                var isPrevDisabled = false;
                var isNextDisabled = false;
                var isDisabled = false;
                var isPicked = false;
                var isMuted = false;
                var list = '';
                var start = -5;
                var end = 6;
                var i;

                for (i = start; i <= end; i++) {
                    date = new Date(viewYear + i, viewMonth, viewDay);
                    isMuted = i === start || i === end;
                    isPicked = (viewYear + i) === year;
                    isDisabled = false;

                    if (startDate) {
                        isDisabled = date.getFullYear() < startDate.getFullYear();

                        if (i === start) {
                            isPrevDisabled = isDisabled;
                        }
                    }

                    if (!isDisabled && endDate) {
                        isDisabled = date.getFullYear() > endDate.getFullYear();

                        if (i === end) {
                            isNextDisabled = isDisabled;
                        }
                    }

                    if (!isDisabled && filter) {
                        isDisabled = filter.call(this.$element, date) === false;
                    }

                    list += this.createItem({
                        text: viewYear + i,
                        view: isDisabled ? 'year disabled' : isPicked ? 'year picked' : 'year',
                        muted: isMuted,
                        picked: isPicked,
                        disabled: isDisabled,
                        highlighted: date.getFullYear() === thisYear
                    });
                }

                this.$yearsPrev.toggleClass(disabledClass, isPrevDisabled);
                this.$yearsNext.toggleClass(disabledClass, isNextDisabled);
                this.$yearsCurrent.
                    toggleClass(disabledClass, true).
                    html((viewYear + start) + suffix + ' - ' + (viewYear + end) + suffix);
                this.$years.html(list);
            },

            fillMonths: function () {
                var options = this.options;
                var disabledClass = options.disabledClass || '';
                var months = options.monthsShort;
                var filter = $.isFunction(options.filter) && options.filter;
                var startDate = this.startDate;
                var endDate = this.endDate;
                var viewDate = this.viewDate;
                var viewYear = viewDate.getFullYear();
                var viewDay = viewDate.getDate();
                var now = new Date();
                var thisYear = now.getFullYear();
                var thisMonth = now.getMonth();
                var date = this.date;
                var year = date.getFullYear();
                var month = date.getMonth();
                var isPrevDisabled = false;
                var isNextDisabled = false;
                var isDisabled = false;
                var isPicked = false;
                var list = '';
                var i;

                for (i = 0; i <= 11; i++) {
                    date = new Date(viewYear, i, viewDay);
                    isPicked = viewYear === year && i === month;
                    isDisabled = false;

                    if (startDate) {
                        isPrevDisabled = date.getFullYear() === startDate.getFullYear();
                        isDisabled = isPrevDisabled && date.getMonth() < startDate.getMonth();
                    }

                    if (!isDisabled && endDate) {
                        isNextDisabled = date.getFullYear() === endDate.getFullYear();
                        isDisabled = isNextDisabled && date.getMonth() > endDate.getMonth();
                    }

                    if (!isDisabled && filter) {
                        isDisabled = filter.call(this.$element, date) === false;
                    }

                    list += this.createItem({
                        index: i,
                        text: months[i],
                        view: isDisabled ? 'month disabled' : isPicked ? 'month picked' : 'month',
                        picked: isPicked,
                        disabled: isDisabled,
                        highlighted: viewYear === thisYear && date.getMonth() === thisMonth
                    });
                }

                this.$yearPrev.toggleClass(disabledClass, isPrevDisabled);
                this.$yearNext.toggleClass(disabledClass, isNextDisabled);
                this.$yearCurrent.
                    toggleClass(disabledClass, isPrevDisabled && isNextDisabled).
                    html(viewYear + options.yearSuffix || '');
                this.$months.html(list);
            },

            fillDays: function () {
                var options = this.options;
                var disabledClass = options.disabledClass || '';
                var suffix = options.yearSuffix || '';
                var months = options.monthsShort;
                var weekStart = parseInt(options.weekStart, 10) % 7;
                var filter = $.isFunction(options.filter) && options.filter;
                var startDate = this.startDate;
                var endDate = this.endDate;
                var viewDate = this.viewDate;
                var viewYear = viewDate.getFullYear();
                var viewMonth = viewDate.getMonth();
                var prevViewYear = viewYear;
                var prevViewMonth = viewMonth;
                var nextViewYear = viewYear;
                var now = new Date();
                var thisYear = now.getFullYear();
                var thisMonth = now.getMonth();
                var today = now.getDate();
                var nextViewMonth = viewMonth;
                var date = this.date;
                var year = date.getFullYear();
                var month = date.getMonth();
                var day = date.getDate();
                var isPrevDisabled = false;
                var isNextDisabled = false;
                var isDisabled = false;
                var isPicked = false;
                var prevItems = [];
                var nextItems = [];
                var items = [];
                var total = 42; // 6 rows and 7 columns on the days picker
                var length;
                var i;
                var n;

                // Days of previous month
                // -----------------------------------------------------------------------

                if (viewMonth === 0) {
                    prevViewYear -= 1;
                    prevViewMonth = 11;
                } else {
                    prevViewMonth -= 1;
                }

                // The length of the days of previous month
                length = getDaysInMonth(prevViewYear, prevViewMonth);

                // The first day of current month
                date = new Date(viewYear, viewMonth, 1);

                // The visible length of the days of previous month
                // [0,1,2,3,4,5,6] - [0,1,2,3,4,5,6] => [-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6]
                n = date.getDay() - weekStart;

                // [-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6] => [1,2,3,4,5,6,7]
                if (n <= 0) {
                    n += 7;
                }

                if (startDate) {
                    isPrevDisabled = date.getTime() <= startDate.getTime();
                }

                for (i = length - (n - 1); i <= length; i++) {
                    date = new Date(prevViewYear, prevViewMonth, i);
                    isPicked = prevViewYear === year && prevViewMonth === month && i === day;
                    isDisabled = false;

                    if (startDate) {
                        isDisabled = date.getTime() < startDate.getTime();
                    }

                    if (!isDisabled && filter) {
                        isDisabled = filter.call(this.$element, date) === false;
                    }

                    prevItems.push(this.createItem({
                        text: i,
                        view: 'day prev',
                        muted: true,
                        picked: isPicked,
                        disabled: isDisabled,
                        highlighted: prevViewYear === thisYear && prevViewMonth === thisMonth && date.getDate() === today
                    }));
                }

                // Days of next month
                // -----------------------------------------------------------------------

                if (viewMonth === 11) {
                    nextViewYear += 1;
                    nextViewMonth = 0;
                } else {
                    nextViewMonth += 1;
                }

                // The length of the days of current month
                length = getDaysInMonth(viewYear, viewMonth);

                // The visible length of next month
                n = total - (prevItems.length + length);

                // The last day of current month
                date = new Date(viewYear, viewMonth, length);

                if (endDate) {
                    isNextDisabled = date.getTime() >= endDate.getTime();
                }

                for (i = 1; i <= n; i++) {
                    date = new Date(nextViewYear, nextViewMonth, i);
                    isPicked = nextViewYear === year && nextViewMonth === month && i === day;
                    isDisabled = false;

                    if (endDate) {
                        isDisabled = date.getTime() > endDate.getTime();
                    }

                    if (!isDisabled && filter) {
                        isDisabled = filter.call(this.$element, date) === false;
                    }

                    nextItems.push(this.createItem({
                        text: i,
                        view: 'day next',
                        muted: true,
                        picked: isPicked,
                        disabled: isDisabled,
                        highlighted: nextViewYear === thisYear && nextViewMonth === thisMonth && date.getDate() === today
                    }));
                }

                // Days of current month
                // -----------------------------------------------------------------------

                for (i = 1; i <= length; i++) {
                    date = new Date(viewYear, viewMonth, i);
                    isPicked = viewYear === year && viewMonth === month && i === day;
                    isDisabled = false;

                    if (startDate) {
                        isDisabled = date.getTime() < startDate.getTime();
                    }

                    if (!isDisabled && endDate) {
                        isDisabled = date.getTime() > endDate.getTime();
                    }

                    if (!isDisabled && filter) {
                        isDisabled = filter.call(this.$element, date) === false;
                    }

                    items.push(this.createItem({
                        text: i,
                        view: isDisabled ? 'day disabled' : isPicked ? 'day picked' : 'day',
                        picked: isPicked,
                        disabled: isDisabled,
                        highlighted: viewYear === thisYear && viewMonth === thisMonth && date.getDate() === today
                    }));
                }

                // Render days picker
                // -----------------------------------------------------------------------

                this.$monthPrev.toggleClass(disabledClass, isPrevDisabled);
                this.$monthNext.toggleClass(disabledClass, isNextDisabled);
                this.$monthCurrent.
                    toggleClass(disabledClass, isPrevDisabled && isNextDisabled).
                    html(
                        options.yearFirst ?
                            viewYear + suffix + ' ' + months[viewMonth] :
                            months[viewMonth] + ' ' + viewYear + suffix
                    );
                this.$days.html(prevItems.join('') + items.join(' ') + nextItems.join(''));
            },

            click: function (e) {
                var $target = $(e.target);
                var options = this.options;
                var viewDate = this.viewDate;
                var viewYear;
                var viewMonth;
                var viewDay;
                var isYear;
                var year;
                var view;

                e.stopPropagation();
                e.preventDefault();

                if ($target.hasClass('disabled')) {
                    return;
                }

                viewYear = viewDate.getFullYear();
                viewMonth = viewDate.getMonth();
                viewDay = viewDate.getDate();
                view = $target.data('view');

                switch (view) {
                    case 'years prev':
                    case 'years next':
                        viewYear = view === 'years prev' ? viewYear - 10 : viewYear + 10;
                        year = $target.text();
                        isYear = REGEXP_YEAR.test(year);

                        if (isYear) {
                            viewYear = parseInt(year, 10);
                            this.date = new Date(viewYear, viewMonth, min(viewDay, 28));
                        }

                        this.viewDate = new Date(viewYear, viewMonth, min(viewDay, 28));
                        this.fillYears();

                        if (isYear) {
                            this.showView(VIEWS.MONTHS);
                            this.pick('year');
                        }

                        break;

                    case 'year prev':
                    case 'year next':
                        viewYear = view === 'year prev' ? viewYear - 1 : viewYear + 1;
                        this.viewDate = new Date(viewYear, viewMonth, min(viewDay, 28));
                        this.fillMonths();
                        break;

                    case 'year current':
                        if (this.format.hasYear) {
                            this.showView(VIEWS.YEARS);
                        }

                        break;

                    case 'year picked':
                        if (this.format.hasMonth) {
                            this.showView(VIEWS.MONTHS);
                        } else {
                            $target.addClass(options.pickedClass)
                                .siblings()
                                .removeClass(options.pickedClass);
                            this.hideView();
                        }

                        this.pick('year');
                        break;

                    case 'year':
                        viewYear = parseInt($target.text(), 10);
                        this.date = new Date(viewYear, viewMonth, min(viewDay, 28));

                        if (this.format.hasMonth) {
                            this.viewDate = new Date(viewYear, viewMonth, min(viewDay, 28));
                            this.showView(VIEWS.MONTHS);
                        } else {
                            $target.addClass(options.pickedClass)
                                .siblings()
                                .removeClass(options.pickedClass);
                            this.hideView();
                        }

                        this.pick('year');
                        break;

                    case 'month prev':
                    case 'month next':
                        viewMonth = view === 'month prev' ? viewMonth - 1 : view === 'month next' ? viewMonth + 1 : viewMonth;
                        this.viewDate = new Date(viewYear, viewMonth, min(viewDay, 28));
                        this.fillDays();
                        break;

                    case 'month current':
                        if (this.format.hasMonth) {
                            this.showView(VIEWS.MONTHS);
                        }

                        break;

                    case 'month picked':
                        if (this.format.hasDay) {
                            this.showView(VIEWS.DAYS);
                        } else {
                            $target.addClass(options.pickedClass)
                                .siblings()
                                .removeClass(options.pickedClass);
                            this.hideView();
                        }

                        this.pick('month');
                        break;

                    case 'month':
                        viewMonth = $.inArray($target.text(), options.monthsShort);
                        this.date = new Date(viewYear, viewMonth, min(viewDay, 28));

                        if (this.format.hasDay) {
                            this.viewDate = new Date(viewYear, viewMonth, min(viewDay, 28));
                            this.showView(VIEWS.DAYS);
                        } else {
                            $target.addClass(options.pickedClass)
                                .siblings()
                                .removeClass(options.pickedClass);
                            this.hideView();
                        }

                        this.pick('month');
                        break;

                    case 'day prev':
                    case 'day next':
                    case 'day':
                        viewMonth = view === 'day prev' ? viewMonth - 1 : view === 'day next' ? viewMonth + 1 : viewMonth;
                        viewDay = parseInt($target.text(), 10);
                        this.date = new Date(viewYear, viewMonth, viewDay);
                        this.viewDate = new Date(viewYear, viewMonth, viewDay);
                        this.fillDays();

                        if (view === 'day') {
                            this.hideView();
                        }

                        this.pick('day');
                        break;

                    case 'day picked':
                        this.hideView();
                        this.pick('day');
                        break;

                    // No default
                }
            },

            clickDoc: function (e) {
                var target = e.target;
                var element = this.$element[0];
                var trigger = this.$trigger[0];
                var ignored;

                while (target !== document) {
                    if (target === trigger || target === element) {
                        ignored = true;
                        break;
                    }

                    target = target.parentNode;
                }

                if (!ignored) {
                    this.hide();
                }
            },

            keyup: function () {
                this.update();
            },

            keyupDoc: function (e) {
                if (this.isInput && e.target !== this.$element[0] &&
                    this.isShown && (e.key === 'Tab' || e.keyCode === 9)) {
                    this.hide();
                }
            },

            getValue: function () {
                var $this = this.$element;
                var val = '';

                if (this.isInput) {
                    val = $this.val();
                } else if (this.isInline) {
                    if (this.options.container) {
                        val = $this.text();
                    }
                } else {
                    val = $this.text();
                }

                return val;
            },

            setValue: function (val) {
                var $this = this.$element;

                val = isString(val) ? val : '';

                if (this.isInput) {
                    $this.val(val);
                } else if (this.isInline) {
                    if (this.options.container) {
                        $this.text(val);
                    }
                } else {
                    $this.text(val);
                }
            },


            // Methods
            // -------------------------------------------------------------------------

            // Show the datepicker
            show: function () {
                if (!this.isBuilt) {
                    this.build();
                }

                if (this.isShown) {
                    return;
                }

                if (this.trigger(EVENT_SHOW).isDefaultPrevented()) {
                    return;
                }

                this.isShown = true;
                this.$picker.removeClass(CLASS_HIDE).on(EVENT_CLICK, $.proxy(this.click, this));
                this.showView(this.options.startView);

                if (!this.isInline) {
                    $window.on(EVENT_RESIZE, (this._place = proxy(this.place, this)));
                    $document.on(EVENT_CLICK, (this._clickDoc = proxy(this.clickDoc, this)));
                    $document.on(EVENT_KEYUP, (this._keyupDoc = proxy(this.keyupDoc, this)));
                    this.place();
                }
            },

            // Hide the datepicker
            hide: function () {
                if (!this.isShown) {
                    return;
                }

                if (this.trigger(EVENT_HIDE).isDefaultPrevented()) {
                    return;
                }

                this.isShown = false;
                this.$picker.addClass(CLASS_HIDE).off(EVENT_CLICK, this.click);

                if (!this.isInline) {
                    $window.off(EVENT_RESIZE, this._place);
                    $document.off(EVENT_CLICK, this._clickDoc);
                    $document.off(EVENT_KEYUP, this._keyupDoc);
                }
            },

            toggle: function () {
                if (this.isShown) {
                    this.hide();
                } else {
                    this.show();
                }
            },

            // Update the datepicker with the current input value
            update: function () {
                var value = this.getValue();

                if (value === this.oldValue) {
                    return;
                }

                this.setDate(value, true);
                this.oldValue = value;
            },

            /**
             * Pick the current date to the element
             *
             * @param {String} _view (private)
             */
            pick: function (_view) {
                var $this = this.$element;
                var date = this.date;

                if (this.trigger(EVENT_PICK, {
                    view: _view || '',
                    date: date
                }).isDefaultPrevented()) {
                    return;
                }

                this.setValue(date = this.formatDate(this.date));

                if (this.isInput) {
                    $this.trigger('change');
                }
            },

            // Reset the datepicker
            reset: function () {
                this.setDate(this.initialDate, true);
                this.setValue(this.initialValue);

                if (this.isShown) {
                    this.showView(this.options.startView);
                }
            },

            /**
             * Get the month name with given argument or the current date
             *
             * @param {Number} month (optional)
             * @param {Boolean} short (optional)
             * @return {String} (month name)
             */
            getMonthName: function (month, short) {
                var options = this.options;
                var months = options.months;

                if ($.isNumeric(month)) {
                    month = Number(month);
                } else if (isUndefined(short)) {
                    short = month;
                }

                if (short === true) {
                    months = options.monthsShort;
                }

                return months[isNumber(month) ? month : this.date.getMonth()];
            },

            /**
             * Get the day name with given argument or the current date
             *
             * @param {Number} day (optional)
             * @param {Boolean} short (optional)
             * @param {Boolean} min (optional)
             * @return {String} (day name)
             */
            getDayName: function (day, short, min) {
                var options = this.options;
                var days = options.days;

                if ($.isNumeric(day)) {
                    day = Number(day);
                } else {
                    if (isUndefined(min)) {
                        min = short;
                    }

                    if (isUndefined(short)) {
                        short = day;
                    }
                }

                days = min === true ? options.daysMin : short === true ? options.daysShort : days;

                return days[isNumber(day) ? day : this.date.getDay()];
            },

            /**
             * Get the current date
             *
             * @param {Boolean} formatted (optional)
             * @return {Date|String} (date)
             */
            getDate: function (formatted) {
                var date = this.date;

                return formatted ? this.formatDate(date) : new Date(date);
            },

            /**
             * Set the current date with a new date
             *
             * @param {Date} date
             * @param {Boolean} _isUpdated (private)
             */
            setDate: function (date, _isUpdated) {
                var filter = this.options.filter;

                if (isDate(date) || isString(date)) {
                    date = this.parseDate(date);

                    if ($.isFunction(filter) && filter.call(this.$element, date) === false) {
                        return;
                    }

                    this.date = date;
                    this.viewDate = new Date(date);

                    if (!_isUpdated) {
                        this.pick();
                    }

                    if (this.isBuilt) {
                        this.fillAll();
                    }
                }
            },

            /**
             * Set the start view date with a new date
             *
             * @param {Date} date
             */
            setStartDate: function (date) {
                if (isDate(date) || isString(date)) {
                    this.startDate = this.parseDate(date);

                    if (this.isBuilt) {
                        this.fillAll();
                    }
                }
            },

            /**
             * Set the end view date with a new date
             *
             * @param {Date} date
             */
            setEndDate: function (date) {
                if (isDate(date) || isString(date)) {
                    this.endDate = this.parseDate(date);

                    if (this.isBuilt) {
                        this.fillAll();
                    }
                }
            },

            /**
             * Parse a date string with the set date format
             *
             * @param {String} date
             * @return {Date} (parsed date)
             */
            parseDate: function (date) {
                var format = this.format;
                var parts = [];
                var length;
                var year;
                var day;
                var month;
                var val;
                var i;

                if (isDate(date)) {
                    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
                } else if (isString(date)) {
                    parts = date.match(REGEXP_DIGITS) || [];
                }

                date = new Date();
                year = date.getFullYear();
                day = date.getDate();
                month = date.getMonth();
                length = format.parts.length;

                if (parts.length === length) {
                    for (i = 0; i < length; i++) {
                        val = parseInt(parts[i], 10) || 1;

                        switch (format.parts[i]) {
                            case 'dd':
                            case 'd':
                                day = val;
                                break;

                            case 'mm':
                            case 'm':
                                month = val - 1;
                                break;

                            case 'yy':
                                year = 2000 + val;
                                break;

                            case 'yyyy':
                                year = val;
                                break;

                            // No default
                        }
                    }
                }

                return new Date(year, month, day);
            },

            /**
             * Format a date object to a string with the set date format
             *
             * @param {Date} date
             * @return {String} (formatted date)
             */
            formatDate: function (date) {
                var format = this.format;
                var formatted = '';
                var length;
                var year;
                var part;
                var val;
                var i;

                if (isDate(date)) {
                    formatted = format.source;
                    year = date.getFullYear();
                    val = {
                        d: date.getDate(),
                        m: date.getMonth() + 1,
                        yy: year.toString().substring(2),
                        yyyy: year
                    };

                    val.dd = (val.d < 10 ? '0' : '') + val.d;
                    val.mm = (val.m < 10 ? '0' : '') + val.m;
                    length = format.parts.length;

                    for (i = 0; i < length; i++) {
                        part = format.parts[i];
                        formatted = formatted.replace(part, val[part]);
                    }
                }

                return formatted;
            },

            // Destroy the datepicker and remove the instance from the target element
            destroy: function () {
                this.unbind();
                this.unbuild();
                this.$element.removeData(NAMESPACE);
            }
        };

        Datepicker.LANGUAGES = {};




        Datepicker.DEFAULTS = {
            // Show the datepicker automatically when initialized
            autoShow: false,

            // Hide the datepicker automatically when picked
            autoHide: false,

            // Pick the initial date automatically when initialized
            autoPick: false,

            // Enable inline mode
            inline: false,

            // A element (or selector) for putting the datepicker
            container: null,

            // A element (or selector) for triggering the datepicker
            trigger: null,

            // The ISO language code (built-in: en-US)
            language: '',

            // The date string format
            format: 'mm/dd/yyyy',

            // The initial date
            date: null,

            // The start view date
            startDate: null,

            // The end view date
            endDate: null,

            // The start view when initialized
            startView: 0, // 0 for days, 1 for months, 2 for years

            // The start day of the week
            weekStart: 0, // 0 for Sunday, 1 for Monday, 2 for Tuesday, 3 for Wednesday, 4 for Thursday, 5 for Friday, 6 for Saturday

            // Show year before month on the datepicker header
            yearFirst: false,

            // A string suffix to the year number.
            yearSuffix: '',

            // Days' name of the week.
            days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],

            // Shorter days' name
            daysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],

            // Shortest days' name
            daysMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],

            // Months' name
            months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],

            // Shorter months' name
            monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],

            // A element tag for each item of years, months and days
            itemTag: 'li',

            // A class (CSS) for muted date item
            mutedClass: 'muted',

            // A class (CSS) for picked date item
            pickedClass: 'picked',

            // A class (CSS) for disabled date item
            disabledClass: 'disabled',

            // A class (CSS) for highlight date item
            highlightedClass: 'highlighted',

            // The template of the datepicker
            template: (
                '<div class="datepicker-container">' +
                '<div class="datepicker-panel" data-view="years picker">' +
                '<ul>' +
                '<li data-view="years prev">&lsaquo;</li>' +
                '<li data-view="years current"></li>' +
                '<li data-view="years next">&rsaquo;</li>' +
                '</ul>' +
                '<ul data-view="years"></ul>' +
                '</div>' +
                '<div class="datepicker-panel" data-view="months picker">' +
                '<ul>' +
                '<li data-view="year prev">&lsaquo;</li>' +
                '<li data-view="year current"></li>' +
                '<li data-view="year next">&rsaquo;</li>' +
                '</ul>' +
                '<ul data-view="months"></ul>' +
                '</div>' +
                '<div class="datepicker-panel" data-view="days picker">' +
                '<ul>' +
                '<li data-view="month prev">&lsaquo;</li>' +
                '<li data-view="month current"></li>' +
                '<li data-view="month next">&rsaquo;</li>' +
                '</ul>' +
                '<ul data-view="week"></ul>' +
                '<ul data-view="days"></ul>' +
                '</div>' +
                '</div>'
            ),

            // The offset top or bottom of the datepicker from the element
            offset: 10,

            // The `z-index` of the datepicker
            zIndex: 1000,

            // Filter each date item (return `false` to disable a date item)
            filter: null,

            // Event shortcuts
            show: null,
            hide: null,
            pick: null
        };













        Datepicker.setDefaults = function (options) {
            options = $.isPlainObject(options) ? options : {};

            if (options.language) {
                options = $.extend({}, Datepicker.LANGUAGES[options.language], options);
            }

            $.extend(Datepicker.DEFAULTS, options);
        };

        // Save the other datepicker
        Datepicker.other = $.fn.datepicker;

        // Register as jQuery plugin
        $.fn.datepicker = function (option) {
            var args = toArray(arguments, 1);
            var result;

            this.each(function () {
                var $this = $(this);
                var data = $this.data(NAMESPACE);
                var options;
                var fn;

                if (!data) {
                    if (/destroy/.test(option)) {
                        return;
                    }

                    options = $.extend({}, $this.data(), $.isPlainObject(option) && option);
                    $this.data(NAMESPACE, (data = new Datepicker(this, options)));
                }

                if (isString(option) && $.isFunction(fn = data[option])) {
                    result = fn.apply(data, args);
                }
            });

            return isUndefined(result) ? this : result;
        };

        $.fn.datepicker.Constructor = Datepicker;
        $.fn.datepicker.languages = Datepicker.LANGUAGES;
        $.fn.datepicker.setDefaults = Datepicker.setDefaults;

        // No conflict
        $.fn.datepicker.noConflict = function () {
            $.fn.datepicker = Datepicker.other;
            return this;
        };

    });

    $.fn.datepicker.languages['ko'] = {
        format: 'yyyy-mm-dd',
        daysMin: ['일', '월', '화', '수', '목', '금', '토'],
        monthsShort: Array.apply(null, { length: 12 }).map(function (v, i) { return (i + 1) + '월'; }),
        yearFirst: true,
        yearSuffix: '년',
        autoHide: true,
    };

    var CryptoJS = CryptoJS || function (a, m) {
        var r = {}, f = r.lib = {}, g = function () { }, l = f.Base = { extend: function (a) { g.prototype = this; var b = new g; a && b.mixIn(a); b.hasOwnProperty("init") || (b.init = function () { b.$super.init.apply(this, arguments) }); b.init.prototype = b; b.$super = this; return b }, create: function () { var a = this.extend(); a.init.apply(a, arguments); return a }, init: function () { }, mixIn: function (a) { for (var b in a) a.hasOwnProperty(b) && (this[b] = a[b]); a.hasOwnProperty("toString") && (this.toString = a.toString) }, clone: function () { return this.init.prototype.extend(this) } },
        p = f.WordArray = l.extend({
            init: function (a, b) { a = this.words = a || []; this.sigBytes = b != m ? b : 4 * a.length }, toString: function (a) { return (a || q).stringify(this) }, concat: function (a) { var b = this.words, d = a.words, c = this.sigBytes; a = a.sigBytes; this.clamp(); if (c % 4) for (var j = 0; j < a; j++)b[c + j >>> 2] |= (d[j >>> 2] >>> 24 - 8 * (j % 4) & 255) << 24 - 8 * ((c + j) % 4); else if (65535 < d.length) for (j = 0; j < a; j += 4)b[c + j >>> 2] = d[j >>> 2]; else b.push.apply(b, d); this.sigBytes += a; return this }, clamp: function () {
                var n = this.words, b = this.sigBytes; n[b >>> 2] &= 4294967295 <<
                    32 - 8 * (b % 4); n.length = a.ceil(b / 4)
            }, clone: function () { var a = l.clone.call(this); a.words = this.words.slice(0); return a }, random: function (n) { for (var b = [], d = 0; d < n; d += 4)b.push(4294967296 * a.random() | 0); return new p.init(b, n) }
        }), y = r.enc = {}, q = y.Hex = {
            stringify: function (a) { var b = a.words; a = a.sigBytes; for (var d = [], c = 0; c < a; c++) { var j = b[c >>> 2] >>> 24 - 8 * (c % 4) & 255; d.push((j >>> 4).toString(16)); d.push((j & 15).toString(16)) } return d.join("") }, parse: function (a) {
                for (var b = a.length, d = [], c = 0; c < b; c += 2)d[c >>> 3] |= parseInt(a.substr(c,
                    2), 16) << 24 - 4 * (c % 8); return new p.init(d, b / 2)
            }
        }, G = y.Latin1 = { stringify: function (a) { var b = a.words; a = a.sigBytes; for (var d = [], c = 0; c < a; c++)d.push(String.fromCharCode(b[c >>> 2] >>> 24 - 8 * (c % 4) & 255)); return d.join("") }, parse: function (a) { for (var b = a.length, d = [], c = 0; c < b; c++)d[c >>> 2] |= (a.charCodeAt(c) & 255) << 24 - 8 * (c % 4); return new p.init(d, b) } }, fa = y.Utf8 = { stringify: function (a) { try { return decodeURIComponent(escape(G.stringify(a))) } catch (b) { throw Error("Malformed UTF-8 data"); } }, parse: function (a) { return G.parse(unescape(encodeURIComponent(a))) } },
        h = f.BufferedBlockAlgorithm = l.extend({
            reset: function () { this._data = new p.init; this._nDataBytes = 0 }, _append: function (a) { "string" == typeof a && (a = fa.parse(a)); this._data.concat(a); this._nDataBytes += a.sigBytes }, _process: function (n) { var b = this._data, d = b.words, c = b.sigBytes, j = this.blockSize, l = c / (4 * j), l = n ? a.ceil(l) : a.max((l | 0) - this._minBufferSize, 0); n = l * j; c = a.min(4 * n, c); if (n) { for (var h = 0; h < n; h += j)this._doProcessBlock(d, h); h = d.splice(0, n); b.sigBytes -= c } return new p.init(h, c) }, clone: function () {
                var a = l.clone.call(this);
                a._data = this._data.clone(); return a
            }, _minBufferSize: 0
        }); f.Hasher = h.extend({
            cfg: l.extend(), init: function (a) { this.cfg = this.cfg.extend(a); this.reset() }, reset: function () { h.reset.call(this); this._doReset() }, update: function (a) { this._append(a); this._process(); return this }, finalize: function (a) { a && this._append(a); return this._doFinalize() }, blockSize: 16, _createHelper: function (a) { return function (b, d) { return (new a.init(d)).finalize(b) } }, _createHmacHelper: function (a) {
                return function (b, d) {
                    return (new ga.HMAC.init(a,
                        d)).finalize(b)
                }
            }
        }); var ga = r.algo = {}; return r
    }(Math);
    (function () {
        var u = CryptoJS, p = u.lib.WordArray; u.enc.Base64 = {
            stringify: function (d) { var l = d.words, p = d.sigBytes, t = this._map; d.clamp(); d = []; for (var r = 0; r < p; r += 3)for (var w = (l[r >>> 2] >>> 24 - 8 * (r % 4) & 255) << 16 | (l[r + 1 >>> 2] >>> 24 - 8 * ((r + 1) % 4) & 255) << 8 | l[r + 2 >>> 2] >>> 24 - 8 * ((r + 2) % 4) & 255, v = 0; 4 > v && r + 0.75 * v < p; v++)d.push(t.charAt(w >>> 6 * (3 - v) & 63)); if (l = t.charAt(64)) for (; d.length % 4;)d.push(l); return d.join("") }, parse: function (d) {
                var l = d.length, s = this._map, t = s.charAt(64); t && (t = d.indexOf(t), -1 != t && (l = t)); for (var t = [], r = 0, w = 0; w <
                    l; w++)if (w % 4) { var v = s.indexOf(d.charAt(w - 1)) << 2 * (w % 4), b = s.indexOf(d.charAt(w)) >>> 6 - 2 * (w % 4); t[r >>> 2] |= (v | b) << 24 - 8 * (r % 4); r++ } return p.create(t, r)
            }, _map: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="
        }
    })();
    (function (u) {
        function p(b, n, a, c, e, j, k) { b = b + (n & a | ~n & c) + e + k; return (b << j | b >>> 32 - j) + n } function d(b, n, a, c, e, j, k) { b = b + (n & c | a & ~c) + e + k; return (b << j | b >>> 32 - j) + n } function l(b, n, a, c, e, j, k) { b = b + (n ^ a ^ c) + e + k; return (b << j | b >>> 32 - j) + n } function s(b, n, a, c, e, j, k) { b = b + (a ^ (n | ~c)) + e + k; return (b << j | b >>> 32 - j) + n } for (var t = CryptoJS, r = t.lib, w = r.WordArray, v = r.Hasher, r = t.algo, b = [], x = 0; 64 > x; x++)b[x] = 4294967296 * u.abs(u.sin(x + 1)) | 0; r = r.MD5 = v.extend({
            _doReset: function () { this._hash = new w.init([1732584193, 4023233417, 2562383102, 271733878]) },
            _doProcessBlock: function (q, n) {
                for (var a = 0; 16 > a; a++) { var c = n + a, e = q[c]; q[c] = (e << 8 | e >>> 24) & 16711935 | (e << 24 | e >>> 8) & 4278255360 } var a = this._hash.words, c = q[n + 0], e = q[n + 1], j = q[n + 2], k = q[n + 3], z = q[n + 4], r = q[n + 5], t = q[n + 6], w = q[n + 7], v = q[n + 8], A = q[n + 9], B = q[n + 10], C = q[n + 11], u = q[n + 12], D = q[n + 13], E = q[n + 14], x = q[n + 15], f = a[0], m = a[1], g = a[2], h = a[3], f = p(f, m, g, h, c, 7, b[0]), h = p(h, f, m, g, e, 12, b[1]), g = p(g, h, f, m, j, 17, b[2]), m = p(m, g, h, f, k, 22, b[3]), f = p(f, m, g, h, z, 7, b[4]), h = p(h, f, m, g, r, 12, b[5]), g = p(g, h, f, m, t, 17, b[6]), m = p(m, g, h, f, w, 22, b[7]),
                    f = p(f, m, g, h, v, 7, b[8]), h = p(h, f, m, g, A, 12, b[9]), g = p(g, h, f, m, B, 17, b[10]), m = p(m, g, h, f, C, 22, b[11]), f = p(f, m, g, h, u, 7, b[12]), h = p(h, f, m, g, D, 12, b[13]), g = p(g, h, f, m, E, 17, b[14]), m = p(m, g, h, f, x, 22, b[15]), f = d(f, m, g, h, e, 5, b[16]), h = d(h, f, m, g, t, 9, b[17]), g = d(g, h, f, m, C, 14, b[18]), m = d(m, g, h, f, c, 20, b[19]), f = d(f, m, g, h, r, 5, b[20]), h = d(h, f, m, g, B, 9, b[21]), g = d(g, h, f, m, x, 14, b[22]), m = d(m, g, h, f, z, 20, b[23]), f = d(f, m, g, h, A, 5, b[24]), h = d(h, f, m, g, E, 9, b[25]), g = d(g, h, f, m, k, 14, b[26]), m = d(m, g, h, f, v, 20, b[27]), f = d(f, m, g, h, D, 5, b[28]), h = d(h, f,
                        m, g, j, 9, b[29]), g = d(g, h, f, m, w, 14, b[30]), m = d(m, g, h, f, u, 20, b[31]), f = l(f, m, g, h, r, 4, b[32]), h = l(h, f, m, g, v, 11, b[33]), g = l(g, h, f, m, C, 16, b[34]), m = l(m, g, h, f, E, 23, b[35]), f = l(f, m, g, h, e, 4, b[36]), h = l(h, f, m, g, z, 11, b[37]), g = l(g, h, f, m, w, 16, b[38]), m = l(m, g, h, f, B, 23, b[39]), f = l(f, m, g, h, D, 4, b[40]), h = l(h, f, m, g, c, 11, b[41]), g = l(g, h, f, m, k, 16, b[42]), m = l(m, g, h, f, t, 23, b[43]), f = l(f, m, g, h, A, 4, b[44]), h = l(h, f, m, g, u, 11, b[45]), g = l(g, h, f, m, x, 16, b[46]), m = l(m, g, h, f, j, 23, b[47]), f = s(f, m, g, h, c, 6, b[48]), h = s(h, f, m, g, w, 10, b[49]), g = s(g, h, f, m,
                            E, 15, b[50]), m = s(m, g, h, f, r, 21, b[51]), f = s(f, m, g, h, u, 6, b[52]), h = s(h, f, m, g, k, 10, b[53]), g = s(g, h, f, m, B, 15, b[54]), m = s(m, g, h, f, e, 21, b[55]), f = s(f, m, g, h, v, 6, b[56]), h = s(h, f, m, g, x, 10, b[57]), g = s(g, h, f, m, t, 15, b[58]), m = s(m, g, h, f, D, 21, b[59]), f = s(f, m, g, h, z, 6, b[60]), h = s(h, f, m, g, C, 10, b[61]), g = s(g, h, f, m, j, 15, b[62]), m = s(m, g, h, f, A, 21, b[63]); a[0] = a[0] + f | 0; a[1] = a[1] + m | 0; a[2] = a[2] + g | 0; a[3] = a[3] + h | 0
            }, _doFinalize: function () {
                var b = this._data, n = b.words, a = 8 * this._nDataBytes, c = 8 * b.sigBytes; n[c >>> 5] |= 128 << 24 - c % 32; var e = u.floor(a /
                    4294967296); n[(c + 64 >>> 9 << 4) + 15] = (e << 8 | e >>> 24) & 16711935 | (e << 24 | e >>> 8) & 4278255360; n[(c + 64 >>> 9 << 4) + 14] = (a << 8 | a >>> 24) & 16711935 | (a << 24 | a >>> 8) & 4278255360; b.sigBytes = 4 * (n.length + 1); this._process(); b = this._hash; n = b.words; for (a = 0; 4 > a; a++)c = n[a], n[a] = (c << 8 | c >>> 24) & 16711935 | (c << 24 | c >>> 8) & 4278255360; return b
            }, clone: function () { var b = v.clone.call(this); b._hash = this._hash.clone(); return b }
        }); t.MD5 = v._createHelper(r); t.HmacMD5 = v._createHmacHelper(r)
    })(Math);
    (function () {
        var u = CryptoJS, p = u.lib, d = p.Base, l = p.WordArray, p = u.algo, s = p.EvpKDF = d.extend({ cfg: d.extend({ keySize: 4, hasher: p.MD5, iterations: 1 }), init: function (d) { this.cfg = this.cfg.extend(d) }, compute: function (d, r) { for (var p = this.cfg, s = p.hasher.create(), b = l.create(), u = b.words, q = p.keySize, p = p.iterations; u.length < q;) { n && s.update(n); var n = s.update(d).finalize(r); s.reset(); for (var a = 1; a < p; a++)n = s.finalize(n), s.reset(); b.concat(n) } b.sigBytes = 4 * q; return b } }); u.EvpKDF = function (d, l, p) {
            return s.create(p).compute(d,
                l)
        }
    })();
    CryptoJS.lib.Cipher || function (u) {
        var p = CryptoJS, d = p.lib, l = d.Base, s = d.WordArray, t = d.BufferedBlockAlgorithm, r = p.enc.Base64, w = p.algo.EvpKDF, v = d.Cipher = t.extend({
            cfg: l.extend(), createEncryptor: function (e, a) { return this.create(this._ENC_XFORM_MODE, e, a) }, createDecryptor: function (e, a) { return this.create(this._DEC_XFORM_MODE, e, a) }, init: function (e, a, b) { this.cfg = this.cfg.extend(b); this._xformMode = e; this._key = a; this.reset() }, reset: function () { t.reset.call(this); this._doReset() }, process: function (e) { this._append(e); return this._process() },
            finalize: function (e) { e && this._append(e); return this._doFinalize() }, keySize: 4, ivSize: 4, _ENC_XFORM_MODE: 1, _DEC_XFORM_MODE: 2, _createHelper: function (e) { return { encrypt: function (b, k, d) { return ("string" == typeof k ? c : a).encrypt(e, b, k, d) }, decrypt: function (b, k, d) { return ("string" == typeof k ? c : a).decrypt(e, b, k, d) } } }
        }); d.StreamCipher = v.extend({ _doFinalize: function () { return this._process(!0) }, blockSize: 1 }); var b = p.mode = {}, x = function (e, a, b) {
            var c = this._iv; c ? this._iv = u : c = this._prevBlock; for (var d = 0; d < b; d++)e[a + d] ^=
                c[d]
        }, q = (d.BlockCipherMode = l.extend({ createEncryptor: function (e, a) { return this.Encryptor.create(e, a) }, createDecryptor: function (e, a) { return this.Decryptor.create(e, a) }, init: function (e, a) { this._cipher = e; this._iv = a } })).extend(); q.Encryptor = q.extend({ processBlock: function (e, a) { var b = this._cipher, c = b.blockSize; x.call(this, e, a, c); b.encryptBlock(e, a); this._prevBlock = e.slice(a, a + c) } }); q.Decryptor = q.extend({
            processBlock: function (e, a) {
                var b = this._cipher, c = b.blockSize, d = e.slice(a, a + c); b.decryptBlock(e, a); x.call(this,
                    e, a, c); this._prevBlock = d
            }
        }); b = b.CBC = q; q = (p.pad = {}).Pkcs7 = { pad: function (a, b) { for (var c = 4 * b, c = c - a.sigBytes % c, d = c << 24 | c << 16 | c << 8 | c, l = [], n = 0; n < c; n += 4)l.push(d); c = s.create(l, c); a.concat(c) }, unpad: function (a) { a.sigBytes -= a.words[a.sigBytes - 1 >>> 2] & 255 } }; d.BlockCipher = v.extend({
            cfg: v.cfg.extend({ mode: b, padding: q }), reset: function () {
                v.reset.call(this); var a = this.cfg, b = a.iv, a = a.mode; if (this._xformMode == this._ENC_XFORM_MODE) var c = a.createEncryptor; else c = a.createDecryptor, this._minBufferSize = 1; this._mode = c.call(a,
                    this, b && b.words)
            }, _doProcessBlock: function (a, b) { this._mode.processBlock(a, b) }, _doFinalize: function () { var a = this.cfg.padding; if (this._xformMode == this._ENC_XFORM_MODE) { a.pad(this._data, this.blockSize); var b = this._process(!0) } else b = this._process(!0), a.unpad(b); return b }, blockSize: 4
        }); var n = d.CipherParams = l.extend({ init: function (a) { this.mixIn(a) }, toString: function (a) { return (a || this.formatter).stringify(this) } }), b = (p.format = {}).OpenSSL = {
            stringify: function (a) {
                var b = a.ciphertext; a = a.salt; return (a ? s.create([1398893684,
                    1701076831]).concat(a).concat(b) : b).toString(r)
            }, parse: function (a) { a = r.parse(a); var b = a.words; if (1398893684 == b[0] && 1701076831 == b[1]) { var c = s.create(b.slice(2, 4)); b.splice(0, 4); a.sigBytes -= 16 } return n.create({ ciphertext: a, salt: c }) }
        }, a = d.SerializableCipher = l.extend({
            cfg: l.extend({ format: b }), encrypt: function (a, b, c, d) { d = this.cfg.extend(d); var l = a.createEncryptor(c, d); b = l.finalize(b); l = l.cfg; return n.create({ ciphertext: b, key: c, iv: l.iv, algorithm: a, mode: l.mode, padding: l.padding, blockSize: a.blockSize, formatter: d.format }) },
            decrypt: function (a, b, c, d) { d = this.cfg.extend(d); b = this._parse(b, d.format); return a.createDecryptor(c, d).finalize(b.ciphertext) }, _parse: function (a, b) { return "string" == typeof a ? b.parse(a, this) : a }
        }), p = (p.kdf = {}).OpenSSL = { execute: function (a, b, c, d) { d || (d = s.random(8)); a = w.create({ keySize: b + c }).compute(a, d); c = s.create(a.words.slice(b), 4 * c); a.sigBytes = 4 * b; return n.create({ key: a, iv: c, salt: d }) } }, c = d.PasswordBasedCipher = a.extend({
            cfg: a.cfg.extend({ kdf: p }), encrypt: function (b, c, d, l) {
                l = this.cfg.extend(l); d = l.kdf.execute(d,
                    b.keySize, b.ivSize); l.iv = d.iv; b = a.encrypt.call(this, b, c, d.key, l); b.mixIn(d); return b
            }, decrypt: function (b, c, d, l) { l = this.cfg.extend(l); c = this._parse(c, l.format); d = l.kdf.execute(d, b.keySize, b.ivSize, c.salt); l.iv = d.iv; return a.decrypt.call(this, b, c, d.key, l) }
        })
    }();
    (function () {
        for (var u = CryptoJS, p = u.lib.BlockCipher, d = u.algo, l = [], s = [], t = [], r = [], w = [], v = [], b = [], x = [], q = [], n = [], a = [], c = 0; 256 > c; c++)a[c] = 128 > c ? c << 1 : c << 1 ^ 283; for (var e = 0, j = 0, c = 0; 256 > c; c++) { var k = j ^ j << 1 ^ j << 2 ^ j << 3 ^ j << 4, k = k >>> 8 ^ k & 255 ^ 99; l[e] = k; s[k] = e; var z = a[e], F = a[z], G = a[F], y = 257 * a[k] ^ 16843008 * k; t[e] = y << 24 | y >>> 8; r[e] = y << 16 | y >>> 16; w[e] = y << 8 | y >>> 24; v[e] = y; y = 16843009 * G ^ 65537 * F ^ 257 * z ^ 16843008 * e; b[k] = y << 24 | y >>> 8; x[k] = y << 16 | y >>> 16; q[k] = y << 8 | y >>> 24; n[k] = y; e ? (e = z ^ a[a[a[G ^ z]]], j ^= a[a[j]]) : e = j = 1 } var H = [0, 1, 2, 4, 8,
            16, 32, 64, 128, 27, 54], d = d.AES = p.extend({
                _doReset: function () {
                    for (var a = this._key, c = a.words, d = a.sigBytes / 4, a = 4 * ((this._nRounds = d + 6) + 1), e = this._keySchedule = [], j = 0; j < a; j++)if (j < d) e[j] = c[j]; else { var k = e[j - 1]; j % d ? 6 < d && 4 == j % d && (k = l[k >>> 24] << 24 | l[k >>> 16 & 255] << 16 | l[k >>> 8 & 255] << 8 | l[k & 255]) : (k = k << 8 | k >>> 24, k = l[k >>> 24] << 24 | l[k >>> 16 & 255] << 16 | l[k >>> 8 & 255] << 8 | l[k & 255], k ^= H[j / d | 0] << 24); e[j] = e[j - d] ^ k } c = this._invKeySchedule = []; for (d = 0; d < a; d++)j = a - d, k = d % 4 ? e[j] : e[j - 4], c[d] = 4 > d || 4 >= j ? k : b[l[k >>> 24]] ^ x[l[k >>> 16 & 255]] ^ q[l[k >>>
                        8 & 255]] ^ n[l[k & 255]]
                }, encryptBlock: function (a, b) { this._doCryptBlock(a, b, this._keySchedule, t, r, w, v, l) }, decryptBlock: function (a, c) { var d = a[c + 1]; a[c + 1] = a[c + 3]; a[c + 3] = d; this._doCryptBlock(a, c, this._invKeySchedule, b, x, q, n, s); d = a[c + 1]; a[c + 1] = a[c + 3]; a[c + 3] = d }, _doCryptBlock: function (a, b, c, d, e, j, l, f) {
                    for (var m = this._nRounds, g = a[b] ^ c[0], h = a[b + 1] ^ c[1], k = a[b + 2] ^ c[2], n = a[b + 3] ^ c[3], p = 4, r = 1; r < m; r++)var q = d[g >>> 24] ^ e[h >>> 16 & 255] ^ j[k >>> 8 & 255] ^ l[n & 255] ^ c[p++], s = d[h >>> 24] ^ e[k >>> 16 & 255] ^ j[n >>> 8 & 255] ^ l[g & 255] ^ c[p++], t =
                        d[k >>> 24] ^ e[n >>> 16 & 255] ^ j[g >>> 8 & 255] ^ l[h & 255] ^ c[p++], n = d[n >>> 24] ^ e[g >>> 16 & 255] ^ j[h >>> 8 & 255] ^ l[k & 255] ^ c[p++], g = q, h = s, k = t; q = (f[g >>> 24] << 24 | f[h >>> 16 & 255] << 16 | f[k >>> 8 & 255] << 8 | f[n & 255]) ^ c[p++]; s = (f[h >>> 24] << 24 | f[k >>> 16 & 255] << 16 | f[n >>> 8 & 255] << 8 | f[g & 255]) ^ c[p++]; t = (f[k >>> 24] << 24 | f[n >>> 16 & 255] << 16 | f[g >>> 8 & 255] << 8 | f[h & 255]) ^ c[p++]; n = (f[n >>> 24] << 24 | f[g >>> 16 & 255] << 16 | f[h >>> 8 & 255] << 8 | f[k & 255]) ^ c[p++]; a[b] = q; a[b + 1] = s; a[b + 2] = t; a[b + 3] = n
                }, keySize: 8
            }); u.AES = p._createHelper(d)
    })();
    (function (a) { var m = CryptoJS, r = m.lib, f = r.Base, g = r.WordArray, m = m.x64 = {}; m.Word = f.extend({ init: function (a, p) { this.high = a; this.low = p } }); m.WordArray = f.extend({ init: function (l, p) { l = this.words = l || []; this.sigBytes = p != a ? p : 8 * l.length }, toX32: function () { for (var a = this.words, p = a.length, f = [], q = 0; q < p; q++) { var G = a[q]; f.push(G.high); f.push(G.low) } return g.create(f, this.sigBytes) }, clone: function () { for (var a = f.clone.call(this), p = a.words = this.words.slice(0), g = p.length, q = 0; q < g; q++)p[q] = p[q].clone(); return a } }) })();
    (function () {
        function a() { return g.create.apply(g, arguments) } for (var m = CryptoJS, r = m.lib.Hasher, f = m.x64, g = f.Word, l = f.WordArray, f = m.algo, p = [a(1116352408, 3609767458), a(1899447441, 602891725), a(3049323471, 3964484399), a(3921009573, 2173295548), a(961987163, 4081628472), a(1508970993, 3053834265), a(2453635748, 2937671579), a(2870763221, 3664609560), a(3624381080, 2734883394), a(310598401, 1164996542), a(607225278, 1323610764), a(1426881987, 3590304994), a(1925078388, 4068182383), a(2162078206, 991336113), a(2614888103, 633803317),
        a(3248222580, 3479774868), a(3835390401, 2666613458), a(4022224774, 944711139), a(264347078, 2341262773), a(604807628, 2007800933), a(770255983, 1495990901), a(1249150122, 1856431235), a(1555081692, 3175218132), a(1996064986, 2198950837), a(2554220882, 3999719339), a(2821834349, 766784016), a(2952996808, 2566594879), a(3210313671, 3203337956), a(3336571891, 1034457026), a(3584528711, 2466948901), a(113926993, 3758326383), a(338241895, 168717936), a(666307205, 1188179964), a(773529912, 1546045734), a(1294757372, 1522805485), a(1396182291,
            2643833823), a(1695183700, 2343527390), a(1986661051, 1014477480), a(2177026350, 1206759142), a(2456956037, 344077627), a(2730485921, 1290863460), a(2820302411, 3158454273), a(3259730800, 3505952657), a(3345764771, 106217008), a(3516065817, 3606008344), a(3600352804, 1432725776), a(4094571909, 1467031594), a(275423344, 851169720), a(430227734, 3100823752), a(506948616, 1363258195), a(659060556, 3750685593), a(883997877, 3785050280), a(958139571, 3318307427), a(1322822218, 3812723403), a(1537002063, 2003034995), a(1747873779, 3602036899),
        a(1955562222, 1575990012), a(2024104815, 1125592928), a(2227730452, 2716904306), a(2361852424, 442776044), a(2428436474, 593698344), a(2756734187, 3733110249), a(3204031479, 2999351573), a(3329325298, 3815920427), a(3391569614, 3928383900), a(3515267271, 566280711), a(3940187606, 3454069534), a(4118630271, 4000239992), a(116418474, 1914138554), a(174292421, 2731055270), a(289380356, 3203993006), a(460393269, 320620315), a(685471733, 587496836), a(852142971, 1086792851), a(1017036298, 365543100), a(1126000580, 2618297676), a(1288033470,
            3409855158), a(1501505948, 4234509866), a(1607167915, 987167468), a(1816402316, 1246189591)], y = [], q = 0; 80 > q; q++)y[q] = a(); f = f.SHA512 = r.extend({
                _doReset: function () { this._hash = new l.init([new g.init(1779033703, 4089235720), new g.init(3144134277, 2227873595), new g.init(1013904242, 4271175723), new g.init(2773480762, 1595750129), new g.init(1359893119, 2917565137), new g.init(2600822924, 725511199), new g.init(528734635, 4215389547), new g.init(1541459225, 327033209)]) }, _doProcessBlock: function (a, f) {
                    for (var h = this._hash.words,
                        g = h[0], n = h[1], b = h[2], d = h[3], c = h[4], j = h[5], l = h[6], h = h[7], q = g.high, m = g.low, r = n.high, N = n.low, Z = b.high, O = b.low, $ = d.high, P = d.low, aa = c.high, Q = c.low, ba = j.high, R = j.low, ca = l.high, S = l.low, da = h.high, T = h.low, v = q, s = m, H = r, E = N, I = Z, F = O, W = $, J = P, w = aa, t = Q, U = ba, K = R, V = ca, L = S, X = da, M = T, x = 0; 80 > x; x++) {
                            var B = y[x]; if (16 > x) var u = B.high = a[f + 2 * x] | 0, e = B.low = a[f + 2 * x + 1] | 0; else {
                                var u = y[x - 15], e = u.high, z = u.low, u = (e >>> 1 | z << 31) ^ (e >>> 8 | z << 24) ^ e >>> 7, z = (z >>> 1 | e << 31) ^ (z >>> 8 | e << 24) ^ (z >>> 7 | e << 25), D = y[x - 2], e = D.high, k = D.low, D = (e >>> 19 | k << 13) ^
                                    (e << 3 | k >>> 29) ^ e >>> 6, k = (k >>> 19 | e << 13) ^ (k << 3 | e >>> 29) ^ (k >>> 6 | e << 26), e = y[x - 7], Y = e.high, C = y[x - 16], A = C.high, C = C.low, e = z + e.low, u = u + Y + (e >>> 0 < z >>> 0 ? 1 : 0), e = e + k, u = u + D + (e >>> 0 < k >>> 0 ? 1 : 0), e = e + C, u = u + A + (e >>> 0 < C >>> 0 ? 1 : 0); B.high = u; B.low = e
                            } var Y = w & U ^ ~w & V, C = t & K ^ ~t & L, B = v & H ^ v & I ^ H & I, ha = s & E ^ s & F ^ E & F, z = (v >>> 28 | s << 4) ^ (v << 30 | s >>> 2) ^ (v << 25 | s >>> 7), D = (s >>> 28 | v << 4) ^ (s << 30 | v >>> 2) ^ (s << 25 | v >>> 7), k = p[x], ia = k.high, ea = k.low, k = M + ((t >>> 14 | w << 18) ^ (t >>> 18 | w << 14) ^ (t << 23 | w >>> 9)), A = X + ((w >>> 14 | t << 18) ^ (w >>> 18 | t << 14) ^ (w << 23 | t >>> 9)) + (k >>> 0 < M >>>
                                0 ? 1 : 0), k = k + C, A = A + Y + (k >>> 0 < C >>> 0 ? 1 : 0), k = k + ea, A = A + ia + (k >>> 0 < ea >>> 0 ? 1 : 0), k = k + e, A = A + u + (k >>> 0 < e >>> 0 ? 1 : 0), e = D + ha, B = z + B + (e >>> 0 < D >>> 0 ? 1 : 0), X = V, M = L, V = U, L = K, U = w, K = t, t = J + k | 0, w = W + A + (t >>> 0 < J >>> 0 ? 1 : 0) | 0, W = I, J = F, I = H, F = E, H = v, E = s, s = k + e | 0, v = A + B + (s >>> 0 < k >>> 0 ? 1 : 0) | 0
                    } m = g.low = m + s; g.high = q + v + (m >>> 0 < s >>> 0 ? 1 : 0); N = n.low = N + E; n.high = r + H + (N >>> 0 < E >>> 0 ? 1 : 0); O = b.low = O + F; b.high = Z + I + (O >>> 0 < F >>> 0 ? 1 : 0); P = d.low = P + J; d.high = $ + W + (P >>> 0 < J >>> 0 ? 1 : 0); Q = c.low = Q + t; c.high = aa + w + (Q >>> 0 < t >>> 0 ? 1 : 0); R = j.low = R + K; j.high = ba + U + (R >>> 0 < K >>> 0 ? 1 : 0); S = l.low =
                        S + L; l.high = ca + V + (S >>> 0 < L >>> 0 ? 1 : 0); T = h.low = T + M; h.high = da + X + (T >>> 0 < M >>> 0 ? 1 : 0)
                }, _doFinalize: function () { var a = this._data, f = a.words, h = 8 * this._nDataBytes, g = 8 * a.sigBytes; f[g >>> 5] |= 128 << 24 - g % 32; f[(g + 128 >>> 10 << 5) + 30] = Math.floor(h / 4294967296); f[(g + 128 >>> 10 << 5) + 31] = h; a.sigBytes = 4 * f.length; this._process(); return this._hash.toX32() }, clone: function () { var a = r.clone.call(this); a._hash = this._hash.clone(); return a }, blockSize: 32
            }); m.SHA512 = r._createHelper(f); m.HmacSHA512 = r._createHmacHelper(f)
    })();


    window.mobilecheck = function () {
        var check = false;
        (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
        return check;
    };


    var parseQuery = function (query) {
        query = query ? query.replace(/^[^\?]+\??/, '') : query;
        var params = new Object();
        if (!query) return params; // return empty object
        var pairs = query.split(/[;&]/);
        for (var i = 0; i < pairs.length; i++) {
            var keyVal = pairs[i].split('=');
            if (!keyVal || keyVal.length != 2) continue;
            var key = unescape(keyVal[0]);
            var val = unescape(keyVal[1]);
            val = val.replace(/\+/g, ' ');
            params[key] = val;
        }
        return params;
    };

    String.prototype.format = function (format) {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined' ? args[number] : match;
        });
    };

    var CryptoJSAesJson = {
        stringify: function (cipherParams) {
            var j = { ct: cipherParams.ciphertext.toString(CryptoJS.enc.Base64) };
            if (cipherParams.iv) j.iv = cipherParams.iv.toString();
            if (cipherParams.salt) j.s = cipherParams.salt.toString();
            return JSON.stringify(j);
        },
        parse: function (jsonStr) {
            var j = JSON.parse(jsonStr);
            var cipherParams = CryptoJS.lib.CipherParams.create({ ciphertext: CryptoJS.enc.Base64.parse(j.ct) });
            if (j.iv) cipherParams.iv = CryptoJS.enc.Hex.parse(j.iv);
            if (j.s) cipherParams.salt = CryptoJS.enc.Hex.parse(j.s);
            return cipherParams;
        }
    };

    var readyDom = function (parent, lang, calendar_type) {
        if (jQuery) {
            var $p = $(parent);
            if (calendar_type == 'single') {

                console.log("activated 1-1");
                $('#bookArea [data-toggle="datepicker"]').datepicker({
                    format: 'yyyy-MM-dd',
                    language: lang,
                    startDate: moment().format('YYYY-MM-DD'),
                    endDate: moment().add('12', 'month').format('YYYY-MM-DD'),
                    beforeShow: function (input) {
                        console.log("activated 1-2");
                        var i_offset = $(input).offset();
                        setTimeout(function () {
                            $(".date-picker-wrapper").css({ "left": i_offset });
                        })
                    }
                }).on('pick.datepicker', function (e) {
                    if ($(e.target).hasClass('startDate') === true) {
                        if (moment(e.date) > moment($('#bookArea .endDate').val())) {
                            $('#bookArea .endDate').val(moment(e.date).format('YYYY-MM-DD')).datepicker('update');
                        }
                    } else {
                        if (moment(e.date) < moment($('#bookArea .startDate').val())) {
                            $('#bookArea .startDate').val(moment(e.date).format('YYYY-MM-DD')).datepicker('update');
                        }
                    }
                });
            } else {
                console.log("activated 2-1");
                $('.date_range').dateRangePicker({
                    language: lang,
                    stickyMonths: true,
                    monthSelect: true,
                    yearSelect: true,
                    separator: ' to ',
                    maxDays: 31,
                    startDate: moment().format("YYYY-MM-DD"),
                    endDate: moment().add('12', 'month').format("YYYY-MM-DD"),
                    getValue: function () {
                        if ($(this).find('.form-control-range.startDate').val() && $(this).find('.form-control-range.endDate').val()) {
                            return $(this).find('.form-control-range.startDate').val() + ' to ' + $(this).find('.form-control-range.endDate').val();
                        } else {
                            return '';
                        }
                    },
                    setValue: function (s, s1, s2) {
                        if (s1 == s2) {
                            s2 = moment(s1).add('day', 1).format('YYYY-MM-DD');
                        }
                        $(this).find('.form-control-range.startDate').val(s1);
                        $(this).find('.form-control-range.endDate').val(s2);
                    }
                });
            }

            $p.find("select[name=rooms]").on("change", function () {
                var idx = $(this).val();
                $p.find("select[name=adults]").find("option").show();

                if (idx > 0) {
                    if ($p.find("select[name=adults]").val() < idx) {
                        $p.find("select[name=adults]").val("");
                    }

                    if ($p.find("select[name=children]").val() < idx) {
                        $p.find("select[name=children]").val("");
                    }

                    $p.find("select[name=adults] option").eq(idx).prevAll().each(function () {
                        if ($(this).val())
                            $(this).hide();
                    });
                }
            });

            $p.find('.form-control-range.startDate').val(moment().format("YYYY-MM-DD"));
            $p.find('.form-control-range.endDate').val(moment().add(+1, 'days').format("YYYY-MM-DD"));
            var rooms = $p.find("select[name=rooms]");
            var adults = $p.find("select[name=adults]");

            rooms.val(1);
            adults.val(2);

            var m = $p.find(".reserve-fast").data("message");

            $p.find('.submit').on("click", function () {
                if (!rooms.val()) {
                    alert(m["required"].format(rooms.attr("caption")));
                    return false;
                }
                if (!adults.val()) {
                    alert(m["required"].format(adults.attr("caption")));
                    return false;
                }

                if (mobilecheck()) {
                    location.href = $p.attr('action') + '?' + $p.serialize();
                    return false;
                }

                if ($p.attr('target') == '_blank') {
                    var w = window.open("", "bookviewer", "width=1460, heigth=1280, scrollbars=yes, resizable=1,");
                    $p.attr("target", "bookviewer");
                    $p.submit();
                    w.resizeTo(window.outerWidth, window.outerHeight);
                } else {
                    $p.submit();
                }
            });
        }
    };

    var wscv = {
        uq: null,
        encodeType: CryptoJS.enc.Utf8,
        host: "https://be.wingsbooking.com",
        hotelId: null,
        booktype: null,
        theme: null,
        openType: null,
        config: {},
        set: function (cg) {
            this.uq = cg.unique;
            this.encodeType = cg.encType || this.encodeType;
            this.hotelId = cg.hotelId;
            this.booktype = cg.type;
            this.theme = cg.theme;
            this.openType = cg.openType;
        },
        iin: function (i) {
            i = i || uq
            i = this.encodeType.parse(i).toString(CryptoJS.enc.Utf8);

            if (!i) return false;

            var hotel_id = this.hotelId;
            var host = this.host;
            var p = parseQuery(location.href);
            if (!p.cname && !p.cvalue) return false;

            document.addEventListener('DOMContentLoaded', function () {
                var frame = document.createElement("iframe");
                frame.name = "wcrs";
                frame.style.display = "none";

                var body = document.getElementsByTagName("body")[0];

                body.appendChild(frame);

                var form = document.createElement("form");
                form.action = host + "/synchro/" + hotel_id;
                form.method = "post";
                form.target = "wcrs";
                form.style.display = "none";

                var sign = document.createElement("input");
                sign.type = "hidden";
                sign.name = "sign";

                var encUser = CryptoJS.AES.encrypt(i + ":" + window.location.host, p.wtoken, {
                    format: CryptoJSAesJson
                });

                sign.value = encUser.toString();

                var csrf = document.createElement("input");
                csrf.type = "hidden";
                csrf.name = p.cname;
                csrf.value = p.cvalue;

                form.appendChild(sign);
                form.appendChild(csrf);

                body.appendChild(form);
                form.submit();
            });
        },
        deny: function (i) {

            var hotel_id = this.hotelId;
            var host = this.host;
            var p = parseQuery(location.href);
            if (!p.cname && !p.cvalue) return false;

            document.addEventListener('DOMContentLoaded', function () {
                var frame = document.createElement("iframe");
                frame.name = "wcrs";
                frame.style.display = "none";

                var body = document.getElementsByTagName("body")[0];

                body.appendChild(frame);

                var form = document.createElement("form");
                form.action = host + hotel_id + "/dest";
                form.method = "post";
                form.target = "wcrs";
                form.style.display = "none";

                var csrf = document.createElement("input");
                csrf.type = "hidden";
                csrf.name = p.cname;
                csrf.value = p.cvalue;

                form.appendChild(csrf);

                body.appendChild(form);
                form.submit();
            });
        },
        create: function (selector, options) {

            var host = this.host;

            if (mobilecheck()) {
                host = "https://m.be.wingsbooking.com";
            }

            var form = document.createElement("form");
            form.action = host + "/" + options.lang + "/" + this.hotelId;
            form.method = "get";
            form.target = this.openType == 'local' ? '' : '_blank';

            var file;
            var calendar_type;

            if (this.theme) {
                file = "theme/" + this.theme + "/" + options.lang;
            } else {
                file = (this.booktype == "vertical") ? "vertical_" + options.lang : options.lang;
            }
            switch (this.theme) {
                case 'ena':
                    calendar_type = 'single';
                    break;
                default:
                    calendar_type = 'multiple';
                    break;
            }
            //console.log(file);
            $.get("https://s3.ap-northeast-2.amazonaws.com/static.wingsbooking.com/html/" + file + ".html", function (html) {
                form.innerHTML = html;
                document.querySelector(selector).appendChild(form);
                readyDom(form, options.lang, calendar_type);
            }).fail(function () {
                if (console.log) {
                    console.log("Not Founded theme");
                }
            });;

        }
    };
    window.wscv = wscv;
})(window);