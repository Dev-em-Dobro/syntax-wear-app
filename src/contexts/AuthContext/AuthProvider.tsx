import { use, useEffect, useMemo, useState } from "react";
import {
  AuthContext,
  type Credentials,
  type RegisterInput,
  type User,
} from "./AuthContext";

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch("http://localhost:3000/auth/profile", {
          method: "GET",
          credentials: "include", // faz com que os cookies sejam enviados junto com a requisição
        });

        if (!response.ok) {
          throw new Error("Erro ao buscar perfil do usuário");
        }

        const data = await response.json();
        setUser(data.user);
        setIsAuthenticated(true);
      
        console.log(data.user);
        
      } catch (error) {
        console.error("Erro ao buscar perfil do usuário:", error);
        setUser(null);
        setIsAuthenticated(false);
      }
    };

    fetchUserProfile();
  }, []);

  async function signIn(credentials: Credentials): Promise<void> {
    const response = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      credentials: "include", // faz com que os cookies sejam enviados junto com a requisição
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erro ao fazer login");
    }

    setUser(data.user);
    setIsAuthenticated(true);
  }

  async function register(data: RegisterInput): Promise<void> {}

  function signOut(): void {
    setUser(null);
    setIsAuthenticated(false);
  }

  const value = {
    user,
    isAuthenticated,
    signIn,
    register,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
