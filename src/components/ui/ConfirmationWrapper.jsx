/* eslint-disable react/prop-types */
import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';

const ConfirmationWrapper = ({ title, message, children, onConfirm }) => {
  const [isConfirmationOpen, setConfirmationOpen] = useState(false);
  const cancelButtonRef = useRef(null);

  useEffect(() => {
    if (isConfirmationOpen && cancelButtonRef.current) {
      cancelButtonRef.current.focus();
    }
  }, [isConfirmationOpen]);

  const handleOpenConfirmation = (e) => {
    e.stopPropagation();
    setConfirmationOpen(true);
  };

  const handleCloseConfirmation = (e) => {
    e.stopPropagation();
    setConfirmationOpen(false);
  };

  const handleConfirm = async (e) => {
    e.stopPropagation();
    try {
      await onConfirm();
      toast.success('Операция выполнена успешно');
    } catch (error) {
      toast.error(error.message || 'Ошибка при выполнении операции');
    } finally {
      setConfirmationOpen(false);
    }
  };

  const modalContent = isConfirmationOpen ? (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 text-center px-2 sm:px-4 transition-opacity duration-300 ${
        isConfirmationOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={handleCloseConfirmation}
      role="dialog"
      aria-labelledby="confirmation-title"
      aria-modal="true"
    >
      <div
        className={`bg-white w-full max-w-[90%] sm:max-w-md p-4 sm:p-6 rounded-lg shadow-lg flex flex-col items-center transform transition-all duration-300 ${
          isConfirmationOpen ? 'scale-100' : 'scale-95'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="confirmation-title"
          className="text-base sm:text-lg text-[#E84D43] font-bold mb-2 sm:mb-3"
        >
          {title}
        </h2>
        {message && (
          <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-5">{message}</p>
        )}
        <hr className="w-full my-3 sm:my-5" />
        <div className="flex flex-col sm:flex-row w-full justify-between gap-2 sm:gap-4">
          <button
            ref={cancelButtonRef}
            className="bg-[#FFF2EA] hover:bg-red-300 text-[#E84D43] px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg w-full min-h-[44px] text-sm sm:text-base"
            onClick={handleCloseConfirmation}
          >
            Отмена
          </button>
          <button
            className="bg-[#E3F3E9] hover:bg-green-300 text-[#11B066] px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg w-full min-h-[44px] text-sm sm:text-base"
            onClick={handleConfirm}
          >
            Подтвердить
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      {React.cloneElement(children, {
        onClick: (e) => {
          if (children.props.onClick) {
            children.props.onClick(e);
          }
          handleOpenConfirmation(e);
        },
      })}
      {modalContent && ReactDOM.createPortal(modalContent, document.body)}
    </>
  );
};

ConfirmationWrapper.propTypes = {
  title: PropTypes.string.isRequired,
  message: PropTypes.string,
  children: PropTypes.element.isRequired,
  onConfirm: PropTypes.func.isRequired,
};

export default ConfirmationWrapper;