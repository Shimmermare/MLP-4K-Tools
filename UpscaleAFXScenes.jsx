var projectFolder = new Folder(new File($.fileName).path);

$.evalFile(projectFolder.fullName + "/lib_ParseConfig.jsx");
var configFile = new File(projectFolder.fullName + "/Config.ini");
var config = parseConfig(configFile);

var upscaleFactor = parseInt(config.upscaleFactor, 10);

$.evalFile(projectFolder.fullName + "/lib_ParseSceneList.js");
var sceneListFile = new File(projectFolder.fullName + "/SceneList.txt");
sceneListFile.open("r");
var sceneList = parseSceneList(sceneListFile.read().split(/\r?\n/));
sceneListFile.close();

for (var i = 0; i < sceneList.afxScenes.length; i++)
{
    upscaleScene(sceneList.afxScenes[i]);
}

function upscaleScene(scene)
{
    var sceneAFXFolder = new Folder(projectFolder.fullName + "/scenes/" + scene + "/afx");
    var sceneAepFiles = sceneAFXFolder.getFiles("*.aep");
    
    var sceneAepFile;
    for (var i = 0; i < sceneAepFiles.length; i++)
    {
        var file = sceneAepFiles[i];
        if (file.name.indexOf(scene + ".aep") !== -1)
        {
            sceneAepFile = file;
            break;
        }
    }
    if (!sceneAepFile)
    {
        alert("Scene " + scene + " doesn't have scene .aep file!");
        return;
    }
    
    app.open(sceneAepFile);
    
    upscaleSceneItems();
    
    var upscaledFileName = sceneAepFile.name.substring(0, sceneAepFile.name.lastIndexOf(".")) + "_UPSCALED.aep";
    app.project.save(new File(sceneAepFile.path + "/" + upscaledFileName));
    app.project.close(CloseOptions.DO_NOT_SAVE_CHANGES);
}

function upscaleSceneItems()
{
    for (var i = 1; i <= app.project.numItems; i++)
    {
        var item = app.project.item(i);
        if (item instanceof CompItem) 
        {
            item.width = Math.floor(item.width * upscaleFactor);
            item.height = Math.floor(item.height * upscaleFactor);

            for (var j = 1; j <= item.numLayers; j++)
            {
                var layer = item.layer(j);
                if (!layer.hasVideo) continue;
                processLayerProperties(layer);
            }
        }
        else if (item instanceof FootageItem && item.mainSource instanceof SolidSource)
        {
            item.width = Math.floor(item.width * upscaleFactor);
            item.height = Math.floor(item.height * upscaleFactor);
        }
    }
}

function processLayerProperties(layer)
{
    //Default process funcs
    var mulByUpscaleFactor = function(v) { return v * upscaleFactor; }
    var mulByUpscaleFactorArr2 = function(v) 
    {
        v[0] *= upscaleFactor;
        v[1] *= upscaleFactor;
        return v;
    }
    var transformGroup = layer.property("ADBE Transform Group");
    //Don't change comp and solid layers scale because it'll be done automatically
    if (!(layer.source instanceof CompItem || (layer.source instanceof FootageItem && layer.source.mainSource instanceof SolidSource)))
    {
        processProperty(transformGroup.property("ADBE Scale"), mulByUpscaleFactorArr2); 
    }
    processProperty(transformGroup.property("ADBE Position"), mulByUpscaleFactorArr2);
    var effectsGroup = layer.property("ADBE Effect Parade");
    for (var i = 1; i <= effectsGroup.numProperties; i++)
    {
        var effect = effectsGroup.property(i);
        switch (effect.matchName)
        {
            case "ADBE Wave Warp":
                //Wave Height
                processProperty(effect.property("ADBE Wave Warp-0002"), mulByUpscaleFactor);
                //Wave Width
                processProperty(effect.property("ADBE Wave Warp-0003"), mulByUpscaleFactor);
                break;
            case "ADBE Slider Control":
                //Magic FX controls
                if (effect.name === "Inner Blur")
                {
                    processProperty(effect.property("ADBE Slider Control-0001"), mulByUpscaleFactor);
                }
                break;
            case "ADBE Motion Blur":
                //Blur Length
                processProperty(effect.property("ADBE Motion Blur-0002"), mulByUpscaleFactor);
                break;
            case "ADBE Fast Blur":
                //Bluriness
                processProperty(effect.property("ADBE Fast Blur-0001"), mulByUpscaleFactor);
                break;
            case "ADBE Radial Blur":
                //Amount
                processProperty(effect.property("ADBE Radial Blur-0001"), mulByUpscaleFactor);
                break;
			case "CC Radial Blur":
                //Amount
                processProperty(effect.property("CC Radial Blur-0002"), mulByUpscaleFactor);
                break;
            case "ADBE Glo2":
                //Glow Radius
                processProperty(effect.property("ADBE Glo2-0003"), mulByUpscaleFactor);
                break;
            case "ADBE Cell Pattern":
                //Size
                processProperty(effect.property("ADBE Cell Pattern-0006"), mulByUpscaleFactor);
                break;
            case "ADBE Cartoonify":
                //Detail Radius
                processProperty(effect.property("ADBE Cartoonify-0002"), mulByUpscaleFactor);
                //Edge->Width
                processProperty(effect.property("ADBE Cartoonify-0010"), mulByUpscaleFactor);
                break;
            case "ADBE Camera Lens Blur":
                //Blur Radius
                processProperty(effect.property("ADBE Camera Lens Blur-0001"), mulByUpscaleFactor);
                break;
            case "CC Vector Blur":
                //Amount
                //60
                processProperty(effect.property("CC Vector Blur-0002"), mulByUpscaleFactor);
                break;
            case "ADBE Bulge":
                //Horizontal Radius
                processProperty(effect.property("ADBE Bulge-0001"), mulByUpscaleFactor);
                //Vertical Radius
                processProperty(effect.property("ADBE Bulge-0002"), mulByUpscaleFactor);
                //Bulge Center is automatic
                break;
            case "ADBE Median":
                //Radius
                processProperty(effect.property("ADBE Median-0001"), mulByUpscaleFactor);
                break;
            case "ADBE Box Blur2":
                //Blur Radius
                processProperty(effect.property("ADBE Box Blur2-0001"), mulByUpscaleFactor);
                break;
			case "ADBE Turbulent Displace":
                //Size
                processProperty(effect.property("ADBE Turbulent Displace-0003"), mulByUpscaleFactor);
                break;
            //Known effects which do not need upscaling property-wise.
			case "ADBE Echo":
			case "ADBE Lightning 2": //Todo check and fix
			case "CC Light Burst 2.5": //Ray Length is independent from resolution?
			case "CC Light Rays": //Apparently Radius property doesn't need upscaling
			case "tc Sound Keys":
            case "ADBE 4ColorGradient": //Check it
            case "ADBE CHANNEL MIXER":
            case "ADBE Change To Color":
            case "ADBE Color Key":
            case "ADBE Corner Pin":
            case "ADBE Displacement Map":
            case "ADBE Easy Levels2":
            case "ADBE Find Edges":
            case "ADBE Fractal Noise": //Random, impossible to match 1:1
            case "ADBE Geometry2":
            case "ADBE HUE SATURATION":
            case "ADBE Noise":
            case "ADBE Posterize":
            case "ADBE Ramp":
            case "ADBE Simple Choker":
            case "ADBE Solid Composite":
            case "ADBE Threshold2":
            case "ADBE Tile":
            case "ADBE Tint":
            case "APC Colorama":
            case "CC Toner":
            case "Keylight 906":
            case "VIDEOCOPILOT OpticalFlares": //It looks like it is pixel-agnostic but I'm not sure.
                break;
            default:
                alertUnknownEffect(layer.containingComp.name, layer.name, effect);
        }
    }
    
    //Simple Choker's values are locked to -100/100 so we can't just multiply them.
    duplicateSimpleChokers(layer);
}

function alertUnknownEffect(compName, layerName, effect)
{
    if (confirm(
        "Composition: " + compName + 
        "\nLayer: " + layerName + 
        "\nUnknown effect: " + effect.name + " (" + effect.matchName + ")" +
        "\n\nPlease check if this effect needs to be upscaled (aka contains any pixel values such as 'radius', 'width', etc).\nClick 'OK' if you want to see the effect properties."
        ))
    {
        for (var j = 1; j <= effect.numProperties; j += 20)
        {
            var propLines = new Array();
            propLines.push("# Name | Match Name | Property Type | Value Type");
            for (var k = j; k < j + 20 && k <= effect.numProperties; k++)
            {
                var prop = effect.property(k);
                
                var propLine = "# " 
                + prop.name + " | " 
                + prop.matchName + " | " 
                + enumName(PropertyType, prop.propertyType);
                
                if (prop.propertyType == PropertyType.PROPERTY)
                {
                    propLine += " | " + enumName(PropertyValueType, prop.propertyValueType);
                } 
                
                propLines.push(propLine);
            }
            alert(propLines.join("\n"));
        }
    }
}

function enumName(enumType, value) 
{
  for (var k in enumType) if (enumType[k] == value) return k;
  return null;
}

function processProperty(property, processFunc)
{
    if (property.numKeys === 0) 
    {
        property.setValue(processFunc(property.value));
    } 
    else 
    {
        if (property.numKeys > 500)
        {
            //Get property's containing layer
            var layer = property;
            while (layer.parentProperty !== null) layer = layer.parentProperty;
            alert("Property " + property.name + " of layer " + layer.name + " contains " + property.numKeys + " keys.\nThis is a big amount which will take around " + Math.ceil(property.numKeys * 0.2 / 60) + " minutes to upscale.");
        }
        for (var i = 1; i <= property.numKeys; i++)
        {
            property.setValueAtKey(i, processFunc(property.keyValue(i)));
        }
    }
}

function duplicateSimpleChokers(layer)
{
    function duplicateFirstNonDuplicated()
    {
        var effects = layer.property("ADBE Effect Parade");
        for (var k = 1; k <= effects.numProperties; k++)
        {
            var property = effects.property(k);
            if (property.matchName === "ADBE Simple Choker")
            {
                //Need to more or less save order, so no collecting.
                if (property.name.indexOf("DUP_") === -1)
                {
                    var ogName = property.name;
                    property.name = ogName + " DUP_OG";
                    var dup = property.duplicate();
                    dup.name = ogName + " DUP_COPY";
                    return true;
                }
            }
        }
        return false;
    }

    while (duplicateFirstNonDuplicated()) {}
}