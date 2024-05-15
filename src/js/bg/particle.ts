import { SphereGeometry } from "three"
import { MyObject3D } from "../webgl/myObject3D"
import { ParticleItem } from "./particleItem"



export class Particle extends MyObject3D {

    private _item:Array<ParticleItem> = []


    constructor() {
        super()

        // ジオメトリは共通
        const geo = new SphereGeometry(0.5, 32, 32)

        // アイテム数
        const itemNum = 100
        for(let i = 0; i < itemNum; i++) {
            const item = new ParticleItem(i, geo)
            this.add(item)
            this._item.push(item)
        }

        this._eReset()

        this._resize()
    }



    // ---------------------------------
    //
    // ---------------------------------
    private _eReset():void {
        this._item.forEach((val) => {
            val.resetColor()
        })
    }



    // ---------------------------------
    // 更新
    // ---------------------------------
    protected _update():void {
        super._update()
    }
}