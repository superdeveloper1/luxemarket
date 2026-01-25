
// Mock Data
const allProducts = [
    { id: 1, name: "Luxury Watch", category: "Accessories", description: "A nice watch" },
    { id: 2, name: "Leather Sofa", category: "Furniture", description: "Comfy sofa" },
    { id: 3, name: "Running Shoes", category: "Fashion", description: "Fast shoes" }
];

// Mock URLSearchParams
function testSearch(searchQuery, categoryQuery) {
    console.log(`Testing search="${searchQuery}", category="${categoryQuery}"`);

    let current = [...allProducts];
    let label = null;

    if (categoryQuery && categoryQuery !== 'All Categories') {
        current = current.filter(p => p.category === categoryQuery);
        label = categoryQuery;
    }

    if (searchQuery) {
        const lower = searchQuery.toLowerCase();
        current = current.filter(p =>
            p.name.toLowerCase().includes(lower) ||
            p.description.toLowerCase().includes(lower)
        );
        label = `Search: "${searchQuery}"` + (label ? ` in ${label}` : '');
    }

    console.log("Result Count:", current.length);
    console.log("Label:", label);
    console.log("Items:", current.map(p => p.name));
    console.log("---");
}

testSearch("Sofa", null);
testSearch("Watch", "Accessories");
testSearch("Watch", "Furniture");
testSearch(null, "Fashion");
