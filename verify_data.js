
const window = {};
global.window = window; // Ensure window is global
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
    console.log("Eval OK");

    // Mock ProductManager usage
    if (window.ProductManager) {
        console.log("ProductManager found");
        const products = window.ProductManager.getAll();
        console.log("Products count:", products.length);

        const newP = { name: "Test", price: 10, category: "Electronics" };
        window.ProductManager.save(newP);
        console.log("Product saved");
    } else {
        console.error("ProductManager NOT found on window");
    }

    // Mock CategoryManager usage
    if (window.CategoryManager) {
        console.log("CategoryManager found");
        const cats = window.CategoryManager.getAll();
        console.log("Categories:", cats);

        window.CategoryManager.add("NewCat");
        console.log("Category added");
        console.log("Categories after add:", window.CategoryManager.getAll());
    } else {
        console.error("CategoryManager NOT found on window");
    }

} catch (e) {
    console.error("Runtime Error:", e);
}
