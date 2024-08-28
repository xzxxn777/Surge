/**
 * cron "35 0-23/1 * * *" XiJiu.js
 * export XiJiu='[{"id": "1", "loginCode": "1"},{"id": "2", "loginCode": "2"}]'
 * export XiJiu_Exchange='true'//酒换积分
 * export OCR_SERVER="ocr服务"
 */
const $ = new Env('习酒');
const notify = $.isNode() ? require('../sendNotify') : '';
const XiJiu = ($.isNode() ? JSON.parse(process.env.XiJiu) : $.getjson("XiJiu")) || [];
const XiJiu_Exchange = ($.isNode() ? process.env.XiJiu_Exchange : $.getdata("XiJiu_Exchange")) === 'true' || false;
const OCR_SERVER = ($.isNode() ? process.env.OCR_SERVER : $.getdata("OCR_SERVER")) || 'https://ddddocr.xzxxn7.live';
let cropType = [{"1":"高粱"},{"2":"小麦"}];
let loginCode = '';
let token = '';
let notice = '';
!(async () => {
    if (typeof $request != "undefined") {
        await getCookie();
    } else {
        await main();
    }
})().catch((e) => {$.log(e)}).finally(() => {$.done({});});

async function main() {
    console.log('作者：@xzxxn777\n频道：https://t.me/xzxxn777\n群组：https://t.me/xzxxn7777\n自用机场推荐：https://xn--diqv0fut7b.com\n')
    for (const item of XiJiu) {
        id = item.id;
        loginCode = item.loginCode;
        console.log(`用户：${id}开始任务`)
        console.log('获取token')
        let login = await loginGet(`/anti-channeling/public/index.php/api/v2/Member/getJwt`);
        if (login.code != 0) {
            console.log(login.msg)
            continue
        }
        token = login.data.jwt;
        console.log(token)
        //签到
        console.log("开始签到")
        let sign = await commonPost("/member/Signin/sign",'from=miniprogram_index');
        console.log(sign.msg)
        //农场
        //每日验证
        console.log("————————————")
        console.log("开始每日验证")
        let getValidateInfo = await commonGet(`/garden/slide_validate/getValidateInfo`);
        if (getValidateInfo.data.status == 1) {
            let slidingImage = getValidateInfo.data.datas[1].split(",")[1];
            let backImage = getValidateInfo.data.datas[0].split(",")[1];
            let getXpos = await slidePost({'slidingImage': slidingImage, 'backImage': backImage})
            if (!getXpos) {
                console.log("ddddocr服务异常")
                await sendMsg('ddddocr服务异常');
                break
            }
            console.log(getXpos)
            let toValidate = await commonPost(`/garden/slide_validate/toValidate`,JSON.stringify({"coordinate":getXpos.result}));
            console.log(toValidate.msg)
        } else {
            console.log(getValidateInfo.msg)
        }
        //每日签到
        console.log("————————————")
        console.log("开始每日签到")
        let dailySign = await commonPost("/garden/sign/dailySign",JSON.stringify({}));
        if (dailySign.data.isTodayFirstSign) {
            console.log(dailySign.data.tips)
        } else {
            console.log('今日已签到')
        }
        //种植
        console.log("————————————")
        console.log("开始种植")
        let getMemberInfo = await commonGet("/garden/Gardenmemberinfo/getMemberInfo");
        console.log(`拥有：高粱*${getMemberInfo.data.sorghum} 小麦*${getMemberInfo.data.wheat} 酒曲*${getMemberInfo.data.wine_yeast} 酒*${getMemberInfo.data.wine} 水*${getMemberInfo.data.water} 肥料*${getMemberInfo.data.manure}`)
        let lands = await commonGet("/garden/sorghum/index");
        let unLock = true
        for (let land of lands.data) {
            if (land.status == -1) {
                console.log(`第${land.serial_number}块地：未解锁`)
                //解锁
                if (unLock) {
                    console.log(`开始解锁土地`)
                    let extend = await commonPost(`/garden/sorghum/extend`,JSON.stringify({"serial_number":land.serial_number}))
                    if (extend.err == 0) {
                        console.log(extend.msg)
                        //种植
                        console.log(`开始种植`)
                        getMemberInfo = await commonGet("/garden/Gardenmemberinfo/getMemberInfo");
                        if (getMemberInfo.data.wine_yeast > 0) {
                            //高粱
                            let seed = await commonPost(`/garden/sorghum/seed`,JSON.stringify({"id":land.id,"type":1}))
                            if (seed.err == 61010) {
                                await sendMsg(`用户：${id}\n${seed.msg}`);
                            }
                            console.log(seed.msg)
                        } else {
                            //小麦
                            let seed = await commonPost(`/garden/sorghum/seed`,JSON.stringify({"id":land.id,"type":2}))
                            if (seed.err == 61010) {
                                await sendMsg(`用户：${id}\n${seed.msg}`);
                            }
                            console.log(seed.msg)
                        }
                    } else {
                        console.log(extend.msg)
                        unLock = false
                    }
                }
            } else {
                console.log(`第${land.serial_number}块地：已解锁`)
                let name = cropType.find(item => land.type in item)[land.type];
                console.log(`种植：${name}*${land.volumn} 收获时间：${land.crop_time}`)
                if (land.status == 0) {
                    console.log(`${name}已收获，未种植`)
                    console.log(`开始种植`)
                    getMemberInfo = await commonGet("/garden/Gardenmemberinfo/getMemberInfo");
                    if (getMemberInfo.data.wine_yeast > 0) {
                        //高粱
                        let seed = await commonPost(`/garden/sorghum/seed`,JSON.stringify({"id":land.id,"type":1}))
                        if (seed.err == 61010) {
                            await sendMsg(`用户：${id}\n${seed.msg}`);
                        }
                        console.log(seed.msg)
                    } else {
                        //小麦
                        let seed = await commonPost(`/garden/sorghum/seed`,JSON.stringify({"id":land.id,"type":2}))
                        if (seed.err == 61010) {
                            await sendMsg(`用户：${id}\n${seed.msg}`);
                        }
                        console.log(seed.msg)
                    }
                } else if (land.status == 2) {
                    console.log(`${name}已成熟，开始收获`)
                    let harvest = await commonPost(`/garden/sorghum/harvest`,JSON.stringify({"id":land.id}));
                    console.log(harvest.msg)
                    console.log(`开始种植`)
                    getMemberInfo = await commonGet("/garden/Gardenmemberinfo/getMemberInfo");
                    if (getMemberInfo.data.wine_yeast > 0) {
                        //高粱
                        let seed = await commonPost(`/garden/sorghum/seed`,JSON.stringify({"id":land.id,"type":1}))
                        if (seed.err == 61010) {
                            await sendMsg(`用户：${id}\n${seed.msg}`);
                        }
                        console.log(seed.msg)
                    } else {
                        //小麦
                        let seed = await commonPost(`/garden/sorghum/seed`,JSON.stringify({"id":land.id,"type":2}))
                        if (seed.err == 61010) {
                            await sendMsg(`用户：${id}\n${seed.msg}`);
                        }
                        console.log(seed.msg)
                    }
                } else {
                    let code = 0
                    while (code == 0) {
                        let watering = await commonPost(`/garden/sorghum/watering`,JSON.stringify({"id":land.id}));
                        console.log(watering.msg)
                        code = watering.err
                    }
                    code = 0
                    while (code == 0) {
                        let manuring = await commonPost(`/garden/sorghum/manuring`,JSON.stringify({"id":land.id}));
                        console.log(manuring.msg)
                        code = manuring.err
                    }
                }
                lands = await commonGet("/garden/sorghum/index");
                const i = lands.data.findIndex(e => e.id == land.id);
                if (lands.data[i].status == 2) {
                    console.log(`${name}已成熟，开始收获`)
                    let harvest = await commonPost(`/garden/sorghum/harvest`,JSON.stringify({"id":land.id}));
                    console.log(harvest.msg)
                    console.log(`开始种植`)
                    getMemberInfo = await commonGet("/garden/Gardenmemberinfo/getMemberInfo");
                    if (getMemberInfo.data.wine_yeast > 0) {
                        //高粱
                        let seed = await commonPost(`/garden/sorghum/seed`,JSON.stringify({"id":land.id,"type":1}))
                        if (seed.err == 61010) {
                            await sendMsg(`用户：${id}\n${seed.msg}`);
                        }
                        console.log(seed.msg)
                    } else {
                        //小麦
                        let seed = await commonPost(`/garden/sorghum/seed`,JSON.stringify({"id":land.id,"type":2}))
                        if (seed.err == 61010) {
                            await sendMsg(`用户：${id}\n${seed.msg}`);
                        }
                        console.log(seed.msg)
                    }
                }
                let code = 0
                while (code == 0) {
                    let watering = await commonPost(`/garden/sorghum/watering`,JSON.stringify({"id":land.id}));
                    console.log(watering.msg)
                    code = watering.err
                }
                code = 0
                while (code == 0) {
                    let manuring = await commonPost(`/garden/sorghum/manuring`,JSON.stringify({"id":land.id}));
                    console.log(manuring.msg)
                    code = manuring.err
                }
            }
        }
        //任务
        console.log("————————————")
        console.log("开始做任务")
        let tasks = await commonGet("/garden/tasks/index");
        if (tasks) {
            for (let task of tasks.data) {
                console.log(`任务：${task.name} id：${task.id}`)
                if (task.is_complete == 1) {
                    console.log("任务已完成")
                } else {
                    if (task.id == 1) {
                        let question = await commonGet(`/garden/Gardenquestiontask/index`);
                        let answer = [{"itemid":`${question.data[0].id}`,"selected":`${question.data[0].answer}`}]
                        let answerResults = await commonGet(`/garden/Gardenquestiontask/answerResults?answer=${encodeURI(JSON.stringify(answer))}`);
                        console.log(answerResults.msg)
                    }
                    if (task.id == 2) {
                        for (let i = 0; i < task.limit_num; i++) {
                            let dailyShare = await commonGet("/garden/gardenmemberinfo/dailyShare");
                            console.log(dailyShare.msg)
                        }
                    }
                    if (task.id == 4) {
                        let realScene = await commonGet("/garden/notice/realScene");
                        let reward = await commonGet(`/garden/realscene/reward`);
                        console.log(reward.msg)
                    }
                }
            }
        }
        //添加好友
        console.log("————————————")
        console.log("开始添加好友")
        let addFriendToken = await commonGet("/garden/friends/addFriendToken");
        addFriendToken = addFriendToken.data;
        addFriendToken.friend_id = id
        console.log(`助力码：${JSON.stringify(addFriendToken)}`)
        //let add = await commonPost("/garden/friends/add",JSON.stringify({"friend_id":"15920333","time":"1714111454","token":"d75d8073df5b1d10507d6e30677d68c9"}));
        //console.log(add.msg)
        //制曲
        console.log("————————————")
        console.log("开始制曲")
        let code = 0
        while (code == 0) {
            let makeWineYeast = await makePost("/garden/wheat/makeWineYeast",'volumn=100');
            console.log(makeWineYeast.msg)
            code = makeWineYeast.err
        }
        //制酒
        console.log("————————————")
        console.log("开始制酒")
        let wine = await commonGet("/garden/gardenmemberwine/index");
        if (wine.total == 0) {
            console.log("没有正在酿造的酒，开始制酒")
            let makeWine = await makePost("/garden/gardenmemberwine/makeWine",'volumn=200');
            console.log(makeWine.msg)
        }
        for (let item of wine.data) {
            console.log(`酒*${item.crrent_volumn} 收获时间：${item.crop_time}`)
            if (item.status == 4) {
                let harvestWine = await commonGet(`/garden/gardenmemberwine/harvestWine?id=${item.id}`);
                console.log(harvestWine.msg)
            }
        }
        //兑换
        console.log("————————————")
        console.log("兑换")
        getMemberInfo = await commonGet("/garden/Gardenmemberinfo/getMemberInfo");
        console.log(`拥有酒：${getMemberInfo.data.wine}`)
        if (XiJiu_Exchange) {
            let exchange = await commonGet(`/garden/Gardenjifenshop/exchange?wine=${getMemberInfo.data.wine}`);
            console.log(exchange.msg)
        }
        //查询积分
        console.log("————————————")
        console.log("查询积分")
        getMemberInfo = await commonGet("/garden/Gardenmemberinfo/getMemberInfo");
        console.log(`拥有积分：${getMemberInfo.data.integration} 拥有酒：${getMemberInfo.data.wine}\n`)
        notice += `用户：${id} 积分：${getMemberInfo.data.integration} 酒：${getMemberInfo.data.wine}\n`
    }
    if (notice) {
        await sendMsg(notice);
    }
}

async function getCookie() {
    const loginCode = $request.headers["login_code"];
    if (!loginCode) {
        return
    }
    const body = $.toObj($response.body);
    if (!body.data || !body.data.phone_no) {
        return
    }
    const id = body.data.phone_no;
    const newData = {"id": id, "loginCode": loginCode}
    const index = XiJiu.findIndex(e => e.id == newData.id);
    if (index !== -1) {
        if (XiJiu[index].loginCode == newData.loginCode) {
            return
        } else {
            XiJiu[index] = newData;
            console.log(newData.loginCode)
            $.msg($.name, `🎉用户${newData.id}更新token成功!`, ``);
        }
    } else {
        XiJiu.push(newData)
        console.log(newData.loginCode)
        $.msg($.name, `🎉新增用户${newData.id}成功!`, ``);
    }
    $.setjson(XiJiu, "XiJiu");
}

async function loginGet(url) {
    return new Promise(resolve => {
        const options = {
            url: `https://xcx.exijiu.com${url}`,
            headers : {
                'Connection': 'keep-alive',
                'login_code': loginCode,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF WindowsWechat(0x63090a13) XWEB/9129',
                'Accept': '*/*',
                'Origin': 'https://mallwm.exijiu.com',
                'Sec-Fetch-Site': 'cross-site',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Dest': 'empty',
                'Referer': 'https://servicewechat.com/wx673f827a4c2c94fa/264/page-frame.html',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'zh-CN,zh;q=0.9'
            }
        }
        $.get(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    await $.wait(4000);
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

async function commonPost(url,body = '') {
    return new Promise(resolve => {
        const options = {
            url: `https://apimallwm.exijiu.com${url}`,
            headers : {
                'Connection': 'keep-alive',
                'Authorization': token,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF WindowsWechat(0x63090a13) XWEB/9129',
                'Content-Type': 'application/json',
                'Accept': '*/*',
                'Origin': 'https://mallwm.exijiu.com',
                'Sec-Fetch-Site': 'cross-site',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Dest': 'empty',
                'Referer': 'https://servicewechat.com/wx673f827a4c2c94fa/264/page-frame.html',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'zh-CN,zh;q=0.9'
            },
            body: body,
        }
        $.post(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    await $.wait(4000);
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

async function makePost(url,body = '') {
    return new Promise(resolve => {
        const options = {
            url: `https://apimallwm.exijiu.com${url}`,
            headers : {
                'Connection': 'keep-alive',
                'Authorization': token,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF WindowsWechat(0x63090a13) XWEB/9129',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json, text/plain, */*',
                'Origin': 'https://mallwm.exijiu.com',
                'Sec-Fetch-Site': 'cross-site',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Dest': 'empty',
                'Referer': 'https://servicewechat.com/wx673f827a4c2c94fa/264/page-frame.html',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'zh-CN,zh;q=0.9'
            },
            body: body,
        }
        $.post(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    await $.wait(4000);
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
            url: `https://apimallwm.exijiu.com${url}`,
            headers : {
                'Connection': 'keep-alive',
                'Authorization': token,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF WindowsWechat(0x63090a13) XWEB/9129',
                'Content-Type': 'application/json',
                'Accept': '*/*',
                'Origin': 'https://mallwm.exijiu.com',
                'Sec-Fetch-Site': 'cross-site',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Dest': 'empty',
                'Referer': 'https://servicewechat.com/wx673f827a4c2c94fa/264/page-frame.html',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'zh-CN,zh;q=0.9'
            }
        }
        $.get(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    await $.wait(4000);
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

async function slidePost(body) {
    return new Promise(resolve => {
        const options = {
            url: `${OCR_SERVER}/capcode`,
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

async function sendMsg(message) {
    if ($.isNode()) {
        await notify.sendNotify($.name, message);
    } else {
        $.msg($.name, '', message)
    }
}

// prettier-ignore
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise(((e,i)=>{s.call(this,t,((t,s,o)=>{t?i(t):e(s)}))}))}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.logLevels={debug:0,info:1,warn:2,error:3},this.logLevelPrefixs={debug:"[DEBUG] ",info:"[INFO] ",warn:"[WARN] ",error:"[ERROR] "},this.logLevel="info",this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}getEnv(){return"undefined"!=typeof $environment&&$environment["surge-version"]?"Surge":"undefined"!=typeof $environment&&$environment["stash-version"]?"Stash":"undefined"!=typeof module&&module.exports?"Node.js":"undefined"!=typeof $task?"Quantumult X":"undefined"!=typeof $loon?"Loon":"undefined"!=typeof $rocket?"Shadowrocket":void 0}isNode(){return"Node.js"===this.getEnv()}isQuanX(){return"Quantumult X"===this.getEnv()}isSurge(){return"Surge"===this.getEnv()}isLoon(){return"Loon"===this.getEnv()}isShadowrocket(){return"Shadowrocket"===this.getEnv()}isStash(){return"Stash"===this.getEnv()}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null,...s){try{return JSON.stringify(t,...s)}catch{return e}}getjson(t,e){let s=e;if(this.getdata(t))try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise((e=>{this.get({url:t},((t,s,i)=>e(i)))}))}runScript(t,e){return new Promise((s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let o=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");o=o?1*o:20,o=e&&e.timeout?e.timeout:o;const[r,a]=i.split("@"),n={url:`http://${a}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:o},headers:{"X-Key":r,Accept:"*/*"},timeout:o};this.post(n,((t,e,i)=>s(i)))})).catch((t=>this.logErr(t)))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),o=JSON.stringify(this.data);s?this.fs.writeFileSync(t,o):i?this.fs.writeFileSync(e,o):this.fs.writeFileSync(t,o)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let o=t;for(const t of i)if(o=Object(o)[t],void 0===o)return s;return o}lodash_set(t,e,s){return Object(t)!==t||(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce(((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{}),t)[e[e.length-1]]=s),t}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),o=s?this.getval(s):"";if(o)try{const t=JSON.parse(o);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,o]=/^@(.*?)\.(.*?)$/.exec(e),r=this.getval(i),a=i?"null"===r?null:r||"{}":"{}";try{const e=JSON.parse(a);this.lodash_set(e,o,t),s=this.setval(JSON.stringify(e),i)}catch(e){const r={};this.lodash_set(r,o,t),s=this.setval(JSON.stringify(r),i)}}else s=this.setval(t,e);return s}getval(t){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.read(t);case"Quantumult X":return $prefs.valueForKey(t);case"Node.js":return this.data=this.loaddata(),this.data[t];default:return this.data&&this.data[t]||null}}setval(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.write(t,e);case"Quantumult X":return $prefs.setValueForKey(t,e);case"Node.js":return this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0;default:return this.data&&this.data[e]||null}}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.cookie&&void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar)))}get(t,e=(()=>{})){switch(t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"],delete t.headers["content-type"],delete t.headers["content-length"]),t.params&&(t.url+="?"+this.queryStr(t.params)),void 0===t.followRedirect||t.followRedirect||((this.isSurge()||this.isLoon())&&(t["auto-redirect"]=!1),this.isQuanX()&&(t.opts?t.opts.redirection=!1:t.opts={redirection:!1})),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,((t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,i)}));break;case"Quantumult X":this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then((t=>{const{statusCode:s,statusCode:i,headers:o,body:r,bodyBytes:a}=t;e(null,{status:s,statusCode:i,headers:o,body:r,bodyBytes:a},r,a)}),(t=>e(t&&t.error||"UndefinedError")));break;case"Node.js":let s=require("iconv-lite");this.initGotEnv(t),this.got(t).on("redirect",((t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}})).then((t=>{const{statusCode:i,statusCode:o,headers:r,rawBody:a}=t,n=s.decode(a,this.encoding);e(null,{status:i,statusCode:o,headers:r,rawBody:a,body:n},n)}),(t=>{const{message:i,response:o}=t;e(i,o,o&&s.decode(o.rawBody,this.encoding))}));break}}post(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"post";switch(t.body&&t.headers&&!t.headers["Content-Type"]&&!t.headers["content-type"]&&(t.headers["content-type"]="application/x-www-form-urlencoded"),t.headers&&(delete t.headers["Content-Length"],delete t.headers["content-length"]),void 0===t.followRedirect||t.followRedirect||((this.isSurge()||this.isLoon())&&(t["auto-redirect"]=!1),this.isQuanX()&&(t.opts?t.opts.redirection=!1:t.opts={redirection:!1})),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](t,((t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,i)}));break;case"Quantumult X":t.method=s,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then((t=>{const{statusCode:s,statusCode:i,headers:o,body:r,bodyBytes:a}=t;e(null,{status:s,statusCode:i,headers:o,body:r,bodyBytes:a},r,a)}),(t=>e(t&&t.error||"UndefinedError")));break;case"Node.js":let i=require("iconv-lite");this.initGotEnv(t);const{url:o,...r}=t;this.got[s](o,r).then((t=>{const{statusCode:s,statusCode:o,headers:r,rawBody:a}=t,n=i.decode(a,this.encoding);e(null,{status:s,statusCode:o,headers:r,rawBody:a,body:n},n)}),(t=>{const{message:s,response:o}=t;e(s,o,o&&i.decode(o.rawBody,this.encoding))}));break}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}queryStr(t){let e="";for(const s in t){let i=t[s];null!=i&&""!==i&&("object"==typeof i&&(i=JSON.stringify(i)),e+=`${s}=${i}&`)}return e=e.substring(0,e.length-1),e}msg(e=t,s="",i="",o={}){const r=t=>{const{$open:e,$copy:s,$media:i,$mediaMime:o}=t;switch(typeof t){case void 0:return t;case"string":switch(this.getEnv()){case"Surge":case"Stash":default:return{url:t};case"Loon":case"Shadowrocket":return t;case"Quantumult X":return{"open-url":t};case"Node.js":return}case"object":switch(this.getEnv()){case"Surge":case"Stash":case"Shadowrocket":default:{const r={};let a=t.openUrl||t.url||t["open-url"]||e;a&&Object.assign(r,{action:"open-url",url:a});let n=t["update-pasteboard"]||t.updatePasteboard||s;if(n&&Object.assign(r,{action:"clipboard",text:n}),i){let t,e,s;if(i.startsWith("http"))t=i;else if(i.startsWith("data:")){const[t]=i.split(";"),[,o]=i.split(",");e=o,s=t.replace("data:","")}else{e=i,s=(t=>{const e={JVBERi0:"application/pdf",R0lGODdh:"image/gif",R0lGODlh:"image/gif",iVBORw0KGgo:"image/png","/9j/":"image/jpg"};for(var s in e)if(0===t.indexOf(s))return e[s];return null})(i)}Object.assign(r,{"media-url":t,"media-base64":e,"media-base64-mime":o??s})}return Object.assign(r,{"auto-dismiss":t["auto-dismiss"],sound:t.sound}),r}case"Loon":{const s={};let o=t.openUrl||t.url||t["open-url"]||e;o&&Object.assign(s,{openUrl:o});let r=t.mediaUrl||t["media-url"];return i?.startsWith("http")&&(r=i),r&&Object.assign(s,{mediaUrl:r}),console.log(JSON.stringify(s)),s}case"Quantumult X":{const o={};let r=t["open-url"]||t.url||t.openUrl||e;r&&Object.assign(o,{"open-url":r});let a=t["media-url"]||t.mediaUrl;i?.startsWith("http")&&(a=i),a&&Object.assign(o,{"media-url":a});let n=t["update-pasteboard"]||t.updatePasteboard||s;return n&&Object.assign(o,{"update-pasteboard":n}),console.log(JSON.stringify(o)),o}case"Node.js":return}default:return}};if(!this.isMute)switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:$notification.post(e,s,i,r(o));break;case"Quantumult X":$notify(e,s,i,r(o));break;case"Node.js":break}if(!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}debug(...t){this.logLevels[this.logLevel]<=this.logLevels.debug&&(t.length>0&&(this.logs=[...this.logs,...t]),console.log(`${this.logLevelPrefixs.debug}${t.map((t=>t??String(t))).join(this.logSeparator)}`))}info(...t){this.logLevels[this.logLevel]<=this.logLevels.info&&(t.length>0&&(this.logs=[...this.logs,...t]),console.log(`${this.logLevelPrefixs.info}${t.map((t=>t??String(t))).join(this.logSeparator)}`))}warn(...t){this.logLevels[this.logLevel]<=this.logLevels.warn&&(t.length>0&&(this.logs=[...this.logs,...t]),console.log(`${this.logLevelPrefixs.warn}${t.map((t=>t??String(t))).join(this.logSeparator)}`))}error(...t){this.logLevels[this.logLevel]<=this.logLevels.error&&(t.length>0&&(this.logs=[...this.logs,...t]),console.log(`${this.logLevelPrefixs.error}${t.map((t=>t??String(t))).join(this.logSeparator)}`))}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.map((t=>t??String(t))).join(this.logSeparator))}logErr(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:this.log("",`❗️${this.name}, 错误!`,e,t);break;case"Node.js":this.log("",`❗️${this.name}, 错误!`,e,void 0!==t.message?t.message:t,t.stack);break}}wait(t){return new Promise((e=>setTimeout(e,t)))}done(t={}){const e=((new Date).getTime()-this.startTime)/1e3;switch(this.log("",`🔔${this.name}, 结束! 🕛 ${e} 秒`),this.log(),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:$done(t);break;case"Node.js":process.exit(1)}}}(t,e)}