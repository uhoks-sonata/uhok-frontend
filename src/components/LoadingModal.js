import React from 'react';
import Loading from './Loading';
import '../styles/loading-modal.css';

// 팝업 타입별 컴포넌트
const LoadingModal = ({ message = "로딩 중..." }) => {
  return (
    <div className="loading-modal-overlay">
      <div className="loading-modal-content">
        <Loading message={message} />
      </div>
    </div>
  );
};

const AlertModal = ({ message, onClose, buttonText = "확인", buttonStyle = "primary" }) => {
  return (
    <div className="loading-modal-overlay" onClick={onClose}>
      <div className="loading-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="alert-modal-message">{message}</div>
        <button className={`alert-modal-button ${buttonStyle}`} onClick={onClose}>
          {buttonText}
        </button>
      </div>
    </div>
  );
};

const ConfirmModal = ({ message, onConfirm, onCancel, confirmText = "확인", cancelText = "취소" }) => {
  return (
    <div className="loading-modal-overlay">
      <div className="loading-modal-content">
        <div className="alert-modal-message">{message}</div>
        <div className="confirm-modal-buttons">
          <button className="alert-modal-button cancel" onClick={onCancel}>
            {cancelText}
          </button>
          <button className="alert-modal-button confirm" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// 팝업 관리자 컴포넌트
const ModalManager = ({ 
  loadingMessage, 
  alertMessage, 
  confirmMessage,
  isVisible,
  modalType, // 'loading', 'alert', 'confirm'
  onClose,
  onConfirm,
  onCancel,
  confirmText,
  cancelText,
  alertButtonText,
  alertButtonStyle
}) => {
  if (!isVisible) return null;

  switch (modalType) {
    case 'loading':
      return <LoadingModal message={loadingMessage} />;
    case 'alert':
      return <AlertModal 
        message={alertMessage} 
        onClose={onClose} 
        buttonText={alertButtonText}
        buttonStyle={alertButtonStyle}
      />;
    case 'confirm':
      return (
        <ConfirmModal 
          message={confirmMessage} 
          onConfirm={onConfirm} 
          onCancel={onCancel}
          confirmText={confirmText}
          cancelText={cancelText}
        />
      );
    default:
      return null;
  }
};

// 개별 팝업 함수들
export const showLoading = (message = "로딩 중...") => {
  return { modalType: 'loading', loadingMessage: message, isVisible: true };
};

export const showAlert = (message, buttonText = "확인", buttonStyle = "primary") => {
  return { 
    modalType: 'alert', 
    alertMessage: message, 
    alertButtonText: buttonText,
    alertButtonStyle: buttonStyle,
    isVisible: true 
  };
};

export const showConfirm = (message, confirmText = "확인", cancelText = "취소") => {
  return { modalType: 'confirm', confirmMessage: message, confirmText, cancelText, isVisible: true };
};

// 찜 알림 모달 표시 함수
export const showWishlistNotification = () => {
  return { 
    modalType: 'alert', 
    alertMessage: '방송이 시작하면 알림을 보내드려요.', 
    alertButtonText: '확인',
    alertButtonStyle: 'primary',
    isVisible: true 
  };
};

// 찜 해제 알림 모달 표시 함수
export const showWishlistUnlikedNotification = () => {
  return { 
    modalType: 'alert', 
    alertMessage: '알림이 해제되었어요.', 
    alertButtonText: '확인',
    alertButtonStyle: 'secondary',
    isVisible: true 
  };
};

export const hideModal = () => {
  return { isVisible: false };
};

export default ModalManager;
