import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  signIn: (emailOrPhone: string, password: string, twoFactorToken?: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string; errors?: Array<{field: string, message: string}> }>;
  signUp: (userData: SignUpData) => Promise<{ success: boolean; requiresVerification?: boolean; email?: string; user?: User | null; error?: string; errors?: Array<{field: string, message: string}> }>;
  verifyCode: (email: string, code: string) => Promise<boolean>;
  resendCode: (email: string) => Promise<boolean>;
  sendPhoneCode: (phone: string) => Promise<boolean>;
  verifyPhoneCode: (phone: string, code: string) => Promise<boolean>;
  sendVerificationCode: (method: 'email' | 'phone', emailOrPhone: string) => Promise<boolean>;
  verifyAccountCode: (method: 'email' | 'phone', emailOrPhone: string, code: string) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<boolean>;
  forgotPasswordPhone: (phone: string) => Promise<boolean>;
  resetPassword: (token: string, newPassword: string) => Promise<boolean>;
  resetPasswordPhone: (phone: string, code: string, newPassword: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => void;
  refreshAuth: () => void;
  loadRememberedCredentials: () => { isRemembered: boolean; rememberedEmail: string };
  clearRememberedCredentials: () => void;
  isLoading: boolean;
}

interface SignUpData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface User {
  id: string;
  email: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  provider?: string;
  avatarUrl?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  role?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const authStatus = localStorage.getItem('auth_status');
        const userData = localStorage.getItem('user_data');
        
        if (authStatus === 'authenticated' && userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        // Clear invalid data silently
        localStorage.removeItem('auth_status');
        localStorage.removeItem('user_data');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
    refreshUserData(); // Add role data for existing admin users
  }, []);

  const signIn = async (emailOrPhone: string, password: string, twoFactorToken?: string, rememberMe?: boolean): Promise<{ success: boolean; error?: string; errors?: Array<{field: string, message: string}> }> => {
    try {
      setIsLoading(true);
      
      const requestBody: any = { emailOrPhone, password };
      if (twoFactorToken && twoFactorToken.trim()) {
        requestBody.twoFactorToken = twoFactorToken;
      }
      if (rememberMe !== undefined) {
        requestBody.rememberMe = rememberMe;
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.success && data.data?.user) {
        const userData = data.data.user;
        const token = data.data.token;
        const isRemembered = data.data.rememberMe || false;
        
        // Ensure role is included in user data
        setUser(userData);
        setIsAuthenticated(true);
        
        localStorage.setItem('auth_status', 'authenticated');
        localStorage.setItem('user_data', JSON.stringify(userData));
        if (token) {
          localStorage.setItem('auth_token', token);
        }
        
        // Store remember me preference
        if (isRemembered) {
          localStorage.setItem('remember_me', 'true');
          localStorage.setItem('remembered_email', emailOrPhone);
        } else {
          localStorage.removeItem('remember_me');
          localStorage.removeItem('remembered_email');
        }
        
        return { success: true };
      }
      
      // Return detailed error information
      return { 
        success: false, 
        error: data.message || 'Sign in failed',
        errors: data.errors || []
      };
    } catch (error) {
      return { 
        success: false, 
        error: 'Network error. Please check your connection and try again.'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (userData: SignUpData): Promise<{ success: boolean; requiresVerification?: boolean; email?: string; user?: User | null; error?: string; errors?: Array<{field: string, message: string}> }> => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (data.success) {
        if (data.data?.requiresVerification) {
          return {
            success: true,
            requiresVerification: true,
            email: userData.email
          };
        } else if (data.data?.user) {
          setUser(data.data.user);
          setIsAuthenticated(true);
          localStorage.setItem('auth_status', 'authenticated');
          localStorage.setItem('user_data', JSON.stringify(data.data.user));
          
          // Store JWT token if provided
          if (data.data?.token) {
            localStorage.setItem('auth_token', data.data.token);
          }
          
          return {
            success: true,
            user: data.data.user
          };
        }
      }
      
      // Return detailed error information
      return { 
        success: false, 
        error: data.message || 'Signup failed',
        errors: data.errors || []
      };
    } catch (error) {
      return { 
        success: false, 
        error: 'Network error. Please check your connection and try again.'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async (email: string, code: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/verify-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (data.success && data.data?.user) {
        const userData = data.data.user;
        const token = data.data.token;
        
        setUser(userData);
        setIsAuthenticated(true);
        
        localStorage.setItem('auth_status', 'authenticated');
        localStorage.setItem('user_data', JSON.stringify(userData));
        if (token) {
          localStorage.setItem('auth_token', token);
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resendCode = async (email: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/resend-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      return data.success;
    } catch (error) {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      return data.success;
    } catch (error) {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (token: string, newPassword: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();
      return data.success;
    } catch (error) {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const sendPhoneCode = async (phone: string): Promise<boolean> => {
    // Prevent duplicate calls
    if (isLoading) {
      console.log('sendPhoneCode: Already loading, preventing duplicate call');
      return false;
    }

    try {
      console.log('sendPhoneCode: Starting SMS send for phone:', phone);
      setIsLoading(true);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/send-phone-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();
      console.log('sendPhoneCode: Response received:', data);
      return data.success;
    } catch (error) {
      console.error('sendPhoneCode: Error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyPhoneCode = async (phone: string, code: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/verify-phone-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ phone, code }),
      });

      const data = await response.json();

      if (data.success && data.data?.user) {
        const userData = data.data.user;
        const token = data.data.token;
        
        setUser(userData);
        setIsAuthenticated(true);
        
        localStorage.setItem('auth_status', 'authenticated');
        localStorage.setItem('user_data', JSON.stringify(userData));
        if (token) {
          localStorage.setItem('auth_token', token);
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPasswordPhone = async (phone: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/forgot-password-phone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();
      return data.success;
    } catch (error) {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPasswordPhone = async (phone: string, code: string, newPassword: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/reset-password-phone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ phone, code, newPassword }),
      });

      const data = await response.json();
      return data.success;
    } catch (error) {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const sendVerificationCode = async (method: 'email' | 'phone', emailOrPhone: string): Promise<boolean> => {
    // Prevent duplicate calls
    if (isLoading) {
      return false;
    }

    try {
      setIsLoading(true);
      
      if (method === 'email') {
        return await resendCode(emailOrPhone);
      } else {
        return await sendPhoneCode(emailOrPhone);
      }
    } catch (error) {
      console.error('sendVerificationCode: Error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyAccountCode = async (method: 'email' | 'phone', emailOrPhone: string, code: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      if (method === 'email') {
        return await verifyCode(emailOrPhone, code);
      } else {
        return await verifyPhoneCode(emailOrPhone, code);
      }
    } catch (error) {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // First, get the Google OAuth URL from the backend
      const response = await fetch(`${import.meta.env.VITE_API_URL   || 'http://localhost:3001'}/api/auth/google/url`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Prevent ngrok warning HTML (must be present even for GET)
          'ngrok-skip-browser-warning': 'true'
        },
      });

      const data = await response.json();
      
      if (data.success && data.authUrl) {
        // Redirect to the Google OAuth URL
        window.location.href = data.authUrl;
      } else {
        throw new Error(data.message || 'Failed to get Google OAuth URL');
      }
    } catch (error) {
      // Google OAuth initiation failed
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('auth_status');
    localStorage.removeItem('user_data');
    localStorage.removeItem('auth_token');
  };

  const refreshAuth = () => {
    try {
      const authStatus = localStorage.getItem('auth_status');
      const userData = localStorage.getItem('user_data');
      
      if (authStatus === 'authenticated' && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const loadRememberedCredentials = () => {
    const isRemembered = localStorage.getItem('remember_me') === 'true';
    const rememberedEmail = localStorage.getItem('remembered_email');
    
    return {
      isRemembered,
      rememberedEmail: rememberedEmail || ''
    };
  };

  const clearRememberedCredentials = () => {
    localStorage.removeItem('remember_me');
    localStorage.removeItem('remembered_email');
  };

  // Temporary function to refresh user data by re-signing in
  const refreshUserData = async () => {
    try {
      const userData = localStorage.getItem('user_data');
      if (!userData) return;
      
      const user = JSON.parse(userData);
      if (!user.email) return;
      
      // For now, we'll just update the role in localStorage if it's missing
      // In a real app, you'd fetch fresh data from the server
      if (!user.role && user.email === 'admin@legacymindset.net') {
        user.role = 'admin';
        localStorage.setItem('user_data', JSON.stringify(user));
        setUser(user);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    user,
    signIn,
    signUp,
    verifyCode,
    resendCode,
    sendPhoneCode,
    verifyPhoneCode,
    sendVerificationCode,
    verifyAccountCode,
    forgotPassword,
    forgotPasswordPhone,
    resetPassword,
    resetPasswordPhone,
    signInWithGoogle,
    signOut,
    refreshAuth,
    loadRememberedCredentials,
    clearRememberedCredentials,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};