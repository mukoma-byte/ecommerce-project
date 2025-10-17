import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext.jsx";
import API from "../../api/axios.js";
import { useNavigate } from "react-router-dom";
import './profile.css'

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(user || null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login"); // redirect if not logged in
      return;
    }

    const getProfile = async () => {
      try {
        const { data } = await API.get("/auth/profile");
        setProfile(data);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }
    };

    getProfile();
  }, [user, navigate]);

  if (!profile) return <p>Loading...</p>;

  return (
    <div className="profile-page">
      <h2>Profile</h2>
      <div className="profile-info">
        <p>
          <span>Name:</span> {profile.name}
        </p>
        <p>
          <span>Email:</span> {profile.email}
        </p>
      </div>
    </div>
  );
};

export default Profile;
