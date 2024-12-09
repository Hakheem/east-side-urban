import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
isLoading: false,
    addresses: [],
  error: null,
};

export const addNewAddress = createAsyncThunk('./addresses/addNewAddress', async(formData)=>{
  const response = await axios.post('http://localhost:5000/api/address/add', formData);

  return response.data
})


export const fetcAddresses = createAsyncThunk('./addresses/fetchAddresses', async(userId)=>{
  const response = await axios.get(`http://localhost:5000/api/address/get/${userId}`);

  return response.data
})


export const editAddress = createAsyncThunk('./addresses/addNewAddress', async(formData, userId, addressId)=>{
  const response = await axios.put(`http://localhost:5000/api/address/update/${userId}/${addressId}`, formData);

  return response.data
})

export const deleteAddress = createAsyncThunk('./addresses/addNewAddress', async(userId, addressId)=>{
  const response = await axios.delete(`http://localhost:5000/api/address/delete/${userId}/${addressId}}`);

  return response.data
})



const addressSlice = createSlice({
  name: 'address',
  initialState,
  reducers: {},
  extraReducers: (builder)=>{

builder.addCase(
  addNewAddress.pending,(state)=>{
    state.isLoading = true  
  }
)
.addCase(
  addNewAddress.fulfilled,(state)=>{
    state.isLoading = false
    state.addresses = action.payload.data  
  }
)
.addCase(
  addNewAddress.rejected,(state)=>{
    state.isLoading = false
    state.addresses = []  
  }
)

.addCase(
  fetcAddresses.pending,(state)=>{
    state.isLoading = true  
  }
)
.addCase(
  fetcAddresses.fulfilled,(state)=>{
    state.isLoading = false
    state.addresses = action.payload.data  
  }
)
.addCase(
  fetcAddresses.rejected,(state)=>{
    state.isLoading = false
    state.addresses = []  
  }
)


  },
})


export default addressSlice.reducer;