# wkterm

wkterm is a Webkit Terminal. It's built with webkit-gtk, so it runs in linux. But the host application is very simple, so it can rather easily be ported to Mac.

In difference with [TermKit](https://github.com/unconed/TermKit/) (which this project was inspired by), wkterm should be real terminal emulator and it does aim to host 'vim'. 
Also, (which is the main purpose of the project, in fact) wkterm, like in TermKit, will have graphical features (such as inline image viewing. for example, cat image.jpg will show image in console. may be, graphical_ls will work like ls but with file icons. etc).
Graphical features will be implemented in one of two ways (or maybe both):

1. Custom escape sequences (so, cat file.jpg won't work)
2. File format recognition (that's, when we see jpeg bitmap header, we treat it as bitmap, when we see video, we show video player. but cat file.avi will work!)



## Current todo:
1. more esc sequences support (js)
	http://invisible-island.net/xterm/ctlseqs/ctlseqs.html#VT100%20Mode
	http://euc.jp/i18n/ctlseqs.txt
	http://www.mit.edu/afs/athena/system/x11r4/src/mit/clients/xterm/ctlseq2.txt
	http://sunsite.ualberta.ca/Documentation/Gnu/screen-3.9.4/html_chapter/screen_11.html
2. cursor. now there's no cursor at all (js)
3. input handling. backspace, alt, control, delete, keys etc (js or maybe c)
	http://sunsite.ualberta.ca/Documentation/Gnu/screen-3.9.4/html_chapter/screen_11.html#SEC60

## Screenshots:

current version:
![sorry, no cursor yet](http://clip2net.com/clip/m31984/1306180711-clip-197kb.png)

old version:
![old screenshot](http://clip2net.com/clip/m31984/1306026783-clip-70kb.png)
