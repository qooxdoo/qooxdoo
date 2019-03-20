create\_application.py - Technical Hints
========================================

-   **readme.txt**

    Each skeleton has a *readme.txt* file in its top-level folder. I can contain an arbitrary description. But there are also special keys that can appear at the beginning of a line, and are treated specially by the wizard:

    -   `short::` - contains a short description of the skeleton which is used in the online help of create\_application.py, when listing application types with `--help`.
    -   `default_script::` - the path (relative to the skeleton's root dir) under which the default script should be stored, the one saying "This application needs to be generated" (usually source/script/custom.js).
-   **Files from outside the skeleton structure**

    There are files that are not part of the skeleton itself, but copied from central places, as they are shared among the skeletons. These files are

    -   `generate.py` - copied from `tool/data/generator/generate.tmpl.py`
    -   `custom.js` - (path depends on skeleton, usually source/script/custom.js) copied from `tool/data/generator/needs_generation.js`

