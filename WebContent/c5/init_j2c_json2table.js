var init_j2c_json2table = function($scope, $http, $filter, $interval){
	console.log('-------init_j2c_json2table-------')
	$scope.pageVar.config.tab2 = 'table_structur_sql'
	$scope.pageVar.config.tab2s = [
		{tab2:'table_structur_sql',fa:'wrench',},
		{tab2:'table_data_sql',fa:'th-list',},
	]
	console.log($scope.pageVar.config)
	$scope.edit_table = {}
	$scope.edit_table.saveEditRow = function(){
		console.log(this)
		console.log(this.editRow)
		if(this.editRow.row_id){
			updateRow(this.editRow)
		}else{//INSERT row
			updateRow(this.editRow, true)
		}
	}
	sql_1c.select_row = function(table_join_select, row_id){
		var sql = "SELECT * FROM (\n" + table_join_select +"\n" +") x WHERE row_id=:nextDbId1"
		if(row_id){sql = sql.replace(/:nextDbId1/,row_id)}
		return sql
	}
	sql_1c.insertCell = function(row_id, columnId, i){
		var sql = "INSERT INTO doc (doctype, doc_id, parent, reference ) " +
		"VALUES (5, :nextDbId" +i +", :nextDbId1, "+columnId +" );\n"
		if(row_id){sql = sql.replace(/:nextDbId1/,row_id)}
		return sql
	}
	var updateRow = function(editRow, isInsertRow){
		var sql = '', i = 2
		angular.forEach(editRow, function(v,k){
			if(k.includes('col_')&&!k.includes('_id')){
				var cellId = editRow[k+'_id'],
				columnId = k.replace('col_',''),
				columnObj = $scope.doc_data_workdata.elementsMap[columnId]
				console.log(columnObj)
				console.log(columnObj.doctype)
				if(cellId){//UPDATE value
					switch (columnObj.doctype) {
					case 22:
						sql += "UPDATE string SET value = '" + v +"' " +" WHERE string_id = "+cellId + ";\n "
						break;
					case 23:
						sql += "UPDATE integer SET value = " + v +" " +" WHERE integer_id = "+cellId + ";\n "
						break;
					}
				}else{//INSERT cell & value
					sql += sql_1c.insertCell(editRow.row_id, columnId, i)
					switch (columnObj.doctype) {
					case 22:
						sql += "INSERT INTO string (value, string_id) VALUES ('"+v+"',:nextDbId" +i +" );\n"
						break;
					case 23:
						sql += "INSERT INTO integer (value, integer_id) VALUES ("+v+",:nextDbId" +i +" );\n"
						break;
					}
					i++
				}
			}
		})
		if(sql){
			if(isInsertRow){
				sql = "INSERT INTO doc (doctype, doc_id, parent, reference) " +
				"VALUES (4, :nextDbId1, " + $scope.edit_table.table_data_id
				+ ", " +$scope.request.parameters.tableId+");\n" +
				sql
			}
			sql += sql_1c.select_row($scope.table.join_select, editRow.row_id)
			/*
			 */
			console.log(sql)
			writeSql({sql : sql,
				dataAfterSave:function(response){
					if(response.data.sql.indexOf('(4')>0){
						angular.forEach(response.data, function(v,k){
							if(k.indexOf('list')==0){
								console.log(v[0])
								$scope.table_data.list.splice(0,0,v[0])
			}	})	}	}	})
		}
	}
	$scope.edit_table.trashRow = function(tr){
		console.log(tr)
		var sql = "DELETE FROM doc WHERE parent="+tr.row_id+";\n"
		sql += "DELETE FROM doc WHERE doc_id="+tr.row_id+";\n"
		console.log(sql)
		writeSql({sql : sql,
			dataAfterSave:function(response){
				console.log(response.data)
				console.log(response.data.update_0+response.data.update_1)
				console.log(0<(response.data.update_0+response.data.update_1))
				if(0<(response.data.update_0+response.data.update_1)){
					console.log(response.data)
					$scope.table_data.list.splice($scope.table_data.list.indexOf(tr),1)
				}
			}
		})
	}
	$scope.edit_table.minusRow = function(tr){
		this.editRow = tr
		this.editRow.toTrash = true
	}
	$scope.edit_table.editRow = function(tr){
		console.log(tr)
		this.editRow = tr
		this.ngStyleModal = {display:'block'}
	}
	$scope.edit_table.addRow = function(){
		this.ngStyleModal = {display:'block'}
		this.editRow = {}
	}
	$scope.edit_table.keyUp = function($event){
		console.log($event.key)
	}
	
	$scope.create_tables = {}
	$scope.create_tables.col_keys = {}
	$scope.create_tables.col_keys.doc_id='ІН',
//	$scope.create_tables.col_keys.tablename='Таблиця',
	$scope.create_tables.col_keys.value='Колонка',
	$scope.create_tables.col_keys.doctype='Тип даних'

	var build_sql_table_read = $interval(function () {
		if(Object.keys($scope.doc_data_workdata.elementsMap).length>0){
			if($scope.doc_data_workdata.elementsMap[$scope.request.parameters.tableId]){
				$interval.cancel(build_sql_table_read)
				$scope.table = $scope.doc_data_workdata.elementsMap[$scope.request.parameters.tableId]
				//console.log($scope.table)
				$scope.table.row_columns = 'r.doc_id row_id'
				$scope.table.join_select = 'FROM doc r'
				angular.forEach($scope.table.children, function(v,k){
					var columnId = v.doc_id,
					columnObj = $scope.doc_data_workdata.elementsMap[columnId],
					columnType = 
						columnObj.doctype==22?'string':
							(columnObj.doctype==23?'integer':''),
					row_columns = ', col_'+columnId+', col_'+columnId+'_id',
					cell_columns = 'value col_'+columnId+', doc_id col_'+columnId+'_id'
					v.row_columns = row_columns
					$scope.table.row_columns += row_columns
					//console.log(row_columns)
					v.cell_select = "SELECT "+cell_columns+", parent FROM doc," +columnType +
							" WHERE reference="+columnId+" AND " +columnType+"_id=doc_id"
					$scope.table.join_select += "\n LEFT JOIN " +
					"(" +v.cell_select +") c" +columnId+" ON c" +columnId+".parent=r.doc_id"
					//console.log(v.cell_select)
					//console.log(v)
				})
				console.log($scope.doc_data_workdata.elementsMap)
				//console.log($scope.table.row_columns)
				$scope.table.join_select = "SELECT "+$scope.table.row_columns+" "+$scope.table.join_select
				+" WHERE r.parent="+$scope.edit_table.table_data_id
				+" AND r.reference="+$scope.request.parameters.tableId
				console.log($scope.table.join_select)
				$scope.table_data = readSql({
					sql:$scope.table.join_select,
				})
				//console.log($scope.table_data)
			}
		}
	}, 250);

	readSql({
		sql:sql_1c.read_doc_table_data_id($scope.request.parameters.jsonId),
		afterRead:function(response){
			$scope.edit_table.table_data_id = response.data.list[0].doc_id
		},
	})

	console.log($scope.create_tables)
}
sql_1c.read_doc_table_data_id = function(doc_id){
	return "SELECT * FROM doc where :doc_id in (doc_id,parent) and doctype=47".replace(':doc_id',doc_id)
}
