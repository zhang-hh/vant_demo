<template>
    <div>
        <van-contact-card
                :type="cardType"
                :name="currentContact.name"
                :tel="currentContact.tel"
                @click="showList = true"
        />
        <!-- 联系人列表 -->
        <van-popup v-model="showList" position="bottom"> <!--v-model组件是否显示-->
            <van-contact-list
                    v-model="chosenContactId"
                    :list="list"
                    default-tag-text="东北彭于晏"
                    @add="onAdd"
                    @edit="onEdit"
                    @select="onSelect"
            />
        </van-popup>

        <!-- 新建联系人之后显示联系人编辑 -->
        <van-popup v-model="showEdit" position="bottom">
            <van-contact-edit
                    :contact-info="editingContact"
                    :is-edit="isEdit"
                    :tel-validator="validator"
                    :show-set-default="true"
                    set-default-label="设为默认联系人"
                    @save="onSave"
                    @delete="onDelete"
            />
            <!--onSave(info){} onDelete(info){}点击保存和删除按钮都会自定把表单的信息传递过去-->
        </van-popup>
    </div>
</template>

<script>
	import { ContactCard, ContactList, ContactEdit,Popup} from 'vant';
	import {reqAdd, reqAddPerson, reqDelete, reqEdit, reqGetList} from "../../api";
	const OK = 200;
	export default {
		name: 'Contact',
		data() {
			return {
				chosenContactId: null, //选中的id
				editingContact: {}, //数据回显的时候的联系人信息
				showList: false, //是否显示联系人列表,默认不弹出
				showEdit: false,//默认情况下编辑弹出层不显示
				isEdit: false,//编辑页面的出现的时候,是为修改联系人(有保存和删除按钮)还是新增联系人(只有保存按钮)
				list: [
					//手机号,邮政编码是string类型 ,会报错 xxxx.trim is a not function
					// {name: '张三', tel: '13000000000', id: 0}, //isDefault:true默认联系人和被选中不是同一件事
				]
			};
		},
		components: {
			[ContactCard.name]:ContactCard, //联系人卡片
			[ContactList.name]:ContactList, //
			[ContactEdit.name]:ContactEdit,
			[Popup.name]:Popup, //弹出层
		},
		computed: {
			cardType() {
				/*这是一个计算属性,依赖于chosenContactId 当id不为null的是修改联系人的类型*/
				return this.chosenContactId !== null ? 'edit' : 'add';
			},

			currentContact() {
				/*这是一个计算属性,currentContact 依赖了list和chosenContactId
                *   在save的时候,list产生改变,所以currentContact会 重新计算*/
				const id = this.chosenContactId;
				//this.list.filter(item => item.id === id)返回的是一个数组[item]
				//加上[item][0] 就是item这个对象 ,然后将item进行显示
				return id !== null ? this.list.filter(item => item.id === id)[0] : {};
			}
		},

		methods: {
			// 添加联系人
			onAdd() {
				this.editingContact = {};//在点击新建联系人的时候给保存联系人info里面带上了id属性,数据库里面自动生成id
				this.isEdit = false; //代表当前为新建联系人,不会出现删除按钮
				this.showEdit = true; //会让编辑层显示
			},

			// 编辑联系人
			onEdit(item) {
				this.isEdit = true;
				this.showEdit = true;
				this.editingContact = item;
			},

			// 选中联系人
			onSelect() {
				this.showList = false;
			},

			// 保存联系人
			async onSave(info) {
				//console.log(info);//所有的表单信息,info中已经有了id,这个id是在新建联系人的传的
				this.showEdit = false;//点击保存的时候就不显示编辑页了
				this.showList = false;//点击保存的时候就不显示联系人列表了
				let result='';
				/*如果从新增联系人过来的,那么isEdit为false,进入不了判断(数据驱动的思想)*/
				if (this.isEdit) {
					//   修改时逻辑   map方法中的回调函数会执行list.length次
					this.list = this.list.map(item => item.id === info.id ? info : item);
					result = await reqEdit (info)
				} else {
					// 新增时逻辑  list数据发生变化,那么list所对应的界面要重新更新
					// this.list.push(info);
					/*注意：const和let是块级作用域不能再下边使用result的id，要先在前面定义*/
                    //result = await reqAdd(info.name,info.tel) Json格式
                    let fromData = new FormData();
					fromData.append('name',info.name)
					fromData.append('tel',info.tel)
					/*fromData是一个表单对象当axios遇到formdata的的时候会自动转成content-type:form-data形式*/
                    result = await reqAddPerson(fromData);
					console.log(result)
				}
				//我们在这里同步了数据库，但是忘记更新list，就导致数据库虽然存在，
				// 但是在界面上查询id却查询不到，chosenContactId变化就会导致计算属性出问题是从空数组中拿第一个
				//也就是undefined身上读取name
				await this.getContactList(); //这是一次异步的更新

				/*这句话是在this.getContactList()之后执行,async的函数返回的依然是一个Promise实例,
				在他成功的执行之后,执行下边的语句 ,async函数是同步执行,但会把await要等待一个promise,
				只有promise成功的时候,才会执行后面的函数 */
				this.chosenContactId = result.data.id;
			},

			// 删除联系人
			async onDelete(info) {
				this.showEdit = false; //将编辑页关闭,但是联系人列表页面不会关闭
				//this.list = this.list.filter(item => item.id !== info.id); //list=[]
				//如果删除的是选中的哪一项,就把选中的id变为null,那么那两个计算属性就会重新计算
				let result = await reqDelete(info.id)
                const {code} = result;

				if (this.chosenContactId === info.id) {
					this.chosenContactId = null; //删除选中的才会进入判断
				}
				/*加上await 这行代码就先执行了,this.getContactList()函数更改了list的值
                * 计算属性currentContact依赖list的值,要重新计算。在删除选中的时候会报错,
                * 因为你删除了,但是没有将选中的id置为null 那么他去计算时候的时候 id !== null 返回了true
                * 就要在filter返回的数组中拿第一个值,但是由于list已经更新了,没有与之对应的id,
                * 就返回了[][0]值为undefined,那么在计算属性undefined身上读取name属性就会报错*/

				/*解决方案,必须要this.chosenContactId = null;先执行*/
				//删除完要界面更新
                if (code===OK) await this.getContactList();

			},

			//  手机号的校验函数
			validator(){
				//默认会将手机号传入
				return true;
			},

			async getContactList(){
				let result = await reqGetList();
				const {code,data} = result;
				if (code===OK) this.list = data
			},
		},
		mounted() {
			this.getContactList()
		}
	}
</script>

<style scoped>

</style>