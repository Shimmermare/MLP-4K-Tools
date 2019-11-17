# KEEP UP-TO-DATE WITH JS VERSION

import sys
import os

class SceneList:
    # List of tuples (scene, type)
    allScenes = []
    
    afxScenes = []
    flaScenes = []
    swfScenes = []
    manualScenes = []

def parseSceneList(file):
    with open(file, "r") as f:
        lines = f.read().splitlines()
    
    sceneList = SceneList()
    
    insideBlock = True
    # Prepass to check if START is used later and block sholdn't start from first line
    for line in lines:
        if line == "START":
            insideBlock = False
            break
        elif line == "END":
            break
    
    for i in range(len(lines)):
        line = lines[i]
        
        if not insideBlock and line == "START":
            insideBlock = True
            continue
        elif insideBlock and line == "END":
            insideBlock = False
            continue
        
        if not insideBlock: continue
        # Skip comments and empty lines
        if len(line) == 0 or line[0] == "#": continue
        
        sceneAndType = line.split(":", 1)
        if len(sceneAndType) != 2:
            raise ValueError("Scene list is malformed at line '" + str(i) + "': expected scene:type.")
        
        scene = sceneAndType[0]
        type = sceneAndType[1]
        
        if type == "afx":
            sceneList.afxScenes.append(scene)
        elif type == "fla":
            sceneList.flaScenes.append(scene)
        elif type == "swf":
            sceneList.swfScenes.append(scene)
        elif type == "man":
            sceneList.manualScenes.append(scene)
        else:
            raise ValueError("Scene list is malformed at line '" + str(i) + "': unknown scene type '" + type + "'")
        
        sceneList.allScenes.append((scene, type))
    
    return sceneList