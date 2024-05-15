import { BufferGeometry, Color, Mesh, MeshBasicMaterial, Vector3 } from "three"
import { MyObject3D } from "../webgl/myObject3D"
import { Util } from "../libs/util"
import { Func } from "../core/func"
import { Param } from "../core/param"


export class ParticleItem extends MyObject3D {

    private _id:number
    private _mesh:Mesh
    private _noise:Vector3 = new Vector3()
    private _noise2:Vector3 = new Vector3()
    private _maxAlpha:number = 1
    private _cnt:number = 0
    private _mat:MeshBasicMaterial
    private _colorRate: number = Util.random(0, 1)


    constructor(itemId: number, geo: BufferGeometry) {
        super()

        this._id = itemId

        this._noise.x = Util.random(1, 3) // 大きさ
        this._noise.y = Util.random2(1, 2)
        this._noise.z = Util.random2(1, 2)

        this._noise2.x = Util.random2(0.5, 1.2)
        this._noise2.y = Util.random2(0.5, 1.2)
        this._noise2.z = Util.random2(0.5, 1.2)

        this._cnt = Util.range(500)

        this._mat = new MeshBasicMaterial({
            color:0xff0000,
            transparent:true,
            opacity:0.5,
            depthTest:false
        })

        this._mesh = new Mesh(
            geo,
            this._mat
        )
        this.add(this._mesh)

        this._resize()
    }


    // 破棄
    public dispose():void {
        super.dispose()
    }


    // ---------------------------------
    //
    // ---------------------------------
    public resetColor():void {
        this._mat.color = this.getColor()
        this._maxAlpha = Util.random(0.2, 0.5)
        if(Util.hit(5)) this._maxAlpha = Util.random(0.7, 0.9)
        this._mat.opacity = this._maxAlpha
    }


    // ---------------------------------
    //
    // ---------------------------------
    public getColor():Color {
        const color1 = new Color(0x00ff00)
        const color2 = new Color(0xff0000)
        const color3 = new Color(0x0000ff)

        const useColor = Util.randomArr([color1, color2, color3])
        return new Color(useColor)
    }


    // ---------------------------------
    // 更新
    // ---------------------------------
    protected _update():void {
        super._update()

        const sw = Func.sw()
        const sh = Func.sh()
        const sp = 1
        const p = Param.instance.bg

        // 動き
        const cnt = this._cnt
        const radian = Util.radian(cnt)
        const center = new Vector3(0,0,0)
        let radiusBase = Math.max(sw, sh)
        let radius = radiusBase * 0.5 * p.radius.value * 0.01

        this._mesh.position.x = center.x + Math.sin(radian * 1.02 * this._noise2.x) * radius * (this._noise2.y * 1.5)
        this._mesh.position.y = center.y + Math.cos(radian * 0.87 * this._noise2.y) * radius * this._noise2.x
        this._cnt += this._noise.y * p.speed.value * 0.01

        const rotSpeed = Param.instance.bg.speed.value * 0.01
        this._mesh.rotation.z -= this._noise.y * 0.01 * rotSpeed

        // 大きさ
        radiusBase *= Util.map(Math.sin(radian * -0.5 * this._noise2.z), 0.15, 2.2, -1, 1)
        let s = radiusBase * 0.025 * this._noise.x * Util.map(Math.sin(radian * 1), 0.85, 1.25, -1, 1) * p.scale.value * 0.01
        s *= 1 - Math.max(0.1, (sp * 0.1))
        this._mesh.scale.set(s, s, s)
        if(this._id % 10 == 0) {
            this._mesh.scale.set(s, s, s)
        }

        // アルファ
        this._mat.opacity = this._maxAlpha * Param.instance.bg.alpha.value * 0.01

        // 色
        const col = new Color(0x000000).offsetHSL(p.color.value * 0.01, 1, 0.5)
        col.offsetHSL(Util.map(this._colorRate, -0.2, 0.2, 0, 1), 0, 0)
        this._mat.color = col
    }
}