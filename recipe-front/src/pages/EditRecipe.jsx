import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import useRecipesStore from '../store/recipesStore';

const EditRecipe = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateRecipe, fetchRecipeById, currentRecipe, loading, error } = useRecipesStore();
  
  const [formData, setFormData] = useState({
    title: '',
    dish_type: '',
    ingredients: '',
    instructions: '',
    preparation_time: '',
    origin: '',
    servings: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const dishTypes = ['appetizer', 'main course', 'dessert', 'snack', 'beverage', 'other'];

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
      setFormData({
        title: currentRecipe.title || '',
        dish_type: currentRecipe.dish_type || '',
        ingredients: currentRecipe.ingredients || '',
        instructions: currentRecipe.instructions || '',
        preparation_time: currentRecipe.preparation_time?.toString() || '',
        origin: currentRecipe.origin || '',
        servings: currentRecipe.servings?.toString() || ''
      });
    }
  }, [currentRecipe, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }

    // Dish type validation
    if (!formData.dish_type) {
      newErrors.dish_type = 'Dish type is required';
    }

    // Ingredients validation
    if (!formData.ingredients.trim()) {
      newErrors.ingredients = 'Ingredients are required';
    } else if (formData.ingredients.length < 10) {
      newErrors.ingredients = 'Please provide more detailed ingredients (at least 10 characters)';
    }

    // Instructions validation
    if (!formData.instructions.trim()) {
      newErrors.instructions = 'Instructions are required';
    } else if (formData.instructions.length < 20) {
      newErrors.instructions = 'Please provide more detailed instructions (at least 20 characters)';
    }

    // Preparation time validation
    if (!formData.preparation_time) {
      newErrors.preparation_time = 'Preparation time is required';
    } else {
      const time = parseInt(formData.preparation_time);
      if (isNaN(time) || time <= 0) {
        newErrors.preparation_time = 'Preparation time must be a positive number';
      } else if (time > 1440) {
        newErrors.preparation_time = 'Preparation time cannot exceed 1440 minutes (24 hours)';
      }
    }

    // Servings validation (optional but if provided must be valid)
    if (formData.servings) {
      const servings = parseInt(formData.servings);
      if (isNaN(servings) || servings <= 0) {
        newErrors.servings = 'Servings must be a positive number';
      } else if (servings > 100) {
        newErrors.servings = 'Servings cannot exceed 100';
      }
    }

    // Origin validation (optional but limit length)
    if (formData.origin && formData.origin.length > 100) {
      newErrors.origin = 'Origin must be less than 100 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
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
        preparation_time: parseInt(formData.preparation_time),
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
                disabled={isSubmitting}
                className={`w-full rounded-lg border ${errors.title ? 'border-red-500' : 'border-gray-300'} px-4 py-2 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                placeholder="e.g., Chocolate Chip Cookies"
              />
              {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
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
                disabled={isSubmitting}
                className={`w-full rounded-lg border ${errors.dish_type ? 'border-red-500' : 'border-gray-300'} px-4 py-2 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200 disabled:bg-gray-100 disabled:cursor-not-allowed`}
              >
                <option value="">Select a dish type</option>
                {dishTypes.map(type => (
                  <option key={type} value={type} className="capitalize">
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
              {errors.dish_type && <p className="mt-1 text-sm text-red-500">{errors.dish_type}</p>}
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
                  disabled={isSubmitting}
                  min="1"
                  max="1440"
                  className={`w-full rounded-lg border ${errors.preparation_time ? 'border-red-500' : 'border-gray-300'} px-4 py-2 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                  placeholder="e.g., 30"
                />
                {errors.preparation_time && <p className="mt-1 text-sm text-red-500">{errors.preparation_time}</p>}
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
                  disabled={isSubmitting}
                  min="1"
                  max="100"
                  className={`w-full rounded-lg border ${errors.servings ? 'border-red-500' : 'border-gray-300'} px-4 py-2 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                  placeholder="e.g., 4"
                />
                {errors.servings && <p className="mt-1 text-sm text-red-500">{errors.servings}</p>}
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
                disabled={isSubmitting}
                className={`w-full rounded-lg border ${errors.origin ? 'border-red-500' : 'border-gray-300'} px-4 py-2 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                placeholder="e.g., Italian, American, Mexican"
              />
              {errors.origin && <p className="mt-1 text-sm text-red-500">{errors.origin}</p>}
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
                disabled={isSubmitting}
                rows="6"
                className={`w-full rounded-lg border ${errors.ingredients ? 'border-red-500' : 'border-gray-300'} px-4 py-2 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                placeholder="List all ingredients with quantities, one per line"
              />
              {errors.ingredients && <p className="mt-1 text-sm text-red-500">{errors.ingredients}</p>}
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
                disabled={isSubmitting}
                rows="8"
                className={`w-full rounded-lg border ${errors.instructions ? 'border-red-500' : 'border-gray-300'} px-4 py-2 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                placeholder="Provide step-by-step instructions for preparing this recipe"
              />
              {errors.instructions && <p className="mt-1 text-sm text-red-500">{errors.instructions}</p>}
              <p className="mt-1 text-xs text-gray-500">Tip: Number your steps for clarity</p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-teal-500 px-6 py-3 text-white transition-colors hover:bg-teal-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
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
