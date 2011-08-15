describe("bindTo()", function () {
  var view, otherView;
  beforeEach(function () {
    view = new Superview;
    otherView = new Superview;
    
    view.z().css('borderWidth', 10);
  });
  
  it ('should be chainable', function () {
    var rtn = view.bindTo(otherView, {});
    expect(rtn).toBe(view);
  })
  
  describe("binding to the width of the other view", function () {
    it ("should not throw an error if the height binding is undefined", function () {
      view.bindTo(otherView, {});
      otherView.setSize({width: 123, height: 456});
    });
    it ("should throw an error if the width binding is a string", function () {
      var fn = function () {
        view.bindTo(otherView, {
          width: "meow"
        });
        otherView.setSize({width: 1, height: 2});
      }
      expect(fn).toThrowAnError();
    })
    describe("with true indicating match the view outer width with the otherView width", function () {
      it('should match the OUTER width of the bound view to the inner width of the otherView', function () {
        
        view.bindTo(otherView, {
          width: true
        });
        
        var s;
        
        spyOn(view, 'setOuterSize').andCallFake(function (_s) {
          s = _s;
        })
        
        otherView.setSize({width: 123, height: 456});
        
        expect(view.setOuterSize).toHaveBeenCalled();
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
        
        spyOn(view, 'setOuterSize').andCallFake(function (_s) {
          s = _s;
        })
        
        otherView.setSize({width: 222, height: 456});
        
        expect(view.setOuterSize).toHaveBeenCalled();
        expect(s.width).toEqual(111);   
      });
    })
    describe("with number representing a fraction of the other view width", function () {
      it("should set the view outer width to a fraction fo the otherView width", function () {
        view.bindTo(otherView, {
          width: 1.8
        });
        otherView.setSize({width: 100, height: 2});
        expect(view.getOuterRect().width).toEqual(180);
      })
    })
  });
  describe("binding to the height of the other view", function () {
    it ("should not throw an error if the height binding is undefined", function () {
      view.bindTo(otherView, {});
      otherView.setSize({width: 123, height: 456});
    });
    it ("should throw an error if the height binding is a string", function () {
      var fn = function () {
        view.bindTo(otherView, {
          width: "meow"
        });
        otherView.setSize({width: 1, height: 2});
      }
      expect(fn).toThrowAnError();
    })
    describe("with true indicating match the view outer height with the otherView height", function () {
      it('should match the OUTER height of the bound view to the inner height of the otherView', function () {
        
        view.bindTo(otherView, {
          height: true
        });
        
        var s;
        
        spyOn(view, 'setOuterSize').andCallFake(function (_s) {
          s = _s;
        })
        
        otherView.setSize({width: 123, height: 456});
        
        expect(view.setOuterSize).toHaveBeenCalled();
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
        
        spyOn(view, 'setOuterSize').andCallFake(function (_s) {
          s = _s;
        })
        
        otherView.setSize({width: 222, height: 650});
        
        expect(view.setOuterSize).toHaveBeenCalled();
        expect(s.height).toEqual(325);   
      });
    })
    describe("with number representing a fraction of the other view height", function () {
      it("should set the view outer height to a fraction fo the otherView height", function () {
        view.bindTo(otherView, {
          height: 1.8
        });
        otherView.setSize({width: 100, height: 200});
        expect(view.getOuterRect().height).toEqual(360);
      })
    })
  });
  describe("binding the top of the view", function () {
    it ("should not throw an error if the top binding is undefined", function () {
      view.bindTo(otherView, {});
      otherView.moveOuterTo({top: 123, left: 456});
    });
    describe("with true", function () {
      it('should bind to the top of the otherView', function () {
        view.bindTo(otherView, {
          top: true
        });
        
        otherView.moveTo({top: 101, left: 202});
        
        expect(view.getOuterRect().top).toEqual(101);
      });
    });
    describe('with "top"', function(){
      it ('should bind to the top of the other view', function () {
        view.bindTo(otherView, {
          top: 'top'
        });
        
        otherView.moveTo({top: 101, left: 202});
        
        expect(view.getOuterRect().top).toEqual(101);
      });
    })
    describe("with 'bottom'", function () {
      it("should bind to the bottom of the other view", function () {
        view.bindTo(otherView, {
          top: 'bottom'
        });
        
        otherView.setOuterSize({width: 200, height: 300});
        otherView.moveOuterTo({top: 101, left: 202});
        
        expect(view.getOuterRect().top).toEqual(401);
      });
    });
    describe("with a number", function () {
      it("should bind the top of the view to the number multiplied by the height of the other view", function () {
        view.bindTo(otherView, {
          top: 0.2
        });
        
        otherView.setSize({width: 1005, height: 1000});
        //otherView.moveOuterTo({top: 10, left: 202});
        
        expect(view.getOuterRect().top).toEqual(200);
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
        
        expect(view.getOuterRect().top).toEqual(5134);
      });
    })
  });
  describe("binding the bottom of the view", function () {
    it ("should not throw an error if the bottom binding is undefined", function () {
      view.bindTo(otherView, {});
      otherView.moveOuterTo({top: 123, left: 456});
    });
    describe("with true", function () {
      it('should bind to the top of the otherView', function () {
        view.bindTo(otherView, {
          bottom: true
        });
        
        otherView.setSize({width: 100, height: 300});
        otherView.moveTo({top: 101, left: 202});
        
        expect(view.getOuterRect().bottom).toEqual(401);
      });
    });
    describe('with "bottom"', function(){
      it ('should bind to the bottom of the other view', function () {
        view.bindTo(otherView, {
          bottom: 'bottom'
        });
        
        otherView.setSize({width: 100, height: 300});
        otherView.moveTo({top: 101, left: 202});
        
        expect(view.getOuterRect().bottom).toEqual(401);
      });
    })
    describe("with 'top'", function () {
      it("should bind to the bottom of the other view", function () {
        view.bindTo(otherView, {
          bottom: 'top'
        });
        view.setOuterSize({width: 200, height: 300});
        otherView.moveOuterTo({top: 101, left: 202});
        
        expect(view.getOuterRect().bottom).toEqual(101);
      });
    });
    describe("with a number", function () {
      it("should bind the bottom of the view to the number multiplied by the height of the other view", function () {
        view.bindTo(otherView, {
          bottom: 0.2
        });
        
        otherView.setSize({width: 1005, height: 1000});
        otherView.moveOuterTo({top: 106, left: 202});
        
        expect(view.getOuterRect().bottom).toEqual(0.2*1000);
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
        
        expect(view.getOuterRect().bottom).toEqual(6543);
      });
    })
  });
  describe("binding the left of the view", function () {
    it ("should not throw an error if the left binding is undefined", function () {
      view.bindTo(otherView, {});
      otherView.moveOuterTo({top: 123, left: 456});
    });
    describe("with true", function () {
      it('should bind to the left of the otherView', function () {
        view.bindTo(otherView, {
          left: true
        });
        
        otherView.moveTo({top: 101, left: 202});
        
        expect(view.getOuterRect().left).toEqual(202);
      });
    });
    describe('with "left"', function(){
      it ('should bind to the top of the other view', function () {
        view.bindTo(otherView, {
          left: 'left'
        });
        
        otherView.moveTo({top: 101, left: 202});
        
        expect(view.getOuterRect().left).toEqual(202);
      });
    })
    describe("with 'right'", function () {
      it("should bind to the right of the other view", function () {
        view.bindTo(otherView, {
          left: 'right'
        });
        view.setOuterSize({width: 200, height: 300});
        otherView.moveOuterTo({top: 101, left: 209});
        
        expect(view.getOuterRect().right).toEqual(409);
      });
    });
    describe("with a number", function () {
      it("should bind the left of the view to the number multiplied by the width of the other view", function () {
        view.bindTo(otherView, {
          left: 0.2
        });
        
        otherView.setSize({width: 1000, height: 1005});
        
        expect(view.getOuterRect().left).toEqual(200);
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
        
        expect(view.getOuterRect().left).toEqual(5134);
      });
    })
  }); 
  describe("binding the right of the view", function () {
    it ("should not throw an error if the right binding is undefined", function () {
      view.bindTo(otherView, {});
      otherView.moveOuterTo({top: 123, left: 456});
    });
    describe("with true", function () {
      it('should bind to the right of the otherView', function () {
        view.bindTo(otherView, {
          right: true
        });
        
        otherView.setSize({width: 300});
        otherView.moveTo({top: 101, left: 202});        
        
        expect(view.getOuterRect().right).toEqual(502);
      });
    });
    describe('with "left"', function(){
      it ('should bind the right edge of the view to the left edge of the other view', function () {
        view.bindTo(otherView, {
          right: 'left'
        });
        
        otherView.setOuterSize({width: 80, height: 90});
        otherView.moveTo({top: 101, left: 313});
        
        expect(view.getOuterRect().right).toEqual(313);
      });
    })
    describe("with 'right'", function () {
      it("should bind to the right of the other view", function () {
        view.bindTo(otherView, {
          right: true
        });
        
        otherView.setSize({width: 300});
        otherView.moveTo({top: 101, left: 202});        
        
        expect(view.getOuterRect().right).toEqual(502);
      });
    });
    describe("with a number", function () {
      it("should bind the right of the view to the number multiplied by the width of the other view", function () {
        view.bindTo(otherView, {
          right: 0.6
        });
        
        otherView.setSize({width: 1000, height: 1005});
        
        expect(view.getOuterRect().right).toEqual(600);
      });
    });
    describe('with a function', function () {
      it ('should set the outer right position of the view to the value returned by the function', function () {
        view.bindTo(otherView, {
          right: function (other, oRect, oOuterRect) {
            return 1024;
          }
        });
        
        otherView.setSize({width: 13});
        otherView.moveTo({top: 101, left: 202});
        
        expect(view.getOuterRect().right).toEqual(1024);
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
      
      expect(view.getOuterRect().width).toEqual(9876);
    })
  });
  
  describe("when resizing the otherView", function () {
    it ("should effect the position bindings on the binding view", function () {
      view.bindTo(otherView, {
        top: function () {
          return 9876;
        }
      })
      
      otherView.setSize({width: 140, height: 400});
      
      expect(view.getOuterRect().top).toEqual(9876);
    })
  })
});


// view.bindTo(other, {
//   left: true|'left', 'right', function () { return /* left OUTER position */ }
//   top: true|'top', 'bottom', function () { return /* top OUTER position for this element */ }
//   width: true|'width', fraction of otherView.width, function // return OUTER width of this element
// })
// 
// 
// 
// view.bindToParent(view , function (bind) {
//   bind.top = function (other, otherRect, otherOuterRect) {
//     
//   }
// })

/*


view

other



view.bindTo(other, {
  width: true,
  height: function (otherRect, view, other) { return otherRect.height * 0.5 ;} (function in context of view),
  top: [true|top] | 'bottom' | '*3.2'(evalableexpress with) | function,
  left: SIMILAR to TOP
})

- shuold not bindTo() more than once with calling unbind() first
- calls unbind() if other emits onRemoved

view.unbind()
- if not bound returns ineffectual
- stop listeneing to onMove and onResize events on the bindTo(other) view and sets this._bindTo and others to null

binding
- return view and binding

*/