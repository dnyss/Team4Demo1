import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link, useParams } from 'react-router-dom';

const UpdateRecipe = () => {
  const { recipeId } = useParams();
  
  // Mock recipe data - in real app, this would come from API based on recipeId
  const mockRecipeData = {
    id: recipeId || 1,
    title: "My Secret Chocolate Chip Cookies",
    description: "Soft and chewy chocolate chip cookies that are perfect for any occasion. Ready in just 30 minutes!",
    ingredients: `- 2 1/4 cups all-purpose flour
- 1 teaspoon baking soda
- 1 teaspoon salt
- 1 cup butter, softened
- 3/4 cup granulated sugar
- 3/4 cup packed brown sugar
- 2 large eggs
- 2 teaspoons vanilla extract
- 2 cups chocolate chips`,
    steps: `1. Preheat oven to 375°F (190°C)
2. In a small bowl, mix flour, baking soda, and salt
3. In a large bowl, beat butter, granulated sugar, brown sugar, and vanilla until creamy
4. Add eggs one at a time, beating well after each addition
5. Gradually beat in flour mixture
6. Stir in chocolate chips
7. Drop by rounded tablespoon onto ungreased baking sheets
8. Bake for 9 to 11 minutes or until golden brown
9. Cool on baking sheets for 2 minutes; remove to wire racks to cool completely`
  };

  const [formData, setFormData] = useState({
    title: mockRecipeData.title,
    description: mockRecipeData.description,
    ingredients: mockRecipeData.ingredients,
    steps: mockRecipeData.steps
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Updating recipe:', formData);
    
    // In the future, this will make an API call
    console.log('Updated recipe data:', {
      id: recipeId,
      title: formData.title,
      description: formData.description,
      ingredients: formData.ingredients.split('\n').filter(ing => ing.trim()),
      steps: formData.steps.split('\n').filter(step => step.trim())
    });
    
    alert('Recipe updated successfully!');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
                Update Recipe
              </h2>
              <p className="text-center text-gray-600">
                Editing: {mockRecipeData.title}
              </p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Title Field */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Recipe Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter recipe title"
                  required
                />
              </div>

              {/* Description Field */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-vertical"
                  placeholder="Describe your recipe"
                  required
                />
              </div>

              {/* Ingredients Field */}
              <div>
                <label htmlFor="ingredients" className="block text-sm font-medium text-gray-700 mb-2">
                  Ingredients *
                </label>
                <textarea
                  id="ingredients"
                  name="ingredients"
                  value={formData.ingredients}
                  onChange={handleChange}
                  rows="6"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-vertical font-mono text-sm"
                  placeholder="List each ingredient on a new line"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">Enter each ingredient on a separate line.</p>
              </div>

              {/* Steps Field */}
              <div>
                <label htmlFor="steps" className="block text-sm font-medium text-gray-700 mb-2">
                  Preparation Steps *
                </label>
                <textarea
                  id="steps"
                  name="steps"
                  value={formData.steps}
                  onChange={handleChange}
                  rows="8"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-vertical font-mono text-sm"
                  placeholder="List each step on a new line"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">Enter each step on a separate line.</p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-4">
                <Link
                  to="/user-recipes"
                  className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg text-center hover:bg-gray-600 transition duration-200"
                >
                  Go Back
                </Link>
                <button
                  type="submit"
                  className="flex-1 bg-orange-500 text-white py-3 px-4 rounded-lg hover:bg-orange-600 transition duration-200 font-semibold"
                >
                  Update Recipe
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UpdateRecipe;