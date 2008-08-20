#!/usr/bin/env python

# this is a stub proxy for qooxdoo's generator.py

import sys, os, subprocess

CMD_PYTHON     = 'python'
REAL_GENERATOR = os.path.join(os.path.dirname(os.path.abspath(sys.argv[0])),
                              os.pardir, 'tool', 'bin', "generator.py")

argList = []
argList.append(CMD_PYTHON)
argList.append(REAL_GENERATOR)
argList.extend(sys.argv[1:])  # skip $0 (this script's name)

subprocess.call(" ".join(argList), shell=True)
