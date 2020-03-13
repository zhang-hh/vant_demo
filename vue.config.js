const path = require('path');
//__dirname是当前文件所在目录 vue_project
function resolve(dir){
	return path.join(__dirname,dir)
}
module.exports = {
	//代码修改了之后vue脚手架会自动进行编译
	/*true时候不会影响编译，代码的执行，只会在命令行中进行警告
	* error的时候，会中断编译，代码是无法运行的，在命令行也有警告*/
	lintOnSave:false, //跳过eslint代码检查
	//vue 脚手架的配置
	devServer:{
		open:true, //自动打开浏览器
	},
	//这是webpack的原生配置,在在这里是也可以写devServer属性但是和上边的devServer不是一回事
	configureWebpack:{
		resolve:{
			// 别名配置
			alias:{
				'@':resolve('src'),
				'components':resolve('src/components'),
				'pages':resolve('src/pages')
			}
		}
	},
};