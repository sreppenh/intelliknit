import React from 'react';

const WizardLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg">
        {children}
      </div>
    </div>
  );
};

export default WizardLayout;