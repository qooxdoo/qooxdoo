#/bin/sh

montage -geometry +0+0 -gravity NorthWest -tile 1x -background None button-tl.png button-tr.png button-br.png button-bl.png button-t.png button-t.png button-combined.png
montage -geometry +0+0 -gravity NorthWest -tile x1 -background None button-l.png button-c.png button-r.png button-center-combined.png