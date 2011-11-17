beforeEach(function () {
  this.addMatchers({
    toEqualRestrictions: function (restrictions) {

      if (!(restrictions instanceof Superview.Restrictions)) restrictions = new Superview.Restrictions(restrictions);
      var actual = this.actual
      if (!(actual instanceof Superview.Restrictions)) actual = new Superview.Restrictions(this.actual);
      var self = this;
      var equal = true;

      ['minimum', 'maximum'].forEach(function (limit) {
        ['top', 'right', 'bottom', 'left'].forEach(function (edge) {
          if (actual[limit][edge] !== restrictions[limit][edge]) {
            equal = false;
          }
        })
      });

      return equal;
    }
  })
});