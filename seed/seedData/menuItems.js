const menuItems = [
  {
    id: "silvasRice",
    data: {
      price: 240,
      title: "Spicy Rice",
      description: "Basmati rice with paprika, red pepper and a dash of spice.",
      dietaryAttributes: [
        "VEGAN",
        "LACTOSE_FREE"
      ],
      isAvailable: true,
      spiceLevel: 2,
      photo: "spicy_rice.jpg",
      sortOrder: 1,
      merchantId: "silvas",
      sectionId: "silvasSides"
    }
  },
  {
    id: "silvasChips",
    data: {
      price: 220,
      title: "Peri-peri chips",
      description: "Fluffy centred chips seasoned with our special peri-peri salt.",
      dietaryAttributes: ["VEGAN"],
      spiceLevel: 1,
      isAvailable: true,
      photo: "peri_peri_chips.jpg",
      sortOrder: 2,
      merchantId: "silvas",
      sectionId: "silvasSides"
    }
  },
  {
    id: "silvasChicken",
    data: {
      price: 790,
      title: "Chicken Thighs",
      description: "Four grilled chicken thighs in our spicy sauce.",
      dietaryAttributes: ["HALAL"],
      isAvailable: true,
      spiceLevel: 3,
      photo: "chicken.jpg",
      sortOrder: 1,
      merchantId: "silvas",
      sectionId: "silvasMains"
    }
  },
  {
    id: "saplingMartini",
    data: {
      price: 800,
      title: "Martini",
      description: "The classic drink",
      dietaryAttributes: [],
      isAvailable: true,
      icon: "cocktail",
      sortOrder: 1,
      merchantId: "sapling",
      sectionId: "saplingCocktails"
    }
  },
  {
    id: "saplingIceTea",
    data: {
      price: 800,
      title: "Long Island Ice Tea",
      description: "Another cocktail",
      dietaryAttributes: [],
      isAvailable: true,
      icon: "cocktail",
      sortOrder: 1,
      merchantId: "sapling",
      sectionId: "saplingCocktails"
    }
  },
  {
    id: "saplingVodka",
    data: {
      price: 3900,
      title: "Vodka",
      description: "A bottle of vodka",
      dietaryAttributes: [],
      isAvailable: true,
      icon: "bottle",
      sortOrder: 1,
      merchantId: "sapling",
      sectionId: "saplingBottles"
    }
  },
]

module.exports = menuItems