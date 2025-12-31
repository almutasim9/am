import React, { useEffect } from 'react';

const Toast = ({ message, type, onClose }) => {
    useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
    const colors = { success: 'bg-emerald-600', error: 'bg-red-600', info: 'bg-blue-600' };
    return (
        <div className={`fixed top-4 start-4 z-50 px-6 py-3 rounded-lg text-white shadow-xl ${colors[type]} animate-pulse`}>
            {message}
        </div>
    );
};

export default Toast;
