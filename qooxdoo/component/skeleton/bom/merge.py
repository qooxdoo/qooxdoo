#!/usr/bin/env python
import os

loader = open("compile-bom.js").read()
header_end = loader.find("window.qxloader")
if header_end == -1:
    raise RuntimeError, "No qxloader found - aborting!"
header = loader[:header_end]

qx = open("qx-bom.js", "wc")
qx.write(header)

for line in open("compile-bom-0.js"):
    qx.write(line)
    
qx.close()

os.remove("compile-bom.js")
os.remove("compile-bom-0.js")
