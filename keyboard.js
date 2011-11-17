// 
// This file WAS the part of Anyterm, but i stripped it off and changed for wkterm
// (C) 2005-2006 Philip Endecott
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


var keyboard = function() {

function process_key(k) {
	for (var i=0;i<k.length;i++) {
		sendToInput(k.charCodeAt(i));
	}
}

function esc_seq(s) {
  return String.fromCharCode(27)+"["+s;
}

function key_ev_stop(ev) {
  // We want this key event to do absolutely nothing else.
  ev.cancelBubble=true;
  if (ev.stopPropagation) ev.stopPropagation();
  if (ev.preventDefault)  ev.preventDefault();
  try { ev.keyCode=0; } catch(e){}
}

function key_ev_supress(ev) {
  // We want this keydown event to become a keypress event, but nothing else.
  ev.cancelBubble=true;
  if (ev.stopPropagation) ev.stopPropagation();
}


// When a key is pressed the browser delivers several events: typically first a keydown 
// event, then a keypress event, then a keyup event.  Ideally we'd just use the keypress 
// event, but there's a problem with that: the browser may not send a keypress event for
// unusual keys such as function keys, control keys, cursor keys and so on.  The exact
// behaviour varies between browsers and probably versions of browsers.
//
// So to get these keys we need to get the keydown events.  They have a couple of 
// problems.  Firstly, you get these events for things like pressing the shift key.  
// Secondly, unlike keypress events you don't get auto-repeat.

function keypress(ev) {
  if (!ev) var ev=window.event;
	console.log(dump(ev,1));

    if (ev.ctrlKey && !ev.altKey && !ev.shiftKey && (ev.keyCode==86 || ev.keyCode==118)) return false;

  // Only handle "safe" characters here.  Anything unusual is ignored; it would
  // have been handled earlier by the keydown function below.
  if ((ev.ctrlKey && !ev.altKey)  // Ctrl is pressed (but not altgr, which is reported
                                  // as ctrl+alt in at least some browsers).
      || (ev.which==0)        // there's no key in the event; maybe a shift key?
                              // (Mozilla sends which==0 && keyCode==0 when you press
                              // the 'windows logo' key.)
      || (ev.keyCode==8)      // backspace
      || (ev.keyCode==16)) {  // shift; Opera sends this.
    key_ev_stop(ev);
    return false;
  }

  var kc;
  if (ev.keyCode) kc=ev.keyCode;
  if (ev.which)   kc=ev.which;
  
  var k=String.fromCharCode(kc);

  // When a key is pressed with ALT, we send ESC followed by the key's normal
  // code.  But we don't want to do this when ALT-GR is pressed.
  if (ev.altKey && !ev.ctrlKey) {
    k = String.fromCharCode(27)+k;
  }


//     alert("keypress keyCode="+ev.keyCode+" which="+ev.which+" shiftKey="+ev.shiftKey+" ctrlKey="+ev.ctrlKey+" altKey="+ev.altKey);
	
  process_key(k);

  key_ev_stop(ev);
  return false;
}
function scrollterm(dir) {
}

function keydown(ev) {
  if (!ev) var ev=window.event;


//    alert("keydown keyCode="+ev.keyCode+" which="+ev.which+
//   	" shiftKey="+ev.shiftKey+" ctrlKey="+ev.ctrlKey+" altKey="+ev.altKey + " charCode="+ev.charCode);

  var k;

  var kc=ev.keyCode;

  // Handle special keys.  We do this here because IE doesn't send
  // keypress events for these (or at least some versions of IE don't for
  // at least many of them).  This is unfortunate as it means that the
  // cursor keys don't auto-repeat, even in browsers where that would be
  // possible.  That could be improved.

  // Interpret shift-pageup/down locally
  if      (ev.shiftKey && kc==33) { scrollterm(-1); key_ev_stop(ev); return false; }
  else if (ev.shiftKey && kc==34) { scrollterm(1);  key_ev_stop(ev); return false; }

  else if (kc==33) k=esc_seq("5~");  // PgUp
  else if (kc==34) k=esc_seq("6~");  // PgDn
  else if (kc==35) k=esc_seq("4~");  // End
  else if (kc==36) k=esc_seq("1~");  // Home
  else if (kc==37) k=esc_seq("D");   // Left
  else if (kc==38) k=esc_seq("A");   // Up
  else if (kc==39) k=esc_seq("C");   // Right
  else if (kc==40) k=esc_seq("B");   // Down
  else if (kc==45) k=esc_seq("2~");  // Ins
  else if (kc==46) k=esc_seq("3~");  // Del
  else if (kc==27) k=String.fromCharCode(27); // Escape
  else if (kc==9)  k=String.fromCharCode(9);  // Tab
  else if (kc==8)  k=String.fromCharCode(8);  // Backspace
  else if (kc==112) k=esc_seq(ev.shiftKey ? "25~" : "[A");  // F1
  else if (kc==113) k=esc_seq(ev.shiftKey ? "26~" : "[B");  // F2
  else if (kc==114) k=esc_seq(ev.shiftKey ? "28~" : "[C");  // F3
  else if (kc==115) k=esc_seq(ev.shiftKey ? "29~" : "[D");  // F4
  else if (kc==116) k=esc_seq(ev.shiftKey ? "31~" : "[E");  // F5
  else if (kc==117) k=esc_seq(ev.shiftKey ? "32~" : "17~"); // F6
  else if (kc==118) k=esc_seq(ev.shiftKey ? "33~" : "18~"); // F7
  else if (kc==119) k=esc_seq(ev.shiftKey ? "34~" : "19~"); // F8
  else if (kc==120) k=esc_seq("20~"); // F9
  else if (kc==121) k=esc_seq("21~"); // F10
  else if (kc==122) k=esc_seq("23~"); // F11
  else if (kc==123) k=esc_seq("24~"); // F12

  else {

    // For most keys we'll stop now and let the subsequent keypress event
    // process the key.  This has the advantage that auto-repeat will work.
    // But we'll carry on here for control keys.
    // Note that when altgr is pressed, the event reports ctrl and alt being
    // pressed because it doesn't have a separate field for altgr.  We'll
    // handle altgr in the keypress handler.
    if (!ev.ctrlKey                   // ctrl not pressed
        || (ev.ctrlKey && ev.altKey)  // altgr pressed
        || (ev.keyCode==17)) {        // I think that if you press shift-control,
                                      // you'll get an event with !ctrlKey && keyCode==17.
      key_ev_supress(ev);
      return;  // Note that we don't "return false" here, as we want the
               // keypress handler to be invoked.
    }
    if (ev.ctrlKey && !ev.altKey && !ev.shiftKey && (ev.keyCode==86 || ev.keyCode==118)) {
    	paste_from_clipboard();
//    	key_ev_supress(ev);
    	return;
    }

    // OK, so now we're handling a ctrl key combination.

    // There are some assumptions below about whether these symbols are shifted
    // or not; does this work with different keyboards?
    if (ev.shiftKey) {
      if (kc==50) k=String.fromCharCode(0);        // Ctrl-@
      else if (kc==54) k=String.fromCharCode(30);  // Ctrl-^, doesn't work
      else if (kc==94) k=String.fromCharCode(30);  // Ctrl-^, doesn't work
      else if (kc==109) k=String.fromCharCode(31); // Ctrl-_
      else {
	key_ev_supress(ev);
	return;
      }
    } else {
      if (kc>=65 && kc<=90) k=String.fromCharCode(kc-64); // Ctrl-A..Z
      else if (kc==219) k=String.fromCharCode(27); // Ctrl-[
      else if (kc==220) k=String.fromCharCode(28); // Ctrl-\   .
      else if (kc==221) k=String.fromCharCode(29); // Ctrl-]
      else if (kc==190) k=String.fromCharCode(30); // Since ctrl-^ doesn't work, map
                                                   // ctrl-. to its code.
      else if (kc==32)  k=String.fromCharCode(0);  // Ctrl-space sends 0, like ctrl-@.
      else {
	key_ev_supress(ev);
	return;
      }
    }
  }

//   alert("keydown keyCode="+ev.keyCode+" which="+ev.which+
// 	" shiftKey="+ev.shiftKey+" ctrlKey="+ev.ctrlKey+" altKey="+ev.altKey);

  process_key(k);

  key_ev_stop(ev);
  return false;
}

function get_ie_clipboard() {
  if (window.clipboardData) {
    return window.clipboardData.getData("Text");
  }
  return undefined;
}

function get_default_clipboard() {
  return prompt("Paste into this box and press OK:","");
}  

function paste_from_clipboard() {
	$('#paster').show().focus();
	setTimeout(function(){
		alert($('#paster').val());
		$('#paster').hide();
	},5);
	return;
	
	
  var p = get_ie_clipboard();
  if (p==undefined) {
    p = get_mozilla_clipboard();
  }
  if (p==undefined) {
    p = get_default_clipboard();
    if (p) {
      process_key(p);
    }
    return;
  }

  if (p=="") {
    alert("The clipboard seems to be empty");
    return;
  }

  if (confirm('Click OK to "type" the following into the terminal:\n'+p)) {
    process_key(p);
  }
}


function init() {
	document.onkeypress=keypress;
	//document.onkeydown=keydown;
}

function create_ctrlkey_menu() {
  var sel=document.createElement("SELECT");
  create_ctrlkey_menu_entry(sel,"Control keys...",-1);
  create_ctrlkey_menu_entry(sel,"Ctrl-@",0);
  for (var code=1; code<27; code++) {
    var letter=String.fromCharCode(64+code);
    create_ctrlkey_menu_entry(sel,"Ctrl-"+letter,code);
  }
  create_ctrlkey_menu_entry(sel,"Ctrl-[",27);
  create_ctrlkey_menu_entry(sel,"Ctrl-\\",28);
  create_ctrlkey_menu_entry(sel,"Ctrl-]",29);
  create_ctrlkey_menu_entry(sel,"Ctrl-^",30);
  create_ctrlkey_menu_entry(sel,"Ctrl-_",31);
  sel.onchange=function() {
    var code = sel.options[sel.selectedIndex].value;
    if (code>=0) {
      process_key(String.fromCharCode(code));
    }
  };
  return sel;
}

function create_ctrlkey_menu_entry(sel,name,code) {
  var opt=document.createElement("OPTION");
  opt.appendChild(document.createTextNode(name));
  var value_attr=document.createAttribute("VALUE");
  value_attr.value=code;
  opt.setAttributeNode(value_attr);
  sel.appendChild(opt);
}

init();
};

$('document').ready(function(){
	keyboard();
});