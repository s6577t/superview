describe("Superview.Anchoring", function() {

  var view, otherView;

  beforeEach(function () {

    view = new Superview;
    view.resize({width: 100, height: 200});
    view.moveTo({top: 33, left: 45});

    otherView = new Superview;
    otherView.resize({width: 331, height: 220});
    otherView.moveTo({top: 11, right: 280});
    otherView = otherView.contentArea();
  });

  describe("getUpdatedDimension()", function() {

    var getUpdatedDimension;

    beforeEach(function () {
      getUpdatedDimension = function (dimension, currentValue, anchoring, view) {
        return Superview.Anchoring.getUpdatedDimension(dimension, currentValue, anchoring, view)
      };
    });

    ['width', 'height'].forEach(function (dimension) {

      it ("should not throw an error if the " + dimension + " anchoring is undefined", function () {
        expect(function () {
          getUpdatedDimension(dimension, 123, {}, view);
        }).not.toThrow();
      });

      describe('with an offset described as a string', function () {

        describe ('invalid offsets', function () {

          ['hello', 'NaN', 'Infinity', '*30'].forEach(function (invalidValue) {
            it("should throw an error when given: " + invalidValue, function() {

              var anchoring = {
                otherView: otherView
              };

              anchoring[dimension] = invalidValue;

              expect(function () {
                getUpdatedDimension(dimension, 123, anchoring, view);
              }).toThrowErrorMatching(/Invalid anchoring/)
            });
          })

        });

        var validOffsets = {
          '30': 30,
          '150px': 150,
          '+11px': 11,
          '+123': 123,
          '-20px': -20,
          '-200': -200
        };

        for (var offset in validOffsets) {
          var expectedResultingOffset = validOffsets[offset];

          it("correctly returns the offset " + dimension, function() {

            var anchoring = {
              otherView: otherView
            };

            anchoring[dimension] = offset;

            expect(getUpdatedDimension(dimension, 10, anchoring, view)).toEqual(expectedResultingOffset + otherView.size()[dimension]);
          });
        }
      })
      xdescribe("with true indicating match the view outer width with the otherView width", function () {
        it('should match the OUTER width of the bound view to the inner width of the otherView', function () {

          view.anchorTo(otherView, {
            width: true
          });

          var s;

          spyOn(view, 'outerResize').andCallFake(function (_s) {
            s = _s;
          })

          otherView.resize({width: 123, height: 456});

          expect(view.outerResize).toHaveBeenCalled();
          expect(s.width).toEqual(123);
        });
        it('should match the outer width of the bound view to the outer width of the otherView', function () {

          view.anchorTo(otherView, {
            width: true
          });

          otherView.outerResize({width: 123, height: 456});

          expect(view.outerRect().width).toBe(123);
        });
      });
      xdescribe("with a function which should return the view outer width", function () {
        it('should call the function with (otherView, otherRect, otherOuterRect) to get the OUTER width of the bound view', function () {

          var v, otherRect, otherOuterRect;

          view.anchorTo(otherView, {
            width: function (a, b, c) {
             v = a;
             otherRect = b;
             otherOuterRect = c;
             return 0.5 * b.width;
            }
          });

          var s;

          spyOn(view, 'outerResize').andCallFake(function (_s) {
            s = _s;
          })

          otherView.resize({width: 222, height: 456});

          expect(view.outerResize).toHaveBeenCalled();
          expect(s.width).toEqual(111);
        });
      })
      xdescribe("with number representing a fraction of the other view width", function () {
        it("should set the view outer width to a fraction of the otherView width", function () {
          view.anchorTo(otherView, {
            width: 1.8
          });
          otherView.resize({width: 100, height: 2});
          expect(view.outerRect().width).toEqual(180);
        })
      })
    })
  });

  describe("resizeHandler()", function() {

    // var resizeHandler;
    // 
    //     beforeEach(function () {
    //       resizeHandler = function () {
    //         return Superview.Anchoring.resizeHandler.apply(Superview.Anchoring, arguments);
    //       }
    //     });
    
    describe('when invoked', function () {
      
      // var invoke;
      //      
      //      beforeEach(function () {
      //        invoke = function () {
      //          resizeHandler(view)(otherView);
      //        }
      //      });
      
      ['width', 'height'].forEach(function (dimension) {
        it("calls getUpdatedDimension() for the " + dimension, function() {

          spyOn(Superview.Anchoring, 'getUpdatedDimension').andCallFake(function () {})

          var anchoring = {otherView: otherView};
          view._anchoring = anchoring;

          Superview.Anchoring.resizeHandler(view)(otherView);

          expect(Superview.Anchoring.getUpdatedDimension).toHaveBeenCalledWith(dimension, view.size()[dimension], anchoring, view);
        });
      });
    });
  });
});