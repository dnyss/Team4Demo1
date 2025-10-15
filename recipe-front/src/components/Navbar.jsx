const Navbar = () => {
  return (
    <nav className="bg-white shadow-md py-4 px-6">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold text-orange-500">TasteCraft</h1>
        <div className="flex space-x-4">
          <button className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition duration-200">
            Sign Up
          </button>
          <button className="border border-orange-500 text-orange-500 px-4 py-2 rounded-md hover:bg-orange-50 transition duration-200">
            Log In
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
