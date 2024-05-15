import { Color, Mesh, Object3D, PerspectiveCamera, PlaneGeometry, ShaderMaterial } from "three"
import { Canvas, CanvasConstructor } from "../webgl/canvas"
import { Capture } from "../webgl/capture"
import { Particle } from "./particle"
import { BgShader } from "../glsl/bgShader"
import { Func } from "../core/func"
import { Param } from "../core/param"


export class BgMain extends Canvas {

    private _con:Object3D
    private _blurCap: Capture
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
                    tDiffuse:{value:this._blurCap.texture()},
                    distortion:{value:0},
                }
            })
        )
        this._con.add(this._dest)

        // パーティクル
        this._pt = new Particle()
        this._blurCap.add(this._pt)

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
        this.renderer.setClearColor(this._bgColor, 1)
        this._blurCap.render(this.renderer, this._blurCamera)
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

        this._blurCap.setSize(w, h)
        this._dest.scale.set(w, h, 1)

        this._updatePersCamera(this._blurCamera, w, h)
        this._updatePersCamera(this.cameraPers, w, h)

        this.renderer.setPixelRatio(pixelRatio)
        this.renderer.setSize(w, h)
        this.renderer.clear()
    }
}