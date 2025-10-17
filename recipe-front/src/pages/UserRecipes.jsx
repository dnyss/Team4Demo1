import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ConfirmDialog from '../components/ConfirmDialog';
import useRecipesStore from '../store/recipesStore';

const UserRecipes = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState(null);

  const {
    userRecipes,
    userRecipesLoading,
    userRecipesError,
    userSearchQuery,
    fetchUserRecipes,
    searchUserRecipes,
    clearUserSearch,
    deleteRecipe
  } = useRecipesStore();

  // Fetch user recipes on mount
  useEffect(() => {
    fetchUserRecipes();
  }, [fetchUserRecipes]);

  // Show error toast when error occurs
  useEffect(() => {
    if (userRecipesError) {
      toast.error(userRecipesError);
    }
  }, [userRecipesError]);

  // Debounced search - wait 300ms after user stops typing
  useEffect(() => {
    if (searchTerm === '') {
      clearUserSearch();
      return;
    }

    const debounceTimer = setTimeout(() => {
      searchUserRecipes(searchTerm);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, searchUserRecipes, clearUserSearch]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      searchUserRecipes(searchTerm);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    clearUserSearch();
  };

  const handleDeleteClick = (recipe) => {
    setRecipeToDelete(recipe);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (recipeToDelete) {
      try {
        await deleteRecipe(recipeToDelete.id);
        toast.success(`"${recipeToDelete.title}" has been deleted successfully`);
        setDeleteDialogOpen(false);
        setRecipeToDelete(null);
      } catch (error) {
        toast.error(error.message || 'Failed to delete recipe');
      }
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setRecipeToDelete(null);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-3xl font-bold text-gray-800">My Recipes</h1>
            <Link
              to="/recipe/new"
              className="flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-6 py-3 text-white transition-colors hover:bg-orange-600"
            >
              <Icon icon="mdi:plus-circle" className="h-5 w-5" />
              <span>Create New Recipe</span>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Icon
                  icon="mdi:magnify"
                  className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search your recipes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-10 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <Icon icon="mdi:close-circle" className="h-5 w-5" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="rounded-lg bg-orange-500 px-6 py-2 text-white transition-colors hover:bg-orange-600"
              >
                Search
              </button>
            </form>
            {userSearchQuery && (
              <p className="mt-2 text-sm text-gray-600">
                Showing results for: <span className="font-semibold">"{userSearchQuery}"</span>
              </p>
            )}
          </div>

          {/* Loading State */}
          {userRecipesLoading && (
            <div className="flex justify-center py-12">
              <Icon icon="mdi:loading" className="h-12 w-12 animate-spin text-orange-500" />
            </div>
          )}

          {/* Error State */}
          {!userRecipesLoading && userRecipesError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
              <div className="flex items-center gap-2">
                <Icon icon="mdi:alert-circle" className="h-5 w-5" />
                <p className="font-semibold">Error loading recipes</p>
              </div>
              <p className="mt-1 text-sm">{userRecipesError}</p>
            </div>
          )}

          {/* Recipes Grid */}
          {!userRecipesLoading && !userRecipesError && userRecipes.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {userRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="p-6">
                    <h2 className="mb-2 text-xl font-bold text-gray-800">{recipe.title}</h2>
                    <div className="mb-4 space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-teal-500">@{recipe.user_name || 'You'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon icon="mdi:food" className="h-4 w-4 text-teal-500" />
                        <span className="capitalize">{recipe.dish_type || 'Not specified'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon icon="mdi:clock-outline" className="h-4 w-4 text-orange-500" />
                        <span>{recipe.preparation_time || 'N/A'} mins</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon icon="mdi:account-group" className="h-4 w-4 text-orange-500" />
                        <span>{recipe.servings || 'N/A'} servings</span>
                      </div>
                      {recipe.origin && (
                        <div className="flex items-center gap-2">
                          <Icon icon="mdi:earth" className="h-4 w-4 text-orange-500" />
                          <span>{recipe.origin}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/recipe/${recipe.id}/edit`}
                        className="flex flex-1 items-center justify-center rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
                        title="Edit"
                      >
                        <Icon icon="mdi:pencil" className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => handleDeleteClick(recipe)}
                        className="flex flex-1 items-center justify-center rounded-lg bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600"
                        title="Delete"
                      >
                        <Icon icon="mdi:delete" className="h-5 w-5" />
                      </button>
                      <Link
                        to={`/recipe/${recipe.id}`}
                        className="mt-4 inline-block text-orange-500 font-semibold hover:text-orange-600 transition duration-200"
                      >
                        View Recipe &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!userRecipesLoading && !userRecipesError && userRecipes.length === 0 && (
            <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white py-12 text-center">
              <Icon icon="mdi:food-off" className="mx-auto mb-4 h-16 w-16 text-gray-400" />
              <h3 className="mb-2 text-xl font-semibold text-gray-800">
                {userSearchQuery ? 'No recipes found' : 'No recipes yet'}
              </h3>
              <p className="mb-6 text-gray-600">
                {userSearchQuery
                  ? `No recipes match "${userSearchQuery}". Try a different search term.`
                  : "You haven't created any recipes yet. Start sharing your culinary creations!"}
              </p>
              {!userSearchQuery && (
                <Link
                  to="/recipe/new"
                  className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-6 py-3 text-white transition-colors hover:bg-orange-600"
                >
                  <Icon icon="mdi:plus-circle" className="h-5 w-5" />
                  <span>Create Your First Recipe</span>
                </Link>
              )}
              {userSearchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="inline-flex items-center gap-2 rounded-lg bg-gray-200 px-6 py-3 text-gray-700 transition-colors hover:bg-gray-300"
                >
                  <Icon icon="mdi:close-circle" className="h-5 w-5" />
                  <span>Clear Search</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Recipe"
        message={`Are you sure you want to delete "${recipeToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
      />

      <Footer />
    </>
  );
};

export default UserRecipes;
