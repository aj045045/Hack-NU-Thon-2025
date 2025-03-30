import { UserActions, UserState } from '@/interfaces/store';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';


export const useUserStore = create<UserState & UserActions>()(
    persist(
        (set) => ({
            id: '',
            email: '',
            name: '',
            login: (userData: UserState) => set((state) => ({
                id: userData.id || state.id,
                email: userData.email || state.email,
                name: userData.name || state.name,
            })),

            logOut: () => set(() => ({
                id: '',
                email: '',
                name: '',
            })),

        }),
        {
            name: 'login-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);