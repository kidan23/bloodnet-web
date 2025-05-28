# BloodNet Authentication Workflow

## Overview

BloodNet implements a sophisticated three-tier authentication and registration system that supports different user types with varying approval requirements.

## User Registration Workflows

### 1. Donor Registration (Direct Access)
- **Process**: Simple signup → Login → Profile completion prompt
- **Approval**: Not required (immediate access)
- **Profile**: Prompted to create donor profile after login

**Steps:**
1. Navigate to `/login`
2. Click "Sign up as Donor"
3. Provide email and password
4. Login with credentials
5. Complete donor profile when prompted

### 2. Blood Bank Application (Admin Approval Required)
- **Process**: Application → Admin review → Approval → Access
- **Approval**: Required by admin
- **Profile**: Automatically created from application data

**Steps:**
1. Navigate to `/login`
2. Click "Apply as Blood Bank"
3. Fill detailed organization form
4. Submit application
5. Wait for admin approval
6. Login after approval

### 3. Medical Institution Application (Admin Approval Required)
- **Process**: Application → Admin review → Approval → Access
- **Approval**: Required by admin
- **Profile**: Automatically created from application data

**Steps:**
1. Navigate to `/login`
2. Click "Apply as Medical Institution"
3. Fill detailed organization form
4. Submit application
5. Wait for admin approval
6. Login after approval

## Admin Workflow

### Application Management
- **Access**: Admin users only
- **Location**: `/admin/applications`
- **Features**: View, approve, reject applications with reasons

**Admin Functions:**
- View all pending applications
- Review organization details
- Approve applications (creates profiles automatically)
- Reject applications with specific reasons
- Filter applications by status

## Access Control

### Route Protection
- **Unauthenticated**: Redirected to login
- **Pending Users**: See approval status screen
- **Incomplete Profiles**: Prompted to complete (donors only)
- **Admin Routes**: Protected by role-based access control

### Component Protection
- `ApprovalStatusChecker`: Blocks access for pending/rejected users
- `ProfileCompletionChecker`: Prompts donors to complete profiles
- `RoleBasedAccess`: Protects admin-only features

## User States

### Approval Status
- **PENDING**: Application submitted, awaiting admin review
- **APPROVED**: Application approved, user can access system
- **REJECTED**: Application rejected with reason

### Profile Completion
- **Complete**: User has all required profile information
- **Incomplete**: Missing profile data (donors only)

## Technical Implementation

### Key Files
- `src/state/auth.ts` - Authentication hooks and types
- `src/state/authContext.tsx` - Global auth state management
- `src/state/admin.ts` - Admin application management
- `src/components/ApprovalStatusChecker.tsx` - Approval flow component
- `src/components/ProfileCompletionChecker.tsx` - Profile completion component
- `src/components/RoleBasedAccess.tsx` - Role-based access control

### API Endpoints Required
```
POST /auth/signup - Donor registration
POST /applications - Organization applications
POST /auth/login - User login
POST /auth/check-token - Token validation
GET /auth/profile-status - Profile completion check
GET /applications - List applications (admin access)
POST /applications/:id/approve - Approve application (admin access)
POST /applications/:id/reject - Reject application (admin access)
```

## User Experience

### For Donors
1. Quick registration process
2. Immediate system access
3. Gentle prompts to complete profile
4. Full functionality once profile is complete

### For Organizations
1. Comprehensive application forms
2. Clear status communication
3. Transparent approval process
4. Helpful rejection feedback

### For Admins
1. Centralized application management
2. Detailed organization information
3. Easy approve/reject workflow
4. Application filtering and search

## Security Features

- JWT-based authentication
- Role-based access control
- Protected admin routes
- Secure password handling
- Token validation on each request

## Future Enhancements

- Email notifications for approval/rejection
- Application status tracking
- Bulk application management
- Advanced filtering and search
- User role migration capabilities
