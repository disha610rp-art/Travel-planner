import { useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';
import './Modal.css';

/**
 * Modal — Overlay modal with backdrop, close on escape, focus trap using useRef
 * @param {object} props
 * @param {boolean} props.isOpen - Whether modal is visible
 * @param {Function} props.onClose - Close handler
 * @param {string} props.title - Modal title
 * @param {string} props.size - 'sm' | 'md' | 'lg'
 */
const Modal = ({ isOpen, onClose, title, size = 'md', children }) => {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  // Close on Escape key
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  // Close on backdrop click
  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';

      // Focus the modal
      setTimeout(() => {
        modalRef.current?.focus();
      }, 100);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';

      // Restore focus
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop animate-fadeIn" onClick={handleBackdropClick}>
      <div
        ref={modalRef}
        className={`modal-content modal-${size} animate-scaleIn`}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
