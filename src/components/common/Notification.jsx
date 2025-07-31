import React from 'react';
import { useNotifications } from '../../contexts/NotificationContext';

const Notification = () => {
  const { notifications } = useNotifications();

  return (
    <div className="fixed top-5 right-5 z-50">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 mb-4 text-white rounded-lg shadow-lg animate-bounce ${
            notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {notification.message}
        </div>
      ))}
    </div>
  );
};

export default Notification;
