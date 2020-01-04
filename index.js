!global.data.werewolf ? global.data.werewolf = {
    playersList: {}
} : "";

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
    } else if (args.length > 1) {
        switch (args[1].toLocaleLowerCase()) {
            case "join":
                break;
            case "leave":
                break;
            case "start":
                break;
            case "list":
                break;
            case "nlist":
                break;
            case "vote":
                break;
            case "unvote":
                break;
            case "help":
                return displayHelp();
            default:
                return unknownCmd();
        }
    }
}

function cmdconfig(type, data) {
    var args = data.args;
}

function displayHelp() {
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

function unknownCmd() {
    return {
        handler: "core",
        data: langpack[global.config.language].unknownCmd
    }
}

function join(fbid, threadid) {
    var group = (fbid == threadid);
    !global.data.werewolf.playersList[fbid] ? global.data.werewolf.playersList[fbid] = "-1" : "";
    if (group) {
        if (global.data.werewolf.playersList[fbid] != "-1") {
            if (global.data.werewolf.playersList[fbid] != threadid) {
                return {
                    handler: "core",
                    data: langpack[global.config.language].alreadyJoinedOthers
                }
            } else {
                return {
                    handler: "core",
                    data: langpack[global.config.language].alreadyJoined
                }
            }
        } else {
            global.data.werewolf.playersList[fbid] = threadid;
            return {
                handler: "core",
                data: langpack[global.config.language].joined
            }
        }
    } else {
        return {
            handler: "core",
            data: langpack[global.config.language].groupOnly
        }
    }
}

exports = {
    cmdinterface: cmdinterface,
    cmdconfig: cmdconfig
}