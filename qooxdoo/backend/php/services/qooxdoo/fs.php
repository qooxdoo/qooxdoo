<?php
  /*
   * qooxdoo - the new era of web interface development
   *
   * Copyright:
   *   (C) 2006 by Derrell Lipman
   *       All rights reserved
   *
   * License:
   *   LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/
   *
   * Internet:
   *   * http://qooxdoo.org
   *
   * Author:
   *   * Derrell Lipman
   *     derrell dot lipman at unwireduniverse dot com
   */

  /*
   * This is a set of functions for manipulating the file system.
   */

define("FsError_InvalidPath",     1);
define("FsError_DirDoesNotExist", 2);
define("FsError_NotADirectory",   3);
define("FsError_PathUnreadable",  4);


// A place for the user to play
define("path_sandbox", "/var/www/playground/sandbox/");

/*
 * NOT YET USED...  This is for when we've added the ability to manipulate
 * directory entries, e.g. change permissions, delete, etc.  When that
 * facility exists, we'll need a way of restoring the sandbox to a pristine
 * state, and the dumptruck will do that for us.
 *
 * // A source to refill the sandbox once the user has messed it all up
 * define("path_dumptruck", "/var/www/playground/dumptruck/");
 */


class class_fs
{
    /**
     * Retrieve the contents of a directory
     *
     * @param params
     *   An array containing the parameters to this method
     *     $params[0]
     *       Array containing the components of the path from which directory
     *       entries are to be read
     *
     *     $params[1]
     *       Boolean indicating whether attribute details are desired.
     *         true  : obtain and return details
     *         false : no details needed
     *
     * @param error
     *   An object of class JsonRpcError.
     *
     * @return
     *   Failure: null
     *   Success:
     *     An array of directory entries.  If details are requested, then each
     *     directory entry is an object, containing the following properties:
     *
     *     "name",    "error_flag",
     *     "uid",     "gid",        "rdev",  "size",
     *     "dev",     "ino",        "mode",  "nlink",
     *     "atime",   "mtime",      "ctime",
     *     "blksize", "blocks"
     *
     *      If details were not requested, then the array is simply the list
     *      of file names found in the directory.
     */
    function method_readDirEntries($params, $error)
    {
        /* Obtain parameters */
        $pathComponents = $params[0];
        $bDetails = $params[1];

        /* Validate the path components */
        if (! $this->validPath($pathComponents, $error))
        {
            return $error;
        }

        /* Build a complete path from the component array */
        $path = path_sandbox . implode("/", $pathComponents);

        /* Get the names of the files in the directory */
        if (($files = @scandir($path)) === false)
        {
            /* Couldn't enumerate directory contents.  Find out why not. */
            if (! file_exists($path))
            {
                /* Directory doesn't exist */
                $error->SetError(
                    FsError_DirDoesNotExist,
                    "Directory does not exist.");
            }
            else if (! is_dir($path))
            {
                /* Path points to something which is not a directory */
                $error->SetError(
                    FsError_NotADirectory,
                    "Path is not a directory.");
            }
            else
            {
                /* Some other reason we can't read it */
                $error->SetError(
                    FsError_PathUnreadable,
                    "Path is unreadable.");
            }

            /* Give 'em the error */
            return $error;
        }

        /* Skip "."  */
        if ($files[0] == '.')
        {
            array_shift($files);
        }

        /* Skip ".." */
        if ($files[0] == "..")
        {
            array_shift($files);
        }

        /* Were details requested? */
        if (! $bDetails)
        {
            /* Nope.  Give 'em what they came for: just the file names. */
            return $files;
        }

        /* For each file... */
        foreach ($files AS $file)
        {
            /* Allocate a return object */
            $dirEntry = new DirEntry($file);

            /* Get the information about this file */
            if (($info = @lstat($path . "/" . $file)) !== false)
            {
                $dirEntry->SetInfo($info);
            }

            /* Insert the directory entry into the return array */
            $dirList[] = $dirEntry;
        }

        /* Give 'em what they came for: the detailed list. */
        return $dirList;
    }

    static function validPath($pathComponents, $error)
    {
        /*
         * Ensure the requested path is kosher.  No component of the path may
         * be ".." nor may any component contain a slash or backslash.
         */
        for ($i = 0; $i < count($pathComponents); $i++)
        {
            if ($pathComponents[$i] == "..")
            {
                $error->SetError(
                    FsError_InvalidPath,
                    "No component of the path may be '..'");
                return false;
            }

            if(ereg("^.*[/\\].*$", $pathComponents[$i]) !== false)
            {
                $error->SetError(
                    FsError_InvalidPath,
                    "No component of the path may contain '/' or '\'");
                return false;
            }
        }

        return true;
    }
}


class DirEntry
{
    var             $name;
    var             $bError;
    var             $dev;
    var             $ino;
    var             $mode;
    var             $nlink;
    var             $uid;
    var             $gid;
    var             $rdev;
    var             $size;
    var             $atime;
    var             $mtime;
    var             $ctime;
    var             $blksize;
    var             $blocks;

    function DirEntry($name)
    {
        $this->name = $name;
        $this->bError = true;
    }

    function SetInfo($info)
    {
        $this->bError = false;
        $this->dev = $info["dev"];
        $this->ino = $info["ino"];
        $this->mode = $info["mode"];
        $this->nlink = $info["nlink"];
        $this->uid = $info["uid"];
        $this->gid = $info["gid"];
        $this->rdev = $info["rdev"];
        $this->size = $info["size"];
        $this->atime = $info["atime"];
        $this->mtime = $info["mtime"];
        $this->ctime = $info["ctime"];
        $this->blksize = $info["blksize"];
        $this->blocks = $info["blocks"];
    }
}


?>
