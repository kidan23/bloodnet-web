import React, { useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  useBloodBank,
  useDeleteBloodBank,
  useToggleBloodBankStatus,
  useAssignUserToBloodBank,
} from "../../state/bloodBanks";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Tag } from "primereact/tag";
import { Divider } from "primereact/divider";
import { extractErrorForToast } from "../../utils/errorHandling";
import DisplayMap from "../../components/map/DisplayMap";
import { UserSearchDialog } from "./UserSearchDialog";
import { UserRole } from "../../state/auth";
import RoleBasedAccess from "../../components/RoleBasedAccess";

const BloodBankDetails: React.FC = () => {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useRef<Toast>(null);
  const [showUserSearchDialog, setShowUserSearchDialog] = useState(false);

  const { data: bloodBank, isLoading, isError, error } = useBloodBank(id);

  const deleteMutation = useDeleteBloodBank();
  const toggleStatusMutation = useToggleBloodBankStatus();
  const assignUserMutation = useAssignUserToBloodBank();

  if (isLoading) {
    return (
      <div
        className="flex justify-content-center align-items-center"
        style={{ minHeight: 120 }}
      >
        Loading blood bank details...
      </div>
    );
  }

  if (isError || !bloodBank) {
    return (
      <div className="text-danger">
        Error loading blood bank:{" "}
        {(error as Error)?.message || "Blood bank not found"}
        <div className="mt-3">
          <Link to="/blood-banks" className="text-primary underline-hover">
            Back to Blood Banks
          </Link>
        </div>
      </div>
    );
  }
  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this blood bank?")) {
      try {
        await deleteMutation.mutateAsync(id);
        navigate("/blood-banks", {
          state: { message: "Blood bank deleted successfully" },
        });
      } catch (err) {
        console.error("Failed to delete blood bank:", err);
        const { summary, detail } = extractErrorForToast(err);
        toast.current?.show({
          severity: "error",
          summary,
          detail,
          life: 5000,
        });
      }
    }
  };
  const handleToggleStatus = async () => {
    try {
      await toggleStatusMutation.mutateAsync(id);
    } catch (err) {
      console.error("Failed to toggle blood bank status:", err);
      const { summary, detail } = extractErrorForToast(err);
      toast.current?.show({
        severity: "error",
        summary,
        detail,
        life: 5000,
      });
    }
  };
  const handleAssignUser = async (user: { _id: string; email: string; role: string }) => {
    try {
      await assignUserMutation.mutateAsync({
        id: id,
        userId: user._id
      });
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: `User ${user.email} has been assigned as manager`,
        life: 5000,
      });
    } catch (err) {
      console.error("Failed to assign user:", err);
      const { summary, detail } = extractErrorForToast(err);
      toast.current?.show({
        severity: "error",
        summary,
        detail,
        life: 5000,
      });
    }
  };
  return (
    <div
      className="flex flex-column gap-4"
      style={{ maxWidth: 900, margin: "0 auto" }}
    >
      <Toast ref={toast} />
      <div className="mb-3">
        <Link to="/blood-banks" className="text-primary underline-hover">
          &larr; Back to Blood Banks
        </Link>
      </div>
      <Card>
        <div className="flex justify-content-between align-items-center mb-3">
          <h1>{bloodBank.name}</h1>
          <span
            style={{
              background: bloodBank.isActive !== false ? "#bbf7d0" : "#fee2e2",
              color: bloodBank.isActive !== false ? "#166534" : "#b91c1c",
              fontSize: 14,
              borderRadius: 8,
              padding: "4px 16px",
            }}
          >
            {bloodBank.isActive !== false ? "Active" : "Inactive"}
          </span>
        </div>
        <div className="grid" style={{ gap: 24 }}>
          <div className="col-12 md:col-6">
            <h2>Contact Information</h2>
            <div style={{ lineHeight: 1.7 }}>
              <div>
                <b>Address:</b> {bloodBank.address}
              </div>
              {bloodBank.city && bloodBank.state && (
                <div>
                  {bloodBank.city}, {bloodBank.state} {bloodBank.postalCode}
                </div>
              )}
              {bloodBank.country && <div>{bloodBank.country}</div>}
              <div>
                <b>Phone:</b> {bloodBank.contactNumber}
              </div>
              {bloodBank.alternateContactNumber && (
                <div>
                  <b>Alt. Phone:</b> {bloodBank.alternateContactNumber}
                </div>
              )}
              <div>
                <b>Email:</b> {bloodBank.email}
              </div>
              {bloodBank.website && (
                <div>
                  <b>Website:</b>{" "}
                  <a
                    href={
                      bloodBank.website.startsWith("http")
                        ? bloodBank.website
                        : `https://${bloodBank.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline-hover"
                  >
                    {bloodBank.website}
                  </a>
                </div>
              )}
            </div>          </div>
          
          {/* Manager Section */}
          <div className="col-12">
            <Divider />
            <div className="flex justify-content-between align-items-center mb-3">
              <h2 className="m-0">Manager Assignment</h2>
              <RoleBasedAccess allowedRoles={[UserRole.ADMIN]}>
                <Button
                  label="Assign Manager"
                  icon="pi pi-user-plus"
                  size="small"
                  onClick={() => setShowUserSearchDialog(true)}
                  loading={assignUserMutation.isPending}
                />
              </RoleBasedAccess>
            </div>
            
            {bloodBank.user ? (
              <div className="surface-100 border-round p-3">
                <div className="flex justify-content-between align-items-center">
                  <div>
                    <div className="font-medium text-900">
                      {typeof bloodBank.user === 'string' ? 
                        `User ID: ${bloodBank.user}` : 
                        bloodBank.user.email
                      }
                    </div>
                    {typeof bloodBank.user !== 'string' && (
                      <div className="text-sm text-600 mt-1">
                        <Tag 
                          value={bloodBank.user.role} 
                          severity={bloodBank.user.role === 'BLOOD_BANK' ? 'success' : 'info'}
                          className="mr-2"
                        />
                        <span>Assigned: {new Date(bloodBank.user.createdAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  <RoleBasedAccess allowedRoles={[UserRole.ADMIN]}>
                    <Button
                      label="Change Manager"
                      icon="pi pi-user-edit"
                      size="small"
                      className="p-button-outlined"
                      onClick={() => setShowUserSearchDialog(true)}
                    />
                  </RoleBasedAccess>
                </div>
              </div>
            ) : (
              <div className="surface-50 border-round p-4 text-center text-600">
                <i className="pi pi-user text-3xl mb-3 block"></i>
                <div className="text-lg mb-2">No Manager Assigned</div>
                <div className="text-sm">Assign a user to manage this blood bank</div>
              </div>
            )}
          </div>
          
          <div className="col-12 md:col-6">
            <h2>Additional Information</h2>
            <div style={{ lineHeight: 1.7 }}>
              {bloodBank.operatingHours && (
                <div>
                  <b>Operating Hours:</b> {bloodBank.operatingHours}
                </div>
              )}
              {bloodBank.licenseNumber && (
                <div>
                  <b>License Number:</b> {bloodBank.licenseNumber}
                </div>
              )}
              {bloodBank.establishedDate && (
                <div>
                  <b>Established:</b>{" "}
                  {new Date(bloodBank.establishedDate).toLocaleDateString()}
                </div>
              )}
            </div>
            {bloodBank.bloodTypesAvailable &&
              bloodBank.bloodTypesAvailable.length > 0 && (
                <div className="mt-2">
                  <b>Blood Types Available:</b>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {bloodBank.bloodTypesAvailable.map((type) => (
                      <span
                        key={type}
                        style={{
                          background: "#fef2f2",
                          color: "#b91c1c",
                          fontSize: 12,
                          borderRadius: 12,
                          padding: "2px 10px",
                          marginRight: 4,
                          marginBottom: 4,
                          display: "inline-block",
                        }}
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>{" "}
        {bloodBank.location && bloodBank.location.coordinates && (
          <div className="mt-4">
            <h2>Location</h2>
            <div>
              Coordinates: {bloodBank.location.coordinates[1]},{" "}
              {bloodBank.location.coordinates[0]}
            </div>
            <div className="mt-2">
              {" "}
              <DisplayMap
                points={[
                  {
                    id: bloodBank._id,
                    lat: bloodBank.location.coordinates[1],
                    lng: bloodBank.location.coordinates[0],
                    title: bloodBank.name,
                    description: bloodBank.address,
                    type: "bloodbank",
                  },
                ]}
                height="300px"
                autoFitBounds={true}
                showZoomControl={true}
                center={{
                  lat: bloodBank.location.coordinates[1],
                  lng: bloodBank.location.coordinates[0],
                }}
                zoom={15}
              />
            </div>
          </div>
        )}
        <div className="flex justify-content-end gap-2 mt-4">
          <Button
            onClick={handleToggleStatus}
            label={
              toggleStatusMutation.isPending
                ? "Updating..."
                : bloodBank.isActive !== false
                ? "Deactivate"
                : "Activate"
            }
            className="warning"
            disabled={toggleStatusMutation.isPending}
          />
          <Link to={`/blood-banks/edit/${id}`}>
            <Button label="Edit" className="info" />
          </Link>
          <Button
            onClick={handleDelete}
            label={deleteMutation.isPending ? "Deleting..." : "Delete"}
            className="danger"
            disabled={deleteMutation.isPending}
          />        </div>
      </Card>
      
      <UserSearchDialog
        visible={showUserSearchDialog}
        onHide={() => setShowUserSearchDialog(false)}
        onUserSelect={handleAssignUser}
        header="Assign Blood Bank Manager"
      />
    </div>
  );
};

export default BloodBankDetails;
