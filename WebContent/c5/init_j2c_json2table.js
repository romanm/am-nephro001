var init_j2c_json2table = function($scope, $http, $filter){
	console.log('-------init_j2c_json2table-------')
	$scope.pageVar.config.tab2 = 'table_structur_sql'
	$scope.pageVar.config.tab2s = [
		{tab2:'table_structur_sql',fa:'wrench',},
		{tab2:'table_data_sql',fa:'th-list',},
	]
	console.log($scope.pageVar.config)
	$scope.create_tables = {}
	$scope.create_tables.col_keys = {}
	$scope.create_tables.col_keys.doc_id='ІН',
//	$scope.create_tables.col_keys.tablename='Таблиця',
	$scope.create_tables.col_keys.value='Колонка',
	$scope.create_tables.col_keys.doctype='Тип даних',

	console.log($scope.create_tables)
}
