import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../store'; // Make sure this import path is correct

interface UserState {
  uid: string | null;
  email: string | null;
  displayName: string | null;
  provider: string | null; // Track which authentication method was used
  role: string | null; // Add role field for access control
  // Add any other user properties you want
}

const initialState: UserState = {
  uid: null,
  email: null,
  displayName: null,
  provider: null,
  role: null, // Initialize role as null
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserState>) => {
      state.uid = action.payload.uid;
      state.email = action.payload.email;
      state.displayName = action.payload.displayName;
      state.provider = action.payload.provider;
      state.role = action.payload.role; // Set role from payload
    },
    clearUser(state) {
      state.uid = null;
      state.email = null;
      state.displayName = null;
      state.provider = null;
      state.role = null; // Clear role when user logs out
    },
    // Add a specific action to update user role
    setUserRole(state, action: PayloadAction<string | null>) {
      state.role = action.payload;
    },
  },
});

// Add this selector
export const selectUser = (state: RootState) => state.user;
// Add a specific selector for role checks
export const selectUserRole = (state: RootState) => state.user.role;

export const { setUser, clearUser, setUserRole } = userSlice.actions;
export default userSlice.reducer;
