import { useState, useCallback, useEffect } from "react";
import axios from "axios";

const API_BASE = "https://api-workhub.site/api/v1";

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      const token = getCookie("access_token");
      setIsAuthenticated(!!token);
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${API_BASE}/auth/login`,
        {
          email,
          password,
        },
        {
          //   withCredentials: true, // Включаем cookies в запрос и ответ
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.data?.access_token) {
        setCookie("access_token", response.data.data.access_token, 24);
        setIsAuthenticated(true);
        return true;
      }

      throw new Error(response.data.msg || "Неверные учетные данные");
    } catch (err) {
      const errorMessage =
        err.response?.data?.msg || err.message || "Ошибка при входе";
      setError(errorMessage);
      setIsAuthenticated(false);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    deleteCookie("access_token");
    setIsAuthenticated(false);
    setError(null);
  }, []);

  const getToken = useCallback(() => {
    return getCookie("access_token");
  }, []);

  return {
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    getToken,
  };
};

// Утилиты для работы с cookies
const setCookie = (name, value, hours = 24) => {
  const date = new Date();
  date.setTime(date.getTime() + hours * 60 * 60 * 1000);
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/`;
};

const getCookie = (name) => {
  const nameEQ = `${name}=`;
  const cookies = document.cookie.split(";");

  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.indexOf(nameEQ) === 0) {
      return cookie.substring(nameEQ.length);
    }
  }

  return null;
};

const deleteCookie = (name) => {
  setCookie(name, "", -1);
};

export default useAuth;
