import { BgMain } from "./bg/bgMain";
import { Conf } from "./core/conf";

if(Conf.IS_TOUCH_DEVICE) document.body.classList.add('-touch')
if(!Conf.IS_TOUCH_DEVICE) document.body.classList.add('-mouse')

new BgMain({
  el: document.querySelector('.l-mainCanvas') as HTMLCanvasElement,
  transparent: false,
})
