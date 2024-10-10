import request from '@/utils/request'

// 查询部件公司信息列表
export function listCompany(query) {
  return request({
    url: '/parts/company/list',
    method: 'get',
    params: query
  })
}

// 查询部件公司信息详细
export function getCompany(id) {
  return request({
    url: '/parts/company/' + id,
    method: 'get'
  })
}

// 新增部件公司信息
export function addCompany(data) {
  return request({
    url: '/parts/company',
    method: 'post',
    data: data
  })
}

// 修改部件公司信息
export function updateCompany(data) {
  return request({
    url: '/parts/company',
    method: 'put',
    data: data
  })
}

// 删除部件公司信息
export function delCompany(id) {
  return request({
    url: '/parts/company/' + id,
    method: 'delete'
  })
}
