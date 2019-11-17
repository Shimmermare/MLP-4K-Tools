// KEEP UP-TO-DATE WITH PYTHON VERSION
function parseSceneList(lines)
{    
    var sceneList =
    {
        //Array of obj {scene: scene, type: type}
        allScenes: new Array(),
        
        afxScenes: new Array(),
        flaScenes: new Array(),
        swfScenes: new Array(),
        manualScenes: new Array()
    };
    
    var insideBlock = true;
    //Prepass to check if START is used later and block sholdn't start from first line
    for (var i = 0; i < lines.length; i++)
    {
        var line = lines[i];
        if (line === "START")
        {
            insideBlock = false;
            break;
        } else if (line === "END")
        {
            break;
        }
    }
    
    for (var i = 0; i < lines.length; i++)
    {
        var line = lines[i];
        //Toggle should scenes be read
        if (!insideBlock && line === "START")
        {
            insideBlock = true;
            continue;
        }
        else if (insideBlock && line === "END")
        {
            insideBlock = false;
            continue;
        }
        
        if (!insideBlock) continue;
        
        //Skip comments and empty lines
        if (line.length === 0 || line.charAt(0) === "#") continue;
        
        var sceneAndType = line.split(":", 2);
        if (sceneAndType.length !== 2) throw "Scene list is malformed at line '" + i + "': expected scene:type."
        
        switch(sceneAndType[1])
        {
            case "afx":
                sceneList.afxScenes.push(sceneAndType[0]);
                break;
            case "fla":
                sceneList.flaScenes.push(sceneAndType[0]);
                break;
            case "swf":
                sceneList.swfScenes.push(sceneAndType[0]);
                break;
            case "man":
                sceneList.manualScenes.push(sceneAndType[0]);
                break;
            default:
                throw "Scene list is malformed at line '" + i + "': unknown scene type '" + sceneAndType[1] + "'";
        }
        sceneList.allScenes.push({name: sceneAndType[0], type: sceneAndType[1]});
    }
    
    return sceneList;
}