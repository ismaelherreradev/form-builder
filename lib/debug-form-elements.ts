import { FormElements } from "@/components/form-builder/elements";

// Debug function to check FormElements structure
export function debugFormElements() {
  console.log("=== FormElements Debug ===");
  console.log("FormElements keys:", Object.keys(FormElements));

  Object.entries(FormElements).forEach(([key, element]) => {
    console.log(`\n--- ${key} ---`);
    console.log("Type:", typeof element);
    console.log("Is function:", typeof element === 'function');
    console.log("Has construct:", 'construct' in element);
    console.log("Construct type:", typeof element.construct);
    console.log("Properties:", Object.keys(element));

    if (typeof element.construct === 'function') {
      try {
        const testElement = element.construct('test-id');
        console.log("Construct works:", !!testElement);
        console.log("Test element type:", testElement?.type);
      } catch (error) {
        console.log("Construct error:", error);
      }
    }
  });

  console.log("=== End Debug ===");
}

// Test specific element
export function testElementConstruct(elementType: string) {
  console.log(`Testing ${elementType}:`);

  const element = FormElements[elementType as keyof typeof FormElements];
  if (!element) {
    console.error(`Element ${elementType} not found`);
    return null;
  }

  console.log("Element type:", typeof element);
  console.log("Has construct:", 'construct' in element);

  if (typeof element.construct === 'function') {
    try {
      const instance = element.construct('test-' + Date.now());
      console.log("Created instance:", instance);
      return instance;
    } catch (error) {
      console.error("Error creating instance:", error);
      return null;
    }
  } else {
    console.error("No construct method found");
    return null;
  }
}
