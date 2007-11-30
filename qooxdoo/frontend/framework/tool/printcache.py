import cPickle
import sys

print cPickle.load(open(sys.argv[1], "rb"))
