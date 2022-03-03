export default class DietaryAttribute {
  static VEGAN = new DietaryAttribute("VEGAN", "VG", "vegan")
  static VEGETARIAN = new DietaryAttribute("VEGETARIAN", "Vg", "vegetarian")
  static LACTOSE_FREE = new DietaryAttribute("LACTOSE_FREE", "LF", "lactoseFree")
  static GLUTEN_FREE = new DietaryAttribute("GLUTEN_FREE", "GF", "glutenFree")
  static HALAL = new DietaryAttribute("HALAL", "Hl", "halal")

  static allItems = [
    this.VEGAN,
    this.VEGETARIAN,
    this.LACTOSE_FREE,
    this.GLUTEN_FREE,
    this.HALAL
  ]

  constructor(name, displayName, className) {
    this.name = name
    this.displayName = displayName
    this.className = className
  }
}