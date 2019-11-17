function showSelectedEffectInfo()
{
    if (!(app.project.activeItem instanceof CompItem))
    {
        alert("Select one effect");
        return;
    }
    var properties = app.project.activeItem.selectedProperties;
    if (properties.length !== 1)
    {
        alert("Select ONE effect");
        return;
    }
    
    var effect = properties[0];
    for (var j = 1; j <= effect.numProperties; j += 20)
        {
            var propLines = new Array();
            propLines.push("Effect: " + effect.name + " (" + effect.matchName + ")");
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

function enumName(enumType, value) 
{
  for (var k in enumType) if (enumType[k] == value) return k;
  return null;
}

showSelectedEffectInfo();