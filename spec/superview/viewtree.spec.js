describe("view tree related behaviour", function () {
  
  it('is a root when it has no parent', function () {
    var root = new Superview
    expect(root.isRoot()).toBeTruthy()
  })
  
  it('should return the root view with root()', function () {
    var v1 = new Superview, v2 = new Superview, v3 = new Superview;
    v1.add(v2);
    v2.add(v3);
    expect(v3.root()).toBe(v1);
  })
  
  it('is not a root when it has a parent', function () {
    var notRoot = new Superview().addTo(new Superview())
    expect(notRoot.isRoot()).toBeFalsy();
  })

  describe('adding subviews', function () {
    it('should not add a subview more than once', function () {
      var v1 = new Superview;
      var v2 = new Superview;

      (10).times(function () {
        try {
          v1.add(v2)
        } catch (e) {
          // because addTo throws an error
        }
      })

      expect(v1.subviews().length).toEqual(1);      
    });

    it('sets the parent when adding a subview', function () {
      var parent = new Superview,
      child = new Superview

      parent.add(child)

      expect(child.parent()).toBe(parent)
    })

    it('should emit an onSubviewAdded event with child,parent arguments', function () {
      var parent = new Superview,
      child = new Superview

      var called = [];

      parent.onSubviewAdded(function () {
        called = arguments;
      })

      parent.add(child);

      expect(called[0]).toBe(child);
      expect(called[1]).toBe(parent);
    })

    it('should make the subview available in subviews()', function () {
      var parent = new Superview,
          child = new Superview;

      parent.add(child);

      expect(parent.subviews()).toContain(child);        
    });
    
    it('should add all subviews passed to add', function () {
      var parent = new Superview,
          child = new Superview,
          child2 = new Superview;
      
      parent.add(child, child2)
      
      expect(parent.subviews()).toContain(child);     
      expect(parent.subviews()).toContain(child2);     
    });
  });

  describe('adding to a parent view', function () {
    var child, parent;
    beforeEach(function () {
      child = new Superview();
      parent = new Superview();
    });
    
    it('should append a subview to the parent views dom', function () {
      child.$().id('woof');
      child.addTo(parent);
      expect(parent.$().find('#woof').toArray()).not.toBeEmpty();
    })    

    it('should call remove() if setting the parent view to null or undefined', function () {
      var child = new Superview;
      
      spyOn(child, 'remove');
      
      child.addTo(null);
      
      expect(child.remove).toHaveBeenCalled();      
    });

    it('should remove the view if it already has a parent', function () {
      var child = new Superview,
          parent = new Superview,
          parent2 = new Superview;
      
      child.addTo(parent);
      spyOn(child, 'remove');
      child.addTo(parent2);
      expect(child.remove).toHaveBeenCalled();
    });

    it('should set the views parent to the specified parent', function () {
      var child = new Superview,
          parent = new Superview;
      
      child.addTo(parent);
      
      expect(child._parent).toBe(parent);
    });

    it('should be included in the parents subviews', function () {
      var child = new Superview,
          parent = new Superview;
      
      child.addTo(parent);
      
      expect(parent.subviews()).toContain(child);
    });

    it('should emit an onAdded event with child, parent', function () {
      var child = new Superview,
          parent = new Superview;
      
      spyOn(child.onAdded(), 'emit');
      
      child.addTo(parent);
      
      expect(child.onAdded().emit).toHaveBeenCalledWith(child, parent);
    });
  })

  describe('when getting subviews', function () {

    it('returns an array that is a COPY of the internally managed array', function () {
      var parent = new Superview, child = new Superview
      parent.add(child)
      expect(parent.subviews()).not.toBe(parent._subviews);
      expect(parent.subviews()).not.toBe(parent.subviews());
    });

    it('returns an array containing all subviews', function () {
      var parent = new Superview, child = new Superview
      parent.add(child)
      expect(parent.subviews()).not.toBe(parent._subviews);
      expect(parent.subviews()).not.toBe(parent.subviews());
    })
  
    describe ('with recursive as true', function () {
      it('should return a subview array breadth-first order', function () {
        
        var p = new Superview, a = new Superview, b = new Superview, c = new Superview
        p.add(a, b)
        a.add(c)
        
        var svs = p.subviews(true)
        expect(svs[0]).toBe(a);
        expect(svs[1]).toBe(b);
        expect(svs[2]).toBe(c);        
      })
    })
  })

  describe('removing subviews', function () {
    
    var child, parent;
    
    beforeEach(function () {
      child = new Superview;
      parent = new Superview;
      
      parent.add(child);
    })
    
    it('should not remove the view from its parent its called with an empty array', function () {
      child.remove([]);
      expect(child.parent()).toBe(parent);
    })
    
    it('should not contain subviews removed with remove', function () {
      var v1 = new Superview;
      var v2 = new Superview;
      v1.add(v2);
      v1.remove(v2);
      expect(v1.subviews().contains(v2)).toBeFalsy();
    });

    it('should not contain any subviews after removeAll is called', function () {
      var v1 = new Superview;
      
      v1.add(new Superview).add(new Superview);
      v1.removeAll();
      expect(v1.subviews().isEmpty()).toBeTruthy();
    });
    
    it('should emit an onSubviewRemoved event with child,parent', function () {
      spyOn(parent.onSubviewRemoved(), 'emit');
      
      parent.remove(child);
      
      expect(parent.onSubviewRemoved().emit).toHaveBeenCalledWith(child, parent);
    });
    
    it('should trigger the onRemoved event on the child', function () {
      spyOn(child.onRemoved(), 'emit');
      
      parent.remove(child);
      
      expect(child.onRemoved().emit).toHaveBeenCalledWith(child, parent);
    });
    
    it('should set the subviews parent view to null', function () {
      parent.remove(child);
      expect(child._parent).toBeNull();
    });
    
    it('should call remove on the subview', function () {
      spyOn(child, 'remove');
      parent.remove(child);
      expect(child.remove).toHaveBeenCalled();
    })    
  });
  
  describe('removing a view', function() {
    
    var child, parent;
    
    beforeEach(function () {
      child = new Superview;
      parent = new Superview;
      parent.add(child);
    })
    
    it('should be recursive', function () {
      var child2 = new Superview, child3 = new Superview;
      parent.add(child2);
      child2.add(child3);

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
      expect(child._parent).toBeNull();
    });
    
    it('should not be included in the parents subviews()', function () {
      child.remove();
      expect(parent._subviews[child.vid()]).toBeUndefined();
    });
    
    it('should emit onRemoved with child,null if it is the root', function () {
      spyOn(parent.onRemoved(), 'emit');
      parent.remove();
      expect(parent.onRemoved().emit).toHaveBeenCalledWith(parent, null);
    });
    
    it('should deventify itself', function () {
      child.remove();
      
      ['onResized', 
      'onMoved', 
      'onSubviewAdded', 
      'onSubviewRemoved',
      'onAdded', 
      'onRemoved'].forEach(function (ev) {
        expect(child[ev]().listeners().length).toEqual(0);
      });
    });
  });

  describe('ancestors()', function () {
    var view, parent, parent2, root, anotherView;
    
    beforeEach(function () {
      view = new Superview()
      parent = new Superview()
      parent2 = new Superview()
      root = new Superview()
      anotherView = new Superview().addTo(parent);
      
      view.addTo(
        parent.addTo(
          parent2.addTo(
            root)));
    })
    
    it("should return a list of all ancestors including the parent in deepest first order", function() {
      var ancestors = view.ancestors();
      
      expect(ancestors.length).toEqual(3);
      expect(ancestors[0]).toBe(parent);
      expect(ancestors[1]).toBe(parent2);
      expect(ancestors[2]).toBe(root);
    });
  })
});

