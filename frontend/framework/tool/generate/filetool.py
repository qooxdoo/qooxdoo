#!/usr/bin/env python

import os

def save(filename, content="", encoding="utf-8"):
  # Normalize
  filename = normalize(filename)

  # Create directory
  directory(os.path.dirname(filename))

  # Writing file
  outputFile = file(filename, "w")
  outputFile.write(content.encode(encoding))
  outputFile.flush()
  outputFile.close()


def directory(dirname):
  # Normalize
  dirname = normalize(dirname)

  # Check/Create directory
  if dirname != "" and not os.path.exists(dirname):
    os.makedirs(dirname)


def normalize(filename):
  return os.path.normcase(os.path.normpath(filename))
