import { Point } from '../libs/point'
import { Update } from '../libs/update'
import { Util } from '../libs/util'
import { Conf } from './conf'

export class MouseMgr {
  private static _instance: MouseMgr

  public x: number = window.innerWidth * 9999
  public y: number = window.innerHeight * 9999
  public old: Point = new Point()
  public normal: Point = new Point()
  public easeNormal: Point = new Point()
  public start: Point = new Point()
  public moveDist: Point = new Point()
  public dist: number = 0
  public isDown: boolean = false
  public usePreventDefault: boolean = false
  public useSwipe: boolean = false
  public moveTotal: number = 0

  public onTouchStart: Array<any> = []
  public onTouchEnd: Array<any> = []
  public onSwipe: Array<any> = []

  public onMouseUp: Array<any> = []

  private _updateHandler: any
  private _useWheel: boolean = false

  constructor() {
    if (Util.isTouchDevice() && !Conf.IS_WIN) {
      window.addEventListener(
        'touchstart',
        (e: any = {}) => {
          this._eTouchStart(e)
        },
        { passive: false },
      )
      window.addEventListener(
        'touchend',
        (e: any = {}) => {
          this._eTouchEnd(e)
        },
        { passive: false },
      )
      window.addEventListener(
        'touchmove',
        (e: any = {}) => {
          this._eTouchMove(e)
        },
        { passive: false },
      )
    } else {
      window.addEventListener('mousedown', (e: any = {}) => {
        this._eDown(e)
      })
      window.addEventListener('mouseup', (e: any = {}) => {
        this._eUp(e)
      })
      window.addEventListener('mousemove', (e: any = {}) => {
        this._eMove(e)
      })

      window.addEventListener(
        'wheel',
        (e) => {
          if (this.usePreventDefault) {
            e.preventDefault()
            e.stopPropagation()
          }

          if (this.useSwipe) {
            const test = Math.abs(e.deltaY)
            // Param.instance.debug.innerHTML = String(test);
            if (test > 5 && this._useWheel) {
              if (this.onSwipe != undefined) {
                this.onSwipe.forEach((val) => {
                  if (val != undefined) val({ move: e.deltaY })
                })
              }
              this._useWheel = false
              setTimeout(() => {
                this._useWheel = true
              }, 1000)
            }
          }
        },
        { passive: false },
      )
    }

    this._updateHandler = this._update.bind(this)
    Update.instance.add(this._updateHandler)
  }

  public static get instance(): MouseMgr {
    if (!this._instance) {
      this._instance = new MouseMgr()
    }
    return this._instance
  }

  private _eTouchStart(e: any = {}): void {
    this.isDown = true
    const p: Point = this._getTouchPoint(e)
    this.old.x = this.x = p.x
    this.old.y = this.y = p.y

    // this._eTouchMove(e)

    this.start.x = p.x
    this.start.y = p.y

    this.onTouchStart.forEach((val) => {
      if (val != undefined) val()
    })
  }

  private _eTouchEnd(e: any = {}): void {
    this.isDown = false

    // 上下スワイプ判定
    if (this.useSwipe) {
      // const dx = this.old.x - this.x
      const dy = this.old.y - this.y
      const limit = 5
      if (Math.abs(dy) > limit) {
        if (this.onSwipe != undefined) {
          this.onSwipe.forEach((val) => {
            if (val != undefined) val({ move: dy })
          })
        }
      }
    }

    this.dist = 0

    this.onTouchEnd.forEach((val) => {
      if (val != undefined) val(e)
    })
  }

  private _eTouchMove(e: any = {}): void {
    const p: Point = this._getTouchPoint(e)
    this.old.x = this.x
    this.old.y = this.y
    this.x = p.x
    this.y = p.y

    const dx = this.old.x - this.x
    const dy = this.old.y - this.y
    this.dist = Math.sqrt(dx * dx + dy * dy)

    if (this.usePreventDefault) {
      e.preventDefault()
    }
  }

  private _eDown(e: any = {}): void {
    this.isDown = true
    this._eMove(e)

    this.start.x = this.x
    this.start.y = this.y
  }

  private _eUp(e: any = {}): void {
    this.isDown = false

    this.onMouseUp.forEach((val) => {
      if (val != undefined) val(e)
    })
  }

  private _eMove(e: any = {}): void {
    this.old.x = this.x
    this.old.y = this.y

    this.x = e.clientX
    this.y = e.clientY

    const dx = this.old.x - this.x
    const dy = this.old.y - this.y
    this.dist = Math.sqrt(dx * dx + dy * dy)
    
    if(this.dist < 200) this.moveTotal += this.dist
  }

  private _getTouchPoint(e: TouchEvent): Point {
    const p = new Point()
    const touches: TouchList = e.touches
    if (touches != null && touches.length > 0) {
      p.x = touches[0].pageX
      p.y = touches[0].pageY
    }
    return p
  }

  public getTouchPoint(e: TouchEvent): Point {
    const p = new Point()
    const touches: TouchList = e.touches
    if (touches != null && touches.length > 0) {
      p.x = touches[0].pageX
      p.y = touches[0].pageY
    }
    return p
  }

  private _update(): void {
    if (this.isDown) {
      this.moveDist.x = this.start.x - this.x
      this.moveDist.y = this.start.y - this.y
    } else {
      this.moveDist.x += (0 - this.moveDist.x) * 0.25
      this.moveDist.y += (0 - this.moveDist.y) * 0.25
    }

    this.normal.x = Util.map(this.x, -1, 1, 0, window.innerWidth)
    this.normal.y = Util.map(this.y, -1, 1, 0, window.innerHeight)

    let ease = 0.2
    this.easeNormal.x += (this.normal.x - this.easeNormal.x) * ease
    this.easeNormal.y += (this.normal.y - this.easeNormal.y) * ease
  }
}
