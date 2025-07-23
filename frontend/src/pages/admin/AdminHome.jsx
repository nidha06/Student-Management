// // src/pages/AdminHome.jsx
// import { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { deleteStudent, fetchStudents } from '../../features/admin/adminSlice';
// import { useNavigate } from 'react-router-dom';

// const AdminHome = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { students, loading, error, token } = useSelector((state) => state.admin);
//   const [search, setSearch] = useState('');

//   useEffect(() => {
//     if (!token) {
//       navigate('/admin/login');
//     } else {
//       dispatch(fetchStudents());
//     }
//   }, [dispatch, token]);

//   const handleSearch = () => {
//     dispatch(fetchStudents(search));
//   };
//   const handleDelete=(id)=>{
//     dispatch(deleteStudent())
//   }
//   return (
//     <div className="admin-home">
//       <h2>Admin Dashboard</h2>

//       <div style={{ display: 'flex', gap: '10px' }}>
//         <input
//           type="text"
//           placeholder="Search students..."
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//         />
//         <button onClick={handleSearch}>Search</button>
//         <button onClick={() => navigate('/admin/create')}>Create Student</button>
//       </div>

//       {loading ? (
//         <p>Loading...</p>
//       ) : error ? (
//         <p style={{ color: 'red' }}>{error}</p>
//       ) : (
//         <table border="1" cellPadding={10} style={{ marginTop: '20px' }}>
//           <thead>
//             <tr>
//               <th>Name</th>
//               <th>Email</th>
//               <th>Class</th>
//               <th>Admission No.</th>
//               <th>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {students.length > 0 ? (
//               students.map((stu) => (
//                 <tr key={stu._id}>
//                   <td>{stu.name}</td>
//                   <td>{stu.email}</td>
//                   <td>{stu.class}</td>
//                   <td>{stu.admissionNumber}</td>
//                   <td>
//                     <button onClick={() => navigate(`/admin/edit/${stu._id}`)}>Edit</button>
//                     <button onClick={() => {()=>handleDelete(stu._id)}}>Delete</button>
//                   </td>
//                 </tr>
//               ))
//             ) : (
//               <tr>
//                 <td colSpan="5">No students found.</td>
//               </tr>
//             )}
//           </tbody>
//         </table>
//       )}
//     </div>
//   );
// };

// export default AdminHome;
