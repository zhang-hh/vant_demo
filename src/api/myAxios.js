import axios from 'axios';

const instance = axios.create({baseURL:'http://localhost:9000/api'});

instance.interceptors.request.use((config) =>{
    return config;
});
instance.interceptors.response.use((response) =>{
    
    return response.data;
},(error) =>{
    return new Promise(() => {})
})
export default instance;