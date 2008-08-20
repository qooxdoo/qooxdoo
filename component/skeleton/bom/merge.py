#!/usr/bin/env python
import os

for line in open("compile-bom.js"):
    split = line.split(";")
    header = ";".join(split[:4])
    break
    
qx = open("qx.js", "wc")
qx.write(header)

for line in open("compile-bom-0.js"):
    qx.write(line)
    
qx.close()

os.remove("compile-bom.js")
os.remove("compile-bom-0.js")
