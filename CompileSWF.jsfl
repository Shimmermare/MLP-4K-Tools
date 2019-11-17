var projectFolder = fl.scriptURI.substr(0, fl.scriptURI.lastIndexOf("/"));

eval(FLfile.read(projectFolder + "/lib_ParseSceneList.js"));
var sceneList = parseSceneList(FLfile.read(projectFolder + "/SceneList.txt").split(/\r?\n/));

if (sceneList.swfScenes.length === 0)
{
    alert("No scenes to compile found!");
}
else
{
    if(confirm("Scenes to compile:\n\n" + sceneList.swfScenes.join(", ")))
    {
        renderScenes(sceneList.swfScenes);
    }
}

function renderScenes(scenes)
{
    var askSettings = true;
    for (var i = 0; i < scenes.length; i++)
    {
        var scene = scenes[i];
        var outputFolder = projectFolder + "/ScenesFootage/swf/" + scene;
        //Clear old
        if (FLfile.exists(outputFolder))
        {
            var files = FLfile.listFolder(outputFolder);
            for (var j = 0; j < files.length; j++) FLfile.remove(outputFolder + "/" + files[i]);
        }
        else
        {
            FLfile.createFolder(outputFolder);
        }
        
        var doc = fl.openDocument(findSceneFLA(scene));
        //Hide cam guide
        var timeline = doc.getTimeline();
        for (var j = 0; j < timeline.layerCount; j++)
        {
            var layer = timeline.layers[j];
            if (layer.name === "CAM GUIDE_a")
            {
                layer.visible = false;
                break;
            }
        }
        
        doc.exportSWF(outputFolder + "/footage.swf", !askSettings);
        askSettings = false;
        
        fl.closeDocument(doc, false);
    }
}

var checkWithPrefix = false;
var flaPrefix;

function findSceneFLA(scene)
{
    if (checkWithPrefix)
    {
        var fla = projectFolder + "/scenesetups/" + flaPrefix + "_" + scene + ".fla";
        if (FLfile.exists(fla))
        {
            return fla;
        }
    }
    
    var files = FLfile.listFolder(projectFolder + "/scenesetups");
    for (var i = 0; i < files.length; i++)
    {
        var fileName = files[i];
        if (fileName.indexOf(".fla") === -1) continue;
        var fileNameNoExt = fileName.substr(0, fileName.lastIndexOf("."));
        var split = fileNameNoExt.split("_", 2);
        if (split.length !== 2 || split[1] !== scene) continue;
        
        checkWithPrefix = true;
        flaPrefix = split[0];
        return projectFolder + "/scenesetups/" + fileName;
    }
    
    throw "Can't find Flash file for scene '" + scene + "'!"
}