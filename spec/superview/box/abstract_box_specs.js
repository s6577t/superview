/*

These specs apply to the outer (boundary) and inner (content area) rectangles

*/


function boxSpecs (newBoxFunction) {

  return function () {

    var box;

    beforeEach(function () {
      box = newBoxFunction();
    })

    describe('size()', function () {
      ['width', 'height'].forEach(function(dimension) {
        it("have an initial " + dimension + " of zero", function() {
          expect(box.size()[dimension]).toEqual(0);
        });
      });
    });

    describe('resize()', function () {

      it('should emit an onResized event with itself', function () {
        spyOn(box.onResized(), 'emit').andCallThrough();

        var v;

        box.onResized(function (a) {
          v = a;
        });

        var s = {width: 123, height: 456};
        box.resize(s);

        expect(box.onResized().emit).toHaveBeenCalled();
        expect(v).toBe(box);
        expect(box.size()).toEqualRect(s);
      });

      it('should not emit an onResized event if the size set is the same as the current size', function () {
        box.resize({width: 123, height: 456});

        spyOn(box.onResized(), 'emit');
        box.resize({width: 123, height: 456});

        expect(box.onResized().emit).not.toHaveBeenCalled();
      });

      it('should not fire the restriction callback if the resize is not restricted', function () {
        var called = false;

        box.resize({width: 301}, function () {
          called = true;
        });

        expect(called).toEqual(false);
      });

      it('should be chainable', function () {
        expect(box.resize({})).toBe(box);
      })

      describe('when the size is restricted', function () {

        it('should not set the dimensions to greater that the max', function () {
          box.restrictTo({
            maximum: {
              width: 300,
              height: 300
            }
          });

          box.resize({width: 301, height: 301});
          expect(box.size()).toEqualRect({
            width: 300,
            height: 300
          });
        });

        it('should not set the dimensions to less that the min', function () {
          box.restrictTo({
            minimum: {
              width: 301,
              height: 301
            }
          });
          box.resize({width: 300, height: 300});
          expect(box.size()).toEqualRect({width: 301, height: 301});
        });

        it('should be able to set the size to the maximum dimensions', function () {

          box.restrictTo({
            maximum: {
              width: 300,
              height: 300
            }
          });

          box.resize({width: 300, height: 300});

          expect(box.size()).toEqualRect({width: 300, height: 300});
        });

        it('should be able to set the size to the minimum dimensions', function () {

          box.restrictTo({
            minimum: {
              width: 300,
              height: 300
            }
          });

          box.resize({width: 300, height: 300});

          expect(box.size()).toEqualRect({width: 300, height: 300});
        });

        it('should callback if the resize is limited', function () {

          var called = false;

          box.restrictTo({maximum: {width: 300}});
          box.resize({width: 301}, function () {
            called = true;
          });

          expect(called).toEqual(true);
        });
      });
    })

    describe('position()', function() {
      it('should be all zero on a new box', function () {
        expect(box.position()).toEqualRect({
          top: 0,
          right: 0,
          bottom: 0,
          left: 0
        })
      });

      it('should return the top-left-right-bottom of the box', function () {
        box.resize({width: 100, height: 50});
        box.moveTo({top: 10, left: 10});

        expect(box.position()).toEqualRect({
          top: 10,
          right: 110,
          bottom: 60,
          left: 10
        })
      });
    });

    describe('moveTo()', function () {

      it('should emit an onMoved event with the box', function () {
        spyOn(box.onMoved(), 'emit').andCallThrough();

        var v;

        box.onMoved(function (a) {
          v = a;
        });

        var p = {top: 123, left: 456};
        box.moveTo(p);

        expect(box.onMoved().emit).toHaveBeenCalled();
        expect(v).toBe(box);
      });

      it('should not emit an onMoved event if the position set is the same as the current position', function () {
        box.moveTo({top: 123, left: 456});

        spyOn(box.onMoved(), 'emit');
        box.moveTo({top: 123, left: 456});

        expect(box.onMoved().emit).not.toHaveBeenCalled();
      });

      it('should translate calls with right/bottom to calls with left/top', function () {
        box.resize({width: 50, height: 60});
        box.moveTo({right: 200, bottom: 300});

        var position = box.position();

        expect(position).toEqualRect({
          top: 240,
          right: 200,
          bottom: 300,
          left: 150
        });
      });

      it('should not fire the restriction callback if the reposition was not limited', function () {
        var called = false;

        box.moveTo({top: 301}, function () {
          called = true;
        });

        expect(called).toEqual(false);
      })

      it('should be chainable', function () {
        expect(box.moveTo({top: 0, left: 0})).toBe(box);
      })

      describe('when the position is restricted', function () {

        it('should not set the position to greater that the max', function () {
          box.restrictTo({
            maximum: {
              left: 300,
              top: 300
            }
          });

          box.moveTo({left: 301, top: 301});

          expect(box.position()).toEqualRect({
            top: 300,
            left: 300,
            bottom: 300,
            right: 300
          });
        });

        it('should not set the position to less that the min', function () {
          box.restrictTo({
            minimum: {
              left: 301,
              top: 301
            }
          });
          box.moveTo({left: 300, top: 300});
          expect(box.position()).toEqualRect({left: 301, top: 301, bottom: 301, right: 301});
        });

        it('should be able to set the position to the maximum', function () {

          box.restrictTo({
            maximum: {
              left: 300,
              top: 300
            }
          });

          box.moveTo({left: 300, top: 300});

          expect(box.position()).toEqualRect({left: 300, top: 300, bottom: 300, right: 300});
        });

        it('should be able to set the position to the minimum', function () {

          box.restrictTo({
            minimum: {
              left: 300,
              top: 300
            }
          });

          box.moveTo({left: 300, top: 300});

          expect(box.position()).toEqualRect({left: 300, top: 300, bottom: 300, right: 300});
        });

        it('it should callback', function () {
          var called = false;
          box.restrictTo({maximum: {left: 300}});
          box.moveTo({left: 301}, function () {
            called = true;
          });

          expect(called).toEqual(true);
        });
      })
    });

    describe('restrictTo()', function () {

      it('should return an empty size limit object by default', function () {
        expect(box.restrictions()).toEqualRestrictions({});
      })

      it('should interpret null as no restrictions', function () {
        box.restrictTo({maximum:{width: 30}});
        box.restrictTo(null);
        expect(box.restrictions().maximum.width).not.toEqual(30);
      })

      it("should be chainable", function() {
        var r = box.restrictTo({});
        expect(r).toBe(box);
      });

      it('should update the current size when the minimum size is set', function () {
        box.resize({width: 0, height: 0});

        spyOn(box, 'resize').andCallThrough();

        box.restrictTo({
          minimum: {
            width: 30,
            height: 30
          }
        });

        expect(box.size()).toEqualRect({width: 30, height: 30});
        expect(box.resize).toHaveBeenCalled();
      })

      it('should update the current size when the maximum size is set', function () {
        box.resize({width: 500, height: 500});

        spyOn(box, 'resize').andCallThrough();

        box.restrictTo({
          maximum: {
            width: 100,
            height: 100
          }
        });

        expect(box.size()).toEqualRect({width: 100, height: 100});
        expect(box.resize).toHaveBeenCalled();
      });

      it('should update the current position when the maximum position is set', function () {
        box.moveTo({top: 500, left: 500});

        spyOn(box, 'moveTo').andCallThrough();

        box.restrictTo({
          maximum: {
            top: 100,
            left: 100
          }
        });

        expect(box.position()).toEqualRect({top: 100, left: 100, bottom: 100, right: 100});
        expect(box.moveTo).toHaveBeenCalled();
      });

      it('should update the current position when the minimum position is set', function () {
        box.moveTo({top: 500, left: 500});

        spyOn(box, 'moveTo').andCallThrough();

        box.restrictTo({
          minimum: {
            top: 600,
            left: 600
          }
        });

        expect(box.position()).toEqualRect({top: 600, left: 600, bottom: 600, right: 600});
        expect(box.moveTo).toHaveBeenCalled();
      });

      it("should not change the size if the current size is within the bounds", function() {
        box.resize({width: 150, height: 150});

        spyOn(box, 'resize');

        box.restrictTo({
          minimum: {
            width: 100,
            height: 100
          },
          maximum: {
            width: 200,
            height: 200
          }
        });

        expect(box.size()).toEqualRect({width: 150, height: 150});
        expect(box.resize).not.toHaveBeenCalled();
      });

      it("should throw an error if a minimum is greater than a corresponding maximum", function() {

        expect(function () {
          box.restrictTo({
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
          box.resize({width: 200});
          box.restrictTo({
            minimum: {
              left: 500
            },
            maximum: {
              right: 600
            }
          })
        }).toThrow();

        expect(function () {
          box.restrictTo({
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
        box.restrictTo({})
        expect(box.restrictions()).toEqualRestrictions({minimum:{
          width: 0,
          height: 0
        }, maximum:{}});
      });

      it("should default negative width/height values to zero", function() {
        box.restrictTo({
          minimum: {
            width: -1,
            height: -1
          },
          maximum: {
            width: -1,
            height: -1
          }
        });
        expect(box.restrictions()).toEqualRestrictions({
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
        box.resize({
          width: 100,
          height: 100
        })
        box.restrictTo({
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
        expect(box.restrictions()).toEqualRestrictions({
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
        expect(box.restrictions()).toEqualRestrictions({minimum:{
          width: 0,
          height: 0
        }, maximum:{}});
      });

      it("should translate restrictions to all four edges", function() {
        box.resize({
          width: 100,
          height: 100
        });

        box.restrictTo({
          minimum: {
            bottom: 430,
            right: 320
          }
        });

        expect(box.restrictions()).toEqualRestrictions({
          minimum: {
            top: 330,
            bottom: 430,
            left: 220,
            right: 320
          }
        });

        box.restrictTo({
          maximum: {
            top: 430,
            left: 320
          }
        });

        expect(box.restrictions()).toEqualRestrictions({
          maximum: {
            top: 430,
            bottom: 530,
            left: 320,
            right: 420
          }
        });
      });

      it("should return the current restrictions for the box", function () {
        box.restrictTo({
          maximum:{
            width: 141,
            height: 92
        }});

        expect(box.restrictions()).toEqualRestrictions({
          maximum:{
            width: 141,
            height: 92
        }});
      });
    });

  }
}