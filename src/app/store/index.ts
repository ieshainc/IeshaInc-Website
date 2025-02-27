import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import documentsReducer from './slices/documentsSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    documents: documentsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore non-serializable values in the specified paths
        ignoredActions: ['documents/fetchUserDocuments/fulfilled'],
        ignoredPaths: ['documents.items']
      },
    }),
});

// Types for convenience (if using TypeScript)
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
