describe('superview.restrictions', function () {
  
  var view;
  
  beforeEach(function() {
    view = new Superview;
  });
  
  xdescribe('restrictTo()', function () {
    var view;
    
    beforeEach(function () {
      view = new Superview;
    })  
    
    it('should return an empty size limit object by default', function () {
      expect(view.restrictions()).toEqualRect({});
    })
    
    it("should be chainable", function() {
      var r = view.restrictTo({});
      expect(r).toBe(view);
    });  
    
    it('should update the current size when the minimum size is set', function () {
      view.resize({width: 0, height: 0});
      
      view.restrictTo({
        minimum: {
          width: 30,
          height: 30
        }
      });
      
      expect(view.rect()).toEqualRect({width: 30, height: 30});
    })
    
    it('should update the current size when the maximum size is set', function () {
      view.resize({width: 500, height: 500});
      
      view.restrictTo({
        maximum: {
          width: 100,
          height: 100
        }
      });
      
      expect(view.rect()).toEqualRect({width: 100, height: 100});
    });
    
    it("should not change the size if the current size is within the bounds", function() {
      view.resize({width: 150, height: 150});
      
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
      
      expect(view.rect()).toEqualRect({width: 150, height: 150});
    });
    
    it("should throw an error if the minimum is greater than the maximum", function() {
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
      }).toThrowAnError();
    });
    
    it('should accept an empty object as no limits', function () {
      fail()
    });
  })

  xdescribe('restrictions()', function () {
    it("should return the current size limit for the view", function () {
      var view = new Superview;
      view.restrictTo({width: 141, height: 92});
      expect(view.restrictions()).toEqualRect({width: 141, height: 92});
    });
  });
  
  xdescribe('outerRestrictTo()', function () {
    var view;
    
    beforeEach(function () {
      view = new Superview;
      view.$().css({
        border: 10,
        padding: 30
      })
    })
  
    it('should translate the call down to a restrictTo() equivalent and call it', function () {
  
      spyOn(view, 'restrictTo').andCallFake(function (restrictions) {
        expect(restrictions.minimum).toEqualRect({
          width: 60,
          height: 60
        });
        expect(restrictions.maximum).toEqualRect({
          width: 160,
          height: 160
        });
      });
        
      view.outerRestrictTo({
        minimum: {
          width: 100,
          height: 100
        },
        maximum: {
          width: 200,
          height: 200
        }
      });
      
      expect(view.restrictTo).toHaveBeenCalled();
    })
  });

  xdescribe('outerRestrictions()', function () {
    it("should return the current outer size limit for the view", function() {
      var view = new Superview;
      view.outerRestrictTo({width: 141, height: 92});
      expect(view.outerRestrictions()).toEqualRect({width: 141, height: 92});
    });
  })
})