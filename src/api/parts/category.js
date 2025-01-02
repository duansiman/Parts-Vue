import request from '@/utils/request'

// 查询部件类型信息列表
export function listCategory(query) {
  return request({
    url: '/public/parts/category/list',
    method: 'get',
    params: query
  })
}

// 查询部件类型信息详细
export function getCategory(id) {
  return request({
    url: '/parts/category/' + id,
    method: 'get'
  })
}

// 新增部件类型信息
export function addCategory(data) {
  return request({
    url: '/parts/category',
    method: 'post',
    data: data
  })
}

// 修改部件类型信息
export function updateCategory(data) {
  return request({
    url: '/parts/category',
    method: 'put',
    data: data
  })
}

// 删除部件类型信息
export function delCategory(id) {
  return request({
    url: '/parts/category/' + id,
    method: 'delete'
  })
}
