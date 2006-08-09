#!/usr/bin/env python

import os

def save(filename, content="", encoding="utf-8"):
  # Normalize
  filename = normalize(filename)

  # Create directory
  makedir(filename)

  # Writing file
  outputFile = file(filename, "w")
  outputFile.write(content.encode(encoding))
  outputFile.flush()
  outputFile.close()


def directory(filename):
  # Normalize
  filename = normalize(filename)

  # Splitting
  directory = os.path.dirname(filename)

  # Check/Create directory
  if directory != "" and not os.path.exists(directory):
    os.makedirs(directory)


def normalize(filename):
  return os.path.normcase(os.path.normpath(filename))
