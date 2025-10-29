import CategoryForm from "@/components/category-form";

export default function CreateCategoryPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Create New Category
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Fill out the details below to add a new category.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <CategoryForm />
      </div>
    </div>
  );
}
