<html>
<style type="text/css">
td {padding: 5px 0px 5px 0px; border-bottom: 1px solid gray}
</style>
</html>

.. _pages/migration_makefile#makefile_migration:

Makefile Migration
******************

===========================================  ====================================================================================
 Makefile variable                            Config key name / description                                                        
===========================================  ====================================================================================
 QOOXDOO_PATH                                 ''[[.:tool:generator_config_ref#let_top-level                                        
 APPLICATION_NAMESPACE                        ''[[.:tool:generator_config_articles#manifest_files                                  
 APPLICATION_CLASSNAME                        by overwriting the ''[[.:tool:generator_config_ref#include                           
 QOOXDOO_URI                                  ''[[.:tool:generator_config_ref#let_top-level                                        
 APPLICATION_NAMESPACE_PATH                   N/A                                                                                  
 APPLICATION_ID                               N/A (default: application namespace)                                                 
 APPLICATION_TITLE                            N/A (default: application namespace)                                                 
 APPLICATION_MAKE_TITLE                       N/A (default: application namespace)                                                 
 APPLICATION_VERSION                          ''[[.:tool:generator_config_articles#manifest_files                                  
 APPLICATION_DESCRIPTION                      ''[[.:tool:generator_config_articles#manifest_files                                  
 APPLICATION_COPYRIGHT                        ''[[.:tool:generator_config_articles#manifest_files                                  
 APPLICATION_WIDTH                            N/A (for AIR)                                                                        
 APPLICATION_HEIGHT                           N/A (for AIR)                                                                        
 APPLICATION_ICON_PATH                        N/A (icons will be searched in each library under .../source/resource/<namespace>)   
 APPLICATION_ICON                             N/A                                                                                  
 APPLICATION_FILES                            ''[[.:tool:generator_config_ref#copy-files                                           
 APPLICATION_LOCALES                          ''[[.:tool:generator_config_ref#let_top-level                                        
 APPLICATION_HTML_TO_ROOT_URI                 ''[[.:tool:generator_config_ref#library                                              
 APPLICATION_COMPLETE_BUILD                   by overwriting the ''[[.:tool:generator_config_ref#include                           
 APPLICATION_COMPLETE_SOURCE                  by using dedicated job ''source-all''                                                
 APPLICATION_COMPLETE_API                     by setting ''[[.:tool:generator_config_ref#let_top-level                             
 APPLICATION_LINEBREAKS_BUILD                 ''[[.:tool:generator_config_ref#compile-dist                                         
 APPLICATION_LINEBREAKS_SOURCE                N/A (default: true)                                                                  
 APPLICATION_OPTIMIZE_STRINGS                 ''[[.:tool:generator_config_ref#compile-dist                                         
 APPLICATION_OPTIMIZE_VARIABLES               ''[[.:tool:generator_config_ref#compile-dist                                         
 APPLICATION_OPTIMIZE_BASE_CALL               ''[[.:tool:generator_config_ref#compile-dist                                         
 APPLICATION_OPTIMIZE_PRIVATE                 ''[[.:tool:generator_config_ref#compile-dist                                         
 APPLICATION_OBFUSCATE_ACCESSORS              N/A                                                                                  
 APPLICATION_OPTIMIZE_BROWSER                 ''[[.:tool:generator_config_ref#variants                                             
 APPLICATION_INDIVIDUAL_BROWSERS              ''[[.:tool:generator_config_ref#variants                                             
 APPLICATION_OPTIMIZE_REMOVE_DEBUG             ''[[.:tool:generator_config_ref#settings                                            
 APPLICATION_OPTIMIZE_REMOVE_COMPATIBILITY    N/A                                                                                  
 APPLICATION_OPTIMIZE_REMOVE_ASPECTS          N/A                                                                                  
 APPLICATION_ENABLE_GUI                       N/A, replaced by customized builds using ''[[.:tool:generator_config_ref#include     
 APPLICATION_RESOURCE_FILTER                  N/A (always enabled, i.e. all source files need [[ui_resources                       
 APPLICATION_INCLUDES                         ''[[.:tool:generator_config_ref#include                                              
 APPLICATION_THEME                            ''[[.:tool:generator_config_ref#let_top-level                                        
 APPLICATION_THEME_COLOR                      N/A (all set in the theme class(es))                                                 
 APPLICATION_THEME_BORDER                     N/A (all set in the theme class(es))                                                 
 APPLICATION_THEME_FONT                       N/A (all set in the theme class(es))                                                 
 APPLICATION_THEME_ICON                       N/A (all set in the theme class(es))                                                 
 APPLICATION_THEME_WIDGET                     N/A (all set in the theme class(es))                                                 
 APPLICATION_THEME_APPEARANCE                 N/A (all set in the theme class(es)                                                  
 APPLICATION_SOURCE_LOG_LEVEL                 ''[[.:tool:generator_config_ref#log                                                  
 APPLICATION_BUILD_LOG_LEVEL                  ''[[.:tool:generator_config_ref#log                                                  
 APPLICATION_SOURCE_LOG_APPENDER              N/A                                                                                  
 APPLICATION_BUILD_LOG_APPENDER               N/A                                                                                  
 APPLICATION_TEMPLATE_INPUT                   N/A                                                                                  
 APPLICATION_TEMPLATE_OUTPUT                  N/A                                                                                  
 APPLICATION_TEMPLATE_REPLACE                 N/A                                                                                  
 APPLICATION_SOURCE_PATH                      split into various in ''[[.:tool:generator_config_articles#manifest_files            
 APPLICATION_BUILD_PATH                       ''[[.:tool:generator_config_ref#let                                                  
 APPLICATION_API_PATH                         N/A (default: ./api)                                                                 
 APPLICATION_DEBUG_PATH                       N/A                                                                                  
 APPLICATION_PUBLISH_PATH                     N/A                                                                                  
 APPLICATION_TEST_PATH                        N/A (default: ./test)                                                                
 APPLICATION_TOOL_PATH                        N/A (default: ./tool)                                                                
 APPLICATION_BUILDTOOL_PATH                   N/A                                                                                  
 APPLICATION_SCRIPT_FOLDERNAME                ''[[.:tool:generator_config_ref#compile-source                                       
 APPLICATION_CLASS_FOLDERNAME                 ''[[.:tool:generator_config_articles#manifest_files                                  
 APPLICATION_TRANSLATION_FOLDERNAME           ''[[.:tool:generator_config_articles#manifest_files                                  
 APPLICATION_SCRIPT_FILENAME                  ''[[.:tool:generator_config_ref#compile-source                                       
 LINT_ALLOWED_GLOBALS                         ''[[.:tool:generator_config_ref#lint-check                                           
 APPLICATION_PROFILE_SOURCE                   extend ''profiling'' job                                                             
 APPLICATION_PROFILE_BUILD                    extend ''profiling'' job                                                             
 APPLICATION_ADDITIONAL_CLASS_PATH            covered by adding ''[[.:tool:generator_config_ref#library                            
 APPLICATION_ADDITIONAL_CLASS_URI             covered by adding ''[[.:tool:generator_config_ref#library                            
 APPLICATION_ADDITIONAL_SOURCE_OPTIONS        N/A                                                                                  
 APPLICATION_ADDITIONAL_BUILD_OPTIONS         N/A                                                                                  
===========================================  ====================================================================================

