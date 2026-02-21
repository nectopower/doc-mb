
export function generateExampleFromSchema(schema: any): any {
  if (!schema) return {};
  
  // If top-level example exists, use it
  if (schema.example) return schema.example;
  
  // If it's an object with properties, build the example from properties
  if (schema.type === 'object' && schema.properties) {
    const example: any = {};
    for (const key in schema.properties) {
      const prop = schema.properties[key];
      
      if (prop.example) {
        // Use property example
        example[key] = prop.example;
      } else if (prop.type === 'object') {
        // Recursively generate for objects
        example[key] = generateExampleFromSchema(prop);
      } else if (prop.type === 'array') {
        // Generate for array items
        if (prop.items) {
           example[key] = [generateExampleFromSchema(prop.items)];
        } else {
           example[key] = [];
        }
      } else {
        // Fallbacks for primitives
        if (prop.type === 'string') {
            if (prop.format === 'email') example[key] = 'user@example.com';
            else if (prop.format === 'date-time') example[key] = new Date().toISOString();
            else if (prop.format === 'date') example[key] = '2024-01-01';
            else if (prop.format === 'uuid') example[key] = '00000000-0000-0000-0000-000000000000';
            else example[key] = 'string';
        } else if (prop.type === 'number' || prop.type === 'integer') {
          example[key] = 0;
        } else if (prop.type === 'boolean') {
          example[key] = true;
        }
      }
    }
    return example;
  }
  
  // If it's an array
  if (schema.type === 'array' && schema.items) {
    return [generateExampleFromSchema(schema.items)];
  }

  return {};
}
