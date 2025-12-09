import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useFavoritesStore = create(
  persist(
    (set, get) => ({
      favorites: [],

      // Добавить в избранное
      addFavorite: (item) => {
        const { favorites } = get();
        const exists = favorites.some((fav) => fav.id === item.id);
        if (!exists) {
          set({ favorites: [...favorites, item] });
        }
      },

      // Удалить из избранного
      removeFavorite: (id) => {
        const { favorites } = get();
        set({ favorites: favorites.filter((fav) => fav.id !== id) });
      },

      // Проверить, в избранном ли
      isFavorite: (id) => {
        const { favorites } = get();
        return favorites.some((fav) => fav.id === id);
      },

      // Очистить все избранное
      clearFavorites: () => {
        set({ favorites: [] });
      },

      // Получить количество избранных
      getFavoritesCount: () => {
        return get().favorites.length;
      },
    }),
    {
      name: "favorites-storage", // ключ в localStorage
    }
  )
);
