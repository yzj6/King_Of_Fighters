let Game_Objects = [];//所有对象

class GameObject {
    constructor() {
        Game_Objects.push(this);

        this.timedelta = 0;//两帧之间的时间
        this.has_call_start = false;//是否开始执行
    }

    start() {//初始

    }

    update() {//每一帧

    }

    destroy() {//删除当前对象
        for (let i in Game_Objects) {
            if (Game_Objects[i] === this) {
                Game_Objects.splice(i, 1);
                break;
            }
        }
    }
}

let last_timestamp;//上一帧执行时刻

let Game_Objects_Frame = (timestamp) => {//参数为执行的当前时刻
    for (let obj of Game_Objects) {
        if (!obj.has_call_start) {
            obj.start();
            obj.has_call_start = true;
        } else {
            obj.timedelta = timestamp - last_timestamp;
            obj.update();
        }
    }
    last_timestamp = timestamp;
    requestAnimationFrame(Game_Objects_Frame);//递归 使参数函数下一帧时执行
}

requestAnimationFrame(Game_Objects_Frame);

export {
    GameObject
}