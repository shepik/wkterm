// 
// This file is the part of wkterm, webkit-based terminal emulator
// (C) 2011 Ilya Shapovalov

// This program is free software; you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation; either version 2 of the License, or
// any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA.
//


//debug levels

var clog1 = nothing;
var clog2 = nothing;
var clog3 = nothing;
var clog4 = nothing;
/*
var clog1 = function(p) {console.log(p);};
var clog2 = function(p) {console.log(p);};
var clog3 = function(p) {console.log(p);};
var clog4 = function(p) {console.log(p);};
*/
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
	
	var cursorXprev = -1;
	var cursorYprev = -1;
	this.flushCursor = function() {
		if (this.cursorXprev>0 && this.cursorYprev>0) {
			var y = this.cursorY;
			this.setCursorY(this.cursorYprev);
			this.flush();
			this.setCursorY(y);
		}
		var str = line.join('');
		var res = str.substr(0,this.cursorX-1) + "<b>" + str[this.cursorX-1] + "</b>" + str.substr(this.cursorX);
		lineDiv.html(res+"&nbsp;");
	}
	function flush() {
	//	getLine().append('<span class="m'+last_forecolor+' m'+last_backcolor+'">'+buf+'</span>');
		//console.log(this.cursorX+"-"+this.cursorY+line.join(''));
		lineDiv.html(line.join('')+"&nbsp;");
		//if (b) lineDiv.css({'background-color':'red'});
	}
	function write(ch) {
		clog1(this.cursorY+","+this.cursorX + " - " + ch);
		line[this.cursorX-1] = ch;
		this.cursorX++;
		if (this.cursorX>80) {this.setCursorX(1); this.setCursorY(this.cursorY+1);}
//		if (this.cursorX>80) this.cursorX = 1;
		
	}
	
	function setLine(newline) {
		line = newline;
		lines[this.cursorY-1] = line;
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
		for (var i=0;i<30;i++) $('#main').append('<pre>&nbsp;</pre>');//temporary
		for (var i=0;i<this.windowH;i++) lines[i] = lineInitial.clone();
		appendLine();
		line = lines[0];
		this.cursorY = 0;
		this.setCursorY(1);
		//lineDiv.css('background-color','yellow');
	};
	this.line_removeFrom = function(p,cnt) {
		for (var i=p;i<=this.windowW;i++) line[i-1] = " ";
		flush();
	};
	this.line_removeTo = function(p) {
		for (var i=1;i<p;i++) line[i-1] = " ";
		flush();
	};
	this.line_clear = function() {
		setLine(lineInitial.clone());
		flush();
	};
	this.line_erase = function(p) {
		for (var i=0;i<p;i++) {
			line[this.cursorX-1] =  ' ';
			this.cursorX++;
		}
	}
	this.line_delete = function(p) {
		for (var i=this.cursorX-1+p;i<=this.windowW;i++) {
			line[i-p] = line[i];
		}
		for (var i=0;i<p;i++) {
			line[this.windowW-i] = ' ';
		}
	}
	/*this.line_backspace = function() {
		this.cursorX--;
		line[this.cursorX-1] = ' ';
	}*/
	this.lines_removeDown = function(cnt) {
		var cy = this.cursorY;
		for (var i=0;i<cnt;i++) {
			this.setCursorY(cy+i);
			this.line_clear();
		}
		this.setCursorY(cy);
		//todo:scroll
	}
	this.setColor = function(col) {
	};
	this.setCursorX = function(p) {
		this.cursorX = p;
	};
	this.insertDiv = function (data) {
		$('#main').append('<div></div>');
		$('#main > div:last').html(data);
	};
	function scrollUp() {
		line = lineInitial.clone();
		for (var i=0;i<lines.length;i++) lines[i] = lines[i+1];
		setLine(line);
	};
	function appendLine() {
		$('#main').append('<pre>&nbsp;</pre>');
		lineDiv = $('#main pre:last');
		//lineDiv.css('background-color','blue');
	};

	this.setCursorY = function(p) {
		if (p==this.cursorY) return;
		flush();
		this.cursorY = p;
		if (this.cursorY>this.windowH) {
			this.cursorY = this.windowH;
			scrollUp();
			clog3(this.cursorY);
			appendLine();
			flush();
		} else {
			var t = $('#main > pre');
			if (t.length<this.windowH) {
				lineDiv = $(t[this.cursorY-1]);
			} else {
				lineDiv = $(t[t.length - (this.windowH-this.cursorY)-1]);
				//if (this.cursorY==1) lineDiv.css('background-color','red');
			}
			line = lines[this.cursorY-1];
			if (!lineDiv.length) {
				clog3(this.cursorY);
				appendLine();
				flush();
			}
		}
	};
	this.writeTab = function() {
		var t = 1+8*Math.floor((this.cursorX-1+8)/8);
		for (var i=this.cursorX+1;i<=t;i++) line[i-1] = " ";
		this.cursorX = t;
		this.flush();
	};
	return this;
})();

