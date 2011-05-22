var context_old = {
	bind : function(func) {
		var self = this;
		return function() {
			return func.apply(self,arguments);
		};
	},
	cursorX: 0,
	cursorY: 0,
	line: '',
	backcolor: '01',
	forecolor: '37',
	setColor: function(col) {
	},
	title: 'main',
		
	dummy:null
};


var terminal = (function(){
	var last_forecolor = context.forecolor;
	var last_backcolor = context.backcolor;
	var buf = '';

	function write_finish() {
	//	getLine().append('<span class="m'+last_forecolor+' m'+last_backcolor+'">'+buf+'</span>');
		getLine().append('<span>'+buf+'</span>');
		buf = '';
	//	getLine().find('span:last').append(ch);
	}
	function addLine() {
		write_finish();
		$('#main').append('<div></div>');
	}
	function getLine() {
		return $('#main div:last');
	}
	
	function write(ch) {
		if (last_forecolor == context.forecolor && last_backcolor == context.backcolor) {
			buf+= ch;
		} else {
			write_finish();
			last_forecolor = context.forecolor;
			last_backcolor = context.backcolor;
			buf = ch;
		}
	}
	
	this.write_finish = write_finish;
	this.write = write;
	this.addLine = addLine;
	
	return this;
})();