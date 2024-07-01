const $ = new Env('望潮')
const WangChao = ($.isNode() ? process.env.WangChao : $.getdata("WangChao")) || '';
let Utils = undefined;
let tenantId = '64'
let commonUa = ''
let deviceId = ''
let readCookie = ''
let accountId = ''
let signatureSalt = "FR*r!isE5W"
let sessionId = ''
let notice = ''
!(async () => {
    await main();
})().catch((e) => {$.log(e)}).finally(() => {$.done({});});

async function main() {
    console.log('作者：@xzxxn777\n频道：https://t.me/xzxxn777\n群组：https://t.me/xzxxn7777\n自用机场推荐：https://xn--diqv0fut7b.com\n')
    if (!WangChao) {
        console.log("先去boxjs填写账号密码")
        $.msg($.name, '先去boxjs填写账号密码');
        return
    }
    Utils = await loadUtils();
    let arr = WangChao.split(" ");
    for (const item of arr) {
        accountId = item.split("&")[0]
        sessionId = item.split("&")[1]
        console.log(`用户：${accountId}开始任务`)
        console.log("随机生成UA")
        let randomUA = generateRandomUA();
        commonUa = randomUA.commonUa;
        deviceId = randomUA.uuid;
        console.log(commonUa)
        console.log("————————————")
        console.log("开始签到")
        let sign = await commonGet('/api/user_mumber/sign')
        console.log(`签到获得：${sign.data.signExperience}积分`)
        console.log("————————————")
        console.log("开始任务")
        let readFinish = true;
        let likeFinish = true;
        let shareFinish = true;
        let taskList = await commonGet('/api/user_center/task?type=1&current=1&size=20')
        for (let task of taskList.data.list) {
            console.log(`任务：${task.name}`)
            if (task.completed == 1) {
                console.log(`任务已完成`)
                continue;
            }
            console.log(`任务进度：${task.finish_times}/${task.frequency}`)
            if (task.name == '使用本地服务') {
                for (let i = task.finish_times; i < task.frequency; i++) {
                    let doTask = await commonPost(`/api/user_mumber/doTask`,`memberType=6&member_type=6`)
                    console.log(`任务完成获得：${doTask.data.score_notify.integral}积分`)
                }
            }
            if (task.name == '新闻资讯阅读') {
                readFinish = false;
            }
            if (task.name == '新闻资讯点赞') {
                likeFinish = false;
            }
            if (task.name == '分享资讯给好友') {
                shareFinish = false;
            }
        }
        if (!readFinish || !likeFinish || !shareFinish) {
            let articleList = await commonGet('/api/article/channel_list?channel_id=639abec5e305b418fc469e3b&isDiFangHao=false&is_new=true&list_count=0&size=20')
            for (const article of articleList.data.article_list) {
                let articleId = article.id;
                if (!readFinish) {
                    let read = await commonGet(`/api/article/read_time?channel_article_id=${articleId}&is_end=true&read_time=3051`)
                    if (read.data) {
                        console.log(`阅读成功`)
                    } else {
                        console.log(`文章已经阅读过了`)
                    }
                }
                if (!likeFinish) {
                    let like = await commonPost(`/api/favorite/like`,`action=true&id=${articleId}`)
                    if (like.data) {
                        console.log(`点赞成功`)
                    } else {
                        console.log(`文章已经点赞过了`)
                    }
                }
                if (!shareFinish) {
                    let share = await commonPost(`/api/user_mumber/doTask`,`memberType=3&member_type=3&target_id==${articleId}`)
                    if (share.data) {
                        console.log(`分享成功`)
                    } else {
                        console.log(`文章已经分享过了`)
                    }
                }
            }
        }
        console.log("————————————")
        console.log('阅读抽奖')
        readCookie = await loginGet(`/prod-api/user-read/app/login?id=${accountId}&sessionId=${sessionId}&deviceId=${deviceId}`)
        console.log('获取登录cookie')
        console.log(readCookie)
        let readList = await readGet(`/prod-api/user-read/list/${getCurrentDate()}`)
        if (readList.data.completedCount == readList.data.sum) {
            console.log('阅读已经完成')
        } else {
            for (const article of readList.data.articleIsReadList) {
                if (article.isRead) {
                    continue
                }
                let time = Date.now();
                let signature = Utils.md5(`&&${article.id}&&TlGFQAOlCIVxnKopQnW&&${time}`)
                let read = await readGet(`/prod-api/already-read/article?articid=${article.id}&timestamp=${time}&signature=${signature}`);
                console.log(read)
            }
        }
        let lotteryCount = await readGet(`/prod-api/user-read-count/count/${getCurrentDate()}`);
        let priceList = await lotteryGet('/tzrb/awardUpgrade/list?activityId=67');
        let priceArr = priceList.data;
        for (let i = 0; i < lotteryCount.data; i++) {
            let lottery = await lotteryPost(`/tzrb/userAwardRecordUpgrade/saveUpdate`,'activityId=67&sessionId=undefined&sig=undefined&token=undefined')
            const index = priceArr.findIndex(e => e.id == lottery.data);
            console.log(`抽奖获得：${priceArr[index].title}`)
        }
        console.log("————————————")
        console.log("查询积分")
        let detail = await commonGet('/api/user_mumber/account_detail')
        console.log(`拥有积分：${detail.data.rst.total_integral}\n`)
        notice += `用户：${accountId} 积分：${detail.data.rst.total_integral}\n`
    }
    if (notice) {
        $.msg($.name, '', notice);
    }
}

async function commonGet(url) {
    let params = getParams(url);
    return new Promise(resolve => {
        const options = {
            url: `https://vapp.taizhou.com.cn${url}`,
            headers : {
                'Connection': 'Keep-Alive',
                'X-TIMESTAMP': params.time,
                'X-SESSION-ID': sessionId,
                'X-REQUEST-ID': params.uuid,
                'X-SIGNATURE': params.signature,
                'X-TENANT-ID': tenantId,
                'X-ACCOUNT-ID': accountId,
                'Cache-Control': 'no-cache',
                'Accept-Encoding': 'gzip',
                'user-agent': commonUa,
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

async function commonPost(url,body) {
    let params = getParams(url);
    return new Promise(resolve => {
        const options = {
            url: `https://vapp.taizhou.com.cn${url}`,
            headers : {
                'Connection': 'Keep-Alive',
                'X-TIMESTAMP': params.time,
                'X-SESSION-ID': sessionId,
                'X-REQUEST-ID': params.uuid,
                'X-SIGNATURE': params.signature,
                'X-TENANT-ID': tenantId,
                'X-ACCOUNT-ID': accountId,
                'Cache-Control': 'no-cache',
                'Accept-Encoding': 'gzip',
                'user-agent': commonUa,
            },
            body: body
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

async function loginGet(url) {
    return new Promise(resolve => {
        const options = {
            url: `https://xmt.taizhou.com.cn${url}`,
            headers : {
                'Connection': 'Keep-Alive',
                'Accept': '*/*',
                'Cookie': readCookie,
                'Sec-Fetch-Site': 'same-origin',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Dest': 'empty',
                'Referer': 'https://xmt.taizhou.com.cn/readingLuck-v1/',
                'X-Requested-With': 'com.shangc.tiennews.taizhou',
                'Accept-Encoding': 'gzip, deflate',
                'Accept-Language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
                'user-agent': 'Mozilla/5.0 (Linux; Android 11; 21091116AC Build/RP1A.200720.011; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/94.0.4606.85 Mobile Safari/537.36;xsb_wangchao;xsb_wangchao;6.0.2;native_app;6.10.0',
            }
        }
        $.get(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    await $.wait(2000)
                    if ($.isNode()) {
                        cookie = resp.headers['set-cookie'][0];
                    } else {
                        cookie = resp.headers['set-cookie'] || resp.headers['Set-Cookie'];
                    }
                    cookie = cookie.split(';')[0];
                    resolve(cookie);
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve();
            }
        })
    })
}

async function readGet(url) {
    return new Promise(resolve => {
        const options = {
            url: `https://xmt.taizhou.com.cn${url}`,
            headers : {
                'Connection': 'Keep-Alive',
                'Accept': '*/*',
                'Cookie': readCookie,
                'Sec-Fetch-Site': 'same-origin',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Dest': 'empty',
                'Referer': 'https://xmt.taizhou.com.cn/readingLuck-v1/',
                'X-Requested-With': 'com.shangc.tiennews.taizhou',
                'Accept-Encoding': 'gzip, deflate',
                'Accept-Language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
                'user-agent': 'Mozilla/5.0 (Linux; Android 11; 21091116AC Build/RP1A.200720.011; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/94.0.4606.85 Mobile Safari/537.36;xsb_wangchao;xsb_wangchao;6.0.2;native_app;6.10.0',
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

async function lotteryGet(url) {
    return new Promise(resolve => {
        const options = {
            url: `https://srv-app.taizhou.com.cn${url}`,
            headers : {
                'Connection': 'Keep-Alive',
                'Accept': '*/*',
                'Sec-Fetch-Site': 'same-origin',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Dest': 'empty',
                'Referer': 'https://xmt.taizhou.com.cn/readingLuck-v1/',
                'X-Requested-With': 'com.shangc.tiennews.taizhou',
                'Accept-Encoding': 'gzip, deflate',
                'Accept-Language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
                'user-agent': 'Mozilla/5.0 (Linux; Android 11; 21091116AC Build/RP1A.200720.011; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/94.0.4606.85 Mobile Safari/537.36;xsb_wangchao;xsb_wangchao;6.0.2;native_app;6.10.0',
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

async function lotteryPost(url,body) {
    return new Promise(resolve => {
        const options = {
            url: `https://srv-app.taizhou.com.cn${url}`,
            headers : {
                'Connection': 'Keep-Alive',
                'Accept': '*/*',
                'Content-type': 'application/x-www-form-urlencoded',
                'Sec-Fetch-Site': 'same-origin',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Dest': 'empty',
                'Referer': 'https://xmt.taizhou.com.cn/readingLuck-v1/',
                'X-Requested-With': 'com.shangc.tiennews.taizhou',
                'Accept-Encoding': 'gzip, deflate',
                'Accept-Language': 'zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7',
                'user-agent': 'Mozilla/5.0 (Linux; Android 11; 21091116AC Build/RP1A.200720.011; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/94.0.4606.85 Mobile Safari/537.36;xsb_wangchao;xsb_wangchao;6.0.2;native_app;6.10.0',
            },
            body: body
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

function getParams(url) {
    let uuid = generateUUID();
    let time = Date.now();
    if (url.indexOf('?') > 0) {
        url = url.substring(0, url.indexOf('?'));
    }
    CryptoJS = Utils.createCryptoJS();
    let signature = CryptoJS.SHA256(`${url}&&${sessionId}&&${uuid}&&${time}&&${signatureSalt}&&${tenantId}`).toString();
    return {"uuid":uuid,"time":time,"signature":signature};
}

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

function getCurrentDate() {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}

function generateRandomUA() {
    const version = "6.0.2";
    const uuid = generateUUID();
    const deviceIds = [
        "M1903F2A",
        "M2001J2E",
        "M2001J2C",
        "M2001J1E",
        "M2001J1C",
        "M2002J9E",
        "M2011K2C",
        "M2102K1C",
        "M2101K9C",
        "2107119DC",
        "2201123C",
        "2112123AC",
        "2201122C",
        "2211133C",
        "2210132C",
        "2304FPN6DC",
        "23127PN0CC",
        "24031PN0DC",
        "23090RA98C",
        "2312DRA50C",
        "2312CRAD3C",
        "2312DRAABC",
        "22101316UCP",
        "22101316C"
    ];
    const deviceId = getRandomElement(deviceIds);
    const device = "Xiaomi " + deviceId;
    const os = "Android";
    const osVersion = "11";
    const osType = "xiaomi";
    const appVersion = "6.10.0";

    let commonUa = `${version};${uuid};${device};${os};${osVersion};${osType};${appVersion}`
    return {"commonUa": commonUa,"uuid": uuid};
}

function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

async function loadUtils() {
    let code = ($.isNode() ? process.env.Utils_Code : $.getdata('Utils_Code')) || '';
    if (code && Object.keys(code).length) {
        console.log(`✅ ${$.name}: 缓存中存在Utils代码, 跳过下载`)
        eval(code)
        return creatUtils();
    }
    console.log(`🚀 ${$.name}: 开始下载Utils代码`)
    return new Promise(async (resolve) => {
        $.getScript(
            'https://cdn.jsdelivr.net/gh/xzxxn777/Surge@main/Utils/Utils.js'
        ).then((fn) => {
            $.setdata(fn, "Utils_Code")
            eval(fn)
            console.log(`✅ Utils加载成功, 请继续`)
            resolve(creatUtils())
        })
    })
}

// prettier-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise(((e,i)=>{s.call(this,t,((t,s,o)=>{t?i(t):e(s)}))}))}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.logLevels={debug:0,info:1,warn:2,error:3},this.logLevelPrefixs={debug:"[DEBUG] ",info:"[INFO] ",warn:"[WARN] ",error:"[ERROR] "},this.logLevel="info",this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}getEnv(){return"undefined"!=typeof $environment&&$environment["surge-version"]?"Surge":"undefined"!=typeof $environment&&$environment["stash-version"]?"Stash":"undefined"!=typeof module&&module.exports?"Node.js":"undefined"!=typeof $task?"Quantumult X":"undefined"!=typeof $loon?"Loon":"undefined"!=typeof $rocket?"Shadowrocket":void 0}isNode(){return"Node.js"===this.getEnv()}isQuanX(){return"Quantumult X"===this.getEnv()}isSurge(){return"Surge"===this.getEnv()}isLoon(){return"Loon"===this.getEnv()}isShadowrocket(){return"Shadowrocket"===this.getEnv()}isStash(){return"Stash"===this.getEnv()}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null,...s){try{return JSON.stringify(t,...s)}catch{return e}}getjson(t,e){let s=e;if(this.getdata(t))try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise((e=>{this.get({url:t},((t,s,i)=>e(i)))}))}runScript(t,e){return new Promise((s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let o=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");o=o?1*o:20,o=e&&e.timeout?e.timeout:o;const[r,a]=i.split("@"),n={url:`http://${a}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:o},headers:{"X-Key":r,Accept:"*/*"},timeout:o};this.post(n,((t,e,i)=>s(i)))})).catch((t=>this.logErr(t)))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),o=JSON.stringify(this.data);s?this.fs.writeFileSync(t,o):i?this.fs.writeFileSync(e,o):this.fs.writeFileSync(t,o)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let o=t;for(const t of i)if(o=Object(o)[t],void 0===o)return s;return o}lodash_set(t,e,s){return Object(t)!==t||(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce(((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{}),t)[e[e.length-1]]=s),t}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),o=s?this.getval(s):"";if(o)try{const t=JSON.parse(o);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,o]=/^@(.*?)\.(.*?)$/.exec(e),r=this.getval(i),a=i?"null"===r?null:r||"{}":"{}";try{const e=JSON.parse(a);this.lodash_set(e,o,t),s=this.setval(JSON.stringify(e),i)}catch(e){const r={};this.lodash_set(r,o,t),s=this.setval(JSON.stringify(r),i)}}else s=this.setval(t,e);return s}getval(t){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.read(t);case"Quantumult X":return $prefs.valueForKey(t);case"Node.js":return this.data=this.loaddata(),this.data[t];default:return this.data&&this.data[t]||null}}setval(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.write(t,e);case"Quantumult X":return $prefs.setValueForKey(t,e);case"Node.js":return this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0;default:return this.data&&this.data[e]||null}}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.cookie&&void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar)))}get(t,e=(()=>{})){switch(t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"],delete t.headers["content-type"],delete t.headers["content-length"]),t.params&&(t.url+="?"+this.queryStr(t.params)),void 0===t.followRedirect||t.followRedirect||((this.isSurge()||this.isLoon())&&(t["auto-redirect"]=!1),this.isQuanX()&&(t.opts?t.opts.redirection=!1:t.opts={redirection:!1})),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,((t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,i)}));break;case"Quantumult X":this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then((t=>{const{statusCode:s,statusCode:i,headers:o,body:r,bodyBytes:a}=t;e(null,{status:s,statusCode:i,headers:o,body:r,bodyBytes:a},r,a)}),(t=>e(t&&t.error||"UndefinedError")));break;case"Node.js":let s=require("iconv-lite");this.initGotEnv(t),this.got(t).on("redirect",((t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}})).then((t=>{const{statusCode:i,statusCode:o,headers:r,rawBody:a}=t,n=s.decode(a,this.encoding);e(null,{status:i,statusCode:o,headers:r,rawBody:a,body:n},n)}),(t=>{const{message:i,response:o}=t;e(i,o,o&&s.decode(o.rawBody,this.encoding))}));break}}post(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"post";switch(t.body&&t.headers&&!t.headers["Content-Type"]&&!t.headers["content-type"]&&(t.headers["content-type"]="application/x-www-form-urlencoded"),t.headers&&(delete t.headers["Content-Length"],delete t.headers["content-length"]),void 0===t.followRedirect||t.followRedirect||((this.isSurge()||this.isLoon())&&(t["auto-redirect"]=!1),this.isQuanX()&&(t.opts?t.opts.redirection=!1:t.opts={redirection:!1})),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](t,((t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,i)}));break;case"Quantumult X":t.method=s,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then((t=>{const{statusCode:s,statusCode:i,headers:o,body:r,bodyBytes:a}=t;e(null,{status:s,statusCode:i,headers:o,body:r,bodyBytes:a},r,a)}),(t=>e(t&&t.error||"UndefinedError")));break;case"Node.js":let i=require("iconv-lite");this.initGotEnv(t);const{url:o,...r}=t;this.got[s](o,r).then((t=>{const{statusCode:s,statusCode:o,headers:r,rawBody:a}=t,n=i.decode(a,this.encoding);e(null,{status:s,statusCode:o,headers:r,rawBody:a,body:n},n)}),(t=>{const{message:s,response:o}=t;e(s,o,o&&i.decode(o.rawBody,this.encoding))}));break}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}queryStr(t){let e="";for(const s in t){let i=t[s];null!=i&&""!==i&&("object"==typeof i&&(i=JSON.stringify(i)),e+=`${s}=${i}&`)}return e=e.substring(0,e.length-1),e}msg(e=t,s="",i="",o={}){const r=t=>{const{$open:e,$copy:s,$media:i,$mediaMime:o}=t;switch(typeof t){case void 0:return t;case"string":switch(this.getEnv()){case"Surge":case"Stash":default:return{url:t};case"Loon":case"Shadowrocket":return t;case"Quantumult X":return{"open-url":t};case"Node.js":return}case"object":switch(this.getEnv()){case"Surge":case"Stash":case"Shadowrocket":default:{const r={};let a=t.openUrl||t.url||t["open-url"]||e;a&&Object.assign(r,{action:"open-url",url:a});let n=t["update-pasteboard"]||t.updatePasteboard||s;if(n&&Object.assign(r,{action:"clipboard",text:n}),i){let t,e,s;if(i.startsWith("http"))t=i;else if(i.startsWith("data:")){const[t]=i.split(";"),[,o]=i.split(",");e=o,s=t.replace("data:","")}else{e=i,s=(t=>{const e={JVBERi0:"application/pdf",R0lGODdh:"image/gif",R0lGODlh:"image/gif",iVBORw0KGgo:"image/png","/9j/":"image/jpg"};for(var s in e)if(0===t.indexOf(s))return e[s];return null})(i)}Object.assign(r,{"media-url":t,"media-base64":e,"media-base64-mime":o??s})}return Object.assign(r,{"auto-dismiss":t["auto-dismiss"],sound:t.sound}),r}case"Loon":{const s={};let o=t.openUrl||t.url||t["open-url"]||e;o&&Object.assign(s,{openUrl:o});let r=t.mediaUrl||t["media-url"];return i?.startsWith("http")&&(r=i),r&&Object.assign(s,{mediaUrl:r}),console.log(JSON.stringify(s)),s}case"Quantumult X":{const o={};let r=t["open-url"]||t.url||t.openUrl||e;r&&Object.assign(o,{"open-url":r});let a=t["media-url"]||t.mediaUrl;i?.startsWith("http")&&(a=i),a&&Object.assign(o,{"media-url":a});let n=t["update-pasteboard"]||t.updatePasteboard||s;return n&&Object.assign(o,{"update-pasteboard":n}),console.log(JSON.stringify(o)),o}case"Node.js":return}default:return}};if(!this.isMute)switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:$notification.post(e,s,i,r(o));break;case"Quantumult X":$notify(e,s,i,r(o));break;case"Node.js":break}if(!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}debug(...t){this.logLevels[this.logLevel]<=this.logLevels.debug&&(t.length>0&&(this.logs=[...this.logs,...t]),console.log(`${this.logLevelPrefixs.debug}${t.map((t=>t??String(t))).join(this.logSeparator)}`))}info(...t){this.logLevels[this.logLevel]<=this.logLevels.info&&(t.length>0&&(this.logs=[...this.logs,...t]),console.log(`${this.logLevelPrefixs.info}${t.map((t=>t??String(t))).join(this.logSeparator)}`))}warn(...t){this.logLevels[this.logLevel]<=this.logLevels.warn&&(t.length>0&&(this.logs=[...this.logs,...t]),console.log(`${this.logLevelPrefixs.warn}${t.map((t=>t??String(t))).join(this.logSeparator)}`))}error(...t){this.logLevels[this.logLevel]<=this.logLevels.error&&(t.length>0&&(this.logs=[...this.logs,...t]),console.log(`${this.logLevelPrefixs.error}${t.map((t=>t??String(t))).join(this.logSeparator)}`))}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.map((t=>t??String(t))).join(this.logSeparator))}logErr(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:this.log("",`❗️${this.name}, 错误!`,e,t);break;case"Node.js":this.log("",`❗️${this.name}, 错误!`,e,void 0!==t.message?t.message:t,t.stack);break}}wait(t){return new Promise((e=>setTimeout(e,t)))}done(t={}){const e=((new Date).getTime()-this.startTime)/1e3;switch(this.log("",`🔔${this.name}, 结束! 🕛 ${e} 秒`),this.log(),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:$done(t);break;case"Node.js":process.exit(1)}}}(t,e)}