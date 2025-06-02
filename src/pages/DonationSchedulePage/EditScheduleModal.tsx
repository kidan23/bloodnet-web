import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputTextarea } from "primereact/inputtextarea";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { Message } from "primereact/message";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  type DonationSchedule,
  type UpdateDonationScheduleDto,
  ScheduleStatus,
} from "./types.ts";
import { DONATION_TYPES, PURPOSE_OPTIONS, TIME_SLOTS } from "./constants";
import { useAvailableTimeSlots } from "./hooks";

const editScheduleSchema = z.object({
  scheduledDate: z.date().min(new Date(), "Date must be in the future"),
  timeSlot: z.string().min(1, "Time slot is required"),
  donationType: z.string().min(1, "Donation type is required"),
  purpose: z.string().min(1, "Purpose is required"),
  notes: z.string().optional(),
});

type EditScheduleFormData = z.infer<typeof editScheduleSchema>;

interface EditScheduleModalProps {
  schedule: DonationSchedule | null;
  visible: boolean;
  onHide: () => void;
  onSave: (
    scheduleId: string,
    data: UpdateDonationScheduleDto
  ) => Promise<void>;
  loading?: boolean;
}

export const EditScheduleModal: React.FC<EditScheduleModalProps> = ({
  schedule,
  visible,
  onHide,
  onSave,
  loading = false,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EditScheduleFormData>({
    resolver: zodResolver(editScheduleSchema),
    defaultValues: {
      scheduledDate: undefined,
      timeSlot: "",
      donationType: "",
      purpose: "",
      notes: "",
    },
  });

  const watchedDate = watch("scheduledDate");

  // Get available time slots for the selected date
  const { data: availableSlots = [], isLoading: slotsLoading } =
    useAvailableTimeSlots(
      schedule?.bloodBank?._id || "",
      selectedDate ? selectedDate : undefined
    );

  // Update selected date when form date changes
  useEffect(() => {
    if (watchedDate) {
      setSelectedDate(watchedDate);
    }
  }, [watchedDate]);

  // Reset form when schedule changes
  useEffect(() => {
    if (schedule && visible) {
      const formData = {
        scheduledDate: new Date(schedule.scheduledDate),
        timeSlot: schedule.timeSlot,
        donationType: schedule.donationType,
        purpose: schedule.purpose,
        notes: schedule.notes || "",
      };
      reset(formData);
      setSelectedDate(new Date(schedule.scheduledDate));
      setSubmitError(null);
    }
  }, [schedule, visible, reset]);

  const onSubmit = async (data: EditScheduleFormData) => {
    if (!schedule) return;

    try {
      setSubmitError(null);

      const updateData: UpdateDonationScheduleDto = {
        scheduledDate: data.scheduledDate.toISOString(),
        timeSlot: data.timeSlot,
        donationType: data.donationType,
        purpose: data.purpose,
        notes: data.notes,
      };

      await onSave(schedule._id, updateData);
      onHide();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to update schedule"
      );
    }
  };

  const canEdit =
    schedule &&
    schedule.status !== ScheduleStatus.COMPLETED &&
    schedule.status !== ScheduleStatus.CANCELLED;

  if (!schedule) return null;

  const headerElement = (
    <div className="flex align-items-center gap-3">
      <i className="pi pi-pencil text-2xl"></i>
      <div>
        <h3 className="m-0">Edit Schedule</h3>
        <p className="m-0 text-sm text-gray-600">
          Modify donation schedule details
        </p>
      </div>
    </div>
  );

  const footerElement = (
    <div className="flex justify-content-end gap-2">
      <Button
        label="Cancel"
        icon="pi pi-times"
        className="p-button-text"
        onClick={onHide}
        disabled={isSubmitting}
      />
      <Button
        label="Save Changes"
        icon="pi pi-check"
        className="p-button-success"
        onClick={handleSubmit(onSubmit)}
        loading={isSubmitting || loading}
        disabled={!canEdit}
      />
    </div>
  );

  if (!canEdit) {
    return (
      <Dialog
        header={headerElement}
        visible={visible}
        onHide={onHide}
        style={{ width: "400px" }}
        modal
      >
        <Message
          severity="warn"
          text="This schedule cannot be edited because it has been completed or cancelled."
          className="w-full"
        />
        <div className="flex justify-content-end mt-3">
          <Button
            label="Close"
            icon="pi pi-times"
            className="p-button-text"
            onClick={onHide}
          />
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog
      header={headerElement}
      footer={footerElement}
      visible={visible}
      onHide={onHide}
      style={{ width: "600px" }}
      className="p-fluid"
      modal
    >
      <form onSubmit={handleSubmit(onSubmit)} className="grid">
        {submitError && (
          <div className="col-12">
            <Message severity="error" text={submitError} className="w-full" />
          </div>
        )}

        {/* Scheduled Date */}
        <div className="col-6">
          <div className="field">
            <label htmlFor="scheduledDate" className="font-medium">
              Scheduled Date <span className="text-red-500">*</span>
            </label>
            <Controller
              name="scheduledDate"
              control={control}
              render={({ field }) => (
                <Calendar
                  id="scheduledDate"
                  value={field.value}
                  onChange={field.onChange}
                  dateFormat="mm/dd/yy"
                  showIcon
                  minDate={new Date()}
                  className={errors.scheduledDate ? "p-invalid" : ""}
                  placeholder="Select date"
                />
              )}
            />
            {errors.scheduledDate && (
              <small className="p-error">{errors.scheduledDate.message}</small>
            )}
          </div>
        </div>

        {/* Time Slot */}
        <div className="col-6">
          <div className="field">
            <label htmlFor="timeSlot" className="font-medium">
              Time Slot <span className="text-red-500">*</span>
            </label>
            <Controller
              name="timeSlot"
              control={control}
              render={({ field }) => (
                <Dropdown
                  id="timeSlot"
                  value={field.value}
                  onChange={field.onChange}
                  options={selectedDate ? availableSlots : TIME_SLOTS}
                  optionLabel="label"
                  optionValue="value"
                  placeholder={
                    slotsLoading ? "Loading slots..." : "Select time slot"
                  }
                  className={errors.timeSlot ? "p-invalid" : ""}
                  disabled={slotsLoading || !selectedDate}
                  emptyMessage="No available time slots"
                />
              )}
            />
            {errors.timeSlot && (
              <small className="p-error">{errors.timeSlot.message}</small>
            )}
            {selectedDate && availableSlots.length === 0 && !slotsLoading && (
              <small className="p-error">
                No available time slots for this date
              </small>
            )}
          </div>
        </div>

        {/* Donation Type */}
        <div className="col-6">
          <div className="field">
            <label htmlFor="donationType" className="font-medium">
              Donation Type <span className="text-red-500">*</span>
            </label>
            <Controller
              name="donationType"
              control={control}
              render={({ field }) => (
                <Dropdown
                  id="donationType"
                  value={field.value}
                  onChange={field.onChange}
                  options={DONATION_TYPES}
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select donation type"
                  className={errors.donationType ? "p-invalid" : ""}
                />
              )}
            />
            {errors.donationType && (
              <small className="p-error">{errors.donationType.message}</small>
            )}
          </div>
        </div>

        {/* Purpose */}
        <div className="col-6">
          <div className="field">
            <label htmlFor="purpose" className="font-medium">
              Purpose <span className="text-red-500">*</span>
            </label>
            <Controller
              name="purpose"
              control={control}
              render={({ field }) => (
                <Dropdown
                  id="purpose"
                  value={field.value}
                  onChange={field.onChange}
                  options={PURPOSE_OPTIONS}
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select purpose"
                  className={errors.purpose ? "p-invalid" : ""}
                />
              )}
            />
            {errors.purpose && (
              <small className="p-error">{errors.purpose.message}</small>
            )}
          </div>
        </div>

        {/* Notes */}
        <div className="col-12">
          <div className="field">
            <label htmlFor="notes" className="font-medium">
              Notes
            </label>
            <Controller
              name="notes"
              control={control}
              render={({ field }) => (
                <InputTextarea
                  id="notes"
                  value={field.value || ""}
                  onChange={field.onChange}
                  rows={3}
                  placeholder="Add any additional notes or special requirements..."
                  className={errors.notes ? "p-invalid" : ""}
                />
              )}
            />
            {errors.notes && (
              <small className="p-error">{errors.notes.message}</small>
            )}
          </div>
        </div>

        {/* Current Schedule Info */}
        <div className="col-12">
          <div className="p-3 bg-gray-50 border-round">
            <h5 className="mt-0 mb-2">Current Schedule</h5>
            <div className="grid">
              <div className="col-4">
                <strong>Donor:</strong> {schedule.donor?.firstName}
              </div>
              <div className="col-4">
                <strong>Blood Bank:</strong> {schedule.bloodBank?.name}
              </div>
              <div className="col-4">
                <strong>Status:</strong> {schedule.status}
              </div>
            </div>
          </div>
        </div>
      </form>
    </Dialog>
  );
};
