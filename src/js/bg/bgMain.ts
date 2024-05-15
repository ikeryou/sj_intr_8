import { Color, Mesh, Object3D, PerspectiveCamera, PlaneGeometry, ShaderMaterial } from "three"
import { Canvas, CanvasConstructor } from "../webgl/canvas"
import { Capture } from "../webgl/capture"
import { BgShader } from "../glsl/bgShader"
import { Conf } from "../core/conf"
import { Func } from "../core/func"


export class BgMain extends Canvas {

    private _con:Object3D
    private _blurCap: Capture
    private _blurCamera:PerspectiveCamera
    private _dest:Mesh
    private _bgColor: Color = new Color(0xffffff)

    constructor(opt: CanvasConstructor) {
        super(opt)

        this._con = new Object3D()
        this.mainScene.add(this._con)

        // 専用シーン
        // 小さいシーン
        this._blurCap = new Capture()

        // 小さいシーン用カメラ
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

        this._resize()
        this._update()
    }


    // ---------------------------------
    //
    // ---------------------------------
    _update():void {
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
        this.renderer.setClearColor(0x000000, 1)
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

        this._blurCap.setSize(w * Conf.BLUR_SCALE, h * Conf.BLUR_SCALE)
        this._dest.scale.set(w * Conf.BLUR_SCALE, h * Conf.BLUR_SCALE, 1)

        this._updatePersCamera(this._blurCamera, w * Conf.BLUR_SCALE, h * Conf.BLUR_SCALE)
        this._updatePersCamera(this.cameraPers, w, h)

        this.renderer.setPixelRatio(pixelRatio)
        this.renderer.setSize(w, h)
        this.renderer.clear()
    }
}