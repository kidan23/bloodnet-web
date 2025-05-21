import React, { useState } from 'react';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Divider } from 'primereact/divider';
import { classNames } from 'primereact/utils';
import { useLogin } from '../state/auth';
import { useAuth } from '../state/authContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const loginMutation = useLogin();

  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setLoginError(null);
    if (email && password) {
      try {
        const data = await loginMutation.mutateAsync({ email, password });
        login(data.user, data.access_token);
        // Optionally redirect or update global state
      } catch (err: any) {
        setLoginError(err?.response?.data?.message || 'Login failed');
      }
    }
  };

  return (
    <Card title="Sign In" className="shadow-4">
      <div className="flex justify-content-center mb-4">
        <i className="pi pi-heart-fill text-red-500" style={{ fontSize: '3rem' }}></i>
      </div>
      <h2 className="text-center text-primary font-bold mb-5">BloodNet Portal</h2>

      <form onSubmit={handleLogin} className="p-fluid">
        <div className="field mb-4">
          <span className="p-float-label p-input-icon-right">
            <i className="pi pi-envelope" />
            <InputText 
              id="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className={classNames({ 'p-invalid': submitted && !email })}
            />
            <label htmlFor="email">Email*</label>
          </span>
          {submitted && !email && <small className="p-error">Email is required.</small>}
        </div>

        <div className="field mb-4">
          <span className="p-float-label">
            <Password 
              id="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              toggleMask 
              feedback={false}
              className={classNames({ 'p-invalid': submitted && !password })}
            />
            <label htmlFor="password">Password*</label>
          </span>
          {submitted && !password && <small className="p-error">Password is required.</small>}
        </div>

        <div className="field-checkbox mb-4">
          <a className="text-primary font-medium cursor-pointer">Forgot password?</a>
        </div>

        {loginError && <small className="p-error">{loginError}</small>}

        <Button type="submit" label="Sign In" className="mb-4" />
      </form>

      <Divider align="center">
        <span className="text-600 font-normal">OR</span>
      </Divider>

      <div className="mt-4 text-center">
        <p className="text-600 line-height-3 mb-3">
          Don't have an account yet? <a className="text-primary font-medium cursor-pointer">Create one</a>
        </p>
        
        <Button 
          label="Apply as a Donor" 
          className="p-button-outlined p-button-secondary mb-2 w-full" 
          icon="pi pi-heart" 
        />
        
        <Button 
          label="Register a Blood Bank" 
          className="p-button-outlined p-button-help w-full" 
          icon="pi pi-building" 
        />
      </div>
    </Card>
  );
};

export default LoginPage;
