import request from '@/utils/request'

// 查询部件属性数据列表
export function listAttributeData(query) {
  return request({
    url: '/parts/attributeData/list',
    method: 'get',
    params: query
  })
}

// 查询部件属性数据详细
export function getAttributeData(id) {
  return request({
    url: '/parts/attributeData/' + id,
    method: 'get'
  })
}

// 新增部件属性数据
export function addAttributeData(data) {
  return request({
    url: '/parts/attributeData',
    method: 'post',
    data: data
  })
}

// 修改部件属性数据
export function updateAttributeData(data) {
  return request({
    url: '/parts/attributeData',
    method: 'put',
    data: data
  })
}

// 删除部件属性数据
export function delAttributeData(id) {
  return request({
    url: '/parts/attributeData/' + id,
    method: 'delete'
  })
}
