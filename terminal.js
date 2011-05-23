Object.prototype.bind = function(func) {
	var self = this;
	return function() {
		return func.apply(self,arguments);
	};
};
String.prototype.replaceAt=function(index, char) {
	return this.substr(0, index) + char + this.substr(index+char.length);
}
Object.prototype.clone = function() {
  var newObj = (this instanceof Array) ? [] : {};
  for (i in this) {
    if (i == 'clone') continue;
    if (this[i] && typeof this[i] == "object") {
      newObj[i] = this[i].clone();
    } else newObj[i] = this[i]
  } return newObj;
};

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

var clog1 = nothing;
var clog2 = nothing;
var clog3 = nothing;
var clog4 = nothing;


var terminal = (function(){
	this.backcolor = '01';
	this.forecolor = '37';
	this.windowW = 80;
	this.windowH = 24;
	
	var last_forecolor = this.forecolor;
	var last_backcolor = this.backcolor;
	var lineInitial = [];
	var lines = [];
	var lineDiv = null;
	for (var i=0;i<this.windowW;i++) lineInitial.push(" ");
	var line = lineInitial.clone();
	
	function flush(b) {
	//	getLine().append('<span class="m'+last_forecolor+' m'+last_backcolor+'">'+buf+'</span>');
		//console.log(this.cursorX+"-"+this.cursorY+line.join(''));
		lineDiv.html(line.join('')+"&nbsp;");
		//if (b) lineDiv.css({'background-color':'red'});
	}
	function write(ch) {
		clog1(this.cursorY+","+this.cursorX + " - " + ch);
		line[this.cursorX-1] = ch;
		this.cursorX++;
//		if (this.cursorX>80) this.cursorX = 1;
		//if (this.cursorX>80) {this.cursorX = 1; this.addLine();}
	}
	
	this.flush = flush;
	this.write = write;
	
	this.cursorX = 1;
	this.cursorY = 1;
	
	this.clearAll = function() {
		var c = this.cursorY;
		for (var i=0;i<this.windowH;i++) {this.setCursorY(i+1); this.line_clear();}
		this.setCursorY(c);
	}
	this.init = function() {
		for (var i=0;i<30;i++) $('#main').append('<div>&nbsp;</div>');//temporary
		for (var i=0;i<this.windowH;i++) lines[i] = lineInitial.clone();
		appendLine();
		line = lines[0];
		this.setCursorY(1);
		//lineDiv.css('background-color','yellow');
	};
	this.line_removeFrom = function(p) {
		for (var i=p+1;i<=this.windowW;i++) line[i-1] = " ";
		flush();
	};
	this.line_removeTo = function(p) {
		for (var i=1;i<p;i++) line[i-1] = " ";
		flush();
	};
	this.line_clear = function() {
		line = lineInitial.clone();
		lines[this.cursorY-1] = line;
		flush();
	};
	this.setColor = function(col) {
	};
	this.setCursorX = function(p) {
		this.cursorX = p;
	}
	function scrollUp() {
		line = lineInitial.clone();
		for (var i=0;i<lines.length;i++) lines[i] = lines[i+1];
		lines[this.cursorY-1] = line;
	}
	function appendLine() {
		$('#main').append('<div>&nbsp;</div>');
		lineDiv = $('#main div:last');
		//lineDiv.css('background-color','blue');
	}

	this.setCursorY = function(p) {
		flush();
		this.cursorY = p;
		if (this.cursorY>this.windowH) {
			this.cursorY = this.windowH;
			scrollUp();
			clog3(this.cursorY);
			appendLine();
			flush();
		} else {
			var t = $('#main > div');
			if (t.length<this.windowH) {
				lineDiv = $(t[this.cursorY-1]);
				if (!lineDiv.length) {
					clog3(this.cursorY);
					appendLine();
					flush();
				}
			} else {
				lineDiv = $(t[t.length - (this.windowH-this.cursorY)-1]);
				//if (this.cursorY==1) lineDiv.css('background-color','red');
			}
			line = lines[this.cursorY-1];
		}
	}
	
	return this;
})();

var context = terminal;
