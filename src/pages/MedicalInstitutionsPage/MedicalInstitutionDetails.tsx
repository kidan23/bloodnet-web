import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Chip } from "primereact/chip";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Toast } from "primereact/toast";
import { Divider } from "primereact/divider";
import { TabView, TabPanel } from "primereact/tabview";
import { useMedicalInstitution, useDeleteMedicalInstitution, useAssignUserToMedicalInstitution } from "./api";
import EditMedicalInstitutionDialog from "./EditMedicalInstitutionDialog";
import { DisplayMap } from "../../components/map";
import { useRef } from "react";
import { extractErrorForToast } from "../../utils/errorHandling";
import { useAuth } from "../../state/authContext";
import { UserSearchDialog } from "../BloodBanksPage/UserSearchDialog";
import { UserRole } from "../../state/auth";

const MedicalInstitutionDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useRef<Toast>(null);
  const [editDialogVisible, setEditDialogVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);  const [userSearchDialogVisible, setUserSearchDialogVisible] = useState(false);
  const { user: currentUser } = useAuth();
  
  const {
    data: institution,
    isLoading,
    isError,
  } = useMedicalInstitution(id || "");
  const deleteMutation = useDeleteMedicalInstitution();
  const assignUserMutation = useAssignUserToMedicalInstitution();
  const handleEdit = () => {
    setEditDialogVisible(true);
  };
  const handleEditSuccess = () => {
    // This will trigger a refetch of the institution data
    toast.current?.show({
      severity: "success",
      summary: "Success",
      detail: "Medical institution updated successfully",
      life: 3000,
    });
  };
  const handleAssignUser = async (userId: string) => {
    if (!id) return;
    
    try {
      await assignUserMutation.mutateAsync({ institutionId: id, userId });
      toast.current?.show({
        severity: "success",
        summary: "Success", 
        detail: "Manager assigned successfully",
        life: 3000,
      });
      setUserSearchDialogVisible(false);
    } catch (error) {
      console.error("Error assigning manager:", error);
      const { summary, detail } = extractErrorForToast(error);
      toast.current?.show({
        severity: "error",
        summary,
        detail,
        life: 5000,
      });
    }
  };

  const handleUserSelect = (user: any) => {
    handleAssignUser(user._id);
  };

  const handleOpenUserSearch = () => {
    setUserSearchDialogVisible(true);
  };

  const isAdmin = currentUser?.role === UserRole.ADMIN;

  const handleDelete = () => {
    confirmDialog({
      message: "Are you sure you want to delete this medical institution?",
      header: "Delete Confirmation",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      accept: async () => {
        try {
          await deleteMutation.mutateAsync(id || "");
          toast.current?.show({
            severity: "success",
            summary: "Success",
            detail: "Medical institution deleted successfully",
            life: 3000,
          });
          navigate("/medical-institutions");
        } catch (error) {
          console.error("Error deleting medical institution:", error);
          const { summary, detail } = extractErrorForToast(error);
          toast.current?.show({
            severity: "error",
            summary,
            detail,
            life: 5000,
          });
        }
      },
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError || !institution) {
    return <div>Error loading medical institution details</div>;
  }
  const header = (
    <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center gap-3 p-3">
      <div className="flex-1">
        <div className="flex align-items-center gap-3 mb-2">
          <h2 className="m-0 text-2xl">{institution.name}</h2>
          <Chip
            label={institution.isActive ? "Active" : "Inactive"}
            className={`${
              institution.isActive ? "bg-green-500" : "bg-red-500"
            } text-white`}
          />
        </div>
        <div className="flex flex-wrap gap-2 align-items-center text-600">
          <i className="pi pi-building text-lg"></i>
          <span className="font-medium">{institution.type}</span>
          <span className="mx-2">•</span>
          <i className="pi pi-id-card text-lg"></i>
          <span>Reg: {institution.registrationNumber}</span>
        </div>
      </div>
      <div className="flex gap-2 flex-wrap">
        <Button
          icon="pi pi-arrow-left"
          label="Back"
          className="p-button-outlined"
          onClick={() => navigate("/medical-institutions")}
        />
        <Button icon="pi pi-pencil" label="Edit" onClick={handleEdit} />
        <Button
          icon="pi pi-trash"
          label="Delete"
          className="p-button-danger"
          onClick={handleDelete}
        />
      </div>
    </div>
  );
  return (
    <div className="p-4">
      <Toast ref={toast} />
      <ConfirmDialog />
      <Card header={header} className="mb-4">
        <TabView
          key="medical-institution-tabs"
          activeIndex={activeIndex}
          onTabChange={(e) => {
            setActiveIndex(e.index);
          }}
        >
          <TabPanel header="General Information">
            <div className="grid">
              <div className="col-12 md:col-6">
                <div className="p-3 border-round-lg bg-blue-50 mb-4">
                  <h3 className="text-primary-600 mb-3 flex align-items-center">
                    <i className="pi pi-phone mr-2"></i>
                    Contact Information
                  </h3>
                  <div className="field mb-3">
                    <label className="font-bold block mb-2 text-700">
                      Registration Number
                    </label>
                    <div className="p-2 bg-white border-round text-900">
                      {institution.registrationNumber}
                    </div>
                  </div>
                  <div className="field mb-3">
                    <label className="font-bold block mb-2 text-700">
                      Phone Number
                    </label>
                    <div className="p-2 bg-white border-round text-900">
                      <a
                        href={`tel:${institution.phoneNumber}`}
                        className="text-primary no-underline"
                      >
                        <i className="pi pi-phone mr-2"></i>
                        {institution.phoneNumber}
                      </a>
                    </div>
                  </div>
                  {institution.email && (
                    <div className="field mb-3">
                      <label className="font-bold block mb-2 text-700">
                        Email
                      </label>
                      <div className="p-2 bg-white border-round text-900">
                        <a
                          href={`mailto:${institution.email}`}
                          className="text-primary no-underline"
                        >
                          <i className="pi pi-envelope mr-2"></i>
                          {institution.email}
                        </a>
                      </div>
                    </div>
                  )}
                  {institution.website && (
                    <div className="field">
                      <label className="font-bold block mb-2 text-700">
                        Website
                      </label>
                      <div className="p-2 bg-white border-round text-900">
                        <a
                          href={
                            institution.website.startsWith("http")
                              ? institution.website
                              : `https://${institution.website}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary no-underline"
                        >
                          <i className="pi pi-external-link mr-2"></i>
                          {institution.website}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="col-12 md:col-6">
                <div className="p-3 border-round-lg bg-green-50 mb-4">
                  <h3 className="text-green-600 mb-3 flex align-items-center">
                    <i className="pi pi-map-marker mr-2"></i>
                    Address Information
                  </h3>
                  <div className="field mb-3">
                    <label className="font-bold block mb-2 text-700">
                      Street Address
                    </label>
                    <div className="p-2 bg-white border-round text-900">
                      {institution.address}
                    </div>
                  </div>
                  <div className="field mb-3">
                    <label className="font-bold block mb-2 text-700">
                      City & State
                    </label>
                    <div className="p-2 bg-white border-round text-900">
                      {institution.city}, {institution.state}
                      {institution.postalCode && ` ${institution.postalCode}`}
                    </div>
                  </div>
                  <div className="field">
                    <label className="font-bold block mb-2 text-700">
                      Country
                    </label>
                    <div className="p-2 bg-white border-round text-900">
                      {institution.country}
                    </div>
                  </div>                </div>
              </div>
              
              {isAdmin && (
                <div className="col-12 md:col-6">
                  <div className="p-3 border-round-lg bg-orange-50">
                    <h3 className="text-orange-600 mb-3 flex align-items-center">
                      <i className="pi pi-user-edit mr-2"></i>
                      Manager Assignment
                    </h3>
                    {institution.user && typeof institution.user === 'object' ? (
                      <div className="field mb-3">
                        <label className="font-bold block mb-2 text-700">
                          Current Manager
                        </label>
                        <div className="p-3 bg-white border-round flex align-items-center justify-content-between">
                          <div>
                            <div className="text-900 font-medium">{institution.user.email}</div>                            <div className="text-600 text-sm">
                              Role: <Chip label={institution.user.role} className="p-1" />
                            </div>
                          </div>
                        </div>
                        <Button
                          label="Change Manager"
                          icon="pi pi-user-edit"
                          className="p-button-outlined mt-2"
                          onClick={handleOpenUserSearch}
                          loading={assignUserMutation.isPending}
                        />
                      </div>
                    ) : (
                      <div className="field">
                        <label className="font-bold block mb-2 text-700">
                          No Manager Assigned
                        </label>
                        <div className="p-3 bg-white border-round text-center mb-3">
                          <i className="pi pi-user-minus text-2xl text-gray-400 mb-2"></i>
                          <p className="text-gray-500 m-0">This medical institution has no assigned manager</p>
                        </div>
                        <Button
                          label="Assign Manager"
                          icon="pi pi-user-plus"
                          onClick={handleOpenUserSearch}
                          loading={assignUserMutation.isPending}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <Divider />
            <div className="grid">
              <div className="col-12 md:col-6">
                <div className="p-3 border-round-lg bg-purple-50">
                  <h3 className="text-purple-600 mb-3 flex align-items-center">
                    <i className="pi pi-info-circle mr-2"></i>
                    Institution Details
                  </h3>
                  <div className="field mb-3">
                    <label className="font-bold block mb-2 text-700">
                      Type
                    </label>
                    <div className="p-2 bg-white border-round">
                      <Chip
                        label={institution.type}
                        icon="pi pi-building"
                        className="bg-primary-500 text-white"
                      />
                    </div>
                  </div>
                  <div className="field">
                    <label className="font-bold block mb-2 text-700">
                      Status
                    </label>
                    <div className="p-2 bg-white border-round">
                      <Chip
                        label={institution.isActive ? "Active" : "Inactive"}
                        icon={
                          institution.isActive
                            ? "pi pi-check-circle"
                            : "pi pi-times-circle"
                        }
                        className={`${
                          institution.isActive ? "bg-green-500" : "bg-red-500"
                        } text-white`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>{" "}
          </TabPanel>
          <TabPanel header="Contact Person">
            {institution.contactPersonName ||
            institution.contactPersonRole ||
            institution.contactPersonPhone ||
            institution.contactPersonEmail ? (
              <div className="p-3 border-round-lg bg-cyan-50">
                <h3 className="text-cyan-600 mb-4 flex align-items-center">
                  <i className="pi pi-user mr-2"></i>
                  Primary Contact Information
                </h3>
                <div className="grid">
                  <div className="col-12 md:col-6">
                    {institution.contactPersonName && (
                      <div className="field mb-3">
                        <label className="font-bold block mb-2 text-700">
                          Full Name
                        </label>
                        <div className="p-3 bg-white border-round text-900 flex align-items-center">
                          <i className="pi pi-user mr-2 text-cyan-500"></i>
                          {institution.contactPersonName}
                        </div>
                      </div>
                    )}
                    {institution.contactPersonRole && (
                      <div className="field mb-3">
                        <label className="font-bold block mb-2 text-700">
                          Position/Role
                        </label>
                        <div className="p-3 bg-white border-round text-900 flex align-items-center">
                          <i className="pi pi-briefcase mr-2 text-cyan-500"></i>
                          {institution.contactPersonRole}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="col-12 md:col-6">
                    {institution.contactPersonPhone && (
                      <div className="field mb-3">
                        <label className="font-bold block mb-2 text-700">
                          Phone Number
                        </label>
                        <div className="p-3 bg-white border-round text-900">
                          <a
                            href={`tel:${institution.contactPersonPhone}`}
                            className="text-primary no-underline flex align-items-center"
                          >
                            <i className="pi pi-phone mr-2 text-cyan-500"></i>
                            {institution.contactPersonPhone}
                          </a>
                        </div>
                      </div>
                    )}
                    {institution.contactPersonEmail && (
                      <div className="field mb-3">
                        <label className="font-bold block mb-2 text-700">
                          Email Address
                        </label>
                        <div className="p-3 bg-white border-round text-900">
                          <a
                            href={`mailto:${institution.contactPersonEmail}`}
                            className="text-primary no-underline flex align-items-center"
                          >
                            <i className="pi pi-envelope mr-2 text-cyan-500"></i>
                            {institution.contactPersonEmail}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 border-round-lg bg-gray-50 text-center">
                <i className="pi pi-user-minus text-4xl text-gray-400 mb-3"></i>
                <h4 className="text-gray-600 mb-2">
                  No Contact Person Information
                </h4>
                <p className="text-gray-500 text-sm">
                  Contact person details have not been provided for this
                  institution.
                </p>
              </div>
            )}{" "}
          </TabPanel>
          <TabPanel header="Services & Hours">
            <div className="grid">
              <div className="col-12 md:col-6">
                <div className="p-3 border-round-lg bg-orange-50">
                  <h3 className="text-orange-600 mb-4 flex align-items-center">
                    <i className="pi pi-list mr-2"></i>
                    Available Services
                  </h3>
                  {institution.services && institution.services.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {institution.services.map((service, index) => (
                        <Chip
                          key={index}
                          label={service}
                          icon="pi pi-check"
                          className="bg-orange-500 text-white mb-2"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 bg-white border-round text-center">
                      <i className="pi pi-info-circle text-gray-400 text-2xl mb-2"></i>
                      <p className="text-gray-500 m-0">No services listed</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="col-12 md:col-6">
                <div className="p-3 border-round-lg bg-indigo-50">
                  <h3 className="text-indigo-600 mb-4 flex align-items-center">
                    <i className="pi pi-clock mr-2"></i>
                    Operating Hours
                  </h3>
                  {institution.operatingHours &&
                  institution.operatingHours.length > 0 ? (
                    <div className="bg-white border-round p-3">
                      {institution.operatingHours.map((hours, index) => (
                        <div
                          key={index}
                          className="flex align-items-center mb-2 last:mb-0"
                        >
                          <i className="pi pi-calendar text-indigo-500 mr-2"></i>
                          <span className="text-900">{hours}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 bg-white border-round text-center">
                      <i className="pi pi-clock text-gray-400 text-2xl mb-2"></i>
                      <p className="text-gray-500 m-0">
                        No operating hours listed
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabPanel>
          <TabPanel header="Location">
            <div className="grid">
              <div className="col-12 md:col-8">
                <h3>Map View</h3>{" "}
                <div
                  className="border-round-lg overflow-hidden"
                  style={{ height: "400px" }}
                >
                  <DisplayMap
                    points={[
                      {
                        id: institution._id || "institution",
                        lat: institution.location.coordinates[1],
                        lng: institution.location.coordinates[0],
                        title: institution.name,
                        description: `${institution.address}, ${institution.city}`,
                        type: "hospital",
                      },
                    ]}
                    zoom={15}
                    autoFitBounds={false}
                  />
                </div>
              </div>
              <div className="col-12 md:col-4">
                <h3>Location Details</h3>
                <div className="p-3 border-round-lg bg-gray-50">
                  <div className="field mb-3">
                    <label className="font-bold block mb-2 text-primary">
                      <i className="pi pi-map-marker mr-2"></i>
                      Full Address
                    </label>
                    <div className="text-sm line-height-3">
                      {institution.address}
                      <br />
                      {institution.city}, {institution.state}{" "}
                      {institution.postalCode && institution.postalCode}
                      <br />
                      {institution.country}
                    </div>
                  </div>

                  <div className="field mb-3">
                    <label className="font-bold block mb-2 text-primary">
                      <i className="pi pi-compass mr-2"></i>
                      Coordinates
                    </label>
                    <div className="text-sm">
                      <div className="mb-1">
                        <span className="font-medium">Longitude:</span>{" "}
                        {institution.location.coordinates[0]}
                      </div>
                      <div>
                        <span className="font-medium">Latitude:</span>{" "}
                        {institution.location.coordinates[1]}
                      </div>
                    </div>
                  </div>

                  <div className="field">
                    <label className="font-bold block mb-2 text-primary">
                      <i className="pi pi-phone mr-2"></i>
                      Contact
                    </label>
                    <div className="text-sm">
                      <div className="mb-1">{institution.phoneNumber}</div>
                      {institution.email && (
                        <div className="mb-1">
                          <a
                            href={`mailto:${institution.email}`}
                            className="text-primary no-underline"
                          >
                            {institution.email}
                          </a>
                        </div>
                      )}
                      {institution.website && (
                        <div>
                          <a
                            href={
                              institution.website.startsWith("http")
                                ? institution.website
                                : `https://${institution.website}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary no-underline"
                          >
                            {institution.website}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabPanel>
        </TabView>{" "}
      </Card>      <EditMedicalInstitutionDialog
        visible={editDialogVisible}
        onHide={() => setEditDialogVisible(false)}
        institutionId={id || ""}
        onSuccess={handleEditSuccess}
      />
        <UserSearchDialog
        visible={userSearchDialogVisible}
        onHide={() => setUserSearchDialogVisible(false)}
        onUserSelect={handleUserSelect}
        header="Assign Manager to Medical Institution"
      />
    </div>
  );
};

export default MedicalInstitutionDetails;
