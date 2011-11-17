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

var nothing = function(){};

Object.prototype.forEach = function(func) {
	for (var key in this) {
		func(this[key], key);
	}
	return this;
};
String.prototype.replaceAll = function (find,replaceWith) {
	return this.split(find).join(replaceWith);
};

Object.prototype.bind = function(func) {
	var self = this;
	return function() {
		return func.apply(self,arguments);
	};
};
String.prototype.replaceAt=function(index, char) {
	return this.substr(0, index) + char + this.substr(index+char.length);
};
String.prototype.esc = function() {
	return this.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
};

Object.prototype.clone = function() {
  var newObj = (this instanceof Array) ? [] : {};
  for (var i in this) {
    if (i == 'clone') continue;
    if (this[i] && typeof this[i] == "object") {
      newObj[i] = this[i].clone();
    } else newObj[i] = this[i]
  } return newObj;
};



function printStackTrace() {
	var callstack = [];
	var currentFunction = arguments.callee.caller;
	while (currentFunction) {
		var fn = currentFunction.toString();
		var fname = fn.substring(fn.indexOf("function") + 8, fn.indexOf("(")) || "anonymous";
		callstack.push(fname);
		currentFunction = currentFunction.caller;
	}
	console.info('stack trace', callstack.join("\n"));
};

function dump(arr,level_max,level) {
	var dumped_text = "";
	if(!level) level = 0;

	//The padding given at the beginning of the line.
	var level_padding = "";
	for(var j=0;j<level+1;j++) level_padding += "    ";
	
	if(typeof(arr) == 'object') { //Array/Hashes/Objects 
		if (level>=level_max) return level_padding+((""+arr).substr(0,30))+"\n";
		for(var item in arr) {
			var value = arr[item];
			
			if(typeof(value) == 'object') { //If it is an array,
				dumped_text += level_padding + "'" + item + "' ...\n";
				dumped_text += dump(value,level_max,level+1);
			} else {
				dumped_text += level_padding + "'" + item + "' => \"" + (""+value).substr(0,30) + "\"\n";
			}
		}
	} else { //Stings/Chars/Numbers etc.
		dumped_text = "===>"+arr+"<===("+typeof(arr)+")";
	}
	return dumped_text;
}
Object.prototype.dump = function(lev){return dump.apply(null,[this,lev]);};
