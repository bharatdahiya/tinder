function generateKeys(val) {
  if (val === null || typeof val !== "object") return String(val);
  if (Array.isArray(val)) return "[" + val.map(generateKeys).join(",") + "]";
  const sortedKeys = Object.keys(val).sort();
  return (
    "{" +
    sortedKeys.map((key) => `${key}:${generateKeys(val[key])}`).join(",") +
    "}"
  );
}
function memoize(func) {
  // throw 'Not implemented';
  debugger;
  const cache = new Map();
  return function (...args) {
    const key = args.map(generateKeys).join(",");
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = func(...args);
    cache.set(key, result);
    return result;
  };
}

const sumValues = (obj) => {
  console.log("Calculating...");
  return Object.values(obj).reduce((a, b) => a + b, 0);
};

const memoizedSum = memoize(sumValues);

console.log(memoizedSum({ a: 1, b: 2 }, { c: 3, d: 4 })); // Calculating... 3
console.log(memoizedSum({ b: 2, a: 1 }, { d: 4, c: 3 })); // Cache hit for key: {a:1,b:2}|{c:3,d:4} 3

const testFn = (obj) => JSON.stringify(obj);
const memoized = memoize(testFn);

memoized({ a: 1, b: 2 }); // Should compute
memoized({ b: 2, a: 1 }); // Should hit cache (if sorted)

memoized([1, 2]); // Should compute
memoized([1, 2]); // Should hit cache
memoized({ user: { id: 1, info: { age: 25 } } });
memoized({ user: { id: 1, info: { age: 25 } } });
memoized({ user: { info: { age: 25 }, id: 1 } });
memoized({ a: 1 }, [10, 20]);
memoized([20, 10], { a: 1 });
