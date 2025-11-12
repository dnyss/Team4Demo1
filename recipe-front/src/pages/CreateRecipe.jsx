import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import useRecipesStore from '../store/recipesStore';
import useFormValidation from '../hooks/useFormValidation';
import { recipeSchema } from '../utils/validators';

const CreateRecipe = () => {
  const navigate = useNavigate();
  const { createRecipe } = useRecipesStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dishTypes = ['appetizer', 'main course', 'dessert', 'snack', 'beverage', 'other'];

  const {
    values: formData,
    errors,
    handleChange,
    handleBlur,
    validate
  } = useFormValidation(recipeSchema, {
    title: '',
    dish_type: '',
    ingredients: '',
    instructions: '',
    preparation_time: '',
    origin: '',
    servings: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = await validate();
    if (!isValid) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare data with proper types - preparation_time should be string, servings should be int
      const recipeData = {
        title: formData.title.trim(),
        dish_type: formData.dish_type,
        ingredients: formData.ingredients.trim(),
        instructions: formData.instructions.trim(),
        preparation_time: formData.preparation_time.trim(),
        origin: formData.origin.trim() || null,
        servings: formData.servings ? parseInt(formData.servings) : null
      };


      await createRecipe(recipeData);
      toast.success('Recipe created successfully!');
      navigate('/user-recipes');
    } catch (error) {
      console.error('Error creating recipe:', error);
      
      // Handle specific error messages from backend
      if (error.message.includes('authentication') || error.message.includes('token')) {
        toast.error('Session expired. Please log in again.');
        navigate('/login');
      } else {
        toast.error(error.message || 'Failed to create recipe. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/user-recipes');
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Create New Recipe</h1>
            <p className="text-gray-600">Share your culinary creation with the community</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Recipe Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isSubmitting}
                className={`w-full rounded-lg border ${errors.title ? 'border-red-500' : 'border-gray-300'} px-4 py-2 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                placeholder="e.g., Chocolate Chip Cookies"
                aria-invalid={errors.title ? 'true' : 'false'}
                aria-describedby={errors.title ? 'title-error' : undefined}
              />
              {errors.title && <p id="title-error" className="mt-1 text-sm text-red-500" role="alert">{errors.title}</p>}
            </div>

            {/* Dish Type */}
            <div>
              <label htmlFor="dish_type" className="block text-sm font-medium text-gray-700 mb-1">
                Dish Type <span className="text-red-500">*</span>
              </label>
              <select
                id="dish_type"
                name="dish_type"
                value={formData.dish_type}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isSubmitting}
                className={`w-full rounded-lg border ${errors.dish_type ? 'border-red-500' : 'border-gray-300'} px-4 py-2 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                aria-invalid={errors.dish_type ? 'true' : 'false'}
                aria-describedby={errors.dish_type ? 'dish_type-error' : undefined}
              >
                <option value="">Select a dish type</option>
                {dishTypes.map(type => (
                  <option key={type} value={type} className="capitalize">
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
              {errors.dish_type && <p id="dish_type-error" className="mt-1 text-sm text-red-500" role="alert">{errors.dish_type}</p>}
            </div>

            {/* Preparation Time and Servings - Side by Side */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Preparation Time */}
              <div>
                <label htmlFor="preparation_time" className="block text-sm font-medium text-gray-700 mb-1">
                  Preparation Time (minutes) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="preparation_time"
                  name="preparation_time"
                  value={formData.preparation_time}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isSubmitting}
                  min="1"
                  max="1440"
                  className={`w-full rounded-lg border ${errors.preparation_time ? 'border-red-500' : 'border-gray-300'} px-4 py-2 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                  placeholder="e.g., 30"
                  aria-invalid={errors.preparation_time ? 'true' : 'false'}
                  aria-describedby={errors.preparation_time ? 'preparation_time-error' : undefined}
                />
                {errors.preparation_time && <p id="preparation_time-error" className="mt-1 text-sm text-red-500" role="alert">{errors.preparation_time}</p>}
              </div>

              {/* Servings */}
              <div>
                <label htmlFor="servings" className="block text-sm font-medium text-gray-700 mb-1">
                  Servings
                </label>
                <input
                  type="number"
                  id="servings"
                  name="servings"
                  value={formData.servings}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={isSubmitting}
                  min="1"
                  max="100"
                  className={`w-full rounded-lg border ${errors.servings ? 'border-red-500' : 'border-gray-300'} px-4 py-2 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                  placeholder="e.g., 4"
                  aria-invalid={errors.servings ? 'true' : 'false'}
                  aria-describedby={errors.servings ? 'servings-error' : undefined}
                />
                {errors.servings && <p id="servings-error" className="mt-1 text-sm text-red-500" role="alert">{errors.servings}</p>}
              </div>
            </div>

            {/* Origin */}
            <div>
              <label htmlFor="origin" className="block text-sm font-medium text-gray-700 mb-1">
                Origin / Cuisine
              </label>
              <input
                type="text"
                id="origin"
                name="origin"
                value={formData.origin}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isSubmitting}
                className={`w-full rounded-lg border ${errors.origin ? 'border-red-500' : 'border-gray-300'} px-4 py-2 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                placeholder="e.g., Italian, American, Mexican"
                aria-invalid={errors.origin ? 'true' : 'false'}
                aria-describedby={errors.origin ? 'origin-error' : undefined}
              />
              {errors.origin && <p id="origin-error" className="mt-1 text-sm text-red-500" role="alert">{errors.origin}</p>}
            </div>

            {/* Ingredients */}
            <div>
              <label htmlFor="ingredients" className="block text-sm font-medium text-gray-700 mb-1">
                Ingredients <span className="text-red-500">*</span>
              </label>
              <textarea
                id="ingredients"
                name="ingredients"
                value={formData.ingredients}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isSubmitting}
                rows="6"
                className={`w-full rounded-lg border ${errors.ingredients ? 'border-red-500' : 'border-gray-300'} px-4 py-2 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                placeholder="List all ingredients with quantities, one per line"
                aria-invalid={errors.ingredients ? 'true' : 'false'}
                aria-describedby={errors.ingredients ? 'ingredients-error' : undefined}
              />
              {errors.ingredients && <p id="ingredients-error" className="mt-1 text-sm text-red-500" role="alert">{errors.ingredients}</p>}
              <p className="mt-1 text-xs text-gray-500">Tip: List each ingredient on a new line with quantities</p>
            </div>

            {/* Instructions */}
            <div>
              <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-1">
                Instructions <span className="text-red-500">*</span>
              </label>
              <textarea
                id="instructions"
                name="instructions"
                value={formData.instructions}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={isSubmitting}
                rows="8"
                className={`w-full rounded-lg border ${errors.instructions ? 'border-red-500' : 'border-gray-300'} px-4 py-2 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                placeholder="Provide step-by-step instructions for preparing this recipe"
                aria-invalid={errors.instructions ? 'true' : 'false'}
                aria-describedby={errors.instructions ? 'instructions-error' : undefined}
              />
              {errors.instructions && <p id="instructions-error" className="mt-1 text-sm text-red-500" role="alert">{errors.instructions}</p>}
              <p className="mt-1 text-xs text-gray-500">Tip: Number your steps for clarity</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-6 py-3 text-white transition-colors hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Icon icon="mdi:loading" className="h-5 w-5 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Icon icon="mdi:check" className="h-5 w-5" />
                    <span>Create Recipe</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-gray-200 px-6 py-3 text-gray-700 transition-colors hover:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Icon icon="mdi:close" className="h-5 w-5" />
                <span>Cancel</span>
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CreateRecipe;