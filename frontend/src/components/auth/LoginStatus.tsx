// 'use client';

// import React, { useState, useEffect } from 'react';
// import { useAuth } from '@/hooks/useAuth';
// import { AuthStorage } from '@/lib/auth-storage';
// import { formatTimeRemaining } from '@/lib/auth-middleware';

// // Login Status Indicator Component
// export const LoginStatusIndicator: React.FC = () => {
//   const { user, isAuthenticated, logout } = useAuth();
//   const [timeUntilExpiry, setTimeUntilExpiry] = useState<number>(0);

//   useEffect(() => {
//     if (!isAuthenticated) return;

//     const updateTimer = () => {
//       const time = AuthStorage.getTimeUntilExpiry();
//       setTimeUntilExpiry(time);
//     };

//     updateTimer();
//     const interval = setInterval(updateTimer, 1000);

//     return () => clearInterval(interval);
//   }, [isAuthenticated]);

//   if (!isAuthenticated || !user) {
//     return (
//       <div className="flex items-center space-x-2 text-red-600">
//         <div className="w-2 h-2 bg-red-500 rounded-full"></div>
//         <span className="text-sm">Not logged in</span>
//       </div>
//     );
//   }

//   const isExpiringSoon = timeUntilExpiry <= 5 * 60 * 1000; // 5 minutes

//   return (
//     <div className="flex items-center space-x-3">
//       <div className="flex items-center space-x-2">
//         <div className={`w-2 h-2 rounded-full ${isExpiringSoon ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
//         <span className="text-sm text-gray-700">
//           Logged in as <span className="font-medium">{user.firstName} {user.lastName}</span>
//         </span>
//       </div>
      
//       {isExpiringSoon && (
//         <div className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
//           Session expires in {formatTimeRemaining(timeUntilExpiry)}
//         </div>
//       )}
      
//       <button
//         onClick={logout}
//         className="text-xs text-gray-500 hover:text-red-600 transition-colors"
//       >
//         Logout
//       </button>
//     </div>
//   );
// };

// // User Profile Dropdown Component
// export const UserProfileDropdown: React.FC = () => {
//   const { user, isAuthenticated, logout } = useAuth();
//   const [isOpen, setIsOpen] = useState(false);

//   if (!isAuthenticated || !user) {
//     return null;
//   }

//   const getRoleBadgeColor = (role: string) => {
//     switch (role) {
//       case 'admin':
//         return 'bg-red-100 text-red-800';
//       case 'event_organizer':
//         return 'bg-blue-100 text-blue-800';
//       default:
//         return 'bg-gray-100 text-gray-800';
//     }
//   };

//   return (
//     <div className="relative">
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
//       >
//         <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
//           {user.firstName.charAt(0)}{user.lastName.charAt(0)}
//         </div>
//         <div className="text-left">
//           <div className="text-sm font-medium text-gray-900">
//             {user.firstName} {user.lastName}
//           </div>
//           <div className="text-xs text-gray-500">{user.email}</div>
//         </div>
//         <svg
//           className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
//           fill="none"
//           stroke="currentColor"
//           viewBox="0 0 24 24"
//         >
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//         </svg>
//       </button>

//       {isOpen && (
//         <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
//           <div className="p-4 border-b border-gray-200">
//             <div className="flex items-center space-x-3">
//               <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
//                 {user.firstName.charAt(0)}{user.lastName.charAt(0)}
//               </div>
//               <div>
//                 <div className="font-medium text-gray-900">
//                   {user.firstName} {user.lastName}
//                 </div>
//                 <div className="text-sm text-gray-500">{user.email}</div>
//                 <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${getRoleBadgeColor(user.role)}`}>
//                   {user.role.replace('_', ' ')}
//                 </span>
//               </div>
//             </div>
//           </div>
          
//           <div className="p-2">
//             <button
//               onClick={() => {
//                 setIsOpen(false);
//                 // Navigate to profile page
//                 window.location.href = '/profile';
//               }}
//               className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
//             >
//               View Profile
//             </button>
            
//             <button
//               onClick={() => {
//                 setIsOpen(false);
//                 // Navigate to settings page
//                 window.location.href = '/settings';
//               }}
//               className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
//             >
//               Settings
//             </button>
            
//             <hr className="my-2" />
            
//             <button
//               onClick={() => {
//                 setIsOpen(false);
//                 logout();
//               }}
//               className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
//             >
//               Sign Out
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // Session Warning Modal Component
// interface SessionWarningModalProps {
//   isVisible: boolean;
//   timeLeft: number;
//   onExtend: () => void;
//   onLogout: () => void;
// }

// export const SessionWarningModal: React.FC<SessionWarningModalProps> = ({
//   isVisible,
//   timeLeft,
//   onExtend,
//   onLogout,
// }) => {
//   if (!isVisible) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
//         <div className="flex items-center space-x-3 mb-4">
//           <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
//             <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
//             </svg>
//           </div>
//           <div>
//             <h3 className="text-lg font-medium text-gray-900">Session Expiring Soon</h3>
//             <p className="text-sm text-gray-500">Your session will expire in {formatTimeRemaining(timeLeft)}</p>
//           </div>
//         </div>
        
//         <p className="text-gray-700 mb-6">
//           Would you like to extend your session or log out now?
//         </p>
        
//         <div className="flex space-x-3">
//           <button
//             onClick={onExtend}
//             className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
//           >
//             Extend Session
//           </button>
//           <button
//             onClick={onLogout}
//             className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
//           >
//             Log Out
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Simple Login Status Badge
// export const LoginStatusBadge: React.FC = () => {
//   const { isAuthenticated, user } = useAuth();

//   if (!isAuthenticated) {
//     return (
//       <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
//         <div className="w-1.5 h-1.5 bg-red-400 rounded-full mr-1.5"></div>
//         Offline
//       </span>
//     );
//   }

//   return (
//     <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
//       <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5"></div>
//       Online as {user?.role}
//     </span>
//   );
// };

// // Authentication Status Hook
// export const useAuthStatus = () => {
//   const { isAuthenticated, user } = useAuth();
//   const [sessionTimeLeft, setSessionTimeLeft] = useState<number>(0);
//   const [isExpiringSoon, setIsExpiringSoon] = useState(false);

//   useEffect(() => {
//     if (!isAuthenticated) return;

//     const updateStatus = () => {
//       const timeLeft = AuthStorage.getTimeUntilExpiry();
//       setSessionTimeLeft(timeLeft);
//       setIsExpiringSoon(timeLeft <= 5 * 60 * 1000); // 5 minutes
//     };

//     updateStatus();
//     const interval = setInterval(updateStatus, 1000);

//     return () => clearInterval(interval);
//   }, [isAuthenticated]);

//   return {
//     isAuthenticated,
//     user,
//     sessionTimeLeft,
//     isExpiringSoon,
//     formattedTimeLeft: formatTimeRemaining(sessionTimeLeft),
//   };
// };