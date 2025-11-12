import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import useRecipesStore from '../store/recipesStore';
import useFormValidation from '../hooks/useFormValidation';
import { recipeSchema } from '../utils/validators';

const EditRecipe = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateRecipe, fetchRecipeById, currentRecipe, error } = useRecipesStore();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const dishTypes = ['appetizer', 'main course', 'dessert', 'snack', 'beverage', 'other'];

  const {
    values: formData,
    errors,
    handleChange,
    handleBlur,
    validate,
    setFormValues
  } = useFormValidation(recipeSchema, {
    title: '',
    dish_type: '',
    ingredients: '',
    instructions: '',
    preparation_time: '',
    origin: '',
    servings: ''
  });

  // Fetch recipe data on mount
  useEffect(() => {
    const loadRecipe = async () => {
      setIsFetching(true);
      try {
        await fetchRecipeById(id);
      } catch (err) {
        console.error('Error fetching recipe:', err);
        toast.error('Failed to load recipe. Please try again.');
        navigate('/user-recipes');
      } finally {
        setIsFetching(false);
      }
    };

    loadRecipe();
  }, [id, fetchRecipeById, navigate]);

  // Populate form when recipe data loads
  useEffect(() => {
    if (currentRecipe && currentRecipe.id === parseInt(id)) {
      setFormValues({
        title: currentRecipe.title || '',
        dish_type: currentRecipe.dish_type || '',
        ingredients: currentRecipe.ingredients || '',
        instructions: currentRecipe.instructions || '',
        preparation_time: currentRecipe.preparation_time?.toString() || '',
        origin: currentRecipe.origin || '',
        servings: currentRecipe.servings?.toString() || ''
      });
    }
  }, [currentRecipe, id, setFormValues]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = await validate();
    if (!isValid) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare data with proper types
      const recipeData = {
        title: formData.title.trim(),
        dish_type: formData.dish_type,
        ingredients: formData.ingredients.trim(),
        instructions: formData.instructions.trim(),
        preparation_time: formData.preparation_time.trim(),
        origin: formData.origin.trim() || null,
        servings: formData.servings ? parseInt(formData.servings) : null
      };

      await updateRecipe(id, recipeData);
      toast.success('Recipe updated successfully!');
      navigate('/user-recipes');
    } catch (error) {
      console.error('Error updating recipe:', error);
      
      // Handle specific error messages
      if (error.message.includes('403') || error.message.includes('permission')) {
        toast.error("You don't have permission to edit this recipe.");
        navigate('/user-recipes');
      } else if (error.message.includes('404') || error.message.includes('not found')) {
        toast.error('Recipe not found.');
        navigate('/user-recipes');
      } else if (error.message.includes('authentication') || error.message.includes('token')) {
        toast.error('Session expired. Please log in again.');
        navigate('/login');
      } else {
        toast.error(error.message || 'Failed to update recipe. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/user-recipes');
  };

  // Loading state while fetching recipe
  if (isFetching) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Icon icon="mdi:loading" className="h-12 w-12 animate-spin text-teal-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading recipe...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Error state if recipe fetch failed
  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md">
            <Icon icon="mdi:alert-circle" className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Recipe</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/user-recipes')}
              className="inline-flex items-center gap-2 rounded-lg bg-teal-500 px-6 py-3 text-white transition-colors hover:bg-teal-600"
            >
              <Icon icon="mdi:arrow-left" className="h-5 w-5" />
              <span>Back to My Recipes</span>
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Edit Recipe</h1>
            <p className="text-gray-600">Update your recipe details</p>
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
                aria-invalid={errors.instructions ? 'true' : 'false'}
                aria-describedby={errors.instructions ? 'instructions-error' : undefined}
                placeholder="Provide step-by-step instructions for preparing this recipe"
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
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <Icon icon="mdi:check" className="h-5 w-5" />
                    <span>Update Recipe</span>
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

export default EditRecipe;
