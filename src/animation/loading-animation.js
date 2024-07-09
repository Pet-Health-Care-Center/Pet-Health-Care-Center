import React from 'react';
import Lottie from 'react-lottie';
import animationData from './Animation - 1719826638421.json'; // Adjust the path as necessary

const LoadingAnimation = () => {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

  return (
    <div className="loading-animation-overlay">
    <div className="loading-animation">
    <Lottie options={defaultOptions} height={450} width={450} />
    </div>
  </div>
  );
};

export default LoadingAnimation;
