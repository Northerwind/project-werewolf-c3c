!global.data.werewolf ? global.data.werewolf = {} : "";

var randomNumber = function(min, max) { 
	if (min > max) {
		var temp = min;
		min = max;
		max = temp;
	}
	var bnum = (max - min).toString(16).length / 2;
	if (bnum < 1) bnum = 1;
	return Math.round(parseInt(global.nodemodule.crypto.randomBytes(bnum).toString('hex'), 16) / Math.pow(16, bnum * 2) * (max - min)) + min; 
};

var langpack = {
	"vi_VN": "werewolf_lang_vi_VN"
}
for (var lang in langpack) {
    langpack[lang] = global.nodemodule["js-yaml"].load(global.fileMap[langpack[lang]]);
}

function cmdinterface(type, data) {
    var args = data.args;
    if (args.length == 1) {
        return displayHelp(type);
    }
}

function cmdconfig(type, data) {
    var args = data.args;
}

function displayHelp(type) {
    var helpData = "";
    for (var line in langpack[global.config.language].displayHelp) {
        if (helpData == "") {
            helpData += langpack[global.config.language].displayHelp[line];
        } else {
            helpData += "\r\n" + langpack[global.config.language].displayHelp[line];
        }
    }
    return {
        handler: "core",
        data: helpData
    }
}

exports = {
    cmdinterface: cmdinterface,
    cmdconfig: cmdconfig
}