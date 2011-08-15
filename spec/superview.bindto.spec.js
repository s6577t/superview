describe("bind layout behaviour", function () {
  
  var view, otherView;

  beforeEach(function () {
    view = new Superview;
    otherView = new Superview;

    view.z().css('borderWidth', 10);
  });
  
  describe("bindTo()", function () {
    it ('should be chainable', function () {
      var rtn = view.bindTo(otherView, {});
      expect(rtn).toBe(view);
    });
    
    it ('should unbind any current binding before making a new binding', function() {
      view.bindTo(otherView, {});
      spyOn(view, 'unbind');
      view.bindTo(new Superview(), {});
      expect(view.unbind).toHaveBeenCalled();
    })
  
    describe("binding to the width of the other view", function () {
      it ("should not throw an error if the height binding is undefined", function () {
        view.bindTo(otherView, {});
        otherView.resize({width: 123, height: 456});
      });
      it ("should throw an error if the width binding is a string", function () {
        var fn = function () {
          view.bindTo(otherView, {
            width: "meow"
          });
          otherView.resize({width: 1, height: 2});
        }
        expect(fn).toThrowAnError();
      })
      describe("with true indicating match the view outer width with the otherView width", function () {
        it('should match the OUTER width of the bound view to the inner width of the otherView', function () {
        
          view.bindTo(otherView, {
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
      });
      describe("with a function which should return the view outer width", function () {
        it('should call the function with (otherView, otherRect, otherOuterRect) to get the OUTER width of the bound view', function () {
        
          var v, otherRect, otherOuterRect;
        
          view.bindTo(otherView, {
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
      describe("with number representing a fraction of the other view width", function () {
        it("should set the view outer width to a fraction fo the otherView width", function () {
          view.bindTo(otherView, {
            width: 1.8
          });
          otherView.resize({width: 100, height: 2});
          expect(view.outerRect().width).toEqual(180);
        })
      })
    });
    describe("binding to the height of the other view", function () {
      it ("should not throw an error if the height binding is undefined", function () {
        view.bindTo(otherView, {});
        otherView.resize({width: 123, height: 456});
      });
      it ("should throw an error if the height binding is a string", function () {
        var fn = function () {
          view.bindTo(otherView, {
            width: "meow"
          });
          otherView.resize({width: 1, height: 2});
        }
        expect(fn).toThrowAnError();
      })
      describe("with true indicating match the view outer height with the otherView height", function () {
        it('should match the OUTER height of the bound view to the inner height of the otherView', function () {
        
          view.bindTo(otherView, {
            height: true
          });
        
          var s;
        
          spyOn(view, 'outerResize').andCallFake(function (_s) {
            s = _s;
          })
        
          otherView.resize({width: 123, height: 456});
        
          expect(view.outerResize).toHaveBeenCalled();
          expect(s.height).toEqual(456);    
        });      
      });
      describe("with a function which should return the view outer height", function () {
        it('should call the function with (otherView, otherRect, otherOuterRect) to get the OUTER height of the bound view', function () {
        
          var v, otherRect, otherOuterRect;
        
          view.bindTo(otherView, {
            height: function (a, b, c) {
             v = a;
             otherRect = b;
             otherOuterRect = c;
             return 0.5 * b.height; 
            }
          });
        
          var s;
        
          spyOn(view, 'outerResize').andCallFake(function (_s) {
            s = _s;
          })
        
          otherView.resize({width: 222, height: 650});
        
          expect(view.outerResize).toHaveBeenCalled();
          expect(s.height).toEqual(325);   
        });
      })
      describe("with number representing a fraction of the other view height", function () {
        it("should set the view outer height to a fraction fo the otherView height", function () {
          view.bindTo(otherView, {
            height: 1.8
          });
          otherView.resize({width: 100, height: 200});
          expect(view.outerRect().height).toEqual(360);
        })
      })
    });
    describe("binding the top of the view", function () {
      it ("should not throw an error if the top binding is undefined", function () {
        view.bindTo(otherView, {});
        otherView.outerMoveTo({top: 123, left: 456});
      });
      describe("with true", function () {
        it('should bind to the top of the otherView', function () {
          view.bindTo(otherView, {
            top: true
          });
        
          otherView.moveTo({top: 101, left: 202});
        
          expect(view.outerRect().top).toEqual(101);
        });
      });
      describe('with "top"', function(){
        it ('should bind to the top of the other view', function () {
          view.bindTo(otherView, {
            top: 'top'
          });
        
          otherView.moveTo({top: 101, left: 202});
        
          expect(view.outerRect().top).toEqual(101);
        });
      })
      describe("with 'bottom'", function () {
        it("should bind to the bottom of the other view", function () {
          view.bindTo(otherView, {
            top: 'bottom'
          });
        
          otherView.outerResize({width: 200, height: 300});
          otherView.outerMoveTo({top: 101, left: 202});
        
          expect(view.outerRect().top).toEqual(401);
        });
      });
      describe("with a number", function () {
        it("should bind the top of the view to the number multiplied by the height of the other view", function () {
          view.bindTo(otherView, {
            top: 0.2
          });
        
          otherView.resize({width: 1005, height: 1000});
          //otherView.outerMoveTo({top: 10, left: 202});
        
          expect(view.outerRect().top).toEqual(200);
        });
      });
      describe('with a function', function () {
        it ('should set the outer top position of the view to the value returned by the function', function () {
          view.bindTo(otherView, {
            top: function (other, oRect, oOuterRect) {
              return 5134;
            }
          });
        
          otherView.moveTo({top: 101, left: 202});
        
          expect(view.outerRect().top).toEqual(5134);
        });
      })
    });
    describe("binding the bottom of the view", function () {
      it ("should not throw an error if the bottom binding is undefined", function () {
        view.bindTo(otherView, {});
        otherView.outerMoveTo({top: 123, left: 456});
      });
      describe("with true", function () {
        it('should bind to the top of the otherView', function () {
          view.bindTo(otherView, {
            bottom: true
          });
        
          otherView.resize({width: 100, height: 300});
          otherView.moveTo({top: 101, left: 202});
        
          expect(view.outerRect().bottom).toEqual(401);
        });
      });
      describe('with "bottom"', function(){
        it ('should bind to the bottom of the other view', function () {
          view.bindTo(otherView, {
            bottom: 'bottom'
          });
        
          otherView.resize({width: 100, height: 300});
          otherView.moveTo({top: 101, left: 202});
        
          expect(view.outerRect().bottom).toEqual(401);
        });
      })
      describe("with 'top'", function () {
        it("should bind to the bottom of the other view", function () {
          view.bindTo(otherView, {
            bottom: 'top'
          });
          view.outerResize({width: 200, height: 300});
          otherView.outerMoveTo({top: 101, left: 202});
        
          expect(view.outerRect().bottom).toEqual(101);
        });
      });
      describe("with a number", function () {
        it("should bind the bottom of the view to the number multiplied by the height of the other view", function () {
          view.bindTo(otherView, {
            bottom: 0.2
          });
        
          otherView.resize({width: 1005, height: 1000});
          otherView.outerMoveTo({top: 106, left: 202});
        
          expect(view.outerRect().bottom).toEqual(0.2*1000);
        });
      });
      describe('with a function', function () {
        it ('should set the outer bottom position of the view to the value returned by the function', function () {
          view.bindTo(otherView, {
            bottom: function (other, oRect, oOuterRect) {
              return 6543;
            }
          });
        
          otherView.moveTo({top: 101, left: 202});
        
          expect(view.outerRect().bottom).toEqual(6543);
        });
      })
    });
    describe("binding the left of the view", function () {
      it ("should not throw an error if the left binding is undefined", function () {
        view.bindTo(otherView, {});
        otherView.outerMoveTo({top: 123, left: 456});
      });
      describe("with true", function () {
        it('should bind to the left of the otherView', function () {
          view.bindTo(otherView, {
            left: true
          });
        
          otherView.moveTo({top: 101, left: 202});
        
          expect(view.outerRect().left).toEqual(202);
        });
      });
      describe('with "left"', function(){
        it ('should bind to the top of the other view', function () {
          view.bindTo(otherView, {
            left: 'left'
          });
        
          otherView.moveTo({top: 101, left: 202});
        
          expect(view.outerRect().left).toEqual(202);
        });
      })
      describe("with 'right'", function () {
        it("should bind to the right of the other view", function () {
          view.bindTo(otherView, {
            left: 'right'
          });
          view.outerResize({width: 200, height: 300});
          otherView.outerMoveTo({top: 101, left: 209});
        
          expect(view.outerRect().right).toEqual(409);
        });
      });
      describe("with a number", function () {
        it("should bind the left of the view to the number multiplied by the width of the other view", function () {
          view.bindTo(otherView, {
            left: 0.2
          });
        
          otherView.resize({width: 1000, height: 1005});
        
          expect(view.outerRect().left).toEqual(200);
        });
      });
      describe('with a function', function () {
        it ('should set the outer left position of the view to the value returned by the function', function () {
          view.bindTo(otherView, {
            left: function (other, oRect, oOuterRect) {
              return 5134;
            }
          });
        
          otherView.moveTo({top: 101, left: 202});
        
          expect(view.outerRect().left).toEqual(5134);
        });
      })
    }); 
    describe("binding the right of the view", function () {
      it ("should not throw an error if the right binding is undefined", function () {
        view.bindTo(otherView, {});
        otherView.outerMoveTo({top: 123, left: 456});
      });
      describe("with true", function () {
        it('should bind to the right of the otherView', function () {
          view.bindTo(otherView, {
            right: true
          });
        
          otherView.resize({width: 300});
          otherView.moveTo({top: 101, left: 202});        
        
          expect(view.outerRect().right).toEqual(502);
        });
      });
      describe('with "left"', function(){
        it ('should bind the right edge of the view to the left edge of the other view', function () {
          view.bindTo(otherView, {
            right: 'left'
          });
        
          otherView.outerResize({width: 80, height: 90});
          otherView.moveTo({top: 101, left: 313});
        
          expect(view.outerRect().right).toEqual(313);
        });
      })
      describe("with 'right'", function () {
        it("should bind to the right of the other view", function () {
          view.bindTo(otherView, {
            right: true
          });
        
          otherView.resize({width: 300});
          otherView.moveTo({top: 101, left: 202});        
        
          expect(view.outerRect().right).toEqual(502);
        });
      });
      describe("with a number", function () {
        it("should bind the right of the view to the number multiplied by the width of the other view", function () {
          view.bindTo(otherView, {
            right: 0.6
          });
        
          otherView.resize({width: 1000, height: 1005});
        
          expect(view.outerRect().right).toEqual(600);
        });
      });
      describe('with a function', function () {
        it ('should set the outer right position of the view to the value returned by the function', function () {
          view.bindTo(otherView, {
            right: function (other, oRect, oOuterRect) {
              return 1024;
            }
          });
        
          otherView.resize({width: 13});
          otherView.moveTo({top: 101, left: 202});
        
          expect(view.outerRect().right).toEqual(1024);
        });
      })
    });

    describe("when repositioning the otherView", function () {
      it ("should effect the size bindings on the binding view", function () {
        view.bindTo(otherView, {
          width: function () {
            return 9876;
          }
        })
      
        otherView.moveTo({top: 14, right: 400});
      
        expect(view.outerRect().width).toEqual(9876);
      })
    });
  
    describe("when resizing the otherView", function () {
      it ("should effect the position bindings on the binding view", function () {
        view.bindTo(otherView, {
          top: function () {
            return 9876;
          }
        })
      
        otherView.resize({width: 140, height: 400});
      
        expect(view.outerRect().top).toEqual(9876);
      })
    })
  });

  describe("binding()", function () {
    it("should return null when the view is not bound", function () {
      expect(view.binding()).toBeNull();
    })
    it('should return the binding with the otherView', function () {
      var binding = {};
      view.bindTo(otherView, binding);
      var r = view.binding();
      
      expect(r.otherView).toBe(otherView);
      expect(r).toBe(binding);
    })
  })

  describe("unbind()", function () {
    it('should be chainable', function () {
      var v = new View1;
      expect(v.unbind()).toBe(v);
    })
    it('should be inneffectual if there is no bound view', function () {
      expect(view.unbind().binding()).toBeNull();
    })
    
    it('should remove event listeners from the otherView', function () {

      view.bindTo(otherView, {
        left: function () { return 480; },
        width: function () { return 313; }
      });
      
      view.unbind();
      
      expect(otherView.onResized().listeners().length).toEqual(0);
      expect(otherView.onMoved().listeners().length).toEqual(0);
    })
    
    it('should result in subsequent calls to binding() returning null', function () {
      view.bindTo(otherView, {});
      view.unbind();
      expect(view.binding()).toBeNull();
    })
  })
});