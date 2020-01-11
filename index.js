!global.data.werewolf ? global.data.werewolf = {
    playersList: {},
    groupPlayers: {},
    runningGames: {}
} : "";

roleTable = {
    5: [
        [
            "villager",
            "villager",
            "villager",
            "headhunter",
            "werewolf"
        ],
        [
            "villager",
            "villager",
            "villager",
            "seer",
            "werewolf"
        ],
        [
            "villager",
            "villager",
            "bodyguard",
            "headhunter",
            "werewolf"
        ]
    ],
    6: [
        [
            "villager",
            "villager",
            "villager",
            "headhunter",
            "seer",
            "werewolf"
        ],
        [
            "villager",
            "villager",
            "seer",
            "headhunter",
            "werewolf",
            "werewolf"
        ]
    ],
    7: [
        [
            "villager",
            "villager",
            "villager",
            "villager",
            "seer",
            "werewolf"
        ],
        [
            "villager",
            "villager",
            "villager",
            "headhunter",
            "witch",
            "werewolf",
            "werewolf"
        ],
        [
            "villager",
            "villager",
            "villager",
            "villager",
            "villager",
            "villager",
            "werewolf"
        ]
    ],
    8: [
        [
            "villager",
            "villager",
            "villager",
            "villager",
            "bodyguard",
            "seer",
            "werewolf",
            "werewolf"
        ],
        [
            "villager",
            "villager",
            "villager",
            "seer",
            "witch",
            "headhunter",
            "werewolf",
            "werewolf"
        ]
    ]
}

/**
 * Get role table.
 *
 * @param   {number}        np  Number of players.
 *
 * @return  {Array<String>}     Role table.
 */
function getRoleTable(np) {
    if (np >= 5 && np <= 8) {
        return roleTable[np][randomNumber(0, roleTable[np].length - 1)];
    } else if (np > 8) {
        var arr = [];

        for (var i = 0; i < Math.floor(np / 2); i++) arr.push("villager");
        var villagercount = arr.length;
        for (var i = 0; i < Math.floor(villagercount / 1.5); i++) arr.push("werewolf");
        var werewolfcount = arr.length - villagercount;
        var slotLeft = np - arr.length;
        for (var i = 0; i < slotLeft; i++) arr.push(["seer", "bodyguard", "headhunter", "witch"][randomNumber(0, 3)])

        return arr;
    }
}

/**
 * Get a random number
 *
 * @param  {number} min Minimum
 * @param  {number} max Maximum
 * 
 * @return {number} Randomized number
 */
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
                return startGame(data);
            case "list":
                return list(data.msgdata.threadID);
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

/**
 * Start a werewolf game
 *
 * @param   {object}  data  Message object that required to start game.
 *
 * @return  {object}        C3C-compatible message
 */
function startGame(data) {
    if (global.data.werewolf.groupPlayers[data.msgdata.threadID].length < 5) {
        //Not enough players.
        return {
            handler: "internal",
            data: langpack[global.config.language].needAtLeast7Players
        }
    }

    if (!global.data.werewolf.runningGames.hasOwnProperty(data.msgdata.threadID)) {
        var playerlist = global.data.werewolf.groupPlayers[data.msgdata.threadID];
        playerlist.sort(() => randomNumber(-1, 1))
        var objplist = {};
        var reverseMapping = {};
        for (var n in playerlist) {
            objplist[n + 1] = {
                id: playerlist[n],
                dead: false,
                deadBy: "notdead",
                role: "unknown",
                roleData: {},
                vote: "none"
            }
            reverseMapping[playerlist[n]] = n;
        }
        var roleTable = getRoleTable(global.data.werewolf.groupPlayers[data.msgdata.threadID].length);
        roleTable.sort(() => randomNumber(-1, 1));
        for (var n in roleTable) {
            objplist[n + 1].role = roleTable[n];
            switch (roleTable[n]) {
                case "witch":
                    objplist[n + 1].roleData = {
                        killPotion: true,
                        healPotion: true,
                        kill: "none",
                        heal: "none"
                    };
                    break;
                case "bodyguard":
                    objplist[n + 1].roleData = {
                        lastCover: "none",
                        cover: "none"
                    };
                    break;
                case "headhunter":
                    objplist[n + 1].roleData = {
                        hunting: "none"
                    };
                    break;
                case "werewolf":
                    objplist[n + 1].roleData = {
                        kill: "none"
                    };
                    break;
            }
        }
        global.data.werewolf.runningGames[data.msgdata.threadID] = {
            players: objplist,
            reverseMapping: reverseMapping,
            day: 0,
            night: true,
            votingTime: false
        }
        var roleListBC = langpack[global.config.language].roleListH;
        var counting = {};
        for (var n in roleTable) {
            !counting.hasOwnProperty(roleTable[n]) ? counting[roleTable[n]] = 1 : counting[roleTable[n]] += 1;
        }
        for (var n in counting) {
            roleListBC += "\r\n" + counting[n] + "x " + langpack[global.config.language].roleName[n];
        }
        roleListBC += "\r\n\r\n" + langpack[global.config.language].starting;
        //TODO: Game logic function reference here.
        return {
            handler: "internal",
            data: roleListBC
        }
    } else {
        return {
            handler: "internal",
            data: langpack[global.config.language].alreadyStarted
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
            if (!global.data.werewolf.runningGames.hasOwnProperty(threadid)) {
                global.data.werewolf.playersList[fbid] = threadid;
                !global.data.werewolf.groupPlayers[threadid] ? global.data.werewolf.groupPlayers[threadid] = [] : "";
                global.data.werewolf.groupPlayers[threadid].push(fbid);
                return {
                    handler: "internal",
                    data: langpack[global.config.language].joined
                }
            } else {
                return {
                    handler: "internal",
                    data: langpack[global.config.language].alreadyStarted
                }
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
 * @param   {string}  fbid  Sender's Facebook ID
 *
 * @return  {object}        C3C-compatible message
 */
function leave(fbid) {
    if (!global.data.werewolf.runningGames.hasOwnProperty(global.data.werewolf.playersList[fbid])) {
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
    } else {
        return {
            handler: "internal",
            data: langpack[global.config.language].cannotLeaveUntilGameEnd
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