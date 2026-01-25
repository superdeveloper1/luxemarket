
// Mock logic from Header.js to verify URL construction
function testSearchLogic(searchTerm, searchCategory, argTerm, argCat) {
    console.log(`Testing with state: searchTerm="${searchTerm}", searchCategory="${searchCategory}"`);
    console.log(`Arguments: argTerm=${JSON.stringify(argTerm)}, argCat=${JSON.stringify(argCat)}`);

    let actualTerm = searchTerm;
    let actualCat = searchCategory;

    if (typeof argTerm === 'string') {
        actualTerm = argTerm;
    }
    if (typeof argCat === 'string') {
        actualCat = argCat;
    }
    if (argTerm === '') {
        actualTerm = '';
    }

    console.log(`Resolved: actualTerm="${actualTerm}", actualCat="${actualCat}"`);

    let url = 'index.html?';
    const params = [];

    if (actualTerm && typeof actualTerm === 'string' && actualTerm.trim()) {
        params.push(`search=${encodeURIComponent(actualTerm.trim())}`);
    }

    if (actualCat && typeof actualCat === 'string' && actualCat !== 'All Categories') {
        params.push(`category=${encodeURIComponent(actualCat)}`);
    }

    const finalUrl = url + params.join('&') + '#featured-products';
    console.log('Result URL:', finalUrl);
    console.log('---');
    return finalUrl;
}

// Scenarios
console.log("Scenario 1: Normal Search Input");
testSearchLogic("Watch", "All Categories", undefined, undefined);

console.log("Scenario 2: Search with Category selected in dropdown");
testSearchLogic("Sofa", "Furniture", undefined, undefined);

console.log("Scenario 3: Click suggestion (passes args)");
testSearchLogic("Watch", "All Categories", "Specific Watch", "Accessories");

console.log("Scenario 4: Empty Search (should go to home)");
testSearchLogic("", "All Categories", undefined, undefined);

console.log("Scenario 5: Calling from event (e.g. Enter key) where first arg is event object");
testSearchLogic("Keyboard Input", "All Categories", { preventDefault: () => { } }, undefined);
