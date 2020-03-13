/*项目中的所有请求都由此发出*/
import myAxios  from './myAxios';
export const reqGetList =()=> myAxios.get('/contactList');
export const reqAdd =(name,tel)=> myAxios.post('/contact/new/json',{name,tel});
export const reqAddPerson =(fromData) => myAxios.post('/contact/new/form',fromData)
export const reqDelete = (id) => myAxios.delete('/contact',{params:{id}});
export const reqEdit = (data) => myAxios.put('/contact/edit',{...data});