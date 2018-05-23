"use strict";

const fs = require('fs');
const lodash = require('lodash');

//会议类
class Talk {
    constructor (line) {
        const words = lodash.compact(line.split(' '));
        const duration = words.pop();
        if (isNaN(duration[0])) {
            words.push(duration)
            this.duration = 5;
        } else {
            this.duration = duration.slice(0, -4);
        }
        this.name= words.join(' ')
    }
}

//时间段类
class Slot {
    constructor (limit) {
        this.limit = limit;
        this.list = [];
    };
    //剩余可用分钟数
    balance () {
        return this.limit - this.used()
    };
    //已安排掉的分钟数
    used () {
        let used = 0;
        this.list.forEach((talk)=>{
            used += (talk.duration-0)
        });
        return used;
    };
    add (talk) {
        this.list.push(talk)
    }
}

//分配会议
function arrange (talks, slots) {
    //拿出一个占用时间最长的会议
    const talk = talks.pop();
    //放到时间最富裕的时间段内
    slots = lodash.orderBy(slots, slot=>slot.balance(), 'desc');
    slots[0].add(talk);
    if (talks.length == 0) return slots;
    return arrange(talks, slots);
};

//格式化输出
function print (slots) {
    const formatNum = (num)=>('0'+num).slice(-2);

    const am = {}, pm = {};

    [am[1],am[2],pm[1],pm[2]] = lodash.orderBy(slots, 'limit');

    [1,2].forEach((i)=>{
        let minutes;
        console.log('Track '+i);
        minutes = 9*60
        am[i].list.forEach((talk)=>{
            const h = formatNum(Math.floor(minutes/60));
            const m = formatNum(minutes%60);
            const outputLine = [
                h,':',m,'AM',' ',
                talk.name,' ',talk.duration,'min'
            ].join('');
            console.log(outputLine);
            minutes += talk.duration-0;
        })
        console.log('12:00PM Lunch');
        minutes = 1*60
        pm[i].list.forEach((talk)=>{
            const h = formatNum(parseInt(minutes/60));
            const m = formatNum(minutes%60);
            const outputLine = [
                h,':',m,'PM',' ',
                talk.name,' ',talk.duration,'min'
            ].join('');
            console.log(outputLine);
            minutes += talk.duration-0;
        })
        console.log('05:00PM Networking Event');
    })
}

//获得输入参数
const args = process.argv.splice(2);
const [inputPath, outputPath] = args;

//读取输入文件内容
let input = fs.readFileSync(inputPath, 'utf8')
//分割输入文件内容
input = lodash.compact(input.split('\r').join().split('\n'));

//生成会议列表
let talks = input.map(line=>new Talk(line));
//按占用时间从小到大排序
talks = lodash.orderBy(talks, 'duration');

//生成时间段列表
let slots = [180, 240, 180, 240].map(limit=>new Slot(limit));

//分配每个会议到各个时间段内
slots = arrange(talks, slots);

print(slots);