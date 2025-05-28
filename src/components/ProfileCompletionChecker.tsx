import { useEffect, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { useAuth } from '../state/authContext';
import { useCheckProfileComplete } from '../state/auth';
import { UserRole } from '../state/auth';
import { useNavigate } from 'react-router-dom';

interface ProfileCompletionCheckerProps {
  children: React.ReactNode;
}

const ProfileCompletionChecker: React.FC<ProfileCompletionCheckerProps> = ({ children }) => {
  const { user, userRole, profileComplete, checkProfileStatus } = useAuth();
  const [showDialog, setShowDialog] = useState(false);
  const checkProfileMutation = useCheckProfileComplete();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && userRole === UserRole.DONOR && !profileComplete) {
      checkProfile();
    }
  }, [user, userRole, profileComplete]);
  const checkProfile = async () => {
    try {
      const result = await checkProfileMutation.mutateAsync();
      if (!result.profileComplete) {
        setShowDialog(true);
      }
    } catch (error) {
      console.error('Failed to check profile status:', error);
    }
  };
  const handleCreateProfile = () => {
    setShowDialog(false);
    navigate('/donors/create');
  };

  const handleSkip = () => {
    setShowDialog(false);
    // Update profile status to prevent showing again this session
    checkProfileStatus();
  };

  if (userRole !== UserRole.DONOR) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <Dialog
        header="Complete Your Profile"
        visible={showDialog}
        style={{ width: '450px' }}
        modal
        closable={false}
        onHide={() => setShowDialog(false)}
      >
        <div className="text-center p-4">
          <i 
            className="pi pi-user-plus text-primary mb-3" 
            style={{ fontSize: '3rem' }}
          ></i>
          <h3 className="text-primary mb-3">Welcome to BloodNet!</h3>
          <p className="text-600 line-height-3 mb-4">
            To get the most out of BloodNet and help save lives, please complete your donor profile. 
            This will help us match you with blood donation requests in your area.
          </p>
          <div className="flex justify-content-center gap-2">
            <Button
              label="Complete Profile"
              icon="pi pi-user-plus"
              onClick={handleCreateProfile}
              className="p-button-raised"
            />
            <Button
              label="Skip for Now"
              icon="pi pi-times"
              onClick={handleSkip}
              className="p-button-text"
            />
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default ProfileCompletionChecker;
