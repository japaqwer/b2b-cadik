import { useState, useCallback } from "react";
import axios from "axios";

const API_BASE = "https://api-workhub.site/api/v1";

const useOrders = (isAuthenticated) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    size: 20,
    total: 0,
    totalPages: 0,
  });

  const fetchOrders = useCallback(
    async (page = 1, size = 20) => {
      if (!isAuthenticated) return;

      setLoading(true);
      setError(null);

      try {
        const token = getCookie("access_token");

        if (!token) {
          throw new Error("Не найден токен авторизации");
        }

        const response = await axios.get(
          `${API_BASE}/base/order/?referral=datki`,
          {
            params: {
              page,
              size,
            },
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.code === 200 && response.data.data) {
          setOrders(response.data.data.items || []);
          setPagination({
            page: response.data.data.page,
            size: response.data.data.size,
            total: response.data.data.total,
            totalPages: response.data.data.total_pages,
          });
        } else {
          throw new Error(response.data.msg || "Ошибка при загрузке данных");
        }
      } catch (err) {
        if (err.response?.status === 401) {
          setError("Истекла сессия, требуется повторная авторизация");
        } else {
          setError(
            err.response?.data?.msg ||
              err.message ||
              "Ошибка при загрузке заказов"
          );
        }
        setOrders([]);
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated]
  );

  const changePage = useCallback(
    (newPage) => {
      if (newPage >= 1 && newPage <= pagination.totalPages) {
        fetchOrders(newPage, pagination.size);
      }
    },
    [pagination.totalPages, pagination.size, fetchOrders]
  );

  return {
    orders,
    loading,
    error,
    pagination,
    fetchOrders,
    changePage,
  };
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

export default useOrders;
