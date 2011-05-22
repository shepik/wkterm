
/*this object:
bind (func) - binds func to this
cursorX
line
color

*/

//CSI: ESC [
//Ps: number
//Pm : multiple numbers
//Char: one letter character
//String: any printable chars sequence
//NP: non-printable character
Object.prototype.forEach = function(func) {
	for (var key in this) {
		func(this[key], key);
	}
	return this;
};
String.prototype.replaceAll = function (find,replaceWith) {
	return this.split(find).join(replaceWith);
};
var nothing = function(){};
var map = {
	'CSI Ps K' : function(p) { if (p==0) this.line = this.line.substring(this.cursorX); else if (p==1) this.line = this.line.substring(0,this.cursorX); else this.line = '';}, //Erase in Line (EL).
	'CSI Pm m' : function(attr) { arguments.forEach(this.bind(function(arg){ this.setColor(0);/*set color*/ })) }, //Character Attributes (SGR).
	'CSI Ps ; Ps H' : function(x,y) { this.cursorX = x?x*1:1; this.cursorY = y?y*1:1; }, //Cursor Position [row;column] (default = [1,1]) (CUP).
	'CSI Ps H' : function(x) { this.cursorX = x?x*1:1; this.cursorY = 1; }, //Cursor Position [row;column] (default = [1,1]) (CUP).
	'ESC ( Char': function(ch) { }, //Designate G0 Character Set (ISO 2022, VT100).
	'ESC ] Ps ; String NP': function(mode,str) { this.title = str; }, //set title or icon
	'ESC [ ? Pm h': function (num) {},	//DEC Private Mode Set (DECSET).
	'ESC =': nothing, //Application Keypad (DECPAM).
	'ESC [ ? Pm l': function (num) {},	//DEC Private Mode Reset (DECRST).
	'CSI > Ps c': nothing, //Send Device Attributes (Secondary DA) - I SHOULD RESPOND!
	'CSI Ps ; Ps r': nothing, //set scrolling region - todo
	'CSI Ps J':function(mode) {  },//Erase in Display (ED).
	'CSI Ps C':function(cnt) { this.cursorX += cnt?cnt:1; }, //Cursor Forward Ps Times (default = 1) (CUF).

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
	key = key.replaceAll('(','\\(');
	
	key = key.replaceAll('Ps','(NUM*)');
	key = key.replaceAll('Pm','(|(NUM+)(?:;(NUM+))*)');
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
mapCompiled.match = function(text,context) {
	for (var i=0;i<this.length;i++) {
		var m = this[i][0].exec(text);
		if (m) {
			var f = this[i][1];
			var args = [];
			for (var i=2;i<m.length;i++) args.push(m[i]);
			f.apply(context,args);
			//console.log(m[0]);
			//console.log(text.substring(m[0].length));
			return [true,text.substring(m[0].length)];
		}
	}
	var s = "";
	for (var i=1;(i<text.length)&&(i<10);i++) s+= text[i]+text.charCodeAt(i)+", ";
	console.log("fail: "+s);
	
	return [false,text.substring(1)];
};
//console.log(mapCompiled);
//console.log(mapCompiled.match(String.fromCharCode(27)+"[01;31masd",context));