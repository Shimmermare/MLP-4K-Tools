var projectFolder = new Folder(new File($.fileName).path);
var footageFolder = new Folder(projectFolder.fullName + "/ScenesFootage");

$.evalFile(projectFolder.fullName + "/lib_ParseSceneList.js");
var sceneListFile = new File(projectFolder.fullName + "/SceneList.txt");
sceneListFile.open("r");
var sceneList = parseSceneList(sceneListFile.read().split(/\r?\n/));
sceneListFile.close();

var itemScenes = getItemScenes();

var sceneListDict = {};
for (var i = 0; i < sceneList.allScenes.length; i++) 
{
    var scene = sceneList.allScenes[i];
    sceneListDict[scene.name] = scene;
}

var missingScenes = new Array();

//Pass 1: check removed scened and scenes with changed type
for (var i = 1; i <= itemScenes.numItems; i++)
{
    var itemScene = itemScenes.item(i);
    var scene = sceneListDict[itemScene.name];
    if (!scene)
    {
        if (itemScene.usedIn.length === 0)
        {
            itemScene.remove();
        }
        else
        {
            itemScene.parentFolder = getItemScenesRemoved();
        }
    }
    else
    {
        var sourceFile = itemScene.mainSource.file;
        var sceneFolder = new Folder(sourceFile.path);
        var typeFolder = new Folder(sceneFolder.path);
        if (scene.type === typeFolder.name) continue;
        
        var newTypeFolder = new Folder(footageFolder.fullName + "/" + scene.type);
        var newSceneFolder = new Folder(newTypeFolder.fullName + "/" + scene.name);
        if (!newSceneFolder.exists)
        {
            missingScenes.push(scene);
            continue;
        }
        if (scene.type === "swf")
        {
            var swfFile = new File(newSceneFolder.fullName + "/footage.swf");
            if (!swfFile)
            {
                missingScenes.push(scene);
                continue;
            }
            itemScene.replace(swfFile);
        }
        else
        {
            var firstFrame = findFirstFrame(newSceneFolder);
            if (!firstFrame)
            {
                missingScenes.push(scene);
                continue;
            }
            itemScene.replaceWithSequence(firstFrame, true);
        }
    }
}

var sceneItemDict = {};
for (var i = 1; i <= itemScenes.numItems; i++)
{
    var itemScene = itemScenes.item(i);
    sceneItemDict[itemScene.name] = itemScene;
}

//Pass 2: import non-imported scenes
for (var i = 0; i < sceneList.allScenes.length; i++)
{
    var scene = sceneList.allScenes[i];
    if (sceneItemDict[scene.name]) continue;
    var typeFolder = new Folder(footageFolder.fullName + "/" + scene.type);
    var sceneFolder = new Folder(typeFolder.fullName + "/" + scene.name);
    if (!sceneFolder.exists)
    {
        missingScenes.push(scene);
        continue;
    }
    
    var io = new ImportOptions();
    
    if (scene.type === "swf")
    {
        var swfFile = new File(newSceneFolder.fullName + "/footage.swf");
        if (!swfFile)
        {
            missingScenes.push(scene);
            continue;
        }
        io.file = swfFile;
        io.sequence = false;
    }
    else
    {
        var firstFrameFile = findFirstFrame(sceneFolder);
        if (!firstFrameFile)
        {
            missingScenes.push(scene);
            continue;
        }
        io.file = firstFrameFile;
        io.sequence = true;
    }
    
    io.forceAlphabetical = true;
    io.importAs = ImportAsType.FOOTAGE;
    
    var sceneItem = app.project.importFile(io);
    sceneItem.parentFolder = itemScenes;
    sceneItem.name = scene.name;
    sceneItem.mainSource.conformFrameRate = 23.976;
}

if (missingScenes.length > 0)
{
    var missingScenesTextArr = new Array();
    for (var i = 0; i < missingScenes.length; i++)
    {
        var scene = missingScenes[i];
        missingScenesTextArr.push(scene.name + " (" + scene.type + ")");
    }

    alert("Some scenes are missing footage: \n" + missingScenesTextArr.join(", "));
}

function getItemScenes()
{
    for (var i = 1; i <= app.project.rootFolder.numItems; i++)
    {
        var item = app.project.rootFolder.item(i);
        if (item instanceof FolderItem && item.name === "Scenes")
        {
            return item;
        }
    }
    return app.project.items.addFolder("Scenes");
}

function getItemScenesRemoved()
{
    for (var i = 1; i <= app.project.rootFolder.numItems; i++)
    {
        var item = app.project.rootFolder.item(i);
        if (item instanceof FolderItem && item.name === "ScenesRemoved")
        {
            return item;
        }
    }
    return app.project.items.addFolder("ScenesRemoved");
}

//Sort files alphabetically and pick first image
function findFirstFrame(folder)
{
    var files = folder.getFiles();
    files.sort(function(a, b)
    {
        if (a.name === b.name) return 0;
        else return a > b;
    });
    
    var knownTypes = ["png", "jpg", "jpeg", "tiff"];
    
    for (var i = 0; i < files.length; i++)
    {
        var file = files[i];
        var ext = file.name.substr(file.name.lastIndexOf(".") + 1);
        for (var j = 0; j < knownTypes.length; j++) if (knownTypes[j] === ext) return file;
    }
    return null;
}

//Check new scenes