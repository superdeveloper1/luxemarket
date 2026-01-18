
const window = {};
global.window = window;
const localStorage = {
    store: {},
    getItem: (key) => localStorage.store[key] || null,
    setItem: (key, val) => localStorage.store[key] = val,
    removeItem: (key) => delete localStorage.store[key]
};
global.localStorage = localStorage;

const fs = require('fs');
const content = fs.readFileSync('utils/data.js', 'utf8');

try {
    eval(content);
    console.log("--- Initial Load & Migration Check ---");

    // Simulate old data with string variantImages
    const oldProducts = [
        {
            id: 10,
            name: "Old Product",
            variantImages: {
                "Red": "http://example.com/red.jpg",
                "Blue": "http://example.com/blue.jpg"
            }
        }
    ];
    localStorage.setItem('luxemarket_products', JSON.stringify(oldProducts));

    const products = window.ProductManager.getAll();
    const migrated = products.find(p => p.id === 10);

    console.log("Migrated Red variant type:", typeof migrated.variantImages.Red);
    console.log("Migrated Red variant value:", migrated.variantImages.Red);

    if (Array.isArray(migrated.variantImages.Red) && migrated.variantImages.Red[0] === "http://example.com/red.jpg") {
        console.log("SUCCESS: Migration converted string to array");
    } else {
        console.error("FAILURE: Migration failed");
        process.exit(1);
    }

    console.log("\n--- Saving Multi-Image Variant ---");
    const newProduct = {
        name: "Multi-Angle Product",
        price: 99,
        category: "Test",
        variantImages: {
            "Green": ["url1", "url2", "url3"]
        }
    };
    window.ProductManager.save(newProduct);

    const savedProducts = window.ProductManager.getAll();
    const saved = savedProducts.find(p => p.name === "Multi-Angle Product");

    console.log("Saved Green variant:", saved.variantImages.Green);

    if (saved.variantImages.Green.length === 3) {
        console.log("SUCCESS: Multi-image variant saved correctly");
    } else {
        console.error("FAILURE: Saving failed");
        process.exit(1);
    }

} catch (e) {
    console.error("Test Error:", e);
    process.exit(1);
}
