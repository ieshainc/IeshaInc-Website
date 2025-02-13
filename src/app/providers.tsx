'use client'; 
// "use client" because we need to run client-side code (the Redux <Provider> is a client-side component)

import { Provider } from 'react-redux';
import { ReactNode } from 'react';
import { store } from '../app/store'; 

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return <Provider store={store}>{children}</Provider>;
}
