import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookingContext } from '../../Components/context/BookingContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretLeft, faCaretRight } from '@fortawesome/free-solid-svg-icons';
import { getDatabase, ref, onValue } from "firebase/database";
import Spinner from 'react-bootstrap/Spinner'; // Ensure you have react-bootstrap installed
import {fetchServices} from "./fetchAllBookingData"
import LoadingAnimation from '../../animation/loading-animation';

const SelectService = () => {
  const { selectedPet, setSelectedServices } = useContext(BookingContext);
  const [selectedServiceList, setSelectedServiceList] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true); // State to manage loading status
  const navigate = useNavigate();
  const db = getDatabase();

  useEffect(() => {
    if (!selectedPet) {
      navigate('/book/select-pet');
    }
  }, [selectedPet, navigate]);

  useEffect(() => {
    const fetchServiceData = async () => {
      setLoading(true)
      try {
        const data = await fetchServices();
        setServices(data.services);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServiceData();
  }, []);

  const handleServiceChange = (serviceName) => {
    const service = services.find((s) => s.name === serviceName);
    setSelectedServiceList((prevServices) =>
      prevServices.some((s) => s.name === serviceName)
        ? prevServices.filter((s) => s.name !== serviceName)
        : [...prevServices, service]
    );
  };

  const handleNext = () => {
    setSelectedServices(selectedServiceList);
    navigate('/book/select-datetime');
  };

  const isServiceSelected = (serviceName) => {
    return selectedServiceList.some((s) => s.name === serviceName);
  };
  if (!selectedPet) {
    return (
      <div className="service-selection">

        <h1>No pet selected. Please go back and select a pet.</h1>
        <button onClick={() => navigate('/book/select-pet')}>Go Back</button>
      </div>
    );
  }
  
  return (
    <div className="service-selection">
      {loading && <LoadingAnimation />}
          <h1>Select Services for <span className='service-pet-name'>{selectedPet.name}</span></h1>
          <div className="service-list">
            {services.map((service) => (
              <div 
                key={service.id} 
                className={`service-item ${isServiceSelected(service.name) ? 'checked' : ''}`} 
                onClick={() => handleServiceChange(service.name)}
              >
                <h2>{service.name}</h2>
                <p className='service-description'>{service.description}</p>
                <img 
                  style={{ marginRight: "auto", width: "150px", marginBottom: "20px", marginTop: "20px" }} 
                  src={service.image} 
                  alt={service.name} 
                />
                <p className='service-price'>VND ${service.price}.00 Per Session</p>
                <input
                  type="checkbox"
                  id={service.name}
                  value={service.name}
                  checked={isServiceSelected(service.name)}
                  readOnly
                />
              </div>
            ))}
          </div>
          <button className="back-button" onClick={() => navigate(-1)}>  
            <FontAwesomeIcon className='icon-left' icon={faCaretLeft} /> BACK
          </button>
          <button 
            disabled={selectedServiceList.length === 0} 
            className='button-service' 
            onClick={handleNext}
          >
            NEXT 
            <FontAwesomeIcon className='icon-right' icon={faCaretRight} />
          </button>
    </div>
  );
};

export default SelectService;
