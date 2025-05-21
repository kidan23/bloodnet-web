import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  return (
    <div className="p-3 border-top-1 surface-border surface-section flex justify-content-between align-items-center">
      <div>
        <span className="font-medium mr-2">BloodNet</span>
        <span className="text-500">© {currentYear} Blood Donation Network</span>
      </div>

      <div className="flex align-items-center">
        <a href="#" className="p-ripple cursor-pointer text-600 mr-3 hover:text-900 transition-colors transition-duration-150">
          <i className="pi pi-globe mr-2"></i>
          <span>Website</span>
        </a>
        <a href="#" className="p-ripple cursor-pointer text-600 mr-3 hover:text-900 transition-colors transition-duration-150">
          <i className="pi pi-github mr-2"></i>
          <span>GitHub</span>
        </a>
        <a href="#" className="p-ripple cursor-pointer text-600 hover:text-900 transition-colors transition-duration-150">
          <i className="pi pi-external-link mr-2"></i>
          <span>Help</span>
        </a>
      </div>
    </div>
  );
};

export default Footer;
