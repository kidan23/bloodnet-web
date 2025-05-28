import { useAuth } from '../state/authContext';
import { UserRole, ApprovalStatus } from '../state/auth';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';

interface ApprovalStatusCheckerProps {
  children: React.ReactNode;
}

const ApprovalStatusChecker: React.FC<ApprovalStatusCheckerProps> = ({ children }) => {
  const { user, userRole, isApproved, logout } = useAuth();

  // If user is a donor or admin, they don't need approval
  if (userRole === UserRole.DONOR || userRole === UserRole.ADMIN || isApproved) {
    return <>{children}</>;
  }

  // If user is pending approval
  if (user?.approvalStatus === ApprovalStatus.PENDING) {
    return (
      <div className="flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Card className="shadow-4 text-center" style={{ maxWidth: '500px' }}>
          <div className="mb-4">
            <i 
              className="pi pi-clock text-orange-500" 
              style={{ fontSize: '4rem' }}
            ></i>
          </div>
          <h2 className="text-primary mb-3">Application Under Review</h2>
          <p className="text-600 line-height-3 mb-4">
            Thank you for applying to join BloodNet as a {' '}
            {userRole === UserRole.BLOOD_BANK ? 'Blood Bank' : 'Medical Institution'}.
          </p>
          <p className="text-600 line-height-3 mb-4">
            Your application is currently being reviewed by our admin team. 
            You will receive an email notification once your application has been approved.
          </p>
          <p className="text-500 text-sm mb-4">
            This process typically takes 1-3 business days.
          </p>
          <Button
            label="Sign Out"
            icon="pi pi-sign-out"
            onClick={logout}
            className="p-button-outlined"
          />
        </Card>
      </div>
    );
  }

  // If user is rejected
  if (user?.approvalStatus === ApprovalStatus.REJECTED) {
    return (
      <div className="flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Card className="shadow-4 text-center" style={{ maxWidth: '500px' }}>
          <div className="mb-4">
            <i 
              className="pi pi-times-circle text-red-500" 
              style={{ fontSize: '4rem' }}
            ></i>
          </div>
          <h2 className="text-red-500 mb-3">Application Rejected</h2>
          <p className="text-600 line-height-3 mb-4">
            Unfortunately, your application to join BloodNet as a {' '}
            {userRole === UserRole.BLOOD_BANK ? 'Blood Bank' : 'Medical Institution'} has been rejected.
          </p>
          {user.rejectionReason && (
            <div className="p-3 border-left-3 border-red-500 bg-red-50 mb-4">
              <p className="text-red-700 font-medium mb-2">Reason:</p>
              <p className="text-red-600">{user.rejectionReason}</p>
            </div>
          )}
          <p className="text-600 line-height-3 mb-4">
            If you believe this was an error or would like to appeal this decision, 
            please contact our support team.
          </p>
          <div className="flex justify-content-center gap-2">
            <Button
              label="Contact Support"
              icon="pi pi-envelope"
              className="p-button-outlined"
            />
            <Button
              label="Sign Out"
              icon="pi pi-sign-out"
              onClick={logout}
              className="p-button-text"
            />
          </div>
        </Card>
      </div>
    );
  }

  // Default fallback
  return <>{children}</>;
};

export default ApprovalStatusChecker;
