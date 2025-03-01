/**
 * cron "19 0,9 * * *" DingDong.js
 * export DINGDONG='[{uid: "", name: "", cookie: "", signBody: ""}]'
 * export DINGDONG_RAFFLE='open' //开启抽奖
 * 抓取url https://maicai.api.ddxq.mobi/point/home?api_version=x&app_client_id=x&app_version=x&app_client_name=x&station_id=x&native_version=x&city_number=x&uid=x&latitude=x&longitude=x&device_token=xxx&device_id=xxxxx&os_version=xx
 * signBody是问号后面的全部 api_version=x&app_client_id=x&app_version=x&app_client_name=x&station_id=x&native_version=x&city_number=x&uid=x&latitude=x&longitude=x&device_token=xxx&device_id=xxxxx&os_version=xx
 * name 随便填
 * uid 是链接中的 uid
 * cookie 是请求头cookie的值
 * 再问拉黑!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 */
const $ = new Env('叮咚买菜')
const DINGDONG = ($.isNode() ? (process.env.DINGDONG ? JSON.parse(process.env.DINGDONG) : undefined) : $.getjson("DINGDONG")) || []
const DINGDONG_RAFFLE = ($.isNode() ? process.env.DINGDONG_RAFFLE : $.getdata("DINGDONG_RAFFLE")) || "close";
let cookie = ''
let notice = ''
!(async () => {
    if (typeof $request != "undefined") {
        await getCookie();
    } else {
        await main();
    }
})().catch((e) => {
    $.log(e)
}).finally(() => {
    $.done({});
});

async function getCookie() {
    if ($request.url.includes("https://maicai.api.ddxq.mobi/point/home")) {
        cookie = $request.headers["cookie"];
        const signBody = $request.url.split('?')[1];
        let userInfo = await getTask("https://maicai.api.ddxq.mobi/user/info");
        let data = userInfo.data;
        let newData = {uid: data.id, name: data.name, cookie: cookie, signBody: signBody}
        const index = DINGDONG.findIndex(e => e.uid === newData.uid);
        if (index !== -1) {
            if (DINGDONG[index].cookie === newData.cookie) {
                return
            } else {
                DINGDONG[index] = newData;
                console.log(JSON.stringify(newData))
                $.msg($.name, `🎉用户${newData.name}更新token成功!`, ``);
            }
        } else {
            DINGDONG.push(newData)
            console.log(JSON.stringify(newData))
            $.msg($.name, `🎉新增用户${newData.name}成功!`, ``);
        }
        $.setjson(DINGDONG, "DINGDONG");
    }
}

async function main() {
    console.log('作者：@xzxxn777\n频道：https://t.me/xzxxn777\n群组：https://t.me/xzxxn7777\n自用机场推荐：https://xn--diqv0fut7b.com\n')
    for (const item of DINGDONG) {
        cookie = item.cookie
        let signBody = Object.fromEntries(new URLSearchParams(item.signBody).entries());
        let userInfo = await getTask("https://maicai.api.ddxq.mobi/user/info");
        if (userInfo.code !== 0){
            await sendMsg(`用户：${item.name}\t${userInfo.msg}`)
            continue;
        }
        let user = userInfo.data
        $.log(`用户：${user.name}\t开始任务`)

        // 签到
        let signin = await postTask('https://sunquan.api.ddxq.mobi/api/v2/user/signin/',signBody)
        let msg = `签到成功，连续签到${signin.data?.sign_series}天，获取积分${signin.data?.point}`;
        notice+=`\n用户：${user.name} 签到获取积分${signin.data?.point}`
        if (!!signin.data["ticket_money"]) {
            msg += `，优惠券${signin.data["ticket_money"]}!`;
        }
        $.log(msg);
        // 0元试吃
        $.log(`开始0元试吃---------`)
        let launchList = await getTask(`https://gw.api.ddxq.mobi/recipe-service/activity/activityLaunchList?${item.signBody}`);
        for (const launch of launchList.data.launchList) {
            if (launch.status===4 && checkVip(launch.vipOnly,user.is_vip) ){
                let applyData = await postTask('https://gw.api.ddxq.mobi/recipe-service/api/v1/activity/userApplyActivity',{...signBody, id:launch.id})
                if (applyData.success){
                    console.log(launch.productDetailBO.productName,applyData.data.newFlow,applyData.data.lotteryCodeCount )
                }else {
                    console.log(applyData.msg)
                }
                await $.wait(2000)
            }
        }
        $.log(`开始每日任务---------`)
        let pointTaskBody = {...signBody};
        pointTaskBody.app_client_id="0"
        let pointTask = await postTask(`https://gw.api.ddxq.mobi/promocore-service/client/welfare/center/v1/consult`, pointTaskBody);
        for (const iter of pointTask.data?.pointMissionModule) {
            if (iter?.rewardPoint > 0 && iter?.status < 1  && iter.missionId != null) {
                $.log(`开始任务---> ${iter.missionTitle}  奖励: ${iter.rewardPoint} 积分`)
                let searchMissionById = await postTask(`https://gw.api.ddxq.mobi/promomission-service/mission/search/new/searchMissionById`,
                    {"missionInstanceId": iter.missionId, "bizId":  getActivityId(iter.link), ...signBody});
                let searchMission = {}
                if (searchMissionById?.data?.missionList) {
                    searchMission = searchMissionById.data.missionList["0"];
                }
                await postTask(`https://gw.api.ddxq.mobi/promomission-service/mission/search/new/createUserMission`, {"missionId": iter.missionId});
                await $.wait(200)
                await postTask(`https://gw.api.ddxq.mobi/promomission-service/mission/search/new/searchMissionForWelfareCenter`, {"missionInstanceId": iter.missionId});
                await $.wait(1000)
                let noticeBody = {
                    "time": Math.floor(new Date().getTime() / 1000),
                    "serialNo": new Date().getTime(),
                    "missionType": searchMission.missionType,
                    "pageId": searchMission.pageId,
                    "missionId": iter.missionId,
                    "seconds": searchMission.seconds
                }
                let noticeData = await postTask('https://gw.api.ddxq.mobi/promomission-service/mission/notice/v1/notice', noticeBody);
                await $.wait(500)
                $.log(` scan: --->${noticeData.code}  ${noticeData.msg} `);
            }
        }
        let flopConsultData = await postTask(`https://gw.api.ddxq.mobi/promocore-service/client/flop/v3/consult`,{
            "h5_source": "",
            "time": new Date().getTime(),
            "pageId": "PAGE_NEW_FlASHSALE_V3",
            ...signBody
        });
        let signIn =await postTask(`https://gw.api.ddxq.mobi/promocore-service/client/signIn/v1/signIn`, {
            "relatedActivityId": flopConsultData.data.activityId,
            "activityId": flopConsultData.data.signInActivityId,
            "pageId": "PAGE_NEW_FlASHSALE_V3",
            "h5_source": "",
            "time": new Date().getTime(),
            ...signBody
        })
        $.log(JSON.stringify(signIn))
        let searchMissionData =await postTask(`https://gw.api.ddxq.mobi/promomission-service/mission/search/v1/searchMissionById`, {
            "bizId": flopConsultData.data.activityId,
            "h5_source": "",
            "time": new Date().getTime(),
            ...signBody
        })
        for (const missionItem of searchMissionData.data.missionList) {
            if (missionItem.status== 0 && missionItem.missionType!='order'){
                let noticeData  = await postTask('https://gw.api.ddxq.mobi/promomission-service/mission/notice/v1/notice',{
                    ...signBody,
                    "missionType": missionItem.missionType,
                    "seconds": missionItem.seconds,
                    "pageId": missionItem.pageId,
                    "time": new Date().getTime(),
                    "cityCode":signBody.city_number,
                    "s_id":signBody.station_id,
                    "app_client_name": "wechat",
                    "serialNo":  new Date().getTime()+ Math.random(),
                });
                $.log(` ${missionItem.missionType}-${missionItem.title}:  --->${noticeData.code}  ${noticeData.msg} `);
                await $.wait(1000)
            }
        }
        flopConsultData = await postTask(`https://gw.api.ddxq.mobi/promocore-service/client/flop/v3/consult`,{
            "h5_source": "",
            "time": new Date().getTime(),
            "pageId": "PAGE_NEW_FlASHSALE_V3",
            ...signBody
        });
        for (let i = 0; i < flopConsultData.data.flopBaseInfo.curRemainCount; i++) {
            let body = {
                "equityFactorDTO":flopConsultData.data.equityFactorDTO,
                "isBridge": false,
                ...signBody,
            };
            let flopTrigger = await postTask(`https://gw.api.ddxq.mobi/promocore-service/client/flop/v3/trigger`,body)
            if (flopTrigger.data?.triggerPrize?.prizeType == "BALANCE"){
                console.log(flopTrigger.data?.triggerPrize)
                console.log(flopTrigger.data?.triggerPrize?.userBalancePrize)
                console.log(flopTrigger.data)
                let s = `翻牌获得:${flopTrigger.data?.triggerPrize?.userBalancePrize?.balancePrizeDTO?.balance}-${flopTrigger.data?.triggerPrize?.userBalancePrize?.expireTimeDesc}`;
                $.log(s);
                notice+=s
            }
            await $.wait(1000)
        }
        // 抽奖
        if (DINGDONG_RAFFLE=="open"){
            let consultLottery =await postTask(`https://gw.api.ddxq.mobi/promocore-service/client/lottery/v1/consultLottery`, {
                "activityType": "SIGN_IN",
                "bizNo": generateRandomString(8),
                "showMsg": false,
                "h5_source": "",
                "time": new Date().getTime(),
                ...signBody
            })
            do {
                let triggerLottery =await postTask(`https://gw.api.ddxq.mobi/promocore-service/client/lottery/v1/triggerLottery`, {
                    ...signBody,
                    "h5_source": "",
                    "time": new Date().getTime(),
                    "activityId": consultLottery.data.lotteryBaseInfo.activityId,
                    "bizFrom": "SIGN_IN",
                    "bizNo": generateRandomString(8),
                    "showMsg": false})
                if (triggerLottery.code!=0){
                    break
                }else
                if (triggerLottery.data?.prizeInfo["0"]?.prizeType == "COUPON"){
                    $.log(`抽奖获得优惠卷: ${triggerLottery.data.prizeInfo["0"].userTicketPrizeInfo?.ticketPrize.name}`)
                    notice+=`\n抽奖获得优惠卷: ${triggerLottery.data.prizeInfo["0"].userTicketPrizeInfo?.ticketPrize.name}`
                }else if  (triggerLottery.data?.prizeInfo["0"]?.prizeType == "POINTS"){
                    $.log(`抽奖获得积分: ${triggerLottery.data.prizeInfo["0"].pointPrizeInfo.value}`)
                    notice+=`\n抽奖获得积分: ${triggerLottery.data.prizeInfo["0"].pointPrizeInfo.value}`
                }
                await $.wait(2000)
            }while (true)

        }
        let pointFlow = await getTask(`https://maicai.api.ddxq.mobi/point/flow?${item.signBody}&type=0&count=50&page=1`);
        const today = new Date();
        let dayPoint = pointFlow.data.point_list.filter(item => {
                const createTime = new Date(item.create_time);
                return createTime.getDate() === today.getDate() &&
                    createTime.getMonth() === today.getMonth() &&
                    createTime.getFullYear() === today.getFullYear();
            }).reduce((total, item) => total + item.point, 0);
        notice+=`\n积分:${pointFlow.data.point_total} 今日获得:${dayPoint}`
    }
    if (notice!==''){
        await sendMsg(notice);
    }

}
function isToday(dateStr) {
    const date = new Date(dateStr);
    const today = new Date();
    return date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
}
async function sendMsg(message) {
    $.log(message)
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
function getTask(url) {
    return new Promise(resolve => {
        const options = {
            url: `${url}`,
            headers: {
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 xzone/9.15.1 station_id/5500fe01916edfe0738b4e43",
                // "Referer": "https://activity.m.ddxq.mobi/",
                // "Host": "maicai.api.ddxq.mobi",
                // "Origin": "https://activity.m.ddxq.mobi",
                "content-type":"application/json",
                "Cookie": cookie
            }
        }
        $.get(options, (err, resp, data) => {
            try {
                if (err) {
                    console.log(JSON.stringify(err));
                    $.logErr(err);
                } else {
                    let dataObj = JSON.parse(data);
                    resolve(dataObj);
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve();
            }
        })
    })
}
function getActivityId(url) {
    const urlParams = new URLSearchParams(url.split('?')[1]);
    const activityId = urlParams.get('welfareActivityId');
    console.log("Activity ID:", activityId);
    return activityId
}

function generateRandomString(length=8) {
    const characters = 'abcdefghijklmnopqrstuvwxyz023456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function postTask(url,body) {
    return new Promise(resolve => {
        const options = {
            url: `${url}`,
            headers: {
                "Accept": "*/*",
                "Accept-Encoding": "gzip, deflate, br",
                "Accept-Language": "zh-cn",
                "Connection": "keep-alive",
                "Content-Type": "application/json",
                "Cookie": cookie,
                "Origin": "https://activity.m.ddxq.mobi",
                "Referer": "https://activity.m.ddxq.mobi/",
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 xzone/9.15.1 station_id/5500fe01916edfe0738b4e43"
            },
            body: JSON.stringify(body)
        }
        $.post(options, (err, resp, data) => {
            try {
                if (err) {
                    console.log(JSON.stringify(err));
                    $.logErr(err);
                } else {
                    let dataObj = JSON.parse(data);
                    resolve(dataObj);
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve();
            }
        })
    })
}
function checkVip(vipOnly,is_vip){
    if (vipOnly===1 && is_vip ===0){
        return false;
    }
    return true
}
// prettier-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise(((e,i)=>{s.call(this,t,((t,s,o)=>{t?i(t):e(s)}))}))}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.logLevels={debug:0,info:1,warn:2,error:3},this.logLevelPrefixs={debug:"[DEBUG] ",info:"[INFO] ",warn:"[WARN] ",error:"[ERROR] "},this.logLevel="info",this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}getEnv(){return"undefined"!=typeof $environment&&$environment["surge-version"]?"Surge":"undefined"!=typeof $environment&&$environment["stash-version"]?"Stash":"undefined"!=typeof module&&module.exports?"Node.js":"undefined"!=typeof $task?"Quantumult X":"undefined"!=typeof $loon?"Loon":"undefined"!=typeof $rocket?"Shadowrocket":void 0}isNode(){return"Node.js"===this.getEnv()}isQuanX(){return"Quantumult X"===this.getEnv()}isSurge(){return"Surge"===this.getEnv()}isLoon(){return"Loon"===this.getEnv()}isShadowrocket(){return"Shadowrocket"===this.getEnv()}isStash(){return"Stash"===this.getEnv()}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null,...s){try{return JSON.stringify(t,...s)}catch{return e}}getjson(t,e){let s=e;if(this.getdata(t))try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise((e=>{this.get({url:t},((t,s,i)=>e(i)))}))}runScript(t,e){return new Promise((s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let o=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");o=o?1*o:20,o=e&&e.timeout?e.timeout:o;const[r,a]=i.split("@"),n={url:`http://${a}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:o},headers:{"X-Key":r,Accept:"*/*"},timeout:o};this.post(n,((t,e,i)=>s(i)))})).catch((t=>this.logErr(t)))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),o=JSON.stringify(this.data);s?this.fs.writeFileSync(t,o):i?this.fs.writeFileSync(e,o):this.fs.writeFileSync(t,o)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let o=t;for(const t of i)if(o=Object(o)[t],void 0===o)return s;return o}lodash_set(t,e,s){return Object(t)!==t||(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce(((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{}),t)[e[e.length-1]]=s),t}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),o=s?this.getval(s):"";if(o)try{const t=JSON.parse(o);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,o]=/^@(.*?)\.(.*?)$/.exec(e),r=this.getval(i),a=i?"null"===r?null:r||"{}":"{}";try{const e=JSON.parse(a);this.lodash_set(e,o,t),s=this.setval(JSON.stringify(e),i)}catch(e){const r={};this.lodash_set(r,o,t),s=this.setval(JSON.stringify(r),i)}}else s=this.setval(t,e);return s}getval(t){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.read(t);case"Quantumult X":return $prefs.valueForKey(t);case"Node.js":return this.data=this.loaddata(),this.data[t];default:return this.data&&this.data[t]||null}}setval(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.write(t,e);case"Quantumult X":return $prefs.setValueForKey(t,e);case"Node.js":return this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0;default:return this.data&&this.data[e]||null}}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.cookie&&void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar)))}get(t,e=(()=>{})){switch(t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"],delete t.headers["content-type"],delete t.headers["content-length"]),t.params&&(t.url+="?"+this.queryStr(t.params)),void 0===t.followRedirect||t.followRedirect||((this.isSurge()||this.isLoon())&&(t["auto-redirect"]=!1),this.isQuanX()&&(t.opts?t.opts.redirection=!1:t.opts={redirection:!1})),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,((t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,i)}));break;case"Quantumult X":this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then((t=>{const{statusCode:s,statusCode:i,headers:o,body:r,bodyBytes:a}=t;e(null,{status:s,statusCode:i,headers:o,body:r,bodyBytes:a},r,a)}),(t=>e(t&&t.error||"UndefinedError")));break;case"Node.js":let s=require("iconv-lite");this.initGotEnv(t),this.got(t).on("redirect",((t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}})).then((t=>{const{statusCode:i,statusCode:o,headers:r,rawBody:a}=t,n=s.decode(a,this.encoding);e(null,{status:i,statusCode:o,headers:r,rawBody:a,body:n},n)}),(t=>{const{message:i,response:o}=t;e(i,o,o&&s.decode(o.rawBody,this.encoding))}));break}}post(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"post";switch(t.body&&t.headers&&!t.headers["Content-Type"]&&!t.headers["content-type"]&&(t.headers["content-type"]="application/x-www-form-urlencoded"),t.headers&&(delete t.headers["Content-Length"],delete t.headers["content-length"]),void 0===t.followRedirect||t.followRedirect||((this.isSurge()||this.isLoon())&&(t["auto-redirect"]=!1),this.isQuanX()&&(t.opts?t.opts.redirection=!1:t.opts={redirection:!1})),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](t,((t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,i)}));break;case"Quantumult X":t.method=s,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then((t=>{const{statusCode:s,statusCode:i,headers:o,body:r,bodyBytes:a}=t;e(null,{status:s,statusCode:i,headers:o,body:r,bodyBytes:a},r,a)}),(t=>e(t&&t.error||"UndefinedError")));break;case"Node.js":let i=require("iconv-lite");this.initGotEnv(t);const{url:o,...r}=t;this.got[s](o,r).then((t=>{const{statusCode:s,statusCode:o,headers:r,rawBody:a}=t,n=i.decode(a,this.encoding);e(null,{status:s,statusCode:o,headers:r,rawBody:a,body:n},n)}),(t=>{const{message:s,response:o}=t;e(s,o,o&&i.decode(o.rawBody,this.encoding))}));break}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}queryStr(t){let e="";for(const s in t){let i=t[s];null!=i&&""!==i&&("object"==typeof i&&(i=JSON.stringify(i)),e+=`${s}=${i}&`)}return e=e.substring(0,e.length-1),e}msg(e=t,s="",i="",o={}){const r=t=>{const{$open:e,$copy:s,$media:i,$mediaMime:o}=t;switch(typeof t){case void 0:return t;case"string":switch(this.getEnv()){case"Surge":case"Stash":default:return{url:t};case"Loon":case"Shadowrocket":return t;case"Quantumult X":return{"open-url":t};case"Node.js":return}case"object":switch(this.getEnv()){case"Surge":case"Stash":case"Shadowrocket":default:{const r={};let a=t.openUrl||t.url||t["open-url"]||e;a&&Object.assign(r,{action:"open-url",url:a});let n=t["update-pasteboard"]||t.updatePasteboard||s;if(n&&Object.assign(r,{action:"clipboard",text:n}),i){let t,e,s;if(i.startsWith("http"))t=i;else if(i.startsWith("data:")){const[t]=i.split(";"),[,o]=i.split(",");e=o,s=t.replace("data:","")}else{e=i,s=(t=>{const e={JVBERi0:"application/pdf",R0lGODdh:"image/gif",R0lGODlh:"image/gif",iVBORw0KGgo:"image/png","/9j/":"image/jpg"};for(var s in e)if(0===t.indexOf(s))return e[s];return null})(i)}Object.assign(r,{"media-url":t,"media-base64":e,"media-base64-mime":o??s})}return Object.assign(r,{"auto-dismiss":t["auto-dismiss"],sound:t.sound}),r}case"Loon":{const s={};let o=t.openUrl||t.url||t["open-url"]||e;o&&Object.assign(s,{openUrl:o});let r=t.mediaUrl||t["media-url"];return i?.startsWith("http")&&(r=i),r&&Object.assign(s,{mediaUrl:r}),console.log(JSON.stringify(s)),s}case"Quantumult X":{const o={};let r=t["open-url"]||t.url||t.openUrl||e;r&&Object.assign(o,{"open-url":r});let a=t["media-url"]||t.mediaUrl;i?.startsWith("http")&&(a=i),a&&Object.assign(o,{"media-url":a});let n=t["update-pasteboard"]||t.updatePasteboard||s;return n&&Object.assign(o,{"update-pasteboard":n}),console.log(JSON.stringify(o)),o}case"Node.js":return}default:return}};if(!this.isMute)switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:$notification.post(e,s,i,r(o));break;case"Quantumult X":$notify(e,s,i,r(o));break;case"Node.js":break}if(!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}debug(...t){this.logLevels[this.logLevel]<=this.logLevels.debug&&(t.length>0&&(this.logs=[...this.logs,...t]),console.log(`${this.logLevelPrefixs.debug}${t.map((t=>t??String(t))).join(this.logSeparator)}`))}info(...t){this.logLevels[this.logLevel]<=this.logLevels.info&&(t.length>0&&(this.logs=[...this.logs,...t]),console.log(`${this.logLevelPrefixs.info}${t.map((t=>t??String(t))).join(this.logSeparator)}`))}warn(...t){this.logLevels[this.logLevel]<=this.logLevels.warn&&(t.length>0&&(this.logs=[...this.logs,...t]),console.log(`${this.logLevelPrefixs.warn}${t.map((t=>t??String(t))).join(this.logSeparator)}`))}error(...t){this.logLevels[this.logLevel]<=this.logLevels.error&&(t.length>0&&(this.logs=[...this.logs,...t]),console.log(`${this.logLevelPrefixs.error}${t.map((t=>t??String(t))).join(this.logSeparator)}`))}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.map((t=>t??String(t))).join(this.logSeparator))}logErr(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:this.log("",`❗️${this.name}, 错误!`,e,t);break;case"Node.js":this.log("",`❗️${this.name}, 错误!`,e,void 0!==t.message?t.message:t,t.stack);break}}wait(t){return new Promise((e=>setTimeout(e,t)))}done(t={}){const e=((new Date).getTime()-this.startTime)/1e3;switch(this.log("",`🔔${this.name}, 结束! 🕛 ${e} 秒`),this.log(),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:$done(t);break;case"Node.js":process.exit(1)}}}(t,e)}