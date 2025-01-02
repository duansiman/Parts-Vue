import request from '@/utils/request'

// 查询部件类型显示属性配置列表
export function listCategoryAttributeShowList(query) {
  return request({
    url: '/public/parts/categoryAttributeShowList/list',
    method: 'get',
    params: query
  })
}

export function showCategoryAttribute(query) {
  return request({
    url: '/parts/categoryAttributeShowList/show',
    method: 'get',
    params: query
  })
}

// 查询部件类型显示属性配置详细
export function getCategoryAttributeShowList(id) {
  return request({
    url: '/parts/categoryAttributeShowList/' + id,
    method: 'get'
  })
}

// 新增部件类型显示属性配置
export function addCategoryAttributeShowList(data) {
  return request({
    url: '/parts/categoryAttributeShowList',
    method: 'post',
    data: data
  })
}

// 修改部件类型显示属性配置
export function updateCategoryAttributeShowList(data) {
  return request({
    url: '/parts/categoryAttributeShowList',
    method: 'put',
    data: data
  })
}

// 删除部件类型显示属性配置
export function delCategoryAttributeShowList(id) {
  return request({
    url: '/parts/categoryAttributeShowList/' + id,
    method: 'delete'
  })
}
