/**
 * cron "33 6,16,23 * * *" GQFT.js
 * export GQFT='[{"id":"1","token":"1","refreshToken":"1"},{"id":"2","token":"2","refreshToken":"2"}]'
 */
const $ = new Env('广汽丰田')
const GQFT = ($.isNode() ? JSON.parse(process.env.GQFT) : $.getjson("GQFT")) || [];
let Utils = undefined;
let token = ''
let refreshToken = ''
let notice = ''
!(async () => {
    Utils = await loadUtils();
    if (typeof $request != "undefined") {
        await getCookie();
    } else {
        await main();
    }
})().catch((e) => {$.log(e)}).finally(() => {$.done({});});

async function main() {
    console.log('作者：@xzxxn777\n频道：https://t.me/xzxxn777\n群组：https://t.me/xzxxn7777\n自用机场推荐：https://xn--diqv0fut7b.com\n')
    for (const item of GQFT) {
        id = item.id;
        token = item.token;
        refreshToken = item.refreshToken;
        console.log(`用户：${id}开始任务`)
        let key = s(), iv = s();
        let detail = await commonGet('/main/api/my/sec/lgn/customer/detail');
        if (detail.header.code != 10000000) {
            console.log(detail.header.message)
            console.log('刷新token')
            let refresh = await refreshPost('/ha/iam/api/lgn/sec/checkAndUpdateToken',{
                encryptKey: encryptKey(`${key}@DS@${iv}`),
                encryptData: encryptData({ "refreshToken": refreshToken}, key, iv),
            })
            if (refresh.header.code == 10000000) {
                token = refresh.body.accessToken;
                refreshToken = refresh.body.refreshToken;
                let arr = ($.isNode() ? JSON.parse(process.env.GQFT) : $.getjson("GQFT")) || [];
                const index = arr.findIndex(e => e.id == id);
                arr[index].token = token;
                arr[index].refreshToken = refreshToken;
                $.setjson(arr, "GQFT");
            } else {
                console.log(refresh.header.message)
                await sendMsg(`用户：${id}\ntoken已过期，请重新获取`);
                continue
            }
        }
        console.log('开始签到')
        key = s(), iv = s();
        let sign = await commonPost('/main/api/marketing/lgn/task/sec/signinV2',{
            encryptKey: encryptKey(`${key}@DS@${iv}`),
            encryptData: encryptData({}, key, iv),
        })
        if (sign.header.code == 10000000) {
            console.log(`签到成功，获得：${sign.body.point}积分`)
        } else {
            console.log(sign.header.message)
        }
        // let doTask = false;
        // let taskList = await commonGet('/main/api/marketing/lgn/task/dailyTask?noLoad=true')
        // for (let task of taskList.body) {
        //     console.log(`任务：${task.taskName}`)
        //     if (task.status == 1) {
        //         console.log(`任务已完成`)
        //     } else {
        //         if (task.taskCode == 'VIEW' || task.taskCode == 'SHARE' || task.taskCode == 'LIKE') {
        //             doTask = true;
        //         }
        //     }
        // }
        // if (doTask) {
        //     let articleList = await commonPost('/main/api/community/post/page',{"queryPostType":"NEWEST","pageNo":1,"pageSize":20})
        //     for (let article of articleList.body.list) {
        //         console.log(`文章：${article.title}`)
        //         key = s(), iv = s();
        //         let read = await commonPost('/main/api/community/sec/post/detail', {
        //             encryptKey: encryptKey(`${key}@DS@${iv}`),
        //             encryptData: encryptData({"postId": article.id}, key, iv),
        //         })
        //         console.log(`阅读文章：${read.header.message}`)
        //         key = s(), iv = s();
        //         let like = await commonPost('/main/api/community/lgn/sec/user/like', {
        //             encryptKey: encryptKey(`${key}@DS@${iv}`),
        //             encryptData: encryptData({"subjectId":article.id, "subjectType":"POST"}, key, iv),
        //         })
        //         console.log(`点赞文章：${like.header.message}`)
        //         key = s(), iv = s();
        //         let share = await commonPost('/main/api/community/lgn/sec/user/forward', {
        //             encryptKey: encryptKey(`${key}@DS@${iv}`),
        //             encryptData: encryptData({"subjectId":article.id, "subjectType":"POST"}, key, iv),
        //         })
        //         console.log(`分享文章：${share.header.message}`)
        //     }
        // }
        console.log("————————————")
        console.log("查询积分")
        key = s(), iv = s();
        let points = await commonPost('/main/api/sec/lgn/integral/my-total-num',{
            encryptKey: encryptKey(`${key}@DS@${iv}`),
            encryptData: encryptData({}, key, iv),
        })
        console.log(`拥有积分：${points.body.score}\n`)
        notice += `用户：${id} 拥有积分: ${points.body.score}\n`
    }
    if (notice) {
        await sendMsg(notice);
    }
}

async function getCookie() {
    const body = $.toObj($response.body);
    if (!body.encryptData || !body.encryptKey) {
        return
    }
    const encryptData = body.encryptData;
    const encryptKey = body.encryptKey;
    let key = h5DecryptKey(encryptKey);
    let data = decryptData(encryptData, key.split('@DS@')[0], key.split('@DS@')[1]);
    token = JSON.parse(data).body.accessToken;
    refreshToken = JSON.parse(data).body.refreshToken;
    let detail = await commonGet('/main/api/my/sec/lgn/customer/detail');
    const id = detail.body.account;
    const newData = {"id": id, "token": token, "refreshToken": refreshToken};
    const index = GQFT.findIndex(e => e.id == newData.id);
    if (index !== -1) {
        if (GQFT[index].token == newData.token) {
            return
        } else {
            GQFT[index] = newData;
            console.log(newData.token)
            $.msg($.name, `🎉用户${newData.id}更新token成功!`, ``);
        }
    } else {
        GQFT.push(newData)
        console.log(newData.token)
        $.msg($.name, `🎉新增用户${newData.id}成功!`, ``);
    }
    $.setjson(GQFT, "GQFT");
}

async function refreshPost(url,body) {
    let params = getRefreshParams();
    return new Promise(resolve => {
        const options = {
            url: `https://gw.nevapp.gtmc.com.cn${url}`,
            headers : {
                'Accept':'application/json',
                'Authorization': "Bearer "+token,
                'sig': params.sig,
                'appVersion': '2.9.2',
                'DeviceId': generateUUID(),
                'operateSystem': 'android',
                'appId': '04c79cea-520f-4b3f-9420-3b626e81c7c9',
                'nonce': params.nonce,
                'user-agent': 'okhttp/4.8.1',
                'content-type': 'application/json; charset=utf-8',
                'timestamp': params.timestamp,
                'Connection': 'Keep-Alive',
                'Accept-Encoding': 'gzip'
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
                    if (JSON.parse(data).encryptKey) {
                        let key = androidDecryptKey(JSON.parse(data).encryptKey);
                        data = decryptData(JSON.parse(data).encryptData, key.split('@DS@')[0], key.split('@DS@')[1]);
                    }
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
    let params = getParams();
    return new Promise(resolve => {
        const options = {
            url: `https://gw.nevapp.gtmc.com.cn${url}`,
            headers : {
                'DeviceId':'1551f95d-6361-463b-bc05-3341b23f7ca4',
                'sig': params.sig,
                'operateSystem': 'h5',
                'nonce': params.nonce,
                'Authorization': 'Bearer '+token,
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 MicroMessenger/6.8.0(0x16080000) NetType/WIFI MiniProgramEnv/Mac MacWechat/WMPF MacWechat/3.8.8(0x13080812) XWEB/1216',
                'AnonymousID': 'o7LWx5dxlc4uL76CDJJ9NSMtnSq4',
                'content-type': 'application/json',
                'timestamp': params.timestamp,
                'xweb_xhr': '1',
                'appId': 'ecb4fdd3-da09-408a-913b-44d311d03105',
                'Accept': '*/*',
                'Sec-Fetch-Site': 'cross-site',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Dest': 'empty',
                'Referer': `https://servicewechat.com/wxd8a42d1c0c59c15d/64/page-frame.html`,
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'zh-CN,zh;q=0.9',
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
                    if (JSON.parse(data).encryptKey) {
                        let key = h5DecryptKey(JSON.parse(data).encryptKey);
                        data = decryptData(JSON.parse(data).encryptData, key.split('@DS@')[0], key.split('@DS@')[1]);
                    }
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
    let params = getParams();
    return new Promise(resolve => {
        const options = {
            url: `https://gw.nevapp.gtmc.com.cn${url}`,
            headers : {
                'sig': params.sig,
                'operateSystem': 'h5',
                'nonce': params.nonce,
                'Authorization': token,
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36 MicroMessenger/6.8.0(0x16080000) NetType/WIFI MiniProgramEnv/Mac MacWechat/WMPF MacWechat/3.8.8(0x13080812) XWEB/1216',
                'AnonymousID': 'o7LWx5dxlc4uL76CDJJ9NSMtnSq4',
                'content-type': 'application/json',
                'timestamp': params.timestamp,
                'xweb_xhr': '1',
                'appId': 'ecb4fdd3-da09-408a-913b-44d311d03105',
                'Accept': '*/*',
                'Sec-Fetch-Site': 'cross-site',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Dest': 'empty',
                'Referer': `https://servicewechat.com/wxd8a42d1c0c59c15d/64/page-frame.html`,
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'zh-CN,zh;q=0.9',
            }
        }
        $.get(options, async (err, resp, data) => {
            try {
                if (err) {
                    console.log(`${JSON.stringify(err)}`)
                    console.log(`${$.name} API请求失败，请检查网路重试`)
                } else {
                    await $.wait(2000)
                    if (JSON.parse(data).encryptKey) {
                        let key = h5DecryptKey(JSON.parse(data).encryptKey);
                        data = decryptData(JSON.parse(data).encryptData, key.split('@DS@')[0], key.split('@DS@')[1]);
                    }
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

function getParams() {
    let timestamp = new Date().getTime();
    let nonce = randomString();
    let sig = Utils.md5(`${timestamp}${token}${nonce}ecb4fdd3-da09-408a-913b-44d311d03105611ac848-be11-404e-b7a3-54f735d2eb3e`);
    return {"timestamp": timestamp, "nonce": nonce, "sig": sig};
}

function getRefreshParams() {
    let timestamp = new Date().getTime();
    let nonce = Math.floor(Math.random() * 900000) + 100000;
    let sig = Utils.md5(`${timestamp}${token}${nonce}04c79cea-520f-4b3f-9420-3b626e81c7c9afc20663-e6d4-44a5-845f-fe872df3aacc`);
    return {"timestamp": timestamp, "nonce": nonce, "sig": sig};
}

function randomString() {
    for (var r = Math.random().toString(36).substr(2); r.length < 6;) r += Math.random().toString(36).substr(2);
    return r.substr(0, 6)
}

function s() {
    for (var r = Math.random().toString(36).substr(2); r.length < 16;) r += Math.random().toString(36).substr(2);
    return r.substr(0, 16)
}

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

function encryptData(data, key, iv) {
    CryptoJS = Utils.createCryptoJS();
    key = CryptoJS.enc.Utf8.parse(key);
    iv = CryptoJS.enc.Utf8.parse(iv);
    data = CryptoJS.enc.Utf8.parse(JSON.stringify(data));
    var encrypted = CryptoJS.AES.encrypt(data, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    }).ciphertext.toString(CryptoJS.enc.Base64);
    return encrypted;
}

function decryptData(data, key, iv) {
    CryptoJS = Utils.createCryptoJS();
    key = CryptoJS.enc.Utf8.parse(key);
    iv = CryptoJS.enc.Utf8.parse(iv);
    var decrypted = CryptoJS.AES.decrypt(data, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });
    var decryptedData = decrypted.toString(CryptoJS.enc.Utf8);
    return decryptedData;
}

function encryptKey(data) {
    let encryptor = new (Utils.loadJSEncrypt());
    let privateKey ="MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA49jxpFBAoEslNYrHb0wT8nCpGBn3hvjgToNkp7lFpsSeRS7WbHoFJEvmf1U83cHrbTzRFRowPft/FGBw6/6dZcmMjMgz1n0FWlqk0d7QjEDL+t9Dj9tH9e/qdGfJ3bzR0ZgpgQMpKpx5I5fcEgzMYnHWGLZBY+v+PlPTN/1mz0nnRtIIxb8YuZZFvadfGTC8jeD7tMERpd5zENml5cLbVujENsag9AIpvLdvR6fSewi3l9QmssWpty50UpcAWsvAs+ExRYyUe/s1lwfSdSciW6Lrj4sp4MMaWifdTQUbKKEeuRugEqJSDrxhxoybEbSbl2CYaTR8kifZ1n+lcAh6cQIDAQAB"
    encryptor.setPublicKey(privateKey);
    return  encryptor.encrypt(data);
}

function h5DecryptKey(data) {
    let decryptor = new (Utils.loadJSEncrypt());
    let privateKey ="MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCUEPwXFgsGTngqifX48k/5CRBNVA2/mLJhl+fP7Z0UHrSQmI31rtXcb9zN6PMG0jvNxk0oLvrUgf1K/lfgDp0noUQpCbHqkCk0CGQogSIVr/ktu5lhev0/P+9pkFfXrrZWKYhBk/z7r/XYvmsm4TVyFhge5WZqfY+HXhFmzJEu9lhq9VACXsfXJ6O778Dj3fF6hHsyNsai+qGNL31bdObxJG8EhWNcwK0ejCa8XzsscasbjZ/AhTwAQf9kxT9diCZv2vWvK5QtDhxMbqyQ6lFE8Ew9jaAHYnp2jxh3CwcAMp9B0+Ne4JOBaY7IjH9ENqMC29cYnhxNhj3ZGcbEu6lpAgMBAAECggEBAISKY66iu8GscmLZ1kY/Whk55M7jw97TaDJ2UTrOn8KH7ehVtxXKqIPH2qaztQBRJtl/fkfPLhcWOU9tN+pICqOT9zipBgtLeqaqMEYVuhYhzPMEMDuTZai9qakcXZWjPnMIgID7YQVHsNGROse15yq13mehv7jpppZtPTSBQCEBZAw+SFNS4KVfBDKNntlesEuLJHGWWXnqxWwK3YA4IdUAJjT5kDEiYQs7uy2FHqdcZnw7hV/Tt3OWDqrOB8zoZVhEg9dLvqpBaUi6yh9ihUYJBtFegmsFSY7MazHQjYnY8bcEcoma22c3AZbGeRwTwrNrlL0/UvF60L1njx4xhSUCgYEA0Xgh4mFSrp5E0UbMvy5TnpayH1hcaJNFjyGgQGdwgnE69gzR1Grqv+ihSjTbPvQHu9IGnuXb6Pdm/tuj2ml4xTJ9OnTe2/x/TzMIserNfRD1v6prxjNgZc+YDEebxHTWDBtCNpdbOEy27yO4fc9UvIoIbgG5eDTcMwCtiIt+98sCgYEAtPUPBqegfiDzyBP7l2hxhGwFgIrsFYIg3lJwwlyYpZEt8p/TMwPAMb2k+nfQPtyS6T2bBGr2PAKUAubD1SrwGE4ndXO4SDB814ll93ZrE7X18iyoGBwbgpjGMONK3nbS2z+2WrFEtQZaUuLiiZp+hnxk5uW7EQ5RnToOaUTPtRsCgYBNUOhA5Odd6LFCBb4BOxpGSR1KEJVbTDC6mhDKdOPEYgL/WtAAdc5cM4OFHmlmnTBVlTo4YGOBZAAyReP+9DtNnks2zniL/nEHTLEC6sYaSa5Lpp3NNJ16NtvKfIv0QaPYKB+Sgt96smY7cpXgaiy+wrxFzoEk623zrWZgJg0hbQKBgFMkEO5O0CeDPl6cB8lt/FIKS5Dew0+yhSWAnTw/zQatKH5EPoY+3+w6pPVLXUu0jm9JldK2zkGOMbEPk8R6QOv55JlLPM02MfXZtBa5usLIpKLLL8Q8Dcu4I79MfxatY33GzSLoNZgyvgc9JTZx3FYwCzAnNwbEHG1vwjVNn10nAoGASPxDtahASVh/IN6sjFR1soU8fuzEzThpnchfNVp3BeROR/8fXyfyBk3hKGmh6PY41XttKrGBwCaztCwA6zoTv7/SmzqNCzknq4uFbr9o455T0+0gtBKS6vFv1zCnvyMXjcmyCvB7gIRnhoq5W/z9l8VtAagNi9JOhZpjCl7Ep70="
    decryptor.setPrivateKey(privateKey);
    return  decryptor.decrypt(data);
}
function androidDecryptKey(data) {
    let decryptor = new (Utils.loadJSEncrypt());
    let privateKey ="MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDY3cIYJUz88prEtqzcQDRekpyyPJNYnR/i9nvL8tBZBWccEgoXhw4RFaoGJfuPiUM6NDSzgSb5YnFfBVNY+kDmZcmyjEvlh68pas8jTD6rbnuAY9YhehgAV456S0/EST0NFyFvoUUN9crgm7d1DbjdhEmeN9ouXAB7aOvY4hIlXHJMfPoqBv8lmVxenqYAM2b4U9/qdleWViRMuwpgcs8HrErHPNpWvHQ1CFr41M4NVAM4/fF2VZfWNuzpfOwpCfVzLo+B4xJTqmZ7xImHQ5qg/IK3RXwDxw2TgtviX7u8vYS6WprRUkwDtN5bdLFJLBymKv78PRG4v6XG22wcymb5AgMBAAECggEARvCTk05wVrYNhpezCAFAoEcZVvyVvoD3c0jpyhdNrDEmP3pvLq8RHOmXSpeWKKfgA+Qb8TQoSZ+4MjsNvqduH2/ggLWABj9SPxwfUg6Y2X80ixUdcKn9u+7oPnzwROcoP2X3nAqHCkAC82I8qt+oP14MruLaThvuVHBH5hRdlzaCEkCyZz0/w+g6GqvzIyp0w3RKprQxTLYU8JIT9wWIVVmDWINAvcdKQj1VC/Oui3sWv9yXwjzf37HrTmH5sEAkizMwNuDCHOA52E0DSnirS+FPAYhkvDSwoO952sXaBrVDV+a1zjcgl9UsZ6xy8W+GeR+BmpRrk3xwfi2tHXumOQKBgQD49jCNpED3vo7JqcVJAZ7hWFYMtlLDRCpDe6UO1VvGbdbeBm2nW03x00B1zvvj++DfNnCsVuopqu/YMOU+u6DVSz6u01aI9tNu7xdLqPn5BcxiF9IBAXjsENCCinw7LV/CrBhotw3ny5RzV4+ZCPx3BTSLYsRMmRZzQLbtD6rh+wKBgQDe/0jDEx3DLenmtypBtPpoLbMYKlZCOZRYiJbfLmgfnQkrrBJqEUi56kaseWRujmKcanMxyqblsh9gL+tvBNRr8a2udJj91/OeJlo612LOebiPNtPeTn+O8jRPVVxQ2/2nJlTyfdju2PrxaupLN9JQYhp1S02QalejRHZ4eDp8mwKBgQChjSe+kepymR4Q8HCLylhuBCN6hkk4WqBOQArAkGTIY3g9hNBc/BudI6c9iz3bGBQ45BvDSXcT6M9Qa5Im3hwkrHoVeiA6KmjTIKTuPM1Q8ZlJwglNC8aK8PJM805gHDZ6nbANK1QDqRBAtH4DIViqZx9Mn5+f0OtHiKPrOvJ5RwKBgCh5X0SA2LsPP0/v2MyaQ4TbHpF5RbS5bLJxACk77Awo3Xw+vAziXDfaTL+LPO5QC5fmPkhARvCT1twHdozs7H03HVX3tbkFFCOVRHU/mKBvOU9NHUFRMBfK4DGyBZJri2tmKq7kppYbbdiZljLWy+ZpF/JIG6jllEh+6Z3N/JeXAoGBAOpAGelHXKDcnzbVbdPIfG3A8I0NcC++hK+bZdVIu0UOT2HbP06Y8bDR/6WZRp6Ar+64p1wyPc5vX6/59Ip5OPu76HiLgzWEtgpL8naeO0HXIC2y7GnJOsUQDa+RWkNYRvevOJFAAGrZUnKvGH3agAazCwyTIIOeUrgQn2CF9GAg"
    decryptor.setPrivateKey(privateKey);
    return  decryptor.decrypt(data);
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
function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise(((e,i)=>{s.call(this,t,((t,s,o)=>{t?i(t):e(s)}))}))}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.logLevels={debug:0,info:1,warn:2,error:3},this.logLevelPrefixs={debug:"[DEBUG] ",info:"[INFO] ",warn:"[WARN] ",error:"[ERROR] "},this.logLevel="info",this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}getEnv(){return"undefined"!=typeof $environment&&$environment["surge-version"]?"Surge":"undefined"!=typeof $environment&&$environment["stash-version"]?"Stash":"undefined"!=typeof module&&module.exports?"Node.js":"undefined"!=typeof $task?"Quantumult X":"undefined"!=typeof $loon?"Loon":"undefined"!=typeof $rocket?"Shadowrocket":void 0}isNode(){return"Node.js"===this.getEnv()}isQuanX(){return"Quantumult X"===this.getEnv()}isSurge(){return"Surge"===this.getEnv()}isLoon(){return"Loon"===this.getEnv()}isShadowrocket(){return"Shadowrocket"===this.getEnv()}isStash(){return"Stash"===this.getEnv()}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null,...s){try{return JSON.stringify(t,...s)}catch{return e}}getjson(t,e){let s=e;if(this.getdata(t))try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise((e=>{this.get({url:t},((t,s,i)=>e(i)))}))}runScript(t,e){return new Promise((s=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let o=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");o=o?1*o:20,o=e&&e.timeout?e.timeout:o;const[r,a]=i.split("@"),n={url:`http://${a}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:o},headers:{"X-Key":r,Accept:"*/*"},timeout:o};this.post(n,((t,e,i)=>s(i)))})).catch((t=>this.logErr(t)))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e);if(!s&&!i)return{};{const i=s?t:e;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),i=!s&&this.fs.existsSync(e),o=JSON.stringify(this.data);s?this.fs.writeFileSync(t,o):i?this.fs.writeFileSync(e,o):this.fs.writeFileSync(t,o)}}lodash_get(t,e,s){const i=e.replace(/\[(\d+)\]/g,".$1").split(".");let o=t;for(const t of i)if(o=Object(o)[t],void 0===o)return s;return o}lodash_set(t,e,s){return Object(t)!==t||(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce(((t,s,i)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[i+1])>>0==+e[i+1]?[]:{}),t)[e[e.length-1]]=s),t}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,i]=/^@(.*?)\.(.*?)$/.exec(t),o=s?this.getval(s):"";if(o)try{const t=JSON.parse(o);e=t?this.lodash_get(t,i,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,i,o]=/^@(.*?)\.(.*?)$/.exec(e),r=this.getval(i),a=i?"null"===r?null:r||"{}":"{}";try{const e=JSON.parse(a);this.lodash_set(e,o,t),s=this.setval(JSON.stringify(e),i)}catch(e){const r={};this.lodash_set(r,o,t),s=this.setval(JSON.stringify(r),i)}}else s=this.setval(t,e);return s}getval(t){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.read(t);case"Quantumult X":return $prefs.valueForKey(t);case"Node.js":return this.data=this.loaddata(),this.data[t];default:return this.data&&this.data[t]||null}}setval(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.write(t,e);case"Quantumult X":return $prefs.setValueForKey(t,e);case"Node.js":return this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0;default:return this.data&&this.data[e]||null}}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.cookie&&void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar)))}get(t,e=(()=>{})){switch(t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"],delete t.headers["content-type"],delete t.headers["content-length"]),t.params&&(t.url+="?"+this.queryStr(t.params)),void 0===t.followRedirect||t.followRedirect||((this.isSurge()||this.isLoon())&&(t["auto-redirect"]=!1),this.isQuanX()&&(t.opts?t.opts.redirection=!1:t.opts={redirection:!1})),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,((t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,i)}));break;case"Quantumult X":this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then((t=>{const{statusCode:s,statusCode:i,headers:o,body:r,bodyBytes:a}=t;e(null,{status:s,statusCode:i,headers:o,body:r,bodyBytes:a},r,a)}),(t=>e(t&&t.error||"UndefinedError")));break;case"Node.js":let s=require("iconv-lite");this.initGotEnv(t),this.got(t).on("redirect",((t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}})).then((t=>{const{statusCode:i,statusCode:o,headers:r,rawBody:a}=t,n=s.decode(a,this.encoding);e(null,{status:i,statusCode:o,headers:r,rawBody:a,body:n},n)}),(t=>{const{message:i,response:o}=t;e(i,o,o&&s.decode(o.rawBody,this.encoding))}));break}}post(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"post";switch(t.body&&t.headers&&!t.headers["Content-Type"]&&!t.headers["content-type"]&&(t.headers["content-type"]="application/x-www-form-urlencoded"),t.headers&&(delete t.headers["Content-Length"],delete t.headers["content-length"]),void 0===t.followRedirect||t.followRedirect||((this.isSurge()||this.isLoon())&&(t["auto-redirect"]=!1),this.isQuanX()&&(t.opts?t.opts.redirection=!1:t.opts={redirection:!1})),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](t,((t,s,i)=>{!t&&s&&(s.body=i,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,i)}));break;case"Quantumult X":t.method=s,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then((t=>{const{statusCode:s,statusCode:i,headers:o,body:r,bodyBytes:a}=t;e(null,{status:s,statusCode:i,headers:o,body:r,bodyBytes:a},r,a)}),(t=>e(t&&t.error||"UndefinedError")));break;case"Node.js":let i=require("iconv-lite");this.initGotEnv(t);const{url:o,...r}=t;this.got[s](o,r).then((t=>{const{statusCode:s,statusCode:o,headers:r,rawBody:a}=t,n=i.decode(a,this.encoding);e(null,{status:s,statusCode:o,headers:r,rawBody:a,body:n},n)}),(t=>{const{message:s,response:o}=t;e(s,o,o&&i.decode(o.rawBody,this.encoding))}));break}}time(t,e=null){const s=e?new Date(e):new Date;let i={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in i)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?i[e]:("00"+i[e]).substr((""+i[e]).length)));return t}queryStr(t){let e="";for(const s in t){let i=t[s];null!=i&&""!==i&&("object"==typeof i&&(i=JSON.stringify(i)),e+=`${s}=${i}&`)}return e=e.substring(0,e.length-1),e}msg(e=t,s="",i="",o={}){const r=t=>{const{$open:e,$copy:s,$media:i,$mediaMime:o}=t;switch(typeof t){case void 0:return t;case"string":switch(this.getEnv()){case"Surge":case"Stash":default:return{url:t};case"Loon":case"Shadowrocket":return t;case"Quantumult X":return{"open-url":t};case"Node.js":return}case"object":switch(this.getEnv()){case"Surge":case"Stash":case"Shadowrocket":default:{const r={};let a=t.openUrl||t.url||t["open-url"]||e;a&&Object.assign(r,{action:"open-url",url:a});let n=t["update-pasteboard"]||t.updatePasteboard||s;if(n&&Object.assign(r,{action:"clipboard",text:n}),i){let t,e,s;if(i.startsWith("http"))t=i;else if(i.startsWith("data:")){const[t]=i.split(";"),[,o]=i.split(",");e=o,s=t.replace("data:","")}else{e=i,s=(t=>{const e={JVBERi0:"application/pdf",R0lGODdh:"image/gif",R0lGODlh:"image/gif",iVBORw0KGgo:"image/png","/9j/":"image/jpg"};for(var s in e)if(0===t.indexOf(s))return e[s];return null})(i)}Object.assign(r,{"media-url":t,"media-base64":e,"media-base64-mime":o??s})}return Object.assign(r,{"auto-dismiss":t["auto-dismiss"],sound:t.sound}),r}case"Loon":{const s={};let o=t.openUrl||t.url||t["open-url"]||e;o&&Object.assign(s,{openUrl:o});let r=t.mediaUrl||t["media-url"];return i?.startsWith("http")&&(r=i),r&&Object.assign(s,{mediaUrl:r}),console.log(JSON.stringify(s)),s}case"Quantumult X":{const o={};let r=t["open-url"]||t.url||t.openUrl||e;r&&Object.assign(o,{"open-url":r});let a=t["media-url"]||t.mediaUrl;i?.startsWith("http")&&(a=i),a&&Object.assign(o,{"media-url":a});let n=t["update-pasteboard"]||t.updatePasteboard||s;return n&&Object.assign(o,{"update-pasteboard":n}),console.log(JSON.stringify(o)),o}case"Node.js":return}default:return}};if(!this.isMute)switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:$notification.post(e,s,i,r(o));break;case"Quantumult X":$notify(e,s,i,r(o));break;case"Node.js":break}if(!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),i&&t.push(i),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}debug(...t){this.logLevels[this.logLevel]<=this.logLevels.debug&&(t.length>0&&(this.logs=[...this.logs,...t]),console.log(`${this.logLevelPrefixs.debug}${t.map((t=>t??String(t))).join(this.logSeparator)}`))}info(...t){this.logLevels[this.logLevel]<=this.logLevels.info&&(t.length>0&&(this.logs=[...this.logs,...t]),console.log(`${this.logLevelPrefixs.info}${t.map((t=>t??String(t))).join(this.logSeparator)}`))}warn(...t){this.logLevels[this.logLevel]<=this.logLevels.warn&&(t.length>0&&(this.logs=[...this.logs,...t]),console.log(`${this.logLevelPrefixs.warn}${t.map((t=>t??String(t))).join(this.logSeparator)}`))}error(...t){this.logLevels[this.logLevel]<=this.logLevels.error&&(t.length>0&&(this.logs=[...this.logs,...t]),console.log(`${this.logLevelPrefixs.error}${t.map((t=>t??String(t))).join(this.logSeparator)}`))}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.map((t=>t??String(t))).join(this.logSeparator))}logErr(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:this.log("",`❗️${this.name}, 错误!`,e,t);break;case"Node.js":this.log("",`❗️${this.name}, 错误!`,e,void 0!==t.message?t.message:t,t.stack);break}}wait(t){return new Promise((e=>setTimeout(e,t)))}done(t={}){const e=((new Date).getTime()-this.startTime)/1e3;switch(this.log("",`🔔${this.name}, 结束! 🕛 ${e} 秒`),this.log(),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:$done(t);break;case"Node.js":process.exit(1)}}}(t,e)}