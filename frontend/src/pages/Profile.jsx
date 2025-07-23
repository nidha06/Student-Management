import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [student, setStudent] = useState(null);
  const [formData, setFormData] = useState({});
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [imageFile, setImageFile] = useState(null);

  const navigate = useNavigate(); 

  const handleLogout = () => {
    // Clear both possible token keys
    localStorage.removeItem('studentToken');
    localStorage.removeItem('token');
    navigate('/');
  };

 // In your useEffect, change this part:

useEffect(() => {
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('studentToken');
      
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get('/api/student/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      console.log('Full response:', response.data); // Debug log

      // FIX: Access the nested student data
      const studentData = response.data.student;
      setStudent(studentData);
      
      // Initialize form data with the correct nested data
      setFormData({
        name: studentData.name,
        age: studentData.age,
        class: studentData.class,
        admissionNumber: studentData.admissionNumber,
        email: studentData.email
      });
      
      setError('');
    } catch (error) {
      console.error('Error fetching profile:', error);
      
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('studentToken');
        navigate('/login');
      } else {
        setError('Failed to load profile data');
      }
    } finally {
      setLoading(false);
    }
  };

  fetchProfile();
}, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSave = async () => {
    try {
      // Use consistent token key
      const token = localStorage.getItem('token') || localStorage.getItem('studentToken');
      const form = new FormData();
      form.append('name', formData.name);
      form.append('age', formData.age);
      form.append('class', formData.class);
      if (imageFile) form.append('profilePic', imageFile);
  
      const { data } = await axios.put('/api/student/profile', form, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
  
      setStudent((prev) => ({
        ...prev,
        ...formData,
        profilePic: imageFile ? data.student.profilePic : prev.profilePic,
      }));
  
      setEditing(false);
      setImageFile(null);
      setError('');
    } catch (err) {
      console.error("Update error:", err);
      setError('Failed to update profile');
    }
  };

  if (loading) return (
    <div style={loadingStyle}>
      <div style={spinnerStyle}></div>
      <p>Loading profile...</p>
    </div>
  );
  
  if (error) return (
    <div style={errorContainerStyle}>
      <p style={errorStyle}>{error}</p>
    </div>
  );

  // Add null check for student
  if (!student) return (
    <div style={errorContainerStyle}>
      <p style={errorStyle}>No profile data found</p>
    </div>
  );

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={titleStyle}>
          {student.name}'s Profile
        </h2>

        <div style={imageContainerStyle}>
          <img
            src={`http://localhost:5000/uploads/${student.profilePic}`}
            alt="Profile"
            width="150"
            height="150"
            style={profileImageStyle}
          />
        </div>

        {!editing ? (
          <div style={profileInfoStyle}>
            <div style={infoRowStyle}>
              <span style={labelStyle}>Name:</span>
              <span style={valueStyle}>{student.name}</span>
            </div>
            <div style={infoRowStyle}>
              <span style={labelStyle}>Age:</span>
              <span style={valueStyle}>{student.age}</span>
            </div>
            <div style={infoRowStyle}>
              <span style={labelStyle}>Class:</span>
              <span style={valueStyle}>{student.class}</span>
            </div>
            <div style={infoRowStyle}>
              <span style={labelStyle}>Admission Number:</span>
              <span style={valueStyle}>{student.admissionNumber}</span>
            </div>
            <div style={infoRowStyle}>
              <span style={labelStyle}>Email:</span>
              <span style={valueStyle}>{student.email}</span>
            </div>
            
            <div style={buttonContainerStyle}>
              <button onClick={() => setEditing(true)} style={primaryButtonStyle}>
                Edit Profile
              </button>
              <button onClick={handleLogout} style={secondaryButtonStyle}>
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div style={formStyle}>
            <div style={inputGroupStyle}>
              <label style={inputLabelStyle}>Name:</label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

            <div style={inputGroupStyle}>
              <label style={inputLabelStyle}>Age:</label>
              <input
                type="number"
                name="age"
                value={formData.age || ''}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

            <div style={inputGroupStyle}>
              <label style={inputLabelStyle}>Class:</label>
              <input
                type="text"
                name="class"
                value={formData.class || ''}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

            <div style={inputGroupStyle}>
              <label style={inputLabelStyle}>Admission Number:</label>
              <input
                type="text"
                value={formData.admissionNumber}
                disabled
                style={disabledInputStyle}
              />
            </div>

            <div style={inputGroupStyle}>
              <label style={inputLabelStyle}>Email:</label>
              <input
                type="email"
                value={formData.email}
                disabled
                style={disabledInputStyle}
              />
            </div>

            <div style={inputGroupStyle}>
              <label style={inputLabelStyle}>Change Profile Picture:</label>
              <input 
                type="file" 
                onChange={handleImageChange} 
                style={fileInputStyle}
                accept="image/*"
              />
            </div>

            <div style={buttonContainerStyle}>
              <button onClick={handleSave} style={saveButtonStyle}>
                Save Changes
              </button>
              <button onClick={() => setEditing(false)} style={cancelButtonStyle}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// All your existing styles remain the same...
const containerStyle = {
  minHeight: '100vh',
  backgroundColor: '#f8f9fa',
  padding: '20px',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const cardStyle = {
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  padding: '40px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  border: '1px solid #e5e7eb',
};

const titleStyle = {
  textAlign: 'center',
  marginBottom: '30px',
  fontSize: '32px',
  fontWeight: '700',
  color: '#000000',
  letterSpacing: '-0.5px',
};

const imageContainerStyle = {
  display: 'flex',
  justifyContent: 'center',
  marginBottom: '30px',
};

const profileImageStyle = {
  borderRadius: '50%',
  objectFit: 'cover',
  border: '4px solid #000000',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
};

const profileInfoStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
};

const infoRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '15px 0',
  borderBottom: '1px solid #e5e7eb',
};

const labelStyle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#000000',
  minWidth: '140px',
};

const valueStyle = {
  fontSize: '16px',
  color: '#4b5563',
  fontWeight: '400',
};

const buttonContainerStyle = {
  display: 'flex',
  gap: '15px',
  marginTop: '30px',
  justifyContent: 'center',
};

const primaryButtonStyle = {
  padding: '12px 24px',
  backgroundColor: '#000000',
  color: '#ffffff',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '16px',
  fontWeight: '600',
  transition: 'all 0.2s ease',
};

const secondaryButtonStyle = {
  padding: '12px 24px',
  backgroundColor: '#ffffff',
  color: '#000000',
  border: '2px solid #000000',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '16px',
  fontWeight: '600',
  transition: 'all 0.2s ease',
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
};

const inputGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const inputLabelStyle = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#000000',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const inputStyle = {
  width: '100%',
  padding: '12px 16px',
  fontSize: '16px',
  borderRadius: '8px',
  border: '2px solid #e5e7eb',
  backgroundColor: '#ffffff',
  color: '#000000',
  transition: 'border-color 0.2s ease',
};

const disabledInputStyle = {
  ...inputStyle,
  backgroundColor: '#f3f4f6',
  color: '#6b7280',
  cursor: 'not-allowed',
};

const fileInputStyle = {
  padding: '8px',
  fontSize: '14px',
  border: '2px dashed #e5e7eb',
  borderRadius: '8px',
  backgroundColor: '#f9fafb',
  cursor: 'pointer',
};

const saveButtonStyle = {
  padding: '12px 24px',
  backgroundColor: '#000000',
  color: '#ffffff',
  border: 'none',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '16px',
  fontWeight: '600',
  transition: 'all 0.2s ease',
};

const cancelButtonStyle = {
  padding: '12px 24px',
  backgroundColor: '#ffffff',
  color: '#000000',
  border: '2px solid #000000',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '16px',
  fontWeight: '600',
  transition: 'all 0.2s ease',
};

const loadingStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  backgroundColor: '#f8f9fa',
  color: '#000000',
  fontSize: '18px',
  fontWeight: '500',
};

const spinnerStyle = {
  width: '40px',
  height: '40px',
  border: '4px solid #e5e7eb',
  borderTop: '4px solid #000000',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
  marginBottom: '20px',
};

const errorContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  backgroundColor: '#f8f9fa',
};

const errorStyle = {
  color: '#000000',
  fontSize: '18px',
  fontWeight: '600',
  padding: '20px',
  backgroundColor: '#ffffff',
  border: '2px solid #000000',
  borderRadius: '8px',
};

export default Profile;