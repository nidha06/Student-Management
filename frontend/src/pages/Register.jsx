import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    class: '',
    admissionNumber: '',
    email: '',
    password: '',
  });
    const navigate = useNavigate();
  const [profilePic, setProfilePic] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const nameRegex = /^[a-zA-Z\s]{2,}$/;
    
    if (!formData.name.trim()) newErrors.name = 'Name required';
    else if (!nameRegex.test(formData.name)) newErrors.name = 'Invalid name format';
    
    if (!formData.age) newErrors.age = 'Age required';
    else if (formData.age < 5 || formData.age > 25) newErrors.age = 'Age must be 5-25';
    
    if (!formData.class.trim()) newErrors.class = 'Class required';
    
    if (!formData.admissionNumber.trim()) newErrors.admissionNumber = 'Admission number required';
    else if (formData.admissionNumber.length < 4) newErrors.admissionNumber = 'Min 4 characters';
    
    if (!formData.email) newErrors.email = 'Email required';
    else if (!emailRegex.test(formData.email)) newErrors.email = 'Invalid email';
    
    if (!formData.password) newErrors.password = 'Password required';
    else if (formData.password.length < 8) newErrors.password = 'Min 8 characters';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Need uppercase, lowercase & number';
    }
    
    if (!profilePic) newErrors.profilePic = 'Profile picture required';
    else if (profilePic.size > 5 * 1024 * 1024) newErrors.profilePic = 'File too large (max 5MB)';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setProfilePic(file);
    
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl('');
    }
    
    if (errors.profilePic) {
      setErrors({ ...errors, profilePic: '' });
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validate()) return;
  
  setLoading(true);
  setError('');

  try {
    // Replace with your actual API endpoint
    console.log(formData, 'formData');
    const response = await fetch('/api/student/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData), // Include form data and profile pic
    });

    if (response.ok) {
      const data = await response.json();
      
      // Store the token (adjust based on your API response structure)
      localStorage.setItem('token', data.token);
      // or sessionStorage.setItem('token', data.token);
      
      navigate('/profile');
    } else {
      setError('Registration failed');
    }
  } catch (error) {
    setError('Registration failed: ' + error.message);
  } finally {
    setLoading(false);
  }
};

  const inputStyle = (hasError) => ({
    padding: '12px',
    fontSize: '16px',
    borderRadius: '6px',
    border: `2px solid ${hasError ? '#ef4444' : '#d1d5db'}`,
    outline: 'none',
    transition: 'border-color 0.2s',
    width: '100%',
    boxSizing: 'border-box',
  });

  const ErrorMsg = ({ error }) => error && (
    <div style={{ color: '#ef4444', fontSize: '14px', marginTop: '5px' }}>{error}</div>
  );

  return (
    <div style={{
      margin:'0',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: '#fffff',
      padding: '20px',
    }}>
      <div style={{
        background: '#000000',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
        width: '100%',
        maxWidth: '500px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}>
        <h2 style={{ textAlign: 'center', margin: '0 0 10px', color: '#fffff' }}>
          Create Account
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              style={inputStyle(errors.name)}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = errors.name ? '#ef4444' : '#d1d5db'}
            />
            <ErrorMsg error={errors.name} />
          </div>

          <div>
            <input
              type="number"
              name="age"
              placeholder="Age"
              value={formData.age}
              onChange={handleChange}
              style={inputStyle(errors.age)}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = errors.age ? '#ef4444' : '#d1d5db'}
            />
            <ErrorMsg error={errors.age} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <input
              type="text"
              name="class"
              placeholder="Class"
              value={formData.class}
              onChange={handleChange}
              style={inputStyle(errors.class)}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = errors.class ? '#ef4444' : '#d1d5db'}
            />
            <ErrorMsg error={errors.class} />
          </div>

          <div>
            <input
              type="text"
              name="admissionNumber"
              placeholder="Admission Number"
              value={formData.admissionNumber}
              onChange={handleChange}
              style={inputStyle(errors.admissionNumber)}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = errors.admissionNumber ? '#ef4444' : '#d1d5db'}
            />
            <ErrorMsg error={errors.admissionNumber} />
          </div>
        </div>

        <div>
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            style={inputStyle(errors.email)}
            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
            onBlur={(e) => e.target.style.borderColor = errors.email ? '#ef4444' : '#d1d5db'}
          />
          <ErrorMsg error={errors.email} />
        </div>

        <div>
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            style={inputStyle(errors.password)}
            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
            onBlur={(e) => e.target.style.borderColor = errors.password ? '#ef4444' : '#d1d5db'}
          />
          <ErrorMsg error={errors.password} />
        </div>

        <div>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{
                  ...inputStyle(errors.profilePic),
                  padding: '8px 12px',
                  fontSize: '14px',
                }}
              />
              <ErrorMsg error={errors.profilePic} />
            </div>
            
            {previewUrl && (
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '8px',
                overflow: 'hidden',
                border: '2px solidrgb(2, 2, 3)',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <img
                  src={previewUrl}
                  alt="Profile preview"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    border:'#000000'
                  }}
                />
              </div>
            )}
          </div>
          
          {!previewUrl && profilePic && (
            <div style={{
              marginTop: '10px',
              fontSize: '14px',
              color: '#6b7280',
              fontStyle: 'italic'
            }}>
              Selected: {profilePic.name}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '12px',
            background: loading ? '#fffff' : '#ffffff',
            color: 'black',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: '600',
            // cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s',
          }}
         
          onClick={handleSubmit}
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>

        {error && (
          <div style={{
            color: '#ef4444',
            textAlign: 'center',
            fontSize: '14px',
            padding: '10px',
            background: '#fee2e2',
            borderRadius: '6px'
          }}>
            {error}
          </div>
        )}

        <p style={{ textAlign: 'center', margin: '10px 0 0', fontSize: '14px', color: '#6b7280' }}>
          Already have an account?{' '}
          <span
            style={{ color: '#3b82f6', cursor: 'pointer', fontWeight: '600' }}
            // onClick={() => alert('Navigate to login (demo)')}
          >
           <a href="http://localhost:5173/login">Sign in</a> 
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;