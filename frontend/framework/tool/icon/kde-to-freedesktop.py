#!/usr/bin/env python

import os
import sys
import shutil
import optparse



def copy_file(kde, fd, options):
  img_sizes = [16, 22, 32, 48, 64, 128]

  for size in img_sizes:
    print ">>> %s" % size

    kde_file = "%s/%sx%s/%s.png" % (options.input, size, size, kde)
    fd_file = "%s/%sx%s/%s.png" % (options.output, size, size, fd)

    if os.path.exists(kde_file):
      fd_dir = os.path.dirname(fd_file)

      if not os.path.exists(fd_dir):
        os.makedirs(fd_dir)

      if options.verbose:
        print "  - Copy %s -> %s" % (kde_file, fd_file)

      shutil.copyfile(kde_file, fd_file)



def main():
  parser = optparse.OptionParser("usage: %prog [options]")
  parser.add_option("-q", "--quiet", action="store_false", dest="verbose", default=False, help="Quiet output mode.")
  parser.add_option("-v", "--verbose", action="store_true", dest="verbose", help="Verbose output mode.")
  parser.add_option("--input", "-i", action="store", dest="input", metavar="DIRECTORY", help="Input directory")
  parser.add_option("--output", "-o", action="store", dest="output", metavar="DIRECTORY", help="Output directory")

  (options, args) = parser.parse_args(sys.argv[1:])

  if options.input == None or options.output == None:
    basename = os.path.basename(sys.argv[0])
    print "You must define at least one script input directory!"
    print "usage: %s [options]" % basename
    print "Try '%s -h' or '%s --help' to show the help message." % (basename, basename)
    sys.exit(1)

  dat = open("data/freedesktop_kde.dat")

  for line in dat.readlines():
    line = line.strip();

    if line == "" or line[0] == "#":
      continue

    if not line[0] in ["+", "*"]:
      continue

    line = line[1:]

    (fd, kde) = map(lambda x: x.strip(), line.split("="))
    copy_file(kde, fd, options)



if __name__ == "__main__":
    sys.exit(main())
