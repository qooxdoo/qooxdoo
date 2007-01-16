import os
import sys
import shutil

def copy_file(kde, fd, kde_path, fd_path):
	img_sizes = [16, 22, 32, 48, 64, 128]
	for size in img_sizes:
		kde_file = "%s/%sx%s/%s.png" % (kde_path, size, size, kde)
		fd_file = "%s/%sx%s/%s.png" % (fd_path, size, size, fd)
		fd_dir = os.path.dirname(fd_file)
		if os.path.exists(kde_file):
			if not os.path.exists(fd_dir):
				os.makedirs(fd_dir)
			print "%s -> %s" % (kde_file, fd_file)
			shutil.copyfile(kde_file, fd_file)

def main():
	kde_to_fd = {}
	kde_path = "kde/nuvola"
	fd_path = "fd/nuvola"
	dat = open("freedesktop_kde.dat")
	for line in dat.readlines():
		line = line.strip();
		if line == "" or line[0] == "#": continue
		if not line[0] in ["+", "*"]: continue
		line = line[1:]
		
		(fd, kde) = map(lambda x: x.strip(), line.split("="))
		kde_to_fd[kde] = fd
		copy_file(kde, fd, kde_path, fd_path)
		

if __name__ == "__main__":
    sys.exit(main())