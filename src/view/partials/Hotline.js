import React from 'react';
import { useLocation } from 'react-router-dom';


const Hotline = () => {
  const location = useLocation();

    const shouldShowHeader = !location.pathname.startsWith("/vet") && !location.pathname.startsWith("/admin") && !location.pathname.startsWith("/manager");

    if (!shouldShowHeader) {
      return null; 
    }
    return (
        <div className="hotline-container">
            <div className="phone-icon">
                <i className="fa fa-phone"></i>
            </div>
            <div className="hotline-text">
                HOTLINE 1900 xxx xxx
            </div>
        </div>
    );
};

export default Hotline;