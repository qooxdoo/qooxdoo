#!/usr/bin/env python

import os, shutil, re
import config, textutil




def copy(options, sortedIncludeList, fileDb):
  print "  * Preparing configuration..."

  overrideList = []

  for overrideEntry in options.overrideResourceOutput:
    # Parse
    # fileId.resourceId:destinationDirectory
    targetSplit = overrideEntry.split(":")
    targetStart = targetSplit.pop(0)
    targetStartSplit = targetStart.split(".")

    # Store
    overrideData = {}
    overrideData["destinationDirectory"] = ":".join(targetSplit)
    overrideData["resourceId"] = targetStartSplit.pop()
    overrideData["fileId"] = ".".join(targetStartSplit)

    # Append
    overrideList.append(overrideData)




  if options.enableResourceFilter:
    print "  * Processing embeds..."
    
    embeds = {}
    
    for fileId in sortedIncludeList:
      fileEmbeds = fileDb[fileId]["embeds"]
      
      
      if len(fileEmbeds) > 0:
        print "    - Found %i embeds in %s" % (len(fileEmbeds), fileId)
        
        for fileEmbed in fileEmbeds:
          embedCategory = fileEmbed[0:fileEmbed.find("/")]
          embedElement = fileEmbed[fileEmbed.find("/")+1:]
            
          if not embeds.has_key(embedCategory):
            embeds[embedCategory] = []
            
          if not embedElement in embeds[embedCategory]:
            embeds[embedCategory].append(embedElement)
            


    print "  * Compiling embeds..."
        
    compiledEmbeds = {}
    
    for embedCategory in embeds:
      for embedElement in embeds[embedCategory]:
        if not compiledEmbeds.has_key(embedCategory):
          compiledEmbeds[embedCategory] = []
        
        compiledEmbeds[embedCategory].append(textutil.toRegExp(embedElement))
        



  print "  * Syncing files..."

  for fileId in sortedIncludeList:
    filePath = fileDb[fileId]["path"]
    fileResources = fileDb[fileId]["resources"]

    if len(fileResources) > 0:
      print "    - Found %i resources in %s" % (len(fileResources), fileId)

      for fileResource in fileResources:
        fileResourceSplit = fileResource.split(":")
        
        if len(fileResourceSplit) != 2:
          print "    - Malformed resource definition: %s" % fileResource
          sys.exit(1)

        resourceId = fileResourceSplit.pop(0)
        relativeDirectory = fileResourceSplit.pop(0)
          

           
        if options.enableResourceFilter:
          if embeds.has_key(resourceId):
            resourceFilter = compiledEmbeds[resourceId]
          else:
            resourceFilter = []
          
 
 
        
        # Preparing source directory
        
        sourceDirectory = os.path.join(fileDb[fileId]["resourceInput"], relativeDirectory)
        
        try:
          os.listdir(sourceDirectory)
        except OSError:
          print "        - Source directory isn't readable! Ignore resource!"
          continue
          
        
        # Preparing destination directory  
          
        destinationDirectory = os.path.join(fileDb[fileId]["resourceOutput"], relativeDirectory)

        # Searching for overrides
        for overrideData in overrideList:
          if overrideData["fileId"] == fileId and overrideData["resourceId"] == resourceId:
            destinationDirectory = overrideData["destinationDirectory"]





        print "      - Copying %s [%s]" % (relativeDirectory, resourceId)

        for root, dirs, files in os.walk(sourceDirectory):

          # Filter ignored directories
          for ignoredDir in config.DIRIGNORE:
            if ignoredDir in dirs:
              dirs.remove(ignoredDir)

          # Searching for items (resource files)
          for itemName in files:
            
            # Generate absolute source file path
            itemSourcePath = os.path.join(root, itemName)

            # Extract relative path and directory
            itemRelPath = itemSourcePath.replace(sourceDirectory + os.sep, "")
            itemRelDir = os.path.dirname(itemRelPath)

            # Filter items
            if options.enableResourceFilter:
              include = False
              
              for filterEntry in resourceFilter:
                if filterEntry.search(itemRelPath):
                  include = True
              
              if not include:
                continue

            # Generate destination directory and file path
            itemDestDir = os.path.join(destinationDirectory, itemRelDir)
            itemDestPath = os.path.join(itemDestDir, itemName)

            # Check/Create destination directory
            if not os.path.exists(itemDestDir):
              os.makedirs(itemDestDir)

            # Copy file
            if options.verbose:
              print "        - Copying file: %s" % itemRelPath

            shutil.copyfile(itemSourcePath, itemDestPath)