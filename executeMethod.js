const objectMap = new Map();

// This will only work if the className and fileName are the same,
const loadClass = async (className) =>
{
    if (objectMap.has(`${className}`)) return objectMap.get(`${className}`);
    else
    {
        const module = await import(`./businessObjects/${className}.js`);
        const classFile = module[className] || module.default;
        if (!classFile) throw new Error(`Class ${className} not found in ${className}.js`);
        else
        {
            const obj = new classFile();
            objectMap.set(`${className}`, obj);
            return objectMap.get(`${className}`);
        }
    }
}

export const executeMethod = async (request) =>
{
    const {obj, method, params = []} = request;
    const targetObject = await loadClass(obj);

    if (typeof targetObject[method] !== 'function')
        throw new Error(`Method "${method}" does not exist in object "${obj}".`);

    return targetObject[method](...params);
};