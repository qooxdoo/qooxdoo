package Qooxdoo::Services::qooxdoo::fs;

# qooxdoo - the new era of web development
#
# http://qooxdoo.org
#
# Copyright:
#   2006-2007 Nick Glencross
#
# License:
#   LGPL 2.1: http://www.gnu.org/licenses/lgpl.html
#   EPL: http://www.eclipse.org/org/documents/epl-v10.php
#   See the LICENSE file in the project's top-level directory for details.
#
# Authors:
#  * Nick Glencross

use strict;

use Qooxdoo::JSONRPC;

use constant FsError_InvalidPath      => 1;
use constant FsError_DirDoesNotExist  => 2;
use constant FsError_NotADirectory    => 3;
use constant FsError_PathUnreadable   => 4;

$Qooxdoo::Services::qooxdoo::fs::sandbox = '/tmp/sandbox';


# Retrieve the contents of a directory
#
# @param params
#   An array containing the parameters to this method
#     $params[0]
#       Array containing the components of the path from which directory
#       entries are to be read
#
#     $params[1]
#       Boolean indicating whether attribute details are desired.
#         true  : obtain and return details
#         false : no details needed
#
# @param error
#   An object of class JsonRpcError.
#
# @return
#   Failure: returns error object
#   Success:
#     An array of directory entries.  If details are requested, then each
#     directory entry is an object/hash, containing the following properties:
#
#     "name",    "error_flag",
#     "uid",     "gid",        "rdev",  "size",
#     "dev",     "ino",        "mode",  "nlink",
#     "atime",   "mtime",      "ctime",
#     "blksize", "blocks"
#
#      If details were not requested, then the array is simply the list
#      of file names found in the directory.


sub method_readDirEntries
{
    my $error  = shift;
    my @params = @_;
    
    my $path    = $params[0];
    my $details = $params[1];

    return $error unless valid_path ($error, $path);

    # Build full path to file
    $path = "${Qooxdoo::Services::qooxdoo::fs::sandbox}/" .
        join ("/", @{$path});

    if (!opendir (DIR, $path))
    {
        if (!-e $path)
        {
            $error->set_error (FsError_DirDoesNotExist,
                               "Directory does not exist");
        }
        elsif (!-d $path)
        {
            $error->set_error (FsError_NotADirectory,
                               "Path is not a directory");
        }
        else
        {
            $error->set_error (FsError_PathUnreadable,
                               "Path is unreadable");
        }
        
        return $error;
    }
    
    my @files = readdir DIR;
    closedir DIR;

    # Remove . and .. from the file list
    @files = grep { $_ ne '.' && $_ ne '..' } @files;
    
    # Just return the file list if details have not been requested
    return @files unless $details;
    
    # Use entry_hash to package the file details for each file
    return map { entry_hash ($_, lstat "$path/$_") } @files;
}


# Check that the path components are valid

sub valid_path
{
    my ($error, $path) = @_;

    if (ref $path eq 'ARRAY')
    {
        foreach (@{$path})
        {
            if ($_ eq '..')
            {
                $error->set_error (FsError_InvalidPath,
                                   "No path component can be '..'");
                return 0;
            }


            if (m|/\\|)
            {
                $error->set_error (FsError_InvalidPath,
                                   "No path component can comtain '/' or '\'");
                return 0;
            }
        }
    }
    else
    {
        $error->set_error (FsError_InvalidPath,
                           "Path is not valid");
        return 0;
    }

    return 1;

}

# Create the data structure returned for each filesystem object

sub entry_hash
{
    my $name = shift;

    if (@_)
    {
        return
        {
            Berror  => JSON::False,
            name    => $name,
            dev     => $_[0],
            ino     => $_[1],
            mode    => $_[2],
            nlink   => $_[3],
            uid     => $_[4],
            gid     => $_[5],
            rdev    => $_[6],
            size    => $_[7],
            atime   => $_[8],
            mtime   => $_[9],
            ctime   => $_[10],
            blksize => $_[11],
            blocks  => $_[12]
            };
    };

    return
    {
        Berror  => JSON::True,
        name    => $name
    };
}


1;
