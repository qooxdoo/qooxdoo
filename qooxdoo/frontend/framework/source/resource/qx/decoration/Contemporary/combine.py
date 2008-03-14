#!/usr/bin/env python
# encoding: utf-8
"""
untitled.py

Created by Fabian Jakobs on 2008-03-13.
Copyright (c) 2008 __MyCompanyName__. All rights reserved.
"""

import sys
import os
import os.path
import subprocess


def get_file_info(filename):
    if not os.path.exists(filename):
        print "Error: Unable to find file '%'" % filename
        sys.exit(1)

    cmd = "identify %s" % filename    
    pipe = subprocess.Popen(cmd, shell=True, stdout=subprocess.PIPE).stdout
    lines = pipe.readlines()
    try:
        info = lines[0].split()
    except IndexError:
        print "Error running 'identify %s', read attributes are: " % filename, lines
        sys.exit(1)

    width, height = [int(x) for x in info[2].split("x")]
    return (width, height)
    
    
def split_grid(file, source, dest, top, right, bottom, left):
    
    source_file = os.path.join(source, file) + ".png"
    dest_file = os.path.join(dest, file)
    
    width, height = get_file_info(source_file)
    
    crop_cmd = "convert %s -crop %sx%s+%s+%s +repage %s"
    
    # split
    os.system(crop_cmd % (source_file, 4, 4, 0, 0, dest_file + "-tl.png"))
    os.system(crop_cmd % (source_file, 4, 4, 4, 0, dest_file + "-t.png"))
    os.system(crop_cmd % (source_file, 4, 4, width-4, 0, dest_file + "-tr.png"))

    os.system(crop_cmd % (source_file, 4, height-8, 0, 4, dest_file + "-l.png"))
    os.system(crop_cmd % (source_file, 40, height-8, 4, 4, dest_file + "-c.png"))
    os.system(crop_cmd % (source_file, 4, height-8, width-4, 4, dest_file + "-r.png"))

    os.system(crop_cmd % (source_file, 4, 4, 0, height-4, dest_file + "-bl.png"))
    os.system(crop_cmd % (source_file, 4, 4, 4, height-4, dest_file + "-b.png"))
    os.system(crop_cmd % (source_file, 4, 4, width-4, height-4, dest_file + "-br.png"))
        

def combine_images(files, combined, horizontal, config):

    montage_cmd = "montage -geometry +0+0 -gravity NorthWest -tile %s -background None %s %s"    
    
    if horizontal:
        orientation = "x1"
    else:
        orientation = "1x"
    
    # combine
    clips = []
    top = 0
    left = 0
    for file in files:
        clips.append(file)            
        width, height = get_file_info(file)

        config.append('"%s": ["%s", %s, %s, %s, %s]' % (file, combined, -left, -top, width, height))
            
        if horizontal:
            left += width
        else:
            top += height

    os.system(montage_cmd % (orientation, " ".join(clips), combined))
    
    width, height = get_file_info(combined)
    config.append('"%s": ["%s", 0, 0, %s, %s]' % (combined, combined, width, height))
        

def main():
    files = [
        "Button-Checked-Fokus",
        "Button-Checked",
        "Button-Default-Fokus",
        "Button-Default",
        "Button-Hover",
        "Button-Normal-Fokus",
        "Button-Normal",
        "Button-Pressed"        
    ]
    
    for file in files:
        split_grid(file, "source", "button", 4, 4, 4, 4)
    
    clips = []
    for file in files:
        for suffix in ["tl", "t" , "tr", "bl", "b", "br"]:
            clips.append("button/%s-%s.png" % (file, suffix))

    config = []
    combine_images(clips, "button/Button-Combined.png", False, config)
                   
    clips = []
    for file in files:
        for suffix in ["l", "r"]:
            clips.append("button/%s-%s.png" % (file, suffix))            

    combine_images(clips, "button/Button-Combined-Center.png", True, config)
    
    for file in files:
        path = "button/%s-c.png" % file
        width, height = get_file_info(path)
        config.append('"%s": ["%s", 0, 0, %s, %s]' % (path, path, width, height))

    print "        " + ",\n        ".join(config)
    
if __name__ == '__main__':
	main()

