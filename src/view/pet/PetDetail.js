import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auth } from "../../Components/firebase/firebase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { toast, ToastContainer } from "react-toastify";
import useForceUpdate from "../../hooks/useForceUpdate";
import { fetchUserById } from '../account/getUserData';
import { fetchPetDetails, fetchPetMedicalHistory, updatePetDetails } from './fetchPet';
import moment from "moment";

const PetDetail = () => {
  const { petId } = useParams();
  const [pet, setPet] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const forceUpdate = useForceUpdate();
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const catBreeds = [
    "-- Select Your Cat Breeds --",
    "Domestic Short Hair",
    "Domestic Long Hair",
    "Abyssinian",
    "American Bobtail",
    "American Curl",
    "American Shorthair",
    "American Wirehair",
    "Balinese",
    "Bengal",
    "Birman",
    "Bombay",
    "British Shorthair",
    "Burmese",
    "Chartreux",
    "Chausie",
    "Cornish Rex",
    "Devon Rex",
    "Donskoy",
    "Egyptian Mau",
    "Oriental",
    "Persian",
    "Peterbald",
    "Pixiebob",
    "Ragdoll",
    "Russian Blue",
    "Savannah",
    "Scottish Fold",
    "Selkirk Rex",
    "Serengeti",
    "Siberian",
    "Siamese",
    "Singapura",
    "Snowshoe",
    "Sokoke",
    "Somali",
    "Sphynx",
    "Thai",
    "Tonkinese",
    "Toyger",
    "Turkish Angora",
    "Turkish Van",
  ];

  const dogBreeds = [
    "-- Select Your Dog Breeds --",
    "Domestic Dog",
    "Affenpinscher",
    "Afghan Hound",
    "Akita",
    "Alaskan Malamute",
    "American Staffordshire terrier",
    "American Water Spaniel",
    "Australian cattle dog",
    "Australian shepherd",
    "Australian terrier",
    "Basenji",
    "Basset Hound",
    "Beagle",
    "Bearded Collie",
    "Bedlington Terrier",
    "Bernese Mountain Dog",
    "Bichon Frise",
    "Black And Tan Coonhound",
    "Bloodhound",
    "Border Collie",
    "Border Terrier",
    "Borzoi",
    "Boston Terrier",
    "Bouvier Des Flandres",
    "Boxer",
    "Briard",
    "Brittany",
    "Brussels Griffon",
    "Bull Terrier",
    "Bulldog",
    "Bullmastiff",
    "Cairn Terrier",
    "Canaan Dog",
    "Chesapeake Bay Retriever",
    "Chihuahua",
    "Chinese Crested",
    "Chinese Shar-pei",
    "Chow Chow",
    "Clumber Spaniel",
    "Cocker Spaniel",
    "Collie",
    "Curly-coated Retriever",
    "Dachshund",
    "Dalmatian",
    "Doberman Pinscher",
    "English Cocker Spaniel",
    "English Setter",
    "English Springer Spaniel",
    "English Toy Spaniel",
    "Eskimo Dog",
    "Finnish Spitz",
    "Flat-coated Retriever",
    "Fox Terrier",
    "Foxhound",
    "French Bulldog",
    "German Shepherd",
    "German Shorthaired pointer",
    "German Wirehaired pointer",
    "Golden Retriever",
    "Gordon Setter",
    "Great Dane",
    "Greyhound",
    "Irish Setter",
    "Irish Water Spaniel",
    "Irish Wolfhound",
    "Jack Russell Terrier",
    "Japanese Spaniel",
    "Keeshond",
    "Kerry Blue Terrier",
    "Komondor",
    "Kuvasz",
    "Labrador Retriever",
    "Lakeland Terrier",
    "Lhasa Apso",
    "Maltese",
    "Manchester Terrier",
    "Mastiff",
    "Mexican Hairless",
    "Newfoundland",
    "Norwegian Elkhound",
    "Norwich Terrier",
    "Otterhound",
    "Papillon",
    "Pekingese",
    "Pointer",
    "Pomeranian",
    "Poodle",
    "Pug",
    "Puli",
    "Rhodesian Ridgeback",
    "Rottweiler",
    "Saint Bernard",
    "Saluki",
    "Samoyed",
    "Schipperke",
    "Schnauzer",
    "Scottish Deerhound",
    "Scottish Terrier",
    "Sealyham Terrier",
    "Shetland Sheepdog",
    "Shih Tzu",
    "Siberian Husky",
    "Silky Terrier",
    "Skye Terrier",
    "Staffordshire Bull Terrier",
    "Soft-coated Wheaten Terrier",
    "Sussex Spaniel",
    "Spitz",
    "Tibetan Terrier",
    "Vizsla",
    "Weimaraner",
    "Welsh Terrier",
    "West Highland White Terrier",
    "Whippet",
    "Yorkshire Terrier",
  ];

  const [selectedBreeds, setSelectedBreeds] = useState(dogBreeds);

  const handleTypeChange = (event) => {
    const type = event.target.value;
    handleInputChange(event);
    if (type === "Cat") {
      setSelectedBreeds(catBreeds);
    } else if (type === "Dog") {
      setSelectedBreeds(dogBreeds);
    }
  };

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    weight: "",
    type: "",
    breed: "",
    dob: "",
    gender: "",
    imageUrl: "",
  });

  const user = auth.currentUser;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await fetchUserById(user.uid);
        console.log('Fetched user data:', userData);
        setUserData(userData);
      } catch (error) {
        setError(error.message);
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.uid) {
      fetchUserData();
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      console.log("No user is currently logged in.");
      return;
    }

    const fetchPetData = async () => {
      try {
        const petData = await fetchPetDetails(user.uid, petId);
        console.log('Fetched pet data:', petData);
        setPet(petData.pet);
        setFormData({
          name: petData.pet.name,
          age: petData.pet.age,
          weight: petData.pet.weight,
          type: petData.pet.type,
          breed: petData.pet.breed,
          dob: petData.pet.dob,
          gender: petData.pet.gender,
          color: petData.pet.color,
          imageUrl: petData.pet.imageUrl
        });
      } catch (error) {
        console.error("Error fetching pet details:", error);
      }
    };

    const fetchMedicalHistoryData = async () => {
      try {
        const medicalHistoryData = await fetchPetMedicalHistory(user.uid, petId);
        console.log('Fetched medical history data:', medicalHistoryData);
        setMedicalHistory(medicalHistoryData.medicalHistory);
      } catch (error) {
        console.error("Error fetching medical history data:", error);
      }
    };

    fetchPetData();
    fetchMedicalHistoryData();
  }, [user, petId]);

  const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const handleEditClick = () => {
    setIsEditMode(true);
  };

  const handleCancelClick = () => {
    setIsEditMode(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value || "",
    }));
  };

  const handleUpdateClick = async () => {
    try {
      await updatePetDetails(user.uid, petId, formData);
      toast.success('Updated pet data successful!', {
        autoClose: 2000,
      });
      setPet(formData);
      setIsEditMode(false);
    } catch (error) {
      console.error("Error updating pet details:", error);
    }
  };

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const difference = Date.now() - birthDate.getTime();
    const ageDate = new Date(difference);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const handleDobChange = (event) => {
    const dob = event.target.value;
    const age = calculateAge(dob);
    setFormData((prevData) => ({
      ...prevData,
      dob: dob,
      age: age.toString(),
    }));
  };

  if (!pet || !userData) {
    return <p>Loading pet details...</p>;
  }

  return (
    <div
      style={{
        height: "100%",
        minHeight: "100vh",
        position: "relative",
        width: "100%",
        background: "linear-gradient(to right, #fcecea, #fef7ed)",
        overflowY: "auto",
      }}
    >
      <div className="pet-profile-wrapper">
        <div className="left-panel pet-detail">
          <img src={formData.imageUrl} alt="Pet Avatar" className="pet-avatar" />
          <div className="owner-info">
            <h3>Pet Parent</h3>
            <div style={{ display: "flex" }}>
              <h3>Username:</h3>
              <p style={{ marginLeft: "20px" }}>{userData.username}</p>
            </div>
            <div style={{ display: "flex" }}>
              <h3>Email:</h3>
              <p style={{ marginLeft: "20px" }}>{userData.email}</p>
            </div>
            <div style={{ display: "flex" }}>
              <h3>Address:</h3>
              <p style={{ marginLeft: "20px" }}>{userData.address || "N/A"}</p>
            </div>
            <div style={{ display: "flex" }}>
              <h3>Phone Number:</h3>
              <p style={{ marginLeft: "20px" }}>{userData.phone || "N/A"}</p>
            </div>
            <div style={{ display: "flex" }}>
              <h3>Status:</h3>
              <p style={{ margin: "12px 0px 0px 20px" }} className="status">
                {userData.accountStatus}
              </p>
            </div>
          </div>
        </div>
        <div className="right-panel pet-detail">
          {!isEditMode ? (
            <>
              <div className="section general-info">
                <div className="header-pet-info">
                  <h2>Hi, I'm {pet.name}</h2>
                  <div className="edit-button" onClick={handleEditClick}>
                    Edit <FontAwesomeIcon icon={faPenToSquare} />
                  </div>
                </div>
                <div className="section pet-general-info">
                  <div className="pet-info">
                    <p>Age:</p>
                    <div>{pet.age}</div>
                  </div>
                  <div className="pet-info">
                    <p>Weight:</p>
                    <div>{pet.weight || "N/A"}kg</div>
                  </div>
                  <div className="pet-info">
                    <p>Type Of Pet:</p>
                    <div>{pet.type || "N/A"}</div>
                  </div>
                </div>
                <div className="section pet-general-info">
                  <div className="pet-info">
                    <p>D.O.B:</p>
                    <div>
                      {moment(pet.dob).format("DD/MM/YYYY") || "N/A"}
                    </div>
                  </div>
                  <div className="pet-info">
                    <p>Breed:</p>
                    <div>{pet.breed || "N/A"}</div>
                  </div>
                  <div className="pet-info">
                    <p>Color:</p>
                    <div>{pet.color || "N/A"}</div>
                  </div>
                </div>
              </div>
              <div>
                <div>
                  <h2 style={{
                    margin: "24px 0px 12px 0px",
                  }}>Medical Record</h2>
                  <div className="scrollable-container">
                    {medicalHistory &&
                      medicalHistory.map((record, index) => (
                        <div className="section general-info" key={index}>
                          <h2>{record.date}</h2>
                          <div className="table-wrapper">
                            <table className="booking-details-table">
                              <tbody>
                                {Object.entries(record).map(
                                  ([key, value]) =>
                                    key !== "date" && (
                                      <tr key={key}>
                                        <td className="key-column">
                                          {capitalize(key)}
                                        </td>
                                        <td className="value-column">
                                          {capitalize(value.toString())}
                                        </td>
                                      </tr>
                                    )
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ))}
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
            <div className="edit-form">
              <div className="title-container">
                <h2>Hi, I'm {formData.name}</h2>
                <p>As pet parent, you can change or update your pet details</p>
              </div>
              <div className="form-group">
                <label>Pet Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  style={{
                    zIndex: "10000000",
                  }}
                />
              </div>
              <div className="form-group">
                <label>Type of Pet</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleTypeChange}
                  style={{
                    zIndex: "10000000",
                  }}
                >
                  <option value="">-- Select Your Pet Type --</option>
                  <option value="Cat">Cat</option>
                  <option value="Dog">Dog</option>
                </select>
              </div>
              <div className="form-group">
                <label>Color:</label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  style={{
                    zIndex: "10000000",
                  }}
                />
              </div>
              <div className="form-group">
                <label>Breed</label>
                <select
                  name="breed"
                  value={formData.breed}
                  onChange={handleInputChange}
                  style={{
                    zIndex: "10000000",
                  }}
                >
                  {selectedBreeds.map((breed, index) => (
                    <option key={index} value={breed}>
                      {breed}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>D.O.B</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleDobChange}
                  style={{
                    zIndex: "10000000",
                  }}
                />
              </div>
              <div className="form-group">
                <label>Weight(kg)</label>
                <input
                  type="text"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  style={{
                    zIndex: "10000000",
                  }}
                />
              </div>
              <div className="button-group">
                <button className="cancel-button" onClick={handleCancelClick}                   style={{
                    zIndex: "10000000",
                  }}>
                  Cancel
                </button>
                <button                   style={{
                    zIndex: "10000000",
                  }} className="update-button" onClick={handleUpdateClick}>
                  Update
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <img
        className="pet-image-left"
        src="https://cdn.prod.website-files.com/6139cf517cd6d26ff1548b86/6352491844284352957c5405_dog%20(1).png"
 alt="a dog looking up"
        sizes="(max-width: 479px) 100vw, (max-width: 991px) 200px, (min-width: 991px) and (max-width: 1600px) 350px, 400px"
      />
      <img
        className="pet-image-right"
        src="https://cdn.prod.website-files.com/6139cf517cd6d26ff1548b86/63525e4544284383347d65d1_cat%20insurance%20(1).png"
        alt="a cat looking down"
        sizes="(max-width: 479px) 100vw, (max-width: 991px) 200px, (min-width: 991px) and (max-width: 1600px) 350px, 400px"
      />
      <ToastContainer />
    </div>
  );
};

export default PetDetail;
