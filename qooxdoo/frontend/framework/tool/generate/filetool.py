#!/usr/bin/env python

import os

def save(filename, content="", encoding="utf-8"):
  # Splitting
  directory = os.path.dirname(filename)

  # Check/Create directory
  if directory != "" and not os.path.exists(directory):
    os.makedirs(directory)

  # Writing file
  outputFile = file(filename, "w")
  outputFile.write(content.encode(encoding))
  outputFile.flush()
  outputFile.close()
