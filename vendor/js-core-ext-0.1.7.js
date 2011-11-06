/*
js-core-ext licence
===================

Copyright (C) 2011 by sjltaylor

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicence, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.


Supplement-js license
=====================

supplement.js JavaScript Extras, version: 0.1.1
(c) 2011 Oliver Nightingale

Released under MIT license.


InflectionJS licence
====================

Copyright (c) 2010 Ryan Schuft (ryan.schuft@gmail.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/;/*
Copyright (c) 2010 Ryan Schuft (ryan.schuft@gmail.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

/*
  This code is based in part on the work done in Ruby to support
  infection as part of Ruby on Rails in the ActiveSupport's Inflector
  and Inflections classes.  It was initally ported to Javascript by
  Ryan Schuft (ryan.schuft@gmail.com) in 2007.

  The code is available at http://code.google.com/p/inflection-js/

  The basic usage is:
    1. Include this script on your web page.
    2. Call functions on any String object in Javascript

  Currently implemented functions:

    String.pluralize(plural) == String
      renders a singular English language noun into its plural form
      normal results can be overridden by passing in an alternative

    String.singularize(singular) == String
      renders a plural English language noun into its singular form
      normal results can be overridden by passing in an alterative

    String.camelize(lowFirstLetter) == String
      renders a lower case underscored word into camel case
      the first letter of the result will be upper case unless you pass true
      also translates "/" into "::" (underscore does the opposite)

    String.underscore() == String
      renders a camel cased word into words seperated by underscores
      also translates "::" back into "/" (camelize does the opposite)

    String.humanize(lowFirstLetter) == String
      renders a lower case and underscored word into human readable form
      defaults to making the first letter capitalized unless you pass true

    String.capitalize() == String
      renders all characters to lower case and then makes the first upper

    String.dasherize() == String
      renders all underbars and spaces as dashes

    String.titleize() == String
      renders words into title casing (as for book titles)

    String.demodulize() == String
      renders class names that are prepended by modules into just the class

    String.tableize() == String
      renders camel cased singular words into their underscored plural form

    String.classify() == String
      renders an underscored plural word into its camel cased singular form

    String.foreignKey(dropIdUbar) == String
      renders a class name (camel cased singular noun) into a foreign key
      defaults to seperating the class from the id with an underbar unless
      you pass true

    String.ordinalize() == String
      renders all numbers found in the string into their sequence like "22nd"

      This libraries implementation of ordinalize failed to meet specs and has been reimplemented as part of string-ext

*/

/*
  This sets up a container for some constants in its own namespace
  We use the window (if available) to enable dynamic loading of this script
  Window won't necessarily exist for non-browsers.
*/
if (window && !window.InflectionJS)
{
    window.InflectionJS = null;
}

/*
  This sets up some constants for later use
  This should use the window namespace variable if available
*/
InflectionJS =
{
    /*
      This is a list of nouns that use the same form for both singular and plural.
      This list should remain entirely in lower case to correctly match Strings.
    */
    uncountableWords: [
        'equipment', 'information', 'rice', 'money', 'species', 'series',
        'fish', 'sheep', 'moose', 'deer', 'news'
    ],

    /*
      These rules translate from the singular form of a noun to its plural form.
    */
    pluralRules: [
        [new RegExp('(m)an$', 'gi'),                 '$1en'],
        [new RegExp('(pe)rson$', 'gi'),              '$1ople'],
        [new RegExp('(child)$', 'gi'),               '$1ren'],
        [new RegExp('^(ox)$', 'gi'),                 '$1en'],
        [new RegExp('(ax|test)is$', 'gi'),           '$1es'],
        [new RegExp('(octop|vir)us$', 'gi'),         '$1i'],
        [new RegExp('(alias|status)$', 'gi'),        '$1es'],
        [new RegExp('(bu)s$', 'gi'),                 '$1ses'],
        [new RegExp('(buffal|tomat|potat)o$', 'gi'), '$1oes'],
        [new RegExp('([ti])um$', 'gi'),              '$1a'],
        [new RegExp('sis$', 'gi'),                   'ses'],
        [new RegExp('(?:([^f])fe|([lr])f)$', 'gi'),  '$1$2ves'],
        [new RegExp('(hive)$', 'gi'),                '$1s'],
        [new RegExp('([^aeiouy]|qu)y$', 'gi'),       '$1ies'],
        [new RegExp('(x|ch|ss|sh)$', 'gi'),          '$1es'],
        [new RegExp('(matr|vert|ind)ix|ex$', 'gi'),  '$1ices'],
        [new RegExp('([m|l])ouse$', 'gi'),           '$1ice'],
        [new RegExp('(quiz)$', 'gi'),                '$1zes'],
        [new RegExp('s$', 'gi'),                     's'],
        [new RegExp('$', 'gi'),                      's']
    ],

    /*
      These rules translate from the plural form of a noun to its singular form.
    */
    singularRules: [
        [new RegExp('(m)en$', 'gi'),                                                       '$1an'],
        [new RegExp('(pe)ople$', 'gi'),                                                    '$1rson'],
        [new RegExp('(child)ren$', 'gi'),                                                  '$1'],
        [new RegExp('([ti])a$', 'gi'),                                                     '$1um'],
        [new RegExp('((a)naly|(b)a|(d)iagno|(p)arenthe|(p)rogno|(s)ynop|(t)he)ses$','gi'), '$1$2sis'],
        [new RegExp('(hive)s$', 'gi'),                                                     '$1'],
        [new RegExp('(tive)s$', 'gi'),                                                     '$1'],
        [new RegExp('(curve)s$', 'gi'),                                                    '$1'],
        [new RegExp('([lr])ves$', 'gi'),                                                   '$1f'],
        [new RegExp('([^fo])ves$', 'gi'),                                                  '$1fe'],
        [new RegExp('([^aeiouy]|qu)ies$', 'gi'),                                           '$1y'],
        [new RegExp('(s)eries$', 'gi'),                                                    '$1eries'],
        [new RegExp('(m)ovies$', 'gi'),                                                    '$1ovie'],
        [new RegExp('(x|ch|ss|sh)es$', 'gi'),                                              '$1'],
        [new RegExp('([m|l])ice$', 'gi'),                                                  '$1ouse'],
        [new RegExp('(bus)es$', 'gi'),                                                     '$1'],
        [new RegExp('(o)es$', 'gi'),                                                       '$1'],
        [new RegExp('(shoe)s$', 'gi'),                                                     '$1'],
        [new RegExp('(cris|ax|test)es$', 'gi'),                                            '$1is'],
        [new RegExp('(octop|vir)i$', 'gi'),                                                '$1us'],
        [new RegExp('(alias|status)es$', 'gi'),                                            '$1'],
        [new RegExp('^(ox)en', 'gi'),                                                      '$1'],
        [new RegExp('(vert|ind)ices$', 'gi'),                                              '$1ex'],
        [new RegExp('(matr)ices$', 'gi'),                                                  '$1ix'],
        [new RegExp('(quiz)zes$', 'gi'),                                                   '$1'],
        [new RegExp('s$', 'gi'),                                                           '']
    ],

    /*
      This is a list of words that should not be capitalized for title case
    */
    nonTitlecasedWords: [
        'and', 'or', 'nor', 'a', 'an', 'the', 'so', 'but', 'to', 'of', 'at',
        'by', 'from', 'into', 'on', 'onto', 'off', 'out', 'in', 'over',
        'with', 'for'
    ],

    /*
      These are regular expressions used for converting between String formats
    */
    idSuffix: new RegExp('(_ids|_id)$', 'g'),
    underbar: new RegExp('_', 'g'),
    spaceOrUnderbar: new RegExp('[\ _]', 'g'),
    uppercase: new RegExp('([A-Z])', 'g'),
    underbarPrefix: new RegExp('^_'),

    /*
      This is a helper method that applies rules based replacement to a String
      Signature:
        InflectionJS.applyRules(str, rules, skip, override) == String
      Arguments:
        str - String - String to modify and return based on the passed rules
        rules - Array: [RegExp, String] - Regexp to match paired with String to use for replacement
        skip - Array: [String] - Strings to skip if they match
        override - String (optional) - String to return as though this method succeeded (used to conform to APIs)
      Returns:
        String - passed String modified by passed rules
      Examples:
        InflectionJS.applyRules("cows", InflectionJs.singularRules) === 'cow'
    */
    applyRules: function(str, rules, skip, override)
    {
        if (override)
        {
            str = override;
        }
        else
        {
            var ignore = (skip.indexOf(str.toLowerCase()) > -1);
            if (!ignore)
            {
                for (var x = 0; x < rules.length; x++)
                {
                    if (str.match(rules[x][0]))
                    {
                        str = str.replace(rules[x][0], rules[x][1]);
                        break;
                    }
                }
            }
        }
        return str;
    }
};

/*
  This lets us detect if an Array contains a given element
  Signature:
    Array.indexOf(item, fromIndex, compareFunc) == Integer
  Arguments:
    item - Object - object to locate in the Array
    fromIndex - Integer (optional) - starts checking from this position in the Array
    compareFunc - Function (optional) - function used to compare Array item vs passed item
  Returns:
    Integer - index position in the Array of the passed item
  Examples:
    ['hi','there'].indexOf("guys") === -1
    ['hi','there'].indexOf("hi") === 0
*/
if (!Array.prototype.indexOf)
{
    Array.prototype.indexOf = function(item, fromIndex, compareFunc)
    {
        if (!fromIndex)
        {
            fromIndex = -1;
        }
        var index = -1;
        for (var i = fromIndex; i < this.length; i++)
        {
            if (this[i] === item || compareFunc && compareFunc(this[i], item))
            {
                index = i;
                break;
            }
        }
        return index;
    };
}

/*
  You can override this list for all Strings or just one depending on if you
  set the new values on prototype or on a given String instance.
*/
if (!String.prototype._uncountableWords)
{
    String.prototype._uncountableWords = InflectionJS.uncountableWords;
}

/*
  You can override this list for all Strings or just one depending on if you
  set the new values on prototype or on a given String instance.
*/
if (!String.prototype._pluralRules)
{
    String.prototype._pluralRules = InflectionJS.pluralRules;
}

/*
  You can override this list for all Strings or just one depending on if you
  set the new values on prototype or on a given String instance.
*/
if (!String.prototype._singularRules)
{
    String.prototype._singularRules = InflectionJS.singularRules;
}

/*
  You can override this list for all Strings or just one depending on if you
  set the new values on prototype or on a given String instance.
*/
if (!String.prototype._nonTitlecasedWords)
{
    String.prototype._nonTitlecasedWords = InflectionJS.nonTitlecasedWords;
}

/*
  This function adds plurilization support to every String object
    Signature:
      String.pluralize(plural) == String
    Arguments:
      plural - String (optional) - overrides normal output with said String
    Returns:
      String - singular English language nouns are returned in plural form
    Examples:
      "person".pluralize() == "people"
      "octopus".pluralize() == "octopi"
      "Hat".pluralize() == "Hats"
      "person".pluralize("guys") == "guys"
*/
if (!String.prototype.pluralize)
{
    String.prototype.pluralize = function(plural)
    {
        return InflectionJS.applyRules(
            this,
            this._pluralRules,
            this._uncountableWords,
            plural
        );
    };
}

/*
  This function adds singularization support to every String object
    Signature:
      String.singularize(singular) == String
    Arguments:
      singular - String (optional) - overrides normal output with said String
    Returns:
      String - plural English language nouns are returned in singular form
    Examples:
      "people".singularize() == "person"
      "octopi".singularize() == "octopus"
      "Hats".singularize() == "Hat"
      "guys".singularize("person") == "person"
*/
if (!String.prototype.singularize)
{
    String.prototype.singularize = function(singular)
    {
        return InflectionJS.applyRules(
            this,
            this._singularRules,
            this._uncountableWords,
            singular
        );
    };
}

/*
  This function adds camelization support to every String object
    Signature:
      String.camelize(lowFirstLetter) == String
    Arguments:
      lowFirstLetter - boolean (optional) - default is to capitalize the first
        letter of the results... passing true will lowercase it
    Returns:
      String - lower case underscored words will be returned in camel case
        additionally '/' is translated to '::'
    Examples:
      "message_properties".camelize() == "MessageProperties"
      "message_properties".camelize(true) == "messageProperties"
*/
if (!String.prototype.camelize)
{
     String.prototype.camelize = function(lowFirstLetter)
     {
        var str = this.toLowerCase();
        var str_path = str.split('/');
        for (var i = 0; i < str_path.length; i++)
        {
            var str_arr = str_path[i].split('_');
            var initX = ((lowFirstLetter && i + 1 === str_path.length) ? (1) : (0));
            for (var x = initX; x < str_arr.length; x++)
            {
                str_arr[x] = str_arr[x].charAt(0).toUpperCase() + str_arr[x].substring(1);
            }
            str_path[i] = str_arr.join('');
        }
        str = str_path.join('::');
        return str;
    };
}

/*
  This function adds underscore support to every String object
    Signature:
      String.underscore() == String
    Arguments:
      N/A
    Returns:
      String - camel cased words are returned as lower cased and underscored
        additionally '::' is translated to '/'
    Examples:
      "MessageProperties".camelize() == "message_properties"
      "messageProperties".underscore() == "message_properties"
*/
if (!String.prototype.underscore)
{
     String.prototype.underscore = function()
     {
        var str = this;
        var str_path = str.split('::');
        for (var i = 0; i < str_path.length; i++)
        {
            str_path[i] = str_path[i].replace(InflectionJS.uppercase, '_$1');
            str_path[i] = str_path[i].replace(InflectionJS.underbarPrefix, '');
        }
        str = str_path.join('/').toLowerCase();
        return str;
    };
}

/*
  This function adds humanize support to every String object
    Signature:
      String.humanize(lowFirstLetter) == String
    Arguments:
      lowFirstLetter - boolean (optional) - default is to capitalize the first
        letter of the results... passing true will lowercase it
    Returns:
      String - lower case underscored words will be returned in humanized form
    Examples:
      "message_properties".humanize() == "Message properties"
      "message_properties".humanize(true) == "message properties"
*/
if (!String.prototype.humanize)
{
    String.prototype.humanize = function(lowFirstLetter)
    {
        var str = this.toLowerCase();
        str = str.replace(InflectionJS.idSuffix, '');
        str = str.replace(InflectionJS.underbar, ' ');
        if (!lowFirstLetter)
        {
            str = str.capitalize();
        }
        return str;
    };
}

/*
  This function adds capitalization support to every String object
    Signature:
      String.capitalize() == String
    Arguments:
      N/A
    Returns:
      String - all characters will be lower case and the first will be upper
    Examples:
      "message_properties".capitalize() == "Message_properties"
      "message properties".capitalize() == "Message properties"
*/
if (!String.prototype.capitalize)
{
    String.prototype.capitalize = function()
    {
        var str = this.toLowerCase();
        str = str.substring(0, 1).toUpperCase() + str.substring(1);
        return str;
    };
}

/*
  This function adds dasherization support to every String object
    Signature:
      String.dasherize() == String
    Arguments:
      N/A
    Returns:
      String - replaces all spaces or underbars with dashes
    Examples:
      "message_properties".capitalize() == "message-properties"
      "Message Properties".capitalize() == "Message-Properties"
*/
if (!String.prototype.dasherize)
{
    String.prototype.dasherize = function()
    {
        var str = this;
        str = str.replace(InflectionJS.spaceOrUnderbar, '-');
        return str;
    };
}

/*
  This function adds titleize support to every String object
    Signature:
      String.titleize() == String
    Arguments:
      N/A
    Returns:
      String - capitalizes words as you would for a book title
    Examples:
      "message_properties".titleize() == "Message Properties"
      "message properties to keep".titleize() == "Message Properties to Keep"
*/
if (!String.prototype.titleize)
{
    String.prototype.titleize = function()
    {
        var str = this.toLowerCase();
        str = str.replace(InflectionJS.underbar, ' ');
        var str_arr = str.split(' ');
        for (var x = 0; x < str_arr.length; x++)
        {
            var d = str_arr[x].split('-');
            for (var i = 0; i < d.length; i++)
            {
                if (this._nonTitlecasedWords.indexOf(d[i].toLowerCase()) < 0)
                {
                    d[i] = d[i].capitalize();
                }
            }
            str_arr[x] = d.join('-');
        }
        str = str_arr.join(' ');
        str = str.substring(0, 1).toUpperCase() + str.substring(1);
        return str;
    };
}

/*
  This function adds demodulize support to every String object
    Signature:
      String.demodulize() == String
    Arguments:
      N/A
    Returns:
      String - removes module names leaving only class names (Ruby style)
    Examples:
      "Message::Bus::Properties".demodulize() == "Properties"
*/
if (!String.prototype.demodulize)
{
    String.prototype.demodulize = function()
    {
        var str = this;
        var str_arr = str.split('::');
        str = str_arr[str_arr.length - 1];
        return str;
    };
}

/*
  This function adds tableize support to every String object
    Signature:
      String.tableize() == String
    Arguments:
      N/A
    Returns:
      String - renders camel cased words into their underscored plural form
    Examples:
      "MessageBusProperty".tableize() == "message_bus_properties"
*/
if (!String.prototype.tableize)
{
    String.prototype.tableize = function()
    {
        var str = this;
        str = str.underscore().pluralize();
        return str;
    };
}

/*
  This function adds classification support to every String object
    Signature:
      String.classify() == String
    Arguments:
      N/A
    Returns:
      String - underscored plural nouns become the camel cased singular form
    Examples:
      "message_bus_properties".classify() == "MessageBusProperty"
*/
if (!String.prototype.classify)
{
    String.prototype.classify = function()
    {
        var str = this;
        str = str.camelize().singularize();
        return str;
    };
}

/*
  This function adds foreign key support to every String object
    Signature:
      String.foreignKey(dropIdUbar) == String
    Arguments:
      dropIdUbar - boolean (optional) - default is to seperate id with an
        underbar at the end of the class name, you can pass true to skip it
    Returns:
      String - camel cased singular class names become underscored with id
    Examples:
      "MessageBusProperty".foreignKey() == "message_bus_property_id"
      "MessageBusProperty".foreignKey(true) == "message_bus_propertyid"
*/
if (!String.prototype.foreignKey)
{
    String.prototype.foreignKey = function(dropIdUbar)
    {
        var str = this;
        str = str.demodulize().underscore() + ((dropIdUbar) ? ('') : ('_')) + 'id';
        return str;
    };
}


;;// supplement.js JavaScript Extras, version: 0.1.2
// (c) 2011 Oliver Nightingale
//
//  Released under MIT license.
//
/**
 * Namespace
 * @private
 */
supplement = (function () {

  var clashCallbacks = []

  var callClashCallbacks = function (obj, methodName, fn) {
    clashCallbacks.forEach(function (cb) {
      cb(obj, methodName, fn)
    })
  }

  /**
   * ## supplement.onClash
   * A callback that will be called when supplement attempts to define a method that would cause a clash.
   * The callback function will be passed the object that was trying to be modified by supplement, the
   * property name that was trying to be set and the value that the property was being set to.
   *
   * Use this to decide whether a clash is fatal for your application and throw a big error if so.
   *
   * @params {Function} the callback function
   */
  var onClash = function (fn) {
    if (typeof fn !== "function") throw new TypeError ()
    clashCallbacks.push(fn)
  }

  /**
   * ## supplement.defineAlias
   * A utility function for providing an alias to an objects method.
   *
   * @see supplement.defineMethod
   */
  var defineAlias = function (obj, alias, original) {
    this.defineMethod(obj, alias, obj[original])
  }

  /**
   * ## supplement.defineMethod
   * A utility function for supplementing any object with new methods.  It wraps the ES5 Object.defineProperty
   * method and uses that wherever possible, falling back to plain property assignment in older browsers.
   *
   * The function will have `this` set to the object passed as the first parameter.
   *
   * @param {Object} the object on which to define the method
   * @param {String} the name of the new method
   * @param {Function} the function that makes up the body of the method for the object.
   *
   * ### Example
   *     supplement.defineMethod(Array, 'first', function () {
   *       return this[0]
   *     })
   */
  var defineMethod = function (obj, name, fn) {
    if (obj[name]) return callClashCallbacks(obj, name, fn)

    // if defineProperties is supported then a working version
    // of defineProperty will be available.  Work around for IE8's
    // broken implementation of defineProperty.
    if (typeof Object.defineProperties == 'function') {
      Object.defineProperty(obj, name, {
        value: fn,
        enumerable: false,
        configurable: false
      })
    } else {
      obj[name] = fn
    };
  }

  /**
   * Exposing methods
   * @private
   */
  return {
    defineAlias: defineAlias,
    defineMethod: defineMethod,
    onClash: onClash
  }
})()

/*!
 * Supplement - Array
 * Copyright (C) 2011 Oliver Nightingale
 * MIT Licensed
 */

/**
 * ## Array.wrap
 * Wraps the parameter in an array, ensures that the return value is always an array.  Useful when combined
 * with array enumerators to prevent accidently calling methods on null or undefined.
 *
 * When passed null or undefined an empty array is returned.  When passed an array that array is returned
 * unchanged, anything else is pushed as the first element to a new empty array and that array is returned.
 *
 * @param {Object} the thing to wrap in an array.
 * @returns {Array}
 *
 * ### Example
 *     Array.wrap("foo")      // returns ["foo"]
 *     Array.wrap([1,2,3])    // returns [1,2,3]
 *     Array.wrap(undefined)  // returns []
 */
supplement.defineMethod(Array, 'wrap',  function (obj) { "use strict";
   if (obj == null || obj == undefined) return []
   if (Array.isArray(obj)) return obj
   return [obj]
});

/**
 * ## Array.prototype.uniq
 * Returns a new array with all the dupicate elements removed.  Elements are checked for duplicity using ===
 *
 * @returns {Array} a new array with all the duplicates of the original array removed.
 *
 * ### Example
 *      [1,1,2,3,4,4].uniq()  // returns [1,2,3,4]
 */
supplement.defineMethod(Array.prototype, 'uniq',  function () { "use strict";
  return this.reduce(function (out, elem) {
    if (out.indexOf(elem) === -1) out.push(elem)
    return out
  }, [])
});

/**
 * ## Array.range
 * Returns a new array with elements between and including the start and end params.
 *
 * @param {Number} start - where to start the range from
 * @param {Number} end - where to end the range, inclusive.
 * @returns {Array} the newly created and populated array.
 * @throws {TypeError} if either the start or end params are omitted.
 *
 * ### Example
 *     Array.range(4,7)    // returns [4,5,6,7]
 */
supplement.defineMethod(Array, 'range',  function (start, end) { "use strict";
  if ((typeof start !== 'number') || (typeof end !== 'number')) throw new TypeError ('Array.range called with no range start or end')
  var a = []
  for (var i=start; i <= end; i++) {
   a.push(i)
  };
  return a
});

/**
 * ## Array.prototype.detect
 * Returns the first item from the array for which the function evaluates to true.  Stops iterating as soon
 * as the function evaluates to true.
 *
 * The passed function will be called for each element in the array, it will be passed the current element
 * to be evaluated, the index of this element in the array and finally the whole array itself.  The function
 * will be called with its context set to the optional context param.
 *
 * @param {Function} fn - a function to be executed for each element of the array
 * @param {Object} context - an optional param that will be used as the context of fn
 * @returns {Object} the first element of the array for which the function returns true
 *
 * ### Example
 *     [1,2,3,4,5].detect(function (num) {
 *       return (num == 3)
 *     })  // returns 3
 */
supplement.defineMethod(Array.prototype, 'detect',  function (fn, context) { "use strict";
  var length = this.length
  var out = null

  for (var i=0; i < length; i++) {
   if (fn.call(context, this[i], i, this)) {
     out = this[i]
     break
   };
  };
  return out
});

/**
 * ## Array.toArray
 * Converts an array like object, most likely the arguments object, into an Array.
 *
 * @param {Object} args an arguments object which will get turned into a real array.
 * @returns {Array} the args object as an array.
 * @throws {TypeError} when passed a string.
 *
 * ### Example
 *     function () {
 *       var args = Array.toArray(arguments)
 *     }
 */
supplement.defineMethod(Array, 'toArray',  function (args) { "use strict";
  if (typeof args === "string") throw new TypeError('Array.toArray called on non-arguments');
  return Array.prototype.slice.call(args, 0)
})

/**
 * ## Array.prototype.head
 * Returns the first element from an array.  If the array is empty undefined is returned.
 * The original array is left un-mutated.
 *
 * @returns {Anything} the first element from the array or undefined.
 *
 * ### Example
 *     var a = [1,2,3]
 *     a.head() // returns 1
 */
supplement.defineMethod(Array.prototype, 'head', function () { "use strict";
  return this[0]
})

/**
 * ## Array.prototype.tail
 * Returns everything except the head of the array.  If the array is empty an empty array
 * is returned.  The original array is left un-mutated.
 *
 * @returns {Array} everything but the head of the array.
 *
 * ### Example
 *     var a = [1,2,3]
 *     a.tail() // returns [2,3]
 */
supplement.defineMethod(Array.prototype, 'tail', function () { "use strict";
  return this.slice(1)
})

/**
 * ## Array.prototype.compact
 * Returns a copy of the array with all undefined or null values removed, other falsy values
 * are left alone.
 */
supplement.defineMethod(Array.prototype, 'compact', function () { "use strict";
  return this.filter(function (element) { return (element !== null && element !== undefined) })
})

/**
 * ## Array.prototype.group
 * Return an object where each key is the group name and the value is the elements form the
 * array that fit in that group.
 *
 * Grouping is done by the passed function, this grouping function is called for each element
 * in the array and passed 3 arguments; the current element of the array, the index of that item
 * in the array and the entire array.  The context of the grouping function can be changed by passing
 * a second argument to group.
 *
 * @params {Function} the grouping function
 * @params {Object} an optional context object for the grouping function
 * @throws {TypeError} when a non function is passed as the grouping function
 * @returns {Object} an object containing the array split into groups
 *
 * ## Example
 *     var drinks = ["absinthe", "beer", "cider"]
 *     drinks.group(function (drink) {
 *       return drink.charAt(0)
 *     }) // returns {"a": ["absinthe"], "b": ["beer"], "c": ["cider"]}
 */
supplement.defineMethod(Array.prototype, 'group', function (fn, context) { "use strict";
  if (typeof fn !== "function") throw new TypeError ()

  return this.reduce(function (grouped, elem, index, arr) {
    var key = fn.call(context, elem, index, arr)
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(elem)
    return grouped
  }, {})
})

/**
 * ## Array.prototype.reject
 * Returns a new array containing items from this array for which the function returns a truthy value.
 * The function passed 3 arguments, the current element from the array, the index of this item in
 * the array and the whole array.  The context of the function can be set by passing an optional second
 * parameter.
 *
 * @params {Function} The function which will do the rejecting
 * @params {Object} An optional context object for the rejecting function
 * @throws {TypeError} When called without a function
 * @returns {Array}
 */
supplement.defineMethod(Array.prototype, 'reject', function (fn, context) { "use strict";
  if (typeof fn !== "function") throw new TypeError ()

  return this.reduce(function (keepers, elem, index, arr) {
    if (!fn.call(context, elem, index, arr)) keepers.push(elem)
    return keepers
  }, [])
})

/**
 * ## Array.prototype.take
 * Returns the first n items from the array.  Doesn't modify the array.
 *
 * @param {Number} the number of items to take from the array
 */
supplement.defineMethod(Array.prototype, 'take', function (n) { "use strict";
  if (!n) throw new TypeError ()

  return this.slice(0, n)
})

/**
 * ## Array.prototype.drop
 * Drops the first n items from the array and returns the rest.  Doesn't modify the array.
 *
 * @param {Number} the number of items to drop from the front of the array
 */
supplement.defineMethod(Array.prototype, 'drop', function (n) { "use strict";
  if (!n) throw new TypeError ()

  return this.slice(n)
})

/**
 * ## Array.prototype.pluck
 * Returns array of values for passed property / method name on each member.
 *
 * If the element in the array has a property with a matching name it will be returned,
 * if the property is a function then it will be called, without any parameters, and the
 * result will be returned.  If no property matches then undefined will be returned.
 *
 * @param {propname} the name of a property or method to collect from each member
 * @throws {TypeError} when called without a property name
 * @returns {Array} an array containing the properties and/or result of method calls
 */
supplement.defineMethod(Array.prototype, 'pluck', function (n) { "use strict";
  if (!n || typeof n !== 'string') throw new TypeError ()

  return this.map(function (member) {
    var value
    if(member[n] !== undefined) {
      value = typeof member[n] == 'function' ? member[n]() : member[n];
    } else {
      value = undefined
    }
    return value
  })
})

/**
 * ## Array.prototype.contains
 * Indicates whether the array contains a given thing.
 * Equivalent to but more readable than !!~this.indexOf(thing);
 *
 * @param {thing} the thing to look for in the array
 * @returns {Boolean} true IFF the array contains the thing, false otherwise
 */
supplement.defineMethod(Array.prototype, 'contains', function(thing) {
  return !!~this.indexOf(thing);
})

/**
 * ## Array.prototype.copy
 * Returns a shallow copy of the array.
 *
 * @returns {Array} an array containing the properties and/or result of method calls
 */
supplement.defineMethod(Array.prototype, 'copy', function () {
  return Array.toArray(this);
});

/**
 * ## Array.prototype.remove
 * Deletes the first occurence of the thing from the array and compacts the array
 *
 * Effectively a NOOP if the array does not contain the thing
 *
 * @param {thing} the thing to remove
 * @returns {Array} an array containing all elements except the first occurence of thing
 */
supplement.defineMethod(Array.prototype, 'remove', function (thing) {
  delete this[this.indexOf(thing)];
  return this.compact();
});

/**
 * ## Array.prototype.removeEvery
 * Deletes all occurences of the thing from the array and compacts the array
 *
 * Note this function is idempotent ONLY over value comparison of the return value
 *
 * @param {thing} the thing to remove
 * @returns {Array} an array containing all elements except thing
 */
supplement.defineMethod(Array.prototype, 'removeEvery', function (thing) {

  for(var i = 0; i < this.length; i++) {
    if (this[i] === thing) {
      delete this[i];
    }
  }

  return this.compact();
});

/**
 * ## Array.prototype.isEmpty
 * Indicates whether the array is zero length
 *
 * @returns {Boolean} true IFF the array has no elements, false otherwise
 */
supplement.defineMethod(Array.prototype, 'isEmpty', function () {
  return this.length === 0;
});

/**
 * ## Array.prototype.first
 *
 * @returns {Object} The first element of the array
 */
supplement.defineMethod(Array.prototype, 'first', function (obj) {
  return this[0];
});

/**
 * ## Array.prototype.first
 *
 * @returns {Object} The last element of the array
 */
supplement.defineMethod(Array.prototype, 'last', function (obj) {
  return this[this.length - 1];
});

/**
 * ## Array.prototype.count
 * Returns the number of items which match the given predicate.
 * If no predicate is given, the length of the array is returned.
 *
 * @param {predicate} the function which must return truthy to indicate a match
 * @returns {Number} a positive integer represdenting the match count
 */
supplement.defineMethod(Array.prototype, 'count', function (predicate) {
  if (!predicate) return this.length;
  
  var count = 0;
  
  this.forEach(function (e) {
    if (predicate(e)) {
      count++;
    }
  })
  
  return count;
})

/**
 * ## Function.prototype.singleUse
 * Returns a version of the function that can only be called once, after which the function will behave
 * as a no-op.
 *
 * @returns {Function} a function with the same behaviour that can only be called once.
 */
supplement.defineMethod(Function.prototype, 'singleUse', function () { "use strict";
  var fn = this
  var alreadyCalled = false

  return function () {
    if (alreadyCalled) return
    alreadyCalled = true
    var args = Array.prototype.slice.call(arguments, 0)
    return fn.apply(null, args)
  }
});

/**
 * ## Function.prototype.curry
 * Returns a copy of the function with one or more arguments already set.
 *
 * @params {Object} any number of arguments to prefil the original funciton with.
 * @returns {Function}
 *
 * ### Example
 *     var add = function (a, b) { return a + b }
 *     var addFive = add.curry(5)
 *     add(5, 10) === addFive(10)
 *
 */
supplement.defineMethod(Function.prototype, 'curry', function () { "use strict";
  var args = Array.prototype.slice.call(arguments, 0)
  var fn = this

  return function () {
    Array.prototype.slice.call(arguments, 0).forEach(function (arg) { args.push(arg) })
    return fn.apply(null, args)
  }
});

/**
 * ## Function.prototype.throttle
 * Returns a copy of the function with the same behaviour but which will only execute once every x amount
 * of miliseconds.  This can be useful when reducing the load on a funciton that could be triggered many
 * times, perhaps as a result of a keyup event.
 *
 * @params {Number} the rate limit in miliseconds for the minimum pause between executions of the function
 * @returns {Function} the throttled function.
 */
supplement.defineMethod(Function.prototype, 'throttle', function (rate) { "use strict";
  var fn = this
  var callTime, lastCallTime

  return function () {
    var args = Array.prototype.slice.call(arguments, 0)
    callTime = new Date ()
    lastCallTime = lastCallTime || 0
    if ((callTime - lastCallTime) < rate) return
    lastCallTime = callTime
    return fn.apply(null, args)
  }
});

/**
 * ## Function.prototype.debounce
 * Returns a copy of the funciton that will only execute after it has stopped being called for x miliseconds.
 * This can be useful for functions used as keyup handlers where the action should only happen once the user
 * has stopped typing.
 *
 * @params {Number} the time in miliseconds between calling the funciton and the function executing.
 *
 * ### Example
 *     var keyupHandler = function () {
 *       // awesome code goes here!
 *     }
 *     
 *     input.addEventListener('keyup', keyupHandler.debounce(100))
 *     // keyupHandler will only be called 100 miliseconds after
 *     // the keyup event stops being fired.
 *
 */
supplement.defineMethod(Function.prototype, 'debounce', function (time) { "use strict";
  var fn = this
  var timeout

  return function () {
    var args = Array.prototype.slice.call(arguments, 0)
    clearTimeout(timeout)
    timeout = setTimeout(function () {
      return fn.apply(null, args)
    }, time)
  }
});
/**
 * ## Number.prototype.times
 * Executes the supplied function x number of times, where x is the value of the number, the function
 * will be yielded the index of the iteration each time it is called.
 *
 * @param {Function} the function to be called each time.
 *
 * ### Example
 *     (5).times(function (i) { console.log(i) })
 *     // prints 0 1 2 3 4
 */
supplement.defineMethod(Number.prototype, 'times', function (fn) { "use strict";
  for (var i=0; i < this; i++) {
    fn(i)
  };
})

/**
 * ## Number.prototype.seconds
 * Returns the number of seconds converted to milliseconds.
 *
 * @see Number.prototype.second
 * @returns {Number}
 */
supplement.defineMethod(Number.prototype, 'seconds', function () { "use strict";
  return this * 1000
})
supplement.defineAlias(Number.prototype, 'second', 'seconds')

/**
 * ## Number.prototype.minutes
 * Returns the number of minutes converted to milliseconds
 *
 * @see Number.prototype.minute
 * @returns {Number}
 */
supplement.defineMethod(Number.prototype, 'minutes', function () { "use strict";
  return this.seconds() * 60
})
supplement.defineAlias(Number.prototype, 'minute', 'minutes')

/**
 * ## Number.prototype.hours
 * Returns the number of hours converted to milliseconds
 *
 * @see Number.prototype.hour
 * @returns {Number}
 */
supplement.defineMethod(Number.prototype, 'hours', function () { "use strict";
  return this.minutes() * 60
})
supplement.defineAlias(Number.prototype, 'hour', 'hours')

/**
 * ## Number.prototype.pad
 * Returns a string representation of the number with n zeroes padding the number.
 *
 * @params {Number} the number of zeroes to pad the number with
 * @returns {String}
 */
supplement.defineMethod(Number.prototype, 'pad', function (zeroes) { "use strict";
  if (typeof zeroes !== "number") throw new TypeError
  if (zeroes < 0) throw new RangeError

  var out = this + ""
  while (Math.floor(zeroes--)) {
    out = "0" + out
  }
  return out
})

/**
 * ## Number.prototype.toDps
 * Round a number of fixed decimal places
 *
 * @params {Number} the number of decimal places
 * @returns {Number} the number to the specified number of decimal places using half rounding
 */
supplement.defineMethod(Number.prototype, 'toDps', function (n) {
  return parseFloat(this.toFixed(n));
});

/**
 * ## Object.values
 * Returns all the enumeralbe values of an object.  Will not return any values from higher up the prototype
 * chain.
 *
 * @param {Object} the object whose values you want
 * @returns {Array} an array of this objects values
 * @throws {TypeError} when passed a non plain object
 *
 * ### Example
 *     Object.values({foo: "bar"})
 *     // returns ["foo"]
 */
supplement.defineMethod(Object, 'values', function (obj) { "use strict";
  if (obj !== Object(obj)) throw new TypeError('Object.values called on non-object');
  return Object.keys(obj).map(function (key) { return obj[key] })
});

/**
 * ## Object.provide
 * Returns a property of an object which is nested arbitrarily deep within another object.  If at any point
 * along the chain of properties it finds a property that doesn't exist it populates that property with a 
 * blank object and continues.
 *
 * @param {Object} the object for which you wish to navigate through
 * @params {String} any number of properties which will be nested within each other in the object
 * @returns {Object} the object at the end of the nested properties
 *
 * ### Example
 *     var a = {}
 *     Object.provide(a, 'foo', 'bar', 'baz)
 *     // returns {} which is equal to a.foo.bar.baz
 */
supplement.defineMethod(Object, 'provide', function (obj) { "use strict";
  if (obj !== Object(obj)) throw new TypeError('Object.provide called on non-object');
  var properties = Array.prototype.slice.call(arguments, 1)
  var node = obj
  properties.forEach(function (prop) {
    if (!node[prop]) {
      node[prop] = {}
    } else if (node[prop] !== Object(node[prop])) {
      throw new TypeError('Object.provide can only add properties to a plain object')
    }
    node = node[prop]
  })
  return node
});

/**
 * ## Object.typeOf
 * A more robust version of the native typeof command.  This function will reliably return the correct type
 * of the passed object.  It is able to distinguish between arrays, arguments and plain objects for example.
 *
 * @params {Object} any kind of object for which you want to know its type.
 * @returns {String} the string type of the object.
 *
 * ### Example
 *     Object.typeOf([]) // returns 'array'
 *     Object.typeOf({}) // returns 'object'
 *     Object.typeOF(1)  // returns 'number'
 */
supplement.defineMethod(Object, 'typeOf', function (obj) { "use strict";
  return Object.prototype.toString.call(obj).match(/\s([a-z|A-Z]+)/)[1].toLowerCase()
});

/**
 * ## Object.isArray
 * ## Object.isFunction
 * ## Object.isString
 * ## Object.isNumber
 * ## Object.isBoolean
 * ## Object.isArguments
 * ## Object.isRegexp
 * ## Object.isDate
 * Convinience wrappers around `Object.typeOf`.  For checking arrays it is better to use the native
 * `Array.isArray` method.
 *
 * @see Array.isArray
 * @param {Object} the object to test
 * @returns {Boolean} true only if the object is of the correct type
 */
(["Array", "Function", "String", "Number", "Boolean", "Regexp", "Date"]).forEach(function (type) {
  supplement.defineMethod(Object, 'is' + type, function (obj) { "use strict";
    return Object.typeOf(obj) == type.toLowerCase()
  })
})

/**
 * ## String.prototype.startsWith
 * Indicates whether a string starts with the specified string
 *
 * @params {string} The candidate string
 * @returns {Boolean} true IFF this string starts with the given string, false otherwise
 */
supplement.defineMethod(String.prototype, 'startsWith', function(string) {
  return new RegExp('^'+string).test(this);
});

/**
 * ## String.prototype.endsWith
 * Indicates whether a string ends with the specified string
 *
 * @params {string} The candidate string
 * @returns {Boolean} true IFF this string ends with the given string, false otherwise
 */
supplement.defineMethod(String.prototype, 'endsWith', function(string) {
  return this.substr(string.length) === string;
});

/**
 * ## String.prototype.contains
 * Indicates whether a string contains the specified substring
 *
 * @params {string} The candidate substring
 * @returns {Boolean} true IFF this string contains the given string, false otherwise
 */
supplement.defineMethod(String.prototype, 'contains', function(substring) {
  return new RegExp(substring).test(this);
});

/**
 * ## String.prototype.strip
 * Removes any leading or trailing white space
 *
 * @returns {String} A new string without any leading or trailing whitespace
 */
supplement.defineMethod(String.prototype, 'strip', function () {
  return this.replace(/^\s+|\s+$/g, '');
});

/**
 * ## String.prototype.quote
 * encloses the string with the specified string, or " if no enclosing string is given
 *
 * @returns {String} A new string enclosed by the specified string
 */
supplement.defineMethod(String.prototype, 'quote', function (enclosingString) {
  var enclosingString =  enclosingString || '"'
  return enclosingString + this + enclosingString;
});

/**
 * ## String.prototype.toFloat
 * Converts the number to a float
 *
 * @returns {Number} A Float parsed from the string
 */
supplement.defineMethod(String.prototype, 'toFloat', function () {
  if (!this.match(/^\d+(\.\d+)?$/)) return NaN;
  return parseFloat(this);
});

/**
 * ## String.prototype.toInteger
 * Converts the number to an integer
 *
 * @returns {Number} An Integer parsed from the string
 */
supplement.defineMethod(String.prototype, 'toInteger', function () {
  if (!this.match(/^\d+$/)) return NaN;
  return parseInt(this);
});


;;/*
Copyright(c) 2011 Sam Taylor, released under MIT License.
*/
function uuid () {
  // from: http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
  // http://www.ietf.org/rfc/rfc4122.txt
  var s = [];
  var hexDigits = "0123456789ABCDEF";
  for (var i = 0; i < 32; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[12] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
  s[16] = hexDigits.substr((s[16] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01

  var uuid = s.join("");
  return uuid;
};

function proxyFunction (thiz, phunction) {
  return function () {
    return phunction.apply(thiz, arguments);
  };
};

// for use with option enabled methods
function defaultsFor (options, defaults) {
  return Object.extend(options).withObject(defaults);
};

function NotImplemented () {
  throw "Not Implemented";
};
;;/*
Copyright(c) 2011 Sam Taylor, released under MIT License.
*/
(function () {
  
  supplement.defineMethod(Number.prototype, 'ordinalize', function (n) {
    return (this).toString().ordinalize();
  });
})()
;;/*
Copyright(c) 2011 Sam Taylor, released under MIT License.
*/
(function() {
  supplement.defineMethod(Object, 'extend', function (object, options) {

    options = options || {};
    object = object || {};

    return {
      withObject: function () {

        Array.toArray(arguments).forEach(function(other) {
          for (var member in other) {
            if (options.overwrite || (typeof object[member] === 'undefined')) {
              var name = (typeof options.prefix === 'undefined' || options.prefix === null) ? member : "" + options.prefix + member;
              object[name] = other[member];
            }
          }
        });

        return object;
      },
      mixin: function (mixin) {
        return typeof mixin === 'function' ? this.withObject(new mixin) : this.withObject(mixin);
      }
    };
  });

  supplement.defineMethod(Object, 'overwrite', function (object) {
    return Object.extend(object, {overwrite: true});
  });

  supplement.defineMethod(Object, 'override', (function () {

    function overrideObject (originals, overrides) {
      for(var memberName in overrides) {
        var member = overrides[memberName];
        if (typeof member === 'function') {

          var originalFunction = originals[memberName];
          var newFunction = member;

          if (!originalFunction) throw "no function to override: " + memberName.quote();

          var baseProxy = function (args) {

            return function () {

              var baseArgs = (arguments.length > 0) ? Array.toArray(arguments) : args;
              return originalFunction.apply(originals, baseArgs);
            }
          }

          originals[memberName] = function () {

            var base = baseProxy(Array.toArray(arguments))
            var newFunctionArguments = Array.toArray(arguments);
            newFunctionArguments.unshift(base);

            return newFunction.apply(originals, newFunctionArguments);
          }
        }
      }
    }

    return function (originals) {
      return {
        withObject: function (overrides) {
          return overrideObject(originals, overrides);
        }
      }
    }
  })());

  supplement.defineMethod(Object, 'shallowCopy', function (obj) {
    return jQuery.extend({}, obj);
  });

  supplement.defineMethod(Object, 'deepCopy', function (obj) {
    return jQuery.extend(true, {}, obj);
  });
})();;;/*
Copyright(c) 2011 Sam Taylor, released under MIT License.
*/
(function () {
  
  supplement.defineMethod(String.prototype, 'isUpperCase', function () {
    return this.toLowerCase() != this;
  });
  
  supplement.defineMethod(String.prototype, 'isLowerCase', function () {
    return this.toUpperCase() != this;
  });
  
  supplement.defineMethod(String.prototype, 'decamelize', function () {
    var chrs = [];
    
    for (var i = 0, j = 1; i < this.length; i++, j++) {
      var cur = this[i];
      var next = this[j];
      
      chrs.push(cur);
      
      if (next && next.isUpperCase() && /[a-zA-Z\d]/.test(cur)) {
        chrs.push(' ');
      }
    }
        
    return chrs.join('');
  });

  supplement.defineMethod(String.prototype, 'variableize', function (globalName) {
    var input = this;
        
    var matches = input.split(/([^a-z])/g)
    var parts = [];
        
    for (var i = 0; i < matches.length; i++) {
      var match = matches[i];
      if (!match) continue;
      
      if (match.match(/^[A-Z]$/)) {
        var str = match + matches[++i];
        parts.push(str);
      } else if (match.match(/[-_]/)) {
        parts.push(matches[++i].titleize());
      } else {
        parts.push(match);
      }
    }
    
    var str = parts.filter(function (s) {
      return !s.match(/\s+/g) 
    }).map(function (s) {
      return s.titleize()
    }).join('');

    if (str[0]) {
      str = str.split('');
      str[0] = globalName ? str[0].toUpperCase() : str[0].toLowerCase();
      str = str.join('');
    }

    // if it starts with a number
    if (str.match(/^\d.*/)) {
      str = '_' + str;
    }

    return str;
  });  

  // taken from http://stackoverflow.com/questions/6857552/regular-expression-in-crockfords-string-supplant
  supplement.defineMethod(String.prototype, 'supplant', function (dictionary) {
    return this.replace(/{([^{}]*)}/g, function (target, name) {

      var replacement = dictionary[name];

      return typeof replacement === 'string' || 
      typeof replacement === 'number' || 
      typeof replacement === 'boolean' 
      ? replacement : target;
    });
  });
 
  
  /*
    This function adds ordinalize support to every String object
      Signature:
        String.ordinalize() == String
      Arguments:
        N/A
      Returns:
        String - renders all found numbers their sequence like "22nd"
      Examples:
        "the 1 pitch".ordinalize() == "the 1st pitch"
  */
  supplement.defineMethod(String.prototype, 'ordinalize', function () {
    
    var self = this;
    var words = self.split(/\s+/);
    
    for (var i = 0; i < words.length; i++) {
        
        var word = words[i];
        var match = /^\d+$/.exec(word)
        
        if (match) {
          var number = parseInt(match[0]);

          var penultimateDigit = word[word.length-2]
          var lastDigit = word[word.length-1];
          var suffix = "th";
          
          if (!penultimateDigit || penultimateDigit !== "1") {
            switch(lastDigit) {
              case "1":
                suffix = 'st';
                break;
              case "2":
                suffix = 'nd';
                break;
              case "3":
                suffix = 'rd';
                break;
              default:
            }
          }
          words[i] += suffix;
        }
    }
    self = words.join(' ');
    return self;
  });
})()
;