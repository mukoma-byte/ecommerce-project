import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../api/axios";

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const getProfile = async () => {
      const { data } = await API.get("/auth/profile");
      setProfile(data);
    };
    getProfile();
  }, []);

  if (!profile) return <p>Loading...</p>;

  return (
    <div className="flex flex-col items-center mt-10">
      <h2 className="text-2xl mb-4">Profile</h2>
      <p>
        <b>Name:</b> {profile.name}
      </p>
      <p>
        <b>Email:</b> {profile.email}
      </p>
    </div>
  );
};

export default Profile;
