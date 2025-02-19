import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../store'; // Make sure this import path is correct

interface UserState {
  uid: string | null;
  email: string | null;
  displayName: string | null;
  // Add any other user properties you want
}

const initialState: UserState = {
  uid: null,
  email: null,
  displayName: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserState>) => {
      state.uid = action.payload.uid;
      state.email = action.payload.email;
      state.displayName = action.payload.displayName;
    },
    clearUser(state) {
      state.uid = null;
      state.email = null;
      state.displayName = null;
    },
  },
});

// Add this selector
export const selectUser = (state: RootState) => state.user;

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
