import request from '@/utils/request'

// 查询部件属性信息列表
export function listAttribute(query) {
  return request({
    url: '/parts/attribute/list',
    method: 'get',
    params: query
  })
}

export function listAttributeV2(query) {
  return request({
    url: '/parts/attribute/listV2',
    method: 'get',
    params: query
  })
}

// 查询部件属性信息详细
export function getAttribute(id) {
  return request({
    url: '/parts/attribute/' + id,
    method: 'get'
  })
}

// 新增部件属性信息
export function addAttribute(data) {
  return request({
    url: '/parts/attribute',
    method: 'post',
    data: data
  })
}

// 修改部件属性信息
export function updateAttribute(data) {
  return request({
    url: '/parts/attribute',
    method: 'put',
    data: data
  })
}

// 删除部件属性信息
export function delAttribute(id) {
  return request({
    url: '/parts/attribute/' + id,
    method: 'delete'
  })
}
