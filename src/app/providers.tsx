'use client'; 
// "use client" because we need to run client-side code (the Redux <Provider> is a client-side component)

import { Provider } from 'react-redux';
import { store } from './store';
import AuthStateListener from './components/AuthStateListener';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthStateListener>
        {children}
      </AuthStateListener>
    </Provider>
  );
}
