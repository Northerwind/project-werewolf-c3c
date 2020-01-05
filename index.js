!global.data.werewolf ? global.data.werewolf = {
    playersList: {},
    groupPlayers: {},
    runningGames: {}
} : "";

var randomNumber = function (min, max) {
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
                return join(data.msgdata.senderID, data.msgdata.threadID);
            case "leave":
                return leave(data.msgdata.senderID);
            case "start":
                break;
            case "list":
                return list(data.msgdata.threadID);
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

/**
 * Return a help data
 *
 * @return  {object}  C3C-compatible message
 */
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
        handler: "internal",
        data: helpData
    }
}


function unknownCmd() {
    return {
        handler: "internal",
        data: langpack[global.config.language].unknownCmd
    }
}

/**
 * Join game function
 *
 * @param   {string}  fbid      Sender's Facebook ID
 * @param   {string}  threadid  Thread's Facebook ID
 *
 * @return  {object}            C3C-compatible message
 */
function join(fbid, threadid) {
    var group = (fbid == threadid);
    !global.data.werewolf.playersList[fbid] ? global.data.werewolf.playersList[fbid] = "-1" : "";
    if (group) {
        if (global.data.werewolf.playersList[fbid] != "-1") {
            if (global.data.werewolf.playersList[fbid] != threadid) {
                return {
                    handler: "internal",
                    data: langpack[global.config.language].alreadyJoinedOthers
                }
            } else {
                return {
                    handler: "internal",
                    data: langpack[global.config.language].alreadyJoined
                }
            }
        } else {
            global.data.werewolf.playersList[fbid] = threadid;
            !global.data.werewolf.groupPlayers[threadid] ? global.data.werewolf.groupPlayers[threadid] = [] : "";
            global.data.werewolf.groupPlayers[threadid].push(fbid);
            return {
                handler: "internal",
                data: langpack[global.config.language].joined
            }
        }
    } else {
        return {
            handler: "internal",
            data: langpack[global.config.language].groupOnly
        }
    }
}

/**
 * Leave game function
 *
 * @param   {string}  senderid  Sender's Facebook ID
 *
 * @return  {object}            C3C-compatible message
 */
function leave(senderid) {
    if (global.data.werewolf.playersList[fbid] == "-1") {
        return {
            handler: "internal",
            data: langpack[global.config.language].notJoined
        }
    } else {
        global.data.werewolf.playersList[fbid] = "-1";
        delete global.data.werewolf.groupPlayers[global.data.werewolf.playersList[fbid]][global.data.werewolf.groupPlayers[global.data.werewolf.playersList[fbid]].indexOf(fbid)];
        return {
            handler: "internal",
            data: langpack[global.config.language].leaved
        }
    }
}

/**
 * List players function
 *
 * @param   {string}  threadid  Thread's Facebook ID
 *
 * @return  {object}            C3C-compatible message
 */
function list(threadid) {
    !global.data.werewolf.groupPlayers[threadid] ? global.data.werewolf.groupPlayers[threadid] = [] : "";
    var rtn = langpack[global.config.language].playerListH;
    if (global.data.werewolf.groupPlayers[threadid].length == 0) {
        rtn += "\r\n" + langpack[global.config.language].noOne + "."
    } else {
        var mentionobj = [];
        for (var n in global.data.werewolf.groupPlayers[threadid]) {
            rtn += "\r\n" + n.toString() + ". " + global.data.cacheName[global.data.werewolf.groupPlayers[threadid][n]];
            mentionobj.push({
                tag: global.data.cacheName[global.data.werewolf.groupPlayers[threadid][n]],
                id: global.data.werewolf.groupPlayers[threadid][n],
                fromIndex: rtn.match(new RegExp(global.data.cacheName[global.data.werewolf.groupPlayers[threadid][n]], "g")).length - 1
            });
        }
    }
    var dataobj = {};
    dataobj.body = rtn;
    if (mentionobj) {
        dataobj.mentions = mentionobj;
    }
    return {
        handler: "internal-raw",
        data: dataobj
    }
}

exports = {
    cmdinterface: cmdinterface,
    cmdconfig: cmdconfig
}