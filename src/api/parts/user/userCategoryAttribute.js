import request from '@/utils/request'

// 查询部件类型的属性信息列表
export function listCategoryAttribute(query) {
  return request({
    url: '/public/parts/categoryAttribute/list',
    method: 'get',
    params: query
  })
}

export function listUserCategoryAttribute(query) {
  return request({
    url: '/public/parts/categoryAttribute/user/list',
    method: 'get',
    params: query
  })
}

// 查询部件类型的属性信息详细
export function getCategoryAttribute(id) {
  return request({
    url: '/public/parts/categoryAttribute/' + id,
    method: 'get'
  })
}

// 新增部件类型的属性信息
export function addCategoryAttribute(data) {
  return request({
    url: '/public/parts/categoryAttribute',
    method: 'post',
    data: data
  })
}

// 修改部件类型的属性信息
export function updateCategoryAttribute(data) {
  return request({
    url: '/public/parts/categoryAttribute',
    method: 'put',
    data: data
  })
}

// 删除部件类型的属性信息
export function delCategoryAttribute(id) {
  return request({
    url: '/public/parts/categoryAttribute/' + id,
    method: 'delete'
  })
} 