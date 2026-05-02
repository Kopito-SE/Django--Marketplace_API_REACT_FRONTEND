import axiosInstance from './axiosConfig';

export const createVendorStore = async (storeData) => {
    const response = await axiosInstance.post('/vendors/create-store/', storeData);
    return response.data;
};