import React from 'react';
import '../styles/loading-modal.css';
import '../styles/loading.css';

const LoadingModal = ({ message = "로딩 중..." }) => {
  return (
    <div className="loading-modal-overlay">
      <div className="loading-modal-content">
        <div className="loading-container">
          <div className="cute-loading-animation">
            <div className="loading-dots">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
            <div className="loading-text">{message}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AlertModal = ({ message, onClose, buttonText = "확인", buttonStyle = "primary" }) => {
  return (
    <div className="loading-modal-overlay" onClick={onClose}>
      <div className="loading-modal-content" onClick={(e) => e.stopPropagation()}>
        <div 
          className="alert-modal-message" 
          dangerouslySetInnerHTML={{ __html: message }}
        />
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

// 레시피 추천 없음 모달 표시 함수
export const showNoRecipeNotification = () => {
  return { 
    modalType: 'alert', 
    alertMessage: '현재 추천할 레시피가 없습니다.<br><span class="sub-message">곧 새로운 추천 레시피를 준비하겠습니다.</span>', 
    alertButtonText: '돌아가기',
    alertButtonStyle: 'primary',
    isVisible: true 
  };
};

// 로그인 완료 알림 모달 표시 함수
export const showLoginCompleteNotification = () => {
  return { 
    modalType: 'alert', 
    alertMessage: '로그인이 완료되었습니다.', 
    alertButtonText: '확인',
    alertButtonStyle: 'primary',
    isVisible: true 
  };
};

// 로그아웃 완료 알림 모달 표시 함수
export const showLogoutCompleteNotification = () => {
  return { 
    modalType: 'alert', 
    alertMessage: '로그아웃이 완료되었습니다.', 
    alertButtonText: '확인',
    alertButtonStyle: 'primary',
    isVisible: true 
  };
};

// 로그인 필요 알림 모달 표시 함수
export const showLoginRequiredNotification = () => {
  return { 
    modalType: 'alert', 
    alertMessage: '로그인이 필요한 서비스입니다.', 
    alertButtonText: '확인',
    alertButtonStyle: 'primary',
    isVisible: true 
  };
};

export const hideModal = () => {
  return { isVisible: false };
};

export { LoadingModal, AlertModal, ConfirmModal };
export default ModalManager;
