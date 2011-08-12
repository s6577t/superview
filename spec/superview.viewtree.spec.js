describe("view tree related behaviour", function () {
  
  it('is a root when it has no parent', function () {
    var root = new View1
    expect(root.isRootView()).toBeTruthy()
  })
  
  it('should return the root view with getRootView()', function () {
    var v1 = new Superview, v2 = new Superview, v3 = new Superview;
    v1.addSubview(v2);
    v2.addSubview(v3);
    expect(v3.getRootView()).toBe(v1);
  })
  
  it('is not a root when it has a parent', function () {
    var notRoot = new View1().setParentView(new View1())
    expect(notRoot.isRootView()).toBeFalsy();
  })

  describe('adding subviews', function () {

    it('should not add a subview more than once', function () {
      var v1 = new View1;
      var v2 = new View1;

      (10).times(function () {
        try {
          v1.addSubview(v2)
        } catch (e) {
          // because setParentView throws an error
        }
      })

      expect(v1.subviews().length).toEqual(1);      
    });

    it('sets the parentView when adding a subview', function () {
      var parent = new View1,
      child = new View1

      parent.addSubview(child)

      expect(child.getParentView()).toBe(parent)
    })

    it('should emit an onSubviewAdded event with child,parent arguments', function () {
      var parent = new View1,
      child = new View1

      var called = [];

      parent.onSubviewAdded(function () {
        called = arguments;
      })

      parent.addSubview(child);

      expect(called[0]).toBe(child);
      expect(called[1]).toBe(parent);
    })

    it('should make the subview available in subviews()', function () {
      var parent = new View1,
          child = new View1;

      parent.addSubview(child);

      expect(parent.subviews()).toContain(child);        
    });
    
    it('should add all subviews passed to addSubviews', function () {
      var parent = new View1,
          child = new View1,
          child2 = new View1;
      
      spyOn(parent, 'addSubview');
      
      parent.addSubviews(child, child2)
      
      expect(parent.addSubview).toHaveBeenCalledWith(child);     
      expect(parent.addSubview).toHaveBeenCalledWith(child2);     
    });
  });

  describe('setting the parent view', function () {

    it('should call remove() if setting the parent view to null or undefined', function () {
      var child = new Superview;
      
      spyOn(child, 'remove');
      
      child.setParentView(null);
      
      expect(child.remove).toHaveBeenCalled();      
    });

    it('should throw an error if the view already has a parent', function () {
      var child = new Superview,
          parent = new Superview,
          parent2 = new Superview;
      
      child.setParentView(parent);
      
      expect(function () {
         child.setParentView(parent2);
      }).toThrow('parent view already set');
    });

    it('should set the views parent to the specified parent', function () {
      var child = new Superview,
          parent = new Superview;
      
      child.setParentView(parent);
      
      expect(child._parentView).toBe(parent);
    });

    it('should be included in the parents subviews', function () {
      var child = new Superview,
          parent = new Superview;
      
      child.setParentView(parent);
      
      expect(parent.subviews()).toContain(child);
    });

    it('should emit an onParentViewSet event with child, parent', function () {
      var child = new Superview,
          parent = new Superview;
      
      spyOn(child.onParentViewSet(), 'emit');
      
      child.setParentView(parent);
      
      expect(child.onParentViewSet().emit).toHaveBeenCalledWith(child, parent);
    });
  })

  describe('when getting subviews', function () {

    it('returns an array that is a COPY of the internally managed array', function () {
      var parent = new View1, child = new View1
      parent.addSubview(child)
      expect(parent.subviews()).not.toBe(parent._subviews);
      expect(parent.subviews()).not.toBe(parent.subviews());
    });

    it('returns an array containing all subviews', function () {
      var parent = new View1, child = new View1
      parent.addSubview(child)
      expect(parent.subviews()).not.toBe(parent._subviews);
      expect(parent.subviews()).not.toBe(parent.subviews());
    })
  })

  describe('removing subviews', function () {
    
    var child, parent;
    
    beforeEach(function () {
      child = new Superview;
      parent = new Superview;
      
      parent.addSubview(child);
    })
    
    it('should not contain subviews removed with removeSubview', function () {
      var v1 = new View1;
      var v2 = new View1;
      v1.addSubview(v2);
      v1.removeSubviews(v2);
      expect(v1.subviews().contains(v2)).toBeFalsy();
    });

    it('should not contain any subviews after removeAllSubviews is called', function () {
      var v1 = new View1;
      
      v1.addSubview(new View1).addSubview(new View1);
      v1.removeAllSubviews();
      expect(v1.subviews().isEmpty()).toBeTruthy();
    });
    
    it('should emit an onSubviewRemoved event with child,parent', function () {
      spyOn(parent.onSubviewRemoved(), 'emit');
      
      parent.removeSubviews(child);
      
      expect(parent.onSubviewRemoved().emit).toHaveBeenCalledWith(child, parent);
    });
    
    it('should trigger the onRemoved event on the child', function () {
      spyOn(child.onRemoved(), 'emit');
      
      parent.removeSubviews(child);
      
      expect(child.onRemoved().emit).toHaveBeenCalledWith(child, parent);
    });
    
    it('should set the subviews parent view to null', function () {
      parent.removeSubviews(child);
      expect(child._parentView).toBeNull();
    });
    
    it('should call remove on the subview', function () {
      spyOn(child, 'remove');
      parent.removeSubviews(child);
      expect(child.remove).toHaveBeenCalled();
    })    
  });
  
  describe('removing a view', function() {
    
    var child, parent;
    
    beforeEach(function () {
      child = new Superview;
      parent = new Superview;
      parent.addSubview(child);
    })
    
    it('should be recursive', function () {
      var child2 = new Superview, child3 = new Superview;
      parent.addSubview(child2);
      child2.addSubview(child3);

      spyOn(child3, 'remove');
      
      parent.remove();
      
      expect(child3.remove).toHaveBeenCalled();
    });
    
    it('should emit onSubviewRemoved child,parent on its parent view', function () {
      spyOn(parent.onSubviewRemoved(), 'emit');
      child.remove();
      expect(parent.onSubviewRemoved().emit).toHaveBeenCalled();
    });
    
    it('should emit onRemoved child, parent', function () {
      spyOn(child.onRemoved(), 'emit');
      child.remove();
      expect(child.onRemoved().emit).toHaveBeenCalled();
    });
    
    it('should no longer have a parent view', function () {
      child.remove();
      expect(child._parentView).toBeNull();
    });
    
    it('should not be included in the parents subviews()', function () {
      child.remove();
      expect(parent._subviews[child.uuid()]).toBeUndefined();
    });
    
    it('should emit onRemoved with child,null if it is the root', function () {
      spyOn(parent.onRemoved(), 'emit');
      parent.remove();
      expect(parent.onRemoved().emit).toHaveBeenCalledWith(parent, null);
    });
  });

});

