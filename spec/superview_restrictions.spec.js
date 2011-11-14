describe('superview.restrictions', function () {

  var view;

  beforeEach(function() {
    view = new Superview;

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

  describe('restrictTo()', function () {

    it('should return an empty size limit object by default', function () {
      expect(view.restrictions()).toEqualRestrictions({});
    })

    it('should interpret null as no restrictions', function () {
      view.restrictTo({maximum:{width: 30}});
      view.restrictTo(null);
      expect(view.restrictions().maximum.width).not.toEqual(30);
    })

    it("should be chainable", function() {
      var r = view.restrictTo({});
      expect(r).toBe(view);
    });

    it('should update the current size when the minimum size is set', function () {
      view.resize({width: 0, height: 0});

      spyOn(view, 'resize').andCallThrough();

      view.restrictTo({
        minimum: {
          width: 30,
          height: 30
        }
      });

      expect(view.size()).toEqualRect({width: 30, height: 30});
      expect(view.resize).toHaveBeenCalled();
    })

    it('should update the current size when the maximum size is set', function () {
      view.resize({width: 500, height: 500});

      spyOn(view, 'resize').andCallThrough();

      view.restrictTo({
        maximum: {
          width: 100,
          height: 100
        }
      });

      expect(view.size()).toEqualRect({width: 100, height: 100});
      expect(view.resize).toHaveBeenCalled();
    });

    it('should update the current position when the maximum position is set', function () {
      view.moveTo({top: 500, left: 500});

      spyOn(view, 'moveTo').andCallThrough();

      view.restrictTo({
        maximum: {
          top: 100,
          left: 100
        }
      });

      expect(view.position()).toEqualRect({top: 100, left: 100, bottom: 100, right: 100});
      expect(view.moveTo).toHaveBeenCalled();
    });

    it('should update the current position when the minimum position is set', function () {
      view.moveTo({top: 500, left: 500});

      spyOn(view, 'moveTo').andCallThrough();

      view.restrictTo({
        minimum: {
          top: 600,
          left: 600
        }
      });

      expect(view.position()).toEqualRect({top: 600, left: 600, bottom: 600, right: 600});
      expect(view.moveTo).toHaveBeenCalled();
    });

    it("should not change the size if the current size is within the bounds", function() {
      view.resize({width: 150, height: 150});

      spyOn(view, 'resize');

      view.restrictTo({
        minimum: {
          width: 100,
          height: 100
        },
        maximum: {
          width: 200,
          height: 200
        }
      });

      expect(view.size()).toEqualRect({width: 150, height: 150});
      expect(view.resize).not.toHaveBeenCalled();
    });

    it("should throw an error if a minimum is greater than a corresponding maximum", function() {

      expect(function () {
        view.restrictTo({
          minimum: {
            width: 300,
            height: 200
          },
          maximum: {
            width: 299,
            height: 199
          }
        })
      }).toThrow();

      expect(function () {
        view.resize({width: 200});
        view.restrictTo({
          minimum: {
            left: 500
          },
          maximum: {
            right: 600
          }
        })
      }).toThrow();

      expect(function () {
        view.restrictTo({
          minimum: {
            left: 500
          },
          maximum: {
            left: 400
          }
        })
      }).toThrow();
    });

    it('should accept an empty object as default limits', function () {
      view.restrictTo({})
      expect(view.restrictions()).toEqualRestrictions({minimum:{
        width: 0,
        height: 0
      }, maximum:{}});
    });

    it("should default negative width/height values to zero", function() {
      view.restrictTo({
        minimum: {
          width: -1,
          height: -1
        },
        maximum: {
          width: -1,
          height: -1
        }
      });
      expect(view.restrictions()).toEqualRestrictions({
        minimum: {
          width: 0,
          height : 0
        },
        maximum: {
          width: 0,
          height: 0
        }
      })
    });
  })

  describe('restrictions()', function () {

    it("should ignore right/bottom when top/left are specified", function() {
      view.resize({
        width: 100,
        height: 100
      })
      view.restrictTo({
        minimum: {
          top: 30,
          bottom: 40,
          left: 30,
          right: 40
        },
        maximum: {
          top: 30,
          bottom: 40,
          left: 30,
          right: 40
        }
      });
      expect(view.restrictions()).toEqualRestrictions({
        minimum: {
          top: 30,
          bottom: 130,
          left: 30,
          right: 130
        },
        maximum: {
          top: 30,
          bottom: 130,
          left: 30,
          right: 130
        }
      })
    });

    it("should return width/height zero min restrictions by default", function() {
      expect(view.restrictions()).toEqualRestrictions({minimum:{
        width: 0,
        height: 0
      }, maximum:{}});
    });

    it("should not return the internally maintained object", function() {

      var internal = view._restrictions;
      var rtn = view.restrictions();

      expect(internal).not.toBe(rtn);
      expect(internal.minimum).not.toBe(rtn.minimum);
      expect(internal.maximum).not.toBe(rtn.maximum);
    });

    it("should translate restrictions to all four edges", function() {
      view.resize({
        width: 100,
        height: 100
      });

      view.restrictTo({
        minimum: {
          bottom: 430,
          right: 320
        }
      });

      expect(view.restrictions()).toEqualRestrictions({
        minimum: {
          top: 330,
          bottom: 430,
          left: 220,
          right: 320
        }
      });

      view.restrictTo({
        maximum: {
          top: 430,
          left: 320
        }
      });

      expect(view.restrictions()).toEqualRestrictions({
        maximum: {
          top: 430,
          bottom: 530,
          left: 320,
          right: 420
        }
      });
    });

    it("should return the current size limit for the view", function () {
      view.restrictTo({
        maximum:{
          width: 141,
          height: 92
      }});

      expect(view.restrictions()).toEqualRestrictions({
        maximum:{
          width: 141,
          height: 92
      }});
    });
  });
})
