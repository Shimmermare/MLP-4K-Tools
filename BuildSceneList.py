import os
import re

sceneListFile = "SceneList.txt"
if (os.path.exists(sceneListFile)):
    print("Scene list is already exists. Print 'y' if you want to create a new.")
    if (input().lower() != "y"):
        sys.exit()
    
    os.remove(sceneListFile)

# scene name regex: (?i)^MLP\d{3}_(\d{3}[A-Z]?)\.ext$

def searchAFX():
    afxScenes = []
    
    def searchSceneFolder(sceneFolder):
        afxFolder = os.path.join(sceneFolder, "afx")
        for file in os.scandir(afxFolder):
            match = re.search("(?i)^MLP\d{3}_(\d{3}[A-Z]?)\.aep$", file.name)
            if not (match): continue
            scene = match.group(1)
            if not (scene == sceneFolder.name): continue
        
            afxScenes.append(sceneFolder.name)
            return
    
        print("AFX scene folder " + sceneFolder.name + " doesn't have AEP file!")
    
    if os.path.exists("scenes/"):
        for sceneFolder in os.scandir("scenes/"):
            searchSceneFolder(sceneFolder)
    return afxScenes

def searchFLA():
    flashScenes = []
    
    if os.path.exists("scenesetups/"):
        for file in os.scandir("scenesetups/"):
            match = re.search("(?i)^MLP\d{3}_(\d{3}[A-Z]?)\.fla$", file.name)
            if not (match): continue
            scene = match.group(1)
            flashScenes.append(scene)
    
    return flashScenes

afxScenes = searchAFX()
flashScenes = searchFLA()

sceneList = []

for scene in afxScenes:
    sceneList.append(scene + ":afx")
for scene in flashScenes:
    if not scene in afxScenes:
        sceneList.append(scene + ":fla")

sceneList.sort()

sceneListFileObj = open(sceneListFile, "w")
for scene in sceneList:
    print(scene, file=sceneListFileObj)
sceneListFileObj.close()

print("List is formed.")