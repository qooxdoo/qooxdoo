import os
import math
import filetool

# Write dependencies to a Graphviz compatible file (http://www.graphviz.org/)

def dotLine(fileDb, fileId, depEntry, largetFileSize):
  file = fileId.split(".")
  dep = depEntry.split(".")
  weight = 1

  for i in range(len(file)):
    if file[i] == dep[i]:
      weight += 1
    else:
      break

  size = os.path.getsize(fileDb[fileId]["path"])

  content = '  "%s" [color="%s %s 1.000"];\n' % (fileId, math.log(size)/math.log(largetFileSize), math.log(size)/math.log(largetFileSize))
  content += '  "%s" -> "%s" [weight=%s];\n' % (fileId, depEntry, weight)

  return content


def store(fileDb, sortedIncludeList, options):
  content = '''digraph "qooxdoo" {
node [style=filled];
'''

  largest = 0
  for fileId in sortedIncludeList:
      size = os.path.getsize(fileDb[fileId]["path"])
      if size > largest:
          largest = size

  for fileId in sortedIncludeList:
    if len(fileDb[fileId]["loadtimeDeps"]) > 0:
      for depEntry in fileDb[fileId]["loadtimeDeps"]:
        content += dotLine(fileDb, fileId, depEntry, largest)

    if len(fileDb[fileId]["afterDeps"]) > 0:
      for depEntry in fileDb[fileId]["afterDeps"]:
        content += dotLine(fileDb, fileId, depEntry, largest)

    if len(fileDb[fileId]["runtimeDeps"]) > 0:
      for depEntry in fileDb[fileId]["runtimeDeps"]:
        content += dotLine(fileDb, fileId, depEntry, largest)

    if len(fileDb[fileId]["loadDeps"]) > 0:
      for depEntry in fileDb[fileId]["loadDeps"]:
        content += dotLine(fileDb, fileId, depEntry, largest)

  content += '}'
  filetool.save(options.depDotFile, content)