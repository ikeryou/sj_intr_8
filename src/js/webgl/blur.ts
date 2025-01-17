import { Camera, Mesh, PlaneGeometry, ShaderMaterial, Texture, Uniform, Vector2, WebGLRenderer } from "three"
import { Capture } from "./capture"
import { GaussianShader } from "../glsl/gaussianShader"


export class Blur {
    
    private _capture: Capture
    private _mesh: Mesh

    private _num = 10
    

    // --------------------------------
    // コンストラクタ
    // --------------------------------
    constructor() {
        this._capture = new Capture(2)
        
        this._mesh = new Mesh(
            new PlaneGeometry(1, 1),
            new ShaderMaterial({
                vertexShader:GaussianShader.vertexShader,
                fragmentShader:GaussianShader.fragmentShader,
                transparent:true,
                uniforms:{
                    tDiffuse:{value:null},
                    horizontal:{value:true},
                    rate:{value:1},
                    weight:new Uniform(new Array(this._num)),
                    resolution:{value:new Vector2(0, 0)},
                },
            })
        )
        this._capture.add(this._mesh)
    }


    // --------------------------------
    // テクスチャ取得
    // --------------------------------
    public getTexture(): Texture {
        return this._capture.texture(1)
    }


    // --------------------------------
    // レンダリング
    // --------------------------------
    public render(w:number, h:number, texture:Texture, renderer:WebGLRenderer, camera:Camera, value:number = 100) {

        const ratio = window.devicePixelRatio || 1
        this._capture.setSize(w, h, ratio)
        this._mesh.scale.set(w, h, 1)

        const u = (this._mesh.material as ShaderMaterial).uniforms
        u.resolution.value.set(w * ratio, h * ratio)
        
        const weight:Array<number> = []
        const num = u.weight.value.length
        let i = 0
        let t = 0
        while(i < num) {
            const r = 1 + 2 * i
            let w2 = Math.exp(-0.5 * (r * r) / value)
            weight.push(w2)
            if(i > 0) w2 *= 2
            t += w2
            i++
        }

        i = 0
        while(i < num) {
            weight[i] /= t
            i++
        }
        u.weight.value = weight

        // 横
        u.tDiffuse.value = texture
        u.horizontal.value = true
        this._capture.render(renderer, camera, 0)

        // 縦
        u.tDiffuse.value = this._capture.texture(0)
        u.horizontal.value = false
        this._capture.render(renderer, camera, 1)
    }
}