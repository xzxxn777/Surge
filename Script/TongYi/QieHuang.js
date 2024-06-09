const $ = new Env("茄皇");
let token = '';
let notice = ''
let step = ["种植番茄","发育期","幼苗期","开花期","结果期","收获期"];
let prizeType = [{"sun":"阳光"},{"dice":"烤包子"},{"gold":"调料包"}];
let QieHuang_Body = ($.isNode() ? process.env.QieHuang_Body : $.getjson("QieHuang_Body")) || [];
let helpRole = ["1799683034534522880"],
    helpTask = ["1773742212391776256","1774452631353331712","1774636807295471616","1799682948108292096","1774096506474598400","1774644904452067328","1773739743086776320","1774091259082321920","1774092017642377216","1774092684184391680"];
!(async () => {
    if (typeof $request != "undefined") {
        await getCookie();
    } else {
        await main();
    }
})().catch((e) => {$.log(e)}).finally(() => {$.done({});});

async function main() {
    console.log('作者：@xzxxn777\n频道：https://t.me/xzxxn777\n群组：https://t.me/xzxxn7777\n自用机场推荐：https://xn--diqv0fut7b.com\n')
    for (const item of QieHuang_Body) {
        wid = item.wid;
        thirdId = item.thirdId;
        let lottery = true;
        //登录
        let loginInfo = await commonPost("/public/api/login", item)
        console.log(`用户：${wid} 登录成功！`)
        token = loginInfo.data.token;
        console.log("获取库存信息")
        let userInfo = await commonGet("/userInfo/get")
        console.log(`调料包：${userInfo.data.gold} 番茄：${userInfo.data.score} 阳光：${userInfo.data.sun}`)
        //伴手礼
        console.log("————————————")
        console.log("开始领取伴手礼")
        let gift = await commonGet("/user-role/reward")
        if (gift.code == 0) {
            console.log(`获得：${gift.data.name}`)
        } else {
            console.log(gift.message)
        }
        //收集阳光
        console.log("————————————")
        console.log("开始收集阳光")
        let autoSun = await commonGet("/userInfo/autoSun")
        console.log(`获得阳光：${autoSun.data.sun}`)
        //种植番茄
        console.log("————————————")
        console.log("开始种植番茄")
        let getLand = await commonGet("/user-land/get")
        for (const land of getLand.data.gaUserLandList) {
            if (land.status === 0) {
                console.log(`第${land.no}块地：未解锁`)
                if (land.unlockGold > userInfo.data.gold) {
                    lottery = false;
                    console.log(`解锁需要：${land.unlockGold} 调料包不足`)
                    continue
                }
                //解锁
                console.log(`开始解锁土地`)
                let unlock = await commonGet(`/user-land/unlock`)
                if (unlock.code == 0) {
                    console.log(`解锁成功`)
                    //种植番茄
                    console.log(`开始种植番茄`)
                    let sow = await commonGet(`/user-land/sow?no=${land.no}`, {no: land.no})
                    if (sow.code == 0) {
                        console.log(`种植成功`)
                    } else {
                        console.log(sow)
                    }
                    //消耗阳光
                    console.log(`开始挥洒阳光`)
                    let sun = await commonGet(`/user-land/sun?no=${land.no}`,{no:land.no})
                    if (sun.code == 0) {
                        console.log(`消耗阳光：${land.needSun}`)
                    } else {
                        console.log(sun.message)
                    }
                } else {
                    console.log(unlock)
                }
            } else {
                console.log(`第${land.no}块地：已解锁 阶段：${step[land.step]}（${land.sumSunCount-land.leftSunCount}/${land.sumSunCount}）`)
                if (land.step == 0) {
                    //种植番茄
                    console.log(`开始种植番茄`)
                    let sow = await commonGet(`/user-land/sow?no=${land.no}`, {no: land.no})
                    if (sow.code == 0) {
                        console.log(`种植成功`)
                    } else {
                        console.log(sow)
                    }
                }
                if (land.step == 5) {
                    //收获番茄
                    console.log(`开始收获番茄`)
                    let result = await commonGet(`/user-land/result?no=${land.no}`, {no: land.no})
                    if (result.code == 0) {
                        console.log(`收获：  番茄*${result.data}`)
                        //种植番茄
                        console.log(`开始种植番茄`)
                        let sow = await commonGet(`/user-land/sow?no=${land.no}`, {no: land.no})
                        if (sow.code == 0) {
                            console.log(`种植成功`)
                        } else {
                            console.log(sow)
                        }
                    } else {
                        console.log(result)
                    }
                }
                //消耗阳光
                console.log(`开始挥洒阳光`)
                let sun = await commonGet(`/user-land/sun?no=${land.no}`,{no:land.no})
                if (sun.code == 0) {
                    console.log(`消耗阳光：${land.needSun}`)
                } else {
                    console.log(sun.message)
                }
                //升级
                if (land.leftSunCount == 0) {
                    console.log(`开始升级`)
                    let level = await commonGet(`/user-land/level?no=${land.no}`,{no:land.no})
                    console.log(level)
                }
            }
        }
        //做任务
        console.log("————————————")
        console.log("开始做任务")
        let taskList = await commonGet("/task/get")
        for (const task of taskList.data) {
            console.log(`任务：${task.title} 任务id：${task.id}`)
            if (task.status === 0) {
                if (task.taskId == 3) {
                    continue
                }
                console.log("去做任务")
                let doTask = await commonGet(`/task/doTask?id=${task.id}`, {id: task.id})
                if (doTask.code == 0) {
                    console.log(`任务成功`)
                    console.log("开始领取奖励")
                    let reward = await commonGet(`/task/reward?id=${task.id}`, {id: task.id})
                    if (reward.code == 0) {
                        for (const prize of task.prizeList) {
                            let name = prizeType.find(item => prize.type in item)[prize.type];
                            console.log(`获得${name} * ${prize.num}`)
                        }
                    } else {
                        console.log(reward.message)
                    }
                } else {
                    console.log(doTask)
                }
            } else if (task.status === 2) {
                console.log("任务已完成")
            } else {
                console.log("开始领取奖励")
                let reward = await commonGet(`/task/reward?id=${task.id}`, {id: task.id})
                if (reward.code == 0) {
                    for (const prize of task.prizeList) {
                        let name = prizeType.find(item => prize.type in item)[prize.type];
                        console.log(`获得${name} * ${prize.num}`)
                    }
                } else {
                    console.log(reward)
                }
            }
        }
        //助力
        console.log("开始每日任务助力")
        for (const helpUser of helpTask) {
            if (helpUser == userInfo.data.userId) {
                continue
            }
            let randomId = randomString(32,'0123456789qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM');
            let help = await commonGet(`/friend-help/help?userId=${helpUser}&type=0&randomId=${randomId}`, {userId: helpUser, type: 0, randomId: randomId})
            if (help.data) {
                console.log(`助力成功`)
            } else {
                console.log(help.message)
            }
            if (help.message && help.message.includes("超出今日助力次数")) {
                break
            }
        }
        console.log("————————————")
        console.log("去旅行")
        //在线奖励
        console.log("开始领取在线奖励")
        let online = await commonGet("/take-risk/online")
        console.log(online)
        let reward = await commonGet("/take-risk/reward")
        if (reward.code == 0) {
            console.log(`获得：烤包子 * ${reward.data.num}`)
        } else {
            console.log(reward.message)
        }
        //获取角色
        console.log("开始获取角色")
        let getRole = await commonGet("/user-role/get")
        for (const role of getRole.data.roleList) {
            if (role.status === 0) {
                console.log(`角色：${role.name} 未解锁`)
                if (role.unlockNum > userInfo.data.gold) {
                    lottery = false;
                    console.log(`解锁需要：${role.unlockNum} 调料包不足`)
                    continue
                }
                //解锁
                if (role.roleId == 10003) {
                    console.log(`解锁角色助力码：${role.id}`)
                } else {
                    let unlockRole = await commonGet(`/user-role/goldUnlock?roleId=${role.roleId}`, {roleId: role.roleId})
                    if (unlockRole.code == 0) {
                        console.log(`解锁成功`)
                    } else {
                        console.log(unlockRole)
                    }
                }
            } else {
                console.log(`角色：${role.name} 已解锁`)
            }
        }
        // 助力角色
        console.log("开始助力解锁角色")
        for (const helpRoleItem of helpRole) {
            let helpRoleData = await commonGet(`/user-role/friendHelpUnlock?userRoleId=${helpRoleItem}`,{userRoleId:helpRoleItem})
            if (helpRoleData.data) {
                console.log(`助力成功`)
            } else {
                console.log(helpRoleData.message)
            }
        }
        //获取当前信息
        console.log("开始旅行-go")
        let getCurrent = await commonGet("/common/take-risk/get")
        if (getCurrent.data.num > 0) {
            for (let i = 0; i < getCurrent.data.num; i++) {
                //出发
                let go = await commonGet("/common/take-risk/go")
                if (go.code == 4000) {
                    console.log("验证失败导致部分功能暂时用不了")
                    break
                }
                if (go.code == 1000) {
                    console.log("冒险暂停中")
                    break
                }
                if (go.data.eventId == 101) {
                    for (const answer of go.data.gameMapEvent.gameMapEventAnswerList) {
                        console.log(`获得：${answer.dropReward.name} * ${answer.dropReward.finalNum}`)
                    }
                } else if (go.data.eventId == 102) {
                    console.log("触发随机事件")
                    let jsonId = '',minNum = 0;
                    for (const answer of go.data.gameMapEvent.gameMapEventAnswerList) {
                        console.log(`jsonId:${answer.jsonId} - ${answer.eventAnswer} 获得：${answer.dropReward.name} * ${answer.dropReward.minNum}`)
                        if (answer.dropReward.name == '调料包' && minNum <= answer.dropReward.minNum) {
                            minNum = answer.dropReward.minNum;
                            jsonId = answer.jsonId;
                        }
                    }
                    console.log(`选择事件:${jsonId}`)
                    let up = await commonGet(`/common/take-risk/up?jsonId=${jsonId}`,{jsonId: jsonId})
                    for (const answer of up.data.gameMapEvent.gameMapEventAnswerList) {
                        if (answer.jsonId == jsonId) {
                            console.log(`获得：${answer.dropReward.name} * ${answer.dropReward.finalNum}`)
                        }
                    }
                } else if (go.data.eventId == 216) {
                    console.log("获得旅行手册")
                    console.log(go.data.gameMapEvent.gameMapEventAnswerList)
                } else {
                    console.log(go.data.eventId)
                    console.log(go.data.gameMapEvent.gameMapEventAnswerList)
                }
            }
        }
        //拜访
        console.log("————————————")
        console.log("拜访")
        //获取朋友列表
        let findFriend = await commonGet("/friend/findFriend")
        //添加朋友
        console.log("开始添加朋友")
        for (const helpUser of helpTask) {
            if (helpUser == userInfo.data.userId) {
                continue
            }
            if (!findFriend.data.friendList.find(item => item.userId == helpUser)) {
                let addShareFriend = await commonGet(`/friend/addShareFriend?friendUserId=${helpUser}`,{friendUserId: helpUser})
                console.log(addShareFriend)
            }
        }
        for (const friend of findFriend.data.friendList) {
            //拜访
            if (!friend.stealFlag) {
                continue
            }
            console.log(`拜访朋友：${friend.userId}`)
            let visit = await commonGet(`/user-land/getByUserId?userId=${friend.userId}`,{userId: friend.userId})
            if (visit.code == 0) {
                let slide = true;
                while (slide) {
                    let stealGold = await commonGet(`/friend/stealGold?friendUserId=${friend.userId}`,{friendUserId: friend.userId})
                    if (stealGold.code == 4000) {
                        if (!stealGold.data.slideImgInfo) {
                            console.log("验证失败导致部分功能暂时用不了")
                            break
                        }
                        console.log(`拜访成功`)
                        console.log("触发滑块验证")
                        let data = stealGold.data.slideImgInfo;
                        let getXpos = await slidePost('huakuai.xzxxn7.live',{'gap': data.slidingImage, 'bg': data.backImage})
                        if (!getXpos) {
                            getXpos = await slidePost('107.22.24.202:9999',{'gap': data.slidingImage, 'bg': data.backImage})
                            if (!getXpos) {
                                console.log("滑块验证服务不在运行，请联系作者")
                                $.msg($.name, `滑块验证服务不在运行，请联系作者`);
                                break
                            }
                        }
                        console.log(getXpos)
                        let checkUserCapCode = await commonPost(`/checkUserCapCode`,{"xpos":getXpos.x_coordinate})
                        console.log(`获得：调料包 * ${checkUserCapCode.data}`)
                    } else if (stealGold.code == 0) {
                        slide = false;
                        console.log(`拜访成功`)
                        console.log(`获得：调料包 * ${stealGold.data}`)
                    } else {
                        slide = false;
                        console.log(stealGold.message)
                        break
                    }
                }
            } else {
                console.log(visit)
            }
        }
        console.log("————————————")
        console.log("开始幸运抽奖")
        let activity = await commonGet("/activity/find?type=1", {type: 1})
        for (const prize of activity.data.lotteryPrizeConfigList) {
            console.log(`礼品：${prize.name} 库存：[${prize.usableStock}/${prize.stock}]`)
        }
        if (lottery) {
            let id = activity.data.id;
            let count = activity.data.drawCount - activity.data.userDrawCount;
            for (let i = 0; i < count; i++) {
                let slide = true;
                while (slide) {
                    let draw = await commonGet(`/activity/draw?id=${id}`, {id: id})
                    if (draw.code == 4000) {
                        if (!draw.data.slideImgInfo) {
                            console.log("验证失败导致部分功能暂时用不了")
                            break
                        }
                        console.log("触发滑块验证")
                        let data = draw.data.slideImgInfo;
                        let getXpos = await slidePost('huakuai.xzxxn7.live',{'gap': data.slidingImage, 'bg': data.backImage})
                        if (!getXpos) {
                            getXpos = await slidePost('107.22.24.202:9999',{'gap': data.slidingImage, 'bg': data.backImage})
                            if (!getXpos) {
                                console.log("滑块验证服务不在运行，请联系作者")
                                $.msg($.name, `滑块验证服务不在运行，请联系作者`);
                                break
                            }
                        }
                        console.log(getXpos)
                        let checkUserCapCode = await commonPost(`/checkUserCapCode`,{"xpos":getXpos.x_coordinate})
                        console.log(`获得：调料包 * ${checkUserCapCode.data}`)
                    } else if (draw.code == 0) {
                        slide = false;
                        console.log(`抽奖获得：${draw.data.name}`)
                        if (draw.data.type == 2) {
                            $.msg($.name, `用户：${wid}`, `抽奖获得：${draw.data.name}`);
                        }
                    } else {
                        slide = false;
                        console.log(draw.message)
                        break
                    }
                }
            }
        } else {
            console.log("土地和角色没有全部解锁，不参与抽奖")
        }
        console.log("————————————")
        console.log("获取库存信息")
        let get = await commonGet("/userInfo/get")
        console.log(`每日任务助力码：${get.data.userId}`)
        console.log(`调料包：${get.data.gold} 番茄：${get.data.score} 阳光：${get.data.sun}\n`)
        notice += `用户：${wid} 拥有调料包：${get.data.gold} 番茄：${get.data.score} 阳光：${get.data.sun}\n`;
    }
    if (notice) {
        $.msg($.name, '', notice);
    }
}

async function getCookie() {
    const body = $.toObj($request.body);
    if (!body.wid || !body.thirdId) {
        return
    }
    const i = QieHuang_Body.findIndex(e => e.wid == body.wid);
    if (i == -1) {
        QieHuang_Body.push(body)
        console.log(`新增用户：${body.wid}`)
        $.msg($.name, `🎉新增用户${body.wid}成功!`, ``);
        $.setjson(QieHuang_Body, "QieHuang_Body");
    }
}

async function commonGet(url,query = {}) {
    return new Promise( resolve => {
        let params = getSign(query, null);
        const options = {
            url: `https://qiehuang-apig.xiaoyisz.com/qiehuangsecond/ga${url}`,
            headers: {
                "Connection": "keep-alive",
                "client_id": "game",
                "timestamp": params.timestamp,
                "nonstr": params.nonstr,
                "Authorization": token,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF WindowsWechat(0x6309092b) XWEB/9079",
                "sign": params.sign,
                "content-type": "application/json",
                "Accept": "*/*",
                "Origin": "https://thekingoftomato.ioutu.cn",
                "Sec-Fetch-Site": "cross-site",
                "Sec-Fetch-Mode": "cors",
                "Sec-Fetch-Dest": "empty",
                "Referer": "https://thekingoftomato.ioutu.cn/",
                "Accept-Encoding": "gzip, deflate, br",
                "Accept-Language": "zh-CN,zh;q=0.9",
            },
        }
        $.get(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    await $.wait(2000);
                    resolve(JSON.parse(data));
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve();
            }
        })
    })
}

async function commonPost(url,body) {
    return new Promise(resolve => {
        let  params = getSign({}, body);
        const options = {
            url: `https://qiehuang-apig.xiaoyisz.com/qiehuangsecond/ga${url}`,
            headers: {
                "sign": params.sign,
                "Accept": "*/*",
                "timestamp": params.timestamp,
                "Authorization": token,
                "Sec-Fetch-Site": "cross-site",
                "Accept-Language": "zh-CN,zh;q=0.9",
                "Accept-Encoding": "gzip, deflate, br",
                "Sec-Fetch-Mode": "cors",
                "content-type": "application/json",
                "Origin": "https://thekingoftomato.ioutu.cn",
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.47(0x18002f2c) NetType/WIFI Language/zh_CN miniProgram/wx532ecb3bdaaf92f9",
                "client_id": "game",
                "Referer": "https://thekingoftomato.ioutu.cn/",
                "Connection": "keep-alive",
                "nonstr": params.nonstr,
                "Sec-Fetch-Dest": "empty",
            },
            body:JSON.stringify(body)
        }
        $.post(options, (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    resolve(JSON.parse(data));
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve();
            }
        })
    })
}

async function slidePost(url,body) {
    return new Promise(resolve => {
        let  params = getSign({}, body);
        const options = {
            url: `http://${url}/detect_slider_position`,
            headers: {
                'Content-Type': 'application/json',
            },
            body:JSON.stringify(body)
        }
        $.post(options, (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    resolve(JSON.parse(data));
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve();
            }
        })
    })
}

function getSign(params = {}, body = null, client_id = "game") {
    const characters = "0123456789qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM";
    let sortedParams = [];
    for (let key of Object.keys(params).sort()) {
        sortedParams.push(
            key + "=" + (params[key] instanceof Object ? JSON.stringify(params[key]) : params[key])
        );
    }
    let secret = "BxzTx45uIGT25TTHIIBU2";
    let timestamp = Date.now();
    let timestampString = timestamp.toString().slice(-3);
    let secretArray = secret.split("");
    for (let digit of timestampString) {
        secretArray.splice(parseInt(digit), 0, digit);
    }
    let hashedSecret = md5Hash(secretArray.join("")).toString();
    let signObject = {
        "client_id": client_id,
        "nonstr": randomString(16, characters),
        "timestamp": timestamp,
        "body": body ? JSON.stringify(body) : "",
        "query": sortedParams.length ? sortedParams.join("&") : "",
        "secret": hashedSecret,
    };
    let signString = Object.values(signObject).join("|");
    return {
        "client_id": client_id,
        "timestamp": (signObject.timestamp).toString(),
        "nonstr": signObject.nonstr,
        "sign": md5Hash(signString).toString().toUpperCase(),
    };
}

function randomString(length, characters = "abcdef0123456789") {
    let result = "";
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

function md5Hash(str, charsetName) {
    return hex_md5(str)
}

function hex_md5(r){return rstr2hex(rstr_md5(str2rstr_utf8(r)))}function b64_md5(r){return rstr2b64(rstr_md5(str2rstr_utf8(r)))}function any_md5(r,t){return rstr2any(rstr_md5(str2rstr_utf8(r)),t)}function hex_hmac_md5(r,t){return rstr2hex(rstr_hmac_md5(str2rstr_utf8(r),str2rstr_utf8(t)))}function b64_hmac_md5(r,t){return rstr2b64(rstr_hmac_md5(str2rstr_utf8(r),str2rstr_utf8(t)))}function any_hmac_md5(r,t,d){return rstr2any(rstr_hmac_md5(str2rstr_utf8(r),str2rstr_utf8(t)),d)}function md5_vm_test(){return"900150983cd24fb0d6963f7d28e17f72"==hex_md5("abc").toLowerCase()}function rstr_md5(r){return binl2rstr(binl_md5(rstr2binl(r),8*r.length))}function rstr_hmac_md5(r,t){var d=rstr2binl(r);d.length>16&&(d=binl_md5(d,8*r.length));for(var n=Array(16),_=Array(16),m=0;m<16;m++)n[m]=909522486^d[m],_[m]=1549556828^d[m];var f=binl_md5(n.concat(rstr2binl(t)),512+8*t.length);return binl2rstr(binl_md5(_.concat(f),640))}function rstr2hex(r){for(var t,d=hexcase?"0123456789ABCDEF":"0123456789abcdef",n="",_=0;_<r.length;_++)t=r.charCodeAt(_),n+=d.charAt(t>>>4&15)+d.charAt(15&t);return n}function rstr2b64(r){for(var t="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",d="",n=r.length,_=0;_<n;_+=3)for(var m=r.charCodeAt(_)<<16|(_+1<n?r.charCodeAt(_+1)<<8:0)|(_+2<n?r.charCodeAt(_+2):0),f=0;f<4;f++)8*_+6*f>8*r.length?d+=b64pad:d+=t.charAt(m>>>6*(3-f)&63);return d}function rstr2any(r,t){var d,n,_,m,f,h=t.length,e=Array(Math.ceil(r.length/2));for(d=0;d<e.length;d++)e[d]=r.charCodeAt(2*d)<<8|r.charCodeAt(2*d+1);var a=Math.ceil(8*r.length/(Math.log(t.length)/Math.log(2))),i=Array(a);for(n=0;n<a;n++){for(f=Array(),m=0,d=0;d<e.length;d++)m=(m<<16)+e[d],_=Math.floor(m/h),m-=_*h,(f.length>0||_>0)&&(f[f.length]=_);i[n]=m,e=f}var o="";for(d=i.length-1;d>=0;d--)o+=t.charAt(i[d]);return o}function str2rstr_utf8(r){for(var t,d,n="",_=-1;++_<r.length;)t=r.charCodeAt(_),d=_+1<r.length?r.charCodeAt(_+1):0,55296<=t&&t<=56319&&56320<=d&&d<=57343&&(t=65536+((1023&t)<<10)+(1023&d),_++),t<=127?n+=String.fromCharCode(t):t<=2047?n+=String.fromCharCode(192|t>>>6&31,128|63&t):t<=65535?n+=String.fromCharCode(224|t>>>12&15,128|t>>>6&63,128|63&t):t<=2097151&&(n+=String.fromCharCode(240|t>>>18&7,128|t>>>12&63,128|t>>>6&63,128|63&t));return n}function str2rstr_utf16le(r){for(var t="",d=0;d<r.length;d++)t+=String.fromCharCode(255&r.charCodeAt(d),r.charCodeAt(d)>>>8&255);return t}function str2rstr_utf16be(r){for(var t="",d=0;d<r.length;d++)t+=String.fromCharCode(r.charCodeAt(d)>>>8&255,255&r.charCodeAt(d));return t}function rstr2binl(r){for(var t=Array(r.length>>2),d=0;d<t.length;d++)t[d]=0;for(d=0;d<8*r.length;d+=8)t[d>>5]|=(255&r.charCodeAt(d/8))<<d%32;return t}function binl2rstr(r){for(var t="",d=0;d<32*r.length;d+=8)t+=String.fromCharCode(r[d>>5]>>>d%32&255);return t}function binl_md5(r,t){r[t>>5]|=128<<t%32,r[14+(t+64>>>9<<4)]=t;for(var d=1732584193,n=-271733879,_=-1732584194,m=271733878,f=0;f<r.length;f+=16){var h=d,e=n,a=_,i=m;d=md5_ff(d,n,_,m,r[f+0],7,-680876936),m=md5_ff(m,d,n,_,r[f+1],12,-389564586),_=md5_ff(_,m,d,n,r[f+2],17,606105819),n=md5_ff(n,_,m,d,r[f+3],22,-1044525330),d=md5_ff(d,n,_,m,r[f+4],7,-176418897),m=md5_ff(m,d,n,_,r[f+5],12,1200080426),_=md5_ff(_,m,d,n,r[f+6],17,-1473231341),n=md5_ff(n,_,m,d,r[f+7],22,-45705983),d=md5_ff(d,n,_,m,r[f+8],7,1770035416),m=md5_ff(m,d,n,_,r[f+9],12,-1958414417),_=md5_ff(_,m,d,n,r[f+10],17,-42063),n=md5_ff(n,_,m,d,r[f+11],22,-1990404162),d=md5_ff(d,n,_,m,r[f+12],7,1804603682),m=md5_ff(m,d,n,_,r[f+13],12,-40341101),_=md5_ff(_,m,d,n,r[f+14],17,-1502002290),n=md5_ff(n,_,m,d,r[f+15],22,1236535329),d=md5_gg(d,n,_,m,r[f+1],5,-165796510),m=md5_gg(m,d,n,_,r[f+6],9,-1069501632),_=md5_gg(_,m,d,n,r[f+11],14,643717713),n=md5_gg(n,_,m,d,r[f+0],20,-373897302),d=md5_gg(d,n,_,m,r[f+5],5,-701558691),m=md5_gg(m,d,n,_,r[f+10],9,38016083),_=md5_gg(_,m,d,n,r[f+15],14,-660478335),n=md5_gg(n,_,m,d,r[f+4],20,-405537848),d=md5_gg(d,n,_,m,r[f+9],5,568446438),m=md5_gg(m,d,n,_,r[f+14],9,-1019803690),_=md5_gg(_,m,d,n,r[f+3],14,-187363961),n=md5_gg(n,_,m,d,r[f+8],20,1163531501),d=md5_gg(d,n,_,m,r[f+13],5,-1444681467),m=md5_gg(m,d,n,_,r[f+2],9,-51403784),_=md5_gg(_,m,d,n,r[f+7],14,1735328473),n=md5_gg(n,_,m,d,r[f+12],20,-1926607734),d=md5_hh(d,n,_,m,r[f+5],4,-378558),m=md5_hh(m,d,n,_,r[f+8],11,-2022574463),_=md5_hh(_,m,d,n,r[f+11],16,1839030562),n=md5_hh(n,_,m,d,r[f+14],23,-35309556),d=md5_hh(d,n,_,m,r[f+1],4,-1530992060),m=md5_hh(m,d,n,_,r[f+4],11,1272893353),_=md5_hh(_,m,d,n,r[f+7],16,-155497632),n=md5_hh(n,_,m,d,r[f+10],23,-1094730640),d=md5_hh(d,n,_,m,r[f+13],4,681279174),m=md5_hh(m,d,n,_,r[f+0],11,-358537222),_=md5_hh(_,m,d,n,r[f+3],16,-722521979),n=md5_hh(n,_,m,d,r[f+6],23,76029189),d=md5_hh(d,n,_,m,r[f+9],4,-640364487),m=md5_hh(m,d,n,_,r[f+12],11,-421815835),_=md5_hh(_,m,d,n,r[f+15],16,530742520),n=md5_hh(n,_,m,d,r[f+2],23,-995338651),d=md5_ii(d,n,_,m,r[f+0],6,-198630844),m=md5_ii(m,d,n,_,r[f+7],10,1126891415),_=md5_ii(_,m,d,n,r[f+14],15,-1416354905),n=md5_ii(n,_,m,d,r[f+5],21,-57434055),d=md5_ii(d,n,_,m,r[f+12],6,1700485571),m=md5_ii(m,d,n,_,r[f+3],10,-1894986606),_=md5_ii(_,m,d,n,r[f+10],15,-1051523),n=md5_ii(n,_,m,d,r[f+1],21,-2054922799),d=md5_ii(d,n,_,m,r[f+8],6,1873313359),m=md5_ii(m,d,n,_,r[f+15],10,-30611744),_=md5_ii(_,m,d,n,r[f+6],15,-1560198380),n=md5_ii(n,_,m,d,r[f+13],21,1309151649),d=md5_ii(d,n,_,m,r[f+4],6,-145523070),m=md5_ii(m,d,n,_,r[f+11],10,-1120210379),_=md5_ii(_,m,d,n,r[f+2],15,718787259),n=md5_ii(n,_,m,d,r[f+9],21,-343485551),d=safe_add(d,h),n=safe_add(n,e),_=safe_add(_,a),m=safe_add(m,i)}return Array(d,n,_,m)}function md5_cmn(r,t,d,n,_,m){return safe_add(bit_rol(safe_add(safe_add(t,r),safe_add(n,m)),_),d)}function md5_ff(r,t,d,n,_,m,f){return md5_cmn(t&d|~t&n,r,t,_,m,f)}function md5_gg(r,t,d,n,_,m,f){return md5_cmn(t&n|d&~n,r,t,_,m,f)}function md5_hh(r,t,d,n,_,m,f){return md5_cmn(t^d^n,r,t,_,m,f)}function md5_ii(r,t,d,n,_,m,f){return md5_cmn(d^(t|~n),r,t,_,m,f)}function safe_add(r,t){var d=(65535&r)+(65535&t),n=(r>>16)+(t>>16)+(d>>16);return n<<16|65535&d}function bit_rol(r,t){return r<<t|r>>>32-t}var hexcase=0,b64pad="";

function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,a)=>{s.call(this,t,(t,s,r)=>{t?a(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}getEnv(){return"undefined"!=typeof $environment&&$environment["surge-version"]?"Surge":"undefined"!=typeof $environment&&$environment["stash-version"]?"Stash":"undefined"!=typeof module&&module.exports?"Node.js":"undefined"!=typeof $task?"Quantumult X":"undefined"!=typeof $loon?"Loon":"undefined"!=typeof $rocket?"Shadowrocket":void 0}isNode(){return"Node.js"===this.getEnv()}isQuanX(){return"Quantumult X"===this.getEnv()}isSurge(){return"Surge"===this.getEnv()}isLoon(){return"Loon"===this.getEnv()}isShadowrocket(){return"Shadowrocket"===this.getEnv()}isStash(){return"Stash"===this.getEnv()}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const a=this.getdata(t);if(a)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,a)=>e(a))})}runScript(t,e){return new Promise(s=>{let a=this.getdata("@chavy_boxjs_userCfgs.httpapi");a=a?a.replace(/\n/g,"").trim():a;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[i,o]=a.split("@"),n={url:`http://${o}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":i,Accept:"*/*"},timeout:r};this.post(n,(t,e,a)=>s(a))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),a=!s&&this.fs.existsSync(e);if(!s&&!a)return{};{const a=s?t:e;try{return JSON.parse(this.fs.readFileSync(a))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),a=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):a?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const a=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of a)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,a)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[a+1])>>0==+e[a+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,a]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,a,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,a,r]=/^@(.*?)\.(.*?)$/.exec(e),i=this.getval(a),o=a?"null"===i?null:i||"{}":"{}";try{const e=JSON.parse(o);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),a)}catch(e){const i={};this.lodash_set(i,r,t),s=this.setval(JSON.stringify(i),a)}}else s=this.setval(t,e);return s}getval(t){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.read(t);case"Quantumult X":return $prefs.valueForKey(t);case"Node.js":return this.data=this.loaddata(),this.data[t];default:return this.data&&this.data[t]||null}}setval(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.write(t,e);case"Quantumult X":return $prefs.setValueForKey(t,e);case"Node.js":return this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0;default:return this.data&&this.data[e]||null}}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){switch(t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"],delete t.headers["content-type"],delete t.headers["content-length"]),t.params&&(t.url+="?"+this.queryStr(t.params)),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,a)=>{!t&&s&&(s.body=a,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,a)});break;case"Quantumult X":this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:a,headers:r,body:i,bodyBytes:o}=t;e(null,{status:s,statusCode:a,headers:r,body:i,bodyBytes:o},i,o)},t=>e(t&&t.error||"UndefinedError"));break;case"Node.js":let s=require("iconv-lite");this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:a,statusCode:r,headers:i,rawBody:o}=t,n=s.decode(o,this.encoding);e(null,{status:a,statusCode:r,headers:i,rawBody:o,body:n},n)},t=>{const{message:a,response:r}=t;e(a,r,r&&s.decode(r.rawBody,this.encoding))})}}post(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"post";switch(t.body&&t.headers&&!t.headers["Content-Type"]&&!t.headers["content-type"]&&(t.headers["content-type"]="application/x-www-form-urlencoded"),t.headers&&(delete t.headers["Content-Length"],delete t.headers["content-length"]),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](t,(t,s,a)=>{!t&&s&&(s.body=a,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,a)});break;case"Quantumult X":t.method=s,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:a,headers:r,body:i,bodyBytes:o}=t;e(null,{status:s,statusCode:a,headers:r,body:i,bodyBytes:o},i,o)},t=>e(t&&t.error||"UndefinedError"));break;case"Node.js":let a=require("iconv-lite");this.initGotEnv(t);const{url:r,...i}=t;this.got[s](r,i).then(t=>{const{statusCode:s,statusCode:r,headers:i,rawBody:o}=t,n=a.decode(o,this.encoding);e(null,{status:s,statusCode:r,headers:i,rawBody:o,body:n},n)},t=>{const{message:s,response:r}=t;e(s,r,r&&a.decode(r.rawBody,this.encoding))})}}time(t,e=null){const s=e?new Date(e):new Date;let a={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in a)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?a[e]:("00"+a[e]).substr((""+a[e]).length)));return t}queryStr(t){let e="";for(const s in t){let a=t[s];null!=a&&""!==a&&("object"==typeof a&&(a=JSON.stringify(a)),e+=`${s}=${a}&`)}return e=e.substring(0,e.length-1),e}msg(e=t,s="",a="",r){const i=t=>{switch(typeof t){case void 0:return t;case"string":switch(this.getEnv()){case"Surge":case"Stash":default:return{url:t};case"Loon":case"Shadowrocket":return t;case"Quantumult X":return{"open-url":t};case"Node.js":return}case"object":switch(this.getEnv()){case"Surge":case"Stash":case"Shadowrocket":default:{let e=t.url||t.openUrl||t["open-url"];return{url:e}}case"Loon":{let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}case"Quantumult X":{let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl,a=t["update-pasteboard"]||t.updatePasteboard;return{"open-url":e,"media-url":s,"update-pasteboard":a}}case"Node.js":return}default:return}};if(!this.isMute)switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:$notification.post(e,s,a,i(r));break;case"Quantumult X":$notify(e,s,a,i(r));break;case"Node.js":}if(!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),a&&t.push(a),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:this.log("",`❗️${this.name}, 错误!`,t);break;case"Node.js":this.log("",`❗️${this.name}, 错误!`,t.stack)}}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;switch(this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:$done(t);break;case"Node.js":process.exit(1)}}}(t,e)}
