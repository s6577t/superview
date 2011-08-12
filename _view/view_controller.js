ViewController = function(){
	var self = {};
	self.$view = null;
	self.view = function() {
		return self.$view;
	};	
	
	return self;
}