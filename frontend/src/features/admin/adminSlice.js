import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

//const token = localStorage.getItem('adminToken');


export const loginAdmin = createAsyncThunk('admin/login', async (credentials, thunkAPI) => {
  try {
    const { data } = await axios.post('http://localhost:5000/api/admin/login', credentials);
    localStorage.setItem('adminToken', data.token);
    return data.token;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.message);
  }
});


// Fetch All Students
export const fetchStudents = createAsyncThunk('admin/fetchStudents', async (search = '', thunkAPI) => {
  try {
    const token = localStorage.getItem('adminToken');
    const { data } = await axios.get(`http://localhost:5000/api/admin/students?search=${search}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.message);
  }
});

// export const createStudent = createAsyncThunk('admin/createStudent', async (studentData, thunkAPI) => {
//   try {
//     const token = localStorage.getItem('adminToken');
//     const { data } = await axios.post('http://localhost:5000/api/admin/students', studentData, {
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     return data;
//   } catch (error) {
//     return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to create student');
//   }
// });

export const createStudent = createAsyncThunk(
  'admin/createStudent',
  async (formData, { getState, rejectWithValue }) => {
    try {
      const token = getState().admin.token;
      const response = await axios.post('http://localhost:5000/api/admin/students', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data', // important!
        },
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response.data?.error || 'Failed to create student');
    }
  }
);


export const updateStudent = createAsyncThunk('admin/updateStudent', async ({ id, updatedData }, thunkAPI) => {
  try {
    const token = localStorage.getItem('adminToken');
    const { data } = await axios.put(`http://localhost:5000/api/admin/students/${id}`, updatedData, {
      headers: { Authorization: `Bearer ${token}`,
      'Content-Type ': 'multipart/form-data' },
    });
    return data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to update student');
  }
});

// Delete Student
export const deleteStudent = createAsyncThunk('admin/deleteStudent', async (id, thunkAPI) => {
  try {
    const token = localStorage.getItem('adminToken');
    await axios.delete(`http://localhost:5000/api/admin/students/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return id;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to delete student');
  }
});

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    token: localStorage.getItem('adminToken') || null,
    students: [],
    loading: false,
    error: null,
  },
  reducers: {
    logoutAdmin: (state) => {
      state.token = null;
      state.students = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.token = action.payload;
        state.error = null;
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(fetchStudents.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.students = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
         // Create student
         .addCase(createStudent.fulfilled, (state, action) => {
          state.students.push(action.payload);
          state.error = null;
        })
        .addCase(createStudent.rejected, (state, action) => {
          state.error = action.payload;
        })
           // Update student
      .addCase(updateStudent.fulfilled, (state, action) => {
        const index = state.students.findIndex((s) => s._id === action.payload._id);
        if (index !== -1) {
          state.students[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateStudent.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Delete student
      .addCase(deleteStudent.fulfilled, (state, action) => {
        state.students = state.students.filter((s) => s._id !== action.payload);
        state.error = null;
      })
      .addCase(deleteStudent.rejected, (state, action) => {
        state.error = action.payload;
      });

  },
});

export const { logoutAdmin } = adminSlice.actions;
export default adminSlice.reducer;
