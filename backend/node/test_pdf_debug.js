const pdf = require('pdf-parse');
const fs = require('fs');

console.log('Type of pdf:', typeof pdf);
console.log('Value of pdf:', pdf);

// Try to use it if it's a function
if (typeof pdf === 'function') {
    console.log('It is a function!');
} else {
    console.log('It is NOT a function!');
    // Check if it has a default property
    if (pdf.default) {
        console.log('It has a .default property:', typeof pdf.default);
    }
}
