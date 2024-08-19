/**
 * cron "33 1,19 * * *" ZTE.js
 * export ZTE="账号1&密码1 账号2&密码2"
 * export OCR_SERVER="ocr服务"
 */
const $ = new Env('中兴手机商城');
const ZTE = ($.isNode() ? process.env.ZTE : $.getdata("ZTE")) || '';
const OCR_SERVER = ($.isNode() ? process.env.OCR_SERVER : $.getdata("OCR_SERVER")) || 'https://ddddocr.xzxxn7.live';
let Utils = undefined;
let phone = ''
let password = ''
let token = ''
let tokenArr = []
let teamIdArr = ["34e44372e6edfda4e670a8f05b81d7c7","14fa18c6c9b733043812ff5289fb2e6b","e01f22af603612704e0b049104e960d5"]
let notice = '';
!(async () => {
    await main();
})().catch((e) => {$.log(e)}).finally(() => {$.done({});});

async function main() {
    console.log('作者：@xzxxn777\n频道：https://t.me/xzxxn777\n群组：https://t.me/xzxxn7777\n自用机场推荐：https://xn--diqv0fut7b.com\n')
    if (!ZTE) {
        console.log("先去boxjs填写账号密码")
        await sendMsg('先去boxjs填写账号密码');
        return
    }
    Utils = await loadUtils();
    let arr = ZTE.split(" ");
    for (const item of arr) {
        phone = item.split("&")[0]
        password = item.split("&")[1]
        console.log(`用户：${phone}登录`)
        const encryptor = new (Utils.loadJSEncrypt());
        encryptor.setPublicKey('-----BEGIN PUBLIC KEY-----\n' +
            'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCqGKukO1De7zhZj6+H0qtjTkVxwTCpvKe4eCZ0\n' +
            'FPqri0cb2JZfXJ/DgYSF6vUpwmJG8wVQZKjeGcjDOL5UlsuusFncCzWBQ7RKNUSesmQRMSGkVb1/\n' +
            '3j+skZ6UtW+5u09lHNsj6tQ51s1SPrCBkedbNf0Tp0GbMJDyR4e9T04ZZwIDAQAB\n' +
            '-----END PUBLIC KEY-----');
        password = encodeURIComponent(encryptor.encrypt(password))
        let success = false;
        while (!success) {
            let getImage = await commonGet(`vcode_type=zteLogin&method=user.vcode&format=json&v=v1`)
            let code = await slidePost({image: (getImage.data.base64Image).split(',')[1]})
            if (!code) {
                console.log("ddddocr服务异常")
                await sendMsg('ddddocr服务异常');
                continue;
            }
            console.log(code)
            let login = await commonPost(`phone=${phone}&password=${password}&vcode=${code.result}&sessionId=${getImage.data.sess_id}&platform=app&method=zte.phone.password.login&format=json&v=v1`)
            if (login.errorcode != 0) {
                console.log(login.msg)
                continue
            }
            console.log('登录成功')
            token = login.data.accessToken;
            success = true
        }
        tokenArr.push({phone: phone, token: token})
        // let create = await commonGet('st_id=14&openid=1&tmplIds=%5B%5D&method=shareTeaming.create.team&format=json&v=v1');
        // if (create.errorcode == 0) {
        //     console.log(`创建队伍成功：${create.data.team_id}`)
        //     teamIdArr.push(create.data.team_id)
        // } else {
        //     console.log(create.msg)
        //     let getTeamId = await commonGet(`st_id=14&method=shareTeaming.get.teamId&format=json&v=v1`);
        //     console.log(`当前创建的队伍：${getTeamId.data.team_id}`)
        //     teamIdArr.push(getTeamId.data.team_id)
        // }
    }
    for (const item of tokenArr) {
        phone = item.phone;
        token = item.token;
        console.log(`\n用户：${phone}开始任务`)
        // 日常任务
        let task = await commonGet(`platform=miniapp&method=task.list&format=json&v=v1`);
        if (!task.data.checkin_info.checkin_status) {
            let checkIn = await commonGet(`method=member.checkIn.add&format=json&v=v1`);
            if (checkIn.errorcode == 0) {
                console.log(`签到成功获得：${checkIn.data.currentCheckInPoint}积分 连续签到:${task.data.checkin_info.checkin_days + 1}天`)
            } else {
                console.log(checkIn.msg)
            }
        }
        for (const itemTask of task.data.tasks) {
            console.log(`任务:${itemTask.title} ${itemTask.subtitle} 状态:${itemTask.btn.desc}`)
            switch (itemTask.btn.desc) {
                case "去参与":
                    for (const pageId of itemTask.task_data.page_ids) {
                        let start = await commonPost(`page_id=${pageId}&task_id=${itemTask.task_id}&method=task.start&format=json&v=v1`);
                        if (start?.data?.res_sec){
                            await $.wait(1000*start?.data?.res_sec)
                        }
                        let finish = await commonPost(`page_id=${pageId}&task_id=${itemTask.task_id}&method=task.finish&format=json&v=v1`);
                        if (finish.errorcode == 0) {
                            console.log(`完成任务`)
                        } else {
                            console.log(finish.msg)
                        }
                    }
                    let check = await commonGet(`task_id=${itemTask.task_id}&method=task.check&format=json&v=v1&`);
                    if (check.errorcode == 0) {
                        console.log(`领取成功`)
                    } else {
                        console.log(check.msg)
                    }
                    break
                case "立即领取":
                    check = await commonGet(`task_id=${itemTask.task_id}&method=task.check&format=json&v=v1&`);
                    if (check.errorcode == 0) {
                        console.log(`领取成功`)
                    } else {
                        console.log(check.msg)
                    }
                    break
                case "已完成":
                    break
                default:
            }
        }
        // console.log("————————————")
        // console.log("抽福袋")
        // let lotteryInfo = await commonPost(`lottery_id=66&method=promotion.lottery.get.info&format=json&v=v1`);
        // let lottery = await commonPost(`lottery_id=${lotteryInfo.data.lottery_id}&last_modified_time=${lotteryInfo.data.modified_time}&method=promotion.lottery.get.prize&format=json&v=v1`);
        // if (lottery.errorcode == 0) {
        //     console.log(`抽奖获得：${lottery.data.prizeInfo.bonus_desc}`)
        // } else {
        //     console.log(lottery.msg)
        // }
        // console.log("————————————")
        // console.log("刮刮乐")
        // let detail = await commonGet('scratchcard_id=186&method=promotion.scratchcard.detail&format=json&v=v1')
        // let prize = await commonGet(`scratchcard_id=186&last_modified_time=${detail.data.scratchcard.modified_time}&method=promotion.scratchcard.prize.gen2&format=json&v=v1`)
        // if (prize.data.success) {
        //     console.log(`刮刮乐获得：${prize.data.prizeInfo.bonus_desc}`)
        //     let scratchcard = await commonGet(`scratchcard_id=186&scratchcard_result_id=${prize.data.prizeInfo.result_id}&method=promotion.scratchcard.prize.issue2&format=json&v=v1`)
        // } else {
        //     console.log(prize.data.msg)
        // }
        // console.log("————————————")
        // console.log("组队")
        // for (const teamId of teamIdArr) {
        //     let teamInfo = await commonGet(`team_id=${teamId}&method=get.shareTeaming.teamInfo&format=json&v=v1`);
        //     if (teamInfo.data.members_num < 4) {
        //         let join = await commonGet(`st_id=14&openid=1&team_id=${teamId}&tmplIds=st_id=14&openid=oCuYT0RwCL6WFFnHeNvuFumaJd_0&tmplIds=%5B%5D&method=shareTeaming.create.team&format=json&v=v1&method=shareTeaming.join.team&format=json&v=v1`);
        //         if (join.errorcode == 0) {
        //             console.log(`加入成功`)
        //         } else {
        //             console.log(join.msg)
        //         }
        //     } else {
        //         console.log(`队伍已满`)
        //     }
        // }
        console.log("————————————")
        console.log("积分查询")
        let info = await commonGet(`method=member.index&format=json&v=v1`);
        console.log(`拥有积分:${info.data.point}\n`)
        notice += `用户名：${phone}  拥有积分:${info.data.point}\n`
    }
    if (notice) {
        await sendMsg(notice);
    }
}

async function slidePost(body) {
    return new Promise(resolve => {
        const options = {
            url: `${OCR_SERVER}/classification`,
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

async function commonGet(query) {
    return new Promise(resolve => {
        let sign = createSign(query);
        const options = {
            url: `https://www.ztemall.com/index.php/topapi?${query}&sign=${sign}&accessToken=${token}`,
            headers: {
                "Host": "www.ztemall.com",
                "Connection": "keep-alive",
                "xweb_xhr": "1",
                "Authorization": `Bearer ${token}`,
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.49(0x1000000) NetType/WIFI Language/zh_CN",
                "Content-Type": "application/json",
                "Accept": "*/*",
                "Referer": "https://servicewechat.com/wx0744aecf7a03eedc/87/page-frame.html",
                "Accept-Encoding": "gzip, deflate, br",
                "Accept-Language": "zh-CN,zh;q=0.9",
            }
        }
        $.get(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    await $.wait(2000)
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

async function commonPost(body) {
    return new Promise(resolve => {
        let sign = createSign(body);
        const options = {
            url: `https://www.ztemall.com/index.php/topapi`,
            headers: {
                "Host": "www.ztemall.com",
                "Connection": "keep-alive",
                "xweb_xhr": "1",
                "Authorization": `Bearer ${token}`,
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.49(0x1000000) NetType/WIFI Language/zh_CN",
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept": "*/*",
                "Referer": "https://servicewechat.com/wx0744aecf7a03eedc/87/page-frame.html",
                "Accept-Encoding": "gzip, deflate, br",
                "Accept-Language": "zh-CN,zh;q=0.9",
            },
            body:`${body}&sign=${sign}&accessToken=${token}`
        }
        $.post(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    await $.wait(2000)
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

function createSign(params) {
    let mergedParams = {};
    let paramsArr = params.split('&')
    for(let i = 0,len = paramsArr.length;i < len;i++){
        let arr = paramsArr[i].split('=')
        mergedParams[arr[0]] = arr[1];
    }
    const sortedKeys = Object.keys(mergedParams).sort();
    let signString = '';
    sortedKeys.forEach(key => {
        if (mergedParams[key] !== undefined) {
            signString += `${key}${mergedParams[key]}`;
        }
    });
    return Utils.md5(Utils.md5(signString).toUpperCase() + "94a08da1fecbb6e8b46990538c7b50b2").toUpperCase();
}

async function loadUtils() {
    let code = $.getdata('Utils_Code') || '';
    if (code && Object.keys(code).length) {
        console.log(`✅ ${$.name}: 缓存中存在Utils代码, 跳过下载`)
        eval(code)
        return creatUtils();
    }
    console.log(`🚀 ${$.name}: 开始下载Utils代码`)
    return new Promise(async (resolve) => {
        $.getScript(
            'https://mirror.ghproxy.com/https://raw.githubusercontent.com/xzxxn777/Surge/main/Utils/Utils.js'
        ).then((fn) => {
            $.setdata(fn, "Utils_Code")
            eval(fn)
            console.log(`✅ Utils加载成功, 请继续`)
            resolve(creatUtils())
        })
    })
}

async function sendMsg(message) {
    if ($.isNode()) {
        let notify = ''
        try {
            notify = require('./sendNotify');
        } catch (e) {
            notify = require("../sendNotify");
        }
        await notify.sendNotify($.name, message);
    } else {
        $.msg($.name, '', message)
    }
}

// prettier-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,a)=>{s.call(this,t,(t,s,r)=>{t?a(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}getEnv(){return"undefined"!=typeof $environment&&$environment["surge-version"]?"Surge":"undefined"!=typeof $environment&&$environment["stash-version"]?"Stash":"undefined"!=typeof module&&module.exports?"Node.js":"undefined"!=typeof $task?"Quantumult X":"undefined"!=typeof $loon?"Loon":"undefined"!=typeof $rocket?"Shadowrocket":void 0}isNode(){return"Node.js"===this.getEnv()}isQuanX(){return"Quantumult X"===this.getEnv()}isSurge(){return"Surge"===this.getEnv()}isLoon(){return"Loon"===this.getEnv()}isShadowrocket(){return"Shadowrocket"===this.getEnv()}isStash(){return"Stash"===this.getEnv()}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const a=this.getdata(t);if(a)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,a)=>e(a))})}runScript(t,e){return new Promise(s=>{let a=this.getdata("@chavy_boxjs_userCfgs.httpapi");a=a?a.replace(/\n/g,"").trim():a;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[i,o]=a.split("@"),n={url:`http://${o}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":i,Accept:"*/*"},timeout:r};this.post(n,(t,e,a)=>s(a))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),a=!s&&this.fs.existsSync(e);if(!s&&!a)return{};{const a=s?t:e;try{return JSON.parse(this.fs.readFileSync(a))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),a=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):a?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const a=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of a)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,a)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[a+1])>>0==+e[a+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,a]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,a,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,a,r]=/^@(.*?)\.(.*?)$/.exec(e),i=this.getval(a),o=a?"null"===i?null:i||"{}":"{}";try{const e=JSON.parse(o);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),a)}catch(e){const i={};this.lodash_set(i,r,t),s=this.setval(JSON.stringify(i),a)}}else s=this.setval(t,e);return s}getval(t){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.read(t);case"Quantumult X":return $prefs.valueForKey(t);case"Node.js":return this.data=this.loaddata(),this.data[t];default:return this.data&&this.data[t]||null}}setval(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.write(t,e);case"Quantumult X":return $prefs.setValueForKey(t,e);case"Node.js":return this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0;default:return this.data&&this.data[e]||null}}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){switch(t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"],delete t.headers["content-type"],delete t.headers["content-length"]),t.params&&(t.url+="?"+this.queryStr(t.params)),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,a)=>{!t&&s&&(s.body=a,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,a)});break;case"Quantumult X":this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:a,headers:r,body:i,bodyBytes:o}=t;e(null,{status:s,statusCode:a,headers:r,body:i,bodyBytes:o},i,o)},t=>e(t&&t.error||"UndefinedError"));break;case"Node.js":let s=require("iconv-lite");this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:a,statusCode:r,headers:i,rawBody:o}=t,n=s.decode(o,this.encoding);e(null,{status:a,statusCode:r,headers:i,rawBody:o,body:n},n)},t=>{const{message:a,response:r}=t;e(a,r,r&&s.decode(r.rawBody,this.encoding))})}}post(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"post";switch(t.body&&t.headers&&!t.headers["Content-Type"]&&!t.headers["content-type"]&&(t.headers["content-type"]="application/x-www-form-urlencoded"),t.headers&&(delete t.headers["Content-Length"],delete t.headers["content-length"]),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](t,(t,s,a)=>{!t&&s&&(s.body=a,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,a)});break;case"Quantumult X":t.method=s,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:a,headers:r,body:i,bodyBytes:o}=t;e(null,{status:s,statusCode:a,headers:r,body:i,bodyBytes:o},i,o)},t=>e(t&&t.error||"UndefinedError"));break;case"Node.js":let a=require("iconv-lite");this.initGotEnv(t);const{url:r,...i}=t;this.got[s](r,i).then(t=>{const{statusCode:s,statusCode:r,headers:i,rawBody:o}=t,n=a.decode(o,this.encoding);e(null,{status:s,statusCode:r,headers:i,rawBody:o,body:n},n)},t=>{const{message:s,response:r}=t;e(s,r,r&&a.decode(r.rawBody,this.encoding))})}}time(t,e=null){const s=e?new Date(e):new Date;let a={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in a)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?a[e]:("00"+a[e]).substr((""+a[e]).length)));return t}queryStr(t){let e="";for(const s in t){let a=t[s];null!=a&&""!==a&&("object"==typeof a&&(a=JSON.stringify(a)),e+=`${s}=${a}&`)}return e=e.substring(0,e.length-1),e}msg(e=t,s="",a="",r){const i=t=>{switch(typeof t){case void 0:return t;case"string":switch(this.getEnv()){case"Surge":case"Stash":default:return{url:t};case"Loon":case"Shadowrocket":return t;case"Quantumult X":return{"open-url":t};case"Node.js":return}case"object":switch(this.getEnv()){case"Surge":case"Stash":case"Shadowrocket":default:{let e=t.url||t.openUrl||t["open-url"];return{url:e}}case"Loon":{let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}case"Quantumult X":{let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl,a=t["update-pasteboard"]||t.updatePasteboard;return{"open-url":e,"media-url":s,"update-pasteboard":a}}case"Node.js":return}default:return}};if(!this.isMute)switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:$notification.post(e,s,a,i(r));break;case"Quantumult X":$notify(e,s,a,i(r));break;case"Node.js":}if(!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),a&&t.push(a),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:this.log("",`❗️${this.name}, 错误!`,t);break;case"Node.js":this.log("",`❗️${this.name}, 错误!`,t.stack)}}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;switch(this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:$done(t);break;case"Node.js":process.exit(1)}}}(t,e)}
