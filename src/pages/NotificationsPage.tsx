import React, { useEffect, useState } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { notificationsService } from "../services/notificationsService";

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchNotifications = async (pageNum = page) => {
    setLoading(true);
    try {
      const data = await notificationsService.fetchMyNotifications(pageNum);
      setNotifications(data.results || []);
      setTotalPages(data.totalPages || 1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(page);
    // eslint-disable-next-line
  }, [page]);

  const handleMarkAsRead = async (id: string) => {
    await notificationsService.markAsRead(id);
    fetchNotifications();
  };

  const handleMarkAllAsRead = async () => {
    await notificationsService.markAllAsRead();
    fetchNotifications();
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <Card title="Notifications">
        <div className="flex justify-content-between align-items-center mb-3">
          <h3 className="m-0">Your Notifications</h3>
          <Button
            label="Mark all as read"
            onClick={handleMarkAllAsRead}
            size="small"
          />
        </div>
        {loading ? (
          <p>Loading...</p>
        ) : notifications.length === 0 ? (
          <p>No notifications found.</p>
        ) : (
          <>
            <ul className="list-none p-0">
              {notifications.map((n) => (
                <li
                  key={n._id || n.id}
                  className={`mb-3 p-3 border-round shadow-1 ${
                    n.status === "READ" ? "bg-gray-100" : "bg-white"
                  }`}
                >
                  <div className="flex justify-content-between align-items-center">
                    <div>
                      <strong>{n.title}</strong>
                      <div className="text-sm text-600">{n.message}</div>
                      <div className="text-xs text-500 mt-1">
                        {n.createdAt
                          ? new Date(n.createdAt).toLocaleString()
                          : ""}
                      </div>
                    </div>
                    {n.status !== "READ" && (
                      <Button
                        label="Mark as read"
                        icon="pi pi-check"
                        size="small"
                        onClick={() => handleMarkAsRead(n._id || n.id)}
                        className="p-button-text p-button-success"
                      />
                    )}
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex justify-content-center align-items-center mt-4 gap-2">
              <Button
                label="Previous"
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                size="small"
              />
              <span>
                Page {page} of {totalPages}
              </span>
              <Button
                label="Next"
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                size="small"
              />
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default NotificationsPage;
