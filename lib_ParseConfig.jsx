function parseConfig(file)
{
    if (!file.exists) throw "Config file '" + file.fullName + "' doesn't exist!";
    
    var lines = new Array();
    file.open("r");
    var readLine;
    while (readLine = file.readln())
    {
        lines.push(readLine);
    }
    file.close();
    
    var config = {};
    for (var i = 0; i < lines.length; i++)
    {
        var line = lines[i];
        //Skip comments and empty lines
        if (line.length === 0 || line.charAt(0) === "#") continue;

        var keyValue = line.split("=", 2);
        if (keyValue.length !== 2) throw "Config is malformed at line '" + i + "': expected key=value.";
        config[keyValue[0]] = keyValue[1];
    }
    return config;
}