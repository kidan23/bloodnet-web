import api from "../state/api";

// Notification service for handling external notifications

export const notificationsService = {
  async notifyBloodRequestToDonors(
    bloodRequestId: string,
    bloodType: string,
    location: string,
    priority: string,
    donorIds: string[]
  ) {
    console.log("Notifying donors about blood request", {
      bloodRequestId,
      bloodType,
      location,
      priority,
      donorIds,
    });
    // Add actual implementation here
  },

  async notifyBloodRequestToBloodBanks(
    bloodRequestId: string,
    bloodType: string,
    location: string,
    priority: string,
    bloodBankIds: string[]
  ) {
    console.log("Notifying blood banks about blood request", {
      bloodRequestId,
      bloodType,
      location,
      priority,
      bloodBankIds,
    });
    // Add actual implementation here
  },

  async notifyDonationResultReady(
    donorId: string,
    donationId: string,
    resultDate: Date,
    bloodBankName: string
  ) {
    console.log("Notifying donor about donation result", {
      donorId,
      donationId,
      resultDate,
      bloodBankName,
    });
    // Add actual implementation here
  },

  async notifyAppointmentReminder(
    donorId: string,
    appointmentId: string,
    appointmentDate: Date,
    bloodBankName: string,
    appointmentTime: string
  ) {
    console.log("Notifying donor about appointment reminder", {
      donorId,
      appointmentId,
      appointmentDate,
      bloodBankName,
      appointmentTime,
    });
    // Add actual implementation here
  },

  async fetchMyNotifications(page?: number) {
    const params = page ? { params: { page } } : undefined;
    const { data } = await api.get("/notifications/my-notifications", params);
    return data;
  },

  async fetchUnreadCount() {
    const { data } = await api.get("/notifications/unread-count");
    console.log("Unread notifications count:", data);

    return data.data.unreadCount || 0;
  },

  async markAsRead(notificationId: string) {
    await api.patch(`/notifications/${notificationId}/read`);
  },

  async markAllAsRead() {
    await api.patch("/notifications/mark-all-read");
  },
};
