import React, { createContext, useState, useEffect ,useContext} from "react";
type User = {
  uid: number;
  name: string;
  email: string;
  isAdmin: boolean; 
}

const AuthContext = createContext<{
  user: User | null;
  setUser: (user: User | null) => void;
  login: (userData: User) => void;
  logout: () => void;
}>({
  user: null,
  setUser: () => {},
  login: () => {},
  logout: () => {},
});

type AuthProviderProps = {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData)); // 로컬 스토리지에 유저 데이터 저장
  };
  
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user"); // 로컬 스토리지에서 유저 데이터 삭제
  };
  
  useEffect(() => {
    const fetchUser = async () => {
      const user_data = localStorage.getItem("user"); // 로컬 스토리지에서 유저 데이터 가져오기
  
      if (user_data) {
        setUser(JSON.parse(user_data)); // 유저 데이터를 다시 객체로 변환하고 setUser로 설정
      }
    };
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
