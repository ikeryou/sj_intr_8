import GUI from 'lil-gui'
import { Conf } from './conf'
import { Util } from '../libs/util'

export class Param {
  private static _instance: Param

  private _dat: any

  public bg = {
    color:{value:Util.randomInt(0, 100), min:0, max:100, use:true},
    radius:{value:45, min:0, max:200, use:true},
    scale:{value:250, min:0, max:300, use:true},
    speed:{value:15, min:0, max:50, use:true},
    alpha:{value:100, min:0, max:100, use:true},
    distortion:{value:70, min:-100, max:200, use:true},
  }

  constructor() {
    if (Conf.FLG_PARAM) {
      this.makeParamGUI()
    }
  }

  public static get instance(): Param {
    if (!this._instance) {
      this._instance = new Param()
    }
    return this._instance
  }

  public makeParamGUI(): void {
    if (this._dat != undefined) return

    this._dat = new GUI()
    this._add(this.bg, 'bg')

    this._dat.domElement.style.zIndex = 99999999999999
  }

  private _add(obj: any, folderName: string): void {
    const folder = this._dat.addFolder(folderName)
    for (const key in obj) {
      const val: any = obj[key]
      if (val.use != undefined && val.use) {
        if (val.type == 'color') {
          folder.addColor(val, 'value').name(key)
        } else {
          if (val.list != undefined) {
            folder.add(val, 'value', val.list).name(key)
          } else {
            folder.add(val, 'value', val.min, val.max).name(key)
          }
        }
      }
    }
  }
}
