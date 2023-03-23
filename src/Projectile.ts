import { Sprite, Graphics, type Application, type Texture } from 'pixi.js'
import { logProjectileTrail } from './logger'

export interface IProjectileOptions {
  id: number
  app: Application
  radius: number
  fillColor: number
  vx: number
  vy: number
}

export class Projectile extends Sprite {
  static textureCache: Texture
  public id!: number
  public isProjectile = true
  public app!: Application
  public radius!: number
  public vx!: number
  public vy!: number
  public fillColor!: number

  constructor (options: IProjectileOptions) {
    super()
    this.id = options.id
    this.app = options.app
    this.radius = options.radius
    this.vx = options.vx
    this.vy = options.vy
    this.fillColor = options.fillColor
    this.setup(options)
  }

  setup (options: IProjectileOptions): void {
    let texture = Projectile.textureCache
    if (texture == null) {
      const circle = new Graphics()
      circle.beginFill(this.fillColor)
      circle.drawCircle(0, 0, this.radius)
      circle.endFill()
      circle.cacheAsBitmap = true
      texture = options.app.renderer.generateTexture(circle)
      Projectile.textureCache = texture
    }
    this.texture = texture
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

  BuildTrail (): ProjectileTrail[] {
    const length = Math.floor(this.radius) * 3
    // const length = 1
    return Array.from({ length }, (_, idx) => {
      return new ProjectileTrail({
        mainId: this.id,
        mainX: this.x,
        mainY: this.y,
        texture: this.texture,
        radius: this.radius - (this.radius - 1) * idx / length,
        vx: this.vx,
        vy: this.vy,
        dt: 0.5 - (0.5 - 0.01) * idx / length,
        alpha: 0.9 - 0.8 * (idx + 1) / length
      })
    })
  }
}

interface IProjectileTrailOptions {
  mainId: number
  mainX: number
  mainY: number
  texture: Texture
  radius: number
  vx: number
  vy: number
  minDelta?: number
  dt?: number
  alpha?: number
}

export class ProjectileTrail extends Sprite {
  public mainId!: number
  public isProjectile = false
  public radius!: number
  public mainX!: number
  public mainY!: number
  public vx!: number
  public vy!: number
  public minDelta!: number
  public dt!: number

  constructor (options: IProjectileTrailOptions) {
    super(options.texture)
    this.mainId = options.mainId
    this.radius = options.radius
    this.mainX = options.mainX
    this.mainY = options.mainY
    this.vx = options.vx
    this.vy = options.vy
    this.minDelta = options.minDelta ?? 0.05
    this.dt = options.dt ?? 0.1
    this.tint = 0xffffff
    this.alpha = options.alpha ?? 1
    this.scale.set(options.radius * 2 / options.texture.width, options.radius * 2 / options.texture.height)
  }

  update (deltaMS: number): void {
    // const dt = 1 - Math.pow(1 - this.sharpness, deltaMS)
    const dt = this.dt
    this.mainX += this.vx
    this.mainY += this.vy
    logProjectileTrail(`main(${this.mainX}, ${this.mainY}) cur(${this.x}, ${this.y})`)

    const dx = Math.abs(this.x - this.mainX)
    const dy = Math.abs(this.y - this.mainY)
    logProjectileTrail('dt', dt, 'dx', dx, 'dy', dy, 'mind', this.minDelta)

    if (dx > this.minDelta) {
      logProjectileTrail('dx * dt', dx * dt)
      this.x += this.vx > 0 ? dx * dt : -dx * dt
    } else {
      this.x = this.mainX
    }

    if (dy > this.minDelta) {
      logProjectileTrail('dy * dt', dy * dt)
      this.y += this.vy > 0 ? dy * dt : -dy * dt
    } else {
      this.y = this.mainY
    }
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
