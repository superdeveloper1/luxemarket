
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
    console.log("--- Initial Load ---");
    const initialProducts = window.ProductManager.getAll();
    console.log("Initial count:", initialProducts.length);

    console.log("\n--- Saving New Product ---");
    const newProduct = { name: "Verification Product", price: 123.45, category: "Electronics" };
    window.ProductManager.save(newProduct);

    const savedProducts = window.ProductManager.getAll();
    const leaf = savedProducts[savedProducts.length - 1];
    console.log("Saved product:", leaf);

    if (leaf.name === "Verification Product" && typeof leaf.id === 'number') {
        console.log("SUCCESS: Product saved with numeric ID");
    } else {
        console.error("FAILURE: Product not saved correctly");
    }

    console.log("\n--- Simulating Migration Persistence ---");
    // Manually corrupt one item in localStorage (simulating old data)
    const raw = JSON.parse(localStorage.getItem('luxemarket_products'));
    raw[0].colors = ["OldColor"]; // String color needs migration
    delete raw[0].images; // Missing images needs migration
    localStorage.setItem('luxemarket_products', JSON.stringify(raw));

    console.log("Reloading data...");
    const migratedProducts = window.ProductManager.getAll();
    const item = migratedProducts[0];

    console.log("Migrated item colors:", item.colors);
    console.log("Migrated item images exist:", !!item.images);

    if (typeof item.colors[0] === 'object' && item.images && item.images.length > 0) {
        console.log("SUCCESS: Data migrated on load");

        // Check if migrated data was SAVED back to localStorage
        const secondaryRaw = JSON.parse(localStorage.getItem('luxemarket_products'));
        if (typeof secondaryRaw[0].colors[0] === 'object') {
            console.log("SUCCESS: Migrated data persisted back to localStorage");
        } else {
            console.error("FAILURE: Migrated data NOT persisted to localStorage");
        }
    } else {
        console.error("FAILURE: Data not migrated correctly");
    }

} catch (e) {
    console.error("Test Error:", e);
}
