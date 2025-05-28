import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { Checkbox, type CheckboxChangeEvent } from "primereact/checkbox";
import { Chips } from "primereact/chips";
import { classNames } from "primereact/utils";
import { Toast } from "primereact/toast";
import { useUpdateMedicalInstitution, useMedicalInstitution } from "./api";
import type { UpdateMedicalInstitutionDto } from "./types";
import { useRef } from "react";
import CountrySelect from "../../components/CountrySelect";

interface EditMedicalInstitutionDialogProps {
  visible: boolean;
  onHide: () => void;
  institutionId: string;
  onSuccess?: () => void;
}

const institutionTypes = [
  { label: "Hospital", value: "Hospital" },
  { label: "Blood Bank", value: "Blood Bank" },
  { label: "Clinic", value: "Clinic" },
  { label: "Donation Center", value: "Donation Center" },
  { label: "Research Center", value: "Research Center" },
  { label: "Other", value: "Other" },
];

const EditMedicalInstitutionDialog: React.FC<
  EditMedicalInstitutionDialogProps
> = ({ visible, onHide, institutionId, onSuccess }) => {
  const [institution, setInstitution] = useState<UpdateMedicalInstitutionDto>(
    {}
  );
  const [submitted, setSubmitted] = useState(false);
  const toast = useRef<Toast>(null);

  const { data: originalInstitution, isLoading } =
    useMedicalInstitution(institutionId);
  const updateMutation = useUpdateMedicalInstitution(institutionId);

  useEffect(() => {
    if (originalInstitution && visible) {
      setInstitution(originalInstitution);
    }
  }, [originalInstitution, visible]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setInstitution((prev) => ({ ...prev, [name]: value }));
  };

  const handleDropdownChange = (field: string, value: any) => {
    setInstitution((prev) => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (e: CheckboxChangeEvent) => {
    const { name, checked } = e.target;
    setInstitution((prev) => ({ ...prev, [name]: checked }));
  };

  const handleCoordinateChange = (index: number, value: string) => {
    if (!institution.coordinates) return;

    const coordinates: [number, number] = [
      institution.coordinates[0] ?? 0,
      institution.coordinates[1] ?? 0,
    ];
    coordinates[index] = parseFloat(value) || 0;
    setInstitution((prev) => ({ ...prev, coordinates }));
  };

  const handleSubmit = async () => {
    setSubmitted(true);

    // Check if required fields are filled
    if (
      !institution.name ||
      !institution.registrationNumber ||
      !institution.type ||
      !institution.phoneNumber ||
      !institution.address ||
      !institution.city ||
      !institution.state ||
      !institution.country
    ) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Please fill in all required fields",
        life: 3000,
      });
      return;
    }

    try {
      await updateMutation.mutateAsync(institution);
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Medical institution updated successfully",
        life: 3000,
      });
      onHide();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error updating medical institution:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Failed to update medical institution",
        life: 3000,
      });
    }
  };

  const dialogFooter = (
    <React.Fragment>
      <Button
        label="Cancel"
        icon="pi pi-times"
        className="p-button-text"
        onClick={onHide}
      />
      <Button
        label="Save"
        icon="pi pi-check"
        onClick={handleSubmit}
        loading={updateMutation.isPending}
      />
    </React.Fragment>
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Toast ref={toast} />
      <Dialog
        visible={visible}
        style={{ width: "80vw", maxWidth: "800px" }}
        header="Edit Medical Institution"
        modal
        className="p-fluid"
        footer={dialogFooter}
        onHide={onHide}
      >
        {institution && (
          <div className="grid p-fluid">
            <div className="col-12 md:col-6">
              <div className="field">
                <label htmlFor="name" className="font-bold">
                  Name*
                </label>
                <InputText
                  id="name"
                  name="name"
                  value={institution.name || ""}
                  onChange={handleInputChange}
                  required
                  className={classNames({
                    "p-invalid": submitted && !institution.name,
                  })}
                />
                {submitted && !institution.name && (
                  <small className="p-error">Name is required.</small>
                )}
              </div>
            </div>

            <div className="col-12 md:col-6">
              <div className="field">
                <label htmlFor="registrationNumber" className="font-bold">
                  Registration Number*
                </label>
                <InputText
                  id="registrationNumber"
                  name="registrationNumber"
                  value={institution.registrationNumber || ""}
                  onChange={handleInputChange}
                  required
                  className={classNames({
                    "p-invalid": submitted && !institution.registrationNumber,
                  })}
                />
                {submitted && !institution.registrationNumber && (
                  <small className="p-error">
                    Registration number is required.
                  </small>
                )}
              </div>
            </div>

            <div className="col-12 md:col-6">
              <div className="field">
                <label htmlFor="type" className="font-bold">
                  Type*
                </label>
                <Dropdown
                  id="type"
                  name="type"
                  value={institution.type || ""}
                  options={institutionTypes}
                  onChange={(e) => handleDropdownChange("type", e.value)}
                  placeholder="Select a type"
                  className={classNames({
                    "p-invalid": submitted && !institution.type,
                  })}
                />
                {submitted && !institution.type && (
                  <small className="p-error">Type is required.</small>
                )}
              </div>
            </div>

            <div className="col-12 md:col-6">
              <div className="field">
                <label htmlFor="phoneNumber" className="font-bold">
                  Phone Number*
                </label>
                <InputText
                  id="phoneNumber"
                  name="phoneNumber"
                  value={institution.phoneNumber || ""}
                  onChange={handleInputChange}
                  required
                  className={classNames({
                    "p-invalid": submitted && !institution.phoneNumber,
                  })}
                />
                {submitted && !institution.phoneNumber && (
                  <small className="p-error">Phone number is required.</small>
                )}
              </div>
            </div>

            <div className="col-12 md:col-6">
              <div className="field">
                <label htmlFor="email" className="font-bold">
                  Email
                </label>
                <InputText
                  id="email"
                  name="email"
                  value={institution.email || ""}
                  onChange={handleInputChange}
                  type="email"
                />
              </div>
            </div>

            <div className="col-12 md:col-6">
              <div className="field">
                <label htmlFor="website" className="font-bold">
                  Website
                </label>
                <InputText
                  id="website"
                  name="website"
                  value={institution.website || ""}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="col-12">
              <div className="field">
                <label htmlFor="address" className="font-bold">
                  Address*
                </label>
                <InputTextarea
                  id="address"
                  name="address"
                  value={institution.address || ""}
                  onChange={handleInputChange}
                  rows={2}
                  className={classNames({
                    "p-invalid": submitted && !institution.address,
                  })}
                />
                {submitted && !institution.address && (
                  <small className="p-error">Address is required.</small>
                )}
              </div>
            </div>

            <div className="col-12 md:col-4">
              <div className="field">
                <label htmlFor="city" className="font-bold">
                  City*
                </label>
                <InputText
                  id="city"
                  name="city"
                  value={institution.city || ""}
                  onChange={handleInputChange}
                  required
                  className={classNames({
                    "p-invalid": submitted && !institution.city,
                  })}
                />
                {submitted && !institution.city && (
                  <small className="p-error">City is required.</small>
                )}
              </div>
            </div>

            <div className="col-12 md:col-4">
              <div className="field">
                <label htmlFor="state" className="font-bold">
                  State/Province*
                </label>
                <InputText
                  id="state"
                  name="state"
                  value={institution.state || ""}
                  onChange={handleInputChange}
                  required
                  className={classNames({
                    "p-invalid": submitted && !institution.state,
                  })}
                />
                {submitted && !institution.state && (
                  <small className="p-error">State is required.</small>
                )}
              </div>
            </div>

            <div className="col-12 md:col-4">
              <div className="field">
                <label htmlFor="postalCode" className="font-bold">
                  Postal Code
                </label>
                <InputText
                  id="postalCode"
                  name="postalCode"
                  value={institution.postalCode || ""}
                  onChange={handleInputChange}
                />
              </div>
            </div>            <div className="col-12 md:col-6">
              <div className="field">
                <label htmlFor="country" className="font-bold">
                  Country*
                </label>
                <CountrySelect
                  id="country"
                  name="country"
                  value={institution.country || ""}
                  onChange={(value) => handleDropdownChange("country", value)}
                  placeholder="Select a country"
                  className={classNames({
                    "p-invalid": submitted && !institution.country,
                  })}
                  required={true}
                  submitted={submitted}
                />
                {submitted && !institution.country && (
                  <small className="p-error">Country is required.</small>
                )}
              </div>
            </div>

            <div className="col-12">
              <h3>Contact Person Information</h3>
            </div>

            <div className="col-12 md:col-6">
              <div className="field">
                <label htmlFor="contactPersonName" className="font-bold">
                  Contact Person Name
                </label>
                <InputText
                  id="contactPersonName"
                  name="contactPersonName"
                  value={institution.contactPersonName || ""}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="col-12 md:col-6">
              <div className="field">
                <label htmlFor="contactPersonRole" className="font-bold">
                  Contact Person Role
                </label>
                <InputText
                  id="contactPersonRole"
                  name="contactPersonRole"
                  value={institution.contactPersonRole || ""}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="col-12 md:col-6">
              <div className="field">
                <label htmlFor="contactPersonPhone" className="font-bold">
                  Contact Person Phone
                </label>
                <InputText
                  id="contactPersonPhone"
                  name="contactPersonPhone"
                  value={institution.contactPersonPhone || ""}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="col-12 md:col-6">
              <div className="field">
                <label htmlFor="contactPersonEmail" className="font-bold">
                  Contact Person Email
                </label>
                <InputText
                  id="contactPersonEmail"
                  name="contactPersonEmail"
                  value={institution.contactPersonEmail || ""}
                  onChange={handleInputChange}
                  type="email"
                />
              </div>
            </div>

            <div className="col-12">
              <h3>Location and Services</h3>
            </div>

            {institution.coordinates && (
              <>
                <div className="col-12 md:col-6">
                  <div className="field">
                    <label htmlFor="longitude" className="font-bold">
                      Longitude*
                    </label>
                    <InputText
                      id="longitude"
                      type="number"
                      value={institution.coordinates[0].toString()}
                      onChange={(e) =>
                        handleCoordinateChange(0, e.target.value)
                      }
                      className={classNames({
                        "p-invalid":
                          submitted && institution.coordinates[0] === 0,
                      })}
                    />
                    {submitted && institution.coordinates[0] === 0 && (
                      <small className="p-error">Longitude is required.</small>
                    )}
                  </div>
                </div>

                <div className="col-12 md:col-6">
                  <div className="field">
                    <label htmlFor="latitude" className="font-bold">
                      Latitude*
                    </label>
                    <InputText
                      id="latitude"
                      type="number"
                      value={institution.coordinates[1].toString()}
                      onChange={(e) =>
                        handleCoordinateChange(1, e.target.value)
                      }
                      className={classNames({
                        "p-invalid":
                          submitted && institution.coordinates[1] === 0,
                      })}
                    />
                    {submitted && institution.coordinates[1] === 0 && (
                      <small className="p-error">Latitude is required.</small>
                    )}
                  </div>
                </div>
              </>
            )}

            <div className="col-12 md:col-6">
              <div className="field">
                <label htmlFor="operatingHours" className="font-bold">
                  Operating Hours
                </label>
                <Chips
                  id="operatingHours"
                  value={institution.operatingHours || []}
                  onChange={(e) =>
                    handleDropdownChange("operatingHours", e.value)
                  }
                  placeholder="Add operating hours (e.g., 'Mon-Fri: 9AM-5PM')"
                />
              </div>
            </div>

            <div className="col-12 md:col-6">
              <div className="field">
                <label htmlFor="services" className="font-bold">
                  Services
                </label>
                <Chips
                  id="services"
                  value={institution.services || []}
                  onChange={(e) => handleDropdownChange("services", e.value)}
                  placeholder="Add services"
                />
              </div>
            </div>

            <div className="col-12">
              <div className="field-checkbox">
                <Checkbox
                  inputId="isActive"
                  name="isActive"
                  checked={institution.isActive as boolean}
                  onChange={handleCheckboxChange}
                />
                <label htmlFor="isActive" className="ml-2">
                  Active Institution
                </label>
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
};

export default EditMedicalInstitutionDialog;
