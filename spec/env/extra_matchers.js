/*

These jasmine matchers are included by default when a project is created with cup.

*/
beforeEach(function() {
  this.addMatchers({
    toBeAFunction: function() {
      return typeof this.actual === 'function';
    }
    , toBeInstanceOf: function (ctor) {
      return this.actual instanceof ctor;
    }
    , toContain: function (a) {
      return !!~this.actual.indexOf(a);
    }
    , toBeEmpty: function () {
      return this.actual.isEmpty();
    }
    , toThrowErrorMatching: function (stringOrRegexOrCtor) {

      if (typeof this.actual != 'function') {
        throw new Error('Actual is not a function');
      }

      var exception;
      
      try {
        this.actual();
      } catch (x) {
        exception = x;
      }

      var matcherType = typeof stringOrRegexOrCtor;

      if (matcherType === 'object') {
        if (typeof stringOrRegexOrCtor.test === 'function') {
          matcherType = 'regex';
        }
      }

      var matched = false;
      var matcherDescription = '';

      switch (matcherType) {
        case 'undefined':
          matched = typeof exception != undefined;
          matcherDescription = '(any)'
          break;
        case 'function':
          matched = exception instanceof stringOrRegexOrCtor;
          break;
        case 'string':
          matched = exception.toString() === stringOrRegexOrCtor;
          break;
        case 'regex':
          matched = stringOrRegexOrCtor.test('' + exception)
          break;
        default:
          throw new Error('Cannot match with ' + stringOrRegexOrCtor);
      }

      if (!matched) {
        this.message = function () {
          var not = this.isNot ? ' not' : '';
          return 'Expected ' + this.actual + not + ' to throw an error matching ' + (matcherDescription || stringOrRegexOrCtor) + ' but got ' + exception;
        }
      }

      return matched;
    }
  });
});