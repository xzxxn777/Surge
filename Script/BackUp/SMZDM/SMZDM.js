const $ = new Env("什么值得买");
const SMZDM = ($.isNode() ? process.env.SMZDM : $.getjson("SMZDM")) || [];
!(async () => {
    if (typeof $request != "undefined") {
        await getCookie();
    } else {
        await main();
    }
})().catch((e) => {$.log(e)}).finally(() => {$.done({});});

async function main() {
    console.log('作者：@xzxxn777\n频道：https://t.me/xzxxn777\n群组：https://t.me/xzxxn7777\n自用机场推荐：https://xn--diqv0fut7b.com\n')
    for (const item of JSON.parse(SMZDM)) {
        id = item.id;
        cookie = item.cookie;
        console.log(`用户：${id}开始任务`)
        //签到
        console.log("开始签到")
        let time = new Date().getTime();
        let sign = md5(`basic_v=0&f=android&time=${time}&v=11.0.5&weixin=1&zhuanzai_ab=a&key=apr1$AwP!wRRT$gJ/q.X24poeBInlUJC`).toUpperCase();
        let getToken = await commonPost("https://user-api.smzdm.com/robot/token",`basic_v=0&f=android&sign=${sign}&time=${time}&v=11.0.5&weixin=1&zhuanzai_ab=a`)
        token = getToken.data.token
        time = new Date().getTime();
        sign = md5(`basic_v=0&f=android&time=${time}&v=11.0.5&weixin=1&zhuanzai_ab=a&key=apr1$AwP!wRRT$gJ/q.X24poeBInlUJC`).toUpperCase();
        let checkin = await commonPost("https://user-api.smzdm.com/checkin",`basic_v=0&f=android&sign=${sign}&time=${time}&v=11.0.5&weixin=1&zhuanzai_ab=a`)
        console.log(checkin.error_msg);
        time = new Date().getTime();
        sign = md5(`basic_v=0&f=android&time=${time}&v=11.0.5&weixin=1&zhuanzai_ab=a&key=apr1$AwP!wRRT$gJ/q.X24poeBInlUJC`).toUpperCase();
        let reward = await commonPost("https://user-api.smzdm.com/checkin/all_reward",`basic_v=0&f=android&sign=${sign}&time=${time}&v=11.0.5&weixin=1&zhuanzai_ab=a`)
        if (reward.error_code === 0) {
            console.log(`${reward.data.normal_reward.top_title}：${reward.data.normal_reward.gift.content_str}`)
        }
        time = new Date().getTime();
        sign = md5(`basic_v=0&f=android&time=${time}&v=11.0.5&weixin=1&zhuanzai_ab=a&key=apr1$AwP!wRRT$gJ/q.X24poeBInlUJC`).toUpperCase();
        let show = await commonPost("https://user-api.smzdm.com/checkin/show_view_v2",`basic_v=0&f=android&sign=${sign}&time=${time}&v=11.0.5&weixin=1&zhuanzai_ab=a`)
        for (const item of show.data.rows) {
            if (item.cell_title === '做任务得奖励') {
                for (const activity of item.cell_data.activity_task.accumulate_list.activity_list) {
                    console.log(`${activity.reward_status} / ${activity.need_finish_times}`);
                }
                for (const task of item.cell_data.activity_task.accumulate_list.task_list) {
                    console.log(`任务：${task.task_name} id：${task.task_id} 状态：${task.task_status}`);
                    if (task.task_status == 4) {
                        console.log(`任务已完成`);
                    } else {
                        //达人关注推荐
                        if (task.task_name === "达人关注推荐1") {
                            let count = task.task_even_num - task.task_finished_num;
                            time = new Date().getTime();
                            sign = md5(`basic_v=0&f=android&nav_id=${task.task_redirect_url.link_val}&page=1&time=${time}&type=user&v=11.0.5&weixin=1&zhuanzai_ab=a&key=apr1$AwP!wRRT$gJ/q.X24poeBInlUJC`).toUpperCase();
                            let result = await commonPost("https://dingyue-api.smzdm.com/tuijian/search_result",`basic_v=0&f=android&nav_id=${task.task_redirect_url.link_val}&page=1&sign=${sign}&time=${time}&type=user&v=11.0.5&weixin=1&zhuanzai_ab=a`)
                            for (const article of result.data.rows) {
                                while (count > 0) {
                                    time = new Date().getTime();
                                    sign = md5(`basic_v=0&daren_id=${article.keyword}&f=android&follow_user_times_today=1&time=${time}&v=11.0.5&weixin=1&zhuanzai_ab=a&key=apr1$AwP!wRRT$gJ/q.X24poeBInlUJC`).toUpperCase();
                                    let follow = await commonGet(`https://article-api.smzdm.com/dingyue/daren_follow_recommend?basic_v=0&daren_id=${article.keyword}&f=android&follow_user_times_today=1&sign=${sign}&time=${time}&v=11.0.5&weixin=1&zhuanzai_ab=a`)
                                    console.log(follow)
                                    count--;
                                }
                            }
                        }
                        //NAS备份之道
                        if (task.task_name === "NAS备份之道") {
                            if (task.task_status == 3) {
                                console.log(`领取奖励`);
                                time = new Date().getTime();
                                sign = md5(`article_id=${task.article_id}&basic_v=0&channel_id=${task.channel_id}&f=android&robot_token=${token}&task_even_num=${task.task_even_num}&task_event_type=${task.task_event_type}&task_finished_num=${task.task_finished_num}&task_id=${task.task_id}&task_type=&time=${time}&v=11.0.5&weixin=1&zhuanzai_ab=a&key=apr1$AwP!wRRT$gJ/q.X24poeBInlUJC`).toUpperCase();
                                let receive = await commonPost("https://user-api.smzdm.com/task/activity_task_receive",`article_id=${task.article_id}&basic_v=0&channel_id=${task.channel_id}&f=android&robot_token=${token}&sign=${sign}&task_even_num=${task.task_even_num}&task_event_type=${task.task_event_type}&task_finished_num=${task.task_finished_num}&task_id=${task.task_id}&task_type=&time=${time}&v=11.0.5&weixin=1&zhuanzai_ab=a`)
                                console.log(receive.data.reward_msg);
                            } else {
                                time = new Date().getTime();
                                sign = md5(`article_id=${task.article_id}&basic_v=0&channel_id=${task.channel_id}&f=android&task_even_num=${task.task_even_num}&task_event_type=${task.task_event_type}&task_finished_num=${task.task_finished_num}&task_id=${task.task_id}&task_type=&time=${time}&v=11.0.5&weixin=1&zhuanzai_ab=a&key=apr1$AwP!wRRT$gJ/q.X24poeBInlUJC`).toUpperCase();
                                let finish = await commonPost("https://user-api.smzdm.com/task/event_view_article_sync",`article_id=${task.article_id}&basic_v=0&channel_id=${task.channel_id}&f=android&sign=${sign}&task_even_num=${task.task_even_num}&task_event_type=${task.task_event_type}&task_finished_num=${task.task_finished_num}&task_id=${task.task_id}&task_type=&time=${time}&v=11.0.5&weixin=1&zhuanzai_ab=a`)
                                time = new Date().getTime();
                                sign = md5(`article_id=${task.article_id}&basic_v=0&channel_id=${task.channel_id}&f=android&robot_token=${token}&task_even_num=${task.task_even_num}&task_event_type=${task.task_event_type}&task_finished_num=${task.task_finished_num}&task_id=${task.task_id}&task_type=&time=${time}&v=11.0.5&weixin=1&zhuanzai_ab=a&key=apr1$AwP!wRRT$gJ/q.X24poeBInlUJC`).toUpperCase();
                                let receive = await commonPost("https://user-api.smzdm.com/task/activity_task_receive",`article_id=${task.article_id}&basic_v=0&channel_id=${task.channel_id}&f=android&robot_token=${token}&sign=${sign}&task_even_num=${task.task_even_num}&task_event_type=${task.task_event_type}&task_finished_num=${task.task_finished_num}&task_id=${task.task_id}&task_type=&time=${time}&v=11.0.5&weixin=1&zhuanzai_ab=a`)
                                console.log(receive.data.reward_msg);
                            }
                        }
                        //实测家漫谈
                        if (task.task_name === "实测家漫谈") {
                            if (task.task_status == 3) {
                                console.log(`领取奖励`);
                                time = new Date().getTime();
                                sign = md5(`basic_v=0&f=android&robot_token=${token}&task_id=${task.task_id}&time=${time}&v=11.0.5&weixin=1&zhuanzai_ab=a&key=apr1$AwP!wRRT$gJ/q.X24poeBInlUJC`).toUpperCase();
                                let receive = await commonPost("https://user-api.smzdm.com/task/activity_task_receive",`basic_v=0&f=android&robot_token=${token}&sign=${sign}&task_id=${task.task_id}&time=${time}&v=11.0.5&weixin=1&zhuanzai_ab=a`)
                                console.log(receive.data.reward_msg);
                            } else {
                                time = new Date().getTime();
                                sign = md5(`article_id=${task.article_id}&basic_v=0&channel_id=${task.channel_id}&f=android&time=${time}&v=11.0.5&weixin=1&zhuanzai_ab=a&key=apr1$AwP!wRRT$gJ/q.X24poeBInlUJC`).toUpperCase();
                                let finish = await commonPost("https://user-api.smzdm.com/task/event_view_article",`article_id=${task.article_id}&basic_v=0&channel_id=${task.channel_id}&f=android&sign=${sign}&time=${time}&v=11.0.5&weixin=1&zhuanzai_ab=a`)
                                time = new Date().getTime();
                                sign = md5(`basic_v=0&f=android&robot_token=${token}&task_id=${task.task_id}&time=${time}&v=11.0.5&weixin=1&zhuanzai_ab=a&key=apr1$AwP!wRRT$gJ/q.X24poeBInlUJC`).toUpperCase();
                                let receive = await commonPost("https://user-api.smzdm.com/task/activity_task_receive",`basic_v=0&f=android&robot_token=${token}&sign=${sign}&task_id=${task.task_id}&time=${time}&v=11.0.5&weixin=1&zhuanzai_ab=a`)
                                console.log(receive.data.reward_msg);
                            }
                        }
                        //分享社区文章
                        if (task.task_name === "分享社区文章") {
                            let count = task.task_even_num - task.task_finished_num;
                            time = new Date().getTime();
                            sign = md5(`basic_v=0&channel_id=&f=android&offset=0&order=0&page=1&tab=2&time=${time}&v=11.0.5&weixin=1&zhuanzai_ab=a&key=apr1$AwP!wRRT$gJ/q.X24poeBInlUJC`).toUpperCase();
                            let articles = await commonGet(`https://article-api.smzdm.com/ranking_list/articles?basic_v=0&channel_id=&f=android&offset=0&order=0&page=1&sign=${sign}&tab=2&time=${time}&v=11.0.5&weixin=1&zhuanzai_ab=a`)
                            for (const article of articles.data.rows) {
                                while (count > 0) {
                                    time = new Date().getTime();
                                    sign = md5(`article_id=${article.article_id}&basic_v=0&channel_id=${article.channel_id}&f=android&time=${time}&v=11.0.5&weixin=1&zhuanzai_ab=a&key=apr1$AwP!wRRT$gJ/q.X24poeBInlUJC`).toUpperCase();
                                    let share = await commonPost("https://user-api.smzdm.com/share/article_reward",`article_id=${article.article_id}&basic_v=0&channel_id=${article.channel_id}&f=android&sign=${sign}&time=${time}&v=11.0.5&weixin=1&zhuanzai_ab=a`)
                                    time = new Date().getTime();
                                    sign = md5(`basic_v=0&f=android&robot_token=${token}&task_id=${task.task_id}&time=${time}&v=11.0.5&weixin=1&zhuanzai_ab=a&key=apr1$AwP!wRRT$gJ/q.X24poeBInlUJC`).toUpperCase();
                                    let receive = await commonPost("https://user-api.smzdm.com/task/activity_task_receive",`basic_v=0&f=android&robot_token=${token}&sign=${sign}&task_id=${task.task_id}&time=${time}&v=11.0.5&weixin=1&zhuanzai_ab=a`)
                                    console.log(receive.data.reward_msg);
                                    count--;
                                }
                            }
                        }
                    }
                }
            }
        }
        let rewardList = await commonPost("https://h5.smzdm.com/user/pack/ajax_get_reward_list","type=0")
        for (const reward of rewardList.data.unreceive) {
            console.log(`${reward.pack_name}：${reward.pack_description}`);
            if (reward.is_real_filter === 1) {
                let receive = await commonPost("https://h5.smzdm.com/user/pack/ajax_receive",`pack_id=${reward.pack_id}`)
                console.log(receive.data.success_msg);
            } else {
                console.log(`不可领取`);
            }
        }
    }
}

async function getCookie() {
    const cookie = $request.headers["cookie"];
    if (!cookie) {
        return
    }
    const body = $.toObj($response.body);
    if (!body.data || !body.data.user_smzdm_id) {
        return
    }
    const id = body.data.user_smzdm_id;
    const newData = {"id": id, "cookie": cookie}
    const index = SMZDM.findIndex(e => e.id == newData.id);
    if (index !== -1) {
        if (SMZDM[index].cookie == newData.cookie) {
            return
        } else {
            SMZDM[index] = newData;
            console.log(newData.cookie)
            $.msg($.name, `🎉用户${newData.id}更新cookie成功!`, ``);
        }
    } else {
        SMZDM.push(newData)
        console.log(newData.cookie)
        $.msg($.name, `🎉新增用户${newData.id}成功!`, ``);
    }
    $.setjson(SMZDM, "SMZDM");
}

async function commonPost(url,body = '') {
    return new Promise(resolve => {
        const options = {
            url: url,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                "accept": "application/json, text/plain, */*",
                "sec-fetch-site": "same-origin",
                "accept-language": "zh-CN,zh-Hans;q=0.9",
                "accept-encoding": "gzip, deflate, br",
                "sec-fetch-mode": "cors",
                "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148/smzdm 11.0.0 rv:147.2 (iPhone 14 Pro; iOS 17.5; zh_CN)/iphone_smzdmapp/11.0.0/wkwebview/jsbv_1.0.0",
                "Cookie": cookie,
                "sec-fetch-dest": "empty",
                "referer": "https://h5.smzdm.com/user/pack/?f=android&s=hYvr4wJOHZo/ATaM70089wIrIbNUHAUidKbTZgOTOIGdrfrmrIaWtz0ftUYsoTTYW1lBzGyffk=&device=iPhone15,2&v=11.0.5"
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

async function commonGet(url) {
    return new Promise(resolve => {
        const options = {
            url: url,
            headers: {
                "accept": "*/*",
                "content-encoding": "gzip",
                "accept-language": "zh-Hans-CN;q=1, en-CN;q=0.9, ko-KR;q=0.8, zh-Hant-CN;q=0.7, io-Latn-CN;q=0.6",
                "accept-encoding": "gzip, deflate, br",
                "User-Agent": "smzdm 11.0.0 rv:147.2 (iPhone 14 Pro; iOS 17.5; zh_CN)/iphone_smzdmapp/11.0.0",
                "Cookie": cookie,
            },
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

function md5(a){function b(a,b){return a<<b|a>>>32-b}function c(a,b){var c,d,e,f,g;return e=2147483648&a,f=2147483648&b,c=1073741824&a,d=1073741824&b,g=(1073741823&a)+(1073741823&b),c&d?2147483648^g^e^f:c|d?1073741824&g?3221225472^g^e^f:1073741824^g^e^f:g^e^f}function d(a,b,c){return a&b|~a&c}function e(a,b,c){return a&c|b&~c}function f(a,b,c){return a^b^c}function g(a,b,c){return b^(a|~c)}function h(a,e,f,g,h,i,j){return a=c(a,c(c(d(e,f,g),h),j)),c(b(a,i),e)}function i(a,d,f,g,h,i,j){return a=c(a,c(c(e(d,f,g),h),j)),c(b(a,i),d)}function j(a,d,e,g,h,i,j){return a=c(a,c(c(f(d,e,g),h),j)),c(b(a,i),d)}function k(a,d,e,f,h,i,j){return a=c(a,c(c(g(d,e,f),h),j)),c(b(a,i),d)}function l(a){for(var b,c=a.length,d=c+8,e=(d-d%64)/64,f=16*(e+1),g=new Array(f-1),h=0,i=0;c>i;)b=(i-i%4)/4,h=i%4*8,g[b]=g[b]|a.charCodeAt(i)<<h,i++;return b=(i-i%4)/4,h=i%4*8,g[b]=g[b]|128<<h,g[f-2]=c<<3,g[f-1]=c>>>29,g}function m(a){var b,c,d="",e="";for(c=0;3>=c;c++)b=a>>>8*c&255,e="0"+b.toString(16),d+=e.substr(e.length-2,2);return d}function n(a){a=a.replace(/\r\n/g,"\n");for(var b="",c=0;c<a.length;c++){var d=a.charCodeAt(c);128>d?b+=String.fromCharCode(d):d>127&&2048>d?(b+=String.fromCharCode(d>>6|192),b+=String.fromCharCode(63&d|128)):(b+=String.fromCharCode(d>>12|224),b+=String.fromCharCode(d>>6&63|128),b+=String.fromCharCode(63&d|128))}return b}var o,p,q,r,s,t,u,v,w,x=[],y=7,z=12,A=17,B=22,C=5,D=9,E=14,F=20,G=4,H=11,I=16,J=23,K=6,L=10,M=15,N=21;for(a=n(a),x=l(a),t=1732584193,u=4023233417,v=2562383102,w=271733878,o=0;o<x.length;o+=16)p=t,q=u,r=v,s=w,t=h(t,u,v,w,x[o+0],y,3614090360),w=h(w,t,u,v,x[o+1],z,3905402710),v=h(v,w,t,u,x[o+2],A,606105819),u=h(u,v,w,t,x[o+3],B,3250441966),t=h(t,u,v,w,x[o+4],y,4118548399),w=h(w,t,u,v,x[o+5],z,1200080426),v=h(v,w,t,u,x[o+6],A,2821735955),u=h(u,v,w,t,x[o+7],B,4249261313),t=h(t,u,v,w,x[o+8],y,1770035416),w=h(w,t,u,v,x[o+9],z,2336552879),v=h(v,w,t,u,x[o+10],A,4294925233),u=h(u,v,w,t,x[o+11],B,2304563134),t=h(t,u,v,w,x[o+12],y,1804603682),w=h(w,t,u,v,x[o+13],z,4254626195),v=h(v,w,t,u,x[o+14],A,2792965006),u=h(u,v,w,t,x[o+15],B,1236535329),t=i(t,u,v,w,x[o+1],C,4129170786),w=i(w,t,u,v,x[o+6],D,3225465664),v=i(v,w,t,u,x[o+11],E,643717713),u=i(u,v,w,t,x[o+0],F,3921069994),t=i(t,u,v,w,x[o+5],C,3593408605),w=i(w,t,u,v,x[o+10],D,38016083),v=i(v,w,t,u,x[o+15],E,3634488961),u=i(u,v,w,t,x[o+4],F,3889429448),t=i(t,u,v,w,x[o+9],C,568446438),w=i(w,t,u,v,x[o+14],D,3275163606),v=i(v,w,t,u,x[o+3],E,4107603335),u=i(u,v,w,t,x[o+8],F,1163531501),t=i(t,u,v,w,x[o+13],C,2850285829),w=i(w,t,u,v,x[o+2],D,4243563512),v=i(v,w,t,u,x[o+7],E,1735328473),u=i(u,v,w,t,x[o+12],F,2368359562),t=j(t,u,v,w,x[o+5],G,4294588738),w=j(w,t,u,v,x[o+8],H,2272392833),v=j(v,w,t,u,x[o+11],I,1839030562),u=j(u,v,w,t,x[o+14],J,4259657740),t=j(t,u,v,w,x[o+1],G,2763975236),w=j(w,t,u,v,x[o+4],H,1272893353),v=j(v,w,t,u,x[o+7],I,4139469664),u=j(u,v,w,t,x[o+10],J,3200236656),t=j(t,u,v,w,x[o+13],G,681279174),w=j(w,t,u,v,x[o+0],H,3936430074),v=j(v,w,t,u,x[o+3],I,3572445317),u=j(u,v,w,t,x[o+6],J,76029189),t=j(t,u,v,w,x[o+9],G,3654602809),w=j(w,t,u,v,x[o+12],H,3873151461),v=j(v,w,t,u,x[o+15],I,530742520),u=j(u,v,w,t,x[o+2],J,3299628645),t=k(t,u,v,w,x[o+0],K,4096336452),w=k(w,t,u,v,x[o+7],L,1126891415),v=k(v,w,t,u,x[o+14],M,2878612391),u=k(u,v,w,t,x[o+5],N,4237533241),t=k(t,u,v,w,x[o+12],K,1700485571),w=k(w,t,u,v,x[o+3],L,2399980690),v=k(v,w,t,u,x[o+10],M,4293915773),u=k(u,v,w,t,x[o+1],N,2240044497),t=k(t,u,v,w,x[o+8],K,1873313359),w=k(w,t,u,v,x[o+15],L,4264355552),v=k(v,w,t,u,x[o+6],M,2734768916),u=k(u,v,w,t,x[o+13],N,1309151649),t=k(t,u,v,w,x[o+4],K,4149444226),w=k(w,t,u,v,x[o+11],L,3174756917),v=k(v,w,t,u,x[o+2],M,718787259),u=k(u,v,w,t,x[o+9],N,3951481745),t=c(t,p),u=c(u,q),v=c(v,r),w=c(w,s);var O=m(t)+m(u)+m(v)+m(w);return O.toLowerCase()}

function Env(t,e){class s{constructor(t){this.env=t}send(t,e="GET"){t="string"==typeof t?{url:t}:t;let s=this.get;return"POST"===e&&(s=this.post),new Promise((e,a)=>{s.call(this,t,(t,s,r)=>{t?a(t):e(s)})})}get(t){return this.send.call(this.env,t)}post(t){return this.send.call(this.env,t,"POST")}}return new class{constructor(t,e){this.name=t,this.http=new s(this),this.data=null,this.dataFile="box.dat",this.logs=[],this.isMute=!1,this.isNeedRewrite=!1,this.logSeparator="\n",this.encoding="utf-8",this.startTime=(new Date).getTime(),Object.assign(this,e),this.log("",`🔔${this.name}, 开始!`)}getEnv(){return"undefined"!=typeof $environment&&$environment["surge-version"]?"Surge":"undefined"!=typeof $environment&&$environment["stash-version"]?"Stash":"undefined"!=typeof module&&module.exports?"Node.js":"undefined"!=typeof $task?"Quantumult X":"undefined"!=typeof $loon?"Loon":"undefined"!=typeof $rocket?"Shadowrocket":void 0}isNode(){return"Node.js"===this.getEnv()}isQuanX(){return"Quantumult X"===this.getEnv()}isSurge(){return"Surge"===this.getEnv()}isLoon(){return"Loon"===this.getEnv()}isShadowrocket(){return"Shadowrocket"===this.getEnv()}isStash(){return"Stash"===this.getEnv()}toObj(t,e=null){try{return JSON.parse(t)}catch{return e}}toStr(t,e=null){try{return JSON.stringify(t)}catch{return e}}getjson(t,e){let s=e;const a=this.getdata(t);if(a)try{s=JSON.parse(this.getdata(t))}catch{}return s}setjson(t,e){try{return this.setdata(JSON.stringify(t),e)}catch{return!1}}getScript(t){return new Promise(e=>{this.get({url:t},(t,s,a)=>e(a))})}runScript(t,e){return new Promise(s=>{let a=this.getdata("@chavy_boxjs_userCfgs.httpapi");a=a?a.replace(/\n/g,"").trim():a;let r=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");r=r?1*r:20,r=e&&e.timeout?e.timeout:r;const[i,o]=a.split("@"),n={url:`http://${o}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:r},headers:{"X-Key":i,Accept:"*/*"},timeout:r};this.post(n,(t,e,a)=>s(a))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),a=!s&&this.fs.existsSync(e);if(!s&&!a)return{};{const a=s?t:e;try{return JSON.parse(this.fs.readFileSync(a))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),e=this.path.resolve(process.cwd(),this.dataFile),s=this.fs.existsSync(t),a=!s&&this.fs.existsSync(e),r=JSON.stringify(this.data);s?this.fs.writeFileSync(t,r):a?this.fs.writeFileSync(e,r):this.fs.writeFileSync(t,r)}}lodash_get(t,e,s){const a=e.replace(/\[(\d+)\]/g,".$1").split(".");let r=t;for(const t of a)if(r=Object(r)[t],void 0===r)return s;return r}lodash_set(t,e,s){return Object(t)!==t?t:(Array.isArray(e)||(e=e.toString().match(/[^.[\]]+/g)||[]),e.slice(0,-1).reduce((t,s,a)=>Object(t[s])===t[s]?t[s]:t[s]=Math.abs(e[a+1])>>0==+e[a+1]?[]:{},t)[e[e.length-1]]=s,t)}getdata(t){let e=this.getval(t);if(/^@/.test(t)){const[,s,a]=/^@(.*?)\.(.*?)$/.exec(t),r=s?this.getval(s):"";if(r)try{const t=JSON.parse(r);e=t?this.lodash_get(t,a,""):e}catch(t){e=""}}return e}setdata(t,e){let s=!1;if(/^@/.test(e)){const[,a,r]=/^@(.*?)\.(.*?)$/.exec(e),i=this.getval(a),o=a?"null"===i?null:i||"{}":"{}";try{const e=JSON.parse(o);this.lodash_set(e,r,t),s=this.setval(JSON.stringify(e),a)}catch(e){const i={};this.lodash_set(i,r,t),s=this.setval(JSON.stringify(i),a)}}else s=this.setval(t,e);return s}getval(t){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.read(t);case"Quantumult X":return $prefs.valueForKey(t);case"Node.js":return this.data=this.loaddata(),this.data[t];default:return this.data&&this.data[t]||null}}setval(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":return $persistentStore.write(t,e);case"Quantumult X":return $prefs.setValueForKey(t,e);case"Node.js":return this.data=this.loaddata(),this.data[e]=t,this.writedata(),!0;default:return this.data&&this.data[e]||null}}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,e=(()=>{})){switch(t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"],delete t.headers["content-type"],delete t.headers["content-length"]),t.params&&(t.url+="?"+this.queryStr(t.params)),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient.get(t,(t,s,a)=>{!t&&s&&(s.body=a,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,a)});break;case"Quantumult X":this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:a,headers:r,body:i,bodyBytes:o}=t;e(null,{status:s,statusCode:a,headers:r,body:i,bodyBytes:o},i,o)},t=>e(t&&t.error||"UndefinedError"));break;case"Node.js":let s=require("iconv-lite");this.initGotEnv(t),this.got(t).on("redirect",(t,e)=>{try{if(t.headers["set-cookie"]){const s=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();s&&this.ckjar.setCookieSync(s,null),e.cookieJar=this.ckjar}}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:a,statusCode:r,headers:i,rawBody:o}=t,n=s.decode(o,this.encoding);e(null,{status:a,statusCode:r,headers:i,rawBody:o,body:n},n)},t=>{const{message:a,response:r}=t;e(a,r,r&&s.decode(r.rawBody,this.encoding))})}}post(t,e=(()=>{})){const s=t.method?t.method.toLocaleLowerCase():"post";switch(t.body&&t.headers&&!t.headers["Content-Type"]&&!t.headers["content-type"]&&(t.headers["content-type"]="application/x-www-form-urlencoded"),t.headers&&(delete t.headers["Content-Length"],delete t.headers["content-length"]),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:this.isSurge()&&this.isNeedRewrite&&(t.headers=t.headers||{},Object.assign(t.headers,{"X-Surge-Skip-Scripting":!1})),$httpClient[s](t,(t,s,a)=>{!t&&s&&(s.body=a,s.statusCode=s.status?s.status:s.statusCode,s.status=s.statusCode),e(t,s,a)});break;case"Quantumult X":t.method=s,this.isNeedRewrite&&(t.opts=t.opts||{},Object.assign(t.opts,{hints:!1})),$task.fetch(t).then(t=>{const{statusCode:s,statusCode:a,headers:r,body:i,bodyBytes:o}=t;e(null,{status:s,statusCode:a,headers:r,body:i,bodyBytes:o},i,o)},t=>e(t&&t.error||"UndefinedError"));break;case"Node.js":let a=require("iconv-lite");this.initGotEnv(t);const{url:r,...i}=t;this.got[s](r,i).then(t=>{const{statusCode:s,statusCode:r,headers:i,rawBody:o}=t,n=a.decode(o,this.encoding);e(null,{status:s,statusCode:r,headers:i,rawBody:o,body:n},n)},t=>{const{message:s,response:r}=t;e(s,r,r&&a.decode(r.rawBody,this.encoding))})}}time(t,e=null){const s=e?new Date(e):new Date;let a={"M+":s.getMonth()+1,"d+":s.getDate(),"H+":s.getHours(),"m+":s.getMinutes(),"s+":s.getSeconds(),"q+":Math.floor((s.getMonth()+3)/3),S:s.getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,(s.getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in a)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?a[e]:("00"+a[e]).substr((""+a[e]).length)));return t}queryStr(t){let e="";for(const s in t){let a=t[s];null!=a&&""!==a&&("object"==typeof a&&(a=JSON.stringify(a)),e+=`${s}=${a}&`)}return e=e.substring(0,e.length-1),e}msg(e=t,s="",a="",r){const i=t=>{switch(typeof t){case void 0:return t;case"string":switch(this.getEnv()){case"Surge":case"Stash":default:return{url:t};case"Loon":case"Shadowrocket":return t;case"Quantumult X":return{"open-url":t};case"Node.js":return}case"object":switch(this.getEnv()){case"Surge":case"Stash":case"Shadowrocket":default:{let e=t.url||t.openUrl||t["open-url"];return{url:e}}case"Loon":{let e=t.openUrl||t.url||t["open-url"],s=t.mediaUrl||t["media-url"];return{openUrl:e,mediaUrl:s}}case"Quantumult X":{let e=t["open-url"]||t.url||t.openUrl,s=t["media-url"]||t.mediaUrl,a=t["update-pasteboard"]||t.updatePasteboard;return{"open-url":e,"media-url":s,"update-pasteboard":a}}case"Node.js":return}default:return}};if(!this.isMute)switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":default:$notification.post(e,s,a,i(r));break;case"Quantumult X":$notify(e,s,a,i(r));break;case"Node.js":}if(!this.isMuteLog){let t=["","==============📣系统通知📣=============="];t.push(e),s&&t.push(s),a&&t.push(a),console.log(t.join("\n")),this.logs=this.logs.concat(t)}}log(...t){t.length>0&&(this.logs=[...this.logs,...t]),console.log(t.join(this.logSeparator))}logErr(t,e){switch(this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:this.log("",`❗️${this.name}, 错误!`,t);break;case"Node.js":this.log("",`❗️${this.name}, 错误!`,t.stack)}}wait(t){return new Promise(e=>setTimeout(e,t))}done(t={}){const e=(new Date).getTime(),s=(e-this.startTime)/1e3;switch(this.log("",`🔔${this.name}, 结束! 🕛 ${s} 秒`),this.log(),this.getEnv()){case"Surge":case"Loon":case"Stash":case"Shadowrocket":case"Quantumult X":default:$done(t);break;case"Node.js":process.exit(1)}}}(t,e)}
