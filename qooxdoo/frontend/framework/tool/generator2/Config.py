################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2008 1&1 Internet AG, Germany, http://www.1und1.de
#
#  License:
#    LGPL: http://www.gnu.org/licenses/lgpl.html
#    EPL: http://www.eclipse.org/org/documents/epl-v10.php
#    See the LICENSE file in the project's top-level directory for details.
#
#  Authors:
#    * Sebastian Werner (wpbasti)
#
################################################################################

class Config:
    def __init__(self, data):
        self._data = data
        
    
    def get(self, key, default=None):
        data = self._data
        splits = key.split("/")

        for item in splits:
            if data.has_key(item):
                data = data[item]
            else:
                return self._normalizeConfig(default)

        return self._normalizeConfig(data)
        

    def iter(self):
        result = []
        
        for item in self._data:
            result.append(Config(item))
        
        return result
        
        
    def split(self, key):
        return Config(self.get(key, {}))
        
    
    def _normalizeConfig(self, value):
        if hasattr(value, "lower"):
            if value.lower() in [ "1", "on", "true", "yes", "enabled" ]:
                return True

            if value.lower() in [ "0", "off", "false", "no", "disabled" ]:
                return False

        return value
        
