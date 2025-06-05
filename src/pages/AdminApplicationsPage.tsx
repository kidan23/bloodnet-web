import { useState, useRef } from "react";
import { Card } from "primereact/card";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputTextarea } from "primereact/inputtextarea";
import { Badge } from "primereact/badge";
import { Toast } from "primereact/toast";
import { Dropdown } from "primereact/dropdown";
import { Divider } from "primereact/divider";
import { useQueryClient } from "@tanstack/react-query";
import { ApprovalStatus, UserRole } from "../state/auth";
import {
  useGetApplications,
  useReviewApplication,
  type PendingApplication,
} from "../state/admin";
import { extractErrorForToast } from "../utils/errorHandling";
import RoleBasedAccess from "../components/RoleBasedAccess";

const AdminApplicationsPage: React.FC = () => {
  const [selectedApplication, setSelectedApplication] =
    useState<PendingApplication | null>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [statusFilter, setStatusFilter] = useState<ApprovalStatus | null>(null);
  const toast = useRef<Toast>(null);
  const queryClient = useQueryClient();

  const { data: applicationsResponse, isLoading } = useGetApplications(
    statusFilter || undefined
  );

  const applications = applicationsResponse?.results || [];
  const totalApplications = applicationsResponse?.totalResults || 0;
  const approveMutation = useReviewApplication();
  const rejectMutation = useReviewApplication();

  const statusOptions = [
    { label: "All", value: null },
    { label: "Pending", value: ApprovalStatus.PENDING },
    { label: "Approved", value: ApprovalStatus.APPROVED },
    { label: "Rejected", value: ApprovalStatus.REJECTED },
  ];
  const statusBodyTemplate = (rowData: PendingApplication) => {
    const severity =
      rowData.status === ApprovalStatus.PENDING
        ? "warning"
        : rowData.status === ApprovalStatus.APPROVED
        ? "success"
        : "danger";

    return <Badge value={rowData.status} severity={severity} />;
  };
  const actionsBodyTemplate = (rowData: PendingApplication) => {
    if (rowData.status !== ApprovalStatus.PENDING) {
      return null;
    }

    return (
      <div className="flex gap-2">
        {" "}
        <Button
          icon="pi pi-check"
          className="p-button-rounded p-button-success p-button-sm"
          onClick={() => {
            approveMutation.mutate(
              {
                applicationId: rowData._id,
                review: { status: "approved" },
              },              {
                onSuccess: () => {
                  queryClient.invalidateQueries({
                    queryKey: ["admin-applications"],
                  });
                  toast.current?.show({
                    severity: "success",
                    summary: "Application Approved",
                    detail: "The application has been approved successfully.",
                    life: 3000,
                  });
                },
                onError: (error) => {
                  const { summary, detail } = extractErrorForToast(error);
                  toast.current?.show({
                    severity: "error",
                    summary,
                    detail,
                    life: 5000,
                  });
                },
              }
            );
          }}
          loading={approveMutation.isPending}
          tooltip="Approve"
        />
        <Button
          icon="pi pi-times"
          className="p-button-rounded p-button-danger p-button-sm"
          onClick={() => {
            setSelectedApplication(rowData);
            setShowRejectDialog(true);
          }}
          tooltip="Reject"
        />
        <Button
          icon="pi pi-eye"
          className="p-button-rounded p-button-info p-button-sm"
          onClick={() => setSelectedApplication(rowData)}
          tooltip="View Details"
        />
      </div>
    );
  };

  const roleBodyTemplate = (rowData: PendingApplication) => {
    const roleLabels = {
      blood_bank: "Blood Bank",
      medical_institution: "Medical Institution",
      donor: "Donor",
    };
    return roleLabels[rowData.role as keyof typeof roleLabels] || rowData.role;
  };

  const dateBodyTemplate = (rowData: PendingApplication) => {
    return new Date(rowData.createdAt).toLocaleDateString();
  };
  const handleReject = () => {
    if (selectedApplication && rejectionReason.trim()) {
      rejectMutation.mutate(
        {
          applicationId: selectedApplication._id,
          review: { status: "rejected", rejectionReason: rejectionReason },
        },        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
            toast.current?.show({
              severity: "success",
              summary: "Application Rejected",
              detail: "The application has been rejected successfully.",
              life: 3000,
            });
            setShowRejectDialog(false);
            setSelectedApplication(null);
            setRejectionReason("");
          },
          onError: (error) => {
            const { summary, detail } = extractErrorForToast(error);
            toast.current?.show({
              severity: "error",
              summary,
              detail,
              life: 5000,
            });
          },
        }
      );
    }
  };

  const renderBloodBankDetails = (data: any) => (
    <div className="grid">
      <div className="col-12 md:col-6">
        <p>
          <strong>Name:</strong> {data.name}
        </p>
        <p>
          <strong>License Number:</strong> {data.licenseNumber}
        </p>
        <p>
          <strong>Contact:</strong> {data.contactNumber}
        </p>
        <p>
          <strong>Email:</strong> {data.email}
        </p>
      </div>
      <div className="col-12 md:col-6">
        <p>
          <strong>Address:</strong> {data.address}
        </p>
        <p>
          <strong>City:</strong> {data.city}
        </p>
        <p>
          <strong>State:</strong> {data.state}
        </p>
        <p>
          <strong>Country:</strong> {data.country}
        </p>
      </div>
      {data.bloodTypesAvailable && (
        <div className="col-12">
          <p>
            <strong>Blood Types Available:</strong>{" "}
            {data.bloodTypesAvailable.join(", ")}
          </p>
        </div>
      )}
    </div>
  );

  const renderMedicalInstitutionDetails = (data: any) => (
    <div className="grid">
      <div className="col-12 md:col-6">
        <p>
          <strong>Name:</strong> {data.name}
        </p>
        <p>
          <strong>Registration Number:</strong> {data.registrationNumber}
        </p>
        <p>
          <strong>Type:</strong> {data.type}
        </p>
        <p>
          <strong>Phone:</strong> {data.phoneNumber}
        </p>
      </div>
      <div className="col-12 md:col-6">
        <p>
          <strong>Address:</strong> {data.address}
        </p>
        <p>
          <strong>City:</strong> {data.city}
        </p>
        <p>
          <strong>State:</strong> {data.state}
        </p>
        <p>
          <strong>Country:</strong> {data.country}
        </p>
      </div>
      {data.contactPersonName && (
        <div className="col-12">
          <p>
            <strong>Contact Person:</strong> {data.contactPersonName} (
            {data.contactPersonRole})
          </p>
          <p>
            <strong>Contact Phone:</strong> {data.contactPersonPhone}
          </p>
          <p>
            <strong>Contact Email:</strong> {data.contactPersonEmail}
          </p>
        </div>
      )}
    </div>
  );
  return (
    <RoleBasedAccess allowedRoles={[UserRole.ADMIN]} fallback={
      <div style={{ 
        textAlign: "center", 
        padding: "3rem 2rem", 
        backgroundColor: "#f8f9fa", 
        borderRadius: "12px",
        border: "1px solid #e9ecef",
        margin: "2rem"
      }}>
        <i className="pi pi-lock" style={{ fontSize: "3rem", color: "#dc3545", marginBottom: "1rem" }}></i>
        <h3 style={{ color: "#dc3545", marginBottom: "1rem" }}>Admin Access Required</h3>
        <p style={{ color: "#6c757d", marginBottom: "2rem", fontSize: "1.1rem" }}>
          You need administrator privileges to manage applications.
        </p>
        <Button 
          label="Go Back"
          outlined
          onClick={() => window.history.back()}
        />
      </div>
    }>
      <div>
        <Toast ref={toast} />

      <Card title="Application Management" className="mb-4">
        {" "}
        <div className="flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="m-0">Applications</h2>
            {totalApplications > 0 && (
              <small className="text-500">
                {totalApplications} application
                {totalApplications !== 1 ? "s" : ""} found
              </small>
            )}
          </div>
          <Dropdown
            value={statusFilter}
            options={statusOptions}
            onChange={(e) => setStatusFilter(e.value)}
            placeholder="Filter by status"
            className="w-12rem"
          />
        </div>
        <DataTable
          value={applications}
          loading={isLoading}
          paginator
          rows={10}
          className="p-datatable-striped"
          emptyMessage="No applications found"
        >
          <Column field="email" header="Email" sortable />
          <Column
            field="role"
            header="Organization Type"
            body={roleBodyTemplate}
            sortable
          />
          <Column
            field="status"
            header="Status"
            body={statusBodyTemplate}
            sortable
          />
          <Column
            field="createdAt"
            header="Applied On"
            body={dateBodyTemplate}
            sortable
          />
          <Column
            body={actionsBodyTemplate}
            header="Actions"
            style={{ width: "12rem" }}
          />
        </DataTable>
      </Card>

      {/* Application Details Dialog */}
      <Dialog
        header="Application Details"
        visible={!!selectedApplication && !showRejectDialog}
        style={{ width: "700px" }}
        modal
        onHide={() => setSelectedApplication(null)}
      >
        {selectedApplication && (
          <div>
            <div className="mb-4">
              <h3>User Information</h3>
              <p>
                <strong>Email:</strong> {selectedApplication.email}
              </p>
              <p>
                <strong>Role:</strong> {roleBodyTemplate(selectedApplication)}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                {statusBodyTemplate(selectedApplication)}
              </p>
              <p>
                <strong>Applied On:</strong>{" "}
                {dateBodyTemplate(selectedApplication)}
              </p>
            </div>

            <Divider />

            <div className="mb-4">
              <h3>Organization Details</h3>
              {selectedApplication.role === "blood_bank"
                ? renderBloodBankDetails(selectedApplication.profileData)
                : renderMedicalInstitutionDetails(
                    selectedApplication.profileData
                  )}
            </div>

            {selectedApplication.rejectionReason && (
              <>
                <Divider />
                <div className="mb-4">
                  <h3 className="text-red-500">Rejection Reason</h3>
                  <p className="text-red-600">
                    {selectedApplication.rejectionReason}
                  </p>
                </div>
              </>
            )}

            {selectedApplication.status === ApprovalStatus.PENDING && (
              <div className="flex justify-content-end gap-2 mt-4">
                {" "}
                <Button
                  label="Approve"
                  icon="pi pi-check"
                  className="p-button-success"
                  onClick={() => {
                    approveMutation.mutate(
                      {
                        applicationId: selectedApplication._id,
                        review: { status: "approved" },
                      },
                      {
                        onSuccess: () => {
                          queryClient.invalidateQueries({
                            queryKey: ["admin-applications"],
                          });
                          toast.current?.show({
                            severity: "success",
                            summary: "Application Approved",
                            detail:
                              "The application has been approved successfully.",
                            life: 3000,
                          });
                          setSelectedApplication(null);
                        },                        onError: (error) => {
                          const { summary, detail } = extractErrorForToast(error);
                          toast.current?.show({
                            severity: "error",
                            summary,
                            detail,
                            life: 5000,
                          });
                        },
                      }
                    );
                  }}
                  loading={approveMutation.isPending}
                />
                <Button
                  label="Reject"
                  icon="pi pi-times"
                  className="p-button-danger"
                  onClick={() => setShowRejectDialog(true)}
                />
              </div>
            )}
          </div>
        )}
      </Dialog>

      {/* Reject Dialog */}
      <Dialog
        header="Reject Application"
        visible={showRejectDialog}
        style={{ width: "400px" }}
        modal
        onHide={() => {
          setShowRejectDialog(false);
          setRejectionReason("");
        }}
      >
        <div className="mb-4">
          <label htmlFor="rejectionReason">Reason for rejection:</label>
          <InputTextarea
            id="rejectionReason"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={4}
            className="w-full mt-2"
            placeholder="Please provide a reason for rejecting this application..."
          />
        </div>
        <div className="flex justify-content-end gap-2">
          <Button
            label="Cancel"
            icon="pi pi-times"
            className="p-button-text"
            onClick={() => {
              setShowRejectDialog(false);
              setRejectionReason("");
            }}
          />
          <Button
            label="Reject"
            icon="pi pi-check"
            className="p-button-danger"
            onClick={handleReject}
            loading={rejectMutation.isPending}
            disabled={!rejectionReason.trim()}
          />        </div>
      </Dialog>
    </div>
    </RoleBasedAccess>
  );
};

export default AdminApplicationsPage;
