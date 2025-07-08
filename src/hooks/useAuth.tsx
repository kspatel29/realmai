
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";

// Extend the User type to include metadata properties
interface UserWithMetadata extends User {
  name?: string;
}

interface AuthContextType {
  user: UserWithMetadata | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: { name?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserWithMetadata | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Helper function to extract and add name to user object
  const formatUser = (session: Session | null): UserWithMetadata | null => {
    if (!session || !session.user) return null;
    
    // Create a new user object with the name from metadata
    const formattedUser: UserWithMetadata = {
      ...session.user,
      name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || ''
    };
    
    return formattedUser;
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);

        // Handle different auth events
        switch (event) {
          case 'SIGNED_IN':
            console.log("User signed in successfully");
            setSession(session);
            setUser(formatUser(session));
            setIsLoading(false);
            break;
          case 'SIGNED_OUT':
            console.log("User signed out");
            setSession(null);
            setUser(null);
            setIsLoading(false);
            break;
          case 'TOKEN_REFRESHED':
            console.log("Token refreshed");
            setSession(session);
            setUser(formatUser(session));
            break;
          case 'USER_UPDATED':
            console.log("User updated");
            setSession(session);
            setUser(formatUser(session));
            break;
          default:
            setSession(session);
            setUser(formatUser(session));
            setIsLoading(false);
        }
      }
    );

    // Get initial session
    const initializeAuth = async () => {
      try {
        console.log("Initializing authentication...");
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Error getting initial session:", error);
          // Don't throw here, just log and continue
        } else {
          console.log("Initial session:", session?.user?.email || "No session");
          setSession(session);
          setUser(formatUser(session));
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        // Clear any potentially corrupted session data
        setSession(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log("Attempting login with email:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error("Login error:", error);
        throw new Error(error.message);
      }
      
      if (!data?.user) {
        throw new Error("User not found");
      }
      
      console.log("Login successful for:", data.user.email);
      toast.success("Logged in successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Authentication error:", error);
      toast.error(error instanceof Error ? error.message : "Login failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log("Attempting signup with email:", email);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      });

      if (error) {
        console.error("Signup error:", error);
        throw error;
      }

      console.log("Signup result:", data);

      // Check if email confirmation is required
      if (data.user && !data.session) {
        toast.success("Account created successfully! Please check your email for verification.");
      } else if (data.session) {
        toast.success("Account created and logged in successfully!");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error(error instanceof Error ? error.message : "Signup failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log("Attempting logout");
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Logout error:", error);
        throw error;
      }
      
      console.log("Logout successful");
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error(error instanceof Error ? error.message : "Logout failed");
    }
  };

  // Add the updateProfile method
  const updateProfile = async (data: { name?: string }) => {
    try {
      console.log("Updating profile:", data);
      
      const { error } = await supabase.auth.updateUser({
        data: {
          name: data.name
        }
      });
      
      if (error) {
        console.error("Profile update error:", error);
        throw error;
      }
      
      // Update the local user state
      if (session && user) {
        const updatedUser = {
          ...user,
          user_metadata: {
            ...user.user_metadata,
            name: data.name
          }
        };
        setUser(updatedUser as UserWithMetadata);
      }
      
      console.log("Profile updated successfully");
      toast.success("Profile updated successfully");
      return Promise.resolve();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
      return Promise.reject(error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const RequireAuth = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("RequireAuth - isLoading:", isLoading, "isAuthenticated:", isAuthenticated, "user:", user?.email);

    if (!isLoading && !isAuthenticated) {
      console.log("User not authenticated, redirecting to signin");
      navigate("/signin", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log("User not authenticated, showing null");
    return null;
  }

  return <>{children}</>;
};
