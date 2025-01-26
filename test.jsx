import React, {Suspense, lazy} from 'react';

const

const ProtectedRoute = ({ element, ...rest }) => {
  const isAuthenticated = /*authentication logic*/;

 return isAuthenticated ? element : <Navigate to='/login'/>
}

<Route path='/protectedPath' element={<ProtectedRoute element={<ProtectedPage />}/>}></Route>