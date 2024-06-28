const $ = new Env('海天美味馆')
const HaiTian = ($.isNode() ? JSON.parse(process.env.HaiTian) : $.getjson("HaiTian")) || [];
let shareCodeArr = []
let token = ''
let hadayToken = ''
let uuid = ''
let notice = ''
let activityId = 'jfcj0627'
!(async () => {
    if (typeof $request != "undefined") {
        if ($request.url.includes('cmallapi')) {
            await getToken();
        }
        if ($request.url.includes('cmallwap')) {
            await getHadayToken();
        }
    } else {
        await main();
    }
})().catch((e) => {$.log(e)}).finally(() => {$.done({});});

async function main() {
    console.log('作者：@xzxxn777\n频道：https://t.me/xzxxn777\n群组：https://t.me/xzxxn7777\n自用机场推荐：https://xn--diqv0fut7b.com\n')
    for (const item of HaiTian) {
        id = item.id;
        token = item.token;
        hadayToken = item.hadayToken;
        uuid = item.uuid;
        let activityInfo = await commonGet('/sign/activity/code?activityCode=')
        if (activityInfo.code == 403) {
            $.msg($.name, `用户：${id}`, `token已过期，请重新获取`);
            continue
        }
        let shareCode = await commonGet(`/lucky/task/share/code/${activityId}`)
        console.log(`助力码：${shareCode.share_code}`)
        shareCodeArr.push(shareCode.share_code)
    }
    for (const item of HaiTian) {
        id = item.id;
        token = item.token;
        hadayToken = item.hadayToken;
        uuid = item.uuid;
        console.log(`用户：${id}开始任务`)
        console.log('每日签到')
        let activityInfo = await commonGet('/sign/activity/code?activityCode=')
        if (activityInfo.code == 403) {
            $.msg($.name, `用户：${id}`, `token已过期，请重新获取`);
            continue
        }
        let memberInfo = await commonGet(`/sign/activity/member/info?activityCode=${activityInfo.activity_code}`)
        if (memberInfo.is_sign) {
            console.log('今日已签到')
        } else {
            let sign = await commonPost('/sign/activity/sign',{"activity_code":activityInfo.activity_code,"fill_date":""})
            if (sign.is_sign) {
                console.log('签到成功')
            } else {
                console.log(sign.message)
            }
        }
        console.log('答题')
        let getTodayQuizQuestion = await commonGet('/quiz/getTodayQuizQuestion?id=13')
        let answers = getTodayQuizQuestion.data.answers;
        let doAnswer = await commonPost(`/quiz/doAnswer?quiz_id=${getTodayQuizQuestion.data.quiz_id}&quiz_question_id=${getTodayQuizQuestion.data.id}&answer=0,1,2,3`,{})
        console.log('浏览页面')
        let browsePage = await commonPost('/members/browsePage',{})
        console.log(browsePage.message)
        console.log('浏览社区')
        let commnity = await commnityPost('/members/commnity/brosing/duration/add?seconds=100',{})
        console.log(commnity)
        console.log('走心评论')
        let list = await cmallwapPost('/haday/wx/blog/nolikeList?pageSize=10&pageNum=1&types=1&essence=1&showAllUser=1',{})
        let articleId = list.data.rows[0].id
        let adComment = await cmallwapPost('/haday/wx/comment/add',{"blogId":articleId,"comment":"每天一条走心评论。。。","pcommentId":"","pcommentUserId":"","pcommentUserName":"","pparentId":""})
        if (adComment.statusCode == 403) {
            $.msg($.name, `用户：${id}`, `hadayToken已过期，请重新获取`);
            continue
        }
        console.log(adComment.errorMsg)
        console.log('关注官号')
        let follow = await cmallwapPost('/haday/wx/like/follow',{"likeUserId":"2f03a8263da24c7dafb6afc703eadf2c"})
        console.log(follow.errorMsg)
        console.log('天天抽奖')
        for (const shareCode of shareCodeArr) {
            let help = await helpPost(`/lucky/task/share/code/success/${shareCode}`)
            if (help) {
                console.log(help.message)
            } else {
                console.log(`助力成功`)
            }
        }
        let taskList = await commonGet(`/lucky/task/package/${activityId}`)
        for (const task of taskList.task_list) {
            console.log(`任务：${task.task_name}`)
            if (task.today_obtained_task_number < task.today_available_task_number) {
                if (task.task_key == 'LOGIN') {
                    let finish = await commonPut(`/lucky/task/getLoginOpporturnity/${activityId}`,{})
                    console.log(finish)
                }
                if (task.task_key == 'POINT_EXCHANGE') {
                    for (let i = task.today_obtained_task_number; i < task.today_available_task_number; i++) {
                        let redeem = await commonGet(`/lucky/activity/redeem?activityCode=${activityId}`)
                        console.log('兑换成功')
                        await $.wait(2000)
                    }
                }
                if (task.task_key == 'BROWSE_PAGE_TASK') {
                    let start = await commonGet(`/lucky/task/browse/page/start/${activityId}?pageUrl=${task.link}`)
                    await $.wait(10000)
                    let end = await commonGet(`/lucky/task/browse/page/end/${activityId}?pageUrl=${task.link}`)
                    if (end) {
                        console.log(end.message)
                    } else {
                        console.log('浏览成功')
                    }
                }
            } else {
                console.log('今日已完成')
            }
        }
        while (true) {
            let luckyDraw = await commonGet(`/lucky/activity/extract?activityCode=${activityId}`)
            if (luckyDraw.lucky_record_vo) {
                console.log(`抽奖获得：${luckyDraw.lucky_record_vo.prize_name}`)
            } else if (luckyDraw.message) {
                console.log(luckyDraw.message)
                break
            }
        }
        console.log("查询积分")
        let points = await commonGet('/members/points/current')
        console.log(`拥有积分: ${points.consum_point}\n`)
        notice += `用户：${id} 拥有积分: ${points.consum_point}\n`
    }
    if (notice) {
        $.msg($.name, '', notice);
    }
}

async function getToken() {
    const token = $request.headers["Authorization"] || $request.headers["authorization"];
    const uuid = $request.headers["uuid"] || $request.headers["uuid"];
    if (!token || !uuid) {
        return
    }
    const body = $.toObj($response.body);
    if (!body|| !body.mobile) {
        return
    }
    const id = body.mobile;
    const newData = {"id": id, "token": token, "hadayToken": "","uuid": uuid};
    const index = HaiTian.findIndex(e => e.id == newData.id);
    if (index !== -1) {
        if (HaiTian[index].token == newData.token) {
            return
        } else {
            HaiTian[index] = newData;
            console.log(newData.token)
            $.msg($.name, `🎉用户${newData.id}更新token成功!`, ``);
        }
    } else {
        HaiTian.push(newData)
        console.log(newData.token)
        $.msg($.name, `🎉新增用户${newData.id}成功!`, ``);
    }
    $.setjson(HaiTian, "HaiTian");
}

async function getHadayToken() {
    const hadayToken = $request.headers["X-Haday-Token"] || $request.headers["x-haday-token"];
    const uuid = $request.headers["uuid"] || $request.headers["uuid"];
    if (!hadayToken || !uuid) {
        return
    }
    const body = $.toObj($response.body);
    if (!body|| !body.data) {
        return
    }
    const id = body.data.mobile;
    const index = HaiTian.findIndex(e => e.id == id);
    if (index !== -1) {
        if (HaiTian[index].hadayToken == hadayToken) {
            return
        } else {
            HaiTian[index].hadayToken = hadayToken;
            console.log(hadayToken)
            $.msg($.name, `🎉用户${id}更新hadayToken成功!`, ``);
        }
    } else {
        $.msg($.name, `请先获取token`, ``);
    }
    $.setjson(HaiTian, "HaiTian");
}

async function commonGet(url) {
    return new Promise(resolve => {
        const options = {
            url: `https://cmallapi.haday.cn/buyer-api${url}`,
            headers : {
                'Connection': 'keep-alive',
                'authorization': token,
                'uuid': uuid,
                'content-type': 'application/x-www-form-urlencoded',
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 MicroMessenger/6.8.0(0x16080000) NetType/WIFI MiniProgramEnv/Mac MacWechat/WMPF MacWechat/3.8.8(0x13080812) XWEB/1216',
                'envVersion': 'release',
                'accept': '*/*',
                'Sec-Fetch-Site': 'cross-site',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Dest': 'empty',
                'Referer': 'https://servicewechat.com/wx7a890ea13f50d7b6/597/page-frame.html',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'zh-CN,zh;q=0.9'
            }
        }
        $.get(options, async (err, resp, data) => {
            try {
                if (err) {
                    if (data) {
                        await $.wait(2000)
                        resolve(JSON.parse(data));
                    } else {
                        console.log(`${JSON.stringify(err)}`)
                        console.log(`${$.name} API请求失败，请检查网路重试`)
                    }
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

async function helpPost(url) {
    return new Promise(resolve => {
        const options = {
            url: `https://cmallapi.haday.cn/buyer-api${url}`,
            headers : {
                'Connection': 'keep-alive',
                'authorization': token,
                'uuid': uuid,
                'content-type': 'application/x-www-form-urlencoded',
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 MicroMessenger/6.8.0(0x16080000) NetType/WIFI MiniProgramEnv/Mac MacWechat/WMPF MacWechat/3.8.8(0x13080812) XWEB/1216',
                'envVersion': 'release',
                'accept': '*/*',
                'Sec-Fetch-Site': 'cross-site',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Dest': 'empty',
                'Referer': 'https://servicewechat.com/wx7a890ea13f50d7b6/597/page-frame.html',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'zh-CN,zh;q=0.9'
            }
        }
        $.post(options, async (err, resp, data) => {
            try {
                if (err) {
                    if (data) {
                        await $.wait(2000)
                        resolve(JSON.parse(data));
                    } else {
                        console.log(`${JSON.stringify(err)}`)
                        console.log(`${$.name} API请求失败，请检查网路重试`)
                    }
                } else {
                    await $.wait(2000)
                    if (data) {
                        data = JSON.parse(data)
                    }
                    resolve(data);
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve();
            }
        })
    })
}

async function commonPost(url, body) {
    return new Promise(resolve => {
        const options = {
            url: `https://cmallapi.haday.cn/buyer-api${url}`,
            headers : {
                'Connection': 'keep-alive',
                'authorization': token,
                'uuid': uuid,
                'content-type': 'application/json',
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 MicroMessenger/6.8.0(0x16080000) NetType/WIFI MiniProgramEnv/Mac MacWechat/WMPF MacWechat/3.8.8(0x13080812) XWEB/1216',
                'envVersion': 'release',
                'accept': '*/*',
                'Sec-Fetch-Site': 'cross-site',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Dest': 'empty',
                'Referer': 'https://servicewechat.com/wx7a890ea13f50d7b6/597/page-frame.html',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'zh-CN,zh;q=0.9'
            },
            body: JSON.stringify(body)
        }
        $.post(options, async (err, resp, data) => {
            try {
                if (err) {
                    if (data) {
                        await $.wait(2000)
                        resolve(JSON.parse(data));
                    } else {
                        console.log(`${JSON.stringify(err)}`)
                        console.log(`${$.name} API请求失败，请检查网路重试`)
                    }
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

async function commnityPost(url, body) {
    return new Promise(resolve => {
        const options = {
            url: `https://cmallapi.haday.cn/buyer-api${url}`,
            headers : {
                'Connection': 'keep-alive',
                'authorization': token,
                'uuid': uuid,
                'content-type': 'application/json',
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 MicroMessenger/6.8.0(0x16080000) NetType/WIFI MiniProgramEnv/Mac MacWechat/WMPF MacWechat/3.8.8(0x13080812) XWEB/1216',
                'envVersion': 'release',
                'accept': '*/*',
                'Sec-Fetch-Site': 'cross-site',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Dest': 'empty',
                'Referer': 'https://servicewechat.com/wx7a890ea13f50d7b6/597/page-frame.html',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'zh-CN,zh;q=0.9'
            },
            body: JSON.stringify(body)
        }
        $.post(options, async (err, resp, data) => {
            try {
                if (err) {
                    if (data) {
                        await $.wait(2000)
                        resolve(data);
                    } else {
                        console.log(`${JSON.stringify(err)}`)
                        console.log(`${$.name} API请求失败，请检查网路重试`)
                    }
                } else {
                    await $.wait(2000)
                    resolve(data);
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve();
            }
        })
    })
}

async function commonPut(url, body) {
    return new Promise(resolve => {
        const options = {
            method: 'PUT',
            url: `https://cmallapi.haday.cn/buyer-api${url}`,
            headers : {
                'Connection': 'keep-alive',
                'authorization': token,
                'uuid': uuid,
                'content-type': 'application/json',
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 MicroMessenger/6.8.0(0x16080000) NetType/WIFI MiniProgramEnv/Mac MacWechat/WMPF MacWechat/3.8.8(0x13080812) XWEB/1216',
                'envVersion': 'release',
                'accept': '*/*',
                'Sec-Fetch-Site': 'cross-site',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Dest': 'empty',
                'Referer': 'https://servicewechat.com/wx7a890ea13f50d7b6/597/page-frame.html',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'zh-CN,zh;q=0.9'
            },
            body: JSON.stringify(body)
        }
        $.post(options, async (err, resp, data) => {
            try {
                if (err) {
                    if (data) {
                        await $.wait(2000)
                        resolve(JSON.parse(data));
                    } else {
                        console.log(`${JSON.stringify(err)}`)
                        console.log(`${$.name} API请求失败，请检查网路重试`)
                    }
                } else {
                    await $.wait(2000)
                    resolve(data);
                }
            } catch (e) {
                $.logErr(e, resp)
            } finally {
                resolve();
            }
        })
    })
}

async function cmallwapPost(url, body) {
    return new Promise(resolve => {
        const options = {
            url: `https://cmallwap.haday.cn${url}`,
            headers : {
                'Connection': 'keep-alive',
                'X-Haday-Token': hadayToken,
                'uuid': uuid,
                'content-type': 'application/json',
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 MicroMessenger/6.8.0(0x16080000) NetType/WIFI MiniProgramEnv/Mac MacWechat/WMPF MacWechat/3.8.8(0x13080812) XWEB/1216',
                'envVersion': 'release',
                'accept': '*/*',
                'Sec-Fetch-Site': 'cross-site',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Dest': 'empty',
                'Referer': 'https://servicewechat.com/wx7a890ea13f50d7b6/597/page-frame.html',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'zh-CN,zh;q=0.9'
            },
            body: JSON.stringify(body)
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

// prettier-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise(((e,i)=>{s.call(this,t,((t,s,o)=>{t?i(t):e(s)}))}))}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.logLevels={debug:0,info:1,warn:2,error:3},this.logLevelPrefixs={debug:"[DEBUG] ",info:"[INFO] ",warn:"[WARN] ",error:"[ERROR] "},this.logLevel="info",this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}getEnv(){return"undefined"!=typeof $environment&&$environment["surge-version"]?"Surge":"undefined"!=typeof $environment&&$environment["stash-version"]?"Stash":"undefined"!=typeof module&&module.exports?"Node.js":"undefined"!=typeof $task?"Quantumult X":"undefined"!=typeof $loon?"Loon":"undefined"!=typeof $rocket?"Shadowrocket":void 0}isNode(){return"Node.js"===this.getEnv()}isQuanX(){return"Quantumult X"===this.getEnv()}isSurge(){return"Surge"===this.getEnv()}isLoon(){return"Loon"===this.getEnv()}isShadowrocket(){return"Shadowrocket"===this.getEnv()}isStash(){return"Stash"===this.getEnv()}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null,...s){try{return JSON.stringify(t,...s)}catch{return e}}getjson(t,e){let s=e;if(this.getdata(t))try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise((e=>{this.get({url:t},((t,s,i)=>e(i)))}))}runScript(t,e){return new Promise((s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let o=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");o=o?1*o:20,o=e&&e.timeout?e.timeout:o;const[r,a]=i.split("@"),n={url:`http://${a}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:o},headers:{"X-Key":r,Accept:"*/*"},timeout:o};this.post(n,((t,e,i)=>s(i)))})).catch((t=>this.logErr(t)))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),o=JSON.stringify(this.data);s?this.fs.writeFileSync(t,o):i?this.fs.writeFileSync(e,o):this.fs.writeFileSync(t,o)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let o=t;for(const t of i)if(o=Object(o)[t],void 0===o)return s;return o}lodash_set(t,e,s){return Object(t)!==t||(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce(((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{}),t)[e[e.length-1]]=s),t}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),o=s?this.getval(s):"";if(o)try{const t=JSON.parse(o);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,o]=/^@(.*?)\.(.*?)$/.exec(e),r=this.getval(i),a=i?"null"===r?null:r||"{}":"{}";try{const e=JSON.parse(a);this.lodash_set(e,o,t),s=this.setval(JSON.stringify(e),i)}catch(e){const r={};this.lodash_set(r,o,t),s=this.setval(JSON.stringify(r),i)}}else s=this.setval(t,e);return s}getval(t){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.read(t);case"Quantumult X":return $prefs.valueForKey(t);case"Node.js":return this.data=this.loaddata(),this.data[t];default:return this.data&&this.data[t]||null}}setval(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.write(t,e);case"Quantumult X":return $prefs.setValueForKey(t,e);case"Node.js":return this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0;default:return this.data&&this.data[e]||null}}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.cookie&&void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar)))}get(t,e=(()=>{})){switch(t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"],delete t.headers["content-type"],delete t.headers["content-length"]),t.params&&(t.url+="?"+this.queryStr(t.params)),void 0===t.followRedirect||t.followRedirect||((this.isSurge()||this.isLoon())&&(t["auto-redirect"]=!1),this.isQuanX()&&(t.opts?t.opts.redirection=!1:t.opts={redirection:!1})),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,((t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,i)}));break;case"Quantumult X":this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then((t=>{const{statusCode:s,statusCode:i,headers:o,body:r,bodyBytes:a}=t;e(null,{status:s,statusCode:i,headers:o,body:r,bodyBytes:a},r,a)}),(t=>e(t&&t.error||"UndefinedError")));break;case"Node.js":let s=require("iconv-lite");this.initGotEnv(t),this.got(t).on("redirect",((t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}})).then((t=>{const{statusCode:i,statusCode:o,headers:r,rawBody:a}=t,n=s.decode(a,this.encoding);e(null,{status:i,statusCode:o,headers:r,rawBody:a,body:n},n)}),(t=>{const{message:i,response:o}=t;e(i,o,o&&s.decode(o.rawBody,this.encoding))}));break}}post(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"post";switch(t.body&&t.headers&&!t.headers["Content-Type"]&&!t.headers["content-type"]&&(t.headers["content-type"]="application/x-www-form-urlencoded"),t.headers&&(delete t.headers["Content-Length"],delete t.headers["content-length"]),void 0===t.followRedirect||t.followRedirect||((this.isSurge()||this.isLoon())&&(t["auto-redirect"]=!1),this.isQuanX()&&(t.opts?t.opts.redirection=!1:t.opts={redirection:!1})),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](t,((t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,i)}));break;case"Quantumult X":t.method=s,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then((t=>{const{statusCode:s,statusCode:i,headers:o,body:r,bodyBytes:a}=t;e(null,{status:s,statusCode:i,headers:o,body:r,bodyBytes:a},r,a)}),(t=>e(t&&t.error||"UndefinedError")));break;case"Node.js":let i=require("iconv-lite");this.initGotEnv(t);const{url:o,...r}=t;this.got[s](o,r).then((t=>{const{statusCode:s,statusCode:o,headers:r,rawBody:a}=t,n=i.decode(a,this.encoding);e(null,{status:s,statusCode:o,headers:r,rawBody:a,body:n},n)}),(t=>{const{message:s,response:o}=t;e(s,o,o&&i.decode(o.rawBody,this.encoding))}));break}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}queryStr(t){let e="";for(const s in t){let i=t[s];null!=i&&""!==i&&("object"==typeof i&&(i=JSON.stringify(i)),e+=`${s}=${i}&`)}return e=e.substring(0,e.length-1),e}msg(e=t,s="",i="",o={}){const r=t=>{const{$open:e,$copy:s,$media:i,$mediaMime:o}=t;switch(typeof t){case void 0:return t;case"string":switch(this.getEnv()){case"Surge":case"Stash":default:return{url:t};case"Loon":case"Shadowrocket":return t;case"Quantumult X":return{"open-url":t};case"Node.js":return}case"object":switch(this.getEnv()){case"Surge":case"Stash":case"Shadowrocket":default:{const r={};let a=t.openUrl||t.url||t["open-url"]||e;a&&Object.assign(r,{action:"open-url",url:a});let n=t["update-pasteboard"]||t.updatePasteboard||s;if(n&&Object.assign(r,{action:"clipboard",text:n}),i){let t,e,s;if(i.startsWith("http"))t=i;else if(i.startsWith("data:")){const[t]=i.split(";"),[,o]=i.split(",");e=o,s=t.replace("data:","")}else{e=i,s=(t=>{const e={JVBERi0:"application/pdf",R0lGODdh:"image/gif",R0lGODlh:"image/gif",iVBORw0KGgo:"image/png","/9j/":"image/jpg"};for(var s in e)if(0===t.indexOf(s))return e[s];return null})(i)}Object.assign(r,{"media-url":t,"media-base64":e,"media-base64-mime":o??s})}return Object.assign(r,{"auto-dismiss":t["auto-dismiss"],sound:t.sound}),r}case"Loon":{const s={};let o=t.openUrl||t.url||t["open-url"]||e;o&&Object.assign(s,{openUrl:o});let r=t.mediaUrl||t["media-url"];return i?.startsWith("http")&&(r=i),r&&Object.assign(s,{mediaUrl:r}),console.log(JSON.stringify(s)),s}case"Quantumult X":{const o={};let r=t["open-url"]||t.url||t.openUrl||e;r&&Object.assign(o,{"open-url":r});let a=t["media-url"]||t.mediaUrl;i?.startsWith("http")&&(a=i),a&&Object.assign(o,{"media-url":a});let n=t["update-pasteboard"]||t.updatePasteboard||s;return n&&Object.assign(o,{"update-pasteboard":n}),console.log(JSON.stringify(o)),o}case"Node.js":return}default:return}};if(!this.isMute)switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:$notification.post(e,s,i,r(o));break;case"Quantumult X":$notify(e,s,i,r(o));break;case"Node.js":break}if(!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}debug(...t){this.logLevels[this.logLevel]<=this.logLevels.debug&&(t.length>0&&(this.logs=[...this.logs,...t]),console.log(`${this.logLevelPrefixs.debug}${t.map((t=>t??String(t))).join(this.logSeparator)}`))}info(...t){this.logLevels[this.logLevel]<=this.logLevels.info&&(t.length>0&&(this.logs=[...this.logs,...t]),console.log(`${this.logLevelPrefixs.info}${t.map((t=>t??String(t))).join(this.logSeparator)}`))}warn(...t){this.logLevels[this.logLevel]<=this.logLevels.warn&&(t.length>0&&(this.logs=[...this.logs,...t]),console.log(`${this.logLevelPrefixs.warn}${t.map((t=>t??String(t))).join(this.logSeparator)}`))}error(...t){this.logLevels[this.logLevel]<=this.logLevels.error&&(t.length>0&&(this.logs=[...this.logs,...t]),console.log(`${this.logLevelPrefixs.error}${t.map((t=>t??String(t))).join(this.logSeparator)}`))}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.map((t=>t??String(t))).join(this.logSeparator))}logErr(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:this.log("",`❗️${this.name}, 错误!`,e,t);break;case"Node.js":this.log("",`❗️${this.name}, 错误!`,e,void 0!==t.message?t.message:t,t.stack);break}}wait(t){return new Promise((e=>setTimeout(e,t)))}done(t={}){const e=((new Date).getTime()-this.startTime)/1e3;switch(this.log("",`🔔${this.name}, 结束! 🕛 ${e} 秒`),this.log(),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:$done(t);break;case"Node.js":process.exit(1)}}}(t,e)}