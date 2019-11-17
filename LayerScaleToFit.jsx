function main()
{
    var comp = app.project.activeItem;
    if (!(comp instanceof CompItem))
    {
        alert("Select composition!");
        return;
    }
    
    var layers = comp.selectedLayers;
    if (layers.length === 0)
    {
        alert("Select layers!");
        return;
    }
    
    for (var i = 0; i < layers.length; i++)
    {
        var layer = layers[i];
        if (!(layer instanceof AVLayer)) continue;
        var scaleWidth = comp.width / layer.width * 100;
        var scaleHeight = comp.height / layer.height * 100;

        var scaleProperty = layer.property("ADBE Transform Group").property("ADBE Scale");
        scaleProperty.setValue([scaleWidth, scaleHeight, scaleProperty.value[2]])
    }
}

main();