import { createElementCategories } from "../utils/element-categories"
import EnhancedElementPalette from "../enhanced/element-palette"

export default function FormElementsSidebar() {
  const categories = createElementCategories()

  return <EnhancedElementPalette categories={categories} />
}
