// import React from 'react'
// import { ThemeProvider } from './ThemeContext.jsx'
// import { createRoot } from 'react-dom/client'
// import { BrowserRouter } from 'react-router-dom'
// import App from './App'
// import './index.css'

// const container = document.getElementById('root')
// const root = createRoot(container)
// root.render(
//   <React.StrictMode>

//     <BrowserRouter>
//       <ThemeProvider>
//         <App />
//       </ThemeProvider>
//     </BrowserRouter>
//   </React.StrictMode>
// )
import React from 'react';
import { ThemeProvider } from './ThemeContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        {/* AuthProvider must be inside BrowserRouter to use useNavigate */}
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);