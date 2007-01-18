cat index_* | cut -d"/" -f2- | sort | uniq -c | grep "4 " | cut -d" " -f8 > data/qooxdoo_whitelist.dat
