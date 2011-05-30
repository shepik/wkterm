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

//CSI: ESC [
//Ps: number
//Pm : multiple numbers
//Char: one letter character
//String: any printable chars sequence
//NP: non-printable character
var map = {
	'CSI Ps K' : function(p) { if (p==0 || typeof(p)=='undefined') this.line_removeFrom(this.cursorX); else if (p==1) this.line_removeTo(this.cursorX); else this.line_clear();}, //Erase in Line (EL).
	'CSI m' : function(attr) { this.setColor(0); }, //Character Attributes (SGR).
	'CSI Pm m' : function(attr) { if (typeof('attr')=='undefined') this.setColor(0); for (var i=0;i<arguments.length;i++) this.setColor(arguments[i]);/*set color*/  }, //Character Attributes (SGR).
	'CSI Ps ; Ps H' : function(y,x,z) { clog1(y+"," + x + " => pos");this.setCursorY(y?y*1:1); this.setCursorX(x?x*1:1); }, //Cursor Position [row;column] (default = [1,1]) (CUP).
	'CSI Ps H' : function(y) { this.setCursorX(1); this.setCursorY(y?y*1:1); }, //Cursor Position [row;column] (default = [1,1]) (CUP).
	'ESC ( Char': function(ch) { }, //Designate G0 Character Set (ISO 2022, VT100).
	'ESC ] Ps ; String NP': function(mode,str) { this.title = str; }, //set title or icon

//cursor
	'ESC [ ? Pm h': nothing,	//DEC Private Mode Set (DECSET)
	'ESC [ ? Pm l': nothing,	//DEC Private Mode Reset (DECRST)
	'ESC [ ? Pm r': nothing,	//Restore DEC Private Mode Values
	
	'ESC =': nothing, //Application Keypad (DECPAM). called when opening vim
	'ESC >': nothing, //Normal Keypad. called when closing vim
	'CSI > Ps c': nothing, //Send Device Attributes (Secondary DA) - I SHOULD RESPOND!

	'CSI Ps ; Ps r': function(top,bottom) { this.setCursorX(1); this.setCursorY(1); }, //set scrolling region - DECSTBM - TODO: You cannot perform scrolling outside the margins.
	'CSI Ps J':function(opt) { if (opt!=2) clog2("Ps J "+opt); this.clearAll();   },//Erase in Display (ED).
	'CSI Ps C':function(cnt) { this.setCursorX(this.cursorX + (cnt?cnt*1:1)); }, //Cursor Forward Ps Times (default = 1) (CUF).
	'CSI Ps d':function(p) { clog2(p); this.setCursorY(p?p*1:1);},	//Line Position Absolute [row] (default = [1,column]) (VPA).
	'CSI Ps l':nothing,//Reset Mode (RM).
	'CSI Ps G':function(p) { this.setCursorX(p?p*1:1);}, //Cursor Character Absolute [column] (default = [row,1]) (CHA).
	'CSI Ps M': function(p) { this.lines_removeDown(p?p*1:1);}, //Delete Ps Line(s) (default = 1) (DL).
	'CSI Ps X' : function(p) { this.line_erase(p?p*1:1); },  //todo //Erase Ps Character(s) (default = 1) (ECH).
	'CSI Ps P': function(p) { this.line_delete(p?p*1:1); }, //Delete Ps Character(s) (default = 1) (DCH).
		
	'ESC 7': function() { this.oldX = this.cursorX; this.oldY = this.cursorY; }, //Save Cursor (DECSC).
	'ESC 8': function() { this.setCursorX(this.oldX); this.setCursorY(this.oldY); }, //Restore Cursor (DECRC).
		
	'ESC ! Ps ! ': function(len) {
		len = len*1;
		return function(text,pos){
			console.log("waiting for "+(pos+len)+", now "+text.length);
			if (text.length<pos+len) return false;
			this.insertDiv(text.substr(pos,len));
			return [true, text.substring(pos+len)];
		};
	},
/* todo:
ESC c
Full Reset (RIS).
*/

	dummy:null
};

var mapCompiled = [];
map.forEach(function(func, k) {
	if (k=='dummy') return;
	var key = k;
//	console.log(key);
	key = key.replaceAll('CSI','ESC [');
	key = key.replaceAll('[','\\[');
	key = key.replaceAll('?','\\?');
	key = key.replaceAll('!','\\!');
	key = key.replaceAll('(','\\(');
	
	key = key.replaceAll('Ps','(NUM*)');
	key = key.replaceAll('Pm','(?:|(NUM+)(?:;(NUM+))*)');
	key = key.replaceAll('Char','([a-zA-Z])');
//	key = key.replaceAll('String','([[:print:]]*)');
//	key = key.replaceAll('NP','[^[:print:]]');
	key = key.replaceAll('String','([^ESC Bell]*)');
	key = key.replaceAll('NP','[ESC Bell]');
	key = key.replaceAll('ESC',String.fromCharCode(27));
	key = key.replaceAll('Bell',String.fromCharCode(7));

	key = key.replaceAll(" ","");
	key = key.replaceAll('NUM','\\d');
	key = "^"+key;
	mapCompiled.push([new RegExp(key), func]);
});

mapCompiled.match = function(text,terminal) {
	for (var i=0;i<this.length;i++) {
		var m = this[i][0].exec(text);
		if (m) {
			var f = this[i][1];
			var args = [];
			for (var i=1;i<m.length;i++) args.push(m[i]);
			var ret = f.apply(terminal,args);
			clog2(m[0]);
			if (ret) {
				return ret.apply(terminal,[text,m[0].length]);
			} else {
				return [true,text.substring(m[0].length)];
			}
		}
	}
	var s = "";
	for (var i=1;(i<text.length)&&(i<10);i++) s+= text[i]+text.charCodeAt(i)+", ";
	console.log("fail: "+s);
	
	return [false,text.substring(1)];
};
//console.log(mapCompiled);
//console.log(mapCompiled.match(String.fromCharCode(27)+"[01;31masd",terminal));