import React from 'react';
import { confirmDialog } from 'primereact/confirmdialog';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';

interface ConfirmationDialogOptions {
  message: string;
  header: string;
  icon: string;
  acceptClassName?: string;
  rejectClassName?: string;
  onAccept: () => void;
  onReject?: () => void;
}

export const useConfirmationDialog = (toast: React.RefObject<Toast>) => {
  const showConfirmDialog = (options: ConfirmationDialogOptions) => {
    confirmDialog({
      message: options.message,
      header: options.header,
      icon: options.icon,
      acceptClassName: options.acceptClassName || 'p-button-danger',
      rejectClassName: options.rejectClassName || 'p-button-text',
      accept: options.onAccept,
      reject: options.onReject
    });
  };

  const confirmSchedule = (onConfirm: () => Promise<void>) => {
    showConfirmDialog({
      message: 'Are you sure you want to confirm this donation schedule? This action will notify the donor.',
      header: 'Confirm Schedule',
      icon: 'pi pi-check-circle',
      acceptClassName: 'p-button-success',
      onAccept: async () => {
        try {
          await onConfirm();
          toast.current?.show({
            severity: 'success',
            summary: 'Schedule Confirmed',
            detail: 'The donation schedule has been confirmed successfully.',
            life: 3000
          });
        } catch (error) {
          toast.current?.show({
            severity: 'error',
            summary: 'Confirmation Failed',
            detail: error instanceof Error ? error.message : 'Failed to confirm schedule',
            life: 5000
          });
        }
      }
    });
  };

  const cancelSchedule = (onCancel: () => Promise<void>) => {
    showConfirmDialog({
      message: 'Are you sure you want to cancel this donation schedule? This action cannot be undone.',
      header: 'Cancel Schedule',
      icon: 'pi pi-times-circle',
      acceptClassName: 'p-button-danger',
      onAccept: async () => {
        try {
          await onCancel();
          toast.current?.show({
            severity: 'info',
            summary: 'Schedule Cancelled',
            detail: 'The donation schedule has been cancelled successfully.',
            life: 3000
          });
        } catch (error) {
          toast.current?.show({
            severity: 'error',
            summary: 'Cancellation Failed',
            detail: error instanceof Error ? error.message : 'Failed to cancel schedule',
            life: 5000
          });
        }
      }
    });
  };

  const completeSchedule = (onComplete: () => Promise<void>) => {
    showConfirmDialog({
      message: 'Are you sure you want to mark this donation as completed? This action cannot be undone.',
      header: 'Complete Donation',
      icon: 'pi pi-check',
      acceptClassName: 'p-button-success',
      onAccept: async () => {
        try {
          await onComplete();
          toast.current?.show({
            severity: 'success',
            summary: 'Donation Completed',
            detail: 'The donation has been marked as completed successfully.',
            life: 3000
          });
        } catch (error) {
          toast.current?.show({
            severity: 'error',
            summary: 'Completion Failed',
            detail: error instanceof Error ? error.message : 'Failed to complete donation',
            life: 5000
          });
        }
      }
    });
  };

  const deleteSchedule = (onDelete: () => Promise<void>) => {
    showConfirmDialog({
      message: 'Are you sure you want to permanently delete this donation schedule? This action cannot be undone.',
      header: 'Delete Schedule',
      icon: 'pi pi-trash',
      acceptClassName: 'p-button-danger',
      onAccept: async () => {
        try {
          await onDelete();
          toast.current?.show({
            severity: 'info',
            summary: 'Schedule Deleted',
            detail: 'The donation schedule has been deleted successfully.',
            life: 3000
          });
        } catch (error) {
          toast.current?.show({
            severity: 'error',
            summary: 'Deletion Failed',
            detail: error instanceof Error ? error.message : 'Failed to delete schedule',
            life: 5000
          });
        }
      }
    });
  };

  return {
    confirmSchedule,
    cancelSchedule,
    completeSchedule,
    deleteSchedule,
    showConfirmDialog
  };
};
