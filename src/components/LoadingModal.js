import React from 'react';
import Loading from './Loading';
import '../styles/loading-modal.css';

const LoadingModal = ({ message = "로딩 중..." }) => {
  return (
    <div className="loading-modal-overlay">
      <div className="loading-modal-content">
        <Loading message={message} />
      </div>
    </div>
  );
};

export default LoadingModal;
