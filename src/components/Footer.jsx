import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

export default function Footer() {
  const { list: categories } = useSelector((state) => state.categories);
  const categoriesList = Array.isArray(categories) ? categories : [];

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold text-indigo-400 mb-4">RealEstate</h3>
            <p className="text-gray-400 text-sm">
              Find your dream property with ease. We offer the best selection of homes, apartments, and commercial spaces.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link to="/" className="hover:text-white transition">Home</Link></li>
              <li><Link to="/properties" className="hover:text-white transition">Properties</Link></li>
              <li><Link to="/Dashboard" className="hover:text-white transition">Dashboard</Link></li>
              <li><Link to="/Favorites" className="hover:text-white transition">Favorites</Link></li>
            </ul>
          </div>

          {/* Property Types */}
          <div>
            <h4 className="font-semibold mb-4">Property Types</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              {categoriesList.length > 0 ? (
                categoriesList.map((cat) => (
                  <li key={cat.category_id}>
                    <Link 
                      to={`/properties?category=${cat.category_id}`} 
                      className="hover:text-white transition"
                    >
                      {cat.category_name}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li><Link to="/properties?category=3" className="hover:text-white transition">Residential</Link></li>
                  <li><Link to="/properties?category=5" className="hover:text-white transition">Commercial</Link></li>
                  <li><Link to="/properties?category=7" className="hover:text-white transition">Land</Link></li>
                  <li><Link to="/properties?category=8" className="hover:text-white transition">Luxury</Link></li>
                </>
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>183 Real Estate Ave</li>
              <li>Chadlodiya Ahmedabad</li>
              <li>Phone: +91 9726008438</li>
              <li>Email: kuldeeppatel7634@gmail.com</li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} RealEstate. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

