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
/*
*/
var terminal = (function(){
	this.backcolor = '01';
	this.forecolor = '37';
	this.windowW = 80;
	this.windowH = 24;
	this.charW = 9;
	this.charH = 14;
	
	var attr = 7;
	var lines = [];
	var lineAttrs = [];
	var lineDiv = null;
	var lineInitial;
	var lineAttrInitial;
	
	function makeLineInitial() {
		lineInitial = [];
		lineAttrInitial = [];
		for (var i=0;i<this.windowW;i++) lineInitial.push(" ");
		for (var i=0;i<this.windowW;i++) lineAttrInitial.push(7);
	}
	makeLineInitial();
	var line = lineInitial.clone();
	var lineAttr = lineAttrInitial.clone();
	
	//var cursorXprev = -1;
	//var cursorYprev = -1;
	this.flushCursor = function() {
		//if (this.cursorXprev>0 && this.cursorYprev>0) {
		//	var y = this.cursorY;
		//	this.setCursorY(this.cursorYprev);
		//	this.flush();
		//	this.setCursorY(y);
		//}
		//var str = line.join('');
		//var res = str.substr(0,this.cursorX-1) + "<b>" + str[this.cursorX-1] + "</b>" + str.substr(this.cursorX);
		//lineDiv.html(res+"&nbsp;");
//		console.log($('#main').height());
//		console.log(this.windowH);
//		console.log(this.cursorY);
		var l = ((this.cursorX-1)*this.charW);
		var h = lineDiv.offset().top + $('#main').scrollTop();
		//var h = ($('#main').height()-(1+this.windowH-this.cursorY)*this.charH);
		$('#cursor').css('left',l+"px").css('top',h+"px") ;
//		console.log((this.cursorX-1)*this.charW);
	}
	function getColorClass(attr) {
		var b = (attr&64)?'b':'';
		return b+'m3'+(attr&7)+' '+'m4'+((attr>>3)&7);
	}
	function flush() {
		//getLine().append('<span class="m'+last_forecolor+' m'+last_backcolor+'">'+buf+'</span>');
		//console.log(this.cursorX+"-"+this.cursorY+line.join(''));
		var a = lineAttr[0];
		var l = '<span class="'+getColorClass(a)+'">'+line[0];
		for (var i=1;i<line.length;i++) {
			if (lineAttr[i]==a) {
				l += (line[i]||' ').esc();
			} else {
				a = lineAttr[i];
				l += '</span><span class="'+getColorClass(a)+'">' + (line[i]||' ').esc();
			}
		}
		l += '</span>';
		//console.log(line.join(','));
		//console.log(lineAttr.join(','));
		lineDiv.html(l);
		//lineDiv.html(line.join('')+"&nbsp;");
		//if (b) lineDiv.css({'background-color':'red'});
	}
	function write(ch) {
		if (this.cursorX>this.windowW) {this.setCursorX(1); this.setCursorY(this.cursorY+1);}
		clog1(this.cursorY+","+this.cursorX + " - " + ch + "-" + attr);
		line[this.cursorX-1] = ch;
		lineAttr[this.cursorX-1] = attr;
		this.cursorX++;
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
		//for (var i=0;i<this.windowH;i++) $('#main').append('<pre>&nbsp;</pre>');//temporary
		for (var i=0;i<this.windowH;i++) lines[i] = lineInitial.clone();
		for (var i=0;i<this.windowH;i++) lineAttrs[i] = lineAttrInitial.clone();
		appendLine();
		line = lines[0];
		lineAttr = lineAttrs[0];
		this.cursorY = 0;
		this.setCursorY(1);
		//lineDiv.css('background-color','yellow');
	};
	this.setSize = function(w_px, h_px) {
		var w = Math.floor(w_px/this.charW);
		var h = Math.floor(h_px/this.charH);
		if (w>0 && h>0) {
			console.log(w+"x"+h);
			this.windowW = w;
			this.windowH = h;
			setTerminalSize(h,w);
			this.init();
		}
	}
	this.line_removeFrom = function(p,cnt) {
		for (var i=p;i<=this.windowW;i++) line[i-1] = " ";
		for (var i=p;i<=this.windowW;i++) lineAttr[i-1] = lineAttrInitial[0];
		flush();
	};
	this.line_removeTo = function(p) {
		for (var i=1;i<p;i++) line[i-1] = " ";
		for (var i=1;i<p;i++) lineAttr[i-1] = lineAttrInitial[0];
		flush();
	};
	this.line_clear = function() {
		line = lineInitial.clone();
		lineAttr = lineAttrInitial.clone();
		lines[this.cursorY-1] = line;
		lineAttrs[this.cursorY-1] = lineAttr;
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
			lineAttr[i-p] = lineAttr[i];
		}
		for (var i=0;i<p;i++) {
			line[this.windowW-i] = lineInitial[0];
			lineAttr[this.windowW-i] = lineAttrInitial[0];
		}
	}
	this.line_insert = function(p) {
		for (var i=this.windowW-p;i>=this.cursorX;i--) {
			line[i+p-1] = line[i-1];
			lineAttr[i+p-1] = lineAttr[i-1];
		}
		for (var i=0;i<p;i++) {
			line[this.cursorX+i] = lineInitial[0];
			lineAttr[this.cursorX+i] = lineAttrInitial[0];
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
		if (col == 0) {
			attr = 7;
		} else if (col==1) {
			attr = 7+64;
		} else if (col>=30 && col<=39) {
			if (col==39) col = 37;
			attr = (attr & (~7)) | (col-30);
		} else if (col>=40 && col<=49) {
			if (col==49) col = 40;
			attr = (attr & (~56)) | ((col-40)*8);
		}
	};
	this.setCursorX = function(p) {
		this.cursorX = p;
	};
	this.insertDiv = function (data) {
		//$('#main > pre:last').before('<div></div>');
		$('#main').append('<div></div>');
		$('#main > div:last').html(data);
		this.init();
		//appendLine();
		//	this.setCursorY(1);
	};
	function scrollUp() {
		line = lineInitial.clone();
		lineAttr = lineAttrInitial.clone();
		for (var i=0;i<lines.length;i++) {
			lines[i] = lines[i+1];
			lineAttrs[i] = lineAttrs[i+1];
		}
		lines[this.cursorY-1] = line;
		lineAttrs[this.cursorY-1] = lineAttr;
	};
	function appendLine() {
		$('#main').append('<pre>&nbsp;</pre>');
		lineDiv = $('#main > pre:last');
		//lineDiv.css('background-color','blue');
	};

	this.setCursorY = function(p) {
		if (p==this.cursorY) return;
		//console.log("cy "+p);
		flush();
		this.cursorY = p;
		if (this.cursorY>this.windowH) {
			this.cursorY = this.windowH;
			scrollUp();
			clog3(this.cursorY);
			appendLine();
			flush();
		} else {
			/*var t = $('#main')[0].childNodes;
			if (t.length<this.windowH) {
				lineDiv = $(t[this.cursorY-1]);
			} else {
				lineDiv = $(t[t.length - (this.windowH-this.cursorY)-1]);
			}*/
			var arr = $('#main')[0].childNodes;
			var cnt = this.windowH;
			var ind = arr.length-1;
			while (ind>=0 && cnt>0) {
				if (arr[ind].tagName!="PRE") {ind++; break;}
				cnt--;
				ind--;
			}
			if (cnt==0) {
				lineDiv = $(arr[ind + this.cursorY-1]);
			} else if (this.windowH - cnt >= this.cursorY-1) {
				lineDiv = $(arr[ind + this.cursorY-1]);
			} else {
				for (var i=this.windowH - cnt;i<this.cursorY-1;i++) {
					appendLine();
				}
			}

			line = lines[this.cursorY-1];
			lineAttr = lineAttrs[this.cursorY-1];
			/*if (!lineDiv.length) {
				clog3(this.cursorY);
				appendLine();
				flush();
			}*/
		}
	};
	this.writeTab = function() {
		var t = 1+8*Math.floor((this.cursorX-1+8)/8);
		for (var i=this.cursorX+1;i<=t;i++) {line[i-1] = " ";lineAttr[i-1] = attr;}
		this.cursorX = t;
		this.flush();
	};
	return this;
})();

