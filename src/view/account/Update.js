import React, { useState, useEffect } from "react";
import { auth } from "../../Components/firebase/firebase";
import { useNavigate } from "react-router-dom";
import { updateProfile } from "firebase/auth";
import {
  getDatabase,
  ref,
  onValue,
  update as updateDatabase,
} from "firebase/database";
import { ToastContainer, toast } from "react-toastify";
import useForceUpdate from "../../hooks/useForceUpdate";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faIdBadge } from "@fortawesome/free-solid-svg-icons";
import { TextField, Button, Container, Box, Typography } from "@mui/material";
import { faPenToSquare, faCamera } from "@fortawesome/free-solid-svg-icons";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import RefundModal from './RefundModal';

function Update() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [accountBalance, setAccountBalance] = useState("");
  const [userId, setUserId] = useState("");
  const [fullname, setFullname] = useState("");
  const [dob, setDob] = useState("");
  const [loading, setLoading] = useState(true);
  const [userUpdated, setUserUpdated] = useState(false);
  const navigate = useNavigate();
  const user = auth.currentUser;
  const forceUpdate = useForceUpdate();
  const [isEditMode, setIsEditMode] = useState(false);
  const [avatar, setAvatar] = useState(
    "https://icons.veryicon.com/png/o/miscellaneous/user-avatar/user-avatar-male-5.png"
  );
  const [gender, setGender] = useState("Male");
  const [join, setJoin] = useState("");
  const [showModal, setShowModal] = useState(false);


  const timestamp = parseInt(user?.metadata?.lastLoginAt, 10);
  const date = new Date(timestamp);
  const utcHours = date.getUTCHours();
  const vietnamDate = new Date(date.setUTCHours(utcHours));
  const formattedDate = vietnamDate.toLocaleString("en-US", {
    timeZone: "Asia/Ho_Chi_Minh",
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });


  useEffect(() => {
    if (user) {
      setUserId(user.uid);
      setEmail(localStorage.getItem('email') || '');
      setUsername(localStorage.getItem('username') || '');
    }
  }, [user]);

  useEffect(() => {
    if (userId) {
      const db = getDatabase();
      const userRef = ref(db, "users/" + userId);

      onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setEmail(data.email);
          setUsername(data.username);
          setPhone(data.phone);
          setAddress(data.address);
          setFullname(data.fullname);
          setAccountBalance(data.accountBalance);
          setJoin(data.creationTime);
          setDob(data.dob)
          setGender(data.gender || "Male");
          if (data.avatar) {
            setAvatar(data.avatar);
          } else {
            setAvatar(
              data.gender === "Female"
                ? "https://static.vecteezy.com/system/resources/previews/004/899/833/non_2x/beautiful-girl-with-blue-hair-avatar-of-woman-for-social-network-vector.jpg"
                : "https://icons.veryicon.com/png/o/miscellaneous/user-avatar/user-avatar-male-5.png"
            );
          }
        }
        setLoading(false);
      });
    }
  }, [userId]);

  const handleGenderChange = (e) => {
    const newGender = e.target.value;
    setGender(newGender);
    setAvatar(
      newGender === "Female"
        ? "https://static.vecteezy.com/system/resources/previews/004/899/833/non_2x/beautiful-girl-with-blue-hair-avatar-of-woman-for-social-network-vector.jpg"
        : "https://icons.veryicon.com/png/o/miscellaneous/user-avatar/user-avatar-male-5.png"
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    const updates = {
      phone: phone || '',
      address: address || '',
      fullname: fullname || '',
      gender: gender || 'Male',
      dob: dob || '',
      avatar: avatar,
    };

    if (Object.keys(updates).length > 0) {
      const user = auth.currentUser;
      if (user) {
        try {
          await updateProfile(user, {
            phone,
            address: address || "",
            fullname: fullname || "",
            dob: dob || "",
            gender: gender || "Male",
            avatar: avatar,
          });

          await updateDatabase(ref(getDatabase(), "users/" + userId), updates);
          setUserUpdated(true);
          toast.success("Update profile successful!", {
            autoClose: 2000,
            onClose: () => {
              forceUpdate();
            },
          });
        } catch (error) {
          console.log(error);
        }
      }
    } else {
      toast.warning("Nothing change to update!");
    }
    setLoading(false);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const storage = getStorage();
      const storageReference = storageRef(
        storage,
        `avatars/${userId}/${file.name}`
      );

      try {
        await uploadBytes(storageReference, file);
        const downloadURL = await getDownloadURL(storageReference);
        setAvatar(downloadURL);

        // Update the avatar URL in the database
        const db = getDatabase();
        await updateDatabase(ref(db, "users/" + userId), {
          avatar: downloadURL,
        });

        toast.success("Avatar updated successfully!");
      } catch (error) {
        console.error("Error uploading avatar:", error);
        toast.error("Failed to upload avatar. Please try again.");
      }
    }
  };
  return (
    <div
    style={{
      height: "100%",
      minHeight: "100vh",
      position: "relative",
      width: "100%",
      backgroundColor: "#EBEFF2",
      overflowY: "auto",
    }}
    >
      <div className="pet-profile-wrapper user-profile-wrapper">
        <div className="left-panel">
          <div className="avatar-container" style={{ position: "relative" }}>
            <img src={avatar} alt="User Avatar" className="user-avatar" />
            <label
              htmlFor="file-input"
              className="upload-icon"
              style={{
                position: "absolute",
                top: "120px",
                left: "0",
                cursor: "pointer",
                zIndex: "1000"
              }}
            >
              <FontAwesomeIcon
                style={{ fontSize: "24px", color: "#000" }}
                icon={faCamera}
              />
            </label>
            <input
              id="file-input"
              type="file"
              style={{ display: "none" }}
              onChange={handleImageUpload}
            />
          </div>
          <div className="owner-info">
            <h3>Information</h3>
            <div style={{ display: "flex" }}>
              <h3>Account Balance:</h3>
              <p style={{ margin: "12px 0px 0px 20px" }} className="status">
                {accountBalance}
              </p>
            </div>
            <div style={{ display: "flex" }}>
              <h3>Created At:</h3>
              <p style={{ margin: "12px 0px 0px 20px" }}>
                {join.split(" ").slice(0, 4).join(" ")}
              </p>
            </div>
            <div style={{ display: "flex" }}>
              <h3>Last Signed In:</h3>
              <p style={{ margin: "12px 0px 0px 20px" }}>
                {formattedDate.split(",")[0] +
                  ", " +
                  formattedDate.split(",")[1] +
                  formattedDate.split(",")[2]}
              </p>
            </div>
          </div>
          <h3
            style={{
              color: "#CF0070",
              margin: "20px 0",
              fontSize: "2rem",
            }}
          >
            Request to refund your account balance
          </h3>
          <button
            className="booking-detail back-button"
            onClick={() => setShowModal(true)}
          >
            Click here!
          </button>
        </div>
        <div className="right-panel">
          {!isEditMode ? (
            <>
              <div className="section general-info">
                <div className="header-pet-info">
                  <h2>Hi, I'm {fullname}</h2>
                  <div
                    className="edit-button"
                    onClick={() => setIsEditMode(true)}
                  >
                    Edit <FontAwesomeIcon icon={faPenToSquare} />
                  </div>
                </div>
                <div className="section pet-general-info">
                  <div style={{ display: "flex" }} className="user-info">
                    <p>
                      <span>Username:</span> {username}
                    </p>
                  </div>
                  <div className="user-info">
                    <p>
                      <span>Email: </span>
                      {email}
                    </p>
                  </div>
                </div>
                <div className="section pet-general-info">
                  <div className="user-info">
                    <p>
                      <span>DOB: </span>
                      {dob || "N/A"}
                    </p>
                  </div>
                  <div className="user-info">
                    <p>
                      <span>Phone Number: </span>
                      {phone}
                    </p>
                  </div>
                </div>
                <div className="section pet-general-info">
                  <div className="user-info">
                    <p>
                      <span>Address: </span>
                      {address || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
              <button
                className="booking-detail back-button"
                onClick={() => navigate(-1)}
              >
                Back
              </button>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="edit-form">
              <div className="title-container">
                <h2>Hi, I'm {fullname}</h2>
                <p>Your can edit your personal information here!</p>
              </div>

              <div className="form-group">
                <label>Full name </label>
                <input
                  id="fullname"
                  label="Enter your full Name"
                  type="text"
                  autoComplete="off"
                  value={fullname}
                  placeholder="Enter your full name"
                  onChange={(e) => setFullname(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Gender</label>
                <select
                  name="gender"
                  value={gender}
                  onChange={handleGenderChange}
                >
                  <option>Male</option>
                  <option>Female</option>
                </select>
              </div>
              <div className="form-group">
                <label>D.O.B </label>
                <input
                  id="dob"
                  type="date"
                  autoComplete="off"
                  value={dob}
                  placeholder="Enter your full name"
                  onChange={(e) => setDob(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Address </label>
                <input
                  id="address"
                  label="address"
                  type="text"
                  autoComplete="off"
                  value={address}
                  placeholder="Enter your address"
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Phone Number </label>
                <input
                  id="phone"
                  label="Phone"
                  type="number"
                  autoComplete="off"
                  value={phone}
                  placeholder="Enter your phone"
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <button type="submit" className="update-button">
                Update
              </button>
              <button
                type="button"
                className="cancel-button"
                onClick={() => setIsEditMode(false)}
              >
                Cancel
              </button>
            </form>
          )}
        </div>
      </div>
      <RefundModal
            showModal={showModal}
            setShowModal={setShowModal}
            userId={userId}
          />
     <img
        className="pet-image-left"
        src="https://cdn.prod.website-files.com/6139cf517cd6d26ff1548b86/6352491844284352957c5405_dog%20(1).png"
 alt="a dog looking up"
      />
      <img
        className="pet-image-right"
        src="https://cdn.prod.website-files.com/6139cf517cd6d26ff1548b86/63525e4544284383347d65d1_cat%20insurance%20(1).png"
        alt="a cat looking down"
      />
      <ToastContainer />
    </div>
  );
}

export default Update;
