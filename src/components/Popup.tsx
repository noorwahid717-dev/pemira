import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import '../styles/Popup.css'

export interface PopupOptions {
    title?: string
    message: string
    type?: 'info' | 'warning' | 'error' | 'success'
    confirmText?: string
    cancelText?: string
    showCancel?: boolean
    requiresInput?: boolean
    inputPlaceholder?: string
    onConfirm?: () => void
    onCancel?: () => void
}

interface PopupContextType {
    showPopup: (options: PopupOptions) => Promise<boolean | string | null>
    hidePopup: () => void
}

const PopupContext = createContext<PopupContextType | undefined>(undefined)

export const usePopup = () => {
    const context = useContext(PopupContext)
    if (!context) {
        throw new Error('usePopup must be used within a PopupProvider')
    }
    return context
}

interface PopupProviderProps {
    children: ReactNode
}

export const PopupProvider = ({ children }: PopupProviderProps) => {
    const [popup, setPopup] = useState<PopupOptions | null>(null)
    const [resolvePromise, setResolvePromise] = useState<((value: boolean | string | null) => void) | null>(null)
    const [inputValue, setInputValue] = useState<string>('')

    const showPopup = (options: PopupOptions): Promise<boolean | string | null> => {
        return new Promise((resolve) => {
            setPopup(options)
            setInputValue('')
            setResolvePromise(() => resolve)
        })
    }

    const hidePopup = () => {
        setPopup(null)
        setInputValue('')
        if (resolvePromise) {
            resolvePromise(null)
            setResolvePromise(null)
        }
    }

    const handleConfirm = () => {
        if (popup?.onConfirm) {
            popup.onConfirm()
        }
        setPopup(null)
        if (resolvePromise) {
            resolvePromise(popup?.requiresInput ? inputValue : true)
            setResolvePromise(null)
        }
        setInputValue('')
    }

    const handleCancel = () => {
        if (popup?.onCancel) {
            popup.onCancel()
        }
        setPopup(null)
        if (resolvePromise) {
            resolvePromise(null)
            setResolvePromise(null)
        }
        setInputValue('')
    }

    return (
        <PopupContext.Provider value={{ showPopup, hidePopup }}>
            {children}
            {popup && (
                <PopupModal
                    popup={popup}
                    inputValue={inputValue}
                    setInputValue={setInputValue}
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                    onClose={hidePopup}
                />
            )}
        </PopupContext.Provider>
    )
}

interface PopupModalProps {
    popup: PopupOptions
    inputValue: string
    setInputValue: (value: string) => void
    onConfirm: () => void
    onCancel: () => void
    onClose: () => void
}

const PopupModal = ({ popup, inputValue, setInputValue, onConfirm, onCancel, onClose }: PopupModalProps) => {
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose()
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose()
        } else if (e.key === 'Enter' && !popup.requiresInput) {
            onConfirm()
        }
    }

    return (
        <div className="popup-overlay" onClick={handleBackdropClick} onKeyDown={handleKeyDown} tabIndex={-1}>
            <div className="popup-modal">
                <div className="popup-header">
                    {popup.title && <h3 className="popup-title">{popup.title}</h3>}
                    <button className="popup-close" onClick={onClose} aria-label="Close">
                        ×
                    </button>
                </div>
                <div className="popup-body">
                    <div className={`popup-icon popup-icon-${popup.type || 'info'}`}>
                        {getIcon(popup.type || 'info')}
                    </div>
                    <p className="popup-message">{popup.message}</p>
                    {popup.requiresInput && (
                        <input
                            type="text"
                            className="popup-input"
                            placeholder={popup.inputPlaceholder || 'Masukkan teks...'}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            autoFocus
                            style={{
                                width: '100%',
                                padding: '8px 12px',
                                marginTop: '12px',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '14px'
                            }}
                        />
                    )}
                </div>
                <div className="popup-footer">
                    {popup.showCancel !== false && (
                        <button className="popup-btn popup-btn-secondary" onClick={onCancel}>
                            {popup.cancelText || 'Batal'}
                        </button>
                    )}
                    <button className="popup-btn popup-btn-primary" onClick={onConfirm} autoFocus={!popup.requiresInput}>
                        {popup.confirmText || 'OK'}
                    </button>
                </div>
            </div>
        </div>
    )
}

const getIcon = (type: string) => {
    switch (type) {
        case 'success':
            return '✓'
        case 'error':
            return '✕'
        case 'warning':
            return '⚠'
        case 'info':
        default:
            return 'ℹ'
    }
}