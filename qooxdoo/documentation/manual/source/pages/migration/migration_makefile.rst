.. _pages/migration_makefile#makefile_migration:

Makefile Migration
******************

===========================================  ====================================================================================
 Makefile variable                            Config key name / description                                                        
===========================================  ====================================================================================
 QOOXDOO_PATH                                 :ref:`let/QOOXDOO_PATH <pages/tool/generator_config_ref#let_top-level>`                                        
 APPLICATION_NAMESPACE                        :ref:`Manifest.json/provides/namespace <pages/tool/generator_config_articles#manifest_files>`                                  
 APPLICATION_CLASSNAME                        by overwriting the :ref:`include/{ns}.XXX <pages/tool/generator_config_ref#include>` key (default: “Application”)                           
 QOOXDOO_URI                                  :ref:`let/QOOXDOO_URI <pages/tool/generator_config_ref#let_top-level>`                                        
 APPLICATION_NAMESPACE_PATH                   N/A                                                                                  
 APPLICATION_ID                               N/A (default: application namespace)                                                 
 APPLICATION_TITLE                            N/A (default: application namespace)                                                 
 APPLICATION_MAKE_TITLE                       N/A (default: application namespace)                                                 
 APPLICATION_VERSION                          :ref:`Manifest.json/info/version <pages/tool/generator_config_articles#manifest_files>`                                  
 APPLICATION_DESCRIPTION                      :ref:`Manifest.json/info/description <pages/tool/generator_config_articles#manifest_files>`                                  
 APPLICATION_COPYRIGHT                        :ref:`Manifest.json/info/license <pages/tool/generator_config_articles#manifest_files>`                                  
 APPLICATION_WIDTH                            N/A (for AIR)                                                                        
 APPLICATION_HEIGHT                           N/A (for AIR)                                                                        
 APPLICATION_ICON_PATH                        N/A (icons will be searched in each library under .../source/resource/<namespace>)   
 APPLICATION_ICON                             N/A                                                                                  
 APPLICATION_FILES                            :ref:`copy-files/files <pages/tool/generator_config_ref#copy-files>`                                           
 APPLICATION_LOCALES                          :ref:`let/LOCALES <pages/tool/generator_config_ref#let_top-level>`                                        
 APPLICATION_HTML_TO_ROOT_URI                 :ref:`library/uri <pages/tool/generator_config_ref#library>` of individual library (see also dedicated :ref:`article <pages/tool/generator_config_articles#uri_handling>`
 APPLICATION_COMPLETE_BUILD                   by overwriting the :ref:`include <pages/tool/generator_config_ref#include>` key (default: false)                           
 APPLICATION_COMPLETE_SOURCE                  by using dedicated job ``source-all``                                                
 APPLICATION_COMPLETE_API                     by setting :ref:`let/API_INCLUDE <pages/tool/generator_config_ref#let_top-level>`
 APPLICATION_LINEBREAKS_BUILD                 :ref:`compile-options/code/format <pages/tool/generator_config_ref#compile-options>` (default: false)                                         
 APPLICATION_LINEBREAKS_SOURCE                N/A (default: true)                                                                  
 APPLICATION_OPTIMIZE_STRINGS                 :ref:`compile-options/code/optimize <pages/tool/generator_config_ref#compile-options>`
 APPLICATION_OPTIMIZE_VARIABLES               :ref:`compile-options/code/optimize <pages/tool/generator_config_ref#compile-options>`
 APPLICATION_OPTIMIZE_BASE_CALL               :ref:`compile-options/code/optimize <pages/tool/generator_config_ref#compile-options>`
 APPLICATION_OPTIMIZE_PRIVATE                 :ref:`compile-options/code/optimize <pages/tool/generator_config_ref#compile-options>`
 APPLICATION_OBFUSCATE_ACCESSORS              N/A
 APPLICATION_OPTIMIZE_BROWSER                 :ref:`variants/qx.client <pages/tool/generator_config_ref#variants>`
 APPLICATION_INDIVIDUAL_BROWSERS              :ref:`variants/qx.client <pages/tool/generator_config_ref#variants>`
 APPLICATION_OPTIMIZE_REMOVE_DEBUG            :ref:`settings/qx.debug <pages/tool/generator_config_ref#settings>` to "off"                                            
 APPLICATION_OPTIMIZE_REMOVE_COMPATIBILITY    N/A                                                                                  
 APPLICATION_OPTIMIZE_REMOVE_ASPECTS          N/A                                                                                  
 APPLICATION_ENABLE_GUI                       N/A, replaced by customized builds using :ref:`include <pages/tool/generator_config_ref#include>`
 APPLICATION_RESOURCE_FILTER                  N/A (always enabled, i.e. all source files need :ref:`#asset <pages/ui_resources#declaring_resources_in_the_code>` declarations)                        
 APPLICATION_INCLUDES                         :ref:`include <pages/tool/generator_config_ref#include>`                                              
 APPLICATION_THEME                            :ref:`let/QXTHEME <pages/tool/generator_config_ref#let_top-level>`                                        
 APPLICATION_THEME_COLOR                      N/A (all set in the theme class(es))                                                 
 APPLICATION_THEME_BORDER                     N/A (all set in the theme class(es))                                                 
 APPLICATION_THEME_FONT                       N/A (all set in the theme class(es))                                                 
 APPLICATION_THEME_ICON                       N/A (all set in the theme class(es))                                                 
 APPLICATION_THEME_WIDGET                     N/A (all set in the theme class(es))                                                 
 APPLICATION_THEME_APPEARANCE                 N/A (all set in the theme class(es)                                                  
 APPLICATION_SOURCE_LOG_LEVEL                 :ref:`log <pages/tool/generator_config_ref#log>`
 APPLICATION_BUILD_LOG_LEVEL                  :ref:`log <pages/tool/generator_config_ref#log>`                                                  
 APPLICATION_SOURCE_LOG_APPENDER              N/A                                                                                  
 APPLICATION_BUILD_LOG_APPENDER               N/A                                                                                  
 APPLICATION_TEMPLATE_INPUT                   N/A                                                                                  
 APPLICATION_TEMPLATE_OUTPUT                  N/A                                                                                  
 APPLICATION_TEMPLATE_REPLACE                 N/A                                                                                  
 APPLICATION_SOURCE_PATH                      split into various in :ref:`Manifest.json/provides <pages/tool/generator_config_articles#manifest_files>`, e.g. “class”, “resource”, “translation”             
 APPLICATION_BUILD_PATH                       :ref:`let/BUILD_PATH <pages/tool/generator_config_ref#let>`, :ref:`compile-options/paths/file <pages/tool/generator_config_ref#compile-options>`                                                  
 APPLICATION_API_PATH                         N/A (default: ./api)                                                                 
 APPLICATION_DEBUG_PATH                       N/A                                                                                  
 APPLICATION_PUBLISH_PATH                     N/A                                                                                  
 APPLICATION_TEST_PATH                        N/A (default: ./test)                                                                
 APPLICATION_TOOL_PATH                        N/A (default: ./tool)                                                                
 APPLICATION_BUILDTOOL_PATH                   N/A                                                                                  
 APPLICATION_SCRIPT_FOLDERNAME                :ref:`compile-options/paths/file <pages/tool/generator_config_ref#compile-options>`                                       
 APPLICATION_CLASS_FOLDERNAME                 :ref:`Manifest.json/provides/class <pages/tool/generator_config_articles#manifest_files>`                                  
 APPLICATION_TRANSLATION_FOLDERNAME           :ref:`Manifest.json/provides/translation <pages/tool/generator_config_articles#manifest_files>`                                  
 APPLICATION_SCRIPT_FILENAME                  :ref:`compile-options/paths/file <pages/tool/generator_config_ref#compile-options>`                                       
 LINT_ALLOWED_GLOBALS                         :ref:`compile-options/paths/file <pages/tool/generator_config_ref#compile-options>`                                           
 APPLICATION_PROFILE_SOURCE                   extend ``profiling`` job
 APPLICATION_PROFILE_BUILD                    extend ``profiling`` job
 APPLICATION_ADDITIONAL_CLASS_PATH            covered by adding :ref:`library/uri <pages/tool/generator_config_ref#library>` entries
 APPLICATION_ADDITIONAL_CLASS_URI             covered by adding :ref:`library/uri <pages/tool/generator_config_ref#library>` entries
 APPLICATION_ADDITIONAL_SOURCE_OPTIONS        N/A                                                                                  
 APPLICATION_ADDITIONAL_BUILD_OPTIONS         N/A                                                                                  
===========================================  ====================================================================================

