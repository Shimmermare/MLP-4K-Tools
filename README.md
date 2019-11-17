To use the tools, you need Python 3.8, After Effects, and Adobe Flash/Animate installed.

1. Place tools, **`scenes`** folder (AFX files)  and **`scenesetups`** folder (Flash files) in a new empty folder.

3. Open **`Config.ini`** and edit values:
    + **`upscaleFactor`** is how much should project be upscaled. For 4K it's default 2.0, for 8K - 4.0 an so on.
    + **`aerenderPath`** is the path to your After Effects `aerender.exe` file. It is located in Support Files folder.
    + **`renderInstances`** is how many instances of AE will be used in rendering at the same time. General formula is 8 GB and 2 CPU cores per instance.
    + **`hdr`** is should scenes be rendered at 16-bit per channel colors. Note that it's only applicable to AFX and manual scenes since Flash is 8 bit/channel.

4. Run **`BuildSceneList.py`**. This will create file **`SceneList.txt`** with rough scene table. The file contains information how each scene should be treated:
    + **`afx`** - rendered from After Effects as PNG sequence.
    + **`fla`** - rendered from Flash/Animate as PNG sequence.
    + **`swf`** - compiled from Flash/Animate as SWF file.
    + **`man`** - manually managed image sequence. Used for waifu2x-ed intro and credits.

> **Tip**: insert lines **`START`** and **`END`** between scenes to tell scripts to process only part of the list. Can be used multiple times.  
> **Tip**: scene list supports `#` comments.

5. Run **`UpscaleAFXScenes.jsx`** from suitable After Effects version. If everything is good and no warning was shown, go to next step. Otherwise you would need to:
    + If attribute/effect is missing - find which plugin it is from and install it and try again.
    + If script sent alert about unknown effect, please report it here and check that effect for manual upscaling need.
    + If scene is failing to upscale for some reason, manually upscale it and save AE project as **`<original name>_UPSCALED.aep`**.

6. Open After Effects and create new output templates:
    + Select `TIFF Sequence with Alpha` output template.
    + Set `Format` to `PNG Sequence`.
    + Toggle checkbox `Use Comp Frame Number` off.
    + Set `Starting #` to `1`.
    + Save it as new `MLP_PNG_8` template. 
    + If you intend to use HDR, also set `Depth` to `Trillion of Colors+` and save template as `MLP_PNG_16`.

7. Run **`RenderAFX.py`** to render afx scenes.  

8. Run **`RenderFlash.jsfl`** to render fla scenes as PNG sequences. You'll be prompted once to specify render settings. Set width/height the same as planned scene resolution.  

> **Tip**: if scene fails to render as PNG sequence, consider changing it's type to SWF.  
> **Note**: if .jsfl files aren't automatically run by Flash/Animate, open them withing app directly.

9. Run **`RenderSWF.jsfl`** to render SWF scenes. If both this and PNG render fails - good luck with manual fixing.

10. **`Template.aep`** is a basic template for composing. It has debug overlays and main comp already setup. Template is compatible with AE CS6+. You need to get an episode video file which is used as reference (*iTunеs version is recommended*) and replace placeholder **`Episode Video`** with it.  
If you are using non-4K resolution, use default scripts **`Scale Composition.jsx`** and **`Scale Selected Layers.jsx`** on template.

11. Use **`ImportScenes.jsx`** to import all the scenes into project. You can use the script each time scene list is modified, it will re-import changed scenes. If a scene which was used in timeline was removed from the list, item will be moved to **`ScenesRemoved`** folder.

12. Add scenes one by one to the composition and match them with the reference.  
    + A large part of scenes needs to be cut in various ways, usually start and end frames are cut.
    + Some scenes are cut entirely from the episode. Just remove them from scene list.
    + Scenes can use alpha channel and overlay each other. Often with broken order.
    + If a scene just won't match and you see a lot of diff lines, check scale. Some scenes are scaled to 102% for whatever reason.  

13. Add fx and other stuff:
    + Scene translations: the most common are simple fade in/out and Linear Wipe. Sometimes Radial Wipe and Wave Wipe in combination with Fast Blur are used. Also don't forget about alpha translations.
    + Titles: font is Woodrow. Don't bother with exact alignment because DHX uses custom font version.

**Misc:**
+ Expect a full episode files to take 150+ gb.
+ Some scenes can take really long time to upscale. For example, rap scenes (502, 503, etc) from episode 422 can take up to 1 hour each!
+ Some FX, for example Cell Pattern on the Cutie Map, don't support 8+ bit colors.
+ Random-based FX such as Fractal Noise are impossible to scale with 1:1 match.
+ You can use Virtual Machine to speed up Flash rendering.
+ **Sometimes AE can crash while rendering at the very end. To avoid this, remove the last few black frames from episode video (after Hasbro Studios logo).**
+ Do draft version with difference enabled before final rendering. This way you can catch any artefacts without wasting time on re-rendering. **To enable guide layers rendering, set `Guide Layers` to `Current Settings` in render settings.**
+ Using Adobe Media Encoder for final rendering is recommended.