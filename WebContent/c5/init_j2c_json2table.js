var init_j2c_json2table = function($scope, $http, $filter, $interval){
	console.log('-------init_j2c_json2table-------')
	$scope.pageVar.config.tab2 = 'table_structur_sql'
	$scope.pageVar.config.tab2s = [
		{tab2:'table_structur_sql',fa:'wrench',},
		{tab2:'table_data_sql',fa:'th-list',},
	]
//	console.log($scope.pageVar.config)
	$scope.edit_table = {}
	$scope.edit_table.saveSqlReadData = function(){
		var sqlSelect = "SELECT doc_id FROM doc  WHERE doctype=19 " +
		" AND parent=" + $scope.request.parameters.jsonId +
		" AND reference = " + $scope.request.parameters.tableId + ""
		var sql = "UPDATE docbody SET docbody = :select_table_data " +
		" WHERE docbody_id IN (" + sqlSelect + ")"
		console.log(sql)
		writeSql({ sql : sql,
			select_table_data : $scope.table.join_select,
			dataAfterSave : function(response){
				console.log(response.data)
			},
		})
	}

	$scope.edit_table.view_57482 = function(tr){
		return tr.col_57486+" - "+tr.col_57487
	}
	$scope.edit_table.view_57483 = function(tr){
		return tr.col_57488+" - "+tr.col_57489
	}
	$scope.edit_table.saveEditRow = function(){
		this.editRow.row_id = this.editRow['row_'+$scope.request.parameters.tableId+'_id']
		//console.log(this)
		//console.log(this.editRow)
		if(this.editRow.row_id){
			saveRow(this.editRow)
		}else{//INSERT row
			saveRow(this.editRow, true)
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
	var saveRow = function(editRow, isInsertRow){
		var sql = '', i = 2
		console.log(editRow)
		var tableEl = $scope.doc_data_workdata.elementsMap[$scope.request.parameters.tableId]
		//console.log(tableEl)
		angular.forEach(tableEl.children, function(vt,k){
//			console.log(vt)
			var columnId = vt.doc_id,
			columnObj = $scope.doc_data_workdata.elementsMap[columnId]
			v = editRow['col_'+columnId]
			cellId = editRow['col_'+columnId+'_id']
//			console.log(columnObj)
//			console.log(columnId+'/'+v+'/'+cellId)
			var reference2 = editRow['row_'+columnId+'_id']
//			console.log(reference2)
			if(cellId){//UPDATE value
				switch (columnObj.doctype) {
				case 27:
					if(reference2)
					sql += "UPDATE doc SET reference2 = " + reference2 +" " +" WHERE doc_id = "+cellId + ";\n "
					break;
				case 57:
					sql += "UPDATE doc SET reference = " + editRow['ref2_'+columnId] +" " +" WHERE doc_id = "+cellId + ";\n "
					break;
				case 22:
					sql += "UPDATE string SET value = '" + v +"' " +" WHERE string_id = "+cellId + ";\n "
					break;
				case 23:
					sql += "UPDATE integer SET value = " + v +" " +" WHERE integer_id = "+cellId + ";\n "
					break;
				}
			}else{//INSERT cell & value
				switch (columnObj.doctype) {
				case 27:
					if(reference2){
						sql += sql_1c.insertCell(editRow.row_id, columnId, i)
						sql += "UPDATE doc SET reference2 = " + v +" " +" WHERE doc_id = :nextDbId"+i + " ;\n "
					}
					break;
				case 57:
					sql += sql_1c.insertCell(editRow.row_id, columnId, i)
					sql += "UPDATE doc SET reference2 = " + editRow['ref2_'+columnId] +" WHERE doc_id = :nextDbId"+i + " ;\n "
//					sql += "UPDATE doc SET reference2 = :nextDbId"+i +" WHERE doc_id = :nextDbId"+i + " ;\n "
//					sql += "INSERT INTO inn (inn, inn_id) VALUES ('"+v+"',:nextDbId"+i +" );\n"
					break;
				case 22:
					sql += sql_1c.insertCell(editRow.row_id, columnId, i)
					sql += "INSERT INTO string (value, string_id) VALUES ('"+v+"',:nextDbId" +i +" );\n"
					break;
				case 23:
					sql += sql_1c.insertCell(editRow.row_id, columnId, i)
					sql += "INSERT INTO integer (value, integer_id) VALUES ("+v+",:nextDbId" +i +" );\n"
					break;
				}
				i++
			}
		})
		if(sql){
			if(isInsertRow){
				sql = "INSERT INTO doc (doctype, doc_id, parent, reference) " +
				"VALUES (4, :nextDbId1, " + $scope.edit_table.table_data_id
				+ ", " +$scope.request.parameters.tableId+");\n" +
				sql
			}
			/*
			sql += sql_1c.select_row($scope.table.join_select, editRow.row_id)
			console.log(sql)
			 */
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
		var row_id = tr['row_'+$scope.request.parameters.tableId+'_id']
		var sql = "DELETE FROM doc WHERE parent="+row_id+";\n"
		sql += "DELETE FROM doc WHERE doc_id="+row_id+";\n"
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
	$scope.edit_table.addRow = function(){
		this.editRow = {}
		initEditRow()
		this.ngStyleModal = {display:'block'}
	}
	$scope.edit_table.editRow = function(tr){
		console.log(tr)
		this.editRow = tr
		initEditRow()
		this.ngStyleModal = {display:'block'}
	}
	function initEditRow(){
		if(!$scope.edit_table.ddListener)
			$scope.edit_table.ddListener = {}
		console.log($scope.edit_table.datadictionary_sql)
		angular.forEach($scope.edit_table.datadictionary_sql, function(v){
			console.log(v)
		})
	}
	$scope.edit_table.ddUpdateINN = function(tr){
		this.editRow['ref2_'+this.focus_col_id] = tr.inn_id
		this.editRow['col_'+this.focus_col_id] = tr.inn
	}
	$scope.edit_table.ddUpdateCell = function(tr){
		console.log(tr)
		console.log(this.editRow)
		console.log(this.focus_col_id)
		var rowId = 'row_'+this.focus_col_id+'_id'
		if(!this.editRow[rowId]){
			//insert new
		}
		this.editRow[rowId] = tr[rowId]
		this.editRow['col_'+this.focus_col_id] = tr[rowId]
	}
	$scope.edit_table.closeEditRow = function(){
		this.ngStyleModal = {display:'none'}
		angular.forEach($scope.edit_table.ddListener, function(v){
			v()//closeWatch
		})
	}
	$scope.edit_table.onFocus27 = function(col_id){
		console.log(col_id)
		console.log(this.datadictionary_sql)
		this.focus_col_id = col_id
//		console.log($scope.doc_data_workdata.elementsMap[$scope.edit_table.focus_col_id])
		var dd_sql = this.datadictionary_sql[col_id]
		console.log(dd_sql)
		if(!this.dd_list)
			this.dd_list = {}
		console.log(this.dd_list)
		this.dd_list[col_id] = readSql({
			sql:dd_sql,
		})
		if(!$scope.edit_table.ddListener['l_'+col_id]){
			var tableObj = $scope.doc_data_workdata.elementsMap[col_id]
			console.log(tableObj)
			var seekLike = ''
			if(57==tableObj.doctype){
				seekLike += " LOWER(inn) LIKE LOWER(:seek)"
			}else{
				angular.forEach(tableObj.children, function(v){
					console.log(v)
					if(seekLike.length>0) seekLike += " OR "
						seekLike += " LOWER(col_" +v.doc_id +") LIKE LOWER(:seek)"
				})
			}
			var dd_seek_sql = "SELECT * FROM (" +dd_sql +") WHERE "+seekLike
			console.log(dd_seek_sql)
			$scope.edit_table.ddListener['l_'+col_id] = 
				$scope.$watch('edit_table.editRow.seek_col_'+col_id, function(newValue){
				if(newValue&&newValue.length>0){
					console.log(newValue)
					$scope.edit_table.dd_list[col_id] = readSql({
						sql:dd_seek_sql,
						seek:'%'+newValue+'%',
					})
				}else{
					$scope.edit_table.dd_list[col_id] = readSql({
						sql:dd_sql+" LIMIT 55",
					})
				}})
		}
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

	var getLeftJoinCellSelect = function (cell_select, columnId) {
		return "\n LEFT JOIN " + "(" + cell_select +") c" +columnId+" ON c" +columnId+".parent=r.doc_id"
	}

	var build_sql_table_read = $interval(function () {
		if(Object.keys($scope.doc_data_workdata.elementsMap).length>0){
			if($scope.doc_data_workdata.elementsMap[$scope.request.parameters.tableId]){
				$interval.cancel(build_sql_table_read)
				$scope.table = $scope.doc_data_workdata.elementsMap[$scope.request.parameters.tableId]
				//console.log($scope.table)
				$scope.table.row_columns = "r.doc_id row_" + $scope.request.parameters.tableId + "_id"
				$scope.table.join_select = 'FROM doc r'
				if(!$scope.edit_table.datadictionary_sql)
					$scope.edit_table.datadictionary_sql = {}
				var list27 = []
				angular.forEach($scope.table.children, function(v,k){
					var columnId = v.doc_id
//					console.log(v.doctype)
					console.log(v)
					if(27==v.doctype){
						list27.push(v.doc_id)
					}else if(57==v.doctype){//INN
						$scope.edit_table.datadictionary_sql[columnId] = "SELECT * FROM inn"
						var columnObj = $scope.doc_data_workdata.elementsMap[columnId],
//						row_columns = ', col_'+columnId+', col_'+columnId+'_id',
							row_columns = ', c'+columnId+'.* ',
							cell_columns = 'inn col_'+columnId+', doc_id col_'+columnId+"_id, " +
							"reference2 ref2_"+columnId
						v.row_columns = row_columns
						$scope.table.row_columns += row_columns
						//console.log(row_columns)
						v.cell_select = "SELECT "+cell_columns+", parent FROM doc, inn " +
						" WHERE reference="+columnId+" AND inn_id=reference2 \n "
						$scope.table.join_select += getLeftJoinCellSelect(v.cell_select, columnId)
					}else{
						var columnObj = $scope.doc_data_workdata.elementsMap[columnId],
						columnType = 
							columnObj.doctype==22?'string':
							(columnObj.doctype==23?'integer':''),
						row_columns = ', col_'+columnId+', col_'+columnId+'_id',
						cell_columns = 'value col_'+columnId+', doc_id col_'+columnId+'_id'
						v.row_columns = row_columns
						$scope.table.row_columns += row_columns
						//console.log(row_columns)
						v.cell_select = "SELECT "+cell_columns+", parent FROM doc, " +columnType +
						" WHERE reference="+columnId+" AND " +columnType+"_id=doc_id\n "
						$scope.table.join_select += getLeftJoinCellSelect(v.cell_select, columnId)
					}
					//console.log(v.cell_select)
					//console.log(v)
				})
				console.log(list27.toString())
//				console.log($scope.doc_data_workdata.elementsMap)
				//console.log($scope.table.row_columns)
				//console.log($scope.table_data)
				if(list27.length>0){
					var sql27 = "SELECT * FROM doc,docbody " +
					"WHERE doc_id=docbody_id AND reference IN (" +list27.toString() + ") AND doctype=19 "
					readSql({ sql:sql27,
						afterRead:function(response){
							console.log(response.data)
							angular.forEach(response.data.list, function(v){
								var columnId = v.reference
								var sql = "SELECT refCell.*, cell.doc_id col_" +columnId+"_id, cell.parent \n" +
								"FROM doc cell, (" + v.docbody +") refCell \n" +
								"WHERE cell.reference2=refCell.row_" +columnId+"_id"
								$scope.edit_table.datadictionary_sql[columnId] = v.docbody
//								console.log(sql)
//								console.log(v)
								$scope.table.row_columns += ", c"+columnId+".* "
								$scope.table.join_select += getLeftJoinCellSelect(sql, columnId)
							})
							$scope.table_data = readTableData()
						}
					})
				}else if(false){
				}else{
					$scope.table_data = readTableData()
				}
			}
		}
	}, 250);

	var readTableData = function(){
		$scope.table.join_select = "SELECT "+$scope.table.row_columns+" "+$scope.table.join_select+"\n " +
		"WHERE r.parent="+$scope.edit_table.table_data_id
		+" AND r.reference="+$scope.request.parameters.tableId
		console.log($scope.table.join_select)
		return readSql({
			sql:$scope.table.join_select + ' LIMIT 55',
		})
	}

	console.log(sql_1c.read_doc_table_data_id($scope.request.parameters.jsonId))
	readSql({
		sql:sql_1c.read_doc_table_data_id($scope.request.parameters.jsonId),
		afterRead:function(response){
			if(response.data.list[0]){
				$scope.edit_table.table_data_id = response.data.list[0].doc_id
			}else{
				console.log(response.data)
			}
		},
	})

//	console.log($scope.create_tables)
}
sql_1c.read_doc_table_data_id = function(doc_id){
	return "SELECT * FROM doc where :doc_id in (doc_id,parent) and doctype=47".replace(':doc_id',doc_id)
}
