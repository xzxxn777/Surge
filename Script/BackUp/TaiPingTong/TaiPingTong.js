const $ = new Env("太平通");
let TaiPingTong = ($.isNode() ? process.env.TaiPingTong : $.getjson("TaiPingTong")) || [];
!(async () => {
    if (typeof $request != "undefined") {
        await getCookie();
    } else {
        await main();
    }
})().catch((e) => {$.log(e)}).finally(() => {$.done({});});

async function main() {
    console.log('作者：@xzxxn777\n频道：https://t.me/xzxxn777\n群组：https://t.me/xzxxn7777\n自用机场推荐：https://xn--diqv0fut7b.com\n')
    for (const item of TaiPingTong) {
        token = item.token;
        userId = item.userId;
        console.log(`用户：${userId}开始任务`)
        //签到
        console.log("开始签到")
        let sign = await commonPost('/campaignsms/couponAndsign');
        if (sign.code != "0000") {
            console.log(sign.desc)
            continue
        }
        if (sign.data.dailySignRsp.message) {
            console.log(sign.data.dailySignRsp.message);
        } else {
            console.log("今日已签到");
        }
        //抽奖
        console.log("————————————")
        console.log("开始抽奖")
        let giftBag = await commonPost('/campaignsms/dailySign/giftBag');
        for (const item of giftBag.data) {
            console.log(`签到${item.continueDay}天 状态：${item.status}`)
            if (item.status == 1) {
                let activityCode = item.activityCode;
                let registerAndLogin = await lotteryPost("/tptplaybox/api/account/registerAndLogin",{"activityCode":activityCode,"phone":"","smsCode":"","ticket":"","thirdAccount":token,"registerData":{}},"",activityCode);
                let accessKey = registerAndLogin.value.accessKey;
                let businessInfo = JSON.stringify({"xCubeActivityCode":activityCode,"shareCode":""});
                let lottery = await lotteryPost('/tptplaybox/api/activity/lottery',{"activityCode":activityCode,"lotteryMap":{"businessInfo":`${businessInfo}`}},accessKey,activityCode);
                if (lottery.success) {
                    console.log(`获得：${lottery.value[0].prizeName}`);
                } else {
                    console.log(lottery.errorMsg);
                }
            } else if (item.status == 2) {
                console.log("已抽奖");
            } else {
                console.log("签到时间不足");
            }
        }
        //话题PK
        console.log("————————————")
        console.log("开始话题PK")
        let latestTopTopic = await commonGet('/campaignsms/tPkTopicAppointment/latestTopTopic');
        if (latestTopTopic.data.length > 0 && latestTopTopic.data[0].isParticipateIn != 1) {
            let standInLineTopic = await commonPost('/campaignsms/tPkTopicAppointment/standInLineTopic',{"joinPoint":latestTopTopic.data[0].joinWin,"id":latestTopTopic.data[0].id,"dataFrom":0});
            console.log(standInLineTopic);
            //console.log(standInLineTopic.data.topicCoin)
        }
        //做任务
        console.log("————————————")
        console.log("开始做任务")
        let taskList = await commonPost('/campaignsms/goldParty/task/list',{"activityNumber":"goldCoinParty","rewardFlag":"1","openMsgRemind":1});
        for (const task of taskList.data.taskList) {
            console.log(`任务：${task.name} id：${task.taskId}`)
            if (task.taskStatus == 1) {
                console.log("领取任务奖励");
                let taskReward = await commonPost('/campaignsms/goldParty/goldCoin/add',{"taskIds":[task.taskId]});
                console.log(taskReward);
            } else if (task.taskStatus == 2) {
                console.log("任务已完成");
            } else {
                console.log("开始任务");
                //分享海报
                if (task.taskId == 23) {
                    let listPlatformGroupRet = await commonPost('/campaignsms/posterDetail/v2/listPlatformGroupRet?pId=2');
                    console.log(listPlatformGroupRet);
                    let listPosterProfession = await commonPost('/campaignsms/posterPotfession/listPosterProfession',{"pid":"2","gid":listPlatformGroupRet.data[0].id,"pageNum":1,"pageSize":15});
                    console.log(listPosterProfession);
                    let getPosterProfessionDetail = await commonPost('/campaignsms/posterPotfession/getPosterProfessionDetail',{"pfPosterId":listPosterProfession.data.list[0].pfPosterId,"spCode":"TPT","enviroment":"1","shareUserId":userId});
                    console.log(getPosterProfessionDetail);
                }
                let finish = await commonPost('/campaignsms/goldParty/task/finish',{"taskId":[task.taskId]});
                console.log(finish);
                console.log("领取任务奖励");
                let taskReward = await commonPost('/campaignsms/goldParty/goldCoin/add',{"taskIds":[task.taskId]});
                console.log(taskReward);
            }
        }
        //阅读文章
        console.log("————————————")
        console.log("开始阅读")
        let informationms = await commonPost("/informationms/app/config/get/1",{"city":"1","pageSize":10,"type":"GENERAL_PLUGIN","trackDesc":"赚金币任务","plugInId":"701b3099297148a8ba979ad9c982b561"})
        for (const item of informationms.data) {
            console.log(`文章：${item.cell[0][0].title}`)
            let articleId = item.cell[0][0].contentId;
            let serviceNo = item.cell[0][0].serviceNo;
            let coinInfoV2 = await commonPost('/informationms/app/v2/article/web/coinInfoV2',{"articleId":articleId,"source":"TPT","detailUrl":`https://ecustomercdn.itaiping.com/static/newscontent/#/info?articleId=${articleId}&source=TPT&x_utmId=10013&serviceNo=${serviceNo}&x_businesskey=articleId`,"deviceId":"","version":"V2"});
            await $.wait(5000);
            let read = await commonPost('/informationms/app/v2/read/gold',{"articleId":articleId,"source":"TPT"});
            console.log(read);
        }
        //领金币
        console.log("————————————")
        console.log("开始领金币")
        let queryList = await commonPost('/campaignsms/coinBubble/queryList');
        if (queryList.data.length > 0) {
            let getAllCoins = await commonPost('/campaignsms/coinBubble/getAllCoins');
            console.log(`获得：${getAllCoins.data.coinNum}金币`);
        }
        //金币查询
        console.log("————————————")
        console.log("金币查询")
        let total = await commonPost('/campaignsms/couponAndsign');
        console.log(`拥有金币: ${total.data.dailySignRsp.integral}`)
        $.msg($.name, `用户：${userId}`, `拥有金币: ${total.data.dailySignRsp.integral}`);
    }
}

async function getCookie() {
    const token = $request.headers["x-ac-token-ticket"];
    if (!token) {
        return
    }
    const body = $.toObj($response.body);
    if (!body.data || !body.data.userId) {
        return
    }
    const newData = {"userId": body.data.userId, "token": token}
    const index = TaiPingTong.findIndex(e => e.userId == newData.userId);
    if (index !== -1) {
        if (TaiPingTong[index].token == newData.token) {
            return
        } else {
            TaiPingTong[index] = newData;
            console.log(newData.token)
            $.msg($.name, `🎉用户${newData.userId}更新token成功!`, ``);
        }
    } else {
        TaiPingTong.push(newData)
        console.log(newData.token)
        $.msg($.name, `🎉新增用户${newData.userId}成功!`, ``);
    }
    $.setjson(TaiPingTong, "TaiPingTong");
}

async function commonPost(url,body = {}) {
    return new Promise(resolve => {
        const options = {
            url: `https://ecustomer.cntaiping.com${url}`,
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "x-ac-black-box": "",
                "x-ac-token-ticket": token,
                "Sec-Fetch-Site": "cross-site",
                "x-ac-channel-id": "KHT",
                "Accept-Language": "zh-CN,zh-Hans;q=0.9",
                "Accept-Encoding": "gzip, deflate, br",
                "Sec-Fetch-Mode": "cors",
                "content-type": "application/json",
                "Origin": "https://ecustomercdn.itaiping.com",
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;yuangongejia#ios#kehutong#CZBIOS",
                "Referer": "https://ecustomercdn.itaiping.com/",
                "x-ac-mc-type": "gateway.user",
                "Content-Length": "2",
                "Connection": "keep-alive",
                "Sec-Fetch-Dest": "empty",
            },
            body:JSON.stringify(body)
        }
        $.post(options, async (err, resp, data) => {
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

async function commonGet(url) {
    return new Promise(resolve => {
        const options = {
            url: `https://ecustomer.cntaiping.com${url}`,
            headers: {
                "Accept": "application/json;charset=UTF-8",
                "x-ac-black-box": "",
                "x-ac-token-ticket": token,
                "Sec-Fetch-Site": "cross-site",
                "x-ac-channel-id": "KHT",
                "Accept-Language": "zh-CN,zh-Hans;q=0.9",
                "Accept-Encoding": "gzip, deflate, br",
                "Sec-Fetch-Mode": "cors",
                "content-type": "application/json",
                "Origin": "https://ecustomercdn.itaiping.com",
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;yuangongejia#ios#kehutong#CZBIOS",
                "Referer": "https://ecustomercdn.itaiping.com/",
                "x-ac-mc-type": "gateway.user",
                "Content-Length": "2",
                "Connection": "keep-alive",
                "Sec-Fetch-Dest": "empty",
            }
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

async function lotteryPost(url,body = {},accessKey,activityCode) {
    return new Promise(resolve => {
        const options = {
            url: `https://ecustomer.cntaiping.com${url}`,
            headers: {
                "Accept": "*/*",
                "x-ac-black-box": "vWPVl171271266676flmcpAmJa",
                "channel": 0,
                "Sec-Fetch-Site": "cross-site",
                "accessKey": accessKey,
                "activityCode": activityCode,
                "Accept-Language": "zh-CN,zh-Han,s;q=0.9",
                "Accept-Encoding": "gzip, deflate, br",
                "Sec-Fetch-Mode": "cors",
                "platform": "",
                "Origin": "https://ecustomercdn.itaiping.com",
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;yuangongejia#ios#kehutong#CZBIOS",
                "Referer": "https://ecustomercdn.itaiping.com/",
                "tokenkey": token,
                "Connection": "keep-alive",
                "Sec-Fetch-Dest": "empty",
                "Content-Type": "application/json"
            },
            body:JSON.stringify(body)
        }
        $.post(options, async (err, resp, data) => {
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

function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,a)=>{s.call(this,t,(t,s,r)=>{t?a(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}getEnv(){return"undefined"!=typeof $environment&&$environment["surge-version"]?"Surge":"undefined"!=typeof $environment&&$environment["stash-version"]?"Stash":"undefined"!=typeof module&&module.exports?"Node.js":"undefined"!=typeof $task?"Quantumult X":"undefined"!=typeof $loon?"Loon":"undefined"!=typeof $rocket?"Shadowrocket":void 0}isNode(){return"Node.js"===this.getEnv()}isQuanX(){return"Quantumult X"===this.getEnv()}isSurge(){return"Surge"===this.getEnv()}isLoon(){return"Loon"===this.getEnv()}isShadowrocket(){return"Shadowrocket"===this.getEnv()}isStash(){return"Stash"===this.getEnv()}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const a=this.getdata(t);if(a)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,a)=>e(a))})}runScript(t,e){return new Promise(s=>{let a=this.getdata("@chavy_boxjs_userCfgs.httpapi");a=a?a.replace(/\n/g,"").trim():a;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[i,o]=a.split("@"),n={url:`http://${o}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":i,Accept:"*/*"},timeout:r};this.post(n,(t,e,a)=>s(a))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),a=!s&&this.fs.existsSync(e);if(!s&&!a)return{};{const a=s?t:e;try{return JSON.parse(this.fs.readFileSync(a))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),a=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):a?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const a=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of a)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,a)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[a+1])>>0==+e[a+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,a]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,a,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,a,r]=/^@(.*?)\.(.*?)$/.exec(e),i=this.getval(a),o=a?"null"===i?null:i||"{}":"{}";try{const e=JSON.parse(o);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),a)}catch(e){const i={};this.lodash_set(i,r,t),s=this.setval(JSON.stringify(i),a)}}else s=this.setval(t,e);return s}getval(t){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.read(t);case"Quantumult X":return $prefs.valueForKey(t);case"Node.js":return this.data=this.loaddata(),this.data[t];default:return this.data&&this.data[t]||null}}setval(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.write(t,e);case"Quantumult X":return $prefs.setValueForKey(t,e);case"Node.js":return this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0;default:return this.data&&this.data[e]||null}}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){switch(t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"],delete t.headers["content-type"],delete t.headers["content-length"]),t.params&&(t.url+="?"+this.queryStr(t.params)),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,a)=>{!t&&s&&(s.body=a,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,a)});break;case"Quantumult X":this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:a,headers:r,body:i,bodyBytes:o}=t;e(null,{status:s,statusCode:a,headers:r,body:i,bodyBytes:o},i,o)},t=>e(t&&t.error||"UndefinedError"));break;case"Node.js":let s=require("iconv-lite");this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:a,statusCode:r,headers:i,rawBody:o}=t,n=s.decode(o,this.encoding);e(null,{status:a,statusCode:r,headers:i,rawBody:o,body:n},n)},t=>{const{message:a,response:r}=t;e(a,r,r&&s.decode(r.rawBody,this.encoding))})}}post(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"post";switch(t.body&&t.headers&&!t.headers["Content-Type"]&&!t.headers["content-type"]&&(t.headers["content-type"]="application/x-www-form-urlencoded"),t.headers&&(delete t.headers["Content-Length"],delete t.headers["content-length"]),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](t,(t,s,a)=>{!t&&s&&(s.body=a,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,a)});break;case"Quantumult X":t.method=s,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:a,headers:r,body:i,bodyBytes:o}=t;e(null,{status:s,statusCode:a,headers:r,body:i,bodyBytes:o},i,o)},t=>e(t&&t.error||"UndefinedError"));break;case"Node.js":let a=require("iconv-lite");this.initGotEnv(t);const{url:r,...i}=t;this.got[s](r,i).then(t=>{const{statusCode:s,statusCode:r,headers:i,rawBody:o}=t,n=a.decode(o,this.encoding);e(null,{status:s,statusCode:r,headers:i,rawBody:o,body:n},n)},t=>{const{message:s,response:r}=t;e(s,r,r&&a.decode(r.rawBody,this.encoding))})}}time(t,e=null){const s=e?new Date(e):new Date;let a={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in a)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?a[e]:("00"+a[e]).substr((""+a[e]).length)));return t}queryStr(t){let e="";for(const s in t){let a=t[s];null!=a&&""!==a&&("object"==typeof a&&(a=JSON.stringify(a)),e+=`${s}=${a}&`)}return e=e.substring(0,e.length-1),e}msg(e=t,s="",a="",r){const i=t=>{switch(typeof t){case void 0:return t;case"string":switch(this.getEnv()){case"Surge":case"Stash":default:return{url:t};case"Loon":case"Shadowrocket":return t;case"Quantumult X":return{"open-url":t};case"Node.js":return}case"object":switch(this.getEnv()){case"Surge":case"Stash":case"Shadowrocket":default:{let e=t.url||t.openUrl||t["open-url"];return{url:e}}case"Loon":{let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}case"Quantumult X":{let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl,a=t["update-pasteboard"]||t.updatePasteboard;return{"open-url":e,"media-url":s,"update-pasteboard":a}}case"Node.js":return}default:return}};if(!this.isMute)switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:$notification.post(e,s,a,i(r));break;case"Quantumult X":$notify(e,s,a,i(r));break;case"Node.js":}if(!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),a&&t.push(a),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:this.log("",`❗️${this.name}, 错误!`,t);break;case"Node.js":this.log("",`❗️${this.name}, 错误!`,t.stack)}}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;switch(this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:$done(t);break;case"Node.js":process.exit(1)}}}(t,e)}
