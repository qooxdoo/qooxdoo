#!/usr/bin/env python



def convertMac2Unix(content):
  return content.replace("\r", "\n")

def convertMac2Dos(content):
  return content.replace("\r", "\r\n")

def convertDos2Unix(content):
  return content.replace("\r", "\n")

def convertDos2Mac(content):
  return content.replace("\r\n", "\r")

def convertUnix2Dos(content):
  return content.replace("\n", "\r\n")

def convertUnix2Mac(content):
  return content.replace("\n", "\r")




def any2Unix(content):
  # DOS must be first, because it is a combination of Unix & Mac
  return convertMac2Unix(convertDos2Unix(content))

def any2Dos(content):
  # to protect old DOS breaks first, we need to convert to
  # a line ending with single character first e.g. Unix
  return convertUnix2Dos(any2Unix(content))

def any2Mac(content):
  # to protect old DOS breaks first, we need to convert to
  # a line ending with single character first e.g. Unix
  return convertUnix2Mac(any2Unix(content))



def getLineEndingName(content):
  if "\r\n" in content:
    return "dos"

  if "\r" in content:
    return "mac"

  # defaults to unix
  return "unix"

def getLineEndingSequence(content):
  if "\r\n" in content:
    return "\r\n"

  if "\r" in content:
    return "\r"

  # defaults to unix
  return "\n"



def tab2Space(content, spaces=2):
  return content.replace("\t", " " * spaces)

def spaces2Tab(content, spaces=2):
  return content.replace(" " * spaces, "\t")



def removeTrailingSpaces(content):
  ending = getLineEndingSequence(content)
  lines = content.split(ending)
  length = len(lines)
  pos = 0

  while pos < length:
    lines[pos] = lines[pos].rstrip()
    pos += 1

  return ending.join(lines)
