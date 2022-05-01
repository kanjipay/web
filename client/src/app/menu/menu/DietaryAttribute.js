export default class DietaryAttribute {
  static VEGAN = new DietaryAttribute(
    "VEGAN",
    "VG",
    "Vegan",
    "#008000",
    "#E6F3E6"
  );
  static VEGETARIAN = new DietaryAttribute(
    "VEGETARIAN",
    "Vg",
    "Vegetarian",
    "#008000",
    "#E6F3E6"
  );
  static LACTOSE_FREE = new DietaryAttribute(
    "LACTOSE_FREE",
    "LF",
    "Lactose free",
    "#2695FF",
    "#EAF5FF"
  );
  static GLUTEN_FREE = new DietaryAttribute(
    "GLUTEN_FREE",
    "GF",
    "Gluten free",
    "#F15907",
    "#FEEFE7"
  );
  static HALAL = new DietaryAttribute(
    "HALAL",
    "Hl",
    "Halal",
    "#CD06FF",
    "#FBE7FF"
  );

  static allItems = Object.values(DietaryAttribute);

  constructor(
    name,
    displayName,
    displayNameLong,
    foregroundColor,
    backgroundColor
  ) {
    this.name = name;
    this.displayName = displayName;
    this.displayNameLong = displayNameLong;
    this.foregroundColor = foregroundColor;
    this.backgroundColor = backgroundColor;
  }
}
