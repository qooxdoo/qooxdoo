#!/usr/bin/env python
################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2010 1&1 Internet AG, Germany, http://www.1und1.de
#
#  License:
#    LGPL: http://www.gnu.org/licenses/lgpl.html
#    EPL: http://www.eclipse.org/org/documents/epl-v10.php
#    See the LICENSE file in the project's top-level directory for details.
#
#  Authors:
#    * Sebastian Werner (wpbasti)
#    * Andreas Ecker (ecker)
#
################################################################################

##
# This is a currently unused module, as a first step in replacing bin/migrator.py
# It's mostly a copy of its code.
##

import re, os, sys, shutil, logging, optparse
from misc import ExtendAction
from misc import filetool
from misc import textutil
from misc.NameSpace import NameSpace
from ecmascript.frontend import tokenizer
from ecmascript.frontend import treegenerator
from ecmascript import compiler



LOGFILE = "migration.log"

MIGRATION_ORDER = [
    "0.5.2",
    "0.6",
    "0.6.1",
    "0.6.2",
    "0.6.3",
    "0.6.4",
    "0.6.5",
    "0.6.6",
    "0.6.7",    
    "0.7-beta1",
    "0.7-beta2",
    "0.7-beta3",
    "0.7",
    "0.7.1",
    "0.7.2"
]


LOGGING_READY = False

class Migrator(object):

    def __init__(self):
        pass


    def setupLogging(self, verbose=False):
        global LOGGING_READY
        if LOGGING_READY:
            return

        # define a Handler which writes INFO messages or higher to the sys.stdout
        console = logging.StreamHandler(sys.stdout)
        if verbose:
            console.setLevel(logging.NOTSET)
        else:
            console.setLevel(logging.INFO)
        # set a format which is simpler for console use
        formatter = logging.Formatter('%(message)s')
        console.setFormatter(formatter)
        logging.getLogger().addHandler(console)
        logging.getLogger().setLevel(logging.NOTSET)
        LOGGING_READY = True



    def entryCompiler(self, line):
        # protect escaped equal symbols
        line = line.replace("\=", "----EQUAL----")

        splitLine = line.split("=")

        if len(splitLine) < 2:
            logging.error("        - Malformed entry: %s" % line)
            return

        orig = "".join(splitLine[:-1]).strip()
        repl = splitLine[-1].strip()

        #print "%s :: %s" % (orig, value)

        # recover protected equal symbols
        orig = orig.replace("----EQUAL----", "=")
        repl = repl.replace("----EQUAL----", "=")

        return {"expr":re.compile(orig), "orig":orig, "repl":repl}



    def getHtmlList(self, migrationInput):
        """
        scans an array of directories for HTML files and returns the full
        file names of the found HTML files as array
        """
        htmlList = []

        for htmlDir in migrationInput:
            for root, dirs, files in os.walk(htmlDir):

                # Filter ignored directories
                for ignoredDir in [".svn","CVS"]:
                    if ignoredDir in dirs:
                        dirs.remove(ignoredDir)

                # Searching for files
                for fileName in files:
                    if os.path.splitext(fileName)[1] in [".js", ".html", ".htm",
                                                         ".php", ".asp", ".jsp"]:
                        htmlList.append(os.path.join(root, fileName))

        return htmlList



    def getPatchDirectory(self):
        """
        Returns the directory where the patches are located
        """
        basePath = os.path.dirname(os.path.abspath(sys.argv[0]))
        return os.path.join(basePath, "migration")



    def getNeededUpdates(self, baseVersion):
        """
        Returns an array of needed uptated to upgrade to the current version
        """
        return MIGRATION_ORDER[MIGRATION_ORDER.index(self.getNormalizedVersion(baseVersion))+1:]



    def getNormalizedVersion(self, version):
        if version in MIGRATION_ORDER:
            return version
        else:
            return version.split("-")[0].strip()



    def isValidVersion(self, version):
        return self.getNormalizedVersion(version) in MIGRATION_ORDER



    def getPatchModulePath(self, version):
        """
        Scans the patch directory for the existence of a patch.py file
        and returns the full filename.
        Returns None if no patch.py could be found.
        """
        versionPatchPath = os.path.join(self.getPatchDirectory(), version)
        for root, dirs, files in os.walk(versionPatchPath):

            # Filter ignored directories
            for ignoredDir in [".svn","CVS"]:
                if ignoredDir in dirs:
                    dirs.remove(ignoredDir)

            # Searching for files
            for fileName in files:
                filePath = os.path.join(root, fileName)

                if os.path.splitext(fileName)[1] != ".py":
                    continue

                if fileName == "patch.py":
                    return os.path.join(root, fileName)
        return None



    def readPatchInfoFiles(self, baseDir):
        """
        Reads all patch/info files from a directory and compiles the containing
        regular expressions.
        Retuns a list comiled RE (the output of entryCompiler)
        """
        patchList = []
        emptyLine = re.compile("^\s*$")

        for root, dirs, files in os.walk(baseDir):

            # Filter ignored directories
            for ignoredDir in [".svn", "CVS"]:
                if ignoredDir in dirs:
                    dirs.remove(ignoredDir)

            # Searching for files
            for fileName in files:
                filePath = os.path.join(root, fileName)

                fileContent = textutil.any2Unix(filetool.read(filePath, "utf-8"))
                patchList.append({"path":filePath, "content":fileContent.split("\n")})

                logging.debug("    - %s" % filePath)

        logging.debug("    - Compiling expressions...")

        compiledPatches = []

        for patchFile in patchList:
            logging.debug("      - %s" % os.path.basename(patchFile["path"]))
            for line in patchFile["content"]:
                if emptyLine.match(line) or line.startswith("#") or line.startswith("//"):
                    continue

                compiled = self.entryCompiler(line)
                if compiled != None:
                    compiledPatches.append(compiled)

        return compiledPatches



    def regtool(self, content, regs, patch, filePath):
        for patchEntry in regs:
            matches = patchEntry["expr"].findall(content)
            itercontent = content
            line = 1

            for fragment in matches:

                # Replacing
                if patch:
                    content = patchEntry["expr"].sub(patchEntry["repl"], content, 1)
                    # Debug
                    logging.debug("    - %s:%s Replacing pattern '%s' to '%s'" % (
                        filePath, line, patchEntry["orig"], patchEntry["repl"])
                    )
                else:
                    # Search for first match position
                    pos = itercontent.find(fragment)
                    pos = patchEntry["expr"].search(itercontent).start()

                    # Update current line
                    line += len((itercontent[:pos] + fragment).split("\n")) - 1

                    # Removing leading part til matching part
                    itercontent = itercontent[pos+len(fragment):]

                    # Debug
                    logging.debug("   - %s:%s: Matches %s in" % (filePath, line, patchEntry["orig"]))
                    logging.info("    - %s:%s: %s" % (filePath, line, patchEntry["repl"]))

        return content



    def migrateFile(self, filePath, compiledPatches, compiledInfos,
                    hasPatchModule=False, options=None, encoding="UTF-8"):

        logging.info("  - File: %s" % filePath)

        # Read in original content
        fileContent = filetool.read(filePath, encoding)

        fileId = loader.extractFileContentId(fileContent);

        # Apply patches
        patchedContent = fileContent

        if hasPatchModule and fileId is not None:

            import patch
            tree = treegenerator.createSyntaxTree(tokenizer.parseStream(fileContent))

            # If there were any changes, compile the result
            if patch.patch(fileId, tree):
                options.prettyPrint = True  # make sure it's set
                patchedContent = compiler.compile(tree, options)

        # apply RE patches
        patchedContent = self.regtool(patchedContent, compiledPatches, True, filePath)
        patchedContent = self.regtool(patchedContent, compiledInfos, False, filePath)

        # Write file
        if patchedContent != fileContent:
            logging.info("    - %s has been modified. Storing modifications ..." % filePath)
            filetool.save(filePath, patchedContent, encoding)


    def handle(self, fileDb, options, migrationTarget, migrationInput=None, verbose=False):
        fileList = [fileDb[x]["path"] for x in fileDb.keys()]
        encodings = [fileDb[x]["encoding"] for x in fileDb.keys()]
        self.migrate(fileList, options, migrationTarget, encodings, migrationInput, verbose)


    def migrate(self, fileList, options, migrationTarget,
               encodings, migrationInput=None, verbose=False):

        if migrationInput is None:
            migrationInput = []

        self.setupLogging(verbose)

        htmlList = self.getHtmlList(migrationInput)

        logging.debug("  * Number of script input files: %s" % len(fileList))
        logging.debug("  * Number of HTML input files: %s" % len(htmlList))
        logging.debug("  * Update to version: %s" % migrationTarget)


        logging.debug("  * Searching for patch module...")
        importedModule = False
        patchFile = self.getPatchModulePath(migrationTarget)
        if patchFile is not None:
            root = os.path.dirname(patchFile)
            if not root in sys.path:
                sys.path.insert(0, root)

            importedModule = True

        confPath = os.path.join(self.getPatchDirectory(), migrationTarget)

        logging.debug("  * Searching for info expression data...")
        compiledInfos = self.readPatchInfoFiles(os.path.join(confPath, "info"))
        logging.debug("    - Number of infos: %s" % len(compiledInfos))


        logging.debug("  * Searching for patch expression data...")
        compiledPatches = self.readPatchInfoFiles(os.path.join(confPath, "patches"))
        logging.debug("    - Number of patches: %s" % len(compiledPatches))



        logging.debug("")
        logging.debug("  FILE PROCESSING:")
        logging.debug("----------------------------------------------------------------------------")

        patchedFiles = {}

        if len(fileList) > 0:
            logging.info("  * Processing script files:")
            i = 0
            for filePath in fileList:
                self.migrateFile(filePath, compiledPatches, compiledInfos,
                            importedModule, options=options,
                            encoding=encodings[i])
                patchedFiles[os.path.abspath(filePath)] = True
                i += 1
            logging.info("  * Done")


        if len(htmlList) > 0:
            logging.info("  * Processing HTML files:")
            for filePath in htmlList:
                if not os.path.abspath(filePath) in patchedFiles:
                    self.migrateFile(filePath, compiledPatches, compiledInfos)
            logging.info("  * Done")



    def patchMakefile(self, makefilePath, newVersion, oldVersion):
        patchMakefileRe = re.compile("^(\s*QOOXDOO_VERSION\s*=\s*)%s" % oldVersion)
        patchProjectMk = re.compile("\bproject.mk\b")
        inFile = open(makefilePath)
        outFile = open(makefilePath + ".tmp", "w")
        for line in inFile:
            line = re.sub(patchMakefileRe, "\g<1>" + newVersion, line)
            line = line.replace(
                 "frontend/framework/tool/make/project.mk",
                 "frontend/framework/tool/make/application.mk"
             )
            outFile.write(line)
        outFile.close()
        inFile.close()
        shutil.move(makefilePath + ".tmp", makefilePath)



    def migrateSingleFile(self, fileName, options, neededUpdates):

        if not os.path.isfile(fileName):
            raise RuntimeError( """\nERROR: The file '%s' could not be found.\n""" % fileName)

        #turn off logging
        self.setupLogging()
        #logging.getLogger().setLevel(logging.NOTSET)
        logging.disable(logging.ERROR)


        #backup file
        shutil.copyfile(fileName, fileName + ".migration.bak")

        try:
            for version in neededUpdates:
                self.migrate([fileName], options, self.getNormalizedVersion(version), ["utf-8"])
        finally:
            # print migrated file
            for line in open(fileName):
                print line,
            #restore file
            shutil.copyfile(fileName + ".migration.bak", fileName)



    def main():

        options = NameSpace()  # extensible object
        options.from_version
        options.makefile
        options.migrateHtml
        options.file
        options.classPath
        options.verbose
        options.classEncoding
        if not self.isValidVersion(options.from_version):
            raise RuntimeError( "\nERROR: The version '%s' is not a valid version string!\n" % options.from_version)


        if MIGRATION_ORDER[-1] == self.getNormalizedVersion(options.from_version):
            print "\n Nothing to do. Your application is up to date!\n"
            sys.exit()

        # to migrate a single file extract the class path
        if options.classPath == [] and options.file:
            options.classPath = [os.path.dirname(os.path.abspath(options.file))]

        if options.classPath == []:
            print """
ERROR: The class path is empty. Please specify the class pass using the
       --class-path option
"""
            sys.exit(0)


        neededUpdates = self.getNeededUpdates(options.from_version)

        # check whether tree bases modifications will be used
        hasPatchModule = False
        for version in neededUpdates:
            if self.getPatchModulePath(version) is not None:
                hasPatchModule = True
                break

        # set options for the loader and migrator
        options.classUri = []
        options.resourceInput = []
        options.resourceOutput = []
        options.cacheDirectory = None
        options.disableInternalCheck = False
        options.prettyPrint = True

        # migrate a single file
        if options.file:
            self.migrateSingleFile(options.file, options, neededUpdates)
            sys.exit(0)

        # build file database
        fileDb = {}
        listIndex = 0
        for path in options.classPath:
            loader.indexClassPath(path, listIndex, options, fileDb)
            listIndex += 1


        print"""
MIGRATION SUMMARY:

Current qooxdoo version:   %s
Upgrade path:              %s

Affected Classes:
    %s""" % (options.from_version, " -> ".join(neededUpdates), "\n    ".join(fileDb.keys()))

        if hasPatchModule:
            print """
WARNING: The JavaScript files will be pretty printed. You can customize the
         pretty printer using the PRETTY_PRINT_OPTIONS variable in your
         Makefile. You can find a complete list of pretty printing options
         at http://qooxdoo.org/documentation/articles/code_style."""

        choice = raw_input("""
NOTE:    It is advised to do a 'make distclean' before migrating any files.
         If you choose 'yes', a subprocess will be invoked to run distclean,
         and after completion you will be prompted if you want to
         continue with the migration. If you choose 'no', the making distclean
         step will be skipped (which might result in potentially unnecessary
         files being migrated).

Do you want to run 'make distclean' now? [yes] : """)

        if choice.lower() in ["j", "ja", "y", "yes", ""]:
            os.system("make distclean")

        choice = raw_input("""

WARNING: The migration process will update the files in place. Please make
         sure, you have a backup of your project. The complete output of the
         migration process will be logged to '%s'.

Do you want to start the migration now? [no] : """ % LOGFILE)

        if not choice.lower() in ["j", "y", "yes"]:
            sys.exit()

        # start migration
        self.setupLogging(options.verbose)
        fileLogger = logging.FileHandler(LOGFILE, "w")
        formatter = logging.Formatter('%(message)s')
        fileLogger.setFormatter(formatter)
        fileLogger.setLevel(logging.NOTSET)
        logging.getLogger().addHandler(fileLogger)

        if options.migrateHtml:
            htmlFiles = "."
        else:
            htmlFiles = None

        for version in neededUpdates:
            logging.info("")
            logging.info("UPGRADE TO %s" % (version))
            logging.info("----------------------------------------------------------------------------")

            self.handle(fileDb, options, self.getNormalizedVersion(version), htmlFiles, verbose=options.verbose)


        # patch makefile
        if not options.makefile is None:
          self.patchMakefile(options.makefile, MIGRATION_ORDER[-1], options.from_version)

        print """\n\nThe complete output of the migration process has been logged to the file '%s'.\n\n""" % LOGFILE
