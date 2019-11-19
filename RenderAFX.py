import sys
import configparser
import lib_ParseSceneList
import os
from threading import Thread
from pathlib import Path
import subprocess
import re

config = configparser.ConfigParser()
with open("Config.ini") as f:
    configContent = "[root]\n" + f.read()
config.read_string(configContent)

aerenderPath = config["root"]["aerenderPath"]
renderInstances = int(config["root"]["renderInstances"])
hdr = config["root"]["hdr"].lower() == "true"

afxScenes = lib_ParseSceneList.parseSceneList("SceneList.txt").afxScenes

# Upscaled AEP regex (?i)^MLP\d{3}_\d{3}[A-Z]?_UPSCALED\.aep$
def findUpscaledAEP(scene):
    for file in os.scandir("scenes/" + scene + "/afx"):
        if re.match("(?i)^MLP\d{3}_\d{3}[A-Z]?_UPSCALED\.aep$", file.name):
            return file.path

def call(args):
    subprocess.call(args)

def renderScene(scene, aep, outputDir):
    compNameMatch = re.search("^(MLP\d{3}_" + scene + ")", Path(aep).stem)
    if not compNameMatch:
        raise ValueError("AEP file name doesn't match pattern")
    compName = compNameMatch.group(1)
    
    cmd = (
        "\"" + aerenderPath + "\""
        " -project \"" + os.path.abspath(aep) + "\""
        " -comp \"" + compName + "\""
        " -RStemplate \"Multi-Machine Settings\""
        " -OMtemplate \"" + ("MLP_PNG_16" if hdr else "MLP_PNG_8") + "\""
        " -output \"" + os.path.abspath(outputDir) + "/[#####].png\""
    )
    print("Render command: " + cmd)
    
    threads = []

    for i in range(renderInstances):
        threads.append(Thread(target=call, args=[cmd]))
    
    for i in range(renderInstances):
        threads[i].start()
        print("Thread " + str(i) + " started.")
    
    for i in range(renderInstances):
        threads[i].join()
        print("Thread " + str(i) + " finished.")

for scene in afxScenes:
    print("Rendering scene " + scene + "...")
    
    aep = findUpscaledAEP(scene)
    if aep is None:
        print("Scene '" + scene + "' missing upscaled AE project!")
        continue
    
    outputDir = "ScenesFootage/afx/" + scene
    
    # Clear frame folder
    if os.path.exists(outputDir):
        for frame in os.scandir(outputDir):
            os.remove(frame)
    else:
        os.makedirs(outputDir)
    
    renderScene(scene, aep, outputDir)