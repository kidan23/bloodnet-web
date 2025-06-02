// Search and filter component for donation schedules

import React, { useState } from "react";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { MultiSelect } from "primereact/multiselect";
import { Checkbox } from "primereact/checkbox";
import { Accordion, AccordionTab } from "primereact/accordion";
import type { DonationScheduleQueryParams, ScheduleFilters } from "./types";
import { ScheduleStatus, ReminderStatus } from "./types";
import {
  STATUS_OPTIONS,
  TIME_SLOTS,
  DONATION_TYPES,
  PURPOSE_OPTIONS,
  SORT_OPTIONS,
} from "./constants";

interface ScheduleSearchProps {
  onSearch: (params: DonationScheduleQueryParams) => void;
  onClear: () => void;
  initialFilters?: Partial<DonationScheduleQueryParams>;
}

const ScheduleSearch: React.FC<ScheduleSearchProps> = ({
  onSearch,
  onClear,
  initialFilters = {},
}) => {
  const [filters, setFilters] = useState<DonationScheduleQueryParams>({
    page: 1,
    limit: 10,
    sort: "-scheduledDate",
    ...initialFilters,
  });

  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [expanded, setExpanded] = useState(false);

  const handleInputChange = (field: keyof DonationScheduleQueryParams, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleDateRangeChange = (dates: [Date | null, Date | null]) => {
    setDateRange(dates);
    const [startDate, endDate] = dates;
    setFilters(prev => ({
      ...prev,
      startDate: startDate?.toISOString().split('T')[0] || undefined,
      endDate: endDate?.toISOString().split('T')[0] || undefined,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  const handleClear = () => {
    const clearedFilters = {
      page: 1,
      limit: 10,
      sort: "-scheduledDate",
    };
    setFilters(clearedFilters);
    setDateRange([null, null]);
    onClear();
  };

  const statusOptions = STATUS_OPTIONS.map(status => ({
    label: status.label,
    value: status.value,
  }));

  const timeSlotOptions = TIME_SLOTS.map(slot => ({
    label: slot.label,
    value: slot.value,
  }));

  const reminderStatusOptions = [
    { label: "Not Sent", value: ReminderStatus.NOT_SENT },
    { label: "Sent", value: ReminderStatus.SENT },
    { label: "Failed", value: ReminderStatus.FAILED },
  ];

  return (
    <Card className="mb-4">
      <form onSubmit={handleSubmit}>
        <div className="grid">
          {/* Basic Search */}
          <div className="col-12 md:col-4">
            <label className="block mb-2 font-semibold">Search</label>
            <InputText
              value={filters.search || ""}
              onChange={(e) => handleInputChange("search", e.target.value)}
              placeholder="Search by donor name, blood bank..."
              className="w-full"
            />
          </div>

          <div className="col-12 md:col-4">
            <label className="block mb-2 font-semibold">Status</label>
            <Dropdown
              value={filters.status || ""}
              options={statusOptions}
              onChange={(e) => handleInputChange("status", e.value)}
              placeholder="All Statuses"
              className="w-full"
              showClear
            />
          </div>

          <div className="col-12 md:col-4">
            <label className="block mb-2 font-semibold">Sort By</label>
            <Dropdown
              value={filters.sort || "-scheduledDate"}
              options={SORT_OPTIONS}
              onChange={(e) => handleInputChange("sort", e.value)}
              className="w-full"
            />
          </div>

          {/* Advanced Filters */}
          <div className="col-12">
            <Accordion 
              activeIndex={expanded ? 0 : null}
              onTabChange={(e) => setExpanded(e.index === 0)}
            >
              <AccordionTab 
                header="Advanced Filters"
              >
                <div className="grid">
                  {/* Date Range */}
                  <div className="col-12 md:col-6">
                    <label className="block mb-2 font-semibold">Date Range</label>
                    <Calendar
                      value={dateRange}
                      onChange={(e) => handleDateRangeChange(e.value as [Date | null, Date | null])}
                      selectionMode="range"
                      placeholder="Select date range"
                      className="w-full"
                      showIcon
                      dateFormat="mm/dd/yy"
                    />
                  </div>

                  {/* Time Slots */}
                  <div className="col-12 md:col-6">
                    <label className="block mb-2 font-semibold">Time Slots</label>
                    <MultiSelect
                      value={filters.timeSlots || []}
                      options={timeSlotOptions}
                      onChange={(e) => handleInputChange("timeSlots", e.value)}
                      placeholder="Select time slots"
                      className="w-full"
                      maxSelectedLabels={2}
                    />
                  </div>

                  {/* Donation Type */}
                  <div className="col-12 md:col-6">
                    <label className="block mb-2 font-semibold">Donation Type</label>
                    <MultiSelect
                      value={filters.donationTypes || []}
                      options={DONATION_TYPES}
                      onChange={(e) => handleInputChange("donationTypes", e.value)}
                      placeholder="Select donation types"
                      className="w-full"
                      maxSelectedLabels={2}
                    />
                  </div>

                  {/* Purpose */}
                  <div className="col-12 md:col-6">
                    <label className="block mb-2 font-semibold">Purpose</label>
                    <MultiSelect
                      value={filters.purposes || []}
                      options={PURPOSE_OPTIONS}
                      onChange={(e) => handleInputChange("purposes", e.value)}
                      placeholder="Select purposes"
                      className="w-full"
                      maxSelectedLabels={2}
                    />
                  </div>

                  {/* Reminder Status */}
                  <div className="col-12 md:col-6">
                    <label className="block mb-2 font-semibold">Reminder Status</label>
                    <MultiSelect
                      value={filters.reminderStatuses || []}
                      options={reminderStatusOptions}
                      onChange={(e) => handleInputChange("reminderStatuses", e.value)}
                      placeholder="Select reminder statuses"
                      className="w-full"
                      maxSelectedLabels={2}
                    />
                  </div>

                  {/* Blood Bank ID (for internal use) */}
                  {filters.bloodBankId && (
                    <div className="col-12 md:col-6">
                      <label className="block mb-2 font-semibold">Blood Bank ID</label>
                      <InputText
                        value={filters.bloodBankId || ""}
                        onChange={(e) => handleInputChange("bloodBankId", e.target.value)}
                        placeholder="Blood Bank ID"
                        className="w-full"
                      />
                    </div>
                  )}

                  {/* Donor ID (for internal use) */}
                  {filters.donorId && (
                    <div className="col-12 md:col-6">
                      <label className="block mb-2 font-semibold">Donor ID</label>
                      <InputText
                        value={filters.donorId || ""}
                        onChange={(e) => handleInputChange("donorId", e.target.value)}
                        placeholder="Donor ID"
                        className="w-full"
                      />
                    </div>
                  )}

                  {/* Boolean filters */}
                  <div className="col-12">
                    <div className="grid">
                      <div className="col-12 md:col-4">
                        <div className="flex align-items-center gap-2">
                          <Checkbox
                            checked={filters.sendReminders === true}
                            onChange={(e) => 
                              handleInputChange("sendReminders", e.checked || undefined)
                            }
                          />
                          <label>Reminders Enabled</label>
                        </div>
                      </div>

                      <div className="col-12 md:col-4">
                        <div className="flex align-items-center gap-2">
                          <Checkbox
                            checked={filters.isRecurring === true}
                            onChange={(e) => 
                              handleInputChange("isRecurring", e.checked || undefined)
                            }
                          />
                          <label>Recurring Only</label>
                        </div>
                      </div>

                      <div className="col-12 md:col-4">
                        <div className="flex align-items-center gap-2">
                          <Checkbox
                            checked={filters.hasSpecialInstructions === true}
                            onChange={(e) => 
                              handleInputChange("hasSpecialInstructions", e.checked || undefined)
                            }
                          />
                          <label>Has Special Instructions</label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionTab>
            </Accordion>
          </div>

          {/* Action Buttons */}
          <div className="col-12">
            <div className="flex gap-2 justify-content-end">
              <Button
                type="button"
                label="Clear"
                icon="pi pi-times"
                className="p-button-outlined"
                onClick={handleClear}
              />
              <Button
                type="submit"
                label="Search"
                icon="pi pi-search"
              />
            </div>
          </div>
        </div>
      </form>
    </Card>
  );
};

export default ScheduleSearch;
