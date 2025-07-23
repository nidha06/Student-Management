import { createSlice } from "@reduxjs/toolkit";

const listSlice = createSlice({
  name: 'to-do list',
  initialState: { value: [] },
  reducers: {
    adding: (state, action) => {state.value.push(action.payload) }// Add new item to the list
    
  }
});

export const { adding } = listSlice.actions;
export default listSlice.reducer;
