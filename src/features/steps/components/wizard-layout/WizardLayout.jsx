import React from 'react';

const WizardLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-yarn-50">
      <div className="app-container bg-yarn-50 min-h-screen shadow-lg">
        {children}
      </div>
    </div>
  );
};

export default WizardLayout;