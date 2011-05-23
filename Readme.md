# wkterm

wkterm is a Webkit Terminal. It's built with webkit-gtk, so it runs in linux. But the host application is very simple, so it can rather easily be ported to Mac.

In difference with [TermKit](https://github.com/unconed/TermKit/) (which this project was inspired by), wkterm is real terminal emulator and it does aim to host 'vim', mc, top or emacs or anything else. 
Also, which is in fact the main purpose of the project, wkterm have graphical features (such as inline image viewing - see imgcat source). Graphical features are implemented by using custom escape sequences. There's another possibility also to recognize file format on the fly (that's, when we see jpeg bitmap header, we treat it as bitmap, when we see video, we show video player).

## Current todo:

1. Proper keyboard handling. I press any non-character key (like arrow-up, or F1, or Ctrl+C, or Esc), esc-sequence should be sent.
	http://sunsite.ualberta.ca/Documentation/Gnu/screen-3.9.4/html_chapter/screen_11.html#SEC60
	https://github.com/pnitsch/jsTerm
	http://anyterm.org/download/index.html

2. Cursor.
3. Paste. Copy already works 'cause it's handled by webkit.
4. ANSI Colors. I had them in the first version, but then rewrote all the code and decided that colors are to be implemented in the future
5. Window resize handling - pseudoterminal's (pty) attributes should be set according to window size, so js have to calculate size of the window in characters and send this info to C part.
6. Proper line mixing: there are image lines mixed with usual terminal text lines, and if we run a full-screen application like mc, what should happen? What should happen to images?
7. More escape sequences support. So that vi and mc would work.
	http://invisible-island.net/xterm/ctlseqs/ctlseqs.html#VT100%20Mode
	http://euc.jp/i18n/ctlseqs.txt
	http://www.mit.edu/afs/athena/system/x11r4/src/mit/clients/xterm/ctlseq2.txt
	http://sunsite.ualberta.ca/Documentation/Gnu/screen-3.9.4/html_chapter/screen_11.html


## Screenshots:

Downloading and viewing: (yes, i DO know i could just use img src="url")
[[http://clip2net.com/clip/m31984/1306183985-clip-45kb.png]]

Viewing image by ssh:
[[http://clip2net.com/clip/m31984/1306180711-clip-197kb.png]]

First version (with colors):
[[http://clip2net.com/clip/m31984/1306180711-clip-197kb.png]]

old version:
![old screenshot](http://clip2net.com/clip/m31984/1306026783-clip-70kb.png)
