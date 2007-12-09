def execute(console, sets, variants, settings):
    runtime = {
      "variant" : _translateVariantValuesToFeatureSet(variants),
      "setting" : _translateSettingValuesToFeatureSet(settings)
    }

    for fileName in sets:
        console.debug("Executing feature set: %s" % fileName)
        execfile(fileName, {}, runtime)

    # Convert to useable variants and settings
    variants = _translateVariantValuesFromFeatureSet(runtime["variant"])
    settings = _translateSettingValuesFromFeatureSet(runtime["setting"])
    
    return variants, settings
    
    
def _translateVariantValuesToFeatureSet(data):
    for key in data:
        if data[key] == "on":
            data[key] = True
        elif data[key] == "off":
            data[key] = False

    return data


def _translateVariantValuesFromFeatureSet(data):
    for key in data:
        if data[key] == True:
            data[key] = "on"
        elif data[key] == False:
            data[key] = "off"

    return data


def _translateSettingValuesToFeatureSet(data):
    for key in data:
        if data[key] == "true":
            data[key] = True
        elif data[key] == "false":
            data[key] = False

    return data


def _translateSettingValuesFromFeatureSet(data):
    for key in data:
        if data[key] == True:
            data[key] = "true"
        elif data[key] == False:
            data[key] = "false"

    return data    
    
    