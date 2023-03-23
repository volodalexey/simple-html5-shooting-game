import { Graphics } from 'pixi.js'

export interface IPlayerOptions {
  radius: number
  damage: number
  health: number
  fillColor: number
}

export class Player extends Graphics {
  public radius!: number
  public damage!: number
  public health!: number
  public fillColor!: number

  constructor (options: IPlayerOptions) {
    super()
    this.radius = options.radius
    this.damage = options.damage
    this.health = options.health
    this.fillColor = options.fillColor
    this.draw()
  }

  draw (): void {
    this.beginFill(this.fillColor)
    this.drawCircle(0, 0, this.radius)
    this.endFill()
  }
}
