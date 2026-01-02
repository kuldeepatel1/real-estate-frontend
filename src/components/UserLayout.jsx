import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function UserLayout({ children }) {
  const { user, token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();

  // Remove the redirect logic from here - it's handled in Login.jsx
  // This layout should only render the navbar and footer

  return (
    <>
      <Navbar />
      <div className="min-h-[80vh]">
        {children}
      </div>
      <Footer />
    </>
  );
}

