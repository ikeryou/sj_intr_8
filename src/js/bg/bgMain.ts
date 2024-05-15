import { Color, Mesh, Object3D, PerspectiveCamera, PlaneGeometry, ShaderMaterial, Texture } from "three"
import { Canvas, CanvasConstructor } from "../webgl/canvas"
import { Capture } from "../webgl/capture"
import { Blur } from "../webgl/blur"
import { Particle } from "./particle"
import { BgShader } from "../glsl/bgShader"
import { Conf } from "../core/conf"
import { Func } from "../core/func"
import { Param } from "../core/param"


export class BgMain extends Canvas {

    private _con:Object3D
    private _blurCap: Capture
    private _blur:Array<Blur> = []
    private _blurCamera:PerspectiveCamera
    private _dest:Mesh
    private _pt:Particle
    private _bgColor: Color = new Color(0xffffff)

    constructor(opt: CanvasConstructor) {
        super(opt)

        this._con = new Object3D()
        this.mainScene.add(this._con)

        // 専用シーン
        this._blurCap = new Capture()

        // ブラーかけるやつ
        const blurNum = 4
        for(let i = 0; i < blurNum; i++) {
            const b = new Blur()
            this._blur.push(b)
        }

        // ブラー用カメラ
        this._blurCamera = new PerspectiveCamera(60, 1, 0.0000001, 500000)

        // 出力用メッシュ
        this._dest = new Mesh(
            new PlaneGeometry(1, 1),
            new ShaderMaterial({
                vertexShader:BgShader.vertexShader,
                fragmentShader:BgShader.fragmentShader,
                transparent:true,
                uniforms:{
                    tDiffuse:{value:this._blur[this._blur.length - 1].getTexture()},
                    distortion:{value:0},
                }
            })
        )
        this._con.add(this._dest)

        // パーティクル
        this._pt = new Particle()
        this._blurCap.add(this._pt)
        // this._con.add(this._pt)

        this._resize()
        this._update()
    }


    // ---------------------------------
    //
    // ---------------------------------
    _update():void {
        const uni = (this._dest.material as ShaderMaterial).uniforms

        // 歪曲収差効果
        let b = Param.instance.bg.distortion.value * 0.01
        uni.distortion.value = b

        if(this.isNowRenderFrame()) {
            this._render()
        }
    }


    // ---------------------------------
    //
    // ---------------------------------
    _render():void {
        this._renderBlur()

        this.renderer.setClearColor(this._bgColor, 1)
        this.renderer.render(this.mainScene, this.cameraPers)
    }


    private _renderBlur():void {
        const sw = this.renderSize.width
        const sh = this.renderSize.height

        this.renderer.setClearColor(this._bgColor, 1)
        this._blurCap.render(this.renderer, this._blurCamera)

        // ブラー適応
        const bw = sw * Conf.BLUR_SCALE
        const bh = sh * Conf.BLUR_SCALE
        this._blur.forEach((val,i) => {
            const t:Texture = i == 0 ? this._blurCap.texture() : this._blur[i-1].getTexture()
            val.render(bw, bh, t, this.renderer, this._blurCamera, 100)
        })
    }


    // ---------------------------------
    //
    // ---------------------------------
    isNowRenderFrame():boolean {
        return this.isRender
    }


    // ---------------------------------
    //
    // ---------------------------------
    _resize():void {
        super._resize()

        const w = Func.sw()
        const h = Func.sh()
        let pixelRatio:number = window.devicePixelRatio || 1

        this.renderSize.width = w
        this.renderSize.height = h

        this._blurCap.setSize(w * Conf.BLUR_SCALE, h * Conf.BLUR_SCALE)
        this._dest.scale.set(w, h, 1)

        this._updatePersCamera(this._blurCamera, w * Conf.BLUR_SCALE, h * Conf.BLUR_SCALE)
        this._updatePersCamera(this.cameraPers, w, h)

        this.renderer.setPixelRatio(pixelRatio)
        this.renderer.setSize(w, h)
        this.renderer.clear()
    }
}