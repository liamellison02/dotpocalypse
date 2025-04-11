import React, { useState } from 'react';
import styled from 'styled-components';
import { Window } from '../ui/Window';
import { TextField, Button, Fieldset } from 'react95';
import supabase from '../../lib/supabase';

interface AuthProps {
  onLogin: (user: any) => void;
}

const AuthContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: teal;
`;

const AuthWindow = styled(Window)`
  width: 400px;
`;

const AuthForm = styled.div`
  padding: 20px;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const ErrorMessage = styled.div`
  color: red;
  margin-top: 16px;
`;

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Sign in
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) {
          console.log('Login successful:', data.user);
          onLogin(data.user);
        }
      } else {
        // Sign up
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.user) {
          console.log('Registration successful:', data.user);
          onLogin(data.user);
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      setError(error.message || 'Invalid login credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContainer>
      <AuthWindow title={isLogin ? 'Login' : 'Register'}>
        <AuthForm>
          <Fieldset label="DotCom Bubble Portfolio Simulator">
            <form onSubmit={handleSubmit}>
              <FormGroup>
                <TextField
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                  required
                />
              </FormGroup>
              <FormGroup>
                <TextField
                  placeholder="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  fullWidth
                  required
                />
              </FormGroup>
              <FormGroup>
                <Button type="submit" disabled={loading} fullWidth>
                  {loading ? 'Processing...' : isLogin ? 'Login' : 'Register'}
                </Button>
              </FormGroup>
              <Button
                onClick={() => setIsLogin(!isLogin)}
                disabled={loading}
                fullWidth
                variant="flat"
              >
                {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
              </Button>
              {error && <ErrorMessage>{error}</ErrorMessage>}
            </form>
          </Fieldset>
        </AuthForm>
      </AuthWindow>
    </AuthContainer>
  );
};

export default Auth;
