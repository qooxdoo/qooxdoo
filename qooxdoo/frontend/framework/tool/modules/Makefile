################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2007 1&1 Internet AG, Germany, http://www.1und1.de
#
#  License:
#    LGPL: http://www.gnu.org/licenses/lgpl.html
#    EPL: http://www.eclipse.org/org/documents/epl-v10.php
#    See the LICENSE file in the project's top-level directory for details.
#
#  Authors:
#    * Thomas Herchenroeder (thron7)
#
################################################################################

MODULES=\
api.py \
basecalloptimizer.py \
checklocales.py \
cldr.py \
comment.py \
compiler.py \
config.py \
filetool.py \
graph.py \
loader.py \
mapper.py \
msgfmt.py \
obfuscator.py \
optparseext.py \
path.py \
privateoptimizer.py \
pythondoc.py \
resources.py \
settings.py \
stringoptimizer.py \
svninfo.py \
textile.py \
textutil.py \
tokenizer.py \
treegenerator.py \
tree.py \
treeutil.py \
variableoptimizer.py \
variantoptimizer.py \
variants.py \


test:
	echo $(MODULES)

all:
	@echo 
	@echo "****************************************************************************"
	@echo "  GENERATING FRAMEWORK"
	@echo "****************************************************************************"
	@echo ""
	@echo "  WARNING"
	@echo "----------------------------------------------------------------------------"
	@echo "  * Generating the framework itself, which used to create a qx.js file"
	@echo "    combining all framework classes, is no longer supported."
	@echo
	@echo '    Please use the powerful yet easy-to-use "skeletons" as a starting point'
	@echo "    for your custom application development."
	@echo
	@echo "    http://qooxdoo.org/documentation/user_manual/skeleton"

source: all
build: all
api: api_backup api_pydoc api_xml api_json

api_backup:
	# safe old files
	if [ -s apidata.xml ]; then mv apidata.xml apidata.xml.bak; fi
	if [ -s apidata.js  ]; then mv apidata.js  apidata.js.bak; fi

api_pydoc: 
	# invoke pythondoc
	echo '<?xml version="1.0"?><top>' > pydata.xml
	python pythondoc.py -x $(MODULES) >> pydata.xml
	echo '</top>' >> pydata.xml

api_xml: pydata.xml
	echo '<?xml version="1.0"?><doctree><packages>' > apidata.xml
	xsltproc pydoc2qx-xml.xsl pydata.xml >> apidata.xml
	echo '</packages></doctree>' >> apidata.xml

api_json: apidata.xml
	xsltproc qx-xml2qx-json.xsl apidata.xml > apidata.js

pretty: all
fix: all
clean: all
distclean: all
