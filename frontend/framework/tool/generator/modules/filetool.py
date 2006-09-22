#!/usr/bin/env python

import os, codecs, cPickle, sys

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


def read(filePath, encoding):
  try:
    return codecs.open(filePath, "r", encoding).read()

  except ValueError:
    print "    * Invalid Encoding. Required encoding %s in %s" % (encoding, filePath)
    sys.exit(1)


def storeCache(cachePath, data):
  try:
    cPickle.dump(data, open(cachePath, 'w'), 2)

  except EOFError or PickleError or PicklingError:
    print "    * Could not store cache to %s" % cachePath
    sys.exit(1)


def readCache(cachePath):
  try:
    return cPickle.load(open(cachePath))

  except EOFError or PickleError or UnpicklingError:
    print "    * Could not read cache from %s" % cachePath
    sys.exit(1)


def checkCache(filePath, cachePath):
  fileModTime = os.stat(filePath).st_mtime

  try:
    cacheModTime = os.stat(cachePath).st_mtime
  except OSError:
    cacheModTime = 0

  return fileModTime > cacheModTime
