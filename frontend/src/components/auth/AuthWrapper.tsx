// 'use client';

// import React, { useEffect, useState } from 'react';
// import { useAuth } from '@/hooks/useAuth';
// import { AuthMiddleware } from '@/lib/auth-middleware';
// import { SessionWarningModal } from './LoginStatus';

// // Auth Wrapper Component that handles all authentication logic
// export const AuthWrapperContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const { isAuthenticated, logout, refreshProfile } = useAuth();
//   const [showSessionWarning, setShowSessionWarning] = useState(false);
//   const [sessionTimeLeft, setSessionTimeLeft] = useState(0);

//   useEffect(() => {
//     if (!isAuthenticated) return;

//     // Initialize auth middleware
//     const authMiddleware = new AuthMiddleware({
//       onLogout: logout,
//       onWarning: (timeLeft: number) => {
//         setSessionTimeLeft(timeLeft);
//         setShowSessionWarning(true);
//       },
//       warningTime: 5 * 60 * 1000, // 5 minutes warning
//     });

//     // Start the middleware
//     authMiddleware.start();

//     // Cleanup on unmount
//     return () => {
//       authMiddleware.stop();
//     };
//   }, [isAuthenticated, logout]);

//   const handleExtendSession = async () => {
//     try {
//       // Try to refresh the profile
//       await refreshProfile();
//       setShowSessionWarning(false);
//     } catch (error) {
//       console.error('Failed to extend session:', error);
//       logout();
//     }
//   };

//   const handleLogoutFromWarning = () => {
//     setShowSessionWarning(false);
//     logout();
//   };

//   return (
//     <>
//       {children}
//       <SessionWarningModal
//         isVisible={showSessionWarning}
//         timeLeft={sessionTimeLeft}
//         onExtend={handleExtendSession}
//         onLogout={handleLogoutFromWarning}
//       />
//     </>
//   );
// };

// // Main Auth Wrapper - now just uses the content directly
// export const AuthWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   return <AuthWrapperContent>{children}</AuthWrapperContent>;
// };

// // HOC for pages that need authentication
// export const withAuthWrapper = <P extends object>(
//   Component: React.ComponentType<P>
// ): React.FC<P> => {
//   const WrappedComponent: React.FC<P> = (props) => {
//     return (
//       <AuthWrapper>
//         <Component {...props} />
//       </AuthWrapper>
//     );
//   };

//   WrappedComponent.displayName = `withAuthWrapper(${Component.displayName || Component.name})`;
  
//   return WrappedComponent;
// };