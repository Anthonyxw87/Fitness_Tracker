// // useAuth.js
// import { useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';

// const useAuth = (userData, setIsLoading) => {
//   const navigate = useNavigate();

//   useEffect(() => {
//     const token = localStorage.getItem('token');

//     if (!token) {
//       navigate('/');
//       setIsLoading(false);
//     } else {
//       // Send request to server to verify token and retrieve user data
//       fetch('/retrieve-information', {
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       })
//       .then(response => {
//         if (response.ok) {
//           return response.json();
//         } else {
//           throw new Error('Failed to authenticate');
//         }
//       })
//       .then(data => {
//         setUserData(data);
//         setIsLoading(false);
//       })
//       .catch(error => {
//         console.error(error);
//         navigate('/');
//         setIsLoading(false);
//       });
//     }
//   }, [navigate, setIsLoading]);

//   return userData;
// };

// export default useAuth;
