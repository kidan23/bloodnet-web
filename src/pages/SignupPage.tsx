import { useState } from "react";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { classNames } from "primereact/utils";
import { useNavigate } from "react-router-dom";
import { useSignup } from "../state/auth";
import { useAuth } from "../state/authContext";
import { UserRole } from "../state/auth";
import { extractErrorMessage } from "../utils/errorHandling";

const SignupPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  const signupMutation = useSignup();
  const navigate = useNavigate();
  const { login } = useAuth();
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setSignupError(null);
    
    if (email && password && confirmPassword && name && phoneNumber) {
      if (password !== confirmPassword) {
        setSignupError("Passwords do not match");
        return;
      }
      
      try {
        const data = await signupMutation.mutateAsync({
          email,
          password,
          role: UserRole.DONOR,
          name,
          phoneNumber        });
        await login(data.user, data.access_token);
        navigate('/');
      } catch (err: any) {
        const errorMessage = extractErrorMessage(err);
        setSignupError(errorMessage);
      }
    }
  };

  return (
    <Card title="Create Account" className="shadow-4">
      <div className="flex justify-content-center mb-4">
        <i
          className="pi pi-heart-fill text-red-500"
          style={{ fontSize: "3rem" }}
        ></i>
      </div>
      <h2 className="text-center text-primary font-bold mb-5">
        Join BloodNet as a Donor
      </h2>      <form onSubmit={handleSignup} className="p-fluid">
        <div className="field mb-4">
          <span className="p-float-label">
            <InputText
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={classNames({ "p-invalid": submitted && !name })}
            />
            <label htmlFor="name">Full Name*</label>
          </span>
          {submitted && !name && (
            <small className="p-error">Full name is required.</small>
          )}
        </div>

        <div className="field mb-4">
          <span className="p-float-label p-input-icon-right">
            <i className="pi pi-envelope pl-2" />
            <InputText
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={classNames(
                { "p-invalid": submitted && !email },
                "pl-5"
              )}
            />
            <label htmlFor="email" className="pl-4">Email*</label>
          </span>
          {submitted && !email && (
            <small className="p-error">Email is required.</small>
          )}
        </div>

        <div className="field mb-4">
          <span className="p-float-label">
            <InputText
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className={classNames({ "p-invalid": submitted && !phoneNumber })}
            />
            <label htmlFor="phoneNumber">Phone Number*</label>
          </span>
          {submitted && !phoneNumber && (
            <small className="p-error">Phone number is required.</small>
          )}
        </div>

        <div className="field mb-4">
          <span className="p-float-label">
            <Password
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              toggleMask
              className={classNames({ "p-invalid": submitted && !password })}
            />
            <label htmlFor="password">Password*</label>
          </span>
          {submitted && !password && (
            <small className="p-error">Password is required.</small>
          )}
        </div>

        <div className="field mb-4">
          <span className="p-float-label">
            <Password
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              toggleMask
              feedback={false}
              className={classNames({ "p-invalid": submitted && !confirmPassword })}
            />
            <label htmlFor="confirmPassword">Confirm Password*</label>
          </span>
          {submitted && !confirmPassword && (
            <small className="p-error">Please confirm your password.</small>
          )}
        </div>

        {signupError && <small className="p-error mb-3 block">{signupError}</small>}

        <Button 
          type="submit" 
          label="Create Account" 
          className="mb-4"
          loading={signupMutation.isPending}
        />
      </form>

      <Divider align="center">
        <span className="text-600 font-normal">OR</span>
      </Divider>

      <div className="mt-4 text-center">
        <p className="text-600 line-height-3 mb-3">
          Already have an account?{" "}
          <Button
            link
            className="text-primary font-medium p-0"
            onClick={() => navigate('/login')}
          >
            Sign In
          </Button>
        </p>
        <p className="text-600 line-height-3 mb-3">
          Want to register your organization?{" "}
          <Button
            link
            className="text-primary font-medium p-0"
            onClick={() => navigate('/apply')}
          >
            Apply Here
          </Button>
        </p>
      </div>
    </Card>
  );
};

export default SignupPage;
