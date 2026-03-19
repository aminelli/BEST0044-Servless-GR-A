console.log('1. Script iniziato');

// Operazione sincrona - va direttamente nel call stack
function operazioneSincrona() {
    console.log('2. Operazione sincrona completata');
}

// setTimeout - va nelle Node APIs
setTimeout(() => {
    console.log('6. Timeout completato');
}, 0);

// setImmediate - va nella fase check
setImmediate(() => {
    console.log('7. Immediate completato');
});

// Promise - microtask, priorità alta
Promise.resolve().then(() => {
    console.log('4. Promise risolta');
});

// Operazione I/O asincrona
const fs = require('fs');
fs.readFile(__filename, () => {
    console.log('5. File lettura completata');
    
    setTimeout(() => {
        console.log('8. Timeout dentro readFile');
    }, 0);
    
    setImmediate(() => {
        console.log('9. Immediate dentro readFile');
    });
});

operazioneSincrona();
console.log('3. Script finito');