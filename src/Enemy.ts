import { Sprite, Graphics, type Application, type Texture } from 'pixi.js'

export interface IEnemyOptions {
  app: Application
  radius: number
  vx: number
  vy: number
}

export class Enemy extends Sprite {
  static minColor = 0xff0000
  static minColorArray = Enemy.numColorToArray(Enemy.minColor)
  static maxColor = 0x00ff00
  static maxColorArray = Enemy.numColorToArray(Enemy.maxColor)
  static textureCache: Texture
  public isProjectile = true
  public app!: Application
  public radius!: number
  public vx!: number
  public vy!: number

  constructor (options: IEnemyOptions) {
    super()
    this.app = options.app
    this.radius = options.radius
    this.vx = options.vx
    this.vy = options.vy
    this.setup(options)
  }

  static numColorToArray (num: number): [number, number, number] {
    const numStr = num.toString(16).padStart(6, '0')
    const r = Number.parseInt(numStr[0] + numStr[1], 16) // rgb >> 16;
    const g = Number.parseInt(numStr[2] + numStr[3], 16) // (rgb >> 8) % 256;
    const b = Number.parseInt(numStr[4] + numStr[5], 16) // rgb % 256;

    return [r, g, b]
  }

  static toHex (num: number): string {
    let hex = num.toString(16)
    if (hex.length === 1) {
      hex = '0' + hex
    }
    return hex
  }

  static interpolateColors (p: number): string {
    const q = 1 - p
    const [r1, g1, b1] = this.maxColorArray
    const [r2, g2, b2] = this.minColorArray
    const rr = Math.round(r1 * p + r2 * q)
    const rg = Math.round(g1 * p + g2 * q)
    const rb = Math.round(b1 * p + b2 * q)

    // return Number((rr << 16) + (rg << 8) + rb).toString(16)
    return Enemy.toHex(rr) + Enemy.toHex(rg) + Enemy.toHex(rb)
  }

  setup (options: IEnemyOptions): void {
    let texture = Enemy.textureCache
    if (texture == null) {
      const circle = new Graphics()
      circle.beginFill(0xffffff)
      circle.drawCircle(0, 0, this.radius)
      circle.endFill()
      circle.cacheAsBitmap = true
      texture = options.app.renderer.generateTexture(circle)
      Enemy.textureCache = texture
    }
    this.texture = texture
    this.scale.set(options.radius * 2 / texture.width, options.radius * 2 / texture.height)
    const colorStr = Enemy.interpolateColors(Math.random())
    this.tint = Number.parseInt(colorStr, 16)
  }

  update (): void {
    this.x = this.x + this.vx
    this.y = this.y + this.vy
  }

  isOutOfViewport ({ left, top, right, bottom }: { left: number, top: number, right: number, bottom: number }): boolean {
    const pLeft = this.x - this.radius
    const pTop = this.y - this.radius
    const pRight = this.x + this.radius
    const pBottom = this.y + this.radius
    if (pRight < left) {
      return true
    }
    if (pLeft > right) {
      return true
    }
    if (pBottom < top) {
      return true
    }
    if (pTop > bottom) {
      return true
    }
    return false
  }
}
